// Age Verification & Cookie Consent
(function() {
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
        showEl('ageModal', 'flex');
    }

    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent && ageVerified) {
        setTimeout(() => {
            showEl('cookieConsent');
        }, 1500);
    }
})();

function confirmAge(isAdult) {
    if (isAdult) {
        localStorage.setItem('ageVerified', 'true');
        hideEl('ageModal');

        const cookieConsent = localStorage.getItem('cookieConsent');
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
    localStorage.setItem('cookieConsent', 'accepted');
    hideEl('cookieConsent');
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    hideEl('cookieConsent');
}
