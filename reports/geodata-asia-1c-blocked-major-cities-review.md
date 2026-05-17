# ASIA-1C-BLOCKED-MAJOR-CITIES-FIX-1 — Review Report

**Phase**: `ASIA-1C-BLOCKED-MAJOR-CITIES-FIX-1` (REVIEW-ONLY — NO MERGE)
**Generated**: 2026-05-17
**Scope**: 26 blocked-major candidates from `CURATED-GEODATA-ASIA-1C`
**Status**: ⏸ **awaiting user approval for proposed Arabic names + slugs**

---

## Top-line numbers

| Metric | Count |
| --- | ---: |
| Total candidates | **26** |
| With `pop ≥ 200,000` (major cities) | 22 |
| `100k ≤ pop < 200k` | 0 |
| `pop < 100k` BUT PPLA/PPLC (administrative seats) | 4 |
| Per-country distribution | JP 14 / KR 7 / HK 1 / TW 3 / MO 1 |
| Collisions vs curated (bare slug) | **0** (all 26 slugs FREE) |
| Spurious wave-collisions needing override | 2 (`jp/fuji`, `kr/andong` — vs pop=0 PPL stubs) |
| Rename needed (`-cc` suffix) | **0 proposed** (all bare slugs are safe — see notes) |
| Persian/Urdu/Latin pollution in name.ar | 21 |
| `mixed_unknown` (clean Arabic + invisible chars) | 4 |
| Already clean (`arabic_only` but gate over-flagged) | 1 (`jp/fuji`) |

---

## Cleaning rules applied to proposals

Same as ASIA-1B-MCF / ASIA-1C clean-approve:

```
ی → ي    ک → ك    پ → ب    گ → غ (default)    چ → ج
ٹ → ت    ڈ → د    ڑ → ر    ہ → ه    ے → ي    ۀ → ه
ZWNJ/ZWJ/tatweel → strip
```

**Plus**:
- For JP entries with `، {prefecture}` suffix (e.g., `هيراكاتا، أوساكا`), **drop the prefecture clarifier** to match the merged-71 pattern (kawasaki/saitama/chiba/kitakyushu use bare city name).
- For entries where mechanical cleaning produces a still-weak transliteration, prefer the cleanest alias.

---

## Per-city review table

### A. Major cities (pop ≥ 400,000) — 7 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug recommendation | needs rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 1 | tw/`kaohsiung` | Kaohsiung | 2,737,660 | PPLA | Asia/Taipei | `kawhsywnګ` | **`كاوهسيونغ`** ✓ user-suggested | mixed_script (Latin+Persian) | FREE (curated has no `kaohsiung`) | **bare `kaohsiung`** | ❌ no |
| 2 | mo/`macau` | Macau | 649,335 | PPLC | Asia/Macau | `ئاۋمېن` (Uyghur) | **`ماكاو`** ✓ user-preferred | mixed_unknown (Uyghur script) | FREE | **bare `macau`** | ❌ no |
| 3 | jp/`higashiosaka` | Higashiosaka | 493,940 | PPLA2 | Asia/Tokyo | `هيغاشيوساكا، أوساكا` | **`هيغاشي أوساكا`** (split form, matches Higashi-ōsaka) | mixed_unknown (RTL marker?) | FREE | **bare `higashiosaka`** | ❌ no |
| 4 | kr/`jeju-city` | Jeju City | 488,844 | PPLA | Asia/Seoul | `jyjw sٹy` | **`جيجو`** (drop "City" in name.ar — same as jambi-city/mandaluyong-city) | mixed_script (Latin+Persian) | FREE | **`jeju-city`** (slug keeps suffix; bare `jeju` reserved for prefecture if ever added) | ❌ no |
| 5 | jp/`kurashiki` | Kurashiki | 483,576 | PPLA2 | Asia/Tokyo | `كوراشيكي، أوكاياما` | **`كوراشيكي`** (drop prefecture suffix) | mixed_unknown | FREE | **bare `kurashiki`** | ❌ no |
| 6 | jp/`fukuyama` | Fukuyama | 468,812 | PPLA2 | Asia/Tokyo | `فوکویاما` | **`فوكوياما`** (mechanical clean) | mixed_script (ک ی) | FREE | **bare `fukuyama`** | ❌ no |
| 7 | jp/`hirakata` | Hirakata | 406,331 | PPLA2 | Asia/Tokyo | `هيراكاتا، أوساكا` | **`هيراكاتا`** (drop prefecture suffix) | mixed_unknown | FREE | **bare `hirakata`** | ❌ no |

### B. Major cities (200k ≤ pop < 400k) — 15 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug recommendation | needs rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 8 | kr/`sejong` | Sejong | 394,630 | PPLA | Asia/Seoul | `سئجونگ` | **`سيجونغ`** (use clean alias; Korean transliteration drops hamza) | mixed_script (گ) | FREE | **bare `sejong`** | ❌ no |
| 9 | jp/`suita` | Suita | 385,567 | PPLA2 | Asia/Tokyo | `سوئیتا، اوساکا` | **`سويتا`** (use clean alias; drop prefecture) | mixed_script (ی ک) | FREE | **bare `suita`** | ❌ no |
| 10 | jp/`toyohashi` | Toyohashi | 377,453 | PPLA2 | Asia/Tokyo | `تويوهاشي، آيتشي` | **`تويوهاشي`** (drop prefecture suffix) | mixed_unknown | FREE | **bare `toyohashi`** | ❌ no |
| 11 | kr/`yangsan` | Yangsan | 358,074 | PPLA2 | Asia/Seoul | `سانگ‌سان` ⚠️ (starts with س — **wrong**, Yangsan = ي not س) | **`يانغسان`** (corrected from alias — proper Y-start) | mixed_script + **wrong first letter** | FREE | **bare `yangsan`** | ❌ no |
| 12 | jp/`iwaki` | Iwaki | 357,309 | PPLA2 | Asia/Tokyo | `ایواکی، فوکوشیما` | **`إيواكي`** (mechanical clean + hamza-alif; drop suffix) | mixed_script (ی ک) | FREE | **bare `iwaki`** | ❌ no |
| 13 | jp/`asahikawa` | Asahikawa | 333,530 | PPLA2 | Asia/Tokyo | `آساهیکاوا، هوکایدو` | **`أساهيكاوا`** (use clean alias; drop prefecture) | mixed_script (ی ک) | FREE | **bare `asahikawa`** | ❌ no |
| 14 | jp/`akita` | Akita | 307,672 | PPLA | Asia/Tokyo | `آکیتا` | **`أكيتا`** (use clean alias) | mixed_script (ک ی) | FREE | **bare `akita`** | ❌ no |
| 15 | kr/`iksan` | Iksan | 307,000 | PPL | Asia/Seoul | `اکسان` | **`إكسان`** (mechanical + hamza-alif) | mixed_script (ک) | FREE | **bare `iksan`** | ❌ no |
| 16 | jp/`akashi` | Akashi | 303,601 | PPLA2 | Asia/Tokyo | `آکاشی` | **`أكاشي`** (use clean alias) | mixed_script (ک ی) | FREE | **bare `akashi`** | ❌ no |
| 17 | hk/`tin-shui-wai` | Tin Shui Wai | 282,400 | PPL | Asia/Hong_Kong | `تین شوی وای` | **`تين شوي واي`** (mechanical clean) | mixed_script (ی) | FREE | **bare `tin-shui-wai`** | ❌ no |
| 18 | kr/`yeosu` | Yeosu | 268,823 | PPLA2 | Asia/Seoul | `یئوسو` | **`يوسو`** (use clean alias — simpler; or `يوسو` matches Korean 여수) | mixed_script (ی) | FREE | **bare `yeosu`** | ❌ no |
| 19 | jp/`fuji` | Fuji | 245,392 | PPLA2 | Asia/Tokyo | `فوجي` ✓ already clean! | **`فوجي`** (keep as-is) | over-flagged by gate (was `arabic_only`) | **spurious wave-collision** vs pop=0 PPL stubs in jp/tw (no real city) | **bare `fuji`** with `_collisionOverrideReason` audit | ❌ no (user precaution `fuji-jp` NOT NEEDED — same pattern as ASIA-1A-MCF kupang/miri/labuan) |
| 20 | jp/`sasebo` | Sasebo | 243,223 | PPLA2 | Asia/Tokyo | `ساسه‌بو، ناگازاکی` | **`ساسيبو`** (use clean alias; canonical Arabic Wikipedia form) | mixed_script (گ ی ک + ZWNJ) | FREE | **bare `sasebo`** | ❌ no |
| 21 | jp/`atsugi` | Atsugi | 223,960 | PPLA2 | Asia/Tokyo | `آتسوگی، کاناگاوا` | **`أتسوغي`** (use clean alias; drop prefecture) | mixed_script (گ ی ک) | FREE | **bare `atsugi`** | ❌ no |
| 22 | jp/`matsue` | Matsue | 203,616 | PPLA | Asia/Tokyo | `ماتسو، شیمانے` ⚠️ (drops final "e" — **wrong**, Matsue is ماتسوي not ماتسو) | **`ماتسوي`** (corrected — preserves -e ending) | mixed_script (ے) + **wrong transliteration** | FREE | **bare `matsue`** | ❌ no |

### C. Administrative seats (pop < 100k OR small TW PPLA) — 4 entries

| # | cc/slug | en | pop | fc | tz | name.ar current | name.ar **proposed** | block reason | collision | slug recommendation | needs rename? |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 23 | kr/`andong` | Andong | 153,348 | PPLA | Asia/Seoul | `آندونگ` | **`أندونغ`** (use clean alias) | mixed_script (گ) | **spurious wave-collision** vs pop=0 PPL stubs in tw/id (no real city) | **bare `andong`** with `_collisionOverrideReason` audit | ❌ no (user precaution `andong-kr` NOT NEEDED) |
| 24 | kr/`hongseong` | Hongseong | 89,174 | PPLA | Asia/Seoul | `هانگ سئونگ` | **`هونغسيونغ`** (use clean alias; single token) | mixed_script (گ) | FREE | **bare `hongseong`** | ❌ no |
| 25 | tw/`jincheng` | Jincheng | 37,507 | PPLA | Asia/Taipei | `jynchynګ` | **`جينتشينغ`** (use clean alias; matches Pinyin Jīnchéng) | mixed_script (Latin+Persian) | FREE | **bare `jincheng`** | ❌ no |
| 26 | tw/`zhongxing-new-village` | Zhongxing New Village | 25,549 | PPLA | Asia/Taipei | `zhwngshng nya gawں` | **`تشونغشينغ`** (transliterate proper name; aliases.ar += `قرية تشونغشينغ الجديدة`) | mixed_latin (Latin only) | FREE | **bare `zhongxing-new-village`** (slug keeps the "new-village" suffix because that's the canonical English name) | ❌ no |

---

## Collision audit (intra-wave + vs curated)

### Vs curated-places.json (1,940 entries) — 0 collisions
All 26 slugs are FREE in curated.

### Intra-wave (spurious-collision detection)

| slug | real major | spurious collision source | recommendation |
| --- | --- | --- | --- |
| `fuji` | **jp/fuji** PPLA2 pop=245k | jp (5 pop=0 PPL/PPLL stubs) + tw/fuji (1 pop=0 PPL stub) | **bare `fuji`** + `_collisionOverrideReason: "real major (jp PPLA2 245k) vs pop=0 PPL/PPLL stubs in jp/tw"` (same precedent as ASIA-1A-MCF kupang/miri/labuan; ASIA-1B-MCF nan/phang-nga) |
| `andong` | **kr/andong** PPLA pop=153k | kr (8 pop=0 PPL stubs) + tw (1) + id (7) | **bare `andong`** + `_collisionOverrideReason: "real major (kr PPLA 153k) vs pop=0 PPL stubs in kr/tw/id"` |

**No `-cc` suffix renames proposed.** User's precaution (`fuji-jp`, `andong-kr`) was preventive; actual collision is spurious, so bare-slug-with-override matches established pattern.

---

## Summary table — proposed Arabic names (sorted by population)

| # | cc/slug | en | pop | proposed name.ar | proposed aliases.ar (cleaned + added) |
|---|---|---|---:|---|---|
| 1 | tw/kaohsiung | Kaohsiung | 2,737,660 | **`كاوهسيونغ`** | `كائوهسيونغ` |
| 2 | mo/macau | Macau | 649,335 | **`ماكاو`** | `ماكائو`, `مكاؤ` |
| 3 | jp/higashiosaka | Higashiosaka | 493,940 | **`هيغاشي أوساكا`** | `هيغاشيوساكا، أوساكا` (legacy form) |
| 4 | kr/jeju-city | Jeju City | 488,844 | **`جيجو`** | `جيجو ستي`, `ججو` |
| 5 | jp/kurashiki | Kurashiki | 483,576 | **`كوراشيكي`** | `كوراشيكي، أوكاياما` |
| 6 | jp/fukuyama | Fukuyama | 468,812 | **`فوكوياما`** | `فوكوياما، هيروشيما` |
| 7 | jp/hirakata | Hirakata | 406,331 | **`هيراكاتا`** | `هيراكاتا، أوساكا` |
| 8 | kr/sejong | Sejong | 394,630 | **`سيجونغ`** | — |
| 9 | jp/suita | Suita | 385,567 | **`سويتا`** | `سويتا، أوساكا` |
| 10 | jp/toyohashi | Toyohashi | 377,453 | **`تويوهاشي`** | `تويوهاشي، آيتشي` |
| 11 | kr/yangsan | Yangsan | 358,074 | **`يانغسان`** | — |
| 12 | jp/iwaki | Iwaki | 357,309 | **`إيواكي`** | `إيواكي، فوكوشيما`, `لواكي` (legacy variant) |
| 13 | jp/asahikawa | Asahikawa | 333,530 | **`أساهيكاوا`** | `أساهيكاوا، هوكايدو` |
| 14 | jp/akita | Akita | 307,672 | **`أكيتا`** | — |
| 15 | kr/iksan | Iksan | 307,000 | **`إكسان`** | `ايكسان` |
| 16 | jp/akashi | Akashi | 303,601 | **`أكاشي`** | `أكاشي، هيوغو` |
| 17 | hk/tin-shui-wai | Tin Shui Wai | 282,400 | **`تين شوي واي`** | — |
| 18 | kr/yeosu | Yeosu | 268,823 | **`يوسو`** | — |
| 19 | jp/fuji | Fuji | 245,392 | **`فوجي`** | `فوجي، شيزوكا` |
| 20 | jp/sasebo | Sasebo | 243,223 | **`ساسيبو`** | `ساسيبو، ناغاساكي` |
| 21 | jp/atsugi | Atsugi | 223,960 | **`أتسوغي`** | `أتسوغي، كاناغاوا` |
| 22 | jp/matsue | Matsue | 203,616 | **`ماتسوي`** | `ماتسوئه`, `ماتسوا` |
| 23 | kr/andong | Andong | 153,348 | **`أندونغ`** | `اندونغ` |
| 24 | kr/hongseong | Hongseong | 89,174 | **`هونغسيونغ`** | `هانغسيونغ` |
| 25 | tw/jincheng | Jincheng | 37,507 | **`جينتشينغ`** | `جنجيانغ`, `جينجنغ` |
| 26 | tw/zhongxing-new-village | Zhongxing New Village | 25,549 | **`تشونغشينغ`** | `قرية تشونغشينغ الجديدة` |

---

## Key decisions to confirm

### Decision 1 — Kaohsiung Arabic form
- **Recommended**: `كاوهسيونغ` (matches user's suggestion; canonical Arabic Wikipedia form; clean alias was already present)
- Alternative: `كائوهسيونغ` (hamza variant — less common)
- **Question**: ✅ approve `كاوهسيونغ`?

### Decision 2 — Macau Arabic form
- **Recommended**: `ماكاو` (matches user's strong preference; clean alias present)
- Alternative: `مكاو` (no alif — less common)
- Alternative: `ماكاو` is also the form used by Wikipedia Arabic and most Arabic media.
- **Question**: ✅ approve `ماكاو`?

### Decision 3 — JP prefecture-suffix policy
The 6 JP entries (higashiosaka/kurashiki/hirakata/suita/toyohashi/iwaki/asahikawa/atsugi/sasebo/akashi) have `، {prefecture}` suffix in the original. The merged-71 (kawasaki/saitama/chiba/kitakyushu) use **bare city name without prefecture**. Recommend **stripping the prefecture suffix** for consistency.
- Optional: add the `، {prefecture}` form as a searchable alias.
- **Question**: ✅ approve stripping prefecture suffixes from name.ar (keep as alias)?

### Decision 4 — Spurious-collision-override for `fuji` and `andong`
Same pattern as ASIA-1A-MCF (kupang/miri/labuan) and ASIA-1B-MCF (nan/phang-nga). Real major-city is the ONLY real entry; all other "collisions" are pop=0 PPL stubs (random tiny localities, not actual cities).
- **Recommended**: bare slugs `fuji` and `andong` with `_collisionOverrideReason` audit field.
- Alternative: `fuji-jp` / `andong-kr` (user's preventive suggestion) — works but breaks bare-slug consistency with all prior MCF waves.
- **Question**: ✅ approve bare slugs with override, or use `-cc` suffix?

### Decision 5 — Wrong-letter corrections
Two entries have ACTUALLY-WRONG Arabic (not just Persian pollution):
- `kr/yangsan` has `سانگ‌سان` — starts with **س** but Yangsan = ي (Korean 양산 starts with "Y" sound).  Recommendation: **`يانغسان`** from alias.
- `jp/matsue` has `ماتسو، شیمانے` — drops the final "e", should be **`ماتسوي`** (Matsue = ماتسو-إ-ي).
- **Question**: ✅ approve these corrections (NOT just mechanical Persian→Arabic, but actual semantic fix)?

### Decision 6 — `jeju-city` slug
Following the jambi-city / mandaluyong-city precedent (ASIA-1A/1B): **keep slug as `jeju-city`** (canonical English includes "City"), but **name.ar drops "City"**: `جيجو` (not `جيجو ستي`).
- **Question**: ✅ approve `jeju-city` slug + `جيجو` Arabic?

### Decision 7 — `zhongxing-new-village` policy
- Slug `zhongxing-new-village` keeps the "new-village" tail because that IS the canonical English name (it's the de-facto provincial capital of Taiwan Province, formal name).
- name.ar: `تشونغشينغ` (transliterate the proper name) with alias `قرية تشونغشينغ الجديدة` (literal Arabic translation already in GeoNames).
- **Question**: ✅ approve `zhongxing-new-village` slug + `تشونغشينغ` Arabic + alias?

---

## What this report does NOT change

Per user direction:
- ❌ NO change to `db/places/curated-places.json`
- ❌ NO change to candidates JSONs (status still `pending`, `pendingAfterArGate: false`)
- ❌ NO TW transliteration cleanup (taichung/keelung/hsinchu deferred)
- ❌ NO VN timezone changes
- ❌ NO VN Gj-slug standardization
- ❌ NO br/cascavel rename
- ❌ NO id/tanjung-pinang Arabic fix

**The 1,940 curated entries remain frozen until user approval.**

---

## Next steps

Reply to the assistant with one of:

- **`approve A — all 26 with proposed names`** — merge all 26 using the proposed Arabic names + bare slugs + 2 spurious-collision overrides (`fuji`/`andong`)
- **`approve A but rename fuji/andong`** — same as A, but use `fuji-jp`/`andong-kr` suffix
- **`approve some — list slugs/decisions`** — partial approval (give per-slug overrides)
- **`fix arabic per row`** — provide manual Arabic for specific entries
- **`exclude slugs`** — drop one or more from the wave
- **`request more research`** — ask for canonical Arabic Wikipedia URLs / verification for specific cities

After approval:
1. Create `scripts/geodata/_asia_1c_blocked_major_cities_approve.mjs` (per ASIA-1B-MCF pattern)
2. Run Stage 4 apply per-country (jp/kr/hk/tw/mo)
3. Run tests (existing suites + new spot-checks for the 26)
4. Commit `ASIA-1C-BLOCKED-MAJOR-CITIES-FIX-1`
5. Update memory + closure report

**No merge until user approval.**
