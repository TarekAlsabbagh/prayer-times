// Phase D3.1.3d — fix Hub FAQ visible DOM language mismatch.
//
// Background: D3.1a translated _MOON_HUB_FAQ_BY_LANG in server.js (10 langs)
// for FAQPage JSON-LD. But app.js _hubFaqByLang (which fills .moon-city-hub-faq-*
// in DOM on hub URLs) was still ar+en only → DOM-vs-JSON-LD mismatch on
// /xx/moon-in-{city} hub URLs in 8 languages.
//
// This script: extends _hubFaqByLang with 8 new langs that mirror the
// _MOON_HUB_FAQ_BY_LANG translations (variable substitution: _hubCity → _C).
// Plus translates the FAQ section title (1 string × 8 langs) and the 4 edu
// teaser strings (4 × 8 = 32 new strings).
//
// Total: 1 (FAQ title) + 16 (Q+A) + 4 (edu teasers) = 21 entries × 8 langs = 168.
// Of these, 16 Q+A are mirrored from server.js → no new translation work.
import fs from 'fs';

const file = 'js/app.js';
const src = fs.readFileSync(file, 'utf8');
const isCRLF = /\r\n/.test(src);
const EOL = isCRLF ? '\r\n' : '\n';

// ════════════════════════════════════════════════════════════════════════
// Per-lang data: faqTitle + 8 Q+A + 4 edu teasers
// ════════════════════════════════════════════════════════════════════════
// Q+A mirror the content of server.js _MOON_HUB_FAQ_BY_LANG[lang] (D3.1a),
// with `_hubCity` substituted to `_C` (which is set to _cityName in app.js).

const DATA = {
  fr: {
    title: '`FAQ sur la Lune à ${_C}`',
    faq: [
      ['`Quelle est la phase de la Lune aujourd\'hui à ${_C} ?`',
       "`La Lune passe par 8 phases au cours d'un cycle de 29,5 jours. Cette page affiche la phase actuelle et l'illumination en direct pour ${_C}, plus un calendrier mensuel complet des prochaines phases.`"],
      ['`Quand est la prochaine pleine lune à ${_C} ?`',
       "`Une pleine lune se produit tous les 29,5 jours. Cette page affiche la date grégorienne et hégirienne précise de la prochaine pleine lune à 100 % d'illumination.`"],
      ['`Quand est la prochaine nouvelle lune à ${_C} ?`',
       "`Une nouvelle lune est l'instant où la Lune se trouve entre la Terre et le Soleil (0 % d'illumination). Cette page indique quand a lieu la prochaine nouvelle lune — qui marque aussi le début du nouveau mois hégirien.`"],
      ['`Comment utiliser le calendrier lunaire à ${_C} ?`',
       "`Cliquez sur n'importe quel jour du calendrier pour ouvrir les détails de ce jour pour ${_C}. Utilisez les boutons mois précédent/suivant pour parcourir d'autres mois. Chaque mois a sa propre page à /moon-in-{city}/YYYY-MM.`"],
      ['`Pourquoi les heures de lever et coucher de la Lune à ${_C} diffèrent-elles d\'autres villes ?`',
       "`Le lever et le coucher de la Lune dépendent de la longitude, de la latitude et du fuseau horaire. La différence peut atteindre 12 heures entre l'est et l'ouest du globe. Les heures de cette page sont calculées pour le fuseau horaire local de ${_C}.`"],
      ["`Quel est le rapport entre la Lune et le calendrier hégirien ?`",
       "`Le calendrier hégirien est entièrement lunaire — chaque mois commence avec l'observation du croissant après la nouvelle lune et dure 29 ou 30 jours. L'année hégirienne compte 354–355 jours, soit ~11 jours de moins que l'année solaire.`"],
      ["`Quelle est la différence entre une constellation astronomique et un signe du zodiaque ?`",
       '`Une constellation astronomique est une région du ciel avec des limites officielles de l\'IAU (88 au total, 13 le long de l\'écliptique y compris Ophiuchus). Un signe du zodiaque est une division astrologique égale de 30° qui ne reflète PAS la position astronomique réelle. Nous utilisons les constellations IAU.`'],
      ["`Les données lunaires de cette page sont-elles à l'heure locale de ${_C} ?`",
       "`Oui. Toutes les heures de lever/coucher de la Lune et de pleine/nouvelle lune sont calculées dans le fuseau horaire local de ${_C}. Les coordonnées géographiques de la ville affectent également la direction et l'altitude.`"]
    ],
    edu: {
      title: '`Comprendre le calendrier lunaire à ${_C}`',
      p1: "`Le calendrier lunaire à ${_C} montre comment les phases lunaires changent au cours du mois — de la nouvelle lune au premier croissant, premier quartier, gibbeuse croissante, pleine lune, puis les phases décroissantes jusqu'au retour à la nouvelle lune.`",
      p2: "`Les heures de lever et coucher de la Lune diffèrent d'une ville à l'autre en raison de la longitude et du fuseau horaire. Les données de ${_C} sont affichées dans son propre fuseau horaire local.`",
      p3: "`La Lune est également liée au calendrier hégirien — les mois hégiriens commencent avec l'observation du croissant, et le début de chaque mois peut varier selon les pays en fonction de l'observation locale de la Lune.`"
    }
  },
  tr: {
    title: '`${_C}\'de Ay hakkında SSS`',
    faq: [
      ["`${_C} için bugün ay evresi nedir?`",
       "`Ay, 29,5 günlük bir döngüde 8 evreden geçer. Bu sayfa ${_C} için güncel evreyi ve aydınlanmayı canlı olarak gösterir, ayrıca yaklaşan evrelerin tam aylık takvimini sunar.`"],
      ["`${_C} için bir sonraki dolunay ne zaman?`",
       "`Dolunay her 29,5 günde bir gerçekleşir. Bu sayfa, %100 aydınlanmadaki bir sonraki dolunayın hassas miladi ve hicri tarihini gösterir.`"],
      ["`${_C} için bir sonraki yeni ay ne zaman?`",
       "`Yeni ay, Ay'ın Dünya ile Güneş arasında bulunduğu andır (%0 aydınlanma). Bu sayfa, yeni hicri ayın başlangıcı olan bir sonraki yeni ayın ne zaman olacağını gösterir.`"],
      ["`${_C} için ay takvimini nasıl kullanırım?`",
       "`Takvimdeki herhangi bir güne tıklayarak ${_C} için o günün ayrıntılarını açın. Diğer ayları gezmek için önceki/sonraki ay düğmelerini kullanın. Her ayın /moon-in-{city}/YYYY-MM adresinde kendi sayfası vardır.`"],
      ["`${_C} için ay doğuşu ve batışı saatleri neden diğer şehirlerden farklı?`",
       "`Ay doğuşu ve batışı boylama, enleme ve saat dilimine bağlıdır. Fark, dünyanın doğusu ile batısı arasında 12 saate ulaşabilir. Bu sayfanın saatleri ${_C}'in yerel saat dilimi için hesaplanmıştır.`"],
      ["`Ay'ın hicri takvim ile ilişkisi nedir?`",
       "`Hicri takvim tamamen kameridir — her ay yeni aydan sonra hilal görülmesiyle başlar ve 29 veya 30 gün sürer. Hicri yıl 354–355 gündür, güneş yılından ~11 gün daha kısadır.`"],
      ["`Astronomik takımyıldız ile burç arasındaki fark nedir?`",
       "`Astronomik takımyıldız, IAU'nun resmi sınırları olan bir gökyüzü bölgesidir (toplam 88, ekliptik boyunca Ophiuchus dahil 13). Burç, gerçek astronomik konumu YANSITMAYAN, 30°-eşit astrolojik bölünmedir. Biz IAU takımyıldızlarını kullanıyoruz.`"],
      ["`Bu sayfadaki ay verileri ${_C}'in yerel saatinde mi?`",
       "`Evet. Tüm ay doğuşu/batışı ve dolunay/yeni ay saatleri ${_C}'in yerel saat diliminde hesaplanır. Şehrin coğrafi koordinatları da yön ve yüksekliği etkiler.`"]
    ],
    edu: {
      title: "`${_C} ay takvimini anlama`",
      p1: "`${_C} ay takvimi, ay evrelerinin ay boyunca nasıl değiştiğini gösterir — yeni aydan büyüyen hilale, ilk dördüne, büyüyen gibbusa, dolunaya ve ardından küçülen evrelerle yeni aya geri döner.`",
      p2: "`Ay doğuş ve batış saatleri, boylama ve saat dilimine bağlı olarak şehirden şehre farklılık gösterir. ${_C} verileri kendi yerel saat diliminde gösterilir.`",
      p3: "`Ay ayrıca hicri takvime bağlıdır — hicri aylar hilalin görülmesiyle başlar ve her ayın başlangıcı yerel ay rüyetine bağlı olarak ülkelere göre değişebilir.`"
    }
  },
  ur: {
    title: "`${_C} میں چاند کے بارے میں اکثر پوچھے جانے والے سوالات`",
    faq: [
      ["`${_C} میں آج چاند کا طور کیا ہے؟`",
       "`چاند 29.5 دن کے دور میں 8 اطوار سے گزرتا ہے۔ یہ صفحہ ${_C} کے لیے موجودہ طور اور روشنی براہِ راست دکھاتا ہے، اور آنے والے اطوار کی مکمل ماہانہ تقویم بھی۔`"],
      ["`${_C} میں اگلا بدر کب ہوگا؟`",
       "`بدر ہر 29.5 دن میں ہوتا ہے۔ یہ صفحہ 100% روشنی پر اگلے بدر کی درست عیسوی اور ہجری تاریخ دکھاتا ہے۔`"],
      ["`${_C} میں اگلا نیا چاند کب ہوگا؟`",
       "`نیا چاند وہ لمحہ ہے جب چاند زمین اور سورج کے درمیان ہوتا ہے (0% روشنی)۔ یہ صفحہ اگلے نئے چاند کا وقت دکھاتا ہے — جو نئے ہجری مہینے کا آغاز بھی ہے۔`"],
      ["`${_C} میں چاند کی تقویم کیسے استعمال کریں؟`",
       "`تقویم میں کسی بھی دن پر کلک کریں تاکہ ${_C} کے لیے اس دن کی تفصیلات کھل جائیں۔ دوسرے مہینے دیکھنے کے لیے پچھلا/اگلا ماہ کے بٹن استعمال کریں۔ ہر مہینے کا اپنا صفحہ /moon-in-{city}/YYYY-MM پر ہے۔`"],
      ["`${_C} میں مطلع و مغیبِ چاند کے اوقات دوسرے شہروں سے کیوں مختلف ہیں؟`",
       "`مطلع و مغیبِ چاند خطِ طول، خطِ عرض اور ٹائم زون پر منحصر ہیں۔ زمین کے مشرق اور مغرب کے درمیان فرق 12 گھنٹے تک پہنچ سکتا ہے۔ اس صفحے کے اوقات ${_C} کے مقامی ٹائم زون کے لیے شمار کیے گئے ہیں۔`"],
      ["`چاند کا ہجری تقویم سے کیا تعلق ہے؟`",
       "`ہجری تقویم مکمل طور پر قمری ہے — ہر مہینہ نئے چاند کے بعد ہلال کی رؤیت سے شروع ہوتا ہے اور 29 یا 30 دن رہتا ہے۔ ہجری سال 354–355 دن کا ہے، شمسی سال سے تقریباً 11 دن کم۔`"],
      ["`فلکیاتی کوکبہ اور برج کے درمیان کیا فرق ہے؟`",
       "`فلکیاتی کوکبہ آسمان کا ایک علاقہ ہے جس کی IAU کی رسمی حدود ہیں (کل 88، دائرۃ البروج کے ساتھ Ophiuchus سمیت 13)۔ برج 30° مساوی نجومی تقسیم ہے جو حقیقی فلکیاتی پوزیشن کو ظاہر نہیں کرتا۔ ہم IAU کوکبات استعمال کرتے ہیں۔`"],
      ["`کیا اس صفحے کا چاند ڈیٹا ${_C} کے مقامی وقت میں ہے؟`",
       "`جی ہاں۔ تمام مطلع/مغیبِ چاند اور بدر/نئے چاند کے اوقات ${_C} کے مقامی ٹائم زون میں شمار کیے جاتے ہیں۔ شہر کی جغرافیائی محلِ وقوع بھی اتجاہ اور ارتفاع کو متاثر کرتی ہے۔`"]
    ],
    edu: {
      title: "`${_C} میں چاند کے کیلنڈر کو سمجھنا`",
      p1: "`${_C} میں چاند کا کیلنڈر دکھاتا ہے کہ چاند کی اطوار مہینے کے دوران کیسے بدلتی ہیں — نئے چاند سے بڑھتے ہلال، پہلی ربع، بڑھتے گدلے، بدر، پھر گھٹتی اطوار سے واپس نئے چاند تک۔`",
      p2: "`چاند کی مطلع و مغیب کے اوقات خط طول اور ٹائم زون کی وجہ سے شہر سے شہر مختلف ہوتے ہیں۔ ${_C} کا ڈیٹا اس کے اپنے مقامی ٹائم زون میں دکھایا جاتا ہے۔`",
      p3: "`چاند کا تعلق ہجری تقویم سے بھی ہے — ہجری مہینے ہلال کی رؤیت سے شروع ہوتے ہیں، اور ہر مہینے کا آغاز مقامی رؤیتِ ہلال کے مطابق ملک سے ملک مختلف ہو سکتا ہے۔`"
    }
  },
  de: {
    title: "`FAQ zum Mond in ${_C}`",
    faq: [
      ["`Welche Mondphase ist heute in ${_C}?`",
       "`Der Mond durchläuft 8 Phasen in einem 29,5-tägigen Zyklus. Diese Seite zeigt die aktuelle Phase und Beleuchtung live für ${_C}, plus einen vollständigen Monatskalender der kommenden Phasen.`"],
      ["`Wann ist der nächste Vollmond in ${_C}?`",
       "`Ein Vollmond tritt alle 29,5 Tage auf. Diese Seite zeigt das genaue gregorianische und Hidschri-Datum des nächsten Vollmonds bei 100 % Beleuchtung.`"],
      ["`Wann ist der nächste Neumond in ${_C}?`",
       "`Ein Neumond ist der Moment, in dem der Mond zwischen Erde und Sonne liegt (0 % Beleuchtung). Diese Seite zeigt, wann der nächste Neumond stattfindet — auch der Beginn des neuen Hidschri-Monats.`"],
      ["`Wie verwende ich den Mondkalender in ${_C}?`",
       '`Klicken Sie auf einen beliebigen Tag im Kalender, um die Details dieses Tages für ${_C} zu öffnen. Verwenden Sie die Schaltflächen "Vorheriger/Nächster Monat", um andere Monate zu durchsuchen. Jeder Monat hat seine eigene Seite unter /moon-in-{city}/YYYY-MM.`'],
      ["`Warum unterscheiden sich Mondaufgangs- und -untergangszeiten in ${_C} von anderen Städten?`",
       "`Mondaufgang und -untergang hängen von der geografischen Länge, Breite und Zeitzone ab. Der Unterschied kann zwischen Ost und West der Erde 12 Stunden erreichen. Die Zeiten dieser Seite werden für die lokale Zeitzone von ${_C} berechnet.`"],
      ["`Wie hängt der Mond mit dem Hidschri-Kalender zusammen?`",
       "`Der Hidschri-Kalender ist vollständig mondbasiert — jeder Monat beginnt mit der Sichtung der Mondsichel nach dem Neumond und dauert 29 oder 30 Tage. Das Hidschri-Jahr hat 354–355 Tage, ~11 Tage weniger als das Sonnenjahr.`"],
      ["`Was ist der Unterschied zwischen einer astronomischen Konstellation und einem Tierkreiszeichen?`",
       "`Eine astronomische Konstellation ist eine Himmelsregion mit offiziellen IAU-Grenzen (88 insgesamt, 13 entlang der Ekliptik einschließlich Ophiuchus). Ein Tierkreiszeichen ist eine astrologische 30°-gleiche Einteilung, die NICHT die tatsächliche astronomische Position widerspiegelt. Wir verwenden IAU-Konstellationen.`"],
      ["`Sind die Monddaten auf dieser Seite in der Ortszeit von ${_C}?`",
       "`Ja. Alle Mondaufgangs-/-untergangszeiten und Vollmond-/Neumondzeiten werden in der lokalen Zeitzone von ${_C} berechnet. Die geografischen Koordinaten der Stadt beeinflussen auch Richtung und Höhe.`"]
    ],
    edu: {
      title: "`Den Mondkalender in ${_C} verstehen`",
      p1: "`Der Mondkalender in ${_C} zeigt, wie sich die Mondphasen im Laufe des Monats ändern — vom Neumond zur zunehmenden Sichel, ersten Viertel, zunehmenden Halbmond, Vollmond und dann durch die abnehmenden Phasen zurück zum Neumond.`",
      p2: "`Mondaufgangs- und -untergangszeiten unterscheiden sich von Stadt zu Stadt aufgrund der geografischen Länge und Zeitzone. Die Daten von ${_C} werden in seiner eigenen lokalen Zeitzone angezeigt.`",
      p3: "`Der Mond ist auch mit dem Hidschri-Kalender verbunden — Hidschri-Monate beginnen mit der Sichtung der Mondsichel, und der Beginn jedes Monats kann je nach lokaler Mondsichtung pro Land variieren.`"
    }
  },
  id: {
    title: "`FAQ tentang Bulan di ${_C}`",
    faq: [
      ["`Apa fase bulan hari ini di ${_C}?`",
       "`Bulan melewati 8 fase dalam siklus 29,5 hari. Halaman ini menampilkan fase saat ini dan iluminasi secara langsung untuk ${_C}, plus kalender bulanan lengkap fase-fase mendatang.`"],
      ["`Kapan bulan purnama berikutnya di ${_C}?`",
       "`Bulan purnama terjadi setiap 29,5 hari. Halaman ini menampilkan tanggal Masehi dan Hijriah yang tepat untuk bulan purnama berikutnya pada iluminasi 100%.`"],
      ["`Kapan bulan baru berikutnya di ${_C}?`",
       "`Bulan baru adalah saat Bulan berada antara Bumi dan Matahari (iluminasi 0%). Halaman ini menampilkan kapan bulan baru berikutnya terjadi — juga awal bulan Hijriah baru.`"],
      ["`Bagaimana cara menggunakan kalender bulan di ${_C}?`",
       "`Klik hari mana pun di kalender untuk membuka detail hari itu untuk ${_C}. Gunakan tombol bulan sebelumnya/berikutnya untuk menjelajahi bulan lain. Setiap bulan memiliki halamannya sendiri di /moon-in-{city}/YYYY-MM.`"],
      ["`Mengapa waktu terbit dan terbenam Bulan di ${_C} berbeda dari kota lain?`",
       "`Terbit dan terbenam Bulan tergantung pada bujur, lintang, dan zona waktu. Perbedaannya dapat mencapai 12 jam antara timur dan barat dunia. Waktu di halaman ini dihitung untuk zona waktu lokal ${_C}.`"],
      ["`Bagaimana Bulan terkait dengan kalender Hijriah?`",
       "`Kalender Hijriah sepenuhnya berbasis bulan — setiap bulan dimulai dengan rukyat hilal setelah bulan baru dan berlangsung 29 atau 30 hari. Tahun Hijriah 354–355 hari, ~11 hari lebih pendek dari tahun matahari.`"],
      ["`Apa perbedaan antara konstelasi astronomi dan zodiak?`",
       "`Konstelasi astronomi adalah wilayah langit dengan batas resmi IAU (total 88, 13 di sepanjang ekliptika termasuk Ophiuchus). Zodiak adalah pembagian astrologi 30°-sama yang TIDAK mencerminkan posisi astronomi sebenarnya. Kami menggunakan konstelasi IAU.`"],
      ["`Apakah data bulan di halaman ini dalam waktu lokal ${_C}?`",
       "`Ya. Semua waktu terbit/terbenam Bulan dan purnama/bulan baru dihitung dalam zona waktu lokal ${_C}. Koordinat geografis kota juga memengaruhi arah dan ketinggian.`"]
    ],
    edu: {
      title: "`Memahami kalender bulan di ${_C}`",
      p1: "`Kalender bulan di ${_C} menunjukkan bagaimana fase bulan berubah selama sebulan — dari bulan baru ke hilal yang membesar, kuartal pertama, gibbus membesar, purnama, kemudian fase mengecil kembali ke bulan baru.`",
      p2: "`Waktu terbit dan terbenam Bulan berbeda dari kota ke kota karena bujur dan zona waktu. Data ${_C} ditampilkan dalam zona waktu lokalnya sendiri.`",
      p3: "`Bulan juga terkait dengan kalender Hijriah — bulan Hijriah dimulai dengan rukyat hilal, dan awal setiap bulan dapat bervariasi antar negara berdasarkan rukyat lokal.`"
    }
  },
  es: {
    title: "`Preguntas frecuentes sobre la Luna en ${_C}`",
    faq: [
      ["`¿Cuál es la fase lunar hoy en ${_C}?`",
       "`La Luna pasa por 8 fases en un ciclo de 29,5 días. Esta página muestra la fase actual y la iluminación en vivo para ${_C}, además de un calendario mensual completo de las próximas fases.`"],
      ["`¿Cuándo es la próxima luna llena en ${_C}?`",
       "`Una luna llena ocurre cada 29,5 días. Esta página muestra la fecha gregoriana e hijri precisa de la próxima luna llena al 100 % de iluminación.`"],
      ["`¿Cuándo es la próxima luna nueva en ${_C}?`",
       "`La luna nueva es el instante en que la Luna se sitúa entre la Tierra y el Sol (0 % de iluminación). Esta página muestra cuándo ocurre la próxima luna nueva — también el inicio del nuevo mes hijri.`"],
      ["`¿Cómo uso el calendario lunar en ${_C}?`",
       "`Haga clic en cualquier día del calendario para abrir los detalles de ese día para ${_C}. Use los botones de mes anterior/siguiente para explorar otros meses. Cada mes tiene su propia página en /moon-in-{city}/YYYY-MM.`"],
      ["`¿Por qué los horarios de salida y puesta de la Luna en ${_C} difieren de otras ciudades?`",
       "`La salida y puesta de la Luna dependen de la longitud, latitud y zona horaria. La diferencia puede alcanzar 12 horas entre el este y el oeste del globo. Los horarios de esta página se calculan para la zona horaria local de ${_C}.`"],
      ["`¿Cómo se relaciona la Luna con el calendario hijri?`",
       "`El calendario hijri es totalmente lunar — cada mes comienza con la observación del creciente tras la luna nueva y dura 29 o 30 días. El año hijri tiene 354–355 días, ~11 días más corto que el año solar.`"],
      ["`¿Cuál es la diferencia entre una constelación astronómica y un signo del zodíaco?`",
       "`Una constelación astronómica es una región del cielo con límites oficiales de la IAU (88 en total, 13 a lo largo de la eclíptica incluyendo Ofiuco). Un signo del zodíaco es una división astrológica de 30° iguales que NO refleja la posición astronómica real. Usamos constelaciones IAU.`"],
      ["`¿Los datos lunares de esta página están en hora local de ${_C}?`",
       "`Sí. Todos los horarios de salida/puesta de la Luna y de luna llena/nueva se calculan en la zona horaria local de ${_C}. Las coordenadas geográficas de la ciudad también afectan la dirección y la altitud.`"]
    ],
    edu: {
      title: "`Comprender el calendario lunar en ${_C}`",
      p1: "`El calendario lunar en ${_C} muestra cómo cambian las fases lunares durante el mes — de la luna nueva al creciente, cuarto creciente, gibosa creciente, luna llena, y luego las fases menguantes hasta volver a la luna nueva.`",
      p2: "`Los horarios de salida y puesta de la Luna difieren de ciudad en ciudad debido a la longitud y la zona horaria. Los datos de ${_C} se muestran en su propia zona horaria local.`",
      p3: "`La Luna también está vinculada al calendario hijri — los meses hijri comienzan con la observación del creciente, y el inicio de cada mes puede variar según los países según la observación local de la Luna.`"
    }
  },
  bn: {
    title: "`${_C}-এ চাঁদ সম্পর্কে প্রশ্নোত্তর`",
    faq: [
      ["`${_C}-এ আজ চাঁদের দশা কী?`",
       "`চাঁদ ২৯.৫ দিনের চক্রে ৮টি দশার মধ্য দিয়ে যায়। এই পৃষ্ঠা ${_C}-এর জন্য বর্তমান দশা ও আলোকন সরাসরি দেখায়, পাশাপাশি আসন্ন দশাগুলির পূর্ণ মাসিক ক্যালেন্ডার।`"],
      ["`${_C}-এ পরবর্তী পূর্ণিমা কখন?`",
       "`পূর্ণিমা প্রতি ২৯.৫ দিনে ঘটে। এই পৃষ্ঠা ১০০% আলোকনে পরবর্তী পূর্ণিমার সঠিক খ্রিস্টীয় ও হিজরি তারিখ দেখায়।`"],
      ["`${_C}-এ পরবর্তী অমাবস্যা কখন?`",
       "`অমাবস্যা হল সেই মুহূর্ত যখন চাঁদ পৃথিবী ও সূর্যের মাঝে থাকে (০% আলোকন)। এই পৃষ্ঠা পরবর্তী অমাবস্যা কখন ঘটবে তা দেখায় — যা নতুন হিজরি মাসের শুরুও।`"],
      ["`${_C}-এ চাঁদের ক্যালেন্ডার কীভাবে ব্যবহার করব?`",
       "`${_C}-এর জন্য সেই দিনের বিবরণ খুলতে ক্যালেন্ডারের যেকোনো দিনে ক্লিক করুন। অন্য মাস দেখার জন্য পূর্ববর্তী/পরবর্তী মাসের বোতাম ব্যবহার করুন। প্রতিটি মাসের নিজস্ব পৃষ্ঠা /moon-in-{city}/YYYY-MM-এ আছে।`"],
      ["`${_C}-এ চাঁদের উদয় ও অস্তের সময় অন্য শহর থেকে কেন আলাদা?`",
       "`চাঁদের উদয় ও অস্ত দ্রাঘিমাংশ, অক্ষাংশ ও টাইমজোনের উপর নির্ভর করে। পার্থক্য বিশ্বের পূর্ব ও পশ্চিমের মধ্যে ১২ ঘণ্টা পর্যন্ত হতে পারে। এই পৃষ্ঠার সময়গুলি ${_C}-এর স্থানীয় টাইমজোনের জন্য গণনা করা হয়।`"],
      ["`চাঁদ হিজরি ক্যালেন্ডারের সাথে কীভাবে সম্পর্কিত?`",
       "`হিজরি ক্যালেন্ডার সম্পূর্ণ চান্দ্র — প্রতিটি মাস অমাবস্যার পরে হিলাল দেখার মাধ্যমে শুরু হয় এবং ২৯ বা ৩০ দিন স্থায়ী হয়। হিজরি বছর ৩৫৪–৩৫৫ দিন, সৌর বছরের চেয়ে ~১১ দিন কম।`"],
      ["`জ্যোতির্বিজ্ঞানিক নক্ষত্রমণ্ডল ও রাশিচক্রের মধ্যে পার্থক্য কী?`",
       "`জ্যোতির্বিজ্ঞানিক নক্ষত্রমণ্ডল হল আকাশের একটি অঞ্চল যার অফিসিয়াল IAU সীমানা আছে (মোট ৮৮, ক্রান্তিবৃত্ত বরাবর Ophiuchus সহ ১৩টি)। রাশিচক্র হল একটি ৩০°-সমান জ্যোতিষ বিভাজন যা প্রকৃত জ্যোতির্বিজ্ঞানিক অবস্থান প্রতিফলিত করে না। আমরা IAU নক্ষত্রমণ্ডল ব্যবহার করি।`"],
      ["`এই পৃষ্ঠার চাঁদের ডেটা কি ${_C}-এর স্থানীয় সময়ে?`",
       "`হ্যাঁ। সমস্ত চাঁদের উদয়/অস্ত এবং পূর্ণিমা/অমাবস্যার সময় ${_C}-এর স্থানীয় টাইমজোনে গণনা করা হয়। শহরের ভৌগোলিক স্থানাঙ্কও দিকনির্দেশ এবং উচ্চতাকে প্রভাবিত করে।`"]
    ],
    edu: {
      title: "`${_C}-এ চাঁদের ক্যালেন্ডার বোঝা`",
      p1: "`${_C}-এ চাঁদের ক্যালেন্ডার দেখায় কীভাবে চাঁদের দশা মাসের সময় পরিবর্তিত হয় — অমাবস্যা থেকে বর্ধনশীল হিলাল, প্রথম পক্ষ, বর্ধনশীল গিব্বাস, পূর্ণিমা, তারপর ক্ষীয়মাণ দশাগুলির মাধ্যমে আবার অমাবস্যা পর্যন্ত।`",
      p2: "`চাঁদের উদয় ও অস্তের সময় দ্রাঘিমাংশ ও টাইমজোনের কারণে শহরভেদে আলাদা হয়। ${_C}-এর ডেটা তার নিজস্ব স্থানীয় টাইমজোনে দেখানো হয়।`",
      p3: "`চাঁদ হিজরি ক্যালেন্ডারের সাথেও যুক্ত — হিজরি মাসগুলি হিলাল দেখার মাধ্যমে শুরু হয়, এবং স্থানীয় চাঁদ দেখার ভিত্তিতে দেশভেদে প্রতিটি মাসের শুরু পরিবর্তিত হতে পারে।`"
    }
  },
  ms: {
    title: "`Soalan lazim tentang Bulan di ${_C}`",
    faq: [
      ["`Apakah fasa bulan hari ini di ${_C}?`",
       "`Bulan melalui 8 fasa dalam kitaran 29.5 hari. Halaman ini memaparkan fasa semasa dan pencahayaan secara langsung untuk ${_C}, serta kalendar bulanan lengkap fasa-fasa akan datang.`"],
      ["`Bilakah bulan purnama seterusnya di ${_C}?`",
       "`Bulan purnama berlaku setiap 29.5 hari. Halaman ini memaparkan tarikh Masihi dan Hijrah tepat bagi bulan purnama seterusnya pada pencahayaan 100%.`"],
      ["`Bilakah anak bulan seterusnya di ${_C}?`",
       "`Anak bulan ialah saat Bulan berada antara Bumi dan Matahari (0% pencahayaan). Halaman ini memaparkan bila anak bulan seterusnya berlaku — juga permulaan bulan Hijrah baharu.`"],
      ["`Bagaimana saya menggunakan kalendar bulan di ${_C}?`",
       "`Klik mana-mana hari dalam kalendar untuk membuka butiran hari itu untuk ${_C}. Gunakan butang bulan sebelum/selepas untuk melayari bulan-bulan lain. Setiap bulan mempunyai halaman tersendiri di /moon-in-{city}/YYYY-MM.`"],
      ["`Mengapa waktu terbit dan terbenam Bulan di ${_C} berbeza daripada bandar lain?`",
       "`Terbit dan terbenam Bulan bergantung pada bujur, lintang dan zon waktu. Perbezaannya boleh mencapai 12 jam antara timur dan barat dunia. Waktu pada halaman ini dikira untuk zon waktu tempatan ${_C}.`"],
      ["`Bagaimana Bulan berkaitan dengan kalendar Hijrah?`",
       "`Kalendar Hijrah adalah sepenuhnya berdasarkan bulan — setiap bulan bermula dengan rukyah hilal selepas anak bulan dan berlangsung 29 atau 30 hari. Tahun Hijrah ialah 354–355 hari, ~11 hari lebih pendek daripada tahun matahari.`"],
      ["`Apakah perbezaan antara buruj astronomi dan tanda zodiak?`",
       "`Buruj astronomi ialah kawasan langit dengan sempadan rasmi IAU (88 kesemuanya, 13 sepanjang ekliptik termasuk Ophiuchus). Tanda zodiak ialah pembahagian astrologi 30°-sama yang TIDAK mencerminkan kedudukan astronomi sebenar. Kami menggunakan buruj IAU.`"],
      ["`Adakah data bulan di halaman ini dalam waktu tempatan ${_C}?`",
       "`Ya. Semua waktu terbit/terbenam Bulan dan bulan purnama/anak bulan dikira dalam zon waktu tempatan ${_C}. Koordinat geografi bandar juga mempengaruhi arah dan ketinggian.`"]
    ],
    edu: {
      title: "`Memahami kalendar bulan di ${_C}`",
      p1: "`Kalendar bulan di ${_C} menunjukkan bagaimana fasa bulan berubah sepanjang bulan — dari anak bulan ke hilal membesar, suku pertama, gibus membesar, bulan purnama, kemudian fasa mengecil kembali ke anak bulan.`",
      p2: "`Waktu terbit dan terbenam Bulan berbeza dari bandar ke bandar disebabkan bujur dan zon waktu. Data ${_C} dipaparkan dalam zon waktu tempatannya sendiri.`",
      p3: "`Bulan juga berkait dengan kalendar Hijrah — bulan Hijrah bermula dengan rukyah hilal, dan permulaan setiap bulan boleh berbeza antara negara berdasarkan rukyah tempatan.`"
    }
  }
};

// Render lang block as JS array literal entries (matching existing ar/en structure).
// The existing ar/en use 20-space indent for `lang: [` and 24-space for entries
// inside the array. Match that.
const indent = '                    '; // 20 spaces — for `lang: [`
function renderLangBlock(lang, data) {
  const lines = [`${indent}${lang}: [`];
  lines.push(`${indent}    ['.moon-city-hub-faq-title-text', ${data.title}],`);
  for (let i = 0; i < 8; i++) {
    const [q, a] = data.faq[i];
    lines.push(`${indent}    ['.moon-city-hub-faq-q${i + 1}', ${q}],`);
    lines.push(`${indent}    ['.moon-city-hub-faq-a${i + 1}', ${a}],`);
  }
  lines.push(`${indent}    ['.moon-city-hub-edu-title', ${data.edu.title}],`);
  lines.push(`${indent}    ['.moon-city-hub-edu-p1', ${data.edu.p1}],`);
  lines.push(`${indent}    ['.moon-city-hub-edu-p2', ${data.edu.p2}],`);
  lines.push(`${indent}    ['.moon-city-hub-edu-p3', ${data.edu.p3}]`);
  lines.push(`${indent}]`);
  return lines.join(EOL);
}

// Find the existing _hubFaqByLang block — extract en's closing line, then
// inject 8 new lang blocks BEFORE the closing `};`.
const startMarker = '                const _hubFaqByLang = {';
const endMarker = '                };' + EOL + '                const _hubFaqMap = _hubFaqByLang[_lng_] || _hubFaqByLang.en;';

const i = src.indexOf(startMarker);
if (i < 0) throw new Error('startMarker not found');
const j = src.indexOf(endMarker, i);
if (j < 0) throw new Error('endMarker not found');

// The existing block is from i to j+1+1 (closing }; on its own line) — keep it
// intact; we splice 8 new langs INSIDE the object, after the existing en array.
// To do this, we find the closing of the en array (the line `]` followed by EOL
// + `                };`). Look for the LAST `]` before the `};`.
const insertPoint = src.lastIndexOf(EOL + '                ];', j);
if (insertPoint < 0) throw new Error('en-array closing not found before };');
// The `]` is at insertPoint + EOL.length. Convert to `],` and insert new langs.
const langOrder = ['fr','tr','ur','de','id','es','bn','ms'];
const newLangs = langOrder.map(L => renderLangBlock(L, DATA[L])).join(',' + EOL);

// Old: closing of EN array + closing of _hubFaqByLang + selector line.
// New: insert 8 new lang blocks before the closing `};`.
const oldFrag = EOL + '                    ]' + EOL + '                };' + EOL + '                const _hubFaqMap = _hubFaqByLang[_lng_] || _hubFaqByLang.en;';
const newFrag = EOL + '                    ],' + EOL + newLangs + EOL + '                };' + EOL + '                const _hubFaqMap = _hubFaqByLang[_lng_] || _hubFaqByLang.en;';

const cnt = src.split(oldFrag).length - 1;
if (cnt !== 1) throw new Error(`oldFrag matches expected 1, got ${cnt}`);

const out = src.replace(oldFrag, newFrag);
fs.writeFileSync(file, out, 'utf8');
console.log(`Phase D3.1.3d applied: 8 new langs added to _hubFaqByLang.`);
