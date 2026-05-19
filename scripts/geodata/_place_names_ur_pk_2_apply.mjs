// scripts/geodata/_place_names_ur_pk_2_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-PK-2-APPLY — apply user-approved Urdu names + aliases for
// the 43 NEW PK cities merged via ASIA-1D-PK (commit 0bdda2d, 2026-05-19).
//
// User decision (2026-05-19): "approve all 43 as proposed" per:
//   reports/place-names-ur-pk-2-review.md
//
// With 8 specific overlay decisions on open questions:
//   1. bahawalnagar → بہاولنگر (NOT بہاولپور — that's Bahawalpur)
//   2. mailsi → میلسی (NOT تصیل میلسی — admin prefix)
//   3. chishtian → چشتیاں (Urdu ں); chishtian-sharif preserved as alias
//   4. ahmadpur-east → احمد پور شرقیہ (Urdu canonical with ہ)
//   5. muridke → مریدکے (yeh-barree end, NOT مریدکی)
//   6. dadu → دادو (no diacritics primary)
//   7. Pashto/Sindhi/Kurdish aliases: DROP all
//   8. Collision aliases (بہاولپور, تصیل میلسی): DROP
//
// Per user's 10-point apply rules:
//   1. Add names.ur for 43 new PK pipeline rows only
//   2. Don't touch 10 PK seed entries (UR-PK-1 baseline)
//   3. Don't change names.ar (preserves ASIA-1D-PK 3 NAME_AR_FIXES)
//   4. Don't change names.en
//   5. Add only clean useful aliases.ur
//   6. Drop collision/admin-prefix/script-mismatch aliases
//   7. Don't change server.js
//   8. Don't change js/app.js
//   9. Don't change fillLangMap
//  10. No runtime translation
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// Idempotent — re-running on already-applied rows is a no-op.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesUrPk2.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-ur-pk-2-apply-report.md';

// ─── 43 FIXES (matches §1 of review report; user-approved with 8 overlays) ───
// Per-row: { slug, ur, aliasesUr }
const FIXES = [
    // Watch-list (8 user-listed cities) — listed first for visibility
    { slug: 'bahawalnagar',  ur: 'بہاولنگر',         aliasesUr: ['بہاول نگر'] },                              // User §1: Urdu Wikipedia canonical; بہاولپور DROPPED (Bahawalpur collision)
    { slug: 'mailsi',        ur: 'میلسی',            aliasesUr: [] },                                          // User §2: clean form; تصیل میلسی DROPPED (admin prefix)
    { slug: 'chishtian',     ur: 'چشتیاں',           aliasesUr: ['چشتیان', 'چشتیان شریف'] },                  // User §3: Urdu ں retroflex; Persian ی variant + historical Sharif kept as aliases
    { slug: 'rahim-yar-khan',ur: 'رحیم یار خان',     aliasesUr: [] },                                          // Persian ی; compound name
    { slug: 'jhang-sadr',    ur: 'جھنگ صدر',         aliasesUr: [] },                                          // Urdu ھ + Persian گ
    { slug: 'shekhupura',    ur: 'شیخوپورہ',         aliasesUr: ['شیخوپورا', 'شیخوپوره'] },                   // Urdu ہ; Persian ا + Arabic ه variants preserved
    { slug: 'gojra',         ur: 'گوجرہ',            aliasesUr: ['گوجرا'] },                                   // Urdu ہ + Persian گ; Persian ا variant kept
    { slug: 'muridke',       ur: 'مریدکے',           aliasesUr: ['مریدکی'] },                                  // User §5: Urdu ے yeh-barree; Persian ی variant kept

    // Other 35 new PK cities (sorted alphabetically)
    { slug: 'ahmadpur-east', ur: 'احمد پور شرقیہ',   aliasesUr: ['احمد پور', 'احمدپور'] },                    // User §4: Urdu ہ feminine
    { slug: 'bhalwal',       ur: 'بھلوال',           aliasesUr: [] },                                          // Urdu ھ (aspirated bh)
    { slug: 'buni',          ur: 'بنی',              aliasesUr: ['بُنِی'] },                                   // User: clean form primary; with-diacritics as alias
    { slug: 'chaman',        ur: 'چمن',              aliasesUr: [] },                                          // Persian چ
    { slug: 'dadu',          ur: 'دادو',             aliasesUr: ['دادُو'] },                                   // User §6: no diacritics primary; with-diacritics alias
    { slug: 'dipalpur',      ur: 'دیپالپور',         aliasesUr: ['دیپال پور'] },                              // Persian پ + ی
    { slug: 'gilgit',        ur: 'گلگت',             aliasesUr: [] },                                          // Persian گ + ک
    { slug: 'gujrat',        ur: 'گجرات',            aliasesUr: [] },                                          // Persian گ
    { slug: 'gwadar',        ur: 'گوادر',            aliasesUr: [] },                                          // Persian گ; strategic Balochistan port
    { slug: 'hasilpur',      ur: 'حاصل پور',         aliasesUr: [] },                                          // Persian پ
    { slug: 'jahangira',     ur: 'جہانگیرا',         aliasesUr: ['جهانگیرا'] },                               // Urdu ہ + Persian گی; Arabic ه variant kept
    { slug: 'jamrud',        ur: 'جمرود',            aliasesUr: [] },                                          // Identical script
    { slug: 'jaranwala',     ur: 'جڑانوالا',         aliasesUr: ['جڑانوالہ', 'جرانوالا'] },                   // Urdu ڑ retroflex; ہ-end + non-retroflex variants
    { slug: 'jhelum',        ur: 'جہلم',             aliasesUr: ['جهلم'] },                                    // Urdu ہ; Arabic ه variant matching names.ar
    { slug: 'kabirwala',     ur: 'کبیر والا',        aliasesUr: [] },                                          // Persian ک + ی
    { slug: 'kamalia',       ur: 'کمالیہ',           aliasesUr: ['کمالیا', 'کمالیه'] },                       // Urdu ہ; Persian ا + Arabic ه variants
    { slug: 'kambar',        ur: 'قمبر',             aliasesUr: [] },                                          // Identical script
    { slug: 'kotri',         ur: 'کوٹری',            aliasesUr: [] },                                          // Urdu retroflex ٹ + Persian ک ی
    { slug: 'mardan',        ur: 'مردان',            aliasesUr: [] },                                          // Identical script
    { slug: 'matli',         ur: 'ماتلی',            aliasesUr: [] },                                          // Persian ی
    { slug: 'mingora',       ur: 'مینگورہ',          aliasesUr: ['مینگورا', 'مینگوره'] },                     // Urdu ہ + Persian گ ی; Persian ا + Arabic ه variants
    { slug: 'mirpur-khas',   ur: 'میرپور خاص',       aliasesUr: ['میر پور خاص'] },                            // Persian پ + ی; with-space variant
    { slug: 'muzaffarabad',  ur: 'مظفر آباد',        aliasesUr: ['مظفرآباد'] },                               // Identical script + no-space variant
    { slug: 'nankana-sahib', ur: 'ننکانہ صاحب',      aliasesUr: ['ننکانه صاحب'] },                            // Urdu ہ + Persian ک; Arabic ه variant
    { slug: 'pasrur',        ur: 'پسرور',            aliasesUr: [] },                                          // Persian پ
    { slug: 'pattoki',       ur: 'پتوکی',            aliasesUr: [] },                                          // Persian پ + ک + ی
    { slug: 'sambrial',      ur: 'سمبڑیال',          aliasesUr: ['سمبریال'] },                                // Urdu retroflex ڑ; non-retroflex Persian ی variant
    { slug: 'sargodha',      ur: 'سرگودھا',          aliasesUr: ['سرگودها'] },                                // Urdu ھ + Persian گ; Arabic ه variant
    { slug: 'shahdadpur',    ur: 'شہدادپور',         aliasesUr: ['شهدادپور'] },                               // Urdu ہ + Persian پ; Arabic ه variant
    { slug: 'sibi',          ur: 'سبی',              aliasesUr: [] },                                          // Persian ی (Capital of Sibi district, Balochistan)
    { slug: 'skardu',        ur: 'سکردو',            aliasesUr: [] },                                          // Persian ک (Capital of Skardu, Gilgit-Baltistan)
    { slug: 'sukkur',        ur: 'سکھر',             aliasesUr: ['سکر'] },                                     // Urdu ھ + Persian ک; Persian short variant
    { slug: 'tordher',       ur: 'توردھر',           aliasesUr: ['توردهر'] },                                  // Urdu ھ; Arabic ه variant matching names.ar
    { slug: 'turbat',        ur: 'تربت',             aliasesUr: [] },                                          // Identical script
    { slug: 'wazirabad',     ur: 'وزیر آباد',        aliasesUr: ['وزیرآباد'] }                                // Persian ی; no-space variant
];

// ─── Aliases EXPLICITLY DROPPED per review §6 + user §7-§8 (audit trail) ───
const DROPPED_ALIASES = [
    // User §1 + §8: bahawalnagar.بہاولپور semantically references Bahawalpur (different city)
    { slug: 'bahawalnagar', alias: 'بہاولپور', reason: 'Cross-city collision: this is "Bahawalpur" (different city in same region). Same semantic mismatch we already fixed in ASIA-1D-PK names.ar.' },
    // User §2 + §8: mailsi.تصیل میلسی admin-prefix
    { slug: 'mailsi',       alias: 'تصیل میلسی', reason: 'Admin-area prefix "تصیل" (misspelling of "تحصیل" = sub-district). Not the city name itself.' },
    // User §7: Pashto-script aliases
    { slug: 'mingora',      alias: 'مینګورہ', reason: 'Contains Pashto ګ (U+06AB) — fails clean-Urdu-script check' },
    { slug: 'jaranwala',    alias: 'جړانواله', reason: 'Contains Pashto ړ — fails check' },
    // User §7: Sindhi-script aliases
    { slug: 'jaranwala',    alias: 'جڙانوالا', reason: 'Contains Sindhi ڙ — fails check' },
    { slug: 'sambrial',     alias: 'سمبڙیال', reason: 'Contains Sindhi ڙ — fails check (but kept the non-retroflex form)' },
    { slug: 'pattoki',      alias: 'پتوڪي', reason: 'Contains Sindhi ڪ — fails check' },
    { slug: 'muridke',      alias: 'مريدڪي', reason: 'Contains Sindhi ڪ — fails check' },
    { slug: 'kabirwala',    alias: 'ڪبير والا', reason: 'Contains Sindhi ڪ — fails check' },
    { slug: 'kamalia',      alias: 'ڪماليه', reason: 'Contains Sindhi ڪ — fails check' },
    // User §7: Kurdish-script aliases
    { slug: 'jhelum',       alias: 'جێھلۆم', reason: 'Contains Kurdish ێ + ۆ — fails check' },
    { slug: 'muridke',      alias: 'موریدک', reason: 'Truncated/alt form — questionable' },
    { slug: 'muridke',      alias: 'موريدكى', reason: 'Latin-form mojibake' },
    { slug: 'muridke',      alias: 'موريدكي', reason: 'Latin-form mojibake' }
];

// ─── Validation helpers (extended for PK-2: Pashto/Sindhi/Kurdish) ──────
const HAS_LATIN = /[A-Za-z]/;
const HAS_ARABIC_BLOCK = /[؀-ۿݐ-ݿ]/;
// Non-Urdu script chars that should NOT appear in approved aliases.ur:
//   Pashto: ښ ګ څ ځ ډ ړ ڼ ټ
//   Sindhi: ڪ ڙ ٻ ٺ ٿ ڀ ٽ ڄ ڃ ڌ ڍ ڠ ڳ ڱ ڻ
//   Kurdish: ە ڕ ڵ ێ ۆ
// NOTE: ۀ (U+06C0 Persian heh-with-hamza-above) is intentionally NOT in
// this list — it's a legitimate Persian/Urdu letter for ezāfe constructions.
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;

function isCleanUrduScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    if (SUSPICIOUS_NON_URDU.test(s)) return false;
    return HAS_ARABIC_BLOCK.test(s);
}

// IR/AF seed slugs to confirm-NOT-touched
const PK_SEED_SLUGS = new Set([
    'karachi','lahore','islamabad','rawalpindi','peshawar',
    'multan','faisalabad','quetta','hyderabad-pk','sialkot'
]);

function main() {
    // ─── Pre-flight: validate every fix value + alias ───
    const errors = [];
    const seenSlugs = new Set();
    const seenUr = new Set();
    for (const f of FIXES) {
        if (PK_SEED_SLUGS.has(f.slug)) {
            errors.push('FIXES targets a SEED slug: ' + f.slug + ' (should NEVER touch seed)');
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

    // ─── Snapshot pre-apply names.ur + names.ar + names.en for ALL PK entries ───
    // (for post-mutation integrity assertion)
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

        // Idempotency check
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
            previousUr
        });
        console.log('[apply] pk/' + fix.slug.padEnd(18) +
            ' names.ur: "' + (previousUr || '(absent)') + '" → "' + fix.ur + '"' +
            '  aliases+=' + aliasesAddedRow);
    }

    // Defense: bail if any slug wasn't found
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
        // names.ar + names.en must NEVER change
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
        // 10 seed entries must NEVER have names.ur or aliases.ur touched
        if (PK_SEED_SLUGS.has(e.slug)) {
            const afterUr = (e.names && e.names.ur) || null;
            if (before.ur !== afterUr) {
                console.error('[apply] FAILED — PK SEED pk/' + e.slug + ' names.ur mutated: "' + before.ur + '" → "' + afterUr + '"');
                stats.seedTouchedError++;
            }
            const afterAliasJson = JSON.stringify((e.aliases && e.aliases.ur) || null);
            const beforeAliasJson = JSON.stringify(before.aliasUr);
            if (afterAliasJson !== beforeAliasJson) {
                console.error('[apply] FAILED — PK SEED pk/' + e.slug + ' aliases.ur mutated: ' + beforeAliasJson + ' → ' + afterAliasJson);
                stats.seedTouchedError++;
            }
        }
    }
    if (stats.seedTouchedError > 0) {
        console.error('[apply] FAILED — ' + stats.seedTouchedError + ' PK seed entries mutated (must be 0)');
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // ─── Audit report ───
    const L = [];
    L.push('# PLACE-NAMES-UR-PK-2-APPLY — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: PK (43 new ASIA-1D-PK entries only)');
    L.push('**Total rows applied**: ' + stats.applied);
    L.push('**Already-applied (skipped, idempotent)**: ' + stats.skippedAlreadyApplied);
    L.push('**names.ur newly set (was absent)**: ' + stats.namesUrSet);
    L.push('**names.ur overwrote an existing value**: ' + stats.namesUrOverwrote);
    L.push('**aliases.ur added**: ' + stats.aliasesUrAdded);
    L.push('**10 PK seed entries touched (must be 0)**: ' + stats.seedTouchedError);
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
    L.push('## Aliases explicitly NOT added (review §6 + user §7-8 audit)');
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
    L.push('- ❌ `names.ar` not modified (preserves ASIA-1D-PK 3 NAME_AR_FIXES)');
    L.push('- ❌ `names.en` not modified');
    L.push('- ❌ 10 PK seed entries not touched (UR-PK-1 baseline preserved)');
    L.push('- ❌ Other countries not touched');
    L.push('- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html)');
    L.push('- ❌ No runtime translation');
    L.push('- ❌ No translation API');
    L.push('- ❌ No browser auto-translate dependency');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    // ─── Console summary ───
    console.log('');
    console.log('═══ PLACE-NAMES-UR-PK-2-APPLY — Apply Summary ═══');
    console.log('  Applied (new):                 ' + stats.applied);
    console.log('  Skipped (idempotent):          ' + stats.skippedAlreadyApplied);
    console.log('  names.ur newly set:            ' + stats.namesUrSet);
    console.log('  names.ur overwrote existing:   ' + stats.namesUrOverwrote);
    console.log('  aliases.ur added:              ' + stats.aliasesUrAdded);
    console.log('  PK seed touched (must be 0):   ' + stats.seedTouchedError);
}

main();
