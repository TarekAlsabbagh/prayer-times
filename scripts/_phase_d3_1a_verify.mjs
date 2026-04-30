// Phase D3.1a verification — 6 sample pages × Q1 in target lang.
// Scope: MOON_FAQ_I18N (today/general) + _MOON_HUB_FAQ (city hub) ONLY.
// Out of scope: month FAQ + date FAQ (D3.1b).
const tests = [
  { url: '/fr/moon-today',                lang: 'fr', faqType: 'today/general' },
  { url: '/tr/moon-today-in-makkah',      lang: 'tr', faqType: 'today/general' },
  { url: '/ur/moon-in-makkah',            lang: 'ur', faqType: 'hub' },
  { url: '/es/moon-today-in-makkah',      lang: 'es', faqType: 'today/general' },
  { url: '/bn/moon-in-makkah',            lang: 'bn', faqType: 'hub' },
  { url: '/ms/moon-in-makkah',            lang: 'ms', faqType: 'hub' },
  // Bonus: pages we expect TO STILL be English (D3.1b scope — sanity check)
  { url: '/de/moon-in-makkah/2026-05',    lang: 'de', faqType: 'month (D3.1b scope)' },
  { url: '/id/moon-in-makkah/2026-05-01', lang: 'id', faqType: 'date (D3.1b scope)' },
];
const Q1_BEFORE_BY_LANG = {
  fr: 'What moon phase is tonight?',
  tr: 'What moon phase is tonight?',
  ur: 'What is the moon phase today in مکہ مکرمہ?',
  es: 'What moon phase is tonight?',
  bn: 'What is the moon phase today in মক্কা?',
  ms: 'What is the moon phase today in Makkah?',
  de: 'What is the moon calendar in Mekka for May 2026?',
  id: 'What was the moon phase in Makkah on 1 Mei 2026?',
};
const ENGLISH_PATTERN_RE = /^(What|How|When|Why|Is|Does|Can|Will|Should|Where|Who)\b/;

console.log('## Phase D3.1a verification — moon FAQ localization');
console.log('');
console.log('| Page | Lang | FAQ type | Q1 before (en fallback) | Q1 after | EN-fallback Qs | FAQ count | Status |');
console.log('|---|---|---|---|---|---:|---:|---|');

let pass = 0, fail = 0;
for (const t of tests) {
  const r = await fetch('http://localhost:3000' + t.url);
  const html = await r.text();
  const faqRe = /"@type":"FAQPage"[^{}]*?"inLanguage":"([^"]+)"[\s\S]*?"mainEntity":\s*\[([\s\S]*?)\]\s*\}/;
  const m = html.match(faqRe);
  let qs = [], decl = '?';
  if (m) {
    decl = m[1];
    qs = [...m[2].matchAll(/"name":"((?:[^"\\]|\\.)*)"/g)].map(x => x[1]);
  }
  const enLike = qs.filter(q => ENGLISH_PATTERN_RE.test(q)).length;
  const inScope = !t.faqType.includes('D3.1b');
  // Pass criterion: in-scope pages must have 0 EN-fallback Qs.
  const ok = inScope ? (enLike === 0 && qs.length > 0) : true;
  if (ok) pass++; else fail++;
  const status = inScope ? (ok ? '✅ FIXED' : '❌ FAIL') : '⏳ Deferred';
  const before = (Q1_BEFORE_BY_LANG[t.lang] || '?').slice(0, 50);
  const after = (qs[0] || '—').slice(0, 50);
  console.log(`| ${t.url} | ${t.lang} | ${t.faqType} | ${before} | ${after} | ${enLike} | ${qs.length} | ${status} |`);
}

console.log('');
console.log(`## Summary: ${pass} pass / ${fail} fail (in-scope only)`);
process.exit(fail > 0 ? 1 : 0);
