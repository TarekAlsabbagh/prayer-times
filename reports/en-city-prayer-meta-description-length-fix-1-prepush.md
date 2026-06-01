# تقرير ما قبل الدفع: EN-CITY-PRAYER-META-DESCRIPTION-LENGTH-FIX-1

**التاريخ**: 2026-06-01  
**الـ HEAD المنوي بناؤه عليه**: `58ac9c8` (CITY-PRAYER-NEXT-BANNER-CLS-FIX-1 المُغلَق)  
**النوع**: SEO-only — تَعديل نَصّ meta description لـ EN فقط

---

## 1. الملفّ / الدالّة المسؤولة

**الموقع**: `server.js:7698-7700` — كائن `_CITY_DESC_FORMS.en`  
**الدالّة المُستهلِكة**: `_pickCityDesc()` على السطر 7735-7740 — selector logic:
```javascript
if (len(f.long) >= 120 && len(f.long) <= 160) return f.long;
return f.withCountry;  // fallback
```

---

## 2. النصّ القديم والنصّ الجديد

### القديم (116 chars لـ Cairo)
```
Prayer times in ${c}${ctry ? ', ' + ctry : ''}: Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha, with Qibla direction and the Hijri date.
```

**Cairo example**: `Prayer times in Cairo, Egypt: Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha, with Qibla direction and the Hijri date.` ⇐ **116 chars** ❌ (تحت 120)

### الجديد (132 chars لـ Cairo)
```
Prayer times in ${c}${ctry ? ', ' + ctry : ''}: check today's Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha times, plus Qibla direction and Hijri date.
```

**Cairo example**: `Prayer times in Cairo, Egypt: check today's Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha times, plus Qibla direction and Hijri date.` ⇐ **132 chars** ✅ (في النطاق 120-160)

**الفرق التَركيبيّ**:
- إضافة `check today's` بدل `:` المباشر — يُضيف 14 char + يُضفي صياغة طبيعيّة
- استبدال `and Isha` بـ `and Isha times` — يُضيف 6 char (لكن أوضح: زمن، ليس مجرد قائمة)
- استبدال `, with Qibla direction and the Hijri date` بـ `, plus Qibla direction and Hijri date` — حذف `the` للاختصار
- النَتيجة الصافية: +16 chars → معظم المدن تَهبط في 130-150 chars

---

## 3. أمثلة أطوال قبل/بعد

| المدينة | قبل (chars) | بعد (chars) | في النطاق؟ |
|---|---|---|---|
| Cairo, Egypt | 116 ❌ | **132** | ✅ |
| Riyadh, Saudi Arabia | 124 (border) | **140** | ✅ |
| Jeddah, Saudi Arabia | 124 | **140** | ✅ |
| Mecca, Saudi Arabia | 123 | **139** | ✅ |
| New York, United States | 127 | **143** | ✅ |
| Kuala Lumpur, Malaysia | 126 | **142** | ✅ |
| Jakarta, Indonesia | 122 (border) | **138** | ✅ |

(الأطوال أعلاه decoded — الـ raw HTML يَحوي `&#39;` 5-char entity للـ apostrophe، فالـ raw counts أكبر بـ 4)

---

## 4. اختبار `/en/prayer-times-in-cairo`

```
Title (50 chars): "Prayer Times in Cairo Today | Daily Adhan Schedule"
Desc  (132 chars decoded): "Prayer times in Cairo, Egypt: check today's Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha times, plus Qibla direction and Hijri date."
```

✅ **Title**: 50 chars (مُحَفَّظ — لم يُمَسّ)  
✅ **Desc**: 132 chars decoded — **في النطاق 120-160** (كان 116 ❌)

---

## 5. اختبار 7 مدن إنجليزيّة (محلّيّ، PORT=3038)

نتائج Decoded (بعد HTML entity decoding):

| URL | Title len | Desc len (decoded) | في النطاق |
|---|---|---|---|
| `/en/prayer-times-in-cairo` | 50 | **132** | ✅ |
| `/en/prayer-times-in-riyadh` | 51 | **140** | ✅ |
| `/en/prayer-times-in-jeddah` | 51 | **140** | ✅ |
| `/en/prayer-times-in-makkah` (→Mecca) | 50 | **139** | ✅ |
| `/en/prayer-times-in-new-york` | 53 | **143** | ✅ |
| `/en/prayer-times-in-kuala-lumpur` | 57 | **142** | ✅ |
| `/en/prayer-times-in-jakarta` | 52 | **138** | ✅ |

**7/7 في النطاق 120-160** ✅

---

## 6. تأكيد أنّ Title لم يَتغيّر

✅ **Title بلا تَعديل** — الكتلة المُحَدَّثة `_CITY_DESC_FORMS.en` تَخصّ `description` حصرًا. الـ `_CITY_TITLE_FORMS.en` (السطور 7595-7660 تقريبًا) لم تُمَسّ.

عَيّنة Titles من اختبار 7 مدن (كلّها بين 50-57 chars، ضمن النطاق المثاليّ 50-65):
- `Prayer Times in Cairo Today | Daily Adhan Schedule` (50)
- `Prayer Times in Riyadh Today | Daily Adhan Schedule` (51)
- `Prayer Times in Kuala Lumpur Today | Daily Adhan Schedule` (57)

---

## 7. تأكيد أنّ الصفحات العربيّة لم تَتأثّر

**AR negative test** (محلّيّ):
- `/prayer-times-in-cairo` AR desc:  
  `تعرف على مواقيت الصلاة في القاهرة اليوم، شامل الفجر والشروق والظهر والعصر والمغرب والعشاء، مع اتجاه القبلة والتاريخ الهجري حسب التوقيت المحلي.`
- `/prayer-times-in-riyadh` AR desc:  
  `تعرف على مواقيت الصلاة في الرياض اليوم، شامل الفجر والشروق والظهر والعصر والمغرب والعشاء، مع اتجاه القبلة والتاريخ الهجري حسب التوقيت المحلي.`

✅ **متطابقة مع النصّ الأصليّ** (نَصّ `long` الـ AR لـ القاهرة + الرياض). الكتلة المُحَدَّثة EN فقط.

**8 لغات أخرى أيضًا غير مَتأثّرة**: fr / tr / ur / de / id / es / bn / ms — كلّها مُحَفَّظة كما هي (الـ Edit تَخصّ كتلة `en:` حصرًا).

---

## 8. تأكيد أنّ الحسابات لم تَتغيّر

✅ **صفر تَعديل في**:
- `js/prayer-times.js` (Fajr/Sunrise/Dhuhr/Asr/Maghrib/Isha calculations)
- `js/qibla.js`
- `js/app.js`
- city data (curated_places.json، إحداثيّات، أسماء)
- timezone / madhab / method / Fajr/Isha angles
- canonical / sitemap / hreflang / routing
- i18n keys (النصّ المُعَدَّل هو ServerSide meta description string — ليس i18n key)

---

## 9. cache-busters

| المفتاح | قبل | بعد |
|---|---|---|
| `sw.js CACHE_VERSION` | 'v398' (live على CLS-FIX-1) | **'v399'** (مَفتاح بكر — للتَوثيق فقط) |
| `css/style.css?v=` | 467 | 467 (لا تغيير — صفر CSS edit) |
| `js/app.js?v=` | 751 | 751 (لا تغيير) |
| `_i18nVersion` | 190 | 190 (لا تغيير) |
| `js/prayer-times.js?v=` | 53 | 53 (لا تغيير) |

**ملاحظة**: HTML response له `Cache-Control: no-cache` → النصّ الجديد للـ description يَصِل المستخدم فورًا بعد deploy. الـ sw bump هو للتَوثيق وتَتبُّع الـ deploy فقط.

---

## 10. رسالة الـ commit المقترَحة

```
seo(en-prayer-city): EN-CITY-PRAYER-META-DESCRIPTION-LENGTH-FIX-1 — expand withCountry desc to 120-160 char band

SEOptimer reported the EN meta description on /en/prayer-times-in-cairo
was 116 chars — under the standard 120-160 char SEO band. Root cause:
server.js _CITY_DESC_FORMS.en — the existing `long` form ("See today's
prayer times in {city}, including...") exceeds 160 chars for any city
name ≥ 5 chars, so _pickCityDesc falls through to `withCountry` (which
was only 116 chars for Cairo, Egypt).

This commit rewrites the EN `withCountry` form with natural connectors
("check today's", "plus") to land between 130 and 150 chars for typical
city+country combos. Cairo: 116 → 132. Riyadh: 124 → 140. New York:
127 → 143. All 7 tested cities land in 120-160 band.

EN-only change — other 9 langs (ar/fr/tr/ur/de/id/es/ms/bn) untouched.
Title, H1, prayer calculations, Qibla formula, city data, canonical,
sitemap, hreflang, routing, i18n keys ALL UNCHANGED.

Files modified: server.js (~15 lines: new wording + doc) + sw.js
(comment + version bump v398→v399 for deploy traceability — HTML
response is Cache-Control: no-cache so users see new desc immediately
without cache-buster).

Expected impact: SEOptimer EN meta-description check turns green for
/en/prayer-times-in-{city} pages. Title still in optimal 50-65 range.
```

---

## تأكيدات نهائيّة قبل الدفع — للاعتماد

| # | البند | الحالة |
|---|---|---|
| 1 | EN-only change — server.js `_CITY_DESC_FORMS.en.withCountry` فقط | ✅ |
| 2 | Cairo desc: 116 → 132 chars (في النطاق) | ✅ |
| 3 | 7 مدن EN sample كلّها في 120-160 band | ✅ |
| 4 | Title لم يَتغيّر (50-57 chars على 7 مدن) | ✅ |
| 5 | AR + 8 لغات أخرى غير مَتأثّرة (نَصّ مَطابق) | ✅ |
| 6 | حسابات الصلاة + Qibla + city data + canonical/sitemap/hreflang/i18n: صفر تَعديل | ✅ |
| 7 | `node --check server.js + sw.js` نظيف | ✅ |
| 8 | 7 صفحات regression HTTP 200 (msbaha/moon/qibla/hijri/zakat/azkar/home) | ✅ |
| 9 | cache-busters: sw v398→v399 فقط (HTML no-cache → users see immediately) | ✅ |
| 10 | غير مدفوع — في انتظار اعتمادك | ⏳ |

---

## في انتظار اعتمادك

عند ورود الاعتماد بصيغة:
> `أعتمد دفع تقرير: EN-CITY-PRAYER-META-DESCRIPTION-LENGTH-FIX-1`

سأُنفّذ:
1. `git add server.js sw.js reports/en-city-prayer-meta-description-length-fix-1-prepush.md`
2. `git commit` بالنصّ في القسم 10
3. `git push origin main`
4. `ScheduleWakeup` ≥ 5 دقائق

**فحوصات ما بعد الدفع المُقترَحة**:
- curl 7 مدن EN على production + تأكيد desc length 120-160
- AR negative test
- Title عدم التَغيير
- 7 regression URLs 200
- (اختياريّ) إعادة SEOptimer check على /en/prayer-times-in-cairo للتحقّق من تَحوُّل meta-description من ❌ إلى ✅

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
