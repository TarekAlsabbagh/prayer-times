// COUNTRY-PRAYER-PAGE-SINGLE-CITY-TERRITORY-UX-FIX-1
// Adds the i18n key `cities.single_city_note` (shown when a country/territory has only one
// curated city = the current city, so the "cities in country" grid would be empty) to:
//   (1) the 10 per-lang bundles js/i18n/{lang}.js  (consumed by the SPA city page), and
//   (2) the consolidated js/i18n.js               (SSR source + key parity).
// Idempotent. Uses {country} placeholder so it works for every single-city territory.
import fs from 'node:fs';

const MARKER = 'cities.single_city_note';
const V = {
  ar: '{country} تضمّ مدينة رئيسية واحدة في بياناتنا الحالية، لذلك لا توجد مدن أخرى لعرضها هنا.',
  en: '{country} currently has one main city in our data, so there are no other cities to show here.',
  fr: "{country} ne compte qu'une seule ville principale dans nos données actuelles ; aucune autre ville à afficher ici.",
  tr: '{country} verilerimizde şu anda yalnızca bir ana şehre sahip, bu yüzden burada gösterilecek başka şehir yok.',
  ur: '{country} کے پاس ہمارے موجودہ ڈیٹا میں صرف ایک بڑا شہر ہے، اس لیے یہاں دکھانے کے لیے کوئی اور شہر نہیں۔',
  de: '{country} hat in unseren aktuellen Daten nur eine größere Stadt, daher gibt es hier keine weiteren Städte.',
  id: '{country} saat ini hanya memiliki satu kota utama dalam data kami, jadi tidak ada kota lain untuk ditampilkan di sini.',
  es: '{country} actualmente tiene una sola ciudad principal en nuestros datos, por lo que no hay otras ciudades para mostrar aquí.',
  bn: '{country}-এ আমাদের বর্তমান ডেটায় একটি প্রধান শহর রয়েছে, তাই এখানে দেখানোর জন্য অন্য কোনো শহর নেই।',
  ms: '{country} kini hanya mempunyai satu bandar utama dalam data kami, jadi tiada bandar lain untuk dipaparkan di sini.'
};
const LANGS = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const esc = (v) => String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

// ---- (1) per-lang bundles: insert after the 'cities.more_btn_country' line ----
for (const lang of LANGS) {
  const p = `js/i18n/${lang}.js`;
  let s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '');
  if (s.includes(MARKER)) { console.log(`SKIP ${p} (present)`); continue; }
  const re = /^(\s*)'cities\.more_btn_country':.*$/m;
  const m = s.match(re);
  if (!m) { console.error(`anchor not found in ${p}`); process.exit(1); }
  const indent = m[1];
  s = s.replace(re, (line) => `${line}\n${indent}'${MARKER}': '${esc(V[lang])}',`);
  fs.writeFileSync(p, s, 'utf8');
  console.log(`inserted into ${p}`);
}

// ---- (2) consolidated js/i18n.js: flat assignment before module.exports ----
{
  const p = 'js/i18n.js';
  let s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '');
  if (s.includes(MARKER)) { console.log(`SKIP ${p} (present)`); }
  else {
    let block = `/* COUNTRY-PRAYER-PAGE-SINGLE-CITY-TERRITORY-UX-FIX-1 — single-city territory empty-state note */\n`;
    for (const l of LANGS) block += `TRANSLATIONS['${l}']['${MARKER}'] = '${esc(V[l])}';\n`;
    block += '\n';
    const anchor = "if (typeof module !== 'undefined' && module.exports) {";
    const i = s.indexOf(anchor);
    if (i < 0) { console.error('anchor not found in js/i18n.js'); process.exit(1); }
    s = s.slice(0, i) + block + s.slice(i);
    fs.writeFileSync(p, s, 'utf8');
    console.log('appended to js/i18n.js (x10)');
  }
}
console.log('done');
