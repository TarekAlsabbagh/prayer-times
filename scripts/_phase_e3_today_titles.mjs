// Moon title templates cleanup — Today block only (Hub block already done).
// Uses anchor-based replacement; the FR line in source uses literal ’.

import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
const APO = String.fromCharCode(92) + 'u2019'; // literal ’ as 6 chars in source
const raw = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

const oldBlock = [
  `            } else {`,
  `                // ── عناوين صفحة اليوم (القديمة) ──`,
  `                _moonTitle = {`,
  `                    ar: \`حالة القمر اليوم في \${cityDisplay} - طور القمر ونسبة الإضاءة\`,`,
  `                    en: \`Moon State Today in \${cityDisplay} - Phase, Illumination & Distance\`,`,
  `                    fr: \`État de la Lune aujourd${APO}hui à \${cityDisplay} - Phase et Illumination\`,`,
  `                    tr: \`\${cityDisplay}'da Bugün Ayın Durumu - Evre ve Aydınlanma\`,`,
  `                    ur: \`\${cityDisplay} میں آج چاند کی حالت - طور اور روشنی\`,`,
  `                    de: \`Mondzustand heute in \${cityDisplay} - Phase und Beleuchtung\`,`,
  `                    id: \`Keadaan Bulan Hari Ini di \${cityDisplay} - Fase & Iluminasi\`,`,
  `                    es: \`Estado de la Luna hoy en \${cityDisplay} - Fase e Iluminación\`,`,
  `                    bn: \`\${cityDisplay}-এ আজ চাঁদের অবস্থা - দশা ও আলোকন\`,`,
  `                    ms: \`Keadaan Bulan Hari Ini di \${cityDisplay} - Fasa & Pencahayaan\`,`,
  `                };`,
].join(EOL);

const newBlock = [
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

const cnt = raw.split(oldBlock).length - 1;
if (cnt !== 1) throw new Error(`Today-block anchor: expected 1 match, got ${cnt}`);

const out = raw.replace(oldBlock, newBlock);
writeFileSync(PATH, out);
console.log('✅ Today block updated (Moon title templates cleanup).');
