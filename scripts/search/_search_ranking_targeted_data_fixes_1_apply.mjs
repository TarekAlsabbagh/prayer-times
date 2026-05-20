// scripts/search/_search_ranking_targeted_data_fixes_1_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// SEARCH-RANKING-TARGETED-DATA-FIXES-1 — Option A: all 14 fixes in single
// wave per reports/search-ranking-targeted-data-fixes-1-plan.md.
//
// Categories (user-approved 2026-05-20):
//   A) IATA alias removals (5): muli/MUM, samarinda/SRI, indianapolis/IND,
//      fargo/FAR, baguio/BAG
//   B) IN SEED-18 priority rebalance (8): pune/chennai/bengaluru/
//      hyderabad-in/ahmedabad/lucknow/jaipur/surat
//   C) Missing alias add (1): bd/barisal + "Barishal"
//
// Per user's apply rules:
//   - Modify only db/places/curated-places.json
//   - NEVER touch server.js / js/app.js / index.html
//   - NEVER touch any shared script
//   - NEVER add/delete cities
//   - NEVER touch names / slugs / coordinates / timezone / admin / geonameId
//   - NEVER add population field
//   - NEVER apply scoring patch
//   - aliases.en deletions limited to exactly the 5 user-approved values
//   - priority adjustments limited to exactly the 8 user-approved entries
//   - alias addition limited to exactly bd/barisal + "Barishal"
//   - Idempotent re-run
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.preTargetedDataFixes1.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/search-ranking-targeted-data-fixes-1-apply-report.md';

// ═══ A — IATA alias removals (5) ═══════════════════════════════════════
const REMOVE_ALIASES = [
    { slug: 'muli',         cc: 'mv', alias: 'MUM' },
    { slug: 'samarinda',    cc: 'id', alias: 'SRI' },
    { slug: 'indianapolis', cc: 'us', alias: 'IND' },
    { slug: 'fargo',        cc: 'us', alias: 'FAR' },
    { slug: 'baguio',       cc: 'ph', alias: 'BAG' },
];

// ═══ B — Priority adjustments (8) ══════════════════════════════════════
const PRIORITY_FIXES = [
    { slug: 'pune',          cc: 'in', from: 82, to: 95 },
    { slug: 'chennai',       cc: 'in', from: 85, to: 95 },
    { slug: 'bengaluru',     cc: 'in', from: 85, to: 95 },
    { slug: 'hyderabad-in',  cc: 'in', from: 85, to: 95 },
    { slug: 'ahmedabad',     cc: 'in', from: 80, to: 95 },
    { slug: 'lucknow',       cc: 'in', from: 80, to: 90 },
    { slug: 'jaipur',        cc: 'in', from: 80, to: 90 },
    { slug: 'surat',         cc: 'in', from: 78, to: 90 },
];

// ═══ C — Missing alias adds (1) ════════════════════════════════════════
const ADD_ALIASES = [
    { slug: 'barisal', cc: 'bd', lang: 'en', alias: 'Barishal' },
];

// ═══ Allow-list of legitimate uppercase aliases that MUST NOT be removed ═
const KEEP_LEGIT_ALIASES = new Map([
    ['new-york',      ['NYC']],
    ['los-angeles',   ['LA']],
    ['kuala-lumpur',  ['KL']],
    ['hakodate',      ['HKD']],
    ['agra',          ['AGR']],
]);

function main() {
    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    } else {
        console.log('[apply] backup already exists:', BACKUP);
    }

    const ORIGINAL_TOTAL = curated.length;
    const errors = [];
    const stats = {
        aliasesRemoved: 0,
        prioritiesChanged: 0,
        aliasesAdded: 0,
        skippedIdempotent: 0,
    };
    const log = [];

    // ─── Snapshot ALL entries (for byte-identity diff) ───
    const preState = new Map();
    for (const e of curated) {
        preState.set(e.slug, {
            names:       JSON.stringify(e.names || null),
            aliases:     JSON.stringify(e.aliases || null),
            slug:        e.slug,
            cc:          e.countryCode,
            lat:         e.lat,
            lng:         e.lng,
            tz:          e.timezone,
            type:        e.type,
            priority:    e.priority,
            source:      e.source,
            verified:    e.verified,
            admin:       JSON.stringify(e.admin || null),
        });
    }

    // ─── A — Remove IATA aliases ───
    for (const fix of REMOVE_ALIASES) {
        const entry = curated.find(e => e.slug === fix.slug && e.countryCode === fix.cc);
        if (!entry) {
            errors.push('REMOVE_ALIAS slug not found: ' + fix.cc + '/' + fix.slug);
            continue;
        }
        if (!entry.aliases || !Array.isArray(entry.aliases.en)) {
            stats.skippedIdempotent++;
            log.push('A SKIP ' + fix.cc + '/' + fix.slug + ' — no aliases.en');
            continue;
        }
        const before = entry.aliases.en.length;
        const filtered = entry.aliases.en.filter(a => a !== fix.alias);
        if (filtered.length === before) {
            stats.skippedIdempotent++;
            log.push('A SKIP ' + fix.cc + '/' + fix.slug + ' — alias "' + fix.alias + '" already absent');
            continue;
        }
        entry.aliases.en = filtered;
        stats.aliasesRemoved++;
        log.push('A  REMOVED ' + fix.cc + '/' + fix.slug + ' aliases.en "' + fix.alias + '" (' + before + ' → ' + filtered.length + ')');
    }

    // ─── B — Priority adjustments ───
    for (const fix of PRIORITY_FIXES) {
        const entry = curated.find(e => e.slug === fix.slug && e.countryCode === fix.cc);
        if (!entry) {
            errors.push('PRIORITY slug not found: ' + fix.cc + '/' + fix.slug);
            continue;
        }
        if (entry.priority === fix.to) {
            stats.skippedIdempotent++;
            log.push('B SKIP ' + fix.cc + '/' + fix.slug + ' priority already ' + fix.to);
            continue;
        }
        if (entry.priority !== fix.from) {
            errors.push('PRIORITY mismatch ' + fix.cc + '/' + fix.slug +
                       ': expected from=' + fix.from + ' but got ' + entry.priority);
            continue;
        }
        const before = entry.priority;
        entry.priority = fix.to;
        stats.prioritiesChanged++;
        log.push('B  PRIORITY ' + fix.cc + '/' + fix.slug + ' ' + before + ' → ' + fix.to);
    }

    // ─── C — Add missing aliases ───
    for (const fix of ADD_ALIASES) {
        const entry = curated.find(e => e.slug === fix.slug && e.countryCode === fix.cc);
        if (!entry) {
            errors.push('ADD_ALIAS slug not found: ' + fix.cc + '/' + fix.slug);
            continue;
        }
        if (!entry.aliases) entry.aliases = {};
        if (!Array.isArray(entry.aliases[fix.lang])) entry.aliases[fix.lang] = [];
        if (entry.aliases[fix.lang].includes(fix.alias)) {
            stats.skippedIdempotent++;
            log.push('C SKIP ' + fix.cc + '/' + fix.slug + ' aliases.' + fix.lang + ' "' + fix.alias + '" already present');
            continue;
        }
        entry.aliases[fix.lang].push(fix.alias);
        stats.aliasesAdded++;
        log.push('C  ADDED ' + fix.cc + '/' + fix.slug + ' aliases.' + fix.lang + ' += "' + fix.alias + '"');
    }

    if (errors.length) {
        console.error('[apply] FAILED — errors before mutation completed:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }

    // ─── Post-apply assertions ───

    // 1. Total count unchanged
    if (curated.length !== ORIGINAL_TOTAL) {
        console.error('[apply] FAILED — total entries changed');
        process.exit(1);
    }

    // 2. Legitimate aliases must STILL be present (paranoid check)
    for (const [slug, mustHave] of KEEP_LEGIT_ALIASES) {
        const e = curated.find(x => x.slug === slug);
        if (!e) continue; // may not exist (some are SEED-18 specific)
        const arr = (e.aliases && Array.isArray(e.aliases.en)) ? e.aliases.en : [];
        for (const a of mustHave) {
            if (!arr.includes(a)) {
                console.error('[apply] FAILED — legitimate alias "' + a + '" missing from ' + slug);
                process.exit(1);
            }
        }
    }

    // 3. Byte-identity for everything NOT in the 14 fix slugs
    const fixSlugSet = new Set();
    for (const f of REMOVE_ALIASES) fixSlugSet.add(f.slug + '|' + f.cc);
    for (const f of PRIORITY_FIXES) fixSlugSet.add(f.slug + '|' + f.cc);
    for (const f of ADD_ALIASES) fixSlugSet.add(f.slug + '|' + f.cc);

    let nonTargetMutations = 0;
    for (const e of curated) {
        const key = e.slug + '|' + e.countryCode;
        const before = preState.get(e.slug);
        if (!before) continue;
        // Always check: names, slug, cc, lat, lng, tz, type, source, verified, admin
        // For target slugs: skip aliases + priority checks
        // For non-target slugs: also check aliases + priority byte-identical
        const checks = [];
        if (before.names !== JSON.stringify(e.names || null)) checks.push('names');
        if (before.slug !== e.slug) checks.push('slug');
        if (before.cc !== e.countryCode) checks.push('cc');
        if (before.lat !== e.lat) checks.push('lat');
        if (before.lng !== e.lng) checks.push('lng');
        if (before.tz !== e.timezone) checks.push('tz');
        if (before.type !== e.type) checks.push('type');
        if (before.source !== e.source) checks.push('source');
        if (before.verified !== e.verified) checks.push('verified');
        if (before.admin !== JSON.stringify(e.admin || null)) checks.push('admin');
        if (!fixSlugSet.has(key)) {
            if (before.aliases !== JSON.stringify(e.aliases || null)) checks.push('aliases');
            if (before.priority !== e.priority) checks.push('priority');
        }
        if (checks.length) {
            console.error('[apply] FAILED — non-target mutation: ' + key + ' fields=' + checks.join(','));
            nonTargetMutations++;
        }
    }
    if (nonTargetMutations > 0) {
        console.error('[apply] FAILED — ' + nonTargetMutations + ' non-target mutations');
        process.exit(1);
    }

    // 4. No population field added anywhere
    let popFields = 0;
    for (const e of curated) {
        if (Number.isFinite(e.population)) popFields++;
        if (e.admin && Number.isFinite(e.admin.population)) popFields++;
    }
    if (popFields > 0) {
        console.error('[apply] FAILED — population field detected on ' + popFields + ' entries (should be 0 — no backfill)');
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // ─── Audit report ───
    const L = [];
    L.push('# SEARCH-RANKING-TARGETED-DATA-FIXES-1 — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Scope**: 14 targeted fixes (5 IATA + 8 priority + 1 alias)');
    L.push('**Aliases removed**: ' + stats.aliasesRemoved);
    L.push('**Priorities changed**: ' + stats.prioritiesChanged);
    L.push('**Aliases added**: ' + stats.aliasesAdded);
    L.push('**Skipped (idempotent)**: ' + stats.skippedIdempotent);
    L.push('**Non-target mutations**: ' + nonTargetMutations + ' (must be 0)');
    L.push('**Population fields added**: ' + popFields + ' (must be 0)');
    L.push('**Total curated entries**: ' + curated.length + ' (unchanged)');
    L.push('');
    L.push('## Applied operations log');
    L.push('');
    for (const l of log) L.push('- `' + l + '`');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ SEARCH-RANKING-TARGETED-DATA-FIXES-1 — Apply Summary ═══');
    console.log('  Aliases removed:        ' + stats.aliasesRemoved);
    console.log('  Priorities changed:     ' + stats.prioritiesChanged);
    console.log('  Aliases added:          ' + stats.aliasesAdded);
    console.log('  Skipped (idempotent):   ' + stats.skippedIdempotent);
    console.log('  Non-target mutations:   ' + nonTargetMutations + ' (must be 0)');
    console.log('  Population fields:      ' + popFields + ' (must be 0)');
    console.log('  Total curated entries:  ' + curated.length + ' (unchanged from ' + ORIGINAL_TOTAL + ')');
}

main();
