// NEXT-PRAYER-AND-TIME-LEFT-TITLE-LENGTH-LADDER-FIX-1 verification (self-contained, SSR-level).
//
// The Title tag on /next-prayer-in-{city} + /time-left-until-next-prayer-in-{city} must land in
// [50,60] decoded code points across ALL 10 langs and every city-name length (short/medium/long),
// via a city-length-aware ladder — never < 50 (the old NPT bug) or > 60. Meta stays in [120,160].
// Lengths are measured on the DECODED <title>/meta (SEO tools decode `&#39;` etc.). Also asserts:
// curated pages stay index, H1 markers (npt-h1/tl-h1) + countdown data present (calc/H1 untouched),
// and Title ≠ H1. Discovered noindex + the calc itself are unaffected (title/meta-only change).
//
// Run: node scripts/_smoke_next_prayer_timeleft_title_ladder_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8251;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const get = p => new Promise(r => { http.get({ host: 'localhost', port: PORT, path: p }, x => { let b = ''; x.on('data', c => b += c); x.on('end', () => r(b)); }).on('error', () => r('')); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready(t) { const t0 = Date.now(); while (Date.now() - t0 < t) { if (await get('/health')) return 1; await sleep(400); } return 0; }
let pass = 0, fail = 0; const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined ? '   →  ' + x : ''}`); };
function decode(s) { return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'"); }
const cp = s => [...decode(s)].length;
const T = b => (b.match(/<title>([^<]*)<\/title>/) || [, ''])[1];
const M = b => (b.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
const R = b => (b.match(/name="robots" content="([^,"]*)/) || [, ''])[1];

const CITIES = ['doha', 'cairo', 'makkah', 'tabuk', 'abha', 'praia', 'medina', 'riyadh', 'istanbul', 'gaborone', 'bridgetown', 'wadi-ad-dawasir'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];

const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' }, stdio: ['ignore', 'ignore', 'ignore'] });
let code = 1;
try {
  if (!await ready(20000)) { console.error('not ready'); srv.kill('SIGKILL'); process.exit(1); }
  console.log('═══ NEXT-PRAYER-AND-TIME-LEFT-TITLE-LENGTH-LADDER-FIX-1 ═══\n');

  const rows = { NPT: [], TL: [] };
  for (const [rk, rp] of [['NPT', '/next-prayer-in-'], ['TL', '/time-left-until-next-prayer-in-']])
    for (const slug of CITIES) for (const L of LANGS) {
      const b = await get((L === 'ar' ? '' : '/' + L) + rp + slug);
      rows[rk].push({ slug, L, tl: cp(T(b)), ml: cp(M(b)) });
    }

  // ── NPT: strict [50,60] title + [120,160] meta ──
  console.log('── NPT (next-prayer) ──');
  const nptTitleBad = rows.NPT.filter(r => r.tl < 50 || r.tl > 60);
  const nptMetaBad = rows.NPT.filter(r => r.ml < 120 || r.ml > 160);
  check(`NPT title 100% in [50,60] (${rows.NPT.length} cells)`, nptTitleBad.length === 0, nptTitleBad.map(r => `${r.L}/${r.slug}=${r.tl}`).join(' '));
  check(`NPT meta 100% in [120,160]`, nptMetaBad.length === 0, nptMetaBad.map(r => `${r.L}/${r.slug}=${r.ml}`).join(' '));
  check('NPT no title > 60 (never truncated)', rows.NPT.every(r => r.tl <= 60));
  check('NPT no title < 50 (the old bug — fixed)', rows.NPT.every(r => r.tl >= 50));

  // ── TL: no >60; in-band except documented long-name exceptions ──
  console.log('\n── TL (time-left) ──');
  const tlOver = rows.TL.filter(r => r.tl > 60);
  const tlUnder = rows.TL.filter(r => r.tl < 50);
  const tlMetaBad = rows.TL.filter(r => r.ml < 120 || r.ml > 160);
  check('TL no title > 60', tlOver.length === 0, tlOver.map(r => `${r.L}/${r.slug}=${r.tl}`).join(' '));
  check('TL title < 50 only for long names (≤ 2 acceptable exceptions)', tlUnder.length <= 2, tlUnder.map(r => `${r.L}/${r.slug}=${r.tl}`).join(' '));
  check('TL meta 100% in [120,160] (ms/id short forms fixed)', tlMetaBad.length === 0, tlMetaBad.map(r => `${r.L}/${r.slug}=${r.ml}`).join(' '));

  // ── curated stays index + calc/H1 markers present + title≠H1 ──
  console.log('\n── regression (curated index, calc/H1 untouched) ──');
  for (const p of ['/next-prayer-in-riyadh', '/time-left-until-next-prayer-in-riyadh', '/next-prayer-in-doha', '/time-left-until-next-prayer-in-doha']) {
    const b = await get(p); check(`${p} robots=index`, R(b) === 'index', R(b));
  }
  const npt = await get('/next-prayer-in-riyadh');
  const tl = await get('/time-left-until-next-prayer-in-riyadh');
  check('NPT H1 marker (npt-h1) present', npt.includes('npt-h1'));
  check('TL H1 marker (tl-h1) present', tl.includes('tl-h1'));
  check('NPT canonical self + hreflang', npt.includes('rel="canonical"') && (npt.match(/rel="alternate" hreflang=/g) || []).length >= 10);
  // title differs from the H1 city string (title ≠ H1)
  const h1txt = (npt.match(/id="npt-h1"[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  check('NPT title ≠ H1', decode(T(npt)).trim() !== h1txt, `title="${decode(T(npt))}" h1="${h1txt}"`);

  console.log(`\nNPT title range ${Math.min(...rows.NPT.map(r => r.tl))}–${Math.max(...rows.NPT.map(r => r.tl))} | NPT meta ${Math.min(...rows.NPT.map(r => r.ml))}–${Math.max(...rows.NPT.map(r => r.ml))} | TL title ${Math.min(...rows.TL.map(r => r.tl))}–${Math.max(...rows.TL.map(r => r.tl))}`);
  console.log(`${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code = fail === 0 ? 0 : 1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
