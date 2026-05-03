const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const zlib  = require('zlib');
const { execSync } = require('child_process');
const Terser   = require('terser');
const CleanCSS = require('clean-css');
// MoonCalc للـ SSR: حقن أرقام حقيقيّة (إضاءة/عمر/طور) في فقرة /moon-today-in-{slug}
// TRANSLATIONS للـ SSR: لترجمة أسماء الأطوار والأبراج قبل الإرسال (بدون Googlebot-JS)
const MoonCalc   = require('./js/moon.js');
const { TRANSLATIONS: I18N } = require('./js/i18n.js');
// SSR-Prayer-Times: pre-compute the 5 daily prayer times on the server so the
//   FIRST byte of HTML carries real numbers (07:24, 12:15, …) instead of
//   "--:--" placeholders. Googlebot indexes the rendered numbers without
//   waiting for JS — same algorithm runs client-side to update for the
//   visitor's location after page load.
const PrayerTimesSrv = require('./js/prayer-times.js');

// 🆕 Round 2.1 (H): Build hash — git short SHA مُحسَب مرّة عند الإقلاع
// يُضاف لـ asset URLs كـ&b={hash} → يُبطّل الـcache عند كلّ deploy (بدون bump يدويّ)
// fallback إلى 'dev' عند غياب git أو .git/
const BUILD_HASH = (() => {
    try {
        return execSync('git rev-parse --short HEAD', { cwd: __dirname, stdio: ['ignore', 'pipe', 'ignore'] })
            .toString().trim() || 'dev';
    } catch (_e) { return 'dev'; }
})();

// ===== معالجات أخطاء العملية (تمنع السقوط الكلي عند خطأ واحد) =====
process.on('uncaughtException', (err) => {
    console.error('[FATAL uncaughtException]', err && err.stack || err);
});
process.on('unhandledRejection', (reason) => {
    console.error('[FATAL unhandledRejection]', reason && reason.stack || reason);
});

const PORT    = process.env.PORT || 8080;
const ROOT    = __dirname;
const DB_DIR  = path.join(ROOT, 'db');   // قاعدة البيانات الدائمة

// ===== المصدر الموحد للدومين =====
// في الإنتاج: SITE_URL=https://example.com node server.js
// محلياً: يُستخدم http://localhost:PORT تلقائياً
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
function getBaseUrl() { return SITE_URL; }

// ===== خريطة أسماء الدول بالإنجليزية (لتوليد slugs للـ sitemap) =====
const COUNTRY_NAMES_EN = {
    sa:'Saudi Arabia', sy:'Syria', eg:'Egypt', iq:'Iraq',
    jo:'Jordan', lb:'Lebanon', ps:'Palestine', kw:'Kuwait', ae:'United Arab Emirates',
    qa:'Qatar', bh:'Bahrain', om:'Oman', ye:'Yemen', ly:'Libya',
    tn:'Tunisia', dz:'Algeria', ma:'Morocco', sd:'Sudan',
    dj:'Djibouti', km:'Comoros',
    pk:'Pakistan', tr:'Turkey', ir:'Iran', id:'Indonesia', my:'Malaysia',
    bd:'Bangladesh', af:'Afghanistan', in:'India', lk:'Sri Lanka', np:'Nepal',
    cn:'China', jp:'Japan', kr:'South Korea', kp:'North Korea', mn:'Mongolia',
    fr:'France', de:'Germany', gb:'United Kingdom', es:'Spain', it:'Italy',
    nl:'Netherlands', be:'Belgium', pt:'Portugal', se:'Sweden', no:'Norway',
    dk:'Denmark', fi:'Finland', pl:'Poland', ru:'Russia', ua:'Ukraine',
    ch:'Switzerland', at:'Austria', gr:'Greece', cz:'Czech Republic', ro:'Romania',
    us:'United States', ca:'Canada', mx:'Mexico',
    gt:'Guatemala', cu:'Cuba', do:'Dominican Republic',
    br:'Brazil', ar:'Argentina', co:'Colombia', pe:'Peru', ve:'Venezuela',
    cl:'Chile', ec:'Ecuador', bo:'Bolivia', py:'Paraguay', uy:'Uruguay',
    ng:'Nigeria', et:'Ethiopia', ke:'Kenya', tz:'Tanzania', za:'South Africa',
    gh:'Ghana', sn:'Senegal', cm:'Cameroon', ml:'Mali', so:'Somalia',
    ug:'Uganda', mr:'Mauritania', td:'Chad', ne:'Niger',
    au:'Australia', nz:'New Zealand',
    th:'Thailand', ph:'Philippines', vn:'Vietnam', mm:'Myanmar',
    kh:'Cambodia', la:'Laos', sg:'Singapore', bn:'Brunei', tl:'Timor-Leste',
    uz:'Uzbekistan', kz:'Kazakhstan', kg:'Kyrgyzstan', tj:'Tajikistan',
    tm:'Turkmenistan', az:'Azerbaijan', ge:'Georgia', am:'Armenia',
    xk:'Kosovo',
    // Round 7k — توسّع: 40 دولة إضافية (105 → 145)
    ba:'Bosnia and Herzegovina', al:'Albania', mk:'North Macedonia',
    bf:'Burkina Faso', ci:"Côte d'Ivoire", gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leone', mv:'Maldives', er:'Eritrea', ss:'South Sudan',
    tg:'Togo', bj:'Benin',
    ie:'Ireland', hu:'Hungary', hr:'Croatia', rs:'Serbia',
    bg:'Bulgaria', si:'Slovenia', sk:'Slovakia',
    mg:'Madagascar', mz:'Mozambique', ao:'Angola', cd:'DR Congo',
    rw:'Rwanda', zw:'Zimbabwe', zm:'Zambia', mu:'Mauritius',
    lr:'Liberia', mw:'Malawi',
    sr:'Suriname', gy:'Guyana', tt:'Trinidad and Tobago', jm:'Jamaica',
    pa:'Panama', ht:'Haiti', cr:'Costa Rica',
    bt:'Bhutan', fj:'Fiji', pg:'Papua New Guinea',
    // Microstates / city-states (country slug often collides with capital — handled via "-city" suffix)
    mc:'Monaco', sm:'San Marino', va:'Vatican City', ad:'Andorra',
    li:'Liechtenstein', lu:'Luxembourg', mt:'Malta',
};

function makeCountrySlugSrv(cc) {
    const name = COUNTRY_NAMES_EN[cc];
    if (name) return name
        .normalize('NFD')                           // Côte → Co + combining circumflex
        .replace(/[\u0300-\u036f]/g, '')            // حذف العلامات التشكيليّة فقط
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    return cc;
}

// ===== Cache الـ sitemap (30 دقيقة TTL) =====
let _sitemapCache = { data: null, time: 0 };
const SITEMAP_TTL = 30 * 60 * 1000;
function invalidateSitemapCache() { _sitemapCache = { data: null, time: 0 }; }

// ===== Phase G — Curated slug redirects (db/curated-slugs.json) =====
// مولَّد عبر scripts/build-curated-sitemap.mjs من LOCAL_CITIES + LOCAL_PROVINCES
//   - يحتوي خريطة { oldSlug: canonicalSlug } (مثلًا mecca → makkah, giza-governorate → giza)
//   - يُحمَّل مرّة عند الإقلاع، ويُستخدم في 301 redirect handler قبل routing الرئيسيّ
let CURATED_REDIRECTS = {};
let CURATED_ENTRIES = [];
try {
    const _curatedPath = path.join(__dirname, 'db', 'curated-slugs.json');
    if (fs.existsSync(_curatedPath)) {
        const _curated = JSON.parse(fs.readFileSync(_curatedPath, 'utf8'));
        CURATED_REDIRECTS = _curated.redirects || {};
        CURATED_ENTRIES = _curated.entries || [];
        console.log(`[Curated] Loaded ${CURATED_ENTRIES.length} entries + ${Object.keys(CURATED_REDIRECTS).length} redirects`);
    }
} catch (e) {
    console.warn(`[Curated] Failed to load curated-slugs.json: ${e.message}`);
}

// ===== UAT-3b — Server-side i18n: load TRANSLATIONS from js/i18n.js =====
// Runs js/i18n.js inside a vm sandbox at boot. Stub document/window/etc so
// the DOM-touching helpers (setLanguage, etc.) don't throw — we only need
// the TRANSLATIONS object. Cached for the life of the process.
let TRANSLATIONS_BY_LANG = null;
try {
    const _i18nPath = path.join(__dirname, 'js', 'i18n.js');
    if (fs.existsSync(_i18nPath)) {
        const _vm = require('vm');
        const _i18nSrc = fs.readFileSync(_i18nPath, 'utf8');
        const _stubDoc = {
            documentElement: { lang: 'ar', dir: 'rtl', classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>false, toggle: ()=>{} } },
            querySelectorAll: () => [],
            querySelector: () => null,
            getElementById: () => null,
            createElement: () => ({ setAttribute: ()=>{}, appendChild: ()=>{}, addEventListener: ()=>{} }),
            head: { appendChild: () => {} },
            body: { appendChild: () => {} },
            addEventListener: () => {},
            cookie: '',
            location: { pathname: '/', hostname: 'localhost', protocol: 'http:', href: 'http://localhost/' }
        };
        const _sandbox = {
            window: { location: _stubDoc.location, addEventListener: () => {}, removeEventListener: () => {} },
            document: _stubDoc,
            localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
            navigator: { language: 'ar', languages: ['ar'] },
            console: { log: () => {}, warn: () => {}, error: () => {} },
            setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {}
        };
        _sandbox.window.document = _stubDoc;
        _vm.createContext(_sandbox);
        // Append exposer line so const TRANSLATIONS becomes reachable on the sandbox
        _vm.runInContext(_i18nSrc + '\n;try{this.__TRANSLATIONS = TRANSLATIONS;}catch(e){}', _sandbox);
        TRANSLATIONS_BY_LANG = _sandbox.__TRANSLATIONS || null;
        if (TRANSLATIONS_BY_LANG) {
            const _langs = Object.keys(TRANSLATIONS_BY_LANG);
            const _arKeys = TRANSLATIONS_BY_LANG.ar ? Object.keys(TRANSLATIONS_BY_LANG.ar).length : 0;
            console.log(`[i18n] Loaded ${_langs.length} languages (${_langs.join(',')}) — ${_arKeys} keys per lang`);
        }
    }
} catch (e) {
    console.warn(`[i18n] Failed to load TRANSLATIONS: ${e.message}`);
    TRANSLATIONS_BY_LANG = null;
}

// HTML-escape attribute values (for placeholder/title/aria-label injection).
function _escAttr(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

/**
 * UAT-3b — translate data-i18n attributes server-side.
 * Replaces inline Arabic default text/attribute values with the target-lang
 * value from TRANSLATIONS. Skipped for ar (default) and when dict missing.
 *
 * Handles 5 binding kinds:
 *   data-i18n               → replace text content of the host element
 *   data-i18n-placeholder   → replace `placeholder="..."` value
 *   data-i18n-title         → replace `title="..."` value
 *   data-i18n-aria-label    → replace `aria-label="..."` value
 *   data-i18n-alt           → replace `alt="..."` value (UAT-3c.2)
 *
 * Conservative: only swaps simple `<tag ...>TEXT</tag>` patterns where the
 * text content has no nested elements. Complex/nested cases fall back to the
 * existing client-side i18n.js handler (no regression).
 */
function _translateI18nAttrs(html, lang) {
    if (!lang || lang === 'ar' || !TRANSLATIONS_BY_LANG) return html;
    const dict = TRANSLATIONS_BY_LANG[lang];
    if (!dict) return html;
    // UAT-Z1: English fallback chain — when a key is missing from the
    // target lang dict (e.g. zakat.hero.title not yet translated to fr),
    // fall back to the English value before leaving the Arabic text in
    // place. Eliminates i18n-leakage for newly-added keys before all
    // 10 langs are translated. AR fallback never used for non-AR langs
    // (defeats the purpose).
    const enDict = TRANSLATIONS_BY_LANG.en || {};
    const _trans = (key) => {
        const t = dict[key];
        if (typeof t === 'string') return t;
        const e = enDict[key];
        if (typeof e === 'string') return e;
        return null;
    };

    // 1) text content for elements with data-i18n="key" (text-only body)
    html = html.replace(
        /<([a-z][a-z0-9-]*)\b([^>]*?\bdata-i18n=["']([^"']+)["'][^>]*?)>([^<]*)<\/\1>/gi,
        (m, tag, attrs, key, _text) => {
            const trans = _trans(key);
            if (trans === null) return m;
            return `<${tag}${attrs}>${trans}</${tag}>`;
        }
    );

    // 1a) UAT-SSR-FIX: mixed-content data-i18n — element has inline child
    //     markup (e.g. <svg>icon</svg>) followed by trailing text. The
    //     pattern at (1) requires a text-only body, so these slipped through
    //     and the Arabic label leaked into /en/ pages. Strategy: replace
    //     ONLY the trailing text after the last closing tag inside the
    //     body — preserves the inline icon, translates the visible label.
    html = html.replace(
        /<([a-z][a-z0-9-]*)\b([^>]*?\bdata-i18n=["']([^"']+)["'][^>]*?)>([\s\S]*?)<\/\1>/gi,
        (m, tag, attrs, key, body) => {
            // Skip if body has no nested tags (already handled by 1) or empty
            if (!/</.test(body)) return m;
            const trans = _trans(key);
            if (trans === null) return m;
            const lastClose = body.lastIndexOf('>');
            if (lastClose === -1) return m;
            const before  = body.slice(0, lastClose + 1);
            const trailRaw = body.slice(lastClose + 1);
            // Preserve any leading whitespace between icon and text
            const ws = (trailRaw.match(/^(\s+)/) || ['', ' '])[1] || ' ';
            return `<${tag}${attrs}>${before}${ws}${trans}</${tag}>`;
        }
    );

    // 1b) UAT-ICON-3: data-i18n-html — replaces the FULL inner HTML (allows
    //     translated content to contain markup like <li>...</li>).
    //     The matched element body can span multiple lines / contain nested
    //     elements, so use a non-greedy multiline match.
    html = html.replace(
        /<([a-z][a-z0-9-]*)\b([^>]*?\bdata-i18n-html=["']([^"']+)["'][^>]*?)>([\s\S]*?)<\/\1>/gi,
        (m, tag, attrs, key, _body) => {
            const trans = _trans(key);
            if (trans === null) return m;
            return `<${tag}${attrs}>${trans}</${tag}>`;
        }
    );

    // 2) attribute-bound i18n: placeholder / title / aria-label / alt
    const attrPairs = [
        ['data-i18n-placeholder', 'placeholder'],
        ['data-i18n-title',       'title'],
        ['data-i18n-aria-label',  'aria-label'],
        ['data-i18n-alt',         'alt'],
    ];
    for (const [keyAttr, valAttr] of attrPairs) {
        const tagRe = /<[a-z][a-z0-9-]*\b[^>]*?\/?>/gi;
        const valRe = new RegExp(`(^|<[a-z][a-z0-9-]*|\\s)(${valAttr}=["'][^"']*["'])`, 'i');
        const keyRe = new RegExp(`(?:^|\\s)${keyAttr}=["']([^"']+)["']`, 'i');
        html = html.replace(tagRe, tagStr => {
            const km = tagStr.match(keyRe);
            if (!km) return tagStr;
            const trans = _trans(km[1]);
            if (trans === null) return tagStr;
            const escaped = _escAttr(trans);
            if (valRe.test(tagStr)) {
                return tagStr.replace(valRe, `$1${valAttr}="${escaped}"`);
            }
            return tagStr.replace(/(\/?>)\s*$/, ` ${valAttr}="${escaped}"$1`);
        });
    }
    return html;
}

function makeCitySlugSrv(nameEn, lat, lng) {
    // NFD decomposes accented chars (ã → a+◌̃, ü → u+◌̈, ç → c+◌̧)
    // ثمّ نحذف العلامات التشكيليّة [U+0300..U+036F] فقط، فيتبقّى الحرف الأساسيّ ASCII
    const latin = (nameEn || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]+/g, '')
        .trim()
        .replace(/\s+/g, '-');
    if (latin.length >= 2) return latin;
    const la = Math.abs(lat).toFixed(1) + (lat >= 0 ? 'n' : 's');
    const lo = Math.abs(lng).toFixed(1) + (lng >= 0 ? 'e' : 'w');
    return `${la}-${lo}`;
}

// ===== Round 10: Legacy slug — الصيغة القديمة (بلا NFD) لتوافُق رجعيّ =====
// كان يُحوِّل مثلاً: "São Paulo" → "so-paulo" (مُشوَّه بسبب حذف ã كاملاً).
// نُعيد استعماله في _getCitySlugIndex لِيُسجَّل المدينة تحت كلّ من الـ slug الجديد والقديم،
// فلا تُعطب الروابط المُفهرَسة/المحفوظة مسبقاً. يُستخدم فقط عند الـ lookup — لا يُصدَر في sitemap.
function _makeCityLegacySlug(nameEn) {
    const latin = (nameEn || '').toLowerCase().replace(/[^a-z0-9\s]+/g, '').trim().replace(/\s+/g, '-');
    return latin.length >= 2 ? latin : null;
}

// ===== Round 8B: ترجمة أسماء 12 مدينة شعبيّة لكلّ اللغات الـ10 =====
// تُستخدَم في SSR title/description/breadcrumb لصفحات /prayer-times-in-{slug}.
// المفتاح = slug (لاتيني مُنخفِض) كما في URLs.
const POPULAR_CITY_NAMES = {
    mecca:      { ar:'مكة المكرمة',      en:'Mecca',       fr:'La Mecque',   tr:'Mekke',       ur:'مکہ مکرمہ',    de:'Mekka',      id:'Makkah',    es:'La Meca',       bn:'মক্কা',          ms:'Makkah' },
    medina:     { ar:'المدينة المنورة', en:'Medina',      fr:'Médine',      tr:'Medine',      ur:'مدینہ منورہ', de:'Medina',     id:'Madinah',   es:'Medina',        bn:'মদিনা',          ms:'Madinah' },
    riyadh:     { ar:'الرياض',           en:'Riyadh',      fr:'Riyad',       tr:'Riyad',       ur:'ریاض',         de:'Riad',       id:'Riyadh',    es:'Riad',          bn:'রিয়াদ',         ms:'Riyadh' },
    jeddah:     { ar:'جدة',              en:'Jeddah',      fr:'Djeddah',     tr:'Cidde',       ur:'جدہ',          de:'Dschidda',   id:'Jeddah',    es:'Yeda',          bn:'জেদ্দা',         ms:'Jeddah' },
    cairo:      { ar:'القاهرة',          en:'Cairo',       fr:'Le Caire',    tr:'Kahire',      ur:'قاہرہ',        de:'Kairo',      id:'Kairo',     es:'El Cairo',      bn:'কায়রো',         ms:'Kaherah' },
    istanbul:   { ar:'إسطنبول',          en:'Istanbul',    fr:'Istanbul',    tr:'İstanbul',    ur:'استنبول',      de:'Istanbul',   id:'Istanbul',  es:'Estambul',      bn:'ইস্তাম্বুল',     ms:'Istanbul' },
    dubai:      { ar:'دبي',              en:'Dubai',       fr:'Dubaï',       tr:'Dubai',       ur:'دبئی',         de:'Dubai',      id:'Dubai',     es:'Dubái',         bn:'দুবাই',          ms:'Dubai' },
    amman:      { ar:'عمّان',            en:'Amman',       fr:'Amman',       tr:'Amman',       ur:'عمان',         de:'Amman',      id:'Amman',     es:'Amán',          bn:'আম্মান',         ms:'Amman' },
    baghdad:    { ar:'بغداد',            en:'Baghdad',     fr:'Bagdad',      tr:'Bağdat',      ur:'بغداد',        de:'Bagdad',     id:'Baghdad',   es:'Bagdad',        bn:'বাগদাদ',         ms:'Baghdad' },
    damascus:   { ar:'دمشق',             en:'Damascus',    fr:'Damas',       tr:'Şam',         ur:'دمشق',         de:'Damaskus',   id:'Damaskus',  es:'Damasco',       bn:'দামেস্কাস',      ms:'Damsyik' },
    casablanca: { ar:'الدار البيضاء',   en:'Casablanca',  fr:'Casablanca',  tr:'Kazablanka',  ur:'کاسابلانکا',  de:'Casablanca', id:'Casablanca',es:'Casablanca',    bn:'কাসাব্লাঙ্কা',    ms:'Casablanca' },
    jerusalem:  { ar:'القدس',            en:'Jerusalem',   fr:'Jérusalem',   tr:'Kudüs',       ur:'یروشلم',       de:'Jerusalem',  id:'Yerusalem', es:'Jerusalén',     bn:'জেরুজালেম',      ms:'Baitulmuqaddis' },

    // ── Round 8E: توسعة لـ31 مدينة استراتيجيّة — عواصم الدول الإسلاميّة + كبريات الشتات ──
    // عواصم / كبرى الدول الإسلاميّة
    jakarta:       { ar:'جاكرتا',         en:'Jakarta',       fr:'Jakarta',       tr:'Cakarta',      ur:'جکارتہ',        de:'Jakarta',       id:'Jakarta',       es:'Yakarta',      bn:'জাকার্তা',        ms:'Jakarta' },
    karachi:       { ar:'كراتشي',         en:'Karachi',       fr:'Karachi',       tr:'Karaçi',       ur:'کراچی',         de:'Karatschi',     id:'Karachi',       es:'Karachi',      bn:'করাচি',           ms:'Karachi' },
    lahore:        { ar:'لاهور',          en:'Lahore',        fr:'Lahore',        tr:'Lahor',        ur:'لاہور',         de:'Lahore',        id:'Lahore',        es:'Lahore',       bn:'লাহোর',           ms:'Lahore' },
    islamabad:     { ar:'إسلام آباد',    en:'Islamabad',     fr:'Islamabad',     tr:'İslamabad',    ur:'اسلام آباد',    de:'Islamabad',     id:'Islamabad',     es:'Islamabad',    bn:'ইসলামাবাদ',      ms:'Islamabad' },
    dhaka:         { ar:'دكا',            en:'Dhaka',         fr:'Dacca',         tr:'Dakka',        ur:'ڈھاکہ',         de:'Dhaka',         id:'Dhaka',         es:'Daca',         bn:'ঢাকা',            ms:'Dhaka' },
    'kuala-lumpur':{ ar:'كوالالمبور',    en:'Kuala Lumpur',  fr:'Kuala Lumpur',  tr:'Kuala Lumpur', ur:'کوالالمپور',    de:'Kuala Lumpur',  id:'Kuala Lumpur',  es:'Kuala Lumpur', bn:'কুয়ালালামপুর',   ms:'Kuala Lumpur' },
    tehran:        { ar:'طهران',          en:'Tehran',        fr:'Téhéran',       tr:'Tahran',       ur:'تہران',         de:'Teheran',       id:'Teheran',       es:'Teherán',      bn:'তেহরান',          ms:'Tehran' },
    ankara:        { ar:'أنقرة',          en:'Ankara',        fr:'Ankara',        tr:'Ankara',       ur:'انقرہ',         de:'Ankara',        id:'Ankara',        es:'Ankara',       bn:'আঙ্কারা',         ms:'Ankara' },
    doha:          { ar:'الدوحة',         en:'Doha',          fr:'Doha',          tr:'Doha',         ur:'دوحہ',          de:'Doha',          id:'Doha',          es:'Doha',         bn:'দোহা',            ms:'Doha' },
    'abu-dhabi':   { ar:'أبوظبي',         en:'Abu Dhabi',     fr:'Abou Dabi',     tr:'Abu Dabi',     ur:'ابوظہبی',       de:'Abu Dhabi',     id:'Abu Dhabi',     es:'Abu Dabi',     bn:'আবুধাবি',        ms:'Abu Dhabi' },
    'kuwait-city': { ar:'مدينة الكويت',   en:'Kuwait City',   fr:'Koweït',        tr:'Kuveyt',       ur:'کویت سٹی',      de:'Kuwait-Stadt',  id:'Kota Kuwait',   es:'Kuwait',       bn:'কুয়েত সিটি',    ms:'Bandar Kuwait' },
    manama:        { ar:'المنامة',        en:'Manama',        fr:'Manama',        tr:'Manama',       ur:'منامہ',         de:'Manama',        id:'Manama',        es:'Manama',       bn:'মানামা',          ms:'Manamah' },
    'manama-al':   { ar:'المنامة',        en:'Manama',        fr:'Manama',        tr:'Manama',       ur:'منامہ',         de:'Manama',        id:'Manama',        es:'Manama',       bn:'মানামা',          ms:'Manamah' }, // مرادف slug في db/cities-ae.json
    muscat:        { ar:'مسقط',           en:'Muscat',        fr:'Mascate',       tr:'Maskat',       ur:'مسقط',          de:'Maskat',        id:'Muskat',        es:'Mascate',      bn:'মাস্কাট',         ms:'Muscat' },
    sanaa:         { ar:'صنعاء',          en:'Sanaa',         fr:'Sanaa',         tr:"Sana'a",       ur:'صنعاء',         de:'Sanaa',         id:'Sanaa',         es:'Saná',         bn:'সানা',           ms:'Sanaa' },
    beirut:        { ar:'بيروت',          en:'Beirut',        fr:'Beyrouth',      tr:'Beyrut',       ur:'بیروت',         de:'Beirut',        id:'Beirut',        es:'Beirut',       bn:'বৈরুত',           ms:'Beirut' },
    tripoli:       { ar:'طرابلس',         en:'Tripoli',       fr:'Tripoli',       tr:'Trablus',      ur:'طرابلس',        de:'Tripolis',      id:'Tripoli',       es:'Trípoli',      bn:'ত্রিপোলি',        ms:'Tripoli' },
    tunis:         { ar:'تونس العاصمة',   en:'Tunis',         fr:'Tunis',         tr:'Tunus',        ur:'تیونس',         de:'Tunis',         id:'Tunis',         es:'Túnez',        bn:'তিউনিস',          ms:'Tunis' },
    algiers:       { ar:'الجزائر العاصمة',en:'Algiers',       fr:'Alger',         tr:'Cezayir',      ur:'الجزائر',       de:'Algier',        id:'Aljir',         es:'Argel',        bn:'আলজিয়ার্স',     ms:'Algiers' },
    rabat:         { ar:'الرباط',         en:'Rabat',         fr:'Rabat',         tr:'Rabat',        ur:'رباط',          de:'Rabat',         id:'Rabat',         es:'Rabat',        bn:'রাবাত',           ms:'Rabat' },
    khartoum:      { ar:'الخرطوم',        en:'Khartoum',      fr:'Khartoum',      tr:'Hartum',       ur:'خرطوم',         de:'Khartum',       id:'Khartoum',      es:'Jartum',       bn:'খার্তুম',        ms:'Khartoum' },
    kabul:         { ar:'كابول',          en:'Kabul',         fr:'Kaboul',        tr:'Kabil',        ur:'کابل',          de:'Kabul',         id:'Kabul',         es:'Kabul',        bn:'কাবুল',           ms:'Kabul' },
    tashkent:      { ar:'طشقند',          en:'Tashkent',      fr:'Tachkent',      tr:'Taşkent',      ur:'تاشقند',        de:'Taschkent',     id:'Tashkent',      es:'Taskent',      bn:'তাসখন্দ',         ms:'Tashkent' },
    baku:          { ar:'باكو',           en:'Baku',          fr:'Bakou',         tr:'Bakü',         ur:'باکو',          de:'Baku',          id:'Baku',          es:'Bakú',         bn:'বাকু',            ms:'Baku' },
    alexandria:    { ar:'الإسكندرية',     en:'Alexandria',    fr:'Alexandrie',    tr:'İskenderiye',  ur:'اسکندریہ',      de:'Alexandria',    id:'Aleksandria',   es:'Alejandría',   bn:'আলেকজান্দ্রিয়া', ms:'Alexandria' },
    aleppo:        { ar:'حلب',            en:'Aleppo',        fr:'Alep',          tr:'Halep',        ur:'حلب',           de:'Aleppo',        id:'Aleppo',        es:'Alepo',        bn:'আলেপ্পো',         ms:'Aleppo' },
    mogadishu:     { ar:'مقديشو',         en:'Mogadishu',     fr:'Mogadiscio',    tr:'Mogadişu',     ur:'مگادیشو',       de:'Mogadischu',    id:'Mogadishu',     es:'Mogadiscio',   bn:'মোগাদিশু',        ms:'Mogadishu' },
    // جيبوتي: نستعمل slug خاصّ "djibouti-city" لتفادي تضارب مع slug الدولة "djibouti"
    'djibouti-city':{ ar:'جيبوتي',         en:'Djibouti',      fr:'Djibouti',      tr:'Cibuti',       ur:'جبوتی',         de:'Dschibuti',     id:'Djibouti',      es:'Yibuti',       bn:'জিবুতি',          ms:'Djibouti' },
    // سنغافورة (المدينة): نستعمل slug خاصّ "singapore-city" لتفادي تضارب مع slug الدولة "singapore"
    'singapore-city':{ ar:'سنغافورة',      en:'Singapore',     fr:'Singapour',     tr:'Singapur',     ur:'سنگاپور',       de:'Singapur',      id:'Singapura',     es:'Singapur',     bn:'সিঙ্গাপুর',      ms:'Singapura' },
    // شتات إسلامي غربي
    london:        { ar:'لندن',           en:'London',        fr:'Londres',       tr:'Londra',       ur:'لندن',          de:'London',        id:'London',        es:'Londres',      bn:'লন্ডন',           ms:'London' },
    paris:         { ar:'باريس',          en:'Paris',         fr:'Paris',         tr:'Paris',        ur:'پیرس',          de:'Paris',         id:'Paris',         es:'París',        bn:'প্যারিস',         ms:'Paris' },
    berlin:        { ar:'برلين',          en:'Berlin',        fr:'Berlin',        tr:'Berlin',       ur:'برلن',          de:'Berlin',        id:'Berlin',        es:'Berlín',       bn:'বার্লিন',         ms:'Berlin' },
    'new-york':    { ar:'نيويورك',        en:'New York',      fr:'New York',      tr:'New York',     ur:'نیویارک',       de:'New York',      id:'New York',      es:'Nueva York',   bn:'নিউ ইয়র্ক',     ms:'New York' },
    'new-york-city':{ar:'نيويورك',        en:'New York',      fr:'New York',      tr:'New York',     ur:'نیویارک',       de:'New York',      id:'New York',      es:'Nueva York',   bn:'নিউ ইয়র্ক',     ms:'New York' }, // مرادف slug في db/cities-us.json
    toronto:       { ar:'تورنتو',         en:'Toronto',       fr:'Toronto',       tr:'Toronto',      ur:'ٹورنٹو',        de:'Toronto',       id:'Toronto',       es:'Toronto',      bn:'টরন্টো',          ms:'Toronto' },
    // ── توسعة آسيا الشرقيّة / الجنوبيّة / جنوب شرق آسيا (غير إسلاميّة — للمستخدمين المسلمين في الشتات) ──
    tokyo:         { ar:'طوكيو',          en:'Tokyo',         fr:'Tokyo',         tr:'Tokyo',        ur:'ٹوکیو',         de:'Tokio',         id:'Tokyo',         es:'Tokio',        bn:'টোকিও',           ms:'Tokyo' },
    seoul:         { ar:'سيول',           en:'Seoul',         fr:'Séoul',         tr:'Seul',         ur:'سیول',          de:'Seoul',         id:'Seoul',         es:'Seúl',         bn:'সিউল',           ms:'Seoul' },
    beijing:       { ar:'بكين',           en:'Beijing',       fr:'Pékin',         tr:'Pekin',        ur:'بیجنگ',         de:'Peking',        id:'Beijing',       es:'Pekín',        bn:'বেইজিং',         ms:'Beijing' },
    shanghai:      { ar:'شنغهاي',         en:'Shanghai',      fr:'Shanghai',      tr:'Şanghay',      ur:'شنگھائی',       de:'Shanghai',      id:'Shanghai',      es:'Shanghái',     bn:'সাংহাই',         ms:'Shanghai' },
    bangkok:       { ar:'بانكوك',         en:'Bangkok',       fr:'Bangkok',       tr:'Bangkok',      ur:'بینکاک',        de:'Bangkok',       id:'Bangkok',       es:'Bangkok',      bn:'ব্যাংকক',         ms:'Bangkok' },
    hanoi:         { ar:'هانوي',          en:'Hanoi',         fr:'Hanoï',         tr:'Hanoi',        ur:'ہنوئی',         de:'Hanoi',         id:'Hanoi',         es:'Hanói',        bn:'হ্যানয়',         ms:'Hanoi' },
    manila:        { ar:'مانيلا',         en:'Manila',        fr:'Manille',       tr:'Manila',       ur:'منیلا',         de:'Manila',        id:'Manila',        es:'Manila',       bn:'ম্যানিলা',        ms:'Manila' },
    delhi:         { ar:'دلهي',           en:'Delhi',         fr:'Delhi',         tr:'Delhi',        ur:'دہلی',          de:'Delhi',         id:'Delhi',         es:'Delhi',        bn:'দিল্লি',          ms:'Delhi' },
    'new-delhi':   { ar:'نيودلهي',        en:'New Delhi',     fr:'New Delhi',     tr:'Yeni Delhi',   ur:'نئی دہلی',       de:'Neu-Delhi',     id:'New Delhi',     es:'Nueva Delhi',  bn:'নতুন দিল্লি',      ms:'New Delhi' },
    mumbai:        { ar:'مومباي',         en:'Mumbai',        fr:'Mumbai',        tr:'Mumbai',       ur:'ممبئی',         de:'Mumbai',        id:'Mumbai',        es:'Bombay',       bn:'মুম্বাই',         ms:'Mumbai' },
    kolkata:       { ar:'كولكاتا',        en:'Kolkata',       fr:'Calcutta',      tr:'Kalküta',      ur:'کولکاتا',       de:'Kalkutta',      id:'Kolkata',       es:'Calcuta',      bn:'কলকাতা',          ms:'Kolkata' },
    bangalore:     { ar:'بنغالور',        en:'Bangalore',     fr:'Bangalore',     tr:'Bangalore',    ur:'بنگلور',        de:'Bangalore',     id:'Bangalore',     es:'Bangalore',    bn:'ব্যাঙ্গালোর',      ms:'Bangalore' },
    chennai:       { ar:'تشيناي',         en:'Chennai',       fr:'Chennai',       tr:'Chennai',      ur:'چنئی',          de:'Chennai',       id:'Chennai',       es:'Chennai',      bn:'চেন্নাই',         ms:'Chennai' },
    hyderabad:     { ar:'حيدر آباد',      en:'Hyderabad',     fr:'Hyderabad',     tr:'Haydarabad',   ur:'حیدرآباد',      de:'Hyderabad',     id:'Hyderabad',     es:'Hyderabad',    bn:'হায়দ্রাবাদ',     ms:'Hyderabad' },
    // أوروبا (غير المذكورة أعلاه)
    madrid:        { ar:'مدريد',          en:'Madrid',        fr:'Madrid',        tr:'Madrid',       ur:'میڈرڈ',         de:'Madrid',        id:'Madrid',        es:'Madrid',       bn:'মাদ্রিদ',         ms:'Madrid' },
    barcelona:     { ar:'برشلونة',        en:'Barcelona',     fr:'Barcelone',     tr:'Barselona',    ur:'بارسلونا',      de:'Barcelona',     id:'Barcelona',     es:'Barcelona',    bn:'বার্সেলোনা',      ms:'Barcelona' },
    rome:          { ar:'روما',           en:'Rome',          fr:'Rome',          tr:'Roma',         ur:'روم',           de:'Rom',           id:'Roma',          es:'Roma',         bn:'রোম',             ms:'Rome' },
    milan:         { ar:'ميلانو',         en:'Milan',         fr:'Milan',         tr:'Milano',       ur:'میلان',         de:'Mailand',       id:'Milan',         es:'Milán',        bn:'মিলান',           ms:'Milan' },
    moscow:        { ar:'موسكو',          en:'Moscow',        fr:'Moscou',        tr:'Moskova',      ur:'ماسکو',         de:'Moskau',        id:'Moskwa',        es:'Moscú',        bn:'মস্কো',           ms:'Moscow' },
    munich:        { ar:'ميونخ',          en:'Munich',        fr:'Munich',        tr:'Münih',        ur:'میونخ',         de:'München',       id:'München',       es:'Múnich',       bn:'মিউনিখ',          ms:'Munich' },
    manchester:    { ar:'مانشستر',        en:'Manchester',    fr:'Manchester',    tr:'Manchester',   ur:'مانچسٹر',       de:'Manchester',    id:'Manchester',    es:'Mánchester',   bn:'ম্যানচেস্টার',     ms:'Manchester' },
    birmingham:    { ar:'برمنغهام',       en:'Birmingham',    fr:'Birmingham',    tr:'Birmingham',   ur:'برمنگھم',       de:'Birmingham',    id:'Birmingham',    es:'Birmingham',   bn:'বার্মিংহাম',      ms:'Birmingham' },
    // أمريكا الشماليّة (غير المذكورة أعلاه)
    'los-angeles': { ar:'لوس أنجلوس',     en:'Los Angeles',   fr:'Los Angeles',   tr:'Los Angeles',  ur:'لاس اینجلس',    de:'Los Angeles',   id:'Los Angeles',   es:'Los Ángeles',  bn:'লস অ্যাঞ্জেলেস',  ms:'Los Angeles' },
    chicago:       { ar:'شيكاغو',         en:'Chicago',       fr:'Chicago',       tr:'Chicago',      ur:'شکاگو',         de:'Chicago',       id:'Chicago',       es:'Chicago',      bn:'শিকাগো',          ms:'Chicago' },
    // أستراليا
    sydney:        { ar:'سيدني',          en:'Sydney',        fr:'Sydney',        tr:'Sidney',       ur:'سڈنی',          de:'Sydney',        id:'Sydney',        es:'Sídney',       bn:'সিডনি',           ms:'Sydney' },
    melbourne:     { ar:'ملبورن',         en:'Melbourne',     fr:'Melbourne',     tr:'Melbourne',    ur:'میلبورن',       de:'Melbourne',     id:'Melbourne',     es:'Melbourne',    bn:'মেলবোর্ন',        ms:'Melbourne' },
    // المشرق العربيّ (تكملة — Gaza/Ramallah/Homs/Aden/Basra/Mosul)
    gaza:          { ar:'غزّة',           en:'Gaza',          fr:'Gaza',          tr:'Gazze',        ur:'غزہ',           de:'Gaza',          id:'Gaza',          es:'Gaza',         bn:'গাজা',            ms:'Gaza' },
    ramallah:      { ar:'رام الله',       en:'Ramallah',      fr:'Ramallah',      tr:'Ramallah',     ur:'رام اللہ',      de:'Ramallah',      id:'Ramallah',      es:'Ramala',       bn:'রামাল্লা',        ms:'Ramallah' },
    homs:          { ar:'حمص',            en:'Homs',          fr:'Homs',          tr:'Humus',        ur:'حمص',           de:'Homs',          id:'Homs',          es:'Homs',         bn:'হোমস',           ms:'Homs' },
    aden:          { ar:'عدن',            en:'Aden',          fr:'Aden',          tr:'Aden',         ur:'عدن',           de:'Aden',          id:'Aden',          es:'Adén',         bn:'এডেন',            ms:'Aden' },
    basra:         { ar:'البصرة',         en:'Basra',         fr:'Bassora',       tr:'Basra',        ur:'بصرہ',          de:'Basra',         id:'Basra',         es:'Basora',       bn:'বসরা',           ms:'Basra' },
    mosul:         { ar:'الموصل',         en:'Mosul',         fr:'Mossoul',       tr:'Musul',        ur:'موصل',          de:'Mosul',         id:'Mosul',         es:'Mosul',        bn:'মসুল',            ms:'Mosul' },
    marrakesh:     { ar:'مرّاكش',         en:'Marrakesh',     fr:'Marrakech',     tr:'Marakeş',      ur:'مراکش',         de:'Marrakesch',    id:'Marrakesh',     es:'Marrakech',    bn:'মারাকেশ',         ms:'Marrakesh' },
    marrakech:     { ar:'مرّاكش',         en:'Marrakesh',     fr:'Marrakech',     tr:'Marakeş',      ur:'مراکش',         de:'Marrakesch',    id:'Marrakesh',     es:'Marrakech',    bn:'মারাকেশ',         ms:'Marrakesh' }, // مرادف slug
    // مدن سعوديّة إضافيّة
    dammam:        { ar:'الدمام',         en:'Dammam',        fr:'Dammam',        tr:'Dammam',       ur:'دمام',          de:'Dammam',        id:'Dammam',        es:'Dammam',       bn:'দাম্মাম',         ms:'Dammam' },
    taif:          { ar:'الطائف',         en:'Taif',          fr:'Taëf',          tr:'Taif',         ur:'طائف',          de:'Taif',          id:'Taif',          es:'Taif',         bn:'তায়েফ',           ms:'Taif' },
    'at-taif':     { ar:'الطائف',         en:'Taif',          fr:'Taëf',          tr:'Taif',         ur:'طائف',          de:'Taif',          id:'Taif',          es:'Taif',         bn:'তায়েফ',           ms:'Taif' }, // مرادف slug (OSM/Wikipedia)
    khobar:        { ar:'الخبر',          en:'Khobar',        fr:'Al Khobar',     tr:'El Hubar',     ur:'الخبر',         de:'Al-Chubar',     id:'Al Khobar',     es:'Al-Khobar',    bn:'আল খোবার',        ms:'Khobar' },
    tabuk:         { ar:'تبوك',           en:'Tabuk',         fr:'Tabouk',        tr:'Tebük',        ur:'تبوک',          de:'Tabuk',         id:'Tabuk',         es:'Tabuk',        bn:'তাবুক',           ms:'Tabuk' },
    buraidah:      { ar:'بريدة',          en:'Buraidah',      fr:'Buraydah',      tr:'Bureyde',      ur:'بریدہ',         de:'Buraida',       id:'Buraidah',      es:'Buraida',      bn:'বুরাইদাহ',        ms:'Buraidah' },
    abha:          { ar:'أبها',           en:'Abha',          fr:'Abha',          tr:'Abha',         ur:'ابها',          de:'Abha',          id:'Abha',          es:'Abha',         bn:'আবহা',           ms:'Abha' },
    yanbu:         { ar:'ينبع',           en:'Yanbu',         fr:'Yanbu',         tr:'Yanbu',        ur:'ینبع',          de:'Yanbu',         id:'Yanbu',         es:'Yanbu',        bn:'ইয়ানবু',         ms:'Yanbu' },
    hail:          { ar:'حائل',           en:'Hail',          fr:'Haïl',          tr:'Hail',         ur:'حائل',          de:'Hāʾil',         id:'Hail',          es:'Hail',         bn:'হাইল',            ms:'Hail' },
    najran:        { ar:'نجران',          en:'Najran',        fr:'Najran',        tr:'Necran',       ur:'نجران',         de:'Nadschran',     id:'Najran',        es:'Nayrán',       bn:'নাজরান',          ms:'Najran' },
    jizan:         { ar:'جازان',          en:'Jizan',         fr:'Djizan',        tr:'Cizan',        ur:'جیزان',         de:'Dschāzān',      id:'Jizan',         es:'Jizan',        bn:'জিজান',           ms:'Jizan' },
    // مدن ماليزيّة إضافيّة (خارج kuala-lumpur)
    singapore:     { ar:'سنغافورة',       en:'Singapore',     fr:'Singapour',     tr:'Singapur',     ur:'سنگاپور',       de:'Singapur',      id:'Singapura',     es:'Singapur',     bn:'সিঙ্গাপুর',      ms:'Singapura' },
};

// ===== Round 9: FAMOUS_CITY_OVERRIDES — إحداثيّات المدن الشهيرة =====
// يُستعمَل لـ /moon-today-in-{slug} لفكّ تضارب المدن المتشابهة في الاسم
// (London=UK لا Canada، Tripoli=LY لا Lebanon، Paris=FR لا Texas، …) ولضمان
// موقع ثابت لمدن flagship في سكلّاف السيتي-سلَاغ قبل الرجوع إلى cities-*.json.
// Country code هو ISO-3166 alpha-2 (sa=Saudi Arabia، gb=United Kingdom، …).
const FAMOUS_CITY_OVERRIDES = {
    // الحرمان الشريفان
    mecca:         { lat: 21.4225, lng: 39.8262, cc: 'sa' },
    medina:        { lat: 24.4672, lng: 39.6112, cc: 'sa' },
    // عواصم وكبرى السعوديّة
    riyadh:        { lat: 24.7136, lng: 46.6753, cc: 'sa' },
    jeddah:        { lat: 21.4858, lng: 39.1925, cc: 'sa' },
    dammam:        { lat: 26.4207, lng: 50.0888, cc: 'sa' },
    // مصر
    cairo:         { lat: 30.0444, lng: 31.2357, cc: 'eg' },
    alexandria:    { lat: 31.2001, lng: 29.9187, cc: 'eg' },
    giza:          { lat: 30.0131, lng: 31.2089, cc: 'eg' },
    // تركيا
    istanbul:      { lat: 41.0082, lng: 28.9784, cc: 'tr' },
    ankara:        { lat: 39.9334, lng: 32.8597, cc: 'tr' },
    izmir:         { lat: 38.4237, lng: 27.1428, cc: 'tr' },
    bursa:         { lat: 40.1828, lng: 29.0665, cc: 'tr' },
    // إمارات + خليج
    dubai:         { lat: 25.2048, lng: 55.2708, cc: 'ae' },
    'abu-dhabi':   { lat: 24.4539, lng: 54.3773, cc: 'ae' },
    sharjah:       { lat: 25.3463, lng: 55.4209, cc: 'ae' },
    doha:          { lat: 25.2854, lng: 51.5310, cc: 'qa' },
    manama:        { lat: 26.2285, lng: 50.5860, cc: 'bh' },
    'manama-al':   { lat: 26.2285, lng: 50.5860, cc: 'bh' },
    muscat:        { lat: 23.5880, lng: 58.3829, cc: 'om' },
    'kuwait-city': { lat: 29.3759, lng: 47.9774, cc: 'kw' },
    // بلاد الشام + العراق
    amman:         { lat: 31.9454, lng: 35.9284, cc: 'jo' },
    'aqaba':       { lat: 29.5321, lng: 35.0063, cc: 'jo' },
    jerusalem:     { lat: 31.7683, lng: 35.2137, cc: 'ps' },
    damascus:      { lat: 33.5138, lng: 36.2765, cc: 'sy' },
    aleppo:        { lat: 36.2021, lng: 37.1343, cc: 'sy' },
    beirut:        { lat: 33.8938, lng: 35.5018, cc: 'lb' },
    baghdad:       { lat: 33.3152, lng: 44.3661, cc: 'iq' },
    basra:         { lat: 30.5258, lng: 47.7737, cc: 'iq' },
    mosul:         { lat: 36.3350, lng: 43.1189, cc: 'iq' },
    sanaa:         { lat: 15.3694, lng: 44.1910, cc: 'ye' },
    // المغرب العربيّ
    casablanca:    { lat: 33.5731, lng: -7.5898, cc: 'ma' },
    rabat:         { lat: 34.0209, lng: -6.8416, cc: 'ma' },
    marrakech:     { lat: 31.6295, lng: -7.9811, cc: 'ma' },
    tunis:         { lat: 36.8065, lng: 10.1815, cc: 'tn' },
    algiers:       { lat: 36.7538, lng:  3.0588, cc: 'dz' },
    tripoli:       { lat: 32.8872, lng: 13.1913, cc: 'ly' }, // ليبيا — يتفوّق على Tripoli-LB لأنّها أكبر
    khartoum:      { lat: 15.5007, lng: 32.5599, cc: 'sd' },
    nouakchott:    { lat: 18.0735, lng: -15.9582, cc: 'mr' },
    // جيبوتي (العاصمة) — slug خاصّ لفصلها عن slug الدولة "djibouti"
    'djibouti-city':{ lat: 11.595, lng: 43.1481, cc: 'dj' },
    // جنوب آسيا
    karachi:       { lat: 24.8607, lng: 67.0011, cc: 'pk' },
    lahore:        { lat: 31.5204, lng: 74.3587, cc: 'pk' },
    islamabad:     { lat: 33.6844, lng: 73.0479, cc: 'pk' },
    rawalpindi:    { lat: 33.5651, lng: 73.0169, cc: 'pk' },
    multan:        { lat: 30.1575, lng: 71.5249, cc: 'pk' },
    peshawar:      { lat: 34.0151, lng: 71.5249, cc: 'pk' },
    quetta:        { lat: 30.1798, lng: 66.9750, cc: 'pk' },
    dhaka:         { lat: 23.8103, lng: 90.4125, cc: 'bd' },
    chittagong:    { lat: 22.3569, lng: 91.7832, cc: 'bd' },
    kabul:         { lat: 34.5553, lng: 69.2075, cc: 'af' },
    kandahar:      { lat: 31.6289, lng: 65.7372, cc: 'af' },
    herat:         { lat: 34.3529, lng: 62.2040, cc: 'af' },
    // جنوب شرق آسيا
    jakarta:       { lat: -6.2088, lng: 106.8456, cc: 'id' },
    surabaya:      { lat: -7.2575, lng: 112.7521, cc: 'id' },
    bandung:       { lat: -6.9175, lng: 107.6191, cc: 'id' },
    medan:         { lat:  3.5952, lng: 98.6722,  cc: 'id' },
    'kuala-lumpur':{ lat:  3.1390, lng: 101.6869, cc: 'my' },
    johor:         { lat:  1.4927, lng: 103.7414, cc: 'my' },
    penang:        { lat:  5.4141, lng: 100.3288, cc: 'my' },
    singapore:     { lat:  1.3521, lng: 103.8198, cc: 'sg' },
    'singapore-city':{ lat:  1.3521, lng: 103.8198, cc: 'sg' }, // slug خاصّ للمدينة لتفادي تضارب مع slug الدولة
    bandar:        { lat:  4.9031, lng: 114.9398, cc: 'bn' }, // بندر سري بكاوان
    manila:        { lat: 14.5995, lng: 120.9842, cc: 'ph' },
    // إيران + آسيا الوسطى + تركيا الأوروبيّة
    tehran:        { lat: 35.6892, lng: 51.3890, cc: 'ir' },
    mashhad:       { lat: 36.2605, lng: 59.6168, cc: 'ir' },
    isfahan:       { lat: 32.6546, lng: 51.6680, cc: 'ir' },
    qom:           { lat: 34.6401, lng: 50.8764, cc: 'ir' },
    tashkent:      { lat: 41.2995, lng: 69.2401, cc: 'uz' },
    samarkand:     { lat: 39.6542, lng: 66.9597, cc: 'uz' },
    bukhara:       { lat: 39.7747, lng: 64.4286, cc: 'uz' },
    baku:          { lat: 40.4093, lng: 49.8671, cc: 'az' },
    dushanbe:      { lat: 38.5598, lng: 68.7870, cc: 'tj' },
    bishkek:       { lat: 42.8746, lng: 74.5698, cc: 'kg' },
    astana:        { lat: 51.1605, lng: 71.4704, cc: 'kz' },
    almaty:        { lat: 43.2220, lng: 76.8512, cc: 'kz' },
    // أفريقيا
    mogadishu:     { lat:  2.0469, lng: 45.3182, cc: 'so' },
    addis:         { lat:  9.0320, lng: 38.7469, cc: 'et' },
    lagos:         { lat:  6.5244, lng:  3.3792, cc: 'ng' },
    abuja:         { lat:  9.0765, lng:  7.3986, cc: 'ng' },
    kano:          { lat: 12.0022, lng:  8.5920, cc: 'ng' },
    nairobi:       { lat: -1.2921, lng: 36.8219, cc: 'ke' },
    dar:           { lat: -6.7924, lng: 39.2083, cc: 'tz' }, // دار السلام
    // الشتات الغربيّ (يحلّ نزاعات الأسماء)
    london:        { lat: 51.5074, lng: -0.1278, cc: 'gb' }, // London=GB (ليس Canada)
    birmingham:    { lat: 52.4862, lng: -1.8904, cc: 'gb' }, // Birmingham=GB (ليس Alabama)
    manchester:    { lat: 53.4808, lng: -2.2426, cc: 'gb' }, // Manchester=GB (ليس New Hampshire)
    paris:         { lat: 48.8566, lng:  2.3522, cc: 'fr' }, // Paris=FR (ليس Texas)
    lyon:          { lat: 45.7640, lng:  4.8357, cc: 'fr' },
    marseille:     { lat: 43.2965, lng:  5.3698, cc: 'fr' },
    berlin:        { lat: 52.5200, lng: 13.4050, cc: 'de' },
    munich:        { lat: 48.1351, lng: 11.5820, cc: 'de' },
    hamburg:       { lat: 53.5511, lng:  9.9937, cc: 'de' },
    frankfurt:     { lat: 50.1109, lng:  8.6821, cc: 'de' },
    cologne:       { lat: 50.9375, lng:  6.9603, cc: 'de' },
    madrid:        { lat: 40.4168, lng: -3.7038, cc: 'es' },
    barcelona:     { lat: 41.3851, lng:  2.1734, cc: 'es' },
    rome:          { lat: 41.9028, lng: 12.4964, cc: 'it' },
    milan:         { lat: 45.4642, lng:  9.1900, cc: 'it' },
    amsterdam:     { lat: 52.3676, lng:  4.9041, cc: 'nl' },
    brussels:      { lat: 50.8503, lng:  4.3517, cc: 'be' },
    vienna:        { lat: 48.2082, lng: 16.3738, cc: 'at' },
    stockholm:     { lat: 59.3293, lng: 18.0686, cc: 'se' },
    oslo:          { lat: 59.9139, lng: 10.7522, cc: 'no' },
    copenhagen:    { lat: 55.6761, lng: 12.5683, cc: 'dk' },
    moscow:        { lat: 55.7558, lng: 37.6173, cc: 'ru' },
    'st-petersburg':{lat: 59.9311, lng: 30.3609, cc: 'ru' },
    // أمريكا
    'new-york':    { lat: 40.7128, lng: -74.0060, cc: 'us' },
    'new-york-city':{lat: 40.7128, lng: -74.0060, cc: 'us' },
    'los-angeles': { lat: 34.0522, lng: -118.2437, cc: 'us' },
    chicago:       { lat: 41.8781, lng: -87.6298, cc: 'us' },
    houston:       { lat: 29.7604, lng: -95.3698, cc: 'us' },
    dallas:        { lat: 32.7767, lng: -96.7970, cc: 'us' },
    detroit:       { lat: 42.3314, lng: -83.0458, cc: 'us' },
    toronto:       { lat: 43.6532, lng: -79.3832, cc: 'ca' },
    montreal:      { lat: 45.5017, lng: -73.5673, cc: 'ca' },
    vancouver:     { lat: 49.2827, lng: -123.1207, cc: 'ca' },
    ottawa:        { lat: 45.4215, lng: -75.6972, cc: 'ca' },
    calgary:       { lat: 51.0447, lng: -114.0719, cc: 'ca' },
    // أستراليا
    sydney:        { lat: -33.8688, lng: 151.2093, cc: 'au' },
    melbourne:     { lat: -37.8136, lng: 144.9631, cc: 'au' },
    perth:         { lat: -31.9505, lng: 115.8605, cc: 'au' },
};

// ===== Round 11: خريطة رمز الدولة → المنطقة الزمنيّة الرئيسيّة (IANA) =====
// تُستخدم لحساب توقيت المدينة الصحيح على صفحة القمر عندما لا تكون المدينة
// ضمن FAMOUS_CITY_OVERRIDES (أي قادمة من cities-xx.json مباشرة).
// ملاحظة: للدول متعدّدة المناطق (روسيا/الولايات المتّحدة/كندا/أستراليا/البرازيل…)
// نختار tz العاصمة أو أكثر منطقة استعمالاً؛ دقّة ±30 دقيقة للقمر كافية حتّى عند
// اختلاف الـ tz الدقيق لمدينة طرفيّة — لأنّ انكسار مطلع/مغيب القمر لن يتغيّر
// بأكثر من دقائق عبر نفس منطقة الدولة.
const _CC_TO_PRIMARY_TZ = {
    // الشرق الأوسط + العالم العربيّ
    sa: 'Asia/Riyadh', ae: 'Asia/Dubai', qa: 'Asia/Qatar', kw: 'Asia/Kuwait',
    bh: 'Asia/Bahrain', om: 'Asia/Muscat', ye: 'Asia/Aden', jo: 'Asia/Amman',
    iq: 'Asia/Baghdad', lb: 'Asia/Beirut', sy: 'Asia/Damascus', ps: 'Asia/Hebron',
    eg: 'Africa/Cairo', sd: 'Africa/Khartoum', ly: 'Africa/Tripoli',
    tn: 'Africa/Tunis', dz: 'Africa/Algiers', ma: 'Africa/Casablanca',
    mr: 'Africa/Nouakchott', so: 'Africa/Mogadishu', dj: 'Africa/Djibouti',
    km: 'Indian/Comoro',
    // تركيا + إيران + آسيا الوسطى
    tr: 'Europe/Istanbul', ir: 'Asia/Tehran', af: 'Asia/Kabul',
    pk: 'Asia/Karachi', uz: 'Asia/Tashkent', tj: 'Asia/Dushanbe',
    kg: 'Asia/Bishkek', tm: 'Asia/Ashgabat', kz: 'Asia/Almaty',
    az: 'Asia/Baku', am: 'Asia/Yerevan', ge: 'Asia/Tbilisi',
    // جنوب/شرق/جنوب شرق آسيا
    in: 'Asia/Kolkata', bd: 'Asia/Dhaka', np: 'Asia/Kathmandu',
    lk: 'Asia/Colombo', mv: 'Indian/Maldives', bt: 'Asia/Thimphu',
    mm: 'Asia/Yangon', th: 'Asia/Bangkok', la: 'Asia/Vientiane',
    kh: 'Asia/Phnom_Penh', vn: 'Asia/Ho_Chi_Minh', my: 'Asia/Kuala_Lumpur',
    sg: 'Asia/Singapore', id: 'Asia/Jakarta', bn: 'Asia/Brunei',
    ph: 'Asia/Manila', tl: 'Asia/Dili',
    cn: 'Asia/Shanghai', jp: 'Asia/Tokyo', kr: 'Asia/Seoul', kp: 'Asia/Pyongyang',
    mn: 'Asia/Ulaanbaatar', hk: 'Asia/Hong_Kong', tw: 'Asia/Taipei', mo: 'Asia/Macau',
    // أوروبا
    gb: 'Europe/London', ie: 'Europe/Dublin', fr: 'Europe/Paris', de: 'Europe/Berlin',
    nl: 'Europe/Amsterdam', be: 'Europe/Brussels', lu: 'Europe/Luxembourg',
    es: 'Europe/Madrid', pt: 'Europe/Lisbon', it: 'Europe/Rome', ch: 'Europe/Zurich',
    at: 'Europe/Vienna', se: 'Europe/Stockholm', no: 'Europe/Oslo',
    dk: 'Europe/Copenhagen', fi: 'Europe/Helsinki', is: 'Atlantic/Reykjavik',
    gr: 'Europe/Athens', cz: 'Europe/Prague', sk: 'Europe/Bratislava',
    hu: 'Europe/Budapest', ro: 'Europe/Bucharest', pl: 'Europe/Warsaw',
    ru: 'Europe/Moscow', ua: 'Europe/Kyiv', by: 'Europe/Minsk', md: 'Europe/Chisinau',
    xk: 'Europe/Belgrade', ba: 'Europe/Sarajevo', al: 'Europe/Tirane',
    mk: 'Europe/Skopje', hr: 'Europe/Zagreb', rs: 'Europe/Belgrade',
    bg: 'Europe/Sofia', si: 'Europe/Ljubljana', cy: 'Asia/Nicosia', mt: 'Europe/Malta',
    // أفريقيا — ما لم يُذكر أعلاه
    ng: 'Africa/Lagos', gh: 'Africa/Accra', ke: 'Africa/Nairobi', tz: 'Africa/Dar_es_Salaam',
    et: 'Africa/Addis_Ababa', ug: 'Africa/Kampala', rw: 'Africa/Kigali',
    za: 'Africa/Johannesburg', zm: 'Africa/Lusaka', zw: 'Africa/Harare',
    mz: 'Africa/Maputo', ao: 'Africa/Luanda', cd: 'Africa/Kinshasa',
    ml: 'Africa/Bamako', bf: 'Africa/Ouagadougou', ne: 'Africa/Niamey',
    td: 'Africa/Ndjamena', cm: 'Africa/Douala', ci: 'Africa/Abidjan',
    gn: 'Africa/Conakry', gm: 'Africa/Banjul', sl: 'Africa/Freetown',
    er: 'Africa/Asmara', ss: 'Africa/Juba', tg: 'Africa/Lome',
    bj: 'Africa/Porto-Novo', mg: 'Indian/Antananarivo', mu: 'Indian/Mauritius',
    lr: 'Africa/Monrovia', mw: 'Africa/Blantyre', sn: 'Africa/Dakar',
    // الأمريكتان
    us: 'America/New_York', ca: 'America/Toronto', mx: 'America/Mexico_City',
    gt: 'America/Guatemala', cu: 'America/Havana', do: 'America/Santo_Domingo',
    br: 'America/Sao_Paulo', ar: 'America/Argentina/Buenos_Aires',
    co: 'America/Bogota', pe: 'America/Lima', ve: 'America/Caracas',
    cl: 'America/Santiago', ec: 'America/Guayaquil', bo: 'America/La_Paz',
    py: 'America/Asuncion', uy: 'America/Montevideo', sr: 'America/Paramaribo',
    gy: 'America/Guyana', tt: 'America/Port_of_Spain', jm: 'America/Jamaica',
    pa: 'America/Panama', ht: 'America/Port-au-Prince', cr: 'America/Costa_Rica',
    // أوقيانوسيا
    au: 'Australia/Sydney', nz: 'Pacific/Auckland', fj: 'Pacific/Fiji', pg: 'Pacific/Port_Moresby',
};
// Helper: slug → tz عبر override أو الفهرس الديناميكيّ. يُرجع null إن تعذَّر.
function _tzFromCitySlug(slug) {
    const info = _resolveCityForMoon(slug);
    if (!info) return null;
    const cc = (info.cc || '').toLowerCase();
    return _CC_TO_PRIMARY_TZ[cc] || null;
}

// ===== Round 9: _resolveCityForMoon — استرجاع كامل لبيانات مدينة من slug =====
// يحاول: (1) FAMOUS_CITY_OVERRIDES ← (2) _getCitySlugIndex() ←
//   (3) reverse-redirect: لو الـ slug هو "makkah" (post-redirect form) لكن
//       الـ overrides تَستخدم "mecca" (المفتاح الدلاليّ)، نَقلب CURATED_REDIRECTS
//       (mecca→makkah) لإيجاد الـ slug المصدر ونحاول الجلب به ←
//   (4) null (→ 404).
// العائد: { lat, lng, cc? } أو null.
function _resolveCityForMoon(slug) {
    if (!slug) return null;
    const s = String(slug).toLowerCase();
    const fx = FAMOUS_CITY_OVERRIDES[s];
    if (fx) return fx;
    const idx = _getCitySlugIndex();
    const c = idx[s];
    if (c && typeof c.lat === 'number' && typeof c.lng === 'number') {
        return { lat: c.lat, lng: c.lng, cc: c.cc || '' };
    }
    // Reverse-redirect lookup: if some `oldSlug` in CURATED_REDIRECTS points
    // to `s` (e.g. mecca → makkah, madinah-region → madinah), try the source
    // slug — it likely exists in the dicts under its semantic name.
    if (CURATED_REDIRECTS) {
        for (const oldSlug in CURATED_REDIRECTS) {
            if (CURATED_REDIRECTS[oldSlug] !== s) continue;
            const fxOld = FAMOUS_CITY_OVERRIDES[oldSlug];
            if (fxOld) return fxOld;
            const cOld = idx[oldSlug];
            if (cOld && typeof cOld.lat === 'number' && typeof cOld.lng === 'number') {
                return { lat: cOld.lat, lng: cOld.lng, cc: cOld.cc || '' };
            }
        }
    }
    return null;
}

// ===== SSR-Prayer-Times: pre-compute prayer times for SEO-critical pages =====
// Returns { fajr, sunrise, dhuhr, asr, maghrib, isha } as "HH:MM" strings (24h)
// for the city resolved from `slug` (or Mecca defaults). Computed on the SERVER
// using js/prayer-times.js — same algorithm the browser runs, so client-side
// updates are seamless. Keys to inject:
//   #time-fajr / #time-sunrise / #time-dhuhr / #time-asr / #time-maghrib / #time-isha
// Method picked from countryCode (mirrors client autoSelectMethod() subset).
const _SSR_METHOD_BY_CC = {
    sa:'Makkah', ae:'Makkah', bh:'Makkah', om:'Makkah', ye:'Makkah',
    kw:'Kuwait', qa:'Qatar',
    sy:'Makkah', iq:'MWL', jo:'MWL', lb:'MWL', ps:'MWL',
    eg:'Egypt', ly:'Egypt', sd:'Egypt', ss:'Egypt',
    dz:'MWL', ma:'MWL', tn:'MWL', mr:'MWL',
    pk:'Karachi', in:'Karachi', bd:'Karachi', af:'Karachi',
    ir:'Tehran', tr:'Turkey',
    my:'Singapore', id:'Singapore', sg:'Singapore',
    us:'ISNA', ca:'ISNA', mx:'ISNA', br:'ISNA',
    no:'MWL', se:'MWL', fi:'MWL', dk:'MWL', is:'MWL',
    fr:'Makkah', de:'Makkah', gb:'Makkah', es:'Makkah', it:'Makkah',
    nl:'Makkah', ru:'Makkah', au:'MWL', nz:'MWL',
};

// Compute the IANA-timezone offset (in hours, fractional) for a given Date.
//   Uses Intl.DateTimeFormat (Node 14+). Falls back to 0 on parse failure.
function _ianaOffsetHours(iana, date) {
    if (!iana) return 0;
    try {
        const dtf = new Intl.DateTimeFormat('en-US', {
            timeZone: iana, timeZoneName: 'longOffset',
            hour: '2-digit', minute: '2-digit'
        });
        const parts = dtf.formatToParts(date);
        const tz = (parts.find(p => p.type === 'timeZoneName') || {}).value || '';
        // "GMT+03:00" / "GMT-05:30" / "GMT" → parse
        const m = tz.match(/GMT(?:([+-])(\d{1,2})(?::?(\d{2}))?)?/);
        if (!m || !m[1]) return 0;
        const sign = m[1] === '+' ? 1 : -1;
        const h = parseInt(m[2], 10) || 0;
        const mn = parseInt(m[3] || '0', 10);
        return sign * (h + mn / 60);
    } catch (_) { return 0; }
}

// Compute today's prayer times for the city resolved from `slug`.
//   Returns { fajr, sunrise, dhuhr, asr, maghrib, isha } as 24h "HH:MM"
//   strings, or `null` if the city can't be resolved (caller falls back to
//   leaving "--:--" placeholders).
function _ssrPrayerTimesFor(slug) {
    try {
        const info = (slug && typeof _resolveCityForMoon === 'function')
            ? _resolveCityForMoon(slug) : null;
        // Default to Mecca for homepage / unresolved slugs.
        const lat = (info && isFinite(info.lat)) ? info.lat : 21.4225;
        const lng = (info && isFinite(info.lng)) ? info.lng : 39.8262;
        const cc  = ((info && info.cc) || 'sa').toLowerCase();
        const iana = (typeof _CC_TO_PRIMARY_TZ !== 'undefined') ? _CC_TO_PRIMARY_TZ[cc] : null;
        const now = new Date();
        const tzOffset = iana ? _ianaOffsetHours(iana, now) : 3; // sa default
        // Configure PrayerTimes for this city's method (Makkah default).
        const method = _SSR_METHOD_BY_CC[cc] || 'Makkah';
        PrayerTimesSrv.setMethod(method);
        PrayerTimesSrv.setTimeFormat('24h'); // SSR always emits 24h; client formats per-lang
        const t = PrayerTimesSrv.getTimes(now, lat, lng, tzOffset);
        // Validate: NaN-protected by formatTime → returns "--:--", reject those
        const ok = ['fajr','sunrise','dhuhr','asr','maghrib','isha']
            .every(k => /^\d{2}:\d{2}$/.test(t[k] || ''));
        if (!ok) return null;
        return {
            fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr,
            asr: t.asr,   maghrib: t.maghrib, isha: t.isha
        };
    } catch (_e) { return null; }
}

// Inject pre-computed prayer times into HTML by replacing the "--:--"
//   placeholders inside #time-fajr / #time-sunrise / #time-dhuhr / #time-asr /
//   #time-maghrib / #time-isha. Idempotent — if the placeholders are already
//   filled, the regex won't match. Returns the modified html.
function _ssrInjectPrayerTimes(html, slug) {
    const t = _ssrPrayerTimesFor(slug);
    if (!t) return html;
    // Replace each "<div class="prayer-time" id="time-X">--:--</div>" with the
    //   real value. Use the literal id attribute for uniqueness; allow any
    //   intervening whitespace.
    return html
        .replace(/(id="time-fajr"[^>]*>)\s*--:--\s*(<)/,    `$1${t.fajr}$2`)
        .replace(/(id="time-sunrise"[^>]*>)\s*--:--\s*(<)/, `$1${t.sunrise}$2`)
        .replace(/(id="time-dhuhr"[^>]*>)\s*--:--\s*(<)/,   `$1${t.dhuhr}$2`)
        .replace(/(id="time-asr"[^>]*>)\s*--:--\s*(<)/,     `$1${t.asr}$2`)
        .replace(/(id="time-maghrib"[^>]*>)\s*--:--\s*(<)/, `$1${t.maghrib}$2`)
        .replace(/(id="time-isha"[^>]*>)\s*--:--\s*(<)/,    `$1${t.isha}$2`);
}

// ===== UAT-Moon-3: proximity-based slug fallback =====
// Used when a /moon-today-in-{slug}-{lat}-{lng} URL arrives with a slug
// that isn't in our DB but whose coordinates land on top of an entry we
// DO have under a different transliteration (Nominatim's Russian form
// "Yastrebovka" vs. our Ukrainian DB form "Iastrubivka", or any other
// quirk where the same physical place has two valid English names).
//
// Returns the canonical DB slug if some entry sits within `maxKm` of
// (lat, lng) — strictly local, ≤ 2 km is the default — else null.
// Different intent from _canonicalQiblaSlug's proximity (which snapped
// to a famous big city); this is "same place, different label" rather
// than "same region".
const _haversineKmSrv = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
            + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
            * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
};
function _findNearbyDbSlug(lat, lng, maxKm) {
    if (!isFinite(lat) || !isFinite(lng)) return null;
    const tol = (typeof maxKm === 'number' && maxKm > 0) ? maxKm : 2;
    const idx = _getCitySlugIndex();
    let bestSlug = null;
    let bestKm = Infinity;
    for (const slug in idx) {
        const c = idx[slug];
        if (!c || typeof c.lat !== 'number' || typeof c.lng !== 'number') continue;
        const d = _haversineKmSrv(lat, lng, c.lat, c.lng);
        if (d < bestKm) { bestKm = d; bestSlug = slug; }
    }
    return (bestSlug && bestKm <= tol) ? bestSlug : null;
}

// ===== Round 8C: فهرس كسول slug → {nameAr, lat, lng} من ملفّات db/cities-*.json =====
// يُبنى عند أوّل استعمال (lazy) لتجنّب تكاليف startup. O(N) مرّة واحدة فقط.
// lat/lng يستعملان لاستنباط توقيت المدينة لعرض تاريخها المحلّيّ الصحيح.
let _CITY_SLUG_INDEX = null;
function _getCitySlugIndex() {
    if (_CITY_SLUG_INDEX) return _CITY_SLUG_INDEX;
    _CITY_SLUG_INDEX = Object.create(null);
    try {
        const files = fs.readdirSync(DB_DIR).filter(f => /^cities-[a-z]{2}\.json$/.test(f));
        for (const f of files) {
            // استخرج رمز الدولة من اسم الملفّ cities-xx.json → 'xx'
            // نحتاجه لاستنتاج المنطقة الزمنيّة عبر _CC_TO_PRIMARY_TZ — ليُعرَض
            // شروق/غروب القمر بتوقيت المدينة الصحيح حتّى لو لم تكن ضمن
            // FAMOUS_CITY_OVERRIDES (مثل Tokyo من cities-jp.json).
            const ccMatch = f.match(/^cities-([a-z]{2})\.json$/);
            const cc = ccMatch ? ccMatch[1] : '';
            try {
                const arr = JSON.parse(fs.readFileSync(path.join(DB_DIR, f), 'utf8'));
                if (!Array.isArray(arr)) continue;
                for (const c of arr) {
                    if (c && c.nameAr && c.nameEn && typeof c.lat === 'number' && typeof c.lng === 'number') {
                        const slug = makeCitySlugSrv(c.nameEn, c.lat, c.lng);
                        // أوّل مُطابقة تفوز — يمنع تضارب المدن المتشابهة الأسماء
                        if (slug && !_CITY_SLUG_INDEX[slug]) {
                            _CITY_SLUG_INDEX[slug] = { nameAr: c.nameAr, nameEn: c.nameEn, lat: c.lat, lng: c.lng, cc };
                        }
                        // Round 10: تسجيل الـ slug القديم أيضاً (بلا NFD) لتوافُق رجعيّ
                        // مثلاً São Paulo يسجَّل تحت 'sao-paulo' (جديد) و 'so-paulo' (قديم)
                        const legacySlug = _makeCityLegacySlug(c.nameEn);
                        if (legacySlug && legacySlug !== slug && !_CITY_SLUG_INDEX[legacySlug]) {
                            _CITY_SLUG_INDEX[legacySlug] = { nameAr: c.nameAr, nameEn: c.nameEn, lat: c.lat, lng: c.lng, cc };
                        }
                    }
                }
            } catch { /* ملف JSON تالف — تخطّ */ }
        }
    } catch { /* لا مُجلَّد db — فارغ */ }
    return _CITY_SLUG_INDEX;
}
// توافُق رجعيّ مع الـ API القديم (slug → nameAr فقط)
function _getCitySlugToNameAr() {
    const idx = _getCitySlugIndex();
    const out = Object.create(null);
    for (const k in idx) out[k] = idx[k].nameAr;
    return out;
}
// استرجاع إحداثيّات مدينة من slug (للاستعمال في توقيت المدينة المحلّيّ)
function _getCityLngBySlug(slug) {
    const idx = _getCitySlugIndex();
    return idx[slug] ? idx[slug].lng : null;
}

// ===== Round 8: مُستنبِط اسم المدينة (B + C + fallback) =====
// (B) POPULAR_CITY_NAMES — 12 مدينة × 10 لغات → ترجمة كاملة.
// (C) cities-*.json — nameAr لكلّ المدن (العربيّة فقط).
// Fallback: _slugToTitle (slug مُهنْدَس حروف كبيرة).
// قائمة بادئات أداة التعريف العربيّة المُروَنة (الشمسيّة/القمريّة) — لاستبعادها عند البحث:
//   at-taif → taif، al-qahirah → qahirah، ad-dammam → dammam، إلخ.
// تُستعمل كـ fallback إذا لم يُوجد الـ slug الكامل في POPULAR_CITY_NAMES أو فهرس المدن.
const _ARAB_ARTICLE_PREFIX_RE = /^(at|al|el|ad|an|ar|as|ash|ath|az|ed)-/;

function _resolveCityName(slug, lang) {
    const _try = (s) => {
        const pop = POPULAR_CITY_NAMES[s];
        if (pop) return pop[lang] || pop.en || _slugToTitle(s);
        const idx = _getCitySlugIndex();
        const e = idx[s];
        if (e) {
            if (lang === 'ar') return e.nameAr;
            // اللغات غير العربيّة: استعمل nameEn من DB المدينة (قراءة لاتينيّة صحيحة)
            if (e.nameEn) return e.nameEn;
        }
        return null;
    };
    let resolved = _try(slug);
    if (resolved) return resolved;
    // Fallback: جرّب نزع بادئة "ال" العربيّة (at-/al-/ad-/an-/...) — يُغطّي أسماء OSM/Wikipedia
    if (_ARAB_ARTICLE_PREFIX_RE.test(slug)) {
        const stripped = slug.replace(_ARAB_ARTICLE_PREFIX_RE, '');
        resolved = _try(stripped);
        if (resolved) return resolved;
    }
    // Reverse-redirect: if some `oldSlug` in CURATED_REDIRECTS points to this
    // slug (e.g. mecca→makkah, medina→madinah, riyadh-region→riyadh), the
    // semantic name lives under the source. Look it up and return.
    if (CURATED_REDIRECTS) {
        const sLower = String(slug).toLowerCase();
        for (const oldSlug in CURATED_REDIRECTS) {
            if (CURATED_REDIRECTS[oldSlug] !== sLower) continue;
            resolved = _try(oldSlug);
            if (resolved) return resolved;
        }
    }
    return _slugToTitle(slug);
}

// كاش في الذاكرة لطلبات Nominatim (يمنع تكرار الطلبات ويتجنب rate limit)
// LRU محدود (10K مدخل) لمنع النمو اللانهائي تحت حمل كبير
const _GEOCACHE_MAX = 10000;
const _GEOCACHE_TTL = 24 * 60 * 60 * 1000; // 24 ساعة
const _geocodeCache = {
    _m: new Map(),
    get(k) {
        const v = this._m.get(k);
        if (v === undefined) return undefined;
        // LRU: إعادة الإدراج تنقل المفتاح إلى النهاية (الأحدث استخداماً)
        this._m.delete(k);
        this._m.set(k, v);
        return v;
    },
    set(k, v) {
        if (this._m.has(k)) this._m.delete(k);
        this._m.set(k, v);
        // طرد الأقدم (أول مفتاح في Map) عند تجاوز الحد
        while (this._m.size > _GEOCACHE_MAX) {
            const firstKey = this._m.keys().next().value;
            this._m.delete(firstKey);
        }
    }
};

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// ===== كاش الملفات الثابتة في الذاكرة =====
// عند الإقلاع، نحمّل أهم الملفات ونسختها المضغوطة إلى الذاكرة
// فلا نقرأ القرص ولا نضغط gzip في كل طلب
const _staticCache = new Map(); // fullPath → { data, gzipped, brotli }
// CSS المُصغَّر يُحفظ كنص للـ inline في HTML (يُزيل render-blocking request)
let _inlineCssText = '';
// Phase E5-a2: small critical CSS extracted from style.css (~15 KiB) — inlined
// at the top of <head> so first paint can happen before the full external
// style.css finishes downloading. Generated by scripts/_phase_e5_a2_critical_css.mjs
let _criticalCssText = '';
const _preloadPaths = [
    'css/style.css',
    'css/critical.css',
    'js/app.js', 'js/i18n.js', 'js/footer-cookie.js',
    'js/duas.js', 'js/hijri-date.js', 'js/prayer-times.js', 'js/moon.js', 'js/qibla.js',
    // Phase E6-a (2026-05-03): per-language i18n bundles. Browser loads ONLY
    // i18n-core.js + the user's lang (+ en fallback for non-AR/EN). Original
    // js/i18n.js (above) stays for Node-side require() in SSR — DO NOT remove.
    'js/i18n-core.js',
    'js/i18n/ar.js', 'js/i18n/en.js', 'js/i18n/fr.js', 'js/i18n/tr.js',
    'js/i18n/ur.js', 'js/i18n/de.js', 'js/i18n/id.js', 'js/i18n/es.js',
    'js/i18n/bn.js', 'js/i18n/ms.js',
    'index.html', 'prayer-times-cities.html', 'legal.html', 'countries.html',
    'sw.js',
];

// Preload + minify + compress async (terser is Promise-based)
// server.listen() awaits this via _preloadReady
const _cleanCss = new CleanCSS({ returnPromise: false, level: 2 });
async function _preloadStatic() {
    const _t0 = Date.now();
    let minSavings = 0;
    for (const rel of _preloadPaths) {
        try {
            const full = path.join(ROOT, rel);
            let data = fs.readFileSync(full);
            const originalSize = data.length;
            const ext = path.extname(rel).toLowerCase();
            try {
                if (ext === '.js') {
                    const src = data.toString('utf8');
                    const result = await Terser.minify(src, { compress: true, mangle: true });
                    if (result && result.code) data = Buffer.from(result.code, 'utf8');
                } else if (ext === '.css') {
                    const src = data.toString('utf8');
                    const result = _cleanCss.minify(src);
                    if (result && result.styles) {
                        data = Buffer.from(result.styles, 'utf8');
                        // حفظ النص لاستخدامه inline في HTML
                        if (rel === 'css/style.css') _inlineCssText = result.styles;
                        // Phase E5-a2: critical CSS (~15 KiB) inlined at top of <head>
                        if (rel === 'css/critical.css') _criticalCssText = result.styles;
                    }
                }
            } catch (me) {
                console.warn(`[Minify] Skipped ${rel}: ${me.message}`);
            }
            minSavings += (originalSize - data.length);
            let gzipped = null, brotli = null;
            try { gzipped = zlib.gzipSync(data); } catch(e) {}
            try { brotli = zlib.brotliCompressSync(data, {
                params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } // أقصى ضغط — مرة واحدة عند الإقلاع فقط
            }); } catch(e) {}
            _staticCache.set(full, { data, gzipped, brotli });
        } catch(e) { /* الملف قد لا يكون موجوداً، تجاهل */ }
    }
    const _dt = Date.now() - _t0;
    console.log(`[Cache] Preloaded ${_staticCache.size} files in ${_dt}ms — minified (saved ${(minSavings/1024).toFixed(1)} KB) + gzip + brotli`);
}
const _preloadReady = _preloadStatic();

// مساعد يقرأ من الكاش أولاً، وإلا يعود للقرص
// يُستخدم لتقديم index.html و prayer-times-cities.html بسرعة من الذاكرة
function readCachedFile(fullPath, cb) {
    const cached = _staticCache.get(fullPath);
    if (cached) return setImmediate(() => cb(null, cached.data));
    fs.readFile(fullPath, cb);
}

// ============================================================
// ===== LEGAL PAGES CONTENT (bilingual AR + EN) ===============
// ============================================================
const LEGAL_PAGES = {
    'privacy': {
        ar: `<h1>سياسة الخصوصية</h1>
<span class="legal-meta">آخر تحديث: ${new Date().toISOString().split('T')[0]}</span>
<p>نحن في موقع <strong>مواقيت الصلاة</strong> نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضّح هذه السياسة طبيعة المعلومات التي نجمعها وطريقة استخدامها.</p>
<h2>1. البيانات التي نجمعها</h2>
<p>نحن لا نطلب التسجيل ولا نخزّن بيانات شخصية على خوادمنا. تقتصر البيانات التي قد نتعامل معها على:</p>
<ul>
<li><strong>الموقع الجغرافي:</strong> يُستخدم لحساب مواقيت الصلاة واتجاه القبلة بدقة. يبقى الإذن اختيارياً، وتُخزَّن إحداثياتك محلياً في متصفحك فقط (localStorage).</li>
<li><strong>تفضيلات اللغة والإعدادات:</strong> تُخزَّن في المتصفح للحفاظ على تجربة موحدة عبر الزيارات.</li>
<li><strong>سجلات الخادم الفنية:</strong> تتضمن عنوان IP، نوع المتصفح، الصفحات المزارة، لأغراض الأمان والتحليلات المجمّعة فقط.</li>
</ul>
<h2>2. ملفات تعريف الارتباط (Cookies)</h2>
<p>نستخدم نوعين من ملفات تعريف الارتباط:</p>
<ul>
<li><strong>أساسية:</strong> ضرورية لعمل الموقع (تخزين اللغة، الموقع، إعدادات التذكير).</li>
<li><strong>إعلانية:</strong> عند تفعيل خدمة Google AdSense، قد تستخدم Google ملفات ارتباط لعرض إعلانات مخصّصة. يمكنك التحكم فيها عبر <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">إعدادات إعلانات Google</a>.</li>
</ul>
<h2>3. الخدمات الخارجية</h2>
<p>يستخدم الموقع الخدمات التالية لتوفير تجربة كاملة:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> للبحث عن المدن وتحويل الإحداثيات إلى أسماء مواقع.</li>
<li><strong>ويكيبيديا API:</strong> لجلب معلومات تاريخية ومدنية ضمن صفحات "عن المدينة".</li>
<li><strong>Google Fonts:</strong> لتحميل خط Cairo العربي.</li>
<li><strong>Google AdSense (اختياري):</strong> لعرض إعلانات تساعد في تشغيل الموقع مجاناً.</li>
</ul>
<h2>4. حقوقك</h2>
<p>لك الحق في:</p>
<ul>
<li>رفض إذن الموقع الجغرافي دون أن يتأثر تصفّحك للموقع.</li>
<li>مسح بيانات الموقع المخزّنة محلياً عبر إعدادات المتصفح.</li>
<li>تعطيل الإعلانات المخصّصة عبر إعدادات Google.</li>
<li>طلب أي معلومة إضافية عبر <a href="/contact">صفحة الاتصال</a>.</li>
</ul>
<h2>5. الأطفال</h2>
<p>الموقع مفتوح للجميع ولا يستهدف الأطفال دون 13 سنة بشكل خاص. لا نجمع أي بيانات شخصية من المستخدمين عمداً.</p>
<h2>6. تعديلات السياسة</h2>
<p>قد نُحدّث هذه السياسة دورياً. سيُعرض تاريخ آخر تحديث في أعلى الصفحة. الاستمرار في استخدام الموقع بعد التعديل يعني الموافقة على النسخة المحدّثة.</p>
<h2>7. التواصل</h2>
<p>لأي استفسار يخصّ هذه السياسة، يُرجى زيارة <a href="/contact">صفحة الاتصال</a>.</p>`,
        en: `<h1>Privacy Policy</h1>
<span class="legal-meta">Last updated: ${new Date().toISOString().split('T')[0]}</span>
<p>At <strong>Prayer Times</strong>, we respect your privacy and are committed to protecting your personal data. This policy explains what information we collect and how we use it.</p>
<h2>1. Data We Collect</h2>
<p>We do not require registration and do not store personal data on our servers. The information we may handle is limited to:</p>
<ul>
<li><strong>Geographic location:</strong> Used to calculate accurate prayer times and Qibla direction. Permission is optional, and your coordinates are stored only locally in your browser (localStorage).</li>
<li><strong>Language and preferences:</strong> Stored in your browser to provide a consistent experience across visits.</li>
<li><strong>Technical server logs:</strong> Include IP address, browser type, and visited pages, used for security and aggregated analytics only.</li>
</ul>
<h2>2. Cookies</h2>
<p>We use two types of cookies:</p>
<ul>
<li><strong>Essential:</strong> Necessary for site operation (storing language, location, reminder settings).</li>
<li><strong>Advertising:</strong> When Google AdSense is enabled, Google may use cookies to display personalized ads. You can manage these through <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>.</li>
</ul>
<h2>3. Third-Party Services</h2>
<p>The site uses the following services to provide a complete experience:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> for city search and reverse geocoding.</li>
<li><strong>Wikipedia API:</strong> to fetch historical and city information on About pages.</li>
<li><strong>Google Fonts:</strong> for loading the Cairo Arabic font.</li>
<li><strong>Google AdSense (optional):</strong> to display ads that help keep the site free.</li>
</ul>
<h2>4. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Decline location permission without affecting your browsing.</li>
<li>Clear locally stored site data via your browser settings.</li>
<li>Disable personalized ads through Google settings.</li>
<li>Request additional information via our <a href="/en/contact">Contact page</a>.</li>
</ul>
<h2>5. Children</h2>
<p>The site is open to everyone and is not specifically targeted at children under 13. We do not knowingly collect personal data from any user.</p>
<h2>6. Policy Updates</h2>
<p>We may update this policy periodically. The last update date will appear at the top of the page. Continued use of the site after changes means acceptance of the updated version.</p>
<h2>7. Contact</h2>
<p>For any questions about this policy, please visit our <a href="/en/contact">Contact page</a>.</p>`,
        fr: `<h1>Politique de confidentialité</h1>
<span class="legal-meta">Dernière mise à jour : ${new Date().toISOString().split('T')[0]}</span>
<p>Sur <strong>Heures de Prière</strong>, nous respectons votre vie privée et nous engageons à protéger vos données personnelles. Cette politique explique quelles informations nous collectons et comment nous les utilisons.</p>
<h2>1. Données que nous collectons</h2>
<p>Nous n'exigeons aucune inscription et ne stockons aucune donnée personnelle sur nos serveurs. Les informations éventuellement traitées se limitent à :</p>
<ul>
<li><strong>Localisation géographique :</strong> utilisée pour calculer avec précision les heures de prière et la direction de la Qibla. L'autorisation est facultative et vos coordonnées sont stockées uniquement localement dans votre navigateur (localStorage).</li>
<li><strong>Langue et préférences :</strong> stockées dans votre navigateur pour une expérience cohérente d'une visite à l'autre.</li>
<li><strong>Journaux techniques du serveur :</strong> incluent l'adresse IP, le type de navigateur et les pages visitées, utilisés uniquement pour la sécurité et les statistiques agrégées.</li>
</ul>
<h2>2. Cookies</h2>
<p>Nous utilisons deux types de cookies :</p>
<ul>
<li><strong>Essentiels :</strong> nécessaires au fonctionnement du site (stockage de la langue, de la localisation, des paramètres de rappel).</li>
<li><strong>Publicitaires :</strong> lorsque Google AdSense est activé, Google peut utiliser des cookies pour afficher des publicités personnalisées. Vous pouvez les gérer via les <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">paramètres des annonces Google</a>.</li>
</ul>
<h2>3. Services tiers</h2>
<p>Le site utilise les services suivants pour offrir une expérience complète :</p>
<ul>
<li><strong>OpenStreetMap Nominatim :</strong> pour la recherche de villes et le géocodage inversé.</li>
<li><strong>API Wikipédia :</strong> pour récupérer des informations historiques et municipales sur les pages « À propos ».</li>
<li><strong>Google Fonts :</strong> pour charger la police arabe Cairo.</li>
<li><strong>Google AdSense (facultatif) :</strong> pour afficher des publicités qui aident à maintenir le site gratuit.</li>
</ul>
<h2>4. Vos droits</h2>
<p>Vous avez le droit de :</p>
<ul>
<li>Refuser l'autorisation de localisation sans que cela n'affecte votre navigation.</li>
<li>Effacer les données du site stockées localement via les paramètres de votre navigateur.</li>
<li>Désactiver les publicités personnalisées via les paramètres Google.</li>
<li>Demander toute information supplémentaire via notre <a href="/fr/contact">page Contact</a>.</li>
</ul>
<h2>5. Enfants</h2>
<p>Le site est ouvert à tous et ne cible pas spécifiquement les enfants de moins de 13 ans. Nous ne collectons sciemment aucune donnée personnelle auprès des utilisateurs.</p>
<h2>6. Mises à jour de la politique</h2>
<p>Nous pouvons mettre à jour cette politique périodiquement. La date de dernière mise à jour apparaîtra en haut de la page. La poursuite de l'utilisation du site après modification implique l'acceptation de la version mise à jour.</p>
<h2>7. Contact</h2>
<p>Pour toute question concernant cette politique, veuillez consulter notre <a href="/fr/contact">page Contact</a>.</p>`,
        tr: `<h1>Gizlilik Politikası</h1>
<span class="legal-meta">Son güncelleme: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>Namaz Vakitleri</strong> olarak gizliliğinize saygı duyar ve kişisel verilerinizi korumayı taahhüt ederiz. Bu politika, hangi bilgileri topladığımızı ve nasıl kullandığımızı açıklar.</p>
<h2>1. Topladığımız Veriler</h2>
<p>Kayıt gerektirmeyiz ve sunucularımızda kişisel veri saklamayız. İşleyebileceğimiz bilgiler şunlarla sınırlıdır:</p>
<ul>
<li><strong>Coğrafi konum:</strong> Namaz vakitlerini ve Kıble yönünü doğru hesaplamak için kullanılır. İzin isteğe bağlıdır ve koordinatlarınız yalnızca tarayıcınızda yerel olarak saklanır (localStorage).</li>
<li><strong>Dil ve tercihler:</strong> Ziyaretler arası tutarlı bir deneyim için tarayıcınızda saklanır.</li>
<li><strong>Teknik sunucu kayıtları:</strong> IP adresi, tarayıcı türü ve ziyaret edilen sayfaları içerir; yalnızca güvenlik ve toplu analitik için kullanılır.</li>
</ul>
<h2>2. Çerezler</h2>
<p>İki tür çerez kullanıyoruz:</p>
<ul>
<li><strong>Temel:</strong> Sitenin çalışması için gerekli (dil, konum, hatırlatıcı ayarları).</li>
<li><strong>Reklam:</strong> Google AdSense etkinleştirildiğinde, Google kişiselleştirilmiş reklamlar göstermek için çerez kullanabilir. Bunları <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Reklam Ayarları</a> üzerinden yönetebilirsiniz.</li>
</ul>
<h2>3. Üçüncü Taraf Hizmetler</h2>
<p>Site, tam bir deneyim sunmak için aşağıdaki hizmetleri kullanır:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> şehir arama ve ters jeokodlama için.</li>
<li><strong>Wikipedia API:</strong> "Şehir Hakkında" sayfalarında tarihi ve şehir bilgilerini almak için.</li>
<li><strong>Google Fonts:</strong> Cairo Arapça yazı tipini yüklemek için.</li>
<li><strong>Google AdSense (isteğe bağlı):</strong> siteyi ücretsiz tutmaya yardımcı reklamları göstermek için.</li>
</ul>
<h2>4. Haklarınız</h2>
<p>Şu haklara sahipsiniz:</p>
<ul>
<li>Taramanızı etkilemeden konum iznini reddetmek.</li>
<li>Yerel olarak saklanan site verilerini tarayıcı ayarlarınızdan silmek.</li>
<li>Google ayarlarından kişiselleştirilmiş reklamları devre dışı bırakmak.</li>
<li><a href="/tr/contact">İletişim sayfamız</a> aracılığıyla ek bilgi talep etmek.</li>
</ul>
<h2>5. Çocuklar</h2>
<p>Site herkese açıktır ve özellikle 13 yaş altı çocukları hedeflemez. Hiçbir kullanıcıdan bilerek kişisel veri toplamıyoruz.</p>
<h2>6. Politika Güncellemeleri</h2>
<p>Bu politikayı periyodik olarak güncelleyebiliriz. Son güncelleme tarihi sayfanın üst kısmında görünecektir. Değişikliklerden sonra sitenin kullanılmaya devam edilmesi güncel sürümün kabul edildiği anlamına gelir.</p>
<h2>7. İletişim</h2>
<p>Bu politika hakkında sorularınız için lütfen <a href="/tr/contact">İletişim sayfamıza</a> bakın.</p>`,
        ur: `<h1>پرائیویسی پالیسی</h1>
<span class="legal-meta">آخری تازہ کاری: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>اوقاتِ نماز</strong> پر ہم آپ کی پرائیویسی کا احترام کرتے ہیں اور آپ کے ذاتی ڈیٹا کی حفاظت کے پابند ہیں۔ یہ پالیسی واضح کرتی ہے کہ ہم کون سی معلومات جمع کرتے ہیں اور انہیں کیسے استعمال کرتے ہیں۔</p>
<h2>1. جو ڈیٹا ہم جمع کرتے ہیں</h2>
<p>ہم رجسٹریشن کا مطالبہ نہیں کرتے اور اپنے سرورز پر کوئی ذاتی ڈیٹا محفوظ نہیں کرتے۔ جو معلومات ہم ہینڈل کر سکتے ہیں وہ محدود ہیں:</p>
<ul>
<li><strong>جغرافیائی مقام:</strong> نماز کے درست اوقات اور قبلہ کی سمت حساب کرنے کے لیے استعمال ہوتا ہے۔ اجازت اختیاری ہے، اور آپ کے کوآرڈینیٹس صرف آپ کے براؤزر میں مقامی طور پر محفوظ ہوتے ہیں (localStorage)۔</li>
<li><strong>زبان اور ترجیحات:</strong> وزٹس کے دوران یکساں تجربے کے لیے آپ کے براؤزر میں محفوظ۔</li>
<li><strong>تکنیکی سرور لاگز:</strong> IP ایڈریس، براؤزر کی قسم، اور دیکھے گئے صفحات شامل ہیں، صرف سیکیورٹی اور مجموعی تجزیات کے لیے۔</li>
</ul>
<h2>2. کوکیز</h2>
<p>ہم دو قسم کی کوکیز استعمال کرتے ہیں:</p>
<ul>
<li><strong>ضروری:</strong> سائٹ کے کام کرنے کے لیے لازمی (زبان، مقام، یاد دہانی کی ترتیبات محفوظ کرنا)۔</li>
<li><strong>اشتہاری:</strong> جب Google AdSense فعال ہو تو Google ذاتی نوعیت کے اشتہارات دکھانے کے لیے کوکیز استعمال کر سکتا ہے۔ آپ <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google ایڈ سیٹنگز</a> کے ذریعے انہیں کنٹرول کر سکتے ہیں۔</li>
</ul>
<h2>3. تیسرے فریق کی خدمات</h2>
<p>مکمل تجربہ فراہم کرنے کے لیے سائٹ مندرجہ ذیل خدمات استعمال کرتی ہے:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> شہروں کی تلاش اور الٹی جیوکوڈنگ کے لیے۔</li>
<li><strong>Wikipedia API:</strong> "شہر کے بارے میں" صفحات پر تاریخی اور شہری معلومات حاصل کرنے کے لیے۔</li>
<li><strong>Google Fonts:</strong> Cairo عربی فونٹ لوڈ کرنے کے لیے۔</li>
<li><strong>Google AdSense (اختیاری):</strong> سائٹ کو مفت رکھنے میں مدد کرنے والے اشتہارات دکھانے کے لیے۔</li>
</ul>
<h2>4. آپ کے حقوق</h2>
<p>آپ کو یہ حق حاصل ہے کہ:</p>
<ul>
<li>براؤزنگ کو متاثر کیے بغیر مقام کی اجازت سے انکار کریں۔</li>
<li>اپنی براؤزر کی ترتیبات کے ذریعے مقامی طور پر محفوظ ڈیٹا صاف کریں۔</li>
<li>Google کی ترتیبات کے ذریعے ذاتی اشتہارات بند کریں۔</li>
<li>ہمارے <a href="/ur/contact">رابطہ صفحہ</a> کے ذریعے اضافی معلومات طلب کریں۔</li>
</ul>
<h2>5. بچے</h2>
<p>سائٹ سب کے لیے کھلی ہے اور خاص طور پر 13 سال سے کم عمر کے بچوں کو نشانہ نہیں بناتی۔ ہم جان بوجھ کر کسی صارف سے ذاتی ڈیٹا جمع نہیں کرتے۔</p>
<h2>6. پالیسی اپ ڈیٹس</h2>
<p>ہم اس پالیسی کو وقتاً فوقتاً اپ ڈیٹ کر سکتے ہیں۔ آخری اپ ڈیٹ کی تاریخ صفحے کے اوپر ظاہر ہوگی۔ تبدیلیوں کے بعد سائٹ کا مسلسل استعمال اپ ڈیٹڈ ورژن کی قبولیت کا مطلب ہے۔</p>
<h2>7. رابطہ</h2>
<p>اس پالیسی سے متعلق کسی بھی سوال کے لیے، براہ کرم ہمارے <a href="/ur/contact">رابطہ صفحے</a> پر جائیں۔</p>`,
        de: `<h1>Datenschutzerklärung</h1>
<span class="legal-meta">Zuletzt aktualisiert: ${new Date().toISOString().split('T')[0]}</span>
<p>Bei <strong>Gebetszeiten</strong> respektieren wir Ihre Privatsphäre und verpflichten uns zum Schutz Ihrer persönlichen Daten. Diese Erklärung beschreibt, welche Informationen wir erheben und wie wir sie verwenden.</p>
<h2>1. Von uns erhobene Daten</h2>
<p>Wir verlangen keine Registrierung und speichern keine personenbezogenen Daten auf unseren Servern. Die von uns verarbeiteten Informationen beschränken sich auf:</p>
<ul>
<li><strong>Geografischer Standort:</strong> Wird verwendet, um präzise Gebetszeiten und die Qibla-Richtung zu berechnen. Die Erlaubnis ist optional, und Ihre Koordinaten werden ausschließlich lokal in Ihrem Browser gespeichert (localStorage).</li>
<li><strong>Sprache und Einstellungen:</strong> In Ihrem Browser gespeichert, um ein konsistentes Erlebnis über mehrere Besuche zu gewährleisten.</li>
<li><strong>Technische Server-Logs:</strong> Umfassen IP-Adresse, Browser-Typ und besuchte Seiten; werden nur zu Sicherheits- und aggregierten Analysezwecken verwendet.</li>
</ul>
<h2>2. Cookies</h2>
<p>Wir verwenden zwei Arten von Cookies:</p>
<ul>
<li><strong>Essenziell:</strong> Notwendig für den Betrieb der Seite (Speichern von Sprache, Standort, Erinnerungseinstellungen).</li>
<li><strong>Werbung:</strong> Wenn Google AdSense aktiviert ist, kann Google Cookies verwenden, um personalisierte Werbung anzuzeigen. Sie können diese über die <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google-Anzeigeneinstellungen</a> verwalten.</li>
</ul>
<h2>3. Dienste Dritter</h2>
<p>Die Website nutzt folgende Dienste, um ein vollständiges Erlebnis zu bieten:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> für die Städtesuche und das Reverse-Geocoding.</li>
<li><strong>Wikipedia-API:</strong> zum Abrufen von historischen und städtischen Informationen auf den Seiten „Über die Stadt".</li>
<li><strong>Google Fonts:</strong> zum Laden der arabischen Schriftart Cairo.</li>
<li><strong>Google AdSense (optional):</strong> zur Anzeige von Werbung, die hilft, die Seite kostenlos zu halten.</li>
</ul>
<h2>4. Ihre Rechte</h2>
<p>Sie haben das Recht:</p>
<ul>
<li>Die Standorterlaubnis zu verweigern, ohne dass dies Ihr Surfen beeinträchtigt.</li>
<li>Lokal gespeicherte Website-Daten über Ihre Browsereinstellungen zu löschen.</li>
<li>Personalisierte Werbung über die Google-Einstellungen zu deaktivieren.</li>
<li>Zusätzliche Informationen über unsere <a href="/de/contact">Kontaktseite</a> anzufordern.</li>
</ul>
<h2>5. Kinder</h2>
<p>Die Seite steht allen offen und richtet sich nicht speziell an Kinder unter 13 Jahren. Wir erheben wissentlich keine personenbezogenen Daten von Nutzern.</p>
<h2>6. Aktualisierungen der Richtlinie</h2>
<p>Wir können diese Richtlinie regelmäßig aktualisieren. Das Datum der letzten Aktualisierung wird oben auf der Seite angezeigt. Die fortgesetzte Nutzung der Seite nach Änderungen bedeutet die Zustimmung zur aktualisierten Version.</p>
<h2>7. Kontakt</h2>
<p>Für Fragen zu dieser Richtlinie besuchen Sie bitte unsere <a href="/de/contact">Kontaktseite</a>.</p>`,
        id: `<h1>Kebijakan Privasi</h1>
<span class="legal-meta">Terakhir diperbarui: ${new Date().toISOString().split('T')[0]}</span>
<p>Di <strong>Jadwal Sholat</strong>, kami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan ini menjelaskan informasi apa yang kami kumpulkan dan bagaimana kami menggunakannya.</p>
<h2>1. Data yang Kami Kumpulkan</h2>
<p>Kami tidak memerlukan pendaftaran dan tidak menyimpan data pribadi di server kami. Informasi yang kami tangani terbatas pada:</p>
<ul>
<li><strong>Lokasi geografis:</strong> Digunakan untuk menghitung jadwal sholat dan arah Kiblat yang akurat. Izin bersifat opsional, dan koordinat Anda disimpan hanya secara lokal di browser Anda (localStorage).</li>
<li><strong>Bahasa dan preferensi:</strong> Disimpan di browser Anda untuk memberikan pengalaman yang konsisten di setiap kunjungan.</li>
<li><strong>Log server teknis:</strong> Termasuk alamat IP, jenis browser, dan halaman yang dikunjungi, hanya digunakan untuk keamanan dan analisis agregat.</li>
</ul>
<h2>2. Cookie</h2>
<p>Kami menggunakan dua jenis cookie:</p>
<ul>
<li><strong>Esensial:</strong> Diperlukan untuk operasi situs (menyimpan bahasa, lokasi, pengaturan pengingat).</li>
<li><strong>Iklan:</strong> Ketika Google AdSense diaktifkan, Google dapat menggunakan cookie untuk menampilkan iklan yang dipersonalisasi. Anda dapat mengelolanya melalui <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Pengaturan Iklan Google</a>.</li>
</ul>
<h2>3. Layanan Pihak Ketiga</h2>
<p>Situs menggunakan layanan berikut untuk memberikan pengalaman lengkap:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> untuk pencarian kota dan reverse geocoding.</li>
<li><strong>Wikipedia API:</strong> untuk mengambil informasi historis dan kota pada halaman "Tentang".</li>
<li><strong>Google Fonts:</strong> untuk memuat font Cairo bahasa Arab.</li>
<li><strong>Google AdSense (opsional):</strong> untuk menampilkan iklan yang membantu menjaga situs tetap gratis.</li>
</ul>
<h2>4. Hak Anda</h2>
<p>Anda berhak untuk:</p>
<ul>
<li>Menolak izin lokasi tanpa memengaruhi aktivitas browsing Anda.</li>
<li>Menghapus data situs yang disimpan secara lokal melalui pengaturan browser Anda.</li>
<li>Menonaktifkan iklan yang dipersonalisasi melalui pengaturan Google.</li>
<li>Meminta informasi tambahan melalui <a href="/id/contact">Halaman Kontak</a>.</li>
</ul>
<h2>5. Anak-Anak</h2>
<p>Situs terbuka untuk semua orang dan tidak secara khusus ditujukan untuk anak-anak di bawah 13 tahun. Kami tidak secara sengaja mengumpulkan data pribadi dari pengguna mana pun.</p>
<h2>6. Pembaruan Kebijakan</h2>
<p>Kami dapat memperbarui kebijakan ini secara berkala. Tanggal pembaruan terakhir akan muncul di bagian atas halaman. Melanjutkan penggunaan situs setelah perubahan berarti menerima versi yang diperbarui.</p>
<h2>7. Kontak</h2>
<p>Untuk pertanyaan apa pun tentang kebijakan ini, silakan kunjungi <a href="/id/contact">Halaman Kontak</a> kami.</p>`,
        es: `<h1>Política de Privacidad</h1>
<span class="legal-meta">Última actualización: ${new Date().toISOString().split('T')[0]}</span>
<p>En <strong>Horarios de Oración</strong>, respetamos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política explica qué información recopilamos y cómo la usamos.</p>
<h2>1. Datos que Recopilamos</h2>
<p>No requerimos registro ni almacenamos datos personales en nuestros servidores. La información que manejamos se limita a:</p>
<ul>
<li><strong>Ubicación geográfica:</strong> se utiliza para calcular con precisión los horarios de oración y la dirección de la Qibla. El permiso es opcional, y tus coordenadas se almacenan únicamente de forma local en tu navegador (localStorage).</li>
<li><strong>Preferencias de idioma y configuración:</strong> se guardan en tu navegador para ofrecer una experiencia consistente en cada visita.</li>
<li><strong>Registros técnicos del servidor:</strong> incluyen dirección IP, tipo de navegador y páginas visitadas, usados solo para seguridad y análisis agregados.</li>
</ul>
<h2>2. Cookies</h2>
<p>Usamos dos tipos de cookies:</p>
<ul>
<li><strong>Esenciales:</strong> necesarias para el funcionamiento del sitio (idioma, ubicación, configuración de recordatorios).</li>
<li><strong>Publicitarias:</strong> cuando Google AdSense está activado, Google puede usar cookies para mostrar anuncios personalizados. Puedes gestionarlas en la <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">configuración de anuncios de Google</a>.</li>
</ul>
<h2>3. Servicios de Terceros</h2>
<p>El sitio utiliza los siguientes servicios para ofrecer una experiencia completa:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> para búsqueda de ciudades y geocodificación inversa.</li>
<li><strong>Wikipedia API:</strong> para recuperar información histórica y sobre ciudades en las páginas "Acerca de".</li>
<li><strong>Google Fonts:</strong> para cargar la fuente árabe Cairo.</li>
<li><strong>Google AdSense (opcional):</strong> para mostrar anuncios que ayudan a mantener el sitio gratuito.</li>
</ul>
<h2>4. Tus Derechos</h2>
<p>Tienes derecho a:</p>
<ul>
<li>Rechazar el permiso de ubicación sin afectar tu navegación.</li>
<li>Borrar los datos del sitio almacenados localmente mediante la configuración de tu navegador.</li>
<li>Desactivar los anuncios personalizados a través de la configuración de Google.</li>
<li>Solicitar información adicional a través de nuestra <a href="/es/contact">página de Contacto</a>.</li>
</ul>
<h2>5. Menores</h2>
<p>El sitio está abierto a todos y no está dirigido específicamente a menores de 13 años. No recopilamos intencionalmente datos personales de ningún usuario.</p>
<h2>6. Actualizaciones de la Política</h2>
<p>Podemos actualizar esta política periódicamente. La fecha de última actualización aparece en la parte superior de la página. El uso continuado del sitio tras los cambios implica la aceptación de la versión actualizada.</p>
<h2>7. Contacto</h2>
<p>Para cualquier pregunta sobre esta política, visita nuestra <a href="/es/contact">página de Contacto</a>.</p>`,
        bn: `<h1>গোপনীয়তা নীতি</h1>
<span class="legal-meta">সর্বশেষ আপডেট: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>নামাজের সময়সূচী</strong>-তে আমরা আপনার গোপনীয়তাকে সম্মান করি এবং আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। এই নীতি ব্যাখ্যা করে আমরা কোন তথ্য সংগ্রহ করি এবং কীভাবে তা ব্যবহার করি।</p>
<h2>১. আমরা যে তথ্য সংগ্রহ করি</h2>
<p>আমরা নিবন্ধন চাই না এবং আমাদের সার্ভারে কোনো ব্যক্তিগত তথ্য সংরক্ষণ করি না। আমরা যে তথ্য নিয়ে কাজ করি তা সীমাবদ্ধ:</p>
<ul>
<li><strong>ভৌগোলিক অবস্থান:</strong> নামাজের সময় ও কিবলার দিক নির্ভুলভাবে হিসাব করতে ব্যবহৃত হয়। অনুমতি ঐচ্ছিক, এবং আপনার স্থানাঙ্ক শুধু আপনার ব্রাউজারে (localStorage) স্থানীয়ভাবে সংরক্ষিত হয়।</li>
<li><strong>ভাষা ও সেটিংস পছন্দ:</strong> প্রতি সফরে একই অভিজ্ঞতা দিতে ব্রাউজারে সংরক্ষিত হয়।</li>
<li><strong>সার্ভারের কারিগরি লগ:</strong> IP ঠিকানা, ব্রাউজারের ধরন ও পরিদর্শিত পৃষ্ঠা অন্তর্ভুক্ত, শুধুমাত্র নিরাপত্তা ও সামগ্রিক বিশ্লেষণের জন্য ব্যবহৃত হয়।</li>
</ul>
<h2>২. কুকি</h2>
<p>আমরা দুই ধরনের কুকি ব্যবহার করি:</p>
<ul>
<li><strong>অপরিহার্য:</strong> সাইট চালানোর জন্য প্রয়োজনীয় (ভাষা, অবস্থান, রিমাইন্ডার সেটিংস সংরক্ষণ)।</li>
<li><strong>বিজ্ঞাপন:</strong> Google AdSense সক্রিয় হলে, Google ব্যক্তিগত বিজ্ঞাপন দেখাতে কুকি ব্যবহার করতে পারে। আপনি <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google বিজ্ঞাপন সেটিংস</a> থেকে এগুলো নিয়ন্ত্রণ করতে পারেন।</li>
</ul>
<h2>৩. তৃতীয় পক্ষের সেবা</h2>
<p>সম্পূর্ণ অভিজ্ঞতা দেওয়ার জন্য সাইটটি নিম্নলিখিত সেবাগুলো ব্যবহার করে:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> শহর অনুসন্ধান ও বিপরীত জিওকোডিংয়ের জন্য।</li>
<li><strong>Wikipedia API:</strong> "সম্পর্কে" পৃষ্ঠায় ঐতিহাসিক ও শহর সংক্রান্ত তথ্য আনার জন্য।</li>
<li><strong>Google Fonts:</strong> আরবি Cairo ফন্ট লোড করার জন্য।</li>
<li><strong>Google AdSense (ঐচ্ছিক):</strong> সাইট ফ্রি রাখতে সহায়তা করে এমন বিজ্ঞাপন দেখানোর জন্য।</li>
</ul>
<h2>৪. আপনার অধিকার</h2>
<p>আপনার অধিকার রয়েছে:</p>
<ul>
<li>ব্রাউজিংয়ে প্রভাব না ফেলে অবস্থান অনুমতি প্রত্যাখ্যান করার।</li>
<li>ব্রাউজার সেটিংসের মাধ্যমে স্থানীয়ভাবে সংরক্ষিত সাইট ডেটা মুছে ফেলার।</li>
<li>Google সেটিংসের মাধ্যমে ব্যক্তিগত বিজ্ঞাপন বন্ধ করার।</li>
<li>আমাদের <a href="/bn/contact">যোগাযোগ পৃষ্ঠা</a>-র মাধ্যমে অতিরিক্ত তথ্য অনুরোধ করার।</li>
</ul>
<h2>৫. শিশুরা</h2>
<p>সাইটটি সবার জন্য উন্মুক্ত এবং ১৩ বছরের নিচের শিশুদের জন্য বিশেষভাবে উদ্দিষ্ট নয়। আমরা কোনো ব্যবহারকারীর ব্যক্তিগত তথ্য ইচ্ছাকৃতভাবে সংগ্রহ করি না।</p>
<h2>৬. নীতি আপডেট</h2>
<p>আমরা এই নীতি নিয়মিত আপডেট করতে পারি। সর্বশেষ আপডেটের তারিখ পৃষ্ঠার উপরে দেখা যাবে। পরিবর্তনের পর সাইট ব্যবহার চালিয়ে যাওয়া আপডেটকৃত সংস্করণের সম্মতি বোঝায়।</p>
<h2>৭. যোগাযোগ</h2>
<p>এই নীতি সম্পর্কে কোনো প্রশ্নের জন্য, আমাদের <a href="/bn/contact">যোগাযোগ পৃষ্ঠা</a> দেখুন।</p>`,
        ms: `<h1>Dasar Privasi</h1>
<span class="legal-meta">Kemas kini terakhir: ${new Date().toISOString().split('T')[0]}</span>
<p>Di <strong>Waktu Solat</strong>, kami menghormati privasi anda dan komited untuk melindungi data peribadi anda. Dasar ini menerangkan maklumat yang kami kumpul dan cara kami menggunakannya.</p>
<h2>1. Data yang Kami Kumpul</h2>
<p>Kami tidak memerlukan pendaftaran dan tidak menyimpan data peribadi di pelayan kami. Maklumat yang kami uruskan terhad kepada:</p>
<ul>
<li><strong>Lokasi geografi:</strong> digunakan untuk mengira waktu solat dan arah Kiblat dengan tepat. Kebenaran bersifat pilihan, dan koordinat anda disimpan hanya secara tempatan di pelayar anda (localStorage).</li>
<li><strong>Bahasa dan keutamaan:</strong> disimpan di pelayar untuk menyediakan pengalaman konsisten pada setiap lawatan.</li>
<li><strong>Log pelayan teknikal:</strong> termasuk alamat IP, jenis pelayar dan halaman yang dilawati, digunakan hanya untuk keselamatan dan analisis agregat.</li>
</ul>
<h2>2. Kuki</h2>
<p>Kami menggunakan dua jenis kuki:</p>
<ul>
<li><strong>Penting:</strong> diperlukan untuk operasi laman (menyimpan bahasa, lokasi, tetapan peringatan).</li>
<li><strong>Pengiklanan:</strong> apabila Google AdSense diaktifkan, Google mungkin menggunakan kuki untuk memaparkan iklan diperibadikan. Anda boleh menguruskannya melalui <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Tetapan Iklan Google</a>.</li>
</ul>
<h2>3. Perkhidmatan Pihak Ketiga</h2>
<p>Laman ini menggunakan perkhidmatan berikut untuk pengalaman lengkap:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> untuk carian bandar dan pengekodan geo songsang.</li>
<li><strong>Wikipedia API:</strong> untuk mendapatkan maklumat sejarah dan bandar di halaman "Tentang".</li>
<li><strong>Google Fonts:</strong> untuk memuat fon Cairo Arab.</li>
<li><strong>Google AdSense (pilihan):</strong> untuk memaparkan iklan yang membantu memastikan laman ini percuma.</li>
</ul>
<h2>4. Hak Anda</h2>
<p>Anda berhak untuk:</p>
<ul>
<li>Menolak kebenaran lokasi tanpa menjejaskan penyemakan imbas anda.</li>
<li>Memadam data laman yang disimpan secara tempatan melalui tetapan pelayar anda.</li>
<li>Menyahaktifkan iklan diperibadikan melalui tetapan Google.</li>
<li>Meminta maklumat tambahan melalui <a href="/ms/contact">Halaman Hubungi Kami</a>.</li>
</ul>
<h2>5. Kanak-kanak</h2>
<p>Laman ini terbuka untuk semua dan tidak ditujukan khusus untuk kanak-kanak di bawah 13 tahun. Kami tidak mengumpul data peribadi mana-mana pengguna secara sengaja.</p>
<h2>6. Kemas Kini Dasar</h2>
<p>Kami mungkin mengemas kini dasar ini dari semasa ke semasa. Tarikh kemas kini terakhir akan dipaparkan di bahagian atas halaman. Penggunaan berterusan laman ini selepas perubahan bermaksud anda menerima versi yang dikemas kini.</p>
<h2>7. Hubungi Kami</h2>
<p>Untuk sebarang pertanyaan tentang dasar ini, sila lawati <a href="/ms/contact">Halaman Hubungi Kami</a>.</p>`
    },
    'terms': {
        ar: `<h1>شروط الاستخدام</h1>
<span class="legal-meta">آخر تحديث: ${new Date().toISOString().split('T')[0]}</span>
<p>باستخدامك لموقع <strong>مواقيت الصلاة</strong>، فإنك توافق على الالتزام بالشروط التالية. يُرجى قراءتها بعناية قبل استخدام أي من خدمات الموقع.</p>
<h2>1. وصف الخدمة</h2>
<p>يُقدّم الموقع خدمات إسلامية مجانية، تشمل:</p>
<ul>
<li>مواقيت الصلاة الخمس بناءً على موقعك الجغرافي.</li>
<li>اتجاه القبلة وبوصلة تفاعلية.</li>
<li>التقويم الهجري ومحوّل التواريخ.</li>
<li>مجموعة الأدعية والأذكار من الكتاب والسنة.</li>
<li>المسبحة الإلكترونية وحاسبة الزكاة.</li>
</ul>
<h2>2. إخلاء المسؤولية عن الدقة</h2>
<p>نسعى دائماً لتوفير أدق المواقيت، إلا أن:</p>
<ul>
<li>مواقيت الصلاة محسوبة باستخدام معادلات فلكية موثوقة، وقد تختلف بدقائق قليلة عن المواقيت الرسمية في بلدك.</li>
<li>التقويم الهجري يعتمد على تقويم أم القرى (السعودية)، وقد يختلف يومًا واحداً عن رؤية بلدك.</li>
<li>اتجاه القبلة محسوب جغرافياً بدقة، لكن دقة عرضه على البوصلة تعتمد على حساسات جهازك.</li>
</ul>
<p>المسؤولية النهائية عن إثبات أوقات الصلاة ورؤية الأهلّة تقع على المؤسسة الدينية في بلدك.</p>
<h2>3. الاستخدام المسموح</h2>
<p>يُسمح لك باستخدام الموقع لأغراض شخصية وتعليمية، ويُحظَر:</p>
<ul>
<li>إعادة نشر محتوى الموقع آلياً (Scraping) دون إذن خطي.</li>
<li>محاولة اختراق الموقع أو إرهاق خوادمه بطلبات مفرطة.</li>
<li>استخدام الموقع لأي غرض غير مشروع أو مخالف للأخلاق العامة.</li>
</ul>
<h2>4. الملكية الفكرية</h2>
<p>جميع حقوق التصميم، الكود، الواجهات، والشعارات محفوظة لمالك الموقع. أما النصوص الدينية (الآيات، الأحاديث، الأدعية) فهي ملك عام للأمة الإسلامية.</p>
<h2>5. الخدمات الخارجية</h2>
<p>الموقع يعتمد على خدمات طرف ثالث (انظر سياسة الخصوصية). نحن غير مسؤولين عن انقطاعها أو تغييرها.</p>
<h2>6. حدود المسؤولية</h2>
<p>الموقع يُقدَّم "كما هو" دون أي ضمان صريح أو ضمني. لا نتحمّل المسؤولية عن أي قرار ديني، مالي، أو شخصي يُتّخَذ بناءً على معلومات الموقع وحدها.</p>
<h2>7. تعديل الشروط</h2>
<p>نحتفظ بحق تعديل هذه الشروط في أي وقت. التعديلات تصبح سارية فور نشرها، واستمرار استخدامك للموقع يعني قبولك بها.</p>
<h2>8. القانون الحاكم</h2>
<p>تُحكم هذه الشروط بمبادئ القانون الدولي العام لاستخدام الإنترنت. في حال نشوء نزاع، يتم حلّه ودياً قدر الإمكان.</p>`,
        en: `<h1>Terms of Use</h1>
<span class="legal-meta">Last updated: ${new Date().toISOString().split('T')[0]}</span>
<p>By using the <strong>Prayer Times</strong> website, you agree to comply with the following terms. Please read them carefully before using any service.</p>
<h2>1. Service Description</h2>
<p>The site provides free Islamic services, including:</p>
<ul>
<li>The five daily prayer times based on your geographic location.</li>
<li>Qibla direction with interactive compass.</li>
<li>Hijri calendar and date converter.</li>
<li>Authentic duas and remembrance from the Quran and Sunnah.</li>
<li>Digital tasbih counter and Zakat calculator.</li>
</ul>
<h2>2. Accuracy Disclaimer</h2>
<p>We always strive to provide the most accurate times, however:</p>
<ul>
<li>Prayer times are calculated using reliable astronomical equations and may differ by a few minutes from the official times in your country.</li>
<li>The Hijri calendar follows the Umm al-Qura calendar (Saudi Arabia) and may differ by one day from your local moon sighting.</li>
<li>The Qibla direction is geographically accurate, but its display accuracy on a compass depends on your device sensors.</li>
</ul>
<p>The ultimate responsibility for confirming prayer times and moon sighting rests with the religious authority in your country.</p>
<h2>3. Permitted Use</h2>
<p>You may use the site for personal and educational purposes. The following are prohibited:</p>
<ul>
<li>Automated scraping of site content without written permission.</li>
<li>Attempting to hack the site or overload its servers with excessive requests.</li>
<li>Using the site for any unlawful or unethical purpose.</li>
</ul>
<h2>4. Intellectual Property</h2>
<p>All rights to design, code, interfaces, and logos are reserved by the site owner. Religious texts (verses, hadith, duas) are public property of the Muslim community.</p>
<h2>5. Third-Party Services</h2>
<p>The site relies on third-party services (see Privacy Policy). We are not responsible for their interruption or changes.</p>
<h2>6. Limitation of Liability</h2>
<p>The site is provided "as is" without any express or implied warranty. We are not liable for any religious, financial, or personal decision made solely based on information from the site.</p>
<h2>7. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Changes take effect upon publication, and your continued use of the site means acceptance.</p>
<h2>8. Governing Law</h2>
<p>These terms are governed by general international principles of internet use. In case of dispute, we seek amicable resolution whenever possible.</p>`,
        fr: `<h1>Conditions d'utilisation</h1>
<span class="legal-meta">Dernière mise à jour : ${new Date().toISOString().split('T')[0]}</span>
<p>En utilisant le site <strong>Heures de Prière</strong>, vous acceptez les conditions suivantes. Veuillez les lire attentivement avant d'utiliser tout service.</p>
<h2>1. Description du service</h2>
<p>Le site propose des services islamiques gratuits, notamment :</p>
<ul>
<li>Les cinq prières quotidiennes selon votre localisation géographique.</li>
<li>Direction de la Qibla avec boussole interactive.</li>
<li>Calendrier hégirien et convertisseur de dates.</li>
<li>Invocations et rappels authentiques du Coran et de la Sunna.</li>
<li>Tasbih numérique et calculateur de Zakat.</li>
</ul>
<h2>2. Clause de non-responsabilité sur l'exactitude</h2>
<p>Nous nous efforçons de fournir les heures les plus précises, cependant :</p>
<ul>
<li>Les heures de prière sont calculées avec des équations astronomiques fiables et peuvent différer de quelques minutes des heures officielles dans votre pays.</li>
<li>Le calendrier hégirien suit le calendrier d'Umm al-Qura (Arabie saoudite) et peut différer d'un jour par rapport à l'observation lunaire locale.</li>
<li>La direction de la Qibla est géographiquement précise, mais la précision d'affichage sur une boussole dépend des capteurs de votre appareil.</li>
</ul>
<p>La responsabilité ultime de confirmer les heures de prière et l'observation lunaire incombe à l'autorité religieuse de votre pays.</p>
<h2>3. Utilisation autorisée</h2>
<p>Vous pouvez utiliser le site à des fins personnelles et éducatives. Sont interdits :</p>
<ul>
<li>La récupération automatisée (scraping) du contenu sans autorisation écrite.</li>
<li>Toute tentative de piratage ou de surcharge des serveurs par des requêtes excessives.</li>
<li>L'utilisation du site à des fins illégales ou contraires à l'éthique.</li>
</ul>
<h2>4. Propriété intellectuelle</h2>
<p>Tous les droits sur la conception, le code, les interfaces et les logos sont réservés au propriétaire du site. Les textes religieux (versets, hadiths, invocations) sont un patrimoine public de la communauté musulmane.</p>
<h2>5. Services tiers</h2>
<p>Le site dépend de services tiers (voir la politique de confidentialité). Nous ne sommes pas responsables de leur interruption ou de leurs modifications.</p>
<h2>6. Limitation de responsabilité</h2>
<p>Le site est fourni « tel quel » sans aucune garantie expresse ou implicite. Nous ne sommes pas responsables des décisions religieuses, financières ou personnelles prises uniquement sur la base des informations du site.</p>
<h2>7. Modifications des conditions</h2>
<p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication, et votre utilisation continue du site implique votre acceptation.</p>
<h2>8. Loi applicable</h2>
<p>Ces conditions sont régies par les principes généraux internationaux d'utilisation d'Internet. En cas de litige, nous recherchons une résolution amiable autant que possible.</p>`,
        tr: `<h1>Kullanım Şartları</h1>
<span class="legal-meta">Son güncelleme: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>Namaz Vakitleri</strong> sitesini kullanarak aşağıdaki şartlara uymayı kabul etmiş olursunuz. Herhangi bir hizmeti kullanmadan önce lütfen dikkatle okuyun.</p>
<h2>1. Hizmet Açıklaması</h2>
<p>Site, aşağıdakileri içeren ücretsiz İslami hizmetler sunar:</p>
<ul>
<li>Coğrafi konumunuza göre beş vakit namaz.</li>
<li>Etkileşimli pusula ile Kıble yönü.</li>
<li>Hicri takvim ve tarih dönüştürücü.</li>
<li>Kur'an ve Sünnetten özgün dua ve zikirler.</li>
<li>Dijital tesbih ve Zekat hesaplayıcı.</li>
</ul>
<h2>2. Doğruluk Sorumluluğu Reddi</h2>
<p>Her zaman en doğru vakitleri sunmaya çalışıyoruz, ancak:</p>
<ul>
<li>Namaz vakitleri güvenilir astronomik denklemler kullanılarak hesaplanır ve ülkenizdeki resmi vakitlerden birkaç dakika farklılık gösterebilir.</li>
<li>Hicri takvim Ümmül Kura takvimini (Suudi Arabistan) takip eder ve yerel hilal gözleminden bir gün farklı olabilir.</li>
<li>Kıble yönü coğrafi olarak doğrudur, ancak pusuladaki görüntüleme doğruluğu cihazınızın sensörlerine bağlıdır.</li>
</ul>
<p>Namaz vakitlerinin ve hilal gözleminin nihai sorumluluğu ülkenizdeki dini otoriteye aittir.</p>
<h2>3. İzin Verilen Kullanım</h2>
<p>Siteyi kişisel ve eğitim amaçlı kullanabilirsiniz. Aşağıdakiler yasaktır:</p>
<ul>
<li>Site içeriğinin yazılı izin olmadan otomatik olarak kazınması (scraping).</li>
<li>Siteyi hacklemeye çalışmak veya aşırı isteklerle sunucuları aşırı yüklemek.</li>
<li>Siteyi yasa dışı veya etik dışı amaçlar için kullanmak.</li>
</ul>
<h2>4. Fikri Mülkiyet</h2>
<p>Tasarım, kod, arayüzler ve logolara ilişkin tüm haklar site sahibine aittir. Dini metinler (ayetler, hadisler, dualar) Müslüman topluluğunun kamu malıdır.</p>
<h2>5. Üçüncü Taraf Hizmetler</h2>
<p>Site üçüncü taraf hizmetlere dayanır (Gizlilik Politikasına bakın). Bunların kesintisi veya değişikliğinden sorumlu değiliz.</p>
<h2>6. Sorumluluk Sınırlaması</h2>
<p>Site açık veya zımni garanti olmaksızın "olduğu gibi" sunulmaktadır. Yalnızca site bilgilerine dayanılarak verilen herhangi bir dini, mali veya kişisel karardan sorumlu değiliz.</p>
<h2>7. Şartların Değiştirilmesi</h2>
<p>Bu şartları istediğimiz zaman değiştirme hakkını saklı tutarız. Değişiklikler yayın üzerine yürürlüğe girer ve siteyi kullanmaya devam etmeniz kabul anlamına gelir.</p>
<h2>8. Uygulanacak Hukuk</h2>
<p>Bu şartlar, internet kullanımının genel uluslararası ilkelerine tabidir. Anlaşmazlık durumunda mümkün olduğunca dostane çözüm ararız.</p>`,
        ur: `<h1>شرائط استعمال</h1>
<span class="legal-meta">آخری تازہ کاری: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>اوقاتِ نماز</strong> ویب سائٹ کا استعمال کرکے آپ مندرجہ ذیل شرائط کی پابندی پر متفق ہوتے ہیں۔ کسی بھی سروس کے استعمال سے پہلے براہ کرم انہیں غور سے پڑھیں۔</p>
<h2>1. سروس کی تفصیل</h2>
<p>یہ سائٹ مفت اسلامی خدمات فراہم کرتی ہے، جن میں شامل ہیں:</p>
<ul>
<li>آپ کے جغرافیائی مقام کے مطابق پانچ وقت کی نماز کے اوقات۔</li>
<li>انٹرایکٹو قطب نما کے ساتھ قبلہ کی سمت۔</li>
<li>ہجری کیلنڈر اور تاریخ کنورٹر۔</li>
<li>قرآن و سنت سے مستند دعائیں اور اذکار۔</li>
<li>ڈیجیٹل تسبیح اور زکوٰۃ کیلکولیٹر۔</li>
</ul>
<h2>2. درستگی سے متعلق دستبرداری</h2>
<p>ہم ہمیشہ سب سے درست اوقات فراہم کرنے کی کوشش کرتے ہیں، تاہم:</p>
<ul>
<li>نماز کے اوقات قابل اعتماد فلکیاتی مساواتوں کا استعمال کرتے ہوئے حساب کیے جاتے ہیں اور آپ کے ملک کے سرکاری اوقات سے چند منٹ مختلف ہو سکتے ہیں۔</li>
<li>ہجری کیلنڈر ام القریٰ کیلنڈر (سعودی عرب) کی پیروی کرتا ہے اور آپ کے مقامی چاند دیکھنے سے ایک دن مختلف ہو سکتا ہے۔</li>
<li>قبلہ کی سمت جغرافیائی طور پر درست ہے، لیکن قطب نما پر اس کی نمائش کی درستگی آپ کے ڈیوائس کے سینسرز پر منحصر ہے۔</li>
</ul>
<p>نماز کے اوقات اور چاند دیکھنے کی حتمی ذمہ داری آپ کے ملک کے مذہبی ادارے کی ہے۔</p>
<h2>3. اجازت شدہ استعمال</h2>
<p>آپ سائٹ کو ذاتی اور تعلیمی مقاصد کے لیے استعمال کر سکتے ہیں۔ درج ذیل ممنوع ہیں:</p>
<ul>
<li>تحریری اجازت کے بغیر سائٹ کے مواد کی خودکار اسکریپنگ۔</li>
<li>سائٹ کو ہیک کرنے کی کوشش یا ضرورت سے زیادہ درخواستوں سے سرور کو اوورلوڈ کرنا۔</li>
<li>سائٹ کو کسی غیر قانونی یا غیر اخلاقی مقصد کے لیے استعمال کرنا۔</li>
</ul>
<h2>4. دانشورانہ املاک</h2>
<p>ڈیزائن، کوڈ، انٹرفیس، اور لوگو کے تمام حقوق سائٹ کے مالک کے لیے محفوظ ہیں۔ مذہبی متون (آیات، احادیث، دعائیں) مسلم کمیونٹی کی عوامی ملکیت ہیں۔</p>
<h2>5. تیسرے فریق کی خدمات</h2>
<p>سائٹ تیسرے فریق کی خدمات پر انحصار کرتی ہے (پرائیویسی پالیسی دیکھیں)۔ ہم ان کی رکاوٹ یا تبدیلیوں کے ذمہ دار نہیں ہیں۔</p>
<h2>6. ذمہ داری کی حد</h2>
<p>سائٹ کسی بھی واضح یا مضمر ضمانت کے بغیر "جیسی ہے" فراہم کی جاتی ہے۔ صرف سائٹ کی معلومات کی بنیاد پر لیے گئے کسی مذہبی، مالی، یا ذاتی فیصلے کے لیے ہم ذمہ دار نہیں ہیں۔</p>
<h2>7. شرائط میں تبدیلی</h2>
<p>ہم کسی بھی وقت ان شرائط کو تبدیل کرنے کا حق محفوظ رکھتے ہیں۔ تبدیلیاں اشاعت کے بعد نافذ العمل ہوتی ہیں، اور سائٹ کا آپ کا مسلسل استعمال قبولیت کا مطلب ہے۔</p>
<h2>8. قابل اطلاق قانون</h2>
<p>یہ شرائط انٹرنیٹ کے استعمال کے عمومی بین الاقوامی اصولوں کے تحت ہیں۔ تنازعہ کی صورت میں، ہم جہاں تک ممکن ہو دوستانہ حل تلاش کرتے ہیں۔</p>`,
        de: `<h1>Nutzungsbedingungen</h1>
<span class="legal-meta">Zuletzt aktualisiert: ${new Date().toISOString().split('T')[0]}</span>
<p>Durch die Nutzung der Website <strong>Gebetszeiten</strong> erklären Sie sich mit den folgenden Bedingungen einverstanden. Bitte lesen Sie diese sorgfältig durch, bevor Sie einen der Dienste nutzen.</p>
<h2>1. Beschreibung des Dienstes</h2>
<p>Die Seite bietet kostenlose islamische Dienste, darunter:</p>
<ul>
<li>Die fünf täglichen Gebetszeiten basierend auf Ihrem geografischen Standort.</li>
<li>Qibla-Richtung mit interaktivem Kompass.</li>
<li>Hidschri-Kalender und Datumsumrechner.</li>
<li>Authentische Duas und Gedenken aus Koran und Sunna.</li>
<li>Digitaler Tasbih-Zähler und Zakat-Rechner.</li>
</ul>
<h2>2. Genauigkeitshinweis</h2>
<p>Wir bemühen uns stets, die genauesten Zeiten anzubieten, jedoch:</p>
<ul>
<li>Die Gebetszeiten werden mit zuverlässigen astronomischen Gleichungen berechnet und können um einige Minuten von den offiziellen Zeiten in Ihrem Land abweichen.</li>
<li>Der Hidschri-Kalender folgt dem Umm-al-Qura-Kalender (Saudi-Arabien) und kann um einen Tag von der lokalen Mondsichtung abweichen.</li>
<li>Die Qibla-Richtung ist geografisch präzise, aber die Anzeigegenauigkeit auf einem Kompass hängt von den Sensoren Ihres Geräts ab.</li>
</ul>
<p>Die letzte Verantwortung für die Bestätigung der Gebetszeiten und der Mondsichtung liegt bei der religiösen Autorität in Ihrem Land.</p>
<h2>3. Erlaubte Nutzung</h2>
<p>Sie dürfen die Seite für persönliche und Bildungszwecke nutzen. Folgendes ist untersagt:</p>
<ul>
<li>Automatisiertes Scraping von Seiteninhalten ohne schriftliche Genehmigung.</li>
<li>Versuche, die Seite zu hacken oder ihre Server mit übermäßigen Anfragen zu überlasten.</li>
<li>Die Nutzung der Seite für rechtswidrige oder unethische Zwecke.</li>
</ul>
<h2>4. Geistiges Eigentum</h2>
<p>Alle Rechte an Design, Code, Schnittstellen und Logos sind dem Eigentümer der Seite vorbehalten. Religiöse Texte (Verse, Hadithe, Duas) sind öffentliches Eigentum der muslimischen Gemeinschaft.</p>
<h2>5. Dienste Dritter</h2>
<p>Die Seite stützt sich auf Dienste Dritter (siehe Datenschutzerklärung). Wir übernehmen keine Verantwortung für deren Unterbrechung oder Änderung.</p>
<h2>6. Haftungsbeschränkung</h2>
<p>Die Seite wird „wie besehen" ohne ausdrückliche oder stillschweigende Gewährleistung bereitgestellt. Wir haften nicht für religiöse, finanzielle oder persönliche Entscheidungen, die ausschließlich auf Grundlage der Informationen dieser Seite getroffen werden.</p>
<h2>7. Änderungen der Bedingungen</h2>
<p>Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Änderungen treten mit ihrer Veröffentlichung in Kraft, und Ihre fortgesetzte Nutzung der Seite bedeutet Zustimmung.</p>
<h2>8. Geltendes Recht</h2>
<p>Diese Bedingungen unterliegen den allgemeinen internationalen Grundsätzen der Internetnutzung. Im Streitfall streben wir eine gütliche Einigung an, wann immer dies möglich ist.</p>`,
        id: `<h1>Syarat Penggunaan</h1>
<span class="legal-meta">Terakhir diperbarui: ${new Date().toISOString().split('T')[0]}</span>
<p>Dengan menggunakan situs <strong>Jadwal Sholat</strong>, Anda setuju untuk mematuhi syarat-syarat berikut. Harap baca dengan cermat sebelum menggunakan layanan situs apa pun.</p>
<h2>1. Deskripsi Layanan</h2>
<p>Situs ini menyediakan layanan Islami gratis, termasuk:</p>
<ul>
<li>Lima waktu sholat harian berdasarkan lokasi geografis Anda.</li>
<li>Arah Kiblat dengan kompas interaktif.</li>
<li>Kalender Hijriyah dan konverter tanggal.</li>
<li>Doa dan dzikir otentik dari Al-Qur'an dan Sunnah.</li>
<li>Tasbih digital dan kalkulator Zakat.</li>
</ul>
<h2>2. Catatan Akurasi</h2>
<p>Kami selalu berusaha memberikan waktu yang paling akurat, namun:</p>
<ul>
<li>Jadwal sholat dihitung menggunakan persamaan astronomi yang andal dan dapat berbeda beberapa menit dari waktu resmi di negara Anda.</li>
<li>Kalender Hijriyah mengikuti kalender Umm al-Qura (Arab Saudi) dan dapat berbeda satu hari dari rukyat hilal lokal.</li>
<li>Arah Kiblat akurat secara geografis, tetapi akurasi tampilannya pada kompas bergantung pada sensor perangkat Anda.</li>
</ul>
<p>Tanggung jawab akhir untuk mengonfirmasi waktu sholat dan rukyat hilal terletak pada otoritas agama di negara Anda.</p>
<h2>3. Penggunaan yang Diizinkan</h2>
<p>Anda dapat menggunakan situs ini untuk tujuan pribadi dan pendidikan. Hal berikut dilarang:</p>
<ul>
<li>Scraping otomatis terhadap konten situs tanpa izin tertulis.</li>
<li>Upaya meretas situs atau membebani servernya dengan permintaan berlebihan.</li>
<li>Menggunakan situs untuk tujuan yang melanggar hukum atau tidak etis.</li>
</ul>
<h2>4. Kekayaan Intelektual</h2>
<p>Semua hak atas desain, kode, antarmuka, dan logo dilindungi oleh pemilik situs. Teks-teks keagamaan (ayat, hadits, doa) merupakan milik publik komunitas Muslim.</p>
<h2>5. Layanan Pihak Ketiga</h2>
<p>Situs bergantung pada layanan pihak ketiga (lihat Kebijakan Privasi). Kami tidak bertanggung jawab atas gangguan atau perubahannya.</p>
<h2>6. Batasan Tanggung Jawab</h2>
<p>Situs disediakan "apa adanya" tanpa jaminan tersurat maupun tersirat. Kami tidak bertanggung jawab atas keputusan keagamaan, keuangan, atau pribadi apa pun yang diambil semata-mata berdasarkan informasi situs.</p>
<h2>7. Perubahan Syarat</h2>
<p>Kami berhak mengubah syarat-syarat ini kapan saja. Perubahan berlaku setelah dipublikasikan, dan penggunaan situs yang berkelanjutan berarti persetujuan Anda.</p>
<h2>8. Hukum yang Berlaku</h2>
<p>Syarat-syarat ini tunduk pada prinsip-prinsip umum internasional penggunaan internet. Jika terjadi sengketa, kami berupaya mencari solusi damai sebisa mungkin.</p>`,
        es: `<h1>Términos de Uso</h1>
<span class="legal-meta">Última actualización: ${new Date().toISOString().split('T')[0]}</span>
<p>Al usar el sitio <strong>Horarios de Oración</strong>, aceptas cumplir con los siguientes términos. Léelos cuidadosamente antes de usar cualquier servicio del sitio.</p>
<h2>1. Descripción del Servicio</h2>
<p>El sitio ofrece servicios islámicos gratuitos, entre ellos:</p>
<ul>
<li>Los cinco horarios de oración diarios según tu ubicación geográfica.</li>
<li>Dirección de la Qibla con una brújula interactiva.</li>
<li>Calendario Hégira y conversor de fechas.</li>
<li>Duas y dhikr auténticos tomados del Corán y la Sunnah.</li>
<li>Tasbih digital y calculadora de Zakat.</li>
</ul>
<h2>2. Nota sobre la Precisión</h2>
<p>Siempre nos esforzamos por ofrecer los tiempos más precisos, pero:</p>
<ul>
<li>Los horarios de oración se calculan con ecuaciones astronómicas fiables y pueden diferir en unos minutos respecto a los tiempos oficiales de tu país.</li>
<li>El calendario Hégira sigue el calendario Umm al-Qura (Arabia Saudí) y puede diferir en un día respecto al avistamiento local de la luna.</li>
<li>La dirección de la Qibla es geográficamente precisa, pero la exactitud de su visualización en la brújula depende de los sensores de tu dispositivo.</li>
</ul>
<p>La responsabilidad final de confirmar los horarios de oración y el avistamiento de la luna recae en las autoridades religiosas de tu país.</p>
<h2>3. Uso Permitido</h2>
<p>Puedes usar el sitio para fines personales y educativos. Queda prohibido:</p>
<ul>
<li>Extraer contenido del sitio de forma automatizada sin autorización por escrito.</li>
<li>Intentar piratear el sitio o sobrecargar sus servidores con peticiones excesivas.</li>
<li>Usar el sitio con fines ilegales o no éticos.</li>
</ul>
<h2>4. Propiedad Intelectual</h2>
<p>Todos los derechos sobre el diseño, el código, la interfaz y los logotipos están reservados por el propietario del sitio. Los textos religiosos (versículos, hadices, duas) son patrimonio público de la comunidad musulmana.</p>
<h2>5. Servicios de Terceros</h2>
<p>El sitio depende de servicios de terceros (ver la Política de Privacidad). No somos responsables de sus interrupciones ni de sus cambios.</p>
<h2>6. Limitación de Responsabilidad</h2>
<p>El sitio se ofrece "tal cual", sin garantías expresas ni implícitas. No somos responsables de ninguna decisión religiosa, financiera o personal tomada únicamente en base a la información del sitio.</p>
<h2>7. Cambios en los Términos</h2>
<p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran en vigor tras su publicación, y el uso continuado del sitio implica aceptación.</p>
<h2>8. Ley Aplicable</h2>
<p>Estos términos se rigen por los principios internacionales generales del uso de Internet. En caso de disputa, buscamos una solución amistosa siempre que sea posible.</p>`,
        bn: `<h1>শর্তাবলী</h1>
<span class="legal-meta">সর্বশেষ আপডেট: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>নামাজের সময়সূচী</strong> সাইটটি ব্যবহার করে, আপনি নিম্নলিখিত শর্তাবলী মেনে চলতে সম্মত হচ্ছেন। সাইটের যেকোনো সেবা ব্যবহারের আগে সেগুলো মনোযোগ সহকারে পড়ুন।</p>
<h2>১. সেবার বিবরণ</h2>
<p>সাইটটি বিনামূল্যে ইসলামি সেবা প্রদান করে, যার মধ্যে রয়েছে:</p>
<ul>
<li>আপনার ভৌগোলিক অবস্থানের উপর ভিত্তি করে পাঁচ ওয়াক্ত দৈনিক নামাজের সময়।</li>
<li>ইন্টারঅ্যাকটিভ কম্পাসের মাধ্যমে কিবলার দিক।</li>
<li>হিজরি ক্যালেন্ডার ও তারিখ রূপান্তরকারী।</li>
<li>কুরআন ও সুন্নাহ থেকে সহিহ দোয়া ও জিকির।</li>
<li>ডিজিটাল তাসবিহ ও যাকাত ক্যালকুলেটর।</li>
</ul>
<h2>২. নির্ভুলতা সম্পর্কিত নোট</h2>
<p>আমরা সর্বদা সবচেয়ে নির্ভুল সময় প্রদানের চেষ্টা করি, তবে:</p>
<ul>
<li>নামাজের সময় নির্ভরযোগ্য জ্যোতির্বিদ্যার সমীকরণ ব্যবহার করে হিসাব করা হয় এবং আপনার দেশের সরকারি সময়ের থেকে কয়েক মিনিট ভিন্ন হতে পারে।</li>
<li>হিজরি ক্যালেন্ডার উম্মুল কুরা ক্যালেন্ডার (সৌদি আরব) অনুসরণ করে এবং স্থানীয় চাঁদ দেখার তারিখ থেকে এক দিন ভিন্ন হতে পারে।</li>
<li>কিবলার দিক ভৌগোলিকভাবে সঠিক, তবে কম্পাসে এর প্রদর্শনের নির্ভুলতা আপনার ডিভাইসের সেন্সরের উপর নির্ভর করে।</li>
</ul>
<p>নামাজের সময় ও চাঁদ দেখার চূড়ান্ত নিশ্চিতকরণের দায়িত্ব আপনার দেশের ধর্মীয় কর্তৃপক্ষের উপর বর্তায়।</p>
<h2>৩. অনুমোদিত ব্যবহার</h2>
<p>আপনি ব্যক্তিগত ও শিক্ষামূলক উদ্দেশ্যে সাইটটি ব্যবহার করতে পারেন। নিম্নলিখিত বিষয়গুলো নিষিদ্ধ:</p>
<ul>
<li>লিখিত অনুমতি ছাড়া সাইটের কন্টেন্টের স্বয়ংক্রিয় স্ক্র্যাপিং।</li>
<li>সাইট হ্যাক করার চেষ্টা বা অতিরিক্ত অনুরোধ দিয়ে তার সার্ভারে অতিরিক্ত চাপ সৃষ্টি করা।</li>
<li>অবৈধ বা অনৈতিক উদ্দেশ্যে সাইট ব্যবহার করা।</li>
</ul>
<h2>৪. মেধাস্বত্ব</h2>
<p>ডিজাইন, কোড, ইন্টারফেস ও লোগোর সকল অধিকার সাইটের মালিকের কাছে সংরক্ষিত। ধর্মীয় পাঠ্যসমূহ (আয়াত, হাদিস, দোয়া) মুসলিম সমাজের সাধারণ সম্পত্তি।</p>
<h2>৫. তৃতীয় পক্ষের সেবা</h2>
<p>সাইটটি তৃতীয় পক্ষের সেবার উপর নির্ভর করে (গোপনীয়তা নীতি দেখুন)। আমরা তাদের বিঘ্ন বা পরিবর্তনের জন্য দায়ী নই।</p>
<h2>৬. দায়বদ্ধতার সীমা</h2>
<p>সাইটটি "যেমন আছে" ভিত্তিতে প্রদান করা হয়, কোনো প্রকাশ্য বা অন্তর্নিহিত ওয়ারেন্টি ছাড়াই। শুধু সাইটের তথ্যের উপর ভিত্তি করে নেওয়া কোনো ধর্মীয়, আর্থিক বা ব্যক্তিগত সিদ্ধান্তের জন্য আমরা দায়ী নই।</p>
<h2>৭. শর্তাবলীর পরিবর্তন</h2>
<p>আমরা যে কোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার সংরক্ষণ করি। পরিবর্তনগুলো প্রকাশের পর কার্যকর হয় এবং সাইট ব্যবহার চালিয়ে যাওয়া সম্মতির অর্থ বহন করে।</p>
<h2>৮. প্রযোজ্য আইন</h2>
<p>এই শর্তাবলী ইন্টারনেট ব্যবহারের সাধারণ আন্তর্জাতিক নীতির অধীন। কোনো বিরোধের ক্ষেত্রে, আমরা যতটা সম্ভব শান্তিপূর্ণ সমাধান খোঁজার চেষ্টা করি।</p>`,
        ms: `<h1>Terma Penggunaan</h1>
<span class="legal-meta">Kemas kini terakhir: ${new Date().toISOString().split('T')[0]}</span>
<p>Dengan menggunakan laman <strong>Waktu Solat</strong>, anda bersetuju untuk mematuhi terma berikut. Sila baca dengan teliti sebelum menggunakan mana-mana perkhidmatan laman.</p>
<h2>1. Penerangan Perkhidmatan</h2>
<p>Laman ini menyediakan perkhidmatan Islam percuma, termasuk:</p>
<ul>
<li>Lima waktu solat harian berdasarkan lokasi geografi anda.</li>
<li>Arah Kiblat dengan kompas interaktif.</li>
<li>Kalendar Hijrah dan penukar tarikh.</li>
<li>Doa dan zikir sahih dari Al-Quran dan Sunnah.</li>
<li>Tasbih digital dan kalkulator Zakat.</li>
</ul>
<h2>2. Nota Ketepatan</h2>
<p>Kami sentiasa berusaha memberikan waktu yang paling tepat, namun:</p>
<ul>
<li>Waktu solat dikira menggunakan persamaan astronomi yang boleh dipercayai dan mungkin berbeza beberapa minit dari waktu rasmi di negara anda.</li>
<li>Kalendar Hijrah mengikuti kalendar Umm al-Qura (Arab Saudi) dan mungkin berbeza satu hari dari rukyah tempatan.</li>
<li>Arah Kiblat adalah tepat dari segi geografi, tetapi ketepatan paparan pada kompas bergantung pada sensor peranti anda.</li>
</ul>
<p>Tanggungjawab akhir untuk mengesahkan waktu solat dan rukyah hilal terletak pada pihak berkuasa agama di negara anda.</p>
<h2>3. Penggunaan yang Dibenarkan</h2>
<p>Anda boleh menggunakan laman ini untuk tujuan peribadi dan pendidikan. Yang berikut adalah dilarang:</p>
<ul>
<li>Mengikis kandungan laman secara automatik tanpa kebenaran bertulis.</li>
<li>Cuba menggodam laman atau membebankan pelayannya dengan permintaan berlebihan.</li>
<li>Menggunakan laman untuk tujuan yang menyalahi undang-undang atau tidak beretika.</li>
</ul>
<h2>4. Harta Intelek</h2>
<p>Semua hak ke atas reka bentuk, kod, antara muka dan logo terpelihara oleh pemilik laman. Teks keagamaan (ayat, hadis, doa) adalah hak milik umum masyarakat Muslim.</p>
<h2>5. Perkhidmatan Pihak Ketiga</h2>
<p>Laman ini bergantung pada perkhidmatan pihak ketiga (rujuk Dasar Privasi). Kami tidak bertanggungjawab atas gangguan atau perubahannya.</p>
<h2>6. Had Tanggungjawab</h2>
<p>Laman ini disediakan "sebagaimana adanya" tanpa jaminan nyata atau tersirat. Kami tidak bertanggungjawab atas sebarang keputusan agama, kewangan atau peribadi yang dibuat hanya berdasarkan maklumat laman.</p>
<h2>7. Perubahan Terma</h2>
<p>Kami berhak mengubah terma ini pada bila-bila masa. Perubahan berkuat kuasa selepas diterbitkan, dan penggunaan berterusan laman bermaksud persetujuan.</p>
<h2>8. Undang-undang Terpakai</h2>
<p>Terma ini tertakluk kepada prinsip antarabangsa umum penggunaan Internet. Jika berlaku pertikaian, kami berusaha mencari penyelesaian secara baik sebisa mungkin.</p>`
    },
    'contact': {
        ar: `<h1>اتصل بنا</h1>
<p>يسعدنا تواصلكم معنا. سواء كان لديك سؤال، اقتراح، أو بلاغ عن خطأ في مواقيت الصلاة في مدينتك، فريقنا جاهز للاستماع إليك.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">للتواصل المباشر</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>أنواع الاستفسارات التي نستقبلها</h2>
<ul>
<li><strong>الإبلاغ عن مواقيت غير دقيقة:</strong> أرفق اسم المدينة، الإحداثيات (إن أمكن)، والفرق بين موقيت الموقع والموقت الرسمي في بلدك.</li>
<li><strong>اقتراحات تحسين:</strong> أي ميزة جديدة، تصميم أفضل، أو لغة تودّ إضافتها.</li>
<li><strong>طلبات شراكة:</strong> للأكاديميات، المساجد، أو التطبيقات التي تودّ استخدام بيانات الموقع.</li>
<li><strong>الإبلاغ عن أخطاء تقنية:</strong> صفحات لا تعمل، ميزات معطّلة، أو مشاكل في العرض.</li>
<li><strong>الأسئلة الدينية المتعلقة بالحساب:</strong> طريقة حساب مواقيت الصلاة، أوقات الفجر/العشاء، والمذاهب الفقهية المعتمَدة.</li>
</ul>
<h2>وقت الاستجابة</h2>
<p>نسعى للرد على جميع الرسائل خلال <strong>3-5 أيام عمل</strong>. الرسائل المتعلقة بأخطاء فنية تحظى بأولوية أعلى.</p>
<h2>قبل المراسلة</h2>
<p>قد تجد إجابة سؤالك في:</p>
<ul>
<li><a href="/about-us">صفحة "عن الموقع"</a> — تشرح مهمتنا وميزاتنا.</li>
<li><a href="/terms">شروط الاستخدام</a> — تجيب على أسئلة الدقة والمسؤولية.</li>
<li><a href="/privacy">سياسة الخصوصية</a> — تشرح كيف نتعامل مع بياناتك.</li>
</ul>
<h2>المتابعة على منصات التواصل</h2>
<p>تابعنا للحصول على آخر التحديثات والإعلانات والنشرات الدينيّة:</p>
<ul>
<li><a href="https://x.com/TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>X (تويتر): @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.youtube.com/@TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>يوتيوب: @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.linkedin.com/in/times-prayers-072861404" target="_blank" rel="noopener noreferrer"><strong>لينكد إن: Times Prayers</strong></a></li>
</ul>`,
        en: `<h1>Contact Us</h1>
<p>We are pleased to hear from you. Whether you have a question, suggestion, or report about inaccurate prayer times in your city, our team is ready to listen.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Direct contact</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Types of inquiries we receive</h2>
<ul>
<li><strong>Reporting inaccurate times:</strong> Include the city name, coordinates (if possible), and the difference between site times and the official times in your country.</li>
<li><strong>Improvement suggestions:</strong> Any new feature, better design, or additional language.</li>
<li><strong>Partnership requests:</strong> For academies, mosques, or apps that wish to use site data.</li>
<li><strong>Reporting technical errors:</strong> Non-working pages, broken features, or display issues.</li>
<li><strong>Religious questions about calculations:</strong> Methods of calculating prayer times, Fajr/Isha times, and adopted fiqh schools.</li>
</ul>
<h2>Response time</h2>
<p>We aim to reply to all messages within <strong>3–5 business days</strong>. Messages about technical errors receive higher priority.</p>
<h2>Before reaching out</h2>
<p>You may find your answer in:</p>
<ul>
<li><a href="/en/about-us">About Us page</a> — explains our mission and features.</li>
<li><a href="/en/terms">Terms of Use</a> — answers questions about accuracy and responsibility.</li>
<li><a href="/en/privacy">Privacy Policy</a> — explains how we handle your data.</li>
</ul>
<h2>Social media follow-up</h2>
<p>Follow us for the latest updates, announcements, and religious bulletins:</p>
<ul>
<li><a href="https://x.com/TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>X (Twitter): @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.youtube.com/@TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>YouTube: @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.linkedin.com/in/times-prayers-072861404" target="_blank" rel="noopener noreferrer"><strong>LinkedIn: Times Prayers</strong></a></li>
</ul>`,
        fr: `<h1>Contact</h1>
<p>Nous sommes heureux de vous lire. Que vous ayez une question, une suggestion ou un signalement concernant des heures de prière inexactes dans votre ville, notre équipe est prête à vous écouter.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Contact direct</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Types de demandes que nous recevons</h2>
<ul>
<li><strong>Signaler des heures inexactes :</strong> incluez le nom de la ville, les coordonnées (si possible), et la différence entre les heures du site et celles officielles dans votre pays.</li>
<li><strong>Suggestions d'amélioration :</strong> toute nouvelle fonctionnalité, un meilleur design ou une langue supplémentaire.</li>
<li><strong>Demandes de partenariat :</strong> pour les académies, mosquées ou applications souhaitant utiliser les données du site.</li>
<li><strong>Signalement d'erreurs techniques :</strong> pages qui ne fonctionnent pas, fonctionnalités cassées ou problèmes d'affichage.</li>
<li><strong>Questions religieuses sur les calculs :</strong> méthodes de calcul des heures, Fajr/Isha, et écoles de fiqh adoptées.</li>
</ul>
<h2>Délai de réponse</h2>
<p>Nous nous efforçons de répondre à tous les messages dans un délai de <strong>3 à 5 jours ouvrables</strong>. Les messages concernant des erreurs techniques sont prioritaires.</p>
<h2>Avant de nous contacter</h2>
<p>Vous pouvez trouver la réponse à votre question dans :</p>
<ul>
<li><a href="/fr/about-us">La page « À propos »</a> — explique notre mission et nos fonctionnalités.</li>
<li><a href="/fr/terms">Conditions d'utilisation</a> — répond aux questions de précision et de responsabilité.</li>
<li><a href="/fr/privacy">Politique de confidentialité</a> — explique comment nous traitons vos données.</li>
</ul>
<h2>Suivi sur les réseaux sociaux</h2>
<p>Suivez-nous pour les dernières mises à jour, annonces et bulletins religieux :</p>
<ul>
<li><a href="https://x.com/TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>X (Twitter) : @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.youtube.com/@TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>YouTube : @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.linkedin.com/in/times-prayers-072861404" target="_blank" rel="noopener noreferrer"><strong>LinkedIn : Times Prayers</strong></a></li>
</ul>`,
        tr: `<h1>İletişim</h1>
<p>Sizden haber almak bizi mutlu eder. Bir sorunuz, öneriniz veya şehrinizdeki yanlış namaz vakitleri hakkında bildiriminiz olsun, ekibimiz sizi dinlemeye hazırdır.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Doğrudan iletişim</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Aldığımız sorgu türleri</h2>
<ul>
<li><strong>Yanlış vakitleri bildirme:</strong> şehir adını, koordinatları (mümkünse) ve site vakitleri ile ülkenizdeki resmi vakitler arasındaki farkı belirtin.</li>
<li><strong>İyileştirme önerileri:</strong> herhangi bir yeni özellik, daha iyi tasarım veya ek dil.</li>
<li><strong>Ortaklık talepleri:</strong> site verilerini kullanmak isteyen akademiler, camiler veya uygulamalar için.</li>
<li><strong>Teknik hata bildirimleri:</strong> çalışmayan sayfalar, bozuk özellikler veya görüntüleme sorunları.</li>
<li><strong>Hesaplamalarla ilgili dini sorular:</strong> namaz vakitlerinin hesaplanma yöntemleri, Fajr/İşa vakitleri ve benimsenen fıkıh mezhepleri.</li>
</ul>
<h2>Yanıt süresi</h2>
<p>Tüm mesajlara <strong>3-5 iş günü</strong> içinde yanıt vermeye çalışıyoruz. Teknik hatalarla ilgili mesajlar daha yüksek önceliklidir.</p>
<h2>Bize ulaşmadan önce</h2>
<p>Sorunuzun yanıtını şurada bulabilirsiniz:</p>
<ul>
<li><a href="/tr/about-us">"Hakkımızda" sayfası</a> — misyonumuzu ve özelliklerimizi açıklar.</li>
<li><a href="/tr/terms">Kullanım Şartları</a> — doğruluk ve sorumlulukla ilgili soruları yanıtlar.</li>
<li><a href="/tr/privacy">Gizlilik Politikası</a> — verilerinizi nasıl işlediğimizi açıklar.</li>
</ul>
<h2>Sosyal medya takibi</h2>
<p>En son güncellemeler, duyurular ve dini bültenler için bizi takip edin:</p>
<ul>
<li><a href="https://x.com/TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>X (Twitter): @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.youtube.com/@TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>YouTube: @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.linkedin.com/in/times-prayers-072861404" target="_blank" rel="noopener noreferrer"><strong>LinkedIn: Times Prayers</strong></a></li>
</ul>`,
        ur: `<h1>ہم سے رابطہ کریں</h1>
<p>ہمیں آپ سے سن کر خوشی ہوگی۔ چاہے آپ کا کوئی سوال، تجویز، یا آپ کے شہر میں نماز کے غلط اوقات کے بارے میں رپورٹ ہو، ہماری ٹیم سننے کے لیے تیار ہے۔</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">براہ راست رابطہ</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>ہم جن قسم کی پوچھ گچھ وصول کرتے ہیں</h2>
<ul>
<li><strong>غلط اوقات کی اطلاع:</strong> شہر کا نام، کوآرڈینیٹس (اگر ممکن ہو)، اور سائٹ کے اوقات اور آپ کے ملک میں سرکاری اوقات کے درمیان فرق شامل کریں۔</li>
<li><strong>بہتری کی تجاویز:</strong> کوئی بھی نیا فیچر، بہتر ڈیزائن، یا اضافی زبان۔</li>
<li><strong>شراکت کی درخواستیں:</strong> اکیڈمیوں، مساجد، یا سائٹ کا ڈیٹا استعمال کرنے کے خواہشمند ایپس کے لیے۔</li>
<li><strong>تکنیکی خرابیوں کی اطلاع:</strong> کام نہ کرنے والے صفحات، ٹوٹے ہوئے فیچرز، یا ڈسپلے کے مسائل۔</li>
<li><strong>حسابات سے متعلق مذہبی سوالات:</strong> نماز کے اوقات کا حساب کرنے کے طریقے، فجر/عشاء کے اوقات، اور اپنائے گئے فقہی مکاتب فکر۔</li>
</ul>
<h2>جواب کا وقت</h2>
<p>ہم تمام پیغامات کا جواب <strong>3-5 کاروباری دنوں</strong> کے اندر دینے کی کوشش کرتے ہیں۔ تکنیکی خرابیوں سے متعلق پیغامات کو زیادہ ترجیح ملتی ہے۔</p>
<h2>ہم سے رابطہ کرنے سے پہلے</h2>
<p>آپ کو اپنے سوال کا جواب یہاں مل سکتا ہے:</p>
<ul>
<li><a href="/ur/about-us">"ہمارے بارے میں" صفحہ</a> — ہمارے مشن اور خصوصیات کی وضاحت کرتا ہے۔</li>
<li><a href="/ur/terms">شرائط استعمال</a> — درستگی اور ذمہ داری کے سوالات کے جوابات دیتا ہے۔</li>
<li><a href="/ur/privacy">پرائیویسی پالیسی</a> — بتاتی ہے کہ ہم آپ کے ڈیٹا کو کیسے سنبھالتے ہیں۔</li>
</ul>
<h2>سوشل میڈیا پر فالو اپ</h2>
<p>تازہ ترین اپ ڈیٹس، اعلانات اور مذہبی بلیٹنز کے لیے ہمیں فالو کریں:</p>
<ul>
<li><a href="https://x.com/TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>X (ٹویٹر): @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.youtube.com/@TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>یوٹیوب: @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.linkedin.com/in/times-prayers-072861404" target="_blank" rel="noopener noreferrer"><strong>لنکڈ ان: Times Prayers</strong></a></li>
</ul>`,
        de: `<h1>Kontakt</h1>
<p>Wir freuen uns, von Ihnen zu hören. Ob Sie eine Frage, einen Vorschlag oder eine Meldung zu ungenauen Gebetszeiten in Ihrer Stadt haben — unser Team steht bereit, Ihnen zuzuhören.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Direkter Kontakt</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Welche Anfragen wir erhalten</h2>
<ul>
<li><strong>Meldung ungenauer Zeiten:</strong> Geben Sie den Stadtnamen, die Koordinaten (falls möglich) und den Unterschied zwischen den Zeiten auf der Seite und den offiziellen Zeiten in Ihrem Land an.</li>
<li><strong>Verbesserungsvorschläge:</strong> Neue Funktionen, besseres Design oder eine zusätzliche Sprache.</li>
<li><strong>Partnerschaftsanfragen:</strong> Für Akademien, Moscheen oder Apps, die Seitendaten nutzen möchten.</li>
<li><strong>Meldung technischer Fehler:</strong> Nicht funktionierende Seiten, defekte Funktionen oder Anzeigeprobleme.</li>
<li><strong>Religiöse Fragen zu Berechnungen:</strong> Methoden zur Berechnung der Gebetszeiten, Fajr/Isha-Zeiten und die verwendeten Rechtsschulen.</li>
</ul>
<h2>Antwortzeit</h2>
<p>Wir bemühen uns, alle Nachrichten innerhalb von <strong>3–5 Werktagen</strong> zu beantworten. Nachrichten zu technischen Fehlern erhalten eine höhere Priorität.</p>
<h2>Bevor Sie uns kontaktieren</h2>
<p>Die Antwort auf Ihre Frage finden Sie möglicherweise in:</p>
<ul>
<li><a href="/de/about-us">Über uns</a> — erklärt unsere Mission und Funktionen.</li>
<li><a href="/de/terms">Nutzungsbedingungen</a> — beantwortet Fragen zu Genauigkeit und Verantwortung.</li>
<li><a href="/de/privacy">Datenschutzerklärung</a> — erklärt, wie wir mit Ihren Daten umgehen.</li>
</ul>
<h2>Soziale Medien</h2>
<p>Folgen Sie uns für die neuesten Updates, Ankündigungen und religiösen Hinweise:</p>
<ul>
<li><a href="https://x.com/TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>X (Twitter): @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.youtube.com/@TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>YouTube: @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.linkedin.com/in/times-prayers-072861404" target="_blank" rel="noopener noreferrer"><strong>LinkedIn: Times Prayers</strong></a></li>
</ul>`,
        id: `<h1>Hubungi Kami</h1>
<p>Kami senang mendengar dari Anda. Baik Anda memiliki pertanyaan, saran, atau laporan tentang jadwal sholat yang tidak akurat di kota Anda, tim kami siap mendengarkan.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Kontak Langsung</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Jenis Pertanyaan yang Kami Terima</h2>
<ul>
<li><strong>Melaporkan waktu yang tidak akurat:</strong> Sertakan nama kota, koordinat (jika mungkin), dan selisih antara waktu di situs dan waktu resmi di negara Anda.</li>
<li><strong>Saran peningkatan:</strong> Fitur baru, desain yang lebih baik, atau bahasa tambahan.</li>
<li><strong>Permintaan kerja sama:</strong> Untuk akademi, masjid, atau aplikasi yang ingin menggunakan data situs.</li>
<li><strong>Melaporkan kesalahan teknis:</strong> Halaman yang tidak berfungsi, fitur yang rusak, atau masalah tampilan.</li>
<li><strong>Pertanyaan agama tentang perhitungan:</strong> Metode perhitungan jadwal sholat, waktu Subuh/Isya, dan mazhab fikih yang diadopsi.</li>
</ul>
<h2>Waktu Respons</h2>
<p>Kami berusaha merespons semua pesan dalam waktu <strong>3-5 hari kerja</strong>. Pesan terkait kesalahan teknis mendapat prioritas lebih tinggi.</p>
<h2>Sebelum Menghubungi Kami</h2>
<p>Anda mungkin menemukan jawaban atas pertanyaan Anda di:</p>
<ul>
<li><a href="/id/about-us">Halaman "Tentang Kami"</a> — menjelaskan misi dan fitur kami.</li>
<li><a href="/id/terms">Syarat Penggunaan</a> — menjawab pertanyaan akurasi dan tanggung jawab.</li>
<li><a href="/id/privacy">Kebijakan Privasi</a> — menjelaskan cara kami menangani data Anda.</li>
</ul>
<h2>Media Sosial</h2>
<p>Ikuti kami untuk pembaruan terbaru, pengumuman, dan buletin keagamaan:</p>
<ul>
<li><a href="https://x.com/TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>X (Twitter): @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.youtube.com/@TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>YouTube: @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.linkedin.com/in/times-prayers-072861404" target="_blank" rel="noopener noreferrer"><strong>LinkedIn: Times Prayers</strong></a></li>
</ul>`,
        es: `<h1>Contáctanos</h1>
<p>Nos encanta saber de ti. Ya sea que tengas una pregunta, una sugerencia o un informe sobre un horario de oración inexacto en tu ciudad, nuestro equipo está listo para escucharte.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Contacto directo</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Tipos de Consultas que Recibimos</h2>
<ul>
<li><strong>Reportar un horario inexacto:</strong> incluye el nombre de la ciudad, las coordenadas (si es posible) y la diferencia entre el horario del sitio y el oficial de tu país.</li>
<li><strong>Sugerencias de mejora:</strong> nuevas funciones, mejor diseño o idiomas adicionales.</li>
<li><strong>Solicitudes de colaboración:</strong> para academias, mezquitas o aplicaciones que deseen usar los datos del sitio.</li>
<li><strong>Reportar un error técnico:</strong> página que no funciona, función rota o problema de visualización.</li>
<li><strong>Preguntas religiosas sobre el cálculo:</strong> método de cálculo de los horarios, tiempo de Fajr/Isha y escuelas jurídicas adoptadas.</li>
</ul>
<h2>Tiempo de Respuesta</h2>
<p>Procuramos responder a todos los mensajes en un plazo de <strong>3-5 días laborables</strong>. Los mensajes sobre errores técnicos tienen mayor prioridad.</p>
<h2>Antes de Contactarnos</h2>
<p>Es posible que encuentres la respuesta a tu pregunta en:</p>
<ul>
<li><a href="/es/about-us">Página "Sobre Nosotros"</a> — explica nuestra misión y características.</li>
<li><a href="/es/terms">Términos de Uso</a> — responde a preguntas sobre precisión y responsabilidad.</li>
<li><a href="/es/privacy">Política de Privacidad</a> — explica cómo manejamos tus datos.</li>
</ul>
<h2>Redes Sociales</h2>
<p>Síguenos para las últimas actualizaciones, anuncios y boletines religiosos:</p>
<ul>
<li><a href="https://x.com/TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>X (Twitter): @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.youtube.com/@TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>YouTube: @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.linkedin.com/in/times-prayers-072861404" target="_blank" rel="noopener noreferrer"><strong>LinkedIn: Times Prayers</strong></a></li>
</ul>`,
        bn: `<h1>যোগাযোগ করুন</h1>
<p>আমরা আপনার কাছ থেকে শুনতে ভালোবাসি। আপনার কোনো প্রশ্ন, পরামর্শ, বা আপনার শহরে ভুল নামাজের সময় সম্পর্কে রিপোর্ট থাকুক — আমাদের দল শুনতে প্রস্তুত।</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">সরাসরি যোগাযোগ</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>যে ধরনের প্রশ্ন আমরা গ্রহণ করি</h2>
<ul>
<li><strong>ভুল সময় রিপোর্ট করা:</strong> শহরের নাম, স্থানাঙ্ক (সম্ভব হলে), এবং সাইটের সময় ও আপনার দেশের সরকারি সময়ের মধ্যে পার্থক্য অন্তর্ভুক্ত করুন।</li>
<li><strong>উন্নয়নের পরামর্শ:</strong> নতুন ফিচার, উন্নত ডিজাইন, বা অতিরিক্ত ভাষা।</li>
<li><strong>সহযোগিতার অনুরোধ:</strong> সাইটের ডেটা ব্যবহার করতে চাওয়া একাডেমি, মসজিদ বা অ্যাপের জন্য।</li>
<li><strong>কারিগরি ত্রুটি রিপোর্ট করা:</strong> কাজ না করা পৃষ্ঠা, ভাঙা ফিচার বা প্রদর্শন সমস্যা।</li>
<li><strong>গণনা সম্পর্কে ধর্মীয় প্রশ্ন:</strong> নামাজের সময় গণনার পদ্ধতি, ফজর/এশার সময় এবং গৃহীত ফিকহি মাজহাব।</li>
</ul>
<h2>প্রতিক্রিয়ার সময়</h2>
<p>আমরা সব বার্তায় <strong>৩-৫ কার্যদিবসের</strong> মধ্যে সাড়া দেওয়ার চেষ্টা করি। কারিগরি ত্রুটির বার্তা উচ্চ অগ্রাধিকার পায়।</p>
<h2>যোগাযোগের আগে</h2>
<p>আপনি আপনার প্রশ্নের উত্তর এখানে পেতে পারেন:</p>
<ul>
<li><a href="/bn/about-us">"আমাদের সম্পর্কে" পৃষ্ঠা</a> — আমাদের লক্ষ্য ও বৈশিষ্ট্য ব্যাখ্যা করে।</li>
<li><a href="/bn/terms">শর্তাবলী</a> — নির্ভুলতা ও দায়িত্ব সম্পর্কিত প্রশ্নের উত্তর দেয়।</li>
<li><a href="/bn/privacy">গোপনীয়তা নীতি</a> — আমরা কীভাবে আপনার ডেটা পরিচালনা করি তা ব্যাখ্যা করে।</li>
</ul>
<h2>সামাজিক মাধ্যম</h2>
<p>সর্বশেষ আপডেট, ঘোষণা এবং ধর্মীয় বুলেটিনের জন্য আমাদের ফলো করুন:</p>
<ul>
<li><a href="https://x.com/TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>X (টুইটার): @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.youtube.com/@TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>YouTube: @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.linkedin.com/in/times-prayers-072861404" target="_blank" rel="noopener noreferrer"><strong>LinkedIn: Times Prayers</strong></a></li>
</ul>`,
        ms: `<h1>Hubungi Kami</h1>
<p>Kami gembira mendengar daripada anda. Sama ada anda mempunyai pertanyaan, cadangan atau laporan tentang waktu solat yang tidak tepat di bandar anda, pasukan kami sedia mendengar.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Hubungan terus</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Jenis Pertanyaan yang Kami Terima</h2>
<ul>
<li><strong>Laporkan waktu yang tidak tepat:</strong> sertakan nama bandar, koordinat (jika mungkin) dan perbezaan antara waktu di laman dan waktu rasmi di negara anda.</li>
<li><strong>Cadangan penambahbaikan:</strong> ciri baharu, reka bentuk yang lebih baik atau bahasa tambahan.</li>
<li><strong>Permintaan kerjasama:</strong> untuk akademi, masjid atau aplikasi yang ingin menggunakan data laman.</li>
<li><strong>Laporkan ralat teknikal:</strong> halaman yang tidak berfungsi, ciri yang rosak atau masalah paparan.</li>
<li><strong>Soalan agama tentang pengiraan:</strong> kaedah pengiraan waktu solat, waktu Subuh/Isyak dan mazhab feqah yang digunakan.</li>
</ul>
<h2>Masa Respons</h2>
<p>Kami berusaha membalas semua mesej dalam tempoh <strong>3-5 hari bekerja</strong>. Mesej berkaitan ralat teknikal mendapat keutamaan lebih tinggi.</p>
<h2>Sebelum Menghubungi Kami</h2>
<p>Anda mungkin menjumpai jawapan kepada soalan anda di:</p>
<ul>
<li><a href="/ms/about-us">Halaman "Tentang Kami"</a> — menerangkan misi dan ciri-ciri kami.</li>
<li><a href="/ms/terms">Terma Penggunaan</a> — menjawab persoalan ketepatan dan tanggungjawab.</li>
<li><a href="/ms/privacy">Dasar Privasi</a> — menerangkan cara kami mengendalikan data anda.</li>
</ul>
<h2>Media Sosial</h2>
<p>Ikuti kami untuk kemas kini terkini, pengumuman, dan buletin agama:</p>
<ul>
<li><a href="https://x.com/TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>X (Twitter): @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.youtube.com/@TIMESPRAYESRS" target="_blank" rel="noopener noreferrer"><strong>YouTube: @TIMESPRAYESRS</strong></a></li>
<li><a href="https://www.linkedin.com/in/times-prayers-072861404" target="_blank" rel="noopener noreferrer"><strong>LinkedIn: Times Prayers</strong></a></li>
</ul>`
    },
    'about-us': {
        ar: `<h1>عن موقع مواقيت الصلاة</h1>
<p>موقع <strong>مواقيت الصلاة</strong> هو مشروع إسلامي مجاني يهدف إلى توفير أدوات إسلامية يومية موثوقة ودقيقة لكل مسلم حول العالم — في أي مدينة، بأي لغة، وعلى أي جهاز.</p>
<h2>رسالتنا</h2>
<p>نؤمن بأن الأدوات الدينية اليومية يجب أن تكون:</p>
<ul>
<li><strong>مجانية:</strong> الإسلام للجميع، ولا يجب أن تُحتجَب أدواته خلف اشتراكات.</li>
<li><strong>دقيقة:</strong> نعتمد على أحدث المعادلات الفلكية ومصادر دينية موثوقة.</li>
<li><strong>سريعة وخفيفة:</strong> الموقع يعمل على أبطأ الاتصالات وأقدم الأجهزة.</li>
<li><strong>محترِمة للخصوصية:</strong> لا نطلب تسجيلاً ولا نخزّن بياناتك على خوادمنا.</li>
</ul>
<h2>الميزات الرئيسية</h2>
<ul>
<li><strong>مواقيت الصلاة:</strong> الفجر، الظهر، العصر، المغرب، العشاء — لكل مدينة في العالم، مع جدول أسبوعي وتنبيه قبل كل صلاة.</li>
<li><strong>اتجاه القبلة:</strong> بوصلة تفاعلية وخريطة تُظهر اتجاه الكعبة المشرفة من موقعك بدقة.</li>
<li><strong>التقويم الهجري:</strong> تقويم كامل من سنة 1 هـ إلى 1500 هـ، ومحوّل بين الهجري والميلادي.</li>
<li><strong>الأدعية والأذكار:</strong> مجموعة منظَّمة من الكتاب والسنة (أذكار الصباح، المساء، الصلاة، النوم، السفر…).</li>
<li><strong>المسبحة الإلكترونية:</strong> عدّاد ذكر يحفظ تقدّمك ويسمح بتحديد أهداف يومية.</li>
<li><strong>حاسبة الزكاة:</strong> تشمل النقد، الذهب، الفضة، الأسهم، والاستثمارات.</li>
<li><strong>صفحات المدن:</strong> آلاف الصفحات لمدن العالم، كل صفحة تحتوي معلومات جغرافية ومواقيت ودقيقة.</li>
</ul>
<h2>كيف نحسب مواقيت الصلاة؟</h2>
<p>نستخدم خوارزميات فلكية مُعتمَدة دولياً، مع دعم لمذاهب الحساب الرئيسية:</p>
<ul>
<li>الجمعية الإسلامية لأمريكا الشمالية (ISNA)</li>
<li>رابطة العالم الإسلامي (MWL)</li>
<li>الهيئة المصرية العامة للمساحة</li>
<li>أم القرى — السعودية</li>
<li>جامعة العلوم الإسلامية كراتشي</li>
</ul>
<h2>اللغات المدعومة</h2>
<p>الموقع متاح حالياً بـ <strong>العربية</strong> و <strong>الإنجليزية</strong>، ونعمل على إضافة لغات جديدة (التركية، الفرنسية، الأردية، الإندونيسية).</p>
<h2>الفريق</h2>
<p>الموقع مشروع تطوّعي يديره مسلمون يحبّون أمتهم، ويهدفون لخدمتها بأفضل الأدوات التقنية. نرحّب بانضمام أي مطوّر، مصمّم، أو مترجم — تواصل معنا عبر <a href="/contact">صفحة الاتصال</a>.</p>
<h2>كيف يُموَّل الموقع؟</h2>
<p>الموقع مجاني تماماً. نعتمد على عوائد إعلانات Google AdSense (المخطط لها) لتغطية تكاليف الخوادم والتطوير. لن نعرض إعلاناتٍ مزعِجة أو مخالفة لقيمنا الإسلامية.</p>`,
        en: `<h1>About Prayer Times</h1>
<p><strong>Prayer Times</strong> is a free Islamic project aiming to provide reliable and accurate daily Islamic tools for every Muslim worldwide — in any city, any language, and on any device.</p>
<h2>Our Mission</h2>
<p>We believe that daily religious tools should be:</p>
<ul>
<li><strong>Free:</strong> Islam is for everyone, and its tools should not be locked behind subscriptions.</li>
<li><strong>Accurate:</strong> We rely on the latest astronomical equations and trusted religious sources.</li>
<li><strong>Fast and lightweight:</strong> The site works on the slowest connections and oldest devices.</li>
<li><strong>Privacy-respecting:</strong> No registration required, and we do not store your data on our servers.</li>
</ul>
<h2>Key Features</h2>
<ul>
<li><strong>Prayer times:</strong> Fajr, Dhuhr, Asr, Maghrib, Isha — for every city in the world, with weekly schedule and pre-prayer reminders.</li>
<li><strong>Qibla direction:</strong> Interactive compass and map showing the Kaaba direction from your location accurately.</li>
<li><strong>Hijri calendar:</strong> Full calendar from year 1 AH to 1500 AH, plus a Hijri-Gregorian converter.</li>
<li><strong>Duas and Athkar:</strong> Organized collection from Quran and Sunnah (morning, evening, prayer, sleep, travel…).</li>
<li><strong>Digital Tasbih:</strong> Counter that saves your progress and supports daily targets.</li>
<li><strong>Zakat calculator:</strong> Covers cash, gold, silver, stocks, and investments.</li>
<li><strong>City pages:</strong> Thousands of pages for cities worldwide, each with geographic info and accurate times.</li>
</ul>
<h2>How do we calculate prayer times?</h2>
<p>We use internationally adopted astronomical algorithms, supporting major calculation schools:</p>
<ul>
<li>Islamic Society of North America (ISNA)</li>
<li>Muslim World League (MWL)</li>
<li>Egyptian General Authority of Survey</li>
<li>Umm al-Qura — Saudi Arabia</li>
<li>University of Islamic Sciences, Karachi</li>
</ul>
<h2>Supported Languages</h2>
<p>The site is currently available in <strong>Arabic</strong> and <strong>English</strong>, with new languages in development (Turkish, French, Urdu, Indonesian).</p>
<h2>The Team</h2>
<p>The site is a volunteer project run by Muslims who love their Ummah and aim to serve it with the best technology. We welcome developers, designers, and translators — contact us via the <a href="/en/contact">Contact page</a>.</p>
<h2>How is the site funded?</h2>
<p>The site is completely free. We rely on Google AdSense revenue (planned) to cover server and development costs. We will not display intrusive ads or anything inconsistent with our Islamic values.</p>`,
        fr: `<h1>À propos d'Heures de Prière</h1>
<p><strong>Heures de Prière</strong> est un projet islamique gratuit visant à fournir des outils islamiques quotidiens fiables et précis à chaque musulman dans le monde — dans n'importe quelle ville, n'importe quelle langue et sur n'importe quel appareil.</p>
<h2>Notre mission</h2>
<p>Nous pensons que les outils religieux quotidiens doivent être :</p>
<ul>
<li><strong>Gratuits :</strong> l'Islam est pour tous, et ses outils ne doivent pas être bloqués derrière des abonnements.</li>
<li><strong>Précis :</strong> nous nous appuyons sur les dernières équations astronomiques et des sources religieuses fiables.</li>
<li><strong>Rapides et légers :</strong> le site fonctionne sur les connexions les plus lentes et les appareils les plus anciens.</li>
<li><strong>Respectueux de la vie privée :</strong> aucune inscription requise et aucune donnée stockée sur nos serveurs.</li>
</ul>
<h2>Fonctionnalités principales</h2>
<ul>
<li><strong>Heures de prière :</strong> Fajr, Dhouhr, Asr, Maghrib, Isha — pour chaque ville du monde, avec un programme hebdomadaire et des rappels avant la prière.</li>
<li><strong>Direction de la Qibla :</strong> boussole interactive et carte montrant la direction de la Kaaba depuis votre emplacement avec précision.</li>
<li><strong>Calendrier hégirien :</strong> calendrier complet de l'an 1 AH à 1500 AH, plus un convertisseur hégirien-grégorien.</li>
<li><strong>Invocations et dhikrs :</strong> collection organisée du Coran et de la Sunna (matin, soir, prière, sommeil, voyage…).</li>
<li><strong>Tasbih numérique :</strong> compteur qui sauvegarde votre progression et prend en charge les objectifs quotidiens.</li>
<li><strong>Calculateur de Zakat :</strong> couvre l'argent, l'or, l'argent, les actions et les investissements.</li>
<li><strong>Pages de villes :</strong> des milliers de pages pour les villes du monde entier, chacune avec des informations géographiques et des heures précises.</li>
</ul>
<h2>Comment calculons-nous les heures de prière ?</h2>
<p>Nous utilisons des algorithmes astronomiques adoptés internationalement, prenant en charge les principales écoles de calcul :</p>
<ul>
<li>Société islamique d'Amérique du Nord (ISNA)</li>
<li>Ligue mondiale musulmane (MWL)</li>
<li>Autorité générale égyptienne d'arpentage</li>
<li>Umm al-Qura — Arabie saoudite</li>
<li>Université des sciences islamiques, Karachi</li>
</ul>
<h2>Langues prises en charge</h2>
<p>Le site est actuellement disponible en <strong>arabe</strong>, <strong>anglais</strong>, <strong>français</strong>, <strong>turc</strong> et <strong>ourdou</strong>.</p>
<h2>L'équipe</h2>
<p>Le site est un projet bénévole géré par des musulmans qui aiment leur Oumma et cherchent à la servir avec les meilleures technologies. Nous accueillons les développeurs, designers et traducteurs — contactez-nous via la <a href="/fr/contact">page Contact</a>.</p>
<h2>Comment le site est-il financé ?</h2>
<p>Le site est entièrement gratuit. Nous comptons sur les revenus de Google AdSense (prévus) pour couvrir les coûts du serveur et du développement. Nous n'afficherons pas de publicités intrusives ou contraires à nos valeurs islamiques.</p>`,
        tr: `<h1>Namaz Vakitleri Hakkında</h1>
<p><strong>Namaz Vakitleri</strong>, dünyadaki her Müslümana — herhangi bir şehirde, herhangi bir dilde ve herhangi bir cihazda — güvenilir ve doğru günlük İslami araçlar sağlamayı amaçlayan ücretsiz bir İslami projedir.</p>
<h2>Misyonumuz</h2>
<p>Günlük dini araçların şöyle olması gerektiğine inanıyoruz:</p>
<ul>
<li><strong>Ücretsiz:</strong> İslam herkes içindir ve araçları abonelikler arkasına kilitlenmemelidir.</li>
<li><strong>Doğru:</strong> En son astronomik denklemlere ve güvenilir dini kaynaklara dayanıyoruz.</li>
<li><strong>Hızlı ve hafif:</strong> Site en yavaş bağlantılarda ve en eski cihazlarda çalışır.</li>
<li><strong>Gizliliğe saygılı:</strong> Kayıt gerekmiyor ve sunucularımızda veri saklamıyoruz.</li>
</ul>
<h2>Ana Özellikler</h2>
<ul>
<li><strong>Namaz vakitleri:</strong> Fajr, Öğle, İkindi, Akşam, Yatsı — dünyanın her şehri için, haftalık program ve namaz öncesi hatırlatıcılarla.</li>
<li><strong>Kıble yönü:</strong> Konumunuzdan Kâbe yönünü doğru şekilde gösteren etkileşimli pusula ve harita.</li>
<li><strong>Hicri takvim:</strong> 1 AH'den 1500 AH'ye kadar tam takvim, ayrıca Hicri-Miladi dönüştürücü.</li>
<li><strong>Dualar ve zikirler:</strong> Kur'an ve Sünnetten organize edilmiş koleksiyon (sabah, akşam, namaz, uyku, yolculuk…).</li>
<li><strong>Dijital Tesbih:</strong> İlerlemenizi kaydeden ve günlük hedefleri destekleyen sayaç.</li>
<li><strong>Zekat hesaplayıcı:</strong> Nakit, altın, gümüş, hisse senedi ve yatırımları kapsar.</li>
<li><strong>Şehir sayfaları:</strong> Dünya çapında şehirler için binlerce sayfa, her biri coğrafi bilgiler ve doğru vakitlerle.</li>
</ul>
<h2>Namaz vakitlerini nasıl hesaplıyoruz?</h2>
<p>Uluslararası olarak benimsenmiş astronomik algoritmalar kullanıyoruz ve başlıca hesaplama ekollerini destekliyoruz:</p>
<ul>
<li>Kuzey Amerika İslam Toplumu (ISNA)</li>
<li>Dünya İslam Birliği (MWL)</li>
<li>Mısır Genel Etüt Kurumu</li>
<li>Ümmül Kura — Suudi Arabistan</li>
<li>Karaçi İslami Bilimler Üniversitesi</li>
</ul>
<h2>Desteklenen Diller</h2>
<p>Site şu anda <strong>Arapça</strong>, <strong>İngilizce</strong>, <strong>Fransızca</strong>, <strong>Türkçe</strong> ve <strong>Urduca</strong> olarak mevcuttur.</p>
<h2>Ekip</h2>
<p>Site, Ümmetini seven ve ona en iyi teknoloji ile hizmet etmeyi amaçlayan Müslümanlar tarafından yürütülen gönüllü bir projedir. Geliştiricileri, tasarımcıları ve çevirmenleri bekliyoruz — bizimle <a href="/tr/contact">İletişim sayfası</a> üzerinden iletişime geçin.</p>
<h2>Site nasıl finanse edilir?</h2>
<p>Site tamamen ücretsizdir. Sunucu ve geliştirme maliyetlerini karşılamak için Google AdSense gelirine (planlanan) güveniyoruz. Saldırgan reklamlar veya İslami değerlerimizle tutarsız hiçbir şey göstermeyeceğiz.</p>`,
        ur: `<h1>اوقاتِ نماز کے بارے میں</h1>
<p><strong>اوقاتِ نماز</strong> ایک مفت اسلامی منصوبہ ہے جس کا مقصد دنیا بھر کے ہر مسلمان کو قابل اعتماد اور درست روزمرہ اسلامی ٹولز فراہم کرنا ہے — کسی بھی شہر میں، کسی بھی زبان میں، اور کسی بھی ڈیوائس پر۔</p>
<h2>ہمارا مشن</h2>
<p>ہمارا ماننا ہے کہ روزمرہ کے مذہبی ٹولز ہونے چاہئیں:</p>
<ul>
<li><strong>مفت:</strong> اسلام سب کے لیے ہے، اور اس کے ٹولز سبسکرپشنز کے پیچھے بند نہیں ہونے چاہئیں۔</li>
<li><strong>درست:</strong> ہم جدید ترین فلکیاتی مساواتوں اور قابل اعتماد مذہبی ذرائع پر انحصار کرتے ہیں۔</li>
<li><strong>تیز اور ہلکے:</strong> سائٹ سب سے سست کنکشنز اور سب سے پرانے آلات پر کام کرتی ہے۔</li>
<li><strong>پرائیویسی کا احترام:</strong> کوئی رجسٹریشن درکار نہیں، اور ہم آپ کا ڈیٹا اپنے سرورز پر محفوظ نہیں کرتے۔</li>
</ul>
<h2>اہم خصوصیات</h2>
<ul>
<li><strong>نماز کے اوقات:</strong> فجر، ظہر، عصر، مغرب، عشاء — دنیا کے ہر شہر کے لیے، ہفتہ وار شیڈول اور نماز سے پہلے یاد دہانی کے ساتھ۔</li>
<li><strong>قبلہ کی سمت:</strong> انٹرایکٹو قطب نما اور نقشہ جو آپ کے مقام سے کعبہ کی سمت درست طور پر دکھاتا ہے۔</li>
<li><strong>ہجری کیلنڈر:</strong> 1 ہجری سے 1500 ہجری تک مکمل کیلنڈر، نیز ہجری-عیسوی کنورٹر۔</li>
<li><strong>دعائیں اور اذکار:</strong> قرآن اور سنت سے منظم مجموعہ (صبح، شام، نماز، نیند، سفر…)۔</li>
<li><strong>ڈیجیٹل تسبیح:</strong> کاؤنٹر جو آپ کی پیش رفت محفوظ کرتا ہے اور روزانہ اہداف کی حمایت کرتا ہے۔</li>
<li><strong>زکوٰۃ کیلکولیٹر:</strong> نقد، سونا، چاندی، اسٹاک اور سرمایہ کاری شامل ہیں۔</li>
<li><strong>شہر کے صفحات:</strong> دنیا بھر کے شہروں کے لیے ہزاروں صفحات، ہر ایک جغرافیائی معلومات اور درست اوقات کے ساتھ۔</li>
</ul>
<h2>ہم نماز کے اوقات کیسے حساب کرتے ہیں؟</h2>
<p>ہم بین الاقوامی طور پر اپنائے گئے فلکیاتی الگورتھم استعمال کرتے ہیں، جو اہم حساب کے مکاتب فکر کی حمایت کرتے ہیں:</p>
<ul>
<li>شمالی امریکہ کی اسلامی سوسائٹی (ISNA)</li>
<li>رابطہ عالم اسلامی (MWL)</li>
<li>مصری جنرل اتھارٹی برائے سروے</li>
<li>ام القریٰ — سعودی عرب</li>
<li>یونیورسٹی آف اسلامک سائنسز، کراچی</li>
</ul>
<h2>معاون زبانیں</h2>
<p>سائٹ اس وقت <strong>عربی</strong>، <strong>انگریزی</strong>، <strong>فرانسیسی</strong>، <strong>ترکی</strong> اور <strong>اردو</strong> میں دستیاب ہے۔</p>
<h2>ٹیم</h2>
<p>یہ سائٹ رضاکارانہ منصوبہ ہے جسے مسلمان چلاتے ہیں جو اپنی امت سے محبت کرتے ہیں اور بہترین ٹیکنالوجی کے ساتھ اس کی خدمت کرنے کا مقصد رکھتے ہیں۔ ہم ڈویلپرز، ڈیزائنرز اور مترجمین کا خیرمقدم کرتے ہیں — ہمارے <a href="/ur/contact">رابطہ صفحے</a> کے ذریعے ہم سے رابطہ کریں۔</p>
<h2>سائٹ کی فنڈنگ کیسے ہوتی ہے؟</h2>
<p>سائٹ مکمل طور پر مفت ہے۔ سرور اور ڈیولپمنٹ کے اخراجات کو پورا کرنے کے لیے ہم Google AdSense کی آمدنی پر انحصار کرتے ہیں (منصوبہ بند)۔ ہم دخل اندازی والے اشتہارات یا ہماری اسلامی اقدار سے متضاد کچھ بھی نہیں دکھائیں گے۔</p>`,
        de: `<h1>Über Gebetszeiten</h1>
<p><strong>Gebetszeiten</strong> ist ein kostenloses islamisches Projekt, das darauf abzielt, jedem Muslim weltweit zuverlässige und präzise tägliche islamische Werkzeuge zur Verfügung zu stellen — in jeder Stadt, in jeder Sprache und auf jedem Gerät.</p>
<h2>Unsere Mission</h2>
<p>Wir glauben, dass tägliche religiöse Werkzeuge sein sollten:</p>
<ul>
<li><strong>Kostenlos:</strong> Der Islam ist für alle da, und seine Werkzeuge sollten nicht hinter Abonnements verborgen sein.</li>
<li><strong>Präzise:</strong> Wir stützen uns auf die neuesten astronomischen Gleichungen und zuverlässige religiöse Quellen.</li>
<li><strong>Schnell und leicht:</strong> Die Seite funktioniert auch bei den langsamsten Verbindungen und auf den ältesten Geräten.</li>
<li><strong>Datenschutzfreundlich:</strong> Keine Registrierung erforderlich, und wir speichern Ihre Daten nicht auf unseren Servern.</li>
</ul>
<h2>Hauptfunktionen</h2>
<ul>
<li><strong>Gebetszeiten:</strong> Fajr, Dhuhr, Asr, Maghrib, Isha — für jede Stadt weltweit, mit Wochenplan und Erinnerungen vor jedem Gebet.</li>
<li><strong>Qibla-Richtung:</strong> Interaktiver Kompass und Karte, die die Richtung zur Kaaba präzise von Ihrem Standort aus anzeigen.</li>
<li><strong>Hidschri-Kalender:</strong> Vollständiger Kalender vom Jahr 1 AH bis 1500 AH sowie ein Hidschri-Gregorianischer Umrechner.</li>
<li><strong>Duas und Adhkar:</strong> Organisierte Sammlung aus Koran und Sunna (Morgen, Abend, Gebet, Schlaf, Reise…).</li>
<li><strong>Digitaler Tasbih:</strong> Zähler, der Ihren Fortschritt speichert und tägliche Ziele unterstützt.</li>
<li><strong>Zakat-Rechner:</strong> Umfasst Bargeld, Gold, Silber, Aktien und Investitionen.</li>
<li><strong>Stadtseiten:</strong> Tausende von Seiten für Städte weltweit, jede mit geografischen Informationen und präzisen Zeiten.</li>
</ul>
<h2>Wie berechnen wir die Gebetszeiten?</h2>
<p>Wir verwenden international anerkannte astronomische Algorithmen und unterstützen die wichtigsten Berechnungsschulen:</p>
<ul>
<li>Islamische Gesellschaft Nordamerikas (ISNA)</li>
<li>Muslimische Weltliga (MWL)</li>
<li>Ägyptische Generalbehörde für Vermessung</li>
<li>Umm al-Qura — Saudi-Arabien</li>
<li>Universität der Islamischen Wissenschaften, Karachi</li>
</ul>
<h2>Unterstützte Sprachen</h2>
<p>Die Seite ist derzeit auf <strong>Arabisch</strong>, <strong>Englisch</strong>, <strong>Französisch</strong>, <strong>Türkisch</strong>, <strong>Urdu</strong> und <strong>Deutsch</strong> verfügbar.</p>
<h2>Das Team</h2>
<p>Die Seite ist ein ehrenamtliches Projekt, das von Muslimen geleitet wird, die ihre Umma lieben und ihr mit den besten Technologien dienen möchten. Wir begrüßen Entwickler, Designer und Übersetzer — kontaktieren Sie uns über die <a href="/de/contact">Kontaktseite</a>.</p>
<h2>Wie wird die Seite finanziert?</h2>
<p>Die Seite ist vollständig kostenlos. Wir stützen uns auf die Einnahmen von Google AdSense (geplant), um Server- und Entwicklungskosten zu decken. Wir werden keine aufdringliche Werbung oder Inhalte anzeigen, die im Widerspruch zu unseren islamischen Werten stehen.</p>`,
        id: `<h1>Tentang Jadwal Sholat</h1>
<p><strong>Jadwal Sholat</strong> adalah proyek Islami gratis yang bertujuan menyediakan perangkat Islami harian yang andal dan akurat untuk setiap Muslim di seluruh dunia — di kota mana pun, dalam bahasa apa pun, dan di perangkat apa pun.</p>
<h2>Misi Kami</h2>
<p>Kami percaya bahwa perangkat keagamaan harian haruslah:</p>
<ul>
<li><strong>Gratis:</strong> Islam untuk semua, dan alat-alatnya tidak boleh disembunyikan di balik langganan.</li>
<li><strong>Akurat:</strong> Kami mengandalkan persamaan astronomi terbaru dan sumber-sumber keagamaan yang andal.</li>
<li><strong>Cepat dan ringan:</strong> Situs bekerja pada koneksi paling lambat dan perangkat paling tua.</li>
<li><strong>Menghormati privasi:</strong> Tidak diperlukan pendaftaran, dan kami tidak menyimpan data Anda di server kami.</li>
</ul>
<h2>Fitur Utama</h2>
<ul>
<li><strong>Jadwal Sholat:</strong> Subuh, Zuhur, Asar, Magrib, Isya — untuk setiap kota di dunia, dengan jadwal mingguan dan pengingat sebelum setiap sholat.</li>
<li><strong>Arah Kiblat:</strong> Kompas interaktif dan peta yang menunjukkan arah Kakbah secara akurat dari lokasi Anda.</li>
<li><strong>Kalender Hijriyah:</strong> Kalender lengkap dari tahun 1 H hingga 1500 H serta konverter Hijriyah-Masehi.</li>
<li><strong>Doa dan Dzikir:</strong> Koleksi tersusun dari Al-Qur'an dan Sunnah (pagi, sore, sholat, tidur, perjalanan…).</li>
<li><strong>Tasbih Digital:</strong> Penghitung yang menyimpan kemajuan Anda dan mendukung target harian.</li>
<li><strong>Kalkulator Zakat:</strong> Mencakup tunai, emas, perak, saham, dan investasi.</li>
<li><strong>Halaman kota:</strong> Ribuan halaman untuk kota-kota di seluruh dunia, masing-masing dengan informasi geografis dan waktu yang akurat.</li>
</ul>
<h2>Bagaimana Kami Menghitung Jadwal Sholat?</h2>
<p>Kami menggunakan algoritma astronomi yang diakui secara internasional dengan dukungan untuk mazhab perhitungan utama:</p>
<ul>
<li>Islamic Society of North America (ISNA)</li>
<li>Liga Dunia Muslim (MWL)</li>
<li>Otoritas Umum Mesir untuk Survei</li>
<li>Umm al-Qura — Arab Saudi</li>
<li>Universitas Ilmu Islam, Karachi</li>
</ul>
<h2>Bahasa yang Didukung</h2>
<p>Situs saat ini tersedia dalam <strong>Arab</strong>, <strong>Inggris</strong>, <strong>Prancis</strong>, <strong>Turki</strong>, <strong>Urdu</strong>, <strong>Jerman</strong>, dan <strong>Indonesia</strong>.</p>
<h2>Tim</h2>
<p>Situs ini adalah proyek sukarela yang dijalankan oleh Muslim yang mencintai umat mereka dan bertujuan melayani dengan teknologi terbaik. Kami menyambut pengembang, desainer, dan penerjemah — hubungi kami melalui <a href="/id/contact">halaman kontak</a>.</p>
<h2>Bagaimana Situs Ini Didanai?</h2>
<p>Situs ini sepenuhnya gratis. Kami mengandalkan pendapatan Google AdSense (direncanakan) untuk menutupi biaya server dan pengembangan. Kami tidak akan menampilkan iklan yang mengganggu atau konten apa pun yang bertentangan dengan nilai-nilai Islam kami.</p>`,
        es: `<h1>Sobre Horarios de Oración</h1>
<p><strong>Horarios de Oración</strong> es un proyecto islámico gratuito cuyo objetivo es ofrecer herramientas islámicas diarias fiables y precisas a todo musulmán del mundo — en cualquier ciudad, en cualquier idioma y en cualquier dispositivo.</p>
<h2>Nuestra Misión</h2>
<p>Creemos que las herramientas religiosas diarias deben ser:</p>
<ul>
<li><strong>Gratuitas:</strong> el Islam es para todos, y sus herramientas no deben quedar ocultas tras una suscripción.</li>
<li><strong>Precisas:</strong> nos apoyamos en las ecuaciones astronómicas más actualizadas y en fuentes religiosas fiables.</li>
<li><strong>Rápidas y ligeras:</strong> el sitio funciona con las conexiones más lentas y los dispositivos más antiguos.</li>
<li><strong>Respetuosas con la privacidad:</strong> no requiere registro y no almacenamos tus datos en nuestros servidores.</li>
</ul>
<h2>Características Principales</h2>
<ul>
<li><strong>Horarios de oración:</strong> Fajr, Dhuhr, Asr, Magrib, Isha — para cada ciudad del mundo, con programa semanal y recordatorios antes de cada oración.</li>
<li><strong>Dirección de la Qibla:</strong> brújula interactiva y mapa que muestran la dirección de la Kaaba con precisión desde tu ubicación.</li>
<li><strong>Calendario Hégira:</strong> calendario completo desde el año 1 AH hasta el 1500 AH, con conversor Hégira ↔ Gregoriano.</li>
<li><strong>Duas y dhikr:</strong> colección organizada tomada del Corán y la Sunnah (mañana, tarde, oración, sueño, viaje…).</li>
<li><strong>Tasbih digital:</strong> contador que guarda tu progreso y admite objetivos diarios.</li>
<li><strong>Calculadora de Zakat:</strong> incluye efectivo, oro, plata, acciones e inversiones.</li>
<li><strong>Páginas de ciudades:</strong> miles de páginas para ciudades de todo el mundo, cada una con información geográfica y horarios precisos.</li>
</ul>
<h2>¿Cómo Calculamos los Horarios de Oración?</h2>
<p>Utilizamos algoritmos astronómicos reconocidos internacionalmente, compatibles con las principales escuelas de cálculo:</p>
<ul>
<li>Islamic Society of North America (ISNA)</li>
<li>Liga Mundial Musulmana (MWL)</li>
<li>Autoridad General Egipcia de Topografía</li>
<li>Umm al-Qura — Arabia Saudí</li>
<li>Universidad de Ciencias Islámicas, Karachi</li>
</ul>
<h2>Idiomas Disponibles</h2>
<p>El sitio está actualmente disponible en <strong>Árabe</strong>, <strong>Inglés</strong>, <strong>Francés</strong>, <strong>Turco</strong>, <strong>Urdu</strong>, <strong>Alemán</strong>, <strong>Indonesio</strong>, <strong>Español</strong>, <strong>Bengalí</strong> y <strong>Malayo</strong>.</p>
<h2>El Equipo</h2>
<p>El sitio es un proyecto voluntario dirigido por musulmanes que aman a su Ummah y buscan servirla con la mejor tecnología. Damos la bienvenida a desarrolladores, diseñadores y traductores — contáctanos a través de nuestra <a href="/es/contact">página de Contacto</a>.</p>
<h2>¿Cómo se Financia el Sitio?</h2>
<p>El sitio es totalmente gratuito. Dependemos de los ingresos de Google AdSense (previsto) para cubrir los costes de servidor y desarrollo. Nunca mostraremos anuncios intrusivos ni contenidos contrarios a nuestros valores islámicos.</p>`,
        bn: `<h1>নামাজের সময়সূচী সম্পর্কে</h1>
<p><strong>নামাজের সময়সূচী</strong> একটি বিনামূল্যে ইসলামি প্রকল্প যার লক্ষ্য বিশ্বের প্রতিটি মুসলিমের জন্য — যে কোনো শহরে, যে কোনো ভাষায় এবং যে কোনো ডিভাইসে — নির্ভরযোগ্য ও সঠিক দৈনিক ইসলামি সরঞ্জাম প্রদান করা।</p>
<h2>আমাদের লক্ষ্য</h2>
<p>আমরা বিশ্বাস করি দৈনিক ধর্মীয় সরঞ্জামগুলো হওয়া উচিত:</p>
<ul>
<li><strong>বিনামূল্যে:</strong> ইসলাম সবার জন্য, এবং এর সরঞ্জামগুলো সাবস্ক্রিপশনের পিছনে লুকানো উচিত নয়।</li>
<li><strong>নির্ভুল:</strong> আমরা সর্বশেষ জ্যোতির্বিদ্যার সমীকরণ এবং নির্ভরযোগ্য ধর্মীয় উৎসের উপর নির্ভর করি।</li>
<li><strong>দ্রুত ও হালকা:</strong> সাইটটি সবচেয়ে ধীর সংযোগ ও পুরানো ডিভাইসেও কাজ করে।</li>
<li><strong>গোপনীয়তার প্রতি শ্রদ্ধাশীল:</strong> কোনো নিবন্ধন প্রয়োজন নেই, এবং আমরা আমাদের সার্ভারে আপনার ডেটা সংরক্ষণ করি না।</li>
</ul>
<h2>প্রধান বৈশিষ্ট্যসমূহ</h2>
<ul>
<li><strong>নামাজের সময়:</strong> ফজর, জোহর, আসর, মাগরিব, এশা — বিশ্বের প্রতিটি শহরের জন্য, সাপ্তাহিক সময়সূচী এবং প্রতিটি নামাজের আগে রিমাইন্ডার সহ।</li>
<li><strong>কিবলার দিক:</strong> ইন্টারঅ্যাকটিভ কম্পাস ও মানচিত্র যা আপনার অবস্থান থেকে কাবার দিক সঠিকভাবে দেখায়।</li>
<li><strong>হিজরি ক্যালেন্ডার:</strong> ১ হিজরি থেকে ১৫০০ হিজরি পর্যন্ত সম্পূর্ণ ক্যালেন্ডার এবং হিজরি ↔ খ্রিস্টীয় রূপান্তরকারী।</li>
<li><strong>দোয়া ও জিকির:</strong> কুরআন ও সুন্নাহ থেকে সুসংগঠিত সংগ্রহ (সকাল, সন্ধ্যা, নামাজ, ঘুম, ভ্রমণ…)।</li>
<li><strong>ডিজিটাল তাসবিহ:</strong> কাউন্টার যা আপনার অগ্রগতি সংরক্ষণ করে এবং দৈনিক লক্ষ্য সমর্থন করে।</li>
<li><strong>যাকাত ক্যালকুলেটর:</strong> নগদ, স্বর্ণ, রূপা, শেয়ার ও বিনিয়োগ অন্তর্ভুক্ত।</li>
<li><strong>শহরের পৃষ্ঠা:</strong> বিশ্বের বিভিন্ন শহরের জন্য হাজার হাজার পৃষ্ঠা, প্রতিটির সঙ্গে ভৌগোলিক তথ্য ও সঠিক সময়।</li>
</ul>
<h2>আমরা কীভাবে নামাজের সময় গণনা করি?</h2>
<p>আমরা প্রধান গণনা পদ্ধতিগুলোর সমর্থন সহ আন্তর্জাতিকভাবে স্বীকৃত জ্যোতির্বিদ্যার অ্যালগরিদম ব্যবহার করি:</p>
<ul>
<li>Islamic Society of North America (ISNA)</li>
<li>বিশ্ব মুসলিম লিগ (MWL)</li>
<li>মিশরীয় সাধারণ জরিপ কর্তৃপক্ষ</li>
<li>উম্মুল কুরা — সৌদি আরব</li>
<li>ইসলামি বিজ্ঞান বিশ্ববিদ্যালয়, করাচি</li>
</ul>
<h2>সমর্থিত ভাষা</h2>
<p>সাইটটি বর্তমানে <strong>আরবি</strong>, <strong>ইংরেজি</strong>, <strong>ফরাসি</strong>, <strong>তুর্কি</strong>, <strong>উর্দু</strong>, <strong>জার্মান</strong>, <strong>ইন্দোনেশীয়</strong>, <strong>স্প্যানিশ</strong>, <strong>বাংলা</strong> এবং <strong>মালয়</strong> ভাষায় উপলব্ধ।</p>
<h2>দল</h2>
<p>এই সাইটটি একটি স্বেচ্ছাসেবী প্রকল্প যা তাদের উম্মাহকে ভালোবাসেন এবং সেরা প্রযুক্তি দিয়ে সেবা করতে চান এমন মুসলিমদের দ্বারা পরিচালিত। আমরা ডেভেলপার, ডিজাইনার ও অনুবাদকদের স্বাগত জানাই — আমাদের <a href="/bn/contact">যোগাযোগ পৃষ্ঠা</a>-র মাধ্যমে যোগাযোগ করুন।</p>
<h2>এই সাইটটি কীভাবে অর্থায়িত হয়?</h2>
<p>সাইটটি সম্পূর্ণ বিনামূল্যে। সার্ভার ও উন্নয়ন খরচ বহনের জন্য আমরা Google AdSense আয়ের (পরিকল্পিত) উপর নির্ভর করি। আমরা কখনও বিঘ্নকারী বিজ্ঞাপন বা আমাদের ইসলামি মূল্যবোধের বিরুদ্ধে যায় এমন কোনো কন্টেন্ট দেখাব না।</p>`,
        ms: `<h1>Tentang Waktu Solat</h1>
<p><strong>Waktu Solat</strong> ialah projek Islam percuma yang bertujuan menyediakan alat Islam harian yang boleh dipercayai dan tepat untuk setiap Muslim di seluruh dunia — di mana-mana bandar, dalam apa-apa bahasa dan pada apa-apa peranti.</p>
<h2>Misi Kami</h2>
<p>Kami percaya alat keagamaan harian mestilah:</p>
<ul>
<li><strong>Percuma:</strong> Islam untuk semua, dan alatnya tidak sepatutnya tersembunyi di sebalik langganan.</li>
<li><strong>Tepat:</strong> kami bergantung pada persamaan astronomi terkini dan sumber keagamaan yang boleh dipercayai.</li>
<li><strong>Pantas dan ringan:</strong> laman ini berfungsi pada sambungan paling perlahan dan peranti paling lama.</li>
<li><strong>Menghormati privasi:</strong> tiada pendaftaran diperlukan, dan kami tidak menyimpan data anda di pelayan kami.</li>
</ul>
<h2>Ciri-ciri Utama</h2>
<ul>
<li><strong>Waktu Solat:</strong> Subuh, Zohor, Asar, Maghrib, Isyak — untuk setiap bandar di dunia, dengan jadual mingguan dan peringatan sebelum setiap solat.</li>
<li><strong>Arah Kiblat:</strong> kompas interaktif dan peta yang menunjukkan arah Kaabah dengan tepat dari lokasi anda.</li>
<li><strong>Kalendar Hijrah:</strong> kalendar penuh dari tahun 1 H hingga 1500 H serta penukar Hijrah ↔ Masihi.</li>
<li><strong>Doa dan zikir:</strong> koleksi tersusun dari Al-Quran dan Sunnah (pagi, petang, solat, tidur, perjalanan…).</li>
<li><strong>Tasbih Digital:</strong> kaunter yang menyimpan kemajuan anda dan menyokong sasaran harian.</li>
<li><strong>Kalkulator Zakat:</strong> merangkumi tunai, emas, perak, saham dan pelaburan.</li>
<li><strong>Halaman bandar:</strong> beribu-ribu halaman untuk bandar di seluruh dunia, setiap satu dengan maklumat geografi dan waktu yang tepat.</li>
</ul>
<h2>Bagaimana Kami Mengira Waktu Solat?</h2>
<p>Kami menggunakan algoritma astronomi yang diiktiraf di peringkat antarabangsa dengan sokongan untuk mazhab pengiraan utama:</p>
<ul>
<li>Islamic Society of North America (ISNA)</li>
<li>Liga Dunia Muslim (MWL)</li>
<li>Pihak Berkuasa Umum Ukur Mesir</li>
<li>Umm al-Qura — Arab Saudi</li>
<li>Universiti Sains Islam, Karachi</li>
</ul>
<h2>Bahasa yang Disokong</h2>
<p>Laman ini kini tersedia dalam bahasa <strong>Arab</strong>, <strong>Inggeris</strong>, <strong>Perancis</strong>, <strong>Turki</strong>, <strong>Urdu</strong>, <strong>Jerman</strong>, <strong>Indonesia</strong>, <strong>Sepanyol</strong>, <strong>Benggali</strong> dan <strong>Melayu</strong>.</p>
<h2>Pasukan</h2>
<p>Laman ini ialah projek sukarela yang dikendalikan oleh umat Islam yang mencintai umat mereka dan berhasrat untuk berkhidmat dengan teknologi terbaik. Kami mengalu-alukan pembangun, pereka bentuk dan penterjemah — hubungi kami melalui <a href="/ms/contact">halaman hubungi</a>.</p>
<h2>Bagaimana Laman Ini Dibiayai?</h2>
<p>Laman ini percuma sepenuhnya. Kami bergantung pada hasil Google AdSense (dirancang) untuk menampung kos pelayan dan pembangunan. Kami tidak akan memaparkan iklan yang mengganggu atau sebarang kandungan yang bertentangan dengan nilai Islam kami.</p>`
    }
};

// ============================================================
// ===== SSR SEO: server-side meta injection for HTML pages ===
// ============================================================

// أسماء الدول بالعربية (للـ SSR — يجب أن تطابق ما في prayer-times-cities.html)
const COUNTRY_NAMES_AR = {
    sa:'المملكة العربية السعودية', sy:'سوريا', eg:'مصر', iq:'العراق',
    jo:'الأردن', lb:'لبنان', ps:'فلسطين', kw:'الكويت', ae:'الإمارات',
    qa:'قطر', bh:'البحرين', om:'عُمان', ye:'اليمن', ly:'ليبيا',
    tn:'تونس', dz:'الجزائر', ma:'المغرب', sd:'السودان',
    dj:'جيبوتي', km:'جزر القمر',
    pk:'باكستان', tr:'تركيا', ir:'إيران', id:'إندونيسيا', my:'ماليزيا',
    bd:'بنغلاديش', af:'أفغانستان', in:'الهند', lk:'سريلانكا', np:'نيبال',
    cn:'الصين', jp:'اليابان', kr:'كوريا الجنوبية', kp:'كوريا الشمالية', mn:'منغوليا',
    fr:'فرنسا', de:'ألمانيا', gb:'المملكة المتحدة', es:'إسبانيا', it:'إيطاليا',
    nl:'هولندا', be:'بلجيكا', pt:'البرتغال', se:'السويد', no:'النرويج',
    dk:'الدنمارك', fi:'فنلندا', pl:'بولندا', ru:'روسيا', ua:'أوكرانيا',
    ch:'سويسرا', at:'النمسا', gr:'اليونان', cz:'التشيك', ro:'رومانيا',
    us:'الولايات المتحدة', ca:'كندا', mx:'المكسيك',
    gt:'غواتيمالا', cu:'كوبا', do:'الدومينيكان',
    br:'البرازيل', ar:'الأرجنتين', co:'كولومبيا', pe:'بيرو', ve:'فنزويلا',
    cl:'تشيلي', ec:'الإكوادور', bo:'بوليفيا', py:'باراغواي', uy:'أوروغواي',
    ng:'نيجيريا', et:'إثيوبيا', ke:'كينيا', tz:'تنزانيا', za:'جنوب أفريقيا',
    gh:'غانا', sn:'السنغال', cm:'الكاميرون', ml:'مالي', so:'الصومال',
    ug:'أوغندا', mr:'موريتانيا', td:'تشاد', ne:'النيجر',
    au:'أستراليا', nz:'نيوزيلندا',
    th:'تايلاند', ph:'الفلبين', vn:'فيتنام', mm:'ميانمار',
    kh:'كمبوديا', la:'لاوس', sg:'سنغافورة', bn:'بروناي', tl:'تيمور الشرقية',
    uz:'أوزبكستان', kz:'كازاخستان', kg:'قيرغيزستان', tj:'طاجيكستان',
    tm:'تركمانستان', az:'أذربيجان', ge:'جورجيا', am:'أرمينيا',
    xk:'كوسوفو',
    // Round 7k — توسّع: 40 دولة إضافية
    ba:'البوسنة والهرسك', al:'ألبانيا', mk:'مقدونيا الشمالية',
    bf:'بوركينا فاسو', ci:'ساحل العاج', gn:'غينيا', gm:'غامبيا',
    sl:'سيراليون', mv:'المالديف', er:'إريتريا', ss:'جنوب السودان',
    tg:'توغو', bj:'بنين',
    ie:'أيرلندا', hu:'المجر', hr:'كرواتيا', rs:'صربيا',
    bg:'بلغاريا', si:'سلوفينيا', sk:'سلوفاكيا',
    mg:'مدغشقر', mz:'موزمبيق', ao:'أنغولا', cd:'جمهورية الكونغو الديمقراطية',
    rw:'رواندا', zw:'زيمبابوي', zm:'زامبيا', mu:'موريشيوس',
    lr:'ليبيريا', mw:'مالاوي',
    sr:'سورينام', gy:'غيانا', tt:'ترينيداد وتوباغو', jm:'جامايكا',
    pa:'بنما', ht:'هايتي', cr:'كوستاريكا',
    bt:'بوتان', fj:'فيجي', pg:'بابوا غينيا الجديدة',
    // دول-المدن والمايكروستيتس
    mc:'موناكو', sm:'سان مارينو', va:'الفاتيكان', ad:'أندورا',
    li:'ليختنشتاين', lu:'لوكسمبورغ', mt:'مالطا',
};

// أشهر الهجرية (order 1..12 → {ar, en}) — keyed numerically since URL slugs were removed
const _HIJRI_MONTHS = {
    1:  { ar: 'محرم',            en: 'Muharram'        },
    2:  { ar: 'صفر',             en: 'Safar'           },
    3:  { ar: 'ربيع الأول',      en: 'Rabi al-Awwal'   },
    4:  { ar: 'ربيع الآخر',       en: 'Rabi al-Thani'   },
    5:  { ar: 'جمادى الأولى',    en: 'Jumada al-Ula'   },
    6:  { ar: 'جمادى الآخرة',    en: 'Jumada al-Akhira'},
    7:  { ar: 'رجب',             en: 'Rajab'           },
    8:  { ar: 'شعبان',           en: 'Shaban'          },
    9:  { ar: 'رمضان',           en: 'Ramadan'         },
    10: { ar: 'شوال',            en: 'Shawwal'         },
    11: { ar: 'ذو القعدة',        en: 'Dhu al-Qidah'    },
    12: { ar: 'ذو الحجة',         en: 'Dhu al-Hijjah'   },
};

// الشهر الميلادي (لـ SSR تحسين keyword consistency: "أبريل 2026" إلخ)
const _GREG_MONTHS = {
    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
    tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
    ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
    ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'],
};

/**
 * يحوّل التاريخ الميلادي الحالي إلى هجري (خوارزمية كويتية — دقّة ±1 يوم).
 * يُستخدم لحقن الشهر/السنة الهجرية في SSR (keyword consistency: "شوال 1447").
 * Returns: { year, month, day } — month هو index 1..12.
 */
// Hijri date — نفس خوارزمية js/hijri-date.js (لضمان تطابق SSR مع client-side calculation)
function _gregToJD(year, month, day) {
    if (month <= 2) { year--; month += 12; }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524;
}
function _hijriToJD(year, month, day) {
    return Math.floor((11 * year + 3) / 30) + 354 * year + 30 * month
        - Math.floor((month - 1) / 2) + day + 1948440 - 385;
}
function _jdToHijri(jd) {
    jd = Math.floor(jd) + 0.5;
    const year = Math.floor((30 * (jd - 1948439.5) + 10646) / 10631);
    const month = Math.min(12, Math.ceil((jd - (29 + _hijriToJD(year, 1, 1))) / 29.5) + 1);
    const day = jd - _hijriToJD(year, month, 1) + 1;
    return { year: year, month: Math.max(1, month), day: Math.max(1, Math.floor(day)) };
}
// Julian Day → Gregorian date
function _jdToGregorian(jd) {
    const jdInt = Math.floor(jd) + 0.5;
    const l = jdInt + 68569;
    const n = Math.floor((4 * l) / 146097);
    const l2 = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l2 + 1)) / 1461001);
    const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * l3) / 2447);
    const day = l3 - Math.floor((2447 * j) / 80);
    const l4 = Math.floor(j / 11);
    const month = j + 2 - 12 * l4;
    const year = 100 * (n - 49) + i + l4;
    return { year: Math.floor(year), month: Math.floor(month), day: Math.floor(day) };
}
// Hijri → Gregorian (نفس خوارزمية client-side لضمان التطابق)
function _hijriToGregorian(hYear, hMonth, hDay) {
    const jd = _hijriToJD(hYear, hMonth, hDay);
    return _jdToGregorian(jd);
}
// الحاضر دائماً بتوقيت مكّة المكرّمة (Asia/Riyadh) — ضروريّ لئلّا يتأخّر
// التاريخ الهجري/الميلادي يومًا كاملاً حين يكون TZ السيرفر UTC وفرق
// السعوديّة +3 لم يتخطَّ منتصف الليل بعد.
// الدالّة تُعيد Date بقيم UTC مُماثِلة لجدار وقت السعوديّة → استعمل
// getUTCFullYear/getUTCMonth/getUTCDate/getUTCDay فقط معها.
function _nowMeccaDate() {
    const [y, m, d] = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Riyadh',
        year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date()).split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}
function _hijriNow() {
    const now = _nowMeccaDate();
    const jd = _gregToJD(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());
    return _jdToHijri(jd);
}

function _escHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ===== 🆕 Level 3+: HTML stripper =====
// يحذف عنصرًا كاملاً من HTML عبر مطابقة وسم الفتح ثمّ عدّ الوسوم المتداخلة حتى الإغلاق المتوازن.
// lookup: { type: 'id'|'class', value: string }
// يُرجع HTML بدون العنصر (أو نفس HTML إن لم يُعثر عليه).
function _stripElement(html, lookup) {
    const attrName = lookup.type === 'id' ? 'id' : 'class';
    let openRe;
    if (lookup.type === 'id') {
        openRe = new RegExp(
            '<(\\w+)\\b[^>]*?\\sid="' + _reEsc(lookup.value) + '"[^>]*?>', 'i'
        );
    } else {
        // class يمكن أن يحتوي عدّة أصناف: class="a b c"
        openRe = new RegExp(
            '<(\\w+)\\b[^>]*?\\sclass="[^"]*\\b' + _reEsc(lookup.value) + '\\b[^"]*"[^>]*?>', 'i'
        );
    }
    const m = openRe.exec(html);
    if (!m) return html;
    const tag = m[1].toLowerCase();
    const startIdx = m.index;
    const afterOpen = startIdx + m[0].length;
    // self-closing?
    if (m[0].endsWith('/>')) {
        return html.slice(0, startIdx) + html.slice(afterOpen);
    }
    // عدّ متوازن
    const openTagRe  = new RegExp('<' + tag + '\\b',  'ig');
    const closeTagRe = new RegExp('</' + tag + '\\s*>', 'ig');
    let depth = 1, i = afterOpen;
    while (depth > 0 && i < html.length) {
        openTagRe.lastIndex  = i;
        closeTagRe.lastIndex = i;
        const nextOpen  = openTagRe.exec(html);
        const nextClose = closeTagRe.exec(html);
        if (!nextClose) return html; // HTML سيّء؛ لا نحذف شيئاً
        if (nextOpen && nextOpen.index < nextClose.index) {
            depth++;
            i = nextOpen.index + nextOpen[0].length;
        } else {
            depth--;
            i = nextClose.index + nextClose[0].length;
        }
    }
    if (depth !== 0) return html;
    return html.slice(0, startIdx) + html.slice(i);
}
function _reEsc(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ===== 🆕 Level 3+: Time-Left page pruner =====
// يُحدَّث هذا المصفوف بتزامن مع قاعدة CSS `html.time-left-page ... { display: none }`.
// هدفه: صفحة time-left أخفّ بأكثر من النصف (حذف فعليّ من الـDOM، لا إخفاء بصريّ).
const _TL_STRIP_IDS = [
    'city-hero-answer',
    'npt-hero',
    'city-page-search',
    'location-hero',
    'summary-info-strip',
    'city-summary-paragraph',
    'seo-keywords',
    'nearby-section',
    'prayer-schedule-section',
    'most-searched-chips',
    'country-cities-section',
    'arab-countries-section',
    'city-related-services',
    'related-links-section',
    'other-trending-cities',
    'home-quick-access',
    'moon-today-card',
    'faq-section',
    'mini-islamic-tools',
    'home-footer-links',
    'location-suggestion-bar',
    'page-h1',
    'city-breadcrumb',
    'prayer-cards'
];
const _TL_STRIP_CLASSES = [
    'next-prayer-banner',
    'hadith-section'
];
function _stripHtmlForTimeLeft(html) {
    for (const id of _TL_STRIP_IDS) {
        html = _stripElement(html, { type: 'id', value: id });
    }
    for (const cls of _TL_STRIP_CLASSES) {
        // قد يوجد أكثر من عنصر بنفس الصنف (مثلاً hadith-section) — كرّر
        let prev = '';
        let guard = 8;
        while (prev !== html && guard-- > 0) {
            prev = html;
            html = _stripElement(html, { type: 'class', value: cls });
        }
    }
    return html;
}

// 🆕 NPT Page Pruner — نفس فلسفة TL: صفحة single-purpose.
// الصفحة تجيب عن سؤال واحد: "ما الصلاة القادمة في {city}؟ ومتى؟"
// نحذف كلّ الأقسام الموروثة من city-page ونحتفظ فقط بـ #npt-hero.
// ملاحظة: tl-hero و tl-sticky مستبعدان هنا (خاصّان بـ time-left) فنحذفهما أيضًا.
const _NPT_STRIP_IDS = [
    'tl-hero',                  // time-left hero (غير مناسب هنا)
    'tl-sticky',                // sticky mini timer (خاصّ بـ time-left)
    'city-hero-answer',
    // 'npt-hero',              ← NOT stripped — this is the star of the page
    'city-page-search',
    'location-hero',
    'summary-info-strip',
    'city-summary-paragraph',
    'seo-keywords',
    'nearby-section',
    'prayer-schedule-section',
    'most-searched-chips',
    'country-cities-section',
    'arab-countries-section',
    'city-related-services',
    'related-links-section',
    'other-trending-cities',
    'home-quick-access',
    'moon-today-card',
    'faq-section',
    'mini-islamic-tools',
    'home-footer-links',
    'location-suggestion-bar',
    'page-h1',
    'city-breadcrumb',
    'prayer-cards'
];
const _NPT_STRIP_CLASSES = [
    'next-prayer-banner',
    'hadith-section'
];
function _stripHtmlForNpt(html) {
    for (const id of _NPT_STRIP_IDS) {
        html = _stripElement(html, { type: 'id', value: id });
    }
    for (const cls of _NPT_STRIP_CLASSES) {
        let prev = '';
        let guard = 8;
        while (prev !== html && guard-- > 0) {
            prev = html;
            html = _stripElement(html, { type: 'class', value: cls });
        }
    }
    return html;
}

// 🆕 Round 6 (City Audit): City Page Dead-Weight Pruner
// صفحة /prayer-times-in-{city} ترث قوالب (time-left hero + sticky + next-prayer hero) من index.html
// كانت تُخفى بـ CSS display:none فقط ⇒ dead weight في كل request + تكرار intent في نظر SEO + race على H1.
// الحل: حذف فعليّ من الـ DOM server-side (نفس فلسفة TL و NPT).
const _CITY_STRIP_IDS = [
    'tl-hero',      // time-left hero (خاصّ بصفحة time-left)
    'tl-sticky',    // sticky mini countdown bar (خاصّ بـ time-left)
    'npt-hero',     // next-prayer hero standalone (خاصّ بـ next-prayer)
];
function _stripHtmlForCity(html) {
    for (const id of _CITY_STRIP_IDS) {
        html = _stripElement(html, { type: 'id', value: id });
    }
    return html;
}

// UAT-Home-Simplify: Homepage Gateway Pruner.
//   الرئيسيّة لم تَعد صفحة "مواقيت مكّة" — صارت بوابة بحث خَفيفة. نَحذف من الـDOM
//   كلّ ما يُشبه صفحة مدينة (cards/schedule/banner/related-links/...). يَبقى فقط:
//   Hero + Tools (4) + Arab 8 countries + 2-question FAQ + slim Footer.
//   مَعايير القَبول: لا href="#"، لا city-templated FAQ، لا Mecca prayer table.
const _HOME_STRIP_IDS = [
    // Top sticky bar (no current city → "--" placeholders)
    'sticky-next-bar',
    // City-context (homepage has no city)
    'city-breadcrumb',
    // Tool-specific heroes (already stripped on TL/NPT routes)
    'tl-hero', 'tl-sticky', 'npt-hero',
    // Redundant — homepage already has #loc-hero-title as the active H1.
    //   #page-h1 (downgraded to H2 by _downgradeInactiveH1s) duplicates the
    //   "مواقيت الصلاة والتاريخ الهجري" theme just above the tools section,
    //   confusing users into thinking it's the tools heading.
    'page-h1',
    // Heavy city-content sections
    'next-prayer-banner',
    'prayer-cards',
    'event-countdown-badge',
    'summary-info-strip',
    'city-calc-settings',
    'city-summary-paragraph',
    'seo-keywords',
    'nearby-section',
    'prayer-schedule-section',
    'most-searched-chips',
    'country-cities-section',
    'city-related-services',
    'related-links-section',
    'other-trending-cities',
    'home-quick-access',
    'moon-today-card',
    'city-info',
    'weekly-schedule-section',
    // Footer sub-blocks (Wikipedia refs + social + share — user spec)
    'home-world-countries-block',
    'home-refs-block',
    'home-follow-block',
    'home-share-block',
];
const _HOME_STRIP_CLASSES = [
    'next-prayer-banner',
    'hadith-section',
    'faq-city-only',     // q3-q9 (and their dividers) — hidden was CSS-only; now removed from DOM/JSON-LD
    'loc-hero-city',     // "📍 مكة المكرمة، …" pill inside #location-hero — irrelevant on /, leaks Mecca
];
function _stripHtmlForHome(html) {
    for (const id of _HOME_STRIP_IDS) {
        html = _stripElement(html, { type: 'id', value: id });
    }
    for (const cls of _HOME_STRIP_CLASSES) {
        let prev = '', guard = 12;
        while (prev !== html && guard-- > 0) {
            prev = html;
            html = _stripElement(html, { type: 'class', value: cls });
        }
    }
    return html;
}

// UAT-Moon-Home: /moon-today as Moon Gateway. Strips heavy moon sections +
//   the entire #page-prayer-times shell. The new #moon-hub-hero /
//   #moon-hub-faq sections are kept (they have class .hub-only — default
//   display:none, shown via html.moon-today-hub-page CSS).
const _MOON_HUB_STRIP_IDS = [
    'page-prayer-times',          // entire prayer shell
    'moon-page-h1',               // original moon H1 (replaced by hero #moon-hub-h1)
    'moon-subtitle',
    'moon-intro',
    'moon-events-section',
    'moon-chart-section',
    'moon-forecast',
    'moon-faq-general',
    'moon-faq-city',
    'home-world-countries-block',
    'home-refs-block',
    'home-follow-block',
    'home-share-block',
];
const _MOON_HUB_STRIP_CLASSES = [
    'moon-evergreen',
    'moon-faq-city-card',
    'moon-breadcrumb',            // nav (hero is the entry point now)
];
function _stripHtmlForMoonHub(html) {
    for (const id of _MOON_HUB_STRIP_IDS) {
        html = _stripElement(html, { type: 'id', value: id });
    }
    for (const cls of _MOON_HUB_STRIP_CLASSES) {
        let prev = '', guard = 8;
        while (prev !== html && guard-- > 0) {
            prev = html;
            html = _stripElement(html, { type: 'class', value: cls });
        }
    }
    return html;
}

// ── Phase E4-city (2026-05-02): lightweight strip used by ALL moon city
//    pages (today/hub/month/date) to remove ONLY #page-prayer-times — the
//    full prayer-times shell with its class="active" — which would otherwise
//    flash visible at first paint before JS routes to #page-moon. That flash
//    was Lighthouse's catastrophic CLS culprit (0.939) on city pages. Unlike
//    _stripHtmlForMoonHub above (which strips many moon sections too because
//    /moon-today is a generic gateway), this strip touches NOTHING ELSE so
//    the moon sections needed by city pages stay intact.
function _stripPagePrayerTimesOnly(html) {
    return _stripElement(html, { type: 'id', value: 'page-prayer-times' });
}

// ===== Phase I — H1 deduplication per route =====
// SPA shell shares index.html across all routes. كل route له H1 خاصّ به.
// CSS يُخفي البقيّة، لكنّ Google يقرأ HTML ويرى ~9 H1 في كلّ صفحة.
// هذه الدالة تُحوِّل H1 غير النشط إلى H2 (ساعى الـ SSR، يُحافظ على class للستايل).
// Map: route → identifier للـ H1 النشط (id أو data-i18n)
function _getActiveH1Marker(urlPath) {
    const path = urlPath.replace(/^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\//, '/');
    if (/^\/prayer-times-in-/.test(path))            return { kind: 'id',   value: 'page-h1' };
    if (/^\/qibla-in-/.test(path))                   return { kind: 'id',   value: 'qibla-hero-title' };
    if (/^\/time-left-until-prayer-in-/.test(path))  return { kind: 'id',   value: 'tl-h1' };
    if (/^\/next-prayer-time-in-/.test(path))        return { kind: 'id',   value: 'npt-h1' };
    if (/^\/today-hijri-date$/.test(path))           return { kind: 'id',   value: 'hijri-today-full' };
    if (/^\/hijri-date\//.test(path))                return { kind: 'id',   value: 'hday-title' };
    if (/^\/(?:moon-today|moon-in)-/.test(path))     return { kind: 'id',   value: 'moon-page-h1' };
    // UAT-Moon-Home: hub /moon-today uses the new hero H1 (#moon-hub-h1)
    if (/^\/moon-today$/.test(path))                 return { kind: 'id',   value: 'moon-hub-h1' };
    if (/^\/moon-in$/.test(path))                    return { kind: 'id',   value: 'moon-page-h1' };
    if (/^\/ramadan-countdown$/.test(path))          return { kind: 'i18n', value: 'ramadan.h1' };
    if (/^\/eid-al-fitr-countdown$/.test(path))      return { kind: 'i18n', value: 'eid_fitr.h1' };
    if (/^\/eid-al-adha-countdown$/.test(path))      return { kind: 'i18n', value: 'eid_adha.h1' };
    if (/^\/hijri-new-year-countdown$/.test(path))   return { kind: 'i18n', value: 'hijri_ny.h1' };
    if (/^\/?$/.test(path))                          return { kind: 'id',   value: 'loc-hero-title' };
    return null;   // route غير معروف — لا تعديل
}
function _downgradeInactiveH1s(html, urlPath) {
    const active = _getActiveH1Marker(urlPath);
    if (!active) return html;
    return html.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, (full, attrs, content) => {
        let isActive = false;
        if (active.kind === 'id') {
            const m = attrs.match(/\bid=["']([^"']+)["']/);
            if (m && m[1] === active.value) isActive = true;
        } else if (active.kind === 'i18n') {
            const m = attrs.match(/\bdata-i18n=["']([^"']+)["']/);
            if (m && m[1] === active.value) isActive = true;
        }
        if (isActive) return full;
        return `<h2${attrs}>${content}</h2>`;
    });
}

// ===== SSR: بناء فقرة تعريفيّة ديناميكيّة لصفحة القمر =====
// يُنتج نصًّا بأرقام حقيقيّة (إضاءة/عمر/طور/كوكبة/ارتفاع) يراه Googlebot بدون JS.
// يُرجع النصّ الناتج، أو null عند أيّ فشل (ليتمّ الرجوع للنصّ الثابت).
// المدخل cityLabel = "City, Country" جاهزة لوضعها في {city}.
// lat/lng (اختياريّان): لبناء جملة الارتفاع/السَمت المرتبطة بالموقع حقًّا.
// Round 17 (smart content): dateObj (اختياريّ) — إن مُرِّر، تُحتسب البيانات لذلك اليوم بدل
// new Date()، ما يجعل كلّ صفحة `/moon-in-{city}/{date}` تحصل على فقرة فريدة بأرقامها الحقيقيّة.
// dateLabel/hijriLabel (اختياريّان): لحقن التاريخ في الفقرة (unique-per-page SEO).
function _buildSsrMoonIntro(lang, cityLabel, lat, lng, dateObj, dateLabel, hijriLabel) {
    try {
        if (!MoonCalc || !I18N) return null;
        const _hasDate = (dateObj instanceof Date && !isNaN(dateObj.getTime()));
        const today = _hasDate ? dateObj : new Date();
        const phase = MoonCalc.getPhaseName(today);                 // {name, icon, english, key}
        const illumRaw = MoonCalc.getMoonIllumination(today);       // 0..100
        const ageRaw = MoonCalc.getMoonAge(today);                  // 0..29.53
        const zodiac = MoonCalc.getMoonZodiac(today);               // {key, icon, i18nKey, ...}
        const dict = I18N[lang] || I18N.en || {};
        const enDict = I18N.en || {};
        // Round 17: على صفحات التاريخ نستعمل قالباً مختلفاً يحقن {date} بدل «اليوم/today/aujourd'hui…»
        // ليُنتِج لكلّ تاريخ فقرة فريدة 100% بأرقامها الفلكيّة الحقيقيّة (unique-per-page SEO).
        const _templateKey = (_hasDate && dateLabel) ? 'moon.date_intro_template' : 'moon.intro_template';
        const template = dict[_templateKey]
            || enDict[_templateKey]
            || dict['moon.intro_template']
            || enDict['moon.intro_template']
            || 'Today in {city}, the Moon is in a {phaseIcon} {phaseName} phase at {illum}% illumination. The Moon is {age} days old and currently in the {zodiacIcon} {zodiacName} constellation.';
        const phaseName = dict[phase.key] || enDict[phase.key] || phase.english || phase.name || '';
        const zodiacName = dict[zodiac.i18nKey] || enDict[zodiac.i18nKey] || zodiac.key || '';
        // أرقام لاتينيّة دائمًا (Latin digits) — حتى في العربيّة/الأردو
        const illumStr = Number(illumRaw).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const ageStr   = Number(ageRaw).toLocaleString('en-US',   { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        // جملة الارتفاع/السَمت — تختلف فعليًّا بين المدن (هذه هي القيمة التي تجعل
        // الصفحة «محليّة حقًّا» بدل تكرار نفس الأرقام الفلكيّة العالميّة).
        let altitudeSentence = '';
        try {
            if (typeof lat === 'number' && typeof lng === 'number'
                && typeof MoonCalc.getMoonAltitude === 'function'
                && typeof MoonCalc.getMoonAzimuth === 'function') {
                const alt = MoonCalc.getMoonAltitude(today, lat, lng);
                if (alt !== null && isFinite(alt)) {
                    const altFmt = Number(Math.abs(alt)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
                    if (alt > 0) {
                        const az = MoonCalc.getMoonAzimuth(today, lat, lng);
                        const dirKeys = ['n','ne','e','se','s','sw','w','nw'];
                        const dirIdx = Math.round(((Number(az) || 0) % 360) / 45) % 8;
                        const dirKey = 'moon.compass.' + dirKeys[dirIdx];
                        const dirName = dict[dirKey] || enDict[dirKey] || ['N','NE','E','SE','S','SW','W','NW'][dirIdx];
                        const aboveTpl = dict['moon.altitude_above'] || enDict['moon.altitude_above'] || '';
                        if (aboveTpl) {
                            altitudeSentence = aboveTpl
                                .replace(/\{alt\}/g, altFmt)
                                .replace(/\{dir\}/g, dirName);
                        }
                    } else {
                        const belowTpl = dict['moon.altitude_below'] || enDict['moon.altitude_below'] || '';
                        if (belowTpl) altitudeSentence = belowTpl.replace(/\{alt\}/g, altFmt);
                    }
                }
            }
        } catch (_eAlt) { /* silent */ }
        // Round 17: {date} و {hijriInline} لصفحات التاريخ — فارغان لصفحة اليوم/الـhub.
        const _dateStr = (_hasDate && typeof dateLabel === 'string' && dateLabel) ? dateLabel : '';
        let _hijriInlineStr = '';
        if (_hasDate && typeof hijriLabel === 'string' && hijriLabel) {
            _hijriInlineStr = (lang === 'ar' || lang === 'ur')
                ? ` (الموافق ${hijriLabel})`
                : ` (${hijriLabel})`;
        }
        return template
            .replace(/\{city\}/g, cityLabel)
            .replace(/\{date\}/g, _dateStr)
            .replace(/\{hijriInline\}/g, _hijriInlineStr)
            .replace(/\{phaseIcon\}/g, phase.icon || '')
            .replace(/\{phaseName\}/g, phaseName)
            .replace(/\{illum\}/g, illumStr)
            .replace(/\{age\}/g, ageStr)
            .replace(/\{zodiacIcon\}/g, zodiac.icon || '')
            .replace(/\{zodiacName\}/g, zodiacName)
            .replace(/\{altitudeSentence\}/g, altitudeSentence)
            // تنظيف فراغات مزدوجة إن بقيت جملة الارتفاع فارغة
            .replace(/\s{2,}/g, ' ')
            .trim();
    } catch (_e) {
        try { console.warn('[SSR moon intro] build failed:', _e && _e.message); } catch(_){}
        return null;
    }
}

function _slugToTitle(slug) {
    return (slug || '').split('-').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

// يأخذ slug دولة (مثل 'saudi-arabia') ويعيد {cc, nameAr, nameEn}
function _countryFromSlug(slug) {
    for (const cc in COUNTRY_NAMES_EN) {
        const s = makeCountrySlugSrv(cc);
        if (s === slug) return { cc, nameAr: COUNTRY_NAMES_AR[cc] || COUNTRY_NAMES_EN[cc], nameEn: COUNTRY_NAMES_EN[cc] };
    }
    // لم يُطابق دولة — نُرجِع '__' كإشارة sentinel ليتمكّن المُستدعون من التمييز
    // بين دولة حقيقية (cc من ISO) وslug مدينة (fallback). كل المُستدعين يفحصون cc !== '__'.
    const fallback = _slugToTitle(slug);
    return { cc: '__', nameAr: fallback, nameEn: fallback };
}

// ============================================================
// صفحة /countries: قائمة كل دول العالم مع أعلامها، مجموعة حسب المنطقة
// ============================================================
const _COUNTRIES_REGIONS = {
    arab:     ['sa','eg','ae','iq','sy','jo','ps','lb','ye','om','kw','qa','bh','ma','dz','tn','ly','sd','mr','so','dj','km'],
    asia:     ['tr','ir','pk','af','in','bd','id','my','sg','bn','ph','th','vn','kh','la','tl','cn','jp','kr','kp','mn','kz','uz','az','lk','np','mm','kg','tj','tm','ge','am','mv','bt'],
    africa:   ['ng','et','ke','tz','za','gh','sn','cm','ml','ug','td','ne','bf','ci','gn','gm','sl','er','ss','tg','bj','mg','mz','ao','cd','rw','zw','zm','mu','lr','mw'],
    europe:   ['fr','de','gb','nl','be','es','it','pt','se','no','dk','fi','ch','at','gr','cz','ro','pl','ru','ua','xk','ba','al','mk','ie','hu','hr','rs','bg','si','sk'],
    americas: ['us','ca','mx','gt','cu','do','br','ar','co','pe','ve','cl','ec','bo','py','uy','sr','gy','tt','jm','pa','ht','cr'],
    oceania:  ['au','nz','fj','pg'],
};

const _REGION_TITLES = {
    arab:     { ar:'🕌 الدول العربية',   en:'🕌 Arab Countries',    fr:'🕌 Pays arabes',       tr:'🕌 Arap Ülkeleri',       ur:'🕌 عرب ممالک',        de:'🕌 Arabische Länder',  id:'🕌 Negara-Negara Arab', es:'🕌 Países Árabes',     bn:'🕌 আরব দেশসমূহ',          ms:'🕌 Negara Arab' },
    asia:     { ar:'🌏 آسيا',              en:'🌏 Asia',              fr:'🌏 Asie',              tr:'🌏 Asya',                ur:'🌏 ایشیا',             de:'🌏 Asien',              id:'🌏 Asia',               es:'🌏 Asia',              bn:'🌏 এশিয়া',                 ms:'🌏 Asia' },
    africa:   { ar:'🌍 أفريقيا',           en:'🌍 Africa',            fr:'🌍 Afrique',           tr:'🌍 Afrika',              ur:'🌍 افریقہ',            de:'🌍 Afrika',             id:'🌍 Afrika',             es:'🌍 África',            bn:'🌍 আফ্রিকা',                ms:'🌍 Afrika' },
    europe:   { ar:'🌍 أوروبا',            en:'🌍 Europe',            fr:'🌍 Europe',            tr:'🌍 Avrupa',              ur:'🌍 یورپ',              de:'🌍 Europa',             id:'🌍 Eropa',              es:'🌍 Europa',            bn:'🌍 ইউরোপ',                  ms:'🌍 Eropah' },
    americas: { ar:'🌎 الأمريكتان',        en:'🌎 The Americas',      fr:'🌎 Amériques',         tr:'🌎 Amerika Kıtası',      ur:'🌎 امریکہ',            de:'🌎 Amerika',            id:'🌎 Benua Amerika',      es:'🌎 Las Américas',      bn:'🌎 আমেরিকা মহাদেশ',         ms:'🌎 Benua Amerika' },
    oceania:  { ar:'🌏 أوقيانوسيا',        en:'🌏 Oceania',           fr:'🌏 Océanie',           tr:'🌏 Okyanusya',           ur:'🌏 اوشیانیا',          de:'🌏 Ozeanien',           id:'🌏 Oseania',            es:'🌏 Oceanía',           bn:'🌏 ওশেনিয়া',               ms:'🌏 Oceania' },
};

// ترجمات أسماء الدول لغير العربية (لغير AR — نعتمد على COUNTRY_NAMES_EN كأساس،
// ونضيف ترجمات لـ fr/tr/ur للدول العربية + الكبرى لجعلها localized)
const _COUNTRY_NAMES_FR = {
    sa:'Arabie Saoudite', eg:'Égypte', ae:'Émirats arabes unis', iq:'Irak', sy:'Syrie',
    jo:'Jordanie', ps:'Palestine', lb:'Liban', ye:'Yémen', om:'Oman',
    kw:'Koweït', qa:'Qatar', bh:'Bahreïn', ma:'Maroc', dz:'Algérie',
    tn:'Tunisie', ly:'Libye', sd:'Soudan', mr:'Mauritanie', so:'Somalie',
    dj:'Djibouti', km:'Comores',
    tr:'Turquie', ir:'Iran', pk:'Pakistan', af:'Afghanistan', in:'Inde',
    bd:'Bangladesh', id:'Indonésie', my:'Malaisie', fr:'France', de:'Allemagne',
    gb:'Royaume-Uni', us:'États-Unis', ca:'Canada', mx:'Mexique', br:'Brésil',
    ru:'Russie', cn:'Chine', jp:'Japon', kr:'Corée du Sud',
    // Round 7k
    ba:'Bosnie-Herzégovine', al:'Albanie', mk:'Macédoine du Nord',
    bf:'Burkina Faso', ci:"Côte d'Ivoire", gn:'Guinée', gm:'Gambie',
    sl:'Sierra Leone', mv:'Maldives', er:'Érythrée', ss:'Soudan du Sud',
    tg:'Togo', bj:'Bénin',
    ie:'Irlande', hu:'Hongrie', hr:'Croatie', rs:'Serbie',
    bg:'Bulgarie', si:'Slovénie', sk:'Slovaquie',
    mg:'Madagascar', mz:'Mozambique', ao:'Angola', cd:'République démocratique du Congo',
    rw:'Rwanda', zw:'Zimbabwe', zm:'Zambie', mu:'Maurice',
    lr:'Libéria', mw:'Malawi',
    sr:'Suriname', gy:'Guyana', tt:'Trinité-et-Tobago', jm:'Jamaïque',
    pa:'Panama', ht:'Haïti', cr:'Costa Rica',
    bt:'Bhoutan', fj:'Fidji', pg:'Papouasie-Nouvelle-Guinée',
};
const _COUNTRY_NAMES_TR = {
    sa:'Suudi Arabistan', eg:'Mısır', ae:'BAE', iq:'Irak', sy:'Suriye',
    jo:'Ürdün', ps:'Filistin', lb:'Lübnan', ye:'Yemen', om:'Umman',
    kw:'Kuveyt', qa:'Katar', bh:'Bahreyn', ma:'Fas', dz:'Cezayir',
    tn:'Tunus', ly:'Libya', sd:'Sudan', mr:'Moritanya', so:'Somali',
    dj:'Cibuti', km:'Komorlar',
    tr:'Türkiye', ir:'İran', pk:'Pakistan', af:'Afganistan', in:'Hindistan',
    bd:'Bangladeş', id:'Endonezya', my:'Malezya', fr:'Fransa', de:'Almanya',
    gb:'Birleşik Krallık', us:'Amerika Birleşik Devletleri', ca:'Kanada', mx:'Meksika',
    br:'Brezilya', ru:'Rusya', cn:'Çin', jp:'Japonya', kr:'Güney Kore',
    // Round 7k
    ba:'Bosna Hersek', al:'Arnavutluk', mk:'Kuzey Makedonya',
    bf:'Burkina Faso', ci:'Fildişi Sahili', gn:'Gine', gm:'Gambiya',
    sl:'Sierra Leone', mv:'Maldivler', er:'Eritre', ss:'Güney Sudan',
    tg:'Togo', bj:'Benin',
    ie:'İrlanda', hu:'Macaristan', hr:'Hırvatistan', rs:'Sırbistan',
    bg:'Bulgaristan', si:'Slovenya', sk:'Slovakya',
    mg:'Madagaskar', mz:'Mozambik', ao:'Angola', cd:'Demokratik Kongo Cumhuriyeti',
    rw:'Ruanda', zw:'Zimbabve', zm:'Zambiya', mu:'Mauritius',
    lr:'Liberya', mw:'Malavi',
    sr:'Surinam', gy:'Guyana', tt:'Trinidad ve Tobago', jm:'Jamaika',
    pa:'Panama', ht:'Haiti', cr:'Kosta Rika',
    bt:'Butan', fj:'Fiji', pg:'Papua Yeni Gine',
};
const _COUNTRY_NAMES_UR = {
    sa:'سعودی عرب', eg:'مصر', ae:'متحدہ عرب امارات', iq:'عراق', sy:'شام',
    jo:'اردن', ps:'فلسطین', lb:'لبنان', ye:'یمن', om:'عمان',
    kw:'کویت', qa:'قطر', bh:'بحرین', ma:'مراکش', dz:'الجزائر',
    tn:'تیونس', ly:'لیبیا', sd:'سوڈان', mr:'موریطانیہ', so:'صومالیہ',
    dj:'جبوتی', km:'جزائرِ قمر',
    tr:'ترکی', ir:'ایران', pk:'پاکستان', af:'افغانستان', in:'بھارت',
    bd:'بنگلہ دیش', id:'انڈونیشیا', my:'ملائیشیا', fr:'فرانس', de:'جرمنی',
    gb:'برطانیہ', us:'ریاستہائے متحدہ', ca:'کینیڈا', mx:'میکسیکو',
    br:'برازیل', ru:'روس', cn:'چین', jp:'جاپان', kr:'جنوبی کوریا',
    // Round 7k
    ba:'بوسنیا و ہرزیگووینا', al:'البانیا', mk:'شمالی مقدونیہ',
    bf:'برکینا فاسو', ci:'آئیوری کوسٹ', gn:'گنی', gm:'گیمبیا',
    sl:'سیرا لیون', mv:'مالدیپ', er:'اریٹریا', ss:'جنوبی سوڈان',
    tg:'ٹوگو', bj:'بینن',
    ie:'آئرلینڈ', hu:'ہنگری', hr:'کروشیا', rs:'سربیا',
    bg:'بلغاریہ', si:'سلووینیا', sk:'سلوواکیہ',
    mg:'مڈغاسکر', mz:'موزمبیق', ao:'انگولا', cd:'جمہوری جمہوریہ کانگو',
    rw:'روانڈا', zw:'زمبابوے', zm:'زیمبیا', mu:'ماریشس',
    lr:'لائبیریا', mw:'ملاوی',
    sr:'سرینام', gy:'گیانا', tt:'ٹرینیڈاڈ اور ٹوباگو', jm:'جمیکا',
    pa:'پاناما', ht:'ہیٹی', cr:'کوسٹا ریکا',
    bt:'بھوٹان', fj:'فجی', pg:'پاپوا نیو گنی',
};
const _COUNTRY_NAMES_DE = {
    sa:'Saudi-Arabien', eg:'Ägypten', ae:'Vereinigte Arabische Emirate', iq:'Irak', sy:'Syrien',
    jo:'Jordanien', ps:'Palästina', lb:'Libanon', ye:'Jemen', om:'Oman',
    kw:'Kuwait', qa:'Katar', bh:'Bahrain', ma:'Marokko', dz:'Algerien',
    tn:'Tunesien', ly:'Libyen', sd:'Sudan', mr:'Mauretanien', so:'Somalia',
    dj:'Dschibuti', km:'Komoren',
    tr:'Türkei', ir:'Iran', pk:'Pakistan', af:'Afghanistan', in:'Indien',
    bd:'Bangladesch', id:'Indonesien', my:'Malaysia', fr:'Frankreich', de:'Deutschland',
    gb:'Vereinigtes Königreich', us:'Vereinigte Staaten', ca:'Kanada', mx:'Mexiko',
    br:'Brasilien', ru:'Russland', cn:'China', jp:'Japan', kr:'Südkorea',
    // Round 7k
    ba:'Bosnien und Herzegowina', al:'Albanien', mk:'Nordmazedonien',
    bf:'Burkina Faso', ci:'Elfenbeinküste', gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leone', mv:'Malediven', er:'Eritrea', ss:'Südsudan',
    tg:'Togo', bj:'Benin',
    ie:'Irland', hu:'Ungarn', hr:'Kroatien', rs:'Serbien',
    bg:'Bulgarien', si:'Slowenien', sk:'Slowakei',
    mg:'Madagaskar', mz:'Mosambik', ao:'Angola', cd:'Demokratische Republik Kongo',
    rw:'Ruanda', zw:'Simbabwe', zm:'Sambia', mu:'Mauritius',
    lr:'Liberia', mw:'Malawi',
    sr:'Suriname', gy:'Guyana', tt:'Trinidad und Tobago', jm:'Jamaika',
    pa:'Panama', ht:'Haiti', cr:'Costa Rica',
    bt:'Bhutan', fj:'Fidschi', pg:'Papua-Neuguinea',
    // Extras (most common European and other countries from COUNTRY_NAMES_EN baseline)
    nl:'Niederlande', be:'Belgien', es:'Spanien', it:'Italien', pt:'Portugal',
    se:'Schweden', no:'Norwegen', dk:'Dänemark', fi:'Finnland', ch:'Schweiz',
    at:'Österreich', gr:'Griechenland', cz:'Tschechien', ro:'Rumänien', pl:'Polen',
    ua:'Ukraine', xk:'Kosovo',
    sg:'Singapur', bn:'Brunei', ph:'Philippinen', th:'Thailand', vn:'Vietnam',
    kh:'Kambodscha', la:'Laos', tl:'Osttimor', kp:'Nordkorea', mn:'Mongolei',
    kz:'Kasachstan', uz:'Usbekistan', az:'Aserbaidschan', lk:'Sri Lanka', np:'Nepal',
    mm:'Myanmar', kg:'Kirgisistan', tj:'Tadschikistan', tm:'Turkmenistan',
    ge:'Georgien', am:'Armenien',
    ng:'Nigeria', et:'Äthiopien', ke:'Kenia', tz:'Tansania', za:'Südafrika',
    gh:'Ghana', sn:'Senegal', cm:'Kamerun', ml:'Mali', ug:'Uganda',
    td:'Tschad', ne:'Niger',
    au:'Australien', nz:'Neuseeland',
    gt:'Guatemala', cu:'Kuba', do:'Dominikanische Republik',
    ar:'Argentinien', co:'Kolumbien', pe:'Peru', ve:'Venezuela',
    cl:'Chile', ec:'Ecuador', bo:'Bolivien', py:'Paraguay', uy:'Uruguay',
};
const _COUNTRY_NAMES_ID = {
    sa:'Arab Saudi', eg:'Mesir', ae:'Uni Emirat Arab', iq:'Irak', sy:'Suriah',
    jo:'Yordania', ps:'Palestina', lb:'Lebanon', ye:'Yaman', om:'Oman',
    kw:'Kuwait', qa:'Qatar', bh:'Bahrain', ma:'Maroko', dz:'Aljazair',
    tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia',
    dj:'Djibouti', km:'Komoro',
    tr:'Turki', ir:'Iran', pk:'Pakistan', af:'Afghanistan', in:'India',
    bd:'Bangladesh', id:'Indonesia', my:'Malaysia', fr:'Prancis', de:'Jerman',
    gb:'Britania Raya', us:'Amerika Serikat', ca:'Kanada', mx:'Meksiko',
    br:'Brasil', ru:'Rusia', cn:'Tiongkok', jp:'Jepang', kr:'Korea Selatan',
    // Round 7k
    ba:'Bosnia dan Herzegovina', al:'Albania', mk:'Makedonia Utara',
    bf:'Burkina Faso', ci:'Pantai Gading', gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leone', mv:'Maladewa', er:'Eritrea', ss:'Sudan Selatan',
    tg:'Togo', bj:'Benin',
    ie:'Irlandia', hu:'Hungaria', hr:'Kroasia', rs:'Serbia',
    bg:'Bulgaria', si:'Slovenia', sk:'Slovakia',
    mg:'Madagaskar', mz:'Mozambik', ao:'Angola', cd:'Republik Demokratik Kongo',
    rw:'Rwanda', zw:'Zimbabwe', zm:'Zambia', mu:'Mauritius',
    lr:'Liberia', mw:'Malawi',
    sr:'Suriname', gy:'Guyana', tt:'Trinidad dan Tobago', jm:'Jamaika',
    pa:'Panama', ht:'Haiti', cr:'Kosta Rika',
    bt:'Bhutan', fj:'Fiji', pg:'Papua Nugini',
    // Extras
    nl:'Belanda', be:'Belgia', es:'Spanyol', it:'Italia', pt:'Portugal',
    se:'Swedia', no:'Norwegia', dk:'Denmark', fi:'Finlandia', ch:'Swiss',
    at:'Austria', gr:'Yunani', cz:'Ceko', ro:'Rumania', pl:'Polandia',
    ua:'Ukraina', xk:'Kosovo',
    sg:'Singapura', bn:'Brunei', ph:'Filipina', th:'Thailand', vn:'Vietnam',
    kh:'Kamboja', la:'Laos', tl:'Timor Leste', kp:'Korea Utara', mn:'Mongolia',
    kz:'Kazakhstan', uz:'Uzbekistan', az:'Azerbaijan', lk:'Sri Lanka', np:'Nepal',
    mm:'Myanmar', kg:'Kirgizstan', tj:'Tajikistan', tm:'Turkmenistan',
    ge:'Georgia', am:'Armenia',
    ng:'Nigeria', et:'Ethiopia', ke:'Kenya', tz:'Tanzania', za:'Afrika Selatan',
    gh:'Ghana', sn:'Senegal', cm:'Kamerun', ml:'Mali', ug:'Uganda',
    td:'Chad', ne:'Niger',
    au:'Australia', nz:'Selandia Baru',
    gt:'Guatemala', cu:'Kuba', do:'Republik Dominika',
    ar:'Argentina', co:'Kolombia', pe:'Peru', ve:'Venezuela',
    cl:'Chili', ec:'Ekuador', bo:'Bolivia', py:'Paraguay', uy:'Uruguay',
};
const _COUNTRY_NAMES_ES = {
    sa:'Arabia Saudita', eg:'Egipto', ae:'Emiratos Árabes Unidos', iq:'Irak', sy:'Siria',
    jo:'Jordania', ps:'Palestina', lb:'Líbano', ye:'Yemen', om:'Omán',
    kw:'Kuwait', qa:'Catar', bh:'Baréin', ma:'Marruecos', dz:'Argelia',
    tn:'Túnez', ly:'Libia', sd:'Sudán', mr:'Mauritania', so:'Somalia',
    dj:'Yibuti', km:'Comoras',
    tr:'Turquía', ir:'Irán', pk:'Pakistán', af:'Afganistán', in:'India',
    bd:'Bangladés', id:'Indonesia', my:'Malasia', fr:'Francia', de:'Alemania',
    gb:'Reino Unido', us:'Estados Unidos', ca:'Canadá', mx:'México',
    br:'Brasil', ru:'Rusia', cn:'China', jp:'Japón', kr:'Corea del Sur',
    ba:'Bosnia y Herzegovina', al:'Albania', mk:'Macedonia del Norte',
    bf:'Burkina Faso', ci:'Costa de Marfil', gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leona', mv:'Maldivas', er:'Eritrea', ss:'Sudán del Sur',
    tg:'Togo', bj:'Benín',
    ie:'Irlanda', hu:'Hungría', hr:'Croacia', rs:'Serbia',
    bg:'Bulgaria', si:'Eslovenia', sk:'Eslovaquia',
    mg:'Madagascar', mz:'Mozambique', ao:'Angola', cd:'República Democrática del Congo',
    rw:'Ruanda', zw:'Zimbabue', zm:'Zambia', mu:'Mauricio',
    lr:'Liberia', mw:'Malaui',
    sr:'Surinam', gy:'Guyana', tt:'Trinidad y Tobago', jm:'Jamaica',
    pa:'Panamá', ht:'Haití', cr:'Costa Rica',
    bt:'Bután', fj:'Fiyi', pg:'Papúa Nueva Guinea',
    nl:'Países Bajos', be:'Bélgica', es:'España', it:'Italia', pt:'Portugal',
    se:'Suecia', no:'Noruega', dk:'Dinamarca', fi:'Finlandia', ch:'Suiza',
    at:'Austria', gr:'Grecia', cz:'Chequia', ro:'Rumanía', pl:'Polonia',
    ua:'Ucrania', xk:'Kosovo',
    sg:'Singapur', bn:'Brunéi', ph:'Filipinas', th:'Tailandia', vn:'Vietnam',
    kh:'Camboya', la:'Laos', tl:'Timor Oriental', kp:'Corea del Norte', mn:'Mongolia',
    kz:'Kazajistán', uz:'Uzbekistán', az:'Azerbaiyán', lk:'Sri Lanka', np:'Nepal',
    mm:'Birmania', kg:'Kirguistán', tj:'Tayikistán', tm:'Turkmenistán',
    ge:'Georgia', am:'Armenia',
    ng:'Nigeria', et:'Etiopía', ke:'Kenia', tz:'Tanzania', za:'Sudáfrica',
    gh:'Ghana', sn:'Senegal', cm:'Camerún', ml:'Malí', ug:'Uganda',
    td:'Chad', ne:'Níger',
    au:'Australia', nz:'Nueva Zelanda',
    gt:'Guatemala', cu:'Cuba', do:'República Dominicana',
    ar:'Argentina', co:'Colombia', pe:'Perú', ve:'Venezuela',
    cl:'Chile', ec:'Ecuador', bo:'Bolivia', py:'Paraguay', uy:'Uruguay',
};
const _COUNTRY_NAMES_BN = {
    sa:'সৌদি আরব', eg:'মিশর', ae:'সংযুক্ত আরব আমিরাত', iq:'ইরাক', sy:'সিরিয়া',
    jo:'জর্ডান', ps:'ফিলিস্তিন', lb:'লেবানন', ye:'ইয়েমেন', om:'ওমান',
    kw:'কুয়েত', qa:'কাতার', bh:'বাহরাইন', ma:'মরক্কো', dz:'আলজেরিয়া',
    tn:'তিউনিসিয়া', ly:'লিবিয়া', sd:'সুদান', mr:'মৌরিতানিয়া', so:'সোমালিয়া',
    dj:'জিবুতি', km:'কোমোরোস',
    tr:'তুরস্ক', ir:'ইরান', pk:'পাকিস্তান', af:'আফগানিস্তান', in:'ভারত',
    bd:'বাংলাদেশ', id:'ইন্দোনেশিয়া', my:'মালয়েশিয়া', fr:'ফ্রান্স', de:'জার্মানি',
    gb:'যুক্তরাজ্য', us:'যুক্তরাষ্ট্র', ca:'কানাডা', mx:'মেক্সিকো',
    br:'ব্রাজিল', ru:'রাশিয়া', cn:'চীন', jp:'জাপান', kr:'দক্ষিণ কোরিয়া',
    ba:'বসনিয়া ও হার্জেগোভিনা', al:'আলবেনিয়া', mk:'উত্তর মেসিডোনিয়া',
    bf:'বুরকিনা ফাসো', ci:'আইভরি কোস্ট', gn:'গিনি', gm:'গাম্বিয়া',
    sl:'সিয়েরা লিওন', mv:'মালদ্বীপ', er:'ইরিত্রিয়া', ss:'দক্ষিণ সুদান',
    tg:'টোগো', bj:'বেনিন',
    ie:'আয়ারল্যান্ড', hu:'হাঙ্গেরি', hr:'ক্রোয়েশিয়া', rs:'সার্বিয়া',
    bg:'বুলগেরিয়া', si:'স্লোভেনিয়া', sk:'স্লোভাকিয়া',
    mg:'মাদাগাস্কার', mz:'মোজাম্বিক', ao:'অ্যাঙ্গোলা', cd:'কঙ্গো (ডিআর)',
    rw:'রুয়ান্ডা', zw:'জিম্বাবুয়ে', zm:'জাম্বিয়া', mu:'মরিশাস',
    lr:'লাইবেরিয়া', mw:'মালাউই',
    sr:'সুরিনাম', gy:'গায়ানা', tt:'ত্রিনিদাদ ও টোবাগো', jm:'জ্যামাইকা',
    pa:'পানামা', ht:'হাইতি', cr:'কোস্টা রিকা',
    bt:'ভুটান', fj:'ফিজি', pg:'পাপুয়া নিউ গিনি',
    nl:'নেদারল্যান্ডস', be:'বেলজিয়াম', es:'স্পেন', it:'ইতালি', pt:'পর্তুগাল',
    se:'সুইডেন', no:'নরওয়ে', dk:'ডেনমার্ক', fi:'ফিনল্যান্ড', ch:'সুইজারল্যান্ড',
    at:'অস্ট্রিয়া', gr:'গ্রিস', cz:'চেক প্রজাতন্ত্র', ro:'রোমানিয়া', pl:'পোল্যান্ড',
    ua:'ইউক্রেন', xk:'কসোভো',
    sg:'সিঙ্গাপুর', bn:'ব্রুনাই', ph:'ফিলিপাইন', th:'থাইল্যান্ড', vn:'ভিয়েতনাম',
    kh:'কম্বোডিয়া', la:'লাওস', tl:'পূর্ব তিমুর', kp:'উত্তর কোরিয়া', mn:'মঙ্গোলিয়া',
    kz:'কাজাখস্তান', uz:'উজবেকিস্তান', az:'আজারবাইজান', lk:'শ্রীলঙ্কা', np:'নেপাল',
    mm:'মিয়ানমার', kg:'কিরগিজস্তান', tj:'তাজিকিস্তান', tm:'তুর্কমেনিস্তান',
    ge:'জর্জিয়া', am:'আর্মেনিয়া',
    ng:'নাইজেরিয়া', et:'ইথিওপিয়া', ke:'কেনিয়া', tz:'তানজানিয়া', za:'দক্ষিণ আফ্রিকা',
    gh:'ঘানা', sn:'সেনেগাল', cm:'ক্যামেরুন', ml:'মালি', ug:'উগান্ডা',
    td:'চাদ', ne:'নাইজার',
    au:'অস্ট্রেলিয়া', nz:'নিউজিল্যান্ড',
    gt:'গুয়াতেমালা', cu:'কিউবা', do:'ডোমিনিকান প্রজাতন্ত্র',
    ar:'আর্জেন্টিনা', co:'কলম্বিয়া', pe:'পেরু', ve:'ভেনেজুয়েলা',
    cl:'চিলি', ec:'ইকুয়েডর', bo:'বলিভিয়া', py:'প্যারাগুয়ে', uy:'উরুগুয়ে',
};
const _COUNTRY_NAMES_MS = {
    sa:'Arab Saudi', eg:'Mesir', ae:'Emiriah Arab Bersatu', iq:'Iraq', sy:'Syria',
    jo:'Jordan', ps:'Palestin', lb:'Lubnan', ye:'Yaman', om:'Oman',
    kw:'Kuwait', qa:'Qatar', bh:'Bahrain', ma:'Maghribi', dz:'Algeria',
    tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia',
    dj:'Djibouti', km:'Komoros',
    tr:'Turki', ir:'Iran', pk:'Pakistan', af:'Afghanistan', in:'India',
    bd:'Bangladesh', id:'Indonesia', my:'Malaysia', fr:'Perancis', de:'Jerman',
    gb:'United Kingdom', us:'Amerika Syarikat', ca:'Kanada', mx:'Mexico',
    br:'Brazil', ru:'Rusia', cn:'China', jp:'Jepun', kr:'Korea Selatan',
    ba:'Bosnia dan Herzegovina', al:'Albania', mk:'Macedonia Utara',
    bf:'Burkina Faso', ci:'Pantai Gading', gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leone', mv:'Maldives', er:'Eritrea', ss:'Sudan Selatan',
    tg:'Togo', bj:'Benin',
    ie:'Ireland', hu:'Hungary', hr:'Croatia', rs:'Serbia',
    bg:'Bulgaria', si:'Slovenia', sk:'Slovakia',
    mg:'Madagaskar', mz:'Mozambique', ao:'Angola', cd:'Republik Demokratik Kongo',
    rw:'Rwanda', zw:'Zimbabwe', zm:'Zambia', mu:'Mauritius',
    lr:'Liberia', mw:'Malawi',
    sr:'Suriname', gy:'Guyana', tt:'Trinidad dan Tobago', jm:'Jamaica',
    pa:'Panama', ht:'Haiti', cr:'Costa Rica',
    bt:'Bhutan', fj:'Fiji', pg:'Papua New Guinea',
    nl:'Belanda', be:'Belgium', es:'Sepanyol', it:'Itali', pt:'Portugal',
    se:'Sweden', no:'Norway', dk:'Denmark', fi:'Finland', ch:'Switzerland',
    at:'Austria', gr:'Greece', cz:'Republik Czech', ro:'Romania', pl:'Poland',
    ua:'Ukraine', xk:'Kosovo',
    sg:'Singapura', bn:'Brunei', ph:'Filipina', th:'Thailand', vn:'Vietnam',
    kh:'Kemboja', la:'Laos', tl:'Timor-Leste', kp:'Korea Utara', mn:'Mongolia',
    kz:'Kazakhstan', uz:'Uzbekistan', az:'Azerbaijan', lk:'Sri Lanka', np:'Nepal',
    mm:'Myanmar', kg:'Kyrgyzstan', tj:'Tajikistan', tm:'Turkmenistan',
    ge:'Georgia', am:'Armenia',
    ng:'Nigeria', et:'Ethiopia', ke:'Kenya', tz:'Tanzania', za:'Afrika Selatan',
    gh:'Ghana', sn:'Senegal', cm:'Kamerun', ml:'Mali', ug:'Uganda',
    td:'Chad', ne:'Niger',
    au:'Australia', nz:'New Zealand',
    gt:'Guatemala', cu:'Cuba', do:'Republik Dominican',
    ar:'Argentina', co:'Colombia', pe:'Peru', ve:'Venezuela',
    cl:'Chile', ec:'Ecuador', bo:'Bolivia', py:'Paraguay', uy:'Uruguay',
};

// ترجمات نصوص صفحة /countries
const _COUNTRIES_PAGE_TEXTS = {
    ar: { title:'🌍 مواقيت الصلاة في دول العالم',
          intro:'اختر دولتك من القائمة أدناه لعرض جميع مدنها مع مواقيت الصلاة الدقيقة.',
          back:'← الصفحة الرئيسية',
          search:'ابحث عن دولة...',
          noResults:'⚠️ لا توجد نتائج مطابقة. جرّب بحثاً آخر.',
          metaDesc:'مواقيت الصلاة الدقيقة لكل دول العالم — اختر دولتك لعرض قائمة بجميع مدنها.',
          headerLabel:'دول العالم',
          headerSub:'مواقيت الصلاة في كل دولة',
          aboutTitle:'🌍 عن مواقيت الصلاة في دول العالم',
          aboutP1:'يوفّر موقعنا مواقيت الصلاة الخمس (الفجر، الظهر، العصر، المغرب، العشاء) لأكثر من 190 دولة حول العالم، مع تغطية شاملة لجميع الدول العربية والإسلامية ومعظم دول آسيا وأفريقيا وأوروبا والأمريكتين وأوقيانوسيا. تُحسب المواقيت بدقّة عالية بناءً على الإحداثيات الجغرافية لكلّ مدينة، وتُحدَّث يومياً تلقائياً.',
          aboutP2:'اختر دولتك من القائمة أعلاه لعرض قائمة كاملة بجميع مدنها، ثمّ اختر مدينتك للحصول على مواقيت الصلاة الدقيقة مع اتجاه القبلة والتاريخ الهجري. يمكنك أيضاً البحث مباشرة عن أيّ مدينة في العالم من الشريط العلوي.',
          faqTitle:'❓ الأسئلة الشائعة حول مواقيت الصلاة في دول العالم',
          q1:'كم عدد الدول المتوفّرة على الموقع؟',
          a1:'يوفّر الموقع مواقيت الصلاة لأكثر من 190 دولة حول العالم، تشمل جميع الدول العربية والإسلامية ومعظم دول العالم في آسيا وأفريقيا وأوروبا والأمريكتين وأوقيانوسيا.',
          q2:'هل مواقيت الصلاة دقيقة لكلّ دولة؟',
          a2:'نعم، نستخدم طرق حساب معتمدة عالمياً مثل طريقة أمّ القرى للمملكة العربية السعودية، ورابطة العالم الإسلامي لبقيّة الدول، وطريقة الهيئة المصرية العامّة لمصر، وطريقة جامعة كراتشي لباكستان، مع تحديث يوميّ تلقائيّ.',
          q3:'كيف أبحث عن دولتي؟',
          a3:'استخدم مربّع البحث في أعلى صفحة الدول للبحث باسم الدولة بأيّ لغة، أو تصفّح الدول حسب المنطقة الجغرافية: الدول العربية، آسيا، أفريقيا، أوروبا، الأمريكتين، وأوقيانوسيا.',
          q4:'ما طريقة حساب المواقيت المستخدمة؟',
          a4:'الطريقة الافتراضية تختلف حسب الدولة: أمّ القرى في السعودية، والقاهرة في مصر، وكراتشي في باكستان، ورابطة العالم الإسلامي لمعظم الدول الأخرى. يمكنك تغيير طريقة الحساب من صفحة أيّ مدينة عبر زرّ الإعدادات.',
          q5:'هل يمكنني معرفة مواقيت الصلاة لمدينة محدّدة؟',
          a5:'نعم، بعد اختيار الدولة ستظهر جميع مدنها الرئيسية مع مواقيت الصلاة لكلّ مدينة بشكل مستقلّ. كما يمكنك البحث مباشرة عن أيّ مدينة باستخدام شريط البحث في أعلى الصفحة.',
          q6:'هل الخدمة مجّانية؟ وهل تحتاج تسجيلاً؟',
          a6:'نعم، جميع الخدمات على الموقع مجّانية 100% ولا تحتاج تسجيلاً أو اشتراكاً. يمكنك استخدام الموقع بحرّية على أيّ جهاز ولأيّ عدد من المرّات.' },
    en: { title:'🌍 Prayer Times — Countries Worldwide',
          intro:'Select your country below to view all its cities with accurate prayer times.',
          back:'← Home',
          search:'Search for a country...',
          noResults:'⚠️ No matching results. Try another search.',
          metaDesc:'Accurate prayer times for countries worldwide — pick your country to see all its cities.',
          headerLabel:'World Countries',
          headerSub:'Prayer times in every country',
          aboutTitle:'🌍 About Prayer Times in World Countries',
          aboutP1:'Our site provides the five daily prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for more than 190 countries worldwide, with comprehensive coverage of all Arab and Islamic countries and most countries across Asia, Africa, Europe, the Americas, and Oceania. Times are calculated with high precision based on the geographic coordinates of each city and updated automatically every day.',
          aboutP2:'Select your country from the list above to view a complete list of all its cities, then choose your city to get accurate prayer times along with Qibla direction and the Hijri date. You can also search directly for any city in the world from the top search bar.',
          faqTitle:'❓ Frequently Asked Questions About Prayer Times Worldwide',
          q1:'How many countries are available on the site?',
          a1:'The site provides prayer times for more than 190 countries worldwide, covering all Arab and Islamic countries and most countries across Asia, Africa, Europe, the Americas, and Oceania.',
          q2:'Are the prayer times accurate for every country?',
          a2:'Yes, we use internationally recognized calculation methods such as Umm al-Qura for Saudi Arabia, the Muslim World League for most other countries, the Egyptian General Authority for Egypt, and the University of Karachi for Pakistan, with automatic daily updates.',
          q3:'How do I find my country?',
          a3:'Use the search box at the top of the countries page to search by country name in any language, or browse by geographic region: Arab Countries, Asia, Africa, Europe, the Americas, and Oceania.',
          q4:'Which calculation method is used?',
          a4:'The default method depends on the country: Umm al-Qura in Saudi Arabia, Egyptian in Egypt, Karachi in Pakistan, and Muslim World League for most other countries. You can change the calculation method from any city page via the Settings button.',
          q5:'Can I view prayer times for a specific city?',
          a5:'Yes, after selecting a country, all its major cities will be displayed with individual prayer times. You can also search directly for any city using the search bar at the top of the page.',
          q6:'Is the service free? Do I need to register?',
          a6:'Yes, all services on the site are 100% free and require no registration or subscription. You can use the site freely on any device, as many times as you like.' },
    fr: { title:'🌍 Heures de prière — Pays du monde',
          intro:'Sélectionnez votre pays ci-dessous pour afficher toutes ses villes avec les heures de prière précises.',
          back:'← Accueil',
          search:'Rechercher un pays...',
          noResults:'⚠️ Aucun résultat. Essayez une autre recherche.',
          metaDesc:"Heures de prière précises pour les pays du monde — sélectionnez votre pays pour voir toutes ses villes.",
          headerLabel:'Pays du monde',
          headerSub:'Heures de prière dans chaque pays',
          aboutTitle:'🌍 À propos des heures de prière dans le monde',
          aboutP1:"Notre site fournit les cinq heures de prière quotidiennes (Fajr, Dhuhr, Asr, Maghrib, Isha) pour plus de 190 pays dans le monde, avec une couverture complète de tous les pays arabes et islamiques ainsi que la plupart des pays d'Asie, d'Afrique, d'Europe, des Amériques et d'Océanie. Les heures sont calculées avec une grande précision à partir des coordonnées géographiques de chaque ville et sont mises à jour automatiquement chaque jour.",
          aboutP2:"Sélectionnez votre pays dans la liste ci-dessus pour afficher la liste complète de toutes ses villes, puis choisissez votre ville pour obtenir les heures de prière précises ainsi que la direction de la Qibla et la date Hijri. Vous pouvez également rechercher directement n'importe quelle ville dans le monde à partir de la barre de recherche en haut.",
          faqTitle:'❓ Questions fréquentes sur les heures de prière dans le monde',
          q1:'Combien de pays sont disponibles sur le site ?',
          a1:"Le site fournit les heures de prière pour plus de 190 pays dans le monde, couvrant tous les pays arabes et islamiques ainsi que la plupart des pays d'Asie, d'Afrique, d'Europe, des Amériques et d'Océanie.",
          q2:'Les heures de prière sont-elles précises pour chaque pays ?',
          a2:"Oui, nous utilisons des méthodes de calcul reconnues internationalement telles que Umm al-Qura pour l'Arabie saoudite, la Ligue musulmane mondiale pour la plupart des autres pays, l'Autorité générale égyptienne pour l'Égypte et l'Université de Karachi pour le Pakistan, avec des mises à jour quotidiennes automatiques.",
          q3:'Comment trouver mon pays ?',
          a3:"Utilisez la boîte de recherche en haut de la page des pays pour rechercher par nom de pays dans n'importe quelle langue, ou parcourez par région géographique : pays arabes, Asie, Afrique, Europe, Amériques et Océanie.",
          q4:'Quelle méthode de calcul est utilisée ?',
          a4:"La méthode par défaut dépend du pays : Umm al-Qura en Arabie saoudite, égyptienne en Égypte, Karachi au Pakistan et Ligue musulmane mondiale pour la plupart des autres pays. Vous pouvez modifier la méthode de calcul depuis la page de n'importe quelle ville via le bouton Paramètres.",
          q5:'Puis-je voir les heures de prière pour une ville spécifique ?',
          a5:"Oui, après avoir sélectionné un pays, toutes ses principales villes s'afficheront avec des heures de prière individuelles. Vous pouvez également rechercher directement n'importe quelle ville à l'aide de la barre de recherche en haut de la page.",
          q6:"Le service est-il gratuit ? Dois-je m'inscrire ?",
          a6:"Oui, tous les services du site sont 100% gratuits et ne nécessitent aucune inscription ou abonnement. Vous pouvez utiliser le site librement sur n'importe quel appareil, autant de fois que vous le souhaitez." },
    tr: { title:'🌍 Namaz Vakitleri — Dünya Ülkeleri',
          intro:'Tüm şehirlerini doğru namaz vakitleriyle görmek için aşağıdan ülkenizi seçin.',
          back:'← Ana Sayfa',
          search:'Ülke ara...',
          noResults:'⚠️ Eşleşen sonuç yok. Başka bir arama deneyin.',
          metaDesc:'Dünya ülkeleri için doğru namaz vakitleri — tüm şehirlerini görmek için ülkenizi seçin.',
          headerLabel:'Dünya Ülkeleri',
          headerSub:'Her ülkede namaz vakitleri',
          aboutTitle:'🌍 Dünya Ülkelerinde Namaz Vakitleri Hakkında',
          aboutP1:'Sitemiz, dünya genelinde 190\'dan fazla ülke için beş vakit namaz zamanlarını (İmsak, Öğle, İkindi, Akşam, Yatsı) sağlar. Tüm Arap ve İslam ülkeleri ile Asya, Afrika, Avrupa, Amerika ve Okyanusya\'daki çoğu ülke kapsamlı şekilde kapsanmaktadır. Vakitler, her şehrin coğrafi koordinatlarına göre yüksek doğrulukla hesaplanır ve her gün otomatik olarak güncellenir.',
          aboutP2:'Yukarıdaki listeden ülkenizi seçerek tüm şehirlerinin eksiksiz listesini görüntüleyin, ardından doğru namaz vakitleri ile Kıble yönü ve Hicri tarihi almak için şehrinizi seçin. Üstteki arama çubuğundan dünyadaki herhangi bir şehri doğrudan arayabilirsiniz.',
          faqTitle:'❓ Dünyada Namaz Vakitleri Hakkında Sıkça Sorulan Sorular',
          q1:'Sitede kaç ülke mevcut?',
          a1:'Site, tüm Arap ve İslam ülkeleri ile Asya, Afrika, Avrupa, Amerika ve Okyanusya\'daki çoğu ülkeyi kapsayan 190\'dan fazla ülke için namaz vakitleri sağlar.',
          q2:'Namaz vakitleri her ülke için doğru mu?',
          a2:'Evet, Suudi Arabistan için Ümmü\'l-Kura, diğer ülkelerin çoğu için İslam Dünyası Birliği, Mısır için Mısır Genel Kurumu ve Pakistan için Karachi Üniversitesi gibi uluslararası kabul görmüş hesaplama yöntemlerini kullanıyor ve otomatik günlük güncelleme yapıyoruz.',
          q3:'Ülkemi nasıl bulabilirim?',
          a3:'Ülke sayfasının üstündeki arama kutusunu kullanarak herhangi bir dilde ülke adıyla arama yapın veya coğrafi bölgeye göre göz atın: Arap Ülkeleri, Asya, Afrika, Avrupa, Amerika ve Okyanusya.',
          q4:'Hangi hesaplama yöntemi kullanılıyor?',
          a4:'Varsayılan yöntem ülkeye göre değişir: Suudi Arabistan\'da Ümmü\'l-Kura, Mısır\'da Mısır, Pakistan\'da Karachi ve diğer ülkelerin çoğunda İslam Dünyası Birliği. Herhangi bir şehir sayfasından Ayarlar düğmesi aracılığıyla hesaplama yöntemini değiştirebilirsiniz.',
          q5:'Belirli bir şehir için namaz vakitlerini görebilir miyim?',
          a5:'Evet, bir ülke seçtikten sonra tüm büyük şehirleri ayrı ayrı namaz vakitleriyle görüntülenecektir. Sayfanın üstündeki arama çubuğunu kullanarak herhangi bir şehri doğrudan da arayabilirsiniz.',
          q6:'Hizmet ücretsiz mi? Kayıt olmam gerekiyor mu?',
          a6:'Evet, sitedeki tüm hizmetler %100 ücretsizdir ve kayıt veya abonelik gerektirmez. Siteyi herhangi bir cihazda istediğiniz kadar özgürce kullanabilirsiniz.' },
    ur: { title:'🌍 اوقاتِ نماز — دنیا کے ممالک',
          intro:'اپنے ملک کا انتخاب کریں تاکہ اس کے تمام شہروں کے درست اوقاتِ نماز دیکھ سکیں۔',
          back:'← ہوم',
          search:'ملک تلاش کریں...',
          noResults:'⚠️ کوئی نتیجہ نہیں ملا۔ کوئی اور تلاش آزمائیں۔',
          metaDesc:'دنیا کے تمام ممالک کے درست اوقاتِ نماز — اپنے ملک کا انتخاب کریں۔',
          headerLabel:'دنیا کے ممالک',
          headerSub:'ہر ملک میں اوقاتِ نماز',
          aboutTitle:'🌍 دنیا کے ممالک میں اوقاتِ نماز کے بارے میں',
          aboutP1:'ہماری سائٹ دنیا کے 190 سے زائد ممالک کے لیے پانچ روزانہ نماز کے اوقات (فجر، ظہر، عصر، مغرب، عشاء) فراہم کرتی ہے، جس میں تمام عرب اور اسلامی ممالک کے ساتھ ساتھ ایشیا، افریقہ، یورپ، امریکہ اور اوشیانا کے زیادہ تر ممالک کی جامع کوریج ہے۔ اوقات ہر شہر کے جغرافیائی نقاط کی بنیاد پر اعلیٰ درستگی کے ساتھ حساب کیے جاتے ہیں اور ہر روز خودکار طور پر اپ ڈیٹ ہوتے ہیں۔',
          aboutP2:'اوپر دی گئی فہرست سے اپنا ملک منتخب کریں تاکہ اس کے تمام شہروں کی مکمل فہرست دیکھ سکیں، پھر اپنا شہر منتخب کریں تاکہ درست اوقاتِ نماز کے ساتھ قبلے کی سمت اور ہجری تاریخ حاصل کر سکیں۔ آپ اوپر کے سرچ بار سے دنیا کے کسی بھی شہر کو براہِ راست تلاش بھی کر سکتے ہیں۔',
          faqTitle:'❓ دنیا میں اوقاتِ نماز کے بارے میں اکثر پوچھے جانے والے سوالات',
          q1:'سائٹ پر کتنے ممالک دستیاب ہیں؟',
          a1:'سائٹ پر 190 سے زائد ممالک کے اوقاتِ نماز موجود ہیں، جن میں تمام عرب اور اسلامی ممالک اور ایشیا، افریقہ، یورپ، امریکہ اور اوشیانا کے زیادہ تر ممالک شامل ہیں۔',
          q2:'کیا ہر ملک کے لیے اوقاتِ نماز درست ہیں؟',
          a2:'جی ہاں، ہم بین الاقوامی طور پر تسلیم شدہ حساب کے طریقے استعمال کرتے ہیں جیسے سعودی عرب کے لیے ام القریٰ، زیادہ تر دیگر ممالک کے لیے رابطہ عالمِ اسلامی، مصر کے لیے مصری عام اتھارٹی، اور پاکستان کے لیے کراچی یونیورسٹی، خودکار روزانہ اپ ڈیٹ کے ساتھ۔',
          q3:'میں اپنا ملک کیسے تلاش کروں؟',
          a3:'ممالک کے صفحے کے اوپر سرچ باکس استعمال کر کے کسی بھی زبان میں ملک کے نام سے تلاش کریں، یا جغرافیائی خطے کے لحاظ سے براؤز کریں: عرب ممالک، ایشیا، افریقہ، یورپ، امریکہ اور اوشیانا۔',
          q4:'کون سا حساب کرنے کا طریقہ استعمال ہوتا ہے؟',
          a4:'پہلے سے طے شدہ طریقہ ملک کے لحاظ سے مختلف ہوتا ہے: سعودی عرب میں ام القریٰ، مصر میں مصری، پاکستان میں کراچی، اور زیادہ تر دیگر ممالک کے لیے رابطہ عالمِ اسلامی۔ آپ کسی بھی شہر کے صفحے سے سیٹنگز بٹن کے ذریعے حساب کا طریقہ تبدیل کر سکتے ہیں۔',
          q5:'کیا میں کسی مخصوص شہر کے اوقاتِ نماز دیکھ سکتا ہوں؟',
          a5:'جی ہاں، ملک منتخب کرنے کے بعد اس کے تمام بڑے شہر انفرادی اوقاتِ نماز کے ساتھ دکھائے جائیں گے۔ آپ صفحے کے اوپر سرچ بار کا استعمال کرتے ہوئے کسی بھی شہر کو براہِ راست تلاش بھی کر سکتے ہیں۔',
          q6:'کیا یہ خدمت مفت ہے؟ کیا مجھے رجسٹریشن کرنی ہوگی؟',
          a6:'جی ہاں، سائٹ پر تمام خدمات 100% مفت ہیں اور کسی رجسٹریشن یا سبسکرپشن کی ضرورت نہیں ہے۔ آپ کسی بھی ڈیوائس پر جتنی بار چاہیں سائٹ کو آزادانہ استعمال کر سکتے ہیں۔' },
    de: { title:'🌍 Gebetszeiten — Länder weltweit',
          intro:'Wählen Sie unten Ihr Land aus, um alle Städte mit genauen Gebetszeiten anzuzeigen.',
          back:'← Startseite',
          search:'Land suchen...',
          noResults:'⚠️ Keine passenden Ergebnisse. Versuchen Sie eine andere Suche.',
          metaDesc:'Genaue Gebetszeiten für alle Länder weltweit — wählen Sie Ihr Land, um alle Städte zu sehen.',
          headerLabel:'Länder weltweit',
          headerSub:'Gebetszeiten in jedem Land',
          aboutTitle:'🌍 Über Gebetszeiten in Ländern weltweit',
          aboutP1:'Unsere Website bietet die fünf täglichen Gebetszeiten (Fadschr, Zuhr, Asr, Maghrib, Ischa) für mehr als 190 Länder weltweit, mit umfassender Abdeckung aller arabischen und islamischen Länder sowie der meisten Länder in Asien, Afrika, Europa, Nord- und Südamerika und Ozeanien. Die Zeiten werden mit hoher Präzision anhand der geografischen Koordinaten jeder Stadt berechnet und täglich automatisch aktualisiert.',
          aboutP2:'Wählen Sie Ihr Land aus der obigen Liste, um eine vollständige Liste aller Städte anzuzeigen, und wählen Sie dann Ihre Stadt, um genaue Gebetszeiten zusammen mit der Qibla-Richtung und dem Hidschri-Datum zu erhalten. Sie können auch direkt nach jeder Stadt der Welt über die Suchleiste oben suchen.',
          faqTitle:'❓ Häufig gestellte Fragen zu Gebetszeiten weltweit',
          q1:'Wie viele Länder sind auf der Website verfügbar?',
          a1:'Die Website bietet Gebetszeiten für mehr als 190 Länder weltweit und deckt alle arabischen und islamischen Länder sowie die meisten Länder in Asien, Afrika, Europa, Nord- und Südamerika und Ozeanien ab.',
          q2:'Sind die Gebetszeiten für jedes Land genau?',
          a2:'Ja, wir verwenden international anerkannte Berechnungsmethoden wie Umm al-Qura für Saudi-Arabien, die Muslimische Weltliga für die meisten anderen Länder, die Ägyptische Generalbehörde für Ägypten und die Universität Karatschi für Pakistan, mit automatischen täglichen Aktualisierungen.',
          q3:'Wie finde ich mein Land?',
          a3:'Verwenden Sie das Suchfeld oben auf der Länderseite, um nach dem Ländernamen in jeder Sprache zu suchen, oder durchsuchen Sie nach geografischer Region: arabische Länder, Asien, Afrika, Europa, Nord- und Südamerika und Ozeanien.',
          q4:'Welche Berechnungsmethode wird verwendet?',
          a4:'Die Standardmethode hängt vom Land ab: Umm al-Qura in Saudi-Arabien, Ägyptisch in Ägypten, Karatschi in Pakistan und Muslimische Weltliga für die meisten anderen Länder. Sie können die Berechnungsmethode über die Schaltfläche Einstellungen auf jeder Stadtseite ändern.',
          q5:'Kann ich Gebetszeiten für eine bestimmte Stadt anzeigen?',
          a5:'Ja, nach Auswahl eines Landes werden alle großen Städte mit individuellen Gebetszeiten angezeigt. Sie können auch direkt nach einer Stadt über die Suchleiste oben auf der Seite suchen.',
          q6:'Ist der Dienst kostenlos? Muss ich mich registrieren?',
          a6:'Ja, alle Dienste auf der Website sind 100% kostenlos und erfordern keine Registrierung oder Abonnement. Sie können die Website auf jedem Gerät so oft Sie möchten frei nutzen.' },
    id: { title:'🌍 Jadwal Sholat — Negara-Negara di Dunia',
          intro:'Pilih negara Anda di bawah untuk melihat semua kotanya dengan jadwal sholat yang akurat.',
          back:'← Beranda',
          search:'Cari negara...',
          noResults:'⚠️ Tidak ada hasil yang cocok. Coba pencarian lain.',
          metaDesc:'Jadwal sholat akurat untuk semua negara di dunia — pilih negara Anda untuk melihat semua kotanya.',
          headerLabel:'Negara-Negara di Dunia',
          headerSub:'Jadwal sholat di setiap negara',
          aboutTitle:'🌍 Tentang Jadwal Sholat di Negara-Negara Dunia',
          aboutP1:'Situs kami menyediakan lima waktu sholat harian (Subuh, Zuhur, Asar, Magrib, Isya) untuk lebih dari 190 negara di seluruh dunia, dengan cakupan komprehensif semua negara Arab dan Islam serta sebagian besar negara di Asia, Afrika, Eropa, Benua Amerika, dan Oseania. Waktu dihitung dengan presisi tinggi berdasarkan koordinat geografis setiap kota dan diperbarui otomatis setiap hari.',
          aboutP2:'Pilih negara Anda dari daftar di atas untuk melihat daftar lengkap semua kotanya, lalu pilih kota Anda untuk mendapatkan jadwal sholat yang akurat beserta arah Kiblat dan tanggal Hijriyah. Anda juga dapat mencari langsung kota mana pun di dunia dari bilah pencarian di atas.',
          faqTitle:'❓ Pertanyaan yang Sering Diajukan Tentang Jadwal Sholat di Dunia',
          q1:'Berapa banyak negara yang tersedia di situs ini?',
          a1:'Situs ini menyediakan jadwal sholat untuk lebih dari 190 negara di seluruh dunia, mencakup semua negara Arab dan Islam serta sebagian besar negara di Asia, Afrika, Eropa, Benua Amerika, dan Oseania.',
          q2:'Apakah jadwal sholat akurat untuk setiap negara?',
          a2:'Ya, kami menggunakan metode perhitungan yang diakui secara internasional seperti Umm al-Qura untuk Arab Saudi, Liga Dunia Muslim untuk sebagian besar negara lain, Otoritas Umum Mesir untuk Mesir, dan Universitas Karachi untuk Pakistan, dengan pembaruan harian otomatis.',
          q3:'Bagaimana cara menemukan negara saya?',
          a3:'Gunakan kotak pencarian di bagian atas halaman negara untuk mencari berdasarkan nama negara dalam bahasa apa pun, atau jelajahi berdasarkan wilayah geografis: Negara Arab, Asia, Afrika, Eropa, Benua Amerika, dan Oseania.',
          q4:'Metode perhitungan apa yang digunakan?',
          a4:'Metode default bergantung pada negara: Umm al-Qura di Arab Saudi, Mesir di Mesir, Karachi di Pakistan, dan Liga Dunia Muslim untuk sebagian besar negara lain. Anda dapat mengubah metode perhitungan dari halaman kota mana pun melalui tombol Pengaturan.',
          q5:'Bisakah saya melihat jadwal sholat untuk kota tertentu?',
          a5:'Ya, setelah memilih negara, semua kota besarnya akan ditampilkan dengan jadwal sholat individual. Anda juga dapat mencari langsung kota mana pun menggunakan bilah pencarian di bagian atas halaman.',
          q6:'Apakah layanan ini gratis? Apakah saya perlu mendaftar?',
          a6:'Ya, semua layanan di situs 100% gratis dan tidak memerlukan pendaftaran atau langganan. Anda dapat menggunakan situs dengan bebas di perangkat apa pun, sebanyak yang Anda inginkan.' },
    es: { title:'🌍 Horarios de Oración — Países del Mundo',
          intro:'Selecciona tu país abajo para ver todas sus ciudades con horarios de oración precisos.',
          back:'← Inicio',
          search:'Buscar un país...',
          noResults:'⚠️ No hay resultados coincidentes. Prueba otra búsqueda.',
          metaDesc:'Horarios de oración precisos para todos los países del mundo — elige tu país para ver todas sus ciudades.',
          headerLabel:'Países del mundo',
          headerSub:'Horarios de oración en cada país',
          aboutTitle:'🌍 Sobre los Horarios de Oración en Países del Mundo',
          aboutP1:'Nuestro sitio proporciona los cinco horarios diarios de oración (Fayr, Dhuhr, Asr, Magrib, Isha) para más de 190 países en todo el mundo, con cobertura completa de todos los países árabes e islámicos y la mayoría de los países de Asia, África, Europa, las Américas y Oceanía. Los horarios se calculan con alta precisión basándose en las coordenadas geográficas de cada ciudad y se actualizan automáticamente cada día.',
          aboutP2:'Selecciona tu país en la lista de arriba para ver una lista completa de todas sus ciudades, luego elige tu ciudad para obtener horarios de oración precisos junto con la dirección de la Qibla y la fecha Hijri. También puedes buscar directamente cualquier ciudad del mundo desde la barra de búsqueda superior.',
          faqTitle:'❓ Preguntas Frecuentes sobre los Horarios de Oración en el Mundo',
          q1:'¿Cuántos países están disponibles en el sitio?',
          a1:'El sitio proporciona horarios de oración para más de 190 países en todo el mundo, cubriendo todos los países árabes e islámicos y la mayoría de los países de Asia, África, Europa, las Américas y Oceanía.',
          q2:'¿Los horarios de oración son precisos para cada país?',
          a2:'Sí, usamos métodos de cálculo reconocidos internacionalmente como Umm al-Qura para Arabia Saudita, la Liga Musulmana Mundial para la mayoría de otros países, la Autoridad General Egipcia para Egipto y la Universidad de Karachi para Pakistán, con actualizaciones diarias automáticas.',
          q3:'¿Cómo encuentro mi país?',
          a3:'Usa el cuadro de búsqueda en la parte superior de la página de países para buscar por nombre de país en cualquier idioma, o navega por región geográfica: Países Árabes, Asia, África, Europa, las Américas y Oceanía.',
          q4:'¿Qué método de cálculo se utiliza?',
          a4:'El método predeterminado depende del país: Umm al-Qura en Arabia Saudita, Egipcio en Egipto, Karachi en Pakistán y Liga Musulmana Mundial para la mayoría de otros países. Puedes cambiar el método de cálculo desde cualquier página de ciudad mediante el botón Ajustes.',
          q5:'¿Puedo ver los horarios de oración para una ciudad específica?',
          a5:'Sí, después de seleccionar un país, se mostrarán todas sus principales ciudades con horarios de oración individuales. También puedes buscar directamente cualquier ciudad usando la barra de búsqueda en la parte superior de la página.',
          q6:'¿El servicio es gratuito? ¿Necesito registrarme?',
          a6:'Sí, todos los servicios del sitio son 100% gratuitos y no requieren registro ni suscripción. Puedes usar el sitio libremente en cualquier dispositivo, tantas veces como quieras.' },
    bn: { title:'🌍 নামাজের সময় — বিশ্বের দেশসমূহ',
          intro:'নির্ভুল নামাজের সময়সূচীসহ সব শহর দেখতে নিচে আপনার দেশ নির্বাচন করুন।',
          back:'← হোম',
          search:'একটি দেশ খুঁজুন...',
          noResults:'⚠️ কোন মিলে যাওয়া ফলাফল নেই। অন্য অনুসন্ধান চেষ্টা করুন।',
          metaDesc:'বিশ্বের সব দেশের জন্য নির্ভুল নামাজের সময় — সব শহর দেখতে আপনার দেশ নির্বাচন করুন।',
          headerLabel:'বিশ্বের দেশসমূহ',
          headerSub:'প্রতিটি দেশে নামাজের সময়',
          aboutTitle:'🌍 বিশ্বের দেশসমূহে নামাজের সময় সম্পর্কে',
          aboutP1:'আমাদের সাইট বিশ্বব্যাপী ১৯০টিরও বেশি দেশের জন্য পাঁচ ওয়াক্ত নামাজের সময় (ফজর, জোহর, আসর, মাগরিব, এশা) প্রদান করে। সমস্ত আরব ও ইসলামিক দেশ এবং এশিয়া, আফ্রিকা, ইউরোপ, আমেরিকা ও ওশেনিয়ার বেশিরভাগ দেশ ব্যাপকভাবে অন্তর্ভুক্ত। প্রতিটি শহরের ভৌগোলিক স্থানাঙ্কের ভিত্তিতে উচ্চ নির্ভুলতায় সময় গণনা করা হয় এবং প্রতিদিন স্বয়ংক্রিয়ভাবে আপডেট হয়।',
          aboutP2:'উপরের তালিকা থেকে আপনার দেশ নির্বাচন করে সব শহরের সম্পূর্ণ তালিকা দেখুন, তারপর কিবলার দিক ও হিজরি তারিখসহ নির্ভুল নামাজের সময় পেতে আপনার শহর বেছে নিন। আপনি শীর্ষ অনুসন্ধান বার থেকে বিশ্বের যেকোনো শহর সরাসরিও খুঁজতে পারেন।',
          faqTitle:'❓ বিশ্বে নামাজের সময় সম্পর্কে প্রায়শই জিজ্ঞাসিত প্রশ্ন',
          q1:'সাইটে কয়টি দেশ উপলব্ধ?',
          a1:'সাইট বিশ্বের ১৯০টিরও বেশি দেশের জন্য নামাজের সময় প্রদান করে, যা সমস্ত আরব ও ইসলামিক দেশ এবং এশিয়া, আফ্রিকা, ইউরোপ, আমেরিকা ও ওশেনিয়ার বেশিরভাগ দেশকে আচ্ছাদিত করে।',
          q2:'প্রতিটি দেশের জন্য কি নামাজের সময় নির্ভুল?',
          a2:'হ্যাঁ, আমরা আন্তর্জাতিকভাবে স্বীকৃত গণনা পদ্ধতি ব্যবহার করি যেমন সৌদি আরবের জন্য উম্মুল কুরা, বেশিরভাগ অন্যান্য দেশের জন্য মুসলিম বিশ্ব লীগ, মিশরের জন্য মিশরীয় সাধারণ কর্তৃপক্ষ এবং পাকিস্তানের জন্য করাচি বিশ্ববিদ্যালয়, স্বয়ংক্রিয় দৈনিক আপডেটসহ।',
          q3:'আমি কীভাবে আমার দেশ খুঁজব?',
          a3:'যেকোনো ভাষায় দেশের নাম দিয়ে অনুসন্ধান করতে দেশ পৃষ্ঠার শীর্ষে অনুসন্ধান বাক্স ব্যবহার করুন, বা ভৌগোলিক অঞ্চল অনুসারে ব্রাউজ করুন: আরব দেশ, এশিয়া, আফ্রিকা, ইউরোপ, আমেরিকা এবং ওশেনিয়া।',
          q4:'কোন গণনা পদ্ধতি ব্যবহার করা হয়?',
          a4:'ডিফল্ট পদ্ধতি দেশের উপর নির্ভর করে: সৌদি আরবে উম্মুল কুরা, মিশরে মিশরীয়, পাকিস্তানে করাচি এবং বেশিরভাগ অন্যান্য দেশের জন্য মুসলিম বিশ্ব লীগ। আপনি যেকোনো শহর পৃষ্ঠা থেকে সেটিংস বোতামের মাধ্যমে গণনা পদ্ধতি পরিবর্তন করতে পারেন।',
          q5:'আমি কি একটি নির্দিষ্ট শহরের নামাজের সময় দেখতে পারি?',
          a5:'হ্যাঁ, একটি দেশ নির্বাচন করার পরে, এর সমস্ত প্রধান শহর পৃথক নামাজের সময়সহ প্রদর্শিত হবে। আপনি পৃষ্ঠার শীর্ষে অনুসন্ধান বার ব্যবহার করে যেকোনো শহর সরাসরিও খুঁজতে পারেন।',
          q6:'সেবা কি বিনামূল্যে? আমার কি নিবন্ধন প্রয়োজন?',
          a6:'হ্যাঁ, সাইটের সমস্ত সেবা ১০০% বিনামূল্যে এবং কোন নিবন্ধন বা সাবস্ক্রিপশন প্রয়োজন হয় না। আপনি যেকোনো ডিভাইসে আপনার যতবার ইচ্ছা সাইটটি স্বাধীনভাবে ব্যবহার করতে পারেন।' },
    ms: { title:'🌍 Waktu Solat — Negara-Negara di Dunia',
          intro:'Pilih negara anda di bawah untuk melihat semua bandarnya dengan waktu solat yang tepat.',
          back:'← Utama',
          search:'Cari negara...',
          noResults:'⚠️ Tiada hasil yang sepadan. Cuba carian lain.',
          metaDesc:'Waktu solat yang tepat untuk semua negara di dunia — pilih negara anda untuk melihat semua bandarnya.',
          headerLabel:'Negara-Negara di Dunia',
          headerSub:'Waktu solat di setiap negara',
          aboutTitle:'🌍 Tentang Waktu Solat di Negara-Negara Dunia',
          aboutP1:'Laman kami menyediakan lima waktu solat harian (Subuh, Zohor, Asar, Maghrib, Isyak) untuk lebih daripada 190 negara di seluruh dunia, dengan liputan komprehensif semua negara Arab dan Islam serta kebanyakan negara di Asia, Afrika, Eropah, Amerika dan Oceania. Waktu dikira dengan ketepatan tinggi berdasarkan koordinat geografi setiap bandar dan dikemas kini secara automatik setiap hari.',
          aboutP2:'Pilih negara anda daripada senarai di atas untuk melihat senarai lengkap semua bandarnya, kemudian pilih bandar anda untuk mendapatkan waktu solat yang tepat bersama arah Kiblat dan tarikh Hijrah. Anda juga boleh mencari terus mana-mana bandar di dunia dari bar carian di atas.',
          faqTitle:'❓ Soalan Lazim tentang Waktu Solat di Dunia',
          q1:'Berapa banyak negara tersedia di laman ini?',
          a1:'Laman ini menyediakan waktu solat untuk lebih daripada 190 negara di seluruh dunia, meliputi semua negara Arab dan Islam serta kebanyakan negara di Asia, Afrika, Eropah, Amerika dan Oceania.',
          q2:'Adakah waktu solat tepat untuk setiap negara?',
          a2:'Ya, kami menggunakan kaedah pengiraan yang diiktiraf antarabangsa seperti Umm al-Qura untuk Arab Saudi, Liga Dunia Muslim untuk kebanyakan negara lain, Pihak Berkuasa Am Mesir untuk Mesir, dan Universiti Karachi untuk Pakistan, dengan kemas kini harian automatik.',
          q3:'Bagaimana saya mencari negara saya?',
          a3:'Gunakan kotak carian di bahagian atas halaman negara untuk mencari mengikut nama negara dalam mana-mana bahasa, atau lungsur mengikut kawasan geografi: Negara Arab, Asia, Afrika, Eropah, Amerika dan Oceania.',
          q4:'Apakah kaedah pengiraan yang digunakan?',
          a4:'Kaedah lalai bergantung pada negara: Umm al-Qura di Arab Saudi, Mesir di Mesir, Karachi di Pakistan dan Liga Dunia Muslim untuk kebanyakan negara lain. Anda boleh menukar kaedah pengiraan dari mana-mana halaman bandar melalui butang Tetapan.',
          q5:'Bolehkah saya melihat waktu solat untuk bandar tertentu?',
          a5:'Ya, selepas memilih negara, semua bandar besarnya akan dipaparkan dengan waktu solat individu. Anda juga boleh mencari terus mana-mana bandar menggunakan bar carian di bahagian atas halaman.',
          q6:'Adakah perkhidmatan ini percuma? Perlukah saya mendaftar?',
          a6:'Ya, semua perkhidmatan di laman ini adalah 100% percuma dan tidak memerlukan pendaftaran atau langganan. Anda boleh menggunakan laman ini secara bebas pada mana-mana peranti, seberapa banyak yang anda mahu.' },
};

// اسم دولة حسب اللغة (fallback إلى English إن لم توجد ترجمة)
function _countryNameForLang(cc, lang) {
    if (lang === 'ar') return COUNTRY_NAMES_AR[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'fr') return _COUNTRY_NAMES_FR[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'tr') return _COUNTRY_NAMES_TR[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'ur') return _COUNTRY_NAMES_UR[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'de') return _COUNTRY_NAMES_DE[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'id') return _COUNTRY_NAMES_ID[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'es') return _COUNTRY_NAMES_ES[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'bn') return _COUNTRY_NAMES_BN[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'ms') return _COUNTRY_NAMES_MS[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    return COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
}

function _buildCountriesGrid(lang) {
    const urlPrefix = (lang === 'ar') ? '' : '/' + lang;
    let out = '';
    for (const region of Object.keys(_COUNTRIES_REGIONS)) {
        const codes = _COUNTRIES_REGIONS[region];
        const regionTitle = (_REGION_TITLES[region] && _REGION_TITLES[region][lang]) || _REGION_TITLES[region].en;
        out += `\n<section class="region-block" data-region="${region}">`;
        out += `\n    <h2>${_escHtml(regionTitle)}</h2>`;
        out += `\n    <nav class="arab-countries-grid" aria-label="${_escHtml(regionTitle)}">`;
        for (const cc of codes) {
            const name = _countryNameForLang(cc, lang);
            const slug = makeCountrySlugSrv(cc);
            const enName = COUNTRY_NAMES_EN[cc] || '';
            const href = `${urlPrefix}/prayer-times-in-${slug}`;
            out += `\n        <a href="${href}" class="country-tile" data-cc="${cc}" data-en="${_escHtml(enName.toLowerCase())}"><img src="https://flagcdn.com/w40/${cc}.png" alt="${_escHtml(name)}" width="40" height="30" loading="lazy"><span>${_escHtml(name)}</span></a>`;
        }
        out += '\n    </nav>\n</section>';
    }
    return out;
}

// يُقدَّم countries.html مع حقن الـ grid + العناوين حسب اللغة
function serveCountriesPage(urlPath, res, acceptEnc) {
    readCachedFile(path.join(ROOT, 'countries.html'), (err, htmlBuf) => {
        if (err) { res.writeHead(404); res.end('Not Found'); return; }
        // استنتاج اللغة من الـ URL
        const langMatch = urlPath.match(/^\/(en|fr|tr|ur|de|id|es|bn|ms)\/prayer-times-worldwide$/);
        const lang = langMatch ? langMatch[1] : 'ar';
        const t = _COUNTRIES_PAGE_TEXTS[lang] || _COUNTRIES_PAGE_TEXTS.ar;
        const dir = (lang === 'ar' || lang === 'ur') ? 'rtl' : 'ltr';

        let html = htmlBuf.toString('utf8');

        // <html lang + dir>
        html = html.replace(/<html lang="[^"]*" dir="[^"]*">/, `<html lang="${lang}" dir="${dir}">`);

        // <title>
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${_escHtml(t.title)}</title>`);

        // meta description
        html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${_escHtml(t.metaDesc)}">`);

        // H1
        html = html.replace(/<h1 id="countries-page-title">[^<]*<\/h1>/, `<h1 id="countries-page-title">${_escHtml(t.title)}</h1>`);

        // Top-header label + sub
        html = html.replace(/<div class="city-name" id="countries-header-title"[^>]*>[^<]*<\/div>/,
            `<div class="city-name" id="countries-header-title" data-i18n="countries.header_label">${_escHtml(t.headerLabel)}</div>`);
        html = html.replace(/<div class="country" data-i18n="countries\.header_sub">[^<]*<\/div>/,
            `<div class="country" data-i18n="countries.header_sub">${_escHtml(t.headerSub)}</div>`);

        // intro paragraph
        html = html.replace(/<p class="countries-intro" id="countries-intro"[^>]*>[\s\S]*?<\/p>/,
            `<p class="countries-intro" id="countries-intro" data-i18n="countries.intro">${_escHtml(t.intro)}</p>`);

        // back link (href يحترم الـ locale)
        const backHref = (lang === 'ar') ? '/' : `/${lang}/`;
        html = html.replace(/<a href="\/" class="countries-back-link"[^>]*>[^<]*<\/a>/,
            `<a href="${backHref}" class="countries-back-link" id="countries-back-link" data-i18n="countries.back">${_escHtml(t.back)}</a>`);

        // search input (placeholder + aria-label)
        html = html.replace(/placeholder="[^"]*"\s*data-i18n-placeholder="countries\.search_placeholder"/,
            `placeholder="${_escHtml(t.search)}" data-i18n-placeholder="countries.search_placeholder"`);
        html = html.replace(/aria-label="ابحث عن دولة"/, `aria-label="${_escHtml(t.search)}"`);

        // empty state
        html = html.replace(/<div id="countries-empty" class="countries-empty-state"[^>]*>[\s\S]*?<\/div>/,
            `<div id="countries-empty" class="countries-empty-state" data-i18n="countries.no_results">${_escHtml(t.noResults)}</div>`);

        // About section (SEO)
        html = html.replace(/<h2 id="countries-about-title">[\s\S]*?<\/h2>/,
            `<h2 id="countries-about-title">${_escHtml(t.aboutTitle)}</h2>`);
        html = html.replace(/<p id="countries-about-p1">[\s\S]*?<\/p>/,
            `<p id="countries-about-p1">${_escHtml(t.aboutP1)}</p>`);
        html = html.replace(/<p id="countries-about-p2">[\s\S]*?<\/p>/,
            `<p id="countries-about-p2">${_escHtml(t.aboutP2)}</p>`);

        // FAQ section (SEO)
        html = html.replace(/<h2 id="countries-faq-title">[\s\S]*?<\/h2>/,
            `<h2 id="countries-faq-title">${_escHtml(t.faqTitle)}</h2>`);
        for (let i = 1; i <= 6; i++) {
            const q = t['q' + i] || '';
            const a = t['a' + i] || '';
            html = html.replace(
                new RegExp(`<div class="faq-question" id="cfaq-q${i}">[\\s\\S]*?<\\/div>`),
                `<div class="faq-question" id="cfaq-q${i}">${_escHtml(q)}</div>`
            );
            html = html.replace(
                new RegExp(`<p id="cfaq-a${i}">[\\s\\S]*?<\\/p>`),
                `<p id="cfaq-a${i}">${_escHtml(a)}</p>`
            );
        }

        // FAQPage Schema.org JSON-LD (SEO)
        const _faqEntities = [];
        for (let i = 1; i <= 6; i++) {
            _faqEntities.push({
                '@type': 'Question',
                'name': t['q' + i] || '',
                'acceptedAnswer': { '@type': 'Answer', 'text': t['a' + i] || '' }
            });
        }
        const _faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'inLanguage': lang,
            'mainEntity': _faqEntities
        };
        const _faqJson = JSON.stringify(_faqSchema).replace(/</g, '\\u003c');
        html = html.replace(/<!-- COUNTRIES-FAQ-SCHEMA -->/,
            `<script type="application/ld+json">${_faqJson}</script>`);

        // {LANG_PREFIX} للروابط الداخلية في قسمَي home-quick-access و home-footer-links
        const _langPrefix = (lang === 'ar') ? '' : '/' + lang;
        html = html.split('{LANG_PREFIX}').join(_langPrefix);

        // ====== SSR i18n لأقسام home-footer-links + popular-cities ======
        const _cFooterI18n = {
            ar: { pop:'🕌 مواقيت الصلاة في أبرز المدن', srv:'🧭 خدمات إسلامية أخرى', share:'🔗 شارك الموقع',
                  follow:'📣 تابعنا', followX:'@TIMESPRAYESRS على X',
                  l_hijri_today:'التاريخ الهجري اليوم', l_hijri_year:'التقويم الهجري 1447',
                  l_date_conv:'تحويل التاريخ', l_tasbih:'المسبحة الإلكترونية',
                  x:'تويتر/X', fb:'فيسبوك', wa:'واتساب', tg:'تلغرام', popAria:'المدن الشائعة', svcAria:'الخدمات الإسلامية' },
            en: { pop:'🕌 Prayer Times in Major Cities', srv:'🧭 Other Islamic Services', share:'🔗 Share This Site',
                  follow:'📣 Follow Us', followX:'@TIMESPRAYESRS on X',
                  l_hijri_today:"Today's Hijri Date", l_hijri_year:'Hijri Calendar 1447',
                  l_date_conv:'Date Converter', l_tasbih:'Digital Tasbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Popular cities', svcAria:'Islamic services' },
            fr: { pop:'🕌 Heures de prière dans les grandes villes', srv:'🧭 Autres services islamiques', share:'🔗 Partager ce site',
                  follow:'📣 Suivez-nous', followX:'@TIMESPRAYESRS sur X',
                  l_hijri_today:"Date Hijri d'aujourd'hui", l_hijri_year:'Calendrier Hijri 1447',
                  l_date_conv:'Convertisseur de date', l_tasbih:'Tasbih numérique',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Villes populaires', svcAria:'Services islamiques' },
            tr: { pop:'🕌 Büyük Şehirlerde Namaz Vakitleri', srv:'🧭 Diğer İslami Hizmetler', share:'🔗 Bu siteyi paylaş',
                  follow:'📣 Bizi takip edin', followX:'X\'te @TIMESPRAYESRS',
                  l_hijri_today:'Bugünün Hicri Tarihi', l_hijri_year:'Hicri Takvim 1447',
                  l_date_conv:'Tarih Dönüştürücü', l_tasbih:'Dijital Tesbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Popüler şehirler', svcAria:'İslami hizmetler' },
            ur: { pop:'🕌 بڑے شہروں میں اوقاتِ نماز', srv:'🧭 دیگر اسلامی خدمات', share:'🔗 سائٹ شیئر کریں',
                  follow:'📣 ہمیں فالو کریں', followX:'X پر @TIMESPRAYESRS',
                  l_hijri_today:'آج کی ہجری تاریخ', l_hijri_year:'ہجری کیلنڈر 1447',
                  l_date_conv:'تاریخ کنورٹر', l_tasbih:'ڈیجیٹل تسبیح',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'مشہور شہر', svcAria:'اسلامی خدمات' },
            de: { pop:'🕌 Gebetszeiten in großen Städten', srv:'🧭 Weitere islamische Dienste', share:'🔗 Diese Seite teilen',
                  follow:'📣 Folgen Sie uns', followX:'@TIMESPRAYESRS auf X',
                  l_hijri_today:'Heutiges Hidschri-Datum', l_hijri_year:'Hidschri-Kalender 1447',
                  l_date_conv:'Datumsumrechner', l_tasbih:'Digitale Tasbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Beliebte Städte', svcAria:'Islamische Dienste' },
            id: { pop:'🕌 Jadwal Sholat di Kota-Kota Besar', srv:'🧭 Layanan Islami Lainnya', share:'🔗 Bagikan situs ini',
                  follow:'📣 Ikuti kami', followX:'@TIMESPRAYESRS di X',
                  l_hijri_today:'Tanggal Hijriyah Hari Ini', l_hijri_year:'Kalender Hijriyah 1447',
                  l_date_conv:'Konverter Tanggal', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Kota-kota populer', svcAria:'Layanan Islami' },
            es: { pop:'🕌 Horarios de Oración en Ciudades Principales', srv:'🧭 Otros Servicios Islámicos', share:'🔗 Compartir este sitio',
                  follow:'📣 Síguenos', followX:'@TIMESPRAYESRS en X',
                  l_hijri_today:'Fecha Hijri de Hoy', l_hijri_year:'Calendario Hijri 1447',
                  l_date_conv:'Conversor de Fechas', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Ciudades populares', svcAria:'Servicios islámicos' },
            bn: { pop:'🕌 প্রধান শহরগুলোতে নামাজের সময়', srv:'🧭 অন্যান্য ইসলামিক সেবা', share:'🔗 এই সাইট শেয়ার করুন',
                  follow:'📣 আমাদের ফলো করুন', followX:'X-এ @TIMESPRAYESRS',
                  l_hijri_today:'আজকের হিজরি তারিখ', l_hijri_year:'হিজরি ক্যালেন্ডার 1447',
                  l_date_conv:'তারিখ রূপান্তরকারী', l_tasbih:'ডিজিটাল তাসবিহ',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'জনপ্রিয় শহর', svcAria:'ইসলামিক সেবা' },
            ms: { pop:'🕌 Waktu Solat di Bandar-Bandar Utama', srv:'🧭 Perkhidmatan Islam Lain', share:'🔗 Kongsi laman ini',
                  follow:'📣 Ikuti kami', followX:'@TIMESPRAYESRS di X',
                  l_hijri_today:'Tarikh Hijrah Hari Ini', l_hijri_year:'Kalendar Hijrah 1447',
                  l_date_conv:'Penukar Tarikh', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Bandar popular', svcAria:'Perkhidmatan Islam' },
        };
        const _cPopCityI18n = {
            ar: { mecca:'مكة المكرمة', medina:'المدينة المنورة', riyadh:'الرياض', jeddah:'جدة',
                  cairo:'القاهرة', istanbul:'إسطنبول', dubai:'دبي', amman:'عمّان',
                  baghdad:'بغداد', damascus:'دمشق', casablanca:'الدار البيضاء', jerusalem:'القدس' },
            en: { mecca:'Mecca', medina:'Medina', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Cairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damascus', casablanca:'Casablanca', jerusalem:'Jerusalem' },
            fr: { mecca:'La Mecque', medina:'Médine', riyadh:'Riyad', jeddah:'Djeddah',
                  cairo:'Le Caire', istanbul:'Istanbul', dubai:'Dubaï', amman:'Amman',
                  baghdad:'Bagdad', damascus:'Damas', casablanca:'Casablanca', jerusalem:'Jérusalem' },
            tr: { mecca:'Mekke', medina:'Medine', riyadh:'Riyad', jeddah:'Cidde',
                  cairo:'Kahire', istanbul:'İstanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Bağdat', damascus:'Şam', casablanca:'Kazablanka', jerusalem:'Kudüs' },
            ur: { mecca:'مکہ مکرمہ', medina:'مدینہ منورہ', riyadh:'ریاض', jeddah:'جدہ',
                  cairo:'قاہرہ', istanbul:'استنبول', dubai:'دبئی', amman:'عمان',
                  baghdad:'بغداد', damascus:'دمشق', casablanca:'کاسابلانکا', jerusalem:'یروشلم' },
            de: { mecca:'Mekka', medina:'Medina', riyadh:'Riad', jeddah:'Dschidda',
                  cairo:'Kairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Bagdad', damascus:'Damaskus', casablanca:'Casablanca', jerusalem:'Jerusalem' },
            id: { mecca:'Makkah', medina:'Madinah', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Kairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damaskus', casablanca:'Casablanca', jerusalem:'Yerusalem' },
            es: { mecca:'La Meca', medina:'Medina', riyadh:'Riad', jeddah:'Yeda',
                  cairo:'El Cairo', istanbul:'Estambul', dubai:'Dubái', amman:'Ammán',
                  baghdad:'Bagdad', damascus:'Damasco', casablanca:'Casablanca', jerusalem:'Jerusalén' },
            bn: { mecca:'মক্কা', medina:'মদিনা', riyadh:'রিয়াদ', jeddah:'জেদ্দা',
                  cairo:'কায়রো', istanbul:'ইস্তাম্বুল', dubai:'দুবাই', amman:'আম্মান',
                  baghdad:'বাগদাদ', damascus:'দামেস্ক', casablanca:'কাসাব্লাঙ্কা', jerusalem:'জেরুজালেম' },
            ms: { mecca:'Makkah', medina:'Madinah', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Kaherah', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damsyik', casablanca:'Casablanca', jerusalem:'Baitulmaqdis' },
        };
        const _f = _cFooterI18n[lang] || _cFooterI18n.ar;
        const _pc = _cPopCityI18n[lang] || _cPopCityI18n.ar;
        // قالب "مواقيت الصلاة في {city}" — نفس قاموس index.html (prefix/postfix لكلّ لغة)
        const _cPrayerTimesInI18n = {
            ar: 'مواقيت الصلاة في {city}',
            en: 'Prayer Times in {city}',
            fr: 'Heures de prière à {city}',
            tr: '{city} için namaz vakitleri',
            ur: '{city} میں اوقاتِ نماز',
            de: 'Gebetszeiten in {city}',
            id: 'Jadwal Sholat di {city}',
            es: 'Horarios de Oración en {city}',
            bn: '{city}-এ নামাজের সময়',
            ms: 'Waktu Solat di {city}',
        };
        const _cPtTmpl = _cPrayerTimesInI18n[lang] || _cPrayerTimesInI18n.ar;

        // Titles + subtitles
        html = html
            .replace(/<h2 id="home-footer-links-title"[^>]*>[^<]*<\/h2>/,
                `<h2 id="home-footer-links-title" data-i18n="footer.popular_cities">${_escHtml(_f.pop)}</h2>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.services_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.services_title">${_escHtml(_f.srv)}</div>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.share_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.share_title">${_escHtml(_f.share)}</div>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.follow_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.follow_title">${_escHtml(_f.follow)}</div>`)
            .replace(/<span data-i18n="footer\.follow_x">[^<]*<\/span>/,
                `<span data-i18n="footer.follow_x">${_escHtml(_f.followX)}</span>`);

        // Popular cities aria + names + locale prefix
        html = html.replace(
            /<nav class="popular-cities-grid" aria-label="[^"]*">/,
            `<nav class="popular-cities-grid" aria-label="${_escHtml(_f.popAria)}">`
        );
        html = html.replace(
            // UAT-3f: URL slug is `makkah` (canonical), but dict key is `mecca`
            // (semantic English). Accept both, normalise the dict lookup.
            /<a href="[^"]*\/prayer-times-in-(makkah|medina|riyadh|jeddah|cairo|istanbul|dubai|amman|baghdad|damascus|casablanca|jerusalem)"[^>]*>[\s\S]*?<\/a>/g,
            (m, slug) => {
                const dictKey = (slug === 'makkah') ? 'mecca' : slug;
                const name = _pc[dictKey];
                // "مواقيت الصلاة في <strong>{city}</strong>" — نُرمِّز pre/post منفصلَين
                // لإبقاء وسم `<strong>` حول اسم المدينة فقط.
                const [pre, post] = _cPtTmpl.split('{city}');
                const label = `${_escHtml(pre)}<strong>${_escHtml(name)}</strong>${_escHtml(post)}`;
                return `<a href="${_langPrefix}/prayer-times-in-${slug}" data-i18n="popular_city.${dictKey}">${label}</a>`;
            }
        );
        html = html.replace(
            /<nav class="home-services-links" aria-label="[^"]*">/,
            `<nav class="home-services-links" aria-label="${_escHtml(_f.svcAria)}">`
        );

        // Services links text — footer: اليوم يذهب مباشرة إلى الصفحة المؤرّخة (canonical)
        const _pC_h = _hijriNow();
        const _pC_pad = (n) => String(n).padStart(2, '0');
        const _pC_dated = `/hijri-date/${_pC_h.year}-${_pC_pad(_pC_h.month)}-${_pC_pad(_pC_h.day)}`;
        html = html
            .replace(/<a href="[^"]*\/today-hijri-date" data-i18n="footer\.link_hijri_today">[^<]*<\/a>/,
                `<a href="${_langPrefix}${_pC_dated}" data-i18n="footer.link_hijri_today">${_escHtml(_f.l_hijri_today)}</a>`)
            .replace(/<a href="[^"]*\/hijri-calendar\/1447" data-i18n="footer\.link_hijri_year">[^<]*<\/a>/,
                `<a href="${_langPrefix}/hijri-calendar/1447" data-i18n="footer.link_hijri_year">${_escHtml(_f.l_hijri_year)}</a>`)
            .replace(/<a href="[^"]*\/dateconverter" data-i18n="footer\.link_date_converter">[^<]*<\/a>/,
                `<a href="${_langPrefix}/dateconverter" data-i18n="footer.link_date_converter">${_escHtml(_f.l_date_conv)}</a>`)
            .replace(/<a href="[^"]*\/msbaha" data-i18n="footer\.link_tasbih">[^<]*<\/a>/,
                `<a href="${_langPrefix}/msbaha" data-i18n="footer.link_tasbih">${_escHtml(_f.l_tasbih)}</a>`);

        // countries navbar + qa-card: استبدال أي href=/today-hijri-date → الصفحة المؤرّخة
        html = html
            .replace(/href="\/today-hijri-date"/g, `href="${_langPrefix}${_pC_dated}"`)
            .replace(/href="\{LANG_PREFIX\}\/today-hijri-date"/g, `href="${_langPrefix}${_pC_dated}"`);

        // Share buttons text
        html = html
            .replace(/<span data-i18n="footer\.share_x">[^<]*<\/span>/, `<span data-i18n="footer.share_x">${_escHtml(_f.x)}</span>`)
            .replace(/<span data-i18n="footer\.share_fb">[^<]*<\/span>/, `<span data-i18n="footer.share_fb">${_escHtml(_f.fb)}</span>`)
            .replace(/<span data-i18n="footer\.share_wa">[^<]*<\/span>/, `<span data-i18n="footer.share_wa">${_escHtml(_f.wa)}</span>`)
            .replace(/<span data-i18n="footer\.share_tg">[^<]*<\/span>/, `<span data-i18n="footer.share_tg">${_escHtml(_f.tg)}</span>`);

        // grid content
        html = html.replace(/<!-- COUNTRIES-GRID-CONTENT -->/, _buildCountriesGrid(lang));

        const buf = Buffer.from(html, 'utf8');
        const headers = {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Vary': 'Accept-Encoding'
        };
        if (acceptEnc && acceptEnc.includes('br')) {
            zlib.brotliCompress(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }, (e, zbuf) => {
                if (e) { res.writeHead(200, headers); res.end(buf); return; }
                res.writeHead(200, { ...headers, 'Content-Encoding': 'br' }); res.end(zbuf);
            });
        } else if (acceptEnc && acceptEnc.includes('gzip')) {
            zlib.gzip(buf, (e, zbuf) => {
                if (e) { res.writeHead(200, headers); res.end(buf); return; }
                res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' }); res.end(zbuf);
            });
        } else {
            res.writeHead(200, headers); res.end(buf);
        }
    });
}

/**
 * يحلّل urlPath ويرجع كائن SEO كامل:
 *  { title, description, canonical, arUrl, enUrl, isEn, lang, siteName,
 *    ogType, ogImageUrl, robots, breadcrumbs: [{name, item}],
 *    geo: {lat, lng, country} | null, prev: url|null, next: url|null, article: {published, modified} | null }
 */
function buildSeoForPath(urlPath) {
    const origin = SITE_URL;
    let p = urlPath.replace(/\.html$/, '');
    if (p === '' || p === '/index') p = '/';

    // دعم 6 لغات: ar (افتراضي بدون prefix)، en، fr، tr، ur، de
    const SUPPORTED = ['en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
    let detectedLang = 'ar';
    let corePath = p;
    for (const l of SUPPORTED) {
        const m = p.match(new RegExp('^\\/' + l + '(\\/.*)?$'));
        if (m) { detectedLang = l; corePath = m[1] || '/'; break; }
    }
    const isEn = (detectedLang === 'en');
    const lang = detectedLang;
    const isRtl = (lang === 'ar' || lang === 'ur');
    // URL variants لكل لغة
    // Final-Cleanup-Patch: avoid trailing-slash duplicates for the language
    // home pages. /fr/ etc. 301-redirect to /fr (canonical, no slash). Emit
    // /fr in hreflang to match canonical and stop the self-referential
    // fallback at line 5314 from firing (was producing duplicate hreflang).
    // AR root (/) keeps its trailing slash since '/' IS the canonical root.
    const langUrl = (l) => {
        const prefix = (l === 'ar') ? '' : ('/' + l);
        if (corePath === '/') return origin + (l === 'ar' ? '/' : prefix);
        return origin + prefix + corePath;
    };
    const arUrl = langUrl('ar');
    const enUrl = langUrl('en');
    const frUrl = langUrl('fr');
    const trUrl = langUrl('tr');
    const urUrl = langUrl('ur');
    const deUrl = langUrl('de');
    const idUrl = langUrl('id');
    const esUrl = langUrl('es');
    const bnUrl = langUrl('bn');
    const msUrl = langUrl('ms');
    let canonical = origin + p;
    // robots override: null = default index,follow; otherwise استخدم هذه القيمة
    let robotsOverride = null;
    const SITE_NAMES = {
        ar: 'مواقيت الصلاة', en: 'Prayer Times', fr: 'Heures de Prière',
        tr: 'Namaz Vakitleri', ur: 'اوقاتِ نماز', de: 'Gebetszeiten',
        id: 'Jadwal Sholat',
        es: 'Horarios de Oración', bn: 'নামাজের সময়সূচী', ms: 'Waktu Solat'
    };
    const siteName = SITE_NAMES[lang] || SITE_NAMES.ar;

    // Defaults (homepage) — Round 7e: Keyword Consistency
    // Title يحوي: اليوم + مكة المكرمة + "الصلاة في" (phrase) + التاريخ الهجري
    // Description يحوي: اليوم + مكة + المدينة + الشهر الهجري الحالي ديناميكياً
    //                   (لإزالة Seobility "missing keywords" warnings)
    const _hNow = _hijriNow();
    const _hMonthAr = (_HIJRI_MONTHS[_hNow.month] || {}).ar || '';
    const _hMonthEn = (_HIJRI_MONTHS[_hNow.month] || {}).en || '';
    const _hYear = _hNow.year;
    // _gNow بتوقيت مكّة (Asia/Riyadh) — انظر _nowMeccaDate(). استعمل get**UTC**
    // لاستخراج أجزاء التاريخ لأنّ الـ Date مبنيّ بـ Date.UTC(y,m-1,d).
    const _gNow = _nowMeccaDate();
    const _gMonthIdx = _gNow.getUTCMonth();
    const _gYear = _gNow.getUTCFullYear();

    // Round 7h: أسماء الأشهر الميلاديّة مترجَمة لكلّ اللغات العشر — ضروريّ لإدراج
    // الشهر/السنة في Meta Description (phrase "أبريل 2026" في seoptimer).
    const _G_MONTHS = {
        ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
        en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
        fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
        tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
        ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
        de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
        id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
        es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
        bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
        ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'],
    };
    const _gMonthAr = _G_MONTHS.ar[_gMonthIdx];
    const _gMonthEn = _G_MONTHS.en[_gMonthIdx];

    // Round 8: أسماء أيّام الأسبوع + أشهر هجريّة + لاحقة هـ لكلّ اللغات الـ10
    // (مستخدَمة في title صفحات المدن — "اليوم {يوم} {dd} {شهر} {YYYY} - {hd} {h.m} {hy}هـ")
    const _G_DAYS = {
        ar: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
        en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        fr: ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],
        tr: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
        ur: ['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ'],
        de: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
        id: ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],
        es: ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
        bn: ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'],
        ms: ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'],
    };
    const _HM_BY_LANG_CITY = {
        ar: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
        en: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Akhira','Rajab','Shaban','Ramadan','Shawwal','Dhu al-Qidah','Dhu al-Hijjah'],
        fr: ['Mouharram','Safar','Rabi al-Awwal','Rabi al-Thani','Joumada al-Oula','Joumada al-Thania','Rajab','Chaabane','Ramadan','Chawwal','Dhou al-Qida','Dhou al-Hijja'],
        tr: ['Muharrem','Safer','Rebiülevvel','Rebiülahir','Cemaziyelevvel','Cemaziyelahir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'],
        ur: ['محرّم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذوالقعدہ','ذوالحجہ'],
        de: ['Muharram','Safar','Rabīʿ al-awwal','Rabīʿ ath-thānī','Dschumādā l-ūlā','Dschumādā th-thāniya','Radschab','Schaʿbān','Ramadan','Schawwāl','Dhū l-qaʿda','Dhū l-hidscha'],
        id: ['Muharram','Safar','Rabiul Awal','Rabiul Akhir','Jumadil Awal','Jumadil Akhir','Rajab','Syaban','Ramadan','Syawal','Zulkaidah','Zulhijah'],
        es: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Yumada al-Awwal','Yumada al-Thani','Rayab','Shaabán','Ramadán','Shawwal','Du al-Qida','Du al-Hiyya'],
        bn: ['মুহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'],
        ms: ['Muharam','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah'],
    };
    // لاحقة السنة الهجريّة — بلا مسافة في AR/UR/BN (توافقاً مع القواعد)، وبمسافة قبلها في بقيّة اللغات
    const _HY_SFX_CITY = { ar:' هـ', en:' AH', fr:' H', tr:' H', ur:'ھ', de:' AH', id:' H', es:' H', bn:' হিজরি', ms:' H' };
    const _gDayNum = _gNow.getUTCDate();
    const _gDayIdx = _gNow.getUTCDay();
    const _gDayName = (_G_DAYS[lang] || _G_DAYS.en)[_gDayIdx];
    const _gMonthLoc = (_G_MONTHS[lang] || _G_MONTHS.en)[_gMonthIdx];
    const _hDayNum = _hNow.day;
    const _hMonthLoc = (_HM_BY_LANG_CITY[lang] || _HM_BY_LANG_CITY.en)[_hNow.month - 1];
    const _hYearSfx = _HY_SFX_CITY[lang] || ' AH';

    // حاسِب تاريخ هجري محلّيّ من خطّ طول المدينة (تقريب offset = round(lng/15)).
    // دقّة ±30 دقيقة على حدود المناطق الزمنيّة — كافٍ لعرض التاريخ (يوم واحد).
    // حالات خاصّة (DST، ½-hour TZ كـ Iran/India) تُنحرف ≤ساعة وليس يومًا كاملاً.
    const _hijriDayForLng = (lng) => {
        if (typeof lng !== 'number' || !isFinite(lng)) return { hD: _hNow.day, hM: _hNow.month, hY: _hNow.year };
        const offsetMs = Math.round(lng / 15) * 3600 * 1000;
        const dt = new Date(Date.now() + offsetMs);
        const jd = _gregToJD(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
        const hj = _jdToHijri(jd);
        return { hD: hj.day, hM: hj.month, hY: hj.year };
    };

    // صانع title صفحات المدن (10 لغات) — نسخة مختصرة: "مدينة + اليوم + تاريخ هجري"
    // cityLng اختياريّ: إن مُرِّر، يُحسب الهجري بتوقيت المدينة (مهمّ لـ Jakarta, NY…
    // ليلاً عند فارق يوم كامل عن توقيت السيرفر). بدونه: توقيت مكّة (الافتراضي).
    // صانع title صفحات المدن (10 لغات) — Phase D2: ثابت بلا تاريخ هجريّ، بفاصل |
    // cityLng يُحفَظ كمَعامل لأسباب التوافق فقط (التاريخ الهجريّ ينتقل إلى H1/intro/desc).
    const _buildCityDatedTitle = (cityDisplay, _cityLng) => {
        switch (lang) {
            case 'ar': return `مواقيت الصلاة في ${cityDisplay} | جدول اليوم واتجاه القبلة`;
            case 'fr': return `Heures de prière à ${cityDisplay} | Horaires du jour et Qibla`;
            case 'tr': return `${cityDisplay} Namaz Vakitleri | Günlük Program ve Kıble`;
            case 'ur': return `${cityDisplay} میں اوقاتِ نماز | آج کا جدول اور سمتِ قبلہ`;
            case 'de': return `Gebetszeiten in ${cityDisplay} | Tagesplan und Qibla`;
            case 'id': return `Jadwal Sholat di ${cityDisplay} | Jadwal Hari Ini dan Kiblat`;
            case 'es': return `Horarios de Oración en ${cityDisplay} | Horario de Hoy y Qibla`;
            case 'bn': return `${cityDisplay}-এ নামাজের সময় | আজকের সূচী ও কিবলা`;
            case 'ms': return `Waktu Solat di ${cityDisplay} | Jadual Hari Ini dan Kiblat`;
            default:   return `Prayer Times in ${cityDisplay} | Today's Schedule and Qibla`;
        }
    };

    // Homepage title/description — GENERIC (no Mecca cannibalization).
    //   The dedicated /prayer-times-in-makkah page owns the "مكة" keyword.
    //   Homepage targets the generic "مواقيت الصلاة اليوم" so it ranks for
    //   broad queries without competing with the city-specific page.
    //   (UAT-SEO-Cannibalization fix — 2026-04-28)
// Phase D1: shorter homepage titles — drop redundant "prayer/Solat/Sholat/Namaz/oración" repetition
    const _HOME_TITLES = {
        ar: 'مواقيت الصلاة اليوم | التاريخ الهجري واتجاه القبلة وحالة القمر',
        en: "Prayer Times Today | Hijri Date, Qibla Direction & Moon Phase",
        fr: "Heures de prière | Date hégirienne, Qibla et phase lunaire",
        tr: 'Bugünkü Namaz Vakitleri | Hicri Tarih, Kıble Yönü ve Ay Evresi',
        ur: 'آج اوقاتِ نماز | ہجری تاریخ، سمتِ قبلہ اور چاند کی حالت',
        de: 'Heutige Gebetszeiten | Hidschri-Datum, Qibla & Mondphase',
        id: 'Jadwal Sholat Hari Ini | Tanggal Hijriah, Arah Kiblat & Fase Bulan',
        es: 'Horarios de Oración Hoy | Fecha Hijri, Qibla y Fase Lunar',
        bn: 'আজকের নামাজের সময় | হিজরি তারিখ, কিবলা ও চাঁদের অবস্থা',
        ms: 'Waktu Solat Hari Ini | Tarikh Hijrah, Arah Kiblat & Fasa Bulan',
    };
// Phase D1: shorter homepage descs — trim to ~125–148 chars per language
    const _HOME_DESCS = {
        ar: 'اعرف مواقيت الصلاة اليوم لأي مدينة حول العالم: الفجر والظهر والعصر والمغرب والعشاء، والتاريخ الهجري واتجاه القبلة.',
        en: 'Find accurate prayer times for any city worldwide — Fajr, Dhuhr, Asr, Maghrib, Isha — with Hijri date, Qibla direction and moon phase.',
        fr: "Horaires de prière exacts pour toute ville — Fajr, Dohr, Asr, Maghrib, Icha — avec la date hégirienne, la direction de la Qibla et la phase lunaire.",
        tr: 'Tüm dünyada her şehir için doğru namaz vakitleri — Fecir, Öğle, İkindi, Akşam, Yatsı — hicri tarih, kıble yönü ve ay evresi ile birlikte.',
        ur: 'دنیا کے کسی بھی شہر کے لیے درست اوقاتِ نماز — فجر، ظہر، عصر، مغرب، عشاء — ہجری تاریخ، سمتِ قبلہ اور چاند کی حالت کے ساتھ۔',
        de: 'Genaue Gebetszeiten für jede Stadt weltweit — Fajr, Dhuhr, Asr, Maghrib, Isha — mit Hidschri-Datum, Qibla-Richtung und Mondphase.',
        id: 'Jadwal sholat akurat untuk semua kota di dunia — Subuh, Zuhur, Asar, Magrib, Isya — dengan tanggal Hijriah, arah kiblat dan fase bulan.',
        es: 'Horarios de oración exactos para cualquier ciudad del mundo — Fayr, Dohr, Asr, Magrib, Isha — con fecha Hijri, dirección de la Qibla y fase lunar.',
        bn: 'বিশ্বের যেকোনো শহরের নির্ভুল নামাজের সময় — ফজর, জোহর, আসর, মাগরিব, এশা — হিজরি তারিখ, কিবলার দিক ও চাঁদের অবস্থা সহ।',
        ms: 'Waktu solat tepat untuk mana-mana bandar di dunia — Subuh, Zohor, Asar, Maghrib, Isyak — dengan tarikh Hijrah, arah kiblat dan fasa bulan.',
    };
    let title       = _HOME_TITLES[lang] || _HOME_TITLES.en;
    let description = _HOME_DESCS[lang]  || _HOME_DESCS.en;
    let ogType = 'website';
    let geo = null;
    let prev = null, next = null, article = null;
    let webApp = null;           // WebApplication schema metadata (tool pages)
    let qiblaRef = null;         // Kaaba reference for /qibla-in-*
    let cityModified = null;     // dateModified for city pages
    let moonFaq = false;         // Round 9: يُفعّل FAQPage schema لصفحات القمر
    let zakatFaq = false;        // UAT-Z1: يُفعّل FAQPage + HowTo schemas لصفحة الزكاة
    let moonCity = null;         // Round 9: بيانات مدينة لصفحة /moon-today-in-{slug}
    // (UAT-SEO-Cannibalization) The 8 per-lang description overrides above
    //   used to re-introduce "Mecca/Medina" mentions on the homepage. Removed
    //   so the generic _HOME_DESCS dict above is the single source of truth.
    //   Mecca-as-keyword now lives ONLY on /prayer-times-in-makkah.

    const HOME_LABELS = { ar: 'الرئيسية', en: 'Home', fr: 'Accueil', tr: 'Ana Sayfa', ur: 'ہوم', de: 'Startseite', id: 'Beranda', es: 'Inicio', bn: 'হোম', ms: 'Utama' };
    // Breadcrumb «Home» يجب أن يشير دائماً إلى الصفحة الرئيسيّة (/ أو /{lang}/) لا إلى الصفحة الحاليّة.
    const breadcrumbs = [{ name: HOME_LABELS[lang] || HOME_LABELS.ar, item: origin + (lang === 'ar' ? '/' : '/' + lang + '/') }];

    // ── Static tool pages ──
    const staticPages = {
        '/qibla': {
            // Phase D1: replace em-dash with "|", extend short titles, normalize TR desc
            title: {
                ar: 'اتجاه القبلة | بوصلة الكعبة المشرفة والمسافة',
                en: 'Qibla Direction | Compass and Distance to the Kaaba',
                fr: 'Direction de la Qibla | Boussole et distance à la Kaaba',
                tr: 'Kıble Yönü | Kâbe\u2019ye Pusula ve Uzaklık Hesaplama',
                ur: 'سمتِ قبلہ | خانہ کعبہ کی طرف قطب نما اور فاصلہ',
                de: 'Qibla-Richtung | Kompass und Entfernung zur Kaaba',
                id: 'Arah Kiblat | Kompas Online dan Jarak ke Kakbah',
                es: 'Dirección de la Qibla | Brújula y distancia a la Kaaba',
                bn: 'কিবলার দিক | কাবার দিকনির্দেশ ও দূরত্ব নির্ণয়',
                ms: 'Arah Kiblat | Kompas Dalam Talian dan Jarak ke Kaabah',
            },
            desc: {
                ar: 'احسب اتجاه القبلة بدقة من أي موقع مع المسافة إلى الكعبة المشرفة وبوصلة تفاعلية وأسئلة شائعة.',
                en: 'Calculate the Qibla direction accurately from any location with the distance to the Kaaba, an interactive compass and a helpful FAQ.',
                fr: 'Calculez la direction précise de la Qibla depuis n\u2019importe quel lieu : distance à la Kaaba, boussole interactive et FAQ utile.',
                tr: 'Her konumdan kıble yönünü doğru hesaplayın: Kâbe\u2019ye uzaklık (km), etkileşimli pusula, anlık döndürme ve sıkça sorulan sorular.',
                ur: 'کسی بھی مقام سے قبلہ کی درست سمت، کعبہ تک فاصلہ، انٹرایکٹو قطب نما اور عام سوالات کے ساتھ۔',
                de: 'Berechnen Sie die Qibla-Richtung genau von jedem Ort aus: Entfernung zur Kaaba, interaktiver Kompass und hilfreiche FAQ.',
                id: 'Hitung arah kiblat dengan akurat dari lokasi mana pun, lengkap dengan jarak ke Kakbah, kompas interaktif, dan FAQ.',
                es: 'Calcule la dirección precisa de la Qibla desde cualquier lugar con la distancia a la Kaaba, una brújula interactiva y una FAQ útil.',
                bn: 'যেকোনো অবস্থান থেকে কিবলার সঠিক দিক—কাবা পর্যন্ত দূরত্ব, ইন্টারঅ্যাকটিভ কম্পাস এবং FAQ সহ।',
                ms: 'Kira arah kiblat dengan tepat dari mana-mana lokasi dengan jarak ke Kaabah, kompas interaktif dan FAQ berguna.',
            },
            app: { category: 'UtilitiesApplication' },
            ogType: 'website',
        },
        '/moon-today': {
            title: {
                // Phase E2-keywords-Hub (2026-05-01): extend each title to include
                // "مراحل القمر" + "التقويم الهجري" (and parallel terms in 9 other
                // langs). Goal — flip SEOptimer's Keyword Consistency from ✗ to ✓
                // for these two terms, same way the city-page Today block (Phase
                // E2-keywords-ext) flipped /moon-today-in-{city} green. Each line
                // sits in the 50–60 SEOptimer sweet spot. Deliberately omits the
                // month name (E2-keywords-diag hard rule: no monthly title rotation)
                // and the default city name (Hub is generic, not city-specific).
                ar: 'حالة القمر اليوم: الطور الحالي ومراحل القمر والتقويم الهجري',
                en: 'Moon Today: Current Phase, Moon Phases & Hijri Calendar',
                fr: 'Lune aujourd\u2019hui : phases lunaires et calendrier hégirien',
                tr: 'Bugün Ay: Mevcut Evre, Ay Evreleri ve Hicri Takvim',
                ur: 'آج چاند کی حالت: موجودہ طور، چاند کے مراحل اور ہجری تقویم',
                de: 'Mond heute: aktuelle Phase, Mondphasen & Hidschri-Kalender',
                id: 'Bulan Hari Ini: Fase Saat Ini, Fase Bulan & Kalender Hijriah',
                es: 'Luna hoy: fase actual, fases lunares y calendario hijri',
                bn: 'আজ চাঁদ: বর্তমান দশা, চাঁদের দশা ও হিজরি ক্যালেন্ডার',
                ms: 'Bulan Hari Ini: Fasa Semasa, Fasa Bulan & Kalendar Hijrah',
            },
            desc: {
                ar: 'حالة القمر اليوم: طور القمر ونسبة إضاءته الآن، عمر القمر بالأيّام، المسافة بين موقعك والقمر، موعد مطلع القمر ومغيبه، البدر القادم ورؤية هلال الشهر الهجريّ.',
                en: "Today's moon phase, illumination, age, moonrise and moonset times, distance to Earth, plus the next full moon and crescent visibility dates.",
                fr: 'État de la Lune aujourd\u2019hui : phase actuelle et pourcentage d\u2019illumination, âge de la Lune en jours, distance entre votre ville et la Lune, heures de lever/coucher, prochaine pleine lune et visibilité du croissant (hilal) pour le prochain mois hégirien.',
                tr: 'Ayın bugünkü durumu: şu anki evre ve aydınlanma yüzdesi, ayın gün olarak yaşı, şehriniz ile Ay arasındaki mesafe, ay doğuşu/batışı saatleri, bir sonraki dolunay ve gelecek hicri ay için hilal görünürlüğü.',
                ur: 'آج چاند کی حالت: موجودہ طور اور روشنی کا فیصد، چاند کی عمر دنوں میں، آپ کے شہر اور چاند کے درمیان فاصلہ، مطلع اور مغیبِ چاند کے اوقات، اگلا بدر اور آنے والے ہجری مہینے کے لیے ہلال کی رؤیت۔',
                de: 'Mondzustand heute: aktuelle Phase und Beleuchtungsprozent, Mondalter in Tagen, Entfernung zwischen Ihrer Stadt und dem Mond, Mondaufgang und -untergang, nächster Vollmond und Hilal-Sichtbarkeit für den kommenden Hidschri-Monat.',
                id: 'Keadaan Bulan hari ini: fase dan persentase iluminasi saat ini, usia bulan dalam hari, jarak antara kota Anda dan Bulan, waktu terbit dan terbenam, purnama berikutnya dan rukyat hilal untuk bulan Hijriyah mendatang.',
                es: 'Estado de la Luna hoy: fase actual y porcentaje de iluminación, edad de la Luna en días, distancia entre su ciudad y la Luna, horas de salida y puesta, próxima luna llena y visibilidad del hilal para el próximo mes Hijri.',
                bn: 'আজ চাঁদের অবস্থা: বর্তমান দশা ও আলোকন শতাংশ, দিনের হিসেবে চাঁদের বয়স, আপনার শহর ও চাঁদের মধ্যকার দূরত্ব, চাঁদের উদয় ও অস্ত সময়, পরবর্তী পূর্ণিমা এবং আসন্ন হিজরি মাসের হিলাল দৃশ্যমানতা।',
                ms: 'Keadaan Bulan hari ini: fasa semasa dan peratus pencahayaan, usia bulan dalam hari, jarak antara bandar anda dan Bulan, waktu terbit dan terbenam, bulan purnama seterusnya dan rukyah hilal untuk bulan Hijrah mendatang.',
            },
            app: { category: 'UtilitiesApplication' },
            moonFaq: true,   // يُفعّل FAQPage schema لصفحة القمر
        },
        '/zakat-calculator': {
            // UAT-Z1 + Phase D1: array→object structure; localized for all 10 langs
            title: {
                ar: 'حاسبة الزكاة | احسب زكاة المال والذهب والأسهم بسهولة',
                en: 'Zakat Calculator | Money, Gold and Investments',
                fr: 'Calculateur de Zakat | Argent, Or et Investissements',
                tr: 'Zekât Hesaplayıcı | Para, Altın ve Yatırımlarda Zekât',
                ur: 'زکوٰۃ کیلکولیٹر | نقد، سونے اور سرمایہ کاری پر زکوٰۃ',
                de: 'Zakat-Rechner | Geld, Gold und Investitionen',
                id: 'Kalkulator Zakat | Uang, Emas dan Investasi',
                es: 'Calculadora de Zakat | Dinero, Oro e Inversiones',
                bn: 'যাকাত ক্যালকুলেটর | অর্থ, সোনা ও বিনিয়োগের যাকাত',
                ms: 'Kalkulator Zakat | Wang, Emas, Pelaburan dan Saham',
            },
            desc: {
                ar: 'احسب زكاة المال والمدخرات والذهب والفضة والأسهم والاستثمارات والعقارات المعدّة للبيع وفق النصاب ونسبة 2.5%، مع توضيح طريقة الحساب.',
                en: 'Use the Zakat Calculator to estimate zakat on cash, savings, gold, silver, investments, and trade assets with nisab and 2.5% zakat calculation.',
                fr: 'Calculez la Zakat sur l\u2019argent, l\u2019épargne, l\u2019or, l\u2019argent et les investissements avec le nisab et le taux de 2,5%.',
                tr: 'Zekât hesaplayıcı ile para, birikim, altın, gümüş, yatırım ve ticaret malları üzerinden zekâtınızı %2,5 ve nisaba göre hesaplayın.',
                ur: 'زکوٰۃ کیلکولیٹر سے نقد، بچت، سونا، چاندی، سرمایہ کاری اور تجارتی اثاثوں پر زکوٰۃ نصاب اور 2.5% شرح کے مطابق شمار کریں۔',
                de: 'Berechnen Sie mit dem Zakat-Rechner die Zakat auf Bargeld, Ersparnisse, Gold, Silber, Investitionen und Handelsgüter mit Nisab und 2,5%.',
                id: 'Hitung zakat uang tunai, tabungan, emas, perak, investasi dan barang dagangan dengan nisab dan tarif 2,5% pakai kalkulator zakat ini.',
                es: 'Calcula la Zakat sobre dinero, ahorros, oro, plata, inversiones y mercancías con el nisab y la tasa del 2,5% — guía completa.',
                bn: 'যাকাত ক্যালকুলেটর দিয়ে নগদ, সঞ্চয়, সোনা, রুপা, বিনিয়োগ ও বাণিজ্য পণ্যের যাকাত নিসাব ও ২.৫% হারে হিসাব করুন।',
                ms: 'Kira zakat wang tunai, simpanan, emas, perak, pelaburan dan barang dagangan dengan nisab dan kadar 2.5% guna kalkulator ini.',
            },
            app: { category: 'FinanceApplication' },
            zakatFaq: true,    // UAT-Z1: enables FAQPage + HowTo schemas
        },
        '/azkar': {
            // Phase D3.3-0: rename /duas → /azkar; SEO-rebrand to AZKAR / الأذكار
            title: {
                ar: 'الأذكار | أذكار الصباح والمساء وأدعية صحيحة من القرآن والسنة',
                en: 'Azkar | Authentic Daily Islamic Supplications & Adhkar',
                fr: 'Azkar | Invocations authentiques du quotidien (Adhkar)',
                tr: 'Azkar | Kur\u2019an ve Sünnet\u2019ten Sahih Günlük Zikirler',
                ur: 'اذکار | صبح و شام کے اذکار اور قرآن و سنت سے صحیح دعائیں',
                de: 'Azkar | Authentische tägliche Bittgebete (Adhkar) aus Quran & Sunna',
                id: 'Azkar | Zikir Harian Sahih dari Al-Quran dan Sunnah',
                es: 'Azkar | Súplicas Diarias Auténticas (Adhkar) del Islam',
                bn: 'আযকার | কুরআন ও সুন্নাহ থেকে সহিহ দৈনিক জিকির',
                ms: 'Azkar | Zikir Harian Sahih dari Al-Quran dan Sunnah',
            },
            desc: {
                ar: 'الأذكار الصحيحة من القرآن والسنة: أذكار الصباح والمساء، بعد الصلاة، النوم، السفر، الكرب، ويوم الجمعة — مع التخريج.',
                en: 'Azkar — authentic daily adhkar from Quran & Sunnah: morning & evening, after-prayer remembrance, sleep, travel, distress and Friday supplications with sources.',
                fr: 'Azkar — adhkar authentiques du Coran et de la Sunna : matin et soir, après la prière, sommeil, voyage, détresse et invocations du vendredi avec sources.',
                tr: 'Azkar — Kur\u2019an ve Sünnet\u2019ten sahih günlük zikirler: sabah-akşam, namaz sonrası, uyku, yolculuk, sıkıntı ve Cuma duaları kaynaklarıyla.',
                ur: 'اذکار — قرآن و سنت سے صحیح روزمرّہ اذکار: صبح و شام، نماز کے بعد، سونے، سفر، پریشانی اور جمعہ کی دعائیں حوالہ جات کے ساتھ۔',
                de: 'Azkar — authentische tägliche Adhkar aus Quran und Sunna: morgens und abends, nach dem Gebet, Schlaf, Reise, Not und Freitags-Bittgebete mit Quellen.',
                id: 'Azkar — zikir harian sahih dari Al-Quran dan Sunnah: pagi dan petang, setelah sholat, tidur, perjalanan, kesusahan dan doa Jumat dengan sumber.',
                es: 'Azkar — adhkar diarios auténticos del Corán y la Sunna: mañana y tarde, tras la oración, sueño, viaje, angustia e invocaciones del viernes con fuentes.',
                bn: 'আযকার — কুরআন ও সুন্নাহ থেকে সহিহ দৈনিক জিকির: সকাল-সন্ধ্যা, নামাজের পর, ঘুম, ভ্রমণ, কষ্ট ও জুমার দোয়া সূত্র সহকারে।',
                ms: 'Azkar — zikir harian sahih dari Al-Quran dan Sunnah: pagi dan petang, selepas solat, tidur, perjalanan, kesusahan dan doa Jumaat berserta sumber.',
            },
            ogType: 'article',
        },
        '/msbaha': {
            // Phase D1: replace em-dash with "|", extend titles, trim ar/bn descs
            title: {
                ar: 'المسبحة الإلكترونية | عدّاد الذكر اليومي مع حفظ العدّ',
                en: 'Digital Tasbih Counter | Masbaha for Daily Dhikr Tracking',
                fr: 'Tasbih Numérique | Compteur de Dhikr Quotidien en Ligne',
                tr: 'Dijital Tesbih | Günlük Zikir Sayacı ve Hedef Takibi',
                ur: 'ڈیجیٹل تسبیح | روزانہ ذکر کا شمار اور ہدف ٹریکنگ',
                de: 'Digitale Tasbih | Dhikr-Zähler mit täglichem Ziel',
                id: 'Tasbih Digital | Penghitung Dzikir dengan Target Harian',
                es: 'Tasbih Digital | Contador de Dhikr con Meta Diaria',
                bn: 'ডিজিটাল তাসবিহ | দৈনিক জিকির কাউন্টার ও লক্ষ্য নির্ধারণ',
                ms: 'Tasbih Digital | Pengira Zikir dengan Sasaran Harian',
            },
            desc: {
                ar: 'مسبحة إلكترونية مجانية تحفظ العدّ بين الجلسات. سبّح: سبحان الله، الحمد لله، الله أكبر، أو حدّد ذكراً مخصّصاً وهدفاً يومياً.',
                en: 'Free digital tasbih counter that saves your dhikr count between sessions. Track Subhanallah, Alhamdulillah, Allahu Akbar and custom dhikr targets.',
                fr: 'Tasbih numérique gratuit qui garde le compteur entre les sessions. Comptez Subhanallah, Alhamdulillah, Allahu Akbar ou un dhikr personnalisé.',
                tr: 'Oturumlar arasında zikir sayınızı kaydeden ücretsiz dijital tesbih sayacı. Subhanallah, Elhamdulillah, Allahu Ekber ve özel zikir hedeflerini takip edin.',
                ur: 'مفت ڈیجیٹل تسبیح کاؤنٹر جو آپ کے ذکر کی گنتی محفوظ رکھتا ہے۔ سبحان اللہ، الحمد للہ، اللہ اکبر اور اپنے حسب ضرورت ذکر کا ہدف مقرر کریں۔',
                de: 'Kostenloser digitaler Tasbih-Zähler, der Ihren Dhikr-Zählstand zwischen Sitzungen speichert. Zählen Sie Subhanallah, Alhamdulillah, Allahu Akbar und eigene Ziele.',
                id: 'Tasbih digital gratis yang menyimpan hitungan dzikir antar sesi. Pantau Subhanallah, Alhamdulillah, Allahu Akbar dan target dzikir kustom.',
                es: 'Contador de tasbih digital gratuito que guarda su conteo de dhikr entre sesiones. Registre Subhanallah, Alhamdulillah, Allahu Akbar y objetivos personalizados.',
                bn: 'বিনামূল্যে ডিজিটাল তাসবিহ যা সেশনের মধ্যে জিকির সংরক্ষণ করে। সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার ও কাস্টম জিকির গণনা করুন।',
                ms: 'Pengira tasbih digital percuma yang menyimpan kiraan zikir anda antara sesi. Jejaki Subhanallah, Alhamdulillah, Allahu Akbar dan sasaran zikir tersuai.',
            },
            app: { category: 'UtilitiesApplication' },
        },
        '/dateconverter': {
            // Phase D1: extend short titles (TR/UR/BN/MS) with "| Online tool" suffix; trim de/bn descs
            title: {
                ar: 'محوّل التاريخ الهجري والميلادي | تقويم أم القرى',
                en: 'Hijri ↔ Gregorian Date Converter | Online Tool',
                fr: 'Convertisseur Hégire ↔ Grégorien | Outil en ligne',
                tr: 'Hicri ↔ Miladi Tarih Dönüştürücü | Online Hesaplayıcı',
                ur: 'ہجری اور میلادی تاریخ کنورٹر | آن لائن کیلکولیٹر',
                de: 'Hidschri ↔ Gregorianisch Umrechner | Online-Tool',
                id: 'Konverter Tanggal Hijriyah ↔ Masehi | Alat Online',
                es: 'Conversor de Fecha Hijri ↔ Gregoriana | Herramienta',
                bn: 'হিজরি ↔ গ্রেগরিয়ান তারিখ রূপান্তর | অনলাইন ক্যালকুলেটর',
                ms: 'Penukar Tarikh Hijrah ↔ Gregorian | Alat Dalam Talian',
            },
            desc: {
                ar: 'حوِّل بين الهجري والميلادي لأي سنة من 1 هـ حتى 1500 هـ، وفق تقويم أم القرى، مع اليوم من الأسبوع والأحداث التاريخية.',
                en: 'Convert Hijri to Gregorian and vice versa for any year from 1 AH to 1500 AH. Based on Umm al-Qura calendar with weekday and historical event lookup.',
                fr: 'Convertissez entre dates hégiriennes et grégoriennes de 1 AH à 1500 AH. Basé sur le calendrier Umm al-Qura avec jour de semaine et événements historiques.',
                tr: '1 H\'den 1500 H\'ye kadar herhangi bir yıl için Hicri ile Miladi arasında tarih dönüştürün. Ümmü\'l-Kura takvimi esaslı; haftanın günü ve tarihi olaylar dahil.',
                ur: '1 ہجری سے 1500 ہجری تک کسی بھی سال کے لیے ہجری اور میلادی تاریخ میں تبدیلی۔ ام القرى کیلنڈر پر مبنی، ہفتے کا دن اور تاریخی واقعات۔',
                de: 'Konvertieren Sie Hidschri und Gregorianisch (1–1500 AH) per Umm al-Qura-Kalender — mit Wochentag und historischen Ereignissen.',
                id: 'Konversi tanggal Hijriyah ke Masehi dan sebaliknya untuk tahun 1 H hingga 1500 H. Berbasis kalender Umm al-Qura dengan hari dalam seminggu dan peristiwa sejarah.',
                es: 'Convierte fechas Hijri a gregorianas y viceversa para cualquier año de 1 AH a 1500 AH. Basado en el calendario Umm al-Qura con día de la semana y eventos históricos.',
                bn: '১ থেকে ১৫০০ হিজরি পর্যন্ত হিজরি ও গ্রেগরিয়ান তারিখ রূপান্তর — উম্মুল কুরা ক্যালেন্ডার, সপ্তাহের দিন ও ঐতিহাসিক ঘটনা সহ।',
                ms: 'Tukar tarikh Hijrah dan Gregorian dari 1 hingga 1500H dengan kalendar Umm al-Qura, hari minggu dan peristiwa sejarah.',
            },
            app: { category: 'UtilitiesApplication' },
        },
        '/today-hijri-date': {
            title: {
                ar: 'التاريخ الهجري اليوم',
                en: "Today's Hijri Date",
                fr: "Date Hijri d'aujourd'hui",
                tr: "Bugünün Hicri Tarihi",
                ur: 'آج کی ہجری تاریخ',
                de: 'Heutiges Hidschri-Datum',
                id: 'Tanggal Hijriyah Hari Ini',
                es: 'Fecha Hijri de Hoy',
                bn: 'আজকের হিজরি তারিখ',
                ms: 'Tarikh Hijrah Hari Ini',
            },
            desc: {
                ar: 'التاريخ الهجري اليوم مع مقابله الميلادي — محدَّث يومياً وفقاً لتقويم أم القرى.',
                en: "Find today's accurate Hijri (Islamic) date and its Gregorian equivalent — updated daily from Umm al-Qura calendar.",
                fr: "Trouvez la date hégirienne (islamique) exacte d'aujourd'hui et son équivalent grégorien — mise à jour quotidienne selon le calendrier Umm al-Qura.",
                tr: "Bugünün doğru Hicri (İslami) tarihini ve Miladi karşılığını bulun — Ümmü'l-Kura takvimine göre günlük güncellenir.",
                ur: 'آج کی درست ہجری (اسلامی) تاریخ اور اس کی میلادی مماثلت تلاش کریں — ام القرى کیلنڈر کے مطابق روزانہ اپ ڈیٹ۔',
                de: 'Finden Sie das heutige exakte Hidschri-Datum (islamisches Datum) und sein gregorianisches Äquivalent — täglich gemäß dem Umm al-Qura-Kalender aktualisiert.',
                id: 'Temukan tanggal Hijriyah (Islam) hari ini yang akurat dan padanan Masehinya — diperbarui setiap hari dari kalender Umm al-Qura.',
                es: "Encuentra la fecha Hijri (islámica) exacta de hoy y su equivalente gregoriana — actualizada diariamente según el calendario Umm al-Qura.",
                bn: 'আজকের নির্ভুল হিজরি (ইসলামিক) তারিখ এবং এর গ্রেগরিয়ান সমতুল্য খুঁজুন — উম্মুল কুরা ক্যালেন্ডার অনুযায়ী প্রতিদিন আপডেট।',
                ms: 'Cari tarikh Hijrah (Islam) hari ini yang tepat dan padanannya dalam kalendar Gregorian — dikemas kini setiap hari mengikut kalendar Umm al-Qura.',
            },
            ogType: 'article',
        },
        '/privacy': {
            title: {
                ar: 'سياسة الخصوصية — مواقيت الصلاة',
                en: 'Privacy Policy — Prayer Times',
                fr: 'Politique de confidentialité — Heures de Prière',
                tr: 'Gizlilik Politikası — Namaz Vakitleri',
                ur: 'پرائیویسی پالیسی — اوقاتِ نماز',
                de: 'Datenschutzerklärung — Gebetszeiten',
                id: 'Kebijakan Privasi — Jadwal Sholat',
                es: 'Política de Privacidad — Horarios de Oración',
                bn: 'গোপনীয়তা নীতি — নামাজের সময়সূচী',
                ms: 'Dasar Privasi — Waktu Solat',
            },
            desc: {
                ar: 'سياسة خصوصية الموقع: ما البيانات التي نجمعها (الموقع، اللغة)، استخدام ملفات تعريف الارتباط، الخدمات الخارجية، وحقوقك في بياناتك.',
                en: 'Our privacy policy explains what data we collect (location, language preference), how cookies are used, third-party services, and your data rights.',
                fr: 'Notre politique de confidentialité explique quelles données nous collectons (localisation, langue), l\u2019utilisation des cookies, les services tiers et vos droits.',
                tr: 'Gizlilik politikamız: hangi verileri topladığımız (konum, dil), çerezlerin nasıl kullanıldığı, üçüncü taraf hizmetler ve veri haklarınız.',
                ur: 'ہماری پرائیویسی پالیسی: ہم کون سا ڈیٹا جمع کرتے ہیں (مقام، زبان)، کوکیز کا استعمال، تیسرے فریق کی خدمات، اور آپ کے ڈیٹا کے حقوق۔',
                de: 'Unsere Datenschutzerklärung erläutert, welche Daten wir erheben (Standort, Spracheinstellung), die Verwendung von Cookies, Dienste Dritter und Ihre Datenrechte.',
                id: 'Kebijakan privasi situs: data apa yang kami kumpulkan (lokasi, bahasa), penggunaan cookie, layanan pihak ketiga, dan hak Anda atas data Anda.',
                es: 'Nuestra política de privacidad: qué datos recopilamos (ubicación, idioma), uso de cookies, servicios de terceros y sus derechos sobre los datos.',
                bn: 'আমাদের গোপনীয়তা নীতি: আমরা কোন ডেটা সংগ্রহ করি (অবস্থান, ভাষা), কুকিজের ব্যবহার, তৃতীয় পক্ষের সেবা এবং আপনার ডেটার অধিকার।',
                ms: 'Dasar privasi kami: data yang kami kumpulkan (lokasi, bahasa), penggunaan kuki, perkhidmatan pihak ketiga, dan hak anda atas data.',
            },
            ogType: 'article',
        },
        '/terms': {
            title: {
                ar: 'شروط الاستخدام — مواقيت الصلاة',
                en: 'Terms of Use — Prayer Times',
                fr: 'Conditions d\u2019utilisation — Heures de Prière',
                tr: 'Kullanım Şartları — Namaz Vakitleri',
                ur: 'شرائط استعمال — اوقاتِ نماز',
                de: 'Nutzungsbedingungen — Gebetszeiten',
                id: 'Syarat Penggunaan — Jadwal Sholat',
                es: 'Términos de Uso — Horarios de Oración',
                bn: 'ব্যবহারের শর্তাবলী — নামাজের সময়সূচী',
                ms: 'Terma Penggunaan — Waktu Solat',
            },
            desc: {
                ar: 'شروط استخدام موقع مواقيت الصلاة: وصف الخدمة، إخلاء المسؤولية عن الدقة، التزامات المستخدم، الملكية الفكرية وحدود المسؤولية.',
                en: 'Terms of use governing access to Prayer Times website: service description, accuracy disclaimer, user obligations, intellectual property and limitation of liability.',
                fr: 'Conditions régissant l\u2019accès au site Heures de Prière : description du service, avertissement sur l\u2019exactitude, obligations de l\u2019utilisateur, propriété intellectuelle et limitation de responsabilité.',
                tr: 'Namaz Vakitleri web sitesine erişimi düzenleyen kullanım şartları: hizmet tanımı, doğruluk sorumluluk reddi, kullanıcı yükümlülükleri, fikri mülkiyet ve sorumluluk sınırlaması.',
                ur: 'اوقاتِ نماز ویب سائٹ تک رسائی کو منظم کرنے والی شرائط استعمال: سروس کی تفصیل، درستگی سے دستبرداری، صارف کی ذمہ داریاں، املاک دانش اور ذمہ داری کی حد۔',
                de: 'Nutzungsbedingungen für den Zugriff auf die Gebetszeiten-Webseite: Dienstbeschreibung, Genauigkeitshinweis, Nutzerpflichten, geistiges Eigentum und Haftungsbeschränkung.',
                id: 'Syarat penggunaan yang mengatur akses ke situs Jadwal Sholat: deskripsi layanan, penafian keakuratan, kewajiban pengguna, kekayaan intelektual dan batasan tanggung jawab.',
                es: 'Términos que rigen el acceso al sitio Horarios de Oración: descripción del servicio, aviso de precisión, obligaciones del usuario, propiedad intelectual y limitación de responsabilidad.',
                bn: 'নামাজের সময়সূচী ওয়েবসাইটে প্রবেশের শর্তাবলী: সেবার বিবরণ, নির্ভুলতার দাবিত্যাগ, ব্যবহারকারীর বাধ্যবাধকতা, মেধাস্বত্ব ও দায়বদ্ধতার সীমা।',
                ms: 'Terma yang mengawal akses ke laman Waktu Solat: penerangan perkhidmatan, penafian ketepatan, obligasi pengguna, harta intelek dan had liabiliti.',
            },
            ogType: 'article',
        },
        '/contact': {
            title: {
                ar: 'اتصل بنا — مواقيت الصلاة',
                en: 'Contact Us — Prayer Times',
                fr: 'Contact — Heures de Prière',
                tr: 'İletişim — Namaz Vakitleri',
                ur: 'ہم سے رابطہ کریں — اوقاتِ نماز',
                de: 'Kontakt — Gebetszeiten',
                id: 'Hubungi Kami — Jadwal Sholat',
                es: 'Contáctenos — Horarios de Oración',
                bn: 'যোগাযোগ করুন — নামাজের সময়সূচী',
                ms: 'Hubungi Kami — Waktu Solat',
            },
            desc: {
                ar: 'تواصل مع فريق مواقيت الصلاة للدعم، الاقتراحات، الشراكات أو للإبلاغ عن مواقيت غير دقيقة في مدينتك.',
                en: 'Get in touch with the Prayer Times team for support, feedback, partnership inquiries or to report inaccurate prayer times in your city.',
                fr: 'Contactez l\u2019équipe Heures de Prière pour le support, les retours, les partenariats ou signaler des heures de prière inexactes dans votre ville.',
                tr: 'Destek, geri bildirim, ortaklık soruları veya şehrinizdeki yanlış namaz vakitlerini bildirmek için Namaz Vakitleri ekibiyle iletişime geçin.',
                ur: 'سپورٹ، تاثرات، شراکت داری کی پوچھ گچھ یا اپنے شہر میں غلط نماز کے اوقات کی اطلاع کے لیے اوقاتِ نماز ٹیم سے رابطہ کریں۔',
                de: 'Kontaktieren Sie das Gebetszeiten-Team für Support, Feedback, Partnerschaftsanfragen oder um ungenaue Gebetszeiten in Ihrer Stadt zu melden.',
                id: 'Hubungi tim Jadwal Sholat untuk dukungan, masukan, pertanyaan kemitraan, atau untuk melaporkan jadwal sholat yang tidak akurat di kota Anda.',
                es: 'Póngase en contacto con el equipo de Horarios de Oración para soporte, comentarios, consultas de asociación o reportar horarios inexactos en su ciudad.',
                bn: 'সহায়তা, মতামত, অংশীদারিত্বের প্রশ্ন বা আপনার শহরে ভুল নামাজের সময় রিপোর্ট করতে নামাজের সময়সূচী দলের সাথে যোগাযোগ করুন।',
                ms: 'Hubungi pasukan Waktu Solat untuk sokongan, maklum balas, pertanyaan perkongsian atau untuk melaporkan waktu solat tidak tepat di bandar anda.',
            },
            ogType: 'article',
        },
        '/about-us': {
            title: {
                ar: 'عن موقع مواقيت الصلاة — رسالتنا',
                en: 'About Prayer Times — Our Mission',
                fr: 'À propos d\u2019Heures de Prière — Notre mission',
                tr: 'Namaz Vakitleri Hakkında — Misyonumuz',
                ur: 'اوقاتِ نماز کے بارے میں — ہمارا مشن',
                de: 'Über Gebetszeiten — Unsere Mission',
                id: 'Tentang Jadwal Sholat — Misi Kami',
                es: 'Sobre Horarios de Oración — Nuestra Misión',
                bn: 'নামাজের সময়সূচী সম্পর্কে — আমাদের মিশন',
                ms: 'Tentang Waktu Solat — Misi Kami',
            },
            desc: {
                ar: 'تعرّف على موقع مواقيت الصلاة: رسالتنا في توفير مواقيت صلاة دقيقة، تقويم هجري، اتجاه قبلة وأدعية مجاناً للمسلمين حول العالم.',
                en: 'Learn about Prayer Times: our mission to provide accurate Islamic prayer schedules, Hijri calendar, Qibla direction and duas freely to Muslims worldwide.',
                fr: 'Découvrez Heures de Prière : notre mission de fournir gratuitement des horaires de prière précis, un calendrier hégirien, la direction de la Qibla et des invocations aux musulmans du monde entier.',
                tr: 'Namaz Vakitleri hakkında bilgi edinin: dünya çapındaki Müslümanlara doğru namaz vakitleri, Hicri takvim, Kıble yönü ve duaları ücretsiz sunma misyonumuz.',
                ur: 'اوقاتِ نماز کے بارے میں جانیں: دنیا بھر کے مسلمانوں کو درست نماز کے اوقات، ہجری کیلنڈر، قبلہ کی سمت اور دعائیں مفت فراہم کرنے کا ہمارا مشن۔',
                de: 'Erfahren Sie mehr über Gebetszeiten: unsere Mission, Muslimen weltweit präzise Gebetspläne, Hidschri-Kalender, Qibla-Richtung und Duas kostenlos anzubieten.',
                id: 'Pelajari tentang Jadwal Sholat: misi kami menyediakan jadwal sholat yang akurat, kalender Hijriah, arah kiblat, dan doa secara gratis untuk Muslim di seluruh dunia.',
                es: 'Conozca Horarios de Oración: nuestra misión de proporcionar gratuitamente horarios de oración precisos, calendario Hijri, dirección de la Qibla y duas a los musulmanes de todo el mundo.',
                bn: 'নামাজের সময়সূচী সম্পর্কে জানুন: বিশ্বের মুসলিমদের বিনামূল্যে সঠিক নামাজের সময়, হিজরি ক্যালেন্ডার, কিবলার দিক এবং দোয়া প্রদানের আমাদের মিশন।',
                ms: 'Ketahui tentang Waktu Solat: misi kami menyediakan jadual solat tepat, kalendar Hijrah, arah Kiblat dan doa secara percuma kepada umat Islam di seluruh dunia.',
            },
            ogType: 'article',
        },
    };

    if (staticPages[corePath]) {
        const sp = staticPages[corePath];
        // يدعم شكلين: مصفوفة [en, ar] (قديم) أو كائن {ar, en, fr, tr, ur} (جديد)
        const _pickField = (fld) => {
            const v = sp[fld];
            if (!v) return '';
            if (Array.isArray(v)) return (lang === 'ar') ? v[1] : v[0];
            return v[lang] || v.en || v.ar || '';
        };
        title = _pickField('title');
        description = _pickField('desc');
        if (sp.ogType) ogType = sp.ogType;
        if (sp.app) webApp = { name: title, url: canonical, category: sp.app.category };
        if (sp.moonFaq) moonFaq = true;
        if (sp.zakatFaq) zakatFaq = true;
        breadcrumbs.push({ name: title, item: canonical });
    }

    // ===== Round 11: /today-hijri-date canonical → /hijri-date/YYYY-MM-DD =====
    //   الصفحة UX dynamic. الـ canonical الرسميّة هي الصفحة الثابتة لليوم الحاليّ.
    //   هذا يمنع duplicate content ويوجّه Google إلى صفحة الـ SEO.
    //   نستبدل أيضاً عنصر الـ breadcrumb الأخير ليُطابق الـ canonical الجديد.
    // flag: عندما نُغيّر canonical قصداً (لا بسبب خلل build)،
    // نخبر renderSeoHeadHtml ألّا يُضيف hreflang fallback إضافيّ (يمنع duplicate).
    let _canonicalOverride = false;
    if (corePath === '/today-hijri-date') {
        const _pad2Today = n => String(n).padStart(2, '0');
        const _hToday = _hijriNow();
        const _langPrefix = (lang === 'ar') ? '' : ('/' + lang);
        canonical = origin + _langPrefix + `/hijri-date/${_hToday.year}-${_pad2Today(_hToday.month)}-${_pad2Today(_hToday.day)}`;
        _canonicalOverride = true;
        // حدِّث آخر breadcrumb (title push من static pages) ليُشير للـ canonical الجديد
        if (breadcrumbs.length > 0) {
            breadcrumbs[breadcrumbs.length - 1].item = canonical;
        }
    }

    // للصفحات الديناميكية: استخدم النص الإنجليزي لـ EN/FR/TR/UR (احتياط) والعربي لـ AR فقط
    const useEnTxt = (lang !== 'ar');

    // ── City pages: /prayer-times-in-{slug}-{lat}-{lng} ──
    let m = corePath.match(/^\/prayer-times-in-(.+?)-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
    if (m) {
        const citySlug = m[1];
        const lat = parseFloat(m[2]);
        const lng = parseFloat(m[3]);
        // Round 8B+C: اسم المدينة بلغة الواجهة (flagship ×10، والباقي AR عبر cities-*.json)
        const cityDisplay = _resolveCityName(citySlug, lang);
        // Round 8: Title مُثرى بالتاريخ الهجري بتوقيت المدينة المحلّيّ — 10 لغات
        // "مواقيت الصلاة في {city} اليوم - {h} {hijri-month} {YYYY}هـ"
        title = _buildCityDatedTitle(cityDisplay, lng);
        description = useEnTxt
            ? `Accurate Islamic prayer times for ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha, Qibla direction, today's Hijri date and weekly schedule.`
            : `مواقيت الصلاة الدقيقة في ${cityDisplay}: الفجر، الظهر، العصر، المغرب، العشاء، اتجاه القبلة، التاريخ الهجري والجدول الأسبوعي.`;
        ogType = 'article';
        geo = { lat, lng };
        cityModified = new Date().toISOString();
        breadcrumbs.push({ name: cityDisplay, item: canonical });
    }

    // ── 🆕 Time-Left pages (Polish Round F): /time-left-until-prayer-in-{slug} ──
    // صفحة SSR مستقلّة تُركّز على countdown + CTA، تُشارك نفس منطق SSR لصفحة المدينة
    // (يُعامَل الـ slug كمدينة في cityMatchSsr لاحقاً، لكن H1/title/description يختلفون).
    let timeLeftPage = null;
    const _tlMatch = corePath.match(/^\/time-left-until-prayer-in-([a-z][a-z0-9-]+)$/);
    if (_tlMatch) {
        const _tlSlug = _tlMatch[1];
        const _tlCityDisplay = (typeof _resolveCityName === 'function')
            ? (_resolveCityName(_tlSlug, lang) || _slugToTitle(_tlSlug))
            : _slugToTitle(_tlSlug);
        const _TL_TITLE = {
            ar: `كم باقي على الصلاة القادمة في ${_tlCityDisplay}؟ — جدول اليوم`,
            en: `Time Left Until Next Prayer in ${_tlCityDisplay} — Today's Schedule`,
            fr: `Temps restant avant la prochaine prière à ${_tlCityDisplay}`,
            tr: `${_tlCityDisplay} için bir sonraki namaza kalan süre`,
            ur: `${_tlCityDisplay} میں اگلی نماز تک کتنا وقت باقی ہے؟`,
            de: `Verbleibende Zeit bis zum nächsten Gebet in ${_tlCityDisplay}`,
            id: `Waktu Tersisa Menjelang Sholat di ${_tlCityDisplay}`,
            es: `Tiempo restante para la próxima oración en ${_tlCityDisplay}`,
            bn: `${_tlCityDisplay}-এ পরবর্তী নামাজ পর্যন্ত কত সময় বাকি?`,
            ms: `Masa Tinggal Sebelum Solat Seterusnya di ${_tlCityDisplay}`,
        };
        const _TL_DESC = {
            ar: `العدّ التنازليّ الحيّ للصلاة القادمة في ${_tlCityDisplay}، مع اسم الصلاة، الوقت الحاليّ، والجدول اليوميّ الكامل (الفجر، الظهر، العصر، المغرب، العشاء).`,
            en: `Live countdown to the next prayer in ${_tlCityDisplay} with prayer name, current time, and today's full schedule (Fajr, Dhuhr, Asr, Maghrib, Isha).`,
            fr: `Compte à rebours en direct jusqu'à la prochaine prière à ${_tlCityDisplay}, avec le nom de la prière, l'heure actuelle et le programme du jour.`,
            tr: `${_tlCityDisplay} için bir sonraki namaza canlı geri sayım — namaz adı, mevcut saat ve günün tam programı.`,
            ur: `${_tlCityDisplay} میں اگلی نماز تک براہِ راست ٹائمر — نماز کا نام، موجودہ وقت، اور آج کا مکمل شیڈول۔`,
            de: `Live-Countdown bis zum nächsten Gebet in ${_tlCityDisplay} mit Gebetsname, aktueller Uhrzeit und dem vollständigen Tagesplan.`,
            id: `Hitung mundur langsung menuju sholat berikutnya di ${_tlCityDisplay} dengan nama sholat, waktu sekarang, dan jadwal lengkap hari ini.`,
            es: `Cuenta regresiva en vivo hasta la próxima oración en ${_tlCityDisplay}, con el nombre de la oración, la hora actual y el horario completo de hoy.`,
            bn: `${_tlCityDisplay}-এ পরবর্তী নামাজ পর্যন্ত লাইভ কাউন্টডাউন — নামাজের নাম, বর্তমান সময়, এবং আজকের সম্পূর্ণ সময়সূচি।`,
            ms: `Kira undur langsung sehingga solat seterusnya di ${_tlCityDisplay} dengan nama solat, waktu semasa, dan jadual penuh hari ini.`,
        };
        title = _TL_TITLE[lang] || _TL_TITLE.en;
        description = _TL_DESC[lang] || _TL_DESC.en;
        ogType = 'article';
        cityModified = new Date().toISOString();
        breadcrumbs.push({ name: _tlCityDisplay, item: canonical });
        timeLeftPage = { slug: _tlSlug, cityName: _tlCityDisplay };
    }

    // ── 🆕 Round 4 (Minimal): Next-Prayer-Time pages: /next-prayer-time-in-{slug} ──
    //     Schedule Awareness (ليس countdown) — يعرض الصلاة القادمة + 3 صلوات تالية.
    //     هويّة مختلفة تماماً عن time-left لتجنّب duplicate content.
    //     R-4: Title CTR boost — "(Exact Time & Next Prayers)" / "(الوقت الدقيق + الصلوات التالية)"
    let nextPrayerPage = null;
    const _nptMatch = corePath.match(/^\/next-prayer-time-in-([a-z][a-z0-9-]+)$/);
    if (_nptMatch) {
        const _nptSlug = _nptMatch[1];
        const _nptCityDisplay = (typeof _resolveCityName === 'function')
            ? (_resolveCityName(_nptSlug, lang) || _slugToTitle(_nptSlug))
            : _slugToTitle(_nptSlug);
        const _NPT_TITLE = {
            ar: `الصلاة القادمة في ${_nptCityDisplay} اليوم (الوقت الدقيق + الصلوات التالية) | Prayer Times`,
            en: `Next Prayer Time in ${_nptCityDisplay} Today (Exact Time & Next Prayers) | Prayer Times`,
            fr: `Prochaine Prière à ${_nptCityDisplay} Aujourd'hui (Heure Exacte + Prières Suivantes) | Prayer Times`,
            tr: `Bugün ${_nptCityDisplay} Bir Sonraki Namaz Vakti (Kesin Saat + Sonraki Namazlar) | Prayer Times`,
            ur: `آج ${_nptCityDisplay} میں اگلی نماز کا وقت (درست وقت + اگلی نمازیں) | Prayer Times`,
            de: `Nächstes Gebet in ${_nptCityDisplay} Heute (Genaue Zeit + Nächste Gebete) | Prayer Times`,
            id: `Waktu Sholat Berikutnya di ${_nptCityDisplay} Hari Ini (Waktu Tepat + Sholat Selanjutnya) | Prayer Times`,
            es: `Próxima Oración en ${_nptCityDisplay} Hoy (Hora Exacta + Próximas Oraciones) | Prayer Times`,
            bn: `আজ ${_nptCityDisplay}-এ পরবর্তী নামাজের সময় (সঠিক সময় + পরবর্তী নামাজসমূহ) | Prayer Times`,
            ms: `Solat Seterusnya di ${_nptCityDisplay} Hari Ini (Masa Tepat + Solat Seterusnya) | Prayer Times`,
        };
        const _NPT_DESC = {
            ar: `تعرف على الصلاة القادمة في ${_nptCityDisplay} اليوم مع موعدها الدقيق والصلوات الثلاث التي تليها في جدول مرتّب.`,
            en: `Find out the next prayer time in ${_nptCityDisplay} today with its exact time and the following three prayers in a clean schedule.`,
            fr: `Découvrez la prochaine prière à ${_nptCityDisplay} aujourd'hui avec son heure exacte et les trois prières suivantes dans un emploi du temps clair.`,
            tr: `${_nptCityDisplay} için bugünkü bir sonraki namazın kesin saatini ve onu takip eden üç namazı düzenli bir programda görün.`,
            ur: `${_nptCityDisplay} میں آج کی اگلی نماز کا درست وقت اور اس کے بعد کی تین نمازیں ایک صاف شیڈول میں جانیں۔`,
            de: `Erfahren Sie die nächste Gebetszeit in ${_nptCityDisplay} heute mit der genauen Uhrzeit und den drei folgenden Gebeten in einem klaren Zeitplan.`,
            id: `Ketahui sholat berikutnya di ${_nptCityDisplay} hari ini dengan waktu tepatnya dan tiga sholat berikutnya dalam jadwal yang rapi.`,
            es: `Descubre la próxima oración en ${_nptCityDisplay} hoy con su hora exacta y las tres oraciones siguientes en un horario claro.`,
            bn: `${_nptCityDisplay}-এ আজকের পরবর্তী নামাজের সঠিক সময় এবং তারপরের তিনটি নামাজ একটি পরিষ্কার সময়সূচিতে জানুন।`,
            ms: `Ketahui solat seterusnya di ${_nptCityDisplay} hari ini dengan masa tepatnya dan tiga solat seterusnya dalam jadual yang kemas.`,
        };
        title = _NPT_TITLE[lang] || _NPT_TITLE.en;
        description = _NPT_DESC[lang] || _NPT_DESC.en;
        ogType = 'article';
        cityModified = new Date().toISOString();
        breadcrumbs.push({ name: _nptCityDisplay, item: canonical });
        nextPrayerPage = { slug: _nptSlug, cityName: _nptCityDisplay };
    }

    // ── Qibla city pages: /qibla-in-{slug} OR /qibla-in-{slug}-{lat}-{lng} ──
    //   Clean form (no coords) is the canonical shape — resolve lat/lng from the shared
    //   slug index (FAMOUS_CITY_OVERRIDES + db/cities-*.json via _resolveCityForMoon).
    //   Coord form preserved for backward compatibility with any legacy bookmarks.
    m = corePath.match(/^\/qibla-in-(.+?)-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
    if (!m) {
        // UAT-Q5f: include `.` in slug character class for loc-XX.X-YY.Y
        const mClean = corePath.match(/^\/qibla-in-([a-z][a-z0-9.-]+)$/);
        if (mClean) {
            const _cleanSlug = mClean[1];
            const _res = (typeof _resolveCityForMoon === 'function')
                ? _resolveCityForMoon(_cleanSlug)
                : (FAMOUS_CITY_OVERRIDES[_cleanSlug] || null);
            if (_res && typeof _res.lat === 'number' && typeof _res.lng === 'number') {
                m = [corePath, _cleanSlug, String(_res.lat), String(_res.lng)];
            }
        }
    }
    if (m) {
        const citySlug = m[1];
        const lat = parseFloat(m[2]);
        const lng = parseFloat(m[3]);
        const cityDisplay = (typeof _resolveCityName === 'function')
            ? (_resolveCityName(citySlug, lang) || _slugToTitle(citySlug))
            : _slugToTitle(citySlug);
        // Phase D2: extend short titles per language with separator + descriptor
        const _qTitles = {
            ar: `اتجاه القبلة في ${cityDisplay} | البوصلة والمسافة إلى الكعبة`,
            en: `Qibla Direction in ${cityDisplay} | Compass and Distance`,
            fr: `Direction de la Qibla à ${cityDisplay} | Boussole et distance`,
            tr: `${cityDisplay} Kıble Yönü | Kâbe Pusulası ve Uzaklık`,
            ur: `${cityDisplay} سے سمتِ قبلہ | قطب نما اور فاصلہ`,
            de: `Qibla-Richtung in ${cityDisplay} | Kompass und Entfernung`,
            id: `Arah Kiblat di ${cityDisplay} | Kompas dan Jarak ke Kakbah`,
            es: `Dirección de la Qibla en ${cityDisplay} | Brújula y distancia`,
            bn: `${cityDisplay} থেকে কিবলার দিক | কম্পাস ও দূরত্ব`,
            ms: `Arah Kiblat di ${cityDisplay} | Kompas dan Jarak ke Kaabah`,
        };
        const _qDescs = {
            ar: `اتجاه القبلة الدقيق من ${cityDisplay} إلى الكعبة المشرفة، مع الزاوية والمسافة وبوصلة تفاعلية.`,
            en: `Accurate Qibla direction from ${cityDisplay} with bearing, distance to the Kaaba and an interactive compass.`,
            fr: `Direction précise de la Qibla depuis ${cityDisplay} avec azimut, distance à la Kaaba et boussole interactive.`,
            tr: `${cityDisplay} şehrinden doğru kıble yönü: açı, Kâbe\u2019ye uzaklık ve etkileşimli pusula.`,
            ur: `${cityDisplay} سے قبلہ کی درست سمت، زاویہ، کعبہ تک فاصلہ اور انٹرایکٹو قطب نما کے ساتھ۔`,
            de: `Präzise Qibla-Richtung von ${cityDisplay} mit Peilung, Entfernung zur Kaaba und interaktivem Kompass.`,
            id: `Arah kiblat akurat dari ${cityDisplay} dengan sudut, jarak ke Kakbah, dan kompas interaktif.`,
            es: `Dirección precisa de la Qibla desde ${cityDisplay} con rumbo, distancia a la Kaaba y brújula interactiva.`,
            bn: `${cityDisplay} থেকে কিবলার সঠিক দিক—কোণ, কাবা পর্যন্ত দূরত্ব এবং ইন্টারঅ্যাকটিভ কম্পাস।`,
            ms: `Arah kiblat tepat dari ${cityDisplay} dengan sudut, jarak ke Kaabah dan kompas interaktif.`,
        };
        title = _qTitles[lang] || _qTitles.en;
        description = _qDescs[lang] || _qDescs.en;
        ogType = 'website';
        geo = { lat, lng };
        cityModified = new Date().toISOString();
        // Multilingual name table for client hydration (window.__QIBLA_CITY__).
        // Resolves each lang via _resolveCityName → POPULAR_CITY_NAMES → cities-DB Arabic → title-cased slug.
        const _qNames = {};
        try {
            ['ar','en','fr','tr','ur','de','id','es','bn','ms'].forEach(L => {
                _qNames[L] = _resolveCityName(citySlug, L);
            });
            // Pull English base name from cities-DB when available (preferred over Title-casing).
            const _idx = _getCitySlugIndex();
            const _dbEntry = _idx && _idx[citySlug];
            if (_dbEntry && _dbEntry.nameAr && !_qNames.ar) _qNames.ar = _dbEntry.nameAr;
        } catch (_e) { /* silent */ }
        // Also include the canonical English name from the DB (via cities-*.json) so the
        // client can regenerate a stable slug or show proper English fallbacks.
        let _dbNameEn = '';
        try {
            const files = fs.readdirSync(DB_DIR).filter(f => /^cities-[a-z]{2}\.json$/.test(f));
            for (const f of files) {
                try {
                    const arr = JSON.parse(fs.readFileSync(path.join(DB_DIR, f), 'utf8'));
                    if (!Array.isArray(arr)) continue;
                    for (const c of arr) {
                        if (c && c.nameEn && typeof c.lat === 'number' && typeof c.lng === 'number') {
                            if (makeCitySlugSrv(c.nameEn, c.lat, c.lng) === citySlug) {
                                _dbNameEn = c.nameEn;
                                break;
                            }
                        }
                    }
                } catch (_e) {}
                if (_dbNameEn) break;
            }
        } catch (_e) { /* silent */ }
        qiblaRef = { cityName: cityDisplay, lat, lng, slug: citySlug, names: _qNames, englishName: _dbNameEn || cityDisplay };
        // Add hub to breadcrumb chain before city (Home › Qibla › {City})
        const _qHubUrls = {
            ar: origin + '/qibla', en: origin + '/en/qibla', fr: origin + '/fr/qibla',
            tr: origin + '/tr/qibla', ur: origin + '/ur/qibla', de: origin + '/de/qibla',
            id: origin + '/id/qibla', es: origin + '/es/qibla', bn: origin + '/bn/qibla',
            ms: origin + '/ms/qibla',
        };
        const _qHubLabels = {
            ar: 'اتجاه القبلة', en: 'Qibla Direction', fr: 'Direction de la Qibla',
            tr: 'Kıble Yönü', ur: 'سمتِ قبلہ', de: 'Qibla-Richtung',
            id: 'Arah Kiblat', es: 'Dirección de la Qibla', bn: 'কিবলার দিক',
            ms: 'Arah Kiblat',
        };
        breadcrumbs.push({ name: _qHubLabels[lang] || _qHubLabels.en, item: _qHubUrls[lang] || _qHubUrls.en });
        breadcrumbs.push({ name: cityDisplay, item: canonical });
    }

    // ── About city pages: REMOVED in Phase D2.1 (now 410 Gone) ──

    // ── Moon city pages (Round 15 + Round 16): فصل الـ URLs — clean split ──
    //   /moon-today-in-{slug}[-{lat}-{lng}]                → صفحة اليوم (today only)
    //   /moon-in-{slug}[-{lat}-{lng}]                       → صفحة المدينة (hub — Round 16)
    //   /moon-in-{slug}[-{lat}-{lng}]/{YYYY-MM-DD}         → صفحة مؤرَّخة (ميلاديّ)
    //   /moon-in-{slug}[-{lat}-{lng}]/{HYYYY-HMM-HDD}      → صفحة مؤرَّخة (هجريّ، canonical→ميلاديّ)
    //
    // Round 12: coord-suffix عالميّ (مثل /moon-today-in-del-rio-29.36--100.90) — يبقى مدعوماً.
    // جميع الأنماط تدعم coord-suffix. Regex: slug غير جشع ثمّ lat/lng اختياريّان.
    // UAT-Q5f: include `.` in slug character class for loc-XX.X-YY.Y format.
    const _MT = corePath.match(/^\/moon-today-in-([a-z][a-z0-9.-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/);
    const _MD = corePath.match(/^\/moon-in-([a-z][a-z0-9.-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?\/(\d{4})-(\d{2})-(\d{2})$/);
    // UAT-Moon-Hub-Month: month page /moon-in-{slug}[-{lat}-{lng}]/YYYY-MM
    //   Year ≥ 1800 to avoid colliding with Hijri-day URLs (which have YYYY < 1800
    //   in HYYY-HMM-HDD format and would match _MD instead anyway, but defensive).
    const _MM = (!_MD) ? corePath.match(
        /^\/moon-in-([a-z][a-z0-9.-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?\/(\d{4})-(\d{2})$/
    ) : null;
    const _isMoonMonthMatch = !!(_MM && parseInt(_MM[4], 10) >= 1800);
    // Round 16: hub match — /moon-in-{slug}[-{lat}-{lng}] بلا تاريخ. يُفحَص أخيراً لأنّ _MD/_MM أوّلاً.
    const _MH = (!_MD && !_isMoonMonthMatch) ? corePath.match(/^\/moon-in-([a-z][a-z0-9.-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/) : null;
    m = _MT || _MD || (_isMoonMonthMatch ? _MM : null) || _MH;
    // flag: هل الـ URL الحاليّ hub page (بلا تاريخ، تحت /moon-in-)؟
    const _isMoonHubPage = !!_MH && !_MD && !_MT && !_isMoonMonthMatch;
    // flag: هل الـ URL الحاليّ month page؟
    const _isMoonMonthPage = _isMoonMonthMatch;
    const _moonMonthYear  = _isMoonMonthMatch ? parseInt(_MM[4], 10) : null;
    const _moonMonthMonth = _isMoonMonthMatch ? parseInt(_MM[5], 10) : null;
    if (m) {
        const citySlug = m[1];
        const _coordLat = m[2] != null ? parseFloat(m[2]) : null;
        const _coordLng = m[3] != null ? parseFloat(m[3]) : null;
        const _hasCoordSuffix = (_coordLat != null && _coordLng != null && isFinite(_coordLat) && isFinite(_coordLng));
        // التاريخ موجود فقط في _MD (المواضع 4/5/6). لـ _MT/_MH: null.
        const _dyStr = (_MD && m[4]) ? m[4] : null;
        const _dmStr = (_MD && m[5]) ? m[5] : null;
        const _ddStr = (_MD && m[6]) ? m[6] : null;
        // استرجاع إحداثيّات المدينة: أولويّة للـ DB (SEO)، ثمّ coord-suffix (fallback).
        // UAT-Moon-5: عندما الـ slug غير معروف ولا توجد coord-suffix (مثل
        //   /moon-today-in-yastrebovka بدون إحداثيّات)، استعمل إحداثيّات
        //   مكّة كـ SSR fallback مع noindex. الصفحة تَرسم 200 مع slug-as-
        //   title (Yastrebovka)، والعميل سيُحدّث الـ rise/set times من
        //   sessionStorage.city_moon لإحداثيّات المستخدم الحقيقيّة.
        let cityGeo = _resolveCityForMoon(citySlug);
        const _moonResolvedFromDb = !!cityGeo;
        if (!cityGeo && _hasCoordSuffix) {
            cityGeo = { lat: _coordLat, lng: _coordLng, cc: '' };
        } else if (!cityGeo) {
            // No DB hit, no coord-suffix → fallback to Mecca for SSR.
            cityGeo = { lat: 21.4225, lng: 39.8262, cc: '' };
        }
        // لو كانت المدينة معروفة من الـ DB وهي متاحة عبر coord-suffix، نضع علامة
        // ليرسل الراوتر 301 redirect إلى الرابط القصير لاحقاً.
        const _shouldRedirectToCanonical = _hasCoordSuffix && _moonResolvedFromDb;
        // إشارة للراوتر: الصفحة noindex إذا كانت غير-DB (سواء coord-only أو slug-only fallback).
        const _isCoordOnlyMoon = !_moonResolvedFromDb;
        // ── تحليل التاريخ إن وُجد ──
        // ندعم شكلين: ميلاديّ (YYYY-MM-DD حيث YYYY≥1800) وهجريّ (HYYYY-HMM-HDD حيث HYYYY<1800).
        // بالنسبة للتطبيق لا تداخل بين النطاقين (Hijri ≈ 1300-1600، Gregorian ≥ 1900).
        // عند التاريخ الهجريّ → نحوّله إلى الميلاديّ ونُعيد URL الـ canonical إلى الصيغة الميلاديّة.
        let _moonDateIso = null;        // 'YYYY-MM-DD' — null يعني صفحة اليوم
        let _moonDateObj = null;        // Date object للتاريخ المحدَّد
        let _moonDateInRange = true;    // true عندما التاريخ ضمن [today-30, today+90]
        let _moonDateWasHijri = false;  // لإرسال 301 redirect إلى الصيغة الميلاديّة canonical
        if (_dyStr) {
            let _dy = parseInt(_dyStr, 10);
            let _dm = parseInt(_dmStr, 10);
            let _dd = parseInt(_ddStr, 10);
            // إن كانت السنة < 1800 → تاريخ هجريّ، نحوّله إلى ميلاديّ
            if (_dy > 0 && _dy < 1800 && _dm >= 1 && _dm <= 12 && _dd >= 1 && _dd <= 31) {
                try {
                    const _g = _hijriToGregorian(_dy, _dm, _dd);
                    if (_g && _g.year && _g.month && _g.day) {
                        _moonDateWasHijri = true;
                        _dy = _g.year; _dm = _g.month; _dd = _g.day;
                    } else {
                        _moonDateInRange = false;
                    }
                } catch (_e) { _moonDateInRange = false; }
            }
            // صحّة التقويم: Date.UTC يعيد NaN أو يصحّح الأرقام؛ نتحقّق بإعادة المقارنة
            if (_moonDateInRange && _dm >= 1 && _dm <= 12 && _dd >= 1 && _dd <= 31) {
                const _testUtc = Date.UTC(_dy, _dm - 1, _dd);
                const _test = new Date(_testUtc);
                if (_test.getUTCFullYear() === _dy && _test.getUTCMonth() === (_dm - 1) && _test.getUTCDate() === _dd) {
                    _moonDateObj = _test;
                    const _pad2 = (n) => (n < 10 ? '0' + n : String(n));
                    _moonDateIso = _dy + '-' + _pad2(_dm) + '-' + _pad2(_dd);
                    // نطاق: today − 30 إلى today + 90 بتوقيت UTC
                    const _todayUtc = new Date();
                    const _t0 = Date.UTC(_todayUtc.getUTCFullYear(), _todayUtc.getUTCMonth(), _todayUtc.getUTCDate());
                    const _diffDays = Math.round((_testUtc - _t0) / 86400000);
                    if (_diffDays < -30 || _diffDays > 90) {
                        _moonDateInRange = false;
                    }
                } else {
                    // تاريخ غير صالح (مثل 2026-02-30) → نعيد kind 404 عبر ترك الـ match بدون تعديل
                    // لكن بما أنّ slug مقبول، نترك الصفحة تفتح مع التاريخ كـ out-of-range (noindex)
                    _moonDateInRange = false;
                }
            } else if (_moonDateInRange) {
                _moonDateInRange = false;
            }
        }
        if (cityGeo) {
            const cityDisplay = _resolveCityName(citySlug, lang);
            // ── توليد سلسلة تاريخ مقروءة لكلّ لغة ── (مثل: "19 أبريل 2026" / "19 April 2026")
            let _moonDateLabel = '';
            let _hijriLabel = '';          // "3 ذو القعدة 1447" (بلا لاحقة)
            let _hijriLabelWithSfx = '';   // "3 ذو القعدة 1447 هـ"
            if (_moonDateObj) {
                const _GMONTH_NAMES = {
                    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
                    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                    fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
                    tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
                    ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
                    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
                    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
                    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
                    bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
                    ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'],
                };
                const _mon = (_GMONTH_NAMES[lang] || _GMONTH_NAMES.en)[_moonDateObj.getUTCMonth()];
                _moonDateLabel = _moonDateObj.getUTCDate() + ' ' + _mon + ' ' + _moonDateObj.getUTCFullYear();

                // ── Hijri label (للعرض عندما كان URL هجريّاً) ──
                // Hijri month names في 10 لغات — من HIJRI_MONTHS_BY_LANG في js/app.js
                const _HMONTH_NAMES_L = {
                    ar: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
                    en: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab','Shaban','Ramadan','Shawwal','Dhu al-Qidah','Dhu al-Hijjah'],
                    fr: ['Mouharram','Safar','Rabi al-Awwal','Rabi al-Thani','Joumada al-Oula','Joumada al-Thania','Rajab','Chaabane','Ramadan','Chawwal','Dhou al-Qida','Dhou al-Hijja'],
                    tr: ['Muharrem','Safer','Rebiülevvel','Rebiülahir','Cemaziyelevvel','Cemaziyelahir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'],
                    ur: ['محرّم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذوالقعدہ','ذوالحجہ'],
                    de: ['Muharram','Safar','Rabīʿ al-awwal','Rabīʿ ath-thānī','Dschumādā l-ūlā','Dschumādā th-thāniya','Radschab','Schaʿbān','Ramadan','Schawwāl','Dhū l-qaʿda','Dhū l-hidscha'],
                    id: ['Muharram','Safar','Rabiul Awal','Rabiul Akhir','Jumadil Awal','Jumadil Akhir','Rajab','Syaban','Ramadan','Syawal','Zulkaidah','Zulhijah'],
                    es: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Yumada al-Awwal','Yumada al-Thani','Rayab','Shaabán','Ramadán','Shawwal','Du al-Qida','Du al-Hiyya'],
                    bn: ['মুহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'],
                    ms: ['Muharam','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah']
                };
                const _HIJRI_SFX = {
                    ar: ' هـ', en: ' AH', fr: ' H', tr: ' H', ur: ' ہجری',
                    de: ' AH', id: ' H', es: ' H', bn: ' হিজরি', ms: ' H'
                };
                try {
                    const _hj = _jdToHijri(_gregToJD(_moonDateObj.getUTCFullYear(), _moonDateObj.getUTCMonth() + 1, _moonDateObj.getUTCDate()));
                    const _hMon = (_HMONTH_NAMES_L[lang] || _HMONTH_NAMES_L.en)[_hj.month - 1];
                    _hijriLabel = _hj.day + ' ' + _hMon + ' ' + _hj.year;
                    _hijriLabelWithSfx = _hijriLabel + (_HIJRI_SFX[lang] || _HIJRI_SFX.en);
                } catch (_e) { /* keep blank */ }
            }

            // اختر "تسمية رئيسيّة" للتاريخ: هجريّ إن كان URL هجريّاً، وإلا ميلاديّ
            const _primaryDateLabel = _moonDateWasHijri && _hijriLabelWithSfx ? _hijriLabelWithSfx : _moonDateLabel;
            // ثانويّة (الموافق ...): العكس
            const _secondaryDateLabel = _moonDateWasHijri ? _moonDateLabel : _hijriLabelWithSfx;

            // "الموافق X" بكلّ لغة
            const _EQUIV = {
                ar: (d) => `الموافق ${d}`,
                en: (d) => `(equivalent to ${d})`,
                fr: (d) => `(équivalent au ${d})`,
                tr: (d) => `(${d} tarihine denk gelir)`,
                ur: (d) => `(${d} کے مطابق)`,
                de: (d) => `(entspricht ${d})`,
                id: (d) => `(bertepatan dengan ${d})`,
                es: (d) => `(equivalente al ${d})`,
                bn: (d) => `(${d} তারিখের সমতুল্য)`,
                ms: (d) => `(bersamaan ${d})`
            };
            const _equivFn = _EQUIV[lang] || _EQUIV.en;
            const _mainWithEquiv = _secondaryDateLabel
                ? (_primaryDateLabel + ' ' + _equivFn(_secondaryDateLabel))
                : _primaryDateLabel;

            // Title/Description — أربع حالات: hub (Round 16) / صفحة شهر (UAT-Moon-Hub-Month) / صفحة تاريخ محدَّد / صفحة اليوم
            let _moonTitle, _moonDesc;
            // ── UAT-Moon-Hub-Month: month-page month-name table (10 langs) ──
            const _gMonthFullByLangT = {
                ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
                en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
                tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
                ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
                de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
                id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
                es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
                bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
                ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']
            };
            const _mLst = _gMonthFullByLangT[lang] || _gMonthFullByLangT.en;
            const _mNameT = (_isMoonMonthPage && _moonMonthMonth) ? _mLst[_moonMonthMonth - 1] : '';
            const _mYearT = _isMoonMonthPage ? _moonMonthYear : '';
            if (_isMoonMonthPage) {
                // ── UAT-Moon-Hub-Month: صفحة الشهر — مثل hub لكن مخصَّصة لشهر محدَّد ──
                _moonTitle = {
                    ar: `تقويم القمر في ${cityDisplay} | ${_mNameT} ${_mYearT}`,
                    en: `Moon Calendar in ${cityDisplay} | ${_mNameT} ${_mYearT}`,
                    fr: `Calendrier lunaire à ${cityDisplay} | ${_mNameT} ${_mYearT}`,
                    tr: `${cityDisplay} Ay Takvimi | ${_mNameT} ${_mYearT}`,
                    ur: `${cityDisplay} چاند کیلنڈر | ${_mNameT} ${_mYearT}`,
                    de: `Mondkalender ${cityDisplay} | ${_mNameT} ${_mYearT}`,
                    id: `Kalender Bulan ${cityDisplay} | ${_mNameT} ${_mYearT}`,
                    es: `Calendario lunar en ${cityDisplay} | ${_mNameT} ${_mYearT}`,
                    bn: `${cityDisplay} চাঁদের ক্যালেন্ডার | ${_mNameT} ${_mYearT}`,
                    ms: `Kalendar Bulan ${cityDisplay} | ${_mNameT} ${_mYearT}`,
                };
                _moonDesc = {
                    ar: `تقويم القمر في ${cityDisplay} لشهر ${_mNameT} ${_mYearT}: طور القمر اليوميّ، نسبة الإضاءة، البدر والمحاق، رؤية الهلال، والتقويم الهجريّ المقابل.`,
                    en: `Moon calendar in ${cityDisplay} for ${_mNameT} ${_mYearT}: daily phase, illumination, full moon and new moon dates, hilal visibility, and matching Hijri calendar.`,
                    fr: `Calendrier lunaire à ${cityDisplay} pour ${_mNameT} ${_mYearT} : phase quotidienne, illumination, dates de pleine et nouvelle lune, visibilité du croissant et calendrier hégirien correspondant.`,
                    tr: `${cityDisplay} için ${_mNameT} ${_mYearT} ay takvimi: günlük evre, aydınlanma, dolunay ve yeni ay tarihleri, hilal görünürlüğü ve karşılık gelen hicri takvim.`,
                    ur: `${cityDisplay} میں ${_mNameT} ${_mYearT} کے لیے چاند کی تقویم: روزانہ طور، روشنی، بدر اور نئے چاند کی تاریخیں، ہلال کی رؤیت اور متعلقہ ہجری تقویم۔`,
                    de: `Mondkalender in ${cityDisplay} für ${_mNameT} ${_mYearT}: tägliche Phase, Beleuchtung, Vollmond- und Neumonddaten, Hilal-Sichtbarkeit und passender Hidschri-Kalender.`,
                    id: `Kalender bulan di ${cityDisplay} untuk ${_mNameT} ${_mYearT}: fase harian, iluminasi, tanggal purnama dan bulan baru, rukyat hilal, dan kalender Hijriah yang sesuai.`,
                    es: `Calendario lunar en ${cityDisplay} para ${_mNameT} ${_mYearT}: fase diaria, iluminación, fechas de luna llena y nueva, visibilidad del hilal y calendario hijri correspondiente.`,
                    bn: `${cityDisplay}-এ ${_mNameT} ${_mYearT}-এর জন্য চাঁদের ক্যালেন্ডার: দৈনিক দশা, আলোকসজ্জা, পূর্ণিমা ও অমাবস্যার তারিখ, হিলাল দৃশ্যমানতা এবং সংশ্লিষ্ট হিজরি ক্যালেন্ডার।`,
                    ms: `Kalendar bulan di ${cityDisplay} untuk ${_mNameT} ${_mYearT}: fasa harian, pencahayaan, tarikh bulan purnama dan anak bulan, rukyah hilal serta kalendar Hijrah yang sepadan.`,
                };
            } else if (_isMoonHubPage) {
                // ── Round 16: Hub للمدينة ── (evergreen، بلا "اليوم"، تجمع كلّ التواريخ كصفحة أمّ للمدينة)
                // Moon title templates cleanup (2026-05-01): trimmed all 10 langs to fit
                // SEOptimer's 50–60 char window even for medium-long city names. The
                // previous templates ran 60–71 chars for "الرياض" and 70–84 for
                // "المدينة المنورة". The new format keeps the city name + 1–2 keywords
                // ("Calendar", "Phases", "Hijri Dates") so the Hub remains visually
                // distinct from /moon-today-in-{city} (Today templates further down).
                // EN/ES/TR slightly expanded (vs. an earlier draft) to stay above ~45
                // chars and avoid the inverse "title could be longer" warning.
                // Phase M1 (2026-05-03): extended Title for /moon-in-{city} Hub.
                // Adds "الأطوار الشهرية" / "Monthly Lunar Stages" / etc. to flip
                // SEOptimer's "Title too short" warning — all 10 sit in 50-60 range.
                _moonTitle = {
                    ar: `تقويم القمر في ${cityDisplay} ومراحل القمر والأطوار الشهرية`,
                    en: `Moon Calendar in ${cityDisplay}: Phases & Monthly Lunar Stages`,
                    fr: `Calendrier lunaire à ${cityDisplay} : phases et stades mensuels`,
                    tr: `${cityDisplay} Ay Takvimi: Ay Evreleri ve Aylık Aşamalar`,
                    ur: `${cityDisplay} میں چاند کی تقویم: مراحل اور ماہانہ اطوار`,
                    de: `Mondkalender in ${cityDisplay}: Phasen und monatliche Stadien`,
                    id: `Kalender Bulan di ${cityDisplay}: Fase dan Tahap Bulanan`,
                    es: `Calendario lunar en ${cityDisplay}: fases y etapas mensuales`,
                    bn: `${cityDisplay}-এ চাঁদের ক্যালেন্ডার: দশা ও মাসিক পর্যায়`,
                    ms: `Kalendar Bulan ${cityDisplay}: Fasa dan Peringkat Bulanan`,
                };
                _moonDesc = {
                    ar: `كلّ ما تحتاجه عن القمر في ${cityDisplay}: الطور والإضاءة الآن، مواعيد البدر والمحاق، رؤية الهلال، والتقويم الهجريّ مع روابط لجميع التواريخ القادمة والماضية.`,
                    en: `Everything about the Moon in ${cityDisplay}: current phase and illumination, full moon and new moon dates, hilal visibility, and Hijri calendar — with links to all upcoming and past dates.`,
                    fr: `Tout sur la Lune à ${cityDisplay} : phase et illumination actuelles, dates de pleine et nouvelle lune, visibilité du croissant et calendrier hégirien — avec liens vers toutes les dates à venir et passées.`,
                    tr: `${cityDisplay}'da Ay hakkında her şey: güncel evre ve aydınlanma, dolunay ve yeni ay tarihleri, hilal görünürlüğü ve hicri takvim — gelecek ve geçmiş tüm tarihlere bağlantılarla.`,
                    ur: `${cityDisplay} میں چاند کے بارے میں سب کچھ: موجودہ طور اور روشنی، بدر اور نئے چاند کی تاریخیں، ہلال کی رؤیت اور ہجری تقویم — تمام آنے والی اور گزشتہ تاریخوں کے روابط کے ساتھ۔`,
                    de: `Alles über den Mond in ${cityDisplay}: aktuelle Phase und Beleuchtung, Vollmond- und Neumonddaten, Hilal-Sichtbarkeit und Hidschri-Kalender — mit Links zu allen kommenden und vergangenen Daten.`,
                    id: `Segala tentang Bulan di ${cityDisplay}: fase dan iluminasi saat ini, tanggal purnama dan bulan baru, rukyat hilal, dan kalender Hijriah — dengan tautan ke semua tanggal mendatang dan lampau.`,
                    es: `Todo sobre la Luna en ${cityDisplay}: fase e iluminación actuales, fechas de luna llena y nueva, visibilidad del hilal y calendario hijri — con enlaces a todas las fechas próximas y pasadas.`,
                    bn: `${cityDisplay}-এ চাঁদ সম্পর্কে সবকিছু: বর্তমান দশা ও আলোকসজ্জা, পূর্ণিমা ও অমাবস্যার তারিখ, হিলাল দৃশ্যমানতা এবং হিজরি ক্যালেন্ডার — সমস্ত আসন্ন ও অতীত তারিখের লিঙ্কসহ।`,
                    ms: `Semua tentang Bulan di ${cityDisplay}: fasa dan pencahayaan semasa, tarikh bulan purnama dan anak bulan, rukyah hilal serta kalendar Hijrah — dengan pautan ke semua tarikh akan datang dan lalu.`,
                };
            } else if (_moonDateIso && _moonDateInRange) {
                // ── عناوين خاصّة بصفحة التاريخ ── (التاريخ الأساسيّ + الموافق بين قوسين)
                _moonTitle = {
                    ar: `حالة القمر في ${cityDisplay} | ${_primaryDateLabel}`,
                    en: `Moon in ${cityDisplay} | ${_primaryDateLabel}`,
                    fr: `La Lune à ${cityDisplay} | ${_primaryDateLabel}`,
                    tr: `${cityDisplay} Ay | ${_primaryDateLabel}`,
                    ur: `${cityDisplay} میں چاند | ${_primaryDateLabel}`,
                    de: `Mond in ${cityDisplay} | ${_primaryDateLabel}`,
                    id: `Bulan di ${cityDisplay} | ${_primaryDateLabel}`,
                    es: `Luna en ${cityDisplay} | ${_primaryDateLabel}`,
                    bn: `${cityDisplay}-এ চাঁদ | ${_primaryDateLabel}`,
                    ms: `Bulan di ${cityDisplay} | ${_primaryDateLabel}`,
                };
                _moonDesc = {
                    ar: `طور القمر في ${cityDisplay} يوم ${_mainWithEquiv}: نسبة الإضاءة، عمر القمر، وقت المطلع والمغيب، والكوكبة — محسوبة بدقّة فلكيّة.`,
                    en: `Moon phase in ${cityDisplay} on ${_mainWithEquiv}: illumination, moon age, moonrise, moonset, and zodiac — calculated with precise astronomical formulas.`,
                    fr: `Phase de la Lune à ${cityDisplay} le ${_mainWithEquiv} : illumination, âge, heures de lever et coucher, et signe zodiacal — calculés avec des algorithmes astronomiques précis.`,
                    tr: `${cityDisplay} için ${_mainWithEquiv} tarihinde Ay evresi: aydınlanma, yaş, doğuş ve batış saatleri ve burç — kesin astronomik algoritmalarla hesaplanır.`,
                    ur: `${cityDisplay} میں ${_mainWithEquiv} کو چاند کا مرحلہ: روشنی، عمر، طلوع و غروب کے اوقات اور برج — درست فلکی فارمولوں سے حساب لگایا گیا۔`,
                    de: `Mondphase in ${cityDisplay} am ${_mainWithEquiv}: Beleuchtung, Mondalter, Aufgang, Untergang und Sternbild — berechnet mit präzisen astronomischen Algorithmen.`,
                    id: `Fase Bulan di ${cityDisplay} pada ${_mainWithEquiv}: iluminasi, usia Bulan, terbit, terbenam, dan rasi bintang — dihitung dengan algoritme astronomi presisi.`,
                    es: `Fase de la Luna en ${cityDisplay} el ${_mainWithEquiv}: iluminación, edad, salida y puesta lunar y constelación — calculadas con algoritmos astronómicos precisos.`,
                    bn: `${cityDisplay}-এ ${_mainWithEquiv}-এ চাঁদের দশা: আলোকসজ্জা, বয়স, উদয় ও অস্তের সময় এবং রাশি — নির্ভুল জ্যোতির্বিজ্ঞান অ্যালগরিদম দ্বারা গণনা।`,
                    ms: `Fasa Bulan di ${cityDisplay} pada ${_mainWithEquiv}: pencahayaan, usia, waktu terbit dan terbenam, serta buruj — dikira dengan algoritma astronomi tepat.`,
                };
            } else {
                // ── عناوين صفحة اليوم ──
                // Moon title templates cleanup — E2-keywords-ext (2026-05-01):
                // SEOptimer flagged the previous AR template at 42 chars (below the
                // 50–60 sweet spot). The fix is to extend each template with a
                // natural keyword pulled from the page's actual content (moon phases,
                // illumination) — NOT to add the month name (kept stable across
                // months) and NOT to expand to keyword spam. AR adds "ومراحل القمر"
                // per user spec; the other 9 langs add a parallel "Phases" /
                // "Beleuchtung" / "fases" element so all sit in the 50–60 range
                // for short-to-medium city names. Hub block, Month/Date blocks, and
                // descriptions are NOT touched. Comment is "E2-keywords-ext", not
                // "E3" (E3 reserved for the unrelated hydration/flash issue).
                _moonTitle = {
                    ar: `حالة القمر اليوم في ${cityDisplay} ومراحل القمر والتقويم الهجري`,
                    en: `Moon Today in ${cityDisplay} — Phases, Illumination & Hijri Date`,
                    fr: `Lune aujourd\u2019hui à ${cityDisplay}, phases et date hégirienne`,
                    tr: `${cityDisplay}'da Bugün Ay Evresi, Aydınlanma ve Hicri Tarih`,
                    ur: `${cityDisplay} میں آج چاند کی حالت، مراحل اور ہجری تاریخ`,
                    de: `Mond heute in ${cityDisplay}: Phase, Beleuchtung & Hidschri-Datum`,
                    id: `Bulan Hari Ini di ${cityDisplay}, Fase Bulan & Tanggal Hijriah`,
                    es: `Luna hoy en ${cityDisplay}: fases y fecha del calendario hijri`,
                    bn: `${cityDisplay}-এ আজকের চাঁদ, চাঁদের দশা ও হিজরি তারিখ`,
                    ms: `Bulan Hari Ini di ${cityDisplay}, Fasa Bulan & Tarikh Hijrah`,
                };
                _moonDesc = {
                    ar: `حالة القمر اليوم في ${cityDisplay}: الطور الحالي ونسبة الإضاءة، عمر القمر، شروق وغروب القمر، البدر القادم، مع رابط تقويم القمر الشهريّ في ${cityDisplay}.`,
                    en: `Today's moon in ${cityDisplay}: current phase, illumination, moon age, moonrise and moonset, next full moon, plus a link to the monthly moon calendar.`,
                    fr: `Lune aujourd\u2019hui à ${cityDisplay} : phase, illumination, âge, lever et coucher, prochaine pleine lune, avec lien vers le calendrier lunaire mensuel.`,
                    tr: `${cityDisplay} için bugün ay: mevcut evre, aydınlanma, yaş, doğuş ve batış, sonraki dolunay; aylık ay takvimine bağlantıyla.`,
                    ur: `${cityDisplay} میں آج چاند: موجودہ طور، روشنی، عمر، طلوع و غروب، اگلا بدر، اور ماہانہ چاند کی تقویم کا لنک۔`,
                    de: `Mond heute in ${cityDisplay}: aktuelle Phase, Beleuchtung, Alter, Auf- und Untergang, nächster Vollmond, mit Link zum monatlichen Mondkalender.`,
                    id: `Bulan hari ini di ${cityDisplay}: fase, iluminasi, usia, terbit dan terbenam, purnama berikutnya, dengan tautan ke kalender bulan bulanan.`,
                    es: `Luna hoy en ${cityDisplay}: fase actual, iluminación, edad, salida y puesta, próxima luna llena, con enlace al calendario lunar mensual.`,
                    bn: `${cityDisplay}-এ আজ চাঁদ: বর্তমান দশা, আলোকন, বয়স, উদয় ও অস্ত, পরবর্তী পূর্ণিমা, মাসিক চাঁদের ক্যালেন্ডারের লিঙ্কসহ।`,
                    ms: `Bulan hari ini di ${cityDisplay}: fasa, pencahayaan, usia, terbit dan terbenam, bulan purnama seterusnya, dengan pautan ke kalendar bulanan.`,
                };
            }
            title = _moonTitle[lang] || _moonTitle.en;
            description = _moonDesc[lang] || _moonDesc.en;
            // Round 16: hub = 'website' (evergreen)، dated/today = 'article'
            // UAT-Moon-Hub-Month: month page = 'website' too (evergreen for that month)
            ogType = (_isMoonHubPage || _isMoonMonthPage) ? 'website' : 'article';
            geo = { lat: cityGeo.lat, lng: cityGeo.lng };
            cityModified = _moonDateObj ? _moonDateObj.toISOString() : new Date().toISOString();
            // ── out-of-range: noindex + canonical يشير للصفحة بدون تاريخ ──
            if (_moonDateIso && !_moonDateInRange) {
                robotsOverride = 'noindex,follow,max-snippet:-1,max-image-preview:large';
                // canonical → /moon-today-in-{slug} (الصفحة الأساسيّة)
                const _basePath = '/moon-today-in-' + citySlug;
                canonical = origin + (lang === 'ar' ? '' : '/' + lang) + _basePath;
            }
            // ── coord-only page (Round 12): noindex لتجنّب spam فهرسة لكلّ إحداثيّ
            // النطاقات صالحة فعليّاً فقط للمستخدم النهائيّ عبر الضغط داخل الموقع.
            if (_isCoordOnlyMoon) {
                robotsOverride = 'noindex,follow,max-snippet:-1,max-image-preview:large';
                // canonical → نفس الـ URL (هي الشكل الوحيد المتاح لهذه المدينة)
                canonical = origin + p;
            }
            // ── Hijri URL → canonical يُشير دوماً إلى الصيغة الميلاديّة (SEO: duplicate content) ──
            // الرابط الهجريّ (/moon-in-X/1447-10-03) هو نسخة إنسانيّة بديلة
            // والميلاديّ هو المصدر الرئيسيّ. نوجِّه Google للنسخة الميلاديّة فقط.
            // Round 15: صفحات التاريخ تحت /moon-in- (لا تحوي "today").
            if (_moonDateWasHijri && _moonDateIso && _moonDateInRange) {
                const _gregCanonicalPath = '/moon-in-' + citySlug + '/' + _moonDateIso;
                canonical = origin + (lang === 'ar' ? '' : '/' + lang) + _gregCanonicalPath;
            }
            webApp = { name: title, url: canonical, category: 'UtilitiesApplication' };
            moonFaq = true;
            // IANA tz — مُستنتَج من cc عبر _CC_TO_PRIMARY_TZ. للمدن خارج الخريطة:
            // null → العميل سيستعمل _tzFromLongitude fallback (Etc/GMT±N).
            const _moonCc = (cityGeo.cc || '').toLowerCase();
            const _moonTz = _moonCc ? (_CC_TO_PRIMARY_TZ[_moonCc] || null) : null;
            moonCity = {
                slug: citySlug, name: cityDisplay, lat: cityGeo.lat, lng: cityGeo.lng,
                tz: _moonTz,                          // Asia/Tokyo إلخ — أو null عند عدم التوفّر
                date: _moonDateIso,                   // null = اليوم/hub؛ وإلا 'YYYY-MM-DD'
                dateObj: _moonDateObj,                // Date للـ Article.datePublished
                dateLabel: _moonDateLabel,            // ميلاديّ مقروء (دوماً)
                // ── Hijri context (Round 13): لدعم H1/badge/subtitle بلا إعادة حساب عميلة ──
                dateIsHijri: _moonDateWasHijri,       // true → دخل المستخدم عبر رابط هجريّ
                hijriLabel: _hijriLabel,              // "3 ذو القعدة 1447" (بلا لاحقة)
                hijriLabelWithSfx: _hijriLabelWithSfx, // "3 ذو القعدة 1447 هـ"
                // ── Round 16: hub flag — يُميّز /moon-in-{city} عن /moon-today-in-{city} في SSR ──
                //   UAT-Moon-Hub-Month: also true on month pages (which are
                //   hub-like — same shell layout + Round-19 trimming + calendar widget;
                //   only difference is the calendar shows the URL-selected month).
                isHub: (_isMoonHubPage || _isMoonMonthPage),
                // ── UAT-Moon-Hub-Month (NEW): month page flag + path date parts ──
                isMonthPage: _isMoonMonthPage,        // true → /moon-in-{slug}/YYYY-MM
                monthYear:  _moonMonthYear,           // 4-digit year from URL path
                monthMonth: _moonMonthMonth           // 1-12 from URL path
            };
            // Breadcrumb: "Moon" (renamed from "Moon Today" per UAT-Moon-Hub-Month —
            //   second level is the moon hub, not specifically "today")
            const _moonLabel = {
                ar: 'القمر', en: 'Moon', fr: 'Lune', tr: 'Ay',
                ur: 'چاند', de: 'Mond', id: 'Bulan',
                es: 'Luna', bn: 'চাঁদ', ms: 'Bulan',
            }[lang] || 'Moon';
            breadcrumbs.push({ name: _moonLabel, item: origin + (lang === 'ar' ? '' : '/' + lang) + '/moon-today' });
            // Round 16: city breadcrumb يشير إلى hub (/moon-in-{slug}) كوالد لصفحات التاريخ/الشهر،
            // أو إلى صفحة اليوم (/moon-today-in-{slug}) كوالد للصفحة الحاليّة إن كانت هي صفحة اليوم.
            // - hub page: self (/moon-in-{slug})
            // - dated page: parent (/moon-in-{slug}) — hub أعلى هرم المدينة
            // - month page (NEW): parent (/moon-in-{slug})
            // - today page: self (/moon-today-in-{slug})
            const _cityBcHref = (_isMoonHubPage || _isMoonMonthPage || (_moonDateIso && _moonDateInRange))
                ? ('/moon-in-' + citySlug)
                : ('/moon-today-in-' + citySlug);
            breadcrumbs.push({ name: cityDisplay, item: origin + (lang === 'ar' ? '' : '/' + lang) + _cityBcHref });
            // ── UAT-Moon-Hub-Month: insert {MonthName Year} rung between city and day ──
            //   on month pages: rung is the current page (no further levels).
            //   on day pages: rung links to its parent month page /moon-in-{slug}/YYYY-MM.
            if (_isMoonMonthPage || (_moonDateIso && _moonDateInRange && _moonDateObj)) {
                const _gMonthFullByLang = {
                    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
                    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                    fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
                    tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
                    ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
                    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
                    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
                    es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
                    bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
                    ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']
                };
                const _ml = _gMonthFullByLang[lang] || _gMonthFullByLang.en;
                const _bY = _isMoonMonthPage ? _moonMonthYear  : _moonDateObj.getFullYear();
                const _bM = _isMoonMonthPage ? _moonMonthMonth : (_moonDateObj.getMonth() + 1);
                const _monthLabel = `${_ml[_bM - 1]} ${_bY}`;
                const _monthHref  = origin + (lang === 'ar' ? '' : '/' + lang)
                                  + '/moon-in-' + citySlug + '/'
                                  + _bY + '-' + (_bM < 10 ? '0' + _bM : String(_bM));
                breadcrumbs.push({ name: _monthLabel, item: _monthHref });
            }
            if (_moonDateIso && _moonDateInRange && _primaryDateLabel) {
                // نعرض التاريخ بنفس نوعيّة الرابط (هجريّ للرابط الهجريّ، ميلاديّ للرابط الميلاديّ)
                breadcrumbs.push({ name: _primaryDateLabel, item: origin + p });
            }
        }
    }

    // المسار للغة (بدون prefix لـ AR، وإلا /{lang})
    const langPrefix = (lang === 'ar') ? '' : ('/' + lang);

    // ── Hijri year: /hijri-calendar أو /hijri-calendar/{year} ──
    m = corePath.match(/^\/hijri-calendar(?:\/(\d{4}))?$/);
    if (m) {
        // إن لم تُحدَّد السنة في المسار → استخدم السنة الهجرية الحالية
        const year = m[1] || String(_hijriNow().year);
        // قوالب متعدّدة اللغات
        const _HY_TITLE = {
            ar: `التقويم الهجري لعام ${year} هـ`,
            en: `Hijri Calendar ${year} AH`,
            fr: `Calendrier hégirien ${year} H`,
            tr: `Hicri Takvim ${year} H`,
            ur: `ہجری کیلنڈر ${year} ہجری`,
            de: `Hidschri-Kalender ${year} AH`,
            id: `Kalender Hijriah ${year} H`,
            es: `Calendario Hégira ${year} H`,
            bn: `হিজরি ক্যালেন্ডার ${year} হিজরি`,
            ms: `Kalendar Hijrah ${year} H`,
        };
        const _HY_DESC = {
            ar: `التقويم الهجري الكامل لعام ${year} هـ مع جميع الأشهر الإثني عشر والأيام وتواريخها الميلادية من تقويم أم القرى.`,
            en: `Full Hijri calendar for year ${year} AH with all 12 months, days and their Gregorian dates from the Umm al-Qura calendar.`,
            fr: `Calendrier hégirien complet de l'année ${year} H avec les 12 mois, leurs jours et leurs dates grégoriennes selon le calendrier Umm al-Qura.`,
            tr: `${year} H yılının tam hicri takvimi — 12 ay, tüm günler ve Ümmülkura takvimine göre miladi karşılıkları.`,
            ur: `${year} ہجری کا مکمل ہجری کیلنڈر — تمام 12 مہینے، ان کے دن اور ام القری کیلنڈر کے مطابق عیسوی تاریخیں۔`,
            de: `Vollständiger Hidschri-Kalender für das Jahr ${year} AH mit allen 12 Monaten, Tagen und ihren gregorianischen Daten aus dem Umm-al-Qura-Kalender.`,
            id: `Kalender Hijriah lengkap tahun ${year} H dengan semua 12 bulan, hari, dan tanggal Masehi-nya dari kalender Umm al-Qura.`,
            es: `Calendario Hégira completo del año ${year} H con los 12 meses, sus días y fechas gregorianas según el calendario Umm al-Qura.`,
            bn: `${year} হিজরির সম্পূর্ণ হিজরি ক্যালেন্ডার — সব ১২টি মাস, তাদের দিন এবং উম্ম আল-কুরা ক্যালেন্ডার অনুসারে খ্রিস্টীয় তারিখ।`,
            ms: `Kalendar Hijrah lengkap bagi tahun ${year} H dengan kesemua 12 bulan, hari-harinya dan tarikh Masihi mengikut kalendar Umm al-Qura.`,
        };
        const _HY_CAL_LABEL = {
            ar: 'التقويم الهجري', en: 'Hijri Calendar', fr: 'Calendrier hégirien', tr: 'Hicri Takvim',
            ur: 'ہجری کیلنڈر', de: 'Hidschri-Kalender', id: 'Kalender Hijriah', es: 'Calendario Hégira',
            bn: 'হিজরি ক্যালেন্ডার', ms: 'Kalendar Hijrah'
        };
        title = _HY_TITLE[lang] || _HY_TITLE.en;
        description = _HY_DESC[lang] || _HY_DESC.en;
        ogType = 'article';
        breadcrumbs.push({ name: _HY_CAL_LABEL[lang] || _HY_CAL_LABEL.en, item: origin + langPrefix + `/hijri-calendar` });
        // prev/next: فقط إذا الـ URL يتضمّن سنة صريحة
        if (m[1]) {
            prev = origin + langPrefix + `/hijri-calendar/${parseInt(year) - 1}`;
            next = origin + langPrefix + `/hijri-calendar/${parseInt(year) + 1}`;
        }
        article = { published: `${parseInt(year)}-01-01T00:00:00Z`, modified: new Date().toISOString() };
    }

    // ── Hijri month: /hijri-calendar/{YYYY}-{MM} ── 🆕 Round 11: numeric zero-padded (MM = 01..12)
    m = corePath.match(/^\/hijri-calendar\/(\d{4})-(0[1-9]|1[0-2])$/);
    if (m) {
        const year = m[1];
        const monthNum = parseInt(m[2], 10);
        const _pad2 = n => String(n).padStart(2, '0');
        const info = { order: monthNum };
        const _HM_BY_LANG_M = {
            ar: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
            en: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Akhira','Rajab','Shaban','Ramadan','Shawwal','Dhu al-Qidah','Dhu al-Hijjah'],
            fr: ['Mouharram','Safar','Rabi al-Awwal','Rabi al-Thani','Joumada al-Oula','Joumada al-Thania','Rajab','Chaabane','Ramadan','Chawwal','Dhou al-Qida','Dhou al-Hijja'],
            tr: ['Muharrem','Safer','Rebiülevvel','Rebiülahir','Cemaziyelevvel','Cemaziyelahir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'],
            ur: ['محرّم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذوالقعدہ','ذوالحجہ'],
            de: ['Muharram','Safar','Rabīʿ al-awwal','Rabīʿ ath-thānī','Dschumādā l-ūlā','Dschumādā th-thāniya','Radschab','Schaʿbān','Ramadan','Schawwāl','Dhū l-qaʿda','Dhū l-hidscha'],
            id: ['Muharram','Safar','Rabiul Awal','Rabiul Akhir','Jumadil Awal','Jumadil Akhir','Rajab','Syaban','Ramadan','Syawal','Zulkaidah','Zulhijah'],
            es: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Yumada al-Awwal','Yumada al-Thani','Rayab','Shaabán','Ramadán','Shawwal','Du al-Qida','Du al-Hiyya'],
            bn: ['মুহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'],
            ms: ['Muharam','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah']
        };
        const _hSfxM = { ar:' هـ', en:' AH', fr:' H', tr:' H', ur:' ہجری', de:' AH', id:' H', es:' H', bn:' হিজরি', ms:' H' }[lang] || ' AH';
        const _mName = (_HM_BY_LANG_M[lang] || _HM_BY_LANG_M.en)[monthNum - 1];
        const _HMO_TITLE = {
            ar: `التقويم الهجري لشهر ${_mName} ${year}${_hSfxM}`,
            en: `Hijri Calendar: ${_mName} ${year}${_hSfxM}`,
            fr: `Calendrier hégirien : ${_mName} ${year}${_hSfxM}`,
            tr: `Hicri Takvim: ${_mName} ${year}${_hSfxM}`,
            ur: `ہجری کیلنڈر: ${_mName} ${year}${_hSfxM}`,
            de: `Hidschri-Kalender: ${_mName} ${year}${_hSfxM}`,
            id: `Kalender Hijriah: ${_mName} ${year}${_hSfxM}`,
            es: `Calendario Hégira: ${_mName} ${year}${_hSfxM}`,
            bn: `হিজরি ক্যালেন্ডার: ${_mName} ${year}${_hSfxM}`,
            ms: `Kalendar Hijrah: ${_mName} ${year}${_hSfxM}`,
        };
        const _HMO_DESC = {
            ar: `التقويم الهجري الكامل لشهر ${_mName} ${year}${_hSfxM} مع التاريخ الميلادي لكل يوم حسب تقويم أم القرى.`,
            en: `Full Hijri calendar for ${_mName} ${year}${_hSfxM} with the Gregorian date for each day, per the Umm al-Qura calendar.`,
            fr: `Calendrier hégirien complet de ${_mName} ${year}${_hSfxM} avec la date grégorienne de chaque jour, selon le calendrier Umm al-Qura.`,
            tr: `${_mName} ${year}${_hSfxM} için tam hicri takvim, her günün miladi tarihiyle, Ümmülkura takvimine göre.`,
            ur: `${_mName} ${year}${_hSfxM} کا مکمل ہجری کیلنڈر، ہر دن کی عیسوی تاریخ کے ساتھ، ام القری کیلنڈر کے مطابق۔`,
            de: `Vollständiger Hidschri-Kalender für ${_mName} ${year}${_hSfxM} mit gregorianischem Datum für jeden Tag, gemäß dem Umm-al-Qura-Kalender.`,
            id: `Kalender Hijriah lengkap untuk ${_mName} ${year}${_hSfxM} dengan tanggal Masehi setiap hari, menurut kalender Umm al-Qura.`,
            es: `Calendario Hégira completo de ${_mName} ${year}${_hSfxM} con la fecha gregoriana de cada día, según el calendario Umm al-Qura.`,
            bn: `${_mName} ${year}${_hSfxM}-এর সম্পূর্ণ হিজরি ক্যালেন্ডার প্রতিটি দিনের খ্রিস্টীয় তারিখসহ, উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী।`,
            ms: `Kalendar Hijrah lengkap bagi ${_mName} ${year}${_hSfxM} dengan tarikh Masihi bagi setiap hari, mengikut kalendar Umm al-Qura.`,
        };
        const _HMO_CAL_LBL = {
            ar: 'التقويم الهجري', en: 'Hijri Calendar', fr: 'Calendrier hégirien', tr: 'Hicri Takvim',
            ur: 'ہجری کیلنڈر', de: 'Hidschri-Kalender', id: 'Kalender Hijriah', es: 'Calendario Hégira',
            bn: 'হিজরি ক্যালেন্ডার', ms: 'Kalendar Hijrah'
        };
        title = _HMO_TITLE[lang] || _HMO_TITLE.en;
        description = _HMO_DESC[lang] || _HMO_DESC.en;
        // Answer-Page pattern: month page is a WebPage, not an Article
        ogType = 'website';
        breadcrumbs.push({ name: _HMO_CAL_LBL[lang] || _HMO_CAL_LBL.en, item: origin + langPrefix + `/hijri-calendar` });
        breadcrumbs.push({ name: `${year}${_hSfxM}`, item: origin + langPrefix + `/hijri-calendar/${year}` });
        breadcrumbs.push({ name: `${_mName} ${year}${_hSfxM}`, item: canonical });
        // prev/next month navigation — numeric format
        {
            const prevOrder = monthNum === 1 ? 12 : monthNum - 1;
            const prevYear  = monthNum === 1 ? parseInt(year) - 1 : parseInt(year);
            const nextOrder = monthNum === 12 ? 1 : monthNum + 1;
            const nextYear  = monthNum === 12 ? parseInt(year) + 1 : parseInt(year);
            prev = origin + langPrefix + `/hijri-calendar/${prevYear}-${_pad2(prevOrder)}`;
            next = origin + langPrefix + `/hijri-calendar/${nextYear}-${_pad2(nextOrder)}`;
        }
    }

    // ── Hijri day: /hijri-date/{YYYY}-{MM}-{DD} ── 🆕 Round 11: numeric zero-padded (MM=01..12, DD=01..30)
    m = corePath.match(/^\/hijri-date\/(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|30)$/);
    if (m) {
        const year = m[1];
        const monthNum = parseInt(m[2], 10);
        const day = String(parseInt(m[3], 10)); // strip leading zero for display (e.g. "05" → "5")
        const _pad2d = n => String(n).padStart(2, '0');
        // أسماء الأشهر الهجرية المُترجَمة لكل لغة (10 لغات)
        const _HM_BY_LANG = {
            ar: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
            en: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Akhira','Rajab','Shaban','Ramadan','Shawwal','Dhu al-Qidah','Dhu al-Hijjah'],
            fr: ['Mouharram','Safar','Rabi al-Awwal','Rabi al-Thani','Joumada al-Oula','Joumada al-Thania','Rajab','Chaabane','Ramadan','Chawwal','Dhou al-Qida','Dhou al-Hijja'],
            tr: ['Muharrem','Safer','Rebiülevvel','Rebiülahir','Cemaziyelevvel','Cemaziyelahir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'],
            ur: ['محرّم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذوالقعدہ','ذوالحجہ'],
            de: ['Muharram','Safar','Rabīʿ al-awwal','Rabīʿ ath-thānī','Dschumādā l-ūlā','Dschumādā th-thāniya','Radschab','Schaʿbān','Ramadan','Schawwāl','Dhū l-qaʿda','Dhū l-hidscha'],
            id: ['Muharram','Safar','Rabiul Awal','Rabiul Akhir','Jumadil Awal','Jumadil Akhir','Rajab','Syaban','Ramadan','Syawal','Zulkaidah','Zulhijah'],
            es: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Yumada al-Awwal','Yumada al-Thani','Rayab','Shaabán','Ramadán','Shawwal','Du al-Qida','Du al-Hiyya'],
            bn: ['মুহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'],
            ms: ['Muharam','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah']
        };
        const _mName  = (_HM_BY_LANG[lang] || _HM_BY_LANG.en)[monthNum - 1];
        const _hSfx   = { ar:' هـ', en:' AH', fr:' H', tr:' H', ur:' ہجری', de:' AH', id:' H', es:' H', bn:' হিজরি', ms:' H' }[lang] || ' AH';
        // قوالب العناوين والأوصاف — Answer Page: مختصرة جداً، التاريخ أولاً
        // Phase D1: replace ":" with "|" for separator consistency
        const _HDAY_TITLE = {
            ar: `التاريخ الهجري | ${day} ${_mName} ${year}${_hSfx}`,
            en: `Hijri Date | ${day} ${_mName} ${year}${_hSfx}`,
            fr: `Date hégirienne | ${day} ${_mName} ${year}${_hSfx}`,
            tr: `Hicri Tarih | ${day} ${_mName} ${year}${_hSfx}`,
            ur: `ہجری تاریخ | ${day} ${_mName} ${year}${_hSfx}`,
            de: `Hidschri-Datum | ${day} ${_mName} ${year}${_hSfx}`,
            id: `Tanggal Hijriah | ${day} ${_mName} ${year}${_hSfx}`,
            es: `Fecha Hégira | ${day} ${_mName} ${year}${_hSfx}`,
            bn: `হিজরি তারিখ | ${day} ${_mName} ${year}${_hSfx}`,
            ms: `Tarikh Hijrah | ${day} ${_mName} ${year}${_hSfx}`,
        };
        const _HDAY_DESC = {
            ar: `تعرّف على التاريخ الهجري ${day} ${_mName} ${year}${_hSfx} والتاريخ الميلادي المقابل، مع روابط مفيدة للتقويم وتحويل التاريخ.`,
            en: `Hijri date ${day} ${_mName} ${year}${_hSfx} with its Gregorian equivalent, plus quick links to the calendar and date converter.`,
            fr: `Date hégirienne ${day} ${_mName} ${year}${_hSfx} et son équivalent grégorien, avec des liens utiles vers le calendrier et le convertisseur.`,
            tr: `${day} ${_mName} ${year}${_hSfx} hicri tarihi ve miladi karşılığı; takvim ve tarih dönüştürücüye hızlı bağlantılar.`,
            ur: `ہجری تاریخ ${day} ${_mName} ${year}${_hSfx} اور اس کی عیسوی مساوی، کیلنڈر اور تاریخ کنورٹر کے مفید لنکس کے ساتھ۔`,
            de: `Hidschri-Datum ${day} ${_mName} ${year}${_hSfx} mit gregorianischer Entsprechung sowie schnellen Links zum Kalender und Datumsumrechner.`,
            id: `Tanggal Hijriah ${day} ${_mName} ${year}${_hSfx} beserta padanan Masehi, dengan tautan ke kalender dan konverter tanggal.`,
            es: `Fecha Hégira ${day} ${_mName} ${year}${_hSfx} con su equivalente gregoriano y enlaces al calendario y al conversor de fechas.`,
            bn: `হিজরি তারিখ ${day} ${_mName} ${year}${_hSfx} এবং এর খ্রিস্টীয় সমতুল্য, ক্যালেন্ডার ও তারিখ রূপান্তরকারীর দ্রুত লিঙ্কসহ।`,
            ms: `Tarikh Hijrah ${day} ${_mName} ${year}${_hSfx} dan padanan Masihi, dengan pautan pantas ke kalendar dan penukar tarikh.`,
        };
        const _HDAY_CAL_LABEL = {
            ar: 'التقويم الهجري', en: 'Hijri Calendar', fr: 'Calendrier hégirien', tr: 'Hicri Takvim',
            ur: 'ہجری کیلنڈر', de: 'Hidschri-Kalender', id: 'Kalender Hijriah', es: 'Calendario Hégira',
            bn: 'হিজরি ক্যালেন্ডার', ms: 'Kalendar Hijrah'
        };
        title = _HDAY_TITLE[lang] || _HDAY_TITLE.en;
        description = _HDAY_DESC[lang] || _HDAY_DESC.en;
        ogType = 'website'; // Answer Page — not an article
        const _calL = _HDAY_CAL_LABEL[lang] || _HDAY_CAL_LABEL.en;
        breadcrumbs.push({ name: _calL, item: origin + langPrefix + `/hijri-calendar` });
        breadcrumbs.push({ name: `${year}`, item: origin + langPrefix + `/hijri-calendar/${year}` });
        breadcrumbs.push({ name: `${_mName} ${year}`, item: origin + langPrefix + `/hijri-calendar/${year}-${_pad2d(monthNum)}` });
        breadcrumbs.push({ name: `${day} ${_mName}`, item: canonical });
        // لا schema Article — هذه Answer Page (WebPage + FAQPage + BreadcrumbList فقط)
    }

    // ── Country listing: /prayer-times-in-{country-slug} ──
    // ملاحظة: النمط نفسه (/prayer-times-in-{slug}) يُستخدم للمدن أيضاً.
    // نحن نفحص عبر _countryFromSlug ليرى إن كان slug يطابق دولة معروفة.
    // لو نعم → صفحة دولة (cities listing). لو لا → المسار يكمل لمنطق المدن.
    let countryListing = null;
    m = corePath.match(/^\/prayer-times-in-([a-z][a-z0-9-]+)$/);
    if (m) {
        const slug = m[1];
        const c = _countryFromSlug(slug);
        if (c && c.cc && c.cc !== '__') {
            // اسم الدولة بـلغة الواجهة (يدعم 6 لغات): ar/en/fr/tr/ur/de
            const cname = _countryNameForLang(c.cc, lang);
            // Phase D2: cities-focused phrasing + add es/bn/ms (was missing → en fallback)
            const _COUNTRY_TITLE_TEMPLATES = {
                ar: `مواقيت الصلاة في مدن ${cname} | تصفّح المواقع`,
                en: `Prayer Times Cities in ${cname} | Browse All Locations`,
                fr: `Heures de prière en ${cname} | Toutes les villes`,
                tr: `${cname} Namaz Vakitleri | Tüm Şehirler`,
                ur: `${cname} میں اوقاتِ نماز | تمام شہر`,
                de: `Gebetszeiten in ${cname} | Alle Städte`,
                id: `Jadwal Sholat di ${cname} | Semua Kota`,
                es: `Horarios de Oración en ${cname} | Todas las ciudades`,
                bn: `${cname}-এ নামাজের সময় | সকল শহর`,
                ms: `Waktu Solat di ${cname} | Semua Bandar`,
            };
            const _COUNTRY_DESC_TEMPLATES = {
                ar: `تصفّح كل مدن ${cname}: مواقيت الصلاة (الفجر، الظهر، العصر، المغرب، العشاء)، اتجاه القبلة والتاريخ الهجري.`,
                en: `Browse all cities in ${cname} for accurate prayer times, Qibla direction and the Hijri date with a weekly schedule.`,
                fr: `Parcourez toutes les villes de ${cname} pour des heures de prière précises, la direction de la Qibla et la date hégirienne avec un programme hebdomadaire.`,
                tr: `${cname} şehirlerinde doğru namaz vakitleri, kıble yönü ve hicri tarih için tüm şehirlere göz atın — haftalık program ile.`,
                ur: `${cname} کے ہر شہر کے لیے درست اوقاتِ نماز، سمتِ قبلہ اور ہجری تاریخ ہفتہ وار جدول کے ساتھ دیکھیں۔`,
                de: `Durchsuchen Sie alle Städte in ${cname} für genaue Gebetszeiten, Qibla-Richtung und Hidschri-Datum mit Wochenplan.`,
                id: `Jelajahi setiap kota di ${cname}: jadwal sholat akurat, arah kiblat dan tanggal Hijriah dengan jadwal mingguan.`,
                es: `Explora todas las ciudades de ${cname}: horarios exactos de oración, dirección de la Qibla y fecha Hijri con programa semanal.`,
                bn: `${cname}-এর সকল শহরে নির্ভুল নামাজের সময়, কিবলার দিক ও হিজরি তারিখ — সাপ্তাহিক সূচী সহ।`,
                ms: `Layari semua bandar di ${cname} untuk waktu solat tepat, arah kiblat dan tarikh Hijrah dengan jadual mingguan.`,
            };
            title = _COUNTRY_TITLE_TEMPLATES[lang] || _COUNTRY_TITLE_TEMPLATES.en;
            description = _COUNTRY_DESC_TEMPLATES[lang] || _COUNTRY_DESC_TEMPLATES.en;
            breadcrumbs.push({ name: cname, item: canonical });
            countryListing = { code: c.cc, name: cname };
        } else {
            // Round 8: slug لا يُطابق دولة → معاملته كمدينة (مثل /prayer-times-in-monaco-city)
            // نُولّد نفس title بتوقيت المدينة المحلّيّ إن وُجدَت في cities-*.json (10 لغات)
            // Round 8B+C: اسم المدينة بلغة الواجهة (flagship ×10، والباقي AR عبر cities-*.json)
            const cityDisplay = _resolveCityName(slug, lang);
            // استنباط lng من الفهرس — إن لم توجد فسيفبك للافتراضي (مكّة)
            const cityLng = _getCityLngBySlug(slug);
            title = _buildCityDatedTitle(cityDisplay, cityLng);
            // Phase D2: localized desc for all 10 languages (was: useEnTxt fallback to en for 8 langs)
            const _CITY_DESCS = {
                ar: `مواقيت الصلاة الدقيقة في ${cityDisplay}: الفجر، الظهر، العصر، المغرب، العشاء، اتجاه القبلة، التاريخ الهجري والجدول الأسبوعي.`,
                en: `Accurate Islamic prayer times for ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha — with Qibla direction, Hijri date and weekly schedule.`,
                fr: `Horaires de prière exacts à ${cityDisplay} : Fajr, Dohr, Asr, Maghrib, Icha — avec direction de la Qibla, date hégirienne et programme hebdomadaire.`,
                tr: `${cityDisplay} için doğru namaz vakitleri: Fecir, Öğle, İkindi, Akşam, Yatsı — kıble yönü, hicri tarih ve haftalık program ile birlikte.`,
                ur: `${cityDisplay} کے لیے درست اوقاتِ نماز: فجر، ظہر، عصر، مغرب، عشاء — سمتِ قبلہ، ہجری تاریخ اور ہفتہ وار جدول کے ساتھ۔`,
                de: `Genaue Gebetszeiten für ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha — mit Qibla-Richtung, Hidschri-Datum und Wochenplan.`,
                id: `Jadwal sholat akurat untuk ${cityDisplay}: Subuh, Zuhur, Asar, Magrib, Isya — dengan arah kiblat, tanggal Hijriah dan jadwal mingguan.`,
                es: `Horarios de oración exactos para ${cityDisplay}: Fayr, Dohr, Asr, Magrib, Isha — con dirección de la Qibla, fecha Hijri y programa semanal.`,
                bn: `${cityDisplay}-এর জন্য নির্ভুল নামাজের সময়: ফজর, জোহর, আসর, মাগরিব, এশা — কিবলার দিক, হিজরি তারিখ ও সাপ্তাহিক সূচী সহ।`,
                ms: `Waktu solat tepat untuk ${cityDisplay}: Subuh, Zohor, Asar, Maghrib, Isyak — dengan arah kiblat, tarikh Hijrah dan jadual mingguan.`,
            };
            description = _CITY_DESCS[lang] || _CITY_DESCS.en;
            ogType = 'article';
            cityModified = new Date().toISOString();
            breadcrumbs.push({ name: cityDisplay, item: canonical });
        }
    }

    // OG image URL (dynamic SVG endpoint)
    const ogImageUrl = `${origin}/og-image.svg?t=${encodeURIComponent(title)}&l=${lang}`;

    // isHome: true when visiting language root (ar='/', en='/en/', fr='/fr/', ...)
    const isHome = (corePath === '/');

    return {
        title, description, canonical, arUrl, enUrl, frUrl, trUrl, urUrl, deUrl, idUrl, esUrl, bnUrl, msUrl,
        isEn, isRtl, lang, siteName, isHome,
        ogType, ogImageUrl, breadcrumbs, geo, prev, next, article,
        webApp, qiblaRef, countryListing, cityModified, origin,
        moonFaq, moonCity, zakatFaq, robotsOverride,
        canonicalOverride: _canonicalOverride,
        timeLeftPage,
        nextPrayerPage
    };
}

/**
 * يبني كتلة HTML لحقنها داخل <head> قبل </head>.
 * تشمل: robots, canonical, hreflang×3, OG×8+, Twitter×3, BreadcrumbList, geo, prev/next, article:*.
 */
function renderSeoHeadHtml(seo) {
    const esc = _escHtml;
    const parts = [];
    parts.push('<!-- SSR-SEO-START -->');
    // robots: استخدم override (noindex للتواريخ خارج النطاق مثلاً) وإلا القيمة الافتراضيّة
    const _robots = seo.robotsOverride || 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';
    parts.push(`<meta name="robots" content="${esc(_robots)}">`);
    // NOTE: لا نضيف preconnect لـ nominatim — جميع طلبات الـ geocoding تمرّ عبر proxy محلي (/api/geocode)
    parts.push(`<link rel="canonical" href="${esc(seo.canonical)}">`);
    parts.push(`<link rel="alternate" hreflang="ar" href="${esc(seo.arUrl)}">`);
    parts.push(`<link rel="alternate" hreflang="en" href="${esc(seo.enUrl)}">`);
    if (seo.frUrl) parts.push(`<link rel="alternate" hreflang="fr" href="${esc(seo.frUrl)}">`);
    if (seo.trUrl) parts.push(`<link rel="alternate" hreflang="tr" href="${esc(seo.trUrl)}">`);
    if (seo.urUrl) parts.push(`<link rel="alternate" hreflang="ur" href="${esc(seo.urUrl)}">`);
    if (seo.deUrl) parts.push(`<link rel="alternate" hreflang="de" href="${esc(seo.deUrl)}">`);
    if (seo.idUrl) parts.push(`<link rel="alternate" hreflang="id" href="${esc(seo.idUrl)}">`);
    if (seo.esUrl) parts.push(`<link rel="alternate" hreflang="es" href="${esc(seo.esUrl)}">`);
    if (seo.bnUrl) parts.push(`<link rel="alternate" hreflang="bn" href="${esc(seo.bnUrl)}">`);
    if (seo.msUrl) parts.push(`<link rel="alternate" hreflang="ms" href="${esc(seo.msUrl)}">`);
    parts.push(`<link rel="alternate" hreflang="x-default" href="${esc(seo.arUrl)}">`);
    // ضمان self-referential hreflang: إذا لم يكن URL اللغة الحالية = canonical (خلل build)،
    // أضف alternate إضافي يشير للـ canonical (SEO best practice: كل صفحة يجب أن ترى نفسها في hreflang).
    // عند canonical override مقصود (مثل /today-hijri-date → /hijri-date/...)، نتخطّى هذا الـ fallback
    // لمنع duplicate hreflang لنفس اللغة.
    const _currentLangUrl = { ar: seo.arUrl, en: seo.enUrl, fr: seo.frUrl, tr: seo.trUrl, ur: seo.urUrl, de: seo.deUrl, id: seo.idUrl, es: seo.esUrl, bn: seo.bnUrl, ms: seo.msUrl }[seo.lang];
    if (_currentLangUrl && _currentLangUrl !== seo.canonical && !seo.canonicalOverride) {
        parts.push(`<link rel="alternate" hreflang="${seo.lang}" href="${esc(seo.canonical)}">`);
    }
    // OpenGraph
    parts.push(`<meta property="og:title" content="${esc(seo.title)}">`);
    parts.push(`<meta property="og:description" content="${esc(seo.description)}">`);
    parts.push(`<meta property="og:url" content="${esc(seo.canonical)}">`);
    parts.push(`<meta property="og:type" content="${esc(seo.ogType)}">`);
    parts.push(`<meta property="og:site_name" content="${esc(seo.siteName)}">`);
    const LOCALE_MAP = { ar: 'ar_SA', en: 'en_US', fr: 'fr_FR', tr: 'tr_TR', ur: 'ur_PK', de: 'de_DE', id: 'id_ID', es: 'es_ES', bn: 'bn_BD', ms: 'ms_MY' };
    const _locale = LOCALE_MAP[seo.lang] || 'ar_SA';
    parts.push(`<meta property="og:locale" content="${_locale}">`);
    for (const [_l, _v] of Object.entries(LOCALE_MAP)) {
        if (_l !== seo.lang) parts.push(`<meta property="og:locale:alternate" content="${_v}">`);
    }
    parts.push(`<meta property="og:image" content="${esc(seo.ogImageUrl)}">`);
    parts.push(`<meta property="og:image:width" content="1200">`);
    parts.push(`<meta property="og:image:height" content="630">`);
    parts.push(`<meta property="og:image:alt" content="${esc(seo.title)}">`);
    // Twitter / X
    parts.push(`<meta name="twitter:card" content="summary_large_image">`);
    parts.push(`<meta name="twitter:site" content="@TIMESPRAYESRS">`);
    parts.push(`<meta name="twitter:creator" content="@TIMESPRAYESRS">`);
    parts.push(`<meta name="twitter:title" content="${esc(seo.title)}">`);
    parts.push(`<meta name="twitter:description" content="${esc(seo.description)}">`);
    parts.push(`<meta name="twitter:image" content="${esc(seo.ogImageUrl)}">`);
    // Geo (for city pages)
    if (seo.geo) {
        parts.push(`<meta name="geo.position" content="${seo.geo.lat};${seo.geo.lng}">`);
        parts.push(`<meta name="ICBM" content="${seo.geo.lat}, ${seo.geo.lng}">`);
    }
    // Moon city tz — IANA مثل Asia/Tokyo. يسمح للـ client بحساب شروق/غروب
    // القمر بتوقيت المدينة الصحيح حتّى للمدن خارج FAMOUS_MOON_CITIES.
    if (seo.moonCity && seo.moonCity.tz) {
        parts.push(`<meta name="moon.city.tz" content="${esc(seo.moonCity.tz)}">`);
    }
    // prev/next
    if (seo.prev) parts.push(`<link rel="prev" href="${esc(seo.prev)}">`);
    if (seo.next) parts.push(`<link rel="next" href="${esc(seo.next)}">`);
    // Article meta (+ dateModified for city pages)
    if (seo.article) {
        parts.push(`<meta property="article:published_time" content="${esc(seo.article.published)}">`);
        parts.push(`<meta property="article:modified_time" content="${esc(seo.article.modified)}">`);
        parts.push(`<meta property="article:author" content="${esc(seo.siteName)}">`);
    } else if (seo.cityModified) {
        parts.push(`<meta property="article:modified_time" content="${esc(seo.cityModified)}">`);
    }

    // ===== Unified @graph SEO Schema =====
    // يجمع: Organization (logo + sameAs), ImageObject (OG), BreadcrumbList,
    // WebApplication (لصفحات الأدوات), Place (للقبلة مع الكعبة)
    const ssrGraph = [];
    const orgId   = `${seo.origin}/#organization`;
    const logoId  = `${seo.origin}/#logo`;
    const imageId = `${seo.ogImageUrl}#image`;

    // Organization with logo
    ssrGraph.push({
        "@type": "Organization",
        "@id": orgId,
        "name": seo.siteName,
        "alternateName": "Prayer Times & Hijri Calendar",
        "url": seo.origin + '/',
        "logo": { "@id": logoId },
        "description": seo.description,
        "sameAs": [
            "https://x.com/TIMESPRAYESRS",
            "https://www.youtube.com/@TIMESPRAYESRS",
            "https://www.linkedin.com/in/times-prayers-072861404"
        ]
    });

    // WebSite + SearchAction (sitelinks search box في SERP)
    // فقط مرّة واحدة لكل site، نحقنها على الصفحة الرئيسية لكل لغة
    if (seo.isHome) {
        ssrGraph.push({
            "@type": "WebSite",
            "@id": `${seo.origin}/#website`,
            "url": seo.origin + '/',
            "name": seo.siteName,
            "description": seo.description,
            "inLanguage": seo.lang,
            "publisher": { "@id": orgId },
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${seo.origin}/prayer-times-in-{search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        });
    }

    // Organization logo — ImageObject
    ssrGraph.push({
        "@type": "ImageObject",
        "@id": logoId,
        "url": `${seo.origin}/og-image.svg`,
        "contentUrl": `${seo.origin}/og-image.svg`,
        "width": 1200,
        "height": 630,
        "caption": seo.siteName
    });

    // Primary OG image — standalone ImageObject
    ssrGraph.push({
        "@type": "ImageObject",
        "@id": imageId,
        "url": seo.ogImageUrl,
        "contentUrl": seo.ogImageUrl,
        "width": 1200,
        "height": 630,
        "caption": seo.title,
        "representativeOfPage": true
    });

    // BreadcrumbList (if >= 2 items)
    if (seo.breadcrumbs && seo.breadcrumbs.length >= 2) {
        ssrGraph.push({
            "@type": "BreadcrumbList",
            "@id": `${seo.canonical}#breadcrumb`,
            "itemListElement": seo.breadcrumbs.map((b, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": b.name,
                "item": b.item
            }))
        });
    }

    // WebApplication for tool pages
    if (seo.webApp) {
        ssrGraph.push({
            "@type": "WebApplication",
            "@id": `${seo.canonical}#webapp`,
            "name": seo.webApp.name,
            "url": seo.webApp.url,
            "description": seo.description,
            "applicationCategory": seo.webApp.category,
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript. Requires HTML5.",
            "inLanguage": seo.lang,
            "isAccessibleForFree": true,
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "publisher": { "@id": orgId },
            "image": { "@id": imageId }
        });
    }

    // Place with Kaaba reference — for /qibla-in-*
    if (seo.qiblaRef) {
        ssrGraph.push({
            "@type": "Place",
            "@id": `${seo.canonical}#place-origin`,
            "name": seo.qiblaRef.cityName,
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": seo.qiblaRef.lat,
                "longitude": seo.qiblaRef.lng
            }
        });
        ssrGraph.push({
            "@type": "Place",
            "@id": "https://www.google.com/maps?q=21.4225,39.8262#kaaba",
            "name": seo.isEn ? 'The Kaaba' : 'الكعبة المشرفة',
            "alternateName": seo.isEn ? 'Al-Masjid al-Haram' : 'المسجد الحرام',
            "address": {
                "@type": "PostalAddress",
                "addressLocality": seo.isEn ? 'Mecca' : 'مكة المكرمة',
                "addressCountry": seo.isEn ? 'Saudi Arabia' : 'المملكة العربية السعودية'
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 21.4225,
                "longitude": 39.8262
            }
        });
    }

    // FAQPage — للصفحة الرئيسية فقط (rich results)
    if (seo.isHome) {
        const FAQ_I18N = {
            ar: [
                { q: 'كيف تُحسَب مواقيت الصلاة في هذا الموقع؟',
                  a: 'يعتمد الموقع على طرق حساب فلكية معترف بها دولياً مثل رابطة العالم الإسلامي، أم القرى، الهيئة المصرية العامة للمساحة، وجامعة العلوم الإسلامية في كراتشي. يمكنك اختيار الطريقة المناسبة لمنطقتك من الإعدادات.' },
                { q: 'هل مواقيت الصلاة دقيقة؟',
                  a: 'نعم، تُحسَب المواقيت لحظياً بناءً على الإحداثيات الجغرافية (خط العرض والطول) والتوقيت المحلي والطريقة الحسابية المختارة، وتُطابق المواقع الرسمية للمدن الرئيسية.' },
                { q: 'كيف أعرف اتجاه القبلة من موقعي؟',
                  a: 'استخدم صفحة "اتجاه القبلة" — بعد السماح بالوصول لموقعك، ستُحدَّد درجة اتجاه الكعبة المشرفة من مكانك الحالي على بوصلة تفاعلية وخريطة.' },
                { q: 'هل يدعم الموقع التقويم الهجري وتحويل التواريخ؟',
                  a: 'نعم، يعتمد الموقع تقويم أم القرى الرسمي ويدعم تحويل التاريخ من الهجري إلى الميلادي والعكس من سنة 1 هـ إلى 1500 هـ.' },
                { q: 'هل الموقع مجاني بالكامل؟',
                  a: 'نعم، جميع الميزات مجانية: مواقيت الصلاة، القبلة، حاسبة الزكاة، الأدعية والأذكار، المسبحة الإلكترونية، والتقويم الهجري — بدون إعلانات تدخّلية ولا تسجيل.' }
            ],
            en: [
                { q: 'How are prayer times calculated on this site?',
                  a: 'We use internationally recognized calculation methods: Muslim World League, Umm al-Qura, Egyptian General Authority of Survey, University of Islamic Sciences Karachi, and more. You can pick the method matching your region from Settings.' },
                { q: 'Are the prayer times accurate?',
                  a: 'Yes. Times are computed in real-time from your geographic coordinates (lat/lng), local timezone, and the selected calculation method — matching official sources for major cities.' },
                { q: 'How can I find the Qibla direction from my location?',
                  a: 'Open the "Qibla" page — after allowing location access, we calculate the exact bearing to the Kaaba in Mecca and display it on an interactive compass and map.' },
                { q: 'Does the site support the Hijri calendar and date conversion?',
                  a: "Yes. We use the official Umm al-Qura calendar and support converting dates between Hijri and Gregorian for years 1–1500 AH." },
                { q: 'Is the site completely free?',
                  a: 'Yes. All features — prayer times, Qibla, Zakat calculator, duas & adhkar, digital tasbih, Hijri calendar — are free, with no intrusive ads and no signup required.' }
            ],
            fr: [
                { q: 'Comment les heures de prière sont-elles calculées ?',
                  a: "Nous utilisons des méthodes de calcul reconnues : Ligue Islamique Mondiale, Umm al-Qura, Autorité Égyptienne de Topographie, Université des Sciences Islamiques de Karachi, etc. Choisissez la méthode adaptée à votre région dans les paramètres." },
                { q: 'Les heures de prière sont-elles précises ?',
                  a: "Oui. Les heures sont calculées en temps réel à partir de vos coordonnées géographiques, du fuseau horaire local et de la méthode choisie — conformes aux sources officielles des grandes villes." },
                { q: 'Comment trouver la direction de la Qibla depuis ma position ?',
                  a: "Ouvrez la page « Qibla » — après autorisation de localisation, nous calculons le cap exact vers la Kaaba à La Mecque et l'affichons sur une boussole interactive." },
                { q: 'Le site prend-il en charge le calendrier hégirien ?',
                  a: "Oui. Nous utilisons le calendrier officiel Umm al-Qura et permettons la conversion entre dates hégiriennes et grégoriennes de l'an 1 à 1500 AH." },
                { q: 'Le site est-il entièrement gratuit ?',
                  a: "Oui. Toutes les fonctionnalités sont gratuites, sans publicités intrusives ni inscription requise." }
            ],
            tr: [
                { q: 'Namaz vakitleri bu sitede nasıl hesaplanıyor?',
                  a: "Uluslararası kabul görmüş hesaplama yöntemleri kullanıyoruz: Müslüman Dünya Birliği, Ümmü'l-Kura, Mısır Genel Topografya Kurumu, Karaçi İslami İlimler Üniversitesi. Bölgenize uygun yöntemi Ayarlar'dan seçebilirsiniz." },
                { q: 'Namaz vakitleri doğru mu?',
                  a: 'Evet. Vakitler, coğrafi koordinatlarınız, yerel saat diliminiz ve seçtiğiniz hesaplama yöntemine göre anlık olarak hesaplanır ve büyük şehirler için resmi kaynaklarla eşleşir.' },
                { q: 'Konumumdan kıble yönünü nasıl bulabilirim?',
                  a: '"Kıble" sayfasını açın — konum izni verdikten sonra Mekke\'deki Kâbe\'ye doğru tam yön açısını hesaplıyor ve etkileşimli pusulada gösteriyoruz.' },
                { q: 'Site hicri takvimi ve tarih dönüştürmeyi destekliyor mu?',
                  a: "Evet. Resmi Ümmü'l-Kura takvimini kullanıyor ve 1–1500 hicri yılları arası Hicri↔Miladi tarih dönüştürmeyi destekliyoruz." },
                { q: 'Site tamamen ücretsiz mi?',
                  a: 'Evet. Tüm özellikler — namaz vakitleri, kıble, zekât hesaplayıcı, dualar, tesbih, hicri takvim — rahatsız edici reklamlar ve üyelik gerektirmeden ücretsizdir.' }
            ],
            ur: [
                { q: 'اس سائٹ پر اوقاتِ نماز کیسے حساب کیے جاتے ہیں؟',
                  a: 'ہم بین الاقوامی طور پر تسلیم شدہ طریقے استعمال کرتے ہیں: مسلم ورلڈ لیگ، ام القریٰ، مصری جنرل اتھارٹی آف سروے، جامعہ علومِ اسلامیہ کراچی۔ آپ اپنے علاقے کے لیے مناسب طریقہ سیٹنگز سے منتخب کر سکتے ہیں۔' },
                { q: 'کیا اوقاتِ نماز درست ہیں؟',
                  a: 'جی ہاں۔ اوقات آپ کے جغرافیائی کوآرڈینیٹس، مقامی ٹائم زون اور منتخب طریقے کی بنیاد پر ریئل ٹائم میں حساب کیے جاتے ہیں اور بڑے شہروں کے سرکاری ذرائع سے مطابقت رکھتے ہیں۔' },
                { q: 'میں اپنے مقام سے قبلہ کی سمت کیسے معلوم کروں؟',
                  a: '"قبلہ" صفحہ کھولیں — مقام کی اجازت دینے کے بعد ہم آپ کی جگہ سے مکہ میں کعبہ کی طرف درست زاویہ حساب کرتے ہیں اور انٹرایکٹو کمپاس پر دکھاتے ہیں۔' },
                { q: 'کیا سائٹ ہجری کیلنڈر اور تاریخ کنورٹ کرنے کو سپورٹ کرتی ہے؟',
                  a: 'جی ہاں۔ ہم سرکاری ام القریٰ کیلنڈر استعمال کرتے ہیں اور 1 تا 1500 ہجری سال کے لیے ہجری↔عیسوی تاریخ کنورژن سپورٹ کرتے ہیں۔' },
                { q: 'کیا سائٹ مکمل طور پر مفت ہے؟',
                  a: 'جی ہاں۔ تمام خصوصیات — اوقاتِ نماز، قبلہ، زکاۃ کیلکولیٹر، دعائیں، تسبیح، ہجری کیلنڈر — بلا کسی مداخلت کار اشتہار یا سائن اپ کے مفت ہیں۔' }
            ],
        };
        const faqs = FAQ_I18N[seo.lang] || FAQ_I18N.ar;
        ssrGraph.push({
            "@type": "FAQPage",
            "@id": `${seo.canonical}#faq`,
            "inLanguage": seo.lang,
            "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a }
            }))
        });
    }

    // Place (country) for country listing pages — /{country-slug}
    if (seo.countryListing) {
        ssrGraph.push({
            "@type": "Place",
            "@id": `${seo.canonical}#country`,
            "name": seo.countryListing.name,
            "description": seo.description,
            "url": seo.canonical,
            "additionalType": "https://schema.org/Country"
        });
    }

    // Round 9 + UAT-Moon-Today-Polish: Moon FAQPage schema — lock to 8
    //   user-curated questions (matching the visible FAQ on /moon-today
    //   exactly to avoid Google Search Console warnings about mismatched
    //   schema). The 8 questions cover the highest-volume search intents:
    //   today's phase, illumination, age, rise/set, next full moon,
    //   constellation-vs-zodiac, moon ↔ Hijri calendar.
    if (seo.moonFaq) {
        const _cityName = seo.moonCity && seo.moonCity.name;
        const MOON_FAQ_I18N = {
            ar: [
                { q: 'ما هو طور القمر اليوم؟',
                  a: 'يَمرّ القمر بثمانية أطوار خلال دورة 29.5 يوم: المحاق، الهلال المتزايد، التربيع الأوّل، الأحدب المتزايد، البدر، الأحدب المتناقص، التربيع الأخير، الهلال المتناقص. يَعرض الموقع الطور الحاليّ ونسبة الإضاءة لحظيّاً' + (_cityName ? ` في ${_cityName}.` : ' حسب موقعك.') },
                { q: 'كم نسبة إضاءة القمر اليوم؟',
                  a: 'تُحسب نسبة الإضاءة فلكيّاً من الزاوية بين الشمس والقمر والأرض (phase angle). تَتراوح بين 0٪ (محاق) و100٪ (بدر مكتمل)، وتُعرض على الموقع لحظيّاً' + (_cityName ? ` لمدينة ${_cityName}.` : ' حسب موقعك.') },
                { q: 'كم عمر القمر اليوم؟',
                  a: 'عمر القمر هو عدد الأيّام المنقضية منذ آخر محاق، ويتراوح بين 0 و29.5 يوم. يَعرض الموقع العمر الدقيق لحظيّاً مع تَحديد موقع القمر في دورته الحاليّة.' },
                { q: 'متى يشرق القمر اليوم؟',
                  a: 'يَعتمد شروق القمر على خطّ الطول الجغرافيّ' + (_cityName ? ` لـ ${_cityName}` : ' لموقعك') + '. يَعرض الموقع وقت الشروق بالتوقيت المحلّيّ بمجرّد تَحديد الموقع.' },
                { q: 'متى يغرب القمر اليوم؟',
                  a: 'يَعتمد غروب القمر على خطّ الطول الجغرافيّ وخطّ العرض' + (_cityName ? ` لـ ${_cityName}` : ' لموقعك') + '. يَعرض الموقع وقت الغروب بالتوقيت المحلّيّ.' },
                { q: 'متى يكون البدر القادم؟',
                  a: 'يَتكرّر البدر كلّ 29.5 يوم. يَعرض الموقع التاريخ الميلاديّ والهجريّ للبدر القادم بدقّة حسابيّة عالية، مع نسبة إضاءة 100٪ ليلة اكتمال القمر.' },
                { q: 'ما الفرق بين الكوكبة والبرج؟',
                  a: 'الكوكبة الفلكيّة (Constellation) هي رقعة من السماء تُحدّدها حدود رسميّة من الاتّحاد الفلكيّ الدوليّ (IAU)، وعددها 88 كوكبة منها 13 على دائرة البروج (تَشمل الحوّاء). أمّا البرج (Zodiac sign) فهو تَقسيم تَنجيميّ يَفترض 12 جزءاً متساويًا (30° لكلّ جزء)، ولا يَعكس الموقع الفلكيّ الفعليّ للقمر. موقعنا يَستخدم الكوكبات الفلكيّة (IAU)، وليس الأبراج التَنجيميّة.' },
                { q: 'ما علاقة دورة القمر بالتقويم الهجريّ؟',
                  a: 'الشهر الهجريّ يَبدأ برؤية هلال القمر بعد غروب الشمس في اليوم الـ29 من الشهر السابق. دورة القمر الكاملة (29.5 يوم) هي أساس التقويم الهجريّ، ولذلك تَتراوح أطوال الشهور بين 29 و30 يومًا. قد يَختلف بدء الشهر الهجريّ يومًا واحدًا حسب الرؤية الشرعيّة في كلّ بلد.' }
            ],
            en: [
                { q: "What moon phase is tonight?",
                  a: "Tonight's moon phase cycles through an approximately 29.5-day lunar month between new moon, crescent, and full moon. This page shows the current phase and illumination percentage in real time" + (_cityName ? ` for ${_cityName}.` : ' based on your location.') },
                { q: 'When is the next full moon?',
                  a: 'A full moon occurs approximately every 29.5 days. We display the precise Gregorian and Hijri dates of the next full moon, when the moon reaches 100% illumination.' },
                { q: _cityName ? `What time does the moon rise tonight in ${_cityName}?` : 'What time does the moon rise tonight?',
                  a: (_cityName ? `Moonrise in ${_cityName}` : 'Moonrise time') + ' depends on the longitude of your location. We calculate and display the exact moonrise and moonset in local time.' },
                { q: 'How is moon illumination calculated?',
                  a: "Moon illumination is the fraction of the moon's surface illuminated by the sun as seen from Earth. It ranges from 0% (new moon) to 100% (full moon), calculated astronomically from the sun-moon-earth angle." },
                { q: 'What is the difference between a new moon and a crescent?',
                  a: 'A new moon is when the moon lies between Earth and the sun (0% illuminated, invisible). A crescent appears 1-2 days after the new moon as the first thin visible arc of light on the western horizon after sunset.' },
                { q: 'When does the next Hijri (Islamic) month begin?',
                  a: 'The next Hijri month begins with the crescent sighting after sunset on the 29th of the current month. We show the expected date based on astronomical calculations; the actual date may vary by one day depending on local crescent visibility.' },
                { q: 'When is the next Ramadan?',
                  a: "The next Ramadan is expected to begin after the crescent of Ramadan is sighted on the 29th of Sha'ban. The final start date depends on local moon sighting in each country." },
                { q: 'When is the next Eid al-Fitr?',
                  a: 'Eid al-Fitr begins with the sighting of the Shawwal crescent on the 29th of Ramadan. It is celebrated on the 1st of Shawwal and lasts for 3 days in many Muslim countries.' },
                { q: 'When is the next Eid al-Adha?',
                  a: "Eid al-Adha falls on the 10th of Dhu al-Hijjah, after the crescent is sighted on the 29th of Dhu al-Qi'dah. It's celebrated for 4 days — the Day of Sacrifice and the days of Tashriq." },
                { q: 'How can I see the crescent moon with the naked eye?',
                  a: 'The crescent appears after sunset on the western horizon, when the moon is at least ~15 hours old, with sufficient altitude and angular distance from the sun. A clear western horizon without clouds or artificial light is needed.' },
                { q: 'What are the 8 phases of the moon?',
                  a: 'The 8 phases are: (1) New Moon, (2) Waxing Crescent, (3) First Quarter, (4) Waxing Gibbous, (5) Full Moon, (6) Waning Gibbous, (7) Last Quarter, (8) Waning Crescent. The full cycle repeats every 29.5 days.' },
                { q: 'Why do moonrise times differ from city to city?',
                  a: "Moonrise depends on the city's longitude. The difference can reach 12 hours between east and west of the globe. Latitude also slightly affects the direction of moonrise." },
                { q: 'What is Laylat al-Qadr (the Night of Power)?',
                  a: 'Laylat al-Qadr is a blessed night in the last 10 days of Ramadan, most likely on the 27th night but possibly any odd night (21, 23, 25, 27, 29). Muslims increase worship, prayer, and Quran recitation on this night.' },
                { q: 'Can the moon be seen during the day?',
                  a: 'Yes, the moon is sometimes visible during the day, especially during first quarter, last quarter, and gibbous phases. At full moon the moon rises at sunset and sets at sunrise, so it is visible only at night.' },
                { q: 'What is a lunar eclipse and why does it happen?',
                  a: 'A lunar eclipse occurs when Earth is positioned between the Sun and Moon, so the Moon enters Earth\'s shadow. It only happens during a full moon, and ranges from partial to total. During a total eclipse the Moon turns dark red — the "blood moon" — caused by sunlight scattering through Earth\'s atmosphere.' },
                { q: 'Why do we always see the same face of the Moon?',
                  a: 'This is called "tidal locking": the Moon\'s rotation period (27.3 days) equals its orbital period around Earth. As a result the same hemisphere always faces Earth, while the opposite side is called the "far side" and was first photographed in 1959 by Soviet probe Luna 3.' },
                { q: 'How does the Moon affect tides?',
                  a: 'Moon gravity pulls ocean water, causing a bulge on the Moon-facing side (high tide) and another on the opposite side due to inertia. Between them are low tides. Roughly two highs and two lows occur daily. When the Moon aligns with the Sun (new or full moon), tides reach maximum — "spring tides".' },
                { q: 'Do lunar phases affect sleep and mood?',
                  a: 'Limited scientific studies suggest some people experience sleep about 20–30 minutes shorter during full moon nights, possibly due to increased sky brightness. The effect is small and varies between individuals; there is no conclusive evidence that the Moon affects mood or behavior generally.' },
                { q: 'Why does the Moon sometimes look yellow or red?',
                  a: 'When the Moon is near the horizon, its light passes through a thicker slice of atmosphere. Blue wavelengths scatter away, leaving red and yellow to reach the eye. This is the same effect that colors sunrise and sunset. Once high in the sky the Moon returns to its silvery-white color.' },
                { q: 'What are a "Blue Moon" and "Supermoon"?',
                  a: 'Blue Moon: the second full moon in the same Gregorian month; occurs about every 2.7 years (it is not actually blue). Supermoon: a full moon coinciding with the Moon\'s closest point to Earth (perigee), making it appear ~14% larger and ~30% brighter than an average full moon.' }
            ],
            fr: [
                { q: `Quelle est la phase de la Lune ce soir ?`,
                  a: "La phase lunaire de ce soir parcourt un cycle d'environ 29,5 jours entre nouvelle lune, croissant et pleine lune. Cette page affiche la phase actuelle et le pourcentage d'illumination en temps réel" + (_cityName ? ` pour ${_cityName}.` : ' selon votre localisation.') },
                { q: `Quand est la prochaine pleine lune ?`,
                  a: `Une pleine lune se produit environ tous les 29,5 jours. Nous affichons les dates grégorienne et hégirienne précises de la prochaine pleine lune, lorsque la Lune atteint 100 % d'illumination.` },
                { q: _cityName ? `À quelle heure la Lune se lève-t-elle ce soir à ${_cityName} ?` : `À quelle heure la Lune se lève-t-elle ce soir ?`,
                  a: (_cityName ? `Le lever de la Lune à ${_cityName}` : "L'heure de lever de la Lune") + " dépend de la longitude de votre localisation. Nous calculons et affichons l'heure exacte de lever et de coucher de la Lune en heure locale." },
                { q: `Comment l'illumination de la Lune est-elle calculée ?`,
                  a: `L'illumination lunaire est la fraction de la surface de la Lune éclairée par le Soleil vue depuis la Terre. Elle varie de 0 % (nouvelle lune) à 100 % (pleine lune), calculée astronomiquement à partir de l'angle Soleil-Lune-Terre.` },
                { q: `Quelle est la différence entre une nouvelle lune et un croissant ?`,
                  a: `La nouvelle lune se produit lorsque la Lune se trouve entre la Terre et le Soleil (0 % d'illumination, invisible). Le croissant apparaît 1 à 2 jours après la nouvelle lune comme un premier arc fin et visible de lumière sur l'horizon occidental après le coucher du soleil.` },
                { q: `Quand commence le prochain mois hégirien (islamique) ?`,
                  a: `Le prochain mois hégirien commence avec l'observation du croissant après le coucher du soleil au 29e jour du mois en cours. Nous affichons la date prévue selon les calculs astronomiques ; la date réelle peut varier d'un jour selon la visibilité locale du croissant.` },
                { q: `Quand est le prochain Ramadan ?`,
                  a: `Le prochain Ramadan devrait commencer après l'observation du croissant de Ramadan au 29e jour de Cha‘ban. La date de début finale dépend de l'observation locale de la Lune dans chaque pays.` },
                { q: `Quand est la prochaine Aïd al-Fitr ?`,
                  a: `L'Aïd al-Fitr commence avec l'observation du croissant de Chawwâl au 29e jour de Ramadan. Elle est célébrée le 1er Chawwâl et dure 3 jours dans de nombreux pays musulmans.` }
            ],
            tr: [
                { q: `Bu gece ayın evresi nedir?`,
                  a: "Bu geceki ay evresi, yeni ay, hilal ve dolunay arasında yaklaşık 29,5 günlük bir kameri ay döngüsünden geçer. Bu sayfa mevcut evreyi ve aydınlanma yüzdesini gerçek zamanlı olarak" + (_cityName ? ` ${_cityName} için gösterir.` : " konumunuza göre gösterir.") },
                { q: `Bir sonraki dolunay ne zaman?`,
                  a: `Dolunay yaklaşık her 29,5 günde bir gerçekleşir. Bir sonraki dolunayın hassas miladi ve hicri tarihlerini, ayın %100 aydınlanmaya ulaştığı anı gösteriyoruz.` },
                { q: _cityName ? `Bu gece ${_cityName} için Ay ne zaman doğar?` : `Bu gece Ay ne zaman doğar?`,
                  a: (_cityName ? `${_cityName} için ay doğuşu` : "Ay doğuş saati") + " konumunuzun boylamına bağlıdır. Tam ay doğuşu ve batışını yerel saate göre hesaplayıp gösteriyoruz." },
                { q: `Ay aydınlanması nasıl hesaplanır?`,
                  a: `Ay aydınlanması, Dünya'dan görüldüğü şekliyle Ay yüzeyinin Güneş tarafından aydınlatılan kısmıdır. %0 (yeni ay) ile %100 (dolunay) arasında değişir ve Güneş-Ay-Dünya açısından astronomik olarak hesaplanır.` },
                { q: `Yeni ay ile hilal arasındaki fark nedir?`,
                  a: `Yeni ay, Ay'ın Dünya ile Güneş arasında bulunduğu andır (%0 aydınlanma, görünmez). Hilal, yeni aydan 1-2 gün sonra batı ufkunda gün batımından sonra görülen ilk ince ışık yayı olarak ortaya çıkar.` },
                { q: `Bir sonraki hicri (İslami) ay ne zaman başlar?`,
                  a: `Bir sonraki hicri ay, mevcut ayın 29. gününün gün batımından sonra hilalin görülmesiyle başlar. Astronomik hesaplara dayanarak beklenen tarihi gösteriyoruz; gerçek tarih yerel hilal görünürlüğüne bağlı olarak bir gün değişebilir.` },
                { q: `Bir sonraki Ramazan ne zaman?`,
                  a: `Bir sonraki Ramazan, Şaban'ın 29. gününde Ramazan hilalinin görülmesinden sonra başlamasının beklendiği tarihtir. Kesin başlangıç tarihi her ülkedeki yerel ay rüyetine bağlıdır.` },
                { q: `Bir sonraki Ramazan Bayramı ne zaman?`,
                  a: `Ramazan Bayramı, Ramazan'ın 29. gününde Şevval hilalinin görülmesiyle başlar. Şevval'in 1. gününde kutlanır ve birçok Müslüman ülkede 3 gün sürer.` }
            ],
            ur: [
                { q: `آج رات چاند کا طور کیا ہے؟`,
                  a: "آج رات چاند کا طور تقریباً 29.5 دن کے قمری ماہ کے دوران نئے چاند، ہلال اور بدر کے درمیان گزرتا ہے۔ یہ صفحہ موجودہ طور اور روشنی کا فیصد حقیقی وقت میں" + (_cityName ? ` ${_cityName} کے لیے دکھاتا ہے۔` : " آپ کے مقام کے مطابق دکھاتا ہے۔") },
                { q: `اگلا بدر کب ہوگا؟`,
                  a: `بدر تقریباً ہر 29.5 دن میں ہوتا ہے۔ ہم اگلے بدر کی درست عیسوی اور ہجری تاریخیں دکھاتے ہیں، جب چاند 100% روشنی تک پہنچ جاتا ہے۔` },
                { q: _cityName ? `آج رات ${_cityName} میں چاند کب طلوع ہوگا؟` : `آج رات چاند کب طلوع ہوگا؟`,
                  a: (_cityName ? `${_cityName} میں مطلعِ چاند` : "مطلعِ چاند کا وقت") + " آپ کے مقام کے خط طول پر منحصر ہے۔ ہم درست مطلع اور مغیبِ چاند کا حساب لگا کر مقامی وقت میں دکھاتے ہیں۔" },
                { q: `چاند کی روشنی کا حساب کیسے لگایا جاتا ہے؟`,
                  a: `چاند کی روشنی زمین سے دیکھے جانے والے چاند کی سطح کا وہ حصہ ہے جسے سورج روشن کرتا ہے۔ یہ 0% (نیا چاند) سے 100% (بدر) تک ہوتا ہے، اور سورج-چاند-زمین کے زاویے سے فلکیاتی طور پر شمار کیا جاتا ہے۔` },
                { q: `نئے چاند اور ہلال کے درمیان کیا فرق ہے؟`,
                  a: `نیا چاند وہ لمحہ ہے جب چاند زمین اور سورج کے درمیان ہوتا ہے (0% روشن، نظر نہیں آتا)۔ ہلال نئے چاند کے 1-2 دن بعد مغرب کے بعد مغربی افق پر روشنی کے پہلے باریک قوس کے طور پر نمودار ہوتا ہے۔` },
                { q: `اگلا ہجری (اسلامی) مہینہ کب شروع ہوگا؟`,
                  a: `اگلا ہجری مہینہ موجودہ مہینے کی 29ویں تاریخ کو غروبِ آفتاب کے بعد ہلال نظر آنے سے شروع ہوتا ہے۔ ہم فلکیاتی حسابات کے مطابق متوقع تاریخ دکھاتے ہیں؛ اصل تاریخ مقامی رؤیتِ ہلال کے مطابق ایک دن مختلف ہو سکتی ہے۔` },
                { q: `اگلا رمضان کب ہوگا؟`,
                  a: `اگلا رمضان شعبان کی 29ویں تاریخ کو رمضان کا ہلال دیکھے جانے کے بعد شروع ہونے کی توقع ہے۔ آغاز کی حتمی تاریخ ہر ملک میں مقامی رؤیتِ ہلال پر منحصر ہے۔` },
                { q: `اگلی عید الفطر کب ہوگی؟`,
                  a: `عید الفطر رمضان کی 29ویں تاریخ کو شوال کا ہلال دیکھے جانے سے شروع ہوتی ہے۔ یہ شوال کی پہلی تاریخ کو منائی جاتی ہے اور بہت سے مسلم ممالک میں 3 دن تک رہتی ہے۔` }
            ],
            de: [
                { q: `Welche Mondphase ist heute Nacht?`,
                  a: "Die heutige Mondphase durchläuft einen etwa 29,5-tägigen Mondzyklus zwischen Neumond, Sichel und Vollmond. Diese Seite zeigt die aktuelle Phase und den Beleuchtungsprozentsatz in Echtzeit" + (_cityName ? ` für ${_cityName}.` : " basierend auf Ihrem Standort.") },
                { q: `Wann ist der nächste Vollmond?`,
                  a: `Ein Vollmond tritt etwa alle 29,5 Tage auf. Wir zeigen die genauen gregorianischen und Hidschri-Daten des nächsten Vollmonds, wenn der Mond 100 % Beleuchtung erreicht.` },
                { q: _cityName ? `Wann geht der Mond heute Nacht in ${_cityName} auf?` : `Wann geht der Mond heute Nacht auf?`,
                  a: (_cityName ? `Der Mondaufgang in ${_cityName}` : "Die Mondaufgangszeit") + " hängt von der geografischen Länge Ihres Standorts ab. Wir berechnen und zeigen den exakten Mondauf- und -untergang in Ortszeit." },
                { q: `Wie wird die Mondbeleuchtung berechnet?`,
                  a: `Die Mondbeleuchtung ist der Anteil der Mondoberfläche, der von der Sonne beleuchtet wird, von der Erde aus gesehen. Sie reicht von 0 % (Neumond) bis 100 % (Vollmond) und wird astronomisch aus dem Sonne-Mond-Erde-Winkel berechnet.` },
                { q: `Was ist der Unterschied zwischen Neumond und Sichelmond?`,
                  a: `Ein Neumond liegt zwischen Erde und Sonne (0 % beleuchtet, unsichtbar). Eine Sichel erscheint 1–2 Tage nach dem Neumond als erster dünner sichtbarer Lichtbogen am westlichen Horizont nach Sonnenuntergang.` },
                { q: `Wann beginnt der nächste Hidschri-Monat (islamischer Monat)?`,
                  a: `Der nächste Hidschri-Monat beginnt mit der Sichtung der Mondsichel nach Sonnenuntergang am 29. Tag des aktuellen Monats. Wir zeigen das anhand astronomischer Berechnungen erwartete Datum; das tatsächliche Datum kann je nach lokaler Sichtbarkeit der Sichel um einen Tag variieren.` },
                { q: `Wann ist der nächste Ramadan?`,
                  a: `Der nächste Ramadan beginnt voraussichtlich nach der Sichtung der Ramadan-Sichel am 29. Schaʿbān. Das endgültige Startdatum hängt von der lokalen Mondsichtung in jedem Land ab.` },
                { q: `Wann ist das nächste Eid al-Fitr?`,
                  a: `Eid al-Fitr beginnt mit der Sichtung der Schawwāl-Sichel am 29. Ramadan. Es wird am 1. Schawwāl gefeiert und dauert in vielen muslimischen Ländern 3 Tage.` }
            ],
            id: [
                { q: `Apa fase bulan malam ini?`,
                  a: "Fase bulan malam ini melewati siklus bulan sekitar 29,5 hari antara bulan baru, hilal dan purnama. Halaman ini menampilkan fase saat ini dan persentase iluminasi secara real-time" + (_cityName ? ` untuk ${_cityName}.` : " berdasarkan lokasi Anda.") },
                { q: `Kapan bulan purnama berikutnya?`,
                  a: `Bulan purnama terjadi sekitar setiap 29,5 hari. Kami menampilkan tanggal Masehi dan Hijriah yang tepat untuk bulan purnama berikutnya, saat Bulan mencapai iluminasi 100%.` },
                { q: _cityName ? `Pukul berapa Bulan terbit malam ini di ${_cityName}?` : `Pukul berapa Bulan terbit malam ini?`,
                  a: (_cityName ? `Terbit Bulan di ${_cityName}` : "Waktu terbit Bulan") + " tergantung pada bujur lokasi Anda. Kami menghitung dan menampilkan waktu terbit dan terbenam Bulan yang tepat dalam waktu setempat." },
                { q: `Bagaimana iluminasi bulan dihitung?`,
                  a: `Iluminasi bulan adalah fraksi permukaan Bulan yang disinari Matahari sebagaimana terlihat dari Bumi. Berkisar dari 0% (bulan baru) hingga 100% (purnama), dihitung secara astronomis dari sudut Matahari-Bulan-Bumi.` },
                { q: `Apa bedanya bulan baru dengan hilal?`,
                  a: `Bulan baru adalah saat Bulan berada antara Bumi dan Matahari (iluminasi 0%, tidak terlihat). Hilal muncul 1-2 hari setelah bulan baru sebagai busur cahaya tipis pertama yang terlihat di ufuk barat setelah matahari terbenam.` },
                { q: `Kapan bulan Hijriah (Islam) berikutnya dimulai?`,
                  a: `Bulan Hijriah berikutnya dimulai dengan rukyat hilal setelah matahari terbenam pada tanggal 29 bulan berjalan. Kami menampilkan tanggal yang diperkirakan berdasarkan perhitungan astronomis; tanggal sebenarnya dapat berbeda satu hari tergantung visibilitas hilal lokal.` },
                { q: `Kapan Ramadan berikutnya?`,
                  a: `Ramadan berikutnya diperkirakan dimulai setelah hilal Ramadan terlihat pada 29 Sya'ban. Tanggal mulai final tergantung pada rukyat hilal lokal di setiap negara.` },
                { q: `Kapan Idul Fitri berikutnya?`,
                  a: `Idul Fitri dimulai dengan rukyat hilal Syawal pada 29 Ramadan. Dirayakan pada 1 Syawal dan berlangsung 3 hari di banyak negara Muslim.` }
            ],
            es: [
                { q: `¿Cuál es la fase lunar de esta noche?`,
                  a: "La fase lunar de esta noche atraviesa un ciclo lunar de aproximadamente 29,5 días entre luna nueva, creciente y luna llena. Esta página muestra la fase actual y el porcentaje de iluminación en tiempo real" + (_cityName ? ` para ${_cityName}.` : " según su ubicación.") },
                { q: `¿Cuándo es la próxima luna llena?`,
                  a: `Una luna llena ocurre aproximadamente cada 29,5 días. Mostramos las fechas gregoriana e hijri precisas de la próxima luna llena, cuando la Luna alcanza el 100 % de iluminación.` },
                { q: _cityName ? `¿A qué hora sale la Luna esta noche en ${_cityName}?` : `¿A qué hora sale la Luna esta noche?`,
                  a: (_cityName ? `La salida de la Luna en ${_cityName}` : "La hora de salida de la Luna") + " depende de la longitud de su ubicación. Calculamos y mostramos la salida y puesta exactas de la Luna en hora local." },
                { q: `¿Cómo se calcula la iluminación lunar?`,
                  a: `La iluminación lunar es la fracción de la superficie de la Luna iluminada por el Sol vista desde la Tierra. Va del 0 % (luna nueva) al 100 % (luna llena), calculada astronómicamente a partir del ángulo Sol-Luna-Tierra.` },
                { q: `¿Cuál es la diferencia entre luna nueva y creciente?`,
                  a: `La luna nueva ocurre cuando la Luna se sitúa entre la Tierra y el Sol (0 % iluminada, invisible). El creciente aparece 1-2 días después como el primer arco fino visible de luz en el horizonte occidental tras la puesta del sol.` },
                { q: `¿Cuándo comienza el próximo mes hijri (islámico)?`,
                  a: `El próximo mes hijri comienza con la observación del creciente tras la puesta del sol del día 29 del mes actual. Mostramos la fecha esperada según cálculos astronómicos; la fecha real puede variar un día según la visibilidad local del creciente.` },
                { q: `¿Cuándo es el próximo Ramadán?`,
                  a: `El próximo Ramadán comenzará tras la observación del creciente de Ramadán el 29 de Sha'ban. La fecha final de inicio depende de la observación local de la Luna en cada país.` },
                { q: `¿Cuándo es el próximo Eid al-Fitr?`,
                  a: `El Eid al-Fitr comienza con la observación del creciente de Shawwal el 29 de Ramadán. Se celebra el 1 de Shawwal y dura 3 días en muchos países musulmanes.` }
            ],
            bn: [
                { q: `আজ রাতে চাঁদের দশা কী?`,
                  a: "আজ রাতে চাঁদের দশা প্রায় ২৯.৫ দিনের চান্দ্র মাসে অমাবস্যা, হিলাল ও পূর্ণিমার মধ্য দিয়ে চলে। এই পৃষ্ঠা বর্তমান দশা ও আলোকন শতাংশ রিয়েল-টাইমে" + (_cityName ? ` ${_cityName}-এর জন্য দেখায়।` : " আপনার অবস্থান অনুযায়ী দেখায়।") },
                { q: `পরবর্তী পূর্ণিমা কখন?`,
                  a: `পূর্ণিমা প্রায় প্রতি ২৯.৫ দিন পর পর ঘটে। আমরা পরবর্তী পূর্ণিমার সঠিক খ্রিস্টীয় ও হিজরি তারিখ দেখাই, যখন চাঁদ ১০০% আলোকনে পৌঁছায়।` },
                { q: _cityName ? `আজ রাতে ${_cityName}-এ চাঁদ কখন উদয় হবে?` : `আজ রাতে চাঁদ কখন উদয় হবে?`,
                  a: (_cityName ? `${_cityName}-এ চাঁদ উদয়` : "চাঁদ উদয়ের সময়") + " আপনার অবস্থানের দ্রাঘিমাংশের উপর নির্ভর করে। আমরা স্থানীয় সময়ে চাঁদের সঠিক উদয় ও অস্ত গণনা করে দেখাই।" },
                { q: `চাঁদের আলোকন কীভাবে হিসাব করা হয়?`,
                  a: `চাঁদের আলোকন হল পৃথিবী থেকে দেখা সূর্য দ্বারা আলোকিত চাঁদের পৃষ্ঠের অংশ। এটি ০% (অমাবস্যা) থেকে ১০০% (পূর্ণিমা) পর্যন্ত হয়, সূর্য-চাঁদ-পৃথিবী কোণ থেকে জ্যোতির্বিজ্ঞান অনুসারে গণনা করা হয়।` },
                { q: `অমাবস্যা ও হিলালের মধ্যে পার্থক্য কী?`,
                  a: `অমাবস্যা হল যখন চাঁদ পৃথিবী ও সূর্যের মাঝে থাকে (০% আলোকিত, অদৃশ্য)। হিলাল অমাবস্যার ১-২ দিন পর পশ্চিম দিগন্তে সূর্যাস্তের পর প্রথম পাতলা দৃশ্যমান আলোক চাপ হিসেবে আবির্ভূত হয়।` },
                { q: `পরবর্তী হিজরি (ইসলামী) মাস কখন শুরু হবে?`,
                  a: `পরবর্তী হিজরি মাস বর্তমান মাসের ২৯তম দিনের সূর্যাস্তের পর হিলাল দেখার মাধ্যমে শুরু হয়। আমরা জ্যোতির্বিজ্ঞান গণনা অনুযায়ী প্রত্যাশিত তারিখ দেখাই; প্রকৃত তারিখ স্থানীয় হিলাল দৃশ্যমানতা অনুসারে এক দিন ভিন্ন হতে পারে।` },
                { q: `পরবর্তী রমজান কখন?`,
                  a: `পরবর্তী রমজান শাবানের ২৯তম দিনে রমজানের হিলাল দেখার পর শুরু হবে বলে আশা করা হচ্ছে। চূড়ান্ত শুরুর তারিখ প্রতিটি দেশে স্থানীয় চাঁদ দেখার উপর নির্ভর করে।` },
                { q: `পরবর্তী ঈদুল ফিতর কখন?`,
                  a: `ঈদুল ফিতর রমজানের ২৯তম দিনে শাওয়ালের হিলাল দেখার মাধ্যমে শুরু হয়। এটি শাওয়ালের ১ তারিখে উদযাপিত হয় এবং অনেক মুসলিম দেশে ৩ দিন স্থায়ী হয়।` }
            ],
            ms: [
                { q: `Apakah fasa bulan malam ini?`,
                  a: "Fasa bulan malam ini melalui kitaran bulan kira-kira 29.5 hari antara anak bulan, hilal dan bulan purnama. Halaman ini memaparkan fasa semasa dan peratus pencahayaan secara masa nyata" + (_cityName ? ` untuk ${_cityName}.` : " berdasarkan lokasi anda.") },
                { q: `Bilakah bulan purnama seterusnya?`,
                  a: `Bulan purnama berlaku kira-kira setiap 29.5 hari. Kami memaparkan tarikh Masihi dan Hijrah tepat bagi bulan purnama seterusnya, ketika Bulan mencapai pencahayaan 100%.` },
                { q: _cityName ? `Pukul berapa Bulan terbit malam ini di ${_cityName}?` : `Pukul berapa Bulan terbit malam ini?`,
                  a: (_cityName ? `Terbit Bulan di ${_cityName}` : "Waktu terbit Bulan") + " bergantung pada bujur lokasi anda. Kami mengira dan memaparkan masa terbit dan terbenam Bulan yang tepat dalam waktu tempatan." },
                { q: `Bagaimana pencahayaan bulan dikira?`,
                  a: `Pencahayaan bulan ialah pecahan permukaan Bulan yang diterangi Matahari seperti dilihat dari Bumi. Ia berjulat dari 0% (anak bulan) hingga 100% (bulan purnama), dikira secara astronomi daripada sudut Matahari-Bulan-Bumi.` },
                { q: `Apakah perbezaan antara anak bulan dan hilal?`,
                  a: `Anak bulan adalah ketika Bulan berada antara Bumi dan Matahari (0% pencahayaan, tidak kelihatan). Hilal muncul 1-2 hari selepas anak bulan sebagai lengkok cahaya nipis pertama yang kelihatan di ufuk barat selepas matahari terbenam.` },
                { q: `Bilakah bulan Hijrah (Islam) seterusnya bermula?`,
                  a: `Bulan Hijrah seterusnya bermula dengan rukyah hilal selepas matahari terbenam pada 29 hari bulan semasa. Kami memaparkan tarikh yang dijangka berdasarkan pengiraan astronomi; tarikh sebenar mungkin berbeza sehari mengikut kelihatan hilal tempatan.` },
                { q: `Bilakah Ramadan seterusnya?`,
                  a: `Ramadan seterusnya dijangka bermula selepas rukyah hilal Ramadan pada 29 Syaaban. Tarikh mula akhir bergantung pada rukyah bulan tempatan di setiap negara.` },
                { q: `Bilakah Aidilfitri seterusnya?`,
                  a: `Aidilfitri bermula dengan rukyah hilal Syawal pada 29 Ramadan. Ia disambut pada 1 Syawal dan berlangsung selama 3 hari di banyak negara Muslim.` }
            ],
        };
        // UAT-Moon-City-Hub-Polish: on /moon-in-{city} (city evergreen hub)
        //   the visible FAQ is a HUB-SPECIFIC 8-question set (calendar usage,
        //   timezone, constellation vs zodiac, etc.). JSON-LD must mirror
        //   exactly to avoid GSC mismatch warnings.
        let moonFaqs;
        const _isMoonMonthFaq = !!(seo.moonCity && seo.moonCity.isMonthPage);
        // UAT-Moon-Day-Page-Polish: 4th FAQ branch for /moon-in-{city}/{YYYY-MM-DD}.
        //   Distinct from hub (evergreen) and month (calendar) — these are
        //   archived/future date pages with 6 date-aware Qs (matches visible
        //   DOM exactly per app.js _DATE_FAQ override). No "today" wording.
        const _isMoonDateFaq = !!(seo.moonCity && seo.moonCity.date && !_isMoonMonthFaq);
        const _isMoonHubFaq = !!(seo.moonCity && seo.moonCity.isHub && !seo.moonCity.date && !_isMoonMonthFaq);
        if (_isMoonMonthFaq) {
            // UAT-Moon-Month-Page-Polish: month page (/moon-in-{city}/YYYY-MM)
            //   gets its own 8 Qs centered on the monthly calendar — different
            //   from the hub FAQ (which is calendar-evergreen) and the today
            //   FAQ (which is current-status). DOM mirrors these exactly.
            const _mthCity = (seo.moonCity && seo.moonCity.name) || '';
            const _mthY    = seo.moonCity.monthYear;
            const _mthMo   = seo.moonCity.monthMonth;
            // Phase D3.1b: 10-lang month-name table (was: AR+EN only)
            const _MTH_NAMES_BY_LANG = {
                ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
                en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
                tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
                ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
                de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
                id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
                es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
                bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
                ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']
            };
            const _mthName = (_MTH_NAMES_BY_LANG[seo.lang] || _MTH_NAMES_BY_LANG.en)[_mthMo - 1];
            // Phase D3.1b: 10-lang month FAQ (was: AR+EN only — 8 langs fell back to en)
            const _MOON_MONTH_FAQ_BY_LANG = {
                ar: [
                { q: `ما هو تقويم القمر في ${_mthCity} لشهر ${_mthName} ${_mthY}؟`,
                  a: `يَعرض هذا التقويم أطوار القمر اليوميّة في ${_mthCity} خلال شهر ${_mthName} ${_mthY}، من الهلال والأحدب إلى البدر والمحاق، مع نسبة الإضاءة ومواعيد الشروق والغروب لكلّ يوم.` },
                { q: `ما هو طور القمر اليوم في ${_mthCity}؟`,
                  a: `يَعرض الموقع طور القمر الحاليّ ونسبة إضاءته لحظيّاً حسب موقع ${_mthCity}، ضمن سياق التقويم الشهريّ المعروض هنا.` },
                { q: `متى يكون البدر في ${_mthCity} خلال ${_mthName} ${_mthY}؟`,
                  a: `قسم "الأطوار القمريّة القادمة" في الصفحة يَعرض موعد البدر القادم في ${_mthCity} مع التاريخ الميلاديّ والهجريّ الدقيق. خلال شهر ${_mthName} ${_mthY}، البدر يَظهر بإضاءة 100٪ في الليلة المحدّدة.` },
                { q: `متى يكون المحاق في ${_mthCity} خلال ${_mthName} ${_mthY}؟`,
                  a: `قسم "الأطوار القمريّة القادمة" يَعرض موعد المحاق القادم — وهو الذي يَبدأ به الشهر الهجريّ الجديد. المحاق هو لحظة وقوع القمر بين الأرض والشمس بإضاءة 0٪.` },
                { q: 'كيف أقرأ تقويم أطوار القمر الشهريّ؟',
                  a: 'كلّ خانة في التقويم تُمثّل يومًا واحدًا وتُظهر: التاريخ، إيموجي طور القمر، اسم الطور (محاق، هلال، تربيع، أحدب، بدر)، والمسافة الزمنيّة من اليوم الحاليّ. اضغط على أيّ يوم لفتح صفحة تَفاصيل ذلك اليوم.' },
                { q: 'لماذا تَختلف مواعيد شروق وغروب القمر بين المدن؟',
                  a: `يَعتمد شروق وغروب القمر على خطّ الطول والعرض الجغرافيّ والمنطقة الزمنيّة. الفرق قد يَصل إلى 12 ساعة بين شرق وغرب الأرض. بيانات هذه الصفحة محسوبة بالتوقيت المحلّيّ لـ ${_mthCity}.` },
                { q: `هل يَعتمد هذا التقويم على توقيت ${_mthCity} المحلّيّ؟`,
                  a: `نعم. كلّ مواعيد الشروق والغروب وأوقات البدر/المحاق محسوبة بالتوقيت المحلّيّ لـ ${_mthCity}. الإحداثيّات الجغرافيّة لهذه المدينة تُؤثّر على الاتّجاه والارتفاع أيضًا.` },
                { q: 'ما علاقة أطوار القمر بالتقويم الهجريّ؟',
                  a: 'التقويم الهجريّ قمريّ بالكامل: كلّ شهر يَبدأ برؤية الهلال بعد المحاق ويَستمرّ 29 أو 30 يومًا. مَواعيد البدر والمحاق في هذا التقويم تُساعد على تَوقّع بداية الشهر الهجريّ القادم.' }
                ],
                en: [
                { q: `What is the moon calendar in ${_mthCity} for ${_mthName} ${_mthY}?`,
                  a: `This calendar shows daily moon phases in ${_mthCity} during ${_mthName} ${_mthY} — crescent, gibbous, full and new moon — with illumination and rise/set times for each day.` },
                { q: `What is the moon phase today in ${_mthCity}?`,
                  a: `The site shows the current phase and illumination live for ${_mthCity}, within the context of this monthly calendar.` },
                { q: `When is the full moon in ${_mthCity} during ${_mthName} ${_mthY}?`,
                  a: `The "Upcoming moon phases" section above shows the precise full moon date in ${_mthCity}. During ${_mthName} ${_mthY}, the full moon reaches 100% illumination on the specified night.` },
                { q: `When is the new moon in ${_mthCity} during ${_mthName} ${_mthY}?`,
                  a: `The "Upcoming moon phases" section shows the next new moon date — which marks the start of the new Hijri month. New moon is when the Moon lies between Earth and Sun (0% illumination).` },
                { q: 'How do I read the monthly moon phase calendar?',
                  a: 'Each cell represents one day and shows: the date, moon phase emoji, phase name (new, crescent, quarter, gibbous, full), and relative offset from today. Click any day to open that day\'s detail page.' },
                { q: 'Why do moonrise and moonset times differ between cities?',
                  a: `Moonrise and moonset depend on longitude, latitude and timezone. The difference can reach 12 hours between east and west of the globe. Times on this page are computed for ${_mthCity}'s local timezone.` },
                { q: `Is this calendar in ${_mthCity}'s local time?`,
                  a: `Yes. All moonrise/moonset and full/new moon times are computed in ${_mthCity}'s local timezone. The city's geographic coordinates also affect direction and altitude.` },
                { q: 'How are moon phases related to the Hijri calendar?',
                  a: 'The Hijri calendar is fully lunar — each month begins with the crescent sighting after the new moon and lasts 29 or 30 days. Full moon and new moon dates in this calendar help anticipate the start of the next Hijri month.' }
                ],
                fr: [
                    { q: `Quel est le calendrier lunaire à ${_mthCity} pour ${_mthName} ${_mthY} ?`,
                      a: `Ce calendrier affiche les phases lunaires quotidiennes à ${_mthCity} durant ${_mthName} ${_mthY} — croissant, gibbeuse, pleine et nouvelle lune — avec illumination et heures de lever/coucher pour chaque jour.` },
                    { q: `Quelle est la phase de la Lune aujourd'hui à ${_mthCity} ?`,
                      a: `Le site affiche la phase actuelle et l'illumination en direct pour ${_mthCity}, dans le contexte de ce calendrier mensuel.` },
                    { q: `Quand est la pleine lune à ${_mthCity} en ${_mthName} ${_mthY} ?`,
                      a: `La section "Prochaines phases lunaires" ci-dessus affiche la date précise de la pleine lune à ${_mthCity}. Pendant ${_mthName} ${_mthY}, la pleine lune atteint 100 % d'illumination la nuit indiquée.` },
                    { q: `Quand est la nouvelle lune à ${_mthCity} en ${_mthName} ${_mthY} ?`,
                      a: `La section "Prochaines phases lunaires" affiche la prochaine date de nouvelle lune — qui marque le début du nouveau mois hégirien. La nouvelle lune se produit lorsque la Lune est entre la Terre et le Soleil (0 % d'illumination).` },
                    { q: `Comment lire le calendrier mensuel des phases lunaires ?`,
                      a: `Chaque case représente un jour et affiche : la date, l'emoji de phase lunaire, le nom de la phase (nouvelle, croissant, quartier, gibbeuse, pleine), et le décalage relatif par rapport à aujourd'hui. Cliquez sur n'importe quel jour pour ouvrir sa page de détails.` },
                    { q: `Pourquoi les heures de lever et coucher de la Lune diffèrent-elles entre villes ?`,
                      a: `Le lever et le coucher de la Lune dépendent de la longitude, de la latitude et du fuseau horaire. La différence peut atteindre 12 heures entre l'est et l'ouest du globe. Les heures de cette page sont calculées pour le fuseau horaire local de ${_mthCity}.` },
                    { q: `Ce calendrier est-il à l'heure locale de ${_mthCity} ?`,
                      a: `Oui. Toutes les heures de lever/coucher de la Lune et de pleine/nouvelle lune sont calculées dans le fuseau horaire local de ${_mthCity}. Les coordonnées géographiques de la ville affectent également la direction et l'altitude.` },
                    { q: `Comment les phases lunaires sont-elles liées au calendrier hégirien ?`,
                      a: `Le calendrier hégirien est entièrement lunaire — chaque mois commence avec l'observation du croissant après la nouvelle lune et dure 29 ou 30 jours. Les dates de pleine et nouvelle lune dans ce calendrier aident à anticiper le début du prochain mois hégirien.` }
                ],
                tr: [
                    { q: `${_mthCity} için ${_mthName} ${_mthY} ay takvimi nedir?`,
                      a: `Bu takvim, ${_mthCity}'de ${_mthName} ${_mthY} boyunca günlük ay evrelerini — hilal, gibbous, dolunay ve yeni ay — her gün için aydınlanma ve doğuş/batış saatleriyle gösterir.` },
                    { q: `${_mthCity}'de bugün ay evresi nedir?`,
                      a: `Site, bu aylık takvim bağlamında ${_mthCity} için güncel evreyi ve aydınlanmayı canlı olarak gösterir.` },
                    { q: `${_mthName} ${_mthY} sırasında ${_mthCity}'de dolunay ne zaman?`,
                      a: `Yukarıdaki "Yaklaşan ay evreleri" bölümü ${_mthCity}'de tam dolunay tarihini gösterir. ${_mthName} ${_mthY} sırasında dolunay belirtilen gece %100 aydınlanmaya ulaşır.` },
                    { q: `${_mthName} ${_mthY} sırasında ${_mthCity}'de yeni ay ne zaman?`,
                      a: `"Yaklaşan ay evreleri" bölümü bir sonraki yeni ay tarihini gösterir — bu yeni hicri ayın başlangıcını işaret eder. Yeni ay, Ay'ın Dünya ve Güneş arasında bulunduğu andır (%0 aydınlanma).` },
                    { q: `Aylık ay evresi takvimini nasıl okurum?`,
                      a: `Her hücre bir günü temsil eder ve şunları gösterir: tarih, ay evresi emojisi, evre adı (yeni, hilal, dördün, gibbous, dolunay) ve bugüne göre göreceli fark. Herhangi bir güne tıklayarak ayrıntı sayfasını açabilirsiniz.` },
                    { q: `Ay doğuşu ve batışı saatleri şehirler arasında neden farklı?`,
                      a: `Ay doğuşu ve batışı boylama, enleme ve saat dilimine bağlıdır. Fark, dünyanın doğusu ile batısı arasında 12 saate ulaşabilir. Bu sayfadaki saatler ${_mthCity}'in yerel saat dilimi için hesaplanmıştır.` },
                    { q: `Bu takvim ${_mthCity}'in yerel saatinde mi?`,
                      a: `Evet. Tüm ay doğuşu/batışı ve dolunay/yeni ay saatleri ${_mthCity}'in yerel saat diliminde hesaplanır. Şehrin coğrafi koordinatları da yön ve yüksekliği etkiler.` },
                    { q: `Ay evreleri hicri takvim ile nasıl ilişkilidir?`,
                      a: `Hicri takvim tamamen kameridir — her ay yeni aydan sonra hilal görülmesiyle başlar ve 29 veya 30 gün sürer. Bu takvimdeki dolunay ve yeni ay tarihleri, bir sonraki hicri ayın başlangıcını öngörmeye yardımcı olur.` }
                ],
                ur: [
                    { q: `${_mthCity} میں ${_mthName} ${_mthY} کے لیے چاند کا کیلنڈر کیا ہے؟`,
                      a: `یہ کیلنڈر ${_mthCity} میں ${_mthName} ${_mthY} کے دوران چاند کے روزانہ اطوار — ہلال، اَحدب، بدر اور نیا چاند — ہر دن کے لیے روشنی اور مطلع/مغیب کے اوقات کے ساتھ دکھاتا ہے۔` },
                    { q: `${_mthCity} میں آج چاند کا طور کیا ہے؟`,
                      a: `یہ سائٹ اس ماہانہ کیلنڈر کے سیاق میں ${_mthCity} کے لیے موجودہ طور اور روشنی براہِ راست دکھاتی ہے۔` },
                    { q: `${_mthName} ${_mthY} کے دوران ${_mthCity} میں بدر کب ہوگا؟`,
                      a: `اوپر "آنے والی چاند کی اطوار" سیکشن ${_mthCity} میں درست بدر کی تاریخ دکھاتا ہے۔ ${_mthName} ${_mthY} کے دوران بدر مقررہ رات کو 100% روشنی پر پہنچ جاتا ہے۔` },
                    { q: `${_mthName} ${_mthY} کے دوران ${_mthCity} میں نیا چاند کب ہوگا؟`,
                      a: `"آنے والی چاند کی اطوار" سیکشن اگلی نئے چاند کی تاریخ دکھاتا ہے — جو نئے ہجری مہینے کا آغاز ہے۔ نیا چاند وہ لمحہ ہے جب چاند زمین اور سورج کے درمیان ہوتا ہے (0% روشنی)۔` },
                    { q: `ماہانہ چاند کی اطوار کا کیلنڈر کیسے پڑھیں؟`,
                      a: `ہر خانہ ایک دن کی نمائندگی کرتا ہے اور دکھاتا ہے: تاریخ، چاند کی طور کا ایموجی، طور کا نام (نیا، ہلال، تربیع، اَحدب، بدر) اور آج سے نسبتی فرق۔ کسی بھی دن پر کلک کر کے اس کی تفصیلی صفحہ کھولیں۔` },
                    { q: `چاند کی مطلع و مغیب کے اوقات شہروں کے درمیان کیوں مختلف ہیں؟`,
                      a: `چاند کی مطلع و مغیب خط طول، خط عرض اور ٹائم زون پر منحصر ہیں۔ زمین کے مشرق اور مغرب کے درمیان فرق 12 گھنٹے تک پہنچ سکتا ہے۔ اس صفحے کے اوقات ${_mthCity} کے مقامی ٹائم زون کے لیے شمار کیے گئے ہیں۔` },
                    { q: `کیا یہ کیلنڈر ${_mthCity} کے مقامی وقت میں ہے؟`,
                      a: `جی ہاں۔ تمام مطلع/مغیبِ چاند اور بدر/نئے چاند کے اوقات ${_mthCity} کے مقامی ٹائم زون میں شمار کیے جاتے ہیں۔ شہر کی جغرافیائی محل وقوع بھی اتجاہ اور ارتفاع کو متاثر کرتی ہے۔` },
                    { q: `چاند کی اطوار کا ہجری تقویم سے کیا تعلق ہے؟`,
                      a: `ہجری تقویم مکمل طور پر قمری ہے — ہر مہینہ نئے چاند کے بعد ہلال کی رؤیت سے شروع ہوتا ہے اور 29 یا 30 دن تک رہتا ہے۔ اس کیلنڈر میں بدر اور نئے چاند کی تاریخیں اگلے ہجری مہینے کے آغاز کا اندازہ لگانے میں مدد کرتی ہیں۔` }
                ],
                de: [
                    { q: `Was ist der Mondkalender in ${_mthCity} für ${_mthName} ${_mthY}?`,
                      a: `Dieser Kalender zeigt die täglichen Mondphasen in ${_mthCity} während ${_mthName} ${_mthY} — Sichelmond, abnehmender/zunehmender Mond, Vollmond und Neumond — mit Beleuchtung und Auf-/Untergangszeiten für jeden Tag.` },
                    { q: `Welche Mondphase ist heute in ${_mthCity}?`,
                      a: `Die Seite zeigt die aktuelle Phase und Beleuchtung live für ${_mthCity}, im Kontext dieses Monatskalenders.` },
                    { q: `Wann ist der Vollmond in ${_mthCity} während ${_mthName} ${_mthY}?`,
                      a: `Der Abschnitt "Kommende Mondphasen" oben zeigt das genaue Vollmonddatum in ${_mthCity}. Während ${_mthName} ${_mthY} erreicht der Vollmond in der angegebenen Nacht 100 % Beleuchtung.` },
                    { q: `Wann ist der Neumond in ${_mthCity} während ${_mthName} ${_mthY}?`,
                      a: `Der Abschnitt "Kommende Mondphasen" zeigt das nächste Neumonddatum — das den Beginn des neuen Hidschri-Monats markiert. Neumond ist, wenn der Mond zwischen Erde und Sonne liegt (0 % Beleuchtung).` },
                    { q: `Wie lese ich den monatlichen Mondphasen-Kalender?`,
                      a: `Jede Zelle stellt einen Tag dar und zeigt: das Datum, das Mondphasen-Emoji, den Phasennamen (Neumond, Sichel, Viertel, Gibbös, Vollmond) und den relativen Versatz von heute. Klicken Sie auf einen beliebigen Tag, um seine Detailseite zu öffnen.` },
                    { q: `Warum unterscheiden sich Mondaufgangs- und -untergangszeiten zwischen Städten?`,
                      a: `Mondaufgang und -untergang hängen von der geografischen Länge, Breite und Zeitzone ab. Der Unterschied kann zwischen Ost und West der Erde 12 Stunden erreichen. Die Zeiten auf dieser Seite werden für die lokale Zeitzone von ${_mthCity} berechnet.` },
                    { q: `Ist dieser Kalender in der Ortszeit von ${_mthCity}?`,
                      a: `Ja. Alle Mondaufgangs-/-untergangszeiten und Vollmond-/Neumondzeiten werden in der lokalen Zeitzone von ${_mthCity} berechnet. Die geografischen Koordinaten der Stadt beeinflussen auch Richtung und Höhe.` },
                    { q: `Wie hängen Mondphasen mit dem Hidschri-Kalender zusammen?`,
                      a: `Der Hidschri-Kalender ist vollständig mondbasiert — jeder Monat beginnt mit der Sichtung der Mondsichel nach dem Neumond und dauert 29 oder 30 Tage. Vollmond- und Neumonddaten in diesem Kalender helfen, den Beginn des nächsten Hidschri-Monats vorauszusehen.` }
                ],
                id: [
                    { q: `Apa kalender bulan di ${_mthCity} untuk ${_mthName} ${_mthY}?`,
                      a: `Kalender ini menampilkan fase bulan harian di ${_mthCity} selama ${_mthName} ${_mthY} — hilal, gibbus, purnama dan bulan baru — dengan iluminasi dan waktu terbit/terbenam untuk setiap hari.` },
                    { q: `Apa fase bulan hari ini di ${_mthCity}?`,
                      a: `Situs menampilkan fase saat ini dan iluminasi secara langsung untuk ${_mthCity}, dalam konteks kalender bulanan ini.` },
                    { q: `Kapan bulan purnama di ${_mthCity} selama ${_mthName} ${_mthY}?`,
                      a: `Bagian "Fase bulan mendatang" di atas menampilkan tanggal purnama yang tepat di ${_mthCity}. Selama ${_mthName} ${_mthY}, bulan purnama mencapai iluminasi 100% pada malam yang ditentukan.` },
                    { q: `Kapan bulan baru di ${_mthCity} selama ${_mthName} ${_mthY}?`,
                      a: `Bagian "Fase bulan mendatang" menampilkan tanggal bulan baru berikutnya — yang menandai awal bulan Hijriah baru. Bulan baru adalah saat Bulan berada antara Bumi dan Matahari (iluminasi 0%).` },
                    { q: `Bagaimana cara membaca kalender fase bulan bulanan?`,
                      a: `Setiap sel mewakili satu hari dan menampilkan: tanggal, emoji fase bulan, nama fase (baru, hilal, kuartal, gibbus, purnama), dan offset relatif dari hari ini. Klik hari mana pun untuk membuka halaman detailnya.` },
                    { q: `Mengapa waktu terbit dan terbenam Bulan berbeda antar kota?`,
                      a: `Terbit dan terbenam Bulan tergantung pada bujur, lintang dan zona waktu. Perbedaannya dapat mencapai 12 jam antara timur dan barat dunia. Waktu di halaman ini dihitung untuk zona waktu lokal ${_mthCity}.` },
                    { q: `Apakah kalender ini dalam waktu lokal ${_mthCity}?`,
                      a: `Ya. Semua waktu terbit/terbenam Bulan dan purnama/bulan baru dihitung dalam zona waktu lokal ${_mthCity}. Koordinat geografis kota juga memengaruhi arah dan ketinggian.` },
                    { q: `Bagaimana fase bulan terkait dengan kalender Hijriah?`,
                      a: `Kalender Hijriah sepenuhnya berbasis bulan — setiap bulan dimulai dengan rukyat hilal setelah bulan baru dan berlangsung 29 atau 30 hari. Tanggal purnama dan bulan baru dalam kalender ini membantu mengantisipasi awal bulan Hijriah berikutnya.` }
                ],
                es: [
                    { q: `¿Cuál es el calendario lunar en ${_mthCity} para ${_mthName} ${_mthY}?`,
                      a: `Este calendario muestra las fases lunares diarias en ${_mthCity} durante ${_mthName} ${_mthY} — creciente, gibosa, llena y nueva — con iluminación y horarios de salida/puesta para cada día.` },
                    { q: `¿Cuál es la fase lunar hoy en ${_mthCity}?`,
                      a: `El sitio muestra la fase actual y la iluminación en vivo para ${_mthCity}, en el contexto de este calendario mensual.` },
                    { q: `¿Cuándo es la luna llena en ${_mthCity} durante ${_mthName} ${_mthY}?`,
                      a: `La sección "Próximas fases lunares" arriba muestra la fecha precisa de luna llena en ${_mthCity}. Durante ${_mthName} ${_mthY}, la luna llena alcanza el 100 % de iluminación la noche especificada.` },
                    { q: `¿Cuándo es la luna nueva en ${_mthCity} durante ${_mthName} ${_mthY}?`,
                      a: `La sección "Próximas fases lunares" muestra la próxima fecha de luna nueva — que marca el inicio del nuevo mes hijri. La luna nueva es cuando la Luna se sitúa entre la Tierra y el Sol (0 % de iluminación).` },
                    { q: `¿Cómo leo el calendario mensual de fases lunares?`,
                      a: `Cada celda representa un día y muestra: la fecha, el emoji de fase lunar, el nombre de la fase (nueva, creciente, cuarto, gibosa, llena) y el desfase relativo desde hoy. Haga clic en cualquier día para abrir su página de detalles.` },
                    { q: `¿Por qué los horarios de salida y puesta de la Luna difieren entre ciudades?`,
                      a: `La salida y puesta de la Luna dependen de la longitud, latitud y zona horaria. La diferencia puede alcanzar 12 horas entre el este y el oeste del globo. Los horarios de esta página se calculan para la zona horaria local de ${_mthCity}.` },
                    { q: `¿Está este calendario en la hora local de ${_mthCity}?`,
                      a: `Sí. Todos los horarios de salida/puesta de la Luna y de luna llena/nueva se calculan en la zona horaria local de ${_mthCity}. Las coordenadas geográficas de la ciudad también afectan la dirección y la altitud.` },
                    { q: `¿Cómo se relacionan las fases lunares con el calendario hijri?`,
                      a: `El calendario hijri es totalmente lunar — cada mes comienza con la observación del creciente tras la luna nueva y dura 29 o 30 días. Las fechas de luna llena y luna nueva en este calendario ayudan a anticipar el inicio del próximo mes hijri.` }
                ],
                bn: [
                    { q: `${_mthCity}-এ ${_mthName} ${_mthY}-এর জন্য চাঁদের ক্যালেন্ডার কী?`,
                      a: `এই ক্যালেন্ডার ${_mthCity}-এ ${_mthName} ${_mthY}-এর সময় দৈনিক চাঁদের দশা — হিলাল, গিব্বাস, পূর্ণিমা ও অমাবস্যা — প্রতিদিনের জন্য আলোকন ও উদয়/অস্তের সময় সহ দেখায়।` },
                    { q: `${_mthCity}-এ আজ চাঁদের দশা কী?`,
                      a: `এই সাইট এই মাসিক ক্যালেন্ডারের প্রসঙ্গে ${_mthCity}-এর জন্য বর্তমান দশা ও আলোকন সরাসরি দেখায়।` },
                    { q: `${_mthName} ${_mthY}-এর সময় ${_mthCity}-এ পূর্ণিমা কখন?`,
                      a: `উপরের "আসন্ন চাঁদের দশা" বিভাগ ${_mthCity}-এ সঠিক পূর্ণিমার তারিখ দেখায়। ${_mthName} ${_mthY}-এর সময় পূর্ণিমা নির্দিষ্ট রাতে ১০০% আলোকনে পৌঁছায়।` },
                    { q: `${_mthName} ${_mthY}-এর সময় ${_mthCity}-এ অমাবস্যা কখন?`,
                      a: `"আসন্ন চাঁদের দশা" বিভাগ পরবর্তী অমাবস্যার তারিখ দেখায় — যা নতুন হিজরি মাসের শুরু চিহ্নিত করে। অমাবস্যা হল যখন চাঁদ পৃথিবী ও সূর্যের মাঝে থাকে (০% আলোকন)।` },
                    { q: `মাসিক চাঁদের দশার ক্যালেন্ডার কীভাবে পড়ব?`,
                      a: `প্রতিটি সেল একটি দিন প্রতিনিধিত্ব করে এবং দেখায়: তারিখ, চাঁদের দশার ইমোজি, দশার নাম (অমাবস্যা, হিলাল, কোয়ার্টার, গিব্বাস, পূর্ণিমা) এবং আজ থেকে আপেক্ষিক ব্যবধান। যেকোনো দিনে ক্লিক করে তার বিবরণ পৃষ্ঠা খুলুন।` },
                    { q: `চাঁদের উদয় ও অস্তের সময় শহরভেদে কেন আলাদা?`,
                      a: `চাঁদের উদয় ও অস্ত দ্রাঘিমাংশ, অক্ষাংশ ও টাইমজোনের উপর নির্ভর করে। পার্থক্য বিশ্বের পূর্ব ও পশ্চিমের মধ্যে ১২ ঘণ্টা পর্যন্ত হতে পারে। এই পৃষ্ঠার সময়গুলি ${_mthCity}-এর স্থানীয় টাইমজোনের জন্য গণনা করা হয়।` },
                    { q: `এই ক্যালেন্ডার কি ${_mthCity}-এর স্থানীয় সময়ে?`,
                      a: `হ্যাঁ। সমস্ত চাঁদের উদয়/অস্ত এবং পূর্ণিমা/অমাবস্যার সময় ${_mthCity}-এর স্থানীয় টাইমজোনে গণনা করা হয়। শহরের ভৌগোলিক স্থানাঙ্কও দিকনির্দেশ এবং উচ্চতাকে প্রভাবিত করে।` },
                    { q: `চাঁদের দশা হিজরি ক্যালেন্ডারের সাথে কীভাবে সম্পর্কিত?`,
                      a: `হিজরি ক্যালেন্ডার সম্পূর্ণ চান্দ্র — প্রতিটি মাস অমাবস্যার পর হিলাল দেখার মাধ্যমে শুরু হয় এবং ২৯ বা ৩০ দিন স্থায়ী হয়। এই ক্যালেন্ডারে পূর্ণিমা ও অমাবস্যার তারিখগুলি পরবর্তী হিজরি মাসের শুরু অনুমান করতে সাহায্য করে।` }
                ],
                ms: [
                    { q: `Apakah kalendar bulan di ${_mthCity} untuk ${_mthName} ${_mthY}?`,
                      a: `Kalendar ini memaparkan fasa bulan harian di ${_mthCity} sepanjang ${_mthName} ${_mthY} — hilal, gibus, bulan purnama dan anak bulan — dengan pencahayaan dan masa terbit/terbenam untuk setiap hari.` },
                    { q: `Apakah fasa bulan hari ini di ${_mthCity}?`,
                      a: `Laman ini memaparkan fasa semasa dan pencahayaan secara langsung untuk ${_mthCity}, dalam konteks kalendar bulanan ini.` },
                    { q: `Bilakah bulan purnama di ${_mthCity} sepanjang ${_mthName} ${_mthY}?`,
                      a: `Bahagian "Fasa bulan akan datang" di atas memaparkan tarikh tepat bulan purnama di ${_mthCity}. Sepanjang ${_mthName} ${_mthY}, bulan purnama mencapai pencahayaan 100% pada malam yang ditetapkan.` },
                    { q: `Bilakah anak bulan di ${_mthCity} sepanjang ${_mthName} ${_mthY}?`,
                      a: `Bahagian "Fasa bulan akan datang" memaparkan tarikh anak bulan seterusnya — yang menandakan permulaan bulan Hijrah baharu. Anak bulan ialah saat Bulan berada antara Bumi dan Matahari (0% pencahayaan).` },
                    { q: `Bagaimana saya membaca kalendar fasa bulan bulanan?`,
                      a: `Setiap sel mewakili satu hari dan memaparkan: tarikh, emoji fasa bulan, nama fasa (anak bulan, hilal, suku, gibus, purnama) dan jurang relatif dari hari ini. Klik mana-mana hari untuk membuka halaman butirannya.` },
                    { q: `Mengapa waktu terbit dan terbenam Bulan berbeza antara bandar?`,
                      a: `Terbit dan terbenam Bulan bergantung pada bujur, lintang dan zon waktu. Perbezaannya boleh mencapai 12 jam antara timur dan barat dunia. Waktu pada halaman ini dikira untuk zon waktu tempatan ${_mthCity}.` },
                    { q: `Adakah kalendar ini dalam waktu tempatan ${_mthCity}?`,
                      a: `Ya. Semua waktu terbit/terbenam Bulan dan bulan purnama/anak bulan dikira dalam zon waktu tempatan ${_mthCity}. Koordinat geografi bandar juga mempengaruhi arah dan ketinggian.` },
                    { q: `Bagaimana fasa bulan berkaitan dengan kalendar Hijrah?`,
                      a: `Kalendar Hijrah adalah sepenuhnya berdasarkan bulan — setiap bulan bermula dengan rukyah hilal selepas anak bulan dan berlangsung 29 atau 30 hari. Tarikh bulan purnama dan anak bulan dalam kalendar ini membantu menjangka permulaan bulan Hijrah seterusnya.` }
                ]
            };
            moonFaqs = _MOON_MONTH_FAQ_BY_LANG[seo.lang] || _MOON_MONTH_FAQ_BY_LANG.en;
        } else if (_isMoonDateFaq) {
            // UAT-Moon-Day-Page-Polish: 6-Q date-specific FAQ that mirrors the
            //   visible DOM filled by app.js _DATE_FAQ_AR / _DATE_FAQ_EN.
            //   Note: SSR doesn't have phase/illumination/age values (those are
            //   computed client-side from the page date), so SSR answers stay
            //   generic with the date interpolated. Crawlers see the date in
            //   each Q + structured A; client-side JS later upgrades visible
            //   DOM with computed values. No GSC mismatch — both reference
            //   the same date and same astronomical event.
            const _dCity = (seo.moonCity && seo.moonCity.name) || '';
            const _dLbl  = seo.moonCity.dateLabel || '';
            // Phase D3.1b: 10-lang date FAQ (was: AR+EN only — 8 langs fell back to en)
            const _MOON_DATE_FAQ_BY_LANG = {
                ar: [
                { q: `ما طور القمر في ${_dCity} يوم ${_dLbl}؟`,
                  a: `طور القمر في ${_dCity} يوم ${_dLbl} مَحسوب فلكيًّا بدقّة عالية وفق منهجيّات Jean Meeus، ويَظهر في القسم الرئيسيّ من الصفحة مع نسبة الإضاءة وأيقونة الطور.` },
                { q: `كم كانت نسبة إضاءة القمر في ${_dCity} في هذا التاريخ؟`,
                  a: `نسبة إضاءة القمر في ${_dCity} يوم ${_dLbl} مَعروضة في كرت "نسبة الإضاءة" أعلى الصفحة، وهي محسوبة من الزاوية بين الشمس والقمر والأرض.` },
                { q: `كم كان عمر القمر يوم ${_dLbl}؟`,
                  a: `عمر القمر هو عدد الأيّام منذ آخر محاق ضمن دورة قمريّة طولها 29.5 يوم تقريبًا. القيمة الدقيقة لـ ${_dLbl} مَعروضة في كرت "عمر القمر" أعلى الصفحة.` },
                { q: `متى أَشرق القمر في ${_dCity} في هذا اليوم؟`,
                  a: `وقت شروق القمر في ${_dCity} يوم ${_dLbl} مَعروض في كرت "شروق القمر" بالتوقيت المحلّيّ للمدينة، محسوبًا من إحداثيّاتها الجغرافيّة.` },
                { q: `متى غرَب القمر في ${_dCity} في هذا اليوم؟`,
                  a: `وقت غروب القمر في ${_dCity} يوم ${_dLbl} مَعروض في كرت "غروب القمر" بالتوقيت المحلّيّ للمدينة. الفرق بين الشروق والغروب يَختلف حسب الطور.` },
                { q: `متى كان البدر أو المحاق الأقرب لتاريخ ${_dLbl}؟`,
                  a: `أقرب بدر/محاق للتاريخ ${_dLbl} مَعروض في قسم "الأطوار القمريّة القادمة" أعلاه، مع التاريخ الميلاديّ والهجريّ بدقّة فلكيّة.` }
                ],
                en: [
                { q: `What was the moon phase in ${_dCity} on ${_dLbl}?`,
                  a: `The moon phase in ${_dCity} on ${_dLbl} is computed astronomically using Jean Meeus' methods and shown in the main detail card with illumination percentage and phase icon.` },
                { q: `What was the moon illumination in ${_dCity} on this date?`,
                  a: `Moon illumination in ${_dCity} on ${_dLbl} is shown in the "Illumination" card at the top of the page, computed from the angle between the Sun, Moon, and Earth.` },
                { q: `How old was the moon on ${_dLbl}?`,
                  a: `Moon age is the number of days since the last new moon within a ~29.5-day lunar cycle. The exact value for ${_dLbl} is shown in the "Moon age" card at the top of the page.` },
                { q: `When did the moon rise in ${_dCity} on this day?`,
                  a: `Moonrise in ${_dCity} on ${_dLbl} is shown in the "Moonrise" card in the city's local time, computed from its geographic coordinates.` },
                { q: `When did the moon set in ${_dCity} on this day?`,
                  a: `Moonset in ${_dCity} on ${_dLbl} is shown in the "Moonset" card in the city's local time. The interval between rise and set varies by phase.` },
                { q: `When was the closest full moon or new moon to ${_dLbl}?`,
                  a: `The closest full/new moon to ${_dLbl} is shown in the "Upcoming moon phases" section above, with precise Gregorian and Hijri dates.` }
                ],
                fr: [
                    { q: `Quelle était la phase de la Lune à ${_dCity} le ${_dLbl} ?`,
                      a: `La phase de la Lune à ${_dCity} le ${_dLbl} est calculée astronomiquement avec une grande précision selon les méthodes de Jean Meeus, et affichée dans la carte principale de la page avec le pourcentage d'illumination et l'icône de phase.` },
                    { q: `Quelle était l'illumination de la Lune à ${_dCity} à cette date ?`,
                      a: `L'illumination lunaire à ${_dCity} le ${_dLbl} est affichée dans la carte "Illumination" en haut de la page, calculée à partir de l'angle entre le Soleil, la Lune et la Terre.` },
                    { q: `Quel âge avait la Lune le ${_dLbl} ?`,
                      a: `L'âge de la Lune est le nombre de jours depuis la dernière nouvelle lune dans un cycle lunaire d'environ 29,5 jours. La valeur exacte pour ${_dLbl} est affichée dans la carte "Âge de la Lune" en haut de la page.` },
                    { q: `À quelle heure la Lune s'est-elle levée à ${_dCity} ce jour-là ?`,
                      a: `L'heure de lever de la Lune à ${_dCity} le ${_dLbl} est affichée dans la carte "Lever de la Lune" en heure locale de la ville, calculée à partir de ses coordonnées géographiques.` },
                    { q: `À quelle heure la Lune s'est-elle couchée à ${_dCity} ce jour-là ?`,
                      a: `L'heure de coucher de la Lune à ${_dCity} le ${_dLbl} est affichée dans la carte "Coucher de la Lune" en heure locale de la ville. L'intervalle entre lever et coucher varie selon la phase.` },
                    { q: `Quelle était la pleine lune ou nouvelle lune la plus proche du ${_dLbl} ?`,
                      a: `La pleine/nouvelle lune la plus proche du ${_dLbl} est affichée dans la section "Prochaines phases lunaires" ci-dessus, avec les dates grégorienne et hégirienne précises.` }
                ],
                tr: [
                    { q: `${_dCity}'de ${_dLbl} tarihindeki ay evresi neydi?`,
                      a: `${_dCity}'de ${_dLbl} tarihindeki ay evresi, Jean Meeus yöntemleriyle yüksek hassasiyetle astronomik olarak hesaplanır ve sayfanın ana kartında aydınlanma yüzdesi ve evre simgesiyle birlikte gösterilir.` },
                    { q: `${_dCity}'de bu tarihte ay aydınlanması neydi?`,
                      a: `${_dCity}'de ${_dLbl} tarihindeki ay aydınlanması, sayfanın üst kısmındaki "Aydınlanma" kartında gösterilir ve Güneş-Ay-Dünya açısından hesaplanır.` },
                    { q: `${_dLbl} tarihinde ay kaç günlüktü?`,
                      a: `Ay yaşı, ~29,5 günlük bir kameri ay döngüsünde son yeni aydan bu yana geçen gün sayısıdır. ${_dLbl} için tam değer sayfanın üst kısmındaki "Ay yaşı" kartında gösterilir.` },
                    { q: `${_dCity}'de o gün Ay ne zaman doğdu?`,
                      a: `${_dCity}'de ${_dLbl} tarihindeki ay doğuş saati, şehrin yerel saatine göre "Ay doğuşu" kartında gösterilir, coğrafi koordinatlarından hesaplanır.` },
                    { q: `${_dCity}'de o gün Ay ne zaman battı?`,
                      a: `${_dCity}'de ${_dLbl} tarihindeki ay batış saati, şehrin yerel saatine göre "Ay batışı" kartında gösterilir. Doğuş ile batış arasındaki aralık evreye göre değişir.` },
                    { q: `${_dLbl} tarihine en yakın dolunay veya yeni ay ne zamandı?`,
                      a: `${_dLbl}'e en yakın dolunay/yeni ay yukarıdaki "Yaklaşan ay evreleri" bölümünde, hassas miladi ve hicri tarihlerle gösterilir.` }
                ],
                ur: [
                    { q: `${_dCity} میں ${_dLbl} کو چاند کا طور کیا تھا؟`,
                      a: `${_dCity} میں ${_dLbl} کو چاند کا طور Jean Meeus کے طریقوں کے مطابق اعلیٰ درستگی کے ساتھ فلکیاتی طور پر شمار کیا جاتا ہے، اور صفحے کے مرکزی کارڈ میں روشنی کے فیصد اور طور کے آئیکن کے ساتھ دکھایا جاتا ہے۔` },
                    { q: `${_dCity} میں اس تاریخ کو چاند کی روشنی کتنی تھی؟`,
                      a: `${_dCity} میں ${_dLbl} کو چاند کی روشنی صفحے کے اوپر "روشنی" کارڈ میں دکھائی جاتی ہے، جو سورج-چاند-زمین کے زاویے سے شمار کی جاتی ہے۔` },
                    { q: `${_dLbl} کو چاند کتنا پرانا تھا؟`,
                      a: `چاند کی عمر تقریباً 29.5 دن کے قمری دور میں آخری نئے چاند سے گزرے دنوں کی تعداد ہے۔ ${_dLbl} کے لیے درست قدر صفحے کے اوپر "چاند کی عمر" کارڈ میں دکھائی جاتی ہے۔` },
                    { q: `${_dCity} میں اس دن چاند کب طلوع ہوا؟`,
                      a: `${_dCity} میں ${_dLbl} کا مطلعِ چاند شہر کے مقامی وقت میں "مطلعِ چاند" کارڈ میں دکھایا جاتا ہے، جو اس کے جغرافیائی کوآرڈینیٹس سے شمار کیا جاتا ہے۔` },
                    { q: `${_dCity} میں اس دن چاند کب غروب ہوا؟`,
                      a: `${_dCity} میں ${_dLbl} کا مغیبِ چاند شہر کے مقامی وقت میں "مغیبِ چاند" کارڈ میں دکھایا جاتا ہے۔ مطلع اور مغیب کے درمیان وقفہ طور کے مطابق مختلف ہوتا ہے۔` },
                    { q: `${_dLbl} کے قریب ترین بدر یا نیا چاند کب تھا؟`,
                      a: `${_dLbl} کے قریب ترین بدر/نیا چاند اوپر "آنے والی چاند کی اطوار" سیکشن میں درست عیسوی اور ہجری تاریخوں کے ساتھ دکھایا گیا ہے۔` }
                ],
                de: [
                    { q: `Welche Mondphase hatte ${_dCity} am ${_dLbl}?`,
                      a: `Die Mondphase in ${_dCity} am ${_dLbl} wird astronomisch mit hoher Präzision nach den Methoden von Jean Meeus berechnet und in der Hauptkarte der Seite mit Beleuchtungsprozent und Phasensymbol angezeigt.` },
                    { q: `Wie hoch war die Mondbeleuchtung in ${_dCity} an diesem Datum?`,
                      a: `Die Mondbeleuchtung in ${_dCity} am ${_dLbl} wird in der Karte "Beleuchtung" oben auf der Seite angezeigt, berechnet aus dem Winkel zwischen Sonne, Mond und Erde.` },
                    { q: `Wie alt war der Mond am ${_dLbl}?`,
                      a: `Das Mondalter ist die Anzahl der Tage seit dem letzten Neumond innerhalb eines ~29,5-tägigen Mondzyklus. Der genaue Wert für ${_dLbl} wird in der Karte "Mondalter" oben auf der Seite angezeigt.` },
                    { q: `Wann ging der Mond in ${_dCity} an diesem Tag auf?`,
                      a: `Der Mondaufgang in ${_dCity} am ${_dLbl} wird in der Karte "Mondaufgang" in der Ortszeit der Stadt angezeigt, berechnet aus ihren geografischen Koordinaten.` },
                    { q: `Wann ging der Mond in ${_dCity} an diesem Tag unter?`,
                      a: `Der Monduntergang in ${_dCity} am ${_dLbl} wird in der Karte "Monduntergang" in der Ortszeit der Stadt angezeigt. Das Intervall zwischen Auf- und Untergang variiert je nach Phase.` },
                    { q: `Wann war der nächstgelegene Vollmond oder Neumond zum ${_dLbl}?`,
                      a: `Der nächstgelegene Voll-/Neumond zum ${_dLbl} wird im obigen Abschnitt "Kommende Mondphasen" mit präzisen gregorianischen und Hidschri-Daten angezeigt.` }
                ],
                id: [
                    { q: `Apa fase bulan di ${_dCity} pada ${_dLbl}?`,
                      a: `Fase bulan di ${_dCity} pada ${_dLbl} dihitung secara astronomis dengan presisi tinggi menggunakan metode Jean Meeus, dan ditampilkan di kartu detail utama dengan persentase iluminasi dan ikon fase.` },
                    { q: `Berapa iluminasi bulan di ${_dCity} pada tanggal ini?`,
                      a: `Iluminasi bulan di ${_dCity} pada ${_dLbl} ditampilkan di kartu "Iluminasi" di bagian atas halaman, dihitung dari sudut antara Matahari, Bulan dan Bumi.` },
                    { q: `Berapa umur bulan pada ${_dLbl}?`,
                      a: `Umur bulan adalah jumlah hari sejak bulan baru terakhir dalam siklus bulan ~29,5 hari. Nilai yang tepat untuk ${_dLbl} ditampilkan di kartu "Umur bulan" di bagian atas halaman.` },
                    { q: `Pukul berapa Bulan terbit di ${_dCity} pada hari itu?`,
                      a: `Waktu terbit Bulan di ${_dCity} pada ${_dLbl} ditampilkan di kartu "Terbit Bulan" dalam waktu lokal kota, dihitung dari koordinat geografisnya.` },
                    { q: `Pukul berapa Bulan terbenam di ${_dCity} pada hari itu?`,
                      a: `Waktu terbenam Bulan di ${_dCity} pada ${_dLbl} ditampilkan di kartu "Terbenam Bulan" dalam waktu lokal kota. Interval antara terbit dan terbenam bervariasi berdasarkan fase.` },
                    { q: `Kapan purnama atau bulan baru terdekat dengan ${_dLbl}?`,
                      a: `Purnama/bulan baru terdekat dengan ${_dLbl} ditampilkan di bagian "Fase bulan mendatang" di atas, dengan tanggal Masehi dan Hijriah yang tepat.` }
                ],
                es: [
                    { q: `¿Cuál fue la fase de la Luna en ${_dCity} el ${_dLbl}?`,
                      a: `La fase de la Luna en ${_dCity} el ${_dLbl} se calcula astronómicamente con alta precisión utilizando los métodos de Jean Meeus y se muestra en la tarjeta de detalles principal con el porcentaje de iluminación y el icono de fase.` },
                    { q: `¿Cuál fue la iluminación lunar en ${_dCity} en esa fecha?`,
                      a: `La iluminación lunar en ${_dCity} el ${_dLbl} se muestra en la tarjeta "Iluminación" en la parte superior de la página, calculada a partir del ángulo entre el Sol, la Luna y la Tierra.` },
                    { q: `¿Qué edad tenía la Luna el ${_dLbl}?`,
                      a: `La edad de la Luna es el número de días desde la última luna nueva dentro de un ciclo lunar de ~29,5 días. El valor exacto para ${_dLbl} se muestra en la tarjeta "Edad de la Luna" en la parte superior de la página.` },
                    { q: `¿A qué hora salió la Luna en ${_dCity} ese día?`,
                      a: `La hora de salida de la Luna en ${_dCity} el ${_dLbl} se muestra en la tarjeta "Salida de la Luna" en la hora local de la ciudad, calculada a partir de sus coordenadas geográficas.` },
                    { q: `¿A qué hora se puso la Luna en ${_dCity} ese día?`,
                      a: `La hora de puesta de la Luna en ${_dCity} el ${_dLbl} se muestra en la tarjeta "Puesta de la Luna" en la hora local de la ciudad. El intervalo entre salida y puesta varía según la fase.` },
                    { q: `¿Cuándo fue la luna llena o nueva más cercana al ${_dLbl}?`,
                      a: `La luna llena/nueva más cercana al ${_dLbl} se muestra en la sección "Próximas fases lunares" arriba, con fechas gregoriana e hijri precisas.` }
                ],
                bn: [
                    { q: `${_dCity}-এ ${_dLbl} তারিখে চাঁদের দশা কী ছিল?`,
                      a: `${_dCity}-এ ${_dLbl} তারিখে চাঁদের দশা Jean Meeus-এর পদ্ধতি ব্যবহার করে উচ্চ নির্ভুলতার সাথে জ্যোতির্বিজ্ঞানগতভাবে গণনা করা হয় এবং পৃষ্ঠার প্রধান বিবরণ কার্ডে আলোকন শতাংশ ও দশার আইকন সহ দেখানো হয়।` },
                    { q: `${_dCity}-এ এই তারিখে চাঁদের আলোকন কত ছিল?`,
                      a: `${_dCity}-এ ${_dLbl} তারিখে চাঁদের আলোকন পৃষ্ঠার শীর্ষে "আলোকন" কার্ডে দেখানো হয়, যা সূর্য-চাঁদ-পৃথিবীর কোণ থেকে গণনা করা হয়।` },
                    { q: `${_dLbl} তারিখে চাঁদের বয়স কত ছিল?`,
                      a: `চাঁদের বয়স হল ~২৯.৫ দিনের চান্দ্র চক্রের মধ্যে শেষ অমাবস্যার পর থেকে দিনের সংখ্যা। ${_dLbl}-এর জন্য সঠিক মান পৃষ্ঠার শীর্ষে "চাঁদের বয়স" কার্ডে দেখানো হয়।` },
                    { q: `${_dCity}-এ সেই দিন চাঁদ কখন উদয় হয়েছিল?`,
                      a: `${_dCity}-এ ${_dLbl}-এর চাঁদের উদয়ের সময় শহরের স্থানীয় সময়ে "চাঁদ উদয়" কার্ডে দেখানো হয়, যা তার ভৌগোলিক স্থানাঙ্ক থেকে গণনা করা হয়।` },
                    { q: `${_dCity}-এ সেই দিন চাঁদ কখন অস্ত গিয়েছিল?`,
                      a: `${_dCity}-এ ${_dLbl}-এর চাঁদের অস্তের সময় শহরের স্থানীয় সময়ে "চাঁদ অস্ত" কার্ডে দেখানো হয়। উদয় ও অস্তের মধ্যবর্তী ব্যবধান দশা অনুসারে পরিবর্তিত হয়।` },
                    { q: `${_dLbl}-এর সবচেয়ে কাছাকাছি পূর্ণিমা বা অমাবস্যা কখন ছিল?`,
                      a: `${_dLbl}-এর সবচেয়ে কাছাকাছি পূর্ণিমা/অমাবস্যা উপরের "আসন্ন চাঁদের দশা" বিভাগে সঠিক খ্রিস্টীয় ও হিজরি তারিখ সহ দেখানো হয়েছে।` }
                ],
                ms: [
                    { q: `Apakah fasa bulan di ${_dCity} pada ${_dLbl}?`,
                      a: `Fasa bulan di ${_dCity} pada ${_dLbl} dikira secara astronomi dengan ketepatan tinggi menggunakan kaedah Jean Meeus, dan dipaparkan dalam kad butiran utama dengan peratus pencahayaan dan ikon fasa.` },
                    { q: `Berapakah pencahayaan bulan di ${_dCity} pada tarikh ini?`,
                      a: `Pencahayaan bulan di ${_dCity} pada ${_dLbl} dipaparkan dalam kad "Pencahayaan" di bahagian atas halaman, dikira daripada sudut antara Matahari, Bulan dan Bumi.` },
                    { q: `Berapa umur bulan pada ${_dLbl}?`,
                      a: `Umur bulan ialah bilangan hari sejak anak bulan terakhir dalam kitaran bulan ~29.5 hari. Nilai tepat untuk ${_dLbl} dipaparkan dalam kad "Umur bulan" di bahagian atas halaman.` },
                    { q: `Pukul berapa Bulan terbit di ${_dCity} pada hari itu?`,
                      a: `Waktu terbit Bulan di ${_dCity} pada ${_dLbl} dipaparkan dalam kad "Terbit Bulan" dalam waktu tempatan bandar, dikira daripada koordinat geografinya.` },
                    { q: `Pukul berapa Bulan terbenam di ${_dCity} pada hari itu?`,
                      a: `Waktu terbenam Bulan di ${_dCity} pada ${_dLbl} dipaparkan dalam kad "Terbenam Bulan" dalam waktu tempatan bandar. Selang antara terbit dan terbenam berbeza mengikut fasa.` },
                    { q: `Bilakah bulan purnama atau anak bulan paling hampir dengan ${_dLbl}?`,
                      a: `Bulan purnama/anak bulan paling hampir dengan ${_dLbl} dipaparkan dalam bahagian "Fasa bulan akan datang" di atas, dengan tarikh Masihi dan Hijrah yang tepat.` }
                ]
            };
            moonFaqs = _MOON_DATE_FAQ_BY_LANG[seo.lang] || _MOON_DATE_FAQ_BY_LANG.en;
        } else if (_isMoonHubFaq) {
            const _hubCity = (seo.moonCity && seo.moonCity.name) || '';
            const _MOON_HUB_FAQ_BY_LANG = {
                ar: [
                { q: `ما هو طور القمر اليوم في ${_hubCity}؟`,
                  a: `يَمرّ القمر بثمانية أطوار خلال دورة 29.5 يوم. هذه الصفحة تَعرض الطور الحاليّ ونسبة الإضاءة لحظيّاً حسب موقع ${_hubCity}، مع تقويم شهريّ كامل للأطوار القادمة.` },
                { q: `متى يكون البدر القادم في ${_hubCity}؟`,
                  a: `يَتكرّر البدر كلّ 29.5 يوم. تَعرض هذه الصفحة التاريخ الميلاديّ والهجريّ للبدر القادم بدقّة فلكيّة، مع نسبة إضاءة 100٪ ليلة اكتمال القمر.` },
                { q: `متى يكون المحاق القادم في ${_hubCity}؟`,
                  a: `المحاق هو لحظة وقوع القمر بين الأرض والشمس بإضاءة 0٪. تَعرض هذه الصفحة موعد المحاق القادم، وهو الذي يَبدأ به الشهر الهجريّ الجديد.` },
                { q: `كيف أستخدم تقويم القمر في ${_hubCity}؟`,
                  a: `اضغط على أيّ يوم في التقويم لفتح صفحة تَفاصيل ذلك اليوم في ${_hubCity}. استَخدم أزرار "الشهر السابق" / "الشهر التالي" لاستعراض شهور سابقة أو لاحقة. كلّ شهر له صفحة خاصّة بصياغة /moon-in-{city}/YYYY-MM.` },
                { q: `لماذا تَختلف مواعيد شروق وغروب القمر في ${_hubCity} عن مدن أخرى؟`,
                  a: `يَعتمد شروق وغروب القمر على خطّ الطول والعرض الجغرافيّ والمنطقة الزمنيّة. الفرق قد يَصل إلى 12 ساعة بين شرق وغرب الأرض. بيانات هذه الصفحة محسوبة حسب التوقيت المحلّيّ لـ ${_hubCity}.` },
                { q: 'ما علاقة القمر بالتقويم الهجريّ؟',
                  a: 'التقويم الهجريّ قمريّ بالكامل: كلّ شهر يَبدأ برؤية الهلال بعد المحاق ويَستمرّ 29 أو 30 يومًا. مجموع السنة الهجريّة 354 أو 355 يومًا، أقصر من السنة الشمسيّة بـ 11 يومًا.' },
                { q: 'ما الفرق بين الكوكبة الفلكيّة والبرج؟',
                  a: 'الكوكبة الفلكيّة (Constellation) هي رقعة من السماء تُحدّدها حدود رسميّة من الاتّحاد الفلكيّ الدوليّ (IAU)، وعددها 88 منها 13 على دائرة البروج (تشمل الحوّاء). أمّا البرج التَنجيميّ (Zodiac sign) فهو تَقسيم متساوٍ افتراضيّ (12×30°) لا يَعكس الموقع الفلكيّ الفعليّ. موقعنا يَستخدم الكوكبات الفلكيّة (IAU).' },
                { q: `هل تَعتمد بيانات القمر على التوقيت المحلّيّ لـ ${_hubCity}؟`,
                  a: `نعم. كلّ مواعيد الشروق والغروب وأوقات البدر/المحاق محسوبة بالتوقيت المحلّيّ لـ ${_hubCity}. الإحداثيّات الجغرافيّة لهذه المدينة تُؤثّر على الاتّجاه والارتفاع أيضًا.` }
                ],
                en: [
                { q: `What is the moon phase today in ${_hubCity}?`,
                  a: `The moon goes through 8 phases over a 29.5-day cycle. This page shows the current phase and illumination live for ${_hubCity}, plus a full monthly calendar of upcoming phases.` },
                { q: `When is the next full moon in ${_hubCity}?`,
                  a: `A full moon occurs every 29.5 days. This page shows the precise Gregorian and Hijri date of the next full moon at 100% illumination.` },
                { q: `When is the next new moon in ${_hubCity}?`,
                  a: `A new moon is the instant the Moon lies between Earth and Sun (0% illumination). This page shows when the next new moon happens — also the start of the new Hijri month.` },
                { q: `How do I use the moon calendar in ${_hubCity}?`,
                  a: `Click any day in the calendar to open that day's details for ${_hubCity}. Use prev/next month buttons to browse other months. Each month has its own page at /moon-in-{city}/YYYY-MM.` },
                { q: `Why do moonrise and moonset times in ${_hubCity} differ from other cities?`,
                  a: `Moonrise and moonset depend on longitude, latitude and timezone. The difference can reach 12 hours between east and west of the globe. This page's times are computed for ${_hubCity}'s local timezone.` },
                { q: 'How is the Moon related to the Hijri calendar?',
                  a: 'The Hijri calendar is fully lunar — each month begins with the crescent sighting after the new moon and lasts 29 or 30 days. The Hijri year is 354–355 days, ~11 days shorter than the solar year.' },
                { q: 'What is the difference between an astronomical constellation and a zodiac sign?',
                  a: 'An astronomical constellation is a region of sky with official IAU boundaries (88 total, 13 along the ecliptic including Ophiuchus). A zodiac sign is an astrological 30°-equal division that does NOT reflect the actual astronomical position. We use IAU constellations.' },
                { q: `Are the moon data on this page in ${_hubCity}'s local time?`,
                  a: `Yes. All moonrise/moonset and full/new moon times are computed in ${_hubCity}'s local timezone. The city's geographic coordinates also affect direction and altitude.` }
                ],
                fr: [
                    { q: `Quelle est la phase de la Lune aujourd'hui à ${_hubCity} ?`,
                      a: `La Lune passe par 8 phases au cours d'un cycle de 29,5 jours. Cette page affiche la phase actuelle et l'illumination en direct pour ${_hubCity}, plus un calendrier mensuel complet des prochaines phases.` },
                    { q: `Quand est la prochaine pleine lune à ${_hubCity} ?`,
                      a: `Une pleine lune se produit tous les 29,5 jours. Cette page affiche la date grégorienne et hégirienne précise de la prochaine pleine lune à 100 % d'illumination.` },
                    { q: `Quand est la prochaine nouvelle lune à ${_hubCity} ?`,
                      a: `Une nouvelle lune est l'instant où la Lune se trouve entre la Terre et le Soleil (0 % d'illumination). Cette page indique quand a lieu la prochaine nouvelle lune — qui marque aussi le début du nouveau mois hégirien.` },
                    { q: `Comment utiliser le calendrier lunaire à ${_hubCity} ?`,
                      a: `Cliquez sur n'importe quel jour du calendrier pour ouvrir les détails de ce jour pour ${_hubCity}. Utilisez les boutons mois précédent/suivant pour parcourir d'autres mois. Chaque mois a sa propre page à /moon-in-{city}/YYYY-MM.` },
                    { q: `Pourquoi les heures de lever et coucher de la Lune à ${_hubCity} diffèrent-elles d'autres villes ?`,
                      a: `Le lever et le coucher de la Lune dépendent de la longitude, de la latitude et du fuseau horaire. La différence peut atteindre 12 heures entre l'est et l'ouest du globe. Les heures de cette page sont calculées pour le fuseau horaire local de ${_hubCity}.` },
                    { q: `Quel est le rapport entre la Lune et le calendrier hégirien ?`,
                      a: `Le calendrier hégirien est entièrement lunaire — chaque mois commence avec l'observation du croissant après la nouvelle lune et dure 29 ou 30 jours. L'année hégirienne compte 354–355 jours, soit ~11 jours de moins que l'année solaire.` },
                    { q: `Quelle est la différence entre une constellation astronomique et un signe du zodiaque ?`,
                      a: `Une constellation astronomique est une région du ciel avec des limites officielles de l'IAU (88 au total, 13 le long de l'écliptique y compris Ophiuchus). Un signe du zodiaque est une division astrologique égale de 30° qui ne reflète PAS la position astronomique réelle. Nous utilisons les constellations IAU.` },
                    { q: `Les données lunaires de cette page sont-elles à l'heure locale de ${_hubCity} ?`,
                      a: `Oui. Toutes les heures de lever/coucher de la Lune et de pleine/nouvelle lune sont calculées dans le fuseau horaire local de ${_hubCity}. Les coordonnées géographiques de la ville affectent également la direction et l'altitude.` }
                ],
                tr: [
                    { q: `${_hubCity} için bugün ay evresi nedir?`,
                      a: `Ay, 29,5 günlük bir döngüde 8 evreden geçer. Bu sayfa ${_hubCity} için güncel evreyi ve aydınlanmayı canlı olarak gösterir, ayrıca yaklaşan evrelerin tam aylık takvimini sunar.` },
                    { q: `${_hubCity} için bir sonraki dolunay ne zaman?`,
                      a: `Dolunay her 29,5 günde bir gerçekleşir. Bu sayfa, %100 aydınlanmadaki bir sonraki dolunayın hassas miladi ve hicri tarihini gösterir.` },
                    { q: `${_hubCity} için bir sonraki yeni ay ne zaman?`,
                      a: `Yeni ay, Ay'ın Dünya ile Güneş arasında bulunduğu andır (%0 aydınlanma). Bu sayfa, yeni hicri ayın başlangıcı olan bir sonraki yeni ayın ne zaman olacağını gösterir.` },
                    { q: `${_hubCity} için ay takvimini nasıl kullanırım?`,
                      a: `Takvimdeki herhangi bir güne tıklayarak ${_hubCity} için o günün ayrıntılarını açın. Diğer ayları gezmek için önceki/sonraki ay düğmelerini kullanın. Her ayın /moon-in-{city}/YYYY-MM adresinde kendi sayfası vardır.` },
                    { q: `${_hubCity} için ay doğuşu ve batışı saatleri neden diğer şehirlerden farklı?`,
                      a: `Ay doğuşu ve batışı boylama, enleme ve saat dilimine bağlıdır. Fark, dünyanın doğusu ile batısı arasında 12 saate ulaşabilir. Bu sayfanın saatleri ${_hubCity}'in yerel saat dilimi için hesaplanmıştır.` },
                    { q: `Ay'ın hicri takvim ile ilişkisi nedir?`,
                      a: `Hicri takvim tamamen kameridir — her ay yeni aydan sonra hilal görülmesiyle başlar ve 29 veya 30 gün sürer. Hicri yıl 354–355 gündür, güneş yılından ~11 gün daha kısadır.` },
                    { q: `Astronomik takımyıldız ile burç arasındaki fark nedir?`,
                      a: `Astronomik takımyıldız, IAU'nun resmi sınırları olan bir gökyüzü bölgesidir (toplam 88, ekliptik boyunca Ophiuchus dahil 13). Burç, gerçek astronomik konumu YANSITMAYAN, 30°-eşit astrolojik bölünmedir. Biz IAU takımyıldızlarını kullanıyoruz.` },
                    { q: `Bu sayfadaki ay verileri ${_hubCity}'in yerel saatinde mi?`,
                      a: `Evet. Tüm ay doğuşu/batışı ve dolunay/yeni ay saatleri ${_hubCity}'in yerel saat diliminde hesaplanır. Şehrin coğrafi koordinatları da yön ve yüksekliği etkiler.` }
                ],
                ur: [
                    { q: `${_hubCity} میں آج چاند کا طور کیا ہے؟`,
                      a: `چاند 29.5 دن کے دور میں 8 اطوار سے گزرتا ہے۔ یہ صفحہ ${_hubCity} کے لیے موجودہ طور اور روشنی براہِ راست دکھاتا ہے، اور آنے والے اطوار کی مکمل ماہانہ تقویم بھی۔` },
                    { q: `${_hubCity} میں اگلا بدر کب ہوگا؟`,
                      a: `بدر ہر 29.5 دن میں ہوتا ہے۔ یہ صفحہ 100% روشنی پر اگلے بدر کی درست عیسوی اور ہجری تاریخ دکھاتا ہے۔` },
                    { q: `${_hubCity} میں اگلا نیا چاند کب ہوگا؟`,
                      a: `نیا چاند وہ لمحہ ہے جب چاند زمین اور سورج کے درمیان ہوتا ہے (0% روشنی)۔ یہ صفحہ اگلے نئے چاند کا وقت دکھاتا ہے — جو نئے ہجری مہینے کا آغاز بھی ہے۔` },
                    { q: `${_hubCity} میں چاند کی تقویم کیسے استعمال کریں؟`,
                      a: `تقویم میں کسی بھی دن پر کلک کریں تاکہ ${_hubCity} کے لیے اس دن کی تفصیلات کھل جائیں۔ دوسرے مہینے دیکھنے کے لیے پچھلا/اگلا ماہ کے بٹن استعمال کریں۔ ہر مہینے کا اپنا صفحہ /moon-in-{city}/YYYY-MM پر ہے۔` },
                    { q: `${_hubCity} میں مطلع و مغیبِ چاند کے اوقات دوسرے شہروں سے کیوں مختلف ہیں؟`,
                      a: `مطلع و مغیبِ چاند خطِ طول، خطِ عرض اور ٹائم زون پر منحصر ہیں۔ زمین کے مشرق اور مغرب کے درمیان فرق 12 گھنٹے تک پہنچ سکتا ہے۔ اس صفحے کے اوقات ${_hubCity} کے مقامی ٹائم زون کے لیے شمار کیے گئے ہیں۔` },
                    { q: `چاند کا ہجری تقویم سے کیا تعلق ہے؟`,
                      a: `ہجری تقویم مکمل طور پر قمری ہے — ہر مہینہ نئے چاند کے بعد ہلال کی رؤیت سے شروع ہوتا ہے اور 29 یا 30 دن رہتا ہے۔ ہجری سال 354–355 دن کا ہے، شمسی سال سے تقریباً 11 دن کم۔` },
                    { q: `فلکیاتی کوکبہ اور برج کے درمیان کیا فرق ہے؟`,
                      a: `فلکیاتی کوکبہ آسمان کا ایک علاقہ ہے جس کی IAU کی رسمی حدود ہیں (کل 88، دائرۃ البروج کے ساتھ Ophiuchus سمیت 13)۔ برج 30° مساوی نجومی تقسیم ہے جو حقیقی فلکیاتی پوزیشن کو ظاہر نہیں کرتا۔ ہم IAU کوکبات استعمال کرتے ہیں۔` },
                    { q: `کیا اس صفحے کا چاند ڈیٹا ${_hubCity} کے مقامی وقت میں ہے؟`,
                      a: `جی ہاں۔ تمام مطلع/مغیبِ چاند اور بدر/نئے چاند کے اوقات ${_hubCity} کے مقامی ٹائم زون میں شمار کیے جاتے ہیں۔ شہر کی جغرافیائی محلِ وقوع بھی اتجاہ اور ارتفاع کو متاثر کرتی ہے۔` }
                ],
                de: [
                    { q: `Welche Mondphase ist heute in ${_hubCity}?`,
                      a: `Der Mond durchläuft 8 Phasen in einem 29,5-tägigen Zyklus. Diese Seite zeigt die aktuelle Phase und Beleuchtung live für ${_hubCity}, plus einen vollständigen Monatskalender der kommenden Phasen.` },
                    { q: `Wann ist der nächste Vollmond in ${_hubCity}?`,
                      a: `Ein Vollmond tritt alle 29,5 Tage auf. Diese Seite zeigt das genaue gregorianische und Hidschri-Datum des nächsten Vollmonds bei 100 % Beleuchtung.` },
                    { q: `Wann ist der nächste Neumond in ${_hubCity}?`,
                      a: `Ein Neumond ist der Moment, in dem der Mond zwischen Erde und Sonne liegt (0 % Beleuchtung). Diese Seite zeigt, wann der nächste Neumond stattfindet — auch der Beginn des neuen Hidschri-Monats.` },
                    { q: `Wie verwende ich den Mondkalender in ${_hubCity}?`,
                      a: `Klicken Sie auf einen beliebigen Tag im Kalender, um die Details dieses Tages für ${_hubCity} zu öffnen. Verwenden Sie die Schaltflächen "Vorheriger/Nächster Monat", um andere Monate zu durchsuchen. Jeder Monat hat seine eigene Seite unter /moon-in-{city}/YYYY-MM.` },
                    { q: `Warum unterscheiden sich Mondaufgangs- und -untergangszeiten in ${_hubCity} von anderen Städten?`,
                      a: `Mondaufgang und -untergang hängen von der geografischen Länge, Breite und Zeitzone ab. Der Unterschied kann zwischen Ost und West der Erde 12 Stunden erreichen. Die Zeiten dieser Seite werden für die lokale Zeitzone von ${_hubCity} berechnet.` },
                    { q: `Wie hängt der Mond mit dem Hidschri-Kalender zusammen?`,
                      a: `Der Hidschri-Kalender ist vollständig mondbasiert — jeder Monat beginnt mit der Sichtung der Mondsichel nach dem Neumond und dauert 29 oder 30 Tage. Das Hidschri-Jahr hat 354–355 Tage, ~11 Tage weniger als das Sonnenjahr.` },
                    { q: `Was ist der Unterschied zwischen einer astronomischen Konstellation und einem Tierkreiszeichen?`,
                      a: `Eine astronomische Konstellation ist eine Himmelsregion mit offiziellen IAU-Grenzen (88 insgesamt, 13 entlang der Ekliptik einschließlich Ophiuchus). Ein Tierkreiszeichen ist eine astrologische 30°-gleiche Einteilung, die NICHT die tatsächliche astronomische Position widerspiegelt. Wir verwenden IAU-Konstellationen.` },
                    { q: `Sind die Monddaten auf dieser Seite in der Ortszeit von ${_hubCity}?`,
                      a: `Ja. Alle Mondaufgangs-/-untergangszeiten und Vollmond-/Neumondzeiten werden in der lokalen Zeitzone von ${_hubCity} berechnet. Die geografischen Koordinaten der Stadt beeinflussen auch Richtung und Höhe.` }
                ],
                id: [
                    { q: `Apa fase bulan hari ini di ${_hubCity}?`,
                      a: `Bulan melewati 8 fase dalam siklus 29,5 hari. Halaman ini menampilkan fase saat ini dan iluminasi secara langsung untuk ${_hubCity}, plus kalender bulanan lengkap fase-fase mendatang.` },
                    { q: `Kapan bulan purnama berikutnya di ${_hubCity}?`,
                      a: `Bulan purnama terjadi setiap 29,5 hari. Halaman ini menampilkan tanggal Masehi dan Hijriah yang tepat untuk bulan purnama berikutnya pada iluminasi 100%.` },
                    { q: `Kapan bulan baru berikutnya di ${_hubCity}?`,
                      a: `Bulan baru adalah saat Bulan berada antara Bumi dan Matahari (iluminasi 0%). Halaman ini menampilkan kapan bulan baru berikutnya terjadi — juga awal bulan Hijriah baru.` },
                    { q: `Bagaimana cara menggunakan kalender bulan di ${_hubCity}?`,
                      a: `Klik hari mana pun di kalender untuk membuka detail hari itu untuk ${_hubCity}. Gunakan tombol bulan sebelumnya/berikutnya untuk menjelajahi bulan lain. Setiap bulan memiliki halamannya sendiri di /moon-in-{city}/YYYY-MM.` },
                    { q: `Mengapa waktu terbit dan terbenam Bulan di ${_hubCity} berbeda dari kota lain?`,
                      a: `Terbit dan terbenam Bulan tergantung pada bujur, lintang, dan zona waktu. Perbedaannya dapat mencapai 12 jam antara timur dan barat dunia. Waktu di halaman ini dihitung untuk zona waktu lokal ${_hubCity}.` },
                    { q: `Bagaimana Bulan terkait dengan kalender Hijriah?`,
                      a: `Kalender Hijriah sepenuhnya berbasis bulan — setiap bulan dimulai dengan rukyat hilal setelah bulan baru dan berlangsung 29 atau 30 hari. Tahun Hijriah 354–355 hari, ~11 hari lebih pendek dari tahun matahari.` },
                    { q: `Apa perbedaan antara konstelasi astronomi dan zodiak?`,
                      a: `Konstelasi astronomi adalah wilayah langit dengan batas resmi IAU (total 88, 13 di sepanjang ekliptika termasuk Ophiuchus). Zodiak adalah pembagian astrologi 30°-sama yang TIDAK mencerminkan posisi astronomi sebenarnya. Kami menggunakan konstelasi IAU.` },
                    { q: `Apakah data bulan di halaman ini dalam waktu lokal ${_hubCity}?`,
                      a: `Ya. Semua waktu terbit/terbenam Bulan dan purnama/bulan baru dihitung dalam zona waktu lokal ${_hubCity}. Koordinat geografis kota juga memengaruhi arah dan ketinggian.` }
                ],
                es: [
                    { q: `¿Cuál es la fase lunar hoy en ${_hubCity}?`,
                      a: `La Luna pasa por 8 fases en un ciclo de 29,5 días. Esta página muestra la fase actual y la iluminación en vivo para ${_hubCity}, además de un calendario mensual completo de las próximas fases.` },
                    { q: `¿Cuándo es la próxima luna llena en ${_hubCity}?`,
                      a: `Una luna llena ocurre cada 29,5 días. Esta página muestra la fecha gregoriana e hijri precisa de la próxima luna llena al 100 % de iluminación.` },
                    { q: `¿Cuándo es la próxima luna nueva en ${_hubCity}?`,
                      a: `La luna nueva es el instante en que la Luna se sitúa entre la Tierra y el Sol (0 % de iluminación). Esta página muestra cuándo ocurre la próxima luna nueva — también el inicio del nuevo mes hijri.` },
                    { q: `¿Cómo uso el calendario lunar en ${_hubCity}?`,
                      a: `Haga clic en cualquier día del calendario para abrir los detalles de ese día para ${_hubCity}. Use los botones de mes anterior/siguiente para explorar otros meses. Cada mes tiene su propia página en /moon-in-{city}/YYYY-MM.` },
                    { q: `¿Por qué los horarios de salida y puesta de la Luna en ${_hubCity} difieren de otras ciudades?`,
                      a: `La salida y puesta de la Luna dependen de la longitud, latitud y zona horaria. La diferencia puede alcanzar 12 horas entre el este y el oeste del globo. Los horarios de esta página se calculan para la zona horaria local de ${_hubCity}.` },
                    { q: `¿Cómo se relaciona la Luna con el calendario hijri?`,
                      a: `El calendario hijri es totalmente lunar — cada mes comienza con la observación del creciente tras la luna nueva y dura 29 o 30 días. El año hijri tiene 354–355 días, ~11 días más corto que el año solar.` },
                    { q: `¿Cuál es la diferencia entre una constelación astronómica y un signo del zodíaco?`,
                      a: `Una constelación astronómica es una región del cielo con límites oficiales de la IAU (88 en total, 13 a lo largo de la eclíptica incluyendo Ofiuco). Un signo del zodíaco es una división astrológica de 30° iguales que NO refleja la posición astronómica real. Usamos constelaciones IAU.` },
                    { q: `¿Los datos lunares de esta página están en hora local de ${_hubCity}?`,
                      a: `Sí. Todos los horarios de salida/puesta de la Luna y de luna llena/nueva se calculan en la zona horaria local de ${_hubCity}. Las coordenadas geográficas de la ciudad también afectan la dirección y la altitud.` }
                ],
                bn: [
                    { q: `${_hubCity}-এ আজ চাঁদের দশা কী?`,
                      a: `চাঁদ ২৯.৫ দিনের চক্রে ৮টি দশার মধ্য দিয়ে যায়। এই পৃষ্ঠা ${_hubCity}-এর জন্য বর্তমান দশা ও আলোকন সরাসরি দেখায়, পাশাপাশি আসন্ন দশাগুলির পূর্ণ মাসিক ক্যালেন্ডার।` },
                    { q: `${_hubCity}-এ পরবর্তী পূর্ণিমা কখন?`,
                      a: `পূর্ণিমা প্রতি ২৯.৫ দিনে ঘটে। এই পৃষ্ঠা ১০০% আলোকনে পরবর্তী পূর্ণিমার সঠিক খ্রিস্টীয় ও হিজরি তারিখ দেখায়।` },
                    { q: `${_hubCity}-এ পরবর্তী অমাবস্যা কখন?`,
                      a: `অমাবস্যা হল সেই মুহূর্ত যখন চাঁদ পৃথিবী ও সূর্যের মাঝে থাকে (০% আলোকন)। এই পৃষ্ঠা পরবর্তী অমাবস্যা কখন ঘটবে তা দেখায় — যা নতুন হিজরি মাসের শুরুও।` },
                    { q: `${_hubCity}-এ চাঁদের ক্যালেন্ডার কীভাবে ব্যবহার করব?`,
                      a: `${_hubCity}-এর জন্য সেই দিনের বিবরণ খুলতে ক্যালেন্ডারের যেকোনো দিনে ক্লিক করুন। অন্য মাস দেখার জন্য পূর্ববর্তী/পরবর্তী মাসের বোতাম ব্যবহার করুন। প্রতিটি মাসের নিজস্ব পৃষ্ঠা /moon-in-{city}/YYYY-MM-এ আছে।` },
                    { q: `${_hubCity}-এ চাঁদের উদয় ও অস্তের সময় অন্য শহর থেকে কেন আলাদা?`,
                      a: `চাঁদের উদয় ও অস্ত দ্রাঘিমাংশ, অক্ষাংশ ও টাইমজোনের উপর নির্ভর করে। পার্থক্য বিশ্বের পূর্ব ও পশ্চিমের মধ্যে ১২ ঘণ্টা পর্যন্ত হতে পারে। এই পৃষ্ঠার সময়গুলি ${_hubCity}-এর স্থানীয় টাইমজোনের জন্য গণনা করা হয়।` },
                    { q: `চাঁদ হিজরি ক্যালেন্ডারের সাথে কীভাবে সম্পর্কিত?`,
                      a: `হিজরি ক্যালেন্ডার সম্পূর্ণ চান্দ্র — প্রতিটি মাস অমাবস্যার পরে হিলাল দেখার মাধ্যমে শুরু হয় এবং ২৯ বা ৩০ দিন স্থায়ী হয়। হিজরি বছর ৩৫৪–৩৫৫ দিন, সৌর বছরের চেয়ে ~১১ দিন কম।` },
                    { q: `জ্যোতির্বিজ্ঞানিক নক্ষত্রমণ্ডল ও রাশিচক্রের মধ্যে পার্থক্য কী?`,
                      a: `জ্যোতির্বিজ্ঞানিক নক্ষত্রমণ্ডল হল আকাশের একটি অঞ্চল যার অফিসিয়াল IAU সীমানা আছে (মোট ৮৮, ক্রান্তিবৃত্ত বরাবর Ophiuchus সহ ১৩টি)। রাশিচক্র হল একটি ৩০°-সমান জ্যোতিষ বিভাজন যা প্রকৃত জ্যোতির্বিজ্ঞানিক অবস্থান প্রতিফলিত করে না। আমরা IAU নক্ষত্রমণ্ডল ব্যবহার করি।` },
                    { q: `এই পৃষ্ঠার চাঁদের ডেটা কি ${_hubCity}-এর স্থানীয় সময়ে?`,
                      a: `হ্যাঁ। সমস্ত চাঁদের উদয়/অস্ত এবং পূর্ণিমা/অমাবস্যার সময় ${_hubCity}-এর স্থানীয় টাইমজোনে গণনা করা হয়। শহরের ভৌগোলিক স্থানাঙ্কও দিকনির্দেশ এবং উচ্চতাকে প্রভাবিত করে।` }
                ],
                ms: [
                    { q: `Apakah fasa bulan hari ini di ${_hubCity}?`,
                      a: `Bulan melalui 8 fasa dalam kitaran 29.5 hari. Halaman ini memaparkan fasa semasa dan pencahayaan secara langsung untuk ${_hubCity}, serta kalendar bulanan lengkap fasa-fasa akan datang.` },
                    { q: `Bilakah bulan purnama seterusnya di ${_hubCity}?`,
                      a: `Bulan purnama berlaku setiap 29.5 hari. Halaman ini memaparkan tarikh Masihi dan Hijrah tepat bagi bulan purnama seterusnya pada pencahayaan 100%.` },
                    { q: `Bilakah anak bulan seterusnya di ${_hubCity}?`,
                      a: `Anak bulan ialah saat Bulan berada antara Bumi dan Matahari (0% pencahayaan). Halaman ini memaparkan bila anak bulan seterusnya berlaku — juga permulaan bulan Hijrah baharu.` },
                    { q: `Bagaimana saya menggunakan kalendar bulan di ${_hubCity}?`,
                      a: `Klik mana-mana hari dalam kalendar untuk membuka butiran hari itu untuk ${_hubCity}. Gunakan butang bulan sebelum/selepas untuk melayari bulan-bulan lain. Setiap bulan mempunyai halaman tersendiri di /moon-in-{city}/YYYY-MM.` },
                    { q: `Mengapa waktu terbit dan terbenam Bulan di ${_hubCity} berbeza daripada bandar lain?`,
                      a: `Terbit dan terbenam Bulan bergantung pada bujur, lintang dan zon waktu. Perbezaannya boleh mencapai 12 jam antara timur dan barat dunia. Waktu pada halaman ini dikira untuk zon waktu tempatan ${_hubCity}.` },
                    { q: `Bagaimana Bulan berkaitan dengan kalendar Hijrah?`,
                      a: `Kalendar Hijrah adalah sepenuhnya berdasarkan bulan — setiap bulan bermula dengan rukyah hilal selepas anak bulan dan berlangsung 29 atau 30 hari. Tahun Hijrah ialah 354–355 hari, ~11 hari lebih pendek daripada tahun matahari.` },
                    { q: `Apakah perbezaan antara buruj astronomi dan tanda zodiak?`,
                      a: `Buruj astronomi ialah kawasan langit dengan sempadan rasmi IAU (88 kesemuanya, 13 sepanjang ekliptik termasuk Ophiuchus). Tanda zodiak ialah pembahagian astrologi 30°-sama yang TIDAK mencerminkan kedudukan astronomi sebenar. Kami menggunakan buruj IAU.` },
                    { q: `Adakah data bulan di halaman ini dalam waktu tempatan ${_hubCity}?`,
                      a: `Ya. Semua waktu terbit/terbenam Bulan dan bulan purnama/anak bulan dikira dalam zon waktu tempatan ${_hubCity}. Koordinat geografi bandar juga mempengaruhi arah dan ketinggian.` }
                ],
            };
            moonFaqs = _MOON_HUB_FAQ_BY_LANG[seo.lang] || _MOON_HUB_FAQ_BY_LANG.en;
        } else {
            // /moon-today and /moon-today-in-{city}: lock to first 8 of the
            //   existing moon FAQ list (matches visible 8 on those pages).
            moonFaqs = (MOON_FAQ_I18N[seo.lang] || MOON_FAQ_I18N.en).slice(0, 8);
        }
        ssrGraph.push({
            "@type": "FAQPage",
            "@id": `${seo.canonical}#moon-faq`,
            "inLanguage": seo.lang,
            "mainEntity": moonFaqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a }
            }))
        });
    }

    // ─── UAT-Z1: Zakat FAQPage + HowTo schemas ───
    // Reads from the i18n dictionary (same source as the visible HTML
    // via data-i18n attributes), so JSON-LD never diverges from rendered
    // content. Falls back to English then Arabic dict, then to a hard-
    // coded English string if a key is missing in both dicts.
    if (seo.zakatFaq) {
        const _zDict = I18N[seo.lang] || I18N.en || {};
        const _zEn   = I18N.en || {};
        const _zAr   = I18N.ar || {};
        const _zT = (k, fb) => _zDict[k] || _zEn[k] || _zAr[k] || fb || '';
        const zakatFaqKeys = [
            ['zakat.faq.q1', 'zakat.faq.a1'],
            ['zakat.faq.q2', 'zakat.faq.a2'],
            ['zakat.faq.q3', 'zakat.faq.a3'],
            ['zakat.faq.q4', 'zakat.faq.a4'],
            ['zakat.faq.q5', 'zakat.faq.a5'],
            ['zakat.faq.q6', 'zakat.faq.a6'],
            ['zakat.faq.q7', 'zakat.faq.a7']
        ];
        ssrGraph.push({
            "@type": "FAQPage",
            "@id": `${seo.canonical}#zakat-faq`,
            "inLanguage": seo.lang,
            "mainEntity": zakatFaqKeys.map(([qK, aK]) => ({
                "@type": "Question",
                "name": _zT(qK),
                "acceptedAnswer": { "@type": "Answer", "text": _zT(aK) }
            }))
        });
        ssrGraph.push({
            "@type": "HowTo",
            "@id": `${seo.canonical}#zakat-howto`,
            "name": _zT('zakat.seo.h1', 'How to calculate zakat'),
            "inLanguage": seo.lang,
            "step": [
                { "@type": "HowToStep", "position": 1, "name": _zT('zakat.howto.step1', 'Determine the nisab.') },
                { "@type": "HowToStep", "position": 2, "name": _zT('zakat.howto.step2', 'Sum your zakatable wealth.') },
                { "@type": "HowToStep", "position": 3, "name": _zT('zakat.howto.step3', 'Subtract debts.') },
                { "@type": "HowToStep", "position": 4, "name": _zT('zakat.howto.step4', 'Multiply net wealth × 2.5%.') }
            ]
        });
    }

    // Round 9: Place schema لصفحات المدن القمريّة /moon-today-in-{slug}
    if (seo.moonCity) {
        ssrGraph.push({
            "@type": "Place",
            "@id": `${seo.canonical}#place-moon`,
            "name": seo.moonCity.name,
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": seo.moonCity.lat,
                "longitude": seo.moonCity.lng
            }
        });
    }

    if (ssrGraph.length) {
        const graphSchema = { "@context": "https://schema.org", "@graph": ssrGraph };
        parts.push(`<script id="ssr-graph-schema" type="application/ld+json">${JSON.stringify(graphSchema)}</script>`);
    }

    // Expose the server's authoritative city-name table to the client so the
    // Qibla page (and any other client renderer) can render localized city
    // names without guessing via Title-cased slugs. Mirrors _resolveCityName
    // behaviour for POPULAR_CITY_NAMES keys. Long-tail cities fall back to
    // LOCAL_CITIES (client-side) or to the slug.
    parts.push(`<script id="ssr-popular-city-names">window.__POPULAR_CITY_NAMES__=${JSON.stringify(POPULAR_CITY_NAMES)};</script>`);

    // Round 34 (qibla clean-URL hydration): for /qibla-in-{slug} pages, expose the
    // resolved city (lat/lng + 10-lang name table + English DB name) so the client
    // can render localized text without needing the city in LOCAL_CITIES.
    if (seo.qiblaRef && typeof seo.qiblaRef.lat === 'number' && typeof seo.qiblaRef.lng === 'number') {
        const _qcPayload = {
            slug: seo.qiblaRef.slug || '',
            lat: seo.qiblaRef.lat,
            lng: seo.qiblaRef.lng,
            name: seo.qiblaRef.cityName || '',
            englishName: seo.qiblaRef.englishName || '',
            names: seo.qiblaRef.names || {}
        };
        parts.push(`<script id="ssr-qibla-city">window.__QIBLA_CITY__=${JSON.stringify(_qcPayload)};</script>`);
    }

    parts.push('<!-- SSR-SEO-END -->');
    return parts.map(x => '    ' + x).join('\n');
}

/**
 * الدالة الموحّدة لتقديم HTML مع حقن SEO كامل.
 * تستبدل جميع الكتل المكررة (readCachedFile → gzip → res.end).
 */
function serveHtmlWithSeo(htmlBuf, urlPath, res, acceptEnc, qs) {
    let html = htmlBuf.toString('utf8');
    const seo = buildSeoForPath(urlPath);

    // 0) استبدال {LANG_PREFIX} بالبادئة الحاليّة (يخدم روابط الفوتر القانونيّة وغيرها)
    const _lpFor = (seo.lang === 'ar') ? '' : '/' + seo.lang;
    if (html.indexOf('{LANG_PREFIX}') !== -1) {
        html = html.split('{LANG_PREFIX}').join(_lpFor);
    }

    // 1) Language swap (ar → lang) لمنع CLS + دعم RTL للأردو والعربية
    if (seo.lang !== 'ar') {
        const newDir = seo.isRtl ? 'rtl' : 'ltr';
        html = html.replace(/<html([^>]*)\blang="ar"([^>]*)\bdir="rtl"/, `<html$1lang="${seo.lang}"$2dir="${newDir}"`);
    }
    // 1b) 🆕 Polish Round (F): حقن class="time-left-page" في <html> لصفحة time-left
    //     CSS يستخدم html.time-left-page لإظهار .tl-hero وإخفاء .city-hero-answer
    if (seo && seo.timeLeftPage) {
        // نضيف class دون المساس بـ lang/dir
        html = html.replace(/<html(\s[^>]*)?>/, (match, attrs) => {
            const a = attrs || '';
            // إن كانت هناك class موجودة: ألحق
            if (/\bclass="/.test(a)) {
                return '<html' + a.replace(/\bclass="([^"]*)"/, (mm, cls) => `class="${cls} time-left-page"`) + '>';
            }
            return '<html' + a + ' class="time-left-page">';
        });

        // 1b-PRUNE) 🆕 Level 3+: إزالة فعليّة (ليس display:none) للأقسام غير المستخدمة على
        //           صفحة time-left — توفير ~60-80KB من الحمولة الأولى + LCP أسرع.
        //           نحذف العناصر بالمعرّف أو الصنف مع مطابقة متوازنة لوسم الفتح/الإغلاق.
        html = _stripHtmlForTimeLeft(html);
    }
    // 1c) 🆕 Round 4 (Minimal): حقن class="next-prayer-time-page" في <html> لصفحة NPT
    //     CSS يستخدم html.next-prayer-time-page لإظهار .npt-hero وإخفاء .city-hero-answer + .tl-hero
    if (seo && seo.nextPrayerPage) {
        html = html.replace(/<html(\s[^>]*)?>/, (match, attrs) => {
            const a = attrs || '';
            if (/\bclass="/.test(a)) {
                return '<html' + a.replace(/\bclass="([^"]*)"/, (mm, cls) => `class="${cls} next-prayer-time-page"`) + '>';
            }
            return '<html' + a + ' class="next-prayer-time-page">';
        });

        // 1c-PRUNE) 🆕 NPT Physical DOM pruning — single-purpose page.
        //           نفس فلسفة TL: حذف فعليّ لكلّ ما ليس #npt-hero (city inherited sections + TL-specific bits)
        //           يوفّر ~60-80KB من حمولة الـ NPT ويجعل الصفحة مركّزة على سؤالها الوحيد.
        html = _stripHtmlForNpt(html);
    }
    // 1d) 🆕 Round 6 (City Audit): city page (not TL, not NPT) → strip dead-weight heroes.
    //     صفحة /prayer-times-in-{city} كانت تُرسِل #tl-hero + #tl-sticky + #npt-hero مخفيّة بـ CSS.
    //     الحذف الفعليّ يُنظِّف DOM (~6-10KB) ويُلغي H1 race + intent duplication أمام SEO.
    const _isCityPageSsr = !!(seo && !seo.timeLeftPage && !seo.nextPrayerPage
        && /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?prayer-times-in-[a-z][a-z0-9.-]+$/.test(urlPath));
    // ── 1d-PRE) SSR-Prayer-Times: pre-compute the 5 daily prayer times and
    //   inject them into the HTML before serving. Kills the "--:--" SEO
    //   problem where Googlebot sees empty placeholders and never waits for
    //   JS. Runs for: (a) the homepage / language-roots (Mecca defaults),
    //   (b) /prayer-times-in-{slug} city pages (resolved from slug),
    //   NOT for /time-left-* or /next-prayer-time-* (those are pruned).
    // UAT-Moon-Home: detect moon-today hub upfront for both gating and strip
    const _isMoonTodayHub = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today$/.test(urlPath);
    // Phase E4-city (2026-05-02): detect ALL moon city pages so we can strip
    //   the leftover #page-prayer-times shell from SSR (was causing 0.939 CLS).
    //   Matches /moon-today-in-{slug}[-lat-lng], /moon-in-{slug}[-lat-lng],
    //   /moon-in-{slug}/{YYYY-MM}, and /moon-in-{slug}/{YYYY-MM-DD}.
    const _isMoonCityPageSsr = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:moon-today-in-[a-z][a-z0-9.-]+(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?|moon-in-[a-z][a-z0-9.-]+(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?(?:\/\d{4}-\d{2}(?:-\d{2})?)?)$/.test(urlPath);
    if (!seo.timeLeftPage && !seo.nextPrayerPage && !seo.isHome && !_isMoonTodayHub) {
        // (UAT-Home-Simplify + UAT-Moon-Home) Skip when the prayer-cards block
        //   will be stripped immediately after (homepage + moon hub).
        let _ssrSlug = 'mecca';
        const _slugForTimes = urlPath.match(/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?prayer-times-in-([a-z][a-z0-9.-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/);
        if (_slugForTimes) _ssrSlug = _slugForTimes[1];
        html = _ssrInjectPrayerTimes(html, _ssrSlug);
    }
    // 1e) UAT-Home-Simplify: homepage → minimal gateway (Hero + 4 tools + 8
    //     countries + 2 generic FAQ + slim footer). Strip all city-flavored
    //     content + add html.home-page class for any leftover CSS targeting.
    if (seo.isHome) {
        html = _stripHtmlForHome(html);
        // Inject class="home-page" on <html>
        html = html.replace(/<html(\s[^>]*)?>/, (match, attrs) => {
            const a = attrs || '';
            if (/\bclass="/.test(a)) {
                return '<html' + a.replace(/\bclass="([^"]*)"/, (mm, cls) => `class="${cls} home-page"`) + '>';
            }
            return '<html' + a + ' class="home-page">';
        });
        // FAQ q1/q2 generic — add data-i18n attributes pointing at home-only
        //   keys so _translateI18nAttrs (later in the pipeline) fills them
        //   per-language without {loc} interpolation. q3-q9 are stripped.
        html = html
            .replace('<div class="faq-question" id="faq-q1">', '<div class="faq-question" id="faq-q1" data-i18n="faq.home.q1">')
            .replace('<p id="faq-a1-intro">', '<p id="faq-a1-intro" data-i18n="faq.home.a1">')
            .replace('<div class="faq-question" id="faq-q2">', '<div class="faq-question" id="faq-q2" data-i18n="faq.home.q2">')
            .replace('<p id="faq-a2">', '<p id="faq-a2" data-i18n="faq.home.a2">')
            // Strip the times-list ul (only meaningful for city Q1 with prayer rows)
            .replace(/<ul class="faq-times-list" id="faq-times-list">[\s\S]*?<\/ul>/, '');
    }
    // 1f) UAT-Moon-Home: /moon-today → Moon Gateway. Strip heavy moon sections
    //     + entire #page-prayer-times shell. Inject html.moon-today-hub-page so
    //     CSS reveals the new #moon-hub-hero / #moon-hub-faq immediately.
    if (_isMoonTodayHub) {
        html = _stripHtmlForMoonHub(html);
        html = html.replace(/<html(\s[^>]*)?>/, (match, attrs) => {
            const a = attrs || '';
            if (/\bclass="/.test(a)) {
                return '<html' + a.replace(/\bclass="([^"]*)"/, (mm, cls) => `class="${cls} moon-today-hub-page"`) + '>';
            }
            return '<html' + a + ' class="moon-today-hub-page">';
        });
        // ── Phase E2-keywords (2026-05-01): inject current-month heading ──
        // SEOptimer flagged "مايو" / "مايو 2026" as appearing frequently in
        // /moon-today body without showing in any heading. This block fills
        // the static placeholder #moon-current-month-h2 with a per-lang
        // sentence containing the localized month name + year. The text
        // changes monthly (date-driven); on /moon-today only.
        try {
            const _curDate = new Date();
            const _curMonthIdx = _curDate.getMonth();   // 0-11
            const _curYear = _curDate.getFullYear();
            const _moonH2Months = {
                ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
                en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
                tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
                ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
                de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
                id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
                es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
                bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
                ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'],
            };
            const _mList = _moonH2Months[seo.lang] || _moonH2Months.en;
            const _mName = _mList[_curMonthIdx];
            const _moonH2Templates = {
                ar: `أطوار القمر خلال ${_mName} ${_curYear}`,
                en: `Moon Phases in ${_mName} ${_curYear}`,
                fr: `Phases de la Lune en ${_mName} ${_curYear}`,
                tr: `${_mName} ${_curYear} Ay Evreleri`,
                ur: `${_mName} ${_curYear} میں چاند کے مراحل`,
                de: `Mondphasen im ${_mName} ${_curYear}`,
                id: `Fase Bulan ${_mName} ${_curYear}`,
                es: `Fases de la Luna en ${_mName} de ${_curYear}`,
                bn: `${_mName} ${_curYear}-এ চাঁদের দশা`,
                ms: `Fasa Bulan ${_mName} ${_curYear}`,
            };
            const _moonH2Text = _moonH2Templates[seo.lang] || _moonH2Templates.en;
            // IMPORTANT: drop the `data-i18n` attribute when we inject the
            // dynamic text. _translateI18nAttrs() runs LATER in the pipeline
            // and would overwrite our dynamic month/year string with the
            // generic "Moon Phases This Month" i18n value otherwise. (AR
            // is unaffected because _translateI18nAttrs skips lang === 'ar'
            // by design.) Removing data-i18n means our SSR text is final.
            html = html.replace(
                /<span data-i18n="moon\.current_month_h2">[^<]*<\/span>/,
                `<span>${_escHtml(_moonH2Text)}</span>`
            );
        } catch (_e) { /* silent — static AR fallback already in place */ }

        // ── Phase E2-keywords-Hub-final (2026-05-01) + E2-content-balance-Hub (2026-05-01): inject 4 SSR-only
        //    content blocks for /moon-today (Hub) ──
        //
        // SEOptimer was flagging the Hub on:
        //   1) Keyword Consistency — بدر, قمر مكتمل, طور القمر, مكة المكرمة,
        //      مواقيت الصلاة all missing from Title/Meta/Headings (Title and
        //      Meta are intentionally NOT touched per the user's hard rule).
        //   2) Amount of Content: Low — Hub has ~600 words vs city's 1187.
        //
        // Fix: inject 3 NEW H2 sections + 1 footer note covering the missing
        // keywords naturally. Pure SSR (no index.html / CSS change). Inside
        // _isMoonTodayHub block so the content NEVER leaks to /moon-today-in-
        // {city} or /moon-in-{city} (those are already SEOptimer-green).
        //
        // Hard rules (ALL preserved):
        //   • NO .hub-only class (would hide content from SEOptimer crawler)
        //   • NO data-i18n attribute (would be overwritten by _translateI18nAttrs)
        //   • NO month name "مايو" or year in any new heading (no rotation)
        //   • NO "مكة المكرمة" in Title or H1 (Hub stays generic — body OK)
        //   • Single H1 preserved (these are H2)
        //   • Three H2 maximum, no keyword stuffing
        try {
            const _hubLang = seo.lang || 'ar';
            const _hubPick = (m) => m[_hubLang] || m.en;

            // SECTION 1: طور القمر اليوم ونسبة الإضاءة (~80 words AR)
            //   Inserted BEFORE #moon-current-month-h2 so it sits between
            //   #moon-main-card and the month H2 — natural reading flow.
            const _hubSec1H2 = {
                    ar: 'طور القمر اليوم ونسبة الإضاءة',
                    en: 'Today\'s Moon Phase and Illumination',
                    fr: 'Phase de la Lune aujourd\'hui et illumination',
                    tr: 'Bugünkü Ay Evresi ve Aydınlanma',
                    ur: 'آج چاند کا مرحلہ اور روشنی کا فیصد',
                    de: 'Heutige Mondphase und Beleuchtung',
                    id: 'Fase Bulan Hari Ini dan Iluminasi',
                    es: 'Fase de la Luna hoy e iluminación',
                    bn: 'আজকের চাঁদের দশা ও আলোকন',
                    ms: 'Fasa Bulan Hari Ini dan Pencahayaan',
                };
            const _hubSec1P  = {
                    ar: 'تعرض صفحة حالة القمر اليوم الطور الحالي للقمر ومقدار الضوء الظاهر وعمر القمر منذ آخر محاق. يتغير طور القمر يومياً بحسب موقعه بالنسبة للشمس والأرض، لذلك تساعد هذه الصفحة على متابعة التغير اليومي في شكل القمر وحركته خلال الشهر الهجري. تشمل بيانات القمر اليوم: النسبة المضيئة الحالية، عمر القمر بالأيام، المسافة بين الأرض والقمر بالكيلومترات، ومواعيد طلوع القمر وغروبه التقريبية.',
                    en: 'This page shows today\'s moon phase, the visible lit portion, and the moon\'s age since the last new moon. The moon phase changes daily based on the moon\'s position relative to the Sun and Earth, so this page helps you track the daily change in the moon\'s shape and motion throughout the Hijri month. Today\'s moon data includes: the current bright portion, moon age in days, the Earth-moon distance in kilometers, and approximate moonrise and moonset times.',
                    fr: 'Cette page affiche la phase actuelle de la Lune aujourd\'hui, la partie éclairée visible et l\'âge de la Lune depuis la dernière nouvelle lune. La phase lunaire change quotidiennement selon la position de la Lune par rapport au Soleil et à la Terre, ce qui permet de suivre l\'évolution quotidienne de la forme de la Lune et son mouvement durant le mois hégirien. Les données incluent la partie éclairée actuelle, l\'âge de la Lune en jours, la distance Terre-Lune en kilomètres, et les heures approximatives de lever et coucher.',
                    tr: 'Bu sayfa, ayın bugünkü mevcut evresini, görünen aydınlık kısmı ve son yeni aydan bu yana ayın yaşını gösterir. Ay evresi, Güneş ve Dünya\'ya göre konumuna bağlı olarak günlük değişir, bu nedenle bu sayfa hicri ay boyunca ayın şeklindeki günlük değişimi ve hareketini takip etmenize yardımcı olur. Bugünkü ay verileri şunları içerir: güncel parlak kısım, gün olarak ay yaşı, kilometre cinsinden Dünya-Ay mesafesi ve yaklaşık ay doğuşu ve batış saatleri.',
                    ur: 'یہ صفحہ آج چاند کا موجودہ مرحلہ، روشن نظر آنے والا حصہ، اور آخری نئے چاند سے چاند کی عمر دکھاتا ہے۔ چاند کا مرحلہ سورج اور زمین کے نسبت اس کی پوزیشن کے مطابق روزانہ تبدیل ہوتا ہے، اس لیے یہ صفحہ ہجری مہینے کے دوران چاند کی شکل میں روزانہ تبدیلی اور اس کی حرکت کا پتہ لگانے میں مدد کرتا ہے۔ آج کے چاند کا ڈیٹا شامل ہے: موجودہ روشن حصہ، دنوں میں چاند کی عمر، کلومیٹر میں زمین چاند فاصلہ، اور تقریبی طلوع و غروب کے اوقات۔',
                    de: 'Diese Seite zeigt die heutige Mondphase, den sichtbaren beleuchteten Teil und das Alter des Mondes seit dem letzten Neumond. Die Mondphase ändert sich täglich je nach Position des Mondes relativ zur Sonne und Erde, weshalb diese Seite Ihnen hilft, die tägliche Veränderung der Mondform und seine Bewegung während des Hidschri-Monats zu verfolgen. Die heutigen Monddaten umfassen den aktuellen hellen Teil, das Mondalter in Tagen, die Erde-Mond-Entfernung in Kilometern und ungefähre Mondaufgangs- und Untergangszeiten.',
                    id: 'Halaman ini menampilkan fase Bulan saat ini hari ini, bagian yang terlihat terang, dan usia Bulan sejak bulan baru terakhir. Fase Bulan berubah setiap hari tergantung posisinya relatif terhadap Matahari dan Bumi, sehingga halaman ini membantu Anda melacak perubahan harian dalam bentuk Bulan dan pergerakannya selama bulan Hijriah. Data Bulan hari ini meliputi: bagian terang saat ini, usia Bulan dalam hari, jarak Bumi-Bulan dalam kilometer, dan perkiraan waktu terbit dan terbenam Bulan.',
                    es: 'Esta página muestra la fase actual de la Luna hoy, la parte iluminada visible y la edad de la Luna desde la última luna nueva. La fase lunar cambia diariamente según su posición respecto al Sol y a la Tierra, por lo que esta página le ayuda a seguir el cambio diario en la forma de la Luna y su movimiento durante el mes hijri. Los datos lunares de hoy incluyen la parte brillante actual, la edad de la Luna en días, la distancia Tierra-Luna en kilómetros y los horarios aproximados de salida y puesta.',
                    bn: 'এই পৃষ্ঠাটি আজকের চাঁদের বর্তমান দশা, দৃশ্যমান আলোকিত অংশ, এবং সর্বশেষ অমাবস্যা থেকে চাঁদের বয়স প্রদর্শন করে। চাঁদের দশা সূর্য এবং পৃথিবীর সাপেক্ষে এর অবস্থানের উপর নির্ভর করে প্রতিদিন পরিবর্তন হয়, তাই এই পৃষ্ঠাটি হিজরি মাস জুড়ে চাঁদের আকারে দৈনিক পরিবর্তন এবং এর গতি ট্র্যাক করতে সাহায্য করে। আজকের চাঁদের তথ্যের মধ্যে রয়েছে: বর্তমান উজ্জ্বল অংশ, দিনের হিসেবে চাঁদের বয়স, কিলোমিটারে পৃথিবী-চাঁদ দূরত্ব এবং চাঁদের আনুমানিক উদয় ও অস্তের সময়।',
                    ms: 'Halaman ini memaparkan fasa Bulan semasa hari ini, bahagian terang yang kelihatan, dan usia Bulan sejak anak bulan terakhir. Fasa Bulan berubah setiap hari bergantung pada kedudukannya berbanding Matahari dan Bumi, jadi halaman ini membantu anda mengikuti perubahan harian dalam bentuk Bulan dan pergerakannya sepanjang bulan Hijrah. Data Bulan hari ini meliputi: bahagian terang semasa, usia Bulan dalam hari, jarak Bumi-Bulan dalam kilometer, dan waktu terbit dan terbenam Bulan yang anggaran.',
                };
            const _hubSec1Html = '<section class="section-card moon-seo-info moon-seo-phase">'
                + '<h2>' + _escHtml(_hubPick(_hubSec1H2)) + '</h2>'
                + '<p>'  + _escHtml(_hubPick(_hubSec1P))  + '</p>'
                + '</section>';
            html = html.replace(
                /<h2 id="moon-current-month-h2"/,
                _hubSec1Html + '<h2 id="moon-current-month-h2"'
            );

            // SECTION 2: موعد البدر القادم والقمر المكتمل (~75 words AR)
            //   Inserted AFTER #moon-upcoming-section closes — next-phases
            //   table flows into "next full moon" topic naturally.
            const _hubSec2H2 = {
                    ar: 'موعد بدر قمر مكتمل والطور القادم',
                    en: 'Next Full Moon (Badr) Date and Upcoming Phase',
                    fr: 'Date de la prochaine pleine lune (Badr) et phase à venir',
                    tr: 'Sıradaki Dolunay (Badr) Tarihi ve Yaklaşan Evre',
                    ur: 'اگلے بدر مکمل چاند کی تاریخ اور آنے والا مرحلہ',
                    de: 'Nächstes Vollmond-Datum (Badr) und kommende Phase',
                    id: 'Tanggal Purnama (Badr) Berikutnya dan Fase Mendatang',
                    es: 'Próxima fecha de luna llena (Badr) y fase venidera',
                    bn: 'পরবর্তী পূর্ণিমা (বদর) তারিখ ও আসন্ন পর্যায়',
                    ms: 'Tarikh Bulan Purnama (Badr) Seterusnya dan Fasa Akan Datang',
                };
            const _hubSec2P  = {
                    ar: 'يوضح هذا القسم موعد البدر القادم ومرحلة القمر المكتمل ضمن الدورة القمرية الحالية. عند ظهور بدر قمر مكتمل، يصل القمر إلى أعلى نسبة إضاءة، ويمكن مقارنة ذلك مع مراحل القمر الأخرى مثل المحاق والتربيع الأول والتربيع الأخير. تتغير حالة القمر يومياً وتمر بعدة أطوار بين المحاق والبدر، ولكل طور علاماته البصرية ومدته الزمنية ضمن الشهر القمري الذي يبلغ متوسطه 29.5 يوماً.',
                    en: 'This section explains the date of the next full moon and the full moon stage within the current lunar cycle. When a full moon (badr) appears, the moon reaches its peak illumination, and this can be compared with other moon phases such as new moon, first quarter, and last quarter. The moon\'s state changes daily and passes through several phases between new moon and full moon, with each phase having its own visual markers and duration within the lunar month, which averages 29.5 days.',
                    fr: 'Cette section explique la date de la prochaine pleine lune et l\'étape de la pleine lune dans le cycle lunaire actuel. Lorsqu\'une pleine lune apparaît, la Lune atteint son pic d\'illumination, ce qui peut être comparé aux autres phases lunaires comme la nouvelle lune, le premier quartier et le dernier quartier. L\'état de la Lune change quotidiennement et passe par plusieurs phases entre la nouvelle lune et la pleine lune, chaque phase ayant ses repères visuels et sa durée dans le mois lunaire d\'environ 29,5 jours.',
                    tr: 'Bu bölüm, mevcut ay döngüsündeki sıradaki dolunay tarihini ve dolunay aşamasını açıklar. Bir dolunay göründüğünde, Ay en yüksek aydınlanmasına ulaşır ve bu, yeni ay, ilk dördün ve son dördün gibi diğer ay evreleriyle karşılaştırılabilir. Ayın durumu günlük olarak değişir ve yeni ay ile dolunay arasında birkaç evre geçirir; her evrenin kendi görsel işaretleri ve süresi vardır ve ortalama 29,5 gün süren ay döngüsü içinde yer alır.',
                    ur: 'یہ سیکشن موجودہ قمری چکر میں اگلے بدر کی تاریخ اور مکمل چاند کے مرحلے کی وضاحت کرتا ہے۔ جب بدر مکمل چاند ظاہر ہوتا ہے، چاند اپنی سب سے زیادہ روشنی تک پہنچتا ہے، اور اس کا موازنہ چاند کے دوسرے مراحل جیسے نئے چاند، پہلے چوتھائی اور آخری چوتھائی سے کیا جا سکتا ہے۔ چاند کی حالت روزانہ تبدیل ہوتی ہے اور نئے چاند سے بدر تک کئی مراحل سے گزرتی ہے، ہر مرحلے کے اپنے بصری نشانات اور مدت ہوتی ہے، جو اوسطاً 29.5 دنوں کے قمری مہینے میں آتی ہے۔',
                    de: 'Dieser Abschnitt erklärt das Datum des nächsten Vollmonds und die Vollmondphase innerhalb des aktuellen Mondzyklus. Wenn ein Vollmond erscheint, erreicht der Mond seine maximale Beleuchtung und kann mit anderen Mondphasen wie Neumond, erstem Viertel und letztem Viertel verglichen werden. Der Zustand des Mondes ändert sich täglich und durchläuft mehrere Phasen zwischen Neumond und Vollmond, wobei jede Phase ihre eigenen visuellen Merkmale und Dauer innerhalb des Mondmonats hat, der durchschnittlich 29,5 Tage dauert.',
                    id: 'Bagian ini menjelaskan tanggal purnama berikutnya dan tahap bulan purnama dalam siklus bulan saat ini. Ketika bulan purnama muncul, Bulan mencapai pencahayaan puncaknya, dan ini dapat dibandingkan dengan fase Bulan lainnya seperti bulan baru, kuartal pertama, dan kuartal terakhir. Keadaan Bulan berubah setiap hari dan melewati beberapa fase antara bulan baru dan bulan purnama, dengan setiap fase memiliki tanda visual dan durasi tersendiri dalam bulan lunar yang rata-rata 29,5 hari.',
                    es: 'Esta sección explica la fecha de la próxima luna llena y la etapa de la luna llena dentro del ciclo lunar actual. Cuando aparece una luna llena, la Luna alcanza su iluminación máxima, lo que se puede comparar con otras fases lunares como la luna nueva, el primer cuarto y el último cuarto. El estado de la Luna cambia diariamente y pasa por varias fases entre la luna nueva y la luna llena, cada fase tiene sus propios marcadores visuales y duración dentro del mes lunar de aproximadamente 29,5 días.',
                    bn: 'এই বিভাগটি বর্তমান চান্দ্র চক্রে পরবর্তী পূর্ণিমার তারিখ এবং পূর্ণ চাঁদের পর্যায় ব্যাখ্যা করে। যখন পূর্ণিমা দেখা যায়, চাঁদ তার সর্বোচ্চ আলোকনে পৌঁছে, এবং এটি অন্যান্য চাঁদের দশার সাথে তুলনা করা যেতে পারে যেমন অমাবস্যা, প্রথম পাদ এবং শেষ পাদ। চাঁদের অবস্থা প্রতিদিন পরিবর্তন হয় এবং অমাবস্যা ও পূর্ণিমার মধ্যে বিভিন্ন দশার মধ্য দিয়ে যায়, প্রতিটি দশার নিজস্ব দৃশ্যমান চিহ্ন এবং সময়কাল রয়েছে যা গড়ে 29.5 দিনের চান্দ্র মাসের মধ্যে।',
                    ms: 'Bahagian ini menjelaskan tarikh bulan purnama seterusnya dan peringkat bulan purnama dalam kitaran bulan semasa. Apabila bulan purnama muncul, Bulan mencapai pencahayaan puncaknya, dan ini boleh dibandingkan dengan fasa Bulan lain seperti anak bulan, suku pertama, dan suku terakhir. Keadaan Bulan berubah setiap hari dan melalui beberapa fasa antara anak bulan dan bulan purnama, dengan setiap fasa mempunyai tanda visual dan tempohnya sendiri dalam bulan lunar yang berpurata 29.5 hari.',
                };
            const _hubSec2Html = '<section class="section-card moon-seo-info moon-seo-badr">'
                + '<h2>' + _escHtml(_hubPick(_hubSec2H2)) + '</h2>'
                + '<p>'  + _escHtml(_hubPick(_hubSec2P))  + '</p>'
                + '</section>';
            html = html.replace(
                /(<section[^>]*id="moon-upcoming-section"[^>]*>[\s\S]*?<\/section>)/,
                (m) => m + _hubSec2Html
            );

            // SECTION 3: حسابات القمر حسب المدينة المختارة (~75 words AR)
            //   Inserted BEFORE #moon-other-cities — explains the default
            //   city, then the existing "moon in other cities" grid follows.
            const _hubSec3H2 = {
                    ar: 'حسابات القمر حسب المدينة المختارة',
                    en: 'Moon Calculations by Selected City',
                    fr: 'Calculs lunaires selon la ville sélectionnée',
                    tr: 'Seçilen Şehre Göre Ay Hesaplamaları',
                    ur: 'منتخب شہر کے مطابق چاند کے حسابات',
                    de: 'Mondberechnungen nach gewählter Stadt',
                    id: 'Perhitungan Bulan Berdasarkan Kota Terpilih',
                    es: 'Cálculos lunares por ciudad seleccionada',
                    bn: 'নির্বাচিত শহর অনুযায়ী চাঁদের গণনা',
                    ms: 'Pengiraan Bulan Mengikut Bandar Dipilih',
                };
            const _hubSec3P  = {
                    ar: 'قد تظهر بيانات القمر افتراضياً لمدينة مكة المكرمة أو للمدينة التي يختارها المستخدم، مع إمكانية الانتقال نحو صفحات المدن لمتابعة حالة القمر اليوم في الرياض أو المدينة الحالية أو غيرها. تختلف أوقات شروق القمر وغروبه قليلاً حسب الموقع الجغرافي، بينما تبقى مراحل القمر العامة مرتبطة بالدورة القمرية نفسها. تتوفر بيانات القمر لجميع المدن الكبرى في العالم العربي والإسلامي.',
                    en: 'Moon data may appear by default for the city of Mecca or for the city selected by the user, with the option to navigate to city pages to track today\'s moon state in Riyadh, your current city, or others. Moonrise and moonset times differ slightly by geographic location, while general moon phases remain tied to the lunar cycle itself. Moon data is available for all major cities in the Arab and Islamic world.',
                    fr: 'Les données lunaires peuvent s\'afficher par défaut pour la ville de La Mecque ou pour la ville choisie par l\'utilisateur, avec la possibilité d\'accéder aux pages de villes pour suivre l\'état actuel de la Lune à Riyad, votre ville actuelle ou ailleurs. Les heures de lever et de coucher de la Lune diffèrent légèrement selon l\'emplacement géographique, tandis que les phases lunaires générales restent liées au cycle lunaire lui-même. Les données lunaires sont disponibles pour toutes les grandes villes du monde arabe et islamique.',
                    tr: 'Ay verileri varsayılan olarak Mekke şehri veya kullanıcının seçtiği şehir için görünebilir; bugünkü ay durumunu Riyad, mevcut şehrinizde veya diğer şehirlerde takip etmek için şehir sayfalarına gitme imkânı vardır. Ay doğuş ve batış saatleri coğrafi konuma göre biraz farklılık gösterir, genel ay evreleri ise ay döngüsünün kendisine bağlı kalır. Ay verileri Arap ve İslam dünyasının tüm büyük şehirleri için mevcuttur.',
                    ur: 'چاند کا ڈیٹا بطور ڈیفالٹ مکہ مکرمہ شہر کے لیے یا صارف کے منتخب کردہ شہر کے لیے ظاہر ہو سکتا ہے، شہر کے صفحات پر جانے کے ساتھ آج کا چاند ریاض، آپ کا موجودہ شہر یا دیگر میں دیکھ سکتے ہیں۔ چاند کے طلوع و غروب کے اوقات جغرافیائی محل وقوع کے مطابق تھوڑے مختلف ہوتے ہیں، جبکہ چاند کے عام مراحل قمری چکر سے ہی جڑے رہتے ہیں۔ چاند کا ڈیٹا عرب اور اسلامی دنیا کے تمام بڑے شہروں کے لیے دستیاب ہے۔',
                    de: 'Monddaten können standardmäßig für die Stadt Mekka oder für die vom Benutzer ausgewählte Stadt angezeigt werden, mit der Möglichkeit, zu Stadtseiten zu navigieren, um den heutigen Mondzustand in Riad, Ihrer aktuellen Stadt oder anderen Städten zu verfolgen. Mondaufgangs- und Untergangszeiten unterscheiden sich leicht je nach geografischem Standort, während die allgemeinen Mondphasen an den Mondzyklus selbst gebunden bleiben. Monddaten sind für alle großen Städte der arabischen und islamischen Welt verfügbar.',
                    id: 'Data Bulan dapat muncul secara default untuk kota Makkah atau untuk kota yang dipilih pengguna, dengan opsi untuk menavigasi ke halaman kota untuk melacak keadaan Bulan hari ini di Riyadh, kota Anda saat ini, atau lainnya. Waktu terbit dan terbenam Bulan sedikit berbeda berdasarkan lokasi geografis, sementara fase Bulan secara umum tetap terkait dengan siklus bulan itu sendiri. Data Bulan tersedia untuk semua kota besar di dunia Arab dan Islam.',
                    es: 'Los datos lunares pueden mostrarse por defecto para la ciudad de La Meca o para la ciudad seleccionada por el usuario, con la opción de navegar a las páginas de ciudades para seguir el estado actual de la Luna en Riad, su ciudad actual u otras. Los horarios de salida y puesta de la Luna difieren ligeramente según la ubicación geográfica, mientras que las fases lunares generales permanecen vinculadas al propio ciclo lunar. Los datos lunares están disponibles para todas las principales ciudades del mundo árabe e islámico.',
                    bn: 'চাঁদের তথ্য ডিফল্টরূপে মক্কা শহরের জন্য বা ব্যবহারকারীর নির্বাচিত শহরের জন্য দেখাতে পারে, রিয়াদ, আপনার বর্তমান শহর বা অন্যান্য শহরে আজকের চাঁদের অবস্থা ট্র্যাক করতে শহর পৃষ্ঠাগুলিতে নেভিগেট করার বিকল্প সহ। চাঁদের উদয় ও অস্তের সময় ভৌগলিক অবস্থান অনুযায়ী সামান্য পার্থক্য থাকে, যেখানে চাঁদের সাধারণ দশাগুলি চান্দ্র চক্রের সাথেই বাঁধা থাকে। চাঁদের তথ্য আরব ও ইসলামী বিশ্বের সমস্ত বড় শহরের জন্য উপলব্ধ।',
                    ms: 'Data Bulan boleh dipaparkan secara lalai untuk bandar Mekah atau untuk bandar yang dipilih pengguna, dengan pilihan untuk melayari halaman bandar bagi memantau keadaan Bulan hari ini di Riyadh, bandar semasa anda, atau lain-lain. Waktu terbit dan terbenam Bulan sedikit berbeza mengikut lokasi geografi, sementara fasa Bulan secara umum tetap terikat dengan kitaran bulan itu sendiri. Data Bulan tersedia untuk semua bandar utama di dunia Arab dan Islam.',
                };
            const _hubSec3Html = '<section class="section-card moon-seo-info moon-seo-default-city">'
                + '<h2>' + _escHtml(_hubPick(_hubSec3H2)) + '</h2>'
                + '<p>'  + _escHtml(_hubPick(_hubSec3P))  + '</p>'
                + '</section>';
            html = html.replace(
                /<div class="section-card" id="moon-other-cities"/,
                _hubSec3Html + '<div class="section-card" id="moon-other-cities"'
            );

            // SECTION 4: footer note inside #moon-hub-faq (~25 words AR)
            //   Inserted just before </section> of the FAQ — covers
            //   "مواقيت الصلاة" naturally as a "this page is part of …" line.
            const _hubSec4Note = {
                    ar: 'هذه الصفحة جزء من أدوات موقع مواقيت الصلاة، وتشمل أدوات مرتبطة مثل التقويم الهجري واتجاه القبلة ومواقيت الصلاة حسب المدينة.',
                    en: 'This page is part of the Prayer Times website tools, including related tools like the Hijri Calendar, Qibla Direction, and Prayer Times by city.',
                    fr: 'Cette page fait partie des outils du site Heures de Prière, comprenant des outils connexes comme le Calendrier hégirien, la Direction de la Qibla et les Heures de Prière par ville.',
                    tr: 'Bu sayfa, Namaz Vakitleri sitesinin araçlarının bir parçasıdır ve Hicri Takvim, Kıble Yönü ve şehre göre Namaz Vakitleri gibi ilgili araçları içerir.',
                    ur: 'یہ صفحہ نماز کے اوقات کی ویب سائٹ کے ٹولز کا حصہ ہے، جس میں ہجری کیلنڈر، قبلہ کی سمت اور شہر کے مطابق نماز کے اوقات جیسے متعلقہ ٹولز شامل ہیں۔',
                    de: 'Diese Seite ist Teil der Tools der Gebetszeiten-Website und umfasst verwandte Tools wie den Hidschri-Kalender, die Qibla-Richtung und die Gebetszeiten nach Stadt.',
                    id: 'Halaman ini adalah bagian dari alat situs Waktu Salat, mencakup alat terkait seperti Kalender Hijriah, Arah Kiblat, dan Waktu Salat menurut kota.',
                    es: 'Esta página forma parte de las herramientas del sitio Horarios de Oración, incluidas herramientas relacionadas como el Calendario hijri, la Dirección de la Qibla y los Horarios de Oración por ciudad.',
                    bn: 'এই পৃষ্ঠাটি নামাজের সময় ওয়েবসাইটের সরঞ্জামের অংশ, যার মধ্যে রয়েছে হিজরি ক্যালেন্ডার, কিবলার দিক এবং শহর অনুযায়ী নামাজের সময়ের মতো সম্পর্কিত সরঞ্জাম।',
                    ms: 'Halaman ini adalah sebahagian daripada alat laman web Waktu Solat, termasuk alat berkaitan seperti Kalendar Hijrah, Arah Kiblat, dan Waktu Solat mengikut bandar.',
                };
            const _hubSec4Html = '<p class="moon-seo-note">' + _escHtml(_hubPick(_hubSec4Note)) + '</p>';
            html = html.replace(
                /(<section[^>]*id="moon-hub-faq"[^>]*>[\s\S]*?)(<\/section>)/,
                (m, body, close) => body + _hubSec4Html + close
            );
        } catch (_e) { /* silent — Hub-final injection failed, page still serves */ }

        // ── Phase E2-content-depth-Hub (2026-05-01): add ONE long
        //    educational H2 section to fix SEOptimer "Amount of Content: Low".
        //
        // After E2-keywords-Hub-final raised Keyword Consistency to ✅, the
        // Hub is still ~729 words vs city pages' 1187. This phase adds NO new
        // keywords (already green) — only depth via a single H2 + 3 paragraphs
        // explaining how to read moon data. ~250 AR words.
        //
        // Inserted AFTER moon-seo-phase (E2-final Section 1) so the flow is:
        //   #moon-main-card → moon-seo-phase → [NEW: moon-seo-depth] →
        //   #moon-current-month-h2 → ... rest of page
        //
        // Hard rules preserved: NO data-i18n, NO .hub-only, NO Title/Meta/H1
        // change, NO new keyword headings, max 1 new H2.
        try {
            const _depthLang = seo.lang || 'ar';
            const _depthPick = (m) => m[_depthLang] || m.en;

            const _depthH2 = {
                    ar: 'كيف تُقرأ بيانات القمر اليوم؟',
                    en: 'How to Read Today\'s Moon Data',
                    fr: 'Comment lire les données de la Lune aujourd\'hui ?',
                    tr: 'Bugünkü Ay Verileri Nasıl Okunur?',
                    ur: 'آج کے چاند کا ڈیٹا کیسے پڑھیں؟',
                    de: 'Wie liest man die heutigen Monddaten?',
                    id: 'Bagaimana Membaca Data Bulan Hari Ini?',
                    es: '¿Cómo leer los datos de la Luna hoy?',
                    bn: 'আজকের চাঁদের ডেটা কীভাবে পড়বেন?',
                    ms: 'Bagaimana Membaca Data Bulan Hari Ini?',
                };
            const _depthP1 = {
                    ar: 'تجمع صفحة حالة القمر اليوم بين عدة مؤشرات فلكية تساعد المستخدم على فهم شكل القمر الحالي بطريقة مبسطة. سطوع القمر يوضّح مقدار الجزء المضيء من قرص القمر كما يظهر من الأرض، بينما يوضح عمر القمر عدد الأيام التي مرّت منذ آخر محاق. وكلما تقدّم العمر القمري اقترب القمر من أطواره التالية، مثل التربيع الأول ثم الأحدب المتزايد، ثم يكتمل بدراً، وبعده يبدأ التناقص تدريجياً حتى مرحلة المحاق من جديد.',
                    en: 'The today\'s moon page combines several astronomical indicators that help the user understand the current moon shape in a simple way. The moon\'s brightness shows the proportion of the lit portion of the moon disc as seen from Earth, while moon age indicates the number of days that have passed since the last new moon. As the lunar age progresses, the moon approaches its next phases, such as the first quarter and waxing gibbous, ending with the full moon, after which it gradually wanes until reaching the new moon stage again.',
                    fr: 'La page de l\'état de la Lune aujourd\'hui combine plusieurs indicateurs astronomiques qui aident l\'utilisateur à comprendre la forme actuelle de la Lune de façon simple. Le brillance de la Lune indique la proportion de la partie éclairée du disque lunaire telle qu\'elle est vue depuis la Terre, tandis que l\'âge de la Lune indique le nombre de jours écoulés depuis la dernière nouvelle lune. À mesure que l\'âge lunaire progresse, la Lune se rapproche de ses phases suivantes, comme le premier quartier puis la Lune gibbeuse croissante, jusqu\'à la pleine lune, après quoi elle décroît progressivement vers le stade de la nouvelle lune.',
                    tr: 'Bugünkü ay sayfası, kullanıcının mevcut ay şeklini basit bir şekilde anlamasına yardımcı olan birkaç astronomik göstergeyi birleştirir. Ayın parlaklığı, Ay diskinin Dünya\'dan görüldüğü kadarıyla aydınlık kısmının oranını gösterirken, ay yaşı son yeni aydan bu yana geçen gün sayısını gösterir. Ay yaşı ilerledikçe Ay, ilk dördün, sonra büyüyen şişkin ay gibi sonraki evrelerine yaklaşır ve dolunaya ulaşır; ardından yavaş yavaş azalır ve yeni ay aşamasına döner.',
                    ur: 'آج کا چاند صفحہ کئی فلکی اشاروں کو یکجا کرتا ہے جو صارف کو آسان طریقے سے چاند کی موجودہ شکل سمجھنے میں مدد کرتے ہیں۔ چاند کی چمک چاند کی ڈسک کے روشن حصے کا تناسب ظاہر کرتی ہے جیسا کہ زمین سے دیکھا جاتا ہے، جبکہ چاند کی عمر آخری نئے چاند کے بعد سے گزرے ہوئے دنوں کی تعداد ظاہر کرتی ہے۔ جیسے جیسے قمری عمر بڑھتی ہے، چاند اپنے اگلے مراحل کے قریب آتا ہے، جیسے پہلی چوتھائی پھر بڑھتا ہوا گبس، بدر تک پہنچتا ہے، جس کے بعد وہ آہستہ آہستہ گھٹتا ہے اور دوبارہ نئے چاند کے مرحلے پر آتا ہے۔',
                    de: 'Die heutige Mondseite kombiniert mehrere astronomische Indikatoren, die dem Benutzer helfen, die aktuelle Mondform auf einfache Weise zu verstehen. Die Helligkeit des Mondes zeigt den Anteil des beleuchteten Teils der Mondscheibe, wie er von der Erde aus gesehen wird, während das Mondalter die Anzahl der Tage seit dem letzten Neumond angibt. Mit fortschreitendem Mondalter nähert sich der Mond seinen nächsten Phasen, wie dem ersten Viertel und dem zunehmenden Halbmond, bis hin zum Vollmond; danach nimmt er allmählich ab und kehrt zur Neumondphase zurück.',
                    id: 'Halaman Bulan hari ini menggabungkan beberapa indikator astronomi yang membantu pengguna memahami bentuk Bulan saat ini dengan cara sederhana. Kecerahan Bulan menunjukkan proporsi bagian yang terang dari piringan Bulan seperti yang terlihat dari Bumi, sementara usia Bulan menunjukkan jumlah hari yang telah berlalu sejak bulan baru terakhir. Seiring bertambahnya usia lunar, Bulan mendekati fase berikutnya, seperti kuartal pertama dan bulan cembung membesar, hingga menjadi bulan purnama, setelah itu secara bertahap berkurang hingga mencapai fase bulan baru.',
                    es: 'La página del estado de la Luna hoy combina varios indicadores astronómicos que ayudan al usuario a comprender la forma actual de la Luna de manera sencilla. El brillo de la Luna muestra la proporción de la parte iluminada del disco lunar tal como se ve desde la Tierra, mientras que la edad de la Luna indica el número de días que han pasado desde la última luna nueva. A medida que avanza la edad lunar, la Luna se acerca a sus siguientes fases, como el primer cuarto y la gibosa creciente, hasta llegar a la luna llena, tras la cual disminuye gradualmente hacia la fase de luna nueva.',
                    bn: 'আজকের চাঁদের পৃষ্ঠা বেশ কয়েকটি জ্যোতির্বিজ্ঞান নির্দেশক একত্রিত করে যা ব্যবহারকারীকে সহজভাবে চাঁদের বর্তমান আকৃতি বুঝতে সাহায্য করে। চাঁদের উজ্জ্বলতা পৃথিবী থেকে দেখা চাঁদের চাকতির আলোকিত অংশের অনুপাত দেখায়, যেখানে চাঁদের বয়স সর্বশেষ অমাবস্যা থেকে অতিবাহিত দিনের সংখ্যা নির্দেশ করে। চান্দ্র বয়স যত বাড়ে, চাঁদ তার পরবর্তী দশার দিকে এগিয়ে যায়, যেমন প্রথম পাদ এবং বাড়ন্ত গিবাস, পূর্ণিমা পর্যন্ত পৌঁছায়, এরপর ধীরে ধীরে কমতে থাকে এবং অমাবস্যার পর্যায়ে ফিরে আসে।',
                    ms: 'Halaman Bulan hari ini menggabungkan beberapa penunjuk astronomi yang membantu pengguna memahami bentuk Bulan semasa dengan cara mudah. Kecerahan Bulan menunjukkan kadar bahagian Bulan yang bercahaya seperti dilihat dari Bumi, manakala usia Bulan menunjukkan bilangan hari yang telah berlalu sejak anak bulan terakhir. Apabila usia bulan bertambah, Bulan menghampiri fasanya yang seterusnya, seperti suku pertama dan bulan cembung membesar, sehingga menjadi bulan purnama, selepas itu ia berkurang secara beransur-ansur menuju fasa anak bulan.',
                };
            const _depthP2 = {
                    ar: 'تساعد بيانات شروق القمر وغروبه على معرفة الوقت التقريبي الذي يظهر فيه القمر في السماء أو يغيب عن الأفق، وقد تختلف هذه الأوقات بحسب المدينة بسبب اختلاف الموقع الجغرافي وخط الطول والعرض. لذلك قد تعرض الصفحة بيانات افتراضية لمدينة محددة، مع إتاحة الانتقال نحو صفحات المدن لمتابعة حالة القمر بحسب موقع المستخدم. كما يرتبط تتبع القمر بالتقويم الهجري، لأن بداية الشهور الهجرية تعتمد على دورة القمر ورؤية الهلال، مما يجعل متابعة أطوار القمر مفيدة لمن يهتم بالتاريخ الهجري، ومواعيد البدر، وحركة القمر خلال الشهر.',
                    en: 'Moonrise and moonset data help identify the approximate time when the moon appears in the sky or sets below the horizon, and these times can differ across cities due to geographic location, longitude, and latitude. The page may therefore display default data for a specific city, with the option to navigate toward city pages and track the moon based on the user\'s location. Moon tracking is also tied to the Hijri calendar, since the start of Hijri months depends on the lunar cycle and crescent visibility, making it useful for those interested in the Hijri date, full moon timings, and the moon\'s motion through the month.',
                    fr: 'Les données de lever et de coucher de la Lune aident à connaître l\'heure approximative à laquelle la Lune apparaît dans le ciel ou disparaît sous l\'horizon, et ces horaires peuvent différer selon la ville en raison de la localisation géographique, de la longitude et de la latitude. La page peut donc afficher des données par défaut pour une ville spécifique, avec la possibilité d\'accéder vers les pages de villes pour suivre la Lune selon la position de l\'utilisateur. Le suivi de la Lune est également lié au calendrier hégirien, puisque le début des mois hégiriens dépend du cycle lunaire et de la visibilité du croissant, ce qui rend le suivi des phases utile à ceux qui s\'intéressent à la date hégirienne, aux horaires de pleine lune et au mouvement de la Lune au cours du mois.',
                    tr: 'Ay doğuşu ve batış verileri, Ayın gökyüzünde göründüğü veya ufkun altına battığı yaklaşık zamanı belirlemeye yardımcı olur ve bu zamanlar coğrafi konum, boylam ve enlem nedeniyle şehirden şehre farklılık gösterebilir. Sayfa bu nedenle belirli bir şehir için varsayılan veri gösterebilir; kullanıcının konumuna göre Ayı takip etmek üzere şehir sayfalarına geçiş imkânı vardır. Ay takibi ayrıca hicri takvim ile bağlantılıdır; çünkü hicri ayların başlangıcı ay döngüsüne ve hilalin görünürlüğüne bağlıdır, bu da hicri tarih, dolunay zamanları ve Ayın ay boyunca hareketi ile ilgilenenler için yararlı kılar.',
                    ur: 'چاند کے طلوع و غروب کا ڈیٹا چاند کے آسمان میں ظاہر ہونے یا افق کے نیچے غروب ہونے کے تقریبی وقت کا تعین کرنے میں مدد کرتا ہے، اور یہ اوقات جغرافیائی محل وقوع، طول البلد اور عرض البلد کی وجہ سے شہر کے مطابق مختلف ہو سکتے ہیں۔ لہذا صفحہ کسی مخصوص شہر کے لیے ڈیفالٹ ڈیٹا دکھا سکتا ہے، صارف کے مقام کے مطابق چاند کا پتہ لگانے کے لیے شہر کے صفحات کی طرف جانے کے اختیار کے ساتھ۔ چاند کی پیروی ہجری کیلنڈر سے بھی منسلک ہے، کیونکہ ہجری مہینوں کی شروعات قمری چکر اور ہلال کی رؤیت پر منحصر ہے، جو ہجری تاریخ، بدر کے اوقات، اور پورے مہینے میں چاند کی حرکت میں دلچسپی رکھنے والوں کے لیے مفید ہے۔',
                    de: 'Mondaufgangs- und Untergangsdaten helfen dabei, die ungefähre Zeit zu ermitteln, zu der der Mond am Himmel erscheint oder unter den Horizont sinkt, und diese Zeiten können je nach Stadt aufgrund der geografischen Lage, des Längen- und Breitengrades unterschiedlich sein. Die Seite kann daher Standarddaten für eine bestimmte Stadt anzeigen, mit der Möglichkeit, über Stadtseiten den Mond entsprechend dem Standort des Benutzers zu verfolgen. Die Mondverfolgung ist auch mit dem Hidschri-Kalender verbunden, da der Beginn der Hidschri-Monate vom Mondzyklus und der Sichtbarkeit der Sichel abhängt, was sie für diejenigen nützlich macht, die sich für das Hidschri-Datum, die Vollmondzeiten und die Bewegung des Mondes durch den Monat interessieren.',
                    id: 'Data terbit dan terbenam Bulan membantu mengidentifikasi waktu perkiraan ketika Bulan muncul di langit atau terbenam di bawah cakrawala, dan waktu-waktu ini dapat berbeda antar kota karena lokasi geografis, garis bujur, dan garis lintang. Halaman dapat oleh karena itu menampilkan data default untuk kota tertentu, dengan opsi untuk mengarahkan menuju halaman kota dalam melacak Bulan berdasarkan lokasi pengguna. Pelacakan Bulan juga terkait dengan kalender Hijriah, karena awal bulan Hijriah bergantung pada siklus bulan dan visibilitas hilal, yang membuatnya berguna bagi mereka yang tertarik pada tanggal Hijriah, waktu purnama, dan pergerakan Bulan sepanjang bulan.',
                    es: 'Los datos de salida y puesta de la Luna ayudan a identificar el tiempo aproximado en que la Luna aparece en el cielo o se pone bajo el horizonte, y estos tiempos pueden diferir según la ciudad debido a la ubicación geográfica, la longitud y la latitud. Por ello la página puede mostrar datos predeterminados para una ciudad específica, con la opción de dirigirse hacia las páginas de ciudades para seguir la Luna según la ubicación del usuario. El seguimiento de la Luna también está vinculado al calendario hijri, ya que el comienzo de los meses hijri depende del ciclo lunar y la visibilidad del creciente, lo que lo hace útil para quienes se interesan por la fecha hijri, los horarios de luna llena y el movimiento de la Luna a lo largo del mes.',
                    bn: 'চাঁদের উদয় ও অস্তের ডেটা চাঁদ আকাশে কখন আবির্ভূত হয় বা দিগন্তের নিচে অস্ত যায় তার আনুমানিক সময় চিহ্নিত করতে সাহায্য করে, এবং এই সময়গুলি ভৌগলিক অবস্থান, দ্রাঘিমাংশ এবং অক্ষাংশের কারণে শহর অনুযায়ী ভিন্ন হতে পারে। তাই পৃষ্ঠা একটি নির্দিষ্ট শহরের জন্য ডিফল্ট ডেটা প্রদর্শন করতে পারে, ব্যবহারকারীর অবস্থান অনুযায়ী চাঁদ ট্র্যাক করতে শহর পৃষ্ঠাগুলির দিকে নেভিগেট করার বিকল্প সহ। চাঁদ ট্র্যাকিং হিজরি ক্যালেন্ডারের সাথেও যুক্ত, কারণ হিজরি মাসের শুরু চান্দ্র চক্র এবং হিলালের দৃশ্যমানতার উপর নির্ভর করে, যা হিজরি তারিখ, পূর্ণিমার সময় এবং সারা মাস জুড়ে চাঁদের গতিতে আগ্রহী ব্যক্তিদের জন্য এটি দরকারী করে তোলে।',
                    ms: 'Data terbit dan terbenam Bulan membantu mengenal pasti masa anggaran apabila Bulan muncul di langit atau terbenam di bawah ufuk, dan masa-masa ini boleh berbeza mengikut bandar disebabkan lokasi geografi, garisan bujur, dan garisan lintang. Halaman ini oleh itu boleh memaparkan data lalai untuk bandar tertentu, dengan pilihan untuk mengarah menuju halaman bandar bagi memantau Bulan berdasarkan lokasi pengguna. Pemantauan Bulan juga dikaitkan dengan kalendar Hijrah, kerana permulaan bulan Hijrah bergantung pada kitaran bulan dan kelihatan hilal, yang menjadikannya berguna untuk mereka yang berminat dengan tarikh Hijrah, waktu purnama, dan pergerakan Bulan sepanjang bulan.',
                };
            const _depthP3 = {
                    ar: 'لا تهدف هذه البيانات إلى استبدال الرؤية الشرعية أو التقارير الفلكية الرسمية، لكنها تمنح المستخدم قراءة يومية سهلة لحالة القمر، وتساعده على مقارنة الطور الحالي مع الأيام السابقة والقادمة ضمن نفس الدورة القمرية.',
                    en: 'This data is not intended to replace religious sighting or official astronomical reports, but it offers the user an easy daily reading of the moon\'s state, and helps compare the current phase with previous and upcoming days within the same lunar cycle.',
                    fr: 'Ces données ne visent pas à remplacer l\'observation religieuse ou les rapports astronomiques officiels, mais elles offrent à l\'utilisateur une lecture quotidienne facile de l\'état de la Lune, et l\'aident à comparer la phase actuelle avec les jours précédents et à venir au sein du même cycle lunaire.',
                    tr: 'Bu veriler dini gözlemi veya resmi astronomik raporları değiştirmeyi amaçlamaz; ancak kullanıcıya Ay durumunun günlük kolay bir okumasını sunar ve mevcut evreyi aynı ay döngüsündeki önceki ve gelecek günlerle karşılaştırmaya yardımcı olur.',
                    ur: 'یہ ڈیٹا مذہبی رؤیت یا سرکاری فلکی رپورٹس کا متبادل نہیں ہے، لیکن یہ صارف کو چاند کی حالت کا روزانہ آسان مطالعہ پیش کرتا ہے، اور موجودہ مرحلے کا اسی قمری چکر کے پچھلے اور آنے والے دنوں سے موازنہ کرنے میں مدد کرتا ہے۔',
                    de: 'Diese Daten sollen die religiöse Sichtung oder offizielle astronomische Berichte nicht ersetzen, sondern bieten dem Benutzer eine einfache tägliche Lesung des Mondzustands und helfen, die aktuelle Phase mit vorherigen und kommenden Tagen innerhalb desselben Mondzyklus zu vergleichen.',
                    id: 'Data ini tidak dimaksudkan untuk menggantikan rukyat keagamaan atau laporan astronomi resmi, tetapi menawarkan kepada pengguna pembacaan harian yang mudah tentang keadaan Bulan, dan membantu membandingkan fase saat ini dengan hari-hari sebelumnya dan mendatang dalam siklus lunar yang sama.',
                    es: 'Estos datos no pretenden reemplazar la observación religiosa ni los informes astronómicos oficiales, pero ofrecen al usuario una lectura diaria fácil del estado de la Luna y ayudan a comparar la fase actual con los días anteriores y próximos dentro del mismo ciclo lunar.',
                    bn: 'এই ডেটা ধর্মীয় দর্শন বা আনুষ্ঠানিক জ্যোতির্বিজ্ঞান প্রতিবেদনের প্রতিস্থাপন করার উদ্দেশ্যে নয়, তবে ব্যবহারকারীকে চাঁদের অবস্থার সহজ দৈনিক পঠন প্রদান করে এবং একই চান্দ্র চক্রের পূর্ববর্তী ও আসন্ন দিনের সাথে বর্তমান দশা তুলনা করতে সাহায্য করে।',
                    ms: 'Data ini tidak bertujuan untuk menggantikan rukyah agama atau laporan astronomi rasmi, tetapi menawarkan kepada pengguna bacaan harian yang mudah tentang keadaan Bulan, dan membantu membandingkan fasa semasa dengan hari-hari sebelumnya dan akan datang dalam kitaran bulan yang sama.',
                };

            const _depthHtml = '<section class="section-card moon-seo-info moon-seo-depth">'
                + '<h2>' + _escHtml(_depthPick(_depthH2)) + '</h2>'
                + '<p>'  + _escHtml(_depthPick(_depthP1)) + '</p>'
                + '<p>'  + _escHtml(_depthPick(_depthP2)) + '</p>'
                + '<p>'  + _escHtml(_depthPick(_depthP3)) + '</p>'
                + '</section>';

            // Inject AFTER the moon-seo-phase section (E2-final Section 1).
            // The regex captures the whole section then appends our block.
            html = html.replace(
                /(<section class="section-card moon-seo-info moon-seo-phase">[\s\S]*?<\/section>)/,
                (m) => m + _depthHtml
            );
        } catch (_e) { /* silent — depth injection failed, page still serves */ }
    }
    // ── Phase E4-city (2026-05-02): strip leftover #page-prayer-times shell
    //    on ALL moon city pages so they don't flash prayer-times content
    //    before JS routes to #page-moon. Was Lighthouse's 0.939 CLS culprit.
    //    Lightweight strip — does NOT remove moon sections (those are needed
    //    on city pages, populated by the existing seo.moonCity SSR block).
    if (_isMoonCityPageSsr) {
        html = _stripPagePrayerTimesOnly(html);
    }
    // ── Phase E4-city-b (2026-05-02): SSR active-class for #page-moon
    //    on ALL moon pages (Hub + city + month + date). Eliminates the
    //    residual 0.171 CLS on div#page-moon.page.active which Lighthouse
    //    kept flagging after E4-city. Root cause: SSR shipped #page-moon
    //    without `active`, JS added it post-paint → CSS cascade applied
    //    `.page.active { padding: 24px ... }` causing a tiny but measurable
    //    layout shift even after E4-b parity rules. Pre-injecting `active`
    //    in SSR makes the cascade fire from first paint — no class mutation
    //    to observe, no shift to record. Single string replace, idempotent
    //    (no-op if the active class is already present, e.g., on re-renders
    //    or if a future change ships the active class statically).
    if (_isMoonTodayHub || _isMoonCityPageSsr) {
        html = html.replace(
            '<div class="page" id="page-moon">',
            '<div class="page active" id="page-moon">'
        );
    }
    // ── Phase E4-final-B (2026-05-02): pre-fill the Hijri-date placeholders
    //    inside #moon-city-answer using seo.moonCity data already computed
    //    above (no extra astronomy work). Eliminates the text reflow when JS
    //    later replaces "—" with the long Hijri/Gregorian label (e.g.,
    //    "15 ذو القعدة 1447 هـ" — 19 chars vs the 1-char placeholder, which
    //    on mobile would wrap to a new line and grow the parent height).
    //    Touches text content of EXISTING spans only — no structure added.
    //    JS continues to set the same textContent on hydration → identical
    //    value → no layout shift. Silent try/catch fallback keeps page
    //    serving even if the regex anchors ever drift.
    if (_isMoonCityPageSsr && seo.moonCity) {
        try {
            const _hijriSfx = seo.moonCity.hijriLabelWithSfx || seo.moonCity.hijriLabel || '';
            const _gregLbl  = seo.moonCity.dateLabel || '';
            if (_hijriSfx) {
                html = html.replace(
                    /<div class="moon-hijri-date" id="moon-hijri-date">[^<]*<\/div>/,
                    `<div class="moon-hijri-date" id="moon-hijri-date">${_escHtml(_hijriSfx)}</div>`
                );
            }
            if (_gregLbl) {
                html = html.replace(
                    /<div class="moon-hijri-greg" id="moon-hijri-greg">[^<]*<\/div>/,
                    `<div class="moon-hijri-greg" id="moon-hijri-greg">${_escHtml(_gregLbl)}</div>`
                );
            }
        } catch (_e) { /* silent — Hijri date SSR fill optional; JS will still populate */ }
    }
    if (_isCityPageSsr) {
        html = _stripHtmlForCity(html);
        // Phase I — حقن روابط داخليّة canonical في #related-links-section
        // (كانت href="#" placeholder تُحقَن client-side فقط → غير مرئيّة لـ Googlebot)
        const _slugMatch = urlPath.match(/^\/(?:[a-z]{2}\/)?prayer-times-in-([a-z][a-z0-9.-]+)$/);
        if (_slugMatch) {
            const _slug = _slugMatch[1];
            const _lp = (seo.lang === 'ar') ? '' : `/${seo.lang}`;
            // UAT-2.6: compute today's hijri date for the canonical /hijri-date/{YYYY-MM-DD} URL
            const _hToday = _hijriNow();
            const _hPad = n => String(n).padStart(2, '0');
            const _hijriDated = `/hijri-date/${_hToday.year}-${_hPad(_hToday.month)}-${_hPad(_hToday.day)}`;
            // UAT-Q5d: always emit canonical clean URLs (no coord-suffix).
            // The destination qibla/moon page resolves coords via:
            //   1. SSR __QIBLA_CITY__ / __MOON_CITY__ when slug is in DB,
            //   2. sessionStorage('city_${slug}') seeded by the page that
            //      built this href (updateRelatedLinks/updateMiniIslamicTools),
            //   3. client-side slug→Nominatim geocode fallback for cold visits.
            const _qHref = `${_lp}/qibla-in-${_slug}`;
            const _mHref = `${_lp}/moon-today-in-${_slug}`;
            html = html
                .replace('id="rl-qibla" href="#"',      `id="rl-qibla" href="${_qHref}"`)
                .replace('id="rl-moon" href="#"',       `id="rl-moon" href="${_mHref}"`)
                .replace('id="rl-time-left" href="#"',  `id="rl-time-left" href="${_lp}/time-left-until-prayer-in-${_slug}"`)
                .replace('id="rl-next-prayer" href="#"',`id="rl-next-prayer" href="${_lp}/next-prayer-time-in-${_slug}"`)
                // UAT-2.6: compact tools strip after #prayer-cards (mit-* — qibla/moon/hijri-today)
                .replace('id="mit-qibla" href="#"',     `id="mit-qibla" href="${_qHref}"`)
                .replace('id="mit-moon" href="#"',      `id="mit-moon" href="${_mHref}"`)
                .replace('id="mit-hijri" href="#"',     `id="mit-hijri" href="${_lp}${_hijriDated}"`);
        }
    }
    // 1e) 🆕 Round 7 (Homepage Audit): homepage (distribution hub) → strip same dead-weight.
    //     الرئيسية كانت تحمل #tl-hero + #tl-sticky + #npt-hero + #tl-h1 + #npt-h1 مخفيّة بـ CSS.
    //     نفس الفكرة: تنظيف DOM + حل مشكلة H1 junk placeholders (tl-h1 "كم باقي على صلاة —").
    //     الرئيسية = `/` أو `/{lang}/` (لا URL بعد البادئة).
    const _isHomepageSsr = !!(seo && !seo.timeLeftPage && !seo.nextPrayerPage
        && /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/?)?$/.test(urlPath));
    if (_isHomepageSsr) {
        html = _stripHtmlForCity(html);  // نفس مجموعة الشطب (tl-hero/tl-sticky/npt-hero)
    }
    // 1f) Phase I — تحويل H1 غير النشط إلى H2 (يحوّل SPA shell إلى صفحة بـ H1 وحيد)
    html = _downgradeInactiveH1s(html, urlPath);
    // 2) base href لحل المسارات النسبية تحت /en/... أو /hijri-calendar/...
    if (!html.includes('<base ')) {
        html = html.replace('<head>', '<head>\n    <base href="/">');
    }
    // 3) استبدال <title> و <meta name="description"> الموجودين
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${_escHtml(seo.title)}</title>`);
    html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
                        `<meta name="description" content="${_escHtml(seo.description)}">`);
    // 4) حقن كتلة SEO قبل </head>
    const seoBlock = renderSeoHeadHtml(seo);
    html = html.replace('</head>', `${seoBlock}\n</head>`);

    // 4.45) Phase E5-a2 (2026-05-03): inject Critical CSS Hybrid.
    //   Inline ~15 KiB of critical CSS (extracted by scripts/_phase_e5_a2_critical_css.mjs)
    //   IMMEDIATELY before the external style.css link. This lets the browser
    //   paint above-the-fold content from the inline critical block without
    //   waiting for the full style.css download. The external link still loads
    //   in parallel and supplies all non-critical (below-the-fold) styling.
    //
    //   Pattern (in <head>):
    //     <style id="critical-css">/* ~15 KiB */</style>
    //     <link rel="stylesheet" href="css/style.css?v=244">
    //
    //   To regenerate critical.css after editing style.css, run:
    //     node scripts/_phase_e5_a2_critical_css.mjs
    if (_criticalCssText) {
        html = html.replace(
            /(<link\s+rel="stylesheet"\s+href="css\/style\.css\?v=\d+"\s*\/?>)/i,
            `<style id="critical-css">${_criticalCssText}</style>$1`
        );
    }

    // 4.5) Phase E5-a (2026-05-02): CSS Externalization — DISABLED inlining.
    //   The previous strategy inlined the entire 280 KiB minified style.css
    //   into a <style> block to remove the render-blocking external request.
    //   That worked when the CSS was small, but the file grew to 280 KiB
    //   (after E2/E3/E4 phases), and inlining it pushed the LCP element
    //   (#moon-intro at byte ~351K) far enough into the HTML stream that
    //   Lighthouse Mobile reported LCP 5.3s + Speed Index 19.4s.
    //
    //   E5-a fix: stop inlining. Let the browser load css/style.css as a
    //   normal cached external stylesheet. The version query (?v=N) plus the
    //   `isVersioned` Cache-Control rule below (line ~11732) gives it
    //   `public, max-age=31536000, immutable` — first visit pays one extra
    //   request, repeat visits cost 0. HTML drops from 515 KiB → ~235 KiB
    //   and #moon-intro arrives at byte ~71K instead of ~351K.
    //
    //   To re-enable inlining (e.g., if CSS shrinks back below ~30 KiB),
    //   uncomment the block below. Variable `_inlineCssText` is still
    //   populated by _preloadStatic() so the inline path remains available.
    // if (_inlineCssText) {
    //     html = html.replace(
    //         /<link\s+rel="stylesheet"\s+href="css\/style\.css\?v=\d+"\s*\/?>/i,
    //         `<style>${_inlineCssText}</style>`
    //     );
    // }

    // 4.55) Phase E6-a (2026-05-03): replace monolithic <script defer src="js/i18n.js">
    //   with per-language bundles. Detection from URL prefix (server already
    //   processed urlPath above). Loads i18n-core.js + the user's lang. For
    //   non-AR/EN langs, also loads en.js as fallback (so missing keys still
    //   resolve via the existing t() fallback chain).
    //
    //   Pattern (in <head>, replacing the single old line):
    //     <script defer src="js/i18n-core.js?v=N"></script>
    //     <script defer src="js/i18n/{lang}.js?v=N"></script>
    //     <script defer src="js/i18n/en.js?v=N"></script>  ← only if lang ≠ ar AND ≠ en
    //
    //   AR pages skip the EN fallback because AR has the most complete dict
    //   and is the default (acceptable to show key if missing). EN is its own
    //   fallback root so it doesn't need a second copy.
    {
        const _i18nLangMatch = urlPath.match(/^\/(en|fr|tr|ur|de|id|es|bn|ms)\//);
        const _i18nLang = _i18nLangMatch ? _i18nLangMatch[1] : 'ar';
        const _needsEnFallback = (_i18nLang !== 'ar' && _i18nLang !== 'en');
        const _i18nVersion = '169'; // matches the version in index.html for cache invalidation
        let _i18nReplacement = `<script defer src="js/i18n-core.js?v=${_i18nVersion}"></script>` +
                               `\n    <script defer src="js/i18n/${_i18nLang}.js?v=${_i18nVersion}"></script>`;
        if (_needsEnFallback) {
            _i18nReplacement += `\n    <script defer src="js/i18n/en.js?v=${_i18nVersion}"></script>`;
        }
        html = html.replace(
            /<script\s+defer\s+src="js\/i18n\.js\?v=\d+"\s*><\/script>/,
            _i18nReplacement
        );
    }

    // 4.6) 🆕 Round 2.1 (H): حقن build hash على asset URLs للـJS (style.css مُضمَّن)
    //      النمط: app.js?v=330 → app.js?v=330&b=6900d60
    //      فائدة: كسر الـcache عند أيّ deploy حتّى لو نسي المطوّر bump يدويّاً
    if (BUILD_HASH && BUILD_HASH !== 'dev') {
        html = html.replace(/(\b(?:app|i18n)\.js\?v=\d+)(?=["'\s])/g, `$1&b=${BUILD_HASH}`);
    }

    // 5) SSR نص #seo-line-1 و #seo-line-2 لصفحات المدن (LCP fix: -3.5s render delay)
    //    JS يستبدلها لاحقاً بالأوقات الفعلية. هذا placeholder ثابت يُقدَّم في HTML الأولي.
    const _urlPathNoLang = urlPath.replace(/^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\//, '/').replace(/\.html$/, '');
    // 🆕 Polish Round (F): صفحة time-left تُشارك SSR city-page logic (city-summary، breadcrumb، FAQ…).
    //    نطابقها كـ "city-like" عبر cityMatchSsr، ثمّ نفرض overrides على H1/hero وclass='time-left-page'.
    const _timeLeftMatchSsr = _urlPathNoLang.match(/^\/time-left-until-prayer-in-([a-z][a-z0-9-]+)$/);
    const _isTimeLeftSsr = !!(_timeLeftMatchSsr && seo && seo.timeLeftPage);
    // 🆕 Round 4 (Minimal): صفحة NPT تُشارك نفس SSR city-page logic — H1 مخصّص + hide غيره عبر CSS
    const _nptMatchSsr = _urlPathNoLang.match(/^\/next-prayer-time-in-([a-z][a-z0-9-]+)$/);
    const _isNptSsr = !!(_nptMatchSsr && seo && seo.nextPrayerPage);
    let cityMatchSsr = _urlPathNoLang.match(/^\/prayer-times-in-([a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/);
    if (!cityMatchSsr && _isTimeLeftSsr) {
        // نصنع match-like array بنفس الشكل: [full, slug] حتّى يعمل cityMatchSsr[1] في بقيّة الكود
        cityMatchSsr = [_urlPathNoLang, _timeLeftMatchSsr[1]];
    }
    if (!cityMatchSsr && _isNptSsr) {
        cityMatchSsr = [_urlPathNoLang, _nptMatchSsr[1]];
    }

    // 5a) SSR لـ H1 — الـ crawler يرى H1 دلالياً قبل تنفيذ JS (يحلّ H1='--' placeholder)
    {
        const Lh = seo.lang;
        let _h1Text;
        if (seo.countryListing) {
            // صفحة قائمة مدن دولة: H1 خاصّ بالدولة (يستبدل city/home H1 لجميع اللغات)
            const cn = seo.countryListing.name;
            _h1Text = {
                ar: `مواقيت الصلاة في مدن ${cn}`,
                en: `Prayer Times in Cities of ${cn}`,
                fr: `Heures de prière dans les villes de ${cn}`,
                tr: `${cn} Şehirlerinde Namaz Vakitleri`,
                ur: `${cn} کے شہروں میں اوقاتِ نماز`,
                de: `Gebetszeiten in den Städten von ${cn}`,
                id: `Jadwal Sholat di Kota-Kota ${cn}`,
                es: `Horarios de Oración en Ciudades de ${cn}`,
                bn: `${cn}-এর শহরগুলোতে নামাজের সময়`,
                ms: `Waktu Solat di Bandar-Bandar ${cn}`,
            }[Lh] || `Prayer Times in Cities of ${cn}`;
        } else if (cityMatchSsr) {
            // 🔧 Phase 2 (هـ) — استخدام الاسم المحلّي بدل slug title case
            const _slug = cityMatchSsr[1];
            const cityDisplay = (typeof _resolveCityName === 'function')
                ? (_resolveCityName(_slug, Lh) || _slugToTitle(_slug))
                : _slugToTitle(_slug);
            if (_isTimeLeftSsr) {
                // 🆕 Polish Round (F): page-h1 مخفيّ على time-left-page (CSS)، لذا نتركه فارغاً
                //     H1 الفعليّ يأتي من tl-h1 داخل tl-hero (مكتوب في HTML مع data-i18n)
                //     نستخدم نفس نصّ SEO في page-h1 (crawler يراه لكن hidden عن المستخدم عبر display:none)
                //     ⚠️ لا نستخدم نصّاً مختلفاً لتجنّب ازدواج H1 لـGoogle — فقط نصّ واحد متطابق مع tl-h1
                _h1Text = {
                    ar: `كم باقي على الصلاة القادمة في ${cityDisplay}؟`,
                    en: `Time Left Until Next Prayer in ${cityDisplay}`,
                    fr: `Temps restant avant la prochaine prière à ${cityDisplay}`,
                    tr: `${cityDisplay} için bir sonraki namaza kalan süre`,
                    ur: `${cityDisplay} میں اگلی نماز تک کتنا وقت باقی ہے؟`,
                    de: `Verbleibende Zeit bis zum nächsten Gebet in ${cityDisplay}`,
                    id: `Waktu Tersisa Menjelang Sholat di ${cityDisplay}`,
                    es: `Tiempo restante para la próxima oración en ${cityDisplay}`,
                    bn: `${cityDisplay}-এ পরবর্তী নামাজ পর্যন্ত কত সময় বাকি?`,
                    ms: `Masa Tinggal Sebelum Solat Seterusnya di ${cityDisplay}`,
                }[Lh] || `Time left until next prayer in ${cityDisplay}`;
            } else if (_isNptSsr) {
                // 🆕 Round 4 (Minimal): H1 لـnpt-page — يطابق npt-h1 (Schedule Awareness)
                //     R-3: "اليوم" مُضافة في كلّ لغة لتعزيز temporal context + keyword match
                _h1Text = {
                    ar: `الصلاة القادمة في ${cityDisplay} اليوم`,
                    en: `Next Prayer in ${cityDisplay} Today`,
                    fr: `Prochaine prière à ${cityDisplay} aujourd'hui`,
                    tr: `${cityDisplay} — bugün bir sonraki namaz`,
                    ur: `آج ${cityDisplay} میں اگلی نماز`,
                    de: `Nächstes Gebet in ${cityDisplay} heute`,
                    id: `Sholat berikutnya di ${cityDisplay} hari ini`,
                    es: `Próxima oración en ${cityDisplay} hoy`,
                    bn: `আজ ${cityDisplay}-এ পরবর্তী নামাজ`,
                    ms: `Solat seterusnya di ${cityDisplay} hari ini`,
                }[Lh] || `Next prayer in ${cityDisplay} today`;
            } else {
                _h1Text = {
                    ar: `مواقيت الصلاة في ${cityDisplay} اليوم`,
                    en: `Prayer Times in ${cityDisplay} Today`,
                    fr: `Heures de prière à ${cityDisplay} aujourd'hui`,
                    tr: `${cityDisplay} için bugünkü namaz vakitleri`,
                    ur: `آج ${cityDisplay} میں اوقاتِ نماز`,
                    de: `Gebetszeiten in ${cityDisplay} heute`,
                    id: `Jadwal Sholat di ${cityDisplay} Hari Ini`,
                    es: `Horarios de Oración en ${cityDisplay} Hoy`,
                    bn: `আজ ${cityDisplay}-এ নামাজের সময়`,
                    ms: `Waktu Solat di ${cityDisplay} Hari Ini`,
                }[Lh] || `Prayer times in ${cityDisplay}`;
            }
        } else {
            // Homepage H1 — يحوي keyword "اليوم" (Keyword Consistency Round 7e)
            _h1Text = {
                ar: 'مواقيت الصلاة اليوم والتاريخ الهجري',
                en: "Today's Prayer Times and Hijri Calendar",
                fr: "Heures de prière aujourd'hui et calendrier Hégirien",
                tr: 'Bugünkü Namaz Vakitleri ve Hicri Takvim',
                ur: 'آج اوقاتِ نماز اور ہجری کیلنڈر',
                de: 'Heutige Gebetszeiten und Hidschri-Kalender',
                id: 'Jadwal Sholat Hari Ini dan Kalender Hijriyah',
                es: 'Horarios de Oración Hoy y Calendario Hijri',
                bn: 'আজকের নামাজের সময় ও হিজরি ক্যালেন্ডার',
                ms: 'Waktu Solat Hari Ini dan Kalendar Hijrah',
            }[Lh] || "Today's Prayer Times and Hijri Calendar";
        }
        html = html.replace(
            /<h1 class="page-h1" id="page-h1">[^<]*<\/h1>/,
            `<h1 class="page-h1" id="page-h1">${_escHtml(_h1Text)}</h1>`
        );
    }

    if (seo.countryListing) {
        // ── صفحة قائمة مدن دولة ── (6 لغات) — تمنع city-style SSR على URLs مثل /prayer-times-in-germany
        const cn = seo.countryListing.name;
        const L = seo.lang;
        // SSR للعنوان الرئيسي لـ prayer-times-cities.html (id="page-title" — مكتوب بالعربية في القالب)
        const _countryH1 = {
            ar: `مواقيت الصلاة في مدن ${cn}`,
            en: `Prayer Times in Cities of ${cn}`,
            fr: `Heures de prière dans les villes de ${cn}`,
            tr: `${cn} Şehirlerinde Namaz Vakitleri`,
            ur: `${cn} کے شہروں میں اوقاتِ نماز`,
            de: `Gebetszeiten in den Städten von ${cn}`,
            id: `Jadwal Sholat di Kota-Kota ${cn}`,
            es: `Horarios de Oración en Ciudades de ${cn}`,
            bn: `${cn}-এর শহরগুলোতে নামাজের সময়`,
            ms: `Waktu Solat di Bandar-Bandar ${cn}`,
        }[L] || `Prayer Times in Cities of ${cn}`;
        html = html.replace(
            /<h1([^>]*)id="page-title"([^>]*)>[^<]*<\/h1>/,
            `<h1$1id="page-title"$2>${_escHtml(_countryH1)}</h1>`
        );
        // SSR لـ breadcrumb الأخير (id="cbc-country") — اسم الدولة المترجَم بدل "--"
        html = html.replace(
            '<li class="bc-item bc-current" id="cbc-country" aria-current="page">--</li>',
            `<li class="bc-item bc-current" id="cbc-country" aria-current="page">${_escHtml(cn)}</li>`
        );
        const line1 = {
            ar: `مواقيت الصلاة في مدن ${cn} — تصفّح الجدول اليومي.`,
            en: `Prayer times across cities of ${cn} — browse today's schedule.`,
            fr: `Heures de prière dans les villes de ${cn} — consultez le programme du jour.`,
            tr: `${cn} şehirlerinde namaz vakitleri — bugünkü programa göz atın.`,
            ur: `${cn} کے شہروں میں اوقاتِ نماز — آج کا جدول دیکھیں۔`,
            de: `Gebetszeiten in den Städten von ${cn} — heute den Plan durchsuchen.`,
            id: `Jadwal sholat di kota-kota ${cn} — lihat jadwal hari ini.`,
            es: `Horarios de oración en las ciudades de ${cn} — consulte el horario de hoy.`,
            bn: `${cn}-এর শহরগুলোতে নামাজের সময় — আজকের সময়সূচী দেখুন।`,
            ms: `Waktu solat di bandar-bandar ${cn} — lihat jadual hari ini.`,
        }[L] || `Prayer times across cities of ${cn}.`;
        const line2 = {
            ar: `اختر مدينتك في ${cn} لعرض مواقيت الصلاة اليوم: الفجر، الظهر، العصر، المغرب، العشاء.`,
            en: `Pick your city in ${cn} to view today's prayer times: Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            fr: `Choisissez votre ville en ${cn} pour voir les heures de prière du jour : Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            tr: `${cn} içinde şehrinizi seçerek bugünkü namaz vakitlerini görüntüleyin: Fecir, Öğle, İkindi, Akşam, Yatsı.`,
            ur: `${cn} میں اپنا شہر منتخب کریں تاکہ آج کے اوقاتِ نماز دیکھیں: فجر، ظہر، عصر، مغرب، عشاء۔`,
            de: `Wählen Sie Ihre Stadt in ${cn} aus, um die heutigen Gebetszeiten anzuzeigen: Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            id: `Pilih kota Anda di ${cn} untuk melihat jadwal sholat hari ini: Subuh, Zuhur, Asar, Magrib, Isya.`,
            es: `Elija su ciudad en ${cn} para ver los horarios de oración de hoy: Fayr, Dhuhr, Asr, Magrib, Isha.`,
            bn: `${cn}-এ আপনার শহর নির্বাচন করুন আজকের নামাজের সময় দেখতে: ফজর, জোহর, আসর, মাগরিব, এশা।`,
            ms: `Pilih bandar anda di ${cn} untuk melihat waktu solat hari ini: Subuh, Zohor, Asar, Maghrib, Isyak.`,
        }[L] || `Pick your city in ${cn}.`;
        html = html.replace(
            '<p class="seo-line" id="seo-line-1"></p>',
            `<p class="seo-line" id="seo-line-1">${_escHtml(line1)}</p>`
        );
        html = html.replace(
            '<p class="seo-line" id="seo-line-2"></p>',
            `<p class="seo-line" id="seo-line-2">${_escHtml(line2)}</p>`
        );
        // banner-city-name → اسم الدولة المترجَم (مثلاً "Deutschland" بدل "--")
        html = html.replace(
            '<span id="banner-city-name">--</span>',
            `<span id="banner-city-name">${_escHtml(cn)}</span>`
        );
        // breadcrumb الأخير → اسم الدولة فقط (ليس "مواقيت الصلاة في ...")
        // Phase 2: المتن الجديد يحوي itemprop="name" أوّلاً لـSchema.org
        html = html.replace(
            '<span itemprop="name" id="bc-city" aria-current="page">--</span>',
            `<span itemprop="name" id="bc-city" aria-current="page">${_escHtml(cn)}</span>`
        );
        // Phase 2: ملء bc-country-name المتوسط بـ (فارغ في هذا المسار — دولة صفحة)
        // نُضمِّن نفس القيمة في bc-country-name لتفادي "--"
        html = html.replace(
            '<span itemprop="name" id="bc-country-name">--</span>',
            `<span itemprop="name" id="bc-country-name">${_escHtml(cn)}</span>`
        );
        try {
            const localeMap = { ar: 'ar', en: 'en-US', fr: 'fr-FR', tr: 'tr-TR', ur: 'ur-PK', de: 'de-DE', id: 'id-ID', es: 'es-ES', bn: 'bn-BD', ms: 'ms-MY' };
            const gregDate = new Date().toLocaleDateString(
                localeMap[L] || 'en-US',
                { day: 'numeric', month: 'long', year: 'numeric' }
            );
            html = html.replace(
                '<div class="banner-date-greg" id="banner-greg-date">--</div>',
                `<div class="banner-date-greg" id="banner-greg-date">${_escHtml(gregDate)}</div>`
            );
        } catch(e) { /* noop */ }
    } else if (cityMatchSsr) {
        const cityDisplay = _slugToTitle(cityMatchSsr[1]);
        const L = seo.lang;
        // 🔧 Phase 2 fix: استخدام الاسم الـlocalized (العربيّ/الإنجليزيّ/الخ) بدل slug title case
        //              مثال: "Riyadh" (L=ar) → "الرياض"،  "Mecca" → "مكّة المكرمة"
        const cityDisplayLoc = (typeof _resolveCityName === 'function')
            ? (_resolveCityName(cityMatchSsr[1], L) || cityDisplay)
            : cityDisplay;
        // cc → IANA timezone map (أساسيّ لـCity Summary — لا يعود "UTC" لمدن نعرف منطقتها)
        const _CC_TZ_MAP = {
            sa:'Asia/Riyadh', eg:'Africa/Cairo', ae:'Asia/Dubai', qa:'Asia/Qatar', bh:'Asia/Bahrain',
            om:'Asia/Muscat', kw:'Asia/Kuwait', jo:'Asia/Amman', lb:'Asia/Beirut', ps:'Asia/Hebron',
            sy:'Asia/Damascus', iq:'Asia/Baghdad', ye:'Asia/Aden', tr:'Europe/Istanbul',
            ir:'Asia/Tehran', pk:'Asia/Karachi', in:'Asia/Kolkata', bd:'Asia/Dhaka',
            id:'Asia/Jakarta', my:'Asia/Kuala_Lumpur', sg:'Asia/Singapore', bn:'Asia/Brunei',
            ma:'Africa/Casablanca', dz:'Africa/Algiers', tn:'Africa/Tunis', ly:'Africa/Tripoli',
            sd:'Africa/Khartoum', so:'Africa/Mogadishu', ng:'Africa/Lagos', et:'Africa/Addis_Ababa',
            ke:'Africa/Nairobi', sn:'Africa/Dakar', gb:'Europe/London', fr:'Europe/Paris',
            de:'Europe/Berlin', es:'Europe/Madrid', it:'Europe/Rome', nl:'Europe/Amsterdam',
            be:'Europe/Brussels', ch:'Europe/Zurich', at:'Europe/Vienna', gr:'Europe/Athens',
            ru:'Europe/Moscow', ua:'Europe/Kyiv', us:'America/New_York', ca:'America/Toronto',
            mx:'America/Mexico_City', br:'America/Sao_Paulo', ar:'America/Argentina/Buenos_Aires',
            au:'Australia/Sydney', jp:'Asia/Tokyo', cn:'Asia/Shanghai', hk:'Asia/Hong_Kong',
            kr:'Asia/Seoul', th:'Asia/Bangkok', ph:'Asia/Manila', vn:'Asia/Ho_Chi_Minh',
            af:'Asia/Kabul', az:'Asia/Baku', kz:'Asia/Almaty', uz:'Asia/Tashkent'
        };
        // cc → calc method (لمدن الدول المعروفة نعرض الطريقة المحلّيّة)
        const _CC_METHOD_MAP = {
            sa:'Makkah', eg:'Egyptian', tr:'Diyanet', ir:'Tehran', pk:'Karachi',
            my:'JAKIM', id:'Kemenag', ru:'Russia', kw:'Kuwait', qa:'Qatar',
            ae:'Dubai', sg:'Singapore', fr:'UOIF', gb:'ISNA', us:'ISNA', ca:'ISNA'
        };
        const line1 = {
            ar: `مواقيت الصلاة في ${cityDisplay} — الجدول اليومي.`,
            en: `Prayer times in ${cityDisplay} — today's schedule.`,
            fr: `Heures de prière à ${cityDisplay} — horaire du jour.`,
            tr: `${cityDisplay} için namaz vakitleri — bugünkü program.`,
            ur: `${cityDisplay} میں اوقاتِ نماز — آج کا جدول۔`,
            de: `Gebetszeiten in ${cityDisplay} — der heutige Plan.`,
            id: `Jadwal sholat di ${cityDisplay} — jadwal hari ini.`,
        }[L] || `Prayer times in ${cityDisplay}.`;
        const line2 = {
            ar: `أوقات الصلاة اليوم في ${cityDisplay}: الفجر، الظهر، العصر، المغرب، العشاء.`,
            en: `Today's prayer times in ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            fr: `Heures de prière aujourd'hui à ${cityDisplay} : Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            tr: `Bugün ${cityDisplay} için namaz vakitleri: Fecir, Öğle, İkindi, Akşam, Yatsı.`,
            ur: `آج ${cityDisplay} میں اوقاتِ نماز: فجر، ظہر، عصر، مغرب، عشاء۔`,
            de: `Heutige Gebetszeiten in ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            id: `Jadwal sholat hari ini di ${cityDisplay}: Subuh, Zuhur, Asar, Magrib, Isya.`,
        }[L] || `Today's prayer times in ${cityDisplay}.`;
        html = html.replace(
            '<p class="seo-line" id="seo-line-1"></p>',
            `<p class="seo-line" id="seo-line-1">${_escHtml(line1)}</p>`
        );
        html = html.replace(
            '<p class="seo-line" id="seo-line-2"></p>',
            `<p class="seo-line" id="seo-line-2">${_escHtml(line2)}</p>`
        );

        // SSR نصوص البانر المعروفة → يُزيل CLS الناتج عن استبدال "--" بالنصوص client-side.
        // JS يُحدِّث التاريخ الميلادي لاحقاً حسب timezone المدينة.
        html = html.replace(
            '<span id="banner-city-name">--</span>',
            `<span id="banner-city-name">${_escHtml(cityDisplay)}</span>`
        );
        // SSR للـ breadcrumb الأخير المدمج "مواقيت الصلاة في {city}" (3-item hierarchy)
        // Phase 2: المتن الجديد يحوي itemprop="name" لـSchema.org microdata
        // 🔧 استخدام cityDisplayLoc (اسم localized) بدل cityDisplay (slug title) — "الرياض" بدل "Riyadh"
        const _ssrFinal = ({
            ar: `مواقيت الصلاة في ${cityDisplayLoc}`,
            en: `Prayer Times in ${cityDisplayLoc}`,
            fr: `Heures de prière à ${cityDisplayLoc}`,
            tr: `${cityDisplayLoc} Namaz Vakitleri`,
            ur: `${cityDisplayLoc} میں اوقاتِ نماز`,
            de: `Gebetszeiten in ${cityDisplayLoc}`,
            id: `Jadwal Sholat di ${cityDisplayLoc}`,
            es: `Horarios de Oración en ${cityDisplayLoc}`,
            bn: `${cityDisplayLoc}-এ নামাজের সময়`,
            ms: `Waktu Solat di ${cityDisplayLoc}`,
        })[L] || `Prayer Times in ${cityDisplayLoc}`;
        html = html.replace(
            '<span itemprop="name" id="bc-city" aria-current="page">--</span>',
            `<span itemprop="name" id="bc-city" aria-current="page">${_escHtml(_ssrFinal)}</span>`
        );
        // Phase 2: ملء bc-country-name (المستوى الأوسط) لـbreadcrumb 3-levels
        // نحتاج الدولة من lookup — نستخدم FAMOUS_CITY_OVERRIDES + _countryNameForLang
        try {
            const _citySlug = cityMatchSsr[1];
            const _cityOverride = (typeof FAMOUS_CITY_OVERRIDES !== 'undefined' && FAMOUS_CITY_OVERRIDES[_citySlug]) ? FAMOUS_CITY_OVERRIDES[_citySlug] : null;
            if (_cityOverride && _cityOverride.cc && typeof _countryNameForLang === 'function') {
                const _countryNameLoc = _countryNameForLang(_cityOverride.cc, L) || _cityOverride.cc;
                const _countrySlugSsr = (typeof makeCountrySlugSrv === 'function')
                    ? makeCountrySlugSrv(_cityOverride.cc)
                    : (_cityOverride.cc ? _cityOverride.cc.toLowerCase() : '');
                const _langPfxSsr = (L === 'ar') ? '' : ('/' + L);
                const _countryHrefSsr = _countrySlugSsr
                    ? `${_langPfxSsr}/prayer-times-in-${_countrySlugSsr}`
                    : `${_langPfxSsr}/`;
                html = html.replace(
                    '<span itemprop="name" id="bc-country-name">--</span>',
                    `<span itemprop="name" id="bc-country-name">${_escHtml(_countryNameLoc)}</span>`
                );
                // ضع href للدولة في bc-country
                html = html.replace(
                    '<a class="bc-link" href="#" id="bc-country" itemprop="item">',
                    `<a class="bc-link" href="${_countryHrefSsr}" id="bc-country" itemprop="item">`
                );
            }
        } catch (_e) { /* silent */ }
        // ملء bc-home-name حسب اللغة (قد يظلّ "الرئيسية" في AR، أو "Home" في EN, إلخ)
        try {
            const _homeByLang = { ar: 'الرئيسيّة', en: 'Home', fr: 'Accueil', tr: 'Ana Sayfa', ur: 'صفحۂ اوّل', de: 'Startseite', id: 'Beranda', es: 'Inicio', bn: 'হোম', ms: 'Laman Utama' };
            const _homeLbl = _homeByLang[L] || 'Home';
            html = html.replace(
                '<span itemprop="name" id="bc-home-name" data-i18n="breadcrumb.home">الرئيسية</span>',
                `<span itemprop="name" id="bc-home-name" data-i18n="breadcrumb.home">${_escHtml(_homeLbl)}</span>`
            );
        } catch (_e) { /* silent */ }

        // ═══ Phase 2 — SSR حقن City Summary Paragraph (فقرة SEO غنيّة) ═══
        try {
            const _citySlug = cityMatchSsr[1];
            const _override = (typeof FAMOUS_CITY_OVERRIDES !== 'undefined' && FAMOUS_CITY_OVERRIDES[_citySlug]) ? FAMOUS_CITY_OVERRIDES[_citySlug] : null;
            // 🔧 (د) الـtimezone الحقيقيّة: من override إن كانت، ثمّ cc-map، ثمّ fallback
            const _ccSummary = (_override && _override.cc) ? String(_override.cc).toLowerCase() : '';
            const _tz = (_override && _override.tz) || _CC_TZ_MAP[_ccSummary] || 'UTC';
            // الـcalc method الحقيقيّة: من override، ثمّ حسب cc، ثمّ MWL
            const _method = (_override && _override.method) || _CC_METHOD_MAP[_ccSummary] || 'MWL';
            let _countryNameForSummary = '';
            if (_override && _override.cc && typeof _countryNameForLang === 'function') {
                _countryNameForSummary = _countryNameForLang(_override.cc, L) || '';
            }
            // ═══ Polish Round (B) — تعريب method label (بدل "MWL" → "رابطة العالم الإسلامي") ═══
            const _METHOD_LABELS_BY_LANG = {
                ar: { 'Makkah':'أمّ القرى - مكّة المكرّمة', 'MWL':'رابطة العالم الإسلاميّ', 'ISNA':'أمريكا الشمالية (ISNA)', 'Egyptian':'الهيئة المصريّة العامّة للمساحة', 'Karachi':'جامعة العلوم الإسلاميّة - كراتشي', 'Tehran':'معهد الجيوفيزياء - طهران', 'Kuwait':'الكويت', 'Qatar':'قطر', 'Singapore':'سنغافورة', 'Diyanet':'تركيا - ديانت', 'UOIF':'اتّحاد المنظّمات الإسلاميّة في فرنسا', 'Russia':'روسيا', 'JAKIM':'ماليزيا - جاكيم', 'Kemenag':'إندونيسيا - كمناج', 'Dubai':'دبي' },
                en: { 'Makkah':'Umm Al-Qura University', 'MWL':'Muslim World League', 'ISNA':'Islamic Society of North America', 'Egyptian':'Egyptian General Authority', 'Karachi':'University of Islamic Sciences - Karachi', 'Tehran':'Tehran Geophysics Institute', 'Kuwait':'Kuwait', 'Qatar':'Qatar', 'Singapore':'Singapore', 'Diyanet':'Turkey - Diyanet', 'UOIF':'France - UOIF', 'Russia':'Russia', 'JAKIM':'Malaysia - JAKIM', 'Kemenag':'Indonesia - Kemenag', 'Dubai':'Dubai' },
                fr: { 'Makkah':'Université Umm Al-Qura', 'MWL':'Ligue islamique mondiale', 'ISNA':'Société islamique d\u2019Amérique du Nord', 'Egyptian':'Autorité égyptienne générale', 'Karachi':'Université de Karachi', 'Tehran':'Institut de géophysique de Téhéran', 'Kuwait':'Koweït', 'Qatar':'Qatar', 'Singapore':'Singapour', 'Diyanet':'Turquie - Diyanet', 'UOIF':'UOIF France', 'Russia':'Russie', 'JAKIM':'Malaisie - JAKIM', 'Kemenag':'Indonésie - Kemenag', 'Dubai':'Dubaï' },
                tr: { 'Makkah':'Ümmü\u2019l-Kura Üniversitesi', 'MWL':'İslam Dünyası Birliği', 'ISNA':'Kuzey Amerika İslam Birliği (ISNA)', 'Egyptian':'Mısır Genel Otoritesi', 'Karachi':'Karaçi Üniversitesi', 'Tehran':'Tahran Jeofizik Enstitüsü', 'Kuwait':'Kuveyt', 'Qatar':'Katar', 'Singapore':'Singapur', 'Diyanet':'Türkiye - Diyanet', 'UOIF':'Fransa - UOIF', 'Russia':'Rusya', 'JAKIM':'Malezya - JAKIM', 'Kemenag':'Endonezya - Kemenag', 'Dubai':'Dubai' },
                ur: { 'Makkah':'جامعہ ام القریٰ', 'MWL':'رابطۃ العالم الاسلامی', 'ISNA':'شمالی امریکہ (ISNA)', 'Egyptian':'مصری جنرل اتھارٹی', 'Karachi':'جامعہ علومِ اسلامیہ کراچی', 'Tehran':'تہران جیوفزکس انسٹیٹیوٹ', 'Kuwait':'کویت', 'Qatar':'قطر', 'Singapore':'سنگاپور', 'Diyanet':'ترکی - دیانت', 'UOIF':'فرانس - UOIF', 'Russia':'روس', 'JAKIM':'ملائیشیا - جاکم', 'Kemenag':'انڈونیشیا - کمناج', 'Dubai':'دبئی' },
                de: { 'Makkah':'Umm Al-Qura Universität', 'MWL':'Islamische Weltliga', 'ISNA':'Islamic Society of North America', 'Egyptian':'Ägyptische Behörde', 'Karachi':'Universität Karatschi', 'Tehran':'Teheran Geophysik-Institut', 'Kuwait':'Kuwait', 'Qatar':'Katar', 'Singapore':'Singapur', 'Diyanet':'Türkei - Diyanet', 'UOIF':'Frankreich - UOIF', 'Russia':'Russland', 'JAKIM':'Malaysia - JAKIM', 'Kemenag':'Indonesien - Kemenag', 'Dubai':'Dubai' },
                id: { 'Makkah':'Universitas Umm Al-Qura', 'MWL':'Liga Muslim Dunia', 'ISNA':'Masyarakat Islam Amerika Utara', 'Egyptian':'Otoritas Mesir', 'Karachi':'Universitas Karachi', 'Tehran':'Institut Geofisika Tehran', 'Kuwait':'Kuwait', 'Qatar':'Qatar', 'Singapore':'Singapura', 'Diyanet':'Turki - Diyanet', 'UOIF':'Prancis - UOIF', 'Russia':'Rusia', 'JAKIM':'Malaysia - JAKIM', 'Kemenag':'Kementerian Agama RI', 'Dubai':'Dubai' },
                es: { 'Makkah':'Universidad Umm Al-Qura', 'MWL':'Liga Mundial Islámica', 'ISNA':'Sociedad Islámica de Norteamérica', 'Egyptian':'Autoridad Egipcia', 'Karachi':'Universidad de Karachi', 'Tehran':'Instituto de Geofísica de Teherán', 'Kuwait':'Kuwait', 'Qatar':'Catar', 'Singapore':'Singapur', 'Diyanet':'Turquía - Diyanet', 'UOIF':'Francia - UOIF', 'Russia':'Rusia', 'JAKIM':'Malasia - JAKIM', 'Kemenag':'Indonesia - Kemenag', 'Dubai':'Dubái' },
                bn: { 'Makkah':'উম্মুল কুরা বিশ্ববিদ্যালয়', 'MWL':'মুসলিম ওয়ার্ল্ড লীগ', 'ISNA':'উত্তর আমেরিকা (ISNA)', 'Egyptian':'মিশরীয় কর্তৃপক্ষ', 'Karachi':'করাচি বিশ্ববিদ্যালয়', 'Tehran':'তেহরান ভূপদার্থবিদ্যা ইনস্টিটিউট', 'Kuwait':'কুয়েত', 'Qatar':'কাতার', 'Singapore':'সিঙ্গাপুর', 'Diyanet':'তুরস্ক - দিয়ানেত', 'UOIF':'ফ্রান্স - UOIF', 'Russia':'রাশিয়া', 'JAKIM':'মালয়েশিয়া - জাকিম', 'Kemenag':'ইন্দোনেশিয়া - কেমেনাগ', 'Dubai':'দুবাই' },
                ms: { 'Makkah':'Universiti Umm Al-Qura', 'MWL':'Liga Dunia Islam', 'ISNA':'Masyarakat Islam Amerika Utara', 'Egyptian':'Pihak Berkuasa Mesir', 'Karachi':'Universiti Karachi', 'Tehran':'Institut Geofizik Tehran', 'Kuwait':'Kuwait', 'Qatar':'Qatar', 'Singapore':'Singapura', 'Diyanet':'Turki - Diyanet', 'UOIF':'Perancis - UOIF', 'Russia':'Rusia', 'JAKIM':'Malaysia - JAKIM', 'Kemenag':'Indonesia - Kemenag', 'Dubai':'Dubai' }
            };
            const _methodLabel = (_METHOD_LABELS_BY_LANG[L] && _METHOD_LABELS_BY_LANG[L][_method]) || _method;
            // 🔧 (Polish Round B) استبدال ${_tz} IANA → "بالتوقيت المحلّي لـ{city}" (لغة طبيعيّة) + _methodLabel بدل رمز الـmethod
            const _summaryTpl = ({
                ar: `تعرض هذه الصفحة مواقيت الصلاة لمدينة ${cityDisplayLoc}${_countryNameForSummary ? '، ' + _countryNameForSummary : ''}، وفق طريقة ${_methodLabel}، بالتوقيت المحلّي لـ${cityDisplayLoc}. تُحدَّث المواقيت يوميّاً وتشمل الفجر والشروق والظهر والعصر والمغرب والعشاء.`,
                en: `This page shows prayer times for ${cityDisplayLoc}${_countryNameForSummary ? ', ' + _countryNameForSummary : ''} using the ${_methodLabel} method, in the local time of ${cityDisplayLoc}. Times are updated daily and include Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha.`,
                fr: `Cette page affiche les heures de prière pour ${cityDisplayLoc}${_countryNameForSummary ? ', ' + _countryNameForSummary : ''} selon la méthode ${_methodLabel}, à l'heure locale de ${cityDisplayLoc}.`,
                tr: `${cityDisplayLoc}${_countryNameForSummary ? ', ' + _countryNameForSummary : ''} için namaz vakitleri — ${_methodLabel} yöntemi, ${cityDisplayLoc} yerel saati.`,
                ur: `یہ صفحہ ${cityDisplayLoc}${_countryNameForSummary ? '، ' + _countryNameForSummary : ''} کے اوقاتِ نماز دکھاتا ہے — طریقہ ${_methodLabel}, ${cityDisplayLoc} کے مقامی وقت کے مطابق۔`,
                de: `Diese Seite zeigt die Gebetszeiten für ${cityDisplayLoc}${_countryNameForSummary ? ', ' + _countryNameForSummary : ''} nach der ${_methodLabel}-Methode, in der Ortszeit von ${cityDisplayLoc}.`,
                id: `Halaman ini menampilkan jadwal sholat untuk ${cityDisplayLoc}${_countryNameForSummary ? ', ' + _countryNameForSummary : ''} menggunakan metode ${_methodLabel}, waktu setempat ${cityDisplayLoc}.`,
                es: `Esta página muestra los horarios de oración para ${cityDisplayLoc}${_countryNameForSummary ? ', ' + _countryNameForSummary : ''} usando el método ${_methodLabel}, en la hora local de ${cityDisplayLoc}.`,
                bn: `এই পৃষ্ঠায় ${cityDisplayLoc}${_countryNameForSummary ? ', ' + _countryNameForSummary : ''}-এর নামাজের সময় দেখানো হয়েছে — পদ্ধতি ${_methodLabel}, ${cityDisplayLoc}-এর স্থানীয় সময় অনুযায়ী।`,
                ms: `Halaman ini menunjukkan waktu solat untuk ${cityDisplayLoc}${_countryNameForSummary ? ', ' + _countryNameForSummary : ''} menggunakan kaedah ${_methodLabel}, waktu tempatan ${cityDisplayLoc}.`,
            })[L] || `Prayer times for ${cityDisplayLoc} using ${_methodLabel} method, local time of ${cityDisplayLoc}.`;
            // 🆕 Round 2.1: SHORT visible summary — humanized + Hijri+Gregorian keywords (SEO boost)
            const _summaryShortTpl = ({
                ar: `مواقيت الصلاة اليوم في ${cityDisplayLoc} بالتوقيت المحلّي — مع التاريخ الهجريّ والميلاديّ.`,
                en: `Today's prayer times in ${cityDisplayLoc} in local time — with Hijri and Gregorian dates.`,
                fr: `Heures de prière aujourd'hui à ${cityDisplayLoc} à l'heure locale — avec les dates hégirienne et grégorienne.`,
                tr: `${cityDisplayLoc} için bugünün namaz vakitleri — yerel saatle, Hicri ve Miladi tarihle birlikte.`,
                ur: `آج ${cityDisplayLoc} میں اوقاتِ نماز مقامی وقت کے مطابق — ہجری اور عیسوی تاریخ کے ساتھ۔`,
                de: `Heutige Gebetszeiten in ${cityDisplayLoc} in Ortszeit — mit Hijri- und gregorianischem Datum.`,
                id: `Jadwal sholat hari ini di ${cityDisplayLoc} dalam waktu setempat — dengan tanggal Hijriah dan Masehi.`,
                es: `Horarios de oración hoy en ${cityDisplayLoc} en hora local — con fechas Hijri y Gregoriana.`,
                bn: `আজ ${cityDisplayLoc}-এ নামাজের সময় স্থানীয় সময়ে — হিজরি ও গ্রেগরিয়ান তারিখসহ।`,
                ms: `Waktu solat hari ini di ${cityDisplayLoc} dalam waktu tempatan — dengan tarikh Hijrah dan Masihi.`,
            })[L] || `Today's prayer times in ${cityDisplayLoc} in local time — with Hijri and Gregorian dates.`;
            html = html.replace(
                '<p id="city-summary-text" class="city-summary-hidden-seo"><!-- SSR:CITY_SUMMARY --></p>',
                `<p id="city-summary-text" class="city-summary-hidden-seo">${_escHtml(_summaryTpl)}</p>`
            );
            html = html.replace(
                '<p id="city-summary-visible" class="city-summary-visible"><!-- SSR:CITY_SUMMARY_SHORT --></p>',
                `<p id="city-summary-visible" class="city-summary-visible">${_escHtml(_summaryShortTpl)}</p>`
            );
            // إزالة u-hidden من city-summary-paragraph لأن المحتوى SSR موجود
            html = html.replace(
                'class="section-card city-summary-paragraph u-hidden" id="city-summary-paragraph"',
                'class="section-card city-summary-paragraph" id="city-summary-paragraph"'
            );
        } catch (_e) { /* silent */ }

        // ═══ Phase 2 — SSR حقن BreadcrumbList JSON-LD + FAQPage JSON-LD ═══
        try {
            const _citySlug = cityMatchSsr[1];
            const _override = (typeof FAMOUS_CITY_OVERRIDES !== 'undefined' && FAMOUS_CITY_OVERRIDES[_citySlug]) ? FAMOUS_CITY_OVERRIDES[_citySlug] : null;
            let _countryNameJL = '';
            let _countrySlugJL = '';
            if (_override && _override.cc) {
                if (typeof _countryNameForLang === 'function') _countryNameJL = _countryNameForLang(_override.cc, L) || '';
                if (typeof makeCountrySlugSrv === 'function') _countrySlugJL = makeCountrySlugSrv(_override.cc) || '';
            }
            const _origin = (typeof SITE_URL !== 'undefined' && SITE_URL) ? SITE_URL : '';
            const _prefix = (L === 'ar') ? '' : ('/' + L);
            const _homeByLangJL = { ar: 'الرئيسيّة', en: 'Home', fr: 'Accueil', tr: 'Ana Sayfa', ur: 'صفحۂ اوّل', de: 'Startseite', id: 'Beranda', es: 'Inicio', bn: 'হোম', ms: 'Laman Utama' };
            const _homeLblJL = _homeByLangJL[L] || 'Home';
            const _bcItems = [
                { name: _homeLblJL, item: `${_origin}${_prefix}/` },
            ];
            if (_countryNameJL && _countrySlugJL) {
                _bcItems.push({ name: _countryNameJL, item: `${_origin}${_prefix}/prayer-times-in-${_countrySlugJL}` });
            }
            _bcItems.push({ name: _ssrFinal, item: null });
            const _bcJsonLd = {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                'itemListElement': _bcItems.map((it, i) => {
                    const obj = { '@type': 'ListItem', 'position': i + 1, 'name': it.name };
                    if (it.item) obj.item = it.item;
                    return obj;
                })
            };
            const _ld = `<script type="application/ld+json" id="breadcrumb-schema-ssr">${JSON.stringify(_bcJsonLd)}</script>`;
            html = html.replace('</head>', _ld + '</head>');
        } catch (_e) { /* silent */ }

        // ═══ Phase 2 (ج) — FAQPage JSON-LD لصفحات المدن (Google Rich Results) ═══
        try {
            // 7 أسئلة city-specific (q1/q2 + Phase 2 q3–q7). نصوص بسيطة لكلّ لغة — Google يقرأ الـtext.
            const _faqByLang = {
                ar: [
                    { q: `متى صلاة الفجر في ${cityDisplayLoc}؟`, a: `يمكنك معرفة وقت صلاة الفجر اليوم في ${cityDisplayLoc} من جدول مواقيت الصلاة في هذه الصفحة.` },
                    { q: `ما هي مدة الصيام في ${cityDisplayLoc} اليوم؟`, a: `مدة الصيام في ${cityDisplayLoc} تُحسب من وقت أذان الفجر وحتّى أذان المغرب.` },
                    { q: `كيف تُحسب مواقيت الصلاة في ${cityDisplayLoc}؟`, a: `تُحسب مواقيت الصلاة في ${cityDisplayLoc} وفق طريقة حسابيّة معتمدة تعتمد على إحداثيّات المدينة (خطّ الطول ودائرة العرض) لتحديد أوقات الفجر والشروق والظهر والعصر والمغرب والعشاء بدقّة.` },
                    { q: `ما اتّجاه القبلة من ${cityDisplayLoc}؟`, a: `اتّجاه القبلة من ${cityDisplayLoc} يُحسب بناءً على إحداثيّات المدينة باتّجاه الكعبة المشرّفة في مكّة المكرّمة.` },
                    { q: `هل تختلف المواقيت في ${cityDisplayLoc} عن المدن المجاورة؟`, a: `نعم، تختلف مواقيت الصلاة في ${cityDisplayLoc} قليلاً عن المدن المجاورة بسبب اختلاف خطّ الطول ودائرة العرض.` },
                    { q: `كم عدد ساعات الصيام اليوم في ${cityDisplayLoc}؟`, a: `ساعات الصيام اليوم في ${cityDisplayLoc} تُحسب من أذان الفجر وحتّى أذان المغرب.` },
                    { q: `هل تختلف مواقيت الصلاة في ${cityDisplayLoc} عن مكّة المكرّمة؟`, a: `نعم، تختلف مواقيت ${cityDisplayLoc} عن مكّة المكرّمة بسبب اختلاف خطّ الطول ودائرة العرض.` },
                    { q: `كم باقي على الصلاة القادمة في ${cityDisplayLoc}؟`, a: `يمكنك معرفة الوقت المتبقّي حتّى الصلاة القادمة في ${cityDisplayLoc} بدقّة من خلال صفحة «كم باقي على الصلاة»، حيث يُحدَّث العدّ التنازليّ لحظيّاً.` },
                    { q: `متى تكون الصلاة القادمة في ${cityDisplayLoc} اليوم؟`, a: `تعتمد الصلاة القادمة في ${cityDisplayLoc} على الوقت الحاليّ. يمكنك معرفة موعدها بالتفصيل مع الصلوات الثلاث التالية من خلال صفحة «الصلاة القادمة».` }
                ],
                en: [
                    { q: `When is Fajr prayer in ${cityDisplayLoc}?`, a: `You can find today's Fajr time in ${cityDisplayLoc} from the prayer times schedule on this page.` },
                    { q: `How long is the fasting period in ${cityDisplayLoc} today?`, a: `The fasting period in ${cityDisplayLoc} is calculated from Fajr Adhan until Maghrib Adhan.` },
                    { q: `How are prayer times in ${cityDisplayLoc} calculated?`, a: `Prayer times in ${cityDisplayLoc} are calculated using a standard method based on the city coordinates (longitude and latitude) to accurately determine Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha.` },
                    { q: `What is the Qibla direction from ${cityDisplayLoc}?`, a: `The Qibla direction from ${cityDisplayLoc} is calculated based on the city coordinates toward the Kaaba in Mecca.` },
                    { q: `Do prayer times in ${cityDisplayLoc} differ from neighboring cities?`, a: `Yes, prayer times in ${cityDisplayLoc} differ slightly from neighboring cities due to different longitude and latitude.` },
                    { q: `How many fasting hours are there today in ${cityDisplayLoc}?`, a: `Fasting hours today in ${cityDisplayLoc} are calculated from Fajr Adhan until Maghrib Adhan.` },
                    { q: `Do prayer times in ${cityDisplayLoc} differ from Mecca?`, a: `Yes, prayer times in ${cityDisplayLoc} differ from Mecca due to different longitude and latitude.` },
                    { q: `How much time is left until the next prayer in ${cityDisplayLoc}?`, a: `You can see the exact time left until the next prayer in ${cityDisplayLoc} on the Time Left page, where a live countdown updates every second.` },
                    { q: `When is the next prayer in ${cityDisplayLoc} today?`, a: `The next prayer in ${cityDisplayLoc} depends on the current time. You can see its exact time along with the three following prayers on the Next Prayer page.` }
                ],
                fr: [
                    { q: `Quand est la prière du Fajr à ${cityDisplayLoc}?`, a: `Vous pouvez trouver l'heure du Fajr aujourd'hui à ${cityDisplayLoc} dans le tableau des horaires de prière sur cette page.` },
                    { q: `Quelle est la durée du jeûne à ${cityDisplayLoc} aujourd'hui?`, a: `La durée du jeûne à ${cityDisplayLoc} est calculée de l'Adhan du Fajr jusqu'à l'Adhan du Maghrib.` },
                    { q: `Comment sont calculées les heures de prière à ${cityDisplayLoc}?`, a: `Les heures de prière à ${cityDisplayLoc} sont calculées selon une méthode standard basée sur les coordonnées de la ville (longitude et latitude).` },
                    { q: `Quelle est la direction de la Qibla depuis ${cityDisplayLoc}?`, a: `La direction de la Qibla depuis ${cityDisplayLoc} est calculée en fonction des coordonnées de la ville vers la Kaaba à La Mecque.` },
                    { q: `Les heures de prière à ${cityDisplayLoc} diffèrent-elles des villes voisines?`, a: `Oui, les heures de prière à ${cityDisplayLoc} diffèrent légèrement des villes voisines en raison de la différence de longitude et de latitude.` },
                    { q: `Combien d'heures de jeûne y a-t-il aujourd'hui à ${cityDisplayLoc}?`, a: `Les heures de jeûne aujourd'hui à ${cityDisplayLoc} sont calculées de l'Adhan du Fajr jusqu'à l'Adhan du Maghrib.` },
                    { q: `Les heures de prière à ${cityDisplayLoc} diffèrent-elles de La Mecque?`, a: `Oui, les heures de prière à ${cityDisplayLoc} diffèrent de La Mecque en raison de la différence de longitude et de latitude.` },
                    { q: `Combien de temps reste-t-il avant la prochaine prière à ${cityDisplayLoc}?`, a: `Vous pouvez voir le temps exact restant avant la prochaine prière à ${cityDisplayLoc} sur la page «Temps restant», avec un compte à rebours mis à jour en direct.` },
                    { q: `Quand est la prochaine prière à ${cityDisplayLoc} aujourd'hui?`, a: `La prochaine prière à ${cityDisplayLoc} dépend de l'heure actuelle. Vous trouverez son heure exacte et les trois prières suivantes sur la page «Prochaine prière».` }
                ],
                tr: [
                    { q: `${cityDisplayLoc} için sabah namazı vakti nedir?`, a: `${cityDisplayLoc} için bugünkü sabah namazı vaktini bu sayfadaki namaz vakitleri tablosunda bulabilirsiniz.` },
                    { q: `${cityDisplayLoc} için bugün oruç süresi ne kadar?`, a: `${cityDisplayLoc} için oruç süresi sabah ezanından akşam ezanına kadar hesaplanır.` },
                    { q: `${cityDisplayLoc} için namaz vakitleri nasıl hesaplanır?`, a: `${cityDisplayLoc} için namaz vakitleri, şehir koordinatlarına (boylam ve enlem) dayalı standart bir yöntem kullanılarak hesaplanır.` },
                    { q: `${cityDisplayLoc} için kıble yönü nedir?`, a: `${cityDisplayLoc} için kıble yönü, şehrin koordinatlarından Mekke'deki Kâbe'ye doğru hesaplanır.` },
                    { q: `${cityDisplayLoc} için namaz vakitleri komşu şehirlerden farklı mı?`, a: `Evet, ${cityDisplayLoc} için namaz vakitleri, farklı boylam ve enlem nedeniyle komşu şehirlerden biraz farklıdır.` },
                    { q: `${cityDisplayLoc} için bugün kaç saat oruç tutulur?`, a: `${cityDisplayLoc} için bugün oruç saatleri sabah ezanından akşam ezanına kadar hesaplanır.` },
                    { q: `${cityDisplayLoc} için namaz vakitleri Mekke'den farklı mı?`, a: `Evet, ${cityDisplayLoc} için namaz vakitleri, farklı boylam ve enlem nedeniyle Mekke'den farklıdır.` },
                    { q: `${cityDisplayLoc} için bir sonraki namaza ne kadar kaldı?`, a: `${cityDisplayLoc} için bir sonraki namaza kalan süreyi «Kalan süre» sayfasında canlı olarak güncellenen geri sayım ile görebilirsiniz.` },
                    { q: `Bugün ${cityDisplayLoc} için bir sonraki namaz ne zaman?`, a: `${cityDisplayLoc} için bir sonraki namaz mevcut saate bağlıdır. Kesin saatini ve sonraki üç namazı «Bir sonraki namaz» sayfasında görebilirsiniz.` }
                ],
                ur: [
                    { q: `${cityDisplayLoc} میں فجر کی نماز کب ہے؟`, a: `آپ اس صفحے پر نماز کے اوقات کی جدول سے ${cityDisplayLoc} میں آج فجر کا وقت معلوم کر سکتے ہیں۔` },
                    { q: `${cityDisplayLoc} میں آج روزے کی مدت کتنی ہے؟`, a: `${cityDisplayLoc} میں روزے کی مدت اذانِ فجر سے اذانِ مغرب تک شمار کی جاتی ہے۔` },
                    { q: `${cityDisplayLoc} میں نماز کے اوقات کیسے شمار ہوتے ہیں؟`, a: `${cityDisplayLoc} میں نماز کے اوقات شہر کے نقاط (طول و عرض البلد) کی بنیاد پر ایک معیاری طریقے سے شمار کیے جاتے ہیں۔` },
                    { q: `${cityDisplayLoc} سے قبلہ کی سمت کیا ہے؟`, a: `${cityDisplayLoc} سے قبلہ کی سمت شہر کے نقاط کی بنیاد پر مکہ مکرمہ میں کعبہ کی طرف شمار کی جاتی ہے۔` },
                    { q: `کیا ${cityDisplayLoc} میں نماز کے اوقات پڑوسی شہروں سے مختلف ہیں؟`, a: `جی ہاں، ${cityDisplayLoc} میں نماز کے اوقات طول و عرض البلد کے فرق کی وجہ سے پڑوسی شہروں سے تھوڑے مختلف ہیں۔` },
                    { q: `${cityDisplayLoc} میں آج روزے کے کتنے گھنٹے ہیں؟`, a: `${cityDisplayLoc} میں آج روزے کے گھنٹے اذانِ فجر سے اذانِ مغرب تک شمار کیے جاتے ہیں۔` },
                    { q: `کیا ${cityDisplayLoc} میں نماز کے اوقات مکہ سے مختلف ہیں؟`, a: `جی ہاں، ${cityDisplayLoc} میں نماز کے اوقات طول و عرض البلد کے فرق کی وجہ سے مکہ سے مختلف ہیں۔` },
                    { q: `${cityDisplayLoc} میں اگلی نماز تک کتنا وقت باقی ہے؟`, a: `آپ ${cityDisplayLoc} میں اگلی نماز تک باقی وقت کو «باقی وقت» صفحے پر براہِ راست اپ ڈیٹ ہونے والے کاؤنٹ ڈاؤن کے ساتھ دیکھ سکتے ہیں۔` },
                    { q: `آج ${cityDisplayLoc} میں اگلی نماز کب ہے؟`, a: `${cityDisplayLoc} میں اگلی نماز موجودہ وقت پر منحصر ہے۔ آپ اس کا درست وقت اور اس کے بعد کی تین نمازیں «اگلی نماز» صفحے پر دیکھ سکتے ہیں۔` }
                ],
                de: [
                    { q: `Wann ist das Fajr-Gebet in ${cityDisplayLoc}?`, a: `Die heutige Fajr-Zeit in ${cityDisplayLoc} finden Sie im Gebetszeitenplan auf dieser Seite.` },
                    { q: `Wie lang ist die Fastenperiode in ${cityDisplayLoc} heute?`, a: `Die Fastenperiode in ${cityDisplayLoc} wird vom Fajr-Adhan bis zum Maghrib-Adhan berechnet.` },
                    { q: `Wie werden die Gebetszeiten in ${cityDisplayLoc} berechnet?`, a: `Die Gebetszeiten in ${cityDisplayLoc} werden nach einer Standardmethode anhand der Stadtkoordinaten (Längen- und Breitengrad) berechnet.` },
                    { q: `Was ist die Qibla-Richtung von ${cityDisplayLoc}?`, a: `Die Qibla-Richtung von ${cityDisplayLoc} wird anhand der Stadtkoordinaten in Richtung der Kaaba in Mekka berechnet.` },
                    { q: `Unterscheiden sich die Gebetszeiten in ${cityDisplayLoc} von den Nachbarstädten?`, a: `Ja, die Gebetszeiten in ${cityDisplayLoc} unterscheiden sich aufgrund unterschiedlicher Längen- und Breitengrade leicht von denen der Nachbarstädte.` },
                    { q: `Wie viele Fastenstunden gibt es heute in ${cityDisplayLoc}?`, a: `Die Fastenstunden heute in ${cityDisplayLoc} werden vom Fajr-Adhan bis zum Maghrib-Adhan berechnet.` },
                    { q: `Unterscheiden sich die Gebetszeiten in ${cityDisplayLoc} von Mekka?`, a: `Ja, die Gebetszeiten in ${cityDisplayLoc} unterscheiden sich aufgrund unterschiedlicher Längen- und Breitengrade von denen in Mekka.` },
                    { q: `Wie viel Zeit bleibt bis zum nächsten Gebet in ${cityDisplayLoc}?`, a: `Sie können die genaue Zeit bis zum nächsten Gebet in ${cityDisplayLoc} auf der Seite «Verbleibende Zeit» sehen, mit einem live aktualisierten Countdown.` },
                    { q: `Wann ist das nächste Gebet in ${cityDisplayLoc} heute?`, a: `Das nächste Gebet in ${cityDisplayLoc} hängt von der aktuellen Uhrzeit ab. Die genaue Zeit und die drei folgenden Gebete finden Sie auf der Seite «Nächstes Gebet».` }
                ],
                id: [
                    { q: `Kapan sholat Subuh di ${cityDisplayLoc}?`, a: `Anda dapat menemukan waktu Subuh hari ini di ${cityDisplayLoc} dari jadwal sholat di halaman ini.` },
                    { q: `Berapa lama durasi puasa di ${cityDisplayLoc} hari ini?`, a: `Durasi puasa di ${cityDisplayLoc} dihitung dari adzan Subuh hingga adzan Maghrib.` },
                    { q: `Bagaimana jadwal sholat di ${cityDisplayLoc} dihitung?`, a: `Jadwal sholat di ${cityDisplayLoc} dihitung menggunakan metode standar berdasarkan koordinat kota (garis bujur dan lintang).` },
                    { q: `Apa arah kiblat dari ${cityDisplayLoc}?`, a: `Arah kiblat dari ${cityDisplayLoc} dihitung berdasarkan koordinat kota menuju Ka'bah di Mekkah.` },
                    { q: `Apakah jadwal sholat di ${cityDisplayLoc} berbeda dari kota-kota tetangga?`, a: `Ya, jadwal sholat di ${cityDisplayLoc} sedikit berbeda dari kota-kota tetangga karena perbedaan garis bujur dan lintang.` },
                    { q: `Berapa jam puasa hari ini di ${cityDisplayLoc}?`, a: `Jam puasa hari ini di ${cityDisplayLoc} dihitung dari adzan Subuh hingga adzan Maghrib.` },
                    { q: `Apakah jadwal sholat di ${cityDisplayLoc} berbeda dari Mekkah?`, a: `Ya, jadwal sholat di ${cityDisplayLoc} berbeda dari Mekkah karena perbedaan garis bujur dan lintang.` },
                    { q: `Berapa waktu tersisa sampai sholat berikutnya di ${cityDisplayLoc}?`, a: `Anda dapat melihat waktu tepat yang tersisa sampai sholat berikutnya di ${cityDisplayLoc} di halaman «Waktu Tersisa», dengan hitung mundur yang diperbarui langsung.` },
                    { q: `Kapan sholat berikutnya di ${cityDisplayLoc} hari ini?`, a: `Sholat berikutnya di ${cityDisplayLoc} bergantung pada waktu saat ini. Anda dapat melihat waktu tepatnya dan tiga sholat berikutnya di halaman «Sholat Berikutnya».` }
                ],
                es: [
                    { q: `¿Cuándo es la oración del Fajr en ${cityDisplayLoc}?`, a: `Puedes encontrar la hora del Fajr hoy en ${cityDisplayLoc} en el horario de oración de esta página.` },
                    { q: `¿Cuál es la duración del ayuno en ${cityDisplayLoc} hoy?`, a: `La duración del ayuno en ${cityDisplayLoc} se calcula desde el Adhan del Fajr hasta el Adhan del Maghrib.` },
                    { q: `¿Cómo se calculan los horarios de oración en ${cityDisplayLoc}?`, a: `Los horarios de oración en ${cityDisplayLoc} se calculan usando un método estándar basado en las coordenadas de la ciudad (longitud y latitud).` },
                    { q: `¿Cuál es la dirección de la Qibla desde ${cityDisplayLoc}?`, a: `La dirección de la Qibla desde ${cityDisplayLoc} se calcula en función de las coordenadas de la ciudad hacia la Kaaba en La Meca.` },
                    { q: `¿Los horarios de oración en ${cityDisplayLoc} difieren de las ciudades vecinas?`, a: `Sí, los horarios de oración en ${cityDisplayLoc} difieren ligeramente de las ciudades vecinas debido a la diferencia de longitud y latitud.` },
                    { q: `¿Cuántas horas de ayuno hay hoy en ${cityDisplayLoc}?`, a: `Las horas de ayuno hoy en ${cityDisplayLoc} se calculan desde el Adhan del Fajr hasta el Adhan del Maghrib.` },
                    { q: `¿Los horarios de oración en ${cityDisplayLoc} difieren de La Meca?`, a: `Sí, los horarios de oración en ${cityDisplayLoc} difieren de La Meca debido a la diferencia de longitud y latitud.` },
                    { q: `¿Cuánto tiempo falta para la próxima oración en ${cityDisplayLoc}?`, a: `Puedes ver el tiempo exacto que falta hasta la próxima oración en ${cityDisplayLoc} en la página «Tiempo restante», con una cuenta regresiva en vivo.` },
                    { q: `¿Cuándo es la próxima oración en ${cityDisplayLoc} hoy?`, a: `La próxima oración en ${cityDisplayLoc} depende de la hora actual. Puedes ver su hora exacta y las tres oraciones siguientes en la página «Próxima oración».` }
                ],
                bn: [
                    { q: `${cityDisplayLoc}-এ ফজরের নামাজ কখন?`, a: `আপনি এই পৃষ্ঠার নামাজের সময়সূচি থেকে ${cityDisplayLoc}-এ আজকের ফজরের সময় জানতে পারেন।` },
                    { q: `${cityDisplayLoc}-এ আজকের রোজার সময়কাল কত?`, a: `${cityDisplayLoc}-এ রোজার সময়কাল ফজরের আজান থেকে মাগরিবের আজান পর্যন্ত গণনা করা হয়।` },
                    { q: `${cityDisplayLoc}-এ নামাজের সময় কীভাবে গণনা করা হয়?`, a: `${cityDisplayLoc}-এ নামাজের সময় শহরের স্থানাঙ্ক (দ্রাঘিমা ও অক্ষাংশ) ভিত্তিক একটি মানক পদ্ধতি ব্যবহার করে গণনা করা হয়।` },
                    { q: `${cityDisplayLoc} থেকে কিবলার দিক কোনটি?`, a: `${cityDisplayLoc} থেকে কিবলার দিক শহরের স্থানাঙ্কের ভিত্তিতে মক্কার কাবার দিকে গণনা করা হয়।` },
                    { q: `${cityDisplayLoc}-এ নামাজের সময় কি প্রতিবেশী শহর থেকে ভিন্ন?`, a: `হ্যাঁ, দ্রাঘিমা ও অক্ষাংশের পার্থক্যের কারণে ${cityDisplayLoc}-এ নামাজের সময় প্রতিবেশী শহর থেকে সামান্য ভিন্ন।` },
                    { q: `${cityDisplayLoc}-এ আজ কত ঘণ্টা রোজা?`, a: `${cityDisplayLoc}-এ আজ রোজার ঘণ্টা ফজরের আজান থেকে মাগরিবের আজান পর্যন্ত গণনা করা হয়।` },
                    { q: `${cityDisplayLoc}-এ নামাজের সময় কি মক্কা থেকে ভিন্ন?`, a: `হ্যাঁ, দ্রাঘিমা ও অক্ষাংশের পার্থক্যের কারণে ${cityDisplayLoc}-এ নামাজের সময় মক্কা থেকে ভিন্ন।` },
                    { q: `${cityDisplayLoc}-এ পরবর্তী নামাজ পর্যন্ত কত সময় বাকি?`, a: `আপনি ${cityDisplayLoc}-এ পরবর্তী নামাজ পর্যন্ত সঠিক বাকি সময় «বাকি সময়» পৃষ্ঠায় লাইভ আপডেট হওয়া কাউন্টডাউন সহ দেখতে পারেন।` },
                    { q: `আজ ${cityDisplayLoc}-এ পরবর্তী নামাজ কখন?`, a: `${cityDisplayLoc}-এ পরবর্তী নামাজ বর্তমান সময়ের উপর নির্ভর করে। আপনি এর সঠিক সময় এবং পরবর্তী তিনটি নামাজ «পরবর্তী নামাজ» পৃষ্ঠায় দেখতে পারেন।` }
                ],
                ms: [
                    { q: `Bilakah solat Subuh di ${cityDisplayLoc}?`, a: `Anda boleh mendapatkan waktu Subuh hari ini di ${cityDisplayLoc} dari jadual waktu solat di halaman ini.` },
                    { q: `Berapa lamakah tempoh puasa di ${cityDisplayLoc} hari ini?`, a: `Tempoh puasa di ${cityDisplayLoc} dikira dari azan Subuh sehingga azan Maghrib.` },
                    { q: `Bagaimanakah waktu solat di ${cityDisplayLoc} dikira?`, a: `Waktu solat di ${cityDisplayLoc} dikira menggunakan kaedah standard berdasarkan koordinat bandar (garis bujur dan latitud).` },
                    { q: `Apakah arah kiblat dari ${cityDisplayLoc}?`, a: `Arah kiblat dari ${cityDisplayLoc} dikira berdasarkan koordinat bandar ke arah Kaabah di Makkah.` },
                    { q: `Adakah waktu solat di ${cityDisplayLoc} berbeza daripada bandar jiran?`, a: `Ya, waktu solat di ${cityDisplayLoc} sedikit berbeza daripada bandar jiran kerana perbezaan garis bujur dan latitud.` },
                    { q: `Berapa jam puasa hari ini di ${cityDisplayLoc}?`, a: `Jam puasa hari ini di ${cityDisplayLoc} dikira dari azan Subuh sehingga azan Maghrib.` },
                    { q: `Adakah waktu solat di ${cityDisplayLoc} berbeza daripada Makkah?`, a: `Ya, waktu solat di ${cityDisplayLoc} berbeza daripada Makkah kerana perbezaan garis bujur dan latitud.` },
                    { q: `Berapa banyak masa lagi sebelum solat seterusnya di ${cityDisplayLoc}?`, a: `Anda boleh melihat masa tepat yang tinggal sebelum solat seterusnya di ${cityDisplayLoc} di halaman «Masa Tinggal», dengan kiraan undur langsung.` },
                    { q: `Bilakah solat seterusnya di ${cityDisplayLoc} hari ini?`, a: `Solat seterusnya di ${cityDisplayLoc} bergantung pada masa sekarang. Anda boleh melihat masa tepatnya dan tiga solat seterusnya di halaman «Solat Seterusnya».` }
                ]
            };
            const _faqList = _faqByLang[L] || _faqByLang.en;
            const _faqJsonLd = {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                'mainEntity': _faqList.map(it => ({
                    '@type': 'Question',
                    'name': it.q,
                    'acceptedAnswer': { '@type': 'Answer', 'text': it.a }
                }))
            };
            const _faqLd = `<script type="application/ld+json" id="city-faq-schema-ssr">${JSON.stringify(_faqJsonLd)}</script>`;
            html = html.replace('</head>', _faqLd + '</head>');
        } catch (_e) { /* silent */ }

        try {
            const localeMap = { ar: 'ar', en: 'en-US', fr: 'fr-FR', tr: 'tr-TR', ur: 'ur-PK', de: 'de-DE', id: 'id-ID', es: 'es-ES', bn: 'bn-BD', ms: 'ms-MY' };
            const gregDate = new Date().toLocaleDateString(
                localeMap[L] || 'en-US',
                { day: 'numeric', month: 'long', year: 'numeric' }
            );
            html = html.replace(
                '<div class="banner-date-greg" id="banner-greg-date">--</div>',
                `<div class="banner-date-greg" id="banner-greg-date">${_escHtml(gregDate)}</div>`
            );
        } catch(e) { /* toLocaleDateString fallback — تبقى "--" */ }
    } else {
        // 5b) SSR للصفحة الرئيسية (و URLs أخرى غير city): فقرات SEO حقيقية بدل الفارغة
        //     يُزيل "Content thin" warning ويضيف keywords في HTML الأوّلي.
        const Lh = seo.lang;
        // Round 7e: إضافة keywords ديناميكية (شوال 1447، أبريل 2026، مكة المكرمة، الصلاة في)
        const _hN = _hijriNow();
        const _hMAr = (_HIJRI_MONTHS[_hN.month] || {}).ar || '';
        const _hMEn = (_HIJRI_MONTHS[_hN.month] || {}).en || '';
        const _hY = _hN.year;
        const _gNow2 = new Date();
        const _gMIdx = _gNow2.getMonth();
        const _gY2 = _gNow2.getFullYear();
        const _gMAr = _GREG_MONTHS.ar[_gMIdx];
        const _gMEn = _GREG_MONTHS.en[_gMIdx];
        const _gMFr = _GREG_MONTHS.fr[_gMIdx];
        const _gMTr = _GREG_MONTHS.tr[_gMIdx];
        const _gMUr = _GREG_MONTHS.ur[_gMIdx];
        const _gMDe = _GREG_MONTHS.de[_gMIdx];
        const _gMId = _GREG_MONTHS.id[_gMIdx];
        // نصوص مقسَّمة لجمل قصيرة (~15-20 كلمة لكل جملة) + تحوي كلمات H1 (لكل/مدن/العالم/التاريخ الهجري)
        // NOTE: كل فقرة تبدأ بالعبارة الكاملة للـ H1 "مواقيت الصلاة والتاريخ الهجري"
        //       (exact phrase match) لإزالة warning "H1 keywords not in text".
        const homeL1 = {
            ar: `مواقيت الصلاة والتاريخ الهجري في متناول يدك — احسب مواقيت الصلاة في مكة المكرمة والمدينة المنوّرة وكل مدن العالم اليوم (الفجر، الشروق، الظهر، العصر، المغرب، العشاء). التقويم الهجري لشهر ${_hMAr} ${_hY} هـ الموافق ${_gMAr} ${_gY2} م، بطرق حساب موثوقة: رابطة العالم الإسلامي، أم القرى، الهيئة المصرية العامة وغيرها.`,
            en: `Prayer Times and Hijri Calendar at your fingertips — calculate today prayer times in Mecca, Medina and every city worldwide (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha). Hijri calendar for ${_hMEn} ${_hY} AH corresponding to ${_gMEn} ${_gY2}, using trusted methods: Muslim World League, Umm al-Qura, Egyptian Authority and more.`,
            fr: `Heures de prière et calendrier Hégirien à portée de main — calculez aujourd'hui les heures de prière à La Mecque, Médine et dans toutes les villes du monde (Fajr, Dhuhr, Asr, Maghrib, Isha). Calendrier hégirien de ${_hMEn} ${_hY} correspondant à ${_gMFr} ${_gY2}, avec des méthodes fiables : Ligue Islamique Mondiale, Umm al-Qura.`,
            tr: `Namaz Vakitleri ve Hicri Takvim parmaklarınızın ucunda — bugün Mekke, Medine ve dünyanın her şehri için namaz vakitlerini (Fecir, Öğle, İkindi, Akşam, Yatsı) hesaplayın. ${_hMEn} ${_hY} / ${_gMTr} ${_gY2} için Hicri takvim; güvenilir yöntemler: Müslüman Dünya Birliği, Ümmü'l-Kura.`,
            ur: `اوقاتِ نماز اور ہجری کیلنڈر آپ کی انگلیوں پر — آج مکہ مکرمہ، مدینہ منوّرہ اور دنیا کے ہر شہر کے لیے اوقاتِ نماز (فجر، ظہر، عصر، مغرب، عشاء) حساب کریں۔ ${_hMEn} ${_hY} / ${_gMUr} ${_gY2} کا ہجری کیلنڈر؛ قابلِ اعتماد طریقے: مسلم ورلڈ لیگ، ام القریٰ۔`,
            de: `Gebetszeiten und Hidschri-Kalender immer griffbereit — berechnen Sie die heutigen Gebetszeiten in Mekka, Medina und jeder Stadt weltweit (Fajr, Sonnenaufgang, Dhuhr, Asr, Maghrib, Isha). Hidschri-Kalender für ${_hMEn} ${_hY} AH entspricht ${_gMDe} ${_gY2}, mit zuverlässigen Berechnungsmethoden: Muslimische Weltliga, Umm al-Qura, Ägyptische Generalbehörde und weitere.`,
            id: `Jadwal Sholat dan Kalender Hijriyah dalam genggaman Anda — hitung jadwal sholat hari ini di Mekah, Madinah, dan setiap kota di dunia (Subuh, Terbit, Zuhur, Asar, Magrib, Isya). Kalender Hijriyah untuk ${_hMEn} ${_hY} H yang bertepatan dengan ${_gMId} ${_gY2}, dengan metode perhitungan terpercaya: Liga Dunia Muslim, Umm al-Qura, Otoritas Umum Mesir, dan lainnya.`,
        }[Lh] || '';
        const homeL2 = {
            ar: `مواقيت الصلاة والتاريخ الهجري اليوم — ${_hMAr} ${_hY} هـ — مع تحويل التاريخ بين الهجري والميلادي، اتجاه القبلة نحو الكعبة المشرفة في مكة المكرمة، حاسبة الزكاة، الأدعية والأذكار الصحيحة من الكتاب والسنة، والمسبحة الإلكترونية — تطبيق واحد لكل احتياجات المسلم اليومية.`,
            en: `Prayer Times and Hijri Calendar today — ${_hMEn} ${_hY} AH — with Hijri-Gregorian date conversion, Qibla direction to the Kaaba in Mecca, Zakat calculator, authentic duas and adhkar from Quran and Sunnah, and a digital tasbih — one application for every daily Muslim need.`,
            fr: `Heures de prière et calendrier Hégirien d'aujourd'hui — ${_hMEn} ${_hY} — avec conversion Hégirien-Grégorien, direction de la Qibla vers la Kaaba à La Mecque, calculateur de Zakat, douas et adhkar authentiques, et un tasbih numérique — une seule application pour tous les besoins quotidiens.`,
            tr: `Bugün için Namaz Vakitleri ve Hicri Takvim — ${_hMEn} ${_hY} — Hicri-Miladi tarih dönüştürme, Mekke'deki Kâbe'ye doğru kıble yönü, zekât hesaplayıcı, Kuran ve Sünnet'ten sahih dualar ve ezkâr, ve dijital tesbih — tüm günlük Müslüman ihtiyaçları için tek uygulama.`,
            ur: `آج کے لیے اوقاتِ نماز اور ہجری کیلنڈر — ${_hMEn} ${_hY} — ہجری-عیسوی تاریخ کی تبدیلی، مکہ مکرمہ میں کعبہ کی طرف قبلہ کی سمت، زکاۃ کیلکولیٹر، قرآن و سنت سے صحیح دعائیں، اور ڈیجیٹل تسبیح — ایک مسلمان کی تمام روزانہ ضروریات ایک جگہ۔`,
            de: `Gebetszeiten und Hidschri-Kalender heute — ${_hMEn} ${_hY} AH — mit Hidschri-Gregorianischer Datumsumrechnung, Qibla-Richtung zur Kaaba in Mekka, Zakat-Rechner, authentischen Duas und Adhkar aus Koran und Sunna, und einer digitalen Tasbih — eine einzige Anwendung für alle täglichen Bedürfnisse des Muslim.`,
            id: `Jadwal Sholat dan Kalender Hijriyah hari ini — ${_hMEn} ${_hY} H — dengan konversi tanggal Hijriyah-Masehi, arah Kiblat menuju Kakbah di Mekah, kalkulator Zakat, doa dan dzikir otentik dari Al-Qur'an dan Sunnah, serta tasbih digital — satu aplikasi untuk setiap kebutuhan harian Muslim.`,
        }[Lh] || '';
        // NOTE: نُدرج <strong> حول العبارة المفتاحية في بداية كل فقرة
        //       (Use keywords in important HTML tags). الفقرات static تُنشأ أعلاه،
        //       لذا _escHtml لا يُستدعى على الـ tags نفسها.
        const keyPhraseHtml = {
            ar: '<strong>مواقيت الصلاة والتاريخ الهجري</strong>',
            en: '<strong>Prayer Times and Hijri Calendar</strong>',
            fr: '<strong>Heures de prière et calendrier Hégirien</strong>',
            tr: '<strong>Namaz Vakitleri ve Hicri Takvim</strong>',
            ur: '<strong>اوقاتِ نماز اور ہجری کیلنڈر</strong>',
            de: '<strong>Gebetszeiten und Hidschri-Kalender</strong>',
            id: '<strong>Jadwal Sholat dan Kalender Hijriyah</strong>',
        }[Lh] || '';
        function _wrapKey(text, key) {
            if (!key || !text) return _escHtml(text);
            const plainKey = key.replace(/<\/?strong>/g, '');
            const idx = text.indexOf(plainKey);
            if (idx < 0) return _escHtml(text);
            const before = _escHtml(text.slice(0, idx));
            const after  = _escHtml(text.slice(idx + plainKey.length));
            return before + key + after;
        }
        if (homeL1) html = html.replace(
            '<p class="seo-line" id="seo-line-1"></p>',
            `<p class="seo-line" id="seo-line-1">${_wrapKey(homeL1, keyPhraseHtml)}</p>`
        );
        if (homeL2) html = html.replace(
            '<p class="seo-line" id="seo-line-2"></p>',
            `<p class="seo-line" id="seo-line-2">${_wrapKey(homeL2, keyPhraseHtml)}</p>`
        );

        // ═══════════════════════════════════════════════════════════════════
        // Round 7f: LLM Readability — استبدال placeholders بمحتوى SSR افتراضي
        // ═══════════════════════════════════════════════════════════════════
        // الصفحة الرئيسية حصراً (لا نطبّق على /zakat-calculator/...)
        const _corePathHome = urlPath.replace(/^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\/?/, '/')
                                     .replace(/\.html$/, '').replace(/\/index$/, '/');
        const _isHomepage = (_corePathHome === '/' || _corePathHome === '');

        if (_isHomepage) {
            // —— نصوص محلّية (5 لغات) لـ fallback text ——
            const i18n = {
                ar: {
                    worldCities: 'مدن العالم', upcomingPrayer: 'الصلاة القادمة',
                    setLocation: 'حدّد موقعك لعرض الأوقات', variesByLocation: 'يختلف حسب الموقع',
                    towardsMecca: 'نحو مكة المكرمة', currentMoonPhase: 'طور القمر اليوم',
                    setLocationInfo: 'حدّد موقعك لعرض المعلومات الكاملة',
                    aboutTitle: 'عن موقع مواقيت الصلاة',
                    aboutP1: 'موقع مواقيت الصلاة والتاريخ الهجري يوفّر جدولاً يومياً دقيقاً لمواعيد الصلوات الخمس (الفجر، الشروق، الظهر، العصر، المغرب، العشاء) في أكثر من 50 ألف مدينة حول العالم، وذلك بالاعتماد على إحداثيات GPS الخاصّة بموقعك أو بالبحث اليدوي عن اسم مدينتك.',
                    aboutP2: 'يدعم الموقع عدّة طرق حساب معتمَدة عالمياً: رابطة العالم الإسلامي، هيئة أم القرى بمكة المكرمة، الهيئة المصرية العامة للمساحة، الجمعية الإسلامية لأمريكا الشمالية (ISNA)، إضافةً إلى خيارات مذاهب الفقه (الشافعي/الحنفي) لحساب وقت صلاة العصر.',
                    aboutP3: 'إلى جانب مواقيت الصلاة اليوم، يقدّم الموقع أدوات إسلامية متكاملة: التقويم الهجري بأشهره الاثني عشر (محرم، صفر، ربيع الأول، ربيع الآخر، جمادى الأولى، جمادى الآخرة، رجب، شعبان، رمضان، شوال، ذو القعدة، ذو الحجة)، تحويل التاريخ بين الهجري والميلادي، اتجاه القبلة نحو الكعبة المشرفة، حاسبة الزكاة، والأدعية والأذكار الصحيحة من الكتاب والسنة.',
                    faqQ1: 'كيف تُحسب مواقيت الصلاة؟',
                    faqA1: 'تُحسب مواقيت الصلاة الخمس (الفجر، الظهر، العصر، المغرب، العشاء) بناءً على موقع الشمس بالنسبة لخط الأفق في موقعك الجغرافي. يُحدَّد وقت الفجر والعشاء بزاوية الشمس تحت الأفق (تتراوح بين 15° و 19° حسب طريقة الحساب).',
                    faqQ2: 'ما الفرق بين طرق الحساب المختلفة؟',
                    faqA2: 'تختلف طرق الحساب (رابطة العالم الإسلامي، أم القرى، الهيئة المصرية، ISNA) بشكل رئيسي في زاوية الفجر والعشاء. مثلاً: رابطة العالم الإسلامي تعتمد 18° للفجر و 17° للعشاء، بينما أم القرى تعتمد 18.5° للفجر وساعتين ونصف بعد المغرب للعشاء في رمضان.',
                    faqQ3: 'ما هو التقويم الهجري؟',
                    faqA3: 'التقويم الهجري هو تقويم قمري إسلامي يبدأ من هجرة النبي محمد ﷺ عام 622م. يتكوّن من 12 شهراً قمرياً (محرم، صفر، ربيع الأول، ربيع الآخر، جمادى الأولى، جمادى الآخرة، رجب، شعبان، رمضان، شوال، ذو القعدة، ذو الحجة) مجموع أيامه 354 أو 355 يومًا.',
                    faqQ4: 'كيف أحدّد اتجاه القبلة؟',
                    faqA4: 'اتجاه القبلة هو الاتجاه الذي يواجهه المسلم في صلاته نحو الكعبة المشرفة في مكة المكرمة. يُحسب بمعرفة إحداثيات موقعك (خط الطول والعرض) وإحداثيات الكعبة (21.422487° شمالاً، 39.826206° شرقاً) باستخدام حساب الزوايا الكروي (Great Circle).',
                    faqQ5: 'هل مواقيت الصلاة المعروضة دقيقة؟',
                    faqA5: 'نعم، المواقيت تُحسب بخوارزميات فلكية دقيقة معتمدة على موقع الشمس الحقيقي في السماء. قد تختلف بدقيقتين أو ثلاث عن مواقيت الهيئات الرسمية في بعض الدول بسبب اختلاف طريقة الحساب — لذا نُتيح اختيار طريقة الحساب المفضّلة لديك من الإعدادات.',
                    faqQ6: 'ما هي ساعات الصيام في رمضان؟',
                    faqA6: 'ساعات الصيام هي الفترة من طلوع الفجر الصادق حتى غروب الشمس (أذان المغرب). تختلف من مدينة لأخرى حسب خط العرض والفصل السنوي. مثلاً: في مكة المكرمة ~14-15 ساعة، في القاهرة ~15 ساعة، في إسطنبول ~16-17 ساعة، في شمال أوروبا قد تصل إلى 19 ساعة.',
                },
                en: {
                    worldCities: 'Cities Worldwide', upcomingPrayer: 'Upcoming Prayer',
                    setLocation: 'Set your location to view times', variesByLocation: 'Varies by location',
                    towardsMecca: 'Toward Mecca', currentMoonPhase: "Today's moon phase",
                    setLocationInfo: 'Set your location for full info',
                    aboutTitle: 'About Prayer Times Site',
                    aboutP1: 'Prayer Times & Hijri Calendar website provides an accurate daily schedule for the five prayers (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) in over 50,000 cities worldwide, using your GPS coordinates or manual city search.',
                    aboutP2: 'The site supports globally recognized calculation methods: Muslim World League, Umm al-Qura (Mecca), Egyptian General Authority of Survey, Islamic Society of North America (ISNA), plus Shafi/Hanafi juristic options for Asr prayer calculation.',
                    aboutP3: 'Beyond today\'s prayer times, the site offers integrated Islamic tools: the Hijri calendar with its twelve months (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sha\'ban, Ramadan, Shawwal, Dhu al-Qi\'dah, Dhu al-Hijjah), Hijri-Gregorian date converter, Qibla direction to the Kaaba, Zakat calculator, and authentic duas and adhkar from the Quran and Sunnah.',
                    faqQ1: 'How are prayer times calculated?',
                    faqA1: 'The five prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) are calculated based on the sun\'s position relative to your horizon. Fajr and Isha times are determined by the sun\'s angle below the horizon (between 15° and 19° depending on the calculation method).',
                    faqQ2: 'What is the difference between calculation methods?',
                    faqA2: 'Calculation methods (Muslim World League, Umm al-Qura, Egyptian Authority, ISNA) differ primarily in Fajr and Isha angles. For example: MWL uses 18° for Fajr and 17° for Isha, while Umm al-Qura uses 18.5° for Fajr and 90 minutes after Maghrib for Isha (120 minutes in Ramadan).',
                    faqQ3: 'What is the Hijri calendar?',
                    faqA3: 'The Hijri calendar is a lunar Islamic calendar that began with Prophet Muhammad\'s migration (Hijra) in 622 AD. It consists of 12 lunar months (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sha\'ban, Ramadan, Shawwal, Dhu al-Qi\'dah, Dhu al-Hijjah) totaling 354 or 355 days.',
                    faqQ4: 'How is Qibla direction determined?',
                    faqA4: 'Qibla is the direction Muslims face during prayer, toward the Kaaba in Mecca. It is calculated from your location coordinates (latitude and longitude) and the Kaaba coordinates (21.422487°N, 39.826206°E) using Great Circle bearing calculation.',
                    faqQ5: 'Are the displayed prayer times accurate?',
                    faqA5: 'Yes, times are calculated using precise astronomical algorithms based on the real position of the sun. They may differ by 2-3 minutes from official national bodies due to calculation method differences — so we offer the option to choose your preferred method in Settings.',
                    faqQ6: 'What are fasting hours in Ramadan?',
                    faqA6: 'Fasting hours span from true dawn (Fajr) to sunset (Maghrib). Duration varies by city based on latitude and season. For example: Mecca ~14-15 hours, Cairo ~15 hours, Istanbul ~16-17 hours, and in northern Europe it may reach 19 hours.',
                },
                fr: {
                    worldCities: 'Villes du Monde', upcomingPrayer: 'Prochaine prière',
                    setLocation: 'Définissez votre localisation', variesByLocation: 'Varie selon la localisation',
                    towardsMecca: 'Vers La Mecque', currentMoonPhase: "Phase lunaire aujourd'hui",
                    setLocationInfo: 'Définissez votre localisation pour voir les infos',
                    aboutTitle: 'À propos du site Heures de prière',
                    aboutP1: "Le site Heures de prière et Calendrier Hégirien fournit un horaire quotidien précis des cinq prières (Fajr, Dhuhr, Asr, Maghrib, Isha) dans plus de 50 000 villes du monde, en utilisant vos coordonnées GPS ou la recherche manuelle de ville.",
                    aboutP2: "Le site prend en charge les méthodes de calcul reconnues mondialement : Ligue Islamique Mondiale, Umm al-Qura (La Mecque), Autorité Égyptienne, ISNA, avec options juristiques Shafi/Hanafi pour Asr.",
                    aboutP3: "Au-delà des heures de prière, le site offre des outils islamiques intégrés : calendrier hégirien (Muharram, Safar, Rabi' al-Awwal, Rabi' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sha'ban, Ramadan, Shawwal, Dhu al-Qi'dah, Dhu al-Hijjah), convertisseur de date, direction de la Qibla vers la Kaaba, calculateur de Zakat, et douas et adhkar authentiques.",
                    faqQ1: 'Comment les heures de prière sont-elles calculées ?',
                    faqA1: "Les cinq heures de prière (Fajr, Dhuhr, Asr, Maghrib, Isha) sont calculées en fonction de la position du soleil par rapport à votre horizon. Fajr et Isha dépendent de l'angle du soleil sous l'horizon (entre 15° et 19° selon la méthode).",
                    faqQ2: 'Quelle est la différence entre les méthodes de calcul ?',
                    faqA2: 'Les méthodes (Ligue Islamique Mondiale, Umm al-Qura, Égyptienne, ISNA) diffèrent principalement par les angles de Fajr et Isha. Ex : MWL utilise 18° Fajr / 17° Isha ; Umm al-Qura utilise 18,5° Fajr et 90 min après Maghrib pour Isha (120 min en Ramadan).',
                    faqQ3: 'Quel est le calendrier hégirien ?',
                    faqA3: "Le calendrier hégirien est un calendrier lunaire islamique qui a débuté avec l'Hégire du Prophète Muhammad en 622 ap. J.-C. Il comprend 12 mois lunaires totalisant 354 ou 355 jours.",
                    faqQ4: 'Comment détermine-t-on la direction de la Qibla ?',
                    faqA4: "La Qibla est la direction de la Kaaba à La Mecque. Elle est calculée à partir de vos coordonnées (latitude/longitude) et des coordonnées de la Kaaba (21,422487°N, 39,826206°E) par la méthode du Grand Cercle.",
                    faqQ5: 'Les heures affichées sont-elles précises ?',
                    faqA5: "Oui, les heures sont calculées par des algorithmes astronomiques précis basés sur la position réelle du soleil. Elles peuvent varier de 2-3 minutes par rapport aux autorités officielles selon la méthode.",
                    faqQ6: 'Quelles sont les heures de jeûne en Ramadan ?',
                    faqA6: "Les heures de jeûne s'étendent de l'aube vraie (Fajr) au coucher (Maghrib). La Mecque ~14-15 h, Le Caire ~15 h, Istanbul ~16-17 h, nord de l'Europe jusqu'à 19 h.",
                },
                tr: {
                    worldCities: 'Dünya Şehirleri', upcomingPrayer: 'Sonraki Namaz',
                    setLocation: 'Vakitleri görmek için konumunuzu belirleyin', variesByLocation: 'Konuma göre değişir',
                    towardsMecca: "Kâbe'ye doğru", currentMoonPhase: 'Bugünkü ay fazı',
                    setLocationInfo: 'Tam bilgi için konum belirleyin',
                    aboutTitle: 'Namaz Vakitleri Hakkında',
                    aboutP1: 'Namaz Vakitleri ve Hicri Takvim sitesi, dünya genelinde 50.000\'den fazla şehir için beş vakit namazı (Fecir, Öğle, İkindi, Akşam, Yatsı) GPS koordinatları veya manuel şehir araması kullanarak sunar.',
                    aboutP2: "Site, dünya çapında tanınan hesaplama yöntemlerini destekler: Müslüman Dünya Birliği, Ümmü'l-Kura (Mekke), Mısır Otoritesi, ISNA; ayrıca İkindi için Şafi/Hanefi seçenekleri.",
                    aboutP3: "Namaz vakitlerinin yanı sıra site, Hicri takvim (Muharrem, Safer, Rabiülevvel, Rabiülahir, Cemaziyelevvel, Cemaziyelahir, Recep, Şaban, Ramazan, Şevval, Zilkade, Zilhicce), tarih dönüştürücü, Kâbe yönünde kıble, zekât hesaplayıcı ve sahih dualar sunar.",
                    faqQ1: 'Namaz vakitleri nasıl hesaplanır?',
                    faqA1: "Beş vakit namaz (Fecir, Öğle, İkindi, Akşam, Yatsı) güneşin ufka göre konumuna göre hesaplanır. Fecir ve Yatsı, güneşin ufkun altındaki açısıyla belirlenir (yönteme göre 15°-19° arası).",
                    faqQ2: 'Hesaplama yöntemleri arasındaki fark nedir?',
                    faqA2: "Yöntemler (MWL, Ümmü'l-Kura, Mısır, ISNA) esas olarak Fecir ve Yatsı açılarında farklıdır. Örneğin MWL Fecir için 18°, Yatsı için 17° kullanır.",
                    faqQ3: 'Hicri takvim nedir?',
                    faqA3: "Hicri takvim, Hz. Muhammed'in 622'deki hicretiyle başlayan ay takvimidir. 12 aydan oluşur, toplam 354 veya 355 gündür.",
                    faqQ4: 'Kıble yönü nasıl belirlenir?',
                    faqA4: "Kıble, Mekke'deki Kâbe yönüdür. Koordinatlarınız ve Kâbe koordinatları (21,422487°K, 39,826206°D) kullanılarak Büyük Daire yöntemiyle hesaplanır.",
                    faqQ5: 'Gösterilen namaz vakitleri doğru mu?',
                    faqA5: 'Evet, vakitler güneşin gerçek konumuna dayalı hassas astronomik algoritmalarla hesaplanır. Yöntem farklılıklarından dolayı resmi kurumlarla 2-3 dakika fark olabilir.',
                    faqQ6: 'Ramazan oruç süreleri nedir?',
                    faqA6: 'Oruç süresi gerçek şafaktan (Fecir) güneş batımına (Akşam) kadardır. Mekke ~14-15 saat, Kahire ~15 saat, İstanbul ~16-17 saat, Kuzey Avrupa 19 saate kadar.',
                },
                ur: {
                    worldCities: 'دنیا کے شہر', upcomingPrayer: 'اگلی نماز',
                    setLocation: 'اوقات دیکھنے کے لیے اپنا مقام طے کریں', variesByLocation: 'مقام کے مطابق مختلف',
                    towardsMecca: 'مکہ مکرمہ کی طرف', currentMoonPhase: 'آج چاند کا طور',
                    setLocationInfo: 'مکمل معلومات کے لیے اپنا مقام طے کریں',
                    aboutTitle: 'اوقاتِ نماز سائٹ کے بارے میں',
                    aboutP1: 'اوقاتِ نماز اور ہجری کیلنڈر سائٹ دنیا بھر کے 50,000 سے زائد شہروں میں پانچوں نمازوں (فجر، ظہر، عصر، مغرب، عشاء) کا درست روزانہ شیڈول آپ کے GPS کوآرڈینیٹس یا دستی شہر تلاش کے ذریعے فراہم کرتی ہے۔',
                    aboutP2: 'سائٹ عالمی سطح پر تسلیم شدہ حساب کے طریقوں کی حمایت کرتی ہے: مسلم ورلڈ لیگ، ام القریٰ (مکہ)، مصری اتھارٹی، ISNA؛ علاوہ ازیں عصر کے لیے شافعی/حنفی اختیارات۔',
                    aboutP3: 'اوقاتِ نماز کے علاوہ، سائٹ مربوط اسلامی ٹولز پیش کرتی ہے: ہجری کیلنڈر (محرم، صفر، ربیع الاول، ربیع الآخر، جمادی الاولیٰ، جمادی الآخرہ، رجب، شعبان، رمضان، شوال، ذوالقعدہ، ذوالحجہ)، تاریخ کنورٹر، کعبہ کی طرف قبلہ، زکاۃ کیلکولیٹر، اور صحیح دعائیں اور اذکار۔',
                    faqQ1: 'اوقاتِ نماز کیسے شمار ہوتے ہیں؟',
                    faqA1: 'پانچوں اوقاتِ نماز (فجر، ظہر، عصر، مغرب، عشاء) سورج کی آپ کے افق کے نسبت پوزیشن پر شمار ہوتے ہیں۔ فجر اور عشاء افق کے نیچے سورج کے زاویے سے طے ہوتے ہیں (15°-19° کے درمیان)۔',
                    faqQ2: 'حساب کے طریقوں میں کیا فرق ہے؟',
                    faqA2: 'طریقے (مسلم ورلڈ لیگ، ام القریٰ، مصری، ISNA) بنیادی طور پر فجر اور عشاء کے زاویوں میں مختلف ہیں۔',
                    faqQ3: 'ہجری کیلنڈر کیا ہے؟',
                    faqA3: 'ہجری کیلنڈر ایک قمری اسلامی کیلنڈر ہے جو 622 عیسوی میں نبی محمد ﷺ کی ہجرت سے شروع ہوا۔ 12 قمری مہینوں پر مشتمل ہے، کل 354 یا 355 دن۔',
                    faqQ4: 'قبلہ کی سمت کیسے طے ہوتی ہے؟',
                    faqA4: 'قبلہ مکہ مکرمہ میں کعبہ کی طرف رخ ہے۔ آپ کے کوآرڈینیٹس اور کعبہ کے کوآرڈینیٹس (21.422487°N، 39.826206°E) سے عظیم دائرہ طریقے سے شمار ہوتا ہے۔',
                    faqQ5: 'دکھائے گئے اوقاتِ نماز درست ہیں؟',
                    faqA5: 'جی ہاں، اوقات سورج کی حقیقی پوزیشن پر مبنی درست فلکیاتی الگورتھمز سے شمار ہوتے ہیں۔ طریقہ کار کے فرق کی وجہ سے 2-3 منٹ کا فرق ہو سکتا ہے۔',
                    faqQ6: 'رمضان میں روزے کے اوقات کیا ہیں؟',
                    faqA6: 'روزے کا دورانیہ حقیقی فجر سے مغرب تک ہوتا ہے۔ مکہ ~14-15 گھنٹے، قاہرہ ~15 گھنٹے، استنبول ~16-17 گھنٹے، شمالی یورپ 19 گھنٹے تک۔',
                },
                de: {
                    worldCities: 'Städte weltweit', upcomingPrayer: 'Nächstes Gebet',
                    setLocation: 'Legen Sie Ihren Standort fest, um die Zeiten anzuzeigen', variesByLocation: 'Variiert je nach Standort',
                    towardsMecca: 'Richtung Mekka', currentMoonPhase: 'Heutige Mondphase',
                    setLocationInfo: 'Legen Sie Ihren Standort fest, um alle Informationen anzuzeigen',
                    aboutTitle: 'Über die Webseite Gebetszeiten',
                    aboutP1: 'Die Webseite Gebetszeiten und Hidschri-Kalender bietet einen präzisen täglichen Zeitplan für die fünf Pflichtgebete (Fajr, Sonnenaufgang, Dhuhr, Asr, Maghrib, Isha) in über 50.000 Städten weltweit, basierend auf Ihren GPS-Koordinaten oder der manuellen Stadtsuche.',
                    aboutP2: "Die Seite unterstützt weltweit anerkannte Berechnungsmethoden: Muslimische Weltliga, Umm al-Qura (Mekka), Ägyptische Generalbehörde für Vermessung, Islamische Gesellschaft Nordamerikas (ISNA), sowie schafiitische/hanafitische Rechtsschul-Optionen für die Berechnung des Asr-Gebets.",
                    aboutP3: "Neben den Gebetszeiten bietet die Seite integrierte islamische Werkzeuge: Den Hidschri-Kalender mit seinen zwölf Monaten (Muharram, Safar, Rabi' al-Awwal, Rabi' al-Thani, Dschumada al-Ula, Dschumada al-Thani, Radschab, Schaban, Ramadan, Schawwal, Dhul-Qa'da, Dhul-Hidscha), Datumsumrechnung zwischen Hidschri und Gregorianisch, Qibla-Richtung zur Kaaba, Zakat-Rechner sowie authentische Duas und Adhkar aus Koran und Sunna.",
                    faqQ1: 'Wie werden die Gebetszeiten berechnet?',
                    faqA1: 'Die fünf Gebetszeiten (Fajr, Dhuhr, Asr, Maghrib, Isha) werden anhand der Position der Sonne relativ zu Ihrem Horizont berechnet. Fajr und Isha werden durch den Winkel der Sonne unter dem Horizont bestimmt (je nach Methode zwischen 15° und 19°).',
                    faqQ2: 'Was ist der Unterschied zwischen den Berechnungsmethoden?',
                    faqA2: "Die Methoden (Muslimische Weltliga, Umm al-Qura, Ägyptische Behörde, ISNA) unterscheiden sich hauptsächlich in den Fajr- und Isha-Winkeln. Beispiel: MWL verwendet 18° für Fajr und 17° für Isha, während Umm al-Qura 18,5° für Fajr und 90 Minuten nach Maghrib für Isha verwendet (120 Minuten im Ramadan).",
                    faqQ3: 'Was ist der Hidschri-Kalender?',
                    faqA3: "Der Hidschri-Kalender ist ein islamischer Mondkalender, der mit der Auswanderung (Hidschra) des Propheten Mohammed im Jahr 622 n. Chr. begann. Er besteht aus 12 Mondmonaten (Muharram, Safar, Rabi' al-Awwal, Rabi' al-Thani, Dschumada al-Ula, Dschumada al-Thani, Radschab, Schaban, Ramadan, Schawwal, Dhul-Qa'da, Dhul-Hidscha) und umfasst insgesamt 354 oder 355 Tage.",
                    faqQ4: 'Wie wird die Qibla-Richtung bestimmt?',
                    faqA4: 'Die Qibla ist die Richtung, in die Muslime während des Gebets zur Kaaba in Mekka blicken. Sie wird aus Ihren Standortkoordinaten (Breiten- und Längengrad) und den Koordinaten der Kaaba (21,422487°N, 39,826206°O) mittels Großkreisberechnung ermittelt.',
                    faqQ5: 'Sind die angezeigten Gebetszeiten genau?',
                    faqA5: 'Ja, die Zeiten werden mit präzisen astronomischen Algorithmen berechnet, die auf der tatsächlichen Position der Sonne basieren. Sie können aufgrund unterschiedlicher Berechnungsmethoden um 2-3 Minuten von offiziellen nationalen Stellen abweichen — daher bieten wir die Möglichkeit, Ihre bevorzugte Methode in den Einstellungen zu wählen.',
                    faqQ6: 'Wie lang sind die Fastenzeiten im Ramadan?',
                    faqA6: 'Die Fastenzeiten reichen vom wahren Morgengrauen (Fajr) bis zum Sonnenuntergang (Maghrib). Die Dauer variiert je nach Stadt abhängig von Breitengrad und Jahreszeit. Beispiel: Mekka ~14-15 Stunden, Kairo ~15 Stunden, Istanbul ~16-17 Stunden, im Norden Europas können es bis zu 19 Stunden sein.',
                },
                id: {
                    worldCities: 'Kota-Kota Dunia', upcomingPrayer: 'Sholat Berikutnya',
                    setLocation: 'Tetapkan lokasi Anda untuk melihat waktu', variesByLocation: 'Bervariasi menurut lokasi',
                    towardsMecca: 'Menuju Mekkah', currentMoonPhase: 'Fase bulan hari ini',
                    setLocationInfo: 'Tetapkan lokasi Anda untuk melihat informasi lengkap',
                    aboutTitle: 'Tentang Situs Jadwal Sholat',
                    aboutP1: 'Situs Jadwal Sholat dan Kalender Hijriyah menyediakan jadwal harian yang akurat untuk lima waktu sholat (Subuh, Matahari Terbit, Zuhur, Asar, Magrib, Isya) di lebih dari 50.000 kota di seluruh dunia, menggunakan koordinat GPS Anda atau pencarian kota secara manual.',
                    aboutP2: 'Situs ini mendukung metode perhitungan yang diakui secara global: Liga Dunia Muslim, Umm al-Qura (Mekkah), Otoritas Umum Mesir, Islamic Society of North America (ISNA), ditambah opsi mazhab Syafi\'i/Hanafi untuk perhitungan waktu sholat Asar.',
                    aboutP3: 'Selain jadwal sholat hari ini, situs ini menawarkan perangkat Islam terpadu: kalender Hijriyah dengan dua belas bulannya (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sya\'ban, Ramadan, Syawal, Dzulkaidah, Dzulhijah), konverter tanggal Hijriyah-Masehi, arah Kiblat menuju Ka\'bah, kalkulator Zakat, serta doa dan dzikir otentik dari Al-Qur\'an dan Sunnah.',
                    faqQ1: 'Bagaimana jadwal sholat dihitung?',
                    faqA1: 'Lima waktu sholat (Subuh, Zuhur, Asar, Magrib, Isya) dihitung berdasarkan posisi matahari terhadap cakrawala Anda. Waktu Subuh dan Isya ditentukan oleh sudut matahari di bawah cakrawala (antara 15° dan 19° tergantung pada metode perhitungan).',
                    faqQ2: 'Apa perbedaan antara metode perhitungan?',
                    faqA2: 'Metode perhitungan (Liga Dunia Muslim, Umm al-Qura, Otoritas Mesir, ISNA) berbeda terutama pada sudut Subuh dan Isya. Contoh: MWL menggunakan 18° untuk Subuh dan 17° untuk Isya, sementara Umm al-Qura menggunakan 18,5° untuk Subuh dan 90 menit setelah Magrib untuk Isya (120 menit di bulan Ramadan).',
                    faqQ3: 'Apa itu kalender Hijriyah?',
                    faqA3: 'Kalender Hijriyah adalah kalender lunar Islam yang dimulai dengan hijrahnya Nabi Muhammad ﷺ pada tahun 622 M. Kalender ini terdiri dari 12 bulan lunar (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sya\'ban, Ramadan, Syawal, Dzulkaidah, Dzulhijah) dengan total 354 atau 355 hari.',
                    faqQ4: 'Bagaimana arah Kiblat ditentukan?',
                    faqA4: 'Kiblat adalah arah yang dihadap umat Muslim saat sholat, menuju Ka\'bah di Mekkah. Arah Kiblat dihitung dari koordinat lokasi Anda (lintang dan bujur) dan koordinat Ka\'bah (21,422487°LU, 39,826206°BT) menggunakan perhitungan Great Circle bearing.',
                    faqQ5: 'Apakah jadwal sholat yang ditampilkan akurat?',
                    faqA5: 'Ya, waktu dihitung menggunakan algoritma astronomi yang presisi berdasarkan posisi matahari yang sebenarnya. Waktu mungkin berbeda 2-3 menit dari otoritas resmi nasional karena perbedaan metode perhitungan — karena itu kami menyediakan pilihan metode perhitungan di Pengaturan.',
                    faqQ6: 'Berapa lama jam puasa di bulan Ramadan?',
                    faqA6: 'Jam puasa dimulai dari fajar sejati (Subuh) hingga matahari terbenam (Magrib). Durasinya bervariasi menurut kota berdasarkan lintang dan musim. Contoh: Mekkah ~14-15 jam, Kairo ~15 jam, Istanbul ~16-17 jam, di Eropa utara bisa mencapai 19 jam.',
                },
                es: {
                    worldCities: 'Ciudades del Mundo', upcomingPrayer: 'Próxima Oración',
                    setLocation: 'Establece tu ubicación para ver los horarios', variesByLocation: 'Varía según la ubicación',
                    towardsMecca: 'Hacia La Meca', currentMoonPhase: 'Fase lunar de hoy',
                    setLocationInfo: 'Establece tu ubicación para ver la información completa',
                    aboutTitle: 'Acerca del sitio Horarios de Oración',
                    aboutP1: 'El sitio Horarios de Oración y Calendario Hijri ofrece un horario diario preciso para las cinco oraciones (Fayr, Amanecer, Dhuhr, Asr, Magrib, Isha) en más de 50 000 ciudades del mundo, utilizando tus coordenadas GPS o la búsqueda manual por nombre de ciudad.',
                    aboutP2: 'El sitio admite métodos de cálculo reconocidos mundialmente: Liga Mundial Musulmana, Umm al-Qura (La Meca), Autoridad General Egipcia, Islamic Society of North America (ISNA), además de las opciones jurídicas Shafi\'i/Hanafi para el cálculo del Asr.',
                    aboutP3: 'Además de los horarios de oración de hoy, el sitio ofrece herramientas islámicas integradas: el calendario Hijri con sus doce meses (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Yumada al-Awwal, Yumada al-Thani, Rayab, Sha\'ban, Ramadán, Shawwal, Dhu al-Qi\'dah, Dhu al-Hiyyah), conversor de fechas Hijri-Gregoriano, dirección de la Qibla hacia la Kaaba, calculadora de Zakat y duas y adhkar auténticos del Corán y la Sunna.',
                    faqQ1: '¿Cómo se calculan los horarios de oración?',
                    faqA1: 'Las cinco oraciones (Fayr, Dhuhr, Asr, Magrib, Isha) se calculan según la posición del sol respecto a tu horizonte. Los horarios de Fayr e Isha se determinan por el ángulo del sol bajo el horizonte (entre 15° y 19° según el método de cálculo).',
                    faqQ2: '¿Cuál es la diferencia entre los métodos de cálculo?',
                    faqA2: 'Los métodos (Liga Mundial Musulmana, Umm al-Qura, Autoridad Egipcia, ISNA) difieren principalmente en los ángulos de Fayr e Isha. Por ejemplo: MWL usa 18° para Fayr y 17° para Isha, mientras que Umm al-Qura usa 18,5° para Fayr y 90 minutos después del Magrib para Isha (120 minutos en Ramadán).',
                    faqQ3: '¿Qué es el calendario Hijri?',
                    faqA3: 'El calendario Hijri es un calendario lunar islámico que comenzó con la Hégira del Profeta Muhammad ﷺ en el año 622 d.C. Consta de 12 meses lunares (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Yumada al-Awwal, Yumada al-Thani, Rayab, Sha\'ban, Ramadán, Shawwal, Dhu al-Qi\'dah, Dhu al-Hiyyah) con un total de 354 o 355 días.',
                    faqQ4: '¿Cómo se determina la dirección de la Qibla?',
                    faqA4: 'La Qibla es la dirección hacia la Kaaba en La Meca que los musulmanes encaran durante la oración. Se calcula a partir de tus coordenadas (latitud y longitud) y las de la Kaaba (21,422487°N, 39,826206°E) mediante el cálculo del rumbo de gran círculo.',
                    faqQ5: '¿Son precisos los horarios de oración mostrados?',
                    faqA5: 'Sí, los horarios se calculan con algoritmos astronómicos precisos basados en la posición real del sol. Pueden variar 2-3 minutos respecto a las autoridades oficiales nacionales debido a diferencias en el método de cálculo — por eso ofrecemos la opción de elegir tu método preferido en los Ajustes.',
                    faqQ6: '¿Cuántas son las horas de ayuno en Ramadán?',
                    faqA6: 'Las horas de ayuno van desde el amanecer verdadero (Fayr) hasta la puesta del sol (Magrib). La duración varía según la ciudad, según la latitud y la estación. Por ejemplo: La Meca ~14-15 horas, El Cairo ~15 horas, Estambul ~16-17 horas, y en el norte de Europa puede llegar a 19 horas.',
                },
                bn: {
                    worldCities: 'বিশ্বের শহরসমূহ', upcomingPrayer: 'পরবর্তী নামাজ',
                    setLocation: 'সময়সূচী দেখতে আপনার অবস্থান নির্ধারণ করুন', variesByLocation: 'অবস্থান অনুযায়ী পরিবর্তিত',
                    towardsMecca: 'মক্কার দিকে', currentMoonPhase: 'আজকের চাঁদের পর্যায়',
                    setLocationInfo: 'সম্পূর্ণ তথ্য দেখতে আপনার অবস্থান নির্ধারণ করুন',
                    aboutTitle: 'নামাজের সময়সূচী ওয়েবসাইট সম্পর্কে',
                    aboutP1: 'নামাজের সময়সূচী ও হিজরি ক্যালেন্ডার ওয়েবসাইট বিশ্বজুড়ে ৫০,০০০-এর বেশি শহরের জন্য পাঁচ ওয়াক্ত নামাজের (ফজর, সূর্যোদয়, জোহর, আসর, মাগরিব, এশা) সঠিক দৈনিক সময়সূচী সরবরাহ করে, আপনার GPS স্থানাঙ্ক বা ম্যানুয়াল শহর অনুসন্ধানের ভিত্তিতে।',
                    aboutP2: 'এই সাইটটি বিশ্বব্যাপী স্বীকৃত গণনা পদ্ধতি সমর্থন করে: মুসলিম ওয়ার্ল্ড লীগ, উম্মুল কুরা (মক্কা), মিশরের সাধারণ কর্তৃপক্ষ, Islamic Society of North America (ISNA), এবং আসরের সময় গণনার জন্য শাফেয়ী/হানাফি মাজহাব বিকল্প।',
                    aboutP3: 'আজকের নামাজের সময় ছাড়াও, সাইটটি সমন্বিত ইসলামী সরঞ্জাম অফার করে: বারো মাসের হিজরি ক্যালেন্ডার (মহররম, সফর, রবিউল আউয়াল, রবিউস সানি, জমাদিউল আউয়াল, জমাদিউস সানি, রজব, শাবান, রমজান, শাওয়াল, জিলকদ, জিলহজ), হিজরি-গ্রেগরিয়ান তারিখ রূপান্তরকারী, কাবার দিকে কিবলার দিক, যাকাত ক্যালকুলেটর এবং কুরআন ও সুন্নাহ থেকে সহীহ দোয়া ও জিকির।',
                    faqQ1: 'নামাজের সময়সূচী কীভাবে গণনা করা হয়?',
                    faqA1: 'পাঁচ ওয়াক্ত নামাজ (ফজর, জোহর, আসর, মাগরিব, এশা) আপনার দিগন্তের সাপেক্ষে সূর্যের অবস্থানের ভিত্তিতে গণনা করা হয়। ফজর ও এশার সময় দিগন্তের নিচে সূর্যের কোণ দ্বারা নির্ধারিত হয় (গণনা পদ্ধতি অনুযায়ী ১৫° থেকে ১৯° এর মধ্যে)।',
                    faqQ2: 'বিভিন্ন গণনা পদ্ধতির মধ্যে পার্থক্য কী?',
                    faqA2: 'গণনা পদ্ধতি (মুসলিম ওয়ার্ল্ড লীগ, উম্মুল কুরা, মিশরীয় কর্তৃপক্ষ, ISNA) প্রধানত ফজর ও এশার কোণে পার্থক্য রাখে। উদাহরণস্বরূপ: MWL ফজরের জন্য ১৮° এবং এশার জন্য ১৭° ব্যবহার করে, যেখানে উম্মুল কুরা ফজরের জন্য ১৮.৫° এবং এশার জন্য মাগরিবের ৯০ মিনিট পরে (রমজানে ১২০ মিনিট) ব্যবহার করে।',
                    faqQ3: 'হিজরি ক্যালেন্ডার কী?',
                    faqA3: 'হিজরি ক্যালেন্ডার একটি চান্দ্র ইসলামিক ক্যালেন্ডার যা ৬২২ খ্রিস্টাব্দে নবী মুহাম্মদ ﷺ-এর হিজরত থেকে শুরু হয়েছিল। এটি ১২টি চান্দ্র মাস নিয়ে গঠিত (মহররম, সফর, রবিউল আউয়াল, রবিউস সানি, জমাদিউল আউয়াল, জমাদিউস সানি, রজব, শাবান, রমজান, শাওয়াল, জিলকদ, জিলহজ) মোট ৩৫৪ বা ৩৫৫ দিন।',
                    faqQ4: 'কিবলার দিক কীভাবে নির্ধারণ করা হয়?',
                    faqA4: 'কিবলা হলো সেই দিক যেদিকে মুসলিমরা নামাজের সময় মুখ ফেরায়, মক্কার কাবার দিকে। এটি আপনার অবস্থানের স্থানাঙ্ক (অক্ষাংশ ও দ্রাঘিমাংশ) এবং কাবার স্থানাঙ্ক (২১.৪২২৪৮৭°N, ৩৯.৮২৬২০৬°E) থেকে Great Circle bearing গণনা ব্যবহার করে নির্ণয় করা হয়।',
                    faqQ5: 'প্রদর্শিত নামাজের সময়সূচী কি সঠিক?',
                    faqA5: 'হ্যাঁ, সময় সূর্যের প্রকৃত অবস্থানের ভিত্তিতে সুনির্দিষ্ট জ্যোতির্বিদ্যা অ্যালগরিদম ব্যবহার করে গণনা করা হয়। গণনা পদ্ধতির পার্থক্যের কারণে আনুষ্ঠানিক জাতীয় কর্তৃপক্ষের থেকে ২-৩ মিনিট ভিন্ন হতে পারে — তাই আমরা সেটিংসে আপনার পছন্দের পদ্ধতি নির্বাচন করার বিকল্প প্রদান করি।',
                    faqQ6: 'রমজানে রোজার সময় কত ঘণ্টা?',
                    faqA6: 'রোজার সময় প্রকৃত ফজর থেকে সূর্যাস্ত (মাগরিব) পর্যন্ত। সময়কাল অক্ষাংশ এবং ঋতুর উপর নির্ভর করে শহর ভেদে পরিবর্তিত হয়। উদাহরণস্বরূপ: মক্কা ~১৪-১৫ ঘণ্টা, কায়রো ~১৫ ঘণ্টা, ইস্তাম্বুল ~১৬-১৭ ঘণ্টা, উত্তর ইউরোপে ১৯ ঘণ্টা পর্যন্ত হতে পারে।',
                },
                ms: {
                    worldCities: 'Bandar Dunia', upcomingPrayer: 'Solat Seterusnya',
                    setLocation: 'Tetapkan lokasi anda untuk melihat waktu', variesByLocation: 'Berbeza mengikut lokasi',
                    towardsMecca: 'Ke arah Makkah', currentMoonPhase: 'Fasa bulan hari ini',
                    setLocationInfo: 'Tetapkan lokasi anda untuk melihat maklumat penuh',
                    aboutTitle: 'Mengenai Laman Waktu Solat',
                    aboutP1: 'Laman Waktu Solat dan Kalendar Hijrah menyediakan jadual harian yang tepat untuk lima waktu solat (Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak) di lebih 50,000 bandar seluruh dunia, menggunakan koordinat GPS anda atau carian bandar secara manual.',
                    aboutP2: 'Laman ini menyokong kaedah pengiraan yang diiktiraf di peringkat global: Liga Dunia Muslim, Umm al-Qura (Makkah), Pihak Berkuasa Am Mesir, Islamic Society of North America (ISNA), serta pilihan mazhab Syafie/Hanafi untuk pengiraan waktu Asar.',
                    aboutP3: 'Selain waktu solat hari ini, laman ini menawarkan alatan Islam bersepadu: Kalendar Hijrah dengan dua belas bulannya (Muharram, Safar, Rabiulawal, Rabiulakhir, Jamadilawal, Jamadilakhir, Rejab, Syaaban, Ramadan, Syawal, Zulkaedah, Zulhijah), penukar tarikh Hijrah-Masihi, arah Kiblat ke Kaabah, kalkulator Zakat, serta doa dan zikir sahih daripada Al-Quran dan Sunnah.',
                    faqQ1: 'Bagaimana waktu solat dikira?',
                    faqA1: 'Lima waktu solat (Subuh, Zohor, Asar, Maghrib, Isyak) dikira berdasarkan kedudukan matahari berbanding ufuk anda. Waktu Subuh dan Isyak ditentukan oleh sudut matahari di bawah ufuk (antara 15° dan 19° bergantung kepada kaedah pengiraan).',
                    faqQ2: 'Apakah perbezaan antara kaedah pengiraan?',
                    faqA2: 'Kaedah pengiraan (Liga Dunia Muslim, Umm al-Qura, Pihak Berkuasa Mesir, ISNA) berbeza terutamanya pada sudut Subuh dan Isyak. Contoh: MWL menggunakan 18° untuk Subuh dan 17° untuk Isyak, manakala Umm al-Qura menggunakan 18.5° untuk Subuh dan 90 minit selepas Maghrib untuk Isyak (120 minit pada bulan Ramadan).',
                    faqQ3: 'Apakah kalendar Hijrah?',
                    faqA3: 'Kalendar Hijrah ialah kalendar lunar Islam yang bermula dengan penghijrahan Nabi Muhammad ﷺ pada 622 Masihi. Ia terdiri daripada 12 bulan lunar (Muharram, Safar, Rabiulawal, Rabiulakhir, Jamadilawal, Jamadilakhir, Rejab, Syaaban, Ramadan, Syawal, Zulkaedah, Zulhijah) dengan jumlah 354 atau 355 hari.',
                    faqQ4: 'Bagaimana arah Kiblat ditentukan?',
                    faqA4: 'Kiblat ialah arah yang dihadap oleh umat Islam semasa solat, menuju ke Kaabah di Makkah. Arah Kiblat dikira daripada koordinat lokasi anda (latitud dan longitud) dan koordinat Kaabah (21.422487°U, 39.826206°T) menggunakan pengiraan Great Circle bearing.',
                    faqQ5: 'Adakah waktu solat yang dipaparkan tepat?',
                    faqA5: 'Ya, waktu dikira menggunakan algoritma astronomi yang tepat berdasarkan kedudukan sebenar matahari. Ia mungkin berbeza 2-3 minit daripada pihak berkuasa rasmi negara disebabkan perbezaan kaedah pengiraan — kerana itu kami menyediakan pilihan untuk memilih kaedah pilihan anda dalam Tetapan.',
                    faqQ6: 'Berapa lama waktu berpuasa dalam bulan Ramadan?',
                    faqA6: 'Waktu berpuasa adalah dari subuh sebenar (Subuh) hingga matahari terbenam (Maghrib). Tempohnya berbeza mengikut bandar berdasarkan latitud dan musim. Contoh: Makkah ~14-15 jam, Kaherah ~15 jam, Istanbul ~16-17 jam, di utara Eropah boleh mencapai 19 jam.',
                },
            }[Lh] || {};

            // —— تاريخ هجري + ميلادي للـ banner + info section ——
            const _hijriText = Lh === 'ar'
                ? `${_hN.day} ${_hMAr} ${_hY} هـ`
                : `${_hN.day} ${_hMEn} ${_hY} AH`;
            let _gregText;
            try {
                const localeMap = { ar: 'ar', en: 'en-US', fr: 'fr-FR', tr: 'tr-TR', ur: 'ur-PK', de: 'de-DE', id: 'id-ID', es: 'es-ES', bn: 'bn-BD', ms: 'ms-MY' };
                _gregText = new Date().toLocaleDateString(
                    localeMap[Lh] || 'en-US',
                    { day: 'numeric', month: 'long', year: 'numeric' }
                );
            } catch(e) { _gregText = `${_gNow2.getDate()} ${_GREG_MONTHS[Lh === 'ar' ? 'ar' : 'en'][_gMIdx]} ${_gY2}`; }

            // —— Banner placeholders ——
            html = html.replace(
                '<span id="banner-city-name">--</span>',
                `<span id="banner-city-name">${_escHtml(i18n.worldCities || '')}</span>`
            );
            html = html.replace(
                '<div class="banner-next-prayer-name" id="next-prayer-name">--</div>',
                `<div class="banner-next-prayer-name" id="next-prayer-name">${_escHtml(i18n.upcomingPrayer || '')}</div>`
            );
            html = html.replace(
                '<div class="banner-date-hijri" id="banner-hijri-date">--</div>',
                `<div class="banner-date-hijri" id="banner-hijri-date">${_escHtml(_hijriText)}</div>`
            );
            html = html.replace(
                '<div class="banner-date-greg" id="banner-greg-date">--</div>',
                `<div class="banner-date-greg" id="banner-greg-date">${_escHtml(_gregText)}</div>`
            );

            // —— Info section placeholders ——
            html = html.replace(
                '<div class="info-location" id="info-location">--</div>',
                `<div class="info-location" id="info-location">${_escHtml(i18n.setLocationInfo || '')}</div>`
            );
            html = html.replace(
                '<div class="info-value" id="info-hijri">--</div>',
                `<div class="info-value" id="info-hijri">${_escHtml(_hijriText)}</div>`
            );
            html = html.replace(
                '<div class="info-value" id="info-gregorian">--</div>',
                `<div class="info-value" id="info-gregorian">${_escHtml(_gregText)}</div>`
            );
            html = html.replace(
                '<div class="info-value" id="info-fasting">--</div>',
                `<div class="info-value" id="info-fasting">${_escHtml(i18n.variesByLocation || '')}</div>`
            );

            // —— Quick-access sub labels ——
            html = html.replace(
                '<div class="qa-sub" id="qa-hijri-date">--</div>',
                `<div class="qa-sub" id="qa-hijri-date">${_escHtml(_hijriText)}</div>`
            );
            html = html.replace(
                '<div class="qa-sub" id="qa-qibla-dir">--</div>',
                `<div class="qa-sub" id="qa-qibla-dir">${_escHtml(i18n.towardsMecca || '')}</div>`
            );
            html = html.replace(
                '<div class="qa-sub" id="qa-moon-phase">--</div>',
                `<div class="qa-sub" id="qa-moon-phase">${_escHtml(i18n.currentMoonPhase || '')}</div>`
            );

            // —— FAQ (نحافظ على IDs الأصلية faq-q1/faq-a1-intro/faq-times-list/faq-q2/faq-a2
            //      حتّى يستطيع updateFaqSection() الـ client-side استبدال Q1+Q2 بمحتوى خاصّ بالمدينة.
            //      Q3-Q6 جديدة بدون IDs — تبقى ثابتة كـ SEO content للـ LLM crawlers) ——
            const _faqHtml = i18n.faqQ1 ? `
                    <!-- س1 — ID محفوظ للـ JS -->
                    <div class="faq-item">
                        <div class="faq-question" id="faq-q1">${_escHtml(i18n.faqQ1)}</div>
                        <div class="faq-answer">
                            <p id="faq-a1-intro">${_escHtml(i18n.faqA1)}</p>
                            <ul class="faq-times-list" id="faq-times-list"></ul>
                        </div>
                    </div>
                    <div class="faq-divider"></div>
                    <!-- س2 — ID محفوظ للـ JS -->
                    <div class="faq-item">
                        <div class="faq-question" id="faq-q2">${_escHtml(i18n.faqQ2)}</div>
                        <div class="faq-answer">
                            <p id="faq-a2">${_escHtml(i18n.faqA2)}</p>
                        </div>
                    </div>
                    <div class="faq-divider"></div>
                    <!-- Q3-Q6 SEO-only (لا IDs، لا تُعدَّل من JS) -->
                    <div class="faq-item">
                        <div class="faq-question">${_escHtml(i18n.faqQ3)}</div>
                        <div class="faq-answer"><p>${_escHtml(i18n.faqA3)}</p></div>
                    </div>
                    <div class="faq-divider"></div>
                    <div class="faq-item">
                        <div class="faq-question">${_escHtml(i18n.faqQ4)}</div>
                        <div class="faq-answer"><p>${_escHtml(i18n.faqA4)}</p></div>
                    </div>
                    <div class="faq-divider"></div>
                    <div class="faq-item">
                        <div class="faq-question">${_escHtml(i18n.faqQ5)}</div>
                        <div class="faq-answer"><p>${_escHtml(i18n.faqA5)}</p></div>
                    </div>
                    <div class="faq-divider"></div>
                    <div class="faq-item">
                        <div class="faq-question">${_escHtml(i18n.faqQ6)}</div>
                        <div class="faq-answer"><p>${_escHtml(i18n.faqA6)}</p></div>
                    </div>` : '';
            // نستبدل الكتلتين الفارغتين الأصليّتين (faq-q1 و faq-q2) بـ 6 أسئلة/أجوبة معلوماتيّة
            // مع الحفاظ على IDs الأصلية في أول سؤالين لتوافق JS
            html = html.replace(
                /<!-- س1 -->[\s\S]*?<div class="faq-divider"><\/div>\s*<!-- س2 -->[\s\S]*?<p id="faq-a2"><\/p>\s*<\/div>\s*<\/div>/,
                `<!-- SSR FAQ (Round 7f: LLM readability — IDs محفوظة للـ JS override) -->${_faqHtml}`
            );

            // —— About-site section: REMOVED from homepage (UAT-Home-Simplify
            //   2026-04-28). The user wants `/` to be a Gateway, not a long
            //   SEO-text page. The i18n.aboutTitle/aboutP1-P3 strings remain
            //   in the locale dict above for a future dedicated /about page.
        }
    }

    // 5c) SSR لترجمات قسم روابط الفوتر (للمدن الشائعة + الخدمات + المصادر + المشاركة)
    //     يضمن أنّ الكراولر على /en/ /fr/ ... يرى نصوصاً بالـ locale الصحيح مباشرة
    {
        const Lf = seo.lang;
        const footerI18n = {
            ar: { pop:'🕌 مواقيت الصلاة في أبرز المدن', srv:'🧭 خدمات إسلامية أخرى',
                  refs:'📚 مصادر ومراجع خارجية',
                  refsText:'تعرّف على المزيد عن الصلاة في الإسلام من مصدر موسوعي:',
                  wikiText:'الصلاة على ويكيبيديا ↗',
                  share:'🔗 شارك الموقع',
                  follow:'📣 تابعنا', followX:'@TIMESPRAYESRS على X', followYT:'@TIMESPRAYESRS على يوتيوب', followLI:'Times Prayers على لينكد إن',
                  l_hijri_today:'التاريخ الهجري اليوم', l_hijri_year:'التقويم الهجري 1447',
                  l_date_conv:'تحويل التاريخ', l_tasbih:'المسبحة الإلكترونية',
                  x:'تويتر/X', fb:'فيسبوك', wa:'واتساب', tg:'تلغرام' },
            en: { pop:'🕌 Prayer Times in Major Cities', srv:'🧭 Other Islamic Services',
                  refs:'📚 External References',
                  refsText:'Learn more about Salah in Islam from an encyclopedic source:',
                  wikiText:'Salah on Wikipedia ↗',
                  share:'🔗 Share This Site',
                  follow:'📣 Follow Us', followX:'@TIMESPRAYESRS on X', followYT:'@TIMESPRAYESRS on YouTube', followLI:'Times Prayers on LinkedIn',
                  l_hijri_today:"Today's Hijri Date", l_hijri_year:'Hijri Calendar 1447',
                  l_date_conv:'Date Converter', l_tasbih:'Digital Tasbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            fr: { pop:'🕌 Heures de prière dans les grandes villes', srv:'🧭 Autres services islamiques',
                  refs:'📚 Références externes',
                  refsText:"Apprenez-en plus sur la Salat en Islam à partir d'une source encyclopédique :",
                  wikiText:'Salat sur Wikipedia ↗',
                  share:'🔗 Partager ce site',
                  follow:'📣 Suivez-nous', followX:'@TIMESPRAYESRS sur X', followYT:'@TIMESPRAYESRS sur YouTube', followLI:'Times Prayers sur LinkedIn',
                  l_hijri_today:"Date Hijri d'aujourd'hui", l_hijri_year:'Calendrier Hijri 1447',
                  l_date_conv:'Convertisseur de date', l_tasbih:'Tasbih numérique',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            tr: { pop:'🕌 Büyük Şehirlerde Namaz Vakitleri', srv:'🧭 Diğer İslami Hizmetler',
                  refs:'📚 Dış Kaynaklar',
                  refsText:'İslam\'da namaz hakkında ansiklopedik bir kaynaktan daha fazla bilgi edinin:',
                  wikiText:'Wikipedia\'da Namaz ↗',
                  share:'🔗 Bu siteyi paylaş',
                  follow:'📣 Bizi takip edin', followX:'X\'te @TIMESPRAYESRS', followYT:'YouTube\'da @TIMESPRAYESRS', followLI:'LinkedIn\'de Times Prayers',
                  l_hijri_today:'Bugünün Hicri Tarihi', l_hijri_year:'Hicri Takvim 1447',
                  l_date_conv:'Tarih Dönüştürücü', l_tasbih:'Dijital Tesbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            ur: { pop:'🕌 بڑے شہروں میں اوقاتِ نماز', srv:'🧭 دیگر اسلامی خدمات',
                  refs:'📚 بیرونی حوالہ جات',
                  refsText:'اسلام میں نماز کے بارے میں ایک انسائیکلوپیڈیا ذریعہ سے مزید جانیں:',
                  wikiText:'نماز ویکیپیڈیا پر ↗',
                  share:'🔗 سائٹ شیئر کریں',
                  follow:'📣 ہمیں فالو کریں', followX:'X پر @TIMESPRAYESRS', followYT:'یوٹیوب پر @TIMESPRAYESRS', followLI:'لنکڈ ان پر Times Prayers',
                  l_hijri_today:'آج کی ہجری تاریخ', l_hijri_year:'ہجری کیلنڈر 1447',
                  l_date_conv:'تاریخ کنورٹر', l_tasbih:'ڈیجیٹل تسبیح',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            de: { pop:'🕌 Gebetszeiten in großen Städten', srv:'🧭 Weitere islamische Dienste',
                  refs:'📚 Externe Quellen',
                  refsText:'Erfahren Sie mehr über das Gebet im Islam aus einer enzyklopädischen Quelle:',
                  wikiText:'Salah auf Wikipedia ↗',
                  share:'🔗 Diese Seite teilen',
                  follow:'📣 Folgen Sie uns', followX:'@TIMESPRAYESRS auf X', followYT:'@TIMESPRAYESRS auf YouTube', followLI:'Times Prayers auf LinkedIn',
                  l_hijri_today:'Heutiges Hidschri-Datum', l_hijri_year:'Hidschri-Kalender 1447',
                  l_date_conv:'Datumsumrechner', l_tasbih:'Digitale Tasbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            id: { pop:'🕌 Jadwal Sholat di Kota-Kota Besar', srv:'🧭 Layanan Islami Lainnya',
                  refs:'📚 Referensi Eksternal',
                  refsText:'Pelajari lebih lanjut tentang sholat dalam Islam dari sumber ensiklopedia:',
                  wikiText:'Sholat di Wikipedia ↗',
                  share:'🔗 Bagikan situs ini',
                  follow:'📣 Ikuti kami', followX:'@TIMESPRAYESRS di X', followYT:'@TIMESPRAYESRS di YouTube', followLI:'Times Prayers di LinkedIn',
                  l_hijri_today:'Tanggal Hijriyah Hari Ini', l_hijri_year:'Kalender Hijriyah 1447',
                  l_date_conv:'Konverter Tanggal', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            es: { pop:'🕌 Horarios de Oración en Ciudades Principales', srv:'🧭 Otros Servicios Islámicos',
                  refs:'📚 Referencias Externas',
                  refsText:'Aprenda más sobre el Salah en el Islam desde una fuente enciclopédica:',
                  wikiText:'Salah en Wikipedia ↗',
                  share:'🔗 Compartir este sitio',
                  follow:'📣 Síguenos', followX:'@TIMESPRAYESRS en X', followYT:'@TIMESPRAYESRS en YouTube', followLI:'Times Prayers en LinkedIn',
                  l_hijri_today:'Fecha Hijri de Hoy', l_hijri_year:'Calendario Hijri 1447',
                  l_date_conv:'Conversor de Fechas', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            bn: { pop:'🕌 প্রধান শহরগুলোতে নামাজের সময়', srv:'🧭 অন্যান্য ইসলামিক সেবা',
                  refs:'📚 বাহ্যিক রেফারেন্স',
                  refsText:'একটি বিশ্বকোষীয় উৎস থেকে ইসলামে সালাত সম্পর্কে আরও জানুন:',
                  wikiText:'উইকিপিডিয়ায় সালাত ↗',
                  share:'🔗 এই সাইট শেয়ার করুন',
                  follow:'📣 আমাদের ফলো করুন', followX:'X-এ @TIMESPRAYESRS', followYT:'YouTube-এ @TIMESPRAYESRS', followLI:'LinkedIn-এ Times Prayers',
                  l_hijri_today:'আজকের হিজরি তারিখ', l_hijri_year:'হিজরি ক্যালেন্ডার 1447',
                  l_date_conv:'তারিখ রূপান্তরকারী', l_tasbih:'ডিজিটাল তাসবিহ',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            ms: { pop:'🕌 Waktu Solat di Bandar-Bandar Utama', srv:'🧭 Perkhidmatan Islam Lain',
                  refs:'📚 Rujukan Luar',
                  refsText:'Ketahui lebih lanjut tentang solat dalam Islam daripada sumber ensiklopedia:',
                  wikiText:'Solat di Wikipedia ↗',
                  share:'🔗 Kongsi laman ini',
                  follow:'📣 Ikuti kami', followX:'@TIMESPRAYESRS di X', followYT:'@TIMESPRAYESRS di YouTube', followLI:'Times Prayers di LinkedIn',
                  l_hijri_today:'Tarikh Hijrah Hari Ini', l_hijri_year:'Kalendar Hijrah 1447',
                  l_date_conv:'Penukar Tarikh', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
        };
        const f = footerI18n[Lf] || footerI18n.ar;
        html = html
            .replace(/<h2 id="home-footer-links-title"[^>]*>[^<]*<\/h2>/,
                `<h2 id="home-footer-links-title" data-i18n="footer.popular_cities">${_escHtml(f.pop)}</h2>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.services_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.services_title">${_escHtml(f.srv)}</div>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.refs_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.refs_title">${_escHtml(f.refs)}</div>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.share_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.share_title">${_escHtml(f.share)}</div>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.follow_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.follow_title">${_escHtml(f.follow)}</div>`)
            .replace(/<span data-i18n="footer\.follow_x">[^<]*<\/span>/,
                `<span data-i18n="footer.follow_x">${_escHtml(f.followX)}</span>`)
            .replace(/<span data-i18n="footer\.follow_yt">[^<]*<\/span>/,
                `<span data-i18n="footer.follow_yt">${_escHtml(f.followYT)}</span>`)
            .replace(/<span data-i18n="footer\.follow_li">[^<]*<\/span>/,
                `<span data-i18n="footer.follow_li">${_escHtml(f.followLI)}</span>`)
            .replace(/<a href="\/today-hijri-date" data-i18n="footer\.link_hijri_today">[^<]*<\/a>/,
                (() => {
                    const _hH = _hijriNow();
                    const _pH = (n) => String(n).padStart(2, '0');
                    const _dated = `/hijri-date/${_hH.year}-${_pH(_hH.month)}-${_pH(_hH.day)}`;
                    return `<a href="${Lf==='ar'?'':'/'+Lf}${_dated}" data-i18n="footer.link_hijri_today">${_escHtml(f.l_hijri_today)}</a>`;
                })())
            .replace(/<a href="\/hijri-calendar\/1447" data-i18n="footer\.link_hijri_year">[^<]*<\/a>/,
                `<a href="${Lf==='ar'?'':'/'+Lf}/hijri-calendar/1447" data-i18n="footer.link_hijri_year">${_escHtml(f.l_hijri_year)}</a>`)
            .replace(/<a href="\/dateconverter" data-i18n="footer\.link_date_converter">[^<]*<\/a>/,
                `<a href="${Lf==='ar'?'':'/'+Lf}/dateconverter" data-i18n="footer.link_date_converter">${_escHtml(f.l_date_conv)}</a>`)
            .replace(/<a href="\/msbaha" data-i18n="footer\.link_tasbih">[^<]*<\/a>/,
                `<a href="${Lf==='ar'?'':'/'+Lf}/msbaha" data-i18n="footer.link_tasbih">${_escHtml(f.l_tasbih)}</a>`)
            .replace(/<p class="home-footer-refs"[\s\S]*?<\/p>/,
                `<p class="home-footer-refs" data-i18n="footer.refs_text">${_escHtml(f.refsText)} <a href="https://ar.wikipedia.org/wiki/%D8%B5%D9%84%D8%A7%D8%A9" target="_blank" rel="noopener external">${_escHtml(f.wikiText)}</a></p>`)
            // Share buttons (Twitter/X, Facebook, WhatsApp, Telegram) — ترجمة نصّ كلّ زرّ
            .replace(/<span data-i18n="footer\.share_x">[^<]*<\/span>/, `<span data-i18n="footer.share_x">${_escHtml(f.x)}</span>`)
            .replace(/<span data-i18n="footer\.share_fb">[^<]*<\/span>/, `<span data-i18n="footer.share_fb">${_escHtml(f.fb)}</span>`)
            .replace(/<span data-i18n="footer\.share_wa">[^<]*<\/span>/, `<span data-i18n="footer.share_wa">${_escHtml(f.wa)}</span>`)
            .replace(/<span data-i18n="footer\.share_tg">[^<]*<\/span>/, `<span data-i18n="footer.share_tg">${_escHtml(f.tg)}</span>`);

        // 5c-aria) SSR لـ aria-label لأزرار المشاركة + المتابعة + مجموعات الأزرار
        const shareAriaI18n = {
            ar: { grp:'مشاركة الموقع', x:'شارك عبر تويتر/X', fb:'شارك عبر فيسبوك', wa:'شارك عبر واتساب', tg:'شارك عبر تلغرام',
                  followGrp:'تابعنا على الشبكات الاجتماعية', followX:'تابعنا على X (تويتر) @TIMESPRAYESRS', followYT:'تابعنا على يوتيوب @TIMESPRAYESRS', followLI:'تابعنا على لينكد إن Times Prayers' },
            en: { grp:'Share site', x:'Share on Twitter/X', fb:'Share on Facebook', wa:'Share on WhatsApp', tg:'Share on Telegram',
                  followGrp:'Follow us on social media', followX:'Follow us on X (Twitter) @TIMESPRAYESRS', followYT:'Follow us on YouTube @TIMESPRAYESRS', followLI:'Follow us on LinkedIn Times Prayers' },
            fr: { grp:'Partager le site', x:'Partager sur Twitter/X', fb:'Partager sur Facebook', wa:'Partager sur WhatsApp', tg:'Partager sur Telegram',
                  followGrp:'Suivez-nous sur les réseaux sociaux', followX:'Suivez-nous sur X (Twitter) @TIMESPRAYESRS', followYT:'Suivez-nous sur YouTube @TIMESPRAYESRS', followLI:'Suivez-nous sur LinkedIn Times Prayers' },
            tr: { grp:'Siteyi paylaş', x:'Twitter/X\'te paylaş', fb:'Facebook\'ta paylaş', wa:'WhatsApp\'ta paylaş', tg:'Telegram\'da paylaş',
                  followGrp:'Bizi sosyal medyada takip edin', followX:'X\'te @TIMESPRAYESRS takip edin', followYT:'YouTube\'da @TIMESPRAYESRS takip edin', followLI:'LinkedIn\'de Times Prayers takip edin' },
            ur: { grp:'سائٹ شیئر کریں', x:'ٹویٹر/X پر شیئر کریں', fb:'فیس بک پر شیئر کریں', wa:'واٹس ایپ پر شیئر کریں', tg:'ٹیلیگرام پر شیئر کریں',
                  followGrp:'سوشل میڈیا پر ہمیں فالو کریں', followX:'X پر @TIMESPRAYESRS کو فالو کریں', followYT:'یوٹیوب پر @TIMESPRAYESRS کو فالو کریں', followLI:'لنکڈ ان پر Times Prayers کو فالو کریں' },
            de: { grp:'Seite teilen', x:'Auf Twitter/X teilen', fb:'Auf Facebook teilen', wa:'Auf WhatsApp teilen', tg:'Auf Telegram teilen',
                  followGrp:'Folgen Sie uns in den sozialen Medien', followX:'Folgen Sie uns auf X (Twitter) @TIMESPRAYESRS', followYT:'Folgen Sie uns auf YouTube @TIMESPRAYESRS', followLI:'Folgen Sie uns auf LinkedIn Times Prayers' },
            id: { grp:'Bagikan situs', x:'Bagikan di Twitter/X', fb:'Bagikan di Facebook', wa:'Bagikan di WhatsApp', tg:'Bagikan di Telegram',
                  followGrp:'Ikuti kami di media sosial', followX:'Ikuti kami di X (Twitter) @TIMESPRAYESRS', followYT:'Ikuti kami di YouTube @TIMESPRAYESRS', followLI:'Ikuti kami di LinkedIn Times Prayers' },
            es: { grp:'Compartir sitio', x:'Compartir en Twitter/X', fb:'Compartir en Facebook', wa:'Compartir en WhatsApp', tg:'Compartir en Telegram',
                  followGrp:'Síguenos en redes sociales', followX:'Síguenos en X (Twitter) @TIMESPRAYESRS', followYT:'Síguenos en YouTube @TIMESPRAYESRS', followLI:'Síguenos en LinkedIn Times Prayers' },
            bn: { grp:'সাইট শেয়ার করুন', x:'টুইটার/X-এ শেয়ার করুন', fb:'ফেসবুকে শেয়ার করুন', wa:'হোয়াটসঅ্যাপে শেয়ার করুন', tg:'টেলিগ্রামে শেয়ার করুন',
                  followGrp:'সামাজিক মাধ্যমে আমাদের ফলো করুন', followX:'X-এ @TIMESPRAYESRS ফলো করুন', followYT:'YouTube-এ @TIMESPRAYESRS ফলো করুন', followLI:'LinkedIn-এ Times Prayers ফলো করুন' },
            ms: { grp:'Kongsi laman', x:'Kongsi di Twitter/X', fb:'Kongsi di Facebook', wa:'Kongsi di WhatsApp', tg:'Kongsi di Telegram',
                  followGrp:'Ikuti kami di media sosial', followX:'Ikuti kami di X (Twitter) @TIMESPRAYESRS', followYT:'Ikuti kami di YouTube @TIMESPRAYESRS', followLI:'Ikuti kami di LinkedIn Times Prayers' },
        };
        const sa = shareAriaI18n[Lf] || shareAriaI18n.ar;
        html = html
            .replace(/<div class="home-share-buttons" role="group" aria-label="[^"]*">/,
                `<div class="home-share-buttons" role="group" aria-label="${_escHtml(sa.grp)}">`)
            .replace(/<a class="home-share-btn" id="share-twitter"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-share-btn" id="share-twitter"$1aria-label="${_escHtml(sa.x)}"`)
            .replace(/<a class="home-share-btn" id="share-facebook"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-share-btn" id="share-facebook"$1aria-label="${_escHtml(sa.fb)}"`)
            .replace(/<a class="home-share-btn" id="share-whatsapp"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-share-btn" id="share-whatsapp"$1aria-label="${_escHtml(sa.wa)}"`)
            .replace(/<a class="home-share-btn" id="share-telegram"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-share-btn" id="share-telegram"$1aria-label="${_escHtml(sa.tg)}"`)
            .replace(/<div class="home-follow-buttons" role="group" aria-label="[^"]*">/,
                `<div class="home-follow-buttons" role="group" aria-label="${_escHtml(sa.followGrp)}">`)
            .replace(/<a class="home-follow-btn" id="follow-x"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-follow-btn" id="follow-x"$1aria-label="${_escHtml(sa.followX)}"`)
            .replace(/<a class="home-follow-btn" id="follow-yt"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-follow-btn" id="follow-yt"$1aria-label="${_escHtml(sa.followYT)}"`)
            .replace(/<a class="home-follow-btn" id="follow-li"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-follow-btn" id="follow-li"$1aria-label="${_escHtml(sa.followLI)}"`);

        // 5c-bis) SSR لـ popular-cities-grid (12 مدينة): ترجمة الاسم + prefix للّغة
        const popCityI18n = {
            ar: { mecca:'مكة المكرمة', medina:'المدينة المنورة', riyadh:'الرياض', jeddah:'جدة',
                  cairo:'القاهرة', istanbul:'إسطنبول', dubai:'دبي', amman:'عمّان',
                  baghdad:'بغداد', damascus:'دمشق', casablanca:'الدار البيضاء', jerusalem:'القدس' },
            en: { mecca:'Mecca', medina:'Medina', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Cairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damascus', casablanca:'Casablanca', jerusalem:'Jerusalem' },
            fr: { mecca:'La Mecque', medina:'Médine', riyadh:'Riyad', jeddah:'Djeddah',
                  cairo:'Le Caire', istanbul:'Istanbul', dubai:'Dubaï', amman:'Amman',
                  baghdad:'Bagdad', damascus:'Damas', casablanca:'Casablanca', jerusalem:'Jérusalem' },
            tr: { mecca:'Mekke', medina:'Medine', riyadh:'Riyad', jeddah:'Cidde',
                  cairo:'Kahire', istanbul:'İstanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Bağdat', damascus:'Şam', casablanca:'Kazablanka', jerusalem:'Kudüs' },
            ur: { mecca:'مکہ مکرمہ', medina:'مدینہ منورہ', riyadh:'ریاض', jeddah:'جدہ',
                  cairo:'قاہرہ', istanbul:'استنبول', dubai:'دبئی', amman:'عمان',
                  baghdad:'بغداد', damascus:'دمشق', casablanca:'کاسابلانکا', jerusalem:'یروشلم' },
            de: { mecca:'Mekka', medina:'Medina', riyadh:'Riad', jeddah:'Dschidda',
                  cairo:'Kairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Bagdad', damascus:'Damaskus', casablanca:'Casablanca', jerusalem:'Jerusalem' },
            id: { mecca:'Makkah', medina:'Madinah', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Kairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damaskus', casablanca:'Casablanca', jerusalem:'Yerusalem' },
            es: { mecca:'La Meca', medina:'Medina', riyadh:'Riad', jeddah:'Yeda',
                  cairo:'El Cairo', istanbul:'Estambul', dubai:'Dubái', amman:'Ammán',
                  baghdad:'Bagdad', damascus:'Damasco', casablanca:'Casablanca', jerusalem:'Jerusalén' },
            bn: { mecca:'মক্কা', medina:'মদিনা', riyadh:'রিয়াদ', jeddah:'জেদ্দা',
                  cairo:'কায়রো', istanbul:'ইস্তাম্বুল', dubai:'দুবাই', amman:'আম্মান',
                  baghdad:'বাগদাদ', damascus:'দামেস্ক', casablanca:'কাসাব্লাঙ্কা', jerusalem:'জেরুজালেম' },
            ms: { mecca:'Makkah', medina:'Madinah', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Kaherah', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damsyik', casablanca:'Casablanca', jerusalem:'Baitulmaqdis' },
        };
        const popAriaI18n = {
            ar:'المدن الشائعة', en:'Popular cities', fr:'Villes populaires',
            tr:'Popüler şehirler', ur:'مشہور شہر', de:'Beliebte Städte',
            id:'Kota-kota populer',
            es:'Ciudades populares', bn:'জনপ্রিয় শহর', ms:'Bandar popular',
        };
        const popCities = popCityI18n[Lf] || popCityI18n.ar;
        // قالب "مواقيت الصلاة في {city}" لكلّ لغة (بعض اللغات postfix: tr/ur/bn)
        const prayerTimesInI18n = {
            ar: 'مواقيت الصلاة في {city}',
            en: 'Prayer Times in {city}',
            fr: 'Heures de prière à {city}',
            tr: '{city} için namaz vakitleri',
            ur: '{city} میں اوقاتِ نماز',
            de: 'Gebetszeiten in {city}',
            id: 'Jadwal Sholat di {city}',
            es: 'Horarios de Oración en {city}',
            bn: '{city}-এ নামাজের সময়',
            ms: 'Waktu Solat di {city}',
        };
        const _ptTmpl = prayerTimesInI18n[Lf] || prayerTimesInI18n.ar;
        // 1) ترجمة aria-label
        html = html.replace(
            /<nav class="popular-cities-grid" aria-label="[^"]*">/,
            `<nav class="popular-cities-grid" aria-label="${_escHtml(popAriaI18n[Lf] || popAriaI18n.ar)}">`
        );
        // 2) استبدال النص داخل كل <a href="/prayer-times-in-{slug}">...</a> + إضافة prefix للّغة
        //    النصّ يُصبح "مواقيت الصلاة في {city}" (قالب مترجَم لكلّ لغة) لتحسين SEO.
        html = html.replace(
            // UAT-3f: URL slug is `makkah` (canonical), dict key is `mecca`.
            // Accept both forms in the URL, normalise to `mecca` for dict lookup.
            /<a href="\/prayer-times-in-(makkah|medina|riyadh|jeddah|cairo|istanbul|dubai|amman|baghdad|damascus|casablanca|jerusalem)">[\s\S]*?<\/a>/g,
            (match, slug) => {
                const dictKey = (slug === 'makkah') ? 'mecca' : slug;
                const name = popCities[dictKey];
                // اسم المدينة بـ <strong> لإبرازه في الرابط — نُرمِّز جزأَي القالب بشكل منفصل
                // لتفادي تهريب `<strong>`.
                const [pre, post] = _ptTmpl.split('{city}');
                const label = `${_escHtml(pre)}<strong>${_escHtml(name)}</strong>${_escHtml(post)}`;
                const prefix = (Lf === 'ar') ? '' : '/' + Lf;
                return `<a href="${prefix}/prayer-times-in-${slug}">${label}</a>`;
            }
        );
        // 3) ترجمة aria-label للخدمات أيضاً
        const svcAriaI18n = {
            ar:'الخدمات الإسلامية', en:'Islamic services', fr:'Services islamiques',
            tr:'İslami hizmetler', ur:'اسلامی خدمات', de:'Islamische Dienste',
            id:'Layanan Islami',
            es:'Servicios islámicos', bn:'ইসলামিক সেবা', ms:'Perkhidmatan Islam',
        };
        html = html.replace(
            /<nav class="home-services-links" aria-label="[^"]*">/,
            `<nav class="home-services-links" aria-label="${_escHtml(svcAriaI18n[Lf] || svcAriaI18n.ar)}">`
        );

        // 5d) SSR لقسم الدول العربية (العنوان + اسم كل دولة) لكل لغة
        const arabTitleI18n = {
            ar: '🕌 مواقيت الصلاة في الدول العربية',
            en: '🕌 Prayer Times in Arab Countries',
            fr: '🕌 Heures de prière dans les pays arabes',
            tr: '🕌 Arap Ülkelerinde Namaz Vakitleri',
            ur: '🕌 عرب ممالک میں اوقاتِ نماز',
            de: '🕌 Gebetszeiten in arabischen Ländern',
            id: '🕌 Jadwal Sholat di Negara-Negara Arab',
            es: '🕌 Horarios de Oración en Países Árabes',
            bn: '🕌 আরব দেশগুলোতে নামাজের সময়',
            ms: '🕌 Waktu Solat di Negara-Negara Arab',
        };
        const arabCountryI18n = {
            ar: { sa:'السعودية', eg:'مصر', ae:'الإمارات', iq:'العراق', sy:'سوريا',
                  jo:'الأردن', ps:'فلسطين', lb:'لبنان', ye:'اليمن', om:'عُمان',
                  kw:'الكويت', qa:'قطر', bh:'البحرين', ma:'المغرب', dz:'الجزائر',
                  tn:'تونس', ly:'ليبيا', sd:'السودان', mr:'موريتانيا', so:'الصومال',
                  dj:'جيبوتي', km:'جزر القمر' },
            en: { sa:'Saudi Arabia', eg:'Egypt', ae:'UAE', iq:'Iraq', sy:'Syria',
                  jo:'Jordan', ps:'Palestine', lb:'Lebanon', ye:'Yemen', om:'Oman',
                  kw:'Kuwait', qa:'Qatar', bh:'Bahrain', ma:'Morocco', dz:'Algeria',
                  tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia',
                  dj:'Djibouti', km:'Comoros' },
            fr: { sa:'Arabie Saoudite', eg:'Égypte', ae:'Émirats arabes unis', iq:'Irak', sy:'Syrie',
                  jo:'Jordanie', ps:'Palestine', lb:'Liban', ye:'Yémen', om:'Oman',
                  kw:'Koweït', qa:'Qatar', bh:'Bahreïn', ma:'Maroc', dz:'Algérie',
                  tn:'Tunisie', ly:'Libye', sd:'Soudan', mr:'Mauritanie', so:'Somalie',
                  dj:'Djibouti', km:'Comores' },
            tr: { sa:'Suudi Arabistan', eg:'Mısır', ae:'BAE', iq:'Irak', sy:'Suriye',
                  jo:'Ürdün', ps:'Filistin', lb:'Lübnan', ye:'Yemen', om:'Umman',
                  kw:'Kuveyt', qa:'Katar', bh:'Bahreyn', ma:'Fas', dz:'Cezayir',
                  tn:'Tunus', ly:'Libya', sd:'Sudan', mr:'Moritanya', so:'Somali',
                  dj:'Cibuti', km:'Komorlar' },
            ur: { sa:'سعودی عرب', eg:'مصر', ae:'متحدہ عرب امارات', iq:'عراق', sy:'شام',
                  jo:'اردن', ps:'فلسطین', lb:'لبنان', ye:'یمن', om:'عمان',
                  kw:'کویت', qa:'قطر', bh:'بحرین', ma:'مراکش', dz:'الجزائر',
                  tn:'تیونس', ly:'لیبیا', sd:'سوڈان', mr:'موریطانیہ', so:'صومالیہ',
                  dj:'جبوتی', km:'جزائرِ قمر' },
            de: { sa:'Saudi-Arabien', eg:'Ägypten', ae:'Vereinigte Arabische Emirate', iq:'Irak', sy:'Syrien',
                  jo:'Jordanien', ps:'Palästina', lb:'Libanon', ye:'Jemen', om:'Oman',
                  kw:'Kuwait', qa:'Katar', bh:'Bahrain', ma:'Marokko', dz:'Algerien',
                  tn:'Tunesien', ly:'Libyen', sd:'Sudan', mr:'Mauretanien', so:'Somalia',
                  dj:'Dschibuti', km:'Komoren' },
            id: { sa:'Arab Saudi', eg:'Mesir', ae:'Uni Emirat Arab', iq:'Irak', sy:'Suriah',
                  jo:'Yordania', ps:'Palestina', lb:'Lebanon', ye:'Yaman', om:'Oman',
                  kw:'Kuwait', qa:'Qatar', bh:'Bahrain', ma:'Maroko', dz:'Aljazair',
                  tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia',
                  dj:'Djibouti', km:'Komoro' },
            es: { sa:'Arabia Saudita', eg:'Egipto', ae:'Emiratos Árabes Unidos', iq:'Irak', sy:'Siria',
                  jo:'Jordania', ps:'Palestina', lb:'Líbano', ye:'Yemen', om:'Omán',
                  kw:'Kuwait', qa:'Catar', bh:'Baréin', ma:'Marruecos', dz:'Argelia',
                  tn:'Túnez', ly:'Libia', sd:'Sudán', mr:'Mauritania', so:'Somalia',
                  dj:'Yibuti', km:'Comoras' },
            bn: { sa:'সৌদি আরব', eg:'মিশর', ae:'সংযুক্ত আরব আমিরাত', iq:'ইরাক', sy:'সিরিয়া',
                  jo:'জর্ডান', ps:'ফিলিস্তিন', lb:'লেবানন', ye:'ইয়েমেন', om:'ওমান',
                  kw:'কুয়েত', qa:'কাতার', bh:'বাহরাইন', ma:'মরক্কো', dz:'আলজেরিয়া',
                  tn:'তিউনিসিয়া', ly:'লিবিয়া', sd:'সুদান', mr:'মৌরিতানিয়া', so:'সোমালিয়া',
                  dj:'জিবুতি', km:'কোমোরোস' },
            ms: { sa:'Arab Saudi', eg:'Mesir', ae:'Emiriah Arab Bersatu', iq:'Iraq', sy:'Syria',
                  jo:'Jordan', ps:'Palestin', lb:'Lubnan', ye:'Yaman', om:'Oman',
                  kw:'Kuwait', qa:'Qatar', bh:'Bahrain', ma:'Maghribi', dz:'Algeria',
                  tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia',
                  dj:'Djibouti', km:'Komoros' },
        };
        // أبرز دول العالم (20 دولة من ستّ قارّات) — عنوان القسم بكلّ اللغات
        const worldTitleI18n = {
            ar: '🌍 مواقيت الصلاة في أبرز دول العالم',
            en: '🌍 Prayer Times in Major World Countries',
            fr: '🌍 Heures de prière dans les principaux pays du monde',
            tr: '🌍 Dünyanın Önemli Ülkelerinde Namaz Vakitleri',
            ur: '🌍 دنیا کے نمایاں ممالک میں اوقاتِ نماز',
            de: '🌍 Gebetszeiten in den wichtigsten Ländern der Welt',
            id: '🌍 Jadwal Sholat di Negara-Negara Utama Dunia',
            es: '🌍 Horarios de Oración en los Principales Países del Mundo',
            bn: '🌍 বিশ্বের প্রধান দেশগুলিতে নামাজের সময়',
            ms: '🌍 Waktu Solat di Negara-Negara Utama Dunia',
        };
        // أبرز دول العالم — أسماء 20 دولة مترجَمة لكلّ اللغات العشر
        const worldCountryI18n = {
            ar: { us:'الولايات المتحدة', ca:'كندا', mx:'المكسيك', br:'البرازيل', ar:'الأرجنتين',
                  gb:'المملكة المتحدة', fr:'فرنسا', de:'ألمانيا', es:'إسبانيا', it:'إيطاليا', ru:'روسيا',
                  tr:'تركيا', ir:'إيران', pk:'باكستان', in:'الهند', bd:'بنغلاديش', id:'إندونيسيا', my:'ماليزيا',
                  ng:'نيجيريا', za:'جنوب أفريقيا' },
            en: { us:'United States', ca:'Canada', mx:'Mexico', br:'Brazil', ar:'Argentina',
                  gb:'United Kingdom', fr:'France', de:'Germany', es:'Spain', it:'Italy', ru:'Russia',
                  tr:'Turkey', ir:'Iran', pk:'Pakistan', in:'India', bd:'Bangladesh', id:'Indonesia', my:'Malaysia',
                  ng:'Nigeria', za:'South Africa' },
            fr: { us:'États-Unis', ca:'Canada', mx:'Mexique', br:'Brésil', ar:'Argentine',
                  gb:'Royaume-Uni', fr:'France', de:'Allemagne', es:'Espagne', it:'Italie', ru:'Russie',
                  tr:'Turquie', ir:'Iran', pk:'Pakistan', in:'Inde', bd:'Bangladesh', id:'Indonésie', my:'Malaisie',
                  ng:'Nigeria', za:'Afrique du Sud' },
            tr: { us:'ABD', ca:'Kanada', mx:'Meksika', br:'Brezilya', ar:'Arjantin',
                  gb:'Birleşik Krallık', fr:'Fransa', de:'Almanya', es:'İspanya', it:'İtalya', ru:'Rusya',
                  tr:'Türkiye', ir:'İran', pk:'Pakistan', in:'Hindistan', bd:'Bangladeş', id:'Endonezya', my:'Malezya',
                  ng:'Nijerya', za:'Güney Afrika' },
            ur: { us:'امریکہ', ca:'کینیڈا', mx:'میکسیکو', br:'برازیل', ar:'ارجنٹائن',
                  gb:'برطانیہ', fr:'فرانس', de:'جرمنی', es:'اسپین', it:'اٹلی', ru:'روس',
                  tr:'ترکی', ir:'ایران', pk:'پاکستان', in:'انڈیا', bd:'بنگلہ دیش', id:'انڈونیشیا', my:'ملیشیا',
                  ng:'نائجیریا', za:'جنوبی افریقہ' },
            de: { us:'USA', ca:'Kanada', mx:'Mexiko', br:'Brasilien', ar:'Argentinien',
                  gb:'Vereinigtes Königreich', fr:'Frankreich', de:'Deutschland', es:'Spanien', it:'Italien', ru:'Russland',
                  tr:'Türkei', ir:'Iran', pk:'Pakistan', in:'Indien', bd:'Bangladesch', id:'Indonesien', my:'Malaysia',
                  ng:'Nigeria', za:'Südafrika' },
            id: { us:'Amerika Serikat', ca:'Kanada', mx:'Meksiko', br:'Brasil', ar:'Argentina',
                  gb:'Inggris', fr:'Prancis', de:'Jerman', es:'Spanyol', it:'Italia', ru:'Rusia',
                  tr:'Turki', ir:'Iran', pk:'Pakistan', in:'India', bd:'Bangladesh', id:'Indonesia', my:'Malaysia',
                  ng:'Nigeria', za:'Afrika Selatan' },
            es: { us:'Estados Unidos', ca:'Canadá', mx:'México', br:'Brasil', ar:'Argentina',
                  gb:'Reino Unido', fr:'Francia', de:'Alemania', es:'España', it:'Italia', ru:'Rusia',
                  tr:'Turquía', ir:'Irán', pk:'Pakistán', in:'India', bd:'Bangladés', id:'Indonesia', my:'Malasia',
                  ng:'Nigeria', za:'Sudáfrica' },
            bn: { us:'যুক্তরাষ্ট্র', ca:'কানাডা', mx:'মেক্সিকো', br:'ব্রাজিল', ar:'আর্জেন্টিনা',
                  gb:'যুক্তরাজ্য', fr:'ফ্রান্স', de:'জার্মানি', es:'স্পেন', it:'ইতালি', ru:'রাশিয়া',
                  tr:'তুরস্ক', ir:'ইরান', pk:'পাকিস্তান', in:'ভারত', bd:'বাংলাদেশ', id:'ইন্দোনেশিয়া', my:'মালয়েশিয়া',
                  ng:'নাইজেরিয়া', za:'দক্ষিণ আফ্রিকা' },
            ms: { us:'Amerika Syarikat', ca:'Kanada', mx:'Mexico', br:'Brazil', ar:'Argentina',
                  gb:'United Kingdom', fr:'Perancis', de:'Jerman', es:'Sepanyol', it:'Itali', ru:'Rusia',
                  tr:'Turki', ir:'Iran', pk:'Pakistan', in:'India', bd:'Bangladesh', id:'Indonesia', my:'Malaysia',
                  ng:'Nigeria', za:'Afrika Selatan' },
        };
        if (arabTitleI18n[Lf]) {
            html = html.replace(
                /<h2 id="arab-countries-title"[^>]*>[^<]*<\/h2>/,
                `<h2 id="arab-countries-title" data-i18n="footer.arab_countries">${_escHtml(arabTitleI18n[Lf])}</h2>`
            );
        }
        if (worldTitleI18n[Lf]) {
            html = html.replace(
                /<h2 id="world-countries-title"[^>]*>[^<]*<\/h2>/,
                `<h2 id="world-countries-title" class="arab-countries-subtitle" data-i18n="footer.world_countries">${_escHtml(worldTitleI18n[Lf])}</h2>`
            );
        }
        // دمج أسماء الدول العربية + دول العالم لكلّ لغة (الـ regex التالي يمرّ على كلّ <span data-i18n="country.XX"> في الصفحة)
        const names = { ...(arabCountryI18n[Lf] || {}), ...(worldCountryI18n[Lf] || {}) };
        if (names) {
            // نستبدل كل <span data-i18n="country.xx">...</span> بالنص المترجَم
            html = html.replace(
                /<span data-i18n="country\.([a-z]{2})">[^<]*<\/span>/g,
                (match, cc) => names[cc]
                    ? `<span data-i18n="country.${cc}">${_escHtml(names[cc])}</span>`
                    : match
            );
        }
        // SSR للبادئة "مواقيت الصلاة في" داخل بطاقات الدول العربية (لكل لغة)
        const arabPrefixI18n = {
            ar: 'مواقيت الصلاة في ',
            en: 'Prayer Times in ',
            fr: 'Heures de prière à ',
            tr: 'Namaz Vakitleri: ',
            ur: 'اوقاتِ نماز ',
            de: 'Gebetszeiten in ',
            id: 'Jadwal Sholat di ',
            es: 'Horarios de oración en ',
            bn: 'নামাজের সময় ',
            ms: 'Waktu Solat di ',
        };
        const _prefTxt = arabPrefixI18n[Lf] || arabPrefixI18n.ar;
        html = html.replace(
            /<span class="arab-tile-prefix" data-i18n="arab\.prefix">[^<]*<\/span>/g,
            `<span class="arab-tile-prefix" data-i18n="arab.prefix">${_escHtml(_prefTxt)}</span>`
        );

        // 5e) SSR لزر "المزيد" (more-countries-btn): href لكل لغة + نص مترجَم
        const moreBtnI18n = {
            ar: '🌐 استعرض كل دول العالم',
            en: '🌐 Browse all countries worldwide',
            fr: '🌐 Parcourir tous les pays du monde',
            tr: '🌐 Dünyadaki tüm ülkelere göz at',
            ur: '🌐 دنیا کے تمام ممالک دیکھیں',
            de: '🌐 Alle Länder der Welt durchsuchen',
            id: '🌐 Jelajahi semua negara di dunia',
            es: '🌐 Explorar todos los países del mundo',
            bn: '🌐 বিশ্বের সব দেশ দেখুন',
            ms: '🌐 Terokai semua negara di dunia',
        };
        const moreBtnHref = (Lf === 'ar') ? '/prayer-times-worldwide' : `/${Lf}/prayer-times-worldwide`;
        const moreBtnText = moreBtnI18n[Lf] || moreBtnI18n.ar;
        html = html.replace(
            /<a href="\/prayer-times-worldwide" class="more-countries-btn" id="more-countries-btn" data-i18n="countries\.more">[^<]*<\/a>/,
            `<a href="${moreBtnHref}" class="more-countries-btn" id="more-countries-btn" data-i18n="countries.more">${_escHtml(moreBtnText)}</a>`
        );

        // 5f) SSR لروابط country-tile في arab-countries-section:
        //   بالعربية لا prefix، ولباقي اللغات نُضيف /{Lf} لضمان بقاء المستخدم في لغته بعد النقر.
        if (Lf !== 'ar') {
            html = html.replace(
                /<a href="(\/prayer-times-in-[a-z0-9-]+)" class="country-tile"/g,
                `<a href="/${Lf}$1" class="country-tile"`
            );
        }
    }

    // 5g) SSR لصفحة القمر /moon-today-in-{slug} — H1 غنيّ بالكلمات المفتاحيّة + فقرة تعريفيّة
    if (seo.moonCity) {
        const Lm = seo.lang;
        const cityName = seo.moonCity.name;
        // خريطة slug → country code (نفس خريطة app.js، موسَّعة)
        const _COUNTRY_BY_CITY = {
            'mecca': 'sa', 'medina': 'sa', 'riyadh': 'sa', 'jeddah': 'sa', 'dammam': 'sa',
            'khobar': 'sa', 'taif': 'sa', 'tabuk': 'sa', 'buraidah': 'sa', 'buraydah': 'sa',
            'abha': 'sa', 'yanbu': 'sa', 'hail': 'sa', 'najran': 'sa', 'jizan': 'sa',
            'qatif': 'sa', 'jubail': 'sa', 'hofuf': 'sa',
            'cairo': 'eg', 'alexandria': 'eg', 'giza': 'eg',
            'istanbul': 'tr', 'ankara': 'tr', 'izmir': 'tr', 'bursa': 'tr',
            'dubai': 'ae', 'abu-dhabi': 'ae', 'sharjah': 'ae',
            'doha': 'qa', 'kuwait': 'kw', 'kuwait-city': 'kw',
            'manama': 'bh', 'manama-al': 'bh', 'muscat': 'om',
            'amman': 'jo', 'aqaba': 'jo',
            'baghdad': 'iq', 'basra': 'iq', 'mosul': 'iq',
            'beirut': 'lb',
            'damascus': 'sy', 'aleppo': 'sy', 'homs': 'sy',
            'sanaa': 'ye', 'aden': 'ye',
            'tunis': 'tn', 'algiers': 'dz',
            'rabat': 'ma', 'casablanca': 'ma', 'marrakesh': 'ma', 'marrakech': 'ma',
            'khartoum': 'sd', 'tripoli': 'ly',
            'jerusalem': 'ps', 'gaza': 'ps', 'ramallah': 'ps',
            'karachi': 'pk', 'lahore': 'pk', 'islamabad': 'pk', 'rawalpindi': 'pk',
            'multan': 'pk', 'peshawar': 'pk', 'quetta': 'pk',
            'dhaka': 'bd', 'chittagong': 'bd',
            'jakarta': 'id', 'surabaya': 'id', 'bandung': 'id', 'medan': 'id',
            'kuala-lumpur': 'my', 'johor': 'my', 'penang': 'my',
            'singapore': 'sg',
            'london': 'gb', 'manchester': 'gb', 'birmingham': 'gb',
            'paris': 'fr',
            'berlin': 'de', 'munich': 'de',
            'madrid': 'es', 'barcelona': 'es',
            'rome': 'it', 'milan': 'it',
            'moscow': 'ru',
            'new-york': 'us', 'new-york-city': 'us', 'los-angeles': 'us', 'chicago': 'us',
            'toronto': 'ca',
            'tokyo': 'jp', 'beijing': 'cn', 'shanghai': 'cn',
            'seoul': 'kr', 'bangkok': 'th', 'hanoi': 'vn', 'manila': 'ph',
            'delhi': 'in', 'new-delhi': 'in', 'mumbai': 'in', 'kolkata': 'in',
            'bangalore': 'in', 'chennai': 'in', 'hyderabad': 'in',
            'sydney': 'au', 'melbourne': 'au',
            'tehran': 'ir', 'mashhad': 'ir', 'isfahan': 'ir', 'qom': 'ir',
            'tashkent': 'uz', 'samarkand': 'uz', 'bukhara': 'uz',
            'baku': 'az', 'kabul': 'af', 'kandahar': 'af', 'herat': 'af',
            'mogadishu': 'so', 'nouakchott': 'mr',
            'dushanbe': 'tj', 'bishkek': 'kg',
            'astana': 'kz', 'almaty': 'kz',
            'addis': 'et', 'lagos': 'ng', 'abuja': 'ng', 'kano': 'ng',
            'nairobi': 'ke', 'dar': 'tz',
            'bandar': 'bn'
        };
        const _COUNTRY_NAMES_SSR = {
            ar: { sa:'السعوديّة', eg:'مصر', tr:'تركيا', ae:'الإمارات', qa:'قطر', kw:'الكويت', bh:'البحرين', om:'عُمان', jo:'الأردن', iq:'العراق', lb:'لبنان', sy:'سوريا', ye:'اليمن', tn:'تونس', dz:'الجزائر', ma:'المغرب', sd:'السودان', ly:'ليبيا', ps:'فلسطين', pk:'باكستان', bd:'بنغلاديش', id:'إندونيسيا', my:'ماليزيا', gb:'المملكة المتّحدة', fr:'فرنسا', de:'ألمانيا', es:'إسبانيا', it:'إيطاليا', us:'الولايات المتّحدة', ca:'كندا', au:'أستراليا', jp:'اليابان', cn:'الصين', kr:'كوريا الجنوبيّة', th:'تايلاند', vn:'فيتنام', ph:'الفلبّين', in:'الهند', ru:'روسيا', sg:'سنغافورة', ir:'إيران', uz:'أوزبكستان', az:'أذربيجان', af:'أفغانستان', so:'الصومال', mr:'موريتانيا', tj:'طاجيكستان', kg:'قيرغيزستان', kz:'كازاخستان', et:'إثيوبيا', ng:'نيجيريا', ke:'كينيا', tz:'تنزانيا', bn:'بروناي' },
            en: { sa:'Saudi Arabia', eg:'Egypt', tr:'Turkey', ae:'UAE', qa:'Qatar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Jordan', iq:'Iraq', lb:'Lebanon', sy:'Syria', ye:'Yemen', tn:'Tunisia', dz:'Algeria', ma:'Morocco', sd:'Sudan', ly:'Libya', ps:'Palestine', pk:'Pakistan', bd:'Bangladesh', id:'Indonesia', my:'Malaysia', gb:'United Kingdom', fr:'France', de:'Germany', es:'Spain', it:'Italy', us:'United States', ca:'Canada', au:'Australia', jp:'Japan', cn:'China', kr:'South Korea', th:'Thailand', vn:'Vietnam', ph:'Philippines', in:'India', ru:'Russia', sg:'Singapore', ir:'Iran', uz:'Uzbekistan', az:'Azerbaijan', af:'Afghanistan', so:'Somalia', mr:'Mauritania', tj:'Tajikistan', kg:'Kyrgyzstan', kz:'Kazakhstan', et:'Ethiopia', ng:'Nigeria', ke:'Kenya', tz:'Tanzania', bn:'Brunei' },
            fr: { sa:'Arabie saoudite', eg:'Égypte', tr:'Turquie', ae:'Émirats arabes unis', qa:'Qatar', kw:'Koweït', bh:'Bahreïn', om:'Oman', jo:'Jordanie', iq:'Irak', lb:'Liban', sy:'Syrie', ye:'Yémen', tn:'Tunisie', dz:'Algérie', ma:'Maroc', sd:'Soudan', ly:'Libye', ps:'Palestine', pk:'Pakistan', bd:'Bangladesh', id:'Indonésie', my:'Malaisie', gb:'Royaume-Uni', fr:'France', de:'Allemagne', es:'Espagne', it:'Italie', us:'États-Unis', ca:'Canada', au:'Australie', jp:'Japon', cn:'Chine', kr:'Corée du Sud', th:'Thaïlande', vn:'Vietnam', ph:'Philippines', in:'Inde', ru:'Russie', sg:'Singapour', ir:'Iran', uz:'Ouzbékistan', az:'Azerbaïdjan', af:'Afghanistan', so:'Somalie', mr:'Mauritanie', tj:'Tadjikistan', kg:'Kirghizistan', kz:'Kazakhstan', et:'Éthiopie', ng:'Nigéria', ke:'Kenya', tz:'Tanzanie', bn:'Brunei' },
            tr: { sa:'Suudi Arabistan', eg:'Mısır', tr:'Türkiye', ae:'BAE', qa:'Katar', kw:'Kuveyt', bh:'Bahreyn', om:'Umman', jo:'Ürdün', iq:'Irak', lb:'Lübnan', sy:'Suriye', ye:'Yemen', tn:'Tunus', dz:'Cezayir', ma:'Fas', sd:'Sudan', ly:'Libya', ps:'Filistin', pk:'Pakistan', bd:'Bangladeş', id:'Endonezya', my:'Malezya', gb:'Birleşik Krallık', fr:'Fransa', de:'Almanya', es:'İspanya', it:'İtalya', us:'ABD', ca:'Kanada', au:'Avustralya', jp:'Japonya', cn:'Çin', kr:'Güney Kore', th:'Tayland', vn:'Vietnam', ph:'Filipinler', in:'Hindistan', ru:'Rusya', sg:'Singapur', ir:'İran', uz:'Özbekistan', az:'Azerbaycan', af:'Afganistan', so:'Somali', mr:'Moritanya', tj:'Tacikistan', kg:'Kırgızistan', kz:'Kazakistan', et:'Etiyopya', ng:'Nijerya', ke:'Kenya', tz:'Tanzanya', bn:'Brunei' },
            ur: { sa:'سعودی عرب', eg:'مصر', tr:'ترکی', ae:'متحدہ عرب امارات', qa:'قطر', kw:'کویت', bh:'بحرین', om:'عمان', jo:'اردن', iq:'عراق', lb:'لبنان', sy:'شام', ye:'یمن', tn:'تیونس', dz:'الجزائر', ma:'مراکش', sd:'سوڈان', ly:'لیبیا', ps:'فلسطین', pk:'پاکستان', bd:'بنگلہ دیش', id:'انڈونیشیا', my:'ملیشیا', gb:'برطانیہ', fr:'فرانس', de:'جرمنی', es:'اسپین', it:'اٹلی', us:'امریکہ', ca:'کینیڈا', au:'آسٹریلیا', jp:'جاپان', cn:'چین', kr:'جنوبی کوریا', th:'تھائی لینڈ', vn:'ویتنام', ph:'فلپائن', in:'بھارت', ru:'روس', sg:'سنگاپور', ir:'ایران', uz:'ازبکستان', az:'آذربائیجان', af:'افغانستان', so:'صومالیہ', mr:'موریتانیہ', tj:'تاجکستان', kg:'کرغیزستان', kz:'قازقستان', et:'ایتھوپیا', ng:'نائجیریا', ke:'کینیا', tz:'تنزانیہ', bn:'برونائی' },
            de: { sa:'Saudi-Arabien', eg:'Ägypten', tr:'Türkei', ae:'VAE', qa:'Katar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Jordanien', iq:'Irak', lb:'Libanon', sy:'Syrien', ye:'Jemen', tn:'Tunesien', dz:'Algerien', ma:'Marokko', sd:'Sudan', ly:'Libyen', ps:'Palästina', pk:'Pakistan', bd:'Bangladesch', id:'Indonesien', my:'Malaysia', gb:'Vereinigtes Königreich', fr:'Frankreich', de:'Deutschland', es:'Spanien', it:'Italien', us:'USA', ca:'Kanada', au:'Australien', jp:'Japan', cn:'China', kr:'Südkorea', th:'Thailand', vn:'Vietnam', ph:'Philippinen', in:'Indien', ru:'Russland', sg:'Singapur', ir:'Iran', uz:'Usbekistan', az:'Aserbaidschan', af:'Afghanistan', so:'Somalia', mr:'Mauretanien', tj:'Tadschikistan', kg:'Kirgisistan', kz:'Kasachstan', et:'Äthiopien', ng:'Nigeria', ke:'Kenia', tz:'Tansania', bn:'Brunei' },
            id: { sa:'Arab Saudi', eg:'Mesir', tr:'Turki', ae:'UEA', qa:'Qatar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Yordania', iq:'Irak', lb:'Lebanon', sy:'Suriah', ye:'Yaman', tn:'Tunisia', dz:'Aljazair', ma:'Maroko', sd:'Sudan', ly:'Libya', ps:'Palestina', pk:'Pakistan', bd:'Bangladesh', id:'Indonesia', my:'Malaysia', gb:'Britania Raya', fr:'Prancis', de:'Jerman', es:'Spanyol', it:'Italia', us:'Amerika Serikat', ca:'Kanada', au:'Australia', jp:'Jepang', cn:'Tiongkok', kr:'Korea Selatan', th:'Thailand', vn:'Vietnam', ph:'Filipina', in:'India', ru:'Rusia', sg:'Singapura', ir:'Iran', uz:'Uzbekistan', az:'Azerbaijan', af:'Afghanistan', so:'Somalia', mr:'Mauritania', tj:'Tajikistan', kg:'Kyrgyzstan', kz:'Kazakhstan', et:'Etiopia', ng:'Nigeria', ke:'Kenya', tz:'Tanzania', bn:'Brunei' },
            es: { sa:'Arabia Saudí', eg:'Egipto', tr:'Turquía', ae:'EAU', qa:'Catar', kw:'Kuwait', bh:'Baréin', om:'Omán', jo:'Jordania', iq:'Irak', lb:'Líbano', sy:'Siria', ye:'Yemen', tn:'Túnez', dz:'Argelia', ma:'Marruecos', sd:'Sudán', ly:'Libia', ps:'Palestina', pk:'Pakistán', bd:'Bangladés', id:'Indonesia', my:'Malasia', gb:'Reino Unido', fr:'Francia', de:'Alemania', es:'España', it:'Italia', us:'Estados Unidos', ca:'Canadá', au:'Australia', jp:'Japón', cn:'China', kr:'Corea del Sur', th:'Tailandia', vn:'Vietnam', ph:'Filipinas', in:'India', ru:'Rusia', sg:'Singapur', ir:'Irán', uz:'Uzbekistán', az:'Azerbaiyán', af:'Afganistán', so:'Somalia', mr:'Mauritania', tj:'Tayikistán', kg:'Kirguistán', kz:'Kazajistán', et:'Etiopía', ng:'Nigeria', ke:'Kenia', tz:'Tanzania', bn:'Brunéi' },
            bn: { sa:'সৌদি আরব', eg:'মিশর', tr:'তুরস্ক', ae:'সংযুক্ত আরব আমিরাত', qa:'কাতার', kw:'কুয়েত', bh:'বাহরাইন', om:'ওমান', jo:'জর্ডান', iq:'ইরাক', lb:'লেবানন', sy:'সিরিয়া', ye:'ইয়েমেন', tn:'তিউনিসিয়া', dz:'আলজেরিয়া', ma:'মরক্কো', sd:'সুদান', ly:'লিবিয়া', ps:'ফিলিস্তিন', pk:'পাকিস্তান', bd:'বাংলাদেশ', id:'ইন্দোনেশিয়া', my:'মালয়েশিয়া', gb:'যুক্তরাজ্য', fr:'ফ্রান্স', de:'জার্মানি', es:'স্পেন', it:'ইতালি', us:'মার্কিন যুক্তরাষ্ট্র', ca:'কানাডা', au:'অস্ট্রেলিয়া', jp:'জাপান', cn:'চীন', kr:'দক্ষিণ কোরিয়া', th:'থাইল্যান্ড', vn:'ভিয়েতনাম', ph:'ফিলিপাইন', in:'ভারত', ru:'রাশিয়া', sg:'সিঙ্গাপুর', ir:'ইরান', uz:'উজবেকিস্তান', az:'আজারবাইজান', af:'আফগানিস্তান', so:'সোমালিয়া', mr:'মৌরিতানিয়া', tj:'তাজিকিস্তান', kg:'কিরগিজস্তান', kz:'কাজাখস্তান', et:'ইথিওপিয়া', ng:'নাইজেরিয়া', ke:'কেনিয়া', tz:'তানজানিয়া', bn:'ব্রুনাই' },
            ms: { sa:'Arab Saudi', eg:'Mesir', tr:'Turki', ae:'UAE', qa:'Qatar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Jordan', iq:'Iraq', lb:'Lubnan', sy:'Syria', ye:'Yaman', tn:'Tunisia', dz:'Algeria', ma:'Maghribi', sd:'Sudan', ly:'Libya', ps:'Palestin', pk:'Pakistan', bd:'Bangladesh', id:'Indonesia', my:'Malaysia', gb:'United Kingdom', fr:'Perancis', de:'Jerman', es:'Sepanyol', it:'Itali', us:'Amerika Syarikat', ca:'Kanada', au:'Australia', jp:'Jepun', cn:'China', kr:'Korea Selatan', th:'Thailand', vn:'Vietnam', ph:'Filipina', in:'India', ru:'Rusia', sg:'Singapura', ir:'Iran', uz:'Uzbekistan', az:'Azerbaijan', af:'Afghanistan', so:'Somalia', mr:'Mauritania', tj:'Tajikistan', kg:'Kyrgyzstan', kz:'Kazakhstan', et:'Ethiopia', ng:'Nigeria', ke:'Kenya', tz:'Tanzania', bn:'Brunei' }
        };
        const cc = _COUNTRY_BY_CITY[seo.moonCity.slug] || '';
        const countryName = cc ? ((_COUNTRY_NAMES_SSR[Lm] || _COUNTRY_NAMES_SSR.en)[cc] || '') : '';
        // ── H1: يختلف بين صفحة اليوم وصفحة تاريخ محدَّد ──
        // الرابط الهجريّ (مثل /moon-today-in-mecca/1447-10-03) يُعرَض بصيغة هجريّة أوّلاً.
        const _moonDateLabelSsr = seo.moonCity.dateLabel || '';
        const _moonDateIsHijriSsr = !!seo.moonCity.dateIsHijri;
        const _moonHijriLabelSfxSsr = seo.moonCity.hijriLabelWithSfx || '';
        const _primaryDateLabelSsr = (_moonDateIsHijriSsr && _moonHijriLabelSfxSsr)
            ? _moonHijriLabelSfxSsr
            : _moonDateLabelSsr;
        const _secondaryDateLabelSsr = _moonDateIsHijriSsr ? _moonDateLabelSsr : _moonHijriLabelSfxSsr;
        const _isMoonDatePage = !!(seo.moonCity.date && _moonDateLabelSsr);
        // Round 16: hub page (بلا تاريخ، تحت /moon-in-) — H1 evergreen بلا "اليوم"
        const _isMoonHubPageSsr = !!seo.moonCity.isHub;
        const _h1Moon = _isMoonDatePage ? ({
            ar: `🌙 حالة القمر في ${cityName} يوم ${_primaryDateLabelSsr}`,
            en: `🌙 Moon in ${cityName} on ${_primaryDateLabelSsr}`,
            fr: `🌙 La Lune à ${cityName} le ${_primaryDateLabelSsr}`,
            tr: `🌙 ${cityName} için ${_primaryDateLabelSsr} tarihinde Ay`,
            ur: `🌙 ${cityName} میں ${_primaryDateLabelSsr} کو چاند`,
            de: `🌙 Der Mond in ${cityName} am ${_primaryDateLabelSsr}`,
            id: `🌙 Bulan di ${cityName} pada ${_primaryDateLabelSsr}`,
            es: `🌙 La Luna en ${cityName} el ${_primaryDateLabelSsr}`,
            bn: `🌙 ${cityName}-এ ${_primaryDateLabelSsr}-এ চাঁদ`,
            ms: `🌙 Bulan di ${cityName} pada ${_primaryDateLabelSsr}`
        }[Lm] || `🌙 Moon in ${cityName} on ${_primaryDateLabelSsr}`) : _isMoonHubPageSsr ? ({
            // Round 19: H1 الـ hub ينظَّف ويُختصر ليعكس هدف الصفحة (توجيه + استكشاف)
            //   قديم: "حالة القمر في {city}, {country} — الطور والإضاءة والتقويم" (ثقيل/مكرَّر)
            //   جديد: "تقويم القمر في {city}" — قصير، واضح، موازٍ لنصّ bc-moon (Round 18-B).
            ar: `🌙 تقويم القمر في ${cityName}`,
            en: `🌙 Moon Calendar in ${cityName}`,
            fr: `🌙 Calendrier de la Lune à ${cityName}`,
            tr: `🌙 ${cityName} Ay Takvimi`,
            ur: `🌙 ${cityName} کا چاند کا تقویم`,
            de: `🌙 Mondkalender für ${cityName}`,
            id: `🌙 Kalender Bulan di ${cityName}`,
            es: `🌙 Calendario Lunar en ${cityName}`,
            bn: `🌙 ${cityName}-এর চাঁদের পঞ্জিকা`,
            ms: `🌙 Kalendar Bulan di ${cityName}`
        }[Lm] || `🌙 Moon Calendar in ${cityName}`) : ({
            ar: `🌙 طور القمر اليوم في ${cityName}، ${countryName} — الإضاءة وعمر القمر`,
            en: `🌙 Moon Phase Today in ${cityName}, ${countryName} — Illumination & Age`,
            fr: `🌙 Phase de la Lune aujourd\u2019hui à ${cityName}, ${countryName} — Illumination et âge`,
            tr: `🌙 Bugün ${cityName}, ${countryName} için Ay Evresi — Aydınlanma ve Yaş`,
            ur: `🌙 آج ${cityName}، ${countryName} میں چاند کا مرحلہ — روشنی اور عمر`,
            de: `🌙 Mondphase heute in ${cityName}, ${countryName} — Beleuchtung und Alter`,
            id: `🌙 Fase Bulan Hari Ini di ${cityName}, ${countryName} — Pencahayaan dan Usia`,
            es: `🌙 Fase de la Luna hoy en ${cityName}, ${countryName} — Iluminación y edad`,
            bn: `🌙 আজ ${cityName}, ${countryName}-এ চাঁদের পর্যায় — আলোকসজ্জা ও বয়স`,
            ms: `🌙 Fasa Bulan Hari Ini di ${cityName}, ${countryName} — Pencahayaan & Usia`
        }[Lm] || `🌙 Moon Phase Today in ${cityName}, ${countryName}`);
        // ── subtitle SSR: "الموافق الجمعة 1 مايو 2026" (أو العكس للرابط الميلاديّ) ──
        const _SUBTITLE_EQUIV = {
            ar: (d) => `الموافق ${d}`,
            en: (d) => `(equivalent to ${d})`,
            fr: (d) => `(équivalent au ${d})`,
            tr: (d) => `(${d} tarihine denk gelir)`,
            ur: (d) => `بمطابق ${d}`,
            de: (d) => `(entspricht ${d})`,
            id: (d) => `(setara dengan ${d})`,
            es: (d) => `(equivalente al ${d})`,
            bn: (d) => `(${d}-এর সমতুল্য)`,
            ms: (d) => `(bersamaan ${d})`
        };
        const _subtitleTextSsr = (_isMoonDatePage && _secondaryDateLabelSsr)
            ? (_SUBTITLE_EQUIV[Lm] || _SUBTITLE_EQUIV.en)(_secondaryDateLabelSsr)
            : '';
        // ── badge: "📿 عرض حسب التاريخ الهجري" / "📅 عرض حسب التاريخ الميلادي" ──
        const _BADGE_TEXT = {
            ar: { hijri: '📿 عرض حسب التاريخ الهجري', greg: '📅 عرض حسب التاريخ الميلادي' },
            en: { hijri: '📿 Viewing by Hijri date', greg: '📅 Viewing by Gregorian date' },
            fr: { hijri: '📿 Affichage par date hégirienne', greg: '📅 Affichage par date grégorienne' },
            tr: { hijri: '📿 Hicri tarihe göre görüntüleme', greg: '📅 Miladi tarihe göre görüntüleme' },
            ur: { hijri: '📿 ہجری تاریخ کے مطابق نمائش', greg: '📅 میلادی تاریخ کے مطابق نمائش' },
            de: { hijri: '📿 Anzeige nach Hidschri-Datum', greg: '📅 Anzeige nach gregorianischem Datum' },
            id: { hijri: '📿 Dilihat menurut tanggal Hijriah', greg: '📅 Dilihat menurut tanggal Masehi' },
            es: { hijri: '📿 Vista por fecha hijrí', greg: '📅 Vista por fecha gregoriana' },
            bn: { hijri: '📿 হিজরি তারিখ অনুযায়ী দেখা', greg: '📅 গ্রেগরীয় তারিখ অনুযায়ী দেখা' },
            ms: { hijri: '📿 Paparan mengikut tarikh Hijrah', greg: '📅 Paparan mengikut tarikh Masihi' }
        };
        const _badgeTextSsr = _isMoonDatePage
            ? ((_BADGE_TEXT[Lm] || _BADGE_TEXT.en)[_moonDateIsHijriSsr ? 'hijri' : 'greg'])
            : '';
        const _badgeClassSsr = _moonDateIsHijriSsr ? 'moon-date-badge hijri' : 'moon-date-badge gregorian';
        // استبدال H1 موقع القمر + حقن شريط الـ subtitle والـ badge بعده (فقط على صفحة تاريخ محدَّد)
        const _badgeHtmlSsr = (_isMoonDatePage && _badgeTextSsr)
            ? `<div class="${_badgeClassSsr}" id="moon-date-badge">${_escHtml(_badgeTextSsr)}</div>`
            : '';
        const _subtitleHtmlSsr = (_isMoonDatePage && _subtitleTextSsr)
            ? `<p class="moon-subtitle-hijri" id="moon-subtitle-hijri">${_escHtml(_subtitleTextSsr)}</p>`
            : '';
        html = html.replace(
            /<h1 class="page-h1" id="moon-page-h1"[^>]*>[^<]*<\/h1>/,
            `<h1 class="page-h1" id="moon-page-h1" data-i18n="moon.h1">${_escHtml(_h1Moon)}</h1>${_subtitleHtmlSsr}${_badgeHtmlSsr}`
        );
        // ── Round 14 polish #4: Breadcrumb SSR — يعرض التاريخ الهجريّ أو الميلاديّ حسب نوع URL ──
        //   قبل: bc-date يبقى hidden حتى JS. الآن: نحقنه في SSR بلغة الزائر مع التسمية الصحيحة
        //   ليراه الزائر بلا JS وتراه محرّكات البحث مباشرةً.
        if (_isMoonDatePage) {
            // Round 18-B: breadcrumb يُشير إلى hub (/moon-in-{slug}) → النصّ يصبح "تقويم القمر في {City}"
            //   إصلاح تناقض الدلالة: سابقاً كان "القمر اليوم في..." مع رابط hub (بلا "اليوم") → misleading.
            const _BC_MOON_CITY = {
                ar: `تقويم القمر في ${cityName}`,
                en: `Moon Calendar in ${cityName}`,
                fr: `Calendrier de la Lune à ${cityName}`,
                tr: `${cityName} Ay Takvimi`,
                ur: `${cityName} کا چاند کا تقویم`,
                de: `Mondkalender für ${cityName}`,
                id: `Kalender Bulan di ${cityName}`,
                es: `Calendario Lunar en ${cityName}`,
                bn: `${cityName}-এর চাঁদের পঞ্জিকা`,
                ms: `Kalendar Bulan di ${cityName}`
            };
            const _bcMoonTextSsr = _BC_MOON_CITY[Lm] || _BC_MOON_CITY.en;
            // رابط نسبيّ — يعمل من أيّ host، ولا يحتاج origin في هذا الـ scope
            // Round 16: city breadcrumb يشير إلى hub (/moon-in-{slug}) — parent canonical للمدينة.
            // يتطابق مع JSON-LD BreadcrumbList فوق لتجنّب rich-result mismatch في Google.
            const _bcCityHref = (Lm === 'ar' ? '' : '/' + Lm) + '/moon-in-' + seo.moonCity.slug;
            // استبدال عنصر bc-moon: من current-page (بلا href) إلى رابط قابل للضغط باسم المدينة
            html = html.replace(
                /<a class="bc-moon" id="bc-moon"[^>]*>[^<]*<\/a>/,
                `<a class="bc-moon" id="bc-moon" href="${_escHtml(_bcCityHref)}">${_escHtml(_bcMoonTextSsr)}</a>`
            );
            // استبدال bc-date-sep (إزالة hidden)
            html = html.replace(
                /<span class="bc-sep bc-date-sep" id="bc-date-sep" hidden>›<\/span>/,
                `<span class="bc-sep bc-date-sep" id="bc-date-sep">›</span>`
            );
            // استبدال bc-date: إزالة hidden + حقن التسمية الرئيسيّة (هجريّة أو ميلاديّة)
            html = html.replace(
                /<span class="bc-date" id="bc-date" aria-current="page" hidden><\/span>/,
                `<span class="bc-date" id="bc-date" aria-current="page">${_escHtml(_primaryDateLabelSsr)}</span>`
            );
        }
        // قوالب الفقرة التعريفيّة (fallback — بدون JS) — تُستبدَل لاحقًا بالنصّ الديناميكيّ
        const _introMoon = {
            ar: `اليوم في ${cityName}، ${countryName}، يمكنك معرفة طور القمر ونسبة إضاءته وعمره وموعد شروقه وغروبه بدقّة فلكيّة. تُحسب هذه البيانات باستخدام نماذج فلكيّة دقيقة (خوارزميّات Meeus) بناءً على إحداثيّات موقعك.`,
            en: `Today in ${cityName}, ${countryName}, you can check the current moon phase, illumination percentage, moon age, moonrise and moonset times with astronomical precision. These figures are computed with rigorous astronomical models (Meeus algorithms) based on your location coordinates.`,
            fr: `Aujourd\u2019hui à ${cityName}, ${countryName}, vous pouvez connaître la phase actuelle de la Lune, le pourcentage d\u2019illumination, son âge, ainsi que les heures de lever et coucher, avec précision astronomique. Ces données sont calculées à l\u2019aide de modèles astronomiques rigoureux (algorithmes de Meeus) sur la base des coordonnées de votre emplacement.`,
            tr: `Bugün ${cityName}, ${countryName} için Ayın güncel evresini, aydınlanma yüzdesini, yaşını ve doğuş/batış zamanlarını astronomik doğrulukla öğrenebilirsiniz. Bu veriler, konumunuzun koordinatlarına dayalı titiz astronomik modellerle (Meeus algoritmaları) hesaplanır.`,
            ur: `آج ${cityName}، ${countryName} میں آپ چاند کے موجودہ مرحلے، روشنی کی فیصد، عمر، اور طلوع و غروب کے اوقات کو فلکیاتی درستگی کے ساتھ معلوم کر سکتے ہیں۔ یہ اعداد و شمار آپ کے مقام کے نقاط کی بنیاد پر سخت فلکیاتی ماڈلز (Meeus الگورتھم) سے حساب کیے جاتے ہیں۔`,
            de: `Heute in ${cityName}, ${countryName} können Sie die aktuelle Mondphase, den Beleuchtungsanteil, das Mondalter sowie die Auf- und Untergangszeiten mit astronomischer Präzision ermitteln. Diese Werte werden mit strengen astronomischen Modellen (Meeus-Algorithmen) auf Grundlage Ihrer Standortkoordinaten berechnet.`,
            id: `Hari ini di ${cityName}, ${countryName}, Anda dapat mengetahui fase Bulan saat ini, persentase pencahayaan, usia Bulan, serta waktu terbit dan terbenamnya dengan presisi astronomi. Data ini dihitung menggunakan model astronomi yang teliti (algoritma Meeus) berdasarkan koordinat lokasi Anda.`,
            es: `Hoy en ${cityName}, ${countryName} puedes conocer la fase actual de la Luna, el porcentaje de iluminación, su edad y las horas de salida y puesta con precisión astronómica. Estos datos se calculan mediante modelos astronómicos rigurosos (algoritmos de Meeus) basados en las coordenadas de tu ubicación.`,
            bn: `আজ ${cityName}, ${countryName}-এ আপনি চাঁদের বর্তমান পর্যায়, আলোকসজ্জার শতাংশ, চাঁদের বয়স এবং উদয়-অস্তের সময় জ্যোতির্বৈজ্ঞানিক নির্ভুলতার সাথে জানতে পারেন। এই তথ্যগুলি আপনার অবস্থানের স্থানাঙ্কের উপর ভিত্তি করে কঠোর জ্যোতির্বৈজ্ঞানিক মডেল (Meeus অ্যালগরিদম) দিয়ে গণনা করা হয়।`,
            ms: `Hari ini di ${cityName}, ${countryName}, anda boleh mengetahui fasa Bulan semasa, peratusan pencahayaan, usia Bulan, serta waktu terbit dan terbenamnya dengan ketepatan astronomi. Data ini dikira menggunakan model astronomi yang teliti (algoritma Meeus) berdasarkan koordinat lokasi anda.`
        }[Lm] || `Today in ${cityName}, ${countryName}, check the current moon phase, illumination, age, and rise/set times with astronomical precision.`;
        // نصّ ديناميكيّ بأرقام حقيقيّة (SSR) — إن فشل نُعيد النصّ الثابت.
        // cityLabel يدمج المدينة والبلد لحقنها في {city} داخل قوالب i18n.
        // الفاصل: ، في العربيّة/الأردو، و , في باقي اللغات — ليطابق ما يعرضه العميل.
        const _sepMoon = (Lm === 'ar' || Lm === 'ur') ? '، ' : ', ';
        const _cityLabel = countryName ? `${cityName}${_sepMoon}${countryName}` : cityName;
        // Round 17 (smart content): على صفحات التاريخ نمرّر dateObj + dateLabel + hijriLabel
        //   → أرقام حقيقيّة + فقرة فريدة بتاريخها (Gregorian + Hijri) — anti-thin-content.
        const _introDateObj = (_isMoonDatePage && seo.moonCity.dateObj) ? seo.moonCity.dateObj : null;
        const _introDateLabel = _isMoonDatePage ? (seo.moonCity.dateLabel || '') : '';
        const _introHijriLabel = _isMoonDatePage ? (seo.moonCity.hijriLabelWithSfx || seo.moonCity.hijriLabel || '') : '';
        const _introMoonDynamic = _buildSsrMoonIntro(
            Lm, _cityLabel, seo.moonCity.lat, seo.moonCity.lng,
            _introDateObj, _introDateLabel, _introHijriLabel
        ) || _introMoon;
        // الفقرة التعريفيّة: استبدال النصّ الافتراضيّ داخل <p class="moon-intro">
        // ملاحظة: نُسقِط data-i18n عمدًا — حتى لا يدوس الـ auto-binder على نصّنا الغنيّ بـ fallback يحوي {city} حرفيًّا.
        // الفقرة ستُحدَّث لاحقًا عبر app.js (#moon-intro by id) بالبيانات الحيّة من المستخدم.
        html = html.replace(
            /<p class="moon-intro" id="moon-intro"[^>]*>[^<]*<\/p>/,
            `<p class="moon-intro" id="moon-intro">${_escHtml(_introMoonDynamic)}</p>`
        );
        // حقن Article Schema (JSON-LD) لصفحة القمر — "محدَّث يوميًّا"
        try {
            const nowIso = new Date().toISOString();
            // على صفحة تاريخ محدَّد: datePublished/dateModified = التاريخ المطلوب
            const _dateIso = (_isMoonDatePage && seo.moonCity.dateObj)
                ? seo.moonCity.dateObj.toISOString()
                : nowIso;
            const articleSchema = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": _h1Moon,
                "datePublished": _dateIso,
                "dateModified": _dateIso,
                "author": { "@type": "Organization", "name": seo.siteName || 'Prayer Times' },
                "publisher": { "@type": "Organization", "name": seo.siteName || 'Prayer Times' },
                "inLanguage": Lm,
                "mainEntityOfPage": seo.canonical,
                "articleBody": _introMoonDynamic
            };
            const articleJsonLd = `<script id="ssr-moon-article-schema" type="application/ld+json">${JSON.stringify(articleSchema)}</script>`;
            // أدرِج قبل </head>
            html = html.replace('</head>', `    ${articleJsonLd}\n</head>`);
        } catch(_e) { /* silent */ }

        // ═════════════════════════════════════════════════════════════════════
        // ROUND 17: Elite Polish — 3 تحسينات (Cross-Links / Calendar / Smart Content)
        // ═════════════════════════════════════════════════════════════════════

        // ── (17-A) Hub pages: تحويل cities-grid من today→today إلى hub→hub ──
        //   حصريّاً على /moon-in-{slug} (بدون تاريخ). يربط الـ hubs ببعضها لبناء City Network.
        if (_isMoonHubPageSsr) {
            // استبدل كلّ href="/moon-today-in-X" أو href="/en/moon-today-in-X" داخل .moon-cities-grid
            // إلى /moon-in-X (حصريّاً داخل <ul class="moon-cities-grid">…</ul> — لا نمسّ أيّ رابط آخر).
            html = html.replace(
                /(<ul class="moon-cities-grid">[\s\S]*?<\/ul>)/,
                function (gridHtml) {
                    return gridHtml
                        .replace(/href="\/moon-today-in-/g, 'href="/moon-in-')
                        .replace(/href="\/(en|fr|tr|ur|de|id|es|bn|ms)\/moon-today-in-/g, 'href="/$1/moon-in-');
                }
            );
        }

        // ── (17-B) Hub pages: حقن Calendar Grid (يوم ± 3) قبل جدول التوقّعات ──
        //   كلّ خليّة: يوم نسبيّ (أمس/اليوم/غدًا/+2/…) + تاريخ + أيقونة طور + رابط /moon-in-{slug}/{iso}.
        //   يَكشف Googlebot 7 روابط تاريخ فوريّاً لكلّ hub → discovery أسرع.
        if (_isMoonHubPageSsr && MoonCalc && typeof MoonCalc.getPhaseName === 'function') {
            try {
                // UAT-Moon-City-Hub-Polish: include "أطوار" + city in calendar H2 so it
                //   reads "تقويم أطوار القمر في {city} — أبريل 2026" (was just
                //   "تقويم القمر — أبريل 2026" — same on every city, not city-specific).
                const _hubCalTitles = {
                    ar: 'تقويم أطوار القمر في ' + cityName,
                    en: 'Moon phase calendar for ' + cityName,
                    fr: 'Calendrier des phases lunaires à ' + cityName,
                    tr: cityName + ' Ay Evresi Takvimi',
                    ur: cityName + ' میں چاند کے مراحل کا تقویم',
                    de: 'Mondphasenkalender für ' + cityName,
                    id: 'Kalender fase Bulan di ' + cityName,
                    es: 'Calendario de fases lunares en ' + cityName,
                    bn: cityName + '-এ চাঁদের দশার ক্যালেন্ডার',
                    ms: 'Kalendar fasa Bulan di ' + cityName
                };
                const _hubCalTodayLbl = {
                    ar: 'اليوم', en: 'Today', fr: "Aujourd'hui", tr: 'Bugün', ur: 'آج',
                    de: 'Heute', id: 'Hari ini', es: 'Hoy', bn: 'আজ', ms: 'Hari ini'
                };
                const _hubCalYesterdayLbl = {
                    ar: 'أمس', en: 'Yesterday', fr: 'Hier', tr: 'Dün', ur: 'کل (گزشتہ)',
                    de: 'Gestern', id: 'Kemarin', es: 'Ayer', bn: 'গতকাল', ms: 'Semalam'
                };
                const _hubCalTomorrowLbl = {
                    ar: 'غدًا', en: 'Tomorrow', fr: 'Demain', tr: 'Yarın', ur: 'کل (آنے والا)',
                    de: 'Morgen', id: 'Besok', es: 'Mañana', bn: 'আগামীকাল', ms: 'Esok'
                };
                // Arabic plural ruleset for relative-day labels:
                //   1 → "يوم" (singular)
                //   2 → "يومين" (dual)
                //   3-10 → "{n} أيّام" (sound plural)
                //   11+ → "{n} يومًا" (singular accusative for tamyiz)
                // Phase M5-b (2026-05-03): future cells use "خلال {n}" instead of
                // "بعد {n}" to reduce SEOptimer Keyword Consistency noise (the word
                // "بعد" was repeated ~14× per Hub page across calendar future cells +
                // upcoming-phases summaries). "قبل {n}" for past UNCHANGED — there's
                // no equivalent reduction path for past cells.
                const _hubCalDaysFmt = {
                    ar: (n) => {
                        const _abs = Math.abs(n);
                        let _unit;
                        if (_abs === 1)               _unit = 'يوم';
                        else if (_abs === 2)          _unit = 'يومين';
                        else if (_abs >= 3 && _abs <= 10) _unit = `${_abs} أيّام`;
                        else                          _unit = `${_abs} يومًا`;
                        return n > 0 ? `خلال ${_unit}` : `قبل ${_unit}`;
                    },
                    en: (n) => (n > 0 ? `In ${n} days` : `${Math.abs(n)} days ago`),
                    fr: (n) => (n > 0 ? `Dans ${n} jours` : `Il y a ${Math.abs(n)} jours`),
                    tr: (n) => (n > 0 ? `${n} gün sonra` : `${Math.abs(n)} gün önce`),
                    ur: (n) => (n > 0 ? `${n} دن بعد` : `${Math.abs(n)} دن پہلے`),
                    de: (n) => (n > 0 ? `In ${n} Tagen` : `Vor ${Math.abs(n)} Tagen`),
                    id: (n) => (n > 0 ? `${n} hari lagi` : `${Math.abs(n)} hari lalu`),
                    es: (n) => (n > 0 ? `En ${n} días` : `Hace ${Math.abs(n)} días`),
                    bn: (n) => (n > 0 ? `${n} দিন পরে` : `${Math.abs(n)} দিন আগে`),
                    ms: (n) => (n > 0 ? `${n} hari lagi` : `${Math.abs(n)} hari lalu`)
                };
                const _gMonthShortLang = {
                    ar: ['ينا','فبر','مار','أبر','ماي','يون','يول','أغس','سبت','أكت','نوف','ديس'],
                    en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                    fr: ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'],
                    tr: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
                    ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
                    de: ['Jan.','Feb.','März','Apr.','Mai','Juni','Juli','Aug.','Sept.','Okt.','Nov.','Dez.'],
                    id: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
                    es: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
                    bn: ['জানু','ফেব','মার','এপ্রি','মে','জুন','জুল','আগ','সেপ্টে','অক্টো','নভে','ডিসে'],
                    ms: ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep','Okt','Nov','Dis']
                };
                const _pad2Hc = (n) => (n < 10 ? '0' + n : String(n));
                const _isoOf = (d) => d.getFullYear() + '-' + _pad2Hc(d.getMonth() + 1) + '-' + _pad2Hc(d.getDate());
                const _calTodayD = new Date(); _calTodayD.setHours(12, 0, 0, 0);
                const _langPrefixHc = (Lm === 'ar' ? '' : '/' + Lm);
                // Resolve the per-language relative-label helpers (used by the per-cell
                // "اليوم / أمس / غدًا / قبل X أيّام" label).
                const _calToday     = _hubCalTodayLbl[Lm]     || _hubCalTodayLbl.en;
                const _calYesterday = _hubCalYesterdayLbl[Lm] || _hubCalYesterdayLbl.en;
                const _calTomorrow  = _hubCalTomorrowLbl[Lm]  || _hubCalTomorrowLbl.en;
                const _calDaysFn    = _hubCalDaysFmt[Lm]      || _hubCalDaysFmt.en;

                // ═══ UAT-Moon-Hub-Cal / UAT-Moon-Hub-Month: full-month calendar ═════════
                // Priority order for which month to display:
                //   1. URL path /moon-in-{slug}/YYYY-MM → seo.moonCity.isMonthPage
                //      (highest — explicit visitor intent in canonical URL).
                //   2. ?cal=YYYY-MM query (legacy; 301-redirected at the route layer).
                //   3. ?cal-y=YYYY&cal-m=MM no-JS form fallback.
                //   4. Default → current month.
                let _calQ = '';
                if (seo.moonCity && seo.moonCity.isMonthPage && seo.moonCity.monthYear && seo.moonCity.monthMonth) {
                    _calQ = `${seo.moonCity.monthYear}-${String(seo.moonCity.monthMonth).padStart(2, '0')}`;
                } else {
                    try {
                        const _qsP = new URLSearchParams(qs || '');
                        _calQ = _qsP.get('cal') || '';
                        if (!_calQ) {
                            const _yQ = _qsP.get('cal-y');
                            const _mQ = _qsP.get('cal-m');
                            if (_yQ && _mQ) _calQ = `${_yQ}-${String(_mQ).padStart(2, '0')}`;
                        }
                    } catch (_) {}
                }
                const _calM = /^(\d{4})-(\d{1,2})$/.exec(_calQ);
                const _calY = _calM
                    ? Math.max(_calTodayD.getFullYear() - 5, Math.min(_calTodayD.getFullYear() + 5, parseInt(_calM[1], 10)))
                    : _calTodayD.getFullYear();
                const _calMo = _calM
                    ? Math.max(1, Math.min(12, parseInt(_calM[2], 10)))
                    : (_calTodayD.getMonth() + 1);
                const _calFirstD = new Date(_calY, _calMo - 1, 1, 12, 0, 0);
                const _calLastDay = new Date(_calY, _calMo, 0).getDate();
                const _calFirstWday = _calFirstD.getDay(); // 0=Sun..6=Sat

                // Localized full month names (used in the title + picker options)
                const _gMonthFullLang = {
                    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
                    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                    fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
                    tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
                    ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
                    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
                    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
                    es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
                    bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
                    ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']
                };
                // Localized weekday short names (Sun..Sat per Date.getDay() index)
                const _wdayShortLang = {
                    ar: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
                    en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
                    fr: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
                    tr: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
                    ur: ['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ'],
                    de: ['So','Mo','Di','Mi','Do','Fr','Sa'],
                    id: ['Min','Sen','Sel','Rab','Kam','Jum','Sab'],
                    es: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
                    bn: ['রবি','সোম','মঙ্গল','বুধ','বৃহঃ','শুক্র','শনি'],
                    ms: ['Aha','Isn','Sel','Rab','Kha','Jum','Sab']
                };
                // Picker / nav labels
                const _hubCalPrevLbl = {
                    ar: '‹ الشهر السابق', en: '‹ Previous month', fr: '‹ Mois précédent', tr: '‹ Önceki ay',
                    ur: '‹ پچھلا مہینہ', de: '‹ Vorheriger Monat', id: '‹ Bulan sebelumnya', es: '‹ Mes anterior',
                    bn: '‹ আগের মাস', ms: '‹ Bulan sebelumnya'
                };
                const _hubCalNextLbl = {
                    ar: 'الشهر التالي ›', en: 'Next month ›', fr: 'Mois suivant ›', tr: 'Sonraki ay ›',
                    ur: 'اگلا مہینہ ›', de: 'Nächster Monat ›', id: 'Bulan berikutnya ›', es: 'Mes siguiente ›',
                    bn: 'পরের মাস ›', ms: 'Bulan seterusnya ›'
                };
                const _hubCalShowBtn = {
                    ar: 'عرض', en: 'Show', fr: 'Afficher', tr: 'Göster', ur: 'دکھائیں',
                    de: 'Anzeigen', id: 'Tampilkan', es: 'Mostrar', bn: 'দেখান', ms: 'Tunjuk'
                };
                const _gMonthsFull = _gMonthFullLang[Lm] || _gMonthFullLang.en;
                const _wdayLbls = _wdayShortLang[Lm] || _wdayShortLang.en;
                const _calPrev = _hubCalPrevLbl[Lm] || _hubCalPrevLbl.en;
                const _calNext = _hubCalNextLbl[Lm] || _hubCalNextLbl.en;
                const _calBtn  = _hubCalShowBtn[Lm] || _hubCalShowBtn.en;
                // Title now reads "📆 تقويم القمر — أبريل 2026" (month + year, dynamic)
                const _calTitle = `📆 ${_hubCalTitles[Lm] || _hubCalTitles.en} — ${_gMonthsFull[_calMo - 1]} ${_calY}`;
                // Use _gMonthFullLang for the per-cell month label (e.g. "29 أبريل" — full name).
                //   The cell layout is generous enough for the full name; abbreviations
                //   like "أبر" felt clipped, so we use "يناير / فبراير / مارس / ..." here.
                const _gMonthsShort = _gMonthFullLang[Lm] || _gMonthFullLang.en;
                // Compute today's day-of-year-style offset (in days) for any cell so
                // we can produce a relative label like "قبل 3 أيّام / اليوم / بعد X يوم".
                const _msPerDay = 24 * 60 * 60 * 1000;
                const _calTodayMs = _calTodayD.getTime();
                // Build cells: leading empty cells, then real days
                let _calCellsHtml = '';
                for (let i = 0; i < _calFirstWday; i++) {
                    _calCellsHtml += '<li class="moon-hub-cal-cell moon-hub-cal-cell--empty" aria-hidden="true"></li>';
                }
                // UAT-Moon-Hub-Cal-PhaseNames: per-cell phase NAME (in addition
                //   to the emoji). Look up via i18n key from MoonCalc.getPhaseName().
                //   Short forms preferred for cell brevity (e.g. "بدر" not
                //   "بدر (قمر مكتمل)") — i18n.js values used as-is per language.
                const _i18nDictHc = (TRANSLATIONS_BY_LANG && TRANSLATIONS_BY_LANG[Lm]) || {};
                const _i18nEnHc   = (TRANSLATIONS_BY_LANG && TRANSLATIONS_BY_LANG.en) || {};
                const _phaseName = (key) => {
                    if (!key) return '';
                    const v = _i18nDictHc[key];
                    if (typeof v === 'string') return v;
                    const e = _i18nEnHc[key];
                    return typeof e === 'string' ? e : '';
                };
                for (let day = 1; day <= _calLastDay; day++) {
                    const _cellD = new Date(_calY, _calMo - 1, day, 12, 0, 0);
                    const _cellIso = _isoOf(_cellD);
                    const _cellPhase = MoonCalc.getPhaseName(_cellD) || { icon: '🌕' };
                    const _isToday = (
                        _calTodayD.getFullYear() === _calY
                        && _calTodayD.getMonth() === _calMo - 1
                        && _calTodayD.getDate() === day
                    );
                    // Relative offset in days from today (positive = future, negative = past)
                    const _offset = Math.round((_cellD.getTime() - _calTodayMs) / _msPerDay);
                    let _cellLabel;
                    if (_offset === 0)        _cellLabel = _calToday;
                    else if (_offset === -1)  _cellLabel = _calYesterday;
                    else if (_offset === 1)   _cellLabel = _calTomorrow;
                    else                      _cellLabel = _calDaysFn(_offset);
                    const _cellDateTxt = day + ' ' + _gMonthsShort[_calMo - 1];
                    const _cellHref = _isToday
                        ? (_langPrefixHc + '/moon-today-in-' + seo.moonCity.slug)
                        : (_langPrefixHc + '/moon-in-' + seo.moonCity.slug + '/' + _cellIso);
                    const _cellActive = _isToday ? ' moon-hub-cal-cell--today' : '';
                    const _cellPhaseNameTxt = _phaseName(_cellPhase.key) || _cellPhase.name || _cellPhase.english || '';
                    _calCellsHtml += `<li class="moon-hub-cal-cell${_cellActive}"><a href="${_escHtml(_cellHref)}">`
                        + `<span class="moon-hub-cal-rel">${_escHtml(_cellLabel)}</span>`
                        + `<span class="moon-hub-cal-date">${_escHtml(_cellDateTxt)}</span>`
                        + `<span class="moon-hub-cal-phase" aria-hidden="true">${_cellPhase.icon || '🌕'}</span>`
                        + `<span class="moon-hub-cal-phase-name">${_escHtml(_cellPhaseNameTxt)}</span>`
                        + `</a></li>`;
                }
                // Weekday header row
                let _calWdHtml = '';
                for (let w = 0; w < 7; w++) {
                    _calWdHtml += `<li class="moon-hub-cal-wd">${_escHtml(_wdayLbls[w])}</li>`;
                }
                // Prev/next month nav. UAT-Moon-Hub-Month: emit PATH-based URLs
                //   /moon-in-{slug}/YYYY-MM (the canonical month-page URL) — clean,
                //   without the `#moon-hub-cal` fragment. JS auto-scrolls to the
                //   calendar after page load when on a month URL (see app.js).
                const _prevMo = (_calMo === 1) ? { y: _calY - 1, m: 12 } : { y: _calY, m: _calMo - 1 };
                const _nextMo = (_calMo === 12) ? { y: _calY + 1, m: 1 } : { y: _calY, m: _calMo + 1 };
                const _hubPath = _langPrefixHc + '/moon-in-' + seo.moonCity.slug;
                const _prevHref = `${_hubPath}/${_prevMo.y}-${_pad2Hc(_prevMo.m)}`;
                const _nextHref = `${_hubPath}/${_nextMo.y}-${_pad2Hc(_nextMo.m)}`;
                // Year/Month picker form (no-JS fallback uses cal-y + cal-m;
                // the JS handler in app.js auto-submits + folds them into cal=YYYY-MM)
                let _yearOptsHtml = '';
                for (let y = _calTodayD.getFullYear() - 5; y <= _calTodayD.getFullYear() + 5; y++) {
                    _yearOptsHtml += `<option value="${y}"${y === _calY ? ' selected' : ''}>${y}</option>`;
                }
                let _moOptsHtml = '';
                for (let m = 1; m <= 12; m++) {
                    _moOptsHtml += `<option value="${m}"${m === _calMo ? ' selected' : ''}>${_escHtml(_gMonthsFull[m - 1])}</option>`;
                }
                // Picker form action: clean hub path. The 301 redirect for
                //   ?cal-y/?cal-m sends the visitor to the canonical /YYYY-MM
                //   path WITHOUT the fragment; JS auto-scrolls to the calendar.
                const _pickerActionHref = _hubPath;
                const _pickerHtml = `<form class="moon-hub-cal-picker" method="get" action="${_escHtml(_pickerActionHref)}" role="search">`
                    + `<select name="cal-y" aria-label="Year">${_yearOptsHtml}</select>`
                    + `<select name="cal-m" aria-label="Month">${_moOptsHtml}</select>`
                    + `<button type="submit">${_escHtml(_calBtn)}</button>`
                    + `</form>`;
                const _navHtml = `<nav class="moon-hub-cal-nav" aria-label="Month navigation">`
                    + `<a class="moon-hub-cal-prev" href="${_escHtml(_prevHref)}">${_escHtml(_calPrev)}</a>`
                    + `<a class="moon-hub-cal-next" href="${_escHtml(_nextHref)}">${_escHtml(_calNext)}</a>`
                    + `</nav>`;
                // ── UAT-Moon-City-Hub-Polish: CTA hub → /moon-today-in-{slug} ──
                //   The CTA was pointing at /moon-in-{slug}/{today-iso} (the
                //   dated day page). Per user, redirect at the today snapshot
                //   page (/moon-today-in-{city}) — that page is the dedicated
                //   today-focused experience, while /moon-in-{city} is the
                //   permanent calendar hub. Clear separation of roles.
                const _hubDetailCtaTpl = {
                    ar: `📅 عرض حالة القمر اليوم في ${cityName}`,
                    en: `📅 View today's moon status in ${cityName}`,
                    fr: `📅 Voir l'état de la Lune aujourd'hui à ${cityName}`,
                    tr: `📅 ${cityName} için bugünün ay durumunu görüntüle`,
                    ur: `📅 ${cityName} میں آج کے چاند کی حالت دیکھیں`,
                    de: `📅 Mondstatus heute in ${cityName} ansehen`,
                    id: `📅 Lihat status Bulan hari ini di ${cityName}`,
                    es: `📅 Ver el estado de la Luna hoy en ${cityName}`,
                    bn: `📅 ${cityName}-এ আজ চাঁদের অবস্থা দেখুন`,
                    ms: `📅 Lihat status Bulan hari ini di ${cityName}`
                };
                const _hubDetailCtaText = _hubDetailCtaTpl[Lm] || _hubDetailCtaTpl.en;
                const _hubDetailCtaHref = _langPrefixHc + '/moon-today-in-' + seo.moonCity.slug;
                const _hubDetailCtaHtml = `<a class="moon-hub-detail-cta" href="${_escHtml(_hubDetailCtaHref)}">${_escHtml(_hubDetailCtaText)}</a>`;
                // id="moon-hub-cal" lets prev/next/picker URLs use #moon-hub-cal
                //   fragment to scroll the visitor straight back to the calendar
                //   widget after a month navigation. tabindex=-1 prevents the
                //   anchor jump from also stealing focus from interactive children.
                const _hubCalHtml = `<div class="section-card moon-hub-calendar-card" id="moon-hub-cal" tabindex="-1">`
                    + `<div class="moon-hub-cal-header">`
                    +   `<h2 class="moon-hub-cal-title">${_escHtml(_calTitle)}</h2>`
                    +   _pickerHtml
                    + `</div>`
                    + _navHtml
                    + `<ul class="moon-hub-cal-wd-row">${_calWdHtml}</ul>`
                    + `<ul class="moon-hub-cal-grid">${_calCellsHtml}</ul>`
                    + `</div>\n                ${_hubDetailCtaHtml}`;
                // Round 19: حقن قبل قسم "الأطوار القادمة" (بدل قبل moon-forecast-cta الذي سيُحذف)
                //   النتيجة: [Hero] → [Summary] → [Moon visual + 4 cards] → [Calendar Grid] → [CTA] → [Upcoming] → [Cities]
                html = html.replace(
                    /(<section class="section-card moon-upcoming-section")/,
                    _hubCalHtml + '\n                $1'
                );
            } catch (_eCal) { /* silent — fall back to no calendar */ }
        }

        // ═════════════════════════════════════════════════════════════════════
        // ROUND 18: Hub Entry Points — يحوّل الـ hub من صفحة SEO مخفيّة إلى مدخل استكشاف بارز
        // ═════════════════════════════════════════════════════════════════════

        // ═════════════════════════════════════════════════════════════════════
        // ROUND 19: Hub Trimming — تحويل /moon-in-{city} إلى صفحة توجيه خفيفة
        //   الفلسفة: Today = حالة الآن • Dated = تحليل يوم محدَّد • Hub = استكشاف + تنقل
        //   نحذف: Chart 7d، 14-day table، Events countdown، FAQ (×2)، Evergreen،
        //         moon-comparison، moon-phase-insight، moon-highlights،
        //         4 بطاقات ثقيلة (moonset/distance/next-full/next-new)، moon-forecast-cta.
        //   نُبقي: H1، Summary line، Moon visual + 4 cards، Calendar Grid (مصعَّد)،
        //         CTA "استعرض تفاصيل اليوم"، Upcoming phases، Cities Grid.
        //   ~74% تخفيف من ~8200px → ~2100px.
        // ═════════════════════════════════════════════════════════════════════
        if (_isMoonHubPageSsr) {
            // (19-A) حذف كتلة بعد upcoming-section: events + chart + forecast-cta + forecast.
            //   يُستخدم anchor بين "<!-- 🆕 Wave A" (بداية events) و "<!-- القمر في مدن أخرى" (بداية cities).
            html = html.replace(
                /<!-- 🆕 Wave A: عدّ تنازليّ[\s\S]*?(?=<!-- القمر في مدن أخرى)/,
                ''
            );
            // (19-B) حذف FAQ المدينة (بعد cities) → قبل FAQ العامّ.
            html = html.replace(
                /<!-- FAQ — City-specific[\s\S]*?(?=<!-- FAQ — General Astronomy)/,
                ''
            );
            // (19-C) حذف FAQ العامّ → قبل Evergreen.
            html = html.replace(
                /<!-- FAQ — General Astronomy[\s\S]*?(?=<!-- Evergreen content)/,
                ''
            );
            // (19-D) حذف Evergreen فقط → قبل بداية أقسام Phase-B (الفاصل ════).
            //   Phase D3.1.3b fix: المخطّط القديم كان يحذف حتى تعليق "صفحة حاسبة الزكاة"
            //   فيلتهم B1/B2/B3/B4 sections التي يجب أن تظهر على hub. الحلّ: انتهاء
            //   الـ regex عند الفاصل ════ الذي يبدأ block الـ Phase-B.
            html = html.replace(
                /<!-- Evergreen content[\s\S]*?(?=<!-- ════)/,
                ''
            );
            // (19-E) حذف blocks فرعيّة داخل section-card الـ "details":
            //   moon-comparison (yesterday→today): thick, "حالة اليوم" لا تناسب hub.
            html = html.replace(
                /<!-- Yesterday vs Today[\s\S]*?<div class="moon-comparison"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
                ''
            );
            //   moon-phase-insight (3 سطور تفسيريّة): verbose.
            html = html.replace(
                /<!-- Phase Insight[\s\S]*?<div class="moon-phase-insight"[\s\S]*?<\/div>\s*<\/div>/,
                ''
            );
            //   moon-highlights (next full + next new + visibility): redundant (upcoming يغطّي الأطوار).
            //   FIX (rev2): cannot rely on counting consecutive </div> — moon-hl-item-full ALSO
            //   ends with `</div></div></div>` (sub close + body close + item close), so the
            //   3-consecutive pattern matches there too and leaves items 2+3 orphaned.
            //   Use a lookahead anchor on the next outer comment (`<!-- 🆕 Priority C`) which
            //   only appears AFTER moon-highlights closes (at the upcoming-section boundary).
            html = html.replace(
                /<!-- 🆕 Quick Highlights[\s\S]*?<\/div>(?=\s*<\/div>\s*<!-- 🆕 Priority C)/,
                ''
            );
            // (19-F) حذف 4 بطاقات داخل moon-details → نُبقي 4 فقط (age, illumination, zodiac, moonrise).
            //   نستخدم id داخل الـ value لتمييز البطاقة بدقّة (كلّ id فريد على الصفحة).
            const _stripCardByValueId = (valueId) => {
                const rx = new RegExp(
                    '<div class="moon-detail-card[^"]*">\\s*<div class="label"[^>]*>[^<]*</div>\\s*<div class="value" id="' + valueId + '"[^>]*>[^<]*</div>(?:\\s*<div class="value-sub"[^>]*>[^<]*</div>)?\\s*</div>',
                    'i'
                );
                html = html.replace(rx, '');
            };
            // UAT-Moon-City-Hub-Polish: keep all 8 cards on hub (was stripping
            //   moon-set, next-full-moon, next-new-moon, moon-distance to leave
            //   only 4). User asked for the full reference — hub IS the city's
            //   permanent reference page, so all 8 stay visible.
            // _stripCardByValueId('moon-set');
            // _stripCardByValueId('next-full-moon');
            // _stripCardByValueId('next-new-moon');
            // _stripCardByValueId('moon-distance');
            // (19-G) moon-forecast-cta حُذف من index.html — لا حاجة للحذف هنا (no-op).
            // (19-H) استبدال moon-intro (فقرة طويلة multi-line) بسطر واحد توجيهيّ مختصر.
            const _hubIntroTpl = {
                ar: `استعرض طور القمر الحاليّ في ${cityName}، والتنقّل بين التواريخ القادمة والسابقة، ومتابعة التقويم القمريّ والهجريّ.`,
                en: `Explore the current moon phase in ${cityName}, navigate past and future dates, and follow the lunar and Hijri calendar.`,
                fr: `Explorez la phase actuelle de la Lune à ${cityName}, naviguez entre les dates passées et futures, et suivez le calendrier lunaire et hégirien.`,
                tr: `${cityName} için geçerli Ay evresini keşfedin, geçmiş ve gelecek tarihler arasında gezinin, Ay ve Hicri takvimi takip edin.`,
                ur: `${cityName} میں چاند کا موجودہ مرحلہ دیکھیں، گزشتہ اور آنے والی تاریخوں میں سفر کریں، اور قمری و ہجری تقویم پر نظر رکھیں۔`,
                de: `Entdecken Sie die aktuelle Mondphase in ${cityName}, navigieren Sie durch vergangene und zukünftige Daten und verfolgen Sie den Mond- und Hidschri-Kalender.`,
                id: `Jelajahi fase Bulan saat ini di ${cityName}, telusuri tanggal lampau dan mendatang, serta ikuti kalender lunar dan Hijriah.`,
                es: `Explora la fase actual de la Luna en ${cityName}, navega por fechas pasadas y futuras, y sigue el calendario lunar y hijrí.`,
                bn: `${cityName}-এ চাঁদের বর্তমান দশা দেখুন, অতীত ও ভবিষ্যতের তারিখগুলি ঘুরে দেখুন, এবং চন্দ্র ও হিজরি পঞ্জিকা অনুসরণ করুন।`,
                ms: `Terokai fasa Bulan semasa di ${cityName}, layari tarikh lampau dan akan datang, serta ikuti kalendar lunar dan Hijrah.`
            };
            const _hubIntroText = _hubIntroTpl[Lm] || _hubIntroTpl.en;
            html = html.replace(
                /<p class="moon-intro" id="moon-intro"[^>]*>[^<]*<\/p>/,
                `<p class="moon-intro" id="moon-intro">${_escHtml(_hubIntroText)}</p>`
            );
        }
        // ── Phase M1 (2026-05-03): inject 3 SSR-visible H2 sections on /moon-in-{city}
        //    (Hub only — NOT month pages, NOT date pages, NOT today pages).
        //    Adds natural educational prose covering the dynamic monthly terms
        //    that SEOptimer flagged on /moon-in-riyadh: مايو, مايو 2026, أحدب,
        //    متناقص, هلال, متزايد, بعد, يومًا. Same SSR pattern as
        //    E2-keywords-Hub-final but with month-name interpolation per lang.
        //    Pre-flight: ONLY runs when seo.moonCity.isHub === true AND
        //    seo.moonCity.isMonthPage === false (so month pages are excluded).
        if (seo.moonCity && seo.moonCity.isHub && !seo.moonCity.isMonthPage) {
            try {
                const _m1Lang = seo.lang || 'ar';
                const _m1Pick = (m) => m[_m1Lang] || m.en;
                const _m1City = _escHtml(seo.moonCity.name || '');

                // Compute current month name + year per lang (matches existing _gMonthFullByLangT)
                const _m1Now = new Date();
                const _m1MonthIdx = _m1Now.getMonth();
                const _m1Year = _m1Now.getFullYear();
                const _m1MonthsByLang = {
                    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
                    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                    fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
                    tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
                    ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
                    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
                    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
                    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
                    bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
                    ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'],
                };
                const _m1MonthName = _escHtml((_m1MonthsByLang[_m1Lang] || _m1MonthsByLang.en)[_m1MonthIdx]);

                // Section 1 — Monthly title H2. Covers month name + year + city
                //   + phase-name suffix (Hilal/Gibbous/Full Moon — added by Phase M4).
                const _m1Sec1H2 = {
                    ar: 'تقويم القمر في',
                    en: 'Moon Calendar in',
                    fr: 'Calendrier lunaire à',
                    tr: 'Ay Takvimi',
                    ur: 'چاند کی تقویم',
                    de: 'Mondkalender in',
                    id: 'Kalender Bulan di',
                    es: 'Calendario lunar en',
                    bn: 'চাঁদের ক্যালেন্ডার',
                    ms: 'Kalendar Bulan',
                };
                const _m1Sec1P = {
                    ar: 'يعرض هذا التقويم أطوار القمر اليومية ومواعيد البدر والمحاق ضمن الشهر الميلادي الحالي. يمكنك متابعة تطور القمر يوماً بيوم، ومعرفة الأطوار الشهرية الكاملة من المحاق إلى الهلال المتزايد إلى التربيع الأول إلى الأحدب المتزايد إلى البدر، ثم الأحدب المتناقص والتربيع الأخير والهلال المتناقص. يظهر التقويم أيضاً نسبة الإضاءة وعمر القمر لكل يوم.',
                    en: 'This calendar shows the daily moon phases and the dates of full moon and new moon for the current Gregorian month. You can track the moon\'s progression day by day and see the complete monthly lunar stages from new moon to waxing crescent, first quarter, waxing gibbous, full moon, then waning gibbous, last quarter, and waning crescent. The calendar also displays illumination percentage and moon age for each day.',
                    fr: 'Ce calendrier affiche les phases quotidiennes de la Lune et les dates de pleine lune et nouvelle lune pour le mois grégorien en cours. Vous pouvez suivre la progression de la Lune jour après jour et voir les stades mensuels complets, de la nouvelle lune au premier croissant, premier quartier, gibbeuse croissante, pleine lune, puis gibbeuse décroissante, dernier quartier et croissant décroissant. Le calendrier affiche aussi le pourcentage d\'illumination et l\'âge de la Lune chaque jour.',
                    tr: 'Bu takvim, mevcut miladi ay için günlük ay evrelerini ve dolunay ile yeni ay tarihlerini gösterir. Ayın gün gün gelişimini takip edebilir, yeni aydan büyüyen hilale, ilk dördüne, büyüyen şişkin aya, dolunaya, ardından küçülen şişkin aya, son dördüne ve küçülen hilale kadar tam aylık aşamaları görebilirsiniz. Takvim ayrıca her gün için aydınlanma yüzdesi ve ay yaşını da gösterir.',
                    ur: 'یہ تقویم موجودہ میلادی ماہ کے لیے چاند کے روزانہ مراحل اور بدر و نئے چاند کی تاریخیں دکھاتی ہے۔ آپ چاند کی ترقی کو روز بروز ٹریک کر سکتے ہیں اور نئے چاند سے بڑھتے ہلال، پہلی چوتھائی، بڑھتے گبس، بدر، پھر گھٹتے گبس، آخری چوتھائی اور گھٹتے ہلال تک مکمل ماہانہ مراحل دیکھ سکتے ہیں۔ تقویم ہر دن کے لیے روشنی کا فیصد اور چاند کی عمر بھی ظاہر کرتی ہے۔',
                    de: 'Dieser Kalender zeigt die täglichen Mondphasen und die Daten von Vollmond und Neumond für den aktuellen gregorianischen Monat. Sie können den Fortschritt des Mondes Tag für Tag verfolgen und die kompletten monatlichen Mondstadien sehen — vom Neumond über die zunehmende Sichel, das erste Viertel, den zunehmenden Halbmond, den Vollmond, dann den abnehmenden Halbmond, das letzte Viertel und die abnehmende Sichel. Der Kalender zeigt auch den Beleuchtungsprozentsatz und das Mondalter für jeden Tag.',
                    id: 'Kalender ini menampilkan fase Bulan harian dan tanggal purnama serta bulan baru untuk bulan Masehi saat ini. Anda dapat melacak perkembangan Bulan hari demi hari dan melihat tahap bulanan lengkap dari bulan baru ke sabit awal, kuartal pertama, gibbous awal, purnama, kemudian gibbous akhir, kuartal terakhir, dan sabit akhir. Kalender juga menampilkan persentase iluminasi dan usia Bulan setiap hari.',
                    es: 'Este calendario muestra las fases diarias de la Luna y las fechas de luna llena y luna nueva para el mes gregoriano actual. Puede seguir la progresión de la Luna día a día y ver las etapas mensuales completas desde la luna nueva hasta la creciente, el primer cuarto, la gibosa creciente, la luna llena, luego la gibosa menguante, el último cuarto y la creciente menguante. El calendario también muestra el porcentaje de iluminación y la edad de la Luna para cada día.',
                    bn: 'এই ক্যালেন্ডার বর্তমান গ্রেগরিয়ান মাসের জন্য দৈনিক চাঁদের দশা এবং পূর্ণিমা ও অমাবস্যার তারিখ প্রদর্শন করে। আপনি দিন দিন চাঁদের অগ্রগতি ট্র্যাক করতে এবং অমাবস্যা থেকে বৃদ্ধিমান অর্ধচন্দ্র, প্রথম পাদ, বৃদ্ধিমান গিবাস, পূর্ণিমা, তারপর হ্রাসমান গিবাস, শেষ পাদ এবং হ্রাসমান অর্ধচন্দ্র পর্যন্ত সম্পূর্ণ মাসিক পর্যায় দেখতে পারেন। ক্যালেন্ডার প্রতিদিনের জন্য আলোকন শতাংশ এবং চাঁদের বয়সও দেখায়।',
                    ms: 'Kalendar ini memaparkan fasa Bulan harian dan tarikh bulan purnama serta anak bulan untuk bulan Masehi semasa. Anda boleh menjejaki perkembangan Bulan hari demi hari dan melihat peringkat bulanan lengkap dari anak bulan ke sabit membesar, suku pertama, gibbous membesar, purnama, kemudian gibbous mengecil, suku terakhir, dan sabit mengecil. Kalendar juga memaparkan peratus pencahayaan dan usia Bulan untuk setiap hari.',
                };
                // Phase M4 (2026-05-03) + M5-b (2026-05-03): suffix the H2 with phase
                // names so SEOptimer's Keyword Consistency check sees the phase keywords
                // inside a heading (M4 added هلال/أحدب/بدر; M5-b adds متناقص = waning,
                // the last frequently-flagged phase term still missing from any H2).
                const _m1Sec1H2Suffix = {
                    ar: ': الهلال والأحدب والبدر والمتناقص',
                    en: ': Crescent, Gibbous, Full Moon, and Waning',
                    fr: ' : croissant, gibbeuse, pleine Lune et décroissante',
                    tr: ': Hilal, Şişkin Ay, Dolunay ve Küçülen',
                    ur: '، ہلال، گبس، بدر اور گھٹتا',
                    de: ': Sichel, Halbmond, Vollmond und abnehmend',
                    id: ': Sabit, Gibbous, Purnama, dan Menyusut',
                    es: ': Creciente, Gibosa, Llena y Menguante',
                    bn: ': অর্ধচন্দ্র, গিবাস, পূর্ণিমা ও হ্রাসমান',
                    ms: ': Sabit, Gibbous, Purnama, dan Mengecil'
                };
                const _m1Sec1Html = '<section class="section-card moon-seo-info moon-seo-month-title">'
                    + '<h2>' + _escHtml(_m1Pick(_m1Sec1H2)) + ' ' + _m1City + ' '
                    + (_m1Lang === 'ar' ? 'خلال ' : (_m1Lang === 'tr' ? '— ' : '— '))
                    + _m1MonthName + ' ' + _m1Year
                    + _escHtml(_m1Sec1H2Suffix[_m1Lang] || _m1Sec1H2Suffix.en)
                    + '</h2>'
                    + '<p>' + _escHtml(_m1Pick(_m1Sec1P)) + '</p>'
                    + '</section>';

                // Section 2 — Phases waxing/waning H2. Covers متزايد + متناقص +
                //   تقويم القمر. Uses {city} marker for clean per-lang interpolation
                //   regardless of city position (start for TR/UR/BN, end for others).
                //   Phase M4 (2026-05-03) replaced the previous ternary-chain builder.
                const _m1Sec2H2 = {
                    ar: 'الأطوار المتزايدة والمتناقصة لتقويم القمر في {city}',
                    en: 'Waxing and Waning Phases of the Moon Calendar in {city}',
                    fr: 'Phases croissantes et décroissantes du calendrier lunaire à {city}',
                    tr: '{city}\'da Ay Takviminin Büyüyen ve Küçülen Evreleri',
                    ur: '{city} میں چاند کے کیلنڈر کے بڑھتے اور گھٹتے مراحل',
                    de: 'Zunehmende und abnehmende Mondphasen im Mondkalender in {city}',
                    id: 'Fase Membesar dan Menyusut dalam Kalender Bulan di {city}',
                    es: 'Fases crecientes y menguantes del calendario lunar en {city}',
                    bn: '{city}-এ চাঁদের ক্যালেন্ডারে বৃদ্ধিমান ও হ্রাসমান দশা',
                    ms: 'Fasa Membesar dan Mengecil dalam Kalendar Bulan di {city}',
                };
                const _m1Sec2P = {
                    ar: 'تتغير مراحل القمر بشكل تدريجي خلال الشهر القمري الذي يبلغ متوسطه 29.5 يوماً. يبدأ القمر من المحاق غير المرئي، ثم يظهر كهلال متزايد رفيع، يتطور إلى التربيع الأول، فالأحدب المتزايد، حتى يصل إلى البدر المكتمل في منتصف الشهر تقريباً. بعد البدر يبدأ التناقص: الأحدب المتناقص، التربيع الأخير، الهلال المتناقص، ثم العودة إلى المحاق. قد تختلف أوقات ظهور هذه الأطوار في مدينتك بحسب المنطقة الزمنية وموقع القمر فلكياً.',
                    en: 'Moon phases change gradually throughout the lunar month, which averages 29.5 days. The moon starts as an invisible new moon, then appears as a thin waxing crescent, grows into the first quarter, then waxing gibbous, reaching the full moon around mid-month. After the full moon, it wanes: waning gibbous, last quarter, waning crescent, then back to new moon. The exact timing of these phases in your city varies based on time zone and the moon\'s astronomical position.',
                    fr: 'Les phases de la Lune changent progressivement au cours du mois lunaire d\'environ 29,5 jours. La Lune commence par une nouvelle lune invisible, puis apparaît comme un mince croissant croissant, devient le premier quartier, puis la gibbeuse croissante, atteignant la pleine lune vers le milieu du mois. Après la pleine lune, elle décroît : gibbeuse décroissante, dernier quartier, croissant décroissant, puis retour à la nouvelle lune. Les heures précises de ces phases dans votre ville varient selon le fuseau horaire et la position astronomique de la Lune.',
                    tr: 'Ay evreleri ortalama 29,5 gün süren ay döngüsü boyunca aşamalı olarak değişir. Ay görünmez yeni ay olarak başlar, ardından ince büyüyen hilal olarak görünür, ilk dördüne büyür, sonra büyüyen şişkin aya, ay ortası civarında dolunaya ulaşır. Dolunaydan sonra azalır: küçülen şişkin ay, son dördün, küçülen hilal, ardından tekrar yeni aya. Şehrinizdeki bu evrelerin tam zamanlaması, saat dilimine ve Ayın astronomik konumuna göre değişir.',
                    ur: 'چاند کے مراحل قمری مہینے کے دوران تدریجی طور پر بدلتے ہیں جو اوسطاً 29.5 دن کا ہوتا ہے۔ چاند غیر مرئی نئے چاند کے طور پر شروع ہوتا ہے، پھر باریک بڑھتے ہلال کے طور پر ظاہر ہوتا ہے، پہلی چوتھائی میں بڑھتا ہے، پھر بڑھتا گبس، مہینے کے وسط میں مکمل بدر تک پہنچتا ہے۔ بدر کے بعد یہ گھٹتا ہے: گھٹتا گبس، آخری چوتھائی، گھٹتا ہلال، پھر دوبارہ نئے چاند کی طرف۔ آپ کے شہر میں ان مراحل کے درست اوقات ٹائم زون اور چاند کی فلکی پوزیشن کے مطابق مختلف ہوتے ہیں۔',
                    de: 'Die Mondphasen ändern sich allmählich während des Mondmonats, der durchschnittlich 29,5 Tage dauert. Der Mond beginnt als unsichtbarer Neumond, erscheint dann als dünne zunehmende Sichel, wächst zum ersten Viertel, dann zum zunehmenden Halbmond und erreicht etwa zur Monatsmitte den Vollmond. Nach dem Vollmond nimmt er ab: abnehmender Halbmond, letztes Viertel, abnehmende Sichel, dann zurück zum Neumond. Die genauen Zeiten dieser Phasen in Ihrer Stadt variieren je nach Zeitzone und astronomischer Position des Mondes.',
                    id: 'Fase Bulan berubah secara bertahap sepanjang bulan lunar yang rata-rata 29,5 hari. Bulan dimulai sebagai bulan baru yang tidak terlihat, kemudian muncul sebagai sabit awal yang tipis, tumbuh menjadi kuartal pertama, lalu gibbous awal, mencapai purnama sekitar pertengahan bulan. Setelah purnama, ia menyusut: gibbous akhir, kuartal terakhir, sabit akhir, lalu kembali ke bulan baru. Waktu pasti dari fase-fase ini di kota Anda bervariasi berdasarkan zona waktu dan posisi astronomi Bulan.',
                    es: 'Las fases de la Luna cambian gradualmente durante el mes lunar, que promedia 29,5 días. La Luna comienza como una luna nueva invisible, luego aparece como un creciente delgado, crece al primer cuarto, después gibosa creciente, alcanzando la luna llena a mediados del mes. Después de la luna llena, mengua: gibosa menguante, último cuarto, creciente menguante, luego de vuelta a luna nueva. Los tiempos exactos de estas fases en su ciudad varían según la zona horaria y la posición astronómica de la Luna.',
                    bn: 'চাঁদের দশা গড়ে ২৯.৫ দিনের চান্দ্র মাস জুড়ে ধীরে ধীরে পরিবর্তিত হয়। চাঁদ একটি অদৃশ্য অমাবস্যা হিসেবে শুরু হয়, তারপর একটি পাতলা বৃদ্ধিমান অর্ধচন্দ্র হিসেবে প্রদর্শিত হয়, প্রথম পাদে বৃদ্ধি পায়, তারপর বৃদ্ধিমান গিবাস, মাসের মাঝামাঝি পূর্ণিমায় পৌঁছায়। পূর্ণিমার পরে এটি হ্রাস পায়: হ্রাসমান গিবাস, শেষ পাদ, হ্রাসমান অর্ধচন্দ্র, তারপর আবার অমাবস্যায়। আপনার শহরে এই দশাগুলির সঠিক সময় টাইম জোন এবং চাঁদের জ্যোতির্বিদ্যা অবস্থানের উপর নির্ভর করে পরিবর্তিত হয়।',
                    ms: 'Fasa Bulan berubah secara beransur-ansur sepanjang bulan lunar yang berpurata 29.5 hari. Bulan bermula sebagai anak bulan yang tidak kelihatan, kemudian muncul sebagai sabit nipis membesar, tumbuh ke suku pertama, kemudian gibbous membesar, mencapai bulan purnama sekitar pertengahan bulan. Selepas purnama, ia mengecil: gibbous mengecil, suku terakhir, sabit mengecil, kemudian kembali ke anak bulan. Masa tepat fasa-fasa ini di bandar anda berbeza-beza mengikut zon waktu dan kedudukan astronomi Bulan.',
                };
                // Phase M4 (2026-05-03): cleaner builder using {city} marker. _m1City is
                // already escaped (line above), so we split the template on {city}, escape
                // each text part, and concatenate around the pre-escaped city. Handles
                // city-at-start (TR/UR/BN), city-at-end (AR/EN/FR/DE/ID/ES/MS), and
                // city-in-middle if ever needed.
                const _m1Sec2H2Tpl = _m1Pick(_m1Sec2H2);
                const _m1Sec2H2Parts = _m1Sec2H2Tpl.split('{city}');
                const _m1Sec2H2Built = _escHtml(_m1Sec2H2Parts[0] || '') + _m1City + _escHtml(_m1Sec2H2Parts[1] || '');
                const _m1Sec2Html = '<section class="section-card moon-seo-info moon-seo-phases">'
                    + '<h2>' + _m1Sec2H2Built + '</h2>'
                    + '<p>' + _escHtml(_m1Pick(_m1Sec2P)) + '</p>'
                    + '</section>';

                // Section 3 — Days-remaining explainer (covers بعد + يومًا)
                const _m1Sec3H2 = {
                    ar: 'ماذا تعني الأيام المتبقية للأطوار القادمة؟',
                    en: 'What Do "Days Remaining" Mean for Upcoming Phases?',
                    fr: 'Que signifie "jours restants" pour les phases à venir ?',
                    tr: 'Yaklaşan Evreler İçin "Kalan Günler" Ne Anlama Gelir?',
                    ur: 'آنے والے مراحل کے لیے "باقی دن" کا کیا مطلب ہے؟',
                    de: 'Was bedeutet "verbleibende Tage" für kommende Phasen?',
                    id: 'Apa Arti "Hari Tersisa" untuk Fase Mendatang?',
                    es: '¿Qué significan los "días restantes" para las próximas fases?',
                    bn: 'আসন্ন দশার জন্য "অবশিষ্ট দিন" এর অর্থ কী?',
                    ms: 'Apa Maksud "Hari Berbaki" untuk Fasa Akan Datang?',
                };
                const _m1Sec3P = {
                    ar: 'يظهر التقويم عبارات مثل "بعد عدة أيام" أو "بعد كذا يوماً" بجانب كل طور قادم. هذه الأرقام تعد الأيام بين تاريخ اليوم والتاريخ الفلكي الدقيق للطور القادم. على سبيل المثال، إذا كان البدر القادم بعد 7 أيام، يعني أن القمر سيصل إلى أقصى إضاءته بعد سبعة أيام تقريباً من اليوم. تتغير هذه الأرقام يومياً مع تقدم الوقت، ويمكن للمستخدم متابعة الأيام المتبقية لكل من البدر، المحاق، التربيع الأول، والتربيع الأخير.',
                    en: 'The calendar shows phrases like "in several days" or "in X days" next to each upcoming phase. These numbers count the days between today and the precise astronomical date of the next phase. For example, if the next full moon is in 7 days, the moon will reach its peak illumination approximately seven days from today. These numbers update daily as time progresses, and users can track remaining days for the full moon, new moon, first quarter, and last quarter.',
                    fr: 'Le calendrier affiche des expressions comme "dans plusieurs jours" ou "dans X jours" à côté de chaque phase à venir. Ces nombres comptent les jours entre aujourd\'hui et la date astronomique précise de la prochaine phase. Par exemple, si la prochaine pleine lune est dans 7 jours, la Lune atteindra son illumination maximale environ sept jours à partir d\'aujourd\'hui. Ces nombres se mettent à jour quotidiennement, et les utilisateurs peuvent suivre les jours restants pour la pleine lune, la nouvelle lune, le premier quartier et le dernier quartier.',
                    tr: 'Takvim, her yaklaşan evrenin yanında "birkaç gün içinde" veya "X gün içinde" gibi ifadeler gösterir. Bu sayılar bugün ile bir sonraki evrenin kesin astronomik tarihi arasındaki günleri sayar. Örneğin, sıradaki dolunay 7 gün içindeyse, Ay yaklaşık yedi gün sonra en yüksek aydınlığına ulaşacaktır. Bu sayılar zaman ilerledikçe günlük olarak güncellenir ve kullanıcılar dolunay, yeni ay, ilk dördün ve son dördün için kalan günleri takip edebilir.',
                    ur: 'تقویم ہر آنے والے مرحلے کے ساتھ "کچھ دنوں میں" یا "X دنوں میں" جیسے فقرے دکھاتی ہے۔ یہ نمبر آج اور اگلے مرحلے کی درست فلکی تاریخ کے درمیان دنوں کو شمار کرتے ہیں۔ مثال کے طور پر، اگر اگلا بدر 7 دنوں میں ہے، تو چاند آج سے تقریباً سات دن بعد اپنی سب سے زیادہ روشنی تک پہنچے گا۔ یہ نمبر وقت گزرنے کے ساتھ روزانہ اپ ڈیٹ ہوتے ہیں، اور صارفین بدر، نئے چاند، پہلی چوتھائی اور آخری چوتھائی کے باقی دنوں کو ٹریک کر سکتے ہیں۔',
                    de: 'Der Kalender zeigt Ausdrücke wie "in mehreren Tagen" oder "in X Tagen" neben jeder kommenden Phase. Diese Zahlen zählen die Tage zwischen heute und dem genauen astronomischen Datum der nächsten Phase. Wenn der nächste Vollmond beispielsweise in 7 Tagen ist, wird der Mond seine maximale Beleuchtung in etwa sieben Tagen ab heute erreichen. Diese Zahlen werden täglich aktualisiert, und Nutzer können die verbleibenden Tage für Vollmond, Neumond, erstes Viertel und letztes Viertel verfolgen.',
                    id: 'Kalender menampilkan frasa seperti "dalam beberapa hari" atau "dalam X hari" di samping setiap fase mendatang. Angka-angka ini menghitung hari antara hari ini dan tanggal astronomi yang tepat dari fase berikutnya. Misalnya, jika purnama berikutnya dalam 7 hari, Bulan akan mencapai puncak iluminasinya sekitar tujuh hari dari sekarang. Angka-angka ini diperbarui setiap hari seiring berjalannya waktu, dan pengguna dapat melacak hari yang tersisa untuk purnama, bulan baru, kuartal pertama, dan kuartal terakhir.',
                    es: 'El calendario muestra frases como "en varios días" o "en X días" junto a cada fase próxima. Estos números cuentan los días entre hoy y la fecha astronómica precisa de la próxima fase. Por ejemplo, si la próxima luna llena es en 7 días, la Luna alcanzará su iluminación máxima aproximadamente siete días desde hoy. Estos números se actualizan diariamente, y los usuarios pueden rastrear los días restantes para la luna llena, luna nueva, primer cuarto y último cuarto.',
                    bn: 'ক্যালেন্ডার প্রতিটি আসন্ন দশার পাশে "কয়েক দিনের মধ্যে" বা "X দিনের মধ্যে" এর মতো বাক্যাংশ দেখায়। এই সংখ্যাগুলি আজকের এবং পরবর্তী দশার সঠিক জ্যোতির্বিদ্যা তারিখের মধ্যে দিন গণনা করে। উদাহরণস্বরূপ, যদি পরবর্তী পূর্ণিমা 7 দিনে হয়, চাঁদ আজ থেকে প্রায় সাত দিন পরে তার সর্বোচ্চ আলোকনে পৌঁছাবে। এই সংখ্যাগুলি প্রতিদিন আপডেট হয়, এবং ব্যবহারকারীরা পূর্ণিমা, অমাবস্যা, প্রথম পাদ এবং শেষ পাদের জন্য অবশিষ্ট দিনগুলি ট্র্যাক করতে পারেন।',
                    ms: 'Kalendar menunjukkan frasa seperti "dalam beberapa hari" atau "dalam X hari" di sebelah setiap fasa akan datang. Angka-angka ini mengira hari antara hari ini dan tarikh astronomi tepat fasa seterusnya. Sebagai contoh, jika purnama seterusnya dalam 7 hari, Bulan akan mencapai pencahayaan puncaknya kira-kira tujuh hari dari sekarang. Angka-angka ini dikemas kini setiap hari, dan pengguna boleh menjejaki baki hari untuk purnama, anak bulan, suku pertama, dan suku terakhir.',
                };
                const _m1Sec3Html = '<section class="section-card moon-seo-info moon-seo-days-remaining">'
                    + '<h2>' + _escHtml(_m1Pick(_m1Sec3H2)) + '</h2>'
                    + '<p>' + _escHtml(_m1Pick(_m1Sec3P)) + '</p>'
                    + '</section>';

                // Inject all 3 sections immediately before the moon-other-cities block
                const _m1AllSections = _m1Sec1Html + _m1Sec2Html + _m1Sec3Html;
                html = html.replace(
                    /<div class="section-card" id="moon-other-cities"/,
                    _m1AllSections + '<div class="section-card" id="moon-other-cities"'
                );
            } catch (_e) { /* silent — M1 SSR injection optional, page still serves */ }
        }


        // ── (18-A) Today page: CTA بارز يقود إلى الـ hub (/moon-in-{slug}) ──
        //   يظهر حصراً على /moon-today-in-{slug} — ليس على الـ hub ولا على الـ dated.
        //   سدّ فجوة UX: كان الوصول للـ hub ممكناً فقط عبر sitemap/SEO. الآن مرئيّ بشريّاً.
        if (!_isMoonDatePage && !_isMoonHubPageSsr) {
            const _hubCtaTpl = {
                ar: '📅 تقويم القمر في {city} — استعرض أيّ تاريخ',
                en: '📅 Moon Calendar for {city} — Explore any date',
                fr: '📅 Calendrier de la Lune pour {city} — Explorer toute date',
                tr: '📅 {city} Ay Takvimi — İstediğiniz tarihi keşfedin',
                ur: '📅 {city} کا چاند کا تقویم — کوئی بھی تاریخ دیکھیں',
                de: '📅 Mondkalender für {city} — Jedes Datum erkunden',
                id: '📅 Kalender Bulan untuk {city} — Jelajahi tanggal apa pun',
                es: '📅 Calendario Lunar para {city} — Explora cualquier fecha',
                bn: '📅 {city}-এর চাঁদের পঞ্জিকা — যেকোনো তারিখ দেখুন',
                ms: '📅 Kalendar Bulan untuk {city} — Terokai mana-mana tarikh'
            };
            const _hubCtaText = (_hubCtaTpl[Lm] || _hubCtaTpl.en).replace('{city}', cityName);
            const _hubCtaHref = (Lm === 'ar' ? '' : '/' + Lm) + '/moon-in-' + seo.moonCity.slug;
            // UAT-Moon-Today-City-Polish: refactor giant pulsing button into a
            //   compact CARD with title + description + button label. Less
            //   visually overwhelming, clearer affordance.
            const _ctaCardI18n = {
                ar: { title: `📅 تقويم القمر في ${cityName}`,
                      desc:  `استعرض حالة القمر لأيّ تاريخ في ${cityName}.`,
                      btn:   `افتح التقويم` },
                en: { title: `📅 Moon Calendar for ${cityName}`,
                      desc:  `Browse the moon for any date in ${cityName}.`,
                      btn:   `Open Calendar` },
                fr: { title: `📅 Calendrier de la Lune pour ${cityName}`,
                      desc:  `Parcourez la Lune pour n'importe quelle date à ${cityName}.`,
                      btn:   `Ouvrir le calendrier` },
                tr: { title: `📅 ${cityName} Ay Takvimi`,
                      desc:  `${cityName} için herhangi bir tarihte ayı keşfedin.`,
                      btn:   `Takvimi Aç` },
                ur: { title: `📅 ${cityName} کا چاند کا تقویم`,
                      desc:  `${cityName} میں کسی بھی تاریخ کا چاند دیکھیں۔`,
                      btn:   `تقویم کھولیں` },
                de: { title: `📅 Mondkalender für ${cityName}`,
                      desc:  `Stöbern Sie in jedem Datum für ${cityName}.`,
                      btn:   `Kalender öffnen` },
                id: { title: `📅 Kalender Bulan untuk ${cityName}`,
                      desc:  `Jelajahi Bulan pada tanggal apa pun di ${cityName}.`,
                      btn:   `Buka Kalender` },
                es: { title: `📅 Calendario Lunar para ${cityName}`,
                      desc:  `Explora la Luna en cualquier fecha en ${cityName}.`,
                      btn:   `Abrir Calendario` },
                bn: { title: `📅 ${cityName}-এর চাঁদের ক্যালেন্ডার`,
                      desc:  `${cityName}-এ যেকোনো তারিখের চাঁদ দেখুন।`,
                      btn:   `ক্যালেন্ডার খুলুন` },
                ms: { title: `📅 Kalendar Bulan untuk ${cityName}`,
                      desc:  `Terokai Bulan untuk mana-mana tarikh di ${cityName}.`,
                      btn:   `Buka Kalendar` }
            };
            const _ctaC = _ctaCardI18n[Lm] || _ctaCardI18n.en;
            const _hubCtaHtml = `<a class="moon-hub-cta moon-hub-cta-pulse moon-hub-cta-card" href="${_escHtml(_hubCtaHref)}">`
                + `<div class="mhc-body">`
                + `<div class="mhc-title">${_escHtml(_ctaC.title)}</div>`
                + `<div class="mhc-desc">${_escHtml(_ctaC.desc)}</div>`
                + `</div>`
                + `<div class="mhc-button">${_escHtml(_ctaC.btn)} →</div>`
                + `</a>`;
            // حقن مباشرة بعد إغلاق #moon-city-answer (تحت H1 + بطاقة الحالة).
            html = html.replace(
                /(<\/section><!-- \/#moon-city-answer -->)/,
                `$1\n                ${_hubCtaHtml}`
            );
        }

    }

    // 5h) SSR لصفحة القمر العامّة /moon-today (بدون مدينة) — H1 و intro بلا placeholders
    if (seo.moonFaq && !seo.moonCity) {
        const Lg = seo.lang;
        const _h1MoonGeneric = {
            ar: `🌙 طور القمر اليوم — الإضاءة والعمر والبدر القادم`,
            en: `🌙 Moon Phase Today — Illumination, Age & Next Full Moon`,
            fr: `🌙 Phase de la Lune aujourd\u2019hui — Illumination, âge et prochaine pleine lune`,
            tr: `🌙 Bugünkü Ay Evresi — Aydınlanma, Yaş ve Sıradaki Dolunay`,
            ur: `🌙 آج چاند کا مرحلہ — روشنی، عمر اور اگلا بدر`,
            de: `🌙 Mondphase heute — Beleuchtung, Alter und nächster Vollmond`,
            id: `🌙 Fase Bulan Hari Ini — Pencahayaan, Usia & Purnama Berikutnya`,
            es: `🌙 Fase de la Luna hoy — Iluminación, edad y próxima luna llena`,
            bn: `🌙 আজ চাঁদের পর্যায় — আলোকসজ্জা, বয়স ও পরবর্তী পূর্ণিমা`,
            ms: `🌙 Fasa Bulan Hari Ini — Pencahayaan, Usia & Bulan Purnama Seterusnya`
        }[Lg] || `🌙 Moon Phase Today — Illumination, Age & Next Full Moon`;
        html = html.replace(
            /<h1 class="page-h1" id="moon-page-h1"[^>]*>[^<]*<\/h1>/,
            `<h1 class="page-h1" id="moon-page-h1" data-i18n="moon.h1">${_escHtml(_h1MoonGeneric)}</h1>`
        );
        const _introMoonGeneric = {
            ar: `تعرّف على طور القمر الحاليّ ونسبة إضاءته وعمره بالأيّام ومواعيد شروقه وغروبه بدقّة فلكيّة. تُحسب هذه البيانات باستخدام نماذج فلكيّة دقيقة (خوارزميّات Meeus) بناءً على إحداثيّات موقعك.`,
            en: `Check the current moon phase, illumination percentage, moon age in days, and moonrise/moonset times with astronomical precision. These figures are computed with rigorous astronomical models (Meeus algorithms) based on your location coordinates.`,
            fr: `Découvrez la phase actuelle de la Lune, le pourcentage d\u2019illumination, l\u2019âge en jours ainsi que les heures de lever et coucher, avec précision astronomique. Ces données sont calculées à l\u2019aide de modèles astronomiques rigoureux (algorithmes de Meeus) sur la base des coordonnées de votre emplacement.`,
            tr: `Ayın güncel evresini, aydınlanma yüzdesini, gün cinsinden yaşını ve doğuş/batış saatlerini astronomik doğrulukla öğrenin. Bu veriler, konumunuzun koordinatlarına dayalı titiz astronomik modellerle (Meeus algoritmaları) hesaplanır.`,
            ur: `چاند کے موجودہ مرحلے، روشنی کی فیصد، دنوں میں عمر، اور طلوع و غروب کے اوقات کو فلکیاتی درستگی کے ساتھ جانیں۔ یہ اعداد و شمار آپ کے مقام کے نقاط کی بنیاد پر سخت فلکیاتی ماڈلز (Meeus الگورتھم) سے حساب کیے جاتے ہیں۔`,
            de: `Erfahren Sie die aktuelle Mondphase, den Beleuchtungsanteil, das Mondalter in Tagen sowie die Auf- und Untergangszeiten mit astronomischer Präzision. Diese Werte werden mit strengen astronomischen Modellen (Meeus-Algorithmen) auf Grundlage Ihrer Standortkoordinaten berechnet.`,
            id: `Ketahui fase Bulan saat ini, persentase pencahayaan, usia dalam hari, serta waktu terbit dan terbenamnya dengan presisi astronomi. Data ini dihitung menggunakan model astronomi yang teliti (algoritma Meeus) berdasarkan koordinat lokasi Anda.`,
            es: `Consulta la fase actual de la Luna, el porcentaje de iluminación, su edad en días y las horas de salida y puesta con precisión astronómica. Estos datos se calculan mediante modelos astronómicos rigurosos (algoritmos de Meeus) basados en las coordenadas de tu ubicación.`,
            bn: `চাঁদের বর্তমান পর্যায়, আলোকসজ্জার শতাংশ, দিনের হিসেবে বয়স এবং উদয়-অস্তের সময় জ্যোতির্বৈজ্ঞানিক নির্ভুলতার সাথে জানুন। এই তথ্যগুলি আপনার অবস্থানের স্থানাঙ্কের উপর ভিত্তি করে কঠোর জ্যোতির্বৈজ্ঞানিক মডেল (Meeus অ্যালগরিদম) দিয়ে গণনা করা হয়।`,
            ms: `Ketahui fasa Bulan semasa, peratusan pencahayaan, usia dalam hari, serta waktu terbit dan terbenamnya dengan ketepatan astronomi. Data ini dikira menggunakan model astronomi yang teliti (algoritma Meeus) berdasarkan koordinat lokasi anda.`
        }[Lg] || `Check the current moon phase, illumination, age, and rise/set times with astronomical precision.`;
        html = html.replace(
            /<p class="moon-intro" id="moon-intro"[^>]*>[^<]*<\/p>/,
            `<p class="moon-intro" id="moon-intro" data-i18n="moon.intro_fallback">${_escHtml(_introMoonGeneric)}</p>`
        );
        // Article Schema مع datePublished يوميّ
        try {
            const nowIso = new Date().toISOString();
            const articleSchema = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": _h1MoonGeneric,
                "datePublished": nowIso,
                "dateModified": nowIso,
                "author": { "@type": "Organization", "name": seo.siteName || 'Prayer Times' },
                "publisher": { "@type": "Organization", "name": seo.siteName || 'Prayer Times' },
                "inLanguage": Lg,
                "mainEntityOfPage": seo.canonical,
                "articleBody": _introMoonGeneric
            };
            const articleJsonLd = `<script id="ssr-moon-article-schema" type="application/ld+json">${JSON.stringify(articleSchema)}</script>`;
            html = html.replace('</head>', `    ${articleJsonLd}\n</head>`);
        } catch(_e) { /* silent */ }
    }

    // 5i) Single-H1 enforcement (SEO): the SPA template ships two <h1>s — one per page.
    //     Crawlers see static HTML with both, triggering "multiple H1" warnings.
    //     Demote the inactive page's H1 to <h2> server-side based on route.
    //     The IDs and classes are preserved so client-side JS / CSS keep working.
    {
        const _isMoonRoute = !!seo.moonFaq;
        if (_isMoonRoute) {
            // Moon page is active → demote the prayer-times H1
            html = html.replace(
                /<h1(\s[^>]*?\bid="page-h1"[^>]*)>([\s\S]*?)<\/h1>/,
                '<h2$1>$2</h2>'
            );
        } else {
            // Any non-moon route (home, city, hijri, qibla, etc.) → demote moon H1
            html = html.replace(
                /<h1(\s[^>]*?\bid="moon-page-h1"[^>]*)>([\s\S]*?)<\/h1>/,
                '<h2$1>$2</h2>'
            );
        }
    }

    // UAT-3b — server-side i18n: swap data-i18n* attribute defaults for the URL lang
    // (no-op for ar). Runs LAST so any prior text replacements (e.g. the footer
    // hijri-today rewrite) are already in place. Client-side i18n.js still loads
    // and remains the fallback / dynamic updater.
    html = _translateI18nAttrs(html, seo.lang);

    const buf = Buffer.from(html, 'utf8');
    const headers = {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Vary': 'Accept-Encoding'
    };
    if (acceptEnc.includes('br')) {
        zlib.brotliCompress(buf, {
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } // سرعة جيدة + ضغط عالي
        }, (e, zbuf) => {
            if (e) { res.writeHead(200, headers); res.end(buf); return; }
            res.writeHead(200, { ...headers, 'Content-Encoding': 'br' });
            res.end(zbuf);
        });
    } else if (acceptEnc.includes('gzip')) {
        zlib.gzip(buf, (e, zbuf) => {
            if (e) { res.writeHead(200, headers); res.end(buf); return; }
            res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
            res.end(zbuf);
        });
    } else {
        res.writeHead(200, headers);
        res.end(buf);
    }
}

// ===== /og-image.svg — dynamic OG image endpoint (1200x630) =====
// Returns SVG as OG image. Accepts ?t=<title>&l=<ar|en>.
function handleOgImage(qs, res) {
    const params = new URLSearchParams(qs);
    const title = (params.get('t') || 'مواقيت الصلاة').slice(0, 110);
    const lang = params.get('l') === 'en' ? 'en' : 'ar';
    const isAr = lang === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';
    const anchor = isAr ? 'end' : 'start';
    const xPos = isAr ? 1140 : 60;
    const subtitle = isAr ? 'مواقيت الصلاة والتاريخ الهجري' : 'Prayer Times & Hijri Calendar';
    const domain = SITE_URL.replace(/^https?:\/\//, '');
    // تقسيم العنوان إلى سطور إذا كان طويلاً
    const words = title.split(' ');
    const lines = [];
    let cur = '';
    const maxChars = isAr ? 30 : 35;
    for (const w of words) {
        if ((cur + ' ' + w).trim().length > maxChars) { if (cur) lines.push(cur); cur = w; }
        else cur = (cur + ' ' + w).trim();
    }
    if (cur) lines.push(cur);
    const maxLines = lines.slice(0, 3);

    const esc = _escHtml;
    const tspans = maxLines.map((ln, i) =>
        `<tspan x="${xPos}" dy="${i === 0 ? 0 : 86}">${esc(ln)}</tspan>`
    ).join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0f6e4a"/>
    <stop offset="1" stop-color="#084a31"/>
  </linearGradient>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<circle cx="${isAr ? 160 : 1040}" cy="150" r="70" fill="#ffffff" fill-opacity="0.1"/>
<text x="${isAr ? 160 : 1040}" y="180" text-anchor="middle" font-size="90" fill="#ffffff" fill-opacity="0.95">🕌</text>
<text x="${xPos}" y="260" text-anchor="${anchor}" direction="${dir}" font-family="Cairo, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff">${tspans}</text>
<text x="${xPos}" y="540" text-anchor="${anchor}" direction="${dir}" font-family="Cairo, Arial, sans-serif" font-size="38" fill="#cde9dc">${esc(subtitle)}</text>
<text x="${xPos}" y="590" text-anchor="${anchor}" direction="${dir}" font-family="Arial, sans-serif" font-size="28" fill="#9dc8b4">${esc(domain)}</text>
</svg>`;
    res.writeHead(200, {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=31536000',
    });
    res.end(svg);
}

// ===== Rate Limiter متدرّج لـ /api/* =====
// حدود مختلفة حسب تكلفة النقطة — حماية Nominatim دون إزعاج مستخدمي CGNAT
const _rlWindowMs = 60 * 1000;
const _RL_TIERS = {
    cheap:    300,  // /api/cities, /api/cities/add — DB محلي + كاش ذاكرة
    external: 60,   // /api/wiki-* — كاش داخلي 24h/7d
    strict:   30,   // /api/geocode — Nominatim policy (1 req/sec)
};
const _rlMap = new Map(); // ip → { [tier]: { count, resetAt } }
function checkRateLimit(ip, tier) {
    const max = _RL_TIERS[tier] || _RL_TIERS.strict;
    const now = Date.now();
    let buckets = _rlMap.get(ip);
    if (!buckets) { buckets = {}; _rlMap.set(ip, buckets); }
    const entry = buckets[tier];
    if (!entry || now >= entry.resetAt) {
        buckets[tier] = { count: 1, resetAt: now + _rlWindowMs };
        return { allowed: true, max, remaining: max - 1, reset: Math.ceil(_rlWindowMs / 1000) };
    }
    entry.count++;
    if (entry.count > max) {
        return { allowed: false, max, remaining: 0, reset: Math.ceil((entry.resetAt - now) / 1000) };
    }
    return { allowed: true, max, remaining: max - entry.count, reset: Math.ceil((entry.resetAt - now) / 1000) };
}
function getTierForPath(urlPath) {
    if (urlPath === '/api/cities' || urlPath === '/api/cities/add') return 'cheap';
    if (urlPath.startsWith('/api/wiki-')) return 'external';
    if (urlPath === '/api/geocode') return 'strict';
    return 'strict'; // أي نقطة مستقبلية غير مصنّفة → الأشد
}
// تنظيف دوري — يزيل IPs التي جميع buckets-ها منتهية (منع نمو غير محدود)
setInterval(() => {
    const now = Date.now();
    for (const [ip, buckets] of _rlMap) {
        let alive = false;
        for (const t in buckets) if (now < buckets[t].resetAt) { alive = true; break; }
        if (!alive) _rlMap.delete(ip);
    }
}, 5 * 60 * 1000).unref();
// ===== Circuit Breaker للخدمات الخارجية =====
// بعد 5 أخطاء متتالية، يتوقف الاستدعاء لدقيقة كاملة — يمنع تكدّس طلبات فاشلة
const _circuits = new Map(); // name → { failures, openUntil }
const _CB_THRESHOLD = 5;
const _CB_COOLDOWN = 60 * 1000;
function circuitAllow(name) {
    const c = _circuits.get(name);
    if (!c) return true;
    if (c.openUntil && Date.now() < c.openUntil) return false;
    return true;
}
function circuitSuccess(name) {
    _circuits.delete(name);
}
function circuitFail(name) {
    const c = _circuits.get(name) || { failures: 0, openUntil: 0 };
    c.failures++;
    if (c.failures >= _CB_THRESHOLD) {
        c.openUntil = Date.now() + _CB_COOLDOWN;
        console.warn(`[CircuitBreaker] ${name} مفتوح حتى ${new Date(c.openUntil).toISOString()}`);
    }
    _circuits.set(name, c);
}

function getClientIp(req) {
    // يدعم وقوف الخادم خلف reverse proxy (Cloudflare/nginx)
    const xff = req.headers['x-forwarded-for'];
    if (xff) return xff.split(',')[0].trim();
    const cf = req.headers['cf-connecting-ip'];
    if (cf) return cf;
    return req.socket.remoteAddress || 'unknown';
}

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff2':'font/woff2',
    '.mp3':  'audio/mpeg',
    '.ogg':  'audio/ogg',
    '.wav':  'audio/wav',
    '.txt':  'text/plain; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
};

// ===== بيانات ثابتة مدمجة للمدن الكبرى =====
const STATIC_CITIES = {
  sa: [
    {nameAr:'الرياض',nameEn:'Riyadh',type:'city',lat:24.6877,lng:46.7219},
    {nameAr:'جدة',nameEn:'Jeddah',type:'city',lat:21.4858,lng:39.1925},
    {nameAr:'مكة المكرمة',nameEn:'Mecca',type:'city',lat:21.3891,lng:39.8579},
    {nameAr:'المدينة المنورة',nameEn:'Medina',type:'city',lat:24.5247,lng:39.5692},
    {nameAr:'الدمام',nameEn:'Dammam',type:'city',lat:26.3927,lng:49.9777},
    {nameAr:'الطائف',nameEn:'Ta\'if',type:'city',lat:21.2854,lng:40.4149},
    {nameAr:'أبها',nameEn:'Abha',type:'city',lat:18.2164,lng:42.5053},
    {nameAr:'تبوك',nameEn:'Tabuk',type:'city',lat:28.3998,lng:36.5701},
    {nameAr:'بريدة',nameEn:'Buraydah',type:'city',lat:26.3592,lng:43.9763},
    {nameAr:'حائل',nameEn:'Ha\'il',type:'city',lat:27.5114,lng:41.7208},
    {nameAr:'الخبر',nameEn:'Al Khobar',type:'city',lat:26.2192,lng:50.1978},
    {nameAr:'نجران',nameEn:'Najran',type:'city',lat:17.5655,lng:44.2276},
    {nameAr:'الجبيل',nameEn:'Al Jubayl',type:'city',lat:27.0174,lng:49.6583},
    {nameAr:'الأحساء',nameEn:'Al Ahsa',type:'city',lat:25.3697,lng:49.5871},
    {nameAr:'القطيف',nameEn:'Al Qatif',type:'city',lat:26.5217,lng:49.9983},
    {nameAr:'ينبع',nameEn:'Yanbu',type:'city',lat:24.0895,lng:38.0618},
    {nameAr:'الدوادمي',nameEn:'Ad Dawadimi',type:'city',lat:24.494,lng:44.3882},
    {nameAr:'عرعر',nameEn:'Arar',type:'city',lat:30.9753,lng:41.0381},
    {nameAr:'الرس',nameEn:'Ar Rass',type:'city',lat:25.8666,lng:43.5103},
    {nameAr:'شقراء',nameEn:'Shaqra',type:'city',lat:25.2318,lng:45.2609},
    {nameAr:'بيشة',nameEn:'Bisha',type:'city',lat:20.0044,lng:42.6035},
    {nameAr:'القريات',nameEn:'Al Qurayyat',type:'city',lat:31.3313,lng:37.3485},
    {nameAr:'الظهران',nameEn:'Dhahran',type:'city',lat:26.3161,lng:50.0747},
    {nameAr:'خميس مشيط',nameEn:'Khamis Mushait',type:'city',lat:18.3063,lng:42.729},
    {nameAr:'الباحة',nameEn:'Al Bahah',type:'city',lat:20.0129,lng:41.4677},
    {nameAr:'صبيا',nameEn:'Sabya',type:'city',lat:17.1528,lng:42.6264},
    {nameAr:'القنفذة',nameEn:'Al Qunfudhah',type:'city',lat:19.1287,lng:41.0793},
    {nameAr:'العيون',nameEn:'Al Oyun',type:'city',lat:26.8527,lng:43.6568},
    {nameAr:'المجمعة',nameEn:'Al Majma\'ah',type:'city',lat:25.8963,lng:45.3562},
    {nameAr:'الخرج',nameEn:'Al Kharj',type:'city',lat:24.1472,lng:47.3133},
    {nameAr:'عنيزة',nameEn:'Unayzah',type:'city',lat:26.0935,lng:43.9993},
    {nameAr:'الليث',nameEn:'Al Lith',type:'city',lat:20.1493,lng:40.2829},
    {nameAr:'القويعية',nameEn:'Al Quway\'iyah',type:'city',lat:24.0655,lng:45.272},
    {nameAr:'جازان',nameEn:'Jizan',type:'city',lat:16.889,lng:42.5512},
    {nameAr:'سكاكا',nameEn:'Sakaka',type:'city',lat:29.9697,lng:40.2048},
    {nameAr:'الوجه',nameEn:'Al Wajh',type:'city',lat:26.2362,lng:36.4601},
    {nameAr:'الزلفي',nameEn:'Az Zulfi',type:'city',lat:26.2938,lng:44.8091},
    {nameAr:'النماص',nameEn:'An Nimas',type:'city',lat:19.1167,lng:42.1294},
    {nameAr:'المثنب',nameEn:'Al Mithnab',type:'city',lat:25.8700,lng:44.2400},
    {nameAr:'رفحاء',nameEn:'Rafha',type:'city',lat:29.6257,lng:43.4866},
    {nameAr:'الهفوف',nameEn:'Al Hofuf',type:'city',lat:25.3662,lng:49.5807},
    {nameAr:'وادي الدواسر',nameEn:'Wadi Al Dawasir',type:'city',lat:20.505,lng:45.1887},
    {nameAr:'محايل عسير',nameEn:'Muhayil',type:'city',lat:18.5617,lng:42.0472},
    {nameAr:'الأفلاج',nameEn:'Al Aflaj',type:'city',lat:22.2763,lng:46.7044},
    {nameAr:'أم القرى',nameEn:'Umm Al Qura',type:'city',lat:21.4225,lng:39.8262},
    {nameAr:'الحوية',nameEn:'Al Hawiyah',type:'city',lat:21.55,lng:41.3},
    {nameAr:'ضباء',nameEn:'Duba',type:'city',lat:27.3584,lng:35.6591},
    {nameAr:'تنومة',nameEn:'Tanumah',type:'city',lat:19.6695,lng:42.3234},
    {nameAr:'الدلم',nameEn:'Ad Dilam',type:'city',lat:23.9926,lng:47.1627},
    {nameAr:'صفوى',nameEn:'Safwa',type:'city',lat:26.6479,lng:49.9979},
  ],
  sy: [
    {nameAr:'دمشق',nameEn:'Damascus',type:'city',lat:33.5102,lng:36.2913},
    {nameAr:'حلب',nameEn:'Aleppo',type:'city',lat:36.2021,lng:37.1343},
    {nameAr:'حمص',nameEn:'Homs',type:'city',lat:34.7324,lng:36.7137},
    {nameAr:'حماة',nameEn:'Hama',type:'city',lat:35.1418,lng:36.7578},
    {nameAr:'اللاذقية',nameEn:'Latakia',type:'city',lat:35.5317,lng:35.7914},
    {nameAr:'دير الزور',nameEn:'Deir ez-Zor',type:'city',lat:35.3352,lng:40.1416},
    {nameAr:'الرقة',nameEn:'Raqqa',type:'city',lat:35.9503,lng:39.0094},
    {nameAr:'السويداء',nameEn:'As-Suwayda',type:'city',lat:32.709,lng:36.5649},
    {nameAr:'درعا',nameEn:'Daraa',type:'city',lat:32.6189,lng:36.1021},
    {nameAr:'القامشلي',nameEn:'Qamishli',type:'city',lat:37.0519,lng:41.2277},
    {nameAr:'إدلب',nameEn:'Idlib',type:'city',lat:35.9311,lng:36.6338},
    {nameAr:'طرطوس',nameEn:'Tartus',type:'city',lat:34.8887,lng:35.8872},
    {nameAr:'بانياس',nameEn:'Baniyas',type:'city',lat:35.1875,lng:35.9417},
    {nameAr:'الحسكة',nameEn:'Al-Hasakah',type:'city',lat:36.5141,lng:40.7453},
    {nameAr:'منبج',nameEn:'Manbij',type:'city',lat:36.5222,lng:37.947},
    {nameAr:'جبلة',nameEn:'Jableh',type:'city',lat:35.3611,lng:35.9242},
    {nameAr:'دومة',nameEn:'Douma',type:'city',lat:33.5731,lng:36.4002},
    {nameAr:'عفرين',nameEn:'Afrin',type:'city',lat:36.5131,lng:36.8686},
    {nameAr:'جرابلس',nameEn:'Jarabulus',type:'city',lat:36.8161,lng:38.0103},
    {nameAr:'تدمر',nameEn:'Palmyra',type:'city',lat:34.5503,lng:38.2674},
    {nameAr:'بصرى الشام',nameEn:'Bosra',type:'city',lat:32.5163,lng:36.4813},
    {nameAr:'صلخد',nameEn:'Salkhad',type:'city',lat:32.4936,lng:36.7131},
  ],
  eg: [
    {nameAr:'القاهرة',nameEn:'Cairo',type:'city',lat:30.0444,lng:31.2357},
    {nameAr:'الإسكندرية',nameEn:'Alexandria',type:'city',lat:31.2001,lng:29.9187},
    {nameAr:'الجيزة',nameEn:'Giza',type:'city',lat:30.0131,lng:31.2089},
    {nameAr:'الإسماعيلية',nameEn:'Ismailia',type:'city',lat:30.5965,lng:32.2715},
    {nameAr:'بورسعيد',nameEn:'Port Said',type:'city',lat:31.2565,lng:32.2841},
    {nameAr:'السويس',nameEn:'Suez',type:'city',lat:29.9668,lng:32.5498},
    {nameAr:'الأقصر',nameEn:'Luxor',type:'city',lat:25.6872,lng:32.6396},
    {nameAr:'أسوان',nameEn:'Aswan',type:'city',lat:24.0889,lng:32.8998},
    {nameAr:'المنصورة',nameEn:'Mansoura',type:'city',lat:31.0364,lng:31.3807},
    {nameAr:'طنطا',nameEn:'Tanta',type:'city',lat:30.7865,lng:31.0004},
    {nameAr:'الزقازيق',nameEn:'Zagazig',type:'city',lat:30.5877,lng:31.5021},
    {nameAr:'دمياط',nameEn:'Damietta',type:'city',lat:31.4165,lng:31.8133},
    {nameAr:'المنيا',nameEn:'Minya',type:'city',lat:28.0871,lng:30.7618},
    {nameAr:'أسيوط',nameEn:'Asyut',type:'city',lat:27.1809,lng:31.1837},
    {nameAr:'سوهاج',nameEn:'Sohag',type:'city',lat:26.559,lng:31.6957},
    {nameAr:'قنا',nameEn:'Qena',type:'city',lat:26.1601,lng:32.7185},
    {nameAr:'الفيوم',nameEn:'Faiyum',type:'city',lat:29.3084,lng:30.8428},
    {nameAr:'بني سويف',nameEn:'Beni Suef',type:'city',lat:29.0661,lng:31.0994},
    {nameAr:'الغردقة',nameEn:'Hurghada',type:'city',lat:27.2574,lng:33.8129},
    {nameAr:'مرسى مطروح',nameEn:'Marsa Matruh',type:'city',lat:31.3543,lng:27.2373},
    {nameAr:'شرم الشيخ',nameEn:'Sharm el-Sheikh',type:'city',lat:27.9158,lng:34.3299},
    {nameAr:'المحلة الكبرى',nameEn:'Mahalla',type:'city',lat:30.9712,lng:31.1653},
    {nameAr:'شبين الكوم',nameEn:'Shibin al-Kawm',type:'city',lat:30.5616,lng:31.0124},
    {nameAr:'كفر الشيخ',nameEn:'Kafr el-Sheikh',type:'city',lat:31.1107,lng:30.9388},
    {nameAr:'بنها',nameEn:'Banha',type:'city',lat:30.4626,lng:31.184},
    {nameAr:'الغربية',nameEn:'Gharbia',type:'city',lat:30.8666,lng:30.9833},
    {nameAr:'دسوق',nameEn:'Desouq',type:'city',lat:31.1283,lng:30.6476},
    {nameAr:'بلبيس',nameEn:'Bilbeis',type:'city',lat:30.4177,lng:31.5619},
    {nameAr:'المنوفية',nameEn:'Monufia',type:'city',lat:30.5975,lng:30.9876},
    {nameAr:'القليوبية',nameEn:'Qalyubia',type:'city',lat:30.3299,lng:31.2168},
  ],
  iq: [
    {nameAr:'بغداد',nameEn:'Baghdad',type:'city',lat:33.3152,lng:44.3661},
    {nameAr:'البصرة',nameEn:'Basra',type:'city',lat:30.5081,lng:47.7835},
    {nameAr:'الموصل',nameEn:'Mosul',type:'city',lat:36.34,lng:43.1333},
    {nameAr:'أربيل',nameEn:'Erbil',type:'city',lat:36.1912,lng:44.0092},
    {nameAr:'السليمانية',nameEn:'Sulaymaniyah',type:'city',lat:35.5572,lng:45.4351},
    {nameAr:'كركوك',nameEn:'Kirkuk',type:'city',lat:35.4681,lng:44.3922},
    {nameAr:'النجف',nameEn:'Najaf',type:'city',lat:32.0081,lng:44.3366},
    {nameAr:'كربلاء',nameEn:'Karbala',type:'city',lat:32.6162,lng:44.0242},
    {nameAr:'الحلة',nameEn:'Al Hillah',type:'city',lat:32.4725,lng:44.4288},
    {nameAr:'الناصرية',nameEn:'Nasiriyah',type:'city',lat:31.0446,lng:46.2577},
    {nameAr:'العمارة',nameEn:'Al Amarah',type:'city',lat:31.839,lng:47.1481},
    {nameAr:'الكوت',nameEn:'Al Kut',type:'city',lat:32.5,lng:45.8319},
    {nameAr:'الرمادي',nameEn:'Ramadi',type:'city',lat:33.4244,lng:43.299},
    {nameAr:'الفلوجة',nameEn:'Fallujah',type:'city',lat:33.3572,lng:43.7796},
    {nameAr:'تكريت',nameEn:'Tikrit',type:'city',lat:34.5965,lng:43.6812},
    {nameAr:'سامراء',nameEn:'Samarra',type:'city',lat:34.2015,lng:43.8756},
    {nameAr:'الديوانية',nameEn:'Al Diwaniyah',type:'city',lat:31.9888,lng:44.9246},
    {nameAr:'دهوك',nameEn:'Dohuk',type:'city',lat:36.8674,lng:42.9946},
    {nameAr:'بعقوبة',nameEn:'Baqubah',type:'city',lat:33.7467,lng:44.6532},
    {nameAr:'زاخو',nameEn:'Zakho',type:'city',lat:37.1444,lng:42.6839},
    {nameAr:'الحي',nameEn:'Al Hayy',type:'city',lat:32.1746,lng:46.0448},
    {nameAr:'العزيزية',nameEn:'Al Aziziyah',type:'city',lat:32.9098,lng:45.0665},
    {nameAr:'النخيب',nameEn:'Al Nukhayb',type:'city',lat:32.0333,lng:42.2667},
  ],
  jo: [
    {nameAr:'عمّان',nameEn:'Amman',type:'city',lat:31.9539,lng:35.9106},
    {nameAr:'الزرقاء',nameEn:'Zarqa',type:'city',lat:32.0728,lng:36.0879},
    {nameAr:'إربد',nameEn:'Irbid',type:'city',lat:32.5568,lng:35.8469},
    {nameAr:'العقبة',nameEn:'Aqaba',type:'city',lat:29.5321,lng:35.0062},
    {nameAr:'السلط',nameEn:'As-Salt',type:'city',lat:32.0392,lng:35.727},
    {nameAr:'مادبا',nameEn:'Madaba',type:'city',lat:31.7167,lng:35.8},
    {nameAr:'الكرك',nameEn:'Al Karak',type:'city',lat:31.1797,lng:35.7047},
    {nameAr:'المفرق',nameEn:'Mafraq',type:'city',lat:32.3418,lng:36.2024},
    {nameAr:'جرش',nameEn:'Jerash',type:'city',lat:32.2764,lng:35.8969},
    {nameAr:'عجلون',nameEn:'Ajloun',type:'city',lat:32.3338,lng:35.7508},
    {nameAr:'معان',nameEn:'Ma\'an',type:'city',lat:30.1942,lng:35.7347},
    {nameAr:'الطفيلة',nameEn:'Tafilah',type:'city',lat:30.8337,lng:35.6043},
    {nameAr:'رصيفة',nameEn:'Russeifa',type:'city',lat:32.0163,lng:36.0615},
    {nameAr:'الرمثا',nameEn:'Ramtha',type:'city',lat:32.5683,lng:35.9994},
    {nameAr:'الحسين',nameEn:'Al Hussein',type:'city',lat:31.5,lng:35.95},
  ],
  lb: [
    {nameAr:'بيروت',nameEn:'Beirut',type:'city',lat:33.8869,lng:35.5131},
    {nameAr:'طرابلس',nameEn:'Tripoli',type:'city',lat:34.4367,lng:35.8497},
    {nameAr:'صيدا',nameEn:'Sidon',type:'city',lat:33.5631,lng:35.3714},
    {nameAr:'صور',nameEn:'Tyre',type:'city',lat:33.2705,lng:35.2037},
    {nameAr:'زحلة',nameEn:'Zahlé',type:'city',lat:33.8467,lng:35.9018},
    {nameAr:'جونية',nameEn:'Jounieh',type:'city',lat:33.9808,lng:35.6178},
    {nameAr:'النبطية',nameEn:'Nabatieh',type:'city',lat:33.3772,lng:35.4839},
    {nameAr:'بعلبك',nameEn:'Baalbek',type:'city',lat:34.0046,lng:36.2109},
    {nameAr:'حلبا',nameEn:'Halba',type:'city',lat:34.5487,lng:36.0785},
    {nameAr:'بنت جبيل',nameEn:'Bint Jbeil',type:'city',lat:33.1181,lng:35.4311},
    {nameAr:'جبيل',nameEn:'Byblos',type:'city',lat:34.1235,lng:35.6488},
    {nameAr:'عاليه',nameEn:'Aley',type:'city',lat:33.8103,lng:35.5986},
    {nameAr:'دير القمر',nameEn:'Deir el Qamar',type:'city',lat:33.6912,lng:35.5798},
  ],
  ae: [
    {nameAr:'دبي',nameEn:'Dubai',type:'city',lat:25.2048,lng:55.2708},
    {nameAr:'أبوظبي',nameEn:'Abu Dhabi',type:'city',lat:24.4539,lng:54.3773},
    {nameAr:'الشارقة',nameEn:'Sharjah',type:'city',lat:25.3463,lng:55.4209},
    {nameAr:'عجمان',nameEn:'Ajman',type:'city',lat:25.4052,lng:55.5136},
    {nameAr:'رأس الخيمة',nameEn:'Ras Al Khaimah',type:'city',lat:25.7895,lng:55.9432},
    {nameAr:'الفجيرة',nameEn:'Fujairah',type:'city',lat:25.1288,lng:56.3265},
    {nameAr:'أم القيوين',nameEn:'Umm Al Quwain',type:'city',lat:25.5647,lng:55.5553},
    {nameAr:'العين',nameEn:'Al Ain',type:'city',lat:24.2075,lng:55.7447},
    {nameAr:'خور فكان',nameEn:'Khor Fakkan',type:'city',lat:25.3318,lng:56.3437},
    {nameAr:'دبا الفجيرة',nameEn:'Dibba',type:'city',lat:25.6186,lng:56.2661},
    {nameAr:'الظيد',nameEn:'Al Dhaid',type:'city',lat:25.2887,lng:55.8763},
    {nameAr:'مدينة زايد',nameEn:'Madinat Zayed',type:'city',lat:23.6567,lng:53.7074},
  ],
  kw: [
    {nameAr:'الكويت',nameEn:'Kuwait City',type:'city',lat:29.3697,lng:47.9783},
    {nameAr:'الجهراء',nameEn:'Al Jahra',type:'city',lat:29.3373,lng:47.6578},
    {nameAr:'الأحمدي',nameEn:'Al Ahmadi',type:'city',lat:29.0769,lng:48.0839},
    {nameAr:'الفروانية',nameEn:'Al Farwaniyah',type:'city',lat:29.2769,lng:47.9534},
    {nameAr:'حولي',nameEn:'Hawalli',type:'city',lat:29.3327,lng:48.0323},
    {nameAr:'مبارك الكبير',nameEn:'Mubarak Al-Kabeer',type:'city',lat:29.2074,lng:48.0591},
    {nameAr:'السالمية',nameEn:'Salmiya',type:'city',lat:29.3345,lng:48.0741},
    {nameAr:'الرميثية',nameEn:'Rumaithiya',type:'city',lat:29.3253,lng:48.0856},
    {nameAr:'صباح السالم',nameEn:'Sabah Al Salem',type:'city',lat:29.2611,lng:48.0664},
  ],
  qa: [
    {nameAr:'الدوحة',nameEn:'Doha',type:'city',lat:25.2854,lng:51.531},
    {nameAr:'الريان',nameEn:'Al Rayyan',type:'city',lat:25.2919,lng:51.4243},
    {nameAr:'الوكرة',nameEn:'Al Wakrah',type:'city',lat:25.1664,lng:51.6084},
    {nameAr:'الخور',nameEn:'Al Khor',type:'city',lat:25.6833,lng:51.5},
    {nameAr:'مسيعيد',nameEn:'Mesaieed',type:'city',lat:24.9951,lng:51.5593},
    {nameAr:'الشحانية',nameEn:'Al Shahaniya',type:'city',lat:25.4167,lng:51.2167},
    {nameAr:'الجميلية',nameEn:'Al Jumaliyah',type:'city',lat:25.6297,lng:51.084},
    {nameAr:'دخان',nameEn:'Dukhan',type:'city',lat:25.4233,lng:50.7804},
  ],
  bh: [
    {nameAr:'المنامة',nameEn:'Manama',type:'city',lat:26.215,lng:50.5832},
    {nameAr:'المحرق',nameEn:'Muharraq',type:'city',lat:26.2468,lng:50.6098},
    {nameAr:'الرفاع',nameEn:'Riffa',type:'city',lat:26.13,lng:50.555},
    {nameAr:'مدينة حمد',nameEn:'Hamad Town',type:'city',lat:26.1121,lng:50.5078},
    {nameAr:'مدينة عيسى',nameEn:'Isa Town',type:'city',lat:26.1734,lng:50.5481},
    {nameAr:'سترة',nameEn:'Sitra',type:'city',lat:26.1568,lng:50.6228},
    {nameAr:'جدحفص',nameEn:'Jidhafs',type:'city',lat:26.2127,lng:50.5394},
    {nameAr:'الجفير',nameEn:'Juffair',type:'city',lat:26.2196,lng:50.5945},
  ],
  om: [
    {nameAr:'مسقط',nameEn:'Muscat',type:'city',lat:23.5957,lng:58.5933},
    {nameAr:'صلالة',nameEn:'Salalah',type:'city',lat:17.0159,lng:54.0924},
    {nameAr:'نزوى',nameEn:'Nizwa',type:'city',lat:22.9333,lng:57.5333},
    {nameAr:'صحار',nameEn:'Sohar',type:'city',lat:24.3429,lng:56.7456},
    {nameAr:'السيب',nameEn:'Seeb',type:'city',lat:23.6693,lng:58.1722},
    {nameAr:'صور',nameEn:'Sur',type:'city',lat:22.5668,lng:59.5289},
    {nameAr:'عبري',nameEn:'Ibri',type:'city',lat:23.2255,lng:56.5128},
    {nameAr:'بهلاء',nameEn:'Bahla',type:'city',lat:22.9645,lng:57.2948},
    {nameAr:'الرستاق',nameEn:'Rustaq',type:'city',lat:23.3919,lng:57.4266},
    {nameAr:'خصب',nameEn:'Khasab',type:'city',lat:26.1891,lng:56.2395},
    {nameAr:'إبراء',nameEn:'Ibra',type:'city',lat:22.6909,lng:58.5357},
    {nameAr:'عمان',nameEn:'Oman',type:'city',lat:21.4735,lng:55.9754},
    {nameAr:'ثمريت',nameEn:'Thumrayt',type:'city',lat:17.6625,lng:54.0285},
    {nameAr:'بركاء',nameEn:'Barka',type:'city',lat:23.6752,lng:57.8901},
    {nameAr:'مطرح',nameEn:'Mutrah',type:'city',lat:23.6191,lng:58.5927},
  ],
  ye: [
    {nameAr:'صنعاء',nameEn:'Sanaa',type:'city',lat:15.3694,lng:44.191},
    {nameAr:'عدن',nameEn:'Aden',type:'city',lat:12.7797,lng:45.0095},
    {nameAr:'تعز',nameEn:'Taiz',type:'city',lat:13.5795,lng:44.0177},
    {nameAr:'الحديدة',nameEn:'Hudaydah',type:'city',lat:14.7978,lng:42.9544},
    {nameAr:'إب',nameEn:'Ibb',type:'city',lat:13.9747,lng:44.1833},
    {nameAr:'مأرب',nameEn:'Marib',type:'city',lat:15.4669,lng:45.3226},
    {nameAr:'ذمار',nameEn:'Dhamar',type:'city',lat:14.5425,lng:44.4041},
    {nameAr:'حجة',nameEn:'Hajjah',type:'city',lat:15.6931,lng:43.5978},
    {nameAr:'المكلا',nameEn:'Mukalla',type:'city',lat:14.5324,lng:49.1247},
    {nameAr:'سيئون',nameEn:'Seiyun',type:'city',lat:15.9426,lng:48.7883},
    {nameAr:'صعدة',nameEn:'Saada',type:'city',lat:16.935,lng:43.7612},
    {nameAr:'الضالع',nameEn:'Daleh',type:'city',lat:13.6957,lng:44.7317},
    {nameAr:'البيضاء',nameEn:'Al Bayda',type:'city',lat:14.0004,lng:45.5727},
    {nameAr:'المنصورة',nameEn:'Al Mansura',type:'city',lat:12.8221,lng:44.9969},
    {nameAr:'شبوة',nameEn:'Shabwah',type:'city',lat:14.5333,lng:47.05},
    {nameAr:'أبين',nameEn:'Abyan',type:'city',lat:13.3617,lng:45.3733},
    {nameAr:'لحج',nameEn:'Lahij',type:'city',lat:13.0588,lng:44.8811},
    {nameAr:'ريدة',nameEn:'Rida',type:'city',lat:15.8667,lng:44.0333},
  ],
  ly: [
    {nameAr:'طرابلس',nameEn:'Tripoli',type:'city',lat:32.8872,lng:13.1913},
    {nameAr:'بنغازي',nameEn:'Benghazi',type:'city',lat:32.1167,lng:20.0667},
    {nameAr:'مصراتة',nameEn:'Misrata',type:'city',lat:32.3754,lng:15.0925},
    {nameAr:'الزاوية',nameEn:'Zawiya',type:'city',lat:32.7522,lng:12.7279},
    {nameAr:'البيضاء',nameEn:'Al Bayda',type:'city',lat:32.7636,lng:21.7553},
    {nameAr:'سبها',nameEn:'Sabha',type:'city',lat:27.0369,lng:14.4289},
    {nameAr:'أجدابيا',nameEn:'Ajdabiya',type:'city',lat:30.7554,lng:20.2264},
    {nameAr:'الخمس',nameEn:'Al Khums',type:'city',lat:32.6486,lng:14.2619},
    {nameAr:'ترهونة',nameEn:'Tarhuna',type:'city',lat:32.4346,lng:13.6367},
    {nameAr:'غريان',nameEn:'Gharyan',type:'city',lat:32.1724,lng:13.0201},
    {nameAr:'زليتن',nameEn:'Zliten',type:'city',lat:32.4674,lng:14.5688},
    {nameAr:'توكرة',nameEn:'Tocra',type:'city',lat:32.5323,lng:20.5823},
    {nameAr:'سرت',nameEn:'Sirte',type:'city',lat:31.2089,lng:16.5887},
    {nameAr:'درنة',nameEn:'Derna',type:'city',lat:32.7668,lng:22.6335},
    {nameAr:'مرزق',nameEn:'Murzuq',type:'city',lat:25.9167,lng:13.9167},
    {nameAr:'غدامس',nameEn:'Ghadames',type:'city',lat:30.1333,lng:9.5},
  ],
  tn: [
    {nameAr:'تونس',nameEn:'Tunis',type:'city',lat:36.8065,lng:10.1815},
    {nameAr:'صفاقس',nameEn:'Sfax',type:'city',lat:34.7406,lng:10.7603},
    {nameAr:'سوسة',nameEn:'Sousse',type:'city',lat:35.8245,lng:10.638},
    {nameAr:'القيروان',nameEn:'Kairouan',type:'city',lat:35.6781,lng:10.0963},
    {nameAr:'بنزرت',nameEn:'Bizerte',type:'city',lat:37.2744,lng:9.8739},
    {nameAr:'قابس',nameEn:'Gabes',type:'city',lat:33.8882,lng:10.0975},
    {nameAr:'المنستير',nameEn:'Monastir',type:'city',lat:35.7643,lng:10.8113},
    {nameAr:'قفصة',nameEn:'Gafsa',type:'city',lat:34.425,lng:8.7842},
    {nameAr:'المهدية',nameEn:'Mahdia',type:'city',lat:35.5047,lng:11.0622},
    {nameAr:'تطاوين',nameEn:'Tataouine',type:'city',lat:32.9297,lng:10.4518},
    {nameAr:'قبلي',nameEn:'Kebili',type:'city',lat:33.7053,lng:8.9726},
    {nameAr:'نابل',nameEn:'Nabeul',type:'city',lat:36.4513,lng:10.7352},
    {nameAr:'زغوان',nameEn:'Zaghouan',type:'city',lat:36.4028,lng:10.1433},
    {nameAr:'سليانة',nameEn:'Siliana',type:'city',lat:36.0848,lng:9.3696},
    {nameAr:'الكاف',nameEn:'Kef',type:'city',lat:36.1741,lng:8.7108},
    {nameAr:'جندوبة',nameEn:'Jendouba',type:'city',lat:36.5011,lng:8.7803},
    {nameAr:'باجة',nameEn:'Beja',type:'city',lat:36.7333,lng:9.1833},
    {nameAr:'أريانة',nameEn:'Ariana',type:'city',lat:36.8625,lng:10.1956},
    {nameAr:'مدنين',nameEn:'Medenine',type:'city',lat:33.3547,lng:10.5053},
    {nameAr:'قرقنة',nameEn:'Kerkennah',type:'city',lat:34.7167,lng:11.1833},
  ],
  dz: [
    {nameAr:'الجزائر العاصمة',nameEn:'Algiers',type:'city',lat:36.7372,lng:3.0865},
    {nameAr:'وهران',nameEn:'Oran',type:'city',lat:35.6969,lng:-0.6331},
    {nameAr:'قسنطينة',nameEn:'Constantine',type:'city',lat:36.365,lng:6.6147},
    {nameAr:'عنابة',nameEn:'Annaba',type:'city',lat:36.9,lng:7.7667},
    {nameAr:'بجاية',nameEn:'Bejaia',type:'city',lat:36.7519,lng:5.0567},
    {nameAr:'تلمسان',nameEn:'Tlemcen',type:'city',lat:34.8828,lng:-1.3153},
    {nameAr:'سطيف',nameEn:'Setif',type:'city',lat:36.1898,lng:5.4108},
    {nameAr:'بسكرة',nameEn:'Biskra',type:'city',lat:34.8503,lng:5.7287},
    {nameAr:'تيزي وزو',nameEn:'Tizi Ouzou',type:'city',lat:36.7169,lng:4.0497},
    {nameAr:'البليدة',nameEn:'Blida',type:'city',lat:36.4703,lng:2.8277},
    {nameAr:'سكيكدة',nameEn:'Skikda',type:'city',lat:36.8761,lng:6.9044},
    {nameAr:'المسيلة',nameEn:'M\'Sila',type:'city',lat:35.7058,lng:4.5439},
    {nameAr:'تيارت',nameEn:'Tiaret',type:'city',lat:35.3706,lng:1.3178},
    {nameAr:'تبسة',nameEn:'Tebessa',type:'city',lat:35.4042,lng:8.1208},
    {nameAr:'جيجل',nameEn:'Jijel',type:'city',lat:36.8167,lng:5.7667},
    {nameAr:'مستغانم',nameEn:'Mostaganem',type:'city',lat:35.9311,lng:0.0894},
    {nameAr:'برج بوعريريج',nameEn:'Bordj Bou Arreridj',type:'city',lat:36.0731,lng:4.7633},
    {nameAr:'باتنة',nameEn:'Batna',type:'city',lat:35.5554,lng:6.1743},
    {nameAr:'الأغواط',nameEn:'Laghouat',type:'city',lat:33.8005,lng:2.8651},
    {nameAr:'الجلفة',nameEn:'Djelfa',type:'city',lat:34.6733,lng:3.2633},
    {nameAr:'غرداية',nameEn:'Ghardaïa',type:'city',lat:32.4903,lng:3.6739},
    {nameAr:'أدرار',nameEn:'Adrar',type:'city',lat:27.8742,lng:-0.2944},
    {nameAr:'تمنراست',nameEn:'Tamanrasset',type:'city',lat:22.785,lng:5.5228},
    {nameAr:'بومرداس',nameEn:'Boumerdes',type:'city',lat:36.7667,lng:3.4772},
    {nameAr:'الشلف',nameEn:'Chlef',type:'city',lat:36.1649,lng:1.3317},
  ],
  ma: [
    {nameAr:'الرباط',nameEn:'Rabat',type:'city',lat:34.0209,lng:-6.8417},
    {nameAr:'الدار البيضاء',nameEn:'Casablanca',type:'city',lat:33.5731,lng:-7.5898},
    {nameAr:'فاس',nameEn:'Fes',type:'city',lat:34.0333,lng:-5.0},
    {nameAr:'مراكش',nameEn:'Marrakech',type:'city',lat:31.6295,lng:-7.9811},
    {nameAr:'مكناس',nameEn:'Meknes',type:'city',lat:33.8935,lng:-5.5473},
    {nameAr:'طنجة',nameEn:'Tangier',type:'city',lat:35.7595,lng:-5.834},
    {nameAr:'أكادير',nameEn:'Agadir',type:'city',lat:30.4278,lng:-9.5981},
    {nameAr:'وجدة',nameEn:'Oujda',type:'city',lat:34.6814,lng:-1.9086},
    {nameAr:'القنيطرة',nameEn:'Kenitra',type:'city',lat:34.261,lng:-6.5802},
    {nameAr:'تطوان',nameEn:'Tetouan',type:'city',lat:35.5785,lng:-5.3684},
    {nameAr:'سلا',nameEn:'Sale',type:'city',lat:34.0531,lng:-6.7985},
    {nameAr:'سطات',nameEn:'Settat',type:'city',lat:33.0,lng:-7.6167},
    {nameAr:'الجديدة',nameEn:'El Jadida',type:'city',lat:33.2316,lng:-8.5007},
    {nameAr:'خريبكة',nameEn:'Khouribga',type:'city',lat:32.8811,lng:-6.9063},
    {nameAr:'الناظور',nameEn:'Nador',type:'city',lat:35.1741,lng:-2.9287},
    {nameAr:'بني ملال',nameEn:'Beni Mellal',type:'city',lat:32.3373,lng:-6.3498},
    {nameAr:'تازة',nameEn:'Taza',type:'city',lat:34.2155,lng:-4.0104},
    {nameAr:'الحسيمة',nameEn:'Al Hoceima',type:'city',lat:35.2517,lng:-3.9372},
    {nameAr:'آسفي',nameEn:'Safi',type:'city',lat:32.2994,lng:-9.2372},
    {nameAr:'ورزازات',nameEn:'Ouarzazate',type:'city',lat:30.9335,lng:-6.9370},
    {nameAr:'العرائش',nameEn:'Larache',type:'city',lat:35.1932,lng:-6.1561},
    {nameAr:'برشيد',nameEn:'Berrechid',type:'city',lat:33.2655,lng:-7.5884},
    {nameAr:'القصر الكبير',nameEn:'Ksar el-Kebir',type:'city',lat:35.0002,lng:-5.9014},
    {nameAr:'المحمدية',nameEn:'Mohammedia',type:'city',lat:33.6861,lng:-7.3828},
    {nameAr:'إفران',nameEn:'Ifrane',type:'city',lat:33.5228,lng:-5.1073},
  ],
  sd: [
    {nameAr:'الخرطوم',nameEn:'Khartoum',type:'city',lat:15.5007,lng:32.5599},
    {nameAr:'أم درمان',nameEn:'Omdurman',type:'city',lat:15.6445,lng:32.4777},
    {nameAr:'بورتسودان',nameEn:'Port Sudan',type:'city',lat:19.6158,lng:37.2164},
    {nameAr:'كسلا',nameEn:'Kassala',type:'city',lat:15.4517,lng:36.4},
    {nameAr:'الأبيض',nameEn:'Al-Ubayyid',type:'city',lat:13.1833,lng:30.2167},
    {nameAr:'نيالا',nameEn:'Nyala',type:'city',lat:12.0489,lng:24.8878},
    {nameAr:'عطبرة',nameEn:'Atbara',type:'city',lat:17.7,lng:33.9833},
    {nameAr:'الفاشر',nameEn:'El Fasher',type:'city',lat:13.6286,lng:25.3511},
    {nameAr:'مدني',nameEn:'Medani',type:'city',lat:14.3836,lng:33.4882},
    {nameAr:'الدمازين',nameEn:'Ad Damazin',type:'city',lat:11.7900,lng:34.3600},
    {nameAr:'سنار',nameEn:'Sennar',type:'city',lat:13.5500,lng:33.6333},
    {nameAr:'ربك',nameEn:'Rabak',type:'city',lat:13.1780,lng:32.7417},
    {nameAr:'القضارف',nameEn:'Al Qadarif',type:'city',lat:14.0439,lng:35.3863},
    {nameAr:'زالنجي',nameEn:'Zalingei',type:'city',lat:12.9068,lng:23.4706},
  ],
  ps: [
    {nameAr:'القدس',nameEn:'Jerusalem',type:'city',lat:31.7683,lng:35.2137},
    {nameAr:'غزة',nameEn:'Gaza',type:'city',lat:31.5017,lng:34.4668},
    {nameAr:'الضفة الغربية',nameEn:'West Bank',type:'city',lat:32.0,lng:35.25},
    {nameAr:'نابلس',nameEn:'Nablus',type:'city',lat:32.2211,lng:35.2544},
    {nameAr:'رام الله',nameEn:'Ramallah',type:'city',lat:31.8996,lng:35.2042},
    {nameAr:'الخليل',nameEn:'Hebron',type:'city',lat:31.5326,lng:35.0998},
    {nameAr:'جنين',nameEn:'Jenin',type:'city',lat:32.4597,lng:35.2979},
    {nameAr:'طولكرم',nameEn:'Tulkarm',type:'city',lat:32.3104,lng:35.0285},
    {nameAr:'أريحا',nameEn:'Jericho',type:'city',lat:31.8613,lng:35.4447},
    {nameAr:'بيت لحم',nameEn:'Bethlehem',type:'city',lat:31.7054,lng:35.2024},
    {nameAr:'خان يونس',nameEn:'Khan Yunis',type:'city',lat:31.3449,lng:34.3068},
    {nameAr:'رفح',nameEn:'Rafah',type:'city',lat:31.2826,lng:34.2547},
    {nameAr:'قلقيلية',nameEn:'Qalqilya',type:'city',lat:32.1865,lng:34.9754},
    {nameAr:'سلفيت',nameEn:'Salfit',type:'city',lat:32.0847,lng:35.1779},
    {nameAr:'طوباس',nameEn:'Tubas',type:'city',lat:32.3209,lng:35.3693},
    {nameAr:'أريحا',nameEn:'Jericho',type:'city',lat:31.8567,lng:35.4631},
  ],
  pk: [
    {nameAr:'كراتشي',nameEn:'Karachi',type:'city',lat:24.8607,lng:67.0011},
    {nameAr:'لاهور',nameEn:'Lahore',type:'city',lat:31.5204,lng:74.3587},
    {nameAr:'إسلام آباد',nameEn:'Islamabad',type:'city',lat:33.6844,lng:73.0479},
    {nameAr:'فيصل آباد',nameEn:'Faisalabad',type:'city',lat:31.4504,lng:73.135},
    {nameAr:'راولبندي',nameEn:'Rawalpindi',type:'city',lat:33.5651,lng:73.0169},
    {nameAr:'ملتان',nameEn:'Multan',type:'city',lat:30.1575,lng:71.5249},
    {nameAr:'حيدر آباد',nameEn:'Hyderabad',type:'city',lat:25.3792,lng:68.3683},
    {nameAr:'كيتا',nameEn:'Quetta',type:'city',lat:30.1798,lng:66.975},
    {nameAr:'بيشاور',nameEn:'Peshawar',type:'city',lat:34.0,lng:71.5},
    {nameAr:'غوجرانوالا',nameEn:'Gujranwala',type:'city',lat:32.1877,lng:74.1945},
    {nameAr:'سيالكوت',nameEn:'Sialkot',type:'city',lat:32.4945,lng:74.5229},
    {nameAr:'سرغودا',nameEn:'Sargodha',type:'city',lat:32.0836,lng:72.6711},
    {nameAr:'بهاولبور',nameEn:'Bahawalpur',type:'city',lat:29.3956,lng:71.6722},
    {nameAr:'سكهر',nameEn:'Sukkur',type:'city',lat:27.7052,lng:68.8574},
    {nameAr:'شيخوبورة',nameEn:'Sheikhupura',type:'city',lat:31.7131,lng:73.9853},
  ],
  tr: [
    {nameAr:'إسطنبول',nameEn:'Istanbul',type:'city',lat:41.0082,lng:28.9784},
    {nameAr:'أنقرة',nameEn:'Ankara',type:'city',lat:39.9334,lng:32.8597},
    {nameAr:'إزمير',nameEn:'Izmir',type:'city',lat:38.4192,lng:27.1287},
    {nameAr:'أنطاليا',nameEn:'Antalya',type:'city',lat:36.8969,lng:30.7133},
    {nameAr:'أضنة',nameEn:'Adana',type:'city',lat:37.0,lng:35.3213},
    {nameAr:'بورصة',nameEn:'Bursa',type:'city',lat:40.1885,lng:29.061},
    {nameAr:'طرابزون',nameEn:'Trabzon',type:'city',lat:41.005,lng:39.7239},
    {nameAr:'كونيا',nameEn:'Konya',type:'city',lat:37.871,lng:32.4932},
    {nameAr:'غازي عنتاب',nameEn:'Gaziantep',type:'city',lat:37.0662,lng:37.3833},
    {nameAr:'مرسين',nameEn:'Mersin',type:'city',lat:36.8,lng:34.6333},
    {nameAr:'قيصري',nameEn:'Kayseri',type:'city',lat:38.7225,lng:35.4875},
    {nameAr:'إسكندرونة',nameEn:'Iskenderun',type:'city',lat:36.5853,lng:36.1667},
    {nameAr:'ديار بكر',nameEn:'Diyarbakir',type:'city',lat:37.9144,lng:40.2306},
    {nameAr:'أورفة',nameEn:'Urfa',type:'city',lat:37.1591,lng:38.7969},
    {nameAr:'ملاطية',nameEn:'Malatya',type:'city',lat:38.3552,lng:38.3095},
    {nameAr:'إسكيشهير',nameEn:'Eskisehir',type:'city',lat:39.7767,lng:30.5206},
    {nameAr:'طرسوس',nameEn:'Tarsus',type:'city',lat:36.9163,lng:34.8956},
    {nameAr:'سامسون',nameEn:'Samsun',type:'city',lat:41.2867,lng:36.33},
  ],
  ir: [
    {nameAr:'طهران',nameEn:'Tehran',type:'city',lat:35.6892,lng:51.389},
    {nameAr:'مشهد',nameEn:'Mashhad',type:'city',lat:36.2972,lng:59.6067},
    {nameAr:'أصفهان',nameEn:'Isfahan',type:'city',lat:32.6539,lng:51.6661},
    {nameAr:'شيراز',nameEn:'Shiraz',type:'city',lat:29.5918,lng:52.5837},
    {nameAr:'تبريز',nameEn:'Tabriz',type:'city',lat:38.08,lng:46.2919},
    {nameAr:'كرج',nameEn:'Karaj',type:'city',lat:35.8325,lng:50.9993},
    {nameAr:'أهواز',nameEn:'Ahvaz',type:'city',lat:31.3183,lng:48.6706},
    {nameAr:'قم',nameEn:'Qom',type:'city',lat:34.6401,lng:50.8764},
    {nameAr:'كرمانشاه',nameEn:'Kermanshah',type:'city',lat:34.3142,lng:47.065},
    {nameAr:'أورمية',nameEn:'Urmia',type:'city',lat:37.5527,lng:45.0761},
    {nameAr:'زاهدان',nameEn:'Zahedan',type:'city',lat:29.4964,lng:60.8629},
    {nameAr:'رشت',nameEn:'Rasht',type:'city',lat:37.2808,lng:49.5832},
    {nameAr:'كرمان',nameEn:'Kerman',type:'city',lat:30.2839,lng:57.0834},
    {nameAr:'همدان',nameEn:'Hamedan',type:'city',lat:34.7986,lng:48.5146},
    {nameAr:'يزد',nameEn:'Yazd',type:'city',lat:31.8974,lng:54.3569},
    {nameAr:'بندر عباس',nameEn:'Bandar Abbas',type:'city',lat:27.1865,lng:56.2808},
    {nameAr:'أردبيل',nameEn:'Ardabil',type:'city',lat:38.2498,lng:48.2934},
    {nameAr:'سنندج',nameEn:'Sanandaj',type:'city',lat:35.3219,lng:46.9987},
  ],
  my: [
    {nameAr:'كوالالمبور',nameEn:'Kuala Lumpur',type:'city',lat:3.1478,lng:101.6953},
    {nameAr:'جورج تاون',nameEn:'George Town',type:'city',lat:5.4141,lng:100.3288},
    {nameAr:'ايبوه',nameEn:'Ipoh',type:'city',lat:4.5975,lng:101.0901},
    {nameAr:'جوهور بهرو',nameEn:'Johor Bahru',type:'city',lat:1.4655,lng:103.7578},
    {nameAr:'كوتا كينابالو',nameEn:'Kota Kinabalu',type:'city',lat:5.9804,lng:116.0735},
    {nameAr:'كوتشينغ',nameEn:'Kuching',type:'city',lat:1.5533,lng:110.3592},
    {nameAr:'بيتالينغ جايا',nameEn:'Petaling Jaya',type:'city',lat:3.1073,lng:101.6067},
    {nameAr:'شاه علم',nameEn:'Shah Alam',type:'city',lat:3.0733,lng:101.5185},
    {nameAr:'سيمبانغ',nameEn:'Seremban',type:'city',lat:2.7297,lng:101.9381},
    {nameAr:'كوانتان',nameEn:'Kuantan',type:'city',lat:3.8077,lng:103.3260},
    {nameAr:'ألور ستار',nameEn:'Alor Setar',type:'city',lat:6.1248,lng:100.3673},
    {nameAr:'ميري',nameEn:'Miri',type:'city',lat:4.3995,lng:113.9914},
    {nameAr:'سيبو',nameEn:'Sibu',type:'city',lat:2.3,lng:111.8167},
    {nameAr:'باهانغ',nameEn:'Pahang',type:'city',lat:3.8126,lng:103.3256},
  ],
  id: [
    {nameAr:'جاكرتا',nameEn:'Jakarta',type:'city',lat:-6.2088,lng:106.8456},
    {nameAr:'سورابايا',nameEn:'Surabaya',type:'city',lat:-7.2575,lng:112.7521},
    {nameAr:'باندونغ',nameEn:'Bandung',type:'city',lat:-6.9175,lng:107.6191},
    {nameAr:'ميدان',nameEn:'Medan',type:'city',lat:3.5952,lng:98.6722},
    {nameAr:'سيمارانغ',nameEn:'Semarang',type:'city',lat:-6.9932,lng:110.4203},
    {nameAr:'بالمبانغ',nameEn:'Palembang',type:'city',lat:-2.9167,lng:104.7458},
    {nameAr:'ماكاسار',nameEn:'Makassar',type:'city',lat:-5.1477,lng:119.4327},
    {nameAr:'يوغياكارتا',nameEn:'Yogyakarta',type:'city',lat:-7.7956,lng:110.3695},
    {nameAr:'باتام',nameEn:'Batam',type:'city',lat:1.0456,lng:104.0305},
    {nameAr:'باليكبابان',nameEn:'Balikpapan',type:'city',lat:-1.2654,lng:116.8312},
    {nameAr:'آتشيه',nameEn:'Banda Aceh',type:'city',lat:5.5483,lng:95.3238},
    {nameAr:'مناهاسا',nameEn:'Manado',type:'city',lat:1.4748,lng:124.8421},
    {nameAr:'أمبون',nameEn:'Ambon',type:'city',lat:-3.6554,lng:128.1908},
  ],
  // ── بنغلاديش ──
  bd: [
    {nameAr:'دكا',nameEn:'Dhaka',type:'city',lat:23.8103,lng:90.4125},
    {nameAr:'شيتاغونغ',nameEn:'Chittagong',type:'city',lat:22.3569,lng:91.7832},
    {nameAr:'خولنا',nameEn:'Khulna',type:'city',lat:22.8456,lng:89.5403},
    {nameAr:'راجشاهي',nameEn:'Rajshahi',type:'city',lat:24.3745,lng:88.6042},
    {nameAr:'سيلهيت',nameEn:'Sylhet',type:'city',lat:24.8949,lng:91.8687},
    {nameAr:'بارسال',nameEn:'Barisal',type:'city',lat:22.701,lng:90.3535},
    {nameAr:'رانغبور',nameEn:'Rangpur',type:'city',lat:25.7439,lng:89.2752},
    {nameAr:'ميمنسينغ',nameEn:'Mymensingh',type:'city',lat:24.7471,lng:90.4203},
    {nameAr:'كومينا',nameEn:'Comilla',type:'city',lat:23.4607,lng:91.1809},
    {nameAr:'ناراينغانج',nameEn:'Narayanganj',type:'city',lat:23.6238,lng:90.4996},
  ],
  // ── أفغانستان ──
  af: [
    {nameAr:'كابول',nameEn:'Kabul',type:'city',lat:34.5553,lng:69.2075},
    {nameAr:'قندهار',nameEn:'Kandahar',type:'city',lat:31.6289,lng:65.7372},
    {nameAr:'هرات',nameEn:'Herat',type:'city',lat:34.3482,lng:62.2042},
    {nameAr:'مزار شريف',nameEn:'Mazar-i-Sharif',type:'city',lat:36.7069,lng:67.1107},
    {nameAr:'جلال آباد',nameEn:'Jalalabad',type:'city',lat:34.4415,lng:70.4432},
    {nameAr:'كندز',nameEn:'Kunduz',type:'city',lat:36.7283,lng:68.8676},
    {nameAr:'غزني',nameEn:'Ghazni',type:'city',lat:33.5537,lng:68.4221},
    {nameAr:'بلخ',nameEn:'Balkh',type:'city',lat:36.7557,lng:66.8975},
    {nameAr:'لشكرغاه',nameEn:'Lashkar Gah',type:'city',lat:31.5932,lng:64.3693},
    {nameAr:'تالقان',nameEn:'Taloqan',type:'city',lat:36.7358,lng:69.5358},
  ],
  // ── الهند ──
  in: [
    {nameAr:'نيودلهي',nameEn:'New Delhi',type:'city',lat:28.6139,lng:77.209},
    {nameAr:'مومباي',nameEn:'Mumbai',type:'city',lat:19.076,lng:72.8777},
    {nameAr:'حيدراباد',nameEn:'Hyderabad',type:'city',lat:17.385,lng:78.4867},
    {nameAr:'أحمد آباد',nameEn:'Ahmedabad',type:'city',lat:23.0225,lng:72.5714},
    {nameAr:'بنغالور',nameEn:'Bangalore',type:'city',lat:12.9716,lng:77.5946},
    {nameAr:'تشيناي',nameEn:'Chennai',type:'city',lat:13.0827,lng:80.2707},
    {nameAr:'كولكاتا',nameEn:'Kolkata',type:'city',lat:22.5726,lng:88.3639},
    {nameAr:'بونا',nameEn:'Pune',type:'city',lat:18.5204,lng:73.8567},
    {nameAr:'لكنو',nameEn:'Lucknow',type:'city',lat:26.8467,lng:80.9462},
    {nameAr:'جيبور',nameEn:'Jaipur',type:'city',lat:26.9124,lng:75.7873},
    {nameAr:'سورات',nameEn:'Surat',type:'city',lat:21.1702,lng:72.8311},
    {nameAr:'كانبور',nameEn:'Kanpur',type:'city',lat:26.4499,lng:80.3319},
    {nameAr:'ناغبور',nameEn:'Nagpur',type:'city',lat:21.1458,lng:79.0882},
    {nameAr:'إندور',nameEn:'Indore',type:'city',lat:22.7196,lng:75.8577},
    {nameAr:'بوبال',nameEn:'Bhopal',type:'city',lat:23.2599,lng:77.4126},
  ],
  // ── الصين ──
  cn: [
    {nameAr:'بكين',nameEn:'Beijing',type:'city',lat:39.9042,lng:116.4074},
    {nameAr:'شنغهاي',nameEn:'Shanghai',type:'city',lat:31.2304,lng:121.4737},
    {nameAr:'غوانغجو',nameEn:'Guangzhou',type:'city',lat:23.1291,lng:113.2644},
    {nameAr:'شنتشن',nameEn:'Shenzhen',type:'city',lat:22.5431,lng:114.0579},
    {nameAr:'تشنغدو',nameEn:'Chengdu',type:'city',lat:30.5728,lng:104.0668},
    {nameAr:'تيانجين',nameEn:'Tianjin',type:'city',lat:39.3434,lng:117.3616},
    {nameAr:'ووهان',nameEn:'Wuhan',type:'city',lat:30.5928,lng:114.3055},
    {nameAr:'شيآن',nameEn:"Xi'an",type:'city',lat:34.3416,lng:108.9398},
    {nameAr:'هانغجو',nameEn:'Hangzhou',type:'city',lat:30.2741,lng:120.1551},
    {nameAr:'نانجينغ',nameEn:'Nanjing',type:'city',lat:32.0603,lng:118.7969},
    {nameAr:'أورومتشي',nameEn:'Urumqi',type:'city',lat:43.8256,lng:87.6168},
    {nameAr:'كاشغر',nameEn:'Kashgar',type:'city',lat:39.4704,lng:75.9895},
    {nameAr:'كونمينغ',nameEn:'Kunming',type:'city',lat:25.0453,lng:102.7097},
    {nameAr:'تشونغتشينغ',nameEn:'Chongqing',type:'city',lat:29.4316,lng:106.9123},
    {nameAr:'هاربين',nameEn:'Harbin',type:'city',lat:45.8038,lng:126.5349},
  ],
  // ── اليابان ──
  jp: [
    {nameAr:'طوكيو',nameEn:'Tokyo',type:'city',lat:35.6762,lng:139.6503},
    {nameAr:'أوساكا',nameEn:'Osaka',type:'city',lat:34.6937,lng:135.5023},
    {nameAr:'ناغويا',nameEn:'Nagoya',type:'city',lat:35.1815,lng:136.9066},
    {nameAr:'سابورو',nameEn:'Sapporo',type:'city',lat:43.0618,lng:141.3545},
    {nameAr:'فوكوكا',nameEn:'Fukuoka',type:'city',lat:33.5904,lng:130.4017},
    {nameAr:'كيوتو',nameEn:'Kyoto',type:'city',lat:35.0116,lng:135.7681},
    {nameAr:'كوبي',nameEn:'Kobe',type:'city',lat:34.6901,lng:135.1956},
    {nameAr:'كاواساكي',nameEn:'Kawasaki',type:'city',lat:35.5308,lng:139.7029},
    {nameAr:'سيتاما',nameEn:'Saitama',type:'city',lat:35.8617,lng:139.6455},
    {nameAr:'هيروشيما',nameEn:'Hiroshima',type:'city',lat:34.3853,lng:132.4553},
    {nameAr:'سيندي',nameEn:'Sendai',type:'city',lat:38.2682,lng:140.8694},
    {nameAr:'كيتاكيوشو',nameEn:'Kitakyushu',type:'city',lat:33.8834,lng:130.8751},
    {nameAr:'ناغاساكي',nameEn:'Nagasaki',type:'city',lat:32.7503,lng:129.8777},
    {nameAr:'أوكيناوا',nameEn:'Okinawa',type:'city',lat:26.2124,lng:127.6809},
    {nameAr:'يوكوهاما',nameEn:'Yokohama',type:'city',lat:35.4437,lng:139.638},
  ],
  // ── كوريا الجنوبية ──
  kr: [
    {nameAr:'سيول',nameEn:'Seoul',type:'city',lat:37.5665,lng:126.978},
    {nameAr:'بوسان',nameEn:'Busan',type:'city',lat:35.1796,lng:129.0756},
    {nameAr:'إنتشون',nameEn:'Incheon',type:'city',lat:37.4563,lng:126.7052},
    {nameAr:'دايغو',nameEn:'Daegu',type:'city',lat:35.8714,lng:128.6014},
    {nameAr:'دايجون',nameEn:'Daejeon',type:'city',lat:36.3504,lng:127.3845},
    {nameAr:'غوانغجو',nameEn:'Gwangju',type:'city',lat:35.1595,lng:126.8526},
    {nameAr:'سوون',nameEn:'Suwon',type:'city',lat:37.2636,lng:127.0286},
    {nameAr:'سيونغنام',nameEn:'Seongnam',type:'city',lat:37.4449,lng:127.1388},
    {nameAr:'يولسان',nameEn:'Ulsan',type:'city',lat:35.5384,lng:129.3114},
    {nameAr:'جيجو',nameEn:'Jeju',type:'city',lat:33.4996,lng:126.5312},
  ],
  // ── فرنسا ──
  fr: [
    {nameAr:'باريس',nameEn:'Paris',type:'city',lat:48.8566,lng:2.3522},
    {nameAr:'مرسيليا',nameEn:'Marseille',type:'city',lat:43.2965,lng:5.3698},
    {nameAr:'ليون',nameEn:'Lyon',type:'city',lat:45.7640,lng:4.8357},
    {nameAr:'تولوز',nameEn:'Toulouse',type:'city',lat:43.6047,lng:1.4442},
    {nameAr:'نيس',nameEn:'Nice',type:'city',lat:43.7102,lng:7.262},
    {nameAr:'نانت',nameEn:'Nantes',type:'city',lat:47.2184,lng:-1.5536},
    {nameAr:'ستراسبورغ',nameEn:'Strasbourg',type:'city',lat:48.5734,lng:7.7521},
    {nameAr:'مونبلييه',nameEn:'Montpellier',type:'city',lat:43.6108,lng:3.8767},
    {nameAr:'بوردو',nameEn:'Bordeaux',type:'city',lat:44.8378,lng:-0.5792},
    {nameAr:'ليل',nameEn:'Lille',type:'city',lat:50.6292,lng:3.0573},
    {nameAr:'رين',nameEn:'Rennes',type:'city',lat:48.1173,lng:-1.6778},
    {nameAr:'لو هافر',nameEn:'Le Havre',type:'city',lat:49.4938,lng:0.1077},
  ],
  // ── ألمانيا ──
  de: [
    {nameAr:'برلين',nameEn:'Berlin',type:'city',lat:52.52,lng:13.405},
    {nameAr:'هامبورغ',nameEn:'Hamburg',type:'city',lat:53.5753,lng:10.0153},
    {nameAr:'ميونيخ',nameEn:'Munich',type:'city',lat:48.1351,lng:11.582},
    {nameAr:'كولونيا',nameEn:'Cologne',type:'city',lat:50.9333,lng:6.95},
    {nameAr:'فرانكفورت',nameEn:'Frankfurt',type:'city',lat:50.1109,lng:8.6821},
    {nameAr:'شتوتغارت',nameEn:'Stuttgart',type:'city',lat:48.7758,lng:9.1829},
    {nameAr:'دوسلدورف',nameEn:'Düsseldorf',type:'city',lat:51.2217,lng:6.7762},
    {nameAr:'دورتموند',nameEn:'Dortmund',type:'city',lat:51.5136,lng:7.4653},
    {nameAr:'إيسن',nameEn:'Essen',type:'city',lat:51.4556,lng:7.0116},
    {nameAr:'لايبزيغ',nameEn:'Leipzig',type:'city',lat:51.3397,lng:12.3731},
    {nameAr:'بريمن',nameEn:'Bremen',type:'city',lat:53.0793,lng:8.8017},
    {nameAr:'درسدن',nameEn:'Dresden',type:'city',lat:51.0504,lng:13.7373},
    {nameAr:'هانوفر',nameEn:'Hanover',type:'city',lat:52.3759,lng:9.732},
    {nameAr:'نورنبرغ',nameEn:'Nuremberg',type:'city',lat:49.4521,lng:11.0767},
  ],
  // ── المملكة المتحدة ──
  gb: [
    {nameAr:'لندن',nameEn:'London',type:'city',lat:51.5074,lng:-0.1278},
    {nameAr:'برمنغهام',nameEn:'Birmingham',type:'city',lat:52.4862,lng:-1.8904},
    {nameAr:'مانشستر',nameEn:'Manchester',type:'city',lat:53.4808,lng:-2.2426},
    {nameAr:'ليدز',nameEn:'Leeds',type:'city',lat:53.8008,lng:-1.5491},
    {nameAr:'غلاسكو',nameEn:'Glasgow',type:'city',lat:55.8642,lng:-4.2518},
    {nameAr:'ليفربول',nameEn:'Liverpool',type:'city',lat:53.4084,lng:-2.9916},
    {nameAr:'إدنبرة',nameEn:'Edinburgh',type:'city',lat:55.9533,lng:-3.1883},
    {nameAr:'برستول',nameEn:'Bristol',type:'city',lat:51.4545,lng:-2.5879},
    {nameAr:'شيفيلد',nameEn:'Sheffield',type:'city',lat:53.3811,lng:-1.4701},
    {nameAr:'كاردف',nameEn:'Cardiff',type:'city',lat:51.4816,lng:-3.1791},
    {nameAr:'بلفاست',nameEn:'Belfast',type:'city',lat:54.5973,lng:-5.9301},
    {nameAr:'نيوكاسل',nameEn:'Newcastle',type:'city',lat:54.9783,lng:-1.6178},
    {nameAr:'نوتنغهام',nameEn:'Nottingham',type:'city',lat:52.9548,lng:-1.1581},
    {nameAr:'لستر',nameEn:'Leicester',type:'city',lat:52.6369,lng:-1.1398},
    {nameAr:'برادفورد',nameEn:'Bradford',type:'city',lat:53.7960,lng:-1.7594},
    {nameAr:'لوتون',nameEn:'Luton',type:'city',lat:51.8787,lng:-0.4200},
  ],
  // ── إسبانيا ──
  es: [
    {nameAr:'مدريد',nameEn:'Madrid',type:'city',lat:40.4168,lng:-3.7038},
    {nameAr:'برشلونة',nameEn:'Barcelona',type:'city',lat:41.3851,lng:2.1734},
    {nameAr:'فالنسيا',nameEn:'Valencia',type:'city',lat:39.4699,lng:-0.3763},
    {nameAr:'إشبيلية',nameEn:'Seville',type:'city',lat:37.3891,lng:-5.9845},
    {nameAr:'ثاراغوثا',nameEn:'Zaragoza',type:'city',lat:41.6488,lng:-0.8891},
    {nameAr:'مالقة',nameEn:'Málaga',type:'city',lat:36.7213,lng:-4.4214},
    {nameAr:'مرسية',nameEn:'Murcia',type:'city',lat:37.9922,lng:-1.1307},
    {nameAr:'بلباو',nameEn:'Bilbao',type:'city',lat:43.263,lng:-2.935},
    {nameAr:'أليكانتي',nameEn:'Alicante',type:'city',lat:38.3452,lng:-0.481},
    {nameAr:'قرطبة',nameEn:'Córdoba',type:'city',lat:37.8882,lng:-4.7794},
    {nameAr:'غرناطة',nameEn:'Granada',type:'city',lat:37.1773,lng:-3.5986},
    {nameAr:'سبتة',nameEn:'Ceuta',type:'city',lat:35.8894,lng:-5.3213},
    {nameAr:'مليلة',nameEn:'Melilla',type:'city',lat:35.2923,lng:-2.9381},
  ],
  // ── إيطاليا ──
  it: [
    {nameAr:'روما',nameEn:'Rome',type:'city',lat:41.9028,lng:12.4964},
    {nameAr:'ميلانو',nameEn:'Milan',type:'city',lat:45.4642,lng:9.19},
    {nameAr:'نابولي',nameEn:'Naples',type:'city',lat:40.8518,lng:14.2681},
    {nameAr:'تورينو',nameEn:'Turin',type:'city',lat:45.0703,lng:7.6869},
    {nameAr:'باليرمو',nameEn:'Palermo',type:'city',lat:38.1157,lng:13.3615},
    {nameAr:'جنوى',nameEn:'Genoa',type:'city',lat:44.4056,lng:8.9463},
    {nameAr:'بولونيا',nameEn:'Bologna',type:'city',lat:44.4949,lng:11.3426},
    {nameAr:'فلورنسا',nameEn:'Florence',type:'city',lat:43.7696,lng:11.2558},
    {nameAr:'بارى',nameEn:'Bari',type:'city',lat:41.1171,lng:16.8719},
    {nameAr:'فينيسيا',nameEn:'Venice',type:'city',lat:45.4408,lng:12.3155},
    {nameAr:'كاتانيا',nameEn:'Catania',type:'city',lat:37.5079,lng:15.083},
    {nameAr:'ميسينا',nameEn:'Messina',type:'city',lat:38.1938,lng:15.554},
  ],
  // ── هولندا ──
  nl: [
    {nameAr:'أمستردام',nameEn:'Amsterdam',type:'city',lat:52.3676,lng:4.9041},
    {nameAr:'روتردام',nameEn:'Rotterdam',type:'city',lat:51.9244,lng:4.4777},
    {nameAr:'لاهاي',nameEn:'The Hague',type:'city',lat:52.0705,lng:4.3007},
    {nameAr:'أوتريخت',nameEn:'Utrecht',type:'city',lat:52.0907,lng:5.1214},
    {nameAr:'أيندهوفن',nameEn:'Eindhoven',type:'city',lat:51.4416,lng:5.4697},
    {nameAr:'تيلبورغ',nameEn:'Tilburg',type:'city',lat:51.5555,lng:5.0913},
    {nameAr:'غرونينغن',nameEn:'Groningen',type:'city',lat:53.2194,lng:6.5665},
  ],
  // ── بلجيكا ──
  be: [
    {nameAr:'بروكسل',nameEn:'Brussels',type:'city',lat:50.8503,lng:4.3517},
    {nameAr:'غنت',nameEn:'Ghent',type:'city',lat:51.0543,lng:3.7174},
    {nameAr:'أنتورب',nameEn:'Antwerp',type:'city',lat:51.2194,lng:4.4025},
    {nameAr:'لييج',nameEn:'Liège',type:'city',lat:50.6326,lng:5.5797},
    {nameAr:'بروج',nameEn:'Bruges',type:'city',lat:51.2093,lng:3.2247},
    {nameAr:'ناميور',nameEn:'Namur',type:'city',lat:50.4669,lng:4.8675},
  ],
  // ── روسيا ──
  ru: [
    {nameAr:'موسكو',nameEn:'Moscow',type:'city',lat:55.7558,lng:37.6173},
    {nameAr:'سانت بطرسبرغ',nameEn:'Saint Petersburg',type:'city',lat:59.9343,lng:30.3351},
    {nameAr:'نوفوسيبيرسك',nameEn:'Novosibirsk',type:'city',lat:54.9885,lng:82.9207},
    {nameAr:'يكاترينبورغ',nameEn:'Yekaterinburg',type:'city',lat:56.8389,lng:60.6057},
    {nameAr:'نيجني نوفغورود',nameEn:'Nizhny Novgorod',type:'city',lat:56.2965,lng:43.9361},
    {nameAr:'قازان',nameEn:'Kazan',type:'city',lat:55.7887,lng:49.1221},
    {nameAr:'تشيليابينسك',nameEn:'Chelyabinsk',type:'city',lat:55.1644,lng:61.4368},
    {nameAr:'أومسك',nameEn:'Omsk',type:'city',lat:54.9885,lng:73.3242},
    {nameAr:'سمارة',nameEn:'Samara',type:'city',lat:53.2038,lng:50.1606},
    {nameAr:'أوفا',nameEn:'Ufa',type:'city',lat:54.7388,lng:55.9721},
    {nameAr:'غروزني',nameEn:'Grozny',type:'city',lat:43.3189,lng:45.6984},
    {nameAr:'ماخاتشقلا',nameEn:'Makhachkala',type:'city',lat:42.9849,lng:47.5047},
  ],
  // ── الولايات المتحدة ──
  us: [
    {nameAr:'نيويورك',nameEn:'New York',type:'city',lat:40.7128,lng:-74.006},
    {nameAr:'لوس أنجلوس',nameEn:'Los Angeles',type:'city',lat:34.0522,lng:-118.2437},
    {nameAr:'شيكاغو',nameEn:'Chicago',type:'city',lat:41.8781,lng:-87.6298},
    {nameAr:'هيوستن',nameEn:'Houston',type:'city',lat:29.7604,lng:-95.3698},
    {nameAr:'فينيكس',nameEn:'Phoenix',type:'city',lat:33.4484,lng:-112.074},
    {nameAr:'فيلادلفيا',nameEn:'Philadelphia',type:'city',lat:39.9526,lng:-75.1652},
    {nameAr:'سان أنطونيو',nameEn:'San Antonio',type:'city',lat:29.4241,lng:-98.4936},
    {nameAr:'سان دييغو',nameEn:'San Diego',type:'city',lat:32.7157,lng:-117.1611},
    {nameAr:'دالاس',nameEn:'Dallas',type:'city',lat:32.7767,lng:-96.797},
    {nameAr:'سان خوسيه',nameEn:'San Jose',type:'city',lat:37.3382,lng:-121.8863},
    {nameAr:'واشنطن',nameEn:'Washington DC',type:'city',lat:38.9072,lng:-77.0369},
    {nameAr:'ديترويت',nameEn:'Detroit',type:'city',lat:42.3314,lng:-83.0458},
    {nameAr:'دير بورن',nameEn:'Dearborn',type:'city',lat:42.3223,lng:-83.1763},
    {nameAr:'جيرسي سيتي',nameEn:'Jersey City',type:'city',lat:40.7178,lng:-74.0431},
    {nameAr:'فريمونت',nameEn:'Fremont',type:'city',lat:37.5485,lng:-121.9886},
    {nameAr:'باترسون',nameEn:'Paterson',type:'city',lat:40.9168,lng:-74.1719},
  ],
  // ── كندا ──
  ca: [
    {nameAr:'تورنتو',nameEn:'Toronto',type:'city',lat:43.7001,lng:-79.4163},
    {nameAr:'مونتريال',nameEn:'Montreal',type:'city',lat:45.5017,lng:-73.5673},
    {nameAr:'كالغاري',nameEn:'Calgary',type:'city',lat:51.0447,lng:-114.0719},
    {nameAr:'أوتاوا',nameEn:'Ottawa',type:'city',lat:45.4215,lng:-75.6972},
    {nameAr:'إدمنتون',nameEn:'Edmonton',type:'city',lat:53.5461,lng:-113.4938},
    {nameAr:'ميسيساغا',nameEn:'Mississauga',type:'city',lat:43.589,lng:-79.6441},
    {nameAr:'وينيبيغ',nameEn:'Winnipeg',type:'city',lat:49.8951,lng:-97.1384},
    {nameAr:'فانكوفر',nameEn:'Vancouver',type:'city',lat:49.2827,lng:-123.1207},
    {nameAr:'هاميلتون',nameEn:'Hamilton',type:'city',lat:43.2557,lng:-79.8711},
    {nameAr:'كيبيك',nameEn:'Quebec City',type:'city',lat:46.8139,lng:-71.2082},
    {nameAr:'سري',nameEn:'Surrey',type:'city',lat:49.1913,lng:-122.849},
    {nameAr:'هاليفاكس',nameEn:'Halifax',type:'city',lat:44.6488,lng:-63.5752},
  ],
  // ── أستراليا ──
  au: [
    {nameAr:'سيدني',nameEn:'Sydney',type:'city',lat:-33.8688,lng:151.2093},
    {nameAr:'ملبورن',nameEn:'Melbourne',type:'city',lat:-37.8136,lng:144.9631},
    {nameAr:'بريسبان',nameEn:'Brisbane',type:'city',lat:-27.4698,lng:153.0251},
    {nameAr:'بيرث',nameEn:'Perth',type:'city',lat:-31.9505,lng:115.8605},
    {nameAr:'أديلايد',nameEn:'Adelaide',type:'city',lat:-34.9285,lng:138.6007},
    {nameAr:'كانبيرا',nameEn:'Canberra',type:'city',lat:-35.2809,lng:149.13},
    {nameAr:'هوبارت',nameEn:'Hobart',type:'city',lat:-42.8821,lng:147.3272},
    {nameAr:'داروين',nameEn:'Darwin',type:'city',lat:-12.4634,lng:130.8456},
    {nameAr:'غولد كوست',nameEn:'Gold Coast',type:'city',lat:-28.0167,lng:153.4},
    {nameAr:'نيوكاسل',nameEn:'Newcastle',type:'city',lat:-32.9167,lng:151.75},
    {nameAr:'ولونغونغ',nameEn:'Wollongong',type:'city',lat:-34.4278,lng:150.8931},
    {nameAr:'لاكمبا',nameEn:'Lakemba',type:'city',lat:-33.9167,lng:151.0667},
  ],
  // ── تركيا ─ إضافة مدن بخلاف الموجودة ──
  // (tr موجودة سابقاً في STATIC_CITIES)
  // ── ماليزيا ─ موجودة سابقاً ──
  // ── نيجيريا ──
  ng: [
    {nameAr:'أبوجا',nameEn:'Abuja',type:'city',lat:9.0765,lng:7.3986},
    {nameAr:'لاغوس',nameEn:'Lagos',type:'city',lat:6.5244,lng:3.3792},
    {nameAr:'كانو',nameEn:'Kano',type:'city',lat:12.0022,lng:8.5920},
    {nameAr:'إبادان',nameEn:'Ibadan',type:'city',lat:7.3775,lng:3.9470},
    {nameAr:'كادونا',nameEn:'Kaduna',type:'city',lat:10.5264,lng:7.4384},
    {nameAr:'بنين سيتي',nameEn:'Benin City',type:'city',lat:6.3176,lng:5.6145},
    {nameAr:'بورت هاركورت',nameEn:'Port Harcourt',type:'city',lat:4.8156,lng:7.0498},
    {nameAr:'زاريا',nameEn:'Zaria',type:'city',lat:11.0855,lng:7.7199},
    {nameAr:'ميدوغوري',nameEn:'Maiduguri',type:'city',lat:11.8333,lng:13.15},
    {nameAr:'سوكوتو',nameEn:'Sokoto',type:'city',lat:13.0059,lng:5.2476},
  ],
  // ── إثيوبيا ──
  et: [
    {nameAr:'أديس أبابا',nameEn:'Addis Ababa',type:'city',lat:9.03,lng:38.74},
    {nameAr:'ديرة داوة',nameEn:'Dire Dawa',type:'city',lat:9.5935,lng:41.8661},
    {nameAr:'ميكيلي',nameEn:'Mekelle',type:'city',lat:13.4967,lng:39.4753},
    {nameAr:'غوندر',nameEn:'Gondar',type:'city',lat:12.6,lng:37.4667},
    {nameAr:'عواسا',nameEn:'Awasa',type:'city',lat:7.05,lng:38.4667},
    {nameAr:'هرار',nameEn:'Harar',type:'city',lat:9.3125,lng:42.1196},
    {nameAr:'نازريت',nameEn:'Adama',type:'city',lat:8.5414,lng:39.2678},
    {nameAr:'جيما',nameEn:'Jimma',type:'city',lat:7.6833,lng:36.8333},
  ],
  // ── كينيا ──
  ke: [
    {nameAr:'نيروبي',nameEn:'Nairobi',type:'city',lat:-1.2921,lng:36.8219},
    {nameAr:'مومباسا',nameEn:'Mombasa',type:'city',lat:-4.0435,lng:39.6682},
    {nameAr:'كيسومو',nameEn:'Kisumu',type:'city',lat:-0.1022,lng:34.7617},
    {nameAr:'نكورو',nameEn:'Nakuru',type:'city',lat:-0.3031,lng:36.08},
    {nameAr:'مالندي',nameEn:'Malindi',type:'city',lat:-3.2138,lng:40.1169},
    {nameAr:'غاريسا',nameEn:'Garissa',type:'city',lat:-0.4532,lng:39.6461},
    {nameAr:'موندي',nameEn:'Mwingi',type:'city',lat:-0.9347,lng:38.0618},
  ],
  // ── جنوب أفريقيا ──
  za: [
    {nameAr:'جوهانسبرغ',nameEn:'Johannesburg',type:'city',lat:-26.2041,lng:28.0473},
    {nameAr:'كيب تاون',nameEn:'Cape Town',type:'city',lat:-33.9249,lng:18.4241},
    {nameAr:'دربان',nameEn:'Durban',type:'city',lat:-29.8587,lng:31.0218},
    {nameAr:'بريتوريا',nameEn:'Pretoria',type:'city',lat:-25.7479,lng:28.2293},
    {nameAr:'بورت إليزابيث',nameEn:'Port Elizabeth',type:'city',lat:-33.9608,lng:25.6022},
    {nameAr:'بلومفونتين',nameEn:'Bloemfontein',type:'city',lat:-29.0852,lng:26.1596},
    {nameAr:'إيست لندن',nameEn:'East London',type:'city',lat:-33.0153,lng:27.9116},
  ],
  // ── أوزبكستان ──
  uz: [
    {nameAr:'طاشقند',nameEn:'Tashkent',type:'city',lat:41.2995,lng:69.2401},
    {nameAr:'سمرقند',nameEn:'Samarkand',type:'city',lat:39.6547,lng:66.9758},
    {nameAr:'نمنغان',nameEn:'Namangan',type:'city',lat:40.9983,lng:71.6726},
    {nameAr:'أنديجان',nameEn:'Andijan',type:'city',lat:40.7829,lng:72.3442},
    {nameAr:'بخارى',nameEn:'Bukhara',type:'city',lat:39.7747,lng:64.4286},
    {nameAr:'قرشي',nameEn:'Qarshi',type:'city',lat:38.8610,lng:65.7908},
    {nameAr:'فرغانة',nameEn:'Fergana',type:'city',lat:40.3864,lng:71.7864},
  ],
  // ── كازاخستان ──
  kz: [
    {nameAr:'نور سلطان',nameEn:'Astana',type:'city',lat:51.1801,lng:71.446},
    {nameAr:'ألماتي',nameEn:'Almaty',type:'city',lat:43.2551,lng:76.9126},
    {nameAr:'شيمكنت',nameEn:'Shymkent',type:'city',lat:42.3,lng:69.6},
    {nameAr:'راغاندي',nameEn:'Karaganda',type:'city',lat:49.8047,lng:73.0875},
    {nameAr:'أكتوبي',nameEn:'Aktobe',type:'city',lat:50.2839,lng:57.1669},
    {nameAr:'أتيراو',nameEn:'Atyrau',type:'city',lat:47.1167,lng:51.8833},
  ],
  // ── السنغال ──
  sn: [
    {nameAr:'داكار',nameEn:'Dakar',type:'city',lat:14.6937,lng:-17.4441},
    {nameAr:'توبا',nameEn:'Touba',type:'city',lat:14.85,lng:-15.88},
    {nameAr:'ثيس',nameEn:'Thiès',type:'city',lat:14.7833,lng:-16.9167},
    {nameAr:'زيغينشور',nameEn:'Ziguinchor',type:'city',lat:12.5833,lng:-16.2667},
    {nameAr:'كاولاك',nameEn:'Kaolack',type:'city',lat:14.1504,lng:-16.0726},
    {nameAr:'سانت لويس',nameEn:'Saint-Louis',type:'city',lat:16.0179,lng:-16.4896},
  ],
  // ── الصومال ──
  so: [
    {nameAr:'مقديشو',nameEn:'Mogadishu',type:'city',lat:2.0469,lng:45.3182},
    {nameAr:'هرجيسا',nameEn:'Hargeisa',type:'city',lat:9.56,lng:44.065},
    {nameAr:'كيسمايو',nameEn:'Kismayo',type:'city',lat:-0.3582,lng:42.5454},
    {nameAr:'بيدوا',nameEn:'Baidoa',type:'city',lat:3.1069,lng:43.6499},
    {nameAr:'بوساسو',nameEn:'Bosaso',type:'city',lat:11.2833,lng:49.1833},
    {nameAr:'غاروي',nameEn:'Garowe',type:'city',lat:8.4054,lng:48.4845},
  ],
  // ── السويد ──
  se: [
    {nameAr:'ستوكهولم',nameEn:'Stockholm',type:'city',lat:59.3293,lng:18.0686},
    {nameAr:'غوتنبرغ',nameEn:'Gothenburg',type:'city',lat:57.7089,lng:11.9746},
    {nameAr:'مالمو',nameEn:'Malmö',type:'city',lat:55.6049,lng:13.0038},
    {nameAr:'أوبسالا',nameEn:'Uppsala',type:'city',lat:59.8586,lng:17.6389},
    {nameAr:'سودرتاليا',nameEn:'Södertälje',type:'city',lat:59.1955,lng:17.6253},
    {nameAr:'فسترأس',nameEn:'Västerås',type:'city',lat:59.6162,lng:16.5528},
  ],
  // ── النرويج ──
  no: [
    {nameAr:'أوسلو',nameEn:'Oslo',type:'city',lat:59.9139,lng:10.7522},
    {nameAr:'برغن',nameEn:'Bergen',type:'city',lat:60.3913,lng:5.3221},
    {nameAr:'تروندهايم',nameEn:'Trondheim',type:'city',lat:63.4305,lng:10.3951},
    {nameAr:'ستافانغر',nameEn:'Stavanger',type:'city',lat:58.9700,lng:5.7331},
    {nameAr:'تروم سو',nameEn:'Tromsø',type:'city',lat:69.6489,lng:18.9551},
  ],
  // ── الدنمارك ──
  dk: [
    {nameAr:'كوبنهاغن',nameEn:'Copenhagen',type:'city',lat:55.6761,lng:12.5683},
    {nameAr:'أورهوس',nameEn:'Aarhus',type:'city',lat:56.1629,lng:10.2039},
    {nameAr:'أودينسي',nameEn:'Odense',type:'city',lat:55.3959,lng:10.3883},
    {nameAr:'ألبورغ',nameEn:'Aalborg',type:'city',lat:57.0488,lng:9.9217},
    {nameAr:'إسبيرغ',nameEn:'Esbjerg',type:'city',lat:55.4761,lng:8.4594},
  ],
  // ── فنلندا ──
  fi: [
    {nameAr:'هلسنكي',nameEn:'Helsinki',type:'city',lat:60.1699,lng:24.9384},
    {nameAr:'إسبو',nameEn:'Espoo',type:'city',lat:60.2052,lng:24.6522},
    {nameAr:'تامبيري',nameEn:'Tampere',type:'city',lat:61.4978,lng:23.7610},
    {nameAr:'فانتا',nameEn:'Vantaa',type:'city',lat:60.2934,lng:25.0378},
    {nameAr:'أولو',nameEn:'Oulu',type:'city',lat:65.0121,lng:25.4651},
    {nameAr:'تورك',nameEn:'Turku',type:'city',lat:60.4518,lng:22.2666},
  ],
  // ── البرازيل ──
  br: [
    {nameAr:'ساو باولو',nameEn:'São Paulo',type:'city',lat:-23.5505,lng:-46.6333},
    {nameAr:'ريو دي جانيرو',nameEn:'Rio de Janeiro',type:'city',lat:-22.9068,lng:-43.1729},
    {nameAr:'برازيليا',nameEn:'Brasília',type:'city',lat:-15.7801,lng:-47.9292},
    {nameAr:'سلفادور',nameEn:'Salvador',type:'city',lat:-12.9714,lng:-38.5014},
    {nameAr:'فورتاليزا',nameEn:'Fortaleza',type:'city',lat:-3.7172,lng:-38.5433},
    {nameAr:'بيلو هوريزونتي',nameEn:'Belo Horizonte',type:'city',lat:-19.9167,lng:-43.9345},
    {nameAr:'ماناوس',nameEn:'Manaus',type:'city',lat:-3.1019,lng:-60.025},
    {nameAr:'كوريتيبا',nameEn:'Curitiba',type:'city',lat:-25.4284,lng:-49.2733},
    {nameAr:'ريسيفي',nameEn:'Recife',type:'city',lat:-8.0578,lng:-34.8829},
    {nameAr:'بيلم',nameEn:'Belém',type:'city',lat:-1.4558,lng:-48.5044},
  ],
  // ── الأرجنتين ──
  ar: [
    {nameAr:'بوينس آيرس',nameEn:'Buenos Aires',type:'city',lat:-34.6037,lng:-58.3816},
    {nameAr:'قرطبة',nameEn:'Córdoba',type:'city',lat:-31.4135,lng:-64.1811},
    {nameAr:'روساريو',nameEn:'Rosario',type:'city',lat:-32.9442,lng:-60.6505},
    {nameAr:'ميندوزا',nameEn:'Mendoza',type:'city',lat:-32.8895,lng:-68.8458},
    {nameAr:'لا بلاتا',nameEn:'La Plata',type:'city',lat:-34.9211,lng:-57.9544},
    {nameAr:'سان خوان',nameEn:'San Juan',type:'city',lat:-31.5375,lng:-68.5364},
  ],
  // ── المكسيك ──
  mx: [
    {nameAr:'مكسيكو سيتي',nameEn:'Mexico City',type:'city',lat:19.4326,lng:-99.1332},
    {nameAr:'غوادالاخارا',nameEn:'Guadalajara',type:'city',lat:20.6597,lng:-103.3496},
    {nameAr:'مونتيري',nameEn:'Monterrey',type:'city',lat:25.6866,lng:-100.3161},
    {nameAr:'بويبلا',nameEn:'Puebla',type:'city',lat:19.0414,lng:-98.2063},
    {nameAr:'تيخوانا',nameEn:'Tijuana',type:'city',lat:32.5149,lng:-117.0382},
    {nameAr:'ليون',nameEn:'León',type:'city',lat:21.1221,lng:-101.6827},
    {nameAr:'خواريز',nameEn:'Ciudad Juárez',type:'city',lat:31.7381,lng:-106.4869},
  ],
};

// ===== بيانات العواصم الكاملة (اسم عربي + إنجليزي + إحداثيات) =====
const CAPITAL_DATA = {
    sa:{nameAr:'الرياض',       nameEn:'Riyadh',        lat:24.6877,  lng:46.7219},
    sy:{nameAr:'دمشق',         nameEn:'Damascus',      lat:33.5102,  lng:36.2913},
    eg:{nameAr:'القاهرة',      nameEn:'Cairo',         lat:30.0444,  lng:31.2357},
    iq:{nameAr:'بغداد',        nameEn:'Baghdad',       lat:33.3152,  lng:44.3661},
    jo:{nameAr:'عمّان',        nameEn:'Amman',         lat:31.9539,  lng:35.9106},
    lb:{nameAr:'بيروت',        nameEn:'Beirut',        lat:33.8869,  lng:35.5131},
    ps:{nameAr:'القدس',        nameEn:'Jerusalem',     lat:31.7683,  lng:35.2137},
    kw:{nameAr:'الكويت',       nameEn:'Kuwait City',   lat:29.3697,  lng:47.9783},
    ae:{nameAr:'أبوظبي',       nameEn:'Abu Dhabi',     lat:24.4539,  lng:54.3773},
    qa:{nameAr:'الدوحة',       nameEn:'Doha',          lat:25.2854,  lng:51.531},
    bh:{nameAr:'المنامة',      nameEn:'Manama',        lat:26.215,   lng:50.5832},
    om:{nameAr:'مسقط',         nameEn:'Muscat',        lat:23.5957,  lng:58.5933},
    ye:{nameAr:'صنعاء',        nameEn:'Sanaa',         lat:15.3694,  lng:44.191},
    ly:{nameAr:'طرابلس',       nameEn:'Tripoli',       lat:32.8872,  lng:13.1913},
    tn:{nameAr:'تونس',         nameEn:'Tunis',         lat:36.8065,  lng:10.1815},
    dz:{nameAr:'الجزائر العاصمة',nameEn:'Algiers',    lat:36.7372,  lng:3.0865},
    ma:{nameAr:'الرباط',       nameEn:'Rabat',         lat:34.0209,  lng:-6.8417},
    sd:{nameAr:'الخرطوم',      nameEn:'Khartoum',      lat:15.5007,  lng:32.5599},
    pk:{nameAr:'إسلام آباد',   nameEn:'Islamabad',     lat:33.6844,  lng:73.0479},
    tr:{nameAr:'أنقرة',        nameEn:'Ankara',        lat:39.9334,  lng:32.8597},
    ir:{nameAr:'طهران',        nameEn:'Tehran',        lat:35.6892,  lng:51.389},
    id:{nameAr:'جاكرتا',       nameEn:'Jakarta',       lat:-6.2088,  lng:106.8456},
    my:{nameAr:'كوالالمبور',   nameEn:'Kuala Lumpur',  lat:3.1478,   lng:101.6953},
    bd:{nameAr:'دكا',          nameEn:'Dhaka',         lat:23.7104,  lng:90.4074},
    af:{nameAr:'كابول',        nameEn:'Kabul',         lat:34.5553,  lng:69.2075},
    in:{nameAr:'نيودلهي',      nameEn:'New Delhi',     lat:28.6139,  lng:77.209},
    lk:{nameAr:'كولومبو',      nameEn:'Colombo',       lat:6.9271,   lng:79.8612},
    np:{nameAr:'كاتماندو',     nameEn:'Kathmandu',     lat:27.7172,  lng:85.3240},
    cn:{nameAr:'بكين',         nameEn:'Beijing',       lat:39.9042,  lng:116.4074},
    jp:{nameAr:'طوكيو',        nameEn:'Tokyo',         lat:35.6762,  lng:139.6503},
    kr:{nameAr:'سيول',         nameEn:'Seoul',         lat:37.5665,  lng:126.978},
    mn:{nameAr:'أولان باتور',  nameEn:'Ulaanbaatar',   lat:47.8864,  lng:106.9057},
    fr:{nameAr:'باريس',        nameEn:'Paris',         lat:48.8566,  lng:2.3522},
    de:{nameAr:'برلين',        nameEn:'Berlin',        lat:52.52,    lng:13.405},
    gb:{nameAr:'لندن',         nameEn:'London',        lat:51.5074,  lng:-0.1278},
    es:{nameAr:'مدريد',        nameEn:'Madrid',        lat:40.4168,  lng:-3.7038},
    it:{nameAr:'روما',         nameEn:'Rome',          lat:41.9028,  lng:12.4964},
    nl:{nameAr:'أمستردام',     nameEn:'Amsterdam',     lat:52.3676,  lng:4.9041},
    be:{nameAr:'بروكسل',       nameEn:'Brussels',      lat:50.8503,  lng:4.3517},
    pt:{nameAr:'لشبونة',       nameEn:'Lisbon',        lat:38.7223,  lng:-9.1393},
    se:{nameAr:'ستوكهولم',     nameEn:'Stockholm',     lat:59.3293,  lng:18.0686},
    no:{nameAr:'أوسلو',        nameEn:'Oslo',          lat:59.9139,  lng:10.7522},
    dk:{nameAr:'كوبنهاغن',     nameEn:'Copenhagen',    lat:55.6761,  lng:12.5683},
    fi:{nameAr:'هلسنكي',       nameEn:'Helsinki',      lat:60.1699,  lng:24.9384},
    pl:{nameAr:'وارسو',        nameEn:'Warsaw',        lat:52.2297,  lng:21.0122},
    ru:{nameAr:'موسكو',        nameEn:'Moscow',        lat:55.7558,  lng:37.6173},
    ua:{nameAr:'كييف',         nameEn:'Kyiv',          lat:50.4501,  lng:30.5234},
    ch:{nameAr:'برن',          nameEn:'Bern',          lat:46.9481,  lng:7.4474},
    at:{nameAr:'فيينا',        nameEn:'Vienna',        lat:48.2082,  lng:16.3738},
    gr:{nameAr:'أثينا',        nameEn:'Athens',        lat:37.9838,  lng:23.7275},
    cz:{nameAr:'براغ',         nameEn:'Prague',        lat:50.0755,  lng:14.4378},
    ro:{nameAr:'بوخارست',      nameEn:'Bucharest',     lat:44.4268,  lng:26.1025},
    us:{nameAr:'واشنطن',       nameEn:'Washington',    lat:38.9072,  lng:-77.0369},
    ca:{nameAr:'أوتاوا',       nameEn:'Ottawa',        lat:45.4215,  lng:-75.6972},
    mx:{nameAr:'مكسيكو سيتي',  nameEn:'Mexico City',   lat:19.4326,  lng:-99.1332},
    br:{nameAr:'برازيليا',     nameEn:'Brasilia',      lat:-15.7939, lng:-47.8828},
    ar:{nameAr:'بوينس آيرس',   nameEn:'Buenos Aires',  lat:-34.6037, lng:-58.3816},
    co:{nameAr:'بوغوتا',       nameEn:'Bogota',        lat:4.711,    lng:-74.0721},
    pe:{nameAr:'ليما',         nameEn:'Lima',          lat:-12.0464, lng:-77.0428},
    ve:{nameAr:'كاراكاس',      nameEn:'Caracas',       lat:10.4806,  lng:-66.9036},
    cl:{nameAr:'سانتياغو',     nameEn:'Santiago',      lat:-33.4489, lng:-70.6693},
    ec:{nameAr:'كيتو',         nameEn:'Quito',         lat:-0.1807,  lng:-78.4678},
    bo:{nameAr:'سوكري',        nameEn:'Sucre',         lat:-19.0196, lng:-65.2619},
    py:{nameAr:'أسونسيون',     nameEn:'Asuncion',      lat:-25.2867, lng:-57.647},
    uy:{nameAr:'مونتيفيديو',   nameEn:'Montevideo',    lat:-34.9011, lng:-56.1645},
    ng:{nameAr:'أبوجا',        nameEn:'Abuja',         lat:9.0765,   lng:7.3986},
    et:{nameAr:'أديس أبابا',   nameEn:'Addis Ababa',   lat:9.005,    lng:38.7636},
    ke:{nameAr:'نيروبي',       nameEn:'Nairobi',       lat:-1.2921,  lng:36.8219},
    tz:{nameAr:'دودوما',       nameEn:'Dodoma',        lat:-6.1731,  lng:35.7395},
    za:{nameAr:'بريتوريا',     nameEn:'Pretoria',      lat:-25.7461, lng:28.1881},
    gh:{nameAr:'أكرا',         nameEn:'Accra',         lat:5.6037,   lng:-0.187},
    sn:{nameAr:'داكار',        nameEn:'Dakar',         lat:14.6928,  lng:-17.4467},
    cm:{nameAr:'ياوندي',       nameEn:'Yaounde',       lat:3.848,    lng:11.5021},
    ml:{nameAr:'باماكو',       nameEn:'Bamako',        lat:12.6392,  lng:-8.0029},
    so:{nameAr:'مقديشو',       nameEn:'Mogadishu',     lat:2.0469,   lng:45.3182},
    ug:{nameAr:'كمبالا',       nameEn:'Kampala',       lat:0.3476,   lng:32.5825},
    mr:{nameAr:'نواكشوط',      nameEn:'Nouakchott',    lat:18.0735,  lng:-15.9582},
    td:{nameAr:'نجامينا',      nameEn:'N\'Djamena',    lat:12.1048,  lng:15.044},
    ne:{nameAr:'نيامي',        nameEn:'Niamey',        lat:13.5137,  lng:2.1098},
    au:{nameAr:'كانبيرا',      nameEn:'Canberra',      lat:-35.2809, lng:149.13},
    nz:{nameAr:'ويلينغتون',    nameEn:'Wellington',    lat:-41.2865, lng:174.7762},
    // Round 7k — 40 عاصمة جديدة
    ba:{nameAr:'سراييفو',      nameEn:'Sarajevo',      lat:43.8563,  lng:18.4131},
    al:{nameAr:'تيرانا',       nameEn:'Tirana',        lat:41.3275,  lng:19.8187},
    mk:{nameAr:'سكوبيه',       nameEn:'Skopje',        lat:41.9981,  lng:21.4254},
    bf:{nameAr:'واغادوغو',     nameEn:'Ouagadougou',   lat:12.3714,  lng:-1.5197},
    ci:{nameAr:'ياموسوكرو',    nameEn:'Yamoussoukro',  lat:6.8276,   lng:-5.2893},
    gn:{nameAr:'كوناكري',      nameEn:'Conakry',       lat:9.6412,   lng:-13.5784},
    gm:{nameAr:'بانجول',       nameEn:'Banjul',        lat:13.4549,  lng:-16.5790},
    sl:{nameAr:'فريتاون',      nameEn:'Freetown',      lat:8.4840,   lng:-13.2299},
    mv:{nameAr:'ماليه',        nameEn:'Malé',          lat:4.1755,   lng:73.5093},
    er:{nameAr:'أسمرة',        nameEn:'Asmara',        lat:15.3229,  lng:38.9251},
    ss:{nameAr:'جوبا',         nameEn:'Juba',          lat:4.8594,   lng:31.5713},
    tg:{nameAr:'لومي',         nameEn:'Lomé',          lat:6.1319,   lng:1.2228},
    bj:{nameAr:'بورتو نوفو',   nameEn:'Porto-Novo',    lat:6.4969,   lng:2.6289},
    ie:{nameAr:'دبلن',         nameEn:'Dublin',        lat:53.3498,  lng:-6.2603},
    hu:{nameAr:'بودابست',      nameEn:'Budapest',      lat:47.4979,  lng:19.0402},
    hr:{nameAr:'زغرب',         nameEn:'Zagreb',        lat:45.8150,  lng:15.9819},
    rs:{nameAr:'بلغراد',       nameEn:'Belgrade',      lat:44.7866,  lng:20.4489},
    bg:{nameAr:'صوفيا',        nameEn:'Sofia',         lat:42.6977,  lng:23.3219},
    si:{nameAr:'ليوبليانا',    nameEn:'Ljubljana',     lat:46.0569,  lng:14.5058},
    sk:{nameAr:'براتيسلافا',   nameEn:'Bratislava',    lat:48.1486,  lng:17.1077},
    mg:{nameAr:'أنتاناناريفو', nameEn:'Antananarivo',  lat:-18.8792, lng:47.5079},
    mz:{nameAr:'مابوتو',       nameEn:'Maputo',        lat:-25.9653, lng:32.5892},
    ao:{nameAr:'لواندا',       nameEn:'Luanda',        lat:-8.8390,  lng:13.2894},
    cd:{nameAr:'كينشاسا',      nameEn:'Kinshasa',      lat:-4.4419,  lng:15.2663},
    rw:{nameAr:'كيغالي',       nameEn:'Kigali',        lat:-1.9441,  lng:30.0619},
    zw:{nameAr:'هراري',        nameEn:'Harare',        lat:-17.8252, lng:31.0335},
    zm:{nameAr:'لوساكا',       nameEn:'Lusaka',        lat:-15.3875, lng:28.3228},
    mu:{nameAr:'بورت لويس',    nameEn:'Port Louis',    lat:-20.1609, lng:57.5012},
    lr:{nameAr:'مونروفيا',     nameEn:'Monrovia',      lat:6.3004,   lng:-10.7969},
    mw:{nameAr:'ليلونغوي',     nameEn:'Lilongwe',      lat:-13.9626, lng:33.7741},
    sr:{nameAr:'باراماريبو',   nameEn:'Paramaribo',    lat:5.8520,   lng:-55.2038},
    gy:{nameAr:'جورج تاون',    nameEn:'Georgetown',    lat:6.8013,   lng:-58.1551},
    tt:{nameAr:'بورت أوف سبين',nameEn:'Port of Spain', lat:10.6596,  lng:-61.5086},
    jm:{nameAr:'كينغستون',     nameEn:'Kingston',      lat:18.0179,  lng:-76.8099},
    pa:{nameAr:'مدينة بنما',   nameEn:'Panama City',   lat:8.9824,   lng:-79.5199},
    ht:{nameAr:'بورت أو برنس', nameEn:'Port-au-Prince',lat:18.5944,  lng:-72.3074},
    cr:{nameAr:'سان خوسيه',    nameEn:'San José',      lat:9.9281,   lng:-84.0907},
    bt:{nameAr:'ثيمفو',        nameEn:'Thimphu',       lat:27.4728,  lng:89.6390},
    fj:{nameAr:'سوفا',         nameEn:'Suva',          lat:-18.1416, lng:178.4419},
    pg:{nameAr:'بورت مورسبي',  nameEn:'Port Moresby',  lat:-9.4438,  lng:147.1803},
};

// ===== إزالة المدن المكررة (بالاسم فقط) =====
function deduplicateCities(cities) {
    const seenNames = new Set();
    const result = [];
    for (const city of cities) {
        const key = (city.nameAr || '').trim();
        if (!key) continue;
        if (seenNames.has(key)) continue;
        seenNames.add(key);
        result.push(city);
    }
    return result;
}

function sortWithCapitalFirst(cities, cc) {
    const cap = CAPITAL_DATA[cc];
    if (!cap) {
        // بدون عاصمة: الأكثر سكاناً أولاً، ثم ترتيب أبجدي
        return cities.sort((a, b) => {
            if (b.pop && a.pop) return b.pop - a.pop;
            if (b.pop) return 1;
            if (a.pop) return -1;
            return a.nameAr.localeCompare(b.nameAr, 'ar');
        });
    }

    const capNameEn = (cap.nameEn || '').toLowerCase();
    const capNameAr = cap.nameAr || '';

    // أزل العاصمة من القائمة إن وُجدت لتجنب التكرار
    const filtered = cities.filter(c => {
        const enMatch = (c.nameEn || '').toLowerCase().includes(capNameEn.split(' ')[0]);
        const arMatch = c.nameAr === capNameAr;
        return !enMatch && !arMatch;
    });

    // رتّب: الأكثر سكاناً أولاً، ثم بدون سكان ترتيباً أبجدياً
    const sorted = filtered.sort((a, b) => {
        if (b.pop && a.pop) return b.pop - a.pop;
        if (b.pop) return 1;
        if (a.pop) return -1;
        return a.nameAr.localeCompare(b.nameAr, 'ar');
    });

    // أضف العاصمة في المقدمة دائماً
    const capitalCity = { nameAr: cap.nameAr, nameEn: cap.nameEn, type: 'city', lat: cap.lat, lng: cap.lng };
    return [capitalCity, ...sorted];
}

// ===== Wikidata fallback  =====
const COUNTRY_QID = {
    // الشرق الأوسط وشمال أفريقيا
    sa:'Q851',  sy:'Q858',  eg:'Q79',   iq:'Q796',  jo:'Q810',
    lb:'Q822',  ps:'Q219060', kw:'Q817', ae:'Q878', qa:'Q846',
    bh:'Q398',  om:'Q842',  ye:'Q805',  ly:'Q1016', tn:'Q948',
    dz:'Q262',  ma:'Q1028', sd:'Q1049',
    // جنوب وجنوب شرق آسيا
    pk:'Q843',  tr:'Q43',   ir:'Q794',  id:'Q252',  my:'Q833',
    bd:'Q902',  af:'Q889',  in:'Q668',  lk:'Q854',  np:'Q837',
    th:'Q869',  ph:'Q928',  vn:'Q881',  mm:'Q836',  kh:'Q424',
    la:'Q819',  sg:'Q334',  bn:'Q921',  tl:'Q574',  uz:'Q265',
    kz:'Q232',  kg:'Q813',  tj:'Q863',  tm:'Q874',  az:'Q227',
    ge:'Q230',  am:'Q399',
    // شرق آسيا
    cn:'Q148',  jp:'Q17',   kr:'Q884',  kp:'Q423',  mn:'Q711',
    // أوروبا
    fr:'Q142',  de:'Q183',  gb:'Q145',  es:'Q29',   it:'Q38',
    nl:'Q55',   be:'Q31',   pt:'Q45',   se:'Q34',   no:'Q20',
    dk:'Q35',   fi:'Q33',   pl:'Q36',   ru:'Q159',  ua:'Q212',
    ch:'Q39',   at:'Q40',   gr:'Q41',   cz:'Q213',  ro:'Q218',
    // أمريكا الشمالية
    us:'Q30',   ca:'Q16',   mx:'Q96',
    // أمريكا الوسطى والكاريبي
    gt:'Q774',  hn:'Q783',  sv:'Q792',  ni:'Q811',  cr:'Q800',
    pa:'Q804',  cu:'Q241',  do:'Q786',
    // أمريكا الجنوبية
    br:'Q155',  ar:'Q414',  co:'Q739',  pe:'Q419',  ve:'Q717',
    cl:'Q298',  ec:'Q736',  bo:'Q750',  py:'Q733',  uy:'Q77',
    // أفريقيا جنوب الصحراء
    ng:'Q1033', et:'Q115',  ke:'Q114',  tz:'Q924',  za:'Q258',
    gh:'Q117',  sn:'Q1041', ci:'Q1008', cm:'Q1009', ml:'Q912',
    mr:'Q1025', td:'Q657',  ne:'Q1032', so:'Q1045', ug:'Q1036',
    // أوقيانوسيا
    au:'Q408',  nz:'Q664',  pg:'Q691',  fj:'Q712',
};

function wikidataFetch(sparql) {
    if (!circuitAllow('wikidata')) {
        return Promise.reject(new Error('circuit_open:wikidata'));
    }
    return new Promise((resolve, reject) => {
        const encoded = encodeURIComponent(sparql);
        const req = https.request({
            hostname: 'query.wikidata.org',
            path: `/sparql?query=${encoded}&format=json`,
            method: 'GET',
            headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': 'PrayerTimesApp/1.0' },
            timeout: 25000,
        }, res => {
            if (res.statusCode !== 200) { res.resume(); circuitFail('wikidata'); return reject(new Error(`HTTP ${res.statusCode}`)); }
            let data = '';
            res.setEncoding('utf8');
            res.on('data', c => data += c);
            res.on('end', () => { try { circuitSuccess('wikidata'); resolve(JSON.parse(data)); } catch(e) { circuitFail('wikidata'); reject(e); } });
        });
        req.on('error', (e) => { circuitFail('wikidata'); reject(e); });
        req.on('timeout', () => { req.destroy(); circuitFail('wikidata'); reject(new Error('timeout')); });
        req.end();
    });
}

async function fetchCitiesWikidata(cc) {
    const qid = COUNTRY_QID[cc];
    // إذا لم يكن QID موجوداً نستعلم بكود ISO مباشرةً (يعمل مع أي دولة)
    const countryFilter = qid
        ? `?item wdt:P17 wd:${qid};`
        : `?country wdt:P297 "${cc.toUpperCase()}". ?item wdt:P17 ?country;`;
    // نجلب السكان (P1082) لترتيب المدن الكبرى أولاً
    const sparql = `SELECT ?nameAr ?nameEn ?lat ?lng (MAX(?popVal) AS ?pop) WHERE {
  VALUES ?type { wd:Q515 wd:Q3957 wd:Q532 wd:Q1549591 }
  ${countryFilter} wdt:P31 ?type;
        p:P625/psv:P625 [ wikibase:geoLatitude ?lat; wikibase:geoLongitude ?lng ].
  OPTIONAL { ?item rdfs:label ?nameAr FILTER(LANG(?nameAr)="ar") }
  OPTIONAL { ?item rdfs:label ?nameEn FILTER(LANG(?nameEn)="en") }
  OPTIONAL { ?item wdt:P1082 ?popVal }
  FILTER(BOUND(?nameAr) || BOUND(?nameEn))
} GROUP BY ?nameAr ?nameEn ?lat ?lng
LIMIT 2000`;
    try {
        const r = await wikidataFetch(sparql);
        const seen = new Set();
        const cities = (r?.results?.bindings || [])
            .map(b => ({
                nameAr: b.nameAr?.value || b.nameEn?.value || '',
                nameEn: b.nameEn?.value || '',
                type: 'city',
                lat: parseFloat(b.lat?.value),
                lng: parseFloat(b.lng?.value),
                pop: b.pop?.value ? parseInt(b.pop.value) : null,
            }))
            .filter(c => c.nameAr && !isNaN(c.lat) && !seen.has(c.nameAr) && seen.add(c.nameAr));
        return sortWithCapitalFirst(cities, cc);
    } catch(e) { console.log(`[Wikidata] ${e.message}`); return null; }
}

// ===== قاعدة البيانات الدائمة =====
function dbFile(cc) {
    return path.join(DB_DIR, `cities-${cc}.json`);
}

// كاش مدن في الذاكرة — أول قراءة تقرأ من القرص، الباقي من الذاكرة
// الكتابات تتم عبر dbWrite الذي يحدّث الكاش، فلا يتقادم المحتوى في الاستخدام العادي
const _dbMemCache = new Map();

function dbRead(cc) {
    const cached = _dbMemCache.get(cc);
    if (cached !== undefined) return cached;
    try {
        const raw = fs.readFileSync(dbFile(cc), 'utf8');
        const data = JSON.parse(raw);
        _dbMemCache.set(cc, data);
        return data;
    } catch(e) {
        _dbMemCache.set(cc, null);
        return null;
    }
}

function dbWrite(cc, cities) {
    try {
        fs.writeFileSync(dbFile(cc), JSON.stringify(cities, null, 2), 'utf8');
        _dbMemCache.set(cc, cities);
        invalidateSitemapCache();
        return true;
    } catch(e) { console.error(`[DB] خطأ في الكتابة ${cc}:`, e.message); return false; }
}

// دمج مدن جديدة في قاعدة البيانات بدون حذف القديمة
function dbMerge(cc, newCities) {
    const existing = dbRead(cc) || [];
    const merged = deduplicateCities([...existing, ...newCities]);
    const added  = merged.length - existing.length;
    dbWrite(cc, merged);
    return { total: merged.length, added };
}

// ===== معالج GET /api/cities =====
async function handleCitiesApi(cc, res) {
    if (!/^[a-z]{2,3}$/.test(cc)) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'invalid cc'})); return;
    }

    // 1) قاعدة البيانات الدائمة — المصدر الأول دائماً
    const stored = dbRead(cc);
    if (stored && stored.length > 0) {
        const result = sortWithCapitalFirst(deduplicateCities(stored), cc);
        res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'db'});
        res.end(JSON.stringify(result));

        // في الخلفية: إذا البيانات الثابتة أكبر، ادمجها في DB
        const staticData = STATIC_CITIES[cc];
        if (staticData && staticData.length > stored.length) {
            setImmediate(() => {
                const r = dbMerge(cc, staticData);
                if (r.added > 0) console.log(`[DB] ${cc.toUpperCase()} → أُضيف ${r.added} من البيانات الثابتة`);
            });
        }
        return;
    }

    // 2) لا توجد في DB → ابدأ بالبيانات الثابتة فوراً وأحضر Wikidata في الخلفية
    const staticData = STATIC_CITIES[cc];
    if (staticData && staticData.length > 0) {
        const initial = sortWithCapitalFirst(deduplicateCities([...staticData]), cc);
        res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'static'});
        res.end(JSON.stringify(initial));
        console.log(`[DB] ${cc.toUpperCase()} → ${initial.length} مدينة من البيانات الثابتة (أول مرة)`);

        // احفظ في DB وحدّث من Wikidata
        dbWrite(cc, initial);
        fetchCitiesWikidata(cc).then(wiki => {
            if (wiki && wiki.length > 0) {
                const r = dbMerge(cc, wiki);
                console.log(`[DB] ${cc.toUpperCase()} → حُدّث من Wikidata: ${r.total} مدينة (+${r.added})`);
            }
        }).catch(() => {});
        return;
    }

    // 3) لا بيانات ثابتة → جلب من Wikidata مباشرة
    console.log(`[DB] ${cc.toUpperCase()} → جلب من Wikidata...`);
    const wiki = await fetchCitiesWikidata(cc);
    if (!wiki || wiki.length === 0) {
        // 4) Wikidata فشلت → fallback: العاصمة فقط (من CAPITAL_DATA) لضمان عدم فراغ الصفحة
        const capital = CAPITAL_DATA[cc];
        if (capital) {
            const fallback = [{ ...capital, type: 'city' }];
            console.log(`[DB] ${cc.toUpperCase()} → Wikidata فشلت، عرض العاصمة كـ fallback`);
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'capital-fallback'});
            res.end(JSON.stringify(fallback));
            // جرّب Wikidata مرة أخرى في الخلفية بعد 30 ثانية
            setTimeout(() => {
                fetchCitiesWikidata(cc).then(w => {
                    if (w && w.length > 0) {
                        dbWrite(cc, deduplicateCities(w));
                        console.log(`[DB] ${cc.toUpperCase()} → حُدّث من Wikidata (محاولة ثانية): ${w.length} مدينة`);
                    }
                }).catch(() => {});
            }, 30000);
        } else {
            res.writeHead(503, {'Content-Type':'application/json'});
            res.end(JSON.stringify({error:'unavailable'}));
        }
        return;
    }
    const result = deduplicateCities(wiki);
    dbWrite(cc, result);
    console.log(`[DB] ${cc.toUpperCase()} → ${result.length} مدينة من Wikidata وحُفظت في DB`);
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'wikidata'});
    res.end(JSON.stringify(sortWithCapitalFirst(result, cc)));
}

// ===== معالج POST /api/cities/add — إضافة مدن جديدة من العميل =====
async function handleCitiesAdd(cc, body, res) {
    if (!/^[a-z]{2,3}$/.test(cc)) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'invalid cc'})); return;
    }
    let newCities;
    try { newCities = JSON.parse(body); } catch(e) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'invalid json'})); return;
    }
    if (!Array.isArray(newCities) || newCities.length === 0) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'empty array'})); return;
    }
    const r = dbMerge(cc, newCities);
    console.log(`[DB] ${cc.toUpperCase()} → أُضيف ${r.added} مدينة جديدة (الإجمالي: ${r.total})`);
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
    res.end(JSON.stringify({ ok: true, added: r.added, total: r.total }));
}

// ===== HTTP Server =====
const server = http.createServer(async (req, res) => {
    // Security Headers — تُطبَّق على كل استجابة
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // R36: explicitly grant motion sensors so the qibla compass keeps working
    //   on Chrome/Android. Without explicit listing, the strict policy can suppress
    //   `deviceorientation` / `deviceorientationabsolute` even on first-party origin.
    res.setHeader('Permissions-Policy',
        'geolocation=(self), accelerometer=(self), gyroscope=(self), magnetometer=(self), '
        + 'camera=(), microphone=(), payment=()');
    // HSTS: 2 سنوات + includeSubDomains + preload (يحلّ "No HSTS" warning في Seobility/SEOptimer)
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    // CSP — يحمي من XSS ويرفع Security grade. القائمة تطابق المصادر الخارجية المستخدمة فعلياً.
    // ملاحظة: 'unsafe-inline' ضروري للـ inline scripts الموجودة في index.html وللـ inline SSR CSS.
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https://flagcdn.com https://*.tile.openstreetmap.org",
        "connect-src 'self' https://api.open-meteo.com https://nominatim.openstreetmap.org https://api.mymemory.translated.net https://overpass-api.de https://restcountries.com https://ar.wikipedia.org https://en.wikipedia.org",
        "media-src 'self' https://cdn.islamic.network",
        "manifest-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
    ].join('; '));
    res.setHeader('X-XSS-Protection', '0'); // modern browsers ignore — CSP أفضل

    // 301 redirect: www.* → * (يُصلح duplicate content warning في SEO audits)
    // ملاحظة: Render (*.onrender.com) ليس فيه www variant فالميدلوير خامل عملياً،
    // لكنه ضروري لحظة ربط custom domain لاحقاً ويزيل warning من أدوات الفحص.
    const _hostHdr = (req.headers.host || '').toLowerCase();
    if (_hostHdr.startsWith('www.')) {
        const _target = 'https://' + _hostHdr.slice(4) + req.url;
        res.writeHead(301, { 'Location': _target, 'Cache-Control': 'public, max-age=31536000' });
        res.end();
        return;
    }

    let urlPath = req.url.split('?')[0];
    const qs    = req.url.includes('?') ? req.url.split('?')[1] : '';

    // ───── UAT-Moon-Hub-Month: 301 redirect for legacy ?cal=YYYY-MM ─────
    //   The previous task used `?cal=YYYY-MM` (and `?cal-y=Y&cal-m=M` no-JS form
    //   submission) on /moon-in-{slug} hub URLs. With path-based month pages now
    //   live, redirect any inbound legacy URL to the canonical
    //   /moon-in-{slug}/YYYY-MM path so external bookmarks / share links keep
    //   working and we don't accumulate duplicate-content debt.
    if (qs && /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-in-[a-z][a-z0-9.-]+(?:-[-.\d]+-[-.\d]+)?$/.test(urlPath)) {
        try {
            const _qp = new URLSearchParams(qs);
            let _calIso = _qp.get('cal') || '';
            if (!_calIso && _qp.get('cal-y') && _qp.get('cal-m')) {
                const _y = _qp.get('cal-y');
                const _m = _qp.get('cal-m');
                if (/^\d{4}$/.test(_y) && /^\d{1,2}$/.test(_m)) {
                    _calIso = `${_y}-${String(_m).padStart(2, '0')}`;
                }
            }
            if (/^\d{4}-\d{2}$/.test(_calIso)) {
                const _parts = _calIso.split('-');
                if (parseInt(_parts[0], 10) >= 1800) {
                    res.writeHead(301, {
                        'Location': `${urlPath}/${_calIso}`,
                        'Cache-Control': 'public, max-age=31536000'
                    });
                    res.end();
                    return;
                }
            }
        } catch (_) { /* malformed query — fall through to normal handling */ }
    }

    // ===== Phase G — Curated 301 redirects (mecca → makkah, etc.) =====
    // يطابق /prayer-times-in-{old}, /qibla-in-{old}, /moon-today-in-{old} مع/بدون لغة prefix
    if (Object.keys(CURATED_REDIRECTS).length > 0) {
        const _redirMatch = urlPath.match(/^(\/(?:en|fr|tr|ur|de|id|es|bn|ms))?\/(prayer-times-in|qibla-in|moon-today-in|moon-in|about|time-left-until-prayer-in|next-prayer-time-in)-([a-z][a-z0-9-]+)$/);
        if (_redirMatch) {
            const _langPart = _redirMatch[1] || '';   // '/en' أو ''
            const _kind = _redirMatch[2];
            const _slug = _redirMatch[3];
            const _newSlug = CURATED_REDIRECTS[_slug];
            if (_newSlug && _newSlug !== _slug) {
                const _newUrl = `${_langPart}/${_kind}-${_newSlug}` + (qs ? `?${qs}` : '');
                res.writeHead(301, {
                    'Location': _newUrl,
                    'Cache-Control': 'public, max-age=31536000',
                });
                res.end();
                return;
            }
        }
    }

    // Rate Limit متدرّج على /api/* فقط
    if (urlPath.startsWith('/api/')) {
        const ip   = getClientIp(req);
        const tier = getTierForPath(urlPath);
        const rl   = checkRateLimit(ip, tier);
        res.setHeader('X-RateLimit-Limit', String(rl.max));
        res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
        res.setHeader('X-RateLimit-Reset', String(rl.reset));
        res.setHeader('X-RateLimit-Tier', tier);
        if (!rl.allowed) {
            res.writeHead(429, {'Content-Type':'application/json; charset=utf-8', 'Retry-After': String(rl.reset)});
            res.end(JSON.stringify({ error: 'rate_limited', tier, retryAfter: rl.reset }));
            return;
        }
    }

    // /health — keep-alive endpoint (used by GitHub Actions cron to prevent Render Free spin-down)
    if (urlPath === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ status: 'ok', ts: Date.now() }));
        return;
    }

    if (urlPath === '/index.html') {
        res.writeHead(301, {'Location': '/' + (qs ? '?'+qs : '')});
        res.end(); return;
    }
    if (urlPath === '/') urlPath = '/index.html';

    // ===== Phase E1-b (2026-05-01): legacy-alias redirects FIRST =====
    //   Order matters: these match `/{path}/?$` (with optional trailing slash)
    //   so they absorb the trailing-slash strip in a single 301 hop. Putting
    //   them BEFORE the generic trailing-slash handler below saves a hop on
    //   `/moon/` → `/moon-today` (was 2 hops via `/moon`) and `/zakat/` →
    //   `/zakat-calculator`. Targets the SEOptimer "Avoid multiple page
    //   redirects" finding (0.63s mobile saving).

    // /moon (+ language prefixes) → /moon-today
    {
        const _oldMoonMatch = urlPath.match(/^\/((?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon\/?$/);
        if (_oldMoonMatch) {
            const _prefix = _oldMoonMatch[1] || '';
            res.writeHead(301, { 'Location': `/${_prefix}moon-today`, 'Cache-Control': 'public, max-age=31536000' });
            res.end();
            return;
        }
    }
    // /zakat (+ language prefixes) → /zakat-calculator
    {
        const _oldZakatMatch = urlPath.match(/^\/((?:en|fr|tr|ur|de|id|es|bn|ms)\/)?zakat\/?$/);
        if (_oldZakatMatch) {
            const _prefix = _oldZakatMatch[1] || '';
            res.writeHead(301, { 'Location': `/${_prefix}zakat-calculator`, 'Cache-Control': 'public, max-age=31536000' });
            res.end();
            return;
        }
    }

    // ===== UAT-SEO-Phase-C3 (2026-04-30): unify trailing-slash policy =====
    //   All non-root paths → no trailing slash. Prevents duplicate-content URLs
    //   like /moon-today AND /moon-today/ both serving 200 with self-canonicals.
    //   One-hop 301. Excluded: '/' itself (root, already handled above), and
    //   any path that ends in a file extension (.png, .css, .js, etc — these
    //   shouldn't have trailing slash anyway, but the guard is defensive).
    if (urlPath.length > 1 && urlPath.endsWith('/') && !/\.[a-z0-9]+\/$/i.test(urlPath)) {
        const _noSlash = urlPath.replace(/\/+$/, '') || '/';
        res.writeHead(301, {
            'Location': _noSlash + (qs ? '?' + qs : ''),
            'Cache-Control': 'public, max-age=31536000'
        });
        res.end();
        return;
    }

    // ===== UAT-SEO-Phase-C3 (2026-04-30): legacy /today-hijri-date → 301 dated =====
    //   Site policy: no user-facing link should ever lead to /today-hijri-date.
    //   Direct visits (bookmarks, old indexed URLs) get a 1-hop 301 to the
    //   canonical dated form: /hijri-date/{HIJRI-YYYY-MM-DD}. Prevents Google
    //   from indexing /today-hijri-date as a separate URL alongside the dated
    //   page (was using only canonical override → server.js:4339 — which works
    //   but creates duplicate URLs in Google's crawl queue). 1-hour cache so
    //   the redirect updates daily as the Hijri date shifts.
    {
        const _legacyHijri = urlPath.match(/^\/((?:en|fr|tr|ur|de|id|es|bn|ms)\/)?today-hijri-date$/);
        if (_legacyHijri) {
            const _prefix = _legacyHijri[1] || '';
            const _h = (typeof _hijriNow === 'function') ? _hijriNow() : null;
            if (_h && _h.year && _h.month && _h.day) {
                const _pad2 = (n) => String(n).padStart(2, '0');
                const _dated = `/${_prefix}hijri-date/${_h.year}-${_pad2(_h.month)}-${_pad2(_h.day)}`;
                res.writeHead(301, {
                    'Location': _dated + (qs ? '?' + qs : ''),
                    'Cache-Control': 'public, max-age=3600'
                });
                res.end();
                return;
            }
            // If _hijriNow fails for any reason, fall through to canonical-only behavior
        }
    }

    // ===== SEO: Redirect روابط الدول القديمة /prayer-times-cities-{slug} → /{slug} (301) =====
    {
        const _legacyCountry = urlPath.match(/^(\/(?:en\/)?)prayer-times-cities-([a-z0-9-]+?)(?:\.html)?$/);
        if (_legacyCountry) {
            res.writeHead(301, { 'Location': _legacyCountry[1] + _legacyCountry[2], 'Cache-Control': 'public, max-age=31536000' });
            res.end(); return;
        }
    }

    // (Phase E1-b: /zakat and /moon legacy aliases moved BEFORE the trailing-
    //  slash strip above to save one redirect hop. See lines ~10490–10520.)

    // ===== Phase D2.1: /about-{city}* → 410 Gone (kept: /about-us only) =====
    // Excludes /about-us and language-prefixed about-us; everything else under
    // /about- is permanently removed (city about pages were thin/duplicate).
    {
        // Phase D2.1 hotfix: include 'ar' so /ar/about-{city} also 410s; /ar/about-us still passes.
        const _aboutPathRe = /^\/(?:(?:ar|en|fr|tr|ur|de|id|es|bn|ms)\/)?about-/;
        const _aboutUsPathRe = /^\/(?:(?:ar|en|fr|tr|ur|de|id|es|bn|ms)\/)?about-us(?:\.html)?\/?$/;
        if (_aboutPathRe.test(urlPath) && !_aboutUsPathRe.test(urlPath)) {
            res.writeHead(410, {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Robots-Tag': 'noindex'
            });
            res.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>410 Gone</title><meta name="robots" content="noindex"></head><body><h1>410 Gone</h1><p>This page has been permanently removed.</p></body></html>');
            return;
        }
    }

    // ===== SEO: Redirect روابط .html الديناميكية → روابط نظيفة (301) =====
    if (urlPath !== '/index.html' && urlPath.endsWith('.html')) {
        const _clean = urlPath.replace(/\.html$/, '');
        if (/^\/(?:en\/)?(?:prayer-times-in-|qibla-in-|msbaha$|today-hijri-date$|dateconverter$|hijri-date\/\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|30)$|hijri-calendar\/\d{4}-(?:0[1-9]|1[0-2])$)/.test(_clean)) {
            res.writeHead(301, { 'Location': _clean, 'Cache-Control': 'public, max-age=31536000' });
            res.end();
            return;
        }
    }

    // ===== robots.txt =====
    if (urlPath === '/robots.txt') {
        // Phase H: حظر الـ query params + /search لتفادي فهرسة روابط غير canonical
        const body = [
            'User-agent: *',
            'Allow: /',
            'Disallow: /api/',
            'Disallow: /search',
            'Disallow: /*?city=',
            'Disallow: /*?lat=',
            'Disallow: /*?lng=',
            'Disallow: /*?q=',
            '',
            `Sitemap: ${SITE_URL}/sitemap.xml`,
            '',
        ].join('\n');
        res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'public, max-age=86400'});
        res.end(body);
        return;
    }

    // ===== ads.txt — Google AdSense Authorized Sellers =====
    if (urlPath === '/ads.txt') {
        fs.readFile(path.join(ROOT, 'ads.txt'), (err, data) => {
            if (err) {
                res.writeHead(404, {'Content-Type':'text/plain'});
                res.end('# ads.txt not configured yet\n');
                return;
            }
            res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'public, max-age=86400'});
            res.end(data);
        });
        return;
    }

    // ===== مساعدات Sitemap =====
    function escapeXml(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
    }

    // إرسال XML مع دعم gzip عند توفر Accept-Encoding
    function sendXml(res, xml, acceptEnc, forceGzip) {
        const headers = {
            'Content-Type':'application/xml; charset=utf-8',
            'Cache-Control':'public, max-age=3600',
            'Vary':'Accept-Encoding'
        };
        const buf = Buffer.from(xml, 'utf8');
        const useGzip = forceGzip || (acceptEnc && acceptEnc.includes('gzip'));
        if (useGzip) {
            zlib.gzip(buf, (err, zbuf) => {
                if (err) { res.writeHead(200, headers); res.end(buf); return; }
                res.writeHead(200, { ...headers, 'Content-Encoding':'gzip' });
                res.end(zbuf);
            });
        } else {
            res.writeHead(200, headers);
            res.end(buf);
        }
    }

    // ===== Sitemap: توليد بيانات المدن (مع cache) =====
    // Phase H: المصدر الوحيد = db/curated-slugs.json (مولَّد من LOCAL_CITIES + LOCAL_PROVINCES).
    //   كلّ slug فيه canonical، لا تكرار، لا coord-only، لا روابط Nominatim.
    //   نُبقي fallback إلى الطريقة القديمة فقط لو لم يُحمَّل الملف (للسلامة في dev).
    function buildSitemapDataFresh() {
        // Primary: curated entries
        if (CURATED_ENTRIES && CURATED_ENTRIES.length > 0) {
            const cities = CURATED_ENTRIES.map(e => e.slug).filter(Boolean);
            const ccSet = new Set(CURATED_ENTRIES.map(e => (e.cc || '').toLowerCase()).filter(Boolean));
            return { countryCodes: [...ccSet], cities: [...new Set(cities)] };
        }
        // Legacy fallback (dev-only): db/cities-*.json
        console.warn('[Sitemap] curated-slugs.json not loaded — falling back to legacy db generator');
        const countryCodes = new Set([
            ...Object.keys(STATIC_CITIES),
            ...Object.keys(CAPITAL_DATA),
        ]);
        try {
            fs.readdirSync(DB_DIR).forEach(f => {
                const m = f.match(/^cities-([a-z]{2,3})\.json$/);
                if (m) countryCodes.add(m[1]);
            });
        } catch(e) {}

        const allCities = [];
        for (const cc of countryCodes) {
            let cities = [];
            const dbData = dbRead(cc);
            if (dbData && dbData.length) cities = dbData;
            else if (STATIC_CITIES[cc]) cities = STATIC_CITIES[cc];
            else if (CAPITAL_DATA[cc]) cities = [CAPITAL_DATA[cc]];
            for (const city of cities) {
                const slug = makeCitySlugSrv(city.nameEn, city.lat, city.lng);
                if (slug) allCities.push(slug);
            }
        }
        return { countryCodes: [...countryCodes], cities: [...new Set(allCities)] };
    }

    function getSitemapData() {
        const now = Date.now();
        if (_sitemapCache.data && (now - _sitemapCache.time) < SITEMAP_TTL) {
            return _sitemapCache.data;
        }
        const data = buildSitemapDataFresh();
        _sitemapCache = { data, time: now };
        return data;
    }

    // مولّد URL متعدد اللغات (10 لغات) مع hreflang
    function bilingualUrl(relPath, prio, cf, today) {
        const langs = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
        const urls = {};
        for (const l of langs) {
            const prefix = (l === 'ar') ? '' : ('/' + l);
            // Final-Cleanup-Patch: avoid trailing-slash duplicates for language
            // home pages. /fr/ etc. 301-redirect to /fr (no slash) — emitting
            // /fr in the sitemap matches canonical and saves a crawl-budget hop.
            // Special case only when relPath === '/' and lang !== 'ar'
            // (AR keeps '/' as the root).
            const fullPath = (relPath === '/' && l !== 'ar') ? prefix : (prefix + relPath);
            urls[l] = escapeXml(SITE_URL + fullPath);
        }
        const links = langs.map(l =>
            `    <xhtml:link rel="alternate" hreflang="${l}" href="${urls[l]}"/>`
        ).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${urls.ar}"/>`;
        const body = (loc) =>
            `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${prio}</priority>\n${links}\n  </url>`;
        return langs.map(l => body(urls[l]));
    }

    const URLSET_OPEN = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
    const URLSET_CLOSE = `</urlset>\n`;

    // ===== /sitemap.xml (أو .xml.gz) = فهرس Sitemaps =====
    {
        const mi = urlPath.match(/^\/sitemap\.xml(\.gz)?$/);
        if (mi) {
            const today = new Date().toISOString().split('T')[0];
            const { cities } = getSitemapData();
            const CHUNK_SIZE = 4000;
            const chunkCount = Math.max(1, Math.ceil(cities.length / CHUNK_SIZE));
            const sitemaps = [];
            sitemaps.push(`  <sitemap>\n    <loc>${SITE_URL}/sitemap-main.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);
            for (let i = 0; i < chunkCount; i++) {
                sitemaps.push(`  <sitemap>\n    <loc>${SITE_URL}/sitemap-cities-${i+1}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);
            }
            const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps.join('\n')}\n</sitemapindex>\n`;
            sendXml(res, xml, req.headers['accept-encoding']||'', !!mi[1]);
            return;
        }
    }

    // ===== /sitemap-main.xml = الصفحات الثابتة + الدول + التقويم الهجري =====
    {
        const mm = urlPath.match(/^\/sitemap-main\.xml(\.gz)?$/);
        if (mm) {
            const today = new Date().toISOString().split('T')[0];
            const entries = [];

            // 1) الصفحات الثابتة (AR + EN مع hreflang)
            const staticPaths = [
                ['/', '1.0', 'daily'],
                ['/qibla', '0.9', 'monthly'],
                ['/moon-today', '0.8', 'daily'],
                ['/zakat-calculator', '0.8', 'monthly'],
                ['/azkar', '0.8', 'monthly'],
                ['/msbaha', '0.7', 'monthly'],
                ['/dateconverter', '0.8', 'monthly'],
                // 🆕 Round 11: /today-hijri-date ليست في sitemap — SEO يعتمد على /hijri-date/YYYY-MM-DD.
                // الصفحة UX dynamic وتحوي canonical → الصفحة الثابتة لليوم.
                ['/prayer-times-worldwide', '0.9', 'weekly'],
                ['/about-us', '0.6', 'monthly'],
                ['/contact', '0.5', 'monthly'],
                ['/privacy', '0.4', 'yearly'],
                ['/terms', '0.4', 'yearly'],
            ];
            for (const [p, pr, cf] of staticPaths) {
                entries.push(...bilingualUrl(p, pr, cf, today));
            }

            // 2) صفحات الدول (نمط موحَّد مع المدن: /prayer-times-in-{slug})
            const { countryCodes } = getSitemapData();
            for (const cc of countryCodes) {
                const slug = makeCountrySlugSrv(cc);
                entries.push(...bilingualUrl('/prayer-times-in-' + slug, '0.8', 'weekly', today));
            }

            // 3) التقويم الهجري — 3 سنوات (سنوي + شهري) 🆕 Round 11: numeric zero-padded URLs
            const _pad2S = n => String(n).padStart(2, '0');
            const gYear = new Date().getFullYear();
            const hYearApprox = Math.round((gYear - 622) * 33 / 32);
            for (const hy of [hYearApprox - 1, hYearApprox, hYearApprox + 1]) {
                entries.push(...bilingualUrl('/hijri-calendar/' + hy, '0.7', 'monthly', today));
                for (let m = 1; m <= 12; m++) {
                    entries.push(...bilingualUrl(`/hijri-calendar/${hy}-${_pad2S(m)}`, '0.6', 'monthly', today));
                }
            }

            // 4) صفحات اليوم الهجري — السنة الحالية فقط (12 شهر × 30 يوم × 2 لغة = ~720)
            for (let m = 1; m <= 12; m++) {
                for (let d = 1; d <= 30; d++) {
                    entries.push(...bilingualUrl(`/hijri-date/${hYearApprox}-${_pad2S(m)}-${_pad2S(d)}`, '0.4', 'yearly', today));
                }
            }

            const xml = `${URLSET_OPEN}\n${entries.join('\n')}\n${URLSET_CLOSE}`;
            sendXml(res, xml, req.headers['accept-encoding']||'', !!mm[1]);
            return;
        }
    }

    // ===== /sitemap-cities-N.xml = chunk المدن (6 URLs × مدينة مع hreflang) =====
    {
        const mc = urlPath.match(/^\/sitemap-cities-(\d+)\.xml(\.gz)?$/);
        if (mc) {
            const idx = parseInt(mc[1], 10) - 1;
            const today = new Date().toISOString().split('T')[0];
            const { cities } = getSitemapData();
            const CHUNK_SIZE = 4000;
            const chunk = cities.slice(idx * CHUNK_SIZE, (idx + 1) * CHUNK_SIZE);
            if (chunk.length === 0) {
                res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not Found'); return;
            }
            const entries = [];
            // Round 9: استخرج الـ base slug (بدون lat/lng) لصفحات القمر المدنيّة
            // مثال 1: /prayer-times-in-london-51.5-0.1 → london
            // مثال 2: /prayer-times-in-mecca → mecca (الـ slug بالفعل نظيف)
            const _moonBase = (fullSlug) => {
                const s = String(fullSlug);
                // إن كان slug نظيف (بدون lat/lng) ومُعرَّف في FAMOUS_CITY_OVERRIDES → استخدمه مباشرة
                if (FAMOUS_CITY_OVERRIDES[s]) return s;
                // وإلا جرّب فصل lat/lng من الآخر
                const m = s.match(/^([a-z][a-z0-9-]+?)-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
                return m ? m[1] : null;
            };
            for (const slug of chunk) {
                entries.push(...bilingualUrl('/prayer-times-in-' + slug, '0.7', 'daily', today));
                entries.push(...bilingualUrl('/qibla-in-' + slug, '0.6', 'monthly', today));
                // 🆕 Polish Round (F): /time-left-until-prayer-in-{slug} — صفحة countdown live
                //     slug نظيف فقط (بدون lat/lng) لأنّ الـ URL الجديد لا يحوي إحداثيّات
                if (!/-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/.test(slug)) {
                    entries.push(...bilingualUrl('/time-left-until-prayer-in-' + slug, '0.5', 'hourly', today));
                    // 🆕 Round 4 (Minimal): /next-prayer-time-in-{slug} — Schedule Awareness page
                    entries.push(...bilingualUrl('/next-prayer-time-in-' + slug, '0.75', 'hourly', today));
                }
                // Round 9: /moon-today-in-{slug-بدون-إحداثيّات} — فقط للمدن الشهيرة
                // (FAMOUS_CITY_OVERRIDES)؛ البقيّة تُحلّ عبر _getCitySlugIndex() بشكل ديناميكيّ
                // لكنّنا لا نُدرجها في sitemap لتفادي إرهاق crawl budget بالمدن الصغيرة.
                const baseSlug = _moonBase(slug);
                if (baseSlug && FAMOUS_CITY_OVERRIDES[baseSlug]) {
                    entries.push(...bilingualUrl('/moon-today-in-' + baseSlug, '0.6', 'weekly', today));
                    // Round 16: hub page /moon-in-{city} — evergreen، canonical للمدينة كـ entity.
                    // أعلى أولويّة (0.7) لأنّها الصفحة الرئيسيّة للمدينة (أعلى من today).
                    entries.push(...bilingualUrl('/moon-in-' + baseSlug, '0.7', 'weekly', today));
                    // Round 15: صفحات تاريخ محدَّد تحت /moon-in- (بدل /moon-today-in-).
                    // 30 يومًا مستقبليّة بخطوة 3 أيّام = 10 URL لكلّ مدينة.
                    // × hreflang×10 = 100 entry/مدينة. للمدن الشهيرة فقط لتوفير crawl budget.
                    const _todayDate = new Date();
                    for (let offset = 0; offset <= 90; offset += 3) {
                        const d = new Date(_todayDate); d.setDate(d.getDate() + offset);
                        const iso = d.toISOString().slice(0, 10);
                        entries.push(...bilingualUrl('/moon-in-' + baseSlug + '/' + iso, '0.4', 'daily', iso));
                    }
                }
            }
            const xml = `${URLSET_OPEN}\n${entries.join('\n')}\n${URLSET_CLOSE}`;
            sendXml(res, xml, req.headers['accept-encoding']||'', !!mc[2]);
            return;
        }
    }


    // ===== مساعد: تعديل HTML للنسخة الإنجليزية وإرساله =====
    function serveEnglishHtml(htmlBuf, res, acceptEnc) {
        let html = htmlBuf.toString('utf8');
        // 1) تغيير lang وdir في <html> لمنع CLS (RTL→LTR shift)
        html = html.replace(/<html([^>]*)\blang="ar"([^>]*)\bdir="rtl"/,
                            '<html$1lang="en"$2dir="ltr"');
        // 2) حقن <base href="/"> قبل أي رابط لكي يحله preload scanner بشكل صحيح
        html = html.replace('<head>', '<head>\n    <base href="/">');
        const buf = Buffer.from(html, 'utf8');
        const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'Vary': 'Accept-Encoding' };
        if (acceptEnc.includes('gzip')) {
            zlib.gzip(buf, (e, zbuf) => {
                if (e) { res.writeHead(200, headers); res.end(buf); return; }
                res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
                res.end(zbuf);
            });
        } else {
            res.writeHead(200, headers);
            res.end(buf);
        }
    }

    const _acceptEnc = req.headers['accept-encoding'] || '';

    // ===== /og-image.svg — dynamic OG image endpoint =====
    if (urlPath === '/og-image.svg') { handleOgImage(qs, res); return; }

    // ===== الصفحة الرئيسية /index.html (remapped من /) — SSR SEO =====
    if (urlPath === '/index.html') {
        readCachedFile(path.join(ROOT, 'index.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            serveHtmlWithSeo(html, '/', res, _acceptEnc, qs);
        });
        return;
    }

    // ===== Phase D3.3-0: 301 /duas → /azkar (legacy alias) =====
    // /duas, /{lang}/duas, /duas.html, /{lang}/duas.html → /azkar (or /{lang}/azkar)
    {
        const _duasMatch = urlPath.match(/^\/(?:(en|fr|tr|ur|de|id|es|bn|ms)\/)?duas(?:\.html)?\/?$/);
        if (_duasMatch) {
            const _l = _duasMatch[1] || '';
            const _newUrl = (_l ? '/' + _l : '') + '/azkar';
            res.writeHead(301, {
                'Location': _newUrl,
                'Cache-Control': 'public, max-age=31536000'
            });
            res.end();
            return;
        }
    }

    // ===== HTML pages served from index.html (SSR SEO injection) =====
    // يدعم: ar (افتراضي بدون prefix)، en، fr، tr، ur
    const _LANG_PREFIX_RE = '(?:en|fr|tr|ur|de|id|es|bn|ms)';
    const _isIndexHtmlRoute =
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?dateconverter$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?today-hijri-date$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?msbaha$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today$/.test(urlPath) ||
        // Round 15: فصل الـ URLs — /moon-today-in-{slug} للـ today، /moon-in-{slug}/{date} للصفحات المؤرَّخة
        // Round 16: /moon-in-{slug} hub page (بلا تاريخ) — صفحة مدينة دائمة
        // UAT-Q5f: include `.` in slug character class to accept loc-XX.X-YY.Y
        //   (coord-only slugs for non-Latin city names: Persian/Arabic/Asian).
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today-in-[a-z][a-z0-9.-]+?(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/.test(urlPath) ||
        // UAT-Moon-Hub-Month: \d{4}-\d{2}(?:-\d{2})? matches both:
        //   /moon-in-{slug}/YYYY-MM     → month page (NEW)
        //   /moon-in-{slug}/YYYY-MM-DD  → day page (existing)
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-in-[a-z][a-z0-9.-]+?(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?(?:\/\d{4}-\d{2}(?:-\d{2})?)?$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?zakat-calculator$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?azkar$/.test(urlPath) ||
        /^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\/?$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar(?:\/\d{4})?$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar\/\d{4}-(?:0[1-9]|1[0-2])$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-date\/\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|30)$/.test(urlPath) ||
        // ملاحظة: /prayer-times-in-* (لكل اللغات) يُخدَم لاحقاً من الـ route الموحَّد
        // عند السطر ~4224 — حيث يُفحَص الـ slug للتمييز بين دولة (prayer-times-cities.html)
        // ومدينة (index.html). لا نُدرجه هنا لئلا نفرض index.html على جميع الحالات.
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla-in-.+(?:\.html)?$/.test(urlPath) ||
        // 🆕 Polish Round (F): /time-left-until-prayer-in-{slug} — صفحة time-left (index.html + SSR overrides)
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?time-left-until-prayer-in-[a-z][a-z0-9-]+$/.test(urlPath);

    if (_isIndexHtmlRoute) {
        // Round 9 + Round 12 + Round 15 + Round 16: فحص slug لصفحات القمر.
        // الهيكل الكامل:
        //   _MTroute → /moon-today-in-{slug}[-{lat}-{lng}]           (today)
        //   _MHroute → /moon-in-{slug}[-{lat}-{lng}]                 (hub — Round 16)
        //   _MDroute → /moon-in-{slug}[-{lat}-{lng}]/{YYYY-MM-DD}    (dated)
        // قواعد موحَّدة:
        //  - إن كانت المدينة في الـ DB وجاءت مع coord-suffix → 301 إلى الرابط القصير (canonical).
        //  - إن لم تكن في الـ DB وجاءت بلا coord-suffix → 404 "city not found".
        //  - إن لم تكن في الـ DB وجاءت مع coord-suffix → مرّر كـ noindex صفحة (العميل عرّف الإحداثيّات).
        // UAT-Q5f: include `.` in slug character class for loc-XX.X-YY.Y
        //   (coord-only slugs for non-Latin city names).
        const _MTroute = urlPath.match(/^\/((?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today-in-([a-z][a-z0-9.-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/);
        const _MHroute = urlPath.match(/^\/((?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-in-([a-z][a-z0-9.-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/);
        const _MDroute = urlPath.match(/^\/((?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-in-([a-z][a-z0-9.-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?\/(\d{4})-(\d{2})-(\d{2})$/);
        // UAT-Moon-Hub-Month: NEW month route /moon-in-{slug}[-{lat}-{lng}]/{YYYY-MM}
        // (year ≥ 1800 to avoid colliding with Hijri-day URLs which have year < 1800)
        const _MMrouteRaw = urlPath.match(/^\/((?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-in-([a-z][a-z0-9.-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?\/(\d{4})-(\d{2})$/);
        const _MMroute = (_MMrouteRaw && parseInt(_MMrouteRaw[5], 10) >= 1800) ? _MMrouteRaw : null;
        // Match priority: today → day → month → hub (most-specific first).
        const _moonCityMatch = _MTroute || _MDroute || _MMroute || _MHroute;
        if (_moonCityMatch) {
            const _moonLangPrefix = _moonCityMatch[1] || '';
            const _moonSlug = _moonCityMatch[2];
            const _moonHasCoord = (_moonCityMatch[3] != null && _moonCityMatch[4] != null);
            // التاريخ موجود فقط في _MDroute في المواضع 5/6/7.
            const _dyRt = (_MDroute && _moonCityMatch[5]) ? _moonCityMatch[5] : null;
            const _dmRt = (_MDroute && _moonCityMatch[6]) ? _moonCityMatch[6] : null;
            const _ddRt = (_MDroute && _moonCityMatch[7]) ? _moonCityMatch[7] : null;
            // UAT-Moon-Hub-Month: month parts (only when _MMroute matched).
            const _myRt = (_MMroute && !_MDroute && _moonCityMatch[5]) ? _moonCityMatch[5] : null;
            const _mmRt = (_MMroute && !_MDroute && _moonCityMatch[6]) ? _moonCityMatch[6] : null;
            // نوع الصفحة: today / hub / month / dated
            const _isMonthRt = !!_MMroute && !_MDroute && !_MTroute;
            const _isHubRt = !!_MHroute && !_MDroute && !_MTroute && !_isMonthRt;
            const _moonInDb = !!_resolveCityForMoon(_moonSlug);
            // UAT-Moon-3: when the slug isn't in DB but the coord-suffix
            // points within ≤2 km of a city we DO know under a different
            // transliteration (e.g. "Yastrebovka" / "Iastrubivka"), 301 to
            // the canonical slug instead of carrying around the alien one.
            let _moonResolvedSlug = _moonSlug;
            if (!_moonInDb && _moonHasCoord) {
                const _clat = parseFloat(_moonCityMatch[3]);
                const _clng = parseFloat(_moonCityMatch[4]);
                const _nearby = (typeof _findNearbyDbSlug === 'function')
                    ? _findNearbyDbSlug(_clat, _clng, 2)
                    : null;
                if (_nearby) _moonResolvedSlug = _nearby;
            }
            const _moonInDbResolved = (_moonResolvedSlug !== _moonSlug)
                || _moonInDb;
            // 1) المدينة في DB + coord-suffix → 301 إلى الشكل القصير (يحترم فصل الـ URLs الجديد)
            //    Also fires when UAT-Moon-3 found a different DB slug for the same coords.
            if (_moonInDbResolved && _moonHasCoord) {
                // today → /moon-today-in-{slug}، hub → /moon-in-{slug}، month → /moon-in-{slug}/{YYYY-MM}، dated → /moon-in-{slug}/{date}
                let _canonicalPath;
                if (_dyRt) {
                    _canonicalPath = '/' + _moonLangPrefix + 'moon-in-' + _moonResolvedSlug + '/' + _dyRt + '-' + _dmRt + '-' + _ddRt;
                } else if (_isMonthRt) {
                    _canonicalPath = '/' + _moonLangPrefix + 'moon-in-' + _moonResolvedSlug + '/' + _myRt + '-' + _mmRt;
                } else if (_isHubRt) {
                    _canonicalPath = '/' + _moonLangPrefix + 'moon-in-' + _moonResolvedSlug;
                } else {
                    _canonicalPath = '/' + _moonLangPrefix + 'moon-today-in-' + _moonResolvedSlug;
                }
                res.writeHead(301, { 'Location': _canonicalPath });
                res.end();
                return;
            }
            // 2) ليست في DB + بلا coord-suffix → مرّر (UAT-Moon-5).
            //    سابقاً (UAT-Moon-4) كنّا نَعمل 301 إلى hub القمر، لكن هذا
            //    يكسر التماثل مع /prayer-times-in-{slug} الذي يَرسم 200 لأيّ
            //    slug. مَرّ من سيارة المدينة (Yastrebovka) → ضغط القمر يجب
            //    أن يأخذ المستخدم إلى /moon-today-in-yastrebovka (ليس hub
            //    عام). الصفحة تُرسَم مع slug-as-title، والعميل يَستعمل
            //    sessionStorage.city_moon لإحداثيّات المستخدم الحقيقيّة
            //    عند عرض الـ rise/set times.
            //
            //    المرور هنا يَتركه يَصل إلى readCachedFile → serveHtmlWithSeo
            //    وتعرض الصفحة 200 (مع noindex لو coord-only — لا ينطبق هنا).
            // 3) إن كان لدينا تاريخ، فحص صحّته التقويميّة → 301 إلى hub بدلاً من 404 (UAT-Moon-4)
            if (_dyRt) {
                const _dy = parseInt(_dyRt, 10);
                const _dm = parseInt(_dmRt, 10);
                const _dd = parseInt(_ddRt, 10);
                let _dateOk = (_dm >= 1 && _dm <= 12 && _dd >= 1 && _dd <= 31);
                if (_dateOk) {
                    const _test = new Date(Date.UTC(_dy, _dm - 1, _dd));
                    _dateOk = (_test.getUTCFullYear() === _dy && _test.getUTCMonth() === (_dm - 1) && _test.getUTCDate() === _dd);
                }
                if (!_dateOk) {
                    // تاريخ غير صالح → 301 إلى صفحة المدينة لليوم بدل 404
                    const _todayPath = '/' + _moonLangPrefix + 'moon-today-in-' + _moonSlug;
                    res.writeHead(301, { 'Location': _todayPath });
                    res.end();
                    return;
                }
            }
            // 3b) UAT-Moon-Hub-Month: validate month — month must be 01-12,
            //    year must be sane (1800-2999). Otherwise 301 to hub.
            if (_isMonthRt) {
                const _my = parseInt(_myRt, 10);
                const _mm = parseInt(_mmRt, 10);
                const _monthOk = (_my >= 1800 && _my <= 2999 && _mm >= 1 && _mm <= 12);
                if (!_monthOk) {
                    const _hubPath = '/' + _moonLangPrefix + 'moon-in-' + _moonSlug;
                    res.writeHead(301, { 'Location': _hubPath });
                    res.end();
                    return;
                }
            }
            // 4) ليست في DB + مع coord-suffix → مرّر (تُرسم كـ noindex من buildSeoFor)
        }
        // ===== UAT-Q5: same proximity-based fuzzy-match for qibla URLs =====
        //   - /qibla-in-{slug}-{lat}-{lng} → 301 to /qibla-in-{slug}
        //     when the slug is in DB (canonical clean form).
        //   - When the slug isn't in DB but the coords land within ≤2 km
        //     of a city we DO have under a different transliteration
        //     (Yastrebovka ↔ Iastrubivka, …), 301 to the DB slug instead.
        //   - Otherwise (slug not in DB, no nearby DB hit) → fall through
        //     so the page renders with the real coords from the URL,
        //     ensuring the qibla angle/distance reflect the user's actual
        //     location instead of falling back to Mecca's coords (= 0°).
        // UAT-Q5f: include `.` in slug character class for loc-XX.X-YY.Y
        const _Qroute = urlPath.match(/^\/((?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla-in-([a-z][a-z0-9.-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/);
        if (_Qroute) {
            const _qLangPrefix = _Qroute[1] || '';
            const _qSlug = _Qroute[2];
            const _qHasCoord = (_Qroute[3] != null && _Qroute[4] != null);
            const _qInDb = !!_resolveCityForMoon(_qSlug);
            let _qResolvedSlug = _qSlug;
            if (!_qInDb && _qHasCoord) {
                const _qLat = parseFloat(_Qroute[3]);
                const _qLng = parseFloat(_Qroute[4]);
                const _qNearby = (typeof _findNearbyDbSlug === 'function')
                    ? _findNearbyDbSlug(_qLat, _qLng, 2)
                    : null;
                if (_qNearby) _qResolvedSlug = _qNearby;
            }
            const _qInDbResolved = (_qResolvedSlug !== _qSlug) || _qInDb;
            if (_qInDbResolved && _qHasCoord) {
                const _qCanonicalPath = '/' + _qLangPrefix + 'qibla-in-' + _qResolvedSlug;
                res.writeHead(301, { 'Location': _qCanonicalPath });
                res.end();
                return;
            }
            // else: fall through to readCachedFile — page renders with the
            // coords from the URL (qibla calc uses real lat/lng from suffix).
        }
        readCachedFile(path.join(ROOT, 'index.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            serveHtmlWithSeo(html, urlPath, res, _acceptEnc, qs);
        });
        return;
    }

    // ===== Round 15+16 + UAT-Moon-4: legacy /moon-today-in-{slug}/{date} =====
    //   The old shape (today + date together) was deprecated: dated pages
    //   moved to /moon-in-{slug}/{date}. Old behaviour was a hard 404 with
    //   a "use this URL instead" hint. UAT-Moon-4 swaps that for a 301 to
    //   the new shape — same intent, no broken-page UX.
    {
        const _legacy = urlPath.match(/^\/((?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today-in-([a-z][a-z0-9-]+)((?:-(?:-?\d+(?:\.\d+)?)-(?:-?\d+(?:\.\d+)?))?)\/(\d{4}-\d{2}-\d{2})$/);
        if (_legacy) {
            const _lp = _legacy[1] || '';
            const _slug = _legacy[2];
            const _coords = _legacy[3] || '';
            const _date = _legacy[4];
            const _newPath = '/' + _lp + 'moon-in-' + _slug + _coords + '/' + _date;
            res.writeHead(301, { 'Location': _newPath, 'Cache-Control': 'public, max-age=31536000' });
            res.end();
            return;
        }
    }

    // ===== Round 11: 404 صريح لأي /hijri-calendar/* أو /hijri-date/* لا يطابق الصيغة الرقميّة =====
    //   - الصيغة القديمة (سابقاً بأسماء شهور نصّيّة)، والصيغ الخاطئة (غير مُصفَّرة أو خارج النطاق)
    //   - الصيغ الخاطئة: /hijri-calendar/1447-1 (غير مُصفَّر)، /hijri-calendar/1447-13 (خارج النطاق)
    //   - المسارات الصالحة مُعالَجة أعلاه عبر _isIndexHtmlRoute. هنا نصيد البقايا فقط.
    {
        const _hijriPathMatch = urlPath.match(/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(hijri-calendar|hijri-date)\/(.+)$/);
        if (_hijriPathMatch) {
            const _kind = _hijriPathMatch[1];
            const _rest = _hijriPathMatch[2];
            // تحقّق صارم: hijri-calendar/YYYY أو YYYY-MM، hijri-date/YYYY-MM-DD
            const _validYearOnly  = _kind === 'hijri-calendar' && /^\d{4}$/.test(_rest);
            const _validMonth     = _kind === 'hijri-calendar' && /^\d{4}-(?:0[1-9]|1[0-2])$/.test(_rest);
            const _validDay       = _kind === 'hijri-date'     && /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|30)$/.test(_rest);
            if (!_validYearOnly && !_validMonth && !_validDay) {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<!doctype html><meta charset="utf-8"><title>404</title><h1>Not found</h1><p>Hijri URLs use numeric zero-padded format: <code>/hijri-calendar/YYYY-MM</code> or <code>/hijri-date/YYYY-MM-DD</code>.</p>');
                return;
            }
        }
    }

    // ===== Legal pages: /privacy, /terms, /contact, /about-us (+ /en/...) =====
    {
        const _legalMatch = urlPath.match(/^\/(?:(en|fr|tr|ur|de|id|es|bn|ms)\/)?(privacy|terms|contact|about-us)$/);
        if (_legalMatch) {
            const urlLang = _legalMatch[1] || 'ar';
            const slug = _legalMatch[2];
            const isEn = (urlLang === 'en');
            // استخدم اللغة من الـ URL مباشرة، ارجع إلى الإنجليزية ثم العربية كاحتياطي
            const pageData = LEGAL_PAGES[slug] || {};
            const content = pageData[urlLang] || pageData.en || pageData.ar || '';
            const isRtl = (urlLang === 'ar' || urlLang === 'ur');
            readCachedFile(path.join(ROOT, 'legal.html'), (err, html) => {
                if (err) { res.writeHead(404); res.end('Not Found'); return; }
                // Inject content placeholder
                let htmlStr = html.toString('utf8').replace('{{LEGAL_CONTENT}}', content);
                // Set lang/dir attributes
                const dir = isRtl ? 'rtl' : 'ltr';
                htmlStr = htmlStr.replace('<html lang="ar" dir="rtl">', `<html lang="${urlLang}" dir="${dir}">`);
                // إعادة كتابة navbar /today-hijri-date → الصفحة المؤرّخة (canonical)
                {
                    const _hL = _hijriNow();
                    const _pL = (n) => String(n).padStart(2, '0');
                    const _langPref = (urlLang === 'ar') ? '' : ('/' + urlLang);
                    const _datedL = `${_langPref}/hijri-date/${_hL.year}-${_pL(_hL.month)}-${_pL(_hL.day)}`;
                    htmlStr = htmlStr.replace(/href="\/today-hijri-date"/g, `href="${_datedL}"`);
                }
                serveHtmlWithSeo(Buffer.from(htmlStr, 'utf8'), urlPath, res, _acceptEnc, qs);
            });
            return;
        }
    }

    // ===== صفحة كل دول العالم: /prayer-times-worldwide + /{lang}/prayer-times-worldwide =====
    // يجب أن تأتي قبل route الـ /{country-slug} لضمان عدم الوقوع في أي نمط عام
    if (/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?prayer-times-worldwide$/.test(urlPath)) {
        serveCountriesPage(urlPath, res, _acceptEnc);
        return;
    }

    // ===== 301 redirect دائم: /countries (+ /{lang}/countries) → /prayer-times-worldwide =====
    // للحفاظ على روابط خارجيّة/bookmarks قديمة دون فقدان SEO
    {
        const _oldCountriesMatch = urlPath.match(/^\/(?:(en|fr|tr|ur|de|id|es|bn|ms)\/)?countries$/);
        if (_oldCountriesMatch) {
            const _lg = _oldCountriesMatch[1] || '';
            const _newUrl = (_lg ? '/' + _lg : '') + '/prayer-times-worldwide';
            res.writeHead(301, { 'Location': _newUrl, 'Cache-Control': 'public, max-age=31536000' });
            res.end();
            return;
        }
    }

    // ===== نمط موحَّد: /prayer-times-in-{slug} يُستخدم لدولة أو مدينة =====
    // AR: /prayer-times-in-saudi-arabia | EN: /en/prayer-times-in-saudi-arabia
    // AR: /prayer-times-in-cairo        | EN: /en/prayer-times-in-cairo
    // الفحص: إذا كان الـ slug يطابق دولة معروفة → cities listing (country page)
    // وإلا → صفحة المدينة (index.html مع SSR للمدينة).
    {
        // نقبل النقاط في الـ slug لتمرير روابط "loc-{lat}.{d}n-{lng}.{d}e" للمدن بأسماء غير لاتينية
        const _ptMatch = urlPath.match(/^\/(?:(en|fr|tr|ur|de|id|es|bn|ms)\/)?prayer-times-in-([a-z][a-z0-9.-]+)$/);
        if (_ptMatch) {
            const slug = _ptMatch[2];
            const countryCheck = _countryFromSlug(slug);
            const isCountry = countryCheck && countryCheck.cc && countryCheck.cc !== '__';
            const htmlFile = isCountry ? 'prayer-times-cities.html' : 'index.html';
            readCachedFile(path.join(ROOT, htmlFile), (err, html) => {
                if (err) { res.writeHead(404); res.end('Not Found'); return; }
                serveHtmlWithSeo(html, urlPath, res, _acceptEnc, qs);
            });
            return;
        }
    }

    // ===== 301 redirect: /{old-country-slug} → /prayer-times-in-{slug} =====
    // defensive: روابط خارجية/bookmarks قديمة — نحوّلها للنمط الجديد بدون فقدان SEO.
    // يُفحَص أن الـ slug يطابق دولة قبل الـ redirect (غير دول → يستكمل للـ routes التالية).
    {
        const _oldCountryMatch = urlPath.match(/^\/(?:(en|fr|tr|ur|de|id|es|bn|ms)\/)?([a-z][a-z0-9-]+)$/);
        const _oldReserved = new Set(['qibla','moon','zakat-calculator','azkar','duas','msbaha',
            'dateconverter','today-hijri-date','privacy','terms','contact','about-us',
            'prayer-times-worldwide','index']);
        if (_oldCountryMatch && !_oldReserved.has(_oldCountryMatch[2])) {
            const _oldCountry = _countryFromSlug(_oldCountryMatch[2]);
            if (_oldCountry && _oldCountry.cc && _oldCountry.cc !== '__') {
                const _oldLang = _oldCountryMatch[1] || '';
                const _newUrl = (_oldLang ? '/' + _oldLang : '') + '/prayer-times-in-' + _oldCountryMatch[2];
                res.writeHead(301, {
                    'Location': _newUrl,
                    'Cache-Control': 'public, max-age=31536000'
                });
                res.end();
                return;
            }
        }
    }

    // ===== Nominatim Proxy (يحل مشكلة CORS + rate limit) =====
    if (urlPath === '/api/geocode' && req.method === 'GET') {
        const typeMatch = qs.match(/(?:^|&)type=([^&]+)/);
        const type = typeMatch ? typeMatch[1] : 'search';
        const cleanQs = qs.replace(/(?:^|&)type=[^&]+/, '').replace(/^&/, '');
        const cacheKey = `${type}?${cleanQs}`;

        // تحقق من الكاش أولاً
        const cached = _geocodeCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < _GEOCACHE_TTL) {
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});
            res.end(cached.data);
            return;
        }

        // Circuit breaker check
        if (!circuitAllow('nominatim')) {
            res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
            res.end('[]'); return;
        }

        // reverse expects OBJECT response; search expects ARRAY. Use the right empty-shape per type
        // so the client can distinguish "no result" from "real city with no city/town field".
        const _emptyShape = (type === 'reverse') ? '{}' : '[]';
        const nominatimUrl = `https://nominatim.openstreetmap.org/${type}?${cleanQs}`;
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 12000); // slow hosts (render.com cold-start) need headroom
            const nomRes = await fetch(nominatimUrl, {
                signal: ctrl.signal,
                headers: { 'User-Agent': 'Mozilla/5.0 PrayerTimesApp/1.0', 'Accept': 'application/json' }
            });
            clearTimeout(timer);
            if (nomRes.status === 429 || nomRes.status >= 500) {
                circuitFail('nominatim');
                res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
                res.end(_emptyShape); return;
            }
            const data = await nomRes.text();
            if (data.trim().startsWith('[') || data.trim().startsWith('{')) {
                _geocodeCache.set(cacheKey, { ts: Date.now(), data });
            }
            circuitSuccess('nominatim');
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=3600'});
            res.end(data.trim().startsWith('[') || data.trim().startsWith('{') ? data : _emptyShape);
        } catch(e) {
            circuitFail('nominatim');
            res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
            res.end(_emptyShape);
        }
        return;
    }

    // ===== UAT-2.8 — Wikipedia API endpoints removed =====
    // /api/wiki-onthisday + /api/wiki-summary used to proxy ar.wikipedia.org
    // for the OTD / "About City" features. Their JS callers were stubbed in
    // js/app.js (steps A–D); we now tombstone the server endpoints with a
    // 410 Gone so any straggler client (cached old bundle, scraper, etc.)
    // fails loud instead of silently fetching Wikipedia in the background.
    if (urlPath === '/api/wiki-onthisday' || urlPath === '/api/wiki-summary') {
        res.writeHead(410, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end('{"removed":true,"reason":"UAT-2.8 — Wikipedia dependency removed"}');
        return;
    }

    if (urlPath === '/api/cities' && req.method === 'GET') {
        const cc = (new URLSearchParams(qs)).get('cc') || '';
        await handleCitiesApi(cc.toLowerCase(), res);
        return;
    }

    if (urlPath === '/api/cities/add' && (req.method === 'POST' || req.method === 'OPTIONS')) {
        // دعم CORS preflight
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
        const cc = (new URLSearchParams(qs)).get('cc') || '';
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => handleCitiesAdd(cc.toLowerCase(), body.trim(), res));
        return;
    }

    // ملاحظة: routes المدن + الدول العربية تُخدَم الآن من الـ route الموحَّد
    // /prayer-times-in-{slug} أعلى في الملفّ (يفرِّق بين دولة ومدينة عبر _countryFromSlug).
    // الـ route الجذري /{slug} تم حذفه لصالح الـ 301 redirect في الأعلى.

    const filePath    = path.join(ROOT, urlPath);
    const ext         = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const compressible = ['.js', '.css', '.html', '.json', '.svg', '.xml'].includes(ext);
    const isVersioned  = req.url.includes('?v=');
    const isServiceWorker = urlPath === '/sw.js';
    // ملفات وسائط ثابتة (أذان، أيقونات...) لا تتغير — 1 سنة
    const isLongLivedAsset = ['.mp3', '.ogg', '.wav', '.ico', '.woff', '.woff2', '.ttf', '.eot'].includes(ext);
    const cacheControl = isServiceWorker
        ? 'no-cache, no-store, must-revalidate'
        : isVersioned || isLongLivedAsset
        ? 'public, max-age=31536000, immutable'
        : ext === '.html' ? 'no-cache' : 'public, max-age=86400';

    // محاولة التقديم من كاش الذاكرة أولاً (للملفات التي حُمّلت عند الإقلاع)
    const _cachedStatic = _staticCache.get(filePath);
    if (_cachedStatic) {
        const _acceptEncStatic = req.headers['accept-encoding'] || '';
        // Brotli أفضل ~15-25% من gzip — نُفضّله عند دعمه
        if (compressible && _acceptEncStatic.includes('br') && _cachedStatic.brotli) {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Encoding': 'br',
                'Content-Length': _cachedStatic.brotli.length,
                'Cache-Control': cacheControl,
                'Vary': 'Accept-Encoding',
            });
            res.end(_cachedStatic.brotli);
        } else if (compressible && _acceptEncStatic.includes('gzip') && _cachedStatic.gzipped) {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Encoding': 'gzip',
                'Content-Length': _cachedStatic.gzipped.length,
                'Cache-Control': cacheControl,
                'Vary': 'Accept-Encoding',
            });
            res.end(_cachedStatic.gzipped);
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': _cachedStatic.data.length,
                'Cache-Control': cacheControl,
                'Accept-Ranges': 'bytes',
            });
            res.end(_cachedStatic.data);
        }
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (!ext || ext === '.html') {
                readCachedFile(path.join(ROOT, 'index.html'), (err2, html) => {
                    if (err2) { res.writeHead(404); res.end('Not Found'); return; }
                    serveHtmlWithSeo(html, urlPath, res, req.headers['accept-encoding'] || '', qs);
                });
            } else {
                res.writeHead(404, {'Content-Type':'text/plain'});
                res.end('Not Found');
            }
            return;
        }

        const acceptEnc = req.headers['accept-encoding'] || '';
        if (compressible && acceptEnc.includes('gzip')) {
            zlib.gzip(data, (e, buf) => {
                if (e) {
                    res.writeHead(200, {'Content-Type': contentType, 'Content-Length': data.length, 'Cache-Control': cacheControl});
                    res.end(data);
                    return;
                }
                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Encoding': 'gzip',
                    'Cache-Control': cacheControl,
                    'Vary': 'Accept-Encoding',
                });
                res.end(buf);
            });
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': data.length,
                'Cache-Control': cacheControl,
                'Accept-Ranges': 'bytes',
            });
            res.end(data);
        }
    });
});

_preloadReady.then(() => {
    server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}).catch(err => {
    console.error('[FATAL] preload failed, starting anyway:', err);
    server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
});
