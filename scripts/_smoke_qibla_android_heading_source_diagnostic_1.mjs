// Smoke — QIBLA-ANDROID-HEADING-SOURCE-DIAGNOSTIC-AND-AOS-EXPERIMENT-1
// Proves the HIDDEN, READ-ONLY numeric diagnostic (behind ?qiblaDebug=1 / localStorage['qiblaDebug']):
//  (1) extracts + tests the two NEW pure helpers _qcHeadingFromQuat (identity→North, no NaN) and
//      _qcMatrixNoScreen (flat→alpha, no NaN); (2) gate reads ?qiblaDebug=1 + localStorage and is OFF
//      by default (panel starts `hidden`, only unhidden when the flag is on); (3) the handler observes
//      via _qcDebugUpdate BEFORE the iOS branch, gated + try/catch, and _qcDebugUpdate is READ-ONLY
//      (writes only to #qd-live, never drives the compass); (4) AbsoluteOrientationSensor lives ONLY
//      inside the diagnostic (feature-detected, started from the gated init) — NOT in the live path;
//      (5) all 6 candidate headings computed; Snapshot appends a row; Copy serialises JSON;
//      (6) default V2 + iOS + jitter stabilizer UNCHANGED; NO offset; NO visible Compass Lab;
//      (7) panel DOM + CSS + cache-busters present.
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
const near = (a, b, tol) => Math.abs((((a - b) % 360) + 540) % 360 - 180) <= (tol == null ? 0.5 : tol);

// Diagnostic block boundaries (marker comment → last window export line).
const dS = appSrc.indexOf('QIBLA-ANDROID-HEADING-SOURCE-DIAGNOSTIC-AND-AOS-EXPERIMENT-1');
const dE = appSrc.indexOf('window.qiblaDebugCopy = qiblaDebugCopy;');

console.log('================ 1. NEW pure helpers extracted from app.js ================');
const cst = appSrc.match(/const _QC_D2R = Math\.PI \/ 180, _QC_R2D = 180 \/ Math\.PI;/);
const rvq = appSrc.match(/function _qcRotVecQuat\(v, q\) \{[\s\S]*?\n\}/);
const hfq = appSrc.match(/function _qcHeadingFromQuat\(q\) \{[\s\S]*?\n\}/);
const mns = appSrc.match(/function _qcMatrixNoScreen\(e\) \{[\s\S]*?\n\}/);
ok(!!cst && !!rvq && !!hfq && !!mns, 'extracted _QC consts + _qcRotVecQuat + _qcHeadingFromQuat + _qcMatrixNoScreen');
const sb = new Function(`${cst[0]}\n${rvq[0]}\n${hfq[0]}\n${mns[0]}\nreturn { _qcHeadingFromQuat, _qcMatrixNoScreen };`)();
const { _qcHeadingFromQuat, _qcMatrixNoScreen } = sb;

// _qcHeadingFromQuat: device +Y rotated by quaternion → atan2(East,North) bearing.
ok(near(_qcHeadingFromQuat([0, 0, 0, 1]), 0),   'identity quaternion → 0 (North)');
ok(near(_qcHeadingFromQuat([0, 0, 1, 0]), 180), '180deg-about-Z quaternion → 180 (South)');
ok(_qcHeadingFromQuat(null) === null,      'null quaternion → null (no throw)');
ok(_qcHeadingFromQuat([0, 0, 0]) === null, 'short quaternion (<4) → null');
let badQ = false;
for (const q of [[0,0,0.7071,0.7071], [0,0,0.7071,-0.7071], [0.5,0.5,0.5,0.5], [0.7071,0,0,0.7071], [0,0.7071,0,0.7071]]) {
  const h = _qcHeadingFromQuat(q);
  if (h === null || Number.isNaN(h) || h < 0 || h >= 360) badQ = true;
}
ok(!badQ, '_qcHeadingFromQuat over unit quaternions: never NaN, always in [0,360)');

// _qcMatrixNoScreen: matrix azimuth WITHOUT the screen term — reduces to alpha when flat.
ok(near(_qcMatrixNoScreen({alpha:0,   beta:0, gamma:0}), 0),   'noScreen flat North: alpha 0 → 0');
ok(near(_qcMatrixNoScreen({alpha:90,  beta:0, gamma:0}), 90),  'noScreen flat East:  alpha 90 → 90 (== alpha when flat)');
ok(near(_qcMatrixNoScreen({alpha:270, beta:0, gamma:0}), 270), 'noScreen flat West:  alpha 270 → 270');
ok(_qcMatrixNoScreen({alpha:null, beta:1, gamma:1}) === null,  'noScreen null alpha → null');
ok(near(_qcMatrixNoScreen({alpha:123, beta:null, gamma:null}), 123), 'noScreen null tilt → alpha fallback');
let badM = false;
for (let a = 0; a < 360; a += 60) for (let b = -60; b <= 60; b += 30) for (let g = -60; g <= 60; g += 30) {
  const h = _qcMatrixNoScreen({alpha:a, beta:b, gamma:g});
  if (h === null || Number.isNaN(h) || h < 0 || h >= 360) badM = true;
}
ok(!badM, '_qcMatrixNoScreen sweep alpha×beta×gamma: never NaN, always in [0,360)');

console.log('\n================ 2. Gate: ?qiblaDebug=1 / localStorage, OFF by default ================');
ok(/function _qiblaDebugOn\(\)/.test(appSrc), '_qiblaDebugOn() present');
ok(appSrc.includes('/[?&]qiblaDebug=1\\b/.test(location.search)'), '_qiblaDebugOn reads ?qiblaDebug=1 from the URL');
ok(appSrc.includes("localStorage.getItem('qiblaDebug') === '1'"), '_qiblaDebugOn reads localStorage[qiblaDebug]');
ok(/id="qibla-debug"[^>]*\bhidden\b/.test(htmlSrc), 'index.html #qibla-debug panel starts HIDDEN (off by default)');
ok(/function _qcDebugInit\(\) \{[\s\S]{0,220}?if \(_qcDbgInit \|\| !_qiblaDebugOn\(\)\) return;[\s\S]{0,160}?panel\.hidden = false;/.test(appSrc),
   '_qcDebugInit unhides the panel ONLY when _qiblaDebugOn()');

console.log('\n================ 3. Handler observe is gated + read-only ================');
ok(/if \(_qiblaDebugOn\(\)\) \{ try \{ _qcDebugUpdate\(e\); \} catch \(_\) \{\} \}/.test(appSrc),
   'handler calls _qcDebugUpdate gated by _qiblaDebugOn + wrapped in try/catch');
ok(appSrc.indexOf('_qcDebugUpdate(e);') < appSrc.indexOf('e.webkitCompassHeading != null && !isNaN'),
   'diagnostic observe runs BEFORE the iOS branch (captures iOS + Android)');
const upStart = appSrc.indexOf('function _qcDebugUpdate(e) {');
const upEnd   = appSrc.indexOf('function qiblaDebugSnapshot()');
const updateBody = appSrc.slice(upStart, upEnd);
ok(upStart > -1 && upEnd > upStart, '_qcDebugUpdate function located');
ok(/getElementById\('qd-live'\)/.test(updateBody), '_qcDebugUpdate writes to the #qd-live panel');
ok(!/_applyCompassHeading|_androidCompassStabilize/.test(updateBody),
   '_qcDebugUpdate NEVER drives the rendered compass (read-only observer)');

console.log('\n================ 4. AbsoluteOrientationSensor helper (now a PRODUCTION source) ================');
ok(/function _qcStartAos\(\)/.test(appSrc) && /'AbsoluteOrientationSensor' in window/.test(appSrc),
   '_qcStartAos feature-detects AbsoluteOrientationSensor (no throw when unsupported)');
// AOS-PRIORITY-1: _qcStartAos is now invoked from BOTH the gated debug init AND startDeviceCompass (Android).
const initStart = appSrc.indexOf('function _qcDebugInit()');
const initEnd   = appSrc.indexOf('function _qcFmt(');
ok(appSrc.slice(initStart, initEnd).includes('_qcStartAos()'), '_qcStartAos still invoked from the gated _qcDebugInit (debug display)');
const sdcStart = appSrc.indexOf('function startDeviceCompass()');
ok(sdcStart > -1 && appSrc.slice(sdcStart).includes('_qcStartAos()'), '_qcStartAos ALSO invoked from startDeviceCompass (production Android source)');
ok(dS > -1 && dE > dS, 'diagnostic block present + delimited');
// The AbsoluteOrientationSensor constructor + feature-detect stay confined to the _qcStartAos helper.
const stripC = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^:])\/\/[^\n]*/g, '$1');
const aosFn = appSrc.match(/function _qcStartAos\(\)[\s\S]*?\n\}/);
ok(!/AbsoluteOrientationSensor/.test(stripC(appSrc.replace(aosFn ? aosFn[0] : 'x', ''))),
   'AbsoluteOrientationSensor constructor/detect confined to _qcStartAos (no stray refs)');

console.log('\n================ 5. 6 candidate headings + snapshot + copy ================');
for (const k of ['H_alpha', 'H_360', 'H_dd94875', 'H_matrix', 'H_matrixNoScreen', 'H_aos']) {
  ok(new RegExp('\\b' + k + ':').test(updateBody), 'candidate ' + k + ' computed in the live panel');
}
ok(/function qiblaDebugSnapshot\(\)/.test(appSrc) && /createElement\('div'\)[\s\S]{0,120}?qd-row/.test(appSrc),
   'qiblaDebugSnapshot() appends a .qd-row');
ok(/function qiblaDebugCopy\(\)/.test(appSrc) && /JSON\.stringify\(payload/.test(appSrc),
   'qiblaDebugCopy() serialises snapshots to JSON');
ok(/window\.qiblaDebugSnapshot = qiblaDebugSnapshot/.test(appSrc) && /window\.qiblaDebugCopy = qiblaDebugCopy/.test(appSrc),
   'snapshot + copy exposed on window');

console.log('\n================ 6. Default compass UNCHANGED + no offset + no Compass Lab ================');
ok(/const _ANDROID_COMPASS_V2 = true;/.test(appSrc), 'default V2 path unchanged (flag still on)');
ok(/_applyCompassHeading\(e\.webkitCompassHeading\);/.test(appSrc), 'iOS path unchanged (webkitCompassHeading raw)');
ok(/heading = _qcResolveHeading\(e\);/.test(appSrc), 'live Android heading still from _qcResolveHeading (not a debug candidate)');
ok(/_androidCompassStabilize\(heading\b/.test(appSrc), 'Android still feeds the jitter stabilizer (raw heading; manual calibration removed)');
const appCode = appSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^:])\/\/[^\n]*/g, '$1');
ok(!/qiblaLab(?!el)/.test(appCode) && !/Compass Lab/.test(appCode), 'NO visible Compass Lab / ?qiblaLab param (in code)');
const diagCode = appSrc.slice(dS, dE).replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^:])\/\/[^\n]*/g, '$1');
ok(!/\b8[35]\b/.test(diagCode), 'NO +83/-83/85 constant offset baked in the diagnostic');
ok(/_qiblaAngle = Qibla\.calculate\(currentLat, currentLng\);/.test(appSrc), 'Qibla bearing calc UNCHANGED');

console.log('\n================ 7. Panel DOM + CSS + cache-busters ================');
ok(/id="qibla-debug"/.test(htmlSrc) && /id="qd-live"/.test(htmlSrc) && /id="qd-rows"/.test(htmlSrc),
   'debug panel DOM (#qibla-debug / #qd-live / #qd-rows) in index.html');
ok(/onclick="qiblaDebugSnapshot\(\)"/.test(htmlSrc) && /onclick="qiblaDebugCopy\(\)"/.test(htmlSrc), 'Snapshot + Copy buttons wired');
ok(/\.qibla-debug\b/.test(cssSrc) && /\.qd-live\b/.test(cssSrc), 'CSS .qibla-debug / .qd-live styles present');
// GUARD: the panel MUST stay display:none when [hidden] — the base rule must not force display:block
// (that would leak the debug panel to all normal users). Either no base display, or an explicit guard.
const _dbgBase = cssSrc.match(/\.qibla-debug\s*\{[^}]*\}/);
ok(!!_dbgBase && (!/display:\s*block/.test(_dbgBase[0]) || /\.qibla-debug\[hidden\]\s*\{\s*display:\s*none/.test(cssSrc)),
   'CSS: [hidden] hides the panel for all normal users (no display:block leak in the base rule)');
ok(/js\/app\.js\?v=829/.test(htmlSrc), 'index.html app.js?v=829 (bumped by REMOVE-MANUAL-CALIBRATION-UX-1)');
ok(/css\/style\.css\?v=496/.test(htmlSrc), 'index.html css/style.css?v=496 (bumped by REMOVE-MANUAL-CALIBRATION-UX-1)');
ok(/CACHE_VERSION = 'v496'/.test(swSrc), 'sw.js CACHE_VERSION v496 (bumped by REMOVE-MANUAL-CALIBRATION-UX-1)');

console.log(`\nPASS=${pass}  FAIL=${fail}`);
if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
