# SUPPORTED-LOCAL-LANG-CITIES-TR-B-FAST — Closure Report

**Date:** 2026-05-21
**Wave:** Second Turkish batch (separate standalone phase)
**Pattern:** Dedupe-first, single-commit, no code changes
**Status:** CLOSED — user-approved 2026-05-21

---

## Acceptance Criteria

| #  | Criterion                                                                       | Result |
|----|---------------------------------------------------------------------------------|--------|
| 1  | TR entries grew exactly 44 → 74 (+30)                                           | ✅     |
| 2  | Total curated grew exactly 2,947 → 2,977 (+30)                                  | ✅     |
| 3  | Exactly 30 new cities added (within 20-30 user-approved range)                  | ✅     |
| 4  | Every new entry has EXACTLY `names.{ar, en, tr}`                                | ✅     |
| 5  | No unsupported langs (ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/fr/de/es/ms)    | ✅     |
| 6  | Prior 44 TR entries unchanged (SHA-256 byte-identity)                           | ✅     |
| 7  | IN / ID / MY / PK / BD / FR / DE / ES-LATAM entries unchanged                   | ✅     |
| 8  | No modification to `server.js`                                                  | ✅     |
| 9  | No modification to `js/app.js`                                                  | ✅     |
| 10 | No modification to `index.html`                                                 | ✅     |
| 11 | No search-ranking patch                                                         | ✅     |
| 12 | No runtime translation (no MT, no browser translation, no live API)             | ✅     |
| 13 | No fillchain (only 3 declared lang keys per entry)                              | ✅     |
| 14 | No duplicate slugs / sourceIds / geonameIds across all 2,977 entries            | ✅     |
| 15 | No Arabic pollution — all 30 names.ar pass strict isCleanArabic                 | ✅     |
| 16 | Manual NAME_AR_FIX documented for 10 cities (8 Wiki AR + 2 translit)            | ✅     |
| 17 | Total tests: 1,830/1,830 PASS (132 new + 38 SSR + 20 search + 1,640 carry)     | ✅     |
| 18 | No new sub-phase started (TR-C + ASIA-1F + AMERICAS + others remain DEFERRED)   | ✅     |

**Outcome:** All 18 acceptance criteria met. Approved.

---

## Implementation Commit

`6c1f2ad — feat(geodata): SUPPORTED-LOCAL-LANG-CITIES-TR-B-FAST — +30 Turkish cities (Batch B)`

---

## Summary

Added **30 Turkish cities** (Group A 20 clean Arabic + Group B 10 manual fix)
to curated, each with EXACTLY `names.{ar, en, tr}` per place-data-maintenance-
policy §2. No other lang keys (zero forbidden-lang leakage across 90 values).

All 10 polluted-Arabic candidates from GeoNames (Urdu/Persian-only letters
ی پ ے ہ گ ګ + missing_ar for manisa) were replaced with user-approved manual
transliteration / Arabic Wikipedia canonical.

**Counts:**

| Metric            | Before | After |
|-------------------|-------:|------:|
| Total curated     |   2947 |  2977 |
| TR entries        |     44 |    74 |

---

## Section 1 — 30 New Cities

### Group A — Clean GeoNames Arabic (20 cities)

| # | Slug         | gid     | Pop     | adm1 | Region          | names.en      | names.tr      | names.ar          | source |
|---|--------------|---------|--------:|------|-----------------|---------------|---------------|-------------------|--------|
| 1 | duezce       | 747764  | 194,097 | 93   | Düzce           | Duzce         | **Düzce**     | دوزجة             | GN-clean |
| 2 | isparta      | 311073  | 172,334 | 33   | Isparta         | Isparta       | Isparta       | إسبرطة            | GN-clean |
| 3 | erzincan     | 315373  | 150,714 | 24   | Erzincan        | Erzincan      | Erzincan      | أرزينجان          | GN-clean |
| 4 | mardin       | 304797  | 129,864 | 72   | Mardin          | Mardin        | Mardin        | ماردن             | GN-clean |
| 5 | tokat        | 738743  | 129,702 | 60   | Tokat           | Tokat         | Tokat         | توقات             | GN-clean |
| 6 | giresun      | 746881  | 125,682 | 28   | Giresun         | Giresun       | Giresun       | غيرسون            | GN-clean |
| 7 | kastamonu    | 743882  | 125,622 | 37   | Kastamonu       | Kastamonu     | Kastamonu     | قسطموني           | GN-clean |
| 8 | samandag     | 301975  | 123,447 | 31   | Hatay           | Samandag      | **Samandağ**  | السويدية          | GN-clean |
| 9 | tekirdag     | 738927  | 122,287 | 59   | Tekirdağ        | Tekirdag      | **Tekirdağ**  | تكيرداغ           | GN-clean |
| 10 | siirt       | 300822  | 114,034 | 74   | Siirt           | Siirt         | Siirt         | سعرد              | GN-clean |
| 11 | kilis       | 307864  | 111,648 | 90   | Kilis           | Kilis         | Kilis         | كلس               | GN-clean |
| 12 | igdir       | 311665  | 101,700 | 88   | Iğdır           | Igdir         | **Iğdır**     | اغدير             | GN-clean |
| 13 | mugla       | 304184  |  92,328 | 48   | Muğla           | Mugla         | **Muğla**     | مغلا              | GN-clean |
| 14 | kars        | 743952  |  91,450 | 84   | Kars            | Kars          | Kars          | قارص              | GN-clean |
| 15 | nigde       | 303827  |  91,039 | 73   | Niğde           | Nigde         | **Niğde**     | نيغدة             | GN-clean |
| 16 | mus         | 304081  |  82,536 | 49   | Muş             | Mus           | **Muş**       | موش               | GN-clean |
| 17 | bartin      | 751057  |  81,692 | 87   | Bartın          | Bartin        | **Bartın**    | بارتن             | GN-clean |
| 18 | hakkari     | 318137  |  77,699 | 70   | Hakkâri         | Hakkari       | Hakkâri       | هكاري             | GN-clean |
| 19 | bitlis      | 321025  |  53,023 | 13   | Bitlis          | Bitlis        | Bitlis        | بتليس             | GN-clean |
| 20 | sinop       | 739600  |  34,834 | 57   | Sinop           | Sinop         | Sinop         | سينوب             | GN-clean |

### Group B — Manual NAME_AR_FIX (10 cities — GeoNames Arabic polluted or missing)

| # | Slug         | gid     | Pop     | adm1 | Region          | names.en   | names.tr     | names.ar (manual) | source |
|---|--------------|---------|--------:|------|-----------------|------------|--------------|-------------------|--------|
| 21 | manisa      | 304827  | 243,971 | 45   | Manisa          | Manisa     | Manisa       | مانيسا            | MANUAL:WikipediaAR (GN had no name.ar) |
| 22 | aydin       | 322830  | 163,022 | 09   | Aydın           | Aydin      | **Aydın**    | آيدين             | MANUAL:WikipediaAR (replaces polluted "آیدن" Urdu ی) |
| 23 | canakkale   | 749780  | 143,622 | 17   | Çanakkale       | Canakkale  | **Çanakkale**| جناق قلعة         | MANUAL:WikipediaAR (replaces polluted "تاناککالے" Urdu چ ک ے, historical name = "Dardanelles fort") |
| 24 | bingoel     | 321082  | 128,935 | 12   | Bingöl          | Bingol     | **Bingöl**   | بينغول            | MANUAL:translit (replaces polluted "بنگول" Urdu گ) |
| 25 | agri        | 309647  | 124,483 | 04   | Ağrı            | Agri       | **Ağrı**     | آغري              | MANUAL:WikipediaAR (replaces polluted "آغری" Urdu ی) |
| 26 | amasya      | 752015  | 114,921 | 05   | Amasya          | Amasya     | Amasya       | أماسيا            | MANUAL:WikipediaAR (replaces polluted "آماسیه" Urdu ی) |
| 27 | zonguldak   | 737022  | 101,749 | 85   | Zonguldak       | Zonguldak  | Zonguldak    | زونغولداق         | MANUAL:translit (replaces polluted "زانگولداک" Urdu گ ک) |
| 28 | nusaybin    | 303750  |  88,977 | 72   | Mardin          | Nusaybin   | Nusaybin     | نصيبين            | MANUAL:WikipediaAR (historical Nisibis — Aramaic/Syriac heritage) |
| 29 | yozgat      | 296562  |  87,881 | 66   | Yozgat          | Yozgat     | Yozgat       | يوزغات            | MANUAL:WikipediaAR (replaces polluted "ywzګat" Latin+Urdu ګ) |
| 30 | nevsehir    | 303831  |  75,527 | 50   | Nevşehir        | Nevsehir   | **Nevşehir** | نوشهر             | MANUAL:WikipediaAR (replaces polluted "نو شہر" Urdu ہ) |

**Notable: nusaybin is PPLA2 of Mardin** (not PPLA national-tier capital) — historically distinct standalone town. Arabic Wikipedia title `نصيبين` (Nisibis — major Aramaic/Syriac heritage city, separate from Mardin proper).

**Notable: manisa** (PPLA pop=244k) was flagged `needs_review missing_ar_name` in Stage-3 candidates — GeoNames raw had NO Arabic name. Supplied manually from Arabic Wikipedia title `مانيسا`.

---

## Section 2 — Excluded Remaining Candidates

| Candidate     | gid       | Pop     | Reason                                        |
|---------------|-----------|--------:|-----------------------------------------------|
| ueskuedar     | 738329    | 524,452 | Istanbul Asian-side district — not standalone (excluded in TR-FAST also) |
| cankiri       | 749748    |  90,564 | Could be added in future TR-C batch           |
| burdur        | 320392    |  95,436 | Could be added in future TR-C batch           |
| kirsehir      | 307515    | 150,700 | Could be added in future TR-C batch           |
| karabuek      | 744562    | 125,403 | Could be added in future TR-C batch           |
| rize          | 740483    | 119,828 | Could be added in future TR-C batch           |
| nazilli       | 303873    | 119,370 | PPLA2 of Aydın — could be added if user wants |
| silifke       | 300808    | 132,665 | PPLA2 of Mersin — could be added              |
| yalova        | 738025    |  71,289 | Could be added                                |
| bayburt       | 750938    |  48,036 | Could be added                                |
| bilecik       | 750598    |  74,457 | Could be added                                |
| kirklareli    | 743166    |  58,223 | Could be added                                |
| tunceli       | 298846    |  35,161 | Could be added                                |
| artvin        | 751817    |  25,841 | Could be added                                |
| ardahan       | 751952    |  22,927 | Could be added                                |
| guemueshane   | 746425    |  39,214 | Could be added                                |

**Total remaining HIGH/medium TR candidates for potential TR-C** = ~14 PPLA capitals + many PPLA2/PPLA3.

---

## Section 3 — Manual NAME_AR_FIX Justification (Group B)

10 cities required manual Arabic replacement. Pollution patterns observed:
- **Urdu Persian letters** ی (yeh), گ (gaf), ک (Urdu kaf), ے (yeh barree), ہ (heh goal): aydin, bingoel, agri, amasya, zonguldak, nevsehir
- **Kurdish/Latin-mixed**: yozgat ("ywzګat") + canakkale ("تاناککالے")
- **Missing ar entirely**: manisa (Stage-3 flagged needs_review)
- **Historical Arabic name preferred over Turkish phonetic**: canakkale (جناق قلعة Dardanelles fort), nusaybin (نصيبين Nisibis), samandag (السويدية — already clean, accepted as-is)

Sources:
- **MANUAL:WikipediaAR** (8): manisa, aydin, canakkale, agri, amasya, nusaybin, yozgat, nevsehir
- **MANUAL:translit** (2): bingoel (بينغول standard ng), zonguldak (زونغولداق standard)

NO Google Translate, NO OpenAI/Anthropic, NO browser translation, NO runtime
translation, NO fillchain.

---

## Section 4 — Strict Invariants (All Pass)

1. ✅ Per-slug SHA-256 byte-identity for all 2,947 pre-existing entries
2. ✅ Total count delta = exactly +30 (2947 → 2977)
3. ✅ TR count delta = exactly +30 (44 → 74)
4. ✅ Prior 44 TR entries byte-identical (Group 6)
5. ✅ IN / ID / MY / PK / BD / FR / DE / ES / MX / AR / CO / PE / CL / VE byte-identical (Group 7)
6. ✅ No duplicate slug across all 2,977 entries
7. ✅ No duplicate sourceId / geonameId across all 2,977 entries
8. ✅ All 30 new entries have exactly `[ar, en, tr]` lang-keys (Group 2)
9. ✅ Zero forbidden-lang leakage (Group 3)
10. ✅ All 30 `names.ar` pass strict `isCleanArabic` (Group 4 — NO Urdu/Persian)
11. ✅ All 60 (30 × 2) `names.en` + `names.tr` pass Latin guard (Group 5)
12. ✅ All 12/30 Turkish-specific-chars entries verified in Group 10
13. ✅ All 10 manual-fixed entries verified pollution-free (Group 12)

---

## Section 5 — Tests Run

### New TR-B-FAST-specific tests
- `scripts/_test_supported_local_lang_cities_tr_b_fast.mjs`: **132 / 132 PASS** (12 groups)
- `scripts/_smoke_supported_local_lang_cities_tr_b_fast.mjs` (SSR): **38 / 38 PASS**
  - 10 TR-B × /tr/ + 5 Arabic baseline + 3 EN baseline
  - 4 pre-existing TR regression (İstanbul/İzmir/Diyarbakır/Şanlıurfa)
  - 4 TR-FAST regression (Eskişehir/Malatya/Antakya/Batman)
  - 13 cross-country regression (Kota Malang, Kuala Lumpur, Putrajaya, Karachi /ur/,
    Dhaka /bn/, Jalgaon /ur/, Thrissur /bn/, Strasbourg /fr/, Dresden /de/,
    Medellín /es/, Córdoba-AR /es/, Gwangju /ur/ fallback)
- `scripts/_smoke_supported_local_lang_cities_tr_b_search.mjs` (search): **20 / 20 PASS**
  - 7 EN-ASCII + 7 TR-diacritics + 6 Arabic queries

### Carry-forward (count-drift updated 2947 → 2977)
- `_test_supported_local_lang_cities_tr_fast.mjs`: 139/139 (count + TR-count updated)
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

**Grand total: 1,772 offline + 58 SSR/search = 1,830 zero failures.**

---

## Section 6 — Files Untouched (Verified)

```
$ git diff --stat HEAD -- server.js js/app.js index.html docs/place-data-maintenance-policy.md server/place-l10n/index.js
(empty — 0 bytes)
```

✅ `server.js` / `js/app.js` / `index.html` / `server/place-l10n/index.js` / `docs/place-data-maintenance-policy.md` — 0-byte diff
✅ Search-ranking code untouched
✅ India / Indonesia / Malaysia / Pakistan / Bangladesh / France / Germany / Spain / LATAM byte-identical
✅ Pre-existing 44 TR entries byte-identical

---

## Section 7 — No Runtime Translation, No Fillchain, No MT

- All 30 `names.ar`: 20 GeoNames-clean + 10 user-approved manual replacement
  (8 Arabic Wikipedia canonical + 2 standard translit). NO MT / NO browser
  translation / NO runtime translation / NO fillchain.
- `names.en` = ASCII (Turkish diacritics stripped) matching existing
  diyarbakir/sanliurfa convention.
- `names.tr` = GeoNames raw `name` (full Turkish diacritics + â loanword
  marker for Hakkâri).

---

## Section 8 — Files Created in This Wave

- `scripts/geodata/_supported_local_lang_cities_tr_b_fast_apply.mjs`
- `scripts/_test_supported_local_lang_cities_tr_b_fast.mjs`
- `scripts/_smoke_supported_local_lang_cities_tr_b_fast.mjs`
- `scripts/_smoke_supported_local_lang_cities_tr_b_search.mjs`
- `db/places/curated-places.json.preSupportedTrBFast.bak`
- `reports/supported-local-lang-cities-tr-b-fast-apply-report.json`
- `reports/supported-local-lang-cities-tr-b-fast-closure.md` (this)

Count-drift refresh (2947 → 2977) in 14 existing test files (note: TR-FAST
test had both Total + TR-count updated).

---

## Section 9 — STOP

Wave applied successfully. No code, docs, or policy changes.

**Closure approval received from user on 2026-05-21.**
Marker: `docs(closure): mark SUPPORTED-LOCAL-LANG-CITIES-TR-B-FAST user-approved 2026-05-21`

Status moved from `awaiting user approval` → `CLOSED — user-approved 2026-05-21`.

### Turkey state post-TR-B
- TR total: **74 cities** | ar/en/tr 74/74 each (100%)
- Group A pre-existing 14 + TR-FAST 30 (Sub-phase C) + TR-B 30 (this wave) = 74

### The following remain DEFERRED — DO NOT auto-start
- TR-C (any further Turkey batch)
- ASIA-1F (CN solo)
- AMERICAS (non-Spanish-speaking)
- SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2
- search-ranking
- Hijri pages
- DELETE-V1
- geocode proxy
- any separate L10N waves
- any new city batch
