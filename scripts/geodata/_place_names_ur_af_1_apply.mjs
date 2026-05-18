// scripts/geodata/_place_names_ur_af_1_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-AF-1 — apply user-approved Urdu names + aliases for 36 AF cities.
//
// User decision (2026-05-18): "approve all 36 as proposed" per:
//   reports/place-names-ur-af-1-review.md
//
// Scope per user's explicit 7-point list:
//   1. Add names.ur for 36 AF rows
//   2. Add aliases.ur (clean variants only — 5 suspicious entries dropped)
//   3. Do NOT touch names.ar
//   4. Do NOT touch names.en
//   5. No runtime translation
//   6. No Urdu enrichment for other countries
//   7. No code changes (server.js, js/app.js, fillLangMap untouched)
//
// `namesProvenance.ur` is NOT added in this commit — the user's 7-point
// list mentions only names.ur + aliases.ur. Provenance can be added in
// a follow-up if desired.
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// Idempotent — re-running on already-applied rows is a no-op.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesUrAf1.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-ur-af-1-apply-report.md';

// ─── 36 FIXES (matches §1 of the review report; user-approved) ───
// Per-row: { slug, ur, aliasesUr } (no provenance per user's 7-point list)
const FIXES = [
    // Watch-list (13 user-listed cities) — listed first for visibility
    { slug: 'kabul',          ur: 'کابل',         aliasesUr: ['کابول'] },
    { slug: 'herat',          ur: 'ہرات',         aliasesUr: [] },
    { slug: 'mazar-e-sharif', ur: 'مزار شریف',    aliasesUr: [] },
    { slug: 'jalalabad',      ur: 'جلال آباد',    aliasesUr: ['جلال‌آباد'] },
    { slug: 'kunduz',         ur: 'کندوز',        aliasesUr: ['قندوز'] },
    { slug: 'kandahar',       ur: 'قندھار',       aliasesUr: ['قندہار', 'قندهار'] },
    { slug: 'charikar',       ur: 'چاریکار',      aliasesUr: ['چاريكار'] },
    { slug: 'pul-e-khumri',   ur: 'پل خمری',      aliasesUr: [] },
    { slug: 'pul-e-alam',     ur: 'پل علم',       aliasesUr: [] },
    { slug: 'sar-e-pul',      ur: 'سر پل',        aliasesUr: ['سرپل'] },
    { slug: 'fayroz-koh',     ur: 'فیروز کوہ',    aliasesUr: ['فیروز کوه', 'چغچران'] },  // چغچران = pre-2014 Chaghcharan
    { slug: 'qala-i-naw',     ur: 'قلعہ نو',      aliasesUr: ['قلعہ ناؤ', 'قلعۀ نو', 'قلعة ناو', 'قلعه ناو'] },
    { slug: 'lashkar-gah',    ur: 'لشکر گاہ',     aliasesUr: ['لشکرگاہ', 'لشكر گاه'] },
    { slug: 'farah',          ur: 'فراه',         aliasesUr: ['فراہ'] },                  // user override: فراه primary, فراہ alias

    // Other 22 AF cities
    { slug: 'zaranj',         ur: 'زرنج',         aliasesUr: [] },
    { slug: 'taloqan',        ur: 'تالقان',       aliasesUr: [] },
    { slug: 'shibirghan',     ur: 'شبرغان',       aliasesUr: ['شبرغن'] },
    { slug: 'sidqabad',       ur: 'سدق آباد',     aliasesUr: ['صدقآباد', 'قلعۀ وزیر'] },
    { slug: 'aibak',          ur: 'آی بک',        aliasesUr: ['آیبک', 'ایبک', 'سمنگان'] },
    { slug: 'qalat',          ur: 'قلات',         aliasesUr: [] },
    { slug: 'nili',           ur: 'نیلی',         aliasesUr: [] },
    { slug: 'maymana',        ur: 'میمنہ',        aliasesUr: ['میمنه', 'ضلع میمنہ'] },
    { slug: 'mehtar-lam',     ur: 'مہتر لام',     aliasesUr: ['مهتر لام'] },              // مختار لام explicitly NOT kept (semantic mismatch)
    { slug: 'khost',          ur: 'خوست',         aliasesUr: ['متون'] },
    { slug: 'ghazni',         ur: 'غزنی',         aliasesUr: ['غزنین'] },
    { slug: 'gardez',         ur: 'گردیز',        aliasesUr: ['گرديز'] },
    { slug: 'fayzabad',       ur: 'فیض آباد',     aliasesUr: [] },
    { slug: 'bamyan',         ur: 'بامیان',       aliasesUr: [] },
    { slug: 'balkh',          ur: 'بلخ',          aliasesUr: [] },
    { slug: 'baghlan',        ur: 'بغلان',        aliasesUr: ['باغلان', 'بغلان جديد'] },
    { slug: 'asadabad',       ur: 'اسد آباد',     aliasesUr: ['چغه سرای'] },
    { slug: 'bazarak',        ur: 'بازارک',       aliasesUr: ['بازاراک'] },
    { slug: 'sharan',         ur: 'شاران',        aliasesUr: ['شرن'] },
    { slug: 'tarinkot',       ur: 'ترین کوٹ',     aliasesUr: ['طرین کوٹ'] },
    { slug: 'parun',          ur: 'پارون',        aliasesUr: ['پاروں'] },                 // پرنس explicitly DROPPED (unrelated)
    { slug: 'maydanshakhr',   ur: 'میدان شہر',    aliasesUr: ['میدان شهر'] },
];

// ─── Aliases EXPLICITLY DROPPED per review report §5 (audit trail) ───
const DROPPED_ALIASES = [
    { slug: 'shibirghan',  alias: 'مرکز ولايت شبرغان', reason: 'admin office phrase, not a city name' },
    { slug: 'parun',       alias: 'پرنس',                reason: 'Persian/Urdu word for "Prince" — unrelated to the city' },
    { slug: 'lashkar-gah', alias: 'لښکرگاه بسټ',        reason: 'contains Pashto ښ + ټ — fails clean-check' },
    { slug: 'baghlan',     alias: 'صناعتی',              reason: 'Persian for "industrial" — generic adjective, not a place name' },
    { slug: 'mehtar-lam',  alias: 'مختار لام',           reason: 'Arabic word "chosen" — semantic mismatch (city is "Mehtar")' },
];

// ─── Validation ─────────────────────────────────────────────────────────
const HAS_LATIN = /[A-Za-z]/;
const HAS_ARABIC_BLOCK = /[؀-ۿݐ-ݿ]/;
// Letters NOT in standard Urdu script — Pashto/Kurdish-specific letters
// that should NOT appear in approved names.ur or aliases.ur.
// NOTE: `ۀ` (U+06C0 Persian heh-with-hamza-above) is intentionally NOT in
// this list — it is a legitimate Persian letter for ezāfe constructions
// commonly used in Persian-style aliases for place names (e.g. `قلعۀ نو`,
// `قلعۀ وزیر`). Urdu readers handle it natively. The truly-non-Urdu
// letters are: ښ ګ څ ځ ډ ړ ڼ ټ (Pashto), ە ڕ ڵ (Kurdish), ٿ (Sindhi).
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
        namesUrSet: 0,        // names.ur newly set
        namesUrOverwrote: 0,  // names.ur was already === names.en (fillchain) — replaced
        aliasesUrAdded: 0,
    };
    const appliedRows = [];

    const bySlug = new Map();
    for (const e of curated) bySlug.set(e.countryCode + '/' + e.slug, e);

    for (const fix of FIXES) {
        const key = 'af/' + fix.slug;
        const entry = bySlug.get(key);
        if (!entry) {
            stats.slugNotFoundInCurated.push(key);
            continue;
        }

        // Idempotency check
        if (entry.names && entry.names.ur === fix.ur) {
            stats.skippedAlreadyApplied++;
            console.log('[apply] af/' + fix.slug.padEnd(20) + ' SKIP (idempotent — names.ur already = "' + fix.ur + '")');
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
        console.log('[apply] af/' + fix.slug.padEnd(20) +
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
    L.push('# PLACE-NAMES-UR-AF-1 — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: AF');
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
    L.push('## Aliases explicitly NOT added (review §5 audit)');
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
    L.push('');
    L.push('Restore command: `cp ' + path.basename(BACKUP) + ' curated-places.json`');
    L.push('');
    L.push('## What this apply did NOT do');
    L.push('');
    L.push('- ❌ `names.ar` not modified');
    L.push('- ❌ `names.en` not modified');
    L.push('- ❌ `namesProvenance` not added (not in user\'s 7-point list)');
    L.push('- ❌ No other country touched');
    L.push('- ❌ No code changes');
    L.push('- ❌ No runtime translation');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    // ─── Console summary ───
    console.log('');
    console.log('═══ PLACE-NAMES-UR-AF-1 — Apply Summary ═══');
    console.log('  Applied (new):                ' + stats.applied);
    console.log('  Skipped (idempotent):         ' + stats.skippedAlreadyApplied);
    console.log('  names.ur newly set:           ' + stats.namesUrSet);
    console.log('  names.ur overwrote fillchain: ' + stats.namesUrOverwrote);
    console.log('  aliases.ur added:             ' + stats.aliasesUrAdded);
}

main();
