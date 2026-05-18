// scripts/_test_fill_lang_map.mjs
// PLACE-NAMES-L10N-PIPELINE-GUARD-1 — unit test for fillLangMap behavior.
//
// Asserts the new pipeline-guard rules:
//   1. `en` is always present (filled from fallback if absent)
//   2. `ar` is present only if `partial.ar` is provided
//   3. All 8 other langs (fr/de/tr/ur/id/es/bn/ms) are present
//      ONLY if explicitly provided in `partial` — never auto-filled
//      from the fallback
//   4. Seed-style input (all 10 langs provided) is preserved verbatim
//      — no values dropped, no values overwritten
//
// This test runs as a pure unit test against the imported function —
// no server boot needed, no curated-places.json touched.
import assert from 'node:assert/strict';
import { fillLangMap, SUPPORTED_LANGS } from '../scripts/geodata/_geonames_common.mjs';

let pass = 0, fail = 0;
const failures = [];

function check(name, fn) {
    try {
        fn();
        pass++;
        console.log('  ✓ ' + name);
    } catch (e) {
        fail++;
        failures.push({ name, error: e.message });
        console.log('  ✗ ' + name);
        console.log('     ' + (e.message || e));
    }
}

console.log('═══ PLACE-NAMES-L10N-PIPELINE-GUARD-1 — fillLangMap unit tests ═══\n');

console.log('── Group 1: the bug we just fixed ──');

check('only { en, ar } provided → output has en + ar ONLY (no ur/bn/fr/de/es/tr/id/ms fillchain)', () => {
    const result = fillLangMap({ ar: 'تشاريكار', en: 'Charikar' }, 'Charikar');
    // en + ar present
    assert.equal(result.en, 'Charikar');
    assert.equal(result.ar, 'تشاريكار');
    // All other langs ABSENT — not filled with 'Charikar'
    assert.equal(result.ur, undefined, 'names.ur must be absent (was the bug)');
    assert.equal(result.bn, undefined, 'names.bn must be absent (was the bug)');
    assert.equal(result.fr, undefined, 'names.fr must be absent');
    assert.equal(result.de, undefined, 'names.de must be absent');
    assert.equal(result.es, undefined, 'names.es must be absent');
    assert.equal(result.tr, undefined, 'names.tr must be absent');
    assert.equal(result.id, undefined, 'names.id must be absent');
    assert.equal(result.ms, undefined, 'names.ms must be absent');
});

check('only { en } provided → output has en ONLY', () => {
    const result = fillLangMap({ en: 'Kandahar' }, 'Kandahar');
    assert.equal(result.en, 'Kandahar');
    assert.equal(result.ar, undefined);
    assert.equal(result.ur, undefined);
    assert.equal(result.bn, undefined);
    assert.equal(Object.keys(result).length, 1);
});

check('empty partial + fallback → output has en === fallback ONLY', () => {
    const result = fillLangMap({}, 'Unknown');
    assert.equal(result.en, 'Unknown');
    assert.equal(result.ar, undefined);
    assert.equal(result.ur, undefined);
    assert.equal(Object.keys(result).length, 1);
});

check('null partial + fallback → output has en === fallback ONLY', () => {
    const result = fillLangMap(null, 'Unknown');
    assert.equal(result.en, 'Unknown');
    assert.equal(Object.keys(result).length, 1);
});

console.log('');
console.log('── Group 2: seed-style input preservation ──');

check('all 10 langs provided → all 10 preserved verbatim (no drops, no overwrites)', () => {
    const partial = {
        ar: 'مكة المكرمة',  en: 'Mecca',          fr: 'La Mecque',
        de: 'Mekka',         tr: 'Mekke',          ur: 'مکہ',
        id: 'Mekkah',        es: 'La Meca',        bn: 'মক্কা',
        ms: 'Mekah'
    };
    const result = fillLangMap(partial, 'Mecca');
    for (const lang of SUPPORTED_LANGS) {
        assert.equal(result[lang], partial[lang],
            `names.${lang} must be preserved verbatim (got ${result[lang]}, want ${partial[lang]})`);
    }
});

check('partial { en, ar, ur } → all three preserved; rest absent', () => {
    const result = fillLangMap({ ar: 'تہران', en: 'Tehran', ur: 'تہران' }, 'Tehran');
    assert.equal(result.en, 'Tehran');
    assert.equal(result.ar, 'تہران');
    assert.equal(result.ur, 'تہران');
    assert.equal(result.bn, undefined);
    assert.equal(result.fr, undefined);
});

check('partial with names.ur === names.en (explicit Latin) → preserved as-is (caller responsibility)', () => {
    // Edge case: if a caller deliberately passes { ur: 'Charikar', en: 'Charikar' },
    // fillLangMap doesn't second-guess it — it preserves whatever was provided.
    // The fillchain bug arose because the CALLER (normalize_places.mjs) was passing
    // ONLY { ar, en } and relying on fillLangMap to cascade. Now it can't.
    const result = fillLangMap({ ur: 'X', en: 'X', ar: 'Y' }, 'X');
    assert.equal(result.ur, 'X', 'fillLangMap is non-judgmental about explicit inputs');
    assert.equal(result.en, 'X');
    assert.equal(result.ar, 'Y');
});

console.log('');
console.log('── Group 3: regression vs the original (broken) behavior ──');

check('the original CALLER (normalize_places) pattern no longer produces fillchain', () => {
    // This mirrors the exact call shape from scripts/geodata/normalize_places.mjs:95
    //   const namesPartial = { ar: arName, en: enName };
    //   const names = fillLangMap(namesPartial, enName);
    const arName = 'تشاريكار';
    const enName = 'Charikar';
    const namesPartial = { ar: arName, en: enName };
    const result = fillLangMap(namesPartial, enName);

    // The 8 lang slots that used to be filled with enName must now be ABSENT.
    const langs = ['fr', 'de', 'tr', 'ur', 'id', 'es', 'bn', 'ms'];
    for (const l of langs) {
        assert.equal(result[l], undefined,
            `Regression: names.${l} should be absent but got "${result[l]}". ` +
            `The fillchain bug has returned.`);
    }
    // en and ar should still be there.
    assert.equal(result.en, 'Charikar');
    assert.equal(result.ar, 'تشاريكار');
});

check('the test for Charikar specifically: names.ur !== names.en (the user-reported bug)', () => {
    const result = fillLangMap({ ar: 'تشاريكار', en: 'Charikar' }, 'Charikar');
    assert.notEqual(result.ur, result.en,
        'names.ur must NOT equal names.en for the Charikar example. This was the user-reported bug.');
    // (Specifically: names.ur should be undefined now.)
    assert.equal(result.ur, undefined);
});

console.log('');
console.log('── Group 4: bare-minimum sanity ──');

check('SUPPORTED_LANGS exports correctly (10 langs in expected order)', () => {
    assert.deepEqual(SUPPORTED_LANGS,
        ['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'es', 'bn', 'ms']);
});

check('fillLangMap returns an object (never null/undefined)', () => {
    const r1 = fillLangMap(null, 'X');
    const r2 = fillLangMap(undefined, 'X');
    const r3 = fillLangMap({}, 'X');
    assert.equal(typeof r1, 'object');
    assert.equal(typeof r2, 'object');
    assert.equal(typeof r3, 'object');
});

console.log('');
console.log('═'.repeat(60));
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + (pass + fail) + ')');

if (fail > 0) {
    console.log('');
    console.log('Failures:');
    for (const f of failures) {
        console.log('  ' + f.name + ' — ' + f.error);
    }
}

process.exit(fail === 0 ? 0 : 1);
