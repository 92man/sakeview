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
