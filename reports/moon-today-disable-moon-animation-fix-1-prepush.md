# تقرير ما قبل الدفع: MOON-TODAY-DISABLE-MOON-ANIMATION-FIX-1

**النوع:** إصلاح بصري — تجميد أيّ حركة على شكل القمر وعناصر إضاءته في صفحة `/moon-today` (الـhub + صفحة المدينة)، جوّال + ديسكتوب + تابلت، لكلّ اللغات.
**الملفّات:** `css/style.css` (كتلة CSS مُنطاقة) + `index.html` (cache-buster) + `sw.js` (CACHE_VERSION). **لا server.js، لا بيانات، لا app.js، لا تغيير محتوى/حساب/SEO.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.

---

## 1) النتيجة الجذريّة من التدقيق
شكل القمر نفسه **كان ساكنًا أصلاً**: قرص `.moon-visual` وكامل شجرته SVG (الدائرة المعتمة + المسار المضيء + التدرّجات الشعاعيّة + الحدّ) كلّها `animation:none, transition:none, transform:none` — بفضل كتلة `MOON-DISC-ANIMATION-DISABLE-1` القائمة. الحركتان المستمرّتان الوحيدتان المتبقّيتان في منطقة عرض القمر كانتا:
- **هالة مخطّط الإضاءة** `circle.moon-chart-halo` ← `moonChartHaloPulse` (نبض r:14→18، opacity:0.25→0.10، كلّ 2.4s) على نقطة «اليوم» في مخطّط «إضاءة القمر — 7 أيّام».
- **سهم دلتا الإضاءة** `.mc-delta-arrow` (الرمز «↓/↑») ← `mc-bounce*` (ارتداد كلّ 1.6s) في بطاقة «تغيّر إضاءة القمر من الأمس إلى اليوم».

## 2) قرار النطاق (قابل للتعديل قبل الدفع)
- ✅ **جُمِّد:** قرص القمر + SVG (إعادة تأكيد مُنطاقة)، **هالة النبض**، **سهم الدلتا**. هاتان الحركتان تقعان ضمن قائمتك الصريحة (`pulse` / `illumination-motion` / `transform` / `continuous`).
- ◻︎ **تُرِك عمدًا (ليس «شكل القمر» — مجرّد كروم/توقّعات):** نبض زرّ الـCTA (`moonHubCtaPulse`)، نقطة التنقّل (`snb-dot`)، إبراز بطاقة الطور القادم (`mu-next-pulse`)، ومؤثّرات الظهور لمرّة واحدة (`mc-fade-in`، `cd-row-fadein`).
> لو رغبت بنطاق أضيق (القرص فقط) أو أوسع (تجميد الـCTA/البطاقات أيضًا)، أخبرني وأعدّله قبل الدفع.

## 3) الإصلاح (CSS مُنطاق)
كتلة جديدة في `css/style.css` بعد `MOON-DISC-ANIMATION-DISABLE-1`، **مُنطاقة بـ`html.moon-today-hub-page` و`html.moon-today-city-page` فقط** (لا تمسّ أيّ صفحة أخرى)، تُطبّق `animation:none !important; transition:none !important;` على: `.moon-visual`/`.moon-svg` (+ ذرّيّاتهما)، `circle.moon-chart-halo`، `.mc-delta-arrow`.

## 4) سلامة حالة التجميد (لا كسر بصريّ)
- **الهالة:** بإلغاء الأنيميشن تعود لقيم سماتها الأساسيّة `r=14`, `opacity=0.22`, `fill=#f9d648` ⇒ **توهّج ذهبيّ ساكن خفيف** (لا دائرة معتمة، لا اختفاء). مؤكَّد حيًّا: `r=14px, opacity=0.22`.
- **السهم:** يعود لموضع السكون (الارتداد كان من keyframes فقط) ⇒ «↓» ساكن، مرئيّ. 
- القرص بلا تغيير (كان ساكنًا).

## 5) نتيجة صفحة المدينة (ديسكتوب، AR — `/moon-today-in-makkah`)
الـCSS المخدوم = `style.css?v=476`. `circle.moon-chart-halo`=**none**، `.mc-delta-arrow`=**none**، `.moon-visual`=**none**، `.moon-svg`=**none**. مسح الصفحة كاملةً ⇒ **0 حركة متبقّية على شكل القمر/إضاءته**. لقطة: المخطّط والقرص سليمان، الهالة توهّج ساكن.

## 6) عبر اللغات (lang-agnostic — النطاق بالكلاس لا باللغة)
| الصفحة | html class | halo | arrow | disc | svg |
|---|---|---|---|---|---|
| `/moon-today` (AR hub) | moon-today-hub-page | (غائبة) | — | none | none |
| `/moon-today-in-makkah` (AR) | moon-today-city-page | none | none | none | none |
| `/en/moon-today-in-makkah` (EN) | moon-today-city-page | none | none | none | none |
| `/bn/moon-today-in-dhaka` (BN) | moon-today-city-page | none | none | none | none |

## 7) الجوّال (375×812، `/moon-today-in-makkah`)
halo/arrow/disc/svg = **none** (مجمَّدة)، **لا overflow أفقيّ**، حجم القرص = **130×130** (قاعدة الموبايل محفوظة — لم يتغيّر الحجم). لقطة: القرص متمركز ساكن، التخطيط نظيف.

## 8) خلوّ الكونسول
`level=error` عبر كلّ التنقّلات (AR/EN/BN، ديسكتوب + جوّال، وصفحات الانحدار) = **No console logs**.

## 9) تأكيد عدم تغيير ما يجب ألّا يتغيّر
✅ بلا مساس: حجم القمر / لونه / ظلّه / نسبة الإضاءة (70.44%) / الطور / النصّ تحت القمر / الحسابات الفلكيّة / Title / Meta / H1 / canonical / hreflang / sitemap / JSON-LD / صفحات الأذكار. التعديل CSS بصريّ بحت (إيقاف حركة فقط).

## 10) الانحدار (النطاق محصور — صفحات أخرى غير متأثّرة)
المحدِّدات تطابق كلاسّي moon-today فقط؛ تحقّقت أنّ الصفحات الأخرى **لا تحمل** هذا الكلاس وتُرسَم سليمة:
| الصفحة | html class | moon-scope؟ | الصفحة النشطة |
|---|---|---|---|
| `/date-converter` | date-converter-page | لا | page-date-converter ✅ |
| `/azkar` | (فارغ) | لا | page-azkar-hub ✅ |
| `/hijri-calendar` | (فارغ) | لا | page-hijri-year ✅ |
| `/zakat-calculator` | zakat-calculator-page | لا | page-zakat ✅ |

(كون كلّ صفحات القمر والانحدار تُرسَم يثبت أنّ ورقة الأنماط تُحلَّل دون خطأ نحويّ.)

## 11) الملفّات + cache-busters + رسالة commit
| الملفّ | التغيير |
|---|---|
| `css/style.css` | +30 سطرًا: كتلة `MOON-TODAY-DISABLE-MOON-ANIMATION-FIX-1` المُنطاقة (هالة + سهم + إعادة تأكيد القرص). |
| `index.html` | `css/style.css?v=475 → ?v=476` (سطران: preload + stylesheet). |
| `sw.js` | `CACHE_VERSION 'v434' → 'v435'`. |

`git diff --stat`: 3 ملفّات، +33/−3. `node`-تحقّق LF نظيف. `HEAD=5de7c45`.

رسالة commit المقترحة:
```
fix(moon): MOON-TODAY-DISABLE-MOON-ANIMATION-FIX-1 — freeze moon-shape motion on /moon-today

The moon disc (.moon-visual subtree) was already static via
MOON-DISC-ANIMATION-DISABLE-1. This freezes the only two remaining continuous
motions in the /moon-today moon visualization: the illumination-chart "today"
halo pulse (moonChartHaloPulse) and the yesterday→today illumination-change
delta-arrow bounce (mc-bounce*). Scoped to html.moon-today-hub-page /
html.moon-today-city-page so no other page is touched. animation:none reverts
each element to its static rest state (halo → base r=14 / opacity 0.22 soft glow;
arrow → rest position) WITHOUT changing moon size/color/shadow, illumination %,
phase, under-moon text, or any calculation. CTA pulse, nav dot, upcoming-phase
card highlight and one-shot fade-ins (page chrome) left intact. Verified frozen
on AR/EN/BN, desktop + 375px mobile, no overflow, no console errors; regression
clean on date-converter/azkar/hijri-calendar/zakat-calculator.
css/style.css?v=475->476, sw CACHE_VERSION v434->v435.
```

---

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: MOON-TODAY-DISABLE-MOON-ANIMATION-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
