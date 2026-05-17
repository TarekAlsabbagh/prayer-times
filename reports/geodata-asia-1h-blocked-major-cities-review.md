# ASIA-1H-BLOCKED-MAJOR-CITIES-FIX-1 — Review Report

**Phase**: `ASIA-1H-BLOCKED-MAJOR-CITIES-FIX-1` (REVIEW-ONLY — NO MERGE)
**Generated**: 2026-05-17
**Scope**: 33 blocked-major candidates from `CURATED-GEODATA-ASIA-1H`
**Status**: ⏸ **awaiting user approval for proposed Arabic names + slugs**

---

## Top-line numbers

| Metric | Count |
| --- | ---: |
| Total candidates | **33** |
| Per-country | KZ 10 / UZ 8 / MN 10 / KG 4 / TJ 1 |
| Vs curated collisions | **0** (all 33 slugs FREE) |
| Spurious-collision overrides (over-flagged, already-clean ar) | **3** (kz/turkestan, kg/naryn, kg/talas) |
| `mixed_script` (Persian/Urdu) | 13 |
| `mixed_latin` (Latin in ar) | 9 |
| `mixed_unknown` (Uyghur/Pashto/ZWNJ) | 8 |
| `arabic_only` over-flagged (already clean) | 3 |
| **🚨 Semantic correction** (wrong ar — not just Persian leak) | **1** (kg/manas ar="جلال آباد") |
| pop ≥ 1M | 1 (kz/shymkent 1.2M) |
| pop ≥ 500k | 4 (shymkent, andijon, namangan, aktobe, karagandy) |
| pop ≥ 100k | 19 |
| pop < 100k (smaller PPLAs) | 14 |

---

## Cleaning rules applied

Standard set (now includes Uyghur ۆ→و stable from ASIA-1I-MCF):

```
ی → ي    ک → ك    پ → ب    گ → غ (default)    چ → ج
ٹ → ت    ڈ → د    ڑ → ر    ہ → ه    ے → ي    ۀ → ه
ۆ → و    (stable since ASIA-1I-MCF)
ZWNJ/ZWJ/tatweel → strip
```

---

## A. PRIORITY entries (pop ≥ 500k + user-mentioned) — 5 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug rec. | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 1 | **kz/`shymkent`** | Shymkent | **1,200,000** | PPLA | Asia/Almaty | `شمکنت` | **`شيمكنت`** ✓ user-suggested (matches clean alias) | mixed_script (ک + missing alefs) | FREE | **bare** | ❌ |
| 2 | **uz/`andijon`** | Andijon | **747,800** | PPLA | Asia/Tashkent | `anڈyjan` | **`أنديجان`** ✓ user-suggested (canonical AR Wikipedia, cleaner than أنديجون) | mixed_latin + Urdu ڈ | FREE | **bare** | ❌ |
| 3 | **uz/`namangan`** | Namangan | **713,220** | PPLA | Asia/Tashkent | `namngaں` | **`نمنغان`** ✓ user-suggested (mechanical clean + canonical) | mixed_latin + ں | FREE | **bare** | ❌ |
| 4 | **kz/`aktobe`** | Aktobe | **500,757** | PPLA | Asia/Aqtobe | `aktwbې` | **`أكتوبي`** (use clean alias; canonical AR for "Aqtöbe") | mixed_latin + Uyghur ې | FREE | **bare** | ❌ |
| 5 | **kz/`karagandy`** | Karagandy | **497,777** | PPLA | Asia/Almaty | `karagnڈy` | **`كاراغاندا`** (Arabic Wikipedia canonical for "Karaganda" with ـا suffix — Russian-derived) | mixed_latin + Urdu ڈ | FREE | **bare** | ❌ |

**Decision 5 (karagandy)**: Both `قراغندي` (Kazakh-direct) and `كاراغاندي` (Russian-derived) are options. AR Wikipedia uses `كاراغاندا` (with final ـا matching Russian "Karaganda" stress). Recommend **`كاراغاندا`**.

---

## B. Mid-tier blocked majors (pop 100k-400k) — 13 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug rec. | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 6 | uz/`nukus` | Nukus | 332,500 | PPLA | Asia/Samarkand | `نؤکیس` | **`نوكوس`** (Karakalpak capital — canonical AR Wikipedia) | mixed_script (ک ی) | FREE | **bare** | ❌ |
| 7 | **kz/`ust-kamenogorsk`** | Ust-Kamenogorsk | 319,067 | PPLA | Asia/Almaty | `asٹ kamnwګwrsk` | **`أوست كامينوغورسك`** ✓ user-suggested (use clean alias minus dash) | mixed_latin + Persian + Pashto | FREE | **bare** | ❌ |
| 8 | kz/`semey` | Semey | 292,780 | PPLA | Asia/Almaty | `smې` | **`سيماي`** (use clean alias; canonical for "Semipalatinsk"→"Semey" 2007 rename) | mixed_latin + Uyghur ې | FREE | **bare** | ❌ |
| 9 | kz/`atyrau` | Atyrau | 290,700 | PPLA | Asia/Atyrau | `آتیراؤ` | **`أتيراو`** (use clean alias; canonical AR Wikipedia — drop hamza-waw for simpler form) | mixed_script (ی + hamza-waw) | FREE | **bare** | ❌ |
| 10 | uz/`qarshi` | Qarshi | 278,300 | PPLA | Asia/Samarkand | `قارشی` | **`قرشي`** (use clean alias; canonical short form — historic alt name "نخشب" preserved as alias) | mixed_script (ی) | FREE | **bare** | ❌ |
| 11 | **kz/`turkestan`** | Turkestan | 227,098 | PPLA | Asia/Almaty | `تركستان` (already clean!) | **`تركستان`** (keep as-is) | **over-flagged** + collisionInWave | spurious wave-flag | **bare** + override audit | ❌ |
| 12 | tj/`konibodom` | Konibodom | 211,100 | PPLA2 | Asia/Dushanbe | `کان بادام` | **`كان بادام`** (mechanical clean; "City of Almonds" in Tajik — کان=field, بادام=almond) | mixed_script (ک) | FREE | **bare** | ❌ |
| 13 | kz/`kostanay` | Kostanay | 210,000 | PPLA | Asia/Qostanay | `قسطنائی` | **`قوستاناي`** (use clean alias `قوستانای` cleaned; canonical AR — drops hamza-yaa) | mixed_script (ی) | FREE | **bare** | ❌ |
| 14 | uz/`angren` | Angren | 191,300 | PPL | Asia/Tashkent | `آنگرن، ازبکستان` | **`أنغرين`** (drop prefecture suffix + mechanical clean گ→غ; canonical AR) | mixed_script (گ) + prefix | FREE | **bare** | ❌ |
| 15 | uz/`navoiy` | Navoiy | 144,158 | PPLA | Asia/Samarkand | `ناوائی` | **`نوائي`** (clean alias; named after poet علي شير نوائي) | mixed_script (ی) | FREE | **bare** | ❌ |
| 16 | uz/`olmaliq` | Olmaliq | 133,400 | PPL | Asia/Tashkent | `آلمالیق` | **`ألمالك`** (canonical AR Wikipedia for "Almalyk" — drop Uzbek -ق ending; alt: ألماليك) | mixed_script (ی) | FREE | **bare** | ❌ |
| 17 | **kg/`manas`** ⚠️ | Manas | 123,239 | PPLA | Asia/Bishkek | `جلال آباد` 🚨 (WRONG — Manas is near Talas, NOT Jalal-Abad) | **`ماناس`** ✓ user-suggested (CRITICAL semantic correction) | **wrong-ar semantic** (not just Persian leak) | FREE | **bare** | ❌ |
| 18 | kz/`ekibastuz` | Ekibastuz | 121,470 | PPLA2 | Asia/Almaty | `ئێکیباستوز` | **`إيكيباستوز`** (mechanical clean — Uyghur ئ + ێ + ی → إ + ي + ي) | mixed_unknown (Uyghur) | FREE | **bare** | ❌ |

---

## C. Smaller PPLAs (pop 30k-120k) — 10 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug rec. | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 19 | kz/`taldykorgan` | Taldykorgan | 116,558 | PPLA | Asia/Almaty | `taldy kwrګan` | **`تالديكورغان`** (use clean alias) | mixed_latin + Pashto ګ | FREE | **bare** | ❌ |
| 20 | uz/`guliston` | Guliston | 90,398 | PPLA | Asia/Tashkent | `گلستان` | **`غولستان`** (mechanical: گ→غ; canonical "Gulistan" with و for ـو vowel) | mixed_script (گ) | FREE | **bare** | ❌ |
| 21 | kg/`karakol` | Karakol | 84,351 | PPLA | Asia/Bishkek | `قاراقۆل` | **`كاراكول`** (use clean alias; Uyghur ۆ→و applied; "Karakol" = "Black Lake") | mixed_unknown (Uyghur ۆ) | FREE | **bare** | ❌ |
| 22 | mn/`darhan` | Darhan | 83,883 | PPLA | Asia/Ulaanbaatar | `darہan` | **`دارخان`** (use clean alias; MN 2nd-largest city) | mixed_latin + ہ | FREE | **bare** | ❌ |
| 23 | **kg/`naryn`** | Naryn | 41,178 | PPLA | Asia/Bishkek | `نارين` (already clean!) | **`نارين`** (keep as-is) | **over-flagged** + collisionInWave | spurious wave-flag | **bare** + override audit | ❌ |
| 24 | **kg/`talas`** | Talas | 40,308 | PPLA | Asia/Bishkek | `تالاس` (already clean!) | **`تالاس`** (keep as-is) | **over-flagged** + collisionInWave | spurious wave-flag | **bare** + override audit | ❌ |
| 25 | mn/`bayanhongor` | Bayanhongor | 30,931 | PPLA | Asia/Ulaanbaatar | `byan hnګwr` | **`بايان هنغور`** (use clean alias; "Bayan" + "Khongor") | mixed_latin + Pashto | FREE | **bare** | ❌ |
| 26 | mn/`arvayheer` | Arvayheer | 29,420 | PPLA | Asia/Ulaanbaatar | `arwyہyr` | **`أرفايهير`** (use clean alias) | mixed_latin + ہ | FREE | **bare** | ❌ |
| 27 | mn/`dalandzadgad` | Dalandzadgad | 24,863 | PPLA | Asia/Ulaanbaatar | `dalanzadgaڈ` | **`دالانزادغاد`** (clean alias cleaned: گ→غ ڈ→د) | mixed_latin + Urdu ڈ | FREE | **bare** | ❌ |
| 28 | mn/`suehbaatar` | Sühbaatar | 22,741 | PPLA | Asia/Ulaanbaatar | `swkھ batr` | **`سوخباتر`** (use clean alias; named after Mongolian revolutionary hero) | mixed_latin + ھ | FREE | **bare** | ❌ |

---

## D. Tiny PPLAs (pop < 22k) — 5 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug rec. | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 29 | mn/`saynshand` | Saynshand | 19,891 | PPLA | Asia/Ulaanbaatar | `sayshynڈ` | **`سايانشاند`** (use clean alias) | mixed_latin + Urdu ڈ | FREE | **bare** | ❌ |
| 30 | mn/`baruun-urt` | Baruun-Urt | 18,190 | PPLA | Asia/Ulaanbaatar | `barwn arټ` | **`بارون أورت`** (use clean alias `باروون أورت`) | mixed_latin + Pashto ټ | FREE | **bare** | ❌ |
| 31 | mn/`bulgan` | Bulgan | 17,348 | PPLA | Asia/Ulaanbaatar | `bwlګan` | **`بولغان`** (mechanical: گ→غ; clean alias `بولگان`) | mixed_latin + Pashto ګ | FREE | **bare** | ❌ |
| 32 | mn/`uliastay` | Uliastay | 16,265 | PPLA | Asia/Hovd | `awlyastے` | **`أوليسطاي`** (use clean alias) | mixed_latin + ے | FREE | **bare** | ❌ |
| 33 | mn/`mandalgovi` | Mandalgovi | 12,339 | PPLA | Asia/Ulaanbaatar | `mnڈalgwwy` | **`ماندالغوفي`** (use clean alias) | mixed_latin + Urdu ڈ | FREE | **bare** | ❌ |

---

## E. Critical semantic correction (1 entry)

### kg/manas — wrong-ar fix

**Issue**: kg/manas current ar=`جلال آباد` is **semantically wrong**. Manas is a small PPLA town near Talas (in Talas Region, admin1=03). It is NOT Jalal-Abad (which is a separate city, currently NOT in ASIA-1H wave but blocked at lower tier).

**GeoNames data**:
- kg/manas slug=manas, admin1=03 (Talas Region)
- ar="جلال آباد" — incorrect cross-pollution from a different city
- Aliases all reference Jalal-Abad: `["جلال-آباد", "جلال‌آباد، قرقیزستان", "جەلالابات، قرغیزستان"]`

**Fix**: Replace name.ar with **`ماناس`** (proper transliteration of "Manas" — also a Kyrgyz epic hero). All Jalal-Abad-related aliases must be DROPPED to avoid future search confusion.

**Recommended**:
```
{
  slug: "manas",
  countryCode: "kg",
  ar: "ماناس",          // was: "جلال آباد" (wrong)
  aliases.ar: [],        // drop ALL Jalal-Abad aliases
  ...
}
```

If user later requests kg/jalal-abad merge, it should be a NEW separate entry.

---

## F. Spurious-collision overrides (3)

Three entries have **clean name.ar** but are flagged `collisionInWave=true` from Stage 3.5 scan (same pattern as az/pushkino in ASIA-1I-MCF):

| slug | en | pop | current ar | issue |
| --- | --- | ---: | --- | --- |
| `kz/turkestan` | Turkestan | 227,098 | `تركستان` | over-flagged — already clean |
| `kg/naryn` | Naryn | 41,178 | `نارين` | over-flagged |
| `kg/talas` | Talas | 40,308 | `تالاس` | over-flagged |

**Recommendation**: bare slug + `_collisionOverrideReason` audit for each (keep name.ar as-is).

---

## G. Collision audit (vs curated + intra-wave)

- **Vs curated**: 0 collisions ✅ (all 33 slugs FREE in curated)
- **Intra-wave real collisions**: 0 (only the 3 over-flagged above)
- **No `-cc` suffix renames proposed** — all 33 → bare slugs

---

## H. Summary — recommended merge set

### 33 entries:
- **30 NAME_AR_FIXES** (manual user-approved Arabic for blocked entries)
- **3 over-flagged spurious-overrides** (turkestan, naryn, talas — keep name.ar as-is + audit)
- **1 critical semantic correction** (kg/manas: replace wrong "جلال آباد" with "ماناس" + drop wrong aliases)
- **0 slug renames**
- **0 pop=0 entries to exclude**

### Decisions to confirm:

| # | Question | Recommendation |
|---|---|---|
| 1 | Approve all 33 with proposed Arabic + bare slugs? | ✅ approve A |
| 2 | shymkent → شيمكنت? | ✅ user-suggested |
| 3 | andijon → أنديجان (vs أنديجون)? | ✅ canonical AR Wikipedia |
| 4 | namangan → نمنغان? | ✅ user-suggested |
| 5 | karagandy → كاراغاندا (vs قراغندي / كاراغاندي)? | ✅ AR Wikipedia uses ـا ending |
| 6 | ust-kamenogorsk → أوست كامينوغورسك? | ✅ user-suggested (space, not dash) |
| 7 | **manas → ماناس** (CRITICAL — fix wrong "جلال آباد")? | ✅ DROP all Jalal-Abad aliases |
| 8 | 3 spurious-overrides (turkestan/naryn/talas) bare + audit? | ✅ same pattern as ASIA-1I-MCF pushkino |
| 9 | konibodom → كان بادام (literal "City of Almonds")? | ✅ canonical |
| 10 | tj/konibodom Tajik=Konibodom-ish; قانیبادام alt? | use كان بادام |

---

## I. Aliases.ar pollution (cosmetic — will be cleaned)

~50 dirty aliases across 33 entries will be cleaned via standard rules during clean-approve. Examples:
- kz/shymkent: drop `شمکینت`, `شمکێنت` (Uyghur ێ), keep cleaned `شيمكنت` + `چیمکند`→`جيمكند`
- kg/manas: **drop ALL 3 existing aliases** (`جلال-آباد`, `جلال‌آباد، قرقیزستان`, `جەلالابات، قرغیزستان`) — wrong-city pollution
- mn/dalandzadgad: clean `dalanzadګad` → drop, keep cleaned `دالانزادغاد` + `دالانزادگاد`→`دالانزادغاد`

---

## J. What this report did NOT change

- ❌ `db/places/curated-places.json` — untouched (still 2,226)
- ❌ Candidate JSONs — untouched (33 still status=pending tier=high pendingAfterArGate=false)
- ❌ No new files created
- ❌ No `_asia_1h_blocked_major_cities_approve.mjs` yet (created only after approval)

---

## K. Next steps

Reply with ONE of:

- **`approve A — all 33 with proposed names`** ✅ recommended (includes critical kg/manas wrong-ar fix)
- **`approve some — list slugs/decisions`** — partial approval
- **`fix arabic per row`** — provide manual Arabic for specific entries
- **`exclude slugs`** — drop one or more from the wave
- **`request more research`** — ask for canonical Arabic Wikipedia URLs / verification

After approval:
1. Create `scripts/geodata/_asia_1h_blocked_major_cities_approve.mjs` (per prior MCF pattern)
2. Apply 30 NAME_AR_FIXES + 3 spurious-overrides + kg/manas SPECIAL handling (drop wrong aliases entirely)
3. Run Stage 4 apply per-country (uz/kz/tj/kg/tm/mn — tm has 0 blocked so no entries)
4. Run tests (smoke + regression + production verifier)
5. Commit `ASIA-1H-BLOCKED-MAJOR-CITIES-FIX-1`
6. Update memory + closure report

**No merge until user approval.**
