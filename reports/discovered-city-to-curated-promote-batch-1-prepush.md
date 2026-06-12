# تقرير ما قبل الدفع: DISCOVERED-CITY-TO-CURATED-PROMOTE-BATCH-1

**النوع:** ترقية أوّل دفعة (2 مدينة سعوديّة READY_FOR_REVIEW) من discovered إلى curated.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** ملفّ بيانات + سكربت تطبيق. **بلا** server/site-search/APIs/Supabase/db-cities/index.html.
**القاعدة (مُحدَّثة):** `origin/main = HEAD = baa125c` (كانت `828dda2`؛ تقدّمت بعد إغلاق DISCOVERED-CITY-SEARCH-HOMONYM-MERGE-FIX-1 + PALESTINE-DISPLAY-NORMALIZATION-FIX-1).

## 0) إعادة التحقّق على القاعدة الحاليّة `baa125c` (2026 — RE-VERIFIED) ✅
بطلبك: أُعيد التحقّق على آخر `main` بعد إغلاق الإصلاحين، بلا push.
- **Base updated:** `828dda2 → baa125c` ✓.
- **Recheck PASSED** — كل فحوص الأقسام 1–14 أدناه مُعادة على `baa125c`: البحث يجد المدينتين curated (عريعرة/uray-irah + الأجفر/al-ajfar)؛ الصفحات الأربع (ar+en) **200 · robots=index,follow · H1=1 · العنوان باسم المدينة · 0 backtick في Uray‘irah**؛ مواقيت تُحسب (`__PRAYER_CITY__` + بنية prayer-time)؛ SA=**186**؛ slug فريد (لا تصادم)؛ لا near-duplicate (<0.05°)؛ لا ازدواج discovered.
- **No conflict with homonym** ✓ — المدينتان سعوديّتان، لا تماثل عبر الدول؛ دمج `/api/search-place` يُرجِعهما curated بنتيجة واحدة لكلٍّ.
- **No conflict with Palestine normalization** ✓ — `cc=sa` (ليس il/ps)، فالـnormalizer يمرّرهما بلا تغيير؛ الانحدار يؤكّد 0 تسريب إسرائيل على كل الصفحات المختبَرة.
- **Only `curated-places.json` + promote script in scope** ✓ — `git diff --name-only` = `db/places/curated-places.json` فقط (متعقَّب) + `scripts/promote-discovered-sa-batch-1-to-curated.mjs` (جديد). **لا** أيّ ملفّ homonym/Palestine في هذه الدفعة.
- **صفحة الدولة:** `/prayer-times-in-saudi-arabia` (+/en/) → 200؛ SSR يحوي **186 مدينة curated** عبر `_curatedCitiesForCc` (الذي استبدل `db/cities-*.json` القديم) — **الاثنتان (عريعرة + الأجفر) حاضرتان في الشبكة**. (ملاحظة: `db/cities-sa.json` ملفّ **قديم غير مُستخدَم** لشبكة الدولة بعد PREHYDRATED-CITIES-DATA-FIX؛ خارج النطاق ولا أثر له.)
- **Regression (`baa125c`):** `/prayer-times-in-riyadh` · `/prayer-times-in-makkah` · `/prayer-times-in-morocco` · `/prayer-times-in-chefchaouen` · `/` · `/qibla` · `/azkar` · `/msbaha` → **كلّها 200 · H1=1 · 0 تسريب إسرائيل**.

## 1) سبب اختيار الدفعة
دفعة صغيرة آمنة من **السعودية فقط** (لغة محلّيّة = ar متوفّرة، أعلى ثقة). كلتا المدينتين `READY_FOR_REVIEW` في تقرير المراجعة الحيّ (`meta.source="supabase"`)، dedup كلّه null، أسماء ar أصيلة موثوقة. عريعرة الأعلى طلبًا (`selected_count=8`).

## 2) المدن المُضافة (2)
| الاسم | slug | type | selected |
|---|---|---|---|
| عريعرة | `uray-irah` | village | 8 |
| الأجفر | `al-ajfar` | town | 1 |
> النوع (village/town) **محفوظ من السجلّ** — curated يحوي 1009 town + 25 village (اصطلاح قائم).

## 3) مصدر البيانات
`reports/pending-discovered-cities.json` (تشغيلك الحيّ لأداة المراجعة على Supabase). القيم المُستخدَمة هي السجلّ المُتحقَّق لكلّ مدينة. **بلا أيّ لمس لـSupabase** في هذه التذكرة.

## 4) lat/lng لكل مدينة (من سجلّ discovered/nominatim)
| | lat | lng | timezone |
|---|---|---|---|
| uray-irah | 25.977396 | 48.8687799 | Asia/Riyadh |
| al-ajfar | 27.4725 | 42.998889 | Asia/Riyadh |

## 5) عدد مدن السعودية قبل/بعد
| | قبل | بعد |
|---|---|---|
| curated إجماليّ | 2980 | **2982** (+2) |
| SA (`_curatedCitiesForCc`) | **184** | **186** |
| بطاقات صفحة السعودية (ar+en) | 184 | **186** (الاثنتان موجودتان) |

## 6) فحص slug collision
`uray-irah` و`al-ajfar`: **0** في curated (عالميًّا). لا تصادم.

## 7) فحص near duplicate
بالإحداثيّات الفعليّة (نفس الدولة، <0.15°): **NONE** للاثنتين (مؤكَّد في تقرير المراجعة + إعادة فحص بالإحداثيّات).

## 8) فحص names.ar / names.en
| | names.ar | جودة ar | names.en | ملاحظة en |
|---|---|---|---|---|
| uray-irah | عريعرة (أصيل، سكربت عربيّ) | curated | **Uray‘irah** | **نُظِّف**: المصدر كان `` `Uray`irah `` بـbacktick (أثر nominatim) → الصيغة الطباعيّة `Uray‘irah` (U+2018) **باعتمادك**. ليست ترجمة — إزالة تلوّث فقط |
| al-ajfar | الأجفر (أصيل) | official | Al Ajfar | نظيف، بلا تغيير |
> السكربت يحوي فحص `namesTrustworthy` يرفض أيّ backtick في en وأيّ سكربت خاطئ. fr/de كانا fillchain==en في المصدر → **لم يُحملا** (لا fillchain). الاسم العربيّ والـslug بلا تغيير.

## 9) نتيجة الصفحات الجديدة (محلّيًّا)
| | ar | en |
|---|---|---|
| `/prayer-times-in-uray-irah` | 200 · index,follow · H1=1 «مواقيت الصلاة في عريعرة اليوم» · hreflang=11 · Title 52cp | H1 «Prayer Times in **Uray‘irah** Today» · **بلا backtick** |
| `/prayer-times-in-al-ajfar` | 200 · index,follow · H1=1 «…الأجفر…» · hreflang=11 · Title 52cp | — |
> **متصفّح حيّ (uray-irah):** مواقيت الصلاة **تُحسب فعلًا** (قيم حقيقيّة لإحداثيّاتها)، اسم المدينة ظاهر، H1=1، بلا تسرّب backtick.

## 10) نتيجة بحث الموقع
`عريعرة`→uray-irah(curated) · `الأجفر`→al-ajfar(curated) · `uray`→uray-irah(curated) · `ajfar`→al-ajfar(curated). الاثنتان تُوجَدان كـ**curated** بلا ازدواج discovered (القانونيّ يفوز).

## 11) تأكيد عدم لمس Supabase
صفر اتّصال/كتابة بـSupabase. السكربت يقرأ القيم المُتحقَّقة محلّيًّا فقط ويكتب `curated-places.json` (+ نسخة احتياطيّة `.preSaBatch1.bak`).

## 12) تأكيد عدم لمس search / noindex / server
`server.js` · `js/site-search.js` · `/api/search-place` · `/api/place-selected` · search pipeline · noindex guard — **غير معدَّلة**. الحارس + العدّ + البحث تلتقط المُدخلَين تلقائيًّا من `_CURATED_PLACES`/`_CURATED_SLUG_INDEX` عند الإقلاع.

## 13) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `db/places/curated-places.json` | +2 مُدخل (uray-irah, al-ajfar) — +40 سطرًا، 0 حذف |
| `scripts/promote-discovered-sa-batch-1-to-curated.mjs` | **جديد** — سكربت التطبيق (isReady + namesTrustworthy(backtick) + near-dup + name-collision + idempotent + canonical 2-space + نسخة احتياطيّة) |
> **لم يُمَسّ:** db/cities · index.html · slugs الحاليّة · canonical/hreflang العام · صفحات الدولة/المدن الأخرى · الأذكار · المسبحة · حساب الصلاة.

## 14) نتائج regression
`/prayer-times-in-riyadh` · `/prayer-times-in-makkah` · `/prayer-times-in-saudi-arabia` · `/` · `/qibla` · `/azkar` · `/msbaha` → **كلّها 200 · H1=1**. لا مساس بأيّ مدينة قائمة.

## 15) رسالة commit المقترحة
```
feat(cities): DISCOVERED-CITY-TO-CURATED-PROMOTE-BATCH-1 — promote first reviewed Saudi discovered cities
```

---
**الخلاصة:** ترقية مدينتين سعوديّتين (عريعرة `village` + الأجفر `town`) من discovered إلى curated عبر سكربت مخصّص — بياناتهما من تقرير المراجعة الحيّ، أسماء ar أصيلة، en نظيف (backtick مُزال لعريعرة باعتمادك)، dedup/collision نظيف، lat/lng من السجلّ. السعودية **184→186**، الصفحتان 200 index H1=1 ومواقيت تُحسب، البحث يجدهما curated — بلا لمس Supabase/البحث/noindex/server/db-cities.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITY-TO-CURATED-PROMOTE-BATCH-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
