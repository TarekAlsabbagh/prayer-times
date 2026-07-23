// Smoke — QURAN-TANZIL-ORPHANED-SMOKES-AND-COMPLETE-LIGHTHOUSE-CLOSURE-1 §5: SOURCE-DERIVED ROUTES (Tanzil).
//
// Retargeted from the KFGQPC ZIP + build_surah_routes.mjs (whose top-level die() aborted the import when the
// external UthmanicHafs ZIP was absent — that was the Skip) to the Tanzil model, whose inputs are all committed.
// Every public Quran URL traces to two tracked files: vendor/surah-slugs.json (the frozen slug/URL contract)
// and metadata/chapters.json (the source names). This asserts the whole chain — the 114 slugs are exactly the
// committed contract, all distinct, none reserved, none carrying a digit; the names agree with chapters.json;
// the provenance names Tanzil; and, live against the running server, all 114 routes return 200 with the right
// H1, a self-canonical, and noindex.
//
// The data half needs no server. The runtime half fetches over HTTP (SSR) — base = QURAN_SSR_BASE /
// QURAN_SMOKE_URL (default http://127.0.0.1:8085). There is no external source dir and nothing to skip.
//
//   QURAN_SSR_BASE=http://localhost:8080 node scripts/_smoke_quran_surah_routes_source_names_1.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data/quran/tanzil-uthmani-1-1');
const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://127.0.0.1:8085';
const ROUTES = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata/surah-routes.json'), 'utf8'));
const R = ROUTES.surahs;
const CH = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata/chapters.json'), 'utf8'));
const SLUGS = JSON.parse(fs.readFileSync(path.join(BASE, 'vendor/surah-slugs.json'), 'utf8')).surahs;
// The reserved first-segment words a surah slug may never collide with (the fixed /quran/* namespace).
const RESERVED = ['quran', 'search', 'juz', 'page', 'bookmarks', 'settings', 'surah', 'source', 'index'];
const clean = (s) => String(s).replace(/[ً-ٰٓـ]/g, '');   // same strip set server uses for display
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));

console.log('\n--- 1) every slug IS the committed URL contract — no per-entry hand edit ---');
const slugBy = new Map(SLUGS.map(s => [s.number, s.slug]));
const drift = R.filter(r => r.slug !== slugBy.get(r.number));
ok(drift.length === 0, 'all 114 slugs equal vendor/surah-slugs.json exactly' + (drift.length ? ' — ' + JSON.stringify(drift.slice(0, 4).map(r => r.number)) : ''));

console.log('\n--- 2) the slugs themselves ---');
ok(new Set(R.map(r => r.slug)).size === 114, '114 DISTINCT slugs — no two surahs share a URL');
ok(!R.some(r => RESERVED.includes(r.slug)), 'no slug collides with a reserved Quran path (' + RESERVED.join(', ') + ')');
ok(!R.some(r => /\d/.test(r.slug)), 'NO slug contains a digit — the surah number never appears in the URL');
ok(R.every(r => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug)), 'every slug matches ^[a-z0-9]+(?:-[a-z0-9]+)*$');
ok(R.every(r => r.path === '/quran/' + r.slug), 'every path is exactly /quran/{slug} — one pattern, no variants');
ok(R.every(r => r.dataFile === String(r.number).padStart(3, '0') + '.json'), 'every record names its own NNN.json data file');
ok(R.every(r => fs.existsSync(path.join(BASE, 'surahs', r.dataFile))), 'every named data file exists on disk');

console.log('\n--- 3) the manifest agrees with chapters.json, name for name ---');
const chBy = new Map(CH.map(c => [c.number, c]));
const nameMismatch = R.filter(r => { const c = chBy.get(r.number); return !c || c.nameAr !== r.nameArSource || c.nameEn !== r.nameEnSource; });
ok(nameMismatch.length === 0, 'all 114 nameArSource/nameEnSource match chapters.json exactly' + (nameMismatch.length ? ' — ' + JSON.stringify(nameMismatch.slice(0, 3).map(r => r.number)) : ''));
ok(R.length === 114 && CH.length === 114, `both carry 114 records — routes=${R.length}, chapters=${CH.length}`);
ok(R.every((r, i) => r.number === i + 1), 'the manifest is sorted 1..114 with no gap and no repeat');

console.log('\n--- 4) provenance names the Tanzil source, not KFGQPC ---');
ok(ROUTES.source === 'Tanzil Uthmani 1.1', `source is «${ROUTES.source}»`);
ok(/tanzil\.net/.test(ROUTES.sourceUrl || ''), 'sourceUrl points at tanzil.net');
ok(/Creative Commons Attribution 3\.0|CC BY 3\.0/i.test(ROUTES.licenseName || '') && /creativecommons\.org\/licenses\/by\/3\.0/.test(ROUTES.licenseUrl || ''), 'licence is CC BY 3.0 with the official URL');
ok(!('sourceArchive' in ROUTES) && !('sourceFields' in ROUTES), 'the KFGQPC-only sourceArchive / sourceFields keys are gone');
ok(!/KFGQPC|UthmanicHafs|King Fahd/i.test(JSON.stringify(ROUTES)), 'no KFGQPC / UthmanicHafs / King-Fahd provenance remains');

console.log('\n--- 5) live: all 114 routes → 200, right H1, self-canonical, index,follow (PUBLIC) ---');
{
  let status = 0, h1 = 0, canon = 0, indexable = 0; const problems = [];
  for (const r of R) {
    const res = await fetch(B + r.path);
    if (res.status === 200) status++; else { if (problems.length < 5) problems.push(`${r.path} → ${res.status}`); continue; }
    const html = await res.text();
    const H1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1].replace(/<[^>]+>/g, '').trim();
    const want = 'سورة ' + clean(chBy.get(r.number).nameAr);
    if (H1.includes(want)) h1++; else if (problems.length < 5) problems.push(`${r.path} H1 «${H1}» lacks «${want}»`);
    const canonical = (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/) || [, ''])[1];
    if (canonical === B + r.path) canon++; else if (problems.length < 5) problems.push(`${r.path} canonical «${canonical}»`);
    const robots = (html.match(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/) || [, ''])[1];
    if (/\bindex,follow\b/.test(robots) && !/\bnoindex\b/.test(robots)) indexable++; else if (problems.length < 5) problems.push(`${r.path} robots «${robots}» not index,follow`);
  }
  ok(status === 114, `114/114 routes → HTTP 200 — ${status}`);
  ok(h1 === 114, `114/114 carry the correct «سورة {name}» H1 — ${h1}`);
  ok(canon === 114, `114/114 self-canonical to ${B}/quran/{slug} — ${canon}`);
  ok(indexable === 114, `114/114 carry an index,follow robots directive (PUBLIC) — ${indexable}`);
  ok(problems.length === 0, `no route deviates — ${problems.join(' ;; ') || 'none'}`);
}

console.log(`\nRESULT surah_routes_source_names(Tanzil): ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
