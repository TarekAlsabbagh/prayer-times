// NEXT-PRAYER-CITY-MULTILANG-I18N-FIX-1 — add the missing `npt.eyebrow` key (badge
// above the /next-prayer-in-{city} hero). Was absent in ALL 10 langs, so the SSR
// data-i18n walker left the Arabic HTML default on every page. Add NATIVE per lang
// to js/i18n/{lang}.js (browser) + js/i18n.js (SSR bundle). Append pattern, idempotent.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const MARKER = 'NEXT-PRAYER-CITY-MULTILANG-I18N-FIX-1';
const KEY = 'npt.eyebrow';
const VAL = {
  ar: 'مواقيت الصلاة اليوم',
  en: 'Today’s Prayer Times',
  fr: 'Horaires de prière du jour',
  tr: 'Bugünkü Namaz Vakitleri',
  ur: 'آج کے نماز کے اوقات',
  de: 'Gebetszeiten heute',
  id: 'Jadwal Sholat Hari Ini',
  es: 'Horarios de oración de hoy',
  bn: 'আজকের নামাজের সময়',
  ms: 'Waktu Solat Hari Ini',
};
const LANGS = Object.keys(VAL);

function emit(prefix, lang, val) {
  const esc = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `${prefix}['${lang}']['${KEY}'] = '${esc}';`;
}
function normLF(s) { return s.replace(/\r\n/g, '\n').replace(/\r/g, ''); }

function patchPerLang(lang) {
  const fp = path.join(ROOT, 'js', 'i18n', `${lang}.js`);
  let src = normLF(fs.readFileSync(fp, 'utf8'));
  if (src.includes(MARKER)) { console.log(`SKIP ${lang}.js`); return; }
  const block = `/* ${MARKER} — npt.eyebrow badge */\n` + emit("window.TRANSLATIONS", lang, VAL[lang]) + '\n\n';
  const anchor = `if (typeof _initI18nAutoGen === 'function') {`;
  const idx = src.indexOf(anchor);
  if (idx < 0) throw new Error(`anchor not found in ${lang}.js`);
  src = src.slice(0, idx) + block + src.slice(idx);
  fs.writeFileSync(fp, src, 'utf8');
  console.log(`OK ${lang}.js`);
}

function patchBundle() {
  const fp = path.join(ROOT, 'js', 'i18n.js');
  let src = normLF(fs.readFileSync(fp, 'utf8'));
  if (src.includes(MARKER)) { console.log('SKIP i18n.js'); return; }
  const lines = [`/* ${MARKER} — npt.eyebrow badge for all 10 langs (SSR bundle) */`];
  for (const lang of LANGS) lines.push(emit('TRANSLATIONS', lang, VAL[lang]));
  const block = lines.join('\n') + '\n\n';
  const anchor = `if (typeof module !== 'undefined' && module.exports) {`;
  const idx = src.indexOf(anchor);
  if (idx < 0) throw new Error('anchor not found in i18n.js');
  src = src.slice(0, idx) + block + src.slice(idx);
  fs.writeFileSync(fp, src, 'utf8');
  console.log('OK i18n.js (+10 keys)');
}

for (const l of LANGS) patchPerLang(l);
patchBundle();
console.log('DONE');
