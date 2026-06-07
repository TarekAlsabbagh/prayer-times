// COUNTRY-PRAYER-PAGE-CITY-SEARCH-RESTORE-FIX-1 — add countryCities.searchPlaceholder
// (10 langs) to the consolidated js/i18n.js bundle (the country page loads monolithic
// js/i18n.js + the SSR data-i18n walker reads TRANSLATIONS from it). Idempotent.
import fs from 'node:fs';
const P = 'js/i18n.js';
const MARKER = 'COUNTRY-PRAYER-PAGE-CITY-SEARCH-RESTORE-FIX-1';
let s = fs.readFileSync(P, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '');
if (s.includes(MARKER)) { console.log('SKIP (marker present)'); process.exit(0); }
const V = {
  ar: '🔍 ابحث عن مدينة داخل هذه الدولة...',
  en: '🔍 Search for a city in this country...',
  fr: '🔍 Rechercher une ville dans ce pays...',
  tr: '🔍 Bu ülkedeki bir şehir arayın...',
  ur: '🔍 اس ملک میں کسی شہر کی تلاش کریں...',
  de: '🔍 Stadt in diesem Land suchen...',
  id: '🔍 Cari kota di negara ini...',
  es: '🔍 Buscar una ciudad en este país...',
  bn: '🔍 এই দেশের একটি শহর খুঁজুন...',
  ms: '🔍 Cari bandar di negara ini...'
};
const esc = (v) => String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
let block = `/* ${MARKER} — country-page in-results city filter placeholder */\n`;
for (const l of ['ar','en','fr','tr','ur','de','id','es','bn','ms']) {
  block += `TRANSLATIONS['${l}']['countryCities.searchPlaceholder'] = '${esc(V[l])}';\n`;
}
block += '\n';
const anchor = "if (typeof module !== 'undefined' && module.exports) {";
const i = s.indexOf(anchor);
if (i < 0) { console.error('anchor not found'); process.exit(1); }
s = s.slice(0, i) + block + s.slice(i);
fs.writeFileSync(P, s, 'utf8');
console.log('appended countryCities.searchPlaceholder x10');
