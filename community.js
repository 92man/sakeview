// ===== Community Functions =====
// 의존: supabaseClient, _displayNameMap, loadDisplayNames(), currentUser,
//        communityLastTab, renderNoteDetail(), switchTab() (app.js)
//        escapeHtml, escapeAttr, extractTastingTags, getTimeAgo,
//        getTransformedPhotoUrl, imgTransformFallback (utils.js)
//        loadApprovedCerts, getCertBadgeHtml (certification.js)
//        generateStaticWheelSvg (flavor_wheel.js)
//        SAKE_DATABASE (sake_database.js)

var communitySearchTimeout = null;

// Lazy wheel rendering via IntersectionObserver
var _wheelObserver = null;
function observeWheels(container) {
    if (!_wheelObserver) {
        _wheelObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var flavor = el.getAttribute('data-flavor');
                    if (flavor && typeof generateStaticWheelSvg === 'function') {
                        var svgHtml = generateStaticWheelSvg(flavor, 'mini');
                        if (svgHtml) el.outerHTML = svgHtml;
                    }
                    _wheelObserver.unobserve(el);
                }
            });
        }, { rootMargin: '200px' });
    }
    var placeholders = container.querySelectorAll('.static-wheel-mini[data-flavor]');
    placeholders.forEach(function(el) { _wheelObserver.observe(el); });
}

async function loadCommunityStats() {
    try {
        const notesResult = await supabaseClient.from('tasting_notes').select('id', { count: 'exact', head: true });
        const totalNotes = notesResult.count;

        let sakeCount = 0;
        if (typeof SAKE_DATABASE !== 'undefined') {
            Object.values(SAKE_DATABASE).forEach(b => { sakeCount += b.products.length; });
        }

        const el = (id) => document.getElementById(id);
        if (el('communityTotalNotes')) el('communityTotalNotes').textContent = (totalNotes || 0).toLocaleString();
        if (el('communitySakeDb')) el('communitySakeDb').textContent = sakeCount.toLocaleString();
    } catch (e) {
        console.error('Community stats error:', e);
    }
}

var _feedCache = null;
var _feedCacheTTL = 120000; // 2분

async function loadCommunityFeed() {
    const container = document.getElementById('communityFeedList');
    if (!container) return;

    const feedHeader = document.querySelector('.community-feed-header h3');
    if (feedHeader) feedHeader.textContent = 'New Tasting Notes';

    // sessionStorage 캐시 확인
    if (_feedCache && Date.now() - _feedCache.ts < _feedCacheTTL) {
        const userIds = [...new Set(_feedCache.data.map(n => n.user_id).filter(Boolean))];
        await Promise.all([loadApprovedCerts(), loadDisplayNames(userIds)]);
        displayCommunityFeed(_feedCache.data, container, buildAvgMap(_feedCache.data));
        return;
    }

    container.innerHTML = '<div class="loading">커뮤니티 노트를 불러오는 중</div>';

    try {
        const { data, error } = await supabaseClient
            .from('tasting_notes')
            .select('id, sake_name, personal_review, overall_rating, created_at, user_id, flavor_description, photo')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        _feedCache = { ts: Date.now(), data: data || [] };
        // Transform API 프로브 (최초 1회)
        if (_imageTransformEnabled === null && data && data.length > 0) {
            var probePhoto = data.find(function(n) { return n.photo; });
            if (probePhoto) probeImageTransform(probePhoto.photo);
        }
        const userIds = [...new Set((data || []).map(n => n.user_id).filter(Boolean))];
        await Promise.all([loadApprovedCerts(), loadDisplayNames(userIds)]);
        displayCommunityFeed(data || [], container, buildAvgMap(data), true);
    } catch (e) {
        console.error('Community feed error:', e);
        container.innerHTML = `<div class="community-empty">
            <div class="community-empty-icon">📡</div>
            <p>커뮤니티 노트를 불러올 수 없습니다.</p>
            <p style="font-size:0.8rem; margin-top:8px; color:#f43f5e;">${escapeHtml(e.message || JSON.stringify(e))}</p>
        </div>`;
    }
}

function buildAvgMap(notes) {
    const grouped = {};
    (notes || []).forEach(n => {
        if (n.sake_name && n.overall_rating) {
            if (!grouped[n.sake_name]) grouped[n.sake_name] = [];
            grouped[n.sake_name].push(n.overall_rating);
        }
    });
    const avgMap = {};
    Object.entries(grouped).forEach(([name, ratings]) => {
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        avgMap[name] = { avg, count: ratings.length };
    });
    return avgMap;
}

function displayCommunityFeed(notes, container, avgMap, showMore) {
    avgMap = avgMap || {};
    if (!notes || notes.length === 0) {
        container.innerHTML = `<div class="community-empty">
            <div class="community-empty-icon">🍶</div>
            <h3>아직 커뮤니티 노트가 없습니다</h3>
            <p>첫 번째 테이스팅 노트를 공유해보세요!</p>
        </div>`;
        return;
    }

    const cards = notes.map((note, idx) => {
        const uid = note.user_id || 'anon';
        const nickname = _displayNameMap[uid];
        const userLabel = nickname || ('User' + uid.substring(0, 4));
        const thumbHtml = note.photo
            ? `<div class="community-thumb"><img src="${escapeAttr(getTransformedPhotoUrl(note.photo, 96, 96))}" alt="" loading="lazy" onerror="imgTransformFallback(this)||this.parentElement.classList.add('community-thumb-default');"></div>`
            : `<div class="community-thumb community-thumb-default">🍶</div>`;
        const timeAgo = getTimeAgo(note.created_at);
        const reviewText = note.personal_review || '';
        const truncated = reviewText.length > 120 ? reviewText.substring(0, 120) + '...' : reviewText;

        // 평점: 같은 사케 노트 여러 개면 평균, 1개면 그냥 표시
        const sakeAvg = avgMap[note.sake_name];
        let ratingDisplay = '';
        if (sakeAvg && sakeAvg.count > 1) {
            const avgStr = sakeAvg.avg % 1 === 0 ? sakeAvg.avg.toFixed(0) : sakeAvg.avg.toFixed(1);
            ratingDisplay = `<span class="community-feed-card-rating">${avgStr}<span class="community-feed-card-rating-max">/100</span></span>`;
        } else if (note.overall_rating) {
            ratingDisplay = `<span class="community-feed-card-rating">${note.overall_rating}<span class="community-feed-card-rating-max">/100</span></span>`;
        }

        // 향·맛·바디감 태그만 추출
        var allTags = extractTastingTags(note.flavor_description, ['aroma', 'taste', 'body']);
        var allTagsHtml = allTags.length > 0
            ? '<div class="community-feed-card-tags">' + allTags.map(function(t) { return '<span class="community-tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>'
            : '';


        return `<div class="community-feed-card" onclick="showCommunityDetail('${escapeAttr(note.id)}')">
            <div class="community-feed-card-header">
                ${thumbHtml}
                <div class="community-feed-card-info">
                    <div class="community-feed-card-name">${escapeHtml(note.sake_name || '이름 없음')}${getCertBadgeHtml(uid)}</div>
                    <div class="community-feed-card-meta">Shared by <span class="community-feed-author" data-tooltip="${escapeAttr(userLabel)} 님의 노트만 보기" onclick="event.stopPropagation(); loadNotesByUser('${escapeAttr(uid)}')">${escapeHtml(userLabel)}</span> · ${timeAgo}</div>
                </div>
                ${note.flavor_description ? `<div class="static-wheel-mini" data-flavor="${escapeAttr(note.flavor_description)}"></div>` : ''}
                ${ratingDisplay}
            </div>
            ${allTagsHtml}
            ${truncated ? `<div class="community-feed-card-text">${escapeHtml(truncated)}</div>` : ''}
        </div>`;
    });

    let html = cards.join('');
    if (showMore && notes.length >= 10) {
        html += `<button class="community-feed-more-btn" onclick="loadMoreCommunityFeed(${notes.length})">더보기</button>`;
    }
    container.innerHTML = html;
    observeWheels(container);
}

async function loadMoreCommunityFeed(offset) {
    const btn = document.querySelector('.community-feed-more-btn');
    if (btn) btn.textContent = '불러오는 중...';
    try {
        const { data, error } = await supabaseClient
            .from('tasting_notes')
            .select('id, sake_name, personal_review, overall_rating, created_at, user_id, flavor_description, photo')
            .order('created_at', { ascending: false })
            .range(offset, offset + 19);
        if (error) throw error;
        if (!data || data.length === 0) { if (btn) btn.remove(); return; }
        const userIds = [...new Set(data.map(n => n.user_id).filter(Boolean))];
        await Promise.all([loadApprovedCerts(), loadDisplayNames(userIds)]);
        const container = document.getElementById('communityFeedList');
        if (btn) btn.remove();
        const avgMap = buildAvgMap(data);
        const tempDiv = document.createElement('div');
        displayCommunityFeed(data, tempDiv, avgMap, false);
        container.insertAdjacentHTML('beforeend', tempDiv.innerHTML);
        observeWheels(container);
        if (data.length >= 20) {
            container.insertAdjacentHTML('beforeend',
                `<button class="community-feed-more-btn" onclick="loadMoreCommunityFeed(${offset + data.length})">더보기</button>`);
        }
    } catch (e) {
        console.error('Load more error:', e);
        if (btn) btn.textContent = '더보기';
    }
}

function searchCommunityNotes(query) {
    clearTimeout(communitySearchTimeout);
    const resultsEl = document.getElementById('communitySearchResults');
    if (!resultsEl) return;

    if (!query || query.length < 2) {
        resultsEl.innerHTML = '';
        return;
    }

    communitySearchTimeout = setTimeout(() => {
        const q = query.toLowerCase();
        const matches = [];

        if (typeof SAKE_DATABASE !== 'undefined') {
            Object.entries(SAKE_DATABASE).forEach(([brand, data]) => {
                data.products.forEach(p => {
                    const name = p.name || '';
                    const jp = p.japanese || '';
                    if (name.toLowerCase().includes(q) || jp.toLowerCase().includes(q) || brand.toLowerCase().includes(q)) {
                        matches.push({ name: name, brand: brand, japanese: jp });
                    }
                });
            });
        }

        if (matches.length === 0) {
            resultsEl.innerHTML = `<div style="padding:12px; color:#94a3b8; font-size:0.85rem; text-align:center;">검색 결과가 없습니다</div>`;
            return;
        }

        resultsEl.innerHTML = matches.slice(0, 8).map(m =>
            `<div class="community-search-item" onclick="loadNotesBySakeName('${escapeAttr(m.name)}')">
                <strong>${escapeHtml(m.name)}</strong>
                <span style="font-size:0.75rem; color:#94a3b8; margin-left:8px;">${escapeHtml(m.brand)}</span>
            </div>`
        ).join('');
    }, 300);
}

async function loadNotesBySakeName(sakeName) {
    const container = document.getElementById('communityFeedList');
    const resultsEl = document.getElementById('communitySearchResults');
    if (resultsEl) resultsEl.innerHTML = '';
    if (!container) return;

    container.innerHTML = '<div class="loading">노트를 검색하는 중</div>';

    const feedHeader = document.querySelector('.community-feed-header h3');
    if (feedHeader) feedHeader.textContent = `"${sakeName}" 테이스팅 노트`;

    try {
        const { data, error } = await supabaseClient
            .from('tasting_notes')
            .select('id, sake_name, personal_review, overall_rating, created_at, user_id, flavor_description, photo')
            .ilike('sake_name', `%${sakeName.replace(/[%_]/g, '')}%`)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        const userIds = [...new Set((data || []).map(n => n.user_id).filter(Boolean))];
        await loadDisplayNames(userIds);
        displayCommunityFeed(data || [], container, buildAvgMap(data));
    } catch (e) {
        container.innerHTML = `<div class="community-empty"><p>검색 결과를 불러올 수 없습니다.</p></div>`;
    }
}

async function loadNotesByUser(userId) {
    const container = document.getElementById('communityFeedList');
    if (!container) return;
    container.innerHTML = '<div class="loading">노트를 불러오는 중</div>';

    const nickname = _displayNameMap[userId] || ('User' + userId.substring(0, 4));
    const feedHeader = document.querySelector('.community-feed-header h3');
    if (feedHeader) feedHeader.innerHTML = `<span class="community-feed-back-btn" onclick="loadCommunityFeed()">← 전체 보기</span> ${escapeHtml(nickname)} 님의 테이스팅 노트`;

    try {
        const { data, error } = await supabaseClient
            .from('tasting_notes')
            .select('id, sake_name, personal_review, overall_rating, created_at, user_id, flavor_description, photo')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        const notes = data || [];
        const userIds = [...new Set(notes.map(n => n.user_id).filter(Boolean))];
        await loadDisplayNames(userIds);
        displayCommunityFeed(notes, container, buildAvgMap(notes));
    } catch (e) {
        console.error('loadNotesByUser error:', e);
        container.innerHTML = `<div class="community-empty"><p>노트를 불러올 수 없습니다.</p></div>`;
    }
}

async function filterCommunityByGrade(grade) {
    const container = document.getElementById('communityFeedList');
    if (!container) return;
    container.innerHTML = '<div class="loading">카테고리 필터링 중</div>';

    const feedHeader = document.querySelector('.community-feed-header h3');
    if (feedHeader) feedHeader.textContent = `${grade} 테이스팅 노트`;

    const sakeNames = [];
    if (typeof SAKE_DATABASE !== 'undefined') {
        Object.values(SAKE_DATABASE).forEach(brand => {
            brand.products.forEach(p => {
                if (p.grade && p.grade.includes(grade)) {
                    sakeNames.push(p.name);
                }
            });
        });
    }

    if (sakeNames.length === 0) {
        container.innerHTML = `<div class="community-empty"><p>해당 카테고리의 사케를 찾을 수 없습니다.</p></div>`;
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('tasting_notes')
            .select('id, sake_name, personal_review, overall_rating, created_at, user_id, flavor_description, photo')
            .in('sake_name', sakeNames.slice(0, 50))
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        const userIds = [...new Set((data || []).map(n => n.user_id).filter(Boolean))];
        await loadDisplayNames(userIds);
        displayCommunityFeed(data || [], container, buildAvgMap(data));
    } catch (e) {
        container.innerHTML = `<div class="community-empty"><p>필터 결과를 불러올 수 없습니다.</p></div>`;
    }
}

async function showCommunityDetail(id) {
    communityLastTab = 'community';
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('detailView').classList.add('active');

    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = '<div class="loading">노트를 불러오는 중</div>';

    try {
        const { data: note, error } = await supabaseClient
            .from('tasting_notes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        const uid = note.user_id || 'anon';

        // 닉네임 로드
        await loadDisplayNames([uid]);
        const nickname = _displayNameMap[uid];
        const userLabel = nickname || ('User' + uid.substring(0, 4));
        const detailThumbHtml = note.photo
            ? `<div class="community-thumb" style="width:40px;height:40px;border-radius:6px;"><img src="${escapeAttr(getTransformedPhotoUrl(note.photo, 80, 80))}" alt="" onerror="imgTransformFallback(this)" style="width:100%;height:100%;object-fit:cover;"></div>`
            : `<div class="community-thumb community-thumb-default" style="width:40px;height:40px;border-radius:6px;font-size:1.2rem;">🍶</div>`;

        // renderNoteDetail을 재사용하여 새/구 형식 모두 지원
        const isOwner = currentUser && currentUser.id === uid;
        const noteDetailHtml = renderNoteDetail(note, isOwner);

        detailContent.innerHTML = `
            <button class="back-btn" onclick="switchTab('community')" style="margin-bottom:16px;">← 커뮤니티로</button>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                ${detailThumbHtml}
                <span style="font-size:0.85rem;color:#64748b;">Shared by <span class="community-feed-author" data-tooltip="${escapeAttr(userLabel)} 님의 노트만 보기" onclick="loadNotesByUser('${escapeAttr(uid)}')">${escapeHtml(userLabel)}</span>${getCertBadgeHtml(uid)}</span>
            </div>
            ${noteDetailHtml}
        `;
    } catch (error) {
        detailContent.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon">❌</div>
            <h3>노트를 불러올 수 없습니다</h3>
            <p>${escapeHtml(error.message)}</p>
        </div>`;
    }
}
