# تقرير ما قبل الدفع: DISCOVERED-CITIES-ADMIN-DASHBOARD-SORTING-AND-BRANCH-STATUS-1

**النوع:** تحسين لوحة `/admin/discovered-cities` — (1) حالة branch-committed واضحة + (2) ترتيب قابل للتحكّم (Sort by / Direction).
**الحالة:** لم يُدفع — بانتظار اعتمادك. **القاعدة:** `HEAD = origin/main = 5a64005` (مُعاد توجيهه — rebase — فوق تذكرة `DISCOVERED-ADMIN-SMOKE-FIXTURE-REFRESH-1` المدفوعة؛ سموك هذه التذكرة يستعمل الآن مدينة `testville` الاصطناعيّة غير-curated بدل `khams-djouamaa` الذي صار curated بدمجك).
**لا يلمس:** `curated-places.json` · sitemap · search · صفحات عامّة · منطق الحساب · **منطق GitHub commit الأساسيّ** (أُضيف فقط حفظ promote-status بعد نجاح الـcommit — وهو المسموح صراحةً).

---

## 1) القرار الأساسيّ — أين يُحفظ promote_status؟ (هل حقل جديد في reviews أم لا)

**جدول جديد منفصل `discovered_place_promotions` (migration 005)، وليس إضافة حقول إلى `discovered_place_reviews`.**

الأسباب (وكلّها يخدم طلبك «لا تخلط classification مع promotion»):
1. **جدول reviews فيه trigger** (`...reviewed_at_trigger`, migration 004) يضبط `reviewed_at = now()` عند **كلّ UPDATE** — فلو كتبنا promote في صفّ المراجعة لـ**أفسدنا توقيت المراجعة** (كان سيصبح وقت الـcommit لا وقت القرار).
2. **فصل نظيف:** حالة المراجعة (review_decision) + حالة التصنيف (classification) + حالة الترقية (promote_status) في طبقات منفصلة — لا خلط.
3. **تدرّج آمن (graceful):** جدول جديد إمّا موجود كاملًا أو غائب (Supabase 404) → خريطة فارغة → لا شارات، **بلا أخطاء**. (بعكس إضافة أعمدة لجدول قائم حيث SELECT الصريح ينهار لو لم تُطبَّق الهجرة.)

> **ملاحظة:** `discovered_place_reviews` و migration 004 **لم تتغيّرا إطلاقًا**.

## 2) كيف يُحفظ promote_status (التدفّق)

بعد نجاح `POST /api/admin/discovered-cities/promote-commit` (الردّ 200 committed)، **وقبل إرسال الردّ**، يُكتب لكلّ مدينة مُرقّاة صفّ في `discovered_place_promotions` (upsert على `slug,country_code`):
```
promote_status      = 'branch_committed'
promote_branch      = admin/promote-discovered-YYYYMMDD-HHMM[-slug]
promote_commit_sha  = <commit sha>
promote_report_path = reports/admin-promote-batch-<ts>.md
promote_committed_at = <ISO الآن>
```
- **Best-effort تمامًا:** داخل `try/catch` — **لا يُفشِل الـcommit الناجح أبدًا** (لو الجدول غير موجود/Supabase ساقط → يُسجَّل سطر آمن «non-fatal» ويُكمَل). هذا **التغيير الوحيد** في مسار الـcommit.
- **محلّيًّا/اختبار (Supabase off):** يُكتب في خريطة ذاكرة `_DISCOVERED_PROMOTIONS_MEM` → فلا حاجة لـmigration لتشغيل السموك.

## 3) منطق Last Activity

لكلّ صفّ: `lastActivity =` أوّل قيمة غير فارغة بالأولويّة:
```
1. promote_committed_at   (رُقّيت إلى branch)
2. reviewed_at            (روجِعت)
3. last_used_at           (آخر استخدام)
4. created_at             (أوّل ظهور)
```
**الترتيب الافتراضيّ للوحة = Last Activity تنازليًّا** (الأحدث تعاملًا في الأعلى) — يُحسَب **سيرفريًّا** (أوّل رسم/بلا JS صحيح)، tiebreak: pick تنازليًّا ثمّ slug تصاعديًّا.

## 4) خيارات Sort by (9) — `<select id="f-sort">`
`Last Activity` (افتراضي) · `Last Seen` · `First Seen` · `Pick Count` · `Search Count` · `Status` · `Review Decision` · `Country` · `Slug`.

## 5) خيارات الاتجاه — `<select id="f-dir">`
`Descending` (افتراضي) · `Ascending`.

## 6) كيف تحترم الفلاتر الترتيب
الترتيب والفلاتر **كلاهما client-side ويتركّبان**: `sortRows()` يعيد ترتيب صفوف `<tbody>` حسب `data-*` (data-lastactivity/lastseen/firstseen/pick/search/statusrank/review/cc/slug) ثمّ يستدعي `apply()` الذي يُظهِر/يُخفي حسب الفلاتر. فأيّ فلتر (مثلاً Review=approved) + أيّ Sort by + اتجاه → النتائج المفلترة مرتّبة بالاختيار؛ وعكس الاتجاه يعكسها. السيرفر يوفّر ترتيب Last Activity تنازليّ كأوّل رسم.

## 7) منع ALREADY_CURATED قبل الدمج (الأهمّ) — **بلا تغيير في منطق التصنيف**
- `ALREADY_CURATED` و `pageStatus='curated · indexable'` يُحسبان من **ملفّ curated المنشور** (`_CURATED_PLACES` / `_findPlaceBySlug`) — لا علاقة لهما بالترقية.
- **Prepare Preview** لا يكتب شيئًا → الحالة لا تتغيّر (مُتحقَّق: testville تبقى `READY_FOR_REVIEW` + promoteStatus فارغ بعد المعاينة).
- **Commit & Push to Branch** لا يغيّر curated على main → المُصنِّف يبقى **غير** `ALREADY_CURATED` + الصفحة تبقى `discovered · noindex`. الجديد فقط: `promote_status='branch_committed'` (طبقة منفصلة).
- **`ALREADY_CURATED` يظهر فقط** حين يصير الـslug فعلًا في `curated-places.json` على main (بعد **دمجك اليدويّ + إعادة نشر Render**) — مُتحقَّق: مدينة كلون لـ`riyadh` (موجودة في curated) تظهر `ALREADY_CURATED` فورًا، بينما testville لا.
- اللوحة الآن تُظهِر للمدينة المُرقّاة **الحالتين معًا** كما طلبت: `promote = branch_committed` + `page = discovered · noindex` — أي «رُقّيت إلى فرع، لم تُدمَج بعد».

## 8) ماذا بعد الدمج إلى main
بعد دمجك اليدويّ + إعادة نشر Render، يقرأ النظام curated الجديد فيصبح الـslug تلقائيًّا `ALREADY_CURATED` + `curated · indexable` (سلوك قائم، بلا كود إضافيّ).

## 9) الملفّات المعدَّلة (3)
| الملفّ | التغيير |
|---|---|
| `server.js` | **+132/−11** — `_saveDiscoveredPromotion`/`_fetchDiscoveredPromotions` + `_DISCOVERED_PROMOTIONS_MEM` · attach promote-fields + `lastActivity` + الترتيب الافتراضيّ Last Activity desc + `promoteCounts` في `_buildDiscoveredAdminRows` · عمود promote + شارة + `STATUS_RANK` + `data-*` للترتيب + selects (Sort by/Direction) + JS الترتيب client-side + صفّ drawer في `_renderDiscoveredAdminPage` · حفظ promote-status best-effort بعد نجاح الـcommit |
| `db/places/migrations/005_discovered_place_promotions.sql` | **جديد** — الجدول المنفصل (يُطبَّق يدويًّا في Supabase كـ004) |
| `scripts/_smoke_discovered_cities_admin_dashboard_sorting_and_branch_status_1.mjs` | **جديد** — 31 تأكيدًا |

**لم يُمَسّ:** `curated-places.json` · sitemap · search · صفحات عامّة · index.html · app.js · css · i18n · `discovered_place_reviews`/migration 004 · منطق GitHub commit الأساسيّ.

## 10) خطوتك بعد الدفع (Supabase)
**طبِّق `db/places/migrations/005_discovered_place_promotions.sql` مرّة في Supabase SQL editor** (مثل 004). حتى ذلك الحين: **الترتيب يعمل فورًا** (لا يحتاج قاعدة بيانات)، و**حفظ حالة branch-committed يبقى خاملًا بأمان** (لا شارات، لا أخطاء) حتى تُطبَّق الهجرة. بعدها تظهر شارة `branch_committed` للمدن المُرقّاة.

## 11) نتائج الاختبار (اختبارات القبول التسعة + regression)
**سموك التذكرة الجديد: 31/31 ✓** — يُثبِت كلّ بنود قبولك:
- ✅ Preview لا يحوّل إلى ALREADY_CURATED ولا يضبط promote (promoteStatus فارغ بعد المعاينة).
- ✅ Commit يضبط `promote_status='branch_committed'` (+ branch `admin/promote-discovered-…testville` + commit sha).
- ✅ curated المحلّيّ غير معدّل (byte-for-byte).
- ✅ testville تبقى `discovered · noindex` + **غير** ALREADY_CURATED بعد الـcommit.
- ✅ ALREADY_CURATED فقط للمدينة الموجودة في curated (كلون riyadh) — testville لا.
- ✅ الترتيب الافتراضيّ Last Activity تنازليّ (testville = الصفّ الأوّل بعد الـcommit؛ الصفوف تنازليّة).
- ✅ عناصر Sort by (9 خيارات) + Direction (desc/asc) + عمود promote + شارة branch_committed + `data-*` للترتيب حاضرة.
- ✅ 0 أسرار في JSON/HTML.
- ✅ صفحات عامّة 200.

**regression — كامل سويت admin (7 سموك) فوق fixtures الـ`testville` النظيفة = 170/170، صفر فشل:** sorting **31/31** · commit **22/22** · diagnostics **32/32** · preview **28/28** · review **18/18** · dashboard_mvp **21/21** · ssr_name_resolution **18/18**. + `node --check server.js` سليم + JS اللوحة المُولَّد يُحلَّل بلا أخطاء (`vm.Script`). + regression عامّ: `/` `/qibla` `/moon-today` `/azkar` `/today-hijri-date` `/zakat-calculator` `/sitemap-main.xml` `/prayer-times-in-{riyadh,makkah,jeddah}` → **200** · `/prayer-times-in-mecca` → **301 → /makkah** (تحويل canonical قائم) · admin بلا token → **403** fail-closed.

> **ملاحظة rebase:** هذه التذكرة أُعيد توجيهها فوق `5a64005` (تذكرة fixture-refresh المدفوعة). سموكها الخاصّ حُدِّث ليستعمل `testville` بدل `khams-djouamaa` (الذي صار curated بدمجك) — تطابقًا مع بقيّة السويت. لا تغيير في كود الميزة (server.js) عن النسخة المعتمدة سابقًا.

## 12) قيود الأدوات (إفصاح)
الترتيب التصاعديّ/التنازليّ هو سلوك **client-side** (إعادة ترتيب عُقد DOM)؛ السموك يتحقّق من: الترتيب الافتراضيّ السيرفريّ (Last Activity desc) + وجود العناصر/الـ`data-*` + أنّ JS اللوحة يُحلَّل بلا أخطاء. إعادة الترتيب الفعليّة في المتصفّح تُؤكَّد بصريًّا عند فتحك اللوحة. حفظ الحالة على الإنتاج يُؤكَّد بعد تطبيق migration 005 + نقرك الزرّ (WebFetch لا يُرسِل POST/token).

## 13) رسالة commit المقترحة (المعتمدة منك)
```
feat(admin): DISCOVERED-CITIES-ADMIN-DASHBOARD-SORTING-AND-BRANCH-STATUS-1 — add branch status and sortable review dashboard
```
الالتزام = `server.js` + `db/places/migrations/005_…sql` + السموك الجديد + هذا التقرير (4 ملفّات، معزولة).

---

**الخلاصة:** حالة `branch_committed` منفصلة (جدول 005 جديد، لا يخلط مع review/classification، لا يلمس trigger المراجعة) تُحفَظ best-effort بعد نجاح الـcommit؛ + ترتيب افتراضيّ Last Activity تنازليّ + Sort by (9) + اتجاه (desc/asc) يحترمها الفلاتر. **ALREADY_CURATED لا يظهر إلّا بعد دمج فعليّ إلى main** (بلا تغيير منطق التصنيف). **0 تعديل curated/sitemap/search/صفحات عامّة، 0 أسرار، 170/170 سويت admin (7 سموك) فوق fixtures نظيفة، 31/31 قبول.**

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITIES-ADMIN-DASHBOARD-SORTING-AND-BRANCH-STATUS-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
