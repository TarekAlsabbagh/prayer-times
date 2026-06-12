# تقرير ما قبل الدفع: DISCOVERED-CITY-SEARCH-HOMONYM-MERGE-FIX-1 (نطاق موسَّع)

**النوع:** إصلاح بنية البحث + ميزة واجهة. (أ) `/api/search-place` يَدمج curated + discovered بدل waterfall صارم فتظهر المدن المكتشفة المتماثلة مع مدن curated في **دولة أخرى**؛ (ب) صفحة الدولة تَحقِن المدينة المكتشفة المُختارة في شبكتها **بصريًّا ومؤقّتًا** (UI فقط) دون مغادرة الصفحة ودون كتابة curated.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `origin/main = 828dda2`.
**النطاق (موسَّع باعتمادك):** كلّ أسطح البحث (الرئيسيّة / qibla / moon-today / prayer-times / صفحة الدولة + بحث جدول مدنها) عبر `/api/search-place` و`window.SiteSearch`.

---

## 1) المشكلة قبل الإصلاح
بحث «القنيطرة» (عربيّ) يُرجِع **kenitra (المغرب، curated) فقط** ويُخفي **al-quneitra (سوريا، discovered)** رغم وجودها وتصنيفها READY — لأنّ الاسمين متماثلان بالعربيّة والـwaterfall يستعلم discovered **فقط عند `curated===0`**. اللاتينيّ «Quneitra» يظهر (لا تماثل مع kenitra). إضافةً: لا توجد طريقة لإظهار المدينة المكتشفة داخل **شبكة** صفحة الدولة عند اختيارها (كانت إمّا تنقل بعيدًا أو لا تبقى).

## 2) الجزء (أ) — دمج طبقتَي API
- **server/search-merge.js (جديد):** دوالّ نقيّة `cleanDiscoveredSlug` / `nameSet` / `namesOverlap` / `geoNear` / `mergeCuratedDiscovered`. **لا شبكة، لا تحوّل بيانات** — مصفوفات فقط.
- **server.js (PHASE C):** الشرط من `results.length === 0` إلى **`results.length < 10`**، ثمّ `_searchMerge.mergeCuratedDiscovered(results, discovered, {cap:10, findCuratedBySlug:_findPlaceBySlug})`. **curated تبقى أولًا بترتيبها**، تُلحَق discovered غير المكرَّرة بحدّ 10. `source` يبقى `curated` إن ساهمت curated (توافق العميل)، و`discovered` إن ساهمت discovered وحدها.

## 3) قاعدة dedup (يُسقِط المطابق فعلًا، يُبقي المتماثل عبر الدول)
لكلّ نتيجة discovered تُسقَط إذا (**كلّها بشرط نفس الدولة**):
1. الـslug النظيف (`{base}-{cc}`→`{base}`) موجود curated عالميًّا في نفس الدولة (`_findPlaceBySlug`) → يُسقِط `chefchaouen-ma` حين `chefchaouen` curated؛
2. تطابق نتيجة curated في نفس الدولة بالـslug/الاسم/القُرب الجغرافيّ (<0.15°).
> **اختلاف الدولة = ليس تكرارًا** → يُبقى (إصلاح التماثل: kenitra/MA + al-quneitra/SY معًا للاستعلام العامّ).

## 4) الجزء (ب) — تعديلات `js/site-search.js` (متوافقة رجعيًّا)
- **`onPick(r, opts)`** اكتسب خيار `navigate`: عند `opts.navigate === false` يُنفِّذ تسجيل `/api/place-selected` + بذر `sessionStorage` **دون** `window.location.href` (لا تنقّل). الافتراضيّ `navigate=true` ⇒ السلوك القديم حرفيًّا.
- **`createBox`** اكتسب `doPick(r, LANG)` + خطّاف اختياريّ **`opts.onPick(r, ctx)`**؛ `ctx.defaultPick(extra)` يُشغِّل المسار القياسيّ (مرِّر `{navigate:false}` لتسجيل+بذر بلا تنقّل). **بلا `opts.onPick` ⇒ السلوك القديم تمامًا** (تستخدمه الرئيسيّة/qibla/moon — لا تمرّر override فتنتقل كالعادة).

## 5) الجزء (ب) — تعديلات `prayer-times-cities.html` (الميزة الجديدة)
- **`_gridSearch()`** يمرّر `onPick` مُخصَّصًا: `ctx.defaultPick({navigate:false})` (تسجيل + بذر بلا تنقّل) ثمّ `_addDiscoveredCityToGrid(r)`.
- **`_addDiscoveredCityToGrid(r) (جديد):** يبني عنصر مدينة من النتيجة (slug/names/lat/lng/`_discovered:true`) ويُضيفه إلى `allCities` **في الذاكرة فقط** إن لم يكن موجودًا، ثمّ يُعيد ترشيح الشبكة بالاستعلام الحاليّ فتظهر كبطاقة عاديّة (أو وحدها إن لم تطابق محلّيًّا).
- **`renderGrid`** يضيف `data-source="discovered"` على بطاقة المدينة المُحقَنة (نفس الشكل/التسمية، يربط إلى `/prayer-times-in-{slug}`).
- **CSS:** `.city-link[data-source="discovered"]` حدّ متقطّع خفيف `rgb(224,224,224)`، وعند hover يصير solid مثل البقيّة — **بلا شارة مزعجة، لا يبدو رسميًّا**.

## 6) نطاق الدولة (عبر الدول)
`scopeFilter` (لم يُمَسّ) يُرشِّح `r.countryCode===scope`. تَحقَّق محلّيًّا:
| الاستعلام «القنيطرة» | النتيجة |
|---|---|
| صفحة المغرب (scope=ma) | **kenitra/ma فقط** (al-quneitra/sy مستبعَدة) |
| صفحة سوريا (scope=sy) | **al-quneitra/sy فقط** |
| الرئيسيّة (عامّة، بلا scope) | **kenitra/ma + al-quneitra/sy** (تماثل) |
> مؤكَّد أيضًا على `/en/prayer-times-in-morocco`: scope=ma يستبعد sy.

## 7) السلوك مؤقّت UI فقط (لا curated، لا persistence)
الحقن يُضيف العنصر إلى `allCities` في الذاكرة **لهذه الجلسة فقط**. تَحقَّق: بعد الحقن `allCities` 51→52؛ **بعد إعادة التحميل** عادت 51 و`al-quneitra` اختفت وبطاقات `data-source="discovered"` = 0. لا كتابة `curated-places.json`، ولا `localStorage`، ولا Supabase. الترقية إلى curated تبقى **مسار مراجعة/ترقية منفصلًا**.

## 8) تأكيد عدم لمس curated / Supabase / PROMOTE-BATCH-1
- **curated:** بلا تعديل في هذا الالتزام. تعديل `db/places/curated-places.json` الموجود في العمل = **uray-irah + al-ajfar فقط** (PROMOTE-BATCH-1 المُعلَّق) — مؤكَّد بفحص الـdiff؛ **لن يُضمّ**.
- **Supabase:** لا كتابة/مخطّط جديد. **ملاحظة شفافة:** `_searchDiscoveredPlaces` (غير معدَّلة) تحوي زيادة `search_count++` (fire-and-forget، telemetry)؛ بما أنّ discovered يُستعلَم الآن على بحوث أكثر تُطلَق أكثر — telemetry حميدة موجودة مسبقًا، لا بيانات جديدة.
- **`/api/place-selected`:** يُستدعى كما هو (تسجيل اختيار المدينة المكتشفة) — لم يُعدَّل.

## 9) الملفّات
| الملفّ | التغيير | يُضمّ؟ |
|---|---|---|
| `server/search-merge.js` | **جديد** (95 سطرًا) — دمج/dedup نقيّ | ✅ |
| `server.js` | +19/−8 — require + PHASE C (waterfall→merge) | ✅ |
| `js/site-search.js` | +24/−3 — خيار `navigate` + خطّاف `onPick`/`doPick` | ✅ |
| `prayer-times-cities.html` | +62/−1 — `_addDiscoveredCityToGrid` + onPick override + `data-source` + CSS + cache-buster | ✅ |
| `index.html` | +2/−2 — cache-buster `site-search.js?v=1→2` | ✅ |
| `scripts/_test_search_merge.mjs` | **جديد** (62 سطرًا) — اختبار وحدة (15 توكيد) | ✅ |
| `reports/discovered-city-search-homonym-merge-fix-1-prepush.md` | هذا التقرير | ✅ |
| `db/places/curated-places.json` | (PROMOTE-BATCH-1، +40) | ❌ **مستبعَد** |
| `scripts/promote-discovered-sa-batch-1-to-curated.mjs` | (PROMOTE-BATCH-1) | ❌ **مستبعَد** |
> **لم يُمَسّ:** `db/cities` · `/api/place-selected` · noindex guard · slugs · canonical/hreflang · الأذكار · المسبحة · حساب الصلاة · `js/app.js`.

## 10) cache-busters
`js/site-search.js?v=1 → ?v=2` في الأماكن الثلاثة (`index.html` preload + script، و`prayer-times-cities.html`). لا حاجة لرفع نسخة `app.js`/`style.css` (لم تتغيّرا)؛ تعديلات `prayer-times-cities.html` و`server.js` مضمَّنة/خادميّة تُخدَم طازجة عند نشر Render.

## 11) التحقّق المحلّيّ (تمّ)
- **صياغة:** `node --check` لـ site-search.js + search-merge.js + server.js ✓. **اختبار الوحدة 15/15** ✓.
- **مسار curated غير منحدِر:** `riyadh→riyadh/sa`، `القنيطرة→kenitra/ma`، `chefchaouen→chefchaouen/ma` (و`chefchaouen-ma` غائب) ✓. (Supabase مُعطَّل محلّيًّا ⇒ الدمج no-op، كما هو متوقَّع.)
- **تدفّق حقن الشبكة (متصفّح، `/prayer-times-in-syria`، mock لـdiscovered):** بحث «القنيطرة» → بطاقة discovered تُعرَض → نقر → `/api/place-selected` سُجِّل (slug=al-quneitra) + **`navigatedAway:false`** (بقي على صفحة سوريا) + `allCities` 51→52 + بطاقة `data-source="discovered"` href=`/prayer-times-in-al-quneitra` بعنوان «مواقيت الصلاة في القنيطرة / Al-Quneitra» ✓. **بلا أخطاء console** ✓. لقطة شاشة بصريّة + حدّ متقطّع محسوب `dashed rgb(224,224,224)` ✓.
- **مؤقّت:** إعادة تحميل ⇒ 52→51 وزوال البطاقة ✓.
- **نطاق الدولة:** ma→kenitra فقط، sy→al-quneitra فقط، عامّ→كلاهما ✓ (+ مؤكَّد تحت `/en/`).
- **انحدار أسطح hub (مسار `doPick` الافتراضيّ):** `/`→«مكة المكرمة»، `/qibla`→«جدة»، `/moon-today`→«القاهرة» تُعرَض بلا أخطاء console ✓.
- **صفحات الدول:** morocco / saudi-arabia / syria → 200؛ `/en/prayer-times-in-morocco` دوالّ الحقن موجودة + النطاق صحيح ✓.

## 12) ما يُتحقَّق على الإنتاج (بعد الدفع)
الطبقة discovered الحيّة تتطلّب Supabase (مفاتيحه غير متوفّرة محلّيًّا) ⇒ **الدمج الحيّ + ظهور al-quneitra بجانب kenitra للعربيّ + بطاقة الشبكة الحقيقيّة** تُتحقَّق على الإنتاج. منطق الدمج/الـdedup مُتحقَّق-وحدة (15/15)، وتدفّق الحقن مُتحقَّق-متصفّح بـmock.

## 13) أسطح البحث المغطّاة
| السطح | الآليّة | الحالة محلّيًّا |
|---|---|---|
| `/` الرئيسيّة | API merge + `doPick` افتراضيّ | ✅ يُعرَض |
| `/qibla` · `/moon-today` | نفس المسار | ✅ يُعرَض |
| `prayer-times-in-{country}` (hero + جدول) | API merge + **حقن الشبكة** + scope | ✅ تدفّق كامل |
| `/en/...` كلّ ما سبق | نفس الآليّة ببادئة لغة | ✅ دوالّ + scope |
| `/api/search-place` | الدمج | ✅ curated سليم؛ discovered على الإنتاج |

## 14) المخاطر + التخفيف
| الخطر | التخفيف |
|---|---|
| discovered يُستعلَم الآن على بحوث أكثر (curated<10) → زمن Supabase إضافيّ | البحث debounced؛ RPC سريع؛ يُتخطّى عند curated=10 (ممتلئ) |
| دمج خاطئ يُكرِّر المدينة | dedup 3-طبقات (slug عالميّ + slug/اسم/جغرافيا نفس الدولة)؛ اختبار وحدة يغطّي chefchaouen-ma + uray-irah |
| الحقن يبدو «رسميًّا» أو يبقى دائمًا | حدّ متقطّع خفيف بلا شارة؛ UI-only يزول بإعادة التحميل (مؤكَّد) |
| إعادة الهيكلة تكسر مسار التنقّل الافتراضيّ | `navigate` افتراضيّ true؛ `doPick` بلا override = السلوك القديم؛ انحدار الرئيسيّة/qibla/moon مؤكَّد |
| `search_count` يُطلَق أكثر | telemetry حميدة، تُحسِّن دقّة العدّاد |

## 15) رسالة commit المقترحة
```
fix(search): DISCOVERED-CITY-SEARCH-HOMONYM-MERGE-FIX-1 — merge discovered homonyms across search surfaces
```

---
**الخلاصة:** (أ) `/api/search-place` صار يَدمج curated+discovered مع dedup دقيق فالمدينة المكتشفة المتماثلة مع curated في **دولة أخرى** (al-quneitra/SY مقابل kenitra/MA) تظهر للعربيّ عبر كلّ الأسطح، بينما المطابق فعلًا في **نفس الدولة** (chefchaouen-ma) يبقى مُسقَطًا؛ (ب) صفحة الدولة تَحقِن المدينة المكتشفة المُختارة في شبكتها بصريًّا ومؤقّتًا (UI فقط، `data-source="discovered"`، حدّ خفيف، تربط لصفحة المدينة) دون تنقّل ودون كتابة curated، مع احترام نطاق الدولة. بلا curated/Supabase-write/db-cities؛ PROMOTE-BATCH-1 معزول لن يُضمّ. السلوك الحيّ لـdiscovered يُتحقَّق على الإنتاج.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITY-SEARCH-HOMONYM-MERGE-FIX-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
