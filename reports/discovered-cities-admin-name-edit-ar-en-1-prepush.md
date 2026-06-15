# تقرير ما قبل الدفع: DISCOVERED-CITIES-ADMIN-NAME-EDIT-AR-EN-1

**النوع:** ميزة لوحة admin — تعديل اسم المدينة (عربي/إنجليزي) قبل الترقية، يُستخدَم عند promote-commit بدل الاسم الخام.
**الحالة:** لم يُدفع — بانتظار اعتمادك. **القاعدة:** `HEAD = origin/main = d827360`.
**admin-only:** لا يلمس `curated-places.json` · sitemap · search · صفحات عامّة · index.html · css/app.js العامّين · `discovered_place_reviews` (004) · `discovered_place_promotions` (005).

---

## 1) كيف يُحفظ — جدول مستقلّ ثالث (كما طلبت)
**جدول جديد منفصل `discovered_place_name_overrides` (migration 006)** — ليس في reviews ولا promotions:
- reviews = قرار المراجعة/التصنيف · promotions = حالة الترقية/branch/sha · **name_overrides = الأسماء فقط**.
- **لا يُحدَّث `reviewed_at` عند تعديل الاسم** (جدول منفصل، لا trigger مشترك) — مُتحقَّق في السموك.

## 2) migration 006 (محتوى مختصر)
`db/places/migrations/006_discovered_place_name_overrides.sql` — جدول `discovered_place_name_overrides`:
```
id uuid pk · slug text · country_code text(check ^[a-z]{2}$) · name_ar text · name_en text
created_at timestamptz default now() · updated_at timestamptz default now() · unique(slug,country_code)
+ index(country_code)
```
**آمنة:** `create table IF NOT EXISTS` + `create index IF NOT EXISTS` فقط · **لا DELETE · لا UPDATE على بيانات قائمة · لا يلمس أيّ جدول آخر · لا curated · لا صفحات عامّة.** يُطبَّق يدويًّا في Supabase (كما 001–005). **خطوتك بعد الدفع.**

## 3) endpoints المُضافة (token-gated)
| المسار | الوصف |
|---|---|
| `GET /api/admin/discovered-name-overrides` | يُرجِع كلّ الـoverrides المحفوظة (`{ok,overrides}`) |
| `POST /api/admin/discovered-name-overrides` | يحفظ `name_ar`/`name_en` لمدينة (`{slug,countryCode,name_ar?,name_en?}`) |
- بلا token → **401** (وبلا `ADMIN_TOKEN` على السيرفر → **403**). non-JSON → 415.
- **التحقّق:** slug غير فارغ + صيغة صحيحة؛ cc صحيح؛ **name فارغ إذا أُرسِل → 400**؛ بلا أيّ اسم → 400؛ trim؛ حدّ 200 حرف؛ **لا يُغيَّر slug إطلاقًا**.
- **تدرّج آمن:** لو الجدول غائب (006 غير مطبَّقة) → القراءة تُرجِع `{}` (اللوحة تعرض الأسماء الأصليّة، لا تنهار)؛ الحفظ يُرجِع `502 name_override_save_failed` + warning في اللوج (اللوحة سليمة).

## 4) كيف تظهر الحقول في لوحة admin
- **عمود ar/en في الجدول** يعرض **الاسم الفعّال** (override إن وُجد، وإلّا الخام) + علامة **✎** للمعدَّل → بعد refresh تبقى ظاهرة (تُقرأ من الجدول كلّ مرّة).
- **في Drawer المدينة** (زر «Review ▸»): قسم **Edit names** فيه حقلان (Arabic name / English name) مملوءان بالقيمة الفعليّة + زرّ **Save names** + حالة نجاح. بعد الحفظ: «saved ✓» **بلا reload**، وتُحدَّث خليّة الصفّ + علامة ✎ فورًا.

## 5) كيف يُستخدَم override عند promote-commit
`_buildPromotePreview` (يغذّي المعاينة **و** الـcommit **و** التقرير) يجلب الـoverrides ويمرّرها لـ`_buildPromoteCandidate`:
- **إن وُجد override:** `names.ar`/`names.en` للمرشَّح = الاسم المعدَّل (بدل الخام).
- **إن لم يوجد:** السلوك الحالي (الاسم الخام) — fallback مُتحقَّق.
- **لا يُغيَّر:** slug · coordinates · country_code. **aliases:** مُتحقَّق من الكود أنّها تُبنى من `raw.aliases` (لا تُولَّد من الاسم) → **تعديل الاسم لا يمسّ aliases إطلاقًا** (لا تغيير، لا حاجة لتقرير منفصل).
- الاسم المعدَّل يبقى خاضعًا لفحص `ar_script_clean`/`en_script_clean` القائم (بوّابة جودة) — فاسم عربيّ نظيف يمرّ، والغثّ يُحجَب 422.

## 6) نتائج السموك + node --check
- **سموك التذكرة الجديد: 31/31 ✓** — auth 401 · validation (slug/name فارغ/بلا اسم) 400 · fallback=الخام قبل الـoverride · save 200 · GET يرجع الـoverride · rows تُظهِر الاسم الفعّال (refresh/rehydration) · **promote-commit يستخدم الاسم المعدَّل** (slug/coords ثابتة) · **reviews غير ممسوسة** (reviewedAt + decision ثابتان) · classification ثابت · ✎ في HTML · 0 أسرار · curated غير معدّل.
- **regression — كامل سويت admin (8 سموك) = 201/201، صفر فشل:** name_overrides 31 · sorting 31 · commit 22 · diagnostics 32 · preview 28 · review 18 · dashboard_mvp 21 · ssr 18.
- **`node --check server.js` سليم** · JS اللوحة المُولَّد يُحلَّل بلا أخطاء (`vm.Script`) + عناصر التعديل حاضرة.
- **regression عامّ (خادم بلا env): 10/10** — `/` `/prayer-times-in-makkah` `/qibla` `/moon-today` `/azkar` `/today-hijri-date` `/zakat-calculator` `/sitemap-main.xml` → **200** · admin dashboard + name-overrides بلا token → **403** fail-closed.

## 7) الملفّات المعدَّلة (3)
| الملفّ | التغيير |
|---|---|
| `server.js` | **+137/−6** — `_saveDiscoveredNameOverride`/`_fetchDiscoveredNameOverrides` + MEM · attach override + `displayNameAr/En`+`hasNameOverride` في `_buildDiscoveredAdminRows` · حقن override في `_buildPromoteCandidate`(+param) و`_buildPromotePreview` · عمود ar/en يعرض الفعّال + ✎ + `data-arcell/encell` · قسم Edit names في Drawer + CSS + JS الحفظ · معالِجا GET/POST `/discovered-name-overrides` |
| `db/places/migrations/006_discovered_place_name_overrides.sql` | **جديد** — الجدول المنفصل |
| `scripts/_smoke_discovered_cities_admin_name_overrides_1.mjs` | **جديد** — 31 تأكيدًا |

## 8) تأكيدات النطاق (طلبك)
- ✅ **الصفحات العامّة لم تتأثّر** (10/10 → 200؛ لا مسار عامّ في الـdiff).
- ✅ **`/admin` ما زال محميًّا** (403 بلا token؛ كلّ المسارات الجديدة token-gated).
- ✅ **التعديل لا يلمس classification** (تُحسَب من curated، ثابتة) **ولا promotion** (جدول 005 منفصل، لم يُكتَب عند تعديل الاسم) **ولا reviews** (reviewed_at ثابت).
- ✅ **لا تغيير slug/coords/cc/aliases.**

## 9) رسالة commit المقترحة
```
feat(admin): DISCOVERED-CITIES-ADMIN-NAME-EDIT-AR-EN-1 — editable ar/en city names (separate overrides table, migration 006) used at promote-commit
```
الالتزام = `server.js` + `db/places/migrations/006_…sql` + السموك الجديد + هذا التقرير (4 ملفّات، معزولة).

## 10) خطوتك بعد الدفع (Supabase)
طبِّق **`db/places/migrations/006_discovered_place_name_overrides.sql`** مرّة في Supabase SQL editor. حتى ذلك الحين: اللوحة تعمل وتعرض الأسماء الأصليّة (الحفظ يُرجِع خطأً آمنًا). **لن أطبّق أيّ migration على Supabase — هذه خطوتك.**

---

**الخلاصة:** تعديل اسم ar/en من اللوحة → جدول مستقلّ ثالث (006) → يُحفَظ ويبقى بعد refresh → يُستخدَم عند promote-commit بدل الخام (slug/coords/cc/aliases ثابتة) → **لا يخلط مع reviews/promotions/classification**. **0 تعديل عامّ، /admin محميّ، 201/201 admin + 10/10 عامّ، 0 أسرار.**

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITIES-ADMIN-NAME-EDIT-AR-EN-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا أبدأ أيّ صفحة أذكار أو تذكرة أخرى قبل اعتمادك. ولا تُبدأ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
