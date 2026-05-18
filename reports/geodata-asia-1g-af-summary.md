# ASIA-1G-AF Wave Summary

**Wave**: `CURATED-GEODATA-ASIA-1G-AF`
**Country**: Afghanistan (أفغانستان) — second wave to use Stage 3.4 Persian + Pashto pre-gate
**Generated**: 2026-05-18T05:29:50.538Z
**Status**: pipeline run complete — **awaiting user approval before Stage 4**

## Pipeline stages executed

| Stage | Status | Output |
|---|---|---|
| 1 — Import       | ✓ | `db/places/candidates/af-geonames-raw.json` (32,573 rows) |
| 2 — Normalize    | ✓ | `db/places/candidates/af-geonames-normalized.json` (30,921) |
| 3 — Validate     | ✓ | `db/places/candidates/af-geonames-candidates.json` |
| **3.4 — Persian/Pashto pre-gate** | **✓** | `db/places/candidates/asia-1g-af-persian-pregate.json` + MD report |
| 3.5 — Arabic-name QA | ✓ | `db/places/candidates/asia-1g-af-arabic-quality.json` |
| Premerge QA      | ✓ | `reports/geodata-asia-1g-af-premerge-qa.md` |
| 4 — Apply        | ❌ NOT RUN | awaiting user decision |

## 1. High-tier counts before Stage 3.4

| Bucket | High-tier count |
|---|---:|
| wikidata      | 0 |
| arabic_only   | 21 |
| mixed_script (BLOCKED before 3.4) | **14** |
| mixed_latin   | 1 |
| mixed_unknown | 0 |
| empty         | 0 |
| **Total**     | **36** |
| **Passes-gate (high)** | **21 = 58%** |

## 2. Names changed in Stage 3.4

| Metric | Count |
|---|---:|
| Total entries scanned          | 30,921 |
| Rows where Stage 3.4 acted     | 22,611 |
| └─ `names.ar` modified         | 20,841 |
| └─ `aliases.ar` modified       | 5,768 |
| Rows untouched                 | 8,310 |
| Rows empty                     | 0 |
| **Total character substitutions** | **45,617** |

Touched rows by tier:

| Tier | Count |
|---|---:|
| high (PPLC/PPLA or pop≥100k)  | 36 |
| medium                        | 0 |
| low                           | 29,784 |
| other (existing/needs_review) | 1,101 |

## 3. Per-character substitutions

| Character | Unicode | → | Count |
|---|---|:-:|---:|
| `ی` | U+06CC | `ي` | 18,471 |
| `ک` | U+06A9 | `ك` | 11,241 |
| `گ` | U+06AF | `غ` | 5,694 |
| `چ` | U+0686 | `ج` | 3,294 |
| `پ` | U+067E | `ب` | 2,931 |
| `ۀ` | U+06C0 | `ه` | 1,679 |
| `ډ` | U+0689 | `د` | 673 |
| `ړ` | U+0693 | `ر` | 545 |
| `څ` | U+0685 | `ج` | 255 |
| `ہ` | U+06C1 | `ه` | 197 |
| `ښ` | U+069A | `ش` | 158 |
| `ڼ` | U+06BC | `ن` | 134 |
| `ځ` | U+0681 | `ز` | 132 |
| `ژ` | U+0698 | `ز` | 120 |
| `ے` | U+06D2 | `ي` | 58 |
| `ٹ` | U+0679 | `ت` | 20 |
| `ګ` | U+06AB | `غ` | 12 |
| `ڈ` | U+0688 | `د` | 3 |

**🌟 Pashto-specific firsts for AF** (vs IR): ډ (673), ړ (545), څ (255), ښ (158), ڼ (134), ځ (132), ګ (12). These exercised the Pashto extensions of the PERSIAN_CHAR_MAP — first production use.

## 4. Passes-gate — before vs after Stage 3.4

| Metric | Baseline | After 3.4 | Δ |
|---|---:|---:|---:|
| High-tier total          | 36 | 36 | 0 |
| **High-tier passes-gate** | **21 (58%)** | **28 (78%)** | **+7** |
| High-tier blocked-by-gate | 15 | 8 | -7 |

## 5. What stayed blocked and why

**8 high-tier rows still blocked** (all `mixed_latin` after Stage 3.4) — these have Latin-script romanizations baked into `name.ar` (e.g. `qndهar`, `fraه`, `tryn kwت`). Stage 3.4 cleaned residual Persian/Urdu letters but cannot synthesize Arabic from Latin. They need MCF manual canonical Arabic.

| slug | pop | fc | after-3.4 ar | en |
|---|---:|---|---|---|
| `tarinkot` | 10,000 | PPLA | `tryn kwت` | Tarinkot |
| `qala-i-naw` | 9,000 | PPLA | `qlʿه naw` | Qala i Naw |
| `parun` | 1,000 | PPLA | `barwں` | Pārūn |
| `lashkar-gah` | 43,934 | PPLA | `lshkrgaه` | Lashkar Gāh |
| `kandahar` | 523,300 | PPLA | `qndهar` | Kandahār |
| `farah` | 43,561 | PPLA | `fraه` | Farah |
| `fayroz-koh` | 15,000 | PPLA | `fyrwz kwه` | Fayrōz Kōh |
| `maydanshakhr` | 1,600 | PPLA | `mydan shهr` | Maydanshakhr |

Low-tier blocked counts (popMin=100k):

| Bucket | Count |
|---|---:|
| mixed_latin   | 1,739 |
| mixed_unknown | 2,030 |
| mixed_script  | 0 (Stage 3.4 caught everything) |
| empty         | 0 |

## 6. False positives

**Mechanical false positives: 0** (no row demoted from a better bucket; no incorrect rescue).

**🚨 SEMANTIC false positives: 4** — rows that passed the Stage 3.5 gate but whose cleaned Arabic is semantically questionable. Stage 3.4 did its mechanical job; the result is technically clean Arabic, but Arabic speakers would not recognise it as the canonical transliteration of the city name. Per user direction (avoid kg/manas repeat), these should be reviewed before clean merge:

| slug | pop | before | after-3.4 | concern |
|---|---:|---|---|---|
| `charikar` | 53,676 | `چاريكار` | `جاريكار` | چ→ج default gives "Jarikar". Canonical is "شاريكار" or "تشاريكار". |
| `pul-e-khumri` | 56,369 | `پل خمری` | `بل خمري` | پ→ب default gives "Bul" (no meaning) instead of "Pul" (bridge). |
| `pul-e-alam` | 13,247 | `پل علم` | `بل علم` | Same پ→ب default issue. |
| `sar-e-pul` | 52,121 | `سر پل` | `سر بل` | Same پ→ب default issue. |

Mitigation options: (a) override these 4 via `NAME_AR_FIXES`, (b) exclude them from clean merge and defer to MCF, (c) accept the mechanical defaults as good-enough and add USER_TEST_ALIASES for both forms.

## 7. Top Afghan cities now in passes-gate (sorted by pop, all 28)

| Rank | slug | pop | fc | name.ar | Δ from baseline |
|---:|---|---:|---|---|:---:|
| 1 | `kabul` | 4,434,550 | PPLC | كابل | unchanged |
| 2 | `herat` | 574,300 | PPLA | هراة | unchanged |
| 3 | `mazar-e-sharif` | 523,300 | PPLA | مزار شريف | unchanged |
| 4 | `jalalabad` | 271,900 | PPLA | جلال آباد | unchanged |
| 5 | `kunduz` | 161,902 | PPLA | قندز | unchanged |
| 6 | `ghazni` | 141,000 | PPLA | غزنة | unchanged |
| 7 | `balkh` | 114,883 | PPLA2 | بلخ | unchanged |
| 8 | `baghlan` | 108,449 | PPLA2 | باغلان | unchanged |
| 9 | `gardez` | 103,601 | PPLA | غرديز | 🆕 rescued by 3.4 |
| 10 | `khost` | 96,123 | PPLA | خوست | unchanged |
| 11 | `maymana` | 75,900 | PPLA | ضلع ميمنه | 🆕 rescued by 3.4 |
| 12 | `bazarak` | 65,000 | PPLA | بازاراك | unchanged |
| 13 | `taloqan` | 64,256 | PPLA | تالقان | unchanged |
| 14 | `bamyan` | 61,863 | PPLA | باميان | unchanged |
| 15 | `pul-e-khumri` | 56,369 | PPLA | بل خمري | 🆕 rescued by 3.4 |
| 16 | `shibirghan` | 55,641 | PPLA | شبرغان | unchanged |
| 17 | `charikar` | 53,676 | PPLA | جاريكار | 🆕 rescued by 3.4 |
| 18 | `sar-e-pul` | 52,121 | PPLA | سر بل | 🆕 rescued by 3.4 |
| 19 | `zaranj` | 49,851 | PPLA | زرنج | unchanged |
| 20 | `asadabad` | 48,400 | PPLA | اسد آباد | unchanged |
| 21 | `aibak` | 47,823 | PPLA | آي بك | unchanged |
| 22 | `fayzabad` | 44,421 | PPLA | فيض آباد | 🆕 rescued by 3.4 |
| 23 | `nili` | 30,058 | PPLA | نيلي | unchanged |
| 24 | `mehtar-lam` | 17,345 | PPLA | مختار لام | unchanged |
| 25 | `pul-e-alam` | 13,247 | PPLA | بل علم | 🆕 rescued by 3.4 |
| 26 | `qalat` | 12,191 | PPLA | قلات | unchanged |
| 27 | `sidqabad` | 7,407 | PPLA | سدق آباد | unchanged |
| 28 | `sharan` | 2,200 | PPLA | شاران | unchanged |

## 8. Top Afghan cities blocked → MCF candidates

**8 high-tier blocked** (all `mixed_latin`, all PPLA). Recommend a follow-up `ASIA-1G-AF-MCF` mini-phase per user-priority Arabic canonical names:

| slug | pop | fc | current ar | suggested canonical Arabic |
|---|---:|---|---|---|
| `tarinkot` | 10,000 | PPLA | `tryn kwت` | `ترين كوت` |
| `qala-i-naw` | 9,000 | PPLA | `qlʿه naw` | `قلعة نو` |
| `parun` | 1,000 | PPLA | `barwں` | `پارون` |
| `lashkar-gah` | 43,934 | PPLA | `lshkrgaه` | `لشكر جاه` |
| `kandahar` | 523,300 | PPLA | `qndهar` | `قندهار` |
| `farah` | 43,561 | PPLA | `fraه` | `فراه` |
| `fayroz-koh` | 15,000 | PPLA | `fyrwz kwه` | `فيروز كوه` |
| `maydanshakhr` | 1,600 | PPLA | `mydan shهr` | `ميدان شهر` |

## 9. Pashto-specific fixes — are they sufficient?

Pashto-specific letters were exercised in production for the first time:

| Pashto letter | → | AF usage count |
|:-:|:-:|---:|
| `ډ` | `د` | 673 |
| `ړ` | `ر` | 545 |
| `څ` | `ج` | 255 |
| `ښ` | `ش` | 158 |
| `ڼ` | `ن` | 134 |
| `ځ` | `ز` | 132 |
| `ګ` | `غ` | 12 |

**Verdict**: The 24-letter PERSIAN_CHAR_MAP covers Pashto sufficiently. No Pashto-specific fix beyond what was already designed was needed. All 7 Pashto letters mapped cleanly. **No Stage 3.4 code change required for AF.**

**Additional letters observed in low-tier blocked rows (NOT in current map, could be added in future revisions if needed)**:

- `ں` (U+06BA — Urdu noon ghunna): appears in `parun` ar=`barwں` (not Pashto, Urdu — Latin-mostly row anyway, no real benefit from mapping)
- `ʿ` (U+02BF — modifier letter left half ring): appears in `qala-i-naw` ar=`qlʿه naw` (Latin transliteration marker, would not benefit from substitution)
- `ې` (U+06D0 — Pashto ye-barree): appears in some low-tier rows but not in any passes-gate or blocked-major row (low priority)

## Decision points

Per user direction (avoid kg/manas repeat — semantic mismatches stay in review):

1. **`approve A — clean merge ~24 safe-only`** — merge 24 entries (28 minus 4 semantic flags). Defer the 4 semantic-flag rows (charikar, pul-e-khumri, pul-e-alam, sar-e-pul) to MCF along with the 8 still-blocked.
2. **`approve B — clean merge 28 with overrides`** — accept Stage 3.4 mechanical defaults (`جاريكار` / `بل خمري` / `بل علم` / `سر بل`) and add USER_TEST_ALIASES for searchability.
3. **`fix arabic per row`** — supply (slug → correct Arabic) for the 4 semantic flags before merge.
4. **`run major-cities-fix first`** — handle the 8 blocked-major (kandahar / lashkar-gah / farah / etc.) before any merge.

## Report files generated

| File | Purpose |
|---|---|
| `reports/geodata-asia-1g-af-summary.md` | **THIS FILE** |
| `reports/af-geodata-import-report.md` | Stage 3 validate report |
| `reports/geodata-asia-1g-af-persian-pregate-report.md` | Stage 3.4 per-row audit |
| `reports/geodata-asia-1g-af-arabic-quality-report.md` | Stage 3.5 baseline-vs-after |
| `reports/geodata-asia-1g-af-premerge-qa.md` | 9-check pre-merge QA (incl. semantic flags) |

**No merge yet — Stage 4 awaits user approval.**
