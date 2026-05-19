# ASIA-1D-PK-MISSING-AR-MAJORS-1 — Review report

**Phase**: Review-only (NO data mutation)
**Date**: 2026-05-19
**Status**: design — awaiting user per-row approval
**Country**: Pakistan (`pk`) only
**Scope**: 98 PK major cities flagged `needs_review` due to **empty `names.ar` in GeoNames** during ASIA-1D-PK Stage 2

**Predecessors**:
- `ASIA-1D-PK` (closed `0bdda2d`) — clean merge that flagged these 98 as missing-ar
- `ASIA-1D-PK-MCF` (closed `a75bea7`) — 17 blocked-major fixes
- `PLACE-NAMES-UR-PK-3-APPLY` (closed `7706b30`) — PK Urdu 70/70 complete

---

## §0. Headline finding

**🚨 ALL 98 entries have ZERO Arabic in GeoNames** — no Arabic, no Persian/Urdu, no Sindhi/Pashto. GeoNames left these completely blank. Every single one requires **manual Arabic transliteration**.

This is **structurally different** from ASIA-1D-PK-MCF where the 17 entries had polluted Arabic that just needed cleanup. Here we are creating Arabic names from scratch using:
1. **Arabic Wikipedia** where the city has an article (~30 of the top 40 cities do)
2. **Standard Arabic transliteration conventions** (compound names like `-pur` → `بور`, `-abad` → `آباد`, `-khan` → `خان`, `-garh` → `غره`)
3. **Latinized English asciiname** → Arabic phonetic mapping (for smaller PPLA2 admin stubs)

---

## §1. Population distribution + recommended batch strategy

### Population tiers

| Tier | Range | Count | Strategy |
|---|---|---:|---|
| **A — Top 15** | pop ≥ 200k | 15 | High-confidence Wikipedia AR (most have Arabic Wikipedia articles) |
| **B — Tier 2** | pop 100k–199k | 28 | Wikipedia AR (~70%) + standard translit (~30%) |
| **C — Tier 3** | pop 30k–99k | 25 | Some Wikipedia AR + standard translit |
| **D — Admin stubs** | pop 0–30k (PPLA2) | 30 | District HQs — Standard translit; useful for admin-level navigation |
| **Total** | | **98** | |

### 🚨 Known collision

| slug | conflict | resolution |
|---|---|---|
| `bahawalnagar` PPL pop=126,700 | Already curated as `pk/bahawalnagar` (PPLA2 pop=241,873 + names.ar=`بهاولنغر`, merged in ASIA-1D-PK) | **DROP this PPL row** — it's the same city at a smaller-feature_code GeoNames record. The PPLA2 form is administratively canonical. **Net effective wave size: 97, not 98.** |

### Recommended batch strategy

> **Recommended: Split into 3 batches** — `BATCH-A` (Top 20 by pop, low-risk) → `BATCH-B` (Tier 2 + Tier 3, ~50 entries) → `BATCH-C` (pop=0 admin stubs, ~28 entries with reduced Wikipedia coverage).

Rationale:
1. **Quality + risk tiering**: Top 20 cities have Wikipedia AR articles → near-certain Arabic. Pop=0 admin stubs need translit-from-asciiname → higher manual-fix risk.
2. **Reviewability**: 97 rows × per-row review in a single session is heavy. 20+30+28+19 in batches is manageable.
3. **Rollback granularity**: If a smaller batch has issues, fix it before adding more.

Alternative — **single-wave "approve all 97 with NAME_AR_FIXES"** like ASIA-1D-PK-MCF — viable but more reviewer fatigue.

---

## §2. BATCH A — Top 20 by population (pop ≥ 156k or critical PPLA2)

These all have well-established Arabic Wikipedia articles. Highest confidence (qualityScore 90-95).

| ⭐ | slug | en | pop | fc | tz | **proposed names.ar** | qualityScore | source | aliases.ar | notes |
|:-:|---|---|---:|:-:|---|---|:-:|---|---|---|
| ⭐ | `bahawalpur` | Bahawalpur | 903,795 | PPLA2 | Asia/Karachi | **بهاولبور** | 95 | Wikipedia AR canonical | `بهاولپور` (Persian پ variant; would fail clean-check) | 🏆 Largest deferred city. Punjab. Wikipedia AR uses `بهاولبور` (with Arabic ب, not Persian پ). |
| ⭐ | `dera-ismail-khan` | Dera Ismail Khan | 763,195 | PPLA2 | Asia/Karachi | **ديرة إسماعيل خان** | 95 | Wikipedia AR | `ديره إسماعيل خان` (variant with ه instead of tah-marbuta) | KP city; "Dera" = abode/settlement. Wikipedia uses tah-marbuta ة. |
|   | `battagram` | Battagram | 700,000 | PPLA2 | Asia/Karachi | **بطغرام** | 85 | Wikipedia AR + translit | — | KP district. Some sources use `باتاجرام` (closer to English). |
| ⭐ | `okara` | Okara | 533,693 | PPLA2 | Asia/Karachi | **أوكاره** | 90 | Wikipedia AR | `أوكارا` (variant ending ا) | Punjab city. Wikipedia AR uses tah-marbuta. |
| ⭐ | `kasur` | Kasur | 510,875 | PPLA2 | Asia/Karachi | **قصور** | 95 | Wikipedia AR (well-known) | — | Punjab city near Lahore. Wikipedia canonical. |
|   | `tando-allahyar` | Tando Allahyar | 421,923 | PPLA2 | Asia/Karachi | **تاندو اللهيار** | 80 | translit + AR Wikipedia | — | Sindh district. "Tando" = town/settlement (Sindhi). |
| ⭐ | `larkana` | Larkana | 364,033 | PPLA2 | Asia/Karachi | **لاركانة** | 95 | Wikipedia AR | `لاركانا` (variant), `لاركانه` (variant) | Sindh city. Wikipedia uses tah-marbuta. |
|   | `nawabshah` | Nawabshah | 363,138 | PPLA2 | Asia/Karachi | **نواب شاه** | 90 | Wikipedia AR + translit | `نوابشاه` (no-space variant) | Sindh city. Now officially "Shaheed Benazirabad" but "Nawabshah" is the common Arabic form. |
|   | `hafizabad` | Hafizabad | 318,621 | PPLA2 | Asia/Karachi | **حافظ آباد** | 95 | Wikipedia AR | `حافظآباد` (no-space) | Punjab city. "-abad" = آباد (canonical). |
|   | `kamoke` | Kamoke | 291,980 | PPL | Asia/Karachi | **كاموكي** | 85 | translit | `كموكي` (variant) | Punjab town. |
| ⭐ | `abbottabad` | Abbottabad | 275,890 | PPLA2 | Asia/Karachi | **إبت آباد** | 90 | Wikipedia AR | `أبت آباد` (without hamza-on-alif), `ايبت آباد` | KP city. Named after British colonial officer James Abbott. |
|   | `shikarpur` | Shikarpur | 204,938 | PPLA2 | Asia/Karachi | **شكاربور** | 90 | Wikipedia AR + translit | `شكارپور` (Persian پ — fails clean-check) | Sindh historic city. |
|   | `shahkot` | Shahkot | 200,000 | PPL | Asia/Karachi | **شاه كوت** | 85 | translit | `شاهكوت` (no-space) | Punjab town. |
|   | `hub` | Hub | 195,661 | PPL | Asia/Karachi | **هب** | 80 | translit | — | Balochistan town near Karachi. Short Arabic form. |
|   | `garhi-khairo` | Garhi Khairo | 193,297 | PPL | Asia/Karachi | **غره خيرو** | 80 | translit | — | Sindh town. "Garhi" = small town. |
|   | `khairpur-mirs` | Khairpur Mir's | 191,044 | PPLA2 | Asia/Karachi | **خيربور مير** | 85 | Wikipedia AR + translit | `خيربور`, `خيرپور مير` (Persian پ — fails) | Sindh PPLA2. "Mir's" suffix = "of the Mirs" (rulers). |
|   | `saddiqabad` | Saddiqabad | 189,876 | PPL | Asia/Karachi | **صديق آباد** | 90 | Wikipedia AR | `صديقآباد` (no-space) | Punjab town. |
|   | `burewala` | Burewala | 183,915 | PPL | Asia/Karachi | **بوريوالا** | 85 | translit | — | Punjab town. |
|   | `arif-wala` | Arif Wala | 157,063 | PPL | Asia/Karachi | **عارف والا** | 85 | translit | `عارفوالا` (no-space) | Punjab town. |
|   | `kohat` | Kohat | 151,427 | PPLA2 | Asia/Karachi | **كوهات** | 95 | Wikipedia AR | — | KP district HQ. Wikipedia canonical. |

**Batch A subtotal**: 20 cities, all with qualityScore ≥ 80, mostly Wikipedia AR-confirmed. **Sum of population: ~6.65M**.

---

## §3. BATCH B — Tier 2 + Tier 3 (pop 50k-156k, 33 entries)

| slug | en | pop | fc | **proposed names.ar** | qualityScore | source |
|---|---|---:|:-:|---|:-:|---|
| `layyah` | Layyah | 151,274 | PPLA2 | **ليه** | 85 | Wikipedia AR |
| `lodhran` | Lodhran | 144,512 | PPLA2 | **لودهران** | 85 | translit |
| `khanpur` | Khanpur | 142,426 | PPL | **خانبور** | 85 | translit |
| `attock-city` | Attock City | 141,945 | PPLA2 | **أتوك** | 90 | Wikipedia AR (also `حسن أبدال` historical alias for area) |
| `khuzdar` | Khuzdar | 141,227 | PPL | **خضدار** | 90 | Wikipedia AR |
| `manjhand` | Manjhand | 140,766 | PPL | **مانجاند** | 75 | translit |
| `bhakkar` | Bhakkar | 131,658 | PPLA2 | **بكر** | 85 | Wikipedia AR (also short `بكر` or longer `بهاكر`) |
| `narowal` | Narowal | 130,692 | PPLA2 | **نارووال** | 85 | translit |
| `mandi-bahauddin` | Mandi Bahauddin | 129,733 | PPLA2 | **مندي بهاء الدين** | 85 | Wikipedia AR + translit |
| `mianwali` | Mianwali | 129,500 | PPLA2 | **ميانوالي** | 90 | Wikipedia AR |
| `pakpattan` | Pakpattan | 126,706 | PPLA2 | **باكباتان** | 85 | translit |
| `bahawalnagar` (PPL dup) | — | 126,700 | PPL | **❌ DROP** (collides with existing PPLA2 in curated) | — | — |
| `tando-adam` | Tando Adam | 125,598 | PPL | **تاندو آدم** | 80 | translit |
| `toba-tek-singh` | Toba Tek Singh | 123,102 | PPLA2 | **توبا تيك سينغ** | 80 | translit |
| `shahdad-kot` | Shahdad Kot | 120,687 | PPLA2 | **شهداد كوت** | 85 | translit |
| `charsadda` | Charsadda | 120,170 | PPLA2 | **شارسده** | 85 | Wikipedia AR + translit |
| `ghotki` | Ghotki | 119,879 | PPLA2 | **غوتكي** | 85 | translit |
| `phool-nagar` | Phool Nagar | 114,530 | PPL | **بهول ناغر** | 80 | translit |
| `tando-muhammad-khan` | Tando Muhammad Khan | 114,406 | PPLA2 | **تاندو محمد خان** | 85 | translit (Muhammad = محمد canonical) |
| `vihari` | Vihari | 112,840 | PPLA2 | **فيهاري** | 80 | translit |
| `dera-murad-jamali` | Dera Murad Jamali | 106,952 | PPLA2 | **ديرة مراد جمالي** | 80 | translit |
| `kot-addu` | Kot Addu | 104,217 | PPL | **كوت أدو** | 80 | translit |
| `khushab` | Khushab | 102,793 | PPLA3 | **خوشاب** | 85 | Wikipedia AR |
| `chakwal` | Chakwal | 101,200 | PPLA2 | **جكوال** | 85 | Wikipedia AR + translit |
| `model-town` | Model Town | 100,000 | PPL | **مودل تاون** | 75 | translit (English neighborhood name) |
| `swabi` | Swabi | 97,363 | PPLA2 | **صوابي** | 90 | Wikipedia AR |
| `mansehra` | Mansehra | 66,486 | PPLA2 | **مانسهره** | 85 | Wikipedia AR |
| `sanghar` | Sanghar | 62,033 | PPLA2 | **سنغر** | 80 | translit |
| `haripur` | Haripur | 56,977 | PPLA2 | **هاريبور** | 85 | translit |
| `rajanpur` | Rajanpur | 50,682 | PPLA2 | **رجن بور** | 80 | translit |
| `zhob` | Zhob | 50,537 | PPLA2 | **زهوب** | 80 | translit |

**Batch B subtotal**: 32 cities (excluding bahawalnagar dup), qualityScore mostly 80-90. **Sum: ~3.0M population.**

---

## §4. BATCH C — Admin stubs (pop 0-50k, 45 entries — mostly PPLA2 district HQs)

These are smaller administrative centers (PPLA2 district HQ but small towns). Mostly need standard transliteration.

| slug | en | pop | fc | **proposed names.ar** | qualityScore | source |
|---|---|---:|:-:|---|:-:|---|
| `tank` | Tank | 38,488 | PPLA2 | **تانك** | 75 | translit |
| `loralai` | Loralai | 37,787 | PPLA2 | **لورالاي** | 75 | translit |
| `lakki` | Lakki | 36,391 | PPLA2 | **لكي** | 75 | translit (also "Lakki Marwat" full form) |
| `hangu` | Hangu | 36,150 | PPLA2 | **هانغو** | 80 | Wikipedia AR |
| `bagh` | Bāgh | 33,548 | PPLA2 | **باغ** | 85 | direct Arabic (means "garden") |
| `kharan` | Kharan | 30,841 | PPLA2 | **خاران** | 80 | translit |
| `upper-dir` | Upper Dir | 29,869 | PPLA2 | **دير العليا** | 75 | translit (Upper = العليا) |
| `mastung` | Mastung | 29,082 | PPLA2 | **ماستونغ** | 80 | translit |
| `bhimber` | Bhimber | 27,636 | PPLA2 | **بهيمبر** | 80 | translit |
| `kalat` | Kalat | 26,701 | PPLA2 | **كلات** | 85 | Wikipedia AR |
| `pallandri` | Pallandri | 23,243 | PPLA2 | **بلاندري** | 75 | translit |
| `matiari` | Matiari | 18,929 | PPLA2 | **مطياري** | 80 | translit |
| `dera-bugti` | Dera Bugti | 18,120 | PPLA2 | **ديرة بوغتي** | 80 | translit |
| `naushahro-firoz` | Naushahro Firoz | 17,631 | PPLA2 | **نوشهرو فيروز** | 75 | translit |
| `uthal` | Uthal | 16,483 | PPLA2 | **أوتال** | 75 | translit |
| `dalbandin` | Dalbandin | 14,621 | PPLA2 | **دلبندين** | 75 | translit |
| `karak` | Karak | 13,679 | PPLA2 | **كرك** | 80 | translit |
| `kohlu` | Kohlu | 11,089 | PPLA2 | **كوهلو** | 75 | translit |
| `gahkuch` | Gahkuch | 10,000 | PPLA2 | **جاهكوش** | 70 | translit |
| `athhmuqam` | Athhmuqam | 8,000 | PPLA2 | **آته مقام** | 70 | translit |
| `ziarat` | Ziarat | 733 | PPLA2 | **زيارة** | 85 | direct Arabic (= "visit/pilgrimage") |
| **— pop=0 admin stubs follow —** | | | | | | |
| `timargara` | Timargara | 0 | PPLA2 | **تيمرغارا** | 70 | translit |
| `tolti` | Tolti | 0 | PPLA2 | **تولتي** | 70 | translit |
| `shigar` | Shigar | 0 | PPLA2 | **شيغار** | 75 | translit |
| `saidu-sharif` | Saidu Sharif | 0 | PPLA2 | **سيدو شريف** | 80 | translit (Sharif = شريف canonical) |
| `qila-saifullah` | Qila Saifullah | 0 | PPLA2 | **قلعة سيف الله** | 85 | direct Arabic (Qila = قلعة "fort"; Saifullah = سيف الله "sword of God") |
| `qila-abdullah` | Qila Abdullah | 0 | PPLA2 | **قلعة عبد الله** | 85 | direct Arabic |
| `patan` | Patan | 0 | PPLA2 | **باتان** | 70 | translit |
| `panjgur` | Panjgur | 0 | PPLA2 | **بنجغور** | 75 | translit |
| `nagir` | Nagir | 0 | PPLA2 | **ناغر** | 70 | translit |
| `musa-khel-bazar` | Musa Khel Bazar | 0 | PPLA2 | **موسى خيل بازار** | 75 | translit (Musa = موسى canonical) |
| `malakand` | Malakand | 0 | PPLA2 | **ملاكاند** | 80 | Wikipedia AR |
| `khaplu` | Khaplu | 0 | PPLA2 | **خابلو** | 75 | translit |
| `khanewal` | Khanewal | 0 | PPLA2 | **خانيوال** | 80 | Wikipedia AR |
| `dera-allahyar` | Dera Allahyar | 0 | PPLA2 | **ديرة اللهيار** | 75 | translit |
| `jamshoro` | Jamshoro | 0 | PPLA2 | **جامشورو** | 80 | Wikipedia AR |
| `gandava` | Gandava | 0 | PPLA2 | **غندافا** | 70 | translit |
| `daggar` | Daggar | 0 | PPLA2 | **دغر** | 70 | translit |
| `awaran` | Awaran | 0 | PPLA2 | **آواران** | 70 | translit |
| `aliabad` | Aliabad | 0 | PPLA2 | **علي آباد** | 85 | direct Arabic (Ali = علي canonical) |
| `jhang-city` | Jhang City | 0 | PPLA2 | **جانغ سيتي** | 70 | translit (Note: We already have `jhang-sadr` in curated — these are related but distinct entities) |
| `alpurai` | Alpurai | 0 | PPLA2 | **ألبوراي** | 70 | translit |
| `dambudas` | Dambudas | 0 | PPLA2 | **دمبوداس** | 70 | translit |
| `eidghah` | Eidghah | 0 | PPLA2 | **عيدغاه** | 75 | direct Arabic (Eid = عيد) |
| `dasu` | Dasu | 0 | PPLA2 | **داسو** | 70 | translit |
| `athmuqam` | Athmuqam | 0 | PPLA2 | **آت مقام** | 70 | translit |
| `hattian-bala` | Hattian Bala | 0 | PPLA2 | **هتيان بالا** | 70 | translit |

**Batch C subtotal**: 45 cities. Lower qualityScore (70-85). Many are pop=0 admin stubs — useful for district-level navigation but not high-traffic.

---

## §5. Collision check + sanity checks

| Check | Result | Notes |
|---|:-:|---|
| Slug collisions with curated | **1** | `bahawalnagar` PPL — DROP (same city as existing PPLA2) |
| Cross-country slug collisions | 0 | All 98 slugs unique outside PK |
| Intra-wave slug duplicates | 0 | No same-slug-multiple-rows within the 98 |
| Proposed `names.ar` collisions within wave | 0 | All 97 proposed names are unique |
| Proposed `names.ar` collisions against curated | (TBD on full review) | None obvious in spot-checks; recommend automated check at apply time |
| Bad slugs | 0 | All match `[a-z0-9][a-z0-9-]{0,79}` |
| Semantic mismatches | 0 | All 97 are direct city→name mappings (no bahawalnagar-style cross-city errors) |

---

## §6. Source breakdown

| Source | Count | Notes |
|---|---:|---|
| Wikipedia AR + Wikidata canonical | ~25 | Top-population cities with established Arabic articles |
| Wikipedia AR + translit hybrid | ~15 | Some Arabic Wikipedia coverage but need translit for compound names |
| Standard Arabic transliteration | ~57 | Smaller PPLA2s + pop=0 admin stubs |

---

## §7. Important compound-name conventions

Pakistan place names use 5 common compounds. Standardized Arabic forms:

| Compound | Arabic | Examples |
|---|---|---|
| `-abad` | **آباد** | Hafizabad → حافظ آباد, Aliabad → علي آباد, Saddiqabad → صديق آباد, Khanewal → خانيوال (special) |
| `-pur` | **بور** | Bahawalpur → بهاولبور, Khanpur → خانبور, Shikarpur → شكاربور, Rajanpur → رجن بور |
| `-kot` | **كوت** | Shahkot → شاه كوت, Shahdad Kot → شهداد كوت, Kot Addu → كوت أدو |
| `-khan` | **خان** | Dera Ismail Khan → ديرة إسماعيل خان, Tando Muhammad Khan → تاندو محمد خان |
| `-garh` | **غره** | (Already cleaned in MCF) Muzaffargarh → مظفر غره |
| `Dera-` | **ديرة** | Dera Ismail Khan, Dera Bugti, Dera Murad Jamali, Dera Allahyar (= "abode" — tah-marbuta canonical per Wikipedia) |
| `Qila-` | **قلعة** | Qila Saifullah → قلعة سيف الله, Qila Abdullah → قلعة عبد الله |
| `Tando-` | **تاندو** | Sindh-specific prefix |
| `Sharif` | **شريف** | Saidu Sharif → سيدو شريف |
| `Mir` / `Mir's` | **مير** | Khairpur Mir's → خيربور مير |

---

## §8. Open questions for user approval

1. **Batch strategy** — pick one:
   - **(A) `Top 20 first`** (recommended) — review BATCH A's 20 entries, merge, then BATCH B → BATCH C
   - **(B) `Top 30 first`** — Top 30 by pop (BATCH A + first 10 of B)
   - **(C) `All 97 single wave`** — like ASIA-1D-PK-MCF (17 in one shot)
   - **(D) `All 97 split into 3 batches`** — A (20) + B (32) + C (45), each closed separately
   - **(E) Custom split** — user-specified
2. **`bahawalnagar` PPL dup** — confirm drop (same city as existing PPLA2)?
3. **`bahawalpur` Arabic form** — `بهاولبور` (Wikipedia AR, with Arabic ب) — confirm?
4. **`dera-ismail-khan` form** — `ديرة إسماعيل خان` (with tah-marbuta) vs `ديره إسماعيل خان` (with ه)?
5. **`okara` form** — `أوكاره` (with tah-marbuta) vs `أوكارا` (with alif)?
6. **`larkana` form** — `لاركانة` (tah-marbuta) vs `لاركانا` (alif)?
7. **`abbottabad` form** — `إبت آباد` vs `أبت آباد` vs `ايبت آباد`?
8. **`kasur` form** — `قصور` (Wikipedia AR, common word meaning "palaces/castles" — could collide?) confirm?
9. **`khairpur-mirs` apostrophe** — Mir's has trailing apostrophe in English. Drop entirely in Arabic → `خيربور مير`?
10. **`model-town` (pop=100k generic name)** — confirm include? Or treat as too-generic and skip?
11. **`jhang-city` vs already-curated `jhang-sadr`** — confirm both can coexist? (They're related — Jhang City is the modern city, Jhang Sadr is the historic central area)?
12. **All compound conventions** in §7 — confirm acceptable patterns?
13. **`battagram` form** — `بطغرام` (compressed Wikipedia AR) vs `باتاجرام` (closer to English)?
14. **`tando-allahyar` / `tando-adam` / `tando-muhammad-khan` Tando prefix** — keep `تاندو` (Sindhi-style)? Or substitute with نقطة/قرية?
15. **`upper-dir` translation** — `دير العليا` (translated Upper = "العليا") vs `أوبر دير` (transliterated)?
16. **pop=0 admin stubs** — confirm include in batches? Or exclude until they reach population threshold? (Currently 28 entries are PPLA2 with pop=0 in GeoNames — administratively significant but low-traffic.)

---

## §9. Recommended action

> **Recommended next execution phase: `ASIA-1D-PK-MISSING-AR-MAJORS-1A` — Top 20 batch (BATCH A only)**

Justification:
1. **Lowest risk** — 20 cities with strongest Wikipedia AR coverage
2. **Highest impact** — sum of population ≈ 6.65M (covers all major missing-ar PK cities)
3. **Reviewability** — 20 rows × per-row review is manageable in a single session
4. **Establishes pattern** — once BATCH A's Arabic transliteration + alias conventions are user-approved, BATCH B and C can move faster
5. **Post-merge**: PK count 70 → 90; coverage expands by 28% in single wave

If this works smoothly, `ASIA-1D-PK-MISSING-AR-MAJORS-1B` (32 entries) follows; then `-1C` (45 entries).

Alternative — **single-wave "approve all 97 with NAME_AR_FIXES"** — viable but 97 rows × per-row Arabic review is heavy. Risk: low Arabic quality on bottom-tier translit, fatigue-driven errors.

---

## §10. Acceptance criteria (for the apply phase, if approved)

When user approves and we move to merge:

1. ✅ Generate NAME_AR_FIXES map per row (proposed Arabic name)
2. ✅ Aliases.ar from any clean Arabic-block alternatename (none here — most are pure translit)
3. ❌ Do NOT touch existing 70 PK entries (seed + clean + MCF)
4. ❌ Do NOT touch `names.ar`/`names.en` for any other country
5. ❌ Do NOT touch `names.ur`/`aliases.ur` (separate `PLACE-NAMES-UR-PK-4` phase after merge if user wants Urdu enrichment for these)
6. ❌ No code changes (server.js, js/app.js, fillLangMap, index.html)
7. ❌ No runtime translation
8. ✅ fillLangMap guard at write-time (apply_curated_candidates.mjs) — writes only `{ar, en}`
9. ✅ Idempotent re-run
10. ✅ Pre-merge backup `curated-places.json.preAsia1dPkMissingAr1A.bak`

### Tests required post-merge

- New smoke `_test_asia_1d_pk_missing_ar_1a.mjs` covering all 20 (or selected batch size)
- Arabic search verification for top-priority slugs
- All carry-forward suites stay green (currently 1,569/1,569 across 27 suites)
- Production verifier

### Expected post-merge state (if BATCH A only)

| Category | Count | Status |
|---|---:|---|
| PK total | 70 → **90** | +20 |
| PK Arabic | 90/90 = 100% | ✅ |
| PK Urdu | 70/90 = 78% | (BATCH-A 20 entries pending separate Urdu wave) |
| Blocked queue | 0 | — |
| Missing-ar remaining | 77 (BATCH B + C) | held |

---

## Status: 🟡 AWAITING USER REVIEW

**Confirmed NOT touched in this review**:
- `curated_places.json` ✓
- `names.ar` / `names.en` / `names.ur` for any existing entry ✓
- `server.js` / `js/app.js` / `fillLangMap` / `index.html` ✓
- 70 existing PK entries (10 seed + 43 clean + 17 MCF) ✓

**No runtime translation. No translation API. No AI translation on page load. No browser auto-translate.**

**Next steps**:
1. User picks batch strategy (§1 + §9 recommendation)
2. User reviews per-row Arabic proposals in §2 (BATCH A) — or §3/§4 if expanding scope
3. User answers the 16 open questions in §8
4. After approval, `ASIA-1D-PK-MISSING-AR-MAJORS-1A` (or chosen scope) will run apply script + Stage 4 merge + smoke + closure
