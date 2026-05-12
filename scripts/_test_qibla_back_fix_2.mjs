// QIBLA-BACK-FIX-2 verification.
// Simulates a BFCache restore on a moon page where the DOM was polluted
// with `#page-qibla.active` (the bug we're fixing) and verifies that the
// pageshow listener self-heals the state to `#page-moon.active`.
//
// Mirrors the production handler so we can unit-test without booting the
// whole 22k-LOC app.js bundle.
import { JSDOM } from 'jsdom';
import http from 'node:http';

const fetchUrl = (u) => new Promise((res, rej) =>
    http.get(u, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(b)); }).on('error', rej));

// Reproduce the pageshow handler exactly (URL → expected-page-id +
// normalize active class on .page elements).
function makePageshowHandler(win, doc) {
    return function _pageshowHandler() {
        const _path = win.location.pathname;
        let _expectedId = null;
        if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla(?:-in-[a-z]|$)/.test(_path)) {
            _expectedId = 'page-qibla';
        } else if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:moon-today|moon-in-)/.test(_path)) {
            _expectedId = 'page-moon';
        } else if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?msbaha$/.test(_path)) {
            _expectedId = 'page-tasbih';
        } else if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?azkar$/.test(_path)) {
            _expectedId = 'page-duas';
        } else if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?today-hijri-date$/.test(_path)) {
            _expectedId = 'page-hijri-today';
        } else if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-date\/\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|30)$/.test(_path)) {
            _expectedId = 'page-hijri-day';
        } else if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar\/\d{4}-(?:0[1-9]|1[0-2])$/.test(_path)) {
            _expectedId = 'page-hijri-month';
        } else if (/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar(?:\/\d{4})?$/.test(_path)) {
            _expectedId = 'page-hijri-year';
        } else if (/\/(?:(?:en|fr|tr|ur)\/)?zakat-calculator$/.test(_path)) {
            _expectedId = 'page-zakat';
        } else if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?dateconverter$/.test(_path)) {
            _expectedId = 'page-date-converter';
        } else {
            _expectedId = 'page-prayer-times';
        }
        if (!_expectedId) return;
        const _activeEls = doc.querySelectorAll('.page.active');
        const _activeIds = Array.from(_activeEls).map(p => p.id);
        const _isCorrect = (_activeIds.length === 1 && _activeIds[0] === _expectedId);
        if (!_isCorrect) {
            doc.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const _el = doc.getElementById(_expectedId);
            if (_el) _el.classList.add('active');
        }
    };
}

const SCENARIOS = [
    // [name, urlPath, pre-bfcache-active-ids, expected-after-bfcache-active-ids]
    [
        'A) Moon URL + polluted BFCache (page-qibla active) → heal to page-moon',
        '/moon-today-in-montreal',
        ['page-qibla'],
        ['page-moon'],
    ],
    [
        'B) Moon URL + correct BFCache (page-moon active) → no-op',
        '/moon-today-in-montreal',
        ['page-moon'],
        ['page-moon'],
    ],
    [
        'C) Qibla URL + correct BFCache (page-qibla active) → no-op',
        '/qibla-in-montreal',
        ['page-qibla'],
        ['page-qibla'],
    ],
    [
        'D) Qibla URL + polluted BFCache (page-moon active) → heal to page-qibla',
        '/qibla-in-montreal',
        ['page-moon'],
        ['page-qibla'],
    ],
    [
        'E) Homepage / + polluted (page-qibla active) → heal to page-prayer-times',
        '/',
        ['page-qibla'],
        ['page-prayer-times'],
    ],
    [
        'F) /prayer-times-in-riyadh + polluted (page-moon active) → heal to page-prayer-times',
        '/prayer-times-in-riyadh',
        ['page-moon'],
        ['page-prayer-times'],
    ],
    [
        'G) /zakat-calculator + polluted (page-moon active) → heal to page-zakat',
        '/zakat-calculator',
        ['page-moon'],
        ['page-zakat'],
    ],
    [
        'H) /msbaha + polluted (page-qibla active) → heal to page-tasbih',
        '/msbaha',
        ['page-qibla'],
        ['page-tasbih'],
    ],
    [
        'I) /azkar + polluted (page-moon active) → heal to page-duas',
        '/azkar',
        ['page-moon'],
        ['page-duas'],
    ],
    [
        'J) /today-hijri-date + polluted (page-qibla active) → heal to page-hijri-today',
        '/today-hijri-date',
        ['page-qibla'],
        ['page-hijri-today'],
    ],
    [
        'K) Moon URL + MULTIPLE active (page-moon + page-qibla) → heal to page-moon only',
        '/moon-today-in-montreal',
        ['page-moon', 'page-qibla'],
        ['page-moon'],
    ],
    [
        'L) Moon URL + ZERO active → heal to page-moon',
        '/moon-today-in-montreal',
        [],
        ['page-moon'],
    ],
];

let pass = 0, fail = 0;
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' QIBLA-BACK-FIX-2 — pageshow normalization verification');
console.log('═══════════════════════════════════════════════════════════════════════');

for (const [label, urlPath, preActive, expectedActive] of SCENARIOS) {
    // Fetch the matching SSR for this URL so the `.page` wrappers
    // present in the DOM mirror what BFCache would freeze + restore.
    // BFCache snapshots the OUTGOING page's DOM — so if we Back into
    // /moon-today-in-X, the SSR for that URL is what we work with.
    const html = await fetchUrl('http://localhost:8080' + urlPath);
    const dom = new JSDOM(html, { url: 'http://localhost:8080' + urlPath });
    const win = dom.window;
    const doc = win.document;

    // Set up the "BFCache-restored" DOM state: strip all .active,
    // then add the polluted state.
    doc.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    for (const id of preActive) {
        doc.getElementById(id)?.classList.add('active');
    }

    // Fire the pageshow handler (simulates BFCache restore).
    const handler = makePageshowHandler(win, doc);
    handler();

    // Read the post-normalization state.
    const gotActive = Array.from(doc.querySelectorAll('.page.active')).map(p => p.id).sort();
    const want = [...expectedActive].sort();
    const ok = (gotActive.length === want.length) && gotActive.every((id, i) => id === want[i]);
    if (ok) pass++; else fail++;
    console.log(`\n${label}`);
    console.log(`   url: ${urlPath}`);
    console.log(`   pre: [${preActive.join(', ')}]`);
    console.log(`   got: [${gotActive.join(', ')}]   ${ok ? '✓' : '✗ expected [' + expectedActive.join(', ') + ']'}`);
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
