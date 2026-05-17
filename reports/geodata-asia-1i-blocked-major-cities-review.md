# ASIA-1I-BLOCKED-MAJOR-CITIES-FIX-1 — Review Report

**Phase**: `ASIA-1I-BLOCKED-MAJOR-CITIES-FIX-1` (REVIEW-ONLY — NO MERGE)
**Generated**: 2026-05-17
**Scope**: 23 blocked-major candidates from `CURATED-GEODATA-ASIA-1I`
**Status**: ⏸ **awaiting user approval for proposed Arabic names + slugs**

---

## Top-line numbers

| Metric | Count |
| --- | ---: |
| Total candidates | **23** |
| Per-country | AZ 15 / GE 5 / AM 3 |
| Vs curated collisions | **0** (all 23 slugs FREE) |
| Intra-wave collisions (real) | **1** (az/pushkino — needs spurious-override audit) |
| `mixed_script` (Persian/Urdu) | 19 |
| `mixed_latin` (Latin in ar) | 2 (am/vanadzor + am/yeghegnadzor) |
| `mixed_unknown` (Uyghur ۆ ə + Persian) | 2 (az/agdas + over-flagged collision) |
| `arabic_only` over-flagged (already clean) | 1 (az/pushkino) |
| PPLC capitals blocked | 0 (all 3 capitals — baku/tbilisi/yerevan — already curated) |
| pop ≥ 100,000 | 3 (sumqayit 359k, batumi 187k, mingachevir 106k) |
| pop ≥ 30,000 | 9 |
| pop < 5k (tiny PPLAs) | 3 (yeghegnadzor 7k, lacin 2k, ambrolauri 2k) |

---

## Cleaning rules applied

Same as prior MCFs + **🆕 Uyghur ۆ → و** mapping (per user direction):

```
ی → ي    ک → ك    پ → ب    گ → غ (default)    چ → ج
ٹ → ت    ڈ → د    ڑ → ر    ہ → ه    ے → ي    ۀ → ه
ۆ → و (Uyghur, new in ASIA-1I-MCF)
ZWNJ/ZWJ/tatweel → strip
```

---

## A. PRIORITY entries (user-mentioned + pop ≥ 100,000) — 4 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug recommendation | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 1 | **az/`sumqayit`** | Sumqayıt | 358,675 | PPLA | Asia/Baku | `سمقاییت` | **`سومقاييت`** ✓ user-suggested (canonical AR Wikipedia) | mixed_script (ی ی) | FREE | **bare** | ❌ |
| 2 | **ge/`batumi`** | Batumi | 186,949 | PPLA | Asia/Tbilisi | `باتومی` | **`باتومي`** ✓ user-suggested | mixed_script (ی) | FREE | **bare** | ❌ |
| 3 | **az/`mingachevir`** | Mingachevir | 106,048 | PPLA | Asia/Baku | `منجاچویر` | **`مينغاشيفير`** ✓ user-suggested (matches regionAr "مينغاتشيفير" closely; alt: مينجاچوير) | mixed_script (چ ی) | FREE | **bare** | ❌ |
| 4 | **am/`vanadzor`** | Vanadzor | 78,100 | PPLA | Asia/Yerevan | `vanadzۆr` (Latin+Uyghur ۆ) | **`فانادزور`** ✓ user-suggested (matches clean alias `وانادزور` but with ف for V) | mixed_latin + Uyghur | FREE | **bare** | ❌ |

---

## B. Mid-tier blocked majors (pop 10k-50k) — 13 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug rec. | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 5 | az/`agdzhabedy` | Agdzhabedy | 43,000 | PPLA | Asia/Baku | `آغجابیدی` | **`أغجابيدي`** (use clean alias) | mixed_script (ی) | FREE | **bare** | ❌ |
| 6 | az/`goeycay` | Göyçay | 42,500 | PPLA | Asia/Baku | `gwے jے` (Latin+Persian) | **`غويتشاي`** (matches regionAr; canonical for Göyçay) | mixed_latin + Persian | FREE | **bare** | ❌ |
| 7 | **ge/`gori`** | Gori | 41,933 | PPLA | Asia/Tbilisi | `گوری` | **`غوري`** ✓ user-suggested (mechanical: گ→غ ی→ي) | mixed_script (گ ی) | FREE | **bare** | ❌ |
| 8 | az/`barda` | Barda | 37,372 | PPLA | Asia/Baku | `bardہ` (Latin+ہ) | **`باردا`** (matches regionAr; canonical AR Wikipedia) | mixed_latin + ہ | FREE | **bare** | ❌ |
| 9 | az/`sabirabad` | Sabirabad | 30,612 | PPLA | Asia/Baku | `سبیر آباد` | **`صابر آباد`** (use clean alias `صابرآباد` w/ space; Sabir + abad = Arabic compound) | mixed_script (ی) | FREE | **bare** | ❌ |
| 10 | am/`armavir` | Armavir | 29,700 | PPLA | Asia/Yerevan | `آرماویر` | **`أرمافير`** (use clean alias; canonical with ف for V) | mixed_script (ی) | FREE | **bare** | ❌ |
| 11 | az/`fizuli` | Fizuli | 26,765 | PPLA | Asia/Baku | `فضولی` | **`فضولي`** (mechanical clean; canonical Arabic — named after poet "Fuzuli" = فضولي) | mixed_script (ی) | FREE | **bare** | ❌ |
| 12 | az/`agdas` | Ağdaş | 23,528 | PPLA | Asia/Baku | `آغ‌داش` (ZWNJ) | **`أغداش`** (matches regionAr; strip ZWNJ + canonical hamza-alif) | mixed_unknown (ZWNJ) | FREE | **bare** | ❌ |
| 13 | az/`terter` | Tartar | 18,185 | PPLA | Asia/Baku | `trٹr` (Latin+Persian) | **`تارتار`** (use clean alias; matches regionAr) | mixed_latin + Persian | FREE | **bare** | ❌ |
| 14 | az/`pushkino` | Pushkino | 18,182 | PPLA | Asia/Baku | `بوشكينو` (already clean!) | **`بوشكينو`** (keep as-is) | over-flagged + **collisionInWave=true** | spurious wave-flag (auto override) | **bare** + audit | ❌ |
| 15 | ge/`akhaltsikhe` | Akhaltsikhe | 17,445 | PPLA | Asia/Tbilisi | `آخالت سیکه` | **`آخالتسيخه`** (use clean alias; matches Georgian "Akhalt-sikhe") | mixed_script (ی) | FREE | **bare** | ❌ |
| 16 | az/`astara` | Astara | 15,190 | PPLA | Asia/Baku | `astarہ` | **`آستارا`** (use clean alias; matches regionAr) | mixed_latin + ہ | FREE | **bare** | ❌ |
| 17 | az/`belokany` | Belokany | 14,800 | PPLA | Asia/Baku | `بلوکانی` | **`بيلوكاني`** (use clean alias; matches regionAr "بالاكان" closely) | mixed_script (ک ی) | FREE | **bare** | ❌ |
| 18 | ge/`ozurgeti` | Ozurgeti | 13,935 | PPLA | Asia/Tbilisi | `ازرگتی` | **`أوزورغيتي`** (mechanical clean + canonical Arabic transliteration) | mixed_script (گ ی) | FREE | **bare** | ❌ |

---

## C. Smaller PPLAs (pop < 10k OR special) — 6 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug rec. | rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 19 | az/`qabala` | Qabala | 11,867 | PPLA | Asia/Baku | `qbalہ` (Latin+ہ) | **`قابالا`** (use clean alias; canonical AR Wikipedia) | mixed_latin + ہ | FREE | **bare** | ❌ |
| 20 | az/`goranboy` | Goranboy | 10,186 | PPLA | Asia/Baku | `gwranbwayے` (Latin+Persian) | **`غورانبوي`** (matches regionAr "غورنبوي" closely) | mixed_latin + Persian | FREE | **bare** | ❌ |
| 21 | am/`yeghegnadzor` | Yeghegnadzor | 7,300 | PPLA | Asia/Yerevan | `yەghəgnadzۆr` (Latin+Kazakh ə+Uyghur ۆ) | **`يغيغنادزور`** (use clean alias `یغیغنادزور` cleaned; or simpler `يغناجور`) | mixed_latin + Uyghur | FREE | **bare** | ❌ |
| 22 | az/`lacin` | Laçın | 2,300 | PPLA | Asia/Baku | `لاچن` | **`لاتشين`** (matches regionAr; canonical for Karabakh "Lachin") | mixed_script (چ) | FREE | **bare** | ❌ |
| 23 | ge/`ambrolauri` | Ambrolauri | 1,952 | PPLA | Asia/Tbilisi | `آمبرولائوری` | **`آمبرولاوري`** (mechanical clean — strip hamza-yaa for simpler form) | mixed_script (ی) | FREE | **bare** | ❌ |

---

## D. Collision audit

### Vs curated-places.json (2,160 entries) — 0 collisions
All 23 slugs are FREE in curated.

### Intra-wave collisions (1 — spurious)

| slug | real major | collision source | recommendation |
| --- | --- | --- | --- |
| `pushkino` | az/pushkino PPLA pop=18,182 | flagged as `collisionInWave=true` (the only entry with this flag in 23 blocked) — likely a spurious-override case | **bare `pushkino`** + `_collisionOverrideReason` audit |

**No `-cc` suffix renames proposed.** All 23 → bare slugs (same pattern as ASIA-1A/1B/1C/1E MCFs).

---

## E. Summary — what gets merged + what changes

### Recommended merge set (23 entries):
- **23 bare slugs** (consistent with all prior MCFs)
- **0 slug renames**
- **1 spurious-override** with `_collisionOverrideReason` audit: `az/pushkino`
- **22 NAME_AR_FIXES** (manual user-approved Arabic for blocked entries)
- **1 already-clean** (az/pushkino — over-flagged, kept as-is with override)

### Key user-priority approvals:
| slug | en | proposed ar |
| --- | --- | --- |
| az/sumqayit (358k) | Sumqayıt | **`سومقاييت`** ✓ |
| ge/batumi (187k) | Batumi | **`باتومي`** ✓ |
| az/mingachevir (106k) | Mingachevir | **`مينغاشيفير`** ✓ |
| am/vanadzor (78k) | Vanadzor | **`فانادزور`** ✓ |
| ge/gori (42k) | Gori | **`غوري`** ✓ |

### Notable transliteration choices:
- **az/fizuli → فضولي** — named after Ottoman-era poet Muhammad Fuzûlî (محمد فضولي); using canonical Arabic form
- **az/sabirabad → صابر آباد** — compound: Sabir (Azerbaijani poet) + abad (Persian "city"); using ص for accuracy
- **az/lacin → لاتشين** — matches Karabakh region naming convention
- **am/yeghegnadzor → يغيغنادزور** — best transliteration from Armenian "Yeghegnadzor"

### Decisions needed from user:

| # | Question | Recommendation |
|---|---|---|
| 1 | Approve all 23 with proposed Arabic + bare slugs? | ✅ approve A |
| 2 | sumqayit → سومقاييت? | ✅ user-suggested |
| 3 | batumi → باتومي? (vs alias باطومي with emphatic ط) | ✅ ت is canonical AR Wikipedia |
| 4 | mingachevir → مينغاشيفير? (vs مينغاتشيفير) | ✅ user-suggested |
| 5 | vanadzor → فانادزور? (vs وانادزور with و) | ✅ user-suggested (ف better for V sound) |
| 6 | gori → غوري? | ✅ user-suggested |
| 7 | pushkino spurious-override (already clean, just over-flagged)? | ✅ bare + audit |
| 8 | fizuli → فضولي (canonical Arabic Fuzuli)? | ✅ |
| 9 | sabirabad → صابر آباد (canonical with ص)? | ✅ |
| 10 | lacin → لاتشين (matches regionAr)? | ✅ |

---

## F. Aliases.ar pollution (cosmetic — will be cleaned)

Among the 23 entries, **~40 dirty aliases** (Persian/Urdu/mojibake) will be cleaned via standard rules during clean-approve. Examples:
- az/sumqayit aliases: `سومغايت`, `سومغایت`, `سومغاییت` → cleaned to `سومغايت`, `سومغاييت` (drop duplicates)
- am/vanadzor aliases: `وانادزور`, `وناديزور`, `ڤانادزۆر` → keep `وانادزور`/`وناديزور`, drop ڤانادزۆر (Uyghur)
- ge/akhaltsikhe aliases: `آخالتسيخه`, `آخالتسیخه`, `آخالتسیخے` → keep `آخالتسيخه`, drop others

---

## G. What this report did NOT change

- ❌ `db/places/curated-places.json` — untouched (still 2,160)
- ❌ Candidate JSONs — untouched (23 still status=pending tier=high pendingAfterArGate=false)
- ❌ No new files created
- ❌ No `_asia_1i_blocked_major_cities_approve.mjs` yet (created only after approval)

---

## H. Next steps

Reply with ONE of:

- **`approve A — all 23 with proposed names + bare slugs`** ✅ recommended
- **`approve some — list slugs/decisions`** — partial approval
- **`fix arabic per row`** — provide manual Arabic for specific entries
- **`exclude slugs`** — drop one or more from the wave
- **`request more research`** — ask for canonical Arabic Wikipedia URLs / verification

After approval:
1. Create `scripts/geodata/_asia_1i_blocked_major_cities_approve.mjs` (per prior MCF pattern, with **Uyghur ۆ→و** in cleaning rules)
2. Apply 22 NAME_AR_FIXES + 1 spurious-override (pushkino)
3. Run Stage 4 apply per-country (az/ge/am)
4. Run tests (smoke + regression + production verifier)
5. Commit `ASIA-1I-BLOCKED-MAJOR-CITIES-FIX-1`
6. Update memory + closure report

**No merge until user approval.**
