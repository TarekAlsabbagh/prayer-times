// Phase M5 — moon Month-page edu link consistency cleanup.
//
// Issue (audit found post-M4):
//   The Month-page filler block at js/app.js line 15836-15917 is a duplicate
//   of the Hub block (16834+) that M2/M3 already cleaned up. The Month block
//   STILL has the old cross-city Riyadh-on-Makkah bug:
//
//     const _altCitySlug = (_citySlug === 'riyadh') ? 'makkah' : 'riyadh';
//     ...
//     _link2.setAttribute('href', _langPrefixEdu + '/moon-in-' + _altCitySlug);
//
//   So /moon-in-makkah/2026-05 (Month page) still shows
//   "تقويم القمر في الرياض" → /moon-in-riyadh as link 2 in the edu section.
//
//   M2 was scoped to Hub only — but the same bug exists on Month, just in a
//   different code path. Per user's "code cleanliness > strict scope" rule,
//   M5 extends the M2 fix to the Month block.
//
// Strategy: Replace the Month edu link block with a same-city alternative.
//   • _link1: "حالة القمر اليوم في {city}" → /moon-today-in-{slug}      (same as Hub, same-city)
//   • _link2: "تقويم القمر في {city}"      → /moon-in-{slug}               (parent Hub, same-city)
//             ^^^ Linking to the parent Hub from a Month page is natural
//             navigation upward — visitor can pick a different month from there.
//             Was: cross-city link to /moon-in-{altSlug} (Riyadh on Makkah).
//   • _link3: "التاريخ الهجري اليوم"        → /today-hijri-date          (generic, unchanged)
//
// Why parent-Hub for _link2 (not current/next month):
//   • Visitor is ALREADY on a specific month — linking back to itself = useless
//   • Parent Hub is THE natural "explore other months" gateway
//   • Different from M3's Hub _link2 (which goes to current month) because
//     Hub doesn't have a date context, but Month does
//
// Plus: Cleanup 2 stale/redundant comments in server.js M1 SSR injection block:
//   • Line 9255: "Section 1 — ... (covers month name + year + city + tag-line)"
//                → outdated (M4 added phase-name suffix). Update to mention M4.
//   • Line 9308: redundant "Section 2 — Phases waxing/waning..." below the M4
//                description block. Remove the duplicate.
//
// All same-pattern as prior phases:
//   • CRLF-safe replaceOnce
//   • Phase marker comments
//   • Header marker check (refuses to re-run)

import { readFileSync, writeFileSync } from 'node:fs';

const APP_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\js\\app.js';
const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';

let appRaw = readFileSync(APP_PATH, 'utf8');
let srvRaw = readFileSync(SRV_PATH, 'utf8');

const isCRLFapp = /\r\n/.test(appRaw);
const isCRLFsrv = /\r\n/.test(srvRaw);

if (/Phase M5 \(2026-05-03\)/.test(appRaw)) {
    throw new Error('[app.js] M5 already applied (header marker present)');
}

function lfToEol(s, isCRLF) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

function makeReplacer(getRaw, setRaw, isCRLF) {
    return function replaceOnce(label, oldStr, newStr) {
        const oldNorm = lfToEol(oldStr, isCRLF);
        const newNorm = lfToEol(newStr, isCRLF);
        const raw = getRaw();
        const cnt = raw.split(oldNorm).length - 1;
        if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
        setRaw(raw.replace(oldNorm, newNorm));
        console.log(`✓ ${label}`);
    };
}

const replaceApp = makeReplacer(() => appRaw, v => appRaw = v, isCRLFapp);
const replaceSrv = makeReplacer(() => srvRaw, v => srvRaw = v, isCRLFsrv);

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — Replace the Month-page edu filler block in app.js.
// Same scope as M2/M3 did for Hub block, applied to Month path.
// ═══════════════════════════════════════════════════════════════════════════
const APP_PART1_OLD = `                    // UAT-Moon-Month-Page-Polish: fill 3 cross-links at end of edu
                    //   section (the hub-block filler at line ~15728 doesn't run on
                    //   month URLs because \`_isHubPage\` is false). Without this,
                    //   the <a> elements stay as "—" placeholders.
                    try {
                        const _altCitySlug = (_citySlug === 'riyadh') ? 'makkah' : 'riyadh';
                        const _altCityName = (typeof _moonCityDisplayName === 'function')
                            ? _moonCityDisplayName(_altCitySlug)
                            : (_altCitySlug === 'makkah'
                                ? (_lng_ === 'ar' ? 'مكة المكرمة' : 'Makkah')
                                : (_lng_ === 'ar' ? 'الرياض' : 'Riyadh'));
                        const _langPrefixEdu = (_lng_ === 'ar') ? '' : ('/' + _lng_);
                        const _EDU_LINKS_BY_LANG = {
                            ar: [
                                \`حالة القمر اليوم في \${_cityName}\`,
                                \`تقويم القمر في \${_altCityName}\`,
                                'التاريخ الهجريّ اليوم'
                            ],
                            en: [
                                \`Moon status today in \${_cityName}\`,
                                \`Moon calendar in \${_altCityName}\`,
                                "Today's Hijri date"
                            ],
                            fr: [
                                \`État de la Lune aujourd'hui à \${_cityName}\`,
                                \`Calendrier lunaire à \${_altCityName}\`,
                                'Date hégirienne du jour'
                            ],
                            tr: [
                                \`\${_cityName}'de bugünkü ay durumu\`,
                                \`\${_altCityName} ay takvimi\`,
                                'Bugünün hicri tarihi'
                            ],
                            ur: [
                                \`\${_cityName} میں آج چاند کی حالت\`,
                                \`\${_altCityName} کا چاند کیلنڈر\`,
                                'آج کی ہجری تاریخ'
                            ],
                            de: [
                                \`Mondzustand heute in \${_cityName}\`,
                                \`Mondkalender in \${_altCityName}\`,
                                'Heutiges Hidschri-Datum'
                            ],
                            id: [
                                \`Status Bulan hari ini di \${_cityName}\`,
                                \`Kalender bulan di \${_altCityName}\`,
                                'Tanggal Hijriah hari ini'
                            ],
                            es: [
                                \`Estado de la Luna hoy en \${_cityName}\`,
                                \`Calendario lunar en \${_altCityName}\`,
                                'Fecha hijri de hoy'
                            ],
                            bn: [
                                \`\${_cityName}-এ আজ চাঁদের অবস্থা\`,
                                \`\${_altCityName}-এ চাঁদের ক্যালেন্ডার\`,
                                'আজকের হিজরি তারিখ'
                            ],
                            ms: [
                                \`Status Bulan hari ini di \${_cityName}\`,
                                \`Kalendar bulan di \${_altCityName}\`,
                                'Tarikh Hijrah hari ini'
                            ]
                        };
                        const _eduLinkLabels = _EDU_LINKS_BY_LANG[_lng_] || _EDU_LINKS_BY_LANG.en;
                        const _link1 = document.querySelector('.moon-city-hub-edu-link-today');
                        const _link2 = document.querySelector('.moon-city-hub-edu-link-other');
                        const _link3 = document.querySelector('.moon-city-hub-edu-link-hijri');
                        if (_link1) {
                            _link1.textContent = _eduLinkLabels[0];
                            _link1.setAttribute('href', _langPrefixEdu + '/moon-today-in-' + _citySlug);
                        }
                        if (_link2) {
                            _link2.textContent = _eduLinkLabels[1];
                            _link2.setAttribute('href', _langPrefixEdu + '/moon-in-' + _altCitySlug);
                        }
                        if (_link3) {
                            _link3.textContent = _eduLinkLabels[2];
                            // Don't override href — SSR already wrote the canonical
                            // dated form (/hijri-date/YYYY-MM-DD).
                        }
                    } catch (_) {}`;

const APP_PART1_NEW = `                    // Phase M5 (2026-05-03): fill 3 cross-links at end of Month-page edu
                    //   section. The hub-block filler (line ~16834) doesn't run on month
                    //   URLs because \`_isHubPage\` is false. Mirrors the M2/M3 Hub fix:
                    //     • _link1 → /moon-today-in-{slug}    (same-city, today's status)
                    //     • _link2 → /moon-in-{slug}           (same-city, parent Hub —
                    //                visitor can browse to a different month from there)
                    //     • _link3 → /hijri-date/YYYY-MM-DD   (SSR-canonical, not overridden)
                    //   Was (pre-M5): _link2 was a cross-city sister link to
                    //   /moon-in-{altSlug} ("تقويم القمر في الرياض" on Makkah's month
                    //   page — bad SEO/UX/topical-relevance). Cross-city navigation
                    //   stays in the dedicated #moon-other-cities section only.
                    try {
                        const _langPrefixEdu = (_lng_ === 'ar') ? '' : ('/' + _lng_);
                        const _EDU_LINKS_BY_LANG = {
                            ar: [\`حالة القمر اليوم في \${_cityName}\`, \`تقويم القمر في \${_cityName}\`, 'التاريخ الهجريّ اليوم'],
                            en: [\`Moon status today in \${_cityName}\`, \`Moon calendar in \${_cityName}\`, "Today's Hijri date"],
                            fr: [\`État de la Lune aujourd'hui à \${_cityName}\`, \`Calendrier lunaire à \${_cityName}\`, 'Date hégirienne du jour'],
                            tr: [\`\${_cityName}'de bugünkü ay durumu\`, \`\${_cityName} ay takvimi\`, 'Bugünün hicri tarihi'],
                            ur: [\`\${_cityName} میں آج چاند کی حالت\`, \`\${_cityName} کا چاند کیلنڈر\`, 'آج کی ہجری تاریخ'],
                            de: [\`Mondzustand heute in \${_cityName}\`, \`Mondkalender in \${_cityName}\`, 'Heutiges Hidschri-Datum'],
                            id: [\`Status Bulan hari ini di \${_cityName}\`, \`Kalender bulan di \${_cityName}\`, 'Tanggal Hijriah hari ini'],
                            es: [\`Estado de la Luna hoy en \${_cityName}\`, \`Calendario lunar en \${_cityName}\`, 'Fecha hijri de hoy'],
                            bn: [\`\${_cityName}-এ আজ চাঁদের অবস্থা\`, \`\${_cityName}-এ চাঁদের ক্যালেন্ডার\`, 'আজকের হিজরি তারিখ'],
                            ms: [\`Status Bulan hari ini di \${_cityName}\`, \`Kalendar bulan di \${_cityName}\`, 'Tarikh Hijrah hari ini']
                        };
                        const _eduLinkLabels = _EDU_LINKS_BY_LANG[_lng_] || _EDU_LINKS_BY_LANG.en;
                        const _link1 = document.querySelector('.moon-city-hub-edu-link-today');
                        const _link2 = document.querySelector('.moon-city-hub-edu-link-other');
                        const _link3 = document.querySelector('.moon-city-hub-edu-link-hijri');
                        if (_link1) {
                            _link1.textContent = _eduLinkLabels[0];
                            _link1.setAttribute('href', _langPrefixEdu + '/moon-today-in-' + _citySlug);
                        }
                        if (_link2) {
                            _link2.textContent = _eduLinkLabels[1];
                            _link2.setAttribute('href', _langPrefixEdu + '/moon-in-' + _citySlug);
                        }
                        if (_link3) {
                            _link3.textContent = _eduLinkLabels[2];
                            // Don't override href — SSR already wrote the canonical
                            // dated form (/hijri-date/YYYY-MM-DD).
                        }
                    } catch (_) {}`;

replaceApp('PART 1 — Month edu block: drop cross-city + 10-lang same-city labels', APP_PART1_OLD, APP_PART1_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — server.js comment cleanup #1: update Section 1 comment to reflect M4.
// ═══════════════════════════════════════════════════════════════════════════
const SRV_PART2_OLD = `                // Section 1 — Monthly title H2 (covers month name + year + city + tag-line)`;

const SRV_PART2_NEW = `                // Section 1 — Monthly title H2. Covers month name + year + city
                //   + phase-name suffix (Hilal/Gibbous/Full Moon — added by Phase M4).`;

replaceSrv('PART 2 — server.js: update stale Section 1 comment to mention M4', SRV_PART2_OLD, SRV_PART2_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — server.js comment cleanup #2: remove duplicate Section 2 comment.
// The M4 description block already explains what Section 2 covers — the
// trailing "// Section 2 — Phases waxing/waning..." line is redundant.
// ═══════════════════════════════════════════════════════════════════════════
const SRV_PART3_OLD = `                // Phase M4 (2026-05-03): rewrote Section 2 H2 to surface "متزايد + متناقص
                // + تقويم القمر" (waxing/waning + moon calendar) keywords. New H2 uses
                // {city} marker for clean per-lang interpolation regardless of city
                // position (start vs end), replacing the previous ternary chain.
                // Section 2 — Phases waxing/waning (covers متزايد + متناقص + تقويم القمر).
                const _m1Sec2H2 = {`;

const SRV_PART3_NEW = `                // Section 2 — Phases waxing/waning H2. Covers متزايد + متناقص +
                //   تقويم القمر. Uses {city} marker for clean per-lang interpolation
                //   regardless of city position (start for TR/UR/BN, end for others).
                //   Phase M4 (2026-05-03) replaced the previous ternary-chain builder.
                const _m1Sec2H2 = {`;

replaceSrv('PART 3 — server.js: consolidate duplicate Section 2 comment', SRV_PART3_OLD, SRV_PART3_NEW);

writeFileSync(APP_PATH, appRaw);
writeFileSync(SRV_PATH, srvRaw);

console.log('\n✅ Phase M5 — moon Month-page edu cleanup complete.');
console.log('\nChanges applied:');
console.log('  • app.js Month edu block: drop _altCitySlug, _link2 → /moon-in-{slug} (same-city parent Hub)');
console.log('  • app.js: 10 langs all use { _cityName } only (no cross-city refs)');
console.log('  • server.js: updated Section 1 comment to mention M4 phase-name suffix');
console.log('  • server.js: consolidated duplicate Section 2 comment block');
console.log('\nNo Riyadh link inside Makkah Month page anymore. Cross-city stays in');
console.log('the dedicated #moon-other-cities section.');
