// Phase D3.1b verification — month + date moon FAQ.
const tests = [
  // Month pages
  { url: '/de/moon-in-makkah/2026-05',    lang: 'de', faqType: 'month', expectCount: 8 },
  { url: '/fr/moon-in-makkah/2026-05',    lang: 'fr', faqType: 'month', expectCount: 8 },
  { url: '/ur/moon-in-makkah/2026-05',    lang: 'ur', faqType: 'month', expectCount: 8 },
  { url: '/bn/moon-in-makkah/2026-05',    lang: 'bn', faqType: 'month', expectCount: 8 },
  // Date pages
  { url: '/id/moon-in-makkah/2026-05-01', lang: 'id', faqType: 'date',  expectCount: 6 },
  { url: '/tr/moon-in-makkah/2026-05-01', lang: 'tr', faqType: 'date',  expectCount: 6 },
  { url: '/es/moon-in-makkah/2026-05-01', lang: 'es', faqType: 'date',  expectCount: 6 },
  { url: '/ms/moon-in-makkah/2026-05-01', lang: 'ms', faqType: 'date',  expectCount: 6 },
];
const Q1_BEFORE_BY_KEY = {
  'month/de': 'What is the moon calendar in Mekka for May 2026?',
  'month/fr': 'What is the moon calendar in La Mecque for May 2026?',
  'month/ur': 'What is the moon calendar in مکہ مکرمہ for May 2026?',
  'month/bn': 'What is the moon calendar in মক্কা for May 2026?',
  'date/id':  'What was the moon phase in Makkah on 1 Mei 2026?',
  'date/tr':  'What was the moon phase in Mekke on 1 Mayıs 2026?',
  'date/es':  'What was the moon phase in La Meca on 1 mayo 2026?',
  'date/ms':  'What was the moon phase in Makkah on 1 Mei 2026?',
};
const ENGLISH_PATTERN_RE = /^(What|How|When|Why|Is|Does|Can|Will|Should|Where|Who)\b/;

console.log('## Phase D3.1b verification — month + date moon FAQ');
console.log('');
console.log('| Page | Lang | FAQ type | Q1 before (en fallback) | Q1 after | EN-fallback Qs | FAQ count | Status |');
console.log('|---|---|---|---|---|---:|---:|---|');

let pass = 0, fail = 0;
for (const t of tests) {
  const r = await fetch('http://localhost:3000' + t.url);
  const html = await r.text();
  const faqRe = /"@type":"FAQPage"[^{}]*?"inLanguage":"([^"]+)"[\s\S]*?"mainEntity":\s*\[([\s\S]*?)\]\s*\}/;
  const m = html.match(faqRe);
  let qs = [];
  if (m) qs = [...m[2].matchAll(/"name":"((?:[^"\\]|\\.)*)"/g)].map(x => x[1]);
  const enLike = qs.filter(q => ENGLISH_PATTERN_RE.test(q)).length;
  const ok = (enLike === 0) && (qs.length === t.expectCount);
  if (ok) pass++; else fail++;
  const status = ok ? '✅ FIXED' : '❌ FAIL';
  const before = (Q1_BEFORE_BY_KEY[`${t.faqType}/${t.lang}`] || '?').slice(0, 55);
  const after = (qs[0] || '—').slice(0, 60);
  console.log(`| ${t.url} | ${t.lang} | ${t.faqType} | ${before} | ${after} | ${enLike} | ${qs.length} | ${status} |`);
}

console.log('');
console.log(`## Summary: ${pass}/8 pass`);
process.exit(fail > 0 ? 1 : 0);
