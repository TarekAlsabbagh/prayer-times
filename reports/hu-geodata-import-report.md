# HU GeoNames Import Report — Europe-3

**Country**: Hungary (المجر)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:12.799Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/hu-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/hu-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/hu-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 10048 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **14** |
| pending — medium tier             | 0 |
| pending — low tier                | 44 |
| needs_review                      | 9985 |
| rejected                          | 0 |
| collisions in this wave           | 180 |
| collisions against existing curated | 3 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 0 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 14 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 0
**Blocked by ar-gate (high-tier):** 14

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ⚠️ | szeged | سکدین | Szeged | Szeged | hu | PPLA | 160766 |  | 46.2530 | 20.1482 | 162.03 | budapest | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | miskolc | مسکولس | Miskolc | Miskolc | hu | PPLA | 154521 |  | 48.1033 | 20.7781 | 146.21 | budapest | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | gyor | دیؤر | Győr | Győr | hu | PPLA | 129301 |  | 47.6833 | 17.6351 | 107.37 | budapest | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | kecskemet | کچکمیت | Kecskemét | Kecskemét | hu | PPLA | 109847 |  | 46.9062 | 19.6913 | 82.15 | budapest | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | szombathely | سمباتهی | Szombathely | Szombathely | hu | PPLA | 78025 |  | 47.2309 | 16.6215 | 184.56 | budapest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | szolnok | سلنوک | Szolnok | Szolnok | hu | PPLA | 71285 |  | 47.1807 | 20.1984 | 94.13 | budapest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | tatabanya | تاتابانیا | Tatabánya | Tatabánya | hu | PPLA | 65849 |  | 47.5925 | 18.3810 | 50.58 | budapest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | kaposvar | کاپشوار | Kaposvár | Kaposvár | hu | PPLA | 64280 |  | 46.3667 | 17.8000 | 157.13 | budapest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | zalaegerszeg | زالائگرسگ | Zalaegerszeg | Zalaegerszeg | hu | PPLA | 61898 |  | 46.8370 | 16.8440 | 181.56 | budapest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | bekescsaba | بیکیسچابا | Békéscsaba | Békéscsaba | hu | PPLA | 59732 |  | 46.6833 | 21.1000 | 180.33 | budapest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | veszprem | وسپریم | Veszprém | Veszprém | hu | PPLA | 56927 |  | 47.0933 | 17.9115 | 96.28 | budapest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | eger | اگر | Eger | Eger | hu | PPLA | 53876 |  | 47.9027 | 20.3733 | 109.44 | budapest | mixed_script | wave→eger-hu | 85 | always_include:PPLA |
| ⚠️ | salgotarjan | سالگوتاریئن | Salgótarján | Salgótarján | hu | PPLA | 34627 |  | 48.0987 | 19.8030 | 87.81 | budapest | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | szekszard | سکسارد | Szekszárd | Szekszárd | hu | PPLA | 34174 |  | 46.3472 | 18.7119 | 130.35 | budapest | mixed_script |  | 80 | always_include:PPLA |

## Collision-watch list for HU

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| budapest | existing |  | budapest | 1741041 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/hu-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-hu` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/HU.zip
