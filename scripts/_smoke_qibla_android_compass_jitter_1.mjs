// Smoke — QIBLA-ANDROID-COMPASS-JITTER-STABILIZATION-1
// Proves: (1) the REAL _shortestAngleDiff extracted from js/app.js is correct across
// the 0/360 wrap and never NaN; (2) the smoothing algorithm (deadband + circular EMA
// + rate limit) holds steady under noise, caps per-frame steps, converges, and follows
// the short way across the wrap; (3) structurally, the iOS path is UNCHANGED (raw
// webkitCompassHeading applied immediately), only Android is routed through the
// stabilizer, the Android bearing formula is untouched, NO constant offset (+83/-83/85)
// was added, the Android-only inline `transition:none` exists, and the shared CSS
// `.compass { transition: transform 0.12s linear }` (iOS path) is still present.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const appSrc = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const styleSrc = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

console.log('================ 1. REAL _shortestAngleDiff (extracted from app.js) ================');
const sadMatch = appSrc.match(/function _shortestAngleDiff\(a, b\) \{[\s\S]*?\n\}/);
ok(!!sadMatch, '_shortestAngleDiff present in app.js');
// eval the exact declaration as an anonymous function expression → tests shipped code
const _shortestAngleDiff = eval('(' + sadMatch[0].replace('function _shortestAngleDiff', 'function') + ')');
ok(_shortestAngleDiff(359, 1) === 2, '359→1 = +2 (short way across 0)');
ok(_shortestAngleDiff(1, 359) === -2, '1→359 = -2 (short way, backwards)');
ok(_shortestAngleDiff(350, 10) === 20, '350→10 = +20 (wrap)');
ok(_shortestAngleDiff(10, 350) === -20, '10→350 = -20 (wrap)');
ok(Math.abs(_shortestAngleDiff(0, 180)) === 180, '0↔180 = ±180 (antipodal half-turn; formula returns -180)');
ok(_shortestAngleDiff(0, 181) === -179, '0→181 = -179 (shortest is the other way)');
ok(_shortestAngleDiff(10, 20) === 10, '10→20 = 10');
ok(_shortestAngleDiff(90, 90) === 0, 'same angle = 0');
let badRange = false;
for (let a = 0; a < 360; a += 3) for (let b = 0; b < 360; b += 5) {
  const d = _shortestAngleDiff(a, b);
  if (Number.isNaN(d) || d < -180 || d >= 180) badRange = true;   // formula range is [-180, 180)
}
ok(!badRange, 'over 8600 pairs: never NaN, always in [-180, 180)');

console.log('\n================ 2. Smoothing algorithm behavior ================');
// Faithful re-impl of _androidCompassStabilize/_androidCompassFrame for behavioral proof
// (uses the REAL _shortestAngleDiff above; same constants as app.js).
const DB = 2, SM = 0.15, MS = 10;
function simulate(targets) {
  let sm = null; const out = [];
  for (const raw of targets) {
    const r = (((raw % 360) + 360) % 360);
    if (sm === null) { sm = r; out.push(sm); continue; }
    let diff = _shortestAngleDiff(sm, r), guard = 0;
    while (Math.abs(diff) >= DB && guard < 5000) {
      let step = diff * SM;
      if (step > MS) step = MS; if (step < -MS) step = -MS;
      sm = (((sm + step) % 360) + 360) % 360;
      out.push(sm);
      diff = _shortestAngleDiff(sm, r); guard++;
    }
  }
  return { out, sm };
}
// deadband: a still phone with noise that occasionally exceeds 2° stays in a tight band
const still = simulate([100, 102.5, 98.0, 101.0, 103.0, 99.5, 100.4]);
const spread = Math.max(...still.out) - Math.min(...still.out);
ok(spread <= 3, `deadband + EMA hold steady under noise (rendered spread ${spread.toFixed(2)}° ≤ 3°)`);
// rate limit: a hard 90° jump never moves more than 10° in a single applied frame
const jump = simulate([0, 90]);
let maxStep = 0;
for (let i = 1; i < jump.out.length; i++) maxStep = Math.max(maxStep, Math.abs(_shortestAngleDiff(jump.out[i - 1], jump.out[i])));
ok(maxStep <= 10.0001, `rate limit caps per-frame step ≤10° (max ${maxStep.toFixed(2)}°)`);
ok(Math.abs(_shortestAngleDiff(jump.sm, 90)) < 2, `converges to within 2° of a 90° target (final ${jump.sm.toFixed(2)}°)`);
// wrap: 350 → 10 takes the short way (through 0), converges, never exceeds rate limit
const wrap = simulate([350, 10]);
let wrapMax = 0;
for (let i = 1; i < wrap.out.length; i++) wrapMax = Math.max(wrapMax, Math.abs(_shortestAngleDiff(wrap.out[i - 1], wrap.out[i])));
ok(Math.abs(_shortestAngleDiff(wrap.sm, 10)) < 2 && wrapMax <= 10.0001, `converges across 0/360 wrap (350→10, final ${wrap.sm.toFixed(2)}°, max step ${wrapMax.toFixed(2)}°)`);
ok(jump.out.every(v => !Number.isNaN(v)) && still.out.every(v => !Number.isNaN(v)) && wrap.out.every(v => !Number.isNaN(v)), 'no NaN in any rendered heading');

console.log('\n================ 3. Structural: constants + iOS unchanged + no offset ================');
ok(/_AND_DEADBAND\s*=\s*2\b/.test(appSrc), 'deadband constant = 2°');
ok(/_AND_SMOOTH\s*=\s*0\.15\b/.test(appSrc), 'EMA smooth factor = 0.15');
ok(/_AND_MAX_STEP\s*=\s*10\b/.test(appSrc), 'rate-limit max step = 10°/frame');
// handler branches: iOS reads webkitCompassHeading & applies raw immediately; Android → stabilizer
ok(/_applyCompassHeading\(e\.webkitCompassHeading\)/.test(appSrc), 'iOS still reads + applies webkitCompassHeading (unchanged)');
// QIBLA-ANDROID-HEADING-DIRECTION-INVERSION-FIX-1 moved the alpha→heading mapping into a helper;
// the Android branch still derives heading from e.alpha and feeds the stabilizer (jitter path intact).
ok(/heading = _androidAlphaToHeading\(e\.alpha\);/.test(appSrc), 'Android heading derived from e.alpha (via _androidAlphaToHeading) → stabilizer');
ok(/if \(e\.webkitCompassHeading != null[\s\S]{0,240}?_applyCompassHeading\(e\.webkitCompassHeading\);[\s\S]{0,60}?return;/.test(appSrc), 'iOS branch applies raw heading immediately + returns (ROOT-REBUILD-2 shape)');
ok(/_androidCompassStabilize\((?:_qcApplyCalibration\()?heading\b/.test(appSrc), 'Android branch routes through _androidCompassStabilize (via _qcApplyCalibration since CALIBRATION-1)');
// no constant offset anywhere in the compass region
const regStart = appSrc.indexOf('function _applyCompassHeading');
const regEnd = appSrc.indexOf('function requestCompassPermission');
const region = appSrc.slice(regStart, regEnd);
ok(regStart > 0 && regEnd > regStart, 'compass region located');
// strip comments so the checks inspect executable code only (my own comment says "NO offset")
const codeOnly = region.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
ok(!/\b8[35]\b/.test(codeOnly), 'NO +83/-83/85 constant offset anywhere in the compass code');
// CALIBRATION-1 introduced the per-device `_qcCalibOffset` (a USER-set value, not a hardcoded degree
// offset) — exclude that identifier before asserting no stray "offset" token remains.
const codeNoCalib = codeOnly.replace(/calibOffset/gi, '');
ok(!/offset/i.test(codeNoCalib), 'NO stray "offset" token in the compass CODE (per-device calibOffset excluded)');
// Android disables the CSS transition inline (one-time); iOS keeps the CSS transition
ok(/_c\.style\.transition = 'none'/.test(appSrc), 'Android disables .compass transition inline (Android-only, one-time)');
ok(/_andTransitionCleared/.test(appSrc), 'inline transition-disable is guarded (runs once)');
ok(/\n\.compass \{[\s\S]*?transition: transform 0\.12s linear;/.test(styleSrc), 'CSS .compass { transition: transform 0.12s linear } still present (iOS path untouched)');
// rAF present with a fallback
ok(/const _andRaf = /.test(appSrc) && /requestAnimationFrame\.bind\(window\)/.test(appSrc), 'rAF renderer with binding');
ok(/setTimeout\(cb, 16\)/.test(appSrc), 'rAF fallback (setTimeout ~16ms) present');

console.log(`\nPASS=${pass}  FAIL=${fail}`);
if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
