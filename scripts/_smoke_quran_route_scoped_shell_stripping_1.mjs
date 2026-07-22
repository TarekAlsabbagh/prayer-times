/* SHELL-SPA-PAGE-BLOCKS-PER-ROUTE-STRIPPING-1
   The shell ships every SPA .page block in one document. On a Quran route that meant 23 foreign pages —
   ~10k words and 177 headings belonging to OTHER pages — sitting in the RAW HTML an SEO crawler reads
   (SEOptimer listed «مواقيت الصلاة» headings while auditing /quran). This smoke is the durable guard:
   Quran routes must ship exactly ONE .page block, and every non-Quran route must stay untouched. */
import fs from 'fs';

const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://localhost:3000';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const ROUTES = JSON.parse(fs.readFileSync('data/quran/tanzil-uthmani-1-1/metadata/surah-routes.json', 'utf8')).surahs;
const strip = h => h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const pageIds = h => [...new Set([...h.matchAll(
  /<div[^>]*\bclass="[^"]*\bpage\b[^"]*"[^>]*\bid="(page-[^"]+)"|<div[^>]*\bid="(page-[^"]+)"[^>]*\bclass="[^"]*\bpage\b[^"]*"/g)]
  .map(m => m[1] || m[2]).filter(Boolean))];
const headings = h => [...h.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => ({ tag: m[1].toLowerCase(), text: strip(m[2]) }));
// topics that belong to OTHER pages of the site and must never appear on a Quran route
const FOREIGN = /مواقيت الصلاة|حالة القمر|أطوار القمر|حاسبة الزكاة|اتجاه القبلة|المسبحة الإلكترونية|أذكار الصباح|أذكار المساء|التقويم الهجري|كم باقي على/;

console.log('--- §1 /quran ships exactly one .page block ---');
{
  const html = await (await fetch(B + '/quran')).text();
  const ids = pageIds(html), heads = headings(html);
  ok(ids.length === 1 && ids[0] === 'page-quran-home', `.page blocks = ${ids.length} (${ids.join()})`);
  ok(!/id="page-prayer-times"/.test(html) && !/id="page-moon"/.test(html) && !/id="page-zakat"/.test(html)
     && !/id="page-tasbih"/.test(html) && !/id="page-azkar-hub"/.test(html) && !/id="page-qibla"/.test(html),
     'the prayer-times / moon / zakat / tasbih / azkar / qibla blocks are gone from the raw HTML');
  ok(heads.filter(h => h.tag === 'h1').length === 1, `exactly one H1 — ${heads.filter(h => h.tag === 'h1').length}`);
  ok(heads.filter(h => h.text.includes('مواقيت الصلاة')).length === 0, 'zero «مواقيت الصلاة» headings');
  ok(heads.filter(h => FOREIGN.test(h.text)).length === 0, `zero headings belonging to other pages — ${heads.filter(h => FOREIGN.test(h.text)).length}`);
  ok(heads.length <= 30, `heading count is page-sized, not shell-sized — ${heads.length} (was 200)`);
  // the page itself must survive the stripping intact
  ok((html.match(/class="quran-home-idx-card"/g) || []).length === 114, '114 surah cards intact');
  ok((html.match(/class="quran-home-juz-card"/g) || []).length === 30, '30 juz cards intact');
  ok(/id="quran-surah-index"/.test(html) && /quran-home-source/.test(html) && /quran-home-faq/.test(html),
     'index + source + FAQ sections intact');
  ok(/<meta name="robots" content="noindex/.test(html), 'noindex retained');
}

console.log('\n--- §2 surah routes ship exactly one .page block (sample + full sweep) ---');
{
  const html = await (await fetch(B + '/quran/al-baqarah')).text();
  const ids = pageIds(html), heads = headings(html);
  ok(ids.length === 1 && ids[0] === 'page-quran-surah', `.page blocks = ${ids.length} (${ids.join()})`);
  ok(!/id="page-quran-home"/.test(html), 'the /quran home block is absent from a surah page');
  ok(heads.filter(h => FOREIGN.test(h.text)).length === 0, 'zero foreign-topic headings');
  ok((html.match(/class="quran-ayah"/g) || []).length === 286, 'all 286 ayat of Al-Baqarah still present');
}
{
  let onePage = 0, noForeign = 0, oneH1 = 0;
  for (const rec of ROUTES) {
    const html = await (await fetch(B + rec.path)).text();
    const ids = pageIds(html), heads = headings(html);
    if (ids.length === 1 && ids[0] === 'page-quran-surah') onePage++;
    if (heads.filter(h => FOREIGN.test(h.text)).length === 0) noForeign++;
    if (heads.filter(h => h.tag === 'h1').length === 1) oneH1++;
  }
  ok(onePage === 114, `114/114 surah pages ship exactly one .page block — ${onePage}`);
  ok(noForeign === 114, `114/114 free of foreign-topic headings — ${noForeign}`);
  ok(oneH1 === 114, `114/114 keep exactly one H1 — ${oneH1}`);
}

console.log('\n--- §3 NON-Quran routes are untouched (stripping is Quran-scoped) ---');
for (const [route, minBlocks] of [['/', 20], ['/qibla', 20], ['/azkar', 20], ['/zakat-calculator', 20], ['/moon', 5]]) {
  const html = await (await fetch(B + route)).text();
  const ids = pageIds(html);
  ok(ids.length >= minBlocks, `${route} still ships its full shell — ${ids.length} .page blocks (>= ${minBlocks})`);
}
{
  // the site home must still carry the prayer-times page it renders
  const html = await (await fetch(B + '/')).text();
  ok(/id="page-prayer-times"/.test(html), '/ still contains #page-prayer-times');
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
