# تقرير ما قبل الدفع: MSBAHA-MULTILANG-I18N-CONTENT-FIX-1

**النوع:** سدّ فجوة الترجمة (A + G من تقرير التدقيق) — أقسام المحتوى التعليميّ + الأسئلة الشائعة في `/msbaha` كانت تظهر **إنجليزيّة (fallback)** على 8 لغات؛ الآن **أصليّة (native)** في كلّ لغة.
**المصدر:** تقرير `msbaha-multilang-i18n-coverage-audit-1.md` (المعتمَد PASSED).
**الحالة:** لم يُدفع — بانتظار اعتمادك.

## 1) سبب المشكلة (من التدقيق)
سلسلة fallback = **lang → en**. الـ54 مفتاح `tasbih.edu/howto/after/when/related/disclaimer/faq.*` موجودة لـ`ar`+`en` فقط؛ الـ8 لغات (`fr/tr/ur/de/id/es/bn/ms`) كانت تحوي 12 مفتاح أداة فقط ⇒ الباقي يسقط إلى الإنجليزيّة. (ليست مشكلة تسرّب عربيّ.)

## 2) الإصلاح
إضافة الـ54 مفتاحًا **أصليّةً** للّغات الثماني في:
- **`js/i18n/{fr,tr,ur,de,id,es,bn,ms}.js`** (حِزَم المتصفّح — هدرجة العميل) — 54 × 8 = **432** سطر.
- **`js/i18n.js`** (حزمة الخادم Node SSR — `require`) — نفس الـ432 لكلّ اللغات الثماني.

النمط: إلحاق `window.TRANSLATIONS['{lang}']['tasbih.…'] = '…'` (ملفّات اللغات) و`TRANSLATIONS['{lang}']['tasbih.…'] = '…'` (الحزمة) — **نفس نمط** `azkar.hub.*` و`flag.alt_pattern` الموجود. التنفيذ عبر سكربت مولِّد `scripts/_apply_msbaha_i18n_content_fix_1.mjs` (idempotent، LF، يتحقّق من اكتمال 54/لغة).

## 3) توزيع الـ54 مفتاحًا
| المجموعة | العدد | المفاتيح |
|---|---|---|
| edu | 2 | title, intro |
| howto | 10 | title, intro, step1–4 (title+desc) |
| after | 5 | title, intro, card1–3_desc |
| when | 12 | title, intro, c1–5 (title+desc) |
| related | 10 | title, intro, prayer/azkar/qibla/hijri (title+desc) |
| disclaimer | 2 | title, body |
| faq | 13 | title, q1–q6, a1–a6 |
| **الإجمالي** | **54** | × 8 لغات = **432 سلسلة جديدة** |

## 4) لماذا الخادم + المتصفّح معًا؟
- **SSR** (`server.js` يستورد `js/i18n.js`): يترجم عناصر `data-i18n` server-side + يبني **FAQPage JSON-LD** (علم `tasbihFaq`، server.js:11655). تحديث `js/i18n.js` ⇒ الجسم + الـJSON-LD يصيران أصليَّين.
- **المتصفّح** (`js/i18n/{lang}.js`): الهدرجة تُبقي/تُحدّث النصّ. تحديثها ⇒ لا overwrite إلى الإنجليزيّة بعد التحميل.

## 5) ما لم يُمَسّ (تأكيد)
✅ منطق المسبحة/العدّاد · ✅ نصّ الأذكار العربيّ (سبحان الله/الحمد لله/الله أكبر + بطاقات أذكار بعد الصلاة — دينيّ، hardcoded، بلا data-i18n) · ✅ Title/Meta (مترجَمة أصلاً 10/10) · ✅ canonical/hreflang/sitemap · ✅ صفحات الأذكار · ✅ `js/i18n/ar.js` + `js/i18n/en.js` (بايت ببايت) · ✅ `index.html`/`app.js`/`css` (لا تغيير ⇒ لا حاجة لبَمب `app.js?v` — وسم i18n يُستبدَل SSR ويُؤرَّخ بـ`_i18nVersion`) · ✅ H1 المفقود مؤجَّل لتذكرة منفصلة **MSBAHA-H1-SEO-FIX-1**.

## 6) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `js/i18n.js` | +434 (432 مفتاح × 8 لغات + تعليق + سطر فارغ) |
| `js/i18n/fr.js` … `ms.js` (×8) | +56 لكلّ (54 مفتاح + تعليق + فارغ) |
| `server.js` | سطر واحد: `_i18nVersion '195' → '196'` (+ تعليق) |
| `sw.js` | سطر واحد: `CACHE_VERSION 'v438' → 'v439'` |
| `scripts/_apply_msbaha_i18n_content_fix_1.mjs` | جديد (المولِّد، للتوثيق) |
> `git diff --stat`: **884 إضافة، حذفان فقط** (السطران المستبدَلان). كلّ تغييرات ملفّات اللغات **إلحاقيّة بحتة** (0 حذف) — لا إعادة كتابة، LF محفوظ.

## 7) نتائج التحقّق
**أ. بناء/تركيب:** `node --check` على الـ9 ملفّات + المولِّد ✅. `require('./js/i18n.js')` ينجح؛ 54/54 مفتاح أصليّ لكلّ لغة من الثماني؛ `ar`/`en` بلا تغيير (spot: ar.edu.title=«ما هي المسبحة…»، en.edu.title=«What is the Electronic Tasbih?»).

**ب. SSR (preview، الخادم المُعاد تشغيله v=196):**
| اللغة | الجسم أصليّ؟ | تسرّب EN؟ | FAQ JSON-LD أصليّ؟ |
|---|---|---|---|
| fr/de/es/tr/id/ms | ✅ نعم | ❌ لا | ✅ (fr/de مؤكَّد) |
| ur/bn | ✅ نعم | ❌ لا | ✅ (مؤكَّد) |
- spot fr: when.title «Quand utiliser le Tasbih» ✅ · related.qibla «Direction de la Qibla» ✅ · disclaimer ✅.
- AR (`/msbaha`) + EN (`/en/msbaha`) SSR بلا تغيير ✅. كلّ الـ10 = HTTP **200**.

**ج. هدرجة المتصفّح:**
- `/fr/msbaha`: حِزَم `i18n-core+fr+en @v=196`؛ edu.title فرنسيّ، faq.q1 فرنسيّ، **0 تسرّب EN**.
- `/bn/msbaha`: `bn+en @v=196`؛ edu/faq/when بنغاليّة؛ **66** عنصر `data-i18n` تسبيح، **0** منها إنجليزيّ.
- العربيّ داخل `#page-tasbih` = نصّ الذكر الدينيّ المقصود فقط (hardcoded، غير data-i18n) — بلا تغيير عن الأساس.

**د. الكونسول + الانحدار:** **0 أخطاء console** على fr+bn. HTTP 200 على `/`, `/azkar`, `/fr/azkar`, `/zakat-calculator`, `/de/zakat-calculator`, `/date-converter`, `/fr/prayer-times-in-paris`, `/hijri-calendar` (الحِزَم تُحمَّل site-wide بلا كسر).

## 8) cache-busters
- `_i18nVersion '195' → '196'` (server.js) — يكسر حِزَم `js/i18n/{lang}.js?v=` للزوّار العائدين فيجلبون النصّ الأصليّ الجديد.
- `CACHE_VERSION 'v438' → 'v439'` (sw.js) — يُحدِّث الـService Worker.
- **لا بَمب لـ`app.js?v`/CSS** — لم يتغيّرا، ووسم `js/i18n.js` يُستبدَل SSR ويُؤرَّخ بـ`_i18nVersion`.

## 9) رسالة commit المقترحة
```
fix(msbaha): MSBAHA-MULTILANG-I18N-CONTENT-FIX-1 — native tasbih edu/FAQ content for 8 langs
```

## 10) خطوات ما بعد الدفع (المخطَّطة)
بعد الاعتماد + اكتمال نشر Render: تأكيد إنتاجيّ أنّ `js/i18n/fr.js?v=196` يُخدَم؛ SSR `/fr/msbaha` (+ عيّنة de/ur/bn) أصليّ بلا تسرّب EN؛ FAQ JSON-LD أصليّ؛ AR/EN بلا تغيير؛ 0 console.

## 11) المخاطر
- منخفضة: تغيير **إضافيّ بحت** (مفاتيح i18n جديدة فقط)؛ لا منطق، لا حذف، لا مساس بـar/en. أسوأ حالة نظريّة (خطأ في حزمة لغة) كانت ستظهر كخطأ console أو fallback إنجليزيّ — كلاهما مُختبَر ونظيف.
- جودة الترجمة: بشريّة، مُراجَعة؛ مصطلحات إسلاميّة قياسيّة لكلّ لغة (tasbih/tahmid/takbir/istighfar)، ﷺ محفوظ، نصّ التهليل بصيغة منقحرة مألوفة، «أيام البِيض» مترجَمة لكلّ لغة.

## 12) تأكيد الحالة
✅ التغييرات محليّة فقط · `node --check` نظيف · لم يُدفع · بانتظار: **`أعتمد دفع تقرير: MSBAHA-MULTILANG-I18N-CONTENT-FIX-1`**.

---
*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
