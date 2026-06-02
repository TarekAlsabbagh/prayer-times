# تقرير ما قبل الدفع: HIJRI-DATE-DAY-CLIENT-SEO-OVERWRITE-FIX-1

**النوع:** Fix — Option A (مواءمة client SEO مع ladder الخادم). **النطاق:** All supported languages (10).
**الحالة:** جاهز للاعتماد — لم يُنفَّذ commit/push بعد.
**التاريخ:** 2026-06-02 · **المرجع:** AR-HIJRI-DATE-BROWSER-SEO-CACHE-VERIFICATION-1 (معتمد).

---

## 1) السبب الجذريّ
صفحة `/hijri-date/YYYY-MM-DD` تخدم من SSR عنوانًا/وصفًا صحيحين عبر ladder الخادم (`_pickHdayTitle`/`_pickHdayDesc`). لكن بعد hydration، `loadHijriDayPage()` كان ينادي `setSEOMeta()` بقوالب **ثابتة قديمة** (`_HD3_TITLE`/`_HD3_DESC`، ما قبل ladder) — فيدهس عنوان SSR الصحيح. النتيجة في المتصفح: Title 61 / Meta 114 لـ ذو الحجة (خارج النطاقَين)، رغم أن HTML الخام كان مطابقًا (55/130).

## 2) مكان الدهس في `app.js`
`loadHijriDayPage()` (app.js:22558) → السطور 23065-23091 (تعريف `_HD3_TITLE`/`_HD3_DESC` ثم `setSEOMeta`).

## 3) القيم قبل الإصلاح (بعد hydration — متصفح headless حقيقيّ)
| الصفحة | Title | طول | Meta | طول |
|---|---|---|---|---|
| `/hijri-date/1447-12-17` (AR) | `التاريخ الهجري 17 ذو الحجة 1447 هـ \| التاريخ الميلادي المقابل` | **61** ❌ | الوصف القصير القديم | **114** ❌ |

## 4) القيم بعد الإصلاح (بعد hydration — متصفح headless حقيقيّ)
| الصفحة | Title | طول | Meta | طول | duplicate meta |
|---|---|---|---|---|---|
| `/hijri-date/1447-12-17` (AR) | `التاريخ الهجري 17 ذو الحجة 1447 هـ \| ما يوافقه ميلادياً` | **55** ✅ | الوصف الطويل (ladder) | **130** ✅ | 1 |
| `/en/hijri-date/1447-12-17` (EN) | `17 Dhu al-Hijjah 1447 AH \| Gregorian Date Equivalent` | **52** ✅ | long form | **138** ✅ | 1 |
| `/ur/hijri-date/1447-12-17` (UR) | `ہجری تاریخ 17 ذوالحجہ 1447 ہجری \| عیسوی تاریخ کی مماثل` | **54** ✅ | long form | **131** ✅ | 1 |

كلّها **تطابق SSR بايت-ببايت** + `hasOldTitle=false` + `hasNewTitle=true` + `metaCount=1`.

## 5) هل تم استخدام ladder مطابق للخادم؟
نعم — نُقِلت **نفس صيغ الخادم** (`_HDAY_TITLE_FORMS`/`_HDAY_DESC_FORMS`) و**نفس منطق الـpickers** (`_pickHdayTitle`: أول صيغة ∈ [50,60] → الأطول ≤60 → fallback؛ `_pickHdayDesc`: long إن ≤160 وإلا short) إلى العميل، مع نفس المُدخَل `hDate` (= server `_datedAr`) و`Array.from(s).length`. ⇒ مخرجات العميل **مطابقة رياضيًّا** لمخرجات SSR لكل لغة/تاريخ.

## 6) جدول اختبار AR (SSR == client، مؤكَّد متصفحيًّا للمميَّز بـ★)
| التاريخ | Title len | Meta len |
|---|---|---|
| 1447-01-01 (محرم) | 50 ✅ | 125 ✅ |
| 1447-03-15 (ربيع الأول) | 57 ✅ | 132 ✅ |
| 1447-04-15 (ربيع الآخر) | 57 ✅ | 132 ✅ |
| 1447-11-15 (ذو القعدة) | 56 ✅ | 131 ✅ |
| ★ 1447-12-17 (ذو الحجة) | 55 ✅ | 130 ✅ |

## 7) جدول اختبار EN (SSR == client، ★ مؤكَّد متصفحيًّا)
| التاريخ | Title len | Meta len |
|---|---|---|
| 1447-01-01 (Muharram) | 57 ✅ | 132 ✅ |
| 1447-03-15 (Rabi al-Awwal) | 52 ✅ | 138 ✅ |
| 1447-04-15 (Rabi al-Thani) | 52 ✅ | 138 ✅ |
| 1447-11-15 (Dhu al-Qidah) | 51 ✅ | 137 ✅ |
| ★ 1447-12-17 (Dhu al-Hijjah) | 52 ✅ | 138 ✅ |

## 8) spot-check باقي اللغات @ 1447-12-17 (SSR == client، ★ ur مؤكَّد متصفحيًّا)
| اللغة | Title len | Meta len |
|---|---|---|
| fr | 60 ✅ | 160 ✅ |
| tr | 60 ✅ | 141 ✅ |
| ★ ur | 54 ✅ | 131 ✅ |
| de | 55 ✅ | 158 ✅ |
| id | 51 ✅ | 160 ✅ |
| es | 59 ✅ | 149 ✅ |
| bn | 53 ✅ | 133 ✅ |
| ms | 52 ✅ | 156 ✅ |

**كل الـ10 لغات: Title ∈ [50,60]، Meta ∈ [120,160].** (fr/id/ms عند حدود النطاق وهي شاملة inclusive.)

## 9) تطابق SSR ↔ DOM بعد hydration
✅ مؤكَّد. القيم المقاسة في المتصفح (AR 55/130، EN 52/138، UR 54/131) **مطابقة تمامًا** لقيم SSR المقابلة. لم يعُد هناك divergence.

## 10) H1 لم يتغيّر
✅ H1 صفحة اليوم سليم (مثال ur: «ہجری تاریخ: بدھ، 17 ذوالحجہ 1447 ہجری») — الإصلاح يمسّ مصدر title/description فقط داخل `setSEOMeta`، لا H1.

## 11) JSON-LD لم يتغيّر
✅ `script[type=application/ld+json]` = 2 (حاضر، غير متأثّر). لم تُمَسّ `_HD3_DESC_LD`/مخطّطات الـschema.

## 12) الحسابات الهجرية/الميلادية لم تتغيّر
✅ صفر مساس بـ `HijriDate`/`toGregorian`/منطق محوّل التاريخ. الإصلاح نصوص SEO فقط.

## 13) canonical/hreflang/sitemap لم تتغيّر
✅ canonical/og/hreflang تُدار عبر `setSEOMeta` (منطق غير معدَّل)؛ sitemap/routing بلا تعديل. canonical مؤكَّد صحيح في المتصفح.

## 14) نتائج regression (صفحات المقارنة، محليًّا)
| الصفحة | الحالة |
|---|---|
| `/today-hijri-date` · `/en/today-hijri-date` | غير متأثّرة (عناوينها كما هي — مسار مختلف) ✅ |
| `/hijri-calendar` · `/en/hijri-calendar` | غير متأثّرة ✅ |
| `/hijri-calendar/1447-12` · `/en/hijri-calendar/1447-12` | غير متأثّرة ✅ |

(الإصلاح محصور في `loadHijriDayPage` — لا يطال أيّ صفحة أخرى. `node --check js/app.js` ✅.)

## 15) cache-busters
| المفتاح | قبل | بعد |
|---|---|---|
| `index.html` → `app.js?v=` | 752 | **753** |
| `sw.js` → `CACHE_VERSION` | v412 | **v413** |
| `sw.js` → PRECACHE `app.js?v=` | 752 | **753** |

## 16) رسالة commit المقترحة
```
seo(hijri): HIJRI-DATE-DAY-CLIENT-SEO-OVERWRITE-FIX-1 — align client day SEO meta with SSR ladders
```

---

## الملفّات المعدَّلة (3 ملفّات، +56/-28)
| الملف | التغيير |
|---|---|
| `js/app.js` | استبدال `_HD3_TITLE`/`_HD3_DESC` الثابتة بـ ladder الخادم (`_HDAY_TITLE_FORMS`/`_pickHdayTitle` + `_HDAY_DESC_FORMS`/`_pickHdayDesc`) داخل `loadHijriDayPage` فقط |
| `index.html` | `app.js?v=752 → 753` (موضعان) |
| `sw.js` | `CACHE_VERSION v412 → v413` + PRECACHE `app.js?v=753` |
| `reports/…prepush.md` | هذا التقرير |
**لم يُمَسّ:** server.js (الـladder المرجعيّ موجود مسبقًا، لا حاجة لتعديله)، CSS، i18n، JSON-LD، canonical/hreflang/sitemap، الحسابات، صفحات الأذكار.

## معايير القبول — حالة محليّة
1. لا يكتب app.js Title القديم بعد hydration — ✅ (hasOldTitle=false)
2. لا يكتب app.js Meta القديم بعد hydration — ✅ (130 لا 114)
3. AR 1447-12-17: Title 55 ∈[50,60]، Meta 130 ∈[120,160] — ✅
4. EN 1447-12-17: Title 52 ∈[50,60]، Meta 138 ∈[120,160] — ✅
5. لا فرق جوهريّ SSR↔DOM — ✅ (مطابقة تامّة)
6. لا duplicate meta — ✅ (metaCount=1)
7. canonical/og/hreflang سليمة — ✅
8. H1 لم يتغيّر — ✅
9. JSON-LD لم يتغيّر — ✅ (2)
10. الحسابات لم تتغيّر — ✅
11. باقي صفحات Hijri غير متأثّرة — ✅
12. regression 200 — ✅ محليًّا (Production بعد الدفع)

---

## تأكيدات
- تقرير **ما قبل الدفع** — **لم يُنفَّذ** commit أو push.
- التحقّق تمّ عبر **متصفح headless حقيقيّ** (Preview على الخادم المحليّ بنفس مصدر `app.js`) + مصفوفة SSR كاملة — وليس curl فقط.
- **لم تُبدأ أيّ صفحة أذكار** (انتظارًا لاعتماد `/azkar/prayer-azkar` بصريًّا).

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: HIJRI-DATE-DAY-CLIENT-SEO-OVERWRITE-FIX-1`
