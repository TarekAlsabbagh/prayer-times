# SUPPORTED-LOCAL-LANG-CITIES-FINAL-FAST — Audit Report

**Date:** 2026-05-21
**Mode:** AUDIT ONLY — STOPPED before Apply (scope exceeds 80-city threshold)
**Status:** ⏸ AWAITING USER DECISION ON SPLIT

---

## Executive Summary

**Audit verdict: data is in good shape; no critical gaps in supported-local-lang
coverage anywhere.** All 10 audited supported-local-lang countries have 100%
`names.{ar, en, localLang}` completeness. All 18 audited Arabic countries have
100% `names.{ar, en}` completeness.

**Expansion is OPTIONAL** — current curated entries cover the major cities in
each country with proper localization, just lower total counts than India/PK
because those countries received dedicated waves recently.

**Total expansion scope if all 9 non-TR countries get 20-40 cities each:
~185 cities — well above the user's 80-city threshold.** Per user direction,
I STOP at audit and ask for a split decision.

---

## Section 1: Current Local-Lang Coverage (Surface)

| Country | Curated | ar | en | localLang | Coverage |
|--------:|--------:|---:|---:|----------:|---------:|
| TR (tr) |      14 | 14 | 14 |        14 |     100% |
| FR (fr) |      25 | 25 | 25 |        25 |     100% |
| DE (de) |      56 | 56 | 56 |        56 |     100% |
| ES (es) |      45 | 45 | 45 |        45 |     100% |
| MX (es) |      31 | 31 | 31 |        31 |     100% |
| AR (es) |      10 | 10 | 10 |        10 |     100% |
| CO (es) |       9 |  9 |  9 |         9 |     100% |
| PE (es) |      13 | 13 | 13 |        13 |     100% |
| CL (es) |       6 |  6 |  6 |         6 |     100% |
| VE (es) |       9 |  9 |  9 |         9 |     100% |
| **Total** | **218** | **218** | **218** | **218** | **100%** |

---

## Section 2: Local-Lang Quality (Real Localization vs Same-as-EN)

The check: how many entries have `names[localLang] !== names.en` (= real
diacritic/exonym difference) vs `names[localLang] === names.en` (=
same-as-en, which is the **correct** localization for most Latin-script
proper nouns).

| Country/Lang | Total | Differs from EN | Same-as-EN | Examples (differs)                                  |
|--------------|------:|----------------:|-----------:|-----------------------------------------------------|
| TR / tr      |    14 |             4   |        10  | istanbul→İstanbul, izmir→İzmir, diyarbakir→Diyarbakır, sanliurfa→Şanlıurfa |
| FR / fr      |    25 |             0   |        25  | (Paris/Lyon/Marseille all same-as-en, correct)     |
| DE / de      |    56 |             4   |        52  | munich→München, cologne→Köln, frankfurt→Frankfurt am Main, nuremberg→Nürnberg |
| ES / es      |    45 |             3   |        42  | seville→Sevilla, cadiz→Cádiz, san-sebastian→San Sebastián |
| MX / es      |    31 |             1   |        30  | mexico-city→Ciudad de México                       |
| AR / es      |    10 |             0   |        10  | (Buenos Aires same-as-en, correct)                 |
| CO / es      |     9 |             1   |         8  | bogota→Bogotá (diacritic)                          |
| PE / es      |    13 |             0   |        13  | (Lima/Cuzco same-as-en, correct)                   |
| CL / es      |     6 |             0   |         6  | (Santiago/Talcahuano same-as-en, correct)          |
| VE / es      |     9 |             0   |         9  | (Caracas same-as-en, correct)                      |

**Verdict:** Quality is **excellent**. The "same-as-en" values are correct —
French/Spanish/German cities mostly share names with English. The ~13 differing
entries all use proper diacritics or canonical local exonyms (Munich/München,
Mexico City/Ciudad de México, etc.). No fillchain bugs detected.

---

## Section 3: Arabic-Country Coverage (Spot Audit)

| Country | Cities | ar | en | Status |
|---------|-------:|---:|---:|--------|
| SA      |    183 |183 |183 | ✅ Full |
| EG      |     67 | 67 | 67 | ✅ Full |
| AE      |     26 | 26 | 26 | ✅ Full |
| JO      |     17 | 17 | 17 | ✅ Full |
| LB      |     11 | 11 | 11 | ✅ Full |
| SY      |     51 | 51 | 51 | ✅ Full |
| IQ      |     58 | 58 | 58 | ✅ Full |
| YE      |     26 | 26 | 26 | ✅ Full |
| MA      |     22 | 22 | 22 | ✅ Full |
| DZ      |     64 | 64 | 64 | ✅ Full |
| TN      |     41 | 41 | 41 | ✅ Full |
| LY      |     36 | 36 | 36 | ✅ Full |
| KW      |     13 | 13 | 13 | ✅ Full |
| QA      |     17 | 17 | 17 | ✅ Full |
| BH      |     10 | 10 | 10 | ✅ Full |
| OM      |     22 | 22 | 22 | ✅ Full |
| SD      |     34 | 34 | 34 | ✅ Full |
| PS      |     12 | 12 | 12 | ✅ Full |

**All 18 Arabic countries: 100% ar+en complete. Per user direction, NO
expansion wave for Arabic countries — coverage is good.**

---

## Section 4: Candidate Source Availability

| Country | Candidates File              | Available |
|---------|------------------------------|-----------|
| **TR**  | tr-geonames-candidates.json  | ❌ MISSING |
| FR      | fr-geonames-candidates.json  | ✅ 80,238  |
| DE      | de-geonames-candidates.json  | ✅ 75,955  |
| ES      | es-geonames-candidates.json  | ✅ 29,242  |
| MX      | mx-geonames-candidates.json  | ✅ 254,114 |
| AR      | ar-geonames-candidates.json  | ✅ 14,542  |
| CO      | co-geonames-candidates.json  | ✅ 33,699  |
| PE      | pe-geonames-candidates.json  | ✅ 46,765  |
| CL      | cl-geonames-candidates.json  | ✅ 2,907   |
| VE      | ve-geonames-candidates.json  | ✅ 23,328  |

**Turkey requires Stage-1 preflight (TR.zip download + extraction) before any
add wave can run. All others have candidates ready for filter→select pipeline.**

---

## Section 5: Risk Assessment

| Risk                                                       | Severity | Notes                                                                       |
|------------------------------------------------------------|---------:|-----------------------------------------------------------------------------|
| Turkey has no candidates                                   |    HIGH  | Needs Stage-1 download before TR cities can be added                       |
| Total scope ~185 cities if all done                        |    HIGH  | Far exceeds user's 80-city single-wave threshold                            |
| Arabic-name manual translit cost                           |  MEDIUM  | Each new city needs canonical Arabic; cannot use MT/fillchain               |
| Spanish-name diacritic verification                        |     LOW  | Wikipedia/Wikidata easy lookup; most cities are same-as-en (proper nouns)   |
| French/German lang quality                                 |     LOW  | Same as Spanish — diacritics only differ in ~5% of cities                   |
| Spurious GeoNames "city" stubs (districts/mukim/neighbours)|  MEDIUM  | Same issue as ID/MY waves — careful filtering needed                        |

---

## Section 6: Recommended Split (User Decision Required)

Given the scope, I recommend **splitting into 3 sub-phases**, each within the
20-50 city ceiling. **None should be auto-started — each needs explicit user
greenlight per closure of the previous.**

### **Sub-phase A: FR + DE — FAST**
- France & Germany, both Latin-script European countries.
- ~25-30 FR cities + ~20-25 DE cities (since DE already at 56, smaller delta).
- Both languages: most names same-as-en (correct); a few canonical exonyms.
- Risk: LOW.
- Suggested target: **~40-50 cities total**.

### **Sub-phase B: ES + Latin-Spanish — FAST**
- Spain + Mexico + Argentina + Colombia + Peru + Chile + Venezuela.
- Pick top-pop cities not yet curated. ES candidates limited (~29k), Latin
  much larger pools.
- Risk: LOW-MEDIUM (need careful district vs city filter per country).
- Suggested target: **~50-60 cities total**.

### **Sub-phase C: TR — FAST (needs Stage-1 preflight first)**
- Cannot start until TR.zip + tr-geonames-candidates.json generated.
- Then add 25-30 Turkish cities with names.tr (with proper Turkish chars
  ş ğ ç ı İ ü ö).
- Risk: MEDIUM (preflight required first).
- Suggested target: **~25-30 cities**.

**TOTAL across all 3 sub-phases: ~115-140 cities — but spread across separate
applies, each properly tested and closed before the next.**

---

## Section 7: Why NOT a Single Wave

User directives explicitly prohibited:
1. "إذا كان الحجم كبيرًا، اقسمها إلى TR fast / FR/DE fast / ES fast"
2. "لا تبدأ أكثر من تطبيق واحد قبل إبلاغي إذا رأيت أن النطاق يتجاوز 80 مدينة"
3. "إذا ظهر أن المرحلة ستكبر جدًا أو غير آمنة، توقف عند Audit فقط"

Combined with:
- 185+ city scope
- TR preflight blocker
- 5 different countries × Spanish-language considerations
- Per-city manual Arabic transliteration cost

→ Single wave is **NOT SAFE**. Sub-phase split is **REQUIRED**.

---

## Section 8: Things Verified NOT Modified

- ✅ `db/places/curated-places.json` — 0-byte diff (audit was read-only)
- ✅ `server.js` — 0-byte diff
- ✅ `js/app.js` — 0-byte diff
- ✅ `index.html` — 0-byte diff
- ✅ `server/place-l10n/index.js` — 0-byte diff
- ✅ `docs/place-data-maintenance-policy.md` — 0-byte diff
- ✅ India / Indonesia / Malaysia / Pakistan / Bangladesh entries — untouched
  (audit was read-only; no apply ran)
- ✅ Search-ranking code — untouched

---

## Section 9: Recommended Next Step (User Choice)

Please choose **ONE** of these options to proceed:

**Option 1** (recommended): Greenlight **Sub-phase A (FR + DE)** as the next
fast wave. ~40-50 cities, lowest risk, candidates ready, no Stage-1 needed.

**Option 2**: Greenlight **Sub-phase B (ES + Latin)** instead. ~50-60 cities,
candidates ready, slight extra complexity per country.

**Option 3**: Greenlight **TR preflight** to unblock Sub-phase C. Requires
TR.zip pipeline before any cities can be added.

**Option 4**: Defer all expansion. Local-lang coverage is already 100% on
existing 218 supported-local-lang entries; no critical gap. Move on to
"صفحات التاريخ الهجري" (Hijri date pages) instead.

**Default if you don't specify**: **STOP** entirely until further guidance.
**Do not auto-start any sub-phase**.

---

## Files Verified Unmodified (git status)

```
$ git diff --stat HEAD -- db/places/curated-places.json server.js js/app.js index.html docs/place-data-maintenance-policy.md server/place-l10n/index.js
(empty — 0 bytes)
```

Only file modified during this audit:
`reports/supported-local-lang-cities-final-fast-closure.md` (this report).

---

## STOP

Audit phase complete. No data modified, no code modified.
**Awaiting user decision on sub-phase split.**
**No new sub-phase started.**
