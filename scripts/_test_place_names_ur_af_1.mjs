// scripts/_test_place_names_ur_af_1.mjs
// PLACE-NAMES-UR-AF-1 — Urdu SSR smoke test.
//
// Verifies after this batch:
//   1. /ur/prayer-times-in-<af-slug> now renders the explicit Urdu name
//      (not the absence-state "مقامی نام دستیاب نہیں" placeholder).
//   2. The Urdu name matches the user-approved value exactly.
//   3. The SSR meta tag `ssr-city-name-source` is `explicit-localized`
//      (no longer `missing-localized`).
//   4. No regression on /ar/ (bare URL) and /en/ pages.
import http from 'node:http';

function get(path) {
    return new Promise(r => {
        http.get({ host: 'localhost', port: 8080, path }, rs => {
            let b = '';
            rs.on('data', c => b += c);
            rs.on('end', () => r({ status: rs.statusCode, body: b }));
        }).on('error', () => r({ status: 0, body: '' }));
    });
}

function extractMeta(html, name) {
    const re = new RegExp('<meta\\s+name="' + name + '"\\s+content="([^"]*)"', 'i');
    const m = html.match(re);
    return m ? m[1] : '';
}

function extractCityNameDiv(html) {
    const m = html.match(/<div class="city-name" id="city-name"[^>]*>[\s\S]*?<\/div>/);
    return m ? m[0] : '';
}

function hasLatin(s)  { return /[A-Za-z]/.test(s || ''); }
function hasArabic(s) { return /[؀-ۿ]/.test(s || ''); }

// All 36 AF Urdu names (mirrors the apply script's FIXES).
const UR_EXPECTATIONS = [
    // User-listed (12 cities)
    { slug: 'kabul',          ur: 'کابل' },
    { slug: 'herat',          ur: 'ہرات' },
    { slug: 'mazar-e-sharif', ur: 'مزار شریف' },
    { slug: 'jalalabad',      ur: 'جلال آباد' },
    { slug: 'kunduz',         ur: 'کندوز' },
    { slug: 'kandahar',       ur: 'قندھار' },
    { slug: 'charikar',       ur: 'چاریکار' },
    { slug: 'pul-e-khumri',   ur: 'پل خمری' },
    { slug: 'pul-e-alam',     ur: 'پل علم' },
    { slug: 'sar-e-pul',      ur: 'سر پل' },
    { slug: 'fayroz-koh',     ur: 'فیروز کوہ' },
    { slug: 'qala-i-naw',     ur: 'قلعہ نو' },
    { slug: 'lashkar-gah',    ur: 'لشکر گاہ' },
    { slug: 'farah',          ur: 'فراه' },   // user override
    // Other 22 AF cities
    { slug: 'zaranj',         ur: 'زرنج' },
    { slug: 'taloqan',        ur: 'تالقان' },
    { slug: 'shibirghan',     ur: 'شبرغان' },
    { slug: 'sidqabad',       ur: 'سدق آباد' },
    { slug: 'aibak',          ur: 'آی بک' },
    { slug: 'qalat',          ur: 'قلات' },
    { slug: 'nili',           ur: 'نیلی' },
    { slug: 'maymana',        ur: 'میمنہ' },
    { slug: 'mehtar-lam',     ur: 'مہتر لام' },
    { slug: 'khost',          ur: 'خوست' },
    { slug: 'ghazni',         ur: 'غزنی' },
    { slug: 'gardez',         ur: 'گردیز' },
    { slug: 'fayzabad',       ur: 'فیض آباد' },
    { slug: 'bamyan',         ur: 'بامیان' },
    { slug: 'balkh',          ur: 'بلخ' },
    { slug: 'baghlan',        ur: 'بغلان' },
    { slug: 'asadabad',       ur: 'اسد آباد' },
    { slug: 'bazarak',        ur: 'بازارک' },
    { slug: 'sharan',         ur: 'شاران' },
    { slug: 'tarinkot',       ur: 'ترین کوٹ' },
    { slug: 'parun',          ur: 'پارون' },
    { slug: 'maydanshakhr',   ur: 'میدان شہر' },
];

// Cities to spot-check for ar/en non-regression
const NO_REGRESSION = [
    { slug: 'charikar',     ar: 'تشاريكار', en: 'Charikar' },
    { slug: 'kandahar',     ar: 'قندهار',   en: 'Kandahār' },
    { slug: 'kabul',        ar: 'كابل',     en: 'Kabul' },
    { slug: 'farah',        ar: 'فراه',     en: 'Farah' },     // ar === ur for this case
    { slug: 'lashkar-gah',  ar: 'لشكر جاه', en: 'Lashkar Gāh' },
];

let pass = 0, fail = 0;

console.log('═══ PLACE-NAMES-UR-AF-1 — Urdu SSR smoke test ═══');
console.log('');
console.log('── Urdu pages (36 AF cities): SSR must render explicit names.ur ──');
for (const t of UR_EXPECTATIONS) {
    const r = await get('/ur/prayer-times-in-' + t.slug);
    const cityName = extractMeta(r.body, 'ssr-city-name');
    const source = extractMeta(r.body, 'ssr-city-name-source');
    const ok = r.status === 200
        && source === 'explicit-localized'
        && cityName === t.ur
        && hasArabic(cityName)
        && !hasLatin(cityName);
    if (ok) {
        pass++;
        console.log('  ✓ /ur/prayer-times-in-' + t.slug.padEnd(22) + ' → "' + cityName + '" (source=explicit-localized)');
    } else {
        fail++;
        console.log('  ✗ /ur/prayer-times-in-' + t.slug.padEnd(22) + ' → "' + cityName + '" expected "' + t.ur + '" (source=' + source + ')');
    }
}

console.log('');
console.log('── No-regression: ar (bare) + en pages on same slugs ──');
for (const t of NO_REGRESSION) {
    const arResp = await get('/prayer-times-in-' + t.slug);
    const arName = extractMeta(arResp.body, 'ssr-city-name');
    const enResp = await get('/en/prayer-times-in-' + t.slug);
    const enName = extractMeta(enResp.body, 'ssr-city-name');
    const arOk = arName === t.ar;
    const enOk = enName === t.en;
    if (arOk && enOk) {
        pass++;
        console.log('  ✓ ' + t.slug.padEnd(20) + ' /ar="' + arName + '" /en="' + enName + '"');
    } else {
        fail++;
        console.log('  ✗ ' + t.slug.padEnd(20) + ' /ar="' + arName + '" (want ' + t.ar + ') /en="' + enName + '" (want ' + t.en + ')');
    }
}

console.log('');
console.log('── Critical check ──');
const charikarUr = await get('/ur/prayer-times-in-charikar');
const cityName = extractMeta(charikarUr.body, 'ssr-city-name');
const source = extractMeta(charikarUr.body, 'ssr-city-name-source');
const cityDiv = extractCityNameDiv(charikarUr.body);
const critOk = cityName === 'چاریکار'
    && source === 'explicit-localized'
    && !cityDiv.includes('مقامی نام دستیاب نہیں')   // absence label must NOT appear
    && !cityDiv.includes('city-name-absence-label')  // absence markup must NOT appear
    && !cityDiv.includes('city-name-en-secondary'); // secondary-en must NOT appear (no fallback)
console.log('  🚨 /ur/prayer-times-in-charikar must show "چاریکار" as PRIMARY (no absence label, no secondary en)');
console.log('  ' + (critOk
    ? '✓ PASS: rendered as "' + cityName + '" with source=explicit-localized + no absence markup'
    : '✗ FAIL: cityName="' + cityName + '" source=' + source + ' cityDiv=' + cityDiv.slice(0, 300)));

console.log('');
console.log('═'.repeat(60));
const total = UR_EXPECTATIONS.length + NO_REGRESSION.length;
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
process.exit(fail === 0 && critOk ? 0 : 1);
