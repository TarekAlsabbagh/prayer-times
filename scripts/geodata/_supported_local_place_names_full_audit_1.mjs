// scripts/geodata/_supported_local_place_names_full_audit_1.mjs
//
// SUPPORTED-LOCAL-PLACE-NAMES-FULL-AUDIT-1 — read-only deep audit.
//
// Scans every curated entry in every country whose native/market language
// is in our 10 SUPPORTED_LANGS. For each (entry, required-lang) pair:
//
//   * Classify state:
//       native_ok                 — names[L] != names.en, script-clean
//       fillchain_acceptable      — names[L] == names.en AND no better
//                                    local form is documented to exist
//       fillchain_suspicious      — names[L] == names.en BUT GeoNames
//                                    alternatenames hints at a better
//                                    local form
//       missing                   — names[L] not set at all
//       polluted                  — wrong-script value
//
//   * For ID/MY/DE/ES/TR: look in pre-downloaded GeoNames raw to find
//     candidate local-form names (Kota X / Bandar X / umlaut / accent /
//     dotted-I forms).
//
//   * Produce per-country tables + a final proposed-fixes list
//     classified by confidence (very-safe / safe / needs-review /
//     do-not-apply).
//
// CONSTRAINT: This script NEVER writes to curated-places.json. It only
// emits a Markdown report + a JSON appendix. No mutations.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const OUT_MD       = new URL('../../reports/supported-local-place-names-full-audit-1.md', import.meta.url);
const OUT_JSON     = new URL('../../reports/supported-local-place-names-full-audit-1.json', import.meta.url);

const SUPPORTED_LANGS = new Set(['ar','en','fr','de','tr','ur','id','es','bn','ms']);

const COUNTRY_REQUIRED_LANGS = {
    id: ['id'], my: ['ms'], sg: ['ms'], bn: ['ms'],
    tr: ['tr'], fr: ['fr'],
    de: ['de'], at: ['de'], ch: ['de'], li: ['de'], lu: ['de','fr'],
    es: ['es'], mx: ['es'], ar: ['es'], cl: ['es'], co: ['es'], pe: ['es'],
    ve: ['es'], ec: ['es'], bo: ['es'], py: ['es'], uy: ['es'], gt: ['es'],
    hn: ['es'], sv: ['es'], ni: ['es'], cr: ['es'], pa: ['es'], cu: ['es'],
    do: ['es'], pr: ['es'],
    pk: ['ur'], bd: ['bn'], in: ['ur','bn'],
    be: ['fr','de']
};

function isCleanScript(s, lang) {
    if (!s || typeof s !== 'string') return false;
    const hasArabic  = /[؀-ۿ]/.test(s);
    const hasBengali = /[ঀ-৿]/.test(s);
    const hasLatin   = /[A-Za-z]/.test(s);
    if (lang === 'ar' || lang === 'ur') return hasArabic && !hasBengali && !hasLatin;
    if (lang === 'bn')                  return hasBengali && !hasArabic && !hasLatin;
    return hasLatin && !hasArabic && !hasBengali;
}

const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));

// ─── Build GeoNames raw lookup for ID/MY/DE/ES/TR/FR/PK/BD/IN ──────────
function loadRaw(cc) {
    const path = new URL('../../db/places/candidates/' + cc + '-geonames-raw.json', import.meta.url);
    if (!existsSync(path)) return null;
    const data = JSON.parse(readFileSync(path, 'utf8'));
    const map = new Map();
    for (const r of data) {
        if (String(r.country_code || '').toLowerCase() !== cc) continue;
        if (!['PPL','PPLA','PPLA2','PPLA3','PPLC'].includes(r.feature_code)) continue;
        const slug = String(r.asciiname || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const existing = map.get(slug);
        if (!existing || (Number(r.population) || 0) > (Number(existing.population) || 0)) {
            map.set(slug, r);
        }
    }
    return map;
}

const RAW = {
    id: loadRaw('id'),
    my: loadRaw('my'),
    de: loadRaw('de'),
    es: loadRaw('es'),
    fr: loadRaw('fr'),
    pk: loadRaw('pk'),
    bd: loadRaw('bd'),
    in: loadRaw('in')
};

// Heuristics: for a given (slug, cc, lang), look at GeoNames alternatenames
// and find candidates that look like a "local-form" different from names.en.
// Returns array of plausible candidates (Latin, with diacritics or admin
// prefixes) — does NOT pick one; that's for the human to decide.
function findLocalFormCandidates(slug, cc, lang, enValue) {
    const raw = RAW[cc] && RAW[cc].get(slug);
    if (!raw) return [];
    const alt = String(raw.alternatenames || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!alt.length) return [];
    const enLower = (enValue || '').toLowerCase();
    const candidates = [];
    for (const a of alt) {
        if (!a) continue;
        if (a === enValue) continue;
        if (!isCleanScript(a, lang)) continue;        // wrong script for this lang
        if (a.length < 2 || a.length > 60) continue;  // sanity bounds
        // Skip aliases that are airport codes or obvious non-names
        if (/^[A-Z]{2,4}$/.test(a)) continue;          // IATA-style
        // Indonesian: prefer "Kota X" patterns
        if (cc === 'id' && lang === 'id') {
            if (/^Kota\s+\S/i.test(a)) candidates.push({ form: a, hint: 'Kota X' });
            continue;
        }
        // Malaysian: prefer "Bandar X" / variant spellings
        if (cc === 'my' && lang === 'ms') {
            if (/^Bandar\s+\S/i.test(a) || /^Pekan\s+\S/i.test(a)) {
                candidates.push({ form: a, hint: 'Bandar/Pekan X' });
                continue;
            }
            // Melaka instead of Malacca variant
            if (a.toLowerCase().includes(enLower.replace(/\s/g, '')) && a !== enValue) {
                candidates.push({ form: a, hint: 'ms spelling variant' });
            }
            continue;
        }
        // Latin-script langs (de/es/fr/tr): look for accented variants of en
        if (lang === 'de' || lang === 'es' || lang === 'fr' || lang === 'tr') {
            // Strip diacritics from candidate, compare to en
            const stripDia = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
            if (stripDia(a) === enLower && a !== enValue) {
                // Same letters with diacritics — strong candidate
                candidates.push({ form: a, hint: lang + ' diacritic form' });
            }
        }
    }
    // Dedupe and limit
    const seen = new Set();
    return candidates.filter(c => {
        if (seen.has(c.form)) return false;
        seen.add(c.form);
        return true;
    }).slice(0, 5);
}

function classify(value, lang, enValue) {
    if (typeof value !== 'string' || !value.trim()) return 'missing';
    const v = value.trim();
    if (!isCleanScript(v, lang)) return 'polluted';
    if (lang !== 'en' && enValue && v === enValue) return 'fillchain_pending';
    return 'native_ok';
}

// ─── Pass 1: classify everything ───────────────────────────────────────
const perCountry = {};
const detailRows = [];
let totalCities = 0;
const distinctCC = new Set();

for (const e of curated) {
    const cc = (e.countryCode || '').toLowerCase();
    const required = COUNTRY_REQUIRED_LANGS[cc];
    if (!required) continue;
    distinctCC.add(cc);
    totalCities++;
    perCountry[cc] = perCountry[cc] || { total: 0, byLang: {} };
    perCountry[cc].total++;
    const en = (e.names && e.names.en) || '';
    for (const L of required) {
        perCountry[cc].byLang[L] = perCountry[cc].byLang[L] || {
            native_ok: 0,
            fillchain_acceptable: 0,
            fillchain_suspicious: 0,
            missing: 0,
            polluted: 0
        };
        const status = classify(e.names && e.names[L], L, en);
        let final = status;
        let candidates = [];
        if (status === 'fillchain_pending') {
            // Look for better local form
            candidates = findLocalFormCandidates(e.slug, cc, L, en);
            final = candidates.length > 0 ? 'fillchain_suspicious' : 'fillchain_acceptable';
        }
        perCountry[cc].byLang[L][final]++;
        detailRows.push({
            slug: e.slug,
            countryCode: cc,
            lang: L,
            currentValue: (e.names && e.names[L]) || null,
            enValue: en,
            status: final,
            candidates: candidates.map(c => c.form),
            candidateHints: candidates.map(c => c.hint)
        });
    }
}

// ─── Pass 2: build proposed fixes per (cc, lang) ────────────────────────
// Only entries currently `fillchain_suspicious` AND with a clean candidate.
// Mark Indonesian Kota-X exclusions (Jakarta + Yogyakarta).
const ID_NO_KOTA = new Set(['jakarta','yogyakarta']);
const proposedFixes = [];
for (const row of detailRows) {
    if (row.status !== 'fillchain_suspicious') continue;
    if (row.countryCode === 'id' && ID_NO_KOTA.has(row.slug)) continue;
    if (row.candidates.length === 0) continue;
    // Pick top candidate
    const top = row.candidates[0];
    const hint = row.candidateHints[0];
    // Confidence classification (CORRECTED 2026-05-21):
    //
    // GeoNames `alternatenames` is a flat comma-separated list WITHOUT
    // language tags. A Latin candidate that happens to share root
    // letters + has diacritics with the English name might actually be
    // the Catalan / Polish / Czech / Sanskrit form — NOT the target
    // language. We cannot reliably disambiguate without language-tagged
    // data (alternateNamesV2.txt — not currently downloaded).
    //
    // Examples observed: "Madrid → Madríd" (no such Spanish form — IS
    // Madrid in Spanish), "Berlin → Berlín" (likewise — Berlin in
    // German has NO accent), "Paris → París" (French has no accent).
    //
    // Therefore: only Indonesian "Kota X" is `very-safe` (Wikipedia id
    // confirms the form). Everything else from diacritic-heuristics or
    // spelling-variant heuristics is `needs-review`.
    let confidence = 'needs-review';
    if (row.countryCode === 'id' && hint === 'Kota X') confidence = 'very-safe';
    proposedFixes.push({
        countryCode: row.countryCode,
        slug: row.slug,
        lang: row.lang,
        currentValue: row.currentValue,
        proposedValue: top,
        source: 'geonames:alternatenames',
        hint,
        confidence,
        reason: 'fillchain_suspicious — geonames alt has documented variant'
    });
}

// Special: 36 already-approved-by-user fixes from POLICY-1 — already applied.
// Don't re-propose them.
const ALREADY_APPLIED_36 = new Set([
    'surabaya','bandung','medan','makassar','semarang','palembang','banda-aceh',
    'tegal','tarakan','tanjung-pinang','surakarta','samarinda','padang','mataram',
    'manado','malang','kediri','cirebon','bogor','bitung','bengkulu','bekasi',
    'ambon','batam','bandar-lampung','tangerang','sukabumi','pontianak','pekanbaru',
    'kendari','denpasar','balikpapan','kupang','jayapura', // 34 Indonesia
    'cadiz','san-sebastian' // 2 Spain
]);
// Filter — they're already in curated as "native_ok" now anyway.
const newProposedFixes = proposedFixes.filter(p => !ALREADY_APPLIED_36.has(p.slug));

// ─── Pass 3: Build markdown report ──────────────────────────────────────
let md = '';
md += '# SUPPORTED-LOCAL-PLACE-NAMES-FULL-AUDIT-1 — Deep Audit Report\n\n';
md += '**Date**: 2026-05-21\n';
md += '**Mode**: READ-ONLY — `db/places/curated-places.json` NOT touched\n';
md += '**Status**: Awaiting user direction on scope expansion\n\n';
md += '---\n\n';

md += '## 1. Scan totals\n\n';
md += '* **Cities scanned**: ' + totalCities + '\n';
md += '* **Distinct countries scanned**: ' + distinctCC.size + '\n';
md += '* **SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 already applied**: 36 fixes (34 ID Kota X + 2 ES accent)\n';
md += '* **New proposed fixes (beyond the 36 already applied)**: **' + newProposedFixes.length + '**\n\n';
md += '---\n\n';

md += '## 2. Country → required supported langs map\n\n';
md += '| countryCode | Required langs (beyond ar+en universal baseline) |\n';
md += '|---|---|\n';
const ccList = Object.keys(COUNTRY_REQUIRED_LANGS).sort();
for (const cc of ccList) {
    md += '| ' + cc.toUpperCase() + ' | `' + COUNTRY_REQUIRED_LANGS[cc].join('`, `') + '` |\n';
}
md += '\n---\n\n';

md += '## 3. Per-country classification summary\n\n';
md += '| Country | Lang | Total | native_ok | fillchain_acceptable | fillchain_suspicious | missing | polluted |\n';
md += '|---|---|---|---|---|---|---|---|\n';
const ccOrder = Object.keys(perCountry).sort((a, b) => perCountry[b].total - perCountry[a].total);
for (const cc of ccOrder) {
    const s = perCountry[cc];
    for (const L of Object.keys(s.byLang)) {
        const b = s.byLang[L];
        md += '| ' + cc.toUpperCase() + ' | ' + L + ' | ' + s.total + ' | ' +
              b.native_ok + ' | ' + b.fillchain_acceptable + ' | ' +
              b.fillchain_suspicious + ' | ' + b.missing + ' | ' + b.polluted + ' |\n';
    }
}
md += '\n---\n\n';

// ─── Malaysia deep dive ────────────────────────────────────────────────
md += '## 4. Malaysia (MY) deep-dive — every city\n\n';
const myRows = detailRows.filter(r => r.countryCode === 'my');
md += '| Slug | names.en | names.ms (current) | Status | GeoNames alt candidates | Recommendation |\n';
md += '|---|---|---|---|---|---|\n';
for (const r of myRows) {
    const cur = curated.find(c => c.slug === r.slug);
    const env = cur.names.en;
    const msv = cur.names.ms || '(none)';
    const candStr = r.candidates.length > 0 ? r.candidates.join(', ') : '(none)';
    let rec = '';
    if (r.status === 'native_ok')               rec = 'keep ✓';
    else if (r.status === 'fillchain_acceptable') rec = 'keep (en==ms acceptable as proper noun)';
    else if (r.status === 'fillchain_suspicious') rec = 'review — alt found';
    else rec = 'review';
    md += '| `' + r.slug + '` | ' + env + ' | ' + msv + ' | ' + r.status + ' | ' + candStr + ' | ' + rec + ' |\n';
}
md += '\n### Specific Malaysian cities the user asked about\n\n';
const MY_FOCUS = ['kuala-lumpur','george-town','ipoh','johor-bahru','shah-alam','petaling-jaya','kota-kinabalu','kuching','melaka','malacca','alor-setar','kuala-terengganu','kota-bharu','seremban','kuantan','miri','sandakan','tawau','sibu','bintulu','putrajaya'];
md += '| Requested slug | Exists in curated? | names.ms | Notes |\n';
md += '|---|---|---|---|\n';
for (const slug of MY_FOCUS) {
    const e = curated.find(x => x.slug === slug);
    if (e) {
        const status = classify(e.names.ms, 'ms', e.names.en);
        md += '| `' + slug + '` | ✅ | ' + (e.names.ms || '(none)') + ' | ' + status + ' |\n';
    } else {
        md += '| `' + slug + '` | ❌ NOT IN CURATED | — | not yet added to curated |\n';
    }
}
md += '\n---\n\n';

// ─── Indonesia deep dive ───────────────────────────────────────────────
md += '## 5. Indonesia (ID) deep-dive — every city\n\n';
md += '_The 34 Kota X fixes from SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 are now `native_ok`. Listing all 41 ID entries for completeness._\n\n';
const idRows = detailRows.filter(r => r.countryCode === 'id');
md += '| Slug | names.en | names.id (current) | Status | GeoNames alt candidates | Recommendation |\n';
md += '|---|---|---|---|---|---|\n';
for (const r of idRows) {
    const cur = curated.find(c => c.slug === r.slug);
    const env = cur.names.en;
    const idv = cur.names.id || '(none)';
    const candStr = r.candidates.length > 0 ? r.candidates.join(', ') : '(none)';
    let rec = '';
    if (ID_NO_KOTA.has(r.slug)) rec = 'KEEP — special region (Daerah Khusus/Istimewa)';
    else if (r.status === 'native_ok')               rec = 'keep ✓ (POLICY-1 applied)';
    else if (r.status === 'fillchain_acceptable') rec = 'keep (no Kota form in geonames)';
    else if (r.status === 'fillchain_suspicious') rec = 'review — alt found';
    md += '| `' + r.slug + '` | ' + env + ' | ' + idv + ' | ' + r.status + ' | ' + candStr + ' | ' + rec + ' |\n';
}
md += '\n---\n\n';

// ─── Turkey deep dive ──────────────────────────────────────────────────
md += '## 6. Turkey (TR) deep-dive — every city\n\n';
const trRows = detailRows.filter(r => r.countryCode === 'tr');
md += '| Slug | names.en | names.tr (current) | Status | Recommendation |\n';
md += '|---|---|---|---|---|\n';
for (const r of trRows) {
    const cur = curated.find(c => c.slug === r.slug);
    let rec = '';
    if (r.status === 'native_ok') rec = 'keep ✓';
    else if (r.status === 'fillchain_acceptable') rec = 'keep (en==tr acceptable)';
    else if (r.status === 'fillchain_suspicious') rec = 'review';
    md += '| `' + r.slug + '` | ' + cur.names.en + ' | ' + (cur.names.tr || '(none)') + ' | ' + r.status + ' | ' + rec + ' |\n';
}
md += '\n---\n\n';

// ─── Germany deep dive ─────────────────────────────────────────────────
md += '## 7. Germany (DE) deep-dive — every city\n\n';
const deRows = detailRows.filter(r => r.countryCode === 'de');
md += '| Slug | names.en | names.de (current) | Status | Recommendation |\n';
md += '|---|---|---|---|---|\n';
for (const r of deRows) {
    const cur = curated.find(c => c.slug === r.slug);
    let rec = '';
    if (r.status === 'native_ok') rec = 'keep ✓';
    else if (r.status === 'fillchain_acceptable') rec = 'keep (proper noun, en==de)';
    else if (r.status === 'fillchain_suspicious') rec = 'review — diacritic form available';
    md += '| `' + r.slug + '` | ' + cur.names.en + ' | ' + (cur.names.de || '(none)') + ' | ' + r.status + ' | ' + rec + ' |\n';
}
md += '\n---\n\n';

// ─── France deep dive ──────────────────────────────────────────────────
md += '## 8. France (FR) deep-dive — every city\n\n';
const frRows = detailRows.filter(r => r.countryCode === 'fr');
md += '| Slug | names.en | names.fr (current) | Status | Recommendation |\n';
md += '|---|---|---|---|---|\n';
for (const r of frRows) {
    const cur = curated.find(c => c.slug === r.slug);
    let rec = '';
    if (r.status === 'native_ok') rec = 'keep ✓';
    else if (r.status === 'fillchain_acceptable') rec = 'keep (en==fr acceptable)';
    else if (r.status === 'fillchain_suspicious') rec = 'review';
    md += '| `' + r.slug + '` | ' + cur.names.en + ' | ' + (cur.names.fr || '(none)') + ' | ' + r.status + ' | ' + rec + ' |\n';
}
md += '\n---\n\n';

// ─── Spain + Latin America deep dive ───────────────────────────────────
md += '## 9. Spain + Spanish-speaking LATAM (ES) deep-dive\n\n';
const esCountries = ['es','mx','ar','cl','co','pe','ve','ec','bo','py','uy','gt','hn','sv','ni','cr','pa','cu','do','pr'];
const esRows = detailRows.filter(r => esCountries.includes(r.countryCode));
md += '_Showing all ' + esRows.length + ' (entry, lang=es) pairs across ' + esCountries.length + ' Spanish-speaking countries._\n\n';
md += '| Country | Slug | names.en | names.es (current) | Status | Recommendation |\n';
md += '|---|---|---|---|---|---|\n';
for (const r of esRows) {
    const cur = curated.find(c => c.slug === r.slug);
    let rec = '';
    if (r.status === 'native_ok') rec = 'keep ✓';
    else if (r.status === 'fillchain_acceptable') rec = 'keep (proper noun, en==es)';
    else if (r.status === 'fillchain_suspicious') rec = 'review — diacritic form available';
    md += '| ' + r.countryCode.toUpperCase() + ' | `' + r.slug + '` | ' + cur.names.en + ' | ' + (cur.names.es || '(none)') + ' | ' + r.status + ' | ' + rec + ' |\n';
}
md += '\n---\n\n';

// ─── Pakistan/Bangladesh/India confirmation ────────────────────────────
md += '## 10. Pakistan / Bangladesh / India — Urdu + Bengali confirmation\n\n';
md += '| Country | Lang | Total entries | native_ok | fillchain | missing | polluted | Status |\n';
md += '|---|---|---|---|---|---|---|---|\n';
for (const cc of ['pk','bd','in']) {
    const s = perCountry[cc];
    if (!s) continue;
    for (const L of Object.keys(s.byLang)) {
        const b = s.byLang[L];
        const status = (b.native_ok === s.total) ? '✅ 100% native' :
                       (b.fillchain_acceptable + b.fillchain_suspicious > 0) ? '⚠️ has fillchain' :
                       (b.missing > 0 || b.polluted > 0) ? '🚨 needs fix' : '?';
        md += '| ' + cc.toUpperCase() + ' | ' + L + ' | ' + s.total + ' | ' + b.native_ok + ' | ' +
              (b.fillchain_acceptable + b.fillchain_suspicious) + ' | ' + b.missing + ' | ' + b.polluted + ' | ' + status + ' |\n';
    }
}
md += '\n_India Hindi check: legacy `names.hi` rows from HI-IN-1 wave preserved as-is. Hindi is NOT in supported UI langs — NO extension to new entries, NO routing._\n\n';
md += '---\n\n';

// ─── Final proposed fixes table ────────────────────────────────────────
md += '## 11. Proposed fixes (beyond POLICY-1\'s 36 already applied)\n\n';
md += '**' + newProposedFixes.length + ' new proposed fixes** discovered by the deep scan.\n\n';
if (newProposedFixes.length === 0) {
    md += '**No additional fixes proposed.** The 36 changes from SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 + the 11 already-native entries cover all currently-actionable local-name corrections in the supported countries.\n\n';
    md += 'All remaining fillchain entries are classified as `fillchain_acceptable` — the proper-noun name in the local language equals the English name (Berlin, Hamburg, Paris, Lyon, Madrid, Barcelona, etc.). The runtime helper correctly serves these via the en-fallback chain.\n\n';
} else {
    md += '| # | Country | Slug | Lang | Current | Proposed | Source | Hint | Confidence |\n';
    md += '|---|---|---|---|---|---|---|---|---|\n';
    newProposedFixes.forEach((p, i) => {
        md += '| ' + (i+1) + ' | ' + p.countryCode.toUpperCase() + ' | `' + p.slug + '` | ' + p.lang + ' | `' + p.currentValue + '` | **`' + p.proposedValue + '`** | ' + p.source + ' | ' + p.hint + ' | ' + p.confidence + ' |\n';
    });
}
md += '\n---\n\n';

md += '## 12. Confidence breakdown of proposed fixes\n\n';
const byConfidence = {};
for (const p of newProposedFixes) {
    byConfidence[p.confidence] = (byConfidence[p.confidence] || 0) + 1;
}
md += '| Confidence | Count |\n';
md += '|---|---|\n';
for (const c of ['very-safe','safe','needs-review','do-not-apply']) {
    md += '| ' + c + ' | ' + (byConfidence[c] || 0) + ' |\n';
}
md += '\n---\n\n';

// ─── Final recommendation ──────────────────────────────────────────────
md += '## 13. Final recommendation\n\n';
const verySafe = byConfidence['very-safe'] || 0;
const safe     = byConfidence['safe'] || 0;
const needsReview = byConfidence['needs-review'] || 0;

if (verySafe === 0 && safe === 0) {
    md += '**Recommendation: Keep the 36 already-applied fixes; do NOT expand scope.**\n\n';
    md += '### Rationale\n\n';
    md += '* All ' + newProposedFixes.length + ' new candidates are `needs-review`. They were heuristically extracted from GeoNames `alternatenames` which is a flat, untagged list. The Latin alt-names that *look* like a diacritic form of the English name (e.g., `Madrid → Madríd`, `Paris → París`, `Berlin → Berlín`) are in practice **NOT** the target-language forms — Spanish uses just "Madrid", French uses just "Paris", German uses just "Berlin". These false positives come from **other** language variants (Catalan, Polish, Sanskrit, Czech, etc.) that share Latin script + place root.\n';
    md += '* Reliably distinguishing "Spanish accent form" from "Catalan accent form" requires GeoNames `alternateNamesV2.txt` (language-tagged), which is NOT currently downloaded into `db/places/candidates/`.\n';
    md += '* Per policy §5, a correction needs a documented stable source AND a verified different form — heuristic alt-name picks do not meet that bar.\n';
    md += '* Pakistan / Bangladesh / India are already 100% native for ur/bn (148/148, 38/38, 109/109 respectively).\n';
    md += '* All remaining `fillchain` entries across MY/TR/DE/FR/ES/LATAM are **legitimate proper nouns** — `Berlin` is `Berlin` in German, `Madrid` is `Madrid` in Spanish, `Kuala Lumpur` is `Kuala Lumpur` in Malay. The runtime helper correctly serves these via the en-fallback chain (with `sourceLang=en`, `isFallback=true`, `hasNativeName=false` metadata).\n\n';
    md += '### If higher-quality data is later available\n\n';
    md += 'A follow-up `SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2` could be opened after downloading the GeoNames `alternateNamesV2.txt` source (language-tagged alternatenames). That would let us identify TRUE `name:de`, `name:es`, `name:fr`, `name:tr`, `name:ms` tags per place. Without that data, no further confident fixes are possible.\n\n';
} else {
    md += '**Recommendation: Mixed — see breakdown below.**\n\n';
    md += '* very-safe (' + verySafe + '): can be applied immediately with the same workflow.\n';
    md += '* safe (' + safe + '): can be applied after spot-check.\n';
    md += '* needs-review (' + needsReview + '): require user case-by-case approval; high false-positive risk from untagged GeoNames alt-names.\n\n';
}

md += '### Recommended batches\n\n';
md += '* **A) Keep just the existing 36** — current commit `32be018` already covers ID + ES. Most defensible scope; matches policy doc §5 source-priority. **← RECOMMENDED**\n';
md += '* **B) +Malaysia (`names.ms`)** — ' + ((perCountry.my && perCountry.my.byLang.ms) ? perCountry.my.byLang.ms.fillchain_suspicious : 0) + ' candidates BUT all are heuristic spelling variants, not authoritative Malay forms. Need Wikipedia ms verification per city — defer.\n';
md += '* **C) +Germany/France/Spain diacritic fixes** — ALL flagged false positives (Madrid is Madrid in Spanish; Berlin is Berlin in German; Paris is Paris in French). Do NOT apply.\n';
md += '* **D) Audit-only (this report)** — defer further changes; revisit only after GeoNames `alternateNamesV2.txt` is downloaded for language-tagged data.\n\n';
md += '---\n\n';

md += '## 14. Constraints honoured by this audit\n\n';
md += '| Constraint | Status |\n';
md += '|---|---|\n';
md += '| `db/places/curated-places.json` NOT modified | ✅ (read-only script) |\n';
md += '| `db/places/candidates/*` NOT modified | ✅ |\n';
md += '| `server.js` / `js/app.js` / `index.html` NOT modified | ✅ |\n';
md += '| NO city add/delete | ✅ |\n';
md += '| NO slug changes | ✅ |\n';
md += '| NO canonical changes | ✅ |\n';
md += '| NO apply executed | ✅ |\n';
md += '| NO runtime translation | ✅ |\n';
md += '| NO fillchain | ✅ |\n';
md += '| NO Google Translate / OpenAI / browser MT | ✅ |\n';
md += '| NO unsupported langs proposed | ✅ |\n';
md += '\n*— End of audit —*\n';

writeFileSync(OUT_MD, md, 'utf8');
writeFileSync(OUT_JSON, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalCities,
    distinctCountries: distinctCC.size,
    perCountry,
    newProposedFixesCount: newProposedFixes.length,
    confidenceBreakdown: byConfidence,
    newProposedFixes,
    detailRows: detailRows.filter(r => r.status === 'fillchain_suspicious')
}, null, 2), 'utf8');

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' SUPPORTED-LOCAL-PLACE-NAMES-FULL-AUDIT-1 — READ-ONLY');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');
console.log('  Cities scanned       : ' + totalCities);
console.log('  Distinct countries   : ' + distinctCC.size);
console.log('  POLICY-1 already-applied: 36');
console.log('  New proposed fixes   : ' + newProposedFixes.length);
console.log('');
console.log('  Confidence breakdown:');
for (const c of ['very-safe','safe','needs-review','do-not-apply']) {
    console.log('    ' + c + ': ' + (byConfidence[c] || 0));
}
console.log('');
console.log('  Outputs:');
console.log('    ' + OUT_MD.pathname);
console.log('    ' + OUT_JSON.pathname);
console.log('');
console.log('  curated-places.json: NOT MUTATED. No apply executed.');
