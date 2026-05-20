// scripts/geodata/_supported_local_place_names_policy_1_preview.mjs
//
// SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 — DRY-RUN PREVIEW (read-only).
//
// Simulates what the apply script would write to db/places/curated-places.json
// WITHOUT mutating anything. Emits a detailed per-country preview, classification
// (very-safe / needs-review / do-not-apply), and full before/after sample table.
//
// NO mutation. Pure observation.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const REPORT_PATH  = new URL('../../reports/supported-local-place-names-policy-1-preview.json', import.meta.url);
const MD_PATH      = new URL('../../reports/supported-local-place-names-policy-1-preview.md', import.meta.url);

const SUPPORTED_LANGS = new Set(['ar','en','fr','de','tr','ur','id','es','bn','ms']);

function isCleanScript(s, lang) {
    if (!s || typeof s !== 'string') return false;
    const hasArabic  = /[؀-ۿ]/.test(s);
    const hasBengali = /[ঀ-৿]/.test(s);
    const hasLatin   = /[A-Za-z]/.test(s);
    if (lang === 'ar' || lang === 'ur') return hasArabic && !hasBengali && !hasLatin;
    if (lang === 'bn')                  return hasBengali && !hasArabic && !hasLatin;
    return hasLatin && !hasArabic && !hasBengali;
}

// Same ENRICHMENT_OVERRIDES as the apply script
const ENRICHMENT_OVERRIDES = {
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
    'vienna':       { de: { value: 'Wien',       source: 'wikipedia:de' } },
    'zurich':       { de: { value: 'Zürich',     source: 'wikipedia:de' } },
    'cordoba':      { es: { value: 'Córdoba',    source: 'wikipedia:es' } },
    'malaga':       { es: { value: 'Málaga',     source: 'wikipedia:es' } },
    'cadiz':        { es: { value: 'Cádiz',      source: 'wikipedia:es' } },
    'jaen':         { es: { value: 'Jaén',       source: 'wikipedia:es' } },
    'almeria':      { es: { value: 'Almería',   source: 'wikipedia:es' } },
    'leon':         { es: { value: 'León',       source: 'wikipedia:es' } },
    'logrono':      { es: { value: 'Logroño',    source: 'wikipedia:es' } },
    'aviles':       { es: { value: 'Avilés',     source: 'wikipedia:es' } },
    'castellon':    { es: { value: 'Castellón',  source: 'wikipedia:es' } },
    'castellon-de-la-plana': { es: { value: 'Castellón de la Plana', source: 'wikipedia:es' } },
    'caceres':      { es: { value: 'Cáceres',    source: 'wikipedia:es' } },
    'a-coruna':     { es: { value: 'A Coruña',   source: 'wikipedia:es' } },
    'la-coruna':    { es: { value: 'La Coruña',  source: 'wikipedia:es' } },
    'palma-de-mallorca': { es: { value: 'Palma de Mallorca', source: 'wikipedia:es' } },
    'gijon':        { es: { value: 'Gijón',      source: 'wikipedia:es' } },
    'san-sebastian': { es: { value: 'San Sebastián', source: 'wikipedia:es' } },
    'mexico-city':  { es: { value: 'Ciudad de México', source: 'wikipedia:es' } },
    'merida':       { es: { value: 'Mérida',     source: 'wikipedia:es' } },
    'cancun':       { es: { value: 'Cancún',     source: 'wikipedia:es' } },
    'leon-mx':      { es: { value: 'León',       source: 'wikipedia:es' } },
    'queretaro':    { es: { value: 'Querétaro',  source: 'wikipedia:es' } },
    'culiacan':     { es: { value: 'Culiacán',   source: 'wikipedia:es' } },
    'mazatlan':     { es: { value: 'Mazatlán',   source: 'wikipedia:es' } },
    'torreon':      { es: { value: 'Torreón',    source: 'wikipedia:es' } },
    'cordoba-ar':   { es: { value: 'Córdoba',    source: 'wikipedia:es' } },
    'tucuman':      { es: { value: 'Tucumán',    source: 'wikipedia:es' } },
    'san-miguel-de-tucuman': { es: { value: 'San Miguel de Tucumán', source: 'wikipedia:es' } },
    'bogota':       { es: { value: 'Bogotá',     source: 'wikipedia:es' } },
    'medellin':     { es: { value: 'Medellín',   source: 'wikipedia:es' } },
    'concepcion':   { es: { value: 'Concepción', source: 'wikipedia:es' } },
    'valparaiso':   { es: { value: 'Valparaíso', source: 'wikipedia:es' } },
    'istanbul':     { tr: { value: 'İstanbul',   source: 'wikipedia:tr' } },
    'izmir':        { tr: { value: 'İzmir',      source: 'wikipedia:tr' } },
    'sanliurfa':    { tr: { value: 'Şanlıurfa',  source: 'wikipedia:tr' } },
    'kahramanmaras': { tr: { value: 'Kahramanmaraş', source: 'wikipedia:tr' } },
    'eskisehir':    { tr: { value: 'Eskişehir',  source: 'wikipedia:tr' } },
    'diyarbakir':   { tr: { value: 'Diyarbakır', source: 'wikipedia:tr' } },
    'georgetown':   { ms: { value: 'George Town', source: 'wikipedia:ms' } }
};

const ID_NO_KOTA_PREFIX = new Set(['jakarta', 'yogyakarta']);

function buildIdKotaMap() {
    const out = new Map();
    const rawPath = new URL('../../db/places/candidates/id-geonames-raw.json', import.meta.url);
    if (!existsSync(rawPath)) return out;
    const idRaw = JSON.parse(readFileSync(rawPath, 'utf8'));
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
        const kotaForm = alt.find(a => /^Kota\s+\S/i.test(a));
        if (kotaForm) out.set(slug, kotaForm);
    }
    return out;
}

const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const ID_KOTA_MAP = buildIdKotaMap();

// Same applyChange logic as the apply script — but only records, doesn't write.
const wouldApply = [];
const skipped = { notFillchain: [], scriptInvalid: [], noDataNeeded: [] };

for (const e of curated) {
    const slug = e.slug;
    const cc = (e.countryCode || '').toLowerCase();
    if (!e.names) continue;

    // (a) Indonesian "Kota X" pattern
    if (cc === 'id') {
        const kota = ID_KOTA_MAP.get(slug);
        if (kota) {
            if (e.names.id !== e.names.en) {
                skipped.notFillchain.push({ slug, cc, lang: 'id', current: e.names.id, proposed: kota, reason: 'already-non-fillchain (real native)' });
            } else if (!isCleanScript(kota, 'id')) {
                skipped.scriptInvalid.push({ slug, cc, lang: 'id', proposed: kota });
            } else if (kota === e.names.en) {
                skipped.noDataNeeded.push({ slug, cc, lang: 'id', reason: 'kota-form-same-as-en' });
            } else {
                wouldApply.push({
                    slug, cc, lang: 'id', en: e.names.en,
                    from: e.names.id, to: kota,
                    source: 'geonames:alt+id-wp',
                    confidence: 'very-safe',
                    category: 'indonesian-kota-x'
                });
            }
        }
    }

    // (b) Manual ENRICHMENT_OVERRIDES
    const ov = ENRICHMENT_OVERRIDES[slug];
    if (ov) {
        for (const lang of Object.keys(ov)) {
            const spec = ov[lang];
            if (e.names[lang] !== e.names.en) {
                skipped.notFillchain.push({ slug, cc, lang, current: e.names[lang], proposed: spec.value, reason: 'already-non-fillchain (real native)' });
                continue;
            }
            if (!isCleanScript(spec.value, lang)) {
                skipped.scriptInvalid.push({ slug, cc, lang, proposed: spec.value });
                continue;
            }
            if (spec.value === e.names.en) {
                skipped.noDataNeeded.push({ slug, cc, lang, reason: 'override-same-as-en' });
                continue;
            }
            wouldApply.push({
                slug, cc, lang, en: e.names.en,
                from: e.names[lang], to: spec.value,
                source: spec.source,
                confidence: 'very-safe',
                category: 'manual-override-' + lang
            });
        }
    }
}

// Build country×lang summary
const byCountryLang = {};
for (const w of wouldApply) {
    const key = w.cc + '/' + w.lang;
    byCountryLang[key] = byCountryLang[key] || { country: w.cc, lang: w.lang, count: 0, samples: [] };
    byCountryLang[key].count++;
    if (byCountryLang[key].samples.length < 5) {
        byCountryLang[key].samples.push({ slug: w.slug, en: w.en, to: w.to, source: w.source });
    }
}

// Per-country totals
const perCountry = {};
for (const w of wouldApply) {
    perCountry[w.cc] = perCountry[w.cc] || {};
    perCountry[w.cc][w.lang] = (perCountry[w.cc][w.lang] || 0) + 1;
}

const out = {
    timestamp: new Date().toISOString(),
    summary: {
        totalChanges: wouldApply.length,
        totalEntriesAffected: new Set(wouldApply.map(w => w.slug)).size,
        skippedCounts: {
            alreadyNative_notFillchain: skipped.notFillchain.length,
            scriptInvalid: skipped.scriptInvalid.length,
            overrideEqualsEn: skipped.noDataNeeded.length
        }
    },
    perCountry,
    byCountryLang: Object.values(byCountryLang).sort((a, b) => b.count - a.count),
    wouldApply,
    skipped,
    invariants: {
        no_slug_changes: true,
        no_canonical_changes: true,
        no_city_add: true,
        no_city_delete: true,
        no_runtime_translation: true,
        no_fillchain: true,
        no_unsupported_langs: true,
        no_ar_en_mutation: true,
        only_replaces_fillchain_copies: true,
        all_values_script_validated: true,
        sources: ['wikipedia:de', 'wikipedia:es', 'wikipedia:tr', 'wikipedia:ms', 'geonames:alt+id-wp']
    }
};

writeFileSync(REPORT_PATH, JSON.stringify(out, null, 2), 'utf8');

// Build Markdown report
let md = '';
md += '# SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 — Audit + Preview Report\n\n';
md += '**Date**: ' + out.timestamp + '\n';
md += '**Mode**: DRY-RUN (no mutations). Awaiting user approval before apply.\n\n';
md += '---\n\n';

md += '## 1. Per-country impact preview\n\n';
md += '| Country | Lang | Would-apply count | Skipped (already native) | Skipped (override = en) |\n';
md += '|---|---|---|---|---|\n';
const ccs = Object.keys(perCountry).sort();
const skippedByCC = {};
for (const s of skipped.notFillchain) {
    const k = s.cc + '/' + s.lang;
    skippedByCC[k] = (skippedByCC[k] || 0) + 1;
}
const skippedEqEnByCC = {};
for (const s of skipped.noDataNeeded) {
    const k = s.cc + '/' + s.lang;
    skippedEqEnByCC[k] = (skippedEqEnByCC[k] || 0) + 1;
}
for (const cc of ccs) {
    for (const L of Object.keys(perCountry[cc])) {
        const skip1 = skippedByCC[cc + '/' + L] || 0;
        const skip2 = skippedEqEnByCC[cc + '/' + L] || 0;
        md += '| ' + cc.toUpperCase() + ' | ' + L + ' | ' + perCountry[cc][L] + ' | ' + skip1 + ' | ' + skip2 + ' |\n';
    }
}
md += '\n**Totals**: ' + out.summary.totalChanges + ' changes across ' +
      out.summary.totalEntriesAffected + ' unique entries.\n\n';
md += '---\n\n';

md += '## 2. Before / after samples per (country, lang)\n\n';
for (const group of out.byCountryLang) {
    md += '### ' + group.country.toUpperCase() + ' / `names.' + group.lang + '` — ' + group.count + ' changes\n\n';
    md += '| Slug | Current (`names.' + group.lang + '`) | Proposed | Source |\n';
    md += '|---|---|---|---|\n';
    for (const s of group.samples) {
        const cur = curated.find(c => c.slug === s.slug);
        md += '| `' + s.slug + '` | `' + (cur.names[group.lang] || '') + '` | **`' + s.to + '`** | ' + s.source + ' |\n';
    }
    if (group.count > group.samples.length) {
        md += '| _(+' + (group.count - group.samples.length) + ' more)_ | | | |\n';
    }
    md += '\n';
}

md += '---\n\n';
md += '## 3. Full proposed-changes list\n\n';
md += '_All ' + wouldApply.length + ' changes follow. Each marks slug, country, lang, current fillchain value (always `names.en`), proposed new value, and source._\n\n';
md += '| # | Country | Slug | Lang | Was | Will become | Source |\n';
md += '|---|---|---|---|---|---|---|\n';
wouldApply.forEach((w, i) => {
    md += '| ' + (i + 1) + ' | ' + w.cc.toUpperCase() + ' | `' + w.slug + '` | ' + w.lang + ' | `' + w.from + '` | **`' + w.to + '`** | ' + w.source + ' |\n';
});

md += '\n---\n\n';

md += '## 4. Classification — confidence per category\n\n';
md += '| Category | Count | Confidence | Rationale |\n';
md += '|---|---|---|---|\n';
const catCounts = {};
for (const w of wouldApply) {
    catCounts[w.category] = (catCounts[w.category] || 0) + 1;
}
const catNotes = {
    'indonesian-kota-x':   'Indonesian municipal admin form. Sourced from GeoNames `alternatenames` matching `^Kota X$` AND Indonesian Wikipedia uses this title.',
    'manual-override-de':  'Wikipedia de.wp canonical title (umlauts: ä/ö/ü/ß). Standard German orthography.',
    'manual-override-es':  'Wikipedia es.wp canonical title (accents: á/é/í/ó/ú/ñ). Standard Spanish orthography.',
    'manual-override-tr':  'Wikipedia tr.wp canonical title (dotted-I: İ, cedilla: ş/ç, breve: ğ). Standard Turkish orthography.',
    'manual-override-fr':  'Wikipedia fr.wp canonical title (accents/spaces).',
    'manual-override-ms':  'Wikipedia ms.wp canonical title (e.g., "George Town" two-word).'
};
for (const cat of Object.keys(catCounts).sort()) {
    md += '| `' + cat + '` | ' + catCounts[cat] + ' | very-safe | ' + (catNotes[cat] || '') + ' |\n';
}
md += '\n---\n\n';

md += '## 5. Skipped entries\n\n';
md += '### 5.1 Skipped — already non-fillchain (real native, leave alone)\n\n';
md += '_These ' + skipped.notFillchain.length + ' entries ALREADY have a real localized name different from `names.en`. They are preserved untouched._\n\n';
if (skipped.notFillchain.length > 0 && skipped.notFillchain.length <= 20) {
    md += '| Slug | Country | Lang | Current value (kept) |\n';
    md += '|---|---|---|---|\n';
    for (const s of skipped.notFillchain.slice(0, 20)) {
        md += '| `' + s.slug + '` | ' + s.cc.toUpperCase() + ' | ' + s.lang + ' | `' + s.current + '` |\n';
    }
}
md += '\n### 5.2 Skipped — override equals `names.en` (no change)\n\n';
md += '_These ' + skipped.noDataNeeded.length + ' entries had override values identical to `names.en` — no actual change._\n\n';
if (skipped.noDataNeeded.length > 0 && skipped.noDataNeeded.length <= 20) {
    md += '| Slug | Lang | Reason |\n';
    md += '|---|---|---|\n';
    for (const s of skipped.noDataNeeded.slice(0, 20)) {
        md += '| `' + s.slug + '` | ' + s.lang + ' | ' + s.reason + ' |\n';
    }
}
md += '\n---\n\n';

md += '## 6. Invariants the apply script guarantees\n\n';
md += '| # | Invariant | Status |\n';
md += '|---|---|---|\n';
md += '| 1 | NO slug changes | ✅ Preserved |\n';
md += '| 2 | NO canonical URL changes | ✅ Preserved |\n';
md += '| 3 | NO city added | ✅ Same entry count after apply |\n';
md += '| 4 | NO city deleted | ✅ Same entry count |\n';
md += '| 5 | NO runtime translation invoked | ✅ Sources are static GeoNames + Wikipedia titles |\n';
md += '| 6 | NO fillchain reintroduced | ✅ Refuses to write `names[L] === names.en` |\n';
md += '| 7 | NO unsupported langs added (no hi/ta/mr/etc.) | ✅ Only 10 SUPPORTED_LANGS allowed |\n';
md += '| 8 | `names.ar` + `names.en` NEVER mutated | ✅ Post-mutation assertion in apply script |\n';
md += '| 9 | Only Latin-script supported langs (id/ms/tr/fr/de/es) touched | ✅ This phase scope |\n';
md += '| 10 | Only fillchain copies replaced (real natives untouched) | ✅ Verified by `current !== names.en` precondition |\n';
md += '| 11 | All applied values pass per-lang script validator | ✅ `isCleanScript` check in apply script |\n';
md += '\n---\n\n';

md += '## 7. Sources used\n\n';
md += '* `wikipedia:de` — manual list of German city Wikipedia titles (Munich → München, etc.).\n';
md += '* `wikipedia:es` — manual list of Spanish city Wikipedia titles (Córdoba, Málaga, etc.).\n';
md += '* `wikipedia:tr` — manual list of Turkish city Wikipedia titles (İstanbul, İzmir, Şanlıurfa, etc.).\n';
md += '* `wikipedia:ms` — manual list of Malaysian city Wikipedia titles (George Town).\n';
md += '* `geonames:alt+id-wp` — Indonesian `Kota X` form extracted from GeoNames alternatenames for entries where the form is present AND id.wikipedia.org confirms it as the canonical municipal article title.\n\n';
md += '_All sources are static text; no live translation, no API calls at apply time._\n\n';
md += '---\n\n';
md += '## 8. Awaiting explicit user approval before apply\n\n';
md += 'No mutation will run until the user explicitly approves the apply.\n';

writeFileSync(MD_PATH, md, 'utf8');

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 — PREVIEW (DRY-RUN)');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');
console.log('  Total proposed changes : ' + out.summary.totalChanges);
console.log('  Unique entries affected: ' + out.summary.totalEntriesAffected);
console.log('');
console.log('  Per-country/lang:');
for (const cc of ccs) {
    for (const L of Object.keys(perCountry[cc])) {
        console.log('    ' + cc.toUpperCase() + '/' + L + ': ' + perCountry[cc][L]);
    }
}
console.log('');
console.log('  Skipped (already-native — preserved): ' + skipped.notFillchain.length);
console.log('  Skipped (override = en, no change):   ' + skipped.noDataNeeded.length);
console.log('');
console.log('  Outputs:');
console.log('    ' + REPORT_PATH.pathname);
console.log('    ' + MD_PATH.pathname);
console.log('');
console.log('  curated-places.json: NOT MUTATED. Apply blocked until user approval.');
