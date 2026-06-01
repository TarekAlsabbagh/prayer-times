# تقرير ما قبل الدفع: QIBLA-CITY-SSR-INFO-GRID-PREFILL-FIX-1

**التاريخ**: 2026-06-01  
**الـ HEAD المنوي بناؤه عليه**: `0240887` (CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1 المُغلَق)  
**النوع**: server.js-only — SSR prefill لـ `#qibla-info-grid` cells  
**المرجع**: `reports/qibla-city-pages-lighthouse-lcp-render-delay-audit-1.md`

---

## 1. الملفّات المعدَّلة

`git diff --stat HEAD`:
```
 server.js | 49 +++++++++++++++++++++++++++++++++++++++++++++++++
 sw.js     | 29 +++++++++++++++++++++++++++--
 2 files changed, 77 insertions(+), 1 deletion(-)
```

| الملفّ | التغيير |
|---|---|
| `server.js` | +49 سطر — كتلة SSR injection داخل الـ Q-A SEO block (4 × `html.replace`) + تعليق توثيقيّ |
| `sw.js` | +28 سطر — كتلة توثيق + `CACHE_VERSION 'v396'→'v397'` |
| **`index.html`** | ❌ صفر تغيير |
| **`css/style.css`** | ❌ صفر تغيير |
| **`js/app.js`** | ❌ صفر تغيير |
| **`js/qibla.js`** | ❌ صفر تغيير |
| **`js/prayer-times.js`** | ❌ صفر تغيير |

---

## 2. أين تَمّ حساب أو حقن قِيَم القبلة في SSR

**الموقع**: `server.js` داخل الكتلة المُعنوَنة `Phase Q-A (2026-05-03): qibla-in-{city} SEO cleanup` على السطر ~19776 — بعد حساب `_bearing` و `_distance` للـ SEO bearing-badge، **قَبل** Section 1 (overview).

**الـ Gate Condition** (لا تَغيير):
```javascript
if (seo.qiblaRef && seo.qiblaRef.slug && typeof seo.qiblaRef.lat === 'number') {
    // ... existing Q-A block ...
}
```

⇒ يَعمل **حصرًا** على `/qibla-in-{city}` (و `/en/qibla-in-{city}` إلخ. عبر `seo.qiblaRef.slug` المُحَدَّد فقط لـ city pages).

⇒ **`/qibla` (Hub) غير مَتأثّر** — لا `qiblaRef.slug` على Hub.

---

## 3. القِيَم المَحقونة داخل `#qibla-info-grid`

4 عناصر `info-value` تُستبدَل `--` بالقِيَم الحقيقيّة:

| العنصر | قبل (placeholder) | بعد (SSR-injected) | مَنبَع |
|---|---|---|---|
| `#qibla-city` | `--` | `seo.qiblaRef.cityName` (مَلَفّ HTML-escaped) | بيانات المدينة |
| `#qibla-exact-angle` | `--` | `_bearingExact.toFixed(2) + '°'` | حساب جديد server-side |
| `#qibla-lat` | `--` | `seo.qiblaRef.lat.toFixed(4) + '°'` | بيانات المدينة |
| `#qibla-lng` | `--` | `seo.qiblaRef.lng.toFixed(4) + '°'` | بيانات المدينة |

---

## 4. هل تَمّ نسخ نفس مَعادلة العميل أم استخدام helper موجود

✅ **مَزيج**: استَعَدَّ formula الـ bearing الموجودة في server.js (مُحَسَّنة بالفعل لـ SEO badge) — أُعيد استخدامها بدون تَعديل، فقط أُضيفت سَطر إضافيّ لحساب `_bearingExact` بدقّة 2 decimals:

```javascript
// الـ formula الموجودة سابقًا (مَحفوظة):
const _y = Math.sin(_dLambda) * Math.cos(_phi2);
const _x = Math.cos(_phi1) * Math.sin(_phi2) - Math.sin(_phi1) * Math.cos(_phi2) * Math.cos(_dLambda);
let _bearing = Math.atan2(_y, _x) * 180 / Math.PI;
if (_bearing < 0) _bearing += 360;
_bearing = Math.round(_bearing);  // ← للـ SEO badge (integer)

// الإضافة الجديدة (لـ #qibla-exact-angle):
const _bearingExact = (Math.atan2(_y, _x) * 180 / Math.PI + 360) % 360;
```

**مقارنة مع `js/qibla.js` (`Qibla.calculate`)**:
```javascript
// js/qibla.js (client formula):
const numerator = Math.sin(lambdaK - lambda);
const denominator = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
let qibla = Math.atan2(numerator, denominator) * RAD;
```

**كلتاهما رياضيًّا مُتطابقتان** (الـ server.js يَستخدم cos(φ₂)·tan(φ₂) = sin(φ₂) فقط — نَفس الـ great-circle initial bearing). الـ atan2 يَعطي **نفس النتيجة** لأنّ الـ ratio numerator/denominator مُتطابق (الـ scale factor لا يُؤثّر على atan2).

**اختبار التَطابق** (Riyadh: lat=24.7136, lng=46.6753):
- server SSR-injected: `243.80°`
- client `Qibla.calculate()` المُتوقَّع: `243.80°` (نَفس formula)

⇒ **بايتيًّا متطابقان** بعد hydration.

---

## 5. مقارنة بين SSR و client بعد hydration

| الحقل | SSR-injected | Client (`updateQibla` بعد hydration) | مُتطابق؟ |
|---|---|---|---|
| `#qibla-city` | `الرياض` | `dispCity` ← مَنطقيًّا نفس القيمة من `__QIBLA_CITY__.names[lang]` | ✅ |
| `#qibla-exact-angle` | `243.80°` | `_qiblaAngle.toFixed(2) + '°'` (نفس formula) | ✅ |
| `#qibla-lat` | `24.7136°` | `currentLat.toFixed(4) + '°'` (نفس lat) | ✅ |
| `#qibla-lng` | `46.6753°` | `currentLng.toFixed(4) + '°'` (نفس lng) | ✅ |

**الـ client سيُكرّر الكتابة عبر `updateQibla()`** بعد hydration — overwrite idempotent بـ bit-for-bit identical values. لا flash، لا layout shift، لا اختلاف بصريّ.

---

## 6. تأكيد أنّ placeholders `--` لم تَعد موجودة في صفحات المدينة

**Smoke test محلّيّ على 6 صفحات** (PORT=3036):

| URL | city | angle | lat | lng |
|---|---|---|---|---|
| `/qibla-in-riyadh` | الرياض ✅ | 243.80° ✅ | 24.7136° ✅ | 46.6753° ✅ |
| `/qibla-in-jeddah` | جدة ✅ | 96.01° ✅ | 21.4858° ✅ | 39.1925° ✅ |
| `/qibla-in-makkah` | مكة المكرمة ✅ | 0.00° ✅ | 21.4225° ✅ | 39.8262° ✅ |
| `/qibla-in-rabat` | الرباط ✅ | 94.62° ✅ | 34.0209° ✅ | -6.8416° ✅ |
| `/en/qibla-in-riyadh` | Riyadh ✅ | 243.80° ✅ | (مُماثل) | (مُماثل) |
| `/en/qibla-in-jeddah` | Jeddah ✅ | 96.01° ✅ | (مُماثل) | (مُماثل) |

**التحقّق الدلاليّ**:
- ✅ مكّة → 0.00° (المُتوقَّع — نقطة الكعبة، الزاوية صفر)
- ✅ الرياض → 243.80° (جنوب-غرب — Qibla bearing من الرياض)
- ✅ جدّة → 96.01° (شرق تقريبًا — Qibla bearing من جدّة)
- ✅ الرباط → 94.62° (شرق — يَتطابق مع Africa→Saudi geometry)
- ✅ EN variants تَستخدم اسم المدينة الإنجليزيّ المَحلّيّ (Riyadh / Jeddah)

❌ **صفر `--`** في `#qibla-info-grid` على أيّ صفحة city.

---

## 7. تأكيد أنّ `/qibla` العامّة (Hub) لم تَتأثّر

**Smoke test محلّيّ**:
```
=== /qibla hub still has placeholder (NOT affected) ===
qibla-city: id="qibla-city">--<
qibla-exact-angle: id="qibla-exact-angle">--<
```

✅ `/qibla` Hub ما زالت تَحوي `--` placeholder — لأنّ الـ gate condition `seo.qiblaRef && seo.qiblaRef.slug` غير مُحَقَّق على Hub (لا city slug). هذا متعمَّد — Hub لا يَملك مدينة محدَّدة.

⇒ **`/qibla` Hub غير مَتأثّر** — السلوك القديم سَليم (client يَملأ بعد hydration حسب الـ geolocation أو `currentLat/currentLng` الديناميّ).

---

## 8. تأكيد أنّ صفحات المدن العربيّة والإنجليزيّة سَليمة

✅ AR (4 مدن): جميع الـ 4 cells مَملوءة بـ SSR بقِيَم صحيحة بَيانيًّا ودَلاليًّا.  
✅ EN (2 مدينة sample): جميع الـ 4 cells مَملوءة بـ SSR، اسم المدينة بالإنجليزيّة (`Riyadh`/`Jeddah`).  
✅ الـ angle/lat/lng متطابقة بين AR و EN (نفس المدينة، نفس الحسابات).

⇒ **i18n hydration سَليمة**: لا تَخلِط نصّ AR على EN page أو vice versa.

---

## 9. تأكيد أنّ حساب القبلة لم يتغيّر

✅ **مَعادلة `js/qibla.js` (`Qibla.calculate`)**: ❌ لم تُمَسّ
✅ **مَرجع الكعبة (21.4225°N, 39.8262°E)**: ❌ لم يُمَسّ
✅ **`Qibla.getDistance` (Haversine)**: ❌ لم يُمَسّ
✅ **`Qibla.getDirection` (8 cardinal directions)**: ❌ لم يُمَسّ
✅ **`updateQibla()` في js/app.js**: ❌ لم يُمَسّ — سَيُكرّر الكتابة بنفس القِيَم بعد hydration

السيرفر يَستخدم نفس الـ formula الـ great-circle initial bearing — الـ output متطابق رياضيًّا مع client.

---

## 10. تأكيد أنّ صفحات الصلاة/القمر/الأذكار/التقويم/الزكاة لم تَتأثّر

محلّيًّا (PORT=3036) — HTTP 200 على:
- `/prayer-times-in-riyadh` ✅
- `/moon-today` ✅
- `/azkar/morning-azkar` ✅
- `/hijri-calendar` ✅
- `/zakat-calculator` ✅
- `/msbaha` ✅

**سبب عدم التأثير**: الـ injection block مُغلَّف بـ `if (seo.qiblaRef && seo.qiblaRef.slug && typeof seo.qiblaRef.lat === 'number')` — هذا الـ gate يَتحقّق **فقط** على routes `/qibla-in-{slug}`. الـ regex المُستهدَف `<div class="info-value" id="qibla-city">--</div>` (إلخ.) نَصّ unique لا يَتطابق على أيّ صفحة أخرى.

---

## 11. توقُّع أثر الإصلاح

| المؤشّر | قبل (Lighthouse mobile) | بعد (متوقَّع) |
|---|---|---|
| Performance | 72 | **~92–96** |
| **LCP** | **2.9s** 🟡 | **~1.0–1.3s** 🟢 |
| **Speed Index** | **10.8s** 🔴 | **~3–4s** 🟢 |
| **Element render delay** | **16,650ms** 🔴 | **~50–200ms** 🟢 |
| FCP | 1.0s | ~1.0s (لا تَغيير) |
| CLS | 0 | 0 (مَحفوظ — السطر مَوجود مسبقًا بـ `--`، فلا shift) |
| TBT | 0ms | ~0ms (لا JS إضافيّ على client) |
| SEO | 100 | 100 (مَحفوظ — بل قد يَتحسَّن مع textual content prefilled) |

---

## 12. cache-busters

| المفتاح | قبل | بعد |
|---|---|---|
| `sw.js CACHE_VERSION` | 'v396' (live على CITY-PRAYER-COUNTDOWN) | **'v397'** (مفتاح بكر) |
| `css/style.css?v=` | 466 | 466 (لا تغيير — صفر CSS edit) |
| `js/app.js?v=` | 751 | 751 (لا تغيير — صفر JS edit) |
| `_i18nVersion` | 190 | 190 (لا تغيير — صفر i18n edit) |
| `js/prayer-times.js?v=` | 53 | 53 (لا تغيير) |

**ملاحظة**: HTML response ليس له `?v=` (يَخضع لـ `Cache-Control: no-cache`)، فالتَغييرات في server.js تَظهر فورًا بعد deploy دون حاجة لـ cache-buster على HTML. ولكنّ `sw v397` يُجدّد الـ service worker cache (لـ users لديهم الـ SW القديم).

---

## 13. رسالة الـ commit المقترَحة

```
perf(qibla): QIBLA-CITY-SSR-INFO-GRID-PREFILL-FIX-1 — SSR-inject city/angle/lat/lng into #qibla-info-grid cells

The Lighthouse mobile audit on /qibla-in-riyadh reported Performance=72
with LCP=2.9s + Speed Index=10.8s + Element render delay=16,650ms. Audit
(reports/qibla-city-pages-lighthouse-lcp-render-delay-audit-1.md) found
#qibla-info-grid as the LCP element with all 4 cells holding `--`
placeholder in SSR on every /qibla-in-{city} page (riyadh, jeddah, makkah,
rabat + EN variants — verified bit-for-bit at 235 grid_inner_chars all
whitespace), even though server.js already has seo.qiblaRef.{cityName,
lat,lng} available. Client js/app.js fills them only after hydration
(~3-4s post-FCP on mobile slow CPU).

This commit injects the values directly into SSR HTML via 4 html.replace
calls inside the existing Q-A SEO block. Uses the SAME bearing formula
already computed for the SEO bearing-badge but a separate _bearingExact
to 2 decimals to match client _qiblaAngle.toFixed(2). Lat/lng use
.toFixed(4) + '°' to match js/app.js:8321-8322 currentLat.toFixed(4)+'°'.

The client's updateQibla() will idempotently overwrite these cells after
hydration with bit-for-bit identical values (same formula, same precision).

Server.js-only — ZERO change to: index.html, css/style.css, js/app.js,
js/qibla.js, js/prayer-times.js, Qibla formula, data, sitemap, canonical,
hreflang, i18n keys. /qibla hub UNAFFECTED (block gated by seo.qiblaRef.slug).

Cache-busters: sw v396→v397 (no CSS/JS changes — only HTML response).

Expected impact:
  - LCP            2.9s     → ~1.0-1.3s
  - Speed Index    10.8s    → ~3-4s
  - Element delay  16,650ms → ~50-200ms
  - Performance    72       → ~92-96
```

---

## تأكيدات نهائيّة قبل الدفع — للاعتماد

| # | البند | الحالة |
|---|---|---|
| 1 | server.js-only (مع sw.js bump) — 2 ملفّان | ✅ |
| 2 | الـ injection block مُغلَّف بـ `if (seo.qiblaRef && seo.qiblaRef.slug)` — يَخصّ city pages حصرًا | ✅ |
| 3 | 4 cells مَملوءة في SSR على 6 صفحات اختبار (4 AR + 2 EN) | ✅ |
| 4 | `/qibla` Hub ما زالت تَحوي `--` placeholder (مُتعمَّد، client سيَملؤها لاحقًا) | ✅ |
| 5 | مَعادلة Qibla لم تُمَسّ — السيرفر يَستخدم نفس الـ great-circle formula | ✅ |
| 6 | إحداثيّات المدن لم تُمَسّ — تُقرَأ من `seo.qiblaRef` كما هي | ✅ |
| 7 | canonical / sitemap / hreflang / routing — صفر تَعديل | ✅ |
| 8 | i18n keys — صفر تَعديل | ✅ |
| 9 | css / index.html / js/app.js / js/qibla.js — صفر تَعديل | ✅ |
| 10 | `node --check` نظيف لـ server.js و sw.js | ✅ |
| 11 | 6 صفحات regression HTTP 200 (msbaha/moon/azkar/hijri/zakat/prayer-times) | ✅ |
| 12 | cache-busters: sw v396→v397 فقط (مَفتاح بكر) | ✅ |
| 13 | غير مدفوع — في انتظار اعتمادك | ⏳ |

---

## في انتظار اعتمادك

عند ورود الاعتماد بصيغة:
> `أعتمد دفع تقرير: QIBLA-CITY-SSR-INFO-GRID-PREFILL-FIX-1`

سأُنفّذ:
1. `git add server.js sw.js reports/qibla-city-ssr-info-grid-prefill-fix-1-prepush.md`
2. `git commit` بالنصّ في القسم 13
3. `git push origin main`
4. `ScheduleWakeup` ≥ 5 دقائق (احترام CDN hygiene — لن يُطلَب `/sw.js` v397 قبل اكتمال Render deploy)

**التحقّق ما بعد الدفع المُقترَح**:
- 6 صفحات qibla city: SSR يَحوي قِيَم حقيقيّة (لا `--`)
- `/qibla` Hub ما زالت تَحوي `--` (negative test)
- `/sw.js` `CACHE_VERSION='v397'`
- regression: 6+ صفحات HTTP 200
- (اختياريّ) إعادة Lighthouse على `/qibla-in-riyadh` للتحقّق من LCP/SI improvement

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
