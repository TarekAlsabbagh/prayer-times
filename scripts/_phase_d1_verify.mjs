// Phase D1 verification: fetch all 7 static pages × 10 languages and dump
// title length / desc length / separator / canonical / hreflang count / h1 count.
const langs = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const langPath = (lang, base) => (lang === 'ar' ? '' : '/' + lang) + base;
const pages = [
  { name: '/',                  base: '/' },
  { name: '/qibla',             base: '/qibla' },
  { name: '/hijri-date/{date}', base: '/hijri-date/1447-10-13' },
  { name: '/dateconverter',     base: '/dateconverter' },
  { name: '/zakat-calculator',  base: '/zakat-calculator' },
  { name: '/duas',              base: '/duas' },
  { name: '/msbaha',            base: '/msbaha' },
];

const results = [];
for (const p of pages) {
  for (const lang of langs) {
    const u = 'http://localhost:3000' + langPath(lang, p.base);
    let r, html;
    try {
      r = await fetch(u, { redirect: 'follow' });
      html = await r.text();
    } catch (e) {
      results.push({ page: p.name, lang, error: String(e.message || e), status: '?' });
      continue;
    }
    const t = (html.match(/<title>([^<]*)<\/title>/) || [,''])[1];
    const d = (html.match(/<meta name="description" content="([^"]*)"/) || [,''])[1];
    const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [,''])[1];
    const hreflangs = (html.match(/<link rel="alternate"[^>]*hreflang=/g) || []).length;
    const h1 = (html.match(/<h1[^>]*>/g) || []).length;
    // separator detection (in title)
    const sep = t.includes(' | ')   ? '|' :
                t.includes(' — ')   ? '—' :
                t.includes(' - ')   ? '-' :
                t.includes(': ')    ? ':' : '?';
    results.push({
      page: p.name,
      lang,
      status: r.status,
      titleLen: [...t].length,           // count code points (handles surrogate pairs / combining marks)
      descLen:  [...d].length,
      sep,
      h1,
      canonical: canon.replace('http://localhost:3000',''),
      hreflang: hreflangs,
      title: t,
    });
  }
}

// Print as a Markdown table
console.log('| Page | Lang | Status | TitleLen | DescLen | Sep | H1 | Hreflang | Canonical |');
console.log('|---|---|---|---:|---:|---|---:|---:|---|');
for (const r of results) {
  if (r.error) {
    console.log(`| ${r.page} | ${r.lang} | ERR | — | — | — | — | — | ${r.error} |`);
    continue;
  }
  console.log(`| ${r.page} | ${r.lang} | ${r.status} | ${r.titleLen} | ${r.descLen} | ${r.sep} | ${r.h1} | ${r.hreflang} | ${r.canonical} |`);
}

// Summary stats
console.log('\n## Summary');
const titles = results.filter(r => !r.error);
const over70  = titles.filter(r => r.titleLen > 70);
const under45 = titles.filter(r => r.titleLen < 45);
const descOver170 = titles.filter(r => r.descLen > 170);
const descUnder100 = titles.filter(r => r.descLen < 100);
const wrongSep = titles.filter(r => r.sep !== '|');
const wrongH1 = titles.filter(r => r.h1 !== 1);
const wrongHreflang = titles.filter(r => r.hreflang !== 11);

const fmt = (lst) => lst.length ? lst.map(r => `${r.page}/${r.lang}=${r.titleLen}|${r.descLen}|${r.sep}`).join(', ') : '✓ none';
console.log(`- titles >70: ${over70.length} (${fmt(over70)})`);
console.log(`- titles <45: ${under45.length} (${fmt(under45)})`);
console.log(`- descs >170: ${descOver170.length} (${fmt(descOver170)})`);
console.log(`- descs <100: ${descUnder100.length} (${fmt(descUnder100)})`);
console.log(`- separator ≠ "|": ${wrongSep.length} (${fmt(wrongSep)})`);
console.log(`- H1 ≠ 1: ${wrongH1.length}`);
console.log(`- hreflang ≠ 11: ${wrongHreflang.length}`);

// Detect English fallback inside non-en/non-ar langs (zakat & duas previously had this).
const enTitlesByPage = {};
for (const r of titles) if (r.lang === 'en') enTitlesByPage[r.page] = r.title;
const fallbacks = titles.filter(r =>
  r.lang !== 'en' && r.lang !== 'ar' &&
  enTitlesByPage[r.page] && r.title === enTitlesByPage[r.page]);
console.log(`- English fallback in non-en/ar: ${fallbacks.length} (${fmt(fallbacks)})`);
