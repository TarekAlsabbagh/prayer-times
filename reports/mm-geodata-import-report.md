# MM GeoNames Import Report — Asia-1E

**Country**: Myanmar (ميانمار)
**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T10:03:54.078Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/mm-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/mm-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/mm-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1e-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 53122 |
| existing (matched, no action)     | 3 |
| **pending — high tier**           | **20** |
| pending — medium tier             | 0 |
| pending — low tier                | 95 |
| needs_review                      | 53004 |
| rejected                          | 0 |
| collisions in this wave (high)    | 0 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 13 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 7 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 13
**Blocked by ar-gate (high-tier):** 7

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | bago | باغو | Bago | Bago | mm | PPLA | 244376 | منطقة باغو | 17.3352 | 96.4814 | Asia/Yangon | 63.97 | yangon | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | pathein | باثيين | Pathein | Pathein | mm | PPLA | 237089 | منطقة آيياروادي | 16.7792 | 94.7321 | Asia/Yangon | 153.58 | yangon | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | monywa | مونيوا | Monywa | Monywa | mm | PPLA | 182011 | منطقة سعجاينغ | 22.1086 | 95.1358 | Asia/Yangon | 99.66 | mandalay | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | kyaukpyu | كياوكبيو | Kyaukpyu | Kyaukpyu | mm | PPL | 180000 | ولاية راخين | 19.4279 | 93.5513 | Asia/Yangon | 385.83 | mandalay | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | sittwe | سيتوي | Sittwe | Sittwe | mm | PPLA | 177743 | ولاية راخين | 20.1462 | 92.8983 | Asia/Yangon | 387.61 | mandalay | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | myeik | ماييك | Myeik | Myeik | mm | PPL | 173298 | منطقة تاينثاري | 12.4395 | 98.6003 | Asia/Yangon | 554.66 | yangon | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | taunggyi | تاونجي | Taunggyi | Taunggyi | mm | PPLA | 160115 | ولاية شان | 20.7892 | 97.0378 | Asia/Yangon | 162.98 | mandalay | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | myingyan | ماينجيان | Myingyan | Myingyan | mm | PPL | 141713 | منطقة ماندالاي | 21.4600 | 95.3884 | Asia/Yangon | 91.19 | mandalay | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | lashio | لاشيو | Lashio | Lashio | mm | PPL | 131000 | ولاية شان | 22.9359 | 97.7498 | Asia/Yangon | 202.31 | mandalay | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | myitkyina | ميتكينا | Myitkyina | Myitkyina | mm | PPLA | 90894 | ولاية كاتشين | 25.3833 | 97.3964 | Asia/Yangon | 403.38 | mandalay | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | hpa-an | هبا آن | Hpa-An | Hpa-An | mm | PPLA | 50000 | ولاية كاين | 16.8895 | 97.6348 | Asia/Yangon | 155.60 | yangon | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | hakha | هاخا | Hakha | Hakha | mm | PPLA | 24926 | ولاية تشين | 22.6445 | 93.6108 | Asia/Yangon | 266.12 | mandalay | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | loikaw | لويكاو | Loikaw | Loikaw | mm | PPLA | 17293 | ولاية كايا | 19.6780 | 97.2097 | Asia/Yangon | 279.08 | mandalay | arabic_only |  |  | 80 | always_include:PPLA |
| ⚠️ | mawlamyine | ماولامیئن | Mawlamyine | Mawlamyine | mm | PPLA | 438861 | ولاية مون | 16.4905 | 97.6282 | Asia/Yangon | 159.79 | yangon | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | amarapura | امراپورا | Amarapura | Amarapura | mm | PPLA3 | 237618 | منطقة ماندالاي | 21.9071 | 96.0489 | Asia/Yangon | 7.09 | mandalay | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | meiktila | میئکتیلا | Meiktila | Meiktila | mm | PPL | 177442 | منطقة ماندالاي | 20.8778 | 95.8584 | Asia/Yangon | 122.55 | mandalay | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | dawei | داوئی | Dawei | Dawei | mm | PPLA | 136783 | منطقة تاينثاري | 14.0823 | 98.1915 | Asia/Yangon | 375.30 | yangon | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | pyay | پیاے | Pyay | Pyay | mm | PPL | 135308 | منطقة باغو | 18.8200 | 95.2156 | Asia/Yangon | 242.29 | yangon | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | hinthada | حینتھادا | Hinthada | Hinthada | mm | PPL | 134947 | منطقة آيياروادي | 17.6494 | 95.4570 | Asia/Yangon | 117.78 | yangon | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | magway | mygwے | Magway | Magway | mm | PPLA | 96954 | منطقة ماغواي | 20.1496 | 94.9325 | Asia/Yangon | 234.26 | mandalay | mixed_script |  |  | 85 | always_include:PPLA |

## Collision-watch list for MM

Cities the user pre-flagged (kickoff 2026-05-16): `kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| sittwe | pending | high | sittwe | 177743 | 387.61 | mandalay |  |  |
| yangon | existing |  | yangon | 4477638 |  |  |  |  |
| bago | pending | high | bago | 244376 | 63.97 | yangon |  |  |
| mawlamyine | pending | high | mawlamyine | 438861 | 159.79 | yangon |  |  |
| mandalay | existing |  | mandalay | 1208099 |  |  |  |  |
| mandalay | existing |  | mandalay | - |  |  |  |  |
| pathein | pending | high | pathein | 237089 | 153.58 | yangon |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/mm-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-mm` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/MM.zip
