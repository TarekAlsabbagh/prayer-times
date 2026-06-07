# تقرير تدقيق: MACAU-COUNTRY-CITY-SAME-SLUG-ROUTING-AUDIT-1

**النوع:** تدقيق فقط (Audit). **لا تعديل · لا commit · لا push.**
**الحالة المفحوصة:** شجرة العمل الحاليّة = **بعد** `COUNTRY-PRAYER-PAGE-COUNTRY-SLUG-MAPPING-FIX-1` (غير مدفوعة بعد — معلَّقة بانتظار اعتمادك). preview يشغّل هذه الحالة. لذا يفحص هذا التقرير سلوك ماكاو **بعد** إصلاح الـmapping (حيث رابط الدولة صار `/prayer-times-in-macau`).
**أدوات التحقّق:** قراءة كود + `node` على curated + preview DOM حيّ.

---

## 1) وصف المشكلة
ماكاو إقليم اسمه = اسم مدينته الرئيسة، ولها **مدينة curated واحدة** (`slug=macau`، `cc=mo`). بعد إصلاح الـmapping:
- رابط الدولة في الـbreadcrumb على صفحة مدينة ماكاو صار يشير إلى **`/prayer-times-in-macau`** — وهو **نفس صفحة المدينة الحاليّة** (دائريّ، «النقر لا يغيّر شيئًا»).
- قسم «مواقيت الصلاة في مدن الدولة» على صفحة المدينة **مخفيّ/بلا نتائج**، لأنّ المدينة الوحيدة (ماكاو) تُستبعَد بوصفها «المدينة الحاليّة».

## 2) خطوات إعادة الإنتاج
1. افتح `/prayer-times-in-macau` (صفحة مدينة، `currentCountryCode=mo`).
2. الـbreadcrumb `#bc-country` href = `/prayer-times-in-macau` ⇒ نفس الصفحة (`breadcrumbCircular=true`).
3. قسم `#country-cities-section`: `display:none` + class `u-hidden`، الشبكة 0 بطاقات، العنوان الافتراضيّ العامّ «مواقيت الصلاة في مدن الدولة».

## 3) هل `/prayer-times-in-macau` حاليًا مدينة أم دولة؟
**مدينة.** يُخدَم `index.html` (SPA)، `currentCountryCode=mo`. `_countryFromSlug('macau')='__'` (لأنّ `mo` ليست في `COUNTRY_NAMES_EN` للخادم — أُبقيت «مدينة فقط» عمدًا في إصلاح الـmapping لتجنّب حجب صفحة المدينة). **لا dual-serving**: المسار يخدم نوعًا واحدًا (مدينة) فقط.

## 4) هل slug `macau` موجود كمدينة؟
✅ نعم — `{ slug:"macau", type:"city", cc:"mo" }` في curated (مدخل واحد فقط لـmo).

## 5) هل `countrySlug = macau` موجود؟
⚠️ **كـ override للرابط فقط، لا كصفحة دولة مسجّلة.** `COUNTRY_SLUG_OVERRIDES = { mo:'macau', hk:'hong-kong' }` يجعل `makeCountrySlug('mo')='macau'`، لكنّ `mo` **ليست** في خريطة الدول للخادم ⇒ لا تُعرَّف `macau` كدولة ⇒ الرابط يَحلّ إلى **صفحة المدينة**. فالـslug «macau» واحد، يخدم المدينة، ويُعاد استخدامه كهدف رابط «الدولة».

## 6) رابط «مدن دولة ماكاو» الفعليّ
`#bc-country` · class `bc-link` · text «مواقيت الصلاة في ماكاو» · **href = `/prayer-times-in-macau`** (مؤكَّد DOM). لا روابط `/prayer-times-in-mo` خام (أصلحها MAPPING-FIX-1).

## 7) لماذا النقر «لا يأخذ لمكان واضح»
لأنّ `href` = `/prayer-times-in-macau` = **عنوان الصفحة الحاليّة نفسها** (`breadcrumbCircular=true`). النقر يعيد تحميل صفحة مدينة ماكاو ⇒ «يبدو وكأنّه لا يغيّر شيئًا». لا توجد صفحة دولة منفصلة لماكاو. [التصنيف B]

## 8) نتيجة `/api/cities?cc=mo`
`200` · **مدينة واحدة** = `macau` (نفسها). الـAPI سليم — المشكلة ليست فيه.

## 9) لماذا قسم مدن ماكاو فارغ/مخفيّ
المسار: `updateCountryCitiesSection()` → `fetch /api/cities?cc=mo` → `[macau]` → `renderCountryCities([macau],'mo')`:
- **السطر 12604** يستبعد المدينة الحاليّة: `others = cities.filter(c => !(|c.lat-currentLat|<0.5 && |c.lng-currentLng|<0.5))`.
- ماكاو هي المدينة الوحيدة، وإحداثيّاتها = إحداثيّات الصفحة الحاليّة ⇒ تُستبعَد ⇒ `others=[]`.
- **السطر 12608**: `if (others.length===0){ section.style.display='none'; return; }` ⇒ القسم **يُخفى** (display:none + u-hidden)، الشبكة 0، والعنوان يبقى الافتراضيّ العامّ (لأنّ الدالّة رجعت قبل ضبط العنوان المحلّي بالسطر 12613).
- **لا spinner** — إخفاء نظيف (`anySpinnerInSection=false`)، لا حالة عالقة.

## 10) هل يُحذف current city من القائمة؟
✅ **نعم — هذا جوهر المشكلة.** `renderCountryCities` يستبعد المدينة الحاليّة دائمًا (سلوك صحيح للدول متعدّدة المدن: «مدن أخرى في نفس الدولة»). لكن في إقليم بمدينة واحدة = الصفحة الحاليّة ⇒ القائمة تصير صفرًا ⇒ القسم يختفي. [التصنيف C]

## 11) هل المشكلة تخص Macau فقط أم أي إقليم single-city؟
**عامّة — 21 إقليمًا/دولة بمدينة curated واحدة** تشترك في «إخفاء قسم مدن الدولة» على صفحة مدينتها:
`mo(macau) · sg(singapore) · nz(auckland) · kp(pyongyang) · bo(la-paz) · ec(quito) · uy(montevideo) · ci(abidjan) · cm(yaounde) · cd(kinshasa) · gn(conakry) · lr(monrovia) · ml(bamako) · ne(niamey) · sl(freetown) · sn(dakar) · td(ndjamena) · ug(kampala) · bf(ouagadougou) · ao(luanda) · dj(djibouti-city)`.
- **تعارض «slug المدينة = slug الدولة» تحديدًا**: فقط **mo (macau)** و**sg (singapore)**.
- لكنّ **sg** في خريطة الدول ⇒ `/prayer-times-in-singapore` يُخدَم كـ**صفحة دولة** (تعرض بطاقة سنغافورة الوحيدة، بلا فلترة current) ⇒ سلوك مختلف (لا إخفاء، لكن «صفحة الدولة» = بطاقة واحدة تشير لنفسها)؛ وصفحة مدينة سنغافورة محجوبة بصفحة الدولة.
- **ماكاو فريدة**: «مدينة فقط» + slug مشترك + مدينة واحدة + breadcrumb دائريّ.
- باقي الـ19 (auckland إلخ): slug الدولة ≠ slug المدينة ⇒ `/prayer-times-in-new-zealand` صفحة دولة ببطاقة auckland (تعمل)، لكنّ صفحة مدينة auckland نفسها تُخفي قسم «مدن نيوزيلندا» (others=0).

## 12) التصنيف A/B/C/D/E/F
| الرمز | الوصف | الحكم |
|---|---|---|
| **A** | تعارض slug دولة/مدينة | ⚠️ جزئيّ — `macau` slug واحد يخدم المدينة ويُعاد استخدامه كهدف رابط الدولة (لا dual-serving فعليّ). |
| **B** | الدولة والمدينة يتشاركان URL | ✅ **نعم** — رابط الدولة = `/prayer-times-in-macau` = صفحة المدينة (دائريّ). |
| **C** | استبعاد current city من قائمة المدينة الوحيدة | ✅ **نعم (مؤكَّد)** — `renderCountryCities` يفلتر الحاليّة ⇒ others=0. |
| **D** | UX إقليم single-city مفقود | ✅ **نعم (مؤكَّد)** — إخفاء صامت بلا رسالة؛ 21 إقليمًا متأثّرًا. |
| **E** | mapping الدولة أحدث غموضًا | ⚠️ جزئيّ — override `mo→macau` جعل رابط الدولة دائريًّا (تصميم «مدينة فقط» المقصود، لكنّه يُنتج breadcrumb دائريّ). |
| **F** | استراتيجية canonical غير محدّدة | ⚠️ غالبًا N/A — مسار واحد فقط يُخدَم (مدينة)، لا dual-serving ⇒ canonical غير ملتبس (مدينة). «الدولة» بلا صفحة canonical. |
**الجوهر:** **C + D** (القسم الفارغ/المخفيّ) + **B** (breadcrumb دائريّ). A/E أثرٌ جانبيّ لطبيعة «slug مشترك + مدينة واحدة»؛ F شبه غير منطبق.

## 13) الاستراتيجية الموصى بها
**Option 1 + Option 4 (هجين)** — الأقلّ خطرًا والمتوافق مع «ممنوع تغيير slugs/canonical/curated/mapping»:
1. إبقاء `/prayer-times-in-macau` **صفحة مدينة** (بلا تغيير slug/canonical/بيانات).
2. **معالجة `others.length===0`** في `renderCountryCities`: بدل الإخفاء الصامت، إمّا (أ) رسالة مترجَمة «{الدولة} تضم مدينة رئيسة واحدة في بياناتنا الحاليّة»، أو (ب) إبقاء الإخفاء لكن **تحييد رابط الدولة الدائريّ** في الـbreadcrumb (إزالة href حين يساوي مسار الصفحة الحاليّة).
> الأنسب: (أ) رسالة empty-state واضحة + (ب) تحييد breadcrumb الدائريّ. هذا يغطّي الـ21 إقليمًا single-city دفعةً واحدة، بلا أيّ مساس بالبيانات/الـslugs/الـmapping. **القرار النهائيّ لك في تذكرة الإصلاح.**
- **مرفوض**: Option 2/3 (إنشاء slug دولة منفصل أو إعادة تسمية slug المدينة) — يغيّران slug/canonical/sitemap (ممنوع الآن وخطِر على SEO).

## 14) الإصلاح المقترح (بدون تنفيذ)
- `renderCountryCities`: عند `others.length===0` ⇒ إظهار عنصر empty-state مترجَم (لا إخفاء صامت، لا spinner). اختياريًّا عرض بطاقة المدينة الحاليّة نفسها.
- breadcrumb: حارس «إن كان `countrySlug` يساوي slug المدينة الحاليّة (أو href = مسار الصفحة) ⇒ أزِل href / حيّد الرابط» — يمنع النقر الدائريّ.
- مفتاح i18n جديد للرسالة × 10 لغات.
- **بلا** تغيير curated/slugs/canonical/hreflang/sitemap/country mapping.

## 15) اسم تذكرة الإصلاح المقترحة
**`COUNTRY-PRAYER-PAGE-SINGLE-CITY-TERRITORY-UX-FIX-1`**

## 16) الملفّات المتوقَّعة للإصلاح
- `js/app.js` — `renderCountryCities` (≈12596، معالجة others=0) + حارس breadcrumb الدائريّ (≈8683).
- `js/i18n.js` — مفتاح رسالة empty-state × 10 لغات.
- `index.html` — بمب cache-buster لـ`app.js` (+ربّما i18n).
- (لا curated / لا prayer-times-cities.html / لا server.js إلّا إن لزم تنسيق.)

## 17) تأكيد: تدقيق فقط
✅ لم يُعدَّل أيّ ملفّ في هذه التذكرة. (التغييرات المعلَّقة في الشجرة هي تذكرة MAPPING-FIX-1 السابقة، غير المدفوعة — منفصلة عن هذا التدقيق.) لم تُلمَس curated/slugs/canonical/hreflang/sitemap/mapping/SEO/أذكار.

## 18) تأكيد: لا commit / لا push
✅ لم يُنفَّذ أيّ commit ولا push. التقرير وثيقة فقط.

---
**الخلاصة:** بعد إصلاح الـmapping، صفحة مدينة ماكاو سليمة وظيفيًّا (مواقيت تُحسَب)، لكن: (1) رابط «الدولة» في الـbreadcrumb دائريّ يعيد لنفس الصفحة [B]؛ (2) قسم «مدن الدولة» يُخفى لأنّ المدينة الوحيدة = الحاليّة فتُفلتَر [C]؛ (3) لا UX لإقليم single-city (إخفاء صامت بلا رسالة) — يشمل 21 إقليمًا [D]. التصنيف **B + C + D** (وA/E جزئيّان، F شبه غير منطبق). التوصية: **Option 1+4** عبر تذكرة **COUNTRY-PRAYER-PAGE-SINGLE-CITY-TERRITORY-UX-FIX-1** — رسالة empty-state مترجَمة + تحييد breadcrumb الدائريّ، بلا أيّ تغيير بيانات/slug/canonical.

**النتيجة المقترحة:** ✅ تدقيق مكتمل — للإغلاق أرسِل: `اعتماد وإغلاق تقرير: MACAU-COUNTRY-CITY-SAME-SLUG-ROUTING-AUDIT-1`

*(ملاحظة: تذكرة MAPPING-FIX-1 ما زالت معلَّقة بانتظار `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-COUNTRY-SLUG-MAPPING-FIX-1`. ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
