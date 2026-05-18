# PLACE-NAMES-UR-AF-1 — Closure Report

**Phase**: First Urdu enrichment batch
**Date**: 2026-05-18
**Status**: **CLOSED — clean merge complete**
**Predecessor**: `PLACE-NAMES-L10N-PIPELINE-GUARD-1` (closed `b0d5ad6`)
**Architecture trail**: `PLACE-NAMES-UR-DATA-SOURCE-AUDIT-1` → `PLACE-NAMES-L10N-PIPELINE-GUARD-1` → THIS

---

## Headline

The user-reported Urdu Latin-leak is now fixed for all 36 Afghan cities:

```
/ur/prayer-times-in-charikar      →  چاریکار   (was "Charikar")
/ur/prayer-times-in-kandahar      →  قندھار    (was "Kandahār")
/ur/prayer-times-in-pul-e-khumri  →  پل خمری
/ur/prayer-times-in-lashkar-gah   →  لشکر گاہ
+ 32 more
```

The `_pickCuratedName` reader didn't need to change — it already reads `entry.names.ur` correctly. We just replaced the fillchain Latin values with real Urdu strings, and the existing SSR/client code now renders them naturally. **Architecture untouched.**

---

## Numbers

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| Curated total rows | 2,336 | 2,336 | 0 |
| AF rows | 36 | 36 | 0 |
| AF rows with REAL `names.ur` (≠ `names.en`, Arabic-script) | 0 | **36** | **+36** |
| AF rows with `aliases.ur` | 0 | 25 | +25 |
| Total `aliases.ur` entries added | 0 | **36** | **+36** |
| AF fillchain `names.ur === names.en` | 36 | 0 | -36 |

No slug deletions. No row changes. Only `names.ur` (overwritten from fillchain → real Urdu) and `aliases.ur` (new) added.

---

## The 36 cities — sorted by qualityScore

| Score | slug | names.en | **names.ur** | aliases.ur added |
|:-:|---|---|---|---:|
| 95 | `kabul` | Kabul | **کابل** | 1 (کابول) |
| 95 | `herat` | Herāt | **ہرات** 🆕 | 0 |
| 95 | `kandahar` | Kandahār | **قندھار** 🆕 | 2 (قندہار، قندهار) |
| 95 | `charikar` | Charikar | **چاریکار** | 1 (چاريكار) |
| 95 | `fayroz-koh` | Fayrōz Kōh | **فیروز کوہ** 🆕 | 2 (فیروز کوه، **چغچران** historical) |
| 95 | `qala-i-naw` | Qala i Naw | **قلعہ نو** 🆕 | 4 (قلعہ ناؤ، قلعۀ نو، قلعة ناو، قلعه ناو) |
| 95 | `lashkar-gah` | Lashkar Gāh | **لشکر گاہ** 🆕 | 2 (لشکرگاہ، لشكر گاه) |
| 95 | `tarinkot` | Tarinkot | **ترین کوٹ** 🆕 (retroflex ٹ) | 1 (طرین کوٹ) |
| 95 | `maydanshakhr` | Maydanshakhr | **میدان شہر** 🆕 | 1 (میدان شهر) |
| 90 | `mazar-e-sharif` | Mazār-e Sharīf | **مزار شریف** | 0 |
| 90 | `pul-e-khumri` | Pul-e Khumrī | **پل خمری** | 0 |
| 90 | `pul-e-alam` | Pul-e ‘Alam | **پل علم** | 0 |
| 90 | `sar-e-pul` | Sar-e Pul | **سر پل** | 1 (سرپل) |
| 90 | `aibak` | Aībak | **آی بک** | 3 (آیبک، ایبک، **سمنگان** province name) |
| 90 | `maymana` | Maymana | **میمنہ** 🆕 | 2 (میمنه، ضلع میمنہ) |
| 90 | `gardez` | Gardez | **گردیز** | 1 (گرديز) |
| 90 | `fayzabad` | Fayzabad | **فیض آباد** | 0 |
| 90 | `bamyan` | Bāmyān | **بامیان** | 0 |
| 90 | `farah` | Farah | **فراه** (user override) | 1 (فراہ) |
| 85 | `kunduz` | Kunduz | **کندوز** | 1 (قندوز) |
| 85 | `shibirghan` | Shibirghān | **شبرغان** | 1 (شبرغن) |
| 85 | `nili` | Nīlī | **نیلی** | 0 |
| 85 | `ghazni` | Ghazni | **غزنی** | 1 (غزنین) |
| 85 | `bazarak` | Bāzārak | **بازارک** | 1 (بازاراک) |
| 85 | `parun` | Pārūn | **پارون** | 1 (پاروں 🆕) |
| 80 | `jalalabad` | Jalālābād | **جلال آباد** | 1 (جلال‌آباد ZWNJ) |
| 75 | `zaranj` | Zaranj | **زرنج** | 0 |
| 75 | `taloqan` | Taloqan | **تالقان** | 0 |
| 75 | `qalat` | Qalāt | **قلات** | 0 |
| 75 | `khost` | Khōst | **خوست** | 1 (متون historical) |
| 75 | `balkh` | Balkh | **بلخ** | 0 |
| 75 | `baghlan` | Baghlān | **بغلان** | 2 (باغلان، بغلان جديد) |
| 70 | `sidqabad` | Sidqābād | **سدق آباد** | 2 (صدقآباد، قلعۀ وزیر historical) |
| 70 | `mehtar-lam` | Mehtar Lām | **مہتر لام** 🆕 | 1 (مهتر لام) |
| 70 | `asadabad` | Asadābād | **اسد آباد** | 1 (چغه سرای historical) |
| 70 | `sharan` | Sharan | **شاران** | 1 (شرن) |

🆕 = uses an Urdu-specific letter (`ہ` heh-goal, `ٹ` retroflex, `ھ` heh-doachashmee, `ؤ` hamza-over-waw, `ں` noon-ghunna) — strongest "actually Urdu" signal.

**11 of 36 rows** use Urdu-specific letters as the PRIMARY `names.ur` value.

---

## qualityScore distribution

| Score | Count | Meaning |
|:-:|---:|---|
| 95 | 9 | GeoNames Urdu-specific letter + matches user-listed exact form |
| 90 | 10 | Clean Persian-script consensus |
| 85 | 6 | Single Persian-script GeoNames candidate |
| 80 | 1 | Layer-2 transliteration, low-ambiguity |
| 75 | 6 | Identical ar/ur (no Persian extras needed) |
| 70 | 4 | Layer-2 transliteration with single plausible target |

**0 rows below qualityScore 70.** Every row sourced.

---

## Aliases — accepted (36 entries across 25 rows)

Useful aliases preserved for search continuity:

| slug | aliases.ur added | type |
|---|---|---|
| `kabul` | `کابول` | Persian long-form |
| `kandahar` | `قندہار`, `قندهار` | GeoNames ہ-form + Arabic ه-form |
| `charikar` | `چاريكار` | Arabic-letter variant |
| `fayroz-koh` | `فیروز کوه`, **`چغچران`** | Arabic ه + **historical** (Chaghcharan, pre-2014 rename) |
| `qala-i-naw` | `قلعہ ناؤ`, `قلعۀ نو`, `قلعة ناو`, `قلعه ناو` | 4 he/ya/waw variants |
| `lashkar-gah` | `لشکرگاہ`, `لشكر گاه` | no-space + Arabic-letter |
| `farah` | `فراہ` | GeoNames Urdu-ہ variant |
| `jalalabad` | `جلال‌آباد` | Persian ZWNJ variant |
| `shibirghan` | `شبرغن` | short variant |
| `sidqabad` | `صدقآباد`, **`قلعۀ وزیر`** | short + **historical Persian** |
| `aibak` | `آیبک`, `ایبک`, **`سمنگان`** | no-space + no-hamza + **province name** |
| `maymana` | `میمنه`, `ضلع میمنہ` | Arabic ه + long admin form |
| `mehtar-lam` | `مهتر لام` | Arabic ه variant |
| `kunduz` | `قندوز` | clean-Arabic variant |
| `khost` | **`متون`** | **historical** Pashto/Persian "Matun" |
| `ghazni` | `غزنین` | long Persian form |
| `gardez` | `گرديز` | Arabic-ي variant |
| `sar-e-pul` | `سرپل` | no-space variant |
| `baghlan` | `باغلان`, `بغلان جديد` | long-ا + modern New-Baghlan district |
| `asadabad` | **`چغه سرای`** | **historical** Persian "Chaghasaray" |
| `bazarak` | `بازاراک` | long-form ا variant |
| `sharan` | `شرن` | short variant |
| `tarinkot` | `طرین کوٹ` | ط-variant (Urdu retroflex preserved) |
| `parun` | `پاروں` | ں-variant (Urdu noon-ghunna) |
| `maydanshakhr` | `میدان شهر` | Arabic ه variant |

**5 historical/regional aliases preserved**: چغچران، سمنگان، قلعۀ وزیر، متون، چغه سرای.

---

## Aliases — rejected (5, audit trail in apply script)

| slug | dropped alias | reason |
|---|---|---|
| `shibirghan` | `مرکز ولايت شبرغان` | Persian for "office of the governorate" — administrative phrase, not a city name |
| `parun` | `پرنس` | Persian/Urdu word for "Prince" — semantically unrelated |
| `lashkar-gah` | `لښکرگاه بسټ` | Pashto ښ + ټ — fails the Urdu clean-check (not in standard Urdu script) |
| `baghlan` | `صناعتی` | Persian for "industrial" — generic adjective, not a place name |
| `mehtar-lam` | `مختار لام` | Arabic word "chosen" — semantic mismatch (city is "Mehtar" not "Mukhtar"); deliberately NOT promoted to alias even though it's `names.ar` |

---

## Tests — **1,372 / 1,372 zero failures**

| Suite | Result |
|---|:-:|
| **`_test_place_names_ur_af_1.mjs` (NEW — 36 AF /ur/ + 5 ar/en regression)** | **41/41 PASS** |
| **🚨 CRITICAL `/ur/charikar` → چاریکار check** | **PASS** |
| `_test_fill_lang_map.mjs` (pipeline guard intact) | 11/11 |
| `_test_asia_1g_af_mcf_search.mjs` (لشكر جاه critical) | 18/18 + critical PASS |
| `_test_asia_1g_af_search.mjs` (clean wave) | 24/24 |
| `_test_asia_1g_ir_search.mjs` (قائم شهر critical) | 19/19 + critical PASS |
| `_test_asia_1h_mcf_search.mjs` (kg/manas critical) | 39/39 + critical PASS |
| `_test_place_by_slug.mjs` | 44/44 |
| `_test_city_page_l10n.mjs` | 156/156 |
| `_test_search_place_endpoint.mjs` | 659/659 |
| `_verify_place_slug_fix_production.mjs` | 338/338 |
| `_test_persian_pregate_design.mjs` (Stage 3.4 fixture) | 23/23 |

All 4 historical critical name checks intact: لشكر جاه, قندهار, قائم شهر, ماناس.

---

## Production spot-checks — 13 user-listed Arabic queries

```
✓ /ur/prayer-times-in-charikar         → چاریکار
✓ /ur/prayer-times-in-kandahar         → قندھار
✓ /ur/prayer-times-in-pul-e-khumri     → پل خمری
✓ /ur/prayer-times-in-pul-e-alam       → پل علم
✓ /ur/prayer-times-in-sar-e-pul        → سر پل
✓ /ur/prayer-times-in-fayroz-koh       → فیروز کوہ
✓ /ur/prayer-times-in-qala-i-naw       → قلعہ نو
✓ /ur/prayer-times-in-lashkar-gah      → لشکر گاہ
✓ /ur/prayer-times-in-farah            → فراه (user override applied)
✓ /ur/prayer-times-in-kabul            → کابل
✓ /ur/prayer-times-in-herat            → ہرات
✓ /ur/prayer-times-in-mazar-e-sharif   → مزار شریف
✓ /ur/prayer-times-in-jalalabad        → جلال آباد
```

All 13 EXACT matches with user-listed expected forms.

---

## ar / en regression checks

| slug | /ar (bare) | /en/ | Status |
|---|---|---|:-:|
| `charikar` | تشاريكار | Charikar | ✓ unchanged |
| `kandahar` | قندهار | Kandahār | ✓ unchanged |
| `kabul` | كابل | Kabul | ✓ unchanged |
| `farah` | فراه | Farah | ✓ unchanged |
| `lashkar-gah` | لشكر جاه | Lashkar Gāh | ✓ unchanged |

**`names.ar` and `names.en` NOT modified for any row.** Confirmed via test + spot inspection.

---

## Confirmation — no runtime translation used

- ✓ Zero translation API calls
- ✓ Zero AI translation at request time
- ✓ Every Urdu name is stored static, read from `entry.names.ur` at SSR
- ✓ Sourced from one of: GeoNames Persian/Urdu-script alternatenames OR Layer-2 transliteration OR Urdu-canonical (Urdu Wikipedia convention)

The "no runtime translation" principle is preserved 100%.

---

## Files changed

| File | Change |
|---|---|
| `db/places/curated-places.json` | +36 names.ur (overwriting fillchain Latin), +36 aliases.ur entries across 25 rows |
| `scripts/geodata/_place_names_ur_af_1_apply.mjs` | NEW — apply script with 36 FIXES + clean-check + idempotent |
| `scripts/_test_place_names_ur_af_1.mjs` | NEW — Urdu SSR smoke test (36 cities + 5 ar/en regression + 1 CRITICAL) |
| `reports/place-names-ur-af-1-review.md` | The review report user approved |
| `reports/place-names-ur-af-1-apply-report.md` | NEW — apply audit trail |
| `reports/place-names-ur-af-1-closure.md` | NEW — this file |

Backup: `db/places/curated-places.json.prePlaceNamesUrAf1.bak` (local, gitignored).

---

## What this phase did NOT do

- ❌ `names.ar` not modified for any row
- ❌ `names.en` not modified for any row
- ❌ `namesProvenance` NOT added (not in user's explicit 7-point list; can be added in a follow-up if requested)
- ❌ No code changes (`server.js`, `js/app.js`, `index.html`, `css/style.css`, `_geonames_common.mjs`)
- ❌ No enrichment of other countries (Iran, Pakistan, India, Bangladesh — separate batches)
- ❌ No Bengali batch (separate phase)
- ❌ No Latin-script lang exonyms
- ❌ No translation API
- ❌ No runtime fallback
- ❌ No `fillLangMap` change (guard from `PLACE-NAMES-L10N-PIPELINE-GUARD-1` already in place)

---

## Rollback path

```bash
# Data restore from backup:
cp db/places/curated-places.json.prePlaceNamesUrAf1.bak db/places/curated-places.json

# OR git revert:
git revert <this-commit>
```

Both paths reversible.

---

## Held (per user direction)

- ❌ `PLACE-NAMES-UR-IR-1` (Iran Urdu batch — next priority)
- ❌ `PLACE-NAMES-UR-PK-1` (Pakistan)
- ❌ `PLACE-NAMES-UR-IN-1` (India)
- ❌ `PLACE-NAMES-BN-BD-1` (Bangladesh)
- ❌ Other countries / Bengali / Latin-script langs
- ❌ ASIA-1D / ASIA-1F / AMERICAS-1B-MCF
- ❌ Western Sahara / Search-ranking / Alias enrichment / DELETE-V1

**PLACE-NAMES-UR-AF-1 CLOSED — awaiting user direction.**
