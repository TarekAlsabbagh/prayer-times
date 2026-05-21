# ASIA-1D-IN-F-FAST-SUPPORTED-L10N — Closure Report

**Date**: 2026-05-21
**Phase**: Fast combined geodata + L10N wave — next-tier IN cities (Gujarat / Rajasthan / Andhra Pradesh / Telangana focus)
**Status**: ✅ **CLOSED — user-approved 2026-05-21**
**Implementation commit**: `a703f44` — `feat(geodata): ASIA-1D-IN-F-FAST-SUPPORTED-L10N — +27 IN cities (GJ/RJ/AP/TS) with ar/en/ur/bn only`
**Scope**: +27 IN cities with exactly `ar/en/ur/bn`

---

## 0. Acceptance criteria

| # | Criterion | Status |
|---|---|---|
| 1 | 27 new IN cities added (within 20–30 target) | ✅ |
| 2 | IN count 172 → 199 (+27) | ✅ |
| 3 | Total curated 2,660 → 2,687 (+27) | ✅ |
| 4 | Dedupe-first: every new city verified NOT in curated | ✅ |
| 5 | Each new entry has exactly `names.{ar,en,ur,bn}` | ✅ |
| 6 | No `names.hi/ta/mr/te/kn/ml/gu/pa/or/as/sa` in any new entry | ✅ |
| 7 | Legacy `names.hi` (40 cities) preserved unchanged | ✅ |
| 8 | All 108 (27 × 4) values pass per-lang script guards | ✅ |
| 9 | Prior 172 IN entries byte-identical (per-slug SHA-256) | ✅ |
| 10 | PK/BD/AF/IR/SA/TR/MY/ID/non-IN byte-identical | ✅ |
| 11 | No duplicate slug / sourceId | ✅ |
| 12 | `server.js` / `js/app.js` / `index.html` / `server/place-l10n/index.js` unchanged | ✅ All 0-byte diff |
| 13 | `docs/place-data-maintenance-policy.md` unchanged | ✅ 0-byte diff |
| 14 | No search-ranking changes | ✅ |
| 15 | No runtime translation, no fillchain | ✅ |
| 16 | Tests: 57/57 new + carry-forward green | ✅ |
| 17 | Browser-verified via Preview MCP across 12 cities | ✅ |
| 18 | Backup created before mutation | ✅ |

---

## 1. Counts

| | Before | After | Delta |
|---|---|---|---|
| Total curated entries | 2,660 | **2,687** | **+27** |
| IN entries | 172 | **199** | **+27** |
| IN with `names.ar/en/ur/bn` | 172 | 199 | +27 each |
| IN with `names.hi` (legacy) | 40 | 40 | 0 (NOT extended) |

---

## 2. List of 27 cities (sorted by population)

| # | Slug | GeonameId | EN | AR | UR | BN | Pop | Region |
|---|---|---|---|---|---|---|---|---|
| 1 | `bhilwara` | 1275960 | Bhilwara | بهيلوارا | بھیلواڑہ | ভিলওয়াড়া | 359k | Rajasthan |
| 2 | `gandhidham` | 1271717 | Gandhidham | غانديدام | گاندھی دھام | গান্ধীধাম | 248k | Gujarat |
| 3 | `sikar` | 1256320 | Sikar | سيكر | سیکر | সিকার | 244k | Rajasthan |
| 4 | `sri-ganganagar` | 1271685 | Sri Ganganagar | سري غانغانغار | سری گنگانگر | শ্রী গঙ্গানগর | 238k | Rajasthan |
| 5 | `anand` | 1278685 | Anand | آنند | آنند | আনন্দ | 209k | Gujarat |
| 6 | `madanapalle` | 1264621 | Madanapalle | مادانابالي | مدنپلی | মদনাপাল্লে | 180k | Andhra Pradesh |
| 7 | `surendranagar` | 1255349 | Surendranagar | سوريندرانغار | سریندر نگر | সুরেন্দ্রনগর | 180k | Gujarat |
| 8 | `veraval` | 1253237 | Veraval | فيرافال | ویراول | বেরাবল | 171k | Gujarat |
| 9 | `navsari` | 1261653 | Navsari | نافساري | نوساری | নবসারি | 171k | Gujarat |
| 10 | `bharuch` | 1276100 | Bharuch | بهاروش | بھروچ | ভারুচ | 169k | Gujarat |
| 11 | `tonk` | 1254241 | Tonk | تونك | ٹونک | টঙ্ক | 165k | Rajasthan |
| 12 | `hanumangarh` | 1270407 | Hanumangarh | هانومانغار | ہنومان گڑھ | হনুমানগড় | 156k | Rajasthan |
| 13 | `porbandar` | 1259395 | Porbandar | بوربندر | پوربندر | পোরবন্দর | 153k | Gujarat |
| 14 | `hindupur` | 1270079 | Hindupur | هندوبور | ہندو پور | হিন্দুপুর | 152k | Andhra Pradesh |
| 15 | `beawar` | 1276634 | Beawar | بيوار | بیاور | বিয়াওয়ার | 151k | Rajasthan |
| 16 | `bhuj` | 1275812 | Bhuj | بوج | بھوج | ভূজ | 149k | Gujarat |
| 17 | `godhra` | 1271107 | Godhra | غودرا | گودھرا | গোধরা | 144k | Gujarat |
| 18 | `palanpur` | 1260777 | Palanpur | بالانبور | پالن پور | পালনপুর | 142k | Gujarat |
| 19 | `valsad` | 1253468 | Valsad | فالساد | ولساڈ | বলসাড় | 140k | Gujarat |
| 20 | `botad` | 1275218 | Botad | بوتاد | بوٹاد | বোটাদ | 130k | Gujarat |
| 21 | `dharmavaram` | 1272842 | Dharmavaram | دارمافارام | دھرماورم | ধর্মাবরম | 122k | Andhra Pradesh |
| 22 | `adilabad` | 1279344 | Adilabad | عادل آباد | عادل آباد | আদিলাবাদ | 119k | Telangana |
| 23 | `gudivada` | 1270801 | Gudivada | غوديفادا | گدیواڑہ | গুদিবাড়া | 118k | Andhra Pradesh |
| 24 | `narasaraopet` | 1261848 | Narasaraopet | ناراساراوبت | نراساراو پیٹ | নারাসারাওপেত | 117k | Andhra Pradesh |
| 25 | `chittorgarh` | 1274040 | Chittorgarh | شيتورغار | چتور گڑھ | চিতোরগড় | 116k | Rajasthan |
| 26 | `banswara` | 1277214 | Banswara | بانسوارا | بانسواڑہ | বাঁসওয়াড়া | 101k | Rajasthan |
| 27 | `kavali` | 1267394 | Kavali | كافالي | کاولی | কাবালি | 90k | Andhra Pradesh |

Distribution: **13 Gujarat + 8 Rajasthan + 5 Andhra Pradesh + 1 Telangana**.

---

## 3. Cities from inspiration list NOT added (rejected/skipped)

| Slug | Reason | Detail |
|---|---|---|
| `udaipur` | low-pop variant (gid mismatch) | Candidate gid resolves to pop=30k entry; the real Udaipur (Rajasthan, 451k) uses a different gid not in the pending pool. Deferred. |
| `bhimavaram` | low-pop variant | gid=1276009 pop=14k; real Bhimavaram is ~140k under different gid. Deferred. |
| `gandhinagar` | low-pop variant | gid resolves to pop=9k; Gujarat capital is under different gid. Deferred. |
| `pali` | low-pop variant | gid resolves to pop=9k; Rajasthan major Pali is ~230k under different gid. Deferred. |
| `jetpur` | low-pop variant | gid resolves to pop=8k; major Jetpur is ~118k under different gid. Deferred. |
| `tenali` | not in candidates | Not in IN candidates pool |
| `tadipatri` | not in candidates | Not in IN candidates pool |
| `chilakaluripet` | not in candidates | Not in IN candidates pool |
| `morbi` | not in candidates | Not in IN candidates pool |

Plus the dedupe-first filter automatically excluded any slug/gid/alias collision against the existing 172 IN entries. (0 collisions found with this inspiration list.)

---

## 4. Source breakdown for names.ur and names.bn

| Source | names.ur | names.bn |
|---|---|---|
| `geonames:alt` (from raw alternatenames) | 8 | 7 |
| `manual:translit` (standard Indic→target-lang) | 19 | 20 |

**No runtime translation.** **No Google/OpenAI/Anthropic/browser MT.**

---

## 5. Script guard results

108/108 values pass per-lang script guards:

| Lang | Rule | Pass |
|---|---|---|
| `ar` | Arabic block, strict (no Urdu-only letters) | 27/27 |
| `en` | Latin only | 27/27 |
| `ur` | Arabic block (Urdu superset) | 27/27 |
| `bn` | Bengali block | 27/27 |

---

## 6. Tests

| Suite | Result |
|---|---|
| **NEW** `_test_asia_1d_in_f_fast.mjs` | **57/57 PASS** ✅ |
| IN-E (count drift 172→199) | 106/106 ✅ |
| IN-D (count drift) | 105/105 ✅ |
| UR-IN-1 (172→199) | 122/122 ✅ |
| BN-IN-1 (172→199) | 113/113 ✅ |
| HI-IN-1 (172→199, hi=40) | 116/116 ✅ |
| supported-local-policy-1 | 78/78 ✅ |
| fallback-consistency-1 (2660→2687) | 173/173 ✅ |
| seo-fallback-1 | 107/107 ✅ |
| fill_lang_map | 11/11 ✅ |

**Offline aggregate: 988/988 PASS, 0 regressions.**

### Browser verification via Preview MCP (port 3000)

12 cities × 2 langs verified — all 24 titles render correct native names:
```
bhilwara    /ur=بھیلواڑہ      /bn=ভিলওয়াড়া
anand       /ur=آنند           /bn=আনন্দ
tonk        /ur=ٹونک          /bn=টঙ্ক
bhuj        /ur=بھوج          /bn=ভূজ
porbandar   /ur=پوربندر        /bn=পোরবন্দর
chittorgarh /ur=چتور گڑھ      /bn=চিতোরগড়
adilabad    /ur=عادل آباد      /bn=আদিলাবাদ
madanapalle /ur=مدنپلی          /bn=মদনাপাল্লে
godhra      /ur=گودھرا         /bn=গোধরা
hindupur    /ur=ہندو پور       /bn=হিন্দুপুর
valsad      /ur=ولساڈ          /bn=বলসাড়
gandhidham  /ur=گاندھی دھام    /bn=গান্ধীধাম
```

---

## 7. Files changed

### MODIFIED
| File | Change |
|---|---|
| `db/places/curated-places.json` | +27 IN entries (prior 2,660 byte-identical) |
| `scripts/_test_place_names_ur_in_1.mjs` | Count updated 172→199 |
| `scripts/_test_place_names_bn_in_1.mjs` | Count updated 172→199 |
| `scripts/_test_place_names_hi_in_1.mjs` | Count updated 172→199 |
| `scripts/_test_asia_1d_in_d_fast.mjs` | Counts updated |
| `scripts/_test_asia_1d_in_e_fast.mjs` | Counts updated |
| `scripts/_test_city_name_fallback_consistency_1.mjs` | 2660→2687 |

### CREATED
| File | Purpose |
|---|---|
| `scripts/geodata/_asia_1d_in_f_fast_supported_l10n_apply.mjs` | Apply script + invariants |
| `scripts/_test_asia_1d_in_f_fast.mjs` | 57-test verification |
| `reports/asia-1d-in-f-fast-supported-l10n-apply-report.json` | Apply audit log |
| `reports/asia-1d-in-f-fast-supported-l10n-closure.md` | This report |
| `db/places/curated-places.json.preAsia1dInFFast.bak` | Backup |

### NOT modified (0-byte diff)
* `server.js`, `js/app.js`, `index.html`, `server/place-l10n/index.js`
* `docs/place-data-maintenance-policy.md`
* All 2,660 prior curated entries — byte-identical
* Search-ranking algorithm — untouched

---

## 8. India coverage state after this phase

| Layer | Count |
|---|---|
| **IN total** | **199** |
| Native ar/en/ur/bn | 199/199 each (100%) |
| hi (legacy data-only) | 40/199 |
| ta/mr/te/kn/ml/gu/pa/or/as/sa | 0/199 (PROHIBITED) |

---

## 9. Closure marker

**Approved by user 2026-05-21**:
> أعتمد إغلاق ASIA-1D-IN-F-FAST-SUPPORTED-L10N رسميًا، وأعطي الإذن برفع commit التنفيذ والـ closure commit بعد إنشائه.
> Marker: `docs(closure): mark ASIA-1D-IN-F-FAST-SUPPORTED-L10N user-approved 2026-05-21`

No further phases opened. Specifically held back per user constraint:
- ❌ ASIA-1D-IN-G
- ❌ ASIA-1F (CN solo)
- ❌ AMERICAS waves
- ❌ SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2
- ❌ Search-ranking wave
- ❌ Hijri pages
- ❌ DELETE-V1 / geocode-proxy
- ❌ Separate L10N wave
- ❌ Any modification to `docs/place-data-maintenance-policy.md`

*— End of report —*
