// Age Verification & Cookie Consent
(function() {
    const ageVerified = safeStorageGet('ageVerified');
    if (!ageVerified) {
        showEl('ageModal', 'block');
        document.body.classList.add('has-age-banner');
    }

    const cookieConsent = safeStorageGet('cookieConsent');
    if (!cookieConsent && ageVerified) {
        setTimeout(() => {
            showEl('cookieConsent');
        }, 1500);
    }
})();

function confirmAge(isAdult) {
    if (isAdult) {
        safeStorageSet('ageVerified', 'true');
        hideEl('ageModal');
        document.body.classList.remove('has-age-banner');

        const cookieConsent = safeStorageGet('cookieConsent');
        if (!cookieConsent) {
            setTimeout(() => {
                showEl('cookieConsent');
            }, 1000);
        }
    } else {
        alert('만 19세 미만은 이용할 수 없습니다.');
        window.location.href = 'https://www.google.com';
    }
}

function acceptCookies() {
    safeStorageSet('cookieConsent', 'accepted');
    hideEl('cookieConsent');
}

function declineCookies() {
    safeStorageSet('cookieConsent', 'declined');
    hideEl('cookieConsent');
}
