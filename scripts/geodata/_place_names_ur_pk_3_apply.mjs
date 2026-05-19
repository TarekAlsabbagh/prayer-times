// scripts/geodata/_place_names_ur_pk_3_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-PK-3-APPLY — apply user-approved Urdu names + aliases for
// the 17 NEW PK cities merged via ASIA-1D-PK-MCF (commit a75bea7, 2026-05-19).
//
// User decision (2026-05-19): "approve all 17 as proposed" per:
//   reports/place-names-ur-pk-3-review.md
//
// IMPORTANT — User-acknowledged design point:
//   In ASIA-1D-PK-MCF we cleaned Urdu retroflex chars (ں, ٹ, ڈ, ڑ, ھ) from
//   names.ar to make it pure Arabic. In THIS phase (names.ur), we RESTORE
//   those Urdu-specific letters where Urdu Wikipedia uses them. Arabic and
//   Urdu are NOT the same script for these cities.
//
// Examples:
//   bannu:           names.ar=بنو            → names.ur=بنوں (with ں)
//   dera-ghazi-khan: names.ar=ديرة غازي خان  → names.ur=ڈیرہ غازی خان (with ڈ + ہ)
//   kharian:         names.ar=كهاريان        → names.ur=کھاریاں (with ھ + ں)
//
// Per user's apply rules:
//   1. Add names.ur for 17 MCF entries only
//   2. Don't touch 10 PK seed (UR-PK-1 baseline)
//   3. Don't touch 43 ASIA-1D-PK clean entries (UR-PK-2 baseline)
//   4. Don't change names.ar (preserves ASIA-1D-PK-MCF NAME_AR_FIXES)
//   5. Don't change names.en
//   6. Add clean useful aliases.ur only
//   7. Drop polluted aliases (Pashto/Sindhi/Kurdish/ZWNJ/admin/Latin/etc.)
//   8. Don't change server.js / js/app.js / fillLangMap / index.html
//   9. No runtime translation
//  10. Idempotent re-run
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesUrPk3.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-ur-pk-3-apply-report.md';

// ─── 17 FIXES (per user-approved list) ───
const FIXES = [
    // Watch-list (11 user-listed)
    { slug: 'gujranwala',      ur: 'گوجرانوالہ',         aliasesUr: ['گوجرانوالا'] },                    // Urdu ہ + Persian گ; alt with ا-end
    { slug: 'bannu',           ur: 'بنوں',               aliasesUr: [] },                                // Urdu retroflex ں
    { slug: 'sahiwal',         ur: 'ساہیوال',            aliasesUr: ['ساهیوال'] },                       // Urdu ہ + Persian ی; alt with Arabic ه
    { slug: 'dera-ghazi-khan', ur: 'ڈیرہ غازی خان',      aliasesUr: ['دیرہ غازی خان'] },                // Urdu ڈ + ہ; non-retroflex variant
    { slug: 'chiniot',         ur: 'چنیوٹ',              aliasesUr: ['چنیوت'] },                         // Urdu retroflex ٹ; non-retroflex variant
    { slug: 'muzaffargarh',    ur: 'مظفر گڑھ',           aliasesUr: ['مظفر گرہ'] },                      // Urdu retroflex ڑ + ھ
    { slug: 'jacobabad',       ur: 'جیکب آباد',          aliasesUr: ['جیکب اباد'] },                     // Persian ی + ک; no-madda alt
    { slug: 'umarkot',         ur: 'عمرکوٹ',             aliasesUr: [] },                                // Arabic ع + Persian ک + Urdu ٹ
    { slug: 'badin',           ur: 'بدین',               aliasesUr: [] },                                // Persian ی
    { slug: 'kharian',         ur: 'کھاریاں',            aliasesUr: ['کھاریان'] },                       // Urdu ھ + ں; non-retroflex variant
    { slug: 'rawalakot',       ur: 'راولاکوٹ',           aliasesUr: ['راولا کوٹ'] },                     // Urdu ٹ; with-space variant

    // Other 6 (not in user watch-list but same approach)
    { slug: 'new-mirpur-city', ur: 'نیا میرپور شہر',     aliasesUr: ['میرپور'] },                        // Urdu ہ + Persian پ; short form
    { slug: 'gujar-khan',      ur: 'گجر خاں',            aliasesUr: ['گوجر خان', 'گوجرخان'] },          // Urdu retroflex ں; non-retroflex variants
    { slug: 'lala-musa',       ur: 'لالہ موسیٰ',         aliasesUr: ['لالہ موسی'] },                     // Urdu ہ + Persian ی; without alif-superscript variant
    { slug: 'chunian',         ur: 'چونیاں',             aliasesUr: ['چونیان'] },                        // Urdu ں; non-retroflex variant
    { slug: 'chitral',         ur: 'چترال',              aliasesUr: ['چیترال'] },                        // Persian چ; with-ی variant
    { slug: 'rohri',           ur: 'روہڑی',              aliasesUr: [] },                                // Urdu ہ + retroflex ڑ
];

// ─── Aliases EXPLICITLY DROPPED per user direction (audit trail) ───
const DROPPED_ALIASES = [
    // Diacritic-heavy variants
    { slug: 'bannu',           alias: 'بنّو',                  reason: 'shadda diacritic — not preferred' },
    { slug: 'sahiwal',         alias: 'ساہِيوال',              reason: 'kasra diacritic-heavy variant' },
    { slug: 'lala-musa',       alias: 'لاله موسيٰ',            reason: 'Arabic ه + alif-superscript U+0670 variant' },
    // Country suffix variants
    { slug: 'sahiwal',         alias: 'ساهیوال، پاکستان',     reason: 'country suffix' },
    { slug: 'dera-ghazi-khan', alias: 'دیره غازی‌خان، پاکستان', reason: 'country suffix + ZWNJ' },
    { slug: 'chiniot',         alias: 'چنیوت، پاکستان',       reason: 'country suffix' },
    { slug: 'muzaffargarh',    alias: 'مظفر گره، پاکستان',    reason: 'country suffix' },
    { slug: 'jacobabad',       alias: 'جیکب‌آباد، پاکستان',    reason: 'ZWNJ + country suffix' },
    // Pashto-script aliases
    { slug: 'dera-ghazi-khan', alias: 'ډېره غازي خان',        reason: 'Pashto ډ + ې — fails clean-Urdu-script check' },
    { slug: 'chiniot',         alias: 'چنيوټ',                reason: 'Pashto ټ' },
    // Sindhi-script aliases
    { slug: 'jacobabad',       alias: 'جيڪب آباد',            reason: 'Sindhi ڪ' },
    { slug: 'jacobabad',       alias: 'jyڪb abad',            reason: 'Latin mojibake + Sindhi ڪ' },
    { slug: 'umarkot',         alias: 'امرڪوٽ',               reason: 'Sindhi ڪ + ٽ' },
    { slug: 'umarkot',         alias: 'amrڪwٽ',               reason: 'Latin mojibake + Sindhi' },
    { slug: 'rohri',           alias: 'روھڙي',                reason: 'Sindhi ڙ' },
    { slug: 'rohri',           alias: 'rwھڙy',                reason: 'Latin mojibake + Sindhi ڙ' },
    // Admin prefix (same pattern as mailsi)
    { slug: 'chunian',         alias: 'تصیل چونیاں',          reason: 'admin prefix "تصیل" (misspelling of تحصیل)' },
    // Semantic mismatch
    { slug: 'chitral',         alias: 'چھترار',               reason: 'semantic mismatch (different word — was also dropped in MCF Arabic)' }
];

// ─── Validation helpers (extended for PK-3: Pashto/Sindhi/Kurdish/ZWNJ) ───
const HAS_LATIN = /[A-Za-z]/;
const HAS_ARABIC_BLOCK = /[؀-ۿݐ-ݿ]/;
// Non-Urdu script chars that should NOT appear in approved aliases.ur:
//   Pashto: ښ ګ څ ځ ډ ړ ڼ ټ
//   Sindhi: ڪ ڙ ٻ ٺ ٿ ڀ ٽ ڄ ڃ ڌ ڍ ڠ ڳ ڱ ڻ
//   Kurdish: ە ڕ ڵ ێ ۆ
// NOTE: ۀ (U+06C0 Persian heh-with-hamza-above) is intentionally NOT here —
// it's a legitimate Persian/Urdu letter for ezāfe constructions.
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;
// Zero-width non-joiner / joiner — drop from primary
const HAS_ZWNJ = /[‌‍]/;

function isCleanUrduScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    if (SUSPICIOUS_NON_URDU.test(s)) return false;
    return HAS_ARABIC_BLOCK.test(s);
}

// Sets of slugs we are NOT allowed to mutate
const PK_SEED_SLUGS = new Set([
    'karachi','lahore','islamabad','rawalpindi','peshawar',
    'multan','faisalabad','quetta','hyderabad-pk','sialkot'
]);
const PK_CLEAN_43_SLUGS = new Set([
    'ahmadpur-east','azadshahr_unused_placeholder', // (placeholder removed below)
    // Actual 43 from ASIA-1D-PK clean merge:
    'ahmadpur-east','bahawalnagar','bhalwal','buni','chaman','chishtian',
    'dadu','dipalpur','gilgit','gojra','gujrat','gwadar','hasilpur',
    'jahangira','jamrud','jaranwala','jhang-sadr','jhelum','kabirwala',
    'kamalia','kambar','kotri','mailsi','mardan','matli','mingora',
    'mirpur-khas','muridke','muzaffarabad','nankana-sahib','pasrur',
    'pattoki','rahim-yar-khan','sambrial','sargodha','shahdadpur',
    'shekhupura','sibi','skardu','sukkur','tordher','turbat','wazirabad'
]);
PK_CLEAN_43_SLUGS.delete('azadshahr_unused_placeholder');

function main() {
    // ─── Pre-flight ───
    const errors = [];
    const seenSlugs = new Set();
    const seenUr = new Set();
    for (const f of FIXES) {
        if (PK_SEED_SLUGS.has(f.slug)) {
            errors.push('FIXES targets a SEED slug: ' + f.slug + ' (should NEVER touch seed)');
        }
        if (PK_CLEAN_43_SLUGS.has(f.slug)) {
            errors.push('FIXES targets an ASIA-1D-PK CLEAN slug: ' + f.slug + ' (should NEVER touch clean entries)');
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

    // ─── Read curated + backup ───
    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    } else {
        console.log('[apply] backup already exists (skip rewrite):', BACKUP);
    }

    // ─── Snapshot ALL PK pre-apply state (for post-mutation assertion) ───
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

    // ─── Apply ───
    const stats = {
        applied: 0,
        skippedAlreadyApplied: 0,
        slugNotFoundInCurated: [],
        namesUrSet: 0,
        namesUrOverwrote: 0,
        aliasesUrAdded: 0,
        seedTouchedError: 0,
        cleanTouchedError: 0,
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
        // Idempotency
        if (entry.names && entry.names.ur === fix.ur) {
            stats.skippedAlreadyApplied++;
            console.log('[apply] pk/' + fix.slug.padEnd(18) + ' SKIP (idempotent — names.ur already = "' + fix.ur + '")');
            continue;
        }

        if (!entry.names) entry.names = {};
        if (!entry.aliases) entry.aliases = {};

        // 1. names.ur (NEVER touch ar/en)
        const previousUr = entry.names.ur;
        entry.names.ur = fix.ur;
        if (previousUr) stats.namesUrOverwrote++;
        else stats.namesUrSet++;

        // 2. aliases.ur (clean dedupe against name.ur + existing)
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
        console.log('[apply] pk/' + fix.slug.padEnd(18) +
            ' names.ur: "' + (previousUr || '(absent)') + '" → "' + fix.ur + '"' +
            '  aliases+=' + aliasesAddedRow);
    }

    if (stats.slugNotFoundInCurated.length) {
        console.error('[apply] FAILED — slugs missing in curated:');
        for (const s of stats.slugNotFoundInCurated) console.error('  - ' + s);
        process.exit(1);
    }

    // ─── Post-apply integrity assertions ───
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

        // 10 seed entries: nothing changes
        if (PK_SEED_SLUGS.has(e.slug)) {
            const afterUr = (e.names && e.names.ur) || null;
            if (before.ur !== afterUr) {
                console.error('[apply] FAILED — PK SEED pk/' + e.slug + ' names.ur mutated: "' + before.ur + '" → "' + afterUr + '"');
                stats.seedTouchedError++;
            }
            const afterAlias = JSON.stringify((e.aliases && e.aliases.ur) || null);
            const beforeAlias = JSON.stringify(before.aliasUr);
            if (afterAlias !== beforeAlias) {
                console.error('[apply] FAILED — PK SEED pk/' + e.slug + ' aliases.ur mutated');
                stats.seedTouchedError++;
            }
        }

        // 43 ASIA-1D-PK clean entries: nothing changes (UR-PK-2 baseline)
        if (PK_CLEAN_43_SLUGS.has(e.slug)) {
            const afterUr = (e.names && e.names.ur) || null;
            if (before.ur !== afterUr) {
                console.error('[apply] FAILED — PK CLEAN pk/' + e.slug + ' names.ur mutated: "' + before.ur + '" → "' + afterUr + '"');
                stats.cleanTouchedError++;
            }
            const afterAlias = JSON.stringify((e.aliases && e.aliases.ur) || null);
            const beforeAlias = JSON.stringify(before.aliasUr);
            if (afterAlias !== beforeAlias) {
                console.error('[apply] FAILED — PK CLEAN pk/' + e.slug + ' aliases.ur mutated');
                stats.cleanTouchedError++;
            }
        }
    }
    if (stats.seedTouchedError + stats.cleanTouchedError > 0) {
        console.error('[apply] FAILED — ' + stats.seedTouchedError + ' seed + ' + stats.cleanTouchedError + ' clean entries mutated (must be 0)');
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // ─── Audit report ───
    const L = [];
    L.push('# PLACE-NAMES-UR-PK-3-APPLY — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: PK (17 ASIA-1D-PK-MCF entries only)');
    L.push('**Total rows applied**: ' + stats.applied);
    L.push('**Already-applied (skipped, idempotent)**: ' + stats.skippedAlreadyApplied);
    L.push('**names.ur newly set (was absent)**: ' + stats.namesUrSet);
    L.push('**names.ur overwrote an existing value**: ' + stats.namesUrOverwrote);
    L.push('**aliases.ur added**: ' + stats.aliasesUrAdded);
    L.push('**10 PK seed entries touched (must be 0)**: ' + stats.seedTouchedError);
    L.push('**43 ASIA-1D-PK clean entries touched (must be 0)**: ' + stats.cleanTouchedError);
    L.push('');
    L.push('## Applied rows (sorted by slug)');
    L.push('');
    L.push('| slug | names.ur applied | aliases.ur added |');
    L.push('| --- | --- | ---: |');
    appliedRows.sort((a, b) => a.slug.localeCompare(b.slug));
    for (const r of appliedRows) {
        L.push('| `' + r.slug + '` | ' + r.ur + ' | ' + r.aliasesAddedRow + ' |');
    }
    L.push('');
    L.push('## Aliases explicitly NOT added (audit)');
    L.push('');
    L.push('| slug | dropped alias | reason |');
    L.push('| --- | --- | --- |');
    for (const d of DROPPED_ALIASES) {
        L.push('| `' + d.slug + '` | `' + d.alias + '` | ' + d.reason + ' |');
    }
    L.push('');
    L.push('## Backup');
    L.push('');
    L.push('Pre-apply backup written to: `' + BACKUP + '`');
    L.push('Restore command: `cp ' + path.basename(BACKUP) + ' curated-places.json`');
    L.push('');
    L.push('## What this apply did NOT do');
    L.push('');
    L.push('- ❌ `names.ar` not modified (preserves ASIA-1D-PK-MCF NAME_AR_FIXES)');
    L.push('- ❌ `names.en` not modified');
    L.push('- ❌ 10 PK seed entries not touched (UR-PK-1 baseline)');
    L.push('- ❌ 43 ASIA-1D-PK clean entries not touched (UR-PK-2 baseline)');
    L.push('- ❌ Other countries not touched');
    L.push('- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html)');
    L.push('- ❌ No runtime translation / API / browser auto-translate');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    // ─── Console summary ───
    console.log('');
    console.log('═══ PLACE-NAMES-UR-PK-3-APPLY — Apply Summary ═══');
    console.log('  Applied (new):                       ' + stats.applied);
    console.log('  Skipped (idempotent):                ' + stats.skippedAlreadyApplied);
    console.log('  names.ur newly set:                  ' + stats.namesUrSet);
    console.log('  names.ur overwrote:                  ' + stats.namesUrOverwrote);
    console.log('  aliases.ur added:                    ' + stats.aliasesUrAdded);
    console.log('  PK seed touched (must be 0):         ' + stats.seedTouchedError);
    console.log('  PK clean-43 touched (must be 0):     ' + stats.cleanTouchedError);
}

main();
