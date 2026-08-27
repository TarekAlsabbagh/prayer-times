/**
 * ADSENSE-EDITORIAL-GUIDES-IMPLEMENTATION-1 (2026-08-27)
 *
 * Frozen editorial content for the six guide pages (3 guides × ar/en).
 *
 * ⚠️ This file is a VERBATIM transcription of the human-approved FROZEN content packages.
 *    Do not paraphrase, shorten, extend, or "improve" any sentence here without a new
 *    editorial review ticket. Every number in the tables was computed from this project's
 *    own engine (js/prayer-times.js) or the same great-circle formula used in server.js.
 *
 * Server-side only: required by server.js and injected into guides.html, which is then
 * handed to serveHtmlWithSeo() so the pages get the SAME canonical/hreflang/OG head as
 * every other route. It is NOT shipped to the browser.
 */

'use strict';

// Wrap a table so it scrolls on narrow screens instead of forcing the page to scroll.
const T = (html) => '<div class="guide-table-wrap">' + html + '</div>';

const GUIDES = {

// ═══════════════════════════════════════════════════════════════════════════════
// GUIDE 1 — Prayer time calculation methods and angles
// ═══════════════════════════════════════════════════════════════════════════════
'prayer-time-calculation-methods': {

ar: {
h1: 'طرق حساب مواقيت الصلاة وزوايا الفجر والعشاء',
body: `
<p class="guide-intro">حين تفتح تطبيقين مختلفين في المدينة نفسها فتجد الفجر يختلف بينهما خمس عشرة دقيقة، لا يعني ذلك أن أحدهما معطوب. غالبًا يعني أن كلًّا منهما يجيب عن سؤال مختلف قليلًا: <strong>متى نقول إن الفجر دخل؟</strong> هذه الصفحة تشرح كيف يُصاغ هذا السؤال رياضيًا، وما الذي يطبّقه هذا الموقع بالضبط.</p>

<h2>ما الذي يُحسَب أصلًا؟</h2>
<p>مواقيت الصلاة ليست جدولًا محفوظًا، بل تُشتقّ من <strong>موضع الشمس بالنسبة لأفق موقعك</strong>. تحتاج الحسبة إلى ثلاثة مدخلات: خط العرض، وخط الطول، والتاريخ. منها يُستخرج <strong>ميل الشمس</strong> ذلك اليوم و<strong>معادلة الزمن</strong>، ثم يُحسب الوقت الذي تبلغ فيه الشمس ارتفاعًا معيّنًا.</p>
<p>بعض الأوقات تعريفها الهندسي مباشر: <strong>الظهر</strong> حين تعبر الشمس خط الزوال، و<strong>الشروق</strong> و<strong>المغرب</strong> حين يلامس قرص الشمس الأفق. لكن <strong>الفجر</strong> و<strong>العشاء</strong> يختلفان: كلاهما مرتبط بالشفق، والشفق ظاهرة متدرّجة لا لحظة حادّة. ومن هنا تحديدًا يبدأ الاختلاف.</p>

<h2>معنى «زاوية الفجر» و«زاوية العشاء»</h2>
<p>لأن الشفق تدرّج، احتاج الفلكيون إلى عتبة قابلة للقياس. فاختيرت <strong>درجة انخفاض الشمس تحت الأفق</strong>.</p>
<p>حين نقول إن طريقةً تستخدم فجرًا عند <strong>18°</strong>، فالمعنى: احسب اللحظة التي يكون فيها مركز الشمس منخفضًا 18 درجة تحت الأفق قبل الشروق. وكلما كبرت الزاوية كانت الشمس أعمق تحت الأفق، أي أن الوقت <strong>أبكر</strong>. ولهذا يعطي فجر 19.5° وقتًا أبكر من فجر 15°.</p>
<p>وحجم الفارق ليس ثابتًا. عند خطوط العرض المتوسطة تساوي الدرجة الواحدة نحو <strong>خمس دقائق</strong> شتاءً، وقد تبلغ <strong>سبع دقائق</strong> قرب الانقلاب الصيفي، لأن الشمس تنزل تحت الأفق بميل أقلّ فتستغرق وقتًا أطول لتقطع الدرجة نفسها. هذا التفاوت الموسمي سبب رئيس لكون الفارق بين تطبيقين غير ثابت عبر السنة.</p>

<h2>الطرق المطبَّقة في هذا الموقع</h2>
<p>يطبّق الموقع سبع عشرة طريقة. كل رقم في الجدول هو ما تستخدمه الحسبة فعليًا:</p>
${T(`<table>
<thead><tr><th>الطريقة</th><th>الفجر</th><th>العشاء</th></tr></thead>
<tbody>
<tr><td>رابطة العالم الإسلامي (MWL)</td><td>18°</td><td>17°</td></tr>
<tr><td>أمريكا الشمالية (ISNA)</td><td>15°</td><td>15°</td></tr>
<tr><td>الهيئة المصرية العامة للمساحة</td><td>19.5°</td><td>17.5°</td></tr>
<tr><td>أم القرى — مكة المكرمة</td><td>18.5°</td><td>90 دقيقة بعد المغرب</td></tr>
<tr><td>جامعة العلوم الإسلامية — كراتشي</td><td>18°</td><td>18°</td></tr>
<tr><td>معهد الجيوفيزياء — طهران</td><td>17.7°</td><td>14° (ومغرب 4.5°)</td></tr>
<tr><td>المذهب الجعفري</td><td>16°</td><td>14° (ومغرب 4°)</td></tr>
<tr><td>دول الخليج</td><td>19.5°</td><td>90 دقيقة بعد المغرب</td></tr>
<tr><td>الكويت</td><td>18°</td><td>17.5°</td></tr>
<tr><td>قطر</td><td>18°</td><td>90 دقيقة بعد المغرب</td></tr>
<tr><td>سنغافورة</td><td>20°</td><td>18°</td></tr>
<tr><td>تركيا — ديانت</td><td>18°</td><td>17°</td></tr>
<tr><td>اتحاد المنظمات الإسلامية في فرنسا</td><td>12°</td><td>12°</td></tr>
<tr><td>روسيا</td><td>16°</td><td>15°</td></tr>
<tr><td>ماليزيا — جاكيم</td><td>20°</td><td>18°</td></tr>
<tr><td>إندونيسيا — وزارة الشؤون الدينية</td><td>20°</td><td>18°</td></tr>
<tr><td>المغرب</td><td>18°</td><td>17°</td></tr>
</tbody></table>`)}
<p>ولاحظ أن مدى الفجر يمتدّ من 12° إلى 20°. هذا ليس تفاوتًا في الدقة الحسابية، بل في <strong>العتبة المختارة</strong> — وهي مسألة اجتهادية لدى الجهة المصدِرة، لا مسألة برمجية.</p>

<h2>الفرق بين الزاوية والفاصل الزمني</h2>
<p>ثلاث طرق في الجدول لا تستخدم زاوية للعشاء: <strong>أم القرى</strong> و<strong>دول الخليج</strong> و<strong>قطر</strong>. هذه تضيف <strong>فاصلًا زمنيًا ثابتًا</strong> بعد المغرب.</p>
<p>خُذ مكة المكرمة على طريقة أم القرى — والأرقام أدناه من محرّك هذا الموقع:</p>
${T(`<table>
<thead><tr><th>التاريخ</th><th>المغرب</th><th>العشاء</th><th>الفاصل</th></tr></thead>
<tbody>
<tr><td>2026-01-15</td><td>17:59</td><td>19:29</td><td>90 دقيقة</td></tr>
<tr><td>2026-06-21</td><td>19:06</td><td>20:36</td><td>90 دقيقة</td></tr>
<tr><td>2026-09-23</td><td>18:16</td><td>19:46</td><td>90 دقيقة</td></tr>
<tr><td>2026-12-21</td><td>17:44</td><td>19:14</td><td>90 دقيقة</td></tr>
</tbody></table>`)}
<p>الفاصل ثابت تمامًا، بينما زاوية العشاء تعطي فاصلًا يتغيّر مع الفصول. في مكة يوم 21 يونيو 2026 يعطي عشاء رابطة العالم الإسلامي (17°) الساعة 20:26 بينما تعطي أم القرى 20:36 — فارق عشر دقائق. وفي 21 ديسمبر يتّسع الفارق إلى خمس عشرة دقيقة. هذا هو الفرق العملي بين «زاوية» و«فاصل».</p>
<p><strong>يطبّق هذا الموقع فاصل التسعين دقيقة بعد المغرب طوال السنة.</strong></p>

<h2>حين تضيف الجهة الرسمية دقائق</h2>
<p>بعض الجهات لا تنشر زاوية خامًا فحسب، بل جدولًا يتضمّن <strong>دقائق احتياط</strong> (تُسمّى «تمكين» في تركيا و«احتياط» في ماليزيا وإندونيسيا). فإن حسبت بالزاوية وحدها خالفت الجدول الرسمي بدقائق.</p>
<h3>تركيا</h3>
<p><strong>تركيا</strong> أوضح مثال موثَّق رسميًا. تنشر رئاسة الشؤون الدينية جدول تمكين معلنًا: سبع دقائق على الشروق، وخمس على الظهر، وأربع على العصر، وسبع على المغرب، ولا شيء على الإمساك والعشاء. ويطبّق هذا الموقع هذه القيم الخمس نفسها فوق زاويتي 18°/17°.</p>
<h3>ماليزيا</h3>
<p>وفي <strong>ماليزيا</strong>، تعتمد جاكيم 20° للفجر و18° للعشاء. ويطبّق TimesPrayers تعديلات دقائق خاصة به لمحاذاة الجداول؛ وهذه التعديلات ليست أرقامًا رسمية منسوبة إلى جاكيم.</p>
<h3>إندونيسيا</h3>
<p>وفي <strong>إندونيسيا</strong>، يستخدم الموقع زاويتي 20° و18° المطابقتين لمعايير وزارة الشؤون الدينية، <strong>ولا يطبّق أي احتياط دقائق منفصل</strong>. وتصف مواد الوزارة إضافة دقائق احتياط عند إعداد جداول الصلاة، وهو ما لا يجري تطبيقه هنا.</p>
<h3>المغرب</h3>
<p>وفي <strong>المغرب</strong>، يستخدم الموقع زاوية فجر 18° مع إزاحة ثابتة ست دقائق نحو الأبكر. وقد قارنّا الناتج بجدول وزارة الأوقاف والشؤون الإسلامية المنشور للرباط في أربعة تواريخ من أغسطس وسبتمبر 2026، فجاء فجرنا ضمن <strong>دقيقة إلى دقيقتين</strong> من المنشور في العيّنة المفحوصة. ولا ننسب إلى الوزارة زاويةً حسابية بعينها.</p>

<h2>حساب العصر</h2>
<p>للعصر تعريفان متداولان، وكلاهما مبني على طول ظل الشيء:</p>
<ul>
<li><strong>عامل ظل 1</strong>: يدخل العصر حين يصير ظل الشيء مثله، زائدًا ظلّ الزوال. وهو الافتراضي هنا.</li>
<li><strong>عامل ظل 2</strong>: يدخل حين يصير ظل الشيء مثليه، زائدًا ظلّ الزوال.</li>
</ul>
<p>والفارق كبير لا هامشي. في القاهرة يوم 21 مارس 2026، على طريقة رابطة العالم الإسلامي، يعطي عامل الظل 1 عصرًا عند <strong>15:30</strong>، ويعطي عامل الظل 2 عصرًا عند <strong>16:24</strong> — أربع وخمسون دقيقة.</p>
<p>يدعم الموقع كلا التعريفين، ويستخدم عامل الظل 1 افتراضيًا. أما اختيار التعريف المناسب دينيًا فيرجع إلى المذهب أو الجهة التي يتبعها المستخدم.</p>

<h2>كيف تُختار الطريقة تلقائيًا</h2>
<p>حين تفتح صفحة مدينة، يختار الموقع الطريقة <strong>بحسب دولة تلك المدينة</strong>: مصر وليبيا على الطريقة المصرية، وفرنسا على طريقة الاتحاد الفرنسي، وتركيا على ديانت، وإيران على طهران، وباكستان والهند وبنغلاديش وأفغانستان على كراتشي، وماليزيا على جاكيم، وإندونيسيا على وزارة شؤونها الدينية، وسنغافورة وبروناي على الطريقة الإقليمية. وأي دولة غير مخرَّطة تستخدم MWL كطريقة احتياطية في التطبيق الحالي.</p>

<h2>كيف ينعكس ذلك على الوقت النهائي</h2>
<p>مثال واحد يجمع ما سبق. القاهرة (30.0444° شمالًا، 31.2357° شرقًا)، 21 مارس 2026، بتوقيت UTC+2، بحساب هذا الموقع:</p>
${T(`<table>
<thead><tr><th>الطريقة</th><th>الفجر</th><th>الشروق</th><th>الظهر</th><th>العصر</th><th>المغرب</th><th>العشاء</th></tr></thead>
<tbody>
<tr><td>رابطة العالم الإسلامي</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:22</td></tr>
<tr><td>ISNA</td><td>04:52</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:13</td></tr>
<tr><td>الهيئة المصرية</td><td>04:31</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:25</td></tr>
<tr><td>أم القرى</td><td>04:36</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:37</td></tr>
<tr><td>كراتشي</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:27</td></tr>
</tbody></table>`)}
<p><strong>الشروق والظهر والمغرب متطابقة في الخمس</strong> — لأن تعريفها هندسي لا يعتمد على عتبة شفق مختارة. والاختلاف كله محصور في الفجر والعشاء: واحد وعشرون دقيقة بين أضيق زاوية فجر (ISNA 15°) وأوسعها (المصرية 19.5°). أما العصر فمتطابق هنا لأن الطرق الخمس تشترك في العامل الافتراضي نفسه.</p>

<h2>العروض العالية</h2>
<p>كلما ابتعدت شمالًا أو جنوبًا، جاء يوم لا تنزل فيه الشمس إلى الزاوية المطلوبة أصلًا؛ فلا يوجد وقت فلكي للفجر أو العشاء ذلك اليوم. عندها تُستخدم قاعدة تقدير تقسّم الليل. ويطبّق هذا الموقع ثلاث قواعد شائعة، وقاعدة رابعة خاصة به في ألمانيا تختار بين الحساب الحقيقي والتقدير بحسب ما إذا كانت الزاوية تُبلَغ فعلًا وبهامش كافٍ. وتفصيل ذلك في <a href="/guides/why-prayer-times-differ">دليل مستقل</a>.</p>

<h2>كيف تختار ما يناسبك</h2>
<p>القاعدة العملية بسيطة: <strong>اتبع ما يعتمده مسجدك أو الجهة الرسمية في بلدك.</strong> فالغاية أن تصلي مع الناس، لا أن تطابق رقمًا. ولهذا يختار الموقع افتراضًا الطريقة المرتبطة بدولة المدينة.</p>
<p>وإن أردت المقارنة بمصدر آخر، فقارن بإنصاف: التاريخ نفسه، والإحداثيات نفسها، والطريقة نفسها، ومذهب العصر نفسه. فأكثر ما يبدو خطأً هو في الحقيقة إعدادان مختلفان.</p>
`,
sources: `
<h2>المصادر</h2>
<p class="guide-sources-note">الزوايا وتعديلات الدقائق أدناه منسوبة إلى الجهات التي تنشرها. المقارنات الرقمية في هذه الصفحة محسوبة بمحرّك هذا الموقع بالتواريخ والإحداثيات المذكورة في كل مثال.</p>
<ul>
<li>رئاسة الشؤون الدينية التركية (ديانت) — جدول التمكين الرسمي: <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>وزارة الأوقاف والشؤون الإسلامية بالمملكة المغربية — جدول الرباط المنشور: <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>وزارة الشؤون الدينية بجمهورية إندونيسيا (Kemenag) — معايير جدول الصلاة</li>
<li>جامعة أم القرى بمكة المكرمة — معيار الحساب المنشور</li>
<li>رابطة العالم الإسلامي · الهيئة المصرية العامة للمساحة · جامعة العلوم الإسلامية بكراتشي · ISNA · اتحاد المنظمات الإسلامية في فرنسا · جاكيم ماليزيا</li>
<li>جدول معاملات مقارن: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
<p class="guide-sources-note"><strong>تنبيه:</strong> بعض الجهات تنشر جداول تتضمّن دقائق احتياط مدرَجة سلفًا. وحيث يختلف ما نطبّقه عن الزاوية الرسمية، ذُكر ذلك صراحةً في متن الصفحة.</p>
`,
related: [
  { href: '/guides/why-prayer-times-differ', label: 'لماذا تختلف مواقيت الصلاة بين التطبيقات والمواقع؟' },
  { href: '/guides/how-qibla-direction-is-calculated', label: 'كيف يتم حساب اتجاه القبلة؟' },
  { href: '/prayer-times-worldwide', label: 'مواقيت الصلاة في دول العالم' },
],
},

en: {
h1: 'Prayer Time Calculation Methods and Angles',
body: `
<p class="guide-intro">Open two prayer apps in the same city and Fajr can differ by fifteen minutes. That usually isn't a bug. It usually means each app is answering a slightly different question: <strong>when do we say Fajr has begun?</strong> This page explains how that question is turned into arithmetic, and exactly what this site does.</p>

<h2>What is actually being computed</h2>
<p>Prayer times aren't a stored timetable. They're derived from <strong>the sun's position relative to your horizon</strong>. The calculation needs three inputs: latitude, longitude, and the date. From those it derives the sun's <strong>declination</strong> for that day and the <strong>equation of time</strong>, then solves for the moment the sun reaches a given altitude.</p>
<p>Some times have a direct geometric definition: <strong>Dhuhr</strong> is when the sun crosses the meridian; <strong>sunrise</strong> and <strong>Maghrib</strong> are when the sun's disc meets the horizon. <strong>Fajr</strong> and <strong>Isha</strong> are different. Both are tied to twilight, and twilight is a gradual fade, not a sharp instant. That is precisely where methods diverge.</p>

<h2>What a "Fajr angle" means</h2>
<p>Because twilight is gradual, a measurable threshold was needed. The one adopted is <strong>how far the sun has sunk below the horizon</strong>.</p>
<p>When a method uses a Fajr angle of <strong>18°</strong>, it means: find the moment the sun's centre sits 18 degrees below the horizon before sunrise. A larger angle puts the sun deeper down, so the time comes <strong>earlier</strong>. A 19.5° Fajr is earlier than a 15° Fajr.</p>
<p>The size of that gap isn't constant. At mid-latitudes one degree is worth roughly <strong>five minutes</strong> in winter and can reach <strong>seven minutes</strong> near the summer solstice, because the sun descends at a shallower angle and takes longer to cross the same degree. This seasonal variation is a major reason the difference between two apps isn't stable across the year.</p>

<h2>The methods this site implements</h2>
<p>Seventeen methods are implemented. Every figure below is what the calculation actually uses:</p>
${T(`<table>
<thead><tr><th>Method</th><th>Fajr</th><th>Isha</th></tr></thead>
<tbody>
<tr><td>Muslim World League (MWL)</td><td>18°</td><td>17°</td></tr>
<tr><td>ISNA (North America)</td><td>15°</td><td>15°</td></tr>
<tr><td>Egyptian General Authority of Survey</td><td>19.5°</td><td>17.5°</td></tr>
<tr><td>Umm al-Qura, Makkah</td><td>18.5°</td><td>90 minutes after Maghrib</td></tr>
<tr><td>University of Islamic Sciences, Karachi</td><td>18°</td><td>18°</td></tr>
<tr><td>Institute of Geophysics, Tehran</td><td>17.7°</td><td>14° (Maghrib 4.5°)</td></tr>
<tr><td>Jafari</td><td>16°</td><td>14° (Maghrib 4°)</td></tr>
<tr><td>Gulf Region</td><td>19.5°</td><td>90 minutes after Maghrib</td></tr>
<tr><td>Kuwait</td><td>18°</td><td>17.5°</td></tr>
<tr><td>Qatar</td><td>18°</td><td>90 minutes after Maghrib</td></tr>
<tr><td>Singapore</td><td>20°</td><td>18°</td></tr>
<tr><td>Turkey — Diyanet</td><td>18°</td><td>17°</td></tr>
<tr><td>Union of Islamic Organisations of France</td><td>12°</td><td>12°</td></tr>
<tr><td>Russia</td><td>16°</td><td>15°</td></tr>
<tr><td>Malaysia — JAKIM</td><td>20°</td><td>18°</td></tr>
<tr><td>Indonesia — Ministry of Religious Affairs</td><td>20°</td><td>18°</td></tr>
<tr><td>Morocco</td><td>18°</td><td>17°</td></tr>
</tbody></table>`)}
<p>Fajr ranges from 12° to 20° across that table. That spread isn't a difference in computational accuracy — it's a difference in <strong>the threshold each authority adopted</strong>, which is a scholarly and institutional judgement, not a programming one.</p>

<h2>Angle versus fixed interval</h2>
<p>Three methods above don't use an angle for Isha at all: <strong>Umm al-Qura</strong>, <strong>Gulf Region</strong>, and <strong>Qatar</strong>. They add a <strong>fixed interval</strong> after Maghrib.</p>
<p>Here is Makkah on the Umm al-Qura method, computed by this site's engine:</p>
${T(`<table>
<thead><tr><th>Date</th><th>Maghrib</th><th>Isha</th><th>Interval</th></tr></thead>
<tbody>
<tr><td>2026-01-15</td><td>17:59</td><td>19:29</td><td>90 min</td></tr>
<tr><td>2026-06-21</td><td>19:06</td><td>20:36</td><td>90 min</td></tr>
<tr><td>2026-09-23</td><td>18:16</td><td>19:46</td><td>90 min</td></tr>
<tr><td>2026-12-21</td><td>17:44</td><td>19:14</td><td>90 min</td></tr>
</tbody></table>`)}
<p>The interval never moves, while an angle-based Isha produces an interval that shifts with the seasons. In Makkah on 21 June 2026, MWL's 17° Isha falls at 20:26 while Umm al-Qura gives 20:36 — ten minutes apart. On 21 December the gap widens to fifteen minutes. That is the practical difference between an angle and an interval.</p>
<p><strong>TimesPrayers currently applies a fixed 90-minute interval after Maghrib throughout the year.</strong></p>

<h2>When the authority adds minutes</h2>
<p>Some authorities don't publish only a raw angle. They publish a table that already contains <strong>precautionary minutes</strong> — <em>temkin</em> in Turkey, <em>ihtiyat</em> in Malaysia and Indonesia. Compute the angle alone and you'll miss the official table by several minutes.</p>
<h3>Turkey</h3>
<p><strong>Turkey</strong> is the clearest officially documented case. The Directorate of Religious Affairs publishes an explicit temkin table: seven minutes on sunrise, five on Dhuhr, four on Asr, seven on Maghrib, and none on imsak or Isha. This site applies those same five values on top of the 18°/17° angles.</p>
<h3>Malaysia</h3>
<p>In <strong>Malaysia</strong>, JAKIM uses 20° for Fajr and 18° for Isha. TimesPrayers applies its own minute adjustments to align with published schedules; these adjustments are not official figures attributed to JAKIM.</p>
<h3>Indonesia</h3>
<p>In <strong>Indonesia</strong>, this site uses the 20° and 18° angles matching the Ministry of Religious Affairs criteria, and <strong>applies no separate ihtiyath minute adjustment</strong>. Kemenag materials describe precautionary minute additions in the preparation of prayer schedules; that is not applied here.</p>
<h3>Morocco</h3>
<p>In <strong>Morocco</strong>, this site uses an 18° Fajr with a fixed six-minute shift earlier. We compared the result against the published Rabat schedule of the Ministry of Habous and Islamic Affairs on four dates in August–September 2026, and our Fajr landed within <strong>one to two minutes</strong> of the published time in the sample examined. We do not attribute a specific calculation angle to the ministry.</p>

<h2>How Asr is computed</h2>
<p>Asr has two widely used definitions, both based on shadow length:</p>
<ul>
<li><strong>Shadow factor 1</strong> — Asr begins when an object's shadow equals its own length, plus the shadow at noon. This is the default here.</li>
<li><strong>Shadow factor 2</strong> — Asr begins when the shadow reaches twice the object's length, plus the noon shadow.</li>
</ul>
<p>The difference is substantial, not marginal. In Cairo on 21 March 2026 under MWL, factor 1 gives Asr at <strong>15:30</strong> and factor 2 gives <strong>16:24</strong> — fifty-four minutes apart.</p>
<p>The site supports both definitions and uses shadow factor 1 by default. Which definition a user follows depends on the school or authority they follow.</p>

<h2>How the method is chosen automatically</h2>
<p>When you open a city page, the site picks the method <strong>by that city's country</strong>: Egypt and Libya use the Egyptian method, France the French union's, Turkey Diyanet, Iran Tehran, Pakistan/India/Bangladesh/Afghanistan Karachi, Malaysia JAKIM, Indonesia its Ministry of Religious Affairs, Singapore and Brunei the regional method. Any country not mapped uses MWL as the fallback method in the current implementation.</p>

<h2>What this looks like in the final times</h2>
<p>One example ties it together. Cairo (30.0444°N, 31.2357°E), 21 March 2026, UTC+2, computed by this site:</p>
${T(`<table>
<thead><tr><th>Method</th><th>Fajr</th><th>Sunrise</th><th>Dhuhr</th><th>Asr</th><th>Maghrib</th><th>Isha</th></tr></thead>
<tbody>
<tr><td>MWL</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:22</td></tr>
<tr><td>ISNA</td><td>04:52</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:13</td></tr>
<tr><td>Egyptian</td><td>04:31</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:25</td></tr>
<tr><td>Umm al-Qura</td><td>04:36</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:37</td></tr>
<tr><td>Karachi</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:27</td></tr>
</tbody></table>`)}
<p><strong>Sunrise, Dhuhr and Maghrib are identical across all five</strong> — their definitions are geometric and don't depend on a chosen twilight threshold. The entire spread sits in Fajr and Isha: twenty-one minutes between the narrowest Fajr angle (ISNA 15°) and the widest (Egyptian 19.5°). Asr matches here because all five share the same default shadow factor.</p>

<h2>High latitudes</h2>
<p>The further you go north or south, the sooner you reach a day when the sun never sinks to the required angle at all — so there is no astronomical Fajr or Isha that day. A night-splitting estimation rule is used instead. This site implements three common rules, plus a fourth of its own used for German locations that chooses between the real calculation and the estimate depending on whether the angle is genuinely reached with enough margin. A <a href="/en/guides/why-prayer-times-differ">separate guide</a> covers this in detail.</p>

<h2>Choosing what suits you</h2>
<p>The practical rule is simple: <strong>follow what your mosque or your country's authority uses.</strong> The point is to pray with the congregation, not to match a number. That is why the site defaults to the method associated with the city's country.</p>
<p>If you compare against another source, compare fairly: same date, same coordinates, same method, same Asr definition. Most apparent errors turn out to be two different settings.</p>
`,
sources: `
<h2>Sources</h2>
<p class="guide-sources-note">Angles and minute adjustments below are attributed to the bodies that publish them. Every numeric comparison on this page was computed by this site's engine using the dates and coordinates named in each example.</p>
<ul>
<li>Diyanet İşleri Başkanlığı (Turkey) — official temkin table: <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Ministry of Habous and Islamic Affairs, Morocco — published Rabat schedule: <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Ministry of Religious Affairs of the Republic of Indonesia (Kemenag) — prayer schedule criteria</li>
<li>Umm al-Qura University, Makkah — published calculation standard</li>
<li>Muslim World League · Egyptian General Authority of Survey · University of Islamic Sciences, Karachi · ISNA · Union of Islamic Organisations of France · JAKIM Malaysia</li>
<li>Comparative parameter table: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
<p class="guide-sources-note"><strong>Note:</strong> some authorities publish tables with precautionary minutes already included. Where what we apply differs from the official angle, we say so in the body of the page.</p>
`,
related: [
  { href: '/en/guides/why-prayer-times-differ', label: 'Why Prayer Times Differ Between Apps and Websites' },
  { href: '/en/guides/how-qibla-direction-is-calculated', label: 'How Qibla Direction Is Calculated' },
  { href: '/en/prayer-times-worldwide', label: 'Prayer Times Worldwide' },
],
},
},

// ═══════════════════════════════════════════════════════════════════════════════
// GUIDE 2 — Why prayer times differ between apps and websites
// ═══════════════════════════════════════════════════════════════════════════════
'why-prayer-times-differ': {

ar: {
h1: 'لماذا تختلف مواقيت الصلاة بين التطبيقات والمواقع؟',
body: `
<p class="guide-intro">فتحتَ تطبيقًا فأذّن الفجر، ثم نظرتَ إلى موقع آخر فوجدته يتأخّر اثنتي عشرة دقيقة. أيّهما مخطئ؟ في الغالب: لا أحد. الاختلاف ليس عطلًا في الحساب، بل نتيجة إعدادات مختلفة تُدخَل في المعادلة نفسها. هذه الصفحة تعدّد خمسة أسباب شائعة لاختلاف مواقيت الصلاة، مرتَّبة من الأكبر أثرًا إلى الأصغر.</p>

<h2>السبب الأول: اختلاف الزاوية</h2>
<p>الشروق والظهر والمغرب لها تعريف هندسي مباشر لا خلاف عليه. أما الفجر والعشاء فمرتبطان بالشفق، والشفق تدرّج لا لحظة. لذلك اختارت كل جهة <strong>عتبة</strong>: درجة انخفاض الشمس تحت الأفق.</p>
<p>فحين يستخدم مصدرٌ فجرًا عند 15° ويستخدم آخر 19.5°، فالفارق بينهما في القاهرة يوم 21 مارس 2026 يبلغ <strong>واحدًا وعشرين دقيقة</strong>. لم يخطئ أحدهما؛ كلٌّ حسب عتبته.</p>
<p>وهذا الفارق <strong>لا يبقى ثابتًا</strong>: عند خطوط العرض المتوسطة تساوي الدرجة الواحدة نحو خمس دقائق شتاءً، وقد تبلغ سبعًا قرب الانقلاب الصيفي. فإن قارنتَ في يناير ثم أعدت المقارنة في يونيو، تغيّر الفارق — وهذا وحده يربك كثيرين. وتفصيل الطرق وزواياها في <a href="/guides/prayer-time-calculation-methods">دليل طرق الحساب</a>.</p>

<h2>السبب الثاني: دقائق تضيفها الجهة الرسمية</h2>
<p>بعض الجهات لا تنشر ناتج الزاوية الخام، بل جدولًا يضيف عليه <strong>دقائق احتياط</strong>.</p>
<p>أوضح مثال موثَّق رسميًا هو <strong>تركيا</strong>: تنشر رئاسة الشؤون الدينية جدول «تمكين» معلنًا — سبع دقائق على الشروق، وخمس على الظهر، وأربع على العصر، وسبع على المغرب، ولا شيء على الإمساك والعشاء.</p>
<p>فلو حسب مصدران الزاوية نفسها تمامًا، وطبّق أحدهما هذا الجدول ولم يطبّقه الآخر، لاختلف الشروق بينهما سبع دقائق <strong>مع أن الحساب الفلكي متطابق</strong>. وهذا سبب شائع لفارق «صغير وثابت» يلاحظه الناس.</p>

<h2>السبب الثالث: الإحداثيات</h2>
<p>المواقيت تُحسب لنقطة، لا لمدينة. فإن وضعك مصدران في نقطتين مختلفتين اختلف الوقت.</p>
<p>لكن حجم الأثر يُساء تقديره كثيرًا. قِسنا القاهرة يوم 27 أغسطس 2026 بالطريقة المصرية:</p>
${T(`<table>
<thead><tr><th>الموقع</th><th>الفجر</th><th>الظهر</th><th>المغرب</th></tr></thead>
<tbody>
<tr><td>وسط القاهرة</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>حلوان (جنوبًا)</td><td>03:58</td><td>11:56</td><td>18:23</td></tr>
<tr><td>شبرا الخيمة (شمالًا)</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>السادس من أكتوبر (غربًا)</td><td>04:00</td><td>11:58</td><td>18:25</td></tr>
</tbody></table>`)}
<p>الفارق داخل المدينة الواحدة <strong>دقيقة واحدة</strong> رغم نحو اثنين وثلاثين كيلومترًا. فالإحداثيات ليست تفسيرًا مقنعًا لفارق عشر دقائق.</p>
<p>الأثر الكبير يظهر حين يتّسع الفارق الجغرافي داخل <strong>المنطقة الزمنية نفسها</strong>. إسبانيا كلها على توقيت واحد صيفًا، ومع ذلك — بحساب رابطة العالم الإسلامي ليوم 27 أغسطس 2026:</p>
${T(`<table>
<thead><tr><th>المدينة</th><th>خط الطول</th><th>المغرب</th></tr></thead>
<tbody>
<tr><td>برشلونة</td><td>2.17° شرقًا</td><td>20:33</td></tr>
<tr><td>مدريد</td><td>3.70° غربًا</td><td>20:55</td></tr>
<tr><td>لاكورونيا</td><td>8.41° غربًا</td><td>21:18</td></tr>
</tbody></table>`)}
<p><strong>خمس وأربعون دقيقة</strong> بين طرفي البلد، والساعة واحدة. فإن اعتمد مصدرٌ إحداثيات مدينتك واعتمد آخر إحداثيات العاصمة أو مركز البلد، فهذا وحده يكفي لفارق كبير.</p>

<h2>السبب الرابع: المنطقة الزمنية والتوقيت الصيفي</h2>
<p>اللحظة الفلكية واحدة، لكن الساعة التي تُعرَض بها تعتمد على الإزاحة. ولندن مثال نظيف:</p>
${T(`<table>
<thead><tr><th>الحالة</th><th>التاريخ</th><th>المغرب</th></tr></thead>
<tbody>
<tr><td>شتاءً (UTC+0)</td><td>2026-01-15</td><td>16:21</td></tr>
<tr><td>صيفًا (UTC+1)</td><td>2026-06-21</td><td>21:22</td></tr>
<tr><td>صيفًا لكن بإزاحة الشتاء</td><td>2026-06-21</td><td>20:22</td></tr>
</tbody></table>`)}
<p>الصفّان الأخيران <strong>للحظة الفلكية نفسها</strong>. والفارق ساعة كاملة سببه الإزاحة وحدها. وأي فارق يساوي ساعة بالضبط يكاد يكون دائمًا مسألة توقيت صيفي أو منطقة زمنية، لا مسألة حساب.</p>

<h2>السبب الخامس: التقريب</h2>
<p>المواقيت تُعرض بالدقيقة، والحساب يعطي قيمة أدقّ من ذلك. ويقرّب هذا الموقع إلى <strong>أقرب دقيقة</strong>؛ بينما قد يكتفي مصدر آخر بـ<strong>بتر</strong> الثواني. والنتيجة قد تختلف دقيقةً كاملة على القيمة نفسها.</p>
<p>القاهرة، 27 أغسطس 2026، الطريقة المصرية:</p>
${T(`<table>
<thead><tr><th>الوقت</th><th>القيمة المحسوبة</th><th>تقريبًا لأقرب دقيقة</th><th>بترًا للثواني</th></tr></thead>
<tbody>
<tr><td>الظهر</td><td>11:56:37</td><td><strong>11:57</strong></td><td>11:56</td></tr>
<tr><td>العصر</td><td>15:31:32</td><td><strong>15:32</strong></td><td>15:31</td></tr>
<tr><td>المغرب</td><td>18:23:37</td><td><strong>18:24</strong></td><td>18:23</td></tr>
</tbody></table>`)}
<p>وفي مسح ثلاثين وقتًا عبر خمسة أيام، اختلفت السياستان في <strong>ستة عشر</strong> منها — نحو نصف الحالات، لأن الثواني تتجاوز الثلاثين قرابة نصف الوقت. الفارق دقيقة واحدة، ولا علاقة له بالفلك: السياسة وحدها.</p>

<h2>الحالة الخاصة: خطوط العرض العالية</h2>
<p>كلما ابتعدتَ شمالًا أو جنوبًا، جاء يوم لا تنزل فيه الشمس إلى الزاوية المطلوبة أصلًا. فلا يوجد فجر فلكي ولا عشاء فلكي ذلك اليوم — لا لأن الحساب فشل، بل لأن الحدث لم يقع.</p>
<h3>القواعد الثلاث</h3>
<p>عندها تُستخدم قاعدة تقسّم الليل بين المغرب والشروق. والقواعد الثلاث المتعارف عليها:</p>
<ul>
<li><strong>منتصف الليل</strong> — يُقسَم الليل نصفين.</li>
<li><strong>سُبع الليل</strong> — يُقسَم سبعة أجزاء؛ العشاء بعد أوّلها والفجر عند آخرها.</li>
<li><strong>القائمة على الزاوية</strong> — يُقسَم الليل بنسبة الزاوية إلى ستّين.</li>
</ul>
<p>وهي <strong>ليست تفصيلًا تقنيًا صغيرًا</strong>. ستوكهولم (59.33° شمالًا) بحساب رابطة العالم الإسلامي:</p>
${T(`<table>
<thead><tr><th>التاريخ</th><th>القائمة على الزاوية</th><th>سُبع الليل</th><th>منتصف الليل</th><th>أوسع فارق</th></tr></thead>
<tbody>
<tr><td>2026-05-20</td><td>02:05</td><td>03:07</td><td>00:45</td><td><strong>142 دقيقة</strong></td></tr>
<tr><td>2026-06-21</td><td>01:54</td><td>02:45</td><td>00:50</td><td>115 دقيقة</td></tr>
<tr><td>2026-07-15</td><td>02:07</td><td>03:05</td><td>00:54</td><td>131 دقيقة</td></tr>
<tr><td>2026-12-21</td><td>07:02</td><td>07:10</td><td>07:02</td><td>8 دقائق</td></tr>
</tbody></table>`)}
<p>في مايو يبلغ التباعد <strong>ساعتين وأكثر</strong>؛ وفي ديسمبر يكاد يختفي. فإن كنتَ في الشمال ورأيتَ فارقًا هائلًا بين تطبيقين، فالسبب على الأرجح قاعدة مختلفة لا زاوية مختلفة.</p>
<p>يوثّق PrayTimes الطريقة القائمة على الزاوية كخيار موصى به ضمن المكتبة، بينما يستخدم TimesPrayers قاعدة AngleBased افتراضيًا في إعداداته الحالية.</p>
<h3>قاعدة خاصة بالموقع في ألمانيا</h3>
<p>في ألمانيا، يطبّق TimesPrayers قاعدة هجينة خاصة به تسأل أولًا: <strong>هل تبلغ الشمس الزاوية فعلًا اليوم، وبهامش كافٍ؟</strong> فإن كانت تبلغها استُخدم الحساب الفلكي الحقيقي؛ وإلا استُخدم التقدير.</p>
<p>والفرق حقيقي لا نظري. فرانكفورت يوم 21 مايو 2026 بحساب رابطة العالم الإسلامي: القاعدة الهجينة تعطي فجرًا 02:33 بينما تعطي القاعدة القائمة على الزاوية 03:02 — تسعًا وعشرين دقيقة. وفي معظم أيام السنة تتطابق القاعدتان تمامًا؛ والتباعد محصور في أسابيع أواخر الربيع والصيف حيث يكون السؤال ذا معنى.</p>

<h2>مذهب العصر سبب مستقل تمامًا</h2>
<p>قد يتّفق مصدران في كل ما سبق ويختلفان في العصر وحده، لأن للعصر تعريفين: أن يصير ظل الشيء مثله، أو مثليه.</p>
<p>والفارق ليس هامشيًا. القاهرة يوم 21 مارس 2026 بحساب رابطة العالم الإسلامي: التعريف الأول يعطي 15:30، والثاني 16:24 — <strong>أربع وخمسون دقيقة</strong>. فإن كان اختلافك في العصر وحده وبهذا الحجم، فالسبب هذا التعريف بالتأكيد. ويستخدم الموقع عامل الظل 1 افتراضيًا، ويدعم الآخر.</p>

<h2>كيف تقارن مصدرين بإنصاف</h2>
<p>قبل أن تحكم بأن أحدهما مخطئ، وحِّد الخمسة:</p>
<ol>
<li><strong>التاريخ نفسه</strong> — الوقت يتحرّك يوميًا.</li>
<li><strong>الإحداثيات نفسها</strong> — لا «القاهرة» عند أحدهما و«وسط القاهرة» عند الآخر.</li>
<li><strong>الطريقة نفسها</strong> — بزاويتيها معًا.</li>
<li><strong>مذهب العصر نفسه</strong>.</li>
<li><strong>الإزاحة الزمنية نفسها</strong> — ومعها التوقيت الصيفي.</li>
</ol>
<p>فإن اتّحدت الخمسة وبقي فارق دقيقة أو دقيقتين، فهو تقريب. وإن بقي فارق ساعة، فهو منطقة زمنية. وإن بقي فارق ساعتين وأنت في الشمال، فهي قاعدة العروض العالية.</p>
<p>وتبقى القاعدة العملية: <strong>اتبع ما يعتمده مسجدك أو الجهة الرسمية في بلدك.</strong></p>
`,
sources: `
<h2>المصادر</h2>
<p class="guide-sources-note">القياسات في هذه الصفحة محسوبة بمحرّك هذا الموقع بالتواريخ والإحداثيات المذكورة في كل جدول.</p>
<ul>
<li>تعريفات قواعد العروض العالية: توثيق Pray Times — <a href="https://praytimes.org/calculation" rel="nofollow noopener" target="_blank">praytimes.org/calculation</a></li>
<li>جدول التمكين الرسمي: رئاسة الشؤون الدينية التركية — <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>جدول الرباط المنشور: وزارة الأوقاف والشؤون الإسلامية — <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>جدول معاملات مقارن: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
`,
related: [
  { href: '/guides/prayer-time-calculation-methods', label: 'طرق حساب مواقيت الصلاة وزوايا الفجر والعشاء' },
  { href: '/guides/how-qibla-direction-is-calculated', label: 'كيف يتم حساب اتجاه القبلة؟' },
],
},

en: {
h1: 'Why Prayer Times Differ Between Apps and Websites',
body: `
<p class="guide-intro">You open one app and Fajr has been called; you check another site and it's twelve minutes later. Which one is wrong? Usually neither. The difference isn't a broken calculation — it's different settings feeding the same equation. This page lists five common reasons prayer times differ, ordered from largest effect to smallest.</p>

<h2>Cause one: a different angle</h2>
<p>Sunrise, Dhuhr and Maghrib have direct geometric definitions that nobody disputes. Fajr and Isha are tied to twilight, and twilight is a gradual fade rather than an instant. So each authority picked a <strong>threshold</strong>: how far the sun has sunk below the horizon.</p>
<p>When one source uses a 15° Fajr and another uses 19.5°, the gap between them in Cairo on 21 March 2026 is <strong>twenty-one minutes</strong>. Neither is wrong; each is applying its own threshold.</p>
<p>And that gap <strong>doesn't stay fixed</strong>. At mid-latitudes one degree is worth about five minutes in winter and can reach seven near the summer solstice. Compare in January, compare again in June, and the difference has changed — which by itself confuses a lot of people. The methods and their angles are covered in the <a href="/en/guides/prayer-time-calculation-methods">calculation methods guide</a>.</p>

<h2>Cause two: minutes the authority adds</h2>
<p>Some authorities don't publish the raw angle result. They publish a table with <strong>precautionary minutes</strong> added.</p>
<p>The clearest officially documented case is <strong>Turkey</strong>. The Directorate of Religious Affairs publishes an explicit <em>temkin</em> table: seven minutes on sunrise, five on Dhuhr, four on Asr, seven on Maghrib, and none on imsak or Isha.</p>
<p>So if two sources compute exactly the same angle, and one applies that table while the other doesn't, sunrise will differ by seven minutes <strong>even though the astronomy is identical</strong>. This is a common source of a small, stubbornly constant offset.</p>

<h2>Cause three: coordinates</h2>
<p>Prayer times are computed for a point, not a city. If two sources place you at different points, the times differ.</p>
<p>But the size of this effect is widely overestimated. We measured Cairo on 27 August 2026 using the Egyptian method:</p>
${T(`<table>
<thead><tr><th>Location</th><th>Fajr</th><th>Dhuhr</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Central Cairo</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>Helwan (south)</td><td>03:58</td><td>11:56</td><td>18:23</td></tr>
<tr><td>Shubra El Kheima (north)</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>6th of October (west)</td><td>04:00</td><td>11:58</td><td>18:25</td></tr>
</tbody></table>`)}
<p>Across roughly thirty-two kilometres, the spread is <strong>one minute</strong>. Coordinates are not a convincing explanation for a ten-minute difference.</p>
<p>The large effect appears when the geographic spread widens <strong>inside a single time zone</strong>. All of Spain shares one clock in summer, yet — computed with MWL for 27 August 2026:</p>
${T(`<table>
<thead><tr><th>City</th><th>Longitude</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Barcelona</td><td>2.17° E</td><td>20:33</td></tr>
<tr><td>Madrid</td><td>3.70° W</td><td>20:55</td></tr>
<tr><td>A Coruña</td><td>8.41° W</td><td>21:18</td></tr>
</tbody></table>`)}
<p><strong>Forty-five minutes</strong> between the two ends of one country on one clock. If one source uses your city's coordinates and another falls back to the capital or a country centroid, that alone produces a large gap.</p>

<h2>Cause four: time zone and daylight saving</h2>
<p>The astronomical moment is the same; the clock it's displayed on depends on the offset. London makes this clean:</p>
${T(`<table>
<thead><tr><th>Case</th><th>Date</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Winter (UTC+0)</td><td>2026-01-15</td><td>16:21</td></tr>
<tr><td>Summer (UTC+1)</td><td>2026-06-21</td><td>21:22</td></tr>
<tr><td>Summer but with the winter offset</td><td>2026-06-21</td><td>20:22</td></tr>
</tbody></table>`)}
<p>The last two rows are <strong>the same astronomical moment</strong>. The full hour between them comes purely from the offset. A difference of exactly one hour is almost always a time zone or DST issue, not a calculation one.</p>

<h2>Cause five: rounding</h2>
<p>Times are displayed to the minute; the calculation produces a more precise value. This site rounds to the <strong>nearest minute</strong>, while another source may simply <strong>truncate</strong> the seconds. The result can differ by a full minute on the same underlying value.</p>
<p>Cairo, 27 August 2026, Egyptian method:</p>
${T(`<table>
<thead><tr><th>Time</th><th>Computed value</th><th>Rounded to nearest minute</th><th>Truncated</th></tr></thead>
<tbody>
<tr><td>Dhuhr</td><td>11:56:37</td><td><strong>11:57</strong></td><td>11:56</td></tr>
<tr><td>Asr</td><td>15:31:32</td><td><strong>15:32</strong></td><td>15:31</td></tr>
<tr><td>Maghrib</td><td>18:23:37</td><td><strong>18:24</strong></td><td>18:23</td></tr>
</tbody></table>`)}
<p>Across thirty times over five days, the two policies disagreed on <strong>sixteen</strong> of them — about half, because the seconds exceed thirty roughly half the time. The gap is one minute and has nothing to do with astronomy: it's the policy alone.</p>

<h2>The special case: high latitudes</h2>
<p>The further north or south you go, the sooner you reach a day when the sun never sinks to the required angle at all. There is no astronomical Fajr or Isha that day — not because the calculation failed, but because the event didn't occur.</p>
<h3>The three rules</h3>
<p>A rule that divides the night between Maghrib and sunrise is used instead. The three conventional ones are:</p>
<ul>
<li><strong>Middle of the night</strong> — the night is halved.</li>
<li><strong>One-seventh of the night</strong> — the night is divided into seven parts; Isha begins after the first, Fajr at the start of the last.</li>
<li><strong>Angle-based</strong> — the night is divided in proportion to the angle over sixty.</li>
</ul>
<p>This is <strong>not a small technical detail</strong>. Stockholm (59.33°N) computed with MWL:</p>
${T(`<table>
<thead><tr><th>Date</th><th>Angle-based</th><th>One-seventh</th><th>Middle of night</th><th>Widest gap</th></tr></thead>
<tbody>
<tr><td>2026-05-20</td><td>02:05</td><td>03:07</td><td>00:45</td><td><strong>142 min</strong></td></tr>
<tr><td>2026-06-21</td><td>01:54</td><td>02:45</td><td>00:50</td><td>115 min</td></tr>
<tr><td>2026-07-15</td><td>02:07</td><td>03:05</td><td>00:54</td><td>131 min</td></tr>
<tr><td>2026-12-21</td><td>07:02</td><td>07:10</td><td>07:02</td><td>8 min</td></tr>
</tbody></table>`)}
<p>In May the spread exceeds <strong>two hours</strong>; by December it nearly vanishes. If you're in the north and see a huge difference between two apps, the cause is probably a different rule, not a different angle.</p>
<p>PrayTimes documentation labels the angle-based method as a recommended option. TimesPrayers independently uses AngleBased as its current default high-latitude rule.</p>
<h3>A TimesPrayers-specific rule for Germany</h3>
<p>For German locations, TimesPrayers applies its own DEHybrid rule, which first asks: <strong>does the sun actually reach the angle today, with enough margin?</strong> If it does, the real astronomical calculation is used; otherwise the estimate is.</p>
<p>The difference is real, not theoretical. Frankfurt on 21 May 2026 with MWL: the hybrid rule gives Fajr at 02:33 while the angle-based rule gives 03:02 — twenty-nine minutes apart. On most days of the year the two agree exactly; the divergence is confined to the late-spring and summer weeks where the question actually has an answer.</p>

<h2>Asr is an entirely separate cause</h2>
<p>Two sources can agree on everything above and still differ on Asr alone, because Asr has two definitions: when an object's shadow equals its length, or twice its length.</p>
<p>The difference isn't marginal. Cairo on 21 March 2026 with MWL: the first definition gives 15:30, the second 16:24 — <strong>fifty-four minutes</strong>. If your discrepancy is in Asr alone and is roughly that size, this is certainly the cause. This site uses shadow factor 1 by default and supports the other.</p>

<h2>How to compare two sources fairly</h2>
<p>Before deciding one is wrong, match all five:</p>
<ol>
<li><strong>The same date</strong> — times move daily.</li>
<li><strong>The same coordinates</strong> — not "Cairo" in one and "central Cairo" in the other.</li>
<li><strong>The same method</strong> — both of its angles.</li>
<li><strong>The same Asr definition.</strong></li>
<li><strong>The same offset</strong> — including daylight saving.</li>
</ol>
<p>If all five match and a minute or two remains, that's rounding. If an hour remains, it's the time zone. If two hours remain and you're in the north, it's the high-latitude rule.</p>
<p>And the practical rule still holds: <strong>follow what your mosque or your country's authority uses.</strong></p>
`,
sources: `
<h2>Sources</h2>
<p class="guide-sources-note">Every measurement on this page was computed by this site's engine using the dates and coordinates named in each table.</p>
<ul>
<li>High-latitude rule definitions: Pray Times documentation — <a href="https://praytimes.org/calculation" rel="nofollow noopener" target="_blank">praytimes.org/calculation</a></li>
<li>Official temkin table: Diyanet İşleri Başkanlığı (Turkey) — <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Published Rabat schedule: Ministry of Habous and Islamic Affairs — <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Comparative parameter table: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
`,
related: [
  { href: '/en/guides/prayer-time-calculation-methods', label: 'Prayer Time Calculation Methods and Angles' },
  { href: '/en/guides/how-qibla-direction-is-calculated', label: 'How Qibla Direction Is Calculated' },
],
},
},

// ═══════════════════════════════════════════════════════════════════════════════
// GUIDE 3 — How Qibla direction is calculated
// ═══════════════════════════════════════════════════════════════════════════════
'how-qibla-direction-is-calculated': {

ar: {
h1: 'كيف يتم حساب اتجاه القبلة؟',
body: `
<p class="guide-intro">سؤالان يبدوان واحدًا وهما مختلفان تمامًا: <strong>ما اتجاه الكعبة من مكاني؟</strong> و<strong>إلى أين تشير بوصلة هاتفي الآن؟</strong> الأول له جواب هندسي حتمي يُحسب بالدرجة. والثاني قراءة مستشعر تتأثر بمحيطها. هذه الصفحة تشرح الأول بدقة، وتوضّح لماذا لا يُغني أحدهما عن الآخر.</p>

<h2>القبلة اتجاه على سطح كرة، لا خط على خريطة مسطّحة</h2>
<p>أكثر ما يربك الناس أنهم يتخيّلون خريطة معلَّقة على جدار ويصلون بينها وبين مكة بمسطرة. لكن الأرض ليست مسطّحة، وخرائط مِركاتور تشوّه الاتجاهات كلما ابتعدت عن خط الاستواء.</p>
<p>القبلة هي <strong>أقصر مسار على سطح الكرة</strong> — ويُسمّى قوس الدائرة العظمى — والاتجاه المطلوب هو <strong>الزاوية التي تبدأ بها السير على هذا القوس</strong>.</p>
<p>ولهذا تأتي النتائج مخالفة للحدس. من <strong>نيويورك</strong> القبلة عند <strong>58°</strong>، أي شمال شرق لا شرقًا، مع أن مكة تقع جنوب شرق نيويورك على الخريطة المسطّحة. ومن <strong>كيب تاون 23°</strong>، ومن <strong>طوكيو 293°</strong>، ومن <strong>جاكرتا 295°</strong> — أي شمال غرب في الأخيرتين.</p>

<h2>الصيغة المستخدمة</h2>
<p>يُحسب الاتجاه الابتدائي للدائرة العظمى بين نقطتين بالصيغة القياسية:</p>
<pre class="guide-formula"><code>y = sin(Δλ) · cos(φ₂)
x = cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ)
θ = atan2(y, x)</code></pre>
<p>حيث φ₁ عرض موقعك، وφ₂ عرض الكعبة، وΔλ فرق خطَّي الطول. والناتج بالراديان يُحوَّل إلى درجات.</p>
<p>وهذا الاتجاه منسوب إلى <strong>الشمال الجغرافي</strong>، لأن المعادلة كلها إحداثيات جغرافية ولا يدخلها أي عنصر مغناطيسي. وهذه نقطة سنعود إليها.</p>
<p><strong>القيمة المعروضة هي الاتجاه الابتدائي</strong> من موقعك نحو الكعبة. ولو تحرّك شخص فعليًا على طول هذا المسار لمسافة كبيرة، فإن اتجاه الحركة اللحظي يتغيّر تدريجيًا أثناء الرحلة. أما وأنت في مكانك، فالقيمة ثابتة.</p>

<h2>نموذج الأرض المستخدم</h2>
<p>يستخدم TimesPrayers <strong>نموذجًا كرويًا</strong> للأرض في هذا الحساب. لذلك فالمسافة والاتجاه ناتجان عن حساب الدائرة العظمى على كرة، لا عن نموذج جيوديسي إهليلجي أكثر تعقيدًا.</p>

<h2>إحداثيات الكعبة</h2>
<p>الإحداثيات التي يستخدمها TimesPrayers هي <strong>21.4225° شمالًا و39.8262° شرقًا</strong>. وهي نقطة واحدة ثابتة، فلا يتغيّر الناتج إلا بتغيّر موقعك أنت.</p>

<h2>المسافة</h2>
<p>تُحسب المسافة بصيغة Haversine على كرة نصف قطرها <strong>6,371 كيلومترًا</strong>، وتُعرض مقرَّبة لأقرب كيلومتر. وهي <strong>مسافة سطحية على القوس</strong>، لا خط مستقيم يخترق الأرض.</p>
${T(`<table>
<thead><tr><th>المدينة</th><th>الاتجاه</th><th>الجهة</th><th>المسافة</th></tr></thead>
<tbody>
<tr><td>القاهرة</td><td>136.14°</td><td>جنوب شرق</td><td>1,287 كم</td></tr>
<tr><td>الرياض</td><td>243.80°</td><td>جنوب غرب</td><td>790 كم</td></tr>
<tr><td>صنعاء</td><td>326.28°</td><td>شمال غرب</td><td>815 كم</td></tr>
<tr><td>أنقرة</td><td>160.17°</td><td>جنوب</td><td>2,162 كم</td></tr>
<tr><td>موسكو</td><td>176.36°</td><td>جنوب</td><td>3,822 كم</td></tr>
<tr><td>لندن</td><td>118.99°</td><td>جنوب شرق</td><td>4,794 كم</td></tr>
<tr><td>كيب تاون</td><td>23.35°</td><td>شمال شرق</td><td>6,558 كم</td></tr>
<tr><td>جاكرتا</td><td>295.15°</td><td>شمال غرب</td><td>7,920 كم</td></tr>
<tr><td>طوكيو</td><td>293.00°</td><td>شمال غرب</td><td>9,472 كم</td></tr>
<tr><td>نيويورك</td><td>58.48°</td><td>شمال شرق</td><td>10,306 كم</td></tr>
<tr><td>ساو باولو</td><td>68.94°</td><td>شرق</td><td>10,602 كم</td></tr>
<tr><td>سيدني</td><td>277.50°</td><td>غرب</td><td>13,236 كم</td></tr>
</tbody></table>`)}
<p>ولاحظ <strong>الرياض</strong> و<strong>صنعاء</strong>: كلتاهما قريبة من مكة، ومع ذلك القبلة من الرياض جنوب غرب ومن صنعاء شمال غرب. الاتجاه يعتمد على الموضع النسبي، لا على المسافة.</p>

<h2>لماذا تظهر القيمة أحيانًا سالبة قبل التطبيع</h2>
<p>دالة <code>atan2</code> تعيد قيمة في المدى من −180° إلى 180°. فكل اتجاه يتجاوز 180° يخرج منها سالبًا، ويُطبَّع بإضافة 360 ثم أخذ الباقي على 360:</p>
${T(`<table>
<thead><tr><th>المدينة</th><th>الناتج الخام</th><th>بعد التطبيع</th></tr></thead>
<tbody>
<tr><td>صنعاء</td><td>−33.72°</td><td>326.28°</td></tr>
<tr><td>جاكرتا</td><td>−64.85°</td><td>295.15°</td></tr>
<tr><td>طوكيو</td><td>−67.00°</td><td>293.00°</td></tr>
<tr><td>سيدني</td><td>−82.50°</td><td>277.50°</td></tr>
<tr><td>الرياض</td><td>−116.20°</td><td>243.80°</td></tr>
</tbody></table>`)}
<p>ويعرض هذا الموقع الاتجاه في موضعين: <strong>رقم صحيح</strong> في الشارة الظاهرة، و<strong>منزلتان عشريتان</strong> في شبكة التفاصيل. الرقمان من الحساب نفسه، والفرق في العرض فقط.</p>

<h2>بوصلة جهازك ليست هذا الحساب</h2>
<p>هنا مربط الفرس. الرقم أعلاه <strong>حتمي</strong>: أعطِه الإحداثيات نفسها فيعطيك الناتج نفسه دائمًا. أما الإبرة المتحرّكة على شاشتك فتأتي من <strong>مستشعرات</strong> الجهاز، ولها سلوك مختلف تمامًا.</p>
<h3>مساران مختلفان لنظامين</h3>
<p>على <strong>iOS</strong> يعتمد الموقع قراءة الاتجاه التي يوفّرها النظام مباشرة. وعلى <strong>أندرويد</strong> يُحسب الاتجاه من مصفوفة دوران الجهاز مع تعويض <strong>الميل</strong> و<strong>دوران الشاشة</strong>، حتى لا تنحرف القراءة حين تُمسك الهاتف مائلًا أو تُدير الشاشة.</p>
<h3>المطلق والنسبي</h3>
<p>تفرّق مواصفات المتصفحات بين نوعين من قراءة الاتجاه: <strong>مطلق</strong> ينسب نفسه إلى إطار الأرض، و<strong>نسبي</strong> إطاره المرجعي <strong>اعتباطي</strong> — أي أن «صفره» قد لا يعني الشمال إطلاقًا.</p>
<p>ولذلك يفضّل هذا الموقع القراءة المطلقة، وبمجرد أن يراها <strong>يتجاهل</strong> القراءات النسبية بعدها حتى لا يفسد صفرٌ اعتباطي اتجاهًا صحيحًا. وإن لم تتوفّر إلا قراءة نسبية، يعرض الموقع تنبيهًا بأن دقة البوصلة منخفضة. وإن تعذّرت القراءة كليًا، يُخفي الإبرة الحيّة ويعرض الاتجاه المحسوب رقمًا ثابتًا.</p>
<h3>الشمال الجغرافي والشمال المغناطيسي</h3>
<p><strong>الاتجاه الرياضي للقبلة محسوب بالنسبة إلى الشمال الجغرافي</strong>، بينما تعتمد قراءة البوصلة الحيّة على مستشعرات الجهاز و<strong>قد تكون مرجعيتها مغناطيسية</strong>. والفرق بين الشمالين يُسمّى <strong>الانحراف المغناطيسي</strong>، وهو يتغيّر بحسب موقعك على الأرض ويتغيّر مع الزمن — ولذلك تُحدَّث النماذج العالمية له كل خمس سنوات.</p>
<p><strong>ولا يطبّق TimesPrayers حاليًا تصحيحًا مستقلًا للانحراف المغناطيسي.</strong> لذلك قد لا تنطبق الإبرة على الرقم المحسوب انطباقًا تامًّا.</p>
<h3>الدقة ليست عدد المنازل العشرية</h3>
<p><strong>قيمة رقمية معروضة بدقة عشرية لا تعني أن اتجاه البوصلة الحقيقي دقيق بالمقدار نفسه</strong>؛ دقة المستشعر تتأثر بالجهاز والبيئة والمجال المغناطيسي. والمستشعر المغناطيسي حسّاس لما حوله: الأجسام المعدنية، ومكبّرات الصوت، وأغلفة الهواتف المغناطيسية، والسيارات، وحديد التسليح في المباني. وتحريك الهاتف في مسار يشبه الرقم ٨ يساعد النظام على إعادة المعايرة.</p>
<p><strong>والخلاصة العملية:</strong> الرقم المحسوب هو المرجع الثابت، والإبرة أداة تقريبية للاستدلال به.</p>

<h2>عن الانحراف اليسير</h2>
<p>يسأل كثيرون: ماذا لو انحرفتُ قليلًا عن الاتجاه المحسوب؟ هذه مسألة فقهية، وقد تناولها أهل العلم بتفصيل يختلف باختلاف حال المصلّي وقدرته على التحرّي. ونحن نعرض الحساب وحدوده، ولا نصدر فيها حكمًا؛ والرجوع في ذلك إلى أهل العلم أو الجهة التي يتبعها المستخدم.</p>
`,
sources: `
<h2>المصادر</h2>
<p class="guide-sources-note">الزوايا والمسافات محسوبة بالصيغة نفسها المستخدمة في هذا الموقع، من إحداثيات كل مدينة.</p>
<ul>
<li>الاتجاه الابتدائي وHaversine ونصف القطر 6,371 كم على نموذج كروي: <a href="https://www.movable-type.co.uk/scripts/latlong.html" rel="nofollow noopener" target="_blank">movable-type.co.uk</a></li>
<li>إطار الأرض لمستشعر الاتجاه المطلق: <a href="https://www.w3.org/TR/orientation-sensor/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-sensor</a></li>
<li>المطلق مقابل النسبي وحدود دقة العرض: <a href="https://www.w3.org/TR/orientation-event/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-event</a></li>
<li><code>webkitCompassHeading</code> ومرجعيته: وثائق Apple للمطوّرين</li>
<li>الانحراف المغناطيسي وتغيّره: النموذج المغناطيسي العالمي — <a href="https://www.ncei.noaa.gov/products/world-magnetic-model" rel="nofollow noopener" target="_blank">ncei.noaa.gov</a></li>
</ul>
`,
related: [
  { href: '/qibla', label: 'اتجاه القبلة — بوصلة الكعبة' },
  { href: '/guides/prayer-time-calculation-methods', label: 'طرق حساب مواقيت الصلاة وزوايا الفجر والعشاء' },
],
},

en: {
h1: 'How Qibla Direction Is Calculated',
body: `
<p class="guide-intro">Two questions look like one but are entirely different: <strong>which way is the Kaaba from where I am?</strong> and <strong>where is my phone's compass pointing right now?</strong> The first has a deterministic geometric answer. The second is a sensor reading affected by its surroundings. This page explains the first precisely, and why neither replaces the other.</p>

<h2>The Qibla is a direction on a sphere, not a line on a flat map</h2>
<p>What confuses most people is picturing a wall map and joining their city to Makkah with a ruler. But the Earth isn't flat, and Mercator maps distort direction increasingly with latitude.</p>
<p>The Qibla is the <strong>shortest path across the surface of a sphere</strong> — a great-circle arc — and the direction you need is <strong>the angle at which you set off along that arc</strong>.</p>
<p>That's why the results defy intuition. From <strong>New York</strong> the Qibla is <strong>58°</strong>, north-east rather than east, even though Makkah sits to the south-east on a flat map. From <strong>Cape Town</strong> it's <strong>23°</strong>, from <strong>Tokyo 293°</strong>, and from <strong>Jakarta 295°</strong> — north-west in the latter two.</p>

<h2>The formula used</h2>
<p>The initial bearing of the great circle between two points is computed with the standard formula:</p>
<pre class="guide-formula"><code>y = sin(Δλ) · cos(φ₂)
x = cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ)
θ = atan2(y, x)</code></pre>
<p>where φ₁ is your latitude, φ₂ the Kaaba's, and Δλ the difference in longitude. The radian result is converted to degrees.</p>
<p>This bearing is referenced to <strong>geographic north</strong>, because the equation is purely geographic and contains no magnetic term. We'll return to that.</p>
<p><strong>The displayed value is the initial great-circle bearing</strong> from your location toward the Kaaba. If someone physically travelled along that great-circle route, the heading would gradually change along the journey. While you stay where you are, the value is fixed.</p>

<h2>The Earth model used</h2>
<p>TimesPrayers uses a <strong>spherical Earth model</strong> for this calculation. The bearing and distance are therefore based on great-circle geometry on a sphere rather than a more complex ellipsoidal geodesic model.</p>

<h2>The Kaaba's coordinates</h2>
<p>The coordinates used by TimesPrayers are <strong>21.4225°N, 39.8262°E</strong>. It's a single fixed point, so the result changes only when your own position changes.</p>

<h2>Distance</h2>
<p>Distance is computed with the Haversine formula on a sphere of radius <strong>6,371 km</strong> and displayed rounded to the nearest kilometre. It's a <strong>surface distance along the arc</strong>, not a straight line through the Earth.</p>
${T(`<table>
<thead><tr><th>City</th><th>Bearing</th><th>Direction</th><th>Distance</th></tr></thead>
<tbody>
<tr><td>Cairo</td><td>136.14°</td><td>south-east</td><td>1,287 km</td></tr>
<tr><td>Riyadh</td><td>243.80°</td><td>south-west</td><td>790 km</td></tr>
<tr><td>Sanaa</td><td>326.28°</td><td>north-west</td><td>815 km</td></tr>
<tr><td>Ankara</td><td>160.17°</td><td>south</td><td>2,162 km</td></tr>
<tr><td>Moscow</td><td>176.36°</td><td>south</td><td>3,822 km</td></tr>
<tr><td>London</td><td>118.99°</td><td>south-east</td><td>4,794 km</td></tr>
<tr><td>Cape Town</td><td>23.35°</td><td>north-east</td><td>6,558 km</td></tr>
<tr><td>Jakarta</td><td>295.15°</td><td>north-west</td><td>7,920 km</td></tr>
<tr><td>Tokyo</td><td>293.00°</td><td>north-west</td><td>9,472 km</td></tr>
<tr><td>New York</td><td>58.48°</td><td>north-east</td><td>10,306 km</td></tr>
<tr><td>São Paulo</td><td>68.94°</td><td>east</td><td>10,602 km</td></tr>
<tr><td>Sydney</td><td>277.50°</td><td>west</td><td>13,236 km</td></tr>
</tbody></table>`)}
<p>Note <strong>Riyadh</strong> and <strong>Sanaa</strong>: both are close to Makkah, yet the Qibla from Riyadh is south-west and from Sanaa north-west. Bearing depends on relative position, not on distance.</p>

<h2>Why the value is sometimes negative before normalisation</h2>
<p><code>atan2</code> returns a value between −180° and 180°. Any bearing beyond 180° therefore comes out negative, and is normalised by adding 360 and taking the remainder modulo 360:</p>
${T(`<table>
<thead><tr><th>City</th><th>Raw result</th><th>After normalisation</th></tr></thead>
<tbody>
<tr><td>Sanaa</td><td>−33.72°</td><td>326.28°</td></tr>
<tr><td>Jakarta</td><td>−64.85°</td><td>295.15°</td></tr>
<tr><td>Tokyo</td><td>−67.00°</td><td>293.00°</td></tr>
<tr><td>Sydney</td><td>−82.50°</td><td>277.50°</td></tr>
<tr><td>Riyadh</td><td>−116.20°</td><td>243.80°</td></tr>
</tbody></table>`)}
<p>This site shows the bearing in two places: a <strong>whole number</strong> on the visible badge, and <strong>two decimal places</strong> in the details grid. Both come from the same calculation; only the display differs.</p>

<h2>Your device's compass is not this calculation</h2>
<p>This is the crux. The number above is <strong>deterministic</strong>: give it the same coordinates and it returns the same result every time. The needle moving on your screen comes from the device's <strong>sensors</strong>, and behaves quite differently.</p>
<h3>Two different paths for two platforms</h3>
<p>On <strong>iOS</strong> the site uses the heading the system provides directly. On <strong>Android</strong> the heading is derived from the device's rotation matrix with compensation for <strong>tilt</strong> and <strong>screen rotation</strong>, so the reading doesn't drift when you hold the phone at an angle or rotate the screen.</p>
<h3>Absolute versus relative</h3>
<p>Browser specifications distinguish two kinds of orientation reading: <strong>absolute</strong>, which references the Earth's frame, and <strong>relative</strong>, whose reference frame is <strong>arbitrary</strong> — meaning its "zero" may not be north at all.</p>
<p>So this site prefers the absolute reading, and once it has seen one it <strong>ignores</strong> subsequent relative readings, so an arbitrary zero can't corrupt a correct heading. If only a relative reading is available, the site shows a low-compass-accuracy notice. If no reading is available at all, it hides the live needle and shows the computed bearing as a fixed number.</p>
<h3>Geographic north versus magnetic north</h3>
<p><strong>The mathematical Qibla bearing is referenced to geographic north</strong>, while the live compass heading comes from device sensors and <strong>may be magnetically referenced</strong>. The angle between the two is called <strong>magnetic declination</strong>; it varies by location and changes over time — which is why global models of it are revised every five years.</p>
<p><strong>TimesPrayers does not currently apply a separate magnetic-declination correction.</strong> So the needle may not land exactly on the computed number.</p>
<h3>Accuracy is not the number of decimal places</h3>
<p><strong>A value displayed to a decimal place does not mean the real compass direction is accurate to that degree</strong>; sensor accuracy depends on the device, its surroundings, and the magnetic field. Magnetometers are sensitive to what's around them: metal objects, speakers, magnetic phone cases, cars, and reinforcing steel in buildings. Moving the phone in a figure-of-eight helps the system recalibrate.</p>
<p><strong>The practical takeaway:</strong> the computed number is the stable reference; the needle is an approximate tool for acting on it.</p>

<h2>On small deviation</h2>
<p>Many people ask what happens if they're slightly off the computed direction. That is a matter of jurisprudence, treated by scholars with detail that varies according to a person's circumstances and their ability to determine the direction. We present the calculation and its limits, and issue no ruling on it; that is referred to qualified scholars or the authority a user follows.</p>
`,
sources: `
<h2>Sources</h2>
<p class="guide-sources-note">The bearings and distances on this page were computed with the same formula this site uses, from each city's coordinates.</p>
<ul>
<li>Initial bearing, Haversine and the 6,371 km radius on a spherical model: <a href="https://www.movable-type.co.uk/scripts/latlong.html" rel="nofollow noopener" target="_blank">movable-type.co.uk</a></li>
<li>Earth reference frame for the absolute orientation sensor: <a href="https://www.w3.org/TR/orientation-sensor/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-sensor</a></li>
<li>Absolute versus relative readings and display-precision limits: <a href="https://www.w3.org/TR/orientation-event/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-event</a></li>
<li><code>webkitCompassHeading</code> and its reference: Apple Developer documentation</li>
<li>Magnetic declination and how it changes: World Magnetic Model — <a href="https://www.ncei.noaa.gov/products/world-magnetic-model" rel="nofollow noopener" target="_blank">ncei.noaa.gov</a></li>
</ul>
`,
related: [
  { href: '/en/qibla', label: 'Qibla Direction — Kaaba Compass' },
  { href: '/en/guides/prayer-time-calculation-methods', label: 'Prayer Time Calculation Methods and Angles' },
],
},
},

};

module.exports = { GUIDES };
