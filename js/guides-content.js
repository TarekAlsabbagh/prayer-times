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

<h2>حين تطبّق الجهة تعديلات بالدقائق</h2>
<p>بعض الجهات لا تنشر زاوية خامًا فحسب، بل جدولًا يتضمّن <strong>دقائق احتياط</strong> (تُسمّى «تمكين» في تركيا و«احتياط» في ماليزيا وإندونيسيا). فإن حسبت بالزاوية وحدها خالفت الجدول الرسمي بدقائق.</p>
<h3>تركيا</h3>
<p><strong>تركيا</strong> أوضح مثال موثَّق رسميًا. تنشر Diyanet İşleri Başkanlığı (رئاسة الشؤون الدينية التركية) جدول تمكين معلنًا: يُقدَّم الشروق سبع دقائق، وتُضاف خمس دقائق إلى الظهر، وأربع إلى العصر، وسبع إلى المغرب، ولا تعديل على الإمساك والعشاء. ويطبّق هذا الموقع هذه التعديلات المنشورة نفسها فوق زاويتي 18°/17°.</p>
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

<h2>When an authority applies minute adjustments</h2>
<p>Some authorities don't publish only a raw angle. They publish a table that already contains <strong>precautionary minutes</strong> — <em>temkin</em> in Turkey, <em>ihtiyat</em> in Malaysia and Indonesia. Compute the angle alone and you'll miss the official table by several minutes.</p>
<h3>Turkey</h3>
<p><strong>Turkey</strong> is the clearest officially documented case. Diyanet İşleri Başkanlığı, the Turkish authority for religious affairs, publishes an explicit temkin table: sunrise is shifted seven minutes earlier, while five minutes are added to Dhuhr, four to Asr and seven to Maghrib; no adjustment is applied to imsak or Isha. This site applies those same published adjustments on top of the 18°/17° angles.</p>
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
fr: {
h1: 'Méthodes de calcul des heures de prière et angles',
body: `
<p class="guide-intro">Ouvrez deux applications de prière dans la même ville et le Fajr peut différer de quinze minutes. Ce n'est généralement pas un défaut. Cela signifie le plus souvent que chaque application répond à une question légèrement différente : <strong>à partir de quand dit-on que le Fajr a commencé ?</strong> Cette page explique comment cette question devient un calcul, et ce que fait exactement ce site.</p>

<h2>Ce qui est réellement calculé</h2>
<p>Les heures de prière ne sont pas un horaire enregistré. Elles se déduisent de <strong>la position du soleil par rapport à votre horizon</strong>. Le calcul a besoin de trois données : la latitude, la longitude et la date. Il en tire la <strong>déclinaison</strong> du soleil pour ce jour-là et l'<strong>équation du temps</strong>, puis cherche l'instant où le soleil atteint une hauteur donnée.</p>
<p>Certaines heures ont une définition géométrique directe : le <strong>Dhuhr</strong>, c'est le passage du soleil au méridien ; le <strong>lever du soleil</strong> et le <strong>Maghrib</strong>, c'est le moment où le disque solaire rencontre l'horizon. Le <strong>Fajr</strong> et l'<strong>Isha</strong> sont d'une autre nature. Tous deux sont liés au crépuscule, et le crépuscule est un effacement progressif, non un instant net. C'est précisément là que les méthodes divergent.</p>

<h2>Ce que signifie un « angle du Fajr »</h2>
<p>Le crépuscule étant progressif, il fallait un seuil mesurable. Celui qui a été retenu est <strong>la profondeur à laquelle le soleil est descendu sous l'horizon</strong>.</p>
<p>Quand une méthode utilise un angle de Fajr de <strong>18°</strong>, cela veut dire : chercher l'instant où le centre du soleil se trouve 18 degrés sous l'horizon avant le lever. Un angle plus grand place le soleil plus bas, donc l'heure arrive <strong>plus tôt</strong>. Un Fajr à 19.5° est plus précoce qu'un Fajr à 15°.</p>
<p>L'ampleur de cet écart n'est pas constante. Aux latitudes moyennes, un degré vaut environ <strong>cinq minutes</strong> en hiver et peut atteindre <strong>sept minutes</strong> près du solstice d'été, parce que le soleil descend selon une pente plus faible et met plus longtemps à franchir le même degré. Cette variation saisonnière est l'une des grandes raisons pour lesquelles l'écart entre deux applications n'est pas stable au fil de l'année.</p>

<h2>Les méthodes appliquées par ce site</h2>
<p>Dix-sept méthodes sont implémentées. Chaque valeur ci-dessous est celle que le calcul utilise réellement :</p>

${T(`<table>
<thead><tr><th>Méthode</th><th>Fajr</th><th>Isha</th></tr></thead>
<tbody>
<tr><td>Muslim World League (MWL)</td><td>18°</td><td>17°</td></tr>
<tr><td>ISNA (Amérique du Nord)</td><td>15°</td><td>15°</td></tr>
<tr><td>Egyptian General Authority of Survey</td><td>19.5°</td><td>17.5°</td></tr>
<tr><td>Umm al-Qura, La Mecque</td><td>18.5°</td><td>90 minutes après le Maghrib</td></tr>
<tr><td>University of Islamic Sciences, Karachi</td><td>18°</td><td>18°</td></tr>
<tr><td>Institute of Geophysics, Tehran</td><td>17.7°</td><td>14° (Maghrib 4.5°)</td></tr>
<tr><td>Jafari</td><td>16°</td><td>14° (Maghrib 4°)</td></tr>
<tr><td>Gulf Region</td><td>19.5°</td><td>90 minutes après le Maghrib</td></tr>
<tr><td>Kuwait</td><td>18°</td><td>17.5°</td></tr>
<tr><td>Qatar</td><td>18°</td><td>90 minutes après le Maghrib</td></tr>
<tr><td>Singapore</td><td>20°</td><td>18°</td></tr>
<tr><td>Turquie — Diyanet</td><td>18°</td><td>17°</td></tr>
<tr><td>Union des organisations islamiques de France</td><td>12°</td><td>12°</td></tr>
<tr><td>Russia</td><td>16°</td><td>15°</td></tr>
<tr><td>Malaisie — JAKIM</td><td>20°</td><td>18°</td></tr>
<tr><td>Indonésie — Ministère des Affaires religieuses</td><td>20°</td><td>18°</td></tr>
<tr><td>Maroc</td><td>18°</td><td>17°</td></tr>
</tbody></table>`)}
<p>Le Fajr va de 12° à 20° dans ce tableau. Cet écart n'est pas une différence de précision de calcul : c'est une différence de <strong>seuil retenu par chaque autorité</strong>, ce qui relève d'un jugement savant et institutionnel, non d'un choix de programmation.</p>

<h2>Angle ou intervalle fixe</h2>
<p>Trois méthodes du tableau n'utilisent aucun angle pour l'Isha : <strong>Umm al-Qura</strong>, <strong>Gulf Region</strong> et <strong>Qatar</strong>. Elles ajoutent un <strong>intervalle fixe</strong> après le Maghrib.</p>
<p>Voici La Mecque selon la méthode Umm al-Qura, calculée par le moteur de ce site :</p>

${T(`<table>
<thead><tr><th>Date</th><th>Maghrib</th><th>Isha</th><th>Intervalle</th></tr></thead>
<tbody>
<tr><td>2026-01-15</td><td>17:59</td><td>19:29</td><td>90 min</td></tr>
<tr><td>2026-06-21</td><td>19:06</td><td>20:36</td><td>90 min</td></tr>
<tr><td>2026-09-23</td><td>18:16</td><td>19:46</td><td>90 min</td></tr>
<tr><td>2026-12-21</td><td>17:44</td><td>19:14</td><td>90 min</td></tr>
</tbody></table>`)}
<p>L'intervalle ne bouge jamais, alors qu'un Isha fondé sur un angle produit un intervalle qui varie avec les saisons. À La Mecque, le 21 juin 2026, l'Isha à 17° de la MWL tombe à 20:26 tandis qu'Umm al-Qura donne 20:36 — dix minutes d'écart. Le 21 décembre, l'écart se creuse à quinze minutes. Voilà la différence concrète entre un angle et un intervalle.</p>
<p><strong>TimesPrayers applique actuellement un intervalle fixe de 90 minutes après le Maghrib tout au long de l'année.</strong></p>

<h2>Quand l'autorité applique des ajustements en minutes</h2>
<p>Certaines autorités ne publient pas seulement un angle brut. Elles publient un tableau qui contient déjà des <strong>minutes de précaution</strong> — le <em>temkin</em> en Turquie, l'<em>ihtiyat</em> en Malaisie et en Indonésie. Calculez l'angle seul et vous manquerez le tableau officiel de plusieurs minutes.</p>
<h3>Turquie</h3>
<p>La <strong>Turquie</strong> est le cas officiellement documenté le plus net. La Présidence des affaires religieuses (Diyanet İşleri Başkanlığı) publie un tableau de temkin explicite : le lever du soleil est avancé de sept minutes, tandis que cinq minutes sont ajoutées au Dhuhr, quatre au Asr et sept au Maghrib ; aucun ajustement sur l'imsak ni sur l'Isha. Ce site applique ces mêmes ajustements publiés par-dessus les angles 18°/17°.</p>
<h3>Malaisie</h3>
<p>En <strong>Malaisie</strong>, JAKIM utilise 20° pour le Fajr et 18° pour l'Isha. TimesPrayers applique ses propres ajustements en minutes pour s'aligner sur les horaires publiés ; ces ajustements ne sont pas des valeurs officielles attribuables à JAKIM.</p>
<h3>Indonésie</h3>
<p>En <strong>Indonésie</strong>, ce site utilise les angles de 20° et 18° correspondant aux critères du Ministère des Affaires religieuses, et <strong>n'applique aucun ajustement d'ihtiyath distinct</strong>. Les documents du Kemenag décrivent des ajouts de minutes de précaution dans la préparation des horaires de prière ; cela n'est pas appliqué ici.</p>
<h3>Maroc</h3>
<p>Au <strong>Maroc</strong>, ce site utilise un Fajr à 18° avec un décalage fixe de six minutes vers le plus tôt. Nous avons comparé le résultat à l'horaire publié pour Rabat par le Ministère des Habous et des Affaires islamiques sur quatre dates d'août et septembre 2026, et notre Fajr s'est situé à <strong>une ou deux minutes</strong> de l'heure publiée dans l'échantillon examiné. Nous n'attribuons pas au ministère un angle de calcul déterminé.</p>

<h2>Comment le Asr est calculé</h2>
<p>Le Asr a deux définitions largement suivies, toutes deux fondées sur la longueur de l'ombre :</p>
<ul>
<li><strong>Facteur d'ombre 1</strong> — le Asr commence lorsque l'ombre d'un objet égale sa propre longueur, à quoi s'ajoute l'ombre de midi. C'est la valeur par défaut ici.</li>
<li><strong>Facteur d'ombre 2</strong> — le Asr commence lorsque l'ombre atteint le double de la longueur de l'objet, à quoi s'ajoute l'ombre de midi.</li>
</ul>
<p>La différence est importante, non marginale. Au Caire, le 21 mars 2026 selon la MWL, le facteur 1 donne le Asr à <strong>15:30</strong> et le facteur 2 à <strong>16:24</strong> — cinquante-quatre minutes d'écart.</p>
<p>Le site prend en charge les deux définitions et utilise le facteur d'ombre 1 par défaut. La définition qu'un utilisateur suit dépend de l'école ou de l'autorité qu'il suit.</p>

<h2>Comment la méthode est choisie automatiquement</h2>
<p>Quand vous ouvrez la page d'une ville, le site retient la méthode <strong>selon le pays de cette ville</strong> : l'Égypte et la Libye utilisent la méthode égyptienne, la France celle de l'union française, la Turquie Diyanet, l'Iran Tehran, le Pakistan/l'Inde/le Bangladesh/l'Afghanistan Karachi, la Malaisie JAKIM, l'Indonésie son ministère des Affaires religieuses, Singapour et Brunei la méthode régionale. Tout pays non associé utilise la MWL comme méthode de repli dans l'implémentation actuelle.</p>

<h2>Ce que cela donne sur les heures finales</h2>
<p>Un exemple relie le tout. Le Caire (30.0444° N, 31.2357° E), le 21 mars 2026, UTC+2, calculé par ce site :</p>

${T(`<table>
<thead><tr><th>Méthode</th><th>Fajr</th><th>Lever du soleil</th><th>Dhuhr</th><th>Asr</th><th>Maghrib</th><th>Isha</th></tr></thead>
<tbody>
<tr><td>MWL</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:22</td></tr>
<tr><td>ISNA</td><td>04:52</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:13</td></tr>
<tr><td>Egyptian</td><td>04:31</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:25</td></tr>
<tr><td>Umm al-Qura</td><td>04:36</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:37</td></tr>
<tr><td>Karachi</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:27</td></tr>
</tbody></table>`)}
<p><strong>Le lever du soleil, le Dhuhr et le Maghrib sont identiques pour les cinq</strong> — leurs définitions sont géométriques et ne dépendent d'aucun seuil crépusculaire choisi. Tout l'écart se concentre sur le Fajr et l'Isha : vingt et une minutes entre l'angle de Fajr le plus étroit (ISNA 15°) et le plus large (Egyptian 19.5°). Le Asr coïncide ici parce que les cinq partagent le même facteur d'ombre par défaut.</p>

<h2>Les hautes latitudes</h2>
<p>Plus on monte vers le nord ou descend vers le sud, plus vite on atteint un jour où le soleil ne descend jamais jusqu'à l'angle requis — il n'y a donc ce jour-là ni Fajr ni Isha astronomiques. On utilise alors une règle d'estimation qui découpe la nuit. Ce site implémente trois règles courantes, plus une quatrième qui lui est propre, utilisée pour les localités allemandes, qui choisit entre le calcul réel et l'estimation selon que l'angle est véritablement atteint avec une marge suffisante. Un <a href="/fr/guides/why-prayer-times-differ">guide distinct</a> traite ce point en détail.</p>

<h2>Choisir ce qui vous convient</h2>
<p>La règle pratique est simple : <strong>suivez ce qu'utilise votre mosquée ou l'autorité de votre pays.</strong> Le but est de prier avec l'assemblée, non de faire coïncider un chiffre. C'est pourquoi le site retient par défaut la méthode associée au pays de la ville.</p>
<p>Si vous comparez avec une autre source, comparez loyalement : même date, mêmes coordonnées, même méthode, même définition du Asr. La plupart des erreurs apparentes se révèlent n'être que deux réglages différents.</p>
`,
sources: `
<h2>Sources</h2>
<p class="guide-sources-note">Les angles et les ajustements en minutes ci-dessous sont attribués aux organismes qui les publient. Chaque comparaison chiffrée de cette page a été calculée par le moteur de ce site, avec les dates et les coordonnées nommées dans chaque exemple.</p>
<ul>
<li>Diyanet İşleri Başkanlığı (Turquie) — tableau officiel du temkin : <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Ministère des Habous et des Affaires islamiques, Maroc — horaire publié pour Rabat : <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Ministère des Affaires religieuses de la République d'Indonésie (Kemenag) — critères des horaires de prière</li>
<li>Université Umm al-Qura, La Mecque — norme de calcul publiée</li>
<li>Muslim World League · Egyptian General Authority of Survey · University of Islamic Sciences, Karachi · ISNA · Union des organisations islamiques de France · JAKIM Malaisie</li>
<li>Tableau comparatif des paramètres : <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
<p class="guide-sources-note"><strong>Remarque :</strong> certaines autorités publient des tableaux où les minutes de précaution sont déjà incluses. Là où ce que nous appliquons diffère de l'angle officiel, nous le disons dans le corps de la page.</p>

---
`,
related: [
  { href: '/fr/guides/why-prayer-times-differ', label: 'Pourquoi les heures de prière diffèrent entre applications et sites' },
  { href: '/fr/guides/how-qibla-direction-is-calculated', label: 'Comment la direction de la Qibla est calculée' },
  { href: '/fr/prayer-times-worldwide', label: 'Heures de prière dans le monde' },
],
},
tr: {
h1: 'Namaz Vakti Hesaplama Yöntemleri ve Açıları',
body: `
<p class="guide-intro">Aynı şehirde iki namaz uygulaması açın; imsak vakti on beş dakika farklı çıkabilir. Bu genellikle bir hata değildir. Çoğu zaman anlamı şudur: her uygulama biraz farklı bir soruyu yanıtlamaktadır — <strong>sabah namazı vaktinin girdiği ne zaman kabul edilir?</strong> Bu sayfa, o sorunun nasıl bir hesaba dönüştüğünü ve bu sitenin tam olarak ne yaptığını anlatır.</p>

<h2>Aslında ne hesaplanıyor</h2>
<p>Namaz vakitleri saklanmış bir cetvel değildir. <strong>Güneşin ufkunuza göre konumundan</strong> türetilir. Hesap üç girdi ister: enlem, boylam ve tarih. Bunlardan o güne ait güneşin <strong>deklinasyonu</strong> (dik açıklığı) ile <strong>zaman denklemi</strong> çıkarılır, ardından güneşin belirli bir yüksekliğe ulaştığı an aranır.</p>
<p>Bazı vakitlerin doğrudan geometrik tanımı vardır: <strong>öğle</strong>, güneşin meridyeni geçtiği andır; <strong>güneşin doğuşu</strong> ile <strong>akşam</strong>, güneş diskinin ufka değdiği andır. <strong>İmsak</strong> ile <strong>yatsı</strong> ise farklıdır. İkisi de alacakaranlıkla ilgilidir; alacakaranlık keskin bir an değil, kademeli bir geçiştir. Yöntemler tam burada ayrışır.</p>

<h2>«İmsak açısı» ne demek</h2>
<p>Alacakaranlık kademeli olduğu için ölçülebilir bir eşik gerekti. Benimsenen eşik şudur: <strong>güneş ufkun ne kadar altına inmiştir</strong>.</p>
<p>Bir yöntem imsak için <strong>18°</strong> açı kullandığında şu kastedilir: güneşin merkezinin, doğuştan önce ufkun 18 derece altında bulunduğu anı bul. Daha büyük açı güneşi daha derine koyar, dolayısıyla vakit <strong>daha erken</strong> gelir. 19.5° imsak, 15° imsaktan daha erkendir.</p>
<p>Bu farkın büyüklüğü sabit değildir. Orta enlemlerde bir derece kışın yaklaşık <strong>beş dakikaya</strong> denk gelir ve yaz gündönümüne yakın <strong>yedi dakikaya</strong> kadar çıkabilir; çünkü güneş daha yatık bir eğimle iner ve aynı dereceyi geçmesi daha uzun sürer. İki uygulama arasındaki farkın yıl boyunca sabit kalmamasının başlıca sebeplerinden biri bu mevsimsel değişimdir.</p>

<h2>Bu sitenin uyguladığı yöntemler</h2>
<p>On yedi yöntem uygulanmaktadır. Aşağıdaki her değer, hesapta fiilen kullanılan değerdir:</p>

${T(`<table>
<thead><tr><th>Yöntem</th><th>İmsak</th><th>Yatsı</th></tr></thead>
<tbody>
<tr><td>Muslim World League (MWL)</td><td>18°</td><td>17°</td></tr>
<tr><td>ISNA (Kuzey Amerika)</td><td>15°</td><td>15°</td></tr>
<tr><td>Egyptian General Authority of Survey</td><td>19.5°</td><td>17.5°</td></tr>
<tr><td>Umm al-Qura, Mekke</td><td>18.5°</td><td>akşamdan 90 dakika sonra</td></tr>
<tr><td>University of Islamic Sciences, Karachi</td><td>18°</td><td>18°</td></tr>
<tr><td>Institute of Geophysics, Tehran</td><td>17.7°</td><td>14° (akşam 4.5°)</td></tr>
<tr><td>Jafari</td><td>16°</td><td>14° (akşam 4°)</td></tr>
<tr><td>Gulf Region</td><td>19.5°</td><td>akşamdan 90 dakika sonra</td></tr>
<tr><td>Kuwait</td><td>18°</td><td>17.5°</td></tr>
<tr><td>Qatar</td><td>18°</td><td>akşamdan 90 dakika sonra</td></tr>
<tr><td>Singapore</td><td>20°</td><td>18°</td></tr>
<tr><td>Türkiye — Diyanet</td><td>18°</td><td>17°</td></tr>
<tr><td>Union of Islamic Organisations of France</td><td>12°</td><td>12°</td></tr>
<tr><td>Russia</td><td>16°</td><td>15°</td></tr>
<tr><td>Malezya — JAKIM</td><td>20°</td><td>18°</td></tr>
<tr><td>Endonezya — Din İşleri Bakanlığı</td><td>20°</td><td>18°</td></tr>
<tr><td>Fas</td><td>18°</td><td>17°</td></tr>
</tbody></table>`)}
<p>Bu tabloda imsak 12° ile 20° arasında değişiyor. Bu yayılım hesap doğruluğundaki bir fark değil, <strong>her merciin benimsediği eşikteki</strong> farktır; ilmî ve kurumsal bir tercih olup programlama meselesi değildir.</p>

<h2>Açı mı, sabit süre mi</h2>
<p>Yukarıdaki üç yöntem yatsı için açı hiç kullanmaz: <strong>Umm al-Qura</strong>, <strong>Gulf Region</strong> ve <strong>Qatar</strong>. Bunlar akşamdan sonra <strong>sabit bir süre</strong> ekler.</p>
<p>İşte Umm al-Qura yöntemine göre Mekke, bu sitenin kendi motoruyla hesaplanmış:</p>

${T(`<table>
<thead><tr><th>Tarih</th><th>Akşam</th><th>Yatsı</th><th>Süre</th></tr></thead>
<tbody>
<tr><td>2026-01-15</td><td>17:59</td><td>19:29</td><td>90 dakika</td></tr>
<tr><td>2026-06-21</td><td>19:06</td><td>20:36</td><td>90 dakika</td></tr>
<tr><td>2026-09-23</td><td>18:16</td><td>19:46</td><td>90 dakika</td></tr>
<tr><td>2026-12-21</td><td>17:44</td><td>19:14</td><td>90 dakika</td></tr>
</tbody></table>`)}
<p>Süre hiç kaymaz; oysa açıya dayalı yatsı, mevsimle birlikte değişen bir aralık üretir. Mekke'de 21 Haziran 2026'da MWL'nin 17° yatsısı 20:26'ya, Umm al-Qura ise 20:36'ya düşüyor — on dakika fark. 21 Aralık'ta fark on beş dakikaya çıkıyor. Açı ile sabit sürenin pratik farkı budur.</p>
<p><strong>TimesPrayers şu anda yıl boyunca akşamdan sonra 90 dakikalık sabit bir süre uygulamaktadır.</strong></p>

<h2>Mercinin dakika düzeltmesi uyguladığı durum</h2>
<p>Bazı merciler yalnızca ham açıyı yayımlamaz. Yayımladıkları cetvelde <strong>ihtiyat dakikaları</strong> zaten bulunur — Türkiye'de temkin, Malezya ve Endonezya'da <em>ihtiyat</em>. Yalnız açıyı hesaplarsanız resmî cetvelden birkaç dakika şaşarsınız.</p>
<h3>Türkiye</h3>
<p><strong>Türkiye</strong> resmî olarak belgelenmiş en açık örnektir. Diyanet İşleri Başkanlığı açık bir temkin cetveli yayımlar: güneşin doğuşu yedi dakika öne alınır; öğleye beş, ikindiye dört, akşama yedi dakika eklenir; imsak ve yatsıda ise düzeltme yoktur. Bu site aynı yayımlanmış düzeltmeleri 18°/17° açılarının üzerine uygular.</p>
<h3>Malezya</h3>
<p><strong>Malezya</strong>'da JAKIM imsak için 20°, yatsı için 18° kullanır. TimesPrayers, yayımlanan cetvellerle örtüşmek için <strong>kendi dakika düzeltmelerini</strong> uygular; bu düzeltmeler resmî değerler değildir ve JAKIM'e atfedilemez.</p>
<h3>Endonezya</h3>
<p><strong>Endonezya</strong>'da bu site, Din İşleri Bakanlığı ölçütleriyle örtüşen 20° ve 18° açılarını kullanır ve <strong>ayrı bir <em>ihtiyat</em> dakika düzeltmesi uygulamaz</strong>. Kemenag belgeleri, namaz cetvellerinin hazırlanmasında ihtiyat dakikası eklenmesini anlatır; burada bu uygulanmamaktadır.</p>
<h3>Fas</h3>
<p><strong>Fas</strong>'ta bu site, 18° imsak açısını altı dakika öne alan sabit bir kaydırmayla kullanır. Sonucu, Habous ve İslami İşler Bakanlığı'nın yayımladığı Rabat cetveliyle 2026 Ağustos–Eylül'ünde dört tarihte karşılaştırdık; incelenen örneklemde imsağımız yayımlanan vakitten <strong>bir ila iki dakika</strong> içinde kaldı. Bakanlığa belirli bir hesap açısı atfetmiyoruz.</p>

<h2>İkindi nasıl hesaplanır</h2>
<p>İkindinin yaygın olarak kullanılan iki tanımı vardır; ikisi de gölge uzunluğuna dayanır:</p>
<ul>
<li><strong>Gölge katsayısı 1</strong> — bir cismin gölgesi kendi boyuna eşitlendiğinde, öğle vaktindeki gölge de eklenerek ikindi girer. Burada varsayılan budur.</li>
<li><strong>Gölge katsayısı 2</strong> — gölge cismin boyunun iki katına ulaştığında, öğle gölgesi de eklenerek ikindi girer.</li>
</ul>
<p>Fark küçük değil, belirgindir. Kahire'de 21 Mart 2026'da MWL'ye göre katsayı 1 ikindiyi <strong>15:30</strong>'da, katsayı 2 ise <strong>16:24</strong>'te verir — elli dört dakika fark.</p>
<p>Site her iki tanımı da destekler ve varsayılan olarak gölge katsayısı 1'i kullanır. Kullanıcının hangi tanımı izleyeceği, bağlı olduğu mezhebe veya mercie göre değişir.</p>

<h2>Yöntem otomatik olarak nasıl seçilir</h2>
<p>Bir şehir sayfasını açtığınızda site yöntemi <strong>o şehrin ülkesine göre</strong> seçer: Mısır ve Libya Mısır yöntemini, Fransa Fransız birliğininkini, Türkiye Diyanet'i, İran Tehran'ı, Pakistan/Hindistan/Bangladeş/Afganistan Karachi'yi, Malezya JAKIM'i, Endonezya kendi Din İşleri Bakanlığı'nı, Singapur ile Brunei bölgesel yöntemi kullanır. Eşlenmemiş her ülke, mevcut uygulamada yedek yöntem olarak MWL'yi kullanır.</p>

<h2>Bunun son vakitlere yansıması</h2>
<p>Bir örnek hepsini bağlıyor. Kahire (30.0444° N, 31.2357° E), 21 Mart 2026, UTC+2, bu sitede hesaplanmış:</p>

${T(`<table>
<thead><tr><th>Yöntem</th><th>İmsak</th><th>Güneş</th><th>Öğle</th><th>İkindi</th><th>Akşam</th><th>Yatsı</th></tr></thead>
<tbody>
<tr><td>MWL</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:22</td></tr>
<tr><td>ISNA</td><td>04:52</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:13</td></tr>
<tr><td>Egyptian</td><td>04:31</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:25</td></tr>
<tr><td>Umm al-Qura</td><td>04:36</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:37</td></tr>
<tr><td>Karachi</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:27</td></tr>
</tbody></table>`)}
<p><strong>Güneş, öğle ve akşam beşinde de aynıdır</strong> — tanımları geometriktir ve seçilen alacakaranlık eşiğine bağlı değildir. Bütün yayılım imsak ile yatsıdadır: en dar imsak açısı (ISNA 15°) ile en genişi (Egyptian 19.5°) arasında yirmi bir dakika. İkindi burada örtüşüyor, çünkü beşi de aynı varsayılan gölge katsayısını paylaşıyor.</p>

<h2>Yüksek enlemler</h2>
<p>Kuzeye ya da güneye gittikçe, güneşin gerekli açıya hiç inmediği bir güne daha çabuk varılır — yani o gün astronomik imsak ya da yatsı yoktur. Bunun yerine geceyi bölen bir tahmin kuralı kullanılır. Bu site üç yaygın kuralı, ayrıca Almanya'daki konumlar için kendine ait dördüncü bir kuralı uygular; bu dördüncüsü, açıya yeterli payla gerçekten ulaşılıp ulaşılmadığına bakarak gerçek hesap ile tahmin arasında seçim yapar. <a href="/tr/guides/why-prayer-times-differ">Ayrı bir rehber</a> konuyu ayrıntısıyla ele alıyor.</p>

<h2>Size uygun olanı seçmek</h2>
<p>Pratik kural basittir: <strong>caminizin ya da ülkenizdeki merciin kullandığını izleyin.</strong> Amaç cemaatle namaz kılmaktır, bir sayıyı tutturmak değil. Site de bu yüzden varsayılan olarak şehrin ülkesine bağlı yöntemi seçer.</p>
<p>Başka bir kaynakla karşılaştıracaksanız adil karşılaştırın: aynı tarih, aynı koordinat, aynı yöntem, aynı ikindi tanımı. Görünürdeki hataların çoğu, sonunda iki farklı ayar olarak çıkar.</p>
`,
sources: `
<h2>Kaynaklar</h2>
<p class="guide-sources-note">Aşağıdaki açılar ve dakika düzeltmeleri, bunları yayımlayan kurumlara atfedilmiştir. Bu sayfadaki her sayısal karşılaştırma, her örnekte adı geçen tarih ve koordinatlarla bu sitenin motorunda hesaplanmıştır.</p>
<ul>
<li>Diyanet İşleri Başkanlığı (Türkiye) — resmî temkin cetveli: <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Habous ve İslami İşler Bakanlığı, Fas — yayımlanan Rabat cetveli: <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Endonezya Cumhuriyeti Din İşleri Bakanlığı (Kemenag) — namaz cetveli ölçütleri</li>
<li>Umm al-Qura Üniversitesi, Mekke — yayımlanan hesap standardı</li>
<li>Muslim World League · Egyptian General Authority of Survey · University of Islamic Sciences, Karachi · ISNA · Union of Islamic Organisations of France · JAKIM Malaysia</li>
<li>Karşılaştırmalı parametre tablosu: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
<p class="guide-sources-note"><strong>Not:</strong> bazı merciler ihtiyat dakikalarını zaten içeren cetveller yayımlar. Uyguladığımızın resmî açıdan ayrıldığı yerlerde bunu sayfanın metninde açıkça söylüyoruz.</p>

---
`,
related: [
  { href: '/tr/guides/why-prayer-times-differ', label: 'Namaz Vakitleri Uygulamalar ve Siteler Arasında Neden Farklı?' },
  { href: '/tr/guides/how-qibla-direction-is-calculated', label: 'Kıble Yönü Nasıl Hesaplanır' },
  { href: '/tr/prayer-times-worldwide', label: 'Dünya Genelinde Namaz Vakitleri' },
],
},
ur: {
h1: 'اوقاتِ نماز کے حساب کے طریقے اور زاویے',
body: `
<p class="guide-intro">ایک ہی شہر میں دو نماز ایپس کھولیے تو فجر کے وقت میں پندرہ منٹ کا فرق نکل سکتا ہے۔ یہ عموماً کوئی خرابی نہیں ہوتی۔ اس کا مطلب اکثر یہ ہوتا ہے کہ ہر ایپ ذرا مختلف سوال کا جواب دے رہی ہے: <strong>فجر کا آغاز کب مانا جائے؟</strong> یہ صفحہ بتاتا ہے کہ اس سوال کو حساب میں کیسے ڈھالا جاتا ہے، اور یہ سائٹ بالکل کیا کرتی ہے۔</p>

<h2>اصل میں حساب کس چیز کا ہوتا ہے</h2>
<p>اوقاتِ نماز کوئی پہلے سے محفوظ جدول نہیں ہوتے۔ یہ <strong>آپ کے افق کے مقابلے میں سورج کی پوزیشن</strong> سے نکالے جاتے ہیں۔ حساب کو تین چیزیں درکار ہوتی ہیں: عرض البلد، طول البلد اور تاریخ۔ انہی سے اُس دن سورج کا <strong>میلان</strong> اور <strong>تعدیلِ وقت</strong> نکالی جاتی ہے، پھر وہ لمحہ تلاش کیا جاتا ہے جب سورج ایک مقررہ بلندی پر پہنچتا ہے۔</p>
<p>کچھ اوقات کی تعریف براہِ راست ہندسی ہے: <strong>ظہر</strong> وہ ہے جب سورج نصف النہار سے گزرتا ہے؛ <strong>طلوعِ آفتاب</strong> اور <strong>مغرب</strong> وہ ہیں جب سورج کا قرص افق سے ملتا ہے۔ <strong>فجر</strong> اور <strong>عشاء</strong> کا معاملہ مختلف ہے۔ دونوں شفق سے جڑے ہیں، اور شفق ایک تدریجی دھندلاہٹ ہے، کوئی کٹا ہوا لمحہ نہیں۔ اختلاف بالکل یہیں سے شروع ہوتا ہے۔</p>

<h2>«فجر کے زاویے» کا مطلب کیا ہے</h2>
<p>چونکہ شفق تدریجی ہے، اس لیے ایک قابلِ پیمائش حد درکار تھی۔ جو حد اپنائی گئی وہ یہ ہے کہ <strong>سورج افق سے کتنا نیچے اتر چکا ہے</strong>۔</p>
<p>جب کوئی طریقہ فجر کے لیے <strong>18°</strong> کا زاویہ استعمال کرتا ہے تو اس کا مطلب ہے: وہ لمحہ نکالیے جب طلوع سے پہلے سورج کا مرکز افق سے 18 درجے نیچے ہو۔ بڑا زاویہ سورج کو مزید نیچے رکھتا ہے، اس لیے وقت <strong>پہلے</strong> آ جاتا ہے۔ <bdi>19.5°</bdi> والی فجر <bdi>15°</bdi> والی فجر سے پہلے ہوتی ہے۔</p>
<p>اس فرق کی مقدار ہمیشہ ایک جیسی نہیں رہتی۔ درمیانی عرض البلد پر ایک درجہ سردیوں میں تقریباً <strong>پانچ منٹ</strong> کے برابر ہوتا ہے اور گرمیوں کے انقلاب کے قریب <strong>سات منٹ</strong> تک پہنچ سکتا ہے، کیونکہ سورج کم ڈھلوان پر اترتا ہے اور اسی ایک درجے کو عبور کرنے میں زیادہ وقت لیتا ہے۔ موسم کے ساتھ ہونے والی یہی تبدیلی اس کی بڑی وجہ ہے کہ دو ایپس کا فرق پورے سال ایک جیسا نہیں رہتا۔</p>

<h2>وہ طریقے جو یہ سائٹ نافذ کرتی ہے</h2>
<p>سترہ طریقے نافذ ہیں۔ نیچے دی گئی ہر قیمت وہی ہے جو حساب میں واقعتاً استعمال ہوتی ہے:</p>

${T(`<table>
<thead><tr><th>طریقہ</th><th>فجر</th><th>عشاء</th></tr></thead>
<tbody>
<tr><td><bdi>Muslim World League (MWL)</bdi></td><td>18°</td><td>17°</td></tr>
<tr><td><bdi>ISNA</bdi> (شمالی امریکہ)</td><td>15°</td><td>15°</td></tr>
<tr><td><bdi>Egyptian General Authority of Survey</bdi></td><td>19.5°</td><td>17.5°</td></tr>
<tr><td><bdi>Umm al-Qura</bdi>، مکہ مکرمہ</td><td>18.5°</td><td>مغرب کے بعد 90 منٹ</td></tr>
<tr><td><bdi>University of Islamic Sciences, Karachi</bdi></td><td>18°</td><td>18°</td></tr>
<tr><td><bdi>Institute of Geophysics, Tehran</bdi></td><td>17.7°</td><td>14° (مغرب <bdi>4.5°</bdi>)</td></tr>
<tr><td><bdi>Jafari</bdi></td><td>16°</td><td>14° (مغرب <bdi>4°</bdi>)</td></tr>
<tr><td><bdi>Gulf Region</bdi></td><td>19.5°</td><td>مغرب کے بعد 90 منٹ</td></tr>
<tr><td><bdi>Kuwait</bdi></td><td>18°</td><td>17.5°</td></tr>
<tr><td><bdi>Qatar</bdi></td><td>18°</td><td>مغرب کے بعد 90 منٹ</td></tr>
<tr><td><bdi>Singapore</bdi></td><td>20°</td><td>18°</td></tr>
<tr><td>ترکی — <bdi>Diyanet</bdi></td><td>18°</td><td>17°</td></tr>
<tr><td><bdi>Union of Islamic Organisations of France</bdi></td><td>12°</td><td>12°</td></tr>
<tr><td><bdi>Russia</bdi></td><td>16°</td><td>15°</td></tr>
<tr><td>ملائیشیا — <bdi>JAKIM</bdi></td><td>20°</td><td>18°</td></tr>
<tr><td>انڈونیشیا — وزارتِ مذہبی امور</td><td>20°</td><td>18°</td></tr>
<tr><td>مراکش</td><td>18°</td><td>17°</td></tr>
</tbody></table>`)}
<p>اس جدول میں فجر <bdi>12°</bdi> سے <bdi>20°</bdi> تک پھیلی ہوئی ہے۔ یہ پھیلاؤ حسابی درستگی کا فرق نہیں، بلکہ <strong>ہر ادارے کی اپنائی ہوئی حد</strong> کا فرق ہے، جو علمی اور ادارہ جاتی فیصلہ ہے، پروگرامنگ کا نہیں۔</p>

<h2>زاویہ اور مقررہ وقفہ</h2>
<p>اوپر کے تین طریقے عشاء کے لیے کوئی زاویہ استعمال ہی نہیں کرتے: <strong><bdi>Umm al-Qura</bdi></strong>، <strong><bdi>Gulf Region</bdi></strong> اور <strong><bdi>Qatar</bdi></strong>۔ یہ مغرب کے بعد ایک <strong>مقررہ وقفہ</strong> جوڑ دیتے ہیں۔</p>
<p>یہ رہا مکہ مکرمہ، <bdi>Umm al-Qura</bdi> طریقے پر، اسی سائٹ کے انجن سے نکالا ہوا:</p>

${T(`<table>
<thead><tr><th>تاریخ</th><th>مغرب</th><th>عشاء</th><th>وقفہ</th></tr></thead>
<tbody>
<tr><td><bdi>2026-01-15</bdi></td><td>17:59</td><td>19:29</td><td>90 منٹ</td></tr>
<tr><td><bdi>2026-06-21</bdi></td><td>19:06</td><td>20:36</td><td>90 منٹ</td></tr>
<tr><td><bdi>2026-09-23</bdi></td><td>18:16</td><td>19:46</td><td>90 منٹ</td></tr>
<tr><td><bdi>2026-12-21</bdi></td><td>17:44</td><td>19:14</td><td>90 منٹ</td></tr>
</tbody></table>`)}
<p>وقفہ کبھی نہیں ہلتا، جبکہ زاویے پر مبنی عشاء ایسا وقفہ دیتی ہے جو موسموں کے ساتھ بدلتا رہتا ہے۔ مکہ مکرمہ میں 21 جون 2026 کو <bdi>MWL</bdi> کی <bdi>17°</bdi> والی عشاء 20:26 پر آتی ہے جبکہ <bdi>Umm al-Qura</bdi> 20:36 دیتا ہے — دس منٹ کا فرق۔ 21 دسمبر کو یہ فرق بڑھ کر پندرہ منٹ ہو جاتا ہے۔ زاویے اور وقفے کا عملی فرق یہی ہے۔</p>
<p><strong><bdi>TimesPrayers</bdi> اس وقت پورے سال مغرب کے بعد 90 منٹ کا مقررہ وقفہ نافذ کرتی ہے۔</strong></p>

<h2>جب ادارہ منٹ کی ترمیمات نافذ کرتا ہے</h2>
<p>کچھ ادارے صرف خام زاویہ شائع نہیں کرتے۔ وہ ایسا جدول شائع کرتے ہیں جس میں <strong>احتیاطی منٹ</strong> پہلے سے شامل ہوتے ہیں — ترکی میں <em>temkin</em>، ملائیشیا اور انڈونیشیا میں <em>ihtiyat</em>۔ اکیلے زاویے کا حساب کیجیے تو سرکاری جدول سے کئی منٹ کا فرق رہ جائے گا۔</p>
<h3>ترکی</h3>
<p><strong>ترکی</strong> سب سے واضح سرکاری طور پر دستاویزی مثال ہے۔ دیانت (<bdi>Diyanet İşleri Başkanlığı</bdi>) ایک صریح <em>temkin</em> جدول شائع کرتا ہے: طلوعِ آفتاب سات منٹ پہلے کر دیا جاتا ہے، جبکہ ظہر میں پانچ، عصر میں چار اور مغرب میں سات منٹ جوڑے جاتے ہیں؛ امساک اور عشاء پر کوئی ترمیم نہیں۔ <bdi>TimesPrayers</bdi> انہی شائع شدہ تعدیلات کو <bdi>18°/17°</bdi> کے زاویوں کے اوپر نافذ کرتی ہے۔</p>
<h3>ملائیشیا</h3>
<p><strong>ملائیشیا</strong> میں <bdi>JAKIM</bdi> فجر کے لیے <bdi>20°</bdi> اور عشاء کے لیے <bdi>18°</bdi> استعمال کرتا ہے۔ <bdi>TimesPrayers</bdi> شائع شدہ اوقات کے جدولوں سے ہم آہنگی کے لیے اپنی منٹ کی ترمیمات لگاتی ہے؛ یہ ترمیمات سرکاری قیمتیں نہیں ہیں اور انہیں <bdi>JAKIM</bdi> کی طرف منسوب نہیں کیا جا سکتا۔</p>
<h3>انڈونیشیا</h3>
<p><strong>انڈونیشیا</strong> میں یہ سائٹ <bdi>20°</bdi> اور <bdi>18°</bdi> کے وہی زاویے استعمال کرتی ہے جو وزارتِ مذہبی امور کے معیار سے مطابقت رکھتے ہیں، اور <strong>کوئی الگ <em>ihtiyath</em> منٹ کی ترمیم نافذ نہیں کرتی</strong>۔ <bdi>Kemenag</bdi> کی دستاویزات اوقات کے جدول کی تیاری میں احتیاطی منٹ جوڑنے کا ذکر کرتی ہیں؛ یہاں وہ نافذ نہیں کیا جاتا۔</p>
<h3>مراکش</h3>
<p><strong>مراکش</strong> میں یہ سائٹ <bdi>18°</bdi> والی فجر کے ساتھ چھ منٹ پہلے کی ایک مقررہ منتقلی استعمال کرتی ہے۔ ہم نے نتیجے کا موازنہ وزارتِ اوقاف و اسلامی امور کے شائع کردہ رباط کے اوقات کے جدول سے اگست اور ستمبر 2026 کی چار تاریخوں پر کیا، اور جانچے گئے نمونے میں ہماری فجر شائع شدہ وقت سے <strong>ایک سے دو منٹ</strong> کے اندر رہی۔ ہم وزارت کی طرف کوئی متعین حسابی زاویہ منسوب نہیں کرتے۔</p>

<h2>عصر کا حساب کیسے ہوتا ہے</h2>
<p>عصر کی دو تعریفیں عام طور پر رائج ہیں، دونوں سائے کی لمبائی پر مبنی:</p>
<ul>
<li><strong>سایہ عامل 1</strong> — عصر تب شروع ہوتی ہے جب کسی چیز کا سایہ اس کی اپنی لمبائی کے برابر ہو جائے، اس کے ساتھ دوپہر کا سایہ شامل کر کے۔ یہاں یہی طے شدہ قیمت ہے۔</li>
<li><strong>سایہ عامل 2</strong> — عصر تب شروع ہوتی ہے جب سایہ چیز کی لمبائی سے دوگنا ہو جائے، اس کے ساتھ دوپہر کا سایہ شامل کر کے۔</li>
</ul>
<p>یہ فرق معمولی نہیں بلکہ نمایاں ہے۔ قاہرہ میں 21 مارچ 2026 کو <bdi>MWL</bdi> کے تحت عامل 1 عصر <strong>15:30</strong> پر دیتا ہے اور عامل 2 <strong>16:24</strong> پر — چون منٹ کا فرق۔</p>
<p>سائٹ دونوں تعریفوں کو سنبھالتی ہے اور بطورِ طے شدہ سایہ عامل 1 استعمال کرتی ہے۔ صارف کون سی تعریف اپناتا ہے، اس کا انحصار اُس مکتبِ فکر یا ادارے پر ہے جس کی وہ پیروی کرتا ہے۔</p>

<h2>طریقہ خودکار طور پر کیسے چنا جاتا ہے</h2>
<p>جب آپ کسی شہر کا صفحہ کھولتے ہیں تو سائٹ طریقہ <strong>اُس شہر کے ملک کے حساب سے</strong> چنتی ہے: مصر اور لیبیا مصری طریقہ، فرانس فرانسیسی اتحاد کا، ترکی <bdi>Diyanet</bdi>، ایران <bdi>Tehran</bdi>، پاکستان/بھارت/بنگلہ دیش/افغانستان <bdi>Karachi</bdi>، ملائیشیا <bdi>JAKIM</bdi>، انڈونیشیا اس کی وزارتِ مذہبی امور، اور سنگاپور و برونائی علاقائی طریقہ۔ جو ملک نقشے میں نہ ہو، وہ موجودہ نفاذ میں <bdi>MWL</bdi> کو متبادل طریقے کے طور پر استعمال کرتا ہے۔</p>

<h2>آخری اوقات پر اس کا اثر کیسا دکھتا ہے</h2>
<p>ایک مثال سب کو جوڑ دیتی ہے۔ قاہرہ (<bdi>30.0444° N، 31.2357° E</bdi>)، 21 مارچ 2026، <bdi>UTC+2</bdi>، اسی سائٹ سے حساب شدہ:</p>

${T(`<table>
<thead><tr><th>طریقہ</th><th>فجر</th><th>طلوعِ آفتاب</th><th>ظہر</th><th>عصر</th><th>مغرب</th><th>عشاء</th></tr></thead>
<tbody>
<tr><td><bdi>MWL</bdi></td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:22</td></tr>
<tr><td><bdi>ISNA</bdi></td><td>04:52</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:13</td></tr>
<tr><td><bdi>Egyptian</bdi></td><td>04:31</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:25</td></tr>
<tr><td><bdi>Umm al-Qura</bdi></td><td>04:36</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:37</td></tr>
<tr><td><bdi>Karachi</bdi></td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:27</td></tr>
</tbody></table>`)}
<p><strong>طلوعِ آفتاب، ظہر اور مغرب پانچوں میں یکساں ہیں</strong> — ان کی تعریفیں ہندسی ہیں اور کسی چنی ہوئی شفقی حد پر منحصر نہیں۔ سارا پھیلاؤ فجر اور عشاء میں ہے: سب سے تنگ فجر کے زاویے (<bdi>ISNA 15°</bdi>) اور سب سے چوڑے (<bdi>Egyptian 19.5°</bdi>) کے درمیان اکیس منٹ۔ عصر یہاں اس لیے ملتی ہے کہ پانچوں کا طے شدہ سایہ عامل ایک ہی ہے۔</p>

<h2>بلند عرض البلد</h2>
<p>آپ جتنا شمال یا جنوب کی طرف بڑھتے ہیں، اتنی ہی جلدی ایسا دن آ جاتا ہے جب سورج مطلوبہ زاویے تک اترتا ہی نہیں — چنانچہ اُس دن فلکی فجر یا عشاء ہوتی ہی نہیں۔ اس کے بجائے رات کو تقسیم کرنے والا ایک تخمینی اصول استعمال ہوتا ہے۔ یہ سائٹ تین عام اصول نافذ کرتی ہے، اور ان کے علاوہ ایک چوتھا اپنا اصول جو جرمن مقامات کے لیے استعمال ہوتا ہے اور جو حقیقی حساب اور تخمینے کے درمیان اس بنیاد پر انتخاب کرتا ہے کہ زاویہ کافی گنجائش کے ساتھ واقعتاً پہنچا یا نہیں۔ ایک <a href="/ur/guides/why-prayer-times-differ">الگ رہنما مضمون</a> اسے تفصیل سے دیکھتا ہے۔</p>

<h2>اپنے لیے مناسب انتخاب</h2>
<p>عملی اصول سادہ ہے: <strong>وہی اپنائیے جو آپ کی مسجد یا آپ کے ملک کا ادارہ استعمال کرتا ہے۔</strong> مقصد جماعت کے ساتھ نماز پڑھنا ہے، کسی عدد سے مطابقت پیدا کرنا نہیں۔ اسی لیے سائٹ طے شدہ طور پر وہ طریقہ اپناتی ہے جو شہر کے ملک سے وابستہ ہے۔</p>
<p>اگر آپ کسی دوسرے ذریعے سے موازنہ کریں تو انصاف سے کیجیے: وہی تاریخ، وہی کوآرڈینیٹس، وہی طریقہ، عصر کی وہی تعریف۔ بظاہر نظر آنے والی زیادہ تر غلطیاں دراصل دو مختلف ترتیبات نکلتی ہیں۔</p>
`,
sources: `
<h2>مصادر</h2>
<p class="guide-sources-note">نیچے دیے گئے زاویے اور منٹ کی ترمیمات اُنہی اداروں کی طرف منسوب ہیں جو انہیں شائع کرتے ہیں۔ اس صفحے کا ہر عددی موازنہ اسی سائٹ کے انجن سے، ہر مثال میں مذکور تاریخوں اور کوآرڈینیٹس کے ساتھ نکالا گیا ہے۔</p>
<ul>
<li><bdi>Diyanet İşleri Başkanlığı</bdi> (ترکی) — سرکاری <em>temkin</em> جدول: <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>وزارتِ اوقاف و اسلامی امور، مراکش — رباط کا شائع شدہ اوقات کا جدول: <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>جمہوریہ انڈونیشیا کی وزارتِ مذہبی امور (<bdi>Kemenag</bdi>) — اوقاتِ نماز کے جدول کے معیارات</li>
<li><bdi>Umm al-Qura University</bdi>، مکہ مکرمہ — شائع شدہ حسابی معیار</li>
<li><bdi>Muslim World League</bdi> · <bdi>Egyptian General Authority of Survey</bdi> · <bdi>University of Islamic Sciences, Karachi</bdi> · <bdi>ISNA</bdi> · <bdi>Union of Islamic Organisations of France</bdi> · <bdi>JAKIM Malaysia</bdi></li>
<li>پیرامیٹرز کا تقابلی جدول: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
<p class="guide-sources-note"><strong>نوٹ:</strong> کچھ ادارے ایسے جدول شائع کرتے ہیں جن میں احتیاطی منٹ پہلے ہی شامل ہوتے ہیں۔ جہاں ہم جو نافذ کرتے ہیں وہ سرکاری زاویے سے مختلف ہو، ہم اسے صفحے کے متن میں صاف کہہ دیتے ہیں۔</p>

---
`,
related: [
  { href: '/ur/guides/why-prayer-times-differ', label: 'اوقاتِ نماز ایپس اور ویب سائٹس کے درمیان مختلف کیوں ہوتے ہیں؟' },
  { href: '/ur/guides/how-qibla-direction-is-calculated', label: 'سمتِ قبلہ کا حساب کیسے ہوتا ہے' },
  { href: '/ur/prayer-times-worldwide', label: 'دنیا بھر کے اوقاتِ نماز' },
],
},
de: {
h1: 'Berechnungsmethoden für Gebetszeiten und ihre Winkel',
body: `
<p class="guide-intro">Öffnen Sie zwei Gebets-Apps in derselben Stadt, und Fajr kann fünfzehn Minuten auseinanderliegen. Das ist meist kein Fehler. Meist heißt es, dass jede App eine etwas andere Frage beantwortet: <strong>Ab wann gilt Fajr als eingetreten?</strong> Diese Seite erklärt, wie aus dieser Frage eine Rechnung wird — und was diese Website genau tut.</p>

<h2>Was tatsächlich berechnet wird</h2>
<p>Gebetszeiten sind kein gespeicherter Kalender. Sie werden aus <strong>dem Sonnenstand relativ zu Ihrem Horizont</strong> abgeleitet. Die Rechnung braucht drei Eingaben: Breitengrad, Längengrad und Datum. Daraus ergeben sich die <strong>Deklination</strong> der Sonne für diesen Tag und die <strong>Zeitgleichung</strong>; anschließend wird der Moment gesucht, in dem die Sonne eine bestimmte Höhe erreicht.</p>
<p>Einige Zeiten haben eine unmittelbare geometrische Definition: <strong>Dhuhr</strong> ist der Meridiandurchgang der Sonne; <strong>Sonnenaufgang</strong> und <strong>Maghrib</strong> sind die Momente, in denen die Sonnenscheibe den Horizont berührt. <strong>Fajr</strong> und <strong>Isha</strong> sind anders geartet. Beide hängen an der Dämmerung, und Dämmerung ist ein allmähliches Verblassen, kein scharfer Augenblick. Genau dort gehen die Methoden auseinander.</p>

<h2>Was ein «Fajr-Winkel» bedeutet</h2>
<p>Weil die Dämmerung allmählich verläuft, brauchte es eine messbare Schwelle. Die gewählte Schwelle lautet: <strong>wie tief die Sonne unter den Horizont gesunken ist</strong>.</p>
<p>Wenn eine Methode einen Fajr-Winkel von <strong>18°</strong> verwendet, heißt das: Suche den Moment, in dem der Sonnenmittelpunkt vor dem Sonnenaufgang 18 Grad unter dem Horizont steht. Ein größerer Winkel setzt die Sonne tiefer, die Zeit fällt also <strong>früher</strong>. Ein Fajr bei 19.5° liegt früher als einer bei 15°.</p>
<p>Die Größe dieses Abstands ist nicht konstant. In mittleren Breiten entspricht ein Grad im Winter etwa <strong>fünf Minuten</strong> und kann nahe der Sommersonnenwende <strong>sieben Minuten</strong> erreichen, weil die Sonne flacher absinkt und länger braucht, denselben Grad zu durchlaufen. Diese jahreszeitliche Schwankung ist ein Hauptgrund dafür, dass der Unterschied zwischen zwei Apps übers Jahr nicht gleich bleibt.</p>

<h2>Die Methoden dieser Website</h2>
<p>Siebzehn Methoden sind implementiert. Jeder Wert unten ist der Wert, den die Rechnung tatsächlich verwendet:</p>

${T(`<table>
<thead><tr><th>Methode</th><th>Fajr</th><th>Isha</th></tr></thead>
<tbody>
<tr><td>Muslim World League (MWL)</td><td>18°</td><td>17°</td></tr>
<tr><td>ISNA (Nordamerika)</td><td>15°</td><td>15°</td></tr>
<tr><td>Egyptian General Authority of Survey</td><td>19.5°</td><td>17.5°</td></tr>
<tr><td>Umm al-Qura, Mekka</td><td>18.5°</td><td>90 Minuten nach Maghrib</td></tr>
<tr><td>University of Islamic Sciences, Karachi</td><td>18°</td><td>18°</td></tr>
<tr><td>Institute of Geophysics, Tehran</td><td>17.7°</td><td>14° (Maghrib 4.5°)</td></tr>
<tr><td>Jafari</td><td>16°</td><td>14° (Maghrib 4°)</td></tr>
<tr><td>Gulf Region</td><td>19.5°</td><td>90 Minuten nach Maghrib</td></tr>
<tr><td>Kuwait</td><td>18°</td><td>17.5°</td></tr>
<tr><td>Qatar</td><td>18°</td><td>90 Minuten nach Maghrib</td></tr>
<tr><td>Singapore</td><td>20°</td><td>18°</td></tr>
<tr><td>Türkei — Diyanet</td><td>18°</td><td>17°</td></tr>
<tr><td>Union of Islamic Organisations of France</td><td>12°</td><td>12°</td></tr>
<tr><td>Russia</td><td>16°</td><td>15°</td></tr>
<tr><td>Malaysia — JAKIM</td><td>20°</td><td>18°</td></tr>
<tr><td>Indonesien — Ministerium für religiöse Angelegenheiten</td><td>20°</td><td>18°</td></tr>
<tr><td>Marokko</td><td>18°</td><td>17°</td></tr>
</tbody></table>`)}
<p>Fajr reicht in dieser Tabelle von 12° bis 20°. Diese Spanne ist kein Unterschied in der Rechengenauigkeit, sondern ein Unterschied in <strong>der Schwelle, die jede Institution gewählt hat</strong> — eine gelehrte und institutionelle Entscheidung, keine programmiertechnische.</p>

<h2>Winkel oder festes Intervall</h2>
<p>Drei der obigen Methoden verwenden für Isha überhaupt keinen Winkel: <strong>Umm al-Qura</strong>, <strong>Gulf Region</strong> und <strong>Qatar</strong>. Sie fügen nach Maghrib ein <strong>festes Intervall</strong> an.</p>
<p>Hier Mekka nach der Umm-al-Qura-Methode, berechnet mit der eigenen Engine dieser Website:</p>

${T(`<table>
<thead><tr><th>Datum</th><th>Maghrib</th><th>Isha</th><th>Intervall</th></tr></thead>
<tbody>
<tr><td>2026-01-15</td><td>17:59</td><td>19:29</td><td>90 Minuten</td></tr>
<tr><td>2026-06-21</td><td>19:06</td><td>20:36</td><td>90 Minuten</td></tr>
<tr><td>2026-09-23</td><td>18:16</td><td>19:46</td><td>90 Minuten</td></tr>
<tr><td>2026-12-21</td><td>17:44</td><td>19:14</td><td>90 Minuten</td></tr>
</tbody></table>`)}
<p>Das Intervall verschiebt sich nie, während ein winkelbasiertes Isha einen Abstand erzeugt, der mit den Jahreszeiten wandert. In Mekka fällt am 21. Juni 2026 das 17°-Isha der MWL auf 20:26, Umm al-Qura dagegen auf 20:36 — zehn Minuten Unterschied. Am 21. Dezember wächst der Abstand auf fünfzehn Minuten. Das ist der praktische Unterschied zwischen Winkel und Intervall.</p>
<p><strong>TimesPrayers verwendet derzeit ganzjährig ein festes Intervall von 90 Minuten nach Maghrib.</strong></p>

<h2>Wenn eine Institution Minutenanpassungen anwendet</h2>
<p>Manche Institutionen veröffentlichen nicht nur den rohen Winkel. Sie veröffentlichen eine Tabelle, in der <strong>Vorsichtsminuten</strong> bereits enthalten sind — <em>temkin</em> in der Türkei, <em>ihtiyat</em> in Malaysia und Indonesien. Rechnen Sie nur den Winkel, verfehlen Sie die amtliche Tabelle um mehrere Minuten.</p>
<h3>Türkei</h3>
<p>Die <strong>Türkei</strong> ist der am klarsten amtlich dokumentierte Fall. Diyanet İşleri Başkanlığı, die türkische Behörde für religiöse Angelegenheiten, veröffentlicht eine ausdrückliche <em>temkin</em>-Tabelle: der Sonnenaufgang wird um sieben Minuten vorverlegt, während beim Dhuhr fünf, beim Asr vier und beim Maghrib sieben Minuten hinzugefügt werden; auf Imsak und Isha entfällt jede Anpassung. Diese Website wendet dieselben veröffentlichten Anpassungen zusätzlich zu den Winkeln 18°/17° an.</p>
<h3>Malaysia</h3>
<p>In <strong>Malaysia</strong> verwendet JAKIM 20° für Fajr und 18° für Isha. TimesPrayers wendet <strong>eigene Minutenanpassungen</strong> an, um mit den veröffentlichten Kalendern übereinzustimmen; diese Anpassungen sind keine offiziellen Werte und werden JAKIM nicht zugeschrieben.</p>
<h3>Indonesien</h3>
<p>In <strong>Indonesien</strong> verwendet diese Website die Winkel 20° und 18°, die den Kriterien des Ministeriums für religiöse Angelegenheiten entsprechen, und <strong>wendet keine gesonderte <em>ihtiyath</em>-Minutenanpassung an</strong>. Unterlagen von Kemenag beschreiben das Hinzufügen von Vorsichtsminuten bei der Erstellung von Gebetskalendern; hier wird das nicht angewandt.</p>
<h3>Marokko</h3>
<p>In <strong>Marokko</strong> verwendet diese Website einen Fajr-Winkel von 18° mit einer festen Verschiebung um sechs Minuten nach vorn. Wir haben das Ergebnis mit dem veröffentlichten Rabat-Kalender des Ministeriums für Habous und islamische Angelegenheiten an vier Terminen im August und September 2026 verglichen; in der geprüften Stichprobe lag unser Fajr <strong>ein bis zwei Minuten</strong> von der veröffentlichten Zeit entfernt. Wir schreiben dem Ministerium keinen bestimmten Berechnungswinkel zu.</p>

<h2>Wie Asr berechnet wird</h2>
<p>Für Asr gibt es zwei weit verbreitete Definitionen, beide über die Schattenlänge:</p>
<ul>
<li><strong>Schattenfaktor 1</strong> — Asr beginnt, wenn der Schatten eines Gegenstands seiner eigenen Länge entspricht, zuzüglich des Mittagsschattens. Das ist hier die Voreinstellung.</li>
<li><strong>Schattenfaktor 2</strong> — Asr beginnt, wenn der Schatten die doppelte Länge des Gegenstands erreicht, zuzüglich des Mittagsschattens.</li>
</ul>
<p>Der Unterschied ist erheblich, nicht marginal. In Kairo am 21. März 2026 ergibt Faktor 1 nach MWL Asr um <strong>15:30</strong> und Faktor 2 um <strong>16:24</strong> — vierundfünfzig Minuten auseinander.</p>
<p>Die Website unterstützt beide Definitionen und verwendet standardmäßig Schattenfaktor 1. Welcher Definition jemand folgt, hängt von der Rechtsschule oder Institution ab, der er folgt.</p>

<h2>Wie die Methode automatisch gewählt wird</h2>
<p>Wenn Sie eine Stadtseite öffnen, wählt die Website die Methode <strong>nach dem Land dieser Stadt</strong>: Ägypten und Libyen die ägyptische Methode, Frankreich die des französischen Verbands, die Türkei Diyanet, Iran Tehran, Pakistan/Indien/Bangladesch/Afghanistan Karachi, Malaysia JAKIM, Indonesien sein Ministerium für religiöse Angelegenheiten, Singapur und Brunei die regionale Methode. Jedes nicht zugeordnete Land verwendet in der aktuellen Implementierung MWL als Ausweichmethode.</p>

<h2>Wie sich das in den fertigen Zeiten zeigt</h2>
<p>Ein Beispiel bindet alles zusammen. Kairo (30.0444° N, 31.2357° E), 21. März 2026, UTC+2, berechnet von dieser Website:</p>

${T(`<table>
<thead><tr><th>Methode</th><th>Fajr</th><th>Sonnenaufgang</th><th>Dhuhr</th><th>Asr</th><th>Maghrib</th><th>Isha</th></tr></thead>
<tbody>
<tr><td>MWL</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:22</td></tr>
<tr><td>ISNA</td><td>04:52</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:13</td></tr>
<tr><td>Egyptian</td><td>04:31</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:25</td></tr>
<tr><td>Umm al-Qura</td><td>04:36</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:37</td></tr>
<tr><td>Karachi</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:27</td></tr>
</tbody></table>`)}
<p><strong>Sonnenaufgang, Dhuhr und Maghrib sind bei allen fünf identisch</strong> — ihre Definitionen sind geometrisch und hängen von keiner gewählten Dämmerungsschwelle ab. Die gesamte Spanne liegt bei Fajr und Isha: einundzwanzig Minuten zwischen dem engsten Fajr-Winkel (ISNA 15°) und dem weitesten (Egyptian 19.5°). Asr stimmt hier überein, weil alle fünf denselben voreingestellten Schattenfaktor teilen.</p>

<h2>Hohe Breitengrade</h2>
<p>Je weiter man nach Norden oder Süden geht, desto eher erreicht man einen Tag, an dem die Sonne den erforderlichen Winkel gar nicht mehr unterschreitet — an diesem Tag gibt es also kein astronomisches Fajr und kein astronomisches Isha. Stattdessen wird eine Schätzregel verwendet, die die Nacht aufteilt. Diese Website implementiert drei gängige Regeln und zusätzlich eine vierte, eigene Regel für Standorte in Deutschland, die je nach dem, ob der Winkel mit ausreichendem Abstand tatsächlich erreicht wird, zwischen der echten Rechnung und der Schätzung wählt. Ein <a href="/de/guides/why-prayer-times-differ">eigener Ratgeber</a> behandelt das ausführlich.</p>

<h2>Was zu Ihnen passt</h2>
<p>Die praktische Regel ist einfach: <strong>Folgen Sie dem, was Ihre Moschee oder die Institution Ihres Landes verwendet.</strong> Es geht darum, mit der Gemeinde zu beten, nicht darum, eine Zahl zu treffen. Deshalb wählt die Website standardmäßig die Methode, die dem Land der Stadt zugeordnet ist.</p>
<p>Wenn Sie mit einer anderen Quelle vergleichen, vergleichen Sie fair: gleiches Datum, gleiche Koordinaten, gleiche Methode, gleiche Asr-Definition. Die meisten scheinbaren Fehler erweisen sich als zwei unterschiedliche Einstellungen.</p>
`,
sources: `
<h2>Quellen</h2>
<p class="guide-sources-note">Die Winkel und Minutenanpassungen unten sind den Institutionen zugeschrieben, die sie veröffentlichen. Jeder Zahlenvergleich auf dieser Seite wurde mit der Engine dieser Website berechnet, mit den in jedem Beispiel genannten Daten und Koordinaten.</p>
<ul>
<li>Diyanet İşleri Başkanlığı (Türkei) — amtliche <em>temkin</em>-Tabelle: <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Ministerium für Habous und islamische Angelegenheiten, Marokko — veröffentlichter Rabat-Kalender: <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Ministerium für religiöse Angelegenheiten der Republik Indonesien (Kemenag) — Kriterien für Gebetskalender</li>
<li>Umm-al-Qura-Universität, Mekka — veröffentlichter Berechnungsstandard</li>
<li>Muslim World League · Egyptian General Authority of Survey · University of Islamic Sciences, Karachi · ISNA · Union of Islamic Organisations of France · JAKIM Malaysia</li>
<li>Vergleichende Parametertabelle: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
<p class="guide-sources-note"><strong>Hinweis:</strong> Manche Institutionen veröffentlichen Tabellen, in denen Vorsichtsminuten bereits enthalten sind. Wo das, was wir anwenden, vom amtlichen Winkel abweicht, sagen wir es im Text der Seite.</p>

---
`,
related: [
  { href: '/de/guides/why-prayer-times-differ', label: 'Warum Gebetszeiten sich zwischen Apps und Websites unterscheiden' },
  { href: '/de/guides/how-qibla-direction-is-calculated', label: 'Wie die Qibla-Richtung berechnet wird' },
  { href: '/de/prayer-times-worldwide', label: 'Gebetszeiten weltweit' },
],
},
es: {
h1: 'Métodos de cálculo de los horarios de oración y sus ángulos',
body: `
<p class="guide-intro">Abra dos aplicaciones de oración en la misma ciudad y el Fayr puede diferir en quince minutos. Por lo general no es un fallo. Suele significar que cada aplicación responde a una pregunta ligeramente distinta: <strong>¿a partir de cuándo se considera que ha entrado el Fayr?</strong> Esta página explica cómo esa pregunta se convierte en un cálculo y qué hace exactamente este sitio.</p>

<h2>Qué se calcula en realidad</h2>
<p>Los horarios de oración no son una tabla guardada. Se deducen de <strong>la posición del sol respecto a su horizonte</strong>. El cálculo necesita tres datos: latitud, longitud y fecha. De ellos se obtienen la <strong>declinación</strong> solar de ese día y la <strong>ecuación del tiempo</strong>, y después se busca el instante en que el sol alcanza una altura determinada.</p>
<p>Algunos horarios tienen una definición geométrica directa: el <strong>Dhuhr</strong> es el paso del sol por el meridiano; el <strong>amanecer</strong> y el <strong>Magrib</strong> son los momentos en que el disco solar toca el horizonte. El <strong>Fayr</strong> y el <strong>Isha</strong> son de otra naturaleza. Ambos dependen del crepúsculo, y el crepúsculo es una transición gradual, no un instante nítido. Ahí es exactamente donde los métodos se separan.</p>

<h2>Qué significa un «ángulo del Fayr»</h2>
<p>Como el crepúsculo es gradual, hizo falta un umbral medible. El umbral adoptado es <strong>cuánto ha descendido el sol por debajo del horizonte</strong>.</p>
<p>Cuando un método usa un ángulo de Fayr de <strong>18°</strong>, quiere decir: busque el instante en que el centro del sol está 18 grados por debajo del horizonte antes del amanecer. Un ángulo mayor sitúa el sol más abajo, de modo que la hora llega <strong>antes</strong>. Un Fayr de 19.5° es más temprano que uno de 15°.</p>
<p>La magnitud de esa diferencia no es constante. En latitudes medias un grado equivale a unos <strong>cinco minutos</strong> en invierno y puede llegar a <strong>siete minutos</strong> cerca del solsticio de verano, porque el sol desciende con una pendiente más tendida y tarda más en recorrer el mismo grado. Esta variación estacional es una de las grandes razones por las que la diferencia entre dos aplicaciones no se mantiene igual a lo largo del año.</p>

<h2>Los métodos que aplica este sitio</h2>
<p>Hay diecisiete métodos implementados. Cada valor de abajo es el que el cálculo utiliza realmente:</p>

${T(`<table>
<thead><tr><th>Método</th><th>Fayr</th><th>Isha</th></tr></thead>
<tbody>
<tr><td>Muslim World League (MWL)</td><td>18°</td><td>17°</td></tr>
<tr><td>ISNA (Norteamérica)</td><td>15°</td><td>15°</td></tr>
<tr><td>Egyptian General Authority of Survey</td><td>19.5°</td><td>17.5°</td></tr>
<tr><td>Umm al-Qura, La Meca</td><td>18.5°</td><td>90 minutos después del Magrib</td></tr>
<tr><td>University of Islamic Sciences, Karachi</td><td>18°</td><td>18°</td></tr>
<tr><td>Institute of Geophysics, Tehran</td><td>17.7°</td><td>14° (Magrib 4.5°)</td></tr>
<tr><td>Jafari</td><td>16°</td><td>14° (Magrib 4°)</td></tr>
<tr><td>Gulf Region</td><td>19.5°</td><td>90 minutos después del Magrib</td></tr>
<tr><td>Kuwait</td><td>18°</td><td>17.5°</td></tr>
<tr><td>Qatar</td><td>18°</td><td>90 minutos después del Magrib</td></tr>
<tr><td>Singapore</td><td>20°</td><td>18°</td></tr>
<tr><td>Turquía — Diyanet</td><td>18°</td><td>17°</td></tr>
<tr><td>Union of Islamic Organisations of France</td><td>12°</td><td>12°</td></tr>
<tr><td>Russia</td><td>16°</td><td>15°</td></tr>
<tr><td>Malasia — JAKIM</td><td>20°</td><td>18°</td></tr>
<tr><td>Indonesia — Ministerio de Asuntos Religiosos</td><td>20°</td><td>18°</td></tr>
<tr><td>Marruecos</td><td>18°</td><td>17°</td></tr>
</tbody></table>`)}
<p>En esa tabla el Fayr va de 12° a 20°. Esa horquilla no es una diferencia de precisión de cálculo, sino una diferencia en <strong>el umbral que ha adoptado cada autoridad</strong>: un juicio académico e institucional, no de programación.</p>

<h2>Ángulo frente a intervalo fijo</h2>
<p>Tres de los métodos anteriores no usan ángulo alguno para el Isha: <strong>Umm al-Qura</strong>, <strong>Gulf Region</strong> y <strong>Qatar</strong>. Añaden un <strong>intervalo fijo</strong> después del Magrib.</p>
<p>Esta es La Meca según el método Umm al-Qura, calculada con el propio motor de este sitio:</p>

${T(`<table>
<thead><tr><th>Fecha</th><th>Magrib</th><th>Isha</th><th>Intervalo</th></tr></thead>
<tbody>
<tr><td>2026-01-15</td><td>17:59</td><td>19:29</td><td>90 minutos</td></tr>
<tr><td>2026-06-21</td><td>19:06</td><td>20:36</td><td>90 minutos</td></tr>
<tr><td>2026-09-23</td><td>18:16</td><td>19:46</td><td>90 minutos</td></tr>
<tr><td>2026-12-21</td><td>17:44</td><td>19:14</td><td>90 minutos</td></tr>
</tbody></table>`)}
<p>El intervalo no se mueve nunca, mientras que un Isha basado en un ángulo produce un intervalo que varía con las estaciones. En La Meca, el 21 de junio de 2026, el Isha de 17° de la MWL cae a las 20:26 y Umm al-Qura da las 20:36: diez minutos de diferencia. El 21 de diciembre la diferencia se amplía a quince minutos. Esa es la diferencia práctica entre un ángulo y un intervalo.</p>
<p><strong>TimesPrayers aplica actualmente un intervalo fijo de 90 minutos después del Magrib durante todo el año.</strong></p>

<h2>Cuando la autoridad aplica ajustes en minutos</h2>
<p>Algunas autoridades no publican solo el ángulo en bruto. Publican una tabla que ya incorpora <strong>minutos de precaución</strong>: el <em>temkin</em> en Turquía y el <em>ihtiyat</em> en Malasia e Indonesia. Si calcula solo el ángulo, se apartará varios minutos de la tabla oficial.</p>
<h3>Turquía</h3>
<p><strong>Turquía</strong> es el caso documentado oficialmente con mayor claridad. Diyanet İşleri Başkanlığı, organismo turco encargado de los asuntos religiosos, publica una tabla de <em>temkin</em> explícita: el amanecer se adelanta siete minutos, mientras que se añaden cinco minutos al Dhuhr, cuatro al Asr y siete al Magrib; sobre el imsak y el Isha no se aplica ningún ajuste. Este sitio aplica esos mismos ajustes publicados sobre los ángulos de 18°/17°.</p>
<h3>Malasia</h3>
<p>En <strong>Malasia</strong>, JAKIM usa 20° para el Fayr y 18° para el Isha. TimesPrayers aplica <strong>ajustes en minutos propios</strong> para coincidir con los horarios publicados; esos ajustes no son cifras oficiales y no se atribuyen a JAKIM.</p>
<h3>Indonesia</h3>
<p>En <strong>Indonesia</strong>, este sitio usa los ángulos de 20° y 18° que corresponden a los criterios del Ministerio de Asuntos Religiosos, y <strong>no aplica ningún ajuste de minutos de <em>ihtiyath</em> aparte</strong>. Los materiales de Kemenag describen la adición de minutos de precaución al preparar los horarios de oración; aquí eso no se aplica.</p>
<h3>Marruecos</h3>
<p>En <strong>Marruecos</strong>, este sitio usa un Fayr de 18° con un adelanto fijo de seis minutos. Comparamos el resultado con el horario de Rabat publicado por el Ministerio de Habices y Asuntos Islámicos en cuatro fechas de agosto y septiembre de 2026, y nuestro Fayr quedó a <strong>uno o dos minutos</strong> de la hora publicada en la muestra examinada. No atribuimos al ministerio ningún ángulo de cálculo concreto.</p>

<h2>Cómo se calcula el Asr</h2>
<p>El Asr tiene dos definiciones muy extendidas, ambas basadas en la longitud de la sombra:</p>
<ul>
<li><strong>Factor de sombra 1</strong>: el Asr entra cuando la sombra de un objeto iguala su propia longitud, sumada la sombra del mediodía. Es el valor por defecto aquí.</li>
<li><strong>Factor de sombra 2</strong>: el Asr entra cuando la sombra alcanza el doble de la longitud del objeto, sumada la sombra del mediodía.</li>
</ul>
<p>La diferencia es considerable, no marginal. En El Cairo, el 21 de marzo de 2026 con la MWL, el factor 1 da el Asr a las <strong>15:30</strong> y el factor 2 a las <strong>16:24</strong>: cincuenta y cuatro minutos de separación.</p>
<p>El sitio admite ambas definiciones y usa por defecto el factor de sombra 1. Qué definición sigue cada usuario depende de la escuela o de la autoridad que siga.</p>

<h2>Cómo se elige el método automáticamente</h2>
<p>Cuando abre la página de una ciudad, el sitio elige el método <strong>según el país de esa ciudad</strong>: Egipto y Libia usan el método egipcio; Francia, el de la unión francesa; Turquía, Diyanet; Irán, Tehran; Pakistán, India, Bangladés y Afganistán, Karachi; Malasia, JAKIM; Indonesia, su Ministerio de Asuntos Religiosos; Singapur y Brunéi, el método regional. Cualquier país no asignado usa la MWL como método de reserva en la implementación actual.</p>

<h2>Cómo se refleja esto en los horarios finales</h2>
<p>Un ejemplo lo reúne todo. El Cairo (30.0444° N, 31.2357° E), 21 de marzo de 2026, UTC+2, calculado por este sitio:</p>

${T(`<table>
<thead><tr><th>Método</th><th>Fayr</th><th>Amanecer</th><th>Dhuhr</th><th>Asr</th><th>Magrib</th><th>Isha</th></tr></thead>
<tbody>
<tr><td>MWL</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:22</td></tr>
<tr><td>ISNA</td><td>04:52</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:13</td></tr>
<tr><td>Egyptian</td><td>04:31</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:25</td></tr>
<tr><td>Umm al-Qura</td><td>04:36</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:37</td></tr>
<tr><td>Karachi</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:27</td></tr>
</tbody></table>`)}
<p><strong>El amanecer, el Dhuhr y el Magrib son idénticos en los cinco</strong>: sus definiciones son geométricas y no dependen de ningún umbral crepuscular elegido. Toda la horquilla está en el Fayr y en el Isha: veintiún minutos entre el ángulo de Fayr más estrecho (ISNA 15°) y el más amplio (Egyptian 19.5°). El Asr coincide aquí porque los cinco comparten el mismo factor de sombra por defecto.</p>

<h2>Latitudes altas</h2>
<p>Cuanto más al norte o al sur, antes se llega a un día en que el sol no desciende hasta el ángulo requerido, de modo que ese día no hay Fayr ni Isha astronómicos. En su lugar se usa una regla de estimación que reparte la noche. Este sitio implementa tres reglas habituales y, además, una cuarta propia para ubicaciones en Alemania, que elige entre el cálculo real y la estimación según si el ángulo se alcanza de verdad con margen suficiente. Una <a href="/es/guides/why-prayer-times-differ">guía aparte</a> lo trata en detalle.</p>

<h2>Elegir lo que le corresponde</h2>
<p>La regla práctica es sencilla: <strong>siga lo que use su mezquita o la autoridad de su país.</strong> El objetivo es rezar con la comunidad, no cuadrar una cifra. Por eso el sitio elige por defecto el método asociado al país de la ciudad.</p>
<p>Si compara con otra fuente, compare con equidad: misma fecha, mismas coordenadas, mismo método, misma definición del Asr. La mayoría de los errores aparentes acaban siendo dos configuraciones distintas.</p>
`,
sources: `
<h2>Fuentes</h2>
<p class="guide-sources-note">Los ángulos y ajustes en minutos de abajo se atribuyen a los organismos que los publican. Cada comparación numérica de esta página se calculó con el motor de este sitio, usando las fechas y coordenadas indicadas en cada ejemplo.</p>
<ul>
<li>Diyanet İşleri Başkanlığı (Turquía) — tabla oficial de <em>temkin</em>: <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Ministerio de Habices y Asuntos Islámicos, Marruecos — horario de Rabat publicado: <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Ministerio de Asuntos Religiosos de la República de Indonesia (Kemenag) — criterios de los horarios de oración</li>
<li>Universidad Umm al-Qura, La Meca — norma de cálculo publicada</li>
<li>Muslim World League · Egyptian General Authority of Survey · University of Islamic Sciences, Karachi · ISNA · Union of Islamic Organisations of France · JAKIM Malaysia</li>
<li>Tabla comparativa de parámetros: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
<p class="guide-sources-note"><strong>Nota:</strong> algunas autoridades publican tablas que ya incluyen minutos de precaución. Allí donde lo que aplicamos difiere del ángulo oficial, lo decimos en el texto de la página.</p>

---
`,
related: [
  { href: '/es/guides/why-prayer-times-differ', label: 'Por qué difieren los horarios de oración entre aplicaciones y sitios web' },
  { href: '/es/guides/how-qibla-direction-is-calculated', label: 'Cómo se calcula la dirección de la Qibla' },
  { href: '/es/prayer-times-worldwide', label: 'Horarios de oración en el mundo' },
],
},
id: {
h1: 'Metode Perhitungan Jadwal Sholat dan Sudutnya',
body: `
<p class="guide-intro">Buka dua aplikasi sholat di kota yang sama, dan waktu Subuh bisa berbeda lima belas menit. Itu umumnya bukan kesalahan. Biasanya artinya setiap aplikasi menjawab pertanyaan yang sedikit berbeda: <strong>kapan Subuh dianggap sudah masuk?</strong> Halaman ini menjelaskan bagaimana pertanyaan itu diubah menjadi perhitungan, dan apa persisnya yang dilakukan situs ini.</p>

<h2>Apa yang sebenarnya dihitung</h2>
<p>Jadwal sholat bukan tabel yang tersimpan. Ia diturunkan dari <strong>posisi matahari terhadap ufuk Anda</strong>. Perhitungannya membutuhkan tiga masukan: lintang, bujur, dan tanggal. Dari ketiganya diperoleh <strong>deklinasi</strong> matahari untuk hari itu serta <strong>persamaan waktu</strong>, lalu dicari saat matahari mencapai ketinggian tertentu.</p>
<p>Sebagian waktu punya definisi geometris yang langsung: <strong>Zuhur</strong> adalah saat matahari melewati meridian; <strong>matahari terbit</strong> dan <strong>Magrib</strong> adalah saat piringan matahari menyentuh ufuk. <strong>Subuh</strong> dan <strong>Isya</strong> berbeda sifatnya. Keduanya terikat pada senja, sedangkan senja adalah pemudaran bertahap, bukan satu titik waktu yang tajam. Di sanalah metode mulai berpisah jalan.</p>

<h2>Apa arti «sudut Subuh»</h2>
<p>Karena senja berlangsung bertahap, diperlukan ambang yang bisa diukur. Ambang yang dipakai adalah <strong>seberapa dalam matahari sudah turun di bawah ufuk</strong>.</p>
<p>Ketika sebuah metode memakai sudut Subuh <strong>18°</strong>, artinya: carilah saat pusat matahari berada 18 derajat di bawah ufuk sebelum matahari terbit. Sudut yang lebih besar menempatkan matahari lebih dalam, sehingga waktunya jatuh <strong>lebih awal</strong>. Subuh 19.5° lebih awal daripada Subuh 15°.</p>
<p>Besar selisih itu tidak tetap. Di lintang menengah, satu derajat setara sekitar <strong>lima menit</strong> pada musim dingin dan bisa mencapai <strong>tujuh menit</strong> menjelang titik balik musim panas, sebab matahari turun dengan kemiringan yang lebih landai sehingga butuh waktu lebih lama untuk melewati derajat yang sama. Variasi musiman inilah salah satu alasan utama mengapa selisih antara dua aplikasi tidak tetap sepanjang tahun.</p>

<h2>Metode yang diterapkan situs ini</h2>
<p>Tujuh belas metode diterapkan. Setiap nilai di bawah ini adalah nilai yang benar-benar dipakai dalam perhitungan:</p>

${T(`<table>
<thead><tr><th>Metode</th><th>Subuh</th><th>Isya</th></tr></thead>
<tbody>
<tr><td>Muslim World League (MWL)</td><td>18°</td><td>17°</td></tr>
<tr><td>ISNA (Amerika Utara)</td><td>15°</td><td>15°</td></tr>
<tr><td>Egyptian General Authority of Survey</td><td>19.5°</td><td>17.5°</td></tr>
<tr><td>Umm al-Qura, Makkah</td><td>18.5°</td><td>90 menit setelah Magrib</td></tr>
<tr><td>University of Islamic Sciences, Karachi</td><td>18°</td><td>18°</td></tr>
<tr><td>Institute of Geophysics, Tehran</td><td>17.7°</td><td>14° (Magrib 4.5°)</td></tr>
<tr><td>Jafari</td><td>16°</td><td>14° (Magrib 4°)</td></tr>
<tr><td>Gulf Region</td><td>19.5°</td><td>90 menit setelah Magrib</td></tr>
<tr><td>Kuwait</td><td>18°</td><td>17.5°</td></tr>
<tr><td>Qatar</td><td>18°</td><td>90 menit setelah Magrib</td></tr>
<tr><td>Singapore</td><td>20°</td><td>18°</td></tr>
<tr><td>Turki — Diyanet</td><td>18°</td><td>17°</td></tr>
<tr><td>Union of Islamic Organisations of France</td><td>12°</td><td>12°</td></tr>
<tr><td>Russia</td><td>16°</td><td>15°</td></tr>
<tr><td>Malaysia — JAKIM</td><td>20°</td><td>18°</td></tr>
<tr><td>Indonesia — Kementerian Agama</td><td>20°</td><td>18°</td></tr>
<tr><td>Maroko</td><td>18°</td><td>17°</td></tr>
</tbody></table>`)}
<p>Dalam tabel itu Subuh terbentang dari 12° hingga 20°. Rentang ini bukan perbedaan ketelitian perhitungan, melainkan perbedaan <strong>ambang yang dipilih masing-masing otoritas</strong> — sebuah keputusan keilmuan dan kelembagaan, bukan keputusan pemrograman.</p>

<h2>Sudut versus interval tetap</h2>
<p>Tiga metode di atas sama sekali tidak memakai sudut untuk Isya: <strong>Umm al-Qura</strong>, <strong>Gulf Region</strong>, dan <strong>Qatar</strong>. Ketiganya menambahkan <strong>interval tetap</strong> setelah Magrib.</p>
<p>Berikut Makkah menurut metode Umm al-Qura, dihitung oleh mesin situs ini sendiri:</p>

${T(`<table>
<thead><tr><th>Tanggal</th><th>Magrib</th><th>Isya</th><th>Interval</th></tr></thead>
<tbody>
<tr><td>2026-01-15</td><td>17:59</td><td>19:29</td><td>90 menit</td></tr>
<tr><td>2026-06-21</td><td>19:06</td><td>20:36</td><td>90 menit</td></tr>
<tr><td>2026-09-23</td><td>18:16</td><td>19:46</td><td>90 menit</td></tr>
<tr><td>2026-12-21</td><td>17:44</td><td>19:14</td><td>90 menit</td></tr>
</tbody></table>`)}
<p>Interval itu tidak pernah bergeser, sementara Isya berbasis sudut menghasilkan interval yang berubah mengikuti musim. Di Makkah pada 21 Juni 2026, Isya 17° MWL jatuh pukul 20:26 sedangkan Umm al-Qura memberi 20:36 — selisih sepuluh menit. Pada 21 Desember selisihnya melebar menjadi lima belas menit. Itulah beda praktis antara sudut dan interval.</p>
<p><strong>TimesPrayers saat ini menerapkan interval tetap 90 menit setelah Magrib sepanjang tahun.</strong></p>

<h2>Ketika otoritas menerapkan penyesuaian menit</h2>
<p>Sebagian otoritas tidak menerbitkan sudut mentah saja. Mereka menerbitkan tabel yang sudah memuat <strong>menit kehati-hatian</strong> — <em>temkin</em> di Turki, <em>ihtiyat</em> di Malaysia dan Indonesia. Hitung sudutnya saja, dan hasil Anda akan meleset beberapa menit dari tabel resmi.</p>
<h3>Turki</h3>
<p><strong>Turki</strong> adalah kasus terdokumentasi resmi yang paling jelas. Diyanet İşleri Başkanlığı (lembaga urusan agama Turki) menerbitkan tabel <em>temkin</em> yang eksplisit: waktu matahari terbit digeser tujuh menit lebih awal, sedangkan lima menit ditambahkan pada Zuhur, empat pada Asar, dan tujuh pada Magrib; tidak ada penyesuaian pada imsak maupun Isya. Situs ini menerapkan penyesuaian terbitan yang sama itu di atas sudut 18°/17°.</p>
<h3>Malaysia</h3>
<p>Di <strong>Malaysia</strong>, JAKIM memakai 20° untuk Subuh dan 18° untuk Isya. TimesPrayers menerapkan <strong>penyesuaian menitnya sendiri</strong> agar selaras dengan jadwal yang diterbitkan; penyesuaian itu bukan angka resmi dan tidak dinisbahkan kepada JAKIM.</p>
<h3>Indonesia</h3>
<p>Di <strong>Indonesia</strong>, situs ini memakai sudut 20° dan 18° yang sesuai dengan kriteria Kementerian Agama, dan <strong>tidak menerapkan penyesuaian menit <em>ihtiyath</em> tersendiri</strong>. Materi Kemenag menguraikan penambahan menit kehati-hatian dalam penyusunan jadwal sholat; hal itu tidak diterapkan di sini.</p>
<h3>Maroko</h3>
<p>Di <strong>Maroko</strong>, situs ini memakai Subuh 18° dengan pergeseran tetap enam menit lebih awal. Kami membandingkan hasilnya dengan jadwal Rabat yang diterbitkan Kementerian Habous dan Urusan Islam pada empat tanggal di Agustus–September 2026, dan Subuh kami berada dalam rentang <strong>satu sampai dua menit</strong> dari waktu terbitan pada sampel yang diperiksa. Kami tidak menisbahkan sudut perhitungan tertentu kepada kementerian tersebut.</p>

<h2>Bagaimana Asar dihitung</h2>
<p>Asar memiliki dua definisi yang luas dipakai, keduanya berdasarkan panjang bayangan:</p>
<ul>
<li><strong>Faktor bayangan 1</strong> — Asar mulai ketika bayangan sebuah benda sama panjang dengan benda itu sendiri, ditambah bayangan pada tengah hari. Inilah setelan bawaan di sini.</li>
<li><strong>Faktor bayangan 2</strong> — Asar mulai ketika bayangan mencapai dua kali panjang benda, ditambah bayangan tengah hari.</li>
</ul>
<p>Selisihnya besar, bukan sepele. Di Kairo pada 21 Maret 2026 dengan MWL, faktor 1 memberi Asar pukul <strong>15:30</strong> dan faktor 2 pukul <strong>16:24</strong> — selisih lima puluh empat menit.</p>
<p>Situs ini mendukung kedua definisi dan memakai faktor bayangan 1 secara bawaan. Definisi mana yang diikuti seseorang bergantung pada mazhab atau otoritas yang ia ikuti.</p>

<h2>Bagaimana metode dipilih secara otomatis</h2>
<p>Saat Anda membuka halaman sebuah kota, situs ini memilih metode <strong>berdasarkan negara kota tersebut</strong>: Mesir dan Libya memakai metode Mesir, Prancis metode persatuan Prancis, Turki Diyanet, Iran Tehran, Pakistan/India/Bangladesh/Afghanistan Karachi, Malaysia JAKIM, Indonesia Kementerian Agamanya, Singapura dan Brunei metode kawasan. Negara mana pun yang belum dipetakan memakai MWL sebagai metode cadangan dalam implementasi saat ini.</p>

<h2>Seperti apa hasilnya pada jadwal akhir</h2>
<p>Satu contoh merangkum semuanya. Kairo (30.0444° N, 31.2357° E), 21 Maret 2026, UTC+2, dihitung oleh situs ini:</p>

${T(`<table>
<thead><tr><th>Metode</th><th>Subuh</th><th>Matahari Terbit</th><th>Zuhur</th><th>Asar</th><th>Magrib</th><th>Isya</th></tr></thead>
<tbody>
<tr><td>MWL</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:22</td></tr>
<tr><td>ISNA</td><td>04:52</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:13</td></tr>
<tr><td>Egyptian</td><td>04:31</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:25</td></tr>
<tr><td>Umm al-Qura</td><td>04:36</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:37</td></tr>
<tr><td>Karachi</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:27</td></tr>
</tbody></table>`)}
<p><strong>Matahari terbit, Zuhur, dan Magrib sama persis pada kelimanya</strong> — definisinya geometris dan tidak bergantung pada ambang senja yang dipilih. Seluruh rentang terkumpul di Subuh dan Isya: dua puluh satu menit antara sudut Subuh tersempit (ISNA 15°) dan terlebar (Egyptian 19.5°). Asar cocok di sini karena kelimanya memakai faktor bayangan bawaan yang sama.</p>

<h2>Lintang tinggi</h2>
<p>Makin jauh ke utara atau ke selatan, makin cepat tiba hari ketika matahari sama sekali tidak turun sampai sudut yang diperlukan — sehingga pada hari itu tidak ada Subuh atau Isya secara astronomis. Sebagai gantinya dipakai aturan perkiraan yang membagi malam. Situs ini menerapkan tiga aturan umum, ditambah aturan keempat miliknya sendiri untuk lokasi di Jerman, yang memilih antara perhitungan sebenarnya dan perkiraan bergantung pada apakah sudut itu benar-benar tercapai dengan margin yang memadai. Sebuah <a href="/id/guides/why-prayer-times-differ">panduan terpisah</a> membahasnya secara rinci.</p>

<h2>Memilih yang sesuai untuk Anda</h2>
<p>Aturan praktisnya sederhana: <strong>ikuti apa yang dipakai masjid Anda atau otoritas negara Anda.</strong> Tujuannya sholat berjamaah, bukan mencocokkan angka. Karena itulah situs ini secara bawaan memilih metode yang terkait dengan negara kota bersangkutan.</p>
<p>Kalau Anda membandingkan dengan sumber lain, bandingkan secara adil: tanggal sama, koordinat sama, metode sama, definisi Asar sama. Sebagian besar «kekeliruan» yang tampak ternyata hanyalah dua setelan yang berbeda.</p>
`,
sources: `
<h2>Sumber</h2>
<p class="guide-sources-note">Sudut dan penyesuaian menit di bawah ini dinisbahkan kepada lembaga yang menerbitkannya. Setiap perbandingan angka di halaman ini dihitung oleh mesin situs ini, memakai tanggal dan koordinat yang disebut pada masing-masing contoh.</p>
<ul>
<li>Diyanet İşleri Başkanlığı (Turki) — tabel <em>temkin</em> resmi: <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Kementerian Habous dan Urusan Islam, Maroko — jadwal Rabat yang diterbitkan: <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Kementerian Agama Republik Indonesia (Kemenag) — kriteria jadwal sholat</li>
<li>Universitas Umm al-Qura, Makkah — standar perhitungan yang diterbitkan</li>
<li>Muslim World League · Egyptian General Authority of Survey · University of Islamic Sciences, Karachi · ISNA · Union of Islamic Organisations of France · JAKIM Malaysia</li>
<li>Tabel perbandingan parameter: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
<p class="guide-sources-note"><strong>Catatan:</strong> sebagian otoritas menerbitkan tabel yang menit kehati-hatiannya sudah termasuk. Di titik mana pun yang kami terapkan berbeda dari sudut resmi, kami menyatakannya di dalam isi halaman.</p>

---
`,
related: [
  { href: '/id/guides/why-prayer-times-differ', label: 'Mengapa Jadwal Sholat Berbeda antara Aplikasi dan Situs Web?' },
  { href: '/id/guides/how-qibla-direction-is-calculated', label: 'Bagaimana Arah Kiblat Dihitung' },
  { href: '/id/prayer-times-worldwide', label: 'Jadwal Sholat Seluruh Dunia' },
],
},
bn: {
h1: 'নামাজের সময় গণনার পদ্ধতি ও কোণ',
body: `
<p class="guide-intro">একই শহরে দুটি নামাজের অ্যাপ খুলুন, ফজরের সময়ে পনেরো মিনিট পর্যন্ত পার্থক্য দেখতে পারেন। এটি সাধারণত কোনো ত্রুটি নয়। বেশিরভাগ ক্ষেত্রে এর অর্থ, প্রতিটি অ্যাপ সামান্য ভিন্ন একটি প্রশ্নের উত্তর দিচ্ছে: <strong>ফজর শুরু হয়েছে বলে কখন ধরা হবে?</strong> এই পৃষ্ঠাটি দেখায় সেই প্রশ্নকে কীভাবে হিসাবে রূপ দেওয়া হয়, এবং এই সাইট ঠিক কী করে।</p>

<h2>আসলে কী গণনা করা হচ্ছে</h2>
<p>নামাজের সময় কোনো সংরক্ষিত সময়সূচী নয়। এগুলো নির্ণীত হয় <strong>আপনার দিগন্তের সাপেক্ষে সূর্যের অবস্থান</strong> থেকে। গণনার জন্য তিনটি উপাত্ত দরকার: অক্ষাংশ, দ্রাঘিমাংশ ও তারিখ। এগুলো থেকে সেই দিনের সূর্যের <strong>ক্রান্তি</strong> (solar declination) ও <strong>সময়ের সমীকরণ</strong> বের করা হয়, তারপর খোঁজা হয় সেই মুহূর্ত যখন সূর্য একটি নির্দিষ্ট উচ্চতায় পৌঁছায়।</p>
<p>কিছু সময়ের সংজ্ঞা সরাসরি জ্যামিতিক: <strong>জোহর</strong> হলো সূর্যের মধ্যরেখা অতিক্রমের মুহূর্ত; <strong>সূর্যোদয়</strong> ও <strong>মাগরিব</strong> হলো সূর্যের চাকতি দিগন্ত স্পর্শ করার মুহূর্ত। <strong>ফজর</strong> ও <strong>এশা</strong> ভিন্ন প্রকৃতির। দুটোই শফক (গোধূলি) নির্ভর, আর শফক একটি ক্রমশ মিলিয়ে যাওয়া আলো — কোনো তীক্ষ্ণ মুহূর্ত নয়। ঠিক এখান থেকেই পদ্ধতিগুলোর পথ আলাদা হয়ে যায়।</p>

<h2>«ফজরের কোণ» বলতে কী বোঝায়</h2>
<p>শফক ক্রমশ মিলায় বলেই একটি পরিমাপযোগ্য সীমা দরকার হয়েছিল। যে সীমাটি গৃহীত হয়েছে তা হলো <strong>সূর্য দিগন্তের কতটা নিচে নেমেছে</strong>।</p>
<p>কোনো পদ্ধতি যখন ফজরের জন্য <strong>18°</strong> কোণ ব্যবহার করে, তার অর্থ: সূর্যোদয়ের আগে সূর্যের কেন্দ্র যে মুহূর্তে দিগন্তের 18 ডিগ্রি নিচে থাকে, সেটি বের করা। বড় কোণ সূর্যকে আরও নিচে ধরে, তাই সময়টি <strong>আগে</strong> আসে। 19.5° ফজর 15° ফজরের চেয়ে আগে হয়।</p>
<p>এই ব্যবধানের পরিমাণ স্থির নয়। মধ্য-অক্ষাংশে এক ডিগ্রি শীতকালে প্রায় <strong>পাঁচ মিনিটের</strong> সমান, আর গ্রীষ্মের অয়নান্তের কাছে <strong>সাত মিনিট</strong> পর্যন্ত পৌঁছাতে পারে, কারণ সূর্য তখন কম ঢালে নামে এবং একই ডিগ্রি পার হতে বেশি সময় নেয়। ঋতুভেদে এই পরিবর্তনই বড় একটি কারণ, যার জন্য দুটি অ্যাপের পার্থক্য সারা বছর একরকম থাকে না।</p>

<h2>এই সাইট যে পদ্ধতিগুলো প্রয়োগ করে</h2>
<p>সতেরোটি পদ্ধতি প্রয়োগ করা আছে। নিচের প্রতিটি মান ঠিক সেটিই যা গণনায় প্রকৃতপক্ষে ব্যবহৃত হয়:</p>

${T(`<table>
<thead><tr><th>পদ্ধতি</th><th>ফজর</th><th>এশা</th></tr></thead>
<tbody>
<tr><td>Muslim World League (MWL)</td><td>18°</td><td>17°</td></tr>
<tr><td>ISNA (উত্তর আমেরিকা)</td><td>15°</td><td>15°</td></tr>
<tr><td>Egyptian General Authority of Survey</td><td>19.5°</td><td>17.5°</td></tr>
<tr><td>Umm al-Qura, মক্কা</td><td>18.5°</td><td>মাগরিবের 90 মিনিট পরে</td></tr>
<tr><td>University of Islamic Sciences, Karachi</td><td>18°</td><td>18°</td></tr>
<tr><td>Institute of Geophysics, Tehran</td><td>17.7°</td><td>14° (মাগরিব 4.5°)</td></tr>
<tr><td>Jafari</td><td>16°</td><td>14° (মাগরিব 4°)</td></tr>
<tr><td>Gulf Region</td><td>19.5°</td><td>মাগরিবের 90 মিনিট পরে</td></tr>
<tr><td>Kuwait</td><td>18°</td><td>17.5°</td></tr>
<tr><td>Qatar</td><td>18°</td><td>মাগরিবের 90 মিনিট পরে</td></tr>
<tr><td>Singapore</td><td>20°</td><td>18°</td></tr>
<tr><td>তুরস্ক — Diyanet</td><td>18°</td><td>17°</td></tr>
<tr><td>Union of Islamic Organisations of France</td><td>12°</td><td>12°</td></tr>
<tr><td>Russia</td><td>16°</td><td>15°</td></tr>
<tr><td>মালয়েশিয়া — JAKIM</td><td>20°</td><td>18°</td></tr>
<tr><td>ইন্দোনেশিয়া — ধর্ম মন্ত্রণালয়</td><td>20°</td><td>18°</td></tr>
<tr><td>মরক্কো</td><td>18°</td><td>17°</td></tr>
</tbody></table>`)}
<p>এই তালিকায় ফজর 12° থেকে 20° পর্যন্ত বিস্তৃত। এই বিস্তার গণনার নির্ভুলতার পার্থক্য নয় — এটি <strong>প্রতিটি কর্তৃপক্ষের গৃহীত সীমার</strong> পার্থক্য, যা একটি শাস্ত্রীয় ও প্রাতিষ্ঠানিক সিদ্ধান্ত, প্রোগ্রামিংয়ের নয়।</p>

<h2>কোণ বনাম নির্দিষ্ট ব্যবধান</h2>
<p>উপরের তিনটি পদ্ধতি এশার জন্য কোনো কোণই ব্যবহার করে না: <strong>Umm al-Qura</strong>, <strong>Gulf Region</strong> ও <strong>Qatar</strong>। এগুলো মাগরিবের পরে একটি <strong>নির্দিষ্ট ব্যবধান</strong> যোগ করে।</p>
<p>এই হলো মক্কা, Umm al-Qura পদ্ধতিতে, এই সাইটের ইঞ্জিন দিয়েই গণনা করা:</p>

${T(`<table>
<thead><tr><th>তারিখ</th><th>মাগরিব</th><th>এশা</th><th>ব্যবধান</th></tr></thead>
<tbody>
<tr><td>2026-01-15</td><td>17:59</td><td>19:29</td><td>90 মিনিট</td></tr>
<tr><td>2026-06-21</td><td>19:06</td><td>20:36</td><td>90 মিনিট</td></tr>
<tr><td>2026-09-23</td><td>18:16</td><td>19:46</td><td>90 মিনিট</td></tr>
<tr><td>2026-12-21</td><td>17:44</td><td>19:14</td><td>90 মিনিট</td></tr>
</tbody></table>`)}
<p>ব্যবধানটি কখনও নড়ে না, অথচ কোণভিত্তিক এশা এমন ব্যবধান দেয় যা ঋতুর সঙ্গে সরে যায়। মক্কায় 21 জুন 2026 তারিখে MWL-এর 17° এশা পড়ে 20:26-এ, আর Umm al-Qura দেয় 20:36 — দশ মিনিটের পার্থক্য। 21 ডিসেম্বরে পার্থক্যটি বেড়ে পনেরো মিনিট হয়। কোণ আর ব্যবধানের ব্যবহারিক পার্থক্য এটিই।</p>
<p><strong>TimesPrayers বর্তমানে সারা বছর মাগরিবের পরে 90 মিনিটের একটি নির্দিষ্ট ব্যবধান প্রয়োগ করে।</strong></p>

<h2>কর্তৃপক্ষ যখন মিনিটের সমন্বয় প্রয়োগ করে</h2>
<p>কিছু কর্তৃপক্ষ কেবল কাঁচা কোণ প্রকাশ করে না। তারা এমন তালিকা প্রকাশ করে যাতে <strong>সতর্কতামূলক মিনিট</strong> আগে থেকেই যুক্ত থাকে — তুরস্কে <em>temkin</em>, মালয়েশিয়া ও ইন্দোনেশিয়ায় <em>ihtiyat</em>। কেবল কোণ গণনা করলে সরকারি তালিকার সঙ্গে কয়েক মিনিটের ফারাক থেকে যাবে।</p>
<h3>তুরস্ক</h3>
<p><strong>তুরস্ক</strong> সবচেয়ে স্পষ্ট সরকারিভাবে নথিভুক্ত উদাহরণ। ধর্মবিষয়ক অধিদপ্তর (Diyanet İşleri Başkanlığı) একটি সুস্পষ্ট <em>temkin</em> তালিকা প্রকাশ করে: সূর্যোদয় সাত মিনিট এগিয়ে আনা হয়, আর জোহরে পাঁচ, আসরে চার ও মাগরিবে সাত মিনিট যোগ করা হয়; ইমসাক ও এশায় কোনো সমন্বয় নেই। TimesPrayers 18°/17° কোণের উপরে এই প্রকাশিত সমন্বয়গুলোই প্রয়োগ করে।</p>
<h3>মালয়েশিয়া</h3>
<p><strong>মালয়েশিয়ায়</strong> JAKIM ফজরের জন্য 20° ও এশার জন্য 18° ব্যবহার করে। প্রকাশিত সময়সূচীর সঙ্গে মেলাতে TimesPrayers নিজস্ব মিনিট-সমন্বয় প্রয়োগ করে; এই সমন্বয়গুলো সরকারি মান নয় এবং JAKIM-এর প্রতি আরোপ করা হয় না।</p>
<h3>ইন্দোনেশিয়া</h3>
<p><strong>ইন্দোনেশিয়ায়</strong> এই সাইট ধর্ম মন্ত্রণালয়ের নির্ণায়কের সঙ্গে সঙ্গতিপূর্ণ 20° ও 18° কোণ ব্যবহার করে, এবং <strong>আলাদা কোনো <em>ihtiyath</em> মিনিট-সমন্বয় প্রয়োগ করে না</strong>। Kemenag-এর নথিপত্রে নামাজের সময়সূচী প্রস্তুতিতে সতর্কতামূলক মিনিট যোগের কথা বর্ণিত আছে; এখানে তা প্রয়োগ করা হয় না।</p>
<h3>মরক্কো</h3>
<p><strong>মরক্কোয়</strong> এই সাইট 18° ফজরের সঙ্গে ছয় মিনিট আগের একটি নির্দিষ্ট সরণ ব্যবহার করে। আমরা ফলাফলটি আওকাফ ও ইসলামি বিষয়ক মন্ত্রণালয়ের প্রকাশিত রাবাত সময়সূচীর সঙ্গে 2026 সালের আগস্ট-সেপ্টেম্বরের চারটি তারিখে মিলিয়ে দেখেছি, এবং পরীক্ষিত নমুনায় আমাদের ফজর প্রকাশিত সময় থেকে <strong>এক থেকে দুই মিনিটের</strong> মধ্যে ছিল। আমরা মন্ত্রণালয়ের প্রতি কোনো নির্দিষ্ট গণনা-কোণ আরোপ করি না।</p>

<h2>আসর কীভাবে গণনা করা হয়</h2>
<p>আসরের দুটি বহুল প্রচলিত সংজ্ঞা আছে, দুটোই ছায়ার দৈর্ঘ্যভিত্তিক:</p>
<ul>
<li><strong>ছায়া গুণক 1</strong> — কোনো বস্তুর ছায়া যখন তার নিজের দৈর্ঘ্যের সমান হয়, তার সঙ্গে দুপুরের ছায়া যোগ করে, তখন আসর শুরু হয়। এখানে এটিই পূর্বনির্ধারিত।</li>
<li><strong>ছায়া গুণক 2</strong> — ছায়া যখন বস্তুর দৈর্ঘ্যের দ্বিগুণ হয়, তার সঙ্গে দুপুরের ছায়া যোগ করে, তখন আসর শুরু হয়।</li>
</ul>
<p>পার্থক্যটি প্রান্তিক নয়, উল্লেখযোগ্য। কায়রোতে 21 মার্চ 2026 তারিখে MWL অনুযায়ী গুণক 1 আসর দেয় <strong>15:30</strong>-এ এবং গুণক 2 দেয় <strong>16:24</strong>-এ — চুয়ান্ন মিনিটের পার্থক্য।</p>
<p>সাইটটি দুটি সংজ্ঞাই সমর্থন করে এবং পূর্বনির্ধারিতভাবে ছায়া গুণক 1 ব্যবহার করে। ব্যবহারকারী কোন সংজ্ঞা অনুসরণ করবেন তা নির্ভর করে তিনি যে মাযহাব বা কর্তৃপক্ষ অনুসরণ করেন তার উপর।</p>

<h2>পদ্ধতি স্বয়ংক্রিয়ভাবে কীভাবে বাছাই হয়</h2>
<p>আপনি যখন কোনো শহরের পৃষ্ঠা খোলেন, সাইটটি পদ্ধতি বাছে <strong>সেই শহরের দেশ অনুসারে</strong>: মিশর ও লিবিয়ায় মিশরীয় পদ্ধতি, ফ্রান্সে ফরাসি ইউনিয়নের, তুরস্কে Diyanet, ইরানে Tehran, পাকিস্তান/ভারত/বাংলাদেশ/আফগানিস্তানে Karachi, মালয়েশিয়ায় JAKIM, ইন্দোনেশিয়ায় সেখানকার ধর্ম মন্ত্রণালয়, সিঙ্গাপুর ও ব্রুনেইতে আঞ্চলিক পদ্ধতি। তালিকাভুক্ত নয় এমন যেকোনো দেশ বর্তমান বাস্তবায়নে বিকল্প পদ্ধতি হিসেবে MWL ব্যবহার করে।</p>

<h2>চূড়ান্ত সময়ে এর প্রতিফলন</h2>
<p>একটি উদাহরণ সবটা এক করে দেয়। কায়রো (30.0444° N, 31.2357° E), 21 মার্চ 2026, UTC+2, এই সাইটে গণনা করা:</p>

${T(`<table>
<thead><tr><th>পদ্ধতি</th><th>ফজর</th><th>সূর্যোদয়</th><th>জোহর</th><th>আসর</th><th>মাগরিব</th><th>এশা</th></tr></thead>
<tbody>
<tr><td>MWL</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:22</td></tr>
<tr><td>ISNA</td><td>04:52</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:13</td></tr>
<tr><td>Egyptian</td><td>04:31</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:25</td></tr>
<tr><td>Umm al-Qura</td><td>04:36</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:37</td></tr>
<tr><td>Karachi</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:27</td></tr>
</tbody></table>`)}
<p><strong>সূর্যোদয়, জোহর ও মাগরিব পাঁচটিতেই অভিন্ন</strong> — এদের সংজ্ঞা জ্যামিতিক এবং কোনো বেছে নেওয়া শফক-সীমার উপর নির্ভর করে না। পুরো বিস্তারটি ফজর ও এশাতেই: সবচেয়ে সরু ফজর কোণ (ISNA 15°) ও সবচেয়ে চওড়া (Egyptian 19.5°) কোণের মধ্যে একুশ মিনিট। আসর এখানে মিলে যায় কারণ পাঁচটিরই পূর্বনির্ধারিত ছায়া গুণক অভিন্ন।</p>

<h2>উচ্চ অক্ষাংশ</h2>
<p>যত উত্তরে বা দক্ষিণে যাওয়া যায়, তত দ্রুত এমন একটি দিন আসে যেদিন সূর্য প্রয়োজনীয় কোণ পর্যন্ত নামেই না — ফলে সেদিন জ্যোতির্বৈজ্ঞানিক ফজর বা এশা থাকে না। তখন রাতকে ভাগ করার একটি আনুমানিক নিয়ম ব্যবহৃত হয়। এই সাইট তিনটি প্রচলিত নিয়ম প্রয়োগ করে, এবং তার সঙ্গে নিজস্ব একটি চতুর্থ নিয়ম, যা জার্মানির অবস্থানগুলোর জন্য ব্যবহৃত হয় এবং যা প্রকৃত গণনা ও অনুমানের মধ্যে বেছে নেয় এই ভিত্তিতে যে কোণটি যথেষ্ট ব্যবধানসহ সত্যিই পৌঁছানো গেছে কি না। একটি <a href="/bn/guides/why-prayer-times-differ">আলাদা গাইড</a> বিষয়টি বিস্তারিত দেখে।</p>

<h2>আপনার জন্য কোনটি উপযুক্ত</h2>
<p>ব্যবহারিক নিয়মটি সহজ: <strong>আপনার মসজিদ বা আপনার দেশের কর্তৃপক্ষ যা ব্যবহার করে, তাই অনুসরণ করুন।</strong> উদ্দেশ্য জামাতের সঙ্গে নামাজ পড়া, কোনো সংখ্যার সঙ্গে মিলিয়ে নেওয়া নয়। এ কারণেই সাইটটি পূর্বনির্ধারিতভাবে শহরের দেশের সঙ্গে সংশ্লিষ্ট পদ্ধতিটি বেছে নেয়।</p>
<p>অন্য কোনো উৎসের সঙ্গে মেলাতে চাইলে সততার সঙ্গে মেলান: একই তারিখ, একই স্থানাঙ্ক, একই পদ্ধতি, আসরের একই সংজ্ঞা। আপাত ভুলগুলোর বেশিরভাগই শেষ পর্যন্ত দুটি ভিন্ন সেটিংস হিসেবে ধরা পড়ে।</p>
`,
sources: `
<h2>সূত্র</h2>
<p class="guide-sources-note">নিচের কোণ ও মিনিট-সমন্বয়গুলো সেই প্রতিষ্ঠানগুলোর প্রতি আরোপিত যারা সেগুলো প্রকাশ করে। এই পৃষ্ঠার প্রতিটি সংখ্যাগত তুলনা এই সাইটের ইঞ্জিন দিয়েই, প্রতিটি উদাহরণে উল্লিখিত তারিখ ও স্থানাঙ্ক ব্যবহার করে গণনা করা হয়েছে।</p>
<ul>
<li>Diyanet İşleri Başkanlığı (তুরস্ক) — সরকারি <em>temkin</em> তালিকা: <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>আওকাফ ও ইসলামি বিষয়ক মন্ত্রণালয়, মরক্কো — প্রকাশিত রাবাত সময়সূচী: <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>ইন্দোনেশিয়া প্রজাতন্ত্রের ধর্ম মন্ত্রণালয় (Kemenag) — নামাজের সময়সূচীর নির্ণায়ক</li>
<li>Umm al-Qura University, মক্কা — প্রকাশিত গণনা-মানদণ্ড</li>
<li>Muslim World League · Egyptian General Authority of Survey · University of Islamic Sciences, Karachi · ISNA · Union of Islamic Organisations of France · JAKIM Malaysia</li>
<li>প্যারামিটারের তুলনামূলক তালিকা: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
<p class="guide-sources-note"><strong>দ্রষ্টব্য:</strong> কিছু কর্তৃপক্ষ এমন তালিকা প্রকাশ করে যাতে সতর্কতামূলক মিনিট আগে থেকেই অন্তর্ভুক্ত। আমরা যা প্রয়োগ করি তা যেখানে সরকারি কোণ থেকে ভিন্ন, সেখানে পৃষ্ঠার মূল অংশেই আমরা তা স্পষ্ট করে বলি।</p>

---
`,
related: [
  { href: '/bn/guides/why-prayer-times-differ', label: 'অ্যাপ ও ওয়েবসাইটে নামাজের সময় ভিন্ন হয় কেন?' },
  { href: '/bn/guides/how-qibla-direction-is-calculated', label: 'কিবলার দিক কীভাবে গণনা করা হয়' },
  { href: '/bn/prayer-times-worldwide', label: 'বিশ্বজুড়ে নামাজের সময়' },
],
},
ms: {
h1: 'Kaedah Pengiraan Waktu Solat dan Sudutnya',
body: `
<p class="guide-intro">Buka dua aplikasi solat di bandar yang sama, dan waktu Subuh boleh berbeza lima belas minit. Itu biasanya bukan kepincangan. Selalunya maknanya setiap aplikasi menjawab soalan yang sedikit berlainan: <strong>bilakah Subuh dikira sudah masuk?</strong> Halaman ini menerangkan bagaimana soalan itu dijadikan pengiraan, dan apa yang laman ini lakukan dengan tepat.</p>

<h2>Apa yang sebenarnya dikira</h2>
<p>Waktu solat bukan jadual yang disimpan. Ia diterbitkan daripada <strong>kedudukan matahari berbanding ufuk anda</strong>. Pengiraan memerlukan tiga masukan: latitud, longitud dan tarikh. Daripadanya diperoleh <strong>deklinasi</strong> matahari bagi hari itu dan <strong>persamaan masa</strong>, kemudian dicari saat matahari mencapai ketinggian tertentu.</p>
<p>Sesetengah waktu mempunyai takrif geometri yang terus: <strong>Zohor</strong> ialah saat matahari melintasi meridian; <strong>Syuruk</strong> dan <strong>Maghrib</strong> ialah saat cakera matahari bertemu ufuk. <strong>Subuh</strong> dan <strong>Isyak</strong> lain sifatnya. Kedua-duanya terikat pada senja, dan senja ialah pudar yang beransur, bukan detik yang tajam. Di situlah kaedah mula berbeza.</p>

<h2>Apa maksud «sudut Subuh»</h2>
<p>Kerana senja beransur, satu ambang yang boleh diukur diperlukan. Ambang yang diguna pakai ialah <strong>sedalam mana matahari sudah turun di bawah ufuk</strong>.</p>
<p>Apabila sesuatu kaedah menggunakan sudut Subuh <strong>18°</strong>, maksudnya: cari saat pusat matahari berada 18 darjah di bawah ufuk sebelum matahari terbit. Sudut yang lebih besar meletakkan matahari lebih dalam, jadi waktunya datang <strong>lebih awal</strong>. Subuh 19.5° lebih awal daripada Subuh 15°.</p>
<p>Saiz jurang itu tidak tetap. Pada latitud pertengahan, satu darjah bernilai kira-kira <strong>lima minit</strong> pada musim sejuk dan boleh mencecah <strong>tujuh minit</strong> berhampiran solstis musim panas, kerana matahari turun pada cerun yang lebih landai dan mengambil masa lebih lama untuk melintasi darjah yang sama. Perubahan bermusim inilah salah satu sebab besar mengapa beza antara dua aplikasi tidak sama sepanjang tahun.</p>

<h2>Kaedah yang dilaksanakan laman ini</h2>
<p>Tujuh belas kaedah dilaksanakan. Setiap nilai di bawah ialah nilai yang benar-benar digunakan dalam pengiraan:</p>

${T(`<table>
<thead><tr><th>Kaedah</th><th>Subuh</th><th>Isyak</th></tr></thead>
<tbody>
<tr><td>Muslim World League (MWL)</td><td>18°</td><td>17°</td></tr>
<tr><td>ISNA (Amerika Utara)</td><td>15°</td><td>15°</td></tr>
<tr><td>Egyptian General Authority of Survey</td><td>19.5°</td><td>17.5°</td></tr>
<tr><td>Umm al-Qura, Makkah</td><td>18.5°</td><td>90 minit selepas Maghrib</td></tr>
<tr><td>University of Islamic Sciences, Karachi</td><td>18°</td><td>18°</td></tr>
<tr><td>Institute of Geophysics, Tehran</td><td>17.7°</td><td>14° (Maghrib 4.5°)</td></tr>
<tr><td>Jafari</td><td>16°</td><td>14° (Maghrib 4°)</td></tr>
<tr><td>Gulf Region</td><td>19.5°</td><td>90 minit selepas Maghrib</td></tr>
<tr><td>Kuwait</td><td>18°</td><td>17.5°</td></tr>
<tr><td>Qatar</td><td>18°</td><td>90 minit selepas Maghrib</td></tr>
<tr><td>Singapore</td><td>20°</td><td>18°</td></tr>
<tr><td>Turki — Diyanet</td><td>18°</td><td>17°</td></tr>
<tr><td>Union of Islamic Organisations of France</td><td>12°</td><td>12°</td></tr>
<tr><td>Russia</td><td>16°</td><td>15°</td></tr>
<tr><td>Malaysia — JAKIM</td><td>20°</td><td>18°</td></tr>
<tr><td>Indonesia — Kementerian Agama</td><td>20°</td><td>18°</td></tr>
<tr><td>Maghribi</td><td>18°</td><td>17°</td></tr>
</tbody></table>`)}
<p>Subuh terentang dari 12° hingga 20° dalam jadual itu. Rentangan ini bukan beza ketepatan pengiraan — ia beza <strong>ambang yang dipilih setiap pihak berkuasa</strong>, iaitu pertimbangan ilmiah dan institusi, bukan pertimbangan pengaturcaraan.</p>

<h2>Sudut berbanding selang tetap</h2>
<p>Tiga kaedah di atas langsung tidak menggunakan sudut untuk Isyak: <strong>Umm al-Qura</strong>, <strong>Gulf Region</strong> dan <strong>Qatar</strong>. Ketiga-tiganya menambah <strong>selang tetap</strong> selepas Maghrib.</p>
<p>Ini Makkah mengikut kaedah Umm al-Qura, dikira oleh enjin laman ini sendiri:</p>

${T(`<table>
<thead><tr><th>Tarikh</th><th>Maghrib</th><th>Isyak</th><th>Selang</th></tr></thead>
<tbody>
<tr><td>2026-01-15</td><td>17:59</td><td>19:29</td><td>90 minit</td></tr>
<tr><td>2026-06-21</td><td>19:06</td><td>20:36</td><td>90 minit</td></tr>
<tr><td>2026-09-23</td><td>18:16</td><td>19:46</td><td>90 minit</td></tr>
<tr><td>2026-12-21</td><td>17:44</td><td>19:14</td><td>90 minit</td></tr>
</tbody></table>`)}
<p>Selang itu tidak pernah beralih, sedangkan Isyak berasaskan sudut menghasilkan selang yang berubah mengikut musim. Di Makkah pada 21 Jun 2026, Isyak 17° MWL jatuh pada 20:26 manakala Umm al-Qura memberi 20:36 — beza sepuluh minit. Pada 21 Disember jurang itu melebar kepada lima belas minit. Itulah beza praktikal antara sudut dan selang.</p>
<p><strong>TimesPrayers pada masa ini menggunakan selang tetap 90 minit selepas Maghrib sepanjang tahun.</strong></p>

<h2>Apabila pihak berkuasa menggunakan pelarasan minit</h2>
<p>Sesetengah pihak berkuasa tidak menerbitkan sudut mentah sahaja. Mereka menerbitkan jadual yang sudah mengandungi <strong>minit ihtiyat (langkah berjaga-jaga)</strong> — <em>temkin</em> di Turki, <em>ihtiyat</em> di Malaysia dan Indonesia. Kira sudut sahaja, dan anda akan tersasar beberapa minit daripada jadual rasmi.</p>
<h3>Turki</h3>
<p><strong>Turki</strong> ialah kes berdokumen rasmi yang paling jelas. Diyanet İşleri Başkanlığı (badan hal ehwal agama Turki) menerbitkan jadual <em>temkin</em> yang nyata: waktu matahari terbit dialihkan tujuh minit lebih awal, manakala lima minit ditambah pada Zohor, empat pada Asar dan tujuh pada Maghrib; tiada pelarasan pada imsak mahupun Isyak. TimesPrayers menggunakan pelarasan terbitan yang sama itu di atas sudut 18°/17°.</p>
<h3>Malaysia</h3>
<p>Di <strong>Malaysia</strong>, JAKIM menggunakan 20° untuk Subuh dan 18° untuk Isyak. TimesPrayers menggunakan <strong>pelarasan minitnya sendiri</strong> untuk sejajar dengan jadual yang diterbitkan; pelarasan itu bukan angka rasmi dan tidak boleh dinisbahkan kepada JAKIM.</p>
<h3>Indonesia</h3>
<p>Di <strong>Indonesia</strong>, laman ini menggunakan sudut 20° dan 18° yang sepadan dengan kriteria Kementerian Agama, dan <strong>tidak menggunakan sebarang pelarasan minit <em>ihtiyath</em> yang berasingan</strong>. Bahan Kemenag memerihalkan penambahan minit ihtiyat dalam penyediaan jadual solat; itu tidak digunakan di sini.</p>
<h3>Maghribi</h3>
<p>Di <strong>Maghribi</strong>, laman ini menggunakan Subuh 18° dengan anjakan tetap enam minit lebih awal. Kami membandingkan hasilnya dengan jadual Rabat yang diterbitkan oleh Kementerian Habous dan Hal Ehwal Islam pada empat tarikh dalam Ogos–September 2026, dan Subuh kami berada dalam <strong>satu hingga dua minit</strong> daripada waktu terbitan bagi sampel yang diperiksa. Kami tidak menisbahkan sebarang sudut pengiraan tertentu kepada kementerian itu.</p>

<h2>Bagaimana Asar dikira</h2>
<p>Asar mempunyai dua takrif yang digunakan secara meluas, kedua-duanya berasaskan panjang bayang:</p>
<ul>
<li><strong>Faktor bayang 1</strong> — Asar bermula apabila bayang sesuatu objek sama panjang dengan objek itu sendiri, ditambah bayang pada waktu tengah hari. Inilah tetapan lalai di sini.</li>
<li><strong>Faktor bayang 2</strong> — Asar bermula apabila bayang mencapai dua kali panjang objek, ditambah bayang tengah hari.</li>
</ul>
<p>Bezanya besar, bukan kecil. Di Kaherah pada 21 Mac 2026 di bawah MWL, faktor 1 memberi Asar pada <strong>15:30</strong> dan faktor 2 pada <strong>16:24</strong> — beza lima puluh empat minit.</p>
<p>Laman ini menyokong kedua-dua takrif dan menggunakan faktor bayang 1 secara lalai. Takrif mana yang diikuti seseorang bergantung pada mazhab atau pihak berkuasa yang diikutinya.</p>

<h2>Bagaimana kaedah dipilih secara automatik</h2>
<p>Apabila anda membuka halaman sesebuah bandar, laman ini memilih kaedah <strong>mengikut negara bandar itu</strong>: Mesir dan Libya menggunakan kaedah Mesir, Perancis kaedah kesatuan Perancis, Turki Diyanet, Iran Tehran, Pakistan/India/Bangladesh/Afghanistan Karachi, Malaysia JAKIM, Indonesia Kementerian Agamanya, Singapura dan Brunei kaedah serantau. Mana-mana negara yang tidak dipetakan menggunakan MWL sebagai kaedah sandaran dalam pelaksanaan semasa.</p>

<h2>Bagaimana ini kelihatan pada waktu akhir</h2>
<p>Satu contoh mengikat semuanya. Kaherah (30.0444° N, 31.2357° E), 21 Mac 2026, UTC+2, dikira oleh laman ini:</p>

${T(`<table>
<thead><tr><th>Kaedah</th><th>Subuh</th><th>Syuruk</th><th>Zohor</th><th>Asar</th><th>Maghrib</th><th>Isyak</th></tr></thead>
<tbody>
<tr><td>MWL</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:22</td></tr>
<tr><td>ISNA</td><td>04:52</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:13</td></tr>
<tr><td>Egyptian</td><td>04:31</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:25</td></tr>
<tr><td>Umm al-Qura</td><td>04:36</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:37</td></tr>
<tr><td>Karachi</td><td>04:38</td><td>05:58</td><td>12:02</td><td>15:30</td><td>18:07</td><td>19:27</td></tr>
</tbody></table>`)}
<p><strong>Syuruk, Zohor dan Maghrib serupa pada kelima-limanya</strong> — takrifnya geometri dan tidak bergantung pada ambang senja yang dipilih. Seluruh rentangan terletak pada Subuh dan Isyak: dua puluh satu minit antara sudut Subuh tersempit (ISNA 15°) dan terluas (Egyptian 19.5°). Asar sepadan di sini kerana kelima-limanya berkongsi faktor bayang lalai yang sama.</p>

<h2>Latitud tinggi</h2>
<p>Semakin jauh ke utara atau ke selatan, semakin cepat tiba hari apabila matahari langsung tidak turun sehingga sudut yang diperlukan — jadi pada hari itu tiada Subuh atau Isyak astronomi. Sebaliknya, satu peraturan anggaran yang membahagi malam digunakan. Laman ini melaksanakan tiga peraturan lazim, ditambah satu peraturan keempat miliknya sendiri untuk lokasi di Jerman, yang memilih antara pengiraan sebenar dan anggaran bergantung pada sama ada sudut itu benar-benar dicapai dengan margin yang mencukupi. Satu <a href="/ms/guides/why-prayer-times-differ">panduan berasingan</a> membincangkannya dengan terperinci.</p>

<h2>Memilih yang sesuai untuk anda</h2>
<p>Peraturan praktikalnya mudah: <strong>ikut apa yang digunakan masjid anda atau pihak berkuasa negara anda.</strong> Tujuannya adalah untuk solat berjemaah, bukan untuk memadankan angka. Sebab itulah laman ini secara lalai memilih kaedah yang dikaitkan dengan negara bandar berkenaan.</p>
<p>Jika anda membandingkan dengan sumber lain, bandingkan secara adil: tarikh sama, koordinat sama, kaedah sama, takrif Asar sama. Kebanyakan «kesilapan» yang kelihatan sebenarnya hanyalah dua tetapan yang berlainan.</p>
`,
sources: `
<h2>Sumber</h2>
<p class="guide-sources-note">Sudut dan pelarasan minit di bawah dinisbahkan kepada badan yang menerbitkannya. Setiap perbandingan berangka pada halaman ini dikira oleh enjin laman ini, menggunakan tarikh dan koordinat yang dinamakan dalam setiap contoh.</p>
<ul>
<li>Diyanet İşleri Başkanlığı (Turki) — jadual <em>temkin</em> rasmi: <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Kementerian Habous dan Hal Ehwal Islam, Maghribi — jadual Rabat yang diterbitkan: <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Kementerian Agama Republik Indonesia (Kemenag) — kriteria jadual solat</li>
<li>Universiti Umm al-Qura, Makkah — piawai pengiraan yang diterbitkan</li>
<li>Muslim World League · Egyptian General Authority of Survey · University of Islamic Sciences, Karachi · ISNA · Union of Islamic Organisations of France · JAKIM Malaysia</li>
<li>Jadual perbandingan parameter: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>
<p class="guide-sources-note"><strong>Nota:</strong> sesetengah pihak berkuasa menerbitkan jadual yang sudah memasukkan minit ihtiyat. Di mana apa yang kami gunakan berbeza daripada sudut rasmi, kami menyatakannya dalam kandungan halaman.</p>

---
`,
related: [
  { href: '/ms/guides/why-prayer-times-differ', label: 'Mengapa Waktu Solat Berbeza antara Aplikasi dan Laman Web?' },
  { href: '/ms/guides/how-qibla-direction-is-calculated', label: 'Bagaimana Arah Kiblat Dikira' },
  { href: '/ms/prayer-times-worldwide', label: 'Waktu Solat Seluruh Dunia' },
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

<h2>السبب الثاني: تعديلات الجهة بالدقائق</h2>
<p>بعض الجهات لا تنشر ناتج الزاوية الخام، بل جدولًا يضيف عليه <strong>دقائق احتياط</strong>.</p>
<p>أوضح مثال موثَّق رسميًا هو <strong>تركيا</strong>: تنشر Diyanet İşleri Başkanlığı جدول «تمكين» معلنًا — يُقدَّم الشروق سبع دقائق، وتُضاف خمس دقائق إلى الظهر، وأربع إلى العصر، وسبع إلى المغرب، ولا تعديل على الإمساك والعشاء.</p>
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
<p>والفارق ليس هامشيًا. القاهرة يوم 21 مارس 2026 بحساب رابطة العالم الإسلامي: التعريف الأول يعطي 15:30، والثاني 16:24 — <strong>أربع وخمسون دقيقة</strong>. فإن كان اختلافك في العصر وحده وبهذا الحجم، فمن المرجّح جدًا أن يكون هذا هو السبب. ويستخدم الموقع عامل الظل 1 افتراضيًا، ويدعم الآخر.</p>

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

<h2>Cause two: the authority's minute adjustments</h2>
<p>Some authorities don't publish the raw angle result. They publish a table with <strong>precautionary minutes</strong> added.</p>
<p>The clearest officially documented case is <strong>Turkey</strong>. Diyanet İşleri Başkanlığı publishes an explicit <em>temkin</em> table: sunrise is shifted seven minutes earlier, while five minutes are added to Dhuhr, four to Asr and seven to Maghrib; no adjustment is applied to imsak or Isha.</p>
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
<p>The difference isn't marginal. Cairo on 21 March 2026 with MWL: the first definition gives 15:30, the second 16:24 — <strong>fifty-four minutes</strong>. If your discrepancy is in Asr alone and is roughly that size, this is very likely the cause. This site uses shadow factor 1 by default and supports the other.</p>

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
fr: {
h1: 'Pourquoi les heures de prière diffèrent entre applications et sites',
body: `
<p class="guide-intro">Vous ouvrez une application et le Fajr a déjà été annoncé ; vous consultez un autre site et il tombe douze minutes plus tard. Lequel a tort ? En général aucun des deux. L'écart n'est pas un calcul défaillant : ce sont des réglages différents qui alimentent la même équation. Cette page recense cinq raisons courantes pour lesquelles les heures de prière diffèrent, de l'effet le plus important au plus faible.</p>

<h2>Première cause : un angle différent</h2>
<p>Le lever du soleil, le Dhuhr et le Maghrib ont des définitions géométriques directes que personne ne conteste. Le Fajr et l'Isha sont liés au crépuscule, et le crépuscule est un effacement progressif plutôt qu'un instant. Chaque autorité a donc choisi un <strong>seuil</strong> : la profondeur à laquelle le soleil est descendu sous l'horizon.</p>
<p>Quand une source utilise un Fajr à 15° et une autre à 19.5°, l'écart entre elles au Caire le 21 mars 2026 est de <strong>vingt et une minutes</strong>. Aucune n'a tort ; chacune applique son propre seuil.</p>
<p>Et cet écart <strong>ne reste pas fixe</strong>. Aux latitudes moyennes, un degré vaut environ cinq minutes en hiver et peut atteindre sept près du solstice d'été. Comparez en janvier, comparez de nouveau en juin, et la différence a changé — ce qui à soi seul désoriente beaucoup de gens. Les méthodes et leurs angles sont traités dans le <a href="/fr/guides/prayer-time-calculation-methods">guide des méthodes de calcul</a>.</p>

<h2>Deuxième cause : les ajustements en minutes de l'autorité</h2>
<p>Certaines autorités ne publient pas le résultat brut de l'angle. Elles publient un tableau auquel des <strong>minutes de précaution</strong> ont déjà été ajoutées.</p>
<p>Le cas officiellement documenté le plus net est la <strong>Turquie</strong>. Diyanet İşleri Başkanlığı, l'autorité turque chargée des affaires religieuses, publie un tableau de <em>temkin</em> explicite : le lever du soleil est avancé de sept minutes, tandis que cinq minutes sont ajoutées au Dhuhr, quatre au Asr et sept au Maghrib ; aucun ajustement sur l'imsak ni sur l'Isha.</p>
<p>Ainsi, si deux sources calculent exactement le même angle et que l'une applique ce tableau alors que l'autre non, le lever du soleil différera de sept minutes <strong>alors même que l'astronomie est identique</strong>. C'est une origine fréquente d'un décalage petit mais obstinément constant.</p>

<h2>Troisième cause : les coordonnées</h2>
<p>Les heures de prière se calculent pour un point, non pour une ville. Si deux sources vous placent en des points différents, les heures diffèrent.</p>
<p>Mais l'ampleur de cet effet est largement surestimée. Nous avons mesuré Le Caire le 27 août 2026 avec la méthode égyptienne :</p>

${T(`<table>
<thead><tr><th>Emplacement</th><th>Fajr</th><th>Dhuhr</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Centre du Caire</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>Helwan (sud)</td><td>03:58</td><td>11:56</td><td>18:23</td></tr>
<tr><td>Shubra El-Kheima (nord)</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>6 Octobre (ouest)</td><td>04:00</td><td>11:58</td><td>18:25</td></tr>
</tbody></table>`)}
<p>Sur environ trente-deux kilomètres, l'amplitude est d'<strong>une minute</strong>. Les coordonnées n'expliquent pas de façon convaincante une différence de dix minutes.</p>
<p>Le grand effet apparaît quand l'étendue géographique s'élargit <strong>à l'intérieur d'un même fuseau horaire</strong>. Toute l'Espagne partage une seule horloge en été, et pourtant — calculé avec la MWL pour le 27 août 2026 :</p>

${T(`<table>
<thead><tr><th>Ville</th><th>Longitude</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Barcelone</td><td>2.17° E</td><td>20:33</td></tr>
<tr><td>Madrid</td><td>3.70° O</td><td>20:55</td></tr>
<tr><td>La Corogne</td><td>8.41° O</td><td>21:18</td></tr>
</tbody></table>`)}
<p><strong>Quarante-cinq minutes</strong> entre les deux extrémités d'un même pays sur une même horloge. Si une source utilise les coordonnées de votre ville et qu'une autre se rabat sur la capitale ou sur un centroïde national, cela seul produit un large écart.</p>

<h2>Quatrième cause : fuseau horaire et heure d'été</h2>
<p>L'instant astronomique est le même ; l'horloge sur laquelle il s'affiche dépend du décalage. Londres l'illustre nettement :</p>

${T(`<table>
<thead><tr><th>Cas</th><th>Date</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Hiver (UTC+0)</td><td>2026-01-15</td><td>16:21</td></tr>
<tr><td>Été (UTC+1)</td><td>2026-06-21</td><td>21:22</td></tr>
<tr><td>Été mais avec le décalage d'hiver</td><td>2026-06-21</td><td>20:22</td></tr>
</tbody></table>`)}
<p>Les deux dernières lignes sont <strong>le même instant astronomique</strong>. L'heure pleine qui les sépare vient uniquement du décalage. Un écart d'exactement une heure relève presque toujours du fuseau horaire ou de l'heure d'été, non du calcul.</p>

<h2>Cinquième cause : l'arrondi</h2>
<p>Les heures s'affichent à la minute ; le calcul, lui, produit une valeur plus précise. Ce site arrondit à la <strong>minute la plus proche</strong>, tandis qu'une autre source peut simplement <strong>tronquer</strong> les secondes. Le résultat peut différer d'une minute entière pour une même valeur sous-jacente.</p>
<p>Le Caire, 27 août 2026, méthode égyptienne :</p>

${T(`<table>
<thead><tr><th>Heure</th><th>Valeur calculée</th><th>Arrondi à la minute la plus proche</th><th>Tronqué</th></tr></thead>
<tbody>
<tr><td>Dhuhr</td><td>11:56:37</td><td><strong>11:57</strong></td><td>11:56</td></tr>
<tr><td>Asr</td><td>15:31:32</td><td><strong>15:32</strong></td><td>15:31</td></tr>
<tr><td>Maghrib</td><td>18:23:37</td><td><strong>18:24</strong></td><td>18:23</td></tr>
</tbody></table>`)}
<p>Sur trente heures relevées en cinq jours, les deux politiques ont divergé sur <strong>seize</strong> d'entre elles — environ la moitié, parce que les secondes dépassent trente à peu près une fois sur deux. L'écart est d'une minute et n'a rien à voir avec l'astronomie : il tient à la seule politique d'affichage.</p>

<h2>Le cas particulier : les hautes latitudes</h2>
<p>Plus on va vers le nord ou vers le sud, plus vite on atteint un jour où le soleil ne descend jamais jusqu'à l'angle requis. Il n'y a ce jour-là ni Fajr ni Isha astronomiques — non parce que le calcul a échoué, mais parce que l'événement n'a pas eu lieu.</p>
<h3>Les trois règles</h3>
<p>On utilise à la place une règle qui répartit la nuit entre le Maghrib et le lever du soleil. Les trois règles conventionnelles sont :</p>
<ul>
<li><strong>Milieu de la nuit</strong> — la nuit est coupée en deux.</li>
<li><strong>Un septième de la nuit</strong> — la nuit est divisée en sept parts ; l'Isha commence après la première, le Fajr au début de la dernière.</li>
<li><strong>Fondée sur l'angle</strong> — la nuit est divisée proportionnellement à l'angle rapporté à soixante.</li>
</ul>
<p>Ce n'est <strong>pas un petit détail technique</strong>. Stockholm (59.33° N) calculé avec la MWL :</p>

${T(`<table>
<thead><tr><th>Date</th><th>Fondée sur l'angle</th><th>Un septième</th><th>Milieu de la nuit</th><th>Écart le plus large</th></tr></thead>
<tbody>
<tr><td>2026-05-20</td><td>02:05</td><td>03:07</td><td>00:45</td><td><strong>142 min</strong></td></tr>
<tr><td>2026-06-21</td><td>01:54</td><td>02:45</td><td>00:50</td><td>115 min</td></tr>
<tr><td>2026-07-15</td><td>02:07</td><td>03:05</td><td>00:54</td><td>131 min</td></tr>
<tr><td>2026-12-21</td><td>07:02</td><td>07:10</td><td>07:02</td><td>8 min</td></tr>
</tbody></table>`)}
<p>En mai, l'amplitude dépasse <strong>deux heures</strong> ; en décembre, elle s'efface presque. Si vous êtes dans le nord et que vous voyez un écart énorme entre deux applications, la cause est probablement une règle différente, non un angle différent.</p>
<p>La documentation de PrayTimes présente la méthode fondée sur l'angle comme une option recommandée. TimesPrayers utilise de son côté AngleBased comme règle par défaut actuelle pour les hautes latitudes.</p>
<h3>Une règle propre à TimesPrayers pour l'Allemagne</h3>
<p>Pour les localités allemandes, TimesPrayers applique sa propre règle DEHybrid, qui commence par se demander : <strong>le soleil atteint-il réellement l'angle aujourd'hui, avec une marge suffisante ?</strong> Si oui, c'est le calcul astronomique réel qui est utilisé ; sinon, c'est l'estimation.</p>
<p>La différence est réelle, non théorique. Francfort le 21 mai 2026 avec la MWL : la règle hybride donne le Fajr à 02:33 tandis que la règle fondée sur l'angle donne 03:02 — vingt-neuf minutes d'écart. La plupart des jours de l'année, les deux coïncident exactement ; la divergence se limite aux semaines de fin de printemps et d'été où la question a effectivement une réponse.</p>

<h2>Le Asr est une cause entièrement distincte</h2>
<p>Deux sources peuvent s'accorder sur tout ce qui précède et différer sur le seul Asr, parce que le Asr a deux définitions : lorsque l'ombre d'un objet égale sa longueur, ou lorsqu'elle en fait le double.</p>
<p>La différence n'est pas marginale. Le Caire le 21 mars 2026 avec la MWL : la première définition donne 15:30, la seconde 16:24 — <strong>cinquante-quatre minutes</strong>. Si votre écart porte sur le seul Asr et qu'il est de cet ordre, c'est très probablement la cause. Ce site utilise le facteur d'ombre 1 par défaut et prend l'autre en charge.</p>

<h2>Comment comparer deux sources loyalement</h2>
<p>Avant de décider que l'une a tort, faites correspondre les cinq points :</p>
<ol>
<li><strong>La même date</strong> — les heures bougent chaque jour.</li>
<li><strong>Les mêmes coordonnées</strong> — pas « Le Caire » d'un côté et « centre du Caire » de l'autre.</li>
<li><strong>La même méthode</strong> — ses deux angles.</li>
<li><strong>La même définition du Asr.</strong></li>
<li><strong>Le même décalage</strong> — heure d'été comprise.</li>
</ol>
<p>Si les cinq correspondent et qu'il reste une ou deux minutes, c'est l'arrondi. S'il reste une heure, c'est le fuseau horaire. S'il reste deux heures et que vous êtes dans le nord, c'est la règle des hautes latitudes.</p>
<p>Et la règle pratique tient toujours : <strong>suivez ce qu'utilise votre mosquée ou l'autorité de votre pays.</strong></p>
`,
sources: `
<h2>Sources</h2>
<p class="guide-sources-note">Chaque mesure de cette page a été calculée par le moteur de ce site, avec les dates et les coordonnées nommées dans chaque tableau.</p>
<ul>
<li>Définitions des règles pour hautes latitudes : documentation Pray Times — <a href="https://praytimes.org/calculation" rel="nofollow noopener" target="_blank">praytimes.org/calculation</a></li>
<li>Tableau officiel du temkin : Diyanet İşleri Başkanlığı (Turquie) — <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Horaire publié pour Rabat : Ministère des Habous et des Affaires islamiques — <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Tableau comparatif des paramètres : <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>

---
`,
related: [
  { href: '/fr/guides/prayer-time-calculation-methods', label: 'Méthodes de calcul des heures de prière et angles' },
  { href: '/fr/guides/how-qibla-direction-is-calculated', label: 'Comment la direction de la Qibla est calculée' },
],
},
tr: {
h1: 'Namaz Vakitleri Uygulamalar ve Siteler Arasında Neden Farklı?',
body: `
<p class="guide-intro">Bir uygulamayı açıyorsunuz, imsak çoktan girmiş; başka bir siteye bakıyorsunuz, on iki dakika sonra. Hangisi yanlış? Genellikle hiçbiri. Fark bozuk bir hesap değil — aynı denkleme verilen farklı ayarlardır. Bu sayfa, namaz vakitlerinin farklı çıkmasının beş yaygın sebebini, etkisi en büyükten en küçüğe doğru sıralar.</p>

<h2>Birinci sebep: farklı açı</h2>
<p>Güneşin doğuşu, öğle ve akşamın kimsenin tartışmadığı doğrudan geometrik tanımları vardır. İmsak ile yatsı alacakaranlıkla ilişkilidir; alacakaranlık tek bir an değil, kademeli bir geçiştir. Bu yüzden her merci bir <strong>eşik</strong> seçti: güneş ufkun ne kadar altına inmiştir.</p>
<p>Bir kaynak 15° imsak, diğeri 19.5° kullandığında, Kahire'de 21 Mart 2026'daki aralarındaki fark <strong>yirmi bir dakikadır</strong>. İkisi de yanlış değil; her biri kendi eşiğini uyguluyor.</p>
<p>Üstelik bu fark <strong>sabit kalmaz</strong>. Orta enlemlerde bir derece kışın yaklaşık beş dakika, yaz gündönümüne yakın yedi dakikaya kadar çıkar. Ocak'ta karşılaştırın, Haziran'da tekrar karşılaştırın; fark değişmiş olur — bu tek başına birçok kişiyi şaşırtır. Yöntemler ve açıları <a href="/tr/guides/prayer-time-calculation-methods">hesaplama yöntemleri rehberinde</a> ele alınıyor.</p>

<h2>İkinci sebep: kurumun uyguladığı dakika düzeltmeleri</h2>
<p>Bazı merciler açının ham sonucunu yayımlamaz. İhtiyat amaçlı <strong>dakika düzeltmelerini</strong> zaten içeren bir cetvel yayımlarlar.</p>
<p>Resmî olarak belgelenmiş en açık örnek <strong>Türkiye</strong>'dir. Diyanet İşleri Başkanlığı açık bir temkin cetveli yayımlar: güneşin doğuşu yedi dakika öne alınır; öğleye beş, ikindiye dört, akşama yedi dakika eklenir; imsak ve yatsıda ise düzeltme yoktur.</p>
<p>Dolayısıyla iki kaynak tamamen aynı açıyı hesaplasa ve biri bu cetveli uygulayıp öteki uygulamasa, <strong>astronomi birebir aynıyken</strong> güneşin doğuşu yedi dakika farklı çıkar. Küçük ama inatla sabit kalan bir kaymanın yaygın kaynağı budur.</p>

<h2>Üçüncü sebep: koordinatlar</h2>
<p>Namaz vakitleri bir şehir için değil bir nokta için hesaplanır. İki kaynak sizi farklı noktalara koyarsa vakitler de farklı olur.</p>
<p>Ama bu etkinin büyüklüğü fazlasıyla abartılıyor. Kahire'yi 27 Ağustos 2026'da Mısır yöntemiyle ölçtük:</p>

${T(`<table>
<thead><tr><th>Konum</th><th>İmsak</th><th>Öğle</th><th>Akşam</th></tr></thead>
<tbody>
<tr><td>Kahire merkez</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>Helwan (güney)</td><td>03:58</td><td>11:56</td><td>18:23</td></tr>
<tr><td>Shubra El Kheima (kuzey)</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>6th of October (batı)</td><td>04:00</td><td>11:58</td><td>18:25</td></tr>
</tbody></table>`)}
<p>Yaklaşık otuz iki kilometre boyunca yayılım <strong>bir dakikadır</strong>. Koordinatlar, on dakikalık bir farkın inandırıcı açıklaması değildir.</p>
<p>Büyük etki, coğrafi yayılım <strong>tek bir saat dilimi içinde</strong> genişlediğinde ortaya çıkar. Tüm İspanya yazın aynı saati paylaşır; yine de — 27 Ağustos 2026 için MWL ile hesaplandığında:</p>

${T(`<table>
<thead><tr><th>Şehir</th><th>Boylam</th><th>Akşam</th></tr></thead>
<tbody>
<tr><td>Barselona</td><td>2.17° E</td><td>20:33</td></tr>
<tr><td>Madrid</td><td>3.70° W</td><td>20:55</td></tr>
<tr><td>A Coruña</td><td>8.41° W</td><td>21:18</td></tr>
</tbody></table>`)}
<p>Tek saatte, tek ülkenin iki ucu arasında <strong>kırk beş dakika</strong>. Bir kaynak sizin şehrinizin koordinatlarını kullanırken diğeri başkenti ya da ülke merkezini yedek alıyorsa, tek başına bu bile büyük bir fark üretir.</p>

<h2>Dördüncü sebep: saat dilimi ve yaz saati</h2>
<p>Astronomik an aynıdır; onu gösteren saat ise ofsete bağlıdır. Londra bunu net gösterir:</p>

${T(`<table>
<thead><tr><th>Durum</th><th>Tarih</th><th>Akşam</th></tr></thead>
<tbody>
<tr><td>Kış (UTC+0)</td><td>2026-01-15</td><td>16:21</td></tr>
<tr><td>Yaz (UTC+1)</td><td>2026-06-21</td><td>21:22</td></tr>
<tr><td>Yaz, ama kış ofsetiyle</td><td>2026-06-21</td><td>20:22</td></tr>
</tbody></table>`)}
<p>Son iki satır <strong>aynı astronomik andır</strong>. Aralarındaki tam bir saat yalnızca ofsetten gelir. Tam bir saatlik fark neredeyse her zaman saat dilimi ya da yaz saati meselesidir, hesap meselesi değil.</p>

<h2>Beşinci sebep: yuvarlama</h2>
<p>Vakitler dakikaya kadar gösterilir; hesap ise daha ince bir değer üretir. Bu site <strong>en yakın dakikaya</strong> yuvarlar, başka bir kaynak ise saniyeyi yalnızca <strong>kesebilir</strong>. Aynı temel değerde sonuç tam bir dakika farklı çıkabilir.</p>
<p>Kahire, 27 Ağustos 2026, Mısır yöntemi:</p>

${T(`<table>
<thead><tr><th>Vakit</th><th>Hesaplanan değer</th><th>En yakın dakikaya yuvarlanmış</th><th>Kesilmiş</th></tr></thead>
<tbody>
<tr><td>Öğle</td><td>11:56:37</td><td><strong>11:57</strong></td><td>11:56</td></tr>
<tr><td>İkindi</td><td>15:31:32</td><td><strong>15:32</strong></td><td>15:31</td></tr>
<tr><td>Akşam</td><td>18:23:37</td><td><strong>18:24</strong></td><td>18:23</td></tr>
</tbody></table>`)}
<p>Beş günde otuz vakit boyunca iki politika <strong>on altısında</strong> ayrıştı — yaklaşık yarısında, çünkü saniyeler kabaca zamanın yarısında otuzu aşıyor. Fark bir dakikadır ve astronomiyle ilgisi yoktur: yalnızca gösterim politikasıdır.</p>

<h2>Özel durum: yüksek enlemler</h2>
<p>Kuzeye ya da güneye gittikçe, güneşin gerekli açıya hiç inmediği bir güne daha çabuk varılır. O gün astronomik imsak ya da yatsı yoktur — hesap başarısız olduğu için değil, olay gerçekleşmediği için.</p>
<h3>Üç kural</h3>
<p>Onun yerine geceyi akşam ile güneşin doğuşu arasında bölen bir kural kullanılır. Üç geleneksel kural şunlardır:</p>
<ul>
<li><strong>Gecenin ortası</strong> — gece ikiye bölünür.</li>
<li><strong>Gecenin yedide biri</strong> — gece yedi parçaya bölünür; yatsı ilk parçadan sonra, imsak son parçanın başında girer.</li>
<li><strong>Açıya dayalı</strong> — gece, açının altmışa oranına göre bölünür.</li>
</ul>
<p>Bu <strong>küçük bir teknik ayrıntı değildir</strong>. Stockholm (59.33° N), MWL ile hesaplanmış:</p>

${T(`<table>
<thead><tr><th>Tarih</th><th>Açıya dayalı</th><th>Yedide bir</th><th>Gecenin ortası</th><th>En geniş fark</th></tr></thead>
<tbody>
<tr><td>2026-05-20</td><td>02:05</td><td>03:07</td><td>00:45</td><td><strong>142 dakika</strong></td></tr>
<tr><td>2026-06-21</td><td>01:54</td><td>02:45</td><td>00:50</td><td>115 dakika</td></tr>
<tr><td>2026-07-15</td><td>02:07</td><td>03:05</td><td>00:54</td><td>131 dakika</td></tr>
<tr><td>2026-12-21</td><td>07:02</td><td>07:10</td><td>07:02</td><td>8 dakika</td></tr>
</tbody></table>`)}
<p>Mayıs'ta yayılım <strong>iki saati</strong> aşıyor; Aralık'ta neredeyse kayboluyor. Kuzeydeyseniz ve iki uygulama arasında çok büyük bir fark görüyorsanız sebep büyük olasılıkla farklı bir kuraldır, farklı bir açı değil.</p>
<p>PrayTimes belgeleri açıya dayalı yöntemi önerilen bir seçenek olarak niteler. TimesPrayers ise bağımsız olarak AngleBased'i mevcut varsayılan yüksek enlem kuralı olarak kullanır.</p>
<h3>Almanya için TimesPrayers'a özgü kural</h3>
<p>Almanya'daki konumlar için TimesPrayers kendi DEHybrid kuralını uygular; bu kural önce şunu sorar: <strong>güneş bugün o açıya yeterli payla gerçekten ulaşıyor mu?</strong> Ulaşıyorsa gerçek astronomik hesap, ulaşmıyorsa tahmin kullanılır.</p>
<p>Fark kuramsal değil gerçektir. Frankfurt'ta 21 Mayıs 2026'da MWL ile: melez kural imsağı 02:33'te, açıya dayalı kural 03:02'de verir — yirmi dokuz dakika fark. Yılın çoğu gününde ikisi birebir örtüşür; ayrışma, gerçek hesap ile tahmin arasındaki seçimin fiilen anlam kazandığı ilkbahar sonu ve yaz haftalarıyla sınırlıdır.</p>

<h2>İkindi bütünüyle ayrı bir sebeptir</h2>
<p>İki kaynak yukarıdaki her şeyde anlaşıp yalnızca ikindide ayrışabilir, çünkü ikindinin iki tanımı vardır: cismin gölgesi boyuna eşit olduğunda ya da boyunun iki katına ulaştığında.</p>
<p>Fark küçük değildir. Kahire'de 21 Mart 2026'da MWL ile: birinci tanım 15:30, ikincisi 16:24 verir — <strong>elli dört dakika</strong>. Farkınız yalnızca ikindideyse ve kabaca bu büyüklükteyse, sebep büyük olasılıkla budur. Bu site varsayılan olarak gölge katsayısı 1'i kullanır ve diğerini de destekler.</p>

<h2>İki kaynağı adil biçimde karşılaştırmak</h2>
<p>Birinin yanlış olduğuna karar vermeden önce beşini de eşleyin:</p>
<ol>
<li><strong>Aynı tarih</strong> — vakitler her gün kayar.</li>
<li><strong>Aynı koordinatlar</strong> — bir yanda «Kahire», öbür yanda «Kahire merkez» olmasın.</li>
<li><strong>Aynı yöntem</strong> — iki açısıyla birlikte.</li>
<li><strong>Aynı ikindi tanımı.</strong></li>
<li><strong>Aynı ofset</strong> — yaz saati dahil.</li>
</ol>
<p>Beşi de eşleşiyorsa ve bir iki dakika kalıyorsa, o yuvarlamadır. Bir saat kalıyorsa saat dilimidir. İki saat kalıyorsa ve kuzeydeyseniz, yüksek enlem kuralıdır.</p>
<p>Pratik kural da hâlâ geçerli: <strong>caminizin ya da ülkenizdeki merciin kullandığını izleyin.</strong></p>
`,
sources: `
<h2>Kaynaklar</h2>
<p class="guide-sources-note">Bu sayfadaki her ölçüm, her tabloda adı geçen tarih ve koordinatlarla bu sitenin motorunda hesaplanmıştır.</p>
<ul>
<li>Yüksek enlem kurallarının tanımları: Pray Times belgeleri — <a href="https://praytimes.org/calculation" rel="nofollow noopener" target="_blank">praytimes.org/calculation</a></li>
<li>Resmî temkin cetveli: Diyanet İşleri Başkanlığı (Türkiye) — <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Yayımlanan Rabat cetveli: Habous ve İslami İşler Bakanlığı — <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Karşılaştırmalı parametre tablosu: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>

---
`,
related: [
  { href: '/tr/guides/prayer-time-calculation-methods', label: 'Namaz Vakti Hesaplama Yöntemleri ve Açıları' },
  { href: '/tr/guides/how-qibla-direction-is-calculated', label: 'Kıble Yönü Nasıl Hesaplanır' },
],
},
ur: {
h1: 'اوقاتِ نماز ایپس اور ویب سائٹس کے درمیان مختلف کیوں ہوتے ہیں؟',
body: `
<p class="guide-intro">آپ ایک ایپ کھولتے ہیں تو فجر کی اذان ہو چکی ہے؛ دوسری سائٹ دیکھتے ہیں تو وہ بارہ منٹ بعد ہے۔ غلط کون ہے؟ عموماً کوئی بھی نہیں۔ فرق ٹوٹے ہوئے حساب کا نہیں — یہ مختلف ترتیبات ہیں جو ایک ہی مساوات کو کھلا رہی ہیں۔ یہ صفحہ اوقاتِ نماز کے مختلف ہونے کی پانچ عام وجوہات گناتا ہے، سب سے بڑے اثر سے سب سے چھوٹے تک۔</p>

<h2>پہلی وجہ: مختلف زاویہ</h2>
<p>طلوعِ آفتاب، ظہر اور مغرب کی براہِ راست ہندسی تعریفیں ہیں جن پر کسی کو اختلاف نہیں۔ فجر اور عشاء شفق سے جڑی ہیں، اور شفق ایک لمحے کے بجائے تدریجی دھندلاہٹ ہے۔ چنانچہ ہر ادارے نے ایک <strong>حد</strong> چنی: سورج افق سے کتنا نیچے اتر چکا ہے۔</p>
<p>جب ایک ذریعہ <bdi>15°</bdi> والی فجر استعمال کرتا ہے اور دوسرا <bdi>19.5°</bdi>، تو قاہرہ میں 21 مارچ 2026 کو ان کے درمیان فرق <strong>اکیس منٹ</strong> بنتا ہے۔ کوئی بھی غلط نہیں؛ ہر ایک اپنی حد لگا رہا ہے۔</p>
<p>اور یہ فرق <strong>ایک جیسا نہیں رہتا</strong>۔ درمیانی عرض البلد پر ایک درجہ سردیوں میں تقریباً پانچ منٹ اور گرمیوں کے انقلاب کے قریب سات منٹ تک بنتا ہے۔ جنوری میں موازنہ کیجیے، پھر جون میں کیجیے، اور فرق بدل چکا ہوگا — یہی بات بذاتِ خود بہت سے لوگوں کو الجھا دیتی ہے۔ طریقے اور ان کے زاویے <a href="/ur/guides/prayer-time-calculation-methods">حساب کے طریقوں والے رہنما مضمون</a> میں دیکھے گئے ہیں۔</p>

<h2>دوسری وجہ: ادارے کی منٹ کی ترمیمات</h2>
<p>کچھ ادارے زاویے کا خام نتیجہ شائع نہیں کرتے۔ وہ ایسا جدول شائع کرتے ہیں جس میں <strong>احتیاطی منٹ</strong> پہلے سے جوڑ دیے گئے ہوتے ہیں۔</p>
<p>سب سے واضح سرکاری طور پر دستاویزی مثال <strong>ترکی</strong> ہے۔ دیانت ایک صریح <em>temkin</em> جدول شائع کرتا ہے: طلوعِ آفتاب سات منٹ پہلے کر دیا جاتا ہے، جبکہ ظہر میں پانچ، عصر میں چار اور مغرب میں سات منٹ جوڑے جاتے ہیں؛ امساک اور عشاء پر کوئی ترمیم نہیں۔</p>
<p>چنانچہ اگر دو ذرائع بالکل ایک ہی زاویے کا حساب کریں اور ایک وہ جدول لگائے اور دوسرا نہ لگائے، تو طلوعِ آفتاب میں سات منٹ کا فرق آ جائے گا <strong>حالانکہ فلکیات دونوں کی ایک ہی ہے</strong>۔ یہ ایک چھوٹے مگر ضدی طور پر مستقل فرق کا عام سبب ہے۔</p>

<h2>تیسری وجہ: کوآرڈینیٹس</h2>
<p>اوقاتِ نماز کا حساب ایک نقطے کے لیے ہوتا ہے، پورے شہر کے لیے نہیں۔ اگر دو ذرائع آپ کو مختلف نقطوں پر رکھیں تو اوقات مختلف ہوں گے۔</p>
<p>لیکن اس اثر کی مقدار کا اندازہ عام طور پر بہت بڑھا کر لگایا جاتا ہے۔ ہم نے مصری طریقے سے 27 اگست 2026 کو قاہرہ کو ناپا:</p>

${T(`<table>
<thead><tr><th>مقام</th><th>فجر</th><th>ظہر</th><th>مغرب</th></tr></thead>
<tbody>
<tr><td>وسطی قاہرہ</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>حلوان (جنوب)</td><td>03:58</td><td>11:56</td><td>18:23</td></tr>
<tr><td>شبرا الخیمہ (شمال)</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td><bdi>6</bdi> اکتوبر (مغرب)</td><td>04:00</td><td>11:58</td><td>18:25</td></tr>
</tbody></table>`)}
<p>تقریباً بتیس کلومیٹر پر پھیلاؤ صرف <strong>ایک منٹ</strong> ہے۔ دس منٹ کے فرق کی وضاحت کے لیے کوآرڈینیٹس کا سہارا لینا قائل نہیں کرتا۔</p>
<p>بڑا اثر تب سامنے آتا ہے جب جغرافیائی پھیلاؤ <strong>ایک ہی ٹائم زون کے اندر</strong> چوڑا ہو جائے۔ سارے اسپین کی گرمیوں میں ایک ہی گھڑی ہے، پھر بھی — <bdi>MWL</bdi> سے 27 اگست 2026 کے لیے حساب کرنے پر:</p>

${T(`<table>
<thead><tr><th>شہر</th><th>طول البلد</th><th>مغرب</th></tr></thead>
<tbody>
<tr><td>بارسلونا</td><td><bdi>2.17° E</bdi></td><td>20:33</td></tr>
<tr><td>میڈرڈ</td><td><bdi>3.70° W</bdi></td><td>20:55</td></tr>
<tr><td>اے کورونیا</td><td><bdi>8.41° W</bdi></td><td>21:18</td></tr>
</tbody></table>`)}
<p>ایک ہی ملک کے دو سروں کے درمیان، ایک ہی گھڑی پر، <strong>پینتالیس منٹ</strong>۔ اگر ایک ذریعہ آپ کے شہر کے کوآرڈینیٹس لے اور دوسرا دارالحکومت یا ملک کے مرکزی نقطے پر لوٹ جائے، تو صرف یہی بڑا فرق پیدا کر دیتا ہے۔</p>

<h2>چوتھی وجہ: ٹائم زون اور ڈے لائٹ سیونگ</h2>
<p>فلکی لمحہ وہی رہتا ہے؛ جس گھڑی پر وہ دکھایا جائے وہ فرق پر منحصر ہے۔ لندن اسے صاف کر دیتا ہے:</p>

${T(`<table>
<thead><tr><th>صورت</th><th>تاریخ</th><th>مغرب</th></tr></thead>
<tbody>
<tr><td>سردی (<bdi>UTC+0</bdi>)</td><td><bdi>2026-01-15</bdi></td><td>16:21</td></tr>
<tr><td>گرمی (<bdi>UTC+1</bdi>)</td><td><bdi>2026-06-21</bdi></td><td>21:22</td></tr>
<tr><td>گرمی مگر سردی کے فرق کے ساتھ</td><td><bdi>2026-06-21</bdi></td><td>20:22</td></tr>
</tbody></table>`)}
<p>آخری دو سطریں <strong>ایک ہی فلکی لمحہ</strong> ہیں۔ ان کے درمیان کا پورا گھنٹہ خالصتاً وقت کے فرق سے آتا ہے۔ ٹھیک ایک گھنٹے کا فرق تقریباً ہمیشہ ٹائم زون یا ڈے لائٹ سیونگ کا معاملہ ہوتا ہے، حساب کا نہیں۔</p>

<h2>پانچویں وجہ: تقریب</h2>
<p>اوقات منٹ تک دکھائے جاتے ہیں؛ حساب اس سے زیادہ باریک قیمت نکالتا ہے۔ یہ سائٹ <strong>قریب ترین منٹ</strong> تک تقریب کرتی ہے، جبکہ کوئی دوسرا ذریعہ سیکنڈ کو محض <strong>کاٹ</strong> سکتا ہے۔ ایک ہی بنیادی قیمت پر نتیجہ پورے ایک منٹ کا فرق دے سکتا ہے۔</p>
<p>قاہرہ، 27 اگست 2026، مصری طریقہ:</p>

${T(`<table>
<thead><tr><th>وقت</th><th>حساب شدہ قیمت</th><th>قریب ترین منٹ تک تقریب</th><th>سیکنڈ کاٹ کر</th></tr></thead>
<tbody>
<tr><td>ظہر</td><td>11:56:37</td><td><strong>11:57</strong></td><td>11:56</td></tr>
<tr><td>عصر</td><td>15:31:32</td><td><strong>15:32</strong></td><td>15:31</td></tr>
<tr><td>مغرب</td><td>18:23:37</td><td><strong>18:24</strong></td><td>18:23</td></tr>
</tbody></table>`)}
<p>پانچ دنوں میں تیس اوقات پر دونوں پالیسیوں کا اختلاف <strong>سولہ</strong> اوقات میں نکلا — تقریباً نصف، کیونکہ سیکنڈ تقریباً آدھے مواقع پر تیس سے تجاوز کر جاتے ہیں۔ فرق ایک منٹ کا ہے اور اس کا فلکیات سے کوئی تعلق نہیں: یہ صرف پالیسی کا معاملہ ہے۔</p>

<h2>خاص صورت: بلند عرض البلد</h2>
<p>آپ جتنا شمال یا جنوب جاتے ہیں، اتنی جلدی ایسا دن آ جاتا ہے جب سورج مطلوبہ زاویے تک اترتا ہی نہیں۔ اُس دن فلکی فجر یا عشاء ہوتی ہی نہیں — اس لیے نہیں کہ حساب ناکام ہوا، بلکہ اس لیے کہ واقعہ پیش ہی نہیں آیا۔</p>
<h3>تین اصول</h3>
<p>اس کے بجائے ایسا اصول استعمال ہوتا ہے جو رات کو مغرب اور طلوعِ آفتاب کے درمیان تقسیم کرتا ہے۔ تین روایتی اصول یہ ہیں:</p>
<ul>
<li><strong>نصف رات</strong> — رات کو دو برابر حصوں میں بانٹا جاتا ہے۔</li>
<li><strong>رات کا ساتواں حصہ</strong> — رات کو سات حصوں میں بانٹا جاتا ہے؛ عشاء پہلے حصے کے بعد شروع ہوتی ہے، فجر آخری حصے کے آغاز پر۔</li>
<li><strong>زاویے پر مبنی</strong> — رات کو زاویے کے ساٹھ سے تناسب کے مطابق بانٹا جاتا ہے۔</li>
</ul>
<p>یہ <strong>کوئی چھوٹی تکنیکی تفصیل نہیں</strong>۔ اسٹاک ہوم (<bdi>59.33° N</bdi>) <bdi>MWL</bdi> سے حساب شدہ:</p>

${T(`<table>
<thead><tr><th>تاریخ</th><th>زاویے پر مبنی</th><th>ساتواں حصہ</th><th>نصف رات</th><th>سب سے چوڑا فرق</th></tr></thead>
<tbody>
<tr><td><bdi>2026-05-20</bdi></td><td>02:05</td><td>03:07</td><td>00:45</td><td><strong>142 منٹ</strong></td></tr>
<tr><td><bdi>2026-06-21</bdi></td><td>01:54</td><td>02:45</td><td>00:50</td><td>115 منٹ</td></tr>
<tr><td><bdi>2026-07-15</bdi></td><td>02:07</td><td>03:05</td><td>00:54</td><td>131 منٹ</td></tr>
<tr><td><bdi>2026-12-21</bdi></td><td>07:02</td><td>07:10</td><td>07:02</td><td>8 منٹ</td></tr>
</tbody></table>`)}
<p>مئی میں پھیلاؤ <strong>دو گھنٹے</strong> سے بڑھ جاتا ہے؛ دسمبر تک تقریباً ختم ہو جاتا ہے۔ اگر آپ شمال میں ہیں اور دو ایپس کے درمیان بہت بڑا فرق دیکھتے ہیں، تو سبب غالباً مختلف اصول ہے، مختلف زاویہ نہیں۔</p>
<p><bdi>PrayTimes</bdi> کی دستاویزات زاویے پر مبنی طریقے کو ایک تجویز کردہ اختیار کے طور پر درج کرتی ہیں۔ <bdi>TimesPrayers</bdi> آزادانہ طور پر <bdi>AngleBased</bdi> کو بلند عرض البلد کے لیے اپنا موجودہ طے شدہ اصول بناتی ہے۔</p>
<h3>جرمنی کے لیے <bdi>TimesPrayers</bdi> کا اپنا اصول</h3>
<p>جرمن مقامات کے لیے <bdi>TimesPrayers</bdi> اپنا <bdi>DEHybrid</bdi> اصول لگاتی ہے، جو پہلے یہ پوچھتا ہے: <strong>کیا سورج آج واقعی اُس زاویے تک پہنچتا ہے، کافی گنجائش کے ساتھ؟</strong> اگر ہاں، تو حقیقی فلکی حساب استعمال ہوتا ہے؛ ورنہ تخمینہ۔</p>
<p>فرق حقیقی ہے، نظری نہیں۔ فرینکفرٹ میں 21 مئی 2026 کو <bdi>MWL</bdi> کے ساتھ: ہائبرڈ اصول فجر 02:33 پر دیتا ہے جبکہ زاویے پر مبنی اصول 03:02 — انتیس منٹ کا فرق۔ سال کے بیشتر دنوں میں دونوں بالکل ایک جیسے رہتے ہیں؛ اختلاف بہار کے آخر اور گرمیوں کے اُن ہفتوں تک محدود ہے جہاں اس سوال کا کوئی جواب واقعی بنتا ہے۔</p>

<h2>عصر بالکل الگ سبب ہے</h2>
<p>دو ذرائع اوپر کی ہر بات پر متفق ہو سکتے ہیں اور پھر بھی صرف عصر پر مختلف ہوں، کیونکہ عصر کی دو تعریفیں ہیں: جب کسی چیز کا سایہ اس کی لمبائی کے برابر ہو، یا جب دوگنا ہو۔</p>
<p>فرق معمولی نہیں۔ قاہرہ میں 21 مارچ 2026 کو <bdi>MWL</bdi> کے ساتھ: پہلی تعریف 15:30 دیتی ہے، دوسری 16:24 — <strong>چون منٹ</strong>۔ اگر آپ کا اختلاف صرف عصر میں ہے اور تقریباً اسی مقدار کا ہے، تو غالب امکان ہے کہ سبب یہی ہو۔ یہ سائٹ طے شدہ طور پر سایہ عامل 1 استعمال کرتی ہے اور دوسری کو بھی سنبھالتی ہے۔</p>

<h2>دو ذرائع کا انصاف سے موازنہ کیسے کریں</h2>
<p>یہ فیصلہ کرنے سے پہلے کہ ایک غلط ہے، پانچوں چیزیں ملائیے:</p>
<ol>
<li><strong>وہی تاریخ</strong> — اوقات روز بدلتے ہیں۔</li>
<li><strong>وہی کوآرڈینیٹس</strong> — ایک طرف «قاہرہ» اور دوسری طرف «وسطی قاہرہ» نہیں۔</li>
<li><strong>وہی طریقہ</strong> — اس کے دونوں زاویے۔</li>
<li><strong>عصر کی وہی تعریف۔</strong></li>
<li><strong>وہی فرق</strong> — ڈے لائٹ سیونگ سمیت۔</li>
</ol>
<p>اگر پانچوں مل جائیں اور ایک دو منٹ باقی رہیں، تو وہ تقریب ہے۔ اگر ایک گھنٹہ باقی رہے، تو وہ ٹائم زون ہے۔ اگر دو گھنٹے باقی رہیں اور آپ شمال میں ہوں، تو وہ بلند عرض البلد کا اصول ہے۔</p>
<p>اور عملی اصول اب بھی قائم ہے: <strong>وہی اپنائیے جو آپ کی مسجد یا آپ کے ملک کا ادارہ استعمال کرتا ہے۔</strong></p>
`,
sources: `
<h2>مصادر</h2>
<p class="guide-sources-note">اس صفحے کی ہر پیمائش اسی سائٹ کے انجن سے، ہر جدول میں مذکور تاریخوں اور کوآرڈینیٹس کے ساتھ نکالی گئی ہے۔</p>
<ul>
<li>بلند عرض البلد کے اصولوں کی تعریفیں: <bdi>Pray Times</bdi> دستاویزات — <a href="https://praytimes.org/calculation" rel="nofollow noopener" target="_blank">praytimes.org/calculation</a></li>
<li>سرکاری <em>temkin</em> جدول: <bdi>Diyanet İşleri Başkanlığı</bdi> (ترکی) — <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>رباط کا شائع شدہ اوقات کا جدول: وزارتِ اوقاف و اسلامی امور — <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>پیرامیٹرز کا تقابلی جدول: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>

---
`,
related: [
  { href: '/ur/guides/prayer-time-calculation-methods', label: 'اوقاتِ نماز کے حساب کے طریقے اور زاویے' },
  { href: '/ur/guides/how-qibla-direction-is-calculated', label: 'سمتِ قبلہ کا حساب کیسے ہوتا ہے' },
],
},
de: {
h1: 'Warum Gebetszeiten sich zwischen Apps und Websites unterscheiden',
body: `
<p class="guide-intro">Sie öffnen eine App, und Fajr ist längst eingetreten; Sie sehen auf einer anderen Website nach, dort liegt es zwölf Minuten später. Welche irrt? Meist keine. Der Unterschied ist keine kaputte Rechnung — es sind unterschiedliche Einstellungen, die dieselbe Gleichung speisen. Diese Seite nennt fünf häufige Gründe, warum Gebetszeiten abweichen, geordnet vom größten zum kleinsten Effekt.</p>

<h2>Erster Grund: ein anderer Winkel</h2>
<p>Sonnenaufgang, Dhuhr und Maghrib haben unmittelbare geometrische Definitionen, die niemand bestreitet. Fajr und Isha hängen an der Dämmerung, und Dämmerung ist ein allmähliches Verblassen statt eines Augenblicks. Also wählte jede Institution eine <strong>Schwelle</strong>: wie tief die Sonne unter den Horizont gesunken ist.</p>
<p>Wenn eine Quelle 15° für Fajr verwendet und eine andere 19.5°, beträgt der Abstand in Kairo am 21. März 2026 <strong>einundzwanzig Minuten</strong>. Keine irrt; jede wendet ihre eigene Schwelle an.</p>
<p>Und dieser Abstand <strong>bleibt nicht gleich</strong>. In mittleren Breiten entspricht ein Grad im Winter etwa fünf Minuten und nahe der Sommersonnenwende bis zu sieben. Vergleichen Sie im Januar, vergleichen Sie erneut im Juni — der Unterschied hat sich verändert, was allein schon viele verwirrt. Die Methoden und ihre Winkel behandelt der <a href="/de/guides/prayer-time-calculation-methods">Ratgeber zu den Berechnungsmethoden</a>.</p>

<h2>Zweiter Grund: Minutenanpassungen der Institution</h2>
<p>Manche Institutionen veröffentlichen nicht das rohe Winkelergebnis. Sie veröffentlichen eine Tabelle, in der <strong>Vorsichtsminuten</strong> bereits addiert sind.</p>
<p>Der am klarsten amtlich dokumentierte Fall ist die <strong>Türkei</strong>. Diyanet İşleri Başkanlığı veröffentlicht eine ausdrückliche <em>temkin</em>-Tabelle: der Sonnenaufgang wird um sieben Minuten vorverlegt, während beim Dhuhr fünf, beim Asr vier und beim Maghrib sieben Minuten hinzugefügt werden; auf Imsak und Isha entfällt jede Anpassung.</p>
<p>Wenn also zwei Quellen exakt denselben Winkel rechnen und die eine diese Tabelle anwendet, die andere nicht, weicht der Sonnenaufgang um sieben Minuten ab, <strong>obwohl die Astronomie identisch ist</strong>. Das ist eine häufige Ursache für eine kleine, aber hartnäckig konstante Verschiebung.</p>

<h2>Dritter Grund: Koordinaten</h2>
<p>Gebetszeiten werden für einen Punkt berechnet, nicht für eine Stadt. Setzen zwei Quellen Sie an unterschiedliche Punkte, weichen die Zeiten ab.</p>
<p>Doch die Größe dieses Effekts wird weithin überschätzt. Wir haben Kairo am 27. August 2026 mit der ägyptischen Methode gemessen:</p>

${T(`<table>
<thead><tr><th>Ort</th><th>Fajr</th><th>Dhuhr</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Kairo Zentrum</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>Helwan (Süden)</td><td>03:58</td><td>11:56</td><td>18:23</td></tr>
<tr><td>Shubra El Kheima (Norden)</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>6th of October (Westen)</td><td>04:00</td><td>11:58</td><td>18:25</td></tr>
</tbody></table>`)}
<p>Über rund zweiunddreißig Kilometer beträgt die Spanne <strong>eine Minute</strong>. Koordinaten sind keine überzeugende Erklärung für einen Unterschied von zehn Minuten.</p>
<p>Der große Effekt tritt auf, wenn sich die geografische Spanne <strong>innerhalb einer Zeitzone</strong> weitet. Ganz Spanien teilt im Sommer eine Uhr, und dennoch — berechnet mit MWL für den 27. August 2026:</p>

${T(`<table>
<thead><tr><th>Stadt</th><th>Längengrad</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Barcelona</td><td>2.17° E</td><td>20:33</td></tr>
<tr><td>Madrid</td><td>3.70° W</td><td>20:55</td></tr>
<tr><td>A Coruña</td><td>8.41° W</td><td>21:18</td></tr>
</tbody></table>`)}
<p><strong>Fünfundvierzig Minuten</strong> zwischen den beiden Enden eines Landes auf einer Uhr. Verwendet eine Quelle die Koordinaten Ihrer Stadt und greift die andere ersatzweise auf die Hauptstadt oder den Landesmittelpunkt zurück, erzeugt allein das eine große Lücke.</p>

<h2>Vierter Grund: Zeitzone und Sommerzeit</h2>
<p>Der astronomische Moment ist derselbe; die Uhr, auf der er erscheint, hängt vom Versatz ab. London zeigt das sauber:</p>

${T(`<table>
<thead><tr><th>Fall</th><th>Datum</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Winter (UTC+0)</td><td>2026-01-15</td><td>16:21</td></tr>
<tr><td>Sommer (UTC+1)</td><td>2026-06-21</td><td>21:22</td></tr>
<tr><td>Sommer, aber mit dem Winterversatz</td><td>2026-06-21</td><td>20:22</td></tr>
</tbody></table>`)}
<p>Die letzten beiden Zeilen sind <strong>derselbe astronomische Moment</strong>. Die volle Stunde dazwischen stammt allein vom Versatz. Ein Unterschied von genau einer Stunde ist fast immer eine Frage der Zeitzone oder der Sommerzeit, keine der Berechnung.</p>

<h2>Fünfter Grund: Rundung</h2>
<p>Zeiten werden minutengenau angezeigt; die Rechnung liefert einen feineren Wert. Diese Website rundet auf die <strong>nächste Minute</strong>, während eine andere Quelle die Sekunden schlicht <strong>abschneiden</strong> kann. Beim selben zugrunde liegenden Wert kann das Ergebnis um eine volle Minute abweichen.</p>
<p>Kairo, 27. August 2026, ägyptische Methode:</p>

${T(`<table>
<thead><tr><th>Zeit</th><th>Berechneter Wert</th><th>Auf die nächste Minute gerundet</th><th>Abgeschnitten</th></tr></thead>
<tbody>
<tr><td>Dhuhr</td><td>11:56:37</td><td><strong>11:57</strong></td><td>11:56</td></tr>
<tr><td>Asr</td><td>15:31:32</td><td><strong>15:32</strong></td><td>15:31</td></tr>
<tr><td>Maghrib</td><td>18:23:37</td><td><strong>18:24</strong></td><td>18:23</td></tr>
</tbody></table>`)}
<p>Über dreißig Zeiten an fünf Tagen wichen die beiden Verfahren bei <strong>sechzehn</strong> davon voneinander ab — etwa der Hälfte, weil die Sekunden ungefähr in der Hälfte der Fälle dreißig überschreiten. Der Abstand beträgt eine Minute und hat nichts mit Astronomie zu tun: es ist allein die Anzeigeregel.</p>

<h2>Der Sonderfall: hohe Breitengrade</h2>
<p>Je weiter nach Norden oder Süden, desto eher erreicht man einen Tag, an dem die Sonne den erforderlichen Winkel gar nicht mehr unterschreitet. An diesem Tag gibt es kein astronomisches Fajr und kein astronomisches Isha — nicht weil die Rechnung scheitert, sondern weil das Ereignis nicht stattfand.</p>
<h3>Die drei Regeln</h3>
<p>Stattdessen wird eine Regel verwendet, die die Nacht zwischen Maghrib und Sonnenaufgang teilt. Die drei herkömmlichen lauten:</p>
<ul>
<li><strong>Mitte der Nacht</strong> — die Nacht wird halbiert.</li>
<li><strong>Ein Siebtel der Nacht</strong> — die Nacht wird in sieben Teile geteilt; Isha beginnt nach dem ersten, Fajr zu Beginn des letzten.</li>
<li><strong>Winkelbasiert</strong> — die Nacht wird im Verhältnis des Winkels zu sechzig geteilt.</li>
</ul>
<p>Das ist <strong>kein kleines technisches Detail</strong>. Stockholm (59.33° N), berechnet mit MWL:</p>

${T(`<table>
<thead><tr><th>Datum</th><th>Winkelbasiert</th><th>Ein Siebtel</th><th>Mitte der Nacht</th><th>Größter Abstand</th></tr></thead>
<tbody>
<tr><td>2026-05-20</td><td>02:05</td><td>03:07</td><td>00:45</td><td><strong>142 Minuten</strong></td></tr>
<tr><td>2026-06-21</td><td>01:54</td><td>02:45</td><td>00:50</td><td>115 Minuten</td></tr>
<tr><td>2026-07-15</td><td>02:07</td><td>03:05</td><td>00:54</td><td>131 Minuten</td></tr>
<tr><td>2026-12-21</td><td>07:02</td><td>07:10</td><td>07:02</td><td>8 Minuten</td></tr>
</tbody></table>`)}
<p>Im Mai übersteigt die Spanne <strong>zwei Stunden</strong>; bis Dezember verschwindet sie fast. Wenn Sie im Norden sind und einen riesigen Unterschied zwischen zwei Apps sehen, liegt es wahrscheinlich an einer anderen Regel, nicht an einem anderen Winkel.</p>
<p>Die Dokumentation von PrayTimes führt die winkelbasierte Methode als empfohlene Option. TimesPrayers verwendet AngleBased davon unabhängig als seine derzeitige Standardregel für hohe Breitengrade.</p>
<h3>Eine eigene Regel von TimesPrayers für Standorte in Deutschland</h3>
<p>Für Standorte in Deutschland wendet TimesPrayers <strong>eine eigene Regel namens DEHybrid</strong> an — keine amtliche deutsche Vorgabe, sondern eine Regel dieser Website. Sie fragt zuerst: <strong>Erreicht die Sonne den Winkel heute tatsächlich, mit ausreichendem Abstand?</strong> Wenn ja, wird die echte astronomische Rechnung verwendet; wenn nein, die Schätzung.</p>
<p>Der Unterschied ist real, nicht theoretisch. Frankfurt am 21. Mai 2026 mit MWL: die Hybridregel ergibt Fajr um 02:33, die winkelbasierte Regel 03:02 — neunundzwanzig Minuten auseinander. An den meisten Tagen des Jahres stimmen beide exakt überein; die Abweichung beschränkt sich auf die Wochen im späten Frühjahr und im Sommer, in denen die Wahl zwischen echter Rechnung und Schätzung überhaupt eine Rolle spielt.</p>

<h2>Asr ist eine völlig eigene Ursache</h2>
<p>Zwei Quellen können in allem Obigen übereinstimmen und dennoch allein bei Asr abweichen, denn Asr hat zwei Definitionen: wenn der Schatten eines Gegenstands seiner Länge entspricht, oder wenn er sie verdoppelt.</p>
<p>Der Unterschied ist nicht marginal. Kairo am 21. März 2026 mit MWL: die erste Definition ergibt 15:30, die zweite 16:24 — <strong>vierundfünfzig Minuten</strong>. Liegt Ihre Abweichung allein bei Asr und ungefähr in dieser Größe, ist das sehr wahrscheinlich die Ursache. Diese Website verwendet standardmäßig Schattenfaktor 1 und unterstützt den anderen.</p>

<h2>Wie man zwei Quellen fair vergleicht</h2>
<p>Bevor Sie eine für falsch erklären, gleichen Sie alle fünf ab:</p>
<ol>
<li><strong>Dasselbe Datum</strong> — die Zeiten wandern täglich.</li>
<li><strong>Dieselben Koordinaten</strong> — nicht «Kairo» auf der einen und «Kairo Zentrum» auf der anderen Seite.</li>
<li><strong>Dieselbe Methode</strong> — mit beiden Winkeln.</li>
<li><strong>Dieselbe Asr-Definition.</strong></li>
<li><strong>Derselbe Versatz</strong> — Sommerzeit eingeschlossen.</li>
</ol>
<p>Stimmen alle fünf und bleiben ein bis zwei Minuten, ist es die Rundung. Bleibt eine Stunde, ist es die Zeitzone. Bleiben zwei Stunden und Sie sind im Norden, ist es die Regel für hohe Breitengrade.</p>
<p>Und die praktische Regel gilt weiterhin: <strong>Folgen Sie dem, was Ihre Moschee oder die Institution Ihres Landes verwendet.</strong></p>
`,
sources: `
<h2>Quellen</h2>
<p class="guide-sources-note">Jede Messung auf dieser Seite wurde mit der Engine dieser Website berechnet, mit den in jeder Tabelle genannten Daten und Koordinaten.</p>
<ul>
<li>Definitionen der Regeln für hohe Breitengrade: Pray-Times-Dokumentation — <a href="https://praytimes.org/calculation" rel="nofollow noopener" target="_blank">praytimes.org/calculation</a></li>
<li>Amtliche <em>temkin</em>-Tabelle: Diyanet İşleri Başkanlığı (Türkei) — <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Veröffentlichter Rabat-Kalender: Ministerium für Habous und islamische Angelegenheiten — <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Vergleichende Parametertabelle: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>

---
`,
related: [
  { href: '/de/guides/prayer-time-calculation-methods', label: 'Berechnungsmethoden für Gebetszeiten und ihre Winkel' },
  { href: '/de/guides/how-qibla-direction-is-calculated', label: 'Wie die Qibla-Richtung berechnet wird' },
],
},
es: {
h1: 'Por qué difieren los horarios de oración entre aplicaciones y sitios web',
body: `
<p class="guide-intro">Abra una aplicación y el Fayr ya ha entrado; consulte otro sitio y aparecerá doce minutos más tarde. ¿Cuál se equivoca? Normalmente ninguno. La diferencia no es un cálculo roto: son configuraciones distintas alimentando la misma ecuación. Esta página enumera cinco causas frecuentes de que los horarios de oración difieran, ordenadas del efecto mayor al menor.</p>

<h2>Primera causa: un ángulo distinto</h2>
<p>El amanecer, el Dhuhr y el Magrib tienen definiciones geométricas directas que nadie discute. El Fayr y el Isha dependen del crepúsculo, y el crepúsculo es una transición gradual más que un instante. Por eso cada autoridad eligió un <strong>umbral</strong>: cuánto ha descendido el sol por debajo del horizonte.</p>
<p>Cuando una fuente usa un Fayr de 15° y otra de 19.5°, la separación entre ambas en El Cairo el 21 de marzo de 2026 es de <strong>veintiún minutos</strong>. Ninguna se equivoca: cada una aplica su propio umbral.</p>
<p>Y esa separación <strong>no se mantiene fija</strong>. En latitudes medias un grado vale unos cinco minutos en invierno y puede llegar a siete cerca del solsticio de verano. Compare en enero, compare de nuevo en junio y la diferencia habrá cambiado, lo que por sí solo desconcierta a mucha gente. Los métodos y sus ángulos se tratan en la <a href="/es/guides/prayer-time-calculation-methods">guía de métodos de cálculo</a>.</p>

<h2>Segunda causa: los ajustes en minutos de la autoridad</h2>
<p>Algunas autoridades no publican el resultado en bruto del ángulo. Publican una tabla que ya incorpora <strong>minutos de precaución</strong>.</p>
<p>El caso documentado oficialmente con mayor claridad es <strong>Turquía</strong>. Diyanet İşleri Başkanlığı publica una tabla de <em>temkin</em> explícita: el amanecer se adelanta siete minutos, mientras que se añaden cinco minutos al Dhuhr, cuatro al Asr y siete al Magrib; sobre el imsak y el Isha no se aplica ningún ajuste.</p>
<p>Así, si dos fuentes calculan exactamente el mismo ángulo y una aplica esa tabla y la otra no, el amanecer diferirá en siete minutos <strong>aunque la astronomía sea idéntica</strong>. Es un origen frecuente de un desfase pequeño pero constante.</p>

<h2>Tercera causa: las coordenadas</h2>
<p>Los horarios de oración se calculan para un punto, no para una ciudad. Si dos fuentes lo sitúan en puntos distintos, los horarios difieren.</p>
<p>Pero la magnitud de este efecto se sobreestima mucho. Medimos El Cairo el 27 de agosto de 2026 con el método egipcio:</p>

${T(`<table>
<thead><tr><th>Ubicación</th><th>Fayr</th><th>Dhuhr</th><th>Magrib</th></tr></thead>
<tbody>
<tr><td>Centro de El Cairo</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>Helwan (sur)</td><td>03:58</td><td>11:56</td><td>18:23</td></tr>
<tr><td>Shubra El Kheima (norte)</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>6th of October (oeste)</td><td>04:00</td><td>11:58</td><td>18:25</td></tr>
</tbody></table>`)}
<p>A lo largo de unos treinta y dos kilómetros, la horquilla es de <strong>un minuto</strong>. Las coordenadas no son una explicación convincente para una diferencia de diez minutos.</p>
<p>El efecto grande aparece cuando la extensión geográfica se ensancha <strong>dentro de una misma zona horaria</strong>. Toda España comparte un mismo reloj en verano y, sin embargo, calculado con la MWL para el 27 de agosto de 2026:</p>

${T(`<table>
<thead><tr><th>Ciudad</th><th>Longitud</th><th>Magrib</th></tr></thead>
<tbody>
<tr><td>Barcelona</td><td>2.17° E</td><td>20:33</td></tr>
<tr><td>Madrid</td><td>3.70° W</td><td>20:55</td></tr>
<tr><td>A Coruña</td><td>8.41° W</td><td>21:18</td></tr>
</tbody></table>`)}
<p><strong>Cuarenta y cinco minutos</strong> entre los dos extremos de un mismo país con el mismo reloj. Si una fuente usa las coordenadas de su ciudad y otra recurre a la capital o al centro geográfico del país, eso solo ya produce una diferencia amplia.</p>

<h2>Cuarta causa: zona horaria y horario de verano</h2>
<p>El instante astronómico es el mismo; el reloj en el que se muestra depende del desfase horario. Londres lo enseña con nitidez:</p>

${T(`<table>
<thead><tr><th>Caso</th><th>Fecha</th><th>Magrib</th></tr></thead>
<tbody>
<tr><td>Invierno (UTC+0)</td><td>2026-01-15</td><td>16:21</td></tr>
<tr><td>Verano (UTC+1)</td><td>2026-06-21</td><td>21:22</td></tr>
<tr><td>Verano, pero con el desfase de invierno</td><td>2026-06-21</td><td>20:22</td></tr>
</tbody></table>`)}
<p>Las dos últimas filas son <strong>el mismo instante astronómico</strong>. La hora completa que las separa procede únicamente del desfase. Una diferencia de exactamente una hora casi siempre es cuestión de zona horaria o de horario de verano, no de cálculo.</p>

<h2>Quinta causa: el redondeo</h2>
<p>Los horarios se muestran al minuto; el cálculo produce un valor más fino. Este sitio redondea al <strong>minuto más próximo</strong>, mientras que otra fuente puede limitarse a <strong>truncar</strong> los segundos. Con el mismo valor de partida, el resultado puede diferir en un minuto entero.</p>
<p>El Cairo, 27 de agosto de 2026, método egipcio:</p>

${T(`<table>
<thead><tr><th>Horario</th><th>Valor calculado</th><th>Redondeado al minuto más próximo</th><th>Truncado</th></tr></thead>
<tbody>
<tr><td>Dhuhr</td><td>11:56:37</td><td><strong>11:57</strong></td><td>11:56</td></tr>
<tr><td>Asr</td><td>15:31:32</td><td><strong>15:32</strong></td><td>15:31</td></tr>
<tr><td>Magrib</td><td>18:23:37</td><td><strong>18:24</strong></td><td>18:23</td></tr>
</tbody></table>`)}
<p>A lo largo de treinta horarios en cinco días, las dos políticas discreparon en <strong>dieciséis</strong> de ellos: aproximadamente la mitad, porque los segundos superan los treinta más o menos la mitad de las veces. La diferencia es de un minuto y no tiene nada que ver con la astronomía: es solo la política de presentación.</p>

<h2>El caso especial: las latitudes altas</h2>
<p>Cuanto más al norte o al sur, antes se llega a un día en que el sol no desciende hasta el ángulo requerido. Ese día no hay Fayr ni Isha astronómicos, no porque el cálculo falle, sino porque el fenómeno no se produjo.</p>
<h3>Las tres reglas</h3>
<p>En su lugar se usa una regla que reparte la noche entre el Magrib y el amanecer. Las tres convencionales son:</p>
<ul>
<li><strong>Mitad de la noche</strong>: la noche se divide en dos.</li>
<li><strong>Un séptimo de la noche</strong>: la noche se divide en siete partes; el Isha entra tras la primera y el Fayr al comienzo de la última.</li>
<li><strong>Basada en el ángulo</strong>: la noche se divide en proporción al ángulo sobre sesenta.</li>
</ul>
<p>No es <strong>un pequeño detalle técnico</strong>. Estocolmo (59.33° N), calculado con la MWL:</p>

${T(`<table>
<thead><tr><th>Fecha</th><th>Basada en el ángulo</th><th>Un séptimo</th><th>Mitad de la noche</th><th>Diferencia máxima</th></tr></thead>
<tbody>
<tr><td>2026-05-20</td><td>02:05</td><td>03:07</td><td>00:45</td><td><strong>142 minutos</strong></td></tr>
<tr><td>2026-06-21</td><td>01:54</td><td>02:45</td><td>00:50</td><td>115 minutos</td></tr>
<tr><td>2026-07-15</td><td>02:07</td><td>03:05</td><td>00:54</td><td>131 minutos</td></tr>
<tr><td>2026-12-21</td><td>07:02</td><td>07:10</td><td>07:02</td><td>8 minutos</td></tr>
</tbody></table>`)}
<p>En mayo la horquilla supera las <strong>dos horas</strong>; en diciembre casi desaparece. Si está en el norte y ve una diferencia enorme entre dos aplicaciones, la causa es probablemente una regla distinta, no un ángulo distinto.</p>
<p>La documentación de PrayTimes señala el método basado en el ángulo como una opción recomendada. TimesPrayers usa AngleBased de forma independiente como su regla por defecto actual para latitudes altas.</p>
<h3>Una regla propia de TimesPrayers para Alemania</h3>
<p>Para ubicaciones en Alemania, TimesPrayers aplica <strong>una regla propia llamada DEHybrid</strong>: <strong>no es una norma oficial alemana</strong>, sino una regla de este sitio. Empieza preguntando: <strong>¿alcanza hoy el sol ese ángulo de verdad, con margen suficiente?</strong> Si lo alcanza, se usa el cálculo astronómico real; si no, la estimación.</p>
<p>La diferencia es real, no teórica. Fráncfort, 21 de mayo de 2026, con la MWL: la regla híbrida da el Fayr a las 02:33 y la regla basada en el ángulo, a las 03:02: veintinueve minutos de separación. La mayoría de los días del año ambas coinciden exactamente; la divergencia se limita a las semanas de finales de primavera y de verano en que la elección entre cálculo real y estimación realmente importa.</p>

<h2>El Asr es una causa completamente aparte</h2>
<p>Dos fuentes pueden coincidir en todo lo anterior y aun así diferir solo en el Asr, porque el Asr tiene dos definiciones: cuando la sombra de un objeto iguala su longitud o cuando la duplica.</p>
<p>La diferencia no es marginal. El Cairo, 21 de marzo de 2026, con la MWL: la primera definición da las 15:30 y la segunda las 16:24: <strong>cincuenta y cuatro minutos</strong>. Si su discrepancia está solo en el Asr y es de ese orden, muy probablemente esa sea la causa. Este sitio usa por defecto el factor de sombra 1 y admite el otro.</p>

<h2>Cómo comparar dos fuentes con equidad</h2>
<p>Antes de decidir que una se equivoca, haga coincidir las cinco:</p>
<ol>
<li><strong>La misma fecha</strong>: los horarios se desplazan cada día.</li>
<li><strong>Las mismas coordenadas</strong>: no «El Cairo» en una y «centro de El Cairo» en la otra.</li>
<li><strong>El mismo método</strong>, con sus dos ángulos.</li>
<li><strong>La misma definición del Asr.</strong></li>
<li><strong>El mismo desfase horario</strong>, horario de verano incluido.</li>
</ol>
<p>Si las cinco coinciden y queda un minuto o dos, es el redondeo. Si queda una hora, es la zona horaria. Si quedan dos horas y usted está en el norte, es la regla de latitudes altas.</p>
<p>Y la regla práctica sigue vigente: <strong>siga lo que use su mezquita o la autoridad de su país.</strong></p>
`,
sources: `
<h2>Fuentes</h2>
<p class="guide-sources-note">Cada medición de esta página se calculó con el motor de este sitio, usando las fechas y coordenadas indicadas en cada tabla.</p>
<ul>
<li>Definiciones de las reglas para latitudes altas: documentación de Pray Times — <a href="https://praytimes.org/calculation" rel="nofollow noopener" target="_blank">praytimes.org/calculation</a></li>
<li>Tabla oficial de <em>temkin</em>: Diyanet İşleri Başkanlığı (Turquía) — <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Horario de Rabat publicado: Ministerio de Habices y Asuntos Islámicos — <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Tabla comparativa de parámetros: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>

---
`,
related: [
  { href: '/es/guides/prayer-time-calculation-methods', label: 'Métodos de cálculo de los horarios de oración y sus ángulos' },
  { href: '/es/guides/how-qibla-direction-is-calculated', label: 'Cómo se calcula la dirección de la Qibla' },
],
},
id: {
h1: 'Mengapa Jadwal Sholat Berbeda antara Aplikasi dan Situs Web?',
body: `
<p class="guide-intro">Anda buka satu aplikasi dan azan Subuh sudah berkumandang; Anda cek situs lain, waktunya dua belas menit kemudian. Mana yang keliru? Umumnya tidak ada. Selisih itu bukan perhitungan yang rusak — melainkan setelan berbeda yang dimasukkan ke persamaan yang sama. Halaman ini merinci lima penyebab umum jadwal sholat berbeda, diurutkan dari pengaruh terbesar ke terkecil.</p>

<h2>Penyebab pertama: sudut yang berbeda</h2>
<p>Matahari terbit, Zuhur, dan Magrib punya definisi geometris langsung yang tidak diperdebatkan siapa pun. Subuh dan Isya terikat pada senja, dan senja adalah pemudaran bertahap, bukan satu titik waktu. Maka setiap otoritas memilih sebuah <strong>ambang</strong>: seberapa dalam matahari sudah turun di bawah ufuk.</p>
<p>Ketika satu sumber memakai Subuh 15° dan yang lain 19.5°, jarak keduanya di Kairo pada 21 Maret 2026 adalah <strong>dua puluh satu menit</strong>. Tidak ada yang keliru; masing-masing menerapkan ambangnya sendiri.</p>
<p>Dan selisih itu <strong>tidak tetap</strong>. Di lintang menengah, satu derajat bernilai sekitar lima menit pada musim dingin dan bisa mencapai tujuh menjelang titik balik musim panas. Bandingkan pada Januari, lalu bandingkan lagi pada Juni, dan selisihnya sudah berubah — hal ini saja sudah membingungkan banyak orang. Metode beserta sudutnya dibahas dalam <a href="/id/guides/prayer-time-calculation-methods">panduan metode perhitungan</a>.</p>

<h2>Penyebab kedua: penyesuaian menit dari otoritas</h2>
<p>Sebagian otoritas tidak menerbitkan hasil sudut yang mentah. Mereka menerbitkan tabel yang <strong>menit kehati-hatian</strong>nya sudah ditambahkan.</p>
<p>Kasus terdokumentasi resmi yang paling jelas adalah <strong>Turki</strong>. Diyanet İşleri Başkanlığı menerbitkan tabel <em>temkin</em> yang eksplisit: waktu matahari terbit digeser tujuh menit lebih awal, sedangkan lima menit ditambahkan pada Zuhur, empat pada Asar, dan tujuh pada Magrib; tidak ada penyesuaian pada imsak maupun Isya.</p>
<p>Jadi kalau dua sumber menghitung sudut yang persis sama, lalu yang satu menerapkan tabel itu dan yang lain tidak, waktu matahari terbit akan berbeda tujuh menit <strong>padahal astronominya identik</strong>. Ini penyebab umum dari selisih kecil tetapi konsisten.</p>

<h2>Penyebab ketiga: koordinat</h2>
<p>Jadwal sholat dihitung untuk sebuah titik, bukan untuk sebuah kota. Kalau dua sumber menempatkan Anda di titik yang berbeda, waktunya pun berbeda.</p>
<p>Namun besarnya pengaruh ini kerap dilebih-lebihkan. Kami mengukur Kairo pada 27 Agustus 2026 dengan metode Mesir:</p>

${T(`<table>
<thead><tr><th>Lokasi</th><th>Subuh</th><th>Zuhur</th><th>Magrib</th></tr></thead>
<tbody>
<tr><td>Kairo pusat</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>Helwan (selatan)</td><td>03:58</td><td>11:56</td><td>18:23</td></tr>
<tr><td>Shubra El Kheima (utara)</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>6th of October (barat)</td><td>04:00</td><td>11:58</td><td>18:25</td></tr>
</tbody></table>`)}
<p>Sepanjang sekitar tiga puluh dua kilometer, rentangnya cuma <strong>satu menit</strong>. Koordinat bukan penjelasan yang meyakinkan untuk selisih sepuluh menit.</p>
<p>Pengaruh besar baru muncul ketika rentang geografis melebar <strong>di dalam satu zona waktu</strong>. Seluruh Spanyol berbagi satu jam pada musim panas, namun — dihitung dengan MWL untuk 27 Agustus 2026:</p>

${T(`<table>
<thead><tr><th>Kota</th><th>Bujur</th><th>Magrib</th></tr></thead>
<tbody>
<tr><td>Barcelona</td><td>2.17° E</td><td>20:33</td></tr>
<tr><td>Madrid</td><td>3.70° W</td><td>20:55</td></tr>
<tr><td>A Coruña</td><td>8.41° W</td><td>21:18</td></tr>
</tbody></table>`)}
<p><strong>Empat puluh lima menit</strong> antara dua ujung satu negara pada jam yang sama. Kalau satu sumber memakai koordinat kota Anda dan yang lain menggunakan ibu kota atau titik tengah negara sebagai pengganti, itu saja sudah menghasilkan jarak yang lebar.</p>

<h2>Penyebab keempat: zona waktu dan DST</h2>
<p>Saat astronomisnya sama; jam yang menampilkannya bergantung pada ofset. London memperlihatkannya dengan bersih:</p>

${T(`<table>
<thead><tr><th>Kasus</th><th>Tanggal</th><th>Magrib</th></tr></thead>
<tbody>
<tr><td>Musim dingin (UTC+0)</td><td>2026-01-15</td><td>16:21</td></tr>
<tr><td>Musim panas (UTC+1)</td><td>2026-06-21</td><td>21:22</td></tr>
<tr><td>Musim panas tetapi dengan ofset musim dingin</td><td>2026-06-21</td><td>20:22</td></tr>
</tbody></table>`)}
<p>Dua baris terakhir adalah <strong>saat astronomis yang sama</strong>. Satu jam penuh di antaranya murni berasal dari ofset. Selisih tepat satu jam hampir selalu soal zona waktu atau DST, bukan soal perhitungan.</p>

<h2>Penyebab kelima: pembulatan</h2>
<p>Waktu ditampilkan sampai menit; perhitungannya sendiri menghasilkan nilai yang lebih halus. Situs ini membulatkan ke <strong>menit terdekat</strong>, sementara sumber lain mungkin sekadar <strong>memotong</strong> detiknya. Hasilnya bisa berbeda satu menit penuh pada nilai dasar yang sama.</p>
<p>Kairo, 27 Agustus 2026, metode Mesir:</p>

${T(`<table>
<thead><tr><th>Waktu</th><th>Nilai terhitung</th><th>Dibulatkan ke menit terdekat</th><th>Dipotong</th></tr></thead>
<tbody>
<tr><td>Zuhur</td><td>11:56:37</td><td><strong>11:57</strong></td><td>11:56</td></tr>
<tr><td>Asar</td><td>15:31:32</td><td><strong>15:32</strong></td><td>15:31</td></tr>
<tr><td>Magrib</td><td>18:23:37</td><td><strong>18:24</strong></td><td>18:23</td></tr>
</tbody></table>`)}
<p>Dari tiga puluh waktu selama lima hari, kedua kebijakan itu berselisih pada <strong>enam belas</strong> di antaranya — kira-kira separuh, karena detiknya melewati tiga puluh kurang lebih separuh waktu. Selisihnya satu menit dan tidak ada kaitannya dengan astronomi: itu murni soal kebijakan tampilan.</p>

<h2>Kasus khusus: lintang tinggi</h2>
<p>Makin jauh ke utara atau ke selatan, makin cepat tiba hari ketika matahari sama sekali tidak turun sampai sudut yang diperlukan. Pada hari itu tidak ada Subuh atau Isya secara astronomis — bukan karena perhitungannya gagal, melainkan karena peristiwanya memang tidak terjadi.</p>
<h3>Tiga aturan</h3>
<p>Sebagai gantinya dipakai aturan yang membagi malam antara Magrib dan matahari terbit. Tiga aturan konvensionalnya:</p>
<ul>
<li><strong>Tengah malam</strong> — malam dibagi dua sama besar.</li>
<li><strong>Sepertujuh malam</strong> — malam dibagi tujuh bagian; Isya mulai setelah bagian pertama, Subuh pada awal bagian terakhir.</li>
<li><strong>Berbasis sudut</strong> — malam dibagi menurut perbandingan sudut terhadap enam puluh.</li>
</ul>
<p>Ini <strong>bukan detail teknis yang kecil</strong>. Stockholm (59.33° N) dihitung dengan MWL:</p>

${T(`<table>
<thead><tr><th>Tanggal</th><th>Berbasis sudut</th><th>Sepertujuh</th><th>Tengah malam</th><th>Selisih terlebar</th></tr></thead>
<tbody>
<tr><td>2026-05-20</td><td>02:05</td><td>03:07</td><td>00:45</td><td><strong>142 menit</strong></td></tr>
<tr><td>2026-06-21</td><td>01:54</td><td>02:45</td><td>00:50</td><td>115 menit</td></tr>
<tr><td>2026-07-15</td><td>02:07</td><td>03:05</td><td>00:54</td><td>131 menit</td></tr>
<tr><td>2026-12-21</td><td>07:02</td><td>07:10</td><td>07:02</td><td>8 menit</td></tr>
</tbody></table>`)}
<p>Pada Mei rentangnya melampaui <strong>dua jam</strong>; menjelang Desember ia nyaris lenyap. Kalau Anda berada di utara dan melihat selisih yang sangat besar antara dua aplikasi, penyebabnya kemungkinan aturan yang berbeda, bukan sudut yang berbeda.</p>
<p>Dokumentasi PrayTimes menandai metode berbasis sudut sebagai opsi yang direkomendasikan. TimesPrayers secara mandiri memakai AngleBased sebagai aturan lintang tinggi bawaannya saat ini.</p>
<h3>Aturan khusus TimesPrayers untuk Jerman</h3>
<p>Untuk lokasi di Jerman, TimesPrayers menerapkan aturan DEHybrid miliknya sendiri, yang mula-mula bertanya: <strong>apakah matahari hari ini benar-benar mencapai sudut itu, dengan margin yang memadai?</strong> Kalau ya, perhitungan astronomis sebenarnya yang dipakai; kalau tidak, perkiraannya.</p>
<p>Selisihnya nyata, bukan teoretis. Frankfurt pada 21 Mei 2026 dengan MWL: aturan hibrida memberi Subuh pukul 02:33 sedangkan aturan berbasis sudut memberi 03:02 — selisih dua puluh sembilan menit. Pada sebagian besar hari dalam setahun keduanya sama persis; perbedaannya terbatas pada minggu-minggu akhir musim semi dan musim panas, yaitu ketika perhitungan sebenarnya dan perkiraan memang benar-benar berbeda.</p>

<h2>Asar adalah penyebab yang sepenuhnya terpisah</h2>
<p>Dua sumber bisa sepakat pada semua hal di atas dan tetap berbeda hanya pada Asar, sebab Asar punya dua definisi: ketika bayangan benda sama panjang dengan bendanya, atau dua kali panjangnya.</p>
<p>Selisihnya tidak sepele. Kairo pada 21 Maret 2026 dengan MWL: definisi pertama memberi 15:30, yang kedua 16:24 — <strong>lima puluh empat menit</strong>. Kalau perbedaan Anda hanya pada Asar dan besarnya kira-kira segitu, kemungkinan besar itulah penyebabnya. Situs ini memakai faktor bayangan 1 secara bawaan dan mendukung yang satunya.</p>

<h2>Cara membandingkan dua sumber secara adil</h2>
<p>Sebelum memutuskan salah satunya keliru, samakan kelimanya:</p>
<ol>
<li><strong>Tanggal yang sama</strong> — waktunya bergeser tiap hari.</li>
<li><strong>Koordinat yang sama</strong> — bukan «Kairo» di satu sisi dan «Kairo pusat» di sisi lain.</li>
<li><strong>Metode yang sama</strong> — kedua sudutnya sekaligus.</li>
<li><strong>Definisi Asar yang sama.</strong></li>
<li><strong>Ofset yang sama</strong> — termasuk DST.</li>
</ol>
<p>Kalau kelimanya cocok dan masih tersisa satu dua menit, itu pembulatan. Kalau tersisa satu jam, itu zona waktu. Kalau tersisa dua jam dan Anda berada di utara, itu aturan lintang tinggi.</p>
<p>Dan aturan praktisnya tetap berlaku: <strong>ikuti apa yang dipakai masjid Anda atau otoritas negara Anda.</strong></p>
`,
sources: `
<h2>Sumber</h2>
<p class="guide-sources-note">Setiap pengukuran di halaman ini dihitung oleh mesin situs ini, memakai tanggal dan koordinat yang disebut pada masing-masing tabel.</p>
<ul>
<li>Definisi aturan lintang tinggi: dokumentasi Pray Times — <a href="https://praytimes.org/calculation" rel="nofollow noopener" target="_blank">praytimes.org/calculation</a></li>
<li>Tabel <em>temkin</em> resmi: Diyanet İşleri Başkanlığı (Turki) — <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Jadwal Rabat yang diterbitkan: Kementerian Habous dan Urusan Islam — <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Tabel perbandingan parameter: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>

---
`,
related: [
  { href: '/id/guides/prayer-time-calculation-methods', label: 'Metode Perhitungan Jadwal Sholat dan Sudutnya' },
  { href: '/id/guides/how-qibla-direction-is-calculated', label: 'Bagaimana Arah Kiblat Dihitung' },
],
},
bn: {
h1: 'অ্যাপ ও ওয়েবসাইটে নামাজের সময় ভিন্ন হয় কেন?',
body: `
<p class="guide-intro">একটি অ্যাপ খুললেন, ফজরের আজান হয়ে গেছে; আরেকটি সাইট দেখলেন, সেখানে তা বারো মিনিট পরে। কোনটি ভুল? সাধারণত কোনোটিই নয়। পার্থক্যটি ভাঙা গণনার নয় — একই সমীকরণে ভিন্ন সেটিংস ঢোকানো হচ্ছে, ব্যাপারটা এটুকুই। এই পৃষ্ঠাটি নামাজের সময় ভিন্ন হওয়ার পাঁচটি সাধারণ কারণ তুলে ধরে, সবচেয়ে বড় প্রভাব থেকে ছোট পর্যন্ত সাজিয়ে।</p>

<h2>প্রথম কারণ: ভিন্ন কোণ</h2>
<p>সূর্যোদয়, জোহর ও মাগরিবের সরাসরি জ্যামিতিক সংজ্ঞা আছে যা নিয়ে কারও দ্বিমত নেই। ফজর ও এশা শফকনির্ভর, আর শফক কোনো মুহূর্ত নয় বরং ক্রমশ মিলিয়ে যাওয়া আলো। তাই প্রতিটি কর্তৃপক্ষ একটি <strong>সীমা</strong> বেছে নিয়েছে: সূর্য দিগন্তের কতটা নিচে নেমেছে।</p>
<p>একটি উৎস যখন 15° ফজর ব্যবহার করে আর আরেকটি 19.5°, তখন কায়রোতে 21 মার্চ 2026 তারিখে তাদের ব্যবধান দাঁড়ায় <strong>একুশ মিনিট</strong>। কোনোটিই ভুল নয়; প্রত্যেকে নিজের সীমা প্রয়োগ করছে।</p>
<p>আর এই ব্যবধান <strong>স্থির থাকে না</strong>। মধ্য-অক্ষাংশে এক ডিগ্রি শীতে প্রায় পাঁচ মিনিট, গ্রীষ্মের অয়নান্তের কাছে সাত পর্যন্ত। জানুয়ারিতে মেলান, আবার জুনে মেলান — পার্থক্য বদলে গেছে; এই একটি ব্যাপারই বহু মানুষকে বিভ্রান্ত করে। পদ্ধতি ও তাদের কোণ নিয়ে আলোচনা আছে <a href="/bn/guides/prayer-time-calculation-methods">গণনার পদ্ধতির গাইডে</a>।</p>

<h2>দ্বিতীয় কারণ: কর্তৃপক্ষের মিনিট-সমন্বয়</h2>
<p>কিছু কর্তৃপক্ষ কোণের কাঁচা ফল প্রকাশ করে না। তারা এমন তালিকা প্রকাশ করে যাতে <strong>সতর্কতামূলক মিনিট</strong> আগেই যোগ করা থাকে।</p>
<p>সবচেয়ে স্পষ্ট সরকারিভাবে নথিভুক্ত উদাহরণ <strong>তুরস্ক</strong>। Diyanet İşleri Başkanlığı (তুরস্কের ধর্মবিষয়ক সরকারি সংস্থা) একটি সুস্পষ্ট <em>temkin</em> তালিকা প্রকাশ করে: সূর্যোদয় সাত মিনিট এগিয়ে আনা হয়, আর জোহরে পাঁচ, আসরে চার ও মাগরিবে সাত মিনিট যোগ করা হয়; ইমসাক ও এশায় কোনো সমন্বয় নেই।</p>
<p>ফলে দুটি উৎস যদি ঠিক একই কোণ গণনা করে এবং একটি সেই তালিকা প্রয়োগ করে আর অন্যটি না করে, তবে সূর্যোদয়ে সাত মিনিটের পার্থক্য দাঁড়াবে <strong>যদিও জ্যোতির্বিজ্ঞান দুটিতেই অভিন্ন</strong>। ছোট হলেও ধারাবাহিকভাবে স্থির একটি ফারাকের এটি একটি সাধারণ উৎস।</p>

<h2>তৃতীয় কারণ: স্থানাঙ্ক</h2>
<p>নামাজের সময় গণনা হয় একটি বিন্দুর জন্য, গোটা শহরের জন্য নয়। দুটি উৎস যদি আপনাকে ভিন্ন বিন্দুতে বসায়, সময়ও ভিন্ন হবে।</p>
<p>তবে এই প্রভাবের মাত্রা ব্যাপকভাবে বাড়িয়ে ধরা হয়। আমরা মিশরীয় পদ্ধতিতে 27 আগস্ট 2026 তারিখে কায়রো পরিমাপ করেছি:</p>

${T(`<table>
<thead><tr><th>অবস্থান</th><th>ফজর</th><th>জোহর</th><th>মাগরিব</th></tr></thead>
<tbody>
<tr><td>কেন্দ্রীয় কায়রো</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>হেলওয়ান (দক্ষিণ)</td><td>03:58</td><td>11:56</td><td>18:23</td></tr>
<tr><td>শুবরা এল-খেইমা (উত্তর)</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>6 অক্টোবর (পশ্চিম)</td><td>04:00</td><td>11:58</td><td>18:25</td></tr>
</tbody></table>`)}
<p>প্রায় বত্রিশ কিলোমিটার জুড়ে বিস্তার মাত্র <strong>এক মিনিট</strong>। দশ মিনিটের পার্থক্যের ব্যাখ্যা হিসেবে স্থানাঙ্ক মোটেই বিশ্বাসযোগ্য নয়।</p>
<p>বড় প্রভাবটি দেখা যায় যখন ভৌগোলিক বিস্তার <strong>একই সময় অঞ্চলের ভেতরে</strong> চওড়া হয়। গোটা স্পেন গ্রীষ্মে একই ঘড়ি মানে, তবু — MWL দিয়ে 27 আগস্ট 2026 তারিখে গণনা করলে:</p>

${T(`<table>
<thead><tr><th>শহর</th><th>দ্রাঘিমাংশ</th><th>মাগরিব</th></tr></thead>
<tbody>
<tr><td>বার্সেলোনা</td><td>2.17° E</td><td>20:33</td></tr>
<tr><td>মাদ্রিদ</td><td>3.70° W</td><td>20:55</td></tr>
<tr><td>আ কোরুনিয়া</td><td>8.41° W</td><td>21:18</td></tr>
</tbody></table>`)}
<p>একই দেশের দুই প্রান্তে, একই ঘড়িতে, <strong>পঁয়তাল্লিশ মিনিট</strong>। একটি উৎস যদি আপনার শহরের স্থানাঙ্ক নেয় আর অন্যটি রাজধানী বা দেশের কেন্দ্রবিন্দুতে ফিরে যায়, কেবল সেটুকুই বড় ব্যবধান তৈরি করে।</p>

<h2>চতুর্থ কারণ: সময় অঞ্চল ও ডেলাইট সেভিং</h2>
<p>জ্যোতির্বৈজ্ঞানিক মুহূর্ত একই থাকে; কোন ঘড়িতে তা দেখানো হবে সেটি নির্ভর করে অফসেটের উপর। লন্ডন বিষয়টি পরিষ্কার করে দেয়:</p>

${T(`<table>
<thead><tr><th>ক্ষেত্র</th><th>তারিখ</th><th>মাগরিব</th></tr></thead>
<tbody>
<tr><td>শীত (UTC+0)</td><td>2026-01-15</td><td>16:21</td></tr>
<tr><td>গ্রীষ্ম (UTC+1)</td><td>2026-06-21</td><td>21:22</td></tr>
<tr><td>গ্রীষ্ম, তবে শীতের অফসেটে</td><td>2026-06-21</td><td>20:22</td></tr>
</tbody></table>`)}
<p>শেষ দুটি সারি <strong>একই জ্যোতির্বৈজ্ঞানিক মুহূর্ত</strong>। এদের মধ্যকার পুরো ঘণ্টাটি আসে কেবল অফসেট থেকে। ঠিক এক ঘণ্টার পার্থক্য প্রায় সবসময়ই সময় অঞ্চল বা ডেলাইট সেভিংয়ের ব্যাপার, গণনার নয়।</p>

<h2>পঞ্চম কারণ: রাউন্ডিং</h2>
<p>সময় দেখানো হয় মিনিট পর্যন্ত; গণনা এর চেয়ে সূক্ষ্ম মান বের করে। এই সাইট <strong>নিকটতম মিনিটে</strong> রাউন্ড করে, আর অন্য কোনো উৎস সেকেন্ড কেবল <strong>ছেঁটে</strong> দিতে পারে। একই অন্তর্নিহিত মানে ফলাফল পুরো এক মিনিট আলাদা হতে পারে।</p>
<p>কায়রো, 27 আগস্ট 2026, মিশরীয় পদ্ধতি:</p>

${T(`<table>
<thead><tr><th>সময়</th><th>গণনা করা মান</th><th>নিকটতম মিনিটে রাউন্ড</th><th>ছেঁটে ফেলা</th></tr></thead>
<tbody>
<tr><td>জোহর</td><td>11:56:37</td><td><strong>11:57</strong></td><td>11:56</td></tr>
<tr><td>আসর</td><td>15:31:32</td><td><strong>15:32</strong></td><td>15:31</td></tr>
<tr><td>মাগরিব</td><td>18:23:37</td><td><strong>18:24</strong></td><td>18:23</td></tr>
</tbody></table>`)}
<p>পাঁচ দিনে ত্রিশটি সময়ের মধ্যে দুটি নীতির অমিল দাঁড়িয়েছে <strong>ষোলোটিতে</strong> — প্রায় অর্ধেক, কারণ সেকেন্ড প্রায় অর্ধেক ক্ষেত্রেই ত্রিশ ছাড়িয়ে যায়। ব্যবধানটি এক মিনিটের এবং এর সঙ্গে জ্যোতির্বিজ্ঞানের কোনো সম্পর্ক নেই: এটি কেবল নীতির ব্যাপার।</p>

<h2>বিশেষ ক্ষেত্র: উচ্চ অক্ষাংশ</h2>
<p>যত উত্তরে বা দক্ষিণে যাওয়া যায়, তত দ্রুত এমন দিন আসে যেদিন সূর্য প্রয়োজনীয় কোণ পর্যন্ত নামেই না। সেদিন জ্যোতির্বৈজ্ঞানিক ফজর বা এশা থাকে না — গণনা ব্যর্থ হয়েছে বলে নয়, বরং ঘটনাটিই ঘটেনি বলে।</p>
<h3>তিনটি নিয়ম</h3>
<p>এর বদলে এমন একটি নিয়ম ব্যবহৃত হয় যা মাগরিব ও সূর্যোদয়ের মধ্যবর্তী রাতকে ভাগ করে। প্রচলিত তিনটি নিয়ম হলো:</p>
<ul>
<li><strong>রাতের মধ্যভাগ</strong> — রাতকে সমান দুই ভাগে ভাগ করা হয়।</li>
<li><strong>রাতের এক-সপ্তমাংশ</strong> — রাতকে সাত ভাগে ভাগ করা হয়; এশা শুরু হয় প্রথম ভাগের পরে, ফজর শেষ ভাগের শুরুতে।</li>
<li><strong>কোণভিত্তিক</strong> — রাতকে ভাগ করা হয় কোণের সঙ্গে ষাটের অনুপাতে।</li>
</ul>
<p>এটি <strong>কোনো ছোট কারিগরি খুঁটিনাটি নয়</strong>। স্টকহোম (59.33° N) MWL দিয়ে গণনা করা:</p>

${T(`<table>
<thead><tr><th>তারিখ</th><th>কোণভিত্তিক</th><th>এক-সপ্তমাংশ</th><th>রাতের মধ্যভাগ</th><th>সর্বোচ্চ ব্যবধান</th></tr></thead>
<tbody>
<tr><td>2026-05-20</td><td>02:05</td><td>03:07</td><td>00:45</td><td><strong>142 মিনিট</strong></td></tr>
<tr><td>2026-06-21</td><td>01:54</td><td>02:45</td><td>00:50</td><td>115 মিনিট</td></tr>
<tr><td>2026-07-15</td><td>02:07</td><td>03:05</td><td>00:54</td><td>131 মিনিট</td></tr>
<tr><td>2026-12-21</td><td>07:02</td><td>07:10</td><td>07:02</td><td>8 মিনিট</td></tr>
</tbody></table>`)}
<p>মে মাসে বিস্তার <strong>দুই ঘণ্টা</strong> ছাড়িয়ে যায়; ডিসেম্বরে তা প্রায় মিলিয়ে যায়। আপনি যদি উত্তরে থাকেন এবং দুটি অ্যাপের মধ্যে বিরাট পার্থক্য দেখেন, কারণ সম্ভবত ভিন্ন নিয়ম, ভিন্ন কোণ নয়।</p>
<p>PrayTimes-এর নথিপত্র কোণভিত্তিক পদ্ধতিকে একটি প্রস্তাবিত বিকল্প হিসেবে চিহ্নিত করে। TimesPrayers স্বাধীনভাবে AngleBased-কে উচ্চ অক্ষাংশের জন্য তার বর্তমান পূর্বনির্ধারিত নিয়ম হিসেবে ব্যবহার করে।</p>
<h3>জার্মানির জন্য TimesPrayers-এর নিজস্ব নিয়ম</h3>
<p>জার্মানির অবস্থানগুলোর জন্য TimesPrayers তার নিজস্ব DEHybrid নিয়ম প্রয়োগ করে, যা প্রথমেই প্রশ্ন করে: <strong>সূর্য কি আজ সত্যিই সেই কোণ পর্যন্ত পৌঁছায়, যথেষ্ট ব্যবধানসহ?</strong> পৌঁছালে প্রকৃত জ্যোতির্বৈজ্ঞানিক গণনা ব্যবহৃত হয়; নইলে অনুমান।</p>
<p>পার্থক্যটি বাস্তব, তাত্ত্বিক নয়। ফ্রাঙ্কফুর্টে 21 মে 2026 তারিখে MWL দিয়ে: হাইব্রিড নিয়ম ফজর দেয় 02:33-এ আর কোণভিত্তিক নিয়ম দেয় 03:02 — ঊনত্রিশ মিনিটের পার্থক্য। বছরের বেশিরভাগ দিনে দুটি হুবহু মিলে যায়; অমিলটি সীমাবদ্ধ থাকে বসন্তের শেষ ও গ্রীষ্মের সেই সপ্তাহগুলোতে যেখানে প্রশ্নটির সত্যিই একটি উত্তর দাঁড়ায়।</p>

<h2>আসর সম্পূর্ণ আলাদা একটি কারণ</h2>
<p>দুটি উৎস উপরের সবকিছুতে একমত হয়েও কেবল আসরে ভিন্ন হতে পারে, কারণ আসরের দুটি সংজ্ঞা আছে: বস্তুর ছায়া তার দৈর্ঘ্যের সমান হলে, নাকি দ্বিগুণ হলে।</p>
<p>পার্থক্যটি প্রান্তিক নয়। কায়রোতে 21 মার্চ 2026 তারিখে MWL দিয়ে: প্রথম সংজ্ঞা দেয় 15:30, দ্বিতীয়টি 16:24 — <strong>চুয়ান্ন মিনিট</strong>। আপনার অমিল যদি কেবল আসরে হয় এবং মোটামুটি এই মাপের হয়, তাহলে খুব সম্ভবত এটিই কারণ। এই সাইট পূর্বনির্ধারিতভাবে ছায়া গুণক 1 ব্যবহার করে এবং অন্যটিও সমর্থন করে।</p>

<h2>দুটি উৎস সততার সঙ্গে কীভাবে মেলাবেন</h2>
<p>একটিকে ভুল বলার আগে পাঁচটি বিষয় মিলিয়ে নিন:</p>
<ol>
<li><strong>একই তারিখ</strong> — সময় প্রতিদিন সরে।</li>
<li><strong>একই স্থানাঙ্ক</strong> — একদিকে «কায়রো» আর অন্যদিকে «কেন্দ্রীয় কায়রো» নয়।</li>
<li><strong>একই পদ্ধতি</strong> — তার দুটি কোণসহ।</li>
<li><strong>আসরের একই সংজ্ঞা।</strong></li>
<li><strong>একই অফসেট</strong> — ডেলাইট সেভিংসহ।</li>
</ol>
<p>পাঁচটিই মিললে যদি এক-দুই মিনিট থেকে যায়, সেটি রাউন্ডিং। এক ঘণ্টা থেকে গেলে সেটি সময় অঞ্চল। দুই ঘণ্টা থেকে গেলে এবং আপনি উত্তরে থাকলে সেটি উচ্চ অক্ষাংশের নিয়ম।</p>
<p>আর ব্যবহারিক নিয়মটি এখনও বহাল: <strong>আপনার মসজিদ বা আপনার দেশের কর্তৃপক্ষ যা ব্যবহার করে, তাই অনুসরণ করুন।</strong></p>
`,
sources: `
<h2>সূত্র</h2>
<p class="guide-sources-note">এই পৃষ্ঠার প্রতিটি পরিমাপ এই সাইটের ইঞ্জিন দিয়েই, প্রতিটি তালিকায় উল্লিখিত তারিখ ও স্থানাঙ্ক ব্যবহার করে গণনা করা হয়েছে।</p>
<ul>
<li>উচ্চ অক্ষাংশের নিয়মের সংজ্ঞা: Pray Times নথিপত্র — <a href="https://praytimes.org/calculation" rel="nofollow noopener" target="_blank">praytimes.org/calculation</a></li>
<li>সরকারি <em>temkin</em> তালিকা: Diyanet İşleri Başkanlığı (তুরস্ক) — <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>প্রকাশিত রাবাত সময়সূচী: আওকাফ ও ইসলামি বিষয়ক মন্ত্রণালয় — <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>প্যারামিটারের তুলনামূলক তালিকা: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>

---
`,
related: [
  { href: '/bn/guides/prayer-time-calculation-methods', label: 'নামাজের সময় গণনার পদ্ধতি ও কোণ' },
  { href: '/bn/guides/how-qibla-direction-is-calculated', label: 'কিবলার দিক কীভাবে গণনা করা হয়' },
],
},
ms: {
h1: 'Mengapa Waktu Solat Berbeza antara Aplikasi dan Laman Web?',
body: `
<p class="guide-intro">Anda buka satu aplikasi dan azan Subuh sudah berkumandang; anda semak laman lain dan waktunya dua belas minit kemudian. Yang mana salah? Biasanya tiada satu pun. Bezanya bukan pengiraan yang rosak — ia tetapan berlainan yang disuap ke dalam persamaan yang sama. Halaman ini menyenaraikan lima sebab lazim waktu solat berbeza, disusun daripada kesan terbesar kepada terkecil.</p>

<h2>Sebab pertama: sudut yang berlainan</h2>
<p>Syuruk, Zohor dan Maghrib mempunyai takrif geometri terus yang tidak dipertikaikan sesiapa. Subuh dan Isyak terikat pada senja, dan senja ialah pudar yang beransur, bukan satu detik. Jadi setiap pihak berkuasa memilih satu <strong>ambang</strong>: sedalam mana matahari sudah turun di bawah ufuk.</p>
<p>Apabila satu sumber menggunakan Subuh 15° dan satu lagi 19.5°, jurang antara keduanya di Kaherah pada 21 Mac 2026 ialah <strong>dua puluh satu minit</strong>. Tiada yang salah; masing-masing menerapkan ambangnya sendiri.</p>
<p>Dan jurang itu <strong>tidak kekal tetap</strong>. Pada latitud pertengahan, satu darjah bernilai kira-kira lima minit pada musim sejuk dan boleh mencecah tujuh berhampiran solstis musim panas. Bandingkan pada Januari, bandingkan semula pada Jun, dan bezanya sudah berubah — hal ini sendiri mengelirukan ramai orang. Kaedah dan sudutnya dibincangkan dalam <a href="/ms/guides/prayer-time-calculation-methods">panduan kaedah pengiraan</a>.</p>

<h2>Sebab kedua: pelarasan minit oleh pihak berkuasa</h2>
<p>Sesetengah pihak berkuasa tidak menerbitkan hasil sudut yang mentah. Mereka menerbitkan jadual yang sudah menambahkan <strong>minit ihtiyat (langkah berjaga-jaga)</strong>.</p>
<p>Kes berdokumen rasmi yang paling jelas ialah <strong>Turki</strong>. Diyanet İşleri Başkanlığı menerbitkan jadual <em>temkin</em> yang nyata: waktu matahari terbit dialihkan tujuh minit lebih awal, manakala lima minit ditambah pada Zohor, empat pada Asar dan tujuh pada Maghrib; tiada pelarasan pada imsak mahupun Isyak.</p>
<p>Jadi jika dua sumber mengira sudut yang sama betul-betul, dan satu menerapkan jadual itu sementara satu lagi tidak, waktu Syuruk akan berbeza tujuh minit <strong>walaupun astronominya serupa</strong>. Ini punca lazim bagi perbezaan kecil tetapi konsisten.</p>

<h2>Sebab ketiga: koordinat</h2>
<p>Waktu solat dikira untuk satu titik, bukan untuk sebuah bandar. Jika dua sumber meletakkan anda pada titik berlainan, waktunya berbeza.</p>
<p>Tetapi saiz kesan ini kerap dilebih-lebihkan. Kami mengukur Kaherah pada 27 Ogos 2026 menggunakan kaedah Mesir:</p>

${T(`<table>
<thead><tr><th>Lokasi</th><th>Subuh</th><th>Zohor</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Kaherah tengah</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>Helwan (selatan)</td><td>03:58</td><td>11:56</td><td>18:23</td></tr>
<tr><td>Shubra El Kheima (utara)</td><td>03:58</td><td>11:57</td><td>18:24</td></tr>
<tr><td>6th of October (barat)</td><td>04:00</td><td>11:58</td><td>18:25</td></tr>
</tbody></table>`)}
<p>Merentas kira-kira tiga puluh dua kilometer, rentangannya hanya <strong>satu minit</strong>. Koordinat bukan penjelasan yang meyakinkan bagi beza sepuluh minit.</p>
<p>Kesan besar muncul apabila rentangan geografi melebar <strong>di dalam satu zon waktu</strong>. Seluruh Sepanyol berkongsi satu jam pada musim panas, namun — dikira dengan MWL untuk 27 Ogos 2026:</p>

${T(`<table>
<thead><tr><th>Bandar</th><th>Longitud</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Barcelona</td><td>2.17° E</td><td>20:33</td></tr>
<tr><td>Madrid</td><td>3.70° W</td><td>20:55</td></tr>
<tr><td>A Coruña</td><td>8.41° W</td><td>21:18</td></tr>
</tbody></table>`)}
<p><strong>Empat puluh lima minit</strong> antara dua hujung sebuah negara pada satu jam yang sama. Jika satu sumber menggunakan koordinat bandar anda dan satu lagi menggunakan ibu negara atau titik tengah negara sebagai gantian, itu sahaja sudah menghasilkan jurang yang besar.</p>

<h2>Sebab keempat: zon waktu dan waktu jimat siang</h2>
<p>Saat astronominya sama; jam yang memaparkannya bergantung pada ofset. London menjelaskannya dengan bersih:</p>

${T(`<table>
<thead><tr><th>Kes</th><th>Tarikh</th><th>Maghrib</th></tr></thead>
<tbody>
<tr><td>Musim sejuk (UTC+0)</td><td>2026-01-15</td><td>16:21</td></tr>
<tr><td>Musim panas (UTC+1)</td><td>2026-06-21</td><td>21:22</td></tr>
<tr><td>Musim panas tetapi dengan ofset musim sejuk</td><td>2026-06-21</td><td>20:22</td></tr>
</tbody></table>`)}
<p>Dua baris terakhir ialah <strong>saat astronomi yang sama</strong>. Satu jam penuh antara keduanya datang semata-mata daripada ofset. Beza tepat satu jam hampir selalu isu zon waktu atau waktu jimat siang, bukan isu pengiraan.</p>

<h2>Sebab kelima: pembundaran</h2>
<p>Waktu dipaparkan sehingga minit; pengiraan pula menghasilkan nilai yang lebih halus. Laman ini membundarkan ke <strong>minit terdekat</strong>, sementara sumber lain mungkin sekadar <strong>memotong</strong> saatnya. Hasilnya boleh berbeza satu minit penuh atas nilai asas yang sama.</p>
<p>Kaherah, 27 Ogos 2026, kaedah Mesir:</p>

${T(`<table>
<thead><tr><th>Waktu</th><th>Nilai dikira</th><th>Dibundarkan ke minit terdekat</th><th>Dipotong</th></tr></thead>
<tbody>
<tr><td>Zohor</td><td>11:56:37</td><td><strong>11:57</strong></td><td>11:56</td></tr>
<tr><td>Asar</td><td>15:31:32</td><td><strong>15:32</strong></td><td>15:31</td></tr>
<tr><td>Maghrib</td><td>18:23:37</td><td><strong>18:24</strong></td><td>18:23</td></tr>
</tbody></table>`)}
<p>Merentas tiga puluh waktu dalam lima hari, kedua-dua dasar itu berbeza pada <strong>enam belas</strong> daripadanya — kira-kira separuh, kerana saatnya melebihi tiga puluh lebih kurang separuh masa. Jurangnya satu minit dan tiada kaitan dengan astronomi: ia dasar paparan semata-mata.</p>

<h2>Kes khas: latitud tinggi</h2>
<p>Semakin jauh ke utara atau ke selatan, semakin cepat tiba hari apabila matahari langsung tidak turun sehingga sudut yang diperlukan. Pada hari itu tiada Subuh atau Isyak astronomi — bukan kerana pengiraan gagal, tetapi kerana peristiwanya tidak berlaku.</p>
<h3>Tiga peraturan</h3>
<p>Sebaliknya digunakan satu peraturan yang membahagi malam antara Maghrib dan Syuruk. Tiga peraturan konvensional itu ialah:</p>
<ul>
<li><strong>Tengah malam</strong> — malam dibahagi dua sama.</li>
<li><strong>Satu per tujuh malam</strong> — malam dibahagi kepada tujuh bahagian; Isyak bermula selepas bahagian pertama, Subuh pada permulaan bahagian terakhir.</li>
<li><strong>Berasaskan sudut</strong> — malam dibahagi mengikut nisbah sudut kepada enam puluh.</li>
</ul>
<p>Ini <strong>bukan butiran teknikal yang kecil</strong>. Stockholm (59.33° N) dikira dengan MWL:</p>

${T(`<table>
<thead><tr><th>Tarikh</th><th>Berasaskan sudut</th><th>Satu per tujuh</th><th>Tengah malam</th><th>Jurang terluas</th></tr></thead>
<tbody>
<tr><td>2026-05-20</td><td>02:05</td><td>03:07</td><td>00:45</td><td><strong>142 minit</strong></td></tr>
<tr><td>2026-06-21</td><td>01:54</td><td>02:45</td><td>00:50</td><td>115 minit</td></tr>
<tr><td>2026-07-15</td><td>02:07</td><td>03:05</td><td>00:54</td><td>131 minit</td></tr>
<tr><td>2026-12-21</td><td>07:02</td><td>07:10</td><td>07:02</td><td>8 minit</td></tr>
</tbody></table>`)}
<p>Pada Mei rentangannya melebihi <strong>dua jam</strong>; menjelang Disember ia hampir lenyap. Jika anda di utara dan melihat beza yang sangat besar antara dua aplikasi, puncanya berkemungkinan peraturan yang berlainan, bukan sudut yang berlainan.</p>
<p>Dokumentasi PrayTimes menandakan kaedah berasaskan sudut sebagai pilihan yang disyorkan. TimesPrayers secara tersendiri menggunakan AngleBased sebagai peraturan latitud tingginya yang lalai pada masa ini.</p>
<h3>Peraturan khusus TimesPrayers untuk Jerman</h3>
<p>Bagi lokasi di Jerman, TimesPrayers menerapkan peraturan DEHybrid miliknya sendiri, yang mula-mula bertanya: <strong>adakah matahari benar-benar mencapai sudut itu hari ini, dengan margin yang mencukupi?</strong> Jika ya, pengiraan astronomi sebenar digunakan; jika tidak, anggaran.</p>
<p>Bezanya nyata, bukan teori. Frankfurt pada 21 Mei 2026 dengan MWL: peraturan hibrid memberi Subuh pada 02:33 manakala peraturan berasaskan sudut memberi 03:02 — beza dua puluh sembilan minit. Pada kebanyakan hari dalam setahun kedua-duanya sepadan tepat; percanggahan itu terhad kepada minggu-minggu akhir musim bunga dan musim panas, iaitu ketika pilihan antara pengiraan sebenar dan anggaran benar-benar menjadi relevan.</p>

<h2>Asar ialah sebab yang berasingan sepenuhnya</h2>
<p>Dua sumber boleh bersetuju pada semua perkara di atas dan masih berbeza pada Asar sahaja, kerana Asar mempunyai dua takrif: apabila bayang objek sama panjang dengannya, atau dua kali panjangnya.</p>
<p>Bezanya bukan kecil. Kaherah pada 21 Mac 2026 dengan MWL: takrif pertama memberi 15:30, kedua 16:24 — <strong>lima puluh empat minit</strong>. Jika percanggahan anda hanya pada Asar dan lebih kurang sebesar itu, besar kemungkinan itulah puncanya. Laman ini menggunakan faktor bayang 1 secara lalai dan menyokong yang satu lagi.</p>

<h2>Cara membandingkan dua sumber secara adil</h2>
<p>Sebelum memutuskan satu daripadanya salah, padankan kelima-limanya:</p>
<ol>
<li><strong>Tarikh yang sama</strong> — waktu beralih setiap hari.</li>
<li><strong>Koordinat yang sama</strong> — bukan «Kaherah» di sebelah sini dan «Kaherah tengah» di sebelah sana.</li>
<li><strong>Kaedah yang sama</strong> — kedua-dua sudutnya sekali.</li>
<li><strong>Takrif Asar yang sama.</strong></li>
<li><strong>Ofset yang sama</strong> — termasuk waktu jimat siang.</li>
</ol>
<p>Jika kelima-limanya padan dan tinggal satu dua minit, itu pembundaran. Jika tinggal satu jam, itu zon waktu. Jika tinggal dua jam dan anda di utara, itu peraturan latitud tinggi.</p>
<p>Dan peraturan praktikalnya masih berdiri: <strong>ikut apa yang digunakan masjid anda atau pihak berkuasa negara anda.</strong></p>
`,
sources: `
<h2>Sumber</h2>
<p class="guide-sources-note">Setiap ukuran pada halaman ini dikira oleh enjin laman ini, menggunakan tarikh dan koordinat yang dinamakan dalam setiap jadual.</p>
<ul>
<li>Takrif peraturan latitud tinggi: dokumentasi Pray Times — <a href="https://praytimes.org/calculation" rel="nofollow noopener" target="_blank">praytimes.org/calculation</a></li>
<li>Jadual <em>temkin</em> rasmi: Diyanet İşleri Başkanlığı (Turki) — <a href="https://vakithesaplama.diyanet.gov.tr/temkin.php" rel="nofollow noopener" target="_blank">vakithesaplama.diyanet.gov.tr</a></li>
<li>Jadual Rabat yang diterbitkan: Kementerian Habous dan Hal Ehwal Islam — <a href="https://www.habous.gov.ma/prieres/" rel="nofollow noopener" target="_blank">habous.gov.ma</a></li>
<li>Jadual perbandingan parameter: <a href="https://api.aladhan.com/v1/methods" rel="nofollow noopener" target="_blank">api.aladhan.com/v1/methods</a></li>
</ul>

---
`,
related: [
  { href: '/ms/guides/prayer-time-calculation-methods', label: 'Kaedah Pengiraan Waktu Solat dan Sudutnya' },
  { href: '/ms/guides/how-qibla-direction-is-calculated', label: 'Bagaimana Arah Kiblat Dikira' },
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
fr: {
h1: 'Comment la direction de la Qibla est calculée',
body: `
<p class="guide-intro">Deux questions semblent n'en faire qu'une mais sont entièrement différentes : <strong>de quel côté se trouve la Kaaba depuis l'endroit où je suis ?</strong> et <strong>vers quoi pointe la boussole de mon téléphone en ce moment ?</strong> La première a une réponse géométrique déterministe. La seconde est une lecture de capteur influencée par son environnement. Cette page explique la première avec précision, et pourquoi aucune des deux ne remplace l'autre.</p>

<h2>La Qibla est une direction sur une sphère, non un trait sur une carte plate</h2>
<p>Ce qui égare le plus, c'est de se représenter une carte murale et de relier sa ville à La Mecque à la règle. Mais la Terre n'est pas plate, et les cartes de Mercator déforment la direction d'autant plus qu'on s'éloigne de l'équateur.</p>
<p>La Qibla est le <strong>plus court chemin à la surface d'une sphère</strong> — un arc de grand cercle — et la direction dont vous avez besoin est <strong>l'angle sous lequel vous vous engagez sur cet arc</strong>.</p>
<p>C'est pourquoi les résultats déjouent l'intuition. Depuis <strong>New York</strong>, la Qibla est à <strong>58°</strong>, au nord-est plutôt qu'à l'est, alors que La Mecque se trouve au sud-est sur une carte plate. Depuis <strong>Le Cap</strong> elle est à <strong>23°</strong>, depuis <strong>Tokyo à 293°</strong> et depuis <strong>Jakarta à 295°</strong> — au nord-ouest dans ces deux derniers cas.</p>

<h2>La formule utilisée</h2>
<p>Le cap initial du grand cercle entre deux points se calcule avec la formule standard :</p>
<pre class="guide-formula"><code>y = sin(Δλ) · cos(φ₂)
x = cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ)
θ = atan2(y, x)</code></pre>
<p>où φ₁ est votre latitude, φ₂ celle de la Kaaba, et Δλ la différence de longitude. Le résultat en radians est converti en degrés.</p>
<p>Ce cap est rapporté au <strong>nord géographique</strong>, car l'équation est purement géographique et ne contient aucun terme magnétique. Nous y reviendrons.</p>
<p><strong>La valeur affichée est le cap initial du grand cercle</strong> depuis votre position vers la Kaaba. Si quelqu'un parcourait physiquement cette route en grand cercle, le cap changerait progressivement au fil du trajet. Tant que vous restez où vous êtes, la valeur est fixe.</p>

<h2>Le modèle terrestre utilisé</h2>
<p>TimesPrayers utilise un <strong>modèle terrestre sphérique</strong> pour ce calcul. Le cap et la distance reposent donc sur la géométrie du grand cercle sur une sphère, et non sur un modèle géodésique ellipsoïdal plus complexe.</p>

<h2>Les coordonnées de la Kaaba</h2>
<p>Les coordonnées utilisées par TimesPrayers sont <strong>21.4225° N, 39.8262° E</strong>. C'est un point fixe unique : le résultat ne change donc que lorsque votre propre position change.</p>

<h2>La distance</h2>
<p>La distance est calculée par la formule de Haversine sur une sphère de rayon <strong>6371 km</strong> et affichée arrondie au kilomètre le plus proche. C'est une <strong>distance de surface le long de l'arc</strong>, non une ligne droite à travers la Terre.</p>

${T(`<table>
<thead><tr><th>Ville</th><th>Cap</th><th>Direction</th><th>Distance</th></tr></thead>
<tbody>
<tr><td>Le Caire</td><td>136.14°</td><td>sud-est</td><td>1287 km</td></tr>
<tr><td>Riyad</td><td>243.80°</td><td>sud-ouest</td><td>790 km</td></tr>
<tr><td>Sanaa</td><td>326.28°</td><td>nord-ouest</td><td>815 km</td></tr>
<tr><td>Ankara</td><td>160.17°</td><td>sud</td><td>2162 km</td></tr>
<tr><td>Moscou</td><td>176.36°</td><td>sud</td><td>3822 km</td></tr>
<tr><td>Londres</td><td>118.99°</td><td>sud-est</td><td>4794 km</td></tr>
<tr><td>Le Cap</td><td>23.35°</td><td>nord-est</td><td>6558 km</td></tr>
<tr><td>Jakarta</td><td>295.15°</td><td>nord-ouest</td><td>7920 km</td></tr>
<tr><td>Tokyo</td><td>293.00°</td><td>nord-ouest</td><td>9472 km</td></tr>
<tr><td>New York</td><td>58.48°</td><td>nord-est</td><td>10306 km</td></tr>
<tr><td>São Paulo</td><td>68.94°</td><td>est</td><td>10602 km</td></tr>
<tr><td>Sydney</td><td>277.50°</td><td>ouest</td><td>13236 km</td></tr>
</tbody></table>`)}
<p>Remarquez <strong>Riyad</strong> et <strong>Sanaa</strong> : toutes deux sont proches de La Mecque, et pourtant la Qibla depuis Riyad est au sud-ouest et depuis Sanaa au nord-ouest. Le cap dépend de la position relative, non de la distance.</p>

<h2>Pourquoi la valeur est parfois négative avant normalisation</h2>
<p><code>atan2</code> renvoie une valeur comprise entre −180° et 180°. Tout cap supérieur à 180° ressort donc négatif, et il est normalisé en ajoutant 360 puis en prenant le reste modulo 360 :</p>

${T(`<table>
<thead><tr><th>Ville</th><th>Résultat brut</th><th>Après normalisation</th></tr></thead>
<tbody>
<tr><td>Sanaa</td><td>−33.72°</td><td>326.28°</td></tr>
<tr><td>Jakarta</td><td>−64.85°</td><td>295.15°</td></tr>
<tr><td>Tokyo</td><td>−67.00°</td><td>293.00°</td></tr>
<tr><td>Sydney</td><td>−82.50°</td><td>277.50°</td></tr>
<tr><td>Riyad</td><td>−116.20°</td><td>243.80°</td></tr>
</tbody></table>`)}
<p>Ce site affiche le cap à deux endroits : un <strong>nombre entier</strong> sur le badge visible, et <strong>deux décimales</strong> dans la grille de détails. Les deux proviennent du même calcul ; seul l'affichage diffère.</p>

<h2>La boussole de votre appareil n'est pas ce calcul</h2>
<p>C'est là le point essentiel. Le nombre ci-dessus est <strong>déterministe</strong> : donnez-lui les mêmes coordonnées et il renvoie le même résultat à chaque fois. L'aiguille qui bouge sur votre écran provient des <strong>capteurs</strong> de l'appareil, et se comporte tout autrement.</p>
<h3>Deux chemins différents pour deux plateformes</h3>
<p>Sur <strong>iOS</strong>, le site utilise directement le cap fourni par le système. Sur <strong>Android</strong>, le cap est dérivé de la matrice de rotation de l'appareil avec compensation de l'<strong>inclinaison</strong> et de la <strong>rotation de l'écran</strong>, afin que la lecture ne dérive pas quand vous tenez le téléphone de biais ou que vous faites pivoter l'écran.</p>
<h3>Absolu contre relatif</h3>
<p>Les spécifications des navigateurs distinguent deux sortes de lecture d'orientation : l'<strong>absolue</strong>, rapportée au référentiel terrestre, et la <strong>relative</strong>, dont le référentiel est <strong>arbitraire</strong> — autrement dit son « zéro » peut fort bien ne pas être le nord.</p>
<p>Ce site privilégie donc la lecture absolue, et une fois qu'il en a vu une, il <strong>ignore</strong> les lectures relatives ultérieures, afin qu'un zéro arbitraire ne puisse pas corrompre un cap correct. Si seule une lecture relative est disponible, le site affiche un avis de faible précision de la boussole. Si aucune lecture n'est disponible, il masque l'aiguille en direct et affiche le cap calculé comme un nombre fixe.</p>
<h3>Nord géographique et nord magnétique</h3>
<p><strong>Le cap mathématique de la Qibla est rapporté au nord géographique</strong>, tandis que le cap affiché en direct provient des capteurs de l'appareil et <strong>peut être rapporté au nord magnétique</strong>. L'angle entre les deux s'appelle la <strong>déclinaison magnétique</strong> ; elle varie selon le lieu et évolue dans le temps — c'est pourquoi les modèles mondiaux qui la décrivent sont révisés tous les cinq ans.</p>
<p><strong>TimesPrayers n'applique pas actuellement de correction distincte de déclinaison magnétique.</strong> L'aiguille peut donc ne pas tomber exactement sur le nombre calculé.</p>
<h3>La précision n'est pas le nombre de décimales</h3>
<p><strong>Une valeur affichée avec une décimale ne signifie pas que la direction réelle de la boussole soit exacte à ce degré près</strong> ; la précision des capteurs dépend de l'appareil, de son environnement et du champ magnétique. Les magnétomètres sont sensibles à ce qui les entoure : objets métalliques, haut-parleurs, coques magnétiques, voitures, armatures d'acier des bâtiments. Décrire un huit avec le téléphone aide le système à se recalibrer.</p>
<p><strong>Ce qu'il faut en retenir :</strong> le nombre calculé est la référence stable ; l'aiguille est un outil approché pour s'en servir.</p>

<h2>À propos d'un léger écart</h2>
<p>Beaucoup demandent ce qu'il advient si l'on s'écarte un peu de la direction calculée. Cela relève de la jurisprudence, traitée par les savants avec un détail qui varie selon la situation de chacun et sa capacité à déterminer la direction. Nous exposons le calcul et ses limites, et n'émettons aucun avis juridique à ce sujet ; cela est renvoyé aux savants qualifiés ou à l'autorité que suit l'utilisateur.</p>
`,
sources: `
<h2>Sources</h2>
<p class="guide-sources-note">Les caps et les distances de cette page ont été calculés avec la formule même qu'utilise ce site, à partir des coordonnées de chaque ville.</p>
<ul>
<li>Cap initial, Haversine et le rayon de 6371 km sur un modèle sphérique : <a href="https://www.movable-type.co.uk/scripts/latlong.html" rel="nofollow noopener" target="_blank">movable-type.co.uk</a></li>
<li>Référentiel terrestre du capteur d'orientation absolue : <a href="https://www.w3.org/TR/orientation-sensor/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-sensor</a></li>
<li>Lectures absolues et relatives, et limites de précision d'affichage : <a href="https://www.w3.org/TR/orientation-event/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-event</a></li>
<li><code>webkitCompassHeading</code> et son référentiel : documentation Apple Developer</li>
<li>La déclinaison magnétique et son évolution : World Magnetic Model — <a href="https://www.ncei.noaa.gov/products/world-magnetic-model" rel="nofollow noopener" target="_blank">ncei.noaa.gov</a></li>
</ul>

---
`,
related: [
  { href: '/fr/qibla', label: 'Direction de la Qibla' },
  { href: '/fr/guides/prayer-time-calculation-methods', label: 'Méthodes de calcul des heures de prière et angles' },
],
},
tr: {
h1: 'Kıble Yönü Nasıl Hesaplanır',
body: `
<p class="guide-intro">İki soru tek gibi görünür ama tamamen farklıdır: <strong>bulunduğum yerden Kâbe hangi yönde?</strong> ve <strong>telefonumun pusulası şu anda nereyi gösteriyor?</strong> Birincisinin belirlenimci, geometrik bir yanıtı vardır. İkincisi ise çevresinden etkilenen bir sensör okumasıdır. Bu sayfa birincisini tam olarak anlatır ve ikisinin birbirinin yerini neden tutmadığını açıklar.</p>

<h2>Kıble, düz haritada bir çizgi değil küre yüzeyinde bir yöndür</h2>
<p>En çok şaşırtan şey, duvar haritasını gözde canlandırıp kendi şehrini Mekke'ye cetvelle birleştirmektir. Oysa Dünya düz değildir ve Mercator haritaları enlem arttıkça yönü giderek çarpıtır.</p>
<p>Kıble, <strong>küre yüzeyindeki en kısa yoldur</strong> — bir büyük daire yayı — ve ihtiyacınız olan yön, <strong>o yay boyunca yola çıktığınız açıdır</strong>.</p>
<p>Sonuçların sezgiye ters düşmesinin sebebi budur. <strong>New York</strong>'tan kıble <strong>58°</strong>, yani doğu değil kuzeydoğudur; oysa düz haritada Mekke güneydoğuda görünür. <strong>Cape Town</strong>'dan <strong>23°</strong>, <strong>Tokyo'dan 293°</strong> ve <strong>Cakarta'dan 295°</strong> — son ikisinde kuzeybatı.</p>

<h2>Kullanılan formül</h2>
<p>İki nokta arasındaki büyük dairenin başlangıç kerterizi standart formülle hesaplanır:</p>
<pre class="guide-formula"><code>y = sin(Δλ) · cos(φ₂)
x = cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ)
θ = atan2(y, x)</code></pre>
<p>burada φ₁ sizin enleminiz, φ₂ Kâbe'nin enlemi, Δλ ise boylam farkıdır. Radyan cinsinden sonuç dereceye çevrilir.</p>
<p>Bu kerteriz <strong>coğrafi kuzeye</strong> göredir; çünkü denklem tümüyle coğrafidir ve içinde manyetik hiçbir terim yoktur. Buna geri döneceğiz.</p>
<p><strong>Gösterilen değer, bulunduğunuz yerden Kâbe'ye doğru büyük dairenin başlangıç kerterizidir.</strong> Biri o büyük daire rotasında fiilen yol alsaydı, yolculuk boyunca yönü kademeli olarak değişirdi. Siz yerinizde durdukça değer sabittir.</p>

<h2>Kullanılan Dünya modeli</h2>
<p>TimesPrayers bu hesap için <strong>küresel bir Dünya modeli</strong> kullanır. Dolayısıyla kerteriz ve mesafe, daha karmaşık bir elipsoit jeodezik model yerine küre üzerindeki büyük daire geometrisine dayanır.</p>

<h2>Kâbe'nin koordinatları</h2>
<p>TimesPrayers'ın kullandığı koordinatlar <strong>21.4225° N, 39.8262° E</strong>'dir. Tek bir sabit noktadır; bu yüzden sonuç yalnızca sizin konumunuz değiştiğinde değişir.</p>

<h2>Mesafe</h2>
<p>Mesafe, yarıçapı <strong>6371 km</strong> olan bir küre üzerinde Haversine formülüyle hesaplanır ve en yakın kilometreye yuvarlanarak gösterilir. Bu, Dünya'nın içinden geçen düz bir çizgi değil, <strong>yay boyunca yüzey mesafesidir</strong>.</p>

${T(`<table>
<thead><tr><th>Şehir</th><th>Kerteriz</th><th>Yön</th><th>Mesafe</th></tr></thead>
<tbody>
<tr><td>Kahire</td><td>136.14°</td><td>güneydoğu</td><td>1287 km</td></tr>
<tr><td>Riyad</td><td>243.80°</td><td>güneybatı</td><td>790 km</td></tr>
<tr><td>Sana</td><td>326.28°</td><td>kuzeybatı</td><td>815 km</td></tr>
<tr><td>Ankara</td><td>160.17°</td><td>güney</td><td>2162 km</td></tr>
<tr><td>Moskova</td><td>176.36°</td><td>güney</td><td>3822 km</td></tr>
<tr><td>Londra</td><td>118.99°</td><td>güneydoğu</td><td>4794 km</td></tr>
<tr><td>Cape Town</td><td>23.35°</td><td>kuzeydoğu</td><td>6558 km</td></tr>
<tr><td>Cakarta</td><td>295.15°</td><td>kuzeybatı</td><td>7920 km</td></tr>
<tr><td>Tokyo</td><td>293.00°</td><td>kuzeybatı</td><td>9472 km</td></tr>
<tr><td>New York</td><td>58.48°</td><td>kuzeydoğu</td><td>10306 km</td></tr>
<tr><td>São Paulo</td><td>68.94°</td><td>doğu</td><td>10602 km</td></tr>
<tr><td>Sidney</td><td>277.50°</td><td>batı</td><td>13236 km</td></tr>
</tbody></table>`)}
<p><strong>Riyad</strong> ile <strong>Sana</strong>'ya dikkat: ikisi de Mekke'ye yakındır, yine de kıble Riyad'dan güneybatı, Sana'dan kuzeybatıdır. Kerteriz mesafeye değil göreli konuma bağlıdır.</p>

<h2>Değer normalleştirmeden önce neden bazen negatif çıkar</h2>
<p><code>atan2</code> −180° ile 180° arasında bir değer döndürür. Bu yüzden 180°'yi aşan her kerteriz negatif çıkar ve 360 eklenip 360'a göre kalan alınarak normalleştirilir:</p>

${T(`<table>
<thead><tr><th>Şehir</th><th>Ham sonuç</th><th>Normalleştirmeden sonra</th></tr></thead>
<tbody>
<tr><td>Sana</td><td>−33.72°</td><td>326.28°</td></tr>
<tr><td>Cakarta</td><td>−64.85°</td><td>295.15°</td></tr>
<tr><td>Tokyo</td><td>−67.00°</td><td>293.00°</td></tr>
<tr><td>Sidney</td><td>−82.50°</td><td>277.50°</td></tr>
<tr><td>Riyad</td><td>−116.20°</td><td>243.80°</td></tr>
</tbody></table>`)}
<p>Bu site kerterizi iki yerde gösterir: görünen rozette <strong>tam sayı</strong>, ayrıntı tablosunda <strong>iki ondalık basamak</strong>. İkisi de aynı hesaptan gelir; yalnızca gösterim değişir.</p>

<h2>Cihazınızın pusulası bu hesap değildir</h2>
<p>Asıl mesele budur. Yukarıdaki sayı <strong>belirlenimcidir</strong>: aynı koordinatları verin, her seferinde aynı sonucu döndürür. Ekranınızda oynayan iğne ise cihazın <strong>sensörlerinden</strong> gelir ve epeyce farklı davranır.</p>
<h3>İki platform, iki farklı yol</h3>
<p><strong>iOS</strong>'ta site, sistemin verdiği yönü doğrudan kullanır. <strong>Android</strong>'de yön, cihazın dönme matrisinden <strong>eğim</strong> ve <strong>ekran dönüşü</strong> telafisiyle türetilir; böylece telefonu eğik tuttuğunuzda ya da ekranı döndürdüğünüzde okuma kaymaz.</p>
<h3>Mutlak ve göreli</h3>
<p>Tarayıcı belirtimleri iki tür yönelim okumasını ayırır: <strong>mutlak</strong>, Dünya çerçevesine göredir; <strong>göreli</strong> ise referans çerçevesi <strong>keyfîdir</strong> — yani «sıfır»ı kuzey olmayabilir.</p>
<p>Bu yüzden site mutlak okumayı yeğler ve bir kez mutlak okuma gördükten sonra sonraki göreli okumaları <strong>yok sayar</strong>; böylece keyfî bir sıfır, doğru bir yönü bozamaz. Yalnızca göreli okuma varsa site düşük pusula doğruluğu uyarısı gösterir. Hiç okuma yoksa canlı iğneyi gizler ve hesaplanan kerterizi sabit bir sayı olarak gösterir.</p>
<h3>Coğrafi kuzey ve manyetik kuzey</h3>
<p><strong>Matematiksel kıble kerterizi coğrafi kuzeye göredir</strong>; canlı pusula yönü ise cihazın sensörlerinden gelir ve <strong>manyetik referanslı olabilir</strong>. İkisi arasındaki açıya <strong>manyetik sapma</strong> denir; yere göre değişir ve zamanla da değişir — küresel modellerinin beş yılda bir gözden geçirilmesinin sebebi budur.</p>
<p><strong>TimesPrayers şu anda ayrı bir manyetik sapma düzeltmesi uygulamamaktadır.</strong> Bu yüzden iğne, hesaplanan sayının tam üzerine oturmayabilir.</p>
<h3>Doğruluk, ondalık basamak sayısı değildir</h3>
<p><strong>Bir ondalık basamakla gösterilen bir değer, gerçek pusula yönünün o derece kadar doğru olduğu anlamına gelmez</strong>; sensör doğruluğu cihaza, çevresine ve manyetik alana bağlıdır. Manyetometreler çevrelerindeki nesnelere duyarlıdır: metal cisimler, hoparlörler, mıknatıslı telefon kılıfları, otomobiller ve binalardaki çelik donatı. Telefonu sekiz çizer gibi hareket ettirmek sistemin yeniden kalibre olmasına yardımcı olur.</p>
<p><strong>Pratik sonuç:</strong> hesaplanan sayı sabit referanstır; iğne ise ona göre hareket etmek için yaklaşık bir araçtır.</p>

<h2>Küçük sapma üzerine</h2>
<p>Pek çok kişi, hesaplanan yönden biraz saptıklarında ne olacağını sorar. Bu bir fıkıh meselesidir; âlimler bunu kişinin durumuna ve yönü belirleme imkânına göre değişen ayrıntılarla ele almıştır. Biz hesabı ve sınırlarını sunuyoruz, bu konuda hüküm vermiyoruz; bu husus ehil âlimlere ya da kullanıcının bağlı olduğu mercie bırakılmıştır.</p>
`,
sources: `
<h2>Kaynaklar</h2>
<p class="guide-sources-note">Bu sayfadaki kerterizler ve mesafeler, her şehrin koordinatlarından, bu sitenin kullandığı formülle hesaplanmıştır.</p>
<ul>
<li>Başlangıç kerterizi, Haversine ve küresel modelde 6371 km yarıçap: <a href="https://www.movable-type.co.uk/scripts/latlong.html" rel="nofollow noopener" target="_blank">movable-type.co.uk</a></li>
<li>Mutlak yönelim sensörü için Dünya referans çerçevesi: <a href="https://www.w3.org/TR/orientation-sensor/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-sensor</a></li>
<li>Mutlak ve göreli okumalar ile gösterim hassasiyeti sınırları: <a href="https://www.w3.org/TR/orientation-event/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-event</a></li>
<li><code>webkitCompassHeading</code> ve referansı: Apple Developer belgeleri</li>
<li>Manyetik sapma ve değişimi: World Magnetic Model — <a href="https://www.ncei.noaa.gov/products/world-magnetic-model" rel="nofollow noopener" target="_blank">ncei.noaa.gov</a></li>
</ul>

---
`,
related: [
  { href: '/tr/qibla', label: 'Kıble Yönü' },
  { href: '/tr/guides/prayer-time-calculation-methods', label: 'Namaz Vakti Hesaplama Yöntemleri ve Açıları' },
],
},
ur: {
h1: 'سمتِ قبلہ کا حساب کیسے ہوتا ہے',
body: `
<p class="guide-intro">دو سوال ایک جیسے لگتے ہیں مگر بالکل مختلف ہیں: <strong>میں جہاں ہوں وہاں سے کعبہ کس طرف ہے؟</strong> اور <strong>اِس وقت میرے فون کا قطب نما کدھر اشارہ کر رہا ہے؟</strong> پہلے کا جواب متعین ہندسی ہے۔ دوسرا سینسر کی ایک قراءت ہے جس پر اردگرد کا اثر پڑتا ہے۔ یہ صفحہ پہلے کو ٹھیک ٹھیک بیان کرتا ہے، اور یہ بھی کہ ان میں سے کوئی دوسرے کا بدل کیوں نہیں۔</p>

<h2>قبلہ کرے کی سطح پر ایک سمت ہے، چپٹے نقشے پر لکیر نہیں</h2>
<p>سب سے زیادہ الجھن اس تصور سے ہوتی ہے کہ دیوار پر لگا نقشہ لے کر اپنے شہر کو مکہ سے پیمانے کے ساتھ ملا دیا جائے۔ لیکن زمین چپٹی نہیں ہے، اور مرکیٹر نقشے عرض البلد بڑھنے کے ساتھ سمت کو بگاڑتے چلے جاتے ہیں۔</p>
<p>قبلہ <strong>کرے کی سطح پر مختصر ترین راستہ</strong> ہے — عظیم دائرے کا ایک قوس — اور آپ کو جس سمت کی ضرورت ہے وہ <strong>وہ زاویہ ہے جس پر آپ اُس قوس پر چلنا شروع کرتے ہیں</strong>۔</p>
<p>اسی لیے نتائج وجدان کے خلاف نکلتے ہیں۔ <strong>نیو یارک</strong> سے قبلہ <strong><bdi>58°</bdi></strong> ہے، یعنی مشرق کے بجائے شمال مشرق، حالانکہ چپٹے نقشے پر مکہ جنوب مشرق میں دکھتا ہے۔ <strong>کیپ ٹاؤن</strong> سے یہ <strong><bdi>23°</bdi></strong> ہے، <strong>ٹوکیو سے <bdi>293°</bdi></strong> اور <strong>جکارتہ سے <bdi>295°</bdi></strong> — ان دونوں میں شمال مغرب۔</p>

<h2>استعمال ہونے والی مساوات</h2>
<p>دو نقطوں کے درمیان عظیم دائرے کی ابتدائی سمت معیاری مساوات سے نکالی جاتی ہے:</p>
<pre class="guide-formula"><code>y = sin(Δλ) · cos(φ₂)
x = cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ)
θ = atan2(y, x)</code></pre>
<p>جہاں <bdi>φ₁</bdi> آپ کا عرض البلد ہے، <bdi>φ₂</bdi> کعبہ کا، اور <bdi>Δλ</bdi> طول البلد کا فرق۔ ریڈین میں نکلا نتیجہ درجوں میں بدل دیا جاتا ہے۔</p>
<p>یہ سمت <strong>جغرافیائی شمال</strong> کے حوالے سے ہے، کیونکہ مساوات خالص جغرافیائی ہے اور اس میں کوئی مقناطیسی جزو نہیں۔ ہم اس پر واپس آئیں گے۔</p>
<p><strong>دکھائی جانے والی قیمت آپ کے مقام سے کعبہ کی طرف عظیم دائرے کی ابتدائی سمت ہے۔</strong> اگر کوئی واقعتاً اُس عظیم دائرے کے راستے پر سفر کرے تو سفر کے دوران سمت بتدریج بدلتی رہے گی۔ جب تک آپ اپنی جگہ پر ہیں، قیمت ثابت رہتی ہے۔</p>

<h2>استعمال ہونے والا زمینی نمونہ</h2>
<p><bdi>TimesPrayers</bdi> اس حساب کے لیے <strong>کروی زمینی ماڈل</strong> استعمال کرتی ہے۔ چنانچہ سمت اور فاصلہ کرے پر عظیم دائرے کی ہندسہ پر مبنی ہیں، نہ کہ کسی زیادہ پیچیدہ بیضوی جیوڈیسک ماڈل پر۔</p>

<h2>کعبہ کے کوآرڈینیٹس</h2>
<p><bdi>TimesPrayers</bdi> جو کوآرڈینیٹس استعمال کرتی ہے وہ <strong><bdi>21.4225° N، 39.8262° E</bdi></strong> ہیں۔ یہ ایک ہی ثابت نقطہ ہے، اس لیے نتیجہ صرف تب بدلتا ہے جب آپ کا اپنا مقام بدلے۔</p>

<h2>فاصلہ</h2>
<p>فاصلہ <bdi>Haversine</bdi> مساوات سے <strong><bdi>6371 km</bdi></strong> نصف قطر والے کرے پر نکالا جاتا ہے اور قریب ترین کلومیٹر تک تقریب کر کے دکھایا جاتا ہے۔ یہ <strong>قوس کے ساتھ سطحی فاصلہ</strong> ہے، زمین کے آر پار سیدھی لکیر نہیں۔</p>

${T(`<table>
<thead><tr><th>شہر</th><th>سمت</th><th>جہت</th><th>فاصلہ</th></tr></thead>
<tbody>
<tr><td>قاہرہ</td><td><bdi>136.14°</bdi></td><td>جنوب مشرق</td><td><bdi>1287 km</bdi></td></tr>
<tr><td>ریاض</td><td><bdi>243.80°</bdi></td><td>جنوب مغرب</td><td><bdi>790 km</bdi></td></tr>
<tr><td>صنعاء</td><td><bdi>326.28°</bdi></td><td>شمال مغرب</td><td><bdi>815 km</bdi></td></tr>
<tr><td>انقرہ</td><td><bdi>160.17°</bdi></td><td>جنوب</td><td><bdi>2162 km</bdi></td></tr>
<tr><td>ماسکو</td><td><bdi>176.36°</bdi></td><td>جنوب</td><td><bdi>3822 km</bdi></td></tr>
<tr><td>لندن</td><td><bdi>118.99°</bdi></td><td>جنوب مشرق</td><td><bdi>4794 km</bdi></td></tr>
<tr><td>کیپ ٹاؤن</td><td><bdi>23.35°</bdi></td><td>شمال مشرق</td><td><bdi>6558 km</bdi></td></tr>
<tr><td>جکارتہ</td><td><bdi>295.15°</bdi></td><td>شمال مغرب</td><td><bdi>7920 km</bdi></td></tr>
<tr><td>ٹوکیو</td><td><bdi>293.00°</bdi></td><td>شمال مغرب</td><td><bdi>9472 km</bdi></td></tr>
<tr><td>نیو یارک</td><td><bdi>58.48°</bdi></td><td>شمال مشرق</td><td><bdi>10306 km</bdi></td></tr>
<tr><td>ساؤ پالو</td><td><bdi>68.94°</bdi></td><td>مشرق</td><td><bdi>10602 km</bdi></td></tr>
<tr><td>سڈنی</td><td><bdi>277.50°</bdi></td><td>مغرب</td><td><bdi>13236 km</bdi></td></tr>
</tbody></table>`)}
<p><strong>ریاض</strong> اور <strong>صنعاء</strong> پر غور کیجیے: دونوں مکہ کے قریب ہیں، پھر بھی ریاض سے قبلہ جنوب مغرب میں ہے اور صنعاء سے شمال مغرب میں۔ سمت کا انحصار نسبتی مقام پر ہے، فاصلے پر نہیں۔</p>

<h2>تطبیع سے پہلے قیمت کبھی منفی کیوں نکلتی ہے</h2>
<p><code>atan2</code> ایسی قیمت لوٹاتا ہے جو <bdi>−180°</bdi> اور <bdi>180°</bdi> کے درمیان ہوتی ہے۔ چنانچہ <bdi>180°</bdi> سے آگے کی ہر سمت منفی نکلتی ہے، اور اسے 360 جوڑ کر پھر 360 پر باقی لے کر تطبیع کیا جاتا ہے:</p>

${T(`<table>
<thead><tr><th>شہر</th><th>خام نتیجہ</th><th>تطبیع کے بعد</th></tr></thead>
<tbody>
<tr><td>صنعاء</td><td><bdi>−33.72°</bdi></td><td><bdi>326.28°</bdi></td></tr>
<tr><td>جکارتہ</td><td><bdi>−64.85°</bdi></td><td><bdi>295.15°</bdi></td></tr>
<tr><td>ٹوکیو</td><td><bdi>−67.00°</bdi></td><td><bdi>293.00°</bdi></td></tr>
<tr><td>سڈنی</td><td><bdi>−82.50°</bdi></td><td><bdi>277.50°</bdi></td></tr>
<tr><td>ریاض</td><td><bdi>−116.20°</bdi></td><td><bdi>243.80°</bdi></td></tr>
</tbody></table>`)}
<p>یہ سائٹ سمت دو جگہ دکھاتی ہے: نمایاں بیج پر <strong>پورا عدد</strong>، اور تفصیلات کے خانے میں <strong>اعشاریے کے بعد دو ہندسے</strong>۔ دونوں ایک ہی حساب سے آتے ہیں؛ صرف نمائش مختلف ہے۔</p>

<h2>آپ کے آلے کا قطب نما یہ حساب نہیں ہے</h2>
<p>اصل نکتہ یہی ہے۔ اوپر والا عدد <strong>متعین</strong> ہے: وہی کوآرڈینیٹس دیجیے تو ہر بار وہی نتیجہ دے گا۔ آپ کی اسکرین پر ہلتی سوئی آلے کے <strong>سینسرز</strong> سے آتی ہے، اور اس کا برتاؤ خاصا مختلف ہے۔</p>
<h3>دو پلیٹ فارم، دو مختلف راستے</h3>
<p><strong><bdi>iOS</bdi></strong> پر سائٹ وہی سمت براہِ راست استعمال کرتی ہے جو نظام فراہم کرتا ہے۔ <strong><bdi>Android</bdi></strong> پر سمت آلے کے گردشی میٹرکس سے نکالی جاتی ہے، اور اس میں <strong>جھکاؤ</strong> اور <strong>اسکرین کی گردش</strong> کی تلافی شامل ہوتی ہے، تاکہ فون کو ترچھا پکڑنے یا اسکرین گھمانے پر قراءت بہکے نہیں۔</p>
<h3>مطلق اور نسبتی</h3>
<p>براؤزر کے معیارات سمت کی دو طرح کی قراءتوں میں فرق کرتے ہیں: <strong>مطلق</strong>، جو زمین کے حوالہ جاتی نظام سے جڑی ہے، اور <strong>نسبتی</strong>، جس کا حوالہ جاتی نظام <strong>اختیاری</strong> ہوتا ہے — یعنی اس کا «صفر» شمال ہو بھی سکتا ہے اور نہیں بھی۔</p>
<p>اسی لیے یہ سائٹ مطلق قراءت کو ترجیح دیتی ہے، اور ایک بار وہ مل جائے تو بعد کی نسبتی قراءتوں کو <strong>نظر انداز</strong> کر دیتی ہے، تاکہ کوئی اختیاری صفر درست سمت کو خراب نہ کر سکے۔ اگر صرف نسبتی قراءت دستیاب ہو تو سائٹ قطب نما کی کم درستگی کا نوٹس دکھاتی ہے۔ اگر کوئی قراءت بالکل دستیاب نہ ہو تو وہ زندہ سوئی چھپا دیتی ہے اور حساب شدہ سمت ایک ثابت عدد کے طور پر دکھاتی ہے۔</p>
<h3>جغرافیائی شمال اور مقناطیسی شمال</h3>
<p><strong>ریاضیاتی قبلہ سمت جغرافیائی شمال کے حوالے سے ہے</strong>، جبکہ زندہ قطب نما کی سمت آلے کے سینسرز سے آتی ہے اور <strong>مقناطیسی حوالے سے ہو سکتی ہے</strong>۔ ان دونوں کے درمیان کا زاویہ <strong>مقناطیسی انحراف</strong> کہلاتا ہے؛ یہ مقام کے ساتھ بدلتا ہے اور وقت کے ساتھ بھی تبدیل ہوتا رہتا ہے — اسی لیے اس کے عالمی نمونے ہر پانچ سال بعد نظرِ ثانی سے گزرتے ہیں۔</p>
<p><strong><bdi>TimesPrayers</bdi> اس وقت مقناطیسی انحراف کی کوئی الگ تصحیح نافذ نہیں کرتی۔</strong> چنانچہ ہو سکتا ہے سوئی بالکل حساب شدہ عدد پر نہ ٹھہرے۔</p>
<h3>درستگی اعشاریے کے ہندسوں کی تعداد نہیں</h3>
<p><strong>اعشاریے کے ایک ہندسے کے ساتھ دکھائی گئی قیمت کا یہ مطلب نہیں کہ قطب نما کی حقیقی سمت اُسی درجے تک درست ہے</strong>؛ سینسر کی درستگی آلے، اس کے ماحول اور مقناطیسی میدان پر منحصر ہے۔ مقناطیسی پیما اردگرد کی چیزوں سے متاثر ہوتے ہیں: دھاتی اشیاء، اسپیکر، مقناطیسی فون کور، گاڑیاں، اور عمارتوں کے فولادی سریے۔ فون کو آٹھ کی شکل میں گھمانا نظام کو دوبارہ سنبھلنے میں مدد دیتا ہے۔</p>
<p><strong>عملی خلاصہ:</strong> حساب شدہ عدد ثابت حوالہ ہے؛ سوئی اس پر عمل کرنے کا ایک تقریبی آلہ ہے۔</p>

<h2>معمولی انحراف کے بارے میں</h2>
<p>بہت لوگ پوچھتے ہیں کہ اگر وہ حساب شدہ سمت سے ذرا ہٹ جائیں تو کیا ہوگا۔ یہ فقہ کا معاملہ ہے، جسے علما نے ایسی تفصیل کے ساتھ برتا ہے جو ہر شخص کے حالات اور سمت متعین کرنے کی اس کی استطاعت کے مطابق بدلتی ہے۔ ہم حساب اور اس کی حدود پیش کرتے ہیں، اور اس بارے میں کوئی فتویٰ نہیں دیتے؛ اس کے لیے اہلِ علم یا اُس ادارے سے رجوع کیا جاتا ہے جس کی پیروی صارف کرتا ہے۔</p>
`,
sources: `
<h2>مصادر</h2>
<p class="guide-sources-note">اس صفحے کی سمتیں اور فاصلے اُسی مساوات سے نکالے گئے ہیں جو یہ سائٹ استعمال کرتی ہے، ہر شہر کے کوآرڈینیٹس سے۔</p>
<ul>
<li>ابتدائی سمت، <bdi>Haversine</bdi> اور کروی ماڈل پر <bdi>6371 km</bdi> نصف قطر: <a href="https://www.movable-type.co.uk/scripts/latlong.html" rel="nofollow noopener" target="_blank">movable-type.co.uk</a></li>
<li>مطلق سمت کے سینسر کے لیے زمین کا حوالہ جاتی نظام: <a href="https://www.w3.org/TR/orientation-sensor/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-sensor</a></li>
<li>مطلق اور نسبتی قراءتیں اور نمائشی درستگی کی حدود: <a href="https://www.w3.org/TR/orientation-event/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-event</a></li>
<li><code>webkitCompassHeading</code> اور اس کا حوالہ: <bdi>Apple Developer</bdi> دستاویزات</li>
<li>مقناطیسی انحراف اور اس کی تبدیلی: <bdi>World Magnetic Model</bdi> — <a href="https://www.ncei.noaa.gov/products/world-magnetic-model" rel="nofollow noopener" target="_blank">ncei.noaa.gov</a></li>
</ul>

---
`,
related: [
  { href: '/ur/qibla', label: 'سمتِ قبلہ' },
  { href: '/ur/guides/prayer-time-calculation-methods', label: 'اوقاتِ نماز کے حساب کے طریقے اور زاویے' },
],
},
de: {
h1: 'Wie die Qibla-Richtung berechnet wird',
body: `
<p class="guide-intro">Zwei Fragen sehen aus wie eine, sind aber grundverschieden: <strong>In welcher Richtung liegt die Kaaba von hier aus?</strong> und <strong>Wohin zeigt der Kompass meines Telefons gerade?</strong> Die erste hat eine deterministische geometrische Antwort. Die zweite ist ein Sensorwert, den seine Umgebung beeinflusst. Diese Seite erklärt die erste genau — und warum keine die andere ersetzt.</p>

<h2>Die Qibla ist eine Richtung auf einer Kugel, keine Linie auf einer flachen Karte</h2>
<p>Am meisten verwirrt die Vorstellung einer Wandkarte, auf der man die eigene Stadt mit dem Lineal mit Mekka verbindet. Doch die Erde ist nicht flach, und Mercator-Karten verzerren die Richtung mit zunehmender Breite immer stärker.</p>
<p>Die Qibla ist <strong>der kürzeste Weg über die Kugeloberfläche</strong> — ein Großkreisbogen — und die Richtung, die Sie brauchen, ist <strong>der Winkel, unter dem Sie auf diesem Bogen losgehen</strong>.</p>
<p>Deshalb widersprechen die Ergebnisse der Anschauung. Von <strong>New York</strong> aus liegt die Qibla bei <strong>58°</strong>, also nordöstlich statt östlich, obwohl Mekka auf einer flachen Karte südöstlich erscheint. Von <strong>Kapstadt</strong> sind es <strong>23°</strong>, von <strong>Tokio 293°</strong> und von <strong>Jakarta 295°</strong> — bei den letzten beiden also nordwestlich.</p>

<h2>Die verwendete Formel</h2>
<p>Der Anfangskurs des Großkreises zwischen zwei Punkten wird mit der Standardformel berechnet:</p>
<pre class="guide-formula"><code>y = sin(Δλ) · cos(φ₂)
x = cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ)
θ = atan2(y, x)</code></pre>
<p>wobei φ₁ Ihr Breitengrad ist, φ₂ der der Kaaba und Δλ die Längengraddifferenz. Das Ergebnis im Bogenmaß wird in Grad umgerechnet.</p>
<p>Dieser Kurs bezieht sich auf <strong>den geografischen Norden</strong>, denn die Gleichung ist rein geografisch und enthält keinen magnetischen Term. Darauf kommen wir zurück.</p>
<p><strong>Der angezeigte Wert ist der Anfangskurs des Großkreises</strong> von Ihrem Standort zur Kaaba. Würde jemand diese Großkreisroute tatsächlich abfahren, änderte sich der Kurs unterwegs allmählich. Solange Sie bleiben, wo Sie sind, ist der Wert fest.</p>

<h2>Das verwendete Erdmodell</h2>
<p>TimesPrayers verwendet für diese Berechnung ein <strong>sphärisches Erdmodell</strong>. Kurs und Entfernung beruhen daher auf Großkreisgeometrie auf einer Kugel und nicht auf einem komplexeren ellipsoidischen geodätischen Modell.</p>

<h2>Die Koordinaten der Kaaba</h2>
<p>Die von TimesPrayers verwendeten Koordinaten sind <strong>21.4225° N, 39.8262° E</strong>. Es ist ein einziger fester Punkt; das Ergebnis ändert sich also nur, wenn sich Ihre eigene Position ändert.</p>

<h2>Entfernung</h2>
<p>Die Entfernung wird mit der Haversine-Formel auf einer Kugel mit dem Radius <strong>6371 km</strong> berechnet und auf den nächsten Kilometer gerundet angezeigt. Es ist eine <strong>Oberflächenentfernung entlang des Bogens</strong>, keine gerade Linie durch die Erde.</p>

${T(`<table>
<thead><tr><th>Stadt</th><th>Kurs</th><th>Richtung</th><th>Entfernung</th></tr></thead>
<tbody>
<tr><td>Kairo</td><td>136.14°</td><td>Südosten</td><td>1287 km</td></tr>
<tr><td>Riad</td><td>243.80°</td><td>Südwesten</td><td>790 km</td></tr>
<tr><td>Sanaa</td><td>326.28°</td><td>Nordwesten</td><td>815 km</td></tr>
<tr><td>Ankara</td><td>160.17°</td><td>Süden</td><td>2162 km</td></tr>
<tr><td>Moskau</td><td>176.36°</td><td>Süden</td><td>3822 km</td></tr>
<tr><td>London</td><td>118.99°</td><td>Südosten</td><td>4794 km</td></tr>
<tr><td>Kapstadt</td><td>23.35°</td><td>Nordosten</td><td>6558 km</td></tr>
<tr><td>Jakarta</td><td>295.15°</td><td>Nordwesten</td><td>7920 km</td></tr>
<tr><td>Tokio</td><td>293.00°</td><td>Nordwesten</td><td>9472 km</td></tr>
<tr><td>New York</td><td>58.48°</td><td>Nordosten</td><td>10306 km</td></tr>
<tr><td>São Paulo</td><td>68.94°</td><td>Osten</td><td>10602 km</td></tr>
<tr><td>Sydney</td><td>277.50°</td><td>Westen</td><td>13236 km</td></tr>
</tbody></table>`)}
<p>Beachten Sie <strong>Riad</strong> und <strong>Sanaa</strong>: beide liegen nahe bei Mekka, und doch weist die Qibla von Riad nach Südwesten und von Sanaa nach Nordwesten. Der Kurs hängt von der relativen Lage ab, nicht von der Entfernung.</p>

<h2>Warum der Wert vor der Normalisierung manchmal negativ ist</h2>
<p><code>atan2</code> liefert einen Wert zwischen −180° und 180°. Jeder Kurs jenseits von 180° fällt daher negativ aus und wird normalisiert, indem 360 addiert und der Rest modulo 360 genommen wird:</p>

${T(`<table>
<thead><tr><th>Stadt</th><th>Rohergebnis</th><th>Nach der Normalisierung</th></tr></thead>
<tbody>
<tr><td>Sanaa</td><td>−33.72°</td><td>326.28°</td></tr>
<tr><td>Jakarta</td><td>−64.85°</td><td>295.15°</td></tr>
<tr><td>Tokio</td><td>−67.00°</td><td>293.00°</td></tr>
<tr><td>Sydney</td><td>−82.50°</td><td>277.50°</td></tr>
<tr><td>Riad</td><td>−116.20°</td><td>243.80°</td></tr>
</tbody></table>`)}
<p>Diese Website zeigt den Kurs an zwei Stellen: als <strong>ganze Zahl</strong> auf dem sichtbaren Badge und mit <strong>zwei Nachkommastellen</strong> im Detailraster. Beides stammt aus derselben Rechnung; nur die Anzeige unterscheidet sich.</p>

<h2>Der Kompass Ihres Geräts ist nicht diese Berechnung</h2>
<p>Das ist der Kern. Die Zahl oben ist <strong>deterministisch</strong>: Geben Sie dieselben Koordinaten ein, liefert sie jedes Mal dasselbe Ergebnis. Die Nadel, die sich auf Ihrem Bildschirm bewegt, stammt aus den <strong>Sensoren</strong> des Geräts und verhält sich ganz anders.</p>
<h3>Zwei Plattformen, zwei Wege</h3>
<p>Unter <strong>iOS</strong> verwendet die Website die vom System gelieferte Ausrichtung direkt. Unter <strong>Android</strong> wird die Ausrichtung aus der Rotationsmatrix des Geräts abgeleitet, mit Kompensation für <strong>Neigung</strong> und <strong>Bildschirmdrehung</strong>, damit der Wert nicht driftet, wenn Sie das Telefon schräg halten oder den Bildschirm drehen.</p>
<h3>Absolut gegenüber relativ</h3>
<p>Browser-Spezifikationen unterscheiden zwei Arten von Orientierungswerten: <strong>absolut</strong>, bezogen auf das Erdbezugssystem, und <strong>relativ</strong>, dessen Bezugssystem <strong>willkürlich</strong> ist — dessen «Null» also nicht unbedingt Norden ist.</p>
<p>Deshalb bevorzugt diese Website den absoluten Wert und <strong>ignoriert</strong>, sobald sie einen gesehen hat, spätere relative Werte, damit eine willkürliche Null keinen korrekten Kurs verfälschen kann. Ist nur ein relativer Wert verfügbar, zeigt die Website einen Hinweis auf geringe Kompassgenauigkeit. Ist gar kein Wert verfügbar, blendet sie die Live-Nadel aus und zeigt den berechneten Kurs als feste Zahl.</p>
<h3>Geografischer Norden gegenüber magnetischem Norden</h3>
<p><strong>Der mathematische Qibla-Kurs bezieht sich auf den geografischen Norden</strong>, während die Live-Kompassrichtung aus den Gerätesensoren stammt und <strong>magnetisch bezogen sein kann</strong>. Der Winkel zwischen beiden heißt <strong>magnetische Deklination</strong>; sie ist ortsabhängig und ändert sich mit der Zeit — deshalb werden ihre globalen Modelle alle fünf Jahre überarbeitet.</p>
<p><strong>TimesPrayers wendet derzeit keine gesonderte Korrektur der magnetischen Deklination an.</strong> Die Nadel kann daher vom berechneten Wert abweichen.</p>
<h3>Genauigkeit ist nicht die Zahl der Nachkommastellen</h3>
<p><strong>Ein mit einer Nachkommastelle angezeigter Wert bedeutet nicht, dass die tatsächliche Kompassrichtung auf dieses Grad genau ist</strong>; die Sensorgenauigkeit hängt vom Gerät, seiner Umgebung und dem Magnetfeld ab. Magnetometer reagieren empfindlich auf ihre Umgebung: Metallgegenstände, Lautsprecher, magnetische Handyhüllen, Autos und Bewehrungsstahl in Gebäuden. Das Telefon in einer Acht zu bewegen hilft dem System, sich neu zu kalibrieren.</p>
<p><strong>Praktisch heißt das:</strong> Die berechnete Zahl ist die stabile Referenz; die Nadel ist ein Näherungswerkzeug, um danach zu handeln.</p>

<h2>Zur geringen Abweichung</h2>
<p>Viele fragen, was gilt, wenn sie leicht von der berechneten Richtung abweichen. Das ist eine Frage der Rechtswissenschaft, die Gelehrte mit einer Ausführlichkeit behandeln, die von den Umständen und den Möglichkeiten der Richtungsbestimmung abhängt. Wir stellen die Berechnung und ihre Grenzen dar und fällen dazu kein Urteil; das bleibt qualifizierten Gelehrten oder der Institution überlassen, der ein Nutzer folgt.</p>
`,
sources: `
<h2>Quellen</h2>
<p class="guide-sources-note">Die Kurse und Entfernungen auf dieser Seite wurden mit derselben Formel berechnet, die diese Website verwendet, aus den Koordinaten der jeweiligen Stadt.</p>
<ul>
<li>Anfangskurs, Haversine und der Radius von 6371 km auf einem sphärischen Modell: <a href="https://www.movable-type.co.uk/scripts/latlong.html" rel="nofollow noopener" target="_blank">movable-type.co.uk</a></li>
<li>Erdbezugssystem für den absoluten Orientierungssensor: <a href="https://www.w3.org/TR/orientation-sensor/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-sensor</a></li>
<li>Absolute gegenüber relativen Werten und Grenzen der Anzeigepräzision: <a href="https://www.w3.org/TR/orientation-event/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-event</a></li>
<li><code>webkitCompassHeading</code> und sein Bezug: Apple-Developer-Dokumentation</li>
<li>Magnetische Deklination und ihre Veränderung: World Magnetic Model — <a href="https://www.ncei.noaa.gov/products/world-magnetic-model" rel="nofollow noopener" target="_blank">ncei.noaa.gov</a></li>
</ul>

---
`,
related: [
  { href: '/de/qibla', label: 'Qibla-Richtung' },
  { href: '/de/guides/prayer-time-calculation-methods', label: 'Berechnungsmethoden für Gebetszeiten und ihre Winkel' },
],
},
es: {
h1: 'Cómo se calcula la dirección de la Qibla',
body: `
<p class="guide-intro">Dos preguntas parecen una sola y son completamente distintas: <strong>¿en qué dirección queda la Kaaba desde donde estoy?</strong> y <strong>¿hacia dónde apunta ahora mismo la brújula de mi teléfono?</strong> La primera tiene una respuesta geométrica determinista. La segunda es una lectura de sensor afectada por su entorno. Esta página explica la primera con precisión y por qué ninguna sustituye a la otra.</p>

<h2>La Qibla es una dirección sobre una esfera, no una línea en un mapa plano</h2>
<p>Lo que más confunde es imaginar un mapa de pared y unir la propia ciudad con La Meca con una regla. Pero la Tierra no es plana, y los mapas de Mercator distorsionan la dirección cada vez más a medida que aumenta la latitud.</p>
<p>La Qibla es <strong>el camino más corto sobre la superficie de una esfera</strong> —un arco de círculo máximo— y la dirección que necesita es <strong>el ángulo con el que emprende ese arco</strong>.</p>
<p>Por eso los resultados desafían la intuición. Desde <strong>Nueva York</strong> la Qibla está a <strong>58°</strong>, al noreste y no al este, aunque en un mapa plano La Meca aparezca al sureste. Desde <strong>Ciudad del Cabo</strong> está a <strong>23°</strong>, desde <strong>Tokio a 293°</strong> y desde <strong>Yakarta a 295°</strong>: al noroeste en estos dos últimos casos.</p>

<h2>La fórmula utilizada</h2>
<p>El rumbo inicial del círculo máximo entre dos puntos se calcula con la fórmula estándar:</p>
<pre class="guide-formula"><code>y = sin(Δλ) · cos(φ₂)
x = cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ)
θ = atan2(y, x)</code></pre>
<p>donde φ₁ es su latitud, φ₂ la de la Kaaba y Δλ la diferencia de longitud. El resultado en radianes se convierte a grados.</p>
<p>Este rumbo está referido al <strong>norte geográfico</strong>, porque la ecuación es puramente geográfica y no contiene ningún término magnético. Volveremos sobre ello.</p>
<p><strong>El valor mostrado es el rumbo inicial del círculo máximo</strong> desde su ubicación hacia la Kaaba. Si alguien recorriera físicamente esa ruta de círculo máximo, el rumbo iría cambiando poco a poco durante el trayecto. Mientras usted permanezca donde está, el valor es fijo.</p>

<h2>El modelo de Tierra utilizado</h2>
<p>TimesPrayers usa un <strong>modelo esférico de la Tierra</strong> para este cálculo. El rumbo y la distancia se basan, por tanto, en la geometría de círculo máximo sobre una esfera y no en un modelo geodésico elipsoidal más complejo.</p>

<h2>Las coordenadas de la Kaaba</h2>
<p>Las coordenadas que usa TimesPrayers son <strong>21.4225° N, 39.8262° E</strong>. Es un único punto fijo, de modo que el resultado solo cambia cuando cambia su propia posición.</p>

<h2>La distancia</h2>
<p>La distancia se calcula con la fórmula de Haversine sobre una esfera de radio <strong>6371 km</strong> y se muestra redondeada al kilómetro más próximo. Es una <strong>distancia de superficie a lo largo del arco</strong>, no una línea recta a través de la Tierra.</p>

${T(`<table>
<thead><tr><th>Ciudad</th><th>Rumbo</th><th>Dirección</th><th>Distancia</th></tr></thead>
<tbody>
<tr><td>El Cairo</td><td>136.14°</td><td>sureste</td><td>1287 km</td></tr>
<tr><td>Riad</td><td>243.80°</td><td>suroeste</td><td>790 km</td></tr>
<tr><td>Saná</td><td>326.28°</td><td>noroeste</td><td>815 km</td></tr>
<tr><td>Ankara</td><td>160.17°</td><td>sur</td><td>2162 km</td></tr>
<tr><td>Moscú</td><td>176.36°</td><td>sur</td><td>3822 km</td></tr>
<tr><td>Londres</td><td>118.99°</td><td>sureste</td><td>4794 km</td></tr>
<tr><td>Ciudad del Cabo</td><td>23.35°</td><td>noreste</td><td>6558 km</td></tr>
<tr><td>Yakarta</td><td>295.15°</td><td>noroeste</td><td>7920 km</td></tr>
<tr><td>Tokio</td><td>293.00°</td><td>noroeste</td><td>9472 km</td></tr>
<tr><td>Nueva York</td><td>58.48°</td><td>noreste</td><td>10306 km</td></tr>
<tr><td>São Paulo</td><td>68.94°</td><td>este</td><td>10602 km</td></tr>
<tr><td>Sídney</td><td>277.50°</td><td>oeste</td><td>13236 km</td></tr>
</tbody></table>`)}
<p>Fíjese en <strong>Riad</strong> y <strong>Saná</strong>: ambas están cerca de La Meca y, sin embargo, la Qibla desde Riad va al suroeste y desde Saná al noroeste. El rumbo depende de la posición relativa, no de la distancia.</p>

<h2>Por qué el valor a veces es negativo antes de normalizarlo</h2>
<p><code>atan2</code> devuelve un valor entre −180° y 180°. Por eso todo rumbo superior a 180° sale negativo, y se normaliza sumando 360 y tomando el resto módulo 360:</p>

${T(`<table>
<thead><tr><th>Ciudad</th><th>Resultado en bruto</th><th>Tras la normalización</th></tr></thead>
<tbody>
<tr><td>Saná</td><td>−33.72°</td><td>326.28°</td></tr>
<tr><td>Yakarta</td><td>−64.85°</td><td>295.15°</td></tr>
<tr><td>Tokio</td><td>−67.00°</td><td>293.00°</td></tr>
<tr><td>Sídney</td><td>−82.50°</td><td>277.50°</td></tr>
<tr><td>Riad</td><td>−116.20°</td><td>243.80°</td></tr>
</tbody></table>`)}
<p>Este sitio muestra el rumbo en dos lugares: como <strong>número entero</strong> en la insignia visible y con <strong>dos decimales</strong> en la tabla de detalles. Ambos proceden del mismo cálculo; solo cambia la presentación.</p>

<h2>La brújula de su dispositivo no es este cálculo</h2>
<p>Aquí está el meollo. El número anterior es <strong>determinista</strong>: déle las mismas coordenadas y devolverá el mismo resultado siempre. La aguja que se mueve en su pantalla procede de los <strong>sensores</strong> del dispositivo y se comporta de manera bastante distinta.</p>
<h3>Dos vías distintas para dos plataformas</h3>
<p>En <strong>iOS</strong> el sitio usa directamente el rumbo que proporciona el sistema. En <strong>Android</strong> el rumbo se deduce de la matriz de rotación del dispositivo con compensación de la <strong>inclinación</strong> y del <strong>giro de pantalla</strong>, para que la lectura no se desvíe si sostiene el teléfono ladeado o gira la pantalla.</p>
<h3>Absoluta frente a relativa</h3>
<p>Las especificaciones de los navegadores distinguen dos tipos de lectura de orientación: la <strong>absoluta</strong>, referida al marco terrestre, y la <strong>relativa</strong>, cuyo marco de referencia es <strong>arbitrario</strong>, es decir, cuyo «cero» puede no ser el norte.</p>
<p>Por eso este sitio prefiere la lectura absoluta y, en cuanto ha recibido una, <strong>ignora</strong> las lecturas relativas posteriores, para que un cero arbitrario no pueda estropear un rumbo correcto. Si solo hay lectura relativa, el sitio muestra un aviso de baja precisión de la brújula. Si no hay ninguna lectura, oculta la aguja en vivo y muestra el rumbo calculado como un número fijo.</p>
<h3>Norte geográfico frente a norte magnético</h3>
<p><strong>El rumbo matemático de la Qibla está referido al norte geográfico</strong>, mientras que el rumbo de la brújula en vivo procede de los sensores del dispositivo y <strong>puede estar referido al norte magnético</strong>. El ángulo entre ambos se llama <strong>declinación magnética</strong>; varía según el lugar y cambia con el tiempo, y por eso sus modelos globales se revisan cada cinco años.</p>
<p><strong>TimesPrayers no aplica actualmente ninguna corrección específica por declinación magnética.</strong> Por tanto, la aguja puede apartarse del valor calculado.</p>
<h3>La precisión no es el número de decimales</h3>
<p><strong>Que un valor se muestre con un decimal no significa que la dirección real de la brújula sea exacta hasta ese grado</strong>; la precisión del sensor depende del dispositivo, de su entorno y del campo magnético. Los magnetómetros son sensibles a lo que tienen alrededor: objetos metálicos, altavoces, fundas magnéticas, coches y el acero de refuerzo de los edificios. Mover el teléfono dibujando un ocho ayuda al sistema a recalibrarse.</p>
<p><strong>La conclusión práctica:</strong> el número calculado es la referencia estable; la aguja es una herramienta aproximada para actuar en consecuencia.</p>

<h2>Sobre una desviación pequeña</h2>
<p>Mucha gente pregunta qué ocurre si se aparta un poco de la dirección calculada. Es una cuestión de jurisprudencia, que los sabios tratan con un detalle que varía según las circunstancias de cada persona y su capacidad para determinar la dirección. Nosotros presentamos el cálculo y sus límites, y no emitimos ningún dictamen al respecto; eso queda en manos de los sabios cualificados o de la autoridad que siga cada usuario.</p>
`,
sources: `
<h2>Fuentes</h2>
<p class="guide-sources-note">Los rumbos y las distancias de esta página se calcularon con la misma fórmula que usa este sitio, a partir de las coordenadas de cada ciudad.</p>
<ul>
<li>Rumbo inicial, Haversine y el radio de 6371 km sobre un modelo esférico: <a href="https://www.movable-type.co.uk/scripts/latlong.html" rel="nofollow noopener" target="_blank">movable-type.co.uk</a></li>
<li>Marco de referencia terrestre del sensor de orientación absoluta: <a href="https://www.w3.org/TR/orientation-sensor/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-sensor</a></li>
<li>Lecturas absolutas frente a relativas y límites de precisión de presentación: <a href="https://www.w3.org/TR/orientation-event/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-event</a></li>
<li><code>webkitCompassHeading</code> y su referencia: documentación de Apple Developer</li>
<li>La declinación magnética y su variación: World Magnetic Model — <a href="https://www.ncei.noaa.gov/products/world-magnetic-model" rel="nofollow noopener" target="_blank">ncei.noaa.gov</a></li>
</ul>

---
`,
related: [
  { href: '/es/qibla', label: 'Dirección de la Qibla' },
  { href: '/es/guides/prayer-time-calculation-methods', label: 'Métodos de cálculo de los horarios de oración y sus ángulos' },
],
},
id: {
h1: 'Bagaimana Arah Kiblat Dihitung',
body: `
<p class="guide-intro">Dua pertanyaan tampak sama padahal sepenuhnya berbeda: <strong>ke arah mana Kakbah dari tempat saya berada?</strong> dan <strong>ke mana kompas ponsel saya menunjuk saat ini?</strong> Yang pertama punya jawaban geometris yang pasti. Yang kedua adalah pembacaan sensor yang dipengaruhi lingkungannya. Halaman ini menjelaskan yang pertama secara tepat, sekaligus mengapa keduanya tidak saling menggantikan.</p>

<h2>Kiblat adalah arah di permukaan bola, bukan garis di peta datar</h2>
<p>Yang paling membingungkan adalah membayangkan peta dinding lalu menghubungkan kota sendiri ke Makkah dengan penggaris. Padahal Bumi tidak datar, dan peta Mercator makin memelintir arah seiring naiknya lintang.</p>
<p>Kiblat adalah <strong>lintasan terpendek melintasi permukaan bola</strong> — busur lingkaran besar — dan arah yang Anda butuhkan adalah <strong>sudut saat Anda mulai melangkah menyusuri busur itu</strong>.</p>
<p>Karena itulah hasilnya berlawanan dengan intuisi. Dari <strong>New York</strong> kiblatnya <strong>58°</strong>, ke timur laut alih-alih ke timur, padahal di peta datar Makkah tampak di tenggara. Dari <strong>Cape Town</strong> ia <strong>23°</strong>, dari <strong>Tokyo 293°</strong>, dan dari <strong>Jakarta 295°</strong> — ke barat laut untuk dua yang terakhir.</p>

<h2>Rumus yang dipakai</h2>
<p>Bearing awal lingkaran besar antara dua titik dihitung dengan rumus baku:</p>
<pre class="guide-formula"><code>y = sin(Δλ) · cos(φ₂)
x = cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ)
θ = atan2(y, x)</code></pre>
<p>dengan φ₁ adalah lintang Anda, φ₂ lintang Kakbah, dan Δλ selisih bujur. Hasil dalam radian diubah menjadi derajat.</p>
<p>Bearing ini mengacu pada <strong>utara geografis</strong>, sebab persamaannya murni geografis dan tidak memuat suku magnetis apa pun. Kita akan kembali ke soal itu.</p>
<p><strong>Nilai yang ditampilkan adalah bearing awal lingkaran besar</strong> dari lokasi Anda menuju Kakbah. Kalau seseorang benar-benar menempuh rute lingkaran besar itu, arah hadapnya akan berubah berangsur sepanjang perjalanan. Selama Anda tetap di tempat, nilainya tidak berubah.</p>

<h2>Model Bumi yang dipakai</h2>
<p>TimesPrayers memakai <strong>model Bumi bulat (sferis)</strong> untuk perhitungan ini. Karena itu bearing dan jaraknya berbasis geometri lingkaran besar pada bola, bukan model geodesik elipsoid yang lebih rumit.</p>

<h2>Koordinat Kakbah</h2>
<p>Koordinat yang dipakai TimesPrayers adalah <strong>21.4225° N, 39.8262° E</strong>. Ini satu titik tetap, sehingga hasilnya berubah hanya ketika posisi Anda sendiri berubah.</p>

<h2>Jarak</h2>
<p>Jarak dihitung dengan rumus Haversine pada bola berjari-jari <strong>6371 km</strong> dan ditampilkan dibulatkan ke kilometer terdekat. Ini <strong>jarak permukaan menyusuri busur</strong>, bukan garis lurus menembus Bumi.</p>

${T(`<table>
<thead><tr><th>Kota</th><th>Bearing</th><th>Arah</th><th>Jarak</th></tr></thead>
<tbody>
<tr><td>Kairo</td><td>136.14°</td><td>tenggara</td><td>1287 km</td></tr>
<tr><td>Riyadh</td><td>243.80°</td><td>barat daya</td><td>790 km</td></tr>
<tr><td>Sanaa</td><td>326.28°</td><td>barat laut</td><td>815 km</td></tr>
<tr><td>Ankara</td><td>160.17°</td><td>selatan</td><td>2162 km</td></tr>
<tr><td>Moskow</td><td>176.36°</td><td>selatan</td><td>3822 km</td></tr>
<tr><td>London</td><td>118.99°</td><td>tenggara</td><td>4794 km</td></tr>
<tr><td>Cape Town</td><td>23.35°</td><td>timur laut</td><td>6558 km</td></tr>
<tr><td>Jakarta</td><td>295.15°</td><td>barat laut</td><td>7920 km</td></tr>
<tr><td>Tokyo</td><td>293.00°</td><td>barat laut</td><td>9472 km</td></tr>
<tr><td>New York</td><td>58.48°</td><td>timur laut</td><td>10306 km</td></tr>
<tr><td>São Paulo</td><td>68.94°</td><td>timur</td><td>10602 km</td></tr>
<tr><td>Sydney</td><td>277.50°</td><td>barat</td><td>13236 km</td></tr>
</tbody></table>`)}
<p>Perhatikan <strong>Riyadh</strong> dan <strong>Sanaa</strong>: keduanya dekat dengan Makkah, namun kiblat dari Riyadh ke barat daya sedangkan dari Sanaa ke barat laut. Bearing bergantung pada posisi relatif, bukan pada jarak.</p>

<h2>Mengapa nilainya kadang negatif sebelum dinormalkan</h2>
<p><code>atan2</code> mengembalikan nilai antara −180° dan 180°. Karena itu setiap bearing di atas 180° keluar sebagai negatif, lalu dinormalkan dengan menambahkan 360 dan mengambil sisanya modulo 360:</p>

${T(`<table>
<thead><tr><th>Kota</th><th>Hasil mentah</th><th>Setelah normalisasi</th></tr></thead>
<tbody>
<tr><td>Sanaa</td><td>−33.72°</td><td>326.28°</td></tr>
<tr><td>Jakarta</td><td>−64.85°</td><td>295.15°</td></tr>
<tr><td>Tokyo</td><td>−67.00°</td><td>293.00°</td></tr>
<tr><td>Sydney</td><td>−82.50°</td><td>277.50°</td></tr>
<tr><td>Riyadh</td><td>−116.20°</td><td>243.80°</td></tr>
</tbody></table>`)}
<p>Situs ini menampilkan bearing di dua tempat: <strong>bilangan bulat</strong> pada lencana yang terlihat, dan <strong>dua angka desimal</strong> pada kisi rincian. Keduanya berasal dari perhitungan yang sama; hanya tampilannya yang berbeda.</p>

<h2>Kompas perangkat Anda bukan perhitungan ini</h2>
<p>Di sinilah intinya. Angka di atas bersifat <strong>pasti</strong>: beri koordinat yang sama, ia mengembalikan hasil yang sama setiap kali. Jarum yang bergerak di layar Anda berasal dari <strong>sensor</strong> perangkat, dan perilakunya cukup berbeda.</p>
<h3>Dua jalur berbeda untuk dua platform</h3>
<p>Di <strong>iOS</strong>, situs ini langsung memakai arah hadap yang disediakan sistem. Di <strong>Android</strong>, arah hadap diturunkan dari matriks rotasi perangkat dengan kompensasi <strong>kemiringan</strong> dan <strong>rotasi layar</strong>, supaya pembacaannya tidak melenceng saat Anda memegang ponsel miring atau memutar layar.</p>
<h3>Absolut versus relatif</h3>
<p>Spesifikasi peramban membedakan dua jenis pembacaan orientasi: <strong>absolut</strong>, yang mengacu pada kerangka Bumi, dan <strong>relatif</strong>, yang kerangka acuannya <strong>sembarang</strong> — artinya «nol»-nya belum tentu utara.</p>
<p>Karena itu situs ini mengutamakan pembacaan absolut, dan begitu ia mendapatkannya, pembacaan relatif berikutnya <strong>diabaikan</strong>, supaya nol yang sembarang tidak merusak arah hadap yang sudah benar. Kalau hanya pembacaan relatif yang tersedia, situs menampilkan pemberitahuan akurasi kompas rendah. Kalau tidak ada pembacaan sama sekali, jarum langsungnya disembunyikan dan bearing hasil perhitungan ditampilkan sebagai angka tetap.</p>
<h3>Utara geografis versus utara magnetis</h3>
<p><strong>Bearing kiblat matematis mengacu pada utara geografis</strong>, sedangkan arah hadap kompas langsung berasal dari sensor perangkat dan <strong>bisa saja mengacu pada utara magnetis</strong>. Sudut antara keduanya disebut <strong>deklinasi magnetik</strong>; besarnya berbeda menurut lokasi dan berubah seiring waktu — itulah sebabnya model globalnya ditinjau setiap lima tahun.</p>
<p><strong>TimesPrayers saat ini tidak menerapkan koreksi deklinasi magnetik tersendiri.</strong> Jadi jarumnya bisa saja tidak berhenti persis di angka hasil perhitungan.</p>
<h3>Akurasi bukan banyaknya angka desimal</h3>
<p><strong>Nilai yang ditampilkan sampai satu angka desimal tidak berarti arah kompas yang sebenarnya akurat sampai derajat itu</strong>; akurasi sensor bergantung pada perangkat, lingkungannya, dan medan magnet. Magnetometer peka terhadap benda di sekitarnya: benda logam, pengeras suara, casing ponsel bermagnet, mobil, dan tulangan baja di gedung. Menggerakkan ponsel membentuk angka delapan membantu sistem melakukan kalibrasi ulang.</p>
<p><strong>Kesimpulan praktisnya:</strong> angka hasil perhitungan adalah acuan yang stabil; jarum adalah alat pendekatan untuk menindaklanjutinya.</p>

<h2>Tentang penyimpangan kecil</h2>
<p>Banyak yang bertanya bagaimana kalau mereka sedikit meleset dari arah yang dihitung. Itu perkara fikih, yang dibahas para ulama dengan rincian yang berbeda-beda menurut keadaan seseorang dan kemampuannya menentukan arah. Kami menyajikan perhitungan beserta batasnya, dan tidak mengeluarkan hukum apa pun tentangnya; hal itu dikembalikan kepada ulama yang berkompeten atau kepada otoritas yang diikuti pengguna.</p>
`,
sources: `
<h2>Sumber</h2>
<p class="guide-sources-note">Bearing dan jarak di halaman ini dihitung dengan rumus yang sama yang dipakai situs ini, dari koordinat masing-masing kota.</p>
<ul>
<li>Bearing awal, Haversine, dan jari-jari 6371 km pada model bola: <a href="https://www.movable-type.co.uk/scripts/latlong.html" rel="nofollow noopener" target="_blank">movable-type.co.uk</a></li>
<li>Kerangka acuan Bumi untuk sensor orientasi absolut: <a href="https://www.w3.org/TR/orientation-sensor/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-sensor</a></li>
<li>Pembacaan absolut versus relatif dan batas presisi tampilan: <a href="https://www.w3.org/TR/orientation-event/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-event</a></li>
<li><code>webkitCompassHeading</code> dan acuannya: dokumentasi Apple Developer</li>
<li>Deklinasi magnetik dan perubahannya: World Magnetic Model — <a href="https://www.ncei.noaa.gov/products/world-magnetic-model" rel="nofollow noopener" target="_blank">ncei.noaa.gov</a></li>
</ul>

---
`,
related: [
  { href: '/id/qibla', label: 'Arah Kiblat' },
  { href: '/id/guides/prayer-time-calculation-methods', label: 'Metode Perhitungan Jadwal Sholat dan Sudutnya' },
],
},
bn: {
h1: 'কিবলার দিক কীভাবে গণনা করা হয়',
body: `
<p class="guide-intro">দুটি প্রশ্ন দেখতে এক মনে হলেও সম্পূর্ণ আলাদা: <strong>আমি যেখানে আছি সেখান থেকে কাবা কোন দিকে?</strong> আর <strong>এই মুহূর্তে আমার ফোনের কম্পাস কোথায় নির্দেশ করছে?</strong> প্রথমটির উত্তর সুনির্দিষ্ট ও জ্যামিতিক। দ্বিতীয়টি একটি সেন্সর-পাঠ, যা তার চারপাশ দ্বারা প্রভাবিত হয়। এই পৃষ্ঠাটি প্রথমটি নির্ভুলভাবে ব্যাখ্যা করে, এবং দেখায় কেন একটি অন্যটির বিকল্প নয়।</p>

<h2>কিবলা গোলকের পৃষ্ঠে একটি দিক, সমতল মানচিত্রে একটি রেখা নয়</h2>
<p>সবচেয়ে বেশি বিভ্রান্তি তৈরি হয় দেয়ালের মানচিত্র কল্পনা করে নিজের শহরকে মক্কার সঙ্গে স্কেল দিয়ে জুড়ে দেওয়ায়। কিন্তু পৃথিবী সমতল নয়, আর মার্কেটর মানচিত্র অক্ষাংশ বাড়ার সঙ্গে সঙ্গে দিককে ক্রমেই বিকৃত করে।</p>
<p>কিবলা হলো <strong>গোলকের পৃষ্ঠ ধরে সংক্ষিপ্ততম পথ</strong> — একটি মহাবৃত্তীয় চাপ — এবং আপনার যে দিকটি দরকার তা হলো <strong>সেই কোণ, যেটিতে আপনি ওই চাপ ধরে যাত্রা শুরু করেন</strong>।</p>
<p>এ কারণেই ফলাফল সহজবোধ্যতাকে হার মানায়। <strong>নিউ ইয়র্ক</strong> থেকে কিবলা <strong>58°</strong>, অর্থাৎ পূর্ব নয় বরং উত্তর-পূর্ব, যদিও সমতল মানচিত্রে মক্কা দক্ষিণ-পূর্বে পড়ে। <strong>কেপ টাউন</strong> থেকে এটি <strong>23°</strong>, <strong>টোকিও থেকে 293°</strong> এবং <strong>জাকার্তা থেকে 295°</strong> — শেষ দুটিতে উত্তর-পশ্চিম।</p>

<h2>ব্যবহৃত সূত্র</h2>
<p>দুটি বিন্দুর মধ্যবর্তী মহাবৃত্তের প্রাথমিক দিকমাত্রা আদর্শ সূত্র দিয়ে গণনা করা হয়:</p>
<pre class="guide-formula"><code>y = sin(Δλ) · cos(φ₂)
x = cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ)
θ = atan2(y, x)</code></pre>
<p>এখানে φ₁ আপনার অক্ষাংশ, φ₂ কাবার, এবং Δλ দ্রাঘিমাংশের পার্থক্য। রেডিয়ানে পাওয়া ফল ডিগ্রিতে রূপান্তরিত হয়।</p>
<p>এই দিকমাত্রা <strong>ভৌগোলিক উত্তরের</strong> সাপেক্ষে, কারণ সমীকরণটি বিশুদ্ধভাবে ভৌগোলিক এবং তাতে কোনো চৌম্বক পদ নেই। আমরা এ প্রসঙ্গে ফিরে আসব।</p>
<p><strong>প্রদর্শিত মানটি আপনার অবস্থান থেকে কাবার দিকে মহাবৃত্তের প্রাথমিক দিকমাত্রা।</strong> কেউ যদি সত্যিই সেই মহাবৃত্তীয় পথ ধরে যাত্রা করেন, যাত্রাপথে দিকমাত্রা ক্রমশ বদলাতে থাকবে। আপনি যতক্ষণ নিজের জায়গায় আছেন, মানটি স্থির।</p>

<h2>ব্যবহৃত পৃথিবী-মডেল</h2>
<p>TimesPrayers এই গণনার জন্য একটি <strong>গোলকীয় পৃথিবী মডেল</strong> ব্যবহার করে। তাই দিকমাত্রা ও দূরত্ব গোলকের উপর মহাবৃত্তীয় জ্যামিতিভিত্তিক, কোনো জটিলতর উপবৃত্তীয় জিওডেসিক মডেলভিত্তিক নয়।</p>

<h2>কাবার স্থানাঙ্ক</h2>
<p>TimesPrayers যে স্থানাঙ্ক ব্যবহার করে তা হলো <strong>21.4225° N, 39.8262° E</strong>। এটি একটিমাত্র স্থির বিন্দু, তাই ফলাফল কেবল তখনই বদলায় যখন আপনার নিজের অবস্থান বদলায়।</p>

<h2>দূরত্ব</h2>
<p>দূরত্ব গণনা করা হয় Haversine সূত্র দিয়ে, <strong>6371 km</strong> ব্যাসার্ধের একটি গোলকের উপর, এবং নিকটতম কিলোমিটারে রাউন্ড করে দেখানো হয়। এটি <strong>চাপ ধরে পৃষ্ঠতলীয় দূরত্ব</strong>, পৃথিবীর ভেতর দিয়ে সরলরেখা নয়।</p>

${T(`<table>
<thead><tr><th>শহর</th><th>দিকমাত্রা</th><th>দিক</th><th>দূরত্ব</th></tr></thead>
<tbody>
<tr><td>কায়রো</td><td>136.14°</td><td>দক্ষিণ-পূর্ব</td><td>1287 km</td></tr>
<tr><td>রিয়াদ</td><td>243.80°</td><td>দক্ষিণ-পশ্চিম</td><td>790 km</td></tr>
<tr><td>সানা</td><td>326.28°</td><td>উত্তর-পশ্চিম</td><td>815 km</td></tr>
<tr><td>আঙ্কারা</td><td>160.17°</td><td>দক্ষিণ</td><td>2162 km</td></tr>
<tr><td>মস্কো</td><td>176.36°</td><td>দক্ষিণ</td><td>3822 km</td></tr>
<tr><td>লন্ডন</td><td>118.99°</td><td>দক্ষিণ-পূর্ব</td><td>4794 km</td></tr>
<tr><td>কেপ টাউন</td><td>23.35°</td><td>উত্তর-পূর্ব</td><td>6558 km</td></tr>
<tr><td>জাকার্তা</td><td>295.15°</td><td>উত্তর-পশ্চিম</td><td>7920 km</td></tr>
<tr><td>টোকিও</td><td>293.00°</td><td>উত্তর-পশ্চিম</td><td>9472 km</td></tr>
<tr><td>নিউ ইয়র্ক</td><td>58.48°</td><td>উত্তর-পূর্ব</td><td>10306 km</td></tr>
<tr><td>সাও পাওলো</td><td>68.94°</td><td>পূর্ব</td><td>10602 km</td></tr>
<tr><td>সিডনি</td><td>277.50°</td><td>পশ্চিম</td><td>13236 km</td></tr>
</tbody></table>`)}
<p><strong>রিয়াদ</strong> ও <strong>সানা</strong> লক্ষ করুন: দুটোই মক্কার কাছে, তবু রিয়াদ থেকে কিবলা দক্ষিণ-পশ্চিমে আর সানা থেকে উত্তর-পশ্চিমে। দিকমাত্রা নির্ভর করে আপেক্ষিক অবস্থানের উপর, দূরত্বের উপর নয়।</p>

<h2>প্রমিতকরণের আগে মান কখনও ঋণাত্মক হয় কেন</h2>
<p><code>atan2</code> −180° থেকে 180°-এর মধ্যে একটি মান ফেরত দেয়। তাই 180°-এর বেশি যেকোনো দিকমাত্রা ঋণাত্মক হয়ে বেরোয়, এবং 360 যোগ করে তারপর 360 দিয়ে ভাগশেষ নিয়ে তা প্রমিত করা হয়:</p>

${T(`<table>
<thead><tr><th>শহর</th><th>কাঁচা ফল</th><th>প্রমিতকরণের পরে</th></tr></thead>
<tbody>
<tr><td>সানা</td><td>−33.72°</td><td>326.28°</td></tr>
<tr><td>জাকার্তা</td><td>−64.85°</td><td>295.15°</td></tr>
<tr><td>টোকিও</td><td>−67.00°</td><td>293.00°</td></tr>
<tr><td>সিডনি</td><td>−82.50°</td><td>277.50°</td></tr>
<tr><td>রিয়াদ</td><td>−116.20°</td><td>243.80°</td></tr>
</tbody></table>`)}
<p>এই সাইট দিকমাত্রা দুই জায়গায় দেখায়: দৃশ্যমান ব্যাজে <strong>পূর্ণসংখ্যা</strong>, আর বিস্তারিত ছকে <strong>দশমিকের পরে দুই ঘর</strong>। দুটোই একই গণনা থেকে আসে; কেবল প্রদর্শন আলাদা।</p>

<h2>আপনার ডিভাইসের কম্পাস এই গণনা নয়</h2>
<p>মূল কথাটি এখানেই। উপরের সংখ্যাটি <strong>সুনির্দিষ্ট</strong>: একই স্থানাঙ্ক দিন, প্রতিবারই একই ফল দেবে। আপনার পর্দায় নড়তে থাকা কাঁটাটি আসে ডিভাইসের <strong>সেন্সর</strong> থেকে, আর তার আচরণ বেশ ভিন্ন।</p>
<h3>দুই প্ল্যাটফর্মে দুটি ভিন্ন পথ</h3>
<p><strong>iOS</strong>-এ সাইটটি সিস্টেমের দেওয়া দিকমাত্রা সরাসরি ব্যবহার করে। <strong>Android</strong>-এ দিকমাত্রা নির্ণীত হয় ডিভাইসের ঘূর্ণন ম্যাট্রিক্স থেকে, এবং তাতে <strong>হেলানো</strong> ও <strong>পর্দার ঘূর্ণনের</strong> ক্ষতিপূরণ যুক্ত থাকে, যাতে ফোন কাত করে ধরলে বা পর্দা ঘোরালে পাঠ বিচ্যুত না হয়।</p>
<h3>পরম বনাম আপেক্ষিক</h3>
<p>ব্রাউজারের মানদণ্ড দিকনির্ণয়ের দুই ধরনের পাঠকে আলাদা করে: <strong>পরম</strong>, যা পৃথিবীর প্রসঙ্গকাঠামোর সাপেক্ষে, এবং <strong>আপেক্ষিক</strong>, যার প্রসঙ্গকাঠামো <strong>ইচ্ছাধীন</strong> — অর্থাৎ তা কোনো নির্দিষ্ট উত্তর-প্রসঙ্গের সঙ্গে বাঁধা নয়, তাই তার «শূন্য» উত্তর নাও হতে পারে।</p>
<p>তাই এই সাইট পরম পাঠকে অগ্রাধিকার দেয়, এবং একবার তা পেয়ে গেলে পরবর্তী আপেক্ষিক পাঠ <strong>উপেক্ষা</strong> করে, যাতে কোনো ইচ্ছাধীন শূন্য একটি সঠিক দিকমাত্রাকে নষ্ট করতে না পারে। কেবল আপেক্ষিক পাঠ পাওয়া গেলে সাইটটি কম্পাসের নিম্ন নির্ভুলতার একটি নোটিশ দেখায়। কোনো পাঠই না মিললে জীবন্ত কাঁটা লুকিয়ে গণনা করা দিকমাত্রা একটি স্থির সংখ্যা হিসেবে দেখায়।</p>
<h3>ভৌগোলিক উত্তর বনাম চৌম্বক উত্তর</h3>
<p><strong>গাণিতিক কিবলা দিকমাত্রা ভৌগোলিক উত্তরের সাপেক্ষে</strong>, অথচ জীবন্ত কম্পাসের দিকমাত্রা আসে ডিভাইসের সেন্সর থেকে এবং তা <strong>চৌম্বক সাপেক্ষ হতে পারে</strong>। এই দুইয়ের মধ্যবর্তী কোণকে বলা হয় <strong>চৌম্বক বিচ্যুতি</strong>; এটি স্থানভেদে বদলায় এবং সময়ের সঙ্গেও পরিবর্তিত হয় — এ কারণেই এর বৈশ্বিক মডেলগুলো প্রতি পাঁচ বছরে সংশোধিত হয়।</p>
<p><strong>TimesPrayers বর্তমানে চৌম্বক বিচ্যুতির আলাদা কোনো সংশোধন প্রয়োগ করে না।</strong> তাই কাঁটাটি গণনা করা সংখ্যার ঠিক উপরে নাও থামতে পারে।</p>
<h3>নির্ভুলতা মানে দশমিক ঘরের সংখ্যা নয়</h3>
<p><strong>দশমিকের এক ঘর পর্যন্ত দেখানো মান এই অর্থ বহন করে না যে কম্পাসের প্রকৃত দিক ওই ডিগ্রি পর্যন্ত নির্ভুল</strong>; সেন্সরের নির্ভুলতা নির্ভর করে ডিভাইস, তার পরিপার্শ্ব ও চৌম্বক ক্ষেত্রের উপর। ম্যাগনেটোমিটার আশপাশের জিনিসে সংবেদনশীল: ধাতব বস্তু, স্পিকার, চৌম্বক ফোন কভার, গাড়ি, এবং ভবনের ইস্পাতের রড। ফোনটি ইংরেজি আট-এর মতো করে ঘোরালে সিস্টেমকে পুনরায় ক্যালিব্রেট হতে সাহায্য করে।</p>
<p><strong>ব্যবহারিক সারকথা:</strong> গণনা করা সংখ্যাটি স্থির রেফারেন্স; কাঁটাটি তার উপর কাজ করার একটি আনুমানিক হাতিয়ার।</p>

<h2>সামান্য বিচ্যুতি প্রসঙ্গে</h2>
<p>অনেকেই জিজ্ঞাসা করেন, গণনা করা দিক থেকে সামান্য সরে গেলে কী হয়। এটি ফিকহের বিষয়, যা আলেমগণ এমন বিস্তারিতভাবে আলোচনা করেছেন যা ব্যক্তির পরিস্থিতি ও দিক নির্ণয়ের সামর্থ্য অনুসারে ভিন্ন হয়। আমরা গণনা ও তার সীমা তুলে ধরি, এ বিষয়ে কোনো ফতোয়া দিই না; তা যোগ্য আলেম বা ব্যবহারকারী যে কর্তৃপক্ষ অনুসরণ করেন তাঁদের উপর ন্যস্ত।</p>
`,
sources: `
<h2>সূত্র</h2>
<p class="guide-sources-note">এই পৃষ্ঠার দিকমাত্রা ও দূরত্ব এই সাইট যে সূত্র ব্যবহার করে সেটি দিয়েই, প্রতিটি শহরের স্থানাঙ্ক থেকে গণনা করা হয়েছে।</p>
<ul>
<li>প্রাথমিক দিকমাত্রা, Haversine এবং গোলকীয় মডেলে 6371 km ব্যাসার্ধ: <a href="https://www.movable-type.co.uk/scripts/latlong.html" rel="nofollow noopener" target="_blank">movable-type.co.uk</a></li>
<li>পরম দিকনির্ণয় সেন্সরের জন্য পৃথিবীর প্রসঙ্গকাঠামো: <a href="https://www.w3.org/TR/orientation-sensor/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-sensor</a></li>
<li>পরম ও আপেক্ষিক পাঠ এবং প্রদর্শন-নির্ভুলতার সীমা: <a href="https://www.w3.org/TR/orientation-event/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-event</a></li>
<li><code>webkitCompassHeading</code> এবং তার প্রসঙ্গকাঠামো: Apple Developer নথিপত্র</li>
<li>চৌম্বক বিচ্যুতি ও তার পরিবর্তন: World Magnetic Model — <a href="https://www.ncei.noaa.gov/products/world-magnetic-model" rel="nofollow noopener" target="_blank">ncei.noaa.gov</a></li>
</ul>

---
`,
related: [
  { href: '/bn/qibla', label: 'কিবলার দিক' },
  { href: '/bn/guides/prayer-time-calculation-methods', label: 'নামাজের সময় গণনার পদ্ধতি ও কোণ' },
],
},
ms: {
h1: 'Bagaimana Arah Kiblat Dikira',
body: `
<p class="guide-intro">Dua soalan kelihatan satu tetapi sebenarnya berlainan sama sekali: <strong>di arah mana Kaabah dari tempat saya berada?</strong> dan <strong>ke mana kompas telefon saya menunjuk sekarang?</strong> Yang pertama mempunyai jawapan geometri yang pasti. Yang kedua ialah bacaan penderia yang dipengaruhi persekitarannya. Halaman ini menerangkan yang pertama dengan tepat, dan mengapa satu tidak menggantikan satu lagi.</p>

<h2>Kiblat ialah arah pada permukaan sfera, bukan garis pada peta rata</h2>
<p>Yang paling mengelirukan ialah membayangkan peta dinding lalu menyambungkan bandar sendiri ke Makkah dengan pembaris. Tetapi Bumi tidak rata, dan peta Mercator memesongkan arah semakin banyak apabila latitud meningkat.</p>
<p>Kiblat ialah <strong>laluan terpendek merentas permukaan sfera</strong> — lengkok bulatan agung — dan arah yang anda perlukan ialah <strong>sudut anda memulakan perjalanan di sepanjang lengkok itu</strong>.</p>
<p>Sebab itulah hasilnya melawan gerak hati. Dari <strong>New York</strong> kiblatnya <strong>58°</strong>, ke timur laut dan bukan ke timur, walaupun Makkah kelihatan di tenggara pada peta rata. Dari <strong>Cape Town</strong> ia <strong>23°</strong>, dari <strong>Tokyo 293°</strong> dan dari <strong>Jakarta 295°</strong> — ke barat laut bagi dua yang terakhir.</p>

<h2>Formula yang digunakan</h2>
<p>Bearing awal bulatan agung antara dua titik dikira dengan formula piawai:</p>
<pre class="guide-formula"><code>y = sin(Δλ) · cos(φ₂)
x = cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ)
θ = atan2(y, x)</code></pre>
<p>di mana φ₁ ialah latitud anda, φ₂ latitud Kaabah, dan Δλ beza longitud. Hasil dalam radian ditukar kepada darjah.</p>
<p>Bearing ini dirujuk kepada <strong>utara geografi</strong>, kerana persamaannya geografi semata-mata dan tidak mengandungi sebarang sebutan magnet. Kita akan kembali kepada hal itu.</p>
<p><strong>Nilai yang dipaparkan ialah bearing awal bulatan agung</strong> dari lokasi anda menuju Kaabah. Jika seseorang benar-benar mengembara di sepanjang laluan bulatan agung itu, haluannya akan berubah beransur sepanjang perjalanan. Selagi anda kekal di tempat anda, nilainya tetap.</p>

<h2>Model Bumi yang digunakan</h2>
<p>TimesPrayers menggunakan <strong>model Bumi sfera</strong> bagi pengiraan ini. Justeru bearing dan jarak berasaskan geometri bulatan agung pada sfera, bukan model geodesik elipsoid yang lebih rumit.</p>

<h2>Koordinat Kaabah</h2>
<p>Koordinat yang digunakan oleh TimesPrayers ialah <strong>21.4225° N, 39.8262° E</strong>. Ia satu titik tetap sahaja, jadi hasilnya berubah hanya apabila kedudukan anda sendiri berubah.</p>

<h2>Jarak</h2>
<p>Jarak dikira dengan formula Haversine pada sfera berjejari <strong>6371 km</strong> dan dipaparkan dibundarkan ke kilometer terdekat. Ia <strong>jarak permukaan di sepanjang lengkok</strong>, bukan garis lurus menembusi Bumi.</p>

${T(`<table>
<thead><tr><th>Bandar</th><th>Bearing</th><th>Arah</th><th>Jarak</th></tr></thead>
<tbody>
<tr><td>Kaherah</td><td>136.14°</td><td>tenggara</td><td>1287 km</td></tr>
<tr><td>Riyadh</td><td>243.80°</td><td>barat daya</td><td>790 km</td></tr>
<tr><td>Sanaa</td><td>326.28°</td><td>barat laut</td><td>815 km</td></tr>
<tr><td>Ankara</td><td>160.17°</td><td>selatan</td><td>2162 km</td></tr>
<tr><td>Moscow</td><td>176.36°</td><td>selatan</td><td>3822 km</td></tr>
<tr><td>London</td><td>118.99°</td><td>tenggara</td><td>4794 km</td></tr>
<tr><td>Cape Town</td><td>23.35°</td><td>timur laut</td><td>6558 km</td></tr>
<tr><td>Jakarta</td><td>295.15°</td><td>barat laut</td><td>7920 km</td></tr>
<tr><td>Tokyo</td><td>293.00°</td><td>barat laut</td><td>9472 km</td></tr>
<tr><td>New York</td><td>58.48°</td><td>timur laut</td><td>10306 km</td></tr>
<tr><td>São Paulo</td><td>68.94°</td><td>timur</td><td>10602 km</td></tr>
<tr><td>Sydney</td><td>277.50°</td><td>barat</td><td>13236 km</td></tr>
</tbody></table>`)}
<p>Perhatikan <strong>Riyadh</strong> dan <strong>Sanaa</strong>: kedua-duanya dekat dengan Makkah, namun kiblat dari Riyadh ke barat daya dan dari Sanaa ke barat laut. Bearing bergantung pada kedudukan relatif, bukan pada jarak.</p>

<h2>Mengapa nilainya kadangkala negatif sebelum penormalan</h2>
<p><code>atan2</code> memulangkan nilai antara −180° dan 180°. Justeru mana-mana bearing melebihi 180° keluar sebagai negatif, dan dinormalkan dengan menambah 360 lalu mengambil bakinya modulo 360:</p>

${T(`<table>
<thead><tr><th>Bandar</th><th>Hasil mentah</th><th>Selepas penormalan</th></tr></thead>
<tbody>
<tr><td>Sanaa</td><td>−33.72°</td><td>326.28°</td></tr>
<tr><td>Jakarta</td><td>−64.85°</td><td>295.15°</td></tr>
<tr><td>Tokyo</td><td>−67.00°</td><td>293.00°</td></tr>
<tr><td>Sydney</td><td>−82.50°</td><td>277.50°</td></tr>
<tr><td>Riyadh</td><td>−116.20°</td><td>243.80°</td></tr>
</tbody></table>`)}
<p>Laman ini memaparkan bearing di dua tempat: <strong>nombor bulat</strong> pada lencana yang kelihatan, dan <strong>dua tempat perpuluhan</strong> dalam grid perincian. Kedua-duanya datang daripada pengiraan yang sama; hanya paparannya berbeza.</p>

<h2>Kompas peranti anda bukan pengiraan ini</h2>
<p>Inilah intinya. Nombor di atas bersifat <strong>pasti</strong>: beri koordinat yang sama, ia memulangkan hasil yang sama setiap kali. Jarum yang bergerak pada skrin anda datang daripada <strong>penderia</strong> peranti, dan kelakuannya agak berbeza.</p>
<h3>Dua laluan berbeza bagi dua platform</h3>
<p>Pada <strong>iOS</strong>, laman ini menggunakan haluan yang diberikan sistem secara terus. Pada <strong>Android</strong>, haluan diterbitkan daripada matriks putaran peranti dengan pampasan bagi <strong>kecondongan</strong> dan <strong>putaran skrin</strong>, supaya bacaannya tidak terpesong apabila anda memegang telefon secara senget atau memutar skrin.</p>
<h3>Mutlak berbanding relatif</h3>
<p>Spesifikasi pelayar membezakan dua jenis bacaan orientasi: <strong>mutlak</strong>, yang merujuk kepada kerangka Bumi, dan <strong>relatif</strong>, yang kerangka rujukannya <strong>sewenang-wenangnya</strong> — bermakna «sifar»nya belum tentu utara.</p>
<p>Justeru laman ini mengutamakan bacaan mutlak, dan setelah ia menerima satu, ia <strong>mengabaikan</strong> bacaan relatif berikutnya, supaya sifar yang sewenang-wenangnya tidak boleh merosakkan haluan yang betul. Jika hanya bacaan relatif tersedia, laman ini memaparkan notis ketepatan kompas yang rendah. Jika tiada bacaan langsung, ia menyembunyikan jarum langsung dan memaparkan bearing yang dikira sebagai nombor tetap.</p>
<h3>Utara geografi berbanding utara magnet</h3>
<p><strong>Bearing kiblat matematik dirujuk kepada utara geografi</strong>, sedangkan haluan kompas langsung datang daripada penderia peranti dan <strong>boleh jadi dirujuk secara magnet</strong>. Sudut antara kedua-duanya dipanggil <strong>deklinasi magnet</strong>; ia berbeza mengikut lokasi dan berubah dengan masa — sebab itulah model globalnya disemak setiap lima tahun.</p>
<p><strong>TimesPrayers pada masa ini tidak menggunakan sebarang pembetulan deklinasi magnet yang berasingan.</strong> Jadi jarum itu mungkin tidak berhenti tepat pada nombor yang dikira.</p>
<h3>Ketepatan bukan bilangan tempat perpuluhan</h3>
<p><strong>Nilai yang dipaparkan dengan satu tempat perpuluhan tidak bermakna arah kompas sebenar tepat sehingga darjah itu</strong>; ketepatan penderia bergantung pada peranti, persekitarannya dan medan magnet. Magnetometer sensitif terhadap benda di sekelilingnya: objek logam, pembesar suara, sarung telefon bermagnet, kereta, dan besi tetulang dalam bangunan. Menggerakkan telefon dalam bentuk angka lapan membantu sistem menentukur semula.</p>
<p><strong>Kesimpulan praktikalnya:</strong> nombor yang dikira ialah rujukan yang tetap; jarum ialah alat anggaran untuk bertindak atasnya.</p>

<h2>Tentang sisihan yang kecil</h2>
<p>Ramai bertanya apa jadi jika mereka tersasar sedikit daripada arah yang dikira. Itu perkara fiqh, yang dibincangkan para ulama dengan perincian yang berbeza mengikut keadaan seseorang dan kemampuannya menentukan arah. Kami memaparkan pengiraan dan batasnya, dan tidak mengeluarkan sebarang hukum mengenainya; hal itu dirujuk kepada ulama yang berkelayakan atau kepada pihak berkuasa yang diikuti pengguna.</p>
`,
sources: `
<h2>Sumber</h2>
<p class="guide-sources-note">Bearing dan jarak pada halaman ini dikira dengan formula yang sama yang digunakan laman ini, daripada koordinat setiap bandar.</p>
<ul>
<li>Bearing awal, Haversine dan jejari 6371 km pada model sfera: <a href="https://www.movable-type.co.uk/scripts/latlong.html" rel="nofollow noopener" target="_blank">movable-type.co.uk</a></li>
<li>Kerangka rujukan Bumi bagi penderia orientasi mutlak: <a href="https://www.w3.org/TR/orientation-sensor/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-sensor</a></li>
<li>Bacaan mutlak berbanding relatif dan had ketepatan paparan: <a href="https://www.w3.org/TR/orientation-event/" rel="nofollow noopener" target="_blank">w3.org/TR/orientation-event</a></li>
<li><code>webkitCompassHeading</code> dan rujukannya: dokumentasi Apple Developer</li>
<li>Deklinasi magnet dan perubahannya: World Magnetic Model — <a href="https://www.ncei.noaa.gov/products/world-magnetic-model" rel="nofollow noopener" target="_blank">ncei.noaa.gov</a></li>
</ul>

---
`,
related: [
  { href: '/ms/qibla', label: 'Arah Kiblat' },
  { href: '/ms/guides/prayer-time-calculation-methods', label: 'Kaedah Pengiraan Waktu Solat dan Sudutnya' },
],
},
},

};

// ═══════════════════════════════════════════════════════════════════════════════
// EDITORIAL GUIDES HUB — /guides and /en/guides
// ADSENSE-EDITORIAL-GUIDES-HUB-1 (2026-08-27)
//
// A real editorial landing page, not a link list. It states what the section is for,
// groups the guides by the service they explain, and gives each one an original
// description written FOR the hub -- the article paragraphs are never reproduced here.
// `cards` reference the live slugs only; no placeholders, no "coming soon".
// ═══════════════════════════════════════════════════════════════════════════════
const GUIDES_HUB = {

ar: {
h1: 'أدلة مواقيت الصلاة والقبلة',
intro: `<p class="guide-intro">هذا القسم يشرح <strong>كيف يحسب هذا الموقع ما يعرضه عليك</strong>. لا يعِدك بأرقام أدقّ من غيره، بل يريك المعادلة والعتبة والقرار وراء كل وقت واتجاه — بأمثلة محسوبة فعليًا، ومصادر منسوبة لأصحابها.</p>
<p>كُتبت هذه الأدلّة لأن أكثر ما يربك المستخدم ليس الرقم نفسه، بل <strong>اختلافه</strong> عن رقم آخر رآه. ومعظم هذا الاختلاف له تفسير هندسي أو مؤسسي بسيط، لا خطأ فيه.</p>`,
sections: [
  {
    title: 'مواقيت الصلاة',
    lead: 'كيف يُشتقّ كل وقت من موضع الشمس، ولماذا تختلف الجهات في تحديده.',
    cards: [
      { slug: 'prayer-time-calculation-methods',
        title: 'طرق حساب مواقيت الصلاة وزوايا الفجر والعشاء',
        desc: 'ما الذي يُحسب أصلًا، ومعنى «زاوية الفجر»، والفرق بين الزاوية والفاصل الزمني الثابت. مع جدول الطرق السبع عشرة المطبَّقة هنا بزواياها، وتعديلات الدقائق التي تنشرها بعض الجهات الرسمية، وحساب العصر بعاملَي الظل.',
        cta: 'اقرأ الدليل' },
      { slug: 'why-prayer-times-differ',
        title: 'لماذا تختلف مواقيت الصلاة بين التطبيقات والمواقع؟',
        desc: 'خمسة أسباب شائعة، مرتَّبة من الأكبر أثرًا إلى الأصغر: الزاوية، ودقائق الاحتياط الرسمية، والإحداثيات، والمنطقة الزمنية، والتقريب. ثم حالة العروض العالية حيث قد يبلغ الفارق ساعتين. وفي آخره خطوات لمقارنة مصدرين بإنصاف.',
        cta: 'اقرأ الدليل' },
    ]
  },
  {
    title: 'اتجاه القبلة',
    lead: 'الفرق بين الاتجاه المحسوب هندسيًا وبين ما تشير إليه بوصلة جهازك.',
    cards: [
      { slug: 'how-qibla-direction-is-calculated',
        title: 'كيف يتم حساب اتجاه القبلة؟',
        desc: 'القبلة اتجاه على سطح كرة لا خط على خريطة مسطّحة — ولهذا تأتي النتائج مخالفة للحدس. الصيغة المستخدمة، وإحداثيات الكعبة، وحساب المسافة، ولماذا لا تنطبق إبرة البوصلة دائمًا على الرقم المحسوب.',
        cta: 'اقرأ الدليل' },
    ]
  }
],
editorial: `<h2>كيف تُكتب هذه الأدلّة</h2>
<p>كل رقم في هذه الصفحات مأخوذ من أحد مصدرين: <strong>شيفرة هذا الموقع نفسها</strong>، أو <strong>حساب أُجري بالمحرّك نفسه</strong> الذي يولّد المواقيت التي تراها — بتاريخ وإحداثيات وطريقة مذكورة صراحةً في كل مثال، لا بأرقام عامة.</p>
<p>وحين نذكر زاوية أو تعديل دقائق تعتمده جهة رسمية، ننسبه إليها ونضع مصدره في قسم المصادر أسفل كل دليل. وحيث يختلف ما يطبّقه الموقع عمّا تنشره الجهة، نقول ذلك صراحةً بدل إخفائه.</p>
<p>أما المسائل الفقهية — كاختيار مذهب في العصر، أو حكم الانحراف اليسير عن القبلة — فنعرض الاختلاف ولا نرجّح فيه، والمرجع فيها أهل العلم أو الجهة التي يتبعها القارئ.</p>`,
back: { title: 'خدمات الموقع', links: [
  { href: '/', label: 'مواقيت الصلاة' },
  { href: '/qibla', label: 'اتجاه القبلة' },
  { href: '/prayer-times-worldwide', label: 'مواقيت الصلاة في دول العالم' },
  { href: '/moon', label: 'القمر اليوم' },
]},
},

en: {
h1: 'Prayer Times & Qibla Guides',
intro: `<p class="guide-intro">This section explains <strong>how this site computes what it shows you</strong>. It doesn't claim more accurate numbers than anyone else — it shows you the equation, the threshold and the decision behind every time and bearing, with worked examples and sources attributed to the bodies that publish them.</p>
<p>These guides exist because what confuses people is rarely the number itself — it's how it <strong>differs</strong> from another number they saw. Most of that difference has a simple geometric or institutional explanation, and nothing is wrong.</p>`,
sections: [
  {
    title: 'Prayer Times',
    lead: 'How each time is derived from the sun\'s position, and why authorities disagree on the threshold.',
    cards: [
      { slug: 'prayer-time-calculation-methods',
        title: 'Prayer Time Calculation Methods and Angles',
        desc: 'What is actually being computed, what a "Fajr angle" means, and the difference between an angle and a fixed interval. Includes the table of all seventeen methods implemented here with their angles, the precautionary minutes some authorities publish, and how Asr is derived from shadow length.',
        cta: 'Read the guide' },
      { slug: 'why-prayer-times-differ',
        title: 'Why Prayer Times Differ Between Apps and Websites',
        desc: 'Five common causes, ordered from largest effect to smallest: the angle, official precautionary minutes, coordinates, time zone and DST, and rounding. Then the high-latitude case, where the gap can reach two hours — and a checklist for comparing two sources fairly.',
        cta: 'Read the guide' },
    ]
  },
  {
    title: 'Qibla Direction',
    lead: 'The difference between a geometrically computed bearing and what your phone\'s compass points at.',
    cards: [
      { slug: 'how-qibla-direction-is-calculated',
        title: 'How Qibla Direction Is Calculated',
        desc: 'The Qibla is a direction on a sphere, not a line on a flat map — which is why the results defy intuition. The formula used, the Kaaba coordinates, how distance is computed, and why the compass needle does not always land on the computed number.',
        cta: 'Read the guide' },
    ]
  }
],
editorial: `<h2>How these guides are written</h2>
<p>Every figure on these pages comes from one of two places: <strong>this site's own code</strong>, or <strong>a calculation run through the same engine</strong> that produces the times you see — with the date, coordinates and method named explicitly in each example rather than quoted as general figures.</p>
<p>Where we cite an angle or a minute adjustment used by an official body, we attribute it and list the source at the foot of each guide. Where what this site applies differs from what that body publishes, we say so plainly instead of hiding it.</p>
<p>Matters of jurisprudence — choosing an Asr definition, or how much deviation from the Qibla is acceptable — are presented as differences, not settled. Those are referred to qualified scholars or the authority a reader follows.</p>`,
back: { title: 'Site services', links: [
  { href: '/en/', label: 'Prayer Times' },
  { href: '/en/qibla', label: 'Qibla Direction' },
  { href: '/en/prayer-times-worldwide', label: 'Prayer Times Worldwide' },
  { href: '/en/moon', label: 'Moon Today' },
]},
},

fr: {
h1: 'Guides des heures de prière et de la Qibla',
intro: `<p class="guide-intro">Cette section explique <strong>comment ce site calcule ce qu'il vous montre</strong>. Elle ne prétend pas à des chiffres plus exacts que d'autres — elle vous montre l'équation, le seuil et la décision derrière chaque heure et chaque cap, avec des exemples chiffrés et des sources attribuées aux organismes qui les publient.</p>
<p>Ces guides existent parce que ce qui déroute, c'est rarement le nombre lui-même ; c'est plutôt son <strong>écart</strong> avec un autre nombre vu ailleurs. La plupart de ces écarts ont une explication géométrique ou institutionnelle simple, et rien n'y est fautif.</p>`,
sections: [
  {
    title: 'Heures de prière',
    lead: 'Comment chaque heure se déduit de la position du soleil, et pourquoi les autorités divergent sur le seuil.',
    cards: [
      { slug: 'prayer-time-calculation-methods',
        title: 'Méthodes de calcul des heures de prière et angles',
        desc: 'Ce qui est réellement calculé, ce que signifie un « angle du Fajr », et la différence entre un angle et un intervalle fixe. Avec le tableau des dix-sept méthodes appliquées ici et leurs angles, les minutes de précaution que publient certaines autorités, et la façon dont le Asr se déduit de la longueur de l\'ombre.',
        cta: 'Lire le guide' },
      { slug: 'why-prayer-times-differ',
        title: 'Pourquoi les heures de prière diffèrent entre applications et sites',
        desc: 'Cinq causes courantes, de l\'effet le plus important au plus faible : l\'angle, les minutes de précaution officielles, les coordonnées, le fuseau horaire et l\'heure d\'été, et l\'arrondi. Puis le cas des hautes latitudes, où l\'écart peut atteindre deux heures — et une marche à suivre pour comparer deux sources loyalement.',
        cta: 'Lire le guide' },
    ]
  },
  {
    title: 'Direction de la Qibla',
    lead: 'La différence entre un cap calculé géométriquement et ce que pointe la boussole de votre téléphone.',
    cards: [
      { slug: 'how-qibla-direction-is-calculated',
        title: 'Comment la direction de la Qibla est calculée',
        desc: 'La Qibla est une direction sur une sphère, non un trait sur une carte plate — d\'où des résultats qui déjouent l\'intuition. La formule utilisée, les coordonnées de la Kaaba, le calcul de la distance, et pourquoi l\'aiguille de la boussole ne tombe pas toujours sur le nombre calculé.',
        cta: 'Lire le guide' },
    ]
  },
],
editorial: `<h2>Comment ces guides sont écrits</h2>
<p>Chaque chiffre de ces pages vient de l'un de deux endroits : <strong>le code de ce site lui-même</strong>, ou <strong>un calcul effectué avec le moteur même</strong> qui produit les heures que vous voyez — avec la date, les coordonnées et la méthode nommées explicitement dans chaque exemple, plutôt que citées comme des valeurs générales.</p>
<p>Lorsque nous citons un angle ou un ajustement en minutes employé par un organisme officiel, nous le lui attribuons et indiquons la source au bas de chaque guide. Là où ce que ce site applique diffère de ce que cet organisme publie, nous le disons clairement au lieu de le masquer.</p>
<p>Quant aux questions de jurisprudence — choisir une définition du Asr, ou déterminer quel écart par rapport à la Qibla est acceptable — elles sont présentées comme des divergences, non comme des points tranchés. Elles sont renvoyées aux savants qualifiés ou à l'autorité que suit le lecteur.</p>`,
back: { title: 'Services du site', links: [
  { href: '/fr/', label: 'Heures de Prière' },
  { href: '/fr/qibla', label: 'Direction de la Qibla' },
  { href: '/fr/prayer-times-worldwide', label: 'Heures de prière dans le monde' },
  { href: '/fr/moon', label: 'La lune aujourd\'hui' },
]},
},

tr: {
h1: 'Namaz Vakti ve Kıble Rehberleri',
intro: `<p class="guide-intro">Bu bölüm, <strong>bu sitenin size gösterdiği şeyi nasıl hesapladığını</strong> anlatır. Sayılarının başkalarınkinden daha doğru olduğunu iddia etmez — her vaktin ve her kerterizin ardındaki denklemi, eşiği ve kararı, hesaplanmış örneklerle ve onları yayımlayan kurumlara atfedilmiş kaynaklarla gösterir.</p>
<p>Bu rehberler var, çünkü insanları şaşırtan nadiren sayının kendisidir; şaşırtan, o sayının başka bir yerde görülen sayıdan <strong>farkıdır</strong>. Bu farkların çoğunun basit bir geometrik ya da kurumsal açıklaması vardır ve içlerinde yanlış bir şey yoktur.</p>`,
sections: [
  {
    title: 'Namaz Vakitleri',
    lead: 'Her vakit güneşin konumundan nasıl türetiliyor ve merciler eşik konusunda neden ayrışıyor.',
    cards: [
      { slug: 'prayer-time-calculation-methods',
        title: 'Namaz Vakti Hesaplama Yöntemleri ve Açıları',
        desc: 'Aslında ne hesaplanıyor, «imsak açısı» ne demek ve açı ile sabit süre arasındaki fark nedir. Ayrıca burada uygulanan on yedi yöntemin açılarıyla birlikte tablosu, bazı mercilerin yayımladığı ihtiyat dakikaları ve ikindinin gölge uzunluğundan nasıl bulunduğu.',
        cta: 'Rehberi oku' },
      { slug: 'why-prayer-times-differ',
        title: 'Namaz Vakitleri Uygulamalar ve Siteler Arasında Neden Farklı?',
        desc: 'Beş yaygın sebep, etkisi en büyükten en küçüğe: açı, resmî ihtiyat dakikaları, koordinatlar, saat dilimi ve yaz saati, yuvarlama. Ardından farkın iki saate kadar çıkabildiği yüksek enlem durumu — ve sonunda iki kaynağı adil biçimde karşılaştırma adımları.',
        cta: 'Rehberi oku' },
    ]
  },
  {
    title: 'Kıble Yönü',
    lead: 'Geometrik olarak hesaplanan kerteriz ile telefonunuzun pusulasının gösterdiği arasındaki fark.',
    cards: [
      { slug: 'how-qibla-direction-is-calculated',
        title: 'Kıble Yönü Nasıl Hesaplanır',
        desc: 'Kıble, düz haritada bir çizgi değil küre yüzeyinde bir yöndür — sonuçların sezgiye ters düşmesinin sebebi budur. Kullanılan formül, Kâbe\'nin koordinatları, mesafenin hesabı ve pusula iğnesinin neden her zaman hesaplanan sayının üzerine oturmadığı.',
        cta: 'Rehberi oku' },
    ]
  },
],
editorial: `<h2>Bu rehberler nasıl yazılıyor</h2>
<p>Bu sayfalardaki her sayı iki yerden birinden gelir: <strong>bu sitenin kendi kodundan</strong> ya da gördüğünüz vakitleri üreten <strong>aynı motorda yapılmış bir hesaptan</strong> — her örnekte tarih, koordinat ve yöntem açıkça adlandırılarak, genel sayılar olarak aktarılmadan.</p>
<p>Resmî bir kurumun kullandığı bir açıyı ya da dakika düzeltmesini andığımızda, bunu o kuruma atfeder ve kaynağını her rehberin altında veririz. Bu sitenin uyguladığı, o kurumun yayımladığından ayrıldığı yerlerde bunu gizlemek yerine açıkça söyleriz.</p>
<p>Fıkhî meselelere gelince — ikindi tanımının seçimi ya da kıbleden ne kadar sapmanın kabul edilebilir olduğu — bunlar çözülmüş konular olarak değil, görüş farkı olarak sunulur. Bu hususlarda mercii ehil âlimler ya da okurun bağlı olduğu kurumdur.</p>`,
back: { title: 'Site hizmetleri', links: [
  { href: '/tr/', label: 'Namaz Vakitleri' },
  { href: '/tr/qibla', label: 'Kıble Yönü' },
  { href: '/tr/prayer-times-worldwide', label: 'Dünya Genelinde Namaz Vakitleri' },
  { href: '/tr/moon', label: 'Bugün Ay' },
]},
},

ur: {
h1: 'اوقاتِ نماز اور قبلہ کے رہنما مضامین',
intro: `<p class="guide-intro">یہ حصہ بتاتا ہے کہ <strong>یہ سائٹ جو کچھ آپ کو دکھاتی ہے، وہ کیسے نکالتی ہے</strong>۔ یہ کسی سے زیادہ درست اعداد کا دعویٰ نہیں کرتا — یہ آپ کو ہر وقت اور ہر سمت کے پیچھے کی مساوات، حد اور فیصلہ دکھاتا ہے، حساب شدہ مثالوں اور اُنہی اداروں کی طرف منسوب مصادر کے ساتھ جو انہیں شائع کرتے ہیں۔</p>
<p>یہ رہنما مضامین اس لیے موجود ہیں کہ لوگوں کو الجھن عدد سے کم ہی ہوتی ہے — الجھن اس بات سے ہوتی ہے کہ یہ عدد کہیں اور دیکھے ہوئے عدد سے <strong>مختلف</strong> کیوں ہے۔ اس اختلاف کی زیادہ تر وجوہات کی سادہ ہندسی یا ادارہ جاتی وضاحت موجود ہے، اور اس میں کچھ غلط نہیں۔</p>`,
sections: [
  {
    title: 'اوقاتِ نماز',
    lead: 'ہر وقت سورج کی پوزیشن سے کیسے نکلتا ہے، اور ادارے حد پر مختلف کیوں ہیں۔',
    cards: [
      { slug: 'prayer-time-calculation-methods',
        title: 'اوقاتِ نماز کے حساب کے طریقے اور زاویے',
        desc: 'اصل میں حساب کس چیز کا ہوتا ہے، «فجر کے زاویے» کا مطلب کیا ہے، اور زاویے اور مقررہ وقفے میں کیا فرق ہے۔ ساتھ میں یہاں نافذ سترہ طریقوں کا جدول اُن کے زاویوں سمیت، کچھ اداروں کے شائع کردہ احتیاطی منٹ، اور یہ کہ عصر سائے کی لمبائی سے کیسے نکلتی ہے۔',
        cta: 'رہنما مضمون پڑھیں' },
      { slug: 'why-prayer-times-differ',
        title: 'اوقاتِ نماز ایپس اور ویب سائٹس کے درمیان مختلف کیوں ہوتے ہیں؟',
        desc: 'پانچ عام وجوہات، سب سے بڑے اثر سے سب سے چھوٹے تک: زاویہ، سرکاری احتیاطی منٹ، کوآرڈینیٹس، ٹائم زون اور ڈے لائٹ سیونگ، اور تقریب۔ پھر بلند عرض البلد کی صورت، جہاں فرق دو گھنٹے تک پہنچ سکتا ہے — اور آخر میں دو ذرائع کا انصاف سے موازنہ کرنے کے مراحل۔',
        cta: 'رہنما مضمون پڑھیں' },
    ]
  },
  {
    title: 'سمتِ قبلہ',
    lead: 'ہندسی طور پر نکالی گئی سمت اور آپ کے فون کے قطب نما کے اشارے میں فرق۔',
    cards: [
      { slug: 'how-qibla-direction-is-calculated',
        title: 'سمتِ قبلہ کا حساب کیسے ہوتا ہے',
        desc: 'قبلہ کرے کی سطح پر ایک سمت ہے، چپٹے نقشے پر لکیر نہیں — اسی لیے نتائج وجدان کے خلاف نکلتے ہیں۔ استعمال ہونے والی مساوات، کعبہ کے کوآرڈینیٹس، فاصلے کا حساب، اور یہ کہ قطب نما کی سوئی ہمیشہ حساب شدہ عدد پر کیوں نہیں ٹھہرتی۔',
        cta: 'رہنما مضمون پڑھیں' },
    ]
  },
],
editorial: `<h2>یہ رہنما مضامین کیسے لکھے جاتے ہیں</h2>
<p>ان صفحات کا ہر عدد دو میں سے کسی ایک جگہ سے آتا ہے: <strong>اسی سائٹ کا اپنا کوڈ</strong>، یا <strong>اُسی انجن پر چلایا گیا حساب</strong> جو آپ کے سامنے کے اوقات پیدا کرتا ہے — اور ہر مثال میں تاریخ، کوآرڈینیٹس اور طریقہ صراحتاً نامزد ہوتے ہیں، عمومی اعداد کے طور پر نقل نہیں کیے جاتے۔</p>
<p>جہاں ہم کسی سرکاری ادارے کا استعمال کردہ زاویہ یا منٹ کی ترمیم ذکر کرتے ہیں، وہاں اسے اُسی کی طرف منسوب کرتے ہیں اور ہر رہنما مضمون کے نیچے اس کا مصدر درج کرتے ہیں۔ جہاں یہ سائٹ جو نافذ کرتی ہے وہ اُس ادارے کے شائع کردہ سے مختلف ہو، ہم اسے چھپانے کے بجائے صاف کہہ دیتے ہیں۔</p>
<p>رہے فقہی مسائل — عصر کی تعریف کا انتخاب، یا قبلہ سے کتنا انحراف قابلِ قبول ہے — تو انہیں اختلاف کے طور پر پیش کیا جاتا ہے، طے شدہ کے طور پر نہیں۔ ان معاملات میں رہنمائی کے لیے اہلِ علم یا اُس ادارے سے رجوع کیا جاتا ہے جس کی پیروی قاری کرتا ہے۔</p>`,
back: { title: 'سائٹ کی خدمات', links: [
  { href: '/ur/', label: 'اوقاتِ نماز' },
  { href: '/ur/qibla', label: 'سمتِ قبلہ' },
  { href: '/ur/prayer-times-worldwide', label: 'دنیا بھر کے اوقاتِ نماز' },
  { href: '/ur/moon', label: 'آج کا چاند' },
]},
},

de: {
h1: 'Ratgeber zu Gebetszeiten und Qibla',
intro: `<p class="guide-intro">Dieser Bereich erklärt, <strong>wie diese Website berechnet, was sie Ihnen anzeigt</strong>. Sie beansprucht keine genaueren Zahlen als andere — sie zeigt Ihnen die Gleichung, die Schwelle und die Entscheidung hinter jeder Zeit und jedem Kurs, mit durchgerechneten Beispielen und Quellen, die den veröffentlichenden Institutionen zugeschrieben sind.</p>
<p>Diese Ratgeber gibt es, weil selten die Zahl selbst verwirrt; es verwirrt ihr <strong>Abstand</strong> zu einer anderen Zahl, die man anderswo gesehen hat. Die meisten dieser Abstände haben eine einfache geometrische oder institutionelle Erklärung, und nichts daran ist falsch.</p>`,
sections: [
  {
    title: 'Gebetszeiten',
    lead: 'Wie jede Zeit aus dem Sonnenstand abgeleitet wird und warum Institutionen sich über die Schwelle uneinig sind.',
    cards: [
      { slug: 'prayer-time-calculation-methods',
        title: 'Berechnungsmethoden für Gebetszeiten und ihre Winkel',
        desc: 'Was tatsächlich berechnet wird, was ein «Fajr-Winkel» bedeutet und worin sich Winkel und festes Intervall unterscheiden. Dazu die Tabelle der siebzehn hier implementierten Methoden mit ihren Winkeln, die Vorsichtsminuten, die manche Institutionen veröffentlichen, und wie Asr aus der Schattenlänge abgeleitet wird.',
        cta: 'Zum Ratgeber' },
      { slug: 'why-prayer-times-differ',
        title: 'Warum Gebetszeiten sich zwischen Apps und Websites unterscheiden',
        desc: 'Fünf häufige Ursachen, vom größten zum kleinsten Effekt: der Winkel, amtliche Vorsichtsminuten, Koordinaten, Zeitzone und Sommerzeit sowie Rundung. Dann der Fall hoher Breitengrade, wo der Abstand zwei Stunden erreichen kann — und am Ende eine Anleitung, zwei Quellen fair zu vergleichen.',
        cta: 'Zum Ratgeber' },
    ]
  },
  {
    title: 'Qibla-Richtung',
    lead: 'Der Unterschied zwischen einem geometrisch berechneten Kurs und dem, worauf der Kompass Ihres Telefons zeigt.',
    cards: [
      { slug: 'how-qibla-direction-is-calculated',
        title: 'Wie die Qibla-Richtung berechnet wird',
        desc: 'Die Qibla ist eine Richtung auf einer Kugel, keine Linie auf einer flachen Karte — deshalb widersprechen die Ergebnisse der Anschauung. Die verwendete Formel, die Koordinaten der Kaaba, die Berechnung der Entfernung und warum die Kompassnadel nicht immer auf der berechneten Zahl landet.',
        cta: 'Zum Ratgeber' },
    ]
  },
],
editorial: `<h2>Wie diese Ratgeber entstehen</h2>
<p>Jede Zahl auf diesen Seiten stammt aus einer von zwei Quellen: <strong>dem eigenen Code dieser Website</strong> oder <strong>einer Rechnung mit derselben Engine</strong>, die auch die Zeiten erzeugt, die Sie sehen — mit Datum, Koordinaten und Methode in jedem Beispiel ausdrücklich benannt, statt als allgemeine Werte zitiert.</p>
<p>Wenn wir einen Winkel oder eine Minutenanpassung nennen, die eine amtliche Institution verwendet, schreiben wir sie ihr zu und führen die Quelle am Fuß jedes Ratgebers auf. Wo das, was diese Website anwendet, von dem abweicht, was diese Institution veröffentlicht, sagen wir es offen, statt es zu verbergen.</p>
<p>Fragen der Rechtswissenschaft dagegen — die Wahl einer Asr-Definition oder wie viel Abweichung von der Qibla hinnehmbar ist — werden als Meinungsunterschiede dargestellt, nicht als entschieden. Maßgeblich sind dafür qualifizierte Gelehrte oder die Institution, der ein Leser folgt.</p>`,
back: { title: 'Angebote der Website', links: [
  { href: '/de/', label: 'Gebetszeiten' },
  { href: '/de/qibla', label: 'Qibla-Richtung' },
  { href: '/de/prayer-times-worldwide', label: 'Gebetszeiten weltweit' },
  { href: '/de/moon', label: 'Der Mond heute' },
]},
},

es: {
h1: 'Guías de horarios de oración y Qibla',
intro: `<p class="guide-intro">Esta sección explica <strong>cómo calcula este sitio lo que le muestra</strong>. No pretende dar cifras más exactas que nadie: le enseña la ecuación, el umbral y la decisión que hay detrás de cada horario y cada rumbo, con ejemplos calculados y fuentes atribuidas a los organismos que las publican.</p>
<p>Estas guías existen porque lo que desconcierta a la gente rara vez es la cifra en sí; lo que desconcierta es su <strong>diferencia</strong> con otra cifra vista en otro sitio. Casi todas esas diferencias tienen una explicación geométrica o institucional sencilla, y no hay nada incorrecto en ellas.</p>`,
sections: [
  {
    title: 'Horarios de Oración',
    lead: 'Cómo se deduce cada horario de la posición del sol y por qué las autoridades discrepan sobre el umbral.',
    cards: [
      { slug: 'prayer-time-calculation-methods',
        title: 'Métodos de cálculo de los horarios de oración y sus ángulos',
        desc: 'Qué se calcula en realidad, qué significa un «ángulo del Fayr» y en qué se diferencian un ángulo y un intervalo fijo. Incluye la tabla de los diecisiete métodos implementados aquí con sus ángulos, los minutos de precaución que publican algunas autoridades y cómo se deduce el Asr a partir de la longitud de la sombra.',
        cta: 'Leer la guía' },
      { slug: 'why-prayer-times-differ',
        title: 'Por qué difieren los horarios de oración entre aplicaciones y sitios web',
        desc: 'Cinco causas frecuentes, del efecto mayor al menor: el ángulo, los minutos de precaución oficiales, las coordenadas, la zona horaria y el horario de verano, y el redondeo. Después, el caso de las latitudes altas, donde la diferencia puede alcanzar dos horas, y al final los pasos para comparar dos fuentes con equidad.',
        cta: 'Leer la guía' },
    ]
  },
  {
    title: 'Dirección de la Qibla',
    lead: 'La diferencia entre un rumbo calculado geométricamente y lo que señala la brújula de su teléfono.',
    cards: [
      { slug: 'how-qibla-direction-is-calculated',
        title: 'Cómo se calcula la dirección de la Qibla',
        desc: 'La Qibla es una dirección sobre una esfera, no una línea en un mapa plano, y por eso los resultados desafían la intuición. La fórmula utilizada, las coordenadas de la Kaaba, el cálculo de la distancia y por qué la aguja de la brújula no siempre se detiene en el número calculado.',
        cta: 'Leer la guía' },
    ]
  },
],
editorial: `<h2>Cómo se escriben estas guías</h2>
<p>Cada cifra de estas páginas procede de uno de dos sitios: <strong>el propio código de esta web</strong> o <strong>un cálculo hecho con el mismo motor</strong> que genera los horarios que usted ve, con la fecha, las coordenadas y el método nombrados explícitamente en cada ejemplo, y no citados como valores generales.</p>
<p>Cuando mencionamos un ángulo o un ajuste en minutos que emplea un organismo oficial, se lo atribuimos y anotamos la fuente al pie de cada guía. Allí donde lo que aplica este sitio difiere de lo que ese organismo publica, lo decimos con claridad en lugar de ocultarlo.</p>
<p>En cuanto a las cuestiones de jurisprudencia —elegir una definición del Asr o cuánta desviación respecto a la Qibla es admisible—, se presentan como diferencias de criterio, no como asuntos zanjados. La referencia en ellas son los sabios cualificados o la autoridad que siga el lector.</p>`,
back: { title: 'Servicios del sitio', links: [
  { href: '/es/', label: 'Horarios de Oración' },
  { href: '/es/qibla', label: 'Dirección de la Qibla' },
  { href: '/es/prayer-times-worldwide', label: 'Horarios de oración en el mundo' },
  { href: '/es/moon', label: 'La Luna Hoy' },
]},
},

id: {
h1: 'Panduan Jadwal Sholat dan Kiblat',
intro: `<p class="guide-intro">Bagian ini menjelaskan <strong>bagaimana situs ini menghitung apa yang ditampilkannya kepada Anda</strong>. Ia tidak mengklaim angkanya lebih akurat daripada siapa pun — ia memperlihatkan persamaan, ambang, dan keputusan di balik setiap waktu dan setiap bearing, dengan contoh terhitung dan sumber yang dinisbahkan kepada lembaga yang menerbitkannya.</p>
<p>Panduan ini ada karena yang membingungkan orang jarang angkanya sendiri; yang membingungkan adalah <strong>selisihnya</strong> dengan angka lain yang pernah dilihat di tempat lain. Sebagian besar selisih itu punya penjelasan geometris atau kelembagaan yang sederhana, dan tidak ada yang keliru di dalamnya.</p>`,
sections: [
  {
    title: 'Jadwal Sholat',
    lead: 'Bagaimana setiap waktu diturunkan dari posisi matahari, dan mengapa para otoritas berbeda pendapat soal ambangnya.',
    cards: [
      { slug: 'prayer-time-calculation-methods',
        title: 'Metode Perhitungan Jadwal Sholat dan Sudutnya',
        desc: 'Apa yang sebenarnya dihitung, apa arti «sudut Subuh», dan apa beda antara sudut dan interval tetap. Lengkap dengan tabel tujuh belas metode yang diterapkan di sini beserta sudutnya, menit kehati-hatian yang diterbitkan sebagian otoritas, dan bagaimana Asar diturunkan dari panjang bayangan.',
        cta: 'Baca panduan' },
      { slug: 'why-prayer-times-differ',
        title: 'Mengapa Jadwal Sholat Berbeda antara Aplikasi dan Situs Web?',
        desc: 'Lima penyebab umum, diurutkan dari pengaruh terbesar ke terkecil: sudut, menit kehati-hatian resmi, koordinat, zona waktu dan DST, serta pembulatan. Lalu kasus lintang tinggi, yang selisihnya bisa mencapai dua jam — dan di bagian akhir, langkah membandingkan dua sumber secara adil.',
        cta: 'Baca panduan' },
    ]
  },
  {
    title: 'Arah Kiblat',
    lead: 'Beda antara bearing yang dihitung secara geometris dengan apa yang ditunjuk kompas ponsel Anda.',
    cards: [
      { slug: 'how-qibla-direction-is-calculated',
        title: 'Bagaimana Arah Kiblat Dihitung',
        desc: 'Kiblat adalah arah di permukaan bola, bukan garis di peta datar — karena itulah hasilnya berlawanan dengan intuisi. Rumus yang dipakai, koordinat Kakbah, cara jarak dihitung, dan mengapa jarum kompas tidak selalu berhenti di angka hasil perhitungan.',
        cta: 'Baca panduan' },
    ]
  },
],
editorial: `<h2>Bagaimana panduan ini ditulis</h2>
<p>Setiap angka di halaman-halaman ini berasal dari salah satu dari dua tempat: <strong>kode situs ini sendiri</strong>, atau <strong>perhitungan yang dijalankan pada mesin yang sama</strong> yang menghasilkan jadwal yang Anda lihat — dengan tanggal, koordinat, dan metode disebut secara eksplisit pada setiap contoh, bukan dikutip sebagai angka umum.</p>
<p>Ketika kami menyebut sudut atau penyesuaian menit yang dipakai sebuah lembaga resmi, kami menisbahkannya kepada lembaga itu dan mencantumkan sumbernya di bagian bawah tiap panduan. Di titik mana pun penerapan situs ini berbeda dari yang diterbitkan lembaga tersebut, kami menyatakannya terang-terangan alih-alih menyembunyikannya.</p>
<p>Adapun perkara fikih — memilih definisi Asar, atau seberapa besar penyimpangan dari kiblat yang bisa diterima — disajikan sebagai perbedaan pendapat, bukan sebagai perkara yang sudah diputuskan. Untuk itu, rujukannya adalah ulama yang berkompeten atau otoritas yang diikuti pembaca.</p>`,
back: { title: 'Layanan situs', links: [
  { href: '/id/', label: 'Jadwal Sholat' },
  { href: '/id/qibla', label: 'Arah Kiblat' },
  { href: '/id/prayer-times-worldwide', label: 'Jadwal Sholat Seluruh Dunia' },
  { href: '/id/moon', label: 'Bulan Hari Ini' },
]},
},

bn: {
h1: 'নামাজের সময় ও কিবলার গাইড',
intro: `<p class="guide-intro">এই বিভাগটি ব্যাখ্যা করে <strong>এই সাইট আপনাকে যা দেখায় তা কীভাবে গণনা করে</strong>। এটি কারও চেয়ে বেশি নির্ভুল সংখ্যার দাবি করে না — এটি আপনাকে দেখায় প্রতিটি সময় ও দিকমাত্রার পেছনের সমীকরণ, সীমা ও সিদ্ধান্ত, গণনা করা উদাহরণ এবং যেসব প্রতিষ্ঠান সেগুলো প্রকাশ করে তাদের প্রতি আরোপিত সূত্রসহ।</p>
<p>এই গাইডগুলো আছে কারণ মানুষকে বিভ্রান্ত করে সংখ্যাটি নিজে নয় — বিভ্রান্ত করে অন্য কোথাও দেখা সংখ্যার সঙ্গে তার <strong>পার্থক্য</strong>। সেই পার্থক্যের বেশিরভাগেরই একটি সহজ জ্যামিতিক বা প্রাতিষ্ঠানিক ব্যাখ্যা আছে, আর তাতে ভুল কিছু নেই।</p>`,
sections: [
  {
    title: 'নামাজের সময়',
    lead: 'প্রতিটি সময় সূর্যের অবস্থান থেকে কীভাবে নির্ণীত হয়, এবং কর্তৃপক্ষগুলো সীমা নিয়ে কেন দ্বিমত করে।',
    cards: [
      { slug: 'prayer-time-calculation-methods',
        title: 'নামাজের সময় গণনার পদ্ধতি ও কোণ',
        desc: 'আসলে কী গণনা করা হচ্ছে, «ফজরের কোণ» বলতে কী বোঝায়, এবং কোণ ও নির্দিষ্ট ব্যবধানের পার্থক্য কী। সঙ্গে এখানে প্রয়োগ করা সতেরোটি পদ্ধতির তালিকা তাদের কোণসহ, কিছু কর্তৃপক্ষের প্রকাশিত সতর্কতামূলক মিনিট, এবং আসর কীভাবে ছায়ার দৈর্ঘ্য থেকে নির্ণীত হয়।',
        cta: 'গাইডটি পড়ুন' },
      { slug: 'why-prayer-times-differ',
        title: 'অ্যাপ ও ওয়েবসাইটে নামাজের সময় ভিন্ন হয় কেন?',
        desc: 'পাঁচটি সাধারণ কারণ, সবচেয়ে বড় প্রভাব থেকে ছোট পর্যন্ত: কোণ, সরকারি সতর্কতামূলক মিনিট, স্থানাঙ্ক, সময় অঞ্চল ও ডেলাইট সেভিং, এবং রাউন্ডিং। তারপর উচ্চ অক্ষাংশের ক্ষেত্র, যেখানে ব্যবধান দুই ঘণ্টা পর্যন্ত পৌঁছাতে পারে — এবং শেষে দুটি উৎস সততার সঙ্গে মেলানোর ধাপ।',
        cta: 'গাইডটি পড়ুন' },
    ]
  },
  {
    title: 'কিবলার দিক',
    lead: 'জ্যামিতিকভাবে গণনা করা দিকমাত্রা আর আপনার ফোনের কম্পাস যা দেখায়, এই দুইয়ের পার্থক্য।',
    cards: [
      { slug: 'how-qibla-direction-is-calculated',
        title: 'কিবলার দিক কীভাবে গণনা করা হয়',
        desc: 'কিবলা গোলকের পৃষ্ঠে একটি দিক, সমতল মানচিত্রে রেখা নয় — এ কারণেই ফলাফল সহজবোধ্যতাকে হার মানায়। ব্যবহৃত সূত্র, কাবার স্থানাঙ্ক, দূরত্বের গণনা, এবং কম্পাসের কাঁটা কেন সবসময় গণনা করা সংখ্যার উপর থামে না।',
        cta: 'গাইডটি পড়ুন' },
    ]
  },
],
editorial: `<h2>এই গাইডগুলো কীভাবে লেখা হয়</h2>
<p>এই পৃষ্ঠাগুলোর প্রতিটি সংখ্যা দুটি জায়গার একটি থেকে আসে: <strong>এই সাইটের নিজস্ব কোড</strong>, অথবা <strong>সেই একই ইঞ্জিনে চালানো গণনা</strong> যা আপনার সামনের সময়গুলো তৈরি করে — এবং প্রতিটি উদাহরণে তারিখ, স্থানাঙ্ক ও পদ্ধতি স্পষ্টভাবে নাম ধরে উল্লেখ করা হয়, সাধারণ সংখ্যা হিসেবে উদ্ধৃত করা হয় না।</p>
<p>কোনো সরকারি প্রতিষ্ঠানের ব্যবহৃত কোণ বা মিনিট-সমন্বয়ের উল্লেখ করলে আমরা তা সেই প্রতিষ্ঠানের প্রতি আরোপ করি এবং প্রতিটি গাইডের নিচে তার সূত্র দিই। এই সাইট যা প্রয়োগ করে তা যেখানে ওই প্রতিষ্ঠানের প্রকাশিত থেকে ভিন্ন, সেখানে আমরা তা লুকানোর বদলে স্পষ্ট করে বলি।</p>
<p>আর ফিকহি বিষয়গুলো — আসরের সংজ্ঞা বাছাই, কিংবা কিবলা থেকে কতটা বিচ্যুতি গ্রহণযোগ্য — মতভেদ হিসেবেই উপস্থাপিত হয়, মীমাংসিত হিসেবে নয়। এসব বিষয়ে ফিরে যেতে হয় যোগ্য আলেমগণের কাছে, অথবা পাঠক যে কর্তৃপক্ষ অনুসরণ করেন তাঁদের কাছে।</p>`,
back: { title: 'সাইটের সেবা', links: [
  { href: '/bn/', label: 'নামাজের সময়সূচী' },
  { href: '/bn/qibla', label: 'কিবলার দিক' },
  { href: '/bn/prayer-times-worldwide', label: 'বিশ্বজুড়ে নামাজের সময়' },
  { href: '/bn/moon', label: 'আজকের চাঁদ' },
]},
},

ms: {
h1: 'Panduan Waktu Solat dan Kiblat',
intro: `<p class="guide-intro">Bahagian ini menerangkan <strong>bagaimana laman ini mengira apa yang dipaparkannya kepada anda</strong>. Ia tidak mendakwa angkanya lebih tepat daripada sesiapa — ia menunjukkan kepada anda persamaan, ambang dan keputusan di sebalik setiap waktu dan setiap bearing, dengan contoh yang dikira dan sumber yang dinisbahkan kepada badan yang menerbitkannya.</p>
<p>Panduan ini wujud kerana yang mengelirukan orang jarang sekali angka itu sendiri; yang mengelirukan ialah <strong>bezanya</strong> dengan angka lain yang pernah dilihat di tempat lain. Kebanyakan beza itu ada penjelasan geometri atau institusi yang mudah, dan tiada apa yang salah padanya.</p>`,
sections: [
  {
    title: 'Waktu Solat',
    lead: 'Bagaimana setiap waktu diterbitkan daripada kedudukan matahari, dan mengapa pihak berkuasa berbeza pendapat tentang ambangnya.',
    cards: [
      { slug: 'prayer-time-calculation-methods',
        title: 'Kaedah Pengiraan Waktu Solat dan Sudutnya',
        desc: 'Apa yang sebenarnya dikira, apa maksud «sudut Subuh», dan apa beza antara sudut dengan selang tetap. Berserta jadual tujuh belas kaedah yang dilaksanakan di sini dengan sudutnya, minit ihtiyat yang diterbitkan sesetengah pihak berkuasa, dan bagaimana Asar diperoleh daripada panjang bayang.',
        cta: 'Baca panduan' },
      { slug: 'why-prayer-times-differ',
        title: 'Mengapa Waktu Solat Berbeza antara Aplikasi dan Laman Web?',
        desc: 'Lima sebab lazim, disusun daripada kesan terbesar kepada terkecil: sudut, minit ihtiyat rasmi, koordinat, zon waktu dan waktu jimat siang, serta pembundaran. Kemudian kes latitud tinggi, yang jurangnya boleh mencecah dua jam — dan akhirnya langkah membandingkan dua sumber secara adil.',
        cta: 'Baca panduan' },
    ]
  },
  {
    title: 'Arah Kiblat',
    lead: 'Beza antara bearing yang dikira secara geometri dengan apa yang ditunjukkan kompas telefon anda.',
    cards: [
      { slug: 'how-qibla-direction-is-calculated',
        title: 'Bagaimana Arah Kiblat Dikira',
        desc: 'Kiblat ialah arah pada permukaan sfera, bukan garis pada peta rata — sebab itulah hasilnya melawan gerak hati. Formula yang digunakan, koordinat Kaabah, pengiraan jarak, dan mengapa jarum kompas tidak selalu berhenti pada nombor yang dikira.',
        cta: 'Baca panduan' },
    ]
  },
],
editorial: `<h2>Bagaimana panduan ini ditulis</h2>
<p>Setiap angka pada halaman ini datang daripada salah satu daripada dua tempat: <strong>kod laman ini sendiri</strong>, atau <strong>pengiraan yang dijalankan pada enjin yang sama</strong> yang menghasilkan waktu yang anda lihat — dengan tarikh, koordinat dan kaedah dinamakan secara jelas dalam setiap contoh, bukan dipetik sebagai angka umum.</p>
<p>Apabila kami menyebut sudut atau pelarasan minit yang digunakan sesebuah badan rasmi, kami menisbahkannya kepada badan itu dan menyenaraikan sumbernya di bawah setiap panduan. Di mana apa yang laman ini gunakan berbeza daripada apa yang diterbitkan badan tersebut, kami menyatakannya dengan terang dan bukan menyembunyikannya.</p>
<p>Adapun perkara fiqh — memilih takrif Asar, atau sebanyak mana sisihan daripada kiblat yang boleh diterima — ia dibentangkan sebagai perbezaan pendapat, bukan sebagai perkara yang sudah diputuskan. Untuk itu, rujukannya ialah ulama yang berkelayakan atau pihak berkuasa yang diikuti pembaca.</p>`,
back: { title: 'Perkhidmatan laman', links: [
  { href: '/ms/', label: 'Waktu Solat' },
  { href: '/ms/qibla', label: 'Arah Kiblat' },
  { href: '/ms/prayer-times-worldwide', label: 'Waktu Solat Seluruh Dunia' },
  { href: '/ms/moon', label: 'Bulan Hari Ini' },
]},
},
};

module.exports = { GUIDES, GUIDES_HUB };
