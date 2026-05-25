// Service Worker: cache-first for versioned static assets, network-first for HTML, stale-while-revalidate for /api/*
// Bump CACHE_VERSION whenever precache list changes
const CACHE_VERSION = 'v337';
const STATIC_CACHE  = `tp-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `tp-runtime-${CACHE_VERSION}`;

// الأصول التي تُحمَّل بشكل متكرر ومفيد كاشها محلياً
// SW-PRECACHE-ALIGN-1 (2026-05-25):
//   • Re-aligned every PRECACHE_URLS entry with the live ?v= cache-busters
//     in index.html. The previous list had drifted by many bumps (style.css
//     178 vs 439, i18n.js 134 vs 186, app.js 475 vs 713, etc.). A stale
//     ?v= here means addAll() prefetches a URL the browser never requests,
//     so the cache is wasted AND every runtime request still goes to the
//     network — exactly what precache was supposed to prevent.
//   • Bumped CACHE_VERSION v336 → v337 so activate() purges the previous
//     STATIC_CACHE that holds the stale versions.
//   • NOT precaching /fonts/AmiriQuran-Regular.woff2 — the woff2 binary
//     is a pending manual asset (see fonts/README.md). Adding a missing
//     path would make addAll() reject and skip the entire precache. Add
//     a line here in Phase 2 once the file ships.
//   • /js/duas.js is kept until Phase 2 (compat shim — see js/duas.js).
const PRECACHE_URLS = [
    '/css/style.css?v=439',
    '/js/i18n.js?v=186',
    '/js/prayer-times.js?v=48',
    '/js/hijri-date.js?v=43',
    '/js/qibla.js?v=44',
    '/js/moon.js?v=52',
    '/js/moon-chart.js?v=9',
    '/js/duas.js?v=43',
    '/js/azkar-data.js?v=2',
    '/js/app.js?v=713',
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
