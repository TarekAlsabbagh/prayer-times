// scripts/geodata/_place_names_ur_pk_6_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-PK-6 (Fast Track) — apply real Urdu names + clean aliases
// for the 29 PK cities merged via ASIA-1D-PK-MISSING-AR-MAJORS-1C (12f3c89).
//
// User decision (2026-05-19): Fast Track Review+Apply — single-phase per
// established policy (no semantic mismatches, no duplicates, ≤3 manual decisions).
//
// GeoNames had ZERO Urdu/Persian/Arabic alternatenames for all 29 cities.
// All 29 Urdu names are MANUAL — sourced from Urdu Wikipedia canonical
// forms + standard Urdu transliteration conventions:
//   -abad → آباد, -pur → پور (Persian پ), -kot → کوٹ (Urdu retroflex ٹ),
//   -khan → خان, -garh → گڑھ (retroflex گ + ڑ + ھ),
//   ch → چ, Hujra → حجرہ, Mian → میاں
//
// Per user's rules (PLACE-NAMES-UR-PK-6 task spec 2026-05-19):
//   1. Add names.ur for 29 BATCH-C entries only
//   2. Don't touch 119 prior PK entries
//   3. Don't change names.ar (preserves MAJORS-1C Arabic)
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
const BACKUP  = CURATED + '.prePlaceNamesUrPk6.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-ur-pk-6-apply-report.md';

// ─── 29 FIXES — Wikipedia Urdu canonical + standard translit ─────────────
// Score guide:
//   95 = Wikipedia Urdu article direct + uses Urdu retroflex letters (ٹ ڈ ڑ ں ھ پ چ گ ژ)
//   90 = uses Urdu retroflex but matches Wikipedia known patterns
//   85 = uses Persian-Urdu shared letters (ی ہ پ) only
//   80 = pure Arabic-Urdu shared script (rare for PK)
const FIXES = [
    // ──── BATCH-C T3 (pop 50k-99k) — 29 cities ────
    { slug: 'qubo-saeed-khan',     ur: 'قبو سعید خان',         aliasesUr: [] },                              // Sindh; Persian ی
    { slug: 'jalalpur-jattan',     ur: 'جلال پور جٹاں',        aliasesUr: ['جلالپور جٹاں'] },               // Persian پ + retroflex ٹ + ں; no-space variant
    { slug: 'daharki',             ur: 'ڈہرکی',                aliasesUr: [] },                              // retroflex ڈ + Urdu ہ + Persian ی
    { slug: 'kandhkot',            ur: 'کندھ کوٹ',             aliasesUr: ['کندھکوٹ'] },                    // Urdu ھ + retroflex ٹ + Persian ک; no-space variant
    { slug: 'nowshera-kalan',      ur: 'نوشہرہ کلاں',          aliasesUr: ['نوشہرہ کلان'] },                // Urdu ہ + retroflex ں; non-retroflex Kalan variant
    { slug: 'chichawatni',         ur: 'چیچہ وطنی',            aliasesUr: ['چیچا وطنی'] },                  // Urdu چ + Persian ی + Urdu ہ; ا-end variant
    { slug: 'fatehjang',           ur: 'فتح جنگ',              aliasesUr: [] },                              // Persian گ
    { slug: 'alahabad',            ur: 'اللہ آباد',            aliasesUr: [] },                              // Urdu ہ
    { slug: 'moro',                ur: 'مورو',                 aliasesUr: [] },                              // Shared script (Sindh)
    { slug: 'mian-channun',        ur: 'میاں چنوں',            aliasesUr: [] },                              // Persian ی + retroflex ں + Urdu چ
    { slug: 'topi',                ur: 'ٹوپی',                 aliasesUr: [] },                              // retroflex ٹ + Persian پ + Persian ی
    { slug: 'pano-aqil',           ur: 'پانو عاقل',            aliasesUr: [] },                              // Persian پ
    { slug: 'harunabad',           ur: 'ہارون آباد',           aliasesUr: [] },                              // Urdu ہ
    { slug: 'rabwah',              ur: 'ربوہ',                 aliasesUr: ['چناب نگر'] },                    // Urdu ہ; "Chenab Nagar" official 1998 rename
    { slug: 'kahror-pakka',        ur: 'کہروڑ پکا',            aliasesUr: [] },                              // Urdu ہ + retroflex ڑ + Persian پ + Persian ک
    { slug: 'chuhar-kana',         ur: 'چوہڑ کانا',            aliasesUr: ['چوہڑکانہ'] },                   // Urdu چ + Urdu ہ + retroflex ڑ; no-space-end-ہ variant
    { slug: 'shorkot',             ur: 'شور کوٹ',              aliasesUr: ['شورکوٹ'] },                     // retroflex ٹ + Persian ک; no-space variant
    { slug: 'minchinabad',         ur: 'منچن آباد',            aliasesUr: ['منچین آباد'] },                 // Urdu چ; -chin- with Persian ی variant
    { slug: 'shabqadar',           ur: 'شبقدر',                aliasesUr: [] },                              // Shared script (KP)
    { slug: 'shujaabad',           ur: 'شجاع آباد',            aliasesUr: [] },                              // Shared script
    { slug: 'haveli-lakha',        ur: 'حویلی لکھا',           aliasesUr: ['حویلی لاکھا'] },                // Persian ی + Urdu ھ; with alif variant
    { slug: 'shakargarh',          ur: 'شکر گڑھ',              aliasesUr: ['شکرگڑھ'] },                     // Persian گ + retroflex ڑ + Urdu ھ; no-space variant
    { slug: 'jampur',              ur: 'جام پور',              aliasesUr: ['جامپور'] },                     // Persian پ; no-space variant
    { slug: 'hujra-shah-muqim',    ur: 'حجرہ شاہ مقیم',        aliasesUr: [] },                              // Urdu ہ + ہ + Persian ی
    { slug: 'sangla-hill',         ur: 'سانگلا ہل',            aliasesUr: ['سنگلا ہل'] },                   // Persian گ + Urdu ہ; no-alif variant
    { slug: 'sharifabad',          ur: 'شریف آباد',            aliasesUr: [] },                              // Persian ی
    { slug: 'pabbi',               ur: 'پبی',                  aliasesUr: [] },                              // Persian پ + Persian ی (KP)
    { slug: 'qabula',              ur: 'قبولا',                aliasesUr: ['قبولہ'] },                       // Shared script; ہ-end variant
    { slug: 'jahanian',            ur: 'جہانیاں',              aliasesUr: [] },                              // Urdu ہ + Persian ی + retroflex ں
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

// Slugs we MUST NOT mutate (119 prior PK entries = 70 + 20 MAJORS-1A + 29 MAJORS-1B)
const PK_PRIOR_119_SLUGS = new Set([
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
    'khairpur-mirs','saddiqabad','burewala','arif-wala','kohat',
    // 29 ASIA-1D-PK-MISSING-AR-MAJORS-1B (UR-PK-5)
    'layyah','lodhran','khanpur','attock-city','khuzdar','manjhand',
    'bhakkar','narowal','mandi-bahauddin','mianwali','pakpattan',
    'tando-adam','toba-tek-singh','shahdad-kot','charsadda','ghotki',
    'phool-nagar','tando-muhammad-khan','vihari','dera-murad-jamali',
    'kot-addu','khushab','chakwal','swabi','mansehra','sanghar',
    'haripur','rajanpur','zhob'
]);

function main() {
    // Pre-flight
    const errors = [];
    const seenSlugs = new Set();
    const seenUr = new Set();
    for (const f of FIXES) {
        if (PK_PRIOR_119_SLUGS.has(f.slug)) {
            errors.push('FIXES targets a PRIOR 119-PK slug: ' + f.slug + ' (must NEVER touch prior entries)');
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

    // Cross-collision check vs existing 119 PK Urdu names + aliases
    const existingPkUr = new Map();
    const existingPkAliasUr = new Map();
    for (const e of curated) {
        if (e.countryCode !== 'pk') continue;
        if (PK_PRIOR_119_SLUGS.has(e.slug)) {
            const ur = (e.names && e.names.ur) || null;
            if (ur) existingPkUr.set(ur, e.slug);
            const aliases = (e.aliases && e.aliases.ur) || [];
            for (const a of aliases) existingPkAliasUr.set(a, e.slug);
        }
    }
    for (const fix of FIXES) {
        if (existingPkUr.has(fix.ur)) {
            errors.push('NAME-COLLISION: "' + fix.ur + '" already used by pk/' + existingPkUr.get(fix.ur));
        }
        if (existingPkAliasUr.has(fix.ur)) {
            errors.push('NAME-VS-ALIAS-COLLISION: "' + fix.ur + '" is alias of pk/' + existingPkAliasUr.get(fix.ur));
        }
        for (const a of (fix.aliasesUr || [])) {
            if (existingPkUr.has(a)) {
                errors.push('ALIAS-VS-NAME-COLLISION: alias "' + a + '" is primary of pk/' + existingPkUr.get(a));
            }
            if (existingPkAliasUr.has(a)) {
                errors.push('ALIAS-COLLISION: "' + a + '" already alias of pk/' + existingPkAliasUr.get(a));
            }
        }
    }
    if (errors.length) {
        console.error('[apply] FAILED cross-collision check vs PRIOR-119:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] cross-collision OK — no overlap with PRIOR-119 Urdu names/aliases');

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

    // Post-apply assertions — names.ar, names.en, and prior 119 must NEVER mutate
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

        if (PK_PRIOR_119_SLUGS.has(e.slug)) {
            const afterUr = (e.names && e.names.ur) || null;
            if (before.ur !== afterUr) {
                console.error('[apply] FAILED — PRIOR-119 pk/' + e.slug + ' names.ur mutated: "' + before.ur + '" → "' + afterUr + '"');
                stats.priorTouchedError++;
            }
            const afterAlias = JSON.stringify((e.aliases && e.aliases.ur) || null);
            const beforeAlias = JSON.stringify(before.aliasUr);
            if (afterAlias !== beforeAlias) {
                console.error('[apply] FAILED — PRIOR-119 pk/' + e.slug + ' aliases.ur mutated');
                stats.priorTouchedError++;
            }
        }
    }
    if (stats.priorTouchedError > 0) {
        console.error('[apply] FAILED — ' + stats.priorTouchedError + ' prior-119 entries mutated (must be 0)');
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // Audit report
    const L = [];
    L.push('# PLACE-NAMES-UR-PK-6 (Fast Track) — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: PK (29 ASIA-1D-PK-MISSING-AR-MAJORS-1C entries only)');
    L.push('**Total rows applied**: ' + stats.applied);
    L.push('**Skipped (idempotent)**: ' + stats.skippedAlreadyApplied);
    L.push('**names.ur newly set**: ' + stats.namesUrSet);
    L.push('**names.ur overwrote**: ' + stats.namesUrOverwrote);
    L.push('**aliases.ur added**: ' + stats.aliasesUrAdded);
    L.push('**PRIOR 119-PK touched (must be 0)**: ' + stats.priorTouchedError);
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
    L.push('- ❌ `names.ar` not modified (preserves MAJORS-1C Arabic)');
    L.push('- ❌ `names.en` not modified');
    L.push('- ❌ 119 prior PK entries not touched');
    L.push('- ❌ Other countries not touched');
    L.push('- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html)');
    L.push('- ❌ No runtime translation');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ PLACE-NAMES-UR-PK-6 (Fast Track) — Apply Summary ═══');
    console.log('  Applied (new):                 ' + stats.applied);
    console.log('  Skipped (idempotent):          ' + stats.skippedAlreadyApplied);
    console.log('  names.ur newly set:            ' + stats.namesUrSet);
    console.log('  aliases.ur added:              ' + stats.aliasesUrAdded);
    console.log('  PRIOR 119-PK touched (must=0): ' + stats.priorTouchedError);
}

main();
