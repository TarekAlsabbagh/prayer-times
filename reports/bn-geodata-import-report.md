# BN GeoNames Import Report — Asia-1E

**Country**: Brunei (بروناي)
**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E (popMin 20000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T10:03:53.789Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/bn-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/bn-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/bn-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1e-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 357 |
| existing (matched, no action)     | 0 |
| **pending — high tier**           | **4** |
| pending — medium tier             | 0 |
| pending — low tier                | 0 |
| needs_review                      | 353 |
| rejected                          | 0 |
| collisions in this wave (high)    | 1 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 3 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 1 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 2
**Blocked by ar-gate (high-tier):** 2

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | kuala-belait | كوالا بيلايت | Kuala Belait | Kuala Belait | bn | PPLA | 31178 | منطقة بليت | 4.5836 | 114.2312 | Asia/Brunei |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | tutong | توتونج | Tutong | Tutong | bn | PPLA | 19151 | منطقة توتونغ | 4.8028 | 114.6492 | Asia/Brunei |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ⚠️ | bandar-seri-begawan | باندار سەرى بەگاۋان | Bandar Seri Begawan | Bandar Seri Begawan | bn | PPLC | 64409 | بروناي ومووارا | 4.8903 | 114.9401 | Asia/Brunei |  |  | mixed_script |  |  | 85 | always_include:PPLC |
| ⚠️ | bangar | بانجار | Bangar | Bangar | bn | PPLA | 3970 | منطقة تمبورنغ | 4.7086 | 115.0717 | Asia/Brunei |  |  | arabic_only | wave | bangar-bn | 70 | always_include:PPLA |

## Collision-watch list for BN

Cities the user pre-flagged (kickoff 2026-05-16): `kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tutong | pending | high | tutong | 19151 |  |  |  |  |
| kuala-belait | pending | high | kuala-belait | 31178 |  |  |  |  |
| bandar-seri-begawan | pending | high | bandar-seri-begawan | 64409 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/bn-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-bn` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/BN.zip
