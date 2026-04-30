// Phase D3.1 audit: detect English-leak FAQ on the 8 non-ar/non-en moon pages.
const tests = [
  { url: '/moon-today',                            lang: 'ar' },
  { url: '/en/moon-today',                         lang: 'en' },
  { url: '/fr/moon-today',                         lang: 'fr' },
  { url: '/tr/moon-today-in-makkah',               lang: 'tr' },
  { url: '/ur/moon-in-makkah',                     lang: 'ur' },
  { url: '/de/moon-in-makkah/2026-05',             lang: 'de' },
  { url: '/id/moon-in-makkah/2026-05-01',          lang: 'id' },
  { url: '/es/moon-today-in-makkah',               lang: 'es' },
  { url: '/bn/moon-in-makkah',                     lang: 'bn' },
  { url: '/ms/moon-in-makkah/2026-05',             lang: 'ms' },
];

const ENGLISH_PATTERN_RE = /^(What|How|When|Why|Is|Does|Can|Will|Should|Where|Who)\b/;

console.log('| URL | declLang | FAQ count | Eng-pattern Qs | Q1 sample |');
console.log('|---|---|---:|---:|---|');

for (const t of tests) {
  const r = await fetch('http://localhost:3000' + t.url);
  const html = await r.text();
  // Find FAQPage block inside ssr-graph-schema (one big JSON-LD with @graph).
  const faqRe = /"@type":"FAQPage"[^{}]*?"inLanguage":"([^"]+)"[\s\S]*?"mainEntity":\s*\[([\s\S]*?)\]\s*\}/;
  const m = html.match(faqRe);
  if (!m) {
    console.log(`| ${t.url} | (none) | 0 | 0 | — |`);
    continue;
  }
  const decl = m[1];
  const arr = m[2];
  // Extract names. Account for escaped quotes inside.
  const qs = [...arr.matchAll(/"name":"((?:[^"\\]|\\.)*)"/g)].map(x => x[1]);
  const enLike = qs.filter(q => ENGLISH_PATTERN_RE.test(q)).length;
  const q1 = qs[0] ? qs[0].slice(0, 70) : '—';
  console.log(`| ${t.url} | ${decl} | ${qs.length} | ${enLike} | ${q1} |`);
}

console.log('\n## Heading scan (h1/h2/h3) for body fallback');
console.log('| URL | h1 | first h2/h3 (lang check) |');
console.log('|---|---|---|');
for (const t of tests) {
  const r = await fetch('http://localhost:3000' + t.url);
  const html = await r.text();
  // Strip script/style. Take only #page-moon if present (skip footer).
  const hMatches = [...html.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h[1-3]>/g)]
    .map(x => ({ tag: 'h'+x[1], txt: x[2].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim() }))
    .filter(h => h.txt && h.txt.length > 5)
    .slice(0, 6);
  const h1 = hMatches.find(h => h.tag === 'h1')?.txt || '—';
  const h23 = hMatches.filter(h => h.tag !== 'h1').slice(0, 2).map(h => h.txt).join(' • ');
  console.log(`| ${t.url} | ${h1.slice(0, 60)} | ${h23.slice(0, 90)} |`);
}
