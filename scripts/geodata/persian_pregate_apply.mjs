// scripts/geodata/persian_pregate_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA — Stage 3.4: PERSIAN PRE-GATE RUNNER (country-agnostic)
//
// Usage: node scripts/geodata/persian_pregate_apply.mjs <cc> [--wave=<label>]
//   <cc> = lowercase 2-letter ISO code.
//
// Reads <cc>-geonames-candidates.json (Stage 3 output) and rewrites in place:
//   * candidate.names.ar         (cleaned)
//   * candidate.aliases.ar[]     (cleaned, deduplicated)
//
// Also writes:
//   * <wave>-persian-pregate-report.json  (per-row audit)
//   * reports/geodata-<wave>-persian-pregate-report.md (human report)
//
// Only runs when the country config has `persianSource: true`.
// Idempotent: re-running on already-cleaned data is a no-op.
//
// Does NOT mutate curated-places.json. Does NOT make semantic decisions.
// Pure character-level Unicode substitutions. See design report:
//   reports/asia-1g-stage-3-4-persian-pregate-design.md
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { pathsFor, loadCountryConfig } from './_geonames_common.mjs';
import { persianPregateClean } from './persian_pregate_normalizer.mjs';

function dedupeArray(arr) {
    const seen = new Set();
    const out = [];
    for (const v of arr) {
        const k = String(v || '');
        if (!k) continue;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(v);
    }
    return out;
}

async function main() {
    const args = process.argv.slice(2);
    let cc = null;
    let wave = null;
    for (const a of args) {
        if (a.startsWith('--wave=')) wave = a.slice('--wave='.length).trim().toLowerCase();
        else if (!cc) cc = a.toLowerCase();
    }
    if (!cc) {
        console.error('[stage3.4] usage: node persian_pregate_apply.mjs <cc> [--wave=<label>]');
        process.exit(2);
    }
    wave = wave || ('asia-1g-' + cc);

    const config = await loadCountryConfig(cc);
    if (!config.persianSource) {
        console.log('[stage3.4]', cc.toUpperCase(),
                    '— persianSource flag is FALSE/absent → SKIPPING normalizer.');
        process.exit(0);
    }

    const paths = pathsFor(cc);
    if (!fs.existsSync(paths.candidatesJson)) {
        console.error('[stage3.4] missing input', paths.candidatesJson);
        console.error('         run: node scripts/geodata/validate_candidates.mjs', cc);
        process.exit(1);
    }

    const entries = JSON.parse(fs.readFileSync(paths.candidatesJson, 'utf8'));
    console.log('[stage3.4]', cc.toUpperCase(), '— total entries:', entries.length);

    const audit = {
        generatedAt: new Date().toISOString(),
        wave: 'CURATED-GEODATA-' + wave.toUpperCase(),
        cc,
        country: { ar: config.countryAr, en: config.countryEn },
        summary: {
            totalRows: entries.length,
            rowsTouched: 0,
            rowsUnchanged: 0,
            rowsEmpty: 0,
            nameArChanged: 0,
            aliasesArChanged: 0,
            totalCharsSubstituted: 0,
            topCharSubstitutions: []
        },
        byTier: { high: 0, medium: 0, low: 0, other: 0 },
        examples: { high: [], aliasOnly: [] },
        perCharCounts: {},
        rows: []
    };

    const charCountsAll = new Map();

    for (const e of entries) {
        const cand = e.candidate;
        if (!cand) continue;

        const beforeAr = (cand.names && cand.names.ar) || '';
        const beforeAliases = (cand.aliases && Array.isArray(cand.aliases.ar))
            ? cand.aliases.ar.slice()
            : [];

        // 1. Clean names.ar
        const nameResult = persianPregateClean(beforeAr);
        if (nameResult.changed) cand.names.ar = nameResult.cleaned;

        // 2. Clean each alias and dedupe (cleaning may collapse two aliases into one)
        const cleanedAliases = beforeAliases.map(a => persianPregateClean(a).cleaned);
        const dedupedAliases = dedupeArray(cleanedAliases.filter(Boolean));
        const aliasesChanged = JSON.stringify(beforeAliases) !== JSON.stringify(dedupedAliases);
        if (aliasesChanged) {
            if (!cand.aliases) cand.aliases = {};
            cand.aliases.ar = dedupedAliases;
        }

        // 3. Audit
        const allCharChanges = [...nameResult.perCharChanges];
        for (const a of beforeAliases) {
            for (const ch of persianPregateClean(a).perCharChanges) {
                allCharChanges.push(ch);
            }
        }
        const totalSubsForRow = allCharChanges.reduce((s, x) => s + x.count, 0);
        for (const ch of allCharChanges) {
            charCountsAll.set(ch.from, (charCountsAll.get(ch.from) || 0) + ch.count);
        }

        const tier = (e.status === 'pending' && e.tier) ? e.tier : 'other';
        audit.byTier[tier] = (audit.byTier[tier] || 0) + 1;

        const rowAudit = {
            slug: e.slug,
            tier,
            status: e.status,
            featureCode: cand.featureCode,
            population: cand.population || 0,
            nameAr: { before: beforeAr, after: cand.names.ar, changed: nameResult.changed },
            aliasesAr: { before: beforeAliases, after: dedupedAliases, changed: aliasesChanged },
            charsSubstituted: nameResult.perCharChanges,
            totalSubs: totalSubsForRow
        };

        if (nameResult.changed || aliasesChanged) {
            audit.summary.rowsTouched++;
            audit.rows.push(rowAudit);
            if (nameResult.changed) audit.summary.nameArChanged++;
            if (aliasesChanged) audit.summary.aliasesArChanged++;
            audit.summary.totalCharsSubstituted += totalSubsForRow;
            if (tier === 'high' && audit.examples.high.length < 50) {
                audit.examples.high.push(rowAudit);
            }
            if (!nameResult.changed && aliasesChanged && audit.examples.aliasOnly.length < 25) {
                audit.examples.aliasOnly.push(rowAudit);
            }
        } else if (!beforeAr && beforeAliases.length === 0) {
            audit.summary.rowsEmpty++;
        } else {
            audit.summary.rowsUnchanged++;
        }
    }

    // Top char subs sorted desc
    audit.summary.topCharSubstitutions = [...charCountsAll.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([from, count]) => ({ from, count }));
    audit.perCharCounts = Object.fromEntries(charCountsAll);

    // Write candidates back IN PLACE (Stage 3.4 mutates names.ar + aliases.ar)
    fs.writeFileSync(paths.candidatesJson, JSON.stringify(entries, null, 2) + '\n');
    console.log('[stage3.4] wrote (in-place)', paths.candidatesJson);

    // Write JSON audit
    const auditJson = path.join(paths.candidateDir, wave + '-persian-pregate.json');
    fs.writeFileSync(auditJson, JSON.stringify(audit, null, 2) + '\n');
    console.log('[stage3.4] wrote', auditJson);

    // Write MD report
    const md = [];
    md.push('# Persian Pre-Gate Report — `' + audit.wave + '`');
    md.push('');
    md.push('**Country**: ' + audit.country.en + ' (' + audit.country.ar + ')');
    md.push('**Generated**: ' + audit.generatedAt);
    md.push('**Stage**: 3.4 (between Stage 3 validate and Stage 3.5 Arabic-name QA)');
    md.push('');
    md.push('## Summary');
    md.push('');
    md.push('| Bucket | Count |');
    md.push('| --- | --- |');
    md.push('| Total entries scanned                 | ' + audit.summary.totalRows + ' |');
    md.push('| Rows where Stage 3.4 made any change  | ' + audit.summary.rowsTouched + ' |');
    md.push('| └─ name.ar changed                    | ' + audit.summary.nameArChanged + ' |');
    md.push('| └─ aliases.ar changed                 | ' + audit.summary.aliasesArChanged + ' |');
    md.push('| Rows unchanged                        | ' + audit.summary.rowsUnchanged + ' |');
    md.push('| Rows with no Arabic at all (empty)    | ' + audit.summary.rowsEmpty + ' |');
    md.push('| Total character substitutions         | ' + audit.summary.totalCharsSubstituted + ' |');
    md.push('');
    md.push('## Touched by tier');
    md.push('');
    md.push('| Tier | Count of touched rows |');
    md.push('| --- | --- |');
    md.push('| high  | ' + (audit.byTier.high || 0) + ' |');
    md.push('| medium | ' + (audit.byTier.medium || 0) + ' |');
    md.push('| low   | ' + (audit.byTier.low || 0) + ' |');
    md.push('| other (existing/needs_review/rejected) | ' + (audit.byTier.other || 0) + ' |');
    md.push('');
    md.push('## Top character substitutions');
    md.push('');
    md.push('| Character (from) | Count |');
    md.push('| --- | --- |');
    for (const s of audit.summary.topCharSubstitutions.slice(0, 20)) {
        md.push('| `' + s.from + '` (U+' + s.from.codePointAt(0).toString(16).toUpperCase().padStart(4, '0') + ') | ' + s.count + ' |');
    }
    md.push('');
    md.push('## High-tier examples (up to 50)');
    md.push('');
    md.push('| slug | before name.ar | after name.ar | subs |');
    md.push('| --- | --- | --- | --- |');
    for (const r of audit.examples.high) {
        const subs = r.charsSubstituted.map(x => x.from + '→' + persianFrom(x.from)).join(', ');
        md.push('| ' + r.slug + ' | ' + r.nameAr.before + ' | ' + r.nameAr.after + ' | ' + subs + ' |');
    }
    md.push('');
    md.push('## Alias-only changes (sample)');
    md.push('');
    if (audit.examples.aliasOnly.length === 0) {
        md.push('_(none — every alias change had a corresponding name.ar change)_');
    } else {
        md.push('| slug | before aliases.ar | after aliases.ar |');
        md.push('| --- | --- | --- |');
        for (const r of audit.examples.aliasOnly) {
            md.push('| ' + r.slug + ' | ' + (r.aliasesAr.before.join(' / ') || '_(empty)_') + ' | ' + (r.aliasesAr.after.join(' / ') || '_(empty)_') + ' |');
        }
    }
    md.push('');
    md.push('## Notes');
    md.push('');
    md.push('* Stage 3.4 performs **character-level Unicode substitution only**.');
    md.push('  No transliteration, no wrong-city repair, no mojibake recovery.');
    md.push('* Strings with Latin mixed in are left unchanged; Stage 3.5 still');
    md.push('  classifies them as `mixed_latin` and blocks them.');
    md.push('* Output is **idempotent** — re-running on this candidates file');
    md.push('  produces zero further changes.');
    md.push('');

    const mdPath = path.join(paths.reportDir, 'geodata-' + wave + '-persian-pregate-report.md');
    fs.writeFileSync(mdPath, md.join('\n'));
    console.log('[stage3.4] wrote', mdPath);

    console.log('[stage3.4] summary:', JSON.stringify(audit.summary, null, 2));
    console.log('[stage3.4] DONE for', cc.toUpperCase());
}

// Tiny lookup helper for MD rendering (mirror the map without importing it
// from the normalizer — keeps coupling low).
function persianFrom(ch) {
    const m = {
        'ی':'ي','ک':'ك','پ':'ب','گ':'غ','چ':'ج','ژ':'ز','ۀ':'ه',
        'ٹ':'ت','ڈ':'د','ڑ':'ر','ہ':'ه','ے':'ي','ھ':'ه',
        'ښ':'ش','ګ':'غ','څ':'ج','ځ':'ز','ډ':'د','ړ':'ر','ڼ':'ن',
        'ۆ':'و','ڕ':'ر','ڵ':'ل','ۊ':'و'
    };
    return m[ch] || '?';
}

main().catch(e => {
    console.error('[stage3.4] FAILED:', e && e.message);
    if (e && e.stack) console.error(e.stack);
    process.exit(1);
});
