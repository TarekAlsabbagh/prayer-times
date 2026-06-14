# تقرير ما قبل الدفع: DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 — PHASE 2

**النوع:** ميزة (المرحلة 2/4) — **Promote Preview** (معاينة ترقية فقط). **لا commit، لا push، لا GitHub، لا تعديل curated، لا تغيير robots فعليّ.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `HEAD = origin/main = 335149c`. **التصميم:** [discovered-cities-admin-review-promote-workflow-1-design.md](discovered-cities-admin-review-promote-workflow-1-design.md).

---

## 1) endpoint + الواجهة
- **`POST /api/admin/discovered-cities/promote-preview`** (جديد) — token-gated، JSON-only. يُرجِع معاينة كاملة. **لا كتابة.**
- **الواجهة:** فلتر `review_decision` (من المرحلة 1) + **checkbox لكلّ صفّ** + زر **«Prepare Promote Preview»** + **لوحة نتائج المعاينة** (`#preview-panel`) تعرض: المدن، نتائج validations لكلّ مدينة، الأخطاء/التحذيرات، diff، عدد مدن الدولة قبل/بعد، robots قبل/بعد، source قبل/بعد، رسالة commit.

## 2) response (آمن — whitelist، 0 أسرار)
`{ status('ready'|'blocked') · previewOnly:true · items[{slug,countryCode,reviewDecision,status,valid,checks[],errors,warnings,candidate,robotsBefore,robotsAfter,sourceBefore,sourceAfter}] · validations{allValid,resultingJsonValid,validCount,total} · diffPreview[{op:'add',slug,entry}] · filesToChange · countryCountsBeforeAfter · robotsBeforeAfter · sourceBeforeAfter · commitMessageSuggested · errors · warnings }`.

## 3) نتائج الحماية (سموك ذاتيّ-الاكتفاء)
| | النتيجة |
|---|---|
| بلا `ADMIN_TOKEN` | **403** ✓ |
| token مفقود/خاطئ | **401** ✓ |
| GET | **405** · non-JSON **415** · items فارغ/شكل خاطئ **400** ✓ |
| token صحيح | **200** + معاينة ✓ |

## 4) approved فقط مسموحة (مُتحقَّق)
- **khams-djouamaa (approved)** → `status=ready`، `valid=true`، المرشَّح مبنيّ (`names.ar="خمس جوامع"`, `source="curated"`, robots `discovered/noindex → curated/index`, source `nominatim → curated`), diff `add`, filesToChange، commit msg، dz count `before→after (+1)`، `resultingJsonValid`.
- **preview-skip-city (skipped)** → `status=blocked`، `valid=false`، فحص `review_approved` **يفشل**. (نفس الرفض لـpending/duplicate/needs_ar_name/needs_review — كلّها ≠ approved.)
- **batch مختلط** (approved + skipped) → `status=blocked` (عنصر واحد غير صالح يحجب الكلّ).

## 5) validations تعمل (12، سيرفريّة)
slug · countryCode · names.en · names.ar إن كانت الدولة عربيّة (`_ARABIC_COUNTRY_CC`) · lat/lng صالحة · timezone · source · **لا slug conflict** · **لا already-curated** · **لا near-duplicate** (عبر `classifyRow` على curated الحيّ 2982) · **review=approved** · **الناتج JSON صالح** (concat+parse). + حارس script (`ar` عربيّ-فقط، `en` لاتينيّ-فقط) عبر `review-discovered-cities.mjs` المُعاد استخدامه.

## 6) ⚠️ تأكيد أنّها معاينة فقط (لا كتابة/commit/push/GitHub)
- **`curated-places.json` غير مُعدَّل فعليًّا** — السموك يؤكّد byte-for-byte قبل/بعد كلّ المعاينات؛ العدد ثابت **2982**.
- **robots لا تتغيّر فعليًّا** — المعاينة تعرض robots المتوقَّعة «بعد الترقية+الدمج» فقط؛ لا مسار يلمس robots. khams يبقى **noindex** (مؤكَّد على خادم regression).
- **لا commit، لا push، لا GitHub API، لا branch** — لا كود من هذا النوع في المرحلة (الكلمة `fetch`/`git`/`github` لإنشاء branch غير موجودة؛ مرحلة 3).

## 7) تأكيد عدم وجود أسرار
السموك يفحص ردّ المعاينة + HTML الصفحة ضدّ `ADMIN_TOKEN`/مفتاح SUPABASE/`service_role`/`SUPABASE_SERVICE_ROLE_KEY` → **0 تطابق**. الـtoken يُقرأ في العميل من URL وقت التشغيل (Bearer للـPOST)، ولا يُضمَّن في مصدر الصفحة. service-role سيرفريّ.

## 8) نتائج regression
- **سموك المرحلة 2: 28/28 ✓**.
- **صفحات عامّة (خادم بلا env):** `/` · `/prayer-times-in-riyadh` · `/prayer-times-in-khams-djouamaa` · `/qibla` · `/moon-in-riyadh` · `/azkar` · `/msbaha` → **كلّها 200**.
- admin + review + **promote-preview** على خادم عاديّ → **403 fail-closed**. `node --check` سليم.
- (سموك المرحلة 1 `_smoke_…review_actions_1` يبقى ساريًا — endpoint /review بلا مساس.)

## 9) الملفّات المعدَّلة (3)
| الملفّ | التغيير |
|---|---|
| `server.js` | **+186/−9** — `_fetchDiscoveredRawRows` (استخراج للمشاركة) · `_ARABIC_COUNTRY_CC` · `_buildPromoteCandidate` · `_validatePromoteItem` (12) · `_buildPromotePreview` · معالِج `POST /promote-preview` · توسعة الرسم (checkbox + زر Prepare + لوحة معاينة + CSS + JS) |
| `scripts/_smoke_discovered_cities_admin_promote_preview_1.mjs` | **جديد** — 28 تأكيدًا |

**لم تُمَسّ:** `curated-places.json` · sitemap · search pipeline · place-selected · index.html · app.js · css · i18n · صفحات عامّة. **لا migration جديدة** (جدول reviews من المرحلة 1). **لا cache-buster.** **لا GitHub/commit/push.**

## 10) اختبارات القبول (مُستوفاة)
بدون token لا preview ✓ · token خاطئ مرفوض ✓ · token صحيح يعمل ✓ · pending/skipped/… مرفوضة ✓ · approved فقط ✓ · validations تعمل ✓ · diffPreview ✓ · filesToChange ✓ · commitMessageSuggested ✓ · curated غير مُعدَّل ✓ · robots لا تتغيّر فعليًّا ✓ · khams noindex ✓ · لا commit/push/GitHub ✓ · 0 أسرار ✓ · regression عامّ 200 ✓.

## 11) رسالة commit المقترحة (المعتمدة منك)
```
feat(admin): DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 phase 2 — add promote preview
```
الالتزام = `server.js` + `scripts/_smoke_…promote_preview_1.mjs` + هذا التقرير (3 ملفّات، معزولة).

> **بعد الدفع:** افتح اللوحة، فلتر Approved، علّم مدينة (khams-djouamaa)، اضغط **Prepare Promote Preview** → تظهر المعاينة (validations + diff + robots discovered→curated + commit msg) **دون كتابة أيّ شيء**. الترقية الفعليّة = المرحلة 3.

---
**الخلاصة:** المرحلة 2 تضيف معاينة ترقية مَحميّة (`POST /promote-preview`) + checkbox/زر/لوحة — **approved-only، 12 validation سيرفريّة، diff/counts/robots/source/commit-msg** — **0 كتابة، 0 commit/push/GitHub، 0 تعديل curated (2982 ثابت)، 0 تغيير robots، 0 أسرار**. 28/28 سموك + 7 صفحات regression 200.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 — PHASE 2` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
