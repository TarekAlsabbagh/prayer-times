# تقرير ما قبل الدفع: AR-QIBLA-CITY-SEO-DYNAMIC-TITLE-LENGTH-FIX-1

**التاريخ**: 2026-06-01  
**الـ HEAD المنوي بناؤه عليه**: `a5ce108` (CANONICAL-PROD-ORIGIN-FIX-1 المرفوع، في انتظار wakeup)  
**النوع**: AR-only SEO — تَفعيل tier MediumPlus لـ AR qibla city titles

---

## 1. السبب الجذريّ

**Production audit** على 9 صفحات `/qibla-in-*` (AR):

| المدينة | AR name | len | Title len | في [50,60]؟ |
|---|---|---|---|---|
| Cairo | القاهرة | 7 | **57** | ✅ |
| Riyadh | الرياض | 6 | **56** | ✅ |
| Jeddah | جدة | 3 | **53** | ✅ |
| **Makkah** | **مكة المكرمة** | **11** | **47** | **❌** |
| Rabat | الرباط | 6 | **56** | ✅ |
| Kuala Lumpur | كوالالمبور | 10 | **60** | ✅ |
| Los Angeles | لوس أنجلوس | 10 | **60** | ✅ |
| Washington | واشنطن | 6 | **56** | ✅ |
| Jakarta | جاكرتا | 6 | **56** | ✅ |

⇒ **Makkah هي الوحيدة خارج النطاق** (47 chars، تحت 50 floor).

**السبب التَقنيّ**:
- Full template AR: `اتجاه القبلة في {City} | بوصلة الكعبة وتحديد القبلة بدقة` → constant 50 + city
  - Makkah (11): 50+11 = **61** ⇒ overflow [50,60]
- Medium template AR: `اتجاه القبلة في {City} بدقة | بوصلة الكعبة` → constant 36 + city
  - Makkah: 36+11 = **47** ⇒ below 50
- Short template AR: `اتجاه القبلة في {City} | بوصلة الكعبة` → constant 31 + city
  - Makkah: 31+11 = **42** ⇒ below 50

**Ladder fallthrough**: Full > 60 → Medium < 50 → Short < 50 → الـ selector يَختار Medium (47) كـ fallback (rule 5: "if Short < 50 → use Medium").

**`_qTitlesMediumPlus.ar` كان مَعبَّأً بـ `_qTitlesMedium.ar` كـ alias** (منذ EN-QIBLA-CITY-SEO-DYNAMIC-LENGTH-FIX-1 commit `79e35d1`) — لم يُملأ بصيغة AR مُخصَّصة.

---

## 2. الملفّ / الدالّة المسؤولة

**الموقع**: `server.js:8815-8826` — كائن `_qTitlesMediumPlus`  
**Selector** (مَوجود مسبقًا): `server.js:8847-8859` — ladder يَحوي MediumPlus tier بَين Full و Medium

---

## 3. منطق اختيار العنوان حسب الطول

**الـ ladder الحاليّ (مَوجود مسبقًا منذ commit `79e35d1`)**:

```javascript
if (full ∈ [50,60]) → full
else if (mediumPlus ∈ [50,60]) → mediumPlus   ← AR slot was alias to Medium
else if (medium ∈ [50,60]) → medium
else if (full > 60 && medium > 60) → short
else if (short < 50) → medium
else → (full ≤ 60 ? full : short)
```

**هذا الفيكس**: فقط يَستبدل `_qTitlesMediumPlus.ar` من alias (`_qTitlesMedium.ar`) إلى صياغة AR مَخصَّصة. الـ selector logic مَحفوظ بالكامل.

---

## 4. قائمة القوالب العربيّة المُستخدَمة

| Tier | AR Template | Constant (بدون city) | Makkah len |
|---|---|---|---|
| **Full** (مَوجود) | `اتجاه القبلة في {City} \| بوصلة الكعبة وتحديد القبلة بدقة` | 50 | 61 ❌ |
| **MediumPlus** (NEW) ⭐ | `اتجاه القبلة في {City} اليوم \| بوصلة الكعبة بدقة` | **42** | **53** ✅ |
| **Medium** (مَوجود) | `اتجاه القبلة في {City} بدقة \| بوصلة الكعبة` | 36 | 47 ❌ |
| **Short** (مَوجود) | `اتجاه القبلة في {City} \| بوصلة الكعبة` | 31 | 42 ❌ |

**تَصميم MediumPlus AR**:
- ✅ صياغة طبيعيّة + سَلسة
- ✅ "اتجاه القبلة" مَرّة واحدة فقط (لا تَكرار)
- ✅ "اليوم" تُضيف SEO freshness signal
- ✅ "بدقة" تُؤكّد الجودة (موجودة في Full أيضًا — اتّساق)
- ✅ بَين Full (50+city) و Medium (36+city) في الطول → يَملأ الفجوة لـ cities ≥ 11 chars

---

## 5. جدول اختبار 9 صفحات AR قبل/بعد (محلّيّ، PORT=3043)

| URL | قبل (Title len) | بعد (Title len) | في [50,60]؟ | Tier picked |
|---|---|---|---|---|
| `/qibla-in-cairo` | 57 (Full) | **57** (Full — unchanged) | ✅ | Full |
| `/qibla-in-riyadh` | 56 (Full) | **56** (Full — unchanged) | ✅ | Full |
| `/qibla-in-jeddah` | 53 (Full) | **53** (Full — unchanged) | ✅ | Full |
| **`/qibla-in-makkah`** | **47 (Medium)** ❌ | **53 (MediumPlus)** | ✅ | **MediumPlus** ⭐ |
| `/qibla-in-rabat` | 56 (Full) | **56** | ✅ | Full |
| `/qibla-in-kuala-lumpur` | 60 (Full) | **60** | ✅ | Full |
| `/qibla-in-los-angeles` | 60 (Full) | **60** | ✅ | Full |
| `/qibla-in-washington` | 56 (Full) | **56** | ✅ | Full |
| `/qibla-in-jakarta` | 56 (Full) | **56** | ✅ | Full |

**Makkah Title**:
- ❌ قبل: `اتجاه القبلة في مكة المكرمة بدقة | بوصلة الكعبة` (47 chars)
- ✅ بعد: `اتجاه القبلة في مكة المكرمة اليوم | بوصلة الكعبة بدقة` (**53 chars**)

**Meta Description** (للمراقبة فقط — لم يُمَسّ):
- كلّ الـ 9 مدن: AR desc length ~125-133 chars ⇒ ضمن [120, 160] ✅
- Makkah AR desc: `اعرف اتجاه القبلة في مكة المكرمة بدقة باستخدام...` (133 chars) — لا تَغيير

---

## 6. تأكيد أنّ H1 لم يَتغيّر

✅ **صفر تَعديل في H1** — الـ `_qaH1` block في `server.js:19782+` (داخل Q-A SEO injection) لم يُمَسّ. AR H1 = `اتجاه القبلة في {City}` (مُستقلّ عن `<title>`).

---

## 7. تأكيد أنّ Meta Description لم يَتغيّر

✅ **صفر تَعديل في `_qDescs`** — الـ kept untouched. كلّ الـ 9 مدن AR Meta Description مُطابقة للأصل (نفس النصّ).

(الـ EN ladder من commit `79e35d1` يَخصّ EN فقط؛ كتلة `if (lang === 'en')` لا تَلمس AR.)

---

## 8. تأكيد أنّ الإنجليزيّ لم يتأثّر

محلّيًّا — EN titles لـ 3 cities تَختبَر:
- `/en/qibla-in-cairo`: Title=55 (Today variant) ✅ (مَطابق لـ post-79e35d1)
- `/en/qibla-in-riyadh`: Title=56 (Today variant) ✅
- `/en/qibla-in-makkah`: Title=55 (`...Mecca Today...`) ✅

⇒ EN qibla city titles **مَحفوظة بالكامل** — `_qTitlesMediumPlus.en` لم يُمَسّ.

---

## 9. تأكيد أنّ باقي اللغات لم تَتأثّر

محلّيًّا:
- `/fr/qibla-in-paris`: Title=56 (`Direction de la Qibla à Paris | Boussole Kaaba précise`) ✅ (مَطابق للأصل — Medium tier، لأنّ FR MediumPlus = Medium fallback)
- `/ur/qibla-in-karachi`: Title=90 (`کراچی میں سمتِ قبلہ | کعبہ کا قطب نما اور درست تعین`) ✅ (مَطابق للأصل — Full tier)

**8 لغات أخرى** (tr/ur/de/id/es/bn/ms) لها `_qTitlesMediumPlus[lang] = _qTitlesMedium[lang]` ⇒ ladder selector يَتجاوز MediumPlus لو وَجد Medium في النطاق ⇒ **صفر تَغيُّر سلوكيّ**.

---

## 10. تأكيد أنّ معادلة القبلة والبيانات لم تَتغيّر

✅ **صفر تَعديل في**:
- `js/qibla.js` (`Qibla.calculate`، `Qibla.getDistance`، `Qibla.getDirection`)
- Kaaba reference (21.4225, 39.8262)
- city data (إحداثيّات، أسماء)
- `_qiblaAngle`، `_distance`، `_bearingExact` server-side computations
- QIBLA-CITY-SSR-INFO-GRID-PREFILL-FIX-1 (`9cc340a`) — `#qibla-info-grid` SSR prefill مَحفوظ

---

## 11. تأكيد أنّ canonical/hreflang/sitemap/routing لم تَتغيّر

✅ **صفر تَعديل في**:
- canonical URL generation (CANONICAL-PROD-ORIGIN-FIX-1 = `a5ce108` سَليم)
- hreflang tags
- sitemap.xml + sitemap-main.xml structure
- `/qibla-in-{city}` routing regex matching
- `/qibla` Hub gating (`seo.qiblaRef.slug`)

---

## 12. تأكيد أنّ QIBLA SSR prefill ما زال يَعمل

✅ **محلّيًّا**: `/qibla-in-riyadh` يَحوي `#qibla-city='الرياض'` + `#qibla-exact-angle='243.80°'` (مَحفوظ منذ commit `9cc340a`).

---

## 13. cache-busters

| المفتاح | قبل | بعد |
|---|---|---|
| `sw.js CACHE_VERSION` | 'v401' (live على CANONICAL fix) | **'v402'** (مَفتاح بكر — للتَوثيق) |
| `css/style.css?v=` | 467 | 467 (لا تغيير) |
| `js/app.js?v=` | 751 | 751 (لا تغيير) |
| `_i18nVersion` | 190 | 190 (لا تغيير) |

**ملاحظة**: HTML response له `Cache-Control: no-cache` → النصّ الجديد للـ Makkah AR title يَصل المستخدم فورًا بعد deploy.

---

## 14. رسالة الـ commit المقترَحة

```
seo(ar-qibla-city): AR-QIBLA-CITY-SEO-DYNAMIC-TITLE-LENGTH-FIX-1 — activate AR MediumPlus tier

Audit of /qibla-in-* AR pages found 9/10 sampled cities had titles in
the [50, 60] SEO band — except /qibla-in-makkah which produced
"اتجاه القبلة في مكة المكرمة بدقة | بوصلة الكعبة" = 47 chars (below
50 floor). Root cause: the AR city name "مكة المكرمة" (11 chars)
makes Full template overflow 60 → fallback to Medium = 47 → outside
the band.

The selector ladder already had a MediumPlus tier added in commit
79e35d1 (EN-QIBLA-CITY-SEO-DYNAMIC-LENGTH-FIX-1) between Full and
Medium, but `_qTitlesMediumPlus.ar` was an alias for
`_qTitlesMedium.ar` — so the AR ladder effectively had no
between-tier and Makkah landed on the 47-char Medium.

This commit activates the AR slot with a natural Arabic-MediumPlus
template:
  "اتجاه القبلة في {City} اليوم | بوصلة الكعبة بدقة" (42+city chars)

For Makkah (11): 42+11 = 53 chars ✅ — picked by the ladder when
Full > 60. Single "اتجاه القبلة" occurrence (no keyword stuffing),
natural "اليوم" freshness signal, "بدقة" quality emphasis. For
shorter AR city names (Cairo القاهرة=7, Riyadh الرياض=6, etc.) the
existing Full tier still wins in [50, 60] — MediumPlus only fires
when Full > 60.

ZERO change to: H1, Meta Description, JSON-LD, Qibla calculation
(js/qibla.js), Kaaba reference, city data, canonical (a5ce108
preserved), hreflang, sitemap, routing, EN qibla city titles
(79e35d1 preserved), FR/TR/UR/DE/ID/ES/BN/MS qibla titles, /qibla
hub, AR Meta Description.

Tested 9 AR cities: Cairo(57)/Riyadh(56)/Jeddah(53)/MAKKAH(47→53✅)/
Rabat(56)/Kuala Lumpur(60)/Los Angeles(60)/Washington(56)/Jakarta(56)
— only Makkah switches tier; all others keep their current Full
selection.

Files: server.js (1-line value change + ~15 lines doc) + sw.js
(comment + version bump v401→v402). HTML is no-cache → users see
new Makkah AR title immediately after deploy.

Expected impact: SEOptimer Title check on /qibla-in-makkah (AR) turns
from ❌ to ✅ once cache refreshes.
```

---

## تأكيدات نهائيّة قبل الدفع — للاعتماد

| # | البند | الحالة |
|---|---|---|
| 1 | AR-only change — `_qTitlesMediumPlus.ar` فقط | ✅ |
| 2 | Makkah AR Title: 47 → 53 chars (في النطاق) | ✅ |
| 3 | 9/9 AR qibla cities في [50, 60] | ✅ |
| 4 | EN/FR/UR + 8 لغات أخرى غير مَتأثّرة (نَصّ مَطابق) | ✅ |
| 5 | `/qibla` Hub غير مَتأثّر | ✅ |
| 6 | H1 + Meta Description + JSON-LD + canonical/hreflang/sitemap + Qibla formula + city data: صفر تَعديل | ✅ |
| 7 | `node --check server.js + sw.js` نظيف | ✅ |
| 8 | QIBLA SSR prefill (`9cc340a`) ما زال يَعمل | ✅ |
| 9 | 7 صفحات regression HTTP 200 | ✅ |
| 10 | cache-busters: sw v401→v402 فقط (HTML no-cache → users see immediately) | ✅ |
| 11 | غير مدفوع — في انتظار اعتمادك | ⏳ |

---

## في انتظار اعتمادك

عند ورود الاعتماد بصيغة:
> `أعتمد دفع تقرير: AR-QIBLA-CITY-SEO-DYNAMIC-TITLE-LENGTH-FIX-1`

سأُنفّذ:
1. `git add server.js sw.js reports/ar-qibla-city-seo-dynamic-title-length-fix-1-prepush.md`
2. `git commit` بالنصّ في القسم 14
3. `git push origin main`
4. `ScheduleWakeup` ≥ 5 دقائق

### ⚠️ تذكير
- `a5ce108` (CANONICAL-PROD-ORIGIN-FIX-1) ما زال في انتظار wakeup verification في 16:04
- يُمكن انتظار تقرير ما بعد دفع CANONICAL أوّلًا، أو اعتماد هذا الدفع مستقلًّا (لا تَداخل)

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
