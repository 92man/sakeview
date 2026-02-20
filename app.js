// Age Verification & Cookie Consent
(function() {
    // 연령 확인
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
        document.getElementById('ageModal').style.display = 'flex';
    }

    // 쿠키 동의 확인
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent && ageVerified) {
        setTimeout(() => {
            document.getElementById('cookieConsent').style.display = 'block';
        }, 1500);
    }
})();

function confirmAge(isAdult) {
    if (isAdult) {
        localStorage.setItem('ageVerified', 'true');
        document.getElementById('ageModal').style.display = 'none';

        // 연령 확인 후 쿠키 동의 배너 표시
        const cookieConsent = localStorage.getItem('cookieConsent');
        if (!cookieConsent) {
            setTimeout(() => {
                document.getElementById('cookieConsent').style.display = 'block';
            }, 1000);
        }
    } else {
        alert('만 19세 미만은 이용할 수 없습니다.');
        window.location.href = 'https://www.google.com';
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieConsent').style.display = 'none';
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookieConsent').style.display = 'none';
}

// Supabase 초기화
const SUPABASE_URL = 'https://atgfrwohilgucmheyuzu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2Zyd29oaWxndWNtaGV5dXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjAyNTUsImV4cCI6MjA4NTIzNjI1NX0.CoyHTds_3BRl5p6wAehlqaevrdkqp1BzymnTnqhzy2Y';

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentPhotoData = null;
let editingNoteId = null;

// === 테이스팅 태그 시스템 ===
let tastingSelections = {}; // { "aroma": { "과일 계열": ["사과","배"], ... }, ... }
let tastingRadioSelections = {}; // { "body_무게감": "미디엄 바디", ... }
let tastingCategoryNotes = {}; // { "aroma": "추가 메모", ... }
let activeTastingCategory = 'aroma';

function initTastingUI() {
    const structure = buildTastingStructure();
    const tabsEl = document.getElementById('tastingCategoryTabs');
    const panelsEl = document.getElementById('tastingPanels');
    if (!tabsEl || !panelsEl) return;
    tabsEl.innerHTML = '';
    panelsEl.innerHTML = '';

    TASTING_CATEGORIES.forEach((cat, idx) => {
        // 탭 생성
        const tab = document.createElement('div');
        tab.className = 'tasting-cat-tab' + (idx === 0 ? ' active' : '');
        tab.dataset.catId = cat.id;
        tab.innerHTML = cat.icon + ' ' + cat.ko + '<span class="cat-badge" id="badge_' + cat.id + '">0</span>';
        tab.onclick = function() { switchTastingCategory(cat.id); };
        tabsEl.appendChild(tab);

        // 패널 생성
        const panel = document.createElement('div');
        panel.className = 'tasting-cat-panel' + (idx === 0 ? ' active' : '');
        panel.id = 'panel_' + cat.id;

        const catData = structure[cat.id];
        Object.keys(catData.subcategories).forEach(subName => {
            const sub = catData.subcategories[subName];
            const section = document.createElement('div');
            section.className = 'tasting-sub-section';

            const label = document.createElement('div');
            label.className = 'tasting-sub-label';
            label.textContent = subName;
            section.appendChild(label);

            if (sub.ui_type === '단일 선택') {
                const radioGroup = document.createElement('div');
                radioGroup.className = 'tasting-radio-group';
                const radioKey = cat.id + '_' + subName;
                sub.expressions.forEach(expr => {
                    const chip = document.createElement('div');
                    chip.className = 'tasting-radio';
                    chip.textContent = expr.ko;
                    chip.dataset.radioKey = radioKey;
                    chip.dataset.value = expr.ko;
                    chip.onclick = function() { toggleTastingRadio(this, radioKey, expr.ko); };
                    radioGroup.appendChild(chip);
                });
                section.appendChild(radioGroup);
            } else {
                // 멀티 태그
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'tasting-tags';
                sub.expressions.forEach(expr => {
                    const chip = document.createElement('div');
                    chip.className = 'tasting-tag';
                    chip.textContent = expr.ko;
                    chip.dataset.catId = cat.id;
                    chip.dataset.subCat = subName;
                    chip.dataset.expr = expr.ko;
                    chip.onclick = function() { toggleTastingTag(this); };
                    tagsContainer.appendChild(chip);
                });
                section.appendChild(tagsContainer);
            }

            panel.appendChild(section);
        });

        // 카테고리별 추가 노트 입력
        const noteSection = document.createElement('div');
        noteSection.className = 'tasting-sub-section';
        noteSection.style.marginTop = '12px';
        const noteInput = document.createElement('textarea');
        noteInput.id = 'catNote_' + cat.id;
        noteInput.placeholder = cat.ko + '에 대한 추가 메모...';
        noteInput.rows = 2;
        noteInput.style.cssText = 'width:100%;border:1.5px solid var(--border-card);border-radius:10px;padding:10px 12px;font-size:0.85rem;resize:vertical;background:var(--bg-card);color:var(--text-primary);font-family:inherit;';
        noteInput.oninput = function() { tastingCategoryNotes[cat.id] = this.value; };
        noteSection.appendChild(noteInput);
        panel.appendChild(noteSection);

        panelsEl.appendChild(panel);
    });

    // 초기화
    tastingSelections = {};
    tastingRadioSelections = {};
    tastingCategoryNotes = {};
    TASTING_CATEGORIES.forEach(c => { tastingSelections[c.id] = {}; });
    updateTastingSummary();
}

function switchTastingCategory(catId) {
    activeTastingCategory = catId;
    document.querySelectorAll('.tasting-cat-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.catId === catId);
    });
    document.querySelectorAll('.tasting-cat-panel').forEach(p => {
        p.classList.toggle('active', p.id === 'panel_' + catId);
    });
}

function toggleTastingTag(el) {
    const catId = el.dataset.catId;
    const subCat = el.dataset.subCat;
    const expr = el.dataset.expr;

    if (!tastingSelections[catId]) tastingSelections[catId] = {};
    if (!tastingSelections[catId][subCat]) tastingSelections[catId][subCat] = [];

    const arr = tastingSelections[catId][subCat];
    const idx = arr.indexOf(expr);
    if (idx >= 0) {
        arr.splice(idx, 1);
        el.classList.remove('selected');
    } else {
        arr.push(expr);
        el.classList.add('selected');
    }
    if (arr.length === 0) delete tastingSelections[catId][subCat];

    updateTastingBadges();
    updateTastingSummary();
}

function toggleTastingRadio(el, radioKey, value) {
    const group = el.parentElement;
    const wasSelected = el.classList.contains('selected');

    group.querySelectorAll('.tasting-radio').forEach(r => r.classList.remove('selected'));

    if (wasSelected) {
        delete tastingRadioSelections[radioKey];
    } else {
        el.classList.add('selected');
        tastingRadioSelections[radioKey] = value;
    }

    updateTastingBadges();
    updateTastingSummary();
}

function updateTastingBadges() {
    TASTING_CATEGORIES.forEach(cat => {
        let count = 0;
        const catSel = tastingSelections[cat.id] || {};
        Object.values(catSel).forEach(arr => { count += arr.length; });
        Object.keys(tastingRadioSelections).forEach(k => {
            if (k.startsWith(cat.id + '_')) count++;
        });
        const badge = document.getElementById('badge_' + cat.id);
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? '' : 'none';
        }
    });
}

function updateTastingSummary() {
    const container = document.getElementById('tastingSummaryTags');
    if (!container) return;
    const allTags = [];

    TASTING_CATEGORIES.forEach(cat => {
        const catSel = tastingSelections[cat.id] || {};
        Object.entries(catSel).forEach(([sub, arr]) => {
            arr.forEach(expr => {
                allTags.push({ catId: cat.id, sub, expr, icon: cat.icon });
            });
        });
        Object.entries(tastingRadioSelections).forEach(([key, val]) => {
            if (key.startsWith(cat.id + '_')) {
                allTags.push({ catId: cat.id, sub: key.split('_').slice(1).join('_'), expr: val, icon: cat.icon });
            }
        });
    });

    if (allTags.length === 0) {
        container.innerHTML = '<span class="summary-empty">태그를 선택해주세요</span>';
        return;
    }

    container.innerHTML = allTags.map((t, i) =>
        '<span class="summary-tag">' + t.icon + ' ' + escapeHtml(t.expr) +
        ' <span class="remove-tag" data-idx="' + i + '">&times;</span></span>'
    ).join('');
    container.querySelectorAll('.remove-tag').forEach(el => {
        el.onclick = function(e) {
            e.stopPropagation();
            const idx = parseInt(this.dataset.idx);
            const tag = allTags[idx];
            if (tag) removeTastingSelection(tag.catId, tag.sub, tag.expr);
        };
    });
}

function removeTastingSelection(catId, sub, expr) {
    const radioKey = catId + '_' + sub;
    if (tastingRadioSelections[radioKey] === expr) {
        delete tastingRadioSelections[radioKey];
        document.querySelectorAll('.tasting-radio[data-radio-key="' + radioKey + '"]').forEach(r => r.classList.remove('selected'));
    } else if (tastingSelections[catId] && tastingSelections[catId][sub]) {
        const arr = tastingSelections[catId][sub];
        const idx = arr.indexOf(expr);
        if (idx >= 0) arr.splice(idx, 1);
        if (arr.length === 0) delete tastingSelections[catId][sub];
        document.querySelectorAll('.tasting-tag[data-cat-id="' + catId + '"][data-sub-cat="' + sub + '"]').forEach(el => {
            if (el.dataset.expr === expr) el.classList.remove('selected');
        });
    }
    updateTastingBadges();
    updateTastingSummary();
}

function collectTastingData() {
    const data = { version: 2, categories: {}, notes: {} };
    TASTING_CATEGORIES.forEach(cat => {
        const catData = {};
        const catSel = tastingSelections[cat.id] || {};
        Object.entries(catSel).forEach(([sub, arr]) => {
            if (arr.length > 0) catData[sub] = [...arr];
        });
        Object.entries(tastingRadioSelections).forEach(([key, val]) => {
            if (key.startsWith(cat.id + '_')) {
                const subName = key.substring(cat.id.length + 1);
                catData[subName] = val;
            }
        });
        if (Object.keys(catData).length > 0) {
            data.categories[cat.id] = catData;
        }
        // 카테고리별 추가 노트
        const noteVal = (tastingCategoryNotes[cat.id] || '').trim();
        if (noteVal) data.notes[cat.id] = noteVal;
    });
    return data;
}

function loadTastingDataToForm(jsonStr) {
    if (!jsonStr) return;
    let data;
    try { data = JSON.parse(jsonStr); } catch(e) { return; }
    if (!data || data.version !== 2) return;

    tastingSelections = {};
    tastingRadioSelections = {};
    tastingCategoryNotes = {};
    TASTING_CATEGORIES.forEach(c => { tastingSelections[c.id] = {}; });

    Object.entries(data.categories || {}).forEach(([catId, catData]) => {
        Object.entries(catData).forEach(([sub, val]) => {
            if (Array.isArray(val)) {
                tastingSelections[catId][sub] = [...val];
                val.forEach(expr => {
                    document.querySelectorAll('.tasting-tag[data-cat-id="' + catId + '"][data-sub-cat="' + sub + '"]').forEach(el => {
                        if (el.dataset.expr === expr) el.classList.add('selected');
                    });
                });
            } else {
                const radioKey = catId + '_' + sub;
                tastingRadioSelections[radioKey] = val;
                document.querySelectorAll('.tasting-radio[data-radio-key="' + radioKey + '"]').forEach(el => {
                    if (el.dataset.value === val) el.classList.add('selected');
                });
            }
        });
    });

    // 카테고리별 노트 복원
    Object.entries(data.notes || {}).forEach(([catId, noteVal]) => {
        tastingCategoryNotes[catId] = noteVal;
        const noteEl = document.getElementById('catNote_' + catId);
        if (noteEl) noteEl.value = noteVal;
    });

    updateTastingBadges();
    updateTastingSummary();
}

function resetTastingUI() {
    tastingSelections = {};
    tastingRadioSelections = {};
    tastingCategoryNotes = {};
    TASTING_CATEGORIES.forEach(c => { tastingSelections[c.id] = {}; });
    document.querySelectorAll('.tasting-tag.selected, .tasting-radio.selected').forEach(el => el.classList.remove('selected'));
    TASTING_CATEGORIES.forEach(c => {
        const noteEl = document.getElementById('catNote_' + c.id);
        if (noteEl) noteEl.value = '';
    });
    updateTastingBadges();
    updateTastingSummary();
    switchTastingCategory('aroma');
}

// 이번 주의 추천 사케 데이터 (주간 순환)
const featuredSakes = [
    {
        name: "닷사이 준마이 다이긴죠 23",
        kanji: "獺祭 純米大吟醸 磨き二割三分",
        image: "https://atgfrwohilgucmheyuzu.supabase.co/storage/v1/object/public/sake-images/dassai23.jpg",
        description: "야마구치현의 명품 사케 닷사이. 23% 정미보합의 준마이 다이긴죠로, 극도로 정제된 쌀로 만들어져 깨끗하고 섬세한 맛이 특징입니다. 과일향이 풍부하며 부드러운 단맛과 산미의 균형이 완벽합니다.",
        meta: ["🏭 아사히슈조", "📍 야마구치현", "🌾 야마다니시키"]
    },
    {
        name: "쿠보타 만주",
        kanji: "久保田 萬壽",
        image: "https://atgfrwohilgucmheyuzu.supabase.co/storage/v1/object/public/sake-images/kubota_manju.jpg",
        description: "니가타현을 대표하는 프리미엄 사케. 우아한 향과 깔끔한 맛이 조화를 이루며, 부드러운 목넘김이 특징입니다. 축하 자리나 특별한 날에 어울리는 명품 사케입니다.",
        meta: ["🏭 아사히슈조", "📍 니가타현", "🌾 고시히카리"]
    },
    {
        name: "핫카이산 준마이 다이긴죠",
        kanji: "八海山 純米大吟醸",
        image: "https://atgfrwohilgucmheyuzu.supabase.co/storage/v1/object/public/sake-images/hakkaisan_junmai_daiginjo.jpg",
        description: "니가타의 명수로 빚은 깨끗하고 청량한 사케. 은은한 과일향과 부드러운 감칠맛이 특징이며, 어떤 음식과도 잘 어울리는 만능 사케입니다.",
        meta: ["🏭 핫카이조", "📍 니가타현", "🌾 야마다니시키"]
    },
    {
        name: "쥬욘다이 혼조조",
        kanji: "十四代 本醸造",
        image: "https://atgfrwohilgucmheyuzu.supabase.co/storage/v1/object/public/sake-images/juyondai_honjozo.jpg",
        description: "환상의 사케로 불리는 쥬욘다이. 화려한 과일향과 달콤한 맛, 깔끔한 여운이 완벽한 조화를 이룹니다. 구하기 어려운 프리미엄 사케의 대표주자입니다.",
        meta: ["🏭 타카기슈조", "📍 야마가타현", "🌾 야마다니시키"]
    }
];

// 주간 추천 사케 표시
function updateFeaturedSake() {
    // 주간 순환: 1월 1주차 = 0, 2주차 = 1, ...
    const now = new Date();
    const weekNumber = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
    const sakeIndex = weekNumber % featuredSakes.length;
    const sake = featuredSakes[sakeIndex];

    document.getElementById('featuredTitle').innerHTML = 
        `${sake.name} <span class="featured-kanji">(${sake.kanji})</span>`;
    document.getElementById('featuredDesc').textContent = sake.description;
    document.getElementById('featuredMeta').innerHTML = 
        sake.meta.map(item => `<span>${item}</span>`).join('');
    
    const img = document.getElementById('featuredImage');
    img.src = sake.image;
    img.onerror = function() {
        this.style.display = 'none';
        this.nextElementSibling.style.display = 'flex';
    };
}

// 추천 섹션 닫기
function hideFeatured() {
    document.getElementById('featuredSection').style.display = 'none';
}

// 오늘은 그만보기
function hideFeaturedToday() {
    const today = new Date().toDateString();
    localStorage.setItem('hideFeaturedUntil', today);
    hideFeatured();
}

// 추천 섹션 표시 여부 확인
function checkFeaturedVisibility() {
    const hiddenUntil = localStorage.getItem('hideFeaturedUntil');
    const today = new Date().toDateString();
    
    if (hiddenUntil === today) {
        document.getElementById('featuredSection').style.display = 'none';
    } else {
        document.getElementById('featuredSection').style.display = 'block';
        updateFeaturedSake();
    }
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// HTML 속성용 이스케이프 (싱글쿼트 포함)
function escapeAttr(text) {
    if (!text) return '';
    return escapeHtml(text).replace(/'/g, '&#39;');
}

// photo URL 검증 (data: URI 또는 https만 허용)
function sanitizePhotoUrl(url) {
    if (!url) return '';
    if (url.startsWith('data:image/')) return url;
    if (url.startsWith('https://')) return encodeURI(url);
    return '';
}

// 페이지 로드 시 인증 상태 확인
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentUser = session.user;
    }
    
    // 항상 메인 앱 표시 (로그인 여부와 관계없이)
    showMainApp();
}

// 인증 컨테이너 표시
function showAuthContainer() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
}

// 메인 앱 표시
function showMainApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('appFooter').style.display = 'block';

    // 로그인 상태에 따라 버튼 표시/숨김
    if (currentUser) {
        document.getElementById('userEmail').style.display = 'inline';
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('logoutBtn').style.display = 'inline-block';
        document.getElementById('loginBtn').style.display = 'none';
        loadNotes();
        updateSidebar();
    } else {
        document.getElementById('userEmail').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'inline-block';
    }
    // 기본 탭이 커뮤니티이므로 초기 로드
    loadCommunityStats();
    loadCommunityFeed();
}

// 로그인/회원가입 폼 전환
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginError').textContent = '';
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('signupError').textContent = '';
}

// 로그인 처리
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginSubmitBtn');

    // 로딩 상태 시작
    submitBtn.classList.add('loading');
    errorDiv.textContent = '';

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        currentUser = data.user;
        alert('✅ 로그인 성공!');
        showMainApp();
    } catch (error) {
        // 이메일 미인증 에러 체크
        if (error.message.includes('Email not confirmed') ||
            error.message.includes('email_not_confirmed') ||
            error.message.includes('확인되지 않은')) {
            errorDiv.textContent = '📧 이메일 인증 후 로그인해주세요.';
        } else {
            errorDiv.textContent = '로그인 실패: ' + error.message;
        }
    } finally {
        // 로딩 상태 종료
        submitBtn.classList.remove('loading');
    }
}

// 회원가입 처리
async function handleSignup(event) {
    event.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    const errorDiv = document.getElementById('signupError');
    const submitBtn = document.getElementById('signupSubmitBtn');

    if (password !== passwordConfirm) {
        errorDiv.textContent = '비밀번호가 일치하지 않습니다.';
        return;
    }

    // 로딩 상태 시작
    submitBtn.classList.add('loading');
    errorDiv.textContent = '';

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });

        if (error) throw error;

        // 이메일 인증 안내 팝업 표시
        showVerificationModal();
        showLogin();
    } catch (error) {
        errorDiv.textContent = '회원가입 실패: ' + error.message;
    } finally {
        // 로딩 상태 종료
        submitBtn.classList.remove('loading');
    }
}

// 이메일 인증 팝업 표시
function showVerificationModal() {
    document.getElementById('verificationModal').style.display = 'flex';
}

// 이메일 인증 팝업 닫기
function closeVerificationModal() {
    document.getElementById('verificationModal').style.display = 'none';
}

// 로그아웃
async function handleLogout() {
    if (confirm('로그아웃하시겠습니까?')) {
        await supabaseClient.auth.signOut();
        currentUser = null;
        alert('✅ 로그아웃되었습니다.');
        showMainApp(); // 메인 앱으로 돌아가되 로그인 버튼 표시
    }
}

// 테마 설정
function loadTheme() {
    const savedTheme = localStorage.getItem('sakeAppTheme');
    const themeIcon = document.getElementById('themeIcon');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.textContent = 'dark_mode';
    } else {
        if (themeIcon) themeIcon.textContent = 'light_mode';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.textContent = isDark ? 'dark_mode' : 'light_mode';
    localStorage.setItem('sakeAppTheme', isDark ? 'dark' : 'light');
}

// 날짜 기본값
function setDefaultDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
}

// 사진 업로드
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentPhotoData = e.target.result;
            document.getElementById('uploadText').style.display = 'none';
            document.getElementById('photoPreview').innerHTML =
                `<img src="${sanitizePhotoUrl(currentPhotoData)}" alt="사케 사진">`;
        };
        reader.readAsDataURL(file);
    }
}

// 탭 전환
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    if (tab === 'community') {
        document.querySelector('.tab:nth-child(1)').classList.add('active');
        document.getElementById('communityView').classList.add('active');
        loadCommunityStats();
        loadCommunityFeed();
    } else if (tab === 'new') {
        document.querySelector('.tab:nth-child(2)').classList.add('active');
        document.getElementById('newView').classList.add('active');
        if (!editingNoteId) {
            resetForm();
        }
    } else if (tab === 'list') {
        document.querySelector('.tab:nth-child(3)').classList.add('active');
        document.getElementById('listView').classList.add('active');
        loadNotes();
        if (editingNoteId) {
            editingNoteId = null;
            resetForm();
        }
    }
}

function setActiveNav(el) {
    document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
}

async function updateSidebar() {
    if (!currentUser) return;
    try {
        const { data } = await supabaseClient
            .from('tasting_notes')
            .select('id, sake_name, created_at, overall_rating, photo')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        if (!data) return;

        const total = data.length;
        const now = new Date();
        const monthCount = data.filter(n => {
            const d = new Date(n.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        document.getElementById('sidebarTotalCount').textContent = total;
        document.getElementById('sidebarMonthCount').textContent = monthCount;
        const goal = 10;
        document.getElementById('sidebarProgressBar').style.width = Math.min(monthCount / goal * 100, 100) + '%';

        const recent = data.slice(0, 3);
        const container = document.getElementById('sidebarRecentNotes');
        if (recent.length === 0) return;
        container.innerHTML = recent.map(n => {
            const date = new Date(n.created_at);
            const daysAgo = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            const timeText = daysAgo === 0 ? '오늘' : daysAgo + '일 전';
            const stars = '★'.repeat(Math.min(Math.round((n.overall_rating || 5) / 2), 5));
            return `<div onclick="showDetail('${n.id}')" style="display:flex;gap:12px;padding:12px;background:var(--card-bg);border:1px solid var(--border-card);border-radius:12px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='var(--accent-gold)';this.style.boxShadow='0 2px 8px rgba(56,57,97,0.08)'" onmouseout="this.style.borderColor='var(--border-card)';this.style.boxShadow='none'">
                <div style="width:48px;height:48px;border-radius:8px;background:var(--bg-muted);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.5em;overflow:hidden;">${n.photo ? `<img src="${sanitizePhotoUrl(n.photo)}" style="width:100%;height:100%;object-fit:cover;">` : '🍶'}</div>
                <div style="flex:1;min-width:0;">
                    <h5 style="font-weight:700;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-primary);">${escapeHtml(n.sake_name) || '이름 없음'}</h5>
                    <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
                        <span style="font-size:0.7rem;color:var(--text-muted);">${timeText}</span>
                    </div>
                    <div style="color:var(--accent-gold);font-size:0.7rem;margin-top:2px;">${stars}</div>
                </div>
            </div>`;
        }).join('');
    } catch(e) {
        console.error('사이드바 업데이트 실패:', e);
    }
}


// 라디오 버튼 값 가져오기
function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? parseInt(radio.value) : 3;
}

// 라디오 버튼 값 설정
function setRadioValue(name, value) {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) radio.checked = true;
}

// 테이스팅 노트 저장
async function saveTastingNote(event) {
    event.preventDefault();
    
    // 로그인 체크
    if (!currentUser) {
        alert('⚠️ 노트를 저장하려면 로그인이 필요합니다.');
        showAuthContainer();
        return;
    }
    
    const sakeNameVal = getSakeNameValue();
    if (!sakeNameVal || !sakeNameVal.trim()) {
        alert('사케 이름을 선택하거나 입력해주세요.');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';

    const tastingData = collectTastingData();
    const noteData = {
        user_id: currentUser.id,
        date: document.getElementById('date').value,
        photo: currentPhotoData,
        sake_name: sakeNameVal.trim(),
        flavor_description: JSON.stringify(tastingData),
        personal_review: document.getElementById('personal_review').value,
        overall_rating: getRadioValue('overall_rating')
    };

    try {
        if (editingNoteId) {
            // 수정
            const { error } = await supabaseClient
                .from('tasting_notes')
                .update(noteData)
                .eq('id', editingNoteId)
                .eq('user_id', currentUser.id);

            if (error) throw error;
            alert('✅ 테이스팅 노트가 수정되었습니다!');
            editingNoteId = null;
        } else {
            // 새로 생성
            const { error } = await supabaseClient
                .from('tasting_notes')
                .insert([noteData]);

            if (error) throw error;
            alert('✅ 테이스팅 노트가 저장되었습니다!');
        }

        resetForm();
        switchTab('list');
        updateSidebar();
    } catch (error) {
        alert('❌ 저장 실패: ' + error.message);
        console.error('Save error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '노트 저장';
    }
}

// 폼 초기화
function resetForm() {
    document.getElementById('tastingForm').reset();
    setDefaultDate();
    currentPhotoData = null;
    ocrPhotoData = null;
    editingNoteId = null;
    document.getElementById('uploadText').style.display = 'block';
    document.getElementById('photoPreview').innerHTML = '';

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = '노트 저장';

    resetSakeSelector();
    resetTastingUI();
}

// === 사케 이름 선택기 (Sake Selector) ===
let selectedBrand = null;
let selectedProduct = null;
let sakeInputMode = 'db';

async function loadAndMergeCustomSakes() {
    try {
        const { data, error } = await supabaseClient
            .from('custom_sakes')
            .select('*');
        if (error || !data || data.length === 0) return;
        for (const cs of data) {
            const product = {
                name: cs.product_name,
                japanese: cs.japanese || '',
                grade: cs.grade || '',
                polishRate: cs.polish_rate || '-'
            };
            if (SAKE_DATABASE[cs.brand]) {
                const exists = SAKE_DATABASE[cs.brand].products.some(p => p.name === product.name);
                if (!exists) SAKE_DATABASE[cs.brand].products.push(product);
                if (!SAKE_DATABASE[cs.brand].brandJp && cs.brand_jp) {
                    SAKE_DATABASE[cs.brand].brandJp = cs.brand_jp;
                }
            } else {
                SAKE_DATABASE[cs.brand] = {
                    brandJp: cs.brand_jp || '',
                    products: [product]
                };
            }
        }
    } catch (e) {
        console.error('Custom sakes merge error:', e);
    }
}

function initSakeSelector() {
    if (typeof SAKE_DATABASE === 'undefined') return;
    renderBrandList(Object.keys(SAKE_DATABASE).sort());

    // Event delegation for brand clicks
    document.getElementById('brandList').addEventListener('click', function(e) {
        var item = e.target.closest('.sake-list-item');
        if (item && item.dataset.brand) selectBrand(item.dataset.brand);
    });

    // Event delegation for product clicks
    document.getElementById('productList').addEventListener('click', function(e) {
        var item = e.target.closest('.sake-list-item');
        if (item && item.dataset.idx !== undefined) selectProduct(parseInt(item.dataset.idx));
    });
}

function renderBrandList(brands) {
    var brandList = document.getElementById('brandList');
    var html = '<div class="sake-list-header">브랜드 (' + brands.length + ')</div>';
    brands.forEach(function(brand) {
        var isSelected = selectedBrand === brand ? ' selected' : '';
        var entry = SAKE_DATABASE[brand];
        var label = escapeHtml(brand);
        if (entry.brandJp) label += ' <span class="item-jp">(' + escapeHtml(entry.brandJp) + ')</span>';
        html += '<div class="sake-list-item' + isSelected + '" data-brand="' + escapeHtml(brand) + '">' + label + '<div class="item-sub">' + entry.products.length + '개 제품</div></div>';
    });
    brandList.innerHTML = html;
}

function filterBrands(query) {
    if (typeof SAKE_DATABASE === 'undefined') return;
    var brands = Object.keys(SAKE_DATABASE).sort();
    var q = query.toLowerCase().trim();
    var filtered = q ? brands.filter(function(b) {
        var entry = SAKE_DATABASE[b];
        return b.toLowerCase().includes(q) || (entry.brandJp && entry.brandJp.includes(q));
    }) : brands;
    renderBrandList(filtered);
}

function selectBrand(brand) {
    selectedBrand = brand;
    selectedProduct = null;

    // Highlight selected brand
    document.querySelectorAll('#brandList .sake-list-item').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.brand === brand);
    });

    // Populate product list
    var productList = document.getElementById('productList');
    var products = SAKE_DATABASE[brand].products;
    var html = '<div class="sake-list-header">제품 (' + products.length + ')</div>';
    products.forEach(function(p, idx) {
        html += '<div class="sake-list-item" data-idx="' + idx + '">' + escapeHtml(p.name) + '<div class="item-sub">' + escapeHtml(p.japanese) + '</div></div>';
    });
    productList.innerHTML = html;

    updateSakeDisplay();
}

function selectProduct(idx) {
    if (!selectedBrand) return;
    var products = SAKE_DATABASE[selectedBrand].products;
    selectedProduct = products[idx];

    // Highlight selected product
    document.querySelectorAll('#productList .sake-list-item').forEach(function(el) {
        el.classList.toggle('selected', parseInt(el.dataset.idx) === idx);
    });

    updateSakeDisplay();
}

function updateSakeDisplay() {
    const display = document.getElementById('sakeSelectedDisplay');
    const hidden = document.getElementById('sakeName');

    if (selectedBrand && selectedProduct) {
        const fullName = selectedBrand + ' ' + selectedProduct.name;
        const japaneseName = selectedProduct.japanese;
        const displayName = fullName + (japaneseName ? ' (' + japaneseName + ')' : '');

        document.getElementById('sakeSelectedText').textContent = fullName;
        document.getElementById('sakeSelectedSub').textContent = japaneseName || '';
        display.classList.add('visible');
        hidden.value = displayName;
    } else {
        display.classList.remove('visible');
        hidden.value = '';
    }
}

function clearSakeSelection() {
    selectedBrand = null;
    selectedProduct = null;
    document.querySelectorAll('#brandList .sake-list-item').forEach(function(el) { el.classList.remove('selected'); });
    const productList = document.getElementById('productList');
    productList.innerHTML = '<div class="sake-list-header">제품</div><div class="sake-product-empty">브랜드를 선택하세요</div>';
    document.getElementById('sakeSelectedDisplay').classList.remove('visible');
    document.getElementById('sakeName').value = '';
}

function toggleSakeInputMode(mode) {
    sakeInputMode = mode;
    document.querySelectorAll('.sake-selector-tab').forEach(function(tab, i) {
        tab.classList.toggle('active', (i === 0 && mode === 'db') || (i === 1 && mode === 'manual'));
    });
    document.getElementById('sakeDbPanel').classList.toggle('active', mode === 'db');
    document.getElementById('sakeManualPanel').classList.toggle('active', mode === 'manual');

    // Sync hidden field
    if (mode === 'manual') {
        document.getElementById('sakeName').value = document.getElementById('sakeNameManual').value;
    } else {
        updateSakeDisplay();
    }
}

function getSakeNameValue() {
    if (sakeInputMode === 'manual') {
        return document.getElementById('sakeNameManual').value;
    }
    return document.getElementById('sakeName').value;
}

function resetSakeSelector() {
    sakeInputMode = 'db';
    selectedBrand = null;
    selectedProduct = null;
    document.querySelectorAll('.sake-selector-tab').forEach(function(tab, i) {
        tab.classList.toggle('active', i === 0);
    });
    document.getElementById('sakeDbPanel').classList.add('active');
    document.getElementById('sakeManualPanel').classList.remove('active');
    document.getElementById('brandSearch').value = '';
    document.getElementById('sakeNameManual').value = '';
    document.getElementById('sakeName').value = '';
    document.getElementById('sakeSelectedDisplay').classList.remove('visible');
    if (typeof SAKE_DATABASE !== 'undefined') renderBrandList(Object.keys(SAKE_DATABASE).sort());
    var productList = document.getElementById('productList');
    productList.innerHTML = '<div class="sake-list-header">제품</div><div class="sake-product-empty">브랜드를 선택하세요</div>';
    // OCR 모달 상태 초기화
    ocrPhotoData = null;
    var ocrPreview = document.getElementById('ocrPreviewImg');
    if (ocrPreview) { ocrPreview.style.display = 'none'; ocrPreview.src = ''; }
    var ocrPlaceholder = document.getElementById('ocrPlaceholder');
    if (ocrPlaceholder) ocrPlaceholder.style.display = '';
    var ocrPhotoArea = document.getElementById('ocrPhotoArea');
    if (ocrPhotoArea) ocrPhotoArea.classList.remove('has-photo');
    var ocrStartBtn = document.getElementById('ocrStartBtn');
    if (ocrStartBtn) ocrStartBtn.disabled = true;
    var ocrResults = document.getElementById('ocrResults');
    if (ocrResults) ocrResults.classList.remove('active');
    var ocrProgress = document.getElementById('ocrProgress');
    if (ocrProgress) ocrProgress.classList.remove('active');
}

function setSakeNameFromNote(sakeName) {
    if (!sakeName) return;
    // Try to find the sake in DB
    if (typeof SAKE_DATABASE !== 'undefined') {
        for (var brand in SAKE_DATABASE) {
            var products = SAKE_DATABASE[brand].products;
            for (var i = 0; i < products.length; i++) {
                var p = products[i];
                var fullName = brand + ' ' + p.name;
                var displayName = fullName + (p.japanese ? ' (' + p.japanese + ')' : '');
                if (sakeName === displayName || sakeName === fullName) {
                    toggleSakeInputMode('db');
                    selectBrand(brand);
                    selectProduct(i);
                    // Scroll brand into view
                    var brandEl = document.querySelector('#brandList .sake-list-item.selected');
                    if (brandEl) brandEl.scrollIntoView({ block: 'nearest' });
                    return;
                }
            }
        }
    }
    // Not found in DB - switch to manual mode
    toggleSakeInputMode('manual');
    document.getElementById('sakeNameManual').value = sakeName;
    document.getElementById('sakeName').value = sakeName;
}

// Sync manual input to hidden field
document.addEventListener('DOMContentLoaded', function() {
    var manualInput = document.getElementById('sakeNameManual');
    if (manualInput) {
        manualInput.addEventListener('input', function() {
            if (sakeInputMode === 'manual') {
                document.getElementById('sakeName').value = this.value;
            }
        });
    }
    initTastingUI();
});

// === 사케 OCR 사진 인식 ===
let ocrPhotoData = null;
let ocrMethod = 'tesseract';
let tesseractWorker = null;
let tesseractLoaded = false;

// Tesseract.js 동적 로딩
function loadTesseract() {
    return new Promise(function(resolve, reject) {
        if (tesseractLoaded) { resolve(); return; }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = function() { tesseractLoaded = true; resolve(); };
        script.onerror = function() { reject(new Error('Tesseract.js 로딩 실패')); };
        document.head.appendChild(script);
    });
}

// Tesseract 워커 초기화
async function initTesseractWorker() {
    if (tesseractWorker) return tesseractWorker;
    await loadTesseract();
    tesseractWorker = await Tesseract.createWorker('jpn+eng', 1, {
        logger: function(m) {
            if (m.status === 'recognizing text') {
                updateOcrProgress(Math.round(m.progress * 100), '텍스트 인식 중...');
            }
        }
    });
    return tesseractWorker;
}

// OCR 실행
async function runTesseractOcr(imageData) {
    updateOcrProgress(10, 'OCR 엔진 로딩 중...');
    var worker = await initTesseractWorker();
    updateOcrProgress(30, '이미지 분석 중...');
    var result = await worker.recognize(imageData);
    updateOcrProgress(100, '인식 완료!');
    return result.data.text;
}

// AI용 이미지 준비 (JPEG 변환 + 고품질 리사이즈)
function prepareImageForAi(base64) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var maxSize = 2048;
            var scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        img.src = base64;
    });
}

// AI Vision OCR (Claude API via Supabase Edge Function)
async function runAiVisionOcr(base64) {
    updateOcrProgress(10, '이미지 준비 중...');
    // 항상 canvas 통과: HEIC→JPEG 변환, EXIF 회전 보정, 크기 제한
    var imageToSend = await prepareImageForAi(base64);
    updateOcrProgress(20, 'AI 분석 요청 중...');
    var resp = await supabaseClient.functions.invoke('sake-vision', {
        body: { image: imageToSend }
    });
    if (resp.error) {
        // 상세 에러 추출
        var errMsg = resp.error.message || 'AI Vision 호출 실패';
        try {
            if (resp.error.context && resp.error.context.json) {
                var errBody = await resp.error.context.json();
                errMsg += ': ' + (errBody.error || JSON.stringify(errBody));
            }
        } catch(e) {}
        throw new Error(errMsg);
    }
    var data = resp.data;
    // 문자열 응답인 경우 JSON 파싱
    if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) { data = { rawText: data }; }
    }
    if (data && data.error) {
        throw new Error(data.error);
    }
    updateOcrProgress(80, 'AI 분석 완료, 매칭 중...');
    return data || {};
}

// AI 결과로 DB 매칭
function matchAiResultToDatabase(aiResult) {
    if (typeof SAKE_DATABASE === 'undefined') return [];
    var results = [];
    var aiBrand = (aiResult.brand || '').trim();
    var aiProduct = (aiResult.product || '').trim();
    var aiGrade = (aiResult.grade || '').trim();

    for (var brand in SAKE_DATABASE) {
        var entry = SAKE_DATABASE[brand];
        var brandJp = entry.brandJp || '';
        var brandScore = 0;

        // 브랜드 매칭: AI가 추출한 brand와 DB의 brandJp 비교
        if (aiBrand && brandJp) {
            if (aiBrand === brandJp || brandJp.includes(aiBrand) || aiBrand.includes(brandJp)) {
                brandScore = 60;
            } else {
                var bm = fuzzyContains(aiBrand, brandJp);
                if (bm.found) brandScore = Math.round(bm.score * 50);
            }
        }

        // 한글 브랜드명으로도 시도
        if (brandScore === 0 && aiBrand) {
            if (brand.toLowerCase().includes(aiBrand.toLowerCase()) ||
                aiBrand.toLowerCase().includes(brand.toLowerCase())) {
                brandScore = 30;
            }
        }

        if (brandScore === 0) continue;

        var products = entry.products;
        for (var pi = 0; pi < products.length; pi++) {
            var p = products[pi];
            var productScore = brandScore;
            var jpName = p.japanese || '';

            // 제품명 매칭
            if (aiProduct && jpName) {
                if (aiProduct === jpName || jpName.includes(aiProduct) || aiProduct.includes(jpName)) {
                    productScore += 30;
                } else {
                    // 브랜드명 제거 후 비교
                    var productPart = jpName;
                    if (brandJp && jpName.startsWith(brandJp)) {
                        productPart = jpName.substring(brandJp.length).trim();
                    }
                    var aiProductPart = aiProduct;
                    if (aiBrand && aiProduct.startsWith(aiBrand)) {
                        aiProductPart = aiProduct.substring(aiBrand.length).trim();
                    }
                    if (productPart && aiProductPart &&
                        (productPart.includes(aiProductPart) || aiProductPart.includes(productPart))) {
                        productScore += 25;
                    } else {
                        var pm = fuzzyContains(aiProduct, productPart);
                        if (pm.found) productScore += Math.round(pm.score * 20);
                    }
                }
            }

            // 등급 매칭 보너스
            if (aiGrade && p.grade) {
                var gradeJpMap = {
                    '다이긴죠': '大吟醸', '준마이다이긴죠': '純米大吟醸',
                    '긴죠': '吟醸', '준마이긴죠': '純米吟醸',
                    '준마이': '純米', '혼죠조': '本醸造',
                    '도쿠베츠준마이': '特別純米', '도쿠베츠혼죠조': '特別本醸造',
                    '토쿠베츠준마이': '特別純米', '토쿠베츠혼죠조': '特別本醸造'
                };
                var gradeJp = gradeJpMap[p.grade] || '';
                if (gradeJp && (aiGrade === gradeJp || aiGrade.includes(gradeJp) || gradeJp.includes(aiGrade))) {
                    productScore += 10;
                }
            }

            if (productScore > 20) {
                results.push({
                    brand: brand,
                    brandJp: brandJp,
                    productIdx: pi,
                    product: p,
                    score: Math.min(productScore, 100)
                });
            }
        }
    }

    results.sort(function(a, b) { return b.score - a.score; });
    return results.slice(0, 5);
}

// 이미지 전처리 (리사이즈 + 그레이스케일 + 대비 강화)
function prepareImageForOcr(base64) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var maxSize = 1500;
            var scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 그레이스케일 + 대비 강화
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;
            for (var i = 0; i < data.length; i += 4) {
                var gray = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
                // 대비 강화 (contrast stretching)
                gray = ((gray - 128) * 1.5) + 128;
                gray = Math.max(0, Math.min(255, gray));
                data[i] = data[i+1] = data[i+2] = gray;
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = base64;
    });
}

// 일본어 텍스트 정규화
function normalizeJapaneseText(text) {
    if (!text) return '';
    // 전각 → 반각 (숫자, 영문)
    text = text.replace(/[０-９]/g, function(c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); });
    text = text.replace(/[Ａ-Ｚａ-ｚ]/g, function(c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); });
    // OCR 노이즈 제거
    text = text.replace(/[^\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEFa-zA-Z0-9\s%％。、・]/g, ' ');
    // 연속 공백 정리
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

// 레벤슈타인 거리
function levenshteinDistance(a, b) {
    if (!a || !b) return Math.max((a||'').length, (b||'').length);
    var matrix = [];
    for (var i = 0; i <= b.length; i++) matrix[i] = [i];
    for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (var i = 1; i <= b.length; i++) {
        for (var j = 1; j <= a.length; j++) {
            if (b.charAt(i-1) === a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i-1][j-1] + 1,
                    matrix[i][j-1] + 1,
                    matrix[i-1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// 퍼지 포함 검사 (슬라이딩 윈도우)
function fuzzyContains(haystack, needle) {
    if (!haystack || !needle || needle.length === 0) return { found: false, score: 0 };
    if (haystack.includes(needle)) return { found: true, score: 1.0 };
    var bestScore = 0;
    var windowSize = needle.length;
    for (var i = 0; i <= haystack.length - windowSize; i++) {
        var sub = haystack.substring(i, i + windowSize);
        var dist = levenshteinDistance(sub, needle);
        var score = 1 - (dist / windowSize);
        if (score > bestScore) bestScore = score;
    }
    // 부분 매칭도 허용 (needle이 더 긴 경우)
    if (needle.length > haystack.length) {
        var dist2 = levenshteinDistance(haystack, needle);
        var score2 = 1 - (dist2 / needle.length);
        if (score2 > bestScore) bestScore = score2;
    }
    return { found: bestScore >= 0.6, score: bestScore };
}

// OCR 텍스트 → DB 매칭
function matchOcrTextToDatabase(ocrText) {
    if (typeof SAKE_DATABASE === 'undefined') return [];
    var normalized = normalizeJapaneseText(ocrText);
    var lines = normalized.split(/\s+/);
    var fullText = normalized;
    var results = [];

    // 등급 키워드
    var gradeKeywords = ['純米大吟醸', '大吟醸', '純米吟醸', '吟醸', '純米', '本醸造', '特別純米', '特別本醸造'];
    var detectedGrades = [];
    gradeKeywords.forEach(function(g) {
        if (fullText.includes(g)) detectedGrades.push(g);
    });

    for (var brand in SAKE_DATABASE) {
        var entry = SAKE_DATABASE[brand];
        var brandJp = entry.brandJp || '';
        var brandScore = 0;

        // 1. 브랜드 매칭 (한자 브랜드명)
        if (brandJp && brandJp.length >= 2) {
            if (fullText.includes(brandJp)) {
                brandScore = 50;
            } else {
                var bm = fuzzyContains(fullText, brandJp);
                if (bm.found) brandScore = Math.round(bm.score * 40);
            }
        }

        // 2. 한글 브랜드명 매칭 (보조)
        if (brandScore === 0) {
            var brandLower = brand.toLowerCase();
            var textLower = fullText.toLowerCase();
            if (textLower.includes(brandLower) && brand.length >= 2) {
                brandScore = 20;
            }
        }

        if (brandScore === 0) continue;

        // 3. 제품 매칭
        var products = entry.products;
        for (var pi = 0; pi < products.length; pi++) {
            var p = products[pi];
            var productScore = brandScore;
            var jpName = p.japanese || '';

            // 일본어 제품명에서 브랜드명 제거 후 매칭
            var productPart = jpName;
            if (brandJp && jpName.startsWith(brandJp)) {
                productPart = jpName.substring(brandJp.length).trim();
            }

            if (productPart && productPart.length >= 2) {
                if (fullText.includes(productPart)) {
                    productScore += 30;
                } else {
                    var pm = fuzzyContains(fullText, productPart);
                    if (pm.found) productScore += Math.round(pm.score * 20);
                }
            }

            // 등급 매칭 보조 점수
            if (detectedGrades.length > 0 && p.grade) {
                var gradeJpMap = {
                    '다이긴죠': '大吟醸', '준마이다이긴죠': '純米大吟醸',
                    '긴죠': '吟醸', '준마이긴죠': '純米吟醸',
                    '준마이': '純米', '혼죠조': '本醸造',
                    '도쿠베츠준마이': '特別純米', '도쿠베츠혼죠조': '特別本醸造'
                };
                var gradeJp = gradeJpMap[p.grade] || '';
                if (gradeJp && detectedGrades.indexOf(gradeJp) >= 0) {
                    productScore += 15;
                }
            }

            if (productScore > 20) {
                results.push({
                    brand: brand,
                    brandJp: brandJp,
                    productIdx: pi,
                    product: p,
                    score: Math.min(productScore, 100)
                });
            }
        }
    }

    // 점수 순 정렬, 상위 5개
    results.sort(function(a, b) { return b.score - a.score; });
    return results.slice(0, 5);
}

// 사진 처리
function handleOcrPhoto(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        ocrPhotoData = e.target.result;
        var previewImg = document.getElementById('ocrPreviewImg');
        previewImg.src = ocrPhotoData;
        previewImg.style.display = 'block';
        document.getElementById('ocrPlaceholder').style.display = 'none';
        document.getElementById('ocrPhotoArea').classList.add('has-photo');
        document.getElementById('ocrStartBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

// OCR 방식 선택
function selectOcrMethod(method) {
    ocrMethod = method;
    document.querySelectorAll('.ocr-method-btn').forEach(function(label) {
        var input = label.previousElementSibling;
        label.classList.toggle('active', input && input.value === method);
    });
}


// 진행바 업데이트
function updateOcrProgress(percent, text) {
    document.getElementById('ocrProgressBar').style.width = percent + '%';
    document.getElementById('ocrProgressText').textContent = text || '';
}

// 모달 열기
function openOcrModal() {
    document.getElementById('ocrModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    // 기존 업로드 사진이 있으면 사용
    if (currentPhotoData && !ocrPhotoData) {
        ocrPhotoData = currentPhotoData;
        var previewImg = document.getElementById('ocrPreviewImg');
        previewImg.src = ocrPhotoData;
        previewImg.style.display = 'block';
        document.getElementById('ocrPlaceholder').style.display = 'none';
        document.getElementById('ocrPhotoArea').classList.add('has-photo');
        document.getElementById('ocrStartBtn').disabled = false;
    }
}

// 모달 닫기
function closeOcrModal() {
    document.getElementById('ocrModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 원본 텍스트 토글
function toggleOcrRawText() {
    var content = document.getElementById('ocrRawContent');
    var toggle = content.previousElementSibling;
    var isActive = content.classList.toggle('active');
    toggle.textContent = (isActive ? '▼' : '▶') + ' 인식된 원본 텍스트 보기';
}

// 인식 시작
async function startOcrRecognition() {
    if (!ocrPhotoData) return;
    var startBtn = document.getElementById('ocrStartBtn');
    var progress = document.getElementById('ocrProgress');
    var results = document.getElementById('ocrResults');

    startBtn.disabled = true;
    results.classList.remove('active');
    progress.classList.add('active');

    try {
        updateOcrProgress(5, '이미지 전처리 중...');
        var processed = await prepareImageForOcr(ocrPhotoData);

        var matches = [];
        var rawText = '';

        if (ocrMethod === 'ai') {
            var aiResult = await runAiVisionOcr(ocrPhotoData);
            console.log('AI Result:', JSON.stringify(aiResult));
            rawText = aiResult.rawText || '';
            // AI 응답의 모든 텍스트를 합쳐서 매칭에 사용
            var searchText = [
                aiResult.brand || '',
                aiResult.product || '',
                aiResult.grade || '',
                rawText
            ].join(' ');
            // AI 구조화 매칭 + 전체 텍스트 매칭 둘 다 실행
            var aiMatches = matchAiResultToDatabase(aiResult);
            var textMatches = searchText ? matchOcrTextToDatabase(searchText) : [];
            console.log('AI matches:', aiMatches.length, 'Text matches:', textMatches.length);
            // 합산 및 중복 제거 (같은 brand+productIdx면 높은 점수 유지)
            var allMatches = aiMatches.concat(textMatches);
            var seen = {};
            matches = [];
            allMatches.forEach(function(m) {
                var key = m.brand + '_' + m.productIdx;
                if (!seen[key] || seen[key].score < m.score) {
                    seen[key] = m;
                }
            });
            for (var k in seen) matches.push(seen[k]);
            matches.sort(function(a, b) { return b.score - a.score; });
            matches = matches.slice(0, 5);
            // 매칭 실패 시 AI 인식 결과를 rawText에 포함
            if (matches.length === 0) {
                rawText = 'AI 인식: ' + (aiResult.brand || '?') + ' / ' + (aiResult.product || '?') + ' / ' + (aiResult.grade || '?') + '\n원본: ' + (aiResult.rawText || '없음');
            }
        } else {
            rawText = await runTesseractOcr(processed);
            matches = matchOcrTextToDatabase(rawText);
        }

        updateOcrProgress(100, '매칭 중...');
        displayOcrResults(matches, rawText);
    } catch (err) {
        console.error('OCR error:', err);
        updateOcrProgress(0, '오류 발생: ' + err.message);
        document.getElementById('ocrMatchList').innerHTML =
            '<div class="ocr-no-match">인식 중 오류가 발생했습니다.<br>' + escapeHtml(err.message) + '</div>';
        document.getElementById('ocrResults').classList.add('active');
    } finally {
        startBtn.disabled = false;
        setTimeout(function() { progress.classList.remove('active'); }, 1000);
    }
}

// 결과 표시
function displayOcrResults(matches, rawText) {
    var matchList = document.getElementById('ocrMatchList');
    var resultsDiv = document.getElementById('ocrResults');

    if (matches.length === 0) {
        matchList.innerHTML =
            '<div class="ocr-no-match">매칭되는 사케를 찾지 못했습니다.<br>직접 입력 모드를 사용해 주세요.</div>';
        // 매칭 실패 시 원본 텍스트 자동 펼치기
        var rawContent = document.getElementById('ocrRawContent');
        if (rawContent) rawContent.classList.add('active');
    } else {
        var html = '';
        matches.forEach(function(m) {
            html += '<div class="ocr-match-item" onclick="selectOcrMatch(\'' +
                escapeHtml(m.brand).replace(/'/g, "\\'") + '\', ' + m.productIdx + ')">';
            html += '<div class="ocr-match-info">';
            html += '<div class="ocr-match-name">' + escapeHtml(m.brand) + ' ' + escapeHtml(m.product.name) + '</div>';
            html += '<div class="ocr-match-sub">' + escapeHtml(m.product.japanese || '') + '</div>';
            html += '</div>';
            html += '<div class="ocr-match-score">' + m.score + '%</div>';
            html += '</div>';
        });
        matchList.innerHTML = html;
    }

    // 원본 텍스트
    document.getElementById('ocrRawContent').textContent = rawText || '(인식된 텍스트 없음)';
    resultsDiv.classList.add('active');
}

// 매칭 선택 → 기존 선택기에 반영
function selectOcrMatch(brand, productIdx) {
    toggleSakeInputMode('db');
    selectBrand(brand);
    selectProduct(productIdx);
    // 선택된 브랜드 스크롤
    var brandEl = document.querySelector('#brandList .sake-list-item.selected');
    if (brandEl) brandEl.scrollIntoView({ block: 'nearest' });
    closeOcrModal();
}

// 노트 목록 불러오기
async function loadNotes() {
    const container = document.getElementById('notesList');
    
    // 로그인 체크
    if (!currentUser) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔒</div>
                <h3>로그인이 필요합니다</h3>
                <p>저장된 노트를 보려면 로그인해주세요.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '<div class="loading">노트를 불러오는 중</div>';

    try {
        const { data, error } = await supabaseClient
            .from('tasting_notes')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayNotesList(data);
    } catch (error) {
        container.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon">❌</div>
            <h3>노트를 불러올 수 없습니다</h3>
            <p>${escapeHtml(error.message)}</p>
        </div>`;
    }
}

// 노트 목록 표시
function displayNotesList(notes) {
    const container = document.getElementById('notesList');
    
    if (!notes || notes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>아직 저장된 노트가 없습니다</h3>
                <p>첫 테이스팅 노트를 작성해보세요!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="notes-list">
            ${notes.map(note => `
                <div class="note-card" onclick="showDetail('${note.id}')">
                    ${note.photo && sanitizePhotoUrl(note.photo) ? `
                        <img src="${sanitizePhotoUrl(note.photo)}" class="note-card-image" alt="사케">
                    ` : `
                        <div class="note-card-image">🍶</div>
                    `}
                    <div class="note-card-content">
                        <div class="note-card-name">${escapeHtml(note.sake_name)}</div>
                        <div class="note-card-date">📅 ${escapeHtml(note.date)}</div>
                        <div class="note-card-summary">
                            ${getTastingPreview(note)}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 상세 보기
function getTastingPreview(note) {
    if (!note.flavor_description) {
        return note.dominant_aroma ? escapeHtml(note.dominant_aroma.substring(0, 60)) : '';
    }
    try {
        const td = JSON.parse(note.flavor_description);
        if (td && td.version === 2 && td.categories) {
            const tags = [];
            Object.values(td.categories).forEach(catData => {
                Object.values(catData).forEach(val => {
                    if (Array.isArray(val)) tags.push(...val);
                    else tags.push(val);
                });
            });
            if (tags.length === 0) return '';
            const preview = tags.slice(0, 5).join(', ');
            return escapeHtml(preview) + (tags.length > 5 ? ' ...' : '');
        }
    } catch(e) {}
    return note.dominant_aroma ? escapeHtml(note.dominant_aroma.substring(0, 60)) : '';
}

// ===== Community Functions =====
let communityLastTab = 'community';
let communitySearchTimeout = null;

function hashUserId(uid) {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = ((hash << 5) - hash) + uid.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getAvatarColor(uid) {
    const colors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6'];
    return colors[hashUserId(uid) % colors.length];
}

function getAvatarInitial(uid) {
    const initials = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return initials[hashUserId(uid) % initials.length];
}

function getTimeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return diffMin + '분 전';
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return diffHours + '시간 전';
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return diffDays + '일 전';
    return date.toLocaleDateString('ko-KR');
}

function renderRatingDots(rating) {
    const filled = Math.round((rating || 5) / 2);
    return [1,2,3,4,5].map(i =>
        `<div class="community-rating-dot${i <= filled ? ' active' : ''}"></div>`
    ).join('');
}

async function loadCommunityStats() {
    try {
        // 총 노트 수 (head:true로 row 데이터 없이 count만)
        const { count: totalNotes } = await supabaseClient
            .from('tasting_notes')
            .select('id', { count: 'exact', head: true });

        // 활성 유저 수 - 최근 노트 100개에서 추출 (전체 조회 대신)
        const { data: recentUsers } = await supabaseClient
            .from('tasting_notes')
            .select('user_id')
            .order('created_at', { ascending: false })
            .limit(100);
        const activeUsers = recentUsers ? new Set(recentUsers.map(u => u.user_id)).size : 0;

        let sakeCount = 0;
        if (typeof SAKE_DATABASE !== 'undefined') {
            Object.values(SAKE_DATABASE).forEach(b => { sakeCount += b.products.length; });
        }

        const el = (id) => document.getElementById(id);
        if (el('communityTotalNotes')) el('communityTotalNotes').textContent = (totalNotes || 0).toLocaleString();
        if (el('communityActiveUsers')) el('communityActiveUsers').textContent = activeUsers.toLocaleString();
        if (el('communitySakeDb')) el('communitySakeDb').textContent = sakeCount.toLocaleString();
    } catch (e) {
        console.error('Community stats error:', e);
    }
}

async function loadCommunityFeed() {
    const container = document.getElementById('communityFeedList');
    if (!container) return;
    container.innerHTML = '<div class="loading">커뮤니티 노트를 불러오는 중</div>';

    const feedHeader = document.querySelector('.community-feed-header h3');
    if (feedHeader) feedHeader.textContent = 'New Tasting Notes';

    try {
        const { data, error } = await supabaseClient
            .from('tasting_notes')
            .select('id, sake_name, date, personal_review, overall_rating, created_at, user_id')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        displayCommunityFeed(data || [], container, buildAvgMap(data));
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

function displayCommunityFeed(notes, container, avgMap) {
    avgMap = avgMap || {};
    if (!notes || notes.length === 0) {
        container.innerHTML = `<div class="community-empty">
            <div class="community-empty-icon">🍶</div>
            <h3>아직 커뮤니티 노트가 없습니다</h3>
            <p>첫 번째 테이스팅 노트를 공유해보세요!</p>
        </div>`;
        return;
    }

    container.innerHTML = notes.map(note => {
        const uid = note.user_id || 'anon';
        const avatarColor = getAvatarColor(uid);
        const avatarInitial = getAvatarInitial(uid);
        const userLabel = 'User' + uid.substring(0, 4);
        const timeAgo = getTimeAgo(note.created_at);
        const reviewText = note.personal_review || '';
        const truncated = reviewText.length > 120 ? reviewText.substring(0, 120) + '...' : reviewText;

        // 평점: 같은 사케 노트 여러 개면 평균, 1개면 그냥 표시
        const sakeAvg = avgMap[note.sake_name];
        let ratingDisplay = '';
        if (sakeAvg && sakeAvg.count > 1) {
            const avgStr = sakeAvg.avg % 1 === 0 ? sakeAvg.avg.toFixed(0) : sakeAvg.avg.toFixed(1);
            ratingDisplay = `<span class="community-feed-card-rating">${avgStr}<span class="community-feed-card-rating-max">/10</span></span>`;
        } else if (note.overall_rating) {
            ratingDisplay = `<span class="community-feed-card-rating">${note.overall_rating}<span class="community-feed-card-rating-max">/10</span></span>`;
        }

        return `<div class="community-feed-card" onclick="showCommunityDetail('${note.id}')">
            <div class="community-feed-card-header">
                <div class="community-avatar" style="background:${avatarColor}">${avatarInitial}</div>
                <div class="community-feed-card-info">
                    <div class="community-feed-card-name">${escapeHtml(note.sake_name || '이름 없음')}</div>
                    <div class="community-feed-card-meta">Shared by ${escapeHtml(userLabel)} · ${timeAgo}</div>
                </div>
                ${ratingDisplay}
            </div>
            ${truncated ? `<div class="community-feed-card-text">${escapeHtml(truncated)}</div>` : ''}
        </div>`;
    }).join('');
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
            .select('id, sake_name, date, personal_review, overall_rating, created_at, user_id')
            .ilike('sake_name', `%${sakeName}%`)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        displayCommunityFeed(data || [], container, buildAvgMap(data));
    } catch (e) {
        container.innerHTML = `<div class="community-empty"><p>검색 결과를 불러올 수 없습니다.</p></div>`;
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
            .select('id, sake_name, date, personal_review, overall_rating, created_at, user_id')
            .in('sake_name', sakeNames.slice(0, 50))
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
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
        const avatarColor = getAvatarColor(uid);
        const avatarInitial = getAvatarInitial(uid);
        const userLabel = 'User' + uid.substring(0, 4);

        // renderNoteDetail을 재사용하여 새/구 형식 모두 지원
        const noteDetailHtml = renderNoteDetail(note);

        detailContent.innerHTML = `
            <button class="back-btn" onclick="switchTab('community')" style="margin-bottom:16px;">← 커뮤니티로</button>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <div class="community-avatar" style="background:${avatarColor};width:36px;height:36px;font-size:0.85rem;">${avatarInitial}</div>
                <span style="font-size:0.85rem;color:#64748b;">Shared by ${escapeHtml(userLabel)}</span>
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

function renderNoteDetail(note) {
    let tastingHtml = '';
    let isNewFormat = false;

    // flavor_description이 JSON인지 확인 (새 형식)
    if (note.flavor_description) {
        try {
            const td = JSON.parse(note.flavor_description);
            if (td && td.version === 2 && td.categories) {
                isNewFormat = true;
                const catMap = {};
                TASTING_CATEGORIES.forEach(c => { catMap[c.id] = c; });

                tastingHtml += '<div class="section-title">테이스팅 노트</div>';
                Object.entries(td.categories).forEach(([catId, catData]) => {
                    const catInfo = catMap[catId];
                    if (!catInfo) return;
                    tastingHtml += '<div class="detail-tasting-section">';
                    tastingHtml += '<div class="detail-tasting-cat-title">' + catInfo.icon + ' ' + escapeHtml(catInfo.ko) + '</div>';
                    Object.entries(catData).forEach(([sub, val]) => {
                        tastingHtml += '<div class="detail-tasting-sub">';
                        tastingHtml += '<div class="detail-tasting-sub-label">' + escapeHtml(sub) + '</div>';
                        tastingHtml += '<div class="detail-tasting-tags">';
                        if (Array.isArray(val)) {
                            val.forEach(v => {
                                tastingHtml += '<span class="detail-tasting-tag">' + escapeHtml(v) + '</span>';
                            });
                        } else {
                            tastingHtml += '<span class="detail-tasting-tag">' + escapeHtml(val) + '</span>';
                        }
                        tastingHtml += '</div></div>';
                    });
                    // 카테고리별 추가 노트
                    if (td.notes && td.notes[catId]) {
                        tastingHtml += '<div class="detail-tasting-sub" style="margin-top:6px;"><div class="detail-value" style="font-size:0.85rem;color:var(--text-secondary);font-style:italic;">📝 ' + escapeHtml(td.notes[catId]) + '</div></div>';
                    }
                    tastingHtml += '</div>';
                });
                // notes만 있고 categories에 없는 항목도 표시
                if (td.notes) {
                    Object.entries(td.notes).forEach(([catId, noteVal]) => {
                        if (!td.categories[catId]) {
                            const catInfo = catMap[catId];
                            if (!catInfo) return;
                            tastingHtml += '<div class="detail-tasting-section">';
                            tastingHtml += '<div class="detail-tasting-cat-title">' + catInfo.icon + ' ' + escapeHtml(catInfo.ko) + '</div>';
                            tastingHtml += '<div class="detail-tasting-sub"><div class="detail-value" style="font-size:0.85rem;color:var(--text-secondary);font-style:italic;">📝 ' + escapeHtml(noteVal) + '</div></div>';
                            tastingHtml += '</div>';
                        }
                    });
                }
            }
        } catch(e) { /* not JSON, old format */ }
    }

    // 구 형식: 숫자 기반 평가
    if (!isNewFormat) {
        tastingHtml += `
            <div class="section-title">색조</div>
            <div class="detail-section"><div class="detail-label">색감</div><div class="detail-value">${note.clarity_rating || '-'} / 5</div></div>
            <div class="detail-section"><div class="detail-label">투명도</div><div class="detail-value">${note.transparency || '-'} / 5</div></div>
            <div class="detail-section"><div class="detail-label">점도</div><div class="detail-value">${note.viscosity || '-'} / 5</div></div>
            <div class="section-title">향</div>
            <div class="detail-section"><div class="detail-label">향기의 강도</div><div class="detail-value">${note.aroma_intensity || '-'} / 5</div></div>
            <div class="detail-section"><div class="detail-label">복잡성</div><div class="detail-value">${note.complexity_aroma || '-'} / 5</div></div>
            <div class="detail-section"><div class="detail-label">선명도</div><div class="detail-value">${note.sharpness || '-'} / 5</div></div>
            <div class="section-title">맛</div>
            <div class="detail-section"><div class="detail-label">맛의 강도</div><div class="detail-value">${note.flavor || '-'} / 5</div></div>
            <div class="detail-section"><div class="detail-label">복잡성</div><div class="detail-value">${note.complexity_taste || '-'} / 5</div></div>
            <div class="detail-section"><div class="detail-label">산미</div><div class="detail-value">${note.acidity || '-'} / 5</div></div>
            <div class="detail-section"><div class="detail-label">애프터 테이스트</div><div class="detail-value">${note.aftertaste || '-'} / 5</div></div>
        `;
        if (note.dominant_aroma) tastingHtml += `<div class="detail-section"><div class="detail-label">주체가 되는 향</div><div class="detail-value">${escapeHtml(note.dominant_aroma)}</div></div>`;
        if (note.dominant_taste) tastingHtml += `<div class="detail-section"><div class="detail-label">주체가 되는 맛</div><div class="detail-value">${escapeHtml(note.dominant_taste)}</div></div>`;
        if (note.flavor_description) tastingHtml += `<div class="detail-section"><div class="detail-label">향미 서술</div><div class="detail-value">${escapeHtml(note.flavor_description)}</div></div>`;
    }

    return `
        ${note.photo && sanitizePhotoUrl(note.photo) ? `<img src="${sanitizePhotoUrl(note.photo)}" class="detail-photo" alt="사케">` : ''}
        <h2 style="color: var(--accent-primary, #383961); margin-bottom: 10px;">${escapeHtml(note.sake_name)}</h2>
        <p style="color: #666; margin-bottom: 30px;">📅 ${escapeHtml(note.date)}</p>

        ${tastingHtml}

        ${note.personal_review ? `
        <div class="section-title">개인적인 감상평</div>
        <div class="detail-section">
            <div class="detail-value">${escapeHtml(note.personal_review)}</div>
        </div>
        ` : ''}

        <div class="section-title">종합 평점</div>
        <div class="detail-section" style="text-align: center;">
            <div style="font-size: 3em; color: var(--accent-primary, #383961); font-weight: bold;">
                ${note.overall_rating || '-'}<span style="font-size: 0.4em; color: #888;">/10</span>
            </div>
            <div style="margin-top: 10px; color: #666;">
                ${note.overall_rating >= 9 ? '🌟 인생 사케!' :
                  note.overall_rating >= 7 ? '👍 추천해요!' :
                  note.overall_rating >= 5 ? '😊 괜찮아요' :
                  note.overall_rating >= 3 ? '😐 그저 그래요' :
                  note.overall_rating ? '👎 별로예요' : '평점 없음'}
            </div>
        </div>

        <button class="edit-btn" onclick="editNote('${note.id}')">✏️ 수정</button>
        <button class="delete-btn" onclick="deleteNote('${note.id}')">🗑️ 삭제</button>
    `;
}

async function showDetail(id) {
    if (!currentUser) {
        alert('⚠️ 노트를 보려면 로그인이 필요합니다.');
        showAuthContainer();
        return;
    }

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('detailView').classList.add('active');

    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = '<div class="loading">노트를 불러오는 중</div>';

    try {
        const { data: note, error } = await supabaseClient
            .from('tasting_notes')
            .select('*')
            .eq('id', id)
            .eq('user_id', currentUser.id)
            .single();

        if (error) throw error;

        detailContent.innerHTML = renderNoteDetail(note);
    } catch (error) {
        detailContent.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon">❌</div>
            <h3>노트를 불러올 수 없습니다</h3>
            <p>${escapeHtml(error.message)}</p>
        </div>`;
    }
}

// 노트 수정
async function editNote(id) {
    try {
        const { data: note, error } = await supabaseClient
            .from('tasting_notes')
            .select('*')
            .eq('id', id)
            .eq('user_id', currentUser.id)
            .single();

        if (error) throw error;

        editingNoteId = id;
        switchTab('new');

        document.getElementById('date').value = note.date;
        setSakeNameFromNote(note.sake_name);
        
        if (note.photo && sanitizePhotoUrl(note.photo)) {
            currentPhotoData = note.photo;
            document.getElementById('uploadText').style.display = 'none';
            document.getElementById('photoPreview').innerHTML =
                `<img src="${sanitizePhotoUrl(note.photo)}" alt="사케 사진">`;
        }

        setRadioValue('overall_rating', note.overall_rating || 5);

        // 새로운 태그 기반 테이스팅 데이터 로드
        resetTastingUI();
        if (note.flavor_description) {
            loadTastingDataToForm(note.flavor_description);
        }

        document.getElementById('personal_review').value = note.personal_review || '';

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = '수정 완료';

        window.scrollTo(0, 0);
    } catch (error) {
        alert('❌ 노트를 불러올 수 없습니다: ' + error.message);
    }
}

// 노트 삭제
async function deleteNote(id) {
    if (confirm('정말 이 테이스팅 노트를 삭제하시겠습니까?')) {
        try {
            const { error } = await supabaseClient
                .from('tasting_notes')
                .delete()
                .eq('id', id)
                .eq('user_id', currentUser.id);

            if (error) throw error;

            alert('✅ 노트가 삭제되었습니다.');
            switchTab('list');
        } catch (error) {
            alert('❌ 삭제 실패: ' + error.message);
        }
    }
}

// 초기화
loadTheme();
checkAuth();
setDefaultDate();
loadAndMergeCustomSakes().then(() => initSakeSelector());
checkFeaturedVisibility();

// Policy page display function (content in policy_pages.js)
function showPolicyPage(type) {
    const policyView = document.getElementById('policyView');
    const policyContent = document.getElementById('policyContent');
    const policyBackBtn = document.getElementById('policyBackBtn');

    const pageFn = POLICY_PAGES[type];
    if (!pageFn) return;

    policyContent.innerHTML = pageFn();
    policyView.style.display = 'block';
    policyBackBtn.onclick = hidePolicyPage;
    policyView.scrollTop = 0;
}

function hidePolicyPage() {
    document.getElementById('policyView').style.display = 'none';
}

// 사케 가이드 페이지 함수 (4번 작업에서 사용될 예정)
function showSakeGuide() {
    showPolicyPage('guide');
}

// 모바일 터치 드롭다운 (hover 대신 tap으로 토글)
(function() {
    if (!('ontouchstart' in window)) return;
    document.querySelectorAll('.top-nav-section, .footer-nav-section').forEach(function(section) {
        section.addEventListener('click', function(e) {
            var dropdown = section.querySelector('.top-nav-dropdown, .footer-dropdown');
            if (!dropdown) return;
            var isOpen = section.classList.contains('nav-open');
            // 다른 열린 메뉴 닫기
            document.querySelectorAll('.nav-open').forEach(function(s) { s.classList.remove('nav-open'); });
            if (!isOpen) {
                section.classList.add('nav-open');
                e.stopPropagation();
            }
        });
    });
    document.addEventListener('click', function() {
        document.querySelectorAll('.nav-open').forEach(function(s) { s.classList.remove('nav-open'); });
    });
})();


