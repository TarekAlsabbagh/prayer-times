# تقرير ما قبل الدفع: DISCOVERED-CITIES-ADMIN-CURATED-STATUS-AFTER-PROMOTION-1

**النوع:** فصل المدن المُرقّاة عبر مسار discovered admin (حالة جديدة **`CURATED`**) عن المدن التي كانت curated أصلًا (**`ALREADY_CURATED`**).
**الحالة:** لم يُدفع — بانتظار اعتمادك. **القاعدة:** `HEAD = origin/main = 911aaab`. شجرة العمل: `server.js` فقط (+ سموك جديد + هذا التقرير).
**admin-only:** لا يلمس curated · sitemap · search العامّ · الصفحات العامّة · index.html · js/app.js العامّ · css العامّ · classifier (`review-discovered-cities.mjs`) · promote-commit · name-overrides · migrations.

---

## 1) اسم التذكرة
**DISCOVERED-CITIES-ADMIN-CURATED-STATUS-AFTER-PROMOTION-1**

## 2) أين عُرِّفت CURATED
في **طبقة بيانات اللوحة** فقط — `_buildDiscoveredAdminRows()` في `server.js` (بعد دمج سجلّ الترقية في كلّ صفّ). **ليست** في الـclassifier: المُصنِّف لا يعرف بجدول الترقيات، ويبقى يُرجِع `ALREADY_CURATED` كما هو. الترقية إلى CURATED **عرض فقط** (display reclass) على `r.status`:
```js
// classifier راجع ALREADY_CURATED (المدينة في curated المنشور) + سجلّ ترقية branch_committed ⇒ CURATED
if (r.status === 'ALREADY_CURATED' && r.promoteStatus === 'branch_committed') {
    r.status = 'CURATED';
}
```
أُضيفت CURATED أيضًا إلى: قائمة `STATUSES` (شريحة العدّ + خيار الفلتر) · `STATUS_RANK` (رتبة 4) · شارة CSS `.s-CURATED` (لون تركواز مميّز).

## 3) كيف تُفرَّق CURATED عن ALREADY_CURATED
| الحالة | الشرط | المعنى |
|---|---|---|
| **CURATED** | في curated المنشور (classifier=ALREADY_CURATED) **و** له سجلّ `discovered_place_promotions` بـ`promote_status='branch_committed'` | مدينة مرّت بمسار discovered → approved → promote-commit → دُمجت |
| **ALREADY_CURATED** | في curated المنشور **بدون** أيّ سجلّ ترقية | كانت موجودة أصلًا قبل أيّ مراجعة |

**حاسم:** الترقية تتطلّب **سجلّ الترقية كدليل** — لا تعتمد أبدًا على مجرّد وجود المدينة في curated. لذلك كلّ المدن القديمة (بلا سجلّ ترقية) تبقى ALREADY_CURATED. (مُثبَت: dammam في curated بلا سجلّ ⇒ ALREADY_CURATED؛ qatif في curated + سجلّ branch_committed ⇒ CURATED.)

## 4) مصدر الحقيقة
**`discovered_place_promotions` (migration 005)** حصرًا — عبر `_fetchDiscoveredPromotions()` التي تقرأ `promote_status / promote_branch / promote_commit_sha / promote_report_path / promote_committed_at`. لا مصدر آخر. (لا أعتمد على وجود curated وحده.)

## 5) ماذا لو migration 005 غير متاحة؟
**fallback آمن:** `_fetchDiscoveredPromotions()` تُرجِع `{}` عند غياب 005 (Supabase 404 → catch → خريطة فارغة) ⇒ `r.promoteStatus=''` ⇒ الشرط false ⇒ المدينة تبقى **ALREADY_CURATED**، **بلا أخطاء، بلا انهيار**، الصفحة تُرسَّم 200. (مُثبَت في السموك: خادم بلا مصدر ترقيات ⇒ qatif=ALREADY_CURATED، `counts.CURATED` غير موجود، الصفحة 200.)

## 6) هل احتجت migration جديدة؟
**لا.** أستعمل جدول 005 الحالي كما طلبت. **لم تُنشأ/تُعدَّل أيّ migration.**
> أُضيف **test seam للقراءة فقط** (`DISCOVERED_ADMIN_PROMOTIONS_FIXTURE`) داخل فرع Supabase-off من `_fetchDiscoveredPromotions` — **خامل تمامًا في الإنتاج** (يُقرأ فقط حين Supabase مُطفأة). السبب: لا يمكن حقن سجلّ ترقية لمدينة curated عبر promote-commit الحيّ (يَفشل في تحقّق `no_already_curated`)، فاحتجتُ بذرة قراءة لاختبار مسار CURATED. **ليست migration ولا تمسّ promote-commit logic.**

## 7) الملفّات المعدَّلة (2 + تقرير)
| الملفّ | التغيير |
|---|---|
| `server.js` | **+38/−5** — ترقية CURATED في `_buildDiscoveredAdminRows` · test-seam قراءة الترقيات (خامل بالإنتاج) · `STATUSES`+`STATUS_RANK`+CURATED · شارة `.s-CURATED` · خليّة الترقية تعرض committed_at+report · `promoteReportPath` في payload الـDrawer + سطر الترقية |
| `scripts/_smoke_discovered_cities_admin_curated_status_after_promotion_1.mjs` | **جديد** — 29 تأكيدًا (خادمان: مع/بلا مصدر ترقيات) |

**لم يُمَسّ:** `scripts/review-discovered-cities.mjs` (classifier) · curated · sitemap · search العامّ · الصفحات العامّة · index.html · js/app.js · css · migrations · promote-commit/name-overrides منطق.

## 8) تأثير على الفلاتر
- **فلتر CURATED** (خيار جديد): يعرض فقط صفوف `data-status="CURATED"` (المُرقّاة عبر discovered admin).
- **فلتر ALREADY_CURATED**: يعرض فقط الموجودة أصلًا — المُرقّاة لم تَعُد ALREADY_CURATED (صارت CURATED) ⇒ لا اختلاط.
- **فلتر all**: يعرض الحالتين. منطق الفلتر client-side (`apply()`) يطابق `data-status` حرفيًّا ⇒ **بلا أيّ تغيير في كود client** (CURATED مجرّد قيمة status جديدة). شريحتا العدّ (CURATED:N / ALREADY_CURATED:M) تنفصلان تلقائيًّا.

## 9) تأثير على البحث
- `data-text` لكلّ صفّ يحوي `r.status` ⇒ صفوف CURATED قابلة للبحث بـ«curated» + بالاسم/slug/الدولة/aliases (شريط البحث من التذكرة السابقة بلا تغيير).
- البحث طبقة فوق الفلتر (الفلتر + البحث يُجمَعان بـAND في `apply()`) ⇒ **البحث داخل فلتر CURATED وداخل فلتر ALREADY_CURATED يعملان** لأنّ كلا الصفّين يحملان `data-status` صحيحًا + `data-text` كاملًا (مُثبَت في السموك).

## 10) تأثير على last_activity_at
**بلا تغيير في الصيغة** — `last_activity_at = MAX(name_override.updated_at · promote.committed_at · review.reviewed_at · created_at)`. صفّ CURATED له `promote_committed_at` ⇒ يدخل في الـMAX تلقائيًّا، فترتيب CURATED يعتمد على committed_at عند كونه الأحدث. الترتيب التنازليّ محفوظ (مُثبَت: qatip CURATED بـcommitted 06-14 يظهر فوق dammam ALREADY_CURATED بـcreated 06-10).

## 11) نتائج السموك
- **سموك التذكرة الجديد: 29/29 ✓** — CURATED مقابل ALREADY_CURATED · counts منفصلة · branch/sha/report/committed_at محفوظة · last_activity_at=committed_at · الترتيب التنازليّ · شريحة+فلتر+شارة CURATED · خليّة الترقية تعرض committed_at+report · data-text قابل للبحث+الفلترة · **fallback بلا مصدر ترقيات ⇒ ALREADY_CURATED بلا أخطاء** · 0 أسرار · curated غير ممسوس · `/`→200 · admin بلا token→401.
- **regression — كامل سويت admin (11 سموك): 287/287، صفر فشل** — curated_status 29 · search_and_near_duplicate 34 · filter_last_activity 23 · name_overrides 31 · sorting_and_branch_status **31** (testville المُرقّاة-غير-curated تبقى READY_FOR_REVIEW — تأكيد أنّ غير-curated لا يتأثّر) · promote_commit 22 · promote_commit_error_diagnostics 32 · promote_preview 28 · review_actions 18 · dashboard_mvp 21 · ssr_name_resolution 18.
- **regression عامّ: 8/8 صفحات عامّة → 200** + admin بلا token → **401**.
- **فحص JS المُضمَّن في صفحة admin المُولَّدة: كتلة واحدة، 0 أخطاء.**

## 12) node --check
`node --check server.js` → **سليم**.

## 13) admin-only ✅
التغيير حصرًا في `_buildDiscoveredAdminRows` + `_fetchDiscoveredPromotions` (طبقة بيانات admin) + render اللوحة (مسار admin، noindex). **لا route عامّ في الـdiff.** الـclassifier لم يُمَسّ ⇒ promote-commit + الصفحات العامّة + أسماء المدن غير متأثّرة.

## 14) الصفحات العامّة لم تتأثّر ✅
8/8 صفحات عامّة → 200. لا مسار عامّ في الـdiff؛ CURATED قيمة عرض داخل اللوحة فقط.

## 15) رسالة commit المقترحة
```
feat(admin): DISCOVERED-CITIES-ADMIN-CURATED-STATUS-AFTER-PROMOTION-1 — separate promoted curated cities from already-curated matches
```
الالتزام = `server.js` + السموك الجديد + هذا التقرير (3 ملفّات، معزولة).

---

**الخلاصة:** المدينة التي رُقّيت من discovered (لها سجلّ `branch_committed` في 005) وأصبحت في curated تظهر الآن **CURATED**، منفصلةً عن **ALREADY_CURATED** (الموجودة أصلًا بلا سجلّ ترقية) — بفلتر+شريحة+شارة خاصّة، مع عرض branch/sha/committed_at/report. **بلا migration، admin-only، curated غير ممسوس، fallback آمن عند غياب 005، الفلاتر/البحث/last_activity_at محفوظة، 287/287 admin + 8/8 عامّ.**

**للاعتماد أرسِل:** `أعتمد دفع تقرير: DISCOVERED-CITIES-ADMIN-CURATED-STATUS-AFTER-PROMOTION-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا أبدأ أيّ تذكرة جديدة ولا صفحة أذكار قبل اعتمادك؛ والأذكار موقوفة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
