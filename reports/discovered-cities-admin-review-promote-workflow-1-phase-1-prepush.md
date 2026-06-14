# تقرير ما قبل الدفع: DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 — PHASE 1

**النوع:** ميزة (المرحلة 1/4) — قرارات مراجعة يدويّة على لوحة `/admin/discovered-cities`. **حفظ في Supabase فقط — لا ترقية، لا commit/push، لا GitHub، لا تعديل curated.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `HEAD = origin/main = 7144b73`. **التصميم:** [discovered-cities-admin-review-promote-workflow-1-design.md](discovered-cities-admin-review-promote-workflow-1-design.md).

---

## 1) schema النهائي + migration
جدول جديد **`discovered_place_reviews`** (منفصل تمامًا عن `discovered_places` — 0 حقول مضافة هناك): `id · slug · country_code · decision(check 5 قيم) · note · duplicate_of · reviewed_by · reviewed_at · source_snapshot(jsonb)` + **`unique(slug, country_code)`** (upsert) + فهارس (decision/country) + trigger يحدّث reviewed_at. **migration:** `db/places/migrations/004_discovered_place_reviews.sql` — **تُطبَّق يدويًّا مرّة في Supabase SQL editor** (مثل 001/002/003). RLS off (service-role سيرفريّ).
> **القرارات الخمس:** `approved · skipped · needs_ar_name · duplicate · needs_review`.

## 2) endpoints
- **`POST /api/admin/discovered-cities/review`** (جديد) — token-gated · JSON-only · يحفظ القرار (upsert). يردّ `{ok, persisted, review}`.
- **`GET /api/admin/discovered-cities`** + **`GET /admin/discovered-cities`** (قائمة من MVP) — الآن **تدمج القرار الحاليّ** لكلّ صفّ (reviewDecision/reviewNote/reviewDuplicateOf) + `reviewCounts`.
- **لا** preview/promote/commit endpoints في هذه المرحلة (مرحلتا 2/3).

## 3) أزرار الواجهة (Drawer)
كلّ صفّ: شارة القرار الحاليّ + زر **«Review ▸»** يفتح **Drawer** يعرض كلّ التفاصيل (slug/ar/en/cc/country/source/lat,lng/tz/pick+search/first+last seen/name_quality/status/page-status/**dedup: near+already-curated+slug-conflict**/روابط/raw JSON) + الأزرار الخمس + حقل **note** + حقل **duplicate_of** (يظهر عند Duplicate) + **Save**. **فلتر جديد `review_decision`** (pending/approved/skipped/needs_ar_name/duplicate/needs_review) + **عدّادات review** أعلى الصفحة. القرار يظهر فورًا بعد الحفظ + يبقى بعد refresh.

## 4) طريقة الحماية
- كلّ `POST /review` عبر `_adminAuthState` (`ADMIN_TOKEN`، `?token=` أو `Authorization: Bearer`، زمن-ثابت): **بلا env → 403** · مفقود/خاطئ → **401** · صحيح → **200**.
- **anti-CSRF:** يشترط `Content-Type: application/json` (يرفض form-encoded) + لا cookies. حدّ حجم 16KB → 413. method≠POST → 405. JSON تالف → 400. مدخلات غير صالحة → 400.
- **الـtoken في العميل:** الصفحة لا تُضمِّن الـtoken في HTML/JS؛ سكربت الحفظ **يقرؤه من URL الصفحة وقت التشغيل** ويرسله كـ`Authorization: Bearer` (لا في رابط الـPOST). فلا token في مصدر الصفحة.

## 5) نتائج حفظ القرار + refresh (سموك ذاتيّ-الاكتفاء — Supabase off → مخزن ذاكرة dev)
- حفظ `khams-djouamaa` decision=approved note=«Arabic name verified: خمس جوامع» → **200 ok** ✓.
- `GET` يُظهِر `reviewDecision=approved` + note + `reviewCounts.approved=1` ✓.
- **يثبت بعد refresh** (GET ثانٍ → approved) ✓.
> الإنتاج: `_SUPABASE_ENABLED=true` → upsert/fetch حقيقيّ في `discovered_place_reviews` (ثبات دائم). محلّيًّا (Supabase off): مخزن ذاكرة inert-in-prod ليُختبَر التدفّق.

## 6) تأكيد عدم auto-promotion
لا يوجد أيّ مسار يكتب curated/يُرقّي. `POST /review` يحفظ صفًّا في جدول reviews فقط. لا preview/commit/GitHub في الكود أصلًا (مرحلة 1). READY_FOR_REVIEW تبقى حالة محسوبة فقط.

## 7) تأكيد عدم تعديل curated + عدم تغيير robots
- **السموك يؤكّد `db/places/curated-places.json` غير مُعدَّل** (byte-for-byte قبل/بعد الحفظ) ✓. العدد ثابت **2982**.
- **robots بلا تغيير:** لا مسار يلمس robots. مُتحقَّق: `/prayer-times-in-khams-djouamaa` يبقى **`noindex,follow`** بعد حفظ approved. المدينة تبقى **discovered + noindex**.

## 8) تأكيد عدم وجود secrets
السموك يفحص ردّ `/review` + ردّ `GET` + HTML الصفحة ضدّ: قيمة `ADMIN_TOKEN`، مفتاح SUPABASE الوهميّ، `service_role`، `SUPABASE_SERVICE_ROLE_KEY` → **0 تطابق** في الثلاثة. لا env/headers/cookies في أيّ إخراج.

## 9) نتائج regression
- **سموك المرحلة 1: 18/18 ✓** (403/401×3 · 405 · 415 · 400 · 200+echo · GET-merge+note+counts · refresh · drawer/buttons/filter موجودة · 0 أسرار×3 · curated غير مُعدَّل).
- **صفحات عامّة (خادم بلا env):** `/` · `/prayer-times-in-riyadh` · `/prayer-times-in-khams-djouamaa` · `/qibla` · `/moon-in-riyadh` · `/azkar` · `/msbaha` → **كلّها 200**.
- admin + review على خادم عاديّ → **403 fail-closed**. `node --check` سليم.
- (khams يعرض الاسم اللاتينيّ **محلّيًّا فقط** لأنّ Supabase مُعطَّل + لا SSR-fixture — سلوك موثَّق [[local-dev-server-testing]]، الإنتاج عربيّ؛ ليس انحدارًا، والصفحة noindex.)

## 10) الملفّات المعدَّلة (3)
| الملفّ | التغيير |
|---|---|
| `server.js` | **+207/−27** — helpers الـreview (validate/save/fetch + مخزن ذاكرة) · دمج القرارات في `_buildDiscoveredAdminRows` · معالِج `POST /review` · توسعة الرسم (Drawer + أزرار + فلتر + عدّادات + JS الحفظ) |
| `db/places/migrations/004_discovered_place_reviews.sql` | **جديد** (يُطبَّق يدويًّا في Supabase) |
| `scripts/_smoke_discovered_cities_admin_review_actions_1.mjs` | **جديد** — 18 تأكيدًا |

**لم تُمَسّ:** `curated-places.json` · sitemap · search pipeline · place-selected · index.html · app.js · css · i18n · صفحات عامّة/SEO · الحساب. **لا cache-buster** (لا أصل عميل عامّ). **لا GitHub/commit/push code.**

## 11) اختبارات القبول (مُستوفاة)
بدون token لا يُحفَظ قرار ✓ · token خاطئ 401 ✓ · token صحيح يُحفَظ ✓ · يظهر بعد refresh ✓ · Approve لا يغيّر curated ✓ · لا يغيّر robots ✓ · المدينة تبقى noindex ✓ · لا أسرار في HTML/JSON/console ✓ · **لا GitHub API** في هذه المرحلة ✓ · **لا commit/push** ✓.

## 12) رسالة commit المقترحة (المعتمدة منك)
```
feat(admin): DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 phase 1 — add protected review decisions
```
الالتزام = `server.js` + `db/places/migrations/004_discovered_place_reviews.sql` + `scripts/_smoke_…review_actions_1.mjs` + هذا التقرير (4 ملفّات، معزولة).

> **بعد الدفع:** (أ) طبّق migration `004` في Supabase SQL editor. (ب) `ADMIN_TOKEN` مضبوط مسبقًا (من MVP). ثمّ افتح اللوحة، افتح Drawer لمدينة، اختر قرارًا، احفظ → يظهر + يبقى بعد refresh (من Supabase). **لا مدينة تُرقّى ولا تُفهرَس** — الترقية مرحلتا 2/3.

---
**الخلاصة:** المرحلة 1 تضيف قرارات مراجعة يدويّة مَحميّة (`POST /review` → جدول `discovered_place_reviews`) + Drawer تفاصيل + 5 أزرار + note/duplicate_of + فلتر review + عدّادات — **حفظ Supabase فقط، 0 ترقية، 0 تعديل curated، 0 تغيير robots، 0 أسرار، 0 GitHub/commit/push**. 18/18 سموك + 7 صفحات regression 200 + curated 2982 ثابت.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 — PHASE 1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
