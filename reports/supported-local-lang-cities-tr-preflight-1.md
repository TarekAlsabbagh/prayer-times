# SUPPORTED-LOCAL-LANG-CITIES-TR-PREFLIGHT-1 — Preflight Report

**Date:** 2026-05-21
**Mode:** PREFLIGHT / AUDIT ONLY — NO apply, NO curated mutation
**Status:** ⏸ AWAITING USER APPROVAL TO PROCEED WITH APPLY

---

## Executive Summary

Turkey preflight complete: Stage-1 download + Stage-2 normalize + Stage-3 validate
all succeeded. **74 high-tier candidates (Turkish PPLA provincial capitals)** are
pending. Existing 14 TR curated entries all have clean `names.{ar, en, tr}` with
proper Turkish chars (İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü) where appropriate.

**Recommendation:** TR is **READY for a single FAST apply wave** of ~25-30 cities.
Data quality is moderate (~50% have clean Arabic, ~50% need manual NAME_AR_FIX
for Persian/Urdu pollution in GeoNames `name` column).

---

## Section 1 — Current TR Curated State

**TR total: 14 entries** — all `source=curated`, no `sourceId` (gid) set.

| Slug         | names.ar          | names.en      | names.tr     | TR chars |
|--------------|-------------------|---------------|--------------|----------|
| istanbul     | إسطنبول          | Istanbul       | İstanbul     | ✅ İ     |
| ankara       | أنقرة             | Ankara         | Ankara       | (same-as-en) |
| izmir        | إزمير             | Izmir          | İzmir        | ✅ İ     |
| bursa        | بورصة             | Bursa          | Bursa        | (same-as-en) |
| antalya      | أنطاليا           | Antalya        | Antalya      | (same-as-en) |
| konya        | قونية             | Konya          | Konya        | (same-as-en) |
| adana        | أضنة              | Adana          | Adana        | (same-as-en) |
| gaziantep    | غازي عنتاب        | Gaziantep      | Gaziantep    | (same-as-en) |
| kayseri      | قيصري             | Kayseri        | Kayseri      | (same-as-en) |
| mersin       | مرسين             | Mersin         | Mersin       | (same-as-en) |
| diyarbakir   | ديار بكر          | Diyarbakir     | Diyarbakır   | ✅ ı     |
| sanliurfa    | شانلي أورفا       | Sanliurfa      | Şanlıurfa    | ✅ Ş ı   |
| trabzon      | طرابزون           | Trabzon        | Trabzon      | (same-as-en) |
| erzurum      | أرضروم            | Erzurum        | Erzurum      | (same-as-en) |

**Coverage:** ar 14/14, en 14/14, tr 14/14 — **100% complete on existing.**
**Quality:** No fillchain bugs. 4/14 (29%) use Turkish-specific chars; remaining
10 are same-as-en (correct — Turkish proper nouns share form with English).

**Risk note:** None of the 14 TR entries have a `sourceId` set. Multi-key dedupe
(slug + name) will be used for the apply wave instead of gid-collision detection.

---

## Section 2 — GeoNames Sources Status

All sources successfully prepared for TR:

| Artifact                                        | Status      | Size       | Rows          |
|-------------------------------------------------|-------------|------------|---------------|
| `db/places/sources/TR.zip`                      | ✅ DOWNLOADED | 3,521,136 B | (zipped)      |
| `db/places/sources/TR.txt`                      | ✅ EXTRACTED  | 13,346,114 B | 98,286 total raw |
| `db/places/candidates/tr-geonames-raw.json`     | ✅ STAGE-1   | —          | 54,597 P-class |
| `db/places/candidates/tr-geonames-normalized.json` | ✅ STAGE-2 | —          | 52,786        |
| `db/places/candidates/tr-geonames-candidates.json` | ✅ STAGE-3 | —          | 52,786        |
| `scripts/geodata/countries/tr.mjs`              | ✅ CREATED  | —          | 81-province admin1 map |
| `reports/tr-geodata-import-report.md`           | ✅ AUTO-GEN | —          | —             |

**Feature-code breakdown in raw**:
- PPL (general populated places): 51,074
- PPLA (admin1 capital, provinces): 80
- PPLA2 (admin2 capital, districts): 836
- PPLA3: 667
- PPLA1: 0 *(included under PPLA)*
- PPLC (national capital): 1 (Ankara)
- PPLX (district): 1,592
- PPLW/PPLQ/PPLL/PPLS/PPLH/PPLF/PPLCH: 347 (mostly stubs)

---

## Section 3 — Stage-3 Validation Results

```
existing       : 21    (matched 14 unique curated slugs incl. 3 close-coord
                       district matches: osmangazi→bursa, sur→diyarbakir,
                       yakutiye→erzurum)
approved       : 0
pending        : 852
  high         : 74   ← BATCH-A target pool
  medium       : 0
  low          : 778
needs_review   : 51,912
rejected       : 1    (1 religious_site_not_city)
aliases.en opps: 17
```

**74 high-tier candidates** = remaining 67 of Turkey's 81 provincial PPLAs +
~7 PPLA2 (district capitals that exceed pop=100k including Alanya/Tarsus/
Iskenderun/Silifke/Gebze/Çorlu/Samandağ/Nazilli).

---

## Section 4 — Proposed BATCH-A (30 cities)

Population-ordered, all PPLA capitals or major PPLA2 (≥75k pop), all geographically
standalone (not Istanbul/Ankara/major-city districts), dedupe-verified vs curated.

### Group 4a — Clean Arabic in GeoNames (15 cities, fast track)

| # | Slug              | gid     | Pop     | adm1 | en (GeoNames)        | tr (GeoNames)        | ar (GeoNames)           |
|---|-------------------|---------|--------:|------|----------------------|----------------------|-------------------------|
| 1 | eskisehir         | 315202  | 921,630 | 26   | Eskişehir            | Eskişehir            | أسكي شهر                 |
| 2 | van               | 298117  | 525,016 | 65   | Van                  | Van                  | وان                      |
| 3 | samsun            | 740264  | 394,050 | 55   | Samsun               | Samsun               | سامسون                   |
| 4 | kahramanmaras     | 310859  | 384,953 | 46   | Kahramanmaraş        | Kahramanmaraş        | كهرمان مرعش             |
| 5 | usak              | 298299  | 369,433 | 64   | Uşak                 | Uşak                 | أوشاك                    |
| 6 | denizli           | 317109  | 313,238 | 20   | Denizli              | Denizli              | دنيزلي                   |
| 7 | corum             | 748879  | 269,595 | 19   | Çorum                | Çorum                | جوروم                    |
| 8 | sivas             | 300619  | 264,022 | 58   | Sivas                | Sivas                | سيواس                    |
| 9 | afyonkarahisar    | 325303  | 251,799 | 03   | Afyonkarahisar       | Afyonkarahisar       | أفيون قره حصار          |
| 10 | iskenderun       | 311111  | 251,682 | 31   | İskenderun           | İskenderun           | إسكندرونة                |
| 11 | ordu             | 741100  | 229,214 | 52   | Ordu                 | Ordu                 | أوردو                    |
| 12 | osmaniye         | 303195  | 202,837 | 91   | Osmaniye             | Osmaniye             | عثمانية                  |
| 13 | corlu            | 748893  | 202,578 | 59   | Çorlu                | Çorlu                | تشورلو                   |
| 14 | izmit            | 745028  | 196,571 | 41   | İzmit                | İzmit                | إزميت                    |
| 15 | bolu             | 750516  | 184,682 | 14   | Bolu                 | Bolu                 | بولو                     |

### Group 4b — GeoNames Arabic POLLUTED (15 cities, needs NAME_AR_FIX manual)

| # | Slug         | gid     | Pop     | adm1 | en             | tr             | Polluted ar (raw)  | Proposed CLEAN ar (manual) |
|---|--------------|---------|--------:|------|----------------|----------------|--------------------|----------------------------|
| 1 | malatya     | 304922 | 750,491 | 44   | Malatya        | Malatya        | مالاطیہ            | ملاطية                      |
| 2 | batman      | 321836 | 452,157 | 76   | Batman         | Batman         | ئێلح               | باتمان                      |
| 3 | elazig      | 315808 | 443,363 | 23   | Elazığ         | Elazığ         | الازیغ            | إلازيغ                      |
| 4 | antakya     | 323779 | 399,045 | 31   | Antakya        | Antakya        | antakyہ            | أنطاكية                     |
| 5 | alanya      | 324190 | 364,180 | 07   | Alanya         | Alanya         | آلانیا            | ألانيا                      |
| 6 | tarsus      | 299817 | 350,732 | 32   | Tarsus         | Tarsus         | تارسوس            | طرسوس                       |
| 7 | aksaray     | 324496 | 327,575 | 75   | Aksaray        | Aksaray        | aksrayے            | أكساراي                     |
| 8 | adiyaman    | 325330 | 290,883 | 02   | Adıyaman       | Adıyaman       | آدیامان           | أديامان                     |
| 9 | adapazari   | 752850 | 286,787 | 54   | Adapazarı      | Adapazarı      | آدابازاري         | أدابازاري                   |
| 10 | gebze      | 747014 | 281,436 | 41   | Gebze          | Gebze          | ضلع گیبزے           | غبزة                        |
| 11 | balikesir  | 322165 | 238,151 | 10   | Balıkesir      | Balıkesir      | بالِق أسير         | باليكسير                    |
| 12 | kirikkale  | 307654 | 186,960 | 79   | Kırıkkale      | Kırıkkale      | قیریق قلعہ         | قيريق قلعة                  |
| 13 | kuetahya   | 305268 | 185,008 | 43   | Kütahya        | Kütahya        | kwtaہya            | كوتاهية                     |
| 14 | edirne     | 747712 | 180,002 | 22   | Edirne         | Edirne         | أدرنة              | أدرنة (clean OK)             |
| 15 | karaman    | 309527 | 175,390 | 78   | Karaman        | Karaman        | قرامان             | قرامان (clean OK)            |

**Note**: edirne + karaman are actually clean — moved to Group 4a effectively
(only 13 need true manual NAME_AR_FIX; the other 2 are clean).

### Notable EXCLUDED candidates

| Candidate         | gid     | Pop     | Reason for exclusion                                          |
|-------------------|---------|--------:|---------------------------------------------------------------|
| **ueskuedar**     | 738329  | 524,452 | District of Istanbul (Asian side) — not standalone, per policy "لا تضف أحياء داخل مدينة أكبر" |
| osmangazi (PPLX) | 8542938 | —       | District of Bursa (existing match coords<1km)                  |
| sur (PPLX)       | 10048774| —       | District of Diyarbakır (existing match)                        |
| yakutiye (PPLX)  | 10332081| —       | District of Erzurum (existing match)                           |
| nazilli         | 303873  | 119,370 | PPLA2 of Aydın — close to Aydın city; will include if user wants |
| silifke         | 300808  | 132,665 | PPLA2 of Mersin — could include in future batch                |
| samandag        | 301975  | 123,447 | PPLA2 of Hatay — could include in future batch                 |

---

## Section 5 — Names Convention (Proposed)

For each new BATCH-A entry:

- `names.en` — GeoNames `name` field (e.g., "Eskişehir", "Çorum", "Kahramanmaraş")
  with Turkish diacritics preserved. Some entries may use ASCII forms in EN
  context (matches existing diyarbakir/sanliurfa pattern where en="Diyarbakir"
  ASCII vs tr="Diyarbakır" with ı). TBD per apply.
- `names.tr` — GeoNames `name` field (canonical Turkish form with İ ı Ş ş Ğ ğ
  Ç ç Ö ö Ü ü).
- `names.ar` — Either (a) GeoNames-clean Arabic if Stage-3 normalized form passes
  isCleanArabic, OR (b) MANUAL standard Turkish→Arabic phonetic transliteration
  if polluted (15-of-30 cases). Source: Arabic Wikipedia canonical titles +
  Sa'di/Othmani convention for Anatolian place names.

### Pre-existing TR convention (from 14 current curated entries):
- 4/14 use TR-specific chars: İstanbul, İzmir, Diyarbakır, Şanlıurfa
- 10/14 use same-as-en
- en strips diacritics on Diyarbakir/Sanliurfa (no ı in en form)

BATCH-A will follow same convention: tr keeps Turkish chars; en may use
ASCII form for slugs/H1 contexts.

---

## Section 6 — Risks Identified

| # | Risk                                                                                       | Severity | Mitigation                                                                 |
|---|--------------------------------------------------------------------------------------------|---------:|----------------------------------------------------------------------------|
| 1 | 13 of 30 candidates have polluted Arabic in GeoNames (Urdu/Persian-only letters ہ ی پ ے ګ گ etc.) | MEDIUM   | Manual NAME_AR_FIX for those 13 — same pattern as MCF waves; Wikipedia AR canonical |
| 2 | Several admin1 codes in raw differ from ISO 3166-2:TR provisional config (e.g., osmaniye=91 vs my 80, karaman=78 vs my 70, etc.) | LOW | Apply phase will verify empirically and patch tr.mjs admin1 map before any commit |
| 3 | Existing 14 TR have NO sourceId — gid-collision dedupe disabled                             | LOW      | Multi-key dedupe (slug + en-name + coords<1km) instead                      |
| 4 | en form may differ from tr (diacritics) — slug strategy needs decision                     | LOW      | Match existing pattern: ASCII slug, tr=full diacritics                      |
| 5 | "Üsküdar" 524k is a high-pop candidate but it's an Istanbul district                       | RESOLVED | EXCLUDED per "no districts" policy                                          |
| 6 | Some districts of major cities passed Stage-3 (osmangazi/sur/yakutiye)                     | RESOLVED | Marked as `existing` via coords<1km auto-match                              |

---

## Section 7 — Recommendation

**TR is READY for a SINGLE FAST apply wave** of ~25-30 cities. The
characteristics:

- **Scope:** 30 cities is within the 25-40 user range; no need to split into A/B
- **Risk:** LOW-MEDIUM (data quality issue confined to 13 manual NAME_AR_FIX
  cases, same pattern as PK-MCF/IN/MY waves)
- **Stage 1-3 complete**, candidates ready
- **No code/config changes required** (tr.mjs already created)
- **Schema matches existing TR entries** (ar/en/tr only — no other langs)

**Proposed name for the apply wave**:
`SUPPORTED-LOCAL-LANG-CITIES-TR-FAST` (Sub-phase C of FINAL-FAST)

**Suggested implementation**:
1. apply script: `scripts/geodata/_supported_local_lang_cities_tr_fast_apply.mjs`
2. Names per city: GeoNames `name` field for en+tr; manual ar for 13 polluted +
   GeoNames-clean ar for 17 others
3. Test suite + SSR smoke + search smoke + carry-forward regression
4. Single commit + closure report + STOP for user approval

---

## Section 8 — Confirmations (Read-Only Preflight)

✅ `db/places/curated-places.json` — **NOT MODIFIED** (read-only audit)
✅ Stage 4 apply — **NOT RUN**
✅ No apply script created
✅ No city added / deleted / mutated
✅ `server.js` / `js/app.js` / `index.html` — **NOT MODIFIED**
✅ `server/place-l10n/index.js` — **NOT MODIFIED**
✅ `docs/place-data-maintenance-policy.md` — **NOT MODIFIED**
✅ No runtime translation
✅ No fillchain
✅ No new wave started (still in PREFLIGHT state)

### Files created/modified in this preflight:
- ✅ NEW `scripts/geodata/countries/tr.mjs` (config — provisional admin1 map)
- ✅ NEW `db/places/sources/TR.zip` (3.5 MB, GeoNames CC-BY 4.0)
- ✅ NEW `db/places/sources/TR.txt` (13.3 MB, extracted)
- ✅ NEW `db/places/candidates/tr-geonames-raw.json` (54,597 rows, Stage 1)
- ✅ NEW `db/places/candidates/tr-geonames-normalized.json` (52,786 rows, Stage 2)
- ✅ NEW `db/places/candidates/tr-geonames-candidates.json` (52,786 rows, Stage 3)
- ✅ AUTO `reports/tr-geodata-import-report.md` (Stage-3 generated)
- ✅ AUTO `reports/tr-geodata-aliases-review.md` (Stage-3 generated)
- ✅ THIS `reports/supported-local-lang-cities-tr-preflight-1.md`

---

## STOP

Preflight phase complete. NO apply, NO curated mutation, NO code/docs changes.
**Awaiting user decision** on whether to proceed with `SUPPORTED-LOCAL-LANG-CITIES-TR-FAST`
apply wave (30 cities suggested).

If approved, the apply wave should be a SEPARATE phase to be started by user
request only. **Do NOT auto-start.**
