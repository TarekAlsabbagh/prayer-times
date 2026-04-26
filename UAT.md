# UAT — User Acceptance Testing Log

> **حالة الموقع:** جاهز للاختبار اليدويّ. لا فهرسة على Google Search Console قبل اعتماد النسخة النهائيّة.

## بيئة الاختبار

- **محلّيًّا:** `http://localhost:3000` (السيرفر التجريبيّ)
- **Staging/Render:** يُحدَّث عند توفّر الرابط
- **اختبارات أوتوماتيكيّة قبل النشر:** `node scripts/predeploy-check.mjs` (يجب 26/26)

## كيف نُسجّل الملاحظات

لكلّ ملاحظة، سجّل:
1. **القسم** (تصميم / بحث / محتوى / سرعة / موبايل / نصوص / ترجمة / صفحات مدن / قبلة / قمر / عدادات)
2. **الجهاز** (ديسكتوب / موبايل / كلاهما)
3. **اللغة** (ar / en / fr / tr / ur / de / id / es / bn / ms)
4. **الرابط** (إن أمكن)
5. **الوصف** (ما الذي رأيته vs ما الذي توقّعته)
6. **الأولويّة** (Blocker / High / Medium / Low / Polish)

## قائمة فحص مبدئيّة (UAT Checklist)

### 1. التصميم العامّ
- [ ] Header/Logo/Navigation
- [ ] الألوان والـ contrast (Light + Dark mode)
- [ ] التيبوغرافي (الخطوط، الأحجام، التباعد)
- [ ] Footer + الروابط القانونيّة

### 2. تجربة البحث
- [ ] صندوق البحث في الـ Hero
- [ ] الاقتراحات الذكيّة (عربي + إنجليزي)
- [ ] Aliases (Makkah/Mecca, Madinah/Medina, Bombay/Mumbai)
- [ ] المحافظات (المذنب، القويعية، الجيزة، نينوى، حضرموت…)
- [ ] العواصم العالميّة غير المحلّيّة (Nouakchott, Apia, Funafuti, Tarawa)
- [ ] زرّ "البحث على النت" (يظهر عند 0 نتائج)
- [ ] التنقّل عند النقر (slug صحيح)

### 3. ترتيب المحتوى
- [ ] أوّل ما يراه المستخدم في الـ above-fold
- [ ] ترتيب الأقسام في الصفحة الرئيسيّة
- [ ] ترتيب الأقسام في صفحة المدينة

### 4. السرعة (Performance)
- [ ] LCP / FCP في الديسكتوب
- [ ] LCP / FCP في الموبايل (3G/4G)
- [ ] حجم الصفحة + عدد الـ requests
- [ ] Lazy loading للصور والـ widgets

### 5. الموبايل
- [ ] Responsive layout (320px → 768px → 1024px+)
- [ ] Touch targets (الأزرار/الروابط)
- [ ] Sticky elements (header/CTA)
- [ ] Forms (search input + keyboard)
- [ ] Hamburger menu / drawer
- [ ] دارك مود

### 6. النصوص (Copywriting)
- [ ] H1 + Title + Description واضحة لكلّ صفحة
- [ ] Intro paragraph غير مكرّرة بين المدن
- [ ] FAQ الإجابات منطقيّة وكاملة
- [ ] Error messages مفهومة

### 7. الترجمة (10 لغات)
- [ ] ar (RTL) — الافتراضيّة
- [ ] en — صحيحة + قواعد سليمة
- [ ] fr — diacritics صحيحة (Hôtel, Mosquée…)
- [ ] tr — حروف خاصّة (İ, ı, ğ, ş, ö, ü, ç)
- [ ] ur (RTL) — قواعد + خط Nastaliq
- [ ] de — Umlauts (ä, ö, ü, ß)
- [ ] id — صحيحة
- [ ] es — diacritics + ñ
- [ ] bn — خطّ Bengali
- [ ] ms — صحيحة

### 8. صفحات المدن `/prayer-times-in-{slug}`
- [ ] أوقات الصلاة الخمس + الشروق
- [ ] التاريخ الميلاديّ والهجريّ
- [ ] القبلة (إذا ظاهرة في الصفحة)
- [ ] Prayer schedule (أسبوعيّ)
- [ ] خريطة (إن وُجدت)
- [ ] Breadcrumb
- [ ] Related links (qibla/moon/time-left/next-prayer) — تظهر canonical
- [ ] Mini Islamic Tools

### 9. صفحات القبلة `/qibla-in-{slug}`
- [ ] Compass widget يعمل
- [ ] الإحداثيّات صحيحة
- [ ] الزاوية + المسافة من الكعبة
- [ ] Permission prompt للـ orientation API
- [ ] دعم الموبايل (gyroscope)

### 10. صفحات القمر
- [ ] `/moon-today` (الصفحة العامّة)
- [ ] `/moon-today-in-{slug}` (مدينة)
- [ ] `/moon-in-{slug}/{date}` (تاريخ محدّد)
- [ ] أطوار القمر + النسبة
- [ ] الجدول 14-day
- [ ] التقويم الهجريّ المرتبط

### 11. العدّادات (Countdowns)
- [ ] `/ramadan-countdown`
- [ ] `/eid-al-fitr-countdown`
- [ ] `/eid-al-adha-countdown`
- [ ] `/hijri-new-year-countdown`
- [ ] الأرقام تتحدّث live
- [ ] العدّ بالصيغة العربيّة + الإنجليزيّة
- [ ] أيقونة + لون مخصّصان لكلّ countdown

### 12. صفحات مساندة
- [ ] `/today-hijri-date`
- [ ] `/hijri-date/YYYY-MM-DD`
- [ ] `/hijri-calendar/YYYY-MM`
- [ ] `/dateconverter`
- [ ] `/msbaha`
- [ ] `/about-us`, `/privacy`, `/terms`, `/contact`

---

## الملاحظات (UAT Findings)

> **استخدم هذا القسم لتسجيل ملاحظاتك. صيغة كلّ بند:**
>
> ```
> ### [N] — العنوان
> - **القسم:** …
> - **الجهاز/اللغة:** …
> - **الرابط:** …
> - **الوصف:** …
> - **التوقّع:** …
> - **الأولويّة:** …
> - **الحالة:** [Open | Fixing | Fixed | Wontfix | Verified]
> ```

<!-- ابدأ تسجيل الملاحظات هنا -->

---

## سجلّ الإصلاحات بعد UAT

| # | الملاحظة | الإصلاح | predeploy-check بعد |
|---|---|---|---|
|   |          |         |                      |

---

## معايير القبول (Acceptance Criteria)

قبل الانتقال إلى Phase K (Google Search Console):
- [ ] جميع الملاحظات بأولويّة Blocker / High → Fixed
- [ ] الملاحظات بأولويّة Medium / Low موثّقة (للمعالجة لاحقًا)
- [ ] `node scripts/predeploy-check.mjs` يُعطي 26/26 على Render
- [ ] اختبار يدويّ على ديسكتوب + موبايل + جهاز iOS/Android حقيقيّين
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- [ ] لا أخطاء في console بأيّ صفحة من العشرين الأساسيّة
- [ ] **اعتماد بصريّ نهائيّ من المستخدم**
