// Service Worker: cache-first for versioned static assets, network-first for HTML, stale-while-revalidate for /api/*
// Bump CACHE_VERSION whenever precache list changes
// AZKAR-MORNING-DARK-MODE-POLISH-2 (2026-05-25):
//   v336 → v337. Re-introduces dark-mode contrast polish for
//   /azkar/morning-azkar (wiped by FLICKER-FIXES-ROLLBACK-TO-3eae0b5).
//   Only css/style.css touched: new dark-mode block (~80 lines) at
//   line 8460+ scoped under html[data-theme="dark"]. NO change to body
//   background or general site palette. NO change to light mode. NO
//   change to layout/JS/counter/daily-reset.
//   Cache-buster: css/style.css?v=439 → ?v=440.
// AZKAR-MORNING-PHASE-3-COMPOSITE (2026-05-25):
//   v337 → v338. Re-introduces 4 polish waves wiped by FLICKER-FIXES-
//   ROLLBACK-TO-3eae0b5, in one ordered composite:
//     1. AZKAR-RESET-SCROLL-TO-TOP-2 — reset-all flow jumps to
//        #azkar-page-top using offset-aware scroll
//     2. AZKAR-MOBILE-STICKY-OFFSET-2 — _azkarScrollToCard() replaces
//        raw scrollIntoView in auto-advance; scroll-margin-top bumped
//        to 200/190/130 per breakpoint to clear sticky-progress bar
//     3. AZKAR-MORNING-SEO-TITLE-DESC-2 — AR title 63→52 chars + AR
//        desc 114→122 chars per SEOptimer (50-60 / 120-160 windows)
//     4. AZKAR-MORNING-KEYWORD-CONSISTENCY-1 — H2 + intro paragraph
//        before dhikr list to bridge أذكار الصباح/التكرار/المصدر; counter
//        prompt shortened ("اضغط للعدّ" → "عدّ" visible, full form on
//        aria-label); 2 FAQ questions reworded around التكرار/المصادر
//   Cache-busters: app.js?v=712 → ?v=713, css/style.css?v=440 → ?v=441.
// AZKAR-MORNING-SSR-RENDER-LIST-1 (2026-05-26):
//   v338 → v339. Root-cause fix for the Lighthouse CLS culprit identified
//   in AZKAR-MORNING-CLS-ROOT-FIX-OPTIONS-1.
//   Before: #azkar-morning-list was EMPTY in SSR HTML; _loadAzkarMorning()
//   in app.js mounted 25 dhikr cards after DOMContentLoaded, pushing
//   .azkar-edu-section ~9700px down on every load (CLS 0.343).
//   Now: server.js SSR-renders all 25 cards into the list via a new
//   _buildAzkarMorningListHtml() helper that loads data from
//   js/azkar-data.js into a Function sandbox at startup. app.js detects
//   the SSR marker (data-ssr-rendered="1") and switches to hydration
//   only — binds handlers + applies localStorage state on the existing
//   DOM. NO min-height hack, NO layout reservation. CLS = 0 because
//   the content is in the SSR HTML at first paint.
//   Bonus: Googlebot now sees all 25 dhikr + sources + virtues without
//   running JS — major SEO win for Keyword Consistency too.
//   Cache-buster: js/app.js?v=713 → ?v=714.
// AZKAR-EVENING-PHASE-1 (2026-05-26):
//   v339 → v340. New /azkar/evening-azkar page following the
//   AZKAR-READING-PAGE-TEMPLATE-V1 contract verbatim:
//     • 23 evening dhikr added to js/azkar-data.js (SSR-loaded)
//     • SSR-rendered list (data-ssr-rendered="1", no client-render shift)
//     • Independent localStorage key: azkar.progress.evening
//     • SEO title 52 chars + desc 122 chars (canonical template)
//     • H1 = "أذكار المساء" + single-active-page strip
//     • Counter / undo / reset / hydration cloned from morning
//     • Dark mode + mobile-sticky-offset CSS shared with morning
//     • New _loadAzkarEvening + _hydrateAzkarEveningCards in app.js
//   Cache-busters: js/app.js?v=714 → ?v=715,
//                  js/azkar-data.js?v=2 → ?v=3,
//                  css/style.css?v=441 → ?v=442.
// AZKAR-EVENING-PAGESHOW-FIX-1 (2026-05-26):
//   v340 → v341. Critical fix: js/app.js pageshow handler (BFCache
//   restorer at line 10828) had no regex for /azkar/evening-azkar,
//   so the fallback branch fired and forced #page-prayer-times active.
//   User-visible symptom: visiting /azkar/evening-azkar flashed the
//   evening page for ~1s then redirected to the homepage.
//   Fix: added the evening pattern alongside morning. NO other change.
//   Cache-buster: js/app.js?v=715 → ?v=716.
// AZKAR-PRAYER-PHASE-1 (2026-05-26):
//   v341 → v342. New /azkar/prayer-azkar page (17 dhikr covering wudu,
//   mosque entry/exit, ruku, sujud, tashahhud, qunut, post-salam, witr),
//   following the AZKAR-READING-PAGE-TEMPLATE-V1 contract verbatim
//   (clone of evening with category='prayer', storage key 'azkar.progress.prayer',
//   SSR-rendered list, BFCache restorer + SPA activator branches added in app.js).
//   Hub `/azkar` now activates the prayer card (replaces former after-prayer
//   "soon" placeholder). Morning + evening edu-link grids updated to add the
//   prayer cross-link. Custom SEO title/desc per user spec (different from
//   the canonical morning/evening template).
//   Cache-busters: js/app.js?v=716 → ?v=717,
//                  js/azkar-data.js?v=3 → ?v=4,
//                  css/style.css?v=442 → ?v=443.
// MOON-HERO-MOBILE-CTA-FIX-2 (2026-05-26):
//   v344 → v345. Long-language safety: remove the strict
//   `max-height: 72px !important` on `#page-moon .qibla-hub-geo-btn
//   / .qibla-hub-pick-btn` introduced in MOON-HERO-MOBILE-CTA-FIX-1.
//   Replaced with `max-height: none !important`. Reason: DE / BN / FR /
//   TR labels can wrap to 2 lines on narrow viewports (≤360px), and a
//   72px ceiling would crop the second line. The square-card bug stays
//   fixed because `height: auto !important` + `aspect-ratio: auto
//   !important` + the grid→flex-column conversion still defeat the
//   legacy `height: 100%` stretch. Vertical compactness is preserved
//   by padding + line-height instead of capping the height.
//   Scope unchanged (#page-moon only). Desktop unchanged.
//   Cache-buster: css/style.css?v=444 → ?v=445.
// ARIA-SUNRISE-FIX-1 (2026-05-26):
//   v343 → v344. Semantic fix: sunrise (الشروق) is NOT a prayer.
//   Previously updatePrayerCardsSEO() in js/app.js emitted
//   `aria-label="موعد صلاة الشروق اليوم في {city}"` for the sunrise card,
//   which is semantically wrong (the sun-rise event is not one of the
//   five obligatory prayers). Screen readers + search engines now see:
//     • Sunrise card: "وقت الشروق اليوم في {city}" / "Sunrise time today
//       in {city}" — across all 10 supported langs.
//     • The five prayer cards: unchanged ("موعد صلاة {الصلاة} اليوم في {city}").
//   Side-effect cleanup: the early-return `if (!cityLabel) return;` was
//   scoped down so prayer cards get a cityless fallback label even before
//   the city resolves (screen readers never read a stale SSR default).
//   Time value is never included in aria-label/title (already rendered
//   inside .prayer-time, no need to duplicate numeric data).
//   Cache-buster: js/app.js?v=717 → ?v=718.
// MOON-HERO-MOBILE-CTA-FIX-1 (2026-05-26):
//   v342 → v343. CSS-only mobile responsive fix for /moon-today hero.
//   The primary "use my location" CTA was rendering as a giant ~square
//   card on mobile (≤767px); the secondary "pick city manually" button
//   was barely visible. Hero contents also overflowed horizontally.
//   Added a #page-moon-scoped @media (max-width: 767px) block that:
//     • Forces .qibla-dual-cta to flex-column (overrides legacy grid).
//     • Caps button geometry (min-height 56px, max-height 72px,
//       height: auto, aspect-ratio: auto) — defeats the legacy
//       `height: 100%` stretch that produced the square card.
//     • Pins width/box-sizing on hero wrappers + adds overflow-x: hidden
//       so chrome no longer crops at L/R viewport edges.
//   Scope guard: every selector is prefixed with #page-moon. The same
//   .qibla-hub-geo-btn / .qibla-hub-pick-btn / .qibla-dual-cta classes
//   are reused on /qibla — those pages remain untouched. Desktop also
//   untouched (rule body sits entirely inside the mobile @media query).
//   Cache-buster: css/style.css?v=443 → ?v=444.
const CACHE_VERSION = 'v345';
const STATIC_CACHE  = `tp-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `tp-runtime-${CACHE_VERSION}`;

// الأصول التي تُحمَّل بشكل متكرر ومفيد كاشها محلياً
// AZKAR-RESTRUCTURE-MORNING-PHASE-1 (2026-05-25):
//   • Added /js/azkar-data.js — new bundle that drives /azkar hub and
//     /azkar/morning-azkar. Without precache, a returning user with the
//     SW already installed would not pick up the new file until the next
//     network request.
//   • Bumped CACHE_VERSION v335 → v336 so the SW activate step purges
//     the previous caches.
//   • NOT precaching /fonts/AmiriQuran-Regular.woff2 — the woff2 binary
//     is a pending manual asset (see fonts/README.md). Adding a missing
//     path would make addAll() reject and skip the entire precache. Add
//     a line here in Phase 2 once the file ships.
//   • /js/duas.js is kept until Phase 2 (compat shim — see js/duas.js).
const PRECACHE_URLS = [
    '/css/style.css?v=178',
    '/js/i18n.js?v=134',
    '/js/prayer-times.js?v=47',
    '/js/hijri-date.js?v=42',
    '/js/qibla.js?v=44',
    '/js/moon.js?v=52',
    '/js/moon-chart.js?v=7',
    '/js/duas.js?v=43',
    '/js/azkar-data.js?v=2',
    '/js/app.js?v=475',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    // تجاهل الطلبات عبر الأصل (cross-origin)
    if (url.origin !== self.location.origin) return;

    // 1) أصول ثابتة versioned (لها ?v=N) → cache-first
    const isVersionedStatic =
        /\.(?:css|js)$/i.test(url.pathname) && url.searchParams.has('v');

    if (isVersionedStatic) {
        event.respondWith(
            caches.match(req).then((cached) => {
                if (cached) return cached;
                return fetch(req).then((resp) => {
                    if (resp.ok) {
                        const copy = resp.clone();
                        caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => {});
                    }
                    return resp;
                }).catch(() => cached);
            })
        );
        return;
    }

    // 2) /api/* → stale-while-revalidate (شبكة أولاً، ثم كاش فالباك)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            caches.open(RUNTIME_CACHE).then((cache) =>
                cache.match(req).then((cached) => {
                    const fetchPromise = fetch(req).then((resp) => {
                        if (resp && resp.ok) cache.put(req, resp.clone()).catch(() => {});
                        return resp;
                    }).catch(() => cached);
                    return cached || fetchPromise;
                })
            )
        );
        return;
    }

    // 3) HTML والصفحات → network-first مع fallback كاش
    if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
        event.respondWith(
            fetch(req).then((resp) => {
                if (resp && resp.ok) {
                    const copy = resp.clone();
                    caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
                }
                return resp;
            }).catch(() => caches.match(req))
        );
    }
});
