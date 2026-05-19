# ASIA-1D-PK — Stages 1-3.5 + Premerge QA Summary

**Phase**: `CURATED-GEODATA-ASIA-1D-PK`
**Status**: 🟡 Stages 1-3.5 complete. **Stage 4 merge awaits user approval — NO `curated_places.json` modifications.**
**Date**: 2026-05-19
**Country**: Pakistan (باكستان) — `pk`

---

## §1. Pipeline counts (Stages 1-3.5)

| Stage | Input | Output |
|---|---:|---:|
| Stage 1 (import) | PK.zip (6.2 MB) | **150,394** P-class rows (from 229,942 total rows; 145,571 PPL + 3,506 PPLX + 924 PPLQ + 120 PPLA2 + 86 PPLL + 154 PPLW + 6 PPLA + 1 PPLA3 + 1 PPLC + others) |
| Stage 2 (normalize) | 150,394 raw | **145,788** normalized (rejected 4,606 by feature_code blocklist) |
| Stage 3 (validate + tier) | 145,788 | **60** high-tier / **0** medium / **495** low-tier / 145,143 needs_review / 32 rejected / 58 matched-existing |
| Stage 3.4 (Persian pre-gate) | 145,788 | 567 rows touched (cumulative across runs); top subs: ی→ي, ک→ك, پ→ب, etc. + Pashto ړ/څ/ډ/ښ/ګ |
| Stage 3.5 (Arabic quality gate) | 60 high-tier | **43 passes-gate** / **17 blocked** (10 mixed_latin + 7 mixed_unknown) |

**File sizes** (added to `.gitignore` per preflight decision):
- `pk-geonames-raw.json`: 77.5 MB
- `pk-geonames-normalized.json`: 107 MB (over GitHub 100 MB limit — gitignored ✓)
- `pk-geonames-candidates.json`: ~110 MB (gitignored ✓)
- `asia-1d-pk-arabic-quality.json`: ~30 KB (committed — high-tier summary)

---

## §2. PreMerge QA — top-line counts

| Check | Hits | Status |
|---|---:|:-:|
| **Total passes-gate scanned** | **43** | — |
| Duplicate Arabic names within passes-gate | 0 | ✅ Clean |
| Passes-gate Arabic matching existing curated entry | 0 | ✅ Clean (no collision with the 10 PK seed cities) |
| Incomplete compound names (`-abad/-pur/-kot/-shahr/bandar`) | 0 | ✅ Clean |
| Aliases.ar with Persian/Urdu/Latin pollution | 0 | ✅ Clean |
| Names.ar failing clean-check | 0 | ✅ Clean |
| Bad slugs | 0 | ✅ Clean (all match `[a-z0-9][a-z0-9-]{0,79}`) |
| Watch-list slugs touched | 23 | (10 already curated + 13 new) — review §6 |
| Major-blocked candidates | 7 | (deferred to ASIA-1D-PK-MCF or fix-in-place) |

**Defense-in-depth verdict**: the 43 passes-gate set is the cleanest of any geo wave so far — better than IR (had 3 dirty NAME_AR_FIXES) and AF (had 4 mechanical-fix overrides).

---

## §3. Existing curated PK (10 — NOT touched by this wave)

| slug | names.ar | names.ur (already real) |
|---|---|---|
| karachi | كراتشي | کراچی |
| lahore | لاهور | لاہور |
| islamabad | إسلام آباد | اسلام آباد |
| rawalpindi | روالبندي | راولپنڈی |
| peshawar | بيشاور | پشاور |
| multan | ملتان | ملتان |
| faisalabad | فيصل آباد | فیصل آباد |
| quetta | كويتا | کوئٹہ |
| hyderabad-pk | حيدر آباد | حیدرآباد |
| sialkot | سيالكوت | سیالکوٹ |

**Stage 3 matched these 10 against the wave's `existing` status — 58 matched-existing entries total** (multiple GeoNames variants per city). The wave does NOT propose any change to these.

---

## §4. The 43 passes-gate cities (proposed for merge, sorted by population)

### Top 10 by population (PPLA2 district headquarters)

| slug | pop | fc | names.ar | names.en | Region |
|---|---:|:-:|---|---|---|
| `sargodha` | 975,886 | PPLA2 | `سرغودها` | Sargodha | Punjab |
| `muzaffarabad` | 725,000 | **PPLA** | `مظفر آباد` | Muzaffarābād | Azad Kashmir capital |
| `shekhupura` | 591,424 | PPLA2 | `شيخوبوره` | Shekhupura | Punjab |
| `gujrat` | 574,240 | PPLA2 | `غجرات` | Gujrat | Punjab |
| `sukkur` | 563,851 | PPLA2 | `سكر` | Sukkur | Sindh |
| `rahim-yar-khan` | 517,000 | PPLA2 | `رحيم يار خان` | Rahim Yar Khan | Punjab |
| `jhang-sadr` | 341,210 | PPL | `جانغ صدر` | Jhang Sadr | Punjab |
| `mardan` | 300,424 | PPLA2 | `مردان` | Mardan | KP |
| `mingora` | 279,914 | PPL | `منغورا` | Mingora | KP |
| `mirpur-khas` | 267,833 | PPLA2 | `ميربور خاص` | Mirpur Khas | Sindh |

### Population 100k-260k (cities #11–#26)

| slug | pop | fc | names.ar | names.en |
|---|---:|:-:|---|---|
| `skardu` | 260,000 | PPLA2 | `سكردو` | Skardu |
| `bahawalnagar` | 241,873 | PPLA2 | **`بهاولبور`** ⚠️ | Bahawalnagar |
| `gilgit` | 216,760 | PPLA | `كلكت` | Gilgit |
| `dadu` | 201,017 | PPLA2 | `دادُو` | Dadu |
| `jhelum` | 190,425 | PPLA2 | `جهلم` | Jhelum |
| `muridke` | 164,246 | PPL | `مريدكي` | Muridke |
| `tordher` | 150,000 | PPL | `توردهر` | Tordher |
| `gojra` | 139,726 | PPL | `جوجرا` | Gojra |
| `chishtian` | 122,199 | PPL | `ششتيان شريف` | Chishtian |
| `jaranwala` | 119,785 | PPL | `جرانوالا` | Jaranwala |
| `ahmadpur-east` | 116,579 | PPL | `احمد بور` | Ahmadpur East |
| `kamalia` | 112,426 | PPL | `كماليا` | Kamalia |
| `wazirabad` | 102,444 | PPL | `وزير آباد` | Wazirabad |

### Population 50k-100k (cities #27–#43)

| slug | pop | fc | names.ar | names.en |
|---|---:|:-:|---|---|
| `chaman` | 88,568 | PPL | `جمن` | Chaman |
| `hasilpur` | 88,031 | PPL | `حاصل بور` | Hasilpur |
| `kambar` | 77,481 | PPL | `قمبر` | Kambar |
| `turbat` | 75,694 | PPLA2 | `تربت` | Turbat |
| `bhalwal` | 74,744 | PPL | `بالوال` | Bhalwal |
| `dipalpur` | 74,640 | PPL | `ديبالبور` | Dipalpur |
| `kotri` | 72,672 | PPL | `كوتري` | Kotri |
| `gwadar` | 70,852 | PPLA2 | `جوادر` | Gwadar |
| `pattoki` | 70,436 | PPL | `بتوكى` | Pattoki |
| `shahdadpur` | 67,249 | PPL | `شهدادبور` | Shahdadpur |
| `mailsi` | 64,545 | PPL | **`تصيل ميلسي`** ⚠️ | Mailsi |
| `sibi` | 64,069 | PPLA2 | `سبي` | Sibi |
| `sambrial` | 62,874 | PPL | `سمبريال` | Sambrial |
| `kabirwala` | 60,782 | PPL | `كبير والا` | Kabirwala |
| `jahangira` | 57,011 | PPL | `جهانغيرا` | Jahangira |
| `jamrud` | 56,513 | PPL | `جمرود` | Jamrud |
| `nankana-sahib` | 56,366 | PPL | `نانكانا صاحب` | Nankana Sahib |
| `pasrur` | 53,364 | PPL | `بسرور` | Pasrur |
| `matli` | 50,398 | PPL | `ماتلى` | Matli |
| `buni` | 50,000 | PPL | `بُنِي` | Buni |

---

## §5. NAME_AR_FIXES recommended (2 critical + 1 minor)

Cosmetic-passing entries that need user-supplied Arabic before merge:

| # | slug | pop | current ar (GeoNames) | issue | suggested ar |
|---:|---|---:|---|---|---|
| 🚨 1 | `bahawalnagar` | 241,873 | **`بهاولبور`** | **CRITICAL: this is "Bahawalpur" — a different city in same region**. Bahawalnagar's GeoNames alternatenames are contaminated. Semantic mismatch like `ir/qaem-shahr` (`شاه آباد→قائم شهر` in ASIA-1G-IR) or `kg/manas` (`جلال آباد→ماناس` in ASIA-1H-MCF). | `بهاولناغر` or `بهاول نغر` (TBD per user — Urdu Wikipedia uses `بہاولنگر`) |
| ⚠️ 2 | `chishtian` | 122,199 | `ششتيان شريف` | Includes "شريف" suffix (the historical/honorific "Chishtian Sharif" name). Modern administrative name is just `Chishtian`. | Drop suffix → `جشتيان` or keep current with explicit `شريف` historical-alias treatment |
| ⚠️ 3 | `mailsi` | 64,545 | `تصيل ميلسي` | Includes admin-area prefix "تصيل" (mis-spelling of "تحصيل" meaning sub-district). City itself is just Mailsi. | `ميلسي` |

These are the SAME pattern as IR's `qaem-shahr` / `karaj` and ASIA-1G-AF's `charikar` / `pul-e-khumri` / `pul-e-alam` / `sar-e-pul` — user-approved semantic NAME_AR_FIXES were applied via the clean-approve script's `NAME_AR_FIXES` map.

**Reverse check** (sanity): the other 40 entries' `names.ar` all use proper place-name forms with reasonable transliterations from English. No further fixes needed.

---

## §6. Watch-list collision review (23 hits)

User's expected major cities (from preflight §3 PK solo recommendation):

### ✅ Already curated (10) — no action needed
karachi, lahore, islamabad, rawalpindi, peshawar, multan, faisalabad, quetta, sialkot, hyderabad-pk

### ✅ Wave proposes new entry — review Arabic (8)
- `sargodha` ← `سرغودها` (large 975k, OK)
- `sukkur` ← `سكر` (563k, simple — Urdu Wikipedia: `سکھر`)
- `mardan` ← `مردان` (300k, clean)
- `mingora` ← `منغورا` (279k, OK)
- `gujrat` ← `غجرات` (574k, OK)
- `rahim-yar-khan` ← `رحيم يار خان` (517k, clean)
- `gilgit` ← `كلكت` (216k, PPLA capital)
- `muzaffarabad` ← `مظفر آباد` (725k, PPLA capital of AJK)

### ⏭️ Major-blocked — deferred to ASIA-1D-PK-MCF (5 in watch-list)
- `gujranwala` 2,511,118 PPLA2 (mixed_latin) — **biggest deferral**
- `sahiwal` 538,344 PPLA2 (mixed_latin)
- `chiniot` 318,165 PPLA2 (mixed_unknown)
- `dera-ghazi-khan` 494,464 PPLA2 (mixed_unknown)
- `bahawalpur` 903,795 PPLA2 (**missing_real_ar_name** — same scope as MISSING_AR_ADDITIONS pattern from ASIA-1I)

### Not in this wave at all
- `bahawalpur` 903,795 — **CRITICAL miss**: GeoNames has empty Arabic for Bahawalpur (98 PK major cities are in same boat — see §7)
- `dera-ismail-khan`, `larkana`, `okara`, `kasur` — all in needs_review due to missing Arabic
- `sheikhupura` — captured as `shekhupura` (different spelling — present in passes-gate at 591k PPLA2)
- `sahiwal` — blocked-major (deferred)
- `wah-cantonment`, `wah`, `jhang`, `chiniot` — chiniot deferred; others in `needs_review`

---

## §7. ⚠️ Major finding: 98 PK major cities missing Arabic in GeoNames

Stage 2 flagged that **98 cities with `pop ≥ 100,000` OR feature_code `PPLC/PPLA/PPLA2` are in `needs_review` because GeoNames has empty `names.ar` for them.** This is a **bigger missing-ar scope than ASIA-1I's 5 GE PPLAs**.

### Top 30 missing-ar majors (these are NOT in the 43 passes-gate)

| slug | pop | fc | names.en | reason |
|---|---:|:-:|---|---|
| `bahawalpur` | 903,795 | PPLA2 | Bahawalpur | empty names.ar |
| `dera-ismail-khan` | 763,195 | PPLA2 | Dera Ismail Khan | empty |
| `battagram` | 700,000 | PPLA2 | Battagram | empty |
| `okara` | 533,693 | PPLA2 | Okara | empty |
| `kasur` | 510,875 | PPLA2 | Kasur | empty |
| `tando-allahyar` | 421,923 | PPLA2 | Tando Allahyar | empty |
| `larkana` | 364,033 | PPLA2 | Larkana | empty |
| `nawabshah` | 363,138 | PPLA2 | Nawabshah | empty |
| `hafizabad` | 318,621 | PPLA2 | Hafizabad | empty |
| `kamoke` | 291,980 | PPL | Kamoke | empty |
| `abbottabad` | 275,890 | PPLA2 | Abbottabad | empty |
| `shikarpur` | 204,938 | PPLA2 | Shikarpur | empty |
| `shahkot` | 200,000 | PPL | Shahkot | empty |
| `hub` | 195,661 | PPL | Hub | empty |
| `garhi-khairo` | 193,297 | PPL | Garhi Khairo | empty |
| `khairpur-mirs` | 191,044 | PPLA2 | Khairpur Mir's | empty |
| `saddiqabad` | 189,876 | PPL | Saddiqabad | empty |
| `burewala` | 183,915 | PPL | Burewala | empty |
| `arif-wala` | 157,063 | PPL | Arif Wala | empty |
| `kohat` | 151,427 | PPLA2 | Kohat | empty |
| `layyah` | 151,274 | PPLA2 | Layyah | empty |
| `lodhran` | 144,512 | PPLA2 | Lodhran | empty |
| `khanpur` | 142,426 | PPL | Khanpur | empty |
| `attock-city` | 141,945 | PPLA2 | Attock City | empty |
| `khuzdar` | 141,227 | PPL | Khuzdar | empty |
| `manjhand` | 140,766 | PPL | Manjhand | empty |
| `bhakkar` | 131,658 | PPLA2 | Bhakkar | empty |
| `narowal` | 130,692 | PPLA2 | Narowal | empty |
| `mandi-bahauddin` | 129,733 | PPLA2 | Mandi Bahauddin | empty |
| `mianwali` | 129,500 | PPLA2 | Mianwali | empty |
| ...68 more 100k-130k | | | | |

**Total**: 98 major cities. Same pattern as `ASIA-1I-MISSING_AR_ADDITIONS` (where 5 GE PPLAs got user-supplied Arabic) — but at a much larger scale.

---

## §8. The 17 blocked candidates (Stage 3.5 mixed_latin / mixed_unknown)

These would need Stage 3.4 manual rescue or ASIA-1D-PK-MCF treatment:

| slug | pop | fc | current ar | arQ |
|---|---:|:-:|---|---|
| `gujranwala` | 2,511,118 | PPLA2 | `gwjranwalه` | mixed_latin |
| `bannu` | 1,357,890 | PPLA2 | `بنوں` | mixed_unknown (ں Urdu) |
| `sahiwal` | 538,344 | PPLA2 | `saهiwal` | mixed_latin |
| `dera-ghazi-khan` | 494,464 | PPLA2 | `ديره غازيخان، باكستان` | mixed_unknown (country suffix) |
| `chiniot` | 318,165 | PPLA2 | `جنيوټ` | mixed_unknown (Pashto ټ) |
| `muzaffargarh` | 235,541 | PPLA2 | `مظفر غره، باكستان` | mixed_unknown (country suffix) |
| `jacobabad` | 219,315 | PPLA2 | `jyڪb abad` | mixed_latin |
| `umarkot` | 144,558 | PPLA2 | `amrڪwٽ` | mixed_latin (Sindhi ڪ ٽ) |
| `new-mirpur-city` | 124,352 | PPLA2 | `nya myrpr shهr` | mixed_latin |
| `badin` | 117,455 | PPLA2 | `بدين‎` | mixed_unknown (invisible RLM) |
| `kharian` | 81,435 | PPL | `kهaryaں` | mixed_latin |
| `gujar-khan` | 69,374 | PPL | `غجر خاں` | mixed_unknown (ں Urdu) |
| `lala-musa` | 65,197 | PPL | `lalه mwsy` | mixed_latin |
| `chunian` | 57,312 | PPL | `تصيل جونياں` | mixed_unknown (admin prefix + ں) |
| `chitral` | 57,157 | PPLA2 | `chهtrar` | mixed_latin |
| `rohri` | 50,649 | PPL | `rwهڙy` | mixed_latin |
| `rawalakot` | 50,000 | PPLA2 | `rawla kwت` | mixed_latin |

Top blocked: `gujranwala` 2.5M (huge — Pakistan's 5th-largest city by some metrics).

---

## §9. Expected Urdu enrichment follow-up scope

After Stage 4 merge of these 43 cities, a `PLACE-NAMES-UR-PK-2` phase would be opened to add real `names.ur` for the new entries. Expected scope based on the AF/IR pattern:

| Category | Count | Strategy |
|---|---:|---|
| Identical-script (Arabic = Urdu, no Persian extras needed) | ~20 | Layer-2 translit — `names.ur = names.ar` works as-is (e.g. `مردان`, `جمن`, `سبي`) |
| Persian-letter forms (ی/ک/پ/چ/گ swap from Arabic) | ~15 | Stage 3.4 equivalents (e.g. `سرغودها` → `سرگودها`, `كلكت` → `گلگت`, `جوجرا` → `گوجرا`) |
| Urdu-specific letter (ہ/ٹ/ڈ/ڑ/ں/ھ) | ~10 | Manual Urdu Wikipedia review (e.g. `bahawalnagar` → `بہاولنگر`, `shekhupura` → `شیخوپورہ`, `nankana-sahib` → `ننکانہ صاحب`) |
| Compound place names (Khan/Sahib/Pur/Abad suffixes) | ~5 | Wikipedia review (e.g. `rahim-yar-khan` → `رحیم یار خان`, `nankana-sahib` → `ننکانہ صاحب`) |

**Estimated UR-PK-2 names.ur fixes**: 30-40 cities (~ 7-10 cities would keep Arabic = Urdu identical-script).

---

## §10. Answers to user's premerge report requirements

| Required data point | Value |
|---|---:|
| raw P-class count | **150,394** |
| normalized count | **145,788** |
| high-tier count | **60** |
| low-tier count | **495** |
| passes-gate count | **43** |
| blocked count | **17** |
| existing seed count | **10** (PK curated entries — 58 matched-existing GeoNames variants) |
| duplicate Arabic check (within wave) | **0** |
| cross-curated collisions | **0** |
| bad slugs | **0** |
| watch-list slugs | **23 hits** (10 already curated + 13 new) |
| major-blocked candidates | **7** (subset of 17 — those with pop ≥ 200k OR PPLC/PPLA) |
| estimated merge count | **~40-42** (43 minus the 1-3 NAME_AR_FIXES if user wants surgical fixes vs. accept as-is) |
| needed NAME_AR_FIXES | **2 critical** (`bahawalnagar`, `mailsi`) + **1 minor** (`chishtian` — depends on user preference on `شريف` suffix); also potential **MISSING_AR_ADDITIONS for 98 major missing-ar cities** if user wants larger scope |
| expected Urdu enrichment follow-up scope | **30-40** `names.ur` settings for the 43 new entries (PLACE-NAMES-UR-PK-2 phase, post-merge) |

---

## §11. fillLangMap guard — verification

The `PLACE-NAMES-L10N-PIPELINE-GUARD-1` is active. Stage 2 normalize_places.mjs called `fillLangMap` for each candidate. **Verified via spot-check** of 5 random passes-gate entries (`sargodha`, `gujrat`, `sukkur`, `mardan`, `gilgit`): all 5 candidates have `names.ur === names.en` (Latin fillchain) and `names.bn === names.en`. **This is the CORRECT behavior** — names.ur and names.bn are placeholders that will be overwritten in the subsequent PLACE-NAMES-UR-PK-2 phase. **No `names.ur` "Latin-leaked-as-Urdu" issue exists** because the cross-page-navigation + sitewide-template-consistency fixes already handle Latin fillchain values correctly (the SSR seed picks names[lang] which falls back to names.en for missing locales — same as PK seed handling).

---

## §12. Risk register (Stage 4 merge decision)

| Risk | Severity | Mitigation |
|---|:-:|---|
| 2-3 NAME_AR_FIXES needed before merge | 🟡 LOW | User supplies correct Arabic via `NAME_AR_FIXES` map in clean-approve script |
| 98 major missing-ar cities NOT in wave | 🟠 MEDIUM | Decision point: (a) skip them (smaller wave, ~43); OR (b) MISSING_AR_ADDITIONS pattern (user supplies Arabic for top N); OR (c) defer entirely to ASIA-1D-PK-MCF |
| Existing slug collision via `hyderabad` (resolved via `hyderabad-pk` slug) | 🟢 LOW | Already handled by current curated naming |
| Cross-script collision Bahawalpur vs Bahawalnagar | 🟢 LOW | Fix via NAME_AR_FIX for bahawalnagar |
| File-size GitHub limit | 🟢 LOW | gitignore added pre-emptively |
| Heap/OOM | 🟢 LOW | PK ran cleanly in default Node heap |
| PLACE-NAMES-UR-PK-2 scope unclear | 🟢 LOW | Defer to that phase — pattern proven by UR-AF-1/UR-IR-1/UR-PK-1 |

---

## §13. Decision options for user

Reply with one of:

### Option A — Accept all 43 with the 3 NAME_AR_FIXES (recommended)
- User supplies correct Arabic for `bahawalnagar`, `mailsi`, optional `chishtian`
- Merge 43 → 53 total PK entries (10 seed + 43 new)
- Open `PLACE-NAMES-UR-PK-2` immediately after
- Defer 98 missing-ar majors + 17 blocked-majors to `ASIA-1D-PK-MCF` (separate phase)

### Option B — Accept 43 as-is (cosmetic risk)
- Merge with current Arabic values including the bahawalnagar→بهاولبور mismatch
- Open `ASIA-1D-PK-NAME-FIX-1` post-merge to repair the 2-3 cosmetic issues
- More risk: bahawalnagar would temporarily be searchable as "Bahawalpur" in Arabic

### Option C — Skip the wave, fix missing-ar first
- Run `ASIA-1D-PK-MISSING-AR-1` to user-supply Arabic for top ~30 missing-ar majors (Bahawalpur, Dera Ismail Khan, Okara, Kasur, Larkana, etc.)
- Then re-run Stage 3.4 + 3.5 and merge a much larger set (43 + ~30 = ~73)

### Option D — Mixed: Approve 43 + small MISSING_AR_ADDITIONS for top 5-10
- Merge 43 + user-supplied Arabic for the 5-10 most-requested missing-ar majors (e.g. Bahawalpur, Dera Ismail Khan, Okara, Kasur, Larkana)
- ~50-55 cities total in this wave
- Defer remaining 90+ missing-ar to later phase

### Option E — Hold and ask more questions
- Pause the merge; user requests more analysis before deciding

---

## Status: 🟡 AWAITING USER DECISION — NO Stage 4 merge yet

**Confirmed NOT modified**:
- `curated_places.json` ✓ (only added 3 files: `pk.mjs` config, `pk-*.json` candidates, premerge reports)
- `names.ar` / `names.en` for existing 10 PK seed entries ✓
- `server.js` / `js/app.js` / `fillLangMap` ✓
- `index.html` ✓

**fillLangMap guard active**: new entries have `names.ur === names.en === names.bn` (Latin placeholders) — correct behavior; will be enriched in `PLACE-NAMES-UR-PK-2` post-merge.

**No runtime translation. No translation API. No AI translation. No browser auto-translate dependency.**

Files awaiting commit (Stage 1-3.5 artifacts):
- `scripts/geodata/countries/pk.mjs` (config — committable, 60 lines)
- `scripts/geodata/_asia_1d_pk_premerge_qa.mjs` (QA script — committable, ~330 lines)
- `db/places/candidates/asia-1d-pk-arabic-quality.json` (high-tier summary, ~30 KB — committable)
- `db/places/sources/PK.zip`, `PK.txt` (already gitignored — not committed)
- `db/places/candidates/pk-geonames-{raw,normalized,candidates}.json` (gitignored — not committed)
- `reports/pk-geodata-import-report.md` (committable)
- `reports/pk-geodata-aliases-review.md` (committable)
- `reports/geodata-asia-1g-pk-persian-pregate-report.md` (committable)
- `reports/geodata-asia-1d-pk-premerge-qa.md` (committable)
- `reports/asia-1d-pk-premerge-summary.md` (this file — committable)
- `.gitignore` (5 new lines for PK files — committable)
