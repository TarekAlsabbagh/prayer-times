// ADSENSE-STRICT-CSP-MIGRATION-1 — PHASE 2 ENFORCEMENT — real-enforcement browser matrix.
//
// The server under test sends the strict policy as the ENFORCING Content-Security-Policy (plus the identical temporary
// Report-Only copy). This harness NEVER edits either CSP header. Per top-level document it only:
//   * records both headers and checks them against the HTML (same nonce everywhere, no un-nonced executable script),
//   * injects ONE nonce-less parser-inserted inline canary right after <head> (body only; content-length/-encoding are
//     dropped because the body changed) — it must be BLOCKED with disposition "enforce",
//   * (local server only) adds CF-IPCountry to the top document request so the regional CMP path can be selected.
// Then it runs positive functional checks and real interactions across 15 route families, and counts every CSP
// violation by disposition, every uncaught JS error, and every request the browser blocked for CSP reasons.
//
// PASS for a load: expected HTTP status · headers/nonce consistent · canary blocked, never ran · enforced violations
// other than the canary 0 · report-only violations other than the canary 0 · JS errors 0 · every check and
// interaction ok · CSP-blocked requests 0.
//
// Env: TP_P2_ORIGIN (remote origin, no boot, no CF-IPCountry) · TP_P2_ROOT (tree to boot, default this repo)
//      TP_P2_PORT (8860) · TP_P2_CDP_BASE (54960) · TP_P2_WORKERS (3) · TP_P2_LOADS (3 per route)
//      TP_P2_WAIT_MS (11000) · TP_P2_EEA (1 = add the DE regional pass, local only) · TP_P2_OUT (json)
// Usage: node scripts/_browser_adsense_strict_csp_phase_2_enforcement.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = process.env.TP_P2_ROOT || REPO;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const REMOTE = process.env.TP_P2_ORIGIN || '';
const PORT = Number(process.env.TP_P2_PORT || 8860);
const ORIGIN = REMOTE || 'http://127.0.0.1:' + PORT;
const CDP_BASE = Number(process.env.TP_P2_CDP_BASE || 54960);
const WORKERS = Number(process.env.TP_P2_WORKERS || 3);
const LOADS = Number(process.env.TP_P2_LOADS || 3);
const WAIT_MS = Number(process.env.TP_P2_WAIT_MS || 11000);
const EEA = !REMOTE && process.env.TP_P2_EEA !== '0';
const TOKEN = '__TP_CSP_NONCE__';
const GOOGLE_RE = /(^|\.)(google|googleapis|gstatic|googlesyndication|googletagmanager|google-analytics|doubleclick|adtrafficquality|googleadservices|googleusercontent)\.|\.google$|(^|\.)google\.[a-z.]+$/;

// ---- page-side checks: each resolves to { ok, detail } -------------------------------------------------------------
const x = (fn) => '(' + fn.toString() + ')()';
const CHECKS = {
    appRunning: x(function () { var ok = typeof initApp === 'function' && typeof navToPage === 'function' && typeof window.SiteSearch === 'object'; return { ok: ok, detail: 'initApp=' + typeof initApp + ' navToPage=' + typeof navToPage + ' SiteSearch=' + typeof window.SiteSearch }; }),
    gtagConsent: x(function () { var dl = window.dataLayer || []; var d = 0; for (var i = 0; i < dl.length; i++) { try { if (dl[i] && dl[i][0] === 'consent' && dl[i][1] === 'default') d++; } catch (e) {} } return { ok: typeof gtag === 'function' && dl.length > 0 && d === 2, detail: 'gtag=' + typeof gtag + ' dataLayer=' + dl.length + ' consentDefault=' + d }; }),
    adsense: x(function () { var tag = document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-"]'); var ins = Array.prototype.slice.call(document.querySelectorAll('ins')); var visible = ins.filter(function (e) { var r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).display !== 'none'; }).length; var auto = document.querySelectorAll('.google-auto-placed, ins[data-anchor-status], ins[data-vignette-loaded]').length; return { ok: typeof window.adsbygoogle === 'object' && !!tag && tag.async === true && tag.getAttribute('crossorigin') === 'anonymous' && visible === 0 && auto === 0, detail: 'adsbygoogle=' + typeof window.adsbygoogle + ' tag=' + !!tag + ' visibleIns=' + visible + ' autoAds=' + auto }; }),
    ummAlQura: x(function () { var u = window._HIJRI_UMM_AL_QURA; return { ok: typeof u === 'object' && !!u && !!u.years && Object.keys(u.years).length > 0, detail: 'years=' + (u && u.years ? Object.keys(u.years).length : 0) }; }),
    hijri: x(function () { var el = document.getElementById('banner-hijri-date') || document.getElementById('sidebar-hijri-date'); var t = el ? el.textContent.trim() : ''; return { ok: !!el && t !== '--' && /1[45]\d\d/.test(t), detail: (el ? el.id : 'none') + '="' + t.slice(0, 40) + '"' }; }),
    i18nAr: x(function () { var core = !!document.querySelector('script[src^="js/i18n-core.js?v="]'); var lang = !!document.querySelector('script[src^="js/i18n/ar.js?v="]'); return { ok: core && lang && typeof window._initI18nAutoGen === 'function' && document.documentElement.lang === 'ar', detail: 'core=' + core + ' ar.js=' + lang + ' _initI18nAutoGen=' + typeof window._initI18nAutoGen + ' lang=' + document.documentElement.lang }; }),
    i18nEn: x(function () { var en = !!document.querySelector('script[src^="js/i18n/en.js?v="]'); var tr = (typeof t === 'function') ? t('nav.prayer_times') : null; return { ok: en && document.documentElement.lang === 'en' && document.documentElement.dir === 'ltr' && tr === 'Prayer Times', detail: 'en.js=' + en + ' lang=' + document.documentElement.lang + ' t(nav.prayer_times)=' + tr }; }),
    cityTimes: x(function () { var ks = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']; var vals = ks.map(function (k) { var el = document.getElementById('time-' + k); return el ? el.textContent.trim() : ''; }); return { ok: document.querySelector('#page-prayer-times.active') !== null && vals.every(function (v) { return /\d{1,2}:\d{2}/.test(v); }) && typeof PrayerTimes === 'object', detail: vals.join(' ') }; }),
    countryIsland: x(function () { var el = document.getElementById('country-cities-data'); var n = -1; try { n = el ? JSON.parse(el.textContent).length : -1; } catch (e) { n = -2; } return { ok: !!el && el.type === 'application/json' && n > 0 && !el.hasAttribute('nonce'), detail: 'entries=' + n + ' nonceAttr=' + (el ? el.hasAttribute('nonce') : null) }; }),
    countryGrid: x(function () { var n = document.querySelectorAll('#cities-container[data-ssr-grid="1"] .cities-grid a.city-link[data-slug]').length; return { ok: n > 0, detail: 'city cards=' + n }; }),
    ptCountry: x(function () { var c = window.__PT_COUNTRY__; return { ok: !!c && c.cc === 'sa' && !!c.names && typeof c.names.en === 'string', detail: 'cc=' + (c && c.cc) }; }),
    worldwide: x(function () { var n = document.querySelectorAll('a[href*="prayer-times-in-"]').length; return { ok: n > 20 && document.body.innerText.length > 500, detail: 'links=' + n }; }),
    quranHome: x(function () { var n = document.querySelectorAll('#quran-surah-index li.quran-home-idx-li').length; return { ok: document.querySelector('#page-quran-home.active .quran-home-shell') !== null && n === 114, detail: 'surah index items=' + n }; }),
    surah: x(function () { var s = document.getElementById('page-quran-surah'); var n = document.querySelectorAll('#page-quran-surah .quran-ayah[id^="ayah-"]').length; return { ok: !!s && s.classList.contains('active') && s.getAttribute('data-quran-init') === '1' && n >= 7, detail: 'init=' + (s && s.getAttribute('data-quran-init')) + ' ayahs=' + n }; }),
    guidesHub: x(function () { var a = document.querySelector('article.guide-wrap'); var n = a ? a.querySelectorAll('li.guide-hub-card a[href*="/guides/"]').length : 0; return { ok: !!a && !!a.querySelector('h1') && n > 0, detail: 'guide cards=' + n }; }),
    guideArticle: x(function () { var a = document.querySelector('article.guide-wrap'); var len = a ? a.textContent.trim().length : 0; return { ok: !!a && !!a.querySelector('h1') && !!a.querySelector('section.guide-sources') && len > 1500, detail: 'chars=' + len }; }),
    azkar: x(function () { var p = document.getElementById('page-azkar-hub'); var n = document.querySelectorAll('#page-azkar-hub .azkar-hub-grid a.azkar-card').length; return { ok: !!p && p.classList.contains('active') && n === 3, detail: 'cards=' + n }; }),
    moon: x(function () { var p = document.getElementById('page-moon'); var el = document.getElementById('moon-svg-lit'); var d = el ? (el.getAttribute('d') || '') : ''; return { ok: !!p && p.classList.contains('active') && d.length > 0 && typeof MoonCalc === 'object', detail: 'litPath=' + d.length + ' MoonCalc=' + typeof MoonCalc }; }),
    qibla: x(function () { var p = document.getElementById('page-qibla'); var a = (document.getElementById('qibla-angle') || { textContent: '' }).textContent.trim(); return { ok: !!p && p.classList.contains('active') && p.getAttribute('data-qibla-mode') === 'city' && /^\d+(\.\d)?°$/.test(a) && typeof Qibla === 'object', detail: 'angle=' + a }; }),
    nextPrayer: x(function () { var t = (document.getElementById('npt-next-time') || { textContent: '' }).textContent.trim(); return { ok: document.documentElement.classList.contains('next-prayer-time-page') && !!document.getElementById('npt-hero') && /\d{1,2}:\d{2}/.test(t), detail: 'next=' + t }; }),
    timeLeft: x(function () { var el = document.getElementById('tl-countdown'); if (!el) return { ok: false, detail: 'no #tl-countdown' }; var a = el.textContent.trim(); return new Promise(function (res) { setTimeout(function () { var b = el.textContent.trim(); res({ ok: document.documentElement.classList.contains('time-left-page') && /\d{2}:\d{2}:\d{2}/.test(b) && a !== b, detail: a + ' -> ' + b }); }, 2200); }); }),
    legal: x(function () { var h = document.querySelector('h1'); var len = document.body.innerText.length; return { ok: !!h && len > 400, detail: 'chars=' + len }; }),
    notFound: x(function () { return { ok: /404/.test(document.title), detail: 'title=' + document.title.slice(0, 50) }; }),
    eeaPath: x(function () { var fc = !!document.querySelector('script[src*="footer-cookie.js"]'); var banner = !!document.getElementById('cc-banner'); var ctl = document.querySelectorAll('[data-tp-cookie-settings]').length; return { ok: !fc && !banner && document.__tpCmpBound === 1 && ctl > 0 && typeof window.openCookieSettings !== 'function', detail: 'footer-cookie.js=' + fc + ' customBanner=' + banner + ' __tpCmpBound=' + document.__tpCmpBound + ' controls=' + ctl }; }),
};
const HANDLER_PROBES = function (MIN) {
    var probes = [
        { name: 'toggleSidebar', sel: '.menu-toggle', attr: 'onclick', run: function (el) { var s = document.getElementById('sidebar'); if (!s) return false; var b = s.classList.contains('open'); el.click(); var ok = s.classList.contains('open') === !b; el.click(); return ok && s.classList.contains('open') === b; } },
        { name: 'toggleLangMenu', sel: '.lang-switcher-btn', attr: 'onclick', run: function (el) { el.click(); var ok = el.closest('.lang-switcher').classList.contains('open') && el.getAttribute('aria-expanded') === 'true'; el.click(); return ok; } },
        { name: 'toggleCountriesFull', sel: '.countries-expand-btn', attr: 'onclick', run: function (el) { var s = document.getElementById('arab-countries-section'); if (!s) return false; var b = s.getAttribute('data-full'); el.click(); var ok = s.getAttribute('data-full') === (b === 'true' ? 'false' : 'true'); el.click(); return ok; } },
        { name: 'tasbihSwitchMode', sel: '#tab-free', attr: 'onclick', run: function (el) { el.click(); return !document.getElementById('tasbih-mode-free').classList.contains('u-hidden') && el.classList.contains('active'); } },
        { name: 'tasbihFreeClick', sel: '#tasbih-free-btn', attr: 'onclick', run: function (el) { var c = document.getElementById('tasbih-free-count'); var n = +c.textContent; el.click(); return +c.textContent === n + 1; } },
        { name: 'switchConverter', sel: '.converter-tab[onclick*="to-greg"]', attr: 'onclick', run: function (el) { el.click(); return !document.getElementById('converter-to-greg').classList.contains('u-hidden') && el.classList.contains('active'); } },
        { name: 'setScheduleDays', sel: '.schedule-tab[onclick*="setScheduleDays(14"]', attr: 'onclick', run: function (el) { el.click(); return el.classList.contains('active') && document.querySelectorAll('.schedule-tab.active').length === 1; } },
        { name: 'openSettingsModal', sel: '.ccs-advanced-link', attr: 'onclick', run: function (el) { el.click(); var o = document.getElementById('settings-modal-overlay'); var ok = !!o && o.classList.contains('open'); var c = document.querySelector('.settings-modal-close'); if (c) c.click(); return ok && !o.classList.contains('open'); } },
        { name: 'toggleTheme', sel: '.theme-toggle-btn', attr: 'onclick', run: function (el) { var h = document.documentElement, b = h.getAttribute('data-theme'); el.click(); var a = h.getAttribute('data-theme'); el.click(); return (b === 'dark' ? a === null : a === 'dark') && h.getAttribute('data-theme') === b; } },
    ];
    var ran = [], failed = [];
    probes.forEach(function (p) { var el = document.querySelector(p.sel); if (!el || !el.hasAttribute(p.attr)) return; var ok = false; try { ok = !!p.run(el); } catch (e) { ok = false; } (ok ? ran : failed).push(p.name); });
    return { ok: failed.length === 0 && ran.length >= MIN, detail: 'inline handlers ran ' + ran.length + ' (min ' + MIN + '): ' + ran.join(',') + (failed.length ? ' FAILED: ' + failed.join(',') : '') };
};
const handlers = (min) => '(' + HANDLER_PROBES.toString() + ')(' + min + ')';
const INTERACTIONS = {
    search: { ms: 11000, expr: x(function () { var inp = document.querySelector('#loc-hero-search'); if (!inp) return { ok: false, detail: 'no #loc-hero-search' }; var sel = '#loc-hero-suggestions .search-test-result, #loc-hero-suggestions .suggestion-item, #city-suggestions .suggestion-item'; inp.focus(); inp.value = 'riyadh'; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'h' })); var t0 = Date.now(); return new Promise(function (res) { (function poll() { var n = document.querySelectorAll(sel).length; if (n > 0 || Date.now() - t0 > 9000) { inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true })); return res({ ok: n > 0, detail: 'results=' + n + ' in ' + (Date.now() - t0) + 'ms' }); } setTimeout(poll, 200); })(); }); }) },
    cookie: { ms: 4000, expr: x(function () { var c = document.querySelector('[data-tp-cookie-settings]'); if (!c) return { ok: false, detail: 'no control' }; var href = location.href; c.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return new Promise(function (res) { setTimeout(function () { var m = document.getElementById('cc-modal'); var n = m ? m.querySelectorAll('*').length : 0; var r = { ok: n > 0 && !!document.getElementById('cc-save-btn') && !c.hasAttribute('onclick') && location.href === href && typeof window.openCookieSettings === 'function', detail: 'modal nodes=' + n + ' sameUrl=' + (location.href === href) }; if (m) m.remove(); res(r); }, 1000); }); }) },
    theme: { ms: 3000, expr: x(function () { var b = document.querySelector('.theme-toggle-btn'); if (!b) return { ok: false, detail: 'no .theme-toggle-btn' }; var h = document.documentElement, before = h.getAttribute('data-theme'); b.click(); var after = h.getAttribute('data-theme'), ls = localStorage.getItem('theme'); b.click(); var restored = h.getAttribute('data-theme'); var flipped = before === 'dark' ? after === null : after === 'dark'; return { ok: flipped && ls === (before === 'dark' ? 'light' : 'dark') && restored === before, detail: 'data-theme ' + before + ' -> ' + after + ' -> ' + restored }; }) },
    quranHomeSearch: { ms: 5000, expr: x(function () { var i = document.getElementById('quran-home-q'); if (!i) return { ok: false, detail: 'no #quran-home-q' }; i.value = '18'; i.dispatchEvent(new Event('input', { bubbles: true })); return new Promise(function (res) { setTimeout(function () { var s = document.getElementById('quran-home-suggestions'); var open = (s && !s.hidden) || i.getAttribute('aria-expanded') === 'true'; var n = s ? s.querySelectorAll('[role="option"], li, a').length : 0; i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); res({ ok: open && n > 0, detail: 'open=' + open + ' items=' + n }); }, 1500); }); }) },
    quranFont: { ms: 4000, expr: x(function () { var pg = document.querySelector('#page-quran-surah .quran-surah-page'); var inc = document.querySelector('#page-quran-surah [data-quran-action="font-inc"]'); var dec = document.querySelector('#page-quran-surah [data-quran-action="font-dec"]'); if (!pg || !inc || !dec) return { ok: false, detail: 'controls missing' }; var before = pg.style.getPropertyValue('--q-ayah-size-offset').trim(); inc.click(); return new Promise(function (res) { setTimeout(function () { var after = pg.style.getPropertyValue('--q-ayah-size-offset').trim(); dec.click(); res({ ok: after !== before, detail: '"' + before + '" -> "' + after + '"' }); }, 400); }); }) },
    qiblaToggle: { ms: 3000, expr: x(function () { var b = document.getElementById('qibla-map-toggle'); if (!b) return { ok: false, detail: 'no #qibla-map-toggle' }; var was = b.getAttribute('aria-pressed'); b.click(); var now = b.getAttribute('aria-pressed'); b.click(); return { ok: now !== was, detail: 'aria-pressed ' + was + ' -> ' + now }; }) },
    handlersHome: { ms: 6000, expr: handlers(6) },
    handlersCity: { ms: 6000, expr: handlers(4) },
    handlersHeader: { ms: 6000, expr: handlers(2) },
    handlersAny: { ms: 6000, expr: handlers(0) },
    // full navigations — always LAST; violations of every document are collected
    lang: { navigates: true, ms: 4000, settle: 8000,
        expr: x(function () { var btn = document.querySelector('.lang-switcher-btn'); if (!btn) return { ok: false, detail: 'no .lang-switcher-btn' }; btn.click(); var items = document.querySelectorAll('.lang-menu .lang-menu-item').length; var it = document.querySelector('.lang-menu .lang-menu-item[data-lang="en"]'); if (!it) return { ok: false, detail: 'no en item' }; setTimeout(function () { it.click(); }, 50); return { ok: items >= 9, detail: 'menu items=' + items + ' clicked en' }; }),
        verify: x(function () { var r = { ok: location.pathname === '/en' && document.documentElement.lang === 'en' && localStorage.getItem('app_lang') === 'en', detail: 'now ' + location.pathname + ' lang=' + document.documentElement.lang }; try { localStorage.removeItem('app_lang'); } catch (e) {} return r; }) },
    nav: { navigates: true, ms: 4000, settle: 9000,
        expr: x(function () { var a = document.querySelector('.sidebar-nav a[data-page="quran"]'); if (!a) return { ok: false, detail: 'no sidebar quran link' }; setTimeout(function () { a.click(); }, 50); return { ok: true, detail: 'clicked sidebar quran' }; }),
        verify: x(function () { var n = document.querySelectorAll('#quran-surah-index li.quran-home-idx-li').length; return { ok: location.pathname === '/quran' && !!document.querySelector('#page-quran-home.active') && n === 114, detail: 'now ' + location.pathname + ' items=' + n }; }) },
    // EEA: the control reopens Google's CMP through googlefc.callbackQueue; when Funding Choices never renders (it is
    // not served to a local origin) the documented fail-safe navigates to the control's real href after 8 s.
    eeaCookie: { navigates: true, ms: 4000, settle: 10500,
        expr: x(function () { var c = document.querySelector('[data-tp-cookie-settings]'); if (!c) return { ok: false, detail: 'no control' }; var ev = new MouseEvent('click', { bubbles: true, cancelable: true }); c.dispatchEvent(ev); var q = window.googlefc && window.googlefc.callbackQueue; return { ok: ev.defaultPrevented && !!q, detail: 'defaultPrevented=' + ev.defaultPrevented + ' googlefc.callbackQueue=' + !!q + ' href=' + c.getAttribute('href') }; }),
        verify: x(function () { var cmp = !!document.querySelector('.fc-consent-root,[class*=fc-dialog]'); return { ok: cmp || location.pathname === '/privacy', detail: cmp ? 'Google CMP reopened' : 'fail-safe navigated to ' + location.pathname }; }) },
};

const FAMILIES = [
    { family: 'HOME', routes: ['/'], core: ['appRunning', 'gtagConsent', 'adsense', 'ummAlQura', 'hijri', 'i18nAr'], interactions: ['search', 'cookie', 'theme', 'handlersHome', 'lang'] },
    { family: 'LOCALIZED HOME', routes: ['/en'], core: ['appRunning', 'gtagConsent', 'adsense', 'i18nEn'], interactions: ['cookie', 'theme', 'handlersHeader'] },
    { family: 'CITY', routes: ['/prayer-times-in-riyadh'], core: ['appRunning', 'gtagConsent', 'adsense', 'cityTimes', 'hijri', 'ummAlQura'], interactions: ['search', 'handlersCity', 'nav'] },
    { family: 'COUNTRY', routes: ['/prayer-times-in-saudi-arabia'], core: ['gtagConsent', 'adsense', 'countryIsland', 'countryGrid', 'ptCountry'], interactions: ['handlersAny'] },
    { family: 'WORLDWIDE', routes: ['/prayer-times-worldwide'], core: ['gtagConsent', 'adsense', 'worldwide'], interactions: ['handlersAny'] },
    { family: 'QURAN HOME', routes: ['/quran'], core: ['appRunning', 'gtagConsent', 'adsense', 'quranHome'], interactions: ['quranHomeSearch', 'cookie', 'handlersHeader'] },
    { family: 'SURAH', routes: ['/quran/al-fatihah'], core: ['appRunning', 'gtagConsent', 'adsense', 'surah'], interactions: ['quranFont', 'handlersHeader'] },
    { family: 'GUIDES', routes: ['/guides'], core: ['gtagConsent', 'adsense', 'guidesHub'], interactions: ['cookie', 'handlersAny'] },
    { family: 'GUIDES', routes: ['/guides/why-prayer-times-differ'], core: ['gtagConsent', 'adsense', 'guideArticle'], interactions: ['handlersAny'] },
    { family: 'AZKAR', routes: ['/azkar'], core: ['appRunning', 'gtagConsent', 'adsense', 'azkar'], interactions: ['theme', 'handlersHeader'] },
    { family: 'MOON', routes: ['/moon', '/moon/saudi-arabia/riyadh/today'], core: ['appRunning', 'gtagConsent', 'adsense', 'moon'], interactions: ['handlersHeader'] },
    { family: 'QIBLA', routes: ['/qibla-in-riyadh'], core: ['appRunning', 'gtagConsent', 'adsense', 'qibla'], interactions: ['qiblaToggle', 'handlersHeader'] },
    { family: 'NEXT-PRAYER', routes: ['/next-prayer-in-riyadh'], core: ['appRunning', 'gtagConsent', 'adsense', 'nextPrayer'], interactions: ['handlersHeader'] },
    { family: 'TIME-LEFT', routes: ['/time-left-until-next-prayer-in-riyadh'], core: ['appRunning', 'gtagConsent', 'adsense', 'timeLeft'], interactions: ['handlersHeader'] },
    { family: 'TRUST/LEGAL', routes: ['/about-us', '/contact', '/privacy'], core: ['gtagConsent', 'adsense', 'legal'], interactions: ['cookie', 'handlersAny'] },
    { family: '404', routes: ['/zz-no-such-page/xyz'], core: ['notFound'], interactions: [], status: 404 },
];
const plan = [];
for (const f of FAMILIES) for (const r of f.routes) for (let k = 0; k < LOADS; k++) plan.push({ family: f.family, route: r, core: f.core, interactions: f.interactions, status: f.status || 200, cc: REMOTE ? null : 'SA' });
if (EEA) for (const r of ['/', '/quran']) for (let k = 0; k < 2; k++) plan.push({ family: 'EEA (DE) CMP PATH', route: r, core: ['appRunning', 'gtagConsent', 'adsense', 'eeaPath'], interactions: ['eeaCookie'], status: 200, cc: 'DE', regional: true });
setTimeout(() => { console.log('\nWATCHDOG: exceeded budget'); process.exit(3); }, Math.ceil(plan.length / WORKERS) * (WAIT_MS + 45000) + 5 * 60 * 1000).unref();

// ---- helpers -------------------------------------------------------------------------------------------------------
class CDP {
    constructor(ws) { this.ws = ws; this.id = 0; this.pend = new Map(); this.subs = [];
        ws.onmessage = ev => { const m = JSON.parse(ev.data);
            if (m.id && this.pend.has(m.id)) { const p = this.pend.get(m.id); this.pend.delete(m.id); clearTimeout(p.t); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
            else this.subs.forEach(f => { try { f(m); } catch (_) {} }); };
        ws.onclose = () => { for (const [, p] of this.pend) { clearTimeout(p.t); p.rej(new Error('socket closed')); } this.pend.clear(); }; }
    static async open(u) { const ws = new WebSocket(u); await Promise.race([new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('ws error')); }), sleep(10000).then(() => { throw new Error('ws open timeout'); })]); return new CDP(ws); }
    send(m, p = {}, s, ms = 25000) { const id = ++this.id; return new Promise((res, rej) => { const t = setTimeout(() => { this.pend.delete(id); rej(new Error('timeout ' + m)); }, ms); this.pend.set(id, { res, rej, t }); this.ws.send(JSON.stringify({ id, method: m, params: p, sessionId: s })); }); }
    on(f) { this.subs.push(f); } off(f) { this.subs = this.subs.filter(q => q !== f); }
    close() { try { this.ws.close(); } catch (_) {} }
}
const INIT = `window.__V=[];window.__ERR=[];window.__REJ=[];
document.addEventListener('securitypolicyviolation',function(e){ if(window.__V.length<500) window.__V.push({d:e.effectiveDirective,disp:e.disposition,u:String(e.blockedURI).slice(0,200),src:String(e.sourceFile||'').slice(0,120),ln:e.lineNumber,href:location.pathname});});
window.addEventListener('error',function(e){ if(e && e.target && e.target!==window) return; if(window.__ERR.length<40) window.__ERR.push({m:String(e.message).slice(0,160),f:String(e.filename||'').slice(0,120),ln:e.lineno,href:location.pathname}); });
window.addEventListener('unhandledrejection',function(e){ if(window.__REJ.length<40){ var r=e.reason; window.__REJ.push({m:String(r&&(r.message||r)).slice(0,160),href:location.pathname}); } });`;
const COLLECT = `JSON.stringify({ V: window.__V||[], ERR: window.__ERR||[], REJ: window.__REJ||[], canaryRan: window.__tpCanaryRan===true, href: location.pathname })`;
const wrap = (expr, ms = 12000) => `Promise.race([ Promise.resolve().then(function(){ return (${expr}); }).then(function(r){ return JSON.stringify(r); }, function(e){ return JSON.stringify({ ok:false, detail:'threw: '+String(e&&e.message||e).slice(0,140) }); }), new Promise(function(r){ setTimeout(function(){ r(JSON.stringify({ ok:false, detail:'timeout' })); }, ${ms}); }) ])`;
const commentRanges = (html) => { const out = []; const re = /<!--[\s\S]*?-->/g; let m; while ((m = re.exec(html))) out.push([m.index, m.index + m[0].length]); return out; };
function scriptAudit(raw, headerNonce) {
    const html = raw.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length)); const rg = commentRanges(html);
    let exec = 0, unNonced = 0, mismatched = 0, dataNonced = 0; const re = /<script\b([^>]*)>/gi; let m;
    while ((m = re.exec(html))) { if (rg.some(([a, b]) => m.index >= a && m.index < b)) continue;
        const type = ((m[1].match(/type\s*=\s*["']([^"']*)["']/i) || [])[1] || '').toLowerCase().trim();
        const nonce = (m[1].match(/nonce\s*=\s*["']([^"']*)["']/i) || [])[1];
        if (!type || type === 'text/javascript' || type === 'application/javascript' || type === 'module') { exec++; if (!nonce) unNonced++; else if (nonce !== headerNonce) mismatched++; }
        else if (nonce !== undefined) dataNonced++; }
    return { exec, unNonced, mismatched, dataNonced, placeholder: raw.includes(TOKEN) };
}
function get(p) { return new Promise((resolve) => { const u = new URL(ORIGIN); const req = http.request({ host: u.hostname, port: u.port, path: p, method: 'GET' }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); }); req.on('error', () => resolve(0)); req.end(); }); }

// ---- one load ------------------------------------------------------------------------------------------------------
async function runLoad(br, item) {
    const { targetId } = await br.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
    const children = new Set(); const reqs = new Map(); const docs = []; const canaryLines = new Set(); let docStatus = 0;
    const onMsg = async (m) => {
        const p = m.params || {};
        if (m.method === 'Target.attachedToTarget' && m.sessionId === S) { children.add(p.sessionId); br.send('Network.enable', {}, p.sessionId).catch(() => {}); br.send('Runtime.runIfWaitingForDebugger', {}, p.sessionId).catch(() => {}); return; }
        if (m.sessionId !== S && !children.has(m.sessionId)) return;
        const where = m.sessionId === S ? 'top' : 'child';
        if (m.method === 'Network.requestWillBeSent') { let host = ''; try { host = new URL(p.request.url).hostname; } catch (_) {} reqs.set(m.sessionId + ':' + p.requestId, { host, type: p.type, where, url: p.request.url.slice(0, 160), status: null, blocked: null }); }
        if (m.method === 'Network.responseReceived') { const q = reqs.get(m.sessionId + ':' + p.requestId); if (q) q.status = p.response.status; if (where === 'top' && p.type === 'Document' && p.frameId === targetId) docStatus = p.response.status; }
        if (m.method === 'Network.loadingFailed') { const q = reqs.get(m.sessionId + ':' + p.requestId); if (q) q.blocked = p.blockedReason || (p.canceled ? 'canceled' : p.errorText || 'failed'); }
        if (m.method === 'Fetch.requestPaused' && m.sessionId === S) {
            try {
                const isTopDoc = p.frameId === targetId && p.resourceType === 'Document';
                if (p.responseStatusCode === undefined && p.responseErrorReason === undefined) {          // request stage
                    if (!isTopDoc || !item.cc) return br.send('Fetch.continueRequest', { requestId: p.requestId }, S);
                    const headers = Object.entries(p.request.headers || {}).filter(([k]) => k.toLowerCase() !== 'cf-ipcountry').map(([name, value]) => ({ name, value }));
                    headers.push({ name: 'CF-IPCountry', value: item.cc });
                    return br.send('Fetch.continueRequest', { requestId: p.requestId, headers }, S);
                }
                if (!isTopDoc || !p.responseStatusCode || (p.responseStatusCode >= 300 && p.responseStatusCode < 400)) return br.send('Fetch.continueRequest', { requestId: p.requestId }, S);
                const hs = p.responseHeaders || [];
                const hv = (n) => (hs.filter(h => h.name.toLowerCase() === n).map(h => h.value));
                const csp = hv('content-security-policy'), ro = hv('content-security-policy-report-only');
                const nonce = ((csp[0] || '').match(/'nonce-([^']+)'/) || [])[1] || null;
                const b = await br.send('Fetch.getResponseBody', { requestId: p.requestId }, S);
                let html = b.base64Encoded ? Buffer.from(b.body, 'base64').toString('utf8') : b.body;
                const audit = scriptAudit(html, nonce);
                const hm = html.match(/<head\b[^>]*>/i); let line = null;
                if (hm) { const at = hm.index + hm[0].length; line = html.slice(0, at).split('\n').length; canaryLines.add(line); html = html.slice(0, at) + '<script>window.__tpCanaryRan=true;</script>' + html.slice(at); }
                docs.push({ url: p.request.url.replace(ORIGIN, ''), status: p.responseStatusCode, cspCount: csp.length, roCount: ro.length, strict: /'strict-dynamic'/.test(csp[0] || ''),
                            roEqualsCsp: csp.length === 1 && ro.length === 1 && csp[0] === ro[0], nonce128: !!nonce && Buffer.from(nonce, 'base64').length === 16, canaryLine: line, ...audit });
                const out = hs.filter(h => !/^(content-length|content-encoding)$/i.test(h.name));                // CSP headers untouched
                await br.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: p.responseStatusCode, responseHeaders: out, body: Buffer.from(html, 'utf8').toString('base64') }, S);
            } catch (e) { docs.push({ error: e.message }); try { await br.send('Fetch.continueRequest', { requestId: p.requestId }, S); } catch (_) {} }
        }
    };
    br.on(onMsg);
    for (const d of ['Page', 'Runtime', 'Network']) await br.send(d + '.enable', {}, S).catch(() => {});
    await br.send('Network.setBypassServiceWorker', { bypass: true }, S).catch(() => {});
    await br.send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true }, S).catch(() => {});
    await br.send('Fetch.enable', { patterns: [{ urlPattern: ORIGIN + '/*', resourceType: 'Document', requestStage: 'Request' }, { urlPattern: ORIGIN + '/*', resourceType: 'Document', requestStage: 'Response' }] }, S);
    await br.send('Page.addScriptToEvaluateOnNewDocument', { source: INIT }, S);
    await br.send('Page.navigate', { url: ORIGIN + item.route }, S);
    await sleep(WAIT_MS);
    const ev = async (e, ms) => { try { const r = await br.send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }, S, (ms || 12000) + 5000); return r.result && r.result.value; } catch (err) { return JSON.stringify({ ok: false, detail: 'cdp: ' + err.message }); } };
    const core = {};
    for (const c of item.core) core[c] = JSON.parse(await ev(wrap(CHECKS[c], 8000), 8000) || '{"ok":false,"detail":"null"}');
    const inter = {}; const navInter = [];
    for (const i of item.interactions) { const def = INTERACTIONS[i]; if (def.navigates) { navInter.push(i); continue; } inter[i] = JSON.parse(await ev(wrap(def.expr, def.ms), def.ms) || '{"ok":false,"detail":"null"}'); await sleep(600); }
    await sleep(1500);
    const batches = [JSON.parse(await ev(COLLECT) || '{}')];
    for (const i of navInter) {
        const def = INTERACTIONS[i];
        const r0 = JSON.parse(await ev(wrap(def.expr, def.ms), def.ms) || '{"ok":false}');
        await sleep(def.settle);
        const after = JSON.parse(await ev(wrap(def.verify, 8000)) || '{"ok":false}');
        inter[i] = { ok: !!(r0.ok && after.ok), detail: (r0.detail || '') + ' | after: ' + (after.detail || '') };
        batches.push(JSON.parse(await ev(COLLECT) || '{}'));
    }
    br.off(onMsg);
    await br.send('Target.closeTarget', { targetId }).catch(() => {});

    const V = batches.flatMap(q => q.V || []), ERR = batches.flatMap(q => q.ERR || []), REJ = batches.flatMap(q => q.REJ || []);
    const isCanary = (v) => v.u === 'inline' && v.d === 'script-src-elem' && canaryLines.has(v.ln);
    const enfCanary = V.filter(v => v.disp === 'enforce' && isCanary(v)).length, roCanary = V.filter(v => v.disp !== 'enforce' && isCanary(v)).length;
    const enfOther = V.filter(v => v.disp === 'enforce' && !isCanary(v)), roOther = V.filter(v => v.disp !== 'enforce' && !isCanary(v));
    const all = [...reqs.values()];
    const cspBlocked = all.filter(q => q.where === 'top' && /csp/i.test(String(q.blocked || '')));
    const goodDocs = docs.filter(d => !d.error);
    const headerOk = goodDocs.length >= 1 && docs.every(d => !d.error) && goodDocs.every(d => d.cspCount === 1 && d.roCount === 1 && d.strict && d.roEqualsCsp && d.nonce128 && d.unNonced === 0 && d.mismatched === 0 && d.dataNonced === 0 && !d.placeholder && d.canaryLine !== null);
    const rec = { family: item.family, route: item.route, cc: item.cc, status: docStatus, docs, headerOk,
                  canary: { blockedEnforce: enfCanary, reportedRO: roCanary, ran: batches.some(q => q.canaryRan) },
                  enforcedOther: enfOther, reportOnlyOther: roOther, errors: ERR, rejections: REJ, core, interactions: inter,
                  cspBlocked: cspBlocked.map(q => ({ host: q.host, type: q.type, url: q.url })),
                  hosts: [...new Set(all.filter(q => q.host && q.host !== new URL(ORIGIN).hostname).map(q => q.where + ':' + q.host + ':' + q.type))] };
    rec.pass = docStatus === item.status && headerOk && enfCanary >= goodDocs.length && !rec.canary.ran && enfOther.length === 0 && roOther.length === 0 && ERR.length === 0
               && Object.values(core).every(r => r.ok) && Object.values(inter).every(r => r.ok) && cspBlocked.length === 0;
    return rec;
}

async function worker(wi, items, results) {
    const port = CDP_BASE + wi;
    const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=C:/Users/Tarek/AppData/Local/Temp/claude/p2browser-' + process.pid + '-' + wi, '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
    try {
        let wsu; for (let i = 0; i < 150 && !wsu; i++) { try { const r = await fetch('http://127.0.0.1:' + port + '/json/version', { signal: AbortSignal.timeout(1000) }); if (r.ok) wsu = (await r.json()).webSocketDebuggerUrl; } catch (_) {} if (!wsu) await sleep(300); }
        if (!wsu) throw new Error('chrome ' + wi + ' never came up');
        const br = await CDP.open(wsu);
        for (const item of items) {
            let rec; try { rec = await runLoad(br, item); } catch (e) { rec = { family: item.family, route: item.route, cc: item.cc, pass: false, harnessError: e.message }; }
            results.push(rec);
            const bad = rec.harnessError ? ['HARNESS ' + rec.harnessError] : [
                ...(rec.status !== item.status ? ['status=' + rec.status] : []), ...(!rec.headerOk ? ['headers/nonce'] : []),
                ...(rec.canary.ran ? ['CANARY RAN'] : []), ...(rec.canary.blockedEnforce < 1 ? ['canary not enforced'] : []),
                ...(rec.enforcedOther.length ? ['enforced=' + rec.enforcedOther.length] : []), ...(rec.reportOnlyOther.length ? ['reportOnly=' + rec.reportOnlyOther.length] : []),
                ...(rec.errors.length ? ['jsErrors=' + rec.errors.length] : []), ...(rec.cspBlocked.length ? ['cspBlocked=' + rec.cspBlocked.length] : []),
                ...Object.entries(rec.core).filter(([, r]) => !r.ok).map(([k, r]) => k + '(' + r.detail + ')'), ...Object.entries(rec.interactions).filter(([, r]) => !r.ok).map(([k, r]) => k + '(' + r.detail + ')')];
            console.log('  [w' + wi + ' ' + results.length + '/' + plan.length + '] ' + (rec.pass ? 'PASS ' : 'FAIL ') + item.family.padEnd(18) + (item.route + (item.cc ? ' |' + item.cc : '')).padEnd(46)
                + (rec.harnessError ? '' : ' st=' + rec.status + ' canary(enf/ro/ran)=' + rec.canary.blockedEnforce + '/' + rec.canary.reportedRO + '/' + rec.canary.ran
                + ' core=' + Object.values(rec.core).filter(r => r.ok).length + '/' + Object.keys(rec.core).length + ' inter=' + Object.values(rec.interactions).filter(r => r.ok).length + '/' + Object.keys(rec.interactions).length)
                + (bad.length ? '  :: ' + bad.join(' · ').slice(0, 300) : ''));
        }
        br.close();
    } finally { try { execFileSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }
}

(async () => {
    let server = null;
    if (!REMOTE) {
        const env = { ...process.env, PORT: String(PORT), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539' };
        delete env.TP_ENABLE_SEARCH_TEST;
        server = spawn(process.execPath, ['server.js'], { cwd: ROOT, env, stdio: ['ignore', 'ignore', 'ignore'] });
        let up = false; for (let i = 0; i < 250 && !up; i++) { up = (await get('/health')) === 200; if (!up) await sleep(400); }
        if (!up) { console.log('server not healthy'); process.exit(2); }
    }
    const tree = REMOTE ? 'remote' : execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim().slice(0, 7) + (execFileSync('git', ['status', '--porcelain', '--', 'server.js'], { cwd: ROOT, encoding: 'utf8' }).trim() ? '+dirty server.js' : '');
    console.log('=== PHASE 2 ENFORCEMENT BROWSER MATRIX  origin=' + ORIGIN + '  tree=' + tree + '  loads=' + plan.length + '  workers=' + WORKERS + '  wait=' + WAIT_MS + 'ms ===');
    const results = [];
    try { await Promise.all(Array.from({ length: WORKERS }, (_, wi) => worker(wi, plan.filter((_, i) => i % WORKERS === wi), results))); }
    finally { if (server) try { execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }

    const fams = [...new Set(plan.map(p => p.family))];
    const sum = (arr, f) => arr.reduce((n, r) => n + (f(r) || 0), 0);
    console.log('\nFAMILY               LOADS  PASS  HTTP              ENFORCED  REPORT-ONLY  CANARY enf/ro/ran  JS-ERR  CSP-BLOCKED  CORE      INTERACTIONS');
    for (const fam of fams) {
        const rs = results.filter(r => r.family === fam); const ok = rs.filter(r => !r.harnessError);
        const http = {}; ok.forEach(r => { http[r.status] = (http[r.status] || 0) + 1; });
        const coreOk = sum(ok, r => Object.values(r.core).filter(c => c.ok).length), coreN = sum(ok, r => Object.keys(r.core).length);
        const intOk = sum(ok, r => Object.values(r.interactions).filter(c => c.ok).length), intN = sum(ok, r => Object.keys(r.interactions).length);
        console.log('  ' + fam.padEnd(19) + String(rs.length).padEnd(7) + String(rs.filter(r => r.pass).length).padEnd(6) + JSON.stringify(http).padEnd(18)
            + String(sum(ok, r => r.enforcedOther.length)).padEnd(10) + String(sum(ok, r => r.reportOnlyOther.length)).padEnd(13)
            + (sum(ok, r => r.canary.blockedEnforce) + '/' + sum(ok, r => r.canary.reportedRO) + '/' + ok.filter(r => r.canary.ran).length).padEnd(19)
            + String(sum(ok, r => r.errors.length)).padEnd(8) + String(sum(ok, r => r.cspBlocked.length)).padEnd(13) + (coreOk + '/' + coreN).padEnd(10) + intOk + '/' + intN
            + '   [' + [...new Set(rs.map(r => r.route))].join(' ') + ']');
    }
    const ok = results.filter(r => !r.harnessError);
    const docs = ok.flatMap(r => r.docs.filter(d => !d.error));
    const hostSet = {}; ok.forEach(r => r.hosts.forEach(h => { hostSet[h] = (hostSet[h] || 0) + 1; }));
    const blockedHosts = [...new Set(ok.flatMap(r => r.cspBlocked.map(b => b.host + ' (' + b.type + ')')))];
    const firstBad = (k) => ok.flatMap(r => r[k].map(v => ({ route: r.route, ...v }))).slice(0, 8);
    console.log('\nDOCUMENTS: ' + docs.length + '  enforcing header present ' + docs.filter(d => d.cspCount === 1).length + '  strict ' + docs.filter(d => d.strict).length
        + '  Report-Only === enforcing ' + docs.filter(d => d.roEqualsCsp).length + '  128-bit nonce ' + docs.filter(d => d.nonce128).length
        + '  un-nonced exec scripts ' + sum(docs, d => d.unNonced) + '  nonce mismatches ' + sum(docs, d => d.mismatched) + '  nonce on data blocks ' + sum(docs, d => d.dataNonced) + '  placeholder leaks ' + docs.filter(d => d.placeholder).length);
    console.log('CANARY: injected ' + docs.filter(d => d.canaryLine !== null).length + '  blocked (enforce) ' + sum(ok, r => r.canary.blockedEnforce) + '  reported (report-only copy) ' + sum(ok, r => r.canary.reportedRO) + '  ran ' + ok.filter(r => r.canary.ran).length);
    console.log('ENFORCED (non-canary): ' + sum(ok, r => r.enforcedOther.length) + (sum(ok, r => r.enforcedOther.length) ? '  ' + JSON.stringify(firstBad('enforcedOther')) : ''));
    console.log('REPORT-ONLY (non-canary): ' + sum(ok, r => r.reportOnlyOther.length) + (sum(ok, r => r.reportOnlyOther.length) ? '  ' + JSON.stringify(firstBad('reportOnlyOther')) : ''));
    console.log('JS ERRORS: ' + sum(ok, r => r.errors.length) + (sum(ok, r => r.errors.length) ? '  ' + JSON.stringify(firstBad('errors')) : '') + '   unhandled rejections (informational): ' + sum(ok, r => r.rejections.length));
    console.log('CSP-BLOCKED REQUESTS: ' + sum(ok, r => r.cspBlocked.length) + '   blocked hosts: ' + (blockedHosts.join(', ') || 'NONE'));
    console.log('THIRD-PARTY HOSTS (where:host:type -> loads):');
    Object.entries(hostSet).sort((a, b) => b[1] - a[1]).forEach(([h, n]) => console.log('    ' + h.padEnd(64) + n + (GOOGLE_RE.test(h.split(':')[1]) ? '' : '   (non-Google)')));
    console.log('HARNESS ERRORS: ' + results.filter(r => r.harnessError).length + (results.filter(r => r.harnessError).length ? '  ' + JSON.stringify(results.filter(r => r.harnessError).map(r => r.route + ': ' + r.harnessError)) : ''));
    if (process.env.TP_P2_OUT) fs.writeFileSync(process.env.TP_P2_OUT, JSON.stringify({ origin: ORIGIN, tree, results }, null, 1));
    const passed = results.filter(r => r.pass).length;
    console.log('\nBROWSER MATRIX: ' + passed + '/' + results.length + ' loads PASS  ->  ' + (passed === results.length && results.length === plan.length ? 'PASS' : 'FAIL'));
    process.exit(passed === results.length && results.length === plan.length ? 0 : 1);
})();
