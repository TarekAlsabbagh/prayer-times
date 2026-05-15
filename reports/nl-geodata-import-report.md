# NL GeoNames Import Report — Europe-1A

**Country**: Netherlands (هولندا)
**Wave**: `CURATED-GEODATA-EUROPE-1A`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-15T20:23:32.317Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/nl-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/nl-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/nl-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-1a-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 6980 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **21** |
| pending — medium tier             | 0 |
| pending — low tier                | 826 |
| needs_review                      | 6132 |
| rejected                          | 0 |
| collisions in this wave           | 722 |
| collisions against existing curated | 3 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 11 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 9 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 1 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 11
**Blocked by ar-gate (high-tier):** 10

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | utrecht | أوترخت | Utrecht | Utrecht | nl | PPLA | 376435 | أوتريخت | 52.0908 | 5.1222 | 34.17 | amsterdam | arabic_only |  | 90 | always_include:PPLA |
| ✅ | breda | بردا | Breda | Breda | nl | PPL | 184126 | برابانت الشمالية | 51.5866 | 4.7760 | 62.95 | the-hague | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | nijmegen | نايميخن | Nijmegen | Nijmegen | nl | PPL | 177359 | خيلدرلاند | 51.8425 | 5.8528 | 87.22 | amsterdam | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | almere-stad | آلمره استاد | Almere Stad | Almere Stad | nl | PPL | 176432 | فليفولاند | 52.3702 | 5.2141 | 21.05 | amsterdam | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | haarlem | هارلم | Haarlem | Haarlem | nl | PPLA | 162543 | هولندا الشمالية | 52.3808 | 4.6368 | 18.20 | amsterdam | arabic_only |  | 90 | always_include:PPLA |
| ✅ | s-hertogenbosch | هرتوجن بوش | 's-Hertogenbosch | 's-Hertogenbosch | nl | PPLA | 160783 | برابانت الشمالية | 51.6992 | 5.3042 | 79.20 | amsterdam | arabic_only |  | 90 | always_include:PPLA |
| ✅ | enschede | إنسخيده | Enschede | Enschede | nl | PPL | 153655 | أوفرآيسل | 52.2183 | 6.8958 | 136.47 | amsterdam | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | apeldoorn | آبلدورن | Apeldoorn | Apeldoorn | nl | PPL | 136670 | خيلدرلاند | 52.2100 | 5.9694 | 74.55 | amsterdam | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | leeuwarden | ليوواردن | Leeuwarden | Leeuwarden | nl | PPLA | 124481 | فريسلاند | 53.2027 | 5.8097 | 111.05 | amsterdam | arabic_only |  | 90 | always_include:PPLA |
| ✅ | venlo | فنلو | Venlo | Venlo | nl | PPLA2 | 101988 | ليمبورخ | 51.3700 | 6.1681 | 140.84 | amsterdam | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | assen | آسن | Assen | Assen | nl | PPLA | 68836 | درنته | 52.9967 | 6.5625 | 131.87 | amsterdam | arabic_only |  | 85 | always_include:PPLA |
| ⚠️ | rotterdam | راٹرڈیم | Rotterdam | Rotterdam | nl | PPL | 868135 | هولندا الجنوبية | 51.9225 | 4.4792 | 20.50 | the-hague | mixed_script |  | 95 | pop_gte_100000 |
| ⚠️ | groningen | grwnynګn | Groningen | Groningen | nl | PPLA | 244807 | خرونينغن | 53.2192 | 6.5667 | 146.50 | amsterdam | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | eindhoven | آئنڈھون | Eindhoven | Eindhoven | nl | PPL | 235691 | برابانت الشمالية | 51.4408 | 5.4778 | 107.08 | the-hague | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | tilburg | تیلبورخ | Tilburg | Tilburg | nl | PPL | 221947 | برابانت الشمالية | 51.5555 | 5.0913 | 78.95 | the-hague | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | arnhem | arnہym | Arnhem | Arnhem | nl | PPLA | 162424 | خيلدرلاند | 51.9800 | 5.9111 | 81.07 | amsterdam | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | zwolle | zwlې | Zwolle | Zwolle | nl | PPLA | 129840 | أوفرآيسل | 52.5125 | 6.0944 | 82.28 | amsterdam | mixed_latin |  | 90 | always_include:PPLA |
| ⚠️ | maastricht | masٹrkht | Maastricht | Maastricht | nl | PPLA | 122378 | ليمبورخ | 50.8483 | 5.6889 | 166.48 | the-hague | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | leiden | لائڈن | Leiden | Leiden | nl | PPL | 119713 | هولندا الجنوبية | 52.1583 | 4.4931 | 16.37 | the-hague | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | lelystad | lyly sٹaڈ | Lelystad | Lelystad | nl | PPLA | 79811 | فليفولاند | 52.5083 | 5.4750 | 41.74 | amsterdam | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | middelburg | mڈl brg | Middelburg | Middelburg | nl | PPLA | 46485 | زيلاند | 51.5000 | 3.6139 | 79.09 | the-hague | mixed_script | wave→middelburg-nl | 80 | always_include:PPLA |

## What to do next

1. Read the table above. The **✅** rows pass the ar-gate;
   the **⚠️** rows need manual review for either Arabic name
   quality or slug collision.
2. For each **✅** row you want in curated:
   open `db/places/candidates/nl-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-nl` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/NL.zip
