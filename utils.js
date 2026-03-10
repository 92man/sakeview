// === Utility Functions ===

// HTML 이스케이프 함수
function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

// 업로드용 이미지 압축 (max 1200px, JPEG 0.82)
function compressImageForUpload(base64DataUrl) {
    return new Promise(function(resolve, reject) {
        if (!base64DataUrl || !base64DataUrl.startsWith('data:image')) {
            resolve(base64DataUrl);
            return;
        }
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var maxSize = 1200;
            var scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = function() { resolve(base64DataUrl); };
        img.src = base64DataUrl;
    });
}

// Supabase Storage 이미지 변환 URL 생성 (Transform API 미활성 시 원본 반환)
var _imageTransformEnabled = null; // null=미확인, true/false=확인됨

function getTransformedPhotoUrl(url, width, height) {
    if (_imageTransformEnabled === false) return url;
    if (!url || !url.includes('/storage/v1/object/public/')) return url;
    return url.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
    ) + '?width=' + width + '&height=' + (height || width) + '&resize=cover';
}

// Transform API 사용 가능 여부 프로브 (앱 시작 시 1회)
function probeImageTransform(sampleUrl) {
    if (!sampleUrl || !sampleUrl.includes('/storage/v1/object/public/')) return;
    var testUrl = getTransformedPhotoUrl(sampleUrl, 48, 48);
    fetch(testUrl, { method: 'HEAD' }).then(function(r) {
        _imageTransformEnabled = r.ok;
        if (!r.ok) console.warn('Image Transform API 미활성 — 원본 URL 사용');
    }).catch(function() { _imageTransformEnabled = false; });
}

// img onerror 시 원본 URL로 폴백 (true 반환 = 폴백 시도됨)
function imgTransformFallback(img) {
    if (img.dataset.fallback) return false;
    var src = img.src;
    if (src.includes('/storage/v1/render/image/public/')) {
        img.dataset.fallback = '1';
        img.src = src.replace('/storage/v1/render/image/public/', '/storage/v1/object/public/').split('?')[0];
        _imageTransformEnabled = false;
        return true; // 폴백 시도 중 — 추가 onerror 동작 방지
    }
    return false;
}

// base64 data URL → Supabase Storage 업로드, public URL 반환
// userId를 지정하면 해당 ID로, 생략하면 currentUser.id 사용
async function uploadPhotoToStorage(base64DataUrl, noteId, suffix, userId) {
    var match = base64DataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) return null;
    var mimeType = match[1];
    var ext = mimeType === 'image/png' ? 'png' : 'jpg';
    var byteStr = atob(match[2]);
    var bytes = new Uint8Array(byteStr.length);
    for (var i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
    var blob = new Blob([bytes], { type: mimeType });

    var uid = userId || currentUser.id;
    var path = uid + '/' + noteId + '_' + suffix + '.' + ext;
    var result = await supabaseClient.storage
        .from('sake-photos')
        .upload(path, blob, { upsert: true, contentType: mimeType });
    if (result.error) { console.error('Photo upload error:', result.error); return null; }

    var urlResult = supabaseClient.storage
        .from('sake-photos')
        .getPublicUrl(path);
    return urlResult.data.publicUrl;
}

// Storage에서 사진 삭제
async function deletePhotoFromStorage(photoUrl) {
    if (!photoUrl || !photoUrl.includes('/sake-photos/')) return;
    var pathMatch = photoUrl.match(/\/sake-photos\/(.+)$/);
    if (!pathMatch) return;
    await supabaseClient.storage.from('sake-photos').remove([pathMatch[1]]);
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

// === 커뮤니티 유틸리티 ===

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

// 테마 설정
function loadTheme() {
    var savedTheme = localStorage.getItem('sakeAppTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    var isDark = document.body.classList.contains('dark-mode');
    var btn = document.getElementById('themeToggle');
    if (btn) {
        btn.innerHTML = '<i data-lucide="' + (isDark ? 'moon' : 'sun') + '" id="themeIcon" style="width:20px;height:20px;"></i>';
        if (window.lucide) lucide.createIcons({nodes: [btn]});
    }
    localStorage.setItem('sakeAppTheme', isDark ? 'dark' : 'light');
}

// 날짜 기본값
function setDefaultDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
}

// === DOM 헬퍼 ===

// 요소 보이기 (null-safe)
function showEl(id, displayType) {
    var el = document.getElementById(id);
    if (el) el.style.display = displayType || 'block';
}

// 요소 숨기기 (null-safe)
function hideEl(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// === 테이스팅 태그 추출 ===

// flavor_description JSON에서 태그 배열 추출
function extractTastingTags(flavorJson, catFilter) {
    if (!flavorJson) return [];
    try {
        var td = JSON.parse(flavorJson);
        if (!td || td.version !== 2 || !td.categories) return [];
        var tags = [];
        var cats = catFilter
            ? catFilter.reduce(function(o, id) { if (td.categories[id]) o[id] = td.categories[id]; return o; }, {})
            : td.categories;
        Object.values(cats).forEach(function(catData) {
            Object.values(catData).forEach(function(val) {
                if (Array.isArray(val)) tags.push.apply(tags, val);
                else tags.push(val);
            });
        });
        return tags;
    } catch(e) { return []; }
}

// === 사진 HTML 생성 ===

// 사진 <img> 태그 생성 (sanitize + transform + fallback 포함)
function buildPhotoImg(url, width, height, cssClass, alt) {
    var safe = sanitizePhotoUrl(url);
    if (!safe) return '';
    var src = sanitizePhotoUrl(getTransformedPhotoUrl(url, width, height || width));
    return '<img src="' + escapeAttr(src) + '"' +
        (cssClass ? ' class="' + cssClass + '"' : '') +
        ' alt="' + escapeAttr(alt || '') + '"' +
        ' loading="lazy"' +
        ' onerror="imgTransformFallback(this)">';
}
