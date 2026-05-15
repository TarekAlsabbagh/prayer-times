# IE GeoNames Import Report — Europe-1A

**Country**: Ireland (أيرلندا)
**Wave**: `CURATED-GEODATA-EUROPE-1A`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-15T20:23:31.729Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/ie-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/ie-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/ie-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-1a-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 11988 |
| existing (matched, no action)     | 2 |
| **pending — high tier**           | **3** |
| pending — medium tier             | 0 |
| pending — low tier                | 156 |
| needs_review                      | 11827 |
| rejected                          | 0 |
| collisions in this wave           | 860 |
| collisions against existing curated | 5 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 2 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 1 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 2
**Blocked by ar-gate (high-tier):** 1

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | cork | كورك | Cork | Cork | ie | PPLA2 | 190384 | مونستر | 51.8980 | -8.4706 | 219.80 | dublin | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | swords | اسوردز | Swords | Swords | ie | PPLA | 42738 | لينستر | 53.4597 | -6.2181 | 12.54 | dublin | arabic_only |  | 80 | always_include:PPLA |
| ⚠️ | nenagh | نینا | Nenagh | Nenagh | ie | PPLA | 5500 | مونستر | 52.8628 | -8.1995 | 140.31 | dublin | mixed_script |  | 75 | always_include:PPLA |

## What to do next

1. Read the table above. The **✅** rows pass the ar-gate;
   the **⚠️** rows need manual review for either Arabic name
   quality or slug collision.
2. For each **✅** row you want in curated:
   open `db/places/candidates/ie-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-ie` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/IE.zip
