// scripts/geodata/_l10n_phase2_strip_fillchain.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-L10N-FOUNDATION-CODE-1 (Phase 2 cleanup)
//
// One-shot: walks db/places/curated-places.json and DELETES the `names[lang]`
// key where `names[lang] === names.en` for lang ∈ { 'ur', 'bn' } only.
//
// Per user direction:
//   "ابدأ بـ equality only first — احذف فقط الحقول التي تكون
//    names[lang] === names.en في اللغات: ur, bn"
//   "وإذا وجدت حالات مشابهة في ar راجعها بحذر ولا تحذفها بشكل جماعي
//    إلا إذا كانت Latin واضحة"
//
// ar is INSPECTED but NOT auto-deleted — the script emits a separate report
// listing any `names.ar === names.en` rows for manual review.
//
// Latin-script langs (fr, de, es, tr, id, ms) are NOT touched in this phase
// — the user explicitly said equality-only for ur+bn first, no sweeping change.
// They get cleaned up later when famous-city exonyms are seeded (Phase 6-7).
//
// Writes:
//   db/places/curated-places.json (in-place, after backup)
//   reports/place-names-l10n-foundation-code-1-strip-report.md (audit trail)
//
// Idempotent — re-running on already-stripped data is a no-op.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-l10n-foundation-code-1-strip-report.md';
const BACKUP  = CURATED + '.preL10NFoundationCode1.bak';

// Auto-delete these langs when equal-to-en. Per user direction §13 q4.
const STRIP_LANGS = ['ur', 'bn'];

// INSPECT these langs but DO NOT auto-delete. Emit for manual review.
const INSPECT_LANGS = ['ar'];

function main() {
    if (!fs.existsSync(CURATED)) {
        console.error('[strip] missing input:', CURATED);
        process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    console.log('[strip] total curated entries:', data.length);

    // Backup BEFORE any mutation
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(data, null, 2) + '\n');
        console.log('[strip] backup written to:', BACKUP);
    } else {
        console.log('[strip] backup already exists (skipping rewrite):', BACKUP);
    }

    const stats = {
        total: data.length,
        stripped: { ur: 0, bn: 0 },
        unchanged: { ur: 0, bn: 0 },        // rows where names[lang] was already explicit OR already absent
        inspectArEqualsEn: []                 // names.ar === names.en flagged for manual review
    };

    // Per-country counts (for the audit report)
    const byCc = {};
    function bumpCc(cc, key) {
        if (!byCc[cc]) byCc[cc] = { ur: 0, bn: 0 };
        if (byCc[cc][key] != null) byCc[cc][key]++;
    }

    let totalMutations = 0;

    for (const entry of data) {
        if (!entry || !entry.names) continue;
        const en = entry.names.en;
        const cc = entry.countryCode || '??';

        for (const lang of STRIP_LANGS) {
            const v = entry.names[lang];
            if (v === undefined || v === null) {
                // already absent — nothing to do
            } else if (typeof v === 'string' && v === en) {
                // fillchain leftover — delete the key
                delete entry.names[lang];
                stats.stripped[lang]++;
                bumpCc(cc, lang);
                totalMutations++;
            } else {
                // explicit value (real translation) — keep
                stats.unchanged[lang]++;
            }
        }

        // ar inspection — flag any `names.ar === names.en` (likely a regression)
        if (typeof entry.names.ar === 'string' && entry.names.ar === en) {
            stats.inspectArEqualsEn.push({ slug: entry.slug, cc, ar: entry.names.ar, en });
        }
    }

    // Write back ONLY if anything changed
    if (totalMutations > 0) {
        fs.writeFileSync(CURATED, JSON.stringify(data, null, 2) + '\n');
        console.log('[strip] wrote', totalMutations, 'mutations to', CURATED);
    } else {
        console.log('[strip] no mutations needed (idempotent re-run)');
    }

    // ─── Build audit report ───
    const L = [];
    L.push('# PLACE-NAMES-L10N-FOUNDATION-CODE-1 — Strip report');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Mode**: equality-only strip (per user direction §13 q4)');
    L.push('**Strip langs**: `' + STRIP_LANGS.join('`, `') + '`');
    L.push('**Inspect-only langs**: `' + INSPECT_LANGS.join('`, `') + '`');
    L.push('**Latin-script langs untouched**: `fr`, `de`, `es`, `tr`, `id`, `ms` (deferred to Phase 6-7 famous-city seeding)');
    L.push('');
    L.push('## Summary');
    L.push('');
    L.push('| Lang | Stripped (was === names.en) | Unchanged (explicit OR absent) |');
    L.push('| --- | ---: | ---: |');
    for (const lang of STRIP_LANGS) {
        L.push('| `' + lang + '` | **' + stats.stripped[lang] + '** | ' + stats.unchanged[lang] + ' |');
    }
    L.push('');
    L.push('Total entries scanned: **' + stats.total + '**.');
    L.push('Total deletions: **' + totalMutations + '**.');
    L.push('');
    L.push('## Per-country breakdown (top 30 by total deletions)');
    L.push('');
    const ccSorted = Object.entries(byCc)
        .map(([cc, v]) => ({ cc, ur: v.ur || 0, bn: v.bn || 0, total: (v.ur || 0) + (v.bn || 0) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 30);
    if (!ccSorted.length) {
        L.push('_(no deletions)_');
    } else {
        L.push('| cc | ur stripped | bn stripped | total |');
        L.push('| --- | ---: | ---: | ---: |');
        for (const r of ccSorted) {
            L.push('| ' + r.cc + ' | ' + r.ur + ' | ' + r.bn + ' | ' + r.total + ' |');
        }
    }
    L.push('');
    L.push('## §inspect: rows where `names.ar === names.en` (manual review needed)');
    L.push('');
    L.push('Per user direction, ar is INSPECTED but not auto-deleted. Any matches below should be reviewed individually — these are likely pre-Stage-3.5 legacy seeds where Arabic was populated as a Latin transliteration.');
    L.push('');
    if (!stats.inspectArEqualsEn.length) {
        L.push('_✅ No `names.ar === names.en` matches found — Arabic invariant intact._');
    } else {
        L.push('| slug | cc | names.ar | names.en |');
        L.push('| --- | --- | --- | --- |');
        for (const r of stats.inspectArEqualsEn) {
            L.push('| `' + r.slug + '` | ' + r.cc + ' | `' + r.ar + '` | `' + r.en + '` |');
        }
    }
    L.push('');
    L.push('## Backup');
    L.push('');
    L.push('Pre-strip backup written to:');
    L.push('');
    L.push('```');
    L.push(BACKUP);
    L.push('```');
    L.push('');
    L.push('Restore: `cp ' + path.basename(BACKUP) + ' curated-places.json`');
    L.push('');
    L.push('## What this script did NOT do');
    L.push('');
    L.push('- ❌ NO changes to `fr`, `de`, `es`, `tr`, `id`, `ms` — deferred to Phase 6/7 per user direction');
    L.push('- ❌ NO auto-deletion of `names.ar` — even rows where `ar === en` are only INSPECTED');
    L.push('- ❌ NO script-class cleanup (e.g. `ar` containing Latin) — that\'s a separate future micro-fix wave');
    L.push('- ❌ NO addition of new localized names — stripping only');
    L.push('');

    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[strip] wrote audit report:', REPORT);

    console.log('');
    console.log('═══ PLACE-NAMES-L10N-FOUNDATION-CODE-1 — Strip Summary ═══');
    console.log('Total scanned:           ' + stats.total);
    console.log('Stripped ur (= en):      ' + stats.stripped.ur);
    console.log('Stripped bn (= en):      ' + stats.stripped.bn);
    console.log('Total deletions:         ' + totalMutations);
    console.log('ar inspect-flagged rows: ' + stats.inspectArEqualsEn.length);
}

main();
