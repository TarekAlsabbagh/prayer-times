// Phase D3.1b — translate Moon Month FAQ (8 Qs) and Moon Date FAQ (6 Qs)
// to 8 languages (FR, TR, UR, DE, ID, ES, BN, MS).
//
// Three transformations:
//   1) _mthNames{Ar,En} + selector → _MTH_NAMES_BY_LANG (10 langs) + lookup
//   2) _MOON_MONTH_FAQ_AR + _MOON_MONTH_FAQ_EN + selector → _MOON_MONTH_FAQ_BY_LANG (10 langs) + lookup
//   3) _MOON_DATE_FAQ_AR  + _MOON_DATE_FAQ_EN  + selector → _MOON_DATE_FAQ_BY_LANG  (10 langs) + lookup
//
// Strategy (safer than D3.1a): extract AR + EN array bodies dynamically from the source,
// then emit a new 10-lang object that wraps them verbatim. No manual substring math.
import fs from 'fs';

const file = 'server.js';
const src = fs.readFileSync(file, 'utf8');
const isCRLF = /\r\n/.test(src);
const EOL = isCRLF ? '\r\n' : '\n';
let s = src;

// ────────────────────────────────────────────────────────────────────────
// Extract a JS array body between known anchors.
// Returns the content BETWEEN `[` and `]` (exclusive of the brackets themselves).
//   startAnchor = literal text leading up to and INCLUDING the opening `[`
//   endAnchor   = literal text starting at the closing `]`
// ────────────────────────────────────────────────────────────────────────
function extractArrayBody(text, startAnchor, endAnchor) {
  const i = text.indexOf(startAnchor);
  if (i < 0) throw new Error(`startAnchor not found: ${startAnchor.slice(0,80)}…`);
  const bodyStart = i + startAnchor.length;
  const j = text.indexOf(endAnchor, bodyStart);
  if (j < 0) throw new Error(`endAnchor not found after start`);
  return text.substring(bodyStart, j);
}

// Render a Q/A array body for a new language.
// Each item is { q, a } where q,a are JS source fragments (template strings).
// Output uses 16-space indent for entries (matches existing AR/EN).
function renderItems(items) {
  return items.map(it =>
    `                { q: ${it.q},${EOL}                  a: ${it.a} }`
  ).join(',' + EOL);
}

// ════════════════════════════════════════════════════════════════════════
// MONTH FAQ — 8 Qs per new language
// Variables: ${_mthCity}, ${_mthName}, ${_mthY}
// ════════════════════════════════════════════════════════════════════════
const monthFaqNew = {
  fr: [
    { q: '`Quel est le calendrier lunaire à ${_mthCity} pour ${_mthName} ${_mthY} ?`',
      a: '`Ce calendrier affiche les phases lunaires quotidiennes à ${_mthCity} durant ${_mthName} ${_mthY} — croissant, gibbeuse, pleine et nouvelle lune — avec illumination et heures de lever/coucher pour chaque jour.`' },
    { q: '`Quelle est la phase de la Lune aujourd\'hui à ${_mthCity} ?`',
      a: '`Le site affiche la phase actuelle et l\'illumination en direct pour ${_mthCity}, dans le contexte de ce calendrier mensuel.`' },
    { q: '`Quand est la pleine lune à ${_mthCity} en ${_mthName} ${_mthY} ?`',
      a: '`La section "Prochaines phases lunaires" ci-dessus affiche la date précise de la pleine lune à ${_mthCity}. Pendant ${_mthName} ${_mthY}, la pleine lune atteint 100 % d\'illumination la nuit indiquée.`' },
    { q: '`Quand est la nouvelle lune à ${_mthCity} en ${_mthName} ${_mthY} ?`',
      a: '`La section "Prochaines phases lunaires" affiche la prochaine date de nouvelle lune — qui marque le début du nouveau mois hégirien. La nouvelle lune se produit lorsque la Lune est entre la Terre et le Soleil (0 % d\'illumination).`' },
    { q: '`Comment lire le calendrier mensuel des phases lunaires ?`',
      a: '`Chaque case représente un jour et affiche : la date, l\'emoji de phase lunaire, le nom de la phase (nouvelle, croissant, quartier, gibbeuse, pleine), et le décalage relatif par rapport à aujourd\'hui. Cliquez sur n\'importe quel jour pour ouvrir sa page de détails.`' },
    { q: '`Pourquoi les heures de lever et coucher de la Lune diffèrent-elles entre villes ?`',
      a: '`Le lever et le coucher de la Lune dépendent de la longitude, de la latitude et du fuseau horaire. La différence peut atteindre 12 heures entre l\'est et l\'ouest du globe. Les heures de cette page sont calculées pour le fuseau horaire local de ${_mthCity}.`' },
    { q: '`Ce calendrier est-il à l\'heure locale de ${_mthCity} ?`',
      a: '`Oui. Toutes les heures de lever/coucher de la Lune et de pleine/nouvelle lune sont calculées dans le fuseau horaire local de ${_mthCity}. Les coordonnées géographiques de la ville affectent également la direction et l\'altitude.`' },
    { q: '`Comment les phases lunaires sont-elles liées au calendrier hégirien ?`',
      a: '`Le calendrier hégirien est entièrement lunaire — chaque mois commence avec l\'observation du croissant après la nouvelle lune et dure 29 ou 30 jours. Les dates de pleine et nouvelle lune dans ce calendrier aident à anticiper le début du prochain mois hégirien.`' }
  ],
  tr: [
    { q: '`${_mthCity} için ${_mthName} ${_mthY} ay takvimi nedir?`',
      a: '`Bu takvim, ${_mthCity}\'de ${_mthName} ${_mthY} boyunca günlük ay evrelerini — hilal, gibbous, dolunay ve yeni ay — her gün için aydınlanma ve doğuş/batış saatleriyle gösterir.`' },
    { q: '`${_mthCity}\'de bugün ay evresi nedir?`',
      a: '`Site, bu aylık takvim bağlamında ${_mthCity} için güncel evreyi ve aydınlanmayı canlı olarak gösterir.`' },
    { q: '`${_mthName} ${_mthY} sırasında ${_mthCity}\'de dolunay ne zaman?`',
      a: '`Yukarıdaki "Yaklaşan ay evreleri" bölümü ${_mthCity}\'de tam dolunay tarihini gösterir. ${_mthName} ${_mthY} sırasında dolunay belirtilen gece %100 aydınlanmaya ulaşır.`' },
    { q: '`${_mthName} ${_mthY} sırasında ${_mthCity}\'de yeni ay ne zaman?`',
      a: '`"Yaklaşan ay evreleri" bölümü bir sonraki yeni ay tarihini gösterir — bu yeni hicri ayın başlangıcını işaret eder. Yeni ay, Ay\'ın Dünya ve Güneş arasında bulunduğu andır (%0 aydınlanma).`' },
    { q: '`Aylık ay evresi takvimini nasıl okurum?`',
      a: '`Her hücre bir günü temsil eder ve şunları gösterir: tarih, ay evresi emojisi, evre adı (yeni, hilal, dördün, gibbous, dolunay) ve bugüne göre göreceli fark. Herhangi bir güne tıklayarak ayrıntı sayfasını açabilirsiniz.`' },
    { q: '`Ay doğuşu ve batışı saatleri şehirler arasında neden farklı?`',
      a: '`Ay doğuşu ve batışı boylama, enleme ve saat dilimine bağlıdır. Fark, dünyanın doğusu ile batısı arasında 12 saate ulaşabilir. Bu sayfadaki saatler ${_mthCity}\'in yerel saat dilimi için hesaplanmıştır.`' },
    { q: '`Bu takvim ${_mthCity}\'in yerel saatinde mi?`',
      a: '`Evet. Tüm ay doğuşu/batışı ve dolunay/yeni ay saatleri ${_mthCity}\'in yerel saat diliminde hesaplanır. Şehrin coğrafi koordinatları da yön ve yüksekliği etkiler.`' },
    { q: '`Ay evreleri hicri takvim ile nasıl ilişkilidir?`',
      a: '`Hicri takvim tamamen kameridir — her ay yeni aydan sonra hilal görülmesiyle başlar ve 29 veya 30 gün sürer. Bu takvimdeki dolunay ve yeni ay tarihleri, bir sonraki hicri ayın başlangıcını öngörmeye yardımcı olur.`' }
  ],
  ur: [
    { q: '`${_mthCity} میں ${_mthName} ${_mthY} کے لیے چاند کا کیلنڈر کیا ہے؟`',
      a: '`یہ کیلنڈر ${_mthCity} میں ${_mthName} ${_mthY} کے دوران چاند کے روزانہ اطوار — ہلال، اَحدب، بدر اور نیا چاند — ہر دن کے لیے روشنی اور مطلع/مغیب کے اوقات کے ساتھ دکھاتا ہے۔`' },
    { q: '`${_mthCity} میں آج چاند کا طور کیا ہے؟`',
      a: '`یہ سائٹ اس ماہانہ کیلنڈر کے سیاق میں ${_mthCity} کے لیے موجودہ طور اور روشنی براہِ راست دکھاتی ہے۔`' },
    { q: '`${_mthName} ${_mthY} کے دوران ${_mthCity} میں بدر کب ہوگا؟`',
      a: '`اوپر "آنے والی چاند کی اطوار" سیکشن ${_mthCity} میں درست بدر کی تاریخ دکھاتا ہے۔ ${_mthName} ${_mthY} کے دوران بدر مقررہ رات کو 100% روشنی پر پہنچ جاتا ہے۔`' },
    { q: '`${_mthName} ${_mthY} کے دوران ${_mthCity} میں نیا چاند کب ہوگا؟`',
      a: '`"آنے والی چاند کی اطوار" سیکشن اگلی نئے چاند کی تاریخ دکھاتا ہے — جو نئے ہجری مہینے کا آغاز ہے۔ نیا چاند وہ لمحہ ہے جب چاند زمین اور سورج کے درمیان ہوتا ہے (0% روشنی)۔`' },
    { q: '`ماہانہ چاند کی اطوار کا کیلنڈر کیسے پڑھیں؟`',
      a: '`ہر خانہ ایک دن کی نمائندگی کرتا ہے اور دکھاتا ہے: تاریخ، چاند کی طور کا ایموجی، طور کا نام (نیا، ہلال، تربیع، اَحدب، بدر) اور آج سے نسبتی فرق۔ کسی بھی دن پر کلک کر کے اس کی تفصیلی صفحہ کھولیں۔`' },
    { q: '`چاند کی مطلع و مغیب کے اوقات شہروں کے درمیان کیوں مختلف ہیں؟`',
      a: '`چاند کی مطلع و مغیب خط طول، خط عرض اور ٹائم زون پر منحصر ہیں۔ زمین کے مشرق اور مغرب کے درمیان فرق 12 گھنٹے تک پہنچ سکتا ہے۔ اس صفحے کے اوقات ${_mthCity} کے مقامی ٹائم زون کے لیے شمار کیے گئے ہیں۔`' },
    { q: '`کیا یہ کیلنڈر ${_mthCity} کے مقامی وقت میں ہے؟`',
      a: '`جی ہاں۔ تمام مطلع/مغیبِ چاند اور بدر/نئے چاند کے اوقات ${_mthCity} کے مقامی ٹائم زون میں شمار کیے جاتے ہیں۔ شہر کی جغرافیائی محل وقوع بھی اتجاہ اور ارتفاع کو متاثر کرتی ہے۔`' },
    { q: '`چاند کی اطوار کا ہجری تقویم سے کیا تعلق ہے؟`',
      a: '`ہجری تقویم مکمل طور پر قمری ہے — ہر مہینہ نئے چاند کے بعد ہلال کی رؤیت سے شروع ہوتا ہے اور 29 یا 30 دن تک رہتا ہے۔ اس کیلنڈر میں بدر اور نئے چاند کی تاریخیں اگلے ہجری مہینے کے آغاز کا اندازہ لگانے میں مدد کرتی ہیں۔`' }
  ],
  de: [
    { q: '`Was ist der Mondkalender in ${_mthCity} für ${_mthName} ${_mthY}?`',
      a: '`Dieser Kalender zeigt die täglichen Mondphasen in ${_mthCity} während ${_mthName} ${_mthY} — Sichelmond, abnehmender/zunehmender Mond, Vollmond und Neumond — mit Beleuchtung und Auf-/Untergangszeiten für jeden Tag.`' },
    { q: '`Welche Mondphase ist heute in ${_mthCity}?`',
      a: '`Die Seite zeigt die aktuelle Phase und Beleuchtung live für ${_mthCity}, im Kontext dieses Monatskalenders.`' },
    { q: '`Wann ist der Vollmond in ${_mthCity} während ${_mthName} ${_mthY}?`',
      a: '`Der Abschnitt "Kommende Mondphasen" oben zeigt das genaue Vollmonddatum in ${_mthCity}. Während ${_mthName} ${_mthY} erreicht der Vollmond in der angegebenen Nacht 100 % Beleuchtung.`' },
    { q: '`Wann ist der Neumond in ${_mthCity} während ${_mthName} ${_mthY}?`',
      a: '`Der Abschnitt "Kommende Mondphasen" zeigt das nächste Neumonddatum — das den Beginn des neuen Hidschri-Monats markiert. Neumond ist, wenn der Mond zwischen Erde und Sonne liegt (0 % Beleuchtung).`' },
    { q: '`Wie lese ich den monatlichen Mondphasen-Kalender?`',
      a: '`Jede Zelle stellt einen Tag dar und zeigt: das Datum, das Mondphasen-Emoji, den Phasennamen (Neumond, Sichel, Viertel, Gibbös, Vollmond) und den relativen Versatz von heute. Klicken Sie auf einen beliebigen Tag, um seine Detailseite zu öffnen.`' },
    { q: '`Warum unterscheiden sich Mondaufgangs- und -untergangszeiten zwischen Städten?`',
      a: '`Mondaufgang und -untergang hängen von der geografischen Länge, Breite und Zeitzone ab. Der Unterschied kann zwischen Ost und West der Erde 12 Stunden erreichen. Die Zeiten auf dieser Seite werden für die lokale Zeitzone von ${_mthCity} berechnet.`' },
    { q: '`Ist dieser Kalender in der Ortszeit von ${_mthCity}?`',
      a: '`Ja. Alle Mondaufgangs-/-untergangszeiten und Vollmond-/Neumondzeiten werden in der lokalen Zeitzone von ${_mthCity} berechnet. Die geografischen Koordinaten der Stadt beeinflussen auch Richtung und Höhe.`' },
    { q: '`Wie hängen Mondphasen mit dem Hidschri-Kalender zusammen?`',
      a: '`Der Hidschri-Kalender ist vollständig mondbasiert — jeder Monat beginnt mit der Sichtung der Mondsichel nach dem Neumond und dauert 29 oder 30 Tage. Vollmond- und Neumonddaten in diesem Kalender helfen, den Beginn des nächsten Hidschri-Monats vorauszusehen.`' }
  ],
  id: [
    { q: '`Apa kalender bulan di ${_mthCity} untuk ${_mthName} ${_mthY}?`',
      a: '`Kalender ini menampilkan fase bulan harian di ${_mthCity} selama ${_mthName} ${_mthY} — hilal, gibbus, purnama dan bulan baru — dengan iluminasi dan waktu terbit/terbenam untuk setiap hari.`' },
    { q: '`Apa fase bulan hari ini di ${_mthCity}?`',
      a: '`Situs menampilkan fase saat ini dan iluminasi secara langsung untuk ${_mthCity}, dalam konteks kalender bulanan ini.`' },
    { q: '`Kapan bulan purnama di ${_mthCity} selama ${_mthName} ${_mthY}?`',
      a: '`Bagian "Fase bulan mendatang" di atas menampilkan tanggal purnama yang tepat di ${_mthCity}. Selama ${_mthName} ${_mthY}, bulan purnama mencapai iluminasi 100% pada malam yang ditentukan.`' },
    { q: '`Kapan bulan baru di ${_mthCity} selama ${_mthName} ${_mthY}?`',
      a: '`Bagian "Fase bulan mendatang" menampilkan tanggal bulan baru berikutnya — yang menandai awal bulan Hijriah baru. Bulan baru adalah saat Bulan berada antara Bumi dan Matahari (iluminasi 0%).`' },
    { q: '`Bagaimana cara membaca kalender fase bulan bulanan?`',
      a: '`Setiap sel mewakili satu hari dan menampilkan: tanggal, emoji fase bulan, nama fase (baru, hilal, kuartal, gibbus, purnama), dan offset relatif dari hari ini. Klik hari mana pun untuk membuka halaman detailnya.`' },
    { q: '`Mengapa waktu terbit dan terbenam Bulan berbeda antar kota?`',
      a: '`Terbit dan terbenam Bulan tergantung pada bujur, lintang dan zona waktu. Perbedaannya dapat mencapai 12 jam antara timur dan barat dunia. Waktu di halaman ini dihitung untuk zona waktu lokal ${_mthCity}.`' },
    { q: '`Apakah kalender ini dalam waktu lokal ${_mthCity}?`',
      a: '`Ya. Semua waktu terbit/terbenam Bulan dan purnama/bulan baru dihitung dalam zona waktu lokal ${_mthCity}. Koordinat geografis kota juga memengaruhi arah dan ketinggian.`' },
    { q: '`Bagaimana fase bulan terkait dengan kalender Hijriah?`',
      a: '`Kalender Hijriah sepenuhnya berbasis bulan — setiap bulan dimulai dengan rukyat hilal setelah bulan baru dan berlangsung 29 atau 30 hari. Tanggal purnama dan bulan baru dalam kalender ini membantu mengantisipasi awal bulan Hijriah berikutnya.`' }
  ],
  es: [
    { q: '`¿Cuál es el calendario lunar en ${_mthCity} para ${_mthName} ${_mthY}?`',
      a: '`Este calendario muestra las fases lunares diarias en ${_mthCity} durante ${_mthName} ${_mthY} — creciente, gibosa, llena y nueva — con iluminación y horarios de salida/puesta para cada día.`' },
    { q: '`¿Cuál es la fase lunar hoy en ${_mthCity}?`',
      a: '`El sitio muestra la fase actual y la iluminación en vivo para ${_mthCity}, en el contexto de este calendario mensual.`' },
    { q: '`¿Cuándo es la luna llena en ${_mthCity} durante ${_mthName} ${_mthY}?`',
      a: '`La sección "Próximas fases lunares" arriba muestra la fecha precisa de luna llena en ${_mthCity}. Durante ${_mthName} ${_mthY}, la luna llena alcanza el 100 % de iluminación la noche especificada.`' },
    { q: '`¿Cuándo es la luna nueva en ${_mthCity} durante ${_mthName} ${_mthY}?`',
      a: '`La sección "Próximas fases lunares" muestra la próxima fecha de luna nueva — que marca el inicio del nuevo mes hijri. La luna nueva es cuando la Luna se sitúa entre la Tierra y el Sol (0 % de iluminación).`' },
    { q: '`¿Cómo leo el calendario mensual de fases lunares?`',
      a: '`Cada celda representa un día y muestra: la fecha, el emoji de fase lunar, el nombre de la fase (nueva, creciente, cuarto, gibosa, llena) y el desfase relativo desde hoy. Haga clic en cualquier día para abrir su página de detalles.`' },
    { q: '`¿Por qué los horarios de salida y puesta de la Luna difieren entre ciudades?`',
      a: '`La salida y puesta de la Luna dependen de la longitud, latitud y zona horaria. La diferencia puede alcanzar 12 horas entre el este y el oeste del globo. Los horarios de esta página se calculan para la zona horaria local de ${_mthCity}.`' },
    { q: '`¿Está este calendario en la hora local de ${_mthCity}?`',
      a: '`Sí. Todos los horarios de salida/puesta de la Luna y de luna llena/nueva se calculan en la zona horaria local de ${_mthCity}. Las coordenadas geográficas de la ciudad también afectan la dirección y la altitud.`' },
    { q: '`¿Cómo se relacionan las fases lunares con el calendario hijri?`',
      a: '`El calendario hijri es totalmente lunar — cada mes comienza con la observación del creciente tras la luna nueva y dura 29 o 30 días. Las fechas de luna llena y luna nueva en este calendario ayudan a anticipar el inicio del próximo mes hijri.`' }
  ],
  bn: [
    { q: '`${_mthCity}-এ ${_mthName} ${_mthY}-এর জন্য চাঁদের ক্যালেন্ডার কী?`',
      a: '`এই ক্যালেন্ডার ${_mthCity}-এ ${_mthName} ${_mthY}-এর সময় দৈনিক চাঁদের দশা — হিলাল, গিব্বাস, পূর্ণিমা ও অমাবস্যা — প্রতিদিনের জন্য আলোকন ও উদয়/অস্তের সময় সহ দেখায়।`' },
    { q: '`${_mthCity}-এ আজ চাঁদের দশা কী?`',
      a: '`এই সাইট এই মাসিক ক্যালেন্ডারের প্রসঙ্গে ${_mthCity}-এর জন্য বর্তমান দশা ও আলোকন সরাসরি দেখায়।`' },
    { q: '`${_mthName} ${_mthY}-এর সময় ${_mthCity}-এ পূর্ণিমা কখন?`',
      a: '`উপরের "আসন্ন চাঁদের দশা" বিভাগ ${_mthCity}-এ সঠিক পূর্ণিমার তারিখ দেখায়। ${_mthName} ${_mthY}-এর সময় পূর্ণিমা নির্দিষ্ট রাতে ১০০% আলোকনে পৌঁছায়।`' },
    { q: '`${_mthName} ${_mthY}-এর সময় ${_mthCity}-এ অমাবস্যা কখন?`',
      a: '`"আসন্ন চাঁদের দশা" বিভাগ পরবর্তী অমাবস্যার তারিখ দেখায় — যা নতুন হিজরি মাসের শুরু চিহ্নিত করে। অমাবস্যা হল যখন চাঁদ পৃথিবী ও সূর্যের মাঝে থাকে (০% আলোকন)।`' },
    { q: '`মাসিক চাঁদের দশার ক্যালেন্ডার কীভাবে পড়ব?`',
      a: '`প্রতিটি সেল একটি দিন প্রতিনিধিত্ব করে এবং দেখায়: তারিখ, চাঁদের দশার ইমোজি, দশার নাম (অমাবস্যা, হিলাল, কোয়ার্টার, গিব্বাস, পূর্ণিমা) এবং আজ থেকে আপেক্ষিক ব্যবধান। যেকোনো দিনে ক্লিক করে তার বিবরণ পৃষ্ঠা খুলুন।`' },
    { q: '`চাঁদের উদয় ও অস্তের সময় শহরভেদে কেন আলাদা?`',
      a: '`চাঁদের উদয় ও অস্ত দ্রাঘিমাংশ, অক্ষাংশ ও টাইমজোনের উপর নির্ভর করে। পার্থক্য বিশ্বের পূর্ব ও পশ্চিমের মধ্যে ১২ ঘণ্টা পর্যন্ত হতে পারে। এই পৃষ্ঠার সময়গুলি ${_mthCity}-এর স্থানীয় টাইমজোনের জন্য গণনা করা হয়।`' },
    { q: '`এই ক্যালেন্ডার কি ${_mthCity}-এর স্থানীয় সময়ে?`',
      a: '`হ্যাঁ। সমস্ত চাঁদের উদয়/অস্ত এবং পূর্ণিমা/অমাবস্যার সময় ${_mthCity}-এর স্থানীয় টাইমজোনে গণনা করা হয়। শহরের ভৌগোলিক স্থানাঙ্কও দিকনির্দেশ এবং উচ্চতাকে প্রভাবিত করে।`' },
    { q: '`চাঁদের দশা হিজরি ক্যালেন্ডারের সাথে কীভাবে সম্পর্কিত?`',
      a: '`হিজরি ক্যালেন্ডার সম্পূর্ণ চান্দ্র — প্রতিটি মাস অমাবস্যার পর হিলাল দেখার মাধ্যমে শুরু হয় এবং ২৯ বা ৩০ দিন স্থায়ী হয়। এই ক্যালেন্ডারে পূর্ণিমা ও অমাবস্যার তারিখগুলি পরবর্তী হিজরি মাসের শুরু অনুমান করতে সাহায্য করে।`' }
  ],
  ms: [
    { q: '`Apakah kalendar bulan di ${_mthCity} untuk ${_mthName} ${_mthY}?`',
      a: '`Kalendar ini memaparkan fasa bulan harian di ${_mthCity} sepanjang ${_mthName} ${_mthY} — hilal, gibus, bulan purnama dan anak bulan — dengan pencahayaan dan masa terbit/terbenam untuk setiap hari.`' },
    { q: '`Apakah fasa bulan hari ini di ${_mthCity}?`',
      a: '`Laman ini memaparkan fasa semasa dan pencahayaan secara langsung untuk ${_mthCity}, dalam konteks kalendar bulanan ini.`' },
    { q: '`Bilakah bulan purnama di ${_mthCity} sepanjang ${_mthName} ${_mthY}?`',
      a: '`Bahagian "Fasa bulan akan datang" di atas memaparkan tarikh tepat bulan purnama di ${_mthCity}. Sepanjang ${_mthName} ${_mthY}, bulan purnama mencapai pencahayaan 100% pada malam yang ditetapkan.`' },
    { q: '`Bilakah anak bulan di ${_mthCity} sepanjang ${_mthName} ${_mthY}?`',
      a: '`Bahagian "Fasa bulan akan datang" memaparkan tarikh anak bulan seterusnya — yang menandakan permulaan bulan Hijrah baharu. Anak bulan ialah saat Bulan berada antara Bumi dan Matahari (0% pencahayaan).`' },
    { q: '`Bagaimana saya membaca kalendar fasa bulan bulanan?`',
      a: '`Setiap sel mewakili satu hari dan memaparkan: tarikh, emoji fasa bulan, nama fasa (anak bulan, hilal, suku, gibus, purnama) dan jurang relatif dari hari ini. Klik mana-mana hari untuk membuka halaman butirannya.`' },
    { q: '`Mengapa waktu terbit dan terbenam Bulan berbeza antara bandar?`',
      a: '`Terbit dan terbenam Bulan bergantung pada bujur, lintang dan zon waktu. Perbezaannya boleh mencapai 12 jam antara timur dan barat dunia. Waktu pada halaman ini dikira untuk zon waktu tempatan ${_mthCity}.`' },
    { q: '`Adakah kalendar ini dalam waktu tempatan ${_mthCity}?`',
      a: '`Ya. Semua waktu terbit/terbenam Bulan dan bulan purnama/anak bulan dikira dalam zon waktu tempatan ${_mthCity}. Koordinat geografi bandar juga mempengaruhi arah dan ketinggian.`' },
    { q: '`Bagaimana fasa bulan berkaitan dengan kalendar Hijrah?`',
      a: '`Kalendar Hijrah adalah sepenuhnya berdasarkan bulan — setiap bulan bermula dengan rukyah hilal selepas anak bulan dan berlangsung 29 atau 30 hari. Tarikh bulan purnama dan anak bulan dalam kalendar ini membantu menjangka permulaan bulan Hijrah seterusnya.`' }
  ]
};

// ════════════════════════════════════════════════════════════════════════
// DATE FAQ — 6 Qs per new language
// Variables: ${_dCity}, ${_dLbl}
// ════════════════════════════════════════════════════════════════════════
const dateFaqNew = {
  fr: [
    { q: '`Quelle était la phase de la Lune à ${_dCity} le ${_dLbl} ?`',
      a: '`La phase de la Lune à ${_dCity} le ${_dLbl} est calculée astronomiquement avec une grande précision selon les méthodes de Jean Meeus, et affichée dans la carte principale de la page avec le pourcentage d\'illumination et l\'icône de phase.`' },
    { q: '`Quelle était l\'illumination de la Lune à ${_dCity} à cette date ?`',
      a: '`L\'illumination lunaire à ${_dCity} le ${_dLbl} est affichée dans la carte "Illumination" en haut de la page, calculée à partir de l\'angle entre le Soleil, la Lune et la Terre.`' },
    { q: '`Quel âge avait la Lune le ${_dLbl} ?`',
      a: '`L\'âge de la Lune est le nombre de jours depuis la dernière nouvelle lune dans un cycle lunaire d\'environ 29,5 jours. La valeur exacte pour ${_dLbl} est affichée dans la carte "Âge de la Lune" en haut de la page.`' },
    { q: '`À quelle heure la Lune s\'est-elle levée à ${_dCity} ce jour-là ?`',
      a: '`L\'heure de lever de la Lune à ${_dCity} le ${_dLbl} est affichée dans la carte "Lever de la Lune" en heure locale de la ville, calculée à partir de ses coordonnées géographiques.`' },
    { q: '`À quelle heure la Lune s\'est-elle couchée à ${_dCity} ce jour-là ?`',
      a: '`L\'heure de coucher de la Lune à ${_dCity} le ${_dLbl} est affichée dans la carte "Coucher de la Lune" en heure locale de la ville. L\'intervalle entre lever et coucher varie selon la phase.`' },
    { q: '`Quelle était la pleine lune ou nouvelle lune la plus proche du ${_dLbl} ?`',
      a: '`La pleine/nouvelle lune la plus proche du ${_dLbl} est affichée dans la section "Prochaines phases lunaires" ci-dessus, avec les dates grégorienne et hégirienne précises.`' }
  ],
  tr: [
    { q: '`${_dCity}\'de ${_dLbl} tarihindeki ay evresi neydi?`',
      a: '`${_dCity}\'de ${_dLbl} tarihindeki ay evresi, Jean Meeus yöntemleriyle yüksek hassasiyetle astronomik olarak hesaplanır ve sayfanın ana kartında aydınlanma yüzdesi ve evre simgesiyle birlikte gösterilir.`' },
    { q: '`${_dCity}\'de bu tarihte ay aydınlanması neydi?`',
      a: '`${_dCity}\'de ${_dLbl} tarihindeki ay aydınlanması, sayfanın üst kısmındaki "Aydınlanma" kartında gösterilir ve Güneş-Ay-Dünya açısından hesaplanır.`' },
    { q: '`${_dLbl} tarihinde ay kaç günlüktü?`',
      a: '`Ay yaşı, ~29,5 günlük bir kameri ay döngüsünde son yeni aydan bu yana geçen gün sayısıdır. ${_dLbl} için tam değer sayfanın üst kısmındaki "Ay yaşı" kartında gösterilir.`' },
    { q: '`${_dCity}\'de o gün Ay ne zaman doğdu?`',
      a: '`${_dCity}\'de ${_dLbl} tarihindeki ay doğuş saati, şehrin yerel saatine göre "Ay doğuşu" kartında gösterilir, coğrafi koordinatlarından hesaplanır.`' },
    { q: '`${_dCity}\'de o gün Ay ne zaman battı?`',
      a: '`${_dCity}\'de ${_dLbl} tarihindeki ay batış saati, şehrin yerel saatine göre "Ay batışı" kartında gösterilir. Doğuş ile batış arasındaki aralık evreye göre değişir.`' },
    { q: '`${_dLbl} tarihine en yakın dolunay veya yeni ay ne zamandı?`',
      a: '`${_dLbl}\'e en yakın dolunay/yeni ay yukarıdaki "Yaklaşan ay evreleri" bölümünde, hassas miladi ve hicri tarihlerle gösterilir.`' }
  ],
  ur: [
    { q: '`${_dCity} میں ${_dLbl} کو چاند کا طور کیا تھا؟`',
      a: '`${_dCity} میں ${_dLbl} کو چاند کا طور Jean Meeus کے طریقوں کے مطابق اعلیٰ درستگی کے ساتھ فلکیاتی طور پر شمار کیا جاتا ہے، اور صفحے کے مرکزی کارڈ میں روشنی کے فیصد اور طور کے آئیکن کے ساتھ دکھایا جاتا ہے۔`' },
    { q: '`${_dCity} میں اس تاریخ کو چاند کی روشنی کتنی تھی؟`',
      a: '`${_dCity} میں ${_dLbl} کو چاند کی روشنی صفحے کے اوپر "روشنی" کارڈ میں دکھائی جاتی ہے، جو سورج-چاند-زمین کے زاویے سے شمار کی جاتی ہے۔`' },
    { q: '`${_dLbl} کو چاند کتنا پرانا تھا؟`',
      a: '`چاند کی عمر تقریباً 29.5 دن کے قمری دور میں آخری نئے چاند سے گزرے دنوں کی تعداد ہے۔ ${_dLbl} کے لیے درست قدر صفحے کے اوپر "چاند کی عمر" کارڈ میں دکھائی جاتی ہے۔`' },
    { q: '`${_dCity} میں اس دن چاند کب طلوع ہوا؟`',
      a: '`${_dCity} میں ${_dLbl} کا مطلعِ چاند شہر کے مقامی وقت میں "مطلعِ چاند" کارڈ میں دکھایا جاتا ہے، جو اس کے جغرافیائی کوآرڈینیٹس سے شمار کیا جاتا ہے۔`' },
    { q: '`${_dCity} میں اس دن چاند کب غروب ہوا؟`',
      a: '`${_dCity} میں ${_dLbl} کا مغیبِ چاند شہر کے مقامی وقت میں "مغیبِ چاند" کارڈ میں دکھایا جاتا ہے۔ مطلع اور مغیب کے درمیان وقفہ طور کے مطابق مختلف ہوتا ہے۔`' },
    { q: '`${_dLbl} کے قریب ترین بدر یا نیا چاند کب تھا؟`',
      a: '`${_dLbl} کے قریب ترین بدر/نیا چاند اوپر "آنے والی چاند کی اطوار" سیکشن میں درست عیسوی اور ہجری تاریخوں کے ساتھ دکھایا گیا ہے۔`' }
  ],
  de: [
    { q: '`Welche Mondphase hatte ${_dCity} am ${_dLbl}?`',
      a: '`Die Mondphase in ${_dCity} am ${_dLbl} wird astronomisch mit hoher Präzision nach den Methoden von Jean Meeus berechnet und in der Hauptkarte der Seite mit Beleuchtungsprozent und Phasensymbol angezeigt.`' },
    { q: '`Wie hoch war die Mondbeleuchtung in ${_dCity} an diesem Datum?`',
      a: '`Die Mondbeleuchtung in ${_dCity} am ${_dLbl} wird in der Karte "Beleuchtung" oben auf der Seite angezeigt, berechnet aus dem Winkel zwischen Sonne, Mond und Erde.`' },
    { q: '`Wie alt war der Mond am ${_dLbl}?`',
      a: '`Das Mondalter ist die Anzahl der Tage seit dem letzten Neumond innerhalb eines ~29,5-tägigen Mondzyklus. Der genaue Wert für ${_dLbl} wird in der Karte "Mondalter" oben auf der Seite angezeigt.`' },
    { q: '`Wann ging der Mond in ${_dCity} an diesem Tag auf?`',
      a: '`Der Mondaufgang in ${_dCity} am ${_dLbl} wird in der Karte "Mondaufgang" in der Ortszeit der Stadt angezeigt, berechnet aus ihren geografischen Koordinaten.`' },
    { q: '`Wann ging der Mond in ${_dCity} an diesem Tag unter?`',
      a: '`Der Monduntergang in ${_dCity} am ${_dLbl} wird in der Karte "Monduntergang" in der Ortszeit der Stadt angezeigt. Das Intervall zwischen Auf- und Untergang variiert je nach Phase.`' },
    { q: '`Wann war der nächstgelegene Vollmond oder Neumond zum ${_dLbl}?`',
      a: '`Der nächstgelegene Voll-/Neumond zum ${_dLbl} wird im obigen Abschnitt "Kommende Mondphasen" mit präzisen gregorianischen und Hidschri-Daten angezeigt.`' }
  ],
  id: [
    { q: '`Apa fase bulan di ${_dCity} pada ${_dLbl}?`',
      a: '`Fase bulan di ${_dCity} pada ${_dLbl} dihitung secara astronomis dengan presisi tinggi menggunakan metode Jean Meeus, dan ditampilkan di kartu detail utama dengan persentase iluminasi dan ikon fase.`' },
    { q: '`Berapa iluminasi bulan di ${_dCity} pada tanggal ini?`',
      a: '`Iluminasi bulan di ${_dCity} pada ${_dLbl} ditampilkan di kartu "Iluminasi" di bagian atas halaman, dihitung dari sudut antara Matahari, Bulan dan Bumi.`' },
    { q: '`Berapa umur bulan pada ${_dLbl}?`',
      a: '`Umur bulan adalah jumlah hari sejak bulan baru terakhir dalam siklus bulan ~29,5 hari. Nilai yang tepat untuk ${_dLbl} ditampilkan di kartu "Umur bulan" di bagian atas halaman.`' },
    { q: '`Pukul berapa Bulan terbit di ${_dCity} pada hari itu?`',
      a: '`Waktu terbit Bulan di ${_dCity} pada ${_dLbl} ditampilkan di kartu "Terbit Bulan" dalam waktu lokal kota, dihitung dari koordinat geografisnya.`' },
    { q: '`Pukul berapa Bulan terbenam di ${_dCity} pada hari itu?`',
      a: '`Waktu terbenam Bulan di ${_dCity} pada ${_dLbl} ditampilkan di kartu "Terbenam Bulan" dalam waktu lokal kota. Interval antara terbit dan terbenam bervariasi berdasarkan fase.`' },
    { q: '`Kapan purnama atau bulan baru terdekat dengan ${_dLbl}?`',
      a: '`Purnama/bulan baru terdekat dengan ${_dLbl} ditampilkan di bagian "Fase bulan mendatang" di atas, dengan tanggal Masehi dan Hijriah yang tepat.`' }
  ],
  es: [
    { q: '`¿Cuál fue la fase de la Luna en ${_dCity} el ${_dLbl}?`',
      a: '`La fase de la Luna en ${_dCity} el ${_dLbl} se calcula astronómicamente con alta precisión utilizando los métodos de Jean Meeus y se muestra en la tarjeta de detalles principal con el porcentaje de iluminación y el icono de fase.`' },
    { q: '`¿Cuál fue la iluminación lunar en ${_dCity} en esa fecha?`',
      a: '`La iluminación lunar en ${_dCity} el ${_dLbl} se muestra en la tarjeta "Iluminación" en la parte superior de la página, calculada a partir del ángulo entre el Sol, la Luna y la Tierra.`' },
    { q: '`¿Qué edad tenía la Luna el ${_dLbl}?`',
      a: '`La edad de la Luna es el número de días desde la última luna nueva dentro de un ciclo lunar de ~29,5 días. El valor exacto para ${_dLbl} se muestra en la tarjeta "Edad de la Luna" en la parte superior de la página.`' },
    { q: '`¿A qué hora salió la Luna en ${_dCity} ese día?`',
      a: '`La hora de salida de la Luna en ${_dCity} el ${_dLbl} se muestra en la tarjeta "Salida de la Luna" en la hora local de la ciudad, calculada a partir de sus coordenadas geográficas.`' },
    { q: '`¿A qué hora se puso la Luna en ${_dCity} ese día?`',
      a: '`La hora de puesta de la Luna en ${_dCity} el ${_dLbl} se muestra en la tarjeta "Puesta de la Luna" en la hora local de la ciudad. El intervalo entre salida y puesta varía según la fase.`' },
    { q: '`¿Cuándo fue la luna llena o nueva más cercana al ${_dLbl}?`',
      a: '`La luna llena/nueva más cercana al ${_dLbl} se muestra en la sección "Próximas fases lunares" arriba, con fechas gregoriana e hijri precisas.`' }
  ],
  bn: [
    { q: '`${_dCity}-এ ${_dLbl} তারিখে চাঁদের দশা কী ছিল?`',
      a: '`${_dCity}-এ ${_dLbl} তারিখে চাঁদের দশা Jean Meeus-এর পদ্ধতি ব্যবহার করে উচ্চ নির্ভুলতার সাথে জ্যোতির্বিজ্ঞানগতভাবে গণনা করা হয় এবং পৃষ্ঠার প্রধান বিবরণ কার্ডে আলোকন শতাংশ ও দশার আইকন সহ দেখানো হয়।`' },
    { q: '`${_dCity}-এ এই তারিখে চাঁদের আলোকন কত ছিল?`',
      a: '`${_dCity}-এ ${_dLbl} তারিখে চাঁদের আলোকন পৃষ্ঠার শীর্ষে "আলোকন" কার্ডে দেখানো হয়, যা সূর্য-চাঁদ-পৃথিবীর কোণ থেকে গণনা করা হয়।`' },
    { q: '`${_dLbl} তারিখে চাঁদের বয়স কত ছিল?`',
      a: '`চাঁদের বয়স হল ~২৯.৫ দিনের চান্দ্র চক্রের মধ্যে শেষ অমাবস্যার পর থেকে দিনের সংখ্যা। ${_dLbl}-এর জন্য সঠিক মান পৃষ্ঠার শীর্ষে "চাঁদের বয়স" কার্ডে দেখানো হয়।`' },
    { q: '`${_dCity}-এ সেই দিন চাঁদ কখন উদয় হয়েছিল?`',
      a: '`${_dCity}-এ ${_dLbl}-এর চাঁদের উদয়ের সময় শহরের স্থানীয় সময়ে "চাঁদ উদয়" কার্ডে দেখানো হয়, যা তার ভৌগোলিক স্থানাঙ্ক থেকে গণনা করা হয়।`' },
    { q: '`${_dCity}-এ সেই দিন চাঁদ কখন অস্ত গিয়েছিল?`',
      a: '`${_dCity}-এ ${_dLbl}-এর চাঁদের অস্তের সময় শহরের স্থানীয় সময়ে "চাঁদ অস্ত" কার্ডে দেখানো হয়। উদয় ও অস্তের মধ্যবর্তী ব্যবধান দশা অনুসারে পরিবর্তিত হয়।`' },
    { q: '`${_dLbl}-এর সবচেয়ে কাছাকাছি পূর্ণিমা বা অমাবস্যা কখন ছিল?`',
      a: '`${_dLbl}-এর সবচেয়ে কাছাকাছি পূর্ণিমা/অমাবস্যা উপরের "আসন্ন চাঁদের দশা" বিভাগে সঠিক খ্রিস্টীয় ও হিজরি তারিখ সহ দেখানো হয়েছে।`' }
  ],
  ms: [
    { q: '`Apakah fasa bulan di ${_dCity} pada ${_dLbl}?`',
      a: '`Fasa bulan di ${_dCity} pada ${_dLbl} dikira secara astronomi dengan ketepatan tinggi menggunakan kaedah Jean Meeus, dan dipaparkan dalam kad butiran utama dengan peratus pencahayaan dan ikon fasa.`' },
    { q: '`Berapakah pencahayaan bulan di ${_dCity} pada tarikh ini?`',
      a: '`Pencahayaan bulan di ${_dCity} pada ${_dLbl} dipaparkan dalam kad "Pencahayaan" di bahagian atas halaman, dikira daripada sudut antara Matahari, Bulan dan Bumi.`' },
    { q: '`Berapa umur bulan pada ${_dLbl}?`',
      a: '`Umur bulan ialah bilangan hari sejak anak bulan terakhir dalam kitaran bulan ~29.5 hari. Nilai tepat untuk ${_dLbl} dipaparkan dalam kad "Umur bulan" di bahagian atas halaman.`' },
    { q: '`Pukul berapa Bulan terbit di ${_dCity} pada hari itu?`',
      a: '`Waktu terbit Bulan di ${_dCity} pada ${_dLbl} dipaparkan dalam kad "Terbit Bulan" dalam waktu tempatan bandar, dikira daripada koordinat geografinya.`' },
    { q: '`Pukul berapa Bulan terbenam di ${_dCity} pada hari itu?`',
      a: '`Waktu terbenam Bulan di ${_dCity} pada ${_dLbl} dipaparkan dalam kad "Terbenam Bulan" dalam waktu tempatan bandar. Selang antara terbit dan terbenam berbeza mengikut fasa.`' },
    { q: '`Bilakah bulan purnama atau anak bulan paling hampir dengan ${_dLbl}?`',
      a: '`Bulan purnama/anak bulan paling hampir dengan ${_dLbl} dipaparkan dalam bahagian "Fasa bulan akan datang" di atas, dengan tarikh Masihi dan Hijrah yang tepat.`' }
  ]
};

// ════════════════════════════════════════════════════════════════════════
// 1) MONTH FAQ block — replace from `_mthNamesAr = [` through the moonFaqs selector line.
// ════════════════════════════════════════════════════════════════════════
{
  // Extract existing AR + EN array bodies (between `[` and `]`)
  const arBody = extractArrayBody(s,
    '            const _MOON_MONTH_FAQ_AR = [',
    EOL + '            ];');
  const enBody = extractArrayBody(s,
    '            const _MOON_MONTH_FAQ_EN = [',
    EOL + '            ];');

  // Build new block content (keeps AR + EN verbatim, adds 8 new langs).
  const langOrder = ['fr','tr','ur','de','id','es','bn','ms'];
  const newLangsSrc = langOrder.map(lang =>
    `            ${lang}: [${EOL}${renderItems(monthFaqNew[lang])}${EOL}            ]`
  ).join(',' + EOL);

  const newBlock =
    `            // Phase D3.1b: 10-lang month-name table (was: AR+EN only)` + EOL +
    `            const _MTH_NAMES_BY_LANG = {` + EOL +
    `                ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],` + EOL +
    `                en: ['January','February','March','April','May','June','July','August','September','October','November','December'],` + EOL +
    `                fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],` + EOL +
    `                tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],` + EOL +
    `                ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],` + EOL +
    `                de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],` + EOL +
    `                id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],` + EOL +
    `                es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],` + EOL +
    `                bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],` + EOL +
    `                ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']` + EOL +
    `            };` + EOL +
    `            const _mthName = (_MTH_NAMES_BY_LANG[seo.lang] || _MTH_NAMES_BY_LANG.en)[_mthMo - 1];` + EOL +
    `            // Phase D3.1b: 10-lang month FAQ (was: AR+EN only — 8 langs fell back to en)` + EOL +
    `            const _MOON_MONTH_FAQ_BY_LANG = {` + EOL +
    `                ar: [` + arBody + EOL + `                ],` + EOL +
    `                en: [` + enBody + EOL + `                ],` + EOL +
    newLangsSrc.replace(/^            /gm, '                ') + EOL +
    `            };` + EOL +
    `            moonFaqs = _MOON_MONTH_FAQ_BY_LANG[seo.lang] || _MOON_MONTH_FAQ_BY_LANG.en;`;

  // Find the entire region to replace: from start of `_mthNamesAr =` through
  // the moonFaqs selector line (inclusive).
  const regionStart = s.indexOf("            const _mthNamesAr = ['يناير'");
  if (regionStart < 0) throw new Error('month region start not found');
  const selectorLine = "            moonFaqs = (seo.lang === 'ar') ? _MOON_MONTH_FAQ_AR : _MOON_MONTH_FAQ_EN;";
  const selectorPos = s.indexOf(selectorLine, regionStart);
  if (selectorPos < 0) throw new Error('month selector not found');
  const regionEnd = selectorPos + selectorLine.length;

  s = s.substring(0, regionStart) + newBlock + s.substring(regionEnd);
  console.log('OK MONTH FAQ: replaced AR+EN+selector with 10-lang object');
}

// ════════════════════════════════════════════════════════════════════════
// 2) DATE FAQ block — replace from `_MOON_DATE_FAQ_AR = [` through the moonFaqs selector line.
// ════════════════════════════════════════════════════════════════════════
{
  const arBody = extractArrayBody(s,
    '            const _MOON_DATE_FAQ_AR = [',
    EOL + '            ];');
  const enBody = extractArrayBody(s,
    '            const _MOON_DATE_FAQ_EN = [',
    EOL + '            ];');

  const langOrder = ['fr','tr','ur','de','id','es','bn','ms'];
  const newLangsSrc = langOrder.map(lang =>
    `            ${lang}: [${EOL}${renderItems(dateFaqNew[lang])}${EOL}            ]`
  ).join(',' + EOL);

  const newBlock =
    `            // Phase D3.1b: 10-lang date FAQ (was: AR+EN only — 8 langs fell back to en)` + EOL +
    `            const _MOON_DATE_FAQ_BY_LANG = {` + EOL +
    `                ar: [` + arBody + EOL + `                ],` + EOL +
    `                en: [` + enBody + EOL + `                ],` + EOL +
    newLangsSrc.replace(/^            /gm, '                ') + EOL +
    `            };` + EOL +
    `            moonFaqs = _MOON_DATE_FAQ_BY_LANG[seo.lang] || _MOON_DATE_FAQ_BY_LANG.en;`;

  const regionStart = s.indexOf('            const _MOON_DATE_FAQ_AR = [');
  if (regionStart < 0) throw new Error('date region start not found');
  const selectorLine = "            moonFaqs = (seo.lang === 'ar') ? _MOON_DATE_FAQ_AR : _MOON_DATE_FAQ_EN;";
  const selectorPos = s.indexOf(selectorLine, regionStart);
  if (selectorPos < 0) throw new Error('date selector not found');
  const regionEnd = selectorPos + selectorLine.length;

  s = s.substring(0, regionStart) + newBlock + s.substring(regionEnd);
  console.log('OK DATE FAQ: replaced AR+EN+selector with 10-lang object');
}

fs.writeFileSync(file, s, 'utf8');
console.log(`All Phase D3.1b edits applied. (EOL=${isCRLF ? 'CRLF' : 'LF'})`);
