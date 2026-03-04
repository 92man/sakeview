// Age Verification & Cookie Consent
(function() {
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
        document.getElementById('ageModal').style.display = 'flex';
    }

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
