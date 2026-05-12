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
check('/search-test has visible input element', /<input[^>]*id="search-test-input"/.test(pageRes.body));
check('/search-test has search-test-suggestions dropdown', /id="search-test-suggestions"/.test(pageRes.body));
check('/search-test does NOT depend on html.city-page', !/class="city-page-search"/.test(pageRes.body));
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

// 3b. LANG-1 — full 10-language schema verification for a curated place.
//      Riyadh has explicit `names` for all 10 langs in curated-places.json;
//      assert the API returns the right displayName + countryName per lang.
console.log('\n── LANG-1: curated Riyadh in all 10 langs ──');
const riyadhExpected = {
    ar: { display: 'الرياض',     country: 'المملكة العربية السعودية' },
    en: { display: 'Riyadh',     country: 'Saudi Arabia' },
    fr: { display: 'Riyad',      country: 'Arabie saoudite' },
    de: { display: 'Riad',       country: 'Saudi-Arabien' },
    tr: { display: 'Riyad',      country: 'Suudi Arabistan' },
    ur: { display: 'ریاض',       country: 'سعودی عرب' },
    id: { display: 'Riyadh',     country: 'Arab Saudi' },
    es: { display: 'Riad',       country: 'Arabia Saudí' },
    bn: { display: 'রিয়াদ',     country: 'সৌদি আরব' },
    ms: { display: 'Riyadh',     country: 'Arab Saudi' },
};
for (const lang of Object.keys(riyadhExpected)) {
    const exp = riyadhExpected[lang];
    const r = await get('/api/search-place?q=Riyadh&lang=' + lang);
    const top = (JSON.parse(r.body).results || [])[0];
    const okDisplay = top && top.displayName === exp.display;
    const okCountry = top && top.countryName === exp.country;
    const ok = okDisplay && okCountry;
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} Riyadh lang=${lang} → display="${top?.displayName}" country="${top?.countryName}"${ok ? '' : '   exp: display="' + exp.display + '" country="' + exp.country + '"'}`);
}

// 3c. LANG-1 — external result must have countryName localized via
//      Intl.DisplayNames even when Nominatim doesn't provide name:lang
//      for the city.
console.log('\n── LANG-1: external اللطامنة countryName in 10 langs ──');
const latamnehCountryExpected = {
    ar: 'سوريا', en: 'Syria', fr: 'Syrie', de: 'Syrien',
    tr: 'Suriye', ur: 'شام', id: 'Suriah', es: 'Siria',
    bn: 'সিরিয়া', ms: 'Syria',
};
for (const lang of Object.keys(latamnehCountryExpected)) {
    const exp = latamnehCountryExpected[lang];
    const r = await get('/api/search-place?q=' + encodeURIComponent('اللطامنة') + '&lang=' + lang);
    const top = (JSON.parse(r.body).results || [])[0];
    const ok = top && top.countryName === exp;
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} اللطامنة lang=${lang} → country="${top?.countryName}"${ok ? '' : '   expected "' + exp + '"'}`);
}

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

// 5. PHASE B — external fallback for queries NOT in curated.
// These should hit Nominatim from the server and come back with full
// prayer-times-ready contract (lat/lng/timezone/countryCode/slug).
// Browser code (none here) must never call Nominatim directly.
console.log('\n── PHASE B: external fallback (server-side Nominatim) ──');
const externalCases = [
    // [query, expectCC, expectTZ-contains]   (timezone string check is partial because phase-B uses cc-based fallback)
    ['اللطامنة',     'sy', 'Asia/Damascus'],
    ['الأتارب',       'sy', 'Asia/Damascus'],
    ['السفيرة',       'sy', 'Asia/Damascus'],
    ['موبتي',         'ml', 'Africa/Bamako'],
    ['Le Pontet',     'fr', 'Europe/Paris'],
    ['Granada',       'es', 'Europe/Madrid'],
    ['Toledo',        'es', 'Europe/Madrid'],
];
for (const [query, expectCC, expectTZ] of externalCases) {
    const path = '/api/search-place?q=' + encodeURIComponent(query) + '&lang=ar';
    const r = await get(path);
    const data = (() => { try { return JSON.parse(r.body); } catch (_) { return { results: [] }; } })();
    const top = (data.results || [])[0];
    if (!top) {
        fail++;
        console.log(`✗ "${query}" → no external results`);
        continue;
    }
    const ready = isPrayerTimesReady(top);
    const okCC  = top.countryCode === expectCC;
    const okTZ  = top.timezone === expectTZ;
    const ok = ready && okCC && okTZ;
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} "${query}" → "${top.displayName}" (cc=${top.countryCode}, tz=${top.timezone}, slug=${top.slug})${ok ? '' : ` ready=${ready} okCC=${okCC} okTZ=${okTZ}`}`);
}

// 5b. PHASE B2 — multi-timezone countries must resolve to the CORRECT
//      regional IANA timezone via tz-lookup (lat/lng → tz), NOT just
//      the country's primary. Hardest cases: US (multiple), Russia
//      (11 zones), Canada, Australia.
console.log('\n── PHASE B2: lat/lng → IANA timezone (multi-tz countries) ──');
const tzCases = [
    ['Montreal',    'America/Toronto'],
    ['Vancouver',   'America/Vancouver'],
    ['New York',    'America/New_York'],
    ['Los Angeles', 'America/Los_Angeles'],
    ['Chicago',     'America/Chicago'],
    ['Moscow',      'Europe/Moscow'],
    ['Vladivostok', 'Asia/Vladivostok'],
    ['Sydney',      'Australia/Sydney'],
    ['Perth',       'Australia/Perth'],
];
for (const [query, expectTZ] of tzCases) {
    const r = await get('/api/search-place?q=' + encodeURIComponent(query) + '&lang=en');
    const data = (() => { try { return JSON.parse(r.body); } catch (_) { return { results: [] }; } })();
    const top = (data.results || [])[0];
    const ok = top && top.timezone === expectTZ;
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} "${query}" → ${top ? top.timezone : '(no result)'}${ok ? '' : '   expected ' + expectTZ}`);
}

// 6. X-Search-Source header must reflect curated vs external
console.log('\n── X-Search-Source header sanity ──');
const r1 = await get('/api/search-place?q=Riyadh&lang=en');
check('Riyadh → X-Search-Source: curated', String(r1.headers['x-search-source'] || '') === 'curated');
const r2 = await get('/api/search-place?q=' + encodeURIComponent('اللطامنة') + '&lang=ar');
check('اللطامنة → X-Search-Source: external', String(r2.headers['x-search-source'] || '') === 'external');

// 7. POI filtering — random POI-only query should return [] (no shop/road leak)
console.log('\n── POI filtering ──');
const poiCheck = await get('/api/search-place?q=' + encodeURIComponent('zzzzz_not_a_real_place_xyz') + '&lang=en');
const poiData = (() => { try { return JSON.parse(poiCheck.body); } catch (_) { return { results: [] }; } })();
check('garbage query returns []', Array.isArray(poiData.results) && poiData.results.length === 0);

// 7c. PHASE C — /api/place-selected validator + graceful degradation.
//     Without SUPABASE env vars (test env), the endpoint must:
//       - REJECT invalid payloads with 400
//       - REJECT POI types (restaurant, road, shop, …)
//       - ACCEPT valid payloads with 200 + persisted:false
console.log('\n── PHASE C: /api/place-selected validator (no Supabase env) ──');

function post(path, body) {
    return new Promise((resolve) => {
        const data = JSON.stringify(body);
        const req = http.request({
            host: 'localhost', port: 8080, path,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        }, r => {
            let buf = '';
            r.on('data', c => buf += c);
            r.on('end', () => resolve({ status: r.statusCode, body: buf }));
        });
        req.on('error', () => resolve({ status: 0, body: '' }));
        req.write(data);
        req.end();
    });
}

const validPlace = {
    slug: 'test-city-xyz', type: 'city', countryCode: 'sa',
    lat: 24.7, lng: 46.6, timezone: 'Asia/Riyadh',
    names: { en: 'Test City', ar: 'مدينة اختبار' }
};

let r;
r = await post('/api/place-selected', { foo: 'bar' });
check('invalid payload {foo:bar} → 400', r.status === 400);

r = await post('/api/place-selected', { ...validPlace, type: 'restaurant' });
check('POI (type=restaurant) → rejected', r.status === 400);

r = await post('/api/place-selected', { ...validPlace, type: 'road' });
check('POI (type=road) → rejected', r.status === 400);

r = await post('/api/place-selected', { ...validPlace, type: 'shop' });
check('POI (type=shop) → rejected', r.status === 400);

r = await post('/api/place-selected', { ...validPlace, countryCode: 'FRA' });
check('invalid cc (FRA) → 400', r.status === 400);

r = await post('/api/place-selected', { ...validPlace, lat: 200 });
check('invalid lat (200) → 400', r.status === 400);

r = await post('/api/place-selected', { ...validPlace, slug: 'TEST_CITY!' });
check('invalid slug (uppercase/underscore) → 400', r.status === 400);

r = await post('/api/place-selected', { ...validPlace, names: {} });
check('empty names → 400', r.status === 400);

r = await post('/api/place-selected', { ...validPlace, timezone: '' });
check('missing timezone → 400', r.status === 400);

r = await post('/api/place-selected', validPlace);
const valid = (() => { try { return JSON.parse(r.body); } catch (_) { return null; } })();
check('valid payload → 200 + persisted:false (no Supabase env)',
    r.status === 200 && valid && valid.ok === true && valid.persisted === false);

console.log('\n── Pipeline ordering (curated > discovered > external) ──');
// Without Supabase, discovered tier is skipped — order is curated → external.
const pr1 = await get('/api/search-place?q=Riyadh&lang=en');
check('Riyadh (in curated) → X-Search-Source: curated',
    String(pr1.headers['x-search-source'] || '') === 'curated');
const pr2 = await get('/api/search-place?q=' + encodeURIComponent('اللطامنة') + '&lang=ar');
check('اللطامنة (not curated) → X-Search-Source: external (no Supabase)',
    String(pr2.headers['x-search-source'] || '') === 'external');

// 8. Cache hit on repeat query (second call should be instant — verified by simple consistency)
console.log('\n── Cache consistency on repeat ──');
const r3a = await get('/api/search-place?q=' + encodeURIComponent('اللطامنة') + '&lang=ar');
const r3b = await get('/api/search-place?q=' + encodeURIComponent('اللطامنة') + '&lang=ar');
const j3a = JSON.parse(r3a.body), j3b = JSON.parse(r3b.body);
check('repeat returns same results (cached)', JSON.stringify(j3a) === JSON.stringify(j3b));

// 9. GLOBAL-PLACE-SEARCH-L10N-PIPELINE (2026-05-12) — quality tag per result
console.log('\n── L10N-PIPELINE: nameQuality tagging ──');
async function topOf(query, lang) {
    const r = await search(query, lang);
    return (r.results && r.results[0]) || null;
}

// Curated: explicit names[lang]
let lq;
lq = await topOf('Riyadh', 'ar');
check(`Riyadh AR → quality=curated   (got "${lq && lq.nameQuality}")`,
    lq && lq.nameQuality === 'curated');
lq = await topOf('Mecca', 'ar');
check(`Mecca AR → quality=curated   (got "${lq && lq.nameQuality}")`,
    lq && lq.nameQuality === 'curated');

// Official: from Nominatim namedetails name:ar
lq = await topOf('Granada', 'ar');
check(`Granada AR → quality=official (got "${lq && lq.nameQuality}", display="${lq && lq.displayName}")`,
    lq && lq.nameQuality === 'official' && /[؀-ۿ]/.test(lq.displayName));
lq = await topOf('Vancouver', 'ar');
check(`Vancouver AR → quality=official (got "${lq && lq.nameQuality}", display="${lq && lq.displayName}")`,
    lq && lq.nameQuality === 'official' && /[؀-ۿ]/.test(lq.displayName));

// Transliterated: Nominatim has no name:ar — pipeline transliterates
lq = await topOf('Le Pontet', 'ar');
check(`Le Pontet AR → quality=transliterated (got "${lq && lq.nameQuality}", display="${lq && lq.displayName}")`,
    lq && lq.nameQuality === 'transliterated' && /[؀-ۿ]/.test(lq.displayName));

// AR transliteration table — direct expectations (sanity)
async function expectTranslit(query, expectedSubstr) {
    const lq = await topOf(query, 'ar');
    const got = lq && lq.displayName ? lq.displayName : '';
    const ok = lq && got.includes(expectedSubstr) && /[؀-ۿ]/.test(got);
    check(`AR translit "${query}" should contain "${expectedSubstr}"  (got "${got}")`, ok);
}
// (these may also resolve from namedetails; if so the test still passes
//  because the substring is present)
await expectTranslit('Vancouver', 'فان');
await expectTranslit('Vladivostok', 'فلادي');

// Curated EN — must be "curated", not fallback_raw
lq = await topOf('Riyadh', 'en');
check(`Riyadh EN → quality=curated   (got "${lq && lq.nameQuality}")`,
    lq && lq.nameQuality === 'curated');

// Latin-lang fallthrough for an external place where Nominatim has no name:de
// Le Pontet has no name:de — DE result should be fallback_raw, NOT mistakenly flagged
lq = await topOf('Le Pontet', 'de');
check(`Le Pontet DE → quality is fallback_* (got "${lq && lq.nameQuality}")`,
    lq && (lq.nameQuality === 'fallback_en' || lq.nameQuality === 'fallback_raw'));

// AR should NEVER surface a Latin-script displayName — final guard
const arQueries = ['Riyadh','Mecca','Granada','Toledo','Vancouver','Le Pontet','Vladivostok'];
for (const q of arQueries) {
    const lq = await topOf(q, 'ar');
    const got = lq && lq.displayName ? lq.displayName : '';
    const isArabic = /[؀-ۿ]/.test(got);
    check(`AR query "${q}" → displayName has Arabic chars  (got "${got}", quality=${lq && lq.nameQuality})`,
        isArabic);
}

// L10N-PIPELINE: validator accepts/rejects nameQuality field correctly
console.log('\n── L10N-PIPELINE: validator nameQuality acceptance ──');
const validBase = {
    slug: 'test-l10n-place',
    type: 'city',
    countryCode: 'fr',
    lat: 45.5,
    lng: 2.5,
    timezone: 'Europe/Paris',
    names: { ar: 'تست', en: 'Test Place' },
    aliases: {},
    admin: {},
    source: 'nominatim'
};
const validQ = await post('/api/place-selected', Object.assign({}, validBase, {
    nameQuality: { ar: 'transliterated', en: 'official' }
}));
check('valid payload + valid nameQuality → 200', validQ.status === 200);

const badQual1 = await post('/api/place-selected', Object.assign({}, validBase, {
    nameQuality: { ar: 'INVENTED_TIER' }   // not in _NAME_QUALITY_RANK
}));
check('invalid nameQuality tier ("INVENTED_TIER") → 400', badQual1.status === 400);

const badQual2 = await post('/api/place-selected', Object.assign({}, validBase, {
    nameQuality: 'not-an-object'
}));
check('nameQuality must be an object (string rejected) → 400', badQual2.status === 400);

const badQual3 = await post('/api/place-selected', Object.assign({}, validBase, {
    nameQuality: ['transliterated']        // array rejected
}));
check('nameQuality must be an object (array rejected) → 400', badQual3.status === 400);

// Missing nameQuality is allowed (it's optional)
const noQual = await post('/api/place-selected', validBase);
check('missing nameQuality is allowed → 200', noQual.status === 200);

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
