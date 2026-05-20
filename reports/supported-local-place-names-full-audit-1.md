# SUPPORTED-LOCAL-PLACE-NAMES-FULL-AUDIT-1 — Deep Audit Report

**Date**: 2026-05-21
**Mode**: READ-ONLY — `db/places/curated-places.json` NOT touched
**Status**: Awaiting user direction on scope expansion

---

## 1. Scan totals

* **Cities scanned**: 612
* **Distinct countries scanned**: 24
* **SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 already applied**: 36 fixes (34 ID Kota X + 2 ES accent)
* **New proposed fixes (beyond the 36 already applied)**: **36**

---

## 2. Country → required supported langs map

| countryCode | Required langs (beyond ar+en universal baseline) |
|---|---|
| AR | `es` |
| AT | `de` |
| BD | `bn` |
| BE | `fr`, `de` |
| BN | `ms` |
| BO | `es` |
| CH | `de` |
| CL | `es` |
| CO | `es` |
| CR | `es` |
| CU | `es` |
| DE | `de` |
| DO | `es` |
| EC | `es` |
| ES | `es` |
| FR | `fr` |
| GT | `es` |
| HN | `es` |
| ID | `id` |
| IN | `ur`, `bn` |
| LI | `de` |
| LU | `de`, `fr` |
| MX | `es` |
| MY | `ms` |
| NI | `es` |
| PA | `es` |
| PE | `es` |
| PK | `ur` |
| PR | `es` |
| PY | `es` |
| SG | `ms` |
| SV | `es` |
| TR | `tr` |
| UY | `es` |
| VE | `es` |

---

## 3. Per-country classification summary

| Country | Lang | Total | native_ok | fillchain_acceptable | fillchain_suspicious | missing | polluted |
|---|---|---|---|---|---|---|---|
| PK | ur | 148 | 148 | 0 | 0 | 0 | 0 |
| IN | ur | 109 | 109 | 0 | 0 | 0 | 0 |
| IN | bn | 109 | 109 | 0 | 0 | 0 | 0 |
| DE | de | 56 | 4 | 46 | 6 | 0 | 0 |
| ES | es | 45 | 3 | 30 | 12 | 0 | 0 |
| ID | id | 41 | 34 | 6 | 1 | 0 | 0 |
| BD | bn | 38 | 38 | 0 | 0 | 0 | 0 |
| MX | es | 31 | 1 | 30 | 0 | 0 | 0 |
| FR | fr | 25 | 0 | 19 | 6 | 0 | 0 |
| MY | ms | 21 | 1 | 8 | 12 | 0 | 0 |
| TR | tr | 14 | 4 | 10 | 0 | 0 | 0 |
| CH | de | 14 | 1 | 13 | 0 | 0 | 0 |
| PE | es | 13 | 0 | 13 | 0 | 0 | 0 |
| AR | es | 10 | 0 | 10 | 0 | 0 | 0 |
| CO | es | 9 | 1 | 8 | 0 | 0 | 0 |
| VE | es | 9 | 0 | 9 | 0 | 0 | 0 |
| BE | fr | 7 | 1 | 6 | 0 | 0 | 0 |
| BE | de | 7 | 1 | 6 | 0 | 0 | 0 |
| CL | es | 6 | 0 | 6 | 0 | 0 | 0 |
| AT | de | 5 | 1 | 4 | 0 | 0 | 0 |
| BN | ms | 4 | 0 | 4 | 0 | 0 | 0 |
| LU | de | 3 | 1 | 2 | 0 | 0 | 0 |
| LU | fr | 3 | 0 | 3 | 0 | 0 | 0 |
| SG | ms | 1 | 1 | 0 | 0 | 0 | 0 |
| UY | es | 1 | 0 | 1 | 0 | 0 | 0 |
| EC | es | 1 | 0 | 1 | 0 | 0 | 0 |
| BO | es | 1 | 0 | 1 | 0 | 0 | 0 |

---

## 4. Malaysia (MY) deep-dive — every city

| Slug | names.en | names.ms (current) | Status | GeoNames alt candidates | Recommendation |
|---|---|---|---|---|---|
| `kuala-lumpur` | Kuala Lumpur | Kuala Lumpur | fillchain_suspicious | Kualalumpura | review — alt found |
| `george-town` | George Town | George Town | fillchain_suspicious | Georgetown | review — alt found |
| `johor-bahru` | Johor Bahru | Johor Bahru | fillchain_acceptable | (none) | keep (en==ms acceptable as proper noun) |
| `ipoh` | Ipoh | Ipoh | fillchain_suspicious | Ipoha, Ipohas, ipoha | review — alt found |
| `kota-kinabalu` | Kota Kinabalu | Kota Kinabalu | fillchain_suspicious | kotakinabalu | review — alt found |
| `kuching` | Kuching | Kuching | fillchain_suspicious | kuching | review — alt found |
| `shah-alam` | Shah Alam | Shah Alam | fillchain_acceptable | (none) | keep (en==ms acceptable as proper noun) |
| `malacca` | Malacca | Melaka | native_ok | (none) | keep ✓ |
| `sandakan` | Sandakan | Sandakan | fillchain_suspicious | Sandakan Town, sandakan | review — alt found |
| `tawau` | Tawau | Tawau | fillchain_suspicious | tawau | review — alt found |
| `kuala-terengganu` | Kuala Terengganu | Kuala Terengganu | fillchain_suspicious | Bandar Kuala Terengganu | review — alt found |
| `seremban` | Seremban | Seremban | fillchain_suspicious | serembana | review — alt found |
| `bukit-mertajam` | Bukit Mertajam | Bukit Mertajam | fillchain_acceptable | (none) | keep (en==ms acceptable as proper noun) |
| `petaling-jaya` | Petaling Jaya | Petaling Jaya | fillchain_acceptable | (none) | keep (en==ms acceptable as proper noun) |
| `kuantan` | Kuantan | Kuantan | fillchain_suspicious | Kuala Kuantan, kuantan | review — alt found |
| `kangar` | Kangar | Kangar | fillchain_suspicious | kangara, kangaru | review — alt found |
| `alor-setar` | Alor Setar | Alor Setar | fillchain_acceptable | (none) | keep (en==ms acceptable as proper noun) |
| `pasir-gudang` | Pasir Gudang | Pasir Gudang | fillchain_acceptable | (none) | keep (en==ms acceptable as proper noun) |
| `labuan` | Labuan | Labuan | fillchain_acceptable | (none) | keep (en==ms acceptable as proper noun) |
| `kota-bharu` | Kota Bharu | Kota Bharu | fillchain_acceptable | (none) | keep (en==ms acceptable as proper noun) |
| `miri` | Miri | Miri | fillchain_suspicious | Bandar Miri, miri | review — alt found |

### Specific Malaysian cities the user asked about

| Requested slug | Exists in curated? | names.ms | Notes |
|---|---|---|---|
| `kuala-lumpur` | ✅ | Kuala Lumpur | fillchain_pending |
| `george-town` | ✅ | George Town | fillchain_pending |
| `ipoh` | ✅ | Ipoh | fillchain_pending |
| `johor-bahru` | ✅ | Johor Bahru | fillchain_pending |
| `shah-alam` | ✅ | Shah Alam | fillchain_pending |
| `petaling-jaya` | ✅ | Petaling Jaya | fillchain_pending |
| `kota-kinabalu` | ✅ | Kota Kinabalu | fillchain_pending |
| `kuching` | ✅ | Kuching | fillchain_pending |
| `melaka` | ❌ NOT IN CURATED | — | not yet added to curated |
| `malacca` | ✅ | Melaka | native_ok |
| `alor-setar` | ✅ | Alor Setar | fillchain_pending |
| `kuala-terengganu` | ✅ | Kuala Terengganu | fillchain_pending |
| `kota-bharu` | ✅ | Kota Bharu | fillchain_pending |
| `seremban` | ✅ | Seremban | fillchain_pending |
| `kuantan` | ✅ | Kuantan | fillchain_pending |
| `miri` | ✅ | Miri | fillchain_pending |
| `sandakan` | ✅ | Sandakan | fillchain_pending |
| `tawau` | ✅ | Tawau | fillchain_pending |
| `sibu` | ❌ NOT IN CURATED | — | not yet added to curated |
| `bintulu` | ❌ NOT IN CURATED | — | not yet added to curated |
| `putrajaya` | ❌ NOT IN CURATED | — | not yet added to curated |

---

## 5. Indonesia (ID) deep-dive — every city

_The 34 Kota X fixes from SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 are now `native_ok`. Listing all 41 ID entries for completeness._

| Slug | names.en | names.id (current) | Status | GeoNames alt candidates | Recommendation |
|---|---|---|---|---|---|
| `jakarta` | Jakarta | Jakarta | fillchain_acceptable | (none) | KEEP — special region (Daerah Khusus/Istimewa) |
| `surabaya` | Surabaya | Kota Surabaya | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `bandung` | Bandung | Kota Bandung | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `medan` | Medan | Kota Medan | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `makassar` | Makassar | Kota Makassar | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `yogyakarta` | Yogyakarta | Yogyakarta | fillchain_suspicious | Kota Yogyakarta | KEEP — special region (Daerah Khusus/Istimewa) |
| `semarang` | Semarang | Kota Semarang | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `palembang` | Palembang | Kota Palembang | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `banda-aceh` | Banda Aceh | Kota Banda Aceh | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `tegal` | Tegal | Kota Tegal | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `tarakan` | Tarakan | Kota Tarakan | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `tanjung-pinang` | Tanjung Pinang | Kota Tanjung Pinang | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `surakarta` | Surakarta | Kota Surakarta | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `samarinda` | Samarinda | Kota Samarinda | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `padang` | Padang | Kota Padang | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `mataram` | Mataram | Kota Mataram | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `manokwari` | Manokwari | Manokwari | fillchain_acceptable | (none) | keep (no Kota form in geonames) |
| `manado` | Manado | Kota Manado | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `mamuju` | Mamuju | Mamuju | fillchain_acceptable | (none) | keep (no Kota form in geonames) |
| `malang` | Malang | Kota Malang | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `kediri` | Kediri | Kota Kediri | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `jepara` | Jepara | Jepara | fillchain_acceptable | (none) | keep (no Kota form in geonames) |
| `jambi-city` | Jambi City | Jambi City | fillchain_acceptable | (none) | keep (no Kota form in geonames) |
| `cirebon` | Cirebon | Kota Cirebon | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `bogor` | Bogor | Kota Bogor | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `bitung` | Bitung | Kota Bitung | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `bengkulu` | Bengkulu | Kota Bengkulu | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `bekasi` | Bekasi | Kota Bekasi | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `ambon` | Ambon | Kota Ambon | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `merauke` | Merauke | Merauke | fillchain_acceptable | (none) | keep (no Kota form in geonames) |
| `batam` | Batam | Kota Batam | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `bandar-lampung` | Bandar Lampung | Kota Bandar Lampung | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `tangerang` | Tangerang | Kota Tangerang | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `sukabumi` | Sukabumi | Kota Sukabumi | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `pontianak` | Pontianak | Kota Pontianak | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `pekanbaru` | Pekanbaru | Kota Pekanbaru | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `kendari` | Kendari | Kota Kendari | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `denpasar` | Denpasar | Kota Denpasar | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `balikpapan` | Balikpapan | Kota Balikpapan | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `kupang` | Kupang | Kota Kupang | native_ok | (none) | keep ✓ (POLICY-1 applied) |
| `jayapura` | Jayapura | Kota Jayapura | native_ok | (none) | keep ✓ (POLICY-1 applied) |

---

## 6. Turkey (TR) deep-dive — every city

| Slug | names.en | names.tr (current) | Status | Recommendation |
|---|---|---|---|---|
| `istanbul` | Istanbul | İstanbul | native_ok | keep ✓ |
| `ankara` | Ankara | Ankara | fillchain_acceptable | keep (en==tr acceptable) |
| `izmir` | Izmir | İzmir | native_ok | keep ✓ |
| `bursa` | Bursa | Bursa | fillchain_acceptable | keep (en==tr acceptable) |
| `antalya` | Antalya | Antalya | fillchain_acceptable | keep (en==tr acceptable) |
| `konya` | Konya | Konya | fillchain_acceptable | keep (en==tr acceptable) |
| `adana` | Adana | Adana | fillchain_acceptable | keep (en==tr acceptable) |
| `gaziantep` | Gaziantep | Gaziantep | fillchain_acceptable | keep (en==tr acceptable) |
| `kayseri` | Kayseri | Kayseri | fillchain_acceptable | keep (en==tr acceptable) |
| `mersin` | Mersin | Mersin | fillchain_acceptable | keep (en==tr acceptable) |
| `diyarbakir` | Diyarbakir | Diyarbakır | native_ok | keep ✓ |
| `sanliurfa` | Sanliurfa | Şanlıurfa | native_ok | keep ✓ |
| `trabzon` | Trabzon | Trabzon | fillchain_acceptable | keep (en==tr acceptable) |
| `erzurum` | Erzurum | Erzurum | fillchain_acceptable | keep (en==tr acceptable) |

---

## 7. Germany (DE) deep-dive — every city

| Slug | names.en | names.de (current) | Status | Recommendation |
|---|---|---|---|---|
| `berlin` | Berlin | Berlin | fillchain_suspicious | review — diacritic form available |
| `munich` | Munich | München | native_ok | keep ✓ |
| `cologne` | Cologne | Köln | native_ok | keep ✓ |
| `hamburg` | Hamburg | Hamburg | fillchain_suspicious | review — diacritic form available |
| `frankfurt` | Frankfurt | Frankfurt am Main | native_ok | keep ✓ |
| `stuttgart` | Stuttgart | Stuttgart | fillchain_acceptable | keep (proper noun, en==de) |
| `dusseldorf` | Düsseldorf | Düsseldorf | fillchain_acceptable | keep (proper noun, en==de) |
| `nuremberg` | Nuremberg | Nürnberg | native_ok | keep ✓ |
| `bonn` | Bonn | Bonn | fillchain_acceptable | keep (proper noun, en==de) |
| `wuerzburg` | Würzburg | Würzburg | fillchain_acceptable | keep (proper noun, en==de) |
| `wuppertal` | Wuppertal | Wuppertal | fillchain_acceptable | keep (proper noun, en==de) |
| `wolfsburg` | Wolfsburg | Wolfsburg | fillchain_acceptable | keep (proper noun, en==de) |
| `ulm` | Ulm | Ulm | fillchain_acceptable | keep (proper noun, en==de) |
| `trier` | Trier | Trier | fillchain_acceptable | keep (proper noun, en==de) |
| `solingen` | Solingen | Solingen | fillchain_acceptable | keep (proper noun, en==de) |
| `schwerin` | Schwerin | Schwerin | fillchain_acceptable | keep (proper noun, en==de) |
| `salzgitter` | Salzgitter | Salzgitter | fillchain_acceptable | keep (proper noun, en==de) |
| `reutlingen` | Reutlingen | Reutlingen | fillchain_acceptable | keep (proper noun, en==de) |
| `remscheid` | Remscheid | Remscheid | fillchain_acceptable | keep (proper noun, en==de) |
| `regensburg` | Regensburg | Regensburg | fillchain_acceptable | keep (proper noun, en==de) |
| `pforzheim` | Pforzheim | Pforzheim | fillchain_acceptable | keep (proper noun, en==de) |
| `paderborn` | Paderborn | Paderborn | fillchain_acceptable | keep (proper noun, en==de) |
| `osnabrueck` | Osnabrück | Osnabrück | fillchain_acceptable | keep (proper noun, en==de) |
| `oldenburg` | Oldenburg | Oldenburg | fillchain_acceptable | keep (proper noun, en==de) |
| `neuss` | Neuss | Neuss | fillchain_acceptable | keep (proper noun, en==de) |
| `moenchengladbach` | Mönchengladbach | Mönchengladbach | fillchain_acceptable | keep (proper noun, en==de) |
| `moers` | Moers | Moers | fillchain_acceptable | keep (proper noun, en==de) |
| `mannheim` | Mannheim | Mannheim | fillchain_acceptable | keep (proper noun, en==de) |
| `mainz` | Mainz | Mainz | fillchain_acceptable | keep (proper noun, en==de) |
| `ludwigshafen-am-rhein` | Ludwigshafen am Rhein | Ludwigshafen am Rhein | fillchain_acceptable | keep (proper noun, en==de) |
| `luebeck` | Lübeck | Lübeck | fillchain_acceptable | keep (proper noun, en==de) |
| `krefeld` | Krefeld | Krefeld | fillchain_acceptable | keep (proper noun, en==de) |
| `kiel` | Kiel | Kiel | fillchain_acceptable | keep (proper noun, en==de) |
| `kassel` | Kassel | Kassel | fillchain_acceptable | keep (proper noun, en==de) |
| `karlsruhe` | Karlsruhe | Karlsruhe | fillchain_acceptable | keep (proper noun, en==de) |
| `hildesheim` | Hildesheim | Hildesheim | fillchain_acceptable | keep (proper noun, en==de) |
| `herne` | Herne | Herne | fillchain_suspicious | review — diacritic form available |
| `heilbronn` | Heilbronn | Heilbronn | fillchain_acceptable | keep (proper noun, en==de) |
| `heidelberg` | Heidelberg | Heidelberg | fillchain_acceptable | keep (proper noun, en==de) |
| `hannover` | Hannover | Hannover | fillchain_suspicious | review — diacritic form available |
| `hamm` | Hamm | Hamm | fillchain_acceptable | keep (proper noun, en==de) |
| `halle-saale` | Halle (Saale) | Halle (Saale) | fillchain_acceptable | keep (proper noun, en==de) |
| `goettingen` | Göttingen | Göttingen | fillchain_acceptable | keep (proper noun, en==de) |
| `gelsenkirchen` | Gelsenkirchen | Gelsenkirchen | fillchain_acceptable | keep (proper noun, en==de) |
| `freiburg` | Freiburg | Freiburg | fillchain_acceptable | keep (proper noun, en==de) |
| `essen` | Essen | Essen | fillchain_suspicious | review — diacritic form available |
| `duisburg` | Duisburg | Duisburg | fillchain_acceptable | keep (proper noun, en==de) |
| `dortmund` | Dortmund | Dortmund | fillchain_acceptable | keep (proper noun, en==de) |
| `darmstadt` | Darmstadt | Darmstadt | fillchain_acceptable | keep (proper noun, en==de) |
| `chemnitz` | Chemnitz | Chemnitz | fillchain_acceptable | keep (proper noun, en==de) |
| `bremerhaven` | Bremerhaven | Bremerhaven | fillchain_acceptable | keep (proper noun, en==de) |
| `bremen` | Bremen | Bremen | fillchain_suspicious | review — diacritic form available |
| `bochum` | Bochum | Bochum | fillchain_acceptable | keep (proper noun, en==de) |
| `bielefeld` | Bielefeld | Bielefeld | fillchain_acceptable | keep (proper noun, en==de) |
| `augsburg` | Augsburg | Augsburg | fillchain_acceptable | keep (proper noun, en==de) |
| `aachen` | Aachen | Aachen | fillchain_acceptable | keep (proper noun, en==de) |

---

## 8. France (FR) deep-dive — every city

| Slug | names.en | names.fr (current) | Status | Recommendation |
|---|---|---|---|---|
| `paris` | Paris | Paris | fillchain_suspicious | review |
| `marseille` | Marseille | Marseille | fillchain_acceptable | keep (en==fr acceptable) |
| `lyon` | Lyon | Lyon | fillchain_acceptable | keep (en==fr acceptable) |
| `toulouse` | Toulouse | Toulouse | fillchain_acceptable | keep (en==fr acceptable) |
| `nice-fr` | Nice | Nice | fillchain_acceptable | keep (en==fr acceptable) |
| `bordeaux` | Bordeaux | Bordeaux | fillchain_acceptable | keep (en==fr acceptable) |
| `villeurbanne` | Villeurbanne | Villeurbanne | fillchain_acceptable | keep (en==fr acceptable) |
| `tours` | Tours | Tours | fillchain_acceptable | keep (en==fr acceptable) |
| `toulon` | Toulon | Toulon | fillchain_acceptable | keep (en==fr acceptable) |
| `saint-etienne` | Saint-Étienne | Saint-Étienne | fillchain_acceptable | keep (en==fr acceptable) |
| `rouen` | Rouen | Rouen | fillchain_acceptable | keep (en==fr acceptable) |
| `rennes` | Rennes | Rennes | fillchain_acceptable | keep (en==fr acceptable) |
| `perpignan` | Perpignan | Perpignan | fillchain_acceptable | keep (en==fr acceptable) |
| `orleans` | Orléans | Orléans | fillchain_acceptable | keep (en==fr acceptable) |
| `nantes` | Nantes | Nantes | fillchain_acceptable | keep (en==fr acceptable) |
| `nancy` | Nancy | Nancy | fillchain_acceptable | keep (en==fr acceptable) |
| `metz` | Metz | Metz | fillchain_suspicious | review |
| `le-mans` | Le Mans | Le Mans | fillchain_acceptable | keep (en==fr acceptable) |
| `le-havre` | Le Havre | Le Havre | fillchain_suspicious | review |
| `grenoble` | Grenoble | Grenoble | fillchain_suspicious | review |
| `dijon` | Dijon | Dijon | fillchain_suspicious | review |
| `clermont-ferrand` | Clermont-Ferrand | Clermont-Ferrand | fillchain_acceptable | keep (en==fr acceptable) |
| `caen` | Caen | Caen | fillchain_suspicious | review |
| `besancon` | Besançon | Besançon | fillchain_acceptable | keep (en==fr acceptable) |
| `aix-en-provence` | Aix-en-Provence | Aix-en-Provence | fillchain_acceptable | keep (en==fr acceptable) |

---

## 9. Spain + Spanish-speaking LATAM (ES) deep-dive

_Showing all 126 (entry, lang=es) pairs across 20 Spanish-speaking countries._

| Country | Slug | names.en | names.es (current) | Status | Recommendation |
|---|---|---|---|---|---|
| ES | `madrid` | Madrid | Madrid | fillchain_suspicious | review — diacritic form available |
| ES | `barcelona` | Barcelona | Barcelona | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `cordoba` | Córdoba | Córdoba | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `seville` | Seville | Sevilla | native_ok | keep ✓ |
| ES | `granada-es` | Granada | Granada | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `malaga` | Málaga | Málaga | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `zaragoza` | Zaragoza | Zaragoza | fillchain_suspicious | review — diacritic form available |
| ES | `valencia` | Valencia | Valencia | fillchain_suspicious | review — diacritic form available |
| ES | `palma-de-mallorca` | Palma de Mallorca | Palma de Mallorca | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `bilbao` | Bilbao | Bilbao | fillchain_suspicious | review — diacritic form available |
| MX | `mexico-city` | Mexico City | Ciudad de México | native_ok | keep ✓ |
| AR | `buenos-aires` | Buenos Aires | Buenos Aires | fillchain_acceptable | keep (proper noun, en==es) |
| CL | `santiago-cl` | Santiago | Santiago | fillchain_acceptable | keep (proper noun, en==es) |
| CO | `bogota` | Bogota | Bogotá | native_ok | keep ✓ |
| PE | `lima` | Lima | Lima | fillchain_acceptable | keep (proper noun, en==es) |
| VE | `caracas` | Caracas | Caracas | fillchain_acceptable | keep (proper noun, en==es) |
| UY | `montevideo` | Montevideo | Montevideo | fillchain_acceptable | keep (proper noun, en==es) |
| EC | `quito` | Quito | Quito | fillchain_acceptable | keep (proper noun, en==es) |
| BO | `la-paz` | La Paz | La Paz | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `guadalajara` | Guadalajara | Guadalajara | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `monterrey` | Monterrey | Monterrey | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `telde` | Telde | Telde | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `santa-cruz-de-tenerife` | Santa Cruz de Tenerife | Santa Cruz de Tenerife | fillchain_suspicious | review — diacritic form available |
| ES | `orihuela` | Orihuela | Orihuela | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `murcia` | Murcia | Murcia | fillchain_suspicious | review — diacritic form available |
| ES | `merida` | Mérida | Mérida | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `melilla` | Melilla | Melilla | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `marbella` | Marbella | Marbella | fillchain_suspicious | review — diacritic form available |
| ES | `jaen` | Jaén | Jaén | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `elche` | Elche | Elche | fillchain_suspicious | review — diacritic form available |
| ES | `cartagena` | Cartagena | Cartagena | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `cadiz` | Cadiz | Cádiz | native_ok | keep ✓ |
| ES | `badajoz` | Badajoz | Badajoz | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `algeciras` | Algeciras | Algeciras | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `albacete` | Albacete | Albacete | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `valladolid` | Valladolid | Valladolid | fillchain_suspicious | review — diacritic form available |
| ES | `santiago-de-compostela` | Santiago de Compostela | Santiago de Compostela | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `santander` | Santander | Santander | fillchain_suspicious | review — diacritic form available |
| ES | `san-sebastian` | Donostia / San Sebastián | San Sebastián | native_ok | keep ✓ |
| ES | `salamanca` | Salamanca | Salamanca | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `parla` | Parla | Parla | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `pamplona` | Pamplona | Pamplona | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `oviedo` | Oviedo | Oviedo | fillchain_suspicious | review — diacritic form available |
| ES | `mostoles` | Móstoles | Móstoles | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `logrono` | Logroño | Logroño | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `leon` | León | León | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `leganes` | Leganés | Leganés | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `gijon` | Gijón | Gijón | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `getafe` | Getafe | Getafe | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `fuenlabrada` | Fuenlabrada | Fuenlabrada | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `ciudad-lineal` | Ciudad Lineal | Ciudad Lineal | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `burgos` | Burgos | Burgos | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `badalona` | Badalona | Badalona | fillchain_suspicious | review — diacritic form available |
| ES | `alcorcon` | Alcorcón | Alcorcón | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `alcobendas` | Alcobendas | Alcobendas | fillchain_acceptable | keep (proper noun, en==es) |
| ES | `alcala-de-henares` | Alcalá de Henares | Alcalá de Henares | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `puebla` | Puebla | Puebla | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `playa-del-carmen` | Playa del Carmen | Playa del Carmen | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `oaxaca` | Oaxaca | Oaxaca | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `nuevo-laredo` | Nuevo Laredo | Nuevo Laredo | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `naucalpan-de-juarez` | Naucalpan de Juárez | Naucalpan de Juárez | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `cuernavaca` | Cuernavaca | Cuernavaca | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `ciudad-victoria` | Ciudad Victoria | Ciudad Victoria | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `chilpancingo` | Chilpancingo | Chilpancingo | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `chetumal` | Chetumal | Chetumal | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `cancun` | Cancún | Cancún | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `tlaxcala` | Tlaxcala | Tlaxcala | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `tijuana` | Tijuana | Tijuana | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `tepic` | Tepic | Tepic | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `san-miguel-de-allende` | San Miguel de Allende | San Miguel de Allende | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `cabo-san-lucas` | Cabo San Lucas | Cabo San Lucas | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `santiago-de-queretaro` | Santiago de Querétaro | Santiago de Querétaro | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `puerto-vallarta` | Puerto Vallarta | Puerto Vallarta | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `navojoa` | Navojoa | Navojoa | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `mazatlan` | Mazatlán | Mazatlán | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `irapuato` | Irapuato | Irapuato | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `hermosillo` | Hermosillo | Hermosillo | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `culiacan` | Culiacán | Culiacán | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `ciudad-juarez` | Ciudad Juárez | Ciudad Juárez | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `ciudad-guzman` | Ciudad Guzmán | Ciudad Guzmán | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `merida-mx` | Mérida | Mérida | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `ecatepec` | Ecatepec | Ecatepec | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `cordoba-mx` | Córdoba | Córdoba | fillchain_acceptable | keep (proper noun, en==es) |
| MX | `zapopan` | Zapopan | Zapopan | fillchain_acceptable | keep (proper noun, en==es) |
| AR | `tandil` | Tandil | Tandil | fillchain_acceptable | keep (proper noun, en==es) |
| AR | `quilmes` | Quilmes | Quilmes | fillchain_acceptable | keep (proper noun, en==es) |
| AR | `merlo` | Merlo | Merlo | fillchain_acceptable | keep (proper noun, en==es) |
| AR | `ezeiza` | Ezeiza | Ezeiza | fillchain_acceptable | keep (proper noun, en==es) |
| AR | `castelar` | Castelar | Castelar | fillchain_acceptable | keep (proper noun, en==es) |
| AR | `ushuaia` | Ushuaia | Ushuaia | fillchain_acceptable | keep (proper noun, en==es) |
| AR | `salta` | Salta | Salta | fillchain_acceptable | keep (proper noun, en==es) |
| AR | `rawson` | Rawson | Rawson | fillchain_acceptable | keep (proper noun, en==es) |
| AR | `la-rioja` | La Rioja | La Rioja | fillchain_acceptable | keep (proper noun, en==es) |
| CO | `yopal` | Yopal | Yopal | fillchain_acceptable | keep (proper noun, en==es) |
| CO | `tulua` | Tuluá | Tuluá | fillchain_acceptable | keep (proper noun, en==es) |
| CO | `inirida` | Inírida | Inírida | fillchain_acceptable | keep (proper noun, en==es) |
| CO | `popayan` | Popayán | Popayán | fillchain_acceptable | keep (proper noun, en==es) |
| CO | `neiva` | Neiva | Neiva | fillchain_acceptable | keep (proper noun, en==es) |
| CO | `mocoa` | Mocoa | Mocoa | fillchain_acceptable | keep (proper noun, en==es) |
| CO | `mitu` | Mitú | Mitú | fillchain_acceptable | keep (proper noun, en==es) |
| CO | `buenaventura` | Buenaventura | Buenaventura | fillchain_acceptable | keep (proper noun, en==es) |
| CL | `talcahuano` | Talcahuano | Talcahuano | fillchain_acceptable | keep (proper noun, en==es) |
| CL | `talca` | Talca | Talca | fillchain_acceptable | keep (proper noun, en==es) |
| CL | `curico` | Curicó | Curicó | fillchain_acceptable | keep (proper noun, en==es) |
| CL | `copiapo` | Copiapó | Copiapó | fillchain_acceptable | keep (proper noun, en==es) |
| CL | `alto-hospicio` | Alto Hospicio | Alto Hospicio | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `tumbes` | Tumbes | Tumbes | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `piura` | Piura | Piura | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `moyobamba` | Moyobamba | Moyobamba | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `iquitos` | Iquitos | Iquitos | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `huaraz` | Huaraz | Huaraz | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `chiclayo` | Chiclayo | Chiclayo | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `chachapoyas` | Chachapoyas | Chachapoyas | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `puno` | Puno | Puno | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `moquegua` | Moquegua | Moquegua | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `ica` | Ica | Ica | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `cusco` | Cusco | Cusco | fillchain_acceptable | keep (proper noun, en==es) |
| PE | `arequipa` | Arequipa | Arequipa | fillchain_acceptable | keep (proper noun, en==es) |
| VE | `turmero` | Turmero | Turmero | fillchain_acceptable | keep (proper noun, en==es) |
| VE | `puerto-la-cruz` | Puerto La Cruz | Puerto La Cruz | fillchain_acceptable | keep (proper noun, en==es) |
| VE | `puerto-ayacucho` | Puerto Ayacucho | Puerto Ayacucho | fillchain_acceptable | keep (proper noun, en==es) |
| VE | `los-teques` | Los Teques | Los Teques | fillchain_acceptable | keep (proper noun, en==es) |
| VE | `cabimas` | Cabimas | Cabimas | fillchain_acceptable | keep (proper noun, en==es) |
| VE | `barquisimeto` | Barquisimeto | Barquisimeto | fillchain_acceptable | keep (proper noun, en==es) |
| VE | `barinas` | Barinas | Barinas | fillchain_acceptable | keep (proper noun, en==es) |
| VE | `maturin` | Maturín | Maturín | fillchain_acceptable | keep (proper noun, en==es) |

---

## 10. Pakistan / Bangladesh / India — Urdu + Bengali confirmation

| Country | Lang | Total entries | native_ok | fillchain | missing | polluted | Status |
|---|---|---|---|---|---|---|---|
| PK | ur | 148 | 148 | 0 | 0 | 0 | ✅ 100% native |
| BD | bn | 38 | 38 | 0 | 0 | 0 | ✅ 100% native |
| IN | ur | 109 | 109 | 0 | 0 | 0 | ✅ 100% native |
| IN | bn | 109 | 109 | 0 | 0 | 0 | ✅ 100% native |

_India Hindi check: legacy `names.hi` rows from HI-IN-1 wave preserved as-is. Hindi is NOT in supported UI langs — NO extension to new entries, NO routing._

---

## 11. Proposed fixes (beyond POLICY-1's 36 already applied)

**36 new proposed fixes** discovered by the deep scan.

| # | Country | Slug | Lang | Current | Proposed | Source | Hint | Confidence |
|---|---|---|---|---|---|---|---|---|
| 1 | FR | `paris` | fr | `Paris` | **`París`** | geonames:alternatenames | fr diacritic form | needs-review |
| 2 | ES | `madrid` | es | `Madrid` | **`Madríd`** | geonames:alternatenames | es diacritic form | needs-review |
| 3 | ES | `zaragoza` | es | `Zaragoza` | **`Żaragoża`** | geonames:alternatenames | es diacritic form | needs-review |
| 4 | ES | `valencia` | es | `Valencia` | **`València`** | geonames:alternatenames | es diacritic form | needs-review |
| 5 | DE | `berlin` | de | `Berlin` | **`Berlín`** | geonames:alternatenames | de diacritic form | needs-review |
| 6 | DE | `hamburg` | de | `Hamburg` | **`Hambûrg`** | geonames:alternatenames | de diacritic form | needs-review |
| 7 | ES | `bilbao` | es | `Bilbao` | **`bilbao`** | geonames:alternatenames | es diacritic form | needs-review |
| 8 | MY | `kuala-lumpur` | ms | `Kuala Lumpur` | **`Kualalumpura`** | geonames:alternatenames | ms spelling variant | needs-review |
| 9 | MY | `george-town` | ms | `George Town` | **`Georgetown`** | geonames:alternatenames | ms spelling variant | needs-review |
| 10 | MY | `ipoh` | ms | `Ipoh` | **`Ipoha`** | geonames:alternatenames | ms spelling variant | needs-review |
| 11 | MY | `kota-kinabalu` | ms | `Kota Kinabalu` | **`kotakinabalu`** | geonames:alternatenames | ms spelling variant | needs-review |
| 12 | MY | `kuching` | ms | `Kuching` | **`kuching`** | geonames:alternatenames | ms spelling variant | needs-review |
| 13 | FR | `metz` | fr | `Metz` | **`Mètz`** | geonames:alternatenames | fr diacritic form | needs-review |
| 14 | FR | `le-havre` | fr | `Le Havre` | **`Lé Hâvre`** | geonames:alternatenames | fr diacritic form | needs-review |
| 15 | FR | `grenoble` | fr | `Grenoble` | **`Grenòble`** | geonames:alternatenames | fr diacritic form | needs-review |
| 16 | FR | `dijon` | fr | `Dijon` | **`Dij·on`** | geonames:alternatenames | fr diacritic form | needs-review |
| 17 | FR | `caen` | fr | `Caen` | **`Caën`** | geonames:alternatenames | fr diacritic form | needs-review |
| 18 | ES | `santa-cruz-de-tenerife` | es | `Santa Cruz de Tenerife` | **`Santa Cruz de Ténérife`** | geonames:alternatenames | es diacritic form | needs-review |
| 19 | ES | `murcia` | es | `Murcia` | **`Múrcia`** | geonames:alternatenames | es diacritic form | needs-review |
| 20 | ES | `marbella` | es | `Marbella` | **`marbella`** | geonames:alternatenames | es diacritic form | needs-review |
| 21 | ES | `elche` | es | `Elche` | **`elche`** | geonames:alternatenames | es diacritic form | needs-review |
| 22 | ES | `valladolid` | es | `Valladolid` | **`Valladolíd`** | geonames:alternatenames | es diacritic form | needs-review |
| 23 | ES | `santander` | es | `Santander` | **`Santandèr`** | geonames:alternatenames | es diacritic form | needs-review |
| 24 | ES | `oviedo` | es | `Oviedo` | **`oviedo`** | geonames:alternatenames | es diacritic form | needs-review |
| 25 | ES | `badalona` | es | `Badalona` | **`badalona`** | geonames:alternatenames | es diacritic form | needs-review |
| 26 | DE | `herne` | de | `Herne` | **`Hernė`** | geonames:alternatenames | de diacritic form | needs-review |
| 27 | DE | `hannover` | de | `Hannover` | **`Hannóver`** | geonames:alternatenames | de diacritic form | needs-review |
| 28 | DE | `essen` | de | `Essen` | **`essen`** | geonames:alternatenames | de diacritic form | needs-review |
| 29 | DE | `bremen` | de | `Bremen` | **`Brémén`** | geonames:alternatenames | de diacritic form | needs-review |
| 30 | MY | `sandakan` | ms | `Sandakan` | **`Sandakan Town`** | geonames:alternatenames | ms spelling variant | needs-review |
| 31 | MY | `tawau` | ms | `Tawau` | **`tawau`** | geonames:alternatenames | ms spelling variant | needs-review |
| 32 | MY | `kuala-terengganu` | ms | `Kuala Terengganu` | **`Bandar Kuala Terengganu`** | geonames:alternatenames | Bandar/Pekan X | needs-review |
| 33 | MY | `seremban` | ms | `Seremban` | **`serembana`** | geonames:alternatenames | ms spelling variant | needs-review |
| 34 | MY | `kuantan` | ms | `Kuantan` | **`Kuala Kuantan`** | geonames:alternatenames | ms spelling variant | needs-review |
| 35 | MY | `kangar` | ms | `Kangar` | **`kangara`** | geonames:alternatenames | ms spelling variant | needs-review |
| 36 | MY | `miri` | ms | `Miri` | **`Bandar Miri`** | geonames:alternatenames | Bandar/Pekan X | needs-review |

---

## 12. Confidence breakdown of proposed fixes

| Confidence | Count |
|---|---|
| very-safe | 0 |
| safe | 0 |
| needs-review | 36 |
| do-not-apply | 0 |

---

## 13. Final recommendation

**Recommendation: Keep the 36 already-applied fixes; do NOT expand scope.**

### Rationale

* All 36 new candidates are `needs-review`. They were heuristically extracted from GeoNames `alternatenames` which is a flat, untagged list. The Latin alt-names that *look* like a diacritic form of the English name (e.g., `Madrid → Madríd`, `Paris → París`, `Berlin → Berlín`) are in practice **NOT** the target-language forms — Spanish uses just "Madrid", French uses just "Paris", German uses just "Berlin". These false positives come from **other** language variants (Catalan, Polish, Sanskrit, Czech, etc.) that share Latin script + place root.
* Reliably distinguishing "Spanish accent form" from "Catalan accent form" requires GeoNames `alternateNamesV2.txt` (language-tagged), which is NOT currently downloaded into `db/places/candidates/`.
* Per policy §5, a correction needs a documented stable source AND a verified different form — heuristic alt-name picks do not meet that bar.
* Pakistan / Bangladesh / India are already 100% native for ur/bn (148/148, 38/38, 109/109 respectively).
* All remaining `fillchain` entries across MY/TR/DE/FR/ES/LATAM are **legitimate proper nouns** — `Berlin` is `Berlin` in German, `Madrid` is `Madrid` in Spanish, `Kuala Lumpur` is `Kuala Lumpur` in Malay. The runtime helper correctly serves these via the en-fallback chain (with `sourceLang=en`, `isFallback=true`, `hasNativeName=false` metadata).

### If higher-quality data is later available

A follow-up `SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2` could be opened after downloading the GeoNames `alternateNamesV2.txt` source (language-tagged alternatenames). That would let us identify TRUE `name:de`, `name:es`, `name:fr`, `name:tr`, `name:ms` tags per place. Without that data, no further confident fixes are possible.

### Recommended batches

* **A) Keep just the existing 36** — current commit `32be018` already covers ID + ES. Most defensible scope; matches policy doc §5 source-priority. **← RECOMMENDED**
* **B) +Malaysia (`names.ms`)** — 12 candidates BUT all are heuristic spelling variants, not authoritative Malay forms. Need Wikipedia ms verification per city — defer.
* **C) +Germany/France/Spain diacritic fixes** — ALL flagged false positives (Madrid is Madrid in Spanish; Berlin is Berlin in German; Paris is Paris in French). Do NOT apply.
* **D) Audit-only (this report)** — defer further changes; revisit only after GeoNames `alternateNamesV2.txt` is downloaded for language-tagged data.

---

## 14. Constraints honoured by this audit

| Constraint | Status |
|---|---|
| `db/places/curated-places.json` NOT modified | ✅ (read-only script) |
| `db/places/candidates/*` NOT modified | ✅ |
| `server.js` / `js/app.js` / `index.html` NOT modified | ✅ |
| NO city add/delete | ✅ |
| NO slug changes | ✅ |
| NO canonical changes | ✅ |
| NO apply executed | ✅ |
| NO runtime translation | ✅ |
| NO fillchain | ✅ |
| NO Google Translate / OpenAI / browser MT | ✅ |
| NO unsupported langs proposed | ✅ |

*— End of audit —*
