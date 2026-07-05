// PRAYER-TR-DIYANET-TEMKIN-1 verification (self-contained, engine + SSR).
//
// The 'Turkey' calc method must apply Diyanet's fixed temkin/ihtiyat as an
// `adj` — sunrise -7, dhuhr +5, asr +4, maghrib +7 — while leaving fajr/isha
// exactly on the raw 18°/17° angles (they already match Diyanet). This brings
// Turkish-city prayer times to ~0-1 min of the OFFICIAL Diyanet source across
// seasons (asr carries a documented ±1-2 min seasonal drift). The change is
// isolated to the Turkey method: no other method gains/loses an `adj`, so all
// non-Turkey countries are byte-for-byte unaffected. SSR uses the SAME engine
// file (server.js require('./js/prayer-times.js')) so SSR == client.
//
// Run: node scripts/_smoke_prayer_tr_diyanet_temkin_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const PORT = 8288;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const PT = require(path.join(ROOT, 'js', 'prayer-times.js'));

const get = p => new Promise(r => { http.get({ host: 'localhost', port: PORT, path: p }, x => { let b = ''; x.on('data', c => b += c); x.on('end', () => r(b)); }).on('error', () => r('')); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready(t) { const t0 = Date.now(); while (Date.now() - t0 < t) { if (await get('/health')) return 1; await sleep(400); } return 0; }
let pass = 0, fail = 0; const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined ? '   →  ' + x : ''}`); };

const KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const toMin = hm => { const m = /^(\d{1,2}):(\d{2})$/.exec(hm); return m ? +m[1] * 60 + +m[2] : NaN; };
const cell = (b, id) => { const m = new RegExp(`id="time-${id}"[^>]*>\\s*([0-9]{2}:[0-9]{2})`).exec(b); return m ? m[1] : null; };
// TR cities: [slug, lat, lng] — tz Europe/Istanbul = +3 (no DST)
const TR = [['istanbul', 41.0082, 28.9784], ['ankara', 39.9334, 32.8597], ['izmir', 38.4192, 27.1287], ['bursa', 40.1885, 29.061], ['konya', 37.8714, 32.4847]];
function engine(method, lat, lng, tz, asr = 'Shafi') { PT.setMethod(method); PT.setAsrMethod(asr); PT.setTimeFormat('24h'); const t = PT.getTimes(new Date(), lat, lng, tz); return KEYS.map(k => t[k]); }

console.log('═══ PRAYER-TR-DIYANET-TEMKIN-1 ═══\n');

// ── Part A: engine-level (deterministic, no server) ──
console.log('── A. engine: temkin adj + fajr/isha unchanged + isolation ──');
const adj = PT.methods.Turkey.adj || {};
check('Turkey.adj = {sunrise:-7,dhuhr:5,asr:4,maghrib:7}',
  adj.sunrise === -7 && adj.dhuhr === 5 && adj.asr === 4 && adj.maghrib === 7 && adj.fajr === undefined && adj.isha === undefined,
  JSON.stringify(adj));
check('Turkey angles still fajr 18 / isha 17', PT.methods.Turkey.fajr === 18 && PT.methods.Turkey.isha === 17);

// For each TR city (today): Turkey vs MWL — fajr/isha identical, temkin pattern on the rest.
for (const [slug, lat, lng] of TR) {
  const tk = engine('Turkey', lat, lng, 3);
  const mwl = engine('MWL', lat, lng, 3);
  const d = KEYS.map((k, i) => toMin(tk[i]) - toMin(mwl[i]));   // Turkey − MWL
  const [dF, dSr, dD, dA, dM, dI] = d;
  check(`${slug}: fajr & isha UNCHANGED vs MWL (diff 0)`, dF === 0 && dI === 0, `fajr${dF} isha${dI}`);
  check(`${slug}: temkin sunrise≈-7 dhuhr≈+5 asr≈+4 maghrib≈+7`,
    Math.abs(dSr + 7) <= 1 && Math.abs(dD - 5) <= 1 && Math.abs(dA - 4) <= 1 && Math.abs(dM - 7) <= 1,
    `sr${dSr} d${dD} a${dA} m${dM}`);
}

// Isolation: no OTHER method gained an adj; JAKIM/Morocco keep their pre-existing ihtiyat.
const NO_ADJ = ['MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi', 'Tehran', 'Jafari', 'Gulf', 'Kuwait', 'Qatar', 'Singapore', 'France', 'Russia', 'KemenagJakarta'];
check('non-Turkey methods have NO adj (unaffected)', NO_ADJ.every(m => !PT.methods[m] || PT.methods[m].adj === undefined),
  NO_ADJ.filter(m => PT.methods[m] && PT.methods[m].adj).join(',') || 'none');
check('JAKIM ihtiyat unchanged (fajr 10)', PT.methods.JAKIM.adj && PT.methods.JAKIM.adj.fajr === 10);
check('MoroccoAwqaf ihtiyat unchanged (fajr -6)', PT.methods.MoroccoAwqaf.adj && PT.methods.MoroccoAwqaf.adj.fajr === -6);

// ── Part B: SSR (boot server) — SSR applies adj + SSR==engine; non-TR regression ──
const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' }, stdio: ['ignore', 'ignore', 'ignore'] });
let code = 1;
try {
  if (!await ready(20000)) { console.error('server not ready'); srv.kill('SIGKILL'); process.exit(1); }
  console.log('\n── B. SSR: served TR times == engine Turkey+adj (SSR≡client) ──');
  for (const [slug, lat, lng] of TR) {
    const b = await get('/prayer-times-in-' + slug);
    const ssr = KEYS.map(k => cell(b, k));
    const eng = engine('Turkey', lat, lng, 3);
    const match = KEYS.every((k, i) => ssr[i] === eng[i]);
    check(`SSR /prayer-times-in-${slug} == engine Turkey+adj`, match, `ssr=${ssr.join(' ')} eng=${eng.join(' ')}`);
  }
  // temkin is visible in SSR: Istanbul SSR sunrise is ~7 earlier than raw MWL sunrise
  const bi = await get('/prayer-times-in-istanbul');
  const ssrSr = cell(bi, 'sunrise'), mwlSr = engine('MWL', 41.0082, 28.9784, 3)[1];
  check('SSR Istanbul sunrise shows temkin (~7 min earlier than raw)', Math.abs((toMin(mwlSr) - toMin(ssrSr)) - 7) <= 1, `mwl=${mwlSr} ssr=${ssrSr}`);

  console.log('\n── B. regression: non-Turkey cities render valid times + index ──');
  for (const p of ['/prayer-times-in-riyadh', '/prayer-times-in-cairo', '/prayer-times-in-doha']) {
    const b = await get(p);
    const ok = KEYS.every(k => /^\d{2}:\d{2}$/.test(cell(b, k) || ''));
    const robots = (b.match(/name="robots" content="([^,"]*)/) || [, ''])[1];
    check(`${p} valid times + index`, ok && robots === 'index', robots);
  }
  // TR city stays index
  check('/prayer-times-in-istanbul robots=index', ((await get('/prayer-times-in-istanbul')).match(/name="robots" content="([^,"]*)/) || [, ''])[1] === 'index');
  // next-prayer + time-left for Istanbul load (share _ssrPrayerTimesFor → same instants)
  for (const p of ['/next-prayer-in-istanbul', '/time-left-until-next-prayer-in-istanbul']) {
    const b = await get(p);
    check(`${p} loads (200/index, shared engine)`, b.includes('<title') && (b.match(/name="robots" content="([^,"]*)/) || [, ''])[1] === 'index');
  }

  console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code = fail === 0 ? 0 : 1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
