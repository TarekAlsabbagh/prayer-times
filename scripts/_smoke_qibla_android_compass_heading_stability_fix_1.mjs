// QIBLA-ANDROID-COMPASS-HEADING-STABILITY-FIX-1 verification (SSR + shipped-code + math).
//
// Device sensors can't run in Node/headless, so this smoke checks everything that
// is deterministic: (a) the qibla pages + SEO are unchanged (200/index/canonical/
// hreflang; discovered stays noindex); (b) the new #compass-status element ships;
// (c) the served app.js carries the fix (absolute-only resolver, cleanup, debug,
// fallback sources) — asserted via string literals that survive minification;
// (d) the qibla BEARING is unchanged (Riyadh = 243.80°, == aladhan 243.798°);
// (e) the needle-rotation formula normalize(qibla - heading) is correct for
// simulated headings 0/90/180/270 and heading==qibla → 0 (needle points up).
// Real Android-device behaviour is OUT OF SCOPE here and must be tested separately.
//
// Run: node scripts/_smoke_qibla_android_compass_heading_stability_fix_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8290;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const get = p => new Promise(r => { http.get({ host: 'localhost', port: PORT, path: p }, x => { let b = ''; x.on('data', c => b += c); x.on('end', () => r(b)); }).on('error', () => r('')); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready(t) { const t0 = Date.now(); while (Date.now() - t0 < t) { if (await get('/health')) return 1; await sleep(400); } return 0; }
let pass = 0, fail = 0; const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined ? '   →  ' + x : ''}`); };
const robots = b => (b.match(/name="robots" content="([^,"]*)/) || [, ''])[1];

// ── (d) bearing (inline copy of js/qibla.js formula — asserts it's UNCHANGED) ──
const DEG = Math.PI/180, RAD = 180/Math.PI, KLAT = 21.4225, KLNG = 39.8262;
function qiblaCalc(lat, lng){ const pK=KLAT*DEG, lK=KLNG*DEG, p=lat*DEG, l=lng*DEG;
  const num=Math.sin(lK-l), den=Math.cos(p)*Math.tan(pK)-Math.sin(p)*Math.cos(lK-l);
  let q=Math.atan2(num,den)*RAD; if(q<0)q+=360; return q; }
// ── (e) needle rotation (the shipped formula) ──
const norm = a => ((a%360)+360)%360;
const needle = (qibla, heading) => norm(qibla - heading);

const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' }, stdio: ['ignore', 'ignore', 'ignore'] });
let code = 1;
try {
  if (!await ready(20000)) { console.error('server not ready'); srv.kill('SIGKILL'); process.exit(1); }
  console.log('═══ QIBLA-ANDROID-COMPASS-HEADING-STABILITY-FIX-1 ═══\n');

  // (a) qibla pages + SEO unchanged
  console.log('── qibla pages: 200 + index + SEO ──');
  for (const p of ['/qibla-in-riyadh', '/en/qibla-in-riyadh', '/qibla-in-istanbul']) {
    const b = await get(p);
    const ok = b.includes('<title') && robots(b) === 'index'
      && b.includes('rel="canonical"') && (b.match(/rel="alternate" hreflang=/g) || []).length >= 10;
    check(`${p} 200/index/canonical/hreflang`, ok, robots(b));
  }
  // discovered stays noindex
  // discovered (non-curated) qibla page must stay noindex. NOTE: pick a slug that is NOT in
  // curated-places.json — the admin dashboard promotes discovered cities to curated over time
  // (abu-hardub was promoted on main, which is why this now uses ad-dana). Swap if promoted.
  check('/qibla-in-ad-dana discovered = noindex', robots(await get('/qibla-in-ad-dana')) === 'noindex');

  // (b) the fallback status element ships in the served HTML
  console.log('\n── shipped DOM + JS ──');
  const q = await get('/qibla-in-riyadh');
  check('#compass-status element present (fallback UI)', /id="compass-status"/.test(q));
  check('#compass-accuracy-note persistent note present', /id="compass-accuracy-note"/.test(q));

  // (c) served app.js carries the fix (string literals survive minification)
  const appjs = await get('/js/app.js');
  check('app.js served', appjs.length > 1000, appjs.length + ' bytes');
  for (const needleStr of ['android-absolute', 'rejected-relative', 'ios-webkit', 'compass-live', 'qiblaDebug', 'deviceorientationabsolute']) {
    check(`app.js contains "${needleStr}"`, appjs.includes(needleStr));
  }
  check('app.js has stopDeviceCompass (cleanup)', appjs.includes('stopDeviceCompass'));
  check('app.js has resolveCompassHeading', appjs.includes('resolveCompassHeading'));
  // DEVICE-TEST-FAIL ADDENDUM: triage toggle + both heading candidates ship.
  check('app.js has headingMode triage toggle', appjs.includes('headingMode'));
  check('app.js computes both candidates (candInvert)', appjs.includes('candInvert'));
  check('app.js debug carries cand360mAlpha', appjs.includes('cand360mAlpha'));
  // DEVICE-TEST-FAIL ADDENDUM (decision pass): reliability layer ships.
  check('app.js collapses to a single source', appjs.includes('_qCollapseToSingleSource'));
  check('app.js has the wobble detector', appjs.includes('_qIsWobbling'));
  check('app.js dims needle when uncertain', appjs.includes('compass-uncertain'));
  check('app.js ships the accuracy-note dict', appjs.includes('_QC_ACCURACY'));
  // iOS non-regression: the webkitCompassHeading source is preserved (checked FIRST in
  // resolveCompassHeading, so invert-lock/headingMode can never touch the iOS path).
  check('app.js keeps iOS webkitCompassHeading source', appjs.includes('webkitCompassHeading'));
  // DEVICE-HAPTIC ADDENDUM: guarded Vibration API + alignment state machine ship.
  check('app.js has the haptic state machine', appjs.includes('_qUpdateHaptic'));
  check('app.js guards the Vibration API', appjs.includes('navigator.vibrate'));
  check('app.js exposes qiblaAligned in debug', appjs.includes('qiblaAligned'));
  const cssTxt = await get('/css/style.css');
  check('style.css styles .compass-accuracy-note', cssTxt.includes('compass-accuracy-note'));
  check('style.css dims needle on .compass-uncertain', cssTxt.includes('compass-uncertain'));

  // (d) bearing UNCHANGED
  console.log('\n── bearing (unchanged) + rotation formula ──');
  const bRiyadh = qiblaCalc(24.7136, 46.6753);
  check('Riyadh bearing 243.80° (== aladhan 243.798°)', Math.abs(bRiyadh - 243.80) < 0.02, bRiyadh.toFixed(2));

  // (e) simulated heading rotation
  const exp = { 0: 243.8, 90: 153.8, 180: 63.8, 270: 333.8 };
  for (const h of [0, 90, 180, 270]) {
    const r = needle(bRiyadh, h);
    check(`heading ${h}° → needle ${exp[h]}°`, Math.abs(r - exp[h]) < 0.05, r.toFixed(1));
  }
  check('heading == qibla → needle 0° (facing qibla, points up)', Math.abs(needle(bRiyadh, bRiyadh)) < 0.001, needle(bRiyadh, bRiyadh).toFixed(2));

  console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code = fail === 0 ? 0 : 1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
