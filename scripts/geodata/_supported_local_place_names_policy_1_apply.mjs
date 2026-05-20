// scripts/geodata/_supported_local_place_names_policy_1_apply.mjs
//
// SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 — Phase B: APPLY.
//
// Replaces legacy fillchain `names[lang] = names.en` copies with the
// genuine local-language form for curated entries in countries whose
// native/market language is in our 10 SUPPORTED_LANGS.
//
// Sources (per user spec — no runtime translation):
//   * Indonesian "Kota X" admin form  — extracted from GeoNames
//     alternatenames where present. Wikipedia id.wp uses "Kota X" as
//     the canonical article title for these municipalities.
//   * Manual ENRICHMENT_OVERRIDES table for DE/ES/TR/FR major cities
//     where the local form has umlauts / accents / dotted-I that the
//     English column lost. Each entry cites its source.
//
// Strict invariants (verified post-mutation):
//   1. NO slug changes / NO canonical changes / NO new cities added
//   2. NO unsupported langs ever written (hi/ta/mr/etc.)
//   3. NO fillchain — never write `names[L] = names.en` (the very thing
//      we're cleaning up).
//   4. names.ar + names.en NEVER mutated.
//   5. Real-native curated entries (names[L] ≠ names.en, script-clean)
//      NEVER mutated — those are already correct.
//   6. Only Latin-script supported langs (id/ms/tr/fr/de/es) are
//      touched. ur/bn/ar pollution-cleanup is a separate concern
//      already handled by the runtime script guard in
//      CITY-NAME-SEO-FALLBACK-POLICY-1.
//
// Idempotent: re-running is a no-op when applied state is reached.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preSupportedLocalNames1.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/supported-local-place-names-policy-1-apply-report.json', import.meta.url);

const SUPPORTED_LANGS = new Set(['ar','en','fr','de','tr','ur','id','es','bn','ms']);

// Mirrors server/place-l10n/index.js (per-lang script validator).
function isCleanScript(s, lang) {
    if (!s || typeof s !== 'string') return false;
    const hasArabic  = /[؀-ۿ]/.test(s);
    const hasBengali = /[ঀ-৿]/.test(s);
    const hasLatin   = /[A-Za-z]/.test(s);
    if (lang === 'ar' || lang === 'ur') return hasArabic && !hasBengali && !hasLatin;
    if (lang === 'bn')                  return hasBengali && !hasArabic && !hasLatin;
    return hasLatin && !hasArabic && !hasBengali;
}

// ───────────────────────────────────────────────────────────────────────
// SECTION 1 — ENRICHMENT_OVERRIDES (manual, source-cited)
// ───────────────────────────────────────────────────────────────────────
// Each entry: { slug → { [lang]: { value, source } } }
// Sources accepted: 'wikipedia:<lang>', 'geonames:alt', 'manual:standard-translit'.
// Apply only when the curated entry's current `names[lang] === names.en`
// AND the override value is script-clean.

const ENRICHMENT_OVERRIDES = {
    // ── DE — German cities with umlauts (Wikipedia de.wp canonical) ──
    'munich':       { de: { value: 'München',    source: 'wikipedia:de' } },
    'cologne':      { de: { value: 'Köln',       source: 'wikipedia:de' } },
    'nuremberg':    { de: { value: 'Nürnberg',   source: 'wikipedia:de' } },
    'duesseldorf':  { de: { value: 'Düsseldorf', source: 'wikipedia:de' } },
    'dusseldorf':   { de: { value: 'Düsseldorf', source: 'wikipedia:de' } },
    'goettingen':   { de: { value: 'Göttingen',  source: 'wikipedia:de' } },
    'gottingen':    { de: { value: 'Göttingen',  source: 'wikipedia:de' } },
    'tuebingen':    { de: { value: 'Tübingen',   source: 'wikipedia:de' } },
    'tubingen':     { de: { value: 'Tübingen',   source: 'wikipedia:de' } },
    'wuerzburg':    { de: { value: 'Würzburg',   source: 'wikipedia:de' } },
    'wurzburg':     { de: { value: 'Würzburg',   source: 'wikipedia:de' } },
    'saarbruecken': { de: { value: 'Saarbrücken', source: 'wikipedia:de' } },
    'saarbrucken':  { de: { value: 'Saarbrücken', source: 'wikipedia:de' } },
    'osnabrueck':   { de: { value: 'Osnabrück',  source: 'wikipedia:de' } },
    'osnabruck':    { de: { value: 'Osnabrück',  source: 'wikipedia:de' } },
    'luebeck':      { de: { value: 'Lübeck',     source: 'wikipedia:de' } },
    'lubeck':       { de: { value: 'Lübeck',     source: 'wikipedia:de' } },

    // AT (Austria)
    'vienna':       { de: { value: 'Wien',       source: 'wikipedia:de' } },

    // CH (Switzerland — German parts)
    'zurich':       { de: { value: 'Zürich',     source: 'wikipedia:de' } },

    // ── ES — Spanish cities with accents (Wikipedia es.wp) ──
    'cordoba':      { es: { value: 'Córdoba',    source: 'wikipedia:es' } },
    'malaga':       { es: { value: 'Málaga',     source: 'wikipedia:es' } },
    'cadiz':        { es: { value: 'Cádiz',      source: 'wikipedia:es' } },
    'jaen':         { es: { value: 'Jaén',       source: 'wikipedia:es' } },
    'almeria':      { es: { value: 'Almería',   source: 'wikipedia:es' } },
    'leon':         { es: { value: 'León',       source: 'wikipedia:es' } },
    'logrono':      { es: { value: 'Logroño',    source: 'wikipedia:es' } },
    'logrono-es':   { es: { value: 'Logroño',    source: 'wikipedia:es' } },
    'aviles':       { es: { value: 'Avilés',     source: 'wikipedia:es' } },
    'castellon':    { es: { value: 'Castellón',  source: 'wikipedia:es' } },
    'castellon-de-la-plana': { es: { value: 'Castellón de la Plana', source: 'wikipedia:es' } },
    'caceres':      { es: { value: 'Cáceres',    source: 'wikipedia:es' } },
    'badajoz':      { es: { value: 'Badajoz',    source: 'wikipedia:es' } },
    'a-coruna':     { es: { value: 'A Coruña',   source: 'wikipedia:es' } },
    'a-coruna-es':  { es: { value: 'A Coruña',   source: 'wikipedia:es' } },
    'la-coruna':    { es: { value: 'La Coruña',  source: 'wikipedia:es' } },
    'eivissa':      { es: { value: 'Ibiza',      source: 'wikipedia:es' } },
    'palma-de-mallorca': { es: { value: 'Palma de Mallorca', source: 'wikipedia:es' } },
    'palma':        { es: { value: 'Palma',      source: 'wikipedia:es' } },
    'gijon':        { es: { value: 'Gijón',      source: 'wikipedia:es' } },
    'oviedo':       { es: { value: 'Oviedo',     source: 'wikipedia:es' } },
    'pamplona':     { es: { value: 'Pamplona',   source: 'wikipedia:es' } },
    'donostia-san-sebastian': { es: { value: 'San Sebastián', source: 'wikipedia:es' } },
    'san-sebastian': { es: { value: 'San Sebastián', source: 'wikipedia:es' } },
    'vitoria-gasteiz': { es: { value: 'Vitoria-Gasteiz', source: 'wikipedia:es' } },
    'vitoria':      { es: { value: 'Vitoria',    source: 'wikipedia:es' } },

    // MX — Spanish-speaking Latin America
    'mexico-city':  { es: { value: 'Ciudad de México', source: 'wikipedia:es' } },
    'merida':       { es: { value: 'Mérida',     source: 'wikipedia:es' } },
    'cancun':       { es: { value: 'Cancún',     source: 'wikipedia:es' } },
    'leon-mx':      { es: { value: 'León',       source: 'wikipedia:es' } },
    'queretaro':    { es: { value: 'Querétaro',  source: 'wikipedia:es' } },
    'culiacan':     { es: { value: 'Culiacán',   source: 'wikipedia:es' } },
    'mazatlan':     { es: { value: 'Mazatlán',   source: 'wikipedia:es' } },
    'torreon':      { es: { value: 'Torreón',    source: 'wikipedia:es' } },
    'tepic':        { es: { value: 'Tepic',      source: 'wikipedia:es' } },
    'irapuato':     { es: { value: 'Irapuato',   source: 'wikipedia:es' } },

    // AR — Argentina
    'cordoba-ar':   { es: { value: 'Córdoba',    source: 'wikipedia:es' } },
    'tucuman':      { es: { value: 'Tucumán',    source: 'wikipedia:es' } },
    'san-miguel-de-tucuman': { es: { value: 'San Miguel de Tucumán', source: 'wikipedia:es' } },

    // PE — Peru
    'lima':         { es: { value: 'Lima',       source: 'wikipedia:es' } },
    'arequipa':     { es: { value: 'Arequipa',   source: 'wikipedia:es' } },

    // CO — Colombia
    'bogota':       { es: { value: 'Bogotá',     source: 'wikipedia:es' } },
    'medellin':     { es: { value: 'Medellín',   source: 'wikipedia:es' } },
    'cali':         { es: { value: 'Cali',       source: 'wikipedia:es' } },

    // CL — Chile
    'concepcion':   { es: { value: 'Concepción', source: 'wikipedia:es' } },
    'valparaiso':   { es: { value: 'Valparaíso', source: 'wikipedia:es' } },

    // ── TR — Turkish cities with dotted-I, ş, ç (Wikipedia tr.wp) ──
    'istanbul':     { tr: { value: 'İstanbul',   source: 'wikipedia:tr' } },
    'izmir':        { tr: { value: 'İzmir',      source: 'wikipedia:tr' } },
    'icel':         { tr: { value: 'İçel',       source: 'wikipedia:tr' } },
    'sanliurfa':    { tr: { value: 'Şanlıurfa',  source: 'wikipedia:tr' } },
    'kahramanmaras': { tr: { value: 'Kahramanmaraş', source: 'wikipedia:tr' } },
    'gaziantep':    { tr: { value: 'Gaziantep',  source: 'wikipedia:tr' } },
    'eskisehir':    { tr: { value: 'Eskişehir',  source: 'wikipedia:tr' } },
    'kayseri':      { tr: { value: 'Kayseri',    source: 'wikipedia:tr' } },
    'mersin':       { tr: { value: 'Mersin',     source: 'wikipedia:tr' } },
    'diyarbakir':   { tr: { value: 'Diyarbakır', source: 'wikipedia:tr' } },
    'denizli':      { tr: { value: 'Denizli',    source: 'wikipedia:tr' } },

    // ── FR — French exonyms (only a few cities have distinct fr names) ──
    // For most French cities the fr name === en name (proper noun).
    // Differences are rare; the ones below cover known exonyms.
    // Most curated FR entries are already correct as fillchain (real name = en name).
    // No entries here for now — French cities Paris/Lyon/Marseille/etc.
    // all use the same Latin form in fr and en.

    // ── MS — Malaysian cities (few have distinct ms forms) ──
    // Most Malaysian city names are identical in ms and en. Exceptions:
    'georgetown':   { ms: { value: 'George Town', source: 'wikipedia:ms' } },
    'kota-kinabalu': { ms: { value: 'Kota Kinabalu', source: 'wikipedia:ms' } }, // same
};

// ───────────────────────────────────────────────────────────────────────
// SECTION 2 — Indonesian "Kota X" pattern (data-driven from GeoNames)
// ───────────────────────────────────────────────────────────────────────
// For Indonesian curated entries whose GeoNames alternatenames contains
// "Kota <enName>", apply names.id = "Kota <enName>". This is the
// administrative/Wikipedia-canonical form for Indonesian municipalities.
// Exceptions (no Kota prefix per Indonesian Wikipedia convention):
//   - Jakarta (Daerah Khusus Ibukota — special administrative)
//   - Yogyakarta (Daerah Istimewa Yogyakarta — special region)
const ID_NO_KOTA_PREFIX = new Set(['jakarta', 'yogyakarta']);

function buildIdKotaMap() {
    const out = new Map();
    if (!existsSync(new URL('../../db/places/candidates/id-geonames-raw.json', import.meta.url))) {
        return out;
    }
    const idRaw = JSON.parse(readFileSync(new URL('../../db/places/candidates/id-geonames-raw.json', import.meta.url), 'utf8'));
    // Build slug → alternatenames map (use asciiname slug, prefer biggest population among dupes)
    const bySlug = new Map();
    for (const r of idRaw) {
        if (r.country_code !== 'ID') continue;
        if (!['PPL','PPLA','PPLA2','PPLA3'].includes(r.feature_code)) continue;
        const slug = String(r.asciiname || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const existing = bySlug.get(slug);
        if (!existing || (Number(r.population) || 0) > (Number(existing.population) || 0)) {
            bySlug.set(slug, r);
        }
    }
    for (const [slug, r] of bySlug) {
        if (ID_NO_KOTA_PREFIX.has(slug)) continue;
        const alt = String(r.alternatenames || '').split(',').map(s => s.trim()).filter(Boolean);
        // Look for "Kota <Something>" form
        const kotaForm = alt.find(a => /^Kota\s+\S/i.test(a));
        if (kotaForm) out.set(slug, kotaForm);
    }
    return out;
}

const ID_KOTA_MAP = buildIdKotaMap();

// ───────────────────────────────────────────────────────────────────────
// SECTION 3 — APPLY pass
// ───────────────────────────────────────────────────────────────────────

const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const preHash = JSON.stringify(curated).length;

if (!existsSync(BACKUP_PATH)) {
    copyFileSync(CURATED_PATH, BACKUP_PATH);
    console.log('Backup written: ' + BACKUP_PATH.pathname);
}

const stats = {
    overrideApplied: 0,
    overrideSkippedNotFillchain: 0,
    overrideSkippedScriptInvalid: 0,
    overrideSkippedSlugNotInCurated: 0,
    idKotaApplied: 0,
    idKotaSkippedNotFillchain: 0,
    idKotaSkippedNoData: 0,
    totalEntriesTouched: 0,
    perLangApplied: { id: 0, ms: 0, tr: 0, fr: 0, de: 0, es: 0 },
    appliedDetail: []
};

// Helper to apply one change with all invariants
function applyChange(entry, lang, newValue, source) {
    if (!SUPPORTED_LANGS.has(lang)) return false; // refuse unsupported langs
    if (lang === 'ar' || lang === 'en') return false; // baseline langs are never overwritten
    if (typeof newValue !== 'string' || !newValue.trim()) return false;
    if (!isCleanScript(newValue, lang)) return false;
    if (newValue === entry.names.en) return false; // never re-fillchain
    const current = entry.names[lang];
    if (!current) return false; // only replace existing (this phase doesn't ADD net-new)
    if (current === newValue) return false; // already-applied — idempotent no-op
    if (current !== entry.names.en) return false; // only replace fillchain copies
    entry.names[lang] = newValue;
    stats.appliedDetail.push({
        slug: entry.slug,
        countryCode: entry.countryCode,
        lang,
        from: current,
        to: newValue,
        source
    });
    stats.perLangApplied[lang]++;
    return true;
}

const touchedSlugs = new Set();
for (const e of curated) {
    const slug = e.slug;
    const cc = (e.countryCode || '').toLowerCase();
    if (!e.names) continue;
    let touched = false;

    // (a) Indonesian "Kota X" pattern
    if (cc === 'id') {
        const kota = ID_KOTA_MAP.get(slug);
        if (kota) {
            if (e.names.id === e.names.en) {
                if (applyChange(e, 'id', kota, 'geonames:alt+id-wp')) {
                    stats.idKotaApplied++;
                    touched = true;
                }
            } else {
                stats.idKotaSkippedNotFillchain++;
            }
        } else {
            stats.idKotaSkippedNoData++;
        }
    }

    // (b) Manual ENRICHMENT_OVERRIDES
    const ov = ENRICHMENT_OVERRIDES[slug];
    if (ov) {
        for (const lang of Object.keys(ov)) {
            const spec = ov[lang];
            if (!isCleanScript(spec.value, lang)) {
                stats.overrideSkippedScriptInvalid++;
                continue;
            }
            if (e.names[lang] !== e.names.en) {
                stats.overrideSkippedNotFillchain++;
                continue;
            }
            if (applyChange(e, lang, spec.value, spec.source)) {
                stats.overrideApplied++;
                touched = true;
            }
        }
    }

    if (touched) touchedSlugs.add(slug);
}
stats.totalEntriesTouched = touchedSlugs.size;

// ───────────────────────────────────────────────────────────────────────
// SECTION 4 — POST-MUTATION ASSERTIONS (invariants)
// ───────────────────────────────────────────────────────────────────────

let assertionFails = 0;

// (1) No slug changed.
const orig = JSON.parse(readFileSync(BACKUP_PATH, 'utf8'));
const origSlugs = orig.map(e => e.slug).sort();
const newSlugs  = curated.map(e => e.slug).sort();
if (origSlugs.length !== newSlugs.length || origSlugs.some((s, i) => s !== newSlugs[i])) {
    console.error('INVARIANT FAIL: slug set changed');
    assertionFails++;
}

// (2) No countryCode / lat / lng / timezone / type / canonical / source mutated.
const origBySlug = new Map(orig.map(e => [e.slug, e]));
for (const e of curated) {
    const o = origBySlug.get(e.slug);
    if (!o) continue;
    for (const k of ['countryCode','lat','lng','timezone','type','source','sourceId','priority','verified']) {
        if (JSON.stringify(e[k]) !== JSON.stringify(o[k])) {
            console.error('INVARIANT FAIL: ' + e.slug + '.' + k + ' changed');
            assertionFails++;
        }
    }
}

// (3) names.ar + names.en never mutated.
for (const e of curated) {
    const o = origBySlug.get(e.slug);
    if (!o || !o.names || !e.names) continue;
    if (o.names.ar !== e.names.ar) {
        console.error('INVARIANT FAIL: ' + e.slug + '.names.ar mutated (' + o.names.ar + ' → ' + e.names.ar + ')');
        assertionFails++;
    }
    if (o.names.en !== e.names.en) {
        console.error('INVARIANT FAIL: ' + e.slug + '.names.en mutated (' + o.names.en + ' → ' + e.names.en + ')');
        assertionFails++;
    }
}

// (4) No unsupported lang ADDED by this apply.
//
// Pre-existing legacy `names.hi` (from HI-IN-1 wave, preserved as-is per
// per-country supported-lang policy) is allowed to remain — we don't
// EXTEND but we don't DELETE either. The invariant is therefore: this
// apply must not introduce a new unsupported-lang key vs the backup.
const origByS = new Map(orig.map(e => [e.slug, e]));
for (const e of curated) {
    if (!e.names) continue;
    const o = origByS.get(e.slug);
    const origKeys = new Set(o && o.names ? Object.keys(o.names) : []);
    for (const L of Object.keys(e.names)) {
        if (!SUPPORTED_LANGS.has(L) && !origKeys.has(L)) {
            console.error('INVARIANT FAIL: ' + e.slug + '.names.' + L + ' is an UNSUPPORTED lang ADDED by this apply');
            assertionFails++;
        }
    }
}

// (5) No fillchain reintroduced: for every applied change, the new value
//     must NOT equal names.en. (Sanity — the helper above already enforces.)
for (const detail of stats.appliedDetail) {
    const e = curated.find(x => x.slug === detail.slug);
    if (!e) continue;
    if (e.names[detail.lang] === e.names.en) {
        console.error('INVARIANT FAIL: ' + detail.slug + '.names.' + detail.lang + ' === names.en (fillchain reintroduced)');
        assertionFails++;
    }
}

// (6) All applied values pass per-lang script validation.
for (const detail of stats.appliedDetail) {
    const e = curated.find(x => x.slug === detail.slug);
    if (!e) continue;
    if (!isCleanScript(e.names[detail.lang], detail.lang)) {
        console.error('INVARIANT FAIL: ' + detail.slug + '.names.' + detail.lang + ' = "' + e.names[detail.lang] + '" failed script validation');
        assertionFails++;
    }
}

// (7) No real-native entry was clobbered. For each modified entry,
//     the prior value MUST have been names.en (fillchain copy).
for (const detail of stats.appliedDetail) {
    if (detail.from !== orig.find(o => o.slug === detail.slug).names.en) {
        console.error('INVARIANT FAIL: ' + detail.slug + ' applied over non-fillchain prior value "' + detail.from + '"');
        assertionFails++;
    }
}

// ───────────────────────────────────────────────────────────────────────
// SECTION 5 — Write back (only if all invariants passed)
// ───────────────────────────────────────────────────────────────────────

if (assertionFails > 0) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════════════');
    console.error(' APPLY ABORTED — ' + assertionFails + ' invariant failures');
    console.error('═══════════════════════════════════════════════════════════════════════');
    process.exit(1);
}

// Match existing curated indentation (2-space, sorted lang keys preserved
// because we never created new keys — only replaced existing values).
writeFileSync(CURATED_PATH, JSON.stringify(curated, null, 2) + '\n', 'utf8');
writeFileSync(REPORT_PATH, JSON.stringify(stats, null, 2), 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 — APPLY');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');
console.log('  Total entries touched : ' + stats.totalEntriesTouched);
console.log('  Indonesian Kota X     : ' + stats.idKotaApplied);
console.log('    skipped (no data)   : ' + stats.idKotaSkippedNoData);
console.log('    skipped (not fillchain — already native) : ' + stats.idKotaSkippedNotFillchain);
console.log('  Manual overrides      : ' + stats.overrideApplied);
console.log('    skipped (not fillchain) : ' + stats.overrideSkippedNotFillchain);
console.log('    skipped (script invalid) : ' + stats.overrideSkippedScriptInvalid);
console.log('');
console.log('  Per-lang applied counts:');
for (const L of Object.keys(stats.perLangApplied)) {
    console.log('    .' + L + ': ' + stats.perLangApplied[L]);
}
console.log('');
console.log('  All ' + Object.keys({}).length + ' invariants passed.');
console.log('');
console.log('  Report  : ' + REPORT_PATH.pathname);
console.log('  Backup  : ' + BACKUP_PATH.pathname);
console.log('═══════════════════════════════════════════════════════════════════════');
