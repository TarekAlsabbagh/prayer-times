# تقرير ما قبل الدفع: DISCOVERED-CITY-SSR-NAME-RESOLUTION-FIX-1

**النوع:** إصلاح منهجيّ — جعل حلّ اسم المدينة في SSR واعيًا بطبقة `discovered_places`، فتعرض الصفحة العربيّة (وكلّ اللغات غير-اللاتينيّة) **الاسم المحلّيّ المحفوظ** بدل الـslug اللاتينيّ. **بلا runtime translation.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `HEAD = origin/main = 5a11496`.
**الأساس:** تدقيق [DISCOVERED-CITY-ARABIC-NAME-MIX-AUDIT-1](discovered-city-arabic-name-mix-audit-1.md) (PASSED، السبب C+E+F).

---

## 1) سبب المشكلة (مختصر التدقيق)

الاسم العربيّ «خمس جوامع» **متوفّر ومحفوظ** في `discovered_places.names.ar` (Nominatim native/official)، لكنّ باني وسوم SSR (`buildSeoForPath → _resolveCityName → _findPlaceBySlug`) **متزامن ويعرف `curated` فقط** ولا يقرأ طبقة discovered (هي async). فأيّ slug غير-منسَّق يسقط إلى `_slugToTitle(slug)` = لاتينيّ، لكلّ اللغات.

## 2) آلية الحلّ في SSR — async lookup **+** cache (نعم، كلاهما)

`buildSeoForPath` متزامن، واستعلام Supabase async. الحلّ بنمط **prefetch-into-cache**:
1. **كاش بمفتاح slug + TTL** (`_DISCOVERED_SSR_CACHE`، 5 دقائق، سقف 500، سلبيّ-مُخزَّن): يقرؤه الباني المتزامن.
2. **مُحلِّل async** `_prefetchDiscoveredForSsr(urlPath)` يُستدعى **بـ`await` في المعالِج الرئيسيّ** (`http.createServer(async …)`، بعد urlPath) **قبل** `serveHtmlWithSeo`. لا-عمل إلّا لـbare-city-route (الـ4 عائلات، lang prefix اختياريّ، بلا coord/date) **غير-curated** و**Supabase مفعّل**. يجلب صفًّا واحدًا (`?slug=eq.X&limit=1`، مثل `/api/place-by-slug` الخطوة 2)، يحوّله لشكل curated، يخزّنه.
3. **خطّاف القراءة** في `_resolveCityName` (بعد فشل curated + legacy): يقرأ الكاش متزامنًا، ويستخدم الاسم **فقط إن `getLocalizedPlaceName(entry,lang).hasNativeName === true`** (لغة لها قيمة native مقبولة-السكربت).
4. **توسعة بذرة `__PRAYER_CITY__`**: نفس البوّابة — تملأ hero `#city-name`/`#bc-city` + بذرة العميل للمدن المُكتشَفة ذات الاسم المحلّيّ (body labels).

**السلسلة المطلوبة (كما حدّدتَها):** curated → discovered (`names[lang]` إن `hasNativeName`) → [legacy] → AR-safety → `_slugToTitle`. (curated يسبق legacy في الكود الأصليّ؛ خطّاف discovered وُضع بعد legacy فلا يطغى على مدن legacy.)

**سياسة NEEDS_AR_NAME:** إن لم تكن للّغة قيمة native (`hasNativeName=false`)، **لا يُستخدَم names.en اللاتينيّ** ولا يُخترع اسم — تبقى الصفحة على `_slugToTitle` (الـslug) و**noindex**. مُثبَت بمدينة اختبار `noar-testcity` (لها names.en فقط): AR = «Noar Testcity» (من الـslug)، **ليس** «Noar Testcity Real» (names.en).

## 3) Supabase async / cache — نعم

استعلام Supabase async حقيقيّ في الإنتاج (`_supabaseFetch`, مُعاد-استخدام نفس مسار `/api/place-by-slug`)، مُغلَّف بكاش TTL. على صفحات curated أو غير-المدن أو حين Supabase معطّل = **لا استعلام** (لا-عمل). مُغلَّف بـtry/catch — لا يحجب/يكسر الاستجابة أبدًا.

## 4) الملفّات المعدَّلة

| الملفّ | التغيير |
|---|---|
| `server.js` | **+127/−4** — كاش+مُحلِّل+بذرة-اختبار (بعد `_findPlaceBySlug`) · خطّاف القراءة في `_resolveCityName` · `await` prefetch في المعالِج · توسعة بذرة `__PRAYER_CITY__` لـdiscovered |
| `scripts/_smoke_discovered_city_ssr_name_resolution_fix_1.mjs` | **جديد** — سموك ذاتيّ-الاكتفاء (يُقلع خادمه على منفذ فريد ببذرة اختبار) — 18 تأكيدًا |

**لم تُمَسّ** (كما اشترطتَ): `curated-places.json` · `db/cities` · `js/i18n.js`/أيّ i18n · `index.html` · search pipeline · place-selected storage · الحساب · timezone · canonical/hreflang · sitemap · CSS.
**cache-buster:** **لا حاجة** — التغيير server.js-only SSR (لا أصل عميل: app.js/i18n/index.html بلا مساس).

## 5) نتيجة «Khams Djouamaa» قبل/بعد (الصفحة العربيّة `/prayer-times-in-khams-djouamaa`)

| الموضع | قبل | بعد |
|---|---|---|
| `<title>` | مواقيت الصلاة في **Khams Djouamaa** اليوم | مواقيت الصلاة في **خمس جوامع** اليوم |
| `<meta description>` | …في **Khams Djouamaa**… | …في **خمس جوامع**… |
| `H1 #page-h1` | …**Khams Djouamaa**… | …**خمس جوامع**… |
| breadcrumb `#bc-city` | مواقيت الصلاة في **Khams Djouamaa** | **خمس جوامع** |
| BreadcrumbList JSON-LD | `"name":"Khams Djouamaa"` | `"name":"خمس جوامع"` (0 لاتينيّ) |
| hero `#city-name` | «جاري تحديد الموقع...» (placeholder) | **خمس جوامع** (مبذور SSR) |
| `__PRAYER_CITY__` | غير محقون | محقون باسم «خمس جوامع» |
| **robots** | **noindex,follow** | **noindex,follow** (بلا تغيير) |

## 6) تأكيد بقاء noindex

حارس `DISCOVERED-CITY-PAGE-NOINDEX-GUARD-FIX-1` (`if (!_curated) robotsOverride='noindex,follow,…'`) **لم يُمَسّ** — مبنيّ على `_findPlaceBySlug` (curated) لا على الكاش الجديد. مُثبَت: khams + noar (مُكتشَفتان) = **noindex,follow**؛ makkah (curated) = **index,follow**. الإصلاح يصحّح الاسم فقط، لا يجعل صفحات discovered قابلة للفهرسة.

## 7) تأكيد عدم runtime translation

الاسم يأتي **حرفيًّا** من `discovered_places.names[lang]` (مصدر Nominatim native). لا ترجمة آليّة، لا transliteration وقت التشغيل. حالة عدم التوفّر → slug/noindex، لا اختراع.

## 8) تأكيد عدم لمس curated

`git diff --stat` = `server.js` فقط (+ سموك جديد). 0 تغيير في `curated-places.json`. خطّاف discovered يعمل **بعد** فشل curated (`_findPlaceBySlug`)، فمسار curated بلا تغيير سلوكيًّا (مُثبَت: makkah «مكة المكرمة» + index,follow؛ place-by-slug 44/0؛ cross-page 28/0 Londres/München).

## 9) نتائج اللغات (`khams-djouamaa`، مُتحقَّق على الخادم)

| لغة | العنوان | ملاحظة |
|---|---|---|
| AR | مواقيت الصلاة في **خمس جوامع** اليوم | native ar ✓ |
| EN | Prayer Times in **Khams Djouamaa** Today | native en ✓ |
| FR | Heures de prière à **Khams Djouamaa** | native fr ✓ |
| UR | **Khams Djouamaa** میں آج اوقاتِ نماز | لا names.ur في المصدر → proper-noun en (لا كسر/لا مفتاح خام) |
| BN | **Khams Djouamaa**-এ আজকের নামাজের সময় | لا names.bn في المصدر → proper-noun en (لا كسر/لا مفتاح خام) |

(UR/BN تعرضان اللاتينيّ لأنّ Nominatim لم يوفّر اسمًا أرديًّا/بنغاليًّا لهذه المدينة؛ لا نخترع — والصفحة noindex. لو وُفِّر `names.ur/bn` لاحقًا في المصدر، يظهر تلقائيًّا.)

## 10) نتائج regression + السموك

- **سموك التذكرة (ذاتيّ-الاكتفاء):** **18/18 ✓** (AR=خمس جوامع في title/H1/bc/JSON-LD/seed · EN/FR لاتينيّ · UR/BN لا كسر · NEEDS_AR_NAME لا تسرّب names.en · noindex ثابت · makkah index,follow).
- **carry-forward (خادم 8080 افتراضيّ بلا بذرة):** `_test_place_by_slug` **44/0** · `_test_place_names_cross_page_navigation_consistency_fix_1` **28/0** · `_test_place_names_homepage_default_city_l10n_fix_1` **33/0** · `_test_search_merge` **15/0** = **120/120**.
- **تخطّي:** `_test_search_place_endpoint` (يحتاج Nominatim خارجيّ — الشبكة محجوبة في بيئة التطوير؛ قيد بيئيّ، لا علاقة له بالتغيير).
- **regression صفحات:** `/prayer-times-in-{riyadh,chefchaouen,uray-irah,al-ajfar,morocco}` · `/` · `/qibla` · `/moon-in-riyadh` · `/azkar` · `/msbaha` → كلّها **200 · H1=1** · أسماء عربيّة سليمة (الرياض/شفشاون/عريعرة/الأجفر).
- `node --check server.js` سليم · 0 أسطر debug متبقّية.

## 11) إفصاح — بذرة اختبار inert في الإنتاج

أضفتُ في `server.js` **بذرة اختبار** (`_DISCOVERED_SSR_TEST_ROWS` + فرع `else if`): تُقرأ **فقط** حين `Supabase معطّل` **و**`process.env.DISCOVERED_SSR_TEST_FIXTURE` مضبوط. في الإنتاج `_SUPABASE_ENABLED=true` فيُنفَّذ فرع Supabase الحقيقيّ ولا يُبلَغ فرع البذرة أبدًا — **خامل تمامًا**. ضرورتها: لا سبيل لاختبار مسار discovered محلّيًّا (Supabase معطّل في dev)؛ هي مسار اختبار-render، ليست search pipeline. (إن رغبت بإزالتها أُزيلها وأكتفي بالتحقّق اليدويّ، لكنّها تحمي من الانحدار مستقبلًا.)

## 12) رسالة commit المقترحة (المعتمدة منك)

```
fix(discovered): DISCOVERED-CITY-SSR-NAME-RESOLUTION-FIX-1 — use discovered names in city SSR metadata
```
الالتزام = `server.js` + `scripts/_smoke_…fix_1.mjs` + هذا التقرير (3 ملفّات، معزولة).

---
**الخلاصة:** صفحات المدن المُكتشَفة تعرض الآن الاسم المحلّيّ المحفوظ (`names[lang]`) في title/meta/H1/breadcrumb/JSON-LD/body — لكلّ اللغات ذات الاسم المحلّيّ — عبر مُحلِّل discovered async + كاش، ببوّابة `hasNativeName` (NEEDS_AR_NAME محميّ، بلا تسرّب لاتينيّ، بلا اختراع). الصفحات تبقى **noindex**، curated بلا مساس، **بلا runtime translation**. 18/18 سموك + 120/120 regression.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITY-SSR-NAME-RESOLUTION-FIX-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
