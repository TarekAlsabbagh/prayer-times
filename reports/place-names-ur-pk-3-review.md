# PLACE-NAMES-UR-PK-3 — Review report (fifth Urdu enrichment batch)

**Phase**: Review-only (NO data mutation)
**Date**: 2026-05-19
**Status**: design — awaiting user per-row approval
**Country**: Pakistan (`pk`) only — 17 ASIA-1D-PK-MCF entries
**Scope**: 17 curated PK entries that came in via ASIA-1D-PK-MCF (`a75bea7`) with `names.ur` ABSENT (per fillLangMap guard at write-time)
**Predecessors**:
- `PLACE-NAMES-UR-AF-1` (closed) — first Urdu wave (36 AF)
- `PLACE-NAMES-UR-IR-1-APPLY` (closed) — second Urdu wave (41 IR)
- `PLACE-NAMES-UR-PK-1-APPLY` (closed) — third Urdu wave (3 aliases on existing 10 PK seed)
- `PLACE-NAMES-UR-PK-2-APPLY` (closed `3594f4e`) — fourth Urdu wave (43 ASIA-1D-PK clean)
- `ASIA-1D-PK-MCF` (closed `a75bea7`) — merged the 17 blocked-major PK cities

**Out-of-scope (per user direction)**:
- 10 PK seed entries already have real Urdu — NOT touched
- 43 ASIA-1D-PK clean entries already have real Urdu (UR-PK-2) — NOT touched
- `names.ar` (preserves ASIA-1D-PK + MCF NAME_AR_FIXES) — NOT touched
- `names.en` — NOT touched
- `server.js` / `js/app.js` / `fillLangMap` / `index.html` / `curated_places.json` → NO changes until approval
- 98 missing-ar majors (held for ASIA-1D-PK-MISSING-AR-MAJORS-1)
- ASIA-1D-BD / ASIA-1D-IN / ASIA-1F / AMERICAS-1B-MCF / search-ranking / DELETE-V1 — NOT started

---

## §0. Current state

```
PK count: 70
  10 seed entries           — Urdu real (UR-PK-1)
  43 ASIA-1D-PK clean       — Urdu real (UR-PK-2)
  17 ASIA-1D-PK-MCF entries — names.ur ABSENT — this phase proposes them
```

Server's `_pickCuratedName(entry, 'ur')` currently falls back to `names.en` (Latin) for these 17 cities on `/ur/` pages. Once approved + applied, they'll render real Urdu — completing PK Urdu coverage to **70/70 = 100%**.

---

## Methodology (same as UR-AF-1 / UR-IR-1 / UR-PK-1 / UR-PK-2)

Each candidate name derived from three layers in priority order:

1. **GeoNames `alternatenames`** filtered to Persian/Urdu script — entries that contain Arabic-block chars AND use at least one Persian/Urdu-only letter (`پ چ ژ گ ک ی ہ ے ھ ٹ ڈ ڑ ں ؤ`). Strongest Layer-1 source.
2. **Urdu Wikipedia canonical** — used when GeoNames returns ambiguous variants OR Layer-1 yields nothing distinctive.
3. **Layer-2 transliteration** — when Layers 1–2 yield nothing, mechanical transliteration from `names.ar`.

### qualityScore rubric (identical to prior Urdu waves)

| Score | Trigger |
|---:|---|
| 95 | GeoNames Persian-script candidate using Urdu-specific letter (ہ/ٹ/ڈ/ڑ/ں/ھ/ؤ/ے) AND matches Urdu Wikipedia canonical |
| 90 | GeoNames Persian-script candidate with strong consensus (no ambiguous variants) |
| 85 | Manual Urdu Wikipedia override (no usable GeoNames alternatename) |
| 80 | Layer-2 + Urdu Wikipedia |
| 75 | Identical-script (ar = ur) |

### 🚨 CRITICAL: 7 of 17 cities just got NAME_AR_FIXES in ASIA-1D-PK-MCF

For these 7, the `names.ar` was just user-fixed. The Urdu forms can use DIFFERENT script (Urdu allows retroflex ں/ٹ/ڈ/ڑ/ھ that we DROPPED from Arabic). This is correct — names.ar = clean Arabic, names.ur = real Urdu with retroflex letters.

| slug | names.ar (post-MCF) | names.ur proposed | distinction |
|---|---|---|---|
| `bannu` | بنو (clean, no ں) | **بنوں** 🆕 (with Urdu ں) | Urdu wisely uses ں retroflex; Arabic doesn't |
| `dera-ghazi-khan` | ديرة غازي خان (tah-marbuta) | **ڈیرہ غازی خان** 🆕 (Urdu ڈ + ہ + Persian ی) | Strong Urdu retroflex form |
| `kharian` | كهاريان (ں→ن) | **کھاریاں** 🆕 (with Urdu ھ + ں) | Restore ں in Urdu |
| `chunian` | جونيان (admin prefix stripped) | **چونیاں** 🆕 (Persian چ + Urdu ں) | Stronger Urdu |
| `gujar-khan` | غوجر خان (ں dropped in AR) | **گجر خاں** 🆕 (Persian گ + Urdu ں) | Urdu ں restored |
| `rohri` | روهري (clean Arabic) | **روہڑی** 🆕 (Urdu ہ + ڑ retroflex) | Strong Urdu form |
| `rawalakot` | راولاكوت (clean Arabic) | **راولاکوٹ** 🆕 (Persian ک + Urdu retroflex ٹ) | Strong Urdu form |

This is the user's specific instruction: "**لا تستخدم Arabic names كـ Urdu إذا كانت هناك صيغة Urdu أوضح**" (don't use Arabic names as Urdu if a clearer Urdu form exists).

---

## §1. Per-row review table — all 17 PK MCF cities

Legend:
- 🆕 in `proposed.ur` = uses Urdu-specific letter (ہ/ٹ/ڈ/ڑ/ں/ھ/ؤ/ے) — strongest "actually Urdu" signal
- ⭐ in `slug` column = user-listed for special attention (11 cities)

| ⭐ | slug | names.en | names.ar | **proposed names.ur** | source | method | qualityScore | aliases.ur | notes |
|:-:|---|---|---|---|---|---|:-:|---|---|
| ⭐ | `gujranwala` | Gujranwala | غوجرانوالا | **گوجرانوالہ** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian گ) | 95 | `گوجرانوالا` (Persian ا variant) | Strong Urdu form. Pakistan's 5th-largest city. |
| ⭐ | `bannu` | Bannu | بنو | **بنوں** 🆕 | GeoNames | urdu-alternatename (Urdu retroflex ں) | 95 | `بنّو` (with shadda — variant; drop unless preferred) | Strong Urdu form with retroflex ں. **DIFFERENT from names.ar** (which dropped ں per user §2 in MCF). |
| ⭐ | `sahiwal` | Sahiwal | ساهيوال | **ساہیوال** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian ی) | 95 | `ساهیوال` (Arabic ه + Persian ی variant), `ساہِيوال` (with-diacritics — drop?) | Strong Urdu form. |
| ⭐ | `dera-ghazi-khan` | Dera Ghazi Khan | ديرة غازي خان | **ڈیرہ غازی خان** 🆕 | GeoNames | urdu-alternatename (Urdu retroflex ڈ + ہ + Persian ی) | 95 | `دیرہ غازی خان` (without retroflex ڈ — drop?) | Strong Urdu form with retroflex ڈ. |
| ⭐ | `chiniot` | Chiniot | جنيوت | **چنیوٹ** 🆕 | GeoNames | urdu-alternatename (Urdu retroflex ٹ + Persian چ + ی) | 95 | `چنیوت` (without retroflex ٹ — drop?) | Strong Urdu form. |
| ⭐ | `muzaffargarh` | Muzaffargarh | مظفر غره | **مظفر گڑھ** 🆕 | GeoNames | urdu-alternatename (Persian گ + retroflex ڑ + Urdu ھ — "garh" = town) | 95 | `مظفر گره` (without retroflex ڑ — drop?) | Strong Urdu form. "Garh" = town/fort suffix in Urdu/Hindi. |
| ⭐ | `jacobabad` | Jacobabad | جيكب آباد | **جیکب آباد** | GeoNames | persian-alternatename (Persian ی + ک) | 90 | `جیکب اباد` (no-madda variant), `جیکب‌آباد` (with ZWNJ — drop?) | No Urdu-specific letter; Persian ی + ک used. |
| ⭐ | `umarkot` | Umarkot | أمركوت | **عمرکوٹ** 🆕 | manual + Urdu Wikipedia | urdu-canonical (Urdu retroflex ٹ + Persian ک + Arabic ع for ʿUmar) | 85 | `امرکوت` (without ع variant — drop?) | Manual Wikipedia override. Wikipedia Urdu canonical for "Umarkot" uses ع (denoting the name of Caliph Umar). |
|   | `new-mirpur-city` | New Mirpur City | نيا ميربر شهر | **نیا میرپر شہر** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian پ + ی) | 95 | `میرپور` (short form variant) | Strong Urdu form. AJK capital area. |
|   | `badin` | Badin | بدين | **بدین** | layer-2 + Urdu Wikipedia | urdu-canonical (Persian ی) | 85 | — | Wikipedia Urdu uses بدین with Persian ی. Sindh city. |
| ⭐ | `kharian` | Kharian | كهاريان | **کھاریاں** 🆕 | GeoNames | urdu-alternatename (Urdu ھ + Persian ی + retroflex ں) | 95 | `کھاریان` (without ں variant — drop?) | Strong Urdu form. **DIFFERENT from names.ar** (which converted ں→ن). |
|   | `gujar-khan` | Gujar Khan | غوجر خان | **گجر خاں** 🆕 | GeoNames | urdu-alternatename (Persian گ + retroflex ں) | 95 | `گوجر خان` (without retroflex ں), `گوجرخان` (no-space) | Strong Urdu form. **DIFFERENT from names.ar** (which dropped ں). |
|   | `lala-musa` | Lala Musa | لاله موسي | **لالہ موسی** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + Persian ی) | 95 | `لالہ موسیٰ` (with alif-superscript variant — drop?) | Strong Urdu form. |
| ⭐ | `chunian` | Chunian | جونيان | **چونیاں** 🆕 | GeoNames | urdu-alternatename (Persian چ + Persian ی + retroflex ں) | 95 | `چونیان` (without ں variant — drop?), `چنيان` (Arabic ي variant — drop?) | Strong Urdu form. |
|   | `chitral` | Chitral | جترال | **چترال** | GeoNames | persian-alternatename (Persian چ) | 90 | `چیترال` (Persian ی variant) | Wikipedia Urdu canonical. KP city. |
| ⭐ | `rohri` | Rohri | روهري | **روہڑی** 🆕 | GeoNames | urdu-alternatename (Urdu ہ + retroflex ڑ + Persian ی) | 95 | — | Strong Urdu form. Sindh city near Sukkur. |
| ⭐ | `rawalakot` | Rawalakot | راولاكوت | **راولاکوٹ** 🆕 | GeoNames | urdu-alternatename (Persian ک + Urdu retroflex ٹ) | 95 | `راولا کوٹ` (with-space variant — keep) | Strong Urdu form. Azad Kashmir district capital. |

---

## §2. qualityScore distribution

| score | count | rows |
|:-:|---:|---|
| 95 | **13** | gujranwala, bannu, sahiwal, dera-ghazi-khan, chiniot, muzaffargarh, new-mirpur-city, kharian, gujar-khan, lala-musa, chunian, rohri, rawalakot |
| 90 | **2** | jacobabad, chitral |
| 85 | **2** | umarkot, badin |
| 75 | 0 | — |

**Total**: 13 + 2 + 2 = **17** ✓

**🏆 13/17 (76%) use Urdu-specific letters** — second-highest density behind UR-PK-1 (8/10 = 80% but only 10 cities). Higher than UR-PK-2 (44%), UR-IR-1 (32%), and UR-AF-1 (25%).

This reflects that **all 17 are major populated cities with rich Wikipedia Urdu coverage** — almost every entry has a GeoNames Urdu-script alternatename ready to promote.

---

## §3. Source breakdown

| Source | Method | Rows | Notes |
|---|---|---:|---|
| GeoNames | `urdu-alternatename` (with Urdu-specific letter) | **13** | All score-95 rows |
| GeoNames | `persian-alternatename` (Layer 1, no Urdu-specific) | **2** | jacobabad, chitral |
| Layer-2 + Urdu Wikipedia | `urdu-canonical` | **2** | umarkot (with ع), badin (with Persian ی) |

**Total**: 13 + 2 + 2 = **17** ✓

---

## §4. Watch-list cities (11 user-listed)

All 11 user-listed cities receive `qualityScore ≥ 85`:

| slug | proposed.ur | qualityScore | Urdu-specific? |
|---|---|:-:|:-:|
| `gujranwala` | گوجرانوالہ 🆕 | 95 | ✅ ہ |
| `bannu` | بنوں 🆕 | 95 | ✅ ں retroflex |
| `sahiwal` | ساہیوال 🆕 | 95 | ✅ ہ |
| `dera-ghazi-khan` | ڈیرہ غازی خان 🆕 | 95 | ✅ ڈ + ہ |
| `chiniot` | چنیوٹ 🆕 | 95 | ✅ ٹ |
| `muzaffargarh` | مظفر گڑھ 🆕 | 95 | ✅ ڑ + ھ |
| `jacobabad` | جیکب آباد | 90 | (Persian ی + ک) |
| `umarkot` | عمرکوٹ 🆕 | 85 | ✅ ٹ |
| `badin` | بدین | 85 | (Persian ی) |
| `kharian` | کھاریاں 🆕 | 95 | ✅ ھ + ں |
| `rawalakot` | راولاکوٹ 🆕 | 95 | ✅ ٹ |

---

## §5. Aliases proposed for preservation after merge

**Total useful aliases**: ~12 across 11 rows.

### Variant aliases (script differences kept for search continuity)

| slug | aliases.ur to keep | reason |
|---|---|---|
| `gujranwala` | `گوجرانوالا` | Persian ا-end variant (without final ہ) |
| `sahiwal` | `ساهیوال` | Arabic ه + Persian ی variant |
| `gujar-khan` | `گوجر خان`, `گوجرخان` | Non-retroflex + no-space variants (matches names.ar form post-MCF for search continuity) |
| `new-mirpur-city` | `میرپور` | Short form |
| `rawalakot` | `راولا کوٹ` | With-space variant |
| `chitral` | `چیترال` | Persian ی-i variant |
| `jacobabad` | `جیکب اباد` | No-madda variant |
| `dera-ghazi-khan` | `دیرہ غازی خان` | Without retroflex ڈ variant (matches names.ar tah-marbuta form post-MCF would-be `دیرہ` — actually Urdu Wikipedia uses ڈیرہ so this is just an alt) |
| `chiniot` | `چنیوت` | Without retroflex ٹ |
| `muzaffargarh` | `مظفر گرہ` | Without retroflex ڑ |
| `kharian` | `کھاریان` | Without ں variant |
| `chunian` | `چونیان` | Without ں variant |

(Each retroflex variant has a non-retroflex alias for users typing without diacritics.)

---

## §6. Aliases EXPLICITLY DROPPED — propose for review

These appear in GeoNames raw data but should NOT be added as `aliases.ur`:

| slug | dropped alias | reason |
|---|---|---|
| `bannu` | `بنّو` (with shadda) | Diacritic-heavy variant (user prefers no shadda based on names.ar choice) |
| `sahiwal` | `ساہِيوال` | Diacritics-heavy (kasra mark) |
| `sahiwal` | `ساهیوال، پاکستان` | Country suffix |
| `dera-ghazi-khan` | `ډېره غازي خان` | Pashto ډ + ې — fails clean-Urdu-script check |
| `dera-ghazi-khan` | `دیره غازی‌خان، پاکستان` | Country suffix + ZWNJ |
| `chiniot` | `چنيوټ` | Pashto ټ |
| `chiniot` | `چنیوت، پاکستان` | Country suffix |
| `muzaffargarh` | `مظفر گره، پاکستان` | Country suffix |
| `jacobabad` | `jyڪb abad` | Latin mojibake + Sindhi ڪ |
| `jacobabad` | `جيڪب آباد` | Sindhi ڪ |
| `jacobabad` | `جیکب‌آباد، پاکستان` | ZWNJ + country suffix |
| `umarkot` | `amrڪwٽ`, `امرڪوٽ` | Latin mojibake + Sindhi ڪ + ٽ |
| `new-mirpur-city` | (no extra polluted) | — |
| `lala-musa` | `لالہ موسیٰ` | Alif-with-superscript U+0670 (diacritic-heavy) |
| `lala-musa` | `لاله موسيٰ` | Arabic ه + alif-superscript variant |
| `chunian` | `تصیل چونیاں` | Admin prefix (same as mailsi in clean merge) |
| `chitral` | `چھترار` | Semantic mismatch (different word — was dropped in MCF for AR too) |
| `rohri` | `روھڙي`, `rwھڙy` | Sindhi ڙ / Latin mojibake |

**Total dropped**: ~17 polluted aliases across 11 rows.

---

## §7. Open questions for user approval

1. **`bannu` Urdu form**: `بنوں` (Wikipedia Urdu with ں retroflex) — accept? (Note: names.ar is `بنو` per user §2 in MCF, but Urdu allows ں which Arabic doesn't — semantically same name, different script.)
2. **`dera-ghazi-khan` Urdu form**: `ڈیرہ غازی خان` (with retroflex ڈ) — accept? (Names.ar is `ديرة غازي خان` with tah-marbuta; the Urdu form uses retroflex ڈ which is more "Urdu" than the Arabic plain د.)
3. **`kharian` Urdu form**: `کھاریاں` (with Urdu ھ + ں) — accept? (Names.ar is `كهاريان` per user §5; the Urdu form restores ں retroflex.)
4. **`umarkot` Urdu form**: `عمرکوٹ` (Wikipedia Urdu with ع for "ʿUmar" + retroflex ٹ) — accept? (Names.ar is `أمركوت` with initial hamza-on-alif; Urdu uses Arabic ع.)
5. **`badin` Urdu form**: `بدین` (Wikipedia Urdu with Persian ی) — accept?
6. **`gujar-khan` Urdu form**: `گجر خاں` (with Persian گ + retroflex ں) — accept? (Names.ar dropped ں; Urdu restores it.)
7. **`rohri` Urdu form**: `روہڑی` (Wikipedia Urdu with retroflex ڑ) — accept?
8. **`rawalakot` Urdu form**: `راولاکوٹ` (with retroflex ٹ) — accept?
9. **`chunian` Urdu form**: `چونیاں` (with Persian چ + ی + retroflex ں) — accept?
10. **All retroflex variants** (non-retroflex aliases): keep as searchable aliases? (gujranwala, dera-ghazi-khan, chiniot, muzaffargarh, kharian, chunian — each has non-retroflex variant in §5)
11. **Drop all country-suffix aliases** (5 rows have `، پاکستان` forms): confirm drop?
12. **Drop all Pashto/Sindhi/Kurdish aliases** (4 rows have ډ/ې/ڪ/ڙ/ٽ): confirm drop?
13. **Drop semantic mismatch `چھترار` for chitral**: confirm drop?
14. **Drop diacritics-heavy variants** (shadda on bannu, kasra on sahiwal, alif-superscript on lala-musa): confirm drop?
15. **Drop admin-prefix `تصیل چونیاں` for chunian**: confirm drop?

---

## §8. Acceptance criteria (for the apply phase, if approved)

When user approves and we move to merge via `PLACE-NAMES-UR-PK-3-APPLY`:

1. ✅ Apply 17 user-approved `names.ur` updates
2. ✅ Apply user-approved `aliases.ur` entries (each entry per-row reviewed)
3. ❌ Do NOT touch `names.ar` (preserves ASIA-1D-PK-MCF NAME_AR_FIXES)
4. ❌ Do NOT touch `names.en`
5. ❌ Do NOT touch 10 PK seed entries (UR-PK-1 baseline)
6. ❌ Do NOT touch 43 ASIA-1D-PK clean entries (UR-PK-2 baseline)
7. ❌ Do NOT touch `server.js` / `js/app.js` / `fillLangMap` / `index.html`
8. ❌ No runtime translation
9. ✅ Pre-merge backup `curated-places.json.prePlaceNamesUrPk3.bak`
10. ✅ Idempotent re-run support

### Tests required post-merge

- Spot-check `/ur/prayer-times-in-{slug}` for all 17 (renders correct Urdu)
- Spot-check `/ur/moon-in-{slug}` and `/ur/qibla-in-{slug}` for top 5 (cross-route navigation preserves Urdu)
- All carry-forward suites stay green (currently 1,495/1,495 across 26 suites)

### Expected post-merge state

| Category | Count | Coverage |
|---|---:|:-:|
| PK total | 70 | — |
| PK Arabic | 70/70 | ✅ 100% |
| **PK Urdu (after UR-PK-3)** | **70/70** | **✅ 100% ⭐** |
| Blocked queue | 0 | — |
| Missing-ar deferred | 98 | (held — ASIA-1D-PK-MISSING-AR-MAJORS-1) |

**This phase brings PK to FULL Urdu coverage** — 70/70 — closing the gap left by ASIA-1D-PK-MCF.

---

## Status: 🟡 AWAITING USER REVIEW

**Next steps**:
1. User reviews all 17 rows in §1 (override any per-row proposals as needed)
2. User answers the 15 open questions in §7
3. After approval, follow-up phase `PLACE-NAMES-UR-PK-3-APPLY` will create the apply script mirroring UR-PK-2 pattern, run idempotently with backup, and run the full test suite.

**Until approval**: NO data mutation occurs. This is a pure design document.

**Confirmed NOT touched in this review**:
- `curated_places.json` ✓
- `names.ar` / `names.en` for any entry ✓
- 10 PK seed entries ✓
- 43 ASIA-1D-PK clean entries ✓
- `server.js` / `js/app.js` / `fillLangMap` / `index.html` ✓
- All 7 ASIA-1D-PK-MCF NAME_AR_FIXES preserved ✓

**No runtime translation. No translation API. No AI translation on page load. No browser auto-translate.**
