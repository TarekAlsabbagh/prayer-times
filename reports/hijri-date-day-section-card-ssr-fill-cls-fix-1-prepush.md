# تقرير ما قبل الدفع: HIJRI-DATE-DAY-SECTION-CARD-SSR-FILL-CLS-FIX-1

**النوع:** Perf/CLS — SSR-fill عناصر هيرو صفحة التاريخ الهجريّ اليوميّ (`#hday-day-num` / `#hday-month` / `#hday-year` / `#hday-subtitle`) + حُرّاس no-swap. **لم يُنفَّذ commit/push.**
**التحقّق:** متصفح headless (Preview, 3000) + `PerformanceObserver('layout-shift', {buffered:true})` + DOM-after-hydration + SSR curl (10 لغات) + SPA-nav.

## 1) الملفّات المعدَّلة (4 ملفّات، +68/-13)
| الملف | التغيير |
|---|---|
| `server.js` | +50 — كتلة SSR-fill (replacement 1.5) داخل `if (_isHijriDayPage)` بعد استبدال H1: حساب الميلاديّ عبر `_hijriToGregorian` + اسم اليوم (قاموس `_HD_WEEKDAYS` 10 لغات) + `_GREG_MONTHS` + لاحقة gSfx (`_HD_GSFX`) + قاموس العنوان الفرعيّ `_HD_SUBTPL` 10 لغات، ثم 4 `html.replace` تملأ العناصر الأربعة وتضيف `data-ssr-rendered="1"` |
| `js/app.js` | +23/-13 — استبدال 4 إسنادات `textContent` مباشرة في `loadHijriDayPage()` بمساعد `_hdSetGuarded(el, val)` يطبّق حارس no-swap (يستهلك `data-ssr-rendered` مرّة واحدة، وإلا يعيد الكتابة) |
| `index.html` | `app.js?v=755 → 756` (موضعان: preload + script) |
| `sw.js` | `CACHE_VERSION v415 → v416` + PRECACHE `app.js?v=756` |

## 2) السبب الجذريّ (من Audit EN-HIJRI-DATE-DAY-SECTION-CARD-CLS-AUDIT-1)
العناصر الأربعة كانت تُشحَن نصًّا `--` ثم يملؤها `loadHijriDayPage()` **بعد** hydration → الهيرو ينمو ~24px (العنوان الفرعيّ يلتفّ إلى سطرين) → البطاقات أسفله تنزاح. CLS قبل الإصلاح ≈ **0.099** (Lighthouse 0.185).

## 3) بنية قبل/بعد (SSR)
| العنصر | قبل | بعد (مثال EN، 17 ذو الحجة 1447) |
|---|---|---|
| `#hday-day-num` | `--` | `17` + `data-ssr-rendered="1"` |
| `#hday-month` | `--` | `Dhu al-Hijjah` + marker |
| `#hday-year` | `--` | `1447 AH` + marker |
| `#hday-subtitle` | `--` | `Corresponding to: Wednesday, 3 June 2026 CE – according to the Umm al-Qura calendar` + marker |

## 4) مطابقة SSR == النصّ النهائيّ للعميل (10 لغات)
✅ تمّ التحقّق عبر curl لكلّ اللغات العشر على `/{lang}/hijri-date/1447-12-17`:
- ar: `1447 هـ` · `يوافق: الأربعاء، 3 يونيو 2026 — حسب تقويم أم القرى` (لاحظ حذف « م» المطابق للعميل)
- en: `1447 AH` · `Corresponding to: Wednesday, 3 June 2026 CE – …`
- fr: `1447 H` · `Correspond à : mercredi, 3 juin 2026 EC – …`
- ur: `1447 ہجری` · `موافق: بدھ، 3 جون 2026 عیسوی – …`
- tr: `Karşılığı: Çarşamba, 3 Haziran 2026 – …` (gSfx فارغ كالعميل)
- de: `Entspricht: Mittwoch, 3 Juni 2026 n.Chr. – …`
- id: `Bertepatan dengan: Rabu, 3 Juni 2026 M – …`
- es: `Corresponde a: miércoles, 3 Junio 2026 d.C. – …`
- bn: `সমতুল্য: বুধবার, 3 জুন 2026 খ্রিস্টাব্দ – …`
- ms: `Bersamaan dengan: Rabu, 3 Jun 2026 M – …`
- لاحقة `#hday-year` السيرفر `${_hdYear} ${_hdSfx}` = العميل `${year}${hSfx}` (نتيجة متطابقة بايتيًّا).

## 5) قياس CLS + DOM-after-hydration (متصفح Preview)
| الحالة | القيمة |
|---|---|
| قبل الإصلاح (Audit) | CLS ≈ **0.099** (LH 0.185) |
| بعد الإصلاح (`/en/hijri-date/1447-12-17`) | CLS = **0.0264** |
- بعد hydration: العناصر الأربعة `data-ssr-rendered === null` (استُهلك العلَم) و `textContent` == نصّ SSR بالضبط → **DOM == SSR، صفر text-swap**.

## 6) اختبار SPA-nav (فرع else / إعادة البناء)
✅ التنقّل من `…1447-12-17` إلى `…1447-12-18` (رابط داخليّ): الهيرو يُحدَّث صحيحًا → `18` · `Dhu al-Hijjah` · `1447 AH` · `Corresponding to: Thursday, 4 June 2026 CE – …` (يوم/تاريخ ميلاديّ صحيح للتاريخ الجديد) — لا staleness.

## 7) هل تم تعديل app.js؟ ولماذا
نعم — حارس no-swap عبر `_hdSetGuarded`: أوّل hydration يستهلك `data-ssr-rendered` (يُزال) ويتخطّى إعادة الكتابة → لا shift؛ وعند تنقّل SPA لاحق (لا marker) يُعاد الإسناد طبيعيًّا → لا staleness.

## 8) هل تم تعديل CSS؟
**لا** — صفر تعديل CSS (الحلّ SSR-fill، ليس height-reservation).

## 9) Title/Meta/H1/JSON-LD/canonical/hreflang
✅ غير متأثّرة — H1 (`_hdH1Txt`) كما هو، والعنوان/الوصف عبر مسار `setSEOMeta` السابق، canonical/og:url مشتقّان من المسار، لا تغيير على JSON-LD أو الأقسام التعليميّة الأربعة.

## 10) regression
**16/17 = 200** + 1 إعادة توجيه متوقَّعة (`/prayer-times-in-mecca → /prayer-times-in-makkah` 301، canonical موجود مسبقًا). الصفحات: الرئيسية + en + prayer/qibla/moon/msbaha/azkar + month(ar/en) + year(ar/en) + day(ar/en) + today(ar/en) + zakat + search-test.

## 11) cache-busters
`app.js?v=755 → 756` (موضعان) · `CACHE_VERSION v415 → v416` · PRECACHE 756.

## 12) نطاق الـ diff
✅ 4 ملفّات فقط (`index.html` +4/-2، `js/app.js` +23/-13، `server.js` +50، `sw.js` +4/-2). الملفّات غير المتعقَّبة (`??`) كلّها مخلّفات موجات geodata سابقة — **لن تُدرَج** (سأضيف الملفّات الأربعة صراحةً عند الـ commit).

## 13) رسالة commit المقترحة
```
perf(hijri): HIJRI-DATE-DAY-SECTION-CARD-SSR-FILL-CLS-FIX-1 — SSR-fill day hero stack + subtitle to prevent layout shift
```

---

## معايير القبول
1. `#hday-day-num`/`#hday-month`/`#hday-year`/`#hday-subtitle` SSR-filled بالنصّ النهائيّ — ✅ (10 لغات)
2. لا text-swap بعد hydration (حارس + DOM==SSR) — ✅
3. `loadHijriDayPage` لا يعيد الكتابة إن SSR-filled — ✅ (`_hdSetGuarded`)
4. CLS انخفض بوضوح (0.099 → 0.0264) — ✅
5. SPA-nav يعيد البناء صحيحًا للتواريخ الأخرى — ✅ (17→18، يوم/ميلاديّ صحيح)
6. Title/Meta/H1/JSON-LD/canonical/hreflang دون تغيير — ✅
7. الـ10 لغات سليمة — ✅
8. regression — ✅ (16/17 200 + 1 إعادة توجيه canonical متوقَّعة)
9. صفر تعديل CSS — ✅

## تأكيدات
- تقرير ما قبل الدفع — لم يُنفَّذ commit/push. أوقفتُ خوادم الاختبار (Preview + node 10056). لم تُبدأ أيّ صفحة أذكار (لا يزال شرط الاعتماد البصريّ لـ `/azkar/prayer-azkar` ساريًا).

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: HIJRI-DATE-DAY-SECTION-CARD-SSR-FILL-CLS-FIX-1`
