# BT GeoNames Import Report — Asia-1E

**Country**: Bhutan (بوتان)
**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E (popMin 20000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T10:03:53.786Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/bt-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/bt-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/bt-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1e-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 251 |
| existing (matched, no action)     | 0 |
| **pending — high tier**           | **22** |
| pending — medium tier             | 0 |
| pending — low tier                | 61 |
| needs_review                      | 168 |
| rejected                          | 0 |
| collisions in this wave (high)    | 1 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 5 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 14 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 3 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 5
**Blocked by ar-gate (high-tier):** 17

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | paro | بارو | Paro | Paro | bt | PPLA | 11448 | دزونغخاغ بارو | 27.4305 | 89.4133 | Asia/Thimphu |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | jakar | جاكار | Jakar | Jakar | bt | PPLA | 6243 | دزونغخاغ بومثانغ | 27.5492 | 90.7525 | Asia/Thimphu |  |  | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | tsimasham | تسيماشام | Tsimasham | Tsimasham | bt | PPLA | 2855 | دزونغخاغ تشوكا | 27.0989 | 89.5360 | Asia/Thimphu |  |  | arabic_only |  |  | 70 | always_include:PPLA |
| ✅ | ha | ها | Ha | Ha | bt | PPLA | 1449 | دزونغخاغ هاآ | 27.3875 | 89.2807 | Asia/Thimphu |  |  | arabic_only |  |  | 70 | always_include:PPLA |
| ✅ | gasa | غاسا | Gasa | Gasa | bt | PPLA | 548 | دزونغخاغ غاسا | 27.9037 | 89.7269 | Asia/Thimphu |  |  | arabic_only |  |  | 65 | always_include:PPLA |
| ⚠️ | thimphu | تىمپۇ | Thimphu | Thimphu | bt | PPLC | 98676 | دزونغخاغ ثيمفو | 27.4661 | 89.6419 | Asia/Thimphu |  |  | mixed_script |  |  | 85 | always_include:PPLC |
| ⚠️ | phuntsholing | پھونتشولنگ | Phuntsholing | Phuntsholing | bt | PPL | 27658 | دزونغخاغ تشوكا | 26.8516 | 89.3884 | Asia/Thimphu |  |  | mixed_script |  |  | 80 | pop_gte_20000 |
| ⚠️ | tsirang | tsyranګ | Tsirang | Tsirang | bt | PPLA | 22376 | دزونغخاغ تسيرانغ | 27.0219 | 90.1229 | Asia/Thimphu |  |  | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | punakha | pwnakھa | Punākha | Punākha | bt | PPLA | 21500 | دزونغخاغ بوناخا | 27.5914 | 89.8774 | Asia/Thimphu |  |  | mixed_latin |  |  | 80 | always_include:PPLA |
| ⚠️ | pemagatshel | pymaګtshyl | Pemagatshel | Pemagatshel | bt | PPLA | 13864 | دزونغخاغ بيماغاتشيل | 27.0379 | 91.4030 | Asia/Thimphu |  |  | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | sarpang | sarpnګ | Sarpang | Sarpang | bt | PPLA | 10416 | دزونغخاغ سارباغ | 26.8639 | 90.2674 | Asia/Thimphu |  |  | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | samdrup-jongkhar | samdrwp jwnګkhar | Samdrup Jongkhar | Samdrup Jongkhar | bt | PPLA | 9325 | دزونغخاغ سامدروب جونغخار | 26.8007 | 91.5052 | Asia/Thimphu |  |  | mixed_script |  |  | 75 | always_include:PPLA |
| ⚠️ | wangdue-phodrang | wangdyw fwڈrang | Wangdue Phodrang | Wangdue Phodrang | bt | PPLA | 8954 | دزونغخاغ وانغديو فودرانغ | 27.4861 | 89.8992 | Asia/Thimphu |  |  | mixed_script |  |  | 75 | always_include:PPLA |
| ⚠️ | samtse | samtsې | Samtse | Samtse | bt | PPLA | 5396 | دزونغخاغ سامتسي | 26.8990 | 89.0995 | Asia/Thimphu |  |  | mixed_latin |  |  | 75 | always_include:PPLA |
| ⚠️ | trashi-yangtse | trashy yanګtsې | Trashi Yangtse | Trashi Yangtse | bt | PPLA | 3025 | دزونغخاغ تراشي يانغتسي | 27.6116 | 91.4980 | Asia/Thimphu |  |  | mixed_script |  |  | 70 | always_include:PPLA |
| ⚠️ | mongar | mwnګar | Mongar | Mongar | bt | PPLA | 2969 | دزونغخاغ مونغار | 27.2747 | 91.2396 | Asia/Thimphu |  |  | mixed_script |  |  | 70 | always_include:PPLA |
| ⚠️ | trongsa | trwnګsa | Trongsa | Trongsa | bt | PPLA | 2805 | دزونغخاغ ترونغسا | 27.5026 | 90.5072 | Asia/Thimphu |  |  | mixed_script |  |  | 70 | always_include:PPLA |
| ⚠️ | daga | daګa | Daga | Daga | bt | PPLA | 2243 | دزونغخاغ داغانا | 27.0753 | 89.8769 | Asia/Thimphu |  |  | mixed_script | wave | daga-bt | 70 | always_include:PPLA |
| ⚠️ | lhuentse | lhwyntsې | Lhuentse | Lhuentse | bt | PPLA | 1935 | دزونغخاغ لهونتسي | 27.6679 | 91.1839 | Asia/Thimphu |  |  | mixed_latin |  |  | 70 | always_include:PPLA |
| ⚠️ | trashigang | trashyګnګ | Trashigang | Trashigang | bt | PPLA | 872 | دزونغخاغ تراشيغانغ | 27.3331 | 91.5542 | Asia/Thimphu |  |  | mixed_script |  |  | 65 | always_include:PPLA |
| ⚠️ | shemgang | shymګnګ | Shemgang | Shemgang | bt | PPLA | 852 | دزونغخاغ زهيمغانغ | 27.2169 | 90.6579 | Asia/Thimphu |  |  | mixed_script |  |  | 65 | always_include:PPLA |
| ⚠️ | lungtenzampa | lnګtnzmpa | Lungtenzampa | Lungtenzampa | bt | PPLA | - | دزونغخاغ ثيمفو | 27.4682 | 89.6444 | Asia/Thimphu |  |  | mixed_script |  |  | 60 | always_include:PPLA |

## Collision-watch list for BT

Cities the user pre-flagged (kickoff 2026-05-16): `kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| thimphu | pending | high | thimphu | 98676 |  |  |  |  |
| punakha | pending | high | punakha | 21500 |  |  |  |  |
| paro | pending | high | paro | 11448 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/bt-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-bt` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/BT.zip
