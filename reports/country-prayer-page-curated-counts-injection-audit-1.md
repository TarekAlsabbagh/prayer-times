# تقرير تدقيق: COUNTRY-PRAYER-PAGE-CURATED-COUNTS-INJECTION-AUDIT-1

**النوع:** تدقيق فقط (Audit). **لا تعديل · لا commit · لا push.**
**الحالة المفحوصة:** شجرة العمل الحاليّة = بعد PREHYDRATED-CITIES-DATA-FIX-1 (حقن `#country-cities-data`، غير مدفوع بعد — preview محليّ يشغّله).
**أداة التحقّق:** `node` على `curated-places.json` (مع نسخ طبق الأصل من `_isPrayerTimesReady`) + `/api/cities` + HTML الخام للصفحة + DOM حيّ.

---

## 1) وصف المشكلة
صفحة `/prayer-times-in-morocco` تعرض **«22 منطقة / مدينة»**. المطلوب التأكّد: هل 22 = العدد الفعليّ في curated، أم أنّ الحقن/الواجهة يفقد مدنًا؟

## 2) نتيجة المغرب: هل 22 مطابق؟
**✅ مطابق 100%.** المغرب يحوي **22 مدينة بالضبط** في curated، وكلّها تظهر. لا فقد في أيّ مرحلة. **التصنيف: G — البيانات فعلًا 22 مدينة** (لا خلل تقنيّ).

## 3–7) سلسلة المغرب الكاملة (curated → helper → injected → DOM → label)
| المقياس | القيمة | المصدر |
|---|---|---|
| **curatedCount** (raw JSON، `countryCode='ma'`) | **22** | `curated-places.json` |
| **helperCount** (`_curatedCitiesForCc('ma')` = `/api/cities?cc=ma`) | **22** | الخادم |
| **injectedCount** (`#country-cities-data` في `/prayer-times-in-morocco` و`/en/…`) | **22** | HTML خام |
| **domCount** (بطاقات بعد render) | **22** | DOM حيّ |
| **labelCount** (النصّ الظاهر) | **22** («22 منطقة / مدينة») | DOM حيّ |
> `apiCitiesCalls=0` (يُرسَم من المحقون). slugs الـ22: casablanca · rabat · marrakesh · fes · tangier · agadir · meknes · tetouan · oujda · kenitra · taza · settat · sale · safi · guelmim · el-jadida · beni-mellal · al-hoceima · tan-tan · ouarzazate · khouribga · errachidia. **0 مدخلات MA تفشل `_isPrayerTimesReady`.**

## 8) جدول الدول المرجعيّة (raw == ready == helper == injected)
| الدولة | cc | countrySlug | curated(raw) | ready/helper | injected | domCount(صفحة1) | label | match? |
|---|---|---|---|---|---|---|---|---|
| Morocco | ma | morocco | 22 | 22 | 22 | 22 | 22 | ✅ |
| Saudi Arabia | sa | saudi-arabia | 183 | 183 | 183 | 26* | 183 | ✅ |
| India | in | india | 199 | 199 | 199 | 26* | 199 | ✅ |
| Indonesia | id | indonesia | 82 | 82 | 82 | 26* | 82 | ✅ |
| Pakistan | pk | pakistan | 148 | 148 | 148 | 26* | 148 | ✅ |
| Bangladesh | bd | bangladesh | 38 | 38 | 38 | 26* | 38 | ✅ |
| Malaysia | my | malaysia | 53 | 53 | 53 | 26* | 53 | ✅ |
| UAE | ae | united-arab-emirates | 26 | 26 | 26 | 26 | 26 | ✅ |
| China | cn | china | 10 | 10 | 10 | 10 | 10 | ✅ |
| Macau | mo | (مدينة فقط) | 1 | 1 | 1† | 1† | — | ✅ |
| Hong Kong | hk | (مدينة فقط) | 3 | 3 | 3† | — | — | ✅ |
| Taiwan | tw | taiwan | 8 | 8 | 8 | 8 | 8 | ✅ |
| France | fr | france | 75 | 75 | 75 | 26* | 75 | ✅ |
| Germany | de | germany | 106 | 106 | 106 | 26* | 106 | ✅ |
| Turkey | tr | turkey | 74 | 74 | 74 | 26* | 74 | ✅ |
> `*` **domCount = min(PER_PAGE=26, total)** — ترقيم صفحات الشبكة (السطر `CITIES_PER_PAGE`/`PER_PAGE=26`). **ليس فقدًا**؛ labelCount يعرض الإجمالي الصحيح وبقيّة المدن في الصفحات التالية. `†` mo/hk «مدينة فقط» (لا صفحة دولة؛ injection يظهر في **صفحة المدينة** `/prayer-times-in-macau`).

## 9) عدد الدول الكلّي في curated
**2977 مكانًا · 130 دولة (cc).**

## 10) عدد الدول التي حُقِنت بنجاح
**كلّها.** `raw curated = 2977`، `_isPrayerTimesReady-ready = 2977`، **dropped = 0**. لكلّ cc: `curatedCount == helperCount == injectedCount == labelCount`. **0 دولة بـmismatch من 130.**

## 11) الدول التي لا تملك countrySlug
بعد COUNTRY-PRAYER-PAGE-COUNTRY-SLUG-MAPPING-FIX-1: كلّ الـ130 cc لها slug. **mo + hk** «مدينة فقط» (لا صفحة دولة منفصلة — `/prayer-times-in-mo`→301→`/prayer-times-in-macau`)، لكنّ بياناتها تُحقَن في صفحة المدينة. باقي الـ128 لها صفحة دولة + injection.

## 12) الدول ذات count mismatch
**لا يوجد (0).** `curatedCount == readyCount` لكلّ 130 دولة (لا مدخل يفشل `_isPrayerTimesReady`؛ كلّ المدخلات تحوي slug+cc+lat+lng+timezone+names صحيحة).

## 13) سبب كلّ mismatch
لا mismatch. تحليل الاحتمالات:
- **A (Helper filtering):** ❌ — `_curatedCitiesForCc` لا يفلتر إلّا بـ`countryCode` (والمصدر `_CURATED_PLACES` مفلتر مسبقًا بـ`_isPrayerTimesReady`، لكنّه يُسقط 0 من 2977).
- **B (Injection truncation):** ❌ — `_countryCitiesScriptTag` يحقن **كامل** `_curatedCitiesForCc(cc)` (لا slice). (تأكيد: SA 183، IN 199، DE 106 كلّها كاملة في HTML الخام.)
- **C (Client render limit):** ⚠️ **ليس فقدًا** — `renderGrid` يرقّم 26/صفحة؛ domCount صفحة1 = min(26,total)، لكن labelCount = الإجمالي و`allCities` = كامل المحقون. (MA 22≤26 ⇒ domCount=22.)
- **D (Search/filter):** ❌ — لا فلتر نشط على التحميل (`filtered=[...allCities]`).
- **E (slug/cc mismatch):** ❌ — `morocco`→`ma` صحيح؛ injected/helper/label كلّها 22.
- **F (dedup):** ❌ — `_isCurated ? cities : deduplicate` يتخطّى dedup للـcurated (CITIES-DATA-SOURCE-FIX-1).
- **G (البيانات 22 فعلًا):** ✅ **هذا هو السبب** — المغرب 22 في curated.

## 14) هل نحتاج Fix تقني أم Expansion بيانات؟
**لا Fix تقنيّ.** الحقن أمين 100% (curated == helper == injected == label لكلّ الدول، 0 mismatch). إن أُريد مدن أكثر للمغرب (أو غيره) فهي **توسعة بيانات** عبر apply script + مراجعة + commit (سياسة الموقع، يدويّ)، لا خلل في العرض.

## 15) اسم التذكرة المقترحة التالية
- لا توجد حاجة لـ`COUNTRY-PRAYER-PAGE-PREHYDRATED-CITIES-DATA-COUNT-FIX-1` (0 mismatch).
- لو رُغِب توسيع مدن المغرب: تذكرة **بيانات** منفصلة مثل **`COUNTRY-CITIES-MA-CURATED-EXPANSION-1`** (أو `PLACE-NAMES-MA-CITIES-EXPANSION-1`) — اختياريّة، ليست إصلاح خلل.

## 16) تأكيد: تدقيق فقط
✅ لم يُعدَّل `curated-places.json`/`server.js`/`js/app.js`/`prayer-times-cities.html`/`index.html`/`css/style.css` ولا أيّ ملفّ. هذا التقرير وثيقة فقط.

## 17) تأكيد: لا commit / لا push
✅ لم يُنفَّذ أيّ commit ولا push.

---
**الخلاصة:** «22» للمغرب **صحيحة تمامًا** — المغرب يحوي 22 مدينة في curated وكلّها تُحقَن وتُعرَض (curated=helper=injected=DOM=label=22). على مستوى كلّ الدول: **2977 = 2977 ready، 130 دولة، 0 dropped، 0 mismatch** — الحقن يحمل **كلّ** مدن curated بأمانة. لا خلل تقنيّ؛ أيّ زيادة في الأعداد = توسعة بيانات منفصلة. (`domCount` على الشبكة محدود بـ26/صفحة بالترقيم — ليس فقدًا.)

**النتيجة المقترحة:** ✅ تدقيق مكتمل — للإغلاق أرسِل: `اعتماد وإغلاق تقرير: COUNTRY-PRAYER-PAGE-CURATED-COUNTS-INJECTION-AUDIT-1`

*(تذكير: PREHYDRATED-CITIES-DATA-FIX-1 ما زالت معلَّقة بانتظار `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-PREHYDRATED-CITIES-DATA-FIX-1`. ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
