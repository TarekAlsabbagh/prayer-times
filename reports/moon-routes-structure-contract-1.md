# Moon Routes — Structure Contract (MOON-ROUTES-STRUCTURE-GUARDRAILS-1)

**التاريخ:** 2026-06-17 (أُنشئ) · **آخر تحديث:** 2026-06-18 (`MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1` — فعّلت صفحة الشهر `/moon/{country}/{city}/{yyyy}/{mm}` في قسم `page-moon-month` مستقلّ؛ والأعمق منها — يوم متداخل `/{dd}` / today / صور الشرطة dash — يبقى 404 نظيف؛ بطاقات الأشهر في صفحة السنة صارت تشير إلى الشهر المتداخل الجديد). · سابقًا 2026-06-18 (`MOON-CITY-YEAR-ROUTE-STRUCTURE-ADD-1` — فعّلت صفحة السنة `/moon/{country}/{city}/{yyyy}` في قسم `page-moon-year` مستقلّ). · سابقًا 2026-06-18 (`MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1` — فعّلت `/moon/{country}/{city}` وحوّلت `/moon-in-{city}` 301 إليه).
هذا الملفّ هو **مصدر الحقيقة** لِحالة روابط القمر الحاليّة والمستقبليّة. أيّ تذكرة لاحقة تُغيّر هذا العقد يجب أن تُحدّث هذا الملفّ + اختبار الحماية `scripts/_smoke_moon_routes_structure_guardrails_1.mjs` معًا.

---

## 1) الحالة الحاليّة المعتمَدة (LIVE — مثبَّتة بِالاختبار)

| الرابط | الحالة | canonical | sitemap | الصفحة النشطة | ملاحظة |
|---|---|---|---|---|---|
| `/moon` (+10 لغات) | **200** | ذاتيّ `…/moon` | **موجود** (index) | `page-moon` | هب «قمر اليوم» الرسميّ — نفس محتوى moon-today |
| `/moon/{country}` (+10 لغات، دول لها مدن curated) | **200** | ذاتيّ `…/moon/{country}` | **موجود** (index) | قالب المدن `prayer-times-cities.html` (variant=moon) | صفحة دولة — مراحل القمر، تعيد استعمال شبكة مدن الدولة؛ البطاقات والبحث → `/moon-today-in-{city}` (MOON-COUNTRY-PAGES-SSR-ADD-1) |
| `/moon-today` (+لغات، +/) | **301 → /moon** | — (لا جسم) | **غير موجود** | — | تحويلة دائمة، حفظ اللغة |
| `/moon/{country}/{city}` (+10 لغات) | **200** | ذاتيّ `…/moon/{country}/{city}` | **موجود** (cities sitemap) | `page-moon` | **هب المدينة الجديد** (البنية المتداخلة) — نفس محتوى `/moon-in-{city}` + breadcrumb 4 مستويات (MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1) |
| `/moon/{country}/{city}/{yyyy}` (+10 لغات، 1900–2100) | **200** | ذاتيّ `…/moon/{country}/{city}/{yyyy}` | **موجود** (cities sitemap — السنة السابقة + الحاليّة + التالية فقط) | **`page-moon-year`** (قسم مستقلّ) | **صفحة السنة** — breadcrumb 5 مستويات + جدول مراحل رئيسيّة (Meeus 49) + 12 بطاقة شهر (روابط → **الشهر المتداخل الجديد `/moon/{country}/{city}/{yyyy}/{mm}`** بعد MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1) + ملخّص سنة + 6 FAQ + روابط سنة سابقة/تالية (MOON-CITY-YEAR-ROUTE-STRUCTURE-ADD-1) |
| `/moon/{country}/{city}/{yyyy}/{mm}` (+10 لغات، السنة 1900–2100، الشهر `\d{2}` في 01–12) | **200** | ذاتيّ `…/moon/{country}/{city}/{yyyy}/{mm}` | **موجود** (cities sitemap — أشهر السنة السابقة + الحاليّة + التالية، مربوطة بالسنوات المقبولة) | **`page-moon-month`** (قسم مستقلّ) | **صفحة الشهر الجديدة** — breadcrumb 6 مستويات (رتبة السنة رابط لصفحة السنة) + Hero (7 رقاقات + مرساتان) + ملخّص شهر (محاق/تربيع أوّل/بدر/تربيع أخير + عدد الأحداث + tz) + جدول يوميّ لِكلّ أيّام الشهر (Meeus 49، 5 أعمدة: التاريخ المحلّي/اليوم/الطور/الإضاءة/العمر، روابط اليوم → **اليوم القديم `/moon-in-{city}/{yyyy-mm-dd}`**) + شهر سابق/تالٍ (عبور السنة) + 6 FAQ + روابط للسنة والمدينة (MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1) |
| `/moon-in-{city}` (+coord) | **301 → /moon/{country}/{city}** | — (لا جسم) | **غير موجود** | — | الهب القديم — صار تحويلة دائمة للبنية المتداخلة (+حفظ اللغة) |
| `/moon-today-in-{city}` (+coord) | **200** | ذاتيّ | حسب السياسة الحاليّة (مدن مشهورة فقط) | `page-moon` | صفحة اليوم لِمدينة — **دون مساس** |
| `/moon-in-{city}/{YYYY-MM}` | **200** | ذاتيّ | لا (لا إغراق) | `page-moon` | صفحة شهر مدينة — **دون مساس** (لم تُهاجَر) |
| `/moon-in-{city}/{YYYY-MM-DD}` | **200** | ذاتيّ | لا (لا إغراق أيّام) | `page-moon` | صفحة يوم مدينة — **دون مساس** (لم تُهاجَر) |

**ثوابت SEO:** `/moon` = index + canonical ذاتيّ + في sitemap. لا تكرار canonical بين `/moon` و`/moon-today` (الأخيرة 301 بلا جسم). صفحات المدن canonical ذاتيّ.

**ثوابت العميل (SPA):** كلّ ما سبق + بادئة `/moon/...` المستقبليّة تُصنَّف `page-moon` عبر `_isMoonPath` في `js/app.js`. صفحات غير القمر (`/`، `/prayer-times-in-*`، `/qibla-in-*`، `/today-hijri-date`، `/date-converter`) **ليست** `page-moon`.

**ثوابت Meeus 49 (`js/moon.js` — لا يُمَسّ):** الرياض يونيو 2026: 15=**المحاق** · 16=**هلال متزايد** · 29=**أحدب متزايد** (ليس بدرًا) · 30=**البدر**. صفحات المدن تستعمل IANA الخاصّ بالمدينة (`_hijriForIana`)، و`_CC_TO_PRIMARY_TZ` فقط fallback للمدن خارج الخريطة.

---

## 2) الحالة المستقبليّة (غير مفعّلة بعد — لا تُفعَّل إلا في تذاكر لاحقة مستقلّة)

| الرابط المستقبليّ | الحالة الحاليّة المطلوبة | عند التفعيل (تذكرة لاحقة) |
|---|---|---|
| `/moon/{country}/{city}/today` | **404 نظيف** | صفحة اليوم المتداخلة |
| `/moon/{country}/{city}/{yyyy}/{mm}/{dd}` (صورة الشرطة المائلة) | **404 نظيف** | صفحة يوم متداخلة تحت الشهر (today حاليًّا يُخدَم عبر اليوم القديم `/moon-in-{city}/{yyyy-mm-dd}`) |
| `/moon/{country}/{city}/{YYYY-MM}` (صورة الشرطة dash) | **404 نظيف** | **ليست جزءًا من البنية الجديدة** — تبقى 404؛ صفحة الشهر القديمة هي `/moon-in-{city}/{YYYY-MM}` |
| `/moon/{country}/{city}/{YYYY-MM-DD}` (صورة الشرطة dash) | **404 نظيف** | **ليست جزءًا من البنية الجديدة** — تبقى 404؛ صفحة اليوم القديمة هي `/moon-in-{city}/{YYYY-MM-DD}` |

> ملاحظة: `/moon/{country}` صارت **200 LIVE** بعد `MOON-COUNTRY-PAGES-SSR-ADD-1`، و`/moon/{country}/{city}` (هب المدينة) صارت **200 LIVE** بعد `MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1`، و`/moon/{country}/{city}/{yyyy}` (صفحة السنة) صارت **200 LIVE** بعد `MOON-CITY-YEAR-ROUTE-STRUCTURE-ADD-1`، و`/moon/{country}/{city}/{yyyy}/{mm}` (صفحة الشهر) صارت **200 LIVE** بعد `MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1` (انظر القسم 1). الجدول أعلاه يخصّ فقط المستوى **الأعمق من الشهر** (اليوم المتداخل `/{dd}` / today) **وصور الشرطة dash** التي لم تُفعَّل ولن تكون جزءًا من البنية الجديدة. **السنة تقبل 4 أرقام فقط (`\d{4}`) في المجال 1900–2100، والشهر رقمان (`\d{2}`) في 01–12**؛ أيّ شيء آخر (26 / 202 / 20261 / abcd / `2026-06` / `2026/6` / `2026/00` / `2026/13`) = 404.

**التحقّق من البنية المتداخلة (MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1):** `/moon/{country}/{city}` يُخدَم **200** فقط حين تكون الدولة حقيقيّة (`_countryFromSlug`) **و** المدينة تُحلّ (`_resolveCcForSlug`) **و** تنتمي لتلك الدولة (`makeCountrySlugSrv(cc)===country`). دولة/مدينة مجهولة → **404**. مدينة في دولة خاطئة → **301** إلى `/moon/{correctCountry}/{city}` (لا فهرسة لرابط غير مطابق).

**القاعدة الآن:** السيرفر يُرجِع **404** (صفحة خطأ صغيرة ~2KB، ليست shell 200KB) لِكلّ مسار متداخل **أعمق من الشهر** `/moon/{country}/{city}/{yyyy}/{mm}/{dd}` ولِـ`/moon/{country}/{city}/{today}` ولِصور الشرطة dash `/{YYYY-MM}` + `/{YYYY-MM-DD}` ولِلشهر غير الصالح (`/{yyyy}/6` أو `/{yyyy}/00` أو `/{yyyy}/13`). أمّا `/moon/{country}` و`/moon/{country}/{city}` و`/moon/{country}/{city}/{yyyy}` و`/moon/{country}/{city}/{yyyy}/{mm}` فتُرجِع **200**. العميل (`_isMoonPath`) يعرف كلّ بادئات `/moon/...` كـ`page-moon`؛ وعلى الهب المتداخل يُطبِّع العميل المسار (`_moonPathname`) إلى `/moon-in-{city}` لِكلّ مُحلِّلات القمر، ويترك breadcrumb الـ4 مستويات المحقون من SSR كما هو. روابط الهب المتداخل **داخل** cities sitemap؛ الهب القديم `/moon-in-{city}` **خرج** منها (لأنّه 301).

**ممنوع عند التفعيل لاحقًا:** إغراق sitemap بِملايين صفحات الأيّام (`…/{YYYY-MM-DD}`)؛ canonical خاطئ؛ صفحة index ناقصة؛ 200 فارغة.

---

## 3) ما الذي يحرسه اختبار `_smoke_moon_routes_structure_guardrails_1.mjs`
A) مُصنِّف `_isMoonPath` (مستخرَج فعليًّا) — كلّ القديم + الجديد `/moon/...` = page-moon؛ غير القمر = لا.
B) `/moon` = 200 + H1 واحد + page-moon + canonical ذاتيّ + index + محتوى فعليّ + FAQ + search hero + ليس footer-only.
C) `/moon-today` = 301→/moon (لغات +/)، ليست 200، خارج sitemap.
D) روابط مدينة القمر: الهب المتداخل `/moon/{country}/{city}` = 200 + page-moon + H1 واحد + canonical ذاتيّ + breadcrumb 4 مستويات؛ الهب القديم `/moon-in-{city}` = **301 → المتداخل** (+لغات)؛ today/شهر/يوم المسطّحة = 200 (دون مساس).
E) `/moon/{country}` = **200** صفحة دولة؛ الهب المتداخل `/moon/{country}/{city}` = **200**؛ **صفحة السنة `/moon/{country}/{city}/{yyyy}` = 200 + `page-moon-year` نشط + H1 واحد**؛ **صفحة الشهر `/moon/{country}/{city}/{yyyy}/{mm}` = 200 + `page-moon-month` نشط + H1 واحد + 0 أقسام مُسرَّبة**؛ الأعمق من الشهر `/moon/{country}/{city}/{today|yyyy/mm/dd|yyyy/6|yyyy/00|yyyy/13}` **وصور الشرطة dash `/{YYYY-MM}` + `/{YYYY-MM-DD}`** = **404 نظيف**؛ دولة/مدينة مجهولة = **404**؛ مدينة في دولة خاطئة = **301** للصحيح.
F) sitemap-main: فيه `/moon` و`/moon/{country}`، ليس فيه `/moon-today`، لا إغراق أيّام. sitemap-cities: فيه الهب المتداخل `/moon/{country}/{city}` + **صفحة السنة `/moon/{country}/{city}/{yyyy}` (سابقة+حاليّة+تالية)** + **صفحات الشهر `/moon/{country}/{city}/{yyyy}/{mm}` (12 شهرًا لِكلّ سنة مقبولة)**، **ليس** فيه الهب القديم `/moon-in-{city}`، وفيه `/moon-today-in-{city}` + اليوم القديم `/moon-in-{city}/{date}` (لم يُهاجَرا)، **ولا** صفحات يوم أعمق متداخلة (`/{yyyy}/{mm}/{dd}`) **ولا** `today` متداخل.
+ اختبار مخصّص `scripts/_smoke_moon_city_hub_route_structure_add_1.mjs`: تطابق breadcrumb DOM≡JSON-LD (4 مستويات، AR+EN) + hreflang 10 لغات + x-default + بذرة `__PRAYER_CITY__` + 301 قديم→جديد (+لغات) + mismatch→301 + 404 التحقّق.
+ اختبار مخصّص `scripts/_smoke_moon_city_year_route_structure_add_1.mjs` (MOON-CITY-YEAR-ROUTE-STRUCTURE-ADD-1): صفحة السنة 200 + `page-moon-year` + H1 واحد + canonical ذاتيّ (4 مدن/لغات) + breadcrumb 5 مستويات DOM≡JSON-LD (AR+EN) + جدول مراحل + 12 بطاقة شهر (روابط → الشهر القديم `/moon-in-{city}/{yyyy-mm}`، صفر روابط للمتداخل 404) + سنة سابقة/تالية + 6 FAQ + hreflang 10+x-default + التحقّق (today/yyyy/mm/dash/26/202/20261/abcd/1899/2101 = 404؛ mismatch = 301 مع حفظ اللغة) + sitemap (سنة موجودة، أعمق غير موجود) + الروابط القديمة سليمة + Meeus 49 ثابت.
G) canonical: `/moon` ذاتيّ، مدن ذاتيّ، `/moon-today` بلا جسم/canonical، لا تكرار.
H) صفحات غير القمر ليست page-moon (SSR).
I) Meeus 49: الرياض 15/16/29/30 + مدينة أمريكيّة تعرض صفحة قمر + `_hijriForIana` للمدن + محرّك Meeus 49 موجود في moon.js.

أيّ كسر مستقبليّ لِبنية القمر يُسقِط هذا الاختبار قبل الدفع.
