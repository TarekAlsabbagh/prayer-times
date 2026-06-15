# تقرير ما قبل الدفع: NAVBAR-LINKS-OPEN-IN-NEW-TAB-REAL-HREF-FIX-1

**النوع:** إصلاح تنقّل — جعل روابط الـnavbar روابط حقيقيّة (`<a href="/real-route">`) ليعمل «فتح في تبويب/نافذة جديدة» و«نسخ الرابط» بشكل صحيح، مع ترك المتصفّح يتصرّف طبيعيًّا مع النقرات المُعدَّلة.
**الحالة:** لم يُدفع — بانتظار اعتمادك. **القاعدة:** `HEAD = origin/main = fe0b490`. شجرة العمل: index.html · js/app.js · sw.js (+ سموك جديد + هذا التقرير).
**بلا تغيير:** التصميم · الترتيب · النصوص · SEO/الحسابات · routing العامّ (عدا href) · active-state · تبديل اللغة · mobile menu.

---

## 1) اسم التذكرة
**NAVBAR-LINKS-OPEN-IN-NEW-TAB-REAL-HREF-FIX-1**

## 2) السبب الحقيقيّ للمشكلة
سببان متراكبان:
1. **7 عناصر navbar كانت `href="#"`.** قائمة المتصفّح «Open in new tab/window» و«Copy link» تقرأ **سمة `href` مباشرةً** (لا تمرّ عبر JS) — و`#` يُحَلّ إلى **الصفحة الرئيسيّة**. لذلك كلّ فتح-في-تبويب كان يذهب للرئيسيّة.
2. **معالِج النقر في `initNavigation()` كان يستدعي `e.preventDefault()` بلا شرط** — فحتّى **Ctrl/Cmd + click** (الذي يُطلِق حدث `click`) كان يُبتلَع، فلا يفتح تبويبًا جديدًا. *(النقر الأيمن والأوسط لا يُطلِقان `click` أصلًا — يعتمدان على `href` الحقيقيّ، لذا أصلحهما الرابط الحقيقيّ وحده.)*

## 3) روابط navbar التي كانت href خاطئة (7)
كلّها كانت `href="#"`: `prayer-times` · `qibla` · `moon` · `tasbih` · `hijri-today` · `hijri-calendar` · `date-converter`.
*(عنصرا `zakat` و`azkar` كانا أصلًا بروابط حقيقيّة من تذاكر سابقة — لم يُمَسّا.)*

## 4) href الجديد لكلّ رابط
| data-page | href القديم | href الجديد (AR) | على /en (SSR) |
|---|---|---|---|
| prayer-times | `#` | **`/`** | `/en` |
| qibla | `#` | **`/qibla`** | `/en/qibla` |
| moon | `#` | **`/moon-today`** | `/en/moon-today` |
| tasbih | `#` | **`/msbaha`** | `/en/msbaha` |
| hijri-today | `#` | **`/today-hijri-date`** | `/en/today-hijri-date` |
| hijri-calendar | `#` | **`/hijri-calendar`** | `/en/hijri-calendar` |
| date-converter | `#` | **`/date-converter`** | `/en/date-converter` |

*(prayer-times = `/` لأنّ الرئيسيّة هي صفحة مواقيت الصلاة — هذا الرابط الصحيح لها، لا «رجوع للرئيسيّة» خاطئ.)* الـSSR lang-prefix pass القائم يحوّل هذه الروابط تلقائيًّا إلى `/{lang}/…` على الصفحات غير-العربيّة **في كلّ الموقع** (تمامًا كـzakat/azkar) — مُتحقَّق على `/en/qibla` (صفحة غير-رئيسيّة).

## 5) هل عُدِّل handler الـSPA؟
**نعم، تعديل أدنى واحد:** أُضيف حارس النقرات المُعدَّلة في **بداية** معالِج نقر `initNavigation()` قبل `e.preventDefault()`:
```js
if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
```
**منطق التنقّل الباقي لم يتغيّر إطلاقًا** — لا يزال يقرأ `this.dataset.page` ويتنقّل بنفس الوجهات الذكيّة (من صفحة مدينة → قبلة/قمر تلك المدينة، إلخ). الـhref مُستعمَل فقط للسلوك الأصليّ للمتصفّح (تبويب جديد/نسخ).

## 6) التعامل مع Ctrl/Cmd / middle / right click
- **Ctrl/Cmd/Shift/Alt + نقرة يسرى:** يُطلِق `click` → الحارس يُرجِع مبكرًا (بلا preventDefault) → المتصفّح يفتح `href` الحقيقيّ في تبويب/نافذة جديدة. ✅
- **النقر الأوسط (middle):** يُطلِق `auxclick` لا `click` → لا يدخل المعالِج أصلًا → المتصفّح يفتح `href` الحقيقيّ. ✅
- **النقر الأيمن → Open in new tab/window + Copy link:** قائمة سياق المتصفّح تقرأ `href` الحقيقيّ. ✅
- **النقرة اليسرى العاديّة:** الحارس يمرّر → `preventDefault` → تنقّل SPA كالمعتاد (لا كسر في التجربة). ✅

## 7) نتائج اختبار desktop navbar (السموك 39/39)
- AR `/`: الـ9 عناصر تحمل مساراتها الحقيقيّة بالضبط، **0 منها `#`** أو فارغ.
- جميع المسارات الـ9 تُحَلّ مباشرةً **200** (لا redirect للرئيسيّة)، وcanonical = المسار نفسه (لا `/`) على qibla/moon-today/date-converter/msbaha/today-hijri-date/hijri-calendar.
- الحارس موجود ويسبق `preventDefault` في `initNavigation`.

## 8) نتائج اختبار mobile menu
الـsidebar **هو** قائمة الموبايل (نفس عناصر `.sidebar-nav` تُطوى عبر `toggleSidebar()`). بما أنّ الروابط والمعالِج مشتركان: السلوك مطابق — النقرة العاديّة تتنقّل SPA + تُغلِق الدرج (`closeSidebar`)، والنقرة المُعدَّلة/اليمنى تفتح الرابط الحقيقيّ. **منطق الطيّ/الفتح لم يُمَسّ.** (لا قائمة موبايل منفصلة تستعمل بيانات أخرى.)

## 9) نتائج SSR direct routes
14 مسارًا عامًّا صحيّ: `/` `/prayer-times-in-makkah` `/en/prayer-times-in-london` `/qibla` `/moon-today` `/azkar` `/zakat-calculator` `/date-converter` `/today-hijri-date` `/hijri-calendar` `/msbaha` `/prayer-times-in-morocco` `/sitemap-main.xml` → **200**؛ `/en/` → **301** إلى `/en` (تطبيع trailing-slash قائم، ليس انحدارًا). كلّ هدف navbar يفتح صفحته الصحيحة لا الرئيسيّة.

## 10) الملفّات المعدَّلة (3 + سموك + تقرير)
| الملفّ | التغيير |
|---|---|
| `index.html` | **+9/−9** — 7 عناصر navbar `href="#"` → مساراتها الحقيقيّة · cache-buster `app.js?v=780` → `?v=781` (موضعين) |
| `js/app.js` | **+8** — حارس النقرات المُعدَّلة في بداية معالِج نقر `initNavigation()` |
| `sw.js` | **صافٍ +14** — `CACHE_VERSION v440 → v441` + precache `app.js?v=759 → ?v=781` + تعليق تغيير |
| `scripts/_smoke_navbar_links_open_in_new_tab_real_href_fix_1.mjs` | **جديد** — 39 تأكيدًا |

**لم يُمَسّ:** server.js · css · curated · sitemap generation · أيّ صفحة محتوى · بنية الـnavbar/أيقوناته/نصوصه/ترتيبه/`class="active"`/`data-page`/`data-i18n`.

## 11) node --check
`js/app.js` ✓ · `sw.js` ✓ · فحص JS المُضمَّن في index.html: **6 كتل، 0 أخطاء**.

## 12) تأكيد أنّ التصميم لم يتغيّر
تغيّرت **سمة `href` فقط** في 7 عناصر (+ cache-buster). لا تغيير في الماركب/البنية/الترتيب/النصوص/الأيقونات/الـclasses/`class="active"`/`data-page`/`data-i18n`. **مظهر الـnavbar مطابق بايتًا.**

## 13) تأكيد أنّ SEO لم يتغيّر
لا تغيير في title/meta/canonical/robots/hreflang/JSON-LD لأيّ صفحة. الروابط صارت روابط داخليّة حقيقيّة قابلة للزحف بدل `#` — **تحسين صافٍ للزحف الداخليّ** دون أيّ تعديل على محتوى SEO أو الصفحات نفسها.

## 14) regression
- سموك التذكرة: **39/39** · `_test_place_by_slug`: **44/44** (صفحات المدن غير متأثّرة) · noindex-consistency carry-forward: **39/39** · 14 مسارًا عامًّا صحيّ · فحص JS المُضمَّن 0 أخطاء.

## 15) رسالة commit المقترحة
```
fix(nav): NAVBAR-LINKS-OPEN-IN-NEW-TAB-REAL-HREF-FIX-1 — use real hrefs and preserve native new-tab behavior
```
الالتزام = index.html + js/app.js + sw.js + السموك الجديد + هذا التقرير (5 ملفّات، معزولة).

---

**الخلاصة:** كلّ عنصر navbar أساسيّ صار `<a href="/real-route">` (7 من `#` → مساراتها)، و`initNavigation` يترك النقرات المُعدَّلة للمتصفّح — ففتح-في-تبويب/نافذة-جديدة ونسخ-الرابط تفتح **الصفحة الصحيحة لا الرئيسيّة**، بينما النقرة العاديّة تبقى SPA. الـSSR يضيف بادئة اللغة تلقائيًّا. **بلا تغيير تصميم/SEO/حسابات/active-state/mobile-menu/تبديل-لغة، 39/39 سموك + 44/44 place + 39/39 noindex + 14 مسارًا، node --check سليم.**

**للاعتماد أرسِل:** `أعتمد دفع تقرير: NAVBAR-LINKS-OPEN-IN-NEW-TAB-REAL-HREF-FIX-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا أبدأ أيّ تذكرة جديدة ولا صفحة أذكار قبل اعتمادك؛ والأذكار موقوفة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
