// scripts/geodata/_place_names_ur_pk_5_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-PK-5 (Fast Track) — apply real Urdu names + clean aliases
// for the 29 PK cities merged via ASIA-1D-PK-MISSING-AR-MAJORS-1B (cfd7015).
//
// User decision (2026-05-19): Fast Track Review+Apply — single-phase per
// established policy (no semantic mismatches, no duplicates, ≤3 manual decisions).
//
// GeoNames had ZERO Urdu/Persian/Arabic alternatenames for all 29 cities.
// All 29 Urdu names are MANUAL — sourced from Urdu Wikipedia canonical
// forms + standard Urdu transliteration conventions:
//   -abad → آباد, -pur → پور (Persian پ), -kot → کوٹ (Urdu retroflex ٹ),
//   -khan → خان, Dera- → ڈیرہ (retroflex ڈ + ہ),
//   Tando- → ٹنڈو (retroflex ٹ + ڈ), Mandi- → منڈی (retroflex ڈ + ی)
//
// Per user's rules (PLACE-NAMES-UR-PK-5 task spec 2026-05-19):
//   1. Add names.ur for 29 BATCH-B entries only
//   2. Don't touch 90 prior PK entries
//   3. Don't change names.ar (preserves MAJORS-1B Arabic)
//   4. Don't change names.en
//   5. Add clean useful aliases.ur only
//   6. Don't change server.js / js/app.js / fillLangMap / index.html
//   7. No runtime translation, no API, no AI translation, no browser translate
//   8. Idempotent re-run
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesUrPk5.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-ur-pk-5-apply-report.md';

// ─── 29 FIXES — Wikipedia Urdu canonical + standard translit ─────────────
// Score guide:
//   95 = Wikipedia Urdu article direct + uses Urdu retroflex letters (ٹ ڈ ڑ ں ھ پ چ گ ژ)
//   90 = uses Urdu retroflex but matches Wikipedia known patterns
//   85 = uses Persian-Urdu shared letters (ی ہ پ) only
//   80 = pure Arabic-Urdu shared script (rare for PK)
const FIXES = [
    // ──── Tier 2 (pop 100k-155k) — 23 cities ────
    { slug: 'layyah',              ur: 'لیہ',                  aliasesUr: [] },                              // Wikipedia Urdu canonical
    { slug: 'lodhran',             ur: 'لودھراں',              aliasesUr: ['لودھران'] },                     // ھ + retroflex ں; non-retroflex alias
    { slug: 'khanpur',             ur: 'خانپور',               aliasesUr: ['خان پور'] },                     // Persian پ; with-space variant
    { slug: 'attock-city',         ur: 'اٹک',                  aliasesUr: ['اٹاک'] },                        // Wikipedia: retroflex ٹ; double-A variant
    { slug: 'khuzdar',             ur: 'خضدار',                aliasesUr: [] },                              // Shared script (Arabic+Urdu identical)
    { slug: 'manjhand',            ur: 'منجھند',               aliasesUr: [] },                              // Urdu ھ
    { slug: 'bhakkar',             ur: 'بھکر',                 aliasesUr: [] },                              // Urdu ھ + Persian ک
    { slug: 'narowal',             ur: 'نارووال',              aliasesUr: [] },                              // Shared script
    { slug: 'mandi-bahauddin',     ur: 'منڈی بہاؤالدین',       aliasesUr: ['منڈی بہاؤ الدین'] },             // retroflex ڈ + ؤ + ہ + Persian ی; with-space variant
    { slug: 'mianwali',            ur: 'میانوالی',             aliasesUr: [] },                              // Persian ی
    { slug: 'pakpattan',           ur: 'پاکپتن',               aliasesUr: ['پاک پتن'] },                     // Persian پ; with-space variant
    { slug: 'tando-adam',          ur: 'ٹنڈو آدم',             aliasesUr: ['ٹنڈوآدم'] },                     // retroflex ٹ + ڈ; no-space variant
    { slug: 'toba-tek-singh',      ur: 'ٹوبہ ٹیک سنگھ',        aliasesUr: [] },                              // retroflex ٹ + ٹ + ہ + گ + ھ
    { slug: 'shahdad-kot',         ur: 'شہداد کوٹ',            aliasesUr: ['شہدادکوٹ'] },                    // Urdu ہ + retroflex ٹ; no-space variant
    { slug: 'charsadda',           ur: 'چارسدہ',               aliasesUr: [] },                              // Urdu چ + ہ
    { slug: 'ghotki',              ur: 'گھوٹکی',               aliasesUr: [] },                              // Persian گ + ھ + retroflex ٹ + Persian ی
    { slug: 'phool-nagar',         ur: 'پھول نگر',             aliasesUr: ['پھولنگر'] },                     // Persian پ + ھ + گ; no-space variant
    { slug: 'tando-muhammad-khan', ur: 'ٹنڈو محمد خان',        aliasesUr: ['ٹنڈو محمد خاں'] },              // retroflex ٹ + ڈ; with retroflex خاں variant
    { slug: 'vihari',              ur: 'وہاڑی',                aliasesUr: ['ویہاڑی'] },                      // Urdu ہ + retroflex ڑ + Persian ی; ی-initial variant
    { slug: 'dera-murad-jamali',   ur: 'ڈیرہ مراد جمالی',      aliasesUr: ['ڈیرا مراد جمالی'] },             // retroflex ڈ + ہ; ا-end Dera variant
    { slug: 'kot-addu',            ur: 'کوٹ ادو',              aliasesUr: ['کوٹادو'] },                      // retroflex ٹ; no-space variant
    { slug: 'khushab',             ur: 'خوشاب',                aliasesUr: [] },                              // Shared script
    { slug: 'chakwal',             ur: 'چکوال',                aliasesUr: [] },                              // Urdu چ + Persian ک

    // ──── Tier 3 (pop 50k-99k) — 6 cities ────
    { slug: 'swabi',               ur: 'صوابی',                aliasesUr: [] },                              // Persian ی
    { slug: 'mansehra',            ur: 'مانسہرہ',              aliasesUr: ['مانسہرا'] },                     // Urdu ہ + ہ; ا-end variant
    { slug: 'sanghar',             ur: 'سانگھڑ',               aliasesUr: ['سنگھڑ'] },                       // Persian گ + ھ + retroflex ڑ; no-alif variant
    { slug: 'haripur',             ur: 'ہری پور',              aliasesUr: ['ہریپور'] },                      // Urdu ہ + Persian ی + پ; no-space variant
    { slug: 'rajanpur',            ur: 'راجن پور',             aliasesUr: ['راجنپور'] },                     // Persian پ; no-space variant
    { slug: 'zhob',                ur: 'ژوب',                  aliasesUr: [] },                              // Persian ژ (Zh phoneme)
];

// ─── Validation helpers ─────────────────────────────────────────────────
const HAS_LATIN = /[A-Za-z]/;
const HAS_ARABIC_BLOCK = /[؀-ۿݐ-ݿ]/;
// Pashto / Sindhi / Kurdish letters we don't want polluting names.ur
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;

function isCleanUrduScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    if (SUSPICIOUS_NON_URDU.test(s)) return false;
    return HAS_ARABIC_BLOCK.test(s);
}

// Slugs we MUST NOT mutate (90 prior PK entries = 70 + 20 MAJORS-1A)
const PK_PRIOR_90_SLUGS = new Set([
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
    'kharian','gujar-khan','lala-musa','chunian','chitral','rohri','rawalakot',
    // 20 ASIA-1D-PK-MISSING-AR-MAJORS-1A (UR-PK-4)
    'bahawalpur','dera-ismail-khan','battagram','okara','kasur',
    'tando-allahyar','larkana','nawabshah','hafizabad','kamoke',
    'abbottabad','shikarpur','shahkot','hub','garhi-khairo',
    'khairpur-mirs','saddiqabad','burewala','arif-wala','kohat'
]);

function main() {
    // Pre-flight
    const errors = [];
    const seenSlugs = new Set();
    const seenUr = new Set();
    for (const f of FIXES) {
        if (PK_PRIOR_90_SLUGS.has(f.slug)) {
            errors.push('FIXES targets a PRIOR 90-PK slug: ' + f.slug + ' (must NEVER touch prior entries)');
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
            console.log('[apply] pk/' + fix.slug.padEnd(22) + ' SKIP (idempotent — names.ur already = "' + fix.ur + '")');
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
        console.log('[apply] pk/' + fix.slug.padEnd(22) +
            ' names.ur: "' + (previousUr || '(absent)') + '" → "' + fix.ur + '"' +
            '  aliases+=' + aliasesAddedRow);
    }

    if (stats.slugNotFoundInCurated.length) {
        console.error('[apply] FAILED — slugs missing in curated:');
        for (const s of stats.slugNotFoundInCurated) console.error('  - ' + s);
        process.exit(1);
    }

    // Post-apply assertions — names.ar, names.en, and prior 90 must NEVER mutate
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

        if (PK_PRIOR_90_SLUGS.has(e.slug)) {
            const afterUr = (e.names && e.names.ur) || null;
            if (before.ur !== afterUr) {
                console.error('[apply] FAILED — PRIOR-90 pk/' + e.slug + ' names.ur mutated: "' + before.ur + '" → "' + afterUr + '"');
                stats.priorTouchedError++;
            }
            const afterAlias = JSON.stringify((e.aliases && e.aliases.ur) || null);
            const beforeAlias = JSON.stringify(before.aliasUr);
            if (afterAlias !== beforeAlias) {
                console.error('[apply] FAILED — PRIOR-90 pk/' + e.slug + ' aliases.ur mutated');
                stats.priorTouchedError++;
            }
        }
    }
    if (stats.priorTouchedError > 0) {
        console.error('[apply] FAILED — ' + stats.priorTouchedError + ' prior-90 entries mutated (must be 0)');
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // Audit report
    const L = [];
    L.push('# PLACE-NAMES-UR-PK-5 (Fast Track) — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: PK (29 ASIA-1D-PK-MISSING-AR-MAJORS-1B entries only)');
    L.push('**Total rows applied**: ' + stats.applied);
    L.push('**Skipped (idempotent)**: ' + stats.skippedAlreadyApplied);
    L.push('**names.ur newly set**: ' + stats.namesUrSet);
    L.push('**names.ur overwrote**: ' + stats.namesUrOverwrote);
    L.push('**aliases.ur added**: ' + stats.aliasesUrAdded);
    L.push('**PRIOR 90-PK touched (must be 0)**: ' + stats.priorTouchedError);
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
    L.push('- ❌ `names.ar` not modified (preserves MAJORS-1B Arabic)');
    L.push('- ❌ `names.en` not modified');
    L.push('- ❌ 90 prior PK entries not touched');
    L.push('- ❌ Other countries not touched');
    L.push('- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html)');
    L.push('- ❌ No runtime translation');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ PLACE-NAMES-UR-PK-5 (Fast Track) — Apply Summary ═══');
    console.log('  Applied (new):                 ' + stats.applied);
    console.log('  Skipped (idempotent):          ' + stats.skippedAlreadyApplied);
    console.log('  names.ur newly set:            ' + stats.namesUrSet);
    console.log('  aliases.ur added:              ' + stats.aliasesUrAdded);
    console.log('  PRIOR 90-PK touched (must=0):  ' + stats.priorTouchedError);
}

main();
