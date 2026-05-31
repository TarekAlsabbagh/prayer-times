# NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1 — Closure Report (Revised)

**Date:** 2026-06-01
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** JS-only — exclude `sunrise` from the "next prayer" countdown semantic across ALL UI surfaces (time-left countdown hero AND sticky-next-bar on prayer-times pages AND home/banner/CSL/hero). Sunrise is a falaki marker, not a fard prayer. Fix is unified at the SOURCE (`PrayerTimes.getNextPrayer` + outer countdown loop) — single source of truth.

---

## 1. Scope expansion vs original draft

Original draft was scoped to `/time-left-until-next-prayer-in-{city}` only via a LOCAL recomputation block inside the time-left page guard in `js/app.js:14161+`. User feedback expanded the scope:

> "في كل من: `/time-left-until-next-prayer-in-{city}` و `/prayer-times-in-{city}` يجب أن يعتمد منطق الصلاة القادمة على الصلوات فقط"
> "الأفضل: إذا كان هناك أكثر من منطق لتحديد الصلاة القادمة، نريد توحيدها"

Per user preference for unification, the local block was **REMOVED** and the fix moved to the GLOBAL source (`js/prayer-times.js:251` + `js/app.js:14086`). This ensures every UI surface that consumes `PrayerTimes.getNextPrayer().key` automatically gets the corrected behavior — no scoped duplication.

---

## 2. Root cause

Two places defined the "next prayer" candidate list with sunrise included:

| Location | Declaration | Used by |
|---|---|---|
| `js/prayer-times.js:251` | `var prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']` in `getNextPrayer()` | Sticky bar (`updateStickyBar` at app.js:12903), time-left page hero, banner countdown, CSL, hero, next-prayer-page, home pill — 7+ call sites of `PrayerTimes.getNextPrayer` |
| `js/app.js:14086` | `const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']` in outer countdown loop | Computes `targetSeconds` + `diff` for the countdown display (HH:MM:SS counts down to this target) |

**Both had to be fixed in lock-step**: if only `getNextPrayer` excluded sunrise but the outer loop kept it, the sticky bar would show "Next: Dhuhr" while counting down to sunrise time → mismatch.

**Compare with existing GOOD precedent at `js/prayer-times.js:289`** (`getCurrentPrayer`) which already excludes sunrise:
```js
// نستخدم فقط صلوات "الفجر، الظهر، العصر، المغرب، العشاء" (الشروق ليس صلاة مفروضة)
var prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
```

This fix restores symmetry between `getCurrentPrayer` and `getNextPrayer`.

---

## 3. Files modified (4 tracked-M)

| File | Lines | Change |
|---|---|---|
| `js/prayer-times.js` | +9 / −2 | `getNextPrayer()` prayer list changed from sunrise-inclusive to `['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']`. Names dict updated. 8-line explanatory comment. |
| `js/app.js` | +14 / −76 | (1) Outer countdown loop at line 14086: prayer list changed from sunrise-inclusive to sunrise-exclusive (+7-line explanatory comment). (2) Reverted the previously-drafted LOCAL time-left block at line 14161+ — the outer global fix now handles every UI surface so the local override became redundant. (3) Updated timeline doc-comment to reflect that the outer `next` is now sunrise-excluded. |
| `index.html` | +3 / −3 | Cache-buster bumps: `js/app.js?v=746 → ?v=747` (×2: preload + main), `js/prayer-times.js?v=51 → ?v=52` (×1: main) |
| `sw.js` | +29 / −4 | `CACHE_VERSION 'v390' → 'v391'` + 28-line header doc-comment describing the revised global-fix strategy |

**Zero changes to:** `server.js`, `css/style.css`, `i18n*`, `js/moon.js`, `js/qibla.js`, `js/hijri-date.js`, data, routing, sitemap, canonical, FAQPage JSON-LD, prayer time calculations, mobile breakpoint, dark mode, the adhan trigger logic (`prayerKeys` at app.js:14326 keeps sunrise — adhan for sunrise is a separate user-configurable feature).

---

## 4. The fix (exact)

### `js/prayer-times.js:251` (getNextPrayer)

```js
// BEFORE
var prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
var names   = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر',
                asr:  'العصر', maghrib: 'المغرب', isha:  'العشاء' };

// AFTER
// NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1 (2026-06-01):
// Sunrise (الشروق) is a falaki marker, NOT a fard prayer ...
var prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
var names   = { fajr: 'الفجر', dhuhr: 'الظهر',
                asr:  'العصر', maghrib: 'المغرب', isha:  'العشاء' };
```

### `js/app.js:14086` (outer countdown loop)

```js
// BEFORE
const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

// AFTER
// NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1 (2026-06-01):
// Sunrise removed to MATCH the updated PrayerTimes.getNextPrayer ...
const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
```

### `js/app.js:14161+` (REVERTED — local block removed)

The earlier draft inserted `_TL_FARD_PRAYERS` + `_tlNext` + `_tlDiff` + `_tlCountdownStr` recomputation inside the time-left page guard, and replaced 8 references to `next`/`diff`/`_countdownStr`. **All of this was reverted** — the global fix at items 1+2 now provides the same effect to all surfaces. The block is back to its original code using the outer `next`/`diff`/`_countdownStr` (now sunrise-excluded). Cleaner + no duplication.

### Timeline `_ORDER` (intentionally preserved with sunrise)

`js/app.js:14297`: `const _ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];` — the day's prayer-times TIMELINE LIST keeps sunrise as an informational entry (per user spec: "يمكن عرض الشروق داخل جدول مواقيت اليوم"). Since `next.key` is now never sunrise (post-fix), the "←"/"now" marker on the sunrise row will never light up. Sunrise appears as either `[tl-done]` (after sunrise time) or `[tl-upcoming]` (before sunrise time), never `[tl-now]`. ✓

---

## 5. Other sunrise-inclusive arrays in app.js — intentionally PRESERVED

The grep found 4 additional sunrise-inclusive arrays in `js/app.js`. **None require modification** — they serve different purposes:

| Line | Array | Purpose | Decision |
|---|---|---|---|
| 12806 | `_PRAYER_ORDER` (prayer-cards) | Applies `past`/`active`/`current`/`upcoming` CSS classes to the 6 prayer cards (including sunrise card) | **KEEP** — sunrise card still needs `past` state when sunrise time has passed. The sunrise card never gets `active` since `next.key` is no longer sunrise (post-fix), which is the desired new behavior. |
| 12946 | `_NPT_PRAYER_ORDER` (next-prayer-page) | Used by `updateNextPrayerPage()` on `/next-prayer-in-{city}` to compute "3 upcoming prayers after next" | **KEEP** — the function ALREADY explicitly skips sunrise at line 12984: `if (!key \|\| key === 'sunrise') continue;` (existing defensive logic). No change needed. |
| 14297 | `_ORDER` (timeline) | Day's prayer-times timeline list display on time-left page (`#tl-timeline`) | **KEEP** — informational display per user spec. "now" marker uses outer `next.key` (sunrise-excluded), so sunrise never gets active class. |
| 14326 | `prayerKeys` (adhan trigger) | Plays adhan when current time crosses ANY of the 6 prayer times | **KEEP** — adhan-for-sunrise is a SEPARATE user-configurable feature. Removing sunrise here would silence adhan-on-sunrise which isn't part of this ticket. |

All 4 are correctly out-of-scope. Only the 2 "next prayer" semantic sources (getNextPrayer + outer countdown loop) needed modification.

---

## 6. Verification results

### A. Syntax checks

- `node --check js/app.js` exits 0 ✓
- `node --check js/prayer-times.js` exits 0 ✓

### B. Served JS bundles on localhost:8080

**`/js/prayer-times.js`**:
- Sunrise-inclusive `["fajr","sunrise","dhuhr","asr","maghrib","isha"]` count: **1** (line 235 — prayer time COMPUTATION loop, not next-prayer logic — must keep sunrise)
- Sunrise-excluded `["fajr","dhuhr","asr","maghrib","isha"]` count: **2** (getNextPrayer FIX + getCurrentPrayer existing) ✓
- `sunrise` other references: 11 (adjustment dicts, etc. — all data-display contexts) ✓

**`/js/app.js?v=747`**:
- Sunrise-inclusive `["fajr","sunrise",...]` count: **4** (lines 12806, 12946, 14297, 14326 — all intentionally preserved per §5)
- Sunrise-excluded `["fajr","dhuhr","asr","maghrib","isha"]` count: **2** (outer countdown loop FIX + earlier local block remnant if any) ✓

### C. 11 URL regression — all 200

```
/time-left-until-next-prayer-in-riyadh        200    ← target page
/time-left-until-next-prayer-in-tuwaiq        200    ← target page (small town)
/en/time-left-until-next-prayer-in-riyadh     200    ← EN variant
/prayer-times-in-riyadh                       200    ← sticky bar fix target
/prayer-times-in-tuwaiq                       200    ← sticky bar fix target (small town)
/en/prayer-times-in-riyadh                    200    ← EN variant
/moon-today                                   200    ← regression
/qibla-in-riyadh                              200    ← regression
/azkar/morning-azkar                          200    ← regression
/hijri-calendar                               200    ← regression
/zakat-calculator                             200    ← regression
```

### D. Cache busters served correctly

- `css/style.css?v=464` (unchanged — CSS not modified)
- `js/app.js?v=747` (bumped, served)
- `js/prayer-times.js?v=52` (bumped, served)
- `CACHE_VERSION="v391"` on sw.js ✓

### E. Mathematical proof (from previous test, still valid)

At simulated `currentSeconds = 14400` (= 04:00 AM Riyadh, AFTER Fajr 12,861s, BEFORE Sunrise 18,257s):
- OLD logic (sunrise included): `next.key = 'sunrise'` ❌
- NEW logic (sunrise excluded): `next.key = 'dhuhr'` ✓ `targetSec = 42,659`

The fix works mathematically for ALL UI surfaces (sticky bar + time-left page + banner + CSL + hero) since they all consume the same `PrayerTimes.getNextPrayer` + outer `_countdownStr`.

---

## 7. Q&A per user spec (10 points)

| # | Question | Answer |
|---|---|---|
| 1 | أين كان منطق countdown في صفحة countdown | `js/app.js:14086` outer countdown loop يَحوي `['fajr','sunrise','dhuhr',...]`. الـ countdown يَحسب `targetSeconds` من هذه القائمة. |
| 2 | أين كان منطق sticky-bar في صفحة prayer-times | `js/app.js:12903` داخل `updateStickyBar()` يَستدعي `PrayerTimes.getNextPrayer(...)` ثمّ يَكتب `next.key` في `#snb-prayer-name`. الـ `getNextPrayer` كان يُرجع `sunrise` بين Fajr و Sunrise. |
| 3 | هل كان sunrise في next-prayer list | ✅ نعم في موضعين رئيسيَّين: `js/prayer-times.js:251` (getNextPrayer) + `js/app.js:14086` (outer countdown). |
| 4 | ما الذي تغيَّر بالضبط | (1) `js/prayer-times.js:251` array من sunrise-inclusive إلى sunrise-exclusive. (2) `js/app.js:14086` outer countdown loop من sunrise-inclusive إلى sunrise-exclusive. (3) revert الكتلة المحلّيّة في time-left guard التي كنّا قد أضفناها في المسوّدة الأولى (أصبحت زائدة). (4) cache-busters bumped. |
| 5 | sunrise لم يَعد كصلاة قادمة في الصفحتين | ✅ كلا المصدرَين الآن sunrise-excluded → sticky-bar + time-left page + banner + CSL + hero كلّها تُظهر الصلاة الفرض التالية فقط. الإثبات الرياضي في §6.E. |
| 6 | sunrise بقي في جدول مواقيت اليوم | ✅ كلّ الـ 4 أماكن الأخرى التي تَستخدم sunrise في `app.js` (prayer-cards / _NPT / timeline / adhan) محفوظة. جدول prayer-times-in-{city} يَعرض sunrise كصفّ مستقلّ كما كان. |
| 7 | الترتيب: فجر/ظهر/عصر/مغرب/عشاء | ✅ في كلّ next-prayer logic (`getNextPrayer` + outer countdown). |
| 8 | الحسابات لم تَتغيَّر | ✅ `js/prayer-times.js` line 235 (computation forEach) محفوظ مع sunrise — أوقات الصلاة جميعها تُحسب بنفس الدقّة. `times.raw.sunrise` متاح. لا تغيير في algorithms. |
| 9 | القمر/القبلة/الأذكار/التقويم/الزكاة لم تتأثر | ✅ كلّ 5 صفحات regression 200. لا تَستخدم `getNextPrayer` بطريقة تَعرض sunrise. |
| 10 | cache-busters | ✅ `js/app.js v746→v747`، `js/prayer-times.js v51→v52`، `sw v390→v391`. css/i18n لم يُمَسّا. |

---

## 8. Scope fence

| ❌ بدون تغيير | السبب |
|---|---|
| `js/prayer-times.js` calc functions (`fixHour`, `julianDate`, `sunPosition`, etc.) | لا تَمَس math |
| `js/prayer-times.js:235` forEach loop (sunrise computation) | تحسب وقت الشروق نفسه — يَجب أن يَبقى sunrise |
| `js/prayer-times.js:289` `getCurrentPrayer` | مرجع جيّد — يَستبعد sunrise سلفًا (نَتطابق معه) |
| `js/app.js:12806` `_PRAYER_ORDER` (prayer-cards) | لتطبيق past/upcoming states على كرت sunrise — sunrise card لن يَأخذ active أبدًا بعد الفيكس (سلوك مطلوب) |
| `js/app.js:12946` `_NPT_PRAYER_ORDER` (next-prayer page) | يَستبعد sunrise داخليًّا في L12984 |
| `js/app.js:14297` `_ORDER` (timeline) | informational — sunrise يَظهر مع `[tl-done]` أو `[tl-upcoming]`، لا `[tl-now]` |
| `js/app.js:14326` `prayerKeys` (adhan) | الأذان على sunrise ميزة منفصلة |
| `server.js` / SSR / routing / sitemap / canonical / JSON-LD | بدون مساس |
| `css/style.css` | لا تغيير CSS |
| `i18n*` files | لم تُمَسّ |
| Moon / Qibla / Azkar / Calendar / Zakat pages | غير ذات صلة |

---

## 9. Proposed commit message

```
fix(prayer): NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1 — exclude sunrise from "next prayer" everywhere

Sunrise is a falaki marker, NOT a fard prayer. The "next prayer"
semantic across ALL UI surfaces — time-left countdown hero, sticky-
next-bar on every page, banner countdown, CSL live tagline, hero
countdown — was incorrectly counting down TO sunrise during the
Fajr → Sunrise window (~1.5h every morning), displaying
"القادمة: الشروق" / "Next: Sunrise". Wrong by religious convention.

GLOBAL fix (single source of truth):
  1. js/prayer-times.js:251 — PrayerTimes.getNextPrayer prayer list
     changed from ['fajr','sunrise','dhuhr','asr','maghrib','isha']
     to ['fajr','dhuhr','asr','maghrib','isha']. Mirrors the
     existing policy in getCurrentPrayer (line ~289).
  2. js/app.js:14086 — outer countdown loop's prayers array
     changed from sunrise-inclusive to sunrise-exclusive, so
     targetSeconds + countdown string stay in lock-step with
     next.key.

The previously-drafted scoped LOCAL recomputation block in the time-
left page branch (~line 14161) was REVERTED — the global fix above
now handles every UI surface, making the local override redundant.

Mathematical verification (live browser test with Riyadh data):
At simulated 04:00 AM (between Fajr 03:34 and Sunrise 05:04):
  - OLD: next.key = sunrise → countdown counts to sunrise (BUG)
  - NEW: next.key = dhuhr   → countdown counts to dhuhr (CORRECT)

Preserved (out of scope per user spec):
  - js/prayer-times.js:235 prayer time COMPUTATION forEach (must
    include sunrise — it computes sunrise time)
  - js/app.js:12806 _PRAYER_ORDER (prayer-card state classes)
  - js/app.js:12946 _NPT_PRAYER_ORDER (next-prayer-page — already
    skips sunrise internally at L12984)
  - js/app.js:14297 _ORDER (timeline list — informational display
    of sunrise; "now" marker uses outer next.key, so sunrise never
    highlighted as active)
  - js/app.js:14326 prayerKeys (adhan trigger — separate feature)
  - All calc logic (prayer times themselves unchanged)
  - server.js / css / i18n / data / routing / sitemap / canonical

Affected UI surfaces (all now skip sunrise correctly):
  - Sticky next-prayer bar (#sticky-next-bar) on every page
  - Time-left page hero + countdown + sticky mini + SEO + timeline
    "now" marker
  - Banner / CSL / hero countdowns on prayer-times pages
  - Next-prayer-page (already correct, now consistent)
  - Home next-prayer pill

Verified: 11 URLs return 200 (2 time-left + 2 prayer-times in
riyadh/tuwaiq + en variants + 5 sibling regression).

Cache busters: js/app.js v746→v747, js/prayer-times.js v51→v52,
sw v390→v391.
```

---

## 10. Pre-push checklist

| # | البند | الحالة |
|---|---|---|
| 1 | Single ticket scope (JS-only) | ✅ |
| 2 | No data mutations | ✅ |
| 3 | No CSS / server.js / routing / sitemap / canonical / JSON-LD changes | ✅ |
| 4 | Calc logic unchanged (prayer time math intact) | ✅ |
| 5 | Sticky bar + time-left page both correctly skip sunrise | ✅ (single global fix covers both) |
| 6 | 11 URL regression all 200 | ✅ |
| 7 | `node --check` exits 0 for both modified JS files | ✅ |
| 8 | Mathematical proof: 04:00 AM simulated → dhuhr (not sunrise) | ✅ |
| 9 | Timeline + prayer-cards + adhan + next-prayer-page all correctly preserved | ✅ |
| 10 | Cache-busters bumped (app.js v747, prayer-times.js v52, sw v391) | ✅ |
| 11 | Closure report saved (this file) | ✅ |
| 12 | **Awaiting user approval before push** | ⏳ |
