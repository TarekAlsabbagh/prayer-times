# SUPPORTED-LOCAL-LANG-CITIES-TR-FAST — Closure Report

**Date:** 2026-05-21
**Wave:** Sub-phase C of SUPPORTED-LOCAL-LANG-CITIES-FINAL-FAST
**Pattern:** Dedupe-first, single-commit, no code changes
**Status:** CLOSED — user-approved 2026-05-21

---

## Acceptance Criteria

| #  | Criterion                                                                       | Result |
|----|---------------------------------------------------------------------------------|--------|
| 1  | TR entries grew exactly 14 → 44 (+30)                                           | ✅     |
| 2  | Total curated grew exactly 2,917 → 2,947 (+30)                                  | ✅     |
| 3  | Exactly 30 new cities added (BATCH-A complete, within 25-40 range)              | ✅     |
| 4  | Every new entry has EXACTLY `names.{ar, en, tr}`                                | ✅     |
| 5  | No unsupported langs (ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/fr/de/es/ms)    | ✅     |
| 6  | Prior 14 TR entries unchanged (SHA-256 byte-identity)                           | ✅     |
| 7  | IN / ID / MY / PK / BD / FR / DE / ES-LATAM entries unchanged                   | ✅     |
| 8  | No modification to `server.js`                                                  | ✅     |
| 9  | No modification to `js/app.js`                                                  | ✅     |
| 10 | No modification to `index.html`                                                 | ✅     |
| 11 | No modification to `docs/place-data-maintenance-policy.md`                      | ✅     |
| 12 | No modification to `server/place-l10n/index.js`                                 | ✅     |
| 13 | No search-ranking patch                                                         | ✅     |
| 14 | No runtime translation (no MT, no browser translation, no live API)             | ✅     |
| 15 | No fillchain (only 3 declared lang keys per entry)                              | ✅     |
| 16 | No duplicate slugs / sourceIds / geonameIds across all 2,947 entries            | ✅     |
| 17 | No Arabic pollution — all 30 names.ar pass strict isCleanArabic                 | ✅     |
| 18 | Manual NAME_AR_FIX documented for 15 cities (6 Wiki AR + 9 translit)            | ✅     |
| 19 | Total tests: 1,700/1,700 PASS (139 new + 38 SSR + 22 search + 1,501 carry)     | ✅     |
| 20 | No new sub-phase started (ASIA-1F + AMERICAS + all other waves remain DEFERRED) | ✅     |

**Outcome:** All 20 acceptance criteria met. Approved.

---

## Implementation Commit

`463501a — feat(geodata): SUPPORTED-LOCAL-LANG-CITIES-TR-FAST — +30 Turkish cities with ar/en/tr only`

---

## Summary

Added **30 Turkish cities** to curated, each with EXACTLY `names.{ar, en, tr}` per
place-data-maintenance-policy §2. No other lang keys present (zero forbidden-lang
leakage across 90 values).

All 15 polluted-Arabic candidates from GeoNames (Urdu/Persian-only letters
ہ ی پ ے ګ گ) were replaced with user-approved manual transliteration per
TR-PREFLIGHT-1 §4b.

**Counts:**

| Metric            | Before | After |
|-------------------|-------:|------:|
| Total curated     |   2917 |  2947 |
| TR entries        |     14 |    44 |

---

## Section 1 — 30 New Cities

### Group 4a — Clean GeoNames Arabic (15 cities)

| # | Slug             | gid     | Pop     | adm1 (FIPS) | Region          | names.en        | names.tr         | names.ar              | ar source |
|---|------------------|---------|--------:|-------------|-----------------|-----------------|------------------|-----------------------|-----------|
| 1 | eskisehir        | 315202  | 921,630 | 26          | Eskişehir        | Eskisehir        | **Eskişehir**    | أسكي شهر               | GN-clean  |
| 2 | van              | 298117  | 525,016 | 65          | Van              | Van              | Van              | وان                    | GN-clean  |
| 3 | samsun           | 740264  | 394,050 | 55          | Samsun           | Samsun           | Samsun           | سامسون                 | GN-clean  |
| 4 | kahramanmaras   | 310859  | 384,953 | 46          | Kahramanmaraş    | Kahramanmaras    | **Kahramanmaraş**| كهرمان مرعش           | GN-clean  |
| 5 | usak             | 298299  | 369,433 | 64          | Uşak             | Usak             | **Uşak**         | أوشاك                  | GN-clean  |
| 6 | denizli          | 317109  | 313,238 | 20          | Denizli          | Denizli          | Denizli          | دنيزلي                 | GN-clean  |
| 7 | corum            | 748879  | 269,595 | 19          | Çorum            | Corum            | **Çorum**        | جوروم                  | GN-clean  |
| 8 | sivas            | 300619  | 264,022 | 58          | Sivas            | Sivas            | Sivas            | سيواس                  | GN-clean  |
| 9 | afyonkarahisar   | 325303  | 251,799 | 03          | Afyonkarahisar   | Afyonkarahisar   | Afyonkarahisar   | أفيون قره حصار         | GN-clean  |
| 10 | iskenderun      | 311111  | 251,682 | 31          | Hatay            | Iskenderun       | **İskenderun**   | إسكندرونة              | GN-clean  |
| 11 | ordu            | 741100  | 229,214 | 52          | Ordu             | Ordu             | Ordu             | أوردو                  | GN-clean  |
| 12 | osmaniye        | 303195  | 202,837 | 91 *(FIPS)* | Osmaniye         | Osmaniye         | Osmaniye         | عثمانية                | GN-clean  |
| 13 | corlu           | 748893  | 202,578 | 59          | Tekirdağ         | Corlu            | **Çorlu**        | تشورلو                 | GN-clean  |
| 14 | izmit           | 745028  | 196,571 | 41          | Kocaeli          | Izmit            | **İzmit**        | إزميت                  | GN-clean  |
| 15 | bolu            | 750516  | 184,682 | 14          | Bolu             | Bolu             | Bolu             | بولو                   | GN-clean  |

### Group 4b — Manual NAME_AR_FIX (15 cities — GeoNames Arabic was polluted)

| # | Slug         | gid     | Pop     | adm1 (FIPS) | Region          | names.en      | names.tr       | names.ar (manual) | ar source |
|---|--------------|---------|--------:|-------------|-----------------|---------------|----------------|-------------------|-----------|
| 16 | malatya     | 304922  | 750,491 | 44          | Malatya         | Malatya       | Malatya        | ملاطية              | MANUAL:WikipediaAR |
| 17 | batman      | 321836  | 452,157 | 76 *(FIPS)* | Batman          | Batman        | Batman         | باتمان              | MANUAL:translit |
| 18 | elazig      | 315808  | 443,363 | 23          | Elazığ          | Elazig        | **Elazığ**     | إيلازيغ             | MANUAL:translit |
| 19 | antakya     | 323779  | 399,045 | 31          | Hatay           | Antakya       | Antakya        | أنطاكيا             | MANUAL:WikipediaAR |
| 20 | alanya      | 324190  | 364,180 | 07          | Antalya         | Alanya        | Alanya         | ألانيا              | MANUAL:WikipediaAR |
| 21 | tarsus      | 299817  | 350,732 | 32 *(FIPS)* | Mersin          | Tarsus        | Tarsus         | طرسوس               | MANUAL:WikipediaAR |
| 22 | aksaray     | 324496  | 327,575 | 75 *(FIPS)* | Aksaray         | Aksaray       | Aksaray        | أق سراي             | MANUAL:WikipediaAR |
| 23 | adiyaman    | 325330  | 290,883 | 02          | Adıyaman        | Adiyaman      | **Adıyaman**   | أديامان             | MANUAL:translit |
| 24 | adapazari   | 752850  | 286,787 | 54          | Sakarya         | Adapazari     | **Adapazarı**  | أدابازاري           | MANUAL:translit |
| 25 | gebze       | 747014  | 281,436 | 41          | Kocaeli         | Gebze         | Gebze          | غبزة                | MANUAL:translit |
| 26 | balikesir   | 322165  | 238,151 | 10          | Balıkesir       | Balikesir     | **Balıkesir**  | باليكسير            | MANUAL:translit |
| 27 | kirikkale   | 307654  | 186,960 | 79 *(FIPS)* | Kırıkkale       | Kirikkale     | **Kırıkkale**  | كيريكالي            | MANUAL:translit |
| 28 | kuetahya    | 305268  | 185,008 | 43          | Kütahya         | Kutahya       | **Kütahya**    | كوتاهية             | MANUAL:translit |
| 29 | edirne      | 747712  | 180,002 | 22          | Edirne          | Edirne        | Edirne         | أدرنة               | MANUAL:WikipediaAR |
| 30 | karaman     | 309527  | 175,390 | 78 *(FIPS)* | Karaman         | Karaman       | Karaman        | قرمان               | MANUAL:translit |

**FIPS note**: GeoNames TR uses FIPS admin1 codes for newer provinces (created
post-1989) differing from ISO 3166-2:TR — e.g., ISO 80=Osmaniye → FIPS 91,
ISO 33=Mersin → FIPS 32, ISO 68=Aksaray → FIPS 75, ISO 71=Kırıkkale → FIPS 79,
ISO 70=Karaman → FIPS 78, ISO 72=Batman → FIPS 76. Stored `admin1Code` reflects
FIPS (raw source). `regionAr`/`regionEn` set manually per city to the correct
semantic value.

**Local-name differences (names.tr vs names.en)**:
- 13/30 (43%) use Turkish-specific chars in names.tr: Eskişehir, Kahramanmaraş,
  Uşak, Çorum, İskenderun, Çorlu, İzmit, Elazığ, Adıyaman, Adapazarı, Balıkesir,
  Kırıkkale, Kütahya.
- 17/30 (57%) same-as-en (proper nouns identical in en/tr: Van, Samsun, Sivas,
  Bolu, Malatya, Batman, Antakya, Alanya, Tarsus, Aksaray, Ordu, etc.).

---

## Section 2 — Excluded Candidates

| Candidate    | gid       | Pop     | Reason for exclusion                                                          |
|--------------|-----------|--------:|-------------------------------------------------------------------------------|
| ueskuedar    | 738329    | 524,452 | District of Istanbul (Asian side) — not a standalone city, per "no districts" policy |
| osmangazi    | 8542938   | —       | District of Bursa (matched-existing via coords<1km)                            |
| sur          | 10048774  | —       | District of Diyarbakır (matched-existing via coords<1km)                       |
| yakutiye     | 10332081  | —       | District of Erzurum (matched-existing via coords<1km)                          |
| nazilli      | 303873    | 119,370 | PPLA2 of Aydın — deferred for potential future batch                           |
| silifke      | 300808    | 132,665 | PPLA2 of Mersin — deferred for potential future batch                          |
| samandag     | 301975    | 123,447 | PPLA2 of Hatay — deferred                                                      |

---

## Section 3 — Manual NAME_AR_FIX Justification

15 cities have GeoNames `name.ar` polluted with Urdu/Persian-only chars
(ہ ی پ ے ګ گ). Manual replacement applied per TR-PREFLIGHT-1 §4b.

Sources:
- **MANUAL:WikipediaAR** (6 cities) — Arabic Wikipedia canonical title verified:
  malatya (ملاطية), antakya (أنطاكيا), alanya (ألانيا), tarsus (طرسوس),
  aksaray (أق سراي), edirne (أدرنة).
- **MANUAL:translit** (9 cities) — Standard Turkish→Arabic phonetic translit
  matching existing 14 TR curated conventions: batman (باتمان), elazig (إيلازيغ),
  adiyaman (أديامان), adapazari (أدابازاري), gebze (غبزة), balikesir (باليكسير),
  kirikkale (كيريكالي), kuetahya (كوتاهية), karaman (قرمان).

NO Google Translate, NO OpenAI/Anthropic, NO browser translation, NO runtime
translation, NO fillchain.

---

## Section 4 — Strict Invariants (All Pass)

1. ✅ Per-slug SHA-256 byte-identity for all 2,917 pre-existing entries
2. ✅ Total count delta = exactly +30 (2917 → 2947)
3. ✅ TR count delta = exactly +30 (14 → 44)
4. ✅ Prior 14 TR entries byte-identical
5. ✅ IN / ID / MY / PK / BD / FR / DE / ES / MX / AR / CO / PE / CL / VE byte-identical
6. ✅ No duplicate slug across all 2,947 entries
7. ✅ No duplicate sourceId / geonameId across all 2,947 entries
8. ✅ All 30 new entries have exactly `[ar, en, tr]` lang-keys
9. ✅ Zero forbidden-lang leakage (ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/fr/de/es/ms)
10. ✅ All 30 `names.ar` pass strict `isCleanArabic` (NO Urdu/Persian letters)
11. ✅ All 60 (30 × 2) `names.en` + `names.tr` pass Latin guard
12. ✅ All 15 manual-fixed entries: `Group 12 — NAME_AR_FIX targets actually
    fixed (no pollution leaked)`: 15/15 pass

---

## Section 5 — Tests Run

### New TR-FAST-specific tests
- `scripts/_test_supported_local_lang_cities_tr_fast.mjs`: **139 / 139 PASS** (12 groups including strict Arabic-pollution check)
- `scripts/_smoke_supported_local_lang_cities_tr_fast.mjs` (SSR): **38 / 38 PASS**
  - 10 new TR × /tr/ + 5 Arabic baseline + 3 EN baseline
  - 4 pre-existing TR regression (İstanbul, İzmir, Diyarbakır, Şanlıurfa)
  - 13 cross-country regression (Kota Malang, Kuala Lumpur, Putrajaya, Karachi /ur/,
    Dhaka /bn/, Jalgaon /ur/, Thrissur /bn/, Strasbourg /fr/, Dresden /de/,
    Saint-Denis-fr /fr/, Zwickau /de/, Medellín /es/, Córdoba-AR /es/,
    Cartagena-CO /es/, Valencia-VE /es/, Gwangju /ur/ fallback)
- `scripts/_smoke_supported_local_lang_cities_tr_search.mjs` (search): **22 / 22 PASS**
  - 8 EN-ASCII queries + 8 TR-with-diacritics queries + 6 Arabic queries

### Carry-forward (count-drift updated 2917 → 2947)
- `_test_supported_local_lang_cities_es_latam_fast.mjs`: 132/132
- `_test_supported_local_lang_cities_fr_de_b_fast.mjs`: 165/165
- `_test_supported_local_lang_cities_fr_de_fast.mjs`: 156/156
- `_test_asia_1h_my_fast.mjs`: 105/105
- `_test_asia_1g_id_fast.mjs`: 73/73
- `_test_asia_1d_in_d_fast.mjs`: 105/105
- `_test_asia_1d_in_e_fast.mjs`: 106/106
- `_test_asia_1d_in_f_fast.mjs`: 57/57
- `_test_place_names_hi_in_1.mjs`: 116/116
- `_test_place_names_bn_in_1.mjs`: 113/113
- `_test_place_names_ur_in_1.mjs`: 122/122
- `_test_city_name_fallback_consistency_1.mjs`: 173/173
- `_test_supported_local_place_names_policy_1.mjs`: 78/78

**Grand total: 1,640 offline + 60 SSR/search = 1,700 zero failures.**

---

## Section 6 — Files Untouched (Verified)

```
$ git diff --stat HEAD -- server.js js/app.js index.html docs/place-data-maintenance-policy.md server/place-l10n/index.js
(empty — 0 bytes)
```

✅ `server.js` / `js/app.js` / `index.html` / `server/place-l10n/index.js` / `docs/place-data-maintenance-policy.md` — 0-byte diff
✅ Search-ranking code untouched
✅ India / Indonesia / Malaysia / Pakistan / Bangladesh entries byte-identical
✅ France / Germany entries byte-identical
✅ Spain / Mexico / Argentina / Colombia / Peru / Chile / Venezuela entries byte-identical
✅ All other non-TR countries byte-identical

---

## Section 7 — No Runtime Translation, No Fillchain, No MT

- All 30 `names.ar` values either GeoNames-clean (15) or user-approved manual
  transliteration (15). NO Google Translate / NO OpenAI/Anthropic / NO browser
  translation / NO runtime translation / NO fillchain.
- `names.en` = ASCII (Turkish diacritics stripped) matching existing
  diyarbakir/sanliurfa convention.
- `names.tr` = GeoNames raw `name` (full Turkish diacritics).
- Only `{ar, en, tr}` keys — no fillchain to other langs.

---

## Section 8 — Files Created in This Wave

- `scripts/geodata/_supported_local_lang_cities_tr_fast_apply.mjs`
- `scripts/_test_supported_local_lang_cities_tr_fast.mjs`
- `scripts/_smoke_supported_local_lang_cities_tr_fast.mjs`
- `scripts/_smoke_supported_local_lang_cities_tr_search.mjs`
- `db/places/curated-places.json.preSupportedTrFast.bak`
- `reports/supported-local-lang-cities-tr-fast-apply-report.json`
- `reports/supported-local-lang-cities-tr-fast-closure.md` (this)

### From preceding TR-PREFLIGHT-1 (already committed pre-this-wave but newly added/created in this session):
- `db/places/sources/TR.zip` (GeoNames CC-BY 4.0)
- `db/places/sources/TR.txt`
- `db/places/candidates/tr-geonames-raw.json`
- `db/places/candidates/tr-geonames-normalized.json`
- `db/places/candidates/tr-geonames-candidates.json`
- `scripts/geodata/countries/tr.mjs`
- `reports/tr-geodata-import-report.md` (auto-generated)
- `reports/tr-geodata-aliases-review.md` (auto-generated)
- `reports/supported-local-lang-cities-tr-preflight-1.md`

Count-drift refresh (2917 → 2947) in 12 existing test files.

---

## Section 9 — STOP

Wave applied successfully. No code, docs, or policy changes.

**Closure approval received from user on 2026-05-21.**
Marker: `docs(closure): mark SUPPORTED-LOCAL-LANG-CITIES-TR-FAST user-approved 2026-05-21`

Status moved from `awaiting user approval` → `CLOSED — user-approved 2026-05-21`.

### 🎯 SUPPORTED-LOCAL-LANG-CITIES-FINAL-FAST — ALL SUB-PHASES CLOSED

- ✅ Sub-phase A (FR + DE) — CLOSED `93e9ca6` (2026-05-21)
- ✅ Sub-phase A Batch B (FR + DE B) — CLOSED `97fe5ba` (2026-05-21)
- ✅ Sub-phase B (ES + LATAM 7 countries) — CLOSED `df86d85` (2026-05-21)
- ✅ Sub-phase C (TR-FAST) — CLOSED `463501a` (2026-05-21)

Total cities added across all 4 sub-phases: **187** (FR+DE 50 + FR+DE-B 50 + ES-LATAM 57 + TR 30).

### Remaining DEFERRED — DO NOT auto-start

- ASIA-1F (CN solo)
- AMERICAS (non-Spanish-speaking)
- SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2
- search-ranking
- Hijri pages
- DELETE-V1
- geocode proxy
- any separate L10N waves
- any new city batch
