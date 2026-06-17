# MOON-TODAY-CONTENT-MOVE-TO-MOON-1 — PRE-PUSH REPORT

**النوع:** نقل الصفحة الرسميّة لِهب القمر (لا إعادة كتابة محتوى) — **تنفيذ محليّ فقط، لم يُعمل commit، ولم يُدفَع شيء.** بانتظار اعتمادك للدفع.
**التاريخ:** 2026-06-17. **HEAD:** `a29ea72`. النطاق: `server.js` (توجيه/SEO/sitemap/روابط) + `js/app.js` (تعرّف العميل على `/moon`) + `index.html`/`sw.js` (cache-buster) + اختبارات.

---

## 1) ما الذي تمّ تنفيذه
نُقِل هب «حالة القمر اليوم» من `/moon-today` إلى **`/moon`** كصفحة 200 رسميّة بـ **نفس المحتوى تمامًا** (لم يُعَد كتابة أيّ نصّ/قسم/تصميم). `/moon-today` صار **301 → /moon**. الآليّة المعمارية:
- **عكس التحويلة**: كانت `/moon` → 301 `/moon-today`؛ صارت `/moon-today` (+لغة +/) → 301 `/moon`.
- **`/moon` يُصبح الهب**: أُضيف `/moon` إلى `_isIndexHtmlRoute`، ووُسِّع `_isMoonTodayHub` ومُعلِّم H1 لِيطابقا `/moon`، وأُسنِد `staticPages['/moon'] = staticPages['/moon-today']` فيرث العنوان/الوصف/الـFAQ بايتيًّا، وcanonical يبقى ذاتيًّا (`origin + p` = `/moon`).
- **الروابط الداخلية العامّة**: تمريرة SSR عامّة واحدة (بعد إعادة-كتابة navbar السياقيّة، قبل تمريرة بادئة اللغة) تحوّل كلّ `href="(/lang)?/moon-today"` → `/moon` في الـHTML المُقدَّم — تغطّي navbar وبطاقات /qibla وروابط الفوتر والعدّاد والأذكار دفعةً واحدة، **دون لمس روابط المدن** `/moon-today-in-{city}` (المرساة `"` تمنع مطابقة `-in-`).
- **العميل**: `js/app.js` تعرّف على `/moon` المجرّد في 6 مواضع (تفعيل الصفحة سبق في v785؛ هنا: ربط search hero، منع تنقّل خاطئ، هدف زر القمر من الرئيسيّة، مفتاح الجلسة، فحصَي إعادة رسم).

## 2) هل /moon أصبحت 200؟ ✅ نعم
`/moon` و`/en/moon` و9 لغات → **200**، الصفحة النشطة `#page-moon` فقط، جسم 204KB (متصفّح: 5149 حرفًا داخل #page-moon — **ليس فوتر-فقط**).

## 3) هل /moon تعرض نفس محتوى /moon-today الحالي؟ ✅ نعم
نفس كتلة الـSSR للهب (`_isMoonTodayHub`) ونفس `staticPages` المُؤَلَّس: **H1 #moon-hub-h1 «حالة القمر اليوم»**، نفس بيانات حالة القمر، نفس الأقسام، **FAQPage JSON-LD موجود**، **search hero موجود ومربوط (`dataset.wired=1`)**، شبكة المدن `.moon-cities-grid` موجودة. متصفّح: 5149 حرفًا — مطابق لِلقياس السابق لِـ/moon-today.

## 4) هل لم يتم تغيير محتوى moon today؟ ✅ نعم — صفر تغيير محتوى
لم يُمَسّ أيّ نصّ/قسم/Hero/FAQ/منطق حساب/reference. التذكرة **توجيه + تعرّف** فقط؛ مصدر جسم الهب نفسه لم يتغيّر. (تعديل المحتوى مؤجَّل لِتذكرة مستقلّة كما طلبت.)

## 5) هل /moon-today أصبحت 301 إلى /moon؟ ✅ نعم (مع حفظ اللغة)
`/moon-today`→`/moon` · `/en/moon-today`→`/en/moon` · `/fr/moon-today`→`/fr/moon` · `/ur/moon-today`→`/ur/moon` · `/moon-today/`→`/moon` (كلّها 301). متصفّح: زيارة `/moon-today` ترسو على `/moon` (page-moon نشطة، H1 سليم).

## 6) H1 / title / meta / canonical
- **H1**: واحد فقط `#moon-hub-h1` = «حالة القمر اليوم».
- **title**: «حالة القمر اليوم: الطور الحالي ومراحل القمر والتقويم الهجري» (نفس عنوان moon-today الموروث).
- **meta description**: موروثة بايتيًّا من إعداد moon-today.
- **canonical**: `…/moon` (ذاتيّ) لِـ`/moon`؛ `…/en/moon` لِـ`/en/moon`؛ hreflang لِكلّ اللغات تشير إلى `…/{lang}/moon`.

## 7) هل /moon index؟ ✅ نعم
لا `noindex` (لا robots override). صفحة قابلة للفهرسة.

## 8) هل /moon موجودة في sitemap؟ ✅ نعم
`sitemap-main.xml` يُصدِر `<loc>…/moon</loc>` + 9 بدائل لغويّة (`/en/moon` … `/ms/moon`) مع hreflang عبر `bilingualUrl`.

## 9) هل /moon-today أزيلت من sitemap؟ ✅ نعم
لا يوجد `…/moon-today</loc>` (الهب المجرّد). **روابط المدن `/moon-today-in-{city}` لم تُمَسّ** في كود الـsitemap (السطر الذي يُصدرها لم يتغيّر).

## 10) هل الروابط الداخلية العامّة تحولت إلى /moon؟ ✅ نعم
عبر التمريرة العامّة: navbar الرئيسيّة → `/moon` (و`/en/moon` على الإنجليزيّة)، بطاقة «القمر اليوم» في /qibla → `/moon`، بطاقات الأدوات/الفوتر/العدّاد/الأذكار → `/moon`. تحقّق: **لا يوجد `href="/moon-today"` (هب) على الرئيسيّة، ولا تسريب `{LANG_PREFIX}`**.

## 11) هل روابط المدن القديمة لم تتغير؟ ✅ نعم
`/moon-today-in-{city}` · `/moon-in-{city}` · `/moon-in-{city}/{YYYY-MM}` · `/moon-in-{city}/{YYYY-MM-DD}` كلّها **200 + page-moon** (لا 301). navbar السياقيّة على صفحة المدينة ما زالت تشير إلى رابط المدينة (متصفّح `/moon-today-in-makkah`: navbar moon = `/moon-today-in-makkah`، **وليس** `/moon`). روابط شبكة المدن في الهب لم تتغيّر.

## 12) هل hydration لا يخفي المحتوى؟ ✅ نعم
متصفّح `/moon`: page-moon نشطة فقط، 5149 حرفًا، H1 ظاهر، search hero مربوط. **لا فوتر-فقط، لا اختفاء محتوى.** (`_deferOnMoon` مُقاد بِصنف `html.moon-today-hub-page` الذي يحقنه SSR على `/moon` الآن.)

## 13) هل لا توجد console errors؟ ✅ نعم
`preview_console_logs(level=error)` على `/moon` وعلى `/moon-today-in-makkah` → **No console logs**.

## 14) هل تم تعديل server.js؟ ✅ نعم (+56/−)
التوجيه + `_isIndexHtmlRoute` + `_isMoonTodayHub` + مُعلِّم H1 + `staticPages['/moon']` alias + sitemap + breadcrumb JSON-LD item + التمريرة العامّة لِلروابط.

## 15) هل تم تعديل app.js؟ ✅ نعم (+17/−، client-only)
6 مواضع تعرّف على `/moon` المجرّد (search hero autowire، `_alreadyOnMoon`، هدف الرئيسيّة→/moon، مفتاح الجلسة، `onMoon`، `_onMoonPage`). لا تغيير على حساب القمر.

## 16) هل تم تعديل CSS؟ ❌ لا
`css/style.css` **UNCHANGED** (تحقّق `git diff --quiet`). لا تغيير تصميم — كما طلبت.

## 17) هل تم تعديل SW/cache-busters؟ ✅ نعم (لأنّ app.js تغيّر)
`index.html`: `app.js?v=785→786` (preload + script). `sw.js`: `CACHE_VERSION v445→v446` + precache `app.js?v=786`.

## 18) قائمة الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `server.js` (+56) | توجيه عكسيّ + تعرّف `/moon` (index/hub/H1/staticPages) + sitemap + breadcrumb + تمريرة روابط عامّة |
| `js/app.js` (+17) | تعرّف العميل على `/moon` (6 مواضع) |
| `index.html` (+4) | `app.js?v=785→786` فقط (الروابط تُعالَج بالتمريرة) |
| `sw.js` (+4) | `v445→v446` + precache 786 |
| `scripts/_smoke_navbar_links_…` | تثبيت /moon + 786 |
| `scripts/_smoke_navbar_city_context_…` | هب القمر العامّ = /moon |
| `scripts/_smoke_discovered_…_noindex_…` | الهب القابل للفهرسة = /moon |
| `scripts/_smoke_hijri_new_year_countdown_…` | الهب 200/H1 = /moon |
| `scripts/_smoke_moon_spa_router_…` | الهب 200 = /moon |
| **جديد** `scripts/_smoke_moon_today_content_move_to_moon_1.mjs` | سموك التذكرة (34 تحقّق) |
| **لم يُمَسّ** | `js/moon.js`، `css/style.css` |

## 19) نتائج الاختبارات (محلّيًّا)
| الاختبار | النتيجة |
|---|---|
| **moon-today-content-move (جديد)** | ✅ **34/34** (/moon 200+محتوى+canonical+index؛ 301 ×5؛ sitemap؛ روابط عامّة؛ مدن دون مساس؛ Meeus) |
| moon-spa-router (مُحدَّث) | ✅ 36/36 |
| navbar open-in-new-tab (مُحدَّث) | ✅ 39/39 |
| navbar-city-context (مُحدَّث) | ✅ 59/59 |
| discovered-noindex (مُحدَّث) | ✅ 39/39 |
| countdown SEO/H1 (مُحدَّث) | ✅ 424/424 |
| Meeus accuracy | ✅ 45/45 |
| moon grid | ✅ 212/212 |
| hijri-date-city-tz | ✅ ALL PASSED |
| متصفّح: /moon محتوى+search مربوط+لا console error؛ /moon-today→301؛ مدينة سليمة | ✅ |
| `node --check` (server.js / app.js / sw.js) | ✅ سليم |
*(5 اختبارات regression حُدِّثت لِتعكس انتقال الهب `/moon-today`→`/moon` — تغيير سلوك مقصود، لا كسر.)*

## 20) تأكيد أنّ Meeus 49 لم يتغيّر
✅ `js/moon.js` **UNCHANGED**. شبكة `/moon-in-riyadh/2026-06`: **15=المحاق · 30=البدر** (سموك Meeus 45/45 + grid 212/212).

## 21) تأكيد أنّ صفحات المدن القديمة ما زالت تعمل
✅ `/moon-today-in-riyadh` · `/moon-in-riyadh` · `/moon-in-riyadh/2026-06` · `/moon-in-riyadh/2026-06-17` → 200 + page-moon (سموك + متصفّح). لم تُضَف `/moon/{country}` ولا `/moon/{country}/{city}` — خارج النطاق.

## 22) رسالة الـcommit المقترَحة
```
feat(moon): MOON-TODAY-CONTENT-MOVE-TO-MOON-1 — make /moon the canonical moon phase today page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

**لن أدفع ولن أعمل commit قبل أن ترسل:** `أعتمد دفع تقرير: MOON-TODAY-CONTENT-MOVE-TO-MOON-1` + «أوافق على تنفيذ الدفع». لم أبدأ تعديل محتوى moon today، ولا `/moon/{country}`، ولا `/moon/{country}/{city}`، ولا أيّ تذكرة أخرى.
