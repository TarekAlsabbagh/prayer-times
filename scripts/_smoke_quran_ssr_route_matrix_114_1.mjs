// Smoke — QURAN-AR-SSR-SURAH-GENERALIZATION-1 §2: ROUTE MATRIX.
// One canonical URL per surah and nothing else. This asserts the whole surface of /quran/surah/*:
//   • 1..114 bare      → 200 (all 114, not a sample)
//   • leading zeros    → 301 to the bare number (never two URLs serving the same surah)
//   • 0 / 115 / junk   → 404 (never a 200 with a default/nearest surah, never a 500)
//   • ?ayah= / ?page=  → 302 to this surah's OWN fragment, bounded by its own data
// A route that 200s where it should 404 is worse than a crash: it publishes a page that claims to be
// something it is not.
//
//   QURAN_SSR_BASE=http://127.0.0.1:8085 node scripts/_smoke_quran_ssr_route_matrix_114_1.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.QURAN_SSR_BASE || 'http://127.0.0.1:8085';
const CH = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0/metadata/chapters.json'), 'utf8'));
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
// redirect: 'manual' — a followed redirect would hide the very thing under test.
const head = (p) => fetch(BASE + p, { redirect: 'manual' }).then(r => ({ s: r.status, loc: r.headers.get('location') }));

console.log('\n--- 1) all 114 canonical routes return 200 ---');
const codes = await Promise.all(CH.map(c => head('/quran/surah/' + c.number)));
const not200 = codes.map((r, i) => [i + 1, r.s]).filter(([, s]) => s !== 200);
ok(not200.length === 0, `114/114 canonical surah routes → 200` + (not200.length ? ' | offenders: ' + JSON.stringify(not200.slice(0, 8)) : ''));

console.log('\n--- 2) leading zeros 301 to the ONE canonical URL ---');
for (const [p, want] of [['/quran/surah/021', '/quran/surah/21'], ['/quran/surah/07', '/quran/surah/7'],
                         ['/quran/surah/001', '/quran/surah/1'], ['/quran/surah/0114', null]]) {
  const r = await head(p);
  if (want === null) ok(r.s === 404, `${p} → 404 (4 digits is not a surah number) — got ${r.s}`);
  else ok(r.s === 301 && r.loc === want, `${p} → 301 ${want} — got ${r.s} ${r.loc || ''}`);
}

console.log('\n--- 3) out-of-range and malformed → 404 (never 200, never 500) ---');
for (const p of ['/quran/surah/0', '/quran/surah/115', '/quran/surah/999', '/quran/surah/-1', '/quran/surah/21.5',
                 '/quran/surah/test', '/quran/surah', '/quran/surah/1a',
                 '/quran/surah/%31', '/quran/surah/1/2']) {
  const r = await head(p);
  ok(r.s === 404, `${p} → 404 — got ${r.s}`);
}
// Trailing slash is handled by the site's own pre-existing rule (verified identical on /qibla/ and
// /moon/today/), NOT by this ticket. It 301s to the slashless path — which is exactly the one-canonical-URL
// guarantee, so it is asserted here rather than left untested.
for (const [p, want] of [['/quran/surah/21/', '/quran/surah/21'], ['/quran/surah/', '/quran/surah']]) {
  const r = await head(p);
  ok(r.s === 301 && (r.loc || '').endsWith(want), `${p} → 301 ${want} (site-wide trailing-slash rule) — got ${r.s} ${r.loc || ''}`);
}
// …and the slashless target of the second one is itself a 404, so '/quran/surah/' never reaches a page.
ok((await head('/quran/surah')).s === 404, "/quran/surah/ ultimately lands on 404 (there is no surah index page yet)");

console.log('\n--- 4) ?ayah= / ?page= 302 to THIS surah\'s own fragment, bounded by its own data ---');
// Each surah's bounds are its own: 112 is a valid ayah in Al-Anbiya and an invalid one in Al-Fatiha.
for (const n of [1, 2, 21, 108, 114]) {
  const c = CH.find(x => x.number === n);
  const first = await head(`/quran/surah/${n}?ayah=1`);
  ok(first.s === 302 && first.loc === `/quran/surah/${n}#ayah-1`, `surah ${n} ?ayah=1 → 302 #ayah-1 — got ${first.s} ${first.loc || ''}`);
  const last = await head(`/quran/surah/${n}?ayah=${c.ayahCount}`);
  ok(last.s === 302 && last.loc === `/quran/surah/${n}#ayah-${c.ayahCount}`, `surah ${n} ?ayah=${c.ayahCount} (last) → 302 — got ${last.s} ${last.loc || ''}`);
  const over = await head(`/quran/surah/${n}?ayah=${c.ayahCount + 1}`);
  ok(over.s === 200, `surah ${n} ?ayah=${c.ayahCount + 1} (past the end) → NOT redirected, serves the page (200) — got ${over.s}`);
  const pg = await head(`/quran/surah/${n}?page=${c.lastPage}`);
  ok(pg.s === 302 && pg.loc === `/quran/surah/${n}#page-${c.lastPage}`, `surah ${n} ?page=${c.lastPage} (last page) → 302 — got ${pg.s} ${pg.loc || ''}`);
  const pgBad = await head(`/quran/surah/${n}?page=${c.firstPage - 1}`);
  ok(pgBad.s === 200, `surah ${n} ?page=${c.firstPage - 1} (outside this surah) → NOT redirected (200) — got ${pgBad.s}`);
}
// the ayah ceiling must be per-surah, not a global 112 (Al-Anbiya's count leaking onto everyone else)
const fatiha8 = await head('/quran/surah/1?ayah=8');
ok(fatiha8.s === 200, 'Al-Fatiha ?ayah=8 does NOT redirect — its ceiling is 7, not Al-Anbiya\'s 112 — got ' + fatiha8.s);
const baqara150 = await head('/quran/surah/2?ayah=150');
ok(baqara150.s === 302 && baqara150.loc === '/quran/surah/2#ayah-150', 'Al-Baqara ?ayah=150 → 302 (a global 112 ceiling would have refused it) — got ' + baqara150.s);

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
