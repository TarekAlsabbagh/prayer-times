/* MOON-CITY-EVERGREEN-FAQ-COPY-UI-POLISH-1 (2026-05-24)
 *
 * Rewrites the 8-question hub FAQ on /moon-in-{city} pages in TWO places:
 *   1. js/app.js _hubFaqByLang  (display layer, fills DOM via .textContent)
 *   2. server.js _MOON_HUB_FAQ_BY_LANG  (JSON-LD FAQPage schema)
 *
 * Both MUST stay in sync (Q + A strings byte-for-byte) so the JSON-LD
 * schema matches the visible HTML — required by Google's structured-data
 * guidelines AND by the user's spec ("إذا كانت FAQ JSON-LD تستخدم نفس
 * النصوص، يجب أن تطابق HTML").
 *
 * AR text is set verbatim from the user's spec. 9 other langs translated
 * to match the AR meaning with natural per-language phrasing.
 *
 * Idempotent — re-run prints OK_ALREADY for blocks already patched.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname || '.', '..');

// ── Per-lang Q/A texts. Single source of truth — used to generate
// both the app.js display block and the server.js JSON-LD block. ──
//
// Naming: `_C` is the placeholder for cityName in display (app.js),
// `_hubCity` is the placeholder in server.js. We emit the same pair
// of strings to each file, swapping only the variable name.

const FAQ_BY_LANG = {
  ar: [
    {
      q: c => `ما هو طور القمر في ${c}؟`,
      a: c => `تعرض هذه الصفحة الطور الحالي للقمر في ${c}، مع نسبة الإضاءة وعمر القمر وروابط للتقويم الشهري والأيام القريبة. يساعدك ذلك على قراءة حالة القمر ضمن سياق أطوار الشهر، بدل الاعتماد على اسم الطور فقط.`,
    },
    {
      q: c => `متى يكون البدر القادم في ${c}؟`,
      a: c => `تعرض الصفحة موعد البدر القادم في ${c} بالتاريخ الميلادي والهجري، مع وقت الحدث حسب التوقيت المحلي للمدينة. وقد تختلف مواعيد البدر والمحاق بين المدن بسبب اختلاف المنطقة الزمنية.`,
    },
    {
      q: c => `متى يكون المحاق القادم في ${c}؟`,
      a: c => `المحاق هو لحظة وقوع القمر بين الأرض والشمس، وتكون نسبة الإضاءة قريبة من 0%. تعرض هذه الصفحة موعد المحاق القادم في ${c}، وهو بداية دورة قمرية جديدة.`,
    },
    {
      q: c => `كيف أستخدم تقويم القمر في ${c}؟`,
      a: c => `استخدم روابط الأيام القريبة أو زر التقويم الشهري لمراجعة أطوار القمر خلال الشهر. يمكنك الانتقال إلى صفحة شهر كامل أو صفحة تاريخ محدد إذا أردت تفاصيل أدق عن يوم معين.`,
    },
    {
      q: c => `لماذا تختلف مواعيد شروق وغروب القمر بين المدن؟`,
      a: c => `تعتمد مواعيد شروق القمر وغروبه على إحداثيات المدينة والمنطقة الزمنية. لذلك قد تختلف أوقات الطلوع والغروب من مدينة إلى أخرى، وتُعرض هنا حسب توقيت ${c} المحلي.`,
    },
    {
      q: c => `ما علاقة القمر بالتقويم الهجري؟`,
      a: c => `يعتمد التقويم الهجري على دورة القمر؛ فكل شهر يبدأ برؤية الهلال ويستمر عادة 29 أو 30 يومًا. ولهذا تكون السنة الهجرية أقصر من السنة الشمسية بنحو 11 يومًا.`,
    },
    {
      q: c => `ما الفرق بين الكوكبة الفلكية والبرج؟`,
      a: c => `الكوكبة الفلكية هي منطقة معتمدة من السماء وفق حدود الاتحاد الفلكي الدولي (IAU)، أما البرج التنجيمي فهو تقسيم اصطلاحي لا يعبّر عن الموقع الفلكي الدقيق للقمر. يستخدم الموقع الكوكبات الفلكية، وليس الأبراج التنجيمية.`,
    },
    {
      q: c => `هل تعتمد بيانات القمر على توقيت ${c} المحلي؟`,
      a: c => `نعم، تُحسب مواعيد الطلوع والغروب والبدر والمحاق حسب التوقيت المحلي لـ ${c}. أما بعض القيم مثل الطور ونسبة الإضاءة فتُعرض ضمن سياق اليوم المحلي للمدينة لضمان اتساق البيانات داخل الصفحة.`,
    },
  ],
  en: [
    { q: c => `What is the current moon phase in ${c}?`,
      a: c => `This page shows the Moon's current phase in ${c}, along with the illumination percentage, Moon age, and links to the monthly calendar and nearby days. These help you read the Moon's state in the context of the month's phases, rather than relying on the phase name alone.` },
    { q: c => `When is the next full moon in ${c}?`,
      a: c => `The page shows the next full moon date in ${c} in both the Gregorian and Hijri calendars, with the event time in the city's local timezone. Full and new moon timings can differ between cities because of timezone offsets.` },
    { q: c => `When is the next new moon in ${c}?`,
      a: c => `A new moon is the instant the Moon lies between the Earth and the Sun, with illumination close to 0%. This page shows the next new moon date in ${c} — the start of a new lunar cycle.` },
    { q: c => `How do I use the moon calendar in ${c}?`,
      a: c => `Use the nearby-day links or the monthly calendar button to review the Moon's phases through the month. You can jump to a full month page or a specific date page for finer detail on a given day.` },
    { q: c => `Why do moonrise and moonset times differ between cities?`,
      a: c => `Moonrise and moonset times depend on a city's coordinates and timezone. Rise and set times therefore vary from one city to another — the values shown here are in ${c}'s local time.` },
    { q: c => `How is the Moon related to the Hijri calendar?`,
      a: c => `The Hijri calendar is built on the Moon's cycle. Each month begins with the crescent sighting and typically lasts 29 or 30 days, which makes the Hijri year about 11 days shorter than the solar year.` },
    { q: c => `What is the difference between an astronomical constellation and a zodiac sign?`,
      a: c => `An astronomical constellation is a sky region recognised by the International Astronomical Union (IAU), while a zodiac sign is a conventional astrological division that does not reflect the Moon's actual astronomical position. The site uses astronomical constellations, not astrological signs.` },
    { q: c => `Is the Moon data on this page in ${c}'s local time?`,
      a: c => `Yes — moonrise, moonset, full moon and new moon times are all computed in ${c}'s local timezone. Some values such as phase and illumination are shown in the context of the city's local day so the data stays internally consistent.` },
  ],
  fr: [
    { q: c => `Quelle est la phase actuelle de la Lune à ${c} ?`,
      a: c => `Cette page affiche la phase actuelle de la Lune à ${c}, avec le pourcentage d'illumination, l'âge de la Lune et des liens vers le calendrier mensuel et les jours proches. Cela aide à lire l'état de la Lune dans le contexte des phases du mois, plutôt que de se fier au seul nom de la phase.` },
    { q: c => `Quand est la prochaine pleine lune à ${c} ?`,
      a: c => `La page affiche la date de la prochaine pleine lune à ${c} en calendriers grégorien et hégirien, avec l'heure de l'événement dans le fuseau horaire local de la ville. Les horaires de pleine et nouvelle lune peuvent différer entre villes en raison des décalages horaires.` },
    { q: c => `Quand est la prochaine nouvelle lune à ${c} ?`,
      a: c => `Une nouvelle lune est l'instant où la Lune se trouve entre la Terre et le Soleil, avec une illumination proche de 0 %. Cette page indique la prochaine date de nouvelle lune à ${c} — le début d'un nouveau cycle lunaire.` },
    { q: c => `Comment utiliser le calendrier lunaire à ${c} ?`,
      a: c => `Utilisez les liens des jours proches ou le bouton du calendrier mensuel pour parcourir les phases lunaires du mois. Vous pouvez accéder à une page de mois complet ou à une page de date précise pour plus de détails sur un jour donné.` },
    { q: c => `Pourquoi les heures de lever et de coucher de la Lune diffèrent-elles entre les villes ?`,
      a: c => `Les heures de lever et de coucher de la Lune dépendent des coordonnées de la ville et de son fuseau horaire. Elles varient donc d'une ville à l'autre — les valeurs affichées ici sont à l'heure locale de ${c}.` },
    { q: c => `Quel est le rapport entre la Lune et le calendrier hégirien ?`,
      a: c => `Le calendrier hégirien est fondé sur le cycle lunaire. Chaque mois commence par l'observation du croissant et dure habituellement 29 ou 30 jours, ce qui rend l'année hégirienne environ 11 jours plus courte que l'année solaire.` },
    { q: c => `Quelle est la différence entre une constellation astronomique et un signe du zodiaque ?`,
      a: c => `Une constellation astronomique est une région du ciel reconnue par l'Union astronomique internationale (IAU), tandis qu'un signe du zodiaque est une division astrologique conventionnelle qui ne reflète pas la position astronomique réelle de la Lune. Le site utilise les constellations astronomiques, pas les signes astrologiques.` },
    { q: c => `Les données lunaires de cette page sont-elles à l'heure locale de ${c} ?`,
      a: c => `Oui — le lever, le coucher, la pleine lune et la nouvelle lune sont tous calculés dans le fuseau horaire local de ${c}. Certaines valeurs comme la phase et l'illumination sont présentées dans le contexte du jour local de la ville pour garantir la cohérence des données affichées.` },
  ],
  tr: [
    { q: c => `${c} için Ay'ın güncel evresi nedir?`,
      a: c => `Bu sayfa ${c} için Ay'ın güncel evresini gösterir; ayrıca aydınlanma yüzdesi, Ay yaşı ve aylık takvim ile yakın günlere bağlantılar sunar. Bu veriler Ay'ın durumunu yalnızca evre adına bakarak değil, ay boyunca evrelerin bağlamında okumanıza yardımcı olur.` },
    { q: c => `${c} için bir sonraki dolunay ne zaman?`,
      a: c => `Sayfa, ${c} için bir sonraki dolunay tarihini hem miladi hem de hicri takvimde, etkinliğin saati ile şehrin yerel saat diliminde gösterir. Dolunay ve yeni ay zamanlamaları, saat dilimi farkları nedeniyle şehirler arasında değişebilir.` },
    { q: c => `${c} için bir sonraki yeni ay ne zaman?`,
      a: c => `Yeni ay, Ay'ın Dünya ile Güneş arasında bulunduğu andır; aydınlanma 0%'a yakındır. Bu sayfa ${c} için bir sonraki yeni ay tarihini gösterir — yeni bir ay döngüsünün başlangıcı.` },
    { q: c => `${c} için ay takvimini nasıl kullanırım?`,
      a: c => `Ay boyunca evreleri incelemek için yakın gün bağlantılarını veya aylık takvim düğmesini kullanın. Belirli bir gün için daha ayrıntılı bilgi istiyorsanız tam ay sayfasına veya belirli bir tarih sayfasına geçebilirsiniz.` },
    { q: c => `Şehirler arasında ay doğuş ve batış saatleri neden farklıdır?`,
      a: c => `Ay doğuşu ve batışı saatleri şehrin koordinatlarına ve saat dilimine bağlıdır. Doğuş ve batış saatleri bu nedenle şehirden şehre değişir — burada gösterilen değerler ${c}'in yerel saatiyledir.` },
    { q: c => `Ay'ın hicri takvim ile ilişkisi nedir?`,
      a: c => `Hicri takvim, Ay'ın döngüsü üzerine kuruludur. Her ay hilalin görülmesiyle başlar ve genellikle 29 veya 30 gün sürer; bu da hicri yılı güneş yılından yaklaşık 11 gün daha kısa yapar.` },
    { q: c => `Astronomik takımyıldız ile zodyak burcu arasındaki fark nedir?`,
      a: c => `Astronomik takımyıldız, Uluslararası Astronomi Birliği (IAU) tarafından tanınan bir gökyüzü bölgesidir; zodyak burcu ise Ay'ın gerçek astronomik konumunu yansıtmayan geleneksel bir astrolojik bölünmedir. Site astrolojik burçları değil, astronomik takımyıldızları kullanır.` },
    { q: c => `Bu sayfadaki Ay verileri ${c}'in yerel saatinde mi?`,
      a: c => `Evet — Ay doğuşu, batışı, dolunay ve yeni ay saatleri hepsi ${c}'in yerel saat diliminde hesaplanır. Evre ve aydınlanma gibi bazı değerler, sayfa içindeki verilerin tutarlı kalması için şehrin yerel günü bağlamında gösterilir.` },
  ],
  ur: [
    { q: c => `${c} میں چاند کا موجودہ مرحلہ کیا ہے؟`,
      a: c => `یہ صفحہ ${c} میں چاند کا موجودہ مرحلہ دکھاتا ہے، ساتھ ہی روشنی کا فیصد، چاند کی عمر، اور ماہانہ تقویم اور قریبی دنوں کے روابط بھی۔ یہ آپ کو چاند کی حالت ماہ کے مراحل کے سیاق میں پڑھنے میں مدد دیتا ہے، صرف مرحلے کے نام پر بھروسہ کرنے کے بجائے۔` },
    { q: c => `${c} میں اگلا بدر کب ہوگا؟`,
      a: c => `صفحہ ${c} میں اگلے بدر کی تاریخ عیسوی اور ہجری دونوں تقویموں میں دکھاتا ہے، اور واقعے کا وقت شہر کے مقامی ٹائم زون میں۔ بدر اور نئے چاند کے اوقات ٹائم زون کے فرق کی وجہ سے شہروں کے درمیان مختلف ہو سکتے ہیں۔` },
    { q: c => `${c} میں اگلا نیا چاند کب ہوگا؟`,
      a: c => `نیا چاند وہ لمحہ ہے جب چاند زمین اور سورج کے درمیان ہوتا ہے، اور روشنی 0% کے قریب ہوتی ہے۔ یہ صفحہ ${c} میں اگلے نئے چاند کی تاریخ دکھاتا ہے — ایک نئے قمری چکر کا آغاز۔` },
    { q: c => `${c} میں چاند کی تقویم کیسے استعمال کریں؟`,
      a: c => `ماہ بھر کے چاند کے مراحل دیکھنے کے لیے قریبی دنوں کے روابط یا ماہانہ تقویم کا بٹن استعمال کریں۔ کسی مخصوص دن کی زیادہ تفصیل کے لیے آپ پورے ماہ کے صفحے یا کسی مخصوص تاریخ کے صفحے پر جا سکتے ہیں۔` },
    { q: c => `چاند کے طلوع و غروب کے اوقات شہروں کے درمیان کیوں مختلف ہیں؟`,
      a: c => `چاند کے طلوع و غروب کے اوقات شہر کے نقاط اور ٹائم زون پر منحصر ہیں۔ اس لیے طلوع و غروب کے اوقات ایک شہر سے دوسرے میں مختلف ہوتے ہیں — یہاں دکھائی گئی قیمتیں ${c} کے مقامی وقت میں ہیں۔` },
    { q: c => `چاند کا ہجری تقویم سے کیا تعلق ہے؟`,
      a: c => `ہجری تقویم چاند کے چکر پر مبنی ہے۔ ہر مہینہ ہلال کے دیکھے جانے سے شروع ہوتا ہے اور عام طور پر 29 یا 30 دن چلتا ہے، جو ہجری سال کو شمسی سال سے تقریباً 11 دن کم بناتا ہے۔` },
    { q: c => `فلکیاتی کوکبہ اور برج کے درمیان کیا فرق ہے؟`,
      a: c => `فلکیاتی کوکبہ بین الاقوامی فلکیاتی یونین (IAU) کی طرف سے تسلیم شدہ آسمان کا ایک علاقہ ہے، جبکہ برج چاند کی حقیقی فلکیاتی پوزیشن کو ظاہر نہ کرنے والی روایتی نجومی تقسیم ہے۔ سائٹ نجومی برج نہیں بلکہ فلکیاتی کوکبات استعمال کرتی ہے۔` },
    { q: c => `کیا اس صفحے کا چاند ڈیٹا ${c} کے مقامی وقت میں ہے؟`,
      a: c => `جی ہاں — چاند کا طلوع، غروب، بدر اور نیا چاند سب ${c} کے مقامی ٹائم زون میں شمار کیے جاتے ہیں۔ کچھ قدریں جیسے مرحلہ اور روشنی صفحے کے اندر ڈیٹا کی اندرونی ہم آہنگی کو برقرار رکھنے کے لیے شہر کے مقامی دن کے سیاق میں دکھائی جاتی ہیں۔` },
  ],
  de: [
    { q: c => `Wie ist die aktuelle Mondphase in ${c}?`,
      a: c => `Diese Seite zeigt die aktuelle Mondphase in ${c}, zusammen mit dem Beleuchtungsanteil, dem Mondalter und Links zum Monatskalender und zu nahen Tagen. Damit lässt sich der Mondstand im Kontext der Monatsphasen lesen, statt sich allein auf den Phasennamen zu verlassen.` },
    { q: c => `Wann ist der nächste Vollmond in ${c}?`,
      a: c => `Die Seite zeigt das nächste Vollmonddatum in ${c} sowohl im gregorianischen als auch im Hidschri-Kalender, mit der Uhrzeit in der Ortszeit der Stadt. Voll- und Neumondzeiten können sich zwischen Städten aufgrund von Zeitzonen unterscheiden.` },
    { q: c => `Wann ist der nächste Neumond in ${c}?`,
      a: c => `Ein Neumond ist der Moment, in dem der Mond zwischen Erde und Sonne liegt; die Beleuchtung liegt nahe 0 %. Diese Seite zeigt das nächste Neumonddatum in ${c} — den Beginn eines neuen Mondzyklus.` },
    { q: c => `Wie nutze ich den Mondkalender in ${c}?`,
      a: c => `Verwenden Sie die Links zu nahen Tagen oder die Schaltfläche zum Monatskalender, um die Mondphasen im Monat zu überprüfen. Für mehr Details zu einem bestimmten Tag wechseln Sie auf die vollständige Monatsseite oder eine konkrete Datumsseite.` },
    { q: c => `Warum unterscheiden sich Mondaufgangs- und Mondunterganszeiten zwischen Städten?`,
      a: c => `Mondaufgang und -untergang hängen von den Koordinaten der Stadt und ihrer Zeitzone ab. Aufgangs- und Untergangszeiten variieren daher von Stadt zu Stadt — die hier angezeigten Werte sind in der Ortszeit von ${c}.` },
    { q: c => `Wie hängt der Mond mit dem Hidschri-Kalender zusammen?`,
      a: c => `Der Hidschri-Kalender beruht auf dem Mondzyklus. Jeder Monat beginnt mit der Sichtung der Mondsichel und dauert in der Regel 29 oder 30 Tage, weshalb das Hidschri-Jahr etwa 11 Tage kürzer ist als das Sonnenjahr.` },
    { q: c => `Was ist der Unterschied zwischen einer astronomischen Konstellation und einem Tierkreiszeichen?`,
      a: c => `Eine astronomische Konstellation ist eine von der Internationalen Astronomischen Union (IAU) anerkannte Himmelsregion, während ein Tierkreiszeichen eine konventionelle astrologische Einteilung ist, die nicht die tatsächliche astronomische Position des Mondes widerspiegelt. Die Seite verwendet astronomische Konstellationen, nicht astrologische Zeichen.` },
    { q: c => `Sind die Monddaten auf dieser Seite in der Ortszeit von ${c}?`,
      a: c => `Ja — Mondaufgang, Mondunterang, Vollmond und Neumond werden alle in der Ortszeit von ${c} berechnet. Werte wie Phase und Beleuchtung werden im Kontext des lokalen Tages der Stadt angezeigt, damit die Daten innerhalb der Seite konsistent bleiben.` },
  ],
  id: [
    { q: c => `Apa fase Bulan saat ini di ${c}?`,
      a: c => `Halaman ini menampilkan fase Bulan saat ini di ${c}, beserta persentase iluminasi, usia Bulan, dan tautan ke kalender bulanan serta hari-hari terdekat. Ini membantu membaca keadaan Bulan dalam konteks fase-fase bulan, bukan hanya bergantung pada nama fase saja.` },
    { q: c => `Kapan bulan purnama berikutnya di ${c}?`,
      a: c => `Halaman menampilkan tanggal bulan purnama berikutnya di ${c} dalam kalender Masehi dan Hijriah, dengan waktu kejadian dalam zona waktu lokal kota. Waktu purnama dan bulan baru dapat berbeda antar kota karena perbedaan zona waktu.` },
    { q: c => `Kapan bulan baru berikutnya di ${c}?`,
      a: c => `Bulan baru adalah saat Bulan berada antara Bumi dan Matahari, dengan iluminasi mendekati 0%. Halaman ini menampilkan tanggal bulan baru berikutnya di ${c} — awal siklus bulan baru.` },
    { q: c => `Bagaimana cara menggunakan kalender Bulan di ${c}?`,
      a: c => `Gunakan tautan hari terdekat atau tombol kalender bulanan untuk meninjau fase Bulan sepanjang bulan. Anda dapat membuka halaman bulan penuh atau halaman tanggal tertentu jika ingin detail yang lebih rinci tentang suatu hari.` },
    { q: c => `Mengapa waktu terbit dan terbenam Bulan berbeda antar kota?`,
      a: c => `Waktu terbit dan terbenam Bulan tergantung pada koordinat kota dan zona waktu. Karena itu waktu terbit/terbenam berbeda dari kota ke kota — nilai yang ditampilkan di sini dalam waktu lokal ${c}.` },
    { q: c => `Bagaimana Bulan terkait dengan kalender Hijriah?`,
      a: c => `Kalender Hijriah dibangun atas siklus Bulan. Setiap bulan dimulai dengan rukyat hilal dan biasanya berlangsung 29 atau 30 hari, yang membuat tahun Hijriah sekitar 11 hari lebih pendek dari tahun matahari.` },
    { q: c => `Apa perbedaan antara konstelasi astronomi dan zodiak?`,
      a: c => `Konstelasi astronomi adalah wilayah langit yang diakui oleh Persatuan Astronomi Internasional (IAU), sedangkan zodiak adalah pembagian astrologi konvensional yang tidak mencerminkan posisi astronomi Bulan yang sebenarnya. Situs menggunakan konstelasi astronomi, bukan zodiak astrologi.` },
    { q: c => `Apakah data Bulan di halaman ini dalam waktu lokal ${c}?`,
      a: c => `Ya — waktu terbit, terbenam, purnama, dan bulan baru semuanya dihitung dalam zona waktu lokal ${c}. Beberapa nilai seperti fase dan iluminasi ditampilkan dalam konteks hari lokal kota agar data tetap konsisten di dalam halaman.` },
  ],
  es: [
    { q: c => `¿Cuál es la fase actual de la Luna en ${c}?`,
      a: c => `Esta página muestra la fase actual de la Luna en ${c}, junto con el porcentaje de iluminación, la edad de la Luna y enlaces al calendario mensual y a los días cercanos. Esto ayuda a leer el estado de la Luna en el contexto de las fases del mes, en lugar de basarse solo en el nombre de la fase.` },
    { q: c => `¿Cuándo es la próxima luna llena en ${c}?`,
      a: c => `La página muestra la próxima fecha de luna llena en ${c} en los calendarios gregoriano e hijri, con la hora del evento en la zona horaria local de la ciudad. Los horarios de luna llena y luna nueva pueden variar entre ciudades por diferencias de zona horaria.` },
    { q: c => `¿Cuándo es la próxima luna nueva en ${c}?`,
      a: c => `La luna nueva es el instante en que la Luna se sitúa entre la Tierra y el Sol, con una iluminación cercana al 0 %. Esta página muestra la próxima fecha de luna nueva en ${c} — el inicio de un nuevo ciclo lunar.` },
    { q: c => `¿Cómo uso el calendario lunar en ${c}?`,
      a: c => `Usa los enlaces de los días cercanos o el botón del calendario mensual para repasar las fases de la Luna durante el mes. Puedes ir a una página de mes completo o a una página de fecha específica para más detalle sobre un día concreto.` },
    { q: c => `¿Por qué las horas de salida y puesta de la Luna difieren entre ciudades?`,
      a: c => `Las horas de salida y puesta de la Luna dependen de las coordenadas de la ciudad y su zona horaria. Por eso varían de una ciudad a otra — los valores mostrados aquí están en la hora local de ${c}.` },
    { q: c => `¿Cómo se relaciona la Luna con el calendario hijri?`,
      a: c => `El calendario hijri se basa en el ciclo lunar. Cada mes comienza con la observación del creciente y suele durar 29 o 30 días, lo que hace que el año hijri sea unos 11 días más corto que el año solar.` },
    { q: c => `¿Cuál es la diferencia entre una constelación astronómica y un signo del zodíaco?`,
      a: c => `Una constelación astronómica es una región del cielo reconocida por la Unión Astronómica Internacional (IAU), mientras que un signo del zodíaco es una división astrológica convencional que no refleja la posición astronómica real de la Luna. El sitio usa constelaciones astronómicas, no signos astrológicos.` },
    { q: c => `¿Los datos lunares de esta página están en hora local de ${c}?`,
      a: c => `Sí — las horas de salida, puesta, luna llena y luna nueva se calculan todas en la zona horaria local de ${c}. Algunos valores como la fase y la iluminación se muestran en el contexto del día local de la ciudad para mantener la coherencia de los datos dentro de la página.` },
  ],
  bn: [
    { q: c => `${c}-এ চাঁদের বর্তমান দশা কী?`,
      a: c => `এই পৃষ্ঠা ${c}-এ চাঁদের বর্তমান দশা দেখায়, পাশাপাশি আলোকন শতাংশ, চাঁদের বয়স, এবং মাসিক ক্যালেন্ডার ও নিকটবর্তী দিনের লিঙ্কও। এটি আপনাকে কেবল দশার নামের উপর নির্ভর না করে মাসের দশাগুলির প্রসঙ্গে চাঁদের অবস্থা পড়তে সাহায্য করে।` },
    { q: c => `${c}-এ পরবর্তী পূর্ণিমা কখন?`,
      a: c => `পৃষ্ঠাটি ${c}-এ পরবর্তী পূর্ণিমার তারিখ গ্রেগরিয়ান ও হিজরি উভয় ক্যালেন্ডারে দেখায়, এবং ঘটনার সময় শহরের স্থানীয় টাইমজোনে। টাইমজোনের পার্থক্যের কারণে পূর্ণিমা ও অমাবস্যার সময় শহরভেদে আলাদা হতে পারে।` },
    { q: c => `${c}-এ পরবর্তী অমাবস্যা কখন?`,
      a: c => `অমাবস্যা হল সেই মুহূর্ত যখন চাঁদ পৃথিবী ও সূর্যের মাঝে থাকে, এবং আলোকন প্রায় ০%। এই পৃষ্ঠা ${c}-এ পরবর্তী অমাবস্যার তারিখ দেখায় — একটি নতুন চান্দ্র চক্রের সূচনা।` },
    { q: c => `${c}-এ চাঁদের ক্যালেন্ডার কীভাবে ব্যবহার করব?`,
      a: c => `মাসজুড়ে চাঁদের দশা পর্যালোচনা করতে নিকটবর্তী দিনের লিঙ্ক বা মাসিক ক্যালেন্ডার বোতাম ব্যবহার করুন। কোনো নির্দিষ্ট দিনের আরও বিস্তারিত জানতে চাইলে পূর্ণ মাসের পৃষ্ঠা বা নির্দিষ্ট তারিখের পৃষ্ঠায় যেতে পারেন।` },
    { q: c => `চাঁদের উদয় ও অস্তের সময় শহরভেদে কেন আলাদা?`,
      a: c => `চাঁদের উদয় ও অস্তের সময় শহরের স্থানাঙ্ক ও টাইমজোনের উপর নির্ভর করে। তাই উদয় ও অস্তের সময় এক শহর থেকে আরেক শহরে পরিবর্তিত হয় — এখানে প্রদর্শিত মানগুলি ${c}-এর স্থানীয় সময়ে।` },
    { q: c => `চাঁদ হিজরি ক্যালেন্ডারের সাথে কীভাবে সম্পর্কিত?`,
      a: c => `হিজরি ক্যালেন্ডার চাঁদের চক্রের উপর ভিত্তি করে নির্মিত। প্রতিটি মাস হিলাল দেখার মাধ্যমে শুরু হয় এবং সাধারণত ২৯ বা ৩০ দিন স্থায়ী হয়, যা হিজরি বছরকে সৌর বছরের চেয়ে প্রায় ১১ দিন ছোট করে।` },
    { q: c => `জ্যোতির্বিজ্ঞানিক নক্ষত্রমণ্ডল ও রাশিচক্রের মধ্যে পার্থক্য কী?`,
      a: c => `জ্যোতির্বিজ্ঞানিক নক্ষত্রমণ্ডল হল আন্তর্জাতিক জ্যোতির্বিজ্ঞান ইউনিয়ন (IAU) কর্তৃক স্বীকৃত আকাশের একটি অঞ্চল, আর রাশিচক্র হল একটি প্রচলিত জ্যোতিষ বিভাজন যা চাঁদের প্রকৃত জ্যোতির্বিজ্ঞানিক অবস্থান প্রতিফলিত করে না। সাইটটি জ্যোতিষ রাশি নয়, বরং জ্যোতির্বিজ্ঞানিক নক্ষত্রমণ্ডল ব্যবহার করে।` },
    { q: c => `এই পৃষ্ঠার চাঁদের ডেটা কি ${c}-এর স্থানীয় সময়ে?`,
      a: c => `হ্যাঁ — চাঁদের উদয়, অস্ত, পূর্ণিমা ও অমাবস্যার সময় সবই ${c}-এর স্থানীয় টাইমজোনে গণনা করা হয়। দশা ও আলোকনের মতো কিছু মান পৃষ্ঠার ভিতরে ডেটার সামঞ্জস্য নিশ্চিত করতে শহরের স্থানীয় দিনের প্রসঙ্গে দেখানো হয়।` },
  ],
  ms: [
    { q: c => `Apakah fasa Bulan semasa di ${c}?`,
      a: c => `Halaman ini memaparkan fasa Bulan semasa di ${c}, beserta peratusan pencahayaan, usia Bulan, dan pautan ke kalendar bulanan dan hari-hari berdekatan. Ini membantu membaca keadaan Bulan dalam konteks fasa-fasa bulan, bukan hanya bergantung pada nama fasa sahaja.` },
    { q: c => `Bilakah bulan purnama seterusnya di ${c}?`,
      a: c => `Halaman memaparkan tarikh bulan purnama seterusnya di ${c} dalam kalendar Masihi dan Hijrah, dengan waktu peristiwa dalam zon waktu tempatan bandar. Waktu purnama dan anak bulan boleh berbeza antara bandar disebabkan perbezaan zon waktu.` },
    { q: c => `Bilakah anak bulan seterusnya di ${c}?`,
      a: c => `Anak bulan ialah saat Bulan berada antara Bumi dan Matahari, dengan pencahayaan menghampiri 0%. Halaman ini memaparkan tarikh anak bulan seterusnya di ${c} — permulaan kitaran bulan yang baharu.` },
    { q: c => `Bagaimana saya menggunakan kalendar Bulan di ${c}?`,
      a: c => `Gunakan pautan hari berdekatan atau butang kalendar bulanan untuk menyemak fasa Bulan sepanjang bulan. Anda boleh pergi ke halaman bulan penuh atau halaman tarikh tertentu jika mahukan butiran lebih halus untuk satu hari tertentu.` },
    { q: c => `Mengapa waktu terbit dan terbenam Bulan berbeza antara bandar?`,
      a: c => `Waktu terbit dan terbenam Bulan bergantung pada koordinat bandar dan zon waktunya. Oleh itu waktu terbit dan terbenam berbeza dari bandar ke bandar — nilai yang dipaparkan di sini adalah dalam waktu tempatan ${c}.` },
    { q: c => `Bagaimana Bulan berkaitan dengan kalendar Hijrah?`,
      a: c => `Kalendar Hijrah dibina atas kitaran Bulan. Setiap bulan bermula dengan rukyah hilal dan biasanya berlangsung 29 atau 30 hari, menjadikan tahun Hijrah kira-kira 11 hari lebih pendek daripada tahun matahari.` },
    { q: c => `Apakah perbezaan antara buruj astronomi dan tanda zodiak?`,
      a: c => `Buruj astronomi ialah kawasan langit yang diiktiraf oleh Kesatuan Astronomi Antarabangsa (IAU), manakala tanda zodiak ialah pembahagian astrologi konvensional yang tidak mencerminkan kedudukan astronomi sebenar Bulan. Laman ini menggunakan buruj astronomi, bukan tanda astrologi.` },
    { q: c => `Adakah data Bulan di halaman ini dalam waktu tempatan ${c}?`,
      a: c => `Ya — waktu terbit, terbenam, bulan purnama dan anak bulan semuanya dikira dalam zon waktu tempatan ${c}. Sesetengah nilai seperti fasa dan pencahayaan dipaparkan dalam konteks hari tempatan bandar supaya data kekal konsisten di dalam halaman.` },
  ],
};

// ── PATCH 1: js/app.js _hubFaqByLang block ──
// We replace the entries inside each lang's array. Only the 8 Q/A pairs
// and the title-text change. The edu-title / edu-p1/p2/p3 lines stay
// intact. We do this by replacing each ['.moon-city-hub-faq-q{i}', ...]
// and ['.moon-city-hub-faq-a{i}', ...] line individually.

function appJsLineFor(lang, slot, idx) {
  const entry = FAQ_BY_LANG[lang][idx - 1];
  if (!entry) throw new Error(`No FAQ entry for ${lang}/${idx}`);
  const text = slot === 'q' ? entry.q('${_C}') : entry.a('${_C}');
  // Backtick-escape ${_C} (we want LITERAL `${_C}` in the output source)
  const escaped = text.replace(/`/g, '\\`');
  return `                        ['.moon-city-hub-faq-${slot}${idx}', \`${escaped}\`],`;
}

function patchAppJs(content) {
  let patched = content;
  let changes = 0;
  for (const lang of Object.keys(FAQ_BY_LANG)) {
    for (let i = 1; i <= 8; i++) {
      for (const slot of ['q', 'a']) {
        // Match the existing line by its selector prefix. The selector is unique within a lang block.
        // Since per-lang blocks repeat the selector, we need to match by position. The structure:
        //   <langKey>: [
        //     ['.moon-city-hub-faq-title-text', `...`],
        //     ['.moon-city-hub-faq-q1', `...`],
        //     ['.moon-city-hub-faq-a1', `...`],
        //     ['.moon-city-hub-faq-q2', `...`],
        //     ...
        //   ],
        // We can't safely scope a global regex per lang without parsing. Instead we
        // rely on the fact that each [selector, value] appears EXACTLY ONCE per lang.
        // For multi-lang replacement, we use a per-lang anchor.
      }
    }
  }
  // Strategy: split the _hubFaqByLang block into per-lang chunks, mutate each, glue back.
  const startMarker = '                const _hubFaqByLang = {\r\n';
  const endMarker = '                };\r\n                const _hubFaqMap';
  const startIdx = patched.indexOf(startMarker);
  if (startIdx < 0) {
    const lf = startMarker.replace(/\r\n/g, '\n');
    const endLf = endMarker.replace(/\r\n/g, '\n');
    const startIdxLf = patched.indexOf(lf);
    if (startIdxLf < 0) throw new Error('app.js _hubFaqByLang start not found');
    return _patchAppJsImpl(patched, lf, endLf);
  }
  return _patchAppJsImpl(patched, startMarker, endMarker);
}

function _patchAppJsImpl(content, startMarker, endMarker) {
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx < 0) throw new Error('app.js _hubFaqByLang end not found');
  const blockStart = startIdx + startMarker.length;
  const block = content.substring(blockStart, endIdx);
  // The block is: ar:[...], en:[...], fr:[...], ..., ms:[...]
  // Each lang ends with `                    ],\r\n` (mind the indent).
  // Strategy: for each lang, find its array, replace lines matching faq-q{i} / faq-a{i}.
  const isLF = !startMarker.includes('\r\n');
  const EOL = isLF ? '\n' : '\r\n';
  let patchedBlock = block;
  let changes = 0;
  for (const lang of Object.keys(FAQ_BY_LANG)) {
    const langStart = patchedBlock.indexOf(`                    ${lang}: [`);
    if (langStart < 0) {
      console.log(`SKIP_LANG_APP_JS: ${lang} not found`);
      continue;
    }
    // Find the matching closing `                    ],` for this lang
    const langEnd = patchedBlock.indexOf(`                    ],`, langStart);
    if (langEnd < 0) {
      console.log(`SKIP_LANG_APP_JS: ${lang} closing not found`);
      continue;
    }
    const langSlice = patchedBlock.substring(langStart, langEnd);
    let newSlice = langSlice;
    for (let i = 1; i <= 8; i++) {
      for (const slot of ['q', 'a']) {
        // Match a line like:
        //   ['.moon-city-hub-faq-q1', `...whatever...`],
        // The value can span multiple lines if backtick string has \n inside,
        // but our texts are single-line so this is safe.
        const sel = `'.moon-city-hub-faq-${slot}${i}'`;
        const lineRe = new RegExp(
          // Capture the leading indent + selector + value-token
          `(                        \\[${escapeRegex(sel)}, \`)([\\s\\S]*?)(\`\\],?)`,
          ''
        );
        const newText = FAQ_BY_LANG[lang][i - 1][slot]('${_C}');
        const newValue = newText.replace(/`/g, '\\`');
        const beforeReplace = newSlice;
        newSlice = newSlice.replace(lineRe, (m, p1, _old, p3) => p1 + newValue + p3);
        if (beforeReplace !== newSlice) changes++;
      }
    }
    patchedBlock = patchedBlock.substring(0, langStart) + newSlice + patchedBlock.substring(langStart + langSlice.length);
  }
  if (changes === 0) {
    console.log('OK_ALREADY: app.js _hubFaqByLang (no changes detected)');
    return content;
  }
  console.log(`OK app.js: ${changes} FAQ entries patched`);
  return content.substring(0, blockStart) + patchedBlock + content.substring(endIdx);
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ── PATCH 2: server.js _MOON_HUB_FAQ_BY_LANG block (JSON-LD source) ──
// Structure per lang:
//   <lang>: [
//   { q: `...`,
//     a: `...` },
//   { q: ..., a: ... }, ... × 8
//   ],

function patchServerJs(content) {
  const startMarker = '            const _MOON_HUB_FAQ_BY_LANG = {\r\n';
  const endMarker = '            };\r\n            moonFaqs = _MOON_HUB_FAQ_BY_LANG';
  const startIdx = content.indexOf(startMarker);
  if (startIdx < 0) {
    const lf = startMarker.replace(/\r\n/g, '\n');
    const endLf = endMarker.replace(/\r\n/g, '\n');
    return _patchServerJsImpl(content, lf, endLf);
  }
  return _patchServerJsImpl(content, startMarker, endMarker);
}

function _patchServerJsImpl(content, startMarker, endMarker) {
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx < 0) throw new Error('server.js _MOON_HUB_FAQ_BY_LANG end not found');
  const blockStart = startIdx + startMarker.length;
  const block = content.substring(blockStart, endIdx);
  const isLF = !startMarker.includes('\r\n');
  const EOL = isLF ? '\n' : '\r\n';
  let patchedBlock = block;
  let changes = 0;
  for (const lang of Object.keys(FAQ_BY_LANG)) {
    // Find lang start. Note server.js uses 16-space indent for inner blocks, but the
    // ar/en blocks use 16, while fr/tr/etc use 20. Let's be loose: try both.
    const tries = [`                ${lang}: [`, `                    ${lang}: [`];
    let langStart = -1;
    let baseIndent = '';
    for (const t of tries) {
      langStart = patchedBlock.indexOf(t);
      if (langStart >= 0) { baseIndent = t.match(/^( +)/)[1]; break; }
    }
    if (langStart < 0) {
      console.log(`SKIP_LANG_SERVER_JS: ${lang} not found`);
      continue;
    }
    const langEndPattern = `${baseIndent}],`;
    const langEnd = patchedBlock.indexOf(langEndPattern, langStart);
    if (langEnd < 0) { console.log(`SKIP_LANG_SERVER_JS: ${lang} closing not found`); continue; }
    const langSlice = patchedBlock.substring(langStart, langEnd);

    // Now replace the 8 Q/A pairs inside this slice.
    // Each pair structure:
    //   { q: `...`,
    //     a: `...` },
    // We'll build a fresh slice from the FAQ_BY_LANG and replace the entire array body.
    //
    // The array body is between `[\r\n` after lang name and the closing `],`.
    // Build the fresh body content:
    const innerIndent = baseIndent + '    '; // 4 more spaces for items
    const items = FAQ_BY_LANG[lang].map(e => {
      const qText = e.q('${_hubCity}').replace(/`/g, '\\`');
      const aText = e.a('${_hubCity}').replace(/`/g, '\\`');
      return `${innerIndent}{ q: \`${qText}\`,${EOL}${innerIndent}  a: \`${aText}\` }`;
    }).join(`,${EOL}`);
    const newSlice = `${baseIndent}${lang}: [${EOL}${items}${EOL}`;
    if (newSlice !== langSlice) {
      patchedBlock = patchedBlock.substring(0, langStart) + newSlice + patchedBlock.substring(langStart + langSlice.length);
      changes++;
    }
  }
  if (changes === 0) {
    console.log('OK_ALREADY: server.js _MOON_HUB_FAQ_BY_LANG');
    return content;
  }
  console.log(`OK server.js: ${changes} lang FAQ blocks rewritten`);
  return content.substring(0, blockStart) + patchedBlock + content.substring(endIdx);
}

// ── Run both patches ──

const appJsPath = path.join(ROOT, 'js', 'app.js');
const serverJsPath = path.join(ROOT, 'server.js');

let appJsContent = fs.readFileSync(appJsPath, 'utf8');
let serverJsContent = fs.readFileSync(serverJsPath, 'utf8');

const newAppJs = patchAppJs(appJsContent);
const newServerJs = patchServerJs(serverJsContent);

if (newAppJs !== appJsContent) {
  fs.writeFileSync(appJsPath, newAppJs, 'utf8');
  console.log('WROTE: js/app.js');
}
if (newServerJs !== serverJsContent) {
  fs.writeFileSync(serverJsPath, newServerJs, 'utf8');
  console.log('WROTE: server.js');
}
console.log('DONE');
