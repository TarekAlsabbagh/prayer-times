# تقرير تدقيق: COUNTRY-PRAYER-PAGE-STRUCTURE-CITIES-DATA-AUDIT-1

**النوع:** تدقيق صفحة الدولة `/prayer-times-in-{country}`. **قراءة فقط — لا تعديل/commit/push.**
**الكود:** working tree = `5178aba` (= الإنتاج). الفحص الحيّ على preview محليّ (مكافئ للإنتاج).

---

## 1) وصف المشكلة
صفحة مواقيت الصلاة للدولة تبدو قديمة البنية والبيانات. نتحقّق من: (1) توحيد navbar، (2) مصدر بيانات المدن (هل القاعدة الجديدة curated أم القديمة)، (3) اختفاء مربع البحث داخل نتائج المدن.

## 2) الصفحات المفحوصة
- `/prayer-times-in-india` (ar) + `/en/…` + `/bn/…` (حيًّا، DOM + SSR).
- عيّنات بيانات (db counts): SA, IN, ID, PK, BD, MY.
- مقارنة navbar مع صفحة حديثة: `/bn/prayer-times-in-riyadh` (index.html SPA).
- **اكتشاف معماريّ جذريّ:** صفحة الدولة تُخدَم من ملفّ **منفصل تمامًا** `prayer-times-cities.html` (server.js:24405: `isCountry ? 'prayer-times-cities.html' : 'index.html'`)، وليس من الـSPA. هذا أصل كلّ الفروق.

## 3) حالة navbar مقارنةً بباقي الموقع
| | صفحة الدولة (`prayer-times-cities.html`) | الصفحات الحديثة (`index.html` SPA) |
|---|---|---|
| الملفّ/المكوّن | sidebar ثابت داخل الملفّ المنفصل | navbar الـSPA |
| التوجيه | **روابط `/?page=qibla|duas|tasbih|hijri-today|hijri-calendar|date-converter` القديمة** (query-param) | روابط نظيفة `/qibla`,`/azkar`,`/msbaha`,`/today-hijri-date`… + `#`/data-page للـSPA |
| «مواقيت الصلاة» | `href="#"` (لا رابط) | data-page |
| الأذكار | `/?page=duas` (قديم — ليس `/azkar`) | `/[lang]/azkar` |
| المسبحة | `/?page=tasbih` (قديم — ليس `/msbaha`) | `/[lang]/msbaha` |
| i18n | **`js/i18n.js?v=132`** المونوليثيّ القديم (بلا `defer` ⇒ لا يلتقطه استبدال SSR للـper-lang) | `i18n-core.js?v=197` + `i18n/{lang}.js?v=197` |
| سلوك اللغة | **مكسور على غير العربيّة** | سليم |

**🔴 كسر فعليّ على اللغات غير العربيّة:** تمريرة lang-prefix في الخادم تُحوّل روابط `/?page=X` إلى **`/en` أو `/bn` فقط** (الصفحة الرئيسيّة) — 6 من 9 روابط أدوات تنهار إلى صفحة لغة الرئيسيّة:
- en: `["#","/en","/en/moon-today","/en/zakat-calculator","/en","/en","/en","/en","/en"]`
- bn: `["#","/bn","/bn/moon-today","/bn/zakat-calculator","/bn","/bn","/bn","/bn","/bn"]`
(قبلة/أذكار/مسبحة/هجري/تقويم/تحويل ⇐ كلّها `/bn` بدل الأداة الصحيحة).

## 4) تصنيف navbar
**NAV-C** (قديم ومختلف بنيويًّا) — مع تفاقم **NAV-F/D** (روابط الأدوات مكسورة/منهارة إلى لغة-الرئيسيّة على غير العربيّة) و**NAV-E** (لا يحترم توجيه اللغة لكلّ أداة؛ AR يستعمل `/?page=` القديم). الشعار/الأدوات/الـlanguage-switcher/الـmobile menu كلّها نسخة قديمة مستقلّة، ليست نفس مكوّن الموقع.

## 5) مصدر بيانات المدن الحاليّ
المدن تُجلب **client-side** عبر `fetch('/api/cities?cc={cc}')` (prayer-times-cities.html:1324، تُستدعى عند التحميل 1760). المعالج `handleCitiesApi` (server.js:23323) بترتيب المصادر:
1. `dbRead(cc)` ⇐ **`db/cities-{cc}.json`** (القاعدة القديمة، 115 ملفًّا).
2. `STATIC_CITIES[cc]` (مصفوفة ثابتة hardcoded في server.js:22136).
3. `fetchCitiesWikidata(cc)` (جلب حيّ من Wikidata).
4. `CAPITAL_DATA[cc]` (العاصمة فقط fallback).

## 6) هل المدن من القاعدة الجديدة أم القديمة؟
**❌ القديمة.** لا تستخدم الصفحة **إطلاقًا** `db/places/curated-places.json` (قاعدة GLOBAL-PLACE-SEARCH التي بنيناها بموجات ASIA/EUROPE/…). شكل البيانات قديم ثنائيّ اللغة `{nameAr, nameEn, lat, lng}` فقط — **بلا `names[lang]`**. (ملاحظة: server.js يقرأ curated-places.json لأغراض أخرى (SSR city-name/search) عند سطر 62، لكن صفحة الدولة لا تمسّه.)

## 7) هل توجد بيانات قديمة مستخدمة؟ (LEGACY)
**نعم، مستخدمة فعليًّا (LEGACY-C):**
- `db/cities-{cc}.json` (115 ملفًّا) — المصدر الأساسيّ.
- `STATIC_CITIES` (server.js:22136) — fallback مستخدَم + يُدمَج في DB.
- `fetchCitiesWikidata` — مصدر حيّ مستخدَم.
- `CITY_NAMES_LOCAL` (خريطة عميل في prayer-times-cities.html:828) — للأسماء المحليّة.
- `CITY_NAMES_*`/`COUNTRY_NAMES_*` للعناوين.
كلّها **مستخدمة في الإنتاج**، ليست بقايا ميتة.

## 8) عدد المدن المعروضة لكل دولة مقابل المعتمد (curated)
| الدولة | المعروض (legacy db) | المعتمد (curated) | الفرق |
|---|---|---|---|
| India | **1550** | 199 | +1351 ⚠️ |
| Indonesia | **16** | 82 | −66 ⚠️ |
| Pakistan | **1013** | 148 | +865 ⚠️ |
| Bangladesh | **156** | 38 | +118 ⚠️ |
| Saudi | 142 | (حسب المشروع) | — |
| Malaysia | 288 | — | — |
الأعداد **لا تطابق** القاعدة المعتمدة إطلاقًا (مصدر مختلف كليًّا). مؤكَّد حيًّا: `/prayer-times-in-india` يعرض «1550 منطقة / مدينة».

## 9) حالة أسماء المدن حسب اللغة
الكرت يبني الاسم عبر `_cardLabelFn` → `_localizedCityName(nameEn, lang)` ضدّ خريطة العميل `CITY_NAMES_LOCAL` (langs: **ur/tr/fr/de/id/es فقط** — **bn/ms مفقودتان**)، وإلّا الإنجليزيّة.
| اللغة | الاسم المعروض | مطابق لقاعدة `names[lang]→names.en`؟ |
|---|---|---|
| ar | `nameAr` (من db القديمة) | جزئيًّا (مصدر قديم، ليس names.ar curated) |
| en | `nameEn` | ✓ إنجليزيّ |
| ur/tr/fr/de/id/es | `CITY_NAMES_LOCAL[lang]` أو إنجليزيّ | ❌ ليس من curated names[lang] |
| **bn/ms** | **إنجليزيّ** (لا dict) | ❌ لا يستخدم `names.bn`/`names.ms` المتوفّرة في curated |
مؤكَّد حيًّا `/bn/prayer-times-in-india`: «New Delhi-এ নামাজের সময়», «Mumbai-এ…» (إنجليزيّ داخل بنغاليّ) — **0 تسرّب عربيّ مرئيّ** (gridArabicChars=0) لكنّ الأسماء ليست بنغاليّة رغم توفّرها في curated.
**JSON-LD ItemList** (`injectCitiesItemList` السطر 1351): `isEnIL ? nameEn : nameAr` ⇒ **أسماء عربيّة في JSON-LD على كلّ اللغات غير الإنجليزيّة** (تسرّب على مستوى بيانات SEO، غير مرئيّ).

## 10) حالة slugs
✅ **سليمة** — إنجليزيّة ثابتة عبر `makeSlug(nameEn, lat, lng)`: `/prayer-times-in-new-delhi`, `/prayer-times-in-mumbai`… لا slugs عربيّة/بنغاليّة.

## 11) حالة روابط المدن وحفظ اللغة
✅ **سليمة** — روابط كروت المدن تحترم اللغة: على `/bn/…` كلّ 26/26 رابطًا يبدأ `/bn/` (0 بلا بادئة). (المشكلة في navbar فقط، لا في روابط المدن.)

## 12) حالة مربع البحث
على الصفحة **مدخلان ظاهران**:
- `#city-search-input` (هيدر علويّ) → `onCitySearchInput` **يعيد التوجيه للرئيسيّة** `/?search=` (لا يفلتر داخل الصفحة).
- `#search-input` (هيرو، `loc-hero-search`) → `onSearch()` (السطر 1397) **يفلتر `allCities` محليًّا حيًّا** ويعيد الرسم — فالفلترة الفعليّة موجودة وتعمل.
- **المفقود:** المربع المخصَّص داخل بطاقة النتائج (`.cities-search-card` / `.cities-search-wrapper`) — **CSS له موجود (السطور 17-35, 166-169) لكن لا عنصر `<input>` يستخدمه** (CSS يتيم) ⇒ المربع المخصَّص فوق الشبكة **حُذف** من الـHTML.

## 13) لماذا اختفى مربع البحث؟
الفلترة لم تُفقَد وظيفيًّا (هيرو `#search-input` يفلتر)، لكن **المربع المخصَّص داخل نتائج المدن** (`.cities-search-card`) أُزيل من الـHTML تاركًا CSS يتيمًا — فالمستخدم يراه «اختفى». غالبًا أثناء إعادة بناء سابقة للصفحة استُبدِل المربع المخصَّص بحقل الهيرو. **يمكن إعادته بسهولة** (CSS جاهز + دالّة `onSearch` جاهزة).

## 14) حالة SEO
- **المحتوى غير مرئيّ في SSR:** `#cities-container` يحوي **spinner فقط** في SSR؛ المدن تُحقن client-side بعد التحميل ⇒ زاحف بلا-JS يرى «جاري تحميل المدن…» لا قائمة مدن. (JSON-LD ItemList يُحقَن client-side أيضًا.)
- i18n قديم (`v=132` مونوليثيّ).
- لا FAQ ولا محتوى تعليميّ غنيّ.
- Title/Meta مترجَمان 10/10 لكن **Meta قصير** (ar=102, en=112, bn=84 — دون 120-160).

## 15) حالة H1/Title/Meta
- **H1 = 0 على كلّ اللغات** 🔴 — الملفّ فيه `<h1 id="loc-hero-title">` لكن `serveHtmlWithSeo` **يخفضه إلى `<h2>`** (الصفحة غير مسجَّلة في نظام H1-marker، فيُخفَض الـh1 الشارد بلا حقن بديل). النتيجة: لا H1 إطلاقًا.
- **Title:** مترجَم 10/10، أطوال مقبولة (ar=42, en=51, bn=29 — bn قصير).
- **Meta:** مترجَم 10/10 لكن قصير (84-112).
- **canonical:** ✅ صحيح لكلّ لغة. **hreflang:** ✅ 12 وسمًا (موجود).

## 16) هل يوجد client overwrite؟
المدن **client-rendered بالكامل** (SSR=spinner ثمّ JS يرسم) — ليست «overwrite» بل «client-only rendering». navbar وTitle/Meta/canonical SSR ثابتة (الـnavbar يُترجَم بالـi18n walker لكن روابطه مكسورة كما في §3).

## 17) التصنيفات النهائية
- **Navbar:** `NAV-C` (قديم/مختلف) + تفاقم `NAV-F`/`NAV-E` (روابط أدوات مكسورة على غير العربيّة، لا توجيه لغة لكلّ أداة).
- **City Data:** `DATA-C` (مصدر قديم) + `DATA-D` (client-only، غير SSR) + `DATA-E` (الأعداد لا تطابق curated) + `DATA-F` جزئيّ (الأسماء من خريطة قديمة/إنجليزيّة لا من `names[lang]`؛ JSON-LD عربيّ لغير الإنجليزيّة).
- **Legacy Data:** `LEGACY-C` (بيانات قديمة مستخدمة فعليًّا: db/cities-*.json + STATIC_CITIES + Wikidata + CITY_NAMES_LOCAL).
- **Search Box:** `SEARCH-D` للمربع المخصَّص (محذوف من HTML، CSS يتيم) — مع بقاء فلترة عاملة عبر هيرو `#search-input` (دالّة `onSearch` موصولة).
- **SEO:** `SEO-C` (يحتاج إعادة بناء: H1=0 + مدن غير SSR + Meta قصير + لا محتوى/FAQ + i18n قديم).

## 18) الإصلاح المقترح (بدون تنفيذ)
1. **توحيد navbar:** استبدال sidebar القديم في `prayer-times-cities.html` بنفس navbar الموقع + روابط نظيفة `/[lang]/qibla|azkar|msbaha|today-hijri-date|hijri-calendar|date-converter` مع احترام اللغة + ترقية i18n إلى `i18n-core+{lang}` v197.
2. **مصدر البيانات:** تحويل `/api/cities` (أو مسار SSR جديد) لقراءة **`curated-places.json`** وإرجاع `names[lang]` (+ fallback `names.en`)، وحقن قائمة المدن **SSR** (لا spinner فقط)، مع احترام قاعدة عدم الترجمة runtime. (أعداد تتوافق مع المعتمد: IN 199…)
3. **استعادة مربع البحث داخل النتائج:** إعادة `<input>` يستخدم `.cities-search-card`/`.cities-search-wrapper` فوق الشبكة، موصولًا بـ`onSearch` (الدالّة جاهزة)، يدعم كلّ اللغات، بلا تغيير مصدر/ترتيب/SEO، يعمل على الجوال.
4. **SEO:** تسجيل الصفحة في نظام H1-marker (H1 واحد صحيح)، توسيع Meta (120-160)، حقن المدن SSR، (اختياريّ) محتوى/FAQ + JSON-LD أسماء `names[lang]` بدل العربيّة.

## 19) أسماء التذاكر المقترحة للإصلاح
حسب الترابط (عالٍ جدًّا — كلّها من ملفّ legacy واحد)، خياران:
- **مجزّأ:** `COUNTRY-PRAYER-PAGE-NAVBAR-UNIFICATION-FIX-1` · `COUNTRY-PRAYER-PAGE-CITIES-DATA-SOURCE-FIX-1` · `COUNTRY-PRAYER-PAGE-CITY-SEARCH-RESTORE-FIX-1` · `COUNTRY-PRAYER-PAGE-SEO-CONTENT-FIX-1`.
- **جذريّ موحَّد (موصى به لأنّ كلّها legacy مترابط):** `COUNTRY-PRAYER-PAGE-STRUCTURE-DATA-UX-ROOT-FIX-1` (يُفضَّل تنفيذه على مراحل داخليّة: data-source → navbar → search → SEO).
> توصية: ابدأ بـ**CITIES-DATA-SOURCE** (الأعلى أثرًا: يصلح المصدر + الأعداد + الأسماء + SSR)، ثمّ navbar، ثمّ search، ثمّ SEO.

## 20) الملفّات المتوقَّعة للإصلاح
- `prayer-times-cities.html` (navbar + search input + i18n tag + h1 + هيكل).
- `server.js` (`handleCitiesApi`/مسار SSR للمدن من curated-places.json + تسجيل H1-marker + Meta + تمريرة lang-prefix للـnavbar).
- (محتمل) `css/style.css` أو الـCSS المضمّن في الملفّ.
- (محتمل) cache-busters: `index.html`?/`sw.js` + الـ`?v=` داخل prayer-times-cities.html.
- **لا curated data mutation** (الإصلاح يقرأ القاعدة الموجودة فقط).

## 21) تأكيد أنّه Audit فقط
✅ **قراءة فقط.** لم يُعدَّل أيّ ملفّ من ملفّات المشروع. التغيير الوحيد: هذا التقرير في `reports/`.

## 22) تأكيد عدم تنفيذ commit/push
✅ **لا commit، لا push.**

---

## الخلاصة
صفحة الدولة `/prayer-times-in-{country}` تُخدَم من **ملفّ legacy منفصل `prayer-times-cities.html`** — له navbar قديم (روابط `/?page=` تنهار إلى لغة-الرئيسيّة على غير العربيّة)، ومدن من **القاعدة القديمة `db/cities-*.json` + STATIC_CITIES + Wikidata** (ليست `curated-places.json`؛ أعداد لا تطابق: IN 1550 مقابل 199) تُرسَم **client-side فقط** بأسماء من خريطة قديمة/إنجليزيّة (bn/ms→إنجليزيّ، JSON-LD عربيّ)، ومربع بحث مخصَّص **محذوف** (CSS يتيم، لكن فلترة الهيرو تعمل)، و**H1=0** (الـh1 يُخفَض إلى h2). slugs وروابط المدن (بادئة اللغة) **سليمة**. التصنيف: NAV-C · DATA-C/D/E/F · LEGACY-C · SEARCH-D · SEO-C. جاهز لفتح تذاكر الإصلاح عند توجيهك (يُفضَّل البدء بمصدر البيانات).

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
