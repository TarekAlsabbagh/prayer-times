# AMERICAS-1A-BLOCKED-MAJOR-CITIES-FIX-1 — Review Report

**Wave**: `AMERICAS-1A` follow-up review
**Generated**: 2026-05-16T15:15:01.608Z
**Cities under review**: 24
**Curated total (before this fix)**: 1,582

## Purpose

Each row below is a major blocked city from AMERICAS-1A whose Arabic name needs manual correction (or whose slug needs explicit collision-resolution). No merge happens yet — this is review-only.

## Per-country tables

### 🇨🇦 Canada (7)

| slug | current ar (blocked) | **proposed ar** | en | pop | fc | tz | block reason | collision | **proposed final slug** |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| `edmonton` | `إدمونتون` | **`إدمونتون`** | Edmonton | 1,010,899 | PPLA | America/Edmonton | collisionInWave (intra-wave) | within-wave (other US/CA/MX entries) | **`edmonton`** |
| `halifax` | `هاليفاكس` | **`هاليفاكس`** | Halifax | 471,559 | PPLA | America/Halifax | collisionInWave (intra-wave) | within-wave (other US/CA/MX entries) | **`halifax`** |
| `quebec` | `مدينة كيبك` | **`مدينة كيبك`** | Québec | 531,902 | PPLA | America/Toronto | collisionInWave (intra-wave) | within-wave (other US/CA/MX entries) | **`quebec`** |
| `winnipeg` | `wny pyګ` | **`وينيبيغ`** | Winnipeg | 749,607 | PPLA | America/Winnipeg | ar-gate mixed_script | within-wave (other US/CA/MX entries) | **`winnipeg`** |
| `regina` | `رجاینا` | **`ريجاينا`** | Regina | 226,404 | PPLA | America/Regina | ar-gate mixed_script | within-wave (other US/CA/MX entries) | **`regina`** |
| `victoria` | `فكتوريا` | **`فيكتوريا`** | Victoria | 289,625 | PPLA | America/Vancouver | collisionInWave (intra-wave) | within-wave (other US/CA/MX entries) | **`victoria`** |
| `cambridge` | `كامبريدج` | **`كامبريدج`** | Cambridge | 129,920 | PPL | America/Toronto | collisionInWave (intra-wave) | within-wave (other US/CA/MX entries) | **`cambridge-ca`** |

### 🇲🇽 Mexico (4)

| slug | current ar (blocked) | **proposed ar** | en | pop | fc | tz | block reason | collision | **proposed final slug** |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| `zapopan` | `زاپوپان، خالیسکو` | **`سابوبان`** | Zapopan | 1,476,491 | PPLA2 | America/Mexico_City | ar-gate mixed_script | none | **`zapopan`** |
| `ecatepec` | `Ecatepec` | **`إيكاتيبيك`** | Ecatepec | 0 | PPL | America/Mexico_City | needs_review: missing_real_ar_name | none | **`ecatepec`** |
| `merida` | `myryڈa` | **`ميريدا`** | Mérida | 1,201,000 | PPLA | America/Merida | ar-gate mixed_script | within-wave (other US/CA/MX entries) | **`merida-mx`** |
| `cordoba` | `کوردوبا، وراکروز` | **`كوردوبا`** | Córdoba | 204,721 | PPL | America/Mexico_City | ar-gate mixed_script | curated:es owns bare slug | **`cordoba-mx`** |

### 🇺🇸 United States (13)

| slug | current ar (blocked) | **proposed ar** | en | pop | fc | tz | block reason | collision | **proposed final slug** |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| `philadelphia` | `flaڈylfya` | **`فيلادلفيا`** | Philadelphia | 1,573,916 | PPLA2 | America/New_York | ar-gate mixed_script | none | **`philadelphia`** |
| `san-antonio` | `سان آنتونیو` | **`سان أنطونيو`** | San Antonio | 1,526,656 | PPLA2 | America/Chicago | ar-gate mixed_script | within-wave (other US/CA/MX entries) | **`san-antonio`** |
| `austin` | `asټn` | **`أوستن`** | Austin | 974,447 | PPLA | America/Chicago | ar-gate mixed_latin | within-wave (other US/CA/MX entries) | **`austin`** |
| `indianapolis` | `anډyana pwlys` | **`إنديانابوليس`** | Indianapolis | 887,642 | PPLA | America/Indiana/Indianapolis | ar-gate mixed_latin | none | **`indianapolis`** |
| `las-vegas` | `las wygas  nywaڈa` | **`لاس فيغاس`** | Las Vegas | 641,903 | PPLA2 | America/Los_Angeles | ar-gate mixed_script | within-wave (other US/CA/MX entries) | **`las-vegas`** |
| `albuquerque` | `آلبوکرک، نیو میکسیکو` | **`ألباكركي`** | Albuquerque | 564,559 | PPLA2 | America/Denver | ar-gate mixed_script | none | **`albuquerque`** |
| `milwaukee` | `ملواکی` | **`ميلواكي`** | Milwaukee | 563,531 | PPLA2 | America/Chicago | ar-gate mixed_script | none | **`milwaukee`** |
| `birmingham` | `برمنغهام` | **`برمنغهام`** | Birmingham | 196,357 | PPLA2 | America/Chicago | collisionInWave (intra-wave) | within-wave (other US/CA/MX entries) | **`birmingham-us`** |
| `manchester` | `مانتشستر` | **`مانشستر`** | Manchester | 110,229 | PPL | America/New_York | collisionInWave (intra-wave) | within-wave (other US/CA/MX entries) | **`manchester-us`** |
| `cambridge` | `كامبريدج` | **`كامبريدج`** | Cambridge | 110,402 | PPL | America/New_York | collisionInWave (intra-wave) | within-wave (other US/CA/MX entries) | **`cambridge-us`** |
| `athens` | `آتئنز، جورجیا` | **`أثينا`** | Athens | 127,315 | PPLA2 | America/New_York | ar-gate mixed_script | within-wave (other US/CA/MX entries) | **`athens-us`** |
| `salem` | `سالم` | **`سايلم`** | Salem | 175,535 | PPLA | America/Los_Angeles | collisionInWave (intra-wave) | within-wave (other US/CA/MX entries) | **`TBD` ⚠️** |
| `toledo` | `توليدو` | **`توليدو`** | Toledo | 265,638 | PPLA2 | America/New_York | collisionInWave (intra-wave) | within-wave (other US/CA/MX entries) | **`TBD` ⚠️** |

## Decisions needed before Stage 4

### 1. `salem` (us) — bare vs `salem-us`?

* US Salem OR is state capital (pop 175,535, PPLA).
* No current `salem` owner in curated. Slug is FREE.
* No ES/GB/etc. Salem to worry about.
* BUT: 50+ "Salem" places exist in the US (towns, neighborhoods).
* **Recommendation**: claim bare `salem` for the OR state capital (most notable). Future US Salem MA could be `salem-ma` if ever added.

### 2. `toledo` (us) — bare vs `toledo-us`?

* US Toledo OH (pop 265,638, PPLA2 city in northwest Ohio).
* No current `toledo` owner in curated. Slug is FREE.
* BUT: ES Toledo (Castilla-La Mancha) is a famous historic city (UNESCO World Heritage, pop ~83k). Highly likely to be added in a future EU-3-BLOCKED-REVIEW or EUROPE-1B follow-up.
* **Recommendation**: claim `toledo-us` to preserve bare `toledo` for the future Spanish Toledo (historically more famous in Arabic culture as `طليطلة`).

## Summary

| Outcome | Count |
| --- | ---: |
| Bare slug (no collision risk) | 15 |
| Suffix `slug-cc` (resolves collision) | 7 |
| TBD (salem, toledo) | 2 |
| **TOTAL ready for merge after user approval** | **24** |

## Next steps

Reply to the assistant with one of:

* **`approve all 24 as proposed`** — merge with proposed ar + slug decisions
* **`approve with decisions: salem→bare, toledo→toledo-us`** (or other variants for TBD)
* **`approve subset`** — list which to include and which to defer
* **`adjust Arabic for X`** — provide corrected Arabic for any row before approval

No merge yet — Stage 4 awaits user approval.