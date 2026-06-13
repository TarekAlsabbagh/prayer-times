# تقرير ما قبل الدفع: MOONRISE-AFTER-MIDNIGHT-CLARITY-1

**النوع:** تحسين واجهة فقط — ملاحظة توضيحيّة أسفل وقت شروق القمر عندما يكون بعد منتصف الليل. **لا تغيير في الحساب.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `origin/main = HEAD = 8808d65`.
**النتيجة:** الملاحظة تظهر عند شروق 00:00–05:59 (بكلّ اللغات)، وتختفي خلاف ذلك — مُتحقَّق متصفّحيًّا.

---

## 1) الملفّات المعدَّلة (15)
| الملفّ | التغيير |
|---|---|
| `index.html` | +عنصر `<div class="value-sub moon-rise-note" id="moon-rise-note" hidden>` داخل بطاقة الشروق (مرآة `#moon-set-note`) + رفع `app.js?v=777→778` (سطران) |
| `js/app.js` | +كتلة في `updateMoonInfo` (مرآة كتلة الغروب): تُظهِر/تُخفي `#moon-rise-note` حسب ساعة الشروق بتوقيت المدينة |
| `js/i18n.js` | +مفتاح `moon.moonrise_after_midnight_note` (10 لغات) — **مصدر الحقّ** |
| `js/i18n-core.js` + `js/i18n/{ar,en,fr,tr,ur,de,id,es,bn,ms}.js` | **مُعاد توليدها** من js/i18n.js عبر السكربت الموثَّق ([[i18n-split-bundle-sync]]) — تحقّق: الـ10 حزم == js/i18n.js (0 فرق) |
| `server.js` | `_i18nVersion '199'→'200'` |
> **لم يُمَسّ:** `css/style.css` (إعادة استخدام `.value-sub`). صفحات الشهر. `MoonCalc`/منطق الحساب. (مجموعة التغيير = الـ15 ملفًّا المعتمدة بالضبط — `git diff --name-only` مؤكَّد.)

## 2) النصوص المضافة لكلّ اللغات (`moon.moonrise_after_midnight_note`)
| لغة | النصّ |
|---|---|
| ar | التوقيت محسوب لليوم نفسه، ويقع بعد منتصف الليل. |
| en | This time belongs to the same day and occurs after midnight. |
| fr | Cet horaire appartient au même jour et se produit après minuit. |
| tr | Bu saat aynı güne aittir ve gece yarısından sonra gerçekleşir. |
| ur | یہ وقت اُسی دن کا ہے اور آدھی رات کے بعد آتا ہے۔ |
| de | Diese Zeit gehört zum selben Tag und liegt nach Mitternacht. |
| id | Waktu ini termasuk hari yang sama dan terjadi setelah tengah malam. |
| es | Esta hora pertenece al mismo día y ocurre después de la medianoche. |
| bn | এই সময়টি একই দিনের এবং মধ্যরাতের পরে ঘটে। |
| ms | Waktu ini tergolong dalam hari yang sama dan berlaku selepas tengah malam. |

## 3) شرط الظهور (00:00–05:59 — الخيار A)
تظهر فقط عندما: **(أ)** `moonTimes.riseTime` موجود، **(ب)** `_tz` معرَّف (صفحة قمر-مدينة/today/مؤرَّخة — يستثني widget الرئيسيّة)، **(ج)** ساعة الشروق بتوقيت المدينة `>= 0 && <= 5`. التقنية: `parseInt(Intl.DateTimeFormat('en-GB',{timeZone:_tz,hour:'2-digit',hour12:false}).format(riseTime))`. **تاريخ الشروق = تاريخ الصفحة المحلّيّ** مضمون بِنيويًّا (نافذة `getMoonTimes`). لا `data-i18n` على العنصر → يُملأ عميليًّا فقط (لا يظهر في SSR).

## 4) أمثلة **تظهر** فيها الملاحظة (مُتحقَّق متصفّحيًّا)
| الصفحة | الشروق | الملاحظة |
|---|---|---|
| `/moon-in-riyadh` (اليوم 2026-06-13) | 02:52 ص (ساعة 2) | **ظاهرة** — «التوقيت محسوب لليوم نفسه، ويقع بعد منتصف الليل.» ✓ |
| `/en/moon-in-riyadh` | 02:52 AM | **ظاهرة** — «This time belongs to the same day and occurs after midnight.» ✓ |
> منطقيًّا: 03:26 ص (ساعة 3) ✓ تظهر · 05:28 ص (ساعة 5) ✓ تظهر.

## 5) أمثلة **لا تظهر** فيها (مُتحقَّق متصفّحيًّا)
| الصفحة | الشروق | الملاحظة |
|---|---|---|
| `/moon-in-riyadh/2026-05-27` | 03:15 م (ساعة 15) | **مخفيّة**، نصّ فارغ ✓ |
> منطقيًّا: 06:00 ص (ساعة 6) → مخفيّة · 10:00 ص (ساعة 10) → مخفيّة · شروق `--:--` (لا riseTime) → مخفيّة · صفحة شهر (لا بطاقة يوميّة) → لا ملاحظة.

## 6) تأكيد عدم تغيير الحساب
`MoonCalc` · `getMoonTimes` · `_localMidnightInTz` · `_moonCityLocalNoon` · date-normalization · timezone — **بلا أيّ تعديل**. قيمة `#moon-rise` نفسها (`moonTimes.rise`) **بلا تغيير**؛ الكتلة الجديدة تقرأ `riseTime` للعرض فقط ولا تكتب فيه.

## 7) تأكيد عدم تغيير moonset
كتلة `MOON-CURRENT-CYCLE-RISE-SET-FIX-1` + `#moon-set-note` + `moon.set_next_day_note` — **بلا مساس** (أُضيفت الكتلة الجديدة بعدها). على `/moon-in-riyadh` اليوم: `#moon-set-note` مخفيّة (سلوكها السليم) و`#moon-rise-note` ظاهرة — مستقلّتان. كلا العنصرين حاضران.

## 8) تأكيد عدم تغيير H1/Title/Meta/canonical/hreflang/sitemap
**بلا تغيير.** regression: H1 مرئيّ=1 على كلّ الصفحات؛ Titles سليمة («حالة القمر في الرياض…»، «…اليوم في الرياض»، «…يوم 13 يونيو 2026»). لا مساس بـcanonical/hreflang/sitemap (الإضافة عنصر DOM مخفيّ + مفتاح i18n فقط).

## 9) نتائج console
**0 أخطاء** (متصفّح المعاينة، `/moon-in-riyadh` + `/moon-in-riyadh/2026-05-27` + `/en/moon-in-riyadh`).

## 10) نتائج regression
| الصفحة | HTTP | H1 مرئيّ | الإصدارات | عنصر الملاحظة |
|---|---|---|---|---|
| `/` · `/qibla` · `/azkar` · `/msbaha` | 200 | 1 | app778 / i18n200 | — |
| `/moon-in-riyadh` · `/moon-today-in-riyadh` · `/moon-in-riyadh/2026-06-13` | 200 | 1 | app778 / i18n200 | `#moon-rise-note` حاضر + **مخفيّ في SSR** (لا FOUC) |
| `/en` | 200 | 1 مرئيّ (+16 قوالب SPA مخفيّة، سابق) | app778 / i18n200 | — |
> 10 لغات: الحزم == js/i18n.js (0 مفقود/0 اختلاف، المفتاح الجديد بقيمه الصحيحة لكلّ لغة). لا مفتاح خام، لا double-translation.

## 11) cache-buster
`app.js?v=777→778` (تغيّر منطق app.js) · `_i18nVersion '199'→'200'` (مفتاح i18n جديد + حزم مُعاد توليدها). لا Service Worker.

## 12) رسالة commit المقترحة
```
fix(moon): MOONRISE-AFTER-MIDNIGHT-CLARITY-1 — clarify after-midnight moonrise times
```

---
**الخلاصة:** ملاحظة `#moon-rise-note` (مرآة ملاحظة الغروب) تظهر عند شروق 00:00–05:59 بتوقيت المدينة بكلّ اللغات العشر، بمفتاح i18n جديد، **بلا أيّ مساس بالحساب/الغروب/H1/Title/Meta/canonical/صفحات الشهر**. مُتحقَّق متصفّحيًّا (تظهر/تختفي + console نظيف + regression). 15 ملفًّا، معزولة لهذه التذكرة.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: MOONRISE-AFTER-MIDNIGHT-CLARITY-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
