// scripts/geodata/_place_names_ur_pk_4_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-PK-4 (Fast Track) — apply real Urdu names + clean aliases
// for the 20 PK cities merged via ASIA-1D-PK-MISSING-AR-MAJORS-1A (cb9808f).
//
// User decision (2026-05-19): Fast Track Review+Apply — single-phase since
// pattern is proven (UR-PK-2/3 closed cleanly) and risk is low.
//
// GeoNames had ZERO Urdu/Persian/Arabic alternatenames for all 20 cities.
// All 20 Urdu names are MANUAL — sourced from Urdu Wikipedia canonical
// forms + standard Urdu transliteration conventions:
//   -abad → آباد, -pur → پور (Persian پ), -kot → کوٹ (Urdu retroflex ٹ),
//   -garh → گڑھ (Persian گ + retroflex ڑ + ھ), -khan → خان,
//   Dera- → ڈیرہ (Urdu retroflex ڈ + ہ), Tando- → ٹنڈو (Urdu retroflex ٹ + ڈ),
//   -wala → والا
//
// Per user's rules:
//   1. Add names.ur for 20 BATCH-A entries only
//   2. Don't touch 70 prior PK entries (10 seed + 43 clean + 17 MCF)
//   3. Don't change names.ar (preserves MAJORS-1A Arabic)
//   4. Don't change names.en
//   5. Add clean useful aliases.ur only
//   6. Don't change server.js / js/app.js / fillLangMap / index.html
//   7. No runtime translation
//   8. Idempotent re-run
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesUrPk4.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-ur-pk-4-apply-report.md';

// ─── 20 FIXES (Fast Track — Wikipedia Urdu canonical + standard translit) ───
const FIXES = [
    // Top 5 by population — all Wikipedia Urdu canonical
    { slug: 'bahawalpur',      ur: 'بہاولپور',         aliasesUr: ['بہاول پور'] },             // Urdu ہ + Persian پ; with-space variant
    { slug: 'dera-ismail-khan',ur: 'ڈیرہ اسماعیل خان', aliasesUr: [] },                          // Urdu retroflex ڈ + ہ + Persian ی
    { slug: 'battagram',       ur: 'بٹگرام',           aliasesUr: [] },                          // Urdu retroflex ٹ + Persian گ
    { slug: 'okara',           ur: 'اوکاڑہ',           aliasesUr: ['اوکارہ'] },                  // Persian ک + Urdu retroflex ڑ + ہ; non-retroflex variant
    { slug: 'kasur',           ur: 'قصور',             aliasesUr: [] },                          // Identical script (matches names.ar)

    // Mid-population (200k-400k)
    { slug: 'tando-allahyar',  ur: 'ٹنڈو اللہ یار',    aliasesUr: ['ٹنڈو اللہیار'] },           // Urdu ٹ + ڈ + ہ + Persian ی; no-space variant
    { slug: 'larkana',         ur: 'لاڑکانہ',          aliasesUr: ['لاڑکانا'] },                // Urdu retroflex ڑ + Persian ک + ہ; ا-end variant
    { slug: 'nawabshah',       ur: 'نواب شاہ',         aliasesUr: ['نوابشاہ'] },                 // Urdu ہ; no-space variant
    { slug: 'hafizabad',       ur: 'حافظ آباد',        aliasesUr: [] },                          // Identical script (matches names.ar)
    { slug: 'kamoke',          ur: 'کامونکی',          aliasesUr: ['کاموکی'] },                  // Persian ک + Persian ی; Wikipedia "Kamoonki" variant

    // Smaller (150k-300k)
    { slug: 'abbottabad',      ur: 'ایبٹ آباد',        aliasesUr: ['ابٹ آباد'] },                // Persian ی + Urdu retroflex ٹ; without ی variant
    { slug: 'shikarpur',       ur: 'شکارپور',          aliasesUr: [] },                          // Persian ک + پ
    { slug: 'shahkot',         ur: 'شاہ کوٹ',          aliasesUr: ['شاہکوٹ'] },                  // Urdu ہ + retroflex ٹ; no-space variant
    { slug: 'hub',             ur: 'ہب',               aliasesUr: ['حب'] },                       // Urdu ہ short form; Arabic ح variant for search
    { slug: 'garhi-khairo',    ur: 'گڑھی خیرو',        aliasesUr: [] },                          // Persian گ + retroflex ڑ + ھ + Persian ی
    { slug: 'khairpur-mirs',   ur: 'خیرپور میرس',      aliasesUr: ['خیرپور'] },                  // Persian ی + پ + Persian ی; short form alias
    { slug: 'saddiqabad',      ur: 'صادق آباد',        aliasesUr: ['صدیق آباد'] },               // Persian ا extension (Wikipedia canonical "Sadiq"); Saddiq variant
    { slug: 'burewala',        ur: 'بوریوالا',         aliasesUr: [] },                          // Identical script (matches names.ar but Wikipedia Urdu uses Persian ی)
    { slug: 'arif-wala',       ur: 'عارف والا',        aliasesUr: ['عارفوالا'] },                // Identical script + no-space variant
    { slug: 'kohat',           ur: 'کوہاٹ',            aliasesUr: [] },                          // Persian ک + Urdu ہ + retroflex ٹ
];

// ─── Validation helpers ─────────────────────────────────────────────────
const HAS_LATIN = /[A-Za-z]/;
const HAS_ARABIC_BLOCK = /[؀-ۿݐ-ݿ]/;
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;

function isCleanUrduScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    if (SUSPICIOUS_NON_URDU.test(s)) return false;
    return HAS_ARABIC_BLOCK.test(s);
}

// Slugs we MUST NOT mutate (70 prior PK entries)
const PK_PRIOR_70_SLUGS = new Set([
    // 10 seed (UR-PK-1)
    'karachi','lahore','islamabad','rawalpindi','peshawar',
    'multan','faisalabad','quetta','hyderabad-pk','sialkot',
    // 43 ASIA-1D-PK clean (UR-PK-2)
    'ahmadpur-east','bahawalnagar','bhalwal','buni','chaman','chishtian',
    'dadu','dipalpur','gilgit','gojra','gujrat','gwadar','hasilpur',
    'jahangira','jamrud','jaranwala','jhang-sadr','jhelum','kabirwala',
    'kamalia','kambar','kotri','mailsi','mardan','matli','mingora',
    'mirpur-khas','muridke','muzaffarabad','nankana-sahib','pasrur',
    'pattoki','rahim-yar-khan','sambrial','sargodha','shahdadpur',
    'shekhupura','sibi','skardu','sukkur','tordher','turbat','wazirabad',
    // 17 ASIA-1D-PK-MCF (UR-PK-3)
    'gujranwala','bannu','sahiwal','dera-ghazi-khan','chiniot',
    'muzaffargarh','jacobabad','umarkot','new-mirpur-city','badin',
    'kharian','gujar-khan','lala-musa','chunian','chitral','rohri','rawalakot'
]);

function main() {
    // Pre-flight
    const errors = [];
    const seenSlugs = new Set();
    const seenUr = new Set();
    for (const f of FIXES) {
        if (PK_PRIOR_70_SLUGS.has(f.slug)) {
            errors.push('FIXES targets a PRIOR 70-PK slug: ' + f.slug + ' (must NEVER touch prior entries)');
        }
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

    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    } else {
        console.log('[apply] backup already exists (skip rewrite):', BACKUP);
    }

    // Snapshot ALL PK pre-apply state
    const preApplyState = {};
    for (const e of curated) {
        if (e.countryCode === 'pk') {
            preApplyState[e.slug] = {
                ur: (e.names && e.names.ur) || null,
                ar: (e.names && e.names.ar) || null,
                en: (e.names && e.names.en) || null,
                aliasUr: (e.aliases && e.aliases.ur) ? e.aliases.ur.slice() : null
            };
        }
    }

    const stats = {
        applied: 0,
        skippedAlreadyApplied: 0,
        slugNotFoundInCurated: [],
        namesUrSet: 0,
        namesUrOverwrote: 0,
        aliasesUrAdded: 0,
        priorTouchedError: 0,
    };
    const appliedRows = [];

    const bySlug = new Map();
    for (const e of curated) bySlug.set(e.countryCode + '/' + e.slug, e);

    for (const fix of FIXES) {
        const key = 'pk/' + fix.slug;
        const entry = bySlug.get(key);
        if (!entry) {
            stats.slugNotFoundInCurated.push(key);
            continue;
        }
        if (entry.names && entry.names.ur === fix.ur) {
            stats.skippedAlreadyApplied++;
            console.log('[apply] pk/' + fix.slug.padEnd(20) + ' SKIP (idempotent — names.ur already = "' + fix.ur + '")');
            continue;
        }

        if (!entry.names) entry.names = {};
        if (!entry.aliases) entry.aliases = {};

        const previousUr = entry.names.ur;
        entry.names.ur = fix.ur;
        if (previousUr) stats.namesUrOverwrote++;
        else stats.namesUrSet++;

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
            previousUr
        });
        console.log('[apply] pk/' + fix.slug.padEnd(20) +
            ' names.ur: "' + (previousUr || '(absent)') + '" → "' + fix.ur + '"' +
            '  aliases+=' + aliasesAddedRow);
    }

    if (stats.slugNotFoundInCurated.length) {
        console.error('[apply] FAILED — slugs missing in curated:');
        for (const s of stats.slugNotFoundInCurated) console.error('  - ' + s);
        process.exit(1);
    }

    // Post-apply assertions
    for (const e of curated) {
        if (e.countryCode !== 'pk') continue;
        const before = preApplyState[e.slug];
        if (!before) continue;

        const afterAr = (e.names && e.names.ar) || null;
        const afterEn = (e.names && e.names.en) || null;
        if (before.ar !== afterAr) {
            console.error('[apply] FAILED — pk/' + e.slug + ' names.ar mutated: "' + before.ar + '" → "' + afterAr + '"');
            process.exit(1);
        }
        if (before.en !== afterEn) {
            console.error('[apply] FAILED — pk/' + e.slug + ' names.en mutated: "' + before.en + '" → "' + afterEn + '"');
            process.exit(1);
        }

        if (PK_PRIOR_70_SLUGS.has(e.slug)) {
            const afterUr = (e.names && e.names.ur) || null;
            if (before.ur !== afterUr) {
                console.error('[apply] FAILED — PRIOR-70 pk/' + e.slug + ' names.ur mutated: "' + before.ur + '" → "' + afterUr + '"');
                stats.priorTouchedError++;
            }
            const afterAlias = JSON.stringify((e.aliases && e.aliases.ur) || null);
            const beforeAlias = JSON.stringify(before.aliasUr);
            if (afterAlias !== beforeAlias) {
                console.error('[apply] FAILED — PRIOR-70 pk/' + e.slug + ' aliases.ur mutated');
                stats.priorTouchedError++;
            }
        }
    }
    if (stats.priorTouchedError > 0) {
        console.error('[apply] FAILED — ' + stats.priorTouchedError + ' prior-70 entries mutated (must be 0)');
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // Audit report
    const L = [];
    L.push('# PLACE-NAMES-UR-PK-4 (Fast Track) — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: PK (20 ASIA-1D-PK-MISSING-AR-MAJORS-1A entries only)');
    L.push('**Total rows applied**: ' + stats.applied);
    L.push('**Skipped (idempotent)**: ' + stats.skippedAlreadyApplied);
    L.push('**names.ur newly set**: ' + stats.namesUrSet);
    L.push('**names.ur overwrote**: ' + stats.namesUrOverwrote);
    L.push('**aliases.ur added**: ' + stats.aliasesUrAdded);
    L.push('**PRIOR 70-PK touched (must be 0)**: ' + stats.priorTouchedError);
    L.push('');
    L.push('## Applied rows');
    L.push('');
    L.push('| slug | names.ur applied | aliases.ur added |');
    L.push('| --- | --- | ---: |');
    appliedRows.sort((a, b) => a.slug.localeCompare(b.slug));
    for (const r of appliedRows) {
        L.push('| `' + r.slug + '` | ' + r.ur + ' | ' + r.aliasesAddedRow + ' |');
    }
    L.push('');
    L.push('## What this apply did NOT do');
    L.push('');
    L.push('- ❌ `names.ar` not modified (preserves MAJORS-1A Arabic)');
    L.push('- ❌ `names.en` not modified');
    L.push('- ❌ 70 prior PK entries not touched');
    L.push('- ❌ Other countries not touched');
    L.push('- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html)');
    L.push('- ❌ No runtime translation');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ PLACE-NAMES-UR-PK-4 (Fast Track) — Apply Summary ═══');
    console.log('  Applied (new):                 ' + stats.applied);
    console.log('  Skipped (idempotent):          ' + stats.skippedAlreadyApplied);
    console.log('  names.ur newly set:            ' + stats.namesUrSet);
    console.log('  aliases.ur added:              ' + stats.aliasesUrAdded);
    console.log('  PRIOR 70-PK touched (must=0):  ' + stats.priorTouchedError);
}

main();
