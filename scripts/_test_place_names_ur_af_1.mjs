// scripts/_test_place_names_ur_af_1.mjs
// PLACE-NAMES-UR-AF-1 — Urdu SSR smoke test.
//
// Verifies after this batch (commit-to-be at HEAD):
//   1. /ur/prayer-times-in-<af-slug> renders the new names.ur value
//      (not the previous fillchain Latin).
//   2. The 13 user-listed cities match user's expected Urdu form exactly.
//   3. SSR meta `<meta name="ssr-city-name" content="...">` carries the
//      Urdu string (Latin chars absent, Arabic-block chars present).
//   4. /ar/ (bare URL) and /en/ pages unaffected.
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

function hasLatin(s)  { return /[A-Za-z]/.test(s || ''); }
function hasArabic(s) { return /[؀-ۿ]/.test(s || ''); }

// All 36 AF Urdu names (mirrors the apply script's FIXES).
const UR_EXPECTATIONS = [
    // 13 user-listed cities first
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
    // Other 22
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

const NO_REGRESSION = [
    { slug: 'charikar',     ar: 'تشاريكار', en: 'Charikar' },
    { slug: 'kandahar',     ar: 'قندهار',   en: 'Kandahār' },
    { slug: 'kabul',        ar: 'كابل',     en: 'Kabul' },
    { slug: 'farah',        ar: 'فراه',     en: 'Farah' },
    { slug: 'lashkar-gah',  ar: 'لشكر جاه', en: 'Lashkar Gāh' },
];

let pass = 0, fail = 0;

console.log('═══ PLACE-NAMES-UR-AF-1 — Urdu SSR smoke test ═══');
console.log('');
console.log('── 36 Urdu pages — SSR must render real Urdu names ──');
for (const t of UR_EXPECTATIONS) {
    const r = await get('/ur/prayer-times-in-' + t.slug);
    const cityName = extractMeta(r.body, 'ssr-city-name');
    const ok = r.status === 200
        && cityName === t.ur
        && hasArabic(cityName)
        && !hasLatin(cityName);
    if (ok) {
        pass++;
        console.log('  ✓ /ur/prayer-times-in-' + t.slug.padEnd(22) + ' → "' + cityName + '"');
    } else {
        fail++;
        console.log('  ✗ /ur/prayer-times-in-' + t.slug.padEnd(22) + ' → "' + cityName + '" expected "' + t.ur + '"');
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
console.log('── 🚨 CRITICAL CHECK: /ur/prayer-times-in-charikar must show چاریکار (not Charikar) ──');
const charikarUr = await get('/ur/prayer-times-in-charikar');
const charikarName = extractMeta(charikarUr.body, 'ssr-city-name');
const charikarOk = charikarName === 'چاریکار'
    && hasArabic(charikarName)
    && !hasLatin(charikarName);
console.log(charikarOk
    ? '  ✓ PASS: /ur/charikar shows "' + charikarName + '" (real Urdu, no Latin)'
    : '  ✗ FAIL: /ur/charikar shows "' + charikarName + '"');

console.log('');
console.log('═'.repeat(60));
const total = UR_EXPECTATIONS.length + NO_REGRESSION.length;
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
process.exit(fail === 0 && charikarOk ? 0 : 1);
