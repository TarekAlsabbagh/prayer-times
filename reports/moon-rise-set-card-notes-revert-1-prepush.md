# تقرير ما قبل الدفع: MOON-RISE-SET-CARD-NOTES-REVERT-1

**النوع:** تنظيف — إزالة ملاحظة الشروق التوضيحيّة الحيّة من داخل بطاقة شروق القمر. **لا تغيير في الحساب.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `origin/main = HEAD = f700690`.
**الأساس:** تدقيق [MOON-RISE-SET-DAY-OWNERSHIP-AUDIT-1](moon-rise-set-day-ownership-audit-1.md) (القيم تابعة لتاريخ الصفحة المحلّيّ نفسه — السبت) + قرارك «لا ملاحظات داخل بطاقات القمر».

---

## 1) ما أُزيل (ملاحظة الشروق الحيّة من `f700690`)
- **عنصر** `#moon-rise-note` (index.html) — حُذف.
- **منطق** عرضها في `updateMoonInfo` (js/app.js) — حُذف.
- **مفتاح** `moon.moonrise_after_midnight_note` (js/i18n.js + الحزم المُقسَّمة، 10 لغات) — حُذف.
> تمّ بإعادة `index.html`/`js/app.js`/`js/i18n.js` إلى الأب `8808d65` (HOME-I18N، الذي لا يحوي الملاحظة) ثمّ إعادة توليد الحزم + رفع cache-buster.

## 2) ما أُبقي عمدًا
- **`#moon-set-note` («صباح اليوم التالي» / `moon.set_next_day_note`)** — ملاحظة الغروب **الدوريّة القائمة** من تذكرة أقدم منفصلة (`MOON-CURRENT-CYCLE-RISE-SET-FIX-1`, 2026-05-27). **خارج نطاق هذا التراجع** — لم تُمَسّ (مؤكَّد: العنصر + المفتاح باقيان). لو رغبت بإزالتها أيضًا، تذكرة منفصلة.
- **HOME-I18N-CONTENT-FLICKER-FIX-1** (`8808d65`) — كامل، بلا مساس.
- لا «ملاحظة غروب clarity» (تذكرة CLARITY-1 المُلغاة لم تُنشَر أصلًا).

## 3) النتيجة على البطاقات (مُتحقَّق متصفّحيًّا، v=780/v=203)
```
شروق القمر        غروب القمر
02:52 ص           05:07 م
```
بلا أيّ جملة توضيحية داخل البطاقة. (`#moon-rise-note` element=false، `moon.moonrise_after_midnight_note` غائب من الحزمة.)

## 4) تأكيد عدم المساس بالحساب
`MoonCalc` · `updateMoonInfo` (منطق الحساب) · `moonrise time` · `moonset time` · `timezone` · `date-normalization` — **بلا تعديل**. قيمتا `#moon-rise`/`#moon-set` بلا تغيير (02:52/05:07). أُزيلت فقط كتلة عرض ملاحظة الشروق.
- H1 · Title · Meta · canonical · hreflang · sitemap · بطاقات القمر الأساسيّة · صفحات الشهر · CSS — **بلا تغيير**.

## 5) نتائج اللغات العشر
الحزم المُقسَّمة **== js/i18n.js** لكلّ اللغات (0 مفقود/0 اختلاف)؛ `moon.moonrise_after_midnight_note` **غائب من i18n.js وكلّ الحزم**؛ `moon.set_next_day_note` (القائم) **باقٍ**. لا مفتاح خام، لا double-translation.

## 6) نتائج regression + console
`/` · `/en` · `/qibla` · `/moon-in-riyadh` · `/moon-today-in-riyadh` · `/moon-in-riyadh/2026-06-13` · `/azkar` · `/msbaha` → **200** · H1 مرئيّ=**1** · app780+i18n203 · صفحات القمر: `#moon-rise-note` **غائب**، `#moon-set-note` **باقٍ** · **0 أخطاء console** · Title/Meta سليمة.

## 7) الملفّات المعدَّلة (15) + cache-buster
`index.html` (حذف عنصر `#moon-rise-note` + `app.js?v=778→780`) · `js/app.js` (حذف كتلة منطق الملاحظة) · `js/i18n.js` (حذف المفتاح، مصدر الحقّ) · `js/i18n-core.js` + `js/i18n/{10}.js` (مُعاد توليدها بلا المفتاح) · `server.js` (`_i18nVersion 200→203`). **`css/style.css` بلا تغيير.**
> **cache-buster:** `app.js 778→780` · `_i18nVersion 200→203` — قفزت 203 (تخطّي 201/202 اللذين استخدمتهما CLARITY-1 المُلغاة غير-المنشورة، تفاديًا لأيّ تصادم cache لدى متصفّح اختباريّ؛ الإنتاج عند 200 فيجلب 203 طازجًا).

## 8) رسالة commit المقترحة
```
revert(moon): MOON-RISE-SET-CARD-NOTES-REVERT-1 — remove in-card moonrise clarity note (cards show time only)
```

---
**الخلاصة:** أُزيلت ملاحظة الشروق التوضيحيّة (`#moon-rise-note` + مفتاحها + منطقها) من بطاقة شروق القمر، فصارت البطاقات تعرض **الوقت فقط**؛ ملاحظة الغروب الدوريّة القائمة (`#moon-set-note`) وHOME-I18N **بلا مساس**؛ **الحساب/الأوقات/SEO بلا تغيير**. مُتحقَّق متصفّحيًّا (الملاحظة غائبة، 0 console) + regression. 15 ملفًّا، معزولة.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: MOON-RISE-SET-CARD-NOTES-REVERT-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
