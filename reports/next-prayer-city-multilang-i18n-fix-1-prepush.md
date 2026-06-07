# تقرير ما قبل الدفع: NEXT-PRAYER-CITY-MULTILANG-I18N-FIX-1

**النوع:** Audit + Fix (سبب واضح ومحدود ⇒ نُفِّذ الإصلاح في نفس التذكرة).
**الصفحة:** `/next-prayer-in-{city}` و`/[lang]/next-prayer-in-{city}`.
**الحالة:** لم يُدفع — بانتظار اعتمادك.

## 1) وصف المشكلة
في صفحة الصلاة القادمة، عناصر تظهر بلغة غير لغة الصفحة: (أ) **الشارة أعلى الهيرو** تظهر «مواقيت الصلاة اليوم» بالعربيّة على كلّ اللغات؛ (ب) **بطاقة الدولة** تظهر بالإنجليزيّة («Saudi Arabia») على bn/de/id/es/ms؛ (ج) **قيمة طريقة الحساب** صياغة غير طبيعيّة (bn نقحرة «সাইট সেটিংস»، de إنجليزيّة «Site-Einstellungen»).

## 2) اللغات المتأثّرة
- الشارة: **كلّ 10 لغات** (حتى en/ar كانتا تظهران العربيّة لأنّ المفتاح مفقود تمامًا).
- الدولة: **5 لغات** (de, id, es, bn, ms).
- صياغة طريقة الحساب: **2 لغة** (bn, de).

## 3) العناصر غير المترجمة (Audit)
| العنصر | الحالة قبل | المصدر |
|---|---|---|
| **الشارة (eyebrow)** | عربيّ على كلّ اللغات | `index.html:544` data-i18n=`npt.eyebrow` — المفتاح **مفقود في كلّ ملفّات i18n** فبقي نصّ HTML الافتراضيّ (عربيّ) بعد مرور SSR walker |
| **بطاقة الدولة** | إنجليزيّ (de/id/es/bn/ms) | `server.js` `_COUNTRY_BY_LANG` يضمّ ar/en/fr/tr/ur فقط ⇒ الباقي يسقط إلى `COUNTRY_NAMES_EN` |
| **قيمة طريقة الحساب** | bn نقحرة / de إنجليزيّة | `server.js` `_NPT_LABELS.calcVal` |
| اسم الصلاة القادمة + الوقت + H1-city | «—» في SSR ثمّ يُملأ client | `app.js:13139-13151` (محرّك الحساب — **لا يُمَسّ**) |
| التوقيت (label) | مترجَم 10/10 | `_NPT_LABELS.timezone` (سليم) |
| التوقيت (value) | `Asia/Riyadh` (IANA) / ماكاو «—» | `_tzGuess[cc]` — انظر §7 |
| Title / Meta / H1-prefix/today / next_is / SEO body / FAQ / روابط | مترجَمة أصلاً 10/10 | `_NPT_TITLE`/`_NPT_DESC`/`_NPT_SEO`/`_NPT_LABELS` + مفاتيح npt.* موجودة |

## 4) مصدر كل نصّ خاطئ
- الشارة: مفتاح `npt.eyebrow` غير موجود في أيٍّ من `js/i18n.js` أو `js/i18n/{lang}.js` ⇒ لا الـSSR walker ولا الـclient يستطيع ترجمته.
- الدولة: خريطة `_COUNTRY_BY_LANG` ناقصة 5 لغات (رغم وجود القواميس `_COUNTRY_NAMES_DE/ID/ES/BN/MS` في server.js).
- طريقة الحساب: قِيَم `calcVal` المكتوبة يدويًّا (نقحرة/أنجلة).

## 5) SSR أم DOM بعد hydration؟
**كلّها SSR.** الشارة عنصر `data-i18n` يترجمه walker الخادم (وبعده الـclient). البطاقات تُبنى **SSR** في `server.js` (`.next-info-grid`) بلا `data-i18n` ولا أيّ تعديل من `app.js` ⇒ **لا client overwrite** (التصنيف F = لا). تأكيد حيّ: بعد hydration على `/bn/next-prayer-in-riyadh` البطاقات تبقى بنغاليّة.

## 6) حالة بطاقة الدولة قبل/بعد
| اللغة | قبل | بعد |
|---|---|---|
| bn (Riyadh) | Saudi Arabia | **সৌদি আরব** |
| de | Saudi Arabia | **Saudi-Arabien** |
| id | Saudi Arabia | **Arab Saudi** |
| es | Saudi Arabia | **Arabia Saudita** |
| ms | Saudi Arabia | **Arab Saudi** |
| bn (Macau) | China | **চীন** |
| ar/en/fr/tr/ur | صحيحة مسبقًا | بلا تغيير |
الحلّ: ربط القواميس العشرة في `_COUNTRY_BY_LANG` + احتياط `Intl.DisplayNames(region)` لأيّ رمز دولة غير موجود في القاموس المنسّق. **أسماء الدول فقط** (المدن تبقى من `names[lang]→names.en`، بلا ترجمة runtime).

## 7) حالة التوقيت (label + value)
- **label** مترجَم 10/10 (مثلاً bn «স্থানীয় টাইমজোন»، ur «مقامی ٹائم زون»). ✓
- **value** = معرّف IANA تقنيّ مقبول (`Asia/Riyadh`). ✓ (التصنيف E)
- **ماكاو = «—»**: رمز دولة ماكاو المنسّق هو `cn` (الدولة = الصين، لذا تظهر «China/চীন» بشكل صحيح)، و`_tzGuess` لا يضمّ `cn` ⇒ «—». هذه **فجوة بيانات سابقة لرمز `cn`** (تطال كلّ المدن الصينيّة)، **ليست خطأ ترجمة** ولا انحدارًا (كانت «—» قبل الإصلاح). إضافة `cn:'Asia/Shanghai'` ستُسيء توصيف ماكاو، ومصدر التوقيت الحقيقيّ غير متاح من `_resolveCityForMoon` (يُرجِع lat/lng/cc فقط) ⇒ **خارج نطاق i18n، مؤجَّل**.

## 8) حالة طريقة الحساب / إعدادات الموقع قبل/بعد
| اللغة | قبل | بعد |
|---|---|---|
| bn | সাইট সেটিংস (نقحرة) | **সাইটের সেটিংস** |
| de | Site-Einstellungen («Site» إنجليزيّة) | **Website-Einstellungen** |
| ar/en/fr/tr/ur/id/es/ms | طبيعيّة مسبقًا (حسب إعدادات الموقع / Site settings / Paramètres du site / Site ayarları / سائٹ کی ترتیبات / Pengaturan situs / Ajustes del sitio / Tetapan tapak) | بلا تغيير |
> المعنى: «طريقة الحساب تتبع الإعداد الافتراضيّ للموقع». الـlabel «طريقة الحساب» (calc) مترجَم 10/10 أصلاً.

## 9) المفاتيح المضافة/المعدَّلة
- **مضاف:** `npt.eyebrow` × 10 لغات في `js/i18n.js` (حزمة SSR) + كلّ `js/i18n/{lang}.js` (حِزَم المتصفّح). القيم تطابق أمثلتك (ar «مواقيت الصلاة اليوم» … bn «আজকের নামাজের সময়» … en «Today’s Prayer Times»).
- **معدَّل (server.js، SSR فقط):** `_COUNTRY_BY_LANG` (+5 لغات + احتياط Intl) · `_NPT_LABELS.bn.calcVal` · `_NPT_LABELS.de.calcVal`.

## 10) تأكيد قاعدة أسماء المدن (no runtime translation)
✅ لم تُمَسّ. أسماء المدن في البطاقة/H1 تأتي من `_resolveCityName`/curated (`names[lang]→names.en`): bn=রিয়াদ، de=Riad، ur=ریاض، en=Riyadh… لا ترجمة آليّة ولا تغيير slugs.

## 11) تأكيد عدم تغيير الحسابات
✅ منطق الصلاة القادمة + الأوقات + إحداثيات المدينة + معرّف التوقيت IANA: بلا مساس. `app.js` (محرّك العدّ، `npt-next-name`/`npt-next-time`/`npt-h1-city`) لم يُلمَس.

## 12) تأكيد SEO
✅ Title/Meta/canonical/hreflang/sitemap بلا تغيير. الشارة إضافة i18n فقط (SSR يترجمها بالـwalker). تغييرات الدولة/calcVal كلّها SSR في نفس البطاقات الموجودة (لا بنية/روابط جديدة).

## 13) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `js/i18n.js` | +12 (10 `npt.eyebrow` + تعليق + فارغ) |
| `js/i18n/{ar,en,fr,tr,ur,de,id,es,bn,ms}.js` (×10) | +3 لكلّ (`npt.eyebrow` + تعليق + فارغ) |
| `server.js` | `_COUNTRY_BY_LANG` (+5 لغات + Intl fallback) + calcVal bn/de + بمب `_i18nVersion 196→197` |
| `sw.js` | `CACHE_VERSION v439→v440` |
| `scripts/_apply_npt_eyebrow_i18n_fix_1.mjs` | جديد (مولِّد المفتاح، للتوثيق) |
> `git diff --stat`: **67 إضافة، 5 حذف**. تغييرات ملفّات اللغات إلحاقيّة، LF محفوظ.

## 14) نتائج الاختبار AR/EN/BN/UR/FR (SSR، الشارة + بطاقات)
| اللغة | الشارة | الدولة | التوقيت | طريقة الحساب |
|---|---|---|---|---|
| ar | مواقيت الصلاة اليوم | المملكة العربية السعودية | Asia/Riyadh | حسب إعدادات الموقع |
| en | Today’s Prayer Times | Saudi Arabia | Asia/Riyadh | Site settings |
| bn | আজকের নামাজের সময় | সৌদি আরব | Asia/Riyadh | সাইটের সেটিংস |
| ur | آج کے نماز کے اوقات | سعودی عرب | Asia/Riyadh | سائٹ کی ترتیبات |
| fr | Horaires de prière du jour | Arabie Saoudite | Asia/Riyadh | Paramètres du site |
+ de/id/es/ms مؤكَّدة (الشارة + الدولة مترجَمتان). hydration `/bn` يبقي الكلّ بنغاليًّا (لا overwrite) + حِزَم `@v=197` + **0 console**.

## 15) نتائج Macau
| | bn | en |
|---|---|---|
| الشارة | আজকের নামাজের সময় | Today’s Prayer Times |
| المدينة | Macau (curated) | Macau |
| الدولة | **চীন** | China |
| التوقيت | «—» (فجوة `cn` سابقة — §7) | «—» |
| طريقة الحساب | সাইটের সেটিংস | Site settings |

## 16) نتائج regression
✅ HTTP **200** لكلّ: `/next-prayer-in-riyadh`, `/{bn,en,ur,fr}/next-prayer-in-riyadh`, `/{bn,en}/next-prayer-in-macau`, `/date-converter`, `/bn/date-converter`, `/msbaha`, `/bn/msbaha`, `/azkar`, `/bn/azkar`, `/prayer-times-in-riyadh`, `/bn/prayer-times-in-riyadh` (15/15). `node --check` نظيف على الـ13 ملفًّا. **0 أخطاء console**.

## 17) cache-busters
- `_i18nVersion 196 → 197` (server.js) — لمفتاح `npt.eyebrow` في حِزَم المتصفّح.
- `CACHE_VERSION v439 → v440` (sw.js).
- تغييرات الدولة/calcVal **SSR فقط** ⇒ لا بمب إضافيّ (HTML بلا cache).

## 18) رسالة commit المقترحة
```
fix(next-prayer): NEXT-PRAYER-CITY-MULTILANG-I18N-FIX-1 — localize city page labels and country display
```

## التصنيف
**A** (مفتاح `npt.eyebrow` مفقود) · **B** (افتراضيّ عربيّ يتسرّب بسبب A) · **D** (الدولة غير محلّاة على 5 لغات) · **G** (صياغة calcVal bn/de). · **E** (التوقيت: label مترجَم + value IANA مقبول؛ ماكاو «—» فجوة بيانات سابقة خارج النطاق). · **C/F = لا**.

---
**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: NEXT-PRAYER-CITY-MULTILANG-I18N-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
