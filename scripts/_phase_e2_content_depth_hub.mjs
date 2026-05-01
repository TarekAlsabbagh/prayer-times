// Phase E2-content-depth-Hub — fix SEOptimer "Amount of Content: Low"
// on /moon-today by adding ONE long educational section (~250 AR words).
//
// Context: After E2-keywords-Hub-final, Keyword Consistency turned ✅,
// but the page is still ~729 words vs city pages' 1187. SEOptimer flags
// it as thin. This phase adds NO new keywords (already green) — only
// depth via a single H2 + 3 paragraphs explaining how to read moon data.
//
// Per user spec:
//   • Single H2: "كيف تُقرأ بيانات القمر اليوم؟"
//   • 220-260 AR words covering: illumination, moon age, moonrise/set,
//     city differences, Hijri calendar relationship, informational notice
//   • Inserted AFTER moon-seo-phase (Section 1 from E2-final), so flow is:
//     #moon-main-card → moon-seo-phase → [NEW: moon-seo-depth] →
//     #moon-current-month-h2 → ...rest of page
//   • Pure SSR, ONLY on /moon-today (NOT on city pages)
//
// Hard rules (carried over from prior phases):
//   • NO data-i18n / .hub-only / Title-Meta-H1 changes
//   • NO new keyword-focused headings
//   • Max 1 new H2

import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
const raw  = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/E2-content-depth-Hub/.test(raw)) {
    throw new Error('[server.js] E2-content-depth-Hub block already present — script already ran?');
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-language H2 + 3 paragraphs
// ─────────────────────────────────────────────────────────────────────────────
const DEPTH_H2 = {
    ar: 'كيف تُقرأ بيانات القمر اليوم؟',
    en: "How to Read Today's Moon Data",
    fr: "Comment lire les données de la Lune aujourd'hui ?",
    tr: 'Bugünkü Ay Verileri Nasıl Okunur?',
    ur: 'آج کے چاند کا ڈیٹا کیسے پڑھیں؟',
    de: 'Wie liest man die heutigen Monddaten?',
    id: 'Bagaimana Membaca Data Bulan Hari Ini?',
    es: '¿Cómo leer los datos de la Luna hoy?',
    bn: 'আজকের চাঁদের ডেটা কীভাবে পড়বেন?',
    ms: 'Bagaimana Membaca Data Bulan Hari Ini?',
};

const DEPTH_P1 = {
    ar: 'تجمع صفحة حالة القمر اليوم بين عدة مؤشرات فلكية تساعد المستخدم على فهم شكل القمر الحالي بطريقة مبسطة. نسبة الإضاءة توضّح مقدار الجزء المضيء من قرص القمر كما يظهر من الأرض، بينما يوضح عمر القمر عدد الأيام التي مرّت منذ آخر محاق. وكلما تقدّم العمر القمري اقترب القمر من أطواره التالية، مثل التربيع الأول ثم الأحدب المتزايد وصولاً إلى البدر، وبعده يبدأ التناقص تدريجياً حتى يعود إلى المحاق من جديد.',
    en: "The today's moon page combines several astronomical indicators that help the user understand the current moon shape in a simple way. The illumination percentage shows the proportion of the lit portion of the moon disc as seen from Earth, while moon age indicates the number of days that have passed since the last new moon. As the lunar age progresses, the moon approaches its next phases, such as the first quarter and waxing gibbous, leading up to the full moon, after which it gradually wanes until returning to the new moon again.",
    fr: "La page de l'état de la Lune aujourd'hui combine plusieurs indicateurs astronomiques qui aident l'utilisateur à comprendre la forme actuelle de la Lune de façon simple. Le pourcentage d'illumination indique la proportion de la partie éclairée du disque lunaire telle qu'elle est vue depuis la Terre, tandis que l'âge de la Lune indique le nombre de jours écoulés depuis la dernière nouvelle lune. À mesure que l'âge lunaire progresse, la Lune se rapproche de ses phases suivantes, comme le premier quartier puis la Lune gibbeuse croissante, jusqu'à la pleine lune, après quoi elle décroît progressivement jusqu'au retour à la nouvelle lune.",
    tr: 'Bugünkü ay sayfası, kullanıcının mevcut ay şeklini basit bir şekilde anlamasına yardımcı olan birkaç astronomik göstergeyi birleştirir. Aydınlanma yüzdesi, Ay diskinin Dünya\'dan görüldüğü kadarıyla aydınlık kısmının oranını gösterirken, ay yaşı son yeni aydan bu yana geçen gün sayısını gösterir. Ay yaşı ilerledikçe Ay, ilk dördün, sonra büyüyen şişkin ay gibi sonraki evrelerine yaklaşır ve dolunaya ulaşır; ardından yavaş yavaş azalır ve tekrar yeni aya döner.',
    ur: 'آج کا چاند صفحہ کئی فلکی اشاروں کو یکجا کرتا ہے جو صارف کو آسان طریقے سے چاند کی موجودہ شکل سمجھنے میں مدد کرتے ہیں۔ روشنی کا فیصد چاند کی ڈسک کے روشن حصے کا تناسب ظاہر کرتا ہے جیسا کہ زمین سے دیکھا جاتا ہے، جبکہ چاند کی عمر آخری نئے چاند کے بعد سے گزرے ہوئے دنوں کی تعداد ظاہر کرتی ہے۔ جیسے جیسے قمری عمر بڑھتی ہے، چاند اپنے اگلے مراحل کے قریب آتا ہے، جیسے پہلی چوتھائی پھر بڑھتا ہوا گبس، بدر تک پہنچتا ہے، جس کے بعد وہ آہستہ آہستہ گھٹتا ہے اور دوبارہ نئے چاند کی طرف لوٹتا ہے۔',
    de: 'Die heutige Mondseite kombiniert mehrere astronomische Indikatoren, die dem Benutzer helfen, die aktuelle Mondform auf einfache Weise zu verstehen. Der Beleuchtungsprozentsatz zeigt den Anteil des beleuchteten Teils der Mondscheibe, wie er von der Erde aus gesehen wird, während das Mondalter die Anzahl der Tage seit dem letzten Neumond angibt. Mit fortschreitendem Mondalter nähert sich der Mond seinen nächsten Phasen, wie dem ersten Viertel und dem zunehmenden Halbmond, bis hin zum Vollmond; danach nimmt er allmählich ab und kehrt zum Neumond zurück.',
    id: 'Halaman Bulan hari ini menggabungkan beberapa indikator astronomi yang membantu pengguna memahami bentuk Bulan saat ini dengan cara sederhana. Persentase iluminasi menunjukkan proporsi bagian yang terang dari piringan Bulan seperti yang terlihat dari Bumi, sementara usia Bulan menunjukkan jumlah hari yang telah berlalu sejak bulan baru terakhir. Seiring bertambahnya usia lunar, Bulan mendekati fase berikutnya, seperti kuartal pertama dan bulan cembung membesar, menuju ke bulan purnama, setelah itu secara bertahap berkurang hingga kembali ke bulan baru.',
    es: 'La página del estado de la Luna hoy combina varios indicadores astronómicos que ayudan al usuario a comprender la forma actual de la Luna de manera sencilla. El porcentaje de iluminación muestra la proporción de la parte iluminada del disco lunar tal como se ve desde la Tierra, mientras que la edad de la Luna indica el número de días que han pasado desde la última luna nueva. A medida que avanza la edad lunar, la Luna se acerca a sus siguientes fases, como el primer cuarto y la gibosa creciente, hasta llegar a la luna llena, tras la cual disminuye gradualmente hasta volver a la luna nueva.',
    bn: 'আজকের চাঁদের পৃষ্ঠা বেশ কয়েকটি জ্যোতির্বিজ্ঞান নির্দেশক একত্রিত করে যা ব্যবহারকারীকে সহজভাবে চাঁদের বর্তমান আকৃতি বুঝতে সাহায্য করে। আলোকন শতাংশ পৃথিবী থেকে দেখা চাঁদের চাকতির আলোকিত অংশের অনুপাত দেখায়, যেখানে চাঁদের বয়স সর্বশেষ অমাবস্যা থেকে অতিবাহিত দিনের সংখ্যা নির্দেশ করে। চান্দ্র বয়স যত বাড়ে, চাঁদ তার পরবর্তী দশার দিকে এগিয়ে যায়, যেমন প্রথম পাদ এবং বাড়ন্ত গিবাস, পূর্ণিমা পর্যন্ত পৌঁছায়, এরপর ধীরে ধীরে কমতে থাকে যতক্ষণ না অমাবস্যায় ফিরে আসে।',
    ms: 'Halaman Bulan hari ini menggabungkan beberapa penunjuk astronomi yang membantu pengguna memahami bentuk Bulan semasa dengan cara mudah. Peratus pencahayaan menunjukkan kadar bahagian Bulan yang bercahaya seperti dilihat dari Bumi, manakala usia Bulan menunjukkan bilangan hari yang telah berlalu sejak anak bulan terakhir. Apabila usia bulan bertambah, Bulan menghampiri fasanya yang seterusnya, seperti suku pertama dan bulan cembung membesar, sehingga ke bulan purnama, selepas itu ia berkurang secara beransur-ansur sehingga kembali kepada anak bulan.',
};

const DEPTH_P2 = {
    ar: 'تساعد بيانات شروق القمر وغروبه على معرفة الوقت التقريبي الذي يظهر فيه القمر في السماء أو يغيب عن الأفق، وقد تختلف هذه الأوقات من مدينة إلى أخرى بسبب اختلاف الموقع الجغرافي وخط الطول والعرض. لذلك قد تعرض الصفحة بيانات افتراضية لمدينة محددة، مع إتاحة الانتقال إلى صفحات المدن لمتابعة حالة القمر بحسب موقع المستخدم. كما يرتبط تتبع القمر بالتقويم الهجري، لأن بداية الشهور الهجرية تعتمد على دورة القمر ورؤية الهلال، مما يجعل متابعة أطوار القمر مفيدة لمن يهتم بالتاريخ الهجري، ومواعيد البدر، وحركة القمر خلال الشهر.',
    en: "Moonrise and moonset data help identify the approximate time when the moon appears in the sky or sets below the horizon, and these times can differ from one city to another due to geographic location, longitude, and latitude. The page may therefore display default data for a specific city, with the option to navigate to city pages to track the moon based on the user's location. Moon tracking is also tied to the Hijri calendar, since the start of Hijri months depends on the lunar cycle and crescent visibility, making it useful for those interested in the Hijri date, full moon timings, and the moon's motion through the month.",
    fr: "Les données de lever et de coucher de la Lune aident à connaître l'heure approximative à laquelle la Lune apparaît dans le ciel ou disparaît sous l'horizon, et ces horaires peuvent différer d'une ville à l'autre en raison de la localisation géographique, de la longitude et de la latitude. La page peut donc afficher des données par défaut pour une ville spécifique, avec la possibilité d'accéder aux pages de villes pour suivre la Lune selon la position de l'utilisateur. Le suivi de la Lune est également lié au calendrier hégirien, puisque le début des mois hégiriens dépend du cycle lunaire et de la visibilité du croissant, ce qui rend le suivi des phases utile à ceux qui s'intéressent à la date hégirienne, aux horaires de pleine lune et au mouvement de la Lune au cours du mois.",
    tr: 'Ay doğuşu ve batış verileri, Ayın gökyüzünde göründüğü veya ufkun altına battığı yaklaşık zamanı belirlemeye yardımcı olur ve bu zamanlar coğrafi konum, boylam ve enlem nedeniyle şehirden şehre farklılık gösterebilir. Sayfa bu nedenle belirli bir şehir için varsayılan veri gösterebilir; kullanıcının konumuna göre Ayı takip etmek için şehir sayfalarına gitme imkânı vardır. Ay takibi ayrıca hicri takvim ile bağlantılıdır; çünkü hicri ayların başlangıcı ay döngüsüne ve hilalin görünürlüğüne bağlıdır, bu da hicri tarih, dolunay zamanları ve Ayın ay boyunca hareketi ile ilgilenenler için yararlı kılar.',
    ur: 'چاند کے طلوع و غروب کا ڈیٹا چاند کے آسمان میں ظاہر ہونے یا افق کے نیچے غروب ہونے کے تقریبی وقت کا تعین کرنے میں مدد کرتا ہے، اور یہ اوقات جغرافیائی محل وقوع، طول البلد اور عرض البلد کی وجہ سے ایک شہر سے دوسرے شہر میں مختلف ہو سکتے ہیں۔ لہذا صفحہ کسی مخصوص شہر کے لیے ڈیفالٹ ڈیٹا دکھا سکتا ہے، صارف کے مقام کے مطابق چاند کا پتہ لگانے کے لیے شہر کے صفحات پر جانے کے اختیار کے ساتھ۔ چاند کی پیروی ہجری کیلنڈر سے بھی منسلک ہے، کیونکہ ہجری مہینوں کی شروعات قمری چکر اور ہلال کی رؤیت پر منحصر ہے، جو ہجری تاریخ، بدر کے اوقات، اور پورے مہینے میں چاند کی حرکت میں دلچسپی رکھنے والوں کے لیے مفید ہے۔',
    de: 'Mondaufgangs- und Untergangsdaten helfen dabei, die ungefähre Zeit zu ermitteln, zu der der Mond am Himmel erscheint oder unter den Horizont sinkt, und diese Zeiten können von Stadt zu Stadt aufgrund der geografischen Lage, des Längen- und Breitengrades unterschiedlich sein. Die Seite kann daher Standarddaten für eine bestimmte Stadt anzeigen, mit der Möglichkeit, zu Stadtseiten zu navigieren, um den Mond entsprechend dem Standort des Benutzers zu verfolgen. Die Mondverfolgung ist auch mit dem Hidschri-Kalender verbunden, da der Beginn der Hidschri-Monate vom Mondzyklus und der Sichtbarkeit der Sichel abhängt, was sie für diejenigen nützlich macht, die sich für das Hidschri-Datum, die Vollmondzeiten und die Bewegung des Mondes durch den Monat interessieren.',
    id: 'Data terbit dan terbenam Bulan membantu mengidentifikasi waktu perkiraan ketika Bulan muncul di langit atau terbenam di bawah cakrawala, dan waktu-waktu ini dapat berbeda dari satu kota ke kota lain karena lokasi geografis, garis bujur, dan garis lintang. Halaman dapat oleh karena itu menampilkan data default untuk kota tertentu, dengan opsi untuk menavigasi ke halaman kota untuk melacak Bulan berdasarkan lokasi pengguna. Pelacakan Bulan juga terkait dengan kalender Hijriah, karena awal bulan Hijriah bergantung pada siklus bulan dan visibilitas hilal, yang membuatnya berguna bagi mereka yang tertarik pada tanggal Hijriah, waktu purnama, dan pergerakan Bulan sepanjang bulan.',
    es: 'Los datos de salida y puesta de la Luna ayudan a identificar el tiempo aproximado en que la Luna aparece en el cielo o se pone bajo el horizonte, y estos tiempos pueden diferir de una ciudad a otra debido a la ubicación geográfica, la longitud y la latitud. Por ello la página puede mostrar datos predeterminados para una ciudad específica, con la opción de navegar a las páginas de ciudades para seguir la Luna según la ubicación del usuario. El seguimiento de la Luna también está vinculado al calendario hijri, ya que el comienzo de los meses hijri depende del ciclo lunar y la visibilidad del creciente, lo que lo hace útil para quienes se interesan por la fecha hijri, los horarios de luna llena y el movimiento de la Luna a lo largo del mes.',
    bn: 'চাঁদের উদয় ও অস্তের ডেটা চাঁদ আকাশে কখন আবির্ভূত হয় বা দিগন্তের নিচে অস্ত যায় তার আনুমানিক সময় চিহ্নিত করতে সাহায্য করে, এবং এই সময়গুলি ভৌগলিক অবস্থান, দ্রাঘিমাংশ এবং অক্ষাংশের কারণে এক শহর থেকে অন্য শহরে ভিন্ন হতে পারে। তাই পৃষ্ঠা একটি নির্দিষ্ট শহরের জন্য ডিফল্ট ডেটা প্রদর্শন করতে পারে, ব্যবহারকারীর অবস্থান অনুযায়ী চাঁদ ট্র্যাক করতে শহর পৃষ্ঠাগুলিতে নেভিগেট করার বিকল্প সহ। চাঁদ ট্র্যাকিং হিজরি ক্যালেন্ডারের সাথেও যুক্ত, কারণ হিজরি মাসের শুরু চান্দ্র চক্র এবং হিলালের দৃশ্যমানতার উপর নির্ভর করে, যা হিজরি তারিখ, পূর্ণিমার সময় এবং সারা মাস জুড়ে চাঁদের গতিতে আগ্রহী ব্যক্তিদের জন্য এটি দরকারী করে তোলে।',
    ms: 'Data terbit dan terbenam Bulan membantu mengenal pasti masa anggaran apabila Bulan muncul di langit atau terbenam di bawah ufuk, dan masa-masa ini boleh berbeza dari satu bandar ke bandar lain disebabkan lokasi geografi, garisan bujur, dan garisan lintang. Halaman ini oleh itu boleh memaparkan data lalai untuk bandar tertentu, dengan pilihan untuk melayari halaman bandar bagi memantau Bulan berdasarkan lokasi pengguna. Pemantauan Bulan juga dikaitkan dengan kalendar Hijrah, kerana permulaan bulan Hijrah bergantung pada kitaran bulan dan kelihatan hilal, yang menjadikannya berguna untuk mereka yang berminat dengan tarikh Hijrah, waktu purnama, dan pergerakan Bulan sepanjang bulan.',
};

const DEPTH_P3 = {
    ar: 'لا تهدف هذه البيانات إلى استبدال الرؤية الشرعية أو التقارير الفلكية الرسمية، لكنها تمنح المستخدم قراءة يومية سهلة لحالة القمر، وتساعده على مقارنة الطور الحالي مع الأيام السابقة والقادمة ضمن نفس الدورة القمرية.',
    en: "This data is not intended to replace religious sighting or official astronomical reports, but it offers the user an easy daily reading of the moon's state, and helps compare the current phase with previous and upcoming days within the same lunar cycle.",
    fr: "Ces données ne visent pas à remplacer l'observation religieuse ou les rapports astronomiques officiels, mais elles offrent à l'utilisateur une lecture quotidienne facile de l'état de la Lune, et l'aident à comparer la phase actuelle avec les jours précédents et à venir au sein du même cycle lunaire.",
    tr: 'Bu veriler dini gözlemi veya resmi astronomik raporları değiştirmeyi amaçlamaz; ancak kullanıcıya Ay durumunun günlük kolay bir okumasını sunar ve mevcut evreyi aynı ay döngüsündeki önceki ve gelecek günlerle karşılaştırmaya yardımcı olur.',
    ur: 'یہ ڈیٹا مذہبی رؤیت یا سرکاری فلکی رپورٹس کا متبادل نہیں ہے، لیکن یہ صارف کو چاند کی حالت کا روزانہ آسان مطالعہ پیش کرتا ہے، اور موجودہ مرحلے کا اسی قمری چکر کے پچھلے اور آنے والے دنوں سے موازنہ کرنے میں مدد کرتا ہے۔',
    de: 'Diese Daten sollen die religiöse Sichtung oder offizielle astronomische Berichte nicht ersetzen, sondern bieten dem Benutzer eine einfache tägliche Lesung des Mondzustands und helfen, die aktuelle Phase mit vorherigen und kommenden Tagen innerhalb desselben Mondzyklus zu vergleichen.',
    id: 'Data ini tidak dimaksudkan untuk menggantikan rukyat keagamaan atau laporan astronomi resmi, tetapi menawarkan kepada pengguna pembacaan harian yang mudah tentang keadaan Bulan, dan membantu membandingkan fase saat ini dengan hari-hari sebelumnya dan mendatang dalam siklus lunar yang sama.',
    es: 'Estos datos no pretenden reemplazar la observación religiosa ni los informes astronómicos oficiales, pero ofrecen al usuario una lectura diaria fácil del estado de la Luna y ayudan a comparar la fase actual con los días anteriores y próximos dentro del mismo ciclo lunar.',
    bn: 'এই ডেটা ধর্মীয় দর্শন বা আনুষ্ঠানিক জ্যোতির্বিজ্ঞান প্রতিবেদনের প্রতিস্থাপন করার উদ্দেশ্যে নয়, তবে ব্যবহারকারীকে চাঁদের অবস্থার সহজ দৈনিক পঠন প্রদান করে এবং একই চান্দ্র চক্রের পূর্ববর্তী ও আসন্ন দিনের সাথে বর্তমান দশা তুলনা করতে সাহায্য করে।',
    ms: 'Data ini tidak bertujuan untuk menggantikan rukyah agama atau laporan astronomi rasmi, tetapi menawarkan kepada pengguna bacaan harian yang mudah tentang keadaan Bulan, dan membantu membandingkan fasa semasa dengan hari-hari sebelumnya dan akan datang dalam kitaran bulan yang sama.',
};

// Serialize a per-lang object literal as JS source
function _serializeLangMap(obj, indent = '                ') {
    return '{' + EOL +
        Object.entries(obj).map(([lang, txt]) => {
            const esc = txt.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return `${indent}    ${lang}: '${esc}',`;
        }).join(EOL) + EOL +
        indent + '}';
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the SSR injection block. Inserts AFTER the E2-final block close
// (line ~6808) and BEFORE the closing `}` of `if (_isMoonTodayHub)` (~6809).
// ─────────────────────────────────────────────────────────────────────────────
const block = [
    `        } catch (_e) { /* silent — Hub-final injection failed, page still serves */ }`,
    ``,
    `        // ── Phase E2-content-depth-Hub (2026-05-01): add ONE long`,
    `        //    educational H2 section to fix SEOptimer "Amount of Content: Low".`,
    `        //`,
    `        // After E2-keywords-Hub-final raised Keyword Consistency to ✅, the`,
    `        // Hub is still ~729 words vs city pages' 1187. This phase adds NO new`,
    `        // keywords (already green) — only depth via a single H2 + 3 paragraphs`,
    `        // explaining how to read moon data. ~250 AR words.`,
    `        //`,
    `        // Inserted AFTER moon-seo-phase (E2-final Section 1) so the flow is:`,
    `        //   #moon-main-card → moon-seo-phase → [NEW: moon-seo-depth] →`,
    `        //   #moon-current-month-h2 → ... rest of page`,
    `        //`,
    `        // Hard rules preserved: NO data-i18n, NO .hub-only, NO Title/Meta/H1`,
    `        // change, NO new keyword headings, max 1 new H2.`,
    `        try {`,
    `            const _depthLang = seo.lang || 'ar';`,
    `            const _depthPick = (m) => m[_depthLang] || m.en;`,
    ``,
    `            const _depthH2 = ${_serializeLangMap(DEPTH_H2)};`,
    `            const _depthP1 = ${_serializeLangMap(DEPTH_P1)};`,
    `            const _depthP2 = ${_serializeLangMap(DEPTH_P2)};`,
    `            const _depthP3 = ${_serializeLangMap(DEPTH_P3)};`,
    ``,
    `            const _depthHtml = '<section class="section-card moon-seo-info moon-seo-depth">'`,
    `                + '<h2>' + _escHtml(_depthPick(_depthH2)) + '</h2>'`,
    `                + '<p>'  + _escHtml(_depthPick(_depthP1)) + '</p>'`,
    `                + '<p>'  + _escHtml(_depthPick(_depthP2)) + '</p>'`,
    `                + '<p>'  + _escHtml(_depthPick(_depthP3)) + '</p>'`,
    `                + '</section>';`,
    ``,
    `            // Inject AFTER the moon-seo-phase section (E2-final Section 1).`,
    `            // The regex captures the whole section then appends our block.`,
    `            html = html.replace(`,
    `                /(<section class="section-card moon-seo-info moon-seo-phase">[\\s\\S]*?<\\/section>)/,`,
    `                (m) => m + _depthHtml`,
    `            );`,
    `        } catch (_e) { /* silent — depth injection failed, page still serves */ }`,
    `    }`,
].join(EOL);

const oldAnchor = `        } catch (_e) { /* silent — Hub-final injection failed, page still serves */ }${EOL}    }`;
const cnt = raw.split(oldAnchor).length - 1;
if (cnt !== 1) {
    throw new Error(`Anchor: expected 1 match, got ${cnt}.`);
}

const out = raw.replace(oldAnchor, block);
writeFileSync(PATH, out);

// Word-count report
console.log('✅ Phase E2-content-depth-Hub — depth section injection added.');
console.log('\nWord counts (AR rendered text):');
const all = [DEPTH_H2.ar, DEPTH_P1.ar, DEPTH_P2.ar, DEPTH_P3.ar].join(' ');
const wc = all.split(/\s+/).filter(Boolean).length;
console.log(`  AR total: ${wc} words (target: 220-260)`);
console.log('\nPer-paragraph word counts:');
console.log(`  H2: ${DEPTH_H2.ar.split(/\s+/).length} words`);
console.log(`  P1: ${DEPTH_P1.ar.split(/\s+/).length} words`);
console.log(`  P2: ${DEPTH_P2.ar.split(/\s+/).length} words`);
console.log(`  P3: ${DEPTH_P3.ar.split(/\s+/).length} words`);
