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
// AZKAR-MORNING-CLS-EDU-SECTION-FIX-1 (2026-05-26):
//   v338 → v339. Single-rule fix for the Lighthouse CLS culprit
//   identified on /azkar/morning-azkar (score 0.343).
//   Root cause: #azkar-morning-list is empty in SSR (the 25 dhikr
//   cards are mounted by _loadAzkarMorning() in app.js after
//   DOMContentLoaded). Without reserved height, .azkar-edu-section
//   below it shifts down ~9700px on every load.
//   Fix: reserve min-height on #azkar-morning-list so the edu / faq
//   / events sections below stay at a stable Y position across the
//   SSR → JS hydration boundary. No layout change, no JS touch.
//   Cache-buster: css/style.css?v=441 → ?v=442.
const CACHE_VERSION = 'v339';
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
