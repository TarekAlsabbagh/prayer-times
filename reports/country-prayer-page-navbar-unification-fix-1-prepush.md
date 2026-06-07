# تقرير ما قبل الدفع: COUNTRY-PRAYER-PAGE-NAVBAR-UNIFICATION-FIX-1

**النوع:** المرحلة 2 من جذر صفحة الدولة (توحيد navbar فقط). **النطاق محصور:** روابط الأدوات + اللغة + i18n. **لا** مصدر المدن / search / SEO / H1 / SSR-cities.
**الصفحة:** `/prayer-times-in-{country}` و`/[lang]/prayer-times-in-{country}` (ملفّ `prayer-times-cities.html`).
**الحالة:** لم يُدفع — بانتظار اعتمادك.

## 1) حالة navbar قبل الإصلاح
بنية الـsidebar نفسها (نفس classes `.sidebar/.sidebar-nav/.top-header` + نفس `css/style.css` المشترك = **متطابقة بصريًّا أصلًا**)، لكنّ **الروابط legacy**: `/?page=qibla`, `/?page=duas`, `/?page=tasbih`, `/?page=hijri-today`, `/?page=hijri-calendar`, `/?page=date-converter` + «مواقيت الصلاة» `href="#"`. تمريرة lang-prefix في الخادم تُحوّل `/?page=X` إلى **`/en` أو `/bn`** (الرئيسيّة) على غير العربيّة ⇒ 6 روابط أدوات مكسورة. وi18n عبر `js/i18n.js?v=132` (كاش قديم).

## 2) أين كان navbar القديم
داخل `prayer-times-cities.html` (`<nav class="sidebar-nav">`، السطور ~249-281) — ملفّ legacy منفصل لكنّه يحمّل `css/style.css` المشترك.

## 3) كيف تمّ التوحيد
استبدال الروابط legacy بـ**روابط نظيفة قانونيّة** مطابقة لباقي الموقع: `/qibla`, `/azkar`, `/msbaha`, `/today-hijri-date`, `/hijri-calendar`, `/date-converter` + «مواقيت الصلاة» `href="/"` (مع إبقاء `onclick=goToPrayerTimes`). تمريرة lang-prefix في الخادم تُضيف البادئة الصحيحة تلقائيًّا (`/en/qibla`, `/bn/azkar`…). البنية/CSS لم تتغيّر (متطابقة أصلًا). تحديث label `nav.duas` الافتراضيّ → «الأذكار». بمب كاش i18n `132→198`.

## 4) روابط navbar قبل/بعد (SSR مؤكَّد)
| الأداة | قبل (ar) | بعد (ar) | بعد (en) | بعد (bn) | بعد (ur) |
|---|---|---|---|---|---|
| مواقيت الصلاة | `#` | `/` | `/en` | `/bn` | `/ur` |
| القبلة | `/?page=qibla` | `/qibla` | `/en/qibla` | `/bn/qibla` | `/ur/qibla` |
| القمر | `/moon-today` | `/moon-today` | `/en/moon-today` | `/bn/moon-today` | `/ur/moon-today` |
| الزكاة | `/zakat-calculator` | `/zakat-calculator` | `/en/zakat-calculator` | … | … |
| الأذكار | `/?page=duas` | `/azkar` | `/en/azkar` | `/bn/azkar` | `/ur/azkar` |
| المسبحة | `/?page=tasbih` | `/msbaha` | `/en/msbaha` | `/bn/msbaha` | `/ur/msbaha` |
| التاريخ الهجري | `/?page=hijri-today` | `/today-hijri-date` | `/en/today-hijri-date` | … | … |
| التقويم الهجري | `/?page=hijri-calendar` | `/hijri-calendar` | … | … | … |
| تحويل التاريخ | `/?page=date-converter` | `/date-converter` | … | … | … |

## 5) حالة اللغة في الروابط
✅ كلّ روابط navbar تحترم لغة الصفحة: `/en/…` على en، `/bn/…` على bn، `/ur/…` على ur (مؤكَّد SSR + DOM بعد hydration: 9/9 مبدوءة بـ`/bn/` على bn). **لم تعد تنهار إلى `/en`/`/bn` الرئيسيّة.** كلّ الوجهات تَحلّ HTTP 200 (`/en/qibla`, `/bn/azkar`, `/ur/msbaha`…).

## 6) حالة mobile navbar
✅ سليم — عند 375px الـsidebar off-canvas (`translateX(-280px)`)، وزرّ `.menu-toggle` (همبرغر) يفتحه (`translateX(0)`). نفس نمط الموقع (CSS مشترك). الروابط داخل الدرج صحيحة + مبدوءة باللغة.

## 7) تأكيد عدم تغيير مصدر المدن
✅ لم يُمَسّ. الكروت ما زالت 199 (IN) بأسماء بنغاليّة (دليل حيّ بعد الإصلاح: «দিল্লি» + 199). `_curatedCitiesForCc`/`handleCitiesApi`/render المدن بلا تغيير (مُلتزَمة في `4300d73`).

## 8) تأكيد عدم تغيير search/SEO/H1
✅ search box (hero + header) بلا تغيير · SEO/Title/Meta/canonical/hreflang بلا تغيير · H1 لم يُلمَس (يبقى لتذكرة SEO) · SSR-cities مؤجَّل.

## 9) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `prayer-times-cities.html` | روابط `.sidebar-nav` legacy → نظيفة قانونيّة (9 روابط) + `nav.duas` label → «الأذكار» + بمب كاش i18n `132→198`. |
> `git diff --stat`: **+13 / −9** سطرًا (ملفّ واحد). `server.js` غير ممسوس في هذه التذكرة. LF محفوظ.

## 10) نتائج regression
✅ HTTP **200** لـ: صفحات الدولة (in/en-in/bn-bd/ur-pk/id-id/ms-my) + وجهات navbar (`/qibla`,`/azkar`,`/msbaha`,`/today-hijri-date`,`/hijri-calendar`,`/date-converter`) + `/`, `/prayer-times-in-riyadh`, `/next-prayer-in-riyadh`. ✅ المدن تُرسَم (199 bn) · navbar 9/9 مبدوء `/bn/` · mobile drawer يعمل · **0 أخطاء console**.

## 11) cache-busters
- `js/i18n.js?v=132 → 198` داخل `prayer-times-cities.html` (أصل ثابت versioned، cache-first ⇒ URL جديد = جلب طازج).
- **لا حاجة لبَمب sw.js**: الـSW **network-first لـHTML** (السطر 1) ⇒ الـnavbar الجديد يصل للعائدين؛ صفحة الدولة تُخدَم no-cache server-side.
- (الـi18n يبقى monolithic — بنية السكربتات inline تتطلّب i18n متزامنًا؛ ترحيل per-lang الكامل يحتاج إعادة هيكلة، خارج نطاق navbar.)

## 12) رسالة commit المقترحة
```
fix(country): COUNTRY-PRAYER-PAGE-NAVBAR-UNIFICATION-FIX-1 — unify country prayer page navigation
```

## ما لم يُمَسّ
✅ مصدر بيانات المدن · أعداد/أسماء/slugs المدن · search box · SEO/H1/canonical/hreflang/sitemap · بنية/CSS الصفحة (مشتركة) · حساب المواقيت · صفحات الأذكار · بيانات curated.

---
**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-NAVBAR-UNIFICATION-FIX-1`

## التالي بعد الإغلاق
`COUNTRY-PRAYER-PAGE-CITY-SEARCH-RESTORE-FIX-1` ← `COUNTRY-PRAYER-PAGE-SEO-CONTENT-FIX-1` ← `COUNTRY-PRAYER-PAGE-SSR-CITIES-FIX-1`.

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
