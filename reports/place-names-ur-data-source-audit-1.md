# PLACE-NAMES-UR-DATA-SOURCE-AUDIT-1

**Phase**: Analysis-only (NO code, NO data changes)
**Date**: 2026-05-18
**Status**: data audit complete — awaiting user decision
**Scope**: 9 sample cities + repo-wide pattern check
**State**: HEAD `6f54b5e` (functionally identical to `ca78809`)

---

## TL;DR

**The user's intuition is correct: the issue is PURELY a data-source problem, not an architectural one.**

The repo splits cleanly into two groups:

| Group | Count | `names.ur` quality | Why |
|---|---:|---|---|
| **Hardcoded seeds** (no `sourceId`) | **581** | **100% real Urdu** ✓ | Manually reviewed at the time each row was added (CURATED-150-1 and early waves) |
| **GeoNames pipeline imports** (`sourceId: 'geonames:NNN'`) | **1,755** | **100% fillchain leftover** ✗ | `fillLangMap` filled `names.ur` with `names.en` during Stage 2 of every Strategy-E wave |

**Charikar shows "Charikar" on `/ur/` not because `_pickCuratedName` is broken, not because SSR is broken, but because the underlying `entry.names.ur` value is `"Charikar"` (a fillchain leftover from the GeoNames pipeline).** Mecca shows "مکہ" on `/ur/` because `entry.names.ur === "مکہ"` (the seed value). The same SSR and client code paths process both cases identically — the difference is the data.

**Architecture is fine. Data needs enrichment.**

---

## §1. Per-row data for the 9 sample cities

For each city, the row dump from `db/places/curated-places.json` at HEAD `6f54b5e`.

### ✓ Working: `makkah` (sa) — full localization

```json
{
  "slug": "makkah",
  "countryCode": "sa",
  "source": "curated",
  "sourceId": (none),
  "names": {
    "ar": "مكة المكرمة",
    "en": "Mecca",
    "fr": "La Mecque",
    "de": "Mekka",
    "tr": "Mekke",
    "ur": "مکہ",                    ← real Urdu with ہ heh-goal
    "id": "Mekkah",
    "es": "La Meca",
    "bn": "মক্কা",                    ← real Bengali script
    "ms": "Mekah"
  },
  "aliases": { "ar": ["مكة", "مكه"], "en": ["Makkah", "Mecca"] }
}
```

| Field | Value | Source |
|---|---|---|
| `names.ur` present? | ✓ `"مکہ"` | hardcoded seed |
| `names.ur === names.en`? | ✗ — `"مکہ"` ≠ `"Mecca"` | n/a |
| From GeoNames alias? | ✗ | n/a — `sourceId` is null |
| Hardcoded / old seed? | ✓ | one of the original CURATED-150 seeds |
| `fillLangMap` fallback? | ✗ | the row predates the GeoNames pipeline |
| Search / SSR / client value match? | ✓ all read the same `entry.names.ur === "مکہ"` |

### ✓ Working: `new-york` (us) — full localization

```json
"names": {
  "ar": "نيويورك",
  "en": "New York",
  "fr": "New York", "de": "New York", "tr": "New York",
  "ur": "نیویارک",                  ← real Urdu (ی + ا + ر + ک)
  "id": "New York",
  "es": "Nueva York",
  "bn": "নিউ ইয়র্ক",                  ← real Bengali
  "ms": "New York"
}
sourceId: (none)
```

Pattern: seed city, full localization, `sourceId` null.

### ✓ Working: `riyadh` (sa) — full localization

```json
"names": { "ar": "الرياض", "en": "Riyadh", "ur": "ریاض", "bn": "রিয়াদ", ... }
sourceId: (none)
```

### ✓ Working: `medina` (sa) — full localization (note: slug is `medina`, not `madinah`)

```json
"names": { "ar": "المدينة المنورة", "en": "Medina", "ur": "مدینہ منورہ", "bn": "মদিনা", ... }
aliases: { "ar": ["المدينة", "مدينة"], "en": ["Madinah", "Al Madinah"] }
sourceId: (none)
```

User-mentioned `madinah` is in the aliases — the canonical slug is `medina`.

### ✓ Working: `tehran` (ir) — full localization despite Iranian origin

```json
"names": { "ar": "طهران", "en": "Tehran", "ur": "تہران", ... }
sourceId: (none)
```

**Key insight**: Tehran was in the hardcoded seeds (NOT pulled via the ASIA-1G-IR pipeline that ran later). The pipeline imported many other Iranian cities (Karaj, Isfahan, Mashhad, Shiraz, etc.), but the 12 original IR seeds (Tehran, Mashhad, Isfahan, Shiraz, Tabriz, Qom, Ahvaz, Kermanshah, Rasht, Yazd, Kerman, Urmia) were already there from CURATED-150-1 era and kept their manual Urdu names.

---

### ✗ Broken: `charikar` (af) — fillchain leftover

```json
{
  "slug": "charikar",
  "countryCode": "af",
  "source": "curated",
  "sourceId": "geonames:1145352",   ← imported via Strategy-E pipeline
  "names": {
    "ar": "تشاريكار",
    "en": "Charikar",
    "fr": "Charikar",                ← Latin
    "de": "Charikar",                ← Latin
    "tr": "Charikar",                ← Latin
    "ur": "Charikar",                ← Latin ✗ should be چاریکار
    "id": "Charikar",                ← Latin
    "es": "Charikar",                ← Latin
    "bn": "Charikar",                ← Latin ✗ should be চারিকার
    "ms": "Charikar"                 ← Latin
  },
  "aliases": {
    "ar": ["جاريكار", "شاريكار"],
    "en": ["Caharikar","Carikar","Carikaras","Chaharikar","Chahārīkār","Chairkar","Charekar","Charikor","Chāirkār","Chārīkār","Czarikar", ... 26 variants]
  }
}
```

| Field | Value | Source |
|---|---|---|
| `names.ur` present? | ✓ `"Charikar"` | fillLangMap fallback |
| `names.ur === names.en`? | ✓ — both `"Charikar"` | **fillchain leftover** |
| From GeoNames alias? | ✗ — GeoNames had no `ur:`-tagged alias for charikar | n/a |
| Hardcoded / old seed? | ✗ — `sourceId: 'geonames:1145352'` shows pipeline import | n/a |
| `fillLangMap` fallback? | ✓ — Stage 2 `normalize_places.mjs:95` ran `fillLangMap({ar, en}, enName)` and filled all 8 other slots from `enName` | **the root cause** |
| Search / SSR / client value match? | ✓ all read `entry.names.ur === "Charikar"` and render it identically |

### ✗ Broken: `kandahar` (af) — fillchain leftover

```json
sourceId: "geonames:1138336"
names: { "ar": "قندهار", "en": "Kandahār", "ur": "Kandahār", "bn": "Kandahār", ... }
```

Same pattern. `names.ur` is the Latin fillchain leftover. Aliases contain 22 English variants but **zero Urdu-script alternatives** (the GeoNames AF dump simply doesn't carry `ur:`-tagged alternatenames).

### ✗ Broken: `pul-e-khumri` (af) — fillchain leftover

```json
sourceId: "geonames:1130490"
names: { "ar": "بول خمري", "en": "Pul-e Khumrī", "ur": "Pul-e Khumrī", ... }
```

Note: even the `names.ar` here is a mechanical transliteration (پل→بل from Stage 3.4 Persian pre-gate). The Urdu slot is just a copy of the English.

### ✗ Broken: `karaj` (ir) — fillchain leftover

```json
sourceId: "geonames:128747"
names: { "ar": "كرج", "en": "Karaj", "ur": "Karaj", "bn": "Karaj", ... }
```

Karaj is the most surprising example because Iran is otherwise well-localized — but Karaj came in via the ASIA-1G-IR wave (not in the original 12-IR seed), so it inherited the fillLangMap fillchain.

---

## §2. The exact split — repo-wide statistics

Run on HEAD `6f54b5e`:

```
Total curated rows:                 2,336
  Hardcoded seeds (sourceId null):    581 (24.9%)
  GeoNames pipeline imports:        1,755 (75.1%)

Of the 581 hardcoded seeds:
  with real names.ur (Arabic-script, != names.en):   581  (100.0%)
  with fillchain or empty:                              0  (  0.0%)

Of the 1,755 GeoNames imports:
  with real names.ur:                                   0  (  0.0%)
  with fillchain (names.ur === names.en):           1,755  (100.0%)
```

**Perfect 100/0 split.** Every hardcoded seed has a real Urdu name. Every GeoNames-imported row has a fillchain leftover.

This is not a probabilistic problem — it's a deterministic one. Every row from the GeoNames pipeline carries the fillLangMap leftover.

---

## §3. Comparison — working case vs broken case

### Working: `makkah` (seed)

End-to-end trace for `/ur/prayer-times-in-makkah`:

```
1. _findPlaceBySlug('makkah')           → returns the seed row
2. _pickCuratedName(row, 'ur')          → row.names.ur === 'مکہ' → returns 'مکہ'
3. _buildSlugLookupResult                → result.name = 'مکہ'
4. SSR injects: <meta name="ssr-city-name" content="مکہ">
5. SSR replaces #city-name div with: 'مکہ'
6. window.__PRAYER_CITY__.name = 'مکہ'
7. Browser paints: user sees مکہ (real Urdu)
8. app.js seeds currentCity = 'مکہ' from __PRAYER_CITY__
9. _syncCityNameInDom: ssrName='مکہ', goodName='مکہ' → equal, early return → no replacement
10. Final user-visible: مکہ ✓
```

### Broken: `charikar` (pipeline)

Same trace for `/ur/prayer-times-in-charikar`:

```
1. _findPlaceBySlug('charikar')         → returns the pipeline row
2. _pickCuratedName(row, 'ur')          → row.names.ur === 'Charikar' → returns 'Charikar'
3. _buildSlugLookupResult                → result.name = 'Charikar'
4. SSR injects: <meta name="ssr-city-name" content="Charikar">
5. SSR replaces #city-name div with: 'Charikar'
6. window.__PRAYER_CITY__.name = 'Charikar'
7. Browser paints: user sees "Charikar" (Latin) ✗
8. app.js seeds currentCity = 'Charikar'
9. _syncCityNameInDom: ssrName='Charikar', goodName='Charikar' → equal, early return → no replacement
10. Final user-visible: Charikar ✗
```

**The two flows are byte-for-byte identical in logic.** The only difference is the value at step 2 — `'مکہ'` (real Urdu) vs `'Charikar'` (fillchain leftover). The architecture handles both identically.

---

## §4. Why the seeds have real names — and the pipeline doesn't

### Seeds: the 581 cities added before the GeoNames pipeline

The original curated database was built city-by-city through manual review. Each row was hand-typed with full per-lang translations:
- CURATED-150-1 (the original 150 cities)
- ARAB-COMPLETE-1 (+61 Arab cities)
- WORLD-EXP-WAVE-1 (+111 world cities)
- SAUDI-COMPLETE-1 (+86 SA cities)
- SAUDI-FULL-1 (+51 SA cities)
- A small set of CURATED-SA-GEODATA-IMPORT-1 seeds for SA

These were entered with their actual Urdu Wikipedia titles, French exonyms (`La Mecque`, `La Meca`, `Le Caire`, `Londres`, `Nueva York`), German exonyms (`Mekka`, `München`), Turkish exonyms (`Mekke`, `İstanbul`, `Kahire`), Bengali (`মক্কা`, `নিউ ইয়র্ক`), and so on. The names are **stored, reviewed, manual**.

### GeoNames pipeline: the 1,755 cities added since CURATED-GEODATA-GCC-1

Once `fillLangMap` was introduced (and `Stage 2 normalize_places.mjs` started using it), every imported row got:
- `names.ar` extracted from GeoNames `ar:`-tagged alternatenames (or untagged Arabic)
- `names.en` from the GeoNames primary name
- All 8 other slots: **filled from `names.en`** by `fillLangMap`

The GeoNames AF dump, the IR dump, and most country dumps do NOT carry `ur:`/`bn:`/`fr:`/`de:`/etc. tagged alternatenames for smaller cities. So when normalize_places.mjs called `fillLangMap({ ar, en }, enName)`, all other lang slots became Latin copies of the English name.

**This is consistent and deterministic.** Every wave that has run produces fillchain rows for all non-en/non-ar lang slots, with very few exceptions (the rare city that happens to have a `<lang>:`-tagged GeoNames alternatename in the matching script).

---

## §5. Other languages — same pattern

The fillchain pattern is identical for `bn`, `fr`, `de`, `es`, `tr`, `id`, `ms`. Sampling:

| Lang | Sample working row (seed) | Sample broken row (pipeline) |
|---|---|---|
| `bn` | `makkah` → `"মক্কা"` | `charikar` → `"Charikar"` |
| `fr` | `makkah` → `"La Mecque"` | `charikar` → `"Charikar"` |
| `de` | `makkah` → `"Mekka"` | `charikar` → `"Charikar"` |
| `es` | `makkah` → `"La Meca"` | `charikar` → `"Charikar"` |
| `tr` | `makkah` → `"Mekke"` | `charikar` → `"Charikar"` |
| `id` | `makkah` → `"Mekkah"` | `charikar` → `"Charikar"` |
| `ms` | `makkah` → `"Mekah"` | `charikar` → `"Charikar"` |

The hard cut at the seed-vs-pipeline boundary holds for ALL 8 non-en/non-ar languages.

**Why this matters for prioritization**:
- For `ur`/`bn` (non-Latin script langs): the Latin fillchain is JARRING — readers see Latin where they expect Nasta'liq or Bengali script. **High priority.**
- For `fr`/`de`/`es`/`tr`/`id`/`ms` (Latin-script langs): the Latin fillchain is INVISIBLE to most users — `Charikar` rendered on `/fr/charikar` looks the same as `Charikar` on `/en/charikar`. The data is "wrong" technically but the visual rendering is acceptable. **Low priority for end-user; higher priority for SEO accuracy.**

---

## §6. The 9-city audit summary

| slug | cc | sourceId | `names.ur` | === `names.en`? | Real Urdu? |
|---|---|---|---|:-:|:-:|
| `makkah` | sa | (none) | `مکہ` | ✗ | ✓ seed |
| `new-york` | us | (none) | `نیویارک` | ✗ | ✓ seed |
| `riyadh` | sa | (none) | `ریاض` | ✗ | ✓ seed |
| `medina` | sa | (none) | `مدینہ منورہ` | ✗ | ✓ seed |
| `tehran` | ir | (none) | `تہران` | ✗ | ✓ seed |
| `charikar` | af | `geonames:1145352` | `Charikar` | ✓ | ✗ fillchain |
| `kandahar` | af | `geonames:1138336` | `Kandahār` | ✓ | ✗ fillchain |
| `pul-e-khumri` | af | `geonames:1130490` | `Pul-e Khumrī` | ✓ | ✗ fillchain |
| `karaj` | ir | `geonames:128747` | `Karaj` | ✓ | ✗ fillchain |

**The diagnostic is binary and 100% predictive of behavior.**

---

## §7. Architectural verdict

The architecture is **correct and consistent**. To re-state:

1. ✓ `_pickCuratedName(entry, lang)` correctly returns `entry.names[lang]` when present. It doesn't and shouldn't try to verify "is this a real translation or a Latin leftover" — that's a data-quality concern, not a name-resolution concern.
2. ✓ `_buildSlugLookupResult` correctly passes the resolved name through to the API/SSR layer.
3. ✓ SSR pre-fill renders whatever `_pickCuratedName` returns.
4. ✓ Client-side `_syncCityNameInDom` correctly matches SSR (no overwrite when values agree).
5. ✓ For the 581 seed cities, the user sees real per-lang translations.
6. ✗ For the 1,755 pipeline cities, the user sees Latin English in 8 non-en/non-ar lang slots.

**The fix is data, not code.**

---

## §8. The minimum-viable solution

### 8a. Stop the bleed (4-line code change, one-time)

Modify `scripts/geodata/_geonames_common.mjs::fillLangMap` so future waves no longer cascade English into 8 lang slots:

```js
// scripts/geodata/_geonames_common.mjs (proposed change)
export function fillLangMap(partial, fallback) {
    const out = {};
    out.en = (partial && partial.en) ? partial.en : fallback;
    if (partial && partial.ar) out.ar = partial.ar;
    for (const l of SUPPORTED_LANGS) {
        if (l === 'en' || l === 'ar') continue;
        if (partial && partial[l]) out[l] = partial[l];
    }
    return out;
}
```

After this change, every NEW wave produces rows with only `names.en` + (if available) `names.ar`. No more fillchain rows added.

**The current 1,755 existing fillchain rows are NOT affected by this change.** They keep showing Latin until enriched OR overwritten.

### 8b. Bulk Urdu enrichment for the 1,755 pipeline cities (gradual, per-country batches)

For each country, replace the fillchain `names.ur === names.en` rows with real Urdu, using the same pattern as `PLACE-NAMES-UR-AF-1` (which was rolled back but provided a working template):

| Batch | Country | Estimated rows | Priority |
|---|---|---:|---|
| ur-af | Afghanistan | 36 | high (user explicitly flagged charikar) |
| ur-ir | Iran (pipeline imports only — 12 IR seeds already done) | 41 | high (Persian → Urdu is direct) |
| ur-pk | Pakistan (pipeline imports — 10 PK seeds done) | varies | high (native Urdu market) |
| ur-in | India (pipeline imports — 18 IN seeds done) | varies | high (Urdu minority) |
| ur-bd | Bangladesh (similar) | varies | medium |
| ur-tr | Turkey (pipeline imports) | varies | low |
| ... | other countries | varies | low |

**Each batch is independent.** Charikar can be enriched without touching Tehran. The 581 seed cities stay as they are.

### 8c. No absence-state UI needed

Because the current fillchain shows `Charikar` (the English transliteration), the user gets a usable-but-imperfect result for the 1,755 unenriched cities. Once we enrich a batch, those rows flip to real Urdu. The other 1,755 - batch-size keep showing Latin until their turn. No special "name unavailable" UI required.

This is the key insight that makes the rolled-back complexity unnecessary. The previous L10N foundation work introduced:
- Absence-state markup (`<span class="city-name-absence-label">`)
- `_pickCuratedNameWithSource` source-aware resolver
- Per-lang absence labels constant
- CSS for the absence state
- `<meta name="ssr-city-name-source">` injection

**All of that was solving the problem from the wrong end.** The problem is that the DATA has Latin where it should have Urdu. Fix the data, and the existing code naturally renders correctly.

The only architectural change really needed is the 4-line `fillLangMap` redesign to stop future bleed. Everything else is data enrichment.

---

## §9. Recommendation

**A + B + D combined.**

- **A**: confirms the SYMPTOM — the problem is restricted to the 1,755 pipeline-imported cities that lack real `names.ur`.
- **B**: identifies the MECHANISM — `fillLangMap` in `scripts/geodata/_geonames_common.mjs:396` cascades English into all 10 lang slots during Stage 2 of every wave.
- **D**: prescribes the CURE — batch Urdu enrichment for the 1,755 missing cities, country-by-country, using GeoNames `<lang>:` alternatenames when available + manual review for the rest.

**Not C** (SSR/client is not the problem).
**Not E** (no wider architectural change needed; the 4-line `fillLangMap` fix is the only code touch required).

### The cleanest sequence (when user is ready)

```
Step 1 — fix the bleed (4 lines)
  → Change fillLangMap so future waves don't add new fillchain rows.
  → 0 data changes. Reversible. Tests stay green.

Step 2 — enrich Urdu batch by batch (each one independent)
  → Start with af (36 rows) — already proven workflow from the rolled-back PLACE-NAMES-UR-AF-1.
  → Then ir-pipeline-only (41 rows — the 41 cities added since ASIA-1G-IR; the original 12 IR seeds already have real Urdu).
  → Then pk/in/bd (smaller batches).
  → Other countries as priority dictates.

Step 3 — Bengali batch enrichment (same pattern, lower priority)

Step 4 (optional, later) — Latin-script langs (fr/de/es/tr/id/ms) for famous-city exonyms
  → ~50 cities per lang (Mekke / Le Caire / München / Londres / etc.)
  → Low user-visibility impact since Latin fallback is acceptable for these langs.
```

**No client-side guard extension needed.** The reason `PT-LANG-GUARD-1-EXTEND-UR-BN` was proposed in the earlier audit was to protect absence-state markup from client overwrite. If we don't render absence-state markup, there's nothing to protect — `_syncCityNameInDom` already handles the case correctly (Latin === Latin → no replacement; real Urdu === real Urdu → no replacement).

---

## §10. What this audit did NOT do

- ❌ NO changes to `server.js`
- ❌ NO changes to `js/app.js`
- ❌ NO changes to `index.html`
- ❌ NO changes to `css/style.css`
- ❌ NO changes to `db/places/curated-places.json`
- ❌ NO changes to `scripts/geodata/_geonames_common.mjs`
- ❌ NO L10N fix shipped
- ❌ NO phase opened

```
$ git diff server.js js/app.js index.html css/style.css db/places/curated-places.json scripts/geodata/_geonames_common.mjs
(empty — workspace clean at HEAD 6f54b5e)
```

---

**Decision points for the user**:

- **A — confirms the diagnosis**: only the 1,755 pipeline cities are affected. **Verified by the data.**
- **B — confirms the mechanism**: `fillLangMap` is the root cause. **Verified by the code at `_geonames_common.mjs:396`.**
- **D — confirms the cure**: batch Urdu enrichment for the missing cities (using GeoNames alternatenames where available + manual review for gaps). **Proven pattern from the rolled-back PLACE-NAMES-UR-AF-1.**

If you approve, the immediate next step is the 4-line `fillLangMap` fix (Step 1) — independent of any later enrichment work, no data risk, takes 5 minutes including tests.

**Until you decide: no execution.**
