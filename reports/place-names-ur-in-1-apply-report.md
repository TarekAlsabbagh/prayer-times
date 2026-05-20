# PLACE-NAMES-UR-IN-1 — Apply audit trail

**Run at**: 2026-05-20T10:09:32.977Z
**Country**: IN (22 BATCH-A entries only — 18 SEED-18 byte-identical)
**Total rows applied (names.ur)**: 22
**Total aliases.ur added**: 17
**Skipped (idempotent — names.ur already match)**: 0
**SEED-18 mutations (must be 0)**: 0
**IN mutations to non-Urdu fields (must be 0)**: 0
**Non-IN entries mutated (must be 0)**: 0
**Other-Indian-lang mutations (must be 0)**: 0
**Post-apply IN Urdu coverage**: 40/40 (100%)
**Total curated entries (unchanged)**: 2528
**Total IN entries (unchanged)**: 40

## Applied rows

| slug | names.ur | aliases.ur added | source |
| --- | --- | ---: | --- |
| `agra` | آگرہ | 0 | KEEP_RAW |
| `amritsar` | امرتسر | 1 | WIKIPEDIA |
| `aurangabad` | اورنگ آباد | 1 | KEEP_RAW |
| `coimbatore` | کوئمبتور | 2 | WIKIPEDIA |
| `dhanbad` | دھنباد | 0 | KEEP_RAW |
| `dombivali` | دومبیولی | 0 | KEEP_RAW |
| `faridabad` | فرید آباد | 0 | FIX_RAW |
| `ghaziabad` | غازی آباد | 1 | FIX_RAW |
| `jamshedpur` | جمشید پور | 1 | PICK_RAW |
| `jodhpur` | جودھپور | 1 | PICK_RAW |
| `madurai` | مدورائی | 1 | PICK_RAW |
| `meerut` | میرٹھ | 1 | KEEP_RAW |
| `nashik` | ناسیک | 0 | KEEP_RAW |
| `pimpri-chinchwad` | پمپری چنچواڑ | 2 | PICK_RAW |
| `prayagraj` | پریاگ راج | 1 | WIKIPEDIA |
| `ranchi` | رانچی | 0 | KEEP_RAW |
| `thane` | تھانے | 1 | KEEP_RAW |
| `tirunelveli` | تیرونلویلی | 0 | KEEP_RAW |
| `vadodara` | وڈودرا | 1 | KEEP_RAW |
| `varanasi` | وارانسی | 2 | KEEP_RAW |
| `vijayawada` | وجے واڑہ | 0 | PICK_RAW |
| `visakhapatnam` | وشاکھاپٹنم | 1 | PICK_RAW |

## Source breakdown

| source | count |
| --- | ---: |
| FIX_RAW | 2 |
| KEEP_RAW | 11 |
| PICK_RAW | 6 |
| WIKIPEDIA | 3 |
| **TOTAL** | **22** |

## What this apply did NOT do

- ❌ SEED-18 entries byte-identical (no names.ur or aliases.ur change)
- ❌ `names.ar` not modified for any IN entry
- ❌ `names.en` not modified for any IN entry
- ❌ `names.hi` not modified for any IN entry
- ❌ `aliases.ar` / `aliases.en` / `aliases.hi` not modified for any IN entry
- ❌ Other Indian-lang names (bn/ta/mr/te/kn/ml/gu/pa/or/as/sa) not added
- ❌ Non-IN entries hash-identical (2488 entries)
- ❌ Coordinates, timezone, admin, priority, source, verified, type not modified
- ❌ No new cities added; no cities removed
- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html, _geonames_common.mjs, validate_candidates.mjs, normalize_places.mjs, apply_curated_candidates.mjs)
- ❌ No runtime translation (no Google/OpenAI/Anthropic/browser translate)
- ❌ No fillchain
- ❌ No Brunei (bn-geonames-*) data used
- ❌ No Bangladesh (bd-geonames-*) data used
- ❌ No Pakistan (pk-geonames-*) data used
