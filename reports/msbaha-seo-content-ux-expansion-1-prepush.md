# تقرير ما قبل الدفع: MSBAHA-SEO-CONTENT-UX-EXPANSION-1 (+ MSBAHA-EVENTS-ECHO-1)

**التاريخ**: 2026-06-01  
**الـ HEAD المنوي بناؤه عليه**: `5250d01` (CDN-CACHE-BREAKER المُغلَق)  
**الـ stash**: تمّ pop + drop بنجاح (لا stash MSBAHA متبقٍّ)  
**النوع**: 2 توسعات في commit واحد — توسعة محتوى/SEO + استنساخ countdown الأحداث

---

## 1. الملفّات المعدَّلة بعد استعادة الـ stash

`git diff --stat HEAD` (HEAD = `5250d01`):

```
 css/style.css | 241 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 index.html    | 240 +++++++++++++++++++++++++++++++++++++++++++++++++++++++--
 js/app.js     |   5 +-
 js/i18n.js    | 110 +++++++++++++++++++++++++++
 js/i18n/ar.js |  55 ++++++++++++++
 js/i18n/en.js |  55 ++++++++++++++
 server.js     |  48 +++++++++++-
 sw.js         |  41 +++++++++-
 8 files changed, 786 insertions(+), 9 deletions(-)
```

| الملفّ | حجم التغيير | محتوى التغيير |
|---|---|---|
| `index.html` | +238 سطر | 7 أقسام جديدة في `#page-tasbih` + رفع cache-busters |
| `css/style.css` | +241 سطر | `.tasbih-edu/howto/after/when/related/faq/disclaimer` + dark overrides |
| `js/i18n.js` | +110 سطر | 50 مفتاح AR + 50 مفتاح EN |
| `js/i18n/ar.js` | +55 سطر | نفس الـ 50 مفتاح AR |
| `js/i18n/en.js` | +55 سطر | نفس الـ 50 مفتاح EN |
| `server.js` | +48/-1 سطر | `tasbihFaq` flag + FAQPage + HowTo JSON-LD + `_i18nVersion` 189→190 |
| `sw.js` | +40/-1 سطر | كتلتَا توثيق MSBAHA + CACHE_VERSION v394→v395 (+ كتلة CDN-CACHE-BREAKER محفوظة) |
| `js/app.js` | +4/-1 سطر | إضافة `'page-tasbih'` إلى `_azkarPageIds` (MSBAHA-EVENTS-ECHO-1 only) |

---

## 2. هل تمّ دمج MSBAHA-EVENTS-ECHO-1 معه؟

**نعم — في commit واحد**. السبب:
- الموجة الأصليّة MSBAHA-SEO-CONTENT-UX-EXPANSION-1 أضافت 6 أقسام + FAQ + JSON-LD.
- MSBAHA-EVENTS-ECHO-1 تَلَتها مباشرةً (بعد طلب المستخدم بإضافة countdown) — أضافت قسمًا 7 إلى الكتلة نفسها.
- الـ stash كان يَجمعهما بالفعل.
- الـ commit message + التوثيق في `sw.js` يُفصّلان كلتَيهما بوضوح.

---

## 3. هل تمّ حلّ conflict في `sw.js`؟

✅ **نعم — حلًّا يدويًّا**. الـ conflict كان بين:
- **Upstream** (`5250d01`): كتلة CDN-CACHE-BREAKER + `CACHE_VERSION='v394'`
- **Stash**: كتلتَا MSBAHA + `CACHE_VERSION='v395'`

الحلّ المُطبَّق:
- ✅ احتُفِظ بكتلة CDN-CACHE-BREAKER كاملةً (بدون حذف أيّ كلمة)
- ✅ أُضيف ذيل لها: "COMMITTED + DEPLOYED + VERIFIED as 5250d01 ... v749/v750/v394 are NOW LIVE keys"
- ✅ أُضيفت كتلة MSBAHA-SEO-CONTENT-UX-EXPANSION-1 بعدها (مع تنبيه إلى أنّ cache-busters أُعيد ضبطها)
- ✅ أُضيفت كتلة MSBAHA-EVENTS-ECHO-1 بعدها (مع شرح إعادة استخدام `.moon-event-{key}` لاسترجاع التدرّجات)
- ✅ `CACHE_VERSION = 'v395'` نهائيّ

---

## 4. نسخة `CACHE_VERSION` النهائيّة

```
const CACHE_VERSION = 'v395';
```

(تَجاوز `v394` الذي صار live للـ CDN-CACHE-BREAKER على production.)

---

## 5. نسخة `app.js` النهائيّة

**`index.html`**:
- `<link rel="preload" href="js/app.js?v=751" as="script">` (السطر 73)
- `<script defer src="js/app.js?v=751"></script>` (السطر 5189)

**التحقّق**: `grep -c "app.js?v=751"` = 2 + `grep -c "app.js?v=750"` = 0 ✅

(تَجاوز `v750` الذي صار live للـ CDN-CACHE-BREAKER على production.)

**تعديل `js/app.js`**: سطر واحد فعليّ — إضافة `'page-tasbih'` إلى مصفوفة `_azkarPageIds` في `_azkarRenderMoonEvents()` على السطر ~25056. تَعليق توثيقيّ 3 أسطر فوقه. **منطق المسبحة ‎(`tasbihClick`/`tasbihNextStep`/`tasbihSwitchMode`/`tasbihReset`/`tasbihFreeClick`/...)‎ صفر تعديل**.

---

## 6. الأقسام الجديدة في صفحة `/msbaha`

7 أقسام جديدة داخل `#page-tasbih` بعد `.tasbih-card` (الأداة نفسها):

| # | ID | المحتوى |
|---|---|---|
| 1 | `#tasbih-edu` | "ما هي المسبحة الإلكترونية؟" — مقدّمة تعريفيّة |
| 2 | `#tasbih-howto` | "كيف تستخدم المسبحة الإلكترونية؟" — 4 خطوات مرقَّمة |
| 3 | `#tasbih-after-prayer` | "أذكار التسبيح بعد الصلاة" — اقتباس حديث مسلم + 3 كروت (سبحان الله 33، الحمد لله 33، الله أكبر 33) |
| 4 | `#tasbih-when` | "متى تستخدم المسبحة الإلكترونية؟" — 5 كروت (بعد الصلوات/الصباح والمساء/الاستغفار/الانتظار/السفر) |
| 5 | `#tasbih-related` | "أدوات وعبادات مرتبطة" — 4 كروت روابط داخليّة |
| 6 | `.tasbih-disclaimer` | تنبيه لطيف (chip أصفر ناعم) |
| 7 | `#tasbih-faq-section` | "أسئلة شائعة" — 6 أسئلة `<details>` |
| 8 | `.moon-events-section` | **MSBAHA-EVENTS-ECHO-1**: استنساخ moon-today countdown — 4 بطاقات (رمضان/فطر/أضحى/سنة هجريّة) مع تدرّجات لونيّة (بنفسجيّ/ذهبيّ/أحمر/أزرق) |

**التحقّق من server**: `grep ... id="tasbih-(edu|howto|after-prayer|when|related|faq-section)"` = 7 ✅

---

## 7. الروابط الداخليّة الجديدة (في `#tasbih-related`)

| الرابط | العنوان | الوصف |
|---|---|---|
| `/prayer-times-in-riyadh` | مواقيت الصلاة | اعرف مواقيت الصلوات الخمس في مدينتك… |
| `/azkar` | الأذكار | صفحة الأذكار الشاملة… |
| `/qibla` | اتّجاه القبلة | حدّد اتّجاه القبلة من موقعك… |
| `/today-hijri-date` | التاريخ الهجري | تابع التاريخ الهجريّ اليوم… |

❌ **لم يُضَف رابط إلى `/azkar/prayer-azkar`** (احترامًا للقاعدة الثابتة "لا تَضِف رابطًا قبل الاعتماد البصريّ").

**روابط countdown** (في `.moon-events-section`):
- `/ramadan-countdown`، `/eid-al-fitr-countdown`، `/eid-al-adha-countdown`، `/hijri-new-year-countdown`

---

## 8. FAQ + JSON-LD

**FAQ Section (`#tasbih-faq-section`)**: 6 أسئلة `<details>` قابلة للطيّ:
- q1: هل المسبحة الإلكترونية بدعة؟
- q2: هل تَحفظ المسبحة العدّ بعد إغلاق الصفحة؟
- q3: لماذا العدد 33 بعد الصلاة؟
- q4: هل أستطيع استخدامها بدلًا من المسبحة العاديّة؟
- q5: هل تعمل المسبحة بدون إنترنت؟
- q6: هل المسبحة مجانيّة وآمنة؟

**JSON-LD**:
- ✅ `FAQPage` schema عند `#tasbih-faq` — يَضمّ 6 `Question`/`acceptedAnswer` (محقَّق محلّيًّا: `grep -c '#tasbih-faq' /msbaha` = 1)
- ✅ `HowTo` schema عند `#tasbih-howto` — يَضمّ 4 `HowToStep`
- ✅ مَطبوعان عبر flag `tasbihFaq: true` في `staticPages['/msbaha']` في `server.js` (نمط مرآة لـ `zakatFaq`)
- ✅ مصدر واحد — نفس مفاتيح i18n تَخدُم HTML المرئيّ + JSON-LD

---

## 9. تأكيد أن منطق المسبحة لم يتغيّر

✅ `js/app.js` diff: **+4 أسطر** فقط (3 تعليق + 1 إضافة `'page-tasbih'` إلى `_azkarPageIds`).
- ❌ صفر تعديل في `tasbihClick`
- ❌ صفر تعديل في `tasbihNextStep`
- ❌ صفر تعديل في `tasbihSwitchMode`
- ❌ صفر تعديل في `tasbihResetCount`
- ❌ صفر تعديل في `tasbihReset`
- ❌ صفر تعديل في `tasbihFreeClick`
- ❌ صفر تعديل في `tasbihFreeReset`
- ❌ صفر تعديل في `getTasbihSequence()` أو `TASBIH_EACH = 33` أو أيّ متغيّر متعلّق

---

## 10. تأكيد أنّ الوضع التلقائي ينتقل بعد 33

✅ منطقيًّا — لم يُمَسّ كود `tasbihNextStep` بأيّ شكل. السلوك المُختبَر على CDN-CACHE-BREAKER (commit سابق `5250d01`) سيَنطبق هنا حرفيًّا.

**التحقّق المحلّيّ**: server يُخدِم `/msbaha` HTML 200 + معرّفات الأداة (`#tasbih-btn`، `#tasbih-count`، `onclick="tasbihClick()"`) موجودة 2/3 (الـ 3rd هو في mode-free section).

---

## 11. تأكيد أنّ free mode لم يتأثّر

✅ `js/app.js` diff لا يَلمس `tasbihFreeClick`/`tasbihFreeReset`/`tasbihFreeResetAll`/`tasbihSwitchMode('free')`. اختبار جلسة المسبحة الحيّة على ‎`5250d01`‎ أكَّد `tasbihFreeClick.toString()` يَبدأ بـ `tasbihFreeCount++` — هذا لم يتغيّر.

---

## 12. اختبار `/msbaha` و `/en/msbaha`

محلّيًّا (PORT=3034):
- `/msbaha` ⇒ HTTP 200 ✅
- `/en/msbaha` ⇒ HTTP 200 ✅
- HTML يَستدعي `js/app.js?v=751` فقط (صفر إشارة لـ v=750) ✅
- 7 أقسام جديدة (`#tasbih-edu/howto/after-prayer/when/related/faq-section` + `.tasbih-disclaimer`) ⇒ مُكتشَفة ✅
- `.moon-events-section` على /msbaha مع 4 بطاقات `moon-event-{key} moon-event-{key}-card` مزدوجة الـ class ⇒ تدرّجات لونيّة سليمة ✅
- `#tasbih-faq` schema markup ⇒ 1 ضربة (FAQPage JSON-LD مُحَقَّن) ✅

---

## 13. اختبار صفحات regression

محلّيًّا (PORT=3034):

| URL | الحالة |
|---|---|
| `/prayer-times-in-riyadh` | HTTP 200 ✅ |
| `/moon-today` | HTTP 200 ✅ |
| `/qibla-in-riyadh` | HTTP 200 ✅ |
| `/hijri-calendar` | HTTP 200 ✅ |
| `/zakat-calculator` | HTTP 200 ✅ |

---

## 14. تأكيد cache-busters

| المفتاح | القيمة قبل (`5250d01`) | القيمة الجديدة |
|---|---|---|
| `js/app.js?v=` | 750 | **751** |
| `css/style.css?v=` | 465 | **465** (لا تغيير — CSS تَطوّر لكن v=465 لم يُنشَر سابقًا. ✅ بكر) |
| `_i18nVersion` (server.js → `js/i18n/{lang}.js?v=`) | 189 | **190** |
| `sw.js CACHE_VERSION` | 'v394' | **'v395'** |
| `js/prayer-times.js?v=` | 53 | 53 (لا تغيير) |

**تأكيد عدم تَضارب**:
- ❌ لا إعادة استخدام لـ `app.js?v=750` (مَملوك لـ CDN-CACHE-BREAKER على production)
- ❌ لا إعادة استخدام لـ `CACHE_VERSION='v394'` (مَملوك لـ CDN-CACHE-BREAKER على production)
- ✅ كلّ المفاتيح الجديدة بكر — لم تُطلَب من CDN قطّ

**ملاحظة مهمّة عن `css/style.css?v=465`**: تَمّ ضَبطه في WIP الأصليّ قبل بدء CDN-CACHE-BREAKER. CDN-CACHE-BREAKER لم يُغيّر CSS، فبقي `v=464` على production. والـ MSBAHA يَستخدم `v=465` لأنّ CSS تَغيَّر (+241 سطر). هذا مفتاح بكر ✅.

---

## 15. رسالة الـ commit المقترَحة

```
feat(msbaha): MSBAHA-SEO-CONTENT-UX-EXPANSION-1 + MSBAHA-EVENTS-ECHO-1 — educational content + FAQ + JSON-LD + Islamic events countdown

Adds 6 educational sections (edu/howto/after-prayer/when/related/disclaimer)
+ a FAQ section (6 Q&A) + a clone of /moon-today's Islamic events countdown
(Ramadan / Eid al-Fitr / Eid al-Adha / Hijri New Year) at the bottom of
/msbaha. Tasbih JS LOGIC in js/app.js is UNTOUCHED — auto/free modes,
33-counter, reset buttons, session totals all intact.

- index.html: 7 new sections inside #page-tasbih + cache-buster bumps
- css/style.css: ~241 lines for .tasbih-edu/howto/after/when/related/
  disclaimer/faq selectors + dark-mode overrides. moon-events-section
  reuses existing CSS — each event card carries BOTH the bare
  .moon-event-{key} (color gradient) AND .moon-event-{key}-card (JS hook).
- js/i18n.js + js/i18n/{ar,en}.js: ~50 new tasbih.* keys (AR + EN).
  Other 8 langs fall back to EN via the established _needsEnFallback chain.
- server.js: tasbihFaq flag wired into /msbaha staticPages entry → emits
  FAQPage (6 Q&A) + HowTo (4 steps) JSON-LD (mirrors zakatFaq pattern,
  single source of truth via i18n). _i18nVersion 189→190.
- js/app.js: SINGLE-LINE addition — 'page-tasbih' appended to
  _azkarPageIds in _azkarRenderMoonEvents() so the rolling-cycle
  resolver populates the events countdown on /msbaha. No tasbih logic
  change.
- sw.js: CACHE_VERSION 'v394' → 'v395' (v394 is now CDN-CACHE-BREAKER's
  live key on production). Doc block preserved + extended.

Cache-busters (post stash-pop reconciliation after CDN-CACHE-BREAKER
consumed v750/v394 on production):
  - js/app.js v750 → v751
  - css/style.css v464 → v465
  - _i18nVersion 189 → 190
  - sw CACHE_VERSION v394 → v395
```

---

## تأكيدات نهائيّة قبل الدفع — للاعتماد

| # | البند | الحالة |
|---|---|---|
| 1 | git stash pop ناجح + conflict في sw.js محلول يدويًّا | ✅ |
| 2 | stash@{0} الأصلي drop'd (لم يَعد مَطلوبًا) | ✅ |
| 3 | كتلة CDN-CACHE-BREAKER التعليقيّة في sw.js محفوظة + موَسَّعة (لم تُحذَف ولم تُمَسّ) | ✅ |
| 4 | كتل MSBAHA التعليقيّة مُضافة بعدها مع توضيح أنّ cache-busters أُعيد ضبطها | ✅ |
| 5 | CACHE_VERSION = 'v395' (تَجاوز v394 المنشور) | ✅ |
| 6 | app.js?v=751 (تَجاوز v750 المنشور) — count 2/2 في index.html + صفر إشارة لـ v750 | ✅ |
| 7 | css/style.css?v=465 — count 2/2 (مفتاح بكر) | ✅ |
| 8 | _i18nVersion = 190 (مفتاح بكر) | ✅ |
| 9 | `node --check` على 6 ملفّات JS modified (server.js / i18n.js / ar.js / en.js / sw.js / app.js) — 6/6 OK | ✅ |
| 10 | 7 صفحات HTTP 200 (محلّيًّا): /msbaha، /en/msbaha، /prayer-times-in-riyadh، /moon-today، /qibla-in-riyadh، /hijri-calendar، /zakat-calculator | ✅ |
| 11 | 7 أقسام جديدة + 1 moon-events-section مُكتشَفة في /msbaha المخدوم | ✅ |
| 12 | FAQPage JSON-LD `#tasbih-faq` مُحَقَّن في /msbaha | ✅ |
| 13 | moon-event بطاقات بـ class مزدوج (تدرّجات لونيّة مسترجَعة) | ✅ |
| 14 | منطق المسبحة (`tasbihClick`/`tasbihNextStep`/...) صفر تعديل | ✅ |
| 15 | لا رابط لـ `/azkar/prayer-azkar` (احترامًا للقاعدة الثابتة) | ✅ |
| 16 | غير مدفوع — في انتظار اعتمادك | ⏳ |

---

## في انتظار اعتمادك

عند ورود الاعتماد بصيغة:
> `أعتمد دفع تقرير: MSBAHA-SEO-CONTENT-UX-EXPANSION-1`

سأُنفّذ:
1. `git add` لـ 8 ملفّات
2. `git commit` بالنصّ في القسم 15
3. `git push origin main`
4. `ScheduleWakeup` بعد ≥ 5 دقائق لإجراء فحوصات ما بعد الدفع (مع احترام قاعدة CDN hygiene — لن يُطلَب `app.js?v=751` أو `sw.js v395` من production قبل اكتمال Render deploy)

**بعد الإغلاق**: المهمّة التالية المُجدوَلة (الخيار د المُعتَمَد): `CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1` كـ commit مستقلّ.

ملاحظة ثابتة محفوظة: لا أبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
