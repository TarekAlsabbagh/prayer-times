# PT GeoNames Import Report — Europe-1B

**Country**: Portugal (البرتغال)
**Wave**: `CURATED-GEODATA-EUROPE-1B`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-15T21:20:53.102Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/pt-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/pt-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/pt-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-1b-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 16563 |
| existing (matched, no action)     | 7 |
| **pending — high tier**           | **19** |
| pending — medium tier             | 0 |
| pending — low tier                | 39 |
| needs_review                      | 16498 |
| rejected                          | 0 |
| collisions in this wave           | 2355 |
| collisions against existing curated | 9 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 12 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 7 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 9
**Blocked by ar-gate (high-tier):** 10

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | braga | براغا | Braga | Braga | pt | PPLA | 193324 | براغا | 41.5514 | -8.4231 | 47.01 | porto | arabic_only |  | 90 | always_include:PPLA |
| ✅ | coimbra | كويمبرا | Coimbra | Coimbra | pt | PPLA | 140796 | قويمبرا | 40.2069 | -8.4200 | 107.21 | porto | arabic_only |  | 90 | always_include:PPLA |
| ✅ | leiria | لييريا | Leiria | Leiria | pt | PPLA | 128640 | لييريا | 39.7436 | -8.8071 | 117.11 | lisbon | arabic_only |  | 90 | always_include:PPLA |
| ✅ | setubal | ستوبال | Setúbal | Setúbal | pt | PPLA | 118166 | سيتوبال | 38.5244 | -8.8882 | 30.98 | lisbon | arabic_only |  | 90 | always_include:PPLA |
| ✅ | viseu | فيسيو | Viseu | Viseu | pt | PPLA | 103502 | فيزيو | 40.6617 | -7.9090 | 81.89 | porto | arabic_only |  | 90 | always_include:PPLA |
| ✅ | queluz | كويلوز | Queluz | Queluz | pt | PPL | 103399 | لشبونة | 38.7566 | -9.2545 | 10.69 | lisbon | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | evora | إيفورا | Évora | Évora | pt | PPLA | 53591 | إيفورا | 38.5659 | -7.9040 | 108.68 | lisbon | arabic_only |  | 85 | always_include:PPLA |
| ✅ | braganca | براغانسا | Bragança | Bragança | pt | PPLA | 35341 | براغانصا | 41.8072 | -6.7590 | 171.70 | porto | arabic_only |  | 80 | always_include:PPLA |
| ✅ | santarem | سانتارم | Santarém | Santarém | pt | PPLA | 29385 | سانتاريم | 39.2338 | -8.6862 | 69.06 | lisbon | arabic_only |  | 80 | always_include:PPLA |
| ⚠️ | funchal | فنچال ،پرتگال | Funchal | Funchal | pt | PPLA | 105795 | ماديرا | 32.6657 | -16.9255 | 972.90 | lisbon | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | aveiro | آویرو | Aveiro | Aveiro | pt | PPLA | 80880 | أفيرو | 40.6457 | -8.6464 | 56.97 | porto | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | faro | فارو | Faro | Faro | pt | PPLA | 70347 | فارو | 37.0187 | -7.9272 | 217.26 | lisbon | arabic_only | wave→faro-pt | 85 | always_include:PPLA |
| ⚠️ | guarda | gwarڈa | Guarda | Guarda | pt | PPLA | 40126 | غواردا | 40.5375 | -7.2663 | 133.78 | porto | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | viana-do-castelo | wyana ڈw kasٹylw | Viana do Castelo | Viana do Castelo | pt | PPLA | 36148 | فيانا دو كاستيلو | 41.6932 | -8.8329 | 61.90 | porto | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | beja | بيجا | Beja | Beja | pt | PPLA | 34760 | بيجا | 38.0147 | -7.8628 | 136.29 | lisbon | arabic_only | curated:tn | 80 | always_include:PPLA |
| ⚠️ | castelo-branco | kasٹylw brankw | Castelo Branco | Castelo Branco | pt | PPLA | 33479 | كاستيلو برانكو | 39.8236 | -7.4910 | 176.84 | porto | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | portalegre | pwrtalygrے | Portalegre | Portalegre | pt | PPLA | 22368 | بورتاليغرا | 39.2938 | -7.4312 | 160.68 | lisbon | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | ponta-delgada | pwnta ڈylgada | Ponta Delgada | Ponta Delgada | pt | PPLA | 20056 | الأزور | 37.7395 | -25.6687 | 1445.94 | lisbon | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | vila-real | فيلا ريال | Vila Real | Vila Real | pt | PPLA | 17001 | فيلا ريال | 41.3001 | -7.7432 | 75.75 | porto | arabic_only | wave→vila-real-pt | 80 | always_include:PPLA |

## Collision-watch list for PT

Cities the user pre-flagged: `granada`, `cordoba`, `valencia`, `cartagena`, `toledo`, `barcelona`, `sevilla`, `seville`, `malaga`, `porto`, `braga`, `coimbra`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| porto | existing |  | porto | - |  |  |  |  |
| porto | existing |  | porto | - |  |  |  |  |
| porto | existing |  | porto | - |  |  |  |  |
| porto | existing |  | porto | - |  |  |  |  |
| porto | existing |  | porto | 252687 |  |  |  |  |
| coimbra | pending | high | coimbra | 140796 | 107.21 | porto |  |  |
| braga | pending | high | braga | 193324 | 47.01 | porto |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/pt-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-pt` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/PT.zip
