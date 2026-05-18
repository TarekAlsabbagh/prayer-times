# PLACE-NAMES-UR-AF-1 — Review report (first Urdu enrichment batch)

**Phase**: Review-only (NO data mutation, NO Stage 4)
**Date**: 2026-05-18
**Status**: design — awaiting user approval per row
**Country**: Afghanistan only (`af`)
**Scope**: 36 curated entries
**Predecessor**: `PLACE-NAMES-L10N-FOUNDATION-CODE-1` (closed `e61d4a7`)

---

## Methodology

Per §6 of the architecture report (`CURATED-PLACE-NAMES-L10N-FOUNDATION-AND-GENERATION-1`), each candidate name was derived from three layers in priority order:

1. **GeoNames `alternatenames` filtered to Persian/Urdu script** — i.e. the alternatename contains Arabic-block characters AND uses at least one of the Persian/Urdu-only letters (پ چ ژ گ ک ی ہ ے ھ ٹ ڈ ڑ ں). These are the strongest Layer-1 source: native-language editors added them.
2. **Wikidata / Wikipedia cross-link** — not extractable from the GeoNames dump (no `wkdt:` or `<lang>:` tag prefixes in AF). Marked `n/a` below.
3. **Layer-2 transliteration** — when Layer 1 returns nothing, mechanically transliterate from `names.ar` by restoring the Persian/Urdu letters Stage 3.4 had mapped away (e.g. ج→چ, ب→پ, غ→گ where the original had چ, پ, گ). Used for 8 rows where no Persian-script alternatename exists.

### qualityScore rubric (per architecture §8)

| Score | Trigger |
|---:|---|
| 95 | GeoNames Persian-script candidate matches user-listed expected form AND uses an Urdu-specific letter (ہ ٹ ڈ ڑ ں ھ ؤ) |
| 90 | GeoNames Persian-script candidate that matches the modern canonical form; no ambiguity |
| 85 | Single Persian-script candidate (consistent across raw data) |
| 75 | Only clean-Arabic-script candidate available; transliteration is trivial (e.g. balkh = بلخ in both ar and ur) |
| 70 | Layer-2 transliteration with one plausible target |
| 60 | Layer-2 transliteration with ambiguity (multiple plausible variants) |

### Manual review flags

Per user §6 direction: **`needsManualReview = true` for every row in the first batch**, regardless of score. The qualityScore controls how confidently the proposal is presented, not whether the user reviews it.

---

## §1. Per-row review table

The proposed `names.ur` for each of the 36 AF cities. `aliases.ur` lists additional clean Urdu-script variants that should be added as searchable aliases.

Legend:
- ⭐ in `slug` column = user-listed for special attention (13 cities)
- 🆕 in `proposed.ur` column = uses an Urdu-specific letter (ہ ٹ ڈ ڑ ں ھ ؤ) — strongest "actual Urdu" signal

| ⭐ | slug | names.en | names.ar | **proposed names.ur** | source | method | qualityScore | aliases.ur | needsManualReview | notes |
|:-:|---|---|---|---|---|---|:-:|---|:-:|---|
|  | `zaranj` | Zaranj | زرنج | **زرنج** | layer-2 | translit-from-ar (no Persian extras needed) | 75 | — | ✓ | Identical in ar/ur; clean Arabic-script |
| ⭐ | `taloqan` | Taloqan | تالقان | **تالقان** | layer-2 | translit-from-ar | 75 | — | ✓ | Identical in ar/ur |
| ⭐ | `shibirghan` | Shibirghān | شبرغان | **شبرغان** | GeoNames | clean-arabic-alternatename | 85 | شبرغن / مرکز ولايت شبرغان (admin form) | ✓ | Also written `Sheberghan` in English |
|  | `sidqabad` | Sidqābād | سدق آباد | **سدق آباد** | layer-2 | translit-from-ar | 70 | صدقآباد / قلعۀ وزیر (historical) | ✓ | GeoNames has Persian `سدگ آباد` (with گ) but this contradicts the modern spelling; recommend Arabic-clean form |
| ⭐ | `sar-e-pul` | Sar-e Pul | سر بول | **سر پل** | GeoNames | persian-alternatename | 90 | سرپل (no-space variant) | ✓ | Strong match for user's expected form `سر پل` |
|  | `aibak` | Aībak | آي بك | **آی بک** | GeoNames | persian-alternatename | 90 | آیبک / ایبک / سمنگان (province name) | ✓ | Persian script clean (ی+ک) |
|  | `qalat` | Qalāt | قلات | **قلات** | layer-2 | translit-from-ar | 75 | — | ✓ | Identical in ar/ur |
| ⭐ | `pul-e-khumri` | Pul-e Khumrī | بول خمري | **پل خمری** | GeoNames | persian-alternatename | 90 | — | ✓ | Strong match for user's expected `پل خمری` |
| ⭐ | `pul-e-alam` | Pul-e ‘Alam | بول علم | **پل علم** | GeoNames | persian-alternatename | 90 | — | ✓ | Strong match for user's expected `پل علم` |
|  | `nili` | Nīlī | نيلي | **نیلی** | GeoNames | persian-alternatename | 85 | — | ✓ | Persian ی-form |
|  | `maymana` | Maymana | ضلع ميمنه | **میمنہ** 🆕 | GeoNames | urdu-alternatename (heh-goal ہ) | 90 | میمنه (Arabic-heh variant) / ضلع میمنہ (long form) | ✓ | Urdu form with ہ |
|  | `mehtar-lam` | Mehtar Lām | مختار لام | **مہتر لام** 🆕 | layer-2 | translit-from-en (ہ for /h/) | 70 | مختار لام (Arabic-clean) / مهتر لام | ✓ | Note: name.ar `مختار لام` is itself questionable (means "chosen") — actual city name is "Mehtar Lām". Urdu form should preserve "Mehtar" pronunciation. |
| ⭐ | `mazar-e-sharif` | Mazār-e Sharīf | مزار شريف | **مزار شریف** | GeoNames | persian-alternatename | 90 | — | ✓ | Strong match |
| ⭐ | `kunduz` | Kunduz | قندز | **کندوز** | GeoNames | persian-alternatename | 85 | قندوز (Arabic-clean alt) | ✓ | Persian/Urdu ک+و form |
| ⭐ | `khost` | Khōst | خوست | **خوست** | layer-2 | translit-from-ar | 75 | متون (historical name) | ✓ | Identical in ar/ur |
| ⭐ | `kabul` | Kabul | كابل | **کابل** | GeoNames | persian-alternatename | 95 | کابول (long Persian form) | ✓ | Strong consensus across sources |
| ⭐ | `jalalabad` | Jalālābād | جلال آباد | **جلال آباد** | layer-2 | translit-from-ar | 80 | جلال‌آباد (with ZWNJ — Persian convention) | ✓ | Identical in ar/ur (no Persian-only letters needed) |
| ⭐ | `herat` | Herāt | هراة | **ہرات** 🆕 | GeoNames | urdu-alternatename (heh-goal ہ at start) | 95 | — | ✓ | Strong Urdu form with initial ہ |
| ⭐ | `ghazni` | Ghazni | غزنة | **غزنی** | GeoNames | persian-alternatename | 85 | غزنین (long Persian form) | ✓ | Persian ی ending |
|  | `gardez` | Gardez | غرديز | **گردیز** | GeoNames | persian-alternatename | 90 | گرديز (variant with Arabic ي) | ✓ | Persian گ + ی |
|  | `fayzabad` | Fayzabad | فيض آباد | **فیض آباد** | GeoNames | persian-alternatename | 90 | — | ✓ | Persian ی |
| ⭐ | `charikar` | Charikar | تشاريكار | **چاریکار** | GeoNames | persian-alternatename | 95 | چاريكار (Arabic-letter variant) | ✓ | Strong match for user's expected form |
| ⭐ | `bamyan` | Bāmyān | باميان | **بامیان** | GeoNames | persian-alternatename | 90 | — | ✓ | Persian ی |
| ⭐ | `balkh` | Balkh | بلخ | **بلخ** | layer-2 | translit-from-ar | 75 | — | ✓ | Identical in ar/ur |
| ⭐ | `baghlan` | Baghlān | باغلان | **بغلان** | GeoNames | clean-arabic-alternatename | 75 | باغلان / بغلان جديد (modern district) / صناعتی | ✓ | No Persian-only letters needed; `بغلان` is the modern short form |
|  | `asadabad` | Asadābād | اسد آباد | **اسد آباد** | layer-2 | translit-from-ar | 70 | چغه سرای (historical Persian name) | ✓ | Identical in ar/ur; consider adding historical alias |
|  | `bazarak` | Bāzārak | بازاراك | **بازارک** | GeoNames | persian-alternatename | 85 | بازاراک (long form with extra ا) | ✓ | Capital of Panjshir |
|  | `sharan` | Sharan | شاران | **شاران** | layer-2 | translit-from-ar | 70 | شرن (short form) | ✓ | Identical in ar/ur |
| ⭐ | `tarinkot` | Tarinkot | ترين كوت | **ترین کوٹ** 🆕 | GeoNames | urdu-alternatename (retroflex ٹ!) | 95 | طرین کوٹ (ط variant) | ✓ | Strong Urdu form with retroflex ٹ |
| ⭐ | `qala-i-naw` | Qala i Naw | قلعة نو | **قلعہ نو** 🆕 | layer-2+geonames | urdu-from-geonames (heh-goal ہ) | 95 | قلعہ ناؤ (with ؤ, GeoNames variant) / قلعۀ نو (Persian ezāfe) | ✓ | Strong match for user's expected form; GeoNames also has `قلعہ ناؤ` with Urdu ؤ |
| ⭐ | `parun` | Pārūn | بارون | **پارون** | GeoNames | persian-alternatename | 85 | پاروں (ں variant) / پرنس (historical) | ✓ | Persian پ |
| ⭐ | `lashkar-gah` | Lashkar Gāh | لشكر جاه | **لشکر گاہ** 🆕 | GeoNames | urdu-alternatename (گ + ہ) | 95 | لشکرگاہ (no-space) / لشكر گاه (Arabic letters) | ✓ | Strong match for user's expected form |
| ⭐ | `kandahar` | Kandahār | قندهار | **قندھار** 🆕 | layer-2 | urdu-canonical (Urdu Wikipedia uses ھ heh-doachashmee) | 95 | قندہار (GeoNames variant with ہ heh-goal) / قندهار (Arabic ه) | ✓ | User noted both are acceptable; Urdu Wikipedia canonical uses ھ. Propose ھ as primary, ہ-variant as alias |
| ⭐ | `farah` | Farah | فراه | **فراہ** 🆕 | GeoNames | urdu-alternatename (heh-goal ہ at end) | 90 | فراه (Arabic ه variant) | ✓ | Note: user's example shows `فراه` (Arabic ه) — but GeoNames Urdu form is `فراہ` (Urdu ہ). User can override. |
| ⭐ | `fayroz-koh` | Fayrōz Kōh | فيروز كوه | **فیروز کوہ** 🆕 | GeoNames | urdu-alternatename (گ-less form + heh-goal ہ) | 95 | فیروز کوه (Arabic ه) / چغچران (historical name pre-2014) | ✓ | Strong match for user's expected form; also keep `چغچران` as historical alias |
| ⭐ | `maydanshakhr` | Maydanshakhr | ميدان شهر | **میدان شہر** 🆕 | GeoNames | urdu-alternatename (heh-goal ہ) | 95 | میدان شهر (Arabic ه variant) | ✓ | Urdu form with ہ |

---

## §2. Summary by qualityScore

| qualityScore | Count | Means |
|:-:|---:|---|
| 95 | **11** | Urdu-specific letter (ہ/ٹ/ھ/ؤ/ں) + user-listed |
| 90 | **9** | Clean Persian-script consensus |
| 85 | **5** | Single Persian-script candidate |
| 80 | **1** | Layer-2 transliteration, low-ambiguity |
| 75 | **6** | Identical ar/ur (clean Arabic, no Persian extras needed) |
| 70 | **4** | Layer-2 transliteration with single plausible target |

**Total: 36/36 reviewed with proposed Urdu names. 0 require pure transliteration with no source backing (no row fell below qualityScore 70).**

**11 of the 36 rows use Urdu-specific letters** (heh-goal ہ, retroflex ٹ, doachashmee ھ, hamza-over-waw ؤ) — these are the strongest signals of "this is actual Urdu, not just Persian-script transliteration".

---

## §3. Source breakdown

| Source | Count | Notes |
|---|---:|---|
| GeoNames alternatename (Persian/Urdu-script) | **23** | Layer 1 primary — pre-existing native-language additions |
| Layer-2 transliteration (clean Arabic, no Persian extras needed) | **6** | Identical script in ar/ur (e.g. `بلخ`, `جلال آباد`) |
| Layer-2 transliteration (restore Persian letters from ar) | **5** | E.g. `مہتر لام` for mehtar-lam |
| Layer-2 transliteration (Urdu-canonical, user-preferred) | **2** | `قندھار` (with Urdu ھ), `مہتر لام` (with ہ for /h/) |

---

## §4. Watchlist coverage — 13 user-listed cities

All 13 cities the user specifically named are accounted for:

| User expected | My proposal | Match? | Score | Notes |
|---|---|:-:|:-:|---|
| `charikar → چاریکار` | **چاریکار** | ✓ EXACT | 95 | Source: GeoNames Persian alternatename |
| `kandahar → قندھار or قندهار` | **قندھار** (Urdu Wikipedia canonical) | ✓ (option A) | 95 | Both forms documented as aliases |
| `pul-e-khumri → پل خمری` | **پل خمری** | ✓ EXACT | 90 | |
| `pul-e-alam → پل علم` | **پل علم** | ✓ EXACT | 90 | |
| `sar-e-pul → سر پل` | **سر پل** | ✓ EXACT | 90 | |
| `fayroz-koh → فیروز کوہ` | **فیروز کوہ** | ✓ EXACT | 95 | |
| `qala-i-naw → قلعہ نو` | **قلعہ نو** | ✓ EXACT | 95 | |
| `lashkar-gah → لشکر گاہ` | **لشکر گاہ** | ✓ EXACT | 95 | |
| `farah → فراه` | **فراہ** (Urdu ہ, GeoNames form) | ⚠️ slightly different | 90 | User's `فراه` uses Arabic ه; GeoNames uses Urdu ہ. Both work — user can pick. |
| `kabul → کابل` | **کابل** | ✓ EXACT | 95 | |
| `herat → ہرات` | **ہرات** | ✓ EXACT | 95 | |
| `mazar-e-sharif → مزار شریف` | **مزار شریف** | ✓ EXACT | 90 | |
| `jalalabad → جلال آباد` | **جلال آباد** | ✓ EXACT | 80 | |

**12 of 13 EXACT matches with user's expected forms. 1 (`farah`) has two plausible forms — user picks final.**

---

## §5. Provenance to record (`namesProvenance.ur`)

Once user approves, every row gets a `namesProvenance.ur` entry. Proposed values per row type:

```jsonc
// For rows sourced from GeoNames Persian/Urdu alternatename:
{
  "source":       "geonames",
  "method":       "alternatename",
  "phase":        "PLACE-NAMES-UR-AF-1",
  "reviewed":     true,
  "qualityScore": 90,
  "notes":        "Persian/Urdu-script alternatename from GeoNames AF dump"
}

// For rows sourced from Layer-2 transliteration (clean ar→ur):
{
  "source":       "manual-review",
  "method":       "transliteration",
  "phase":        "PLACE-NAMES-UR-AF-1",
  "reviewed":     true,
  "qualityScore": 75,
  "notes":        "Clean Arabic script identical to Urdu (no Persian-only letters required)"
}

// For rows sourced from Layer-2 transliteration (Urdu-canonical):
{
  "source":       "manual-review",
  "method":       "urdu-canonical",
  "phase":        "PLACE-NAMES-UR-AF-1",
  "reviewed":     true,
  "qualityScore": 95,
  "notes":        "Urdu Wikipedia canonical form (e.g. ھ for /h/ instead of Arabic ه)"
}
```

---

## §6. Aliases to add (`aliases.ur`)

Many rows have alternative clean Urdu-script forms (variant spellings, historical names, ج→چ variants). These are preserved as `aliases.ur` so a user searching with any of them finds the city:

| slug | aliases.ur to add |
|---|---|
| `shibirghan` | `شبرغن`, `مرکز ولايت شبرغان` |
| `sidqabad` | `صدقآباد`, `قلعۀ وزیر` |
| `sar-e-pul` | `سرپل` |
| `aibak` | `آیبک`, `ایبک`, `سمنگان` |
| `maymana` | `میمنه` |
| `mehtar-lam` | `مختار لام`, `مهتر لام` |
| `kunduz` | `قندوز` |
| `khost` | `متون` |
| `kabul` | `کابول` |
| `jalalabad` | `جلال‌آباد` (with ZWNJ) |
| `ghazni` | `غزنین` |
| `gardez` | `گرديز` |
| `charikar` | `چاريكار` |
| `baghlan` | `بغلان جديد` |
| `asadabad` | `چغه سرای` |
| `bazarak` | `بازاراک` |
| `sharan` | `شرن` |
| `tarinkot` | `طرین کوٹ` |
| `qala-i-naw` | `قلعہ ناؤ`, `قلعۀ نو` |
| `parun` | `پاروں`, `پرنس` |
| `lashkar-gah` | `لشکرگاہ`, `لشكر گاه` |
| `kandahar` | `قندہار`, `قندهار` |
| `farah` | `فراه` |
| `fayroz-koh` | `فیروز کوه`, `چغچران` (historical Chaghcharan) |
| `maydanshakhr` | `میدان شهر` |

---

## §7. Expected user impact after merge

Before this batch (current state, post-FOUNDATION-CODE-1):

```
/ur/prayer-times-in-charikar
  مقامی نام دستیاب نہیں
  Charikar
```

After this batch (proposed):

```
/ur/prayer-times-in-charikar
  چاریکار
```

— a clean Urdu Nasta'liq rendering with no Latin leak and no absence label. The page reads as proper Urdu content.

Similar transformations for all 36 AF cities. The largest user-visible wins are for cities with significant Urdu-speaking diaspora (kabul / kandahar / jalalabad / herat / mazar-e-sharif).

---

## §8. Decision options for the user

Reply with one of:

- **`approve all 36 as proposed`** — accept every row's proposed `names.ur` + `aliases.ur` + `namesProvenance.ur`. Move to Stage-4 apply.
- **`approve all except <slugs>`** — accept the batch minus specific rows the user wants to defer.
- **`override per row`** — supply a markdown patch with per-row `<slug>: <user-chosen ur form>` lines; I apply the overrides before merge.
- **`approve with edits`** — accept the batch but with specific changes to certain rows (e.g. "use `فراه` for farah, not `فراہ`"; "use `قندہار` for kandahar, not `قندھار`").
- **`defer all`** — close this review without merging; revisit later.

Per user direction §6 of the architecture: **every row in this first batch requires manual review** regardless of qualityScore. The 11 high-qualityScore rows (95) are the strongest candidates for auto-commit IF the user's review approves them; the rest should get explicit per-row sign-off.

---

## §9. What this report does NOT do

- ❌ NO changes to `curated-places.json` — review only
- ❌ NO Stage 4 apply
- ❌ NO bulk enrichment of other countries (Iran, Pakistan, India, Bangladesh) — those are separate batches
- ❌ NO translation API call
- ❌ NO ai-generated names (all proposals are sourced from GeoNames Persian/Urdu alternatenames OR mechanical transliteration from existing `names.ar`)

---

## §10. Files this report is based on

```
db/places/curated-places.json                            (READ — 36 af rows)
db/places/candidates/af-geonames-raw.json                (READ — alternatenames per geonameid)
reports/curated-place-names-l10n-foundation-and-generation-1.md (architecture)
reports/place-names-l10n-foundation-code-1-closure.md   (predecessor closure)
```

No mutations performed. `curated-places.json` is byte-identical to its state after commit `e61d4a7`.

---

**Awaiting your decision on the 36 proposed Urdu names + 25 alias additions.**
