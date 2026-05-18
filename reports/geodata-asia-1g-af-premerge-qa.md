# ASIA-1G-AF Pre-Merge QA Report

**Wave**: `CURATED-GEODATA-ASIA-1G-AF`
**Country**: Afghanistan (أفغانستان)
**Generated**: 2026-05-18T05:27:37.631Z
**Passes-gate entries scanned**: 28

## Top-line counts

| Check | Hits |
| --- | ---: |
| Duplicate Arabic within passes-gate | **0** |
| Passes-gate Arabic matching existing curated entry | **0** |
| Incomplete compound names | **0** |
| Aliases.ar with Persian/Urdu/Pashto/Latin pollution | **2** |
| Names.ar failing clean check | **0** |
| Bad slugs | **0** |
| Watch-list slugs touched | **17** |
| Major-blocked candidates (auto-derived) | **8** |
| **🚨 Semantic flags (Stage 3.4 mechanical default questionable)** | **4** |

## ① Duplicate Arabic within passes-gate (0)

_✅ No duplicates._

## ② Passes-gate Arabic matches existing curated (0)

_✅ No collisions._

## ③ Incomplete compound names (0)

_✅ None._

## ④ Aliases.ar with Persian/Urdu/Pashto/Latin pollution (2)

| cc/slug | name.ar | dirty alias(es) |
| --- | --- | --- |
| af/kabul | `كابل` | `كابۇل` |
| af/herat | `هراة` | `هrat` |

## ⑤ Names.ar failing clean check (0)

_✅ All clean._

## ⑥ Bad slugs (0)

_✅ All slugs valid._

## ⑦ Watch-list collision review (17)

User-flagged Afghan cities: `kabul`, `kandahar`, `herat`, `mazar-e-sharif`, `jalalabad`, `kunduz`, `ghazni`, `balkh`, `baghlan`, `pul-e-khumri`, `charikar`, `taloqan`, `sheberghan`, `shibirghan`, `farah`, `lashkar-gah`, `khost`, `bamyan`, `bamyān`

| slug | curated owner | wave passes-gate | wave blocked | note |
| --- | --- | --- | --- | --- |
| `kabul` | _(free)_ | pop=4434550 ar=`كابل` | — | ✓ wave proposes |
| `kandahar` | _(free)_ | — | pop=523300 (mixed_latin) | ⏭️ blocked |
| `herat` | _(free)_ | pop=574300 ar=`هراة` | — | ✓ wave proposes |
| `mazar-e-sharif` | _(free)_ | pop=523300 ar=`مزار شريف` | — | ✓ wave proposes |
| `jalalabad` | _(free)_ | pop=271900 ar=`جلال آباد` | — | ✓ wave proposes |
| `kunduz` | _(free)_ | pop=161902 ar=`قندز` | — | ✓ wave proposes |
| `ghazni` | _(free)_ | pop=141000 ar=`غزنة` | — | ✓ wave proposes |
| `balkh` | _(free)_ | pop=114883 ar=`بلخ` | — | ✓ wave proposes |
| `baghlan` | _(free)_ | pop=108449 ar=`باغلان` | — | ✓ wave proposes |
| `pul-e-khumri` | _(free)_ | pop=56369 ar=`بل خمري` | — | ✓ wave proposes |
| `charikar` | _(free)_ | pop=53676 ar=`جاريكار` | — | ✓ wave proposes |
| `taloqan` | _(free)_ | pop=64256 ar=`تالقان` | — | ✓ wave proposes |
| `shibirghan` | _(free)_ | pop=55641 ar=`شبرغان` | — | ✓ wave proposes |
| `farah` | _(free)_ | — | pop=43561 (mixed_latin) | ⏭️ blocked |
| `lashkar-gah` | _(free)_ | — | pop=43934 (mixed_latin) | ⏭️ blocked |
| `khost` | _(free)_ | pop=96123 ar=`خوست` | — | ✓ wave proposes |
| `bamyan` | _(free)_ | pop=61863 ar=`باميان` | — | ✓ wave proposes |

## ⑧ Major-cities-blocked auto-derived recommendation (8)

Major (pop ≥ 100k OR PPLC/PPLA) high-tier entries CURRENTLY BLOCKED. Candidates for a future `ASIA-1G-AF-MCF` mini-phase.

| slug | pop | fc | current ar | en | issue |
| --- | ---: | --- | --- | --- | --- |
| `kandahar` | 523,300 | PPLA | `qndهar` | Kandahār | ar-gate mixed_latin |
| `lashkar-gah` | 43,934 | PPLA | `lshkrgaه` | Lashkar Gāh | ar-gate mixed_latin |
| `farah` | 43,561 | PPLA | `fraه` | Farah | ar-gate mixed_latin |
| `fayroz-koh` | 15,000 | PPLA | `fyrwz kwه` | Fayrōz Kōh | ar-gate mixed_latin |
| `tarinkot` | 10,000 | PPLA | `tryn kwت` | Tarinkot | ar-gate mixed_latin |
| `qala-i-naw` | 9,000 | PPLA | `qlʿه naw` | Qala i Naw | ar-gate mixed_latin |
| `maydanshakhr` | 1,600 | PPLA | `mydan shهr` | Maydanshakhr | ar-gate mixed_latin |
| `parun` | 1,000 | PPLA | `barwں` | Pārūn | ar-gate mixed_latin |

## 🚨 ⑨ Semantic flags — Stage 3.4 mechanical-but-questionable (4)

These passed the Stage 3.5 gate (technically `arabic_only`) but the cleaned form may not be the canonical Arabic transliteration. They should be **reviewed semantically** before clean merge, similar to the kg/manas / qaem-shahr precedent.

| slug | pop | en | Stage 3.4 result | issue |
| --- | ---: | --- | --- | --- |
| `sar-e-pul` | 52,121 | Sar-e Pul | `سر بل` | Persian "Sar-e-Pul" → "سر بل" via پ→ب default. Canonical "سار-إي-بل" or keep "پل". |
| `pul-e-khumri` | 56,369 | Pul-e Khumrī | `بل خمري` | Persian "Pul" (bridge) → "بل" via default پ→ب default. Canonical is to keep "پل" or use compound transliteration. |
| `pul-e-alam` | 13,247 | Pul-e ‘Alam | `بل علم` | Persian "Pul" (bridge) → "بل" via default پ→ب default. Canonical is to keep "پل" or use compound transliteration. |
| `charikar` | 53,676 | Charikar | `جاريكار` | Persian "Charikar" → "جاريكار" via چ→ج default. Canonical Arabic is "تشاريكار" or "شاريكار". |

## Summary

| Outcome | Count |
| --- | ---: |
| Total passes-gate scanned | 28 |
| **Safe-to-merge clean** | **~24** |
| Needs manual Arabic fix (dup OR incomplete OR semantic) | ~4 |
| Aliases need cleaning (cosmetic) | 2 |
| Major blocked (deferred to MCF) | 8 |

## Next steps

Per user direction (avoid kg/manas repeat), any semantic flag should be reviewed before clean merge.

Reply with one of:

- **`approve A — clean merge ~24 safe-only`** (defer semantic flags + dups to follow-up)
- **`fix arabic per row`** — supply (slug → correct ar) before merge
- **`exclude specific slugs`** — list slugs to drop
- **`run major-cities-fix first`** — handle 8 blocked-major before merge

**No merge yet — Stage 4 awaits user approval.**