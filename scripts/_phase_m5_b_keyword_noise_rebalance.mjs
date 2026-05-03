// Phase M5-b — moon-in-{city} keyword noise re-balance.
//
// Note on naming: the previously-shipped commit `03f4741` was originally
// labeled "Phase M5 — moon Month edu link consistency cleanup". Per user's
// new directive (separate phases for separate concerns), it is retroactively
// renamed M5-a (link consistency). This phase = M5-b (keyword noise).
//
// Problem (SEOptimer post-M4):
//   Keyword Consistency still flags high-frequency dynamic terms that
//   originate from the moon-hub calendar table:
//     • "بعد" appearing 38× (each future cell shows "بعد X يومًا"/"بعد X أيّام")
//     • "يومًا" appearing 21× (every cell with offset ≥ 11 days)
//     • "متناقص" appearing in body but not in any heading
//   These are not real keywords — they're a side-effect of the formatter.
//
// User's explicit M5-b brief:
//   1. Do NOT change Title/Meta/H1.
//   2. Do NOT touch /moon-today or /moon-today-in-{city} (formatter gated
//      by _isMoonHubPageSsr — naturally scoped to Hub + Month only ✅).
//   3. Reduce repetitive AR wording in phase table:
//      "بعد X يومًا" → "خلال X أيام" (eliminates "بعد" entirely from
//      future cells, keeps "قبل X" for past cells unchanged).
//   4. Optional: add "المتناقص" to a single H2 (M4 Section 1 suffix).
//   5. Keep meaning identical, preserve grammatical correctness.
//   6. 10 languages: only AR formatter changes (other 9 langs stay).
//
// Blast radius (audited):
//   `_hubCalDaysFmt` is defined at server.js:8868 and called at line 9032,
//   both inside `if (_isMoonHubPageSsr && MoonCalc && ...)` (line 8833).
//   So ONLY:
//     • /moon-in-{city}            ✅ (target)
//     • /moon-in-{city}/{YYYY-MM}  ✅ (acceptable per user's "بحذر" note)
//   These pages will see the new "خلال" wording.
//   NOT affected: /moon-today, /moon-today-in-{city}, /moon-in-{city}/{date}
//
// AR semantic note:
//   "بعد {n}" = literally "after {n}" — could mean "after a duration of {n}".
//   "خلال {n}" = literally "within/during {n}" — broadly used to mean
//                "in the next {n}". User explicitly approved the swap.
//   "قبل {n}" (past) is left UNCHANGED — there's no equivalent reduction
//   path for past cells (they're already "قبل X = X ago").

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(SRV_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/Phase M5-b \(2026-05-03\)/.test(raw)) {
    throw new Error('[server.js] M5-b already applied (header marker present)');
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

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — AR formatter: "بعد X" → "خلال X" for FUTURE cells.
// "قبل X" for past UNCHANGED (no equivalent reduction).
// Header comment updated to reflect M5-b rationale + remove obsolete note.
// ═══════════════════════════════════════════════════════════════════════════
const PART1_OLD = `                // UAT-Moon-City-Hub-Polish: full Arabic plural ruleset
                //   1 → "يوم" (singular, no number prefix — cleaner Arabic)
                //   2 → "يومين" (dual)
                //   3-10 → "{n} أيّام" (sound plural)
                //   11+ → "{n} يومًا" (singular accusative for tamyiz)
                // Was: only n=2 special-cased; "قبل 29 أيّام" rendered grammatically wrong.
                const _hubCalDaysFmt = {
                    ar: (n) => {
                        const _abs = Math.abs(n);
                        let _unit;
                        if (_abs === 1)               _unit = 'يوم';
                        else if (_abs === 2)          _unit = 'يومين';
                        else if (_abs >= 3 && _abs <= 10) _unit = \`\${_abs} أيّام\`;
                        else                          _unit = \`\${_abs} يومًا\`;
                        return n > 0 ? \`بعد \${_unit}\` : \`قبل \${_unit}\`;
                    },`;

const PART1_NEW = `                // Arabic plural ruleset for relative-day labels:
                //   1 → "يوم" (singular)
                //   2 → "يومين" (dual)
                //   3-10 → "{n} أيّام" (sound plural)
                //   11+ → "{n} يومًا" (singular accusative for tamyiz)
                // Phase M5-b (2026-05-03): future cells use "خلال {n}" instead of
                // "بعد {n}" to reduce SEOptimer Keyword Consistency noise (the word
                // "بعد" was repeated ~14× per Hub page across calendar future cells +
                // upcoming-phases summaries). "قبل {n}" for past UNCHANGED — there's
                // no equivalent reduction path for past cells.
                const _hubCalDaysFmt = {
                    ar: (n) => {
                        const _abs = Math.abs(n);
                        let _unit;
                        if (_abs === 1)               _unit = 'يوم';
                        else if (_abs === 2)          _unit = 'يومين';
                        else if (_abs >= 3 && _abs <= 10) _unit = \`\${_abs} أيّام\`;
                        else                          _unit = \`\${_abs} يومًا\`;
                        return n > 0 ? \`خلال \${_unit}\` : \`قبل \${_unit}\`;
                    },`;

replaceOnce('PART 1 — AR formatter: بعد → خلال (future cells only)', PART1_OLD, PART1_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — Optional: append "المتناقص" / "Waning" / etc. to M4 Section 1
// H2 suffix so the "متناقص" keyword surfaces in a heading too.
// Per user: "إذا بقيت [حمراء]، يمكن فقط تعديل H2 واحد ليكون أطوار القمر
// في مايو 2026: الهلال والأحدب والبدر والمتناقص — لكن لا تكثر."
// ═══════════════════════════════════════════════════════════════════════════
const PART2_OLD = `                // Phase M4 (2026-05-03): suffix the H2 with phase names so SEOptimer's
                // Keyword Consistency check sees "هلال/أحدب/بدر" inside a heading
                // (currently they live only in the body paragraph).
                const _m1Sec1H2Suffix = {
                    ar: ': الهلال والأحدب والبدر',
                    en: ': Crescent, Gibbous, and Full Moon',
                    fr: ' : croissant, gibbeuse et pleine Lune',
                    tr: ': Hilal, Şişkin Ay ve Dolunay',
                    ur: '، ہلال، گبس اور بدر',
                    de: ': Sichel, Halbmond und Vollmond',
                    id: ': Sabit, Gibbous, dan Purnama',
                    es: ': Creciente, Gibosa y Llena',
                    bn: ': অর্ধচন্দ্র, গিবাস ও পূর্ণিমা',
                    ms: ': Sabit, Gibbous, dan Purnama'
                };`;

const PART2_NEW = `                // Phase M4 (2026-05-03) + M5-b (2026-05-03): suffix the H2 with phase
                // names so SEOptimer's Keyword Consistency check sees the phase keywords
                // inside a heading (M4 added هلال/أحدب/بدر; M5-b adds متناقص = waning,
                // the last frequently-flagged phase term still missing from any H2).
                const _m1Sec1H2Suffix = {
                    ar: ': الهلال والأحدب والبدر والمتناقص',
                    en: ': Crescent, Gibbous, Full Moon, and Waning',
                    fr: ' : croissant, gibbeuse, pleine Lune et décroissante',
                    tr: ': Hilal, Şişkin Ay, Dolunay ve Küçülen',
                    ur: '، ہلال، گبس، بدر اور گھٹتا',
                    de: ': Sichel, Halbmond, Vollmond und abnehmend',
                    id: ': Sabit, Gibbous, Purnama, dan Menyusut',
                    es: ': Creciente, Gibosa, Llena y Menguante',
                    bn: ': অর্ধচন্দ্র, গিবাস, পূর্ণিমা ও হ্রাসমান',
                    ms: ': Sabit, Gibbous, Purnama, dan Mengecil'
                };`;

replaceOnce('PART 2 — Section 1 H2 suffix: append متناقص/Waning (10 langs)', PART2_OLD, PART2_NEW);

writeFileSync(SRV_PATH, raw);

console.log('\n✅ Phase M5-b — keyword noise re-balance complete.');
console.log('\nChanges applied (server.js):');
console.log('  • AR formatter: "بعد {n}" → "خلال {n}" for future calendar cells');
console.log('    (eliminates ~14× "بعد" per Hub page; "قبل {n}" past unchanged)');
console.log('  • Section 1 H2 suffix: appended "المتناقص"/"Waning"/etc. (10 langs)');
console.log('\nBlast radius (formatter):');
console.log('  • /moon-in-{city}            ← affected (target)');
console.log('  • /moon-in-{city}/{YYYY-MM}  ← affected (acceptable)');
console.log('  • /moon-today / today-city / date pages  ← NOT affected');
console.log('\nNo Title/Meta/H1 change. Past cells "قبل X" UNCHANGED.');
