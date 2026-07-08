// Smoke — QIBLA-ANDROID-COMPASS-ROOT-REBUILD-2
// (1) Extracts the REAL _qcHeadingFromEvent (+ _qcScreenAngle) from js/app.js and proves the
//     canonical tilt/screen-corrected heading reduces to `alpha` when the phone is flat
//     (N=0,E=90,S=180,W=270 — so cardinals don't regress vs dd94875), stays sane when tilted,
//     wraps, and never NaN. (2) Structural guards: flag present + off-path = dd94875; iOS path
//     unchanged; jitter stabilizer intact; source-aware resolver prefers absolute; L10N dict has
//     all 10 langs; help/fallback present (message-only, NO recalibrate button); NO offset; NO Compass Lab; DOM+CSS hooks.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const appSrc   = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const htmlSrc  = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const cssSrc   = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }
const near = (a, b, tol) => Math.abs((((a - b) % 360) + 540) % 360 - 180) <= (tol == null ? 0.5 : tol);

console.log('================ 1. REAL _qcHeadingFromEvent (extracted from app.js) ================');
const cst = appSrc.match(/const _QC_D2R = Math\.PI \/ 180, _QC_R2D = 180 \/ Math\.PI;/);
const scr = appSrc.match(/function _qcScreenAngle\(\) \{[\s\S]*?\n\}/);
const hed = appSrc.match(/function _qcHeadingFromEvent\(e\) \{[\s\S]*?\n\}/);
ok(!!cst && !!scr && !!hed, 'extracted _QC_D2R/_qcScreenAngle/_qcHeadingFromEvent');
// sandbox: define window so _qcScreenAngle returns 0 (no screen/orientation in node)
const _qcHeadingFromEvent = new Function(`var window = {}; ${cst[0]}\n${scr[0]}\n${hed[0]}\nreturn _qcHeadingFromEvent;`)();
// flat (beta=gamma=0) ⇒ heading == alpha (N=0,E=90,S=180,W=270)
ok(near(_qcHeadingFromEvent({alpha:0,   beta:0, gamma:0}), 0),   'flat North: alpha 0   → 0');
ok(near(_qcHeadingFromEvent({alpha:90,  beta:0, gamma:0}), 90),  'flat East:  alpha 90  → 90');
ok(near(_qcHeadingFromEvent({alpha:180, beta:0, gamma:0}), 180), 'flat South: alpha 180 → 180');
ok(near(_qcHeadingFromEvent({alpha:270, beta:0, gamma:0}), 270), 'flat West:  alpha 270 → 270');
ok(near(_qcHeadingFromEvent({alpha:359, beta:0, gamma:0}), 359), 'flat wrap:  alpha 359 → 359');
// tilt-compensated: pitching/rolling the phone must NOT change the heading much when facing a fixed way
ok(near(_qcHeadingFromEvent({alpha:0,  beta:40, gamma:0}), 0,  3),  'tilt fwd @N: alpha 0, beta 40 → ~0 (tilt-compensated)');
ok(near(_qcHeadingFromEvent({alpha:90, beta:30, gamma:0}), 90, 3),  'tilt fwd @E: alpha 90, beta 30 → ~90');
ok(near(_qcHeadingFromEvent({alpha:90, beta:0, gamma:25}), 90, 8),  'roll @E: alpha 90, gamma 25 → ~90');
ok(_qcHeadingFromEvent({alpha:null, beta:1, gamma:1}) === null, 'null alpha → null');
// no NaN + range over a sweep of alpha×beta×gamma
let bad = false;
for (let a = 0; a < 360; a += 45) for (let b = -60; b <= 60; b += 30) for (let g = -60; g <= 60; g += 30) {
  const h = _qcHeadingFromEvent({alpha:a, beta:b, gamma:g});
  if (h === null || Number.isNaN(h) || h < 0 || h >= 360) bad = true;
}
ok(!bad, 'sweep alpha×beta×gamma: never NaN, always in [0,360)');

console.log('\n================ 2. Flag + dd874 fallback + iOS unchanged + stabilizer ================');
ok(/const _ANDROID_COMPASS_V2 = true;/.test(appSrc), 'feature flag _ANDROID_COMPASS_V2 present (default on)');
ok(/if \(_ANDROID_COMPASS_V2\) \{[\s\S]{0,160}?_qcResolveHeading\(e\);/.test(appSrc), 'flag ON ⇒ Android uses _qcResolveHeading');
ok(/\} else \{[\s\S]{0,160}?_androidAlphaToHeading\(e\.alpha\);/.test(appSrc), 'flag OFF ⇒ Android falls back to dd94875 _androidAlphaToHeading');
ok(/_applyCompassHeading\(e\.webkitCompassHeading\);/.test(appSrc), 'iOS applies webkitCompassHeading raw (unchanged)');
ok(/if \(e\.webkitCompassHeading != null[\s\S]{0,160}?return;/.test(appSrc), 'iOS branch returns early (never enters Android resolver)');
ok(/_androidCompassStabilize\(heading\b/.test(appSrc), 'Android still feeds the jitter stabilizer (raw heading; manual calibration removed)');
ok(/_AND_DEADBAND\s*=\s*2\b/.test(appSrc) && /_AND_MAX_STEP\s*=\s*10\b/.test(appSrc) && /requestAnimationFrame/.test(appSrc), 'jitter stabilizer (deadband/rate/rAF) intact');

console.log('\n================ 3. Resolver + confidence + fallback (no manual calibration) ================');
ok(/e\.type === 'deviceorientationabsolute'/.test(appSrc) && /e\.absolute === true/.test(appSrc), 'resolver prefers ABSOLUTE source (deviceorientationabsolute / e.absolute)');
ok(/if \(!isAbs && _qcAbsoluteSeen\) return null;/.test(appSrc), 'relative reading ignored once an absolute source exists');
ok(/function _qcArmHardFail\(\)/.test(appSrc) && /_qcSetHelp\('fail'/.test(appSrc), 'hard-fail arms + static-bearing fallback state');
// REMOVE-MANUAL-CALIBRATION-UX-1: the recalibrate button + its handler/global are DELETED (message-only help card).
ok(!/function recalibrateCompass\b/.test(appSrc) && !/window\.recalibrateCompass\b/.test(appSrc), 'recalibrateCompass() + window global DELETED (no manual calibration path)');
ok(/_qcSetHelp\('low'\)|isAbs \? 'ok' : 'low'/.test(appSrc), 'low-confidence state on non-absolute source');

console.log('\n================ 4. L10N (all 10 langs) + no offset + no Compass Lab ================');
for (const ln of ['ar','en','fr','tr','ur','de','id','es','bn','ms']) {
  ok(new RegExp('\\b' + ln + ':\\s*\\{\\s*low:').test(appSrc), 'L10N has lang ' + ln + ' (low/hint/dirLabel/unavail)');
}
const regStart = appSrc.indexOf('function _applyCompassHeading');
const regEnd = appSrc.indexOf('function requestCompassPermission');
const region = appSrc.slice(regStart, regEnd).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
ok(!/\b8[35]\b/.test(region), 'NO +83/-83/85 constant offset in the compass code');
// strip comments (my own comment block mentions "Compass Lab"/"AbsoluteOrientationSensor" to say they're NOT used)
const appCode = appSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^:])\/\/[^\n]*/g, '$1');
ok(!/qiblaLab(?!el)/.test(appCode) && !/Compass Lab/.test(appCode), 'NO Compass Lab / ?qiblaLab param (in code)');
// AOS is now a PRODUCTION Android source (AOS-PRIORITY-1) but the AbsoluteOrientationSensor constructor +
// feature-detect stay confined to the _qcStartAos helper — everything else references it by function name.
const _stripC = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^:])\/\/[^\n]*/g, '$1');
const _aosFn = appSrc.match(/function _qcStartAos\(\)[\s\S]*?\n\}/);
ok(!!_aosFn, '_qcStartAos helper present');
ok(!/AbsoluteOrientationSensor/.test(_stripC(appSrc.replace(_aosFn ? _aosFn[0] : 'x', ''))), 'AbsoluteOrientationSensor constructor/detect confined to _qcStartAos (no stray refs)');
ok(/_qiblaAngle = Qibla\.calculate\(currentLat, currentLng\);/.test(appSrc), 'Qibla bearing calc UNCHANGED');

console.log('\n================ 5. DOM + CSS hooks + cache-busters ================');
ok(/id="qibla-compass-help"/.test(htmlSrc) && /id="qch-msg"/.test(htmlSrc) && /id="qch-bearing"/.test(htmlSrc), 'help-card DOM ids present in index.html (bearing + msg)');
ok(!/id="qch-recalib"/.test(htmlSrc) && !/onclick="recalibrateCompass\(\)"/.test(htmlSrc) && !/recalibrateCompass/.test(htmlSrc), 'NO recalibrate button / onclick in index.html (message-only help card)');
ok(/\.qibla-compass-help/.test(cssSrc) && /\.compass\.compass-unavailable/.test(cssSrc), 'CSS: help card + compass-unavailable styles');
ok(/js\/app\.js\?v=829/.test(htmlSrc), 'index.html app.js?v=829 (bumped by REMOVE-MANUAL-CALIBRATION-UX-1)');
ok(/css\/style\.css\?v=496/.test(htmlSrc), 'index.html css/style.css?v=496 (bumped by REMOVE-MANUAL-CALIBRATION-UX-1)');
ok(/CACHE_VERSION = 'v496'/.test(fs.readFileSync(path.join(ROOT,'sw.js'),'utf8')), 'sw.js CACHE_VERSION v496 (bumped by REMOVE-MANUAL-CALIBRATION-UX-1)');

console.log(`\nPASS=${pass}  FAIL=${fail}`);
if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
