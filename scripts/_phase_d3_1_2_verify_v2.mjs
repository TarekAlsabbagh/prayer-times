// Phase D3.1.2 verification (v2) — fetch pages that ACTUALLY include the
// moon-edu section in SSR (today-in-city for short edu, date page for long edu),
// and verify the rendered text per-language matches the i18n.js translation
// (i.e., not the AR default and not the EN fallback).
import fs from 'fs';

const i18nSrc = fs.readFileSync('js/i18n.js', 'utf8');

// Extract value of a key from i18n.js for a given lang section.
// Strategy: find the first `'key':` after the lang section anchor.
const LANG_ANCHORS = {
  ar: /['"]?ar['"]?\s*:\s*\{/, // first lang
};
function valueAt(lang, key) {
  // Find the offset where this lang section starts.
  // js/i18n.js groups are large. Use moon.edu_title positions per lang as anchors.
  const titlePositions = [];
  const re = new RegExp(`['"]moon\\.edu_title['"]\\s*:\\s*['"\`]([^'"\`]+)['"\`]`, 'g');
  let m;
  while ((m = re.exec(i18nSrc)) !== null) titlePositions.push({ idx: m.index, val: m[1] });
  // The 10 occurrences are in lang order: ar, en, fr, tr, ur, de, id, es, bn, ms.
  const order = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
  const langIndex = order.indexOf(lang);
  if (langIndex < 0 || langIndex >= titlePositions.length) return null;
  // For non-title keys, scan forward from this lang's section start to next lang's section start.
  const startIdx = titlePositions[langIndex].idx;
  const endIdx = (langIndex + 1 < titlePositions.length) ? titlePositions[langIndex + 1].idx : i18nSrc.length;
  const section = i18nSrc.substring(startIdx, endIdx);
  const keyRe = new RegExp(`['"]${key.replace(/[.]/g, '\\.')}['"]\\s*:\\s*['"\`]((?:[^'"\`\\\\]|\\\\.)*)['"\`]`);
  const km = keyRe.exec(section);
  return km ? km[1] : null;
}

// Pages that DO have the moon-edu section in SSR.
const tests = [
  { url: '/fr/moon-today-in-makkah',         lang: 'fr', edu: 'short' },
  { url: '/tr/moon-today-in-makkah',         lang: 'tr', edu: 'short' },
  { url: '/ur/moon-today-in-makkah',         lang: 'ur', edu: 'short' },
  { url: '/de/moon-today-in-makkah',         lang: 'de', edu: 'short' },
  { url: '/id/moon-today-in-makkah',         lang: 'id', edu: 'short' },
  { url: '/es/moon-today-in-makkah',         lang: 'es', edu: 'short' },
  { url: '/bn/moon-today-in-makkah',         lang: 'bn', edu: 'short' },
  { url: '/ms/moon-today-in-makkah',         lang: 'ms', edu: 'short' },
];

console.log('## Phase D3.1.2 verification — moon.edu_* localization (rendered HTML)\n');
console.log('| Lang | URL | data-i18n nodes | Sample h3 (rendered) | Expected (i18n.js) | English-leak count | Status |');
console.log('|---|---|---:|---|---|---:|---|');

let pass = 0, fail = 0;

// Sample English phrases to detect fallback (case-sensitive substring match in body).
const EN_LEAK = [
  'Understanding Moon Phases',
  'A lunar cycle takes about 29.5 days',
  'Moonrise and moonset times',
];

for (const t of tests) {
  const r = await fetch('http://localhost:3000' + t.url);
  const html = await r.text();
  // Find data-i18n nodes referencing moon.edu
  const nodes = [...html.matchAll(/data-i18n="(moon\.edu_[a-z0-9_]+)"[^>]*>([^<]+)</g)];
  // Pick the first edu-title or any heading
  const h3 = nodes.find(n => /title/.test(n[1])) || nodes[0];
  const renderedKey = h3 ? h3[1] : '?';
  const renderedTxt = h3 ? h3[2].trim() : '—';
  const expected = h3 ? valueAt(t.lang, renderedKey) : '?';
  // Strip script blocks then count en-leak substring occurrences
  const stripped = html.replace(/<script[\s\S]*?<\/script>/g, '');
  let leaks = 0;
  for (const ph of EN_LEAK) if (stripped.includes(ph)) leaks++;
  // Pass = rendered text matches expected i18n value; no en-leak.
  const matchOk = expected ? renderedTxt.startsWith(expected.slice(0, 25)) : false;
  const ok = matchOk && leaks === 0;
  if (ok) pass++; else fail++;
  console.log(`| ${t.lang} | ${t.url} | ${nodes.length} | ${renderedTxt.slice(0,55)} | ${(expected||'').slice(0,55)} | ${leaks} | ${ok ? '✅' : '❌'} |`);
}
console.log(`\n## Summary: ${pass}/${tests.length} pass`);
process.exit(fail > 0 ? 1 : 0);
