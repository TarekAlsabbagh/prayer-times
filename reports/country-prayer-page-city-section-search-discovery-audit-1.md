# تقرير تدقيق (Audit): COUNTRY-PRAYER-PAGE-CITY-SECTION-SEARCH-DISCOVERY-FIX-1

**النوع:** تدقيق قبل التنفيذ (read-only). لم يُعدَّل أيّ ملفّ.
**الهدف:** جعل بحث المدن في صفحة الدولة متوافقًا مع سياسة البحث العامّة (local filter → global fallback → countryCode validation → discovered، بلا كتابة curated من المتصفّح).

---

## آلية البحث العامّة الحاليّة (خريطة كاملة)

### 1) ما آلية البحث العامّة؟
**`GET /api/search-place?q=&lang=`** (server.js ~24625) بثلاث طبقات متتالية:
1. **Curated** (`_searchCuratedPlaces`، فوريّ من `_CURATED_PLACES` في الذاكرة) → `source:'curated'`.
2. **Discovered** (Supabase `discovered_places` عبر RPC، مرتّب بـ`selected_count`) → `source:'discovered'` (إن `_SUPABASE_ENABLED`).
3. **External** (Nominatim ثمّ LocationIQ، مع cache في Supabase `external_cache`) → `source:'external'`، `provider:'nominatim'|'locationiq'`.

**شكل النتيجة الموحَّد** (لكلّ الطبقات): `{ slug, type, typeLabel, countryFlag, displayName, secondaryName, countryName, countryCode, lat, lng, timezone, source, confidence, nameQuality, names }`. الغلاف: `{ results, source, status, provider }` + ترويسات `X-Search-Source/Status/Provider`.

واجهة الموقع (الرئيسيّة/القمر/القبلة) تستهلكه في **`js/app.js`**: `_stFetch` (fetch+debounce 150ms) → `_stRenderResults` (يفلتر بـ`_stIsPrayerTimesReady`) → عند النقر `_stOnPick`.

### 2) هل البحث العامّ يضيف المدن تلقائيًا إلى قاعدة البيانات؟
**لا إلى curated إطلاقًا.** عند النقر على نتيجة `source !== 'curated'`، يرسل `_stOnPick` طلب **`POST /api/place-selected`** (server.js ~24954) الذي **يُحدِّث/يُدرج في Supabase `discovered_places`** (`verified:false`, `selected_count++`). إن `!_SUPABASE_ENABLED` يردّ `persisted:false` بلا حفظ.

### 3) أم يضيفها إلى discovered/temporary فقط؟
**نعم — discovered_places فقط** (طبقة منفصلة في Supabase، `verified:false`). ليست curated وليست مؤقّتة بالكامل (تبقى في Supabase للمراجعة).

### 4) هل الإضافة إلى curated يدويّة أم آليّة؟
**يدويّة 100%** عبر سكربتات source-control (apply scripts + مراجعة + commit). `db/places/curated-places.json` **لا يُكتَب وقت التشغيل أبدًا** (يُحمَّل مرّة عند الإقلاع؛ لا `writeFileSync` يمسّه).

### 5) هل يجوز للواجهة تعديل curated مباشرة؟
**لا.** لا backend للكتابة في الملفّ من المتصفّح. المسار الوحيد المعتمد للاكتشاف هو `/api/place-selected` → `discovered_places` (مع `_isValidDiscoveredInput` + خدمة service-role + حدّ 8KB).

### 6) هل صفحة الدولة تستطيع استخدام نفس endpoint؟
**نعم للـendpoint، لا للكود.** `/api/search-place` و`/api/place-selected` نقطتان مشتركتان قابلتان للاستدعاء بـ`fetch` عاديّ. **لكنّ `prayer-times-cities.html` لا يُحمّل `js/app.js`** (يُحمّل `i18n.js` + `footer-cookie.js` فقط) ⇒ لا يمكن إعادة استخدام `_stFetch`/`_stOnPick` مباشرةً؛ يلزم **إعادة تنفيذ fetch+render+select مصغّرة في السكربت inline للصفحة** (تستدعي نفس الـendpoints).

### 7) هل يمكن تحديد الدولة من نتيجة البحث عبر `countryCode`؟
**نعم.** الحقل **`countryCode`** (ISO حرفان، `/^[a-z]{2}$/`) موجود في كلّ نتائج الطبقات الثلاث. فالتحقّق `result.countryCode === currentCountryCode` ممكن مباشرةً.

### 8) كيف نمنع إضافة مدينة لدولة خاطئة؟
بفلترة نتائج `/api/search-place` على `countryCode === currentCountryCode` قبل العرض/الإضافة. النتائج خارج الدولة ⇒ لا تُضاف؛ تُعرَض رسالة/رابط للوجهة الصحيحة (الحالة 3).

### 9) كيف نحافظ على no runtime translation؟
نتائج `/api/search-place` تحمل `names` + `displayName`/`secondaryName` المبنيّة server-side وفق سياسة `names[lang]→names.en` (لا fillchain). نعرض الاسم كما يردّه الـendpoint **دون أيّ ترجمة client-side** ولا توليد slug. الـslug يأتي جاهزًا من الـendpoint.

### 10) كيف نمنع duplications إن كانت المدينة موجودة أصلًا؟
بمطابقة `result.slug` مع `allCities[].slug` (curated الحاليّة للدولة) — إن وُجد، فهي نتيجة محليّة (الحالة 1) ولا تُكرَّر. والـ`/api/place-selected` نفسه يُحدِّث بدل الإدراج عند تطابق `(slug, country_code)`.

---

## وضع بحث صفحة الدولة الحاليّ
`onCountryCityFilter()` (prayer-times-cities.html:1597) = **فلتر محليّ فقط** على `allCities` (curated للدولة) عبر `nameAr`/`nameEn`/`names[lang]`/`slug`. **بلا أيّ نداء `/api/search-place`.** عند عدم التطابق: رسالة «لا نتائج» المترجَمة (من تذكرة CITY-SEARCH-RESTORE).

## وضع قسم «مدن الدولة» داخل صفحة المدينة
`renderCountryCities` (app.js) **يستبعد المدينة الحاليّة** ⇒ في إقليم بمدينة واحدة (ماكاو) القائمة تفرغ ⇒ يظهر **empty-state** (تذكرة SINGLE-CITY-TERRITORY-UX المُغلَقة). طلبك الجديد: عرض **كلّ مدن الدولة من curated بما فيها الحاليّة** (بطاقة ماكاو تظهر، بلا empty-state) — أي **تعديل سلوك** القسم الذي شُحن للتوّ.

---

## سياسة الإضافة المعتمدة (الخلاصة)
| الطبقة | الكتابة وقت التشغيل؟ | الآليّة |
|---|---|---|
| `curated-places.json` | ❌ **أبدًا** | يدويّ عبر apply scripts + commit |
| Supabase `discovered_places` | ✅ عبر `/api/place-selected` | upsert `verified:false`، تلقائيّ عند نقر نتيجة non-curated |
| Supabase `external_cache` | ✅ تلقائيّ | cache لنتائج Nominatim/LocationIQ |
⇒ **الخيار C موجود ومعتمد** (`/api/place-selected`)، ويعطي دلالات **الخيار A** (المدينة المكتشَفة تُعرَض كرابط نتيجة + تُسجَّل في discovered للمراجعة، **لا** تُكتَب في curated ولا تنضمّ آليًّا لشبكة curated الخاصّة بالدولة في `/api/cities`).

## منطق البحث المقترَح (قبل/بعد) — صفحة الدولة
- **قبل:** فلتر محليّ فقط؛ لا نتيجة ⇒ رسالة «لا نتائج».
- **بعد:**
  1. **Local filter** (كما هو) — إن وُجدت نتائج تُعرَض فورًا (لا API).
  2. **Global fallback** (إن `q.length≥2` و0 نتائج محليّة): `fetch('/api/search-place?q=&lang=')`.
  3. **countryCode validation**: أبقِ فقط `r.countryCode === currentCountryCode` (+ استبعِد `r.slug` الموجود في `allCities` لمنع التكرار).
  4. **عرض**: نتيجة/نتائج مطابقة للدولة كبطاقة «مدينة مقترحة» + زرّ «عرض مواقيت الصلاة» → `/[lang]/prayer-times-in-{slug}`؛ عند النقر `POST /api/place-selected` (تسجيل discovered). **بلا كتابة curated.**
  5. **دولة خاطئة** (نتائج بـcountryCode مختلف فقط): رسالة «هذه المدينة ضمن {الدولة الأخرى}» + رابط لوجهتها.
  6. **لا نتيجة إطلاقًا**: رسالة مترجَمة «لم نجد مدينة مطابقة داخل هذه الدولة أو عبر البحث العامّ».

## الملفّات المتوقَّعة للإصلاح
- `prayer-times-cities.html` — توسيع `onCountryCityFilter` (fallback + countryCode + render مقترَح + select) + بمب i18n.
- `js/i18n.js` + `js/i18n/{10}.js` — مفاتيح: searching/found/wrong-country/no-result (+بمب `_i18nVersion`).
- `css/style.css` — تنسيق بطاقة النتيجة المقترَحة.
- (اختياري الجزء B) `js/app.js` — `renderCountryCities` لعرض كلّ curated incl. الحاليّة (تعديل سلوك single-city المُغلَق) + بمب `app.js`/`index.html`.
- (لا `curated-places.json` · لا server.js إلّا إن لزم.)

---

## ⚠️ نقاط قرار قبل التنفيذ (تحتاج اعتمادك)
1. **النطاق**: الجزء A (بحث موسّع في صفحة الدولة) **محدود وواضح**. الجزء B (قسم مدن صفحة المدينة: عرض كلّ curated incl. الحاليّة) **يعكس سلوك تذكرة SINGLE-CITY المُغلَقة** (empty-state ماكاو) ولديه تذكرة مسمّاة بديلة `COUNTRY-PRAYER-PAGE-CITY-SECTION-FROM-CURATED-FIX-1`. → **أ نفّذهما معًا في هذه التذكرة، أم أقصرها على الجزء A (البحث) وأفصل الجزء B في تذكرته المسمّاة؟**
2. **دلالات الإضافة**: اعتماد **الخيار A/C** (عرض المدينة المكتشَفة كرابط «عرض مواقيت الصلاة» + تسجيل discovered عبر `/api/place-selected`؛ **لا** تنضمّ آليًّا لشبكة مدن الدولة curated — لأنّ `/api/cities` يقرأ curated فقط). هل هذا مطابق لمرادك، أم تريد أن تظهر فورًا داخل شبكة مدن الدولة (يستلزم أن يقرأ `/api/cities` من discovered أيضًا — توسيع أكبر)؟

> **توصيتي:** تنفيذ **الجزء A فقط** الآن (بحث موسّع متوافق مع سياسة الموقع، الخيار A/C، بلا كتابة curated)، وفصل **الجزء B** في `COUNTRY-PRAYER-PAGE-CITY-SECTION-FROM-CURATED-FIX-1` (تعديل سلوك مستقلّ يعكس shipped). هذا يبقي كلّ تذكرة محدودة وآمنة كما طلبت «Fix محدود».

**هذه مرحلة تدقيق — لم يُنفَّذ commit/push.** بانتظار اعتمادك للنطاق قبل كتابة الـFix وتقرير ما قبل الدفع.
