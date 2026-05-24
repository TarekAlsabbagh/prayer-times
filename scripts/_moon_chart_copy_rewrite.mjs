/* MOON-CHART-COPY-POLISH-1 (2026-05-24)
 *
 * Updates moon.chart_subtitle + moon.chart_caption across:
 *   - js/i18n/{ar,en,fr,tr,ur,de,id,es,bn,ms}.js  (10 per-lang files)
 *   - js/i18n.js  (legacy bundle, 10 lang blocks)
 *
 * Idempotent — reruns print OK_ALREADY for already-patched entries.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname || '.', '..');

// New texts per lang (subtitle + caption)
const TEXTS = {
  ar: {
    sub: 'نسبة إضاءة القمر من 3 أيام قبل التاريخ المعروض إلى 3 أيام بعده.',
    cap: 'اختر أي نقطة لعرض تفاصيل القمر في ذلك التاريخ.',
  },
  en: {
    sub: 'Moon illumination percentage from 3 days before the shown date to 3 days after.',
    cap: 'Tap any point to view the moon details for that date.',
  },
  fr: {
    sub: 'Pourcentage d’illumination de la Lune de 3 jours avant la date affichée à 3 jours après.',
    cap: 'Choisissez un point pour voir les détails de la Lune à cette date.',
  },
  tr: {
    sub: 'Gösterilen tarihten 3 gün önce ile 3 gün sonra arasındaki Ay aydınlanma yüzdesi.',
    cap: 'O tarihin Ay ayrıntılarını görmek için herhangi bir noktaya dokunun.',
  },
  ur: {
    sub: 'دکھائی گئی تاریخ سے 3 دن پہلے سے 3 دن بعد تک چاند کی روشنی کا فیصد۔',
    cap: 'اس تاریخ کے لیے چاند کی تفصیلات دیکھنے کے لیے کسی بھی نقطے کا انتخاب کریں۔',
  },
  de: {
    sub: 'Mondbeleuchtungsprozent von 3 Tagen vor dem angezeigten Datum bis 3 Tage danach.',
    cap: 'Wählen Sie einen Punkt aus, um die Monddetails für dieses Datum anzuzeigen.',
  },
  id: {
    sub: 'Persentase iluminasi Bulan dari 3 hari sebelum tanggal yang ditampilkan hingga 3 hari setelahnya.',
    cap: 'Pilih titik mana pun untuk melihat detail Bulan pada tanggal tersebut.',
  },
  es: {
    sub: 'Porcentaje de iluminación de la Luna desde 3 días antes de la fecha mostrada hasta 3 días después.',
    cap: 'Elige cualquier punto para ver los detalles de la Luna en esa fecha.',
  },
  bn: {
    sub: 'প্রদর্শিত তারিখের 3 দিন আগে থেকে 3 দিন পর পর্যন্ত চাঁদের আলোকন শতাংশ।',
    cap: 'সেই তারিখের জন্য চাঁদের বিবরণ দেখতে যেকোনো বিন্দু নির্বাচন করুন।',
  },
  ms: {
    sub: 'Peratusan pencahayaan Bulan dari 3 hari sebelum tarikh yang dipaparkan hingga 3 hari selepasnya.',
    cap: 'Pilih mana-mana titik untuk melihat butiran Bulan pada tarikh tersebut.',
  },
};

function patchFile(file, lang) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) { console.log(`SKIP_MISSING: ${file}`); return; }
  let content = fs.readFileSync(abs, 'utf8');
  const isLF = !content.includes('\r\n');
  const EOL = isLF ? '\n' : '\r\n';
  let changes = 0;

  // Try to swap the subtitle line.
  // Pattern: 'moon.chart_subtitle': '<OLD>',
  const subRe = new RegExp(
    `('moon\\.chart_subtitle':\\s*')([^']*)(',)`,
    ''
  );
  if (subRe.test(content)) {
    content = content.replace(subRe, (m, p1, _old, p3) => {
      if (_old === TEXTS[lang].sub) return m;
      changes++;
      return p1 + TEXTS[lang].sub + p3;
    });
  }
  const capRe = new RegExp(
    `('moon\\.chart_caption':\\s*')([^']*)(',)`,
    ''
  );
  if (capRe.test(content)) {
    content = content.replace(capRe, (m, p1, _old, p3) => {
      if (_old === TEXTS[lang].cap) return m;
      changes++;
      return p1 + TEXTS[lang].cap + p3;
    });
  }
  if (changes === 0) { console.log(`OK_ALREADY: ${file} (${lang})`); return; }
  fs.writeFileSync(abs, content, 'utf8');
  console.log(`OK ${file} (${lang}): ${changes} changes`);
}

// Patch per-lang files
for (const lang of Object.keys(TEXTS)) {
  patchFile(`js/i18n/${lang}.js`, lang);
}

// Patch legacy bundle (each lang has its own block — but since the regex is GLOBAL
// it would match all 10. Run the bundle 10 times once per lang, BUT replace
// only the FIRST matching pair each time so we don't cross-contaminate.
// Simpler: just patch the bundle per-lang by anchoring on the lang's
// `window.TRANSLATIONS.<lang> = {` opening line and isolating the slice.

const legacyPath = path.join(ROOT, 'js/i18n.js');
let legacy = fs.readFileSync(legacyPath, 'utf8');
const langOrder = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
let legacyChanges = 0;
for (let i = 0; i < langOrder.length; i++) {
  const lang = langOrder[i];
  const next = langOrder[i + 1];
  // Anchor: find the per-lang `'moon.chart_subtitle': ...` and replace
  // ONCE within the slice between this lang's anchor and next lang's anchor.
  const langAnchor = lang === 'ar'
    ? 'window.TRANSLATIONS.ar = '
    : `window.TRANSLATIONS.${lang} = `;
  const startIdx = legacy.indexOf(langAnchor);
  if (startIdx < 0) { console.log(`SKIP_LEGACY_LANG: ${lang}`); continue; }
  const endIdx = next
    ? legacy.indexOf(`window.TRANSLATIONS.${next} = `, startIdx)
    : legacy.length;
  if (endIdx < 0) { console.log(`SKIP_LEGACY_LANG_END: ${lang}`); continue; }
  let slice = legacy.substring(startIdx, endIdx);
  let sliceChanges = 0;
  const subRe = new RegExp(`('moon\\.chart_subtitle':\\s*')([^']*)(',)`, '');
  const capRe = new RegExp(`('moon\\.chart_caption':\\s*')([^']*)(',)`, '');
  if (subRe.test(slice)) {
    slice = slice.replace(subRe, (m, p1, _old, p3) => {
      if (_old === TEXTS[lang].sub) return m;
      sliceChanges++;
      return p1 + TEXTS[lang].sub + p3;
    });
  }
  if (capRe.test(slice)) {
    slice = slice.replace(capRe, (m, p1, _old, p3) => {
      if (_old === TEXTS[lang].cap) return m;
      sliceChanges++;
      return p1 + TEXTS[lang].cap + p3;
    });
  }
  if (sliceChanges > 0) {
    legacy = legacy.substring(0, startIdx) + slice + legacy.substring(endIdx);
    legacyChanges += sliceChanges;
    console.log(`OK js/i18n.js (${lang}): ${sliceChanges} changes`);
  } else {
    console.log(`OK_ALREADY js/i18n.js (${lang})`);
  }
}
if (legacyChanges > 0) {
  fs.writeFileSync(legacyPath, legacy, 'utf8');
  console.log(`WROTE: js/i18n.js (${legacyChanges} total)`);
}
console.log('DONE');
