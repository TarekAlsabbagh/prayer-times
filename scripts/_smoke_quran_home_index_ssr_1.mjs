/* QURAN-AR-HOME-INDEX-SSR-1 — /quran: route, SSR index, juz starts, search data, SEO and structured data.
   Everything is checked against the SAME source files the page is built from (chapters.json,
   surah-routes.json, juz.json) — never against a list typed into this test. A hand-copied expectation would
   drift the moment the data does, and a green test on stale expectations is worse than no test. */
import fs from 'fs';
import path from 'path';

const BASE = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://localhost:3000';
const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const D = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1', 'metadata');
const CH = JSON.parse(fs.readFileSync(path.join(D, 'chapters.json'), 'utf8'));
const R = JSON.parse(fs.readFileSync(path.join(D, 'surah-routes.json'), 'utf8')).surahs;
const JZ = JSON.parse(fs.readFileSync(path.join(D, 'juz.json'), 'utf8'));
const clean = s => String(s).replace(/[ً-ٰٓـ]/g, '');
const pathOf = n => R.find(r => r.number === n).path;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const res = await fetch(BASE + '/quran');
const html = await res.text();
const count = re => (html.match(re) || []).length;

console.log('\n--- §3 route ---');
ok(res.status === 200, '/quran serves 200 — got ' + res.status);
ok(/class="page active" id="page-quran-home"/.test(html), '#page-quran-home is the active .page');
ok(!/class="page active" id="page-prayer-times"/.test(html), 'the shell home page was de-activated');
// /quran must not be resolvable as a surah: no route table entry may claim the bare path
ok(!R.some(r => r.path === '/quran'), '/quran is not a surah path in the route table');

console.log('\n--- §5 SEO ---');
// QURAN-AR-HOME-FINAL-CONTENT-AND-SEO-COPY-IMPLEMENTATION-1 — the three strings are asserted BYTE-EXACT and
// their lengths are asserted too: the ticket approved «52» and «141» as measured by JavaScript .length, so a
// silent re-word that still "reads fine" must fail here rather than be noticed in a later audit.
const TITLE = 'فهرس سور القرآن الكريم بالترتيب وقراءة القرآن كاملًا';
const H1    = 'فهرس سور القرآن الكريم بالترتيب';
const DESC  = 'تصفح فهرس سور القرآن الكريم بالترتيب وعدد آياتها، وانتقل إلى أي سورة أو جزء لقراءة القرآن كاملًا بالتشكيل والرسم العثماني برواية حفص عن عاصم.';
const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
ok(title === TITLE, 'title = the approved string — got «' + title + '»');
ok(title.length === 52, 'title length = 52 (JavaScript .length) — got ' + title.length);
ok(!/<title>[^<]*\| مواقيت الصلاة<\/title>/.test(html), 'no «| مواقيت الصلاة» suffix');
ok(count(/<h1/g) === 1, 'exactly ONE H1 — got ' + count(/<h1/g));
const h1 = (html.match(/id="quran-home-h1"[^>]*>([^<]*)</) || [])[1] || '';
ok(h1 === H1, 'H1 = the approved string — got «' + h1 + '»');
ok(h1 !== title, 'H1 is deliberately NOT the title (index page, not a reading page)');
const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1] || '';
ok(desc === DESC, 'meta description = the approved string');
ok(desc.length === 141, 'description length = 141 (JavaScript .length) — got ' + desc.length);
// forbidden in title/H1 by the ticket — each would either over-promise or waste headline space
['| مواقيت الصلاة','الرسم العثماني','رواية حفص','114','٦٢٣٦','تحميل','PDF','MP3','استماع','تفسير','ترجمة']
  .forEach(w => ok(!title.includes(w) && !h1.includes(w), 'title/H1 free of «' + w + '»'));
const canon = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1] || '';
ok(canon.endsWith('/quran'), 'canonical is self (/quran) — got ' + canon);
const ogt = (html.match(/property="og:title" content="([^"]*)"/) || [])[1] || '';
const ogd = (html.match(/property="og:description" content="([^"]*)"/) || [])[1] || '';
const ogu = (html.match(/property="og:url" content="([^"]*)"/) || [])[1] || '';
ok(ogt === TITLE, 'og:title = title');
ok(ogd === desc, 'og:description = meta description');
ok(ogu === canon, 'og:url = canonical');
ok(/<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"/.test(html) && !/content="noindex/.test(html), 'robots = index,follow (PUBLIC release — no noindex)');
ok(count(/rel="alternate" hreflang/g) === 0, 'no hreflang alternates');

console.log('\n--- §10 the 114-surah index ---');
const cards = [...html.matchAll(/class="quran-home-idx-card" href="(\/quran\/[^"]+)"/g)].map(m => m[1]);
ok(cards.length === 114, '114 index links — got ' + cards.length);
ok(cards.join() === CH.map(c => pathOf(c.number)).join(), 'links are the official slug paths in mushaf order 1..114');
ok(new Set(cards).size === 114, 'no duplicate link');
ok(count(/href="\/quran\/[0-9]/g) === 0, 'no numeric surah link');
ok(count(/\/quran\/surah\//g) === 0, 'no retired /quran/surah/ path');
ok(count(/class="quran-home-idx-li"/g) === 114, '114 index cards');
// name + ayah count per card, both from chapters.json
const missName = CH.filter(c => !html.includes('>سورة ' + clean(c.nameAr) + '<'));
ok(missName.length === 0, 'every card shows «سورة {name}»' + (missName.length ? ' — missing ' + missName.slice(0, 3).map(c => c.number) : ''));
// the slug is a search key in a data-* attribute, never rendered as visible text
ok(!/>\s*[a-z][a-z-]+\s*<\/span>/.test(html.split('quran-home-index')[1] || ''), 'no slug is printed as visible text in the index');
ok(count(/class="quran-home-idx-group"/g) === 6, '6 visual numeric bands — got ' + count(/class="quran-home-idx-group"/g));
ok(!/مكية|مدنية|الأكثر قراءة/.test(html), 'no Makki/Madani/most-read grouping (not in this data)');
// Scoped to the Quran page on purpose: the site SHELL ships 7 aria-disabled controls of its own (the
// homepage carries the identical 7), so a document-wide count would fail on markup this ticket never wrote.
const pageHtml = (html.split('id="page-quran-home"')[1] || '').split('<div class="page"')[0];
ok((pageHtml.match(/aria-disabled="true"/g) || []).length === 0, 'no disabled control INSIDE the Quran index');

console.log('\n--- §12 the 30 juz ---');
const juz = [...html.matchAll(/class="quran-home-juz-card" href="([^"]+)" data-quran-juz="(\d+)" data-quran-juz-surah="(\d+)" data-quran-juz-ayah="(\d+)"/g)];
ok(juz.length === 30, '30 juz links — got ' + juz.length);
const badJuz = juz.filter(([, href, j, s, a]) => {
  const src = JZ.find(x => x.juz === +j);
  return !src || +s !== src.surahs[0].surah || +a !== src.surahs[0].firstAyah
      || href !== pathOf(src.surahs[0].surah) + '#ayah-' + src.surahs[0].firstAyah;
});
ok(badJuz.length === 0, 'every juz link is its REAL first surah+ayah from juz.json' + (badJuz.length ? ' — bad: ' + badJuz.slice(0, 3).map(x => x[2]) : ''));
ok(juz.map(x => +x[2]).join() === JZ.map(j => j.juz).join(), 'juz are listed 1..30 in order');
ok(count(/\/quran\/juz\//g) === 0, 'no /quran/juz/N route was invented');

console.log('\n--- §8 the three figures are derived, not typed (now in the stat cards) ---');
// QURAN-HOME-STATS-CARDS-AND-AL-KAHF-FRIDAY-FEATURE-1 — the figures moved out of the hero chip row into
// dedicated stat cards. Still the same derived totals; here we assert each card prints its number as the
// big <strong> next to the right title, so a data bump would change the card, not a hand-typed slogan.
const totalAyat = CH.reduce((a, c) => a + c.ayahCount, 0);
ok(totalAyat === 6236, 'chapters.json sums to 6236 ayat — got ' + totalAyat);
const ar = n => String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
ok(html.includes('<strong class="quran-stat-num">' + ar(114) + '</strong><span class="quran-stat-title">سورة'), 'stat card shows ١١٤ سورة');
ok(html.includes('<strong class="quran-stat-num">' + ar(30) + '</strong><span class="quran-stat-title">جزءًا'), 'stat card shows ٣٠ جزءًا');
ok(html.includes('<strong class="quran-stat-num">' + ar(totalAyat) + '</strong><span class="quran-stat-title">آية'), 'stat card shows ' + ar(totalAyat) + ' آية');
ok((html.match(/class="quran-stat-card"/g) || []).length === 3, 'exactly three stat cards');
ok(!/quran-hero-chips|quran-home-stats"/.test(html), 'the old hero chip row is gone');

console.log('\n--- §9 search data island (no network needed) ---');
ok(count(/data-num="\d+" data-num-ar="/g) === 114, 'every card carries its number in both digit systems');
ok(count(/data-slug="/g) === 114, 'every card carries its slug as a search key');
ok(count(/data-en="/g) === 114, 'every card carries its official English name');
const anb = (html.match(/data-num="21"[^>]*data-name="([^"]*)"[^>]*data-en="([^"]*)"[^>]*data-slug="([^"]*)"/) || []);
ok(anb[1] === 'الأنبياء' && anb[3] === 'al-anbiya', 'surah 21 search keys: name=الأنبياء slug=al-anbiya — got ' + anb[1] + '/' + anb[3]);
ok(/data-num="36"[^>]*data-name="يس"/.test(html), 'surah 36 display name is «يس» (maddah stripped)');
ok(/data-num="38"[^>]*data-name="ص"/.test(html), 'surah 38 display name is «ص»');
ok(/data-num="50"[^>]*data-name="ق"/.test(html), 'surah 50 display name is «ق»');
ok(/data-num="3"[^>]*data-name="آل عمران"/.test(html), 'surah 3 display name is the two-word «آل عمران»');

console.log('\n--- §13 continue-reading card is SSR-hidden until JS finds a record ---');
ok(/id="quran-home-lastread"[^>]*hidden/.test(html), 'the card ships hidden (no empty card, no «لا يوجد سجل» copy)');
ok(/data-quran-continue[^>]*hidden|hidden[^>]*data-quran-continue/.test(html), 'the hero secondary button ships hidden');
ok(!/لا يوجد سجل/.test(html), 'no "no record" text anywhere in the hero');

console.log('\n--- §14/§15 source + FAQ ---');
ok(/مصدر النص القرآني/.test(html) && /مشروع Tanzil/.test(html), 'Tanzil source section present');
ok(/رواية حفص عن عاصم/.test(html), 'narration named');
ok(!/فضل سورة|أسباب النزول|تفسير|مكية|مدنية/.test(html), 'no fadl / asbab / tafsir / Makki-Madani claims');
const faqs = count(/class="country-faq-item"/g);
ok(faqs === 8, 'FAQ has exactly 8 questions — got ' + faqs);
ok(!/هل يمكن القراءة دون JavaScript؟/.test(html), 'the developer-facing JavaScript question was removed');
ok(/كم عدد سور القرآن الكريم وآياته؟/.test(html), 'the surah/ayah count question is present');
ok(/كيف أنتقل إلى جزء من أجزاء القرآن؟/.test(html), 'the juz question uses the approved wording');

console.log('\n--- final copy: hero, dedup, section intros ---');
ok(!/quran-hero-eyebrow/.test(html), 'the duplicate hero eyebrow was removed');
ok(/تصفح سور القرآن الكريم بالترتيب، وابحث باسم السورة أو رقمها، وانتقل مباشرة إلى السورة أو الجزء الذي تريد قراءته\./.test(html), 'hero intro = the approved string');
ok(count(/class="quran-services/g) === 1, 'exactly ONE services block — got ' + count(/class="quran-services/g));
ok(!/خدمات سريعة/.test(html), 'the duplicated «خدمات سريعة» strip was removed');
ok(/خدمات إسلامية أخرى/.test(html), 'the single services block keeps its approved heading');
ok(/ابحث باسم السورة أو رقمها، ثم افتح صفحتها لقراءتها كاملة\./.test(html), 'search lead = the approved string');
ok(/تصفح أجزاء القرآن الكريم الثلاثين بالترتيب، وانتقل مباشرة إلى السورة والآية التي يبدأ عندها كل جزء\./.test(html), 'juz intro = the approved string');
ok(/تصفح سور القرآن الكريم الـ١١٤ بالترتيب، من سورة الفاتحة إلى سورة الناس، مع رقم كل سورة وعدد آياتها\./.test(html), 'index intro = the approved string');
// anti-cannibalisation: the 114 card anchors must stay «سورة {name}», never «قراءة سورة {name}»
ok(!/class="quran-home-idx-card"[^>]*>[\s\S]{0,120}قراءة سورة/.test(html), 'no card anchor says «قراءة سورة» (that phrase belongs to the surah pages)');
ok(count(/class="quran-home-idx-name">سورة /g) === 114, 'all 114 card names read «سورة {name}» — got ' + count(/class="quran-home-idx-name">سورة /g));
// The ticket forbids targeting features that do not exist. Two corrections over a first attempt that
// banned bare words across the whole document and failed on innocent markup:
//   • scope to the Quran page's own section — «PDF» appears in a developer comment about the ZAKAT page,
//     which this ticket neither wrote nor owns;
//   • ban CLAIMS, not words — «تحميل» is the ordinary Arabic verb for loading, and the shell legitimately
//     says «عند إعادة تحميل الصفحة». What must never appear is «تحميل القرآن».
const quranPage = (html.split('id="page-quran-home"')[1] || '').split('<div class="page"')[0];
['تحميل القرآن','تنزيل القرآن','القرآن PDF','القرآن MP3','استماع','بدون إنترنت','بدون نت',
 'تفسير','أسباب النزول','بخط كبير', 'مكية', 'مدنية']
  .forEach(w => ok(!quranPage.includes(w), 'the page never claims «' + w + '»'));
ok(/لا تتوفر ترجمات|عربية فقط/.test(html), 'the translations answer states Arabic-only honestly');

console.log('\n--- §20 structured data ---');
const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => { try { return JSON.parse(m[1]); } catch (e) { return null; } });
ok(lds.every(Boolean), 'every JSON-LD block parses');
const bc = lds.find(x => x && x['@type'] === 'BreadcrumbList');
const il = lds.find(x => x && x['@type'] === 'ItemList');
ok(!!bc && bc.itemListElement.length === 2, 'BreadcrumbList has 2 rungs');
ok(!!bc && bc.itemListElement[1].name === 'القرآن الكريم' && bc.itemListElement[1].item.endsWith('/quran'), 'rung 2 = القرآن الكريم → /quran');
ok(!!il && il.numberOfItems === 114 && il.itemListElement.length === 114, 'ItemList has 114 items');
ok(!!il && il.itemListElement.every((x, i) => x.position === i + 1), 'ItemList positions run 1..114');
ok(!!il && il.itemListElement.every(x => x.name === 'سورة ' + clean(CH.find(c => c.number === x.position).nameAr)), 'ItemList names are «سورة {name}»');
ok(!!il && il.itemListElement.every(x => x.url.endsWith(pathOf(x.position))), 'ItemList urls are the official slug paths');
ok(!!il && new Set(il.itemListElement.map(x => x.url)).size === 114, 'no duplicate url in ItemList');
ok(!!il && !il.itemListElement.some(x => /\/quran\/(surah\/)?\d/.test(x.url)), 'no numeric or legacy url in ItemList');
ok(!!il && !('aggregateRating' in il) && !('author' in il), 'no invented rating/author fields');

console.log('\n--- §17 No-JS: the index does not depend on hydration ---');
ok(!/<div class="page active" id="page-quran-home">\s*<\/div>/.test(html), 'the page div is NOT an empty shell');
ok(count(/quran-home-idx-card/g) >= 114, 'all 114 links exist in the INITIAL html');
ok(!/spinner|جارٍ التحميل/i.test(html.split('page-quran-home')[1] || ''), 'no spinner / loading text in the index page');

console.log('\n--- §22 the index never loads the 114 ayah files ---');
// the whole Quran text is ~5.4 MB; an index that accidentally embedded ayat would be far larger
ok(html.length < 900_000, 'served HTML is under 900 KB — got ' + Math.round(html.length / 1024) + ' KB');
ok(!/textUthmani|quran-ayah-flow/.test(html), 'no ayah text or ayah-flow markup on the index');

console.log('\n--- §4 sitemap INCLUDES the Quran section (PUBLIC release) ---');
const sm = await (await fetch(BASE + '/sitemap-main.xml')).text();
const quranSitemapUrls = (sm.match(/<loc>[^<]*\/quran(?:\/[a-z0-9-]+)?<\/loc>/g) || []);
ok(quranSitemapUrls.length === 115, 'sitemap-main.xml contains exactly 115 /quran urls (/quran + 114 surahs) — ' + quranSitemapUrls.length);
ok(new Set(quranSitemapUrls).size === 115, 'the 115 /quran sitemap urls are all distinct (no duplicates)');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
// Set the code and let Node drain its handles instead of calling process.exit(). On Windows this build aborts
// with `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` when process.exit() races undici's socket
// teardown — isolated with a 3-line repro that crashes on a route this ticket never touches (/azkar) and exits
// cleanly the moment process.exit() is removed. Nothing to do with the page content; the exit code is identical.
process.exitCode = fail ? 1 : 0;
