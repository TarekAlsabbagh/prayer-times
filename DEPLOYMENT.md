# Deployment Checklist — Phase J Pre-Launch QA

نظام النشر يعتمد على Node.js (≥16) مع dependencies بسيطة (`clean-css` + `terser`) ومتغيّرَين فقط من البيئة.

## 1. متغيّرات البيئة (Environment Variables)

| المتغيّر | الإنتاج | المحلّي |
|---|---|---|
| `SITE_URL` | `https://YOUR-DOMAIN.com` (إلزاميّ — بدون `/` في النهاية) | `http://localhost:3000` (افتراضيّ) |
| `PORT` | حسب host (Render = 10000) | `3000` |

**مهمّ:** عند تعيين `SITE_URL`، يستخدمه الخادم في:
- `robots.txt` (`Sitemap: ${SITE_URL}/sitemap.xml`)
- `sitemap.xml` و sub-sitemaps (كلّ `<loc>` يستخدمه)
- canonical links في صفحات المدن

## 2. خطوات النشر على Render (أو staging)

### قبل push:
```bash
# 1) إثراء بيانات المدن (حقن type/priority/countryEn/aliases)
node scripts/enrich-local-cities.mjs

# 2) توليد db/curated-slugs.json (canonical slugs + 301 redirects)
node scripts/build-curated-sitemap.mjs

# 3) تشغيل كلّ الاختبارات (407 اختبار)
node scripts/predeploy-check.mjs
# يجب أن يكون: 26/26 passed
```

### إعداد Render:
- **Build command:** `npm install`
- **Start command:** `node server.js`
- **Environment:**
  - `SITE_URL` = `https://prayer-times.com` (الدومين النهائيّ)
  - `PORT` = `10000` (أو ما يحدّده Render تلقائيًا)
- **Health check path:** `/`

### بعد deploy:
```bash
# اختبار الإنتاج (يستبدل localhost بالدومين الحقيقيّ)
SITE_URL=https://YOUR-DOMAIN.com node scripts/predeploy-check.mjs
```

## 3. التحقّق اليدويّ بعد النشر

**روابط أساسيّة (يجب أن ترجع 200 + canonical صحيح):**
- `/prayer-times-in-riyadh`
- `/prayer-times-in-makkah`
- `/qibla-in-makkah`
- `/moon-today-in-riyadh`
- `/time-left-until-prayer-in-cairo`
- `/next-prayer-time-in-london`

**Redirects (يجب أن ترجع 301):**
- `/prayer-times-in-mecca` → `/prayer-times-in-makkah`
- `/qibla-in-mecca` → `/qibla-in-makkah`
- `/moon-today-in-mecca` → `/moon-today-in-makkah`
- `/prayer-times-in-giza-governorate` → `/prayer-times-in-giza`
- `/prayer-times-in-singapore` → `/prayer-times-in-singapore-city`
- `/en/prayer-times-in-mecca` → `/en/prayer-times-in-makkah`

**في كلّ صفحة مدينة:**
- ✓ H1 وحيد
- ✓ canonical يطابق الـ URL الحاليّ
- ✓ 11 hreflang (10 لغات + x-default)
- ✓ JSON-LD صالح (BreadcrumbList + WebPage + FAQPage)
- ✓ روابط داخليّة لـ qibla/moon/time-left/next-prayer (في SSR)
- ✓ لا روابط HTTP (كلّها HTTPS)
- ✓ لا query params في أيّ href

## 4. ما يجب ألّا يُفهرس

`/robots.txt` يحظر فهرسة:
- `/api/*`
- `/search`
- `/*?city=`
- `/*?lat=`
- `/*?lng=`
- `/*?q=`

## 5. صحّة Sitemap

عند زيارة `/sitemap.xml` يجب أن:
1. يستخدم `https://` فقط (لا `http://` ولا `localhost`)
2. يشير إلى sub-sitemaps بنفس الدومين
3. كلّ `<loc>` في sub-sitemap يطابق slug في `db/curated-slugs.json`
4. كلّ url يحوي 11 `<xhtml:link rel="alternate" hreflang="…"/>` (10 لغات + x-default)
5. لا يحوي slugs قديمة (mecca, giza-governorate, إلخ)
6. لا coord-only slugs (`loc-NN.Nx-NN.Nx`)

## 6. سكربتات الاختبار المتاحة

| السكربت | الغرض | اختبارات |
|---|---|---|
| `scripts/test-smart-search.mjs` | محرّك البحث | 110 |
| `scripts/test-search-routing.mjs` | بناء slug + Routing | 67 |
| `scripts/test-sitemap-canonical.mjs` | `db/curated-slugs.json` | 16 |
| `scripts/test-sitemap-output.mjs` | sitemap الفعليّ من الخادم | 14 |
| `scripts/test-page-template-seo.mjs` | 20 صفحة مدينة (title/H1/canonical/hreflang/JSON-LD) | 200 |
| `scripts/predeploy-check.mjs` | كلّ ما سبق + smoke tests | 26 |

**كلّها تقبل `SITE_URL` env للاختبار ضدّ staging/production.**

## 7. سير عمل CI المقترح

```yaml
# .github/workflows/predeploy.yml (مثال)
name: Pre-Deploy QA
on: [push, pull_request]
jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: node scripts/enrich-local-cities.mjs
      - run: node scripts/build-curated-sitemap.mjs
      - run: node server.js &  # تشغيل الخادم في الخلفيّة
      - run: sleep 3
      - run: node scripts/predeploy-check.mjs
```

## 8. بعد النشر — Phase K

- إضافة الدومين في Google Search Console
- إرسال `${SITE_URL}/sitemap.xml`
- اختبار 10 صفحات أساسيّة عبر URL Inspection
- مراقبة: Coverage / Indexing / Core Web Vitals
