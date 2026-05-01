// Phase E2-keywords-Hub-final — inject 4 SSR-only content blocks for /moon-today.
//
// Per user spec (2026-05-01): SEOptimer still flags /moon-today (Hub) on:
//   1. Keyword Consistency: بدر, قمر مكتمل, طور القمر, مكة المكرمة, مواقيت الصلاة
//   2. Amount of Content: Low / thin (city pages have 1187 words, Hub has ~600)
//
// Solution: inject NATURAL educational content covering remaining keywords without
// touching Title/Meta/H1. 3 new H2 sections + 1 footer note inside the FAQ.
// All content lives ONLY in /moon-today HTML stream (pure SSR injection,
// inside `if (_isMoonTodayHub) { ... }`). NOT injected on /moon-today-in-{city}
// or /moon-in-{city} (those pages are already SEOptimer-green).
//
// Hard rules carried over from prior phases:
//   • NO `.hub-only` class (would hide content from SEOptimer crawler)
//   • NO `data-i18n` attribute (would be overwritten by _translateI18nAttrs)
//   • NO month name "مايو" or year "2026" in any new heading (no monthly rotation)
//   • NO "مكة المكرمة" in Title or H1 (Hub stays generic)
//   • Single H1 preserved (these are H2)
//
// Content placement order (matches user spec):
//   #moon-main-card → [SECTION 1: Phase] → #moon-current-month-h2 →
//   #moon-upcoming-section → [SECTION 2: Badr] → [SECTION 3: City] →
//   #moon-other-cities → #moon-hub-faq{ ...details... [SECTION 4: footer note] }

import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
const raw  = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/E2-keywords-Hub-final/.test(raw)) {
    throw new Error('[server.js] E2-keywords-Hub-final block already present — script already ran?');
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-section content (10 langs each). Stored as JS objects below — when the
// migration runs, they get serialized into the SSR injection block as object
// literals. We use template-literal-friendly escaping; AR text uses native
// Arabic chars (no Unicode escapes needed).
// ─────────────────────────────────────────────────────────────────────────────

// ── SECTION 1: طور القمر اليوم ونسبة الإضاءة ────────────────────────────────
const SEC1_H2 = {
    ar: 'طور القمر اليوم ونسبة الإضاءة',
    en: "Today's Moon Phase and Illumination",
    fr: "Phase de la Lune aujourd'hui et illumination",
    tr: 'Bugünkü Ay Evresi ve Aydınlanma',
    ur: 'آج چاند کا مرحلہ اور روشنی کا فیصد',
    de: 'Heutige Mondphase und Beleuchtung',
    id: 'Fase Bulan Hari Ini dan Iluminasi',
    es: 'Fase de la Luna hoy e iluminación',
    bn: 'আজকের চাঁদের দশা ও আলোকন',
    ms: 'Fasa Bulan Hari Ini dan Pencahayaan',
};
const SEC1_P = {
    ar: 'تعرض صفحة حالة القمر اليوم الطور الحالي للقمر ونسبة الإضاءة وعمر القمر منذ آخر محاق. يتغير طور القمر يومياً بحسب موقعه بالنسبة إلى الشمس والأرض، لذلك تساعد هذه الصفحة على متابعة التغير اليومي في شكل القمر وحركته خلال الشهر الهجري. تشمل بيانات القمر اليوم: نسبة الإضاءة الحالية، عمر القمر بالأيام، المسافة بين الأرض والقمر بالكيلومترات، ومواعيد طلوع القمر وغروبه التقريبية.',
    en: "This page shows today's moon phase, the current illumination percentage, and the moon's age since the last new moon. The moon phase changes daily based on the moon's position relative to the Sun and Earth, so this page helps you track the daily change in the moon's shape and motion throughout the Hijri month. Today's moon data includes: current illumination percentage, moon age in days, the Earth-moon distance in kilometers, and approximate moonrise and moonset times.",
    fr: "Cette page affiche la phase actuelle de la Lune aujourd'hui, le pourcentage d'illumination et l'âge de la Lune depuis la dernière nouvelle lune. La phase lunaire change quotidiennement selon la position de la Lune par rapport au Soleil et à la Terre, ce qui permet de suivre l'évolution quotidienne de la forme de la Lune et son mouvement durant le mois hégirien. Les données incluent le pourcentage d'illumination actuel, l'âge de la Lune en jours, la distance Terre-Lune en kilomètres, et les heures approximatives de lever et coucher.",
    tr: 'Bu sayfa, ayın bugünkü mevcut evresini, aydınlanma yüzdesini ve son yeni aydan bu yana ayın yaşını gösterir. Ay evresi, Güneş ve Dünya\'ya göre konumuna bağlı olarak günlük değişir, bu nedenle bu sayfa hicri ay boyunca ayın şeklindeki günlük değişimi ve hareketini takip etmenize yardımcı olur. Bugünkü ay verileri şunları içerir: güncel aydınlanma yüzdesi, gün olarak ay yaşı, kilometre cinsinden Dünya-Ay mesafesi ve yaklaşık ay doğuşu ve batış saatleri.',
    ur: 'یہ صفحہ آج چاند کا موجودہ مرحلہ، روشنی کا فیصد، اور آخری نئے چاند سے چاند کی عمر دکھاتا ہے۔ چاند کا مرحلہ سورج اور زمین کے نسبت اس کی پوزیشن کے مطابق روزانہ تبدیل ہوتا ہے، اس لیے یہ صفحہ ہجری مہینے کے دوران چاند کی شکل میں روزانہ تبدیلی اور اس کی حرکت کا پتہ لگانے میں مدد کرتا ہے۔ آج کے چاند کا ڈیٹا شامل ہے: موجودہ روشنی کا فیصد، دنوں میں چاند کی عمر، کلومیٹر میں زمین چاند فاصلہ، اور تقریبی طلوع و غروب کے اوقات۔',
    de: 'Diese Seite zeigt die heutige Mondphase, den aktuellen Beleuchtungsprozentsatz und das Alter des Mondes seit dem letzten Neumond. Die Mondphase ändert sich täglich je nach Position des Mondes relativ zur Sonne und Erde, weshalb diese Seite Ihnen hilft, die tägliche Veränderung der Mondform und seine Bewegung während des Hidschri-Monats zu verfolgen. Die heutigen Monddaten umfassen den aktuellen Beleuchtungsprozentsatz, das Mondalter in Tagen, die Erde-Mond-Entfernung in Kilometern und ungefähre Mondaufgangs- und Untergangszeiten.',
    id: 'Halaman ini menampilkan fase Bulan saat ini hari ini, persentase iluminasi, dan usia Bulan sejak bulan baru terakhir. Fase Bulan berubah setiap hari tergantung posisinya relatif terhadap Matahari dan Bumi, sehingga halaman ini membantu Anda melacak perubahan harian dalam bentuk Bulan dan pergerakannya selama bulan Hijriah. Data Bulan hari ini meliputi: persentase iluminasi saat ini, usia Bulan dalam hari, jarak Bumi-Bulan dalam kilometer, dan perkiraan waktu terbit dan terbenam Bulan.',
    es: 'Esta página muestra la fase actual de la Luna hoy, el porcentaje de iluminación y la edad de la Luna desde la última luna nueva. La fase lunar cambia diariamente según su posición respecto al Sol y a la Tierra, por lo que esta página le ayuda a seguir el cambio diario en la forma de la Luna y su movimiento durante el mes hijri. Los datos lunares de hoy incluyen el porcentaje de iluminación actual, la edad de la Luna en días, la distancia Tierra-Luna en kilómetros y los horarios aproximados de salida y puesta.',
    bn: 'এই পৃষ্ঠাটি আজকের চাঁদের বর্তমান দশা, আলোকন শতাংশ, এবং সর্বশেষ অমাবস্যা থেকে চাঁদের বয়স প্রদর্শন করে। চাঁদের দশা সূর্য এবং পৃথিবীর সাপেক্ষে এর অবস্থানের উপর নির্ভর করে প্রতিদিন পরিবর্তন হয়, তাই এই পৃষ্ঠাটি হিজরি মাস জুড়ে চাঁদের আকারে দৈনিক পরিবর্তন এবং এর গতি ট্র্যাক করতে সাহায্য করে। আজকের চাঁদের তথ্যের মধ্যে রয়েছে: বর্তমান আলোকন শতাংশ, দিনের হিসেবে চাঁদের বয়স, কিলোমিটারে পৃথিবী-চাঁদ দূরত্ব এবং চাঁদের আনুমানিক উদয় ও অস্তের সময়।',
    ms: 'Halaman ini memaparkan fasa Bulan semasa hari ini, peratus pencahayaan, dan usia Bulan sejak anak bulan terakhir. Fasa Bulan berubah setiap hari bergantung pada kedudukannya berbanding Matahari dan Bumi, jadi halaman ini membantu anda mengikuti perubahan harian dalam bentuk Bulan dan pergerakannya sepanjang bulan Hijrah. Data Bulan hari ini meliputi: peratus pencahayaan semasa, usia Bulan dalam hari, jarak Bumi-Bulan dalam kilometer, dan waktu terbit dan terbenam Bulan yang anggaran.',
};

// ── SECTION 2: موعد البدر القادم والقمر المكتمل ─────────────────────────────
// AR text per user's reworded version (more natural).
const SEC2_H2 = {
    ar: 'موعد البدر القادم والقمر المكتمل',
    en: 'Next Full Moon Date and Full Moon Stage',
    fr: 'Date de la prochaine pleine lune et étape',
    tr: 'Sıradaki Dolunay Tarihi ve Dolunay Aşaması',
    ur: 'اگلے بدر کی تاریخ اور مکمل چاند کا مرحلہ',
    de: 'Nächstes Vollmond-Datum und Vollmondphase',
    id: 'Tanggal Purnama Berikutnya dan Tahap Bulan Purnama',
    es: 'Próxima fecha de luna llena y etapa',
    bn: 'পরবর্তী পূর্ণিমার তারিখ ও পূর্ণ চাঁদের পর্যায়',
    ms: 'Tarikh Bulan Purnama Seterusnya dan Peringkat Purnama',
};
const SEC2_P = {
    ar: 'يوضح هذا القسم موعد البدر القادم ومرحلة القمر المكتمل ضمن الدورة القمرية الحالية. عند ظهور بدر قمر مكتمل، يصل القمر إلى أعلى نسبة إضاءة، ويمكن مقارنة ذلك مع مراحل القمر الأخرى مثل المحاق والتربيع الأول والتربيع الأخير. تتغير حالة القمر يومياً وتمر بعدة أطوار بين المحاق والبدر، ولكل طور علاماته البصرية ومدته الزمنية ضمن الشهر القمري الذي يبلغ متوسطه 29.5 يوماً.',
    en: "This section explains the date of the next full moon and the full moon stage within the current lunar cycle. When a full moon (badr) appears, the moon reaches its peak illumination, and this can be compared with other moon phases such as new moon, first quarter, and last quarter. The moon's state changes daily and passes through several phases between new moon and full moon, with each phase having its own visual markers and duration within the lunar month, which averages 29.5 days.",
    fr: "Cette section explique la date de la prochaine pleine lune et l'étape de la pleine lune dans le cycle lunaire actuel. Lorsqu'une pleine lune apparaît, la Lune atteint son pic d'illumination, ce qui peut être comparé aux autres phases lunaires comme la nouvelle lune, le premier quartier et le dernier quartier. L'état de la Lune change quotidiennement et passe par plusieurs phases entre la nouvelle lune et la pleine lune, chaque phase ayant ses repères visuels et sa durée dans le mois lunaire d'environ 29,5 jours.",
    tr: 'Bu bölüm, mevcut ay döngüsündeki sıradaki dolunay tarihini ve dolunay aşamasını açıklar. Bir dolunay göründüğünde, Ay en yüksek aydınlanmasına ulaşır ve bu, yeni ay, ilk dördün ve son dördün gibi diğer ay evreleriyle karşılaştırılabilir. Ayın durumu günlük olarak değişir ve yeni ay ile dolunay arasında birkaç evre geçirir; her evrenin kendi görsel işaretleri ve süresi vardır ve ortalama 29,5 gün süren ay döngüsü içinde yer alır.',
    ur: 'یہ سیکشن موجودہ قمری چکر میں اگلے بدر کی تاریخ اور مکمل چاند کے مرحلے کی وضاحت کرتا ہے۔ جب بدر مکمل چاند ظاہر ہوتا ہے، چاند اپنی سب سے زیادہ روشنی تک پہنچتا ہے، اور اس کا موازنہ چاند کے دوسرے مراحل جیسے نئے چاند، پہلے چوتھائی اور آخری چوتھائی سے کیا جا سکتا ہے۔ چاند کی حالت روزانہ تبدیل ہوتی ہے اور نئے چاند سے بدر تک کئی مراحل سے گزرتی ہے، ہر مرحلے کے اپنے بصری نشانات اور مدت ہوتی ہے، جو اوسطاً 29.5 دنوں کے قمری مہینے میں آتی ہے۔',
    de: 'Dieser Abschnitt erklärt das Datum des nächsten Vollmonds und die Vollmondphase innerhalb des aktuellen Mondzyklus. Wenn ein Vollmond erscheint, erreicht der Mond seine maximale Beleuchtung und kann mit anderen Mondphasen wie Neumond, erstem Viertel und letztem Viertel verglichen werden. Der Zustand des Mondes ändert sich täglich und durchläuft mehrere Phasen zwischen Neumond und Vollmond, wobei jede Phase ihre eigenen visuellen Merkmale und Dauer innerhalb des Mondmonats hat, der durchschnittlich 29,5 Tage dauert.',
    id: 'Bagian ini menjelaskan tanggal purnama berikutnya dan tahap bulan purnama dalam siklus bulan saat ini. Ketika bulan purnama muncul, Bulan mencapai pencahayaan puncaknya, dan ini dapat dibandingkan dengan fase Bulan lainnya seperti bulan baru, kuartal pertama, dan kuartal terakhir. Keadaan Bulan berubah setiap hari dan melewati beberapa fase antara bulan baru dan bulan purnama, dengan setiap fase memiliki tanda visual dan durasi tersendiri dalam bulan lunar yang rata-rata 29,5 hari.',
    es: 'Esta sección explica la fecha de la próxima luna llena y la etapa de la luna llena dentro del ciclo lunar actual. Cuando aparece una luna llena, la Luna alcanza su iluminación máxima, lo que se puede comparar con otras fases lunares como la luna nueva, el primer cuarto y el último cuarto. El estado de la Luna cambia diariamente y pasa por varias fases entre la luna nueva y la luna llena, cada fase tiene sus propios marcadores visuales y duración dentro del mes lunar de aproximadamente 29,5 días.',
    bn: 'এই বিভাগটি বর্তমান চান্দ্র চক্রে পরবর্তী পূর্ণিমার তারিখ এবং পূর্ণ চাঁদের পর্যায় ব্যাখ্যা করে। যখন পূর্ণিমা দেখা যায়, চাঁদ তার সর্বোচ্চ আলোকনে পৌঁছে, এবং এটি অন্যান্য চাঁদের দশার সাথে তুলনা করা যেতে পারে যেমন অমাবস্যা, প্রথম পাদ এবং শেষ পাদ। চাঁদের অবস্থা প্রতিদিন পরিবর্তন হয় এবং অমাবস্যা ও পূর্ণিমার মধ্যে বিভিন্ন দশার মধ্য দিয়ে যায়, প্রতিটি দশার নিজস্ব দৃশ্যমান চিহ্ন এবং সময়কাল রয়েছে যা গড়ে 29.5 দিনের চান্দ্র মাসের মধ্যে।',
    ms: 'Bahagian ini menjelaskan tarikh bulan purnama seterusnya dan peringkat bulan purnama dalam kitaran bulan semasa. Apabila bulan purnama muncul, Bulan mencapai pencahayaan puncaknya, dan ini boleh dibandingkan dengan fasa Bulan lain seperti anak bulan, suku pertama, dan suku terakhir. Keadaan Bulan berubah setiap hari dan melalui beberapa fasa antara anak bulan dan bulan purnama, dengan setiap fasa mempunyai tanda visual dan tempohnya sendiri dalam bulan lunar yang berpurata 29.5 hari.',
};

// ── SECTION 3: حسابات القمر حسب المدينة المختارة ───────────────────────────
const SEC3_H2 = {
    ar: 'حسابات القمر حسب المدينة المختارة',
    en: 'Moon Calculations by Selected City',
    fr: 'Calculs lunaires selon la ville sélectionnée',
    tr: 'Seçilen Şehre Göre Ay Hesaplamaları',
    ur: 'منتخب شہر کے مطابق چاند کے حسابات',
    de: 'Mondberechnungen nach gewählter Stadt',
    id: 'Perhitungan Bulan Berdasarkan Kota Terpilih',
    es: 'Cálculos lunares por ciudad seleccionada',
    bn: 'নির্বাচিত শহর অনুযায়ী চাঁদের গণনা',
    ms: 'Pengiraan Bulan Mengikut Bandar Dipilih',
};
const SEC3_P = {
    ar: 'قد تظهر بيانات القمر افتراضياً لمدينة مكة المكرمة أو للمدينة التي يختارها المستخدم، مع إمكانية الانتقال إلى صفحات المدن لمتابعة حالة القمر اليوم في الرياض أو مكة المكرمة أو غيرها. تختلف أوقات شروق القمر وغروبه قليلاً حسب الموقع الجغرافي، بينما تبقى مراحل القمر العامة مرتبطة بالدورة القمرية نفسها. تتوفر بيانات القمر لجميع المدن الكبرى في العالم العربي والإسلامي.',
    en: "Moon data may appear by default for the city of Mecca or for the city selected by the user, with the option to navigate to city pages to track today's moon state in Riyadh, Mecca, or others. Moonrise and moonset times differ slightly by geographic location, while general moon phases remain tied to the lunar cycle itself. Moon data is available for all major cities in the Arab and Islamic world.",
    fr: "Les données lunaires peuvent s'afficher par défaut pour la ville de La Mecque ou pour la ville choisie par l'utilisateur, avec la possibilité d'accéder aux pages de villes pour suivre l'état actuel de la Lune à Riyad, La Mecque ou ailleurs. Les heures de lever et de coucher de la Lune diffèrent légèrement selon l'emplacement géographique, tandis que les phases lunaires générales restent liées au cycle lunaire lui-même. Les données lunaires sont disponibles pour toutes les grandes villes du monde arabe et islamique.",
    tr: 'Ay verileri varsayılan olarak Mekke şehri veya kullanıcının seçtiği şehir için görünebilir; bugünkü ay durumunu Riyad, Mekke veya diğer şehirlerde takip etmek için şehir sayfalarına gitme imkânı vardır. Ay doğuş ve batış saatleri coğrafi konuma göre biraz farklılık gösterir, genel ay evreleri ise ay döngüsünün kendisine bağlı kalır. Ay verileri Arap ve İslam dünyasının tüm büyük şehirleri için mevcuttur.',
    ur: 'چاند کا ڈیٹا بطور ڈیفالٹ مکہ مکرمہ شہر کے لیے یا صارف کے منتخب کردہ شہر کے لیے ظاہر ہو سکتا ہے، شہر کے صفحات پر جانے کے ساتھ آج کا چاند ریاض، مکہ یا دیگر میں دیکھ سکتے ہیں۔ چاند کے طلوع و غروب کے اوقات جغرافیائی محل وقوع کے مطابق تھوڑے مختلف ہوتے ہیں، جبکہ چاند کے عام مراحل قمری چکر سے ہی جڑے رہتے ہیں۔ چاند کا ڈیٹا عرب اور اسلامی دنیا کے تمام بڑے شہروں کے لیے دستیاب ہے۔',
    de: 'Monddaten können standardmäßig für die Stadt Mekka oder für die vom Benutzer ausgewählte Stadt angezeigt werden, mit der Möglichkeit, zu Stadtseiten zu navigieren, um den heutigen Mondzustand in Riad, Mekka oder anderen Städten zu verfolgen. Mondaufgangs- und Untergangszeiten unterscheiden sich leicht je nach geografischem Standort, während die allgemeinen Mondphasen an den Mondzyklus selbst gebunden bleiben. Monddaten sind für alle großen Städte der arabischen und islamischen Welt verfügbar.',
    id: 'Data Bulan dapat muncul secara default untuk kota Makkah atau untuk kota yang dipilih pengguna, dengan opsi untuk menavigasi ke halaman kota untuk melacak keadaan Bulan hari ini di Riyadh, Makkah, atau lainnya. Waktu terbit dan terbenam Bulan sedikit berbeda berdasarkan lokasi geografis, sementara fase Bulan secara umum tetap terkait dengan siklus bulan itu sendiri. Data Bulan tersedia untuk semua kota besar di dunia Arab dan Islam.',
    es: 'Los datos lunares pueden mostrarse por defecto para la ciudad de La Meca o para la ciudad seleccionada por el usuario, con la opción de navegar a las páginas de ciudades para seguir el estado actual de la Luna en Riad, La Meca u otras. Los horarios de salida y puesta de la Luna difieren ligeramente según la ubicación geográfica, mientras que las fases lunares generales permanecen vinculadas al propio ciclo lunar. Los datos lunares están disponibles para todas las principales ciudades del mundo árabe e islámico.',
    bn: 'চাঁদের তথ্য ডিফল্টরূপে মক্কা শহরের জন্য বা ব্যবহারকারীর নির্বাচিত শহরের জন্য দেখাতে পারে, রিয়াদ, মক্কা বা অন্যান্য শহরে আজকের চাঁদের অবস্থা ট্র্যাক করতে শহর পৃষ্ঠাগুলিতে নেভিগেট করার বিকল্প সহ। চাঁদের উদয় ও অস্তের সময় ভৌগলিক অবস্থান অনুযায়ী সামান্য পার্থক্য থাকে, যেখানে চাঁদের সাধারণ দশাগুলি চান্দ্র চক্রের সাথেই বাঁধা থাকে। চাঁদের তথ্য আরব ও ইসলামী বিশ্বের সমস্ত বড় শহরের জন্য উপলব্ধ।',
    ms: 'Data Bulan boleh dipaparkan secara lalai untuk bandar Mekah atau untuk bandar yang dipilih pengguna, dengan pilihan untuk melayari halaman bandar bagi memantau keadaan Bulan hari ini di Riyadh, Mekah, atau lain-lain. Waktu terbit dan terbenam Bulan sedikit berbeza mengikut lokasi geografi, sementara fasa Bulan secara umum tetap terikat dengan kitaran bulan itu sendiri. Data Bulan tersedia untuk semua bandar utama di dunia Arab dan Islam.',
};

// ── SECTION 4: footer note inside #moon-hub-faq ────────────────────────────
const SEC4_NOTE = {
    ar: 'هذه الصفحة جزء من أدوات موقع مواقيت الصلاة، وتشمل أدوات مرتبطة مثل التقويم الهجري واتجاه القبلة ومواقيت الصلاة حسب المدينة.',
    en: 'This page is part of the Prayer Times website tools, including related tools like the Hijri Calendar, Qibla Direction, and Prayer Times by city.',
    fr: 'Cette page fait partie des outils du site Heures de Prière, comprenant des outils connexes comme le Calendrier hégirien, la Direction de la Qibla et les Heures de Prière par ville.',
    tr: 'Bu sayfa, Namaz Vakitleri sitesinin araçlarının bir parçasıdır ve Hicri Takvim, Kıble Yönü ve şehre göre Namaz Vakitleri gibi ilgili araçları içerir.',
    ur: 'یہ صفحہ نماز کے اوقات کی ویب سائٹ کے ٹولز کا حصہ ہے، جس میں ہجری کیلنڈر، قبلہ کی سمت اور شہر کے مطابق نماز کے اوقات جیسے متعلقہ ٹولز شامل ہیں۔',
    de: 'Diese Seite ist Teil der Tools der Gebetszeiten-Website und umfasst verwandte Tools wie den Hidschri-Kalender, die Qibla-Richtung und die Gebetszeiten nach Stadt.',
    id: 'Halaman ini adalah bagian dari alat situs Waktu Salat, mencakup alat terkait seperti Kalender Hijriah, Arah Kiblat, dan Waktu Salat menurut kota.',
    es: 'Esta página forma parte de las herramientas del sitio Horarios de Oración, incluidas herramientas relacionadas como el Calendario hijri, la Dirección de la Qibla y los Horarios de Oración por ciudad.',
    bn: 'এই পৃষ্ঠাটি নামাজের সময় ওয়েবসাইটের সরঞ্জামের অংশ, যার মধ্যে রয়েছে হিজরি ক্যালেন্ডার, কিবলার দিক এবং শহর অনুযায়ী নামাজের সময়ের মতো সম্পর্কিত সরঞ্জাম।',
    ms: 'Halaman ini adalah sebahagian daripada alat laman web Waktu Solat, termasuk alat berkaitan seperti Kalendar Hijrah, Arah Kiblat, dan Waktu Solat mengikut bandar.',
};

// Helper: serialize a per-lang object literal as JS source
function _serializeLangMap(obj, indent = '                ') {
    return '{' + EOL +
        Object.entries(obj).map(([lang, txt]) => {
            // Single-quote the values; escape ' and \
            const esc = txt.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return `${indent}    ${lang}: '${esc}',`;
        }).join(EOL) + EOL +
        indent + '}';
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the SSR injection block. This goes RIGHT AFTER the existing
// E2-keywords block close (line 6653) and BEFORE the `}` for if (_isMoonTodayHub)
// (line 6654). Same try/catch fallback pattern as the E2-keywords block.
// ─────────────────────────────────────────────────────────────────────────────
const block = [
    `        } catch (_e) { /* silent — static AR fallback already in place */ }`,
    ``,
    `        // ── Phase E2-keywords-Hub-final (2026-05-01): inject 4 SSR-only`,
    `        //    content blocks for /moon-today (Hub) ──`,
    `        //`,
    `        // SEOptimer was flagging the Hub on:`,
    `        //   1) Keyword Consistency — بدر, قمر مكتمل, طور القمر, مكة المكرمة,`,
    `        //      مواقيت الصلاة all missing from Title/Meta/Headings (Title and`,
    `        //      Meta are intentionally NOT touched per the user's hard rule).`,
    `        //   2) Amount of Content: Low — Hub has ~600 words vs city's 1187.`,
    `        //`,
    `        // Fix: inject 3 NEW H2 sections + 1 footer note covering the missing`,
    `        // keywords naturally. Pure SSR (no index.html / CSS change). Inside`,
    `        // _isMoonTodayHub block so the content NEVER leaks to /moon-today-in-`,
    `        // {city} or /moon-in-{city} (those are already SEOptimer-green).`,
    `        //`,
    `        // Hard rules (ALL preserved):`,
    `        //   • NO .hub-only class (would hide content from SEOptimer crawler)`,
    `        //   • NO data-i18n attribute (would be overwritten by _translateI18nAttrs)`,
    `        //   • NO month name "مايو" or year in any new heading (no rotation)`,
    `        //   • NO "مكة المكرمة" in Title or H1 (Hub stays generic — body OK)`,
    `        //   • Single H1 preserved (these are H2)`,
    `        //   • Three H2 maximum, no keyword stuffing`,
    `        try {`,
    `            const _hubLang = seo.lang || 'ar';`,
    `            const _hubPick = (m) => m[_hubLang] || m.en;`,
    ``,
    `            // SECTION 1: طور القمر اليوم ونسبة الإضاءة (~80 words AR)`,
    `            //   Inserted BEFORE #moon-current-month-h2 so it sits between`,
    `            //   #moon-main-card and the month H2 — natural reading flow.`,
    `            const _hubSec1H2 = ${_serializeLangMap(SEC1_H2)};`,
    `            const _hubSec1P  = ${_serializeLangMap(SEC1_P)};`,
    `            const _hubSec1Html = '<section class="section-card moon-seo-info moon-seo-phase">'`,
    `                + '<h2>' + _escHtml(_hubPick(_hubSec1H2)) + '</h2>'`,
    `                + '<p>'  + _escHtml(_hubPick(_hubSec1P))  + '</p>'`,
    `                + '</section>';`,
    `            html = html.replace(`,
    `                /<h2 id="moon-current-month-h2"/,`,
    `                _hubSec1Html + '<h2 id="moon-current-month-h2"'`,
    `            );`,
    ``,
    `            // SECTION 2: موعد البدر القادم والقمر المكتمل (~75 words AR)`,
    `            //   Inserted AFTER #moon-upcoming-section closes — next-phases`,
    `            //   table flows into "next full moon" topic naturally.`,
    `            const _hubSec2H2 = ${_serializeLangMap(SEC2_H2)};`,
    `            const _hubSec2P  = ${_serializeLangMap(SEC2_P)};`,
    `            const _hubSec2Html = '<section class="section-card moon-seo-info moon-seo-badr">'`,
    `                + '<h2>' + _escHtml(_hubPick(_hubSec2H2)) + '</h2>'`,
    `                + '<p>'  + _escHtml(_hubPick(_hubSec2P))  + '</p>'`,
    `                + '</section>';`,
    `            html = html.replace(`,
    `                /(<section[^>]*id="moon-upcoming-section"[^>]*>[\\s\\S]*?<\\/section>)/,`,
    `                (m) => m + _hubSec2Html`,
    `            );`,
    ``,
    `            // SECTION 3: حسابات القمر حسب المدينة المختارة (~75 words AR)`,
    `            //   Inserted BEFORE #moon-other-cities — explains the default`,
    `            //   city, then the existing "moon in other cities" grid follows.`,
    `            const _hubSec3H2 = ${_serializeLangMap(SEC3_H2)};`,
    `            const _hubSec3P  = ${_serializeLangMap(SEC3_P)};`,
    `            const _hubSec3Html = '<section class="section-card moon-seo-info moon-seo-default-city">'`,
    `                + '<h2>' + _escHtml(_hubPick(_hubSec3H2)) + '</h2>'`,
    `                + '<p>'  + _escHtml(_hubPick(_hubSec3P))  + '</p>'`,
    `                + '</section>';`,
    `            html = html.replace(`,
    `                /<div class="section-card" id="moon-other-cities"/,`,
    `                _hubSec3Html + '<div class="section-card" id="moon-other-cities"'`,
    `            );`,
    ``,
    `            // SECTION 4: footer note inside #moon-hub-faq (~25 words AR)`,
    `            //   Inserted just before </section> of the FAQ — covers`,
    `            //   "مواقيت الصلاة" naturally as a "this page is part of …" line.`,
    `            const _hubSec4Note = ${_serializeLangMap(SEC4_NOTE)};`,
    `            const _hubSec4Html = '<p class="moon-seo-note">' + _escHtml(_hubPick(_hubSec4Note)) + '</p>';`,
    `            html = html.replace(`,
    `                /(<section[^>]*id="moon-hub-faq"[^>]*>[\\s\\S]*?)(<\\/section>)/,`,
    `                (m, body, close) => body + _hubSec4Html + close`,
    `            );`,
    `        } catch (_e) { /* silent — Hub-final injection failed, page still serves */ }`,
    `    }`,
].join(EOL);

const oldAnchor = `        } catch (_e) { /* silent — static AR fallback already in place */ }${EOL}    }`;
const cnt = raw.split(oldAnchor).length - 1;
if (cnt !== 1) {
    throw new Error(`Anchor: expected 1 match, got ${cnt}.`);
}

const out = raw.replace(oldAnchor, block);
writeFileSync(PATH, out);

// Word-count report
console.log('✅ Phase E2-keywords-Hub-final — SSR injection block added.');
console.log('\nWord counts (AR rendered text, all sections):');
const all = [SEC1_H2.ar, SEC1_P.ar, SEC2_H2.ar, SEC2_P.ar, SEC3_H2.ar, SEC3_P.ar, SEC4_NOTE.ar].join(' ');
const wc = all.split(/\s+/).filter(Boolean).length;
console.log(`  AR total: ${wc} words across 4 blocks (target: 250-400)`);
console.log('\nKeyword coverage check (AR):');
const keywords = ['بدر', 'قمر مكتمل', 'بدر قمر مكتمل', 'طور القمر', 'مكة المكرمة', 'مواقيت الصلاة'];
for (const k of keywords) {
    const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = all.match(re) || [];
    console.log(`  "${k}": ${matches.length} occurrence(s)`);
}
