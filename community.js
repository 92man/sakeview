// ===== Community Functions =====
// 의존: supabaseClient, _displayNameMap, loadDisplayNames(), currentUser,
//        communityLastTab, renderNoteDetail(), switchTab() (app.js)
//        escapeHtml, escapeAttr, extractTastingTags, getTimeAgo,
//        getTransformedPhotoUrl, imgTransformFallback (utils.js)
//        loadApprovedCerts, getCertBadgeHtml (certification.js)
//        generateStaticWheelSvg (flavor_wheel.js)
//        SAKE_DATABASE (sake_database.js)

var communitySearchTimeout = null;
var communitySortBy = 'date';
var communityViewMode = 'card';
var _communityAllNotes = [];

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

    // 정렬/뷰 초기화
    communitySortBy = 'date';
    communityViewMode = 'card';
    communityFilterLiked = false;
    _syncToolbarUI();

    // sessionStorage 캐시 확인
    if (_feedCache && Date.now() - _feedCache.ts < _feedCacheTTL) {
        _communityAllNotes = _feedCache.data.slice();
        // 먼저 렌더 후 백그라운드로 certs/names 보강
        _rerenderCommunityFeed(true);
        const userIds = [...new Set(_feedCache.data.map(n => n.user_id).filter(Boolean))];
        Promise.all([loadApprovedCerts(), loadDisplayNames(userIds)]).then(function() {
            _rerenderCommunityFeed(true);
        });
        return;
    }

    container.innerHTML = '<div class="loading">커뮤니티 노트를 불러오는 중</div>';

    var maxRetries = 2;
    for (var attempt = 0; attempt <= maxRetries; attempt++) {
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
            _communityAllNotes = (data || []).slice();
            // 먼저 렌더 (이름/뱃지 없이) → 백그라운드로 보강
            _rerenderCommunityFeed(true);
            const userIds = [...new Set(_communityAllNotes.map(n => n.user_id).filter(Boolean))];
            Promise.all([loadApprovedCerts(), loadDisplayNames(userIds)]).then(function() {
                _rerenderCommunityFeed(true);
            });
            break;
        } catch (e) {
            var isTimeout = e.message && e.message.indexOf('timeout') !== -1;
            if (isTimeout && attempt < maxRetries) {
                console.warn('Community feed timeout, retrying (' + (attempt + 1) + '/' + maxRetries + ')...');
                await new Promise(function(r) { setTimeout(r, 1000 * (attempt + 1)); });
                continue;
            }
            console.error('Community feed error:', e);
            container.innerHTML = `<div class="community-empty">
                <div class="community-empty-icon">📡</div>
                <p>커뮤니티 노트를 불러올 수 없습니다.</p>
                <p style="font-size:0.8rem; margin-top:8px; color:#f43f5e;">${escapeHtml(e.message || JSON.stringify(e))}</p>
            </div>`;
        }
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

// ── 정렬 / 뷰 전환 ──

function _syncToolbarUI() {
    document.querySelectorAll('.community-sort-btn').forEach(function(b) {
        if (b.classList.contains('community-like-filter-btn')) return;
        b.classList.toggle('active', !communityFilterLiked && b.dataset.sort === communitySortBy);
    });
    var likeFilterBtn = document.querySelector('.community-like-filter-btn');
    if (likeFilterBtn) {
        likeFilterBtn.classList.toggle('active', communityFilterLiked);
        likeFilterBtn.innerHTML = communityFilterLiked ? '❤️ 좋아요' : '🤍 좋아요';
    }
    document.querySelectorAll('.community-view-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.view === communityViewMode);
    });
}

function sortCommunityFeed(by) {
    communitySortBy = by;
    communityFilterLiked = false;
    _syncToolbarUI();
    _rerenderCommunityFeed(_communityAllNotes.length >= 10);
}

function setCommunityView(mode) {
    communityViewMode = mode;
    _syncToolbarUI();
    _rerenderCommunityFeed(_communityAllNotes.length >= 10);
}

function _sortNotes(notes) {
    var sorted = notes.slice();
    if (communitySortBy === 'name') {
        sorted.sort(function(a, b) { return (a.sake_name || '').localeCompare(b.sake_name || '', 'ko'); });
    } else if (communitySortBy === 'rating') {
        sorted.sort(function(a, b) { return (b.overall_rating || 0) - (a.overall_rating || 0); });
    } else {
        sorted.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
    }
    return sorted;
}

function _rerenderCommunityFeed(showMore) {
    var container = document.getElementById('communityFeedList');
    if (!container) return;
    var sorted = _sortNotes(_communityAllNotes);
    var avgMap = buildAvgMap(sorted);
    if (communityViewMode === 'compact') {
        _displayCompactFeed(sorted, container, avgMap, showMore);
    } else {
        displayCommunityFeed(sorted, container, avgMap, showMore);
    }
}

function _displayCompactFeed(notes, container, avgMap, showMore) {
    if (!notes || notes.length === 0) {
        container.innerHTML = '<div class="community-empty"><div class="community-empty-icon">🍶</div><h3>아직 커뮤니티 노트가 없습니다</h3></div>';
        return;
    }
    var compactWheelJobs = [];
    var rows = notes.map(function(note, idx) {
        var uid = note.user_id || 'anon';
        var nickname = _displayNameMap[uid];
        var userLabel = nickname || ('User' + uid.substring(0, 4));
        var dateStr = '';
        if (note.created_at) {
            var d = new Date(note.created_at);
            dateStr = (d.getMonth() + 1) + '.' + d.getDate();
        }
        var tags = extractTastingTags(note.flavor_description, ['aroma', 'taste', 'body']);
        var tagsHtml = tags.slice(0, 3).map(function(t) {
            return '<span class="community-compact-tag">' + escapeHtml(t) + '</span>';
        }).join('');
        var ratingHtml = note.overall_rating
            ? '<span class="community-compact-rating">' + note.overall_rating + '<span class="community-compact-rating-max">/100</span></span>'
            : '';
        var cwId = 'cw-ph-' + idx;
        if (note.flavor_description) {
            compactWheelJobs.push({ id: cwId, flavor: note.flavor_description });
        }
        var wheelHtml = '<div class="community-compact-wheel" id="' + cwId + '"></div>';

        return '<div class="community-compact-item" onclick="showCommunityDetail(\'' + escapeAttr(note.id) + '\')">'
            + '<span class="community-compact-date">' + escapeHtml(dateStr) + '</span>'
            + '<span class="community-compact-name">' + escapeHtml(note.sake_name || '이름 없음') + getCertBadgeHtml(uid) + '</span>'
            + '<span class="community-compact-author">' + escapeHtml(userLabel) + '</span>'
            + '<span class="community-compact-tags">' + tagsHtml + '</span>'
            + wheelHtml
            + ratingHtml
            + '</div>';
    });

    var html = '<div class="community-compact-list">' + rows.join('') + '</div>';
    if (showMore) {
        html += '<button class="community-feed-more-btn" onclick="loadMoreCommunityFeed(' + _communityAllNotes.length + ')">더보기</button>';
    }
    container.innerHTML = html;

    if (compactWheelJobs.length > 0) {
        requestAnimationFrame(function() {
            compactWheelJobs.forEach(function(job) {
                var el = document.getElementById(job.id);
                if (el) {
                    var svg = generateStaticWheelSvg(job.flavor, 'mini');
                    if (svg) el.innerHTML = svg;
                }
            });
        });
    }
}

// ── 이벤트 바인딩 ──
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.community-sort-btn:not(.community-like-filter-btn)').forEach(function(btn) {
        btn.addEventListener('click', function() { sortCommunityFeed(this.dataset.sort); });
    });
    document.querySelectorAll('.community-view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { setCommunityView(this.dataset.view); });
    });
});

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

    // 휠 데이터를 모아두고 카드는 placeholder로 먼저 렌더
    const wheelJobs = [];

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

        // 평점: 각 노트의 개별 평점 표시
        let ratingDisplay = '';
        if (note.overall_rating) {
            ratingDisplay = `<span class="community-feed-card-rating">${note.overall_rating}<span class="community-feed-card-rating-max">/100</span></span>`;
        }

        // 향·맛·바디감 태그만 추출
        var allTags = extractTastingTags(note.flavor_description, ['aroma', 'taste', 'body']);
        var allTagsHtml = allTags.length > 0
            ? '<div class="community-feed-card-tags">' + allTags.map(function(t) { return '<span class="community-tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>'
            : '';

        // 휠은 placeholder로 두고 나중에 채움
        const wheelId = 'wheel-ph-' + idx;
        if (note.flavor_description) {
            wheelJobs.push({ idx: idx, id: wheelId, flavor: note.flavor_description });
        }

        return `<div class="community-feed-card" onclick="showCommunityDetail('${escapeAttr(note.id)}')">
            <div class="community-feed-card-header">
                ${thumbHtml}
                <div class="community-feed-card-info">
                    <div class="community-feed-card-name">${escapeHtml(note.sake_name || '이름 없음')}${getCertBadgeHtml(uid)}</div>
                    <div class="community-feed-card-meta">Shared by <span class="community-feed-author" data-tooltip="${escapeAttr(userLabel)} 님의 노트만 보기" onclick="event.stopPropagation(); loadNotesByUser('${escapeAttr(uid)}')">${escapeHtml(userLabel)}</span> · ${timeAgo}</div>
                </div>
                ${ratingDisplay}
                <div id="${wheelId}"></div>
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

    // 카드 렌더 후 휠 SVG를 비동기로 삽입
    if (wheelJobs.length > 0) {
        requestAnimationFrame(function() {
            wheelJobs.forEach(function(job) {
                var el = document.getElementById(job.id);
                if (el) {
                    var svg = generateStaticWheelSvg(job.flavor, 'mini');
                    if (svg) el.outerHTML = svg;
                }
            });
        });
    }
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
        // 누적
        _communityAllNotes = _communityAllNotes.concat(data);
        const userIds = [...new Set(data.map(n => n.user_id).filter(Boolean))];
        await Promise.all([loadApprovedCerts(), loadDisplayNames(userIds)]);
        _rerenderCommunityFeed(data.length >= 20);
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
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                ${detailThumbHtml}
                <span style="font-size:0.85rem;color:#64748b;">Shared by <span class="community-feed-author" data-tooltip="${escapeAttr(userLabel)} 님의 노트만 보기" onclick="loadNotesByUser('${escapeAttr(uid)}')">${escapeHtml(userLabel)}</span>${getCertBadgeHtml(uid)}</span>
            </div>
            ${noteDetailHtml}
        `;

        // Populate actions row with back button and like button
        var actionsRow = detailContent.querySelector('.note-detail-actions');
        if (actionsRow) {
            var noteId = actionsRow.dataset.noteId;
            var liked = isNoteLiked(noteId);
            actionsRow.innerHTML = '<button class="back-btn community-back-btn" onclick="switchTab(\'community\')">← 커뮤니티로</button>'
                + '<button class="note-like-btn ' + (liked ? 'liked' : '') + '" onclick="event.stopPropagation(); toggleNoteLike(\'' + escapeAttr(noteId) + '\', this)">'
                + (liked ? '❤️ 좋아요' : '🤍 좋아요') + '</button>';
        }
    } catch (error) {
        detailContent.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon">❌</div>
            <h3>노트를 불러올 수 없습니다</h3>
            <p>${escapeHtml(error.message)}</p>
        </div>`;
    }
}

// ── 좋아요 (Like) 기능 ──

var communityFilterLiked = false;

function getLikedNotes() {
    try { return JSON.parse(localStorage.getItem('sakeview_liked_notes') || '[]'); }
    catch(e) { return []; }
}

function isNoteLiked(noteId) {
    return getLikedNotes().indexOf(noteId) >= 0;
}

function toggleNoteLike(noteId, btnEl) {
    var liked = getLikedNotes();
    var idx = liked.indexOf(noteId);
    if (idx >= 0) {
        liked.splice(idx, 1);
    } else {
        liked.push(noteId);
    }
    localStorage.setItem('sakeview_liked_notes', JSON.stringify(liked));
    if (btnEl) {
        var isLiked = liked.indexOf(noteId) >= 0;
        btnEl.classList.toggle('liked', isLiked);
        btnEl.innerHTML = isLiked ? '❤️ 좋아요' : '🤍 좋아요';
    }
}

async function toggleCommunityLikeFilter() {
    communityFilterLiked = !communityFilterLiked;
    _syncToolbarUI();
    if (communityFilterLiked) {
        await loadLikedNotes();
    } else {
        _rerenderCommunityFeed(_communityAllNotes.length >= 10);
    }
}

async function loadLikedNotes() {
    var likedIds = getLikedNotes();
    var container = document.getElementById('communityFeedList');
    if (!container) return;

    if (likedIds.length === 0) {
        container.innerHTML = '<div class="community-empty"><div class="community-empty-icon">🤍</div><h3>좋아요한 노트가 없습니다</h3><p>커뮤니티 노트에서 좋아요를 눌러보세요!</p></div>';
        return;
    }

    container.innerHTML = '<div class="loading">좋아요 노트를 불러오는 중</div>';

    try {
        var result = await supabaseClient
            .from('tasting_notes')
            .select('id, sake_name, personal_review, overall_rating, created_at, user_id, flavor_description, photo')
            .in('id', likedIds)
            .order('created_at', { ascending: false });

        if (result.error) throw result.error;
        var notes = result.data || [];
        var userIds = [...new Set(notes.map(function(n) { return n.user_id; }).filter(Boolean))];
        await Promise.all([loadApprovedCerts(), loadDisplayNames(userIds)]);
        var sorted = _sortNotes(notes);
        if (communityViewMode === 'compact') {
            _displayCompactFeed(sorted, container, buildAvgMap(sorted), false);
        } else {
            displayCommunityFeed(sorted, container, buildAvgMap(sorted), false);
        }
    } catch(e) {
        console.error('Load liked notes error:', e);
        container.innerHTML = '<div class="community-empty"><p>좋아요 노트를 불러올 수 없습니다.</p></div>';
    }
}
