# BG GeoNames Import Report — Europe-3

**Country**: Bulgaria (بلغاريا)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:12.914Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/bg-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/bg-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/bg-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 6058 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **11** |
| pending — medium tier             | 0 |
| pending — low tier                | 124 |
| needs_review                      | 5907 |
| rejected                          | 0 |
| collisions in this wave           | 582 |
| collisions against existing curated | 1 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 3 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 6 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 2 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 0
**Blocked by ar-gate (high-tier):** 11

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ⚠️ | varna | فارنا | Varna | Varna | bg | PPLA | 318737 |  | 43.2191 | 27.9102 | 377.81 | sofia | arabic_only | wave→varna-bg | 90 | always_include:PPLA |
| ⚠️ | burgas | brګas | Burgas | Burgas | bg | PPLA | 210646 |  | 42.5065 | 27.4689 | 340.05 | sofia | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | stara-zagora | sٹara zaghwra | Stara Zagora | Stara Zagora | bg | PPLA | 121582 |  | 42.4320 | 25.6426 | 192.33 | sofia | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | ruse | rwsې | Ruse | Ruse | bg | PPLA | 121168 |  | 43.8487 | 25.9534 | 248.52 | sofia | mixed_latin | wave→ruse-bg | 90 | always_include:PPLA |
| ⚠️ | sliven | اسلمیه | Sliven | Sliven | bg | PPLA | 83740 |  | 42.6861 | 26.3256 | 245.48 | sofia | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | haskovo | خاسکوو | Haskovo | Haskovo | bg | PPLA | 64564 |  | 41.9342 | 25.5556 | 202.32 | sofia | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | gabrovo | غابروفو | Gabrovo | Gabrovo | bg | PPLA | 48133 |  | 42.8742 | 25.3182 | 164.09 | sofia | arabic_only | wave→gabrovo-bg | 80 | always_include:PPLA |
| ⚠️ | montana | mwnٹana | Montana | Montana | bg | PPLA | 47445 |  | 43.4128 | 23.2217 | 79.94 | sofia | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | kyustendil | kywsٹndl | Kyustendil | Kyustendil | bg | PPLA | 46856 |  | 42.2831 | 22.6922 | 69.21 | sofia | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | vidin | فيدن | Vidin | Vidin | bg | PPLA | 34797 |  | 43.9916 | 22.8824 | 148.20 | sofia | arabic_only | wave→vidin-bg | 80 | always_include:PPLA |
| ⚠️ | targovishte | targwwyshtې | Targovishte | Targovishte | bg | PPLA | 34793 |  | 43.2512 | 26.5722 | 271.48 | sofia | mixed_latin |  | 80 | always_include:PPLA |

## Collision-watch list for BG

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| varna | pending | high | varna | 318737 | 377.81 | sofia | wave | varna-bg |
| sofia | existing |  | sofia | 1152556 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/bg-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-bg` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/BG.zip
