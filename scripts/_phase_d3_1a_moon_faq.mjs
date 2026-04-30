// Phase D3.1a — translate Moon FAQ (today/general) and Moon Hub FAQ to 8 languages.
// Two transformations:
//   1) MOON_FAQ_I18N — INSERT 8 new lang arrays after the existing en array.
//   2) _MOON_HUB_FAQ — REPLACE ar+en pair with single 10-lang object + lookup selector.
//
// Preserves all template-literal placeholders exactly: ${_cityName}, ${_hubCity},
// and the conditional patterns _cityName ? ` … in ${_cityName}` : `…`.
import fs from 'fs';

const file = 'server.js';
const src = fs.readFileSync(file, 'utf8');
const isCRLF = /\r\n/.test(src);
const EOL = isCRLF ? '\r\n' : '\n';
let s = src;

// Render a Q/A array literal (8 items) for one language with proper indentation.
// Each item is { q, a }. q and a are JS source fragments (template strings or
// expressions) — they're inserted verbatim into the output.
function renderItems(items, indent) {
  const lines = [];
  for (const it of items) {
    lines.push(`${indent}{ q: ${it.q},`);
    lines.push(`${indent}  a: ${it.a} },`);
  }
  return lines.join(EOL);
}

// ────────────────────────────────────────────────────────────────────────
// 1) MOON_FAQ_I18N — 8 Qs per new lang (FR, TR, UR, DE, ID, ES, BN, MS)
//    These match the EN first-8 set (the SSR slice(0,8) takes the first 8).
//
//    Q1=phase tonight (city-conditional answer)
//    Q2=next full moon
//    Q3=moonrise tonight (city-conditional Q + A)
//    Q4=illumination calculation
//    Q5=new moon vs crescent
//    Q6=next Hijri month
//    Q7=next Ramadan
//    Q8=next Eid al-Fitr
// ────────────────────────────────────────────────────────────────────────

const moonFaqI18nNew = {
  fr: [
    { q: '`Quelle est la phase de la Lune ce soir ?`',
      a: '"La phase lunaire de ce soir parcourt un cycle d\'environ 29,5 jours entre nouvelle lune, croissant et pleine lune. Cette page affiche la phase actuelle et le pourcentage d\'illumination en temps réel" + (_cityName ? ` pour ${_cityName}.` : \' selon votre localisation.\')' },
    { q: '`Quand est la prochaine pleine lune ?`',
      a: '`Une pleine lune se produit environ tous les 29,5 jours. Nous affichons les dates grégorienne et hégirienne précises de la prochaine pleine lune, lorsque la Lune atteint 100 % d\'illumination.`' },
    { q: '_cityName ? `À quelle heure la Lune se lève-t-elle ce soir à ${_cityName} ?` : `À quelle heure la Lune se lève-t-elle ce soir ?`',
      a: '(_cityName ? `Le lever de la Lune à ${_cityName}` : "L\'heure de lever de la Lune") + " dépend de la longitude de votre localisation. Nous calculons et affichons l\'heure exacte de lever et de coucher de la Lune en heure locale."' },
    { q: '`Comment l\'illumination de la Lune est-elle calculée ?`',
      a: '`L\'illumination lunaire est la fraction de la surface de la Lune éclairée par le Soleil vue depuis la Terre. Elle varie de 0 % (nouvelle lune) à 100 % (pleine lune), calculée astronomiquement à partir de l\'angle Soleil-Lune-Terre.`' },
    { q: '`Quelle est la différence entre une nouvelle lune et un croissant ?`',
      a: '`La nouvelle lune se produit lorsque la Lune se trouve entre la Terre et le Soleil (0 % d\'illumination, invisible). Le croissant apparaît 1 à 2 jours après la nouvelle lune comme un premier arc fin et visible de lumière sur l\'horizon occidental après le coucher du soleil.`' },
    { q: '`Quand commence le prochain mois hégirien (islamique) ?`',
      a: '`Le prochain mois hégirien commence avec l\'observation du croissant après le coucher du soleil au 29e jour du mois en cours. Nous affichons la date prévue selon les calculs astronomiques ; la date réelle peut varier d\'un jour selon la visibilité locale du croissant.`' },
    { q: '`Quand est le prochain Ramadan ?`',
      a: '`Le prochain Ramadan devrait commencer après l\'observation du croissant de Ramadan au 29e jour de Cha‘ban. La date de début finale dépend de l\'observation locale de la Lune dans chaque pays.`' },
    { q: '`Quand est la prochaine Aïd al-Fitr ?`',
      a: '`L\'Aïd al-Fitr commence avec l\'observation du croissant de Chawwâl au 29e jour de Ramadan. Elle est célébrée le 1er Chawwâl et dure 3 jours dans de nombreux pays musulmans.`' }
  ],
  tr: [
    { q: '`Bu gece ayın evresi nedir?`',
      a: '"Bu geceki ay evresi, yeni ay, hilal ve dolunay arasında yaklaşık 29,5 günlük bir kameri ay döngüsünden geçer. Bu sayfa mevcut evreyi ve aydınlanma yüzdesini gerçek zamanlı olarak" + (_cityName ? ` ${_cityName} için gösterir.` : " konumunuza göre gösterir.")' },
    { q: '`Bir sonraki dolunay ne zaman?`',
      a: '`Dolunay yaklaşık her 29,5 günde bir gerçekleşir. Bir sonraki dolunayın hassas miladi ve hicri tarihlerini, ayın %100 aydınlanmaya ulaştığı anı gösteriyoruz.`' },
    { q: '_cityName ? `Bu gece ${_cityName} için Ay ne zaman doğar?` : `Bu gece Ay ne zaman doğar?`',
      a: '(_cityName ? `${_cityName} için ay doğuşu` : "Ay doğuş saati") + " konumunuzun boylamına bağlıdır. Tam ay doğuşu ve batışını yerel saate göre hesaplayıp gösteriyoruz."' },
    { q: '`Ay aydınlanması nasıl hesaplanır?`',
      a: '`Ay aydınlanması, Dünya\'dan görüldüğü şekliyle Ay yüzeyinin Güneş tarafından aydınlatılan kısmıdır. %0 (yeni ay) ile %100 (dolunay) arasında değişir ve Güneş-Ay-Dünya açısından astronomik olarak hesaplanır.`' },
    { q: '`Yeni ay ile hilal arasındaki fark nedir?`',
      a: '`Yeni ay, Ay\'ın Dünya ile Güneş arasında bulunduğu andır (%0 aydınlanma, görünmez). Hilal, yeni aydan 1-2 gün sonra batı ufkunda gün batımından sonra görülen ilk ince ışık yayı olarak ortaya çıkar.`' },
    { q: '`Bir sonraki hicri (İslami) ay ne zaman başlar?`',
      a: '`Bir sonraki hicri ay, mevcut ayın 29. gününün gün batımından sonra hilalin görülmesiyle başlar. Astronomik hesaplara dayanarak beklenen tarihi gösteriyoruz; gerçek tarih yerel hilal görünürlüğüne bağlı olarak bir gün değişebilir.`' },
    { q: '`Bir sonraki Ramazan ne zaman?`',
      a: '`Bir sonraki Ramazan, Şaban\'ın 29. gününde Ramazan hilalinin görülmesinden sonra başlamasının beklendiği tarihtir. Kesin başlangıç tarihi her ülkedeki yerel ay rüyetine bağlıdır.`' },
    { q: '`Bir sonraki Ramazan Bayramı ne zaman?`',
      a: '`Ramazan Bayramı, Ramazan\'ın 29. gününde Şevval hilalinin görülmesiyle başlar. Şevval\'in 1. gününde kutlanır ve birçok Müslüman ülkede 3 gün sürer.`' }
  ],
  ur: [
    { q: '`آج رات چاند کا طور کیا ہے؟`',
      a: '"آج رات چاند کا طور تقریباً 29.5 دن کے قمری ماہ کے دوران نئے چاند، ہلال اور بدر کے درمیان گزرتا ہے۔ یہ صفحہ موجودہ طور اور روشنی کا فیصد حقیقی وقت میں" + (_cityName ? ` ${_cityName} کے لیے دکھاتا ہے۔` : " آپ کے مقام کے مطابق دکھاتا ہے۔")' },
    { q: '`اگلا بدر کب ہوگا؟`',
      a: '`بدر تقریباً ہر 29.5 دن میں ہوتا ہے۔ ہم اگلے بدر کی درست عیسوی اور ہجری تاریخیں دکھاتے ہیں، جب چاند 100% روشنی تک پہنچ جاتا ہے۔`' },
    { q: '_cityName ? `آج رات ${_cityName} میں چاند کب طلوع ہوگا؟` : `آج رات چاند کب طلوع ہوگا؟`',
      a: '(_cityName ? `${_cityName} میں مطلعِ چاند` : "مطلعِ چاند کا وقت") + " آپ کے مقام کے خط طول پر منحصر ہے۔ ہم درست مطلع اور مغیبِ چاند کا حساب لگا کر مقامی وقت میں دکھاتے ہیں۔"' },
    { q: '`چاند کی روشنی کا حساب کیسے لگایا جاتا ہے؟`',
      a: '`چاند کی روشنی زمین سے دیکھے جانے والے چاند کی سطح کا وہ حصہ ہے جسے سورج روشن کرتا ہے۔ یہ 0% (نیا چاند) سے 100% (بدر) تک ہوتا ہے، اور سورج-چاند-زمین کے زاویے سے فلکیاتی طور پر شمار کیا جاتا ہے۔`' },
    { q: '`نئے چاند اور ہلال کے درمیان کیا فرق ہے؟`',
      a: '`نیا چاند وہ لمحہ ہے جب چاند زمین اور سورج کے درمیان ہوتا ہے (0% روشن، نظر نہیں آتا)۔ ہلال نئے چاند کے 1-2 دن بعد مغرب کے بعد مغربی افق پر روشنی کے پہلے باریک قوس کے طور پر نمودار ہوتا ہے۔`' },
    { q: '`اگلا ہجری (اسلامی) مہینہ کب شروع ہوگا؟`',
      a: '`اگلا ہجری مہینہ موجودہ مہینے کی 29ویں تاریخ کو غروبِ آفتاب کے بعد ہلال نظر آنے سے شروع ہوتا ہے۔ ہم فلکیاتی حسابات کے مطابق متوقع تاریخ دکھاتے ہیں؛ اصل تاریخ مقامی رؤیتِ ہلال کے مطابق ایک دن مختلف ہو سکتی ہے۔`' },
    { q: '`اگلا رمضان کب ہوگا؟`',
      a: '`اگلا رمضان شعبان کی 29ویں تاریخ کو رمضان کا ہلال دیکھے جانے کے بعد شروع ہونے کی توقع ہے۔ آغاز کی حتمی تاریخ ہر ملک میں مقامی رؤیتِ ہلال پر منحصر ہے۔`' },
    { q: '`اگلی عید الفطر کب ہوگی؟`',
      a: '`عید الفطر رمضان کی 29ویں تاریخ کو شوال کا ہلال دیکھے جانے سے شروع ہوتی ہے۔ یہ شوال کی پہلی تاریخ کو منائی جاتی ہے اور بہت سے مسلم ممالک میں 3 دن تک رہتی ہے۔`' }
  ],
  de: [
    { q: '`Welche Mondphase ist heute Nacht?`',
      a: '"Die heutige Mondphase durchläuft einen etwa 29,5-tägigen Mondzyklus zwischen Neumond, Sichel und Vollmond. Diese Seite zeigt die aktuelle Phase und den Beleuchtungsprozentsatz in Echtzeit" + (_cityName ? ` für ${_cityName}.` : " basierend auf Ihrem Standort.")' },
    { q: '`Wann ist der nächste Vollmond?`',
      a: '`Ein Vollmond tritt etwa alle 29,5 Tage auf. Wir zeigen die genauen gregorianischen und Hidschri-Daten des nächsten Vollmonds, wenn der Mond 100 % Beleuchtung erreicht.`' },
    { q: '_cityName ? `Wann geht der Mond heute Nacht in ${_cityName} auf?` : `Wann geht der Mond heute Nacht auf?`',
      a: '(_cityName ? `Der Mondaufgang in ${_cityName}` : "Die Mondaufgangszeit") + " hängt von der geografischen Länge Ihres Standorts ab. Wir berechnen und zeigen den exakten Mondauf- und -untergang in Ortszeit."' },
    { q: '`Wie wird die Mondbeleuchtung berechnet?`',
      a: '`Die Mondbeleuchtung ist der Anteil der Mondoberfläche, der von der Sonne beleuchtet wird, von der Erde aus gesehen. Sie reicht von 0 % (Neumond) bis 100 % (Vollmond) und wird astronomisch aus dem Sonne-Mond-Erde-Winkel berechnet.`' },
    { q: '`Was ist der Unterschied zwischen Neumond und Sichelmond?`',
      a: '`Ein Neumond liegt zwischen Erde und Sonne (0 % beleuchtet, unsichtbar). Eine Sichel erscheint 1–2 Tage nach dem Neumond als erster dünner sichtbarer Lichtbogen am westlichen Horizont nach Sonnenuntergang.`' },
    { q: '`Wann beginnt der nächste Hidschri-Monat (islamischer Monat)?`',
      a: '`Der nächste Hidschri-Monat beginnt mit der Sichtung der Mondsichel nach Sonnenuntergang am 29. Tag des aktuellen Monats. Wir zeigen das anhand astronomischer Berechnungen erwartete Datum; das tatsächliche Datum kann je nach lokaler Sichtbarkeit der Sichel um einen Tag variieren.`' },
    { q: '`Wann ist der nächste Ramadan?`',
      a: '`Der nächste Ramadan beginnt voraussichtlich nach der Sichtung der Ramadan-Sichel am 29. Schaʿbān. Das endgültige Startdatum hängt von der lokalen Mondsichtung in jedem Land ab.`' },
    { q: '`Wann ist das nächste Eid al-Fitr?`',
      a: '`Eid al-Fitr beginnt mit der Sichtung der Schawwāl-Sichel am 29. Ramadan. Es wird am 1. Schawwāl gefeiert und dauert in vielen muslimischen Ländern 3 Tage.`' }
  ],
  id: [
    { q: '`Apa fase bulan malam ini?`',
      a: '"Fase bulan malam ini melewati siklus bulan sekitar 29,5 hari antara bulan baru, hilal dan purnama. Halaman ini menampilkan fase saat ini dan persentase iluminasi secara real-time" + (_cityName ? ` untuk ${_cityName}.` : " berdasarkan lokasi Anda.")' },
    { q: '`Kapan bulan purnama berikutnya?`',
      a: '`Bulan purnama terjadi sekitar setiap 29,5 hari. Kami menampilkan tanggal Masehi dan Hijriah yang tepat untuk bulan purnama berikutnya, saat Bulan mencapai iluminasi 100%.`' },
    { q: '_cityName ? `Pukul berapa Bulan terbit malam ini di ${_cityName}?` : `Pukul berapa Bulan terbit malam ini?`',
      a: '(_cityName ? `Terbit Bulan di ${_cityName}` : "Waktu terbit Bulan") + " tergantung pada bujur lokasi Anda. Kami menghitung dan menampilkan waktu terbit dan terbenam Bulan yang tepat dalam waktu setempat."' },
    { q: '`Bagaimana iluminasi bulan dihitung?`',
      a: '`Iluminasi bulan adalah fraksi permukaan Bulan yang disinari Matahari sebagaimana terlihat dari Bumi. Berkisar dari 0% (bulan baru) hingga 100% (purnama), dihitung secara astronomis dari sudut Matahari-Bulan-Bumi.`' },
    { q: '`Apa bedanya bulan baru dengan hilal?`',
      a: '`Bulan baru adalah saat Bulan berada antara Bumi dan Matahari (iluminasi 0%, tidak terlihat). Hilal muncul 1-2 hari setelah bulan baru sebagai busur cahaya tipis pertama yang terlihat di ufuk barat setelah matahari terbenam.`' },
    { q: '`Kapan bulan Hijriah (Islam) berikutnya dimulai?`',
      a: '`Bulan Hijriah berikutnya dimulai dengan rukyat hilal setelah matahari terbenam pada tanggal 29 bulan berjalan. Kami menampilkan tanggal yang diperkirakan berdasarkan perhitungan astronomis; tanggal sebenarnya dapat berbeda satu hari tergantung visibilitas hilal lokal.`' },
    { q: '`Kapan Ramadan berikutnya?`',
      a: '`Ramadan berikutnya diperkirakan dimulai setelah hilal Ramadan terlihat pada 29 Sya\'ban. Tanggal mulai final tergantung pada rukyat hilal lokal di setiap negara.`' },
    { q: '`Kapan Idul Fitri berikutnya?`',
      a: '`Idul Fitri dimulai dengan rukyat hilal Syawal pada 29 Ramadan. Dirayakan pada 1 Syawal dan berlangsung 3 hari di banyak negara Muslim.`' }
  ],
  es: [
    { q: '`¿Cuál es la fase lunar de esta noche?`',
      a: '"La fase lunar de esta noche atraviesa un ciclo lunar de aproximadamente 29,5 días entre luna nueva, creciente y luna llena. Esta página muestra la fase actual y el porcentaje de iluminación en tiempo real" + (_cityName ? ` para ${_cityName}.` : " según su ubicación.")' },
    { q: '`¿Cuándo es la próxima luna llena?`',
      a: '`Una luna llena ocurre aproximadamente cada 29,5 días. Mostramos las fechas gregoriana e hijri precisas de la próxima luna llena, cuando la Luna alcanza el 100 % de iluminación.`' },
    { q: '_cityName ? `¿A qué hora sale la Luna esta noche en ${_cityName}?` : `¿A qué hora sale la Luna esta noche?`',
      a: '(_cityName ? `La salida de la Luna en ${_cityName}` : "La hora de salida de la Luna") + " depende de la longitud de su ubicación. Calculamos y mostramos la salida y puesta exactas de la Luna en hora local."' },
    { q: '`¿Cómo se calcula la iluminación lunar?`',
      a: '`La iluminación lunar es la fracción de la superficie de la Luna iluminada por el Sol vista desde la Tierra. Va del 0 % (luna nueva) al 100 % (luna llena), calculada astronómicamente a partir del ángulo Sol-Luna-Tierra.`' },
    { q: '`¿Cuál es la diferencia entre luna nueva y creciente?`',
      a: '`La luna nueva ocurre cuando la Luna se sitúa entre la Tierra y el Sol (0 % iluminada, invisible). El creciente aparece 1-2 días después como el primer arco fino visible de luz en el horizonte occidental tras la puesta del sol.`' },
    { q: '`¿Cuándo comienza el próximo mes hijri (islámico)?`',
      a: '`El próximo mes hijri comienza con la observación del creciente tras la puesta del sol del día 29 del mes actual. Mostramos la fecha esperada según cálculos astronómicos; la fecha real puede variar un día según la visibilidad local del creciente.`' },
    { q: '`¿Cuándo es el próximo Ramadán?`',
      a: '`El próximo Ramadán comenzará tras la observación del creciente de Ramadán el 29 de Sha\'ban. La fecha final de inicio depende de la observación local de la Luna en cada país.`' },
    { q: '`¿Cuándo es el próximo Eid al-Fitr?`',
      a: '`El Eid al-Fitr comienza con la observación del creciente de Shawwal el 29 de Ramadán. Se celebra el 1 de Shawwal y dura 3 días en muchos países musulmanes.`' }
  ],
  bn: [
    { q: '`আজ রাতে চাঁদের দশা কী?`',
      a: '"আজ রাতে চাঁদের দশা প্রায় ২৯.৫ দিনের চান্দ্র মাসে অমাবস্যা, হিলাল ও পূর্ণিমার মধ্য দিয়ে চলে। এই পৃষ্ঠা বর্তমান দশা ও আলোকন শতাংশ রিয়েল-টাইমে" + (_cityName ? ` ${_cityName}-এর জন্য দেখায়।` : " আপনার অবস্থান অনুযায়ী দেখায়।")' },
    { q: '`পরবর্তী পূর্ণিমা কখন?`',
      a: '`পূর্ণিমা প্রায় প্রতি ২৯.৫ দিন পর পর ঘটে। আমরা পরবর্তী পূর্ণিমার সঠিক খ্রিস্টীয় ও হিজরি তারিখ দেখাই, যখন চাঁদ ১০০% আলোকনে পৌঁছায়।`' },
    { q: '_cityName ? `আজ রাতে ${_cityName}-এ চাঁদ কখন উদয় হবে?` : `আজ রাতে চাঁদ কখন উদয় হবে?`',
      a: '(_cityName ? `${_cityName}-এ চাঁদ উদয়` : "চাঁদ উদয়ের সময়") + " আপনার অবস্থানের দ্রাঘিমাংশের উপর নির্ভর করে। আমরা স্থানীয় সময়ে চাঁদের সঠিক উদয় ও অস্ত গণনা করে দেখাই।"' },
    { q: '`চাঁদের আলোকন কীভাবে হিসাব করা হয়?`',
      a: '`চাঁদের আলোকন হল পৃথিবী থেকে দেখা সূর্য দ্বারা আলোকিত চাঁদের পৃষ্ঠের অংশ। এটি ০% (অমাবস্যা) থেকে ১০০% (পূর্ণিমা) পর্যন্ত হয়, সূর্য-চাঁদ-পৃথিবী কোণ থেকে জ্যোতির্বিজ্ঞান অনুসারে গণনা করা হয়।`' },
    { q: '`অমাবস্যা ও হিলালের মধ্যে পার্থক্য কী?`',
      a: '`অমাবস্যা হল যখন চাঁদ পৃথিবী ও সূর্যের মাঝে থাকে (০% আলোকিত, অদৃশ্য)। হিলাল অমাবস্যার ১-২ দিন পর পশ্চিম দিগন্তে সূর্যাস্তের পর প্রথম পাতলা দৃশ্যমান আলোক চাপ হিসেবে আবির্ভূত হয়।`' },
    { q: '`পরবর্তী হিজরি (ইসলামী) মাস কখন শুরু হবে?`',
      a: '`পরবর্তী হিজরি মাস বর্তমান মাসের ২৯তম দিনের সূর্যাস্তের পর হিলাল দেখার মাধ্যমে শুরু হয়। আমরা জ্যোতির্বিজ্ঞান গণনা অনুযায়ী প্রত্যাশিত তারিখ দেখাই; প্রকৃত তারিখ স্থানীয় হিলাল দৃশ্যমানতা অনুসারে এক দিন ভিন্ন হতে পারে।`' },
    { q: '`পরবর্তী রমজান কখন?`',
      a: '`পরবর্তী রমজান শাবানের ২৯তম দিনে রমজানের হিলাল দেখার পর শুরু হবে বলে আশা করা হচ্ছে। চূড়ান্ত শুরুর তারিখ প্রতিটি দেশে স্থানীয় চাঁদ দেখার উপর নির্ভর করে।`' },
    { q: '`পরবর্তী ঈদুল ফিতর কখন?`',
      a: '`ঈদুল ফিতর রমজানের ২৯তম দিনে শাওয়ালের হিলাল দেখার মাধ্যমে শুরু হয়। এটি শাওয়ালের ১ তারিখে উদযাপিত হয় এবং অনেক মুসলিম দেশে ৩ দিন স্থায়ী হয়।`' }
  ],
  ms: [
    { q: '`Apakah fasa bulan malam ini?`',
      a: '"Fasa bulan malam ini melalui kitaran bulan kira-kira 29.5 hari antara anak bulan, hilal dan bulan purnama. Halaman ini memaparkan fasa semasa dan peratus pencahayaan secara masa nyata" + (_cityName ? ` untuk ${_cityName}.` : " berdasarkan lokasi anda.")' },
    { q: '`Bilakah bulan purnama seterusnya?`',
      a: '`Bulan purnama berlaku kira-kira setiap 29.5 hari. Kami memaparkan tarikh Masihi dan Hijrah tepat bagi bulan purnama seterusnya, ketika Bulan mencapai pencahayaan 100%.`' },
    { q: '_cityName ? `Pukul berapa Bulan terbit malam ini di ${_cityName}?` : `Pukul berapa Bulan terbit malam ini?`',
      a: '(_cityName ? `Terbit Bulan di ${_cityName}` : "Waktu terbit Bulan") + " bergantung pada bujur lokasi anda. Kami mengira dan memaparkan masa terbit dan terbenam Bulan yang tepat dalam waktu tempatan."' },
    { q: '`Bagaimana pencahayaan bulan dikira?`',
      a: '`Pencahayaan bulan ialah pecahan permukaan Bulan yang diterangi Matahari seperti dilihat dari Bumi. Ia berjulat dari 0% (anak bulan) hingga 100% (bulan purnama), dikira secara astronomi daripada sudut Matahari-Bulan-Bumi.`' },
    { q: '`Apakah perbezaan antara anak bulan dan hilal?`',
      a: '`Anak bulan adalah ketika Bulan berada antara Bumi dan Matahari (0% pencahayaan, tidak kelihatan). Hilal muncul 1-2 hari selepas anak bulan sebagai lengkok cahaya nipis pertama yang kelihatan di ufuk barat selepas matahari terbenam.`' },
    { q: '`Bilakah bulan Hijrah (Islam) seterusnya bermula?`',
      a: '`Bulan Hijrah seterusnya bermula dengan rukyah hilal selepas matahari terbenam pada 29 hari bulan semasa. Kami memaparkan tarikh yang dijangka berdasarkan pengiraan astronomi; tarikh sebenar mungkin berbeza sehari mengikut kelihatan hilal tempatan.`' },
    { q: '`Bilakah Ramadan seterusnya?`',
      a: '`Ramadan seterusnya dijangka bermula selepas rukyah hilal Ramadan pada 29 Syaaban. Tarikh mula akhir bergantung pada rukyah bulan tempatan di setiap negara.`' },
    { q: '`Bilakah Aidilfitri seterusnya?`',
      a: '`Aidilfitri bermula dengan rukyah hilal Syawal pada 29 Ramadan. Ia disambut pada 1 Syawal dan berlangsung selama 3 hari di banyak negara Muslim.`' }
  ]
};

// ────────────────────────────────────────────────────────────────────────
// 2) _MOON_HUB_FAQ — 8 Qs per new lang for /moon-in-{city} (hub) page
//    All entries use ${_hubCity} (city is always present on hub).
// ────────────────────────────────────────────────────────────────────────

const moonHubFaqNew = {
  fr: [
    { q: '`Quelle est la phase de la Lune aujourd\'hui à ${_hubCity} ?`',
      a: '`La Lune passe par 8 phases au cours d\'un cycle de 29,5 jours. Cette page affiche la phase actuelle et l\'illumination en direct pour ${_hubCity}, plus un calendrier mensuel complet des prochaines phases.`' },
    { q: '`Quand est la prochaine pleine lune à ${_hubCity} ?`',
      a: '`Une pleine lune se produit tous les 29,5 jours. Cette page affiche la date grégorienne et hégirienne précise de la prochaine pleine lune à 100 % d\'illumination.`' },
    { q: '`Quand est la prochaine nouvelle lune à ${_hubCity} ?`',
      a: '`Une nouvelle lune est l\'instant où la Lune se trouve entre la Terre et le Soleil (0 % d\'illumination). Cette page indique quand a lieu la prochaine nouvelle lune — qui marque aussi le début du nouveau mois hégirien.`' },
    { q: '`Comment utiliser le calendrier lunaire à ${_hubCity} ?`',
      a: '`Cliquez sur n\'importe quel jour du calendrier pour ouvrir les détails de ce jour pour ${_hubCity}. Utilisez les boutons mois précédent/suivant pour parcourir d\'autres mois. Chaque mois a sa propre page à /moon-in-{city}/YYYY-MM.`' },
    { q: '`Pourquoi les heures de lever et coucher de la Lune à ${_hubCity} diffèrent-elles d\'autres villes ?`',
      a: '`Le lever et le coucher de la Lune dépendent de la longitude, de la latitude et du fuseau horaire. La différence peut atteindre 12 heures entre l\'est et l\'ouest du globe. Les heures de cette page sont calculées pour le fuseau horaire local de ${_hubCity}.`' },
    { q: '`Quel est le rapport entre la Lune et le calendrier hégirien ?`',
      a: '`Le calendrier hégirien est entièrement lunaire — chaque mois commence avec l\'observation du croissant après la nouvelle lune et dure 29 ou 30 jours. L\'année hégirienne compte 354–355 jours, soit ~11 jours de moins que l\'année solaire.`' },
    { q: '`Quelle est la différence entre une constellation astronomique et un signe du zodiaque ?`',
      a: '`Une constellation astronomique est une région du ciel avec des limites officielles de l\'IAU (88 au total, 13 le long de l\'écliptique y compris Ophiuchus). Un signe du zodiaque est une division astrologique égale de 30° qui ne reflète PAS la position astronomique réelle. Nous utilisons les constellations IAU.`' },
    { q: '`Les données lunaires de cette page sont-elles à l\'heure locale de ${_hubCity} ?`',
      a: '`Oui. Toutes les heures de lever/coucher de la Lune et de pleine/nouvelle lune sont calculées dans le fuseau horaire local de ${_hubCity}. Les coordonnées géographiques de la ville affectent également la direction et l\'altitude.`' }
  ],
  tr: [
    { q: '`${_hubCity} için bugün ay evresi nedir?`',
      a: '`Ay, 29,5 günlük bir döngüde 8 evreden geçer. Bu sayfa ${_hubCity} için güncel evreyi ve aydınlanmayı canlı olarak gösterir, ayrıca yaklaşan evrelerin tam aylık takvimini sunar.`' },
    { q: '`${_hubCity} için bir sonraki dolunay ne zaman?`',
      a: '`Dolunay her 29,5 günde bir gerçekleşir. Bu sayfa, %100 aydınlanmadaki bir sonraki dolunayın hassas miladi ve hicri tarihini gösterir.`' },
    { q: '`${_hubCity} için bir sonraki yeni ay ne zaman?`',
      a: '`Yeni ay, Ay\'ın Dünya ile Güneş arasında bulunduğu andır (%0 aydınlanma). Bu sayfa, yeni hicri ayın başlangıcı olan bir sonraki yeni ayın ne zaman olacağını gösterir.`' },
    { q: '`${_hubCity} için ay takvimini nasıl kullanırım?`',
      a: '`Takvimdeki herhangi bir güne tıklayarak ${_hubCity} için o günün ayrıntılarını açın. Diğer ayları gezmek için önceki/sonraki ay düğmelerini kullanın. Her ayın /moon-in-{city}/YYYY-MM adresinde kendi sayfası vardır.`' },
    { q: '`${_hubCity} için ay doğuşu ve batışı saatleri neden diğer şehirlerden farklı?`',
      a: '`Ay doğuşu ve batışı boylama, enleme ve saat dilimine bağlıdır. Fark, dünyanın doğusu ile batısı arasında 12 saate ulaşabilir. Bu sayfanın saatleri ${_hubCity}\'in yerel saat dilimi için hesaplanmıştır.`' },
    { q: '`Ay\'ın hicri takvim ile ilişkisi nedir?`',
      a: '`Hicri takvim tamamen kameridir — her ay yeni aydan sonra hilal görülmesiyle başlar ve 29 veya 30 gün sürer. Hicri yıl 354–355 gündür, güneş yılından ~11 gün daha kısadır.`' },
    { q: '`Astronomik takımyıldız ile burç arasındaki fark nedir?`',
      a: '`Astronomik takımyıldız, IAU\'nun resmi sınırları olan bir gökyüzü bölgesidir (toplam 88, ekliptik boyunca Ophiuchus dahil 13). Burç, gerçek astronomik konumu YANSITMAYAN, 30°-eşit astrolojik bölünmedir. Biz IAU takımyıldızlarını kullanıyoruz.`' },
    { q: '`Bu sayfadaki ay verileri ${_hubCity}\'in yerel saatinde mi?`',
      a: '`Evet. Tüm ay doğuşu/batışı ve dolunay/yeni ay saatleri ${_hubCity}\'in yerel saat diliminde hesaplanır. Şehrin coğrafi koordinatları da yön ve yüksekliği etkiler.`' }
  ],
  ur: [
    { q: '`${_hubCity} میں آج چاند کا طور کیا ہے؟`',
      a: '`چاند 29.5 دن کے دور میں 8 اطوار سے گزرتا ہے۔ یہ صفحہ ${_hubCity} کے لیے موجودہ طور اور روشنی براہِ راست دکھاتا ہے، اور آنے والے اطوار کی مکمل ماہانہ تقویم بھی۔`' },
    { q: '`${_hubCity} میں اگلا بدر کب ہوگا؟`',
      a: '`بدر ہر 29.5 دن میں ہوتا ہے۔ یہ صفحہ 100% روشنی پر اگلے بدر کی درست عیسوی اور ہجری تاریخ دکھاتا ہے۔`' },
    { q: '`${_hubCity} میں اگلا نیا چاند کب ہوگا؟`',
      a: '`نیا چاند وہ لمحہ ہے جب چاند زمین اور سورج کے درمیان ہوتا ہے (0% روشنی)۔ یہ صفحہ اگلے نئے چاند کا وقت دکھاتا ہے — جو نئے ہجری مہینے کا آغاز بھی ہے۔`' },
    { q: '`${_hubCity} میں چاند کی تقویم کیسے استعمال کریں؟`',
      a: '`تقویم میں کسی بھی دن پر کلک کریں تاکہ ${_hubCity} کے لیے اس دن کی تفصیلات کھل جائیں۔ دوسرے مہینے دیکھنے کے لیے پچھلا/اگلا ماہ کے بٹن استعمال کریں۔ ہر مہینے کا اپنا صفحہ /moon-in-{city}/YYYY-MM پر ہے۔`' },
    { q: '`${_hubCity} میں مطلع و مغیبِ چاند کے اوقات دوسرے شہروں سے کیوں مختلف ہیں؟`',
      a: '`مطلع و مغیبِ چاند خطِ طول، خطِ عرض اور ٹائم زون پر منحصر ہیں۔ زمین کے مشرق اور مغرب کے درمیان فرق 12 گھنٹے تک پہنچ سکتا ہے۔ اس صفحے کے اوقات ${_hubCity} کے مقامی ٹائم زون کے لیے شمار کیے گئے ہیں۔`' },
    { q: '`چاند کا ہجری تقویم سے کیا تعلق ہے؟`',
      a: '`ہجری تقویم مکمل طور پر قمری ہے — ہر مہینہ نئے چاند کے بعد ہلال کی رؤیت سے شروع ہوتا ہے اور 29 یا 30 دن رہتا ہے۔ ہجری سال 354–355 دن کا ہے، شمسی سال سے تقریباً 11 دن کم۔`' },
    { q: '`فلکیاتی کوکبہ اور برج کے درمیان کیا فرق ہے؟`',
      a: '`فلکیاتی کوکبہ آسمان کا ایک علاقہ ہے جس کی IAU کی رسمی حدود ہیں (کل 88، دائرۃ البروج کے ساتھ Ophiuchus سمیت 13)۔ برج 30° مساوی نجومی تقسیم ہے جو حقیقی فلکیاتی پوزیشن کو ظاہر نہیں کرتا۔ ہم IAU کوکبات استعمال کرتے ہیں۔`' },
    { q: '`کیا اس صفحے کا چاند ڈیٹا ${_hubCity} کے مقامی وقت میں ہے؟`',
      a: '`جی ہاں۔ تمام مطلع/مغیبِ چاند اور بدر/نئے چاند کے اوقات ${_hubCity} کے مقامی ٹائم زون میں شمار کیے جاتے ہیں۔ شہر کی جغرافیائی محلِ وقوع بھی اتجاہ اور ارتفاع کو متاثر کرتی ہے۔`' }
  ],
  de: [
    { q: '`Welche Mondphase ist heute in ${_hubCity}?`',
      a: '`Der Mond durchläuft 8 Phasen in einem 29,5-tägigen Zyklus. Diese Seite zeigt die aktuelle Phase und Beleuchtung live für ${_hubCity}, plus einen vollständigen Monatskalender der kommenden Phasen.`' },
    { q: '`Wann ist der nächste Vollmond in ${_hubCity}?`',
      a: '`Ein Vollmond tritt alle 29,5 Tage auf. Diese Seite zeigt das genaue gregorianische und Hidschri-Datum des nächsten Vollmonds bei 100 % Beleuchtung.`' },
    { q: '`Wann ist der nächste Neumond in ${_hubCity}?`',
      a: '`Ein Neumond ist der Moment, in dem der Mond zwischen Erde und Sonne liegt (0 % Beleuchtung). Diese Seite zeigt, wann der nächste Neumond stattfindet — auch der Beginn des neuen Hidschri-Monats.`' },
    { q: '`Wie verwende ich den Mondkalender in ${_hubCity}?`',
      a: '`Klicken Sie auf einen beliebigen Tag im Kalender, um die Details dieses Tages für ${_hubCity} zu öffnen. Verwenden Sie die Schaltflächen "Vorheriger/Nächster Monat", um andere Monate zu durchsuchen. Jeder Monat hat seine eigene Seite unter /moon-in-{city}/YYYY-MM.`' },
    { q: '`Warum unterscheiden sich Mondaufgangs- und -untergangszeiten in ${_hubCity} von anderen Städten?`',
      a: '`Mondaufgang und -untergang hängen von der geografischen Länge, Breite und Zeitzone ab. Der Unterschied kann zwischen Ost und West der Erde 12 Stunden erreichen. Die Zeiten dieser Seite werden für die lokale Zeitzone von ${_hubCity} berechnet.`' },
    { q: '`Wie hängt der Mond mit dem Hidschri-Kalender zusammen?`',
      a: '`Der Hidschri-Kalender ist vollständig mondbasiert — jeder Monat beginnt mit der Sichtung der Mondsichel nach dem Neumond und dauert 29 oder 30 Tage. Das Hidschri-Jahr hat 354–355 Tage, ~11 Tage weniger als das Sonnenjahr.`' },
    { q: '`Was ist der Unterschied zwischen einer astronomischen Konstellation und einem Tierkreiszeichen?`',
      a: '`Eine astronomische Konstellation ist eine Himmelsregion mit offiziellen IAU-Grenzen (88 insgesamt, 13 entlang der Ekliptik einschließlich Ophiuchus). Ein Tierkreiszeichen ist eine astrologische 30°-gleiche Einteilung, die NICHT die tatsächliche astronomische Position widerspiegelt. Wir verwenden IAU-Konstellationen.`' },
    { q: '`Sind die Monddaten auf dieser Seite in der Ortszeit von ${_hubCity}?`',
      a: '`Ja. Alle Mondaufgangs-/-untergangszeiten und Vollmond-/Neumondzeiten werden in der lokalen Zeitzone von ${_hubCity} berechnet. Die geografischen Koordinaten der Stadt beeinflussen auch Richtung und Höhe.`' }
  ],
  id: [
    { q: '`Apa fase bulan hari ini di ${_hubCity}?`',
      a: '`Bulan melewati 8 fase dalam siklus 29,5 hari. Halaman ini menampilkan fase saat ini dan iluminasi secara langsung untuk ${_hubCity}, plus kalender bulanan lengkap fase-fase mendatang.`' },
    { q: '`Kapan bulan purnama berikutnya di ${_hubCity}?`',
      a: '`Bulan purnama terjadi setiap 29,5 hari. Halaman ini menampilkan tanggal Masehi dan Hijriah yang tepat untuk bulan purnama berikutnya pada iluminasi 100%.`' },
    { q: '`Kapan bulan baru berikutnya di ${_hubCity}?`',
      a: '`Bulan baru adalah saat Bulan berada antara Bumi dan Matahari (iluminasi 0%). Halaman ini menampilkan kapan bulan baru berikutnya terjadi — juga awal bulan Hijriah baru.`' },
    { q: '`Bagaimana cara menggunakan kalender bulan di ${_hubCity}?`',
      a: '`Klik hari mana pun di kalender untuk membuka detail hari itu untuk ${_hubCity}. Gunakan tombol bulan sebelumnya/berikutnya untuk menjelajahi bulan lain. Setiap bulan memiliki halamannya sendiri di /moon-in-{city}/YYYY-MM.`' },
    { q: '`Mengapa waktu terbit dan terbenam Bulan di ${_hubCity} berbeda dari kota lain?`',
      a: '`Terbit dan terbenam Bulan tergantung pada bujur, lintang, dan zona waktu. Perbedaannya dapat mencapai 12 jam antara timur dan barat dunia. Waktu di halaman ini dihitung untuk zona waktu lokal ${_hubCity}.`' },
    { q: '`Bagaimana Bulan terkait dengan kalender Hijriah?`',
      a: '`Kalender Hijriah sepenuhnya berbasis bulan — setiap bulan dimulai dengan rukyat hilal setelah bulan baru dan berlangsung 29 atau 30 hari. Tahun Hijriah 354–355 hari, ~11 hari lebih pendek dari tahun matahari.`' },
    { q: '`Apa perbedaan antara konstelasi astronomi dan zodiak?`',
      a: '`Konstelasi astronomi adalah wilayah langit dengan batas resmi IAU (total 88, 13 di sepanjang ekliptika termasuk Ophiuchus). Zodiak adalah pembagian astrologi 30°-sama yang TIDAK mencerminkan posisi astronomi sebenarnya. Kami menggunakan konstelasi IAU.`' },
    { q: '`Apakah data bulan di halaman ini dalam waktu lokal ${_hubCity}?`',
      a: '`Ya. Semua waktu terbit/terbenam Bulan dan purnama/bulan baru dihitung dalam zona waktu lokal ${_hubCity}. Koordinat geografis kota juga memengaruhi arah dan ketinggian.`' }
  ],
  es: [
    { q: '`¿Cuál es la fase lunar hoy en ${_hubCity}?`',
      a: '`La Luna pasa por 8 fases en un ciclo de 29,5 días. Esta página muestra la fase actual y la iluminación en vivo para ${_hubCity}, además de un calendario mensual completo de las próximas fases.`' },
    { q: '`¿Cuándo es la próxima luna llena en ${_hubCity}?`',
      a: '`Una luna llena ocurre cada 29,5 días. Esta página muestra la fecha gregoriana e hijri precisa de la próxima luna llena al 100 % de iluminación.`' },
    { q: '`¿Cuándo es la próxima luna nueva en ${_hubCity}?`',
      a: '`La luna nueva es el instante en que la Luna se sitúa entre la Tierra y el Sol (0 % de iluminación). Esta página muestra cuándo ocurre la próxima luna nueva — también el inicio del nuevo mes hijri.`' },
    { q: '`¿Cómo uso el calendario lunar en ${_hubCity}?`',
      a: '`Haga clic en cualquier día del calendario para abrir los detalles de ese día para ${_hubCity}. Use los botones de mes anterior/siguiente para explorar otros meses. Cada mes tiene su propia página en /moon-in-{city}/YYYY-MM.`' },
    { q: '`¿Por qué los horarios de salida y puesta de la Luna en ${_hubCity} difieren de otras ciudades?`',
      a: '`La salida y puesta de la Luna dependen de la longitud, latitud y zona horaria. La diferencia puede alcanzar 12 horas entre el este y el oeste del globo. Los horarios de esta página se calculan para la zona horaria local de ${_hubCity}.`' },
    { q: '`¿Cómo se relaciona la Luna con el calendario hijri?`',
      a: '`El calendario hijri es totalmente lunar — cada mes comienza con la observación del creciente tras la luna nueva y dura 29 o 30 días. El año hijri tiene 354–355 días, ~11 días más corto que el año solar.`' },
    { q: '`¿Cuál es la diferencia entre una constelación astronómica y un signo del zodíaco?`',
      a: '`Una constelación astronómica es una región del cielo con límites oficiales de la IAU (88 en total, 13 a lo largo de la eclíptica incluyendo Ofiuco). Un signo del zodíaco es una división astrológica de 30° iguales que NO refleja la posición astronómica real. Usamos constelaciones IAU.`' },
    { q: '`¿Los datos lunares de esta página están en hora local de ${_hubCity}?`',
      a: '`Sí. Todos los horarios de salida/puesta de la Luna y de luna llena/nueva se calculan en la zona horaria local de ${_hubCity}. Las coordenadas geográficas de la ciudad también afectan la dirección y la altitud.`' }
  ],
  bn: [
    { q: '`${_hubCity}-এ আজ চাঁদের দশা কী?`',
      a: '`চাঁদ ২৯.৫ দিনের চক্রে ৮টি দশার মধ্য দিয়ে যায়। এই পৃষ্ঠা ${_hubCity}-এর জন্য বর্তমান দশা ও আলোকন সরাসরি দেখায়, পাশাপাশি আসন্ন দশাগুলির পূর্ণ মাসিক ক্যালেন্ডার।`' },
    { q: '`${_hubCity}-এ পরবর্তী পূর্ণিমা কখন?`',
      a: '`পূর্ণিমা প্রতি ২৯.৫ দিনে ঘটে। এই পৃষ্ঠা ১০০% আলোকনে পরবর্তী পূর্ণিমার সঠিক খ্রিস্টীয় ও হিজরি তারিখ দেখায়।`' },
    { q: '`${_hubCity}-এ পরবর্তী অমাবস্যা কখন?`',
      a: '`অমাবস্যা হল সেই মুহূর্ত যখন চাঁদ পৃথিবী ও সূর্যের মাঝে থাকে (০% আলোকন)। এই পৃষ্ঠা পরবর্তী অমাবস্যা কখন ঘটবে তা দেখায় — যা নতুন হিজরি মাসের শুরুও।`' },
    { q: '`${_hubCity}-এ চাঁদের ক্যালেন্ডার কীভাবে ব্যবহার করব?`',
      a: '`${_hubCity}-এর জন্য সেই দিনের বিবরণ খুলতে ক্যালেন্ডারের যেকোনো দিনে ক্লিক করুন। অন্য মাস দেখার জন্য পূর্ববর্তী/পরবর্তী মাসের বোতাম ব্যবহার করুন। প্রতিটি মাসের নিজস্ব পৃষ্ঠা /moon-in-{city}/YYYY-MM-এ আছে।`' },
    { q: '`${_hubCity}-এ চাঁদের উদয় ও অস্তের সময় অন্য শহর থেকে কেন আলাদা?`',
      a: '`চাঁদের উদয় ও অস্ত দ্রাঘিমাংশ, অক্ষাংশ ও টাইমজোনের উপর নির্ভর করে। পার্থক্য বিশ্বের পূর্ব ও পশ্চিমের মধ্যে ১২ ঘণ্টা পর্যন্ত হতে পারে। এই পৃষ্ঠার সময়গুলি ${_hubCity}-এর স্থানীয় টাইমজোনের জন্য গণনা করা হয়।`' },
    { q: '`চাঁদ হিজরি ক্যালেন্ডারের সাথে কীভাবে সম্পর্কিত?`',
      a: '`হিজরি ক্যালেন্ডার সম্পূর্ণ চান্দ্র — প্রতিটি মাস অমাবস্যার পরে হিলাল দেখার মাধ্যমে শুরু হয় এবং ২৯ বা ৩০ দিন স্থায়ী হয়। হিজরি বছর ৩৫৪–৩৫৫ দিন, সৌর বছরের চেয়ে ~১১ দিন কম।`' },
    { q: '`জ্যোতির্বিজ্ঞানিক নক্ষত্রমণ্ডল ও রাশিচক্রের মধ্যে পার্থক্য কী?`',
      a: '`জ্যোতির্বিজ্ঞানিক নক্ষত্রমণ্ডল হল আকাশের একটি অঞ্চল যার অফিসিয়াল IAU সীমানা আছে (মোট ৮৮, ক্রান্তিবৃত্ত বরাবর Ophiuchus সহ ১৩টি)। রাশিচক্র হল একটি ৩০°-সমান জ্যোতিষ বিভাজন যা প্রকৃত জ্যোতির্বিজ্ঞানিক অবস্থান প্রতিফলিত করে না। আমরা IAU নক্ষত্রমণ্ডল ব্যবহার করি।`' },
    { q: '`এই পৃষ্ঠার চাঁদের ডেটা কি ${_hubCity}-এর স্থানীয় সময়ে?`',
      a: '`হ্যাঁ। সমস্ত চাঁদের উদয়/অস্ত এবং পূর্ণিমা/অমাবস্যার সময় ${_hubCity}-এর স্থানীয় টাইমজোনে গণনা করা হয়। শহরের ভৌগোলিক স্থানাঙ্কও দিকনির্দেশ এবং উচ্চতাকে প্রভাবিত করে।`' }
  ],
  ms: [
    { q: '`Apakah fasa bulan hari ini di ${_hubCity}?`',
      a: '`Bulan melalui 8 fasa dalam kitaran 29.5 hari. Halaman ini memaparkan fasa semasa dan pencahayaan secara langsung untuk ${_hubCity}, serta kalendar bulanan lengkap fasa-fasa akan datang.`' },
    { q: '`Bilakah bulan purnama seterusnya di ${_hubCity}?`',
      a: '`Bulan purnama berlaku setiap 29.5 hari. Halaman ini memaparkan tarikh Masihi dan Hijrah tepat bagi bulan purnama seterusnya pada pencahayaan 100%.`' },
    { q: '`Bilakah anak bulan seterusnya di ${_hubCity}?`',
      a: '`Anak bulan ialah saat Bulan berada antara Bumi dan Matahari (0% pencahayaan). Halaman ini memaparkan bila anak bulan seterusnya berlaku — juga permulaan bulan Hijrah baharu.`' },
    { q: '`Bagaimana saya menggunakan kalendar bulan di ${_hubCity}?`',
      a: '`Klik mana-mana hari dalam kalendar untuk membuka butiran hari itu untuk ${_hubCity}. Gunakan butang bulan sebelum/selepas untuk melayari bulan-bulan lain. Setiap bulan mempunyai halaman tersendiri di /moon-in-{city}/YYYY-MM.`' },
    { q: '`Mengapa waktu terbit dan terbenam Bulan di ${_hubCity} berbeza daripada bandar lain?`',
      a: '`Terbit dan terbenam Bulan bergantung pada bujur, lintang dan zon waktu. Perbezaannya boleh mencapai 12 jam antara timur dan barat dunia. Waktu pada halaman ini dikira untuk zon waktu tempatan ${_hubCity}.`' },
    { q: '`Bagaimana Bulan berkaitan dengan kalendar Hijrah?`',
      a: '`Kalendar Hijrah adalah sepenuhnya berdasarkan bulan — setiap bulan bermula dengan rukyah hilal selepas anak bulan dan berlangsung 29 atau 30 hari. Tahun Hijrah ialah 354–355 hari, ~11 hari lebih pendek daripada tahun matahari.`' },
    { q: '`Apakah perbezaan antara buruj astronomi dan tanda zodiak?`',
      a: '`Buruj astronomi ialah kawasan langit dengan sempadan rasmi IAU (88 kesemuanya, 13 sepanjang ekliptik termasuk Ophiuchus). Tanda zodiak ialah pembahagian astrologi 30°-sama yang TIDAK mencerminkan kedudukan astronomi sebenar. Kami menggunakan buruj IAU.`' },
    { q: '`Adakah data bulan di halaman ini dalam waktu tempatan ${_hubCity}?`',
      a: '`Ya. Semua waktu terbit/terbenam Bulan dan bulan purnama/anak bulan dikira dalam zon waktu tempatan ${_hubCity}. Koordinat geografi bandar juga mempengaruhi arah dan ketinggian.`' }
  ]
};

// ────────────────────────────────────────────────────────────────────────
// Build new lang-array source code (per-block) for MOON_FAQ_I18N
// Each item is rendered as:   { q: <q-source>, a: <a-source> },
// with 12-space outer indent matching the existing en/ar entries.
// ────────────────────────────────────────────────────────────────────────

function renderLangBlock(lang, items, indent = '            ') {
  // Each item has q and a as JS source fragments (template strings or expressions).
  const entries = items.map(it =>
    `${indent}    { q: ${it.q},${EOL}${indent}      a: ${it.a} }`
  ).join(',' + EOL);
  return `${indent}${lang}: [${EOL}${entries}${EOL}${indent}]`;
}

// ────────────────────────────────────────────────────────────────────────
// 1) MOON_FAQ_I18N — INSERT 8 new lang arrays after the en array.
// Anchor points to the closing of the en array followed by the closing of
// the MOON_FAQ_I18N object, before the comment "// UAT-Moon-City-Hub-Polish".
// ────────────────────────────────────────────────────────────────────────

{
  // The existing en array ends with ` ]` (no trailing comma) before `        };`.
  // We change it to `,` and insert 8 new lang blocks.
  const startMarker = '        const MOON_FAQ_I18N = {';
  const endMarker = '            ],' + EOL + '        };' + EOL + '        // UAT-Moon-City-Hub-Polish';

  const i = s.indexOf(startMarker);
  if (i < 0) throw new Error('MOON_FAQ_I18N start marker not found');
  const j = s.indexOf(endMarker, i);
  if (j < 0) throw new Error('MOON_FAQ_I18N end marker not found');

  const langOrder = ['fr','tr','ur','de','id','es','bn','ms'];
  const newLangsSource = langOrder.map(lang =>
    renderLangBlock(lang, moonFaqI18nNew[lang], '            ')
  ).join(',' + EOL);

  const replacement =
    '            ],' + EOL +
    newLangsSource + ',' + EOL +
    '        };' + EOL +
    '        // UAT-Moon-City-Hub-Polish';

  s = s.substring(0, j) + replacement + s.substring(j + endMarker.length);
  console.log(`OK MOON_FAQ_I18N: inserted 8 new lang arrays after en`);
}

// ────────────────────────────────────────────────────────────────────────
// 2) _MOON_HUB_FAQ — REPLACE the AR + EN const pair with single 10-lang object
// + change selector from `(seo.lang === 'ar') ? AR : EN` to `[seo.lang] || .en`.
// ────────────────────────────────────────────────────────────────────────

{
  const startMarker = '            const _MOON_HUB_FAQ_AR = [';
  const endMarker = "            moonFaqs = (seo.lang === 'ar') ? _MOON_HUB_FAQ_AR : _MOON_HUB_FAQ_EN;";

  const i = s.indexOf(startMarker);
  if (i < 0) throw new Error('_MOON_HUB_FAQ start marker not found');
  const j = s.indexOf(endMarker, i);
  if (j < 0) throw new Error('_MOON_HUB_FAQ end marker not found');

  // Extract the existing AR + EN content; we keep them as the ar/en entries
  // in the new object (no retranslation needed).
  // Find AR block:  from "= [" to "];" (first one).
  const arEndMarker = '            ];';
  const arStart = i + '            const _MOON_HUB_FAQ_AR = '.length;
  const arEndIdx = s.indexOf(arEndMarker, arStart);
  if (arEndIdx < 0 || arEndIdx >= j) throw new Error('AR block end not found');
  const arBlockSource = s.substring(arStart, arEndIdx + 1); // includes the closing ']'

  // Find EN block similarly: starts after `_MOON_HUB_FAQ_EN = `
  const enStartMarker = '            const _MOON_HUB_FAQ_EN = [';
  const enStartIdx = s.indexOf(enStartMarker, arEndIdx);
  if (enStartIdx < 0 || enStartIdx >= j) throw new Error('EN block start not found');
  const enContentStart = enStartIdx + '            const _MOON_HUB_FAQ_EN = '.length;
  const enEndIdx = s.indexOf(arEndMarker, enContentStart);
  if (enEndIdx < 0 || enEndIdx >= j) throw new Error('EN block end not found');
  const enBlockSource = s.substring(enContentStart, enEndIdx + 1);

  // Build new 10-lang object literal source.
  // Indentation: 12 spaces inside the new object (matches existing entries).
  // We render ar/en using the ORIGINAL content (which already has 12-space indent).
  const newLangs = ['fr','tr','ur','de','id','es','bn','ms'];
  const newLangsSrc = newLangs.map(lang =>
    renderLangBlock(lang, moonHubFaqNew[lang], '            ')
  ).join(',' + EOL);

  // Note: arBlockSource and enBlockSource start with `[` and end with `]`.
  // Their internal entries already have 16-space indent (from the original), but
  // since the value has 12-space hanging indent, we keep them as-is. To embed
  // them as `ar: [...]` we just prepend the key.
  const newObjectSrc =
    '            const _MOON_HUB_FAQ_BY_LANG = {' + EOL +
    '                ar: ' + arBlockSource.replace(/^\s*\[/, '[').replace(/\n            \]/g, EOL + '                ]') + ',' + EOL +
    '                en: ' + enBlockSource.replace(/^\s*\[/, '[').replace(/\n            \]/g, EOL + '                ]') + ',' + EOL +
    newLangsSrc.replace(/^            /gm, '                ') + ',' + EOL +
    '            };' + EOL +
    '            moonFaqs = _MOON_HUB_FAQ_BY_LANG[seo.lang] || _MOON_HUB_FAQ_BY_LANG.en;';

  s = s.substring(0, i) + newObjectSrc + s.substring(j + endMarker.length);
  console.log(`OK _MOON_HUB_FAQ: converted to 10-lang object + lookup`);
}

fs.writeFileSync(file, s, 'utf8');
console.log(`All Phase D3.1a edits applied. (EOL=${isCRLF ? 'CRLF' : 'LF'})`);
