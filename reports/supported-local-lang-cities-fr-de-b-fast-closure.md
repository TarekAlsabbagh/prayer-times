# SUPPORTED-LOCAL-LANG-CITIES-FR-DE-B-FAST — Closure Report

**Date:** 2026-05-21
**Wave:** Sub-phase A Batch B of SUPPORTED-LOCAL-LANG-CITIES-FINAL-FAST
**Pattern:** Dedupe-first, single-commit, no code changes
**Status:** Ready for user closure approval

---

## Summary

Added **50 new cities** (25 France + 25 Germany — Batch B), each with EXACTLY
the three supported UI langs required per country:

- **France** → `names.{ar, en, fr}`
- **Germany** → `names.{ar, en, de}`

No `names.ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/es/tr/ms` — zero forbidden-lang
leakage (verified across 150 values).

**Counts:**

| Metric            | Before | After |
|-------------------|-------:|------:|
| Total curated     |   2810 |  2860 |
| FR entries        |     50 |    75 |
| DE entries        |     81 |   106 |

---

## Section 1 — 25 New FR Entries (Batch B)

| # | Slug                    | Pop     | gid     | Admin1 | Region                       | names.en                   | names.fr                    | names.ar              | Source / diff |
|---|-------------------------|--------:|---------|--------|------------------------------|----------------------------|-----------------------------|-----------------------|---------------|
| 1 | montreuil               | 111,240 | 2992090 | 11     | Île-de-France                | Montreuil                  | Montreuil                   | مونتروي                | GeoNames; same-as-en |
| 2 | boulogne-billancourt    | 108,782 | 3031137 | 11     | Île-de-France                | Boulogne-Billancourt       | Boulogne-Billancourt        | بولونيا بيانكور         | GeoNames; same-as-en |
| 3 | argenteuil              | 101,475 | 3037044 | 11     | Île-de-France                | Argenteuil                 | Argenteuil                  | أرجنتاي                 | GeoNames; same-as-en |
| 4 | roubaix                 |  99,507 | 2982681 | 32     | Hauts-de-France              | Roubaix                    | Roubaix                     | روبيه                   | GeoNames; same-as-en |
| 5 | tourcoing               |  99,160 | 2972284 | 32     | Hauts-de-France              | Tourcoing                  | Tourcoing                   | توركوان                 | GeoNames; same-as-en |
| 6 | saint-denis-fr          |  96,128 | 2980916 | 11     | Île-de-France                | Saint-Denis                | Saint-Denis                 | سان دوني                | GeoNames; defensive slug to disambiguate Réunion |
| 7 | nanterre                |  86,719 | 2990970 | 11     | Île-de-France                | Nanterre                   | Nanterre                    | نانتير                  | GeoNames; same-as-en |
| 8 | courbevoie              |  85,158 | 3023141 | 11     | Île-de-France                | Courbevoie                 | Courbevoie                  | كوربفوا                 | GeoNames; same-as-en |
| 9 | creteil                 |  84,833 | 3022530 | 11     | Île-de-France                | Creteil                    | **Créteil**                 | كريتاي                  | GeoNames; fr has accent |
| 10 | vitry-sur-seine        |  81,001 | 2967849 | 11     | Île-de-France                | Vitry-sur-Seine            | Vitry-sur-Seine             | فيتري سور سين          | GeoNames; same-as-en |
| 11 | aulnay-sous-bois       |  80,615 | 3036145 | 11     | Île-de-France                | Aulnay-sous-Bois           | Aulnay-sous-Bois            | أولناي سو بوا         | GeoNames; same-as-en |
| 12 | saint-maur-des-fosses  |  75,402 | 2978179 | 11     | Île-de-France                | Saint-Maur-des-Fosses      | **Saint-Maur-des-Fossés**   | سان مور دي فوسي       | GeoNames; fr has accent |
| 13 | chambery               |  61,640 | 3027422 | 84     | Auvergne-Rhône-Alpes         | Chambery                   | **Chambéry**                | شامبيري                 | GeoNames; fr has accent |
| 14 | troyes                 |  60,785 | 2971549 | 44     | Grand Est                    | Troyes                     | Troyes                      | تروا                    | GeoNames; same-as-en |
| 15 | lorient                |  58,112 | 2997577 | 53     | Bretagne                     | Lorient                    | Lorient                     | لوريان                  | GeoNames; same-as-en |
| 16 | evreux                 |  57,795 | 3019265 | 28     | Normandie                    | Evreux                     | **Évreux**                  | إيفرو                   | GeoNames; fr has accent |
| 17 | beauvais               |  53,393 | 3034006 | 32     | Hauts-de-France              | Beauvais                   | Beauvais                    | بوفيه                   | GeoNames; same-as-en |
| 18 | arles                  |  53,431 | 3036938 | 93     | Provence-Alpes-Côte d'Azur   | Arles                      | Arles                       | آرل                     | GeoNames; same-as-en |
| 19 | cholet                 |  53,160 | 3025053 | 52     | Pays de la Loire             | Cholet                     | Cholet                      | شوليه                   | GeoNames; same-as-en |
| 20 | frejus                 |  53,098 | 3017253 | 93     | Provence-Alpes-Côte d'Azur   | Frejus                     | **Fréjus**                  | فريجوس                  | GeoNames; fr has accent |
| 21 | narbonne               |  50,776 | 2990919 | 76     | Occitanie                    | Narbonne                   | Narbonne                    | ناربون                  | GeoNames; same-as-en |
| 22 | laval-fr               |  50,489 | 3005866 | 52     | Pays de la Loire             | Laval                      | Laval                       | لافال                   | GeoNames; defensive slug to disambiguate Laval (CA) |
| 23 | annecy                 |  49,232 | 3037543 | 84     | Auvergne-Rhône-Alpes         | Annecy                     | Annecy                      | أنيسي                   | GeoNames; same-as-en |
| 24 | grasse                 |  47,581 | 3014856 | 93     | Provence-Alpes-Côte d'Azur   | Grasse                     | Grasse                      | غراس                    | GeoNames; same-as-en |
| 25 | bayonne                |  44,396 | 3034475 | 75     | Nouvelle-Aquitaine           | Bayonne                    | Bayonne                     | بايون                   | GeoNames; same-as-en |

**Local-name differs from EN in 5/25 (20%)** — accents (Créteil, Saint-Maur-des-Fossés, Chambéry, Évreux, Fréjus). Remaining 20 use same-as-en (correct localization for French proper nouns).

### FR slug disambiguation
- `saint-denis-fr` — defensive slug because Saint-Denis (Réunion, French overseas department) is a candidate for future addition (Réunion capital, pop 153k). Both use `Saint-Denis` as canonical name; gid 2980916 lat=48.93 (Paris area) ≠ Réunion lat=-20.88. Follows existing nice-fr / bharatpur-in pattern.
- `laval-fr` — defensive slug because `laval` (geonames:6173331, Laval, Québec, Canada, pop 422k) is already in curated with `cc=ca`. Without the `-fr` suffix the apply would PREFLIGHT-FAIL on dup-slug detection. Both use `Laval` as canonical name; gid 3005866 lat=48.07 (France) ≠ Laval Canada lat=45.57.

---

## Section 2 — 25 New DE Entries (Batch B)

| # | Slug              | Pop     | gid     | Admin1 | Region                    | names.en          | names.de                  | names.ar              | Source / diff |
|---|-------------------|--------:|---------|--------|---------------------------|-------------------|---------------------------|-----------------------|---------------|
| 1 | zwickau          |  98,796 | 2803560 | 13     | Sachsen                    | Zwickau            | Zwickau                    | تسفيكاو                | GeoNames; same-as-en |
| 2 | kaiserslautern   |  98,732 | 2894003 | 08     | Rheinland-Pfalz            | Kaiserslautern     | Kaiserslautern             | كايزرسلاوترن           | GeoNames; same-as-en |
| 3 | guetersloh       |  96,180 | 2913366 | 07     | Nordrhein-Westfalen        | Gutersloh          | **Gütersloh**              | غوترسلوه               | GeoNames; de has umlaut |
| 4 | dueren           |  93,440 | 2934486 | 07     | Nordrhein-Westfalen        | Duren              | **Düren**                  | دورن                    | GeoNames; de has umlaut |
| 5 | esslingen        |  92,390 | 2928751 | 01     | Baden-Württemberg          | Esslingen          | Esslingen                  | إسلينغن                 | GeoNames; same-as-en |
| 6 | tuebingen        |  92,322 | 2820860 | 01     | Baden-Württemberg          | Tubingen           | **Tübingen**               | توبينغن                 | GeoNames; de has umlaut |
| 7 | iserlohn         |  91,811 | 2895669 | 07     | Nordrhein-Westfalen        | Iserlohn           | Iserlohn                   | إيزرلون                 | GeoNames; same-as-en |
| 8 | witten           |  91,808 | 2807363 | 07     | Nordrhein-Westfalen        | Witten             | Witten                     | فيتن                    | GeoNames; same-as-en |
| 9 | ratingen         |  91,606 | 2850174 | 07     | Nordrhein-Westfalen        | Ratingen           | Ratingen                   | راتينغن                 | GeoNames; same-as-en |
| 10 | marl            |  91,398 | 2873263 | 07     | Nordrhein-Westfalen        | Marl               | Marl                       | مارل                    | GeoNames; same-as-en |
| 11 | luenen          |  91,009 | 2875107 | 07     | Nordrhein-Westfalen        | Lunen              | **Lünen**                  | لونن                    | GeoNames; de has umlaut |
| 12 | giessen         |  89,179 | 2920512 | 05     | Hessen                     | Giessen            | **Gießen**                 | غيسن                    | GeoNames; de has eszett |
| 13 | hanau           |  88,648 | 2911007 | 05     | Hessen                     | **Hanau**          | **Hanau am Main**          | هاناو                   | GeoNames; en=short form, de=full GeoNames name |
| 14 | velbert         |  87,669 | 2817724 | 07     | Nordrhein-Westfalen        | Velbert            | Velbert                    | فيلبيرت                 | GeoNames; same-as-en |
| 15 | ludwigsburg     |  87,603 | 2875392 | 01     | Baden-Württemberg          | Ludwigsburg        | Ludwigsburg                | لودفيغسبورغ             | GeoNames; same-as-en |
| 16 | flensburg       |  85,838 | 2926271 | 10     | Schleswig-Holstein         | Flensburg          | Flensburg                  | فلنسبورغ                | GeoNames; same-as-en |
| 17 | cottbus         |  84,754 | 2939811 | 11     | Brandenburg                | Cottbus            | Cottbus                    | كوتبوس                  | GeoNames; same-as-en |
| 18 | konstanz        |  81,275 | 2885679 | 01     | Baden-Württemberg          | Konstanz           | Konstanz                   | كونستانز                | GeoNames; same-as-en |
| 19 | luedenscheid    |  79,386 | 2875457 | 07     | Nordrhein-Westfalen        | Ludenscheid        | **Lüdenscheid**            | لودنشايد                | GeoNames; de has umlaut |
| 20 | marburg         |  78,895 | 2873759 | 05     | Hessen                     | **Marburg**        | **Marburg an der Lahn**    | ماربورغ                 | GeoNames; en=short form, de=full GeoNames name |
| 21 | bayreuth        |  72,940 | 2951825 | 02     | Bayern                     | Bayreuth           | Bayreuth                   | بايرويت                 | GeoNames; same-as-en |
| 22 | landshut        |  71,863 | 2881485 | 02     | Bayern                     | Landshut           | Landshut                   | لاندسهوت                | GeoNames; same-as-en |
| 23 | lueneburg       |  71,260 | 2875115 | 06     | Niedersachsen              | Luneburg           | **Lüneburg**               | لونبورغ                 | GeoNames; de has umlaut |
| 24 | bamberg         |  70,047 | 2952984 | 02     | Bayern                     | Bamberg            | Bamberg                    | بامبرغ                  | GeoNames; same-as-en |
| 25 | aschaffenburg   |  68,551 | 2955272 | 02     | Bayern                     | Aschaffenburg      | Aschaffenburg              | أشافنبورغ               | GeoNames; same-as-en |

**Local-name differs from EN in 9/25 (36%)** — umlauts (Gütersloh/Düren/Tübingen/Lünen/Lüdenscheid/Lüneburg), eszett (Gießen), and full GeoNames name with suffix (Hanau am Main, Marburg an der Lahn).

---

## Section 3 — Skipped / Rejected

### FR cities skipped
- **Perpignan/Orléans/Rouen/Caen/Nancy** — already curated in earlier waves (slug-dup)
- Paris arrondissements (10+ entries: Paris 11, 12, 13, 14, 15, 16, 17, 18, 19, 20) — districts not standalone

### DE cities skipped
- **Freiburg im Breisgau** — already curated as `freiburg` (PPLA2 of Baden-Württemberg)
- **Solingen/Osnabrück/Ludwigshafen am Rhein/Oldenburg/Neuss/Heidelberg/Paderborn/Darmstadt/Regensburg/Würzburg/Wolfsburg/Göttingen/Ulm/Heilbronn/Pforzheim/Bremerhaven/Reutlingen/Trier** — all already curated (19 user examples were slug-duplicates from existing 56 DE)
- **Salzgitter** — already curated (gid in curated)

---

## Section 4 — Strict Invariants (All Pass)

1. ✅ Per-slug SHA-256 byte-identity for all 2,810 pre-existing entries
2. ✅ Total count delta = exactly +50 (2810 → 2860)
3. ✅ FR count delta = exactly +25 (50 → 75)
4. ✅ DE count delta = exactly +25 (81 → 106)
5. ✅ No duplicate slug across all 2,860 entries
6. ✅ No duplicate sourceId across all 2,860 entries
7. ✅ No duplicate geonameId across all 2,860 entries
8. ✅ All 25 FR entries have exactly `[ar, en, fr]` lang-keys
9. ✅ All 25 DE entries have exactly `[ar, en, de]` lang-keys
10. ✅ All 150 (50×3) values pass per-lang script guards (strict ar)
11. ✅ Zero forbidden-lang leakage (ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/es/tr/ms)
12. ✅ Multi-key dedupe protected against collision (slug + gid + en-name + local-name)
13. ✅ Defensive disambiguation slugs (saint-denis-fr vs RE; laval-fr vs CA)

---

## Section 5 — Tests Run

### New FR-DE-B-specific tests
- `scripts/_test_supported_local_lang_cities_fr_de_b_fast.mjs`: **165 / 165 PASS** (12 groups)
- `scripts/_smoke_supported_local_lang_cities_fr_de_b_fast.mjs` (SSR): **42 / 42 PASS**
  - Top 10 FR-B × /fr/ + Top 10 DE-B × /de/
  - 7 Arabic baseline + 3 EN baseline
  - 2 disambiguation regression (laval CA vs laval-fr FR)
  - 2 wave-A regression (Strasbourg, Dresden)
  - 8 IN/ID/MY/PK/BD regression (Kota Malang, Kuala Lumpur, Putrajaya, Karachi /ur/, Dhaka /bn/, Jalgaon /ur/, Thrissur /bn/, Gwangju /ur/ fallback)
- `scripts/_smoke_supported_local_lang_cities_fr_de_b_search.mjs` (search): **25 / 25 PASS**
  - 9 EN-name queries + 6 accented local-name + 4 Arabic + 6 others

### Carry-forward (count-drift updated 2810 → 2860)
- `_test_supported_local_lang_cities_fr_de_fast.mjs`: 156/156 (incl. updated FR/DE counts to current state 75/106)
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

**Grand total: 1,213 offline + 67 SSR/search = 1,280 zero failures.**

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
✅ India/Indonesia/Malaysia/Pakistan/Bangladesh entries byte-identical
✅ All other non-FR/non-DE countries byte-identical

---

## Section 7 — No Runtime Translation, No Fillchain, No MT

- All 50 `names.ar` values written manually via French→Arabic / German→Arabic
  standard phonetic transliteration following existing 50 FR + 81 DE conventions.
- `names.en` / `names.fr` / `names.de` from GeoNames raw `name` field. No
  untagged GeoNames alternates used. No MT.
- Only `{ar, en, fr}` keys for FR, `{ar, en, de}` keys for DE — no fillchain.

---

## Section 8 — Files Created in This Wave

- `scripts/geodata/_supported_local_lang_cities_fr_de_b_fast_apply.mjs`
- `scripts/_test_supported_local_lang_cities_fr_de_b_fast.mjs`
- `scripts/_smoke_supported_local_lang_cities_fr_de_b_fast.mjs`
- `scripts/_smoke_supported_local_lang_cities_fr_de_b_search.mjs`
- `db/places/curated-places.json.preSupportedFrDeBFast.bak`
- `reports/supported-local-lang-cities-fr-de-b-fast-apply-report.json`
- `reports/supported-local-lang-cities-fr-de-b-fast-closure.md` (this)

Count-drift refresh (2810 → 2860) in 10 existing test files.

---

## Section 9 — STOP

Wave applied successfully. No code, docs, or policy changes. No new sub-phase
started. Sub-phase B (ES + LATAM) and Sub-phase C (TR preflight) remain
DEFERRED until user requests.

**Awaiting user closure approval before push to remote.**
