# BE GeoNames Import Report — Europe-1A

**Country**: Belgium (بلجيكا)
**Wave**: `CURATED-GEODATA-EUROPE-1A`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-15T20:23:32.279Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/be-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/be-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/be-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-1a-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 12473 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **7** |
| pending — medium tier             | 0 |
| pending — low tier                | 380 |
| needs_review                      | 12085 |
| rejected                          | 0 |
| collisions in this wave           | 1765 |
| collisions against existing curated | 5 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 6 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 1 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 6
**Blocked by ar-gate (high-tier):** 1

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | gent | جنت | Gent | Gent | be | PPL | 265086 | الإقليم الفلمنكي | 51.0500 | 3.7167 | 49.72 | brussels | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | charleroi | شارلروآ | Charleroi | Charleroi | be | PPL | 200132 | الإقليم الوالوني | 50.4114 | 4.4445 | 49.24 | brussels | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | liege | لييج | Liège | Liège | be | PPL | 195278 | الإقليم الوالوني | 50.6337 | 5.5675 | 88.87 | brussels | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | anderlecht | آندرلخت | Anderlecht | Anderlecht | be | PPLA4 | 160553 | بروكسل العاصمة | 50.8362 | 4.3145 | 3.04 | brussels | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | brugge | بروج | Brugge | Brugge | be | PPL | 118509 | الإقليم الفلمنكي | 51.2089 | 3.2242 | 88.36 | brussels | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | namur | نامور | Namur | Namur | be | PPLA | 110939 | الإقليم الوالوني | 50.4669 | 4.8675 | 56.03 | brussels | arabic_only |  | 90 | always_include:PPLA |
| ⚠️ | antwerpen | آنتورپ | Antwerpen | Antwerpen | be | PPL | 529247 | الإقليم الفلمنكي | 51.2205 | 4.4003 | 41.30 | brussels | mixed_script |  | 95 | pop_gte_100000 |

## What to do next

1. Read the table above. The **✅** rows pass the ar-gate;
   the **⚠️** rows need manual review for either Arabic name
   quality or slug collision.
2. For each **✅** row you want in curated:
   open `db/places/candidates/be-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-be` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/BE.zip
