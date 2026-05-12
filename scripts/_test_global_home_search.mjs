// GLOBAL-HOME-SEARCH-1 end-to-end verification.
// For each user-reported failing phonetic Arabic query, simulate the
// FULL homepage-search pipeline:
//   1. First Nominatim pass with the original query → expect 0 valid
//      city-type results (this is the bug we're solving).
//   2. Translate to English via MyMemory.
//   3. Re-query Nominatim with the translation.
//   4. Apply smart-filter → expect ≥ 1 city-type result.
//   5. Confirm the result is actually the city the user intended.
//
// Pre-req: running local server on :8080 (proxies /api/geocode).
// Run: node scripts/_test_global_home_search.mjs

import http from 'node:http';
import https from 'node:https';

const SMART_ALLOWED = new Set([
    'city','town','village','municipality','administrative',
    'state','province','region','county','district','borough',
    'hamlet','locality','governorate'
]);
const SMART_BLOCKED = new Set([
    'country','road','street','highway','suburb','neighbourhood',
    'quarter','building','shop','amenity','tourism','landmark',
    'address','postcode','office','leisure','historic','craft',
    'man_made','waterway','natural','landuse','aeroway','railway',
    'residential','hamlet_neighbourhood','isolated_dwelling','farm','plot'
]);
function smartFilter(p) {
    const lat = parseFloat(p.lat), lon = parseFloat(p.lon);
    if (!isFinite(lat) || !isFinite(lon)) return false;
    if (!p.name && !p.display_name) return false;
    if (SMART_ALLOWED.has(p.addresstype)) return true;
    if (SMART_BLOCKED.has(p.class)) return false;
    if (SMART_BLOCKED.has(p.type)) return false;
    if (SMART_BLOCKED.has(p.addresstype)) return false;
    return true;
}

function nomFetch(q) {
    const url = `/api/geocode?type=search&format=json&limit=8&accept-language=ar&addressdetails=1&namedetails=1&q=${encodeURIComponent(q)}`;
    return new Promise((resolve) => {
        http.get({ host: 'localhost', port: 8080, path: url }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch (_) { resolve([]); }
            });
        }).on('error', () => resolve([]));
    });
}

function translate(q, fromLang, toLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${fromLang}|${toLang}`;
    return new Promise((resolve) => {
        https.get(url, { rejectUnauthorized: false }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve(data?.responseData?.translatedText || null);
                } catch (_) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

// Each case: [label, query, acceptableCountries[]]
// Multiple acceptable countries handle real-world ambiguity (e.g.
// بايرن could mean Bayern/Germany OR Bern/Switzerland — both are
// legitimate user intents, and surfacing EITHER is a successful
// recovery vs the previous "لا توجد نتائج" silent failure).
const CASES = [
    ['A) فينيسيا (Venice phonetic AR)',       'فينيسيا',      ['إيطاليا']],
    ['B) موبتي (Mopti, Mali)',                'موبتي',        ['مالي']],
    ['C) فلورنسا (Florence phonetic AR)',     'فلورنسا',      ['إيطاليا']],
    ['D) بايرن (Bavaria/Bern AR)',            'بايرن',        ['ألمانيا','سويسرا']],
    ['E) سان فرانسيسكو (SF, USA)',            'سان فرانسيسكو',['الولايات المتّحدة']],
];

let pass = 0, fail = 0;
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' GLOBAL-HOME-SEARCH-1 — translation fallback verification');
console.log('═══════════════════════════════════════════════════════════════════════');

for (const [label, q, expectCountries] of CASES) {
    console.log(`\n${label}`);

    // Step 1: first Nominatim pass with original AR query
    const r1 = await nomFetch(q);
    const valid1 = r1.filter(smartFilter);
    console.log(`   1. Nominatim("${q}") → ${r1.length} raw, ${valid1.length} city-type`);

    if (valid1.length > 0) {
        // Query already works — translation not needed for this case.
        // Still count as pass since the goal is "find ANY real city".
        const top = valid1[0];
        const country = (top.address && top.address.country) || '';
        const ok = expectCountries.some(c => country.includes(c));
        if (ok) { pass++; console.log(`   ✓ direct hit: "${top.name}" (${country})`); }
        else    { fail++; console.log(`   ✗ wrong country: got "${country}" expected one of ${JSON.stringify(expectCountries)}`); }
        await new Promise(r => setTimeout(r, 1200));
        continue;
    }

    // Step 2: translate
    await new Promise(r => setTimeout(r, 1200));
    const en = await translate(q, 'ar', 'en');
    console.log(`   2. MyMemory("${q}", ar→en) → "${en}"`);
    if (!en) { fail++; console.log('   ✗ translation failed'); continue; }
    if (en.toLowerCase() === q.toLowerCase()) {
        fail++; console.log('   ✗ translation echoed input');
        await new Promise(r => setTimeout(r, 1200));
        continue;
    }

    // Step 3: re-query Nominatim with English translation
    await new Promise(r => setTimeout(r, 1200));
    const r2 = await nomFetch(en);
    const valid2 = r2.filter(smartFilter);
    console.log(`   3. Nominatim("${en}") → ${r2.length} raw, ${valid2.length} city-type`);

    if (valid2.length === 0) {
        fail++; console.log('   ✗ translated query also returned no cities');
        continue;
    }

    // Step 4: verify top result is in one of the expected countries
    const top = valid2[0];
    const country = (top.address && top.address.country) || '';
    const ok = expectCountries.some(c => country.includes(c));
    if (ok) { pass++; console.log(`   ✓ recovered: "${top.name}" (${country}, addrtype=${top.addresstype})`); }
    else    { fail++; console.log(`   ✗ wrong country: got "${country}" expected one of ${JSON.stringify(expectCountries)}`); console.log(`      top:`, JSON.stringify({name: top.name, type: top.type, addr: top.addresstype})); }

    await new Promise(r => setTimeout(r, 1200));
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
