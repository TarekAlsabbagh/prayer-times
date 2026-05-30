// Phase E3-a — Navigation Loading Overlay (site-wide).
// Per E3 diagnostic: there is NO real homepage flash on direct /moon-today load
// (#page-prayer-times stripped, html.moon-today-hub-page set, only #page-moon
// visible from first sample). The perceived "flash" is full-navigation latency:
// user clicks an internal link → browser stays on the OLD page during SSR
// (Render free-tier cold start ~2-5s) → user sees old page until new doc arrives.
//
// Fix: show an immediate full-screen overlay BEFORE triggering navigation.
// User sees a clear "loading" indicator instead of perceiving the old page as
// a "flash". Per-page text + icon. Hidden by default, revealed via
// _showNavLoadingOverlay(kind). Auto-hidden on BFCache restore (pageshow).
//
// Coverage:
//   1. Direct JS-driven navigation: 16 `window.location.href = ...` call sites
//      get a `_showNavLoadingOverlay('kind');` line inserted right above them.
//   2. Native <a href> link clicks: a single delegated click-capture handler
//      detects the URL and shows the overlay for any internal nav link.
//
// Does NOT touch: SSR, router, hydration, title/meta, headings, SEO. Pure UX.

import { readFileSync, writeFileSync } from 'node:fs';

const ROOT  = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\';
const HTML  = ROOT + 'index.html';
const CSS   = ROOT + 'css\\style.css';
const APP   = ROOT + 'js\\app.js';

const _eolOf = (s) => /\r\n/.test(s) ? '\r\n' : '\n';
const replaceOnce = (text, anchor, replacement, label) => {
    const cnt = text.split(anchor).length - 1;
    if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
    return text.replace(anchor, replacement);
};

// ─────────────────────────────────────────────────────────────────────────────
// 1) index.html — inject overlay div at top of <body>
// ─────────────────────────────────────────────────────────────────────────────
{
    let html = readFileSync(HTML, 'utf8');
    if (/id="nav-loading-overlay"/.test(html)) {
        throw new Error('[index.html] nav-loading-overlay already present — script already ran?');
    }
    const EOL = _eolOf(html);
    const anchor = '<body>' + EOL;
    const overlayBlock = [
        '<body>',
        '    <!-- ═══ E3-a (2026-05-01): Navigation transition overlay ═══',
        '         Shown immediately when the user clicks an internal nav link or a JS handler',
        '         calls _showNavLoadingOverlay(kind) before window.location.href = ...',
        '         Masks the OLD page during SSR latency (Render free-tier cold start, ~2-5s)',
        '         so the user sees a clear "loading" indicator instead of perceiving the old',
        '         page as a "flash". Per-page text + icon set in JS. Hidden by default. -->',
        '    <div id="nav-loading-overlay" class="nav-loading-overlay" hidden role="dialog" aria-live="polite" aria-label="Loading">',
        '        <div class="nav-loading-content">',
        '            <div class="nav-loading-icon" id="nav-loading-icon" aria-hidden="true">⏳</div>',
        '            <div class="nav-loading-text" id="nav-loading-text">Loading...</div>',
        '            <div class="nav-loading-spinner" aria-hidden="true"></div>',
        '        </div>',
        '    </div>',
        '',
    ].join(EOL);
    html = replaceOnce(html, anchor, overlayBlock + EOL, 'index.html<body>');
    writeFileSync(HTML, html);
    console.log('✅ index.html — overlay div inserted at top of <body>');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) css/style.css — append overlay styles
// ─────────────────────────────────────────────────────────────────────────────
{
    let css = readFileSync(CSS, 'utf8');
    if (/\.nav-loading-overlay\s*\{/.test(css)) {
        throw new Error('[style.css] .nav-loading-overlay already defined — script already ran?');
    }
    const EOL = _eolOf(css);
    const cssBlock = [
        '',
        '/* ═══ E3-a (2026-05-01): Navigation transition overlay ═══',
        '   Shown immediately when the user clicks an internal nav link that triggers',
        '   window.location.href = ... navigation. Masks the OLD page during SSR latency',
        '   (Render free-tier cold start ~2-5s) so the user sees a clear "loading"',
        '   indicator instead of perceiving the old page as a "flash". Per-page text +',
        '   icon set in JS via _showNavLoadingOverlay(kind). The overlay auto-disappears',
        '   when the new document loads (DOM is replaced); BFCache restore is handled',
        '   by a pageshow listener that re-hides the [hidden] attribute.',
        '   Background uses --bg so dark/light themes both look correct (no white flash). */',
        '.nav-loading-overlay {',
        '    position: fixed;',
        '    inset: 0;',
        '    background: var(--bg, #f0f2f5);',
        '    z-index: 99999;',
        '    display: flex;',
        '    align-items: center;',
        '    justify-content: center;',
        '    /* Pointer events ON: blocks accidental clicks during navigation. */',
        '}',
        '.nav-loading-overlay[hidden] { display: none; }',
        '.nav-loading-content {',
        '    display: flex;',
        '    flex-direction: column;',
        '    align-items: center;',
        '    gap: 16px;',
        '    color: var(--text, #1f2328);',
        '    text-align: center;',
        '    padding: 24px;',
        '    max-width: 360px;',
        '}',
        '.nav-loading-icon {',
        '    font-size: 48px;',
        '    line-height: 1;',
        '    animation: nav-loading-pulse 1.4s ease-in-out infinite;',
        '}',
        '.nav-loading-text {',
        '    font-size: 16px;',
        '    font-weight: 500;',
        '    line-height: 1.4;',
        '}',
        '.nav-loading-spinner {',
        '    width: 32px;',
        '    height: 32px;',
        '    border: 3px solid var(--border, rgba(0,0,0,0.1));',
        '    border-top-color: var(--primary, #2c5f5d);',
        '    border-radius: 50%;',
        '    animation: nav-loading-spin 0.8s linear infinite;',
        '}',
        '@keyframes nav-loading-pulse {',
        '    0%, 100% { opacity: 0.6; transform: scale(1); }',
        '    50%      { opacity: 1;   transform: scale(1.05); }',
        '}',
        '@keyframes nav-loading-spin {',
        '    to { transform: rotate(360deg); }',
        '}',
        '@media (prefers-reduced-motion: reduce) {',
        '    .nav-loading-icon { animation: none; }',
        '    .nav-loading-spinner { animation-duration: 1.6s; }',
        '}',
        '',
    ].join(EOL);
    css = css + cssBlock;
    writeFileSync(CSS, css);
    console.log('✅ css/style.css — overlay styles appended');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) js/app.js — insert helper, delegated click handler, and wrap nav calls
// ─────────────────────────────────────────────────────────────────────────────
{
    let app = readFileSync(APP, 'utf8');
    if (/_showNavLoadingOverlay/.test(app)) {
        throw new Error('[app.js] _showNavLoadingOverlay already defined — script already ran?');
    }
    const EOL = _eolOf(app);

    // 3a) Insert helper + click-handler block right BEFORE the existing
    //     applyPageType() function definition (a stable, visible anchor).
    const helperAnchor = 'function applyPageType() {';
    const helperBlock = [
        '// ═══ E3-a (2026-05-01): Navigation Loading Overlay ═══',
        '// Per E3 diagnostic: /moon-today does NOT actually flash homepage content.',
        '// The perceived flash is full-navigation latency on Render free-tier — the',
        '// browser stays visually on the OLD page until the new SSR doc arrives.',
        '// Fix: show an immediate full-screen overlay BEFORE setting',
        '// window.location.href, so the user sees a clear "loading" state instead.',
        '//',
        '// Per-page text in 10 langs. Generic fallback if kind is unknown. Auto-',
        '// hidden on BFCache restore via the pageshow listener below.',
        'const _NAV_LOADING_MSGS = {',
        '    moon: {',
        '        ar: \'جاري تحميل حالة القمر اليوم...\',  en: "Loading today\'s moon page...",',
        '        fr: "Chargement de la lune aujourd\'hui...", tr: \'Bugünün ay sayfası yükleniyor...\',',
        '        ur: \'آج کا چاند لوڈ ہو رہا ہے...\',     de: \'Mond heute wird geladen...\',',
        '        id: \'Memuat halaman bulan hari ini...\', es: \'Cargando luna de hoy...\',',
        '        bn: \'আজকের চাঁদ লোড হচ্ছে...\',           ms: \'Memuat halaman bulan hari ini...\',',
        '    },',
        '    qibla: {',
        '        ar: \'جاري تحميل اتّجاه القبلة...\',     en: \'Loading qibla direction...\',',
        '        fr: \'Chargement de la direction de la Qibla...\', tr: \'Kıble yönü yükleniyor...\',',
        '        ur: \'قبلہ کی سمت لوڈ ہو رہی ہے...\',    de: \'Qibla-Richtung wird geladen...\',',
        '        id: \'Memuat arah kiblat...\',           es: \'Cargando dirección de la Qibla...\',',
        '        bn: \'কিবলার দিক লোড হচ্ছে...\',          ms: \'Memuat arah kiblat...\',',
        '    },',
        '    \'prayer-times\': {',
        '        ar: \'جاري تحميل مواقيت الصلاة...\',     en: \'Loading prayer times...\',',
        '        fr: \'Chargement des heures de prière...\', tr: \'Namaz vakitleri yükleniyor...\',',
        '        ur: \'نماز کے اوقات لوڈ ہو رہے ہیں...\', de: \'Gebetszeiten werden geladen...\',',
        '        id: \'Memuat waktu salat...\',           es: \'Cargando horarios de oración...\',',
        '        bn: \'নামাজের সময় লোড হচ্ছে...\',         ms: \'Memuat waktu solat...\',',
        '    },',
        '    zakat: {',
        '        ar: \'جاري تحميل حاسبة الزكاة...\',      en: \'Loading zakat calculator...\',',
        '        fr: \'Chargement du calculateur de Zakat...\', tr: \'Zekat hesaplayıcı yükleniyor...\',',
        '        ur: \'زکات کیلکولیٹر لوڈ ہو رہا ہے...\', de: \'Zakat-Rechner wird geladen...\',',
        '        id: \'Memuat kalkulator zakat...\',      es: \'Cargando calculadora de Zakat...\',',
        '        bn: \'যাকাত ক্যালকুলেটর লোড হচ্ছে...\',    ms: \'Memuat kalkulator zakat...\',',
        '    },',
        '    duas: {',
        '        ar: \'جاري تحميل الأذكار...\',           en: \'Loading azkar...\',',
        '        fr: \'Chargement des azkar...\',         tr: \'Azkar yükleniyor...\',',
        '        ur: \'اذکار لوڈ ہو رہے ہیں...\',          de: \'Azkar werden geladen...\',',
        '        id: \'Memuat zikir...\',                 es: \'Cargando azkar...\',',
        '        bn: \'আযকার লোড হচ্ছে...\',                ms: \'Memuat zikir...\',',
        '    },',
        '    tasbih: {',
        '        ar: \'جاري تحميل المسبحة...\',           en: \'Loading tasbih...\',',
        '        fr: \'Chargement du tasbih...\',          tr: \'Tesbih yükleniyor...\',',
        '        ur: \'تسبیح لوڈ ہو رہی ہے...\',           de: \'Tasbih wird geladen...\',',
        '        id: \'Memuat tasbih...\',                es: \'Cargando tasbih...\',',
        '        bn: \'তসবিহ লোড হচ্ছে...\',                ms: \'Memuat tasbih...\',',
        '    },',
        '    hijri: {',
        '        ar: \'جاري تحميل التقويم الهجري...\',    en: \'Loading Hijri calendar...\',',
        '        fr: \'Chargement du calendrier hégirien...\', tr: \'Hicri takvim yükleniyor...\',',
        '        ur: \'ہجری کیلنڈر لوڈ ہو رہا ہے...\',     de: \'Hidschri-Kalender wird geladen...\',',
        '        id: \'Memuat kalender Hijriah...\',      es: \'Cargando calendario hijri...\',',
        '        bn: \'হিজরি ক্যালেন্ডার লোড হচ্ছে...\',     ms: \'Memuat kalendar Hijrah...\',',
        '    },',
        '    \'date-converter\': {',
        '        ar: \'جاري تحميل محوّل التاريخ...\',     en: \'Loading date converter...\',',
        '        fr: \'Chargement du convertisseur de date...\', tr: \'Tarih dönüştürücü yükleniyor...\',',
        '        ur: \'تاریخ کنورٹر لوڈ ہو رہا ہے...\',   de: \'Datumsumrechner wird geladen...\',',
        '        id: \'Memuat konverter tanggal...\',     es: \'Cargando conversor de fecha...\',',
        '        bn: \'তারিখ রূপান্তরকারী লোড হচ্ছে...\',   ms: \'Memuat penukar tarikh...\',',
        '    },',
        '    generic: {',
        '        ar: \'جاري التحميل...\',                  en: \'Loading...\',',
        '        fr: \'Chargement...\',                   tr: \'Yükleniyor...\',',
        '        ur: \'لوڈ ہو رہا ہے...\',                de: \'Wird geladen...\',',
        '        id: \'Memuat...\',                       es: \'Cargando...\',',
        '        bn: \'লোড হচ্ছে...\',                     ms: \'Memuat...\',',
        '    },',
        '};',
        'const _NAV_LOADING_ICONS = {',
        '    moon: \'🌙\', qibla: \'🧭\', \'prayer-times\': \'🕌\', zakat: \'💰\',',
        '    duas: \'📿\', tasbih: \'📿\', hijri: \'📅\', \'date-converter\': \'🔄\',',
        '    generic: \'⏳\',',
        '};',
        'function _showNavLoadingOverlay(kind) {',
        '    try {',
        '        const ov = document.getElementById(\'nav-loading-overlay\');',
        '        if (!ov) return;',
        '        const _kind = kind && _NAV_LOADING_MSGS[kind] ? kind : \'generic\';',
        '        const _lang = (typeof getCurrentLang === \'function\') ? getCurrentLang() : \'ar\';',
        '        const _msg = _NAV_LOADING_MSGS[_kind][_lang] || _NAV_LOADING_MSGS[_kind].en || _NAV_LOADING_MSGS.generic.en;',
        '        const _icon = _NAV_LOADING_ICONS[_kind] || _NAV_LOADING_ICONS.generic;',
        '        const _txtEl = document.getElementById(\'nav-loading-text\');',
        '        const _iconEl = document.getElementById(\'nav-loading-icon\');',
        '        if (_txtEl)  _txtEl.textContent = _msg;',
        '        if (_iconEl) _iconEl.textContent = _icon;',
        '        ov.removeAttribute(\'hidden\');',
        '        // Force reflow so the overlay paints BEFORE the navigation kicks in.',
        '        // Without this, the browser may schedule the navigation before',
        '        // the overlay paints — defeating the entire purpose.',
        '        void ov.offsetHeight;',
        '    } catch (_e) { /* silent */ }',
        '}',
        '// Detect page kind from a URL path (used by the delegated click handler',
        '// for native <a href> links that don\'t go through the data-page= path).',
        'function _detectNavKindFromUrl(pathname) {',
        '    const p = String(pathname || \'\').replace(/^\\/(?:en|fr|tr|ur|de|id|es|bn|ms)(?=\\/|$)/, \'\') || \'/\';',
        '    if (p === \'/\' || p === \'\' || p === \'/index.html\')  return \'prayer-times\';',
        '    if (/^\\/moon-today/.test(p) || /^\\/moon-in-/.test(p))     return \'moon\';',
        '    if (/^\\/qibla/.test(p))                                   return \'qibla\';',
        '    if (/^\\/prayer-times-in-/.test(p))                        return \'prayer-times\';',
        '    if (/^\\/time-left-until-next-prayer-in-/.test(p))              return \'prayer-times\';',
        '    if (/^\\/next-prayer-time-in-/.test(p))                    return \'prayer-times\';',
        '    if (/^\\/zakat-calculator/.test(p))                        return \'zakat\';',
        '    if (/^\\/azkar/.test(p) || /^\\/duas/.test(p))              return \'duas\';',
        '    if (/^\\/msbaha/.test(p) || /^\\/tasbih/.test(p))           return \'tasbih\';',
        '    if (/^\\/hijri-calendar/.test(p) || /^\\/hijri-/.test(p))   return \'hijri\';',
        '    if (/^\\/today-hijri-date/.test(p))                        return \'hijri\';',
        '    if (/^\\/dateconverter/.test(p))                           return \'date-converter\';',
        '    return \'generic\';',
        '}',
        '// Delegated capture-phase click handler — covers ALL native <a href>',
        '// links across the site without per-link instrumentation. Only fires for',
        '// plain left-clicks to internal pages (skips Ctrl/Cmd/Shift/Alt = open in',
        '// new tab, target=_blank, javascript:, mailto:, tel:, hash-only, downloads,',
        '// and same-pathname clicks).',
        'document.addEventListener(\'click\', function(_e) {',
        '    if (_e.button !== 0 || _e.ctrlKey || _e.metaKey || _e.shiftKey || _e.altKey) return;',
        '    if (_e.defaultPrevented) return;',
        '    const _a = _e.target && _e.target.closest && _e.target.closest(\'a[href]\');',
        '    if (!_a) return;',
        '    if (_a.target && _a.target !== \'_self\') return;',
        '    if (_a.hasAttribute(\'download\')) return;',
        '    const _hrefAttr = _a.getAttribute(\'href\');',
        '    if (!_hrefAttr || _hrefAttr === \'#\' || _hrefAttr.startsWith(\'#\')',
        '        || _hrefAttr.startsWith(\'javascript:\') || _hrefAttr.startsWith(\'mailto:\')',
        '        || _hrefAttr.startsWith(\'tel:\')) return;',
        '    let _u;',
        '    try { _u = new URL(_a.href, location.href); } catch (_err) { return; }',
        '    if (_u.origin !== location.origin) return;',
        '    if (_u.pathname === location.pathname && _u.search === location.search) return;',
        '    _showNavLoadingOverlay(_detectNavKindFromUrl(_u.pathname));',
        '}, true);  // capture phase: runs BEFORE any element-level handler',
        '// BFCache restore — Safari/Firefox can restore the page from cache with',
        '// the overlay still visible. Re-hide it on pageshow.',
        'window.addEventListener(\'pageshow\', function() {',
        '    const _ov = document.getElementById(\'nav-loading-overlay\');',
        '    if (_ov) _ov.setAttribute(\'hidden\', \'\');',
        '});',
        '',
    ].join(EOL);
    app = replaceOnce(app, helperAnchor, helperBlock + helperAnchor, 'app.js helper');

    // 3b) Wrap each `window.location.href = ...` call with the overlay show.
    // Each entry: { anchor: full original line (must be unique), kind: page kind }.
    // The replacement = `_showNavLoadingOverlay('kind');\n[indent]<anchor>`.
    const navCalls = [
        { anchor: `                            window.location.href = pageUrl(_datedPath);`,                     kind: 'hijri',          indent: '                            ' },
        { anchor: `                    window.location.href = pageUrl('/today-hijri-date');`,                    kind: 'hijri',          indent: '                    ' },
        { anchor: `                    window.location.href = pageUrl('/dateconverter');`,                       kind: 'date-converter', indent: '                    ' },
        { anchor: `                    window.location.href = pageUrl('/zakat-calculator');`,                    kind: 'zakat',          indent: '                    ' },
        { anchor: `                    window.location.href = pageUrl('/moon-today');`,                          kind: 'moon',           indent: '                    ' },
        { anchor: `                    window.location.href = (typeof _buildMoonCityUrl === 'function')`,        kind: 'moon',           indent: '                    ' },
        { anchor: `                    window.location.href = pageUrl('/hijri-calendar');`,                      kind: 'hijri',          indent: '                    ' },
        { anchor: `                    window.location.href = pageUrl(\`/prayer-times-in-\${_slug}\`);`,         kind: 'prayer-times',   indent: '                    ' },
        { anchor: `                        window.location.href = pageUrl('/qibla');`,                           kind: 'qibla',          indent: '                        ' },
        { anchor: `                    window.location.href = pageUrl('/msbaha');`,                              kind: 'tasbih',         indent: '                    ' },
        { anchor: `                    window.location.href = pageUrl('/azkar');`,                               kind: 'duas',           indent: '                    ' },
        { anchor: `        window.location.href = pageUrl(\`/prayer-times-in-\${slug}\`);`,                      kind: 'prayer-times',   indent: '        ' },
        { anchor: `        window.location.href = pageUrl(\`/moon-today-in-\${slug}\`);`,                        kind: 'moon',           indent: '        ' },
        { anchor: `    window.location.href = pageUrl(\`/\${slug}\`);`,                                          kind: 'generic',        indent: '    ' },
        { anchor: `    window.location.href = (_ln === 'ar') ? '/' : ('/' + _ln + '/');`,                        kind: 'prayer-times',   indent: '    ' },
        { anchor: `    window.location.href = \`\${prefix}/hijri-calendar/\${y}\`;`,                              kind: 'hijri',          indent: '    ' },
    ];

    for (const { anchor, kind, indent } of navCalls) {
        const replacement = `${indent}_showNavLoadingOverlay('${kind}');${EOL}${anchor}`;
        app = replaceOnce(app, anchor, replacement, `app.js nav: ${kind} @ "${anchor.trim().slice(0, 60)}..."`);
        console.log(`  ✓ wrapped: ${kind.padEnd(15)} ${anchor.trim().slice(0, 60)}`);
    }

    writeFileSync(APP, app);
    console.log('✅ js/app.js — helper + click handler + 16 nav-call wraps');
}

console.log('\n✅ Phase E3-a complete. Restart preview server to test.');
