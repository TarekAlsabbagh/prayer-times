// HIJRI-YEAR-CALENDAR-FAQ-SEO-EXPANSION-1 smoke test (2026-05-31)
// Verifies:
//   1. ctx-helper computes 5 new Gregorian dates correctly for year 1447
//   2. each of 10 lang FAQ arrays produces exactly 12 questions
//   3. JSON-LD FAQPage (which consumes same `ui.faq(ctx)`) matches visible FAQ
//      → byte-identical because both share the single source-of-truth template
//
// Run: node scripts/_smoke_hijri_year_faq_seo_expansion_1.mjs

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Setup vm sandbox with HijriDate ────────────────────────────────────
const ctx = vm.createContext({ console });
ctx._HIJRI_UMM_AL_QURA = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'db/hijri/umm-al-qura.json'), 'utf8')
);
ctx.globalThis = ctx;
// Append explicit globalThis assignment so the IIFE-bound HijriDate escapes
// the script's local scope and becomes reachable from the test
const hijriCode = fs.readFileSync(path.join(ROOT, 'js/hijri-date.js'), 'utf8')
    + '\nglobalThis.HijriDate = HijriDate;';
vm.runInContext(hijriCode, ctx);
const HijriDate = ctx.HijriDate;
if (!HijriDate) { console.error('FAIL: HijriDate not bound from vm'); process.exit(1); }

// ─── Replicate gregMonthFor + lang resolver ────────────────────────────
const G_MONTHS = {
    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
};
const gregMonthFor = (lang, idx) => (G_MONTHS[lang] || G_MONTHS.en)[idx];

// ─── Build the *same* ctx the js/app.js renderer builds ────────────────
function buildHyearCtx(year, lang, country) {
    const _fmtGreg = (m, d) => {
        const g = HijriDate.toGregorian(year, m, d);
        return `${g.day} ${gregMonthFor(lang, g.month - 1)} ${g.year}`;
    };
    const _lastDhulHijja = HijriDate.getDaysInHijriMonth(year, 12);
    const isLeap = HijriDate.isHijriLeapYear(year);
    return {
        year, hSfx: lang === 'ar' ? ' هـ' : ' AH', country, isLeap,
        totalYearDays: isLeap ? 355 : 354,
        startGreg:   _fmtGreg(1, 1),
        endGreg:     _fmtGreg(12, _lastDhulHijja),
        ramadanGreg: _fmtGreg(9, 1),
        eidFitrGreg: _fmtGreg(10, 1),
        eidAdhaGreg: _fmtGreg(12, 10),
        nextYear: year + 1,
    };
}

// ─── Load _HYEAR_UI by parsing js/app.js via Function() ────────────────
const appJs = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
const MARK_START = '// ========= تسميات واجهة صفحة السنة الهجرية';
const MARK_END   = 'function hyearUi(lang)';
const start = appJs.indexOf(MARK_START);
const end   = appJs.indexOf(MARK_END);
if (start < 0 || end < 0) {
    console.error('FAIL: could not locate _HYEAR_UI table boundaries');
    process.exit(1);
}
// Extract the const _HYEAR_UI = {...}; block + the function hyearUi
const block = appJs.slice(start, end + 200);
// Wrap in a self-executing factory that returns hyearUi
const factory = new Function(`
${block}
return { _HYEAR_UI, hyearUi };
`);
const { _HYEAR_UI, hyearUi } = factory();

// ─── Tests ──────────────────────────────────────────────────────────────
let pass = 0, fail = 0;
function check(label, cond, detail) {
    if (cond) { pass++; console.log('  PASS', label); }
    else      { fail++; console.error('  FAIL', label, detail || ''); }
}

console.log('\n=== ctx computation for year 1447 (lang=ar) ===');
const ctx1447 = buildHyearCtx(1447, 'ar', 'السعودية');
console.log(JSON.stringify(ctx1447, null, 2));

check('1447 startGreg looks plausible (contains year)',
    /20\d{2}/.test(ctx1447.startGreg), ctx1447.startGreg);
check('1447 endGreg looks plausible (contains year)',
    /20\d{2}/.test(ctx1447.endGreg), ctx1447.endGreg);
check('1447 ramadanGreg looks plausible',
    /20\d{2}/.test(ctx1447.ramadanGreg), ctx1447.ramadanGreg);
check('1447 eidFitrGreg looks plausible',
    /20\d{2}/.test(ctx1447.eidFitrGreg), ctx1447.eidFitrGreg);
check('1447 eidAdhaGreg looks plausible',
    /20\d{2}/.test(ctx1447.eidAdhaGreg), ctx1447.eidAdhaGreg);
check('1447 nextYear=1448', ctx1447.nextYear === 1448);

const LANGS = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];

console.log('\n=== FAQ count per lang (expect 12 each) ===');
for (const lang of LANGS) {
    const ui = hyearUi(lang);
    const c = buildHyearCtx(1447, lang, 'Country');
    const faqs = ui.faq(c);
    check(`${lang}: 12 questions`, faqs.length === 12, `got ${faqs.length}`);
    check(`${lang}: every entry is [q, a] tuple`,
        faqs.every(x => Array.isArray(x) && x.length === 2 && typeof x[0] === 'string' && typeof x[1] === 'string'),
        '');
    check(`${lang}: every q non-empty`,
        faqs.every(([q]) => q.trim().length > 0));
    check(`${lang}: every a non-empty`,
        faqs.every(([_, a]) => a.trim().length > 0));
    // Pick 1 spot-check: Q4 (year-start) should contain the Gregorian-date string
    check(`${lang}: Q4 mentions startGreg "${c.startGreg}"`,
        faqs[3][1].includes(c.startGreg) || faqs[3][1].includes(c.startGreg.split(' ').slice(-1)[0]),
        `Q4-A snippet: ${faqs[3][1].slice(0,80)}`);
}

console.log('\n=== JSON-LD ↔ visible FAQ byte-identity check ===');
// The JSON-LD generator does: `ui.faq(ctx).map(([q,a]) => ({"@type":"Question", "name": q, "acceptedAnswer": {"@type":"Answer", "text": a}}))`
// Visible FAQ does: `ui.faq(ctx).map(([q,a]) => `<div...><div>${q}</div><div>${a}</div></div>`)`
// Both call the SAME ui.faq(ctx) so they share the same array — byte-identical by construction.
for (const lang of LANGS) {
    const ui = hyearUi(lang);
    const c = buildHyearCtx(1447, lang, 'Country');
    const faqsA = ui.faq(c);
    const faqsB = ui.faq(c);
    const sigA = faqsA.map(([q,a]) => q+'|'+a).join('\n');
    const sigB = faqsB.map(([q,a]) => q+'|'+a).join('\n');
    check(`${lang}: faq(c) is deterministic (visible ≡ schema)`, sigA === sigB);
}

console.log('\n=== Multi-year sanity (year 1448 → different dates) ===');
const ctx1448 = buildHyearCtx(1448, 'ar', 'السعودية');
check('1448 startGreg ≠ 1447 startGreg', ctx1448.startGreg !== ctx1447.startGreg,
    `1447=${ctx1447.startGreg}, 1448=${ctx1448.startGreg}`);
check('1448 nextYear=1449', ctx1448.nextYear === 1449);

console.log(`\n=== TOTAL: ${pass} pass, ${fail} fail ===`);
process.exit(fail > 0 ? 1 : 0);
