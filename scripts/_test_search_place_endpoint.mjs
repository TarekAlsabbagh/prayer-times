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

// Test pacing helper — Nominatim has a 1-req/sec policy and 429s when
// burst-queried. Tests that hit external (non-curated cities) call this
// between iterations so we don't get rate-limited mid-suite.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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

// Official: from Nominatim namedetails name:ar.
// Granada moved to curated in IT-ES-PT-1 (still produces غرناطة).
lq = await topOf('Granada', 'ar');
check(`Granada AR → "غرناطة" (got "${lq && lq.displayName}", q=${lq && lq.nameQuality})`,
    lq && lq.displayName === 'غرناطة'
    && (lq.nameQuality === 'curated' || lq.nameQuality === 'official'));
// Vancouver moved to curated in CURATED-150-1. Still produces فانكوفر.
lq = await topOf('Vancouver', 'ar');
check(`Vancouver AR → "فانكوفر" (got "${lq && lq.displayName}", q=${lq && lq.nameQuality})`,
    lq && lq.displayName === 'فانكوفر'
    && (lq.nameQuality === 'curated' || lq.nameQuality === 'official'));

// Transliterated: Nominatim has no name:ar — pipeline transliterates
lq = await topOf('Le Pontet', 'ar');
check(`Le Pontet AR → quality=transliterated (got "${lq && lq.nameQuality}", display="${lq && lq.displayName}")`,
    lq && lq.nameQuality === 'transliterated' && /[؀-ۿ]/.test(lq.displayName));
// French silent -et ending: must NOT produce doubled ت at the end.
// "Pontet" should become "بونت" (one ت), not "بونتت" (two).
check(`Le Pontet AR → "لو بونت" (silent -et collapsed; got "${lq && lq.displayName}")`,
    lq && lq.displayName === 'لو بونت');

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

// GLOBAL-PLACE-SEARCH-L10N-TR-1 (2026-05-13) — Turkish country-aware tier
// =====================================================================
// 1. Şirince + Çıralı are small Turkish villages without `name:ar` in
//    Nominatim → our transliteration owns them (strict equality).
// 2. Üsküdar / Çeşme / İzmir / Kaş / Göreme have Nominatim `name:ar`
//    that wins via tier 2 → we just assert the displayName is Arabic
//    with no Latin leakage, and is non-empty.
// 3. All seven must return non-empty results (none should be filtered
//    out by the prayer-times contract validator).
console.log('\n── L10N-TR-1: Turkish country-aware transliteration ──');

async function topOfQ(query, lang) {
    const r = await search(query, lang);
    return (r.results && r.results[0]) || null;
}

// Strict-equality cases — these slugs aren't in Nominatim's name:ar tag,
// so the Turkish translit tier definitively owns the output.
{
    const r = await topOfQ('Şirince', 'ar');
    check(`Şirince AR → "شيرينجه" (got "${r && r.displayName}")`,
        r && r.displayName === 'شيرينجه' && r.nameQuality === 'transliterated');
}
{
    const r = await topOfQ('Çıralı', 'ar');
    check(`Çıralı AR → "تشيرالي" (got "${r && r.displayName}")`,
        r && r.displayName === 'تشيرالي' && r.nameQuality === 'transliterated');
}

// Soft assertions — Nominatim has its own name:ar for these. We just
// require: (a) non-empty result, (b) Arabic-script displayName, (c) no
// Latin chars leaking through. PACED with 1.2s sleeps to respect
// Nominatim's 1-req/sec policy.
const softCases = ['Göreme', 'Üsküdar', 'Çeşme', 'İzmir', 'Kaş'];
for (const q of softCases) {
    await sleep(1200);
    const r = await topOfQ(q, 'ar');
    const dn = r && r.displayName || '';
    const ok = r
        && /[؀-ۿ]/.test(dn)        // contains Arabic chars
        && !/[a-zA-Z]/.test(dn);   // no Latin leaking
    check(`${q} AR → Arabic only, no Latin  (got "${dn}", quality=${r && r.nameQuality})`, ok);
}

// Regression — these must keep their existing outputs from prior phases.
const regressions = [
    ['Le Pontet',     'لو بونت',     'transliterated'],
    ['Vancouver',     'فانكوفر',     'curated'],    // moved to curated in CURATED-150-1
    ['San Francisco', 'سان فرانسيسكو','curated'],   // moved to curated in CURATED-150-1
    ['Vladivostok',   'فلاديفوستوك', 'curated'],   // moved to curated in L10N-RU-1
    ['Granada',       'غرناطة',      'curated'],   // moved to curated in IT-ES-PT-1
    ['Riyadh',        'الرياض',      'curated'],
    ['Mecca',         'مكة المكرمة', 'curated']
];
for (const [q, expDisplay, expQuality] of regressions) {
    // Pace external-bound queries. Curated (Riyadh, Mecca) don't hit
    // Nominatim but sleeping for them too keeps the code simple.
    if (q !== 'Riyadh' && q !== 'Mecca') await sleep(1200);
    const r = await topOfQ(q, 'ar');
    check(`Regression ${q} AR → "${expDisplay}" (q=${expQuality}) (got "${r && r.displayName}" q=${r && r.nameQuality})`,
        r && r.displayName === expDisplay && r.nameQuality === expQuality);
}

// GLOBAL-PLACE-SEARCH-L10N-CJK-1 (2026-05-13) — China + Japan overrides
// =====================================================================
// CJK tier sits ABOVE Nominatim namedetails for cc=cn|jp because the
// curated dict has cleaner canonical names than Nominatim's `name:ar`
// for several cities (Shenzhen, Guangzhou, Kobe, etc.). Tests assert
// the canonical Arabic value via strict equality.
console.log('\n── L10N-CJK-1: China + Japan canonical overrides ──');

const cjkCases = [
    // China
    ['Beijing',    'بكين'],
    ['Shanghai',   'شنغهاي'],
    ['Guangzhou',  'قوانغتشو'],
    ['Shenzhen',   'شينزن'],
    ['Xian',       'شيان'],
    ['Hangzhou',   'هانغتشو'],
    ['Nanjing',    'نانجينغ'],
    ['Chengdu',    'تشنغدو'],
    ['Wuhan',      'ووهان'],
    ['Chongqing',  'تشونغتشينغ'],
    // Japan
    ['Tokyo',      'طوكيو'],
    ['Osaka',      'أوساكا'],
    ['Kyoto',      'كيوتو'],
    ['Yokohama',   'يوكوهاما'],
    ['Sapporo',    'سابورو'],
    ['Nagoya',     'ناغويا'],
    ['Kobe',       'كوبي'],
    ['Fukuoka',    'فوكوكا'],
    ['Hiroshima',  'هيروشيما'],
    ['Nagasaki',   'ناغاساكي']
];
for (const [q, expected] of cjkCases) {
    // No pacing needed — all 20 cities are in curated-places.json,
    // served from tier 1. No Nominatim round-trip.
    const r = await topOfQ(q, 'ar');
    // Strict equality on displayName. Quality should be 'curated' since
    // the cities are in curated-places.json; 'override' or 'official'
    // are accepted fallbacks in case the entry is ever removed.
    const ok = r && r.displayName === expected
        && (r.nameQuality === 'curated' || r.nameQuality === 'override' || r.nameQuality === 'official');
    check(`${q} AR → "${expected}" (got "${r && r.displayName}", q=${r && r.nameQuality})`, ok);
}

// Alias / historical name tests — "Peking" is a curated alias for Beijing.
{
    const r = await topOfQ('Peking', 'ar');
    check(`Peking AR (historical alias) → "بكين" (got "${r && r.displayName}")`,
        r && r.displayName === 'بكين');
}
{
    const r = await topOfQ('Canton', 'ar');
    // "Canton" is a Guangzhou alias in curated → returns "قوانغتشو".
    // (If we ever resolve Canton, USA via Nominatim instead, the test
    // still passes as long as displayName is Arabic-only.)
    const ok = r && /[؀-ۿ]/.test(r.displayName) && !/[a-zA-Z]/.test(r.displayName);
    check(`Canton AR → Arabic-only display (got "${r && r.displayName}")`, ok);
}

// GLOBAL-PLACE-SEARCH-L10N-IT-ES-PT-1 (2026-05-13) — Romance overrides
// =====================================================================
// Italian, Spanish, Portuguese, Brazilian cities with established Arabic
// names (Venezia → البندقية, Córdoba → قرطبة, Lisboa → لشبونة, etc.).
// All listed cities are seeded into curated-places.json so tier 1 wins
// — no Nominatim dependency. The romance-overrides module catches
// non-curated CN/JP/IT/ES/PT/BR cities Nominatim returns.
console.log('\n── L10N-IT-ES-PT-1: Romance canonical overrides ──');

const romanceCases = [
    // Italy
    ['Venezia',        'البندقية'],
    ['Venice',         'البندقية'],
    ['Firenze',        'فلورنسا'],
    ['Florence',       'فلورنسا'],
    ['Roma',           'روما'],
    ['Napoli',         'نابولي'],
    ['Milano',         'ميلانو'],
    ['Torino',         'تورينو'],
    ['Genova',         'جنوة'],
    ['Bologna',        'بولونيا'],
    ['Pisa',           'بيزا'],
    // Spain
    ['Córdoba',        'قرطبة'],
    ['Cordoba',        'قرطبة'],
    ['Sevilla',        'إشبيلية'],
    ['Seville',        'إشبيلية'],
    ['Málaga',         'مالقة'],
    ['Malaga',         'مالقة'],
    ['Zaragoza',       'سرقسطة'],
    ['Madrid',         'مدريد'],
    ['Barcelona',      'برشلونة'],
    ['Valencia',       'فالنسيا'],
    // Portugal
    ['Lisboa',         'لشبونة'],
    ['Lisbon',         'لشبونة'],
    ['Porto',          'بورتو'],
    // Brazil
    ['São Paulo',      'ساو باولو'],
    ['Sao Paulo',      'ساو باولو'],
    ['Rio de Janeiro', 'ريو دي جانيرو']
];
for (const [q, expected] of romanceCases) {
    const r = await topOfQ(q, 'ar');
    // Curated tier wins for all listed cities. Accept 'override' /
    // 'official' as fallbacks in case the entry is ever removed.
    const ok = r && r.displayName === expected
        && (r.nameQuality === 'curated' || r.nameQuality === 'override' || r.nameQuality === 'official');
    check(`${q} AR → "${expected}" (got "${r && r.displayName}", q=${r && r.nameQuality})`, ok);
}

// Granada is in both the original Phase B (Nominatim returns غرناطة)
// AND the new ES curated. Either way it must still return غرناطة.
{
    const r = await topOfQ('Granada', 'ar');
    check(`Granada AR → "غرناطة" (post-IT-ES-PT-1 regression) (got "${r && r.displayName}")`,
        r && r.displayName === 'غرناطة');
}

// GLOBAL-PLACE-SEARCH-L10N-DE-1 (2026-05-13) — German/Austrian/Swiss
// =====================================================================
// 11 user-listed cities. All in curated → tier 1 wins; tests assert
// strict equality on the canonical Arabic value.
console.log('\n── L10N-DE-1: German / Austrian / Swiss canonical names ──');
const germanCases = [
    ['München',     'ميونخ'],
    ['Munich',      'ميونخ'],
    ['Köln',        'كولونيا'],
    ['Cologne',     'كولونيا'],
    ['Wien',        'فيينا'],
    ['Vienna',      'فيينا'],
    ['Zürich',      'زيورخ'],
    ['Zurich',      'زيورخ'],
    ['Düsseldorf',  'دوسلدورف'],
    ['Nürnberg',    'نورنبرغ'],
    ['Hamburg',     'هامبورغ'],
    ['Frankfurt',   'فرانكفورت'],
    ['Stuttgart',   'شتوتغارت'],
    ['Berlin',      'برلين'],
    ['Bonn',        'بون']
];
for (const [q, expected] of germanCases) {
    const r = await topOfQ(q, 'ar');
    const ok = r && r.displayName === expected
        && (r.nameQuality === 'curated' || r.nameQuality === 'override' || r.nameQuality === 'official');
    check(`${q} AR → "${expected}" (got "${r && r.displayName}", q=${r && r.nameQuality})`, ok);
}

// GLOBAL-PLACE-SEARCH-L10N-RU-1 (2026-05-13) — Russia + Ukraine + Cyrillic
// =====================================================================
// 11 user-listed cities, each tested in BOTH Latin and Cyrillic forms.
// All in curated → tier 1 wins; strict equality on canonical Arabic.
console.log('\n── L10N-RU-1: Russian / Ukrainian (Latin + Cyrillic) ──');
const cyrillicCases = [
    // Russia
    ['Moscow',              'موسكو'],
    ['Москва',              'موسكو'],
    ['Saint Petersburg',    'سانت بطرسبرغ'],
    ['Санкт-Петербург',     'سانت بطرسبرغ'],
    ['Vladivostok',         'فلاديفوستوك'],
    ['Владивосток',         'فلاديفوستوك'],
    ['Kazan',               'قازان'],
    ['Казань',              'قازان'],
    ['Sochi',               'سوتشي'],
    ['Сочи',                'سوتشي'],
    ['Novosibirsk',         'نوفوسيبيرسك'],
    ['Новосибирск',         'نوفوسيبيرسك'],
    // Ukraine
    ['Kyiv',                'كييف'],
    ['Київ',                'كييف'],
    ['Киев',                'كييف'],   // Russian spelling
    ['Odesa',               'أوديسا'],
    ['Одеса',               'أوديسا'],
    ['Lviv',                'لفيف'],
    ['Львів',               'لفيف'],
    ['Kharkiv',             'خاركيف'],
    ['Харків',              'خاركيف'],
    ['Dnipro',              'دنيبرو'],
    ['Дніпро',              'دنيبرو']
];
for (const [q, expected] of cyrillicCases) {
    const r = await topOfQ(q, 'ar');
    const ok = r && r.displayName === expected
        && (r.nameQuality === 'curated' || r.nameQuality === 'override' || r.nameQuality === 'official');
    check(`${q} AR → "${expected}" (got "${r && r.displayName}", q=${r && r.nameQuality})`, ok);
}

// AR pipeline must NEVER leak Cyrillic chars as displayName.
{
    const r = await topOfQ('Москва', 'ar');
    const dn = r && r.displayName || '';
    check(`Москва AR → no Cyrillic in display (got "${dn}")`,
        r && /[؀-ۿ]/.test(dn) && !/[Ѐ-ӿ]/.test(dn));
}

// GLOBAL-PLACE-SEARCH-L10N-IN-1 (2026-05-13) — Indian subcontinent
// =====================================================================
// 19 cities × multiple script forms. Latin + Devanagari/Bengali/Tamil/
// Kannada/Gujarati/Urdu all map to canonical Arabic via curated tier 1.
console.log('\n── L10N-IN-1: Indian subcontinent (multi-script) ──');
const subcontinentCases = [
    // India — Latin + native scripts
    ['Delhi',          'دلهي'],
    ['New Delhi',      'دلهي'],
    ['दिल्ली',          'دلهي'],
    ['Mumbai',         'مومباي'],
    ['Bombay',         'مومباي'],
    ['मुंबई',           'مومباي'],
    ['Kolkata',        'كلكتا'],
    ['Calcutta',       'كلكتا'],
    ['কলকাতা',         'كلكتا'],
    ['Hyderabad',      'حيدر آباد'],
    ['हैदराबाद',        'حيدر آباد'],
    ['Chennai',        'تشيناي'],
    ['Madras',         'تشيناي'],
    ['சென்னை',         'تشيناي'],
    ['Bengaluru',      'بنغالورو'],
    ['Bangalore',      'بنغالورو'],
    ['ಬೆಂಗಳೂರು',       'بنغالورو'],
    ['Lucknow',        'لكناو'],
    ['लखनऊ',           'لكناو'],
    ['Ahmedabad',      'أحمد آباد'],
    ['અમદાવાદ',        'أحمد آباد'],
    // Pakistan — Latin + Urdu
    ['Karachi',        'كراتشي'],
    ['کراچی',          'كراتشي'],
    ['Lahore',         'لاهور'],
    ['لاہور',          'لاهور'],
    ['Islamabad',      'إسلام آباد'],
    ['اسلام آباد',     'إسلام آباد'],
    ['Rawalpindi',     'روالبندي'],
    ['Peshawar',       'بيشاور'],
    ['پشاور',          'بيشاور'],
    ['Multan',         'ملتان'],
    ['ملتان',          'ملتان'],
    // Bangladesh — Latin + Bengali
    ['Dhaka',          'دكا'],
    ['ঢাকা',           'دكا'],
    ['Chittagong',     'شيتاغونغ'],
    ['Chattogram',     'شيتاغونغ'],
    ['চট্টগ্রাম',      'شيتاغونغ'],
    ['Sylhet',         'سلهت'],
    ['সিলেট',          'سلهت'],
    ['Rajshahi',       'راجشاهي'],
    ['Khulna',         'خولنا']
];
for (const [q, expected] of subcontinentCases) {
    const r = await topOfQ(q, 'ar');
    const ok = r && r.displayName === expected
        && (r.nameQuality === 'curated' || r.nameQuality === 'override' || r.nameQuality === 'official');
    check(`${q} AR → "${expected}" (got "${r && r.displayName}", q=${r && r.nameQuality})`, ok);
}

// No Devanagari / Bengali / Urdu raw should leak into AR displayName.
{
    const r = await topOfQ('दिल्ली', 'ar');
    const dn = r && r.displayName || '';
    check(`दिल्ली AR → no Devanagari in display`,
        r && /[؀-ۿ]/.test(dn) && !/[ऀ-ॿ]/.test(dn));
}
{
    const r = await topOfQ('کراچی', 'ar');
    const dn = r && r.displayName || '';
    check(`کراچی AR → display is "كراتشي" (no Urdu چ leak)`,
        r && dn === 'كراتشي');
}

// GLOBAL-PLACE-SEARCH-CJK-SEARCH-FIX-1 (2026-05-13)
// =====================================================================
// After SCRIPT-FALLBACK-1 hardened the pipeline against raw-CJK leaking
// as displayName, raw-CJK QUERIES stopped returning results on production
// because curated entries didn't carry CJK aliases. Fix: each JP/CN
// curated entry now has `aliases.ja` / `aliases.zh` with the native
// forms (both bare name and `-市` / `-都` / `-府` administrative suffixes).
// Search hits curated tier 1; displayName remains Arabic.
console.log('\n── L10N-CJK-SEARCH-FIX-1: raw CJK queries hit curated ──');
const cjkRawCases = [
    // Japan — bare + suffixed
    ['東京',     'طوكيو'],
    ['東京都',   'طوكيو'],
    ['京都',     'كيوتو'],
    ['京都市',   'كيوتو'],
    ['大阪',     'أوساكا'],
    ['大阪市',   'أوساكا'],
    ['横浜',     'يوكوهاما'],
    ['札幌',     'سابورو'],
    ['名古屋',   'ناغويا'],
    ['神戸',     'كوبي'],
    // China — bare + suffixed
    ['北京',     'بكين'],
    ['北京市',   'بكين'],
    ['上海',     'شنغهاي'],
    ['上海市',   'شنغهاي'],
    ['广州',     'قوانغتشو'],
    ['深圳',     'شينزن'],
    ['西安',     'شيان'],
    ['杭州',     'هانغتشو'],
    ['南京',     'نانجينغ'],
    ['成都',     'تشنغدو'],
    ['武汉',     'ووهان'],
    ['重庆',     'تشونغتشينغ']
];
for (const [q, expected] of cjkRawCases) {
    const r = await topOfQ(q, 'ar');
    // Strict: display matches canonical Arabic AND no CJK leaks.
    const ok = r && r.displayName === expected
        && !/[぀-ヿ㐀-䶿一-鿿]/.test(r.displayName)
        && (r.nameQuality === 'curated' || r.nameQuality === 'override' || r.nameQuality === 'official');
    check(`${q} AR → "${expected}" (got "${r && r.displayName}", q=${r && r.nameQuality})`, ok);
}

// GLOBAL-PLACE-SEARCH-L10N-SCRIPT-FALLBACK-1 (2026-05-13)
// =====================================================================
// AR pipeline must NEVER surface raw CJK / Hangul / Cyrillic as the
// primary displayName. Verify by typing the native-script city name
// directly into the search box and checking that:
//   1. displayName contains Arabic chars and NO non-Latin non-Arabic
//      script (no CJK / Hangul / Cyrillic).
//   2. originalName preserves the native-script value for UI subtitles.
console.log('\n── L10N-SCRIPT-FALLBACK-1: raw CJK / Cyrillic input ──');

// Helper: regex for "displayName must NOT contain CJK/Hangul/Cyrillic"
const NON_LATIN_NON_AR_RE = /[぀-ヿ㐀-䶿一-鿿가-힯Ѐ-ӿऀ-ॿঀ-৿฀-๿]/;

// CJK queries — display MUST be Arabic and contain no CJK characters.
// `originalName` is populated when the result comes from Nominatim
// (raw OSM `name=*` tag). When the query matches a curated entry,
// `originalName` is empty (curated entries don't carry an OSM raw
// name unless explicitly seeded in admin.originalName). Both paths
// are acceptable as long as the displayName never leaks CJK.
{
    const r = await topOfQ('東京', 'ar');
    check(`東京 AR → display Arabic, no CJK leak (display="${r && r.displayName}", src=${r && r.source})`,
        r && /[؀-ۿ]/.test(r.displayName)
        && !NON_LATIN_NON_AR_RE.test(r.displayName));
}
{
    const r = await topOfQ('京都市', 'ar');
    check(`京都市 AR → display Arabic, no CJK leak (display="${r && r.displayName}", src=${r && r.source})`,
        r && /[؀-ۿ]/.test(r.displayName)
        && !NON_LATIN_NON_AR_RE.test(r.displayName));
}
{
    const r = await topOfQ('大阪市', 'ar');
    check(`大阪市 AR → "أوساكا" (display="${r && r.displayName}", src=${r && r.source})`,
        r && r.displayName === 'أوساكا');
}
{
    const r = await topOfQ('北京市', 'ar');
    check(`北京市 AR → "بكين" (display="${r && r.displayName}", src=${r && r.source})`,
        r && r.displayName === 'بكين');
}

// originalName field present on curated regressions (empty for now until
// Phase D imports start populating it).
{
    const r = await topOfQ('Riyadh', 'ar');
    check(`Riyadh AR → originalName field exists (is string) (got "${typeof (r && r.originalName)}")`,
        r && typeof r.originalName === 'string');
}

console.log('\n── CURATED-150 spot checks (Phase A) ──');

// The cheap rate-limit tier is 300/min per IP. Earlier sections of this
// test suite consume most of that budget, so we pause until the window
// resets before firing this section. The X-RateLimit-Reset header tells
// us how many seconds remain in the current window — wait that long.
{
    const probe = await get('/api/search-place?q=__rl_probe__&lang=en');
    const remaining = Number(probe.headers['x-ratelimit-remaining'] || 0);
    const resetSec  = Number(probe.headers['x-ratelimit-reset'] || 0);
    if (remaining < 80) {
        const waitMs = (resetSec + 2) * 1000;
        console.log(`  (rate-limit ${remaining} remaining; waiting ${waitMs/1000}s for reset)`);
        await sleep(waitMs);
    }
}

// Each test asserts: the top result for the given query comes from the
// curated tier (NOT discovered, NOT external Nominatim), has a sensible
// displayName for the lang, and is prayer-times-ready (lat/lng/tz/cc).
// Covers one representative city per category from the 148-city seed.
const curated150 = [
    // [query, lang, expectedCC, mustContainOrEq]
    ['Los Angeles',       'en', 'us', 'Los Angeles'],
    ['لوس أنجلوس',         'ar', 'us', 'لوس أنجلوس'],
    ['Toronto',           'en', 'ca', 'Toronto'],
    ['Manchester',        'en', 'gb', 'Manchester'],
    ['Marseille',         'en', 'fr', 'Marseille'],
    ['Stockholm',         'en', 'se', 'Stockholm'],
    ['Amsterdam',         'en', 'nl', 'Amsterdam'],
    ['Warsaw',            'en', 'pl', 'Warsaw'],
    ['Prague',            'en', 'cz', 'Prague'],
    ['Athens',            'en', 'gr', 'Athens'],
    ['أثينا',              'ar', 'gr', 'أثينا'],
    ['Ankara',            'en', 'tr', 'Ankara'],
    ['Tehran',            'en', 'ir', 'Tehran'],
    ['طهران',              'ar', 'ir', 'طهران'],
    ['تهران',              'ar', 'ir', null], // fa-script alias → ir
    ['Baku',              'en', 'az', 'Baku'],
    ['Tashkent',          'en', 'uz', 'Tashkent'],
    ['Pune',              'en', 'in', 'Pune'],
    ['पुणे',                'ar', 'in', null], // devanagari alias → ir/in (curated wins)
    ['Kuala Lumpur',      'en', 'my', 'Kuala Lumpur'],
    ['KL',                'en', 'my', null], // alias hit
    ['Singapore',         'en', 'sg', 'Singapore'],
    ['Bangkok',           'en', 'th', 'Bangkok'],
    ['กรุงเทพ',             'ar', 'th', null], // thai alias
    ['Jakarta',           'en', 'id', 'Jakarta'],
    ['جاكرتا',             'ar', 'id', 'جاكرتا'],
    ['Hanoi',             'en', 'vn', 'Hanoi'],
    ['Hà Nội',            'en', 'vn', null], // vietnamese alias
    ['Seoul',             'en', 'kr', 'Seoul'],
    ['서울',                'ar', 'kr', null], // hangul alias
    ['Sydney',             'en', 'au', 'Sydney'],
    ['سيدني',              'ar', 'au', 'سيدني'],
    ['Lagos',              'en', 'ng', 'Lagos'],
    ['لاغوس',              'ar', 'ng', 'لاغوس'],
    ['Nairobi',            'en', 'ke', 'Nairobi'],
    ['Addis Ababa',        'en', 'et', 'Addis Ababa'],
    ['አዲስ አበባ',           'ar', 'et', null], // amharic alias
    ['Johannesburg',       'en', 'za', 'Johannesburg'],
    ['Mexico City',        'en', 'mx', 'Mexico City'],
    ['Buenos Aires',       'en', 'ar', 'Buenos Aires'],
    ['Bogota',             'en', 'co', 'Bogota'],
    ['Tabuk',              'en', 'sa', 'Tabuk'],
    ['تبوك',                'ar', 'sa', 'تبوك'],
    ['Erbil',              'en', 'iq', 'Erbil'],
    ['أربيل',               'ar', 'iq', 'أربيل'],
    ['Giza',               'en', 'eg', 'Giza'],
    ['Fes',                'en', 'ma', 'Fes'],
    ['Hong Kong',          'en', 'hk', 'Hong Kong'],
    ['香港',                 'ar', 'hk', null], // chinese alias
    ['Taipei',             'en', 'tw', 'Taipei'],
];
for (const [q, lang, expectCC, mustEqOrContain] of curated150) {
    const r = await topOfQ(q, lang);
    const got  = r ? r.displayName : '(none)';
    const cc   = r ? r.countryCode : '(none)';
    const src  = r ? r.source      : '(none)';
    const okCurated = r && r.source === 'curated';
    const okCC      = r && r.countryCode === expectCC;
    const okReady   = r && isPrayerTimesReady(r);
    const okName    = !mustEqOrContain || (r && (r.displayName === mustEqOrContain || r.displayName.includes(mustEqOrContain)));
    check(`${q} (${lang}) → curated, cc=${expectCC}, ready, name OK  [got src=${src}, cc=${cc}, name="${got}"]`,
        okCurated && okCC && okReady && okName);
    await sleep(150); // pace under cheap-tier (300/min) rate limit
}

console.log('\n── CURATED-ARAB-COMPLETE-1 (Phase 2026-05-13) ──');

// Each Syrian city we added MUST hit tier 1 (curated). If any falls
// through to discovered or external, the seed data is wrong.
const arabComplete = [
    // Syria — all 16 listed by the user
    ['حماة',                'ar', 'sy', 'حماة'],
    ['Hama',                 'en', 'sy', 'Hama'],
    ['حمص',                'ar', 'sy', 'حمص'],
    ['Homs',                 'en', 'sy', 'Homs'],
    ['اللاذقية',           'ar', 'sy', 'اللاذقية'],
    ['Latakia',              'en', 'sy', 'Latakia'],
    ['طرطوس',              'ar', 'sy', 'طرطوس'],
    ['دير الزور',          'ar', 'sy', 'دير الزور'],
    ['Raqqa',                'en', 'sy', 'Raqqa'],
    ['إدلب',                'ar', 'sy', 'إدلب'],
    ['درعا',                'ar', 'sy', 'درعا'],
    ['القامشلي',           'ar', 'sy', 'القامشلي'],
    ['الحسكة',             'ar', 'sy', 'الحسكة'],
    ['Manbij',               'en', 'sy', 'Manbij'],
    // Yemen
    ['تعز',                  'ar', 'ye', 'تعز'],
    ['الحديدة',             'ar', 'ye', 'الحديدة'],
    // Libya
    ['مصراتة',             'ar', 'ly', 'مصراتة'],
    ['Misrata',              'en', 'ly', 'Misrata'],
    // Palestine
    ['نابلس',              'ar', 'ps', 'نابلس'],
    ['الخليل',             'ar', 'ps', 'الخليل'],
    ['Hebron',               'en', 'ps', 'Hebron'],
    // Iraq
    ['كربلاء',             'ar', 'iq', 'كربلاء'],
    ['Karbala',              'en', 'iq', 'Karbala'],
    ['كركوك',              'ar', 'iq', 'كركوك'],
    ['السليمانية',          'ar', 'iq', 'السليمانية'],
    // Sudan
    ['أم درمان',            'ar', 'sd', 'أم درمان'],
    // Lebanon
    ['صيدا',                'ar', 'lb', 'صيدا'],
    // Jordan
    ['الزرقاء',             'ar', 'jo', 'الزرقاء'],
    ['Aqaba',                'en', 'jo', 'Aqaba'],
    // Morocco
    ['طنجة',                'ar', 'ma', 'طنجة'],
    ['Tangier',              'en', 'ma', 'Tangier'],
    // Algeria
    ['عنابة',              'ar', 'dz', 'عنابة'],
    // Tunisia
    ['سوسة',                'ar', 'tn', 'سوسة'],
    ['Kairouan',             'en', 'tn', 'Kairouan'],
    // Mauritania
    ['نواذيبو',             'ar', 'mr', 'نواذيبو'],
];
for (const [q, lang, expectCC, expectName] of arabComplete) {
    const r = await topOfQ(q, lang);
    const got = r ? r.displayName : '(none)';
    const cc  = r ? r.countryCode : '(none)';
    const src = r ? r.source       : '(none)';
    const okCurated = r && r.source === 'curated';
    const okCC      = r && r.countryCode === expectCC;
    const okReady   = r && isPrayerTimesReady(r);
    const okName    = !expectName || got === expectName || got.includes(expectName);
    check(`${q} (${lang}) → curated cc=${expectCC} name="${expectName}" [got src=${src}, cc=${cc}, name="${got}"]`,
        okCurated && okCC && okReady && okName);
    await sleep(150);
}

console.log('\n── EXTERNAL-FAIL-UX-1: response shape ──');

// New top-level fields in the JSON response: source + status.
// Per EXTERNAL-FAIL-UX-1, these must be present on EVERY response, including
// when results is empty. They drive the UI message logic.
{
    const data = await search('Riyadh', 'ar');
    check('Riyadh response has top-level `source` (string)',
        data && typeof data.source === 'string');
    check('Riyadh response has top-level `status` (string)',
        data && typeof data.status === 'string');
    check('Riyadh `source` === "curated"',
        data && data.source === 'curated');
    check('Riyadh `status` === "ok"',
        data && data.status === 'ok');
}

// A query that (a) doesn't match any curated city as substring AND
// (b) is short enough that external isn't called (q.length < 2 guard).
// Before EXTERNAL-FAIL-UX-1, this would have returned source='curated'
// despite results=[] — the misleading default. Now it should be 'none'.
{
    const data = await search(';', 'en');
    check('Single-char `;` → results empty',
        data && Array.isArray(data.results) && data.results.length === 0);
    check('Single-char `;` → source === "none" (default, not misleading "curated")',
        data && data.source === 'none');
    check('Single-char `;` → status === "empty"',
        data && data.status === 'empty');
}

// Bogus query that won't match curated/discovered AND won't have a cache.
// We don't assert a specific status — Nominatim could return 'empty' for
// nonsense OR 'rate_limited' if Render IP is throttled. Just assert shape.
{
    const data = await search('zzzzqqqq-NO-SUCH-PLACE-xyz', 'en');
    check('Bogus query → results empty',
        data && Array.isArray(data.results) && data.results.length === 0);
    check('Bogus query → status is one of empty/rate_limited/error/too_short',
        data && ['empty','rate_limited','error','too_short'].includes(data.status));
    check('Bogus query → source is one of external/none',
        data && ['external','none'].includes(data.source));
    await sleep(150);
}

console.log('\n── CURATED-WORLD-EXP-WAVE-1 (Phase 2026-05-13) ──');

// Each city added in Wave 1 must hit tier 1 (curated). If any falls
// through, the seed data is wrong.
const worldWave1 = [
    // Saudi
    ['الدمام',          'ar', 'sa', 'الدمام'],
    ['Dammam',           'en', 'sa', 'Dammam'],
    ['الخبر',           'ar', 'sa', 'الخبر'],
    ['الظهران',         'ar', 'sa', 'الظهران'],
    ['نجران',           'ar', 'sa', 'نجران'],
    ['الباحة',          'ar', 'sa', 'الباحة'],
    // Gulf
    ['الريان',          'ar', 'qa', 'الريان'],
    ['عجمان',           'ar', 'ae', 'عجمان'],
    ['نزوى',             'ar', 'om', 'نزوى'],
    // Egypt
    ['المنصورة',        'ar', 'eg', 'المنصورة'],
    ['Mansoura',          'en', 'eg', 'Mansoura'],
    ['طنطا',             'ar', 'eg', 'طنطا'],
    ['الأقصر',           'ar', 'eg', 'الأقصر'],
    ['أسوان',            'ar', 'eg', 'أسوان'],
    // Sudan/Libya/Yemen
    ['ود مدني',          'ar', 'sd', 'ود مدني'],
    ['درنة',             'ar', 'ly', 'درنة'],
    ['مأرب',             'ar', 'ye', 'مأرب'],
    // Maghreb
    ['وجدة',             'ar', 'ma', 'وجدة'],
    ['البليدة',          'ar', 'dz', 'البليدة'],
    ['جربة',             'ar', 'tn', 'جربة'],
    // Turkey
    ['غازي عنتاب',       'ar', 'tr', 'غازي عنتاب'],
    ['Gaziantep',         'en', 'tr', 'Gaziantep'],
    ['ديار بكر',         'ar', 'tr', 'ديار بكر'],
    // Iran
    ['الأهواز',          'ar', 'ir', 'الأهواز'],
    ['يزد',              'ar', 'ir', 'يزد'],
    // Central Asia
    ['بخارى',            'ar', 'uz', 'بخارى'],
    ['Bukhara',           'en', 'uz', 'Bukhara'],
    ['دوشنبه',           'ar', 'tj', 'دوشنبه'],
    // South Asia
    ['بوبال',            'ar', 'in', 'بوبال'],
    ['Bhopal',            'en', 'in', 'Bhopal'],
    ['باتنا',            'ar', 'in', 'باتنا'],
    ['ماليه',            'ar', 'mv', 'ماليه'],
    // SE Asia: Indonesia
    ['ميدان',            'ar', 'id', 'ميدان'],
    ['Medan',             'en', 'id', 'Medan'],
    ['يوغياكارتا',       'ar', 'id', 'يوغياكارتا'],
    // SE Asia: Malaysia
    ['جورج تاون',         'ar', 'my', 'جورج تاون'],
    ['George Town',       'en', 'my', 'George Town'],
    ['Penang',            'en', 'my', null], // alias hit
    // SE Asia: Thailand
    ['شيانغ ماي',         'ar', 'th', 'شيانغ ماي'],
    ['Chiang Mai',        'en', 'th', 'Chiang Mai'],
    // SE Asia: misc
    ['دا نانغ',           'ar', 'vn', 'دا نانغ'],
    ['مانداليه',          'ar', 'mm', 'ماندالاي'],
    ['Vientiane',         'en', 'la', 'Vientiane'],
    ['Quezon City',       'en', 'ph', 'Quezon City'],
    // Africa
    ['كانو',              'ar', 'ng', 'كانو'],
    ['Kano',              'en', 'ng', 'Kano'],
    ['مومباسا',           'ar', 'ke', 'مومباسا'],
    ['ديري داوا',          'ar', 'et', 'ديري داوا'],
    ['باماكو',             'ar', 'ml', 'باماكو'],
    ['Bamako',             'en', 'ml', 'Bamako'],
    ['أبيدجان',            'ar', 'ci', 'أبيدجان'],
    ['ياوندي',             'ar', 'cm', 'ياوندي'],
    ['زنجبار',             'ar', 'tz', 'زنجبار'],
    ['Conakry',            'en', 'gn', 'Conakry'],
    ['Niamey',             'en', 'ne', 'Niamey'],
];
for (const [q, lang, expectCC, expectName] of worldWave1) {
    const r = await topOfQ(q, lang);
    const got = r ? r.displayName : '(none)';
    const cc  = r ? r.countryCode : '(none)';
    const src = r ? r.source       : '(none)';
    const okCurated = r && r.source === 'curated';
    const okCC      = r && r.countryCode === expectCC;
    const okReady   = r && isPrayerTimesReady(r);
    const okName    = !expectName || got === expectName || got.includes(expectName);
    check(`${q} (${lang}) → curated cc=${expectCC} [got src=${src}, cc=${cc}, name="${got}"]`,
        okCurated && okCC && okReady && okName);
    await sleep(150);
}

console.log('\n── CURATED-150 regression: baseline queries unchanged ──');

// Same rate-limit guard as before this section, just in case the spot
// checks above consumed enough of the next window to put us back near 0.
{
    const probe = await get('/api/search-place?q=__rl_probe2__&lang=en');
    const remaining = Number(probe.headers['x-ratelimit-remaining'] || 0);
    const resetSec  = Number(probe.headers['x-ratelimit-reset'] || 0);
    if (remaining < 30) {
        const waitMs = (resetSec + 2) * 1000;
        console.log(`  (rate-limit ${remaining} remaining; waiting ${waitMs/1000}s for reset)`);
        await sleep(waitMs);
    }
}

// These were green before Phase A. They must remain green — no regressions.
const baselineRegression = [
    ['Riyadh',          'ar', 'الرياض'],
    ['Mecca',           'ar', 'مكة المكرمة'],
    ['Granada',         'ar', 'غرناطة'],
    ['Vancouver',       'ar', 'فانكوفر'],
    ['San Francisco',   'ar', 'سان فرانسيسكو'],
    ['Vladivostok',     'ar', 'فلاديفوستوك'],
    ['Le Pontet',       'ar', null], // any Arabic, no Latin leak
];
for (const [q, lang, expectName] of baselineRegression) {
    const r = await topOfQ(q, lang);
    const got = r ? r.displayName : '(none)';
    const okExact = !expectName || got === expectName;
    const okArabic = r && /[؀-ۿ]/.test(got) && !/[a-zA-Z]/.test(got);
    check(`${q} ${lang} → "${expectName || '(any Arabic)'}" (got "${got}", src=${r?.source})`,
        okExact && okArabic);
    await sleep(150);
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
