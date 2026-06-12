# تقرير تدقيق: PALESTINE-DISPLAY-NORMALIZATION-AUDIT-1

**النوع:** تدقيق فقط — لا تعديل، لا commit/push، لا Fix. الهدف: حصر كل ظهور/ربط بـ Israel / إسرائيل / 🇮🇱 / IL في **واجهة الموقع ونتائج البحث والصفحات القابلة للفهرسة والبيانات المعروضة**، وتصميم خطّة استبداله بـ فلسطين / Palestine / 🇵🇸 / PS حسب اللغة.
**القاعدة:** `origin/main = 828dda2`. (ملاحظة: DISCOVERED-CITY-SEARCH-HOMONYM-MERGE-FIX-1 مُنفَّذ محلّيًّا وغير مدفوع — هذا التدقيق قراءة-فقط ولا يلمس ملفّاته.)
**أهمّ خلاصة مُبكرة:** طبقة البيانات المنسَّقة (curated) **فلسطينيّة بالكامل أصلًا** (0 مدينة IL، 12 مدينة PS بينها القدس). كل تسريب «إسرائيل» الفعليّ يأتي من **مصدر واحد رئيسيّ: البحث الخارجيّ Nominatim/discovered** الذي يردّ `countryCode=il` لمدن مثل تل أبيب/الناصرة، فيُشتقّ منه الاسم «Israel» والعلم 🇮🇱.

---

## 1) كل أماكن ظهور Israel / إسرائيل / 🇮🇱 (مسح كامل، باستثناء `db/places/candidates/**` المصدر البنائيّ)
| # | الموضع | النوع | شرح |
|---|---|---|---|
| 1 | **`/api/search-place` خارجيّ (Nominatim)** `server.js` بنّاء النتيجة (~547/582/587) | **API + UI (الأهمّ)** | استعلام «Tel Aviv»/«Nazareth»/«Acre»/«Jaffa» (غير موجودة curated) → `_getCountryName('il',lang)=Israel/إسرائيل` + `_countryCodeToFlag('il')=🇮🇱` + `countryCode:"il"`. **مؤكَّد حيًّا**: Tel Aviv → `[Israel/il 🇮🇱]`، Nazareth → `[Israel/il 🇮🇱]`. |
| 2 | **discovered (Supabase)** `_mapDiscoveredRow` (~1329/1337/1345) | **API + UI** | لو سبق لمستخدم اختيار مدينة IL، يُخزَّن `country_code=il` (+ ربّما `admin.country.en="Israel"`)، فتعود مستقبلًا باسم/علم إسرائيل. (محلّيًّا Supabase مُعطَّل ⇒ فارغ، لكنّه ممكن في الإنتاج.) |
| 3 | **`db/cities-ps.json`** سطر ~269 | **DATA → UI** | اسم مدينة ملوَّث: `"nameEn": "Kafr 'Aqab اسرائيل"` (كلمة «اسرائيل» ملتصقة بالاسم). يظهر في **شبكة صفحة فلسطين** (تُرسَم عميلًا من هذا الملفّ). **إدخالة واحدة فقط** من أصل 469. |
| 4 | **عرض العميل من cc** `js/app.js` (هيرو المدينة ~14854 `flagcdn/{cc}`، `_countryNameFromCode` ~972 Intl، `countryCodeToFlag` ~2707) + `js/site-search.js` ~180 + `prayer-times-cities.html` (_heroSearchRender) | **UI (عميل)** | زيارة مباشرة لصفحة مدينة IL غير-curated (مثل `/prayer-times-in-tel-aviv`) تُشتقّ العلم/الاسم من cc=il عميلًا ⇒ 🇮🇱 + Israel. (الصفحة **noindex** ⇒ ليست مشكلة فهرسة، لكنّها مشكلة واجهة.) |
| 5 | **`js/app.js` `_nonIslamicKeywords`** سطر 24121 | **خارج النطاق** | «إسرائيل» **ككلمة مفتاحيّة لتصفية أحداث غير إسلاميّة** في ميزة التاريخ الهجريّ — **ليست تسمية دولة معروضة**. تغييرها يكسر منطق التصفية. **يُترَك كما هو.** |

**لا يوجد** أيّ: slug «israel»، صفحة `/prayer-times-in-israel`، `countryCode:"il"` ثابت في كود مشحون، رابط مدينة إسرائيليّة في sitemap، أو خريطة عميلة تحوي `il:`.

## 2) تصنيف كل ظهور (data / UI / API / SEO / sitemap)
- **DATA:** بند 3 فقط (اسم ملوَّث واحد في `cities-ps.json`). curated نظيفة (0 IL).
- **API:** بنود 1 و2 (مخرجات `/api/search-place` للنتائج الخارجيّة/المكتشفة).
- **UI:** بنود 1، 2، 3، 4 (بطاقات البحث + شبكة صفحة فلسطين + هيرو صفحة المدينة + الأعلام).
- **SEO (قابل للفهرسة):** **لا تسريب.** صفحات curated فقط تُفهرَس؛ صفحات IL الخارجيّة **noindex**. القدس وكل مدن PS: `addressCountry="ps"`، العنوان/الوصف «فلسطين/Palestine»، **0 إسرائيل** (مؤكَّد).
- **sitemap:** **لا تسريب.** `sitemap-cities-1.xml` = 40,520 رابطًا، **0 رابط مدينة إسرائيليّة**، 7,200 رابط مدن فلسطينيّة.

## 3) الصفحات الحاليّة
| المسار | الحالة |
|---|---|
| `/prayer-times-in-israel` | **غير موجود** (لا slug، لا staticPage). لا حاجة redirect. |
| `/prayer-times-in-jerusalem` | موجود، **curated PS** — `addressCountry="ps"`، «فلسطين/Palestine»، 0 إسرائيل ✓ |
| `/prayer-times-in-palestine` (صفحة الدولة) | 200، تعرض «فلسطين/Palestine»، SSR نظيف؛ لكنّ **شبكة المدن** (عميل، من `cities-ps.json`) تحوي الاسم الملوَّث «Kafr 'Aqab اسرائيل» |
| `/prayer-times-in-tel-aviv` (وأمثالها IL) | 200 لكن **noindex** + بلا تسريب SSR؛ العلم/الاسم يظهران **عميلًا فقط** من cc=il |
| `qibla-in-*` / `moon-*` / `moon-today-in-*` | نفس البنية: تعتمد cc؛ مدينة IL غير-curated تُشتقّ 🇮🇱 عميلًا. القدس وPS تظهر 🇵🇸 ✓ |

## 4) مدن curated مرتبطة بـ IL — **لا توجد (0)**
مسح `curated-places.json` (2982 إدخالة): **0 بكود `il`**، **12 بكود `ps`**: jerusalem (القدس)، gaza، ramallah، nablus، hebron، bethlehem، jenin، tulkarem، rafah، khan-yunis، dayr-al-balah، tubas. القدس مُصنَّفة `ps` صراحةً، tz=`Asia/Hebron`، `admin.countryAr="فلسطين"`/`countryEn="Palestine"`.

## 5) هل تردّ نتائج discovered الجديدة IL؟ — **نعم (المصدر الرئيسيّ للتسريب)**
- **Nominatim (خارجيّ):** مؤكَّد حيًّا — تل أبيب/الناصرة تعودان `countryCode=il`، `country=Israel`، `🇮🇱`، `tz=Asia/Jerusalem`.
- **Supabase discovered:** أيّ مدينة IL يختارها مستخدم تُخزَّن بـ`country_code=il` وقد تحمل `admin.country.en="Israel"`، فتعود لاحقًا بالاسم/العلم الإسرائيليّ ما لم يُطبَّق normalizer **على القراءة** (وأفضله أيضًا **على الكتابة** في `/api/place-selected`).

## 6) أين يجب تطبيق الـnormalizer
العلم والاسم وكود الدولة **كلّها مُشتقّة من `countryCode`** في كل الأسطح. لذا نقطة التطبيع المثلى = **حيث يُبنى كائن النتيجة/الدولة**، طبقتان:
1. **الخادم (إلزاميّ):** خطوة أخيرة على كل كائن نتيجة في البناة الثلاثة — `_searchCuratedPlaces` (~348) + خارجيّ (~577) + `_mapDiscoveredRow` (~1332)، أو غلاف موحَّد على استجابة `/api/search-place`. يغطّي **كل أسطح البحث** دفعةً واحدة لأنّها كلّها تستهلك هذا الـAPI. يُطبَّق **بعد** حلّ الاسم فيتجاوز حتّى `admin.country="Israel"` المخزَّن.
2. **العميل (دفاعيّ):** نفس الخريطة في `js/app.js` (هيرو المدينة + `getCountryDisplayName` + `countryCodeToFlag` + رسّامو `flagcdn`) و`js/site-search.js` و`prayer-times-cities.html` — لتغطية **الزيارة المباشرة** لصفحة مدينة IL غير مارّة بالبحث.

نقطة مركزيّة مقترحة: تعديل `_getCountryName` + `_countryCodeToFlag` (خادم) و`_countryNameFromCode` + `countryCodeToFlag` (عميل) لاستشارة خريطة فلسطين قبل Intl، **مع تطبيع `countryCode` المعروض il→ps** في كائن النتيجة.

## 7) display normalizer فقط أم data migration؟
- **display normalizer = 95% من الحلّ** (لأنّ التسريب من اشتقاق وقت-التشغيل لا من بيانات مخزَّنة). لا حاجة لهجرة curated (نظيفة).
- **+ تنظيف بيانات صغير واحد:** إصلاح الاسم الملوَّث `"Kafr 'Aqab اسرائيل"` → `"Kafr 'Aqab"` في `db/cities-ps.json` (سطر واحد — لا يلتقطه normalizer الدولة لأنّه داخل **اسم المدينة**).
- **(اختياريّ) تطبيع وقت-الكتابة** في `/api/place-selected` كي لا يتراكم `il` في Supabase أصلًا (دفاع بالعمق).

## 8) هل نحتاج redirects؟
**لا، ليس الآن.** لا يوجد `/prayer-times-in-israel` أو slug إسرائيليّ. صفحات IL الخارجيّة (تل أبيب…) ديناميكيّة + **noindex** فلا تُفهرَس. الأولويّة (كما طلبت) = منع ظهور إسرائيل في الواجهة عبر الـnormalizer؛ سياسة slugs/redirects تُؤجَّل لقرار لاحق. (لو رغبت مستقبلًا: يمكن إضافة redirect/alias لبعض مدن «48» إلى نظائرها الفلسطينيّة، لكنّه قرار منفصل خارج هذا الإصلاح.)

## 9) هل نحتاج تعديل sitemap؟ — **لا**
`sitemap-cities-1.xml`: 0 رابط مدينة إسرائيليّة (لا توجد مدن IL في curated، والبحث الخارجيّ لا يدخل sitemap)، 7,200 رابط مدن فلسطينيّة. نظيف بالفعل.

## 10) هل نحتاج تنظيف SEO title/meta/canonical؟ — **لا للفهرسة، نعم لاتّساق العميل**
- **الصفحات المفهرَسة (curated):** نظيفة — jerusalem `addressCountry="ps"`، عنوان «مواقيت الصلاة في القدس»، فلسطين/Palestine، 0 إسرائيل. لا عمل SEO مطلوب.
- **ملاحظة اتّساق ثانويّة (ليست «إسرائيل»):** مدن PS في **8 لغات غير AR/EN** تسقط خادميًّا إلى Intl لـ`ps` = «الأراضي الفلسطينية / Palestinian Territories / Territoires palestiniens / Filistin Bölgeleri…» بدل «فلسطين/Palestine/Filistin» النظيف الذي طلبته (AR/EN سليمان عبر `admin.countryAr/En`). خرائط العميل تعرض الشكل النظيف ⇒ **عدم اتّساق خادم/عميل**. خريطة فلسطين الموحَّدة في الإصلاح تُصلح هذا أيضًا.

## 11) هل الأعلام من country code أم خريطة ثابتة؟ — **من country code في كل مكان**
- **خادم:** `_countryCodeToFlag(cc)` → emoji (cc=il→🇮🇱، ps→🇵🇸). مُستخدَم في البناة الثلاثة.
- **عميل:** صور `https://flagcdn.com/{size}/{cc}.png` في 6+ مواضع (`site-search.js`:180، `app.js`:5869/6634/6780/6945/7180/14854، `prayer-times-cities.html`) + `countryCodeToFlag()` emoji (`app.js`:2707).
- **النتيجة:** تطبيع `cc` المعروض (il→ps) يقلب **كل** الأعلام تلقائيًّا. خرائط الأسماء العميلة `COUNTRY_NAMES_*` تحوي `ps`→Palestine/Filistin/Palästina (نظيف) و**لا تحوي `il`** ⇒ الإصلاح يضيف تحويل il→ps قبل Intl فقط.

## 12) خطّة الإصلاح المقترحة (لتذكرة `PALESTINE-DISPLAY-NORMALIZATION-FIX-1`)
1. **ثابت مشترك `PALESTINE_DISPLAY`** (أسماؤك العشر): `ar:فلسطين، en:Palestine، fr:Palestine، tr:Filistin، ur:فلسطین، de:Palästina، id:Palestina، es:Palestina، bn:ফিলিস্তিন، ms:Palestin` + `flag:'🇵🇸'` + `code:'ps'`.
2. **normalizer خادميّ** `_normalizeCountryDisplay(result, lang)`: إذا `String(result.countryCode).toLowerCase()==='il'` ⇒ `countryCode='ps'`, `countryName=PALESTINE_DISPLAY[lang]`, `countryFlag='🇵🇸'`. وكذلك إذا `==='ps'` ⇒ افرض `countryName=PALESTINE_DISPLAY[lang]` (الشكل النظيف للّغات الثماني). يُطبَّق **أخيرًا** في البناة الثلاثة (يتجاوز `admin.country` المخزَّن).
3. **normalizer عميليّ مطابق** في `js/app.js` (هيرو + `getCountryDisplayName` + `countryCodeToFlag` + رسّامو flagcdn: حوِّل cc il→ps قبل بناء الرابط/العلم) و`js/site-search.js` و`prayer-times-cities.html`.
4. **تنظيف بيانات (سطر واحد):** `db/cities-ps.json` → `"Kafr 'Aqab اسرائيل"` ⇒ `"Kafr 'Aqab"`.
5. **(اختياريّ) كتابة:** في `/api/place-selected` طبِّع `countryCode` + `admin.country` قبل تخزين Supabase.
6. **بلا مساس:** الحسابات الفلكيّة، `lat/lng/timezone` (تبقى Asia/Jerusalem للحساب — نفس الإزاحة، وليست في قائمة الممنوع)، أسماء الدول الأخرى، slugs، runtime translation، fillchain، إضافة مدن.

## 13) الملفّات التي ستتغيّر في Fix
| الملفّ | التغيير |
|---|---|
| `server.js` | ثابت `PALESTINE_DISPLAY` + `_normalizeCountryDisplay` + استدعاؤه في البناة الثلاثة (قد عبر `_getCountryName`/`_countryCodeToFlag`) |
| `js/app.js` | تطبيع cc il→ps + أسماء/أعلام (هيرو + getCountryDisplayName + countryCodeToFlag + flagcdn) + cache-buster |
| `js/site-search.js` | تطبيع cc في رسّام العلم/الاسم + cache-buster |
| `prayer-times-cities.html` | تطبيع cc في `_heroSearchRender`/الشبكة + cache-buster |
| `db/cities-ps.json` | إصلاح الاسم الملوَّث (سطر واحد) |
| `server/place-display-normalize.js` (مقترح جديد) | وحدة نقيّة قابلة للاختبار للخريطة + الدالّة (تُشارَك خادم/اختبار) |
| `scripts/_test_palestine_normalize.mjs` (جديد) | اختبار وحدة |
| `reports/palestine-display-normalization-fix-1-*.md` | تقرير ما قبل الدفع |
> لا مساس بـ: curated-places.json، حساب الصلاة، canonical/hreflang، الأذكار، المسبحة.

## 14) اختبارات regression المقترحة (لمرحلة Fix)
- **وحدة:** `normalize(il,lang)`→{ps, الاسم الصحيح, 🇵🇸} للّغات العشر؛ `normalize(ps,lang)`→الاسم النظيف؛ `normalize(sa/ma/sy…)`→بلا تغيير (عدم تغيير الدول الأخرى).
- **API:** `/api/search-place?q=Tel Aviv|Nazareth|Acre|Jaffa` (ar/en) ⇒ 0 «Israel/إسرائيل/🇮🇱/il»، تظهر «فلسطين/Palestine/🇵🇸/ps»؛ `q=Jerusalem`⇒ps بلا انحدار؛ مدن أخرى (Riyadh/Paris) بلا تغيّر.
- **متصفّح:** بطاقات البحث (الرئيسيّة/qibla/moon/صفحة الدولة) + هيرو `/prayer-times-in-tel-aviv` (زيارة مباشرة) ⇒ 🇵🇸 + Palestine، 0 🇮🇱؛ شبكة `/prayer-times-in-palestine` ⇒ لا «اسرائيل» في أيّ اسم.
- **عدم الكسر:** القدس ومدن PS تعمل، مواقيت الصلاة بلا تغيّر (lat/lng/tz ثابتة)، صفحات المدن لا تنكسر، خطّ البحث سليم.
- **شامل:** grep إنتاج بعد الدفع على عيّنة صفحات: 0 `إسرائيل|Israel|🇮🇱`.

## 15) هل نكمل إلى Fix أم نحتاج قرارًا إضافيًّا؟
**جاهز للـFix** — الصورة واضحة والحلّ منخفض-المخاطر (display normalizer + سطر تنظيف بيانات). أحتاج قرارك في نقطتين فقط:
- **(أ) نطاق الكتابة:** هل نطبِّع أيضًا وقت الكتابة في `/api/place-selected` (منع تراكم il في Supabase)، أم نكتفي بالعرض (read-time)؟ *(توصيتي: الاثنان معًا.)*
- **(ب) tz العرض:** نتائج IL الخارجيّة تحمل `tz=Asia/Jerusalem` (للحساب). أتركه كما هو (لا يحوي «Israel»، إزاحته كـAsia/Hebron) أم تريد إخفاء/إبدال سلسلة tz في العرض؟ *(توصيتي: تركه — لا يُعرَض للمستخدم عادةً ولا يخالف قائمة الممنوع.)*

---
**الخلاصة:** البيانات المنسَّقة فلسطينيّة بالكامل (0 IL، 12 PS، القدس=PS)، وSEO/sitemap نظيفان. كل تسريب «إسرائيل/🇮🇱» الفعليّ مصدره **اشتقاق وقت-التشغيل من `countryCode=il`** القادم من **البحث الخارجيّ Nominatim/discovered** (تل أبيب/الناصرة…)، زائدَ **اسم بيانات ملوَّث واحد** في `cities-ps.json`. الحلّ = **display normalizer (خادم + عميل) يحوّل il→ps + خريطة أسماء فلسطين العشر + 🇵🇸**، بلا هجرة بيانات وبلا مساس بالحسابات/المواقيت. الأعلام كلّها من `countryCode` ⇒ تطبيع واحد يقلبها جميعًا.

**النتيجة المقترحة:** ✅ تدقيق مكتمل — للمتابعة أرسِل إمّا `اعتماد وإغلاق تقرير: PALESTINE-DISPLAY-NORMALIZATION-AUDIT-1 PASSED`، أو `افتح PALESTINE-DISPLAY-NORMALIZATION-FIX-1` (مع قرارك في نقطتَي 15-أ/ب).

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
