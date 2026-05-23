/* MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23)
 * Refactor pass: split the evergreen wording into a separate i18n key
 * so it ONLY affects /moon-in-{city} hub pages — leaving /moon-today
 * and /moon-today-in-{city} (which share the same `moon.intro_template`
 * key) completely untouched per the user's "لا تغيّر /moon-today"
 * directive.
 *
 * Step 1: restore the original `moon.intro_template` strings I had
 *   replaced earlier with the evergreen variant.
 * Step 2: append new hub-only keys `moon.intro_template_hub` +
 *   `moon.altitude_above_hub` + `moon.altitude_below_hub` after the
 *   existing intro/altitude block in every lang file.
 *
 * Idempotent — re-running prints "already" for each block that's done.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname || '.', '..');

// ── Step 1: revert moon.intro_template back to ORIGINAL "today" wording ──
//   The original 10-lang strings I overwrote in the first patch attempt.

const REVERTS = [
  // js/i18n/en.js (was patched via Edit tool earlier)
  {
    file: 'js/i18n/en.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): evergreen voice — no \"today\", includes {country}.\n" +
      "        'moon.intro_template': 'The Moon in {city}, {country} is currently in a {phaseIcon} {phaseName} phase at {illum}% illumination, on day {age} of its cycle, passing through the {zodiacIcon} {zodiacName} constellation. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'The Moon today in {city} is in a {phaseIcon} {phaseName} phase at {illum}% illumination, {age} days into its cycle, passing through the {zodiacIcon} {zodiacName} constellation. {altitudeSentence}',",
  },
  // js/i18n/fr.js
  {
    file: 'js/i18n/fr.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): voix evergreen — pas de \"aujourd\\u2019hui\", inclut {country}.\n" +
      "        'moon.intro_template': 'La Lune à {city}, {country} est actuellement en phase {phaseIcon} {phaseName} avec {illum}% d\\u2019illumination, au jour {age} de son cycle, traversant la constellation {zodiacIcon} {zodiacName}. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'La Lune aujourd\\u2019hui à {city} est en phase {phaseIcon} {phaseName} avec {illum}% d\\u2019illumination, {age} jours dans son cycle, traversant la constellation {zodiacIcon} {zodiacName}. {altitudeSentence}',",
  },
  // js/i18n/tr.js
  {
    file: 'js/i18n/tr.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): evergreen ses — \"bugün\" yok, {country} dahil.\n" +
      "        'moon.intro_template': 'Ay, {city}, {country} için şu anda {phaseIcon} {phaseName} evresinde ve %{illum} aydınlanmada, döngüsünün {age}. gününde, {zodiacIcon} {zodiacName} takımyıldızından geçiyor. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'Ay bugün {city} için {phaseIcon} {phaseName} evresinde ve %{illum} aydınlanmada, döngüsünün {age} gününde, {zodiacIcon} {zodiacName} takımyıldızından geçiyor. {altitudeSentence}',",
  },
  // js/i18n/ur.js
  {
    file: 'js/i18n/ur.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): evergreen — no \"آج\"، includes {country}.\n" +
      "        'moon.intro_template': '{city}، {country} میں چاند اس وقت {phaseIcon} {phaseName} مرحلے میں ہے، {illum}٪ روشنی کے ساتھ، اپنے چکر کے {age}ویں دن، اور {zodiacIcon} {zodiacName} برج سے گزر رہا ہے۔ {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'آج {city} میں چاند {phaseIcon} {phaseName} مرحلے میں ہے، {illum}٪ روشنی کے ساتھ، اپنے چکر کے {age}ویں دن، اور {zodiacIcon} {zodiacName} برج سے گزر رہا ہے۔ {altitudeSentence}',",
  },
  // js/i18n/de.js
  {
    file: 'js/i18n/de.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): evergreene Stimme — kein \"heute\", enthält {country}.\n" +
      "        'moon.intro_template': 'Der Mond in {city}, {country} befindet sich aktuell in der Phase {phaseIcon} {phaseName} mit {illum}% Beleuchtung, am Tag {age} seines Zyklus, durch das Sternbild {zodiacIcon} {zodiacName} ziehend. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'Der Mond heute in {city} befindet sich in der Phase {phaseIcon} {phaseName} mit {illum}% Beleuchtung, am Tag {age} seines Zyklus, durch das Sternbild {zodiacIcon} {zodiacName} ziehend. {altitudeSentence}',",
  },
  // js/i18n/id.js
  {
    file: 'js/i18n/id.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): suara evergreen — tanpa \"hari ini\", menyertakan {country}.\n" +
      "        'moon.intro_template': 'Bulan di {city}, {country} saat ini berada pada fase {phaseIcon} {phaseName} dengan iluminasi {illum}%, pada hari ke-{age} siklusnya, melintasi rasi bintang {zodiacIcon} {zodiacName}. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'Bulan hari ini di {city} berada pada fase {phaseIcon} {phaseName} dengan pencahayaan {illum}%, pada hari ke-{age} siklusnya, melintasi rasi bintang {zodiacIcon} {zodiacName}. {altitudeSentence}',",
  },
  // js/i18n/es.js
  {
    file: 'js/i18n/es.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): voz evergreen — sin \"hoy\", incluye {country}.\n" +
      "        'moon.intro_template': 'La Luna en {city}, {country} se encuentra actualmente en la fase {phaseIcon} {phaseName} con un {illum}% de iluminación, en el día {age} de su ciclo, pasando por la constelación {zodiacIcon} {zodiacName}. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'La Luna hoy en {city} está en la fase {phaseIcon} {phaseName} con un {illum}% de iluminación, en el día {age} de su ciclo, pasando por la constelación {zodiacIcon} {zodiacName}. {altitudeSentence}',",
  },
  // js/i18n/bn.js
  {
    file: 'js/i18n/bn.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): evergreen — no \"আজ\", includes {country}.\n" +
      "        'moon.intro_template': '{city}, {country}-এ চাঁদ বর্তমানে {phaseIcon} {phaseName} পর্যায়ে আছে, {illum}% আলোকসজ্জা নিয়ে, চক্রের {age} দিনে, {zodiacIcon} {zodiacName} রাশির মধ্য দিয়ে। {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'আজ {city}-এ চাঁদ {phaseIcon} {phaseName} পর্যায়ে আছে, {illum}% আলোকসজ্জা নিয়ে, চক্রের {age} দিনে, {zodiacIcon} {zodiacName} রাশির মধ্য দিয়ে। {altitudeSentence}',",
  },
  // js/i18n/ms.js
  {
    file: 'js/i18n/ms.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): suara evergreen — tanpa \"hari ini\", merangkumi {country}.\n" +
      "        'moon.intro_template': 'Bulan di {city}, {country} kini berada pada fasa {phaseIcon} {phaseName} dengan pencahayaan {illum}%, pada hari ke-{age} kitarannya, melintasi buruj {zodiacIcon} {zodiacName}. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'Bulan hari ini di {city} berada pada fasa {phaseIcon} {phaseName} dengan pencahayaan {illum}%, pada hari ke-{age} kitarannya, melintasi buruj {zodiacIcon} {zodiacName}. {altitudeSentence}',",
  },

  // ── Legacy js/i18n.js: 9 langs (NOT AR — handled separately below) ──
  // EN
  {
    file: 'js/i18n.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): evergreen voice — no \"today\", includes {country}.\n" +
      "        'moon.intro_template': 'The Moon in {city}, {country} is currently in a {phaseIcon} {phaseName} phase at {illum}% illumination, on day {age} of its cycle, passing through the {zodiacIcon} {zodiacName} constellation. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'The Moon today in {city} is in a {phaseIcon} {phaseName} phase at {illum}% illumination, {age} days into its cycle, passing through the {zodiacIcon} {zodiacName} constellation. {altitudeSentence}',",
  },
  // FR
  {
    file: 'js/i18n.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): voix evergreen — pas de \"aujourd\\u2019hui\", inclut {country}.\n" +
      "        'moon.intro_template': 'La Lune à {city}, {country} est actuellement en phase {phaseIcon} {phaseName} avec {illum}% d\\u2019illumination, au jour {age} de son cycle, traversant la constellation {zodiacIcon} {zodiacName}. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'La Lune aujourd\\u2019hui à {city} est en phase {phaseIcon} {phaseName} avec {illum}% d\\u2019illumination, {age} jours dans son cycle, traversant la constellation {zodiacIcon} {zodiacName}. {altitudeSentence}',",
  },
  // TR
  {
    file: 'js/i18n.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): evergreen ses — \"bugün\" yok, {country} dahil.\n" +
      "        'moon.intro_template': 'Ay, {city}, {country} için şu anda {phaseIcon} {phaseName} evresinde ve %{illum} aydınlanmada, döngüsünün {age}. gününde, {zodiacIcon} {zodiacName} takımyıldızından geçiyor. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'Ay bugün {city} için {phaseIcon} {phaseName} evresinde ve %{illum} aydınlanmada, döngüsünün {age} gününde, {zodiacIcon} {zodiacName} takımyıldızından geçiyor. {altitudeSentence}',",
  },
  // UR
  {
    file: 'js/i18n.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): evergreen — no \"آج\"، includes {country}.\n" +
      "        'moon.intro_template': '{city}، {country} میں چاند اس وقت {phaseIcon} {phaseName} مرحلے میں ہے، {illum}٪ روشنی کے ساتھ، اپنے چکر کے {age}ویں دن، اور {zodiacIcon} {zodiacName} برج سے گزر رہا ہے۔ {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'آج {city} میں چاند {phaseIcon} {phaseName} مرحلے میں ہے، {illum}٪ روشنی کے ساتھ، اپنے چکر کے {age}ویں دن، اور {zodiacIcon} {zodiacName} برج سے گزر رہا ہے۔ {altitudeSentence}',",
  },
  // DE
  {
    file: 'js/i18n.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): evergreene Stimme — kein \"heute\", enthält {country}.\n" +
      "        'moon.intro_template': 'Der Mond in {city}, {country} befindet sich aktuell in der Phase {phaseIcon} {phaseName} mit {illum}% Beleuchtung, am Tag {age} seines Zyklus, durch das Sternbild {zodiacIcon} {zodiacName} ziehend. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'Der Mond heute in {city} befindet sich in der Phase {phaseIcon} {phaseName} mit {illum}% Beleuchtung, am Tag {age} seines Zyklus, durch das Sternbild {zodiacIcon} {zodiacName} ziehend. {altitudeSentence}',",
  },
  // ID
  {
    file: 'js/i18n.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): suara evergreen — tanpa \"hari ini\", menyertakan {country}.\n" +
      "        'moon.intro_template': 'Bulan di {city}, {country} saat ini berada pada fase {phaseIcon} {phaseName} dengan iluminasi {illum}%, pada hari ke-{age} siklusnya, melintasi rasi bintang {zodiacIcon} {zodiacName}. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'Bulan hari ini di {city} berada pada fase {phaseIcon} {phaseName} dengan pencahayaan {illum}%, pada hari ke-{age} siklusnya, melintasi rasi bintang {zodiacIcon} {zodiacName}. {altitudeSentence}',",
  },
  // ES
  {
    file: 'js/i18n.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): voz evergreen — sin \"hoy\", incluye {country}.\n" +
      "        'moon.intro_template': 'La Luna en {city}, {country} se encuentra actualmente en la fase {phaseIcon} {phaseName} con un {illum}% de iluminación, en el día {age} de su ciclo, pasando por la constelación {zodiacIcon} {zodiacName}. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'La Luna hoy en {city} está en la fase {phaseIcon} {phaseName} con un {illum}% de iluminación, en el día {age} de su ciclo, pasando por la constelación {zodiacIcon} {zodiacName}. {altitudeSentence}',",
  },
  // BN
  {
    file: 'js/i18n.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): evergreen — no \"আজ\", includes {country}.\n" +
      "        'moon.intro_template': '{city}, {country}-এ চাঁদ বর্তমানে {phaseIcon} {phaseName} পর্যায়ে আছে, {illum}% আলোকসজ্জা নিয়ে, চক্রের {age} দিনে, {zodiacIcon} {zodiacName} রাশির মধ্য দিয়ে। {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'আজ {city}-এ চাঁদ {phaseIcon} {phaseName} পর্যায়ে আছে, {illum}% আলোকসজ্জা নিয়ে, চক্রের {age} দিনে, {zodiacIcon} {zodiacName} রাশির মধ্য দিয়ে। {altitudeSentence}',",
  },
  // MS
  {
    file: 'js/i18n.js',
    cur:
      "        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23): suara evergreen — tanpa \"hari ini\", merangkumi {country}.\n" +
      "        'moon.intro_template': 'Bulan di {city}, {country} kini berada pada fasa {phaseIcon} {phaseName} dengan pencahayaan {illum}%, pada hari ke-{age} kitarannya, melintasi buruj {zodiacIcon} {zodiacName}. {altitudeSentence}',",
    orig:
      "        'moon.intro_template': 'Bulan hari ini di {city} berada pada fasa {phaseIcon} {phaseName} dengan pencahayaan {illum}%, pada hari ke-{age} kitarannya, melintasi buruj {zodiacIcon} {zodiacName}. {altitudeSentence}',",
  },
];

// ── Step 2: insert NEW hub-only keys after the original intro_template ──
// The new keys are inserted directly after the (now-restored) original key.

const HUB_INSERTS = [
  // AR — ar.js (already restored-original was never touched for these keys)
  // We'll insert after the original `moon.intro_template` line OR after my new (evergreen) line if I left it.

  // Per-lang hub keys: { file, anchor, insert }
  // anchor: the line we insert AFTER (use the original intro_template line)
  // insert: the new lines (intro_template_hub + altitude_above_hub + altitude_below_hub)
];

const HUB_BLOCKS_PER_LANG = {
  ar: {
    intro_template_hub: "'القمر في {city}، {country}، حاليًّا في طور {phaseIcon} {phaseName}، بنسبة إضاءة {illum}٪، وعمر {age} يوم من الدورة القمريّة. ويَمرّ فلكيّاً في كوكبة {zodiacIcon} {zodiacName}، وبحسب وقت التَحديث الحاليّ {altitudeSentence}'",
    altitude_above_hub: "'يَرتفع القمر فوق الأفق بنحو {alt}° باتّجاه {dir}.'",
    altitude_below_hub: "'يَكون القمر تحت الأفق بنحو {alt}°.'",
  },
  en: {
    intro_template_hub: "'The Moon in {city}, {country} is currently in a {phaseIcon} {phaseName} phase at {illum}% illumination, on day {age} of its cycle, passing through the {zodiacIcon} {zodiacName} constellation. {altitudeSentence}'",
    altitude_above_hub: "'The Moon is currently {alt}° above the horizon toward the {dir}.'",
    altitude_below_hub: "'The Moon is currently below the horizon ({alt}° below).'",
  },
  fr: {
    intro_template_hub: "'La Lune à {city}, {country} est actuellement en phase {phaseIcon} {phaseName} avec {illum}% d\\u2019illumination, au jour {age} de son cycle, traversant la constellation {zodiacIcon} {zodiacName}. {altitudeSentence}'",
    altitude_above_hub: "'La Lune se trouve actuellement à {alt}° au-dessus de l\\u2019horizon, en direction du {dir}.'",
    altitude_below_hub: "'La Lune est actuellement sous l\\u2019horizon ({alt}° en dessous).'",
  },
  tr: {
    intro_template_hub: "'Ay, {city}, {country} için şu anda {phaseIcon} {phaseName} evresinde ve %{illum} aydınlanmada, döngüsünün {age}. gününde, {zodiacIcon} {zodiacName} takımyıldızından geçiyor. {altitudeSentence}'",
    altitude_above_hub: "'Ay şu anda ufkun {alt}° üzerinde, {dir} yönünde.'",
    altitude_below_hub: "'Ay şu anda ufkun altında ({alt}° aşağıda).'",
  },
  ur: {
    intro_template_hub: "'{city}، {country} میں چاند اس وقت {phaseIcon} {phaseName} مرحلے میں ہے، {illum}٪ روشنی کے ساتھ، اپنے چکر کے {age}ویں دن، اور {zodiacIcon} {zodiacName} برج سے گزر رہا ہے۔ {altitudeSentence}'",
    altitude_above_hub: "'چاند اس وقت افق سے {alt}° اوپر، {dir} کی سمت میں ہے۔'",
    altitude_below_hub: "'چاند اس وقت افق سے نیچے ہے ({alt}° نیچے)۔'",
  },
  de: {
    intro_template_hub: "'Der Mond in {city}, {country} befindet sich aktuell in der Phase {phaseIcon} {phaseName} mit {illum}% Beleuchtung, am Tag {age} seines Zyklus, durch das Sternbild {zodiacIcon} {zodiacName} ziehend. {altitudeSentence}'",
    altitude_above_hub: "'Der Mond steht derzeit {alt}° über dem Horizont in Richtung {dir}.'",
    altitude_below_hub: "'Der Mond steht derzeit unter dem Horizont ({alt}° darunter).'",
  },
  id: {
    intro_template_hub: "'Bulan di {city}, {country} saat ini berada pada fase {phaseIcon} {phaseName} dengan iluminasi {illum}%, pada hari ke-{age} siklusnya, melintasi rasi bintang {zodiacIcon} {zodiacName}. {altitudeSentence}'",
    altitude_above_hub: "'Bulan saat ini berada {alt}° di atas cakrawala ke arah {dir}.'",
    altitude_below_hub: "'Bulan saat ini berada di bawah cakrawala ({alt}° di bawah).'",
  },
  es: {
    intro_template_hub: "'La Luna en {city}, {country} se encuentra actualmente en la fase {phaseIcon} {phaseName} con un {illum}% de iluminación, en el día {age} de su ciclo, pasando por la constelación {zodiacIcon} {zodiacName}. {altitudeSentence}'",
    altitude_above_hub: "'La Luna está actualmente a {alt}° sobre el horizonte, en dirección {dir}.'",
    altitude_below_hub: "'La Luna está actualmente bajo el horizonte ({alt}° por debajo).'",
  },
  bn: {
    intro_template_hub: "'{city}, {country}-এ চাঁদ বর্তমানে {phaseIcon} {phaseName} পর্যায়ে আছে, {illum}% আলোকসজ্জা নিয়ে, চক্রের {age} দিনে, {zodiacIcon} {zodiacName} রাশির মধ্য দিয়ে। {altitudeSentence}'",
    altitude_above_hub: "'চাঁদ বর্তমানে দিগন্ত থেকে {alt}° উপরে, {dir} দিকে রয়েছে।'",
    altitude_below_hub: "'চাঁদ বর্তমানে দিগন্তের নিচে ({alt}° নিচে)।'",
  },
  ms: {
    intro_template_hub: "'Bulan di {city}, {country} kini berada pada fasa {phaseIcon} {phaseName} dengan pencahayaan {illum}%, pada hari ke-{age} kitarannya, melintasi buruj {zodiacIcon} {zodiacName}. {altitudeSentence}'",
    altitude_above_hub: "'Bulan pada masa ini berada {alt}° di atas ufuk ke arah {dir}.'",
    altitude_below_hub: "'Bulan pada masa ini berada di bawah ufuk ({alt}° di bawah).'",
  },
};

function buildHubBlock(lang) {
  const b = HUB_BLOCKS_PER_LANG[lang];
  return (
    `        // MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 (2026-05-23):\n` +
    `        //   Hub-only keys for /moon-in-{city} (evergreen voice).\n` +
    `        //   The non-_hub variants stay anchored to "today" for the\n` +
    `        //   /moon-today and /moon-today-in-{city} routes which share\n` +
    `        //   them. app.js selects the _hub keys when _isHubPage is true.\n` +
    `        'moon.intro_template_hub': ${b.intro_template_hub},\n` +
    `        'moon.altitude_above_hub': ${b.altitude_above_hub},\n` +
    `        'moon.altitude_below_hub': ${b.altitude_below_hub},\n`
  );
}

const fileContents = new Map();
function loadFile(rel) {
  const abs = path.join(ROOT, rel);
  if (!fileContents.has(abs)) {
    fileContents.set(abs, fs.readFileSync(abs, 'utf8'));
  }
  return fileContents.get(abs);
}
function saveFile(rel, content) {
  const abs = path.join(ROOT, rel);
  fs.writeFileSync(abs, content, 'utf8');
  fileContents.set(abs, content);
}

let okCount = 0;
let alreadyCount = 0;
let missCount = 0;

// Helper: try to match `needle` in `haystack` in both LF and CRLF flavors.
function findIn(haystack, needle) {
  if (haystack.includes(needle)) return needle;
  const crlf = needle.replace(/\n/g, '\r\n');
  if (haystack.includes(crlf)) return crlf;
  return null;
}
function adaptEnding(template, matched) {
  // If the match was CRLF, convert template's \n → \r\n; else leave as-is.
  if (matched && matched.includes('\r\n')) return template.replace(/\n/g, '\r\n');
  return template;
}

// Step 1: revert intro_template back to original
for (const r of REVERTS) {
  let c = loadFile(r.file);
  const matchedCur = findIn(c, r.cur);
  const matchedOrig = findIn(c, r.orig);
  if (matchedCur) {
    const repl = adaptEnding(r.orig, matchedCur);
    c = c.replace(matchedCur, repl);
    saveFile(r.file, c);
    console.log('REVERT OK :', r.file);
    okCount++;
  } else if (matchedOrig && !matchedCur) {
    console.log('REVERT OK :', r.file, '— already reverted');
    alreadyCount++;
  } else {
    console.log('REVERT MISS:', r.file);
    missCount++;
  }
}

// Step 2: insert HUB keys after `moon.altitude_below` for each lang
// Anchor pattern (per lang): a line `'moon.altitude_below':` — we insert
//   our new block right AFTER that closing line.

const LANG_ANCHORS = {
  // ar.js: AR has different altitude_below wording
  'js/i18n/ar.js': {
    anchor: "        'moon.altitude_below': 'وبحسب وقت التَحديث الحاليّ يَكون القمر تحت الأفق ({alt}° تحته).',\n",
    block: buildHubBlock('ar'),
  },
  'js/i18n/en.js': {
    anchor: "        'moon.altitude_below': 'From your location, the Moon is currently below the horizon ({alt}° below).',\n",
    block: buildHubBlock('en'),
  },
  'js/i18n/fr.js': {
    anchor: "        'moon.altitude_below': 'Depuis votre emplacement, la Lune est actuellement sous l\\u2019horizon ({alt}° en dessous).',\n",
    block: buildHubBlock('fr'),
  },
  'js/i18n/tr.js': {
    anchor: "        'moon.altitude_below': 'Konumunuzdan Ay şu anda ufkun altında ({alt}° aşağıda).',\n",
    block: buildHubBlock('tr'),
  },
  'js/i18n/ur.js': {
    anchor: "        'moon.altitude_below': 'آپ کے مقام سے چاند اس وقت افق سے نیچے ہے ({alt}° نیچے)۔',\n",
    block: buildHubBlock('ur'),
  },
  'js/i18n/de.js': {
    anchor: "        'moon.altitude_below': 'Von Ihrem Standort aus steht der Mond derzeit unter dem Horizont ({alt}° darunter).',\n",
    block: buildHubBlock('de'),
  },
  'js/i18n/id.js': {
    anchor: "        'moon.altitude_below': 'Dari lokasi Anda, Bulan saat ini berada di bawah cakrawala ({alt}° di bawah).',\n",
    block: buildHubBlock('id'),
  },
  'js/i18n/es.js': {
    anchor: "        'moon.altitude_below': 'Desde tu ubicación, la Luna está actualmente bajo el horizonte ({alt}° por debajo).',\n",
    block: buildHubBlock('es'),
  },
  'js/i18n/bn.js': {
    anchor: "        'moon.altitude_below': 'আপনার অবস্থান থেকে চাঁদ বর্তমানে দিগন্তের নিচে ({alt}° নিচে)।',\n",
    block: buildHubBlock('bn'),
  },
  'js/i18n/ms.js': {
    anchor: "        'moon.altitude_below': 'Dari lokasi anda, Bulan pada masa ini berada di bawah ufuk ({alt}° di bawah).',\n",
    block: buildHubBlock('ms'),
  },
};

for (const [file, info] of Object.entries(LANG_ANCHORS)) {
  let c = loadFile(file);
  // Idempotent check — block contains the unique key `moon.intro_template_hub`
  if (c.includes(`'moon.intro_template_hub'`)) {
    console.log('HUB-INSERT OK :', file, '— already inserted');
    alreadyCount++;
    continue;
  }
  const matchedAnchor = findIn(c, info.anchor);
  if (matchedAnchor) {
    const blockAdapted = adaptEnding(info.block, matchedAnchor);
    c = c.replace(matchedAnchor, matchedAnchor + blockAdapted);
    saveFile(file, c);
    console.log('HUB-INSERT OK :', file);
    okCount++;
  } else {
    console.log('HUB-INSERT MISS:', file);
    missCount++;
  }
}

// Step 3: same inserts for legacy js/i18n.js — 10 lang blocks.
// The legacy bundle has each lang in its own object. We anchor on the
// moon.altitude_below value PER lang. To stay idempotent we check for
// the unique hub key in the same block (use lang-specific marker).

const LEGACY_PER_LANG_ANCHORS = [
  {
    lang: 'ar',
    anchor: "        'moon.altitude_below': 'وبحسب وقت التَحديث الحاليّ يَكون القمر تحت الأفق ({alt}° تحته).',\n",
  },
  {
    lang: 'en',
    anchor: "        'moon.altitude_below': 'From your location, the Moon is currently below the horizon ({alt}° below).',\n",
  },
  {
    lang: 'fr',
    anchor: "        'moon.altitude_below': 'Depuis votre emplacement, la Lune est actuellement sous l\\u2019horizon ({alt}° en dessous).',\n",
  },
  {
    lang: 'tr',
    anchor: "        'moon.altitude_below': 'Konumunuzdan Ay şu anda ufkun altında ({alt}° aşağıda).',\n",
  },
  {
    lang: 'ur',
    anchor: "        'moon.altitude_below': 'آپ کے مقام سے چاند اس وقت افق سے نیچے ہے ({alt}° نیچے)۔',\n",
  },
  {
    lang: 'de',
    anchor: "        'moon.altitude_below': 'Von Ihrem Standort aus steht der Mond derzeit unter dem Horizont ({alt}° darunter).',\n",
  },
  {
    lang: 'id',
    anchor: "        'moon.altitude_below': 'Dari lokasi Anda, Bulan saat ini berada di bawah cakrawala ({alt}° di bawah).',\n",
  },
  {
    lang: 'es',
    anchor: "        'moon.altitude_below': 'Desde tu ubicación, la Luna está actualmente bajo el horizonte ({alt}° por debajo).',\n",
  },
  {
    lang: 'bn',
    anchor: "        'moon.altitude_below': 'আপনার অবস্থান থেকে চাঁদ বর্তমানে দিগন্তের নিচে ({alt}° নিচে)।',\n",
  },
  {
    lang: 'ms',
    anchor: "        'moon.altitude_below': 'Dari lokasi anda, Bulan pada masa ini berada di bawah ufuk ({alt}° di bawah).',\n",
  },
];

let legacy = loadFile('js/i18n.js');
const beforeLen = legacy.length;
for (const entry of LEGACY_PER_LANG_ANCHORS) {
  const block = buildHubBlock(entry.lang);
  // Idempotent: must check the FULL hub key declaration `'moon.intro_template_hub':`
  // (NOT just the value) to avoid false-positives from the regular
  // intro_template having the same value text (which it does until reverted).
  const uniqMark = "'moon.intro_template_hub': " + HUB_BLOCKS_PER_LANG[entry.lang].intro_template_hub;
  if (legacy.includes(uniqMark)) {
    console.log(`LEGACY HUB-INSERT OK : js/i18n.js[${entry.lang}] — already inserted`);
    alreadyCount++;
    continue;
  }
  const matchedAnchor = findIn(legacy, entry.anchor);
  if (matchedAnchor) {
    const blockAdapted = adaptEnding(block, matchedAnchor);
    legacy = legacy.replace(matchedAnchor, matchedAnchor + blockAdapted);
    console.log(`LEGACY HUB-INSERT OK : js/i18n.js[${entry.lang}]`);
    okCount++;
  } else {
    console.log(`LEGACY HUB-INSERT MISS: js/i18n.js[${entry.lang}]`);
    missCount++;
  }
}
if (legacy.length !== beforeLen) {
  saveFile('js/i18n.js', legacy);
}

console.log('\nSUMMARY:', { okCount, alreadyCount, missCount });
if (missCount > 0) process.exit(1);
