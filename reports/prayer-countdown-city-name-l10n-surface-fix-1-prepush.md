# تقرير ما قبل الدفع: PRAYER-COUNTDOWN-CITY-NAME-L10N-SURFACE-FIX-1

**النوع:** إصلاح تسريب اسم مدينة عربيّ داخل سطوح صفحة العدّ التنازليّ (وأخواتها) على اللغات غير العربيّة.
**الملفّات:** `js/app.js` + `index.html` (cache-buster) فقط. **لا تغيير في server.js / curated / الإحداثيات / حساب العدّ.**
**حالة الدفع:** لم يُدفع — بانتظار اعتمادك.

---

## 1) إثبات التسريب (فحص حيّ في المتصفّح، زيارة دافئة)

السيناريو الواقعيّ: المستخدم يتصفّح صفحة عربيّة أوّلاً ⇒ يُخزَّن `currentCity` عربيًّا في `sessionStorage` ⇒ ثم يفتح صفحة بلغة أخرى. على `/ur/` ظهر التسريب التالي **قبل الإصلاح** (v762):

| الصفحة (زيارة دافئة) | `visibleArLeak` قبل | عيّنة السطوح المسرَّبة |
|---|---|---|
| `/ur/time-left-…-makkah` | **20** | `tl-h1-city`, `tl-cta-text`, `tl-seo`, `snb-city`, `city-name`, `time-left-related-links` (كلّها «مكة المكرمة») |
| `/ur/time-left-…-madinah` | **6** | `tl-h1-city`, `tl-cta-text`, `tl-seo`, `snb-city`, `city-name` (كلّها «المدينة المنورة») |

هذا يطابق صور المستخدم: `{اسم عربيّ}-এ/میں {نصّ غير عربيّ}`.

> ملاحظة مهمّة عن صورة `/bn/madinah`: الـSSR على الإنتاج **نظيف** (Title/nav = «Madinah»)، و`/bn/` محميّ أصلاً منذ 2026-05-18 (يعرض «মদিনা»). صورة الـbn كانت من **cache متصفّح قديم** (app.js قبل تلك الإصلاحات). لكن الفحص كشف تسريبًا **حيًّا قابلًا لإعادة الإنتاج على `/ur/`** من نفس عائلة السبب — لذلك التذكرة **ليست NO-OP**، بل تُصلح خللًا فعليًّا + تُحدِّث الـcache‑buster ليختفي القديم عن كلّ المستخدمين.

---

## 2) عدد occurrences قبل/بعد

| الصفحة | عربيّ مرئيّ قبل | عربيّ مرئيّ بعد |
|---|---|---|
| `/ur/…makkah` (دافئ) | 20 | **0** |
| `/ur/…riyadh` (دافئ) | (مثل makkah) | **0** |
| `/ur/…cairo` (دافئ) | (مثل makkah) | **0** |
| `/ur/…madinah` (دافئ) | 6 | **0** |

---

## 3) أماكن التسريب section-by-section

كلّ السطوح المسرَّبة **مرسومة عميل‑side** (لا SSR). الـSSR كان سليمًا دائمًا:
- **Hero H1** `#tl-h1-city` ← `getDisplayCity()`
- **CTA** `#tl-cta-text` (استبدال `{loc}`) ← `getDisplayCity()`
- **SEO paragraph** `#tl-seo` ← `getDisplayCity()`
- **Sticky/sidebar** `#snb-city`, `.city-name`, `#loc-hero-title`, aria-labels ← `getCurrentCityLabel()`
- **Related-links nav** `.time-left-related-links` (SSR نصّ) ← أُعيد كتابته بواسطة `_syncCityNameInDom` walker على مدن الأرديّة المنسَّقة.

---

## 4) السبب الجذريّ

التسريب من **آليّتين** على صفحات `/ur/` فقط، لأنّ **الأرديّة تشارك العربيّة كتلة Unicode نفسها (U+0600–06FF)**، فاختبار السكربت بالكتلة لا يميّز العربيّ «مكة المكرمة» عن الأرديّ «مکہ»:

- **آليّة A — `getDisplayCity()` / `getCurrentCityLabel()`** (فرع `ur`): يقبلان `currentCity` العربيّ الدافئ لأنّه «في الكتلة العربيّة» ⇒ تُرسَم H1/CTA/SEO/snb عربيّة. (مدينة بلا `names.ur` مثل madinah: ssr-city-name لاتينيّ «Madinah» لكنّ العميل أعاد كتابتها عربيّة.)
- **آليّة B — `_syncCityNameInDom` walker**: حارسه السابق كان يحمي ssrName **اللاتينيّ** فقط (`_hasLatin(ssrName)`)، فحين يكون ssrName اسمًا أرديًّا حقيقيًّا غير لاتينيّ («مکہ» لـmakkah)، يستبدله المشّاء بالعربيّ الدافئ «مكة المكرمة» في كلّ مكان **بما فيه `<meta ssr-city-name>` نفسه** ⇒ يصيب **كلّ مدينة أرديّة منسَّقة** (makkah/riyadh/cairo).

`__PRAYER_CITY__` غير محقون لهذه المسارات ⇒ short-circuit الموجود لا يعمل.

---

## 5) السياسة/الدالة المعتمدة بعد الإصلاح

«**meta الـSSR هي المرجع الأوحى لاسم المدينة على صفحات غير العربيّة**» — تطبيقًا لقاعدتك (`names[lang] → names.en`، ممنوع `names.ar` لغير العربيّة). 3 تعديلات متكاملة في `js/app.js`:

1. **`getDisplayCity()` فرع `ur`**: حين يجتاز `currentCity` كتلة العربيّة، يُرجِع `<meta ssr-city-name>` مطلقًا (أرديّ «مکہ» أو لاتينيّ «Madinah») بدل `currentCity`؛ يسقط لـ`currentCity` فقط إن غابت الـmeta.
2. **`getCurrentCityLabel()` فرع `ur`**: توأم التعديل 1 (مع `_strip`).
3. **`_syncCityNameInDom()`**: تقوية الحارس من `!_hasLatin(ssrName) && _hasLatin(goodName)` إلى `!_hasLatin(ssrName)` — أيّ ssrName غير لاتينيّ على صفحة absence-lang **لا يُستبدَل أبدًا** (يطابق التعليق المُعلَن أصلاً للحارس).

> العربيّة (`ar`) والبنغاليّة (`bn`) واللاتينيّات (en/fr/tr/de/id/es/ms) لم تُمسّ منطقيًّا: bn محميّ بكتلته المنفصلة، واللاتينيّات تستخدم سلسلة الإنجليزيّة. الإصلاح مقصور على فرع `ur` + حارس المشّاء.

---

## 6) جدول قبل/بعد للّغات — `madinah` (دافئ)

| اللغة | قبل (عربيّ مرئيّ؟) | بعد | المعروض بعد |
|---|---|---|---|
| ar | — (صحيح) | — | المدينة المنورة ✅ |
| ur | **نعم (6)** | **لا** | Madinah ✅ (fallback إنجليزيّ — لا `names.ur` لـmadinah) |
| bn | لا (محميّ) | لا | মদিনা ✅ (لا انحدار) |
| en/fr/tr/de/id/es/ms | لا | لا | الاسم اللاتينيّ/المحلّيّ ✅ |

## 7) جدول قبل/بعد للمدن — `/ur/` (دافئ)

| المدينة | ssr-city-name | قبل | بعد |
|---|---|---|---|
| makkah | مکہ (أرديّ) | **مكة المكرمة (20)** | **مکہ (0)** ✅ |
| riyadh | ریاض (أرديّ) | الرياض | **ریاض (0)** ✅ |
| cairo | قاہرہ (أرديّ) | القاهرة | **قاہرہ (0)** ✅ |
| madinah | Madinah (لاتينيّ) | **المدينة المنورة (6)** | **Madinah (0)** ✅ |
| lahore | لاهور (منسَّق `names.ur`) | لاهور (سليم عبر Tier‑0) | **لاهور (0)** ✅ (لا انحدار) |

---

## 8) تأكيد نظافة SSR

الـSSR لم يكن مصدر التسريب أصلاً وغير مُعدَّل (server.js بلا تغيير). فحص خام (curl، بلا JS):
`ur/makkah=مکہ` · `ur/riyadh=ریاض` · `ur/cairo=قاہرہ` · `ur/madinah=Madinah` · `bn/makkah=মক্কা` · `bn/madinah=Madinah`. السلاسل المرئيّة (Title/H1/nav/cards) إنجليزيّة/أرديّة، لا عربيّ.

## 9) تأكيد نظافة DOM بعد hydration

زيارة دافئة (currentCity عربيّ مزروع) + `TreeWalker` على العناصر المرئيّة:
`/ur/makkah`, `/ur/riyadh`, `/ur/cairo`, `/ur/madinah`, `/bn/madinah`, `/ar/madinah` ⇒ **`visibleArLeak = 0`** في الكلّ، و`getDisplayCity()`/`getCurrentCityLabel()` تُرجعان الاسم الصحيح للّغة. 0 أخطاء console. الإصلاح يغطّي عبر الدالة المشتركة كلّ عائلات المسارات (time-left / next-prayer / moon / prayer-times).

## 10) تأكيد نظافة JSON-LD

`_syncCityNameInDom` (مع الحارس المُقوَّى) لم يعد يكتب على أيّ ssrName غير لاتينيّ ⇒ لا يُحقَن العربيّ في JSON-LD لمدن الأرديّة المنسَّقة. فحص `script[type="application/ld+json"]`: 0 تسريب عربيّ على الصفحات المختبَرة.

## 11) تأكيد عدم تغيير الحسابات

لا مساس بـ: العدّ التنازليّ، أوقات الصلاة، ترتيب الصلوات، الإحداثيات، الـslug. التعديلات على **عرض اسم المدينة** فقط (3 دوال l10n). `next.key`/`_countdownStr`/`currentPrayerTimes` بلا تغيير.

## 12) الملفّات المعدَّلة

| الملفّ | التغيير |
|---|---|
| `js/app.js` | +78/−11: حارس meta في `getDisplayCity` فرع ur + `getCurrentCityLabel` فرع ur + تقوية حارس `_syncCityNameInDom` (سطر ~7965). |
| `index.html` | cache-buster `app.js?v=762 → ?v=764` (سطران: preload + script). |

## 13) regression

- `node --check js/app.js` ✅
- 0 أخطاء console على كلّ الصفحات المختبَرة ✅
- لا انحدار: `/bn/madinah`=«মদিনা»، `/ar/madinah`=«المدينة المنورة»، `/ur/lahore`=«لاهور» (Tier‑0)، `/ur/madinah` **cold**=«Madinah» ✅
- عائلات المسارات الأخرى على `/ur/` (next-prayer, moon) دافئة = «Madinah»، 0 تسريب (نفس الدالة المشتركة) ✅
- server.js / curated / sitemap / canonical / hreflang بلا تغيير ✅

## 14) cache-busters

`app.js?v=762 → ?v=764` (يُجبر كلّ المتصفّحات على جلب الكود المُصلَح — يُزيل أيضًا أثر الـcache القديم الذي ظهر في صور `/bn/`). **لا حاجة لرفع `_i18nVersion` أو `CACHE_VERSION`** (لا تغيير i18n/SW).

## 15) رسالة commit المقترحة

```
fix(prayer-countdown): PRAYER-COUNTDOWN-CITY-NAME-L10N-SURFACE-FIX-1 — localize city names across countdown page surfaces

SSR ssr-city-name meta is now authoritative for /ur/ display: getDisplayCity
+ getCurrentCityLabel prefer it over a warm-visit Arabic currentCity (Arabic
shares Urdu's Unicode block), and _syncCityNameInDom no longer overwrites a
non-Latin SSR name on absence-lang pages. Fixes Arabic city-name leak in
H1/CTA/SEO/sticky/related-links on /ur/{makkah,riyadh,cairo,madinah,…}.
No server/curated/calc changes. app.js cache-buster 762→764.
```

---

## ملاحظة عن سطح خارج النطاق (للعلم — لم يُعدَّل)

عند الزيارة الدافئة، قسم القمر المخفيّ على صفحة TL (`#page-moon-today` FAQ) يستخدم `currentCity` الخام؛ **مقصوص/مخفيّ على مسار TL** (`_TL_STRIP_IDS`) فلا يظهر. لكنّه قد يظهر على `/{lang}/moon-today-in-*` الدافئة. خارج نطاق صفحة العدّ التنازليّ — يُوصى بتذكرة منفصلة `MOON-PAGE-CITY-NAME-L10N-SURFACE-FIX` إن رغبت.

## توصية بيانات (اختياريّة)

`madinah` ليست منسَّقة بـ`names.ur`/`names.bn` (تعرض «Madinah»/«মদিনা»). إضافة «مدینہ منورہ» (ur) ستجعلها تعرض الاسم الأرديّ الأصيل بدل الإنجليزيّ — مهمّة إثراء بيانات منفصلة.

---

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: PRAYER-COUNTDOWN-CITY-NAME-L10N-SURFACE-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
