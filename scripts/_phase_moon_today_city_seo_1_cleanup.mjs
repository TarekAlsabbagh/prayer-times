// MOON-TODAY-CITY-SEO-1 cleanup (2026-05-11)
// Replaces the dead `_MOON_TODAY_CITY_DESC_FORMS_OLD` var + the old keyword-list
// `_moonDesc = {...}` in server.js with a length-aware Meta ladder.
// Idempotent: refuses to run if marker already present.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const SERVER_PATH = path.resolve(__dirname, '..', 'server.js');

let src = fs.readFileSync(SERVER_PATH, 'utf8');
const MARKER = 'MOON-TODAY-CITY-SEO-1 (2026-05-11): length-aware Meta ladder';
if (src.includes(MARKER)) {
    console.log('Marker already present — refusing to re-run.');
    process.exit(0);
}

// Locate the dead var declaration anchor + the end of `_moonDesc`.
const startAnchor = '                const _MOON_TODAY_CITY_DESC_FORMS_OLD = {';
const startIdx = src.indexOf(startAnchor);
if (startIdx === -1) {
    console.error('Start anchor not found:', JSON.stringify(startAnchor));
    process.exit(1);
}

// Find the end: scan forward for the FIRST `                };\n` that closes
// `_moonDesc`. The structure is:
//   const _MOON_TODAY_CITY_DESC_FORMS_OLD = { ... };  <-- close 1
//   _moonDesc = { ... };                              <-- close 2 (what we want)
// So we need to skip the first `};` and stop at the second.
let cursor = startIdx;
let closes = 0;
let endIdx = -1;
// File uses CRLF line endings on Windows; match either.
const closeNeedle = src.includes('\r\n') ? '\r\n                };\r\n' : '\n                };\n';
while (true) {
    const i = src.indexOf(closeNeedle, cursor);
    if (i === -1) break;
    closes++;
    cursor = i + closeNeedle.length;
    if (closes === 2) {
        // endIdx = position just after `                };\n`
        endIdx = cursor;
        break;
    }
}
if (endIdx === -1) {
    console.error('Could not locate the close of `_moonDesc` block (expected 2nd "                };" line).');
    process.exit(1);
}

const before = src.slice(0, startIdx);
const after  = src.slice(endIdx);
const removed = src.slice(startIdx, endIdx);

console.log('Removing block (',  removed.split('\n').length, ' lines)');
console.log('First line removed:', removed.split('\n')[0]);
console.log('Last line removed: ', removed.split('\n').slice(-2)[0]);

const replacement = `                // MOON-TODAY-CITY-SEO-1 (2026-05-11): length-aware Meta ladder
                // per lang. Same pattern as the Title ladder above. Picks the
                // long form when len in [120, 160], otherwise the short form
                // (~115 cp). Guarantees SEOptimer-green Meta for long city
                // names like "The Holy City of Mecca".
                const _MOON_TODAY_CITY_DESC_FORMS = {
                    ar: c => ({
                        long:  \`حالة القمر اليوم في \${c}: الطور الحالي ونسبة الإضاءة، عمر القمر، شروق وغروب القمر، والبدر القادم، مع تقويم القمر الشهريّ.\`,
                        short: \`اعرف حالة القمر اليوم في \${c}: الطور والإضاءة وعمر القمر، مع شروق وغروب القمر والبدر القادم.\`,
                    }),
                    en: c => ({
                        long:  \`Today's moon in \${c}: current phase, illumination, moon age, moonrise and moonset, next full moon, plus a link to the monthly moon calendar.\`,
                        short: \`Moon today in \${c}: phase, illumination, moon age, moonrise and moonset, and the next full moon.\`,
                    }),
                    fr: c => ({
                        long:  \`Lune aujourd'hui à \${c} : phase, illumination, âge, lever et coucher, prochaine pleine lune, avec lien vers le calendrier lunaire mensuel.\`,
                        short: \`Lune aujourd'hui à \${c} : phase, illumination, âge, lever et coucher, et prochaine pleine lune.\`,
                    }),
                    tr: c => ({
                        long:  \`\${c} için bugün ay: mevcut evre, aydınlanma, yaş, doğuş ve batış, sonraki dolunay; aylık ay takvimine bağlantıyla.\`,
                        short: \`\${c} için bugün ay: evre, aydınlanma, yaş, doğuş ve batış, sonraki dolunay bilgileri.\`,
                    }),
                    ur: c => ({
                        long:  \`\${c} میں آج چاند: موجودہ طور، روشنی، عمر، طلوع و غروب، اگلا بدر، اور ماہانہ چاند کی تقویم کا لنک۔\`,
                        short: \`\${c} میں آج چاند: طور، روشنی، عمر، طلوع و غروب، اور اگلا بدر۔\`,
                    }),
                    de: c => ({
                        long:  \`Mond heute in \${c}: aktuelle Phase, Beleuchtung, Alter, Auf- und Untergang, nächster Vollmond, mit Link zum monatlichen Mondkalender.\`,
                        short: \`Mond heute in \${c}: Phase, Beleuchtung, Alter, Auf- und Untergang, nächster Vollmond.\`,
                    }),
                    id: c => ({
                        long:  \`Bulan hari ini di \${c}: fase, iluminasi, usia, terbit dan terbenam, purnama berikutnya, dengan tautan ke kalender bulan bulanan.\`,
                        short: \`Bulan hari ini di \${c}: fase, iluminasi, usia, terbit, terbenam, dan purnama berikutnya.\`,
                    }),
                    es: c => ({
                        long:  \`Luna hoy en \${c}: fase actual, iluminación, edad, salida y puesta, próxima luna llena, con enlace al calendario lunar mensual.\`,
                        short: \`Luna hoy en \${c}: fase, iluminación, edad, salida y puesta, próxima luna llena.\`,
                    }),
                    bn: c => ({
                        long:  \`\${c}-এ আজ চাঁদ: বর্তমান দশা, আলোকন, বয়স, উদয় ও অস্ত, পরবর্তী পূর্ণিমা, মাসিক চাঁদের ক্যালেন্ডারের লিঙ্কসহ।\`,
                        short: \`\${c}-এ আজ চাঁদ: দশা, আলোকন, বয়স, উদয় ও অস্ত, এবং পরবর্তী পূর্ণিমা।\`,
                    }),
                    ms: c => ({
                        long:  \`Bulan hari ini di \${c}: fasa, pencahayaan, usia, terbit dan terbenam, bulan purnama seterusnya, dengan pautan ke kalendar bulanan.\`,
                        short: \`Bulan hari ini di \${c}: fasa, pencahayaan, usia, terbit dan terbenam, bulan purnama seterusnya.\`,
                    }),
                };
                const _pickMoonTodayCityDesc = (lng, c) => {
                    const f = (_MOON_TODAY_CITY_DESC_FORMS[lng] || _MOON_TODAY_CITY_DESC_FORMS.en)(c);
                    const len = s => Array.from(s).length;
                    if (len(f.long) >= 120 && len(f.long) <= 160) return f.long;
                    if (len(f.long) <= 160) return f.long;
                    return f.short;
                };
                _moonDesc = {
                    ar: _pickMoonTodayCityDesc('ar', cityDisplay),
                    en: _pickMoonTodayCityDesc('en', cityDisplay),
                    fr: _pickMoonTodayCityDesc('fr', cityDisplay),
                    tr: _pickMoonTodayCityDesc('tr', cityDisplay),
                    ur: _pickMoonTodayCityDesc('ur', cityDisplay),
                    de: _pickMoonTodayCityDesc('de', cityDisplay),
                    id: _pickMoonTodayCityDesc('id', cityDisplay),
                    es: _pickMoonTodayCityDesc('es', cityDisplay),
                    bn: _pickMoonTodayCityDesc('bn', cityDisplay),
                    ms: _pickMoonTodayCityDesc('ms', cityDisplay),
                };
`;

const out = before + replacement + after;
fs.writeFileSync(SERVER_PATH, out, 'utf8');
console.log('Done. Replaced', removed.length, 'bytes with', replacement.length, 'bytes.');
