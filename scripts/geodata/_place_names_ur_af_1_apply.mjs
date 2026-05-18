// scripts/geodata/_place_names_ur_af_1_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-AF-1 — apply 36 user-approved Urdu names for AF curated rows.
//
// User decision (2026-05-18): "approve all 36 as proposed" with ONE edit:
//   farah → فراه  (NOT فراہ; user-preferred Arabic-ه form,
//                   matches existing Urdu Wikipedia convention)
//
// Per-row data structure: { slug, ur, qualityScore, source, method,
// notes, aliasesUr (clean variants only — drop suspicious entries) }
//
// Sources:
//   "geonames" + method="alternatename"  — pulled from GeoNames af raw
//                                          alternatenames (Persian/Urdu script)
//   "manual-review" + method="transliteration" — clean ar→ur where Arabic
//                                                script is identical
//   "manual-review" + method="urdu-canonical"  — Urdu Wikipedia canonical
//                                                form (e.g. کندہار↔قندھار
//                                                heh-doachashmee)
//
// Mutates:
//   db/places/curated-places.json (adds names.ur + aliases.ur + namesProvenance.ur)
//
// Does NOT touch names.ar / names.en / aliases.ar / aliases.en / any other field.
//
// Idempotent: re-running on already-applied rows is a no-op (detects existing
// names.ur and skips). Backup written before any mutation.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesUrAf1.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-ur-af-1-apply-report.md';

// ─── User-approved per-row data (from place-names-ur-af-1-review.md) ───
const FIXES = [
    // ── User-watch list (13 cities, listed first) ──
    { slug: 'kabul',          ur: 'کابل',        qualityScore: 95, source: 'geonames', method: 'alternatename', aliasesUr: ['کابول'], notes: 'Strong consensus across sources' },
    { slug: 'herat',          ur: 'ہرات',        qualityScore: 95, source: 'geonames', method: 'alternatename', aliasesUr: [], notes: 'Urdu form with initial ہ heh-goal' },
    { slug: 'mazar-e-sharif', ur: 'مزار شریف',   qualityScore: 90, source: 'geonames', method: 'alternatename', aliasesUr: [], notes: 'Persian-script consensus' },
    { slug: 'jalalabad',      ur: 'جلال آباد',   qualityScore: 80, source: 'manual-review', method: 'transliteration', aliasesUr: ['جلال‌آباد'], notes: 'Identical script in ar/ur; alias with ZWNJ for Persian convention' },
    { slug: 'kunduz',         ur: 'کندوز',       qualityScore: 85, source: 'geonames', method: 'alternatename', aliasesUr: ['قندوز'], notes: 'Persian کندوز form; Arabic قندوز as alias' },
    { slug: 'kandahar',       ur: 'قندھار',      qualityScore: 95, source: 'manual-review', method: 'urdu-canonical', aliasesUr: ['قندہار', 'قندهار'], notes: 'Urdu Wikipedia canonical with ھ heh-doachashmee; GeoNames variant قندہار + Arabic قندهار as aliases' },
    { slug: 'charikar',       ur: 'چاریکار',     qualityScore: 95, source: 'geonames', method: 'alternatename', aliasesUr: ['چاريكار'], notes: 'User-listed; matches expected form exactly' },
    { slug: 'pul-e-khumri',   ur: 'پل خمری',     qualityScore: 90, source: 'geonames', method: 'alternatename', aliasesUr: [], notes: 'User-listed; matches expected form exactly' },
    { slug: 'pul-e-alam',     ur: 'پل علم',      qualityScore: 90, source: 'geonames', method: 'alternatename', aliasesUr: [], notes: 'User-listed; matches expected form exactly' },
    { slug: 'sar-e-pul',      ur: 'سر پل',       qualityScore: 90, source: 'geonames', method: 'alternatename', aliasesUr: ['سرپل'], notes: 'User-listed; matches expected form exactly' },
    { slug: 'fayroz-koh',     ur: 'فیروز کوہ',   qualityScore: 95, source: 'geonames', method: 'alternatename', aliasesUr: ['فیروز کوه', 'چغچران'], notes: 'User-listed; Urdu کوہ; alias چغچران = pre-2014 historical name Chaghcharan' },
    { slug: 'qala-i-naw',     ur: 'قلعہ نو',     qualityScore: 95, source: 'geonames', method: 'alternatename', aliasesUr: ['قلعہ ناؤ', 'قلعۀ نو'], notes: 'User-listed; Urdu ہ + ؤ variant as alias' },
    { slug: 'lashkar-gah',    ur: 'لشکر گاہ',    qualityScore: 95, source: 'geonames', method: 'alternatename', aliasesUr: ['لشکرگاہ', 'لشكر گاه'], notes: 'User-listed; Urdu گاہ form; no-space variant + Arabic-letter variant as aliases' },
    { slug: 'farah',          ur: 'فراه',        qualityScore: 90, source: 'manual-review', method: 'urdu-wikipedia-canonical', aliasesUr: ['فراہ'], notes: '🚨 USER OVERRIDE: chose فراه (Arabic ه) over GeoNames فراہ; matches Urdu Wikipedia title. فراہ kept as searchable alias.' },

    // ── Other AF cities (23 cities) ──
    { slug: 'zaranj',         ur: 'زرنج',         qualityScore: 75, source: 'manual-review', method: 'transliteration', aliasesUr: [], notes: 'Identical in ar/ur (no Persian-only letters needed)' },
    { slug: 'taloqan',        ur: 'تالقان',       qualityScore: 75, source: 'manual-review', method: 'transliteration', aliasesUr: [], notes: 'Identical in ar/ur' },
    { slug: 'shibirghan',     ur: 'شبرغان',       qualityScore: 85, source: 'geonames', method: 'alternatename', aliasesUr: ['شبرغن'], notes: 'Clean Arabic-script alternatename; admin form مرکز ولايت شبرغان dropped (office, not a name)' },
    { slug: 'sidqabad',       ur: 'سدق آباد',     qualityScore: 70, source: 'manual-review', method: 'transliteration', aliasesUr: ['صدقآباد', 'قلعۀ وزیر'], notes: 'Identical in ar/ur; قلعۀ وزیر = historical Persian name' },
    { slug: 'aibak',          ur: 'آی بک',        qualityScore: 90, source: 'geonames', method: 'alternatename', aliasesUr: ['آیبک', 'ایبک', 'سمنگان'], notes: 'Persian ی+ک; سمنگان = province name (commonly used for the city)' },
    { slug: 'qalat',          ur: 'قلات',         qualityScore: 75, source: 'manual-review', method: 'transliteration', aliasesUr: [], notes: 'Identical in ar/ur' },
    { slug: 'nili',           ur: 'نیلی',         qualityScore: 85, source: 'geonames', method: 'alternatename', aliasesUr: [], notes: 'Persian ی form' },
    { slug: 'maymana',        ur: 'میمنہ',        qualityScore: 90, source: 'geonames', method: 'alternatename', aliasesUr: ['میمنه', 'ضلع میمنہ'], notes: 'Urdu ہ; Arabic ه variant + long form as aliases' },
    { slug: 'mehtar-lam',     ur: 'مہتر لام',     qualityScore: 70, source: 'manual-review', method: 'urdu-canonical', aliasesUr: ['مهتر لام'], notes: 'Urdu form with ہ for /h/; Arabic مختار لام variant dropped (means "chosen", semantically different)' },
    { slug: 'khost',          ur: 'خوست',         qualityScore: 75, source: 'manual-review', method: 'transliteration', aliasesUr: ['متون'], notes: 'Identical in ar/ur; متون = historical Pashto/Persian name' },
    { slug: 'ghazni',         ur: 'غزنی',         qualityScore: 85, source: 'geonames', method: 'alternatename', aliasesUr: ['غزنین'], notes: 'Persian ی ending; long form غزنین as alias' },
    { slug: 'gardez',         ur: 'گردیز',        qualityScore: 90, source: 'geonames', method: 'alternatename', aliasesUr: ['گرديز'], notes: 'Persian گ+ی; Arabic-ي variant as alias' },
    { slug: 'fayzabad',       ur: 'فیض آباد',     qualityScore: 90, source: 'geonames', method: 'alternatename', aliasesUr: [], notes: 'Persian ی' },
    { slug: 'bamyan',         ur: 'بامیان',       qualityScore: 90, source: 'geonames', method: 'alternatename', aliasesUr: [], notes: 'Persian ی' },
    { slug: 'balkh',          ur: 'بلخ',          qualityScore: 75, source: 'manual-review', method: 'transliteration', aliasesUr: [], notes: 'Identical in ar/ur' },
    { slug: 'baghlan',        ur: 'بغلان',        qualityScore: 75, source: 'geonames', method: 'alternatename', aliasesUr: ['باغلان', 'بغلان جديد'], notes: 'Modern short form; long form باغلان + بغلان جديد (new district) as aliases' },
    { slug: 'asadabad',       ur: 'اسد آباد',     qualityScore: 70, source: 'manual-review', method: 'transliteration', aliasesUr: ['چغه سرای'], notes: 'Identical in ar/ur; چغه سرای = historical Persian name Chaghasaray' },
    { slug: 'bazarak',        ur: 'بازارک',       qualityScore: 85, source: 'geonames', method: 'alternatename', aliasesUr: ['بازاراک'], notes: 'Capital of Panjshir; Persian ک' },
    { slug: 'sharan',         ur: 'شاران',        qualityScore: 70, source: 'manual-review', method: 'transliteration', aliasesUr: ['شرن'], notes: 'Identical in ar/ur; شرن short form as alias' },
    { slug: 'tarinkot',       ur: 'ترین کوٹ',     qualityScore: 95, source: 'geonames', method: 'alternatename', aliasesUr: ['طرین کوٹ'], notes: 'Urdu retroflex ٹ; ط-variant as alias' },
    { slug: 'parun',          ur: 'پارون',        qualityScore: 85, source: 'geonames', method: 'alternatename', aliasesUr: ['پاروں'], notes: 'Persian پ; ں-variant as alias; پرنس dropped (means "Prince" — unrelated)' },
    { slug: 'maydanshakhr',   ur: 'میدان شہر',    qualityScore: 95, source: 'geonames', method: 'alternatename', aliasesUr: ['میدان شهر'], notes: 'Urdu شہر with ہ; Arabic ه variant as alias' },
];

// ─── Validation ───
const HAS_LATIN = /[A-Za-z]/;
const HAS_ARABIC_BLOCK = /[؀-ۿ]/;
// Suspicious chars that shouldn't appear in Urdu names (Pashto/Kurdish letters
// not part of standard Urdu script).
const SUSPICIOUS = /[ښګڵڼٿټ]/;

function isCleanUrduScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    if (SUSPICIOUS.test(s)) return false;
    return HAS_ARABIC_BLOCK.test(s);
}

function main() {
    // Pre-flight validate every fix value + alias
    const errors = [];
    const seenSlugs = new Set();
    const seenUr = new Set();
    for (const f of FIXES) {
        if (seenSlugs.has(f.slug)) errors.push('Duplicate slug in FIXES: ' + f.slug);
        seenSlugs.add(f.slug);
        if (!isCleanUrduScript(f.ur)) {
            errors.push(f.slug + ' .ur="' + f.ur + '" fails clean-Urdu-script check');
        }
        if (seenUr.has(f.ur)) errors.push('Duplicate Urdu name: ' + f.ur + ' (slug ' + f.slug + ')');
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
    console.log('[apply] pre-flight OK — ' + FIXES.length + ' fixes validated');

    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));

    // Backup BEFORE any mutation (only if not already present)
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    } else {
        console.log('[apply] backup already exists (skip rewrite):', BACKUP);
    }

    const stats = {
        applied: 0,
        skippedAlreadyApplied: 0,
        slugNotFoundInCurated: [],
        addedAliasesAr: 0, addedNamesUr: 0, addedAliasesUr: 0, addedProvenance: 0
    };
    const appliedRows = [];

    // Build slug → entry index
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
        if (entry.names && entry.names.ur === fix.ur
            && entry.namesProvenance && entry.namesProvenance.ur
            && entry.namesProvenance.ur.phase === 'PLACE-NAMES-UR-AF-1') {
            stats.skippedAlreadyApplied++;
            console.log('[apply] ' + key.padEnd(28) + ' SKIP (idempotent — already applied)');
            continue;
        }

        if (!entry.names) entry.names = {};
        if (!entry.aliases) entry.aliases = {};
        if (!entry.namesProvenance) entry.namesProvenance = {};

        // 1. names.ur (NEVER touch ar/en)
        const hadUr = !!entry.names.ur;
        entry.names.ur = fix.ur;
        if (!hadUr) stats.addedNamesUr++;

        // 2. aliases.ur (only add clean ones, no duplicates against name.ur)
        if (fix.aliasesUr && fix.aliasesUr.length) {
            const existing = Array.isArray(entry.aliases.ur) ? entry.aliases.ur.slice() : [];
            const seen = new Set([fix.ur, ...existing]);
            for (const a of fix.aliasesUr) {
                if (!seen.has(a)) {
                    existing.push(a);
                    seen.add(a);
                    stats.addedAliasesUr++;
                }
            }
            if (existing.length) entry.aliases.ur = existing;
        }

        // 3. namesProvenance.ur
        entry.namesProvenance.ur = {
            source: fix.source,
            method: fix.method,
            phase:  'PLACE-NAMES-UR-AF-1',
            reviewed: true,
            qualityScore: fix.qualityScore,
            notes: fix.notes || ''
        };
        stats.addedProvenance++;

        stats.applied++;
        appliedRows.push({
            slug: fix.slug,
            ur: fix.ur,
            qualityScore: fix.qualityScore,
            source: fix.source,
            aliasesUrCount: (entry.aliases.ur || []).length
        });
        console.log('[apply] ' + key.padEnd(28) + ' names.ur="' + fix.ur + '" Q=' + fix.qualityScore + ' aliases=' + ((fix.aliasesUr || []).length));
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
    L.push('# PLACE-NAMES-UR-AF-1 — Apply audit');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: AF');
    L.push('**Total rows applied**: ' + stats.applied);
    L.push('**Already-applied (skipped)**: ' + stats.skippedAlreadyApplied);
    L.push('**names.ur added**: ' + stats.addedNamesUr);
    L.push('**aliases.ur added**: ' + stats.addedAliasesUr);
    L.push('**namesProvenance.ur added**: ' + stats.addedProvenance);
    L.push('');
    L.push('## All 36 applied rows (sorted by qualityScore desc)');
    L.push('');
    appliedRows.sort((a, b) => b.qualityScore - a.qualityScore);
    L.push('| slug | names.ur | qualityScore | source | aliases.ur count |');
    L.push('| --- | --- | ---: | --- | ---: |');
    for (const r of appliedRows) {
        L.push('| `' + r.slug + '` | ' + r.ur + ' | ' + r.qualityScore + ' | ' + r.source + ' | ' + r.aliasesUrCount + ' |');
    }
    L.push('');
    L.push('## Backup');
    L.push('');
    L.push('Pre-apply backup written to:');
    L.push('```');
    L.push(BACKUP);
    L.push('```');
    L.push('');
    L.push('Restore command: `cp ' + path.basename(BACKUP) + ' curated-places.json`');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit report:', REPORT);

    console.log('');
    console.log('═══ PLACE-NAMES-UR-AF-1 — Apply Summary ═══');
    console.log('  Applied (new):           ' + stats.applied);
    console.log('  Skipped (idempotent):    ' + stats.skippedAlreadyApplied);
    console.log('  names.ur added:          ' + stats.addedNamesUr);
    console.log('  aliases.ur added:        ' + stats.addedAliasesUr);
    console.log('  namesProvenance.ur added:' + stats.addedProvenance);
}

main();
