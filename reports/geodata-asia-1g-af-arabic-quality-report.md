# AF Arabic-Quality Report (post-Stage 3.4)

**Wave**: `CURATED-GEODATA-ASIA-1G-AF`
**Country**: Afghanistan (أفغانستان)
**Generated**: 2026-05-18T05:29:50.528Z

## Comparison: baseline (no Stage 3.4) vs after Stage 3.4

| Bucket | Baseline | After 3.4 | Δ |
| --- | ---: | ---: | ---: |
| wikidata | 0 | 0 | 0 |
| arabic_only | 8032 | 27152 | +19120 |
| mixed_script | 20520 | 0 | -20520 |
| mixed_latin | 1625 | 1739 | +114 |
| mixed_unknown | 744 | 2030 | +1286 |
| empty | 0 | 0 | 0 |

## High-tier — baseline vs after 3.4

| Bucket | Baseline high | After 3.4 high |
| --- | ---: | ---: |
| wikidata | 0 | 0 |
| arabic_only | 21 | 28 |
| mixed_script | 14 | 0 |
| mixed_latin | 1 | 8 |
| mixed_unknown | 0 | 0 |
| empty | 0 | 0 |
| **passes-gate** | **21** | **28** |
| blocked-by-gate | 15 | 8 |

## Per-row outcomes for the 15 baseline-blocked high-tier rows

| slug | pop | baseline ar | after-3.4 ar | new bucket | passes? |
| --- | ---: | --- | --- | --- | :---: |
| tarinkot | 10,000 | `tryn kwٹ` | `tryn kwت` | mixed_latin | ✗ |
| sar-e-pul | 52,121 | `سر پل` | `سر بل` | arabic_only | ✓ |
| qala-i-naw | 9,000 | `qlʿہ naw` | `qlʿه naw` | mixed_latin | ✗ |
| parun | 1,000 | `barwں` | `barwں` | mixed_latin | ✗ |
| pul-e-khumri | 56,369 | `پل خمری` | `بل خمري` | arabic_only | ✓ |
| pul-e-alam | 13,247 | `پل علم` | `بل علم` | arabic_only | ✓ |
| maymana | 75,900 | `ضلع میمنہ` | `ضلع ميمنه` | arabic_only | ✓ |
| lashkar-gah | 43,934 | `lshkrgaہ` | `lshkrgaه` | mixed_latin | ✗ |
| kandahar | 523,300 | `qndہar` | `qndهar` | mixed_latin | ✗ |
| gardez | 103,601 | `گرديز` | `غرديز` | arabic_only | ✓ |
| fayzabad | 44,421 | `فیض آباد` | `فيض آباد` | arabic_only | ✓ |
| farah | 43,561 | `fraہ` | `fraه` | mixed_latin | ✗ |
| charikar | 53,676 | `چاريكار` | `جاريكار` | arabic_only | ✓ |
| fayroz-koh | 15,000 | `fyrwz kwہ` | `fyrwz kwه` | mixed_latin | ✗ |
| maydanshakhr | 1,600 | `mydan shہr` | `mydan shهr` | mixed_latin | ✗ |

## 28 passes-gate rows (after Stage 3.4)

| slug | pop | fc | ar | rescued by 3.4? |
| --- | ---: | --- | --- | :---: |
| kabul | 4,434,550 | PPLC | كابل | — |
| herat | 574,300 | PPLA | هراة | — |
| mazar-e-sharif | 523,300 | PPLA | مزار شريف | — |
| jalalabad | 271,900 | PPLA | جلال آباد | — |
| kunduz | 161,902 | PPLA | قندز | — |
| ghazni | 141,000 | PPLA | غزنة | — |
| balkh | 114,883 | PPLA2 | بلخ | — |
| baghlan | 108,449 | PPLA2 | باغلان | — |
| gardez | 103,601 | PPLA | غرديز | 🆕 |
| khost | 96,123 | PPLA | خوست | — |
| maymana | 75,900 | PPLA | ضلع ميمنه | 🆕 |
| bazarak | 65,000 | PPLA | بازاراك | — |
| taloqan | 64,256 | PPLA | تالقان | — |
| bamyan | 61,863 | PPLA | باميان | — |
| pul-e-khumri | 56,369 | PPLA | بل خمري | 🆕 |
| shibirghan | 55,641 | PPLA | شبرغان | — |
| charikar | 53,676 | PPLA | جاريكار | 🆕 |
| sar-e-pul | 52,121 | PPLA | سر بل | 🆕 |
| zaranj | 49,851 | PPLA | زرنج | — |
| asadabad | 48,400 | PPLA | اسد آباد | — |
| aibak | 47,823 | PPLA | آي بك | — |
| fayzabad | 44,421 | PPLA | فيض آباد | 🆕 |
| nili | 30,058 | PPLA | نيلي | — |
| mehtar-lam | 17,345 | PPLA | مختار لام | — |
| pul-e-alam | 13,247 | PPLA | بل علم | 🆕 |
| qalat | 12,191 | PPLA | قلات | — |
| sidqabad | 7,407 | PPLA | سدق آباد | — |
| sharan | 2,200 | PPLA | شاران | — |

## Counts

| Bucket | Value |
| --- | ---: |
| Total candidates scanned         | 30,921 |
| High-tier total                  | 36 |
| High-tier passes-gate            | 28 |
| High-tier blocked by gate        | 8 |
| Cross-set collisions in wave     | 0 |
| Cross-set collisions vs curated  | 71 |
