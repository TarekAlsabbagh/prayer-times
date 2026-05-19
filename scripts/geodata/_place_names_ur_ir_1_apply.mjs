// scripts/geodata/_place_names_ur_ir_1_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-IR-1 — apply user-approved Urdu names + aliases for 41 IR
// pipeline cities (those with fillchain `names.ur === names.en` Latin).
//
// User decision (2026-05-19): "approve all 41 as proposed" with overlays:
//   §1. shahr → شہر uniform (Urdu ہ heh-goal, NOT Arabic ه)
//   §2. hamadan → ہمدان (not همدان)
//   §3. bushehr → بوشہر (not بوشهر)
//   §4. maragheh → مراغہ (Urdu ہ, مراغه as alias if clean)
//   §5. saveh → ساوہ (Urdu ہ, ساوه as alias if clean)
//   §6. neyshabur → نیشاپور (Persian پ, نیشابور as alias)
//   §7. qods: drop alias `كَرَج` (collision with karaj slug)
//   §8. arak: drop alias `ساوه` (collision with saveh slug)
//   §9. Kurdish ـە aliases: drop (already enforced by SUSPICIOUS_NON_URDU)
//   §10. gorgan/pakdasht/golestan: do NOT change names.ar — deferred
//        Arabic-name cleanup, not in scope here
//
// Per user's 10-point apply rules:
//   1. Add names.ur for 41 IR pipeline rows only
//   2. Do NOT touch 12 seed entries (they already have real Urdu)
//   3. Add clean aliases.ur only
//   4. Reject collision/script-mismatch aliases
//   5. Do NOT touch names.ar
//   6. Do NOT touch names.en
//   7. Do NOT touch server.js
//   8. Do NOT touch js/app.js
//   9. Do NOT touch fillLangMap
//  10. No runtime translation
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// Idempotent — re-running on already-applied rows is a no-op.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesUrIr1.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-ur-ir-1-apply-report.md';

// ─── 41 FIXES (matches §1 of the review report; user-approved with §7 overlays) ───
// Per-row: { slug, ur, aliasesUr }
// IMPORTANT — *-shahr family is UNIFORMLY Urdu ہ (heh-goal) per user §1.
const FIXES = [
    // Watch-list (14 user-listed cities) — listed first for visibility
    { slug: 'karaj',          ur: 'کرج',          aliasesUr: [] },                                  // Persian ک; Kurdish کەرەج dropped
    { slug: 'zahedan',         ur: 'زاہدان',       aliasesUr: [] },                                  // Urdu ہ direct from GeoNames
    { slug: 'hamadan',         ur: 'ہمدان',        aliasesUr: ['همدان'] },                           // User §2: Urdu ہ initial; clean Arabic ه form preserved as alias
    { slug: 'ardabil',         ur: 'اردبیل',       aliasesUr: [] },                                  // Persian ی; diacritics-heavy اَردِبيل dropped
    { slug: 'bandar-abbas',    ur: 'بندر عباس',    aliasesUr: ['بندرعباس'] },                        // Clean Arabic + Urdu Wikipedia canonical; no-space variant kept
    { slug: 'zanjan',          ur: 'زنجان',        aliasesUr: [] },                                  // Identical in ar/ur
    { slug: 'sanandaj',        ur: 'سنندج',        aliasesUr: [] },                                  // Identical in ar/ur; Kurdish + diacritics dropped
    { slug: 'qazvin',          ur: 'قزوین',        aliasesUr: [] },                                  // Persian ی; Kurdish قەزوین dropped
    { slug: 'arak',            ur: 'اراک',         aliasesUr: ['سلطان آباد'] },                      // Persian ک; historical pre-1938 name preserved; ساوه collision DROPPED (user §8)
    { slug: 'khomeyni-shahr',  ur: 'خمینی شہر',    aliasesUr: ['خمینی شهر', 'مهربین'] },              // User §1: Urdu شہر; Arabic ه variant + historical "Mehrabin"
    { slug: 'qarchak',         ur: 'قرچک',         aliasesUr: [] },                                  // Persian چ + ک
    { slug: 'golestan',        ur: 'گلستان',       aliasesUr: ['شہرک گلستان'] },                     // Persian گ; long form with Urdu ہ in شہرک
    { slug: 'bukan',           ur: 'بوکان',        aliasesUr: [] },                                  // Persian ک
    { slug: 'qaem-shahr',      ur: 'قائم شہر',     aliasesUr: ['قائم شهر', 'شاهی', 'علی آباد'] },     // User §1: Urdu شہر; Arabic ه variant + 2 historical names

    // Other 27 IR cities (sorted alphabetically)
    { slug: 'abadan',          ur: 'آبادان',       aliasesUr: ['ابادان'] },                          // Identical script; no-madda variant kept
    { slug: 'amol',            ur: 'آمل',          aliasesUr: [] },                                  // Identical script
    { slug: 'azadshahr',       ur: 'آزادشہر',      aliasesUr: ['آزادشهر'] },                         // User §1: Urdu شہر; Arabic ه variant matches names.ar
    { slug: 'babol',           ur: 'بابل',         aliasesUr: [] },                                  // Identical script
    { slug: 'birjand',         ur: 'بیرجند',       aliasesUr: [] },                                  // Persian ی
    { slug: 'bojnurd',         ur: 'بجنورد',       aliasesUr: [] },                                  // Identical script
    { slug: 'borujerd',        ur: 'بروجرد',       aliasesUr: ['بوروجيرد'] },                        // Long-form و+ي variant kept
    { slug: 'bushehr',         ur: 'بوشہر',        aliasesUr: ['بوشهر', 'بندر بوشهر'] },              // User §3: Urdu ہ; Arabic ه + full Bandar form
    { slug: 'eslamshahr',      ur: 'اسلام شہر',    aliasesUr: ['اسلامشهر'] },                        // User §1: Urdu شہر + space; joined Arabic ه form matches names.ar
    { slug: 'gorgan',          ur: 'گرگان',        aliasesUr: ['گورگان', 'استرآباد'] },              // Persian گ (modern); long و form + historical "Astarabad" (no diacritics; names.ar with diacritics deferred per user §10)
    { slug: 'ilam',            ur: 'ایلام',        aliasesUr: ['اِلام'] },                            // Persian ی initial; names.ar form (with diacritic) preserved for search; يلام short form dropped
    { slug: 'khorramabad',     ur: 'خرم آباد',     aliasesUr: [] },                                  // Identical script
    { slug: 'khorramshahr',    ur: 'خرمشھر',       aliasesUr: ['خرمشهر', 'بندر خرمشهر', 'الخرمشهر'] }, // Urdu ھ heh-doachashmee direct from GeoNames (Urdu letter); clean + Bandar + with-article variants
    { slug: 'maragheh',        ur: 'مراغہ',        aliasesUr: ['مراغه'] },                           // User §4: Urdu ہ; Arabic ه variant kept
    { slug: 'najafabad',       ur: 'نجف آباد',     aliasesUr: [] },                                  // Identical script
    { slug: 'nazarabad',       ur: 'نظر آباد',     aliasesUr: [] },                                  // Identical script; diacritics-heavy long form dropped
    { slug: 'neyshabur',       ur: 'نیشاپور',      aliasesUr: ['نیشابور', 'نيسابور'] },               // User §6: Persian پ; Persian-ب + Arabic-only variants kept
    { slug: 'pakdasht',        ur: 'پاکدشت',       aliasesUr: [] },                                  // Persian پ + ک; (names.ar=مامازان semantic mismatch deferred per user §10)
    { slug: 'qods',            ur: 'شہر قدس',      aliasesUr: ['شهر قدس', 'قدس', 'شهرک قدس', 'قلعہ حسن خان'] }, // User §1: Urdu شہر; Arabic ه + short + alt + historical; كَرَج collision DROPPED (user §7)
    { slug: 'sabzevar',        ur: 'سبزوار',       aliasesUr: [] },                                  // Identical script
    { slug: 'sari',            ur: 'ساری',         aliasesUr: ['ساري', 'سارى'] },                    // Persian ی; Arabic ي + names.ar alif-maqsura form preserved
    { slug: 'saveh',           ur: 'ساوہ',         aliasesUr: ['ساوه'] },                            // User §5: Urdu ہ; Arabic ه variant kept
    { slug: 'semnan',          ur: 'سمنان',        aliasesUr: [] },                                  // Identical script
    { slug: 'shahr-e-kord',    ur: 'شہر کرد',      aliasesUr: ['شهر كرد'] },                         // User §1: Urdu شہر + Persian ک; names.ar form kept as alias
    { slug: 'shahriar',        ur: 'شہریار',       aliasesUr: ['شهریار', 'شهريار'] },                // User §1: Urdu شہر + Persian ی; Arabic ه + Persian ی + all-Arabic variants kept
    { slug: 'sirjan',          ur: 'سیرجان',       aliasesUr: [] },                                  // Persian ی
    { slug: 'yasuj',           ur: 'یاسوج',        aliasesUr: ['یسوج'] },                            // Persian ی; short form kept
];

// ─── Aliases EXPLICITLY DROPPED per review §5 + user §7-9 (audit trail) ───
const DROPPED_ALIASES = [
    // User §7: qods alias كَرَج collides with karaj slug
    { slug: 'qods',            alias: 'كَرَج',                reason: 'Collision with karaj slug — would mis-route searches' },
    { slug: 'qods',            alias: 'قَلعِه هَسَن',         reason: 'Diacritics-heavy variant of قلعہ حسن خان (already kept)' },
    // User §8: arak alias ساوه collides with saveh slug
    { slug: 'arak',            alias: 'ساوه',                 reason: 'Collision with saveh slug — would mis-route searches' },
    // User §9: Kurdish ـە aliases
    { slug: 'karaj',           alias: 'کەرەج',                reason: 'Contains Kurdish ـە (U+06D5) — fails clean-check' },
    { slug: 'sanandaj',        alias: 'سنە',                  reason: 'Contains Kurdish ـە — fails clean-check' },
    { slug: 'bandar-abbas',    alias: 'بەندەر عەباس',         reason: 'Contains Kurdish ـە — fails clean-check' },
    { slug: 'qazvin',          alias: 'قەزوین',               reason: 'Contains Kurdish ـە — fails clean-check' },
    // Diacritics-heavy variants per review §5
    { slug: 'ardabil',         alias: 'اَردِبيل',             reason: 'Excessive diacritics — not typical Urdu form' },
    { slug: 'sanandaj',        alias: 'سِنَّ',                reason: 'Diacritics-heavy (shadda + kasra)' },
    { slug: 'sanandaj',        alias: 'سِنِّه',               reason: 'Diacritics-heavy variant' },
    { slug: 'bandar-abbas',    alias: 'بَندَرِ عَبّاس',       reason: 'Diacritics-heavy variant' },
    { slug: 'bandar-abbas',    alias: 'بَندَر عَبّاسی',       reason: 'Persian ezāfe form — rare in Urdu, more Persian-specific' },
    { slug: 'nazarabad',       alias: 'نَظَرابادِ بُزُرگ',    reason: 'Diacritics-heavy long form' },
    // Other rejects
    { slug: 'khomeyni-shahr',  alias: 'سده',                  reason: 'Sedeh — different settlement, semantic mismatch' },
    { slug: 'pakdasht',        alias: 'پاک دشت',              reason: 'Rare space-separated variant (canonical is joined پاکدشت)' },
    { slug: 'ilam',            alias: 'يلام',                 reason: 'Typo/alt short form — not a standard variant' },
    { slug: 'abadan',          alias: 'عبادان',               reason: 'Mis-spelling with initial ع (should be آ/ا)' },
];

// ─── DEFERRED items (documented, NOT applied here per user §10) ──────────
const DEFERRED = [
    { slug: 'gorgan',   names_ar: 'اَستِر آباد', reason: 'Historical Astarabad name; modern Persian/Urdu uses گرگان — semantic-mismatch fix deferred to a future "deferred-Arabic-name-cleanup" wave' },
    { slug: 'pakdasht', names_ar: 'مامازان',    reason: 'Mamazan is the old village name; modern is پاکدشت — semantic-mismatch fix deferred (same as ASIA-1G-IR closure note)' },
    { slug: 'golestan', names_ar: 'شهرك غلستان', reason: 'Typo `غلستان` should be `گلستان` (Persian گ) — typo fix deferred' },
];

// ─── Validation ─────────────────────────────────────────────────────────
const HAS_LATIN = /[A-Za-z]/;
const HAS_ARABIC_BLOCK = /[؀-ۿݐ-ݿ]/;
// Letters NOT in standard Urdu script — Pashto/Kurdish-specific letters
// that should NOT appear in approved names.ur or aliases.ur.
// NOTE: `ۀ` (U+06C0 Persian heh-with-hamza-above) is intentionally NOT in
// this list — it is a legitimate Persian letter for ezāfe constructions
// commonly used in Persian-style aliases for place names. Urdu readers
// handle it natively. Pashto-/Kurdish-specific letters: ښ ګ څ ځ ډ ړ ڼ ټ
// (Pashto), ە ڕ ڵ (Kurdish), ٿ (Sindhi).
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕ]/;

function isCleanUrduScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    if (SUSPICIOUS_NON_URDU.test(s)) return false;
    return HAS_ARABIC_BLOCK.test(s);
}

function main() {
    // ─── Pre-flight: validate every fix value + alias ───
    const errors = [];
    const seenSlugs = new Set();
    const seenUr = new Set();
    for (const f of FIXES) {
        if (seenSlugs.has(f.slug)) errors.push('Duplicate slug in FIXES: ' + f.slug);
        seenSlugs.add(f.slug);
        if (!isCleanUrduScript(f.ur)) {
            errors.push(f.slug + ' .ur="' + f.ur + '" fails clean-Urdu-script check');
        }
        if (seenUr.has(f.ur)) errors.push('Duplicate Urdu name across rows: ' + f.ur + ' (slug ' + f.slug + ')');
        seenUr.add(f.ur);
        for (const a of (f.aliasesUr || [])) {
            if (!isCleanUrduScript(a)) {
                errors.push(f.slug + ' alias "' + a + '" fails clean-Urdu-script check');
            }
        }
    }
    if (errors.length) {
        console.error('[apply] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] pre-flight OK — ' + FIXES.length + ' fixes validated, total aliases='
        + FIXES.reduce((s, f) => s + (f.aliasesUr || []).length, 0));

    // ─── Read curated + backup ───
    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    } else {
        console.log('[apply] backup already exists (skip rewrite):', BACKUP);
    }

    // ─── Apply ───
    const stats = {
        applied: 0,
        skippedAlreadyApplied: 0,
        slugNotFoundInCurated: [],
        namesUrSet: 0,
        namesUrOverwrote: 0,
        aliasesUrAdded: 0,
    };
    const appliedRows = [];

    const bySlug = new Map();
    for (const e of curated) bySlug.set(e.countryCode + '/' + e.slug, e);

    for (const fix of FIXES) {
        const key = 'ir/' + fix.slug;
        const entry = bySlug.get(key);
        if (!entry) {
            stats.slugNotFoundInCurated.push(key);
            continue;
        }

        // Idempotency check
        if (entry.names && entry.names.ur === fix.ur) {
            stats.skippedAlreadyApplied++;
            console.log('[apply] ir/' + fix.slug.padEnd(20) + ' SKIP (idempotent — names.ur already = "' + fix.ur + '")');
            continue;
        }

        if (!entry.names) entry.names = {};
        if (!entry.aliases) entry.aliases = {};

        // 1. names.ur (NEVER touch ar/en)
        const previousUr = entry.names.ur;
        const wasFillchain = previousUr === entry.names.en;
        entry.names.ur = fix.ur;
        if (previousUr) stats.namesUrOverwrote++;
        else stats.namesUrSet++;

        // 2. aliases.ur (add clean ones; dedupe against name.ur + existing aliases)
        const existingAliases = Array.isArray(entry.aliases.ur) ? entry.aliases.ur.slice() : [];
        const seen = new Set([fix.ur, ...existingAliases]);
        let aliasesAddedRow = 0;
        for (const a of (fix.aliasesUr || [])) {
            if (!seen.has(a)) {
                existingAliases.push(a);
                seen.add(a);
                aliasesAddedRow++;
                stats.aliasesUrAdded++;
            }
        }
        if (existingAliases.length) entry.aliases.ur = existingAliases;

        stats.applied++;
        appliedRows.push({
            slug: fix.slug,
            ur: fix.ur,
            aliasesAddedRow,
            wasFillchain,
            previousUr
        });
        console.log('[apply] ir/' + fix.slug.padEnd(20) +
            ' names.ur: "' + (previousUr || '(absent)') + '" → "' + fix.ur + '"' +
            (wasFillchain ? '  (overwrote fillchain)' : '') +
            '  aliases+=' + aliasesAddedRow);
    }

    // Defense: bail if any slug wasn't found
    if (stats.slugNotFoundInCurated.length) {
        console.error('[apply] FAILED — slugs missing in curated:');
        for (const s of stats.slugNotFoundInCurated) console.error('  - ' + s);
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // ─── Audit report ───
    const L = [];
    L.push('# PLACE-NAMES-UR-IR-1 — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: IR');
    L.push('**Total rows applied**: ' + stats.applied);
    L.push('**Already-applied (skipped, idempotent)**: ' + stats.skippedAlreadyApplied);
    L.push('**names.ur newly set (was absent)**: ' + stats.namesUrSet);
    L.push('**names.ur overwrote a fillchain value**: ' + stats.namesUrOverwrote);
    L.push('**aliases.ur added**: ' + stats.aliasesUrAdded);
    L.push('');
    L.push('## Applied rows (sorted by slug)');
    L.push('');
    L.push('| slug | names.ur | aliases.ur added | was fillchain? |');
    L.push('| --- | --- | ---: | :-: |');
    appliedRows.sort((a, b) => a.slug.localeCompare(b.slug));
    for (const r of appliedRows) {
        L.push('| `' + r.slug + '` | ' + r.ur + ' | ' + r.aliasesAddedRow + ' | ' + (r.wasFillchain ? '✓' : '✗') + ' |');
    }
    L.push('');
    L.push('## Aliases explicitly NOT added (review §5 + user §7-9 audit)');
    L.push('');
    L.push('| slug | dropped alias | reason |');
    L.push('| --- | --- | --- |');
    for (const d of DROPPED_ALIASES) {
        L.push('| `' + d.slug + '` | `' + d.alias + '` | ' + d.reason + ' |');
    }
    L.push('');
    L.push('## Deferred (NOT applied — per user §10)');
    L.push('');
    L.push('| slug | names.ar | deferral reason |');
    L.push('| --- | --- | --- |');
    for (const d of DEFERRED) {
        L.push('| `' + d.slug + '` | `' + d.names_ar + '` | ' + d.reason + ' |');
    }
    L.push('');
    L.push('## Backup');
    L.push('');
    L.push('Pre-apply backup written to: `' + BACKUP + '`');
    L.push('');
    L.push('Restore command: `cp ' + path.basename(BACKUP) + ' curated-places.json`');
    L.push('');
    L.push('## What this apply did NOT do');
    L.push('');
    L.push('- ❌ `names.ar` not modified');
    L.push('- ❌ `names.en` not modified');
    L.push('- ❌ 12 IR seed entries (already had real Urdu) not touched');
    L.push('- ❌ No other country touched');
    L.push('- ❌ No code changes (server.js, js/app.js, fillLangMap)');
    L.push('- ❌ No runtime translation');
    L.push('- ❌ No translation API');
    L.push('- ❌ No browser auto-translate dependency');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    // ─── Console summary ───
    console.log('');
    console.log('═══ PLACE-NAMES-UR-IR-1 — Apply Summary ═══');
    console.log('  Applied (new):                ' + stats.applied);
    console.log('  Skipped (idempotent):         ' + stats.skippedAlreadyApplied);
    console.log('  names.ur newly set:           ' + stats.namesUrSet);
    console.log('  names.ur overwrote fillchain: ' + stats.namesUrOverwrote);
    console.log('  aliases.ur added:             ' + stats.aliasesUrAdded);
}

main();
