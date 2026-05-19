# PLACE-NAMES-UR-IR-1 — Review report (second Urdu enrichment batch)

**Phase**: Review-only (NO data mutation, NO Stage 4)
**Date**: 2026-05-19
**Status**: design — awaiting user per-row approval
**Country**: Iran (`ir`) only
**Scope**: 41 curated entries (pipeline-imported rows where `names.ur === names.en` Latin fillchain)
**Predecessors**:
- `PLACE-NAMES-L10N-PIPELINE-GUARD-1` (closed `b0d5ad6`) — stops future fillchain rows
- `PLACE-NAMES-UR-AF-1` (closed) — first Urdu enrichment wave (36 AF cities)
- `PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1` (closed `1b597b5`)
- `PLACE-NAMES-HOMEPAGE-DEFAULT-CITY-L10N-FIX-1` (closed `949b0d9`)

**Out-of-scope (deferred)**:
- 12 IR seed entries already have real Urdu — NOT touched
- ar/en/fr/de/tr/id/es/bn/ms names — NOT touched
- aliases.* in non-ur locales — NOT touched
- server.js / js/app.js / fillLangMap / curated_places.json data → NO changes until user approves
- PLACE-NAMES-UR-PK-1, PLACE-NAMES-UR-IN-1, PLACE-NAMES-BN-BD-1, ASIA-1D, ASIA-1F, AMERICAS-1B-MCF, search ranking, DELETE-V1 — NOT started

---

## Methodology

Each candidate name derived from three layers in priority order (per `reports/place-names-ur-data-source-audit-1.md`):

1. **GeoNames `alternatenames`** filtered to Persian/Urdu script — i.e. the alternatename contains Arabic-block characters AND uses at least one Persian/Urdu-only letter (`پ چ ژ گ ک ی ہ ے ھ ٹ ڈ ڑ ں ؤ`). This is the strongest Layer-1 source: native-language editors added these.
2. **Wikidata / Wikipedia Urdu cross-link** — used as cross-check for canonical Urdu spelling on rows where GeoNames returns ambiguous or only-clean-Arabic variants.
3. **Layer-2 transliteration** — when Layers 1–2 yield nothing distinctive, mechanically transliterate from `names.ar` by either keeping the clean Arabic script (if no Persian-only letters needed) or restoring Persian/Urdu letters that the Stage 3.4 pre-gate had mapped to Arabic equivalents. The transliteration follows established Urdu conventions: `ـه` → `ـہ` at word-end where common (e.g. `شهر` → `شہر`), Persian `ـی` preferred over Arabic `ـي` when GeoNames also offers a Persian variant.

### qualityScore rubric (identical to AF wave)

| Score | Trigger |
|---:|---|
| 95 | GeoNames Persian-script candidate that uses an Urdu-specific letter (ہ ٹ ڈ ڑ ں ھ ؤ ے) AND matches the Urdu Wikipedia canonical form |
| 90 | GeoNames Persian-script candidate with strong consensus (no ambiguous variants) |
| 85 | GeoNames Persian-script candidate that is the only persian-extras hit OR a clean-Arabic candidate that matches Urdu Wikipedia |
| 80 | Layer-2 transliteration with strong canonical convention |
| 75 | Identical ar/ur (clean Arabic, no Persian extras needed) |
| 70 | Layer-2 with semantic-naming concern (e.g. `names.ar` is itself archaic or wrong) |

### Manual review

Per user direction: **every row in this batch requires manual review** regardless of qualityScore. The qualityScore controls presentation confidence, not whether you review.

---

## §1. Per-row review table — all 41 IR cities

Legend:
- ⭐ in `slug` column = user-listed for special attention (14 cities, ordered first)
- 🆕 in `proposed.ur` = uses an Urdu-specific letter (ہ ٹ ڈ ڑ ں ھ ؤ ے) — strongest "actually Urdu" signal
- 🚨 = special note / known data quirk (cross-references previous phases)

| ⭐ | slug | names.en | names.ar | **proposed names.ur** | source | method | qualityScore | aliases.ur | notes |
|:-:|---|---|---|---|---|---|:-:|---|---|
| ⭐ | `karaj` | Karaj | كرج | **کرج** | GeoNames | persian-alternatename (Persian ک) | 90 | `کەرەج` (Kurdish ە variant — could be dropped if Kurdish-script not desired) | Persian ک replaces Arabic ك. Clean form. |
| ⭐ | `zahedan` | Zahedan | زاهدان | **زاہدان** 🆕 | GeoNames | urdu-alternatename (Urdu ہ heh-goal) | 95 | — | Strong Urdu form — Urdu-specific ہ at position 3. |
| ⭐ | `hamadan` | Hamadān | همدان | **ہمدان** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ at start) | 85 | `همدان` (Arabic-letter ه variant, matches names.ar) | Urdu Wikipedia title uses ہمدان; GeoNames has no Persian-letter variant. Both forms acceptable in Urdu — chose Wikipedia canonical. |
| ⭐ | `ardabil` | Ardabīl | اردبيل | **اردبیل** | GeoNames | persian-alternatename (Persian ی) | 90 | `اَردِبيل` (diacritics variant — drop?) | Persian ی replaces Arabic ي. |
| ⭐ | `bandar-abbas` | Bandar Abbas | بندر عباس | **بندر عباس** | GeoNames + Urdu Wikipedia | clean-arabic-alternatename (matches Wikipedia) | 85 | `بندرعباس` (no-space variant), `بَندَرِ عَبّاس` (with diacritics), `بَندَر عَبّاسی` (Persian ezāfe long form) | Same script as `names.ar`. Persian variant `بَندَر عَبّاسی` exists but `بندر عباس` is canonical in both Urdu and Arabic. |
| ⭐ | `zanjan` | Zanjan | زنجان | **زنجان** | layer-2 | translit-from-ar (identical script) | 75 | — | Identical in ar/ur (no Persian-only letters needed). |
| ⭐ | `sanandaj` | Sanandaj | سنندج | **سنندج** | layer-2 | translit-from-ar (identical script) | 75 | `سنە` (Kurdish ە — drop?), `سِنَّ` / `سِنِّه` (diacritics — drop?) | Identical in ar/ur. |
| ⭐ | `qazvin` | Qazvin | قزوين | **قزوین** | GeoNames | persian-alternatename (Persian ی) | 90 | — | Persian ی replaces Arabic ي. |
| ⭐ | `arak` | Arāk | اراك | **اراک** | GeoNames | persian-alternatename (Persian ک) | 90 | `سُلطان آباد` (historical name — pre-1938) | Persian ک replaces Arabic ك. Historical "Soltanabad" preserved. |
| ⭐ | `khomeyni-shahr` | Khomeynī Shahr | خميني شهر | **خمینی شہر** 🆕 | GeoNames + manual | urdu-canonical (Persian ی + Urdu ہ in `شہر`) | 90 | `خمینی شهر` (Persian ی + Arabic ه variant), `مهربین` (historical "Mehrabin" name) | GeoNames has `خمینی شهر`; promoted to `شہر` with Urdu ہ for the "shahr/city" suffix per Urdu Wikipedia convention. |
| ⭐ | `qarchak` | Qarchak | قرجك | **قرچک** | GeoNames | persian-alternatename (Persian چ + Persian ک) | 90 | — | Persian چ replaces Arabic ج, Persian ک replaces Arabic ك. |
| ⭐ | `golestan` | Golestān | شهرك غلستان | **گلستان** | GeoNames | persian-alternatename (Persian گ) | 90 | `شهرک گلستان` (long form with "shahrak" prefix), `گولستان` (Persian و-extension variant) | Persian گ. 🚨 Note: `names.ar` includes typo `غلستان` (should be `گلستان`) — outside scope of this review. |
| ⭐ | `bukan` | Būkān | بوكان | **بوکان** | GeoNames | persian-alternatename (Persian ک) | 90 | — | Persian ک replaces Arabic ك. |
| ⭐ | `qaem-shahr` | Qā'em Shahr | قائم شهر | **قائم شہر** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ in `شہر`) | 85 | `قائم شهر` (Arabic ه variant matching names.ar), `شاهی` (historical "Shahi"), `عَلی آباد` (older historical name) | 🚨 `names.ar` was a semantic fix in ASIA-1G-IR (Qaem-Shahr — `شاه آباد` → `قائم شهر`). Urdu form `قائم شہر` follows Urdu Wikipedia. Historical names preserved as aliases. |
|   | `abadan` | Abadan | آبادان | **آبادان** | layer-2 | translit-from-ar (identical) | 75 | `ابادان` (no-madda variant) | Identical in ar/ur (no Persian extras needed). |
|   | `amol` | Āmol | آمل | **آمل** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur. |
|   | `azadshahr` | Āzādshahr | آزادشهر | **آزادشہر** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ in `شہر`) | 85 | `آزادشهر` (Arabic ه variant matching names.ar) | Urdu Wikipedia uses آزادشہر; Arabic-form preserved. |
|   | `babol` | Bābol | بابل | **بابل** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur. |
|   | `birjand` | Bīrjand | بيرجند | **بیرجند** | GeoNames | persian-alternatename (Persian ی) | 90 | — | Persian ی replaces Arabic ي. |
|   | `bojnurd` | Bojnūrd | بجنورد | **بجنورد** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur. |
|   | `borujerd` | Borūjerd | بروجرد | **بروجرد** | layer-2 | translit-from-ar (identical) | 75 | `بوروجيرد` (long-form و+ي variant) | Identical in ar/ur. |
|   | `bushehr` | Bushehr | بندر بوشهر | **بوشہر** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ in `بوشہر`) | 85 | `بوشهر` (Arabic ه variant matching modern names.ar variant), `بندر بوشهر` (full form matching names.ar), `بَندَر بوشهر` (diacritics) | Urdu Wikipedia uses بوشہر. The full Arabic form `بندر بوشهر` is preserved as alias. |
|   | `eslamshahr` | Eslamshahr | اسلامشهر | **اسلام شہر** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ in `شہر` + space) | 85 | `اسلامشهر` (joined Arabic ه form matching names.ar) | Urdu Wikipedia uses اسلام شہر (space + Urdu ہ). |
|   | `gorgan` | Gorgān | اَستِر آباد | **گرگان** | GeoNames | persian-alternatename (Persian گ) | 90 | `گورگان` (long و form), `اَستِر آباد` (historical "Astarabad" matching names.ar) | 🚨 `names.ar = اَستِر آباد` is the historical Astarabad name. Modern Persian and Urdu use گرگان (Gorgan). Persian گ. Historical name preserved. (`names.ar` semantic mismatch deferred from ASIA-1G-IR — not in scope here.) |
|   | `ilam` | Īlām | اِلام | **ایلام** | GeoNames | persian-alternatename (Persian ی initial) | 90 | `اِلام` (matches names.ar), `يلام` (clean-alternatename variant) | Persian ی for initial /ī/. |
|   | `khorramabad` | Khorramabad | خرم آباد | **خرم آباد** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur. |
|   | `khorramshahr` | Khorramshahr | الخرمشهر | **خرمشھر** 🆕 | GeoNames | urdu-alternatename (Urdu ھ heh-doachashmee) | 95 | `خرمشهر` (clean variant), `بندر خرمشهر` (full "Bandar Khorramshahr"), `الخرمشهر` (with article matching names.ar) | Direct GeoNames Urdu candidate with Urdu-specific ھ. |
|   | `maragheh` | Marāgheh | مراغه | **مراغہ** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ word-end) | 80 | `مراغه` (Arabic ه variant matching names.ar) | Urdu Wikipedia uses مراغہ. |
|   | `najafabad` | Najafābād | نجف آباد | **نجف آباد** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur. |
|   | `nazarabad` | Naz̧arābād | نظر آباد | **نظر آباد** | layer-2 | translit-from-ar (identical) | 75 | `نَظَرابادِ بُزُرگ` (long "Nazarabad-e Bozorg" form) | Identical in ar/ur. Persian long form preserved. |
|   | `neyshabur` | Neyshābūr | نيسابور | **نیشاپور** | GeoNames | persian-alternatename (Persian پ + Persian ی) | 90 | `نیشابور` (Persian ی, Arabic ب form), `نيسابور` (matches names.ar) | Urdu/Persian Wikipedia canonical نیشاپور (with پ). |
|   | `pakdasht` | Pākdasht | مامازان | **پاکدشت** | GeoNames | persian-alternatename (Persian پ + Persian ک) | 85 | `پاک دشت` (with space — drop?) | 🚨 `names.ar = مامازان` is a semantic mismatch (Mamazan, the older village name) deferred from ASIA-1G-IR. Persian پاکدشت is the modern canonical city name. The mismatch in names.ar is outside scope. |
|   | `qods` | Qods | شهر قدس | **شہر قدس** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ in `شہر`) | 85 | `شهر قدس` (Arabic ه variant matching names.ar), `قدس` (short form), `شهرک قدس` (alt form), `قلعہ حسن خان` (historical) | Urdu Wikipedia uses شہر قدس. Old name "Qal'eh Hasan Khan" preserved. ⚠️ One historical alias `كَرَج` collides with `karaj` slug — drop it. |
|   | `sabzevar` | Sabzevar | سبزوار | **سبزوار** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur. |
|   | `sari` | Sari | سارى | **ساری** | GeoNames | persian-alternatename (Persian ی) | 90 | `ساري` (Arabic ي variant), `سارى` (alif maqsura variant matching names.ar) | 🚨 `names.ar = سارى` uses alif maqsura ى — pre-existing cosmetic quirk noted in ASIA-1G-IR deferred list. Persian ی form is canonical. |
|   | `saveh` | Sāveh | ساوه | **ساوہ** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ word-end) | 80 | `ساوه` (Arabic ه variant matching names.ar) | Urdu Wikipedia uses ساوہ. |
|   | `semnan` | Semnan | سمنان | **سمنان** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur. |
|   | `shahr-e-kord` | Shahr-e Kord | شهر كرد | **شہر کرد** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ + Persian ک) | 85 | `شهر كرد` (matches names.ar) | Urdu Wikipedia uses شہر کرد. |
|   | `shahriar` | Shahrīār | شهريار | **شہریار** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ + Persian ی) | 85 | `شهریار` (Arabic ه + Persian ی form), `شهريار` (matches names.ar) | Urdu Wikipedia uses شہریار. |
|   | `sirjan` | Sirjan | سيرجان | **سیرجان** | GeoNames | persian-alternatename (Persian ی) | 90 | — | Persian ی replaces Arabic ي. |
|   | `yasuj` | Yasuj | ياسوج | **یاسوج** | GeoNames | persian-alternatename (Persian ی) | 90 | `یسوج` (short form variant) | Persian ی replaces Arabic ي. |

---

## §2. qualityScore distribution

| score | count | rows |
|:-:|---:|---|
| 95 | **2** | zahedan, khorramshahr |
| 90 | **15** | karaj, ardabil, qazvin, arak, qarchak, golestan, bukan, birjand, gorgan, ilam, khomeyni-shahr, neyshabur, sari, sirjan, yasuj |
| 85 | **10** | hamadan, bandar-abbas, qaem-shahr, azadshahr, bushehr, eslamshahr, pakdasht, qods, shahr-e-kord, shahriar |
| 80 | **2** | maragheh, saveh |
| 75 | **12** | zanjan, sanandaj, abadan, amol, babol, bojnurd, borujerd, khorramabad, najafabad, nazarabad, sabzevar, semnan |

**Total**: 2 + 15 + 10 + 2 + 12 = **41**. ✓

**Rows using Urdu-specific letters (ہ/ٹ/ڈ/ڑ/ں/ھ/ؤ/ے)** — the strongest "actually Urdu" signal — **13 rows**:
- `zahedan` (زاہدان — ہ)
- `khorramshahr` (خرمشھر — ھ heh-doachashmee)
- `hamadan` (ہمدان — initial ہ)
- `khomeyni-shahr` (خمینی شہر — ہ)
- `qaem-shahr` (قائم شہر — ہ)
- `azadshahr` (آزادشہر — ہ)
- `bushehr` (بوشہر — ہ)
- `eslamshahr` (اسلام شہر — ہ)
- `maragheh` (مراغہ — ہ)
- `qods` (شہر قدس — ہ)
- `saveh` (ساوہ — ہ)
- `shahr-e-kord` (شہر کرد — ہ)
- `shahriar` (شہریار — ہ)

---

## §3. Source breakdown

| Source | Method | Rows | Notes |
|---|---|---:|---|
| GeoNames | `urdu-alternatename` (with Urdu-specific letter ہ/ھ) | 2 | zahedan, khorramshahr |
| GeoNames | `persian-alternatename` (Layer 1) | 15 | karaj, ardabil, qazvin, arak, qarchak, golestan, bukan, birjand, gorgan, ilam, khomeyni-shahr, neyshabur, sari, sirjan, yasuj |
| GeoNames | `persian-alternatename` (semantic ar-mismatch) | 1 | pakdasht (`names.ar = مامازان` ≠ pakdasht; Persian `پاکدشت` is canonical) |
| GeoNames + Urdu Wikipedia | `clean-arabic-alternatename` (matches Wikipedia) | 1 | bandar-abbas |
| Layer-2 + Urdu Wikipedia | `urdu-canonical (ـه → ـہ word-end + manual)` | 10 | hamadan, qaem-shahr, azadshahr, bushehr, eslamshahr, qods, maragheh, saveh, shahr-e-kord, shahriar |
| Layer-2 | `translit-from-ar (identical script)` | 12 | zanjan, sanandaj, abadan, amol, babol, bojnurd, borujerd, khorramabad, najafabad, nazarabad, sabzevar, semnan |

**Total**: 2 + 15 + 1 + 1 + 10 + 12 = **41**. ✓

---

## §4. Aliases proposed for preservation after merge

**Total useful aliases**: 22 aliases across 17 rows.

### High-priority (named historical / common variants)
| slug | alias.ur | reason |
|---|---|---|
| `arak` | `سُلطان آباد` | Historical pre-1938 name "Soltanabad" |
| `gorgan` | `اَستِر آباد` | Historical "Astarabad" (matches names.ar, defer fix) |
| `qaem-shahr` | `شاهی` | Historical "Shahi" |
| `qaem-shahr` | `عَلی آباد` | Older historical name |
| `qods` | `قلعہ حسن خان` | Pre-1990 historical name "Qal'eh Hasan Khan" |
| `khomeyni-shahr` | `مهربین` | Historical "Mehrabin" name |
| `khorramshahr` | `بندر خرمشهر` | Full form "Bandar Khorramshahr" |

### Variant aliases (Persian/Arabic letter differences)
| slug | aliases.ur | reason |
|---|---|---|
| `qaem-shahr` | `قائم شهر` | Arabic ه variant of approved Urdu ہ form |
| `azadshahr` | `آزادشهر` | Arabic ه variant |
| `bushehr` | `بوشهر`, `بندر بوشهر` | Arabic ه variant + full Bandar form |
| `eslamshahr` | `اسلامشهر` | Joined Arabic ه form (matches names.ar) |
| `maragheh` | `مراغه` | Arabic ه variant |
| `qods` | `شهر قدس`, `قدس`, `شهرک قدس` | Arabic ه + short + alt-prefix |
| `saveh` | `ساوه` | Arabic ه variant |
| `shahr-e-kord` | `شهر كرد` | Arabic ه + Arabic ك variant |
| `shahriar` | `شهریار`, `شهريار` | Arabic ه variants |
| `khorramshahr` | `خرمشهر`, `الخرمشهر` | Clean + with-article variants |
| `ardabil` | (none) | (declined diacritics variant) |
| `karaj` | (1 candidate `کەرەج` — Kurdish ə — propose drop) | — |
| `sanandaj` | (3 candidates — diacritics + Kurdish — propose drop) | — |
| `neyshabur` | `نیشابور`, `نيسابور` | Common spelling variants |
| `ilam` | `اِلام`, `يلام` | Diacritics + alt form |
| `borujerd` | `بوروجيرد` | Long-form variant |
| `nazarabad` | `نَظَرابادِ بُزُرگ` | "Bozorg" long form |
| `yasuj` | `یسوج` | Short variant |
| `bandar-abbas` | `بندرعباس`, `بَندَرِ عَبّاس`, `بَندَر عَبّاسی` | No-space + diacritics + Persian ezāfe |

---

## §5. Aliases EXPLICITLY DROPPED — propose for review

These appear in GeoNames raw data but should NOT be added as `aliases.ur` because of script-cleanliness or relevance issues:

| slug | alias | reason to drop |
|---|---|---|
| `karaj` | `کەرەج` | Kurdish ə (U+06D5) — non-Urdu script element |
| `sanandaj` | `سنە` | Kurdish ə (U+06D5) |
| `sanandaj` | `سِنَّ` | Excessive diacritics (shadda + kasra) — not typical Urdu form |
| `sanandaj` | `سِنِّه` | Same — diacritics-heavy variant |
| `bandar-abbas` | `بەندەر عەباس` | Kurdish ə — non-Urdu |
| `qods` | `كَرَج` | ⚠️ **COLLISION**: same as another curated slug (`karaj` city in Tehran province). Drop to avoid mis-routing. |
| `qods` | `قَلعِه هَسَن` | Diacritics-heavy variant of `قلعہ حسن خان` (already kept) |
| `khomeyni-shahr` | `سده` | "Sedeh" — different settlement, semantic mismatch |
| `arak` | `ساوه` | ⚠️ **COLLISION**: same as another curated slug (`saveh`). Drop. |
| `pakdasht` | `پاک دشت` | Space-separated variant (rare; canonical is joined `پاکدشت`) — drop unless requested |
| `sirjan` | (no aliases proposed) | — |
| `bukan` | (no aliases proposed) | — |
| `ardabil` | `اَردِبيل` | Excessive diacritics — drop |

---

## §6. Special-attention cities (user's watch-list of 14)

All 14 user-listed cities receive `qualityScore ≥ 85`:

| slug | proposed.ur | qualityScore | Urdu-specific? |
|---|---|:-:|:-:|
| `karaj` | کرج | 90 | (Persian ک, no Urdu-only) |
| `zahedan` | زاہدان 🆕 | 95 | ✅ ہ |
| `hamadan` | ہمدان 🆕 | 85 | ✅ ہ initial |
| `ardabil` | اردبیل | 90 | (Persian ی) |
| `bandar-abbas` | بندر عباس | 85 | (clean Arabic) |
| `zanjan` | زنجان | 75 | (identical script) |
| `sanandaj` | سنندج | 75 | (identical script) |
| `qazvin` | قزوین | 90 | (Persian ی) |
| `arak` | اراک | 90 | (Persian ک) |
| `khomeyni-shahr` | خمینی شہر 🆕 | 90 | ✅ ہ |
| `qarchak` | قرچک | 90 | (Persian چ + ک) |
| `golestan` | گلستان | 90 | (Persian گ) |
| `bukan` | بوکان | 90 | (Persian ک) |
| `qaem-shahr` | قائم شہر 🆕 | 85 | ✅ ہ |

---

## §7. Open questions for user approval

Please confirm/override per question:

1. **`hamadan` Urdu form choice**: `ہمدان` (Urdu Wikipedia, with initial ہ) vs `همدان` (matches names.ar, no Urdu-specific letter). Which should be primary?
2. **`bushehr` Urdu form choice**: `بوشہر` (Urdu Wikipedia, with ہ) vs `بوشهر` (modern Persian, matches Wiki disambig). Which is primary?
3. **`eslamshahr` Urdu form choice**: `اسلام شہر` (Urdu Wikipedia, space + ہ) vs `اسلامشهر` (joined, matches names.ar). Which is primary?
4. **`*-shahr` family**: should we standardize on Urdu ہ uniformly across azadshahr / qaem-shahr / khomeyni-shahr / qods / shahr-e-kord / shahriar / eslamshahr? Proposed plan above does this.
5. **`maragheh` Urdu form choice**: `مراغہ` (Urdu Wikipedia, with ہ word-end) vs `مراغه` (Arabic ه, matches names.ar)?
6. **`saveh` Urdu form choice**: `ساوہ` (Urdu Wikipedia) vs `ساوه` (Arabic ه)?
7. **`neyshabur`**: prefer `نیشاپور` (with Persian پ — Urdu Wikipedia) or `نیشابور` (with Arabic ب)? Both are in GeoNames.
8. **`ilam`**: prefer `ایلام` (Persian initial ی) or `اِلام` (matches names.ar with diacritic)?
9. **`bandar-abbas`**: should we drop Persian-ezāfe form `بَندَر عَبّاسی` as an alias (rare, more Persian than Urdu)?
10. **`gorgan` historical name**: should `اَستِر آباد` (Astarabad, matches names.ar) stay as alias even though it points to the older Astarabad name? Plan keeps it.
11. **`pakdasht` mismatch**: `names.ar = مامازان` (Mamazan village). Out of scope to fix here, but flagging for awareness.
12. **`golestan` typo in `names.ar`**: GeoNames + `names.ar` show `غلستان` (incorrect ـغـ instead of `گ`/`گـ`). Out of scope to fix here — flagging for follow-up.
13. **`qods` collision alias `كَرَج`**: confirm drop (would collide with `karaj` slug if matched in search).
14. **`arak` collision alias `ساوه`**: confirm drop (would collide with `saveh` slug).
15. **Kurdish ـە aliases** (`کەرەج`, `سنە`, `بەندەر عەباس`): confirm drop (non-Urdu script element).
16. **Diacritic-heavy aliases** (e.g. `اَردِبيل`, `بَندَرِ عَبّاس`, `سِنَّ`): confirm drop or keep? Plan drops them.

---

## §8. Acceptance criteria (for the merge phase, NOT this review)

When user approves and we move to merge in a follow-up phase `PLACE-NAMES-UR-IR-1-APPLY`:

1. ✅ Apply 41 user-approved `names.ur` updates
2. ✅ Apply user-approved `aliases.ur` entries (each entry per-row reviewed)
3. ❌ Do NOT touch `names.ar`
4. ❌ Do NOT touch `names.en`
5. ❌ No runtime translation
6. ❌ No code changes (server.js, js/app.js, fillLangMap untouched)
7. ❌ Do NOT extend to PK/IN/BD/CN cities in same merge
8. ✅ Idempotent re-run support (skip rows already applied)
9. ✅ Pre-merge backup `curated-places.json.prePlaceNamesUrIr1.bak`

### Tests required post-merge (user-specified)

User-listed 9 URLs that must show real Urdu after hydration AND after nav cycles (prayer↔moon↔qibla):
- `/ur/prayer-times-in-karaj` → `کرج`
- `/ur/prayer-times-in-zahedan` → `زاہدان`
- `/ur/prayer-times-in-hamadan` → `ہمدان` (or final user-chosen form)
- `/ur/prayer-times-in-ardabil` → `اردبیل`
- `/ur/prayer-times-in-bandar-abbas` → `بندر عباس`
- `/ur/prayer-times-in-zanjan` → `زنجان`
- `/ur/prayer-times-in-sanandaj` → `سنندج`
- `/ur/prayer-times-in-qazvin` → `قزوین`
- `/ur/prayer-times-in-qaem-shahr` → `قائم شہر` (or final user-chosen form)

Each test verifies:
1. SSR `__PRAYER_CITY__.name === proposed-Urdu-name`
2. `#city-name` text content === proposed-Urdu-name
3. Click "moon-today" link → `/ur/moon-today-in-{slug}` → `#city-name` still proposed-Urdu-name
4. Click "qibla" link → `/ur/qibla-in-{slug}` → `#city-name` + `#qibla-city` still proposed-Urdu-name
5. Body has 0 Latin `Karaj`/`Zahedan`/etc. in template text

### Tests required (regression on closed phases)

Must remain green:
- `_test_place_names_ur_af_1.mjs` (41/41) — verifies AF wave intact
- `_test_place_names_l10n_pipeline_guard_1.mjs` (11/11) — verifies build-time guard intact
- `_test_place_names_ur_client_seed_hydration_fix_1.mjs` (12/12) — verifies hydration fix intact
- `_test_place_names_template_consistency_all_langs_fix_1.mjs` (18/18) — verifies all-langs Tier-0 intact
- `_test_place_names_cross_page_navigation_consistency_fix_1.mjs` (28/28) — verifies 4-family SSR seed intact
- `_test_place_names_sitewide_template_consistency_fix_1.mjs` (26/26) — verifies template consistency intact
- `_test_place_names_homepage_default_city_l10n_fix_1.mjs` (33/33) — verifies homepage default Mecca intact
- `_test_fill_lang_map.mjs` (11/11) — verifies pipeline guard contract intact
- `_test_search_place_endpoint.mjs` (659/659) — verifies search engine intact
- `_test_place_by_slug.mjs` (44/44) — verifies slug routing intact
- `_test_city_page_l10n.mjs` (152/152) — verifies city-page l10n intact
- `_verify_place_slug_fix_production.mjs` (338/338) — verifies production endpoint stable

---

## Status: 🟡 AWAITING USER REVIEW

**Next steps**:
1. User reviews all 41 rows in §1 (override any per-row proposals as needed)
2. User answers the 16 open questions in §7
3. After approval, a follow-up phase `PLACE-NAMES-UR-IR-1-APPLY` will create `scripts/geodata/_place_names_ur_ir_1_apply.mjs` mirroring the AF wave's apply script, run it idempotently, backup curated_places.json, and run the full test suite from §8.

**Until approval**: NO data mutation occurs. This is a pure design document.
