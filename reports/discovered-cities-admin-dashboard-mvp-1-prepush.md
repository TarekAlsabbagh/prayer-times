# تقرير ما قبل الدفع: DISCOVERED-CITIES-ADMIN-DASHBOARD-MVP-1

**النوع:** ميزة — لوحة تحكّم **خاصّة، noindex,nofollow، Read-only** فوق `discovered_places`.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `HEAD = origin/main = 9bb9799`.
**الخطة المعتمدة:** [discovered-cities-admin-dashboard-mvp-1-plan.md](discovered-cities-admin-dashboard-mvp-1-plan.md).

---

## 1) الملفّات المعدَّلة

| الملفّ | التغيير |
|---|---|
| `server.js` | **+248** — `_ADMIN_TOKEN` + بذرة اختبار inert · `_adminTokenFromReq`/`_adminAuthState` (مصادقة) · `_loadReviewModule` (import مُخزَّن للمُصنِّف) · `_buildDiscoveredAdminRows` (جلب+تصنيف+إثراء+whitelist) · `_renderDiscoveredAdminPage` (SSR HTML+CSS+JS inline) · معالِج `/admin/discovered-cities` + `/api/admin/discovered-cities` |
| `scripts/_smoke_discovered_cities_admin_dashboard_mvp_1.mjs` | **جديد** — سموك ذاتيّ-الاكتفاء (مرحلتان: بلا token → 403، ثمّ token+fixture) — 21 تأكيدًا |

**لم تُمَسّ:** `index.html` · `style.css` · `curated-places.json` · `db/cities` · i18n · sitemap · search pipeline · `/api/search-place` · `/api/place-selected` · noindex guard · صفحات الصلاة/القمر/القبلة/الأذكار/المسبحة · الحساب/canonical/hreflang. **لا cache-buster** (لا أصل عميل عامّ). (تقرير الخطة موجود كوثيقة عمل غير متتبَّعة.)

## 2) طريقة الحماية

- **`ADMIN_TOKEN` (env، سيرفر فقط)** — يُقبَل عبر `?token=<token>` **أو** `Authorization: Bearer <token>`.
- **مقارنة زمن-ثابت** (`crypto.timingSafeEqual` + فحص الطول) — لا timing leak.
- **Fail-closed:** `ADMIN_TOKEN` غير مضبوط → **403** على المساريْن (الميزة مُعطَّلة، لا تُفتَح أبدًا).
- مفقود/خاطئ → **401** · صحيح → **200**.
- **بلا cookie/login** (قرارك). الدخول يدويّ من طرفك فقط (لا رابط عامّ يحوي token).
- **المُصنِّف:** إعادة استخدام `scripts/review-discovered-cities.mjs` (يُصدِّر دوالّه + main-guard) عبر `import()` ديناميكيّ مُخزَّن ← الحالات الـ6 مطابقة لتقرير المراجعة 1:1.

## 3) نتائج 403/401/200 (مُتحقَّقة محلّيًّا — سموك ذاتيّ-الاكتفاء)

| الحالة | الصفحة | API |
|---|---|---|
| بلا `ADMIN_TOKEN` env (fail-closed) | **403** ✓ | **403** ✓ |
| token مفقود | **401** ✓ | **401** ✓ |
| token خاطئ (`?token=nope` / `Bearer wrong`) | **401** ✓ | **401** ✓ |
| token صحيح (`?token=`) | **200** ✓ | **200** ✓ |
| token صحيح (`Authorization: Bearer`) | — | **200** ✓ |

## 4) شكل البيانات الآمنة (JSON)

`{ total, counts:{<status>:n}, dataSource, rows:[ {slug, displayName, nameAr, nameEn, countryCode, countryName, source, lat, lng, timezone, pickCount, searchCount, firstSeen, lastSeen, status, reason, arStatus, nameQuality, verified, route, countryRoute, pageStatus, detail:{names,aliases,coordinates,timezone,source,source_id,verified,name_quality,dedup}} ] }`.
**whitelist صريح** — `select` يحدّد الأعمدة (لا `search_blob`)؛ **0 أسرار** (لا SUPABASE URL/KEY، لا ADMIN_TOKEN، لا env/headers/cookies). مُتحقَّق: khams → `nameAr="خمس جوامع"`, `status=READY_FOR_REVIEW`؛ testnoar → `NEEDS_AR_NAME`.

## 5) الحقول المعروضة (الجدول)
status · slug · display · ar · en · cc · country · source · lat,lng · tz · pick · search · first seen (`created_at`) · last seen (`last_used_at`) · name_quality · verified · page status (curated·indexable / discovered·noindex) · روابط سريعة (prayer + country، `rel="noopener nofollow"`، تبويب جديد) · `<details>` JSON مختصر. **عدّادات** أعلى الصفحة لكلّ حالة + Total. **الفرز:** READY_FOR_REVIEW → pick تنازليّ → last_seen.

## 6) الفلاتر
country · status · has Arabic name · has English name · min pick count · بحث slug/name. تُنفَّذ **عميلًا** على `data-*` (بلا طلبات حاملة token، بلا أسرار). عدّاد «N / total shown» يتحدّث.

## 7) noindex/nofollow + الخصوصيّة
- كلّ ردّ (200/401/403/500) يحمل **`X-Robots-Tag: noindex, nofollow`** + `Cache-Control: no-store` + `Referrer-Policy: no-referrer`.
- الصفحة `<meta name="robots" content="noindex,nofollow">` + `<meta name="referrer" content="no-referrer">`.
- **خارج sitemap** — مُتحقَّق: 0 ذكر للوحة في `/sitemap.xml` + `/sitemap-main.xml` + `/sitemap-cities.xml`.
- **بلا روابط عامّة** — لم تُضَف لأيّ هيدر/فوتر/صفحة (التغيير endpoint/page جديد فقط؛ لم يُمَسّ index.html).

## 8) تأكيد عدم وجود أسرار
السموك يفحص HTML الصفحة + JSON الـAPI ضدّ: قيمة `ADMIN_TOKEN`، مفتاح SUPABASE الوهميّ المُمرَّر، السلسلة `service_role`، `SUPABASE_SERVICE_ROLE_KEY` → **0 تطابق** في كليهما. `SUPABASE_SERVICE_ROLE_KEY` يبقى داخل `_supabaseFetch` (سيرفر) ولا يُسلسَل أبدًا.

## 9) تأكيد عدم وجود روابط عامّة
لا رابط للوحة في أيّ صفحة عامّة (index.html/الهيدر/الفوتر بلا مساس). الدخول يدويّ بـtoken فقط.

## 10) نتائج regression
- **سموك التذكرة: 21/21 ✓** (403×3 · 401×3 · 200×4 · headers×3 · JSON shape+محتوى×5 · render×1 · no-secrets×2).
- **صفحات عامّة (خادم بلا env):** `/` · `/prayer-times-in-riyadh` · `/prayer-times-in-khams-djouamaa` · `/qibla` · `/moon-in-riyadh` · `/azkar` · `/msbaha` → **كلّها 200** · بلا كسر.
- **fail-closed على خادم عاديّ:** `/admin/discovered-cities` + API → **403** (بلا `ADMIN_TOKEN`).
- `node --check server.js` + السموك سليمان.

## 11) إفصاح — بذرة اختبار inert في الإنتاج
`_DISCOVERED_ADMIN_TEST_ROWS` (env `DISCOVERED_ADMIN_TEST_FIXTURE`) تُقرأ **فقط** حين Supabase معطّل + المتغيّر مضبوط — تتيح اختبار اللوحة محلّيًّا بلا Supabase حيّ. في الإنتاج `_SUPABASE_ENABLED=true` فيُنفَّذ الجلب الحقيقيّ ولا تُبلَغ أبدًا. (قيد بيئيّ: امتلاء الجدول ببيانات Supabase الحيّة + ظهور Khams Djouamaa من الإنتاج يُؤكَّد بعد الدفع — بضبط `ADMIN_TOKEN` في Render env. الإصدار يقرأ Supabase حصرًا في الإنتاج، لا التقرير القديم.)

## 12) رسالة commit المقترحة (المعتمدة منك)
```
feat(admin): DISCOVERED-CITIES-ADMIN-DASHBOARD-MVP-1 — add protected read-only discovered cities dashboard
```
الالتزام = `server.js` + `scripts/_smoke_…mvp_1.mjs` + هذا التقرير (3 ملفّات، معزولة).

> **بعد الدفع:** اضبط `ADMIN_TOKEN` في Render env (وإلّا تظلّ اللوحة 403 fail-closed). ثمّ افتح `/admin/discovered-cities?token=<your-token>` يدويًّا — تتحقّق البيانات الحيّة + ظهور Khams Djouamaa.

---
**الخلاصة:** لوحة `/admin/discovered-cities` + API مُرافِق، **مَحميّة بـ`ADMIN_TOKEN` (403/401/200) + noindex,nofollow + خارج sitemap + بلا روابط عامّة + 0 أسرار**، **Read-only**، تقرأ Supabase سيرفر-فقط وتعيد استخدام مُصنِّف المراجعة (6 حالات، طازج). 21/21 سموك + 7 صفحات regression 200 + 0 sitemap-hits. **بلا لمس curated/i18n/client/sitemap/أيّ مسار قائم.**

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITIES-ADMIN-DASHBOARD-MVP-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
