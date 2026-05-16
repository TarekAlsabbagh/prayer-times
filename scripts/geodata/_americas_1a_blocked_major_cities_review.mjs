// scripts/geodata/_americas_1a_blocked_major_cities_review.mjs
// ─────────────────────────────────────────────────────────────────────────
// AMERICAS-1A-BLOCKED-MAJOR-CITIES-FIX-1 — REVIEW REPORT ONLY (no merge)
//
// Extracts the 24 major blocked cities from US/CA/MX candidates JSONs
// and produces a markdown table for user review. Each row includes the
// proposed canonical Arabic, proposed final slug, block reason, and
// collision status.
//
// Does NOT modify any file in db/places/. Only writes a report to
// reports/geodata-americas-1a-blocked-major-cities-review.md
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { pathsFor, BASE_PATHS } from './_geonames_common.mjs';

// User-specified review list with proposed canonical Arabic + final slug
const REVIEW_LIST = [
    // Canada
    { cc: 'ca', slug: 'edmonton',  proposedAr: 'إدمونتون',     proposedSlug: 'edmonton',     decision: 'bare' },
    { cc: 'ca', slug: 'halifax',   proposedAr: 'هاليفاكس',     proposedSlug: 'halifax',      decision: 'bare' },
    { cc: 'ca', slug: 'quebec',    proposedAr: 'مدينة كيبك',   proposedSlug: 'quebec',       decision: 'bare' },
    { cc: 'ca', slug: 'winnipeg',  proposedAr: 'وينيبيغ',      proposedSlug: 'winnipeg',     decision: 'bare' },
    { cc: 'ca', slug: 'regina',    proposedAr: 'ريجاينا',      proposedSlug: 'regina',       decision: 'bare' },
    { cc: 'ca', slug: 'victoria',  proposedAr: 'فيكتوريا',     proposedSlug: 'victoria',     decision: 'bare' },
    { cc: 'ca', slug: 'cambridge', proposedAr: 'كامبريدج',     proposedSlug: 'cambridge-ca', decision: 'suffix' },

    // Mexico
    { cc: 'mx', slug: 'zapopan',   proposedAr: 'سابوبان',      proposedSlug: 'zapopan',      decision: 'bare' },
    { cc: 'mx', slug: 'ecatepec',  proposedAr: 'إيكاتيبيك',    proposedSlug: 'ecatepec',     decision: 'bare' },
    { cc: 'mx', slug: 'merida',    proposedAr: 'ميريدا',       proposedSlug: 'merida-mx',    decision: 'suffix' },
    { cc: 'mx', slug: 'cordoba',   proposedAr: 'كوردوبا',      proposedSlug: 'cordoba-mx',   decision: 'suffix' },

    // United States
    { cc: 'us', slug: 'philadelphia', proposedAr: 'فيلادلفيا',     proposedSlug: 'philadelphia', decision: 'bare' },
    { cc: 'us', slug: 'san-antonio',  proposedAr: 'سان أنطونيو',   proposedSlug: 'san-antonio',  decision: 'bare' },
    { cc: 'us', slug: 'austin',       proposedAr: 'أوستن',          proposedSlug: 'austin',       decision: 'bare' },
    { cc: 'us', slug: 'indianapolis', proposedAr: 'إنديانابوليس',  proposedSlug: 'indianapolis', decision: 'bare' },
    { cc: 'us', slug: 'las-vegas',    proposedAr: 'لاس فيغاس',     proposedSlug: 'las-vegas',    decision: 'bare' },
    { cc: 'us', slug: 'albuquerque',  proposedAr: 'ألباكركي',      proposedSlug: 'albuquerque',  decision: 'bare' },
    { cc: 'us', slug: 'milwaukee',    proposedAr: 'ميلواكي',       proposedSlug: 'milwaukee',    decision: 'bare' },
    { cc: 'us', slug: 'birmingham',   proposedAr: 'برمنغهام',       proposedSlug: 'birmingham-us',decision: 'suffix' },
    { cc: 'us', slug: 'manchester',   proposedAr: 'مانشستر',        proposedSlug: 'manchester-us',decision: 'suffix' },
    { cc: 'us', slug: 'cambridge',    proposedAr: 'كامبريدج',       proposedSlug: 'cambridge-us', decision: 'suffix' },
    { cc: 'us', slug: 'athens',       proposedAr: 'أثينا',          proposedSlug: 'athens-us',    decision: 'suffix' },
    { cc: 'us', slug: 'salem',        proposedAr: 'سايلم',          proposedSlug: 'TBD',          decision: 'TBD' },
    { cc: 'us', slug: 'toledo',       proposedAr: 'توليدو',         proposedSlug: 'TBD',          decision: 'TBD' }
];

function findCandidate(cc, slug) {
    const list = JSON.parse(fs.readFileSync(pathsFor(cc).candidatesJson, 'utf8'));
    const high = list.filter(e =>
        e.slug === slug && e.status === 'pending' && e.tier === 'high'
    );
    if (high.length > 0) {
        // Prefer largest population among multiple high-tier matches
        high.sort((a, b) => (b.candidate.population || 0) - (a.candidate.population || 0));
        return high[0];
    }
    // Fallback: any pending status
    const any = list.filter(e => e.slug === slug && e.status !== 'rejected');
    if (any.length > 0) {
        any.sort((a, b) => (b.candidate.population || 0) - (a.candidate.population || 0));
        return any[0];
    }
    return null;
}

function describeBlockReason(entry) {
    if (!entry) return 'NOT FOUND IN CANDIDATES';
    if (entry.status === 'needs_review') return 'needs_review: ' + (entry.reason || 'unspecified');
    if (entry.pendingAfterArGate === false) {
        const arQ = entry.arQuality && entry.arQuality.quality;
        if (arQ && arQ !== 'arabic_only' && arQ !== 'wikidata') {
            return 'ar-gate ' + arQ;
        }
        if (entry.collisionInWave) return 'collisionInWave (intra-wave)';
        if (entry.collisionAgainstCurated)
            return 'collisionAgainstCurated:' + entry.collisionAgainstCurated.existingCc;
        return 'pendingAfterArGate=false (mixed?)';
    }
    return entry.status;
}

function describeCollision(entry, proposedSlug, curatedSlugs) {
    if (!entry) return '—';
    if (entry.collisionInWave) return 'within-wave (other US/CA/MX entries)';
    if (entry.collisionAgainstCurated)
        return 'curated:' + entry.collisionAgainstCurated.existingCc + ' owns bare slug';
    // Check if proposed slug clashes with curated
    if (curatedSlugs.has(proposedSlug)) return '⚠️ proposed slug ALREADY in curated';
    return 'none';
}

function main() {
    const curated = JSON.parse(fs.readFileSync(pathsFor('us').curatedPath, 'utf8'));
    const curatedSlugs = new Set(curated.map(x => x.slug));
    const curatedByCc = {};
    for (const c of curated) {
        (curatedByCc[c.countryCode] = curatedByCc[c.countryCode] || []).push(c);
    }

    const rows = [];
    for (const item of REVIEW_LIST) {
        const entry = findCandidate(item.cc, item.slug);
        rows.push({ item, entry });
    }

    const lines = [];
    lines.push('# AMERICAS-1A-BLOCKED-MAJOR-CITIES-FIX-1 — Review Report');
    lines.push('');
    lines.push('**Wave**: `AMERICAS-1A` follow-up review');
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('**Cities under review**: ' + REVIEW_LIST.length);
    lines.push('**Curated total (before this fix)**: 1,582');
    lines.push('');
    lines.push('## Purpose');
    lines.push('');
    lines.push('Each row below is a major blocked city from AMERICAS-1A whose Arabic name needs manual correction (or whose slug needs explicit collision-resolution). No merge happens yet — this is review-only.');
    lines.push('');

    lines.push('## Per-country tables');
    lines.push('');
    for (const cc of ['ca', 'mx', 'us']) {
        const ccRows = rows.filter(r => r.item.cc === cc);
        if (!ccRows.length) continue;
        const ccName = { ca: '🇨🇦 Canada (7)', mx: '🇲🇽 Mexico (4)', us: '🇺🇸 United States (13)' }[cc];
        lines.push('### ' + ccName);
        lines.push('');
        lines.push('| slug | current ar (blocked) | **proposed ar** | en | pop | fc | tz | block reason | collision | **proposed final slug** |');
        lines.push('| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |');
        for (const { item, entry } of ccRows) {
            if (!entry) {
                lines.push('| `' + item.slug + '` | NOT FOUND | **`' + item.proposedAr + '`** | ? | ? | ? | ? | NOT IN CANDIDATES | — | **`' + item.proposedSlug + '`** |');
                continue;
            }
            const c = entry.candidate;
            const curAr = c.names.ar || '(empty)';
            const reason = describeBlockReason(entry);
            const col = describeCollision(entry, item.proposedSlug, curatedSlugs);
            const finalSlugCell = item.decision === 'TBD' ? '**`TBD` ⚠️**' : '**`' + item.proposedSlug + '`**';
            lines.push('| `' + item.slug + '` | `' + curAr + '` | **`' + item.proposedAr + '`** | ' + (c.names.en || '?')
                + ' | ' + (c.population || 0).toLocaleString() + ' | ' + (c.featureCode || '?')
                + ' | ' + (c.timezone || '?') + ' | ' + reason + ' | ' + col
                + ' | ' + finalSlugCell + ' |');
        }
        lines.push('');
    }

    // Decision-needed section
    lines.push('## Decisions needed before Stage 4');
    lines.push('');
    lines.push('### 1. `salem` (us) — bare vs `salem-us`?');
    lines.push('');
    lines.push('* US Salem OR is state capital (pop 175,535, PPLA).');
    lines.push('* No current `salem` owner in curated. Slug is FREE.');
    lines.push('* No ES/GB/etc. Salem to worry about.');
    lines.push('* BUT: 50+ "Salem" places exist in the US (towns, neighborhoods).');
    lines.push('* **Recommendation**: claim bare `salem` for the OR state capital (most notable). Future US Salem MA could be `salem-ma` if ever added.');
    lines.push('');
    lines.push('### 2. `toledo` (us) — bare vs `toledo-us`?');
    lines.push('');
    lines.push('* US Toledo OH (pop 265,638, PPLA2 city in northwest Ohio).');
    lines.push('* No current `toledo` owner in curated. Slug is FREE.');
    lines.push('* BUT: ES Toledo (Castilla-La Mancha) is a famous historic city (UNESCO World Heritage, pop ~83k). Highly likely to be added in a future EU-3-BLOCKED-REVIEW or EUROPE-1B follow-up.');
    lines.push('* **Recommendation**: claim `toledo-us` to preserve bare `toledo` for the future Spanish Toledo (historically more famous in Arabic culture as `طليطلة`).');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push('| Outcome | Count |');
    lines.push('| --- | ---: |');
    lines.push('| Bare slug (no collision risk) | ' + REVIEW_LIST.filter(r => r.decision === 'bare').length + ' |');
    lines.push('| Suffix `slug-cc` (resolves collision) | ' + REVIEW_LIST.filter(r => r.decision === 'suffix').length + ' |');
    lines.push('| TBD (salem, toledo) | ' + REVIEW_LIST.filter(r => r.decision === 'TBD').length + ' |');
    lines.push('| **TOTAL ready for merge after user approval** | **' + REVIEW_LIST.length + '** |');
    lines.push('');

    lines.push('## Next steps');
    lines.push('');
    lines.push('Reply to the assistant with one of:');
    lines.push('');
    lines.push('* **`approve all 24 as proposed`** — merge with proposed ar + slug decisions');
    lines.push('* **`approve with decisions: salem→bare, toledo→toledo-us`** (or other variants for TBD)');
    lines.push('* **`approve subset`** — list which to include and which to defer');
    lines.push('* **`adjust Arabic for X`** — provide corrected Arabic for any row before approval');
    lines.push('');
    lines.push('No merge yet — Stage 4 awaits user approval.');

    const outPath = path.join(BASE_PATHS.reportDir, 'geodata-americas-1a-blocked-major-cities-review.md');
    fs.writeFileSync(outPath, lines.join('\n'));
    console.log('[review] wrote ' + outPath);

    // Also summary to stdout
    console.log('');
    console.log('═══ Review summary ═══');
    let notFound = 0;
    for (const { item, entry } of rows) {
        if (!entry) {
            console.log('  ⚠️ NOT FOUND: ' + item.cc + '/' + item.slug);
            notFound++;
        } else {
            console.log('  ' + item.cc + '/' + item.slug.padEnd(20)
                + ' pop=' + String((entry.candidate.population || 0)).padEnd(10)
                + ' reason=' + describeBlockReason(entry).padEnd(40)
                + ' → ' + item.proposedSlug);
        }
    }
    console.log('');
    console.log('Cities not found in candidates:', notFound);
    console.log('Cities ready for review:', rows.length - notFound);
}

main();
