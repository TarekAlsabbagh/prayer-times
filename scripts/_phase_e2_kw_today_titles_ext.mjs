// Phase E2-keywords-ext — Today city title templates: lengthen to 50–60 char range.
// SEOptimer flagged the AR title at 42 chars (below 50). Per user spec, add
// "ومراحل القمر" (and Moon Phases) + parallel additions in 9 other langs.
// Keeps the file's existing convention: FR uses literal ’ escape for ’.

import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
const APO = String.fromCharCode(92) + 'u2019'; // literal ’ (6 chars in source)

const raw = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

// Old block — exact bytes including the previous Moon-title-templates-cleanup
// comment header. We replace the entire block (comment + _moonTitle definition)
// to update both the rationale and the templates atomically.
const oldBlock = [
  `            } else {`,
  `                // ── عناوين صفحة اليوم ──`,
  `                // Moon title templates cleanup (2026-05-01): aligned with the Hub block`,
  `                // above (Hub = Calendar, Today = current state). Each template now`,
  `                // pairs the city + "today" + Hijri date — the unique angle of this`,
  `                // page vs. the Hub. Stays under 60 chars even for "المدينة المنورة"`,
  `                // (16 chars) in every language. EN/ES/TR include "Phase"/"fase"/`,
  `                // "Evresi" so they don't drop below ~37 chars on short cities.`,
  `                _moonTitle = {`,
  `                    ar: \`حالة القمر اليوم في \${cityDisplay} والتقويم الهجري\`,`,
  `                    en: \`Moon Today in \${cityDisplay}: Phase & Hijri Date\`,`,
  `                    fr: \`Lune aujourd${APO}hui à \${cityDisplay} et date hégirienne\`,`,
  `                    tr: \`\${cityDisplay}'da Bugün Ay Evresi ve Hicri Tarih\`,`,
  `                    ur: \`\${cityDisplay} میں آج چاند اور ہجری تاریخ\`,`,
  `                    de: \`Mond heute in \${cityDisplay} & Hidschri-Datum\`,`,
  `                    id: \`Bulan Hari Ini di \${cityDisplay} & Tanggal Hijriah\`,`,
  `                    es: \`Luna hoy en \${cityDisplay}: fase y fecha hijri\`,`,
  `                    bn: \`\${cityDisplay}-এ আজকের চাঁদ ও হিজরি তারিখ\`,`,
  `                    ms: \`Bulan Hari Ini di \${cityDisplay} & Tarikh Hijrah\`,`,
  `                };`,
].join(EOL);

const newBlock = [
  `            } else {`,
  `                // ── عناوين صفحة اليوم ──`,
  `                // Moon title templates cleanup — E2-keywords-ext (2026-05-01):`,
  `                // SEOptimer flagged the previous AR template at 42 chars (below the`,
  `                // 50–60 sweet spot). The fix is to extend each template with a`,
  `                // natural keyword pulled from the page's actual content (moon phases,`,
  `                // illumination) — NOT to add the month name (kept stable across`,
  `                // months) and NOT to expand to keyword spam. AR adds "ومراحل القمر"`,
  `                // per user spec; the other 9 langs add a parallel "Phases" /`,
  `                // "Beleuchtung" / "fases" element so all sit in the 50–60 range`,
  `                // for short-to-medium city names. Hub block, Month/Date blocks, and`,
  `                // descriptions are NOT touched. Comment is "E2-keywords-ext", not`,
  `                // "E3" (E3 reserved for the unrelated hydration/flash issue).`,
  `                _moonTitle = {`,
  `                    ar: \`حالة القمر اليوم في \${cityDisplay} ومراحل القمر والتقويم الهجري\`,`,
  `                    en: \`Moon Today in \${cityDisplay} — Phases, Illumination & Hijri Date\`,`,
  `                    fr: \`Lune aujourd${APO}hui à \${cityDisplay}, phases et date hégirienne\`,`,
  `                    tr: \`\${cityDisplay}'da Bugün Ay Evresi, Aydınlanma ve Hicri Tarih\`,`,
  `                    ur: \`\${cityDisplay} میں آج چاند کی حالت، مراحل اور ہجری تاریخ\`,`,
  `                    de: \`Mond heute in \${cityDisplay}: Phase, Beleuchtung & Hidschri-Datum\`,`,
  `                    id: \`Bulan Hari Ini di \${cityDisplay}, Fase Bulan & Tanggal Hijriah\`,`,
  `                    es: \`Luna hoy en \${cityDisplay}: fases y fecha del calendario hijri\`,`,
  `                    bn: \`\${cityDisplay}-এ আজকের চাঁদ, চাঁদের দশা ও হিজরি তারিখ\`,`,
  `                    ms: \`Bulan Hari Ini di \${cityDisplay}, Fasa Bulan & Tarikh Hijrah\`,`,
  `                };`,
].join(EOL);

const cnt = raw.split(oldBlock).length - 1;
if (cnt !== 1) {
  throw new Error(`Today-block anchor: expected 1 match, got ${cnt}. The block may already have been updated.`);
}

const out = raw.replace(oldBlock, newBlock);
writeFileSync(PATH, out);
console.log('✅ Today block updated (E2-keywords-ext).');
