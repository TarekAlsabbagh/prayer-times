# تقرير ما قبل الدفع: SITE-SEARCH-LEGACY-UNUSED-CLEANUP-1

**النوع:** حذف dead code من `js/app.js` — `_stOnPick_legacyUnused` (المسمّى) + `_stRouteFor` (المُيَتَّم بعده) **[الخيار ب المعتمَد]**.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** ملفّ واحد — `js/app.js` (**+6/−74**). **بلا** `server.js`/`site-search.js`/APIs/curated/db-cities/noindex/الأذكار/المسبحة/حساب الصلاة. **بلا** تغيير سلوك. **بلا** رفع cache-buster (مبرَّر §5).
**القاعدة:** `origin/main = HEAD = bb2844b`.

---

## 1) أين كانت الدالّتان
`js/app.js`:
- **`_stOnPick_legacyUnused`** — كانت الأسطر 26873–26940 (68 سطرًا)، بعد الدالّة الحيّة `_stOnPick`؛ الجسم القديم لمعالج النقر (POST `/api/place-selected` + بذور sessionStorage + `window.location.href`)، محفوظ «كأثر مرجعيّ» بعد توحيد البحث في `…PARITY-FIX-1`.
- **`_stRouteFor`** — كان سطر 26813 (غلاف سطر واحد `return window.SiteSearch.routeFor(...)`). مستدعاه الوحيد كان داخل `_stOnPick_legacyUnused` (سطر 26939) → أصبح 0-مُستدعٍ فور حذفها.

## 2) إثبات أنّهما dead code بالكامل
- **`_stOnPick_legacyUnused`**: بحث كامل المشروع = **0 مواضع استدعاء** (الوجود الوحيد قبل الحذف = تعريفها + إشارات في تقارير توثيقيّة). لا `window.`، لا `onclick`، لا callback.
- **`_stRouteFor`**: قبل الحذف = تعريف (26813) + استدعاء واحد (26939، داخل الدالّة الميتة) ⟶ بعد حذف الميتة = **0-مُستدعٍ**. تأكَّد بـ`grep`.
- المسار الحيّ لا يعتمد على أيّهما: `_stOnPick` (الحيّة) ⟶ `window.SiteSearch.onPick`؛ والتوجيه يجري داخل `SiteSearch`. `_stIsPrayerTimesReady` (غلاف حيّ، يُستخدم في `_stRenderResults`) **بقي**.
- **على الملفّ المخدوم:** بناء Render (والمعاينة المحلّيّة) يُصغّر `app.js` ويُزيل الدالّتين غير المرجوعتين عبر **dead-code elimination** أصلًا.

## 3) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `js/app.js` | حذف `_stOnPick_legacyUnused` (68 سطرًا) + `_stRouteFor` (سطر) + تشليح/تحديث تعليقين متقادمين. صافي **+6/−74**. |
> **لم يُمَسّ:** `server.js` · `js/site-search.js` · `/api/search-place` · `/api/place-selected` · search pipeline · curated · db/cities · noindex guard · slugs · canonical/hreflang · الأذكار · المسبحة · حساب الصلاة · index.html (لا cache-buster).
> `grep _stOnPick_legacyUnused` = **0** · `grep _stRouteFor` = **0** · `node --check js/app.js` ✓.

## 4) نتائج البحث قبل/بعد (متصفّح حيّ على المعاينة)
| الاختبار | النتيجة |
|---|---|
| **بحث الرئيسية** (`riyadh`) | dropdown «الرياض · المملكة العربية السعودية» (بطاقة `search-test-result`) |
| **نقر النتيجة** | **انتقل إلى `/prayer-times-in-riyadh`** (H1 «مواقيت الصلاة في الرياض اليوم») — مسار `_stOnPick→SiteSearch.onPick→navigate` حيّ |
| **بحث curated** (`chefchaouen`) | نتيجة curated واحدة (شفشاون) |
| `SiteSearch` API | object كامل: `onPick/routeFor/fetchResults/renderSearchTestDropdown/isReady` |
| `routeFor('prayer-times-hub','riyadh')` | `/prayer-times-in-riyadh` ✓ (التوجيه الحيّ داخل SiteSearch، بلا حاجة للغلاف المحذوف) |
| `fetchResults('riyadh')` | `riyadh/curated` ✓ |
| **بحث صفحة الدولة** | مستقلّ بنيويًّا — `/prayer-times-in-morocco` **لا يحمّل app.js** (يحمّل `site-search.js` مباشرةً) → غير متأثّر إطلاقًا |
> لا أخطاء console. الصفحة المكتشفة `chefchaouen-ma` تبقى noindex (لم يُمَسّ منطقها).

## 5) تأكيد عدم تغيُّر السلوك (+ لماذا لا cache-buster)
- **الملفّ المخدوم متطابق بايتيًّا:** المصدر 1.68MB؛ المخدوم **898,561 بايت مُصغَّر** (نفس حجم إنتاج Render) و**لا يحوي** أيًّا من الرمزين (DCE). قِسْتُه **898,561 قبل وبعد** حذف `_stRouteFor` — **متطابق تمامًا** ⟹ حذفهما من المصدر لا يُغيّر بايتًا واحدًا يصل المستخدم.
- لذلك **لم أرفع `app.js?v=774`** (بموافقتك): رفع النسخة كان سيُجبر إعادة تحميل 898KB متطابقة بلا فائدة.
- regression: `/` · `/prayer-times-in-morocco` · `/prayer-times-in-chefchaouen` · `/prayer-times-in-riyadh` · `/qibla` · `/azkar` · `/msbaha` → **كلّها 200 · H1=1**.

## 6) الخيار (ب) المعتمَد
حُذف **كلا** الرمزين في هذه التذكرة: `_stOnPick_legacyUnused` (المسمّى) + `_stRouteFor` (المُيَتَّم بعده مباشرةً، مستدعاه الوحيد كان داخل الميتة). يُكمِل تنظيف نفس المسار legacy بلا توسيع خطير. لم يُحذف شيء آخر (`_stIsPrayerTimesReady` بقي — حيّ).

## 7) رسالة commit المقترحة
```
chore(search): SITE-SEARCH-LEGACY-UNUSED-CLEANUP-1 — remove unused legacy search handlers
```

---
**الخلاصة:** حذف dead code محض من مصدر `js/app.js` — `_stOnPick_legacyUnused` (68 سطرًا) + غلافه المُيَتَّم `_stRouteFor` — لا استدعاء لأيّهما، والإنتاج المُصغَّر لا يشحنهما أصلًا (البايتات المخدومة متطابقة 898,561). البحث (رئيسيّة + curated + نقر→تنقّل) يعمل كما هو، صفحة الدولة غير متأثّرة بنيويًّا، regression السبع صفحات PASS، بلا cache-buster.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: SITE-SEARCH-LEGACY-UNUSED-CLEANUP-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
