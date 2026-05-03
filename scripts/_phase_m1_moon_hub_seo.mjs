// Phase M1 — moon-in-{city} SEO cleanup (Title + 3 SSR H2 sections).
//
// SEOptimer audit on /moon-in-riyadh:
//   • On-Page SEO grade: A (not A+) — Title is short + Keyword Consistency
//     fails for مايو, مايو 2026, أحدب, متناقص, هلال, متزايد (all dynamic
//     monthly content showing in body but not in headings/Title).
//   • Performance is A+ — do NOT touch perf/JS/CSS in this phase.
//
// Per user spec, this phase ONLY touches /moon-in-{city} (the Hub page
// without date). Other moon routes are out of scope:
//   • /moon-today               — already SEOptimer-green via E2-keywords-Hub
//   • /moon-today-in-{city}     — already green via E2-keywords-ext + E4-final
//   • /moon-in-{city}/{YYYY-MM} — month page, NOT touched
//   • /moon-in-{city}/{date}    — date page, NOT touched
//
// Changes:
//   1. Title template for `_isMoonHubPage` block (10 langs) — extends from
//      "تقويم القمر في {city} ومراحل القمر" (~38 chars) to
//      "تقويم القمر في {city} ومراحل القمر والأطوار الشهرية" (~50 chars,
//      within SEOptimer 50-60 sweet spot).
//   2. Three SSR-visible H2 sections injected ONLY on /moon-in-{city}
//      (NOT month pages) using the existing seo.moonCity SSR pattern from
//      E2-keywords-Hub-final. Sections cover the dynamic monthly terms
//      (مايو, مايو 2026, أحدب, متناقص, هلال, متزايد, بعد, يومًا) in
//      natural educational prose so SEOptimer's keyword-distribution check
//      flips green without keyword-stuffing the Title.
//
// Same code-cleanliness pattern as E2-keywords-Hub-final:
//   • try/catch with silent fallback
//   • _escHtml() for all dynamic text
//   • _serializeLangMap helper for per-lang object literals
//   • Phase marker comments
//   • Header marker check (this script refuses to re-run if marker present)

import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/Phase M1 \(2026-05-03\)/.test(raw)) {
    throw new Error('[server.js] M1 already applied (header marker present)');
}

function replaceOnce(label, oldStr, newStr) {
    const cnt = raw.split(oldStr).length - 1;
    if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
    raw = raw.replace(oldStr, newStr);
    console.log(`✓ ${label}`);
}

function _serializeLangMap(varName, obj, indent = '            ') {
    const inner = '                ';
    return `${indent}const ${varName} = {${EOL}` +
        Object.entries(obj).map(([lang, txt]) => {
            const esc = txt.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return `${inner}    ${lang}: '${esc}',`;
        }).join(EOL) + EOL +
        `${inner}};`;
}

// ═════════════════════════════════════════════════════════════════════════
// PART 1 — Title update for `_isMoonHubPage` block (line 4881-4892)
//   Old:  تقويم القمر في {city} ومراحل القمر  (~38 chars)
//   New:  تقويم القمر في {city} ومراحل القمر والأطوار الشهرية  (~50 chars)
// ═════════════════════════════════════════════════════════════════════════
const TITLE_OLD_BLOCK = [
`                _moonTitle = {`,
`                    ar: \`تقويم القمر في \${cityDisplay} ومراحل القمر\`,`,
`                    en: \`Moon Calendar in \${cityDisplay}: Phases & Hijri Dates\`,`,
`                    fr: \`Calendrier lunaire à \${cityDisplay} et phases de la Lune\`,`,
`                    tr: \`\${cityDisplay} Ay Takvimi, Ay Evreleri ve Hicri Tarih\`,`,
`                    ur: \`\${cityDisplay} میں چاند کی تقویم اور چاند کے مراحل\`,`,
`                    de: \`Mondkalender in \${cityDisplay} und Mondphasen\`,`,
`                    id: \`Kalender Bulan di \${cityDisplay} dan Fase Bulan\`,`,
`                    es: \`Calendario lunar en \${cityDisplay}, fases y fechas hijri\`,`,
`                    bn: \`\${cityDisplay}-এ চাঁদের ক্যালেন্ডার ও চাঁদের দশা\`,`,
`                    ms: \`Kalendar Bulan di \${cityDisplay} dan Fasa Bulan\`,`,
`                };`,
].join(EOL);

const TITLE_NEW_BLOCK = [
`                // Phase M1 (2026-05-03): extended Title for /moon-in-{city} Hub.`,
`                // Adds "الأطوار الشهرية" / "Monthly Lunar Stages" / etc. to flip`,
`                // SEOptimer's "Title too short" warning — all 10 sit in 50-60 range.`,
`                _moonTitle = {`,
`                    ar: \`تقويم القمر في \${cityDisplay} ومراحل القمر والأطوار الشهرية\`,`,
`                    en: \`Moon Calendar in \${cityDisplay}: Phases & Monthly Lunar Stages\`,`,
`                    fr: \`Calendrier lunaire à \${cityDisplay} : phases et stades mensuels\`,`,
`                    tr: \`\${cityDisplay} Ay Takvimi: Ay Evreleri ve Aylık Aşamalar\`,`,
`                    ur: \`\${cityDisplay} میں چاند کی تقویم: مراحل اور ماہانہ اطوار\`,`,
`                    de: \`Mondkalender in \${cityDisplay}: Phasen und monatliche Stadien\`,`,
`                    id: \`Kalender Bulan di \${cityDisplay}: Fase dan Tahap Bulanan\`,`,
`                    es: \`Calendario lunar en \${cityDisplay}: fases y etapas mensuales\`,`,
`                    bn: \`\${cityDisplay}-এ চাঁদের ক্যালেন্ডার: দশা ও মাসিক পর্যায়\`,`,
`                    ms: \`Kalendar Bulan \${cityDisplay}: Fasa dan Peringkat Bulanan\`,`,
`                };`,
].join(EOL);

replaceOnce('PART 1 — Title (10 langs)', TITLE_OLD_BLOCK, TITLE_NEW_BLOCK);

// ═════════════════════════════════════════════════════════════════════════
// PART 2 — Three SSR-visible H2 sections injected ONLY on /moon-in-{city}
//   (NOT on month pages /moon-in-{city}/{YYYY-MM}).
//
//   Section 1: تقويم القمر في {city} خلال {month} {year}
//              → covers dynamic monthly terms (مايو, مايو 2026, تقويم القمر)
//
//   Section 2: كيف تتغير مراحل القمر في {city} خلال الشهر؟
//              → covers phase terms (هلال, تربيع, أحدب, بدر, متناقص, متزايد)
//
//   Section 3: ماذا تعني الأيام المتبقية للأطوار القادمة؟
//              → covers count terms (بعد, يومًا)
//
//   Insertion point: just before the moon-other-cities section (the Hub
//   already shows a cities grid; these new sections sit above it as
//   contextual content).
// ═════════════════════════════════════════════════════════════════════════

// Section 1 — Monthly title H2
const SEC1_H2 = {
    ar: 'تقويم القمر في',
    en: 'Moon Calendar in',
    fr: 'Calendrier lunaire à',
    tr: 'Ay Takvimi',
    ur: 'چاند کی تقویم',
    de: 'Mondkalender in',
    id: 'Kalender Bulan di',
    es: 'Calendario lunar en',
    bn: 'চাঁদের ক্যালেন্ডার',
    ms: 'Kalendar Bulan',
};
// Suffix template: "{cityDisplay} خلال {monthName} {year}" — built per-lang inline below

const SEC1_P = {
    ar: 'يعرض هذا التقويم أطوار القمر اليومية ومواعيد البدر والمحاق ضمن الشهر الميلادي الحالي. يمكنك متابعة تطور القمر يوماً بيوم، ومعرفة الأطوار الشهرية الكاملة من المحاق إلى الهلال المتزايد إلى التربيع الأول إلى الأحدب المتزايد إلى البدر، ثم الأحدب المتناقص والتربيع الأخير والهلال المتناقص. يظهر التقويم أيضاً نسبة الإضاءة وعمر القمر لكل يوم.',
    en: "This calendar shows the daily moon phases and the dates of full moon and new moon for the current Gregorian month. You can track the moon's progression day by day and see the complete monthly lunar stages from new moon to waxing crescent, first quarter, waxing gibbous, full moon, then waning gibbous, last quarter, and waning crescent. The calendar also displays illumination percentage and moon age for each day.",
    fr: "Ce calendrier affiche les phases quotidiennes de la Lune et les dates de pleine lune et nouvelle lune pour le mois grégorien en cours. Vous pouvez suivre la progression de la Lune jour après jour et voir les stades mensuels complets, de la nouvelle lune au premier croissant, premier quartier, gibbeuse croissante, pleine lune, puis gibbeuse décroissante, dernier quartier et croissant décroissant. Le calendrier affiche aussi le pourcentage d'illumination et l'âge de la Lune chaque jour.",
    tr: 'Bu takvim, mevcut miladi ay için günlük ay evrelerini ve dolunay ile yeni ay tarihlerini gösterir. Ayın gün gün gelişimini takip edebilir, yeni aydan büyüyen hilale, ilk dördüne, büyüyen şişkin aya, dolunaya, ardından küçülen şişkin aya, son dördüne ve küçülen hilale kadar tam aylık aşamaları görebilirsiniz. Takvim ayrıca her gün için aydınlanma yüzdesi ve ay yaşını da gösterir.',
    ur: 'یہ تقویم موجودہ میلادی ماہ کے لیے چاند کے روزانہ مراحل اور بدر و نئے چاند کی تاریخیں دکھاتی ہے۔ آپ چاند کی ترقی کو روز بروز ٹریک کر سکتے ہیں اور نئے چاند سے بڑھتے ہلال، پہلی چوتھائی، بڑھتے گبس، بدر، پھر گھٹتے گبس، آخری چوتھائی اور گھٹتے ہلال تک مکمل ماہانہ مراحل دیکھ سکتے ہیں۔ تقویم ہر دن کے لیے روشنی کا فیصد اور چاند کی عمر بھی ظاہر کرتی ہے۔',
    de: 'Dieser Kalender zeigt die täglichen Mondphasen und die Daten von Vollmond und Neumond für den aktuellen gregorianischen Monat. Sie können den Fortschritt des Mondes Tag für Tag verfolgen und die kompletten monatlichen Mondstadien sehen — vom Neumond über die zunehmende Sichel, das erste Viertel, den zunehmenden Halbmond, den Vollmond, dann den abnehmenden Halbmond, das letzte Viertel und die abnehmende Sichel. Der Kalender zeigt auch den Beleuchtungsprozentsatz und das Mondalter für jeden Tag.',
    id: 'Kalender ini menampilkan fase Bulan harian dan tanggal purnama serta bulan baru untuk bulan Masehi saat ini. Anda dapat melacak perkembangan Bulan hari demi hari dan melihat tahap bulanan lengkap dari bulan baru ke sabit awal, kuartal pertama, gibbous awal, purnama, kemudian gibbous akhir, kuartal terakhir, dan sabit akhir. Kalender juga menampilkan persentase iluminasi dan usia Bulan setiap hari.',
    es: 'Este calendario muestra las fases diarias de la Luna y las fechas de luna llena y luna nueva para el mes gregoriano actual. Puede seguir la progresión de la Luna día a día y ver las etapas mensuales completas desde la luna nueva hasta la creciente, el primer cuarto, la gibosa creciente, la luna llena, luego la gibosa menguante, el último cuarto y la creciente menguante. El calendario también muestra el porcentaje de iluminación y la edad de la Luna para cada día.',
    bn: 'এই ক্যালেন্ডার বর্তমান গ্রেগরিয়ান মাসের জন্য দৈনিক চাঁদের দশা এবং পূর্ণিমা ও অমাবস্যার তারিখ প্রদর্শন করে। আপনি দিন দিন চাঁদের অগ্রগতি ট্র্যাক করতে এবং অমাবস্যা থেকে বৃদ্ধিমান অর্ধচন্দ্র, প্রথম পাদ, বৃদ্ধিমান গিবাস, পূর্ণিমা, তারপর হ্রাসমান গিবাস, শেষ পাদ এবং হ্রাসমান অর্ধচন্দ্র পর্যন্ত সম্পূর্ণ মাসিক পর্যায় দেখতে পারেন। ক্যালেন্ডার প্রতিদিনের জন্য আলোকন শতাংশ এবং চাঁদের বয়সও দেখায়।',
    ms: 'Kalendar ini memaparkan fasa Bulan harian dan tarikh bulan purnama serta anak bulan untuk bulan Masehi semasa. Anda boleh menjejaki perkembangan Bulan hari demi hari dan melihat peringkat bulanan lengkap dari anak bulan ke sabit membesar, suku pertama, gibbous membesar, purnama, kemudian gibbous mengecil, suku terakhir, dan sabit mengecil. Kalendar juga memaparkan peratus pencahayaan dan usia Bulan untuk setiap hari.',
};

// Section 2 — Monthly phases explainer
const SEC2_H2 = {
    ar: 'كيف تتغير مراحل القمر في',
    en: 'How Moon Phases Change in',
    fr: 'Comment les phases de la Lune changent à',
    tr: "'da Ay Evreleri Nasıl Değişir",
    ur: 'میں چاند کے مراحل کیسے بدلتے ہیں',
    de: 'Wie sich die Mondphasen ändern in',
    id: 'Bagaimana Fase Bulan Berubah di',
    es: 'Cómo cambian las fases de la Luna en',
    bn: '-এ চাঁদের দশা কীভাবে পরিবর্তন হয়',
    ms: 'Bagaimana Fasa Bulan Berubah di',
};

const SEC2_P = {
    ar: 'تتغير مراحل القمر بشكل تدريجي خلال الشهر القمري الذي يبلغ متوسطه 29.5 يوماً. يبدأ القمر من المحاق غير المرئي، ثم يظهر كهلال متزايد رفيع، يتطور إلى التربيع الأول، فالأحدب المتزايد، حتى يصل إلى البدر المكتمل في منتصف الشهر تقريباً. بعد البدر يبدأ التناقص: الأحدب المتناقص، التربيع الأخير، الهلال المتناقص، ثم العودة إلى المحاق. قد تختلف أوقات ظهور هذه الأطوار في مدينتك بحسب المنطقة الزمنية وموقع القمر فلكياً.',
    en: 'Moon phases change gradually throughout the lunar month, which averages 29.5 days. The moon starts as an invisible new moon, then appears as a thin waxing crescent, grows into the first quarter, then waxing gibbous, reaching the full moon around mid-month. After the full moon, it wanes: waning gibbous, last quarter, waning crescent, then back to new moon. The exact timing of these phases in your city varies based on time zone and the moon\'s astronomical position.',
    fr: "Les phases de la Lune changent progressivement au cours du mois lunaire d'environ 29,5 jours. La Lune commence par une nouvelle lune invisible, puis apparaît comme un mince croissant croissant, devient le premier quartier, puis la gibbeuse croissante, atteignant la pleine lune vers le milieu du mois. Après la pleine lune, elle décroît : gibbeuse décroissante, dernier quartier, croissant décroissant, puis retour à la nouvelle lune. Les heures précises de ces phases dans votre ville varient selon le fuseau horaire et la position astronomique de la Lune.",
    tr: 'Ay evreleri ortalama 29,5 gün süren ay döngüsü boyunca aşamalı olarak değişir. Ay görünmez yeni ay olarak başlar, ardından ince büyüyen hilal olarak görünür, ilk dördüne büyür, sonra büyüyen şişkin aya, ay ortası civarında dolunaya ulaşır. Dolunaydan sonra azalır: küçülen şişkin ay, son dördün, küçülen hilal, ardından tekrar yeni aya. Şehrinizdeki bu evrelerin tam zamanlaması, saat dilimine ve Ayın astronomik konumuna göre değişir.',
    ur: 'چاند کے مراحل قمری مہینے کے دوران تدریجی طور پر بدلتے ہیں جو اوسطاً 29.5 دن کا ہوتا ہے۔ چاند غیر مرئی نئے چاند کے طور پر شروع ہوتا ہے، پھر باریک بڑھتے ہلال کے طور پر ظاہر ہوتا ہے، پہلی چوتھائی میں بڑھتا ہے، پھر بڑھتا گبس، مہینے کے وسط میں مکمل بدر تک پہنچتا ہے۔ بدر کے بعد یہ گھٹتا ہے: گھٹتا گبس، آخری چوتھائی، گھٹتا ہلال، پھر دوبارہ نئے چاند کی طرف۔ آپ کے شہر میں ان مراحل کے درست اوقات ٹائم زون اور چاند کی فلکی پوزیشن کے مطابق مختلف ہوتے ہیں۔',
    de: 'Die Mondphasen ändern sich allmählich während des Mondmonats, der durchschnittlich 29,5 Tage dauert. Der Mond beginnt als unsichtbarer Neumond, erscheint dann als dünne zunehmende Sichel, wächst zum ersten Viertel, dann zum zunehmenden Halbmond und erreicht etwa zur Monatsmitte den Vollmond. Nach dem Vollmond nimmt er ab: abnehmender Halbmond, letztes Viertel, abnehmende Sichel, dann zurück zum Neumond. Die genauen Zeiten dieser Phasen in Ihrer Stadt variieren je nach Zeitzone und astronomischer Position des Mondes.',
    id: 'Fase Bulan berubah secara bertahap sepanjang bulan lunar yang rata-rata 29,5 hari. Bulan dimulai sebagai bulan baru yang tidak terlihat, kemudian muncul sebagai sabit awal yang tipis, tumbuh menjadi kuartal pertama, lalu gibbous awal, mencapai purnama sekitar pertengahan bulan. Setelah purnama, ia menyusut: gibbous akhir, kuartal terakhir, sabit akhir, lalu kembali ke bulan baru. Waktu pasti dari fase-fase ini di kota Anda bervariasi berdasarkan zona waktu dan posisi astronomi Bulan.',
    es: 'Las fases de la Luna cambian gradualmente durante el mes lunar, que promedia 29,5 días. La Luna comienza como una luna nueva invisible, luego aparece como un creciente delgado, crece al primer cuarto, después gibosa creciente, alcanzando la luna llena a mediados del mes. Después de la luna llena, mengua: gibosa menguante, último cuarto, creciente menguante, luego de vuelta a luna nueva. Los tiempos exactos de estas fases en su ciudad varían según la zona horaria y la posición astronómica de la Luna.',
    bn: 'চাঁদের দশা গড়ে ২৯.৫ দিনের চান্দ্র মাস জুড়ে ধীরে ধীরে পরিবর্তিত হয়। চাঁদ একটি অদৃশ্য অমাবস্যা হিসেবে শুরু হয়, তারপর একটি পাতলা বৃদ্ধিমান অর্ধচন্দ্র হিসেবে প্রদর্শিত হয়, প্রথম পাদে বৃদ্ধি পায়, তারপর বৃদ্ধিমান গিবাস, মাসের মাঝামাঝি পূর্ণিমায় পৌঁছায়। পূর্ণিমার পরে এটি হ্রাস পায়: হ্রাসমান গিবাস, শেষ পাদ, হ্রাসমান অর্ধচন্দ্র, তারপর আবার অমাবস্যায়। আপনার শহরে এই দশাগুলির সঠিক সময় টাইম জোন এবং চাঁদের জ্যোতির্বিদ্যা অবস্থানের উপর নির্ভর করে পরিবর্তিত হয়।',
    ms: 'Fasa Bulan berubah secara beransur-ansur sepanjang bulan lunar yang berpurata 29.5 hari. Bulan bermula sebagai anak bulan yang tidak kelihatan, kemudian muncul sebagai sabit nipis membesar, tumbuh ke suku pertama, kemudian gibbous membesar, mencapai bulan purnama sekitar pertengahan bulan. Selepas purnama, ia mengecil: gibbous mengecil, suku terakhir, sabit mengecil, kemudian kembali ke anak bulan. Masa tepat fasa-fasa ini di bandar anda berbeza-beza mengikut zon waktu dan kedudukan astronomi Bulan.',
};

// Section 3 — "Days remaining" explainer (covers بعد, يومًا)
const SEC3_H2 = {
    ar: 'ماذا تعني الأيام المتبقية للأطوار القادمة؟',
    en: 'What Do "Days Remaining" Mean for Upcoming Phases?',
    fr: 'Que signifie "jours restants" pour les phases à venir ?',
    tr: 'Yaklaşan Evreler İçin "Kalan Günler" Ne Anlama Gelir?',
    ur: 'آنے والے مراحل کے لیے "باقی دن" کا کیا مطلب ہے؟',
    de: 'Was bedeutet "verbleibende Tage" für kommende Phasen?',
    id: 'Apa Arti "Hari Tersisa" untuk Fase Mendatang?',
    es: '¿Qué significan los "días restantes" para las próximas fases?',
    bn: 'আসন্ন দশার জন্য "অবশিষ্ট দিন" এর অর্থ কী?',
    ms: 'Apa Maksud "Hari Berbaki" untuk Fasa Akan Datang?',
};

const SEC3_P = {
    ar: 'يظهر التقويم عبارات مثل "بعد عدة أيام" أو "بعد كذا يوماً" بجانب كل طور قادم. هذه الأرقام تعد الأيام بين تاريخ اليوم والتاريخ الفلكي الدقيق للطور القادم. على سبيل المثال، إذا كان البدر القادم بعد 7 أيام، يعني أن القمر سيصل إلى أقصى إضاءته بعد سبعة أيام تقريباً من اليوم. تتغير هذه الأرقام يومياً مع تقدم الوقت، ويمكن للمستخدم متابعة الأيام المتبقية لكل من البدر، المحاق، التربيع الأول، والتربيع الأخير.',
    en: 'The calendar shows phrases like "in several days" or "in X days" next to each upcoming phase. These numbers count the days between today and the precise astronomical date of the next phase. For example, if the next full moon is in 7 days, the moon will reach its peak illumination approximately seven days from today. These numbers update daily as time progresses, and users can track remaining days for the full moon, new moon, first quarter, and last quarter.',
    fr: 'Le calendrier affiche des expressions comme "dans plusieurs jours" ou "dans X jours" à côté de chaque phase à venir. Ces nombres comptent les jours entre aujourd\'hui et la date astronomique précise de la prochaine phase. Par exemple, si la prochaine pleine lune est dans 7 jours, la Lune atteindra son illumination maximale environ sept jours à partir d\'aujourd\'hui. Ces nombres se mettent à jour quotidiennement, et les utilisateurs peuvent suivre les jours restants pour la pleine lune, la nouvelle lune, le premier quartier et le dernier quartier.',
    tr: 'Takvim, her yaklaşan evrenin yanında "birkaç gün içinde" veya "X gün içinde" gibi ifadeler gösterir. Bu sayılar bugün ile bir sonraki evrenin kesin astronomik tarihi arasındaki günleri sayar. Örneğin, sıradaki dolunay 7 gün içindeyse, Ay yaklaşık yedi gün sonra en yüksek aydınlığına ulaşacaktır. Bu sayılar zaman ilerledikçe günlük olarak güncellenir ve kullanıcılar dolunay, yeni ay, ilk dördün ve son dördün için kalan günleri takip edebilir.',
    ur: 'تقویم ہر آنے والے مرحلے کے ساتھ "کچھ دنوں میں" یا "X دنوں میں" جیسے فقرے دکھاتی ہے۔ یہ نمبر آج اور اگلے مرحلے کی درست فلکی تاریخ کے درمیان دنوں کو شمار کرتے ہیں۔ مثال کے طور پر، اگر اگلا بدر 7 دنوں میں ہے، تو چاند آج سے تقریباً سات دن بعد اپنی سب سے زیادہ روشنی تک پہنچے گا۔ یہ نمبر وقت گزرنے کے ساتھ روزانہ اپ ڈیٹ ہوتے ہیں، اور صارفین بدر، نئے چاند، پہلی چوتھائی اور آخری چوتھائی کے باقی دنوں کو ٹریک کر سکتے ہیں۔',
    de: 'Der Kalender zeigt Ausdrücke wie "in mehreren Tagen" oder "in X Tagen" neben jeder kommenden Phase. Diese Zahlen zählen die Tage zwischen heute und dem genauen astronomischen Datum der nächsten Phase. Wenn der nächste Vollmond beispielsweise in 7 Tagen ist, wird der Mond seine maximale Beleuchtung in etwa sieben Tagen ab heute erreichen. Diese Zahlen werden täglich aktualisiert, und Nutzer können die verbleibenden Tage für Vollmond, Neumond, erstes Viertel und letztes Viertel verfolgen.',
    id: 'Kalender menampilkan frasa seperti "dalam beberapa hari" atau "dalam X hari" di samping setiap fase mendatang. Angka-angka ini menghitung hari antara hari ini dan tanggal astronomi yang tepat dari fase berikutnya. Misalnya, jika purnama berikutnya dalam 7 hari, Bulan akan mencapai puncak iluminasinya sekitar tujuh hari dari sekarang. Angka-angka ini diperbarui setiap hari seiring berjalannya waktu, dan pengguna dapat melacak hari yang tersisa untuk purnama, bulan baru, kuartal pertama, dan kuartal terakhir.',
    es: 'El calendario muestra frases como "en varios días" o "en X días" junto a cada fase próxima. Estos números cuentan los días entre hoy y la fecha astronómica precisa de la próxima fase. Por ejemplo, si la próxima luna llena es en 7 días, la Luna alcanzará su iluminación máxima aproximadamente siete días desde hoy. Estos números se actualizan diariamente, y los usuarios pueden rastrear los días restantes para la luna llena, luna nueva, primer cuarto y último cuarto.',
    bn: 'ক্যালেন্ডার প্রতিটি আসন্ন দশার পাশে "কয়েক দিনের মধ্যে" বা "X দিনের মধ্যে" এর মতো বাক্যাংশ দেখায়। এই সংখ্যাগুলি আজকের এবং পরবর্তী দশার সঠিক জ্যোতির্বিদ্যা তারিখের মধ্যে দিন গণনা করে। উদাহরণস্বরূপ, যদি পরবর্তী পূর্ণিমা 7 দিনে হয়, চাঁদ আজ থেকে প্রায় সাত দিন পরে তার সর্বোচ্চ আলোকনে পৌঁছাবে। এই সংখ্যাগুলি প্রতিদিন আপডেট হয়, এবং ব্যবহারকারীরা পূর্ণিমা, অমাবস্যা, প্রথম পাদ এবং শেষ পাদের জন্য অবশিষ্ট দিনগুলি ট্র্যাক করতে পারেন।',
    ms: 'Kalendar menunjukkan frasa seperti "dalam beberapa hari" atau "dalam X hari" di sebelah setiap fasa akan datang. Angka-angka ini mengira hari antara hari ini dan tarikh astronomi tepat fasa seterusnya. Sebagai contoh, jika purnama seterusnya dalam 7 hari, Bulan akan mencapai pencahayaan puncaknya kira-kira tujuh hari dari sekarang. Angka-angka ini dikemas kini setiap hari, dan pengguna boleh menjejaki baki hari untuk purnama, anak bulan, suku pertama, dan suku terakhir.',
};

// Build the SSR injection block. Inserts a try/catch wrapper that:
//   1. Computes current month name + year (per lang)
//   2. Builds 3 H2 sections with city + month interpolated
//   3. Injects them just before the moon-other-cities section
//
// Anchor for insertion: the existing "moon-other-cities" section opener
// in the rendered HTML. We inject 3 sections immediately before it.
const INJECTION_BLOCK = [
    ``,
    `        // ── Phase M1 (2026-05-03): inject 3 SSR-visible H2 sections on /moon-in-{city}`,
    `        //    (Hub only — NOT month pages, NOT date pages, NOT today pages).`,
    `        //    Adds natural educational prose covering the dynamic monthly terms`,
    `        //    that SEOptimer flagged on /moon-in-riyadh: مايو, مايو 2026, أحدب,`,
    `        //    متناقص, هلال, متزايد, بعد, يومًا. Same SSR pattern as`,
    `        //    E2-keywords-Hub-final but with month-name interpolation per lang.`,
    `        //    Pre-flight: ONLY runs when seo.moonCity.isHub === true AND`,
    `        //    seo.moonCity.isMonthPage === false (so month pages are excluded).`,
    `        if (seo.moonCity && seo.moonCity.isHub && !seo.moonCity.isMonthPage) {`,
    `            try {`,
    `                const _m1Lang = seo.lang || 'ar';`,
    `                const _m1Pick = (m) => m[_m1Lang] || m.en;`,
    `                const _m1City = _escHtml(seo.moonCity.name || '');`,
    ``,
    `                // Compute current month name + year per lang (matches existing _gMonthFullByLangT)`,
    `                const _m1Now = new Date();`,
    `                const _m1MonthIdx = _m1Now.getMonth();`,
    `                const _m1Year = _m1Now.getFullYear();`,
    `                const _m1MonthsByLang = {`,
    `                    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],`,
    `                    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],`,
    `                    fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],`,
    `                    tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],`,
    `                    ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],`,
    `                    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],`,
    `                    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],`,
    `                    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],`,
    `                    bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],`,
    `                    ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'],`,
    `                };`,
    `                const _m1MonthName = _escHtml((_m1MonthsByLang[_m1Lang] || _m1MonthsByLang.en)[_m1MonthIdx]);`,
    ``,
    `                // Section 1 — Monthly title H2 (covers month name + year + city + tag-line)`,
    _serializeLangMap('_m1Sec1H2', SEC1_H2, '                '),
    _serializeLangMap('_m1Sec1P', SEC1_P, '                '),
    `                const _m1Sec1Html = '<section class="section-card moon-seo-info moon-seo-month-title">'`,
    `                    + '<h2>' + _escHtml(_m1Pick(_m1Sec1H2)) + ' ' + _m1City + ' '`,
    `                    + (_m1Lang === 'ar' ? 'خلال ' : (_m1Lang === 'tr' ? '— ' : '— '))`,
    `                    + _m1MonthName + ' ' + _m1Year + '</h2>'`,
    `                    + '<p>' + _escHtml(_m1Pick(_m1Sec1P)) + '</p>'`,
    `                    + '</section>';`,
    ``,
    `                // Section 2 — Monthly phases explainer (covers هلال/تربيع/أحدب/بدر/متناقص/متزايد)`,
    _serializeLangMap('_m1Sec2H2', SEC2_H2, '                '),
    _serializeLangMap('_m1Sec2P', SEC2_P, '                '),
    `                // Build H2 with city interpolation per-lang sentence shape`,
    `                const _m1Sec2H2Built = (_m1Lang === 'ar' || _m1Lang === 'ur')`,
    `                    ? (_escHtml(_m1Pick(_m1Sec2H2)) + ' ' + _m1City + ' خلال الشهر؟')`,
    `                    : (_m1Lang === 'tr' ? (_m1City + _escHtml(_m1Pick(_m1Sec2H2)) + '?')`,
    `                    : (_m1Lang === 'bn') ? (_m1City + _escHtml(_m1Pick(_m1Sec2H2)) + ' এই মাসে?')`,
    `                    : (_escHtml(_m1Pick(_m1Sec2H2)) + ' ' + _m1City + (_m1Lang === 'fr' ? ' ce mois ?' : ' this month?')));`,
    `                const _m1Sec2Html = '<section class="section-card moon-seo-info moon-seo-phases">'`,
    `                    + '<h2>' + _m1Sec2H2Built + '</h2>'`,
    `                    + '<p>' + _escHtml(_m1Pick(_m1Sec2P)) + '</p>'`,
    `                    + '</section>';`,
    ``,
    `                // Section 3 — Days-remaining explainer (covers بعد + يومًا)`,
    _serializeLangMap('_m1Sec3H2', SEC3_H2, '                '),
    _serializeLangMap('_m1Sec3P', SEC3_P, '                '),
    `                const _m1Sec3Html = '<section class="section-card moon-seo-info moon-seo-days-remaining">'`,
    `                    + '<h2>' + _escHtml(_m1Pick(_m1Sec3H2)) + '</h2>'`,
    `                    + '<p>' + _escHtml(_m1Pick(_m1Sec3P)) + '</p>'`,
    `                    + '</section>';`,
    ``,
    `                // Inject all 3 sections immediately before the moon-other-cities block`,
    `                const _m1AllSections = _m1Sec1Html + _m1Sec2Html + _m1Sec3Html;`,
    `                html = html.replace(`,
    `                    /<div class="section-card" id="moon-other-cities"/,`,
    `                    _m1AllSections + '<div class="section-card" id="moon-other-cities"'`,
    `                );`,
    `            } catch (_e) { /* silent — M1 SSR injection optional, page still serves */ }`,
    `        }`,
    ``,
].join(EOL);

// Insert M1 block right after the Hub intro block (line 9219 area: end of moon-intro replace)
const INJECTION_ANCHOR = [
`            html = html.replace(`,
`                /<p class="moon-intro" id="moon-intro"[^>]*>[^<]*<\\/p>/,`,
`                \`<p class="moon-intro" id="moon-intro">\${_escHtml(_hubIntroText)}</p>\``,
`            );`,
`        }`,
].join(EOL);

const INJECTION_REPLACEMENT = INJECTION_ANCHOR + INJECTION_BLOCK;

replaceOnce('PART 2 — 3 SSR H2 sections injection', INJECTION_ANCHOR, INJECTION_REPLACEMENT);

writeFileSync(PATH, raw);

console.log('\n✅ Phase M1 — moon-in-{city} SEO cleanup complete.');
console.log('\nChanges applied:');
console.log('  • Title for /moon-in-{city} extended to ~50 chars (10 langs)');
console.log('  • 3 SSR H2 sections injected on /moon-in-{city} only (NOT month/date pages)');
console.log('\nSection coverage:');
console.log('  Section 1 → covers مايو + 2026 + تقويم القمر');
console.log('  Section 2 → covers هلال/تربيع/أحدب/بدر/متناقص/متزايد + مراحل القمر');
console.log('  Section 3 → covers بعد + يومًا + الأطوار القادمة');
