# SUPPORTED-LOCAL-LANG-CITIES-FR-DE-FAST — Closure Report

**Date:** 2026-05-21
**Wave:** Sub-phase A of SUPPORTED-LOCAL-LANG-CITIES-FINAL-FAST
**Pattern:** Dedupe-first, single-commit, no code changes
**Status:** CLOSED — user-approved 2026-05-21

---

## Acceptance Criteria

| # | Criterion                                                                       | Result |
|---|---------------------------------------------------------------------------------|--------|
| 1 | FR entries grew exactly 25 → 50 (+25)                                           | ✅     |
| 2 | DE entries grew exactly 56 → 81 (+25)                                           | ✅     |
| 3 | Total curated grew exactly 2,760 → 2,810 (+50)                                  | ✅     |
| 4 | Exactly 50 new cities added (within 40-50 user-approved range)                  | ✅     |
| 5 | Every new FR entry has EXACTLY `names.{ar, en, fr}`                             | ✅     |
| 6 | Every new DE entry has EXACTLY `names.{ar, en, de}`                             | ✅     |
| 7 | No unsupported langs in new entries (ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/es/tr/ms) | ✅ |
| 8 | IN / ID / MY / PK / BD entries unchanged (SHA-256 byte-identity)                | ✅     |
| 9 | No modification to `server.js`                                                  | ✅     |
| 10 | No modification to `js/app.js`                                                  | ✅     |
| 11 | No modification to `index.html`                                                 | ✅     |
| 12 | No modification to `docs/place-data-maintenance-policy.md`                      | ✅     |
| 13 | No modification to `server/place-l10n/index.js`                                 | ✅     |
| 14 | No search-ranking patch                                                         | ✅     |
| 15 | No runtime translation (no MT, no browser translation, no live API)             | ✅     |
| 16 | No fillchain (only the 3 declared lang keys per entry)                          | ✅     |
| 17 | No duplicate slugs across all 2,810 entries                                     | ✅     |
| 18 | No duplicate geonameId / sourceId across all 2,810 entries                      | ✅     |
| 19 | Total tests: 1,264/1,264 PASS (156 new + 38 SSR + 22 search + 1,048 carry)     | ✅     |
| 20 | No new sub-phase started (Sub-phase B + C remain DEFERRED)                      | ✅     |

**Outcome:** All 20 acceptance criteria met. Approved.

---

## Implementation Commit

`93e9ca6 — feat(geodata): SUPPORTED-LOCAL-LANG-CITIES-FR-DE-FAST — +50 cities (FR 25 + DE 25)`

---

## Summary

Added **50 new cities** (25 France + 25 Germany) to `curated-places.json`,
each with EXACTLY the three supported UI langs required per country:

- **France** → `names.{ar, en, fr}`
- **Germany** → `names.{ar, en, de}`

No `names.ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/es/tr/ms` — zero
forbidden-lang leakage (verified across 150 values).

**Counts:**

| Metric            | Before | After |
|-------------------|-------:|------:|
| Total curated     |   2760 |  2810 |
| FR entries        |     25 |    50 |
| DE entries        |     56 |    81 |

---

## Section 1 — 25 New FR Entries

| # | Slug          | Pop     | Admin1 | Region                      | names.en      | names.fr      | names.ar          | Source / diff |
|---|---------------|--------:|--------|-----------------------------|---------------|---------------|-------------------|---------------|
| 1 | strasbourg    | 274,845 | 44     | Grand Est                   | Strasbourg    | Strasbourg    | ستراسبورغ          | GeoNames; same-as-en |
| 2 | montpellier   | 248,252 | 76     | Occitanie                   | Montpellier   | Montpellier   | مونبلييه           | GeoNames; same-as-en |
| 3 | lille         | 238,695 | 32     | Hauts-de-France             | Lille         | Lille         | ليل                | GeoNames; same-as-en |
| 4 | reims         | 196,565 | 44     | Grand Est                   | Reims         | Reims         | ريمس               | GeoNames; same-as-en |
| 5 | angers        | 168,279 | 52     | Pays de la Loire            | Angers        | Angers        | أنجيه              | GeoNames; same-as-en |
| 6 | nimes         | 148,236 | 76     | Occitanie                   | Nimes         | **Nîmes**     | نيم                | GeoNames; fr has accent |
| 7 | brest         | 144,899 | 53     | Bretagne                    | Brest         | Brest         | بريست              | GeoNames; same-as-en |
| 8 | amiens        | 143,086 | 32     | Hauts-de-France             | Amiens        | Amiens        | أميان              | GeoNames; same-as-en |
| 9 | limoges       | 141,176 | 75     | Nouvelle-Aquitaine          | Limoges       | Limoges       | ليموج              | GeoNames; same-as-en |
| 10 | mulhouse     | 111,430 | 44     | Grand Est                   | Mulhouse      | Mulhouse      | مولوز              | GeoNames; same-as-en |
| 11 | avignon      |  89,769 | 93     | Provence-Alpes-Côte d'Azur  | Avignon       | Avignon       | أفينيون            | GeoNames; same-as-en |
| 12 | poitiers     |  85,960 | 75     | Nouvelle-Aquitaine          | Poitiers      | Poitiers      | بواتييه            | GeoNames; same-as-en |
| 13 | versailles   |  85,416 | 11     | Île-de-France               | Versailles    | Versailles    | فرساي              | GeoNames; same-as-en |
| 14 | pau          |  82,697 | 75     | Nouvelle-Aquitaine          | Pau           | Pau           | بو                 | GeoNames; same-as-en |
| 15 | la-rochelle  |  76,810 | 75     | Nouvelle-Aquitaine          | La Rochelle   | La Rochelle   | لا روشيل           | GeoNames; same-as-en |
| 16 | antibes      |  76,393 | 93     | Provence-Alpes-Côte d'Azur  | Antibes       | Antibes       | أنتيب              | GeoNames; same-as-en |
| 17 | cannes       |  74,545 | 93     | Provence-Alpes-Côte d'Azur  | Cannes        | Cannes        | كان                | GeoNames; same-as-en |
| 18 | calais       |  74,433 | 32     | Hauts-de-France             | Calais        | Calais        | كاليه              | GeoNames; same-as-en |
| 19 | beziers      |  74,081 | 76     | Occitanie                   | Beziers       | **Béziers**   | بيزييه             | GeoNames; fr has accent |
| 20 | dunkirk      |  71,287 | 32     | Hauts-de-France             | **Dunkirk**   | **Dunkerque** | دونكيرك            | GeoNames; en=English exonym, fr=local |
| 21 | bourges      |  67,987 | 24     | Centre-Val de Loire         | Bourges       | Bourges       | بورج               | GeoNames; same-as-en |
| 22 | saint-nazaire|  67,054 | 52     | Pays de la Loire            | Saint-Nazaire | Saint-Nazaire | سان نازير          | GeoNames; same-as-en |
| 23 | colmar       |  65,405 | 44     | Grand Est                   | Colmar        | Colmar        | كولمار             | GeoNames; same-as-en |
| 24 | valence      |  63,864 | 84     | Auvergne-Rhône-Alpes        | Valence       | Valence       | فالنس              | GeoNames; same-as-en |
| 25 | quimper      |  63,849 | 53     | Bretagne                    | Quimper       | Quimper       | كيمبر              | GeoNames; same-as-en |

**Local-name differs from EN in 3/25 (12%)** — accents (Nîmes, Béziers) or
English exonym (Dunkirk/Dunkerque). Remaining 22 use same-as-en, which is
the **correct** localization (Strasbourg/Lille/Cannes have identical EN and
FR forms — proper nouns).

---

## Section 2 — 25 New DE Entries

| # | Slug              | Pop     | Admin1 | Region                    | names.en          | names.de             | names.ar           | Source / diff |
|---|-------------------|--------:|--------|---------------------------|-------------------|----------------------|--------------------|---------------|
| 1 | dresden          | 564,904 | 13     | Sachsen                    | Dresden            | Dresden              | دريسدن              | GeoNames; same-as-en |
| 2 | leipzig          | 504,971 | 13     | Sachsen                    | Leipzig            | Leipzig              | لايبزغ              | GeoNames; same-as-en |
| 3 | muenster         | 308,258 | 07     | Nordrhein-Westfalen        | Munster            | **Münster**          | مونستر              | GeoNames; de has umlaut |
| 4 | wiesbaden        | 288,850 | 05     | Hessen                     | Wiesbaden          | Wiesbaden            | فيسبادن             | GeoNames; same-as-en |
| 5 | braunschweig     | 244,715 | 06     | Niedersachsen              | **Brunswick**      | **Braunschweig**     | براونشفايغ          | GeoNames; en=English exonym |
| 6 | magdeburg        | 244,329 | 14     | Sachsen-Anhalt             | Magdeburg          | Magdeburg            | ماغديبورغ           | GeoNames; same-as-en |
| 7 | oberhausen       | 219,176 | 07     | Nordrhein-Westfalen        | Oberhausen         | Oberhausen           | أوبرهاوزن           | GeoNames; same-as-en |
| 8 | erfurt           | 218,793 | 15     | Thüringen                  | Erfurt             | Erfurt               | إرفورت              | GeoNames; same-as-en |
| 9 | hagen            | 198,972 | 07     | Nordrhein-Westfalen        | Hagen              | Hagen                | هاغن                | GeoNames; same-as-en |
| 10 | rostock         | 198,293 | 12     | Mecklenburg-Vorpommern     | Rostock            | Rostock              | روستوك              | GeoNames; same-as-en |
| 11 | potsdam         | 184,754 | 11     | Brandenburg                | Potsdam            | Potsdam              | بوتسدام             | GeoNames; same-as-en |
| 12 | saarbruecken    | 182,971 | 09     | Saarland                   | Saarbrucken        | **Saarbrücken**      | ساربروكن            | GeoNames; de has umlaut |
| 13 | muelheim        | 173,050 | 07     | Nordrhein-Westfalen        | Mulheim            | **Mülheim**          | مولهايم             | GeoNames; de has umlaut |
| 14 | leverkusen      | 162,738 | 07     | Nordrhein-Westfalen        | Leverkusen         | Leverkusen           | ليفركوزن            | GeoNames; same-as-en |
| 15 | fuerth          | 132,036 | 02     | Bayern                     | Furth              | **Fürth**            | فورت                | GeoNames; de has umlaut |
| 16 | recklinghausen  | 122,438 | 07     | Nordrhein-Westfalen        | Recklinghausen     | Recklinghausen       | ريكلينغهاوزن        | GeoNames; same-as-en |
| 17 | ingolstadt      | 120,658 | 02     | Bayern                     | Ingolstadt         | Ingolstadt           | إنغولشتات           | GeoNames; same-as-en |
| 18 | bottrop         | 119,909 | 07     | Nordrhein-Westfalen        | Bottrop            | Bottrop              | بوتروب              | GeoNames; same-as-en |
| 19 | offenbach       | 119,192 | 05     | Hessen                     | Offenbach          | Offenbach            | أوفنباخ             | GeoNames; same-as-en |
| 20 | koblenz         | 107,319 | 08     | Rheinland-Pfalz            | Koblenz            | Koblenz              | كوبلنز              | GeoNames; same-as-en |
| 21 | siegen          | 107,242 | 07     | Nordrhein-Westfalen        | Siegen             | Siegen               | زيغن                | GeoNames; same-as-en |
| 22 | bergisch-gladbach | 106,184 | 07   | Nordrhein-Westfalen        | Bergisch Gladbach  | Bergisch Gladbach    | بيرغيش غلادباخ      | GeoNames; same-as-en |
| 23 | jena            | 104,712 | 15     | Thüringen                  | Jena               | Jena                 | يينا                | GeoNames; same-as-en |
| 24 | gera            | 104,659 | 15     | Thüringen                  | Gera               | Gera                 | غيرا                | GeoNames; same-as-en |
| 25 | erlangen        | 102,675 | 02     | Bayern                     | Erlangen           | Erlangen             | إرلانغن             | GeoNames; same-as-en |

**Local-name differs from EN in 5/25 (20%)** — umlauts (Münster, Saarbrücken,
Mülheim, Fürth) or English exonym (Brunswick/Braunschweig). Remaining 20 use
same-as-en (correct localization for German proper nouns).

---

## Section 3 — Skipped / Rejected

### FR cities skipped from candidates (reason):
| Slug                  | Pop  | Reason                                              |
|-----------------------|-----:|-----------------------------------------------------|
| paris-* arrondissements | various | Districts of Paris (`Paris 11`, `Paris 12`...) — not standalone cities |
| marseille-* arrondissements | various | Districts of Marseille (`Marseille 13`) — not standalone |
| lyon-* arrondissements  | various | Districts of Lyon (`Lyon 03`, `Lyon 08`) — not standalone |
| marne-la-vallee        | 318,325 | Development zone / new town agglomeration, not city |
| cergy-pontoise         | 183,430 | Agglomeration / new town zone, not standalone city  |
| saint-quentin-en-yvelines | 146,598 | New-town agglomeration                          |
| saint-denis            |  96,128 | Paris commune (Île-de-France, integrated metro)     |
| asnieres-sur-seine     |  86,742 | Paris commune                                       |
| nanterre               |  86,719 | Paris commune (suburb of La Défense)                |
| courbevoie             |  85,158 | Paris commune                                       |
| creteil                |  84,833 | Paris commune                                       |
| colombes               |  82,300 | Paris commune                                       |
| vitry-sur-seine        |  81,001 | Paris commune                                       |
| roubaix                |  99,507 | Lille suburb (Métropole Européenne de Lille)        |
| tourcoing              |  99,160 | Lille suburb                                        |

### DE cities skipped from candidates:
| Slug          | Pop      | Reason                                              |
|---------------|---------:|-----------------------------------------------------|
| koeln         | 1,024,621 | Already curated as `cologne` (different slug, same gid 2886242) |
| frankfurt-am-main | 650,000 | Already curated as `frankfurt`                  |
| duesseldorf   |  618,685 | Already curated as `dusseldorf`                    |

### Source verification: every kept entry's `names.fr` / `names.de` matches the GeoNames raw `name` field (with accents). No untagged alternate names were used. No MT, no Wikipedia for fr/de in this wave — all locally sourced.

---

## Section 4 — Strict Invariants (All Pass)

1. ✅ Per-slug SHA-256 byte-identity for all 2,760 pre-existing entries
   (25 FR + 56 DE + 1,082 IN/PK/BD/SA/AF/IR/TR/ID/MY/US/MX/IT/NL/BE/CH/AT + others)
2. ✅ Total count delta = exactly +50 (2760 → 2810)
3. ✅ FR count delta = exactly +25 (25 → 50)
4. ✅ DE count delta = exactly +25 (56 → 81)
5. ✅ No duplicate slug across all 2,810 entries
6. ✅ No duplicate sourceId across all 2,810 entries
7. ✅ No duplicate geonameId across all 2,810 entries
8. ✅ All 25 FR entries have exactly `[ar, en, fr]` lang-keys
9. ✅ All 25 DE entries have exactly `[ar, en, de]` lang-keys
10. ✅ All 150 (50×3) values pass per-lang script guards:
    - `ar` = `[؀-ۿ]` only, no Bengali/Latin/Devanagari/Tamil/Urdu-only letters
    - `en/fr/de` = Latin, no Arabic/Bengali
11. ✅ Zero forbidden-lang leakage: ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/es/tr/ms
12. ✅ All 50 entries have required fields: slug, countryCode, lat/lng,
    timezone (Europe/Paris or Europe/Berlin), names.{ar,en,localLang},
    source=geonames, sourceId, priority, admin
13. ✅ Multi-key dedupe protected against gid-collision (e.g., Köln=2886242
    skipped because curated `cologne` uses that gid)

---

## Section 5 — Tests Run

### New FR-DE-specific tests
- `scripts/_test_supported_local_lang_cities_fr_de_fast.mjs`: **156 / 156 PASS** (11 groups)
- `scripts/_smoke_supported_local_lang_cities_fr_de_fast.mjs` (SSR): **38 / 38 PASS**
  - Top 10 FR × /fr/ + Top 10 DE × /de/
  - 6 Arabic baseline + 4 EN baseline
  - 8 regression: Kota Malang, Kuala Lumpur /ms/, Putrajaya /ms/, Karachi /ur/,
    Dhaka /bn/, Jalgaon /ur/, Thrissur /bn/, Gwangju /ur/ fallback
- `scripts/_smoke_supported_local_lang_cities_fr_de_search.mjs` (search): **22 / 22 PASS**
  - 14 EN-name queries + 5 local-name (accented) + 3 Arabic-name queries

### Carry-forward (count-drift updated 2760 → 2810)
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

**Grand total: 1,164 offline + 60 SSR/search = 1,224 zero failures.**

---

## Section 6 — Files Untouched (Verified)

```
$ git diff --stat HEAD -- server.js js/app.js index.html docs/place-data-maintenance-policy.md server/place-l10n/index.js
(empty — 0 bytes)
```

✅ `server.js` — 0-byte diff
✅ `js/app.js` — 0-byte diff
✅ `index.html` — 0-byte diff
✅ `server/place-l10n/index.js` — 0-byte diff
✅ `docs/place-data-maintenance-policy.md` — 0-byte diff
✅ Search-ranking code untouched
✅ India/Indonesia/Malaysia/Pakistan/Bangladesh entries byte-identical (verified
   per-slug SHA-256 in Group 7 of test)
✅ All other non-FR/non-DE countries byte-identical

---

## Section 7 — No Runtime Translation, No Fillchain, No MT

- **No Google Translate / OpenAI / Anthropic / browser translation** —
  all 50 `names.ar` values written manually via French→Arabic /
  German→Arabic phonetic transliteration following same conventions as
  the existing 25 FR + 56 DE entries (Paris=`باريس`, München=`ميونخ`, etc.).
- **No fillchain** — only `{ar, en, fr}` keys for FR entries and
  `{ar, en, de}` keys for DE entries. No 10-lang map.

---

## Section 8 — Files Created in This Wave

### Apply / test scripts (not affecting code path)
- `scripts/geodata/_supported_local_lang_cities_fr_de_fast_apply.mjs` (apply)
- `scripts/_test_supported_local_lang_cities_fr_de_fast.mjs` (verification)
- `scripts/_smoke_supported_local_lang_cities_fr_de_fast.mjs` (SSR smoke)
- `scripts/_smoke_supported_local_lang_cities_fr_de_search.mjs` (search smoke)

### Data + report artifacts
- `db/places/curated-places.json` (50 entries appended)
- `db/places/curated-places.json.preSupportedFrDeFast.bak` (pre-mutation backup)
- `reports/supported-local-lang-cities-fr-de-fast-apply-report.json`
- `reports/supported-local-lang-cities-fr-de-fast-closure.md` (this report)

### Count-drift refresh in existing tests (2760 → 2810)
- 9 test files updated (FR-DE count-aware tests + IN/PK/BD/ID/MY count-aware
  + fallback-consistency)

---

## Section 9 — STOP

Wave applied successfully. No code, docs, or policy changes.

**Closure approval received from user on 2026-05-21.**
Marker: `docs(closure): mark SUPPORTED-LOCAL-LANG-CITIES-FR-DE-FAST user-approved 2026-05-21`

Status moved from `awaiting user approval` → `CLOSED — user-approved 2026-05-21`.

No new sub-phase started. The following remain DEFERRED — DO NOT
auto-start:
- Sub-phase B: SUPPORTED-LOCAL-LANG-CITIES-ES-LATAM-FAST
- Sub-phase C: SUPPORTED-LOCAL-LANG-CITIES-TR-FAST (needs Stage-1 preflight)
- ASIA-1F (CN solo)
- AMERICAS (all sub-waves)
- SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2
- search-ranking
- Hijri pages
- DELETE-V1
- geocode proxy
- any separate L10N waves
