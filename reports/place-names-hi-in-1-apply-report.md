# PLACE-NAMES-HI-IN-1 — Apply audit trail

**Run at**: 2026-05-20T07:43:44.608Z
**Country**: IN (40 entries — 18 SEED + 22 BATCH-A)
**Total rows applied (names.hi)**: 40
**Total aliases.hi added**: 18
**Skipped (idempotent — names.hi already match)**: 0
**IN mutations to non-Hindi fields (must be 0)**: 0
**Non-IN entries mutated (must be 0)**: 0
**IN entries with other-Indian-lang mutations (must be 0)**: 0
**Post-apply IN Hindi coverage**: 40/40 (100%)
**Total curated entries (unchanged)**: 2528
**Total IN entries (unchanged)**: 40

## Applied rows

| slug | names.hi | aliases.hi added | source |
| --- | --- | ---: | --- |
| `agra` | आगरा | 0 | KEEP |
| `ahmedabad` | अहमदाबाद | 0 | WIKIPEDIA |
| `amritsar` | अमृतसर | 0 | KEEP |
| `aurangabad` | औरंगाबाद | 1 | KEEP |
| `bengaluru` | बेंगलुरु | 0 | WIKIPEDIA |
| `bhopal` | भोपाल | 0 | KEEP |
| `chennai` | चेन्नई | 1 | WIKIPEDIA |
| `coimbatore` | कोयंबटूर | 1 | MANUAL |
| `dhanbad` | धनबाद | 0 | KEEP |
| `dombivali` | डोंबिवली | 0 | KEEP |
| `faridabad` | फ़रीदाबाद | 1 | FIX |
| `ghaziabad` | ग़ाज़ियाबाद | 1 | KEEP |
| `hyderabad-in` | हैदराबाद | 0 | WIKIPEDIA |
| `indore` | इंदौर | 0 | WIKIPEDIA |
| `jaipur` | जयपुर | 0 | KEEP |
| `jamshedpur` | जमशेदपुर | 0 | KEEP |
| `jodhpur` | जोधपुर | 0 | KEEP |
| `kanpur` | कानपुर | 0 | WIKIPEDIA |
| `kochi` | कोच्चि | 0 | KEEP |
| `kolkata` | कोलकाता | 1 | MANUAL |
| `lucknow` | लखनऊ | 0 | KEEP |
| `madurai` | मदुरई | 1 | KEEP |
| `meerut` | मेरठ | 1 | MANUAL |
| `mumbai` | मुंबई | 2 | MANUAL |
| `nagpur` | नागपुर | 0 | WIKIPEDIA |
| `nashik` | नाशिक | 0 | KEEP |
| `new-delhi` | नई दिल्ली | 0 | KEEP |
| `patna` | पटना | 0 | KEEP |
| `pimpri-chinchwad` | पिंपरी-चिंचवाड़ | 1 | FIX |
| `prayagraj` | प्रयागराज | 1 | MANUAL |
| `pune` | पुणे | 0 | KEEP |
| `ranchi` | राँची | 0 | KEEP |
| `srinagar` | श्रीनगर | 0 | WIKIPEDIA |
| `surat` | सूरत | 0 | WIKIPEDIA |
| `thane` | ठाणे | 0 | KEEP |
| `tirunelveli` | तिरुनेलवेली | 1 | FIX |
| `vadodara` | वडोदरा | 2 | KEEP |
| `varanasi` | वाराणसी | 2 | MANUAL |
| `vijayawada` | विजयवाड़ा | 0 | KEEP |
| `visakhapatnam` | विशाखपट्टणम् | 1 | KEEP |

## Source breakdown

| source | count |
| --- | ---: |
| FIX | 3 |
| KEEP | 22 |
| MANUAL | 6 |
| WIKIPEDIA | 9 |
| **TOTAL** | **40** |

## What this apply did NOT do

- ❌ `names.ar` not modified (preserves all 40 IN Arabic from ASIA-1D-IN-A + SEED-18)
- ❌ `names.en` not modified
- ❌ `slug` not modified for any entry
- ❌ Other Indian local langs (ur/bn/ta/mr/te/kn/ml/gu/pa/or/as/sa) not added
- ❌ Non-IN entries not touched (byte-identical hash before/after)
- ❌ Coordinates, timezone, admin, priority, source, verified, type not modified
- ❌ aliases.ar / aliases.en not modified
- ❌ No new cities added; no cities removed
- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html, _geonames_common.mjs, validate_candidates.mjs)
- ❌ No runtime translation (no Google/OpenAI/Anthropic/browser translate)
- ❌ No fillchain
- ❌ No Brunei (bn-geonames-*) data used
- ❌ No Bangladesh (bd-geonames-*) data used
