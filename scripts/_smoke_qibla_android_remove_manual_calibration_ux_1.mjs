// Smoke — QIBLA-ANDROID-REMOVE-MANUAL-CALIBRATION-UX-1
// Product decision: the user does NOTHING but allow the compass. Manual "set North" calibration is removed
// from the UX AND the internal calibration code is fully DELETED. This smoke proves: the calibration UI is
// gone (no card, no Set North / Clear, no recalibrate button); every calibration function + state variable is
// deleted so NO code path can apply a manual offset; the legacy localStorage key is wiped once on Android load;
// AOS priority still drives the live needle; the low-accuracy state shows only the badge + figure-8 hint (no
// button); a failed sensor shows the static «اتجاه القبلة: 243.8° — <dir>» text with the needle hidden;
// iOS is untouched; no overflow; qiblaBearing/needle unchanged.
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
// strip block + line comments so identifier checks inspect EXECUTABLE code only (the removal notes name the
// deleted symbols on purpose); the `[^:]` guard keeps `http://`-style tokens intact.
const _strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^:])\/\/[^\n]*/g, '$1');
const appCode = _strip(appSrc);
const help = appSrc.slice(appSrc.indexOf('function _qcSetHelp('), appSrc.indexOf('function _qcArmHardFail('));
const arm  = (appSrc.match(/function _qcArmHardFail\(\)[\s\S]*?\n\}/) || [''])[0];
const H    = appSrc.slice(appSrc.indexOf('_orientationHandler = function(e) {'), appSrc.indexOf('// Always attach listeners'));

console.log('================ 1. Manual-calibration UI is GONE ================');
ok(!/id="qibla-calib"/.test(htmlSrc), 'no #qibla-calib card in index.html');
ok(!/id="qcal-set"/.test(htmlSrc) && !/id="qcal-reset"/.test(htmlSrc), 'no Set North / Clear buttons in index.html');
ok(!/id="qch-recalib"/.test(htmlSrc), 'no #qch-recalib recalibrate button in index.html');
ok(!/qiblaSetNorth\(\)/.test(htmlSrc) && !/recalibrateCompass/.test(htmlSrc), 'no Set North / recalibrate onclick anywhere in index.html');
const cssCode = cssSrc.replace(/\/\*[\s\S]*?\*\//g, '');   // strip comments (the removal notes name .qibla-calib / .qch-btn)
ok(!/\.qibla-calib\b/.test(cssCode), 'no .qibla-calib CSS rule (styles removed with the card)');
ok(!/\.qch-btn\b/.test(cssCode), 'no .qch-btn CSS rule (recalibrate button styles removed)');
ok(!/معايرة يدوية متقدمة/.test(appSrc) && !/Advanced manual calibration/.test(appSrc), 'no "advanced manual calibration" summary text');

console.log('\n================ 2. Manual-calibration CODE fully DELETED (no offset path) ================');
ok(!/_ANDROID_MANUAL_CALIB/.test(appCode), '_ANDROID_MANUAL_CALIB flag DELETED (code)');
ok(!/_qcApplyCalibration/.test(appCode), '_qcApplyCalibration DELETED — no definition and no call site (code)');
ok(!/_qcLoadCalib/.test(appCode), '_qcLoadCalib DELETED (code)');
ok(!/_qcRevealCalibCard/.test(appCode), '_qcRevealCalibCard DELETED (code)');
ok(!/_qcCalibCardUpdate/.test(appCode) && !/_qcNorm360/.test(appCode), '_qcCalibCardUpdate + _qcNorm360 DELETED (code)');
ok(!/_qcCalibOffset/.test(appCode) && !/_QC_CALIB_KEY/.test(appCode) && !/_qcLastRawHeading/.test(appCode), 'no calib offset/key/raw-heading state variables remain (code)');
ok(!/_QIBLA_CALIB_L10N/.test(appCode) && !/_qcCalibL10n/.test(appCode), 'the calibration L10N dict DELETED (code)');
// the ONLY thing that can move the needle is the RAW heading → the jitter stabilizer (no offset wrap left)
ok(/_androidCompassStabilize\(h\)/.test(appCode) && /_androidCompassStabilize\(heading\)/.test(appCode), 'AOS + DeviceOrientation feed the stabilizer with the RAW heading (no _qcApplyCalibration wrap)');

console.log('\n================ 3. Old localStorage offset wiped on load; nothing new saved ================');
const sdc = appSrc.slice(appSrc.indexOf('function startDeviceCompass()'), appSrc.indexOf('function requestCompassPermission'));
ok(/localStorage\.removeItem\('qiblaCalibOffset'\)/.test(sdc), 'startDeviceCompass wipes the legacy qiblaCalibOffset key (Android, one-time)');
ok(!/setItem\(\s*'qiblaCalibOffset'/.test(appSrc) && !/localStorage\.setItem\([^)]*[Cc]alib/.test(appSrc), 'nothing ever WRITES a calibration offset (no setItem)');
// classic (non-module) script: a top-level `function qiblaSetNorth(){}` auto-creates window.qiblaSetNorth,
// so the DECLARATIONS must be gone (not merely the explicit window.x = ... line) for the global to disappear.
ok(!/function qiblaSetNorth\b/.test(appSrc) && !/function qiblaResetCalibration\b/.test(appSrc) && !/function recalibrateCompass\b/.test(appSrc), 'qiblaSetNorth / qiblaResetCalibration / recalibrateCompass declarations DELETED ⇒ no window globals');
ok(!/window\.qiblaSetNorth\b/.test(appSrc) && !/window\.qiblaResetCalibration\b/.test(appSrc) && !/window\.recalibrateCompass\b/.test(appSrc), 'no explicit window exposure for any calibration function');

console.log('\n================ 4. AOS usable ⇒ live needle (normal) ================');
ok(/const _ANDROID_AOS_PRIORITY = true;/.test(appSrc), 'AOS priority still ON');
ok(/_qcActiveSource = 'aos';[\s\S]{0,220}?_qcSetHelp\('ok'\)/.test(appSrc), 'live AOS ⇒ source=aos + confidence ok (needle drives normally)');
ok(/state === 'low'\) \{[\s\S]{0,80}?compass\.classList\.remove\('compass-unavailable'\)/.test(help), 'low state keeps the live needle (removes compass-unavailable)');

console.log('\n================ 5. AOS fallback ⇒ low-accuracy WARNING only (no button) ================');
ok(/if \(_ANDROID_AOS_PRIORITY\) _qcSetHelp\('low'\);/.test(H), 'DeviceOrientation fallback ⇒ LOW confidence');
ok(/msg\.textContent = L\.low \+ ' — ' \+ L\.hint/.test(help), 'low state shows badge + hint only (message, no button)');
ok(/low:'دقة البوصلة منخفضة'/.test(appSrc) && /hint:'حرّك الهاتف على شكل رقم 8/.test(appSrc), 'AR low = «دقة البوصلة منخفضة» + figure-8 hint');

console.log('\n================ 6. No heading ⇒ static textual direction (needle hidden) ================');
ok(/_qcActiveSource = 'fallback';/.test(arm), 'hard-fail ⇒ source=fallback');
ok(/_qcSetHelp\('fail', L\.dirLabel \+ ': ' \+ _qiblaAngle\.toFixed\(1\) \+ '° — ' \+ dir\)/.test(arm), 'fallback shows «<dirLabel>: 243.8° — <dir>»');
ok(/dirLabel:'اتجاه القبلة'/.test(appSrc), 'AR dirLabel = «اتجاه القبلة»');
ok(/unavail:'قد لا تكون بوصلة هذا الجهاز دقيقة/.test(appSrc), 'AR fallback message = user’s wording (sensor unavailable/unreliable, calc correct)');
ok(/if \(state === 'fail'\) \{[\s\S]{0,160}?compass\.classList\.add\('compass-unavailable'\)/.test(help), 'fail HIDES the needle (compass-unavailable)');
ok(/\.compass\.compass-unavailable \.compass-arrow \{ display: none; \}/.test(cssSrc), 'CSS hides the needle arrow on fail');
ok(/id="qibla-angle"/.test(htmlSrc) && /id="qibla-direction"/.test(htmlSrc), 'textual bearing + direction always present on the page');

console.log('\n================ 7. iOS untouched + invariants + no overflow + cache-busters ================');
ok(H.indexOf('_applyCompassHeading(e.webkitCompassHeading)') > -1 && H.indexOf('_applyCompassHeading(e.webkitCompassHeading)') < H.indexOf("_qcSetHelp('low')"), 'iOS applies + returns before the Android low path');
ok(/_qiblaAngle = Qibla\.calculate\(currentLat, currentLng\);/.test(appSrc), 'qiblaBearing (Qibla.calculate) UNCHANGED');
ok(/rotate\(\$\{_qiblaAngle\}deg\)/.test(appSrc), 'needle rotation code present (untouched)');
ok(/\.qibla-compass-help \{[\s\S]{0,200}?max-width: 320px/.test(cssSrc), '.qibla-compass-help width-capped (no overflow)');
ok(!/qiblaLab(?!el)/.test(appCode) && !/Compass Lab/.test(appCode), 'NO Compass Lab / ?qiblaLab');
ok(!/[+\-]\s*160\b|[+\-]\s*83\b|[+\-]\s*85\b/.test(appCode), 'NO hardcoded +160/-160/+83/85 global offset');
ok(/js\/app\.js\?v=829/.test(htmlSrc), 'index.html app.js?v=829');
ok(/css\/style\.css\?v=496/.test(htmlSrc), 'index.html css/style.css?v=496');
ok(/CACHE_VERSION = 'v496'/.test(swSrc), 'sw.js CACHE_VERSION v496');

console.log(`\nPASS=${pass}  FAIL=${fail}`);
if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
