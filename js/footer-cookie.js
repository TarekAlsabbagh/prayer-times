/* Shared footer year + cookie consent banner (GDPR/ePrivacy-ready)
 * Included on all pages.
 *
 * Consent model (localStorage key = cookie_consent_v2):
 *   { ts: 1699999999, necessary: true, analytics: bool, ads: bool }
 * - Necessary: always true (language pref, theme, etc.)
 * - Analytics / Ads: gated — scripts should check window.__consent before init.
 *
 * Public API:
 *   window.openCookieSettings()  → reopens the preferences modal
 *   window.__consent             → current consent object (read-only)
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'cookie_consent_v2';
    const LEGACY_KEY  = 'cookie_consent_v1'; // old banner (Accept only)

    // ===== Helpers =====
    function getLang() {
        try { if (typeof getCurrentLang === 'function') return getCurrentLang(); } catch(e) {}
        const p = location.pathname;
        if (p.startsWith('/en')) return 'en';
        if (p.startsWith('/fr')) return 'fr';
        if (p.startsWith('/tr')) return 'tr';
        if (p.startsWith('/ur')) return 'ur';
        return 'ar';
    }
    function tt(key, fallbacks) {
        try {
            if (typeof t === 'function') {
                const v = t(key);
                if (v && v !== key) return v;
            }
        } catch(e) {}
        return fallbacks[getLang()] || fallbacks.ar;
    }
    function readConsent() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (obj && typeof obj === 'object' && obj.ts) return obj;
        } catch(e) {}
        return null;
    }
    function writeConsent(obj) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
            localStorage.removeItem(LEGACY_KEY);
        } catch(e) {}
        window.__consent = obj;
        // Fire event for any future ads/analytics scripts to reactively init/deinit
        try { window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: obj })); } catch(e) {}
    }

    function setFooterYear() {
        const el = document.getElementById('footer-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    // ===== Banner =====
    function buildBanner() {
        const isEn = getLang() === 'en';
        const msg       = tt('cookie.message',  { ar:'نستخدم ملفات تعريف الارتباط لتحسين تجربتك. اختر كيف تُستخدم بياناتك.', en:'We use cookies to improve your experience. Choose how your data is used.', fr:'Nous utilisons des cookies pour améliorer votre expérience. Choisissez comment vos données sont utilisées.', tr:'Deneyiminizi geliştirmek için çerez kullanıyoruz. Verilerinizin nasıl kullanılacağını seçin.', ur:'ہم آپ کے تجربے کو بہتر بنانے کے لیے کوکیز استعمال کرتے ہیں۔ انتخاب کریں کہ آپ کا ڈیٹا کیسے استعمال ہو۔' });
        const acceptAll = tt('cookie.accept_all', { ar:'قبول الكل', en:'Accept all', fr:'Tout accepter', tr:'Tümünü kabul et', ur:'سب قبول کریں' });
        const reject    = tt('cookie.reject',     { ar:'رفض', en:'Reject', fr:'Refuser', tr:'Reddet', ur:'مسترد کریں' });
        const manage    = tt('cookie.manage',     { ar:'إدارة التفضيلات', en:'Manage preferences', fr:'Gérer les préférences', tr:'Tercihleri yönet', ur:'ترجیحات کا نظم' });
        const learn     = tt('cookie.learn_more', { ar:'اعرف المزيد', en:'Learn more', fr:'En savoir plus', tr:'Daha fazla', ur:'مزید جانیں' });
        // SEO/A11y: aria-label وصفي بدل النصّ الفقير "Learn more"
        const learnAria = tt('cookie.learn_more_aria', {
            ar: 'اقرأ سياسة الخصوصية لمعرفة كيف نتعامل مع بياناتك',
            en: 'Read our privacy policy to learn how we handle your data',
            fr: 'Lire la politique de confidentialité pour savoir comment nous traitons vos données',
            tr: 'Verilerinizi nasıl işlediğimizi öğrenmek için gizlilik politikamızı okuyun',
            ur: 'ہماری پرائیویسی پالیسی پڑھیں تاکہ جانیں کہ ہم آپ کے ڈیٹا کو کیسے سنبھالتے ہیں'
        });
        const privUrl   = isEn ? '/en/privacy' : '/privacy';

        const div = document.createElement('div');
        div.className = 'cookie-consent';
        div.setAttribute('role', 'dialog');
        div.setAttribute('aria-label', tt('cookie.aria', { ar:'موافقة ملفات الارتباط', en:'Cookie consent', fr:'Consentement aux cookies', tr:'Çerez onayı', ur:'کوکیز کی رضامندی' }));
        div.innerHTML =
            '<div class="cc-msg">' + msg + ' <a href="' + privUrl + '" aria-label="' + learnAria + '">' + learn + '</a></div>' +
            '<div class="cc-actions">' +
                '<button type="button" class="cc-btn cc-btn-secondary" data-cc="reject">' + reject + '</button>' +
                '<button type="button" class="cc-btn cc-btn-secondary" data-cc="manage">' + manage + '</button>' +
                '<button type="button" class="cc-btn cc-btn-primary"   data-cc="accept">' + acceptAll + '</button>' +
            '</div>';
        document.body.appendChild(div);

        div.querySelector('[data-cc="accept"]').addEventListener('click', function() {
            writeConsent({ ts: Date.now(), necessary: true, analytics: true, ads: true });
            hideBanner();
        });
        div.querySelector('[data-cc="reject"]').addEventListener('click', function() {
            writeConsent({ ts: Date.now(), necessary: true, analytics: false, ads: false });
            hideBanner();
        });
        div.querySelector('[data-cc="manage"]').addEventListener('click', function() {
            openModal();
        });

        function hideBanner() { div.classList.add('hidden'); setTimeout(function(){ div.remove(); }, 400); }
        return div;
    }

    // ===== Manage preferences modal =====
    function openModal() {
        // Close any existing modal
        const old = document.getElementById('cc-modal'); if (old) old.remove();

        const current = readConsent() || { necessary: true, analytics: false, ads: false };

        const title     = tt('cookie.modal_title',      { ar:'إعدادات ملفات تعريف الارتباط', en:'Cookie preferences', fr:'Préférences des cookies', tr:'Çerez tercihleri', ur:'کوکیز کی ترجیحات' });
        const intro     = tt('cookie.modal_intro',      { ar:'اختر فئات الملفات التي تسمح باستخدامها. يمكنك تغيير هذا في أي وقت.', en:'Choose which categories you allow. You can change this anytime.', fr:'Choisissez les catégories que vous autorisez. Vous pouvez modifier cela à tout moment.', tr:'İzin verdiğiniz kategorileri seçin. Bunu istediğiniz zaman değiştirebilirsiniz.', ur:'منتخب کریں کن زمروں کی اجازت دیتے ہیں۔ آپ یہ کبھی بھی تبدیل کر سکتے ہیں۔' });
        const necTitle  = tt('cookie.cat_necessary',    { ar:'ضرورية (دائماً مفعّلة)', en:'Necessary (always on)', fr:'Nécessaires (toujours actifs)', tr:'Gerekli (her zaman açık)', ur:'ضروری (ہمیشہ فعال)' });
        const necDesc   = tt('cookie.cat_necessary_d',  { ar:'لازمة لتشغيل الموقع: تفضيل اللغة، الوضع الداكن، حفظ رضاك الحالي.', en:'Required for the site to work: language preference, dark mode, storing your current consent.', fr:'Requis pour le fonctionnement du site : préférence linguistique, mode sombre, stockage du consentement.', tr:'Sitenin çalışması için gerekli: dil tercihi, koyu mod, onayınızın saklanması.', ur:'سائٹ چلانے کے لیے ضروری: زبان، ڈارک موڈ، آپ کی رضامندی محفوظ کرنا۔' });
        const anaTitle  = tt('cookie.cat_analytics',    { ar:'تحليلات', en:'Analytics', fr:'Analyses', tr:'Analitik', ur:'تجزیات' });
        const anaDesc   = tt('cookie.cat_analytics_d',  { ar:'تساعدنا على فهم كيفية استخدام الموقع (عدد الزوار، الصفحات الأكثر زيارة) — بيانات مجمّعة ومجهولة.', en:'Helps us understand how the site is used (visitor counts, popular pages) — aggregated, anonymous data.', fr:'Nous aide à comprendre l\u2019utilisation du site (visiteurs, pages populaires) — données agrégées, anonymes.', tr:'Sitenin nasıl kullanıldığını anlamamıza yardımcı olur (ziyaretçi sayısı, popüler sayfalar) — anonim veriler.', ur:'سائٹ کے استعمال کو سمجھنے میں مدد کرتا ہے (وزیٹرز کی تعداد، مقبول صفحات) — مجموعی گمنام ڈیٹا۔' });
        const adsTitle  = tt('cookie.cat_ads',          { ar:'إعلانات مخصّصة', en:'Personalized ads', fr:'Publicités personnalisées', tr:'Kişiselleştirilmiş reklamlar', ur:'ذاتی اشتہارات' });
        const adsDesc   = tt('cookie.cat_ads_d',        { ar:'تُستخدم لعرض إعلانات أكثر صلة باهتماماتك (مثل Google AdSense). بدونها تظهر إعلانات عامة.', en:'Used to show ads more relevant to your interests (e.g. Google AdSense). Without them, generic ads appear.', fr:'Utilisés pour afficher des publicités plus pertinentes (ex. Google AdSense). Sans cela, des annonces génériques s\u2019affichent.', tr:'İlgi alanlarınıza daha uygun reklamlar göstermek için kullanılır (ör. Google AdSense). Aksi halde genel reklamlar görünür.', ur:'آپ کی دلچسپی سے متعلقہ اشتہارات دکھانے کے لیے استعمال (جیسے Google AdSense)۔ ورنہ عام اشتہارات دکھائے جاتے ہیں۔' });
        const save      = tt('cookie.save',              { ar:'حفظ الاختيار', en:'Save choices', fr:'Enregistrer', tr:'Seçimleri kaydet', ur:'انتخاب محفوظ کریں' });
        const cancel    = tt('cookie.cancel',            { ar:'إلغاء', en:'Cancel', fr:'Annuler', tr:'İptal', ur:'منسوخ کریں' });

        const modal = document.createElement('div');
        modal.id = 'cc-modal';
        modal.className = 'cc-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'cc-modal-title');
        modal.innerHTML =
            '<div class="cc-modal-backdrop" data-cc-close></div>' +
            '<div class="cc-modal-dialog">' +
                '<h2 id="cc-modal-title">' + title + '</h2>' +
                '<p class="cc-modal-intro">' + intro + '</p>' +
                '<div class="cc-cat">' +
                    '<div class="cc-cat-head"><span class="cc-cat-name">' + necTitle + '</span><label class="cc-switch cc-switch-disabled"><input type="checkbox" checked disabled><span class="cc-slider"></span></label></div>' +
                    '<p class="cc-cat-desc">' + necDesc + '</p>' +
                '</div>' +
                '<div class="cc-cat">' +
                    '<div class="cc-cat-head"><span class="cc-cat-name">' + anaTitle + '</span><label class="cc-switch"><input type="checkbox" id="cc-ana" ' + (current.analytics ? 'checked' : '') + '><span class="cc-slider"></span></label></div>' +
                    '<p class="cc-cat-desc">' + anaDesc + '</p>' +
                '</div>' +
                '<div class="cc-cat">' +
                    '<div class="cc-cat-head"><span class="cc-cat-name">' + adsTitle + '</span><label class="cc-switch"><input type="checkbox" id="cc-ads" ' + (current.ads ? 'checked' : '') + '><span class="cc-slider"></span></label></div>' +
                    '<p class="cc-cat-desc">' + adsDesc + '</p>' +
                '</div>' +
                '<div class="cc-modal-actions">' +
                    '<button type="button" class="cc-btn cc-btn-secondary" data-cc-close>' + cancel + '</button>' +
                    '<button type="button" class="cc-btn cc-btn-primary"   id="cc-save-btn">' + save + '</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        function closeModal() { modal.classList.add('hidden'); setTimeout(function(){ modal.remove(); }, 300); }
        modal.querySelectorAll('[data-cc-close]').forEach(function(el){ el.addEventListener('click', closeModal); });
        document.getElementById('cc-save-btn').addEventListener('click', function() {
            const ana = document.getElementById('cc-ana').checked;
            const ads = document.getElementById('cc-ads').checked;
            writeConsent({ ts: Date.now(), necessary: true, analytics: ana, ads: ads });
            // Also hide any visible banner (first-time interaction)
            const banner = document.querySelector('.cookie-consent');
            if (banner) { banner.classList.add('hidden'); setTimeout(function(){ banner.remove(); }, 400); }
            closeModal();
        });

        // ESC closes
        const escHandler = function(e) { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    }

    // ===== Entry =====
    function init() {
        setFooterYear();

        // Expose public API
        window.openCookieSettings = openModal;

        // Load existing consent (v1 legacy = implied accept-all)
        const existing = readConsent();
        if (existing) {
            window.__consent = existing;
            return; // don't show banner if already answered
        }
        try {
            if (localStorage.getItem(LEGACY_KEY) === 'accepted') {
                // migrate old implicit consent → explicit full accept
                writeConsent({ ts: Date.now(), necessary: true, analytics: true, ads: true, migrated: true });
                return;
            }
        } catch(e) {}

        // No consent yet → show banner (slight delay so i18n.js loads)
        setTimeout(buildBanner, 600);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
