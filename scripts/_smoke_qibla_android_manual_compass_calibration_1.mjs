// Smoke — QIBLA-ANDROID-MANUAL-COMPASS-CALIBRATION-1
// The on-device AOS-priority capture showed source=aos but a STABLE per-device magnetometer bias (~+160°).
// This adds an optional, Android-only, USER-INITIATED "set North" that stores a per-device offset in
// localStorage (NO global hardcoded offset). Tests extract the REAL functions and exercise the user's
// N/W/S/E cases + save/load/reset + no-NaN + wrap, plus structural guards (Android-only, iOS untouched,
// applied before the stabilizer, debug shows it, no +160/-160, no Compass Lab, cache-busters).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const appSrc  = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const cssSrc  = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
const swSrc   = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }
const near = (a, b, tol) => (typeof a === 'number') && Math.abs((((a - b) % 360) + 540) % 360 - 180) <= (tol == null ? 0.3 : tol);

console.log('================ 1. Real calibration functions (extracted + exercised) ================');
const flag  = appSrc.match(/const _ANDROID_MANUAL_CALIB = true;/);
const key   = appSrc.match(/const _QC_CALIB_KEY = '[^']+';/);
const norm  = appSrc.match(/const _qcNorm360 = \(x\) => .*/);
const apply = appSrc.match(/function _qcApplyCalibration\(h\) \{[\s\S]*?\n\}/);
const load  = appSrc.match(/function _qcLoadCalib\(\) \{[\s\S]*?\n\}/);
const setN  = appSrc.match(/function qiblaSetNorth\(\) \{[\s\S]*?\n\}/);
const reset = appSrc.match(/function qiblaResetCalibration\(\) \{[\s\S]*?\n\}/);
ok(!!flag && !!key && !!norm && !!apply && !!load && !!setN && !!reset,
   'extracted flag + _QC_CALIB_KEY + _qcNorm360 + _qcApplyCalibration + _qcLoadCalib + qiblaSetNorth + qiblaResetCalibration');

const S = new Function(`
  ${flag[0]}
  ${key[0]}
  let _qcCalibOffset = null, _qcLastRawHeading = null, _andHeadingSmoothed = 1, _andHeadingTarget = 1;
  const _store = new Map();
  const localStorage = { getItem:k=>_store.has(k)?_store.get(k):null, setItem:(k,v)=>_store.set(k,String(v)), removeItem:k=>_store.delete(k) };
  const window = { localStorage };
  function _qcCalibCardUpdate() {}
  ${norm[0]}
  ${apply[0]}
  ${load[0]}
  ${setN[0]}
  ${reset[0]}
  return {
    apply: _qcApplyCalibration, setNorth: qiblaSetNorth, reset: qiblaResetCalibration, load: _qcLoadCalib,
    setRaw: (v)=>{ _qcLastRawHeading = v; }, getOffset: ()=> _qcCalibOffset,
    setStore: (v)=> localStorage.setItem('${'qiblaCalibOffset'}', v), getStore: ()=> localStorage.getItem('qiblaCalibOffset'), setCalib: (v)=>{ _qcCalibOffset = v; }
  };
`)();

// The user's on-device capture: at true North the raw (AOS) heading read 157.5 → "Set North" stores -157.5.
S.setRaw(157.5); S.setNorth();
ok(near(S.getOffset(), 202.5), 'Set North: raw 157.5 → stored offset normalize(0-157.5)=202.5');
ok(S.getStore() === String(S.getOffset()), 'offset persisted to localStorage on Set North');
// After that single calibration, the user's four cardinals map to (near) truth:
ok(near(S.apply(157.5), 0),     'North: raw 157.5 → calibrated 0');
ok(near(S.apply(69.4),  271.9), 'West:  raw 69.4  → calibrated ≈271.9');
ok(near(S.apply(342.7), 185.2), 'South: raw 342.7 → calibrated ≈185.2');
ok(near(S.apply(252.4), 94.9),  'East:  raw 252.4 → calibrated ≈94.9');
// wrap stays in [0,360)
const w = S.apply(300); ok(w >= 0 && w < 360 && near(w, 142.5), 'wrap: raw 300 + offset 202.5 → 142.5 (in range)');
// NaN / null inputs are safe no-ops (never crash, never produce a bogus number)
ok(Number.isNaN(S.apply(NaN)), 'NaN raw → returns NaN (guarded, no crash)');
ok(S.apply(null) === null, 'null raw → returns null (guarded)');

console.log('\n================ 2. Save / load / reset round-trip ================');
S.reset();
ok(S.getOffset() === null && S.getStore() === null, 'reset: offset cleared + localStorage removed');
ok(near(S.apply(157.5), 157.5), 'after reset: apply is a no-op (raw passes through unchanged)');
S.setStore('202.5'); S.setCalib(null); S.load();
ok(near(S.getOffset(), 202.5), 'load: reads a saved offset from localStorage on init');
S.setRaw(null); S.reset(); S.setRaw(null); S.setNorth();
ok(S.getOffset() === null, 'Set North with no raw heading yet → no-op (offset stays null)');

console.log('\n================ 3. Applied BEFORE the stabilizer, on BOTH Android sources ================');
ok(/_qcLastRawHeading = h;[\s\S]{0,240}?_androidCompassStabilize\(_qcApplyCalibration\(h\)\)/.test(appSrc),
   'AOS path: capture raw h, then stabilize the CALIBRATED heading');
ok(/_qcLastRawHeading = heading;[\s\S]{0,240}?_androidCompassStabilize\(_qcApplyCalibration\(heading\)\)/.test(appSrc),
   'DeviceOrientation fallback: capture raw heading, then stabilize the CALIBRATED heading');

console.log('\n================ 4. Android-only (reveal on first real heading) + iOS untouched ================');
const sdc = appSrc.slice(appSrc.indexOf('function startDeviceCompass()'), appSrc.indexOf('function requestCompassPermission'));
ok(/if \(_ANDROID_MANUAL_CALIB\)/.test(sdc) && /_isIOSPermCal = \(typeof DeviceOrientationEvent\.requestPermission/.test(sdc) && /if \(!_isIOSPermCal\)/.test(sdc),
   'saved offset loaded ONLY on Android (guarded by !requestPermission)');
ok(/_qcLoadCalib\(\)/.test(sdc), 'startDeviceCompass PRE-LOADS any saved offset on Android');
ok(!/_cc\.hidden = false|qibla-calib'\)[^;]*hidden = false/.test(sdc),
   'startDeviceCompass does NOT eagerly reveal the card (no desktop leak — reveal is heading-gated)');
// reveal is lazy: only when a REAL heading fires (both call sites are AFTER the iOS early-return)
ok(/function _qcRevealCalibCard\(\) \{[\s\S]*?_qcCalibCardShown = true;[\s\S]*?c\.hidden = false;[\s\S]*?\}/.test(appSrc),
   '_qcRevealCalibCard is idempotent (_qcCalibCardShown once) and reveals the card');
ok((appSrc.match(/_qcRevealCalibCard\(\);/g) || []).length >= 2, '_qcRevealCalibCard() called on BOTH Android heading paths (AOS + fallback)');
ok(/function _qcRevealCalibCard\(\) \{\s*if \(!_ANDROID_MANUAL_CALIB \|\| _qcCalibCardShown\) return;/.test(appSrc),
   '_qcRevealCalibCard guarded by flag + once-only (never on iOS/desktop)');
ok(/_applyCompassHeading\(e\.webkitCompassHeading\);/.test(appSrc), 'iOS applies webkitCompassHeading raw (unchanged)');
ok(appSrc.indexOf('e.webkitCompassHeading != null') < appSrc.indexOf('if (_qcAosUsable())'), 'iOS branch returns before ANY Android/calibration logic');
// In the DeviceOrientation handler (the only path iOS enters), the iOS apply+return precedes the fallback
// reveal. The AOS reveal lives in _qcStartAos, which iOS never starts (gated by !requestPermission).
const _H = appSrc.slice(appSrc.indexOf('_orientationHandler = function(e) {'), appSrc.indexOf('// Always attach listeners'));
ok(_H.indexOf('_applyCompassHeading(e.webkitCompassHeading)') < _H.indexOf('_qcRevealCalibCard();'),
   'orientation handler: iOS applies + returns BEFORE the fallback card-reveal');
ok(/function _qcStartAos\(\)[\s\S]*?_qcRevealCalibCard\(\);[\s\S]*?\n\}/.test(appSrc),
   'the AOS reveal call lives inside _qcStartAos (a path iOS never starts)');

console.log('\n================ 5. No global offset / no fake / debug shows it ================');
// strip comments first — the flag comment legitimately DOCUMENTS the "~+160°" device bias it fixes
const calibRegion = appSrc.slice(appSrc.indexOf('QIBLA-ANDROID-MANUAL-COMPASS-CALIBRATION-1'), appSrc.indexOf('function _qcScreenAngle'))
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^:])\/\/[^\n]*/g, '$1');
ok(!/[+\-]\s*160\b|[+\-]\s*83\b|[+\-]\s*85\b/.test(calibRegion), 'NO hardcoded +160/-160/+83/85 global offset in the calibration CODE (comments stripped)');
ok(/_qcCalibOffset === null/.test(apply[0]), '_qcApplyCalibration is a no-op when uncalibrated (offset null) — no global offset');
const updBody = appSrc.slice(appSrc.indexOf('function _qcDebugUpdate(e) {'), appSrc.indexOf('function qiblaDebugSnapshot()'));
ok(/rawHeading:/.test(updBody) && /calibOffset:/.test(updBody) && /calibrated:/.test(updBody), 'debug panel shows raw / calibOffset / calibrated');
const appCode = appSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^:])\/\/[^\n]*/g, '$1');
ok(!/qiblaLab(?!el)/.test(appCode) && !/Compass Lab/.test(appCode), 'NO visible Compass Lab / ?qiblaLab (code)');
ok(/_qiblaAngle = Qibla\.calculate\(currentLat, currentLng\);/.test(appSrc), 'Qibla bearing calc UNCHANGED');
ok(/window\.qiblaSetNorth = qiblaSetNorth/.test(appSrc) && /window\.qiblaResetCalibration = qiblaResetCalibration/.test(appSrc), 'set/reset exposed on window');

console.log('\n================ 6. Card DOM + CSS + cache-busters ================');
ok(/id="qibla-calib"[^>]*\bhidden\b/.test(htmlSrc), 'index.html #qibla-calib card present + hidden by default');
ok(/id="qcal-set"[^>]*onclick="qiblaSetNorth\(\)"/.test(htmlSrc) && /id="qcal-reset"[^>]*onclick="qiblaResetCalibration\(\)"/.test(htmlSrc), 'Set North + Reset buttons wired');
ok(/\.qibla-calib\b/.test(cssSrc), 'CSS .qibla-calib present');
const base = (cssSrc.match(/\.qibla-calib\s*\{[^}]*\}/) || [''])[0];
ok(!/display:\s*block/.test(base) && /\.qibla-calib\[hidden\]\s*\{\s*display:\s*none/.test(cssSrc), 'CSS: [hidden] guard hides the card (no display:block leak — lesson applied)');
ok(/js\/app\.js\?v=825/.test(htmlSrc), 'index.html app.js?v=825');
ok(/css\/style\.css\?v=493/.test(htmlSrc), 'index.html css/style.css?v=493');
ok(/CACHE_VERSION = 'v493'/.test(swSrc), 'sw.js CACHE_VERSION v493');

console.log(`\nPASS=${pass}  FAIL=${fail}`);
if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
