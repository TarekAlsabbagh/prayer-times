# تقرير ما قبل الدفع: MOON-CITY-SELECTION-PERSISTED-PLACE-FIX-1

**النوع:** إصلاح — حفظ سياق المدينة المختارة كاملاً قبل التوجيه، فلا تظهر دولة خاطئة على صفحة القمر ولا تعود المدينة لمكّة عند الانتقال.
**الملفّ:** `js/app.js` فقط (+ cache-buster). **لا تغيير server.js/CSS/بيانات/حساب.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.

---

## 1) السبب الجذريّ المختصر
معالج نقر نتيجة البحث الموحَّد `_stOnPick` (`js/app.js`) كان: `POST /api/place-selected` ثمّ `window.location.href = _stRouteFor(...)` مباشرةً — **بلا كتابة بذرة مدينة في `sessionStorage`**. صفحة `/moon-today-in-{slug}` تحلّ سياقها عبر مفتاح مشترك `'moon'`+`last_city_context` (لا `__PRAYER_CITY__`)، فتأخذ الدولة/الغلوبالات من السياق القديم (مكّة/السعودية) بينما الاسم من الـURL ⇒ «ماكاو/السعودية»؛ وبلا حفظ ⇒ سقوط لمكّة عند الانتقال.

## 2) ما كان ناقصًا في التخزين
لم يُكتب أيّ من: `city_{slug}`، `city_moon` (للقمر) / `city_qibla` (للقبلة)، `last_city_context`.

## 3) ما تمّ حفظه بعد الإصلاح
في `_stOnPick`، **قبل** التوجيه، تُكتب من نتيجة الاختيار `r` (المصدر الموثوق):
- `city_{slug}` (لكلّ الأهداف)
- `city_moon` عند `targetRoute='moon-hub'` / `city_qibla` عند `'qibla-hub'`
- `last_city_context` (لكلّ الأهداف)

## 4) schema قبل/بعد
**قبل:** لا شيء (client). **بعد:** كائن مكان كامل موحَّد مع باقي الموقع:
```json
{"lat","lng","name","country","englishName","countryCode","timezone","_v":2}   // city_{slug}/city_moon/city_qibla
{"lat","lng","name","country","englishName","countryCode","timezone","ts"}      // last_city_context
```
(المصادر: `name=r.displayName`, `country=r.countryName`, `englishName=r.secondaryName||r.names.en`, `countryCode=r.countryCode`, `lat/lng/timezone=r.*`.)

## 5) نتيجة اختيار Macau (AR)
بذرة دافئة قديمة (مكّة/السعودية) ⇒ اختيار «macau» على `/moon-today` ⇒ تُكتب فورًا `city_macau`+`city_moon`+`last_city_context` = **ماكاو/ماكاو/mo** (تستبدل القديم). الوجهة `/moon-today-in-macau`: `currentCity=currentCountry=«ماكاو»`, cc=mo, lat=22.20، DOM country=«ماكاو»، **«السعودية» غير ظاهرة**. ✅ (الدولة الخاطئة اختفت.)

## 6) نتيجة الانتقال بعد اختيار Macau
بعد ماكاو ⇒ `/date-converter`: `currentCity=currentCountry=«ماكاو»`, snb/cityName=«ماكاو»، **stayedMacau=true، resetToMecca=false**. ✅ (لا عودة لمكّة.)

## 7) نتائج Riyadh / Dubai / Istanbul / Macau (سياق صحيح محفوظ، إحداثيات صحيحة)
| المدينة (مسار) | name | country | cc | lat/lng | بذور |
|---|---|---|---|---|---|
| Macau (moon, ar) | ماكاو | ماكاو | mo | 22.20056/113.54611 | city_macau+city_moon+ctx ✅ |
| Riyadh (moon, en) | Riyadh | Saudi Arabia | sa | 24.7136/46.6753 | city_riyadh+city_moon+ctx ✅ |
| Dubai (qibla, ar) | دبي | الإمارات | ae | 25.2048/55.2708 | city_dubai+**city_qibla**+ctx (city_moon=null) ✅ |
| Istanbul (prayer, ar) | إسطنبول | تركيا | tr | 41.0082/28.9784 | city_istanbul+ctx (city_moon=city_qibla=null) ✅ |

## 8) نتائج AR/EN/BN/UR
- **AR**: ماكاو ⇒ ماكاو/ماكاو (الجزآن مُصلَحان). 
- **EN**: `/en/moon-today` riyadh ⇒ `/en/moon-today-in-riyadh` يعرض «Riyadh»/«Saudi Arabia»؛ `/en/date-converter` يبقى «Riyadh» (stayed, no Mecca). ✅
- البذرة تحفظ `name` بلغة الصفحة + `englishName` (المقبض المستقرّ)، فعند التنقّل عبر لغة مختلفة تُعيد دوال العرض الحلّ من `currentEnglishName` (إصلاح GLOBAL-CURRENT-CITY السابق) ⇒ **لا تسرّب أسماء بين اللغات**. (BN/UR يتبعان نفس المنطق.)

## 9) هل القبلة متأثّرة؟
**نعم، كانت متأثّرة — وأُصلِحت بنفس التعديل.** القبلة تستخدم نفس `_stOnPick` (`targetRoute='qibla-hub'`). الآن تُكتب `city_qibla`+`city_{slug}`+`last_city_context` (و`city_moon=null`). مؤكَّد تجريبيًّا (Dubai).

## 10) تأكيد عدم تغيير بيانات المدن
✅ `db/places/*` بلا تغيير. البذور تُبنى من نتيجة البحث `r` في الذاكرة، لا من تعديل بيانات.

## 11) تأكيد عدم تغيير حسابات القمر
✅ منطق حساب القمر/الطور/الإضاءة بلا تغيير. الإحداثيات الصحيحة (من الـURL/`__PRAYER_CITY__`) تُستخدم للحساب كما كان؛ الإصلاح يصحّح **سياق المدينة/الدولة المخزَّن** فقط.

## 12) تأكيد عدم تغيير SEO
✅ server.js/Title/Meta/canonical/hreflang/sitemap بلا تغيير (تعديل client فقط). slugs/معرّفات إنجليزيّة ثابتة.

## 13) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `js/app.js` | +40 سطرًا: كتابة بذور المدينة الكاملة في `_stOnPick` قبل `window.location.href` (city_{slug} + city_moon/city_qibla حسب الهدف + last_city_context). |
| `index.html` | cache-buster `app.js?v=765 → ?v=766`. |

## 14) نتائج regression
- `node --check js/app.js` ✅ · 0 أخطاء console ✅
- مواقيت الصلاة (homepage→/prayer-times-in-istanbul): يحفظ `city_istanbul`+`last_city_context`، **لا** `city_moon`/`city_qibla` ✅ (لا انحدار)
- القمر/القبلة: يحفظان الهدف الصحيح ✅
- الإحداثيات صحيحة لكلّ المدن ✅ · لا تسرّب أسماء بين اللغات ✅

## 15) رسالة commit المقترحة
```
fix(moon): MOON-CITY-SELECTION-PERSISTED-PLACE-FIX-1 — persist selected moon city context before routing

The unified search-pick handler (_stOnPick) navigated via window.location.href
without writing any sessionStorage seed, so the /moon-today-in-{slug} page
(which resolves via the shared 'moon' key + last_city_context, not __PRAYER_CITY__)
showed the country from a stale context (e.g. "ماكاو" with "السعودية") and reset
to Mecca on the next navigation. Now _stOnPick writes the full place object
(city_{slug} + city_moon/city_qibla per target + last_city_context) from the
picked result BEFORE routing — mirroring navigateToMoonToday. Fixes both the
wrong country and the Mecca reset; qibla covered too. No data/calc/SEO changes.
app.js cache-buster 765->766.
```

---

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: MOON-CITY-SELECTION-PERSISTED-PLACE-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
