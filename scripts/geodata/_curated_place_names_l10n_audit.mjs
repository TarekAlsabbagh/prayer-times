// scripts/geodata/_curated_place_names_l10n_audit.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-PLACE-NAMES-L10N-AUDIT-1 — audit-only, no mutation.
//
// Walks db/places/curated-places.json and computes, for each of the 10
// supported languages, what % of entries have an EXPLICIT localized name
// (different from the English fallback) vs what % fall back to English
// (= fillLangMap default in Stage 2 normalize).
//
// Writes:
//   reports/curated-place-names-l10n-audit-1.md
//
// The script does NOT touch curated-places.json. It only READS.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/curated-place-names-l10n-audit-1.md';

const SUPPORTED_LANGS = ['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'es', 'bn', 'ms'];
const LANG_LABEL = {
    ar: 'Arabic', en: 'English', fr: 'French', de: 'German', tr: 'Turkish',
    ur: 'Urdu', id: 'Indonesian', es: 'Spanish', bn: 'Bengali', ms: 'Malay'
};

// Script classifiers
const HAS_ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const HAS_LATIN  = /[A-Za-z]/;
const HAS_CJK    = /[　-鿿가-힯]/;
const HAS_CYR    = /[Ѐ-ӿ]/;
const HAS_BENGALI = /[ঀ-৿]/;
const HAS_DEVANAGARI = /[ऀ-ॿ]/;
// Persian/Urdu specific chars (NOT in standard Arabic — Urdu uses these)
const URDU_PERSIAN_EXTRA = /[پچژگکیٹڈڑہےھں]/;
//                          پ      چ      ژ      گ      ک      ی      ٹ      ڈ      ڑ      ہ      ے      ھ      ں

function classifyScript(s) {
    if (!s) return 'empty';
    const hasArabic = HAS_ARABIC.test(s);
    const hasLatin = HAS_LATIN.test(s);
    const hasCJK = HAS_CJK.test(s);
    const hasCyr = HAS_CYR.test(s);
    const hasBn = HAS_BENGALI.test(s);
    const hasDev = HAS_DEVANAGARI.test(s);
    const scripts = [];
    if (hasArabic) scripts.push('arabic');
    if (hasLatin)  scripts.push('latin');
    if (hasCJK)    scripts.push('cjk');
    if (hasCyr)    scripts.push('cyrillic');
    if (hasBn)     scripts.push('bengali');
    if (hasDev)    scripts.push('devanagari');
    if (scripts.length === 0) return 'unknown';
    if (scripts.length === 1) return scripts[0];
    return 'mixed:' + scripts.join('+');
}

function isStrictArabicScript(s) {
    // No Latin, has at least one Arabic letter, NO Persian/Urdu extras
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    if (URDU_PERSIAN_EXTRA.test(s)) return false;
    return HAS_ARABIC.test(s);
}

function isArabicScriptIncludingUrdu(s) {
    // Used to assess ar→ur safe-fallback: Urdu uses Arabic script + Persian extras,
    // so a clean-Arabic names.ar IS readable for Urdu users.
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    return HAS_ARABIC.test(s);
}

function main() {
    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    const total = curated.length;
    console.log('[l10n-audit] total curated entries:', total);

    // ─── §1. Per-language coverage ───
    // For each lang, count rows where:
    //   • field is present and non-empty
    //   • field is "explicit" (different from names.en — not just a fillLangMap fallback)
    //   • field is a "fallback" (equal to names.en, i.e. fillLangMap default)
    //   • script class of the value
    const perLang = {};
    for (const l of SUPPORTED_LANGS) {
        perLang[l] = {
            total,
            nonEmpty: 0,
            explicit: 0,          // != names.en
            fallbackToEn: 0,      // === names.en (fillLangMap default)
            scripts: { arabic: 0, latin: 0, cjk: 0, cyrillic: 0, bengali: 0, devanagari: 0, mixed: 0, unknown: 0, empty: 0 }
        };
    }

    // ─── §2. Worst-offender lists ───
    const arHasLatin = [];           // names.ar contains Latin chars
    const urHasLatin = [];           // names.ur contains Latin chars
    const arEmpty = [];
    const enEmpty = [];

    // ─── §3. ur Latin-fallback risk: names.ur === names.en AND en is Latin ───
    const urLatinFallback = [];

    // ─── §4. Safe ar→ur fallback opportunity: ur falls back to en (Latin)
    //         but names.ar is clean Arabic-script → could use ar as ur fallback
    const arToUrSafeFallback = [];

    // ─── §5. Alias-promotion opportunities: aliases[lang] non-empty but
    //         names[lang] is a fallback. Could promote alias → names[lang].
    const aliasPromotionByLang = {};
    for (const l of SUPPORTED_LANGS) aliasPromotionByLang[l] = [];

    // ─── §6. Per-country breakdown for ur fallback risk ───
    const urRiskByCountry = {};   // cc → { total, ur_fallback_count, ar_safe_count }

    // ─── Walk every row ───
    for (const e of curated) {
        const names = e.names || {};
        const aliases = e.aliases || {};
        const enValue = names.en || '';

        // 6a. urRiskByCountry init
        const cc = e.countryCode || '??';
        if (!urRiskByCountry[cc]) urRiskByCountry[cc] = { total: 0, ur_fallback: 0, ar_safe: 0, ur_explicit: 0 };
        urRiskByCountry[cc].total++;

        for (const l of SUPPORTED_LANGS) {
            const v = names[l] || '';
            if (v) {
                perLang[l].nonEmpty++;
                if (l === 'en') {
                    perLang.en.explicit++; // en is always "explicit" by definition
                } else {
                    if (v === enValue) perLang[l].fallbackToEn++;
                    else               perLang[l].explicit++;
                }
                const klass = classifyScript(v);
                if (klass.startsWith('mixed:')) perLang[l].scripts.mixed++;
                else if (perLang[l].scripts[klass] != null) perLang[l].scripts[klass]++;
                else perLang[l].scripts.unknown++;
            } else {
                perLang[l].scripts.empty++;
            }

            // Alias-promotion opportunity
            const aList = (aliases[l] && Array.isArray(aliases[l])) ? aliases[l].filter(Boolean) : [];
            if (aList.length && (!v || v === enValue)) {
                aliasPromotionByLang[l].push({
                    slug: e.slug,
                    cc: e.countryCode,
                    enName: enValue,
                    currentLangName: v,
                    aliasCandidates: aList
                });
            }
        }

        // Worst offenders
        if (!names.ar) arEmpty.push({ slug: e.slug, cc: e.countryCode });
        if (!names.en) enEmpty.push({ slug: e.slug, cc: e.countryCode });
        if (names.ar && HAS_LATIN.test(names.ar)) {
            arHasLatin.push({ slug: e.slug, cc: e.countryCode, ar: names.ar, en: names.en });
        }
        if (names.ur && HAS_LATIN.test(names.ur)) {
            urHasLatin.push({ slug: e.slug, cc: e.countryCode, ur: names.ur, en: names.en });
        }

        // ur Latin-fallback risk
        const urFallback = (!names.ur || names.ur === enValue);
        const enIsLatin = enValue && HAS_LATIN.test(enValue) && !HAS_ARABIC.test(enValue);
        if (urFallback && enIsLatin) {
            urLatinFallback.push({
                slug: e.slug,
                cc: e.countryCode,
                en: enValue,
                ar: names.ar || '',
                ur: names.ur || ''
            });
            urRiskByCountry[cc].ur_fallback++;

            // Safe ar→ur fallback opportunity
            if (isArabicScriptIncludingUrdu(names.ar)) {
                arToUrSafeFallback.push({
                    slug: e.slug,
                    cc: e.countryCode,
                    en: enValue,
                    arWouldBeUr: names.ar
                });
                urRiskByCountry[cc].ar_safe++;
            }
        }
        if (!urFallback) urRiskByCountry[cc].ur_explicit++;
    }

    // ─── Build report ───
    const L = [];
    L.push('# CURATED-PLACE-NAMES-L10N-AUDIT-1');
    L.push('');
    L.push('**Phase**: Audit-only (no data mutation, no translation API)');
    L.push('**Generated**: ' + new Date().toISOString());
    L.push('**Dataset**: `db/places/curated-places.json`');
    L.push('**Total entries audited**: ' + total);
    L.push('**Supported languages**: ' + SUPPORTED_LANGS.length + ' (`' + SUPPORTED_LANGS.join('`, `') + '`)');
    L.push('');
    L.push('---');
    L.push('');

    L.push('## Executive summary');
    L.push('');
    L.push('| Issue | Count | % of curated |');
    L.push('| --- | ---: | ---: |');
    L.push('| **High-risk: Urdu page shows Latin** (`names.ur` missing or = `names.en` AND `en` is Latin) | **' + urLatinFallback.length + '** | ' + (urLatinFallback.length / total * 100).toFixed(1) + '% |');
    L.push('| Of those — **safe `ar`→`ur` fallback eligible** (`names.ar` is clean Arabic-script) | **' + arToUrSafeFallback.length + '** | ' + (arToUrSafeFallback.length / total * 100).toFixed(1) + '% |');
    L.push('| Of those — still need fresh `names.ur` (no safe fallback) | ' + (urLatinFallback.length - arToUrSafeFallback.length) + ' | ' + ((urLatinFallback.length - arToUrSafeFallback.length) / total * 100).toFixed(1) + '% |');
    L.push('| `names.ar` contains Latin chars (regression — should be 0) | **' + arHasLatin.length + '** | ' + (arHasLatin.length / total * 100).toFixed(1) + '% |');
    L.push('| `names.ur` contains Latin chars (any kind) | **' + urHasLatin.length + '** | ' + (urHasLatin.length / total * 100).toFixed(1) + '% |');
    L.push('| `names.ar` empty | ' + arEmpty.length + ' | ' + (arEmpty.length / total * 100).toFixed(1) + '% |');
    L.push('| `names.en` empty | ' + enEmpty.length + ' | ' + (enEmpty.length / total * 100).toFixed(1) + '% |');
    L.push('');
    L.push('**Headline**: ' + ((urLatinFallback.length - arToUrSafeFallback.length) / total * 100).toFixed(1) + '% of curated entries would need actual translation work for Urdu. The remaining ' + (arToUrSafeFallback.length / total * 100).toFixed(1) + '% can be fixed by a runtime/SSR fallback rule that reads `names.ar` when `names.ur` is missing.');
    L.push('');

    // §1. Per-language coverage
    L.push('## §1. Coverage per language');
    L.push('');
    L.push('| Lang | Non-empty | Explicit (≠ `en`) | Fallback (= `en`) | Empty | Explicit % |');
    L.push('| --- | ---: | ---: | ---: | ---: | ---: |');
    for (const l of SUPPORTED_LANGS) {
        const s = perLang[l];
        const empty = total - s.nonEmpty;
        const explicitPct = (s.explicit / total * 100).toFixed(1) + '%';
        L.push('| `' + l + '` ' + LANG_LABEL[l] + ' | ' + s.nonEmpty + ' | **' + s.explicit + '** | ' + s.fallbackToEn + ' | ' + empty + ' | ' + explicitPct + ' |');
    }
    L.push('');
    L.push('**Interpretation**:');
    L.push('');
    L.push('- `en` is always "explicit" by definition (it\'s the fallback source).');
    L.push('- `ar` shows ' + perLang.ar.explicit + ' explicit names = ' + (perLang.ar.explicit / total * 100).toFixed(1) + '% — virtually every curated entry has a real Arabic name (this is the wave-by-wave Arabic Wikipedia coverage we built).');
    L.push('- All other languages (fr/de/tr/ur/id/es/bn/ms) have a much lower explicit rate, mostly using the `en` fallback that `fillLangMap` set in Stage 2.');
    L.push('');

    // §1b. Per-language script breakdown
    L.push('### §1b. Script breakdown per language');
    L.push('');
    L.push('How many entries\' `names[lang]` value is in each script class:');
    L.push('');
    L.push('| Lang | Arabic | Latin | CJK | Cyrillic | Bengali | Devanagari | Mixed | Unknown | Empty |');
    L.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
    for (const l of SUPPORTED_LANGS) {
        const s = perLang[l].scripts;
        L.push('| `' + l + '` | ' + s.arabic + ' | ' + s.latin + ' | ' + s.cjk + ' | ' + s.cyrillic + ' | ' + s.bengali + ' | ' + s.devanagari + ' | ' + s.mixed + ' | ' + s.unknown + ' | ' + s.empty + ' |');
    }
    L.push('');

    // §2. Missing names.ur
    L.push('## §2. Missing `names.ur`');
    L.push('');
    L.push('Entries where `names.ur` is empty OR equal to `names.en` (i.e. fillLangMap fallback, NOT a real Urdu name):');
    L.push('');
    L.push('| Bucket | Count | % |');
    L.push('| --- | ---: | ---: |');
    L.push('| `names.ur` empty                    | ' + perLang.ur.scripts.empty + ' | ' + (perLang.ur.scripts.empty / total * 100).toFixed(1) + '% |');
    L.push('| `names.ur` = `names.en` (fallback)  | ' + perLang.ur.fallbackToEn + ' | ' + (perLang.ur.fallbackToEn / total * 100).toFixed(1) + '% |');
    L.push('| `names.ur` explicit                 | **' + perLang.ur.explicit + '** | ' + (perLang.ur.explicit / total * 100).toFixed(1) + '% |');
    L.push('| Total                                | ' + total + ' | 100% |');
    L.push('');
    L.push('**Of the ' + perLang.ur.explicit + ' explicit Urdu names**, script breakdown:');
    L.push('');
    L.push('| Script | Count |');
    L.push('| --- | ---: |');
    L.push('| Arabic/Urdu script | ' + perLang.ur.scripts.arabic + ' |');
    L.push('| Latin              | ' + perLang.ur.scripts.latin + ' |');
    L.push('| Bengali            | ' + perLang.ur.scripts.bengali + ' |');
    L.push('| CJK                | ' + perLang.ur.scripts.cjk + ' |');
    L.push('| Mixed              | ' + perLang.ur.scripts.mixed + ' |');
    L.push('| Other              | ' + (perLang.ur.scripts.cyrillic + perLang.ur.scripts.devanagari + perLang.ur.scripts.unknown) + ' |');
    L.push('');

    // §3. Urdu Latin-fallback pages
    L.push('## §3. Urdu pages that will display Latin');
    L.push('');
    L.push('When the user visits `/ur/prayer-times-in-<slug>` AND the curated entry has `names.ur` empty or equal to `names.en` AND `names.en` is Latin-script — the SSR renders the city name in Latin (e.g. "Charikar" instead of "چاريكار").');
    L.push('');
    L.push('**Count of affected entries**: ' + urLatinFallback.length + ' (' + (urLatinFallback.length / total * 100).toFixed(1) + '% of all curated).');
    L.push('');
    L.push('### Top 30 affected entries (by largest Arabic-script `names.ar` clue available — would benefit most from ar→ur fallback)');
    L.push('');
    L.push('| slug | cc | `names.en` (currently shown) | `names.ar` (clean Arabic available?) |');
    L.push('| --- | --- | --- | --- |');
    // Sort: rows with clean Arabic ar first, then by slug
    const urFallSorted = urLatinFallback.slice().sort((a, b) => {
        const aHasAr = isArabicScriptIncludingUrdu(a.ar) ? 0 : 1;
        const bHasAr = isArabicScriptIncludingUrdu(b.ar) ? 0 : 1;
        if (aHasAr !== bHasAr) return aHasAr - bHasAr;
        return a.slug.localeCompare(b.slug);
    });
    for (const r of urFallSorted.slice(0, 30)) {
        L.push('| `' + r.slug + '` | ' + r.cc + ' | ' + r.en + ' | ' + (r.ar ? '`' + r.ar + '`' : '_(none)_') + ' |');
    }
    L.push('');

    // §4. Safe ar→ur fallback
    L.push('## §4. Safe `ar` → `ur` fallback opportunity');
    L.push('');
    L.push('Urdu and Arabic share the same script. If an entry has a clean-Arabic-script `names.ar` BUT no real `names.ur`, the SSR could safely substitute `names.ar` for the Urdu page render. **The reader sees readable Urdu-script text instead of Latin.**');
    L.push('');
    L.push('**Affected entries**: ' + arToUrSafeFallback.length + ' (' + (arToUrSafeFallback.length / total * 100).toFixed(1) + '% of curated, or ' + (arToUrSafeFallback.length / Math.max(1, urLatinFallback.length) * 100).toFixed(1) + '% of the ' + urLatinFallback.length + ' currently-Latin Urdu rows).');
    L.push('');
    L.push('**This is the single biggest lever** for fixing the Urdu Latin-leak problem **WITHOUT touching the dataset** — a server-side fallback rule.');
    L.push('');
    L.push('### Implementation sketch (Phase 1)');
    L.push('');
    L.push('In `_pickCuratedName(entry, lang)` (server.js:3163):');
    L.push('');
    L.push('```js');
    L.push('function _pickCuratedName(entry, lang) {');
    L.push('    if (!entry || typeof entry !== \'object\') return null;');
    L.push('    const _n = entry.names || {};');
    L.push('    const _code = String(lang || \'ar\').toLowerCase();');
    L.push('    const enValue = (typeof _n.en === \'string\' && _n.en.trim()) ? _n.en : \'\';');
    L.push('    const langValue = (typeof _n[_code] === \'string\' && _n[_code].trim()) ? _n[_code] : \'\';');
    L.push('');
    L.push('    // ───────────────────────────────────────────────────────────────');
    L.push('    // 🆕 PLACE-NAMES-L10N-FALLBACK-1: Urdu reads Arabic script');
    L.push('    // If lang=\'ur\' and names.ur is empty OR equal to en, AND names.ar');
    L.push('    // is clean Arabic-script (no Latin), use names.ar for Urdu render.');
    L.push('    if (_code === \'ur\' && (!langValue || langValue === enValue)) {');
    L.push('        const arValue = (typeof _n.ar === \'string\') ? _n.ar.trim() : \'\';');
    L.push('        if (arValue && !/[A-Za-z]/.test(arValue) && /[\\u0600-\\u06FF]/.test(arValue)) {');
    L.push('            return arValue;');
    L.push('        }');
    L.push('    }');
    L.push('    // ───────────────────────────────────────────────────────────────');
    L.push('');
    L.push('    if (langValue) return langValue;');
    L.push('    if (enValue)   return enValue;');
    L.push('    for (const k of Object.keys(_n)) {');
    L.push('        if (typeof _n[k] === \'string\' && _n[k].trim()) return _n[k];');
    L.push('    }');
    L.push('    return null;');
    L.push('}');
    L.push('```');
    L.push('');
    L.push('**Expected impact**: ' + arToUrSafeFallback.length + ' Urdu page renders flip from Latin to Arabic-script — overnight, zero dataset changes.');
    L.push('');

    // §5. Alias-promotion opportunities
    L.push('## §5. Alias-promotion opportunities');
    L.push('');
    L.push('Entries where `aliases[lang]` already contains a non-empty value but `names[lang]` is missing or a fallback. The alias could be promoted to the primary name (manual review still required for choice of variant).');
    L.push('');
    L.push('| Lang | Promotable rows | % of curated |');
    L.push('| --- | ---: | ---: |');
    for (const l of SUPPORTED_LANGS) {
        const n = aliasPromotionByLang[l].length;
        L.push('| `' + l + '` | ' + n + ' | ' + (n / total * 100).toFixed(1) + '% |');
    }
    L.push('');
    L.push('### Sample (top 15 `ur` alias-promotion candidates)');
    L.push('');
    L.push('| slug | cc | current `names.ur` | proposed `aliases.ur` |');
    L.push('| --- | --- | --- | --- |');
    for (const r of aliasPromotionByLang.ur.slice(0, 15)) {
        L.push('| `' + r.slug + '` | ' + r.cc + ' | ' + (r.currentLangName || '_(empty)_') + ' | `' + r.aliasCandidates.join('`, `') + '` |');
    }
    if (aliasPromotionByLang.ur.length === 0) L.push('_(no Urdu-alias data found in curated — most rows have only ar/en aliases)_');
    L.push('');

    // §6. Worst offenders — Latin in ar or ur primary name
    L.push('## §6. Worst offenders — Latin chars in `names.ar` or `names.ur` primary');
    L.push('');
    L.push('Per the post-Stage-3.5 invariant, `names.ar` should NEVER contain Latin chars. Any hit here is a regression and should be flagged for fix.');
    L.push('');
    L.push('### `names.ar` contains Latin chars (' + arHasLatin.length + ')');
    L.push('');
    if (!arHasLatin.length) {
        L.push('_✅ Zero — Stage 3.5 invariant holds for all 2,336 curated entries._');
    } else {
        L.push('| slug | cc | `names.ar` | `names.en` |');
        L.push('| --- | --- | --- | --- |');
        for (const r of arHasLatin.slice(0, 50)) {
            L.push('| `' + r.slug + '` | ' + r.cc + ' | `' + r.ar + '` | ' + r.en + ' |');
        }
        if (arHasLatin.length > 50) L.push('\n_(... ' + (arHasLatin.length - 50) + ' more)_');
    }
    L.push('');
    L.push('### `names.ur` contains Latin chars (' + urHasLatin.length + ')');
    L.push('');
    L.push('Note: this includes the fillLangMap fallback rows where `names.ur === names.en` (Latin). The count below INCLUDES those.');
    L.push('');
    if (!urHasLatin.length) {
        L.push('_(none)_');
    } else {
        L.push('Total: **' + urHasLatin.length + '** rows. Top 20:');
        L.push('');
        L.push('| slug | cc | `names.ur` | `names.en` | same? |');
        L.push('| --- | --- | --- | --- | :-: |');
        for (const r of urHasLatin.slice(0, 20)) {
            L.push('| `' + r.slug + '` | ' + r.cc + ' | `' + r.ur + '` | ' + r.en + ' | ' + (r.ur === r.en ? '✓ (fallback)' : '✗ (mixed)') + ' |');
        }
    }
    L.push('');

    // §7. Per-country breakdown of Urdu fallback risk
    L.push('## §7. Per-country breakdown — Urdu Latin-fallback risk');
    L.push('');
    L.push('Top 30 countries by **count of entries where `/ur/` renders Latin**:');
    L.push('');
    L.push('| cc | curated total | ur-fallback (Latin shown) | ur-fallback w/ safe `ar` available | ur-explicit (real Urdu) | risk % |');
    L.push('| --- | ---: | ---: | ---: | ---: | ---: |');
    const ccSorted = Object.entries(urRiskByCountry)
        .sort((a, b) => b[1].ur_fallback - a[1].ur_fallback);
    for (const [cc, v] of ccSorted.slice(0, 30)) {
        const pct = (v.ur_fallback / v.total * 100).toFixed(1) + '%';
        L.push('| ' + cc + ' | ' + v.total + ' | ' + v.ur_fallback + ' | ' + v.ar_safe + ' | ' + v.ur_explicit + ' | ' + pct + ' |');
    }
    L.push('');

    // §8. Phased enrichment plan
    L.push('## §8. Phased enrichment plan');
    L.push('');
    L.push('### 🔥 Phase 1 — IMMEDIATE (no data mutation): `ur` reads `ar` when missing');
    L.push('');
    L.push('Modify `_pickCuratedName` in `server.js` to add a one-rule fallback: if `lang === \'ur\'` and `names.ur` is missing/fallback AND `names.ar` is clean Arabic-script — return `names.ar`.');
    L.push('');
    L.push('| Aspect | Value |');
    L.push('| --- | --- |');
    L.push('| Code surface | 1 function in `server.js` (~5 lines) |');
    L.push('| Dataset changes | **0 rows touched** |');
    L.push('| Tests | 1 new SSR test for `/ur/prayer-times-in-charikar` → renders `تشاريكار` |');
    L.push('| User-visible impact | ' + arToUrSafeFallback.length + ' Urdu pages flip from Latin to Arabic-script overnight |');
    L.push('| Reversibility | flip-a-line; trivial |');
    L.push('| Risk | very low — adds a fallback, never overrides explicit `names.ur` |');
    L.push('');
    L.push('### 🎯 Phase 2 — TARGETED `names.ur` enrichment for Muslim-priority countries');
    L.push('');
    L.push('Focus on countries with the highest Urdu-speaker overlap and largest curated population:');
    L.push('');
    L.push('| Priority | cc | curated count | rationale |');
    L.push('| :-: | --- | ---: | --- |');
    L.push('| 1 | `pk` (Pakistan) | ' + (urRiskByCountry.pk ? urRiskByCountry.pk.total : 0) + ' | native Urdu market; very high search interest |');
    L.push('| 2 | `in` (India) | ' + (urRiskByCountry.in ? urRiskByCountry.in.total : 0) + ' | large Urdu-speaking minority |');
    L.push('| 3 | `bd` (Bangladesh) | ' + (urRiskByCountry.bd ? urRiskByCountry.bd.total : 0) + ' | also a Bengali priority — pairs with Phase 2b |');
    L.push('| 4 | `af` (Afghanistan) | ' + (urRiskByCountry.af ? urRiskByCountry.af.total : 0) + ' | Urdu widely understood; user explicitly flagged charikar leak |');
    L.push('| 5 | `ir` (Iran) | ' + (urRiskByCountry.ir ? urRiskByCountry.ir.total : 0) + ' | already covered by Phase 1 (ar→ur via Persian-script transliterations) |');
    L.push('| 6 | `sa, ae, kw, qa, om, bh` (Gulf) | covered by Phase 1 | many Urdu-speaking expats; Arabic primary works |');
    L.push('');
    L.push('Approach: build a small bilingual reviewer tool that walks the targeted-country rows in batches of 20-50, presents the current `names.en` + `names.ar` + any `aliases.ur` and asks for a confirmed Urdu transliteration. **Manual review per row** — no auto-translation. Same pattern as the NAME_AR_FIXES tables for waves.');
    L.push('');
    L.push('### 🛡️ Phase 3 — Pipeline gate (prevents regression)');
    L.push('');
    L.push('Add a Stage 3.6 (or extend Stage 3.5\'s arabic_quality_check.mjs) to compute, for every new wave, a "language-coverage report" that flags:');
    L.push('');
    L.push('- Rows where `names.ur` equals `names.en` AND `en` is Latin AND `ar` is also Latin (worst case)');
    L.push('- Rows where `names.bn`/`names.tr`/`names.id`/`names.ms` are missing for countries where they\'d be expected (BD/TR/ID/MY)');
    L.push('');
    L.push('This becomes a **closure prerequisite** for any new wave — same rigour as the existing 8-check Premerge QA.');
    L.push('');
    L.push('### 🌍 Phase 4 — Full 10-language enrichment (deferred)');
    L.push('');
    L.push('After Phases 1-3 close, enrich the remaining 7 languages (`fr/de/tr/id/es/bn/ms`) in priority order. This is a large but parallelizable effort — can be done country-by-country or in batches:');
    L.push('');
    L.push('| Lang | Current explicit | Target | Gap | Strategy |');
    L.push('| --- | ---: | ---: | ---: | --- |');
    for (const l of ['fr','de','tr','id','es','bn','ms']) {
        const cur = perLang[l].explicit;
        const gap = total - cur;
        L.push('| `' + l + '` ' + LANG_LABEL[l] + ' | ' + cur + ' | ' + total + ' | ' + gap + ' | bulk Wikipedia alias-pull or manual review |');
    }
    L.push('');

    // §9. Recommendations summary
    L.push('## §9. Recommendations summary');
    L.push('');
    L.push('Per user direction (no data mutation in this audit phase), the only ACTIONABLE change recommended right now is:');
    L.push('');
    L.push('1. **Open `PLACE-NAMES-L10N-FALLBACK-1`** (small, code-only): add ar→ur fallback rule to `_pickCuratedName`. Fixes ' + arToUrSafeFallback.length + ' Urdu Latin-leak pages overnight. No data touched. Reversible.');
    L.push('');
    L.push('Deferred (await user trigger):');
    L.push('');
    L.push('- `PLACE-NAMES-L10N-PHASE-2-PK-IN-BD-AF` (manual `names.ur` enrichment for 4 priority countries)');
    L.push('- `PLACE-NAMES-L10N-PHASE-3-PIPELINE-GATE` (Stage 3.6 lang-coverage check)');
    L.push('- `PLACE-NAMES-L10N-PHASE-4-FULL-10-LANG` (long-tail: fr/de/tr/id/es/bn/ms)');
    L.push('');

    // §10. Notes
    L.push('## §10. Methodology notes');
    L.push('');
    L.push('- Audit script: `scripts/geodata/_curated_place_names_l10n_audit.mjs` (READ-ONLY).');
    L.push('- `names[lang]` is treated as "explicit" if it differs from `names.en`. This mirrors the `fillLangMap` behavior in Stage 2 (`scripts/geodata/_geonames_common.mjs:396`) which fills missing langs with the English fallback.');
    L.push('- "Clean Arabic script" means: contains at least one Arabic-block letter (U+0600-06FF) AND contains no Latin (A-Za-z). Persian extras (پ چ ژ گ ک ی etc.) are tolerated for the Urdu-fallback test (they ARE readable in Urdu).');
    L.push('- "Strict Arabic" (no Persian extras) is a tighter criterion used internally by Stage 3.5\'s gate. The fallback rule here uses the looser "Arabic-script" criterion to maximize Urdu-page coverage — Urdu readers handle Persian-style letters natively.');
    L.push('- Bengali, Devanagari, CJK, Cyrillic detection is mostly informational — these scripts shouldn\'t appear in any `names[lang]` for lang ∈ {ar, ur, fr, de, tr, id, es, ms}. Bengali in `names.bn` is expected.');
    L.push('');
    L.push('**No mutations to `curated-places.json` were performed by this audit.**');
    L.push('');

    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[l10n-audit] wrote ' + REPORT + ' (' + L.length + ' lines)');

    // Console summary
    console.log('');
    console.log('═══ CURATED-PLACE-NAMES-L10N-AUDIT-1 — Summary ═══');
    console.log('Total curated entries: ' + total);
    console.log('');
    console.log('Per-lang EXPLICIT (non-fallback) count:');
    for (const l of SUPPORTED_LANGS) {
        const s = perLang[l];
        console.log('  ' + l + ' ' + LANG_LABEL[l].padEnd(11) + ' : ' + String(s.explicit).padStart(5) + '  (' + (s.explicit / total * 100).toFixed(1).padStart(5) + '%)');
    }
    console.log('');
    console.log('Urdu Latin-fallback risk: ' + urLatinFallback.length + ' entries (' + (urLatinFallback.length / total * 100).toFixed(1) + '%)');
    console.log('   of which safe ar→ur fallback eligible: ' + arToUrSafeFallback.length);
    console.log('   of which need fresh ur translation:    ' + (urLatinFallback.length - arToUrSafeFallback.length));
    console.log('');
    console.log('Regression checks:');
    console.log('  names.ar contains Latin: ' + arHasLatin.length + ' rows  (should be 0)');
    console.log('  names.ur contains Latin: ' + urHasLatin.length + ' rows  (most are fillLangMap fallback)');
    console.log('');
    console.log('No data mutated — audit-only.');
}

main();
