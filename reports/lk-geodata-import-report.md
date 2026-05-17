# LK GeoNames Import Report — Asia-1E

**Country**: Sri Lanka (سريلانكا)
**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T10:03:53.774Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/lk-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/lk-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/lk-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1e-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 17741 |
| existing (matched, no action)     | 4 |
| **pending — high tier**           | **10** |
| pending — medium tier             | 0 |
| pending — low tier                | 1076 |
| needs_review                      | 16651 |
| rejected                          | 0 |
| collisions in this wave (high)    | 0 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 7 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 2 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 1 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 7
**Blocked by ar-gate (high-tier):** 3

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | jaffna | جافنا | Jaffna | Jaffna | lk | PPLA | 169102 | المقاطعة الشمالية | 9.6684 | 80.0074 | Asia/Colombo | 273.23 | kandy | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | moratuwa | موراتووا | Moratuwa | Moratuwa | lk | PPL | 168280 | المقاطعة الغربية | 6.7730 | 79.8816 | Asia/Colombo | 17.28 | colombo | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | negombo | نجومبو | Negombo | Negombo | lk | PPL | 137223 | المقاطعة الغربية | 7.2083 | 79.8358 | Asia/Colombo | 31.39 | colombo | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | galle | غالي | Galle | Galle | lk | PPLA | 93118 | المقاطعة الجنوبية | 6.0461 | 80.2103 | Asia/Colombo | 105.28 | colombo | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | ratnapura | راتنابورا | Ratnapura | Ratnapura | lk | PPLA | 47832 | مقاطعة سابراغاموا | 6.6858 | 80.4036 | Asia/Colombo | 65.62 | colombo | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | badulla | بادولا | Badulla | Badulla | lk | PPLA | 47587 | مقاطعة أوفا | 6.9802 | 81.0577 | Asia/Colombo | 58.14 | kandy | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | kurunegala | كورونيغالا | Kurunegala | Kurunegala | lk | PPLA | 28571 | المقاطعة الشمالية الغربية | 7.4839 | 80.3683 | Asia/Colombo | 36.31 | kandy | arabic_only |  |  | 80 | always_include:PPLA |
| ⚠️ | maharagama | ماهاراگاما | Maharagama | Maharagama | lk | PPL | 195355 | المقاطعة الغربية | 6.8480 | 79.9265 | Asia/Colombo | 11.37 | colombo | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | trincomalee | ترنکومالی | Trincomalee | Trincomalee | lk | PPLA | 108420 | المقاطعة الشرقية | 8.5778 | 81.2289 | Asia/Colombo | 157.43 | kandy | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | anuradhapura | anwrad ھa pwra | Anuradhapura | Anuradhapura | lk | PPLA | 60943 | المقاطعة الشمالية الوسطى | 8.3122 | 80.4131 | Asia/Colombo | 116.17 | kandy | mixed_latin |  |  | 85 | always_include:PPLA |

## Collision-watch list for LK

Cities the user pre-flagged (kickoff 2026-05-16): `kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| trincomalee | pending | high | trincomalee | 108420 | 157.43 | kandy |  |  |
| kandy | existing |  | kandy | 111701 |  |  |  |  |
| jaffna | pending | high | jaffna | 169102 | 273.23 | kandy |  |  |
| galle | pending | high | galle | 93118 | 105.28 | colombo |  |  |
| colombo | existing |  | colombo | 648034 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/lk-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-lk` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/LK.zip
