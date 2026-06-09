# تقرير ما قبل الدفع: DISCOVERED-CITY-TO-CURATED-REVIEW-WORKFLOW-FIX-1

**النوع:** أداة مراجعة **قراءة-فقط** للمدن المكتشفة (لا ترقية، لا تعديل curated، لا كتابة Supabase).
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** ملفّان جديدان تحت `scripts/` فقط. **بلا** أيّ تعديل على server/search/noindex/curated/db-cities.
**القاعدة:** `origin/main = HEAD = d73ab23`.

---

## 1) وصف السكربت
`scripts/review-discovered-cities.mjs` — أداة CLI نقيّة تقرأ صفوف `discovered_places` (من Supabase أو من `--fixture` محلّيّ)، تقارن كلّ صفّ بـ`curated-places.json` (قراءة فقط)، تصنّفه، وتُخرِج تقريرَي مراجعة للإنسان:
- `reports/pending-discovered-cities.md` (بشريّ، مجمَّع حسب الدولة، مرتَّب بـselected_count)
- `reports/pending-discovered-cities.json` (آليّ، لخطوة تطبيق لاحقة)
لا يُرقّي أيّ مدينة ولا يكتب curated/Supabase ولا يترجم. الدوالّ النقيّة مُصدَّرة (قابلة للاختبار). مرفق سكربت اختبار `scripts/_test_review_discovered_cities.mjs`.

## 2) مصدر البيانات المقروءة
- **حيّ:** `GET ${SUPABASE_URL}/rest/v1/discovered_places?select=*&order=selected_count.desc` بترويسة `apikey`+`Bearer ${SUPABASE_SERVICE_ROLE_KEY}` (نفس بيئة server.js؛ مفاتيح خادميّة لا تُخزَّن في الريبو). **GET فقط** — لا POST/PATCH/DELETE.
- **دون اتّصال/اختبار:** `--fixture <file.json>` (مصفوفة صفوف بنفس شكل الجدول).
- إن غاب المفتاح ولا fixture → يفشل برسالة واضحة (لا يخترع بيانات).

## 3) الحقول التي يعتمد عليها (من مخطّط migration 001)
`slug · country_code · lat · lng · timezone · names(jsonb 10 لغات) · name_quality(per-lang) · aliases · source · verified · selected_count · search_count`. حقول حساب الصلاة مضمونة بالـvalidator؛ `name_quality` + تحقّق-السكربت (`isCleanScript`) يحدّدان موثوقيّة الأسماء؛ `selected_count` إشارة الأولويّة.

## 4) حالات التصنيف (أسبقيّة — أوّل تطابق يفوز)
| الحالة | الشرط |
|---|---|
| `ALREADY_CURATED` | الـclean-slug أو الاسم يطابق مدينة curated في نفس الدولة (نفس المكان) |
| `SLUG_CONFLICT` | الـclean-slug محجوز عالميًّا لمدينة curated **مختلفة** (دولة/مكان آخر) |
| `NEAR_DUPLICATE` | مدينة curated في نفس الدولة ضمن `--near-deg` (افتراضي 0.15°) — غالبًا نفس المكان بـslug مختلف |
| `SKIP_LOW_CONFIDENCE` | `selected_count < --min-selected` (افتراضي 1 ⇒ معطَّل؛ يُرفع للتصفية) |
| `NEEDS_AR_NAME` | لا اسم عربيّ موثوق (مفقود / سكربت خاطئ / يساوي الإنجليزيّة) |
| `READY_FOR_REVIEW` | ar+en أصيلان + slug نظيف حرّ + ليس مكرَّرًا → مرشَّح (يراجعه إنسان) |
> الأسبقيّة البنيويّة (dedup) تسبق إشارات الجودة — فمدينة قليلة النقرات لكنّها قرب مدينة curated تظهر `NEAR_DUPLICATE` لا `SKIP`.

## 5) مثال من التقرير (تشغيل حقيقيّ على curated الفعليّ 2980 + fixture تجريبيّ)
```
## Summary
| Class | Count |
| READY_FOR_REVIEW | 1 |   | NEEDS_AR_NAME | 1 |   | NEAR_DUPLICATE | 2 |
| SLUG_CONFLICT | 1 |     | ALREADY_CURATED | 1 | | SKIP_LOW_CONFIDENCE | 0 |

### MA
| picks | class | clean slug | orig slug | names (status) | reason |
| 7 | ALREADY_CURATED | chefchaouen | chefchaouen-ma | ar:شفشاون·native, en:Chefchaouen·native | name matches curated "chefchaouen" |
| 3 | NEAR_DUPLICATE  | zzznear-rabat | zzznear-rabat-ma | … | within 0.15° of curated "rabat" |
### CA
| 6 | SLUG_CONFLICT   | london | london-ca | ar:لندن أونتاريو·native, en:London·native | clean slug "london" taken by curated "london" (gb) — different place |
### FR
| 4 | NEEDS_AR_NAME   | zzzplace | zzzplace-fr | ar:Zzzplace·polluted | names.ar is polluted (quality: fallback_en) — supply a trustworthy Arabic name manually |
### DE
| 5 | READY_FOR_REVIEW | zzztestdorf | zzztestdorf-de | ar:تيستدورف·native, en:Testdorf·native, de:Testdörf·native | native ar+en (+ required local langs) present |
```
> لاحظ: الأداة كشفت **chefchaouen الحقيقيّة** (التي رقّيناها) كـ`ALREADY_CURATED` تلقائيًّا — إثبات حيّ لمنع التكرار. وlondon-ca (لندن أونتاريو) كـ`SLUG_CONFLICT` ضدّ london (gb).

## 6) كيف يمنع التكرار مع curated (3 طبقات، قراءة فقط)
يبني فهارس على curated: `bySlug` (عالميّ) + `byCc` (لكلّ دولة). لكلّ صفّ: (أ) تطابق اسم/alias في نفس الدولة → `ALREADY_CURATED`؛ (ب) clean-slug موجود في نفس الدولة → `ALREADY_CURATED`؛ (ج) قُرب < `near-deg` في نفس الدولة → `NEAR_DUPLICATE`. أيّ من الثلاثة يمنع الترقية.

## 7) كيف يكشف slug conflict
يقترح clean-slug بتجريد لاحقة `-{cc}` (`chefchaouen-ma`→`chefchaouen`). إن كان الـclean-slug موجودًا في `bySlug` العالميّ لكنّ صاحبه **دولة مختلفة** (وليس تطابق اسم/قُرب في نفس الدولة) → `SLUG_CONFLICT` مع تسمية المالك (`london`→gb). لا حسم آليّ — التقرير يطلب disambiguation بشريًّا.

## 8) التعامل مع `names.ar` المفقودة/الـfallback
لكلّ صفّ يُقيّم `names.ar` عبر `classifyField` (تحقّق السكربت): `missing` (فارغ) / `polluted` (سكربت خاطئ، مثل لاتينيّ في خانة ar) / `fillchain` (يساوي en) / `native`. أيّ شيء غير `native` → `NEEDS_AR_NAME` (مع عرض `name_quality.ar`). **الاقتراح لا يحمل إلّا الأسماء native** — لا يخترع/يترجم عربيًّا أبدًا؛ الإنسان يُدخِل الاسم العربيّ الموثوق يدويًّا. كذلك يحمل الاقتراح أيّ لغة محلّيّة مدعومة موجودة بصيغة native فقط (مثل de أو fr مختلف عن en)، ويُسقِط ما يساوي en كـfillchain (يؤكّده الإنسان — كأسماء المغرب الفرنسيّة المطابقة للإنجليزيّة).

## 9) تأكيد أنّه read-only
- Supabase: استدعاء `fetch(..., {method:'GET', ...})` **فقط** — لا توجد أيّ دالّة POST/PATCH/DELETE في الملفّ.
- curated: `fs.readFileSync` فقط — لا `writeFileSync` على curated.
- الكتابة الوحيدة = ملفّا التقرير تحت `reports/` (مُخرَجات مراجعة، ليست بيانات).

## 10) تأكيد عدم تعديل curated
`git status db/places/curated-places.json` بعد تشغيل الأداة على curated الحقيقيّ = **untouched** (تحقَّق برمجيًّا في التشغيل التجريبيّ: «curated UNCHANGED»). curated يُقرأ فقط لبناء الفهارس.

## 11) تأكيد عدم تعديل Supabase
لا كتابة Supabase إطلاقًا (GET فقط). لا يُغيَّر `selected_count` ولا `name_quality` ولا أيّ صفّ. (تتبّع حالة المراجعة — إن لزم لاحقًا — يكون في ملفّ محلّيّ، لا في Supabase.)

## 12) الملفّات المعدَّلة
| الملفّ | الحالة |
|---|---|
| `scripts/review-discovered-cities.mjs` | **جديد** — الأداة القارئة |
| `scripts/_test_review_discovered_cities.mjs` | **جديد** — اختبار وحدة (6 أصناف + توكيدات دوالّ) |
> **لم يُمَسّ:** `server.js` · `js/site-search.js` · search pipeline · noindex guard · `db/places/curated-places.json` · `db/cities-*` · slugs · canonical/hreflang · الأذكار · المسبحة · حساب الصلاة. (لا تُولَّد `reports/pending-discovered-cities.*` في هذه التذكرة — تُنشَأ عند تشغيلك على Supabase الحيّ.)

## 13) طريقة التشغيل
```bash
# حيّ (يقرأ Supabase):
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/review-discovered-cities.mjs
# دون اتّصال (اختبار):
node scripts/review-discovered-cities.mjs --fixture rows.json
# ضبط: عتبة النقرات + نطاق القُرب + وجهة الإخراج
node scripts/review-discovered-cities.mjs --min-selected 3 --near-deg 0.15 --out reports/pending-discovered-cities
# اختبار الوحدة:
node scripts/_test_review_discovered_cities.mjs
```

## 14) نتائج الاختبار
- ✅ `node --check` على الملفّين.
- ✅ **اختبار الوحدة: 23/23 passed** — الأصناف الستّة كلّها (curated اصطناعيّ ثابت) + توكيدات `cleanSlugFor`/`isCleanScript`/`classifyField`/الاقتراح/الـdedup/الخريطة.
- ✅ **تشغيل حقيقيّ** على curated الفعليّ (2980) عبر fixture: صنّف 6 صفوف صحيحًا (chefchaouen→ALREADY_CURATED، london-ca→SLUG_CONFLICT، near-rabat→NEAR_DUPLICATE، zzzplace-fr→NEEDS_AR_NAME، zzztestdorf-de→READY)، و**curated UNCHANGED**.
- ✅ نظافة: لا `POST/PATCH/DELETE`، لا كتابة curated، ملفّات الـdemo حُذفت، لا `reports/pending-discovered-cities.*` مُلتزَمة.

## 15) رسالة commit المقترحة
```
chore(cities): DISCOVERED-CITY-TO-CURATED-REVIEW-WORKFLOW-FIX-1 — add read-only discovered cities review script
```

---
**الخلاصة:** أداة قراءة-فقط تحوّل نقرات المستخدمين المتراكمة في `discovered_places` إلى قائمة مرشَّحة مصنَّفة (6 حالات) مع كشف التكرار/التضارب وتقييم جودة الأسماء per-lang — بلا أيّ ترقية أو كتابة curated/Supabase أو ترجمة. الترقية الفعليّة تبقى لكلّ دفعة تذكرةَ تطبيق منفصلة باعتمادك.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITY-TO-CURATED-REVIEW-WORKFLOW-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
