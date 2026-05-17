# ASIA-1E-BLOCKED-MAJOR-CITIES-FIX-1 — Review Report

**Phase**: `ASIA-1E-BLOCKED-MAJOR-CITIES-FIX-1` (REVIEW-ONLY — NO MERGE)
**Generated**: 2026-05-17
**Scope**: 72 blocked-major candidates from `CURATED-GEODATA-ASIA-1E`
**Status**: ⏸ **awaiting user approval for proposed Arabic names + slugs**

---

## What this report IS / IS NOT

- ✅ Comprehensive review of all 72 blocked majors with proposed Arabic names
- ✅ Collision audit (vs curated + intra-wave)
- ✅ Mechanical Persian/Urdu/mojibake cleaning preview
- ❌ NOT a merge — `curated-places.json` untouched
- ❌ NOT a Stage 4 — candidate JSONs untouched

---

## Top-line numbers

| Metric | Count |
| --- | ---: |
| Total candidates | **72** |
| Per-country | MM 7 / NP 6 / LK 3 / BT 17 / LA 9 / KH 12 / BN 2 / TL 3 / MV 13 |
| Vs curated collisions | **0** (all 72 slugs FREE in curated) |
| Intra-wave / cross-wave collisions (real) | **2** (kh/kep ⟷ vn/kep PPL, bn/bangar ⟷ ph/bangar PPLA3) |
| Intra-wave spurious-collisions (pop=0 stubs) | 4 (tl/suai, la/sekong, tl/same, bt/daga, mv/muli) |
| `mixed_script` (Persian/Urdu chars) | 41 |
| `mixed_latin` (Latin in name.ar) | 14 |
| `mixed_unknown` (Uyghur/Pashto chars) | 5 |
| PPLC capitals blocked | 2 (bt/thimphu, bn/bandar-seri-begawan) |
| pop ≥ 200k | 3 (mawlamyine, bharatpur, amarapura) |
| pop ≥ 100k | 13 |
| pop < 1k (tiny PPLAs) | 14 (mostly MV atoll capitals + BT tiny dzongkhags) |
| pop = 0 (admin-only stubs) | 2 (bt/lungtenzampa, mv/nilandhoo) |

---

## Cleaning rules applied

Same as ASIA-1B-MCF / ASIA-1C-MCF / ASIA-1E:

```
ی → ي    ک → ك    پ → ب    گ → غ (default)    چ → ج
ٹ → ت    ڈ → د    ڑ → ر    ہ → ه    ے → ي    ۀ → ه
ZWNJ/ZWJ/tatweel → strip
Uyghur ۋ ې ۆ ۇ ۈ ى ڭ → manual replace per entry (not mechanical)
```

---

## A. PRIORITY entries (user-mentioned + critical capitals + pop ≥ 100k) — 13 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug recommendation | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 1 | mm/`mawlamyine` | Mawlamyine | 438,861 | PPLA | Asia/Yangon | `ماولامیئن` | **`مولامين`** (canonical AR Wikipedia) | mixed_script (ی) | FREE | **bare** | ❌ |
| 2 | np/`bharatpur` | Bharatpur | 369,377 | PPL | Asia/Kathmandu | `باراتپور، نپال` | **`بهاراتبور`** (drop ، نبال suffix) | mixed_script (پ) | FREE | **bare** | ❌ |
| 3 | mm/`amarapura` | Amarapura | 237,618 | PPLA3 | Asia/Yangon | `امراپورا` | **`أمارابورا`** (mechanical clean + hamza-alif) | mixed_script (پ) | FREE | **bare** | ❌ |
| 4 | np/`hetauda` | Hetauda | 195,951 | PPL | Asia/Kathmandu | `ہیٹوڈا` | **`هيتاودا`** (mechanical clean) | mixed_script (ہ ی ٹ ڈ) | FREE | **bare** | ❌ |
| 5 | lk/`maharagama` | Maharagama | 195,355 | PPL | Asia/Colombo | `ماهاراگاما` | **`ماهاراغاما`** (mechanical: گ→غ) | mixed_script (گ) | FREE | **bare** | ❌ |
| 6 | np/`butwal` | **Butwāl** | 195,054 | PPLA | Asia/Kathmandu | `bٹwal` | **`بوتوال`** (use clean alias) | mixed_latin + Persian | FREE | **bare** | ❌ |
| 7 | mm/`meiktila` | Meiktila | 177,442 | PPL | Asia/Yangon | `میئکتیلا` | **`مييكتيلا`** (mechanical clean) | mixed_script (ی ک) | FREE | **bare** | ❌ |
| 8 | np/`birendranagar` | Birendranagar | 154,886 | PPLA | Asia/Kathmandu | `بریندرنگر` | **`بيريندراناغار`** (mechanical clean + read better) | mixed_script (ی گ) | FREE | **bare** | ❌ |
| 9 | mm/`dawei` | Dawei | 136,783 | PPLA | Asia/Yangon | `داوئی` | **`داوي`** (use clean alias) | mixed_script (ی) | FREE | **bare** | ❌ |
| 10 | mm/`pyay` | Pyay | 135,308 | PPL | Asia/Yangon | `پیاے` | **`بياي`** (mechanical: پ→ب ی→ي ے→ي) | mixed_script (پ ی ے) | FREE | **bare** | ❌ |
| 11 | mm/`hinthada` | Hinthada | 134,947 | PPL | Asia/Yangon | `حینتھادا` | **`هينثادا`** (use clean alias, ح→ه correction) | mixed_script (ی + ح wrong) | FREE | **bare** | ❌ |
| 12 | np/`madhyapur-thimi` | Madhyapur Thimi | 119,955 | PPL | Asia/Kathmandu | `مدھیہپور تھمی` | **`مادهيابور تيمي`** (mechanical + Arabicize) | mixed_script | FREE | **bare** | ❌ |
| 13 | **lk/`trincomalee`** | Trincomalee | 108,420 | PPLA | Asia/Colombo | `ترنکومالی` | **`ترينكومالي`** ✓ user-suggested (use clean alias) | mixed_script (ک ی) | FREE | **bare** | ❌ |

---

## B. User-priority PPLC capitals (2 entries — explicit user requests)

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug recommendation | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 14 | **bt/`thimphu`** ⭐ | Thimphu | **98,676** | **PPLC** | Asia/Thimphu | `تىمپۇ` (Uyghur ى ۇ + Persian پ) | **`ثيمفو`** ✓ user-suggested | mixed_unknown (Uyghur) | FREE | **bare** | ❌ |
| 15 | **bn/`bandar-seri-begawan`** ⭐ | Bandar Seri Begawan | **64,409** | **PPLC** | Asia/Brunei | `باندار سەرى بەگاۋان` (Uyghur ە ۋ + Persian گ) | **`بندر سري بكاوان`** ✓ user-suggested (alt: `بندر سيري بكاوان` or `بندر سري بغاوان`) | mixed_unknown (Uyghur) | FREE | **bare** | ❌ |

**Note**: BN bandar-seri-begawan is the prayer-times-app's natural audience capital (Brunei 78% Muslim). Strongly recommend using canonical Arabic media form `بندر سري بكاوان`.

---

## C. Mid-tier blocked majors (pop 30k-100k) — 11 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug rec. | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 16 | mm/`magway` | Magway | 96,954 | PPLA | Asia/Yangon | `mygwے` | **`ماغوي`** (use clean alias) | mixed_latin+Persian | FREE | **bare** | ❌ |
| 17 | **la/`thakhek`** | Thakhek | 90,800 | PPLA | Asia/Vientiane | `tھakhyk` | **`تاخك`** (use clean alias; KH = خ) | mixed_latin+Persian | FREE | **bare** | ❌ |
| 18 | kh/`kampong-chhnang` | Kampong Chhnang | 75,244 | PPLA | Asia/Phnom_Penh | `kmpwng chھnang` | **`كامبونغ تشنانغ`** (canonical) | mixed_latin | FREE | **bare** | ❌ |
| 19 | **kh/`sihanoukville`** | Sihanoukville | 73,036 | PPLA | Asia/Phnom_Penh | `syhanwk wېl` | **`سيهانوكفيل`** (use clean alias) | mixed_latin+Uyghur | FREE | **bare** | ❌ |
| 20 | lk/`anuradhapura` | Anuradhapura | 60,943 | PPLA | Asia/Colombo | `anwrad ھa pwra` | **`أنورادابورا`** (use clean alias) | mixed_latin | FREE | **bare** | ❌ |
| 21 | **la/`luang-prabang`** | Luang Prabang | 55,027 | PPLA | Asia/Vientiane | `لوآنگ پرابانگ` | **`لوانغ برابانغ`** (mechanical: گ→غ پ→ب) | mixed_script | FREE | **bare** | ❌ |
| 22 | la/`muang-phonsavan` | Muang Phônsavan | 37,507 | PPLA | Asia/Vientiane | `مواang فونسافان` | **`موانغ فونساوان`** (use clean alias) | mixed_latin | FREE | **bare** | ❌ |
| 23 | kh/`kep` ⚠️ | Kep | 35,990 | PPLA | Asia/Phnom_Penh | `كيب` (already clean!) | **`كيب`** (keep as-is) | over-flagged | **vn/kep PPL pop=11,832** — real cross-wave collision | **bare `kep`** + override note (kh PPLA dominates vn PPL) | ❌ |
| 24 | kh/`koh-kong` | Koh Kong | 33,134 | PPLA | Asia/Phnom_Penh | `kwہ kang` | **`كوه كونغ`** (use clean alias) | mixed_latin | FREE | **bare** | ❌ |
| 25 | kh/`prey-veng` | Prey Veng | 33,079 | PPLA | Asia/Phnom_Penh | `pryے wyng` | **`بريي فينغ`** (canonical) | mixed_latin+Persian | FREE | **bare** | ❌ |
| 26 | kh/`suong` | Suong | 30,000 | PPLA | Asia/Phnom_Penh | `swwnګ` (Pashto ګ) | **`سوونغ`** | mixed_unknown (Pashto) | FREE | **bare** | ❌ |

---

## D. Smaller PPLAs (pop 10k-30k) — 16 entries

| # | cc/slug | en | pop | fc | name.ar current | name.ar **proposed** | block reason | collision | slug rec. | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|
| 27 | bt/`phuntsholing` | Phuntsholing | 27,658 | PPL | `پھونتشولنگ` | **`بونتشولينغ`** (mechanical clean) | mixed_script | FREE | bare | ❌ |
| 28 | kh/`stung-treng` | Stung Treng | 25,000 | PPLA | `sٹng ٹrng` | **`ستونغ ترينغ`** (use clean alias + canonical) | mixed_latin+Persian | FREE | bare | ❌ |
| 29 | la/`muang-xay` | Muang Xay | 25,000 | PPLA | `mwang saے` | **`موانغ ساي`** (canonical) | mixed_latin+Persian | FREE | bare | ❌ |
| 30 | kh/`tbeng-meanchey` | Tbeng Meanchey | 24,380 | PPLA | `تبنج میانچی` | **`تبينغ ميانتشي`** (mechanical clean) | mixed_script | FREE | bare | ❌ |
| 31 | kh/`svay-rieng` | Svay Rieng | 23,956 | PPLA | `swې rynګ` | **`سفاي رينغ`** (use clean alias) | mixed_unknown+Pashto | FREE | bare | ❌ |
| 32 | bt/`tsirang` | Tsirang | 22,376 | PPLA | `tsyranګ` | **`تسيرانغ`** (use clean alias) | mixed_latin+Pashto | FREE | bare | ❌ |
| 33 | np/`dhankuta` | Dhankuta | 22,084 | PPLA | `dھnkwta` | **`دانكوتا`** (mechanical clean) | mixed_latin+Persian | FREE | bare | ❌ |
| 34 | **tl/`suai`** | Suai | 21,539 | PPLA | `سوائی` | **`سواي`** (mechanical: ی→ي + strip hamza) | mixed_script (ی) | spurious intra-wave (id/my pop=0) | **bare** + override | ❌ |
| 35 | **bt/`punakha`** | Punakha | 21,500 | PPLA | `pwnakھa` | **`بوناخا`** (use clean alias) | mixed_latin+Persian | FREE | bare | ❌ |
| 36 | la/`sekong` | Sekong | 20,116 | PPLA | `سيكونج` (clean! ج not غ) | **`سيكونغ`** (correct ج→غ for "ng" sound) | over-flagged + correction | spurious intra-wave (kh/id pop=0) | **bare** + override | ❌ |
| 37 | kh/`kratie` | Kratié | 19,975 | PPLA | `kryٹy` | **`كراتي`** (use clean alias) | mixed_latin+Persian | FREE | bare | ❌ |
| 38 | kh/`kampong-thom` | Kampong Thom | 19,951 | PPLA | `kmpwng ٹm` | **`كامبونغ توم`** (use clean alias) | mixed_latin+Persian | FREE | bare | ❌ |
| 39 | kh/`banlung` | Banlung | 17,000 | PPLA | `بانلنگ` | **`بانلونغ`** (mechanical + read better) | mixed_script (گ) | FREE | bare | ❌ |
| 40 | bt/`pemagatshel` | Pemagatshel | 13,864 | PPLA | `pymaګtshyl` | **`بيماغاتشيل`** (use clean alias) | mixed_latin+Pashto | FREE | bare | ❌ |
| 41 | la/`ban-houayxay` | Ban Houayxay | 12,500 | PPLA | `ban ہwayے saے` | **`بان هواي ساي`** | mixed_latin+Persian | FREE | bare | ❌ |
| 42 | mv/`fuvahmulah` | Fuvahmulah | 11,140 | PPLA | `fwwہ mwlaہ` | **`فوفاهمولاه`** (use clean alias) | mixed_latin+Persian | FREE | bare | ❌ |

---

## E. Tiny PPLAs (pop 1k-10k) — 23 entries

| # | cc/slug | en | pop | fc | name.ar current | name.ar **proposed** | block reason | collision | slug rec. | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|
| 43 | bt/`sarpang` | Sarpang | 10,416 | PPLA | `sarpnګ` | **`ساربانغ`** (use clean alias) | mixed_latin+Pashto | FREE | bare | ❌ |
| 44 | la/`muang-phon-hong` | Muang Phôn-Hông | 10,112 | PPLA | `mwang fwn-ہang` | **`موانغ فون هونغ`** | mixed_latin+Persian | FREE | bare | ❌ |
| 45 | mv/`kulhudhuffushi` | Kulhudhuffushi | 9,500 | PPLA | `kwlھwdwfwshy` | **`كولهودوفوشي`** | mixed_latin+Persian | FREE | bare | ❌ |
| 46 | bt/`samdrup-jongkhar` | Samdrup Jongkhar | 9,325 | PPLA | `samdrwp jwnګkhar` | **`سامدروب جونغخار`** (use clean alias) | mixed_latin+Pashto | FREE | bare | ❌ |
| 47 | bt/`wangdue-phodrang` | Wangdue Phodrang | 8,954 | PPLA | `wangdyw fwڈrang` | **`وانغدو فودرانغ`** (use clean alias) | mixed_latin+Persian | FREE | bare | ❌ |
| 48 | **tl/`same`** | Same | 7,500 | PPLA | `saہmے  mshrqy tymwr` | **`سامي`** (drop "  مشرقي تيمور" suffix) | mixed_latin+Persian | spurious intra-wave (mm pop=0) | **bare** + override | ❌ |
| 49 | mv/`thinadhoo` | Thinadhoo | 6,376 | PPLA | `tھynaڈھw` | **`ثينادو`** (mechanical clean) | mixed_latin+Persian | FREE | bare | ❌ |
| 50 | bt/`samtse` | Samtse | 5,396 | PPLA | `samtsې` | **`سامتسي`** (Uyghur ې→ي) | mixed_unknown (Uyghur) | FREE | bare | ❌ |
| 51 | mv/`naifaru` | Naifaru | 5,044 | PPLA | `nayy farwں` | **`نايفارو`** | mixed_latin | FREE | bare | ❌ |
| 52 | tl/`pante-makasar` | Pante Makasar | 4,730 | PPLA | `pantے makasar` | **`بانتي ماكاسار`** (use clean alias) | mixed_latin+Persian | FREE | bare | ❌ |
| 53 | la/`attapeu` | Attapeu | 4,297 | PPLA | `aٹapyw` | **`أتابيو`** (use clean alias) | mixed_latin+Persian | FREE | bare | ❌ |
| 54 | **bn/`bangar`** ⚠️ | Bangar | 3,970 | PPLA | `بانجار` (already clean!) | **`بنغار`** (use clean alias — more accurate "Bangar") | over-flagged | **ph/bangar PPLA3 pop=11,068** — real cross-wave collision risk | **`bangar-bn`** suffix recommended (PH version larger) | ✅ **YES** |
| 55 | la/`luang-namtha` | Luang Namtha | 3,225 | PPLA | `lwang namtھa` | **`لوانغ نامثا`** | mixed_latin+Persian | FREE | bare | ❌ |
| 56 | bt/`trashi-yangtse` | Trashi Yangtse | 3,025 | PPLA | `trashy yanګtsې` | **`تراشي يانغتسي`** (use clean alias) | mixed_latin+Pashto+Uyghur | FREE | bare | ❌ |
| 57 | bt/`mongar` | Mongar | 2,969 | PPLA | `mwnګar` | **`مونغار`** (use clean alias) | mixed_latin+Pashto | FREE | bare | ❌ |
| 58 | mv/`funadhoo` | Funadhoo | 2,900 | PPLA | `fna ڈھw` | **`فونادو`** | mixed_latin+Persian | FREE | bare | ❌ |
| 59 | mv/`eydhafushi` | Eydhafushi | 2,808 | PPLA | `ayydھa fwshy` | **`إيدافوشي`** | mixed_latin+Persian | FREE | bare | ❌ |
| 60 | bt/`trongsa` | Trongsa | 2,805 | PPLA | `trwnګsa` | **`ترونغسا`** (use clean alias) | mixed_latin+Pashto | FREE | bare | ❌ |
| 61 | bt/`daga` | Daga | 2,243 | PPLA | `daګa` | **`داغا`** (use clean alias) | mixed_latin+Pashto | spurious intra-wave (np/mm/ph pop=0) | **bare** + override | ❌ |
| 62 | mv/`mahibadhoo` | Mahibadhoo | 2,156 | PPLA | `maہy badھw` | **`ماهيبادو`** (use clean alias) | mixed_latin+Persian | FREE | bare | ❌ |
| 63 | bt/`lhuentse` | Lhuentse | 1,935 | PPLA | `lhwyntsې` | **`لهوينتسي`** (Uyghur ې→ي) | mixed_latin+Uyghur | FREE | bare | ❌ |
| 64 | mv/`fonadhoo` | Fonadhoo | 1,773 | PPLA | `fwna ڈھw` | **`فونادو`** | mixed_latin+Persian | FREE | bare | ❌ |
| 65 | mv/`manadhoo` | Manadhoo | 1,580 | PPLA | `mnaڈھw` | **`ماندو`** | mixed_latin+Persian | FREE | bare | ❌ |
| 66 | mv/`kudahuvadhoo` | Kudahuvadhoo | 1,562 | PPLA | `kڈaہwwadھw` | **`كودا هوفادو`** | mixed_latin+Persian | FREE | bare | ❌ |

---

## F. Tiniest entries (pop < 1k OR pop=0 admin stubs) — 6 entries

| # | cc/slug | en | pop | fc | name.ar current | name.ar **proposed** | block reason | collision | slug rec. | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|
| 67 | mv/`muli` | Muli | 1,008 | PPLA | `مولي` (clean!) | **`مولي`** (keep as-is) | over-flagged | spurious intra-wave (np/id/ph pop=0) | **bare** + override | ❌ |
| 68 | bt/`trashigang` | Trashigang | 872 | PPLA | `trashyګnګ` | **`تراشيغانغ`** (use clean alias) | mixed_latin+Pashto | FREE | bare | ❌ |
| 69 | bt/`shemgang` | Shemgang | 852 | PPLA | `shymګnګ` | **`شيمغانغ`** | mixed_latin+Pashto | FREE | bare | ❌ |
| 70 | mv/`felidhoo`  | Felidhoo | 541 | PPLA | `fyly ڈھw` | **`فيليدو`** | mixed_latin+Persian | FREE | bare | ❌ |
| 71 | mv/`nilandhoo` | Nilandhoo | **0** | PPLA | `nylandھw` | **`نيلاندو`** | mixed_latin+Persian | FREE | **bare** (or **EXCLUDE** — pop=0) | ❌ |
| 72 | bt/`lungtenzampa` | Lungtenzampa | **0** | PPLA | `lnګtnzmpa` | **`لونغتنزامبا`** | mixed_latin+Pashto | FREE | **bare** (or **EXCLUDE** — pop=0) | ❌ |

---

## G. Collision deep-dive — real cross-wave collisions (2)

### G.1 `kep` — kh PPLA 36k vs vn PPL 12k

| Wave | cc | slug | pop | fc | Arabic |
| --- | --- | --- | ---: | --- | --- |
| ASIA-1E-MCF | **kh** | kep | 35,990 | **PPLA** | `كيب` (proposed) |
| ASIA-1B-needs_review | vn | kep | 11,832 | PPL | (not currently merged) |

**Recommendation**: kh/kep takes **bare slug `kep`** (administrative seat of Kep Province in Cambodia; the VN entry is a small village that wasn't merged in ASIA-1B). If user later requests vn/kep merge, suffix it as `kep-vn`. Same pattern as ASIA-1B precedents.

### G.2 `bangar` — bn PPLA 4k vs ph PPLA3 11k

| Wave | cc | slug | pop | fc | Arabic |
| --- | --- | --- | ---: | --- | --- |
| ASIA-1E-MCF | bn | bangar | 3,970 | PPLA | `بنغار` (proposed) |
| ASIA-1B-needs_review | **ph** | bangar | 11,068 | **PPLA3** | (not merged) |

**Recommendation**: This is a real collision risk. PH version has higher pop (PPLA3 = village/3rd-order admin). Recommend **`bangar-bn`** suffix to reserve `bangar` for future PH merge. ⚠️ This is the ONLY rename in this wave.

---

## H. Summary — what gets merged + what changes

### Recommended merge set (72 entries):
- **71 bare slugs** (consistent with ASIA-1B-MCF / ASIA-1C-MCF pattern)
- **1 rename**: `bn/bangar → bn/bangar-bn` (avoid future ph collision)
- **5 spurious-collision overrides**: tl/suai, la/sekong, tl/same, bt/daga, mv/muli (all only collide with pop=0 PPL stubs — bare slug with `_collisionOverrideReason` audit)
- **1 real-collision override**: kh/kep (vs vn/kep PPL pop=12k — but vn entry not merged + kh is PPLA seat)
- **0 NAME_AR_FIXES needed for already-clean entries** (kh/kep, la/sekong, bn/bangar, mv/muli already pass clean-check but need cosmetic refinement)
- **66 NAME_AR_FIXES** (manual user-approved Arabic for blocked entries)

### Optional exclude:
- `mv/nilandhoo` (pop=0) and `bt/lungtenzampa` (pop=0) — pure admin stubs with no real residents. Recommend EXCLUDE unless user wants ZERO-population PPLA seats for completeness.

### Decisions needed from user:

| # | Question | Recommendation |
|---|---|---|
| 1 | Approve all proposed Arabic names (66 fixes + 6 already-clean)? | ✅ approve A |
| 2 | `bt/thimphu` → "ثيمفو" (user-suggested) | ✅ |
| 3 | `bn/bandar-seri-begawan` → "بندر سري بكاوان" (user-suggested) | ✅ |
| 4 | `lk/trincomalee` → "ترينكومالي" (user-suggested) | ✅ |
| 5 | Use `bangar-bn` slug (vs bare bangar) for bn/bangar | ✅ rename |
| 6 | `kh/kep` bare slug (vs kep-kh) — real PPL collision but VN entry tiny | ✅ bare + override |
| 7 | EXCLUDE pop=0 entries (mv/nilandhoo + bt/lungtenzampa)? | 🟡 exclude (cleaner) — but include if user wants admin completeness |

---

## I. Cosmetic-only aliases (not blocking merge)

Per ASIA-1B-MCF / ASIA-1C-MCF precedent, dirty aliases.ar will be cleaned automatically during clean-approve:
- Persian/Urdu chars → Arabic equivalents
- Latin/mojibake aliases → dropped
- Stage 3.5 already counted ~63 dirty aliases across the 72

---

## J. What this report did NOT change

- ❌ `db/places/curated-places.json` — untouched (still 2,029)
- ❌ Candidate JSONs — untouched (72 still status=pending)
- ❌ `server.js`, `js/app.js`, `index.html` — untouched
- ❌ Supabase tables / homepage search / v1 fallback — untouched
- ❌ No new files created
- ❌ No `_asia_1e_blocked_major_cities_approve.mjs` yet (created only after approval)

---

## K. Next steps

Reply with ONE of:

- **`approve A — all 72 with proposed names + bangar-bn rename`** ✅ recommended
- **`approve A but include pop=0`** — include nilandhoo + lungtenzampa
- **`approve A but exclude pop=0`** — drop nilandhoo + lungtenzampa
- **`approve some — list slugs/decisions`** — partial approval (specify per-slug)
- **`fix arabic per row`** — provide manual Arabic for specific entries
- **`exclude slugs`** — drop more from the wave
- **`request more research`** — ask for canonical Arabic Wikipedia URLs / verification

After approval:
1. Create `scripts/geodata/_asia_1e_blocked_major_cities_approve.mjs` (per ASIA-1B/1C-MCF pattern)
2. Apply 66 NAME_AR_FIXES + 6 overrides + 1 rename
3. Run Stage 4 apply per-country (np/lk/mv/bt/bn/mm/kh/la/tl)
4. Run tests (smoke + regression + production verifier)
5. Commit `ASIA-1E-BLOCKED-MAJOR-CITIES-FIX-1`
6. Update memory + closure report

**No merge until user approval.**
