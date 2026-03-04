// Supabase 초기화
const SUPABASE_URL = 'https://atgfrwohilgucmheyuzu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2Zyd29oaWxndWNtaGV5dXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjAyNTUsImV4cCI6MjA4NTIzNjI1NX0.CoyHTds_3BRl5p6wAehlqaevrdkqp1BzymnTnqhzy2Y';

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentPhotoData = null;
let currentPhotoBackData = null;
let editingNoteId = null;
let currentCertPhotoData = null;
let approvedCertsMap = {};
let approvedCertsLastLoaded = 0;
let communityLastTab = 'community';

// 등급 한글→일본어 매핑 (OCR/AI 매칭 공용)
const GRADE_JP_MAP = {
    '다이긴죠': '大吟醸', '준마이다이긴죠': '純米大吟醸',
    '긴죠': '吟醸', '준마이긴죠': '純米吟醸',
    '준마이': '純米', '혼죠조': '本醸造',
    '도쿠베츠준마이': '特別純米', '도쿠베츠혼죠조': '特別本醸造',
    '토쿠베츠준마이': '特別純米', '토쿠베츠혼죠조': '特別本醸造'
};

// === 테이스팅 태그 시스템 ===
let tastingSelections = {}; // { "aroma": { "과일 계열": ["사과","배"], ... }, ... }
let tastingRadioSelections = {}; // { "body_무게감": "미디엄 바디", ... }
let tastingCategoryNotes = {}; // { "aroma": "추가 메모", ... }
let tastingMainTags = {}; // { "aroma": "바나나", "taste": "깔끔함", ... } 카테고리당 메인 태그 1개
let activeTastingCategory = 'aroma';

// 슬라이더 동그라미 안 점수 위치 업데이트
function updateThumbVal(input, sid) {
    var val = input.value;
    var thumb = document.getElementById('thumb_' + sid);
    if (!thumb) return;
    thumb.textContent = val;
    // 0~5 → 0%~100% (thumb 22px 보정: 가장자리에서 11px 안쪽)
    var pct = val / 5 * 100;
    thumb.style.left = 'calc(' + pct + '% + ' + (11 - pct * 0.22) + 'px)';
    // 슬라이더 변경 시 플레이버 휠 업데이트
    if (typeof updateWheelVisuals === 'function') updateWheelVisuals();
}

// 슬라이더 ↔ 서브카테고리 매핑
var PROFILE_SLIDER_MAP = {
    'aroma_과일/꽃 계열': { id: 'aroma_fruit', valId: 'sliderAromaFruitVal', label: '과일/꽃 향', left: '약함', right: '강함' },
    'aroma_유제품 계열':  { id: 'aroma_dairy', valId: 'sliderAromaDairyVal', label: '유제품 향', left: '약함', right: '강함' },
    'aroma_곡물/기타 계열': { id: 'aroma_grain', valId: 'sliderAromaGrainVal', label: '곡물/기타 향', left: '약함', right: '강함' },
    'taste_단맛':         { id: 'sweetness', valId: 'sliderSweetnessVal', label: '단맛', left: '드라이', right: '스위트' },
    'taste_신맛':         { id: 'acidity', valId: 'sliderAcidityVal', label: '신맛', left: '부드러움', right: '쨍함' },
    'taste_감칠맛':       { id: 'umami', valId: 'sliderUmamiVal', label: '감칠맛', left: '옅음', right: '깊음' }
};


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

            // 슬라이더 매핑 확인
            var sliderKey = cat.id + '_' + subName;
            var sliderCfg = PROFILE_SLIDER_MAP[sliderKey];

            if (sliderCfg) {
                // 라벨 + 슬라이더(1~5 눈금)를 한 줄로
                var sid = sliderCfg.id;
                const labelRow = document.createElement('div');
                labelRow.className = 'tasting-sub-label tasting-sub-label-with-slider';
                labelRow.innerHTML =
                    '<span class="sub-label-text">' + subName + '</span>' +
                    '<div class="profile-slider-compact">' +
                        '<span class="profile-label-left">' + sliderCfg.left + '</span>' +
                        '<div class="profile-slider-track-wrap">' +
                            '<input type="range" id="slider_' + sid + '" class="profile-range" min="0" max="5" value="0" step="1" oninput="updateThumbVal(this,\'' + sid + '\')">' +
                            '<span class="profile-thumb-val" id="thumb_' + sid + '" style="left:calc(0% + 11px)">0</span>' +
                            '<div class="profile-slider-ticks"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>' +
                        '</div>' +
                        '<span class="profile-label-right">' + sliderCfg.right + '</span>' +
                    '</div>';
                section.appendChild(labelRow);
            } else {
                const label = document.createElement('div');
                label.className = 'tasting-sub-label';
                label.textContent = subName;
                section.appendChild(label);
            }

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
    if (typeof generateFlavorWheel === 'function') generateFlavorWheel();
    // 모든 슬라이더 thumb 초기 위치/값 세팅
    Object.keys(PROFILE_SLIDER_MAP).forEach(function(k) {
        var s = PROFILE_SLIDER_MAP[k];
        var inp = document.getElementById('slider_' + s.id);
        if (inp) updateThumbVal(inp, s.id);
    });
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
    const isMain = tastingMainTags[catId] === expr;

    if (isMain) {
        // 메인 태그 클릭 → 선택 해제
        arr.splice(idx, 1);
        el.classList.remove('selected', 'main-tag');
        delete tastingMainTags[catId];
    } else if (idx >= 0) {
        // 이미 선택된 태그 클릭 → 메인으로 설정
        // 기존 메인 태그 해제
        if (tastingMainTags[catId]) {
            document.querySelectorAll('.tasting-tag[data-cat-id="' + catId + '"].main-tag').forEach(t => {
                t.classList.remove('main-tag');
            });
        }
        tastingMainTags[catId] = expr;
        el.classList.add('main-tag');
    } else {
        // 미선택 태그 클릭 → 선택
        arr.push(expr);
        el.classList.add('selected');
    }
    if (arr.length === 0) delete tastingSelections[catId][subCat];

    updateTastingBadges();
    updateTastingSummary();
    if (typeof updateWheelVisuals === 'function') updateWheelVisuals();
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
    if (typeof updateWheelVisuals === 'function') updateWheelVisuals();
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
    if (typeof updateWheelVisuals === 'function') updateWheelVisuals();
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
    // 메인 태그 저장
    if (Object.keys(tastingMainTags).length > 0) {
        data.mainTags = { ...tastingMainTags };
    }
    // 맛 프로파일 슬라이더
    const getSliderVal = (id) => { const el = document.getElementById(id); return el ? parseInt(el.value) : 0; };
    data.sliders = {
        aroma_fruit: getSliderVal('slider_aroma_fruit'),
        aroma_dairy: getSliderVal('slider_aroma_dairy'),
        aroma_grain: getSliderVal('slider_aroma_grain'),
        sweetness: getSliderVal('slider_sweetness'),
        acidity: getSliderVal('slider_acidity'),
        umami: getSliderVal('slider_umami')
    };
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

    // 메인 태그 복원
    tastingMainTags = {};
    if (data.mainTags) {
        Object.entries(data.mainTags).forEach(([catId, mainExpr]) => {
            tastingMainTags[catId] = mainExpr;
            document.querySelectorAll('.tasting-tag[data-cat-id="' + catId + '"]').forEach(el => {
                if (el.dataset.expr === mainExpr) el.classList.add('main-tag');
            });
        });
    }

    // 카테고리별 노트 복원
    Object.entries(data.notes || {}).forEach(([catId, noteVal]) => {
        tastingCategoryNotes[catId] = noteVal;
        const noteEl = document.getElementById('catNote_' + catId);
        if (noteEl) noteEl.value = noteVal;
    });

    // 맛 프로파일 슬라이더 복원
    var sliders = data.sliders || {};
    var sliderKeys = ['aroma_fruit', 'aroma_dairy', 'aroma_grain', 'sweetness', 'acidity', 'umami'];
    // 이전 단일 aroma 값 → 3종으로 마이그레이션
    if (sliders.aroma && !sliders.aroma_fruit) {
        sliders.aroma_fruit = sliders.aroma;
        sliders.aroma_dairy = 0;
        sliders.aroma_grain = 0;
    }
    sliderKeys.forEach(function(key) {
        var val = (sliders[key] !== undefined && sliders[key] !== null) ? sliders[key] : 0;
        var el = document.getElementById('slider_' + key);
        if (el) el.value = val;
    });

    updateTastingBadges();
    updateTastingSummary();
    if (typeof updateWheelVisuals === 'function') updateWheelVisuals();
}

function resetTastingUI() {
    tastingSelections = {};
    tastingRadioSelections = {};
    tastingCategoryNotes = {};
    tastingMainTags = {};
    TASTING_CATEGORIES.forEach(c => { tastingSelections[c.id] = {}; });
    document.querySelectorAll('.tasting-tag.selected, .tasting-tag.main-tag, .tasting-radio.selected').forEach(el => el.classList.remove('selected', 'main-tag'));
    TASTING_CATEGORIES.forEach(c => {
        const noteEl = document.getElementById('catNote_' + c.id);
        if (noteEl) noteEl.value = '';
    });
    // 맛 프로파일 슬라이더 초기화
    ['aroma_fruit', 'aroma_dairy', 'aroma_grain', 'sweetness', 'acidity', 'umami'].forEach(function(key) {
        var el = document.getElementById('slider_' + key);
        if (el) el.value = 0;
        var thumb = document.getElementById('thumb_' + key);
        if (thumb) { thumb.textContent = '0'; thumb.style.left = '0%'; }
    });
    updateTastingBadges();
    updateTastingSummary();
    if (typeof updateWheelVisuals === 'function') updateWheelVisuals();
    switchTastingCategory('aroma');
}


// 페이지 로드 시 인증 상태 확인
async function checkAuth() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
        }
    } catch (err) {
        console.error('Auth check failed:', err);
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
        document.getElementById('loginBtn').style.display = 'none';
        var profileWrapper = document.getElementById('profileMenuWrapper');
        if (profileWrapper) profileWrapper.style.display = 'block';
        updateProfileUI();
        loadNotes();
        updateSidebar();
        loadPendingSakes();
        submitPendingCert();
    } else {
        document.getElementById('loginBtn').style.display = 'inline-block';
        var profileWrapper = document.getElementById('profileMenuWrapper');
        if (profileWrapper) profileWrapper.style.display = 'none';
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
        const signupGender = document.getElementById('signupGender').value || null;
        const signupAge = document.getElementById('signupAge').value || null;
        const drinkPrefChecked = document.querySelectorAll('input[name="drinkPref"]:checked');
        const drinkPref = drinkPrefChecked.length > 0 ? Array.from(drinkPrefChecked).map(function(c) { return c.value; }) : null;
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: { gender: signupGender, age_group: signupAge, drink_pref: drinkPref }
            }
        });

        if (error) throw error;

        // 자격증 정보가 있으면 localStorage에 임시 저장 (이메일 인증 후 첫 로그인 시 제출)
        const certToggle = document.getElementById('signupCertToggle');
        if (certToggle && certToggle.checked && currentCertPhotoData) {
            const certType = document.getElementById('signupCertType').value;
            if (certType) {
                localStorage.setItem('pendingCert', JSON.stringify({
                    cert_type: certType,
                    cert_photo: currentCertPhotoData
                }));
            }
        }
        currentCertPhotoData = null;

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

// ═══════════════════════════════════════════════
// 프로필 드롭다운 메뉴
// ═══════════════════════════════════════════════

let _profileData = null; // profiles 테이블에서 불러온 데이터 캐시
let _nickCheckTimer = null;

// ═══════════════════════════════════════════════
// 커뮤니티 닉네임 맵
// ═══════════════════════════════════════════════
let _displayNameMap = {};

async function loadDisplayNames(userIds) {
    const missing = userIds.filter(id => id && !(id in _displayNameMap));
    if (missing.length === 0) return;
    try {
        const { data } = await supabaseClient
            .from('profiles')
            .select('user_id, display_name')
            .in('user_id', missing);
        if (data) data.forEach(r => { _displayNameMap[r.user_id] = r.display_name || ''; });
    } catch (e) {
        console.error('loadDisplayNames error:', e);
    }
}

function toggleProfileDropdown() {
    var dropdown = document.getElementById('profileDropdown');
    var trigger = document.getElementById('profileTrigger');
    if (!dropdown) return;
    var isOpen = dropdown.classList.contains('open');
    if (isOpen) {
        closeProfileDropdown();
    } else {
        dropdown.classList.add('open');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        loadProfileForm();
    }
}

function closeProfileDropdown() {
    var dropdown = document.getElementById('profileDropdown');
    var trigger = document.getElementById('profileTrigger');
    if (dropdown) dropdown.classList.remove('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

// 프로필 폼에 현재 값 채우기
async function loadProfileForm() {
    if (!currentUser) return;

    // profiles 테이블에서 로드 (캐시 없으면)
    if (!_profileData) {
        try {
            var { data } = await supabaseClient
                .from('profiles')
                .select('display_name, gender, age_group, drink_pref')
                .eq('user_id', currentUser.id)
                .single();
            _profileData = data || {};
        } catch (e) {
            _profileData = {};
        }
    }

    // user_metadata에서 fallback
    var meta = currentUser.user_metadata || {};
    var nick = _profileData.display_name || meta.display_name || '';
    var gender = _profileData.gender || meta.gender || '';
    var age = _profileData.age_group || meta.age_group || '';
    var drinks = _profileData.drink_pref || meta.drink_pref || [];

    document.getElementById('displayNameInput').value = nick;
    document.getElementById('profileGender').value = gender;
    document.getElementById('profileAge').value = age;

    // 주류 취향 체크박스
    document.querySelectorAll('input[name="profileDrink"]').forEach(function(cb) {
        cb.checked = Array.isArray(drinks) && drinks.indexOf(cb.value) !== -1;
    });

    // 닉네임 상태 초기화
    document.getElementById('nickStatus').textContent = '';
}

// 닉네임 입력 시 실시간 중복 체크 (debounce)
document.addEventListener('input', function(e) {
    if (e.target.id !== 'displayNameInput') return;
    clearTimeout(_nickCheckTimer);
    var statusEl = document.getElementById('nickStatus');
    var name = e.target.value.trim();
    if (!name) { statusEl.textContent = ''; statusEl.className = 'profile-nick-status'; return; }
    statusEl.textContent = '확인 중...';
    statusEl.className = 'profile-nick-status checking';
    _nickCheckTimer = setTimeout(function() { checkNickname(name); }, 400);
});

async function checkNickname(name) {
    var statusEl = document.getElementById('nickStatus');
    if (!currentUser || !name) return;
    try {
        var { data, error } = await supabaseClient
            .from('profiles')
            .select('user_id')
            .eq('display_name', name)
            .neq('user_id', currentUser.id)
            .limit(1);
        if (error) throw error;
        if (data && data.length > 0) {
            statusEl.textContent = '이미 사용 중인 닉네임입니다';
            statusEl.className = 'profile-nick-status error';
        } else {
            statusEl.textContent = '사용 가능한 닉네임입니다';
            statusEl.className = 'profile-nick-status ok';
        }
    } catch (e) {
        statusEl.textContent = '';
        statusEl.className = 'profile-nick-status';
    }
}

// 전체 프로필 저장
async function saveProfile() {
    if (!currentUser) return;

    var displayName = document.getElementById('displayNameInput').value.trim();
    var gender = document.getElementById('profileGender').value;
    var age = document.getElementById('profileAge').value;
    var drinks = [];
    document.querySelectorAll('input[name="profileDrink"]:checked').forEach(function(cb) {
        drinks.push(cb.value);
    });

    // 닉네임 검증
    if (displayName.length > 20) {
        alert('닉네임은 20자 이하로 입력해주세요.');
        return;
    }

    var btn = document.getElementById('profileSaveBtn');
    btn.disabled = true;

    try {
        // 1) 닉네임 중복 체크
        if (displayName) {
            var { data: dup } = await supabaseClient
                .from('profiles')
                .select('user_id')
                .eq('display_name', displayName)
                .neq('user_id', currentUser.id)
                .limit(1);
            if (dup && dup.length > 0) {
                alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
                btn.disabled = false;
                return;
            }
        }

        // 2) profiles 테이블 UPSERT
        var { error: profileErr } = await supabaseClient
            .from('profiles')
            .upsert({
                user_id: currentUser.id,
                display_name: displayName || null,
                gender: gender || null,
                age_group: age || null,
                drink_pref: drinks.length > 0 ? drinks : null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        if (profileErr) throw profileErr;

        // 3) user_metadata도 동기화
        var { data: authData, error: authErr } = await supabaseClient.auth.updateUser({
            data: { display_name: displayName, gender: gender, age_group: age, drink_pref: drinks }
        });
        if (authErr) throw authErr;

        currentUser = authData.user;
        _profileData = { display_name: displayName, gender: gender, age_group: age, drink_pref: drinks };
        updateProfileUI();

        // 성공 피드백
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">done_all</span> 저장 완료';
        setTimeout(function() {
            btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">save</span> 저장';
            btn.disabled = false;
        }, 1500);

    } catch (e) {
        var msg = e.message || '';
        if (msg.indexOf('duplicate') !== -1 || msg.indexOf('unique') !== -1) {
            alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
        } else {
            alert('프로필 저장 실패: ' + msg);
        }
        btn.disabled = false;
    }
}

function updateProfileUI() {
    if (!currentUser) return;

    var meta = currentUser.user_metadata || {};
    var displayName = meta.display_name || '';
    var email = currentUser.email || '';
    var initial = (displayName || email).charAt(0).toUpperCase();

    // 헤더 트리거 텍스트 (닉네임 또는 이메일)
    var triggerName = document.getElementById('profileTriggerName');
    if (triggerName) triggerName.textContent = displayName || email;

    // 드롭다운 아바타
    var dropdownAvatar = document.getElementById('dropdownAvatarLetter');
    if (dropdownAvatar) dropdownAvatar.textContent = initial;

    // 드롭다운 닉네임
    var nameEl = document.getElementById('dropdownDisplayName');
    if (nameEl) nameEl.textContent = displayName || email.split('@')[0];

    // 드롭다운 이메일
    var emailEl = document.getElementById('dropdownEmail');
    if (emailEl) emailEl.textContent = email;
}

// 드롭다운 바깥 클릭 / Escape로 닫기
document.addEventListener('click', function(e) {
    var wrapper = document.getElementById('profileMenuWrapper');
    if (!wrapper) return;
    if (!wrapper.contains(e.target)) {
        closeProfileDropdown();
    }
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProfileDropdown();
    }
});


// 사진 업로드 공통 핸들러
function _handlePhoto(event, setData, uploadTextId, previewId, altText) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        alert('사진 크기는 5MB 이하만 가능합니다.');
        event.target.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = async function(e) {
        var compressed = await compressImageForUpload(e.target.result);
        setData(compressed);
        document.getElementById(uploadTextId).style.display = 'none';
        document.getElementById(previewId).innerHTML =
            `<img src="${sanitizePhotoUrl(compressed)}" alt="${altText}">`;
    };
    reader.readAsDataURL(file);
}

function handlePhotoUpload(event) {
    _handlePhoto(event, v => { currentPhotoData = v; }, 'uploadText', 'photoPreview', '사케 사진 앞면');
}

function handlePhotoBackUpload(event) {
    _handlePhoto(event, v => { currentPhotoBackData = v; }, 'uploadBackText', 'photoBackPreview', '사케 사진 뒷면');
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

        const elTotal = document.getElementById('sidebarTotalCount');
        const elMonth = document.getElementById('sidebarMonthCount');
        const elBar = document.getElementById('sidebarProgressBar');
        if (elTotal) elTotal.textContent = total;
        if (elMonth) elMonth.textContent = monthCount;
        const goal = 10;
        if (elBar) elBar.style.width = Math.min(monthCount / goal * 100, 100) + '%';

        const recent = data.slice(0, 3);
        const container = document.getElementById('sidebarRecentNotes');
        if (!container || recent.length === 0) return;
        container.innerHTML = recent.map(n => {
            const date = new Date(n.created_at);
            const daysAgo = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            const timeText = daysAgo === 0 ? '오늘' : daysAgo + '일 전';
            const stars = '★'.repeat(Math.min(Math.round((n.overall_rating || 50) / 20), 5));
            return `<div onclick="showDetail('${escapeAttr(n.id)}')" style="display:flex;gap:12px;padding:12px;background:var(--card-bg);border:1px solid var(--border-card);border-radius:12px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='var(--accent-gold)';this.style.boxShadow='0 2px 8px rgba(56,57,97,0.08)'" onmouseout="this.style.borderColor='var(--border-card)';this.style.boxShadow='none'">
                <div style="width:48px;height:48px;border-radius:8px;background:var(--bg-muted);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.5em;overflow:hidden;">${n.photo ? `<img src="${sanitizePhotoUrl(getTransformedPhotoUrl(n.photo, 96, 96))}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : '🍶'}</div>
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
    const isEditing = !!editingNoteId;
    const photoFront = currentPhotoData;
    const photoBack = currentPhotoBackData;

    const noteData = {
        user_id: currentUser.id,
        date: document.getElementById('date').value,
        photo: null,
        photo_back: null,
        sake_name: sakeNameVal.trim(),
        flavor_description: JSON.stringify(tastingData),
        personal_review: document.getElementById('personal_review').value,
        repurchase: (document.querySelector('input[name="repurchase"]:checked') || {}).value || null,
        price_range: (document.querySelector('input[name="priceRange"]:checked') || {}).value || null,
        overall_rating: parseInt(document.getElementById('overall_rating_slider').value)
    };

    // 편집 시: URL이면 유지, base64면 나중에 업로드
    if (isEditing) {
        noteData.photo = (photoFront && !photoFront.startsWith('data:')) ? photoFront : null;
        noteData.photo_back = (photoBack && !photoBack.startsWith('data:')) ? photoBack : null;
    }

    try {
        var savedNoteId;
        if (isEditing) {
            // 수정
            const { error } = await supabaseClient
                .from('tasting_notes')
                .update(noteData)
                .eq('id', editingNoteId)
                .eq('user_id', currentUser.id);

            if (error) throw error;
            savedNoteId = editingNoteId;
            editingNoteId = null;
        } else {
            // 새로 생성
            const { data: inserted, error } = await supabaseClient
                .from('tasting_notes')
                .insert([noteData])
                .select('id')
                .single();

            if (error) throw error;
            savedNoteId = inserted.id;
        }

        // base64 사진이 있으면 Storage에 업로드 후 URL로 UPDATE
        var photoUpdates = {};
        if (photoFront && photoFront.startsWith('data:')) {
            var frontUrl = await uploadPhotoToStorage(photoFront, savedNoteId, 'front');
            if (frontUrl) photoUpdates.photo = frontUrl;
        }
        if (photoBack && photoBack.startsWith('data:')) {
            var backUrl = await uploadPhotoToStorage(photoBack, savedNoteId, 'back');
            if (backUrl) photoUpdates.photo_back = backUrl;
        }
        if (Object.keys(photoUpdates).length > 0) {
            await supabaseClient.from('tasting_notes')
                .update(photoUpdates)
                .eq('id', savedNoteId);
        }

        alert(isEditing ? '✅ 테이스팅 노트가 수정되었습니다!' : '✅ 테이스팅 노트가 저장되었습니다!');
        _feedCache = null; // 피드 캐시 무효화

        // 뒷면 라벨 자동 분석: DB에 없는 사케 + 뒷면 사진이 있으면
        if (sakeInputMode === 'manual' && photoBack && !isEditing) {
            triggerBackLabelAnalysis(photoBack, sakeNameVal.trim());
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
    currentPhotoBackData = null;
    ocrPhotoData = null;
    editingNoteId = null;
    document.getElementById('uploadText').style.display = 'block';
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('uploadBackText').style.display = 'block';
    document.getElementById('photoBackPreview').innerHTML = '';

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = '노트 저장';

    resetSakeSelector();
    resetTastingUI();
}

// 테이스팅 UI 초기화 (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function() {
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
    return new Promise(function(resolve, reject) {
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
        img.onerror = function() { reject(new Error('이미지를 로드할 수 없습니다.')); };
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

// DB 검색 공통 — 브랜드/제품 반복·결과 수집·정렬을 한 곳에서 처리
function searchSakeDatabase(brandScoreFn, productScoreFn) {
    if (typeof SAKE_DATABASE === 'undefined') return [];
    var results = [];
    for (var brand in SAKE_DATABASE) {
        var entry = SAKE_DATABASE[brand];
        var brandJp = entry.brandJp || '';
        var brandScore = brandScoreFn(brand, brandJp, entry);
        if (brandScore === 0) continue;

        var products = entry.products;
        for (var pi = 0; pi < products.length; pi++) {
            var productScore = productScoreFn(brandScore, products[pi], brandJp);
            if (productScore > 20) {
                results.push({
                    brand: brand,
                    brandJp: brandJp,
                    productIdx: pi,
                    product: products[pi],
                    score: Math.min(productScore, 100)
                });
            }
        }
    }
    results.sort(function(a, b) { return b.score - a.score; });
    return results.slice(0, 5);
}

// AI 결과로 DB 매칭
function matchAiResultToDatabase(aiResult) {
    var aiBrand = (aiResult.brand || '').trim();
    var aiProduct = (aiResult.product || '').trim();
    var aiGrade = (aiResult.grade || '').trim();

    return searchSakeDatabase(
        function(brand, brandJp) {
            var score = 0;
            if (aiBrand && brandJp) {
                if (aiBrand === brandJp || brandJp.includes(aiBrand) || aiBrand.includes(brandJp)) {
                    score = 60;
                } else {
                    var bm = fuzzyContains(aiBrand, brandJp);
                    if (bm.found) score = Math.round(bm.score * 50);
                }
            }
            if (score === 0 && aiBrand) {
                if (brand.toLowerCase().includes(aiBrand.toLowerCase()) ||
                    aiBrand.toLowerCase().includes(brand.toLowerCase())) {
                    score = 30;
                }
            }
            return score;
        },
        function(brandScore, p, brandJp) {
            var productScore = brandScore;
            var jpName = p.japanese || '';
            if (aiProduct && jpName) {
                if (aiProduct === jpName || jpName.includes(aiProduct) || aiProduct.includes(jpName)) {
                    productScore += 30;
                } else {
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
            if (aiGrade && p.grade) {
                var gradeJp = GRADE_JP_MAP[p.grade] || '';
                if (gradeJp && (aiGrade === gradeJp || aiGrade.includes(gradeJp) || gradeJp.includes(aiGrade))) {
                    productScore += 10;
                }
            }
            return productScore;
        }
    );
}

// 이미지 전처리 (리사이즈 + 그레이스케일 + 대비 강화)
function prepareImageForOcr(base64) {
    return new Promise(function(resolve, reject) {
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
        img.onerror = function() { reject(new Error('이미지를 로드할 수 없습니다.')); };
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
    var normalized = normalizeJapaneseText(ocrText);
    var fullText = normalized;

    var gradeKeywords = ['純米大吟醸', '大吟醸', '純米吟醸', '吟醸', '純米', '本醸造', '特別純米', '特別本醸造'];
    var detectedGrades = [];
    gradeKeywords.forEach(function(g) {
        if (fullText.includes(g)) detectedGrades.push(g);
    });

    return searchSakeDatabase(
        function(brand, brandJp) {
            var score = 0;
            if (brandJp && brandJp.length >= 2) {
                if (fullText.includes(brandJp)) {
                    score = 50;
                } else {
                    var bm = fuzzyContains(fullText, brandJp);
                    if (bm.found) score = Math.round(bm.score * 40);
                }
            }
            if (score === 0) {
                var brandLower = brand.toLowerCase();
                var textLower = fullText.toLowerCase();
                if (textLower.includes(brandLower) && brand.length >= 2) {
                    score = 20;
                }
            }
            return score;
        },
        function(brandScore, p, brandJp) {
            var productScore = brandScore;
            var jpName = p.japanese || '';
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
            if (detectedGrades.length > 0 && p.grade) {
                var gradeJp = GRADE_JP_MAP[p.grade] || '';
                if (gradeJp && detectedGrades.indexOf(gradeJp) >= 0) {
                    productScore += 15;
                }
            }
            return productScore;
        }
    );
}

// OCR 사진 프리뷰 공통 헬퍼
function _showOcrPreview() {
    var previewImg = document.getElementById('ocrPreviewImg');
    previewImg.src = ocrPhotoData;
    previewImg.style.display = 'block';
    document.getElementById('ocrPlaceholder').style.display = 'none';
    document.getElementById('ocrPhotoArea').classList.add('has-photo');
    document.getElementById('ocrStartBtn').disabled = false;
}

// 사진 처리
function handleOcrPhoto(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        ocrPhotoData = e.target.result;
        _showOcrPreview();
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
    if (currentPhotoData && !ocrPhotoData) {
        ocrPhotoData = currentPhotoData;
        _showOcrPreview();
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
        var matches = [];
        var rawText = '';

        if (ocrMethod === 'ai') {
            var aiResult = await runAiVisionOcr(ocrPhotoData);
            // AI Result 로깅 제거
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
            // AI matches 로깅 제거
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
            updateOcrProgress(5, '이미지 전처리 중...');
            var processed = await prepareImageForOcr(ocrPhotoData);
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

// ===== 나의 노트 상태 =====
let currentNotes = [];
let notesSortBy = 'date';
let notesViewMode = 'card';

function sortNotes(by) {
    notesSortBy = by;
    document.querySelectorAll('.notes-sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === by));
    renderNotes();
}

function setNotesView(mode) {
    notesViewMode = mode;
    document.querySelectorAll('.notes-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === mode));
    renderNotes();
}

// 툴바 이벤트 바인딩
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.notes-sort-btn').forEach(btn => {
        btn.addEventListener('click', function() { sortNotes(this.dataset.sort); });
    });
    document.querySelectorAll('.notes-view-btn').forEach(btn => {
        btn.addEventListener('click', function() { setNotesView(this.dataset.view); });
    });
});

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
            .select('id, sake_name, date, overall_rating, flavor_description, dominant_aroma, created_at, photo')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        currentNotes = data || [];
        var toolbar = document.getElementById('notesToolbar');
        if (toolbar) toolbar.style.display = currentNotes.length > 0 ? '' : 'none';
        renderNotes();
    } catch (error) {
        container.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon">❌</div>
            <h3>노트를 불러올 수 없습니다</h3>
            <p>${escapeHtml(error.message)}</p>
        </div>`;
    }
}

// 노트 목록 렌더링 (정렬 + 뷰모드)
function renderNotes() {
    const container = document.getElementById('notesList');
    const notes = currentNotes;

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

    // 정렬
    var sorted = notes.slice();
    if (notesSortBy === 'name') {
        sorted.sort(function(a, b) { return (a.sake_name || '').localeCompare(b.sake_name || '', 'ko'); });
    } else if (notesSortBy === 'rating') {
        sorted.sort(function(a, b) { return (b.overall_rating || 0) - (a.overall_rating || 0); });
    } else {
        sorted.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
    }

    if (notesViewMode === 'compact') {
        container.innerHTML = '<div class="notes-compact-list">' + sorted.map(function(note) {
            var dateStr = '';
            if (note.date) {
                var parts = note.date.split('-');
                dateStr = parts.length >= 3 ? parts[1] + '.' + parts[2] : note.date;
            }
            var tagsHtml = getCompactTags(note);
            var wheelHtml = typeof generateStaticWheelSvg === 'function' ? generateStaticWheelSvg(note.flavor_description, 'mini') : '';
            var ratingHtml = note.overall_rating ? '<span class="notes-compact-rating">' + note.overall_rating + '<span class="notes-compact-rating-max">/100</span></span>' : '';
            return '<div class="notes-compact-item" onclick="showDetail(\'' + escapeAttr(note.id) + '\')">' +
                '<span class="notes-compact-date">' + escapeHtml(dateStr) + '</span>' +
                '<span class="notes-compact-name">' + escapeHtml(note.sake_name) + '</span>' +
                '<span class="notes-compact-tags">' + tagsHtml + '</span>' +
                '<span class="notes-compact-wheel">' + wheelHtml + '</span>' +
                ratingHtml +
            '</div>';
        }).join('') + '</div>';
    } else {
        container.innerHTML = `
            <div class="notes-list">
                ${sorted.map(note => `
                    <div class="note-card" onclick="showDetail('${escapeAttr(note.id)}')">
                        ${note.photo && sanitizePhotoUrl(note.photo) ? `
                            <img src="${sanitizePhotoUrl(getTransformedPhotoUrl(note.photo, 400, 400))}" class="note-card-image" alt="사케" loading="lazy">
                        ` : `
                            <div class="note-card-image">🍶</div>
                        `}
                        <div class="note-card-content">
                            <div class="note-card-header">
                                <div class="note-card-header-text">
                                    <div class="note-card-name">${escapeHtml(note.sake_name)}</div>
                                    <div class="note-card-date">${escapeHtml(note.date)}</div>
                                </div>
                                ${typeof generateStaticWheelSvg === 'function' ? generateStaticWheelSvg(note.flavor_description, 'mini') : ''}
                                ${note.overall_rating ? `<span class="note-card-rating">${note.overall_rating}<span class="note-card-rating-max">/100</span></span>` : ''}
                            </div>
                            <div class="note-card-summary">
                                ${getTastingPreview(note)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// 컴팩트 뷰용 태그 추출
function getCompactTags(note) {
    if (!note.flavor_description) return '';
    try {
        var td = JSON.parse(note.flavor_description);
        if (td && td.version === 2 && td.categories) {
            var tags = [];
            Object.values(td.categories).forEach(function(catData) {
                Object.values(catData).forEach(function(val) {
                    if (Array.isArray(val)) tags.push.apply(tags, val);
                    else tags.push(val);
                });
            });
            return tags.slice(0, 3).map(function(t) { return '<span class="notes-compact-tag">' + escapeHtml(t) + '</span>'; }).join('');
        }
    } catch(e) {}
    return '';
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
let communitySearchTimeout = null;


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
        await loadApprovedCerts();
        const userIds = [...new Set(_feedCache.data.map(n => n.user_id).filter(Boolean))];
        await loadDisplayNames(userIds);
        displayCommunityFeed(_feedCache.data, container, buildAvgMap(_feedCache.data));
        return;
    }

    container.innerHTML = '<div class="loading">커뮤니티 노트를 불러오는 중</div>';

    try {
        const { data, error } = await supabaseClient
            .from('tasting_notes')
            .select('id, sake_name, personal_review, overall_rating, created_at, user_id, flavor_description, photo')
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) throw error;
        _feedCache = { ts: Date.now(), data: data || [] };
        await loadApprovedCerts();
        const userIds = [...new Set((data || []).map(n => n.user_id).filter(Boolean))];
        await loadDisplayNames(userIds);
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
            ? `<div class="community-thumb"><img src="${escapeAttr(getTransformedPhotoUrl(note.photo, 96, 96))}" alt="" loading="lazy" onerror="this.parentElement.classList.add('community-thumb-default');this.parentElement.innerHTML='🍶';"></div>`
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

        // 메인 태그 추출
        let mainTagsHtml = '';
        if (note.flavor_description) {
            try {
                const td = JSON.parse(note.flavor_description);
                if (td.mainTags) {
                    const tags = Object.values(td.mainTags);
                    if (tags.length > 0) {
                        mainTagsHtml = '<div class="community-feed-card-main-tags">' + tags.map(t => '<span class="community-main-tag">' + escapeHtml(t) + '</span>').join('') + '</div>';
                    }
                }
            } catch(e) {}
        }


        return `<div class="community-feed-card" onclick="showCommunityDetail('${escapeAttr(note.id)}')">
            <div class="community-feed-card-header">
                ${thumbHtml}
                <div class="community-feed-card-info">
                    <div class="community-feed-card-name">${escapeHtml(note.sake_name || '이름 없음')}${getCertBadgeHtml(uid)}</div>
                    <div class="community-feed-card-meta">Shared by <span class="community-feed-author" data-tooltip="${escapeAttr(userLabel)} 님의 노트만 보기" onclick="event.stopPropagation(); loadNotesByUser('${escapeAttr(uid)}')">${escapeHtml(userLabel)}</span> · ${timeAgo}</div>
                </div>
                ${typeof generateStaticWheelSvg === 'function' ? generateStaticWheelSvg(note.flavor_description, 'mini') : ''}
                ${ratingDisplay}
            </div>
            ${mainTagsHtml}
            ${truncated ? `<div class="community-feed-card-text">${escapeHtml(truncated)}</div>` : ''}
        </div>`;
    });

    let html = cards.join('');
    if (showMore && notes.length >= 3) {
        html += `<button class="community-feed-more-btn" onclick="loadMoreCommunityFeed(${notes.length})">더보기</button>`;
    }
    container.innerHTML = html;
}

async function loadMoreCommunityFeed(offset) {
    const btn = document.querySelector('.community-feed-more-btn');
    if (btn) btn.textContent = '불러오는 중...';
    try {
        const { data, error } = await supabaseClient
            .from('tasting_notes')
            .select('id, sake_name, personal_review, overall_rating, created_at, user_id, flavor_description, photo')
            .order('created_at', { ascending: false })
            .range(offset, offset + 9);
        if (error) throw error;
        if (!data || data.length === 0) { if (btn) btn.remove(); return; }
        const userIds = [...new Set(data.map(n => n.user_id).filter(Boolean))];
        await loadDisplayNames(userIds);
        const container = document.getElementById('communityFeedList');
        if (btn) btn.remove();
        const avgMap = buildAvgMap(data);
        const tempDiv = document.createElement('div');
        displayCommunityFeed(data, tempDiv, avgMap, false);
        container.insertAdjacentHTML('beforeend', tempDiv.innerHTML);
        if (data.length >= 10) {
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
            ? `<div class="community-thumb" style="width:40px;height:40px;border-radius:6px;"><img src="${escapeAttr(getTransformedPhotoUrl(note.photo, 80, 80))}" alt="" style="width:100%;height:100%;object-fit:cover;"></div>`
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

function renderNoteDetail(note, showActions = true) {
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

                const mainTags = td.mainTags || {};
                tastingHtml += '<div class="section-title">테이스팅 노트</div>';
                if (typeof generateStaticWheelSvg === 'function') {
                    tastingHtml += generateStaticWheelSvg(note.flavor_description, 'full');
                }
                Object.entries(td.categories).forEach(([catId, catData]) => {
                    const catInfo = catMap[catId];
                    if (!catInfo) return;
                    tastingHtml += '<div class="detail-tasting-section">';
                    tastingHtml += '<div class="detail-tasting-cat-title">' + catInfo.icon + ' ' + escapeHtml(catInfo.ko) + '</div>';

                    const catMain = mainTags[catId] || null;

                    // "상황"은 단독 줄, 나머지는 서브카테고리명 없이 태그만 합쳐서 표시
                    const normalTags = [];
                    const separateSubs = {};
                    Object.entries(catData).forEach(([sub, val]) => {
                        const tags = Array.isArray(val) ? val : [val];
                        if (sub === '상황') {
                            separateSubs[sub] = tags;
                        } else {
                            normalTags.push(...tags);
                        }
                    });

                    // 일반 태그 (메인 태그는 맨 앞 + ★ 강조)
                    if (normalTags.length > 0) {
                        if (catMain && normalTags.includes(catMain)) {
                            normalTags.sort((a, b) => (a === catMain ? -1 : b === catMain ? 1 : 0));
                        }
                        tastingHtml += '<div class="detail-tasting-sub"><div class="detail-tasting-tags">';
                        normalTags.forEach(v => {
                            const isMain = (v === catMain);
                            tastingHtml += '<span class="detail-tasting-tag' + (isMain ? ' detail-main-tag' : '') + '">' + escapeHtml(v) + '</span>';
                        });
                        tastingHtml += '</div></div>';
                    }

                    // 단독 줄 서브카테고리 (상황 등)
                    Object.entries(separateSubs).forEach(([sub, tags]) => {
                        tastingHtml += '<div class="detail-tasting-sub">';
                        tastingHtml += '<div class="detail-tasting-tags">';
                        tags.forEach(v => {
                            tastingHtml += '<span class="detail-tasting-tag">' + escapeHtml(v) + '</span>';
                        });
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
            <div class="detail-section"><div class="detail-label">신맛</div><div class="detail-value">${note.acidity || '-'} / 5</div></div>
            <div class="detail-section"><div class="detail-label">애프터 테이스트</div><div class="detail-value">${note.aftertaste || '-'} / 5</div></div>
        `;
        if (note.dominant_aroma) tastingHtml += `<div class="detail-section"><div class="detail-label">주체가 되는 향</div><div class="detail-value">${escapeHtml(note.dominant_aroma)}</div></div>`;
        if (note.dominant_taste) tastingHtml += `<div class="detail-section"><div class="detail-label">주체가 되는 맛</div><div class="detail-value">${escapeHtml(note.dominant_taste)}</div></div>`;
        if (note.flavor_description) tastingHtml += `<div class="detail-section"><div class="detail-label">향미 서술</div><div class="detail-value">${escapeHtml(note.flavor_description)}</div></div>`;
    }

    return `
        ${(note.photo && sanitizePhotoUrl(note.photo)) || (note.photo_back && sanitizePhotoUrl(note.photo_back)) ? `
        <div class="detail-photo-group">
            ${note.photo && sanitizePhotoUrl(note.photo) ? `<img src="${sanitizePhotoUrl(getTransformedPhotoUrl(note.photo, 800))}" class="detail-photo" alt="사케 앞면">` : ''}
            ${note.photo_back && sanitizePhotoUrl(note.photo_back) ? `<img src="${sanitizePhotoUrl(getTransformedPhotoUrl(note.photo_back, 800))}" class="detail-photo" alt="사케 뒷면">` : ''}
        </div>` : ''}
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
                ${note.overall_rating || '-'}<span style="font-size: 0.4em; color: #888;">/100</span>
            </div>
            <div style="margin-top: 10px; color: #666;">
                ${note.overall_rating >= 90 ? '🌟 인생 사케!' :
                  note.overall_rating >= 70 ? '👍 추천해요!' :
                  note.overall_rating >= 50 ? '😊 괜찮아요' :
                  note.overall_rating >= 30 ? '😐 그저 그래요' :
                  note.overall_rating ? '👎 별로예요' : '평점 없음'}
            </div>
        </div>

        ${showActions ? `<button class="edit-btn" onclick="editNote('${escapeAttr(note.id)}')">✏️ 수정</button>
        <button class="delete-btn" onclick="deleteNote('${escapeAttr(note.id)}')">🗑️ 삭제</button>` : ''}
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
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    try {
        const { data: note, error } = await supabaseClient
            .from('tasting_notes')
            .select('*')
            .eq('id', id)
            .eq('user_id', currentUser.id)
            .single();

        if (error) throw error;
        if (!note) {
            alert('본인이 작성한 노트만 수정할 수 있습니다.');
            return;
        }

        editingNoteId = id;
        switchTab('new');

        document.getElementById('date').value = note.date;
        setSakeNameFromNote(note.sake_name);
        
        if (note.photo && sanitizePhotoUrl(note.photo)) {
            currentPhotoData = note.photo;
            document.getElementById('uploadText').style.display = 'none';
            document.getElementById('photoPreview').innerHTML =
                `<img src="${sanitizePhotoUrl(note.photo)}" alt="사케 사진 앞면">`;
        }
        if (note.photo_back && sanitizePhotoUrl(note.photo_back)) {
            currentPhotoBackData = note.photo_back;
            document.getElementById('uploadBackText').style.display = 'none';
            document.getElementById('photoBackPreview').innerHTML =
                `<img src="${sanitizePhotoUrl(note.photo_back)}" alt="사케 사진 뒷면">`;
        }

        const slider = document.getElementById('overall_rating_slider');
        const ratingVal = note.overall_rating || 50;
        slider.value = ratingVal;
        document.getElementById('ratingValue').textContent = ratingVal;

        // 새로운 태그 기반 테이스팅 데이터 로드
        resetTastingUI();
        if (note.flavor_description) {
            loadTastingDataToForm(note.flavor_description);
        }

        document.getElementById('personal_review').value = note.personal_review || '';

        // 재구매의사 / 가격대 복원
        if (note.repurchase) {
            var rp = document.querySelector('input[name="repurchase"][value="' + note.repurchase + '"]');
            if (rp) rp.checked = true;
        }
        if (note.price_range) {
            var pr = document.querySelector('input[name="priceRange"][value="' + note.price_range + '"]');
            if (pr) pr.checked = true;
        }

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
            // Storage 사진 삭제를 위해 먼저 URL 조회
            var { data: note } = await supabaseClient
                .from('tasting_notes')
                .select('photo, photo_back')
                .eq('id', id)
                .eq('user_id', currentUser.id)
                .single();

            if (note) {
                await deletePhotoFromStorage(note.photo);
                await deletePhotoFromStorage(note.photo_back);
            }

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

// ═══════════════════════════════════════════════
// 뒷면 라벨 AI 분석 → pending_sakes
// ═══════════════════════════════════════════════

async function triggerBackLabelAnalysis(photoBackData, sakeName) {
    try {
        var imageToSend = await prepareImageForAi(photoBackData);
        var resp = await supabaseClient.functions.invoke('sake-vision', {
            body: { image: imageToSend }
        });
        if (resp.error) return;

        var data = resp.data;
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch(e) { return; }
        }
        if (!data || data.error) return;

        // pending_sakes용 사진 Storage 업로드
        var pendingPhotoUrl = null;
        if (photoBackData && photoBackData.startsWith('data:image/')) {
            var pendingId = 'pending_' + Date.now();
            pendingPhotoUrl = await uploadPhotoToStorage(photoBackData, pendingId, 'back');
        }

        await supabaseClient.from('pending_sakes').insert([{
            user_id: currentUser.id,
            brand: data.brand || '',
            brand_jp: data.brand || '',
            product_name: sakeName,
            japanese: data.product || '',
            grade: data.grade || '',
            polish_rate: data.polishRate || '',
            alcohol_content: data.alcoholContent || '',
            ingredients: data.ingredients || '',
            brewery: data.brewery || '',
            brewery_jp: data.brewery || '',
            region: data.breweryRegion || '',
            volume: data.volume || '',
            raw_text: data.rawText || '',
            photo_back: pendingPhotoUrl || photoBackData,
            status: 'pending'
        }]);

        console.log('Back label analysis saved to pending_sakes');
    } catch (err) {
        console.error('Back label analysis error:', err);
    }
}

// ═══════════════════════════════════════════════
// 사진 마이그레이션: base64 → Supabase Storage
// ═══════════════════════════════════════════════

// migrateUploadToStorage는 uploadPhotoToStorage(base64, noteId, suffix, userId)로 통합됨

async function migratePhotosToStorage() {
    if (!currentUser) { alert('로그인이 필요합니다.'); return; }
    console.log('=== 사진 마이그레이션 시작 ===');

    // 1. base64 사진이 있는 노트 ID 조회 (경량)
    var { data: frontIds } = await supabaseClient
        .from('tasting_notes').select('id').like('photo', 'data:%');
    var { data: backIds } = await supabaseClient
        .from('tasting_notes').select('id').like('photo_back', 'data:%');
    var idSet = {};
    (frontIds || []).forEach(function(n) { idSet[n.id] = true; });
    (backIds || []).forEach(function(n) { idSet[n.id] = true; });
    var allIds = Object.keys(idSet);

    if (allIds.length === 0) {
        console.log('마이그레이션 대상 없음 — 모든 사진이 이미 Storage URL입니다.');
        return { total: 0, success: 0, failed: 0 };
    }
    console.log('마이그레이션 대상: ' + allIds.length + '건');

    var success = 0, failed = 0;
    for (var i = 0; i < allIds.length; i++) {
        var noteId = allIds[i];
        try {
            var { data: note } = await supabaseClient
                .from('tasting_notes')
                .select('id, user_id, photo, photo_back')
                .eq('id', noteId).single();
            if (!note) { failed++; continue; }

            var updates = {};
            if (note.photo && note.photo.startsWith('data:')) {
                var frontUrl = await uploadPhotoToStorage(note.photo, note.id, 'front', note.user_id);
                if (frontUrl) updates.photo = frontUrl;
                else { failed++; console.error('[' + (i+1) + '/' + allIds.length + '] FAIL front: ' + noteId); continue; }
            }
            if (note.photo_back && note.photo_back.startsWith('data:')) {
                var backUrl = await uploadPhotoToStorage(note.photo_back, note.id, 'back', note.user_id);
                if (backUrl) updates.photo_back = backUrl;
                else { failed++; console.error('[' + (i+1) + '/' + allIds.length + '] FAIL back: ' + noteId); continue; }
            }

            if (Object.keys(updates).length > 0) {
                var { error: updateErr } = await supabaseClient
                    .from('tasting_notes').update(updates).eq('id', noteId);
                if (updateErr) { failed++; console.error('[' + (i+1) + '/' + allIds.length + '] DB update fail:', updateErr); continue; }
            }
            success++;
            console.log('[' + (i+1) + '/' + allIds.length + '] OK: ' + noteId);
        } catch (e) {
            failed++;
            console.error('[' + (i+1) + '/' + allIds.length + '] ERROR:', e);
        }
    }

    // pending_sakes도 처리
    try {
        var { data: pendingBase64 } = await supabaseClient
            .from('pending_sakes').select('id, user_id, photo_back').like('photo_back', 'data:%');
        if (pendingBase64 && pendingBase64.length > 0) {
            console.log('pending_sakes 마이그레이션: ' + pendingBase64.length + '건');
            for (var j = 0; j < pendingBase64.length; j++) {
                var p = pendingBase64[j];
                var pUrl = await uploadPhotoToStorage(p.photo_back, 'pending_' + p.id, 'back', p.user_id);
                if (pUrl) {
                    await supabaseClient.from('pending_sakes').update({ photo_back: pUrl }).eq('id', p.id);
                    console.log('pending [' + (j+1) + '/' + pendingBase64.length + '] OK');
                }
            }
        }
    } catch (e) { console.error('pending_sakes migration error:', e); }

    var result = { total: allIds.length, success: success, failed: failed };
    console.log('=== 마이그레이션 완료 ===', result);
    alert('마이그레이션 완료!\n성공: ' + success + '건\n실패: ' + failed + '건');
    return result;
}

// ═══════════════════════════════════════════════
// 관리자: pending_sakes 검토/승인 UI
// ═══════════════════════════════════════════════

let pendingSakes = [];

async function loadPendingSakes() {
    if (!currentUser) return;
    try {
        const { data, error } = await supabaseClient
            .from('pending_sakes')
            .select('*')
            .eq('status', 'pending')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        pendingSakes = data || [];
        renderPendingBadge();
    } catch (err) {
        console.error('Load pending sakes error:', err);
    }
}

function renderPendingBadge() {
    const badge = document.getElementById('pendingBadge');
    const section = document.getElementById('pendingSection');
    if (!badge || !section) return;

    if (pendingSakes.length > 0) {
        badge.textContent = pendingSakes.length;
        badge.style.display = 'inline-flex';
        section.style.display = 'block';
        renderPendingList();
    } else {
        badge.style.display = 'none';
        section.style.display = 'none';
    }
}

function renderPendingList() {
    const container = document.getElementById('pendingList');
    if (!container) return;

    container.innerHTML = pendingSakes.map(s => `
        <div class="pending-card" id="pending-${s.id}">
            <div class="pending-card-header">
                <strong>${escapeHtml(s.product_name || s.brand || '이름 없음')}</strong>
                <span class="pending-date">${new Date(s.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
            <div class="pending-card-body">
                ${s.photo_back ? `<img src="${sanitizePhotoUrl(s.photo_back)}" class="pending-photo" alt="뒷면 라벨">` : ''}
                <div class="pending-fields">
                    <label>브랜드 (한글)<input type="text" id="pf-brand-${s.id}" value="${escapeHtml(s.brand || '')}"></label>
                    <label>브랜드 (일본어)<input type="text" id="pf-brandJp-${s.id}" value="${escapeHtml(s.brand_jp || '')}"></label>
                    <label>제품명<input type="text" id="pf-product-${s.id}" value="${escapeHtml(s.product_name || '')}"></label>
                    <label>일본어 전체명<input type="text" id="pf-japanese-${s.id}" value="${escapeHtml(s.japanese || '')}"></label>
                    <label>등급<input type="text" id="pf-grade-${s.id}" value="${escapeHtml(s.grade || '')}"></label>
                    <label>정미율<input type="text" id="pf-polishRate-${s.id}" value="${escapeHtml(s.polish_rate || '')}"></label>
                    <label>알코올 도수<input type="text" id="pf-alcohol-${s.id}" value="${escapeHtml(s.alcohol_content || '')}"></label>
                    <label>원재료<input type="text" id="pf-ingredients-${s.id}" value="${escapeHtml(s.ingredients || '')}"></label>
                    <label>양조장<input type="text" id="pf-brewery-${s.id}" value="${escapeHtml(s.brewery || '')}"></label>
                    <label>지역<input type="text" id="pf-region-${s.id}" value="${escapeHtml(s.region || '')}"></label>
                    <label>용량<input type="text" id="pf-volume-${s.id}" value="${escapeHtml(s.volume || '')}"></label>
                </div>
            </div>
            ${s.raw_text ? `<details class="pending-raw"><summary>원본 텍스트</summary><pre>${escapeHtml(s.raw_text)}</pre></details>` : ''}
            <div class="pending-actions">
                <button class="btn-approve" onclick="approvePendingSake('${s.id}')">✅ 승인</button>
                <button class="btn-reject" onclick="rejectPendingSake('${s.id}')">❌ 거절</button>
            </div>
        </div>
    `).join('');
}

async function approvePendingSake(id) {
    if (!currentUser) return;
    try {
        const editedData = {
            brand: document.getElementById(`pf-brand-${id}`)?.value || '',
            brand_jp: document.getElementById(`pf-brandJp-${id}`)?.value || '',
            product_name: document.getElementById(`pf-product-${id}`)?.value || '',
            japanese: document.getElementById(`pf-japanese-${id}`)?.value || '',
            grade: document.getElementById(`pf-grade-${id}`)?.value || '',
            polish_rate: document.getElementById(`pf-polishRate-${id}`)?.value || '',
            alcohol_content: document.getElementById(`pf-alcohol-${id}`)?.value || '',
            ingredients: document.getElementById(`pf-ingredients-${id}`)?.value || '',
            brewery: document.getElementById(`pf-brewery-${id}`)?.value || '',
            brewery_jp: document.getElementById(`pf-brewery-${id}`)?.value || '',
            region: document.getElementById(`pf-region-${id}`)?.value || '',
            volume: document.getElementById(`pf-volume-${id}`)?.value || ''
        };

        // custom_sakes에 추가
        const { error: insertErr } = await supabaseClient
            .from('custom_sakes')
            .insert([editedData]);
        if (insertErr) throw insertErr;

        // pending 상태 업데이트
        const { error: updateErr } = await supabaseClient
            .from('pending_sakes')
            .update({ status: 'approved' })
            .eq('id', id)
            .eq('user_id', currentUser.id);
        if (updateErr) throw updateErr;

        alert('✅ 사케가 DB에 추가되었습니다!');
        await loadPendingSakes();
        await loadAndMergeCustomSakes();
    } catch (err) {
        alert('❌ 승인 실패: ' + err.message);
    }
}

async function rejectPendingSake(id) {
    if (!confirm('이 항목을 거절하시겠습니까?')) return;
    try {
        const { error } = await supabaseClient
            .from('pending_sakes')
            .update({ status: 'rejected' })
            .eq('id', id)
            .eq('user_id', currentUser.id);
        if (error) throw error;

        await loadPendingSakes();
    } catch (err) {
        alert('❌ 거절 실패: ' + err.message);
    }
}
