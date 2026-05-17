# LA GeoNames Import Report — Asia-1E

**Country**: Laos (لاوس)
**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T10:03:54.236Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/la-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/la-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/la-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1e-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 13292 |
| existing (matched, no action)     | 3 |
| **pending — high tier**           | **16** |
| pending — medium tier             | 0 |
| pending — low tier                | 6 |
| needs_review                      | 13267 |
| rejected                          | 0 |
| collisions in this wave (high)    | 1 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 8 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 5 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 3 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 7
**Blocked by ar-gate (high-tier):** 9

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | savannakhet | سافان ناخيت | Savannakhet | Savannakhet | la | PPLA | 125760 | مقاطعة سافاناخيت | 16.5703 | 104.7622 | Asia/Vientiane | 274.82 | vientiane | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | pakse | باكسي | Pakse | Pakse | la | PPLA | 77900 | مقاطعة تشامباساك | 15.1202 | 105.7990 | Asia/Vientiane | 463.31 | vientiane | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | xam-nua | خام نوا | Xam Nua | Xam Nua | la | PPLA | 56900 | مقاطعة هوافان | 20.4164 | 104.0450 | Asia/Vientiane | 309.25 | vientiane | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | pakxan | باكسان | Pakxan | Pakxan | la | PPLA | 21967 | مقاطعة بوليخامساي | 18.3942 | 103.6611 | Asia/Vientiane | 118.15 | vientiane | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | phongsali | فونغسالي | Phôngsali | Phôngsali | la | PPLA | 13500 | مقاطعة فونغسالي | 21.6808 | 102.1003 | Asia/Vientiane | 415.74 | vientiane | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | sainyabuli | سايني آبولي | Sainyabuli | Sainyabuli | la | PPLA | 13500 | مقاطعة سايابولي | 19.2576 | 101.7103 | Asia/Vientiane | 172.54 | vientiane | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | salavan | سالافان | Salavan | Salavan | la | PPLA | 5521 | مقاطعة سالافان | 15.7165 | 106.4174 | Asia/Vientiane | 474.63 | vientiane | arabic_only |  |  | 75 | always_include:PPLA |
| ⚠️ | thakhek | tھakhyk | Thakhèk | Thakhèk | la | PPLA | 90800 | مقاطعة خامواني | 17.4103 | 104.8307 | Asia/Vientiane | 241.14 | vientiane | mixed_latin |  |  | 85 | always_include:PPLA |
| ⚠️ | luang-prabang | لوآنگ پرابانگ | Luang Prabang | Luang Prabang | la | PPLA | 55027 | مقاطعة لوانغ برابانغ | 19.8933 | 102.1525 | Asia/Vientiane | 219.14 | vientiane | mixed_script |  |  | 85 | always_include:PPLA |
| ⚠️ | muang-phonsavan | مواang فونسافان | Muang Phônsavan | Muang Phônsavan | la | PPLA | 37507 | مقاطعة شيانغ خوانغ | 19.4494 | 103.1917 | Asia/Vientiane | 174.11 | vientiane | mixed_latin |  |  | 80 | always_include:PPLA |
| ⚠️ | muang-xay | mwang saے | Muang Xay | Muang Xay | la | PPLA | 25000 | مقاطعة أودومكساي | 20.6923 | 101.9837 | Asia/Vientiane | 309.66 | vientiane | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | sekong | سيكونج | Sekong | Sekong | la | PPLA | 20116 | مقاطعة سيكونغ | 15.3458 | 106.7237 | Asia/Vientiane | 524.74 | vientiane | arabic_only | wave | sekong-la | 80 | always_include:PPLA |
| ⚠️ | ban-houayxay | ban ہwayے saے | Ban Houayxay | Ban Houayxay | la | PPLA | 12500 | مقاطعة بوكيو | 20.2700 | 100.4178 | Asia/Vientiane | 345.31 | vientiane | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | muang-phon-hong | mwang fwn-ہang | Muang Phôn-Hông | Muang Phôn-Hông | la | PPLA | 10112 | مقاطعة فينتيان | 18.4953 | 102.4153 | Asia/Vientiane | 62.19 | vientiane | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | attapeu | aٹapyw | Attapeu | Attapeu | la | PPLA | 4297 | مقاطعة أتابو | 14.8107 | 106.8318 | Asia/Vientiane | 569.56 | vientiane | mixed_script |  |  | 70 | always_include:PPLA |
| ⚠️ | luang-namtha | lwang namtھa | Luang Namtha | Luang Namtha | la | PPLA | 3225 | مقاطعة لوانغ نامتا | 20.9486 | 101.4019 | Asia/Vientiane | 354.87 | vientiane | mixed_latin |  |  | 70 | always_include:PPLA |

## Collision-watch list for LA

Cities the user pre-flagged (kickoff 2026-05-16): `kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| vientiane | existing |  | vientiane | 840940 |  |  |  |  |
| savannakhet | pending | high | savannakhet | 125760 | 274.82 | vientiane |  |  |
| pakse | pending | high | pakse | 77900 | 463.31 | vientiane |  |  |
| thakhek | pending | high | thakhek | 90800 | 241.14 | vientiane |  |  |
| luang-prabang | pending | high | luang-prabang | 55027 | 219.14 | vientiane |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/la-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-la` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/LA.zip
