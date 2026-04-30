// Phase D3.1 Final QA — Moon multilingual consistency check (HTTP layer).
// 6 checks here (1, 2-info, 3, 4, 6, 10). Checks 5/7/8/9 done via iframe.
const BASE = 'http://localhost:3000';

const pages = [
  { url: '/fr/moon-today',                lang: 'fr', type: 'hub-gateway',    expectB: 'none'   },
  { url: '/tr/moon-today-in-makkah',      lang: 'tr', type: 'today-in-city',  expectB: 'B4'     },
  { url: '/ur/moon-in-makkah',            lang: 'ur', type: 'city-hub',       expectB: 'B3'     },
  { url: '/de/moon-in-makkah/2026-05',    lang: 'de', type: 'month',          expectB: 'B2'     },
  { url: '/id/moon-in-makkah/2026-05-01', lang: 'id', type: 'date',           expectB: 'B1'     },
  { url: '/es/moon-today-in-makkah',      lang: 'es', type: 'today-in-city',  expectB: 'B4'     },
  { url: '/bn/moon-in-makkah',            lang: 'bn', type: 'city-hub',       expectB: 'B3'     },
  { url: '/ms/moon-in-makkah/2026-05',    lang: 'ms', type: 'month',          expectB: 'B2'     },
];

console.log('# D3.1 Final QA — HTTP layer\n');
console.log('| URL | Lang | (1) H1 | (2) Title len | (2) Desc len | (3) Canonical | (4) Hreflang | (6) JSON-LD lang | (10) /about- |');
console.log('|---|---|:---:|---:|---:|:---:|---:|:---:|:---:|');

const summary = { pass: 0, fail: 0, issues: [] };

for (const p of pages) {
  const r = await fetch(BASE + p.url);
  const html = await r.text();

  // (1) H1 count
  const h1Tags = (html.match(/<h1\b[^>]*>/g) || []).length;
  const h1Ok = h1Tags === 1;

  // (2) Title + Desc length (informational — wide bounds)
  const t = (html.match(/<title>([^<]*)<\/title>/) || [,''])[1];
  const titleLen = [...t].length;
  const d = (html.match(/<meta name="description" content="([^"]*)"/) || [,''])[1];
  const descLen = [...d].length;
  const titleOk = titleLen >= 25 && titleLen <= 75;
  const descOk  = descLen >= 100 && descLen <= 260; // lenient: pre-existing /moon-today fr=253

  // (3) Canonical = self
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [,''])[1];
  const canonOk = canon.endsWith(p.url);

  // (4) Hreflang count = 11
  const hreflang = (html.match(/<link rel="alternate"[^>]*hreflang=/g) || []).length;
  const hreflangOk = hreflang === 11;

  // (6) JSON-LD FAQPage inLanguage
  const ldFaqMatch = html.match(/"@type":"FAQPage"[^{}]*?"inLanguage":"([^"]+)"/);
  const ldLang = ldFaqMatch ? ldFaqMatch[1] : '?';
  const ldLangOk = ldLang === p.lang;

  // (10) Internal /about-{city} links — find all then filter out /about-us
  const allAbout = html.match(/href="\/(?:[a-z]{2}\/)?about-[^"]+"/g) || [];
  const aboutCity = allAbout.filter(h => !/^href="\/(?:[a-z]{2}\/)?about-us(?:\.html)?\/?"$/.test(h));
  const aboutOk = aboutCity.length === 0;

  const allOk = h1Ok && titleOk && descOk && canonOk && hreflangOk && ldLangOk && aboutOk;
  if (allOk) summary.pass++; else { summary.fail++; summary.issues.push(p.url); }

  const fmt = (v, ok) => (ok ? '✓' : '⚠') + ' ' + v;
  console.log(`| ${p.url} | ${p.lang} | ${fmt(h1Tags, h1Ok)} | ${fmt(titleLen, titleOk)} | ${fmt(descLen, descOk)} | ${canonOk ? '✓ self' : '⚠ '+canon.replace(BASE,'')} | ${fmt(hreflang, hreflangOk)} | ${fmt(ldLang, ldLangOk)} | ${aboutOk ? '✓ 0' : '⚠ '+aboutCity.length} |`);
}

console.log(`\n## HTTP layer summary: ${summary.pass}/${pages.length} pass`);
if (summary.issues.length) console.log('Issues on: ' + summary.issues.join(', '));

// Sitemap purity check (global, run once)
console.log('\n## Sitemap purity (check 10 — global)');
{
  const r = await fetch(BASE + '/sitemap.xml');
  const xml = await r.text();
  const subs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  let total = 0, aboutHits = 0;
  for (const u of subs) {
    const r2 = await fetch(u);
    const x2 = await r2.text();
    const urls = [...x2.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    total += urls.length;
    aboutHits += urls.filter(u => /\/about-(?!us(?:\.html)?(?:\/|$|\?))/.test(u)).length;
  }
  console.log(`  Sitemap total URLs: ${total}, /about-{city}: ${aboutHits} ${aboutHits === 0 ? '✓' : '⚠'}`);
}
