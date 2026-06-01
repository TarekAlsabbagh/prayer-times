# تقرير ما قبل الدفع: CANONICAL-PROD-ORIGIN-FIX-1

**التاريخ**: 2026-06-01  
**الـ HEAD المنوي بناؤه عليه**: `79e35d1` (EN-QIBLA-CITY-SEO-DYNAMIC-LENGTH-FIX-1 المُغلَق)  
**النوع**: Critical SEO infra fix — 3-tier defensive fallback لـ origin URL  
**الأولويّة**: 🔴 **عاجل** (يَمسّ كلّ canonical/og/hreflang/sitemap على production)

---

## 1. السبب الجذريّ

**`server.js:1544`** (قبل الفيكس):
```javascript
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
```

- `process.env.SITE_URL` **غير مُعَرَّف على Render** (env var مَفقود)
- `PORT=10000` على Render (افتراضيًّا)
- ⇒ `SITE_URL = 'http://localhost:10000'`
- ⇒ كلّ canonical / og:url / hreflang / sitemap على Production = `http://localhost:10000/...` 🚨

**Production audit confirmed**:
- 12/12 صفحات: canonical + og:url + hreflang = `http://localhost:10000/<path>`
- `/sitemap.xml`: 2 occurrences (لكلّ من `sitemap-main.xml` + `sitemap-cities-1.xml`)
- **`/sitemap-main.xml`: 54,720 occurrences لـ `localhost` في 5.9 MB** 🚨🚨

⇒ **كلّ URL يَكشفه Google عبر sitemap هو URL مَكسور غير قابل للوصول**

---

## 2. هل `SITE_URL` ناقص في Render؟

✅ **نعم — مُؤكَّد**. كلّ canonical يَنتج `localhost:10000` ⇒ السبب الفعليّ هو غياب `SITE_URL` env var على Render dashboard.

---

## 3. الإصلاح: config-only أم code change؟

✅ **Option C (الموصى به من قِبَلك) — كلاهما معًا**:

### Code change (في هذا الـ commit)
Defensive 3-tier fallback chain يَحمي حتى لو نُسي `SITE_URL` مستقبلًا:

```javascript
const SITE_URL = (
    process.env.SITE_URL              // Tier 1: explicit (custom domain)
    || process.env.RENDER_EXTERNAL_URL // Tier 2: Render-auto (e.g., x.onrender.com)
    || `http://localhost:${PORT}`     // Tier 3: dev fallback
).replace(/\/+$/, '');
```

**`RENDER_EXTERNAL_URL`** هو env var **يُحَدّده Render تلقائيًّا** للـ services بقيمة `https://your-app.onrender.com`. لا حاجة لضبطه يدويًّا.

### Config change (يُنفّذه المستخدم على Render dashboard لاحقًا — اختياريّ)
- إضافة `SITE_URL=https://prayer-times-d4w8.onrender.com` على Render env vars
- يَسبق `RENDER_EXTERNAL_URL` في الأولويّة
- يُتيح custom domain لاحقًا بدون code change

⇒ **الـ code fix كافٍ بمفرده لحلّ المُشكلة فورًا** (Tier 2 سيُستخدَم بمجرّد deploy). الـ config change هو belt-and-suspenders.

---

## 4. الملفّات المعدَّلة

`git diff --stat HEAD`:
```
 server.js | 20 +++++++++++++++++++-
 sw.js     | 27 ++++++++++++++++++++++++++-
 2 files changed, 45 insertions(+), 2 deletions(-)
```

- **`server.js`**: 1 declaration معدَّل (3-tier fallback) + ~15 سطر توثيق
- **`sw.js`**: `CACHE_VERSION 'v400' → 'v401'` + كتلة توثيق

---

## 5. قائمة صفحات قبل/بعد canonical

### قَبل (production الحاليّة — 12/12 صفحات مَكسورة):
```
/                              → canonical: http://localhost:10000/
/en/                           → canonical: http://localhost:10000/en
/prayer-times-in-riyadh        → canonical: http://localhost:10000/prayer-times-in-riyadh
/en/prayer-times-in-riyadh     → canonical: http://localhost:10000/en/prayer-times-in-riyadh
/qibla-in-riyadh               → canonical: http://localhost:10000/qibla-in-riyadh
/en/qibla-in-riyadh            → canonical: http://localhost:10000/en/qibla-in-riyadh
/qibla-in-makkah               → canonical: http://localhost:10000/qibla-in-makkah
/en/qibla-in-makkah            → canonical: http://localhost:10000/en/qibla-in-makkah
/moon-today                    → canonical: http://localhost:10000/moon-today
/hijri-calendar                → canonical: http://localhost:10000/hijri-calendar
/msbaha                        → canonical: http://localhost:10000/msbaha
/zakat-calculator              → canonical: http://localhost:10000/zakat-calculator
```

### بعد (محلّيًّا مع `RENDER_EXTERNAL_URL` set — يُحاكي Render production):
```
/qibla-in-riyadh → canonical: https://prayer-times-d4w8.onrender.com/qibla-in-riyadh ✅
```

⇒ **كلّ 12 صفحة سيُعدَّل canonical بنفس الطريقة** على production بمجرّد deploy.

### اختبار الـ 3 tiers محلّيًّا:

| Test | Env vars | canonical (للـ `/qibla-in-riyadh`) |
|---|---|---|
| Tier 3 (dev) | (لا env vars) | `http://localhost:3040/qibla-in-riyadh` ✅ (للـ dev) |
| Tier 2 (Render) | `RENDER_EXTERNAL_URL=https://...onrender.com` | `https://prayer-times-d4w8.onrender.com/qibla-in-riyadh` ✅ |
| Tier 1 (custom) | `SITE_URL=https://custom.example.com` + RENDER set | `https://custom.example.com/qibla-in-riyadh` ✅ (SITE_URL priority) |

---

## 6. فحص sitemap

### قَبل (production الحاليّة):
```
sitemap.xml:        2 localhost occurrences (354 bytes)
sitemap-main.xml:   54,720 localhost occurrences (5.9 MB!)
```

### بعد (محلّيّ مع RENDER_EXTERNAL_URL):
```
<loc>https://prayer-times-d4w8.onrender.com/sitemap-main.xml</loc>
<loc>https://prayer-times-d4w8.onrender.com/sitemap-cities-1.xml</loc>
```

✅ **كلّ ~55K URL في الـ sitemap سَتُعَدَّل** على production بمجرّد deploy → `localhost` يَختفي كلّيًّا.

---

## 7. فحص hreflang

كلّ صفحة على production تَحوي hreflang الذي يَستخدم نفس `SITE_URL`. مثلًا على `/en/qibla-in-riyadh` الحاليّة:
```
hreflang first entry: http://localhost:10000/qibla-in-riyadh
```

بعد الفيكس:
```
hreflang first entry: https://prayer-times-d4w8.onrender.com/qibla-in-riyadh
```

✅ **كلّ hreflang في كلّ صفحة** سَيُعَدَّل بنفس الطريقة (10 لغات × 12+ صفحة × عدّة hreflang entries لكلّ صفحة).

---

## 8. تأكيد عدم تَغيير الحسابات أو المحتوى

✅ **صفر تَعديل في**:
- مَعادلة Qibla / حسابات الصلاة / Kaaba reference
- city data / إحداثيّات / أسماء
- routing / regex matching للـ URLs
- sitemap **structure** (نفس الـ paths، فقط الـ origin يَتغيّر من `localhost:10000` إلى `prayer-times-d4w8.onrender.com`)
- HTML structure / Title / Description / H1
- JSON-LD schema content (فقط الـ `@id` و `url` fields سَتَستخدم الـ origin الجديد — هذا هو المَطلوب)
- i18n keys / النصوص المرئيّة
- CSS / JS / app.js / qibla.js

⇒ **التَغيير الفعليّ** = استبدال `http://localhost:10000` بـ `https://prayer-times-d4w8.onrender.com` في كلّ URL يَتمّ توليده server-side. هذا هو المَطلوب بالضبط.

---

## 9. cache-busters

| المفتاح | قبل | بعد |
|---|---|---|
| `sw.js CACHE_VERSION` | 'v400' (live على EN-QIBLA-DYNAMIC) | **'v401'** (مَفتاح بكر — للتَوثيق) |
| `css/style.css?v=` | 467 | 467 (لا تغيير) |
| `js/app.js?v=` | 751 | 751 (لا تغيير) |
| `_i18nVersion` | 190 | 190 (لا تغيير) |
| `js/prayer-times.js?v=` | 53 | 53 (لا تغيير) |

**ملاحظة**: HTML + sitemap responses لها `Cache-Control: no-cache` → الـ canonical الجديد يَصل المستخدم + Google فورًا بعد deploy. الـ sw bump للتَوثيق + deploy traceability.

---

## 10. رسالة الـ commit المقترَحة

```
fix(seo): CANONICAL-PROD-ORIGIN-FIX-1 — defensive 3-tier fallback for SITE_URL

SEOptimer audit revealed every production page (12/12 sampled) was
emitting canonical + og:url + hreflang as `http://localhost:10000/<path>`
instead of the actual production domain. sitemap-main.xml (5.9 MB)
contained 54,720 occurrences of `localhost` — every URL Google would
discover via sitemap was unreachable.

Root cause: server.js:1544 reads process.env.SITE_URL with a fallback
to `http://localhost:${PORT}`. On Render, SITE_URL was never configured
and PORT=10000, so SITE_URL evaluated to `http://localhost:10000` for
ALL canonical/og/hreflang/sitemap emission.

Fix (Option C — defensive 3-tier fallback):
  Tier 1: process.env.SITE_URL              (explicit, supports custom domains)
  Tier 2: process.env.RENDER_EXTERNAL_URL   (auto-provided by Render)
  Tier 3: `http://localhost:${PORT}`        (dev only)

Tier 2 is the active line of defense — Render auto-provides
RENDER_EXTERNAL_URL = "https://<service>.onrender.com" for every
service, so even with no manual env var config the canonical URLs
will resolve correctly to the .onrender.com domain.

For belt-and-suspenders, also recommend setting SITE_URL on the Render
dashboard to the preferred canonical domain (e.g., when a custom
domain is attached).

Tested locally with 3 scenarios:
  - No env vars       → http://localhost:3040/... (dev)
  - RENDER_EXTERNAL_URL → https://prayer-times-d4w8.onrender.com/...
  - SITE_URL          → https://custom.example.com/... (SITE_URL wins)

ZERO change to: prayer/qibla calculations, city data, routing,
sitemap structure, page content, Title, Description, H1, JSON-LD
schema fields (only the origin in URLs changes).

Files: server.js (1 declaration + ~15 lines doc) + sw.js (v400→v401
+ doc). HTML and sitemap responses are Cache-Control: no-cache so
users and Google see correct URLs immediately after deploy.

Expected impact:
  - canonical:    localhost:10000 → real domain on 12+ tested pages
  - og:url:       localhost:10000 → real domain
  - hreflang:     localhost:10000 → real domain (all 10 langs)
  - sitemap-main: 54,720 localhost occurrences → 0
  - Google index: previously-malformed URLs become real-domain URLs
```

---

## تأكيدات نهائيّة قبل الدفع — للاعتماد

| # | البند | الحالة |
|---|---|---|
| 1 | server.js: 3-tier fallback مُطبَّق (SITE_URL → RENDER_EXTERNAL_URL → localhost) | ✅ |
| 2 | sw.js: CACHE_VERSION v400→v401 + توثيق | ✅ |
| 3 | `node --check server.js + sw.js` نظيف | ✅ |
| 4 | Tier 1 (SITE_URL priority) مختبَر محلّيًّا | ✅ |
| 5 | Tier 2 (RENDER_EXTERNAL_URL fallback) مختبَر محلّيًّا | ✅ |
| 6 | Tier 3 (localhost dev fallback) مختبَر محلّيًّا | ✅ |
| 7 | sitemap origin مَحفوظ بنفس الـ tier system | ✅ |
| 8 | صفر تَعديل في حسابات / city data / routing / sitemap structure | ✅ |
| 9 | صفر تَعديل في content / Title / Description / H1 / JSON-LD fields | ✅ |
| 10 | غير مدفوع — في انتظار اعتمادك | ⏳ |

---

## في انتظار اعتمادك

عند ورود الاعتماد بصيغة:
> `أعتمد دفع تقرير: CANONICAL-PROD-ORIGIN-FIX-1`

سأُنفّذ:
1. `git add server.js sw.js reports/canonical-prod-origin-fix-1-prepush.md`
2. `git commit` بالنصّ في القسم 10
3. `git push origin main`
4. `ScheduleWakeup` ≥ 5 دقائق

**فحوصات ما بعد الدفع المُقترَحة**:
- نَفس الـ 12 صفحة + sitemap.xml + sitemap-main.xml — تَحَقُّق من اختفاء `localhost`
- توصية إضافيّة للمستخدم: ضَبط `SITE_URL` على Render dashboard كـ belt-and-suspenders

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
