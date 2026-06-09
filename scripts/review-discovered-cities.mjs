#!/usr/bin/env node
/* =============================================================================
 * scripts/review-discovered-cities.mjs
 * DISCOVERED-CITY-TO-CURATED-REVIEW-WORKFLOW-FIX-1
 *
 * READ-ONLY review tool. Reads the accumulated user-selected cities from Supabase
 * `discovered_places` (or a local --fixture JSON for offline/testing), cross-checks
 * each against db/places/curated-places.json, classifies it, and emits two review
 * artifacts for a HUMAN to act on:
 *     reports/pending-discovered-cities.md     (human-readable, grouped by country)
 *     reports/pending-discovered-cities.json   (machine-readable, for a later apply step)
 *
 * It NEVER promotes a city, NEVER writes to curated-places.json, NEVER writes to
 * Supabase (GET only), and NEVER translates / fillchains a name. The actual promotion
 * stays a separate, per-batch, human-approved apply ticket.
 *
 * Classes (precedence, first match wins):
 *   ALREADY_CURATED     — same place already in curated (slug or name match, same cc)
 *   NEAR_DUPLICATE      — a curated city in the same cc sits within --near-deg (likely same place)
 *   SLUG_CONFLICT       — the clean slug is taken globally by a DIFFERENT curated place
 *   SKIP_LOW_CONFIDENCE — selected_count < --min-selected (rarely picked; deprioritised)
 *   NEEDS_AR_NAME       — no trustworthy Arabic name (missing / wrong-script / == English)
 *   READY_FOR_REVIEW    — native ar+en, clean free slug, not a dup → candidate (human still reviews)
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/review-discovered-cities.mjs
 *   node scripts/review-discovered-cities.mjs --fixture path/to/rows.json        # offline / testing
 *   node scripts/review-discovered-cities.mjs --min-selected 3 --near-deg 0.15   # tuning
 *   node scripts/review-discovered-cities.mjs --out reports/_demo-pending        # alt output prefix
 * ============================================================================= */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURATED = path.join(__dirname, '..', 'db', 'places', 'curated-places.json');

// ── Country → required SUPPORTED local langs (beyond ar+en). Copied verbatim from
//    scripts/geodata/_supported_local_place_names_policy_1_audit.mjs for consistency. ──
export const COUNTRY_REQUIRED_LANGS = {
    id: ['id'],
    my: ['ms'], sg: ['ms'], bn: ['ms'],
    tr: ['tr'],
    fr: ['fr'],
    de: ['de'], at: ['de'], ch: ['de'], li: ['de'], lu: ['de', 'fr'],
    es: ['es'], mx: ['es'], ar: ['es'], cl: ['es'], co: ['es'], pe: ['es'],
    ve: ['es'], ec: ['es'], bo: ['es'], py: ['es'], uy: ['es'], gt: ['es'],
    hn: ['es'], sv: ['es'], ni: ['es'], cr: ['es'], pa: ['es'], cu: ['es'],
    do: ['es'], pr: ['es'],
    pk: ['ur'],
    bd: ['bn'],
    in: ['ur', 'bn'],
    be: ['fr', 'de']
};

// ── Per-lang strict script validation (mirrors server/place-l10n/index.js). ──
export function isCleanScript(s, lang) {
    if (!s || typeof s !== 'string') return false;
    const hasArabic = /[؀-ۿ]/.test(s);
    const hasBengali = /[ঀ-৿]/.test(s);
    const hasLatin = /[A-Za-z]/.test(s);
    if (lang === 'ar' || lang === 'ur') return hasArabic && !hasBengali && !hasLatin;
    if (lang === 'bn') return hasBengali && !hasArabic && !hasLatin;
    return hasLatin && !hasArabic && !hasBengali; // en/fr/de/tr/id/es/ms
}

// ── Classify one localized name string: missing | polluted | fillchain | native. ──
export function classifyField(value, lang, enValue) {
    if (typeof value !== 'string' || !value.trim()) return 'missing';
    const v = value.trim();
    if (!isCleanScript(v, lang)) return 'polluted';
    if (lang !== 'en' && enValue && v === enValue) return 'fillchain';
    return 'native';
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

// ── Propose a clean curated slug: strip a trailing "-{cc}" suffix the discovery added. ──
export function cleanSlugFor(slug, cc) {
    if (typeof slug !== 'string') return '';
    const suffix = '-' + cc;
    if (slug.endsWith(suffix) && slug.length > suffix.length) {
        const base = slug.slice(0, -suffix.length);
        if (SLUG_RE.test(base)) return base;
    }
    return slug;
}

// ── Collect every name + alias string from an entry (for collision checks). ──
function namesAndAliases(p) {
    const out = [];
    if (p.names) for (const v of Object.values(p.names)) if (v) out.push(String(v).trim().toLowerCase());
    if (p.aliases) for (const arr of Object.values(p.aliases)) if (Array.isArray(arr)) for (const v of arr) if (v) out.push(String(v).trim().toLowerCase());
    return out;
}

// ── Build read-only indices over the curated array. ──
export function buildCuratedIndex(curatedArr) {
    const bySlug = Object.create(null);
    const byCc = Object.create(null);
    for (const e of curatedArr) {
        const cc = (e.countryCode || '').toLowerCase();
        if (e.slug && !bySlug[e.slug]) bySlug[e.slug] = e;
        (byCc[cc] = byCc[cc] || []).push(e);
    }
    return { bySlug, byCc };
}

// ── Normalise a discovered row (Supabase snake_case OR fixture) to a common shape. ──
export function normalizeRow(r) {
    return {
        slug: r.slug,
        type: r.type,
        countryCode: String(r.country_code || r.countryCode || '').toLowerCase(),
        lat: Number(r.lat),
        lng: Number(r.lng),
        timezone: r.timezone,
        names: r.names || {},
        aliases: r.aliases || {},
        nameQuality: r.name_quality || r.nameQuality || {},
        source: r.source,
        sourceId: r.source_id || r.sourceId || null,
        verified: !!r.verified,
        selectedCount: Number(r.selected_count != null ? r.selected_count : (r.selectedCount || 0)),
        searchCount: Number(r.search_count != null ? r.search_count : (r.searchCount || 0))
    };
}

function within(entry, lat, lng, deg) {
    return Math.abs(Number(entry.lat) - lat) < deg && Math.abs(Number(entry.lng) - lng) < deg;
}

// ── The core classifier. Pure: (row, curatedIndex, opts) → review record. ──
export function classifyRow(rawRow, idx, opts = {}) {
    const minSelected = opts.minSelected != null ? opts.minSelected : 1;
    const nearDeg = opts.nearDeg != null ? opts.nearDeg : 0.15;
    const row = normalizeRow(rawRow);
    const cc = row.countryCode;
    const cleanSlug = cleanSlugFor(row.slug, cc);
    const sameCc = idx.byCc[cc] || [];

    // name assessment (script-validated, independent of name_quality tags)
    const en = (row.names && row.names.en) || '';
    const requiredLocal = COUNTRY_REQUIRED_LANGS[cc] || [];
    const SUPPORTED_LANGS = ['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'es', 'bn', 'ms'];
    const nameStatus = {};
    // assess every PRESENT supported-lang name (so the suggestion can carry a native local
    // name like fr for Morocco) — NO translation, we only read what already exists ...
    for (const L of SUPPORTED_LANGS) {
        const v = row.names[L];
        if (v != null && String(v).trim() !== '') nameStatus[L] = classifyField(v, L, en);
    }
    // ... plus always record ar+en+required-local (so 'missing' shows for the gate/warning)
    for (const L of ['ar', 'en', ...requiredLocal]) if (!(L in nameStatus)) nameStatus[L] = classifyField(row.names[L], L, en);
    const arStatus = nameStatus.ar;          // missing | polluted | fillchain | native
    const arQuality = (row.nameQuality && row.nameQuality.ar) || 'untagged';

    // dedup signals
    const discNames = namesAndAliases({ names: row.names, aliases: row.aliases });
    const slugHit = idx.bySlug[cleanSlug] || idx.bySlug[row.slug] || null;
    const nameHit = sameCc.find(c => namesAndAliases(c).some(n => discNames.includes(n))) || null;
    const nearHit = sameCc.find(c => within(c, row.lat, row.lng, nearDeg)) || null;

    // missing required local langs (soft warning, not a blocker)
    const missingLocal = requiredLocal.filter(L => nameStatus[L] !== 'native');

    let cls, reason;
    if (nameHit || (slugHit && (slugHit.countryCode || '').toLowerCase() === cc)) {
        cls = 'ALREADY_CURATED';
        reason = nameHit ? `name matches curated "${nameHit.slug}"` : `slug "${(slugHit || {}).slug}" already curated in ${cc}`;
    } else if (slugHit) {
        cls = 'SLUG_CONFLICT';
        reason = `clean slug "${cleanSlug}" is taken by curated "${slugHit.slug}" (${(slugHit.countryCode || '').toLowerCase()}) — different place`;
    } else if (nearHit) {
        cls = 'NEAR_DUPLICATE';
        reason = `within ${nearDeg}° of curated "${nearHit.slug}" (${nearHit.lat},${nearHit.lng}) — likely same place, different slug`;
    } else if (row.selectedCount < minSelected) {
        cls = 'SKIP_LOW_CONFIDENCE';
        reason = `selected_count ${row.selectedCount} < min ${minSelected}`;
    } else if (arStatus !== 'native') {
        cls = 'NEEDS_AR_NAME';
        reason = `names.ar is ${arStatus} (quality tag: ${arQuality}) — supply a trustworthy Arabic name manually`;
    } else {
        cls = 'READY_FOR_REVIEW';
        reason = missingLocal.length
            ? `native ar+en present; missing required local lang(s): ${missingLocal.join(',')} — add before promote`
            : 'native ar+en (+ required local langs) present';
    }

    // proposed curated entry (only the trustworthy/native names are carried — NO translation)
    const suggestedNames = {};
    for (const L of Object.keys(nameStatus)) if (nameStatus[L] === 'native') suggestedNames[L] = String(row.names[L]).trim();
    const suggestion = {
        slug: cleanSlug, type: row.type || 'city', countryCode: cc,
        lat: row.lat, lng: row.lng, timezone: row.timezone,
        names: suggestedNames, source: 'curated', verified: true
    };

    return {
        class: cls, reason,
        countryCode: cc, originalSlug: row.slug, cleanSlug,
        selectedCount: row.selectedCount, searchCount: row.searchCount,
        source: row.source, verified: row.verified,
        lat: row.lat, lng: row.lng, timezone: row.timezone,
        names: row.names, nameQuality: row.nameQuality,
        nameStatus, arStatus, arQuality, missingLocal,
        dedup: {
            slugHit: slugHit ? slugHit.slug : null,
            nameHit: nameHit ? nameHit.slug : null,
            nearHit: nearHit ? nearHit.slug : null
        },
        suggestion
    };
}

// ── Read discovered rows from Supabase (GET only) or a local fixture file. ──
async function loadDiscovered(opts) {
    if (opts.fixture) {
        const raw = JSON.parse(fs.readFileSync(opts.fixture, 'utf8'));
        const rows = Array.isArray(raw) ? raw : (raw.rows || raw.data || []);
        return { rows, source: 'fixture:' + opts.fixture };
    }
    const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const SUPABASE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('No --fixture given and SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. ' +
            'Set both env vars to read live discovered_places, or pass --fixture <file.json> for offline review.');
    }
    const url = SUPABASE_URL + '/rest/v1/discovered_places?select=*&order=selected_count.desc&limit=' + (opts.limit || 5000);
    const r = await fetch(url, {                          // GET ONLY — never POST/PATCH/DELETE
        method: 'GET',
        headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, Accept: 'application/json' }
    });
    if (!r.ok) throw new Error('Supabase GET failed: ' + r.status + ' ' + (await r.text()).slice(0, 200));
    const rows = await r.json();
    return { rows: Array.isArray(rows) ? rows : [], source: 'supabase' };
}

const CLASS_ORDER = ['READY_FOR_REVIEW', 'NEEDS_AR_NAME', 'NEAR_DUPLICATE', 'SLUG_CONFLICT', 'ALREADY_CURATED', 'SKIP_LOW_CONFIDENCE'];

function renderMarkdown(results, meta) {
    const counts = {}; for (const c of CLASS_ORDER) counts[c] = 0;
    for (const r of results) counts[r.class] = (counts[r.class] || 0) + 1;
    const L = [];
    L.push('# Pending Discovered Cities — Review Queue');
    L.push('');
    L.push(`> Generated by \`scripts/review-discovered-cities.mjs\` (READ-ONLY). Source: **${meta.source}** · rows: **${results.length}** · curated: **${meta.curatedCount}** · min-selected: ${meta.minSelected} · near-deg: ${meta.nearDeg}`);
    L.push('> This file is advisory. NO city is promoted by generating it. Promotion stays a separate, per-batch, human-approved apply ticket.');
    L.push('');
    L.push('## Summary');
    L.push('| Class | Count | Meaning |');
    L.push('|---|---|---|');
    const meaning = {
        READY_FOR_REVIEW: 'native ar+en, clean free slug — promotable after human OK',
        NEEDS_AR_NAME: 'no trustworthy Arabic name — supply manually (no runtime translation)',
        NEAR_DUPLICATE: 'geo-close to a curated city — verify it is not the same place',
        SLUG_CONFLICT: 'clean slug taken by a different curated place — disambiguate',
        ALREADY_CURATED: 'same place already curated — skip',
        SKIP_LOW_CONFIDENCE: 'rarely picked (below min-selected) — deprioritised'
    };
    for (const c of CLASS_ORDER) L.push(`| ${c} | ${counts[c]} | ${meaning[c]} |`);
    L.push('');
    // group by country, sort by selected_count desc within group, countries by total desc
    const byCc = {};
    for (const r of results) (byCc[r.countryCode] = byCc[r.countryCode] || []).push(r);
    const ccs = Object.keys(byCc).sort((a, b) => byCc[b].length - byCc[a].length || a.localeCompare(b));
    L.push('## By country');
    for (const cc of ccs) {
        const rows = byCc[cc].sort((a, b) => b.selectedCount - a.selectedCount || a.cleanSlug.localeCompare(b.cleanSlug));
        L.push('');
        L.push(`### ${cc.toUpperCase()} (${rows.length})`);
        L.push('| picks | class | clean slug | orig slug | names (status) | tz | reason |');
        L.push('|---|---|---|---|---|---|---|');
        for (const r of rows) {
            const namesCell = Object.keys(r.nameStatus).map(L2 => `${L2}:${(r.names[L2] || '∅')}·${r.nameStatus[L2]}`).join('<br>');
            L.push(`| ${r.selectedCount} | ${r.class} | \`${r.cleanSlug}\` | \`${r.originalSlug}\` | ${namesCell} | ${r.timezone} | ${r.reason} |`);
        }
    }
    L.push('');
    L.push('## Next step');
    L.push('Hand-pick `READY_FOR_REVIEW` (and `NEEDS_AR_NAME` after adding Arabic names) into a dedicated apply script (the proven `add-*-to-curated.mjs` pattern), then commit + push under a separate ticket. This review run wrote NOTHING to curated or Supabase.');
    L.push('');
    return L.join('\n');
}

async function main() {
    const argv = process.argv.slice(2);
    const opts = { minSelected: 1, nearDeg: 0.15, limit: 5000, fixture: null, out: 'reports/pending-discovered-cities' };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--fixture') opts.fixture = argv[++i];
        else if (a === '--min-selected') opts.minSelected = Number(argv[++i]);
        else if (a === '--near-deg') opts.nearDeg = Number(argv[++i]);
        else if (a === '--limit') opts.limit = Number(argv[++i]);
        else if (a === '--out') opts.out = argv[++i];
    }
    const curatedArr = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    const idx = buildCuratedIndex(curatedArr);
    const { rows, source } = await loadDiscovered(opts);
    const results = rows.map(r => classifyRow(r, idx, opts));
    const meta = { source, curatedCount: curatedArr.length, minSelected: opts.minSelected, nearDeg: opts.nearDeg };

    const outMd = path.isAbsolute(opts.out) ? opts.out + '.md' : path.join(__dirname, '..', opts.out + '.md');
    const outJson = path.isAbsolute(opts.out) ? opts.out + '.json' : path.join(__dirname, '..', opts.out + '.json');
    fs.writeFileSync(outMd, renderMarkdown(results, meta), 'utf8');
    fs.writeFileSync(outJson, JSON.stringify({ meta, results }, null, 2) + '\n', 'utf8');

    const counts = {}; for (const r of results) counts[r.class] = (counts[r.class] || 0) + 1;
    console.log('Reviewed', results.length, 'discovered rows from', source);
    for (const c of CLASS_ORDER) if (counts[c]) console.log('  ' + c + ':', counts[c]);
    console.log('Wrote', path.relative(path.join(__dirname, '..'), outMd), '+', path.relative(path.join(__dirname, '..'), outJson), '(READ-ONLY: no curated / no Supabase writes)');
}

// run only when invoked directly (so tests can import the pure functions)
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
}
