# PLACE-NAMES-UR-PK-2 — Review report (fourth Urdu enrichment batch)

**Phase**: Review-only (NO data mutation, NO Stage 4)
**Date**: 2026-05-19
**Status**: design — awaiting user per-row approval
**Country**: Pakistan (`pk`) only — 43 NEW pipeline entries from ASIA-1D-PK
**Scope**: 43 curated entries — all are PK pipeline rows with `names.ur` ABSENT (per fillLangMap guard at write-time)
**Predecessors**:
- `PLACE-NAMES-L10N-PIPELINE-GUARD-1` (closed) — stops fillchain at build-time
- `PLACE-NAMES-UR-AF-1` (closed) — first Urdu enrichment wave (36 AF cities)
- `PLACE-NAMES-UR-IR-1-APPLY` (closed) — second Urdu wave (41 IR cities)
- `PLACE-NAMES-UR-PK-1-APPLY` (closed) — third Urdu wave (3 aliases on existing 10 PK seed)
- `ASIA-1D-PK` (closed `0bdda2d`, 2026-05-19) — merged 43 new PK pipeline cities + 3 NAME_AR_FIXES + apply-script fillLangMap guard extension

**Out-of-scope (explicit per user direction)**:
- 10 PK seed entries already have real Urdu — NOT touched (UR-PK-1 baseline preserved)
- ar / en / fr / de / tr / id / es / bn / ms names — NOT touched
- server.js / js/app.js / fillLangMap / index.html / curated_places.json → NO changes until user approves
- 17 ASIA-1D-PK blocked-majors (deferred to ASIA-1D-PK-MCF)
- 98 ASIA-1D-PK missing-ar majors (deferred to ASIA-1D-PK-MISSING-AR-MAJORS-1)
- PLACE-NAMES-UR-IN-1 / BN-BD-1 / ASIA-1D-BD / ASIA-1D-IN / ASIA-1F / AMERICAS-1B-MCF / Search-ranking / Alias enrichment / DELETE-V1 — NOT started

---

## §0. Current state (post-ASIA-1D-PK)

```
PK count: 53
  10 seed entries — already have real Urdu (UR-PK-1 baseline)
  43 NEW GeoData entries — names.ur ABSENT (fillLangMap guard prevents fillchain)
```

Server's `_pickCuratedName(entry, 'ur')` currently falls back to `names.en` (Latin) for these 43 cities. This phase proposes real Urdu names to enrich each one — once approved + applied via a follow-up `_apply.mjs` script, the entries get `names.ur = "..."` real Urdu values.

---

## Methodology (same as UR-AF-1 / UR-IR-1 / UR-PK-1)

Each candidate name derived from three layers in priority order:

1. **GeoNames `alternatenames`** filtered to Persian/Urdu script — entries that contain Arabic-block characters AND use at least one Persian/Urdu-only letter (`پ چ ژ گ ک ی ہ ے ھ ٹ ڈ ڑ ں ؤ`). Strongest Layer-1 source.
2. **Wikidata / Wikipedia Urdu cross-link** — used as canonical when GeoNames returns ambiguous variants OR Layer-1 yields nothing distinctive.
3. **Layer-2 transliteration** — when Layers 1–2 yield nothing, mechanical transliteration from `names.ar` (mostly when ar/ur are letter-identical).

### qualityScore rubric (identical to prior Urdu waves)

| Score | Trigger |
|---:|---|
| 95 | GeoNames Persian-script candidate using an Urdu-specific letter (ہ/ٹ/ڈ/ڑ/ں/ھ/ؤ/ے) AND matches Urdu Wikipedia canonical |
| 90 | GeoNames Persian-script candidate with strong consensus (no ambiguous variants) |
| 85 | GeoNames Persian-script candidate + Urdu Wikipedia confirms; OR clean-Arabic + Wikipedia |
| 80 | Layer-2 + Urdu Wikipedia |
| 75 | Identical-script (ar = ur, no Urdu extras needed) |
| 70 | Layer-2 with semantic concern |

### 🚨 CRITICAL: 3 cities just got NAME_AR_FIXES in ASIA-1D-PK

For these 3, the GeoNames Persian/Urdu alternatenames may reference the **OLD/WRONG** Arabic forms. DO NOT use those for `names.ur`:

| slug | OLD GeoNames `ar` (WRONG) | NEW `ar` (post-fix) | GeoNames Urdu alternatename | **Verdict for names.ur** |
|---|---|---|---|---|
| `bahawalnagar` | `بهاولبور` (=Bahawalpur — different city!) | `بهاولنغر` | `بہاولپور` (also Bahawalpur — WRONG) | ❌ Use Urdu Wikipedia canonical `بہاولنگر` (with Urdu ہ + گ for Nagar) — DO NOT use the GeoNames Urdu alternatename which references the wrong city |
| `mailsi` | `تصيل ميلسي` (admin-prefix) | `ميلسي` | `میلسی` (clean) + `تصیل میلسی` (prefixed) | ✅ Use `میلسی` (clean, Persian ی) |
| `chishtian` | `ششتيان شريف` (honorific) | `ششتيان` | `چشتیاں` (Urdu-specific ں) | ✅ Use `چشتیاں` (with ں); preserve `چشتیان شریف` as historical alias |

---

## §1. Per-row review table — all 43 PK new cities

Legend:
- 🆕 in `proposed.ur` = uses an Urdu-specific letter (ہ/ٹ/ڈ/ڑ/ں/ھ/ؤ/ے) — strongest "actually Urdu" signal
- 🚨 = special note (cross-reference to ASIA-1D-PK NAME_AR_FIX or known data quirk)
- ⭐ in `slug` column = user-listed for special attention

| ⭐ | slug | names.en | names.ar | **proposed names.ur** | source | method | qualityScore | aliases.ur | notes |
|:-:|---|---|---|---|---|---|:-:|---|---|
| ⭐ | `bahawalnagar` | Bahawalnagar | بهاولنغر | **بہاولنگر** 🆕 | layer-2 + Urdu Wikipedia | urdu-canonical (Urdu ہ + Persian گ) | 85 | `بہاول نگر` (with-space variant) | 🚨 **DO NOT use GeoNames Urdu alt `بہاولپور`** — that's Bahawalpur (different city). Same semantic mismatch we fixed in `names.ar`. Urdu Wikipedia canonical for Bahawalnagar = `بہاولنگر`. |
| ⭐ | `mailsi` | Mailsi | ميلسي | **میلسی** | GeoNames | persian-alternatename (Persian ی) | 90 | — | 🚨 GeoNames also has `تصیل میلسی` (admin-prefix variant) — DROP per user direction (same as we did for `names.ar`) |
| ⭐ | `chishtian` | Chishtian | ششتيان | **چشتیاں** 🆕 | GeoNames | urdu-alternatename (Urdu ں + Persian چ + Persian ی) | 95 | `چشتیان` (Persian ی, no ں variant), `چشتیان شریف` (Urdu شریف form of the historical honorific; clean) | 🚨 Strong Urdu form. Historical "Chishtian Sharif" preserved as alias for search continuity. |
| ⭐ | `rahim-yar-khan` | Rahim Yar Khan | رحيم يار خان | **رحیم یار خان** | GeoNames | persian-alternatename (Persian ی) | 90 | `رحیم‌یارخان` (no-space ZWNJ variant — drop?) | Compound name; Persian ی throughout. Urdu Wikipedia canonical matches. |
| ⭐ | `jhang-sadr` | Jhang Sadr | جانغ صدر | **جھنگ صدر** 🆕 | GeoNames | urdu-alternatename (Urdu ھ + Persian گ) | 95 | — | "Jhang Sadr" = the main town of Jhang district. Urdu uses Persian گ + Urdu ھ (do-chashmi heh). |
| ⭐ | `shekhupura` | Shekhupura | شيخوبوره | **شیخوپورہ** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian پ) | 95 | `شیخوپورا` (Arabic-ا variant), `شیخوپوره` (Arabic ه variant) | Strong Urdu form. Multiple GeoNames variants preserved as aliases for search. |
| ⭐ | `gojra` | Gojra | جوجرا | **گوجرہ** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian گ) | 95 | `گوجرا` (Persian ا instead of ہ variant) | Persian گ + Urdu ہ word-end. |
| ⭐ | `muridke` | Muridke | مريدكي | **مریدکے** 🆕 | GeoNames | urdu-alternatename (Urdu ے + Persian ک + Persian ی) | 95 | `مریدکی` (Persian ی variant), `موریدک` (alt) | Strong Urdu form with yeh-barree ے at end. |
|   | `ahmadpur-east` | Ahmadpur East | احمد بور | **احمد پور شرقیہ** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian پ + Persian ی) | 95 | `احمد پور` (short), `احمدپور` (no-space) | "Shrqi" = Eastern. Urdu Wikipedia uses `احمد پور شرقیہ` (with feminine ہ). |
|   | `bhalwal` | Bhalwal | بالوال | **بھلوال** 🆕 | GeoNames | urdu-alternatename (Urdu ھ) | 95 | — | Strong Urdu form with do-chashmi heh ھ (aspirated bh sound). |
|   | `buni` | Buni | بُنِي | **بُنِی** | GeoNames | persian-alternatename (Persian ی) | 85 | `بنی` (no-diacritics short) | Persian ی; diacritics preserved from GeoNames. |
|   | `chaman` | Chaman | جمن | **چمن** | GeoNames | persian-alternatename (Persian چ) | 90 | — | Persian چ replaces Arabic ج. |
|   | `dadu` | Dadu | دادُو | **دادو** | layer-2 | translit-from-ar (drop diacritics) | 75 | `دادُو` (with-diacritics form matching names.ar) | Diacritics-free clean form for primary. |
|   | `dipalpur` | Dipalpur | ديبالبور | **دیپالپور** | GeoNames | persian-alternatename (Persian ی + Persian پ) | 90 | `دیپال پور` (with-space variant) | Persian پ + ی. |
|   | `gilgit` | Gilgit | كلكت | **گلگت** | GeoNames | persian-alternatename (Persian گ + Persian ک) | 90 | — | Capital of Gilgit-Baltistan; Persian گ. |
|   | `gujrat` | Gujrat | غجرات | **گجرات** | GeoNames | persian-alternatename (Persian گ) | 90 | — | Persian گ replaces Arabic غ. Note: Pakistani Gujrat (Punjab) — separate from Indian Gujarat state (would be `گجرات (بھارت)` if both existed). |
|   | `gwadar` | Gwadar | جوادر | **گوادر** | GeoNames | persian-alternatename (Persian گ) | 90 | — | Strategic Balochistan port; Persian گ. |
|   | `hasilpur` | Hasilpur | حاصل بور | **حاصل پور** | GeoNames | persian-alternatename (Persian پ) | 90 | `حاصل‌پور` (ZWNJ variant — drop) | Persian پ for "pur" (city) suffix. |
|   | `jahangira` | Jahangira | جهانغيرا | **جہانگیرا** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian گ + Persian ی) | 95 | `جهانگیرا` (Arabic ه + Persian گی variant) | Strong Urdu form. |
|   | `jamrud` | Jamrud | جمرود | **جمرود** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur — pass-through. |
|   | `jaranwala` | Jaranwala | جرانوالا | **جڑانوالا** 🆕 | GeoNames | urdu-alternatename (Urdu ڑ retroflex) | 95 | `جڑانوالہ` (ہ-end variant), `جرانوالا` (no-retroflex Arabic variant) | Strong Urdu form with retroflex ڑ. |
|   | `jhelum` | Jhelum | جهلم | **جہلم** 🆕 | GeoNames | urdu-alternatename (Urdu ہ) | 95 | `جهلم` (Arabic ه variant matching names.ar) | Strong Urdu form. |
|   | `kabirwala` | Kabirwala | كبير والا | **کبیر والا** | GeoNames | persian-alternatename (Persian ک + Persian ی) | 90 | — | Persian ک + ی. |
|   | `kamalia` | Kamalia | كماليا | **کمالیہ** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian ک + Persian ی) | 95 | `کمالیا` (Persian ا variant), `کمالیه` (Arabic ه variant) | Strong Urdu form. |
|   | `kambar` | Kambar | قمبر | **قمبر** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur. |
|   | `kotri` | Kotri | كوتري | **کوٹری** 🆕 | GeoNames | urdu-alternatename (Urdu retroflex ٹ + Persian ک + Persian ی) | 95 | — | Strong Urdu form with retroflex ٹ. |
|   | `mardan` | Mardan | مردان | **مردان** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur. |
|   | `matli` | Matli | ماتلى | **ماتلی** | GeoNames | persian-alternatename (Persian ی) | 85 | `ماتلی`(same), `ماتلي` (Arabic ي variant) | Persian ی replaces Arabic ى. |
|   | `mingora` | Mingora | منغورا | **مینگورہ** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian گ + Persian ی) | 95 | `مینگورا` (Persian ا variant), `مینگوره` (Arabic ه variant), `مینګورہ` (Pashto ګ variant — drop) | Strong Urdu form. Mingora is the largest city of Swat district. |
|   | `mirpur-khas` | Mirpur Khas | ميربور خاص | **میرپور خاص** | GeoNames | persian-alternatename (Persian ی + Persian پ) | 90 | `میر پور خاص` (with-space form) | Persian پ + ی; "Khas" = special. |
|   | `muzaffarabad` | Muzaffarābād | مظفر آباد | **مظفر آباد** | layer-2 | translit-from-ar (identical) | 75 | `مظفرآباد` (no-space variant) | Identical in ar/ur. Capital of Azad Kashmir. |
|   | `nankana-sahib` | Nankana Sahib | نانكانا صاحب | **ننکانہ صاحب** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian ک) | 95 | `ننکانه صاحب` (Arabic ه variant) | Birthplace of Guru Nanak (Sikh holy site); Urdu Wikipedia canonical. |
|   | `pasrur` | Pasrur | بسرور | **پسرور** | GeoNames | persian-alternatename (Persian پ) | 90 | — | Persian پ replaces Arabic ب. |
|   | `pattoki` | Pattoki | بتوكى | **پتوکی** | GeoNames | persian-alternatename (Persian پ + ک + ی) | 90 | `پتوكى` (Arabic-ى variant) | Persian پ + ک + ی. |
|   | `sambrial` | Sambrial | سمبريال | **سمبڑیال** 🆕 | GeoNames | urdu-alternatename (Urdu ڑ retroflex + Persian ی) | 95 | `سمبریال` (no-retroflex Persian ی variant) | Strong Urdu form with retroflex ڑ. |
|   | `sargodha` | Sargodha | سرغودها | **سرگودھا** 🆕 | GeoNames | urdu-alternatename (Urdu ھ + Persian گ) | 95 | `سرگودها` (Arabic ه variant) | Strong Urdu form. Largest non-curated PK city before this wave. |
|   | `shahdadpur` | Shahdadpur | شهدادبور | **شہدادپور** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian پ) | 95 | `شهدادپور` (Arabic ه variant) | Strong Urdu form. |
|   | `sibi` | Sibi | سبي | **سبی** | GeoNames | persian-alternatename (Persian ی) | 85 | `سبي` (Arabic ي matching names.ar) | Persian ی form. Capital of Sibi district, Balochistan. |
|   | `skardu` | Skardu | سكردو | **سکردو** | GeoNames | persian-alternatename (Persian ک) | 90 | — | Persian ک. Capital of Skardu district, Gilgit-Baltistan. |
|   | `sukkur` | Sukkur | سكر | **سکھر** 🆕 | GeoNames | urdu-alternatename (Urdu ھ + Persian ک) | 95 | `سکر` (Persian ک short variant matching names.ar) | Strong Urdu form. Major Sindh city. |
|   | `tordher` | Tordher | توردهر | **توردھر** 🆕 | GeoNames | urdu-alternatename (Urdu ھ) | 95 | `توردهر` (Arabic ه variant matching names.ar) | Strong Urdu form. |
|   | `turbat` | Turbat | تربت | **تربت** | layer-2 | translit-from-ar (identical) | 75 | `تُربت` (with-diacritics variant — drop?) | Identical in ar/ur. Capital of Kech district, Balochistan. |
|   | `wazirabad` | Wazirabad | وزير آباد | **وزیر آباد** | GeoNames | persian-alternatename (Persian ی) | 90 | `وزیرآباد` (no-space variant) | Persian ی for Wazir. |

---

## §2. qualityScore distribution

| score | count | rows |
|:-:|---:|---|
| 95 | **20** | chishtian, jhang-sadr, shekhupura, gojra, muridke, ahmadpur-east, bhalwal, jahangira, jaranwala, jhelum, kamalia, kotri, mingora, nankana-sahib, sambrial, sargodha, shahdadpur, sukkur, tordher, kabirwala (=19 — recount below) |
| 90 | **12** | mailsi, rahim-yar-khan, chaman, dipalpur, gilgit, gujrat, gwadar, hasilpur, kabirwala, mirpur-khas, pasrur, pattoki, skardu, wazirabad (=14 — recount below) |
| 85 | **5** | bahawalnagar, buni, matli, sibi (=4 — recount below) |
| 80 | 0 | — |
| 75 | **6** | dadu, jamrud, kambar, mardan, muzaffarabad, turbat |

**Recount** (authoritative per §1 table):

| score | rows | count |
|:-:|---|---:|
| 95 | chishtian, jhang-sadr, shekhupura, gojra, muridke, ahmadpur-east, bhalwal, jahangira, jaranwala, jhelum, kamalia, kotri, mingora, nankana-sahib, sambrial, sargodha, shahdadpur, sukkur, tordher | **19** |
| 90 | mailsi, rahim-yar-khan, chaman, dipalpur, gilgit, gujrat, gwadar, hasilpur, kabirwala, mirpur-khas, pasrur, pattoki, skardu, wazirabad | **14** |
| 85 | bahawalnagar, buni, matli, sibi | **4** |
| 80 | (none) | 0 |
| 75 | dadu, jamrud, kambar, mardan, muzaffarabad, turbat | **6** |
| 70 | (none) | 0 |

**Total**: 19 + 14 + 4 + 6 = **43** ✓

**Rows using Urdu-specific letters (ہ/ٹ/ڈ/ڑ/ں/ھ/ؤ/ے)** — strongest "actually Urdu" signal — **19 rows** (44% — much higher than UR-IR-1's 13/41 = 32%, reflecting that PK cities have rich Urdu Wikipedia coverage).

---

## §3. Source breakdown

| Source | Method | Rows | Notes |
|---|---|---:|---|
| GeoNames | `urdu-alternatename` (with Urdu-specific letter) | **19** | All 19 score-95 rows — direct from Urdu-tagged or Persian-Urdu alternatenames |
| GeoNames | `persian-alternatename` (Layer 1, no Urdu-specific) | **14** | All score-90 rows |
| Layer-2 + Urdu Wikipedia | `urdu-canonical` | **1** | bahawalnagar (Wikipedia-canonical override of contaminated GeoNames Urdu alt) |
| GeoNames | `persian-alternatename` (single-hit, lower confidence) | **3** | buni, matli, sibi |
| Layer-2 | `translit-from-ar (identical script)` | **6** | dadu (with diacritic drop), jamrud, kambar, mardan, muzaffarabad, turbat |

**Total**: 19 + 14 + 1 + 3 + 6 = **43** ✓

---

## §4. Special-attention cities (user's watch-list of 10)

All 10 user-listed cities receive `qualityScore ≥ 85`:

| slug | proposed.ur | qualityScore | Urdu-specific letters? |
|---|---|:-:|:-:|
| `bahawalnagar` | `بہاولنگر` 🆕 | 85 | ✅ ہ (layer-2 from Urdu Wikipedia) |
| `mailsi` | `میلسی` | 90 | (Persian ی) |
| `chishtian` | `چشتیاں` 🆕 | 95 | ✅ ں + چ + ی |
| `rahim-yar-khan` | `رحیم یار خان` | 90 | (Persian ی) |
| `jhang-sadr` ⭐ | `جھنگ صدر` 🆕 | 95 | ✅ ھ |
| `shekhupura` (= "sheikhupura") ⭐ | `شیخوپورہ` 🆕 | 95 | ✅ ہ + پ |
| `wah-cantonment` ⭐ | NOT in this wave | — | (deferred to ASIA-1D-PK-MISSING-AR-MAJORS-1) |
| `kamoke` ⭐ | NOT in this wave | — | (deferred — missing-ar) |
| `gojra` ⭐ | `گوجرہ` 🆕 | 95 | ✅ ہ + گ |
| `muridke` ⭐ | `مریدکے` 🆕 | 95 | ✅ ے + ک + ی |

Two user-listed cities (`wah-cantonment`, `kamoke`) are NOT in this wave because they were in the 98-deferred missing-ar majors set. They'll come via `ASIA-1D-PK-MISSING-AR-MAJORS-1` followed by their own Urdu enrichment.

---

## §5. Aliases proposed for preservation after merge

**Total useful aliases**: ~30 aliases across ~24 rows.

### High-priority (historical / common variants)
| slug | alias.ur | reason |
|---|---|---|
| `chishtian` | `چشتیان` | Persian ی-only form (no ں Urdu retroflex) |
| `chishtian` | `چشتیان شریف` | Historical "Chishtian Sharif" honorific name |
| `ahmadpur-east` | `احمد پور` | Short form without "Eastern" qualifier |
| `ahmadpur-east` | `احمدپور` | No-space variant |
| `sukkur` | `سکر` | Short Persian-form variant |
| `sargodha` | `سرگودها` | Arabic ه variant matching names.ar |

### Variant aliases (script differences kept for search continuity)
| slug | aliases.ur | reason |
|---|---|---|
| `shekhupura` | `شیخوپورا`, `شیخوپوره` | Persian ا and Arabic ه variants |
| `gojra` | `گوجرا` | Without final ہ |
| `muridke` | `مریدکی`, `موریدک` | Persian ی and short variants |
| `jaranwala` | `جڑانوالہ`, `جرانوالا` | ہ-end + non-retroflex variants |
| `jhelum` | `جهلم` | Arabic ه variant |
| `kamalia` | `کمالیا`, `کمالیه` | Persian ا + Arabic ه variants |
| `mingora` | `مینگورا`, `مینگوره` | Persian ا + Arabic ه variants |
| `sambrial` | `سمبریال` | Non-retroflex Persian ی variant |
| `shahdadpur` | `شهدادپور` | Arabic ه variant matching names.ar |
| `tordher` | `توردهر` | Arabic ه variant matching names.ar |
| `matli` | `ماتلي` | Arabic ي variant |
| `pattoki` | `پتوكى` | Arabic-ى variant |
| `sibi` | `سبي` | Arabic ي variant matching names.ar |
| `rahim-yar-khan` | `رحیم‌یارخان` (with ZWNJ) | (decide: keep or drop) |
| `mirpur-khas` | `میر پور خاص` | With-space variant |
| `wazirabad` | `وزیرآباد` | No-space variant |
| `dipalpur` | `دیپال پور` | With-space variant |
| `nankana-sahib` | `ننکانه صاحب` | Arabic ه variant |
| `bahawalnagar` | `بہاول نگر` | With-space variant |

---

## §6. Aliases EXPLICITLY DROPPED — propose for review

These appear in GeoNames raw data but should NOT be added as `aliases.ur`:

| slug | alias to drop | reason |
|---|---|---|
| `bahawalnagar` | `بہاولپور` | 🚨 **CRITICAL — references "Bahawalpur" (different city)**. Same semantic mismatch we fixed in names.ar. Will create cross-city search collision if added. |
| `mailsi` | `تصیل میلسی` | Admin-prefix form (matches the names.ar form we just rejected) |
| `mingora` | `مینګورہ` | Contains Pashto ګ (U+06AB) — fails clean-Urdu-script check |
| `jaranwala` | `جړانواله` | Contains Pashto ړ — fails check |
| `jaranwala` | `جڙانوالا` | Contains Sindhi ڙ — fails check |
| `jhelum` | `جێھلۆم` | Contains Kurdish ێ + ۆ — fails check |
| `pattoki` | `پتوڪي` | Contains Sindhi ڪ — fails check |
| `sambrial` | `سمبڙیال` | Contains Sindhi ڙ — fails check |
| `muridke` | `موریدک`, `مريدڪي`, `موريدكى`, `موريدكي` | Latin-letter mojibake / Sindhi ڪ — fail check |
| `jhang-sadr` | `جانغ صدر` | Same as names.ar (de-dupe noop) |
| `pasrur` | `بسرور` | Same as names.ar (de-dupe noop, Persian پ already in primary) |
| `chaman` | `جمن` | Same as names.ar (de-dupe noop) |
| `gilgit` | `كلكت` | Same as names.ar (Arabic-only form; Persian گلگت preferred) |
| `gujrat` | `غجرات` | Same as names.ar |
| `gwadar` | `جوادر` | Same as names.ar |
| `dadu` | `دادُو` ↔ `دادو` | If user prefers diacritics dropped, keep `دادُو` as alias; if kept on primary, no alias |

---

## §7. Open questions for user approval

1. **`bahawalnagar` Urdu form choice**: `بہاولنگر` (Urdu Wikipedia canonical, Layer-2) — accept? (alternative: just `بهاولنغر` matching names.ar without Urdu-specific letters — score 75)
2. **`chishtian` Urdu form choice**: `چشتیاں` (with ں retroflex, GeoNames Urdu-specific) — accept? (alternative: `چشتیان` without ں — score 90)
3. **`ahmadpur-east` Urdu form choice**: `احمد پور شرقیہ` (with Urdu ہ — Urdu Wikipedia canonical) — accept?
4. **`muridke` Urdu form choice**: `مریدکے` (with yeh-barree ے end — strong Urdu) — accept? (alternative: `مریدکی` with Persian ی — score 90)
5. **`dadu` Urdu form choice**: `دادو` (no diacritics) — accept as primary? Or keep `دادُو` (with diacritics, matches names.ar) — score 70?
6. **`muzaffarabad` Urdu form**: `مظفر آباد` (with space, matches names.ar). Keep as-is (identical-script translit)?
7. **`tordher` Urdu form**: `توردھر` (with Urdu ھ) — Layer-2 transliteration, no Urdu Wikipedia page exists. OK?
8. **`buni` Urdu form**: `بُنِی` (with diacritics from GeoNames) vs `بنی` (clean). Which is primary?
9. **`sibi` Urdu form**: `سبی` (Persian ی) — accept? (Capital of Sibi district, Balochistan)
10. **`matli` Urdu form**: `ماتلی` (Persian ی) — accept?
11. **Drop the contaminated GeoNames alias `بہاولپور` for bahawalnagar** — confirm drop?
12. **Drop `تصیل میلسی` admin-prefix alias for mailsi** — confirm drop?
13. **Drop Pashto/Sindhi/Kurdish-script aliases** (8 rows have these — see §6) — confirm drop?
14. **De-dupe noop aliases** that match names.ar bit-for-bit — confirm drop?
15. **ZWNJ-containing variants** (e.g. `رحیم‌یارخان` with U+200C) — keep as aliases or drop? Both forms reachable by users.
16. **Diacritic-heavy aliases** (e.g. `بُنِی`, `دادُو`, `تُربت`) — keep as alias OR drop entirely?

---

## §8. Acceptance criteria (for the apply phase, if approved)

When user approves and we move to merge in a follow-up phase `PLACE-NAMES-UR-PK-2-APPLY`:

1. ✅ Apply 43 user-approved `names.ur` updates
2. ✅ Apply user-approved `aliases.ur` entries (each entry per-row reviewed)
3. ❌ Do NOT touch `names.ar` (preserves ASIA-1D-PK fixes)
4. ❌ Do NOT touch `names.en`
5. ❌ Do NOT touch the 10 PK seed entries (UR-PK-1 baseline)
6. ❌ Do NOT use runtime translation / API / browser auto-translate
7. ❌ Do NOT modify server.js / js/app.js / fillLangMap / index.html
8. ✅ Idempotent re-run support
9. ✅ Pre-merge backup `curated-places.json.prePlaceNamesUrPk2.bak`

### Tests required post-merge (per user direction)

The user specified tests at apply-time:
- 43 `/ur/prayer-times-in-{slug}` pages render correct Urdu name
- 43 `/ur/moon-in-{slug}` pages render correct Urdu name
- 43 `/ur/qibla-in-{slug}` pages render correct Urdu name
- No hydration regression (post-load JS doesn't overwrite to Latin)
- No cross-page navigation regression (Urdu stays after prayer→moon→qibla clicks)

### Regression suites (must remain green)

- `_test_asia_1d_pk_search.mjs` (28/28)
- `_test_place_names_ur_pk_1.mjs` (38/38)
- `_test_place_names_ur_af_1.mjs` (41/41)
- `_test_place_names_ur_ir_1.mjs` (66/66)
- `_test_place_names_cross_page_navigation_consistency_fix_1.mjs` (28/28)
- `_test_place_names_sitewide_template_consistency_fix_1.mjs` (26/26)
- `_test_place_names_homepage_default_city_l10n_fix_1.mjs` (33/33)
- ...all other prior closed phases
- `_test_search_place_endpoint.mjs` (659/659 on rate-limit retry)

---

## Status: 🟡 AWAITING USER REVIEW

**Next steps**:
1. User reviews all 43 rows in §1 (override any per-row proposals as needed)
2. User answers the 16 open questions in §7
3. After approval, follow-up phase `PLACE-NAMES-UR-PK-2-APPLY` will create `scripts/geodata/_place_names_ur_pk_2_apply.mjs` mirroring the AF/IR/PK-1 apply pattern, run idempotently with backup, and run the full test suite.

**Until approval**: NO data mutation occurs. This is a pure design document.

**Confirmed NOT touched in this review**:
- `curated_places.json` ✓
- `names.ar` / `names.en` for any entry ✓
- `server.js` / `js/app.js` ✓
- `fillLangMap` ✓
- `index.html` ✓
- 10 PK seed entries (UR-PK-1 baseline preserved) ✓
- The 3 NAME_AR_FIXES from ASIA-1D-PK (`bahawalnagar`/`mailsi`/`chishtian` names.ar) preserved ✓

**No runtime translation. No translation API. No AI translation on page load. No browser auto-translate.**
