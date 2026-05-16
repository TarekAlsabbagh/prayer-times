# PL GeoNames Import Report — Europe-3

**Country**: Poland (بولندا)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:12.601Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/pl-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/pl-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/pl-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 45410 |
| existing (matched, no action)     | 5 |
| **pending — high tier**           | **13** |
| pending — medium tier             | 0 |
| pending — low tier                | 140 |
| needs_review                      | 45228 |
| rejected                          | 0 |
| collisions in this wave           | 2071 |
| collisions against existing curated | 8 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 0 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 11 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 2 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 0
**Blocked by ar-gate (high-tier):** 13

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ⚠️ | lodz | lwډz | Łódź | Łódź | pl | PPLA | 645693 | لودز | 51.7706 | 19.4739 | 117.03 | warsaw | mixed_latin |  | 95 | always_include:PPLA |
| ⚠️ | gdansk | gڈansk | Gdańsk | Gdańsk | pl | PPLA | 487371 | بوميرانيا | 54.3523 | 18.6491 | 283.47 | warsaw | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | bialystok | byalsٹak | Białystok | Białystok | pl | PPLA | 295683 | بودلاسي | 53.1333 | 23.1643 | 176.46 | warsaw | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | torun | ترونی | Toruń | Toruń | pl | PPL | 196935 | كويافي-بومرانيا | 53.0138 | 18.5981 | 184.80 | warsaw | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | kielce | kylsې | Kielce | Kielce | pl | PPLA | 192468 | شفينتوكشيسكي | 50.8703 | 20.6275 | 101.78 | krakow | mixed_latin |  | 90 | always_include:PPLA |
| ⚠️ | bytom | بیتوم | Bytom | Bytom | pl | PPLA3 | 189186 | سيليزيا | 50.3480 | 18.9328 | 78.62 | krakow | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | bielsko-biala | بیلسکو بیاوا | Bielsko-Biala | Bielsko-Biala | pl | PPLA3 | 176515 | سيليزيا | 49.8225 | 19.0469 | 69.69 | krakow | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | olsztyn | awlszٹn | Olsztyn | Olsztyn | pl | PPLA | 169793 | فارمينسكو-مازورسكي | 53.7838 | 20.4927 | 176.26 | warsaw | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | ruda-slaska | رودا شلوسکا | Ruda Śląska | Ruda Śląska | pl | PPL | 146189 | سيليزيا | 50.2584 | 18.8563 | 80.49 | krakow | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | rybnik | ربنیک | Rybnik | Rybnik | pl | PPLA2 | 142510 | سيليزيا | 50.0971 | 18.5418 | 100.19 | krakow | mixed_script | wave→rybnik-pl | 90 | pop_gte_100000 |
| ⚠️ | bielany | بیلانه | Bielany | Bielany | pl | PPL | 131910 | مازوفيا | 52.2924 | 20.9353 | 8.72 | warsaw | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | tychy | تیشی | Tychy | Tychy | pl | PPLA3 | 130000 | سيليزيا | 50.1372 | 18.9664 | 70.26 | krakow | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | dabrowa-gornicza | دومبرووه گورنیچا | Dąbrowa Górnicza | Dąbrowa Górnicza | pl | PPL | 116971 | سيليزيا | 50.3339 | 19.2048 | 60.60 | krakow | mixed_script |  | 90 | pop_gte_100000 |

## Collision-watch list for PL

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| warsaw | existing |  | warsaw | 1702139 |  |  |  |  |
| krakow | existing |  | krakow | - |  |  |  |  |
| krakow | existing |  | krakow | 804237 |  |  |  |  |
| gdansk | pending | high | gdansk | 487371 | 283.47 | warsaw |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/pl-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-pl` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/PL.zip
