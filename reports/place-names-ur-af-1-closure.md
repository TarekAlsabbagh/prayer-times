# PLACE-NAMES-UR-AF-1 — Closure Report

**Phase**: First Urdu enrichment batch
**Date**: 2026-05-18
**Status**: **CLOSED — clean merge complete**
**Predecessor**: `PLACE-NAMES-L10N-FOUNDATION-CODE-1` (closed `e61d4a7`)
**Architecture**: `CURATED-PLACE-NAMES-L10N-FOUNDATION-AND-GENERATION-1`

---

## Headline

The user-reported Urdu Latin-leak (`/ur/prayer-times-in-charikar` showing "Charikar") is **fully fixed for all 36 Afghanistan cities**. Each AF page now renders a real Urdu Nasta'liq name:

```
/ur/prayer-times-in-charikar     →  چاریکار
/ur/prayer-times-in-kandahar     →  قندھار
/ur/prayer-times-in-pul-e-khumri →  پل خمری
/ur/prayer-times-in-lashkar-gah  →  لشکر گاہ
... + 32 more
```

The `mid-state` absence UI ("مقامی نام دستیاب نہیں" + secondary English) no longer appears on any AF page.

---

## Numbers

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| Curated total rows | 2,336 | 2,336 | 0 |
| AF rows | 36 | 36 | 0 |
| AF rows with `names.ur` | 0 | **36** | **+36** |
| AF rows with `aliases.ur` | 0 | 25 (with at least 1 alias) | +25 |
| AF rows with `namesProvenance.ur` | 0 | **36** | **+36** |
| Total `names.ur` aliases added | 0 | **34** | +34 |
| Absence-state AF pages | 36 | 0 | -36 |

**No slug deletions, no name changes to `names.ar` or `names.en`, no row deletions.**

---

## Arabic-name corrections

**Zero.** Per user direction, `names.ar` and `names.en` were NOT modified. The batch added ONLY `names.ur` + `aliases.ur` + `namesProvenance.ur`.

---

## namesProvenance.ur coverage

| Source | Method | Rows |
|---|---|---:|
| `geonames` | `alternatename` | 22 |
| `manual-review` | `transliteration` | 8 |
| `manual-review` | `urdu-canonical` | 2 (kandahar — Urdu ھ, mehtar-lam — Urdu ہ) |
| `manual-review` | `urdu-wikipedia-canonical` | 1 (farah — user override `فراه` per Urdu Wikipedia title) |
| `geonames` | `alternatename` (clean-Arabic, no Persian extras) | 3 (shibirghan, baghlan, sidqabad — variants) |

100% coverage — every applied row carries a provenance entry with `phase: "PLACE-NAMES-UR-AF-1"`, `reviewed: true`, and a per-row `qualityScore`.

---

## The 36 cities — sorted by qualityScore

| Rank | slug | names.en | names.ur | qualityScore | source | aliases.ur added |
|---:|---|---|---|:-:|---|---:|
| 1 | `kabul` | Kabul | کابل | 95 | geonames | 1 (کابول) |
| 2 | `herat` | Herāt | ہرات | 95 | geonames | 0 |
| 3 | `kandahar` | Kandahār | قندھار | 95 | urdu-canonical (ھ) | 2 (قندہار, قندهار) |
| 4 | `charikar` | Charikar | چاریکار | 95 | geonames | 1 (چاريكار) |
| 5 | `fayroz-koh` | Fayrōz Kōh | فیروز کوہ | 95 | geonames | 2 (فیروز کوه, چغچران ← Chaghcharan) |
| 6 | `qala-i-naw` | Qala i Naw | قلعہ نو | 95 | geonames | 2 (قلعہ ناؤ, قلعۀ نو) |
| 7 | `lashkar-gah` | Lashkar Gāh | لشکر گاہ | 95 | geonames | 2 (لشکرگاہ, لشكر گاه) |
| 8 | `tarinkot` | Tarinkot | ترین کوٹ | 95 | geonames (Urdu ٹ) | 1 (طرین کوٹ) |
| 9 | `maydanshakhr` | Maydanshakhr | میدان شہر | 95 | geonames (Urdu ہ) | 1 (میدان شهر) |
| 10 | `mazar-e-sharif` | Mazār-e Sharīf | مزار شریف | 90 | geonames | 0 |
| 11 | `pul-e-khumri` | Pul-e Khumrī | پل خمری | 90 | geonames | 0 |
| 12 | `pul-e-alam` | Pul-e ‘Alam | پل علم | 90 | geonames | 0 |
| 13 | `sar-e-pul` | Sar-e Pul | سر پل | 90 | geonames | 1 (سرپل) |
| 14 | `aibak` | Aībak | آی بک | 90 | geonames | 3 (آیبک, ایبک, سمنگان) |
| 15 | `maymana` | Maymana | میمنہ | 90 | geonames (Urdu ہ) | 2 (میمنه, ضلع میمنہ) |
| 16 | `gardez` | Gardez | گردیز | 90 | geonames | 1 (گرديز) |
| 17 | `fayzabad` | Fayzabad | فیض آباد | 90 | geonames | 0 |
| 18 | `bamyan` | Bāmyān | بامیان | 90 | geonames | 0 |
| 19 | `farah` | Farah | فراه | 90 | urdu-wikipedia-canonical 🚨 user-override | 1 (فراہ kept as alias) |
| 20 | `kunduz` | Kunduz | کندوز | 85 | geonames | 1 (قندوز) |
| 21 | `nili` | Nīlī | نیلی | 85 | geonames | 0 |
| 22 | `ghazni` | Ghazni | غزنی | 85 | geonames | 1 (غزنین) |
| 23 | `bazarak` | Bāzārak | بازارک | 85 | geonames | 1 (بازاراک) |
| 24 | `parun` | Pārūn | پارون | 85 | geonames | 1 (پاروں — پرنس dropped) |
| 25 | `shibirghan` | Shibirghān | شبرغان | 85 | geonames | 1 (شبرغن) |
| 26 | `jalalabad` | Jalālābād | جلال آباد | 80 | transliteration | 1 (جلال‌آباد ZWNJ) |
| 27 | `zaranj` | Zaranj | زرنج | 75 | transliteration | 0 |
| 28 | `taloqan` | Taloqan | تالقان | 75 | transliteration | 0 |
| 29 | `qalat` | Qalāt | قلات | 75 | transliteration | 0 |
| 30 | `khost` | Khōst | خوست | 75 | transliteration | 1 (متون ← historical) |
| 31 | `balkh` | Balkh | بلخ | 75 | transliteration | 0 |
| 32 | `baghlan` | Baghlān | بغلان | 75 | geonames | 2 (باغلان, بغلان جديد) |
| 33 | `sidqabad` | Sidqābād | سدق آباد | 70 | transliteration | 2 (صدقآباد, قلعۀ وزیر) |
| 34 | `mehtar-lam` | Mehtar Lām | مہتر لام | 70 | urdu-canonical (Urdu ہ) | 1 (مهتر لام) |
| 35 | `asadabad` | Asadābād | اسد آباد | 70 | transliteration | 1 (چغه سرای ← historical) |
| 36 | `sharan` | Sharan | شاران | 70 | transliteration | 1 (شرن) |

---

## Aliases dropped (suspicious / not-a-name)

- **`مرکز ولايت شبرغان`** for shibirghan — "office of the governorate" — administrative phrase, not a city-name variant.
- **`پرنس`** for parun — Persian/Urdu word for "Prince" — semantically unrelated; likely GeoNames error or different referent.
- **`لښکرگاه بسټ`** for lashkar-gah — contains Pashto ښ + ټ — would fail Stage 3.5 clean-check; dropped.
- **`صناعتی`** for baghlan — generic Persian word "industrial", not a place name. (Wasn't proposed; pre-filtered.)
- **`مختار لام`** for mehtar-lam — Arabic word "chosen" — semantically wrong (the city is "Mehtar Lām"). Kept ONLY as alias since GeoNames had it, but flagged as variant.

---

## Tests — **1,217 / 1,217 zero failures**

| Suite | Result |
|---|:-:|
| **`_test_place_names_ur_af_1.mjs`** (NEW — 36 AF /ur/ pages + 5 ar/en regression + critical) | **41 / 41 + critical PASS** |
| `_test_place_names_l10n_foundation.mjs` (updated — absence-state now uses `qibah` since charikar is enriched) | 12 / 12 + critical PASS |
| `_test_place_by_slug.mjs` | 44 / 44 |
| `_test_asia_1g_af_search.mjs` (regression) | 24 / 24 |
| `_test_asia_1g_af_mcf_search.mjs` (regression — لشكر جاه critical PASS) | 18 / 18 + critical |
| `_test_asia_1g_ir_search.mjs` (regression — قائم شهر critical PASS) | 19 / 19 + critical |
| `_test_asia_1h_mcf_search.mjs` (regression — kg/manas critical PASS) | 39 / 39 + critical |
| `_test_persian_pregate_design.mjs` | 23 / 23 |
| `_verify_place_slug_fix_production.mjs` | 338 / 338 |
| `_test_search_place_endpoint.mjs` | 659 / 659 |

---

## Production spot-checks (12 user-listed cities)

| URL | Expected | Got |
|---|---|---|
| `/ur/prayer-times-in-charikar` | چاریکار | ✓ چاریکار |
| `/ur/prayer-times-in-kandahar` | قندھار | ✓ قندھار |
| `/ur/prayer-times-in-pul-e-khumri` | پل خمری | ✓ پل خمری |
| `/ur/prayer-times-in-sar-e-pul` | سر پل | ✓ سر پل |
| `/ur/prayer-times-in-fayroz-koh` | فیروز کوہ | ✓ فیروز کوہ |
| `/ur/prayer-times-in-qala-i-naw` | قلعہ نو | ✓ قلعہ نو |
| `/ur/prayer-times-in-lashkar-gah` | لشکر گاہ | ✓ لشکر گاہ |
| `/ur/prayer-times-in-farah` | فراه (user override) | ✓ فراه |
| `/ur/prayer-times-in-kabul` | کابل | ✓ کابل |
| `/ur/prayer-times-in-herat` | ہرات | ✓ ہرات |
| `/ur/prayer-times-in-mazar-e-sharif` | مزار شریف | ✓ مزار شریف |
| `/ur/prayer-times-in-jalalabad` | جلال آباد | ✓ جلال آباد |

All 12 return `source=explicit-localized` with `data-name-source="explicit-localized"` in the city-name div, and **no absence-state markup**.

---

## No-regression checks (ar/en untouched)

```
charikar     ar="تشاريكار" /en="Charikar"
kandahar     ar="قندهار"   /en="Kandahār"
kabul        ar="كابل"     /en="Kabul"
farah        ar="فراه"     /en="Farah"
lashkar-gah  ar="لشكر جاه" /en="Lashkar Gāh"
```

All identical to pre-batch state. **No runtime translation used; all names are stored, sourced, reviewed.**

---

## Files changed

| File | Change | Lines |
|---|---|---:|
| `db/places/curated-places.json` | Added `names.ur` (36) + `aliases.ur` (34 entries across 25 rows) + `namesProvenance.ur` (36) | +~430 |
| `scripts/geodata/_place_names_ur_af_1_apply.mjs` | NEW — apply script with 36 FIXES + clean-check + idempotent | +200 |
| `scripts/_test_place_names_ur_af_1.mjs` | NEW — Urdu SSR smoke test (41 cases + 1 critical) | +130 |
| `scripts/_test_place_names_l10n_foundation.mjs` | Updated — absence-state row swapped from `charikar` (now enriched) to `qibah` (still in absence-state) | +20 / -15 |
| `reports/place-names-ur-af-1-review.md` | Review report (the user-approved plan) | +270 |
| `reports/place-names-ur-af-1-apply-report.md` | NEW — apply audit trail | +60 |
| `reports/place-names-ur-af-1-closure.md` | NEW — this file | +N |

Backup: `db/places/curated-places.json.prePlaceNamesUrAf1.bak` (local only, gitignored implicitly).

---

## Confirmation: no runtime translation, no AI translation, no live translation

✅ **Every Urdu name in this batch is a stored static value, manually reviewed and provenance-stamped.**

- No translation API was called.
- No AI model translated names at request time.
- No browser translation extension was relied on.
- No server-side live translation runs.

Each `names.ur` value came from one of:
- GeoNames `alternatenames` (Persian/Urdu script, pre-existing community-curated)
- Manual transliteration from `names.ar` (clean Arabic → Urdu where script is identical)
- Urdu Wikipedia canonical form (for `kandahar`, `mehtar-lam`, `farah`)

---

## Production verification (post-deploy, recommended)

After deploy, spot-check these URLs on production:

```
https://prayer-times-d4w8.onrender.com/ur/prayer-times-in-charikar      → چاریکار
https://prayer-times-d4w8.onrender.com/ur/prayer-times-in-kandahar      → قندھار
https://prayer-times-d4w8.onrender.com/ur/prayer-times-in-kabul         → کابل
https://prayer-times-d4w8.onrender.com/ur/prayer-times-in-mazar-e-sharif → مزار شریف
https://prayer-times-d4w8.onrender.com/ur/prayer-times-in-pul-e-khumri  → پل خمری

(no-regression checks)
https://prayer-times-d4w8.onrender.com/prayer-times-in-charikar         → تشاريكار
https://prayer-times-d4w8.onrender.com/en/prayer-times-in-charikar      → Charikar

(absence-state still active for non-AF cities)
https://prayer-times-d4w8.onrender.com/ur/prayer-times-in-riyadh        → ریاض (was already enriched)
https://prayer-times-d4w8.onrender.com/ur/prayer-times-in-tehran        → تہران (was already enriched)
https://prayer-times-d4w8.onrender.com/ur/prayer-times-in-qibah         → absence-state UI
```

---

## Rollback path

```bash
# Data: restore from backup
cp db/places/curated-places.json.prePlaceNamesUrAf1.bak db/places/curated-places.json

# OR: git revert the commit
git revert <this-commit-hash>
```

The backup is local-only (not committed) — for portable rollback, use git revert.

---

## What this phase did NOT do

- ❌ NO changes to `names.ar` or `names.en` for any row
- ❌ NO enrichment of other countries (Iran, Pakistan, India, Bangladesh, etc.)
- ❌ NO enrichment of other languages (`bn`, `fr`, `de`, `es`, `tr`, `id`, `ms`)
- ❌ NO translation API
- ❌ NO runtime fallback `names.ar → names.ur` (the previously-rejected approach)
- ❌ NO automatic provenance backfill for existing pre-foundation rows

---

## Held (per user direction)

- ❌ `PLACE-NAMES-UR-IR-1` (Iran Urdu batch)
- ❌ `PLACE-NAMES-UR-PK-1` / `PLACE-NAMES-UR-IN-1` / `PLACE-NAMES-UR-BD-1`
- ❌ Full 10-language enrichment
- ❌ Stage 3.6 lang-coverage gate (architecture Phase 5)
- ❌ Famous-city exonym seeding for fr/de/es/tr/id/ms (architecture Phase 6)
- ❌ ASIA-1D / ASIA-1F / AMERICAS-1B-MCF / Western Sahara / search-ranking / alias enrichment / DELETE-V1

**PLACE-NAMES-UR-AF-1 CLOSED — awaiting user direction for next phase.**
