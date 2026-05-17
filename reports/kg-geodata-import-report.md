# KG GeoNames Import Report — Asia-1H

**Country**: Kyrgyzstan (قيرغيزستان)
**Wave**: `CURATED-GEODATA-ASIA-1H`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T13:06:22.831Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/kg-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/kg-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/kg-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1h-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 2490 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **6** |
| pending — medium tier             | 0 |
| pending — low tier                | 100 |
| needs_review                      | 2383 |
| rejected                          | 0 |
| collisions in this wave (high)    | 4 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 5 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 0 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 1 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 2
**Blocked by ar-gate (high-tier):** 4

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | osh | أوش | Osh | Osh | kg | PPLA | 322164 | أوش | 40.5283 | 72.7985 | Asia/Bishkek | 299.47 | bishkek | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | batken | باتكن | Batken | Batken | kg | PPLA | 27730 | منطقة باتكن | 40.0604 | 70.8193 | Asia/Bishkek | 442.15 | bishkek | arabic_only |  |  | 80 | always_include:PPLA |
| ⚠️ | manas | جلال آباد | Manas | Manas | kg | PPLA | 123239 | منطقة تالاس | 40.9450 | 72.9931 | Asia/Bishkek | 251.11 | bishkek | arabic_only | wave | manas-kg | 90 | always_include:PPLA |
| ⚠️ | karakol | قاراقۆل | Karakol | Karakol | kg | PPLA | 84351 | منطقة إيسيك-كول | 42.4905 | 78.3920 | Asia/Bishkek | 315.31 | bishkek | mixed_unknown | wave | karakol-kg | 85 | always_include:PPLA |
| ⚠️ | naryn | نارين | Naryn | Naryn | kg | PPLA | 41178 | منطقة نارين | 41.4283 | 75.9957 | Asia/Bishkek | 199.19 | bishkek | arabic_only | wave | naryn-kg | 80 | always_include:PPLA |
| ⚠️ | talas | تالاس | Talas | Talas | kg | PPLA | 40308 | منطقة تالاس | 42.5226 | 72.2417 | Asia/Bishkek | 194.23 | bishkek | arabic_only | wave | talas-kg | 80 | always_include:PPLA |

## Collision-watch list for KG

Cities the user pre-flagged (kickoff 2026-05-16): `tashkent`, `samarkand`, `bukhara`, `namangan`, `andijan`, `nukus`, `fergana`, `qarshi`, `astana`, `almaty`, `shymkent`, `karaganda`, `aktobe`, `atyrau`, `taraz`, `pavlodar`, `oskemen`, `semey`, `kyzylorda`, `kostanay`, `turkestan`, `dushanbe`, `khujand`, `bokhtar`, `kulob`, `khorugh`, `bishkek`, `osh`, `jalal-abad`, `karakol`, `tokmok`, `ashgabat`, `turkmenabat`, `dasoguz`, `mary`, `balkanabat`, `ulaanbaatar`, `erdenet`, `darkhan`, `choibalsan`, `olgii`, `khovd`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tokmok | pending | low | tokmok | 71443 | 59.75 | bishkek |  |  |
| osh | pending | high | osh | 322164 | 299.47 | bishkek |  |  |
| karakol | pending | high | karakol | 84351 | 315.31 | bishkek | wave | karakol-kg |
| bishkek | existing |  | bishkek | 900000 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/kg-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-kg` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/KG.zip
