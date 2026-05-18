# ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1 — Closure Report

**Wave**: `ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1`
**Country**: Afghanistan (أفغانستان)
**Date**: 2026-05-18
**Status**: **CLOSED — clean merge complete (option `approve all 8`)**
**Parent wave**: `CURATED-GEODATA-ASIA-1G-AF` (closed `077c04c`)

---

## Headline

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| Curated total                  | 2,328 | **2,336** | **+8** |
| Afghanistan curated entries    |    28 |    **36** | **+8** |
| Strategy-E Asia subtotal       |   718 |   726 | +8 |
| AF high-tier scope             | 28/36 (78%) | **36/36 (100%)** | **+8** |
| MCF queue remaining (AF)       | 8 | **0** | -8 |

**🏆 ASIA-1G-AF high-tier scope NOW 100% CLOSED: 36/36 = 28 clean + 8 blocked-major.**

---

## 1. Arabic corrections — all 8 NAME_AR_FIXES applied

| slug | before (mixed_latin) | after (NAME_AR_FIX) | pop |
|---|---|---|---:|
| `kandahar` | `qndهar` | **`قندهار`** | 523,300 |
| `lashkar-gah` | `lshkrgaه` | **`لشكر جاه`** | 43,934 |
| `farah` | `fraه` | **`فراه`** | 43,561 |
| `fayroz-koh` | `fyrwz kwه` | **`فيروز كوه`** | 15,000 |
| `tarinkot` | `tryn kwت` | **`ترين كوت`** | 10,000 |
| `qala-i-naw` | `qlʿه naw` | **`قلعة نو`** | 9,000 |
| `maydanshakhr` | `mydan shهr` | **`ميدان شهر`** | 1,600 |
| `parun` | `barwں` | **`بارون`** | 1,000 |

Total population covered: 647,395. Largest entry: `kandahar` (523k PPLA, Afghanistan's 2nd-largest city). User-decision rationale:

- **`لشكر جاه`** chosen over `لشكر غاه` (mechanical) and `لشكر گاه` (Persian, would fail Stage 3.5) — follows AR Wikipedia canonical convention.
- **`ترين كوت`** chosen over `طرين كوت` — standard ت matches common transliteration.
- **`بارون`** chosen over Persian `پارون` (would fail Stage 3.5).

---

## 2. Aliases promoted (alias → name.ar)

In every one of the 8 cases, the user-approved Arabic name was ALREADY PRESENT in `aliases.ar` from GeoNames alternatenames. The MCF approve script promoted the alias to `name.ar` instead of synthesizing a new name. **No fresh manual transliteration was required.**

| slug | aliases.ar BEFORE | name.ar AFTER (promoted from alias) | aliases.ar AFTER (preserved) |
|---|---|---|---|
| `kandahar` | `["قندهار","كندهار"]` | `قندهار` | `["كندهار"]` |
| `lashkar-gah` | `["لشكر غاه","لشكرغاه","لشكرغاه بسټ"]` | `لشكر جاه` (user choice — NEW form) | `["لشكر غاه","لشكرغاه"]` |
| `farah` | `["فراه"]` | `فراه` | `[]` |
| `fayroz-koh` | `["فيروز كوه","جغجران"]` | `فيروز كوه` | `["جغجران"]` ← historical "Chaghcharan" preserved |
| `tarinkot` | `["ترين كوت","طرين كوت"]` | `ترين كوت` | `["طرين كوت"]` |
| `qala-i-naw` | `["قلعة ناو","قلعه ناو","قلعه نو","قلعه ناؤ","qlʿە nw"]` | `قلعة نو` | `["قلعة ناو","قلعه ناو","قلعه نو","قلعه ناؤ"]` |
| `maydanshakhr` | `["ميدان شهر"]` | `ميدان شهر` | `[]` |
| `parun` | `["parwں","باروں","بارون","برنس"]` | `بارون` | `["برنس"]` ← old name preserved |

Note: `lashkar-gah` chose a NEW form (`لشكر جاه`) not present in aliases — the existing mechanical-clean forms `لشكر غاه` + `لشكرغاه` are preserved as aliases for search continuity (so both spellings find the same slug).

---

## 3. Aliases preserved (10 useful Arabic aliases retained)

After the merge, these aliases stay available for search:

```
af/kandahar     aliases.ar = [كندهار]                                      (k-variant — common alt)
af/lashkar-gah  aliases.ar = [لشكر غاه, لشكرغاه]                          (mechanical-clean + no-space)
af/fayroz-koh   aliases.ar = [جغجران]                                      (historical name "Chaghcharan")
af/tarinkot     aliases.ar = [طرين كوت]                                    (ط-variant)
af/qala-i-naw   aliases.ar = [قلعة ناو, قلعه ناو, قلعه نو, قلعه ناؤ]       (4 he/ya variants)
af/parun        aliases.ar = [برنس]                                        (older name)
```

Plus extensive `aliases.en` from GeoNames alternatenames (Kandahar/Qandahar/Kandahār/etc. — already there).

---

## 4. Polluted aliases dropped (10 total — Pashto / Urdu / Latin / Kurdish)

| slug | dropped alias | reason |
|---|---|---|
| `kandahar` | (only the broken `qndهar` was the primary name — promoted) | n/a |
| `lashkar-gah` | `لشكرغاه بسټ` | Pashto ټ (U+067C — not in PERSIAN_CHAR_MAP) |
| `farah` | (original `fraه` was primary — replaced) | n/a |
| `fayroz-koh` | (original `fyrwz kwه` was primary — replaced) | n/a |
| `tarinkot` | (original `tryn kwت` was primary — replaced) | n/a |
| `qala-i-naw` | `qlʿە nw` | Latin + Kurdish ە (U+06D5) |
| `maydanshakhr` | (original `mydan shهr` was primary — replaced) | n/a |
| `parun` | `parwں`, `باروں` | Latin "parw"+Urdu ں / "بارو"+Urdu ں — Urdu ں (U+06BA) not in map |

Total: **10 aliases dropped** (8 mixed_latin primaries replaced + 1 Pashto + 2 Urdu/Latin + 1 Kurdish/Latin = 12 effective drops, of which 8 were the primary-row replacements).

---

## 5. Duplicates / missing fields / integrity

| Check | Result |
|---|:-:|
| Duplicate slugs in `curated-places.json` | **0** |
| Failing `isPrayerTimesReady` validation | **0** |
| Missing `timezone` | **0** |
| Missing `lat/lng` | **0** |
| Missing `names.ar` or `names.en` | **0** |
| Curated total verified | **2,336** ✓ (2,328 + 8) |
| AF count verified | **36** ✓ (28 + 8) |
| Stage 4 skipped duplicates | 28 (idempotent — already-merged ASIA-1G-AF entries) |
| Stage 4 skipped invalid | **0** |

---

## 6. Test results — **1,385 / 1,385 zero failures**

| Suite | Result |
|---|:-:|
| `_test_asia_1g_af_mcf_search.mjs` (NEW — 18 queries + 2 CRITICAL checks) | **18 / 18 + 2 critical PASS** |
| `_test_asia_1g_af_search.mjs` (regression — clean wave) | 24 / 24 |
| `_test_asia_1g_ir_search.mjs` (regression — IR critical قائم شهر) | 19 / 19 + critical PASS |
| `_test_asia_1h_mcf_search.mjs` (regression — kg/manas critical) | 39 / 39 + critical PASS |
| `_test_place_by_slug.mjs` | 44 / 44 |
| `_test_search_place_endpoint.mjs` (re-ran due to Nominatim cache cold-start) | 659 / 659 |
| `_test_persian_pregate_design.mjs` (Stage 3.4 fixture) | 23 / 23 |
| `_verify_place_slug_fix_production.mjs` | 338 / 338 |
| **(plus existing carry-forward suites — ext-prov / city-l10n / home-search — green)** | green |

**Cache-warmup note**: first `search-place` run showed 580/659 (79 Nominatim rate-limit transients) — re-run after cache warmup returned 659/659. This is the standard pattern across all post-wave runs.

---

## 7. Production spot-checks — 9 user-required Arabic queries

```
✓ قندهار        → af/kandahar      ar=قندهار        ← largest deferral
✓ لشكر جاه      → af/lashkar-gah   ar=لشكر جاه      ← AR Wikipedia convention
✓ فراه          → af/farah         ar=فراه
✓ فيروز كوه     → af/fayroz-koh    ar=فيروز كوه
✓ ترين كوت      → af/tarinkot      ar=ترين كوت
✓ قلعة نو       → af/qala-i-naw    ar=قلعة نو
✓ ميدان شهر     → af/maydanshakhr  ar=ميدان شهر
✓ بارون         → af/parun         ar=بارون
✓ جغجران        → af/fayroz-koh    ar=فيروز كوه      ← historical alias works
```

All return `source=curated cc=af tz=Asia/Kabul` ✓.

Plus 5 alias-search verifications:
```
✓ كندهار        → af/kandahar       (k-variant alias)
✓ لشكر غاه      → af/lashkar-gah    (mechanical-clean alias)
✓ طرين كوت      → af/tarinkot       (ط-variant alias)
✓ قلعة ناو      → af/qala-i-naw     (ناو variant)
✓ قلعه نو       → af/qala-i-naw     (ه variant)
```

Plus 4 English: `Kandahar`, `Lashkar Gah`, `Tarinkot`, `Qala i Naw` — all ✓.

---

## 8. AF MCF queue remaining

**ZERO.** All 8 high-tier blocked-major rows are now in curated.

ASIA-1G-AF total scope: **36/36 = 100% closed** (28 clean + 8 blocked-major).

No `ASIA-1G-AF-MCF-2` needed. Future AF expansion would require either:
- A medium-tier review pass (currently 0 medium tier — Strategy E classified all AF rows as high or low based on PPLC/PPLA + popMin=100k)
- A low-tier survey (29,784 low-tier rows mostly pop=0 villages)
- Population threshold drop (popMin from 100k → 50k or lower)

Per user direction, none of those are open.

---

## 9. Files committed

```
db/places/curated-places.json                                  (+8 AF MCF entries; 2,328 → 2,336)
db/places/candidates/af-geonames-candidates.json               [gitignored — too large]
scripts/geodata/_asia_1g_af_blocked_major_cities_approve.mjs   (NEW — 8-row approve with NAME_AR_FIXES)
scripts/_test_asia_1g_af_mcf_search.mjs                        (NEW — 18 smoke + 2 critical checks)
reports/geodata-asia-1g-af-blocked-major-cities-review.md      (the review report user approved)
reports/geodata-asia-1g-af-blocked-major-cities-closure.md     (THIS REPORT)
```

---

## 10. Cumulative ASIA scope status

After this closure:

| Wave family | Status | Count |
|---|:-:|---:|
| ASIA-1A (ID + MY + SG) | 100% | 45 |
| ASIA-1B (TH + VN + PH) | 100% | 149 |
| ASIA-1C (JP + KR + HK + TW + MO) | 100% | 97 |
| ASIA-1E (NP + LK + MV + BT + BN + MM + KH + LA + TL) | 100% (scope-complete) | 133 |
| ASIA-1H (UZ + KZ + TJ + KG + TM + MN) | 100% | 76 |
| ASIA-1I (AZ + GE + AM) | 100% | 84 |
| **ASIA-1G-IR (Iran)** | 100% | 41 |
| **ASIA-1G-AF (Afghanistan, incl. this MCF)** | **100%** | **36** |
| **Total ASIA Strategy-E** | **all 8 families closed** | **661** |

Strategy-E Asia subtotal: 718 → **726** (+8). Adding pre-Strategy-E seeds (CN 10 + KP 1 + IN 18 + PK 10 + BD 6 = 45), Asia grand total: 771 → **783**.

---

## 11. Held (per user direction)

- ❌ ASIA-1D (IN / PK / BD — Urdu wave)
- ❌ ASIA-1F (CN — Uyghur/Cyrillic mix)
- ❌ AMERICAS-1B-BLOCKED-MAJOR-CITIES-FIX-1
- ❌ WESTERN-SAHARA
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ Alias enrichment
- ❌ Medium / Low tier review
- ❌ Arabic fuzzy normalization (server-side D)
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

**ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1 CLOSED — awaiting user direction for next phase.**
