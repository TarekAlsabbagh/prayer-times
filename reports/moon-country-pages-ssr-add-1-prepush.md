# MOON-COUNTRY-PAGES-SSR-ADD-1 — PRE-PUSH REPORT

**التاريخ:** 2026-06-17. **الحالة:** نُفِّذ **محليًّا فقط** — **لم يُدفَع**. بانتظار اعتمادك: `أعتمد دفع تقرير: MOON-COUNTRY-PAGES-SSR-ADD-1` + «أوافق على تنفيذ الدفع».
**رسالة الـ commit المقترحة:**
```
feat(moon): MOON-COUNTRY-PAGES-SSR-ADD-1 — add country-level moon pages using existing country city grid
```

---

## 0) ملخّص

أضفت صفحات دولة قمريّة على المسار **`/moon/{country}`** (مثال `/moon/saudi-arabia`) للدول التي لها مدن curated. الصفحة تعيد استعمال **نفس قالب شبكة مدن الدولة** (`prayer-times-cities.html`) عبر **variant=moon** مُمرَّر من السيرفر — بحيث تبقى صفحة الصلاة `prayer-times-in-{country}` **مطابقة بايتًا** عند غياب العلَم، بينما صفحة القمر تستبدل كل النصوص بمحتوى القمر، وتوجّه البطاقات والبحث إلى **روابط المدن القائمة** `/moon-today-in-{city}`. لم تُضَف أيّ روابط مدن متداخلة، ولا أيّ redirects، ولم يُمَسّ `/moon` ولا `/moon-today` ولا محرّك Meeus 49.

---

## 1) الالتزام بالسياج (ما الذي لم يُمَسّ)

| القيد | الحالة |
|---|---|
| لا `/moon/{country}/{city}` ولا `…/today` ولا `…/{yyyy-mm}` ولا `…/{yyyy-mm-dd}` | ✅ كلّها **404 نظيف** (مُثبَت) |
| لا تغيير روابط المدن الحاليّة (`/moon-today-in-*`, `/moon-in-*[/date]`) | ✅ غير ممسوسة (نُعيد استعمالها كأهداف فقط) |
| لا redirects جديدة | ✅ صفر redirects أُضيفت |
| لا تغيير `/moon` | ✅ 200، نفس المحتوى (مُثبَت 204,745 بايت) |
| لا تغيير `/moon-today` | ✅ ما زالت 301 → `/moon` |
| لا تغيير محرّك Meeus 49 | ✅ `js/moon.js` **لم يُمَسّ** (15=المحاق · 30=البدر) |
| لا تغيير prayer/hijri/countdown/azkar/qibla/discovered | ✅ لا تغيير سلوكيّ (regression أخضر) |
| تنفيذ محليّ فقط، لا دفع | ✅ لم يُدفَع |

**الملفّات غير المتتبَّعة (652):** لم أُدخِل أيًّا منها في أيّ staging. خطّة الـ commit أدناه تضيف **5 ملفّات فقط** صراحةً.

---

## 2) الملفّات المتغيِّرة (4 معدَّلة متتبَّعة + 1 جديد)

| الملفّ | التغيير |
|---|---|
| **`server.js`** (+236) | `_MOON_COUNTRY_SEO_L10N` + `_buildMoonCountrySeoContent()`؛ فرع `moonCountryListing` في `buildSeoForPath` (title/desc/canonical/breadcrumbs/robots)؛ Place `#country` في الـ graph؛ فرع dispatch لِـ `/moon/{country}` (+10 لغات) يخدم قالب المدن؛ حقن SSR (علَم variant، H1، subtitle، page-title، محتوى+FAQ، مسار breadcrumb)؛ فرع `_getActiveH1Marker`؛ حلقة sitemap للقمر |
| **`prayer-times-cities.html`** (+76/-?) | قراءة `__COUNTRY_PAGE_VARIANT`؛ `_cityHref()` → `/moon-today-in-`؛ توجيه البطاقات+البحث+القائمة الذكيّة؛ `targetRoute:'moon-hub'`؛ breadcrumb وheader وتسمية البطاقات قمريّة عند الـ variant — وإلّا **مطابقة** للصلاة |
| **`scripts/_smoke_moon_country_pages_ssr_add_1.mjs`** (جديد، 103 سطر) | اختبار جديد (36 تحقّق) |
| **`scripts/_smoke_moon_routes_structure_guardrails_1.mjs`** (+25/-?) | تحديث PART E/F: `/moon/{country}`=200، المتداخلة=404، sitemap |
| **`reports/moon-routes-structure-contract-1.md`** (+10/-?) | نقل `/moon/{country}` من «مستقبليّ 404» إلى «LIVE 200» |

`node --check server.js` ✅ · `node --check` الاختبارَين ✅.

---

## 3) مطابقة بنود المواصفة (1→18)

| # | البند | الإثبات |
|---|---|---|
| 1 | 200 لِدولة لها مدن + SSR-visible | ✅ `/moon/saudi-arabia`=200، الجسم 214,263 بايت (ليس footer-only) |
| 2 | H1 واحد، ليست footer-only، بلا أخطاء console | ✅ H1=1؛ المتصفّح: 26 بطاقة، 6 أقسام + 6 FAQ، **صفر أخطاء console** |
| 3 | canonical ذاتيّ | ✅ `…/moon/saudi-arabia` (و`…/en/moon/saudi-arabia`) |
| 4 | index عند وجود مدن | ✅ `robots: index,follow,max-snippet…` (لا noindex) |
| 5 | داخل sitemap | ✅ `…/moon/saudi-arabia` + `…/en/moon/saudi-arabia` (لا المتداخلة) |
| 6 | بطاقات → `/moon-today-in-{city}`، تسمية «قمر اليوم في {city}» / «Moon Today in {city}» | ✅ المتصفّح: 26 بطاقة → `/moon-today-in-{city}`؛ بحث «جدة» → `/moon-today-in-jeddah` |
| 7 | إعادة استعمال بنية شبكة الدولة (breadcrumb/هيرو/عدّاد/بحث/شبكة/ترقيم/أقسام/FAQ) | ✅ نفس القالب، variant قمر |
| 8 | كل النصوص قمريّة | ✅ title/desc/og/twitter/H1/subtitle/breadcrumb/أقسام/FAQ/JSON-LD = **قمر**؛ 0 «prayer-times» في الـHTML المرئيّ؛ «مواقيت الصلاة» الظاهرة (5) = **هويّة الموقع والتنقّل العامّ فقط** (اسم العلامة في og:site_name/الترويسة/التذييل + رابط تنقّل «مواقيت الصلاة» + زرّ الموقع المشترك) — موجودة على **كل** صفحات الموقع بما فيها صفحات القمر |
| 9 | إعادة استعمال شبكة مدن الدولة القائمة | ✅ `prayer-times-cities.html` + `#country-cities-data` + variant |
| 10 | H1 «مراحل القمر في {Country}» / «Moon Phases in {Country}» | ✅ `مراحل القمر في المملكة العربية السعودية` / `Moon Phases in Saudi Arabia` |
| 11 | Title مع fallback حسب الطول | ✅ AR (base+suffix ≈66>62) → الأساس `مراحل القمر في {C}`؛ EN (≈58≤62) → الكامل `Moon Phases in {C} — Today's Moon & Lunar Calendar` |
| 12 | 5 أقسام + 6 FAQ + FAQPage JSON-LD | ✅ 6 عناوين H2 محتوى + 6 أسئلة `<details>`؛ كتلة `"@type":"FAQPage"` (6 Question/Answer)، **بلا تسريب صلاة** |
| 13 | hreflang 10 لغات + x-default | ✅ 11 وسمًا: ar/en/fr/tr/ur/de/id/es/bn/ms + **x-default→ar** (بلا بادئة) |
| 14 | تحقّق: صالح+مدن→200 index؛ مجهول→404؛ معروف-بلا-مدن→لا صفحة هزيلة | ✅ `/moon/zzz-not-a-country`→404؛ الشرط `_curatedCitiesForCc(cc).length>0` يمنع الصفحة الهزيلة (دولة بلا مدن لا تُخدَم) |
| 15 | تحديث guardrails: `/moon/saudi-arabia`=200 والمتداخلة تبقى 404 | ✅ حُدِّث الاختبار + عقد البنية |
| 16 | القيود الثابتة | ✅ القسم 1 أعلاه |
| 17 | إضافة/تحديث smoke tests | ✅ اختبار جديد 36/36 + guardrails محدَّث 70/70 |
| 18 | تقرير pre-push | ✅ هذا الملفّ |

**ملاحظة بنيويّة (مثل صفحة الصلاة):** صفحة الدولة **قالب مستقلّ** (`prayer-times-cities.html`)، **ليست** نظام SPA `#page-*`؛ لذا «`#page-moon` active» لا ينطبق هنا — الصفحة تَعرض هيروها وH1 ومحتواها القمريّ مباشرةً (تمامًا كما صفحة الصلاة قالب مستقلّ بلا `#page-prayer-times`). مُصنِّف `_isMoonPath` في الـSPA يعرف `/moon/{country}` (للملاحة الداخليّة)، لكنّ الصفحة المخدومة هي القالب المستقلّ.

---

## 4) نتائج الاختبارات

### الاختبار الجديد — `_smoke_moon_country_pages_ssr_add_1.mjs`
✅ **36/36**: 200 + H1 واحد قمر + canonical ذاتيّ + index + علَم variant + بيانات الشبكة + بحث + 5 أقسام + 6 FAQ + FAQPage + breadcrumb القمر + ليست footer-only؛ EN H1+canonical+hreflang؛ المتداخلة 404×4 + دولة مجهولة 404؛ regression صفحة الصلاة (لا علَم، محتوى صلاة سليم، لا محتوى قمر)؛ `/moon`=200، `/moon-today`=301، Meeus 15/30؛ sitemap.

### الحُرّاس المحدَّثة — `_smoke_moon_routes_structure_guardrails_1.mjs`
✅ **70/70** (كانت 64؛ +6 لِـ `/moon/{country}`=200 + دولة مجهولة 404 + قواعد sitemap الجديدة). PART E الآن: `/moon/saudi-arabia`=200 (H1 قمر، canonical ذاتيّ، index، ليست footer-only) + المتداخلة 404. PART F: sitemap فيه `/moon/{country}`، ليس فيه المتداخلة.

### regression (سياق التذكرة: server.js routing/SSR + قالب الدولة)
| الاختبار | النتيجة |
|---|---|
| moon-today-content-move | ✅ 34/34 |
| moon-spa-router (مُصنِّف) | ✅ 36/36 |
| navbar-city-context | ✅ 59/59 |
| navbar-new-tab-real-href | ✅ 39/39 |
| sidenav-consistency (القالب) | ✅ 90/90 |
| discovered-noindex | ✅ 39/39 |
| discovered-city-ssr-name | ✅ 18/18 |
| Meeus49 (engine) | ✅ 45/45 |
| moon-calendar-grid | ✅ 212/212 |
| hijri-tz | ✅ ALL |
| countdown-seo | ⚠️ flaky (انظر §5) |

---

## 5) إفصاح: اختبار countdown متذبذب — **سابق لتغييري**

`_smoke_hijri_new_year_countdown_seo_content_h1_fix_1.mjs` يتذبذب على تحقّق واحد: **`eid-al-fitr-countdown es/ … FAQPage JSON-LD … text matches visible`**.

**إثبات أنّه سابق وليس بسببي:** خبّأتُ ملفّيّ التشغيل (`server.js` + `prayer-times-cities.html`) عبر `git stash` وأعدتُ تشغيل نفس الاختبار **على HEAD النظيف** ×8 → **فشل 2/8 على نفس التحقّق بالضبط**. ثمّ `git stash pop`. تغييري كلّه محصور خلف `seo.moonCountryListing` / regex `/moon/{country}` — لا يَلمس مسار صفحة عدّ Eid al-Fitr الإسبانيّة إطلاقًا. (التذبذب على الأرجح حساسيّة وقت في «النصّ المرئيّ = نصّ JSON-LD» للعدّ التنازليّ.) **يُوصى بتذكرة مستقلّة لإصلاح هذا الاختبار** خارج نطاق هذه التذكرة.

---

## 6) التحقّق في المتصفّح (مكتمل، ناجح)

`/moon/saudi-arabia`: variant=moon · H1 «مراحل القمر في المملكة العربية السعودية» · breadcrumb الرئيسية›القمر›المملكة العربية السعودية · 26 بطاقة (من 187) → `/moon-today-in-{city}` بتسمية «قمر اليوم في {city}» · العدّاد «187 منطقة / مدينة» (بلا نصّ صلاة) · 6 أقسام H2 + 6 FAQ · **صفر أخطاء console** · بحث «جدة» → نتيجة واحدة «قمر اليوم في جدة» → `/moon-today-in-jeddah`. وصفحة الصلاة `/prayer-times-in-saudi-arabia`: variant=prayer · بطاقات «مواقيت الصلاة في {city}» → `/prayer-times-in-{city}` · **دون تغيير**.

---

## 7) خطّة الـ commit (5 ملفّات صراحةً — لا شيء من الـ652)

```
git add server.js \
        prayer-times-cities.html \
        scripts/_smoke_moon_country_pages_ssr_add_1.mjs \
        scripts/_smoke_moon_routes_structure_guardrails_1.mjs \
        reports/moon-routes-structure-contract-1.md \
        reports/moon-country-pages-ssr-add-1-prepush.md
git commit -m "feat(moon): MOON-COUNTRY-PAGES-SSR-ADD-1 — add country-level moon pages using existing country city grid"
```
(لا cache-buster: لم يتغيّر `app.js`/`css`/`sw.js`؛ القالب يُخدَم طازجًا.)

---

## 8) ماذا بعد الاعتماد

عند اعتمادك أدفع إلى `origin/main`، أنتظر نشر Render (~200-400ث)، ثمّ أُجري تحقّق ما بعد الدفع على الإنتاج (PowerShell) وأكتب تقرير post-push. **بعد هذا التقرير أتوقّف**: لن أبدأ `/moon/{country}/{city}` ولا `…/today` ولا تطوير محتوى `/moon` ولا أيّ تذكرة أو صفحة أذكار أخرى قبل إغلاقك الرسميّ لهذه التذكرة وطلبك التالي.

---

## 9) تعديل بطلبك (2026-06-17): إزالة مربع بحث الـHero من `/moon/{country}`

**الطلب:** لا نريد مربع البحث **داخل الـHero العلوي** في صفحة الدولة القمريّة — يبقى خاصًّا بصفحة `/moon` العامّة فقط. أمّا بحث **مدن الدولة** فوق الكروت فيبقى.

**ما نُفِّذ (الحدّ الأدنى الإلزامي فقط):** سطر واحد في `server.js` داخل كتلة `if (seo.moonCountryListing)` (المحصورة بصفحات `/moon/{country}` فقط) يحذف من الـSSR غلاف بحث الـHero بالكامل:
```js
html = html.replace(/<label[^>]*\bloc-hero-search-wrap\b[^>]*>[\s\S]*?<\/label>/, '');
```
يُزيل `<label class="loc-hero-search-wrap">` ومعه `#search-input` و`#cities-suggestions`. لا CSS، لا تغيير في القالب، لا cache-buster. صفحة الصلاة (`seo.countryListing`) و`/moon` SPA لا تمرّان بهذه الكتلة ⇒ **بحث الـHero فيهما دون تغيير**. لا أخطاء console بعد hydration (الـwiring المتبقّي null-guarded، والمثيل يُبنى lazily داخل `onSearch()` التي لا تُستدعى بلا إدخال).

**إجابات أسئلتك الستّة:**
| السؤال | الإجابة |
|---|---|
| هل أُزيل Hero search من `/moon/{country}`؟ | ✅ نعم — `#search-input` و`<label class="loc-hero-search-wrap">` غير موجودَين في SSR ولا بعد hydration |
| هل بقي Country city search فوق الكروت؟ | ✅ نعم — `#country-city-filter` موجود ويعمل (مقيَّد بمدن الدولة) |
| هل بقيت الصفحة 200؟ | ✅ نعم — H1 «مراحل القمر في {Country}» + النص التعريفي + العدّاد «187 منطقة / مدينة» ظاهرة، ليست footer-only |
| هل بقيت الكروت/البحث/الـFAQ؟ | ✅ 26 بطاقة → `/moon-today-in-{city}` بتسمية «قمر اليوم في {city}» · 6 FAQ · بحث الدولة يعمل |
| هل احتجتُ CSS/server.js/template؟ | **server.js فقط** (سطر واحد + تعليق). لا CSS، لا template، لا cache-buster |
| نتائج smoke/regression | الاختبار الجديد **39/39** (+تحقّق «لا Hero search» + «الصلاة تحتفظ به») · guardrails **70/70** · navbar-city-context **59/59** · sidenav **90/90** · moon-hub **34/34** |

**تقييم عناصر الـHero الأخرى (بند 5 — لم أحذفها، الحدّ الأدنى = مربّع البحث فقط):** بقيت داخل `.loc-hero-hero-actions` ثلاثة عناصر هي **منطق صفحة `/moon`/الرئيسيّة العامّة** أكثر من صفحة الدولة:
1. **زر الموقع** `#loc-hero-geo-btn`: نصّه «عرض **مواقيت الصلاة** في موقعي الآن» (تسريب «صلاة» على صفحة قمر) ووظيفته `detectLocation()` تنقل إلى **الصفحة الرئيسيّة** `/?detect=1` (تغادر صفحة الدولة).
2. **زر «اختر مدينتك يدويّاً»** `#loc-hero-pick-btn`: كانت وظيفته الأصليّة تركيز مربّع البحث المحذوف؛ الآن (null-guarded) يكتفي بالتمرير إلى شبكة المدن — تسميته صارت مضلِّلة قليلًا دون مربّع بحث.
3. **microcopy + شارات GPS** (`#loc-hero-geo-microcopy` + `#loc-hero-hero-badges`): تصف تدفّق تحديد الموقع أعلاه.

**توصيتي + سؤالي لك:** هذه الثلاثة ليست «غير منطقيّة» تمامًا بعد إزالة مربّع البحث (الزرّ الجغرافيّ يعمل مستقلًّا)، لذا **أبقيتها** التزامًا بالحدّ الأدنى. لكنّها تحمل نصّ «صلاة» وتنقل خارج صفحة الدولة. **هل تريد أن أُزيل أيضًا** زرّ «اختر مدينتك يدويّاً» وحده (الأوضح ارتباطًا بالبحث المحذوف)، أم كامل كتلة `.loc-hero-hero-actions` (الزرّ الجغرافيّ + microcopy + الشارات) لِهيرو نظيف (H1 + تعريف + عدّاد فقط)؟ سطر/سطران إضافيّان عند تأكيدك — قبل الدفع.

**الملفّات في هذا التعديل:** `server.js` (+11) و`scripts/_smoke_moon_country_pages_ssr_add_1.mjs` (تحديث التحقّقات) — كلاهما ضمن قائمة `git add` في §7. لم يُمَسّ شيء آخر. **لم أدفع ولم أعمل commit.**

---

# MOON-COUNTRY-PAGES-SSR-ADD-1 — PRE-PUSH UPDATE (إثراء SEO + حالة القمر، 2026-06-17)

تعديل ثانٍ بطلبك: جعل `/moon/{country}` صفحة قمر احترافية للـSEO — حذف CTA الصلاة من الـHero، تغيير Breadcrumb إلى «حالة القمر»، وإضافة محتوى قمريّ محسوب. **نُفِّذ محليًّا فقط — لا commit ولا push.** HEAD ما زال `9b4f46f`.

| سؤالك | الإجابة |
|---|---|
| هل أُزيل Hero search من `/moon/{country}`؟ | ✅ نعم — وكامل كتلة `.loc-hero-hero-actions` (search + الأزرار + الشارات) غير موجودة في SSR ولا بعد hydration |
| هل أُزيل أي CTA متعلق بمواقيت الصلاة من محتوى صفحة القمر؟ | ✅ نعم — زر «عرض مواقيت الصلاة في موقعي الآن» (`#loc-hero-geo-btn`) حُذف؛ المتصفّح: `geoBtnPresent=false`، صفر «عرض مواقيت الصلاة في موقعي» في الصفحة |
| هل أصبح Breadcrumb «الرئيسية > حالة القمر > {Country}»؟ | ✅ نعم — DOM: `الرئيسية › حالة القمر › المملكة العربية السعودية` (EN: `Home › Moon Phase › Saudi Arabia`) |
| هل BreadcrumbList JSON-LD مطابق للـDOM؟ | ✅ نعم — مُثبَت بالمتصفّح: JSON-LD = `الرئيسية(/) › حالة القمر(/moon) › السعودية(/moon/saudi-arabia)` — نفس النصّ والروابط بالضبط (مصدر تسمية واحد `_MOON_PHASE_CRUMB_L10N`)؛ وعلى EN: `Moon Phase → /en/moon` في الاثنين |
| هل رابط «حالة القمر» يذهب إلى `/moon`؟ | ✅ نعم (`/en/moon` على الإنجليزيّة عبر تمرير اللغة الموجود) |
| هل بقي Country city search فوق الكروت؟ | ✅ نعم — `#country-city-filter` يعمل؛ بحث «جدة» → نتيجة واحدة «قمر اليوم في جدة» → `/moon-today-in-jeddah` (داخل الدولة فقط) |
| ما الأقسام الجديدة/المحسّنة؟ | بطاقة ملخص القمر · عنوان «قمر اليوم في مدن {C}» فوق الكروت · أهم مراحل القمر القادمة · تقويم القمر الشهري حسب المدينة (روابط) · 3 أقسام تعليميّة (الحساب الفلكي/رؤية الهلال/اختلاف المدن) · FAQ من 6 → **8** أسئلة |
| هل أُضيفت بطاقة ملخص القمر؟ | ✅ نعم — 4 بطاقات محسوبة بـ MoonCalc (Meeus 49) على التوقيت المرجعي للدولة: مرحلة اليوم (هلال متزايد) · الإضاءة (8%) · البدر القادم (30 يونيو 2026) · المحاق القادم (14 يوليو 2026) + ملاحظة «بيانات مرجعية عامة، اختر مدينتك لنتيجة أدقّ» |
| هل أُضيف قسم أهم مراحل القمر القادمة؟ | ✅ نعم — 4 أحداث محسوبة: المحاق 14 يوليو · التربيع الأول 22 يونيو · البدر 30 يونيو · التربيع الأخير 7 يوليو + ملاحظة اختلاف منتصف الليل |
| هل أُضيف قسم تقويم القمر حسب المدينة؟ | ✅ نعم — روابط لأهم 8 مدن → `/moon-in-{city}` (الروابط القديمة) |
| هل تم تحسين FAQ؟ | ✅ نعم — **8 أسئلة** مرئيّة SSR (`.country-faq-item`) شاملة «هل يعتمد الموقع على API خارجي؟» |
| هل FAQPage JSON-LD مطابق للنص الظاهر؟ | ✅ نعم — 8 أسئلة، والمتصفّح أكّد `faqLdMatchesVisible=true` (نفس Q/A للمرئيّ والـJSON-LD) |
| هل روابط المدن ما زالت قديمة؟ | ✅ نعم — الكروت → `/moon-today-in-{city}`، روابط التقويم → `/moon-in-{city}`؛ **صفر** روابط `/moon/{country}/{city}` |
| نتائج الاختبارات | الجديد **55/55** · guardrails **70/70** · navbar-city **59/59** · sidenav **90/90** · moon-hub **34/34** · **Meeus49 45/45 (المحرّك دون تغيير)** · moon-calendar **212/212** · hijri-tz ALL · discovered-noindex **39/39** · `node --check` سليم · **صفر console errors** |
| هل تم تعديل CSS؟ | فقط داخل `<style>` المضمّن في `prayer-times-cities.html` (أصناف `.mc-*` تظهر على صفحات القمر فقط) — **لا تغيير في `css/style.css`** |
| هل تم تعديل SW/cache-busters؟ | ❌ لا — لا `sw.js`، لا cache-buster (القالب يُخدَم طازجًا؛ لم يتغيّر `app.js`/`css`) |
| قائمة الملفّات المعدّلة | `server.js` (+382) · `prayer-times-cities.html` (+97، يشمل CSS) · `scripts/_smoke_moon_country_pages_ssr_add_1.mjs` (الاختبار) · `scripts/_smoke_moon_routes_structure_guardrails_1.mjs` + `reports/moon-routes-structure-contract-1.md` (من التعديلات السابقة) — **لا `css/style.css`، لا `sw.js`، لا `js/app.js`، لا `js/moon.js`** |

## آلية الحساب (إثبات عدم لمس Meeus 49)
القيم المحسوبة تستدعي **`MoonCalc` المُحمَّل أصلًا** (`require('./js/moon.js')`) للقراءة فقط: `getDayPhase/getMoonIllumination` + `getNextNewMoon/getNextFirstQuarter/getNextFullMoon/getNextLastQuarter` (Meeus 49)، على `_CC_TO_PRIMARY_TZ[cc]`. **`js/moon.js` لم يُمَسّ** (regression Meeus49 45/45؛ guardrail الرياض 15=المحاق · 30=البدر سليم). إذا تعذّر MoonCalc لأي سبب، تُحذف بطاقتا الملخص/القادمة بأمان ويبقى باقي المحتوى.

## الترتيب البصريّ النهائيّ (مُثبَت بالمتصفّح على `/moon/saudi-arabia`)
1) Breadcrumb «الرئيسية › حالة القمر › السعودية» → 2) H1 + وصف + عدّاد (بلا بحث، بلا CTA صلاة) → 3) بطاقة ملخص القمر → 4) بحث مدن الدولة → 5) عنوان «قمر اليوم في مدن…» + 26 كرت → 6) أهم المراحل القادمة → 7) تقويم القمر حسب المدينة → 8) 3 أقسام تعليميّة → 9) FAQ (8). H1=1 · canonical ذاتيّ · index · hreflang 11 (10+x-default) · صفر console errors · ليست footer-only.

## الثوابت (دون مساس)
`/moon` · `/moon-today` (301) · `/moon-today-in-{city}` · `/moon-in-{city}[/date]` · `/moon/{country}/{city}[/…]` (404 نظيف) · Meeus 49 · prayer/hijri/countdown/azkar/qibla/discovered — كلّها regression أخضر. صفحة الصلاة `/prayer-times-in-{country}` تحتفظ ببحث الـHero وزر الموقع (مُثبَت).

**لم أدفع، ولم أعمل commit، ولن أبدأ أيّ تذكرة جديدة قبل مراجعتك.** بانتظار قرارك ثمّ اعتماد الدفع.

---

# MOON-COUNTRY-PAGES-SSR-ADD-1 — PRE-PUSH UPDATE (إصلاح Hero + المسافات الجانبية، 2026-06-17)

تعديل بصريّ/layout بطلبك على `/moon/{country}`. **لا commit ولا push.** HEAD ما زال `9b4f46f`.

## التشخيص (السبب الجذريّ — بند خامسًا)
المشكلتان كلتاهما ناتجتان عن **إعادة استعمال قالب صفحة الصلاة مباشرةً بفراغات لا تناسب صفحة القمر** بعد إزالة عناصر الـHero:
1. **الفراغ الرأسيّ** = `min-height` محجوز للـHero: `#location-hero:not(.loc-hero-collapsed){ min-height:580px (موبايل) / 470px (سطح المكتب) }` (حجز CLS ضدّ تبدّل خطّ Cairo، مُصمَّم للهيرو الكامل بالبحث + CTA + الشارات). بعد إزالتها بقي الحجز ⇒ **276px فراغ** أسفل العدّاد. (ليست padding ولا margin.)
2. **انعدام المسافات الجانبيّة** = `.main-content{ padding:0 }` + عناصر المحتوى تمتدّ full-bleed لأنّ `.main-content` عبارة عن **flex column** (`display:flex;flex-direction:column`)، فالأطفال يتمدّدون لكامل العرض دون عمود محتوًى محدود. (مشكلة container width، ليست padding فقط.)

## الحلّ (الأنظف، لا workaround)
علامة واحدة `moon-country-layout` على `<main>` (variant القمر فقط، سطر server واحد) تقود قاعدتين CSS داخل `<style>` المضمّن في القالب:
- **(أ) هيرو مدمج:** `.moon-country-layout #location-hero{ min-height:auto }` — تُلغي الحجز على صفحة الدولة فقط (بلا استعارة سلوك `.loc-hero-collapsed` التفاعليّ المخصَّص لصفحات المدن).
- **(ب) عمود محتوًى محدود متمركز:** للعناصر (breadcrumb/hero/summary/search/heading/cards/seo): `width: min(1080px, 100% - 48px); align-self:center` — عرض موحَّد متمركز بفجوات جانبيّة ≥24px في كلّ العروض. استُعمل `align-self:center` (الطريقة الأصليّة في flexbox) بدل `margin-inline:auto` الذي يُقلّص عنصر flex إلى عرض المحتوى. الـnavbar (.top-header) + التذييل يبقيان full-bleed (chrome الموقع).

| سؤالك | الإجابة |
|---|---|
| هل قُلِّل فراغ الـHero؟ | ✅ نعم — ارتفاع الهيرو **470px → 216px** (الفراغ أسفل العدّاد 276px → 22px) |
| ما الذي عُدّل بالضبط؟ | **min-height** (إلغاء الحجز على صفحة الدولة) + **container width** (عمود `width:min(1080px,100%-48px)` متمركز). **لا** padding/margin/grid-spacing تغيّرت |
| مسافات جانبيّة صحيحة في Hero/search/cards/sections/FAQ؟ | ✅ نعم — جميعها بعرض **1080px** متمركز بفجوات متناظرة (مُقاس بالمتصفّح: 238px على شاشة عريضة، ≥24px على اللابتوب)، **محاذاة موحّدة** للحواف اليمنى واليسرى |
| أقرب بصريًا إلى prayer-times-in-{country}؟ | ✅ نفس البنية/الإيقاع، لكن **محتوى محدود بفجوات** بدل full-bleed (تحسين متعمّد حسب طلبك للمسافات؛ صفحة الصلاة تبقى full-bleed دون مساس) |
| CSS فقط أم server/template؟ | **template (CSS مضمّن) + سطر server واحد** (حقن علامة `moon-country-layout` على `<main>` لـvariant القمر فقط). **لا تغيير في `css/style.css`** |
| نتائج smoke/regression | الجديد **58/58** · guardrails **70/70** · sidenav **90/90** · navbar-city **59/59** · moon-hub **34/34** · **Meeus49 45/45** · moon-calendar **212/212** · hijri-tz ALL · discovered-noindex **39/39** · `node --check` سليم · **صفر console errors** |
| SW/cache-busters؟ | ❌ لا — لا `sw.js`، لا cache-buster (القالب يُخدَم طازجًا؛ `app.js`/`css/style.css` دون تغيير) |
| الملفّات المعدّلة | `server.js` (+1 سطر علامة) · `prayer-times-cities.html` (قاعدتا CSS في `<style>` المضمّن) · `scripts/_smoke_moon_country_pages_ssr_add_1.mjs` (تحقّقات العلامة). **لا `css/style.css`، لا `sw.js`، لا `js/app.js`، لا `js/moon.js`** |

**ثوابت لم تُمَسّ:** المحتوى والروابط والـSEO والبحث الوظيفيّ وbreadcrumb/JSON-LD وMeeus 49 وguardrails — كلّها كما هي (التعديل layout بحت). صفحة الصلاة و`/moon` العامّة دون تغيير (مُثبَت: الصلاة بلا علامة `moon-country-layout`).

**لم أدفع ولم أعمل commit.** بانتظار مراجعتك ثمّ اعتماد الدفع.

---

## §12 — توحيد قسم المدن في بوكس واحد (بطلبك، 2026-06-17)

الطلب: العناصر الثلاثة (بحث مدن الدولة + العنوان «قمر اليوم في مدن {C}» + كروت المدن) يجب أن تكون **داخل بوكس/قسم واحد** بدل ثلاثة كروت منفصلة.

**التنفيذ (layout فقط):** في حقن variant القمر (server)، تُلَفّ العناصر الثلاثة داخل `<section class="mc-cities-box">` واحد بالترتيب: **العنوان ← البحث ← شبكة الكروت**. وفي CSS المضمّن: `.mc-cities-box` بطاقة واحدة (خلفية/ظلّ/زوايا/padding من نفس design tokens)، والكرتان الداخليّتان (`.cities-search-card` / `.cities-main-card`) تتجرّدان من خلفيّتهما/ظلّهما/padding فتُقرأ الثلاثة كقسم واحد موحَّد.

**التحقّق بالمتصفّح:** أبناء `.mc-cities-box` = `[h2.mc-cities-heading, div.cities-search-card, div.cities-main-card]` ✓ · البوكس بطاقة واحدة (bg أبيض، ظلّ، radius 12px، padding 20px) ✓ · الكرتان الداخليّتان بلا chrome ✓ · البحث داخل البوكس يعمل («الرياض» → نتيجة واحدة → `/moon-today-in-riyadh`) ✓ · صفر console errors ✓ · الروابط القديمة `/moon-today-in-{city}` كما هي ✓.

**الاختبارات بعد التوحيد:** الجديد **58/58** · guardrails **70/70** · sidenav **90/90** · navbar-city **59/59** · moon-hub **34/34** · `node --check` سليم.

**الملفّات:** `server.js` (لفّ البوكس) + `prayer-times-cities.html` (CSS البوكس) — **لا `css/style.css`، لا `sw.js`، لا cache-buster**. لا تغيير في المحتوى/الـSEO/الروابط. **لم أدفع ولم أعمل commit.**

---

## §13 — محاذاة عرض الأقسام السفليّة مع بوكس المدن (بطلبك، 2026-06-17)

الطلب: عرض `#country-seo-content` (الأقسام السفليّة: المراحل القادمة + التقويم الشهري + الأقسام التعليميّة + FAQ) = عرض `.mc-cities-box`.

**التشخيص:** `#country-seo-content` نفسه كان بالفعل 1080px (= البوكس)، لكنّ غلافه الداخليّ `.country-seo-wrap` كان مقيَّدًا بـ`max-width: 900px` (قاعدة مشتركة في `<style>` القالب) فظهرت الأقسام أضيق بـ90px من كلّ جانب.

**الإصلاح (CSS سطر واحد، layout فقط):** `.moon-country-layout #country-seo-content .country-seo-wrap { max-width: none; }` — يُلغي قيد 900px **على صفحات القمر فقط**، فتملأ الأقسام عرض 1080px وتُحاذي بوكس المدن. صفحات الصلاة تبقى 900px دون مساس.

**التحقّق بالمتصفّح:** `.mc-cities-box` و`.country-seo-wrap` كلاهما **L=238، w=1080** ⇒ `sameLeft / sameRight / sameWidth = true` ✓ · صفر console errors ✓.

**الاختبارات:** الجديد **58/58** · guardrails **70/70** · sidenav **90/90**.

**الملفّ:** `prayer-times-cities.html` فقط (سطر CSS واحد). **لا `css/style.css`، لا `server.js`، لا `sw.js`، لا cache-buster، لا تغيير محتوى/SEO.** **لم أدفع ولم أعمل commit.**

---

## §14 — توحيد قسم الملخّص في بوكس واحد (بطلبك، 2026-06-17)

الطلب: العناصر الثلاثة داخل `.mc-summary` (العنوان «ملخص القمر في {C}» + شبكة البطاقات الأربع + ملاحظة الإخلاء) يجب أن تكون **داخل بوكس/قسم واحد**.

**الإصلاح (CSS فقط):** `.mc-summary` صار **بطاقة واحدة** (`background: var(--card-bg); border-radius; box-shadow; padding: 20px`) تحوي العنوان + الشبكة + الملاحظة. والبطاقات الأربع الداخليّة (`.mc-card`) صارت **خلايا مسطّحة** (`box-shadow: none; background: var(--bg)`) فتُقرأ كلوحة واحدة بأربع خلايا بدل بطاقات مرفوعة متفرّقة — بنفس نمط بوكس المدن.

**التحقّق بالمتصفّح:** أبناء `.mc-summary` = `[h2, .mc-summary-grid, p.mc-note]` كلّها داخل البطاقة (العنوان 20px من الأعلى، الملاحظة 20px من الأسفل، على خلفية بيضاء) ✓ · البطاقات الأربع بلا ظلّ (خلايا مسطّحة) ✓ · `.mc-summary` بعرض 1080px = بوكس المدن (محاذاة موحّدة) ✓ · صفر console errors ✓.

**الاختبارات:** الجديد **58/58** · guardrails **70/70** · sidenav **90/90**.

**الملفّ:** `prayer-times-cities.html` فقط (CSS). **لا `css/style.css`، لا `server.js`، لا `sw.js`، لا cache-buster، لا تغيير محتوى/SEO.** **لم أدفع ولم أعمل commit.**
