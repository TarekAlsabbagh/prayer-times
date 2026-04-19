# 🌙 Moon Page — Content & SEO Spec

> **حالة**: مسوّدة للمراجعة (قبل البرمجة). بعد موافقتك، أُطبّقها في الكود.
> **لغات هذه الوثيقة**: العربيّة + الإنجليزيّة (الأساسيّتان). اللغات الـ8 الأخرى تُشتقّ لاحقاً بنفس نمط موقعك.
> **المرجع التنافسيّ**: `timesprayer.com/moon/` (أخذنا نقاط قوّتهم + أصلحنا ضعفهم + أضفنا ما يميّزنا).

---

## 🎯 1. استراتيجيّة مقارنة — كيف نتفوّق على timesprayer.com/moon/

| العنصر | timesprayer.com | موقعنا (المخطَّط) |
|---|---|---|
| `<title>` و `<meta description>` | ❌ مفقودان | ✅ ديناميكيّان لكلّ مدينة ولغة |
| Schema.org (JSON-LD) | ❌ لا يوجد | ✅ WebApplication + FAQPage + BreadcrumbList + AstronomicalBody |
| قسم FAQ | ❌ لا يوجد | ✅ 12-15 سؤال شائع + FAQPage schema (ينتج featured snippets في Google) |
| تكرار H2 `القمر اليوم` | ❌ مكرَّر | ✅ هيكل H1/H2/H3 دلاليّ نظيف |
| عدد اللغات | 2 (AR/EN) | **10 لغات** مدعومة |
| صفحات خاصّة بالمدن | جزئيّاً | ✅ 200-500 صفحة مخصَّصة، مُفهرَسة في sitemap |
| المحتوى التعليميّ | ⚠️ ضعيف | ✅ 800+ كلمة evergreen (أطوار + تفسير علميّ + معنى إسلاميّ) |
| البعد الإسلاميّ | ❌ مفقود | ✅ رؤية الهلال، الشهر الهجريّ القادم، رمضان، العيد، الحجّ |
| Alt text للصور | ❌ مفقود | ✅ كامل للـ accessibility |
| Open Graph + Twitter Cards | ❌ مفقود | ✅ كامل |
| Canonical URL | ❌ مفقود | ✅ لكلّ صفحة |
| روابط داخليّة | ✅ جيّدة | ✅ أفضل (breadcrumbs + "القمر في مدن أخرى") |

**الخلاصة**: نبني كلّ ما يملكونه + 8 مزايا لا يملكونها = Google يفهمنا أفضل ويرتّبنا أعلى.

---

## 🔗 2. هيكل المسارات (URL Structure)

### المسار التلقائيّ (موقع المستخدم / Mecca افتراضياً)
```
/moon-today                 (AR الأساسيّة)
/en/moon-today
/fr/moon-today
/tr/moon-today
/ur/moon-today
/de/moon-today
/id/moon-today
/es/moon-today
/bn/moon-today
/ms/moon-today
```

### المسار المدنيّ (مدينة محدَّدة)
```
/moon-today-in-{city-slug}              (AR)
/en/moon-today-in-{city-slug}
/fr/moon-today-in-{city-slug}
... (10 لغات)
```

**أمثلة**:
- `/moon-today-in-mecca`
- `/moon-today-in-medina`
- `/en/moon-today-in-london`
- `/ar/moon-today-in-riyadh`
- `/fr/moon-today-in-paris`
- `/tr/moon-today-in-istanbul`
- `/id/moon-today-in-jakarta`

### Redirects (SEO-preservation)
- `/moon` → **301** → `/moon-today` ✅ (مُنجَز)
- `/moon-today-in-xyz-fake-slug` → **404** (اخترتَ هذا لمنع spam redirects)

---

## 🏷️ 3. Meta Tags (Title + Description)

### `/moon-today` (الصفحة الرئيسيّة — مكّة افتراضياً)

**AR**:
- `<title>`: `القمر اليوم - {الطور} | إضاءة {N}٪ - طور القمر الليلة`
  - مثال: `القمر اليوم - هلال متزايد | إضاءة 4٪ - طور القمر الليلة`
  - الطول: ~55-65 حرف ✅
- `<meta description>`: `طور القمر اليوم ({الطور})، نسبة الإضاءة {N}٪، عمر القمر {D} يوم. موعد مطلع القمر ومغيبه اليوم، البدر القادم، رؤية هلال الشهر الهجريّ.`

**EN**:
- `<title>`: `Moon Today - {Phase} | {N}% Illuminated - Moon Phase Tonight`
  - مثال: `Moon Today - Waxing Crescent | 4% Illuminated - Moon Phase Tonight`
  - الطول: ~60-65 حرف ✅
- `<meta description>`: `Today's moon phase ({Phase}), illumination {N}%, age {D} days. Moonrise and moonset times today, next full moon, crescent visibility for the Hijri month.`

### `/moon-today-in-{city}` (مدينة محدَّدة)

**AR** (مثال: Riyadh):
- `<title>`: `القمر في الرياض الآن - {الطور}، مطلع القمر {HH:MM}`
- `<meta description>`: `طور القمر في الرياض اليوم ({الطور}، إضاءة {N}٪)، موعد مطلع القمر {HH:MM} ومغيبه {HH:MM}. البدر القادم، رؤية هلال {الشهر الهجريّ القادم}.`

**EN** (مثال: London):
- `<title>`: `Moon in London Tonight - {Phase}, Moonrise at {HH:MM}`
- `<meta description>`: `Moon phase in London tonight ({Phase}, {N}% illuminated), moonrise at {HH:MM}, moonset at {HH:MM}. Next full moon on {date}. Hilal visibility for {next Hijri month}.`

---

## 📐 4. هيكل العناوين (H1 / H2 / H3)

```
<h1>Moon Today in {City} - {Phase Name}                    [AR: القمر اليوم في {المدينة} - {الطور}]

<h2>Current Moon Phase & Illumination                      [الطور الحاليّ ونسبة الإضاءة]
  <h3>Phase: {Phase Name}                                  [الطور: {اسم الطور}]
  <h3>Illumination: {N}%                                   [نسبة الإضاءة: {N}٪]
  <h3>Moon Age: {D} days                                   [عمر القمر: {D} يوم]

<h2>Moonrise & Moonset Times in {City} Tonight             [مطلع ومغيب القمر في {المدينة}]
  <h3>Moonrise: {HH:MM} {AM/PM}                            [مطلع القمر: {HH:MM}]
  <h3>Moonset: {HH:MM} {AM/PM}                             [مغيب القمر: {HH:MM}]
  <h3>Moon Altitude at Sunset: {N}°                        [ارتفاع القمر عند غروب الشمس: {N}°]
  <h3>Moon Visibility Duration: {H}h {M}m                  [مدّة ظهور القمر: {H} ساعة {M} دقيقة]

<h2>Next Moon Events                                       [الأحداث القادمة للقمر]
  <h3>Next Full Moon: {date}                               [البدر القادم: {التاريخ}]
  <h3>Next New Moon: {date}                                [المحاق القادم: {التاريخ}]
  <h3>First Quarter: {date}                                [التربيع الأوّل: {التاريخ}]
  <h3>Last Quarter: {date}                                 [التربيع الأخير: {التاريخ}]

<h2>Hilal Visibility for Next Hijri Month ⭐               [رؤية هلال الشهر الهجريّ القادم]
  <h3>Expected first day of {Next Hijri Month}             [اليوم الأوّل المتوقَّع لـ {الشهر القادم}]
  <h3>Hilal age at sunset: {H}h {M}m                       [عمر الهلال عند غروب الشمس: {H} ساعة {M} دقيقة]
  <h3>Visibility criterion: {Visible / Difficult / Invisible} [معيار الرؤية: {واضح / صعب / غير ممكن}]

<h2>7-Day Moon Forecast                                    [توقّعات القمر للأيّام السبعة القادمة]
  (جدول يعرض: اليوم | الطور | الإضاءة٪ | مطلع القمر | مغيب القمر)

<h2>Moon Calendar — {Current Hijri Month} {Year}           [التقويم القمريّ — {الشهر الهجريّ} {السنة}]
  (شبكة 30 يوم تعرض الطور والإضاءة)

<h2>Moon Today in Other Cities                             [القمر اليوم في مدن أخرى]
  (internal linking — 12-20 مدينة كبرى)

<h2>Frequently Asked Questions                             [الأسئلة الشائعة]
  (12-15 سؤال — انظر القسم التالي)

<h2>Understanding Moon Phases                              [فهم أطوار القمر] (evergreen content)
  <h3>The 8 Phases of the Lunar Cycle
  <h3>How Moon Illumination is Calculated
  <h3>Why Moonrise Differs by City
  <h3>Islamic Significance of the Lunar Cycle
```

---

## ❓ 5. قسم FAQ (موسَّع — 14 سؤال)

> سيُضاف لكلّ سؤال `FAQPage` schema. هذا يُتيح لـ Google عرض الأسئلة والأجوبة مباشرةً في نتائج البحث (featured snippets).

### FAQ بالعربيّة

**Q1**: **ما هو طور القمر الليلة؟**
A: طور القمر الليلة هو "{الطور}" بنسبة إضاءة {N}٪. يمكن رؤية القمر في {المدينة} من الساعة {HH:MM} إلى {HH:MM}.

**Q2**: **متى البدر القادم؟**
A: البدر القادم سيكون بتاريخ {التاريخ الميلاديّ} الموافق {التاريخ الهجريّ}. سيظهر القمر بنسبة إضاءة 100٪ في تلك الليلة.

**Q3**: **في أيّ ساعة يطلع القمر الليلة في {المدينة}؟**
A: يطلع القمر الليلة في {المدينة} عند الساعة {HH:MM} بالتوقيت المحلّيّ، ويغيب عند الساعة {HH:MM}.

**Q4**: **كيف تُحسب نسبة إضاءة القمر؟**
A: نسبة إضاءة القمر هي الجزء المرئيّ من سطحه المضاء بالشمس كما يُرى من الأرض. تتراوح من 0٪ (محاق) إلى 100٪ (بدر). نحسبها من الزاوية بين الشمس والقمر والأرض.

**Q5**: **ما الفرق بين المحاق والهلال؟**
A: المحاق هو اللحظة التي يكون فيها القمر بين الأرض والشمس (إضاءة 0٪ وغير مرئيّ). الهلال يظهر بعد المحاق بيوم أو يومين، وهو أوّل ظهور للقمر في السماء بشكل قوس دقيق.

**Q6**: **متى يبدأ الشهر الهجريّ القادم؟**
A: الشهر الهجريّ القادم هو {اسم الشهر}. متوقَّع أن يبدأ يوم {التاريخ الميلاديّ} بناءً على رؤية الهلال. قد يختلف بيوم حسب رؤية الهلال المحلّيّة.

**Q7**: **متى رمضان القادم؟**
A: شهر رمضان القادم يبدأ (متوقَّعاً) في {التاريخ الميلاديّ}. التاريخ النهائيّ يعتمد على رؤية هلال رمضان في اليوم الـ29 من شعبان.

**Q8**: **متى عيد الفطر القادم؟**
A: عيد الفطر القادم متوقَّع في {التاريخ الميلاديّ}. يبدأ العيد عند رؤية هلال شوّال في اليوم الـ29 من رمضان.

**Q9**: **متى عيد الأضحى القادم؟**
A: عيد الأضحى القادم متوقَّع في {التاريخ الميلاديّ}. يقع في العاشر من ذي الحجّة، بعد رؤية هلال ذي الحجّة.

**Q10**: **كيف أرى الهلال بالعين المجرّدة؟**
A: يُرى الهلال بعد غروب الشمس في الأفق الغربيّ، عند عمر قمر لا يقلّ عن 15 ساعة تقريباً، مع ارتفاع كافٍ عن الأفق وابتعاد زاويّ عن الشمس. يحتاج أفقاً غربيّاً صافياً بلا غيوم.

**Q11**: **ما هي أطوار القمر الثمانية؟**
A: أطوار القمر: (1) المحاق، (2) الهلال المتزايد، (3) التربيع الأوّل، (4) الأحدب المتزايد، (5) البدر، (6) الأحدب المتناقص، (7) التربيع الأخير، (8) الهلال المتناقص. تتكرّر كلّ 29.5 يوم.

**Q12**: **لماذا تختلف مواعيد مطلع القمر من مدينة لأخرى؟**
A: مطلع القمر يعتمد على خطّ الطول الجغرافيّ للمدينة. الفرق قد يصل إلى 12 ساعة بين شرق العالم وغربه. كما أنّ خطّ العرض يؤثّر قليلاً على الاتّجاه الذي يطلع منه.

**Q13**: **ما هي ليلة القدر؟**
A: ليلة القدر ليلة مباركة في العشر الأواخر من رمضان، يُرجَّح أنّها ليلة 27 رمضان لكنّها قد تكون في أيّ من الليالي الوتريّة (21، 23، 25، 27، 29). يُستحبّ فيها القيام والدعاء.

**Q14**: **هل يمكن رؤية القمر في النهار؟**
A: نعم، يمكن رؤية القمر أحياناً في النهار، خاصّة خلال أطوار التربيع الأوّل والتربيع الأخير والأحدب. في طور البدر يرتفع القمر عند غروب الشمس ويغيب مع شروقها، لذا يُرى ليلاً فقط.

---

### FAQ in English

**Q1**: **What moon phase is tonight?**
A: Tonight's moon is in the "{Phase}" phase at {N}% illumination. The moon will be visible in {City} from {HH:MM} to {HH:MM}.

**Q2**: **When is the next full moon?**
A: The next full moon occurs on {Gregorian date} ({Hijri date}). The moon will be 100% illuminated that night.

**Q3**: **What time does the moon rise tonight in {City}?**
A: The moon rises tonight in {City} at {HH:MM} local time and sets at {HH:MM}.

**Q4**: **How is moon illumination calculated?**
A: Moon illumination is the fraction of the moon's surface illuminated by the sun as seen from Earth. It ranges from 0% (new moon) to 100% (full moon), calculated from the sun-moon-earth angle.

**Q5**: **What is the difference between a new moon and a crescent?**
A: A new moon is when the moon is between Earth and the sun (0% illuminated, invisible). A crescent appears 1-2 days after the new moon — the first visible thin arc of light.

**Q6**: **When does the next Hijri (Islamic) month begin?**
A: The next Hijri month is {Month Name}, expected to begin on {Gregorian date} based on crescent sighting. The actual date may vary by one day depending on local moon sighting.

**Q7**: **When is the next Ramadan?**
A: The next Ramadan is expected to begin on {Gregorian date}. The final date depends on crescent sighting on the 29th of Sha'ban.

**Q8**: **When is the next Eid al-Fitr?**
A: Eid al-Fitr is expected on {Gregorian date}. The holiday begins when the crescent of Shawwal is sighted on the 29th of Ramadan.

**Q9**: **When is the next Eid al-Adha?**
A: Eid al-Adha is expected on {Gregorian date}. It falls on the 10th of Dhu al-Hijjah, after the crescent of Dhu al-Hijjah is sighted.

**Q10**: **How can I see the crescent moon with the naked eye?**
A: The crescent appears after sunset on the western horizon, when the moon's age is at least ~15 hours, with sufficient altitude and angular distance from the sun. A clear western horizon is needed.

**Q11**: **What are the 8 phases of the moon?**
A: The 8 phases are: (1) New Moon, (2) Waxing Crescent, (3) First Quarter, (4) Waxing Gibbous, (5) Full Moon, (6) Waning Gibbous, (7) Last Quarter, (8) Waning Crescent. The cycle repeats every 29.5 days.

**Q12**: **Why do moonrise times differ from city to city?**
A: Moonrise depends on the city's longitude. The difference can reach 12 hours between east and west of the globe. Latitude also slightly affects the direction of moonrise.

**Q13**: **What is Laylat al-Qadr (the Night of Power)?**
A: Laylat al-Qadr is a blessed night in the last 10 days of Ramadan, most likely the 27th night, but possibly any odd night (21, 23, 25, 27, 29). Muslims increase worship and prayer on this night.

**Q14**: **Can the moon be seen during the day?**
A: Yes, the moon is sometimes visible during the day, especially at first quarter, last quarter, and gibbous phases. At full moon, it rises at sunset and sets at sunrise, so it's visible only at night.

---

## 📖 6. Evergreen Content — محتوى تعليميّ ثابت

> يُضاف أسفل الصفحة لإثراء المحتوى وتجنّب عقوبة Google على الصفحات رقميّة-فقط.

### بالعربيّة (~450 كلمة)

#### فهم أطوار القمر

دورة القمر حول الأرض تستغرق 29.5 يوماً تقريباً، تُعرف بالشهر القمريّ. خلال هذه الفترة يمرّ القمر بثمانية أطوار متتابعة، تبدأ من المحاق وتنتهي بالهلال المتناقص قبل أن تتكرّر الدورة.

**المحاق** (New Moon) هو اللحظة التي يقع فيها القمر بين الشمس والأرض، فيكون الوجه المقابل للأرض مظلماً تماماً (إضاءة 0٪). لا يُرى القمر في هذه اللحظة لأنّه يرتفع ويغيب مع الشمس تقريباً.

بعد المحاق بيوم أو يومين يبدأ **الهلال المتزايد** (Waxing Crescent) في الظهور على شكل قوس نحيل في الأفق الغربيّ بعد غروب الشمس. تزداد الإضاءة تدريجياً من 1٪ إلى نحو 49٪.

عند وصول الإضاءة إلى 50٪ يصل القمر إلى طور **التربيع الأوّل** (First Quarter)، ويظهر كنصف دائرة. في هذه المرحلة يكون القمر في منتصف السماء عند غروب الشمس تقريباً.

يعقب ذلك **الأحدب المتزايد** (Waxing Gibbous) حيث تزيد الإضاءة من 51٪ إلى 99٪، ثمّ يصل القمر إلى **البدر** (Full Moon) بإضاءة 100٪. البدر يطلع وقت غروب الشمس ويغيب مع شروقها.

بعد البدر تبدأ الإضاءة بالنقصان في الأطوار المتناقصة: **الأحدب المتناقص** ثمّ **التربيع الأخير** ثمّ **الهلال المتناقص** قبل أن يعود القمر إلى المحاق من جديد.

#### لماذا تختلف مواعيد القمر من مدينة لأخرى؟

مطلع القمر ومغيبه يعتمدان بشكل أساسيّ على **خطّ الطول الجغرافيّ** للمدينة. لأنّ الأرض تدور حول محورها مرّة كلّ 24 ساعة، فإنّ المدن الواقعة شرقاً تشهد مطلع القمر قبل المدن الغربيّة. الفرق بين شرق الأرض وأقصى غربها قد يصل إلى 12 ساعة.

كما يؤثّر **خطّ العرض** على اتّجاه مطلع القمر (شمال-شرق أم جنوب-شرق) ومدّة بقائه في السماء. لذا فإنّ مواعيد القمر في مكّة تختلف عن الرياض، وعن دبي، وعن القاهرة، وعن لندن.

#### الأهمّيّة الإسلاميّة لدورة القمر

يعتمد التقويم الهجريّ كلّيّاً على دورة القمر. كلّ شهر هجريّ يبدأ بظهور الهلال ويستمرّ 29 أو 30 يوماً. هذه الدورة القمريّة تحدّد مواعيد العبادات الكبرى في الإسلام:

- **رمضان**: يبدأ صيامه بظهور هلال رمضان بعد غروب شمس اليوم الـ29 من شعبان.
- **عيد الفطر**: يبدأ بظهور هلال شوّال بعد رمضان.
- **الحجّ وعيد الأضحى**: يُحدَّدان بهلال ذي الحجّة.
- **ليلة القدر**: في العشر الأواخر من رمضان، غالباً ليلة 27.

رؤية الهلال بالعين المجرّدة شرطٌ في كثير من الاجتهادات الفقهيّة لبداية الشهر الهجريّ. يُشترط أن يكون عمر الهلال 15 ساعة على الأقلّ وقت غروب الشمس، وأن يكون ارتفاعه عن الأفق كافياً لرؤيته.

---

### In English (~450 words)

#### Understanding Moon Phases

The moon's orbit around Earth takes approximately 29.5 days — a lunar month. During this cycle, the moon passes through eight successive phases, from the new moon back to the waning crescent before the cycle repeats.

The **New Moon** is the moment when the moon lies between the sun and Earth, with the Earth-facing side completely dark (0% illumination). The moon is not visible at this moment because it rises and sets roughly with the sun.

A day or two after the new moon, the **Waxing Crescent** appears as a thin arc in the western horizon after sunset. Illumination gradually increases from 1% to about 49%.

When illumination reaches 50%, the moon reaches the **First Quarter**, appearing as a half-disk. At this phase, the moon is roughly at the zenith at sunset.

The **Waxing Gibbous** follows, with illumination increasing from 51% to 99%, until the moon reaches the **Full Moon** at 100% illumination. A full moon rises at sunset and sets at sunrise.

After the full moon, illumination decreases through the waning phases: **Waning Gibbous**, then **Last Quarter**, then **Waning Crescent**, before the moon returns to the new moon phase.

#### Why Do Moon Times Differ by City?

Moonrise and moonset depend primarily on a city's **longitude**. Because Earth rotates once every 24 hours, cities to the east experience moonrise before western cities. The difference between the far east and far west of Earth can reach 12 hours.

**Latitude** affects the direction of moonrise (northeast vs. southeast) and how long the moon stays above the horizon. So moon times in Mecca differ from Riyadh, Dubai, Cairo, and London.

#### Islamic Significance of the Lunar Cycle

The Hijri calendar is entirely lunar-based. Each Hijri month begins with the crescent sighting and lasts 29 or 30 days. This cycle determines the timing of major Islamic rites:

- **Ramadan**: Fasting begins with the sighting of the Ramadan crescent after sunset on the 29th of Sha'ban.
- **Eid al-Fitr**: Begins with the Shawwal crescent sighting after Ramadan.
- **Hajj and Eid al-Adha**: Determined by the Dhu al-Hijjah crescent.
- **Laylat al-Qadr**: In the last 10 nights of Ramadan, most likely the 27th night.

Crescent sighting with the naked eye is a requirement in many Islamic jurisprudence schools for starting the Hijri month. The crescent must be at least ~15 hours old at sunset and sufficiently elevated above the horizon to be visible.

---

## 📊 7. Data Widgets (تفصيل ما يظهر في الصفحة)

> استلهمنا من timesprayer.com ثمّ طوّرناها.

### الصندوق الرئيسيّ — الحالة الحاليّة

| الحقل | AR | EN |
|---|---|---|
| الطور | {الطور} | {Phase} |
| نسبة الإضاءة | {N}٪ | {N}% |
| عمر القمر | {D} يوم | {D} days |
| أيقونة/صورة للطور | ✅ (مع alt-text) | ✅ |
| الموقع | {المدينة}، {البلد} | {City}, {Country} |

### صندوق التوقيت (محلّيّ للمدينة)

| الحقل | AR | EN |
|---|---|---|
| مطلع القمر | {HH:MM} | Moonrise: {HH:MM} |
| مغيب القمر | {HH:MM} | Moonset: {HH:MM} |
| ارتفاع القمر عند غروب الشمس | {N}° | Moon altitude at sunset: {N}° |
| مدّة ظهور القمر الليلة | {H}س {M}د | Visibility: {H}h {M}m |
| المسافة للقمر | {N} كم | Distance: {N} km |

### عدّاد تنازليّ

- للبدر القادم: `{D} يوم، {H} ساعة، {M} دقيقة`
- للمحاق القادم: مشابه

### جدول 7 أيّام قادمة

| اليوم | الطور | الإضاءة٪ | مطلع القمر | مغيب القمر |

### شبكة 30 يوم — التقويم القمريّ للشهر الهجريّ الحاليّ

عرض الطور والإضاءة لكلّ يوم من أيّام الشهر.

### صندوق "الشهر الهجريّ القادم" ⭐ (ميزة لا يملكها timesprayer.com)

- الشهر القادم: {اسم الشهر} (رمضان/شوّال/ذو الحجّة…)
- اليوم الأوّل المتوقَّع: {التاريخ الميلاديّ}
- عمر الهلال عند غروب شمس يوم 29 في {المدينة}: {H}س {M}د
- معيار الرؤية: {واضح ✅ / صعب ⚠️ / غير ممكن ❌}
- ملاحظة إن كان رمضان/شوّال/ذي الحجّة: عبارة إسلاميّة ذات صلة (بداية الصيام، عيد الفطر، الحجّ)

---

## 🔗 8. Internal Linking Plan

### من `/moon-today` إلى:
1. `/moon-today-in-mecca` (أعلى قيمة)
2. `/moon-today-in-medina`
3. `/moon-today-in-riyadh`
4. `/moon-today-in-cairo`
5. `/moon-today-in-dubai`
6. `/moon-today-in-istanbul`
7. `/moon-today-in-london`
8. `/moon-today-in-new-york`
9. `/moon-today-in-jakarta`
10. `/hijri-calendar` (تقويم شهريّ)
11. `/today-hijri-date` (تاريخ هجريّ)
12. `/` (الرئيسيّة — مواقيت الصلاة)

### من `/moon-today-in-{city}` إلى:
1. `/moon-today` (الرئيسيّة للقمر)
2. `/prayer-times-in-{city}` (مواقيت الصلاة لنفس المدينة) — قيمة داخليّة عالية
3. `/qibla-in-{city}` (القبلة لنفس المدينة)
4. `/about-{city}` (معلومات المدينة)
5. أقرب 5 مدن جغرافيّاً (internal linking للمحليّة)
6. `/hijri-calendar`
7. `/` الرئيسيّة

### Breadcrumb
```
Home > Moon Today > {City}
الرئيسيّة > القمر اليوم > {المدينة}
```

---

## 🧬 9. Structured Data (JSON-LD Schemas)

> كلّ هذه الـ schemas مفقودة عند `timesprayer.com/moon/`. إضافتها تمنحنا أفضليّة تنافسيّة مباشرة.

### (1) `WebApplication`
```json
{
  "@type": "WebApplication",
  "name": "Moon Today",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any",
  "url": "https://{domain}/moon-today",
  "description": "..."
}
```

### (2) `FAQPage`
سرد للـ14 سؤال مع `Question` و `Answer` لكلّ واحد. هذا يُتيح Google لعرض الأسئلة مباشرةً كـ rich results.

### (3) `BreadcrumbList`
Home > Moon Today > {City}

### (4) `Place` (لصفحات المدن)
```json
{
  "@type": "Place",
  "name": "{City}",
  "geo": { "@type": "GeoCoordinates", "latitude": N, "longitude": N }
}
```

### (5) `Event` (للأحداث القمريّة القادمة)
```json
{
  "@type": "Event",
  "name": "Full Moon",
  "startDate": "2026-05-01T12:34:00Z",
  "location": "Global"
}
```

---

## 🎨 10. متطلّبات UX/Accessibility إضافيّة

- ✅ `alt` لكلّ صورة طور (مثلاً: "Waxing Crescent moon phase illustration")
- ✅ `aria-label` لكلّ زرّ/عنصر تفاعليّ
- ✅ `lang="xx"` على `<html>` يطابق لغة الصفحة
- ✅ `<link rel="canonical">` صحيح لكلّ صفحة
- ✅ `<link rel="alternate" hreflang="xx">` لكلّ من الـ10 لغات
- ✅ Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- ✅ Twitter Cards: `twitter:card="summary_large_image"`
- ✅ Responsive (mobile-first)
- ✅ Dark mode support (إن كان الموقع يدعمه بالفعل)

---

## ✅ 11. Checklist قبل الـ go-live

- [ ] `<title>` لكلّ URL × 10 لغات
- [ ] `<meta description>` لكلّ URL × 10 لغات
- [ ] H1 ديناميكيّ (طور + مدينة) × 10 لغات
- [ ] 14 FAQ × 10 لغات (ar/en كاملة هنا؛ 8 أخرى تُترجَم)
- [ ] Evergreen content × 10 لغات (ar/en كاملة هنا؛ 8 أخرى تُترجَم)
- [ ] 5 JSON-LD schemas لكلّ صفحة
- [ ] Canonical + hreflang alternates
- [ ] Open Graph + Twitter Cards
- [ ] 200-500 مدينة في sitemap
- [ ] 301 redirect `/moon` → `/moon-today` (✅ مُنجَز)
- [ ] 404 للـ slugs المجهولة
- [ ] جدول `FAMOUS_CITY_OVERRIDES` (London=UK، Tripoli=LY، Paris=FR، …)
- [ ] JS لتفعيل GPS + cache الموقع في localStorage (متّسق مع باقي الموقع)
- [ ] Responsive CSS
- [ ] Accessibility audit (alt, aria, lang)

---

## 🚀 12. الخطوات التاليّة (بعد موافقتك)

1. **مراجعة هذه الوثيقة + ملاحظاتك** (هذا الطلب الآن)
2. **تأكيد المحتوى**: هل الـ FAQ كاف؟ Evergreen يحتاج تعديلاً؟ نصوصاً إسلاميّة مختلفة؟
3. **بدء البرمجة**:
   - a) server.js: route handler لـ `/moon-today` + `/moon-today-in-{city}` + schemas + sitemap
   - b) app.js: تفعيل الصفحة + JS لجلب موقع المستخدم + تحديث البيانات الديناميكيّة
   - c) HTML: قسم `#page-moon` بالبنية الجديدة
   - d) i18n.js: الترجمات للـ8 لغات (مُشتقّة من AR+EN هنا)
   - e) db: `FAMOUS_CITY_OVERRIDES` + slug-to-city resolver
4. **Test محلّيّ** قبل الـ push
5. **Commit + push** → Render auto-deploy

---

**Prepared by Claude Code | للمراجعة بواسطة Tarek**
