# ADSENSE-PRE-SUBMISSION-FIXES-1 — PRE-COMMIT REPORT

**⛔ لا commit · لا push · لا PR · لا merge · لا deploy.** كل التحقق أدناه **محلي** (`localhost:8080`).
**التاريخ:** 2026-08-08 · **القاعدة:** `origin/main` = `8da126205dcc581abf2211e7ed90a141201b5ed2`
**⚠️ لا يوجد أي Production verification في هذا التقرير** — التعديلات لم تُنشر بعد، فلا يجوز تسجيل PASS إنتاجي لها.

---

## A — CONTACT

```
Old email:                          contact@prayer-times.example
New email:                          infotimesprayers@gmail.com
Expected mailto:                    mailto:infotimesprayers@gmail.com

Production-code occurrences before: 20   (10 نص ظاهر + 10 mailto)
Production-code occurrences after:   0
Old ".example" occurrences after:    0   (وأي `prayer-times.example` = 0)
New email occurrences:              20
mailto: occurrences:                10

10/10 locales:                      PASS
Displayed email:                    PASS
mailto:                             PASS
Displayed email matches mailto:     PASS
SSR (local):                        PASS

Result:                             PASS
```

الشكل المُنتَج في الأماكن العشرة جميعًا:
`<a href="mailto:infotimesprayers@gmail.com">infotimesprayers@gmail.com</a>`

**ملاحظة:** بقيت occurrences للبريد القديم في **تقارير تاريخية داخل `reports/`** فقط — لم أعدّلها كما طلبت.

---

## B — ABOUT LANGUAGES

```
Locales updated:                    10/10
All 10 languages correctly listed:  PASS   (تحقّق باسم كل لغة بلغة الصفحة نفسها = 10/10 لكل locale)
Future-language claims:             0      (regex عبر 10 لغات: قيد الإضافة / in development / coming soon / bientôt / demnächst / yakında / segera / próximamente / শীঘ্রই)
Result:                             PASS
```

**تصحيح مهم لتقرير التدقيق السابق:** ادعاء «About يقول لغتان» كان صحيحًا **في كتلتَي `ar` و`en` فقط**. بقية الكتل لم تكن كاذبة بل **ناقصة** (fr/tr/ur تسرد 5 لغات · de تسرد 6 · id/bn/ms تسرد 7+) لأن كل كتلة كُتبت وقت إضافة لغتها ولم تُحدَّث. الآن **الكتل العشر تسرد اللغات العشر كاملةً**.

الصياغة تتبع بنية الجملة الأصلية في كل لغة (مثال ar): «الموقع متاح حاليًا بعشر لغات: العربية، والإنجليزية، والفرنسية، والتركية، والأردية، والألمانية، والإسبانية، والإندونيسية، والبنغالية، والماليزية.»

---

## C — ABOUT SERVICES

```
Sleep Azkar references in About:    0   (fetch محلي × 10 locales، بكلمة كل لغة)
Travel Azkar references in About:   0
Quran included:                     10/10
Result:                             PASS
```

الكلمات المفحوصة لكل لغة: ar `النوم/السفر` · en `sleep/travel` · fr `sommeil/voyage` · tr `uyku/yolculuk` · ur `نیند/سفر` · de `Schlaf/Reise` · id `tidur/perjalanan` · es `sueño/viaje` · bn `ঘুম/ভ্রমণ` · ms `tidur/perjalanan` — **صفر مطابقة في الكتل العشر**.

بند الأذكار صار (مثال ar): «الأدعية والأذكار: مجموعة منظَمة من الكتاب والسنة (أذكار الصباح، والمساء، والصلاة).» — **لم تُضَف خدمات بديلة ولا صفحات قادمة.**

---

## D — QURAN ATTRIBUTION

```
Primary source:                     Tanzil Project
Text:                               Uthmani
Version:                            1.1
Source link:                        https://tanzil.net/
About attribution:                  10/10
Text described as unchanged:        PASS
Unsupported "official" claims:      0
Unsupported "certified" claims:     0
Unsupported "approved" claims:      0
Result:                             PASS
```

**آلية الفحص:** استخرجتُ كل مقطع نصّي يحيط باسم `Tanzil` في كل locale وطبّقتُ عليه regex عابرًا للغات `(official|certified|approved|رسمي|معتمد|مصادق)` ⇒ **صفر مطابقة**.

النص المُضاف كبند جديد في «الميزات الرئيسية» (مثال ar):
> **القرآن الكريم:** نص القرآن الكريم بالرسم العثماني من [مشروع Tanzil](https://tanzil.net/)، الإصدار 1.1، ويُعرض النص كما ورد في المصدر دون تعديل، وفق ترخيص وشروط استخدام Tanzil.

الرابط في اللغات العشر: `<a href="https://tanzil.net/" rel="noopener noreferrer" target="_blank">`.
اعتمدتُ صياغتك «**وفق ترخيص وشروط استخدام Tanzil**» بدل شرح CC BY 3.0 داخل About — لأن شروط Tanzil المنشورة تمنع تغيير النص صراحةً، فاختزالها إلى «CC BY 3.0 = التعديل مسموح» سيكون غير دقيق.
**لم أذكر «حفص عن عاصم»** في About إبقاءً للفقرة قصيرة؛ التفصيل الكامل موجود أصلًا داخل قسم القرآن على صفحات السور.

**لم أغيّر شيئًا في `/quran` أو صفحات السور** — الإسناد هناك كامل وصحيح بالفعل (اسم المصدر + الإصدار + «دون تعديل» + الترخيص + 3 روابط عاملة).

---

## E — QURAN INTEGRITY

```
Quran dataset modified:             NO    (git status --porcelain data/quran/ = فارغ)
6236 verse texts:                   PASS  ("6236/6236 VERSE TEXTS IDENTICAL TO OFFICIAL TANZIL SOURCE")
data_all_114 smoke:                 915 passed, 0 failed
Text source:                        Tanzil
metaRawSha256 pre-existing mismatch: YES
Verse-text impact:                  NONE
Result:                             PASS
```

أُعيد تشغيل اختبارَي السلامة **بعد** تحرير About للتأكد أن التحرير لم يمسّ الـdataset — ونجحا.

**PRE-EXISTING QURAN METADATA MANIFEST ISSUE (لم يُصلَح، كما أمرت):**
`metaRawSha256` في `vendor/manifest.json` = `8867C1D8…` بينما SHA256 الفعلي لـblob ملف الميتاداتا = `423AFA57…`. السبب: الملف أُعيد ترميزه في commit `f98a44c` («restore Tanzil metadata encoding») **بعد** توليد الـmanifest في `0b722ef`، ولم يُعَد توليد الـmanifest. **يخصّ الميتاداتا فقط (أسماء السور/عدد الآيات/حدود الأجزاء) ولا يمسّ حرفًا من نص الآيات.** وهو أيضًا سبب فشل `_smoke_quran_data_deterministic_build_1` — **فشل سابق** لا علاقة له بهذه التذكرة.

> **إنذار كاذب حسمتُه:** أول قياس أظهر عدم تطابق `textRawSha256` أيضًا — السبب `core.autocrlf=true` يحقن 6499 محرف CR عند الفحص على ويندوز. عند حساب SHA256 لـ**git blob** التطابق **تام**: `203F0F1BF3158B1E5BE4AB9F8F6870E570AAB6D9A626FE6192A70B75D4AFE0FD`.

---

## F — SOCIAL LINKS

| Platform | Username | URL | Status |
|---|---|---|---|
| **X (Twitter)** | `TIMESPRAYESRS` | `https://x.com/TIMESPRAYESRS` | **200 · EXISTS** — `<title>` = `infotimesprayers (@TIMESPRAYESRS) / X` |
| **YouTube** | `@TIMESPRAYESRS` | `https://www.youtube.com/@TIMESPRAYESRS` | **200 · EXISTS** — `og:title` = `TIMESPRAYESRS`، canonical = `youtube.com/channel/UC-roDvbrexJrLkn-exRhkkQ`، و«This page isn't available» = **False** |
| **LinkedIn** | `times-prayers-072861404` | `https://www.linkedin.com/in/times-prayers-072861404` | **HTTP 999 · UNKNOWN** — 999 هو حجب LinkedIn المعتاد للطلبات غير المُصادَقة، **وليس دليلًا على غياب الحساب**. يحتاج تحققك بالمتصفح |

```
SOCIAL LINKS: PASS (2 verified existing, 1 unverifiable by bot — not broken)
```

**استنتاج مهم:** `TIMESPRAYESRS` **ليس خطأ مطبعيًّا** — هو المُعرَّف الحقيقي على المنصتين، واسم العرض على X هو `infotimesprayers` وهو **يطابق البريد الجديد المعتمد**. **لم ألمس أي رابط.**

> **إفصاح عن خطأ مؤقت لي:** فحصي الأول صنّف YouTube كـ«LIKELY MISSING» لأن regex ساذجًا التقط `404` داخل حمولة JS بحجم 778KB. الفحص الدقيق (og:title + canonical + السلسلة الصريحة) أثبت **العكس**. لم أعتمد الإنذار الكاذب.

---

## G — FOLLOW-UP ITEMS — NOT PART OF THIS FIX

مسجَّلة فقط، **لم يُصلَح أيٌّ منها**:

1. **FOLLOW-UP SEO CONTENT ISSUE** — Meta description لصفحة الأذكار ما زال يذكر النوم/السفر: `server.js:12573` (ar) و`12574` (en). خارج نطاق هذه التذكرة بأمرك.
2. **PRE-EXISTING QURAN METADATA MANIFEST ISSUE** — `metaRawSha256` قديم (تفصيله في §E). لا أثر على نص الآيات.
3. **QIBLA DEBUG** — موجود في DOM، `hidden`، لم يظهر في 44 قياسًا سابقًا ولا في 30 قياسًا محليًّا اليوم. **UNCHANGED** — لا مخاطرة على البوصلة قبل AdSense.
4. **Programmatic city-content** — ~31,050 صفحة، ~15 رمزًا فريدًا بين مدينتين. **لا تغيير.**
5. **Programmatic Hijri pages** — ~744 صفحة قوالبية. **لا تغيير.**
6. **CMP / GA4 consent** — `_ga` يُضبط قبل الموافقة والبنر ليس CMP معتمدًا. **لا تغيير** — تذكرة مستقلة.

---

## H — LOCAL REGRESSION

متصفح Chrome حقيقي على `localhost:8080`، الكاش معطَّل، **15 مسارًا × (جوال 375 + سطح مكتب 1280) = 30 قياسًا**:

```
Routes tested:        15  (/ · /contact · /about-us · /en/about-us · /ur/about-us ·
                          /prayer-times-in-makkah · /prayer-times-in-saudi-arabia · /qibla ·
                          /quran · /quran/al-fatihah · /quran/al-kahf · /quran/an-nas ·
                          /azkar · /today-hijri-date · /moon)
HTTP 5xx:             0
HTTP 429:             0
console.error:        0
pageerror:            0
Broken navigation:    0
Mobile overflow:      0    (overflow = 0px على الـ15 مسارًا في العرضين)
H1 count:             1 على كل مسار
Quran text changes:   NONE
Quran dataset:        NOT MODIFIED
```

عناصر مرصودة وغير مُعتبَرة أعطالًا: `div.cookie-consent` (بنر الموافقة القائم، 16% من الشاشة، ليس حاجبًا) · `EMPTY-H:3` (ثلاثة H2 في قسم القبلة **الخامل**، تملؤها الـJS على صفحة القبلة، `visible:false`).

**فحوص SSR المحلية للكتل العشر: 160 نجاحًا / 0 فشل** (About ×10 + Contact ×10، تشمل status/H1/canonical/robots/اللغات/الادعاءات/الأذكار/القرآن/الرابط/الـplaceholders).

---

## I — REPOSITORY SCOPE

```
$ git status --short
 M server.js
 D "LOGO W.svg"      ← حذف قديم سابق لهذه التذكرة، لم أُنشئه ولن أدرجه
 D LOGO.svg          ← نفس الشيء

$ git diff --stat   (باستثناء الحذفين القديمين)
 server.js | 70 ++++++++++++++++++++++++++++-------------------
 1 file changed, 40 insertions(+), 30 deletions(-)
```

**ملف واحد فقط عدّلتُه عمدًا: `server.js`.**
- 10 أسطر: البريد (نص + `mailto`) — 20 موضعًا داخلها.
- 10 أسطر: فقرة اللغات (استبدال).
- 10 أسطر: بند الأذكار (تنظيف) + **10 أسطر جديدة**: بند القرآن.

`node --check server.js` = **OK**.
**صفر ملفات أخرى.** لم أعدّل تقارير تاريخية. الملف الجديد الوحيد هو هذا التقرير.

---

## FINAL VERDICT

```
BLOCKER-1 CONTACT:          PASS
BLOCKER-2 ABOUT:            PASS
ABOUT — 10 LANGUAGES:       PASS
ABOUT — QURAN SOURCE:       PASS
TANZIL ATTRIBUTION:         PASS
QURAN TEXT UNCHANGED:       PASS
SOCIAL LINKS:               PASS  (X + YouTube موجودان · LinkedIn UNKNOWN بسبب حجب 999، غير مكسور)
LOCAL REGRESSION:           PASS
UNEXPECTED SCOPE:           NONE
```

```
FINAL STATUS:

READY FOR COMMIT
```

**تنبيه على الحدود:** كل ما سبق **محلي**. بعد موافقتك على الـcommit + push + PR + merge + deploy، أُنفّذ **Production verification** كخطوة مستقلة. **لن أسجّل أي PASS إنتاجي قبل النشر.**

**تذكير من الدرس السابق:** إن أردت تخطّي نشر Render لهذا التغيير، اكتب `[skip render]` **يدويًّا وكاملة في مربّع رسالة الـMerge Commit** — GitHub يقصّ العنوان المنسوخ من الفرع.
