// Phase Q-A4-b — Uniform Western numerals across all qibla SEO content.
//
// User reported the AR distance badge shows Arabic-Indic numerals
// "١٬٢٨٧ كم" while:
//   • AR bearing badge shows Western "136°" (inconsistent within AR)
//   • All other 9 langs show Western "1,287 km" (inconsistent across langs)
//
// Root cause: server.js:9544 used `_qaLang === 'ar' ? 'ar-EG' : 'en-US'`
// for distance only — bearing uses plain `String(_bearing)` (always Western).
//
// Fix: change to always use 'en-US' locale for distance (matches bearing
// + matches all other langs). The Arabic body paragraph still says
// "كيلومتر" — the digits inside become Western "1,287".

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(SRV_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);

if (/Phase Q-A4-b applied/.test(raw)) {
    throw new Error('Q-A4-b already applied');
}

function lfToEol(s) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

function replaceOnce(label, oldStr, newStr) {
    const oldNorm = lfToEol(oldStr);
    const newNorm = lfToEol(newStr);
    const cnt = raw.split(oldNorm).length - 1;
    if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
    raw = raw.replace(oldNorm, newNorm);
    console.log(`✓ ${label}`);
}

const QA4B_OLD = `                const _distanceStr = _escHtml(_distance.toLocaleString(_qaLang === 'ar' ? 'ar-EG' : 'en-US'));`;

const QA4B_NEW = `                // Phase Q-A4-b applied (2026-05-03): always use Western numerals for the
                // distance — matches the bearing badge ("244°", always Western via plain
                // String(_bearing)) and matches all 9 non-AR langs. Was previously using
                // 'ar-EG' locale for AR which produced Arabic-Indic numerals ("١٬٢٨٧")
                // — inconsistent with bearing and with other langs.
                const _distanceStr = _escHtml(_distance.toLocaleString('en-US'));`;

replaceOnce('Q-A4-b — distance numerals: ar-EG → en-US (uniform)', QA4B_OLD, QA4B_NEW);

writeFileSync(SRV_PATH, raw);

console.log('\n✅ Phase Q-A4-b complete.');
console.log('  • Distance badge AR: "١٬٢٨٧ كم" → "1,287 كم"');
console.log('  • Distance paragraph AR: "...قرابة ١٬٢٨٧..." → "...قرابة 1,287..."');
console.log('  • Now consistent with bearing badge AR (always Western "244°")');
console.log('  • Now consistent with all other 9 langs (Western "1,287 km")');
