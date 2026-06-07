# تقرير ما قبل الدفع: COUNTRY-PRAYER-PAGE-COUNTRY-SLUG-MAPPING-FIX-1

**النوع:** إصلاح جذر slug/link/routing لصفحات الدولة (تابع لـ MACAU-AUDIT-1 المعتمد).
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** منع إصدار **رموز الدول الخام** كـslug + تسجيل الأقاليم الناقصة + تحصين باني الـslug + redirect للـcc الخام. **بلا** تغيير بيانات curated/مصدر المدن/أسماء المدن/no-runtime-translation. قرار «ماكاو دولة أم جزء من الصين» **مؤجَّل عمدًا**.

## 1) السبب الجذري
`makeCountrySlug(cc, englishName)` كان يُرجع **رمز الدولة الخام** (`return cc`) عند غياب اسم الدولة الإنجليزيّ، فيُنتج `/prayer-times-in-mo`. والأعمق: **9 أقاليم/دول** في curated كانت غائبة عن خرائط أسماء الدول، فلا يعترف بها الخادم كدول (`_countryFromSlug='__'`) وتُخدَم كصفحة مدينة SPA فارغة.

## 2) قائمة الأقاليم/الدول المتأثّرة (9 — من تدقيق MACAU-AUDIT-1)
| cc | الاسم | مدن curated | تصنيف الإصلاح |
|---|---|---|---|
| lv | Latvia | 19 | صفحة دولة (لا تعارض) |
| tw | Taiwan | 8 | صفحة دولة |
| lt | Lithuania | 8 | صفحة دولة |
| cy | Cyprus | 5 | صفحة دولة |
| is | Iceland | 4 | صفحة دولة |
| ee | Estonia | 4 | صفحة دولة |
| me | Montenegro | 3 | صفحة دولة |
| hk | Hong Kong | 3 | **مدينة فقط** (تعارض: slug مدينة `hong-kong`) |
| mo | Macau | 1 | **مدينة فقط** (تعارض: slug مدينة `macau`) |
> **mo/hk** لهما مدينة curated بنفس slug الدولة المحتمَل ⇒ يبقيان «مدينة فقط» (تجنّب حجب صفحة المدينة + تأجيل قرار البيانات). الـ7 الباقية بلا تعارض ⇒ صفحات دولة كاملة.

## 3) mapping قبل/بعد (`makeCountrySlug` / `makeCountrySlugSrv`)
| cc | قبل | بعد |
|---|---|---|
| mo | `mo` ❌ | `macau` ✅ (override → slug المدينة) |
| hk | `hk` ❌ | `hong-kong` ✅ (override) |
| tw | `tw` ❌ | `taiwan` ✅ (أُضيف الاسم) |
| lv/lt/cy/is/ee/me | كانت تُنتج slug صحيحًا في العميل لكن الخادم لا يعترف | `latvia`… ✅ (أُضيفت للخادم) |
| cc غير معروف (zz) | `zz` ❌ | `''` ✅ (تحصين — لا رابط) |
| sa/ae/my/cn… (قائمة) | `saudi-arabia`… | بلا تغيير ✅ |

## 4) حالة `makeCountrySlug` قبل/بعد
- **قبل:** `const name = englishName || COUNTRY_EN_NAMES[cc]; if(name) return slug(name); return cc;`
- **بعد:** `if (COUNTRY_SLUG_OVERRIDES[cc]) return OVERRIDES[cc]; const name = englishName || COUNTRY_EN_NAMES[cc]; if(name) return slug(name); return '';`
- نفس المنطق في `makeCountrySlugSrv` (الخادم) — `COUNTRY_SLUG_OVERRIDES = { mo:'macau', hk:'hong-kong' }` مشترك مفهوميًّا بين العميل والخادم.
- **تحقّق حيّ (DOM):** `makeCountrySlug('mo')='macau'`، `('hk')='hong-kong'`، `('tw')='taiwan'`، `('lv')='latvia'`، `('zz')=''`، `('sa','Saudi Arabia')='saudi-arabia'`.

## 5) حالة breadcrumb قبل/بعد
- **قبل** (صفحة مدينة ماكاو): `#bc-country` href = `/prayer-times-in-mo` ❌.
- **بعد:** `#bc-country` href = `/prayer-times-in-macau` ✅ (تحقّق DOM)، النصّ «مواقيت الصلاة في ماكاو».
- حارس جديد: إن كان الـslug فارغًا (cc غير معروف) **يُزال href** فلا يظهر `/prayer-times-in-` مكسورًا.
- لا روابط cc خام في DOM إطلاقًا (`rawCcLinks=[]`).

## 6) حالة `/prayer-times-in-mo` قبل/بعد
- **قبل:** 200، يُخدَم SPA كمدينة مجهولة → spinner، 0 مدن.
- **بعد:** **301 → `/prayer-times-in-macau`** (صفحة مدينة ماكاو تعمل). يشمل البادئات: `/en/…-mo → /en/…-macau` إلخ.

## 7) اختبار Macau / HK / TW
| المسار | النتيجة |
|---|---|
| `/prayer-times-in-mo` | 301 → `/prayer-times-in-macau` ✅ |
| `/prayer-times-in-hk` | 301 → `/prayer-times-in-hong-kong` ✅ |
| `/prayer-times-in-tw` | 301 → `/prayer-times-in-taiwan` ✅ |
| `/prayer-times-in-macau` | 200 صفحة مدينة (لا redirect، تعمل) ✅ |
| `/prayer-times-in-hong-kong` | 200 صفحة مدينة ✅ |
| `/prayer-times-in-taiwan` | 200 **صفحة دولة** — **8 مدن** مرسومة («مواقيت الصلاة في مدن تايوان») ✅ |
| `/prayer-times-in-latvia` | 200 صفحة دولة (cc=lv → 19 مدينة عبر API) ✅ |
| باقي الـ9 (lt/cy/is/ee/me) | 200 صفحة دولة ✅ |

## 8) اختبار الدول غير المتأثّرة (regression)
`/prayer-times-in-`: saudi-arabia · united-arab-emirates · malaysia · china · india · indonesia · pakistan · bangladesh · france · germany → **200 صفحة دولة** (سلوك ثابت) ✅. مدن: riyadh/taipei/riga/macau/hong-kong/central → 200 صفحة مدينة ✅. `/` `/azkar` `/qibla` `/moon-today` `/prayer-times-worldwide` `/sitemap-main.xml` → 200 ✅.

## 9) تأكيد عدم تغيير curated data
✅ **لم يُمَسّ `db/places/curated-places.json`** (git diff للملفّات المتتبَّعة = 4 ملفّات كود فقط). لا أسماء مدن، لا slugs مدن، لا ترجمة runtime. الإصلاح كلّه في **خرائط أسماء الدول + منطق slug الدولة + routing**.

## 10) تأكيد عدم تغيير search/navbar/SEO
✅ search box (CITY-SEARCH-RESTORE) بلا تغيير — بل تظهر صفحات الدولة الجديدة مع مربّع البحث نفسه. navbar بلا تغيير. SEO/H1 لصفحات المدن/الدول الموجودة بلا تغيير (الأقاليم الجديدة كانت صفحات فارغة، فالآن تعرض عنوانًا/مدنًا صحيحة — تحسين لا كسر). canonical/hreflang للأقاليم تتبع نمط الموقع تلقائيًّا.

## 11) الملفّات المعدَّلة
| الملفّ | التغيير | الأسطر |
|---|---|---|
| `server.js` | +7 إلى `COUNTRY_NAMES_EN` و`COUNTRY_NAMES_AR` · `COUNTRY_SLUG_OVERRIDES` + تحصين `makeCountrySlugSrv` (لا cc خام) · redirect للـ9 cc خام في handler `prayer-times-in` · تخطّي mo/hk في حلقة sitemap الدول. | +39/−1 |
| `js/app.js` | +`tw` إلى `COUNTRY_EN_NAMES` · `COUNTRY_SLUG_OVERRIDES` + تحصين `makeCountrySlug` · حارس href فارغ في breadcrumb. | +19/−2 |
| `prayer-times-cities.html` | +7 إلى `COUNTRY_NAMES_EN` (حسم slug→cc) و`COUNTRY_NAMES` (AR). | +7 |
| `index.html` | بمب كاش `js/app.js?v=769 → 770` (×2). | +2/−2 |
> `git diff --stat`: **4 ملفّات، +64/−5**. LF محفوظ. `node --check server.js` ✓ · `node --check js/app.js` ✓.

## 12) نتائج regression
✅ كلّ ما في القسمين 7+8 = 200/301 صحيحة. **0 أخطاء console** (preview error level: «No console logs»). `/api/cities?cc=` mo=1·hk=3·tw=8·lv=19 (سليم). sitemap: **أُزيل `/prayer-times-in-hk` المكسور** سابقًا، **0** روابط cc خام جديدة.

## 13) رسالة commit المقترحة
```
fix(country): COUNTRY-PRAYER-PAGE-COUNTRY-SLUG-MAPPING-FIX-1 — prevent raw country codes in country prayer links
```

## معايير القبول (11/11)
1. ✅ لا رابط `/prayer-times-in-mo` (DOM `rawCcLinks=[]`). 2. ✅ Macau → `/prayer-times-in-macau`. 3. ✅ Hong Kong → `/prayer-times-in-hong-kong`. 4. ✅ Taiwan → `/prayer-times-in-taiwan` (صفحة دولة، 8 مدن). 5. ✅ `makeCountrySlug` لا يُرجع cc خام (`zz`→`''`). 6. ✅ `/api/cities?cc=mo` يعمل (1). 7. ✅ `/prayer-times-in-macau` ليست spinner فارغ. 8. ✅ لا تغيير أسماء مدن / no-runtime-translation. 9. ✅ لا تغيير مصدر curated. 10. ✅ 0 console. 11. ✅ regression 200.

## ملاحظات
- **قرار البيانات مؤجَّل:** ماكاو/HK تبقيان «مدينة» (لا قرار دولة-مستقلّة/جزء-من-الصين) — تمامًا كما طلبت.
- **sitemap للأقاليم الـ7:** مصدر sitemap (`curated-slugs.json`) مجموعة curated منفصلة لا تحوي هذه الأقاليم، فصفحات دولها تعمل لكنّها ليست في sitemap.xml (ليست انحدارًا — لم تكن موجودة). إضافتها لاحقًا تحسين منفصل.
- **توطين أسماء الأقاليم:** أُضيفت AR+EN؛ اللغات الأخرى تسقط على EN (نفس نمط دول كثيرة قائمة).

---
**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-COUNTRY-SLUG-MAPPING-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
