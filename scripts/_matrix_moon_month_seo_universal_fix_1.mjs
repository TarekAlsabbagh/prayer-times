// MOON-CITY-MONTH-SEO-UNIVERSAL-FIX-1 — EXHAUSTIVE matrix validation (pure function).
//
// Imports the real fitter (js/moon-month-seo.js) and sweeps the FULL input space:
//   10 langs × 12 real month names × city-name lengths N = 2..30 codepoints
//   (+ explicit real cases: ar/Madrid/January, Santiago de Querétaro ×10, Riyadh ×10).
// Asserts: title ∈ [50,60] and meta ∈ [120,160] for every case in the REALISTIC city-name
// range (N ≤ 24 cp — covers the longest curated display name, "Santiago de Querétaro" = 21).
// N = 25..30 is reported as informational (no curated city is that long).
//
// Run: node scripts/_matrix_moon_month_seo_universal_fix_1.mjs
import seo from '../js/moon-month-seo.js';
const { fitMonthTitle, fitMonthDesc, cpLen } = seo;

const langs = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];

// Real localized Gregorian month names (mirror server.js _gMonthFullByLangT).
const MONTHS = {
    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
    tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
    ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
    es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
    bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
    ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']
};

const TLO = 50, THI = 60, DLO = 120, DHI = 160;
const REAL_MIN = 3, REAL_MAX = 24;   // realistic curated city-name codepoint range (MUST pass)
const SWEEP_MAX = 30;                 // informational ceiling
const YEARS = ['2026', '2027'];
const city = (n) => 'x'.repeat(n);    // codepoint length is all that matters for fit

let pass = 0, fail = 0;
const fails = [];
const ck = (ok, label) => { if (ok) pass++; else { fail++; fails.push(label); } };

// ── 1) Full sweep: every lang × month × N(real) × year ──
const perLang = {};
for (const l of langs) {
    let tIn = 0, tOut = 0, dIn = 0, dOut = 0;
    let tMin = 999, tMax = 0, dMin = 999, dMax = 0;
    let ceilN = 0; // max N (up to SWEEP_MAX) where title still ≤60 for ALL months
    for (let n = REAL_MIN; n <= REAL_MAX; n++) {
        for (let mi = 0; mi < 12; mi++) {
            for (const y of YEARS) {
                const t = fitMonthTitle(l, city(n), MONTHS[l][mi], y);
                const d = fitMonthDesc(l, city(n), MONTHS[l][mi], y);
                const tn = cpLen(t), dn = cpLen(d);
                tMin = Math.min(tMin, tn); tMax = Math.max(tMax, tn);
                dMin = Math.min(dMin, dn); dMax = Math.max(dMax, dn);
                const tOk = tn >= TLO && tn <= THI;
                const dOk = dn >= DLO && dn <= DHI;
                if (tOk) tIn++; else { tOut++; if (fails.length < 60) fails.push(`TITLE ${l} N=${n} ${MONTHS[l][mi]} ${y} → ${tn}  "${t}"`); }
                if (dOk) dIn++; else { dOut++; if (fails.length < 60) fails.push(`META  ${l} N=${n} ${MONTHS[l][mi]} ${y} → ${dn}`); }
                if (!tOk) fail++; else pass++;
                if (!dOk) fail++; else pass++;
            }
        }
    }
    // ceiling sweep (informational)
    for (let n = REAL_MIN; n <= SWEEP_MAX; n++) {
        let allUnder = true;
        for (let mi = 0; mi < 12; mi++) {
            const t = fitMonthTitle(l, city(n), MONTHS[l][mi], '2026');
            if (cpLen(t) > THI) { allUnder = false; break; }
        }
        if (allUnder) ceilN = n;
    }
    perLang[l] = { tIn, tOut, dIn, dOut, tMin, tMax, dMin, dMax, ceilN };
}

console.log('── Per-lang sweep: N=' + REAL_MIN + '..' + REAL_MAX + ' cp × 12 months × 2 years (MUST be 0 OUT) ──');
console.log('lang | title IN/OUT  [min..max] | meta IN/OUT [min..max] | safe-N≤');
for (const l of langs) {
    const p = perLang[l];
    console.log(
        `${l.padEnd(4)} |  ${String(p.tIn).padStart(3)}/${String(p.tOut).padEnd(3)}  [${p.tMin}..${p.tMax}]`.padEnd(38)
        + `|  ${String(p.dIn).padStart(3)}/${String(p.dOut).padEnd(3)} [${p.dMin}..${p.dMax}]`.padEnd(26)
        + `| ${p.ceilN}`
    );
}

// ── 2) Explicit real cases ──
console.log('\n── Explicit real-world cases ──');
const realCases = [
    ['ar', 'مدريد', 0, '2026', 'ar/Madrid/January (the reported regression)'],
    ['en', 'Madrid', 0, '2026', 'en/Madrid/January'],
    ['fr', 'Madrid', 0, '2026', 'fr/Madrid/January'],
];
for (const [l, c, mi, y, lbl] of realCases) {
    const t = fitMonthTitle(l, c, MONTHS[l][mi], y); const n = cpLen(t);
    ck(n >= TLO && n <= THI, lbl);
    console.log(`  ${(n >= TLO && n <= THI) ? '✓' : '✗'} ${lbl}: T=${n}  "${t}"`);
}

console.log('\n  Santiago de Querétaro / June 2026 (long city, all langs):');
for (const l of langs) {
    const t = fitMonthTitle(l, 'Santiago de Querétaro', MONTHS[l][5], '2026'); const n = cpLen(t);
    const d = fitMonthDesc(l, 'Santiago de Querétaro', MONTHS[l][5], '2026'); const dn = cpLen(d);
    ck(n >= TLO && n <= THI, `Santiago title ${l}`);
    ck(dn >= DLO && dn <= DHI, `Santiago meta ${l}`);
    console.log(`  ${(n >= TLO && n <= THI && dn >= DLO && dn <= DHI) ? '✓' : '✗'} ${l}: T=${n} M=${dn}  "${t}"`);
}

console.log('\n  Riyadh / June 2026 (short city, all langs):');
for (const l of langs) {
    const cityR = { ar: 'الرياض', en: 'Riyadh', fr: 'Riyad', tr: 'Riyad', ur: 'ریاض', de: 'Riad', id: 'Riyadh', es: 'Riad', bn: 'রিয়াদ', ms: 'Riyadh' }[l];
    const t = fitMonthTitle(l, cityR, MONTHS[l][5], '2026'); const n = cpLen(t);
    const d = fitMonthDesc(l, cityR, MONTHS[l][5], '2026'); const dn = cpLen(d);
    ck(n >= TLO && n <= THI, `Riyadh title ${l}`);
    ck(dn >= DLO && dn <= DHI, `Riyadh meta ${l}`);
    console.log(`  ${(n >= TLO && n <= THI && dn >= DLO && dn <= DHI) ? '✓' : '✗'} ${l}: T=${n} M=${dn}  "${t}"`);
}

// ── Verdict ──
const realOut = langs.reduce((a, l) => a + perLang[l].tOut + perLang[l].dOut, 0);
console.log(`\n${(fail === 0) ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed   (realistic-range OUT-of-window: ${realOut})`);
if (fail > 0) {
    console.log('\nFirst out-of-range / failed cases:');
    for (const f of fails.slice(0, 40)) console.log('  ✗ ' + f);
}
process.exit(fail === 0 ? 0 : 1);
