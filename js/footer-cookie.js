/* Shared footer year + cookie consent banner — included on all pages */
(function() {
    'use strict';

    function setFooterYear() {
        const el = document.getElementById('footer-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    function getLang() {
        try {
            if (typeof getCurrentLang === 'function') return getCurrentLang();
        } catch(e) {}
        return location.pathname.startsWith('/en') ? 'en' : 'ar';
    }

    function tt(key, fallbackAr, fallbackEn) {
        try {
            if (typeof t === 'function') {
                const v = t(key);
                if (v && v !== key) return v;
            }
        } catch(e) {}
        return getLang() === 'en' ? fallbackEn : fallbackAr;
    }

    function showCookieBanner() {
        try {
            if (localStorage.getItem('cookie_consent_v1') === 'accepted') return;
        } catch(e) {}
        const isEn = getLang() === 'en';
        const msg     = tt('cookie.message', 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وعرض إعلانات مخصّصة. باستمرارك تكون قد وافقت على ذلك.',
                                              'We use cookies to improve your experience and serve personalized ads. By continuing, you agree to this.');
        const accept  = tt('cookie.accept', 'موافق', 'Accept');
        const learn   = tt('cookie.learn_more', 'اعرف المزيد', 'Learn more');
        const privUrl = isEn ? '/en/privacy' : '/privacy';

        const div = document.createElement('div');
        div.className = 'cookie-consent';
        div.setAttribute('role', 'dialog');
        div.setAttribute('aria-label', isEn ? 'Cookie consent' : 'موافقة الكوكيز');
        div.innerHTML =
            '<div class="cc-msg">' + msg + ' <a href="' + privUrl + '">' + learn + '</a></div>' +
            '<div class="cc-actions"><button type="button" id="cc-accept-btn">' + accept + '</button></div>';
        document.body.appendChild(div);
        document.getElementById('cc-accept-btn').addEventListener('click', function() {
            try { localStorage.setItem('cookie_consent_v1', 'accepted'); } catch(e) {}
            div.classList.add('hidden');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setFooterYear();
            // Delay banner slightly so i18n loads first
            setTimeout(showCookieBanner, 600);
        });
    } else {
        setFooterYear();
        setTimeout(showCookieBanner, 600);
    }
})();
