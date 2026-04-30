// Phase D2.1 acceptance tests.
// (A) /about-{city}*  → 410 Gone + X-Robots-Tag: noindex
// (B) /about-us       → 200 OK
// (C) sitemap         → 0 /about- URLs
// (D) neighbor pages  → 200 OK (regression check)
const BASE = 'http://localhost:3000';
let pass = 0, fail = 0;
const expect = (cond, label, info='') => {
  if (cond) { pass++; console.log(`✓ ${label}${info?' — '+info:''}`); }
  else      { fail++; console.log(`✗ ${label}${info?' — '+info:''}`); }
};

// ── (A) 410 expected ──
const goneCases = [
  '/about-makkah',
  '/about-makkah-21.42-39.83',
  '/about-makkah.html',
  '/en/about-makkah',
  '/fr/about-makkah',
  '/ar/about-makkah',
  '/about-new-york-40.71--74.01',
];
console.log('\n## (A) 410 Gone for /about-{city}*');
for (const p of goneCases) {
  const r = await fetch(BASE + p, { redirect: 'manual' });
  const xrt = r.headers.get('x-robots-tag') || '';
  expect(r.status === 410, `${p} → ${r.status}`, `X-Robots-Tag: "${xrt}"`);
  expect(/noindex/i.test(xrt), `   ↳ noindex header present on ${p}`);
}

// ── (B) /about-us must remain 200 ──
const aboutUsCases = [
  '/about-us',
  '/en/about-us',
  '/fr/about-us',
  '/ar/about-us',
  '/about-us.html',
];
console.log('\n## (B) /about-us still 200 OK');
for (const p of aboutUsCases) {
  const r = await fetch(BASE + p, { redirect: 'manual' });
  // /about-us.html may 301 → /about-us. Both are acceptable.
  const okStatus = (r.status === 200) || (r.status === 301 && /\/about-us(?:\?|$)/.test(r.headers.get('location') || ''));
  expect(okStatus, `${p} → ${r.status}`, r.status === 301 ? `→ ${r.headers.get('location')}` : '');
}

// ── (C) sitemap should have 0 /about- URLs ──
console.log('\n## (C) Sitemap purity');
{
  const r = await fetch(BASE + '/sitemap.xml');
  const xml = await r.text();
  const sub = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  let total = 0, aboutCount = 0;
  for (const url of sub) {
    const r2 = await fetch(url);
    const x2 = await r2.text();
    const subUrls = [...x2.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    total += subUrls.length;
    aboutCount += subUrls.filter(u => /\/about-(?!us(?:\.html)?(?:\/|$|\?))/.test(u)).length;
    console.log(`  └ ${url.replace(BASE,'')}: ${subUrls.length} URLs, ${subUrls.filter(u => /\/about-(?!us(?:\.html)?(?:\/|$|\?))/.test(u)).length} /about-* hits`);
  }
  expect(aboutCount === 0, `total /about-{city} URLs in sitemap = ${aboutCount}`, `(scanned ${total} URLs across ${sub.length} sub-sitemaps)`);
}

// ── (D) Neighbor routes still 200 ──
console.log('\n## (D) Neighbor routes regression check');
const neighborCases = [
  '/prayer-times-in-makkah',
  '/qibla-in-makkah',
  '/moon-today-in-makkah',
  '/moon-in-makkah',
  '/prayer-times-in-saudi-arabia',
  '/dateconverter',
  '/zakat-calculator',
  '/duas',
];
for (const p of neighborCases) {
  const r = await fetch(BASE + p, { redirect: 'manual' });
  expect(r.status === 200, `${p} → ${r.status}`);
}

console.log(`\n## Summary: ${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
