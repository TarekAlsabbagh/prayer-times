# CURATED-PLACE-NAMES-L10N-AUDIT-1

**Phase**: Audit-only (no data mutation, no translation API)
**Generated**: 2026-05-18T06:37:57.204Z
**Dataset**: `db/places/curated-places.json`
**Total entries audited**: 2336
**Supported languages**: 10 (`ar`, `en`, `fr`, `de`, `tr`, `ur`, `id`, `es`, `bn`, `ms`)

---

## Executive summary

| Issue | Count | % of curated |
| --- | ---: | ---: |
| **High-risk: Urdu page shows Latin** (`names.ur` missing or = `names.en` AND `en` is Latin) | **1755** | 75.1% |
| Of those — **safe `ar`→`ur` fallback eligible** (`names.ar` is clean Arabic-script) | **1748** | 74.8% |
| Of those — still need fresh `names.ur` (no safe fallback) | 7 | 0.3% |
| `names.ar` contains Latin chars (regression — should be 0) | **7** | 0.3% |
| `names.ur` contains Latin chars (any kind) | **1755** | 75.1% |
| `names.ar` empty | 0 | 0.0% |
| `names.en` empty | 0 | 0.0% |

**Headline**: 0.3% of curated entries would need actual translation work for Urdu. The remaining 74.8% can be fixed by a runtime/SSR fallback rule that reads `names.ar` when `names.ur` is missing.

## §1. Coverage per language

| Lang | Non-empty | Explicit (≠ `en`) | Fallback (= `en`) | Empty | Explicit % |
| --- | ---: | ---: | ---: | ---: | ---: |
| `ar` Arabic | 2336 | **2336** | 0 | 0 | 100.0% |
| `en` English | 2336 | **2336** | 0 | 0 | 100.0% |
| `fr` French | 2336 | **220** | 2116 | 0 | 9.4% |
| `de` German | 2336 | **259** | 2077 | 0 | 11.1% |
| `tr` Turkish | 2336 | **344** | 1992 | 0 | 14.7% |
| `ur` Urdu | 2336 | **581** | 1755 | 0 | 24.9% |
| `id` Indonesian | 2336 | **42** | 2294 | 0 | 1.8% |
| `es` Spanish | 2336 | **217** | 2119 | 0 | 9.3% |
| `bn` Bengali | 2336 | **581** | 1755 | 0 | 24.9% |
| `ms` Malay | 2336 | **14** | 2322 | 0 | 0.6% |

**Interpretation**:

- `en` is always "explicit" by definition (it's the fallback source).
- `ar` shows 2336 explicit names = 100.0% — virtually every curated entry has a real Arabic name (this is the wave-by-wave Arabic Wikipedia coverage we built).
- All other languages (fr/de/tr/ur/id/es/bn/ms) have a much lower explicit rate, mostly using the `en` fallback that `fillLangMap` set in Stage 2.

### §1b. Script breakdown per language

How many entries' `names[lang]` value is in each script class:

| Lang | Arabic | Latin | CJK | Cyrillic | Bengali | Devanagari | Mixed | Unknown | Empty |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `ar` | 2329 | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 |
| `en` | 0 | 2336 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `fr` | 0 | 2336 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `de` | 0 | 2336 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `tr` | 0 | 2336 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `ur` | 581 | 1755 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `id` | 0 | 2336 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `es` | 0 | 2336 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `bn` | 0 | 1755 | 0 | 0 | 581 | 0 | 0 | 0 | 0 |
| `ms` | 0 | 2336 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## §2. Missing `names.ur`

Entries where `names.ur` is empty OR equal to `names.en` (i.e. fillLangMap fallback, NOT a real Urdu name):

| Bucket | Count | % |
| --- | ---: | ---: |
| `names.ur` empty                    | 0 | 0.0% |
| `names.ur` = `names.en` (fallback)  | 1755 | 75.1% |
| `names.ur` explicit                 | **581** | 24.9% |
| Total                                | 2336 | 100% |

Script breakdown across ALL `names.ur` values (explicit + fallback):

| Script | Count | Notes |
| --- | ---: | --- |
| Arabic/Urdu script | **581** | the 581 explicit Urdu names — all in Arabic/Urdu script ✓ |
| Latin              | 1755 | = the 1755 `names.ur === names.en` fallbacks ✗ this is the bug |
| Bengali            | 0 | n/a |
| CJK                | 0 | n/a |
| Mixed              | 0 | n/a |
| Other              | 0 | n/a |

**Key insight:** every one of the 581 explicit Urdu names is correctly in Arabic/Urdu script. The 1755 "Latin" Urdu values are all `names.ur === names.en` fillLangMap fallbacks — they're not actually wrong Urdu translations, they're missing Urdu translations.

## §3. Urdu pages that will display Latin

When the user visits `/ur/prayer-times-in-<slug>` AND the curated entry has `names.ur` empty or equal to `names.en` AND `names.en` is Latin-script — the SSR renders the city name in Latin (e.g. "Charikar" instead of "چاريكار").

**Count of affected entries**: 1755 (75.1% of all curated).

### Top 30 affected entries (by largest Arabic-script `names.ar` clue available — would benefit most from ar→ur fallback)

| slug | cc | `names.en` (currently shown) | `names.ar` (clean Arabic available?) |
| --- | --- | --- | --- |
| `aachen` | de | Aachen | `آخن` |
| `aarau` | ch | Aarau | `آراؤ` |
| `abadan` | ir | Abadan | `آبادان` |
| `aberdeen` | gb | Aberdeen | `أبردين` |
| `abnub` | eg | Abnūb | `أبنوب` |
| `abu-ghurayb` | iq | Abū Ghurayb | `أبو غريب` |
| `abu-kabir` | eg | Abū Kabīr | `أبو كبير` |
| `abu-samrah` | qa | Abū Samrah | `أبو سمرة` |
| `abu-tij` | eg | Abū Tīj | `أبو تيج` |
| `ad-damazin` | sd | Ad-Damazin | `الدمازين` |
| `ad-damir` | sd | Ad-Damir | `الدامر` |
| `ad-diriyah` | sa | Ad Dir‘īyah | `الدرعية` |
| `ad-douiem` | sd | Ad Douiem | `الدويم (مدينة)` |
| `ad-duraykish` | sy | Ad Duraykīsh | `الدريكيش` |
| `adam` | om | Adam | `أدم` |
| `adh-dhayd` | ae | Adh Dhayd | `الذيد` |
| `adh-dhibiyah` | sa | Adh Dhibiyah | `الذيبية` |
| `adrar` | dz | Adrar | `أدرار` |
| `aenew` | tm | Änew | `آب نو` |
| `afak` | iq | ‘Afak | `عفك` |
| `afrin` | sy | ‘Afrīn | `عفرين` |
| `agdam` | az | Ağdam | `آغدام` |
| `agdas` | az | Ağdaş | `أغداش` |
| `agdzhabedy` | az | Agdzhabedy | `أغجابيدي` |
| `aghstafa` | az | Aghstafa | `آغستافا` |
| `aghsu` | az | Aghsu | `آغسو` |
| `aibak` | af | Aībak | `آي بك` |
| `aileu` | tl | Aileu | `آيليو` |
| `ainaro` | tl | Ainaro | `آينارو` |
| `aix-en-provence` | fr | Aix-en-Provence | `آكس أون بروفانس` |

## §4. Safe `ar` → `ur` fallback opportunity

Urdu and Arabic share the same script. If an entry has a clean-Arabic-script `names.ar` BUT no real `names.ur`, the SSR could safely substitute `names.ar` for the Urdu page render. **The reader sees readable Urdu-script text instead of Latin.**

**Affected entries**: 1748 (74.8% of curated, or 99.6% of the 1755 currently-Latin Urdu rows).

**This is the single biggest lever** for fixing the Urdu Latin-leak problem **WITHOUT touching the dataset** — a server-side fallback rule.

### Implementation sketch (Phase 1)

In `_pickCuratedName(entry, lang)` (server.js:3163):

```js
function _pickCuratedName(entry, lang) {
    if (!entry || typeof entry !== 'object') return null;
    const _n = entry.names || {};
    const _code = String(lang || 'ar').toLowerCase();
    const enValue = (typeof _n.en === 'string' && _n.en.trim()) ? _n.en : '';
    const langValue = (typeof _n[_code] === 'string' && _n[_code].trim()) ? _n[_code] : '';

    // ───────────────────────────────────────────────────────────────
    // 🆕 PLACE-NAMES-L10N-FALLBACK-1: Urdu reads Arabic script
    // If lang='ur' and names.ur is empty OR equal to en, AND names.ar
    // is clean Arabic-script (no Latin), use names.ar for Urdu render.
    if (_code === 'ur' && (!langValue || langValue === enValue)) {
        const arValue = (typeof _n.ar === 'string') ? _n.ar.trim() : '';
        if (arValue && !/[A-Za-z]/.test(arValue) && /[\u0600-\u06FF]/.test(arValue)) {
            return arValue;
        }
    }
    // ───────────────────────────────────────────────────────────────

    if (langValue) return langValue;
    if (enValue)   return enValue;
    for (const k of Object.keys(_n)) {
        if (typeof _n[k] === 'string' && _n[k].trim()) return _n[k];
    }
    return null;
}
```

**Expected impact**: 1748 Urdu page renders flip from Latin to Arabic-script — overnight, zero dataset changes.

## §5. Alias-promotion opportunities

Entries where `aliases[lang]` already contains a non-empty value but `names[lang]` is missing or a fallback. The alias could be promoted to the primary name (manual review still required for choice of variant).

| Lang | Promotable rows | % of curated |
| --- | ---: | ---: |
| `ar` | 0 | 0.0% |
| `en` | 1863 | 79.8% |
| `fr` | 2 | 0.1% |
| `de` | 0 | 0.0% |
| `tr` | 6 | 0.3% |
| `ur` | 0 | 0.0% |
| `id` | 4 | 0.2% |
| `es` | 9 | 0.4% |
| `bn` | 0 | 0.0% |
| `ms` | 1 | 0.0% |

### Sample (top 15 `ur` alias-promotion candidates)

| slug | cc | current `names.ur` | proposed `aliases.ur` |
| --- | --- | --- | --- |
_(no Urdu-alias data found in curated — most rows have only ar/en aliases)_

## §6. Worst offenders — Latin chars in `names.ar` or `names.ur` primary

Per the post-Stage-3.5 invariant, `names.ar` should NEVER contain Latin chars. Any hit here is a regression and should be flagged for fix.

### `names.ar` contains Latin chars (7)

| slug | cc | `names.ar` | `names.en` |
| --- | --- | --- | --- |
| `al-madam` | ae | `ٱlmadam` | Al Madam |
| `al-malikiyah` | sy | `dێryk` | Al Mālikīyah |
| `sumayl` | iq | `sێmێl` | Sumayl |
| `mawet` | iq | `mawەt` | Mawet |
| `khanaqin` | iq | `khanەqyn` | Khānaqīn |
| `soran` | iq | `dyanە` | Soran |
| `jamjamal` | iq | `chەmchەmaڵ` | Jamjamāl |

### `names.ur` contains Latin chars (1755)

Note: this includes the fillLangMap fallback rows where `names.ur === names.en` (Latin). The count below INCLUDES those.

Total: **1755** rows. Top 20:

| slug | cc | `names.ur` | `names.en` | same? |
| --- | --- | --- | --- | :-: |
| `qibah` | sa | `Qibah` | Qibah | ✓ (fallback) |
| `misliyah` | sa | `Mislīyah` | Mislīyah | ✓ (fallback) |
| `dukhnah` | sa | `Dukhnah` | Dukhnah | ✓ (fallback) |
| `at-taraf` | sa | `Aţ Ţaraf` | Aţ Ţaraf | ✓ (fallback) |
| `inak` | sa | `‘Inak` | ‘Inak | ✓ (fallback) |
| `udhailiyah` | sa | `Udhailiyah` | Udhailiyah | ✓ (fallback) |
| `qaisumah` | sa | `Qaisumah` | Qaisumah | ✓ (fallback) |
| `al-mutayrifi` | sa | `Al Muţayrifī` | Al Muţayrifī | ✓ (fallback) |
| `al-khabra` | sa | `Al Khabrā’` | Al Khabrā’ | ✓ (fallback) |
| `al-jubaylah` | sa | `Al Jubaylah` | Al Jubaylah | ✓ (fallback) |
| `al-jafr` | sa | `Al Jafr` | Al Jafr | ✓ (fallback) |
| `al-hayathim` | sa | `Al Hayāthim` | Al Hayāthim | ✓ (fallback) |
| `al-awwamiyah` | sa | `Al ‘Awwāmīyah` | Al ‘Awwāmīyah | ✓ (fallback) |
| `al-awjam` | sa | `Al Awjām` | Al Awjām | ✓ (fallback) |
| `adh-dhibiyah` | sa | `Adh Dhibiyah` | Adh Dhibiyah | ✓ (fallback) |
| `ad-diriyah` | sa | `Ad Dir‘īyah` | Ad Dir‘īyah | ✓ (fallback) |
| `al-fuwayliq` | sa | `Al Fuwayliq` | Al Fuwayliq | ✓ (fallback) |
| `mizhirah` | sa | `Mizhirah` | Mizhirah | ✓ (fallback) |
| `al-mulayda` | sa | `Al Mulaydā’` | Al Mulaydā’ | ✓ (fallback) |
| `umm-salal-muhammad` | qa | `Umm Şalāl Muḩammad` | Umm Şalāl Muḩammad | ✓ (fallback) |

## §7. Per-country breakdown — Urdu Latin-fallback risk

Top 30 countries by **count of entries where `/ur/` renders Latin**:

| cc | curated total | ur-fallback (Latin shown) | ur-fallback w/ safe `ar` available | ur-explicit (real Urdu) | risk % |
| --- | ---: | ---: | ---: | ---: | ---: |
| us | 126 | 115 | 115 | 11 | 91.3% |
| th | 78 | 74 | 74 | 4 | 94.9% |
| jp | 77 | 67 | 67 | 10 | 87.0% |
| az | 65 | 64 | 64 | 1 | 98.5% |
| dz | 64 | 54 | 54 | 10 | 84.4% |
| eg | 67 | 52 | 52 | 15 | 77.6% |
| vn | 54 | 51 | 51 | 3 | 94.4% |
| de | 56 | 47 | 47 | 9 | 83.9% |
| iq | 58 | 45 | 40 | 13 | 77.6% |
| gb | 49 | 44 | 44 | 5 | 89.8% |
| ir | 53 | 41 | 41 | 12 | 77.4% |
| af | 36 | 36 | 36 | 0 | 100.0% |
| es | 45 | 35 | 35 | 10 | 77.8% |
| sy | 51 | 33 | 32 | 18 | 64.7% |
| tn | 41 | 33 | 33 | 8 | 80.5% |
| id | 41 | 32 | 32 | 9 | 78.0% |
| ly | 36 | 28 | 28 | 8 | 77.8% |
| mx | 31 | 28 | 28 | 3 | 90.3% |
| br | 30 | 27 | 27 | 3 | 90.0% |
| sd | 34 | 27 | 27 | 7 | 79.4% |
| pl | 26 | 24 | 24 | 2 | 92.3% |
| ph | 28 | 24 | 24 | 4 | 85.7% |
| kh | 25 | 23 | 23 | 2 | 92.0% |
| ro | 23 | 22 | 22 | 1 | 95.7% |
| mn | 22 | 22 | 22 | 0 | 100.0% |
| kz | 23 | 21 | 21 | 2 | 91.3% |
| bt | 21 | 21 | 21 | 0 | 100.0% |
| it | 29 | 20 | 20 | 9 | 69.0% |
| mm | 22 | 20 | 20 | 2 | 90.9% |
| kr | 23 | 20 | 20 | 3 | 87.0% |

## §8. Phased enrichment plan

### 🔥 Phase 1 — IMMEDIATE (no data mutation): `ur` reads `ar` when missing

Modify `_pickCuratedName` in `server.js` to add a one-rule fallback: if `lang === 'ur'` and `names.ur` is missing/fallback AND `names.ar` is clean Arabic-script — return `names.ar`.

| Aspect | Value |
| --- | --- |
| Code surface | 1 function in `server.js` (~5 lines) |
| Dataset changes | **0 rows touched** |
| Tests | 1 new SSR test for `/ur/prayer-times-in-charikar` → renders `تشاريكار` |
| User-visible impact | 1748 Urdu pages flip from Latin to Arabic-script overnight |
| Reversibility | flip-a-line; trivial |
| Risk | very low — adds a fallback, never overrides explicit `names.ur` |

### 🎯 Phase 2 — TARGETED `names.ur` enrichment for Muslim-priority countries

Focus on countries with the highest Urdu-speaker overlap and largest curated population:

| Priority | cc | curated count | rationale |
| :-: | --- | ---: | --- |
| 1 | `pk` (Pakistan) | 10 | native Urdu market; very high search interest |
| 2 | `in` (India) | 18 | large Urdu-speaking minority |
| 3 | `bd` (Bangladesh) | 6 | also a Bengali priority — pairs with Phase 2b |
| 4 | `af` (Afghanistan) | 36 | Urdu widely understood; user explicitly flagged charikar leak |
| 5 | `ir` (Iran) | 53 | already covered by Phase 1 (ar→ur via Persian-script transliterations) |
| 6 | `sa, ae, kw, qa, om, bh` (Gulf) | covered by Phase 1 | many Urdu-speaking expats; Arabic primary works |

Approach: build a small bilingual reviewer tool that walks the targeted-country rows in batches of 20-50, presents the current `names.en` + `names.ar` + any `aliases.ur` and asks for a confirmed Urdu transliteration. **Manual review per row** — no auto-translation. Same pattern as the NAME_AR_FIXES tables for waves.

### 🛡️ Phase 3 — Pipeline gate (prevents regression)

Add a Stage 3.6 (or extend Stage 3.5's arabic_quality_check.mjs) to compute, for every new wave, a "language-coverage report" that flags:

- Rows where `names.ur` equals `names.en` AND `en` is Latin AND `ar` is also Latin (worst case)
- Rows where `names.bn`/`names.tr`/`names.id`/`names.ms` are missing for countries where they'd be expected (BD/TR/ID/MY)

This becomes a **closure prerequisite** for any new wave — same rigour as the existing 8-check Premerge QA.

### 🌍 Phase 4 — Full 10-language enrichment (deferred)

After Phases 1-3 close, enrich the remaining 7 languages (`fr/de/tr/id/es/bn/ms`) in priority order. This is a large but parallelizable effort — can be done country-by-country or in batches:

| Lang | Current explicit | Target | Gap | Strategy |
| --- | ---: | ---: | ---: | --- |
| `fr` French | 220 | 2336 | 2116 | bulk Wikipedia alias-pull or manual review |
| `de` German | 259 | 2336 | 2077 | bulk Wikipedia alias-pull or manual review |
| `tr` Turkish | 344 | 2336 | 1992 | bulk Wikipedia alias-pull or manual review |
| `id` Indonesian | 42 | 2336 | 2294 | bulk Wikipedia alias-pull or manual review |
| `es` Spanish | 217 | 2336 | 2119 | bulk Wikipedia alias-pull or manual review |
| `bn` Bengali | 581 | 2336 | 1755 | bulk Wikipedia alias-pull or manual review |
| `ms` Malay | 14 | 2336 | 2322 | bulk Wikipedia alias-pull or manual review |

## §9. Recommendations summary

Per user direction (no data mutation in this audit phase), the only ACTIONABLE change recommended right now is:

1. **Open `PLACE-NAMES-L10N-FALLBACK-1`** (small, code-only): add ar→ur fallback rule to `_pickCuratedName`. Fixes 1748 Urdu Latin-leak pages overnight. No data touched. Reversible.

Deferred (await user trigger):

- `PLACE-NAMES-L10N-PHASE-2-PK-IN-BD-AF` (manual `names.ur` enrichment for 4 priority countries)
- `PLACE-NAMES-L10N-PHASE-3-PIPELINE-GATE` (Stage 3.6 lang-coverage check)
- `PLACE-NAMES-L10N-PHASE-4-FULL-10-LANG` (long-tail: fr/de/tr/id/es/bn/ms)

## §10. Methodology notes

- Audit script: `scripts/geodata/_curated_place_names_l10n_audit.mjs` (READ-ONLY).
- `names[lang]` is treated as "explicit" if it differs from `names.en`. This mirrors the `fillLangMap` behavior in Stage 2 (`scripts/geodata/_geonames_common.mjs:396`) which fills missing langs with the English fallback.
- "Clean Arabic script" means: contains at least one Arabic-block letter (U+0600-06FF) AND contains no Latin (A-Za-z). Persian extras (پ چ ژ گ ک ی etc.) are tolerated for the Urdu-fallback test (they ARE readable in Urdu).
- "Strict Arabic" (no Persian extras) is a tighter criterion used internally by Stage 3.5's gate. The fallback rule here uses the looser "Arabic-script" criterion to maximize Urdu-page coverage — Urdu readers handle Persian-style letters natively.
- Bengali, Devanagari, CJK, Cyrillic detection is mostly informational — these scripts shouldn't appear in any `names[lang]` for lang ∈ {ar, ur, fr, de, tr, id, es, ms}. Bengali in `names.bn` is expected.

**No mutations to `curated-places.json` were performed by this audit.**
