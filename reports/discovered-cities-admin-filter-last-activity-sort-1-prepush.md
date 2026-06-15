# تقرير ما قبل الدفع: DISCOVERED-CITIES-ADMIN-FILTER-LAST-ACTIVITY-SORT-1

**النوع:** إصلاح ترتيب لوحة discovered admin — توحيد الترتيب الافتراضيّ على **`last_activity_at` تنازليًّا** داخل كلّ فلتر.
**الحالة:** لم يُدفع — بانتظار اعتمادك. **القاعدة:** `HEAD = origin/main = 708182d`.
**admin-only:** لا يلمس index.html · js/app.js · css العامّ · curated · sitemap · search · صفحات عامّة · أسماء المدن العامّة · منطق promote-commit/classification/name-edit · migration 005/006.

---

## 1) السبب الجذريّ + الإصلاح
الترتيب الافتراضيّ كان يستعمل حقلًا `lastActivity` محسوبًا **بالأولويّة (coalesce)**: `promote → review → last_used → created` — وكان **يُغفِل تمامًا `name_overrides.updated_at`** (المُضاف في تذكرة name-edit)، ويختار أوّل قيمة بالأولويّة لا **الأحدث**. فمدينة عُدِّل اسمها اليوم لكن رُوجِعت قديمًا كانت تظهر بتاريخ المراجعة القديم → لا تطفو للأعلى.
**الإصلاح:** أصبح `last_activity_at = أكبر (MAX) تاريخ متاح** من المصادر الأربعة (لا coalesce) → **أحدث عمليّة تفوز مهما كان نوعها**.

## 2) كيف حُسِب `last_activity_at` + الحقول الداخلة
```js
last_activity_at = MAX( name_override.updated_at ,
                        promote.committed_at ,
                        review.reviewed_at ,
                        discovered.created_at )   // الأخير fallback (الأرضيّة)
```
- **الحقول (موجودة سلفًا — لا migration):**
  - `discovered_place_name_overrides.updated_at` (migration 006)
  - `discovered_place_promotions.promote_committed_at` (migration 005)
  - `discovered_place_reviews.reviewed_at` (migration 004)
  - `discovered_places.created_at` (المصدر) — **fallback**.
- **MAX لفظيّ (lexicographic):** كلّ التواريخ ISO-8601 من نفس المخزن (Supabase/MEM) بنفس الصيغة، فالترتيب اللفظيّ = الزمنيّ. (لا خلط صيغ — لا حاجة لـ`Date.parse`.)
- **`last_used_at` (بحث عضويّ) ليس ضمن الحساب** — التزامًا بقائمة المصادر الأربعة في التذكرة (إن أردتَه مضمَّنًا للـpending أخبرني).

## 3) التعامل مع null
- التواريخ الفارغة/null **تُستبعَد** قبل الـMAX (`[...].filter(Boolean)`).
- `created_at` دائمًا حاضر → **الأرضيّة** → `last_activity_at` لا يكون null أبدًا.
- نتيجةً: **العناصر بلا نشاط إداريّ لا تطفو فوق ذات النشاط الحديث** — تُرتَّب بتاريخ اكتشافها فقط (مُتحقَّق: مدينة حديثة الإنشاء بلا أيّ إجراء تبقى أسفل المدن ذات الإجراءات الأحدث).

## 4) هل احتجت migration جديدة؟
**لا.** كلّ الحقول موجودة في 004/005/006 + المصدر. **لم أُنشئ أيّ migration** ولم أعدّل 005/006.

## 5) آليّة الفلاتر + الترتيب (بلا UI جديد، بلا تغيير client)
- الفرز الافتراضيّ سيرفريًّا = `last_activity_at` تنازليّ (tiebreak: pick تنازليّ ثمّ slug). فأيّ فلتر (approved/review/pending/already_curated/all) يعرض مجموعته الفرعيّة **بنفس ترتيب الأحدث→الأقدم** (الفلتر client-side يُخفي/يُظهِر ويحافظ على الترتيب).
- مؤشّر الترتيب القائم (Sort by = **Last Activity**، Direction = **Descending**) يعكس ذلك. عند تغيير الفلتر أو refresh يبقى الترتيب. **لا حاجة لـUI جديد، ولا تغيير في client JS** — فقط صُحِّحت **قيمة** `last_activity_at`.

## 6) الملفّات المعدَّلة (2)
| الملفّ | التغيير |
|---|---|
| `server.js` | **+14/−6** — في `_buildDiscoveredAdminRows`: حساب `last_activity_at` بـMAX من المصادر الأربعة (بدل coalesce، + ضمّ name-override.updated_at) · `lastActivity` يبقى alias للقيمة نفسها · الفرز الافتراضيّ على `last_activity_at` · `data-lastactivity` + payload الـDrawer يحملان `last_activity_at` |
| `scripts/_smoke_discovered_cities_admin_filter_last_activity_sort_1.mjs` | **جديد** — 23 تأكيدًا |

**لم يُمَسّ:** index.html · js/app.js · css · curated · sitemap · search · migrations · promote-commit/classification/name-edit logic.

## 7) نتائج السموك + node --check
- **سموك التذكرة الجديد: 23/23 ✓** — baseline=created fallback · **name-override حديث يرفع مدينة قديمة للأعلى** · **review حديث يرفع أعلى** · **promote حديث يرفع للقمّة** · الترتيب النهائيّ `[ccity,bcity,acity,dcity]` · المدينة الخاملة لا تطفو · **فلتر approved/pending تنازليّ** · reviews/promotions/name-edit/classification غير ممسوسة · 0 أسرار · curated ثابت.
- **regression — كامل سويت admin (9 سموك) = 224/224، صفر فشل:** filter_last_activity 23 · name_overrides 31 · sorting 31 · commit 22 · diagnostics 32 · preview 28 · review 18 · dashboard_mvp 21 · ssr 18.
- **`node --check server.js` سليم.**
- **regression عامّ (خادم بلا env): 9/9** — `/` `/prayer-times-in-makkah` `/qibla` `/moon-today` `/azkar` `/today-hijri-date` `/zakat-calculator` `/sitemap-main.xml` → **200** · admin dashboard بلا token → **403** fail-closed.

## 8) تأكيدات النطاق
- ✅ **admin-only** — التغيير حصرًا في `_buildDiscoveredAdminRows` + render اللوحة (مسار admin فقط).
- ✅ **الصفحات العامّة لم تتأثّر** (9/9 → 200؛ لا مسار عامّ في الـdiff).
- ✅ **/admin ما زال محميًّا** (403 بلا token).
- ✅ لا تأثير على promote-commit/classification/name-edit/reviews/promotions (مُتحقَّق في السموك).

## 9) رسالة commit المقترحة (المعتمدة منك)
```
fix(admin): DISCOVERED-CITIES-ADMIN-FILTER-LAST-ACTIVITY-SORT-1 — sort filtered discovered admin results by latest activity desc
```
الالتزام = `server.js` + السموك الجديد + هذا التقرير (3 ملفّات، معزولة).

---

**الخلاصة:** الترتيب الافتراضيّ داخل كلّ فلتر الآن `last_activity_at` تنازليّ، و`last_activity_at` = **أكبر** تاريخ من (name-override.updated_at · promote.committed_at · review.reviewed_at · created_at fallback) — يُصلِح إغفال name-override + يجعل أحدث عمليّة تفوز. **بلا migration، بلا UI جديد، admin-only، 224/224 admin + 9/9 عامّ، 0 أثر على الجداول/المنطق الأخرى.**

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITIES-ADMIN-FILTER-LAST-ACTIVITY-SORT-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا أبدأ أيّ تذكرة جديدة أو صفحة أذكار قبل اعتمادك؛ والأذكار موقوفة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
