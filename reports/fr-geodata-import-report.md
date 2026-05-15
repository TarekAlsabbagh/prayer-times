# FR GeoNames Import Report — Europe-1A

**Country**: France (فرنسا)
**Wave**: `CURATED-GEODATA-EUROPE-1A`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-15T20:23:32.213Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/fr-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/fr-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/fr-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-1a-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 80238 |
| existing (matched, no action)     | 17 |
| **pending — high tier**           | **30** |
| pending — medium tier             | 0 |
| pending — low tier                | 3247 |
| needs_review                      | 76944 |
| rejected                          | 0 |
| collisions in this wave           | 3231 |
| collisions against existing curated | 16 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 21 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 9 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 19
**Blocked by ar-gate (high-tier):** 11

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | nantes | نانت | Nantes | Nantes | fr | PPLA | 325070 | بايز دو لا لوار | 47.2172 | -1.5534 | 275.06 | bordeaux | arabic_only |  | 90 | always_include:PPLA |
| ✅ | rennes | رن | Rennes | Rennes | fr | PPLA | 227830 | بريتاني | 48.1111 | -1.6743 | 308.08 | paris | arabic_only |  | 90 | always_include:PPLA |
| ✅ | le-havre | لو آور | Le Havre | Le Havre | fr | PPLA3 | 185972 | نورماندي | 49.4935 | 0.1079 | 177.85 | paris | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | saint-etienne | سانت إتيان | Saint-Étienne | Saint-Étienne | fr | PPLA2 | 176280 | أوفيرني-رون-ألب | 45.4339 | 4.3900 | 50.49 | lyon | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | toulon | تولون | Toulon | Toulon | fr | PPLA2 | 168701 | بروفنس-ألب-كوت دازور | 43.1244 | 5.9284 | 49.15 | marseille | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | dijon | ديجون | Dijon | Dijon | fr | PPLA | 159941 | بورغوني-فرانش-كونتيه | 47.3134 | 5.0139 | 172.83 | lyon | arabic_only |  | 90 | always_include:PPLA |
| ✅ | grenoble | غرونوبل | Grenoble | Grenoble | fr | PPLA2 | 158552 | أوفيرني-رون-ألب | 45.1787 | 5.7148 | 94.52 | lyon | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | clermont-ferrand | كليرمون فيران | Clermont-Ferrand | Clermont-Ferrand | fr | PPLA2 | 147865 | أوفيرني-رون-ألب | 45.7797 | 3.0868 | 135.65 | lyon | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | aix-en-provence | آكس أون بروفانس | Aix-en-Provence | Aix-en-Provence | fr | PPLA3 | 146821 | بروفنس-ألب-كوت دازور | 43.5283 | 5.4497 | 26.57 | marseille | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | le-mans | لو مان | Le Mans | Le Mans | fr | PPLA2 | 144515 | بايز دو لا لوار | 48.0021 | 0.2025 | 184.88 | paris | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | tours | تور | Tours | Tours | fr | PPLA2 | 141621 | سنتر-فال دو لوار | 47.3948 | 0.7040 | 203.42 | paris | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | villeurbanne | فيلوربان | Villeurbanne | Villeurbanne | fr | PPL | 131445 | أوفيرني-رون-ألب | 45.7660 | 4.8795 | 3.40 | lyon | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | besancon | بزانسون | Besançon | Besançon | fr | PPLA2 | 128426 | بورغوني-فرانش-كونتيه | 47.2488 | 6.0182 | 188.27 | lyon | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | metz | متز | Metz | Metz | fr | PPLA2 | 123914 | غران إست | 49.1191 | 6.1727 | 280.27 | paris | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | orleans | أورليان | Orléans | Orléans | fr | PPLA | 116344 | سنتر-فال دو لوار | 47.9025 | 1.9041 | 111.14 | paris | arabic_only |  | 90 | always_include:PPLA |
| ✅ | rouen | رؤن | Rouen | Rouen | fr | PPLA | 116331 | نورماندي | 49.4431 | 1.0993 | 112.06 | paris | arabic_only |  | 90 | always_include:PPLA |
| ✅ | perpignan | بيربينيا | Perpignan | Perpignan | fr | PPLA2 | 110706 | أوكسيتاني | 42.6976 | 2.8954 | 155.02 | toulouse | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | caen | كاين | Caen | Caen | fr | PPLA2 | 110624 | نورماندي | 49.1859 | -0.3591 | 201.06 | paris | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | nancy | نانسي | Nancy | Nancy | fr | PPLA2 | 105058 | غران إست | 48.6844 | 6.1850 | 281.51 | paris | arabic_only |  | 90 | pop_gte_100000 |
| ⚠️ | strasbourg | استراسبورگ | Strasbourg | Strasbourg | fr | PPLA | 274845 | غران إست | 48.5839 | 7.7455 | 382.95 | lyon | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | montpellier | مونبلييه | Montpellier | Montpellier | fr | PPLA2 | 248252 | أوكسيتاني | 43.6109 | 3.8763 | 125.52 | marseille | arabic_only | wave→montpellier-fr | 90 | pop_gte_100000 |
| ⚠️ | lille | للی | Lille | Lille | fr | PPLA | 238695 | أوت دو فرانس | 50.6339 | 3.0551 | 203.98 | paris | mixed_script | wave→lille-fr | 90 | always_include:PPLA |
| ⚠️ | reims | رائیم | Reims | Reims | fr | PPLA3 | 196565 | غران إست | 49.2653 | 4.0285 | 130.31 | paris | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | angers | آنژه | Angers | Angers | fr | PPLA2 | 168279 | بايز دو لا لوار | 47.4716 | -0.5520 | 264.76 | paris | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | nimes | نائیم | Nîmes | Nîmes | fr | PPLA2 | 148236 | أوكسيتاني | 43.8366 | 4.3579 | 101.26 | marseille | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | amiens | آمیاں | Amiens | Amiens | fr | PPLA2 | 143086 | أوت دو فرانس | 49.9000 | 2.3000 | 116.08 | paris | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | limoges | ليموج | Limoges | Limoges | fr | PPLA2 | 141176 | نوفيل-أكيتانيا | 45.8336 | 1.2476 | 180.69 | bordeaux | arabic_only | wave→limoges-fr | 90 | pop_gte_100000 |
| ⚠️ | mulhouse | ملہاؤز | Mulhouse | Mulhouse | fr | PPLA3 | 111430 | غران إست | 47.7520 | 7.3287 | 291.40 | lyon | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | boulogne-billancourt | بولون-بلانکور | Boulogne-Billancourt | Boulogne-Billancourt | fr | PPLA3 | 108782 | إيل دو فرانس | 48.8355 | 2.2413 | 8.45 | paris | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | ajaccio | آژاکسیو | Ajaccio | Ajaccio | fr | PPLA | 54364 | كورسيكا | 41.9189 | 8.7381 | 232.74 | nice-fr | mixed_script |  | 85 | always_include:PPLA |

## What to do next

1. Read the table above. The **✅** rows pass the ar-gate;
   the **⚠️** rows need manual review for either Arabic name
   quality or slug collision.
2. For each **✅** row you want in curated:
   open `db/places/candidates/fr-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-fr` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/FR.zip
