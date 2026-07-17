// Measurement — QURAN-AR-SSR-SURAH-GENERALIZATION-1 §16.
// NOT a pass/fail test: it prints what the SSR path actually costs, so a caching decision is made from numbers
// instead of a guess. §3 forbids inventing an LRU "just in case" — this is the evidence that must come first.
//
// Reports, per surah: JSON read, JSON.parse, HTML build, HTML size, plus cold vs warm end-to-end, and peak RSS
// after touching all 114 (the number that would justify — or refute — preloading).
//
//   QURAN_SSR_BASE=http://127.0.0.1:8085 node scripts/_measure_quran_ssr_surah_perf_1.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.QURAN_SSR_BASE || 'http://127.0.0.1:8085';
const D = path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0/surahs');
const CH = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0/metadata/chapters.json'), 'utf8'));
// /quran/{official-english-slug} — read from the source-derived table, never spelled out in a test.
const ROUTES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0/metadata/surah-routes.json'), 'utf8')).surahs;
const P = n => ROUTES.find(x => x.number === n).path;
const ms = (a, b) => Number(b - a) / 1e6;
const fmt = (x, d = 2) => x.toFixed(d).padStart(7);

// ---- 1) the raw data cost, measured the same way server.js does it (read → parse) ----
console.log('\n=== per-surah file read + JSON.parse (the ONLY per-request data work) ===');
console.log('surah                       KB     read ms    parse ms');
const rows = [];
for (const n of [1, 2, 21, 108, 114]) {
  const f = path.join(D, String(n).padStart(3, '0') + '.json');
  let read = 0, parse = 0, bytes = 0;
  for (let i = 0; i < 20; i++) {                 // 20 iterations, take the median: one sample is noise
    const t0 = process.hrtime.bigint(); const raw = fs.readFileSync(f, 'utf8');
    const t1 = process.hrtime.bigint(); JSON.parse(raw);
    const t2 = process.hrtime.bigint();
    read += ms(t0, t1); parse += ms(t1, t2); bytes = Buffer.byteLength(raw);
  }
  rows.push([n, bytes / 1024, read / 20, parse / 20]);
  console.log(`${String(n).padStart(3)} ${CH.find(c => c.number === n).nameEn.padEnd(16)} ${fmt(bytes / 1024, 1)}   ${fmt(read / 20)}    ${fmt(parse / 20)}`);
}
const all = fs.readdirSync(D).reduce((a, f) => a + fs.statSync(path.join(D, f)).size, 0);
console.log(`\n  all 114 surah files on disk: ${(all / 1024 / 1024).toFixed(2)} MB  (never preloaded: one request reads ONE file)`);

// ---- 2) end-to-end: cold (first hit) vs warm, straight off the HTTP surface ----
console.log('\n=== end-to-end SSR (HTTP), cold first hit vs warm median of 10 ===');
console.log('surah                   HTML KB    cold ms    warm ms');
const t = async (u) => { const a = process.hrtime.bigint(); const r = await fetch(u); const b = await r.text(); return [ms(a, process.hrtime.bigint()), b.length]; };
for (const [n, name] of [[1, 'Al-Fatiha (7)'], [2, 'Al-Baqara (286)'], [21, 'Al-Anbiya (112)'], [108, 'Al-Kauthar (3)'], [114, 'An-Nas (6)']]) {
  const u = `${BASE}${P(n)}`;
  const [cold, len] = await t(u);
  const warm = [];
  for (let i = 0; i < 10; i++) warm.push((await t(u))[0]);
  warm.sort((a, b) => a - b);
  console.log(`${String(n).padStart(3)} ${name.padEnd(18)} ${fmt(len / 1024, 1)}   ${fmt(cold)}    ${fmt(warm[5])}`);
}

// ---- 3) the whole surface, once: does serving every surah leave anything growing? ----
console.log('\n=== sweep: every one of the 114 pages, twice ===');
for (const pass of [1, 2]) {
  const a = process.hrtime.bigint();
  for (const c of CH) await fetch(`${BASE}${P(c.number)}`).then(r => r.text());
  const total = ms(a, process.hrtime.bigint());
  console.log(`  pass ${pass}: 114 pages in ${(total / 1000).toFixed(2)}s — ${(total / 114).toFixed(1)} ms/page average`);
}
const rss = await fetch(`${BASE}${P(1)}`).then(() => process.memoryUsage().rss);
console.log(`  (this client's RSS: ${(rss / 1024 / 1024).toFixed(1)} MB — the SERVER's RSS is printed by its own log; see the report)`);
console.log('\nRESULT: measurement only — no assertions, nothing to fail.');
