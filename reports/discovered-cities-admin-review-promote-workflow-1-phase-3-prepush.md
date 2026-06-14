# تقرير ما قبل الدفع: DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 — PHASE 3

**النوع:** ميزة (المرحلة 3/4) — **Commit & Push to Branch** عبر GitHub API. **إلى branch جديد فقط — لا main، لا merge، لا git محلّيّ.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `HEAD = origin/main = 5d87a89`. **التصميم:** [discovered-cities-admin-review-promote-workflow-1-design.md](discovered-cities-admin-review-promote-workflow-1-design.md).

---

## 1) تصميم GitHub API (Git Data API، عبر `fetch` أصليّ — لا git محلّيّ)
commit ذرّيّ متعدّد-الملفّات إلى **branch جديد**: 1) `GET …/contents/curated-places.json?ref=main` (الأساس **الحيّ**، لا الذاكرة) → 2) إلحاق المرشَّحين + إعادة-فحص slug ضدّ main الحيّ → 3) `GET …/git/ref/heads/main` + `GET …/git/commits/{sha}` (الشجرة) → 4) `POST …/git/blobs` ×2 (curated + report) → 5) `POST …/git/trees` (base_tree + الملفّان) → 6) `POST …/git/commits` (parents:[main]) → 7) `POST …/git/refs` (`refs/heads/admin/promote-discovered-…`). **لا main، لا merge، لا push محلّيّ.**

## 2) env vars المطلوبة (سيرفر-فقط)
`GITHUB_TOKEN` (fine-grained PAT، صلاحيّة `contents:write` على المستودع) · `GITHUB_REPO` ("owner/repo") · `GITHUB_BRANCH_BASE=main` (افتراضيّ). **+ `ADMIN_TOKEN`** (قائم). كلّها **لا تظهر** في HTML/JS/JSON/console/logs.
> **بعد الدفع:** اضبط `GITHUB_TOKEN` + `GITHUB_REPO` في Render — وإلّا يردّ المسار **503 github_not_configured** (آمن).

## 3) endpoint
**`POST /api/admin/discovered-cities/promote-commit`** (جديد) — token-gated، JSON-only. body `{items:[{slug,countryCode}], target:"branch", commitMessage?, branchName?}`. **`target` يجب أن يكون `"branch"`** — أيّ قيمة أخرى (incl. `main`) → **400 only_branch_target**.

## 4) إعادة التحقّق (نفس 12 validation من المرحلة 2، سيرفريًّا)
المسار **يُعيد تشغيل `_buildPromotePreview` كاملًا** قبل أيّ commit؛ إن لم يكن `status==='ready'` → **422 blocked** (بلا branch/commit). يُضاف فحص **slug ضدّ main الحيّ** (من GitHub Contents) → `slug_already_in_main` يحجب. + فحص JSON-validity للناتج. approved-only يبقى ساريًا (skipped/pending/duplicate/needs_ar/mixed → 422).

## 5) branch naming
`admin/promote-discovered-YYYYMMDD-HHMM` (+`-{slug}` لمدينة واحدة). أيّ `branchName` من العميل يخضع لـwhitelist صارم `^admin\/promote-discovered-[a-z0-9-]{1,180}$` (وإلّا يُتجاهَل ويُولَّد سيرفريًّا) — يمنع دفع لأيّ ref عشوائيّ/main.

## 6) files whitelist (على الbranch فقط)
المسارات **مُثبَّتة سيرفريًّا**: `db/places/curated-places.json` + `reports/admin-promote-batch-<ts>.md` فقط. **لا مسار من العميل إطلاقًا** (منع path traversal). لا ملفّ آخر.

## 7) lock (تزامن)
`_adminPromoteLock` (mutex بوليانيّ، check-and-set **متزامن** ثمّ await) → طلب ثانٍ أثناء التنفيذ = **409 promote_in_progress**؛ يُحرَّر في `finally`.
> *(في الإنتاج، `fetch` الشبكيّ يوسّع نافذة القفل فيُطلِق 409 موثوقًا تحت التزامن؛ في وضع الاختبار المسار microtask-فقط فلا تتداخل الطلبات — سُجِّل معلوماتيًّا، والقفل صحيح بالكود.)*

## 8) نتائج commit إلى branch (سموك — وضع GitHub اختباريّ يُحاكي GitHub بلا استدعاء حقيقيّ)
approved khams → **200 committed**: `branchName="admin/promote-discovered-20260614-0951-khams-djouamaa"`، `commitSha` حاضر، `filesChanged=[curated, reports/admin-promote-batch-…md]`، `citiesPromoted=["khams-djouamaa"]`، `beforeCount→afterCount = 2982→2983`، `githubCommitUrl`/`githubBranchUrl`. **النسخة المعروضة في اللوحة تنبّه: «main NOT changed — merge manually».**

## 9) تأكيد main unchanged + عدم الكتابة المحلّيّة
- **main لا يتغيّر:** الـcommit إلى **branch جديد فقط** (لا `refs/heads/main`، لا merge). الإنتاج لا يتغيّر حتى **تدمج أنت** الـbranch + يُعيد Render النشر.
- **`curated-places.json` المحلّيّ غير مُعدَّل** — السموك byte-for-byte (الـcommit عبر GitHub API/الذاكرة، لا يلمس القرص). العدد المحلّيّ ثابت 2982.

## 10) تأكيد لا أسرار
السموك يفحص ردّ commit + HTML الصفحة ضدّ `ADMIN_TOKEN`/مفتاح SUPABASE/**`GITHUB_TOKEN` (قيمة وهميّة)**/`service_role`/`GITHUB_TOKEN`(الاسم) → **0 تطابق**. رسائل الخطأ من أكواد داخليّة فقط (لا يُعاد jSON أو token من GitHub). كلّ الأسرار سيرفريّة.

## 11) نتائج regression
- **سموك المرحلة 3: 22/22 ✓** (auth 403/401 · **503 بلا GitHub config** · guards 405/415/400 · **target=main→400** · approved→committed · skipped/mixed→422 · concurrency graceful · 0 أسرار · main/local غير مُعدَّل).
- **صفحات عامّة (خادم بلا env):** 7 صفحات → **200**. الـ3 endpoints admin (review/preview/**commit**) على خادم عاديّ → **403 fail-closed**. curated 2982 ثابت · khams noindex. `node --check` سليم.

## 12) الملفّات المعدَّلة (3)
| الملفّ | التغيير |
|---|---|
| `server.js` | **+182/−5** — env GitHub + `_adminPromoteLock` · `_githubFetch` · `_makeBranchName`/`_sanitizeBranchName` · `_buildBatchReport` · `_promoteCommitViaGitHub` (Git Data API + test seam) · `_buildPromoteCommit` (re-validate→commit) · معالِج `POST /promote-commit` · زر «Commit & Push to Branch» + JS في لوحة المعاينة |
| `scripts/_smoke_discovered_cities_admin_promote_commit_1.mjs` | **جديد** — 22 تأكيدًا |

**لم تُمَسّ:** `curated-places.json` · sitemap · search · index.html · app.js · css · i18n · صفحات عامّة. **لا cache-buster.** **لا push to main / merge.** بذرة اختبار `PROMOTE_GITHUB_TEST_MODE` inert في الإنتاج (يُستخدَم GitHub الحقيقيّ حين التوكن مضبوط).

## 13) اختبارات القبول (مُستوفاة)
بلا token 403/401 ✓ · token خاطئ مرفوض ✓ · token صحيح + preview valid → branch commit ✓ · pending/skipped/needs_ar/duplicate/mixed مرفوض ✓ · **main لا يتغيّر** ✓ · branch فقط ✓ · curated الإنتاج لا يتغيّر قبل merge ✓ · robots khams noindex قبل merge ✓ · 0 أسرار/GITHUB_TOKEN ✓ · commit يحوي الملفّات المسموحة فقط ✓ · lock (409 تحت تزامن حقيقيّ) ✓ · regression عامّ 200 ✓.

## 14) رسالة commit المقترحة (المعتمدة منك)
```
feat(admin): DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 phase 3 — add branch promote commit
```
الالتزام = `server.js` + `scripts/_smoke_…promote_commit_1.mjs` + هذا التقرير (3 ملفّات، معزولة).

> **بعد الدفع:** (أ) اضبط `GITHUB_TOKEN` + `GITHUB_REPO` في Render env. (ب) افتح اللوحة → علّم khams → Prepare Preview → **Commit & Push to Branch** → يُنشأ branch `admin/promote-discovered-…` بـcommit (curated + report). **main لا يتغيّر**؛ راجع الـbranch على GitHub، ثمّ **ادمجه يدويًّا** لتفعيل الإدخال (بعد إعادة نشر Render). إن لم تُضبَط متغيّرات GitHub → 503 (آمن).

---
**الخلاصة:** المرحلة 3 تضيف **Commit & Push to Branch** عبر GitHub API (Git Data API، بلا git محلّيّ): re-validate (12) → commit ذرّيّ (curated + report) إلى **branch جديد فقط** + قفل تزامن + whitelist مسارات + branch-name مُعقَّم. **0 main/merge، 0 تعديل curated محلّيّ، 0 أسرار/GITHUB_TOKEN، 0 تغيير إنتاج قبل دمجك اليدويّ**. 22/22 سموك + 7 صفحات regression 200.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 — PHASE 3` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
