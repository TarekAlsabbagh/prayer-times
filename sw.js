// Service Worker: cache-first for versioned static assets, network-first for HTML, stale-while-revalidate for /api/*
// Bump CACHE_VERSION whenever precache list changes
// CONTENT-HYDRATION-FLICKER-DIAG-1 fix (2026-05-25):
//   v336 → v338 (skipping v337 which was the reverted SW-PRECACHE-ALIGN-1
//   commit eef38f6 → reverted by eab24e9). Bumping here forces SW activate()
//   to purge the previous STATIC_CACHE so clients pick up the new
//   index.html (sidebar Azkar/Hijri text aligned with i18n AR values) and
//   the new server.js SSR output (single .page.active on /azkar* and
//   /qibla) on next page load.
//   PRECACHE_URLS deliberately left untouched per user directive: don't
//   re-touch them unless there's an actual new diff (covered separately
//   if/when SW-PRECACHE-ALIGN is re-shipped).
// CONTENT-HYDRATION-FLICKER-DIAG-1-B (2026-05-25):
//   v338 → v339. Extends Path A to the homepage `.mit-item` mini-tools
//   row (#mini-islamic-tools). 3 more HTML literals aligned with their
//   i18n AR values so the labels don't flicker after setLanguage('ar'):
//     mit.qibla     "اتّجاه القبلة"  → "القبلة"
//     mit.hijri     "التاريخ الهجري" → "التاريخ الهجريّ"  (add shadda)
//     mit.moon      "أوقات القمر"   → "القمر اليوم"
//   mit.date_converter already matched, untouched.
// CONTENT-HYDRATION-FLICKER-DIAG-1-C (2026-05-25):
//   v339 → v340. Four more AR HTML→i18n alignments uncovered by user:
//     mit.title           "أدوات إسلاميّة سريعة" → "أدوات إسلامية سريعة" (drop shadda on م)
//     nav.qibla (sidebar) "اتجاه القبلة"        → "إتجاه القبلة"        (add hamza below alif)
//     nav.tasbih          "المسبحة الإلكترونيّة" → "المسبحة الإلكترونية" (drop shadda on ي)
//     nav.hijri_calendar  "التقويم الهجريّ"      → "التقويم الهجري"      (drop shadda on ي)
//   Note: nav.qibla i18n value has the orthographically non-standard
//   form "إتجاه" (hamza below alif). Standard Arabic is "اتجاه" (verbal
//   noun of اتّجه, no initial hamza). Kept the i18n value untouched per
//   policy (don't edit i18n in this phase); a future cleanup pass on
//   js/i18n.js can correct this if desired. HTML aligned to current
//   i18n value to stop the visible flicker.
// CONTENT-HYDRATION-FLICKER-DIAG-1-D (2026-05-25):
//   v340 → v341. Comprehensive Path-A scan of every `data-i18n="..."`
//   text binding in index.html (873 bindings) vs the AR block in
//   js/i18n.js (1319 keys). Of 112 detected mismatches the user
//   approved scope D + T (52 alignments) and explicitly deferred:
//     • TPL  (19) — AR contains `{placeholder}` literals (would expose
//                    `{city}` in SSR output, breaks dynamic interpolation)
//     • EMO  (22) — emoji prefix difference between HTML and AR (kept
//                    HTML as-is to avoid changing SSR decoration)
//     • SEM  (19) — semantic divergence: digit mismatch, length ratio
//                    <0.7 (suggests outdated i18n or hardcoded HTML)
//   Implementation: scripts/_diag1d_safe_apply.mjs --apply rewrote the
//   text-content of each safe binding byte-for-byte. SSR active-page
//   integrity preserved on /, /azkar, /azkar/morning-azkar, /qibla,
//   /moon-today, /today-hijri-date. Daily-reset E2E 16/16 passed.
// CONTENT-HYDRATION-FLICKER-DIAG-1-E (2026-05-25):
//   v341 → v342. Two targeted fixes user uncovered on /moon-today-in-{city}:
//     • js/app.js — moved the today-sub fill OUT of the `_isDatePage`
//       guard so #moon-date-today-sub gets the formatted date on
//       /moon-today-in-{city} too (was permanently empty). The pre-
//       existing dated-page block still overrides with long-form date
//       on /moon-in-{city}/{YYYY-MM-DD}.
//     • index.html country.sa: "السعودية" → "المملكة العربية السعودية"
//       (SEM bucket item — user explicitly approved this one specific
//       alignment after the DIAG-1-D deferred-SEM batch).
//   Cache-buster: app.js?v=713 → ?v=714 (js/app.js touched).
// CONTENT-HYDRATION-FLICKER-DIAG-1-F (2026-05-25):
//   v342 → v343. #loc-hero-title (home H1) shadda flicker — the JS-side
//   rewrite at js/app.js:12737 wrote a no-shadda string AFTER the i18n
//   binder filled the WITH-shadda value from i18n.js, causing the visible
//   "هجريّ → هجري" swap on every homepage load. Three layers aligned to
//   the WITH-shadda canonical form:
//     • js/app.js   _genericByLang.ar   (homepage H1 JS overwrite)
//     • server.js   _h1Text.ar          (#page-h1 SSR injection)
//     • js/i18n.js  home.tagline AR     (already with shadda — unchanged)
//     • index.html  L380 literal        (already with shadda — unchanged)
//   Cache-buster: app.js?v=714 → ?v=715 (js/app.js touched).
const CACHE_VERSION = 'v343';
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
