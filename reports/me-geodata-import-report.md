# ME GeoNames Import Report — Europe-3

**Country**: Montenegro (الجبل الأسود)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:13.267Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/me-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/me-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/me-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 4000 |
| existing (matched, no action)     | 0 |
| **pending — high tier**           | **17** |
| pending — medium tier             | 0 |
| pending — low tier                | 38 |
| needs_review                      | 3942 |
| rejected                          | 0 |
| collisions in this wave           | 1732 |
| collisions against existing curated | 1 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 4 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 9 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 4 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 2
**Blocked by ar-gate (high-tier):** 15

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | andrijevica | أندريجيفيتسا | Andrijevica | Andrijevica | me | PPLA | 1073 |  | 42.7339 | 19.7919 |  |  | arabic_only |  | 70 | always_include:PPLA |
| ✅ | petnjica | بيتنيتسا | Petnjica | Petnjica | me | PPLA | - |  | 42.9097 | 19.9636 |  |  | arabic_only |  | 60 | always_include:PPLA |
| ⚠️ | podgorica | pۆdgۆrytsa | Podgorica | Podgorica | me | PPLC | 236852 |  | 42.4412 | 19.2631 |  |  | mixed_latin | wave→podgorica-me | 90 | always_include:PPLC |
| ⚠️ | niksic | نیکشیچ | Nikšić | Nikšić | me | PPLA | 58212 |  | 42.7731 | 18.9445 |  |  | mixed_script | wave→niksic-me | 85 | always_include:PPLA |
| ⚠️ | pljevlja | پلیفلیا | Pljevlja | Pljevlja | me | PPLA | 19489 |  | 43.3567 | 19.3584 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | budva | bڈwa | Budva | Budva | me | PPLA | 18000 |  | 42.2872 | 18.8392 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | bar | بار | Bar | Bar | me | PPLA | 17727 |  | 42.0937 | 19.0984 |  |  | arabic_only | wave→bar-me | 80 | always_include:PPLA |
| ⚠️ | bijelo-polje | byjylw pwljې | Bijelo Polje | Bijelo Polje | me | PPLA | 15400 |  | 43.0383 | 19.7476 |  |  | mixed_latin | wave→bijelo-polje-me | 80 | always_include:PPLA |
| ⚠️ | cetinje | sytnjې | Cetinje | Cetinje | me | PPLA | 15137 |  | 42.3906 | 18.9142 |  |  | mixed_latin |  | 80 | always_include:PPLA |
| ⚠️ | rozaje | rwzajې | Rožaje | Rožaje | me | PPLA | 9121 |  | 42.8330 | 20.1665 |  |  | mixed_latin |  | 75 | always_include:PPLA |
| ⚠️ | tuzi | توزی | Tuzi | Tuzi | me | PPLA | 3789 |  | 42.3658 | 19.3297 |  |  | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | plav | پلاو | Plav | Plav | me | PPLA | 3615 |  | 42.5969 | 19.9442 |  |  | mixed_script | wave→plav-me | 70 | always_include:PPLA |
| ⚠️ | golubovci | گولوبوفتسی | Golubovci | Golubovci | me | PPLA | 3110 |  | 42.3352 | 19.2310 |  |  | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | kolasin | کولاشن | Kolašin | Kolašin | me | PPLA | 2989 |  | 42.8223 | 19.5165 |  |  | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | zabljak | زابليك | Žabljak | Žabljak | me | PPLA | 1937 |  | 43.1542 | 19.1232 |  |  | arabic_only | wave→zabljak-me | 70 | always_include:PPLA |
| ⚠️ | gusinje | گوسینیه | Gusinje | Gusinje | me | PPLA | 1673 |  | 42.5619 | 19.8339 |  |  | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | pluzine | پلوژینه | Plužine | Plužine | me | PPLA | 1494 |  | 43.1521 | 18.8390 |  |  | mixed_script | wave→pluzine-me | 70 | always_include:PPLA |

## Collision-watch list for ME

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| podgorica | pending | high | podgorica | 236852 |  |  | wave | podgorica-me |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/me-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-me` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/ME.zip
