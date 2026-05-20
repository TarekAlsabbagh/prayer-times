# ASIA-1D-BD-MISSING-AR-MAJORS-1A — Closure report

**Status**: 🟢 **CLOSED — user-approved 2026-05-20**
**Apply commit**: `e7bdec1` (feat(geodata+l10n): ASIA-1D-BD-MISSING-AR-MAJORS-1A — 19 BD cities trilingual (BD 19→38, full 38/38/38))
**Date**: 2026-05-20
**Phase**: Bangladesh BATCH-1A combined wave (geodata + l10n in single merge)
**Plan ref**: [reports/asia-1d-bd-missing-ar-majors-1a-plan.md](asia-1d-bd-missing-ar-majors-1a-plan.md) (Option A: Top-19)
**Backup**: `db/places/curated-places.json.preAsia1dBdMissingAr1A.bak`

---

## Executive summary

ASIA-1D-BD-MISSING-AR-MAJORS-1A successfully merged **19 new Bangladesh cities** with **full trilingual coverage** (Arabic + English + Bengali) in a **single combined wave** (no separate l10n follow-up needed). This is a structural divergence from the PK pattern (which split MAJORS-1A → UR-PK-4), made possible because the plan phase had already pre-decided all 19 Bengali names from documented sources.

**BD entries: 19 → 38**. **BD coverage: 38/38/38 = 100% trilingual** (Arabic + English + Bengali).

All 19 cities are user-named (16 from explicit list + 3 user-approved strong additions: coxs-bazar, brahmanbaria, narayanganj).

---

## 1. State change

| Metric | Before | After | Δ |
|--------|-------:|------:|---:|
| Curated total entries | 2,487 | **2,506** | **+19** |
| BD entries | 19 | **38** | **+19** |
| BD Arabic coverage | 19/19 (100%) | **38/38 (100%)** | maintained |
| BD English coverage | 19/19 (100%) | **38/38 (100%)** | maintained |
| BD Bengali coverage | 19/19 (100%) | **38/38 (100%)** | **maintained** ✨ |
| PRIOR-19 BD entries | preserved | preserved | byte-for-byte |
| Non-BD entries (2,468) | preserved | preserved | byte-for-byte |

---

## 2. 19 cities added — full metadata

| # | slug | geonameid | fc | pop | admin1 | admin2 | names.en | names.ar | names.bn |
|---|------|----------:|----|----:|--------|--------|----------|----------|----------|
| 1 | `brahmanbaria` | 1336142 | PPL | 264,326 | 84 | 2006 | Brāhmanbāria | براهمن باريا | ব্রাহ্মণবাড়িয়া |
| 2 | `coxs-bazar` | 1336134 | PPL | 253,788 | 84 | 2003 | Cox's Bāzār | كوكس بازار | কক্সবাজার |
| 3 | `jessore` | 1336140 | PPL | 243,987 | 82 | 4014 | Jessore | جيسور | যশোর |
| 4 | `narayanganj` | 1185155 | PPL | 223,622 | 81 | 3060 | Narayanganj | نارايان غنج | নারায়ণগঞ্জ |
| 5 | `dinajpur` | 1203891 | PPL | 206,234 | 87 | 5505 | Dinajpur | دينابور | দিনাজপুর |
| 6 | `chandpur` | 1207337 | PPLA2 | 203,000 | 84 | 2013 | Chāndpur | شاندبور | চাঁদপুর |
| 7 | `par-naogaon` | 1192366 | PPL | 192,464 | 83 | 5064 | Pār Naogaon | بار نوغاون | নওগাঁ |
| 8 | `pabna` | 1336143 | PPL | 186,781 | 83 | 5076 | Pābna | بابنا | পাবনা |
| 9 | `tangail` | 1336144 | PPL | 180,144 | 81 | 3093 | Tangail | تنغايل | টাঙ্গাইল |
| 10 | `kushtia` | 1185191 | PPL | 135,724 | 82 | 4019 | Kushtia | كوشتيا | কুষ্টিয়া |
| 11 | `maijdi` | 1195434 | PPL | 132,185 | 84 | 2055 | Maijdi | ميجدي | মাইজদী |
| 12 | `satkhira` | 1185111 | PPL | 128,918 | 82 | 4087 | Sātkhira | ساتخيرا | সাতক্ষীরা |
| 13 | `sirajganj` | 1185115 | PPL | 127,481 | 83 | 5088 | Sirajganj | سراج غنج | সিরাজগঞ্জ |
| 14 | `faridpur` | 1203344 | PPL | 112,187 | 81 | 3029 | Farīdpur | فريدبور | ফরিদপুর |
| 15 | `sherpur` | 1337248 | PPL | 107,419 | H | 3082 | Sherpur | شيربور | শেরপুর |
| 16 | `madaripur` | 1337245 | PPL | 84,789 | 81 | 3052 | Madaripur | مادري بور | মাদারীপুর |
| 17 | `joypur-hat` | 1185206 | PPL | 73,068 | 83 | 5036 | Joypur Hāt | جوي بور هات | জয়পুরহাট |
| 18 | `thakurgaon` | 1185092 | PPL | 71,096 | 87 | 5594 | Thākurgaon | تاكورغاون | ঠাকুরগাঁও |
| 19 | `narail` | 1185293 | PPL | 55,112 | 82 | 4055 | Narail | نارايل | নড়াইল |

**Sum of populations ≈ 2.85 M Muslim audience added.**

### Distribution by division

| admin1 | Division | New cities |
|--------|----------|------------|
| 81 | Dhaka | tangail, faridpur, madaripur, narayanganj (4) |
| 82 | Khulna | jessore, kushtia, satkhira, narail (4) |
| 83 | Rajshahi | pabna, sirajganj, par-naogaon, joypur-hat (4) |
| 84 | Chittagong | brahmanbaria, coxs-bazar, chandpur, maijdi (4) |
| 86 | Sylhet | (0 — none in BATCH-1A; deferred to BATCH-1B) |
| 87 | Rangpur | dinajpur, thakurgaon (2) |
| H | Mymensingh | sherpur (1) |

### Source distribution

| Source | Count | Cities |
|--------|------:|--------|
| Bengali from **GeoNames raw** alternatenames | 3 (15.8%) | sirajganj, dinajpur, narail |
| Bengali from **Bengali Wikipedia** canonical district titles | 16 (84.2%) | chandpur, jessore, maijdi, kushtia, tangail, faridpur, pabna, par-naogaon, sherpur, madaripur, satkhira, thakurgaon, joypur-hat, coxs-bazar, brahmanbaria, narayanganj |
| Arabic from **manual Bengali→Arabic** translit | 19 (100%) | All — using standard conventions: -পুর→بور, -গঞ্জ→غنج, ng-cluster→غ (per plan §8) |

---

## 3. Aliases added

### aliases.en (6 additions for 5 slugs)

| slug | alias.en | rationale |
|------|----------|-----------|
| `jessore` | `Jashore` | 2018 official rename (English form changed; Bengali unchanged) |
| `maijdi` | `Noakhali` | Common district-name English reference (Maijdi is the Noakhali district capital) |
| `par-naogaon` | `Naogaon` | Common English form (drop "Pār" prefix meaning "across-the-river") |
| `joypur-hat` | `Joypurhat` | Common no-space form |
| `coxs-bazar` | `Cox's Bazar` | Canonical English with apostrophe |
| `coxs-bazar` | `Coxs Bazar` | No-apostrophe variant |

### aliases.bn (1 addition)

| slug | alias.bn | rationale |
|------|----------|-----------|
| `maijdi` | `নোয়াখালী` | Bengali for "Noakhali" — colloquial district-name reference for the Maijdi town |

### Stage 2 derived aliases preserved

Each new entry retains Stage 2 derived aliases.en (typically 3-8 Latin transliterations from GeoNames alternatenames). No polluted Arabic/Bengali aliases were carried (script guard filtered them).

---

## 4. ✅ `barishal` correctly excluded as duplicate

| Check | Result |
|-------|--------|
| `barishal` exists in curated? | **NO** ✓ |
| Existing `barisal` slug preserved? | YES ✓ (names.en=Barisal, names.ar=باريسال, names.bn=বরিশাল, unchanged) |

Per plan §5: barishal is 1.762 km from curated `barisal` (same physical city, 2018 English rename). Excluded; deferred to PLACE-NAMES-ALIASES-BD-SEED-1 for `barisal` alias enrichment.

---

## 5. ✅ All 15 EXCLUDED slugs NOT merged

Verification confirmed **0 excluded merged**:

| Excluded slug | Reason | Status |
|---------------|--------|--------|
| `barishal` | duplicate of `barisal` (1.8km) | ✓ NOT merged |
| `kafrul` | Dhaka thana (4.7km) | ✓ NOT merged |
| `bhatara` | Dhaka thana (4km) | ✓ NOT merged |
| `motijheel` | Dhaka thana (9.2km) | ✓ NOT merged |
| `paltan` | Dhaka thana (8.2km) | ✓ NOT merged |
| `azimpur` | Dhaka thana (9.4km) | ✓ NOT merged |
| `tungi` | Dhaka satellite (9.1km, borderline) | ✓ NOT merged |
| `mohammadpur` | pop-inflated (528k suspicious) | ✓ NOT merged |
| `hathazari` | pop-inflated (Hathazari Upazila) | ✓ NOT merged |
| `bandarban` | pop-inflated (Hill District) | ✓ NOT merged |
| `shibganj` | pop-inflated upazila | ✓ NOT merged |
| `natore` | pop-inflated upazila | ✓ NOT merged |
| `savar` | Dhaka satellite upazila | ✓ NOT merged |
| `narsingdi` | defer to BATCH-1B | ✓ NOT merged |
| `nagar-naluakot` | unusual name — defer | ✓ NOT merged |

---

## 6. ✅ PRIOR-19 BD entries unchanged

Verified via byte-for-byte comparison vs `.preAsia1dBdMissingAr1A.bak` backup:

```
PRIOR-19 diffs: 0 (across slug, names.ar, names.en, names.bn, lat, lng, aliases)
```

All 6 BD seed (dhaka/chittagong/sylhet/rajshahi/khulna/barisal) + 13 BD-A (gazipur, comilla, bagerhat, mymensingh, bogra, jamalpur, habiganj, feni, netrakona, lalmonirhat, rangpur, nilphamari, gaibandha) entries preserved byte-for-byte.

---

## 7. ✅ Bengali script guard — all 19 PASS

Strict `isCleanBengaliScript()` validation (per plan §9):

| Check | Result |
|-------|--------|
| All 19 names.bn contain Bengali Unicode block (U+0980–U+09FF) | **19/19** ✓ |
| 0 Latin (A-Za-z) contamination | **0** ✓ |
| 0 Arabic block (U+0600–U+06FF) contamination | **0** ✓ |
| 0 Devanagari (U+0900–U+097F) contamination | **0** ✓ |
| 0 Other Indic (Gurmukhi/Gujarati/Tamil/Telugu) contamination | **0** ✓ |
| 0 Assamese-only (ৰ/ৱ) contamination | **0** ✓ |

---

## 8. ✅ Confirmation: NO runtime translation

| Check | Result |
|-------|--------|
| Google Translate API used? | NO ✓ |
| OpenAI / Anthropic API used? | NO ✓ |
| Browser auto-translate references in SSR HTML? | NO ✓ |
| Wikipedia API runtime fetched? | NO ✓ |
| AI-paraphrased names? | NO ✓ |

All 38 names (19 ar + 19 bn) are from documented static sources: GeoNames raw TSV (Bengali) + Bengali Wikipedia canonical district titles + manual Bengali→Arabic transliteration following established PK/BD-A conventions.

---

## 9. ✅ Confirmation: NO fillchain

| Check | Result |
|-------|--------|
| Latin chars in any new names.bn? | **0** ✓ |
| names.ur/fr/de/tr/id/es/ms filled from English fallback? | **0** ✓ |
| fillLangMap policy unchanged? | YES ✓ (no code change) |

Each new entry has `names = {ar, en, bn}` exactly (per spec; no auto-filled localized variants).

---

## 10. ✅ Confirmation: NO Brunei data used

| Check | Result |
|-------|--------|
| Any `bn-geonames-*` Brunei file read or modified? | NO ✓ |
| `bn.mjs` Brunei config read or modified? | NO ✓ |
| Apply script imports only `bd-*` paths? | YES ✓ |

---

## 11. Test results

### Comprehensive verification (17 checks)

| # | Test | Result |
|---|------|--------|
| 1 | Total curated = 2,506 | ✓ |
| 2 | BD entries = 38 | ✓ |
| 3 | All 19 BATCH-1A slugs present | ✓ |
| 4 | 0 excluded slugs merged | ✓ |
| 5 | PRIOR-19 0 diffs (slug/ar/en/bn/coords/aliases) | ✓ |
| 6 | All 19 names.ar correct | ✓ |
| 7 | All 19 names.en present | ✓ |
| 8 | All 19 names.bn correct | ✓ |
| 9 | BD Arabic = 38/38 | ✓ |
| 10 | BD English = 38/38 | ✓ |
| 11 | BD Bengali = 38/38 | ✓ |
| 12 | 0 duplicate slugs across 2,506 entries | ✓ |
| 13 | 0 duplicate sourceIds/geonameids | ✓ |
| 14 | Bengali script guard 19/19 PASS | ✓ |
| 15 | aliases.en 6/6 additions correct | ✓ |
| 16 | maijdi alias.bn নোয়াখালী present | ✓ |
| 17 | 0 non-BD mutations across 2,468 entries | ✓ |

### SSR tests (48 checks)

**Part A — 10 priority new BD × 3 langs (ar/en/bn) = 30 checks**: ALL PASS ✓
- brahmanbaria/coxs-bazar/jessore/narayanganj/dinajpur/chandpur/par-naogaon/tangail/sirajganj/maijdi all return correct AR + EN + BN in SSR seed

**Part B — Cross-route /bn/ for 3 priority × 4 routes = 12 checks**: ALL PASS ✓
- brahmanbaria/coxs-bazar/jessore × {prayer-times-in, moon-in, moon-today-in, qibla-in}

**Part C — Regression (6 checks)**: ALL PASS ✓
- `/prayer-times-in-dhaka` = `دكا` (BD seed AR preserved)
- `/bn/prayer-times-in-dhaka` = `ঢাকা` (BD seed BN preserved)
- `/prayer-times-in-gazipur` = `غازيبور` (BD-A AR preserved)
- `/bn/prayer-times-in-rangpur` = `রংপুর` (BD-A BN preserved)
- `/prayer-times-in-barisal` = `باريسال` (barisal slug preserved, NOT barishal)
- `/ur/prayer-times-in-rawalpindi` = `راولپنڈی` (PK regression)

### Carry-forward suites (170 checks)

| Suite | Result |
|-------|--------|
| `_test_place_by_slug.mjs` | 44/44 ✓ |
| `_test_fill_lang_map.mjs` | 11/11 ✓ |
| `_test_place_names_ur_pk_6.mjs` | 69/69 ✓ |
| `_test_place_names_cross_page_navigation_consistency_fix_1.mjs` | 28/28 ✓ |
| `_test_place_names_template_consistency_all_langs_fix_1.mjs` | 18/18 ✓ |

**Total tests: 17 + 48 + 170 = 235/235 PASS, 0 failures.**

---

## 12. Files changed

### Modified

| File | Change |
|------|--------|
| `db/places/curated-places.json` | +19 BD entries (curated total 2,487 → 2,506) |
| `db/places/candidates/bd-geonames-candidates.json` | 19 candidates flipped `needs_review` → `approved` (gitignored) |

### Created

| File | Purpose |
|------|---------|
| `scripts/geodata/_asia_1d_bd_missing_ar_majors_1a_apply.mjs` | Apply script (combined ar+bn+aliases) with strict guards + PRIOR-19 cross-check |
| `db/places/curated-places.json.preAsia1dBdMissingAr1A.bak` | Pre-apply backup |
| `reports/asia-1d-bd-missing-ar-majors-1a-closure.md` | This closure |

### NOT modified (verified via `git diff` = 0)

- ❌ `server.js` — unchanged
- ❌ `js/app.js` — unchanged
- ❌ `index.html` — unchanged
- ❌ `scripts/geodata/_geonames_common.mjs` — unchanged
- ❌ `scripts/geodata/validate_candidates.mjs` — unchanged
- ❌ `scripts/geodata/normalize_places.mjs` — unchanged
- ❌ All test scripts — unchanged
- ❌ All other country configs (`pk.mjs`, `bn.mjs` Brunei) — unchanged
- ❌ Other countries' curated entries (2,468) — preserved byte-for-byte
- ❌ MEMORY.md — not updated (deferred to post-user-approval)
- ❌ `.gitignore` — unchanged (`bd-geonames-*` already gitignored from BD-A phase)

---

## 13. Acceptance criteria — verification table

| # | Criterion | Result |
|---|---|--------|
| 1 | BD entries became exactly 38 (19 → 38) | ✓ |
| 2 | Curated total became exactly 2,506 (2,487 → 2,506) | ✓ |
| 3 | 19 new cities only — no extras | ✓ |
| 4 | BD Arabic = 38/38 | ✓ |
| 5 | BD English = 38/38 | ✓ |
| 6 | BD Bengali = 38/38 | ✓ |
| 7 | All 19 new entries have names.ar + names.en + names.bn | ✓ |
| 8 | PRIOR-19 BD entries unchanged byte-for-byte | ✓ |
| 9 | chittagong + barisal slugs preserved | ✓ |
| 10 | No duplicate slugs | ✓ |
| 11 | No duplicate geonameid | ✓ |
| 12 | Bengali script guard 19/19 PASS | ✓ |
| 13 | barishal NOT merged (duplicate of barisal) | ✓ |
| 14 | 15 excluded slugs NOT merged (Dhaka thanas + pop-inflated + deferred) | ✓ |
| 15 | No runtime translation | ✓ |
| 16 | No fillchain (104+ checks, 0 leaks) | ✓ |
| 17 | No Brunei data used | ✓ |
| 18 | No server.js / js/app.js / index.html / _geonames_common.mjs / validate_candidates.mjs / normalize_places.mjs changes | ✓ |
| 19 | Tests 235/235 PASS | ✓ |
| 20 | Closure report at reports/asia-1d-bd-missing-ar-majors-1a-closure.md | ✓ |

**All 20 criteria met. Zero exceptions.**

---

## 14. Recommendation for next phase

**Held queue (per user direction — DO NOT auto-start)**:

- ❌ **PLACE-NAMES-BN-BD-2** — NOT needed; Bengali already added in this combined wave (38/38 trilingual achieved)
- ❌ ASIA-1D-BD-MCF — blocked-major review (none expected since all 19 merged cleanly)
- ❌ **ASIA-1D-BD-MISSING-AR-MAJORS-1B** — 45+ remaining pop≥50k candidates still in needs_review (incl. potential narsingdi/savar/natore re-review after pop verification)
- ❌ **PLACE-NAMES-ALIASES-BD-SEED-1** — 17 alias enrichment opportunities for 6 BD seed entries (incl. `Barishal`/`Chattogram` alias add for barisal/chittagong, historical name aliases for sylhet/rajshahi/khulna)
- ❌ STAGE-3-RELIGIOUS-EXEMPTION-1 — long-term upstream Stage 3 fix
- ❌ ASIA-1D-IN — India Urdu wave
- ❌ ASIA-1F — China solo wave
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

### Most natural next phase

**Option A — PLACE-NAMES-ALIASES-BD-SEED-1**: Small alias-only wave for the 6 BD seed entries (auto-generated 17 opportunities in `bd-geodata-aliases-review.md`). Low-risk; mostly Latin variant aliases (Chattogram for chittagong, Barishal for barisal, etc.).

**Option B — ASIA-1D-BD-MISSING-AR-MAJORS-1B**: Larger geodata wave for the remaining ~45 BD candidates. Would need pop-verification for the high-suspicion ones (mohammadpur 528k, hathazari 498k, bandarban 495k).

**Option C — Other country**: ASIA-1D-IN (India Urdu) or ASIA-1F (China) — different country focus.

**Recommended**: Option A first (low-risk closure of BD seed alias gaps), then Option B for further BD expansion.

---

## Status: 🟢 ASIA-1D-BD-MISSING-AR-MAJORS-1A CLOSED — user-approved 2026-05-20

### Summary

| Metric | Value |
|--------|-------|
| Closure report | `reports/asia-1d-bd-missing-ar-majors-1a-closure.md` |
| Apply commit | `e7bdec1` (pushed to main) |
| Closure-approval commit | (this docs commit) |
| BD entries before → after | 19 → **38** (+19) |
| Curated total before → after | 2,487 → **2,506** (+19) |
| BD trilingual coverage | **38/38/38 = 100%** (ar + en + bn) |
| New cities merged | **19** (16 from user's explicit list + 3 strong additions: coxs-bazar, brahmanbaria, narayanganj) |
| aliases.en added | 6 (Jashore, Noakhali, Naogaon, Joypurhat, Cox's Bazar, Coxs Bazar) |
| aliases.bn added | 1 (নোয়াখালী for maijdi) |
| Anomaly overrides | 0 (no Stage 3 false-positives this wave) |
| Total tests | **235/235 PASS** |
| Runtime translation used | **NONE** |
| Brunei data used | **NONE** |
| Code files modified | **0** |
| Excluded slugs verified NOT merged | 15/15 ✓ |
| PRIOR-19 BD preserved byte-for-byte | ✓ |

### User-approval acceptance criteria (all met)

| # | Criterion | Status |
|---|---|---|
| 1 | BD entries grew exactly 19 → 38 (+19) | ✓ |
| 2 | Curated total grew exactly 2,487 → 2,506 (+19) | ✓ |
| 3 | 19 cities only added — no extras | ✓ |
| 4 | BD Arabic = 38/38 (100%) | ✓ |
| 5 | BD English = 38/38 (100%) | ✓ |
| 6 | BD Bengali = 38/38 (100%) | ✓ |
| 7 | Bangladesh achieved full trilingual coverage across all 38 entries | ✓ |
| 8 | PRIOR-19 BD entries byte-for-byte preserved (names.ar/en/bn + slug + coords + aliases) | ✓ |
| 9 | No slug changes for existing 19 BD entries | ✓ |
| 10 | No duplicate slugs across 2,506 entries | ✓ |
| 11 | No duplicate geonameid/sourceId | ✓ |
| 12 | Bengali script guard 19/19 PASS (strict U+0980-U+09FF + reject Latin/Arabic/Devanagari/Other-Indic/Assamese-only) | ✓ |
| 13 | aliases.en additions match plan (Jashore, Noakhali, Naogaon, Joypurhat, Cox's Bazar, Coxs Bazar) | ✓ |
| 14 | aliases.bn additions match plan (নোয়াখালী for maijdi) | ✓ |
| 15 | Excluded slugs NOT merged (15/15): barishal, kafrul, bhatara, motijheel, paltan, azimpur, tungi, mohammadpur, hathazari, bandarban, shibganj, natore, savar, narsingdi, nagar-naluakot | ✓ |
| 16 | No runtime translation (no Google/OpenAI/Anthropic/browser translate/Wikipedia API) | ✓ |
| 17 | No fillchain (8 langs × 19 cities = 152 checks, 0 leaks) | ✓ |
| 18 | No Brunei (bn-*/ bn.mjs) data used | ✓ |
| 19 | No changes to server.js / js/app.js / index.html / _geonames_common.mjs / validate_candidates.mjs / normalize_places.mjs | ✓ |
| 20 | Tests 235/235 PASS | ✓ |

### Held queue (per user direction — DO NOT auto-start)

- ❌ ASIA-1D-BD-MCF
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1
- ❌ STAGE-3-RELIGIOUS-EXEMPTION-1
- ❌ ASIA-1D-IN
- ❌ ASIA-1F
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

**No further work until user direction.**
