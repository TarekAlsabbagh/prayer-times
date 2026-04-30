// Phase D3.1.3b — localize B3 (_HUB_RELATED) and B4 (_TDC) to 10 languages.
// Replaces (lng === 'ar') ? AR : EN with [lng] || .en lookup.
// Variables in scope:
//   B3: _cityName, _curMonthName, _curYear, _nextMonthName, _nextYear
//   B4: _cityName, _phaseValB4, _illumB4, _ageB4, _curMonthLbl
import fs from 'fs';

const file = 'js/app.js';
const src = fs.readFileSync(file, 'utf8');
const isCRLF = /\r\n/.test(src);
const EOL = isCRLF ? '\r\n' : '\n';

// ════════════════════════════════════════════════════════════════════════
// B3 — _HUB_RELATED — 8 strings × 10 langs
// ════════════════════════════════════════════════════════════════════════
const HUB = {
  ar: {
    title: '`روابط مهمّة عن القمر في ${_cityName}`',
    intro: '`تَجمع هذه الصفحة كلّ ما يَخصّ القمر في ${_cityName} — حالة اليوم، تقويم الشهر الحاليّ والقادم، إضافةً إلى أدوات مرتبطة كمواقيت الصلاة واتّجاه القبلة.`',
    labels: [
      '`حالة القمر اليوم في ${_cityName}`',
      '`تقويم القمر لشهر ${_curMonthName} ${_curYear}`',
      '`تقويم القمر لشهر ${_nextMonthName} ${_nextYear}`',
      '`مواقيت الصلاة في ${_cityName}`',
      '`اتّجاه القبلة من ${_cityName}`',
      '`التاريخ الهجريّ اليوم`'
    ]
  },
  en: {
    title: '`Important moon-related links in ${_cityName}`',
    intro: '`This page brings together everything about the Moon in ${_cityName} — today\'s status, the current and next months\' calendars, plus related tools like prayer times and qibla direction.`',
    labels: [
      '`Moon status today in ${_cityName}`',
      '`Moon calendar for ${_curMonthName} ${_curYear}`',
      '`Moon calendar for ${_nextMonthName} ${_nextYear}`',
      '`Prayer times in ${_cityName}`',
      '`Qibla direction from ${_cityName}`',
      "`Today's Hijri date`"
    ]
  },
  fr: {
    title: '`Liens importants sur la Lune à ${_cityName}`',
    intro: "`Cette page rassemble tout sur la Lune à ${_cityName} — l'état du jour, les calendriers du mois en cours et du mois prochain, plus des outils liés comme les horaires de prière et la direction de la Qibla.`",
    labels: [
      "`État de la Lune aujourd'hui à ${_cityName}`",
      '`Calendrier lunaire pour ${_curMonthName} ${_curYear}`',
      '`Calendrier lunaire pour ${_nextMonthName} ${_nextYear}`',
      '`Heures de prière à ${_cityName}`',
      '`Direction de la Qibla depuis ${_cityName}`',
      '`Date hégirienne du jour`'
    ]
  },
  tr: {
    title: '`${_cityName} için önemli ay bağlantıları`',
    intro: "`Bu sayfa, ${_cityName}'deki Ay'la ilgili her şeyi bir araya getirir — bugünkü durumu, mevcut ve gelecek ayların takvimleri ile namaz vakitleri ve kıble yönü gibi ilgili araçlar.`",
    labels: [
      "`${_cityName}'de bugünkü ay durumu`",
      '`${_curMonthName} ${_curYear} ay takvimi`',
      '`${_nextMonthName} ${_nextYear} ay takvimi`',
      '`${_cityName} namaz vakitleri`',
      "`${_cityName}'den kıble yönü`",
      '`Bugünün hicri tarihi`'
    ]
  },
  ur: {
    title: '`${_cityName} میں چاند کے بارے میں اہم لنکس`',
    intro: '`یہ صفحہ ${_cityName} میں چاند کے بارے میں ہر چیز کو اکٹھا کرتا ہے — آج کی حالت، موجودہ اور آنے والے مہینے کا تقویم، اور متعلقہ ٹولز جیسے اوقاتِ نماز اور سمتِ قبلہ۔`',
    labels: [
      '`${_cityName} میں آج چاند کی حالت`',
      '`${_curMonthName} ${_curYear} کا چاند کیلنڈر`',
      '`${_nextMonthName} ${_nextYear} کا چاند کیلنڈر`',
      '`${_cityName} میں اوقاتِ نماز`',
      '`${_cityName} سے سمتِ قبلہ`',
      '`آج کی ہجری تاریخ`'
    ]
  },
  de: {
    title: '`Wichtige mondbezogene Links in ${_cityName}`',
    intro: '`Diese Seite vereint alles zum Mond in ${_cityName} — den heutigen Zustand, die Kalender des aktuellen und nächsten Monats sowie verwandte Tools wie Gebetszeiten und Qibla-Richtung.`',
    labels: [
      '`Mondzustand heute in ${_cityName}`',
      '`Mondkalender für ${_curMonthName} ${_curYear}`',
      '`Mondkalender für ${_nextMonthName} ${_nextYear}`',
      '`Gebetszeiten in ${_cityName}`',
      '`Qibla-Richtung von ${_cityName}`',
      '`Heutiges Hidschri-Datum`'
    ]
  },
  id: {
    title: '`Tautan penting terkait Bulan di ${_cityName}`',
    intro: '`Halaman ini menghimpun semua tentang Bulan di ${_cityName} — status hari ini, kalender bulan ini dan bulan depan, ditambah alat terkait seperti jadwal sholat dan arah kiblat.`',
    labels: [
      '`Status Bulan hari ini di ${_cityName}`',
      '`Kalender bulan ${_curMonthName} ${_curYear}`',
      '`Kalender bulan ${_nextMonthName} ${_nextYear}`',
      '`Jadwal sholat di ${_cityName}`',
      '`Arah kiblat dari ${_cityName}`',
      '`Tanggal Hijriah hari ini`'
    ]
  },
  es: {
    title: '`Enlaces importantes sobre la Luna en ${_cityName}`',
    intro: '`Esta página reúne todo sobre la Luna en ${_cityName} — el estado de hoy, los calendarios del mes actual y próximo, además de herramientas relacionadas como horarios de oración y dirección de la Qibla.`',
    labels: [
      '`Estado de la Luna hoy en ${_cityName}`',
      '`Calendario lunar para ${_curMonthName} ${_curYear}`',
      '`Calendario lunar para ${_nextMonthName} ${_nextYear}`',
      '`Horarios de oración en ${_cityName}`',
      '`Dirección de la Qibla desde ${_cityName}`',
      '`Fecha hijri de hoy`'
    ]
  },
  bn: {
    title: '`${_cityName}-এ চাঁদ সম্পর্কিত গুরুত্বপূর্ণ লিঙ্ক`',
    intro: '`এই পৃষ্ঠা ${_cityName}-এ চাঁদ সম্পর্কে সব কিছু একত্রিত করে — আজকের অবস্থা, বর্তমান ও পরবর্তী মাসের ক্যালেন্ডার এবং সম্পর্কিত সরঞ্জাম যেমন নামাজের সময় ও কিবলার দিক।`',
    labels: [
      '`${_cityName}-এ আজ চাঁদের অবস্থা`',
      '`${_curMonthName} ${_curYear}-এর চাঁদের ক্যালেন্ডার`',
      '`${_nextMonthName} ${_nextYear}-এর চাঁদের ক্যালেন্ডার`',
      '`${_cityName}-এ নামাজের সময়`',
      '`${_cityName} থেকে কিবলার দিক`',
      '`আজকের হিজরি তারিখ`'
    ]
  },
  ms: {
    title: '`Pautan penting berkaitan Bulan di ${_cityName}`',
    intro: '`Halaman ini menghimpunkan semua tentang Bulan di ${_cityName} — status hari ini, kalendar bulan semasa dan akan datang, serta alat berkaitan seperti waktu solat dan arah kiblat.`',
    labels: [
      '`Status Bulan hari ini di ${_cityName}`',
      '`Kalendar Bulan untuk ${_curMonthName} ${_curYear}`',
      '`Kalendar Bulan untuk ${_nextMonthName} ${_nextYear}`',
      '`Waktu solat di ${_cityName}`',
      '`Arah kiblat dari ${_cityName}`',
      '`Tarikh Hijrah hari ini`'
    ]
  }
};

// ════════════════════════════════════════════════════════════════════════
// B4 — _TDC — 9 strings × 10 langs (title + p1-p4 + 4 link labels)
// ════════════════════════════════════════════════════════════════════════
const TDC = {
  ar: {
    title: '`ملخّص قمر اليوم في ${_cityName}`',
    p1: '`في ${_cityName} اليوم، يَكون القمر في طور ${_phaseValB4} بإضاءة ${_illumB4}٪ وعمر ${_ageB4} يوم من الدورة القمريّة الحاليّة. هذه القيم لحظيّة، محسوبة فلكيّاً وفق منهجيّات Jean Meeus حسب إحداثيّات ${_cityName} وتوقيتها المحلّيّ، وتَتَجدَّد تلقائيّاً.`',
    p2: '`تَختلف مَواعيد شروق وغروب القمر بين المدن بحسب خطّ الطول والمنطقة الزمنيّة. الأرقام المعروضة هنا خاصّة بـ ${_cityName} فقط — قد تَختلف عن مدن أخرى مثل القاهرة أو لندن أو نيويورك.`',
    p3: '`حالة القمر اليوم في ${_cityName} تَرتبط بالتقويم الهجريّ، إذ تُساعد على تَوقّع موعد رؤية الهلال للشهر الهجريّ القادم. هذه بيانات فلكيّة موضوعيّة — أمّا ثبوت بدء الشهر الهجريّ فيَخضع للرؤية الشرعيّة في كلّ بلد.`',
    p4: '`للمتابعة بعد حالة اليوم، يُمكنك تَصفّح تقويم القمر الكامل في ${_cityName}، أو الاطّلاع على تقويم شهر ${_curMonthLbl}، أو فتح صفحة تَفاصيل قمر اليوم بالتاريخ الميلاديّ الكامل، أو مُراجعة التاريخ الهجريّ اليوم.`',
    links: [
      '`تقويم القمر في ${_cityName}`',
      '`تقويم القمر لشهر ${_curMonthLbl}`',
      '`تَفاصيل قمر اليوم بالتاريخ`',
      '`التاريخ الهجريّ اليوم`'
    ]
  },
  en: {
    title: "`Today's moon snapshot in ${_cityName}`",
    p1: "`In ${_cityName} today, the Moon is in ${_phaseValB4} phase with ${_illumB4}% illumination and ${_ageB4} days of age in the current lunar cycle. These values are live — computed astronomically using Jean Meeus' methods for ${_cityName}'s coordinates and local timezone, and refresh automatically.`",
    p2: '`Moonrise and moonset times vary between cities based on longitude and timezone. The figures shown here are specific to ${_cityName} — they will differ from other cities like Cairo, London, or New York.`',
    p3: "`The Moon's state today in ${_cityName} is tied to the Hijri calendar — it helps anticipate when the crescent of the next Hijri month will be visible. These are objective astronomical data; official confirmation of each Hijri month depends on local jurisprudence in each country.`",
    p4: "`To go beyond today's snapshot, you can browse the full moon calendar for ${_cityName}, view this month's calendar for ${_curMonthLbl}, open today's detailed page with full Gregorian/Hijri dates, or check today's Hijri date page.`",
    links: [
      '`Moon calendar in ${_cityName}`',
      '`Moon calendar for ${_curMonthLbl}`',
      "`Today's moon details by date`",
      "`Today's Hijri date`"
    ]
  },
  fr: {
    title: "`Aperçu de la Lune aujourd'hui à ${_cityName}`",
    p1: "`À ${_cityName} aujourd'hui, la Lune est en phase ${_phaseValB4} avec ${_illumB4} % d'illumination et ${_ageB4} jours d'âge dans le cycle lunaire actuel. Ces valeurs sont en direct — calculées astronomiquement avec les méthodes de Jean Meeus pour les coordonnées et le fuseau horaire local de ${_cityName}, et se rafraîchissent automatiquement.`",
    p2: "`Les heures de lever et coucher de la Lune varient entre les villes selon la longitude et le fuseau horaire. Les chiffres affichés ici sont spécifiques à ${_cityName} — ils diffèrent d'autres villes comme Le Caire, Londres ou New York.`",
    p3: "`L'état de la Lune aujourd'hui à ${_cityName} est lié au calendrier hégirien — il aide à anticiper quand le croissant du prochain mois hégirien sera visible. Ce sont des données astronomiques objectives ; la confirmation officielle de chaque mois hégirien dépend de la jurisprudence locale dans chaque pays.`",
    p4: "`Pour aller au-delà de l'aperçu du jour, vous pouvez parcourir le calendrier lunaire complet pour ${_cityName}, voir le calendrier de ce mois (${_curMonthLbl}), ouvrir la page détaillée d'aujourd'hui avec les dates grégorienne/hégirienne complètes, ou consulter la page de la date hégirienne du jour.`",
    links: [
      '`Calendrier lunaire à ${_cityName}`',
      '`Calendrier lunaire pour ${_curMonthLbl}`',
      '`Détails de la Lune du jour par date`',
      '`Date hégirienne du jour`'
    ]
  },
  tr: {
    title: "`${_cityName}'de bugünün ay özeti`",
    p1: "`${_cityName}'de bugün Ay, mevcut ay döngüsünde ${_phaseValB4} evresinde, %${_illumB4} aydınlanma ve ${_ageB4} günlük yaşla bulunuyor. Bu değerler canlıdır — Jean Meeus yöntemleriyle ${_cityName}'in koordinatları ve yerel saat dilimi için astronomik olarak hesaplanır ve otomatik olarak yenilenir.`",
    p2: "`Ay doğuş ve batış saatleri boylama ve saat dilimine bağlı olarak şehirler arasında değişir. Burada gösterilen rakamlar ${_cityName}'e özgüdür — Kahire, Londra veya New York gibi diğer şehirlerden farklı olacaktır.`",
    p3: "`${_cityName}'deki Ay'ın bugünkü durumu hicri takvim ile bağlantılıdır — bir sonraki hicri ayın hilalinin ne zaman görüneceğini öngörmeye yardımcı olur. Bu nesnel astronomik verilerdir; her hicri ayın resmi onayı her ülkedeki yerel fıkıha bağlıdır.`",
    p4: "`Bugünkü özetin ötesine geçmek için, ${_cityName} için tam ay takvimine göz atabilir, bu ay (${_curMonthLbl}) takvimini görüntüleyebilir, tam miladi/hicri tarihlerle bugünün ayrıntılı sayfasını açabilir veya bugünün hicri tarihi sayfasını kontrol edebilirsiniz.`",
    links: [
      '`${_cityName} ay takvimi`',
      '`${_curMonthLbl} ay takvimi`',
      '`Bugünkü ay detayları (tarihe göre)`',
      '`Bugünün hicri tarihi`'
    ]
  },
  ur: {
    title: '`${_cityName} میں آج چاند کا خلاصہ`',
    p1: '`${_cityName} میں آج چاند موجودہ قمری چکر میں ${_phaseValB4} طور پر ${_illumB4}٪ روشنی اور ${_ageB4} دن کی عمر کے ساتھ ہے۔ یہ قیمتیں براہِ راست ہیں — Jean Meeus کے طریقوں سے ${_cityName} کے کوآرڈینیٹس اور مقامی ٹائم زون کے لیے فلکیاتی طور پر شمار کی جاتی ہیں اور خود بخود تازہ ہوتی رہتی ہیں۔`',
    p2: '`چاند کی مطلع و مغیب کے اوقات خط طول اور ٹائم زون کے مطابق شہروں کے درمیان مختلف ہوتے ہیں۔ یہاں دکھائی گئی قیمتیں ${_cityName} کے لیے مخصوص ہیں — یہ دوسرے شہروں جیسے قاہرہ، لندن یا نیویارک سے مختلف ہوں گی۔`',
    p3: '`${_cityName} میں آج چاند کی حالت ہجری تقویم سے جڑی ہے — یہ اگلے ہجری مہینے کے ہلال کی رؤیت کے وقت کا اندازہ لگانے میں مدد کرتی ہے۔ یہ معروضی فلکیاتی ڈیٹا ہے؛ ہر ہجری مہینے کی سرکاری تصدیق ہر ملک کی مقامی فقہ پر منحصر ہے۔`',
    p4: '`آج کے خلاصے سے آگے بڑھنے کے لیے، آپ ${_cityName} کے لیے مکمل چاند کے کیلنڈر کو براؤز کر سکتے ہیں، اس مہینے (${_curMonthLbl}) کا کیلنڈر دیکھ سکتے ہیں، مکمل عیسوی/ہجری تاریخوں کے ساتھ آج کا تفصیلی صفحہ کھول سکتے ہیں، یا آج کی ہجری تاریخ کا صفحہ چیک کر سکتے ہیں۔`',
    links: [
      '`${_cityName} میں چاند کیلنڈر`',
      '`${_curMonthLbl} کا چاند کیلنڈر`',
      '`تاریخ کے مطابق آج کے چاند کی تفصیلات`',
      '`آج کی ہجری تاریخ`'
    ]
  },
  de: {
    title: '`Heutige Mond-Übersicht in ${_cityName}`',
    p1: '`In ${_cityName} ist der Mond heute in der ${_phaseValB4}-Phase mit ${_illumB4} % Beleuchtung und einem Alter von ${_ageB4} Tagen im aktuellen Mondzyklus. Diese Werte sind live — astronomisch mit den Methoden von Jean Meeus für die Koordinaten und Ortszeit von ${_cityName} berechnet und aktualisieren sich automatisch.`',
    p2: '`Mondaufgangs- und -untergangszeiten variieren zwischen Städten je nach geografischer Länge und Zeitzone. Die hier gezeigten Werte gelten speziell für ${_cityName} — sie unterscheiden sich von anderen Städten wie Kairo, London oder New York.`',
    p3: '`Der Zustand des Mondes heute in ${_cityName} ist mit dem Hidschri-Kalender verbunden — er hilft vorherzusagen, wann die Mondsichel des nächsten Hidschri-Monats sichtbar sein wird. Dies sind objektive astronomische Daten; die offizielle Bestätigung jedes Hidschri-Monats hängt von der lokalen Rechtsprechung in jedem Land ab.`',
    p4: '`Um über die heutige Übersicht hinauszugehen, können Sie den vollständigen Mondkalender für ${_cityName} durchsuchen, den Kalender für diesen Monat (${_curMonthLbl}) anzeigen, die heutige Detailseite mit vollständigen gregorianischen/Hidschri-Daten öffnen oder die heutige Hidschri-Datumsseite einsehen.`',
    links: [
      '`Mondkalender in ${_cityName}`',
      '`Mondkalender für ${_curMonthLbl}`',
      '`Heutige Monddetails nach Datum`',
      '`Heutiges Hidschri-Datum`'
    ]
  },
  id: {
    title: '`Ringkasan Bulan hari ini di ${_cityName}`',
    p1: '`Di ${_cityName} hari ini, Bulan berada dalam fase ${_phaseValB4} dengan iluminasi ${_illumB4}% dan usia ${_ageB4} hari dalam siklus bulan saat ini. Nilai-nilai ini langsung — dihitung secara astronomis menggunakan metode Jean Meeus untuk koordinat dan zona waktu lokal ${_cityName}, dan diperbarui secara otomatis.`',
    p2: '`Waktu terbit dan terbenam Bulan bervariasi antar kota berdasarkan bujur dan zona waktu. Angka yang ditampilkan di sini spesifik untuk ${_cityName} — akan berbeda dari kota lain seperti Kairo, London, atau New York.`',
    p3: '`Keadaan Bulan hari ini di ${_cityName} terkait dengan kalender Hijriah — membantu mengantisipasi kapan hilal bulan Hijriah berikutnya akan terlihat. Ini adalah data astronomis objektif; konfirmasi resmi setiap bulan Hijriah tergantung pada fikih lokal di setiap negara.`',
    p4: '`Untuk melampaui ringkasan hari ini, Anda dapat menjelajahi kalender bulan lengkap untuk ${_cityName}, melihat kalender bulan ini (${_curMonthLbl}), membuka halaman detail hari ini dengan tanggal Masehi/Hijriah lengkap, atau memeriksa halaman tanggal Hijriah hari ini.`',
    links: [
      '`Kalender bulan di ${_cityName}`',
      '`Kalender bulan ${_curMonthLbl}`',
      '`Detail Bulan hari ini berdasarkan tanggal`',
      '`Tanggal Hijriah hari ini`'
    ]
  },
  es: {
    title: '`Resumen de la Luna hoy en ${_cityName}`',
    p1: '`En ${_cityName} hoy, la Luna se encuentra en fase ${_phaseValB4} con ${_illumB4} % de iluminación y ${_ageB4} días de edad en el ciclo lunar actual. Estos valores son en vivo — calculados astronómicamente con los métodos de Jean Meeus para las coordenadas y zona horaria local de ${_cityName}, y se actualizan automáticamente.`',
    p2: '`Los horarios de salida y puesta de la Luna varían entre ciudades según la longitud y la zona horaria. Las cifras mostradas aquí son específicas de ${_cityName} — diferirán de otras ciudades como El Cairo, Londres o Nueva York.`',
    p3: '`El estado de la Luna hoy en ${_cityName} está vinculado al calendario hijri — ayuda a anticipar cuándo será visible el creciente del próximo mes hijri. Estos son datos astronómicos objetivos; la confirmación oficial de cada mes hijri depende de la jurisprudencia local en cada país.`',
    p4: '`Para ir más allá del resumen de hoy, puede explorar el calendario lunar completo para ${_cityName}, ver el calendario de este mes (${_curMonthLbl}), abrir la página detallada de hoy con fechas gregoriana/hijri completas, o consultar la página de la fecha hijri de hoy.`',
    links: [
      '`Calendario lunar en ${_cityName}`',
      '`Calendario lunar para ${_curMonthLbl}`',
      '`Detalles de la Luna de hoy por fecha`',
      '`Fecha hijri de hoy`'
    ]
  },
  bn: {
    title: '`${_cityName}-এ আজকের চাঁদের সারসংক্ষেপ`',
    p1: '`${_cityName}-এ আজ, চাঁদ বর্তমান চাঁদের চক্রে ${_phaseValB4} দশায়, ${_illumB4}% আলোকন এবং ${_ageB4} দিনের বয়স সহ রয়েছে। এই মানগুলি লাইভ — Jean Meeus-এর পদ্ধতি ব্যবহার করে ${_cityName}-এর স্থানাঙ্ক ও স্থানীয় টাইমজোনের জন্য জ্যোতির্বিজ্ঞানগতভাবে গণনা করা হয় এবং স্বয়ংক্রিয়ভাবে রিফ্রেশ হয়।`',
    p2: '`চাঁদের উদয় ও অস্তের সময় দ্রাঘিমাংশ ও টাইমজোন অনুসারে শহরভেদে পরিবর্তিত হয়। এখানে দেখানো সংখ্যাগুলি ${_cityName}-এর জন্য নির্দিষ্ট — এগুলি কায়রো, লন্ডন বা নিউইয়র্কের মতো অন্যান্য শহর থেকে আলাদা হবে।`',
    p3: '`${_cityName}-এ আজ চাঁদের অবস্থা হিজরি ক্যালেন্ডারের সাথে যুক্ত — এটি পরবর্তী হিজরি মাসের হিলাল কখন দৃশ্যমান হবে তা পূর্বাভাস দিতে সাহায্য করে। এগুলি বস্তুনিষ্ঠ জ্যোতির্বিজ্ঞান ডেটা; প্রতিটি হিজরি মাসের আনুষ্ঠানিক নিশ্চিতকরণ প্রতিটি দেশে স্থানীয় ফিকহের উপর নির্ভর করে।`',
    p4: '`আজকের সারসংক্ষেপের বাইরে যেতে, আপনি ${_cityName}-এর জন্য সম্পূর্ণ চাঁদের ক্যালেন্ডার ব্রাউজ করতে পারেন, এই মাসের (${_curMonthLbl}) ক্যালেন্ডার দেখতে পারেন, সম্পূর্ণ গ্রেগরিয়ান/হিজরি তারিখ সহ আজকের বিস্তারিত পৃষ্ঠা খুলতে পারেন বা আজকের হিজরি তারিখের পৃষ্ঠা চেক করতে পারেন।`',
    links: [
      '`${_cityName}-এ চাঁদের ক্যালেন্ডার`',
      '`${_curMonthLbl}-এর চাঁদের ক্যালেন্ডার`',
      '`তারিখ অনুযায়ী আজকের চাঁদের বিবরণ`',
      '`আজকের হিজরি তারিখ`'
    ]
  },
  ms: {
    title: '`Ringkasan Bulan hari ini di ${_cityName}`',
    p1: '`Di ${_cityName} hari ini, Bulan berada dalam fasa ${_phaseValB4} dengan pencahayaan ${_illumB4}% dan usia ${_ageB4} hari dalam kitaran bulan semasa. Nilai-nilai ini adalah langsung — dikira secara astronomi dengan kaedah Jean Meeus untuk koordinat dan zon waktu tempatan ${_cityName}, dan dikemas kini secara automatik.`',
    p2: '`Waktu terbit dan terbenam Bulan berbeza antara bandar berdasarkan bujur dan zon waktu. Angka yang dipaparkan di sini adalah khusus untuk ${_cityName} — akan berbeza daripada bandar lain seperti Kaherah, London atau New York.`',
    p3: '`Keadaan Bulan hari ini di ${_cityName} berkaitan dengan kalendar Hijrah — membantu menjangka bila hilal bulan Hijrah seterusnya akan kelihatan. Ini adalah data astronomi objektif; pengesahan rasmi setiap bulan Hijrah bergantung pada fiqh tempatan di setiap negara.`',
    p4: '`Untuk melangkaui ringkasan hari ini, anda boleh melayari kalendar bulan lengkap untuk ${_cityName}, melihat kalendar bulan ini (${_curMonthLbl}), membuka halaman terperinci hari ini dengan tarikh Masihi/Hijrah penuh, atau memeriksa halaman tarikh Hijrah hari ini.`',
    links: [
      '`Kalendar bulan di ${_cityName}`',
      '`Kalendar bulan untuk ${_curMonthLbl}`',
      '`Butiran Bulan hari ini mengikut tarikh`',
      '`Tarikh Hijrah hari ini`'
    ]
  }
};

// ════════════════════════════════════════════════════════════════════════
// Render JS source for each lookup table
// ════════════════════════════════════════════════════════════════════════
function renderHubLang(lang, data, indent) {
  const labels = data.labels.map(l => `${indent}        ${l}`).join(',' + EOL);
  return `${indent}${lang}: {${EOL}${indent}    title: ${data.title},${EOL}${indent}    intro: ${data.intro},${EOL}${indent}    labels: [${EOL}${labels}${EOL}${indent}    ]${EOL}${indent}}`;
}
function renderTdcLang(lang, data, indent) {
  const links = data.links.map(l => `${indent}        ${l}`).join(',' + EOL);
  return `${indent}${lang}: {${EOL}${indent}    title: ${data.title},${EOL}${indent}    p1: ${data.p1},${EOL}${indent}    p2: ${data.p2},${EOL}${indent}    p3: ${data.p3},${EOL}${indent}    p4: ${data.p4},${EOL}${indent}    links: [${EOL}${links}${EOL}${indent}    ]${EOL}${indent}}`;
}

const langOrder = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];

// ── B3 replacement ──
{
  const indent = '                ';
  const langBlocks = langOrder.map(L => renderHubLang(L, HUB[L], indent + '    ')).join(',' + EOL);
  const newBlock =
`${indent}// Phase D3.1.3b: 10-lang lookup (was: ar/en ternary)` + EOL +
`${indent}const _HUB_RELATED_BY_LANG = {` + EOL +
langBlocks + EOL +
`${indent}};` + EOL +
`${indent}const _HUB_RELATED = _HUB_RELATED_BY_LANG[_lng_] || _HUB_RELATED_BY_LANG.en;`;

  // Find old block: from "const _HUB_RELATED = (_lng_ === 'ar') ? {" to its closing "};"
  const startMarker = `${indent}const _HUB_RELATED = (_lng_ === 'ar') ? {`;
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error('B3 startMarker not found');
  // The old structure ends with `${indent}};` after the EN labels array.
  // Simplest: scan forward to "};" at the start of a line at the same indent.
  let depth = 0, j = i + startMarker.length, found = -1;
  // Track only object braces { } for the ternary expression. Each branch ends with `}` then either `:` (after AR) or `;` (after EN).
  // The final `};` closes the const declaration.
  while (j < src.length) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') {
      if (depth === 0) {
        // Matched the closing `}` of the EN object. Look for `;` after it.
        const semi = src.indexOf(';', j);
        found = semi + 1;
        break;
      }
      depth--;
    }
    j++;
  }
  if (found < 0) throw new Error('B3 endMarker not found');
  const out = src.substring(0, i) + newBlock + src.substring(found);
  fs.writeFileSync(file, out, 'utf8');
  console.log('OK B3: replaced _HUB_RELATED ternary with 10-lang lookup');
}

// ── B4 replacement ──
{
  const src2 = fs.readFileSync(file, 'utf8');
  const indent = '                ';
  const langBlocks = langOrder.map(L => renderTdcLang(L, TDC[L], indent + '    ')).join(',' + EOL);
  const newBlock =
`${indent}// Phase D3.1.3b: 10-lang lookup (was: _TDC_AR / _TDC_EN ternary)` + EOL +
`${indent}const _TDC_BY_LANG = {` + EOL +
langBlocks + EOL +
`${indent}};` + EOL +
`${indent}const _tdc = _TDC_BY_LANG[_lng_] || _TDC_BY_LANG.en;`;

  // Find old block: "const _TDC_AR = {" through "const _tdc = (_lng_ === 'ar') ? _TDC_AR : _TDC_EN;"
  const startMarker = `${indent}const _TDC_AR = {`;
  const endMarker = `${indent}const _tdc = (_lng_ === 'ar') ? _TDC_AR : _TDC_EN;`;
  const i = src2.indexOf(startMarker);
  if (i < 0) throw new Error('B4 startMarker not found');
  const j = src2.indexOf(endMarker, i);
  if (j < 0) throw new Error('B4 endMarker not found');
  const fullEnd = j + endMarker.length;
  const out = src2.substring(0, i) + newBlock + src2.substring(fullEnd);
  fs.writeFileSync(file, out, 'utf8');
  console.log('OK B4: replaced _TDC_AR/EN ternary with 10-lang lookup');
}

console.log('All Phase D3.1.3b edits applied.');
