# تقرير ما قبل الدفع: DISCOVERED-ADMIN-SMOKE-FIXTURE-REFRESH-1

**النوع:** صيانة اختبارات فقط (test-only) — تحديث fixtures باتت stale بعد دمجك الأخير.
**الحالة:** لم يُدفع — بانتظار اعتمادك. **القاعدة:** `HEAD = origin/main = 952cd2d`.
**لا يلمس إطلاقًا:** `curated-places.json` · sitemap · search · صفحات عامّة · `server.js` (منطق admin) · index.html · css · i18n.

---

## 1) السبب
بعد دمجك [PR #17](https://github.com/TarekAlsabbagh/prayer-times/pull/17) (khams-djouamaa) و[PR #18](https://github.com/TarekAlsabbagh/prayer-times/pull/18) (raanana-il) إلى `main`، أصبح **`khams-djouamaa` موجودًا في `curated-places.json`**. لكن 6 سموك كانت تستعمله كمدينة **discovered/promotable** للاختبار — فصار يُصنَّف الآن `ALREADY_CURATED` ويفشل في مسارات الترقية/التصنيف/SSR (مثلًا "approved commit → 200" يصير 422 blocked، و"STAYS noindex" يصير index). **`raanana` غير مستعمل في أيّ سموك** (المطابقة الوحيدة كانت في `scripts/geodata/countries/la.mjs` — اسم مدينة لاوسيّة، ليست سموك).

## 2) الإصلاح — مدينة اصطناعيّة واحدة غير curated
استُبدل `khams-djouamaa` في كلّ السموك المتأثّرة بمدينة **اصطناعيّة موحَّدة مضمونة عدم وجودها في curated**:
```
slug:       testville        (بسيط، بلا لاحقة بلد — مؤكَّد غير موجود في curated)
names.ar:   تستفيل
names.en/fr: Testville
country:    dz   ·   coords: 27.5, 1.5 (صحراء، بعيدة عن أيّ مدينة curated/khams لتفادي near-duplicate)
```
> **اكتشاف أثناء التنفيذ:** المُصنِّف يجرّد لاحقة رمز البلد من الـslug (`testville-dz` → cleanSlug `testville`). لذا اختير slug **بلا لاحقة** (`testville`) كي تتطابق branchName/citiesPromoted في التأكيدات.

## 3) السموك المُحدَّثة (6) + النتائج بعد التحديث
| السموك | الدور | النتيجة |
|---|---|---|
| `_smoke_…admin_promote_commit_1` | الترقية إلى فرع | **22/22 ✓** |
| `_smoke_…admin_promote_commit_error_diagnostics_1` | تشخيص أخطاء GitHub | **32/32 ✓** |
| `_smoke_…admin_promote_preview_1` | معاينة الترقية | **28/28 ✓** |
| `_smoke_…admin_review_actions_1` | قرارات المراجعة | **18/18 ✓** |
| `_smoke_…admin_dashboard_mvp_1` | لوحة القراءة فقط | **21/21 ✓** |
| `_smoke_discovered_city_ssr_name_resolution_fix_1` | اسم SSR للمدينة discovered | **18/18 ✓** |

**المجموع: 139/139 — صفر فشل.** + `node --check` سليم للستّة + 0 بقايا `khams`/`Khams`/`خمس جوامع` في السموك.

## 4) تأكيد النطاق (طلبك)
- **كل smokes المتأثّرة تعمل على slug اصطناعيّ غير curated** ✓ (139/139)
- **لا تعديل على `curated-places.json`** ✓ (git: غير معدّل)
- **لا تعديل على sitemap / search pipeline / public pages** ✓
- **لا تغيير في منطق admin** ✓ (`server.js` غير معدّل — فقط ملفّات `scripts/_smoke_*.mjs`)
- **full suite green** ✓

## 5) الملفّات المعدَّلة (6 — كلّها اختبارات)
```
scripts/_smoke_discovered_cities_admin_promote_commit_1.mjs
scripts/_smoke_discovered_cities_admin_promote_commit_error_diagnostics_1.mjs
scripts/_smoke_discovered_cities_admin_promote_preview_1.mjs
scripts/_smoke_discovered_cities_admin_review_actions_1.mjs
scripts/_smoke_discovered_cities_admin_dashboard_mvp_1.mjs
scripts/_smoke_discovered_city_ssr_name_resolution_fix_1.mjs
```
لا ملفّ آخر. (تقرير ما قبل الدفع هذا يُضاف للالتزام أيضًا.)

## 6) رسالة commit المقترحة
```
test(admin): DISCOVERED-ADMIN-SMOKE-FIXTURE-REFRESH-1 — swap now-curated khams fixture for synthetic non-curated testville slug across 6 smokes
```

## 7) بعد الإغلاق
نرجع إلى تذكرة **DISCOVERED-CITIES-ADMIN-DASHBOARD-SORTING-AND-BRANCH-STATUS-1** (محفوظة على فرع `wip/sorting-branch-status`)، نُعيد توجيهها (rebase) فوق main النظيف، نُحدِّث سموكها الخاصّ ليستعمل `testville` أيضًا، ونُعيد تشغيل كامل السويت فوق fixtures نظيفة، ثمّ تقرير ما قبل الدفع الخاصّ بها.

---

**الخلاصة:** تحديث اختبارات بحت — 6 سموك تستبدل `khams-djouamaa` (الذي صار curated بدمجك) بمدينة اصطناعيّة `testville` غير curated. **139/139، 0 تعديل في curated/sitemap/search/public/admin-logic، السويت كامل أخضر.**

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-ADMIN-SMOKE-FIXTURE-REFRESH-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
