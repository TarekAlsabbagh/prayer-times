# ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1 — Review Report

**Phase**: Review-only (no Stage 4, no curated mutation)
**Date**: 2026-05-18
**Wave parent**: `CURATED-GEODATA-ASIA-1G-AF` (closed `077c04c`)
**Scope**: 8 high-tier rows blocked by Stage 3.5 in the AF clean-merge run (all `mixed_latin` — romanized-Latin strings Stage 3.4 cannot synthesize Arabic from)

---

## Top-line

| Item | Value |
|---|---|
| Rows in scope | 8 |
| Total population | 654,861 |
| Largest deferral | `kandahar` (523,300) |
| Smallest | `parun` (1,000) |
| Bare-slug collisions in curated | **0** — all 8 slugs are free |
| Wave-internal collisions | **0** |
| Slug renames needed | **0** |
| name.ar manual fixes needed | **8** (every row — `mixed_latin` cleanup) |
| Already-present aliases that match the proposed name | **8 of 8** (we just need to promote alias → name.ar) |

**Key observation:** Every row already carries a clean-Arabic alternative *as an alias* in the GeoNames `aliases.ar[]` (because the Arabic Wikipedia translit appears as an alternatename alongside the broken Latin-romanization). The MCF script can therefore **promote alias → name.ar** for every row — no manual transcription required from scratch. We only need user approval on which alias to promote for the 2 rows where multiple clean options exist (`lashkar-gah`, `tarinkot`).

---

## Detailed review — 8 rows

### 1. `kandahar` (PPLA, 523,300) — **largest deferral, user-priority**

| Field | Value |
|---|---|
| slug | `kandahar` |
| countryCode | `af` |
| name.ar **current** | `qndهar` (Latin "qnd" + ه + Latin "ar") |
| name.ar **proposed** | **`قندهار`** |
| name.en | Kandahār |
| population | 523,300 |
| feature_code | PPLA |
| timezone | Asia/Kabul |
| Stage 3.5 verdict | `mixed_latin — contains Latin letters` |
| Why was it blocked? | GeoNames `name` field is a Latin-Arabic mojibake (`qndهar`). Stage 3.4 cleans residual letters but cannot synthesize Arabic from Latin transliteration. |
| collisionInWave | false |
| collisionAgainstCurated | none |
| Bare slug `kandahar` in curated | **free** |
| Suffix-slugs (`kandahar-*`) | none |
| **Final proposed slug** | **`kandahar`** (bare) |
| Rename needed? | **No** |
| Source of proposed Arabic | Already present in `aliases.ar` as `قندهار` (alongside variant `كندهار`) |
| Aliases to keep after merge | `قندهار` (becomes name.ar — dedup) + `كندهار` (k-variant, kept) |

User direction: `kandahar → قندهار` ✓ Aligns with the alias already in GeoNames data and Arabic Wikipedia canonical.

---

### 2. `lashkar-gah` (PPLA, 43,934) — **needs user choice between 3 variants**

| Field | Value |
|---|---|
| slug | `lashkar-gah` |
| countryCode | `af` |
| name.ar **current** | `lshkrgaه` (full Latin romanization + ه) |
| name.ar **proposed (variant A — clean Arabic, available as alias)** | **`لشكر غاه`** ← present in aliases |
| name.ar **proposed (variant B — Arabic Wikipedia convention)** | `لشكر جاه` |
| name.ar **proposed (variant C — Persian original, would FAIL Stage 3.5)** | `لشكر گاه` ✗ (Persian گ blocked) |
| name.en | Lashkar Gāh |
| population | 43,934 |
| feature_code | PPLA |
| timezone | Asia/Kabul |
| Stage 3.5 verdict | `mixed_latin — contains Latin letters` |
| Why was it blocked? | GeoNames `name` is `lshkrgaہ` (Latin + Urdu ہ). Stage 3.4 cleaned ہ→ه but Latin remained. |
| collisionInWave | false |
| collisionAgainstCurated | none |
| Bare slug `lashkar-gah` in curated | **free** |
| **Final proposed slug** | **`lashkar-gah`** (bare) |
| Rename needed? | **No** |
| Aliases already present (Arabic) | `لشكر غاه`, `لشكرغاه`, `لشكرغاه بسټ` (last one has Pashto ټ — would be dropped by clean-check) |

**Comparison of 3 variants:**

| Variant | meaning | Arabic Wikipedia uses it? | Stage 3.5 passes? | recommendation |
|---|---|:-:|:-:|---|
| `لشكر غاه` | "Lashkar Ghāh" — mechanical غ default for گ | partially (some sources) | ✓ | safe machine default |
| `لشكر جاه` | "Lashkar Jāh" — "جاه" means "rank/status" in Arabic; established convention | **yes** (canonical AR Wikipedia title) | ✓ | recommended per established AR convention |
| `لشكر گاه` | "Lashkar Gāh" (Persian گاه=place) | yes (some sources) | ✗ | ✗ blocked by Stage 3.5 |

**🚨 User choice required**: A (`لشكر غاه`), B (`لشكر جاه`), or C (`لشكر گاه` — would require widening Stage 3.5's regex).

---

### 3. `farah` (PPLA, 43,561) — **user-suggested, simple**

| Field | Value |
|---|---|
| slug | `farah` |
| countryCode | `af` |
| name.ar **current** | `fraه` |
| name.ar **proposed** | **`فراه`** |
| name.en | Farah |
| population | 43,561 |
| feature_code | PPLA |
| timezone | Asia/Kabul |
| Stage 3.5 verdict | `mixed_latin — contains Latin letters` |
| Why was it blocked? | Latin "fra" + ه. |
| collisionInWave | false |
| collisionAgainstCurated | none |
| Bare slug `farah` in curated | **free** |
| **Final proposed slug** | **`farah`** (bare) |
| Rename needed? | **No** |
| Source of proposed Arabic | Already present in `aliases.ar` as `فراه` |

User direction: `farah → فراه` ✓ Confirmed by alias.

---

### 4. `fayroz-koh` (PPLA, 15,000) — **user-suggested; note historical name**

| Field | Value |
|---|---|
| slug | `fayroz-koh` |
| countryCode | `af` |
| name.ar **current** | `fyrwz kwه` |
| name.ar **proposed** | **`فيروز كوه`** |
| name.en | Fayrōz Kōh |
| population | 15,000 |
| feature_code | PPLA |
| timezone | Asia/Kabul |
| Stage 3.5 verdict | `mixed_latin — contains Latin letters` |
| Why was it blocked? | Latin "fyrwz kw" + ه. |
| collisionInWave | false |
| collisionAgainstCurated | none |
| Bare slug `fayroz-koh` in curated | **free** |
| **Final proposed slug** | **`fayroz-koh`** (bare) |
| Rename needed? | **No** |
| Source of proposed Arabic | Already present in `aliases.ar` as `فيروز كوه` |
| Aliases to keep | `فيروز كوه` (→ name.ar) + `جغجران` (historical name "Chaghcharan", renamed to Fayroz Koh in 2014 by the Afghan government — useful for search continuity) |

User direction: `fayroz-koh → فيروز كوه` ✓ Confirmed by alias.

---

### 5. `tarinkot` (PPLA, 10,000) — **needs user choice between 2 variants**

| Field | Value |
|---|---|
| slug | `tarinkot` |
| countryCode | `af` |
| name.ar **current** | `tryn kwت` |
| name.ar **proposed (variant A — recommended)** | **`ترين كوت`** |
| name.ar **proposed (variant B — alternative with ط)** | `طرين كوت` |
| name.en | Tarinkot |
| population | 10,000 |
| feature_code | PPLA |
| timezone | Asia/Kabul |
| Stage 3.5 verdict | `mixed_latin — contains Latin letters` |
| Why was it blocked? | Latin "tryn kw" + ت. |
| collisionInWave | false |
| collisionAgainstCurated | none |
| Bare slug `tarinkot` in curated | **free** |
| **Final proposed slug** | **`tarinkot`** (bare) |
| Rename needed? | **No** |
| Aliases already present (Arabic) | `ترين كوت`, `طرين كوت` |

**🚨 User choice**: A (`ترين كوت` — standard ت, matches "Tareen" romanization) or B (`طرين كوت` — emphatic ط, less common transliteration). Recommendation: **A**. Either way, both can co-exist (one as name.ar, the other as alias).

---

### 6. `qala-i-naw` (PPLA, 9,000) — **user-suggested; 4 alias variants**

| Field | Value |
|---|---|
| slug | `qala-i-naw` |
| countryCode | `af` |
| name.ar **current** | `qlʿه naw` (Latin + ʿ + ه + Latin) |
| name.ar **proposed** | **`قلعة نو`** (user's pick) |
| name.en | Qala i Naw |
| population | 9,000 |
| feature_code | PPLA |
| timezone | Asia/Kabul |
| Stage 3.5 verdict | `mixed_latin — contains Latin letters` |
| Why was it blocked? | Latin "qlʿ" + ه + Latin "naw". |
| collisionInWave | false |
| collisionAgainstCurated | none |
| Bare slug `qala-i-naw` in curated | **free** |
| **Final proposed slug** | **`qala-i-naw`** (bare) |
| Rename needed? | **No** |
| Source of proposed Arabic | Already present in `aliases.ar` as `قلعة نو` (alongside variants `قلعة ناو`, `قلعه ناو`, `قلعه نو`, `قلعه ناؤ`) |
| Aliases to keep after merge | All 4 clean-Arabic variants kept as aliases (`قلعة ناو`, `قلعه ناو`, `قلعه نو`, `قلعه ناؤ`) — useful for diverse search spellings |

User direction: `qala-i-naw → قلعة نو` ✓ Confirmed by alias.

---

### 7. `maydanshakhr` (PPLA, 1,600) — **PPLA but very small**

| Field | Value |
|---|---|
| slug | `maydanshakhr` |
| countryCode | `af` |
| name.ar **current** | `mydan shهr` |
| name.ar **proposed** | **`ميدان شهر`** |
| name.en | Maydanshakhr |
| population | 1,600 |
| feature_code | PPLA |
| timezone | Asia/Kabul |
| Stage 3.5 verdict | `mixed_latin — contains Latin letters` |
| Why was it blocked? | Latin "mydan sh" + ه + Latin "r". |
| collisionInWave | false |
| collisionAgainstCurated | none |
| Bare slug `maydanshakhr` in curated | **free** |
| **Final proposed slug** | **`maydanshakhr`** (bare) |
| Rename needed? | **No** |
| Source of proposed Arabic | Already present in `aliases.ar` as `ميدان شهر` |
| Note | Also known as "Maidan Wardak" or "Maidan-Shahr". Province capital of Wardak (vs the city name Maydanshakhr/Maidan Shahr). |

Proposed: `maydanshakhr → ميدان شهر` — uses the alias already present.

---

### 8. `parun` (PPLA, 1,000) — **smallest, capital of Nuristan**

| Field | Value |
|---|---|
| slug | `parun` |
| countryCode | `af` |
| name.ar **current** | `barwں` (Latin + Urdu ں) |
| name.ar **proposed** | **`بارون`** |
| name.en | Pārūn |
| population | 1,000 |
| feature_code | PPLA |
| timezone | Asia/Kabul |
| Stage 3.5 verdict | `mixed_latin — contains Latin letters` |
| Why was it blocked? | Latin "barw" + Urdu ں (noon ghunna, U+06BA — not in PERSIAN_CHAR_MAP). |
| collisionInWave | false |
| collisionAgainstCurated | none |
| Bare slug `parun` in curated | **free** |
| **Final proposed slug** | **`parun`** (bare) |
| Rename needed? | **No** |
| Source of proposed Arabic | Already present in `aliases.ar` as `بارون` (alongside `باروں` (Urdu — would be dropped) and `برنس`) |
| Note | The proposed `بارون` uses the standard ب-ا-ر-و-ن transliteration. Persian "پارون" (with پ) would also be authentic but would FAIL Stage 3.5. The user noted "پارون?" in their direction with a question mark — I recommend `بارون` (the clean Arabic alias already present). |

Proposed: `parun → بارون` (uses the alias already in data; Persian form would fail the gate).

---

## Slug strategy summary

| slug | curated bare-owner | wave-collision | suffix-slugs | rename needed | final slug |
|---|:-:|:-:|---|:-:|---|
| `kandahar` | free | none | none | **no** | `kandahar` (bare) |
| `lashkar-gah` | free | none | none | **no** | `lashkar-gah` (bare) |
| `farah` | free | none | none | **no** | `farah` (bare) |
| `fayroz-koh` | free | none | none | **no** | `fayroz-koh` (bare) |
| `tarinkot` | free | none | none | **no** | `tarinkot` (bare) |
| `qala-i-naw` | free | none | none | **no** | `qala-i-naw` (bare) |
| `maydanshakhr` | free | none | none | **no** | `maydanshakhr` (bare) |
| `parun` | free | none | none | **no** | `parun` (bare) |

**All 8 use bare slugs. 0 renames. No collision overrides needed.**

---

## Aliases to preserve after merge

Each row's existing clean-Arabic aliases (other than the chosen name.ar) should be retained for search continuity:

| slug | name.ar (proposed) | aliases.ar to keep |
|---|---|---|
| `kandahar` | قندهار | `كندهار` |
| `lashkar-gah` | (A) `لشكر غاه` OR (B) `لشكر جاه` | the unchosen variants + `لشكرغاه` (no-space form) |
| `farah` | فراه | _(no other clean Arabic aliases)_ |
| `fayroz-koh` | فيروز كوه | `جغجران` (historical name "Chaghcharan") |
| `tarinkot` | (A) `ترين كوت` OR (B) `طرين كوت` | the unchosen variant |
| `qala-i-naw` | قلعة نو | `قلعة ناو`, `قلعه ناو`, `قلعه نو` (different he), `قلعه ناؤ` |
| `maydanshakhr` | ميدان شهر | _(no other clean Arabic aliases)_ |
| `parun` | بارون | `برنس` (older name? — accept if user confirms; otherwise drop) |

Polluted aliases that will be dropped automatically by the approve script (Persian/Urdu/Latin residuals):
- `lashkar-gah`: `لشكرغاه بسټ` (Pashto ټ)
- `qala-i-naw`: `qlʿە nw` (Latin + Kurdish ە)
- `parun`: `parwں`, `باروں` (Latin / Urdu ں)

---

## Recommended decision matrix

| Aspect | Recommendation | Notes |
|---|---|---|
| `kandahar` | **approve `قندهار`** | user pre-approved; already an alias |
| `lashkar-gah` | **user choice A vs B** | A=`لشكر غاه` (machine-default), B=`لشكر جاه` (AR Wikipedia canonical) |
| `farah` | **approve `فراه`** | user pre-approved; already an alias |
| `fayroz-koh` | **approve `فيروز كوه`** | user pre-approved; already an alias |
| `tarinkot` | **user choice A vs B** | A=`ترين كوت` (ت, recommended), B=`طرين كوت` (ط) |
| `qala-i-naw` | **approve `قلعة نو`** | user pre-approved; already an alias |
| `maydanshakhr` | **approve `ميدان شهر`** | already an alias; matches Arabic Wikipedia |
| `parun` | **approve `بارون`** | clean Arabic; user wrote `پارون?` with question mark — Persian form would fail Stage 3.5 |

Items requiring user choice: **2** (`lashkar-gah` and `tarinkot`).

Items pre-approved and ready: **6** (`kandahar`, `farah`, `fayroz-koh`, `qala-i-naw`, `maydanshakhr`, `parun`).

---

## What happens after user approval

When user confirms the 2 choices (`lashkar-gah` + `tarinkot`) and approves the 6 pre-approved rows:

1. Build `scripts/geodata/_asia_1g_af_blocked_major_cities_approve.mjs` with explicit `NAME_AR_FIXES`:
   ```js
   const NAME_AR_FIXES = {
       'kandahar':     'قندهار',
       'lashkar-gah':  '<user choice>',
       'farah':        'فراه',
       'fayroz-koh':   'فيروز كوه',
       'tarinkot':     '<user choice>',
       'qala-i-naw':   'قلعة نو',
       'maydanshakhr': 'ميدان شهر',
       'parun':        'بارون',
   };
   ```
2. Set `status='approved'` on each of the 8 rows in `af-geonames-candidates.json`, after applying NAME_AR_FIXES.
3. Drop polluted aliases (Latin / Persian / Urdu residuals). Keep clean Arabic aliases.
4. Run `apply_curated_candidates.mjs af` to merge into `curated-places.json`. Expected: 2,328 → 2,336 (+8).
5. Smoke test: 8 user-flagged Arabic + 8 English + critical NAME_AR_FIX checks (especially `قندهار → af/kandahar`).
6. Carry-forward regression suites (Stage 3.4 fixture, ASIA-1G-IR, ASIA-1H-MCF kg/manas critical).
7. Commit + push + memory update.

**No Stage 4 yet. Awaiting user approval on 2 choices.**

---

## Decision request

Please confirm:

1. **`lashkar-gah` → ?** (choose A `لشكر غاه` / B `لشكر جاه` / C `لشكر گاه` would require widening Stage 3.5 regex)
2. **`tarinkot` → ?** (choose A `ترين كوت` / B `طرين كوت`)
3. **OK to proceed with the 6 pre-approved rows as listed?** (`kandahar`, `farah`, `fayroz-koh`, `qala-i-naw`, `maydanshakhr`, `parun`)
4. **OK to drop the polluted aliases as listed?**

After your approval, I will build the approve script + run Stage 4 + tests + commit + close.

**No merge until you reply.**
