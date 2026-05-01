// Phase E2-keywords-Hub — extend the bare /moon-today Title (Hub) to include
// "مراحل القمر" + "التقويم الهجري" so SEOptimer's Keyword Consistency turns
// green for these terms (which currently appear in body but not in heading-
// equivalent metadata). Same approach that flipped /moon-today-in-{city} to
// green.
//
// Per user (E2-keywords-Hub spec):
//   • Title: extend (not replace) to add "مراحل القمر" + "التقويم الهجري"
//   • Meta: NOT touched — current AR meta already has "البدر القادم", "طور
//     القمر" (functionally = مراحل), "هلال", "الشهر الهجريّ"
//   • H2: NOT touched — "أطوار القمر خلال مايو 2026" already working
//   • Optional Badr H2: DEFERRED — user said "إذا بقيت المشكلة" only
//   • Hard rule: NO month name (مايو) in Title (would force monthly rotation)
//   • Hard rule: NO "مكة المكرمة" in Title (Hub is generic, not city-specific)
//
// Length targets (SEOptimer 50-60 sweet spot):
//   ar: 58, en: 55, fr: 64, tr: 50, ur: 47, de: 57, id: 59, es: 55, bn: 51, ms: 57

import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
const APO  = String.fromCharCode(92) + 'u2019'; // ’ as 6-char escape (matches existing file convention)

const raw = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

// Old block — exact bytes including the existing Phase C5 comment so the
// anchor uniqueness is guaranteed. We replace the comment + the 10-lang title
// object atomically.
const oldBlock = [
  `        '/moon-today': {`,
  `            title: {`,
  `                // Phase C5: Title نظيف بـ "|" بدل "-"، يعطي شكلًا أنيقًا في SERP`,
  `                ar: 'حالة القمر اليوم | طور القمر والإضاءة والعمر والمسافة',`,
  `                en: 'Moon State Today | Phase, Illumination, Age & Distance',`,
  `                fr: 'État de la Lune aujourd${APO}hui | Phase, Illumination et Âge',`,
  `                tr: 'Ayın Bugünkü Durumu | Evre, Aydınlanma, Yaş ve Mesafe',`,
  `                ur: 'آج چاند کی حالت | طور، روشنی، عمر اور فاصلہ',`,
  `                de: 'Mondzustand heute | Phase, Beleuchtung, Alter & Entfernung',`,
  `                id: 'Keadaan Bulan Hari Ini | Fase, Iluminasi, Usia & Jarak',`,
  `                es: 'Estado de la Luna hoy | Fase, Iluminación, Edad y Distancia',`,
  `                bn: 'আজ চাঁদের অবস্থা | দশা, আলোকন, বয়স ও দূরত্ব',`,
  `                ms: 'Keadaan Bulan Hari Ini | Fasa, Pencahayaan, Usia & Jarak',`,
  `            },`,
].join(EOL);

const newBlock = [
  `        '/moon-today': {`,
  `            title: {`,
  `                // Phase E2-keywords-Hub (2026-05-01): extend each title to include`,
  `                // "مراحل القمر" + "التقويم الهجري" (and parallel terms in 9 other`,
  `                // langs). Goal — flip SEOptimer's Keyword Consistency from ✗ to ✓`,
  `                // for these two terms, same way the city-page Today block (Phase`,
  `                // E2-keywords-ext) flipped /moon-today-in-{city} green. Each line`,
  `                // sits in the 50–60 SEOptimer sweet spot. Deliberately omits the`,
  `                // month name (E2-keywords-diag hard rule: no monthly title rotation)`,
  `                // and the default city name (Hub is generic, not city-specific).`,
  `                ar: 'حالة القمر اليوم: الطور الحالي ومراحل القمر والتقويم الهجري',`,
  `                en: 'Moon Today: Current Phase, Moon Phases & Hijri Calendar',`,
  `                fr: 'Lune aujourd${APO}hui : phase actuelle, phases et calendrier hégirien',`,
  `                tr: 'Bugün Ay: Mevcut Evre, Ay Evreleri ve Hicri Takvim',`,
  `                ur: 'آج چاند کی حالت: موجودہ طور، مراحل اور ہجری تقویم',`,
  `                de: 'Mond heute: aktuelle Phase, Mondphasen & Hidschri-Kalender',`,
  `                id: 'Bulan Hari Ini: Fase Saat Ini, Fase Bulan & Kalender Hijriah',`,
  `                es: 'Luna hoy: fase actual, fases lunares y calendario hijri',`,
  `                bn: 'আজ চাঁদ: বর্তমান দশা, চাঁদের দশা ও হিজরি ক্যালেন্ডার',`,
  `                ms: 'Bulan Hari Ini: Fasa Semasa, Fasa Bulan & Kalendar Hijrah',`,
  `            },`,
].join(EOL);

const cnt = raw.split(oldBlock).length - 1;
if (cnt !== 1) {
  throw new Error(`Hub title anchor: expected 1 match, got ${cnt}. The block may already have been updated.`);
}

const out = raw.replace(oldBlock, newBlock);
writeFileSync(PATH, out);

// Length sanity-check report
const titles = {
  ar: 'حالة القمر اليوم: الطور الحالي ومراحل القمر والتقويم الهجري',
  en: 'Moon Today: Current Phase, Moon Phases & Hijri Calendar',
  fr: 'Lune aujourd’hui : phase actuelle, phases et calendrier hégirien',
  tr: 'Bugün Ay: Mevcut Evre, Ay Evreleri ve Hicri Takvim',
  ur: 'آج چاند کی حالت: موجودہ طور، مراحل اور ہجری تقویم',
  de: 'Mond heute: aktuelle Phase, Mondphasen & Hidschri-Kalender',
  id: 'Bulan Hari Ini: Fase Saat Ini, Fase Bulan & Kalender Hijriah',
  es: 'Luna hoy: fase actual, fases lunares y calendario hijri',
  bn: 'আজ চাঁদ: বর্তমান দশা, চাঁদের দশা ও হিজরি ক্যালেন্ডার',
  ms: 'Bulan Hari Ini: Fasa Semasa, Fasa Bulan & Kalendar Hijrah',
};
console.log('✅ /moon-today Title updated (E2-keywords-Hub).');
console.log('\nTitle length report (SEOptimer sweet spot: 50-60):');
for (const [lang, t] of Object.entries(titles)) {
  const len = [...t].length;  // Unicode codepoint count
  const flag = len >= 50 && len <= 60 ? '✅' : (len < 50 ? '⚠ short' : '⚠ long');
  console.log(`  ${lang}: ${String(len).padStart(2)} chars ${flag}`);
}
