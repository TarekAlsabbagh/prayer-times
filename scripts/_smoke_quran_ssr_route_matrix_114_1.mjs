// Smoke — QURAN-AR-FINAL-OFFICIAL-ENGLISH-SLUG-URL-STRUCTURE-NO-REDIRECTS-1 §16: ROUTE MATRIX.
// One URL per surah — /quran/{official-english-slug} — and NOTHING else. This asserts the whole surface:
//   • the 114 slugs        → 200, serving the RIGHT surah out of the RIGHT data file (not merely "a" surah)
//   • every retired path   → 404 with NO `Location` header (numeric, prefixed, mis-cased, mis-spelt, slashed)
//   • /quran itself        → not a surah
//   • ?ayah= / ?page=      → 302 to THIS slug's own fragment, bounded by its own data (see NOTE below)
//
// A route that 200s where it should 404 is worse than a crash: it publishes a page claiming to be something it
// is not. And a route that 301s where it should 404 is worse still — it teaches crawlers that a wrong URL is a
// real one worth remembering.
//
// NOTE on the ONE surviving 302 — flagged for review, not smuggled in. §8 forbids redirects; §13/§16 require
// no-JS reading to work. The jump-to-ayah form is a plain <form method="GET"> so it works without JS, and a
// GET form cannot produce a '#fragment' — the server must answer with one. That 302 goes to the SAME slug's
// own fragment (never to a different URL), so it redirects a *query* to an *anchor*, not one path to another.
// It is asserted explicitly below so it can never drift into a path redirect unnoticed.
//
//   QURAN_SSR_BASE=http://127.0.0.1:8085 node scripts/_smoke_quran_ssr_route_matrix_114_1.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0');
const BASE = process.env.QURAN_SSR_BASE || 'http://127.0.0.1:8085';
const CH = JSON.parse(fs.readFileSync(path.join(DATA, 'metadata/chapters.json'), 'utf8'));
const ROUTES = JSON.parse(fs.readFileSync(path.join(DATA, 'metadata/surah-routes.json'), 'utf8'));
const R = ROUTES.surahs;                              // source-derived: number, slug, path, dataFile
const bySlug = (s) => R.find(x => x.slug === s);
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
// redirect: 'manual' — a followed redirect would hide the very thing under test.
const head = (p) => fetch(BASE + p, { redirect: 'manual' }).then(r => ({ s: r.status, loc: r.headers.get('location') }));
const get = (p) => fetch(BASE + p, { redirect: 'manual' }).then(async r => ({ s: r.status, loc: r.headers.get('location'), h: await r.text() }));

console.log('\n--- 0) the routes table itself is sane before we trust it ---');
ok(R.length === 114, `surah-routes.json carries 114 records — got ${R.length}`);
ok(new Set(R.map(x => x.slug)).size === 114, '114 DISTINCT slugs (a collision would make two surahs share a URL)');
ok(R.every(x => x.path === '/quran/' + x.slug), 'every record\'s path is exactly /quran/{slug}');
ok(!R.some(x => /\d/.test(x.slug)), 'no slug contains a digit — the number never leaks into the URL');

console.log('\n--- 1) all 114 slug routes return 200 ---');
const codes = await Promise.all(R.map(x => head(x.path)));
const not200 = codes.map((r, i) => [R[i].path, r.s]).filter(([, s]) => s !== 200);
ok(not200.length === 0, '114/114 slug routes → 200' + (not200.length ? ' | offenders: ' + JSON.stringify(not200.slice(0, 8)) : ''));
ok(!codes.some(r => r.loc), 'NONE of the 114 carries a `Location` header — they are pages, not redirects');

console.log('\n--- 2) each slug serves the RIGHT surah, out of the RIGHT data file (all 114) ---');
// Number-matching alone is too weak: it would pass even if the server read the wrong JSON and relabelled it.
// So we take each surah's OWN first-ayah text straight from its OWN data file and require it on the page —
// text that exists in no other file. A crossed wire cannot survive this.
let wrongNum = [], missingText = [], wrongCount = [];
for (const rec of R) {
  const { h, s } = await get(rec.path);
  if (s !== 200) continue;
  const num = (h.match(/data-quran-surah-number="(\d+)"/) || [])[1];
  const slug = (h.match(/data-quran-surah-slug="([^"]+)"/) || [])[1];
  if (Number(num) !== rec.number || slug !== rec.slug) wrongNum.push([rec.path, num, slug]);

  const file = JSON.parse(fs.readFileSync(path.join(DATA, 'surahs', rec.dataFile), 'utf8'));
  const firstAyah = file.pages[0].ayahs[0].text;
  if (firstAyah && !h.includes(firstAyah)) missingText.push(rec.path);

  const ch = CH.find(c => c.number === rec.number);
  const rendered = (h.match(/class="quran-ayah"/g) || []).length;
  if (rendered !== ch.ayahCount) wrongCount.push([rec.path, rendered, ch.ayahCount]);
}
ok(wrongNum.length === 0, '114/114 pages carry the number+slug their route promises' + (wrongNum.length ? ' | ' + JSON.stringify(wrongNum.slice(0, 5)) : ''));
ok(missingText.length === 0, '114/114 pages contain their OWN data file\'s first ayah — right slug → right file' + (missingText.length ? ' | ' + JSON.stringify(missingText.slice(0, 5)) : ''));
ok(wrongCount.length === 0, '114/114 pages render exactly their own ayah count' + (wrongCount.length ? ' | ' + JSON.stringify(wrongCount.slice(0, 5)) : ''));

console.log('\n--- 3) every retired / wrong path → 404 with NO `Location` (§8: no redirects at all) ---');
const RETIRED = [
  // the old numeric structure, in every shape it ever had
  '/quran/surah/1', '/quran/surah/21', '/quran/surah/114', '/quran/surah/021', '/quran/surah/07',
  '/quran/surah', '/quran/surah/al-anbiya', '/quran/surah/0', '/quran/surah/115',
  // a bare number, or a number bolted onto the slug
  '/quran/1', '/quran/21', '/quran/114', '/quran/021', '/quran/al-anbiya-21', '/quran/21-al-anbiya',
  // near-misses that must NOT be auto-corrected into a real page
  '/quran/AL-ANBIYA', '/quran/Al-Anbiya', '/quran/al_anbiya', '/quran/al-anbia', '/quran/alanbiya',
  '/quran/al-anbiya/', '/quran/al-anbiya%20', '/quran/al-anbiyā', '/quran/al-anbiya-',
  // and plain nonsense
  '/quran/unknown', '/quran/0', '/quran/-1', '/quran/a', '/quran/al-anbiya/1',
];
for (const p of RETIRED) {
  const r = await head(p);
  ok(r.s === 404 && !r.loc, `${p} → 404, no Location — got ${r.s}${r.loc ? ' → ' + r.loc : ''}`);
}
ok(!(await Promise.all(RETIRED.map(head))).some(r => r.s >= 300 && r.s < 400),
   'not ONE retired path answers 3xx — nothing is redirected, aliased, case-folded or slug-corrected');

console.log('\n--- 4) /quran is reserved, not a surah; the rest of the site is untouched ---');
const q = await head('/quran');
// QURAN-AR-HOME-INDEX-SSR-1 built /quran as the section INDEX, so the old "not built → not 200" expectation
// is obsolete. The invariant that actually mattered survives and is asserted directly: /quran is not a SURAH.
ok(q.s === 200, `/quran serves the section index — got ${q.s}`);
const qh = await (await fetch(BASE + '/quran')).text();
ok(!/quran-surah-page|class="page active" id="page-quran-surah"/.test(qh), '/quran is NOT a surah page (no surah body, no #page-quran-surah active)');
ok(/class="page active" id="page-quran-home"/.test(qh), '/quran activates #page-quran-home, its own page');
ok(!R.some(x => x.slug === 'quran'), 'no surah claims the slug "quran"');
// The site's own trailing-slash 301 is a pre-existing global rule and must survive: only /quran/* opts out.
for (const p of ['/qibla/', '/moon/today/', '/azkar/']) {
  const r = await head(p);
  ok(r.s === 301, `${p} still 301s (the site-wide rule is intact outside /quran) — got ${r.s}`);
}

console.log('\n--- 5) ?ayah= / ?page= 302 to THIS slug\'s OWN fragment, bounded by its own data ---');
// Each surah's bounds are its own: 112 is a valid ayah in Al-Anbiya and an invalid one in Al-Fatiha.
for (const n of [1, 2, 21, 108, 114]) {
  const c = CH.find(x => x.number === n);
  const rec = R.find(x => x.number === n);
  const P = rec.path;
  const first = await head(`${P}?ayah=1`);
  ok(first.s === 302 && first.loc === `${P}#ayah-1`, `${P} ?ayah=1 → 302 ${P}#ayah-1 — got ${first.s} ${first.loc || ''}`);
  const last = await head(`${P}?ayah=${c.ayahCount}`);
  ok(last.s === 302 && last.loc === `${P}#ayah-${c.ayahCount}`, `${P} ?ayah=${c.ayahCount} (last) → 302 — got ${last.s} ${last.loc || ''}`);
  const over = await head(`${P}?ayah=${c.ayahCount + 1}`);
  ok(over.s === 200, `${P} ?ayah=${c.ayahCount + 1} (past the end) → NOT redirected, serves the page (200) — got ${over.s}`);
  const pg = await head(`${P}?page=${c.lastPage}`);
  ok(pg.s === 302 && pg.loc === `${P}#page-${c.lastPage}`, `${P} ?page=${c.lastPage} (last page) → 302 — got ${pg.s} ${pg.loc || ''}`);
  const pgBad = await head(`${P}?page=${c.firstPage - 1}`);
  ok(pgBad.s === 200, `${P} ?page=${c.firstPage - 1} (outside this surah) → NOT redirected (200) — got ${pgBad.s}`);
}
// The fragment target NEVER changes the path — that is what keeps this a fragment jump and not a URL redirect.
const strays = [];
for (const n of [1, 2, 21, 108, 114]) {
  const rec = R.find(x => x.number === n);
  const r = await head(`${rec.path}?ayah=1`);
  if (r.loc && r.loc.split('#')[0] !== rec.path) strays.push([rec.path, r.loc]);
}
ok(strays.length === 0, 'every ?ayah= 302 lands on its OWN slug + a fragment — no path is ever rewritten' + (strays.length ? ' | ' + JSON.stringify(strays) : ''));

// the ayah ceiling must be per-surah, not a global 112 (Al-Anbiya's count leaking onto everyone else)
const fatiha8 = await head(R[0].path + '?ayah=8');
ok(fatiha8.s === 200, `${R[0].path} ?ayah=8 does NOT redirect — its ceiling is 7, not Al-Anbiya's 112 — got ${fatiha8.s}`);
const baqara150 = await head(R[1].path + '?ayah=150');
ok(baqara150.s === 302 && baqara150.loc === `${R[1].path}#ayah-150`, `${R[1].path} ?ayah=150 → 302 (a global 112 ceiling would have refused it) — got ${baqara150.s}`);

console.log('\n--- 6) the ?ayah= 302 is safe: it can ONLY ever be same-slug + a numeric fragment ---');
// This is the ONE surviving redirect, so it is also the one an attacker would probe. A GET form cannot post a
// fragment, so the server answers with one — but the value is validated to 1-3 digits AND the Location is built
// from the server's OWN canonical path, never from the query. So no crafted value can turn it into an open
// redirect, a path rewrite, or a jump to an ayah that does not exist. Every malformed value below must NOT
// produce a 302 (it either serves the page at 200 or falls through) and must NEVER emit a Location.
const AB = R.find(x => x.number === 21).path;   // Al-Anbiya, 112 ayat
const BAQ = R.find(x => x.number === 2).path;   // Al-Baqara, 286 ayat
const MALFORMED = [
  [`${AB}?ayah=0`,                    'zero is below the floor'],
  [`${AB}?ayah=-1`,                   'a negative is not a digit run'],
  [`${AB}?ayah=1.5`,                  'a decimal — the fragment must be a whole ayah'],
  [`${AB}?ayah=test`,                 'a word is not a number'],
  [`${AB}?ayah=`,                     'an empty value'],
  [`${BAQ}?ayah=287`,                 'past THIS surah\'s last ayah (286)'],
  [`${AB}?ayah=113`,                  'past THIS surah\'s last ayah (112)'],
  [`${AB}?ayah=https://example.com`,  'an absolute URL — the open-redirect probe'],
  [`${AB}?ayah=//example.com`,        'a protocol-relative URL — the other open-redirect probe'],
  [`${AB}?ayah=5abc`,                 'digits with a trailing tail — must not be accepted as 5'],
  [`${AB}?ayah=1000`,                 'four digits — outside the 1-3 digit window and any real count'],
];
for (const [p, why] of MALFORMED) {
  const r = await head(p);
  ok(r.s !== 302 && !r.loc, `${p} → NOT a 302, NO Location (${why}) — got ${r.s}${r.loc ? ' → ' + r.loc : ''}`);
}
// And when it DOES fire, the Location is exactly "<this canonical path>#ayah-<n>": no query survives, the path
// is never a different one, and there is never a second '#'.
for (const [n, a] of [[21, 5], [2, 286], [1, 7], [114, 6]]) {
  const rec = R.find(x => x.number === n);
  const r = await head(`${rec.path}?ayah=${a}&foo=bar`);   // trailing junk must not break the match or leak through
  const want = `${rec.path}#ayah-${a}`;
  ok(r.s === 302 && r.loc === want, `${rec.path}?ayah=${a}&foo=bar → 302 ${want} exactly (no query, no double #) — got ${r.s} ${r.loc || ''}`);
  ok(r.loc && !r.loc.includes('?') && (r.loc.match(/#/g) || []).length === 1 && r.loc.startsWith(rec.path + '#'),
     `${rec.path} 302 Location is canonical-path + ONE fragment, no query — ${r.loc}`);
}
// The canonical/OG the page advertises must itself be clean — no ?ayah, no #fragment ever bakes into it.
const abHtml = await get(AB);
const canon = (abHtml.h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
const og = (abHtml.h.match(/<meta property="og:url" content="([^"]*)"/) || [])[1] || '';
ok(canon.endsWith(AB) && !/[?#]/.test(canon.replace(/^https?:\/\/[^/]+/, '')), `canonical is the clean slug path, no query/fragment — ${canon}`);
ok(og.endsWith(AB) && !/[?#]/.test(og.replace(/^https?:\/\/[^/]+/, '')), `og:url is the clean slug path, no query/fragment — ${og}`);
// …and no ordinary internal link on the page carries ?ayah= (the query is a no-JS fallback, not a link style).
ok(!/href="[^"]*\?ayah=/.test(abHtml.h), 'NO internal link on the page uses ?ayah= (it is a no-JS form target only)');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
