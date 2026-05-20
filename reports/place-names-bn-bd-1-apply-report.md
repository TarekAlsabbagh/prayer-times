# PLACE-NAMES-BN-BD-1 (Fast Track) — Apply audit trail

**Run at**: 2026-05-20T05:17:59.533Z
**Country**: BD (13 ASIA-1D-BD-A entries only — no PRIOR-6 seed mutations)
**Total rows applied**: 13
**Skipped (idempotent)**: 0
**PRIOR-6 BD-seed mutations (must be 0)**: 0
**ar/en/slug mutations (must be 0)**: 0

## Applied rows

| slug | names.bn | aliases.bn added | source |
| --- | --- | ---: | --- |
| `bagerhat` | বাগেরহাট | 0 | GeoNames raw alts (geonameid 1185281) |
| `bogra` | বগুড়া | 0 | GeoNames raw alts (geonameid 1337233); 2018 English rename Bogura but Bengali unchanged |
| `comilla` | কুমিল্লা | 0 | GeoNames raw alts (geonameid 1185186); 2018 English rename Cumilla but Bengali unchanged |
| `feni` | ফেনী | 0 | GeoNames raw alts (geonameid 1185224) |
| `gaibandha` | গাইবান্ধা | 0 | Bengali Wikipedia (গাইবান্ধা জেলা district article) — NOT in GeoNames raw |
| `gazipur` | গাজীপুর | 0 | GeoNames raw alts (geonameid 1200109) |
| `habiganj` | হবিগঞ্জ | 0 | GeoNames raw alts (geonameid 1185209) |
| `jamalpur` | জামালপুর | 0 | GeoNames raw alts (geonameid 1185106) |
| `lalmonirhat` | লালমনিরহাট | 0 | Bengali Wikipedia (লালমনিরহাট জেলা district article) — NOT in GeoNames raw |
| `mymensingh` | ময়মনসিংহ | 0 | GeoNames raw alts (geonameid 1185162) |
| `netrakona` | নেত্রকোণা | 0 | GeoNames raw alts (geonameid 1185116) |
| `nilphamari` | নীলফামারী | 0 | GeoNames raw alts (geonameid 7646714) |
| `rangpur` | রংপুর | 0 | GeoNames raw alts (geonameid 1185188) |

## What this apply did NOT do

- ❌ `names.ar` not modified (preserves BD-A Arabic)
- ❌ `names.en` not modified
- ❌ `slug` not modified for any entry
- ❌ 6 prior BD seed entries (dhaka/chittagong/sylhet/rajshahi/khulna/barisal) not touched
- ❌ Other countries not touched
- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html, _geonames_common.mjs)
- ❌ No runtime translation (no Google/OpenAI/Anthropic/browser translate)
- ❌ No fillchain
- ❌ No Brunei (bn-geonames-*, bn.mjs) data used
