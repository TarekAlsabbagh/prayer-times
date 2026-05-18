# CURATED-PLACE-NAMES-L10N-FOUNDATION-AND-GENERATION-1

**Phase**: Architecture proposal (NO code, NO data changes)
**Date**: 2026-05-18
**Status**: design-only — awaiting user approval before any execution begins
**Supersedes**: `PLACE-NAMES-L10N-FALLBACK-1` (reverted), `CURATED-PLACE-NAMES-L10N-FOUNDATION-1` (subsumed), `PLACE-NAMES-L10N-FOUNDATION-CODE-1` (rolled back before any code shipped)
**Predecessor (informational)**: `CURATED-PLACE-NAMES-L10N-AUDIT-1`

---

## Core principle (user direction)

> **"Stored localized place names"** — each city carries pre-generated, reviewed names per language. No runtime translation. No silent fallbacks. **Missing means missing.**
>
> Latin-script transliterations are NEVER acceptable for `ar`, `ur`, `bn`. For `fr`, `de`, `es`, `tr`, `id`, `ms`, Latin is acceptable for obscure cities but must be documented as a fallback (not a translation).

### Example of what we want, end to end

```jsonc
{
  "slug": "charikar",
  "countryCode": "af",
  "names": {
    "en": "Charikar",
    "ar": "تشاريكار",
    "ur": "چاریکار",
    "bn": "চারিকার"
    // fr/de/es/tr/id/ms — absent unless explicitly added
  },
  "namesProvenance": {
    "en": { "source": "geonames",         "method": "primary-name",      "phase": "stage1:af",                "reviewed": true },
    "ar": { "source": "wikipedia",        "method": "alternatename",     "phase": "asia-1g-af",               "reviewed": true },
    "ur": { "source": "manual-review",    "method": "transliteration",   "phase": "place-names-ur-af-1",      "reviewed": true },
    "bn": { "source": "manual-review",    "method": "transliteration",   "phase": "place-names-bn-af-1",      "reviewed": true }
  }
}
```

### Example of what we DO NOT want

```jsonc
// ❌ FORBIDDEN by this proposal
{
  "names": {
    "en": "Charikar",
    "ar": "تشاريكار",
    "ur": "Charikar",         // ← Latin in Urdu name field. Looks "filled" but it's a lie.
    "fr": "Charikar",         // ← same — looks filled, actually fillLangMap leftover
    "bn": "Charikar"          // ← Bengali field with Latin. Reader sees Latin in /bn page.
  }
}
```

---

## §1. How will we store city names per language?

**Schema decision: in-place expansion inside `curated-places.json`, with a parallel `namesProvenance` map.**

```jsonc
{
  "slug": "<slug>",
  "countryCode": "<cc>",
  ...
  "names": {
    "en": "<canonical English>",     // ALWAYS present
    "ar": "<canonical Arabic>",      // ALWAYS present (post-Stage-3.5 invariant)
    "ur": "<Nasta'liq Urdu>",        // OPTIONAL — present only if explicitly added
    "bn": "<Bengali>",               // OPTIONAL
    "fr": "<French if different from en>", // OPTIONAL
    "de": "<German if different>",   // OPTIONAL
    "es": "<Spanish if different>",  // OPTIONAL
    "tr": "<Turkish if different>",  // OPTIONAL
    "id": "<Indonesian if different>", // OPTIONAL
    "ms": "<Malay if different>"     // OPTIONAL
  },
  "namesProvenance": {
    "<lang>": {
      "source": "geonames" | "wikidata" | "wikipedia" | "manual-review" | "transliteration",
      "method": "primary-name" | "alternatename" | "lang-tag" | "transliteration" | "established-convention",
      "phase":  "<wave-or-batch-id>",
      "reviewed": true | false,
      "qualityScore": 0-100,
      "notes": "<optional free-text>"
    }
  }
}
```

**Invariants**:
- `names.en` ALWAYS present (canonical anchor — the only language guaranteed for every curated entry).
- `names.ar` ALWAYS present (post-Stage-3.5 invariant — verified for every wave so far).
- All 8 other langs (`ur`, `bn`, `fr`, `de`, `es`, `tr`, `id`, `ms`) **OPTIONAL**. If absent, the key is absent — NOT a string copied from `en`.
- `namesProvenance[lang]` is present iff `names[lang]` is present. Provenance is the audit trail of "where this name came from + was it reviewed".

---

## §2. Inside `curated-places.json` or a separate file?

**Decision: in-place inside `curated-places.json` (no side-car file).**

Considered three architectures, decision matrix:

| Option | Pros | Cons | Verdict |
|---|---|---|:-:|
| A. In-place expansion of `names` + `namesProvenance` (proposed) | Single source of truth; server contract unchanged; atomic per-slug | curated-places.json grows | ✅ |
| B. Side-car `db/places/place-names-l10n.json` keyed by slug | Curated file stays small; cleaner diffs per batch | Two files to keep in sync; risk of stale-cache mismatch; server.js readers need rewrite | ❌ |
| C. Per-language side-cars (`names/ur.json`, `names/bn.json`, …) | Per-lang batch ops trivial | 9 files to coordinate; boot-load complexity; slug consistency check per file | ❌ |

The deciding factor is: `curated-places.json` is already the single source of truth read by `server.js`, `/api/search-place`, `/api/place-by-slug`, the SSR pre-fill, the smoke tests, and the production verifier. Adding a side-car would force every reader to learn the new shape. In-place expansion preserves the contract.

---

## §3. How will we add `namesProvenance` to each name?

**Decision: provenance is added AT THE TIME the name is added.** Never retroactively.

For each language source, the provenance object is filled by the script that wrote the name. Per-source defaults:

| Source script | Provenance written |
|---|---|
| `normalize_places.mjs` (Stage 2 of any wave) | `{ source: 'geonames', method: 'alternatename' \| 'primary-name', phase: 'stage2:<cc>' }` |
| `arabic_quality_check.mjs` (Stage 3.5) | does not write names; only annotates `arQuality` |
| `apply_curated_candidates.mjs` (Stage 4) | preserves `namesProvenance` from candidate JSON |
| `_<wave>_clean_approve.mjs` | `{ source: 'manual-review', method: 'curated-decision', phase: '<wave-id>' }` for any `NAME_AR_FIXES` row |
| Manual `names.ur` review batch | `{ source: 'manual-review', method: 'transliteration', phase: 'place-names-ur-<cc>-N', reviewed: true }` |
| Wikidata pull (Phase 4+) | `{ source: 'wikidata', method: 'lang-tag', phase: 'wikidata-pull-N', reviewed: false }` (needs human review pass) |
| Wikipedia article-title pull | `{ source: 'wikipedia', method: 'article-title', phase: 'wikipedia-pull-N', reviewed: false }` |

**Provenance for the 2,336 existing curated rows**: backfilled during Phase 2 (see §13) — every existing `names.en` and `names.ar` gets a `namesProvenance.{en|ar}` entry with the historical wave/source recorded. Fillchain rows (where `names[lang] === names.en` for lang ≠ en/ar) get DELETED from `names` (no provenance written for them — they were never reviewed).

---

## §4. How do we prevent the wrong `names.en → ur/bn/ar` fallback?

**Three coordinated changes, applied in this order:**

### Layer A — Stop the source of contamination at Stage 2

`scripts/geodata/_geonames_common.mjs::fillLangMap` currently fills every missing lang with the English `fallback`. Future-wave runs would keep producing `names.ur === names.en === "Charikar"` rows.

Proposed replacement: only fill `en` and (if provided) `ar`. All other langs stay ABSENT unless explicitly given in `partial`:

```js
export function fillLangMap(partial, fallback) {
    const out = {};
    out.en = (partial && partial.en) ? partial.en : fallback;
    if (partial && partial.ar) out.ar = partial.ar;
    for (const l of SUPPORTED_LANGS) {
        if (l === 'en' || l === 'ar') continue;
        if (partial && partial[l]) out[l] = partial[l];   // present iff explicitly provided
    }
    return out;
}
```

This is a **single function** change in one file. Future waves no longer create fillchain rows.

### Layer B — Clean existing fillchain rows (one-shot)

Phase 2 (see §13): walk `curated-places.json`, for every row, for every lang ≠ {`en`, `ar`}, **delete** `names[lang]` IF `names[lang] === names.en` (the fillLangMap-leftover signature).

This is a one-shot mutation done with an audit-trail report. After it runs, the existing 2,336 rows match the new schema invariant.

### Layer C — Server rejects the wrong fallback at read time

`server.js::_pickCuratedName(entry, lang)` is the central reader. It currently silently falls back to `names.en` when `names[lang]` is missing. Proposed redesign:

```js
const _ABSENCE_LANGS = new Set(['ar', 'ur', 'bn']);   // non-Latin-script — must be honest

function _pickCuratedName(entry, lang) {
    if (!entry || typeof entry !== 'object') return null;
    const _n = entry.names || {};
    const _code = String(lang || 'ar').toLowerCase();
    if (typeof _n[_code] === 'string' && _n[_code].trim()) return _n[_code];

    // For non-Latin-script langs, honesty: return null when missing.
    // The UI layer renders an absence state (see §13 + the UX direction
    // in the audit report). NEVER silently substitute names.en.
    if (_ABSENCE_LANGS.has(_code)) return null;

    // For Latin-script langs (fr/de/es/tr/id/ms): names.en is acceptable
    // Latin display (reader sees Latin chars either way). The provenance
    // map records source=fallback-en for these.
    if (typeof _n.en === 'string' && _n.en.trim()) return _n.en;
    return null;
}
```

**Three changes combined** ensure the contamination is stopped, the historical mess is cleaned, and the server enforces the invariant.

---

## §5. How do we know a name is a real translation vs. a fallback?

**Three signals, in order of strength:**

### Signal 1 (strongest) — `namesProvenance[lang]` exists with `source ≠ 'fallback-en'`

Definitive. The provenance map records exactly how the name got there. If `source` is `geonames`, `wikidata`, `wikipedia`, `manual-review`, or `transliteration` — it's a real localization.

### Signal 2 — Script-class check

For each lang, the `names[lang]` value SHOULD be in the expected script:

| Lang | Expected primary script | Strict / loose |
|---|---|:-:|
| `ar` | Arabic block (no Persian extras) | strict |
| `ur` | Arabic block (Persian extras allowed: پ چ ژ گ ک ی ہ ے ھ) | loose |
| `bn` | Bengali block U+0980-09FF | strict |
| `en`, `fr`, `de`, `tr`, `id`, `es`, `ms` | Latin (incl. accented Latin) | strict |

If `names.ur` contains Latin chars → almost certainly a fallback or mojibake. If `names.bn` contains Latin → same.

### Signal 3 — String-equality check (weakest)

If `names[lang] === names.en` for lang ≠ en → fillLangMap leftover. After Phase 2 cleanup, this signal should match zero rows in `curated-places.json`.

---

## §6. How do we generate transliterations per language?

**Three-layer methodology per language:**

### Layer 1 — Authoritative external source

The strongest source — pull from existing localized databases:

| Lang | Primary source | Secondary source | Tertiary |
|---|---|---|---|
| `ur` | GeoNames `alternatenames` filtered to `ur:` tag | Wikidata `P1813` (Urdu label) | Urdu Wikipedia article title |
| `bn` | GeoNames `alternatenames` `bn:` tag | Wikidata Bengali label | Bengali Wikipedia |
| `fr` | GeoNames `fr:` tag | Wikidata French label | French Wikipedia |
| `de` | GeoNames `de:` tag | Wikidata German label | German Wikipedia |
| `es` | GeoNames `es:` tag | Wikidata Spanish label | Spanish Wikipedia |
| `tr` | GeoNames `tr:` tag | Wikidata Turkish label | Turkish Wikipedia |
| `id` | GeoNames `id:` tag | Wikidata Indonesian label | Indonesian Wikipedia |
| `ms` | GeoNames `ms:` tag | Wikidata Malay label | Malay Wikipedia |

If Layer 1 returns a value that passes the script-class check (§5 Signal 2), use it directly.

### Layer 2 — Rule-based transliteration (per-lang)

For cities where Layer 1 returns nothing, generate a transliteration using per-language rules. Each lang has a small JS module:

```
scripts/geodata/transliteration/
├── ur.mjs    — Urdu transliteration rules (en → Urdu Nasta'liq + ar → ur conversions)
├── bn.mjs    — Bengali transliteration rules
├── fr.mjs    — French Latin-adjustment rules (e.g. "Mecca" → "La Mecque")
├── de.mjs    — German Latin-adjustment ("Munich" → "München")
├── es.mjs    — Spanish ("New York" → "Nueva York", "London" → "Londres")
├── tr.mjs    — Turkish ("Mecca" → "Mekke", "Medina" → "Medine")
├── id.mjs    — Indonesian (often same as en)
└── ms.mjs    — Malay (often same as en)
```

Each module exports a `transliterate(slug, names)` function:
- Input: the slug + the existing names map (en, ar, …)
- Output: a candidate transliteration + a confidence score + an audit string

**Important**: rule-based transliteration is FALLBACK. Its output ALWAYS goes through Layer 3 before being committed.

### Layer 3 — Manual review (required for high-priority cities)

Every candidate (whether from Layer 1 or Layer 2) is presented to a human reviewer in a batch review markdown file (§9). The reviewer either:
- Approves the candidate as-is
- Edits the candidate to a different transliteration
- Marks the row as "SKIP" (no Urdu name added; row stays at `names.ur` absent)

**Manual review is MANDATORY for:**
- PPLC (national capitals)
- PPLA (province seats) where pop ≥ 100k
- Any row where Layer 1 + Layer 2 disagree
- Any row where the rule-based transliteration produces ambiguous output

For PPLA with pop < 100k OR PPL rows, Layer 1 (if confident) can auto-commit without manual review — but the review markdown lists them for spot-check.

### Rule against literal translation

```
❌ "New York"   → "المدينة الجديدة"    ← WRONG (literal translation of meaning)
✅ "New York"   → "نيويورك"             ← CORRECT (established Arabic name)
✅ "New York"   → "نیویارک"             ← CORRECT (established Urdu name)
✅ "London"     → "Londres" (es)        ← CORRECT (established Spanish exonym)
✅ "Munich"     → "München" (de)        ← CORRECT (the native German form)
```

The transliteration modules implement **conventional names**, not semantic translation.

---

## §7. Trusted name sources per language

Detailed source map:

### Tier 1 — Free, structured, machine-readable

| Source | Coverage | Per-lang availability | License |
|---|---|---|---|
| **GeoNames `alternatenames`** | All P-class places already in our wave pipeline | ar, en, fr, de, es, tr, id, ms, ur, bn | CC-BY 4.0 |
| **Wikidata `P1813` (short name) + monolingual labels** | Famous cities + most provincial capitals | All 10 langs (varies by city) | CC0 |
| **Wikipedia article-title cross-language links** | Same as Wikidata | Same coverage | CC-BY-SA (attribution required) |

GeoNames is already our primary source — we just need to start KEEPING the per-lang alternatenames during Stage 2 instead of discarding them. Currently `normalize_places.mjs` only extracts `ar:` and `en:` tags; other tags are dropped.

### Tier 2 — Manual / curated

| Source | Use case |
|---|---|
| Arabic Wikipedia article title for the city in Urdu (cross-link) | Validates an Urdu form against the actual Urdu Wikipedia title |
| Persian Wikipedia article title (for ir/af) | Useful when ur is absent but the Persian form is close-enough to Urdu (with حق letter substitutions) |
| Manual user-supplied corrections | Same workflow as `NAME_AR_FIXES` for waves |

### Tier 3 — Algorithmic generation (last resort)

Rule-based transliteration from English or Arabic. Always followed by manual review for important cities.

### Tier 4 — DELIBERATELY EXCLUDED

| Source | Why excluded |
|---|---|
| Google Translate API (any provider) | Translates meaning, not names. Would produce "المدينة الجديدة" for New York. ALSO violates the no-runtime-translation rule. |
| OpenAI/Claude/Gemini at runtime | Same problem — translation, not localization. Violates stored-names principle. |
| Crowdsourced / unverified user submissions | No quality gate. |

---

## §8. Quality score required to approve a name

**Proposed `qualityScore` rubric (0-100 per name):**

| Score | Tier | Source | Reviewed? | Commit-eligible? |
|---:|---|---|:-:|:-:|
| 100 | Gold | GeoNames `<lang>:` tag matches Wikidata label matches Wikipedia title — all three agree | manual | ✅ auto-commit |
| 90 | Gold | Wikidata `P1813` for that lang + manual review approved | ✓ | ✅ auto-commit |
| 80 | Silver | Wikipedia article cross-link in the lang + manual review approved | ✓ | ✅ auto-commit |
| 70 | Silver | GeoNames `<lang>:` tag only + script-class check passes + manual review | ✓ | ✅ auto-commit |
| 60 | Bronze | Rule-based transliteration + manual review approved | ✓ | ✅ commit with `reviewed: true` |
| 50 | Bronze | Rule-based transliteration, no manual review yet | ✗ | ❌ stays in queue |
| < 50 | Reject | Ambiguous / multiple plausible forms / known disagreement | — | ❌ deferred to higher-trust source |

**Commit threshold**: `qualityScore ≥ 60 AND reviewed === true`. Rows below threshold stay in the review queue.

**Exception**: `qualityScore ≥ 80 AND source ∈ {wikidata, wikipedia, geonames-tagged}` AND script-class check passes → MAY auto-commit without manual review (the source provides the quality gate). User policy can tighten this.

---

## §9. When does a name need manual review?

**Always requires manual review:**

| Trigger | Reason |
|---|---|
| Layer 2 (rule-based) output | All algorithmic transliterations |
| PPLC (national capital) | High visibility; mistakes are user-visible immediately |
| Pop ≥ 500k | Famous cities → people will see them |
| Script-class fails on Layer 1 output | Wikipedia / GeoNames returned something weird |
| Source disagrees | Layer 1 says "X", Layer 2 says "Y" |
| Disputed transliteration | E.g. Kandahar = `قندهار` (Arabic) or `قندھار` (Urdu) — choice of ھ vs ه |
| User-watch slug (e.g. on the project's known-important list) | Same as PPLC |

**May skip manual review (auto-commit allowed):**

| Trigger | Reason |
|---|---|
| Wikidata `P1813` exact match + script-class OK | Wikidata IS the authoritative crowd-sourced source |
| GeoNames `<lang>:` tag matches Wikipedia title + script-class OK | Two independent sources agree |
| Rule-based transliteration where qualityScore ≥ 70 AND city is non-critical (pop < 50k, not a capital) | Low-stakes; can be revisited later if user reports issue |

### Review batch format

Manual review uses a markdown template the user edits in-place. Format:

```markdown
# place-names-ur-af-1 — Urdu names for Afghanistan curated entries

Total rows: 36 (AF curated count after ASIA-1G-AF + AF-MCF)
Already explicit `names.ur`: 0
Candidates from sources: [Layer 1 GeoNames ur-tag: 12, Layer 1 Wikidata: 4, Layer 2 transliteration: 20]

## Batch — 36 rows

| Approve | slug | pop | names.en | Layer 1 ur (source) | Layer 2 ur (rule) | Recommended | Reviewer override |
|:---:|---|---:|---|---|---|---|---|
| [ ] | kabul        | 4434550 | Kabul       | کابل (geonames:ur) | کابل (rule-en) | **کابل**        | (leave blank to accept) |
| [ ] | charikar     | 53676   | Charikar    | (none)              | چاریکار (rule-ar) | **چاریکار**     | |
| [ ] | kandahar     | 523300  | Kandahār    | قندھار (wikidata)  | قندہار (rule-ar) | **قندھار**     | |
| [ ] | pul-e-khumri | 56369   | Pul-e Khumrī | (none)              | پل خمری (rule-ar) | **پل خمری**     | |
| [ ] | maydanshakhr | 1600    | Maydanshakhr | (none)             | میدان شہر (rule-ar) | **میدان شہر**  | |
| ... |
```

Reviewer ticks `[x]` to approve, edits the "Reviewer override" column to change the name, or types `SKIP` to defer.

After review, an apply script reads the markdown, updates `curated-places.json` + `namesProvenance`, emits a commit-ready diff.

---

## §10. How do we test each language?

**Three test layers:**

### Layer 1 — Static dataset invariants (per-commit guard)

Script: `scripts/geodata/_l10n_invariants_check.mjs`. Run on every commit and in CI. Asserts:

- `names.en` and `names.ar` present on every curated row (existing invariant)
- For every present `names[lang]` (lang ∈ {ur, bn}): script-class check passes (no Latin)
- For every present `names[lang]` (lang ∈ {fr, de, es, tr, id, ms}): script-class passes OR is identical to `names.en` (Latin fallback noted)
- No row has `names[lang] === names.en` for lang ∈ {ur, bn, ar} (fillchain regression)
- Every present `names[lang]` has a corresponding `namesProvenance[lang]` entry
- No two slugs in the same country have the same `names[lang]` value

### Layer 2 — Per-lang SSR smoke tests

One test file per non-trivial language:

| Lang | Test file | What it checks |
|---|---|---|
| `ur` | `scripts/_test_l10n_ur_ssr.mjs` | `/ur/prayer-times-in-<slug>` SSR returns the Urdu name (or absence state) — never Latin |
| `bn` | `scripts/_test_l10n_bn_ssr.mjs` | Same for Bengali |
| `ar` | (existing test suite) | Already covered |
| `tr` | `scripts/_test_l10n_tr_ssr.mjs` | Smoke: 10 well-known cities have Turkish names (Mekke / Medine / Cidde …) |
| `fr` | `scripts/_test_l10n_fr_ssr.mjs` | Smoke: 10 cities have French names where they should (La Mecque / Médine / Le Caire …) |
| `de`, `es`, `id`, `ms` | similar | Spot-check famous cities |

### Layer 3 — Absence-state smoke tests (per-lang)

For each lang, pick 5 rows that DON'T have `names[lang]`. Hit `/<lang>/prayer-times-in-<slug>`. Assert:
- For ur/bn: the SSR renders an honest "name not available in this language" marker AND shows the English name as secondary text (per the UX rule in §13)
- For fr/de/es/tr/id/ms: the SSR renders the English name AND adds a small `data-name-source="fallback-en"` attribute so a future styling pass can mark it (no UI surfacing required immediately for Latin-script langs)

This is the test layer that would have caught the Charikar bug.

### Concrete test cases to add

```
✓ /ur/prayer-times-in-charikar    must show چاریکار   (not "Charikar")
✓ /ur/prayer-times-in-kandahar    must show قندھار   (not "Kandahar")
✓ /ur/prayer-times-in-pul-e-khumri must show پل خمری
✓ /ur/prayer-times-in-sar-e-pul   must show سر پل
✓ /bn/prayer-times-in-charikar    must show চারিকার  (or absence state — never "Charikar")
✓ /ar/prayer-times-in-charikar    must show تشاريكار
✓ /en/prayer-times-in-charikar    must show Charikar (unchanged)
✓ /fr/prayer-times-in-paris       must show Paris (unchanged)
✓ /tr/prayer-times-in-mecca       must show Mekke (where seeded)
```

---

## §11. How do we prevent Latin from showing in `ur`, `ar`, `bn`?

**Six-layer defense in depth:**

### Layer 1 — `fillLangMap` redesign (Stage 2)

(See §4 Layer A.) Stop creating fillchain rows for new waves.

### Layer 2 — Stage 3.5 extension (`arabic_quality_check.mjs`)

Currently rejects Latin in `names.ar`. Extend to also reject Latin in `names.ur` (when present) and `names.bn` (when present). Wave closure blocked if any high-tier row has Latin in those fields.

### Layer 3 — Stage 3.6 NEW — language-coverage gate

For every new wave, generate a `lang-coverage-<wave>.md` report:

```
Wave: ASIA-1D-PK
Rows: 25
Per-lang coverage:
  en: 25 / 25 (100%)
  ar: 25 / 25 (100%)
  ur: 12 / 25 (48%)   ← target ≥ 60% for Urdu-priority countries
  bn:  0 / 25 (0%)
  fr/de/es/tr/id/ms: optional, not gated for non-priority wave
```

Wave closure is gated on hitting per-lang minimum coverage for priority countries.

### Layer 4 — `_pickCuratedName` redesign (server.js)

(See §4 Layer C.) Returns `null` for missing ur/bn; never silently substitutes en.

### Layer 5 — UI absence-state rendering

When `_pickCuratedName` returns `null` for ur/bn, the UI renders the honest absence state (§13 UX). The reader sees a small "name not available in <lang>" label and the English name as secondary text.

### Layer 6 — Static invariants check

(See §10 Layer 1.) Per-commit guard against regression.

---

## §12. How do we handle Latin-script langs (`fr`, `de`, `es`, `tr`, `id`, `ms`) when no local form exists?

**Decision: `names.en` is acceptable as the rendered string** for these languages, but **the page must record it as a fallback** (not a translation), and SEO must treat it as English-equivalent (no separate canonical).

### Rendering rule

```js
function _pickCuratedNameWithSource(entry, lang) {
    if (LATIN_SCRIPT_LANGS.has(lang)) {
        // fr, de, es, tr, id, ms — Latin fallback is acceptable
        if (names[lang]) return { name: names[lang], source: 'explicit-localized' };
        if (names.en)    return { name: names.en,    source: 'fallback-en-latin-script' };
        return { name: null, source: 'missing' };
    }
    if (ABSENCE_LANGS.has(lang)) {
        // ar, ur, bn — honest absence required
        if (names[lang]) return { name: names[lang], source: 'explicit-localized' };
        return { name: null, source: 'missing' };
    }
    // en — always present
    return { name: names.en, source: 'explicit-localized' };
}
```

### UI hint for Latin-script fallback (informational, not blocking)

When `source === 'fallback-en-latin-script'`, the SSR adds `data-name-source="fallback-en"` to the city-name container. CSS may optionally style the city name in a slightly different way (e.g. tiny "i" icon next to the name with a tooltip "displayed in English — no localized name yet"). This is **optional** UI polish — not required for the foundation.

### Famous-city seeding for Latin-script langs (Phase 5)

For the small set of famous cities where established conventions differ from English, seed the local form:

| Lang | en form | local form |
|---|---|---|
| `tr` | Mecca / Medina / Jerusalem / Damascus / Cairo / Baghdad / Istanbul | Mekke / Medine / Kudüs / Şam / Kahire / Bağdat / İstanbul |
| `fr` | Mecca / Medina / Jerusalem / Cairo / Damascus | La Mecque / Médine / Jérusalem / Le Caire / Damas |
| `de` | Mecca / Medina / Jerusalem / Cairo / Munich | Mekka / Medina / Jerusalem / Kairo / München |
| `es` | New York / London / Mecca / Medina | Nueva York / Londres / La Meca / Medina |
| `id` | Mecca / Medina / Jerusalem / Cairo | Mekkah / Madinah / Yerusalem / Kairo |
| `ms` | Mecca / Medina / Jerusalem | Mekah / Madinah / Baitulmuqaddis |

A "famous cities" curated list per lang (maybe 50-100 cities each) — seeded in Phase 5.

---

## §13. Phased execution plan

### Phase 1 — Foundation (CURRENT)

Outcome: **this report**. No code or data touched. **Awaiting user approval on §1-§12.**

### Phase 2 — Stop wrong fallback + clean existing data

Outcome: stop the contamination going forward + clean the historical mess.

Atomic steps:
1. Modify `fillLangMap` in `_geonames_common.mjs` (§4 Layer A).
2. Add `_l10n_invariants_check.mjs` (§10 Layer 1).
3. One-shot script `scripts/geodata/_l10n_phase2_strip_fillchain.mjs` walks `curated-places.json`, deletes `names[lang]` where it equals `names.en` for lang ∈ {ur, bn, ar} (and optionally for Latin langs too — user choice). Emits an audit report counting deletions per lang per cc.
4. Modify `_pickCuratedName` in `server.js` (§4 Layer C).
5. Add SSR support for `data-name-source` attribute on city-name container + the small "absence-state" marker text for ur/bn.
6. Smoke test: `/ur/prayer-times-in-charikar` shows the absence-state marker (NOT "Charikar" as if it were Urdu).
7. Carry-forward suites all green.

Expected delta:
- `curated-places.json`: ~15,000 fillchain-row deletions across 2,336 entries × 8 fillchain langs (rough estimate).
- `server.js`: ~30 lines added.
- New script + new test file.

This phase **does NOT add any new localized names**. It strips the false ones + adds the honest-absence behavior.

### Phase 3 — Provenance backfill

Outcome: every existing `names.en` and `names.ar` gets a `namesProvenance` entry recording the wave that introduced it.

One-shot script that infers provenance from the existing curated data (e.g. all SA entries → `{ source: 'manual', phase: 'curated-150-1' }`, all Strategy-E rows → `{ source: 'stage4', phase: '<wave>' }`). No new names added — just provenance metadata.

### Phase 4 — Urdu priority batches

5 batches in order, ~20-50 rows each, manual review per row:

| Batch | Country | Approx rows | Notes |
|---|---|---:|---|
| `place-names-ur-af-1` | Afghanistan | 36 | The originally-reported case. AF has heavy Persian script in Layer 1 sources — good test ground for the workflow. |
| `place-names-ur-ir-1` | Iran | 53 | Persian → Urdu is well-defined; Layer 1 sources rich. |
| `place-names-ur-pk-1` | Pakistan | 10 + future | Native Urdu market; should auto-commit from Layer 1 mostly. |
| `place-names-ur-bd-1` | Bangladesh | 6 | Pairs with bn-bd batch later. |
| `place-names-ur-in-1` | India | 18 | Big Urdu minority. |

After all 5: Urdu coverage for the 5 Muslim-priority countries goes from ~0% to ~100%.

### Phase 5 — Bengali priority batches

Similar pattern for `bn`. Priority countries: BD → IN → MY (Bangladeshi diaspora).

### Phase 6 — Turkish + Indonesian + Malay enrichment

Most rows in these langs are accepted as Latin fallback. We only need to seed famous-city exonyms (§12 Phase 5 table) plus per-country priorities (TR cities for tr, ID/MY for id/ms).

### Phase 7 — French / German / Spanish

Same approach as Phase 6 — famous-city exonyms only, not full coverage.

### Phase 8 — Pipeline gate

Extend `arabic_quality_check.mjs` → `lang_quality_check.mjs` that does the per-wave coverage report (§11 Layer 3). Becomes a gate for new waves.

### Phase 9 — Long tail (low-priority cities, all langs)

After Phases 4-8 prove the workflow, run rule-based Layer 2 transliteration on the long-tail cities (pop < 100k, not capital). Spot-check sample per batch.

---

## Open questions for user before Phase 2 starts

Re-confirming these decisions explicitly:

1. **Schema**: in-place `names` + `namesProvenance` sibling? *(Recommendation: yes)*
2. **`fillLangMap` redesign**: kill en-fallback for non-en/ar langs in new waves? *(Recommendation: yes)*
3. **`_pickCuratedName` redesign**: return `null` for missing ar/ur/bn; return `names.en` for missing fr/de/es/tr/id/ms? *(Recommendation: yes)*
4. **Phase 2 cleanup scope**: strip only `names[lang] === names.en` rows in {ur, bn, ar}, OR also in {fr, de, es, tr, id, ms}? *(Recommendation: strip in ALL non-en langs in one shot, since the principle is "missing means missing" everywhere — but the Latin-script langs will fall back to `names.en` at render time anyway, so user-visible impact is zero)*
5. **Absence-state UI for ur/bn**: small marker label above/below the English name in the city-name container? Exact wording? *(Proposed: `<small lang="<ui-lang>" class="city-name-absence-marker">نام دستیاب نہیں</small>` for ur; similar for bn)*
6. **Auto-commit threshold** for §8 qualityScore: ≥ 80 with two sources agreeing — OK? Or require manual review for ALL non-en/ar names? *(Recommendation: require manual review for ALL ur/bn names initially; relax for high-confidence Wikidata pulls after Phase 4 proves the workflow)*
7. **Famous-city exonym list size** for Phase 6 + 7: 50 / 100 / 200 cities per lang? *(Recommendation: start with 50, expand based on user feedback)*

---

## What this phase does NOT do

- ❌ NO code changes (server.js / app.js / index.html / _geonames_common.mjs — all untouched)
- ❌ NO data changes (curated-places.json — untouched)
- ❌ NO runtime translation API calls
- ❌ NO `names.ar → ur` runtime fallback
- ❌ NO `names.en → ur` runtime fallback
- ❌ NO mass enrichment of `names.ur` / `names.bn` / etc.

The only artifact of this phase is **this report**.

---

## Verification: workspace is clean

```
$ git diff server.js                            → empty
$ git diff scripts/geodata/_geonames_common.mjs → empty
$ git diff db/places/curated-places.json        → empty
$ git diff index.html                           → empty
```

No code or data was modified to produce this report. The earlier `PLACE-NAMES-L10N-FALLBACK-1` patch is fully reverted; `PLACE-NAMES-L10N-FOUNDATION-CODE-1` never made it past a single read of `_geonames_common.mjs`.

---

## Next step

User reviews this report. Once the 7 open questions in §13 are answered, Phase 2 (stop wrong fallback + clean existing data) can begin as a **small, atomic commit** with full smoke + carry-forward testing.

Until then, **no execution, no patches, no auto-fills.**
