// scripts/geodata/_place_names_ur_pk_1_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-PK-1-APPLY — minimal-mutation alias enrichment for 3 PK cities.
//
// User decision (2026-05-19): "Option B — alias enrichment فقط" per:
//   reports/place-names-ur-pk-1-review.md
//
// Scope:
//   - All 10 existing PK seed entries ALREADY have correct names.ur — NOT touched.
//   - Only 3 new aliases.ur entries added:
//       rawalpindi   + پنڈی     (colloquial "Pindi" short form)
//       faisalabad   + لائلپور  (historical Lyallpur, pre-1979 name)
//       hyderabad-pk + حیدر آباد (with-space variant matching names.ar)
//
// Per user's 8-point apply rules:
//   1. Don't change names.ur (all 10 PK seed names retained)
//   2. Don't change names.ar
//   3. Don't change names.en
//   4. Add only the 3 user-approved aliases.ur
//   5. Don't change server.js
//   6. Don't change js/app.js
//   7. Don't change fillLangMap
//   8. No runtime translation
//
// Also (user §3 + §4):
//   - Do NOT clean up duplicate aliases.ur entries (matches names.ur) — they
//     are cosmetic no-ops; cleanup is out of scope here.
//   - Do NOT add new PK cities (Bahawalpur, Gujranwala, Sargodha, Sukkur,
//     Larkana, etc.) — those would need a separate ASIA-1D-PK or similar
//     wave to enter curated first.
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// Idempotent — re-running on already-applied aliases is a no-op.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesUrPk1.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-ur-pk-1-apply-report.md';

// ─── 3 ALIAS ENRICHMENTS (user-approved per review §3) ───
// IMPORTANT — names.ur is NOT touched; only aliases.ur extended.
const ALIAS_ENRICHMENTS = [
    { slug: 'rawalpindi',   alias: 'پنڈی',     reason: 'colloquial short form "Pindi" (very common in spoken Urdu)' },
    { slug: 'faisalabad',   alias: 'لائلپور',  reason: 'historical "Lyallpur" name (British era, pre-1979)' },
    { slug: 'hyderabad-pk', alias: 'حیدر آباد', reason: 'with-space variant matching the Arabic form حيدر آباد' }
];

// ─── Validation helpers (same as AF + IR waves) ─────────────────────────
const HAS_LATIN = /[A-Za-z]/;
const HAS_ARABIC_BLOCK = /[؀-ۿݐ-ݿ]/;
// Pashto-/Kurdish-specific letters that should NOT appear in Urdu aliases.
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕ]/;

function isCleanUrduScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    if (SUSPICIOUS_NON_URDU.test(s)) return false;
    return HAS_ARABIC_BLOCK.test(s);
}

function main() {
    // ─── Pre-flight: validate every alias is clean Urdu script ───
    const errors = [];
    for (const e of ALIAS_ENRICHMENTS) {
        if (!isCleanUrduScript(e.alias)) {
            errors.push(e.slug + ' alias "' + e.alias + '" fails clean-Urdu-script check');
        }
    }
    if (errors.length) {
        console.error('[apply] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] pre-flight OK — 3 alias enrichments validated');

    // ─── Read curated + backup ───
    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    } else {
        console.log('[apply] backup already exists (skip rewrite):', BACKUP);
    }

    // ─── Snapshot pre-apply names.ur of all PK entries (audit trail) ───
    const preApplyNamesUr = {};
    for (const e of curated) {
        if (e.countryCode === 'pk') {
            preApplyNamesUr[e.slug] = e.names && e.names.ur ? e.names.ur : null;
        }
    }

    // ─── Apply ───
    const stats = {
        aliasesAdded: 0,
        aliasesSkippedIdempotent: 0,
        slugNotFoundInCurated: [],
        namesUrTouched: 0,  // MUST stay 0
    };
    const appliedRows = [];

    const bySlug = new Map();
    for (const e of curated) bySlug.set(e.countryCode + '/' + e.slug, e);

    for (const fix of ALIAS_ENRICHMENTS) {
        const key = 'pk/' + fix.slug;
        const entry = bySlug.get(key);
        if (!entry) {
            stats.slugNotFoundInCurated.push(key);
            continue;
        }

        if (!entry.aliases) entry.aliases = {};

        // Idempotency check
        const existingAliases = Array.isArray(entry.aliases.ur) ? entry.aliases.ur.slice() : [];
        const seen = new Set([entry.names.ur, ...existingAliases]);

        if (seen.has(fix.alias)) {
            stats.aliasesSkippedIdempotent++;
            console.log('[apply] pk/' + fix.slug.padEnd(20) + ' SKIP — alias "' + fix.alias + '" already present');
            continue;
        }

        existingAliases.push(fix.alias);
        entry.aliases.ur = existingAliases;
        stats.aliasesAdded++;
        appliedRows.push({
            slug: fix.slug,
            alias: fix.alias,
            reason: fix.reason,
            previousAliasesUr: existingAliases.slice(0, -1) // pre-add state
        });
        console.log('[apply] pk/' + fix.slug.padEnd(20) + ' aliases.ur += "' + fix.alias + '"  (' + fix.reason + ')');
    }

    // Defense: bail if any slug wasn't found
    if (stats.slugNotFoundInCurated.length) {
        console.error('[apply] FAILED — slugs missing in curated:');
        for (const s of stats.slugNotFoundInCurated) console.error('  - ' + s);
        process.exit(1);
    }

    // ─── Post-apply assertion: NO names.ur changed ───
    for (const e of curated) {
        if (e.countryCode === 'pk') {
            const before = preApplyNamesUr[e.slug];
            const after = e.names && e.names.ur ? e.names.ur : null;
            if (before !== after) {
                stats.namesUrTouched++;
                console.error('[apply] FAILED — names.ur changed for pk/' + e.slug + ': "' + before + '" → "' + after + '"');
            }
        }
    }
    if (stats.namesUrTouched > 0) {
        console.error('[apply] FAILED — ' + stats.namesUrTouched + ' names.ur values were modified (must be 0)');
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // ─── Audit report ───
    const L = [];
    L.push('# PLACE-NAMES-UR-PK-1-APPLY — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: PK');
    L.push('**aliases.ur added**: ' + stats.aliasesAdded);
    L.push('**aliases.ur skipped (idempotent — already present)**: ' + stats.aliasesSkippedIdempotent);
    L.push('**names.ur changed**: ' + stats.namesUrTouched + ' (MUST be 0 per user rule §1)');
    L.push('');
    L.push('## Applied aliases');
    L.push('');
    L.push('| slug | alias added | reason |');
    L.push('| --- | --- | --- |');
    for (const r of appliedRows) {
        L.push('| `' + r.slug + '` | ' + r.alias + ' | ' + r.reason + ' |');
    }
    L.push('');
    L.push('## All 10 PK entries — names.ur snapshot (must be unchanged)');
    L.push('');
    L.push('| slug | names.ur |');
    L.push('| --- | --- |');
    const pkEntries = curated.filter(e => e.countryCode === 'pk').sort((a, b) => a.slug.localeCompare(b.slug));
    for (const e of pkEntries) {
        L.push('| `' + e.slug + '` | ' + (e.names.ur || '(absent)') + ' |');
    }
    L.push('');
    L.push('## Backup');
    L.push('');
    L.push('Pre-apply backup written to: `' + BACKUP + '`');
    L.push('Restore command: `cp ' + path.basename(BACKUP) + ' curated-places.json`');
    L.push('');
    L.push('## What this apply did NOT do');
    L.push('');
    L.push('- ❌ NO names.ur changes (all 10 PK seed names retained byte-for-byte)');
    L.push('- ❌ NO names.ar changes');
    L.push('- ❌ NO names.en changes');
    L.push('- ❌ NO new PK cities added (Bahawalpur/Gujranwala/Sargodha/Sukkur/Larkana/etc. out of scope)');
    L.push('- ❌ NO cleanup of duplicate aliases.ur (out of scope per user §3)');
    L.push('- ❌ NO code changes (server.js, js/app.js, fillLangMap, index.html)');
    L.push('- ❌ NO runtime translation');
    L.push('- ❌ NO translation API');
    L.push('- ❌ NO browser auto-translate dependency');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    // ─── Console summary ───
    console.log('');
    console.log('═══ PLACE-NAMES-UR-PK-1-APPLY — Apply Summary ═══');
    console.log('  aliases.ur added:             ' + stats.aliasesAdded);
    console.log('  aliases.ur skipped (already): ' + stats.aliasesSkippedIdempotent);
    console.log('  names.ur changed:             ' + stats.namesUrTouched + ' (must be 0)');
}

main();
