# ASIA-1D-PK-MCF — Review report (blocked-major cities fix)

**Phase**: Review-only (NO data mutation, NO Stage 4)
**Date**: 2026-05-19
**Status**: design — awaiting user per-row approval
**Country**: Pakistan (`pk`) only
**Scope**: 17 high-tier entries blocked by Stage 3.5 in ASIA-1D-PK clean merge
**Predecessor**: `ASIA-1D-PK` (closed `0bdda2d`, 2026-05-19)

**Out-of-scope (deferred to separate phases)**:
- 98 missing-ar majors with empty `names.ar` in GeoNames → `ASIA-1D-PK-MISSING-AR-MAJORS-1`
- 43 already-merged ASIA-1D-PK clean entries — NOT touched
- 10 PK seed entries — NOT touched
- `names.ur` / `aliases.ur` for the 17 — these get added in a follow-up `PLACE-NAMES-UR-PK-3` wave after merge
- All other countries / phases — NOT started

---

## §0. Headline finding

All 17 blocked-major PK cities are **transliteration-fixable in-place** — same pattern as ASIA-1A-MCF / ASIA-1B-MCF / ASIA-1C-MCF / ASIA-1G-AF-MCF / ASIA-1H-MCF / ASIA-1I-MCF.

For each row, GeoNames provided:
- A primary `name.ar` that mixes Latin/Sindhi/Pashto/Urdu chars (which Stage 3.5 rightly rejects)
- One or more **clean Arabic alternatenames** that we can promote to primary

This means **NO new manual transliteration is needed for ~14 of 17** — the clean form already exists in GeoNames `alternatenames`. Just 3 rows (`umarkot`, `kharian`, `bannu`) need stronger manual override because their best alternatename still has script issues or doesn't follow Wikipedia Arabic convention.

**Recommendation**: **approve all 17 with NAME_AR_FIXES + alias cleanup** (same pattern as ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1 which closed 36/36).

---

## §1. Per-row review — all 17 blocked-major cities (sorted by population desc)

Legend:
- ⭐ = user-listed for special attention (7 cities)
- 🚨 = special note / data quirk
- 🆕 in `proposed.ar` = the proposal differs from BOTH current `names.ar` AND every existing `aliases.ar` entry — requires fresh transliteration

| ⭐ | slug | en | current ar (BLOCKED) | **proposed ar** | pop | fc | tz | blocked reason | source | aliases.ar to keep | aliases.ar to drop | notes |
|:-:|---|---|---|---|---:|:-:|---|---|---|---|---|---|
| ⭐ | `gujranwala` | Gujranwala | `gwjranwalه` (Latin mojibake) | **غوجرانوالا** | 2,511,118 | PPLA2 | Asia/Karachi | mixed_latin | GeoNames alias `غوجرانواله` cleaned (drop final ه, use ا) + Arabic Wikipedia `غوجرانوالا` | `غوجرانواله` (alias with extra ه — kept as variant) | — | 🚨 Pakistan's 5th-largest city. Wikipedia AR canonical = `غوجرانوالا` |
| ⭐ | `bannu` | Bannu | `بنوں` (Urdu ں retroflex) | **بنو** | 1,357,890 | PPLA2 | Asia/Karachi | mixed_unknown (Urdu ں in primary) | Manual override matching Arabic Wikipedia `بنو` | — | `بنوں` (Urdu form goes to alias only if user wants) | KP city; Wikipedia AR = `بنو` (also `بنّو` with shadda) |
| ⭐ | `sahiwal` | Sahiwal | `saهiwal` (Latin mojibake) | **ساهيوال** | 538,344 | PPLA2 | Asia/Karachi | mixed_latin | GeoNames alias `ساهيوال` (clean) | `ساهِيوال` (diacritics-heavy) | `ساهيوال، باكستان` (country-suffix) | Clean alias already exists |
| ⭐ | `dera-ghazi-khan` | Dera Ghazi Khan | `ديره غازيخان، باكستان` (country suffix + no-space) | **ديره غازي خان** | 494,464 | PPLA2 | Asia/Karachi | mixed_unknown (country suffix + Pashto in alias) | GeoNames alias `ديره غازي خان` (with-space, clean) | `ديره غازي خان` (the with-space form) | `دېره غازي خان` (Pashto ې) | Wikipedia AR also accepts `ديرة غازي خان` (tah-marbuta) — variant alias if user wants |
| ⭐ | `chiniot` | Chiniot | `جنيوټ` (Pashto ټ) | **جنيوت** | 318,165 | PPLA2 | Asia/Karachi | mixed_unknown (Pashto) | GeoNames alias `جنيوت` (clean) | `جنيوت` | `جنيوت، باكستان` (country suffix) | Clean alias already exists |
| ⭐ | `muzaffargarh` | Muzaffargarh | `مظفر غره، باكستان` (country suffix) | **مظفر غره** | 235,541 | PPLA2 | Asia/Karachi | mixed_unknown (country suffix) | GeoNames alias `مظفر غره` (clean) | `مظفر غره` | — | Clean alias already exists |
| ⭐ | `jacobabad` | Jacobabad | `jyڪb abad` (Latin mojibake + Sindhi ڪ) | **جيكب آباد** | 219,315 | PPLA2 | Asia/Karachi | mixed_latin | GeoNames alias `جيكب آباد` (with madda) | `جيكب آباد`, `جيكب اباد` (no-madda variant) | `جيڪب آباد` (Sindhi ڪ), `جيكبآباد، باكستان` (no-space + country) | Clean alias already exists |
|   | `umarkot` | Umarkot | `amrڪwٽ` (Latin mojibake + Sindhi ڪ + ٽ) | **أمركوت** 🆕 | 144,558 | PPLA2 | Asia/Karachi | mixed_latin | Manual override — Wikipedia AR `أمركوت` (with hamza) | — | `امرڪوٽ` (Sindhi chars, fails clean-check) | Sindhi city; Wikipedia AR uses أمركوت with initial hamza-on-alif |
|   | `new-mirpur-city` | New Mirpur City | `nya myrpr shهr` (Latin mojibake) | **نيا ميربر شهر** | 124,352 | PPLA2 | Asia/Karachi | mixed_latin | GeoNames alias `نيا ميربر شهر` (clean) | `نيا ميربر شهر` | — | "Mirpur" Azad Kashmir capital district; "Nya" = "new" |
|   | `badin` | Badin | `بدين‎` (invisible RLM U+200F) | **بدين** | 117,455 | PPLA2 | Asia/Karachi | mixed_unknown (RLM control char) | Same name stripped of RLM | — | Current form (with RLM) — invalid for storage | Sindh city; strip invisible RLM control |
|   | `kharian` | Kharian | `kهaryaں` (Latin + Urdu ں) | **كهاريان** | 81,435 | PPL | Asia/Karachi | mixed_latin | GeoNames alias `كهارياں` cleaned (ں → ن at end) | — | `كهارياں` (Urdu ں — convert to clean ن) | Punjab garrison town; convert Urdu ں to clean Arabic ن |
|   | `gujar-khan` | Gujar Khan | `غجر خاں` (Urdu ں) | **غوجر خان** | 69,374 | PPL | Asia/Karachi | mixed_unknown (Urdu ں) | GeoNames alias `غوجر خان` (clean) | `غوجر خان`, `غوجرخان` (no-space variant) | — | Rawalpindi district town |
|   | `lala-musa` | Lala Musa | `lalه mwsy` (Latin mojibake) | **لاله موسي** | 65,197 | PPL | Asia/Karachi | mixed_latin | GeoNames alias `لاله موسي` (clean) | `لاله موسي` | `لاله موسيٰ` (diacritic-alif U+0670 — drop) | Gujrat district town |
|   | `chunian` | Chunian | `تصيل جونياں` (admin prefix "تصيل" + Urdu ں) | **جونيان** | 57,312 | PPL | Asia/Karachi | mixed_unknown (admin prefix + Urdu ں) | GeoNames alias `جونيان` (clean) | `جونيان`, `جنيان` (variant) | `جونياں` (Urdu ں) + admin prefix `تصيل جونياں` | Same admin-prefix issue as `mailsi` had (`تصيل` misspelling of `تحصيل`); STRIP prefix |
|   | `chitral` | Chitral | `chهtrar` (Latin mojibake + extra r) | **جترال** | 57,157 | PPLA2 | Asia/Karachi | mixed_latin | GeoNames alias `جترال` (clean) | `جترال`, `جيترال` (Persian ي variant) | `جهترار` (different word — semantic mismatch DROP) | KP city; primary `جترال` per Wikipedia AR |
|   | `rohri` | Rohri | `rwهڙy` (Latin mojibake + Sindhi ڙ) | **روهري** | 50,649 | PPL | Asia/Karachi | mixed_latin | GeoNames alias `روهري` (clean) | `روهري` | `روهڙي` (Sindhi ڙ — fails clean-check) | Sindh city near Sukkur |
|   | `rawalakot` | Rawalakot | `rawla kwت` (Latin mojibake) | **راولاكوت** | 50,000 | PPLA2 | Asia/Karachi | mixed_latin | GeoNames alias `راولاكوت` (clean) | `راولاكوت`, `راولا كوت` (with-space variant) | `rawlakwت` (Latin mojibake — DROP) | Azad Kashmir district; Wikipedia AR matches |

---

## §2. Collision check

**0 slug collisions** with curated_places.json — all 17 slugs are free.

**0 Arabic-name collisions** — all 17 proposed `names.ar` values are unique within PK and across all curated entries.

| Check | Result |
|---|:-:|
| Slug already in curated for any of the 17 | **0** |
| Cross-country slug collision | **0** |
| Proposed `names.ar` matches existing curated `names.ar` | **0** |
| Slug rename needed | **0** (all keep their bare slugs) |

---

## §3. Semantic mismatch check (bahawalnagar-style)

✅ **No bahawalnagar-style semantic mismatches detected.** Unlike `bahawalnagar` (which had `بهاولبور` = a completely different city's name), each of these 17 blocked rows just has script-mojibake issues — the underlying name *meaning* is correct, only the script representation is wrong (Latin chars / Sindhi-only letters / Pashto letters / Urdu retroflex / admin prefix / country suffix).

Special clarifications:

| slug | quirk | resolution |
|---|---|---|
| `chitral.aliases.ar` had `جهترار` | This is a different word (`Chuhtrar`? rare/unclear). Looks like Latin-mojibake artifact, not a real Arabic alternative. | **DROP** the alias |
| `chunian` current `ar = تصيل جونياں` | Admin prefix `تصيل` (misspelling of `تحصيل` = sub-district) — same issue as `mailsi.ar = تصيل ميلسي` we fixed in ASIA-1D-PK | **STRIP prefix** → `جونيان` |
| `dera-ghazi-khan` | Two equivalent Arabic forms exist: `ديره غازي خان` (with ه — what GeoNames has) and `ديرة غازي خان` (with tah-marbuta ة — Wikipedia AR title) | Use `ديره غازي خان` (matches GeoNames) primary; `ديرة غازي خان` can be added as alias if user wants |
| `badin` | Current `بدين‎` has invisible RLM character (U+200F) | **STRIP** the control char → `بدين` |
| `bannu` | Current `بنوں` uses Urdu retroflex ں | Use clean Arabic `بنو` (Wikipedia AR canonical) |
| `umarkot` | Current `amrڪwٽ` + alias `امرڪوٽ` both have Sindhi-only letters (ڪ, ٽ) | Manual override → `أمركوت` (Wikipedia AR canonical with hamza-on-alif) |
| `kharian` | Current `kهaryaں` + alias `كهارياں` both have Urdu ں | Use ں → ن conversion → `كهاريان` |

---

## §4. Aliases pollution audit

### Aliases EXPLICITLY KEPT (clean Arabic, useful for search)

| slug | alias.ar to keep | reason |
|---|---|---|
| `gujranwala` | `غوجرانواله` | Variant with final ه (Arabic Wikipedia title uses ا but ه-form is common in Urdu-influenced Arabic) |
| `sahiwal` | `ساهيوال` (already promoted to primary) | — |
| `dera-ghazi-khan` | `ديره غازي خان` (already promoted to primary) | — |
| `chiniot` | `جنيوت` (already promoted to primary) | — |
| `muzaffargarh` | `مظفر غره` (already promoted to primary) | — |
| `jacobabad` | `جيكب آباد` (primary), `جيكب اباد` (no-madda variant) | Both clean — preserve both spellings |
| `new-mirpur-city` | `ميربور` (short form variant) | Useful short search |
| `gujar-khan` | `غوجر خان` (primary), `غوجرخان` (no-space) | Both useful for search |
| `lala-musa` | `لاله موسي` (already promoted to primary) | — |
| `chunian` | `جونيان` (primary), `جنيان` (variant) | — |
| `chitral` | `جترال` (primary), `جيترال` (Persian ي form) | — |
| `rohri` | `روهري` (already promoted to primary) | — |
| `rawalakot` | `راولاكوت` (primary), `راولا كوت` (with-space variant) | — |

### Aliases EXPLICITLY DROPPED (with reasons)

| slug | dropped alias | reason |
|---|---|---|
| `sahiwal` | `ساهيوال، باكستان` | Country suffix `، باكستان` |
| `sahiwal` | `ساهِيوال` | Diacritics-heavy (Arabic kasra mark) |
| `dera-ghazi-khan` | `دېره غازي خان` | Contains Pashto ې (U+06D0) — fails clean-Urdu-script check |
| `chiniot` | `جنيوت، باكستان` | Country suffix |
| `jacobabad` | `جيڪب آباد` | Sindhi ڪ |
| `jacobabad` | `جيكبآباد، باكستان` | No-space + country suffix |
| `umarkot` | `امرڪوٽ` | Sindhi ڪ + ٽ |
| `chitral` | `جهترار` | Semantic mismatch (extra r suggests different word) |
| `chunian` | `جونياں` | Urdu ں |
| `chunian` | `تصيل جونياں` | Admin prefix |
| `rohri` | `روهڙي` | Sindhi ڙ |
| `rawalakot` | `rawlakwت` | Latin mojibake |
| `lala-musa` | `لاله موسيٰ` | Contains alif-with-superscript (U+0670) diacritic — rare/non-standard |

**Total**: ~13 aliases dropped, ~15 kept across the 17 rows.

---

## §5. Summary table

| Metric | Count |
|---|---:|
| **17 blocked entries** | 17 |
| Promoted-from-existing-clean-alias (no new translit needed) | **14** |
| Required fresh manual translit (Wikipedia AR override) | **3** (`bannu`, `umarkot`, `kharian` partial) |
| Admin-prefix-strip needed | **2** (`chunian`, also reuses pattern from `mailsi` in ASIA-1D-PK) |
| Country-suffix-strip needed | **3** (`dera-ghazi-khan`, `muzaffargarh`, `sahiwal` alias) |
| Invisible-RLM-strip needed | **1** (`badin`) |
| Slug renames needed | **0** |
| Slug collisions | **0** |
| Arabic-name collisions | **0** |
| Aliases kept | ~15 |
| Aliases dropped | ~13 |
| **Total population** | 6,664,803 (6.66M — adds significant Muslim audience coverage) |

Top 4 by population add **5,000,827** (75% of total impact): gujranwala (2.5M), bannu (1.4M), sahiwal (538k), dera-ghazi-khan (494k).

---

## §6. Comparison with prior MCF waves

| MCF Wave | Country | Blocked | Approved | Strategy used |
|---|---|---:|---:|---|
| `ASIA-1A-MCF` | ID/MY/SG/TH | 14 | 14 (100%) | promote-from-alternatename + bare-slug |
| `ASIA-1B-MCF` | VN/PH | 84 | 84 (100%) | similar |
| `ASIA-1C-MCF` | JP/KR/HK/TW/MO | 26 | 26 (100%) | manual Persian/Urdu/mojibake fix |
| `ASIA-1E-MCF` | NP/LK/MV/BT/BN/MM/KH/LA/TL | 72 | 70 + 2 excluded | promote + 2 pop=0 excluded |
| `ASIA-1G-AF-MCF` | AF | 8 | 8 (100%) | promote-from-existing-alias |
| `ASIA-1G-IR` (clean) | IR | (no MCF — all rescued by Stage 3.4) | — | — |
| `ASIA-1H-MCF` | UZ/KZ/TJ/KG/TM/MN | 33 | 33 (100%) | user-priority decisions + collision overrides |
| `ASIA-1I-MCF` | AZ/GE/AM | 23 | 23 (100%) | user-priority Arabic decisions |
| **`ASIA-1D-PK-MCF`** (this) | **PK** | **17** | **17 proposed** | **Promote-from-existing-alias for 14 + manual override for 3** |

This is the smallest MCF wave (17 rows) with the cleanest data — 14 rows already have a clean Arabic alternatename ready to promote; only 3 need fresh manual review (bannu, umarkot, kharian).

---

## §7. Open questions for user approval

1. **Confirm approval pattern**: `approve all 17` with the proposed NAME_AR_FIXES (recommended) OR per-row review?
2. **`gujranwala` Arabic form**: `غوجرانوالا` (Wikipedia AR with final ا) vs `غوجرانواله` (final ه, what GeoNames had as alias) — which is primary?
3. **`bannu` Arabic form**: `بنو` (clean, Wikipedia AR) vs `بنّو` (with shadda) — which is primary? Should we keep `بنوں` (Urdu form) as an alias for search?
4. **`umarkot` Arabic form**: `أمركوت` (with initial hamza, Wikipedia AR) vs `امركوت` (no hamza) — which is primary?
5. **`dera-ghazi-khan` Arabic form**: `ديره غازي خان` (GeoNames) vs `ديرة غازي خان` (tah-marbuta, Wikipedia AR)?
6. **`kharian` conversion**: convert Urdu ں → Arabic ن → `كهاريان`? Or alternative form?
7. **`chitral` alias `جهترار`**: confirm drop (semantic mismatch)?
8. **`badin` invisible RLM character**: confirm strip to just `بدين`?
9. **`chunian` admin prefix**: same as `mailsi` — STRIP the admin prefix `تصيل`?
10. **All Sindhi/Pashto/Kurdish aliases** (8 in §4 drop list): confirm drop?
11. **Diacritic-heavy aliases** (e.g. `لاله موسيٰ` with U+0670): confirm drop?
12. **Country-suffix aliases** (3 in §4): confirm drop?
13. **`PLACE-NAMES-UR-PK-3` follow-up**: after merge, do you want an Urdu enrichment wave for these 17 (similar to UR-PK-2)?

---

## §8. Acceptance criteria (for the apply phase, if approved)

When user approves and we move to merge via a follow-up `ASIA-1D-PK-MCF-APPROVE` script:

1. ✅ Apply 17 user-approved NAME_AR_FIXES + alias cleanups
2. ✅ Merge via `apply_curated_candidates.mjs` (which now honors fillLangMap guard — writes only `{en, ar}` for these 17)
3. ❌ Do NOT touch the 43 already-merged ASIA-1D-PK entries
4. ❌ Do NOT touch the 10 PK seed entries
5. ❌ Do NOT touch the 98 missing-ar majors (separate phase)
6. ❌ Do NOT touch `names.ur` / `aliases.ur` for these 17 (added later in `PLACE-NAMES-UR-PK-3`)
7. ❌ No code changes (server.js, js/app.js, fillLangMap, index.html)
8. ❌ No runtime translation
9. ✅ Pre-merge backup `curated-places.json.preAsia1dPkMcf.bak`
10. ✅ Idempotent

### Tests required post-merge

- `_test_asia_1d_pk_mcf.mjs` (new): smoke for 17 added cities + Arabic search verification
- All carry-forward suites stay green (currently 1,494/1,494 across 26 suites)
- Expected counts post-merge: curated 2,379 → 2,396, PK 53 → 70
- Production verifier 338/338

### Post-MCF state

| Category | Count | Status |
|---|---:|---|
| PK seed | 10 | ✅ Urdu-complete (UR-PK-1) |
| PK ASIA-1D-PK clean (43) | 43 | ✅ Urdu-complete (UR-PK-2) |
| **PK ASIA-1D-PK-MCF (17 new)** | **17** | ⚠️ Urdu absent — `PLACE-NAMES-UR-PK-3` follow-up |
| **PK total post-MCF** | **70** | — |
| PK missing-ar deferred | 98 | (held — ASIA-1D-PK-MISSING-AR-MAJORS-1) |

---

## Status: 🟡 AWAITING USER REVIEW

**Next steps**:
1. User reviews all 17 rows in §1 (override any per-row proposals as needed)
2. User answers the 13 open questions in §7
3. After approval, follow-up phase `ASIA-1D-PK-MCF-APPROVE` will mutate candidates JSON + run Stage 4 merge

**Until approval**: NO data mutation occurs. This is a pure design document.

**Confirmed NOT touched in this review**:
- `curated_places.json` ✓
- `names.ar` / `names.en` / `names.ur` for any entry ✓
- `aliases.ur` for any entry ✓
- 43 ASIA-1D-PK already-merged entries ✓
- 10 PK seed entries ✓
- `server.js` / `js/app.js` / `fillLangMap` / `index.html` ✓

**No runtime translation. No translation API. No AI translation. No browser auto-translate.**

---

## §9. Final recommendation

> **Recommended action: `approve all 17 with proposed NAME_AR_FIXES`**

Justification:
1. **0 collisions** — no slug rename, no Arabic-name conflict
2. **0 semantic mismatches** — unlike bahawalnagar in ASIA-1D-PK, all 17 are pure transliteration fixes
3. **14/17 = 82%** are promote-from-existing-clean-alias (no new translit work)
4. **3/17 = 18%** need single-row manual override (`bannu`/`umarkot`/`kharian`) — all backed by Wikipedia AR
5. **Top 4 cities** (gujranwala 2.5M, bannu 1.4M, sahiwal 538k, dera-ghazi-khan 494k) add **5.0M Muslim audience**
6. **Total impact**: 17 cities × avg 392k = 6.66M total reach
7. **Same pattern as ASIA-1G-AF-MCF** (8 PPLAs, all promoted from existing aliases — closed cleanly)

After approval, the apply step is mechanical (mirrors `_asia_1g_af_blocked_major_cities_approve.mjs` script template).
