# IT GeoNames Import Report — Europe-2

**Country**: Italy (إيطاليا)
**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T07:20:58.700Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/it-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/it-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/it-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-2-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 61846 |
| existing (matched, no action)     | 14 |
| **pending — high tier**           | **25** |
| pending — medium tier             | 0 |
| pending — low tier                | 226 |
| needs_review                      | 61581 |
| rejected                          | 0 |
| collisions in this wave           | 2349 |
| collisions against existing curated | 48 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 23 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 2 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 22
**Blocked by ar-gate (high-tier):** 3

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | palermo | بالرمو | Palermo | Palermo | it | PPLA | 648260 | صقلية | 38.1166 | 13.3636 | 313.88 | naples | arabic_only |  | 95 | always_include:PPLA |
| ✅ | bari | باري | Bari | Bari | it | PPLA | 316491 | بوليا | 41.1207 | 16.8698 | 220.41 | naples | arabic_only |  | 90 | always_include:PPLA |
| ✅ | catania | كاتانيا | Catania | Catania | it | PPLA2 | 311584 | صقلية | 37.4922 | 15.0704 | 379.91 | naples | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | verona | فيرونا | Verona | Verona | it | PPLA2 | 258031 | فينيتو | 45.4385 | 10.9938 | 103.12 | venice | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | messina | ميسينا | Messina | Messina | it | PPLA2 | 219948 | صقلية | 38.1939 | 15.5526 | 315.40 | naples | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | trieste | إسطاجانكو | Trieste | Trieste | it | PPLA | 204338 | فريولي-فينيتسيا جوليا | 45.6495 | 13.7768 | 116.14 | venice | arabic_only |  | 90 | always_include:PPLA |
| ✅ | padua | بادوفا | Padua | Padua | it | PPLA2 | 203725 | فينيتو | 45.4080 | 11.8859 | 33.73 | venice | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | brescia | بريشيا | Brescia | Brescia | it | PPLA2 | 200423 | لومبارديا | 45.5356 | 10.2147 | 80.26 | milan | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | taranto | تارانتو | Taranto | Taranto | it | PPLA2 | 198585 | بوليا | 40.4644 | 17.2471 | 254.94 | naples | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | parma | بارما | Parma | Parma | it | PPLA2 | 198292 | إميليا رومانيا | 44.7993 | 10.3262 | 87.24 | bologna | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | modena | مودينا | Modena | Modena | it | PPLA2 | 184732 | إميليا رومانيا | 44.6478 | 10.9254 | 37.17 | bologna | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | reggio-calabria | ريدجو كالابريا | Reggio Calabria | Reggio Calabria | it | PPLA2 | 182455 | كالابريا | 38.1105 | 15.6613 | 327.42 | naples | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | livorno | ليفورنو | Livorno | Livorno | it | PPLA2 | 157017 | توسكانا | 43.5443 | 10.3262 | 20.76 | pisa | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cagliari | كالياري | Cagliari | Cagliari | it | PPLA | 149257 | سردينيا | 39.2305 | 9.1192 | 411.85 | rome | arabic_only |  | 90 | always_include:PPLA |
| ✅ | rimini | ريميني | Rimini | Rimini | it | PPLA2 | 148688 | إميليا رومانيا | 44.0575 | 12.5653 | 108.81 | bologna | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | foggia | بيرودجا | Foggia | Foggia | it | PPLA2 | 137032 | بوليا | 41.4584 | 15.5519 | 126.89 | naples | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | salerno | ساليرنو | Salerno | Salerno | it | PPLA2 | 125797 | كامبانيا | 40.6754 | 14.7933 | 48.38 | naples | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | monza | منزا | Monza | Monza | it | PPLA2 | 124398 | لومبارديا | 45.5800 | 9.2725 | 14.39 | milan | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | bergamo | بيرغامو | Bergamo | Bergamo | it | PPLA2 | 121200 | لومبارديا | 45.6960 | 9.6672 | 45.21 | milan | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | trento | ترنتو | Trento | Trento | it | PPLA | 120709 | ترنتينو ألتو أديجي | 46.0679 | 11.1211 | 115.97 | venice | arabic_only |  | 90 | always_include:PPLA |
| ✅ | perugia | بيرودجا | Perugia | Perugia | it | PPLA | 120137 | أومبريا | 43.1122 | 12.3888 | 117.09 | florence | arabic_only |  | 90 | always_include:PPLA |
| ✅ | pescara | بيسكارا | Pescara | Pescara | it | PPLA2 | 119554 | أبروتسو | 42.4584 | 14.2028 | 153.58 | rome | arabic_only |  | 90 | pop_gte_100000 |
| ⚠️ | prato | براتو | Prato | Prato | it | PPLA2 | 195089 | توسكانا | 43.8805 | 11.0970 | 17.73 | florence | arabic_only | wave→prato-it | 90 | pop_gte_100000 |
| ⚠️ | siracusa | سائراکوز | Siracusa | Siracusa | it | PPLA2 | 121605 | صقلية | 37.0754 | 15.2866 | 429.04 | naples | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | piacenza | پیاچنزا | Piacenza | Piacenza | it | PPLA2 | 103607 | إميليا رومانيا | 45.0524 | 9.6934 | 60.41 | milan | mixed_script |  | 90 | pop_gte_100000 |

## Collision-watch list for IT

Cities the user pre-flagged: `hamburg`, `munich`, `frankfurt`, `cologne`, `dresden`, `leipzig`, `bremen`, `hannover`, `dortmund`, `essen`, `duisburg`, `bochum`, `salzburg`, `graz`, `linz`, `innsbruck`, `zurich`, `geneva`, `basel`, `bern`, `lausanne`, `palermo`, `bari`, `catania`, `verona`, `padua`, `trieste`, `brescia`, `parma`, `modena`, `prato`, `livorno`, `ravenna`, `salerno`, `copenhagen`, `aarhus`, `odense`, `aalborg`, `stockholm`, `gothenburg`, `malmo`, `uppsala`, `oslo`, `bergen`, `trondheim`, `stavanger`, `helsinki`, `espoo`, `tampere`, `vantaa`, `oulu`, `turku`, `reykjavik`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| palermo | pending | high | palermo | 648260 | 313.88 | naples |  |  |
| catania | pending | high | catania | 311584 | 379.91 | naples |  |  |
| verona | pending | high | verona | 258031 | 103.12 | venice |  |  |
| trieste | pending | high | trieste | 204338 | 116.14 | venice |  |  |
| salerno | pending | high | salerno | 125797 | 48.38 | naples |  |  |
| prato | pending | high | prato | 195089 | 17.73 | florence | wave | prato-it |
| parma | pending | high | parma | 198292 | 87.24 | bologna |  |  |
| padua | pending | high | padua | 203725 | 33.73 | venice |  |  |
| modena | pending | high | modena | 184732 | 37.17 | bologna |  |  |
| livorno | pending | high | livorno | 157017 | 20.76 | pisa |  |  |
| brescia | pending | high | brescia | 200423 | 80.26 | milan |  |  |
| bari | pending | high | bari | 316491 | 220.41 | naples |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/it-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-it` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/IT.zip
