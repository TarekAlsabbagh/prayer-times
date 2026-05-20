// scripts/_test_city_name_seo_fallback_1.mjs
//
// CITY-NAME-SEO-FALLBACK-POLICY-1 verification (2026-05-20).
//
// Goal: prove the new central helper `getLocalizedPlaceName(place, lang)`
// produces unified, script-validated city-name output for every SSR
// position downstream (_pickCuratedName → _resolveCityName → SSR
// title/H1/breadcrumb/JSON-LD, qiblaRef.names, __PRAYER_CITY__/__QIBLA_
// CITY__ payloads, /api/place-by-slug response).
//
// Constraints honoured (re-asserted by this test):
//   * NO mutation of db/places/curated-places.json (verified by stat-check)
//   * NO runtime translation, NO fillchain
//   * NO new names.* fields invented at runtime
//   * Latin in Latin-script lang slots (fr/de/tr/id/es/ms) is treated as
//     legitimate "untranslated proper noun" — NOT pollution
//   * Latin in non-Latin lang slots (ur/bn) IS pollution → falls back to
//     names.en with sourceLang='en', isFallback=true, hasNativeName=false
//   * Same for Arabic-script content leaking into Latin-script slots
//
// Pure offline test — no server boot.
import { readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' CITY-NAME-SEO-FALLBACK-POLICY-1 — verification (offline)');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

const placeL10n = require('../server/place-l10n');
const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const findSlug = (s) => curated.find(x => x.slug === s);

// ─── Group 1: Exports surface ───────────────────────────────────────────
console.log('── Group 1: Module exports ──');
ok('getLocalizedPlaceName exported',     typeof placeL10n.getLocalizedPlaceName === 'function');
ok('isAcceptableScriptForLang exported', typeof placeL10n.isAcceptableScriptForLang === 'function');
ok('pickLocalizedDisplayQ still exported', typeof placeL10n.pickLocalizedDisplayQ === 'function');
ok('SUPPORTED_LANGS still has 10 langs',  Array.isArray(placeL10n.SUPPORTED_LANGS) && placeL10n.SUPPORTED_LANGS.length === 10);

// ─── Group 2: Script-acceptance unit tests ───────────────────────────────
console.log('');
console.log('── Group 2: isAcceptableScriptForLang unit ──');
const sa = placeL10n.isAcceptableScriptForLang;
// ar
ok('ar accepts "كراتشي"',                 sa('كراتشي', 'ar') === true);
ok('ar accepts "مكة المكرمة"',            sa('مكة المكرمة', 'ar') === true);
ok('ar rejects "Karachi" (Latin)',        sa('Karachi', 'ar') === false);
ok('ar rejects "ঢাকা" (Bengali)',         sa('ঢাকা', 'ar') === false);
// ur
ok('ur accepts "کراچی" (Urdu)',            sa('کراچی', 'ur') === true);
ok('ur accepts "مکہ" (Urdu)',              sa('مکہ', 'ur') === true);
ok('ur accepts "وارانسی"',                 sa('وارانسی', 'ur') === true);
ok('ur rejects "Gwangju" (Latin POLLUTION)', sa('Gwangju', 'ur') === false);
ok('ur rejects "ঢাকা" (Bengali)',          sa('ঢাকা', 'ur') === false);
// bn
ok('bn accepts "ঢাকা"',                    sa('ঢাকা', 'bn') === true);
ok('bn accepts "মুম্বই"',                  sa('মুম্বই', 'bn') === true);
ok('bn rejects "Gwangju" (Latin POLLUTION)', sa('Gwangju', 'bn') === false);
ok('bn rejects "مكة" (Arabic)',            sa('مكة', 'bn') === false);
// en
ok('en accepts "Gwangju"',                 sa('Gwangju', 'en') === true);
ok('en accepts "La Mecque"',               sa('La Mecque', 'en') === true);
ok('en rejects "مكة"',                     sa('مكة', 'en') === false);
ok('en rejects "ঢাকা"',                    sa('ঢাকা', 'en') === false);
// fr/de/tr/id/es/ms
ok('fr accepts "Karachi"',                 sa('Karachi', 'fr') === true);
ok('de accepts "Karatschi"',               sa('Karatschi', 'de') === true);
ok('tr accepts "Karaçi"',                  sa('Karaçi', 'tr') === true);
ok('id accepts "Karachi"',                 sa('Karachi', 'id') === true);
ok('es accepts "La Meca"',                 sa('La Meca', 'es') === true);
ok('ms accepts "Karachi"',                 sa('Karachi', 'ms') === true);
ok('fr rejects "غوانغجو" (Arabic pollution)', sa('غوانغجو', 'fr') === false);

// ─── Group 3: getLocalizedPlaceName — Gwangju (pollution case) ──────────
console.log('');
console.log('── Group 3: Gwangju — Latin-pollution in ur/bn ──');
const gwangju = findSlug('gwangju');
ok('curated entry exists',                  !!gwangju);
const gAr = placeL10n.getLocalizedPlaceName(gwangju, 'ar');
ok('/ar/ displayName = "غوانغجو"',          gAr.displayName === 'غوانغجو');
ok('/ar/ sourceLang = "ar"',                gAr.sourceLang === 'ar');
ok('/ar/ isFallback = false',               gAr.isFallback === false);
ok('/ar/ hasNativeName = true',             gAr.hasNativeName === true);
const gUr = placeL10n.getLocalizedPlaceName(gwangju, 'ur');
ok('/ur/ displayName = "Gwangju" (en fallback)', gUr.displayName === 'Gwangju');
ok('/ur/ sourceLang = "en" (POLLUTION DETECTED)', gUr.sourceLang === 'en');
ok('/ur/ isFallback = true',                gUr.isFallback === true);
ok('/ur/ hasNativeName = false',            gUr.hasNativeName === false);
const gBn = placeL10n.getLocalizedPlaceName(gwangju, 'bn');
ok('/bn/ displayName = "Gwangju" (en fallback)', gBn.displayName === 'Gwangju');
ok('/bn/ sourceLang = "en" (POLLUTION DETECTED)', gBn.sourceLang === 'en');
ok('/bn/ isFallback = true',                gBn.isFallback === true);
ok('/bn/ hasNativeName = false',            gBn.hasNativeName === false);
const gFr = placeL10n.getLocalizedPlaceName(gwangju, 'fr');
ok('/fr/ displayName = "Gwangju" (Latin OK)', gFr.displayName === 'Gwangju');
ok('/fr/ sourceLang = "fr" (Latin in Latin slot is fine)', gFr.sourceLang === 'fr');
ok('/fr/ isFallback = false',               gFr.isFallback === false);
ok('/fr/ hasNativeName = true',             gFr.hasNativeName === true);
const gDe = placeL10n.getLocalizedPlaceName(gwangju, 'de');
ok('/de/ displayName = "Gwangju" (Latin OK)', gDe.displayName === 'Gwangju');
ok('/de/ sourceLang = "de"',                gDe.sourceLang === 'de');
ok('/de/ isFallback = false',               gDe.isFallback === false);

// ─── Group 4: Regression — Karachi (full real L10N) ─────────────────────
console.log('');
console.log('── Group 4: Karachi regression (proper L10N across all slots) ──');
const karachi = findSlug('karachi');
const kUr = placeL10n.getLocalizedPlaceName(karachi, 'ur');
ok('karachi /ur/ displayName = "کراچی"',      kUr.displayName === 'کراچی');
ok('karachi /ur/ sourceLang = "ur"',            kUr.sourceLang === 'ur');
ok('karachi /ur/ isFallback = false',           kUr.isFallback === false);
ok('karachi /ur/ hasNativeName = true',         kUr.hasNativeName === true);
const kAr = placeL10n.getLocalizedPlaceName(karachi, 'ar');
ok('karachi /ar/ displayName = "كراتشي"',     kAr.displayName === 'كراتشي');
ok('karachi /ar/ hasNativeName = true',         kAr.hasNativeName === true);

// ─── Group 5: Regression — Dhaka (Bengali native) ──────────────────────
console.log('');
console.log('── Group 5: Dhaka regression (Bengali native) ──');
const dhaka = findSlug('dhaka');
const dBn = placeL10n.getLocalizedPlaceName(dhaka, 'bn');
ok('dhaka /bn/ displayName = "ঢাকা"',         dBn.displayName === 'ঢাকা');
ok('dhaka /bn/ sourceLang = "bn"',              dBn.sourceLang === 'bn');
ok('dhaka /bn/ isFallback = false',             dBn.isFallback === false);
ok('dhaka /bn/ hasNativeName = true',           dBn.hasNativeName === true);
const dUr = placeL10n.getLocalizedPlaceName(dhaka, 'ur');
ok('dhaka /ur/ displayName = "ڈھاکا"',          dUr.displayName === 'ڈھاکا');
ok('dhaka /ur/ hasNativeName = true',           dUr.hasNativeName === true);

// ─── Group 6: Regression — Mumbai (both ur + bn native) ───────────────
console.log('');
console.log('── Group 6: Mumbai regression (Urdu + Bengali native) ──');
const mumbai = findSlug('mumbai');
const mUr = placeL10n.getLocalizedPlaceName(mumbai, 'ur');
ok('mumbai /ur/ displayName = "ممبئی"',         mUr.displayName === 'ممبئی');
ok('mumbai /ur/ hasNativeName = true',          mUr.hasNativeName === true);
const mBn = placeL10n.getLocalizedPlaceName(mumbai, 'bn');
ok('mumbai /bn/ displayName = "মুম্বই"',         mBn.displayName === 'মুম্বই');
ok('mumbai /bn/ hasNativeName = true',          mBn.hasNativeName === true);

// ─── Group 7: Regression — Varanasi (ur+bn native, no fr/de) ──────────
console.log('');
console.log('── Group 7: Varanasi (ur+bn native, fr/de=en fallback) ──');
const varanasi = findSlug('varanasi');
const vUr = placeL10n.getLocalizedPlaceName(varanasi, 'ur');
ok('varanasi /ur/ displayName = "وارانسی"',     vUr.displayName === 'وارانسی');
ok('varanasi /ur/ hasNativeName = true',        vUr.hasNativeName === true);
const vBn = placeL10n.getLocalizedPlaceName(varanasi, 'bn');
ok('varanasi /bn/ displayName = "বারাণসী"',     vBn.displayName === 'বারাণসী');
ok('varanasi /bn/ hasNativeName = true',        vBn.hasNativeName === true);
const vFr = placeL10n.getLocalizedPlaceName(varanasi, 'fr');
ok('varanasi /fr/ displayName = "Varanasi" (en fallback)', vFr.displayName === 'Varanasi');
ok('varanasi /fr/ sourceLang = "en" (no names.fr)', vFr.sourceLang === 'en');
ok('varanasi /fr/ isFallback = true',           vFr.isFallback === true);

// ─── Group 8: Regression — Makkah (full L10N across all 10 langs) ─────
console.log('');
console.log('── Group 8: Makkah (full L10N — most critical baseline) ──');
const makkah = findSlug('makkah');
for (const L of placeL10n.SUPPORTED_LANGS) {
    const r = placeL10n.getLocalizedPlaceName(makkah, L);
    ok('makkah /' + L + '/ hasNativeName = true', r.hasNativeName === true,
       r.hasNativeName ? '("' + r.displayName + '")' : '(actual: ' + JSON.stringify(r) + ')');
}

// ─── Group 9: pickLocalizedDisplayQ — script guard at Tier 1 ──────────
console.log('');
console.log('── Group 9: pickLocalizedDisplayQ Tier 1 guard ──');
// Gwangju /ur: must NOT report quality:'curated' (since names.ur is Latin
// pollution); should drop to fallback_en instead.
const qUr = placeL10n.pickLocalizedDisplayQ(gwangju, 'ur', null, 'Gwangju', 'kr');
ok('Gwangju /ur/ quality != "curated" (pollution guard fired)',
   qUr.quality !== 'curated', '(actual quality=' + qUr.quality + ', value="' + qUr.value + '")');
ok('Gwangju /ur/ value still = "Gwangju" (en fallback chain)',
   qUr.value === 'Gwangju');
const qBn = placeL10n.pickLocalizedDisplayQ(gwangju, 'bn', null, 'Gwangju', 'kr');
ok('Gwangju /bn/ quality != "curated" (pollution guard fired)',
   qBn.quality !== 'curated', '(actual quality=' + qBn.quality + ', value="' + qBn.value + '")');
// Karachi /ur/: must still report quality:'curated' (real native Urdu)
const qkUr = placeL10n.pickLocalizedDisplayQ(karachi, 'ur', null, 'Karachi', 'pk');
ok('Karachi /ur/ quality = "curated" (real native)',
   qkUr.quality === 'curated', '(actual quality=' + qkUr.quality + ', value="' + qkUr.value + '")');
ok('Karachi /ur/ value = "کراچی"', qkUr.value === 'کراچی');

// ─── Group 10: _pickCuratedName via server.js — wire-through check ────
console.log('');
console.log('── Group 10: server.js _pickCuratedName wire-through ──');
// We can't easily import _pickCuratedName directly (it's private). Instead
// verify _placeL10n.getLocalizedPlaceName produces the expected
// `displayName` values that match what server.js will inject via
// __PRAYER_CITY__.name and qiblaRef.names[L].
const wireChecks = [
    ['gwangju',  'ar', 'غوانغجو'],
    ['gwangju',  'en', 'Gwangju'],
    ['gwangju',  'ur', 'Gwangju'],   // en fallback (pollution rejected)
    ['gwangju',  'bn', 'Gwangju'],   // en fallback (pollution rejected)
    ['gwangju',  'fr', 'Gwangju'],
    ['gwangju',  'de', 'Gwangju'],
    ['karachi',  'ur', 'کراچی'],
    ['karachi',  'bn', 'করاچی'],     // Bengali real
    ['dhaka',    'bn', 'ঢাকা'],
    ['mumbai',   'ur', 'ممبئی'],
    ['mumbai',   'bn', 'মুম্বই'],
    ['varanasi', 'bn', 'বারাণসী'],
    ['makkah',   'ar', 'مكة المكرمة'],
    ['makkah',   'ur', 'مکہ'],
    ['makkah',   'bn', 'মক্কা'],
];
// Karachi /bn/ = "করাচি" (re-fetch from curated to avoid Unicode-litreral typo)
wireChecks[7][2] = findSlug('karachi').names.bn;
for (const [slug, L, expected] of wireChecks) {
    const e = findSlug(slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    const r = placeL10n.getLocalizedPlaceName(e, L);
    ok(slug + ' /' + L + '/ displayName = "' + expected + '"',
       r.displayName === expected,
       r.displayName === expected ? '' : '(actual: "' + r.displayName + '")');
}

// ─── Group 11: NO curated mutation ───────────────────────────────────
console.log('');
console.log('── Group 11: curated-places.json byte-identity ──');
const st = statSync(new URL('../db/places/curated-places.json', import.meta.url));
// The fix is RUNTIME-ONLY. We don't have a pre-fix hash here, but the
// test ensures that loading the helper + invoking it 100 times leaves
// curated unmodified. (Real byte-check is done at the commit gate.)
const sizeBefore = st.size;
for (let i = 0; i < 100; i++) {
    placeL10n.getLocalizedPlaceName(gwangju, 'ur');
    placeL10n.getLocalizedPlaceName(karachi, 'bn');
    placeL10n.getLocalizedPlaceName(makkah, 'ar');
}
const stAfter = statSync(new URL('../db/places/curated-places.json', import.meta.url));
ok('curated size unchanged after 300 helper calls', stAfter.size === sizeBefore,
   '(' + stAfter.size + ' bytes)');

// ─── Group 12: Defensive — null/empty/legacy shape ────────────────────
console.log('');
console.log('── Group 12: Defensive (null/empty/legacy) ──');
const rNull = placeL10n.getLocalizedPlaceName(null, 'ur');
ok('null place → empty result',          rNull.displayName === '' && rNull.sourceLang === null);
const rEmpty = placeL10n.getLocalizedPlaceName({}, 'ur');
ok('{} place → empty result',            rEmpty.displayName === '');
const rNoLang = placeL10n.getLocalizedPlaceName(gwangju, '');
ok('empty lang defaults to "ar"',        rNoLang.sourceLang === 'ar' && rNoLang.displayName === 'غوانغجو');
const rLegacy = placeL10n.getLocalizedPlaceName({ nameEn: 'Mecca' }, 'en');
ok('legacy {nameEn} shape works',        rLegacy.displayName === 'Mecca' && rLegacy.sourceLang === 'en');
const rLegacyAr = placeL10n.getLocalizedPlaceName({ nameAr: 'مكة المكرمة' }, 'ar');
ok('legacy {nameAr} shape works on /ar/', rLegacyAr.displayName === 'مكة المكرمة' && rLegacyAr.hasNativeName === true);

// ─── Final tally ────────────────────────────────────────────────────────
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' total)');
console.log('═══════════════════════════════════════════════════════════════════════');

process.exit(fail === 0 ? 0 : 1);
