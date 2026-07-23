# تقرير PRE-COMMIT المصحَّح — `QURAN-AR-FINAL-OFFICIAL-SLUG-URLS-PRECOMMIT-CORRECTIONS-1`

> **لم يُنفَّذ Commit. لم يُنفَّذ Stage نهائي. لم يُنفَّذ Push. لم يُنفَّذ Merge. لا Amend. لا بدء `/quran`. بانتظار اعتمادك النهائي.**
> الفرع: `quran-ar-final-official-slug-urls-1` — HEAD ما زال `378fab9` (P1b) دون مساس.

---

## 1. اعتماد `at-taubah` و`al-kauthar` من المصدر الرسمي

اعتُمدت القيم كما ينتجها KFGQPC مباشرةً، بلا استبدال يدوي وبلا جدول استثناءات:

| السورة | الاسم في المصدر | Route النهائي |
|---|---|---|
| 9 التوبة | `At-Taubah` | **`/quran/at-taubah`** (ليس `at-tawbah`) |
| 108 الكوثر | `Al-Kauthar` | **`/quran/al-kauthar`** (ليس `al-kawthar`) |

القاعدة النهائية الوحيدة: **`official source name → deterministic normalization → final slug`**. والخريطة كاملة ومُثبَتة:
**114 اسمًا رسميًا · 114 slug فريدًا · 114 Route فريدًا · صفر تدخل يدوي في اختيار الكتابة** (فحص `_smoke_quran_surah_routes_source_names_1`: «every slug is what slugify() returns for its OWN source name — no hand-edited entry»).

## 2. استثناء `?ayah=N` — تفسيره

`/quran/al-anbiya?ayah=5` → `302` → `/quran/al-anbiya#ayah-5`. مقبول كاستثناء وظيفي محدود لدعم الانتقال للآية بلا JavaScript، لأنه:
لا يغيّر slug السورة · لا ينقل إلى Route قديم · لا يصحّح اسمًا خاطئًا · لا ينشئ نسخة محتوى موازية · ينقل من Query وظيفي إلى Fragment داخل الصفحة نفسها · يحافظ على وظيفة No-JS.

الكود (server.js:31023-31026):
```js
const _am = /(?:^|&)ayah=(\d{1,3})(?:&|$)/.exec(qs);
if (_am) { const a = +_am[1]; if (a >= 1 && a <= _ch.ayahCount) { res.writeHead(302, { Location: _qs.path + '#ayah-' + a }); res.end(); return; } }
```
الأمان مبنيّ في طبقتين: (أ) الـregex يلتقط **1-3 أرقام فقط** مُثبَّتة بـ`&`/نهاية؛ (ب) الـLocation يُبنى من `_qs.path` — المسار الرسمي من الجدول، **لا من إدخال المستخدم أبدًا**.

## 3. اختبارات أمان تحويل Query→Fragment (§16، قسم 6 جديد دائم)

أُضيفت **22 فحصًا** إلى مصفوفة المسارات (`_smoke_quran_ssr_route_matrix_114_1`)، جميعها ناجحة:

**قيم مرفوضة — لا 302 ولا `Location`:**

| المُدخَل | النتيجة | السبب |
|---|---|---|
| `?ayah=0` | 200، بلا Location | تحت الحدّ الأدنى |
| `?ayah=-1` | 200، بلا Location | سالب ليس تتابع أرقام |
| `?ayah=1.5` | 200، بلا Location | عشري — الـFragment آية كاملة |
| `?ayah=test` | 200، بلا Location | كلمة ليست رقمًا |
| `?ayah=` (فارغ) | 200، بلا Location | قيمة فارغة |
| `?ayah=287` على البقرة (آخرها 286) | 200، بلا Location | تجاوز آيات السورة |
| `?ayah=113` على الأنبياء (آخرها 112) | 200، بلا Location | تجاوز آيات السورة |
| `?ayah=https://example.com` | 200، بلا Location | **مسبار Open-Redirect** |
| `?ayah=//example.com` | 200، بلا Location | **مسبار Open-Redirect نسبيّ** |
| `?ayah=5abc` | 200، بلا Location | أرقام بذيل — لا تُقبل كـ5 |
| `?ayah=1000` | 200، بلا Location | خارج نافذة 1-3 أرقام |

**قيم صحيحة — الـLocation هو المسار الرسمي + Fragment واحد فقط، بلا Query:**
`?ayah=5&foo=bar` → `302 /quran/al-anbiya#ayah-5` بالضبط (لا Query يتسرّب، لا `#` مزدوج، لا تغيير مسار).
Canonical و`og:url` نظيفان بلا `?` ولا `#`؛ ولا رابط داخلي عادي يستخدم `?ayah=`.

## 4. المسارات القديمة والخاطئة — 404 بلا `Location` (لا Redirect)

27 مسارًا متقاعدًا/خاطئًا، ولا واحد يردّ 3xx: `/quran/surah/21` · `/quran/21` · `/quran/al-anbiya-21` · `/quran/al-anbia` · `/quran/AL-ANBIYA` · `/quran/al_anbiya` · `/quran/al-anbiya/` … كلها **404، صفر Location**. لا alias، لا تصحيح slug، لا طيّ حالة أحرف.

## 5. `git status --short` بعد إصلاح الـ118 (لقطة ذرّية عقب الاستعادة)

```
 M css/quran.css        M js/app.js        M js/quran.js        M server.js
 M scripts/_measure_quran_ssr_surah_perf_1.mjs   + 16 اختبار smoke آخر
?? data/quran/kfgqpc-hafs-v2-0/metadata/surah-routes.json
?? reports/quran-ar-final-official-slug-urls-precommit.md
?? scripts/quran/build_surah_routes.mjs
?? scripts/_smoke_quran_surah_routes_source_names_1.mjs
?? scripts/_smoke_quran_surah_routes_deterministic_1.mjs
```
**data/quran معدَّل: 0 · جديد فيه: `surah-routes.json` فقط.**

⚠ **ملاحظة صدق عن autocrlf:** هذه الشجرة فيها `core.autocrlf=true`. git يعيد **وسم** ملفات البيانات الـ118 كـ«M» كلما أعاد فحصها، لأنها LF على القرص بينما autocrlf يتوقّع CRLF — **فرق بايتيّ في نهايات الأسطر فقط، صفر تغيير محتوى** (مُثبَت أدناه). الأمر `git checkout HEAD -- <البيانات>` ينظّفها، لكن أول أمر git لاحق يعيد الوسم. لم أستخدم أيًّا من الأدوات الممنوعة (`assume-unchanged` · `skip-worktree` · تغيير `autocrlf` · `.gitattributes` · `git add .`/`-A`). الضمان الحقيقي مُثبَت في §7 أدناه: **Stage صريح بالمسارات → صفر ملف بيانات قديم يدخل الـCommit.**

## 6. `git ls-files -m data/quran` + الإثبات القاطع للمحتوى

عقب `git checkout HEAD -- <البيانات>` مباشرةً: **`git ls-files -m data/quran` = 0**.
ومقارنة محتوى كل ملف بنسخته في HEAD بعد تطبيع نهايات الأسطر:

```
ملفات HEAD في data/quran: 119
محتوى مطابق لـ HEAD (بعد التطبيع): 119   تغيير محتوى حقيقي: 0  ✓
```

## 7. قائمة ملفات البيانات داخل Stage (Stage تجريبي مؤقت ثم أُلغي)

نفّذتُ Stage تجريبيًا **بمسارات صريحة** (لا `git add .` ولا `-A`) لإثبات الضمان الذي تطلبه §3، ثم ألغيته بـ`git reset` (عودة للا-stage وفق §8). النتيجة الحاسمة `git diff --cached --name-status`:

```
A  data/quran/kfgqpc-hafs-v2-0/metadata/surah-routes.json     ← الوحيد في data/quran
(صفر سطر  M  على surahs/ أو chapters/basmala/juz/surah-checksums)
الإجمالي: 5 A  +  21 M   =   26 ملفًا فقط
```
ثم: `git reset` → **0 ملف في Stage**. الـ118 الوهمية مُستبعَدة بحكم البناء (لم تُسمَّ قط).

## 8. `report_non_ayah_inventory.mjs` عاد إلى `378fab9`

استُعيد الملف حرفيًا (`git checkout 378fab9 -- scripts/quran/report_non_ayah_inventory.mjs`)، و`git diff -- scripts/quran/report_non_ayah_inventory.mjs` **فارغ**، ومطابق لـ`378fab9`. لم يدخل إصلاح هذه الأداة في هذه الجولة. سُجِّل كتوصية مستقلة مستقبلية: **`QURAN-NON-AYAH-INVENTORY-SLUG-ROUTE-COMPATIBILITY-FIX-1`** (لم تُنفَّذ).

## 9. الاختبار المتذبذب — 10/10 بعد تشخيص السبب الجذري

الرسالة المحسّنة كشفت السبب الحقيقي (لا ضجيج): الفحص كان يلتقط **ميزة الموقع الجغرافي الخلفية للقشرة** (`js/app.js` `#nearby-section` → `/api/geocode?q=city`/`q=town` + `overpass-api.de`)، وهي تُطلَق على التحميل بمصطلحات ثابتة، **لا علاقة لها بدرج السور**. `js/quran.js` (مالك `applyFilter`) فيه **صفر fetch/XHR/WebSocket** — الدرج عاجز بنيويًا عن أي بحث شبكي.

الإصلاح: قصر الفحص على استعلامات الدرج الفعلية (أسماء سور، لا أرقام قد تطابق إحداثيات) + إثبات بنيوي أن `js/quran.js` لا يحوي أي نداء شبكة. النتيجة:

```
_smoke_quran_surah_drawer_search_filter_1 منفردًا: 10/10 PASS  (18 فحصًا/تشغيل، مدة ~4.8s)
```

## 10. الحزمة الكاملة 3 مرات متتالية (من الحالة نفسها، بلا تعديل ملفات بين التشغيلات)

| الجولة | البدء | المدة | ملفات | أخضر | أحمر | متخطّى | تحققات | رواسب |
|---|---|---|---|---|---|---|---|---|
| 1/3 | 00:38:01 | 101s | 40 | 40 | 0 | 0 | 857 | — |
| 2/3 | 00:39:59 | 101s | 40 | 40 | 0 | 0 | 857 | — |
| 3/3 | 00:41:53 | 101s | 40 | 40 | 0 | 0 | 857 | — |

**ثبات تامّ: 3×(40/40 ملفًا، 0 فشل، 0 تخطٍّ، 857 تحققًا).**

## 11. النتيجة النهائية لعدد ملفات الاختبار والتحققات

**40 ملف اختبار · 857 تحققًا ناجحًا · صفر أحمر · صفر متخطٍّ.** (كانت 834؛ +22 أمان `?ayah` في مصفوفة المسارات، +1 إثبات بنيوي في درج البحث.)

## 12. 114/114 Routes

`200: 114/114 · canonical: 114/114 · og:url: 114/114 · روابط رقمية عبر 114 صفحة: 0 · slug فيه رقم: 0`.
الروابط الستّ المطلوبة صراحةً (كلها OK، prev/next على slugs رسمية):

| Route | H1 | prev | next |
|---|---|---|---|
| `/quran/at-taubah` | سورة التوبة… | `/quran/al-anfal` | `/quran/yunus` |
| `/quran/al-kauthar` | سورة الكوثر… | `/quran/al-maun` | `/quran/al-kafirun` |
| `/quran/al-anbiya` | سورة الأنبياء… | `/quran/ta-ha` | `/quran/al-hajj` |
| `/quran/ya-sin` | سورة يس… | `/quran/fatir` | `/quran/as-saffat` |
| `/quran/al-ala` | سورة الأعلى… | `/quran/at-tariq` | `/quran/al-ghashiyah` |
| `/quran/an-nas` | سورة الناس… | `/quran/al-falaq` | — |

## 13. 6236/6236 آية

`إجمالي الآيات: 6236/6236 ✓`. سورة يس آية 1 «يسٓ» تحتفظ بـ**U+0653** (المدّة) ✓. سورة الأنبياء 112/112 ✓.

## 14. SHA-256 لـ`surah-routes.json`

```
E278225B107B75A682D5893B9621963902FCFB99ACA49283A480FAF0DA9DEAD7   (23,102 بايت، 114 سجلًا، LF)
```

## 15. الحتمية

بناءان من مجلدين **فارغين** → متطابقان بايتًا ببايت (نفس الـsha256 أعلاه)، والملف المرفوع هو نفسه ناتج المصدر. لا `generatedAt`، لا `Date.now()`/`Math.random()`، لا مسار مطلق مُسرَّب. (`_smoke_quran_surah_routes_deterministic_1`: 12/12.)

## 16. `node --check`

`server.js · js/app.js · js/quran.js · build_surah_routes.mjs · الاختباران الجديدان · route_matrix · drawer_search_filter` — **كلها صياغة سليمة**.

## 17. `git diff --check`

نظيف من تعارضات/whitespace في الكود. (تحذيرات `LF→CRLF` على ملفات البيانات = إشعارات تطبيع autocrlf، لا أخطاء diff؛ صفر تغيير محتوى — §5/§6.)

## 18. `git diff --stat`

`21 files changed, 453 insertions(+), 190 deletions(-)` (الكود فقط؛ data/quran خارج diff لأن محتواه لم يتغيّر).

## 19. `git status --short`

21 معدَّل (كود) + 5 جديد. data/quran: `surah-routes.json` فقط جديدًا، صفر معدَّل (لقطة ذرّية عقب الاستعادة). التفصيل في §5.

## 20. قائمة الملفات الجديدة والمعدَّلة

**جديد (5):**
```
data/quran/kfgqpc-hafs-v2-0/metadata/surah-routes.json     ← التغيير الوحيد المسموح في data/quran/**
scripts/quran/build_surah_routes.mjs
scripts/_smoke_quran_surah_routes_source_names_1.mjs
scripts/_smoke_quran_surah_routes_deterministic_1.mjs
reports/quran-ar-final-official-slug-urls-precommit.md
```
**معدَّل (21):** `server.js` · `js/app.js` · `js/quran.js` · `css/quran.css` (تعليق فقط) · 17 اختبار/قياس smoke.
**عاد إلى 378fab9:** `scripts/quran/report_non_ayah_inventory.mjs` (خارج الـCommit).
**لم يُمسّ:** 114 ملف سورة · `chapters.json` · `build.mjs` · `source-manifest.json` · `basmala.json`/`juz.json` · نص القرآن · الخط · sitemap · noindex · hreflang · Service Worker · أي cache · صفحة `/quran` · أي مرحلة لاحقة.

## 21. تأكيد عدم Commit
لم يُنفَّذ أي `git commit`. HEAD ما زال `378fab9`.

## 22. تأكيد عدم Push
لم يُنفَّذ أي `git push`. لا تفاعل مع أي remote.

## 23. تأكيد عدم Merge
لم يُنفَّذ أي `git merge` ولا تحديث upstream ولا `git commit --amend`.

## 24. تأكيد عدم بدء `/quran`
لم تُبدأ صفحة `/quran` الرئيسية ولا أي مرحلة لاحقة. النطاق اقتصر على بوابة التصحيحات.

---

**Status: FINAL OFFICIAL ENGLISH-SLUG URL STRUCTURE VERIFIED FOR ALL 114 QURAN SURAHS — NO LEGACY OR TYPO REDIRECTS — SAME-PATH AYAH QUERY-TO-FRAGMENT 302 RETAINED FOR NO-JS — WORKTREE CLEAN OF FALSE DATA MODIFICATIONS — NOT COMMITTED — NOT PUSHED — AWAITING FINAL APPROVAL**
