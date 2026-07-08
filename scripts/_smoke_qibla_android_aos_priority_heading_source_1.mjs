// Smoke — QIBLA-ANDROID-AOS-PRIORITY-HEADING-SOURCE-1
// The on-device ?qiblaDebug=1 N/E/S/W capture proved AbsoluteOrientationSensor (H_aos) matches the true
// heading while DeviceOrientation V2 is E/W-mirrored on the user's Android. This makes AOS the PRIORITY
// Android source (flag `_ANDROID_AOS_PRIORITY`), V2 the fallback. Tests:
//  (1) extract + exercise the REAL _qcAosUsable freshness/validity gate (fresh→use, stale/NaN/null/not-live
//      →fallback; flag OFF ⇒ never usable); (2) _qcStartAos idempotent + reading callback drives the compass
//      (source=aos, help=ok, NaN-guarded, jitter stabilizer) only when the flag is on; (3) the handler prefers
//      a usable AOS reading (early return BEFORE V2), and the V2 fallback flags source + LOW confidence;
//      (4) startDeviceCompass starts AOS on Android (never iOS); (5) iOS + needle + qiblaBearing + jitter
//      UNCHANGED; (6) debug shows the chosen source; (7) NO offset / NO Compass Lab; cache-busters.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const appSrc  = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const swSrc   = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

console.log('================ 1. Real _qcAosUsable freshness/validity gate (extracted) ================');
const flag   = appSrc.match(/const _ANDROID_AOS_PRIORITY = true;/);
const maxage = appSrc.match(/const _QC_AOS_MAX_AGE_MS = \d+;/);
const nowFn  = appSrc.match(/function _qcNow\(\) \{.*\}/);
const usable = appSrc.match(/function _qcAosUsable\(\) \{[\s\S]*?\n\}/);
ok(!!flag && !!maxage && !!nowFn && !!usable, 'extracted _ANDROID_AOS_PRIORITY + _QC_AOS_MAX_AGE_MS + _qcNow + _qcAosUsable');

const S = new Function(`
  ${flag[0]}
  ${maxage[0]}
  let _qcAosLive=false,_qcAosHeading=null,_qcAosTs=0;
  ${nowFn[0]}
  ${usable[0]}
  return { usable:_qcAosUsable, now:_qcNow,
    set:(live,h,ageMs)=>{ _qcAosLive=live; _qcAosHeading=h; _qcAosTs=_qcNow()-ageMs; } };
`)();
S.set(true, 90, 0);    ok(S.usable() === true,  'fresh valid AOS (age 0ms) → usable');
S.set(true, 243.8, 100); ok(S.usable() === true, 'AOS age 100ms (< 500) → usable');
S.set(true, 90, 800);  ok(S.usable() === false, 'AOS age 800ms (> 500) → STALE → NOT usable (⇒ DeviceOrientation)');
S.set(true, NaN, 0);   ok(S.usable() === false, 'AOS NaN heading → NOT usable');
S.set(true, null, 0);  ok(S.usable() === false, 'AOS null heading → NOT usable');
S.set(false, 90, 0);   ok(S.usable() === false, 'AOS not live → NOT usable');

// flag OFF ⇒ AOS never usable even with a fresh valid reading (exact e16ace5 fallback behaviour)
const offUsable = new Function(`
  const _ANDROID_AOS_PRIORITY = false;
  ${maxage[0]}
  let _qcAosLive=true,_qcAosHeading=90,_qcAosTs=0;
  ${nowFn[0]}
  ${usable[0]}
  _qcAosTs=_qcNow();
  return _qcAosUsable();
`)();
ok(offUsable === false, 'flag OFF ⇒ _qcAosUsable() false even with fresh valid reading (kill-switch ⇒ e16ace5)');

console.log('\n================ 2. _qcStartAos: idempotent + reading drives compass (flag-gated) ================');
const aosFn = appSrc.match(/function _qcStartAos\(\)[\s\S]*?\n\}/);
ok(!!aosFn, '_qcStartAos located');
const A = aosFn ? aosFn[0] : '';
ok(/if \(_qcAosSensor\) return;/.test(A), '_qcStartAos idempotent (guards re-entry: debug + production both call it)');
ok(/const h = _qcHeadingFromQuat\(_qcAosSensor\.quaternion\);/.test(A), 'reading derives heading from the AOS quaternion');
ok(/if \(h === null \|\| isNaN\(h\)\) return;/.test(A), 'reading GUARDS NaN/null before use');
ok(/_qcAosHeading = h; _qcAosTs = _qcNow\(\); _qcAosLive = true;/.test(A), 'reading records heading + fresh timestamp + live flag');
ok(/if \(_ANDROID_AOS_PRIORITY\)/.test(A) && /_qcActiveSource = 'aos';/.test(A), 'reading drives ONLY when the flag is on; marks source=aos');
ok(/_androidCompassStabilize\((?:_qcApplyCalibration\()?h\b/.test(A), 'AOS reading feeds the SAME jitter stabilizer (via _qcApplyCalibration since CALIBRATION-1)');
ok(/_qcSetHelp\('ok'\);/.test(A), 'AOS live ⇒ confidence ok');
ok(/_qcAosLive = false;/.test(A), 'AOS error handler clears the live flag ⇒ fallback');

console.log('\n================ 3. Handler prefers usable AOS; V2 is the fallback ================');
const hStart = appSrc.indexOf('_orientationHandler = function(e) {');
const hEnd   = appSrc.indexOf('// Always attach listeners');
const H = appSrc.slice(hStart, hEnd);
ok(/if \(_qcAosUsable\(\)\) \{ _hideBtnOnFirstEvent\(\); return; \}/.test(H), 'handler: usable AOS ⇒ early return (AOS drives, DeviceOrientation ignored)');
ok(H.indexOf('_qcAosUsable()') < H.indexOf('_qcResolveHeading(e)'), 'AOS-usable check runs BEFORE the V2 resolver');
ok(/_qcActiveSource = 'deviceorientation-matrix';/.test(H), 'V2 fallback marks source=deviceorientation-matrix');
ok(/if \(_ANDROID_AOS_PRIORITY\) _qcSetHelp\('low'\);/.test(H), 'V2 fallback ⇒ LOW confidence / accuracy warning (item 11)');
ok(/_androidCompassStabilize\((?:_qcApplyCalibration\()?heading\b/.test(H), 'V2 fallback still feeds the jitter stabilizer (via _qcApplyCalibration since CALIBRATION-1)');

console.log('\n================ 4. startDeviceCompass starts AOS on Android (never iOS) ================');
const sdc = appSrc.slice(appSrc.indexOf('function startDeviceCompass()'), appSrc.indexOf('function requestCompassPermission'));
ok(/if \(_ANDROID_AOS_PRIORITY\) \{[\s\S]*?_qcStartAos\(\);[\s\S]*?\}/.test(sdc), 'startDeviceCompass calls _qcStartAos under the flag');
ok(/const _isIOSPermAos = \(typeof DeviceOrientationEvent\.requestPermission === 'function'\);/.test(sdc)
   && /if \(!_isIOSPermAos\) \{ try \{ _qcStartAos\(\); \} catch/.test(sdc), 'AOS started only when NOT iOS (requestPermission absent)');

console.log('\n================ 5. iOS + needle + qiblaBearing + jitter UNCHANGED ================');
ok(/_applyCompassHeading\(e\.webkitCompassHeading\);/.test(H), 'iOS applies webkitCompassHeading raw (unchanged)');
ok(H.indexOf('e.webkitCompassHeading != null') < H.indexOf('_qcAosUsable()'), 'iOS branch runs BEFORE any AOS logic (iOS never touches AOS)');
ok(/rotate\(\$\{_qiblaAngle\}deg\)/.test(appSrc) || /_applyCompassHeading/.test(appSrc), 'needle rotation code present (untouched by this ticket)');
ok(/_AND_DEADBAND\s*=\s*2\b/.test(appSrc) && /_AND_MAX_STEP\s*=\s*10\b/.test(appSrc) && /requestAnimationFrame/.test(appSrc), 'jitter stabilizer (deadband/rate/rAF) intact');
ok(/_qiblaAngle = Qibla\.calculate\(currentLat, currentLng\);/.test(appSrc), 'Qibla bearing calc UNCHANGED');

console.log('\n================ 6. Hard-fail source + debug shows chosen source ================');
const armFn = appSrc.match(/function _qcArmHardFail\(\)[\s\S]*?\n\}/);
ok(!!armFn && /_qcActiveSource = 'fallback';/.test(armFn[0]), 'hard-fail (no heading) marks source=fallback');
const updBody = appSrc.slice(appSrc.indexOf('function _qcDebugUpdate(e) {'), appSrc.indexOf('function qiblaDebugSnapshot()'));
ok(/source: _qcActiveSource/.test(updBody) && /source='\+L\.source/.test(updBody), 'debug live panel shows source=');
ok(/src='\+row\.source/.test(appSrc), 'debug snapshot row shows the chosen src');

console.log('\n================ 7. No offset / no Compass Lab + cache-busters ================');
const stripC = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^:])\/\/[^\n]*/g, '$1');
ok(!/\b8[35]\b/.test(stripC(A)) && !/\b8[35]\b/.test(stripC(H)), 'NO +83/-83/85 constant offset in the AOS helper or handler');
const appCode = stripC(appSrc);
ok(!/qiblaLab(?!el)/.test(appCode) && !/Compass Lab/.test(appCode), 'NO visible Compass Lab / ?qiblaLab param (in code)');
ok(/id="qibla-debug"[^>]*\bhidden\b/.test(htmlSrc), 'debug panel still hidden by default (all normal users)');
ok(/js\/app\.js\?v=825/.test(htmlSrc), 'index.html app.js?v=825 (bumped by CALIBRATION-1)');
ok(/css\/style\.css\?v=493/.test(htmlSrc), 'index.html css/style.css?v=493 (bumped by CALIBRATION-1)');
ok(/CACHE_VERSION = 'v493'/.test(swSrc), 'sw.js CACHE_VERSION v493 (bumped by CALIBRATION-1)');

console.log(`\nPASS=${pass}  FAIL=${fail}`);
if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
