#!/usr/bin/env node
/* Unit test for server/place-display-normalize.js (PALESTINE-DISPLAY-NORMALIZATION-FIX-1).
 * Pure-function test — no server, no Supabase, no network. */
import mod from '../server/place-display-normalize.js';   // CJS default import
const { normalizeResultDisplay, normalizeStorePayload, isIsraelCc, normalizeCcForDisplay, palestineName, PALESTINE_DISPLAY } = mod;

let pass = 0, fail = 0;
const eq = (got, want, msg) => { if (got === want) pass++; else { fail++; console.error(`FAIL ${msg}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); } };
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error(`FAIL ${msg}`); } };

// 1) il → ps + Palestine name + 🇵🇸, across langs (the forbidden Israel/🇮🇱 must vanish)
let r = normalizeResultDisplay({ countryCode: 'il', countryName: 'Israel',   countryFlag: '🇮🇱', slug: 'tel-aviv', lat: 32.08, lng: 34.78, timezone: 'Asia/Jerusalem' }, 'en');
eq(r.countryCode, 'ps', 'il/en cc→ps'); eq(r.countryName, 'Palestine', 'il/en name'); eq(r.countryFlag, '🇵🇸', 'il/en flag');
eq(r.lat, 32.08, 'il/en lat preserved'); eq(r.timezone, 'Asia/Jerusalem', 'il/en tz preserved (calc untouched)');
r = normalizeResultDisplay({ countryCode: 'IL', countryName: 'إسرائيل', countryFlag: '🇮🇱' }, 'ar');
eq(r.countryCode, 'ps', 'IL/ar cc→ps (uppercase)'); eq(r.countryName, 'فلسطين', 'il/ar name'); eq(r.countryFlag, '🇵🇸', 'il/ar flag');
eq(normalizeResultDisplay({ countryCode: 'il' }, 'de').countryName, 'Palästina', 'il/de name');
eq(normalizeResultDisplay({ countryCode: 'il' }, 'bn').countryName, 'ফিলিস্তিন', 'il/bn name');
eq(normalizeResultDisplay({ countryCode: 'il' }, 'tr').countryName, 'Filistin', 'il/tr name');

// 2) ps → keep cc/flag but force the clean Palestine name (8 langs stop falling to Intl long form)
r = normalizeResultDisplay({ countryCode: 'ps', countryName: 'Palästinensische Autonomiegebiete', countryFlag: '🇵🇸' }, 'de');
eq(r.countryCode, 'ps', 'ps/de cc stays ps'); eq(r.countryName, 'Palästina', 'ps/de name cleaned');
eq(normalizeResultDisplay({ countryCode: 'ps', countryName: 'الأراضي الفلسطينية' }, 'ar').countryName, 'فلسطين', 'ps/ar name cleaned');

// 3) other countries — never touched
r = normalizeResultDisplay({ countryCode: 'sa', countryName: 'السعودية', countryFlag: '🇸🇦' }, 'ar');
eq(r.countryCode, 'sa', 'sa cc untouched'); eq(r.countryName, 'السعودية', 'sa name untouched'); eq(r.countryFlag, '🇸🇦', 'sa flag untouched');
eq(normalizeResultDisplay({ countryCode: 'ma', countryName: 'Morocco' }, 'en').countryName, 'Morocco', 'ma untouched');

// 4) helpers
ok(isIsraelCc('il') && isIsraelCc('IL') && isIsraelCc(' Il '), 'isIsraelCc true variants');
ok(!isIsraelCc('ps') && !isIsraelCc('us') && !isIsraelCc(''), 'isIsraelCc false variants');
eq(normalizeCcForDisplay('il'), 'ps', 'normalizeCc il→ps'); eq(normalizeCcForDisplay('sa'), 'sa', 'normalizeCc passthrough');

// 5) palestineName matches the approved 10-lang list exactly
const APPROVED = { ar:'فلسطين', en:'Palestine', fr:'Palestine', tr:'Filistin', ur:'فلسطین', de:'Palästina', id:'Palestina', es:'Palestina', bn:'ফিলিস্তিন', ms:'Palestin' };
for (const [l, v] of Object.entries(APPROVED)) eq(palestineName(l), v, `palestineName(${l})`);
eq(palestineName('xx'), 'Palestine', 'palestineName unknown→en');

// 6) store payload: il→ps + admin.country→Palestine map, geo/tz/names preserved
let p = normalizeStorePayload({ countryCode: 'il', admin: { country: { en: 'Israel' }, originalName: 'Tel Aviv' }, names: { en: 'Tel Aviv-Yafo' }, lat: 32.08, lng: 34.78, timezone: 'Asia/Jerusalem' });
eq(p.countryCode, 'ps', 'store il cc→ps');
eq(p.admin.country.en, 'Palestine', 'store admin.country.en→Palestine'); eq(p.admin.country.ar, 'فلسطين', 'store admin.country.ar→فلسطين');
eq(p.admin.originalName, 'Tel Aviv', 'store keeps admin.originalName'); eq(p.names.en, 'Tel Aviv-Yafo', 'store keeps city names (not country)');
eq(p.lat, 32.08, 'store keeps lat'); eq(p.timezone, 'Asia/Jerusalem', 'store keeps timezone');
p = normalizeStorePayload({ countryCode: 'sa', admin: { country: { ar: 'السعودية' } }, lat: 24.7, lng: 46.7, timezone: 'Asia/Riyadh' });
eq(p.countryCode, 'sa', 'store sa untouched'); eq(p.admin.country.ar, 'السعودية', 'store sa admin untouched');

// 7) null/garbage safety
ok(normalizeResultDisplay(null, 'en') === null, 'null result safe');
ok(normalizeStorePayload(undefined) === undefined, 'undefined payload safe');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
