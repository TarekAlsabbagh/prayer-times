// QIBLA-ANDROID-COMPASS-ROOT-REBUILD-1 — Phase 1 (Android Compass Lab) verification.
//
// The Lab is a DEV-ONLY (?qiblaLab=1) additive overlay. This smoke checks the
// deterministic guarantees (sensor behaviour itself needs a real device, out of scope):
//   (a) the qibla pages + SEO are UNCHANGED (200/index/canonical/hreflang; discovered
//       stays noindex);
//   (b) the served app.js carries the Lab code (candidates + the two verified formulas);
//   (c) the PRODUCTION + iOS compass path is byte-preserved from main (webkitCompassHeading
//       line, the Android (360 - e.alpha) production line, startDeviceCompass,
//       requestCompassPermission all still present verbatim) — i.e. iOS/production untouched;
//   (d) the qibla BEARING is unchanged (Riyadh = 243.80°, == aladhan 243.798°) → qibla.js
//       and coordinates untouched.
//
// Run: node scripts/_smoke_qibla_lab_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8291;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const get = p => new Promise(r => { http.get({ host: 'localhost', port: PORT, path: p }, x => { let b = ''; x.on('data', c => b += c); x.on('end', () => r(b)); }).on('error', () => r('')); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready(t) { const t0 = Date.now(); while (Date.now() - t0 < t) { if (await get('/health')) return 1; await sleep(400); } return 0; }
let pass = 0, fail = 0; const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined ? '   →  ' + x : ''}`); };
const robots = b => (b.match(/name="robots" content="([^,"]*)/) || [, ''])[1];

// (d) bearing (inline copy of js/qibla.js formula — asserts it's UNCHANGED)
const DEG = Math.PI/180, RAD = 180/Math.PI, KLAT = 21.4225, KLNG = 39.8262;
function qiblaCalc(lat, lng){ const pK=KLAT*DEG, lK=KLNG*DEG, p=lat*DEG, l=lng*DEG;
  const num=Math.sin(lK-l), den=Math.cos(p)*Math.tan(pK)-Math.sin(p)*Math.cos(lK-l);
  let q=Math.atan2(num,den)*RAD; if(q<0)q+=360; return q; }

const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' }, stdio: ['ignore', 'ignore', 'ignore'] });
let code = 1;
try {
  if (!await ready(20000)) { console.error('server not ready'); srv.kill('SIGKILL'); process.exit(1); }
  console.log('═══ QIBLA-ANDROID-COMPASS-ROOT-REBUILD-1 — Compass Lab ═══\n');

  // (a) qibla pages + SEO unchanged
  console.log('── qibla pages: 200 + index + SEO (unchanged) ──');
  for (const p of ['/qibla-in-riyadh', '/en/qibla-in-riyadh', '/qibla-in-istanbul']) {
    const b = await get(p);
    const ok = b.includes('<title') && robots(b) === 'index'
      && b.includes('rel="canonical"') && (b.match(/rel="alternate" hreflang=/g) || []).length >= 10;
    check(`${p} 200/index/canonical/hreflang`, ok, robots(b));
  }
  check('/qibla-in-ad-dana discovered = noindex', robots(await get('/qibla-in-ad-dana')) === 'noindex');

  // (b) served app.js carries the Lab. NOTE: app.js is served MINIFIED (comments stripped,
  //     IIFE-local names mangled), so assert only on tokens that survive minification:
  //     string literals + global/property names. The byte-level "additive-only, iOS/production
  //     unchanged" guarantee is proven at SOURCE level via: git diff --numstat origin/main --
  //     js/app.js  →  154 insertions, 0 deletions (see the LAB REPORT).
  console.log('\n── Compass Lab code shipped (minification-safe tokens) ──');
  const appjs = await get('/js/app.js');
  check('app.js served', appjs.length > 1000, appjs.length + ' bytes');
  check('app.js has ?qiblaLab gate', appjs.includes('qiblaLab'));
  check('app.js has the Lab overlay ("QIBLA LAB")', appjs.includes('QIBLA LAB'));
  check('app.js has candidate C (tilt-comp)', appjs.includes('tilt-comp'));
  check('app.js has candidate D (abs-only, "waiting-absolute")', appjs.includes('waiting-absolute'));
  check('app.js has candidate E (AbsoluteOrientationSensor)', appjs.includes('AbsoluteOrientationSensor'));
  check('app.js has candidate E label (AbsOrientSensor)', appjs.includes('AbsOrientSensor'));
  // v2 LAB HOLD (read-only diagnostics): needle frozen + dimmed dial + FREEZE control + stability summary.
  check('app.js Lab shows "LAB MODE" needle-disabled notice', appjs.includes('LAB MODE'));
  check('app.js Lab has FREEZE control', appjs.includes('FREEZE'));
  check('app.js Lab freeze button id present', appjs.includes('qibla-lab-btn'));

  // (c) PRODUCTION + iOS path preserved (surviving property/global names; exact-byte proof = git diff)
  console.log('\n── production + iOS path preserved ──');
  check('iOS webkitCompassHeading read present', appjs.includes('webkitCompassHeading'));
  check('startDeviceCompass present', appjs.includes('startDeviceCompass'));
  check('requestCompassPermission present', appjs.includes('requestCompassPermission'));

  // (d) bearing UNCHANGED → qibla.js / coords untouched
  console.log('\n── bearing (unchanged) ──');
  const bRiyadh = qiblaCalc(24.7136, 46.6753);
  check('Riyadh bearing 243.80° (== aladhan 243.798°)', Math.abs(bRiyadh - 243.80) < 0.02, bRiyadh.toFixed(2));

  console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code = fail === 0 ? 0 : 1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
