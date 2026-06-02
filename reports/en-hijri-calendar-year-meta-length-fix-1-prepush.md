# تقرير ما قبل الدفع: EN-HIJRI-CALENDAR-YEAR-META-LENGTH-FIX-1

**النوع:** Audit + Fix (EN-only) · **الملفّ:** server.js (سطر واحد) · **بلا cache-buster** (الميتا SSR، `no-cache`).

## السبب الجذريّ
SSR meta للسنة الإنجليزية = **161** (>160). بعد `GLOBAL-CLIENT-SEO-NO-OVERWRITE-SSR-FIX-1` لم يَعُد العميل يدهس SSR على صفحة الهبوط → فأصبحت قيمة SSR (161) ظاهرة للزواحف. المصدر: `server.js:10024` (`_HY_DESC.en`).

## التغيير (سطر واحد، server.js:10024)
- **قبل (161):** `Browse the Hijri calendar for ${year} AH with all Islamic months, days per month, matching Gregorian dates, and links to date conversion and monthly calendar tools.`
- **بعد (148):** `Browse the Hijri calendar for ${year} AH with Islamic months, days per month, matching Gregorian dates, and date conversion and monthly calendar tools.`

(حُذِفت «all» و«links to»؛ المعنى محفوظ؛ ضمن النطاق المفضَّل 140–155.)

## التحقّق المحليّ (SSR + DOM بعد hydration)
| البند | النتيجة |
|---|---|
| `/en/hijri-calendar/1447` SSR+DOM meta | **148** ✅ (كان 161) |
| ديناميكيّة عبر السنوات | 1446=148 · 1447=148 · 1448=148 ✅ |
| `/en/hijri-calendar` (hub) | 148 ✅ |
| Title EN | 57 (لم يتغيّر؛ `&amp;` كان يُضخّم العدّ في curl) |
| metaCount / jsonLd | 1 / 2 (DOM) — duplicate meta = لا |
| canonical / og:url | ذاتيّة الإشارة ✅ |
| H1 | «Hijri Calendar for the Year 1447 AH — …» ثابت |
| جدول السنة + الحسابات | 12 صفًّا · 355 · Leap — دون تغيير |
| صفحات المقارنة (AR 144 · FR 169 · TR 139 · UR 109 · month 113 · today 153 · day 138) | **كلّها دون تغيير** (EN-only) |
| regression (محليّ) | 13/13 = 200 |

## خارج النطاق (للعلم — تذاكر مستقلّة محتملة)
FR year meta=169 (>160) · EN month meta=113 (<120) · UR year=109. لم تُمَسّ.

## الملفّات
`server.js` — سطر واحد (10024). **لم يُمَسّ:** app.js · index.html · sw.js · CSS · i18n · Title · H1 · JSON-LD · canonical · hreflang · sitemap · الحسابات · الأذكار.

## رسالة commit
```
seo(en-hijri): EN-HIJRI-CALENDAR-YEAR-META-LENGTH-FIX-1 — shorten yearly Hijri calendar meta description
```
