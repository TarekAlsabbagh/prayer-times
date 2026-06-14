# تقرير ما قبل الدفع: DISCOVERED-CITIES-ADMIN-PROMOTE-COMMIT-ERROR-DIAGNOSTICS-1

**النوع:** إصلاح تشخيص + **إصلاح السبب الجذريّ** لزرّ «Commit & Push to Branch» (مسار الترقية فقط).
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `HEAD = origin/main = 15d899c`. **لا push to main، لا merge، لا تعديل curated/sitemap/search/صفحات عامّة.**

---

## 1) السبب الجذريّ الحقيقيّ (إجابة أسئلتك مباشرةً)

| سؤالك | الإجابة |
|---|---|
| **أيّ مرحلة فشلت؟** | مرحلة **جلب الأساس** `get_base_curated` — أوّل استدعاء GitHub في المسار (قبل أيّ commit). |
| **status code من GitHub؟** | الاستدعاء يُرجِع **`200 OK`** (ليس خطأ HTTP أصلًا!) — لكن بحقل `content` **فارغ**. لهذا ظهر «خطأ عامّ» بلا status واضح. |
| **هل المشكلة token أم repo أم branch أم ref؟** | **لا شيء منها.** التوكن + المستودع + الفرع `main` **كلّها صحيحة** (فحصُك لمتغيّرات Render كان سليمًا 100%). |
| **إذن ما السبب؟** | **حجم الملفّ.** `db/places/curated-places.json` = **2.62 ميجابايت (2,750,641 بايت)**. و**GitHub Contents API يُفرِغ حقل `content` لأيّ ملفّ > 1MB** (يُرجِع البيانات الوصفيّة فقط، `encoding:"none"`). فكوننا نقرأ `c.data.content` ثمّ نفكّ base64 → كان يفشل **دائمًا** عند `if (!c.data.content) throw github_get_curated_failed`. |
| **لماذا ظهرت `error: error` تحديدًا؟** | تنافر خادم/عميل: الخادم كان يردّ `{status:"error", errors:[...]}` بينما العميل يقرأ `j.error` (غير موجود) → يسقط إلى `j.status="error"` → النصّ «error: error». الكود الحقيقيّ `github_get_curated_failed` كان مخفيًّا. |

> **الخلاصة:** ليست مشكلة صلاحيّات أو إعداد — بل حدّ تقنيّ في Contents API على ملفّ كبير. الزرّ كان سيفشل مهما ضبطت المتغيّرات.

---

## 2) الإصلاحان المُنفَّذان

**(أ) إصلاح الجذر — يجعل الزرّ يعمل فعلًا.**
استبدال جلب الأساس بـ **Git Blobs API + raw media type** (بلا حدّ 1MB، يدعم حتى 100MB):
1. `GET …/contents/curated-places.json?ref=main` → نأخذ **`sha`** فقط (متاح لأيّ حجم).
2. `GET …/git/blobs/{sha}` بترويسة **`Accept: application/vnd.github.raw`** → النصّ الخام كاملًا.

**(ب) تشخيص واضح وآمن — يجعل أيّ خطأ مستقبليّ مفهومًا.**
ردّ JSON منظَّم `{ ok:false, error:<code>, stage:<مرحلة>, status:<GitHub status>, githubMessage:<رسالة GitHub الآمنة> }`، يعرضه العميل بوضوح (`code @stage [gh status]: message`)، ويُسجَّل في Render logs بأمان.

---

## 3) أكواد الخطأ + التعيين (GitHub status → code)

| GitHub status | المرحلة | الكود (`error`) | HTTP الردّ |
|---|---|---|---|
| 401 | أيّ | `github_auth_failed` | 502 |
| 403 | أيّ | `github_permission_denied` | 502 |
| 404 | `get_base_ref` / `get_base_curated_meta` | `github_base_branch_not_found` | 502 |
| 404 | مراحل أخرى | `github_repo_or_ref_not_found` | 502 |
| 422 | `create_ref` + رسالة «already exists» | `github_branch_already_exists` | **409** |
| 422 | `create_ref` (غير ذلك) | `github_create_ref_failed` | 409 |
| أخرى | `get_base_curated_meta`/`_blob` | `github_get_curated_failed` | 502 |
| أخرى | `get_base_commit` | `github_base_commit_failed` | 502 |
| أخرى | `create_blob_curated`/`_report` | `github_create_blob_failed` | 502 |
| أخرى | `create_tree` | `github_create_tree_failed` | 502 |
| أخرى | `create_commit` | `github_create_commit_failed` | 502 |
| أخرى | غير معروفة | `github_api_error` | 502 |
| — | `preflight` (token/repo مفقود) | `github_not_configured` | 503 |
| — | `preflight` (repo بصيغة خاطئة) | `github_repo_invalid_format` | 500 |
| — | `revalidate` (12 فحص فشل) | `validation_blocked` | 422 |
| — | تعارض slug مع main | `slug_already_in_main` | 409 |

---

## 4) السجلّ الآمن (Render logs) — لا أسرار

`console.error` يطبع **فقط**: `stage` · `githubStatus` · `githubMessage` (رسالة GitHub العامّة مثل «Not Found» / «Bad credentials») · `code` · `branchName` · `repo` (= `owner/repo`، ليس سرًّا) · `baseBranch`.
**لا يُطبع أبدًا:** `GITHUB_TOKEN` · `ADMIN_TOKEN` · `SUPABASE_SERVICE_ROLE_KEY` · env كامل · رؤوس الطلب · كوكيز · URL يحوي توكن · جسم استجابة GitHub الخام.

---

## 5) التحقّق المسبق (pre-call validation) — جديد

- `GITHUB_TOKEN` مفقود → **503** `github_not_configured` (stage `preflight`).
- `GITHUB_REPO` مفقود → **503** `github_not_configured`.
- `GITHUB_REPO` لا يطابق `owner/repo` → **500** `github_repo_invalid_format`.
- `target ≠ "branch"` → **400** (قائم — main/merge ممنوعان).
- وجود الفرع الأساس + صحّة التوكن → يُكشَف في الاستدعاء الأوّل (404 → `github_base_branch_not_found`، 401 → `github_auth_failed`).

---

## 6) النتائج (سموك + regression)

- **سموك التشخيص الجديد: 32/32 ✓** — 5 مراحل فشل محقونة (401/403/404/422/500) + repo بصيغة خاطئة + happy-path 200 + **لا أسرار في كلّ ردّ خطأ** + curated غير معدّل.
- **سموك المرحلة 3 (commit): 22/22 ✓** — بلا انحدار (auth/guards/approved→committed/blocked/lock/no-secrets).
- **سموك المعاينة: 28/28 ✓** · **سموك المراجعة: 18/18 ✓**.
- **المجموع: 100/100 عبر 4 مجموعات admin — 0 فشل.**
- `node --check server.js` سليم · JS صفحة اللوحة المُولَّد يُحلَّل بلا أخطاء (`vm.Script` على الـHTML المُنتَج).

> **ملاحظة أدوات:** المسار الحقيقيّ لـ Blobs API لا يُختبَر محلّيًّا (لا GitHub حقيقيّ؛ وضع الاختبار يقرأ الملفّ المحلّيّ). التشخيص يُختبَر بالكامل عبر بذرة `PROMOTE_GITHUB_TEST_FAIL` التي تُحاكي فشل أيّ مرحلة. الجلب عبر Blobs API يُؤكَّد على الإنتاج بنقرك الزرّ بعد النشر.

---

## 7) ما لم يُمَسّ

`curated-places.json` (**byte-for-byte، غير معدّل**) · sitemap · search · صفحات عامّة · **منطق المراجعة** · **منطق المعاينة** · index.html · app.js · css · i18n. **لا cache-buster** (صفحة اللوحة SSR). **لا push to main / merge.** البذرتان `PROMOTE_GITHUB_TEST_MODE` + `PROMOTE_GITHUB_TEST_FAIL` **inert في الإنتاج** (تُقرأ فقط مع وضع الاختبار).

---

## 8) الملفّات المعدَّلة (2)

| الملفّ | التغيير |
|---|---|
| `server.js` | **+94/−17** — `_githubFetchText` (raw للملفّات الكبيرة) · `_ghMapError`+`_ghThrow` (تعيين أكواد آمن + سجلّ) · جلب الأساس عبر Blobs API raw · ربط كلّ مرحلة بـ`_ghThrow` · بذرة `PROMOTE_GITHUB_TEST_FAIL` · تحقّق repo-format مسبق · معالِج catch منظَّم (code/stage/status/githubMessage + HTTP mapping + سجلّ آمن) · عرض خطأ العميل المنظَّم |
| `scripts/_smoke_discovered_cities_admin_promote_commit_error_diagnostics_1.mjs` | **جديد** — 32 تأكيدًا |

---

## 9) رسالة commit المقترحة

```
fix(admin): DISCOVERED-CITIES-ADMIN-PROMOTE-COMMIT-ERROR-DIAGNOSTICS-1 — structured safe GitHub error diagnostics + fetch base curated via Blobs API (root-cause: 1MB Contents API limit on 2.62MB file)
```
الالتزام = `server.js` + السموك الجديد + هذا التقرير (3 ملفّات، معزولة).

---

## 10) بعد الدفع (خطوتك)

بعد اكتمال نشر Render: افتح اللوحة → علّم khams → **Prepare Preview** → **Commit & Push to Branch**.
- **سيعمل الآن** (الجلب عبر Blobs API بلا حدّ 1MB) → يُنشأ فرع `admin/promote-discovered-…` بـcommit. **main لا يتغيّر** — راجع الفرع ثمّ ادمجه يدويًّا.
- إن حدث أيّ خطأ مستقبليّ، سيظهر **واضحًا**: مثل `github_auth_failed @get_base_ref [gh 401]: Bad credentials` بدل «error: error».

---

**الخلاصة:** السبب الجذريّ = **ملفّ curated بحجم 2.62MB يتجاوز حدّ 1MB في GitHub Contents API** (لا علاقة بالتوكن/المستودع/الفرع). أُصلِح بجلب الأساس عبر **Blobs API raw** + أُضيف **تشخيص منظَّم آمن** (أكواد + مرحلة + status + رسالة GitHub، بلا أيّ سرّ). **100/100 سموك، 0 انحدار، curated غير معدّل، لا push to main.**

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITIES-ADMIN-PROMOTE-COMMIT-ERROR-DIAGNOSTICS-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
