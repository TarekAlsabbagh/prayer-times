// GLOBAL-PLACE-SEARCH-TEST-PAGE-A verification.
// Tests the new /api/search-place endpoint + /search-test page.
//
// Hard contract: every result returned MUST carry the prayer-times-ready
// shape (slug + lat + lng + timezone + countryCode + displayName). The
// prayer-times pages compute from coords; a result missing any field is
// useless and must never surface.
//
// Pre-req: `node server.js` running on localhost:8080.

import http from 'node:http';

function get(path) {
    return new Promise((resolve) => {
        http.get({ host: 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, body, headers: r.headers }));
        }).on('error', () => resolve({ status: 0, body: '', headers: {} }));
    });
}

function search(q, lang = 'ar') {
    return get('/api/search-place?q=' + encodeURIComponent(q) + '&lang=' + lang).then(r => {
        try { return JSON.parse(r.body); } catch (_) { return { results: [] }; }
    });
}

function isPrayerTimesReady(r) {
    if (!r || typeof r !== 'object') return false;
    if (typeof r.slug !== 'string' || !r.slug) return false;
    if (typeof r.countryCode !== 'string' || !/^[a-z]{2}$/.test(r.countryCode)) return false;
    if (!isFinite(r.lat) || r.lat < -90 || r.lat > 90) return false;
    if (!isFinite(r.lng) || r.lng < -180 || r.lng > 180) return false;
    if (typeof r.timezone !== 'string' || !r.timezone) return false;
    if (typeof r.displayName !== 'string' || !r.displayName) return false;
    return true;
}

let pass = 0, fail = 0;
function check(label, ok, extra) {
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} ${label}${extra ? '   ' + extra : ''}`);
}

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' GLOBAL-PLACE-SEARCH-TEST-PAGE-A — /api/search-place + /search-test');
console.log('═══════════════════════════════════════════════════════════════════════');

// 1. /search-test page exists, has noindex, references the new input
const pageRes = await get('/search-test');
check('/search-test HTTP 200', pageRes.status === 200, `(got ${pageRes.status})`);
check('/search-test has noindex meta', /<meta name="robots" content="noindex/i.test(pageRes.body));
check('/search-test has search-test-input', /id="search-test-input"/.test(pageRes.body));
check('/search-test reuses cps-input class', /class="cps-input"/.test(pageRes.body));
check('/search-test has X-Robots-Tag header', /noindex/i.test(pageRes.headers['x-robots-tag'] || ''));

// 2. Endpoint smoke tests
const cases = [
    ['Riyadh',        'sa', 'الرياض',       'Asia/Riyadh'],
    ['الرياض',         'sa', 'الرياض',       'Asia/Riyadh'],
    ['Mecca',         'sa', 'مكة المكرمة',  'Asia/Riyadh'],
    ['مكة',           'sa', 'مكة المكرمة',  'Asia/Riyadh'],
    ['Jeddah',        'sa', 'جدة',          'Asia/Riyadh'],
    ['Khafji',        'sa', 'الخفجي',       'Asia/Riyadh'],
    ['الخفجي',         'sa', 'الخفجي',       'Asia/Riyadh'],
    ['بقيق',           'sa', 'بقيق',         'Asia/Riyadh'],
    ['حفر الباطن',     'sa', 'حفر الباطن',   'Asia/Riyadh'],
    ['Paris',         'fr', 'باريس',        'Europe/Paris'],
    ['London',        'gb', 'لندن',         'Europe/London'],
    ['Cairo',         'eg', 'القاهرة',      'Africa/Cairo'],
    ['Istanbul',      'tr', 'إسطنبول',      'Europe/Istanbul'],
    ['Montreal',      'ca', 'مونتريال',     'America/Toronto'],
];

console.log('\n── Endpoint results (lang=ar) ──');
for (const [query, expectCC, expectName, expectTZ] of cases) {
    const data = await search(query, 'ar');
    const results = (data && Array.isArray(data.results)) ? data.results : [];
    const top = results[0];
    if (!top) {
        fail++;
        console.log(`✗ "${query}" → no results`);
        continue;
    }
    const ready = isPrayerTimesReady(top);
    const okCC   = top.countryCode === expectCC;
    const okName = top.displayName === expectName;
    const okTZ   = top.timezone === expectTZ;
    const ok = ready && okCC && okName && okTZ;
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} "${query}" → ${top.displayName} (cc=${top.countryCode}, tz=${top.timezone}, lat=${top.lat}, lng=${top.lng})${ok ? '' : ` ready=${ready} cc=${okCC} name=${okName} tz=${okTZ}`}`);
}

// 3. Empty/random query → empty array, not 404 or error
console.log('\n── No-match queries ──');
const empty = await search('zzzfakegarbage', 'en');
check('zzz query → results=[]', Array.isArray(empty.results) && empty.results.length === 0);

const empty2 = await search('', 'ar');
check('empty query → results=[]', Array.isArray(empty2.results) && empty2.results.length === 0);

// 4. Per-language localization
console.log('\n── Per-language displayName ──');
const langCases = [
    ['Riyadh', 'en', 'Riyadh'],
    ['Riyadh', 'fr', 'Riyad'],
    ['Riyadh', 'de', 'Riad'],
    ['Riyadh', 'tr', 'Riyad'],
    ['Riyadh', 'ar', 'الرياض'],
    ['Paris',  'fr', 'Paris'],
    ['Paris',  'ar', 'باريس'],
    ['Paris',  'es', 'París'],
    ['London', 'fr', 'Londres'],
];
for (const [q, lang, expect] of langCases) {
    const data = await search(q, lang);
    const top = data.results && data.results[0];
    const ok = top && top.displayName === expect;
    check(`"${q}" lang=${lang} → "${expect}"`, ok, top ? `(got "${top.displayName}")` : '(no result)');
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
