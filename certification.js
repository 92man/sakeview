// === 자격증 인증 시스템 ===

function handleCertPhotoUpload(event, previewId) {
    _handlePhoto(event, function(data) { currentCertPhotoData = data; }, null, previewId, '자격증 사진', false);
}

function toggleSignupCert() {
    const checked = document.getElementById('signupCertToggle').checked;
    if (checked) { showEl('signupCertFields'); } else { hideEl('signupCertFields'); }
    if (!checked) {
        currentCertPhotoData = null;
        document.getElementById('signupCertType').value = '';
        const preview = document.getElementById('signupCertPreview');
        if (preview) preview.innerHTML = '';
        const uploadText = document.getElementById('signupCertUploadText');
        if (uploadText) uploadText.style.display = 'block';
    }
}

async function submitPendingCert() {
    if (!currentUser) return;
    const pending = localStorage.getItem('pendingCert');
    if (!pending) return;
    try {
        const certData = JSON.parse(pending);
        const { error } = await supabaseClient
            .from('certifications')
            .insert([{
                user_id: currentUser.id,
                user_email: currentUser.email,
                cert_type: certData.cert_type,
                cert_photo: certData.cert_photo,
                status: 'pending'
            }]);
        if (!error) {
            localStorage.removeItem('pendingCert');
            alert('자격증 인증 요청이 제출되었습니다. 관리자 검토 후 승인됩니다.');
        }
    } catch (e) {
        console.error('Pending cert submission error:', e);
    }
}

async function openCertModal() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    showEl('certModal', 'flex');
    const body = document.getElementById('certModalBody');
    body.innerHTML = '<div class="loading">인증 상태 확인 중...</div>';
    try {
        const { data: certs, error } = await supabaseClient
            .from('certifications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        renderCertModalContent(certs || []);
    } catch (e) {
        body.innerHTML = `<p style="color:#e74c3c;">오류: ${escapeHtml(e.message)}</p>`;
    }
}

function closeCertModal() {
    hideEl('certModal');
    currentCertPhotoData = null;
}

function renderCertModalContent(certs) {
    const body = document.getElementById('certModalBody');
    const kikizakeshi = certs.find(c => c.cert_type === 'kikizakeshi');
    const sommelier = certs.find(c => c.cert_type === 'sommelier');
    let html = renderCertTypeSection('kikizakeshi', '키키자케시 (利酒師)', kikizakeshi);
    html += '<hr style="border:none;border-top:1px solid var(--border-card);margin:20px 0;">';
    html += renderCertTypeSection('sommelier', '사케 소믈리에', sommelier);
    body.innerHTML = html;
    if (window.lucide) lucide.createIcons({nodes: [body]});
}

function renderCertTypeSection(certType, label, certRecord) {
    const badgeIcon = certType === 'kikizakeshi' ? '🏅' : '🎖️';

    if (!certRecord) {
        return `<div class="cert-type-section">
            <h4>${badgeIcon} ${escapeHtml(label)}</h4>
            <p class="cert-status-text">미신청</p>
            <div class="cert-apply-form">
                <div class="cert-photo-upload" onclick="document.getElementById('certPhotoInput_${certType}').click()">
                    <input type="file" id="certPhotoInput_${certType}" accept="image/*"
                           onchange="handleCertPhotoUpload(event, 'certPreview_${certType}')" style="display:none;">
                    <div id="certUploadText_${certType}"><i data-lucide="upload" style="width:24px;height:24px;"></i><br>자격증 사진 업로드</div>
                    <div id="certPreview_${certType}" class="cert-photo-preview"></div>
                </div>
                <button class="auth-btn" style="margin-top:12px;width:100%;" onclick="submitCertApplication('${certType}')">
                    <span class="btn-text">인증 신청</span>
                </button>
            </div>
        </div>`;
    }

    if (certRecord.status === 'pending') {
        return `<div class="cert-type-section">
            <h4>${badgeIcon} ${escapeHtml(label)}</h4>
            <div class="cert-status-badge pending">심사 중</div>
            <p class="cert-status-text">관리자 검토 대기 중입니다.</p>
            <p class="cert-submitted-date">신청일: ${new Date(certRecord.created_at).toLocaleDateString('ko-KR')}</p>
        </div>`;
    }

    if (certRecord.status === 'approved') {
        return `<div class="cert-type-section">
            <h4>${badgeIcon} ${escapeHtml(label)}</h4>
            <div class="cert-status-badge approved">${badgeIcon} 인증 완료</div>
            <p class="cert-status-text">커뮤니티 노트에 배지가 표시됩니다.</p>
        </div>`;
    }

    if (certRecord.status === 'rejected') {
        return `<div class="cert-type-section">
            <h4>${badgeIcon} ${escapeHtml(label)}</h4>
            <div class="cert-status-badge rejected">반려됨</div>
            ${certRecord.reject_reason ? `<p class="cert-reject-reason">사유: ${escapeHtml(certRecord.reject_reason)}</p>` : ''}
            <div class="cert-apply-form">
                <div class="cert-photo-upload" onclick="document.getElementById('certPhotoInput_${certType}').click()">
                    <input type="file" id="certPhotoInput_${certType}" accept="image/*"
                           onchange="handleCertPhotoUpload(event, 'certPreview_${certType}')" style="display:none;">
                    <div id="certUploadText_${certType}"><i data-lucide="upload" style="width:24px;height:24px;"></i><br>자격증 사진 다시 업로드</div>
                    <div id="certPreview_${certType}" class="cert-photo-preview"></div>
                </div>
                <button class="auth-btn" style="margin-top:12px;width:100%;" onclick="submitCertApplication('${certType}')">
                    <span class="btn-text">재신청</span>
                </button>
            </div>
        </div>`;
    }
    return '';
}

async function submitCertApplication(certType) {
    if (!currentUser) return;
    if (!currentCertPhotoData) {
        alert('자격증 사진을 업로드해주세요.');
        return;
    }
    try {
        const { error } = await supabaseClient
            .from('certifications')
            .insert([{
                user_id: currentUser.id,
                user_email: currentUser.email,
                cert_type: certType,
                cert_photo: currentCertPhotoData,
                status: 'pending'
            }]);
        if (error) {
            if (error.code === '23505') {
                alert('이미 신청 중이거나 승인된 자격증입니다.');
            } else {
                throw error;
            }
            return;
        }
        alert('자격증 인증 요청이 제출되었습니다!');
        currentCertPhotoData = null;
        openCertModal();
    } catch (e) {
        alert('신청 실패: ' + e.message);
    }
}

async function loadApprovedCerts() {
    const CACHE_TTL = 5 * 60 * 1000;
    if (Date.now() - approvedCertsLastLoaded < CACHE_TTL && Object.keys(approvedCertsMap).length > 0) return;
    try {
        const { data, error } = await supabaseClient.rpc('get_approved_certs');
        if (error) throw error;
        approvedCertsMap = {};
        (data || []).forEach(cert => {
            if (!approvedCertsMap[cert.user_id]) {
                approvedCertsMap[cert.user_id] = [];
            }
            approvedCertsMap[cert.user_id].push(cert.cert_type);
        });
        approvedCertsLastLoaded = Date.now();
    } catch (e) {
        console.error('Failed to load approved certs:', e);
    }
}

function getCertBadgeHtml(userId) {
    const certs = approvedCertsMap[userId];
    if (!certs || certs.length === 0) return '';
    let badges = '';
    if (certs.includes('kikizakeshi')) {
        badges += '<span class="cert-badge" title="키키자케시 인증">🏅</span>';
    }
    if (certs.includes('sommelier')) {
        badges += '<span class="cert-badge" title="사케 소믈리에 인증">🎖️</span>';
    }
    return badges;
}
