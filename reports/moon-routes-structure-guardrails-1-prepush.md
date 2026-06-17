# MOON-ROUTES-STRUCTURE-GUARDRAILS-1 — PRE-PUSH REPORT

**النوع:** عقد بنية + اختبارات حماية فقط — **تنفيذ محليّ، لم يُعمل commit، ولم يُدفَع شيء.** بانتظار اعتمادك.
**التاريخ:** 2026-06-17. **HEAD:** `6746365`. **صفر تغيير runtime، صفر تغيير محتوى.**

---

## 1) ما الذي أُضيف كـ guardrails
- **اختبار حماية شامل واحد** `scripts/_smoke_moon_routes_structure_guardrails_1.mjs` (**64 تحقّق، 0 فشل**) يثبّت عقد بنية روابط القمر بالكامل (تصنيف العميل + /moon + 301 + مدن + future 404 + sitemap + canonical + non-moon + Meeus/tz).
- **ملفّ عقد البنية** `reports/moon-routes-structure-contract-1.md` — مصدر الحقيقة للحالة الحاليّة والمستقبليّة؛ أيّ تذكرة تُغيّر العقد تُحدّثه + الاختبار معًا.

## 2) هل تم تعديل كود runtime أم اختبارات فقط؟
✅ **اختبارات + توثيق فقط.** لا كود runtime. (الاختبار يقرأ المصدر ويشغّل السيرفر للقراءة فقط.)

## 3) هل تم تعديل server.js؟ ❌ لا (clean vs HEAD)
## 4) هل تم تعديل app.js؟ ❌ لا (clean vs HEAD)
## 5) هل تم تعديل sitemap/canonical؟ ❌ لا — لم يُمَسّ server.js إطلاقًا
## 6) هل تم تغيير محتوى /moon؟ **❌ لا.** لم يُمَسّ أيّ نصّ/تصميم/FAQ/قسم.
**أيضًا غير ممسوس:** `js/moon.js`، `index.html`، `sw.js`، `css/style.css` — كلّها clean vs HEAD. لا cache-buster ولا SW (لا ملفّ runtime تغيّر).

## 7) Route Contract الحاليّ
موثَّق في [moon-routes-structure-contract-1.md](reports/moon-routes-structure-contract-1.md): `/moon`=200 hub رسميّ (canonical ذاتيّ، index، sitemap)؛ `/moon-today`=301→/moon (خارج sitemap)؛ صفحات المدن 200 دون مساس؛ `/moon/{...}` المستقبليّة = 404 نظيف.

## 8) قائمة routes الحاليّة وحالتها
| الرابط | الحالة |
|---|---|
| `/moon` (+10 لغات) | 200 · canonical ذاتيّ · index · في sitemap · page-moon |
| `/moon-today` (+لغات/+/) | 301 → /moon · خارج sitemap |
| `/moon-today-in-{city}` | 200 · page-moon · canonical ذاتيّ |
| `/moon-in-{city}` | 200 · page-moon · canonical ذاتيّ |
| `/moon-in-{city}/{YYYY-MM}` | 200 · page-moon · canonical ذاتيّ |
| `/moon-in-{city}/{YYYY-MM-DD}` | 200 · page-moon · canonical ذاتيّ |

## 9) قائمة future routes وحالتها (غير مفعّلة)
`/moon/{country}` · `/moon/{country}/{city}` · `/moon/{country}/{city}/today` · `/{YYYY-MM}` · `/{YYYY-MM-DD}` → **404 نظيف الآن** (صفحة خطأ 1984 بايت، ليست shell 200KB). العميل يعرفها كـpage-moon مسبقًا. لا تدخل sitemap قبل التفعيل في تذاكر لاحقة مستقلّة.

## 10) نتائج /moon
✅ 200 · H1 واحد (#moon-hub-h1) · page-moon active · canonical ذاتيّ `…/moon` · index · محتوى فعليّ (FAQPage + search hero + cities grid) · جسم 204,745 بايت · **ليس footer-only**. متصفّح بعد hydration: page-moon active، footerOnly=false، 5196 حرفًا، H1 «حالة القمر اليوم».

## 11) نتائج /moon-today 301
✅ `/moon-today`→`/moon` · `/en/`→`/en/moon` · `/fr/`→`/fr/moon` · `/ur/`→`/ur/moon` · `/moon-today/`→`/moon` — **5/5 = 301**؛ ليست 200 مستقلّة؛ خارج sitemap.

## 12) نتائج روابط المدن القديمة
✅ `/moon-today-in-riyadh` · `/moon-in-riyadh` · `/moon-in-riyadh/2026-06` · `/moon-in-riyadh/2026-06-17` = **200 + page-moon + H1 واحد + canonical ذاتيّ** (4/4).

## 13) نتائج future /moon/... (لا 200 فارغة)
✅ الخمسة كلّها = **404 · ليست page-moon · جسم 1984 بايت** (ليست 200/footer-only/shell). متصفّح `/moon/saudi-arabia`: status=404، pageMoon=false، isShell=false.

## 14) نتائج sitemap
✅ فيه `…/moon` (+/en/moon)؛ **ليس فيه** `/moon-today</loc>`؛ **ليس فيه** `/moon/{country}` (future)؛ **0 إغراق أيّام** (لا `…/{YYYY-MM-DD}</loc>` للقمر).

## 15) نتائج canonical
✅ `/moon` ذاتيّ · `/moon-in-riyadh` ذاتيّ · `/moon-today` بلا جسم/canonical (301) ⇒ **لا تكرار canonical** بين /moon و/moon-today.

## 16) نتائج SPA classifier (مستخرَج فعليًّا من app.js)
✅ **22/22**: كلّ القديم + الجديد `/moon/...` (incl. `/en/moon/saudi-arabia/riyadh/today`) = page-moon؛ `/`, `/prayer-times-in-*`, `/qibla-in-*`, `/today-hijri-date`, `/date-converter`, `/moonshine`, `/moonlight` = ليست page-moon. وSSR: صفحات غير القمر الخمس ليست `#page-moon active`.

## 17) نتائج no footer-only
✅ SSR: /moon جسم 204KB + page-moon active + محتوى hub. متصفّح: footerOnly=false (5196 حرفًا). future routes = 404 (لا shell).

## 18) نتائج console errors
✅ متصفّح `/moon` بعد hydration: **No console logs** (level=error).

## 19) نتائج Meeus 49
✅ الرياض يونيو 2026: **15=المحاق · 16=هلال متزايد · 29=أحدب متزايد (ليس بدرًا) · 30=البدر**. مدينة أمريكيّة `/moon-today-in-new-york`: 200 + page-moon + banner هجريّ (tz المدينة). حارس بنيويّ: `js/moon.js` يحوي محرّك Meeus 49؛ `server.js` يستعمل `_hijriForIana(_cityIanaSsr)` لِبانر المدينة (لا fallback `_CC_TO_PRIMARY_TZ`).

## 20) نتائج regression (لا تغيير runtime ⇒ مطابقة لِالكوميت 6746365)
| الاختبار | النتيجة |
|---|---|
| **guardrails (جديد)** | ✅ **64/64** |
| moon-today-content-move | ✅ 34/34 |
| moon-spa-router | ✅ 36/36 |
| navbar open-in-new-tab | ✅ 39/39 |
| navbar-city-context | ✅ 59/59 |
| discovered noindex/index policy | ✅ 39/39 |
| countdown SEO/H1 | ✅ 424/424 |
| Meeus accuracy | ✅ 45/45 |
| moon grid | ✅ 212/212 |
| hijri-date-city-tz | ✅ ALL PASSED |
| `node --check` (الاختبار الجديد) | ✅ سليم |

## 21) قائمة الملفّات المعدَّلة (2 ملفّ جديد فقط)
| الملفّ | النوع |
|---|---|
| **جديد** `scripts/_smoke_moon_routes_structure_guardrails_1.mjs` | اختبار الحماية (64 تحقّق) |
| **جديد** `reports/moon-routes-structure-contract-1.md` | عقد البنية (مصدر الحقيقة) |
**صفر ملفّات runtime معدَّلة** (server.js/app.js/moon.js/index.html/sw.js/css كلّها clean vs HEAD).

## 22) هل احتجت cache-buster أو SW؟
**❌ لا.** لم يتغيّر أيّ ملفّ يُقدَّم للمتصفّح (app.js/css/index.html ثابتة) ⇒ لا حاجة لـcache-buster ولا SW bump.

## 23) رسالة الـcommit المقترَحة
```
test(moon): MOON-ROUTES-STRUCTURE-GUARDRAILS-1 — add guardrails for moon route structure before expansion

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

**لن أدفع ولن أعمل commit قبل:** `أعتمد دفع تقرير: MOON-ROUTES-STRUCTURE-GUARDRAILS-1` + «أوافق على تنفيذ الدفع». لم أبدأ تطوير محتوى /moon، ولا `/moon/{country}`، ولا `/moon/{country}/{city}`، ولا أيّ تذكرة أخرى.
