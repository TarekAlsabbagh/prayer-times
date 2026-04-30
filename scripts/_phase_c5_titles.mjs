// Phase C5: Title & Meta cleanup for moon city pages.
// Strategy: replace exact lines by their 1-based line numbers (snapshot from Read).
// If line numbers shift, the script will fail at signature check.
import fs from 'fs';
const file = 'server.js';
const srcRaw = fs.readFileSync(file, 'utf8');
const isCRLF = /\r\n/.test(srcRaw);
const EOL = isCRLF ? '\r\n' : '\n';
const lines = srcRaw.split(/\r?\n/);              // index 0 = line 1
const get = (n) => lines[n - 1];

// ── Signature check (idempotent guard): expected anchors ──
const expect = [
  [4776, '            if (_isMoonMonthPage) {'],
  [4778, '                _moonTitle = {'],
  [4828, '            } else if (_moonDateIso && _moonDateInRange) {'],
  [4830, '                _moonTitle = {'],
  [4854, '            } else {'],
  [4868, '                _moonDesc = {'],
];
for (const [n, want] of expect) {
  if (get(n) !== want) {
    console.error(`SIG MISMATCH @ line ${n}\n  want: ${JSON.stringify(want)}\n  got : ${JSON.stringify(get(n))}`);
    process.exit(2);
  }
}
console.log('Signatures OK.');

// ── (1) Month-page title (lines 4779–4788, 10 langs) ──
const monthTitleNew = [
  '                    ar: `تقويم القمر في ${cityDisplay} | ${_mNameT} ${_mYearT}`,',
  '                    en: `Moon Calendar in ${cityDisplay} | ${_mNameT} ${_mYearT}`,',
  '                    fr: `Calendrier lunaire à ${cityDisplay} | ${_mNameT} ${_mYearT}`,',
  '                    tr: `${cityDisplay} Ay Takvimi | ${_mNameT} ${_mYearT}`,',
  '                    ur: `${cityDisplay} چاند کیلنڈر | ${_mNameT} ${_mYearT}`,',
  '                    de: `Mondkalender ${cityDisplay} | ${_mNameT} ${_mYearT}`,',
  '                    id: `Kalender Bulan ${cityDisplay} | ${_mNameT} ${_mYearT}`,',
  '                    es: `Calendario lunar en ${cityDisplay} | ${_mNameT} ${_mYearT}`,',
  '                    bn: `${cityDisplay} চাঁদের ক্যালেন্ডার | ${_mNameT} ${_mYearT}`,',
  '                    ms: `Kalendar Bulan ${cityDisplay} | ${_mNameT} ${_mYearT}`,',
];
// Verify shape of original block (4779–4788) before overwrite
for (let i = 4779; i <= 4788; i++) {
  if (!/^\s+(ar|en|fr|tr|ur|de|id|es|bn|ms): `/.test(get(i))) {
    console.error(`MONTH SHAPE MISMATCH @ ${i}: ${JSON.stringify(get(i))}`);
    process.exit(3);
  }
}
for (let i = 0; i < 10; i++) lines[4779 - 1 + i] = monthTitleNew[i];
console.log('OK (1) month-page title rewritten');

// ── (2) Date-page title (lines 4831–4840) ──
const dateTitleNew = [
  '                    ar: `حالة القمر في ${cityDisplay} | ${_primaryDateLabel}`,',
  '                    en: `Moon in ${cityDisplay} | ${_primaryDateLabel}`,',
  '                    fr: `La Lune à ${cityDisplay} | ${_primaryDateLabel}`,',
  '                    tr: `${cityDisplay} Ay | ${_primaryDateLabel}`,',
  '                    ur: `${cityDisplay} میں چاند | ${_primaryDateLabel}`,',
  '                    de: `Mond in ${cityDisplay} | ${_primaryDateLabel}`,',
  '                    id: `Bulan di ${cityDisplay} | ${_primaryDateLabel}`,',
  '                    es: `Luna en ${cityDisplay} | ${_primaryDateLabel}`,',
  '                    bn: `${cityDisplay}-এ চাঁদ | ${_primaryDateLabel}`,',
  '                    ms: `Bulan di ${cityDisplay} | ${_primaryDateLabel}`,',
];
for (let i = 4831; i <= 4840; i++) {
  if (!/^\s+(ar|en|fr|tr|ur|de|id|es|bn|ms): `/.test(get(i))) {
    console.error(`DATE SHAPE MISMATCH @ ${i}: ${JSON.stringify(get(i))}`);
    process.exit(4);
  }
}
for (let i = 0; i < 10; i++) lines[4831 - 1 + i] = dateTitleNew[i];
console.log('OK (2) date-page title rewritten');

// ── (3) Today-page desc (lines 4868–4877) ──
const BS = String.fromCharCode(92);
const todayDescNew = [
  '                    ar: `حالة القمر اليوم في ${cityDisplay}: الطور الحالي ونسبة الإضاءة، عمر القمر، شروق وغروب القمر، البدر القادم، مع رابط تقويم القمر الشهريّ في ${cityDisplay}.`,',
  "                    en: `Today's moon in ${cityDisplay}: current phase, illumination, moon age, moonrise and moonset, next full moon, plus a link to the monthly moon calendar.`,",
  // French keeps the literal '\\u2019' escape (matches existing style in this file).
  '                    fr: `Lune aujourd' + BS + 'u2019hui à ${cityDisplay} : phase, illumination, âge, lever et coucher, prochaine pleine lune, avec lien vers le calendrier lunaire mensuel.`,',
  '                    tr: `${cityDisplay} için bugün ay: mevcut evre, aydınlanma, yaş, doğuş ve batış, sonraki dolunay; aylık ay takvimine bağlantıyla.`,',
  '                    ur: `${cityDisplay} میں آج چاند: موجودہ طور، روشنی، عمر، طلوع و غروب، اگلا بدر، اور ماہانہ چاند کی تقویم کا لنک۔`,',
  '                    de: `Mond heute in ${cityDisplay}: aktuelle Phase, Beleuchtung, Alter, Auf- und Untergang, nächster Vollmond, mit Link zum monatlichen Mondkalender.`,',
  '                    id: `Bulan hari ini di ${cityDisplay}: fase, iluminasi, usia, terbit dan terbenam, purnama berikutnya, dengan tautan ke kalender bulan bulanan.`,',
  '                    es: `Luna hoy en ${cityDisplay}: fase actual, iluminación, edad, salida y puesta, próxima luna llena, con enlace al calendario lunar mensual.`,',
  '                    bn: `${cityDisplay}-এ আজ চাঁদ: বর্তমান দশা, আলোকন, বয়স, উদয় ও অস্ত, পরবর্তী পূর্ণিমা, মাসিক চাঁদের ক্যালেন্ডারের লিঙ্কসহ।`,',
  '                    ms: `Bulan hari ini di ${cityDisplay}: fasa, pencahayaan, usia, terbit dan terbenam, bulan purnama seterusnya, dengan pautan ke kalendar bulanan.`,',
];
for (let i = 4869; i <= 4878; i++) {
  if (!/^\s+(ar|en|fr|tr|ur|de|id|es|bn|ms): `/.test(get(i))) {
    console.error(`TODAY-DESC SHAPE MISMATCH @ ${i}: ${JSON.stringify(get(i))}`);
    process.exit(5);
  }
}
for (let i = 0; i < 10; i++) lines[4869 - 1 + i] = todayDescNew[i];
console.log('OK (3) today-page desc rewritten');

const out = lines.join(EOL);
fs.writeFileSync(file, out, 'utf8');
console.log(`All Phase C5 edits applied. (EOL=${isCRLF ? 'CRLF' : 'LF'})`);
