# NP GeoNames Import Report — Asia-1E

**Country**: Nepal (نيبال)
**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T10:03:53.648Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/np-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/np-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/np-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1e-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 87725 |
| existing (matched, no action)     | 85 |
| **pending — high tier**           | **10** |
| pending — medium tier             | 0 |
| pending — low tier                | 15 |
| needs_review                      | 87615 |
| rejected                          | 0 |
| collisions in this wave (high)    | 0 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 4 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 5 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 1 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 4
**Blocked by ar-gate (high-tier):** 6

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | birganj | برغنج | Birgañj | Birgañj | np | PPL | 268273 | الإقليم الأوسط | 27.0174 | 84.8805 | Asia/Kathmandu | 89.30 | kathmandu | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | biratnagar | بيراتناغار | Biratnagar | Biratnagar | np | PPL | 244750 | الإقليم الشرقي | 26.4550 | 87.2701 | Asia/Kathmandu | 238.35 | kathmandu | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | janakpur | جانكبور | Janakpur | Janakpur | np | PPLA | 195438 | الإقليم الأوسط | 26.7288 | 85.9263 | Asia/Kathmandu | 125.00 | kathmandu | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | dipayal | ديبايال | Dipayal | Dipayal | np | PPLA | 33968 | الإقليم الغربي البعيد | 29.2608 | 80.9400 | Asia/Kathmandu | 319.11 | pokhara | arabic_only |  |  | 80 | always_include:PPLA |
| ⚠️ | bharatpur | باراتپور، نپال | Bharatpur | Bharatpur | np | PPL | 369377 | باغماتي | 27.6803 | 84.4365 | Asia/Kathmandu | 73.66 | pokhara | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | hetauda | ہیٹوڈا | Hetauda | Hetauda | np | PPL | 195951 | باغماتي | 27.4284 | 85.0322 | Asia/Kathmandu | 43.11 | kathmandu | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | butwal | bٹwal | Butwāl | Butwāl | np | PPLA | 195054 | إقليم لومبيني | 27.7005 | 83.4484 | Asia/Kathmandu | 77.39 | pokhara | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | birendranagar | بریندرنگر | Birendranagar | Birendranagar | np | PPLA | 154886 | الإقليم الأوسط الغربي | 28.5967 | 81.6166 | Asia/Kathmandu | 235.67 | pokhara | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | madhyapur-thimi | مدھیہپور تھمی | Madhyapur Thimi | Madhyapur Thimi | np | PPL | 119955 | باغماتي | 27.6806 | 85.3875 | Asia/Kathmandu | 7.46 | kathmandu | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | dhankuta | dھnkwta | Dhankutā | Dhankutā | np | PPLA | 22084 | الإقليم الشرقي | 26.9833 | 87.3333 | Asia/Kathmandu | 214.57 | kathmandu | mixed_latin |  |  | 80 | always_include:PPLA |

## Collision-watch list for NP

Cities the user pre-flagged (kickoff 2026-05-16): `kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pokhara | existing |  | pokhara | 600051 |  |  |  |  |
| kathmandu | existing |  | kathmandu | 1442271 |  |  |  |  |
| janakpur | pending | high | janakpur | 195438 | 125.00 | kathmandu |  |  |
| butwal | pending | high | butwal | 195054 | 77.39 | pokhara |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |
| pokhara | existing |  | pokhara | - |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/np-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-np` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/NP.zip
