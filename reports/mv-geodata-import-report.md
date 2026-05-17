# MV GeoNames Import Report — Asia-1E

**Country**: Maldives (جزر المالديف)
**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E (popMin 30000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T10:03:53.784Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/mv-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/mv-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/mv-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1e-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 117 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **18** |
| pending — medium tier             | 0 |
| pending — low tier                | 0 |
| needs_review                      | 98 |
| rejected                          | 0 |
| collisions in this wave (high)    | 1 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 6 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 8 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 4 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 5
**Blocked by ar-gate (high-tier):** 13

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | hithadhoo | هيثاذو | Hithadhoo | Hithadhoo | mv | PPLA | 9927 | أتول سيينو | -0.6000 | 73.0833 | Indian/Maldives | 533.12 | male | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | dhihdhoo | ذيذو | Dhihdhoo | Dhihdhoo | mv | PPLA | 3039 | أتول هاء ألف | 6.8874 | 73.1140 | Indian/Maldives | 304.71 | male | arabic_only |  |  | 70 | always_include:PPLA |
| ✅ | viligili | فيليجيلي | Viligili | Viligili | mv | PPLA | 2925 | أتول غاف ألف | 0.7591 | 73.4330 | Indian/Maldives | 379.99 | male | arabic_only |  |  | 70 | always_include:PPLA |
| ✅ | ungoofaaru | أن جوفارو | Un’goofaaru | Un’goofaaru | mv | PPLA | 1575 | أتول راء | 5.6681 | 73.0302 | Indian/Maldives | 174.25 | male | arabic_only |  |  | 70 | always_include:PPLA |
| ✅ | veymandoo | فيمندو | Veymandoo | Veymandoo | mv | PPLA | 1100 | أتول ثاء | 2.1877 | 73.0956 | Indian/Maldives | 225.75 | male | arabic_only |  |  | 70 | always_include:PPLA |
| ⚠️ | fuvahmulah | fwwہ mwlaہ | Fuvahmulah | Fuvahmulah | mv | PPLA | 11140 | أتول غنافياني | -0.2988 | 73.4240 | Indian/Maldives | 497.61 | male | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | kulhudhuffushi | kwlھwdwfwshy | Kulhudhuffushi | Kulhudhuffushi | mv | PPLA | 9500 | أتول هاء داال | 6.6221 | 73.0700 | Indian/Maldives | 276.36 | male | mixed_latin |  |  | 75 | always_include:PPLA |
| ⚠️ | thinadhoo | tھynaڈھw | Thinadhoo | Thinadhoo | mv | PPLA | 6376 | أتول غاف داال | 0.5306 | 72.9997 | Indian/Maldives | 409.23 | male | mixed_script |  |  | 75 | always_include:PPLA |
| ⚠️ | naifaru | nayy farwں | Naifaru | Naifaru | mv | PPLA | 5044 | أتول لافياني | 5.4444 | 73.3657 | Indian/Maldives | 141.99 | male | mixed_latin |  |  | 75 | always_include:PPLA |
| ⚠️ | funadhoo | fna ڈھw | Funadhoo | Funadhoo | mv | PPLA | 2900 | أتول شافياني | 6.1509 | 73.2901 | Indian/Maldives | 220.99 | male | mixed_script |  |  | 70 | always_include:PPLA |
| ⚠️ | eydhafushi | ayydھa fwshy | Eydhafushi | Eydhafushi | mv | PPLA | 2808 | أتول بآا | 5.1033 | 73.0708 | Indian/Maldives | 114.04 | male | mixed_latin |  |  | 70 | always_include:PPLA |
| ⚠️ | mahibadhoo | maہy badھw | Mahibadhoo | Mahibadhoo | mv | PPLA | 2156 | أتول أليف داال | 3.7571 | 72.9689 | Indian/Maldives | 75.88 | male | mixed_script |  |  | 70 | always_include:PPLA |
| ⚠️ | fonadhoo | fwna ڈھw | Fonadhoo | Fonadhoo | mv | PPLA | 1773 | أتول لافياني | 1.8324 | 73.5026 | Indian/Maldives | 260.54 | male | mixed_script |  |  | 70 | always_include:PPLA |
| ⚠️ | manadhoo | mnaڈھw | Manadhoo | Manadhoo | mv | PPLA | 1580 | أتول نون | 5.7669 | 73.4136 | Indian/Maldives | 177.27 | male | mixed_script |  |  | 70 | always_include:PPLA |
| ⚠️ | kudahuvadhoo | kڈaہwwadھw | Kudahuvadhoo | Kudahuvadhoo | mv | PPLA | 1562 | أتول داال | 2.6707 | 72.8944 | Indian/Maldives | 180.71 | male | mixed_script |  |  | 70 | always_include:PPLA |
| ⚠️ | muli | مولي | Muli | Muli | mv | PPLA | 1008 | أتول ميم | 2.9217 | 73.5811 | Indian/Maldives | 139.65 | male | arabic_only | wave | muli-mv | 70 | always_include:PPLA |
| ⚠️ | felidhoo | fyly ڈھw | Felidhoo | Felidhoo | mv | PPLA | 541 | أتول فآفو | 3.4718 | 73.5470 | Indian/Maldives | 78.36 | male | mixed_script |  |  | 65 | always_include:PPLA |
| ⚠️ | nilandhoo | nylandھw | Nilandhoo | Nilandhoo | mv | PPLA | - | أتول فآاف | 3.0567 | 72.8900 | Indian/Maldives | 142.13 | male | mixed_latin |  |  | 60 | always_include:PPLA |

## Collision-watch list for MV

Cities the user pre-flagged (kickoff 2026-05-16): `kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| male | existing |  | male | 103693 |  |  | wave | male-mv |
| hithadhoo | pending | high | hithadhoo | 9927 | 533.12 | male |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/mv-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-mv` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/MV.zip
