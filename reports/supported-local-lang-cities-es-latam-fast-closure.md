# SUPPORTED-LOCAL-LANG-CITIES-ES-LATAM-FAST — Closure Report

**Date:** 2026-05-21
**Wave:** Sub-phase B of SUPPORTED-LOCAL-LANG-CITIES-FINAL-FAST
**Pattern:** Dedupe-first, single-commit, no code changes
**Status:** CLOSED — user-approved 2026-05-21

---

## Acceptance Criteria

| #  | Criterion                                                                       | Result |
|----|---------------------------------------------------------------------------------|--------|
| 1  | ES entries grew exactly 45 → 57 (+12)                                           | ✅     |
| 2  | MX entries grew exactly 31 → 39 (+8)                                            | ✅     |
| 3  | AR entries grew exactly 10 → 22 (+12)                                           | ✅     |
| 4  | CO entries grew exactly 9 → 19 (+10)                                            | ✅     |
| 5  | PE entries grew exactly 13 → 18 (+5)                                            | ✅     |
| 6  | CL entries grew exactly 6 → 12 (+6)                                             | ✅     |
| 7  | VE entries grew exactly 9 → 13 (+4)                                             | ✅     |
| 8  | Total curated grew exactly 2,860 → 2,917 (+57)                                  | ✅     |
| 9  | Exactly 57 new cities added (within 50-70 user-approved range)                  | ✅     |
| 10 | Every new entry has EXACTLY `names.{ar, en, es}`                                | ✅     |
| 11 | No unsupported langs (ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/fr/de/tr/ms)    | ✅     |
| 12 | IN / ID / MY / PK / BD / FR / DE entries unchanged (SHA-256 byte-identity)      | ✅     |
| 13 | No modification to `server.js`                                                  | ✅     |
| 14 | No modification to `js/app.js`                                                  | ✅     |
| 15 | No modification to `index.html`                                                 | ✅     |
| 16 | No modification to `docs/place-data-maintenance-policy.md`                      | ✅     |
| 17 | No modification to `server/place-l10n/index.js`                                 | ✅     |
| 18 | No search-ranking patch                                                         | ✅     |
| 19 | No runtime translation (no MT, no browser translation, no live API)             | ✅     |
| 20 | No fillchain (only 3 declared lang keys per entry)                              | ✅     |
| 21 | No duplicate slugs / sourceIds / geonameIds across all 2,917 entries            | ✅     |
| 22 | Slug disambiguation documented: leon-mx, cordoba-ar, cartagena-co, valencia-ve  | ✅     |
| 23 | Total tests: 1,574/1,574 PASS (132 new + 51 SSR + 22 search + 1,369 carry)     | ✅     |
| 24 | No new sub-phase started (Sub-phase C + all other waves remain DEFERRED)        | ✅     |

**Outcome:** All 24 acceptance criteria met. Approved.

---

## Implementation Commit

`df86d85 — feat(geodata): SUPPORTED-LOCAL-LANG-CITIES-ES-LATAM-FAST — +57 cities across 7 countries`

---

## Summary

Added **57 new cities** across **7 Spanish-speaking countries**, each with EXACTLY
the three supported UI langs:

- `names.{ar, en, es}` — for ALL countries (Spain + LATAM)

No `names.fr/de/tr/ur/bn/id/ms/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa` — zero
forbidden-lang leakage (171 values verified).

**Counts:**

| Country         | Before | After |
|-----------------|-------:|------:|
| ES (Spain)      |     45 |    57 |
| MX (Mexico)     |     31 |    39 |
| AR (Argentina)  |     10 |    22 |
| CO (Colombia)   |      9 |    19 |
| PE (Peru)       |     13 |    18 |
| CL (Chile)      |      6 |    12 |
| VE (Venezuela)  |      9 |    13 |
| **Total**       | **123** | **180** |

**Total curated:** 2,860 → 2,917 (+57)

---

## Section 1 — 12 New ES Entries

| # | Slug                          | Pop     | gid     | Admin1 | Region                        | names.en                     | names.es                     | names.ar              |
|---|-------------------------------|--------:|---------|--------|-------------------------------|------------------------------|------------------------------|-----------------------|
| 1 | palma                        | 438,234 | 2512989 | 07     | Islas Baleares                | Palma                        | Palma                        | بالما                    |
| 2 | las-palmas-de-gran-canaria   | 383,516 | 2515270 | 53     | Canarias                      | Las Palmas de Gran Canaria   | Las Palmas de Gran Canaria   | لاس بالماس دي غران كاناريا |
| 3 | alicante                     | 348,901 | 2521978 | 60     | Comunidad Valenciana          | Alicante                     | Alicante                     | أليكانتي                  |
| 4 | vigo                         | 293,642 | 3105976 | 58     | Galicia                       | Vigo                         | Vigo                         | فيغو                      |
| 5 | hospitalet-de-llobregat      | 257,038 | 3120619 | 56     | Cataluña                      | Hospitalet de Llobregat      | **L'Hospitalet de Llobregat** | أوسبيتاليت دي يوبريغات    |
| 6 | vitoria-gasteiz              | 257,407 | 3104499 | 59     | País Vasco                    | Vitoria-Gasteiz              | Vitoria-Gasteiz              | فيتوريا-غاستيز            |
| 7 | a-coruna                     | 250,438 | 3119841 | 58     | Galicia                       | A Coruna                     | **A Coruña**                 | لا كورونيا                |
| 8 | terrassa                     | 218,535 | 3108286 | 56     | Cataluña                      | Terrassa                     | Terrassa                     | تيراسا                    |
| 9 | jerez-de-la-frontera         | 212,879 | 2516326 | 51     | Andalucía                     | Jerez de la Frontera         | Jerez de la Frontera         | خيريث دي لا فرونتيرا     |
| 10 | sabadell                    | 211,734 | 3111199 | 56     | Cataluña                      | Sabadell                     | Sabadell                     | سابادي                    |
| 11 | tarragona                   | 141,542 | 3108288 | 56     | Cataluña                      | Tarragona                    | Tarragona                    | تاراغونا                  |
| 12 | lleida                      | 140,797 | 3118514 | 56     | Cataluña                      | Lleida                       | Lleida                       | ليدا                      |

**Local-name differs from EN in 2/12 (17%)**: Hospitalet de Llobregat (es has Catalan L' apostrophe), A Coruña (es has ñ).

---

## Section 2 — 8 New MX Entries

| # | Slug                | Pop       | gid     | Admin1 | Region              | names.en              | names.es              | names.ar              |
|---|---------------------|----------:|---------|--------|---------------------|-----------------------|-----------------------|-----------------------|
| 1 | leon-mx            | 1,579,803 | 3998655 | 11     | Guanajuato          | León                  | León                  | ليون                    |
| 2 | mexicali           | 1,032,686 | 3996069 | 02     | Baja California     | Mexicali              | Mexicali              | مكسيكالي                |
| 3 | chihuahua          |   925,762 | 4014338 | 06     | Chihuahua           | Chihuahua             | Chihuahua             | تشيواوا                 |
| 4 | san-luis-potosi    |   722,772 | 3985606 | 24     | San Luis Potosí     | San Luis Potosí       | San Luis Potosí       | سان لويس بوتوسي         |
| 5 | aguascalientes     |   722,250 | 4019233 | 01     | Aguascalientes      | Aguascalientes        | Aguascalientes        | أغواسكاليينتيس         |
| 6 | saltillo           |   709,671 | 3988086 | 07     | Coahuila            | Saltillo              | Saltillo              | ساتييو                  |
| 7 | toluca             |   489,333 | 3515302 | 15     | México              | Toluca                | Toluca                | تولوكا                  |
| 8 | tampico            |   309,003 | 3516355 | 28     | Tamaulipas          | Tampico               | Tampico               | تامبيكو                 |

**Skipped from user examples**:
- Ciudad Juárez (gid 4013708) — already curated as `ciudad-juarez`
- Querétaro (gid 3991164) — already curated as `santiago-de-queretaro`

**Slug rename**: `leon-mx` (defensive vs ES `leon` gid 3118532 already curated).

---

## Section 3 — 12 New AR Entries (cordoba-ar disambig)

| # | Slug                    | Pop       | gid     | Admin1 | Region        | names.en                  | names.es                  | names.ar                |
|---|-------------------------|----------:|---------|--------|---------------|---------------------------|---------------------------|-------------------------|
| 1 | cordoba-ar              | 2,106,734 | 3860259 | 05     | Córdoba       | Córdoba                   | Córdoba                   | كوردوبا                  |
| 2 | rosario                | 948,312   | 3838583 | 21     | Santa Fe      | Rosario                   | Rosario                   | روساريو                  |
| 3 | mar-del-plata          | 593,337   | 3430863 | 01     | Buenos Aires  | Mar del Plata             | Mar del Plata             | مار ديل بلاتا           |
| 4 | san-miguel-de-tucuman  | 548,866   | 3836873 | 24     | Tucumán       | San Miguel de Tucumán     | San Miguel de Tucumán     | سان ميغيل دي توكومان    |
| 5 | santa-fe               | 391,164   | 3836277 | 21     | Santa Fe      | Santa Fe                  | Santa Fe                  | سانتا في                 |
| 6 | corrientes             | 346,334   | 3435217 | 06     | Corrientes    | Corrientes                | Corrientes                | كوريينتيس                |
| 7 | bahia-blanca           | 299,101   | 3865086 | 01     | Buenos Aires  | Bahía Blanca              | Bahía Blanca              | باهيا بلانكا            |
| 8 | resistencia            | 290,793   | 3429577 | 03     | Chaco         | Resistencia               | Resistencia               | ريسيستينسيا              |
| 9 | neuquen                | 231,198   | 3843123 | 15     | Neuquén       | Neuquén                   | Neuquén                   | نيوكين                   |
| 10 | la-plata              | 195,443   | 3432043 | 01     | Buenos Aires  | La Plata                  | La Plata                  | لا بلاتا                |
| 11 | mendoza               | 114,893   | 3844421 | 13     | Mendoza       | Mendoza                   | Mendoza                   | مندوزا                   |
| 12 | san-juan              | 109,123   | 3837213 | 18     | San Juan      | San Juan                  | San Juan                  | سان خوان                |

**Slug rename**: `cordoba-ar` (defensive vs `cordoba` ES + `cordoba-mx` MX).

---

## Section 4 — 10 New CO Entries (cartagena-co disambig)

| # | Slug              | Pop       | gid     | Admin1 | Region              | names.en       | names.es       | names.ar           |
|---|-------------------|----------:|---------|--------|---------------------|----------------|----------------|--------------------|
| 1 | cali             | 2,392,877 | 3687925 | 29     | Valle del Cauca     | Cali           | Cali           | كالي                |
| 2 | medellin         | 1,999,979 | 3674962 | 02     | Antioquia           | Medellín       | Medellín       | ميديلين             |
| 3 | barranquilla     | 1,206,319 | 3689147 | 04     | Atlántico           | Barranquilla   | Barranquilla   | بارانكييا           |
| 4 | cartagena-co     |   914,552 | 3687238 | 35     | Bolívar             | Cartagena      | Cartagena      | كارتاخينا           |
| 5 | cucuta           |   777,106 | 3685533 | 21     | Norte de Santander  | Cúcuta         | Cúcuta         | كوكوتا              |
| 6 | bucaramanga      |   581,130 | 3688465 | 26     | Santander           | Bucaramanga    | Bucaramanga    | بوكارامانغا         |
| 7 | ibague           |   529,635 | 3680656 | 28     | Tolima              | Ibagué         | Ibagué         | إيباغي              |
| 8 | santa-marta      |   499,192 | 3668605 | 38     | Magdalena           | Santa Marta    | Santa Marta    | سانتا مارتا         |
| 9 | pereira          |   467,269 | 3672486 | 24     | Risaralda           | Pereira        | Pereira        | بيريرا              |
| 10 | manizales       |   434,403 | 3675443 | 37     | Caldas              | Manizales      | Manizales      | مانيزاليس           |

**Slug rename**: `cartagena-co` (defensive vs ES `cartagena`).

---

## Section 5 — 5 New PE Entries (Tarapoto skipped)

| # | Slug      | Pop      | gid     | Admin1 | Region        | names.en   | names.es   | names.ar       |
|---|-----------|---------:|---------|--------|---------------|------------|------------|----------------|
| 1 | trujillo |  919,899 | 3691175 | 13     | La Libertad   | Trujillo   | Trujillo   | تروخيو          |
| 2 | huancayo |  456,250 | 3939459 | 12     | Junín         | Huancayo   | Huancayo   | هوانكايو         |
| 3 | pucallpa |  326,040 | 3693345 | 25     | Ucayali       | Pucallpa   | Pucallpa   | بوكالبا          |
| 4 | tacna    |  286,240 | 3928128 | 23     | Tacna         | Tacna      | Tacna      | تاكنا            |
| 5 | cajamarca|  201,329 | 3699088 | 06     | Cajamarca    | Cajamarca  | Cajamarca  | كاخاماركا       |

**Skipped from user examples**:
- Tarapoto — GeoNames raw has only pop=0 / pop=193 entries (data-quality issue similar to ID wave Banjarmasin); deferred until proper gid surfaces.

---

## Section 6 — 6 New CL Entries

| # | Slug          | Pop      | gid     | Admin1 | Region        | names.en       | names.es       | names.ar           |
|---|---------------|---------:|---------|--------|---------------|----------------|----------------|--------------------|
| 1 | antofagasta  |  401,096 | 3899539 | 03     | Antofagasta   | Antofagasta    | Antofagasta    | أنتوفاغاستا         |
| 2 | valparaiso   |  282,448 | 3868626 | 01     | Valparaíso    | Valparaíso     | Valparaíso     | فالبارايسو          |
| 3 | temuco       |  238,129 | 3870011 | 04     | Araucanía     | Temuco         | Temuco         | تيموكو              |
| 4 | concepcion   |  223,574 | 3893894 | 06     | Biobío        | Concepción     | Concepción     | كونسيبسيون          |
| 5 | rancagua     |  212,695 | 3873775 | 08     | O'Higgins     | Rancagua       | Rancagua       | رانكاغوا            |
| 6 | la-serena    |  154,521 | 3884373 | 07     | Coquimbo      | La Serena      | La Serena      | لا سيرينا           |

---

## Section 7 — 4 New VE Entries (valencia-ve disambig)

| # | Slug             | Pop       | gid     | Admin1 | Region    | names.en        | names.es        | names.ar          |
|---|------------------|----------:|---------|--------|-----------|-----------------|-----------------|-------------------|
| 1 | maracaibo       | 1,752,602 | 3633009 | 23     | Zulia     | Maracaibo       | Maracaibo       | ماراكايبو          |
| 2 | valencia-ve     | 1,619,470 | 3625549 | 07     | Carabobo  | Valencia        | Valencia        | فالنسيا             |
| 3 | ciudad-guayana  |   978,202 | 3645528 | 06     | Bolívar   | Ciudad Guayana  | Ciudad Guayana  | سيوداد غوايانا    |
| 4 | maracay         |   464,700 | 3632998 | 04     | Aragua    | Maracay         | Maracay         | ماراكاي             |

**Slug rename**: `valencia-ve` (defensive vs ES `valencia`).

---

## Section 8 — Skipped / Rejected (User Examples Already Curated or Issues)

### ES (10 user examples already curated)
Murcia, Bilbao, Córdoba, Valladolid, Gijón, Granada, Elche, Oviedo, Badalona, Cartagena.

### MX (7 user examples already curated or skipped)
Guadalajara, Monterrey, Puebla, Tijuana, Zapopan, Mérida, Culiacán, Cancún (all already curated).
Ciudad Juárez (gid 4013708 already curated as `ciudad-juarez`), Querétaro/Santiago de Querétaro (gid 3991164 already curated as `santiago-de-queretaro`).

### AR
Salta — already curated.

### PE (5 user examples already curated)
Arequipa, Chiclayo, Piura, Iquitos, Cusco — all already curated.
Tarapoto — gid pop=0 data quality, deferred.

### VE
Barquisimeto, Maturín — already curated.

---

## Section 9 — Defensive Disambiguation Slugs

Four slug renames to prevent collision with existing curated entries:

| New slug         | Existing slug(s)              | Resolution |
|------------------|-------------------------------|------------|
| `leon-mx`        | `leon` (ES, gid 3118532)      | MX León gid 3998655 → defensive `-mx` suffix |
| `cordoba-ar`     | `cordoba` (ES), `cordoba-mx` (MX) | AR Córdoba gid 3860259 → defensive `-ar` suffix |
| `cartagena-co`   | `cartagena` (ES)              | CO Cartagena gid 3687238 → defensive `-co` suffix |
| `valencia-ve`    | `valencia` (ES)               | VE Valencia gid 3625549 → defensive `-ve` suffix |

Follows existing convention: nice-fr / bharatpur-in / saint-denis-fr / laval-fr.

---

## Section 10 — Strict Invariants (All Pass)

1. ✅ Per-slug SHA-256 byte-identity for all 2,860 pre-existing entries
2. ✅ Total count delta = exactly +57 (2860 → 2917)
3. ✅ Per-country counts: ES +12, MX +8, AR +12, CO +10, PE +5, CL +6, VE +4
4. ✅ No duplicate slug across all 2,917 entries
5. ✅ No duplicate sourceId / geonameId across all 2,917 entries
6. ✅ All 57 new entries have exactly `[ar, en, es]` lang-keys
7. ✅ All 171 (57×3) values pass per-lang script guards (strict ar)
8. ✅ Zero forbidden-lang leakage (ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/fr/de/tr/ms)
9. ✅ Defensive disambiguation slugs verified
10. ✅ All required fields present (slug, cc, lat/lng, timezone, names.{ar,en,es}, source=geonames, sourceId)

---

## Section 11 — Tests Run

### New ES-LATAM-specific tests
- `scripts/_test_supported_local_lang_cities_es_latam_fast.mjs`: **132 / 132 PASS** (10 groups including disambiguation Group 10)
- `scripts/_smoke_supported_local_lang_cities_es_latam_fast.mjs` (SSR): **51 / 51 PASS**
  - 27 new cities × /es/ across 7 countries
  - 5 Arabic baseline + 2 EN baseline
  - 5 disambiguation regression (cordoba/cordoba-mx/cartagena/valencia/leon still resolve)
  - 12 regression (Kota Malang, Kuala Lumpur, Putrajaya, Karachi /ur/, Dhaka /bn/, Jalgaon /ur/, Thrissur /bn/, Strasbourg /fr/, Dresden /de/, Saint-Denis-fr /fr/, Zwickau /de/, Gwangju /ur/ fallback)
- `scripts/_smoke_supported_local_lang_cities_es_latam_search.mjs` (search): **22 / 22 PASS**
  - 12 EN-name + 5 ES-accented + 5 Arabic-name queries

### Carry-forward (count-drift updated 2860 → 2917)
- `_test_supported_local_lang_cities_fr_de_fast.mjs`: 156/156
- `_test_supported_local_lang_cities_fr_de_b_fast.mjs`: 165/165
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

**Grand total: 1,501 offline + 73 SSR/search = 1,574 zero failures.**

---

## Section 12 — Files Untouched (Verified)

```
$ git diff --stat HEAD -- server.js js/app.js index.html docs/place-data-maintenance-policy.md server/place-l10n/index.js
(empty — 0 bytes)
```

✅ `server.js` / `js/app.js` / `index.html` / `server/place-l10n/index.js` / `docs/place-data-maintenance-policy.md` — 0-byte diff
✅ Search-ranking code untouched
✅ India/Indonesia/Malaysia/Pakistan/Bangladesh/France/Germany entries byte-identical
✅ All other non-ES/MX/AR/CO/PE/CL/VE countries byte-identical

---

## Section 13 — No Runtime Translation, No Fillchain, No MT

- All 57 `names.ar` values written manually via standard Spanish→Arabic phonetic
  transliteration following existing conventions (cordoba=قرطبة historical /
  cordoba-mx=كوردوبا phonetic; this wave uses phonetic for non-historical names).
- `names.en` / `names.es` from GeoNames raw `name` field. No untagged GeoNames
  alternates. No MT.
- Only `{ar, en, es}` keys — no fillchain to fr/de/tr/ur/bn/id/ms.

---

## Section 14 — Files Created in This Wave

- `scripts/geodata/_supported_local_lang_cities_es_latam_fast_apply.mjs`
- `scripts/_test_supported_local_lang_cities_es_latam_fast.mjs`
- `scripts/_smoke_supported_local_lang_cities_es_latam_fast.mjs`
- `scripts/_smoke_supported_local_lang_cities_es_latam_search.mjs`
- `db/places/curated-places.json.preSupportedEsLatamFast.bak`
- `reports/supported-local-lang-cities-es-latam-fast-apply-report.json`
- `reports/supported-local-lang-cities-es-latam-fast-closure.md` (this)

Count-drift refresh (2860 → 2917) in 11 existing test files.

---

## Section 15 — STOP

Wave applied successfully. No code, docs, or policy changes.

**Closure approval received from user on 2026-05-21.**
Marker: `docs(closure): mark SUPPORTED-LOCAL-LANG-CITIES-ES-LATAM-FAST user-approved 2026-05-21`

Status moved from `awaiting user approval` → `CLOSED — user-approved 2026-05-21`.

No new sub-phase started. The following remain DEFERRED — DO NOT auto-start:
- Sub-phase C: SUPPORTED-LOCAL-LANG-CITIES-TR-FAST (needs Stage-1 preflight)
- Any new FR/DE batch
- ASIA-1F (CN solo)
- AMERICAS (non-Spanish-speaking countries)
- SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2
- search-ranking
- Hijri pages
- DELETE-V1
- geocode proxy
- any separate L10N waves
- any new city batch
