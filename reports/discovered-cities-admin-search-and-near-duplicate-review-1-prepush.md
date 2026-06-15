# تقرير ما قبل الدفع: DISCOVERED-CITIES-ADMIN-SEARCH-AND-NEAR-DUPLICATE-REVIEW-1

**النوع:** تحسين لوحة discovered admin — (1) تصنيف NEAR_DUPLICATE لم يَعُد يعتمد على القُرب الجغرافيّ وحده بل يتطلّب **إشارة اسم قويّة**، مع **تشخيصات** كاملة؛ (2) **شريط بحث** في اللوحة يغطّي الاسم العربيّ/الإنجليزيّ/slug/رمز الدولة/الحالة/الأسماء البديلة، مع زرّ مسح.
**الحالة:** لم يُدفع — بانتظار اعتمادك. **القاعدة:** `HEAD = origin/main = 4818aa9`، شجرة العمل: `server.js` + `scripts/review-discovered-cities.mjs` فقط (+ سموك جديد + هذا التقرير).
**admin-only:** لا يلمس index.html · js/app.js · css العامّ · curated · sitemap · search العامّ · أسماء المدن العامّة · منطق promote-commit/name-overrides/promotion-status · migrations 004/005/006.

---

## 1) الجزء الأوّل — السبب الجذريّ لخطأ NEAR_DUPLICATE + الإصلاح
**المشكلة (مثالك «النابية»):** المُصنِّف كان يَعُدّ أيّ مكان **داخل صندوق 0.15° (~16كم)** من مدينة curated مكرّرًا (`NEAR_DUPLICATE`) **بالقُرب وحده، دون أيّ فحص للاسم**. فقرية «النابية» (قرية مستقلّة في محافظة القطيف، المنطقة الشرقيّة) — اسمها مختلف تمامًا عن «القطيف» — كانت تُوسَم خطأً مكرّرة.

**الإصلاح:** صار `NEAR_DUPLICATE` يتطلّب **تطابق اسم قويّ** (تشابُه ≥ `0.72`) **بالإضافة** إلى القُرب. القُرب وحده + اسم مختلف ⇒ **`READY_FOR_REVIEW`** (لا تكرار). لم يتغيّر شيء في curated ولم تُضَف النابية إليه.

### سلّم القرار الجديد (بلا تغيير على بقيّة الفئات)
| الإشارة | الحالة | `signal` |
|---|---|---|
| نفس الـslug (نفس الدولة) | ALREADY_CURATED | `same_slug` |
| تطابق **اسم** curated تمامًا | ALREADY_CURATED | `strong_name_match` |
| تطابق **alias** curated تمامًا | ALREADY_CURATED | `alias_match` |
| قريب **و** تشابُه اسم ≥ 0.72 | **NEAR_DUPLICATE** | `mixed_signal` |
| قريب فقط، الاسم مختلف (تشابُه < 0.72) | **READY_FOR_REVIEW** | `coordinate_near_only` |
| بعيد ومختلف | READY_FOR_REVIEW | `null` |

## 2) التشخيصات المُضافة إلى كائن `dedup` (يظهر في الـDrawer + JSON)
`matched_curated_slug` · `matched_curated_name_ar` · `matched_curated_name_en` · `distance_km` (هافرسين، دقّة 0.1كم) · `name_similarity` (0–1 بعد التطبيع) · `signal` (السبب من الجدول أعلاه).

**التطبيع (بلا مكتبات):** إزالة التشكيل/التطويل العربيّ + توحيد الألف/الياء/التاء المربوطة/الهمزة + إسقاط «ال/the/al/el» + إزالة الفراغات وعلامات الترقيم؛ ثمّ تشابُه = `1 − Levenshtein/maxLen`. كلّ الدوالّ مكتوبة يدويًّا داخل المُصنِّف (`_haversineKm` · `_normName` · `_levenshtein` · `_nameSim` · `_bestNameSim`).

### التشخيص الفعليّ لـ«النابية» (تشغيل المُصنِّف الجديد على curated **الحقيقيّ**)
«النابية» قرية في محافظة القطيف (المنطقة الشرقيّة، ~26.58/49.99) تقع داخل **عنقود كثيف**: **11** مُدخل curated سعوديّ ضمن ~0.30° منها — أقربها:

| المسافة | slug | الاسم |
|---|---|---|
| **1.6 كم** | al-awwamiyah | العوامية |
| **1.8 كم** | **qatif** | **القطيف** |
| 5.0 كم | al-awjam | الاوجام |
| 6.1 كم | tarout | تاروت |
| 7.7 كم | inak | عنك |
| 8.1 كم | safwa | صفوى |
| 10.8 كم | saihat | سيهات |

**نتيجة `classifyRow(النابية)` على curated الحقيقيّ:**
```
class           : READY_FOR_REVIEW        ← (كان NEAR_DUPLICATE قبل الإصلاح)
signal          : coordinate_near_only
nearHit         : qatif
matched_slug    : qatif   (القطيف / Qatif)
distance_km     : 1.8
name_similarity : 0.22                    ← أقلّ بكثير من عتبة 0.72
slugHit / nameHit : null / null           ← لا تطابق slug ولا اسم ولا alias
```

**السبب الحقيقيّ للوسم الخاطئ سابقًا:** المدينة المطابِقة هي **القطيف (qatif) على 1.8كم**، لكن «النابية» ≠ «القطيف» (تشابُه 0.22). القاعدة القديمة كانت تُطلِق `NEAR_DUPLICATE` **لمجرّد وجود `nearHit`** (القطيف داخل صندوق ~16كم) دون فحص الاسم — وهذا قاتل في عنقود مثل القطيف حيث **أيّ** قرية جديدة تقع حتمًا على بُعد كيلومترات من القطيف/العوامية/تاروت/صفوى. القاعدة الجديدة: بما أنّ `name_similarity (0.22) < 0.72` ⇒ **`READY_FOR_REVIEW`** ✓. وبالمقابل تهجئة مختلفة لنفس المدينة («Qateef»/«القطيفة») تشابُهها `0.80` ≥ 0.72 ⇒ تبقى `NEAR_DUPLICATE` (`mixed_signal`) ✓.

## 3) الجزء الثاني — شريط البحث في اللوحة
- **الحقول المُغطّاة في `data-text`** (للبحث الفوريّ client-side): slug · الاسم العربيّ · الاسم الإنجليزيّ · **الاسم المعروض بعد التعديل** (displayName ar/en) · **رمز الدولة** · اسم الدولة · **الحالة/التصنيف** · قرار المراجعة · **الأسماء البديلة (aliases)**. (يفوق الحدّ الأدنى المطلوب: ar/en/slug/cc/status/alias.)
- **زرّ مسح `✕`** (id=`f-q-clear`) بجوار الحقل: يُفرِغ البحث ويُعيد تطبيق الفلاتر ويُعيد التركيز للحقل.
- **يعمل مع الفلاتر الحاليّة** (approved/review/all): البحث طبقة عرض/إخفاء client-side فوق الترتيب السيرفريّ — **يحافظ على ترتيب `last_activity_at` تنازليًّا** (مُثبَت في السموك).
- **بلا مكتبات خارجيّة**، بلا migration، بلا تغيير في منطق السيرفر للترتيب أو الجلب.
- **عرض التشخيصات في الـDrawer:** أُعيدت كتابة `dedupTxt` لتعرض `signal · matched · ar/en · dist · sim` + إصلاح خطأ قديم (كانت تقرأ `dd.slugHit.slug` على سلسلة نصّيّة فلا تَعرِض شيئًا — الآن تَعرِض القيم الصحيحة).

## 4) لماذا لا migration؟
التذكرة **تصنيف/تشخيص + بحث client-side فقط**. كائن `dedup` كان موجودًا ويُمرَّر أصلًا إلى الـDrawer؛ أضفنا حقولًا محسوبة في الذاكرة وقت التصنيف لا تُخزَّن. لا تغيير على أيّ جدول. **لم تُنشأ/تُعدَّل أيّ migration.** لا خطوة Supabase مطلوبة منك لهذه التذكرة.

## 5) الملفّات المعدَّلة (3 + تقرير، معزولة)
| الملفّ | التغيير |
|---|---|
| `scripts/review-discovered-cities.mjs` | **+101/−3** — 5 دوالّ تشابُه/مسافة بلا تبعيّات · `NEAR_DUPLICATE` يتطلّب `nearSim ≥ 0.72` · القُرب-فقط ⇒ `READY_FOR_REVIEW` · 6 حقول تشخيص في `dedup` (+ `signal`) |
| `server.js` | **+11/−9** — توسيع `data-text` للبحث · توسيع placeholder + زرّ `f-q-clear` · ربط زرّ المسح · إعادة كتابة `dedupTxt` لعرض التشخيصات (وإصلاح قراءة السلسلة) |
| `scripts/_smoke_discovered_cities_admin_search_and_near_duplicate_review_1.mjs` | **جديد** — 34 تأكيدًا (19 وحدة-مُصنِّف + 15 خادم-بحث) |

**لم يُمَسّ:** index.html · js/app.js · css · curated · sitemap · search العامّ · migrations · منطق promote-commit/name-overrides/promotion-status.

## 6) نتائج الاختبار
- **سموك التذكرة الجديد: 34/34 ✓** — النابية **ليست** NEAR_DUPLICATE (`coordinate_near_only`, sim 0.22, dist 3.9كم) · تهجئة-مختلفة تبقى NEAR_DUPLICATE (`mixed_signal`, sim 0.80) · تطابق اسم/alias/slug ⇒ ALREADY_CURATED بالإشارة الصحيحة · بعيد-مختلف ⇒ READY_FOR_REVIEW (signal=null) · JSON يحمل حقول التشخيص · ترتيب `last_activity_at` تنازليّ محفوظ · `#f-q` + `#f-q-clear` + placeholder موسّع · `data-text` يحوي ar/en/slug/cc/status/alias · 0 أسرار · curated غير ممسوس · `/`→200 · admin بلا token→401.
- **regression — كامل سويت admin (10 سموك): 258/258، صفر فشل** — search_and_near_duplicate 34 · filter_last_activity 23 · name_overrides 31 · sorting_and_branch_status 31 · promote_commit 22 · promote_commit_error_diagnostics 32 · promote_preview 28 · review_actions 18 · dashboard_mvp 21 · ssr_name_resolution 18.
- **regression عامّ: 10/10 صفحات عامّة → 200** (`/` · `/prayer-times-in-makkah` · `/qibla` · `/moon-today` · `/azkar` · `/today-hijri-date` · `/zakat-calculator` · `/date-converter` · `/sitemap-main.xml` · `/en/prayer-times-in-london`) · **admin بلا token → 403** (لوحة + API، fail-closed).
- **`node --check server.js` + `node --check scripts/review-discovered-cities.mjs` سليمان.**
- **فحص JS المُضمَّن في صفحة admin المُولَّدة: كتلة واحدة، 0 أخطاء** (vm-compile للصفحة المعروضة فعلًا — يضمن أنّ زرّ المسح وdedupTxt يحلّلان نحويًّا).

## 7) تأكيدات النطاق
- ✅ **admin-only** — التغيير حصرًا في `classifyRow`/`dedup` (مُصنِّف admin، مُستدعى من مسارَي admin فقط) + render اللوحة + `data-text`/البحث (مسار admin، noindex).
- ✅ **لا تغيير على curated** ولم تُضَف «النابية»، ولا على الإحداثيّات/الـslug/الأسماء البديلة لأيّ مدخل.
- ✅ **لا تأثير على** promote-commit / name-overrides / promotion-status — التذكرة classification/diagnostics + بحث فقط (مُثبَت: سموك promote/name/review/sorting كلّها 100%).
- ✅ **الصفحات العامّة 200**، **/admin 403 بلا token**، **بلا مكتبات خارجيّة**، **بلا migration**.

## 8) قيود الأدوات (إفصاح)
لا route عامّ جديد ⇒ لا «انقلاب 404→401» كإشارة نشر؛ الإشارة بعد الدفع = نشر Render التلقائيّ من main + صحّة الخدمة + سلامة المسارات العامّة. **السلوك الفعليّ للبحث والـDrawer خلف `ADMIN_TOKEN`** — مُتحقَّق محليًّا (سموك 258/258 + فحص JS المُضمَّن) + بصريًّا عند فتحك اللوحة (اكتب في صندوق البحث، جرّب زرّ المسح، افتح Drawer لمدينة قريبة-مختلفة وتحقّق أنّها READY_FOR_REVIEW مع `coordinate_near_only`).

## 9) رسالة commit المقترحة
```
feat(admin): DISCOVERED-CITIES-ADMIN-SEARCH-AND-NEAR-DUPLICATE-REVIEW-1 — add admin search and require strong duplicate signal beyond proximity
```
الالتزام = `scripts/review-discovered-cities.mjs` + `server.js` + السموك الجديد + هذا التقرير (4 ملفّات، معزولة).

---

**الخلاصة:** `NEAR_DUPLICATE` لم يَعُد يُطلَق بالقُرب وحده — يتطلّب تطابُق اسم ≥ 0.72؛ القُرب-فقط بأسماء مختلفة (مثل «النابية») يصير `READY_FOR_REVIEW` مع تشخيص واضح (`signal`/`matched_curated`/`distance_km`/`name_similarity`). وأُضيف شريط بحث يغطّي ar/en/slug/cc/status/alias مع زرّ مسح، يعمل مع الفلاتر ويحفظ ترتيب آخر نشاط. **بلا migration، admin-only، بلا تغيير على curated، 258/258 admin + 10/10 عامّ.**

**للاعتماد أرسِل:** `أعتمد دفع تقرير: DISCOVERED-CITIES-ADMIN-SEARCH-AND-NEAR-DUPLICATE-REVIEW-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا أبدأ أيّ تذكرة جديدة ولا صفحة أذكار قبل اعتمادك؛ والأذكار موقوفة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
