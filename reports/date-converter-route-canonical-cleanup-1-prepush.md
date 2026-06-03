# تقرير ما قبل الدفع: DATE-CONVERTER-ROUTE-CANONICAL-CLEANUP-1

**القرار المعتمد (الجديد):** المسار الرسميّ الوحيد لصفحة تحويل التاريخ هو **`/date-converter`** و`/[lang]/date-converter` (بشَرطة). تنظيف `/dateconverter` (بلا شَرطة) من الموقع بالكامل. **الموقع غير منشور ⇒ لا 301 الآن.** **لم يُنفَّذ commit/push.**
**التحقّق:** خادم محلّيّ (port 8080) — رموز HTTP + canonical/hreflang/og/JSON-LD/sitemap + جرد الروابط الداخليّة المُقدَّمة + `node --check`.

---

## 0) الخلاصة المباشرة
أُعيدت تسمية الـ slug للمسار من `dateconverter` → `date-converter` عبر **7 ملفّات مصدر متعقَّبة** (57 موضعًا)، مع **عدم المساس** بمعرّفات DOM المُشَرطنة أصلًا (`id="page-date-converter"`، `class="date-converter-page"`، `data-page="date-converter"`، مفاتيح i18n `nav.date_converter`/`footer.link_date_converter`). النتيجة: `/date-converter` يعمل 200 لكلّ اللغات، و`/dateconverter` صار 404، وكلّ مراجع SEO والروابط الداخليّة تستخدم `/date-converter` فقط.

## 1) الملفّات المعدَّلة (7 ملفّات، 57 موضعًا)
| الملفّ | المواضع | النوع |
|---|---|---|
| `server.js` | 23 | route regex (`_isDateConverter`, `_isIndexHtmlRoute`, `.html` redirect allowlist)، staticPages key، sitemap entry، `_oldReserved` set، footer/tools/CTA links، تعليقات |
| `js/app.js` | 22 | SPA activator + `_isDateConverterPage` + `_detectNavKindFromUrl` regex، `pageUrl('/date-converter')`، SiteNavigationElement url، CTA/link arrays، تعليقات |
| `index.html` | 4 | inline class regex (سطر 10)، رابط الشريط الجانبيّ (676)، بطاقة الرئيسيّة (1421)، تعليق |
| `countries.html` | 3 | روابط داخليّة حقيقيّة (nav + qa-card + footer) — تُقدَّم عبر `/prayer-times-worldwide` |
| `legal.html` | 1 | رابط nav داخليّ حقيقيّ |
| `css/style.css` | 3 | تعليقات فقط |
| `sw.js` | 1 | تعليق فقط |
+ cache-busters: `index.html` app.js?v 759→760 (×2)، style.css?v 469→470 (×2)؛ `sw.js` CACHE_VERSION v421→v422.
**معرّفات DOM المُبقاة (مُشَرطنة، NON-zero):** `page-date-converter`=9، `date-converter-page`=7، `data-page="date-converter"`=2 — لم تُلمَس (لا تحوي الـ slug بلا-شَرطة).

## 2) رموز HTTP (خادم محلّيّ 8080)
| المسار | الرمز |
|---|---|
| `/date-converter` | **200** ✅ |
| `/en/date-converter` | **200** ✅ |
| `/fr/date-converter` | **200** ✅ |
| `/ur/date-converter` | **200** ✅ |
| `/dateconverter` (قديم) | **404** ✅ (لا تكرار محتوى) |
| `/en/dateconverter` (قديم) | **404** ✅ |

## 3) canonical / hreflang / og / JSON-LD على `/date-converter`
- `<link rel="canonical" href=".../date-converter">` ✅ (ar) — و`.../en/date-converter` على `/en/date-converter` ✅
- hreflang: **11 وسمًا** كلّها `/[lang]/date-converter` + `x-default=/date-converter` ✅
- `og:url` = `/date-converter` ✅ · JSON-LD `"url":".../date-converter"` ✅
- **0** ظهور لـ `dateconverter` (القديم) في كامل HTML الصفحة ✅

## 4) sitemap
- `/sitemap-main.xml`: **120** ظهورًا لـ `date-converter` (10 لغات × loc + hreflang alternates)، **0** لـ `dateconverter` القديم ✅

## 5) جرد الروابط الداخليّة المُقدَّمة (old-slug = 0 على كلّ الصفحات)
`/`، `/en`، `/date-converter`، `/privacy`(legal)، `/prayer-times-worldwide`(countries: 3 روابط بالـ slug الجديد)، `/today-hijri-date`، `/hijri-calendar`، `/moon-today`، `/qibla`، `/zakat-calculator`، `/azkar` — **جميعها 0 رابط `/dateconverter` قديم** ✅

## 6) محتوى الصفحة + منطق التحويل سليمان
- SSR على `/date-converter`: Title «محوّل التاريخ الهجري والميلادي والشمسي | تقويم أم القرى»، H1 (`dconv-h1`)، 5 أقسام تعليميّة (`dconv-sec`)، 4 FAQ (`dconv-faq-item`) — كلّها حاضرة ✅
- منطق التحويل **لم يُمَسّ:** `initDateConverter` + `convertToHijri` + `switchConverter` موجودة (3/3) — التغيير اقتصر على سلاسل الـ URL ✅
- `node --check`: server.js OK · app.js OK ✅

## 7) ملاحظة: index.html inline class (سطر 10)
آليّة منع الفلكر العميل-جانبيّة في `<head>` صارت تطابق `…/date-converter$` (بدل القديم) — لكنّها **تغطّي en/ar فقط** (نمط موجود مسبقًا). تغطية كلّ اللغات في SSR هي نطاق التذكرة التالية **DATE-CONVERTER-PAGE-SSR-ACTIVE-CLASS-FIX-1** (منفصلة، تُنفَّذ بعد هذا الدفع، تُطبَّق على `/date-converter` و`/[lang]/date-converter`).

## 8) فصل التذاكر
- شجرة العمل الآن تحوي **هذه التذكرة فقط** (تمّ التراجع عن إصلاح الفلكر السابق غير المدفوع — لم يُدفَع شيء، `git restore` بلا `git reset`). لا خلط.
- إصلاح الفلكر سيُعاد تنفيذه كتذكرة منفصلة على المسار الجديد بعد اعتماد دفع هذه التذكرة.

## 9) رسالة commit المقترحة
```
fix(date-converter): DATE-CONVERTER-ROUTE-CANONICAL-CLEANUP-1 — make date-converter the canonical route
```
**الملفّات في الـ commit:** server.js · index.html · js/app.js · sw.js · css/style.css · countries.html · legal.html · reports/date-converter-route-canonical-cleanup-1-prepush.md (هذا التقرير).

---

## معايير القبول (مطابقة لطلبك)
1. `/date-converter` يعمل 200 — ✅
2. كلّ `/[lang]/date-converter` تعمل 200 — ✅ (ar/en/fr/ur مُتحقَّقة + الـ 10 في hreflang/sitemap)
3. لا روابط داخليّة إلى `/dateconverter` — ✅ (0 على كلّ الصفحات)
4. لا `/dateconverter` في sitemap — ✅ (0)
5. لا `/dateconverter` في canonical — ✅
6. لا `/dateconverter` في hreflang — ✅
7. canonical لكلّ لغة → `/[lang]/date-converter` — ✅
8. hreflang لكلّ لغة → `/[lang]/date-converter` — ✅
9. لا تكرار محتوى بين المسارين — ✅ (`/dateconverter` = 404)
10. لا تغيير منطق تحويل التاريخ — ✅ (3 دوالّ سليمة)
11. لا تغيير الحسابات — ✅ (لم تُمَسّ)
12. لا مساس بصفحات الأذكار — ✅

## تأكيدات
- لم يُنفَّذ commit/push. أوقفتُ خادم الاختبار. لم تُبدأ أيّ صفحة أذكار.

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: DATE-CONVERTER-ROUTE-CANONICAL-CLEANUP-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
