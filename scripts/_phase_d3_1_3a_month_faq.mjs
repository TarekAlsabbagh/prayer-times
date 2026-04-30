// Phase D3.1.3a — fix B2-c: visible FAQ DOM on month pages was AR/EN-only.
// Replicate server.js's _MOON_MONTH_FAQ_BY_LANG (D3.1b translations) into
// app.js's _runMonthOverrides → _monthFaq array, expanding from
// (lng === 'ar') ? AR : EN to a 10-lang lookup. Keeps the 4 B2-e edu teaser
// entries unchanged (they fall back to EN for new langs — addressed in D3.1.3c).
//
// Result: visible DOM (set by JS) == JSON-LD FAQPage (set by SSR after D3.1b)
// → eliminates Google Search Console schema/DOM mismatch warnings.
import fs from 'fs';

const file = 'js/app.js';
const src = fs.readFileSync(file, 'utf8');
const isCRLF = /\r\n/.test(src);
const EOL = isCRLF ? '\r\n' : '\n';

// ────────────────────────────────────────────────────────────────────────
// FAQ Q/A translations — mirror of server.js _MOON_MONTH_FAQ_BY_LANG (D3.1b)
// JS variable names are different: _Cm = city, _mName = month name, _mY = year.
// ────────────────────────────────────────────────────────────────────────
//
// Each lang has 17 entries: 1 FAQ section title + 8 Q + 8 A.
// Entries are tuples [selector, text] for direct .forEach setting.
//
// The order of selectors is fixed by app.js loop:
//   .moon-city-hub-faq-title-text (FAQ section title)
//   .moon-city-hub-faq-q1, .moon-city-hub-faq-a1
//   ...
//   .moon-city-hub-faq-q8, .moon-city-hub-faq-a8

const FAQ = {
  ar: [
    [`.moon-city-hub-faq-title-text`, '`أسئلة شائعة عن تقويم القمر في ${_Cm} — ${_mName} ${_mY}`'],
    [`.moon-city-hub-faq-q1`, '`ما هو تقويم القمر في ${_Cm} لشهر ${_mName} ${_mY}؟`'],
    [`.moon-city-hub-faq-a1`, '`يَعرض هذا التقويم أطوار القمر اليوميّة في ${_Cm} خلال شهر ${_mName} ${_mY}، من الهلال والأحدب إلى البدر والمحاق، مع نسبة الإضاءة ومواعيد الشروق والغروب لكلّ يوم.`'],
    [`.moon-city-hub-faq-q2`, '`ما هو طور القمر اليوم في ${_Cm}؟`'],
    [`.moon-city-hub-faq-a2`, '`يَعرض الموقع طور القمر الحاليّ ونسبة إضاءته لحظيّاً حسب موقع ${_Cm}، ضمن سياق التقويم الشهريّ المعروض هنا.`'],
    [`.moon-city-hub-faq-q3`, '`متى يكون البدر في ${_Cm} خلال ${_mName} ${_mY}؟`'],
    [`.moon-city-hub-faq-a3`, '`قسم "الأطوار القمريّة القادمة" أعلاه يَعرض موعد البدر القادم في ${_Cm} مع التاريخ الميلاديّ والهجريّ الدقيق. خلال شهر ${_mName} ${_mY}، البدر يَظهر بإضاءة 100٪ في الليلة المحدّدة.`'],
    [`.moon-city-hub-faq-q4`, '`متى يكون المحاق في ${_Cm} خلال ${_mName} ${_mY}؟`'],
    [`.moon-city-hub-faq-a4`, '`قسم "الأطوار القمريّة القادمة" يَعرض موعد المحاق القادم — وهو الذي يَبدأ به الشهر الهجريّ الجديد. المحاق هو لحظة وقوع القمر بين الأرض والشمس بإضاءة 0٪.`'],
    [`.moon-city-hub-faq-q5`, '`كيف أقرأ تقويم أطوار القمر الشهريّ؟`'],
    [`.moon-city-hub-faq-a5`, "`كلّ خانة في التقويم تُمثّل يومًا واحدًا وتُظهر: التاريخ، إيموجي طور القمر، اسم الطور (محاق، هلال، تربيع، أحدب، بدر)، والمسافة الزمنيّة من اليوم الحاليّ. اضغط على أيّ يوم لفتح صفحة تَفاصيل ذلك اليوم.`"],
    [`.moon-city-hub-faq-q6`, '`لماذا تَختلف مواعيد شروق وغروب القمر بين المدن؟`'],
    [`.moon-city-hub-faq-a6`, '`يَعتمد شروق وغروب القمر على خطّ الطول والعرض الجغرافيّ والمنطقة الزمنيّة. الفرق قد يَصل إلى 12 ساعة بين شرق وغرب الأرض. بيانات هذه الصفحة محسوبة بالتوقيت المحلّيّ لـ ${_Cm}.`'],
    [`.moon-city-hub-faq-q7`, '`هل يَعتمد هذا التقويم على توقيت ${_Cm} المحلّيّ؟`'],
    [`.moon-city-hub-faq-a7`, '`نعم. كلّ مواعيد الشروق والغروب وأوقات البدر/المحاق محسوبة بالتوقيت المحلّيّ لـ ${_Cm}. الإحداثيّات الجغرافيّة لهذه المدينة تُؤثّر على الاتّجاه والارتفاع أيضًا.`'],
    [`.moon-city-hub-faq-q8`, '`ما علاقة أطوار القمر بالتقويم الهجريّ؟`'],
    [`.moon-city-hub-faq-a8`, "`التقويم الهجريّ قمريّ بالكامل: كلّ شهر يَبدأ برؤية الهلال بعد المحاق ويَستمرّ 29 أو 30 يومًا. مَواعيد البدر والمحاق في هذا التقويم تُساعد على تَوقّع بداية الشهر الهجريّ القادم.`"],
  ],
  en: [
    [`.moon-city-hub-faq-title-text`, '`FAQ about the moon calendar in ${_Cm} — ${_mName} ${_mY}`'],
    [`.moon-city-hub-faq-q1`, '`What is the moon calendar in ${_Cm} for ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a1`, '`This calendar shows daily moon phases in ${_Cm} during ${_mName} ${_mY} — crescent, gibbous, full and new moon — with illumination and rise/set times for each day.`'],
    [`.moon-city-hub-faq-q2`, '`What is the moon phase today in ${_Cm}?`'],
    [`.moon-city-hub-faq-a2`, '`The site shows the current phase and illumination live for ${_Cm}, within the context of this monthly calendar.`'],
    [`.moon-city-hub-faq-q3`, '`When is the full moon in ${_Cm} during ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a3`, '`The "Upcoming moon phases" section above shows the precise full moon date in ${_Cm}. During ${_mName} ${_mY}, the full moon reaches 100% illumination on the specified night.`'],
    [`.moon-city-hub-faq-q4`, '`When is the new moon in ${_Cm} during ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a4`, '`The "Upcoming moon phases" section shows the next new moon date — which marks the start of the new Hijri month. New moon is when the Moon lies between Earth and Sun (0% illumination).`'],
    [`.moon-city-hub-faq-q5`, '`How do I read the monthly moon phase calendar?`'],
    [`.moon-city-hub-faq-a5`, "`Each cell represents one day and shows: the date, moon phase emoji, phase name (new, crescent, quarter, gibbous, full), and relative offset from today. Click any day to open that day's detail page.`"],
    [`.moon-city-hub-faq-q6`, '`Why do moonrise and moonset times differ between cities?`'],
    [`.moon-city-hub-faq-a6`, "`Moonrise and moonset depend on longitude, latitude and timezone. The difference can reach 12 hours between east and west of the globe. Times on this page are computed for ${_Cm}'s local timezone.`"],
    [`.moon-city-hub-faq-q7`, "`Is this calendar in ${_Cm}'s local time?`"],
    [`.moon-city-hub-faq-a7`, "`Yes. All moonrise/moonset and full/new moon times are computed in ${_Cm}'s local timezone. The city's geographic coordinates also affect direction and altitude.`"],
    [`.moon-city-hub-faq-q8`, '`How are moon phases related to the Hijri calendar?`'],
    [`.moon-city-hub-faq-a8`, '`The Hijri calendar is fully lunar — each month begins with the crescent sighting after the new moon and lasts 29 or 30 days. Full moon and new moon dates in this calendar help anticipate the start of the next Hijri month.`'],
  ],
  fr: [
    [`.moon-city-hub-faq-title-text`, '`FAQ sur le calendrier lunaire à ${_Cm} — ${_mName} ${_mY}`'],
    [`.moon-city-hub-faq-q1`, '`Quel est le calendrier lunaire à ${_Cm} pour ${_mName} ${_mY} ?`'],
    [`.moon-city-hub-faq-a1`, '`Ce calendrier affiche les phases lunaires quotidiennes à ${_Cm} durant ${_mName} ${_mY} — croissant, gibbeuse, pleine et nouvelle lune — avec illumination et heures de lever/coucher pour chaque jour.`'],
    [`.moon-city-hub-faq-q2`, "`Quelle est la phase de la Lune aujourd'hui à ${_Cm} ?`"],
    [`.moon-city-hub-faq-a2`, "`Le site affiche la phase actuelle et l'illumination en direct pour ${_Cm}, dans le contexte de ce calendrier mensuel.`"],
    [`.moon-city-hub-faq-q3`, '`Quand est la pleine lune à ${_Cm} en ${_mName} ${_mY} ?`'],
    [`.moon-city-hub-faq-a3`, "`La section \"Prochaines phases lunaires\" ci-dessus affiche la date précise de la pleine lune à ${_Cm}. Pendant ${_mName} ${_mY}, la pleine lune atteint 100 % d'illumination la nuit indiquée.`"],
    [`.moon-city-hub-faq-q4`, '`Quand est la nouvelle lune à ${_Cm} en ${_mName} ${_mY} ?`'],
    [`.moon-city-hub-faq-a4`, "`La section \"Prochaines phases lunaires\" affiche la prochaine date de nouvelle lune — qui marque le début du nouveau mois hégirien. La nouvelle lune se produit lorsque la Lune est entre la Terre et le Soleil (0 % d'illumination).`"],
    [`.moon-city-hub-faq-q5`, '`Comment lire le calendrier mensuel des phases lunaires ?`'],
    [`.moon-city-hub-faq-a5`, "`Chaque case représente un jour et affiche : la date, l'emoji de phase lunaire, le nom de la phase (nouvelle, croissant, quartier, gibbeuse, pleine), et le décalage relatif par rapport à aujourd'hui. Cliquez sur n'importe quel jour pour ouvrir sa page de détails.`"],
    [`.moon-city-hub-faq-q6`, '`Pourquoi les heures de lever et coucher de la Lune diffèrent-elles entre villes ?`'],
    [`.moon-city-hub-faq-a6`, "`Le lever et le coucher de la Lune dépendent de la longitude, de la latitude et du fuseau horaire. La différence peut atteindre 12 heures entre l'est et l'ouest du globe. Les heures de cette page sont calculées pour le fuseau horaire local de ${_Cm}.`"],
    [`.moon-city-hub-faq-q7`, "`Ce calendrier est-il à l'heure locale de ${_Cm} ?`"],
    [`.moon-city-hub-faq-a7`, '`Oui. Toutes les heures de lever/coucher de la Lune et de pleine/nouvelle lune sont calculées dans le fuseau horaire local de ${_Cm}. Les coordonnées géographiques de la ville affectent également la direction et l\'altitude.`'],
    [`.moon-city-hub-faq-q8`, '`Comment les phases lunaires sont-elles liées au calendrier hégirien ?`'],
    [`.moon-city-hub-faq-a8`, "`Le calendrier hégirien est entièrement lunaire — chaque mois commence avec l'observation du croissant après la nouvelle lune et dure 29 ou 30 jours. Les dates de pleine et nouvelle lune dans ce calendrier aident à anticiper le début du prochain mois hégirien.`"],
  ],
  tr: [
    [`.moon-city-hub-faq-title-text`, '`${_Cm} ay takvimi SSS — ${_mName} ${_mY}`'],
    [`.moon-city-hub-faq-q1`, '`${_Cm} için ${_mName} ${_mY} ay takvimi nedir?`'],
    [`.moon-city-hub-faq-a1`, "`Bu takvim, ${_Cm}'de ${_mName} ${_mY} boyunca günlük ay evrelerini — hilal, gibbous, dolunay ve yeni ay — her gün için aydınlanma ve doğuş/batış saatleriyle gösterir.`"],
    [`.moon-city-hub-faq-q2`, "`${_Cm}'de bugün ay evresi nedir?`"],
    [`.moon-city-hub-faq-a2`, '`Site, bu aylık takvim bağlamında ${_Cm} için güncel evreyi ve aydınlanmayı canlı olarak gösterir.`'],
    [`.moon-city-hub-faq-q3`, "`${_mName} ${_mY} sırasında ${_Cm}'de dolunay ne zaman?`"],
    [`.moon-city-hub-faq-a3`, "`Yukarıdaki \"Yaklaşan ay evreleri\" bölümü ${_Cm}'de tam dolunay tarihini gösterir. ${_mName} ${_mY} sırasında dolunay belirtilen gece %100 aydınlanmaya ulaşır.`"],
    [`.moon-city-hub-faq-q4`, "`${_mName} ${_mY} sırasında ${_Cm}'de yeni ay ne zaman?`"],
    [`.moon-city-hub-faq-a4`, "`\"Yaklaşan ay evreleri\" bölümü bir sonraki yeni ay tarihini gösterir — bu yeni hicri ayın başlangıcını işaret eder. Yeni ay, Ay'ın Dünya ve Güneş arasında bulunduğu andır (%0 aydınlanma).`"],
    [`.moon-city-hub-faq-q5`, '`Aylık ay evresi takvimini nasıl okurum?`'],
    [`.moon-city-hub-faq-a5`, '`Her hücre bir günü temsil eder ve şunları gösterir: tarih, ay evresi emojisi, evre adı (yeni, hilal, dördün, gibbous, dolunay) ve bugüne göre göreceli fark. Herhangi bir güne tıklayarak ayrıntı sayfasını açabilirsiniz.`'],
    [`.moon-city-hub-faq-q6`, '`Ay doğuşu ve batışı saatleri şehirler arasında neden farklı?`'],
    [`.moon-city-hub-faq-a6`, "`Ay doğuşu ve batışı boylama, enleme ve saat dilimine bağlıdır. Fark, dünyanın doğusu ile batısı arasında 12 saate ulaşabilir. Bu sayfadaki saatler ${_Cm}'in yerel saat dilimi için hesaplanmıştır.`"],
    [`.moon-city-hub-faq-q7`, "`Bu takvim ${_Cm}'in yerel saatinde mi?`"],
    [`.moon-city-hub-faq-a7`, "`Evet. Tüm ay doğuşu/batışı ve dolunay/yeni ay saatleri ${_Cm}'in yerel saat diliminde hesaplanır. Şehrin coğrafi koordinatları da yön ve yüksekliği etkiler.`"],
    [`.moon-city-hub-faq-q8`, '`Ay evreleri hicri takvim ile nasıl ilişkilidir?`'],
    [`.moon-city-hub-faq-a8`, '`Hicri takvim tamamen kameridir — her ay yeni aydan sonra hilal görülmesiyle başlar ve 29 veya 30 gün sürer. Bu takvimdeki dolunay ve yeni ay tarihleri, bir sonraki hicri ayın başlangıcını öngörmeye yardımcı olur.`'],
  ],
  ur: [
    [`.moon-city-hub-faq-title-text`, '`${_Cm} میں ${_mName} ${_mY} کے چاند کے کیلنڈر کے بارے میں اکثر پوچھے جانے والے سوالات`'],
    [`.moon-city-hub-faq-q1`, '`${_Cm} میں ${_mName} ${_mY} کے لیے چاند کا کیلنڈر کیا ہے؟`'],
    [`.moon-city-hub-faq-a1`, '`یہ کیلنڈر ${_Cm} میں ${_mName} ${_mY} کے دوران چاند کے روزانہ اطوار — ہلال، اَحدب، بدر اور نیا چاند — ہر دن کے لیے روشنی اور مطلع/مغیب کے اوقات کے ساتھ دکھاتا ہے۔`'],
    [`.moon-city-hub-faq-q2`, '`${_Cm} میں آج چاند کا طور کیا ہے؟`'],
    [`.moon-city-hub-faq-a2`, '`یہ سائٹ اس ماہانہ کیلنڈر کے سیاق میں ${_Cm} کے لیے موجودہ طور اور روشنی براہِ راست دکھاتی ہے۔`'],
    [`.moon-city-hub-faq-q3`, '`${_mName} ${_mY} کے دوران ${_Cm} میں بدر کب ہوگا؟`'],
    [`.moon-city-hub-faq-a3`, '`اوپر "آنے والی چاند کی اطوار" سیکشن ${_Cm} میں درست بدر کی تاریخ دکھاتا ہے۔ ${_mName} ${_mY} کے دوران بدر مقررہ رات کو 100% روشنی پر پہنچ جاتا ہے۔`'],
    [`.moon-city-hub-faq-q4`, '`${_mName} ${_mY} کے دوران ${_Cm} میں نیا چاند کب ہوگا؟`'],
    [`.moon-city-hub-faq-a4`, '`"آنے والی چاند کی اطوار" سیکشن اگلی نئے چاند کی تاریخ دکھاتا ہے — جو نئے ہجری مہینے کا آغاز ہے۔ نیا چاند وہ لمحہ ہے جب چاند زمین اور سورج کے درمیان ہوتا ہے (0% روشنی)۔`'],
    [`.moon-city-hub-faq-q5`, '`ماہانہ چاند کی اطوار کا کیلنڈر کیسے پڑھیں؟`'],
    [`.moon-city-hub-faq-a5`, '`ہر خانہ ایک دن کی نمائندگی کرتا ہے اور دکھاتا ہے: تاریخ، چاند کی طور کا ایموجی، طور کا نام (نیا، ہلال، تربیع، اَحدب، بدر) اور آج سے نسبتی فرق۔ کسی بھی دن پر کلک کر کے اس کی تفصیلی صفحہ کھولیں۔`'],
    [`.moon-city-hub-faq-q6`, '`چاند کی مطلع و مغیب کے اوقات شہروں کے درمیان کیوں مختلف ہیں؟`'],
    [`.moon-city-hub-faq-a6`, '`چاند کی مطلع و مغیب خط طول، خط عرض اور ٹائم زون پر منحصر ہیں۔ زمین کے مشرق اور مغرب کے درمیان فرق 12 گھنٹے تک پہنچ سکتا ہے۔ اس صفحے کے اوقات ${_Cm} کے مقامی ٹائم زون کے لیے شمار کیے گئے ہیں۔`'],
    [`.moon-city-hub-faq-q7`, '`کیا یہ کیلنڈر ${_Cm} کے مقامی وقت میں ہے؟`'],
    [`.moon-city-hub-faq-a7`, '`جی ہاں۔ تمام مطلع/مغیبِ چاند اور بدر/نئے چاند کے اوقات ${_Cm} کے مقامی ٹائم زون میں شمار کیے جاتے ہیں۔ شہر کی جغرافیائی محل وقوع بھی اتجاہ اور ارتفاع کو متاثر کرتی ہے۔`'],
    [`.moon-city-hub-faq-q8`, '`چاند کی اطوار کا ہجری تقویم سے کیا تعلق ہے؟`'],
    [`.moon-city-hub-faq-a8`, '`ہجری تقویم مکمل طور پر قمری ہے — ہر مہینہ نئے چاند کے بعد ہلال کی رؤیت سے شروع ہوتا ہے اور 29 یا 30 دن تک رہتا ہے۔ اس کیلنڈر میں بدر اور نئے چاند کی تاریخیں اگلے ہجری مہینے کے آغاز کا اندازہ لگانے میں مدد کرتی ہیں۔`'],
  ],
  de: [
    [`.moon-city-hub-faq-title-text`, '`FAQ zum Mondkalender in ${_Cm} — ${_mName} ${_mY}`'],
    [`.moon-city-hub-faq-q1`, '`Was ist der Mondkalender in ${_Cm} für ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a1`, '`Dieser Kalender zeigt die täglichen Mondphasen in ${_Cm} während ${_mName} ${_mY} — Sichelmond, abnehmender/zunehmender Mond, Vollmond und Neumond — mit Beleuchtung und Auf-/Untergangszeiten für jeden Tag.`'],
    [`.moon-city-hub-faq-q2`, '`Welche Mondphase ist heute in ${_Cm}?`'],
    [`.moon-city-hub-faq-a2`, '`Die Seite zeigt die aktuelle Phase und Beleuchtung live für ${_Cm}, im Kontext dieses Monatskalenders.`'],
    [`.moon-city-hub-faq-q3`, '`Wann ist der Vollmond in ${_Cm} während ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a3`, '`Der Abschnitt "Kommende Mondphasen" oben zeigt das genaue Vollmonddatum in ${_Cm}. Während ${_mName} ${_mY} erreicht der Vollmond in der angegebenen Nacht 100 % Beleuchtung.`'],
    [`.moon-city-hub-faq-q4`, '`Wann ist der Neumond in ${_Cm} während ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a4`, '`Der Abschnitt "Kommende Mondphasen" zeigt das nächste Neumonddatum — das den Beginn des neuen Hidschri-Monats markiert. Neumond ist, wenn der Mond zwischen Erde und Sonne liegt (0 % Beleuchtung).`'],
    [`.moon-city-hub-faq-q5`, '`Wie lese ich den monatlichen Mondphasen-Kalender?`'],
    [`.moon-city-hub-faq-a5`, '`Jede Zelle stellt einen Tag dar und zeigt: das Datum, das Mondphasen-Emoji, den Phasennamen (Neumond, Sichel, Viertel, Gibbös, Vollmond) und den relativen Versatz von heute. Klicken Sie auf einen beliebigen Tag, um seine Detailseite zu öffnen.`'],
    [`.moon-city-hub-faq-q6`, '`Warum unterscheiden sich Mondaufgangs- und -untergangszeiten zwischen Städten?`'],
    [`.moon-city-hub-faq-a6`, '`Mondaufgang und -untergang hängen von der geografischen Länge, Breite und Zeitzone ab. Der Unterschied kann zwischen Ost und West der Erde 12 Stunden erreichen. Die Zeiten auf dieser Seite werden für die lokale Zeitzone von ${_Cm} berechnet.`'],
    [`.moon-city-hub-faq-q7`, '`Ist dieser Kalender in der Ortszeit von ${_Cm}?`'],
    [`.moon-city-hub-faq-a7`, '`Ja. Alle Mondaufgangs-/-untergangszeiten und Vollmond-/Neumondzeiten werden in der lokalen Zeitzone von ${_Cm} berechnet. Die geografischen Koordinaten der Stadt beeinflussen auch Richtung und Höhe.`'],
    [`.moon-city-hub-faq-q8`, '`Wie hängen Mondphasen mit dem Hidschri-Kalender zusammen?`'],
    [`.moon-city-hub-faq-a8`, '`Der Hidschri-Kalender ist vollständig mondbasiert — jeder Monat beginnt mit der Sichtung der Mondsichel nach dem Neumond und dauert 29 oder 30 Tage. Vollmond- und Neumonddaten in diesem Kalender helfen, den Beginn des nächsten Hidschri-Monats vorauszusehen.`'],
  ],
  id: [
    [`.moon-city-hub-faq-title-text`, '`FAQ kalender bulan di ${_Cm} — ${_mName} ${_mY}`'],
    [`.moon-city-hub-faq-q1`, '`Apa kalender bulan di ${_Cm} untuk ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a1`, '`Kalender ini menampilkan fase bulan harian di ${_Cm} selama ${_mName} ${_mY} — hilal, gibbus, purnama dan bulan baru — dengan iluminasi dan waktu terbit/terbenam untuk setiap hari.`'],
    [`.moon-city-hub-faq-q2`, '`Apa fase bulan hari ini di ${_Cm}?`'],
    [`.moon-city-hub-faq-a2`, '`Situs menampilkan fase saat ini dan iluminasi secara langsung untuk ${_Cm}, dalam konteks kalender bulanan ini.`'],
    [`.moon-city-hub-faq-q3`, '`Kapan bulan purnama di ${_Cm} selama ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a3`, '`Bagian "Fase bulan mendatang" di atas menampilkan tanggal purnama yang tepat di ${_Cm}. Selama ${_mName} ${_mY}, bulan purnama mencapai iluminasi 100% pada malam yang ditentukan.`'],
    [`.moon-city-hub-faq-q4`, '`Kapan bulan baru di ${_Cm} selama ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a4`, '`Bagian "Fase bulan mendatang" menampilkan tanggal bulan baru berikutnya — yang menandai awal bulan Hijriah baru. Bulan baru adalah saat Bulan berada antara Bumi dan Matahari (iluminasi 0%).`'],
    [`.moon-city-hub-faq-q5`, '`Bagaimana cara membaca kalender fase bulan bulanan?`'],
    [`.moon-city-hub-faq-a5`, '`Setiap sel mewakili satu hari dan menampilkan: tanggal, emoji fase bulan, nama fase (baru, hilal, kuartal, gibbus, purnama), dan offset relatif dari hari ini. Klik hari mana pun untuk membuka halaman detailnya.`'],
    [`.moon-city-hub-faq-q6`, '`Mengapa waktu terbit dan terbenam Bulan berbeda antar kota?`'],
    [`.moon-city-hub-faq-a6`, '`Terbit dan terbenam Bulan tergantung pada bujur, lintang dan zona waktu. Perbedaannya dapat mencapai 12 jam antara timur dan barat dunia. Waktu di halaman ini dihitung untuk zona waktu lokal ${_Cm}.`'],
    [`.moon-city-hub-faq-q7`, '`Apakah kalender ini dalam waktu lokal ${_Cm}?`'],
    [`.moon-city-hub-faq-a7`, '`Ya. Semua waktu terbit/terbenam Bulan dan purnama/bulan baru dihitung dalam zona waktu lokal ${_Cm}. Koordinat geografis kota juga memengaruhi arah dan ketinggian.`'],
    [`.moon-city-hub-faq-q8`, '`Bagaimana fase bulan terkait dengan kalender Hijriah?`'],
    [`.moon-city-hub-faq-a8`, '`Kalender Hijriah sepenuhnya berbasis bulan — setiap bulan dimulai dengan rukyat hilal setelah bulan baru dan berlangsung 29 atau 30 hari. Tanggal purnama dan bulan baru dalam kalender ini membantu mengantisipasi awal bulan Hijriah berikutnya.`'],
  ],
  es: [
    [`.moon-city-hub-faq-title-text`, '`Preguntas frecuentes sobre el calendario lunar en ${_Cm} — ${_mName} ${_mY}`'],
    [`.moon-city-hub-faq-q1`, '`¿Cuál es el calendario lunar en ${_Cm} para ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a1`, '`Este calendario muestra las fases lunares diarias en ${_Cm} durante ${_mName} ${_mY} — creciente, gibosa, llena y nueva — con iluminación y horarios de salida/puesta para cada día.`'],
    [`.moon-city-hub-faq-q2`, '`¿Cuál es la fase lunar hoy en ${_Cm}?`'],
    [`.moon-city-hub-faq-a2`, '`El sitio muestra la fase actual y la iluminación en vivo para ${_Cm}, en el contexto de este calendario mensual.`'],
    [`.moon-city-hub-faq-q3`, '`¿Cuándo es la luna llena en ${_Cm} durante ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a3`, '`La sección "Próximas fases lunares" arriba muestra la fecha precisa de luna llena en ${_Cm}. Durante ${_mName} ${_mY}, la luna llena alcanza el 100 % de iluminación la noche especificada.`'],
    [`.moon-city-hub-faq-q4`, '`¿Cuándo es la luna nueva en ${_Cm} durante ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a4`, '`La sección "Próximas fases lunares" muestra la próxima fecha de luna nueva — que marca el inicio del nuevo mes hijri. La luna nueva es cuando la Luna se sitúa entre la Tierra y el Sol (0 % de iluminación).`'],
    [`.moon-city-hub-faq-q5`, '`¿Cómo leo el calendario mensual de fases lunares?`'],
    [`.moon-city-hub-faq-a5`, '`Cada celda representa un día y muestra: la fecha, el emoji de fase lunar, el nombre de la fase (nueva, creciente, cuarto, gibosa, llena) y el desfase relativo desde hoy. Haga clic en cualquier día para abrir su página de detalles.`'],
    [`.moon-city-hub-faq-q6`, '`¿Por qué los horarios de salida y puesta de la Luna difieren entre ciudades?`'],
    [`.moon-city-hub-faq-a6`, '`La salida y puesta de la Luna dependen de la longitud, latitud y zona horaria. La diferencia puede alcanzar 12 horas entre el este y el oeste del globo. Los horarios de esta página se calculan para la zona horaria local de ${_Cm}.`'],
    [`.moon-city-hub-faq-q7`, '`¿Está este calendario en la hora local de ${_Cm}?`'],
    [`.moon-city-hub-faq-a7`, '`Sí. Todos los horarios de salida/puesta de la Luna y de luna llena/nueva se calculan en la zona horaria local de ${_Cm}. Las coordenadas geográficas de la ciudad también afectan la dirección y la altitud.`'],
    [`.moon-city-hub-faq-q8`, '`¿Cómo se relacionan las fases lunares con el calendario hijri?`'],
    [`.moon-city-hub-faq-a8`, '`El calendario hijri es totalmente lunar — cada mes comienza con la observación del creciente tras la luna nueva y dura 29 o 30 días. Las fechas de luna llena y luna nueva en este calendario ayudan a anticipar el inicio del próximo mes hijri.`'],
  ],
  bn: [
    [`.moon-city-hub-faq-title-text`, '`${_Cm}-এ ${_mName} ${_mY} চাঁদের ক্যালেন্ডার সম্পর্কে প্রশ্নোত্তর`'],
    [`.moon-city-hub-faq-q1`, '`${_Cm}-এ ${_mName} ${_mY}-এর জন্য চাঁদের ক্যালেন্ডার কী?`'],
    [`.moon-city-hub-faq-a1`, '`এই ক্যালেন্ডার ${_Cm}-এ ${_mName} ${_mY}-এর সময় দৈনিক চাঁদের দশা — হিলাল, গিব্বাস, পূর্ণিমা ও অমাবস্যা — প্রতিদিনের জন্য আলোকন ও উদয়/অস্তের সময় সহ দেখায়।`'],
    [`.moon-city-hub-faq-q2`, '`${_Cm}-এ আজ চাঁদের দশা কী?`'],
    [`.moon-city-hub-faq-a2`, '`এই সাইট এই মাসিক ক্যালেন্ডারের প্রসঙ্গে ${_Cm}-এর জন্য বর্তমান দশা ও আলোকন সরাসরি দেখায়।`'],
    [`.moon-city-hub-faq-q3`, '`${_mName} ${_mY}-এর সময় ${_Cm}-এ পূর্ণিমা কখন?`'],
    [`.moon-city-hub-faq-a3`, '`উপরের "আসন্ন চাঁদের দশা" বিভাগ ${_Cm}-এ সঠিক পূর্ণিমার তারিখ দেখায়। ${_mName} ${_mY}-এর সময় পূর্ণিমা নির্দিষ্ট রাতে ১০০% আলোকনে পৌঁছায়।`'],
    [`.moon-city-hub-faq-q4`, '`${_mName} ${_mY}-এর সময় ${_Cm}-এ অমাবস্যা কখন?`'],
    [`.moon-city-hub-faq-a4`, '`"আসন্ন চাঁদের দশা" বিভাগ পরবর্তী অমাবস্যার তারিখ দেখায় — যা নতুন হিজরি মাসের শুরু চিহ্নিত করে। অমাবস্যা হল যখন চাঁদ পৃথিবী ও সূর্যের মাঝে থাকে (০% আলোকন)।`'],
    [`.moon-city-hub-faq-q5`, '`মাসিক চাঁদের দশার ক্যালেন্ডার কীভাবে পড়ব?`'],
    [`.moon-city-hub-faq-a5`, '`প্রতিটি সেল একটি দিন প্রতিনিধিত্ব করে এবং দেখায়: তারিখ, চাঁদের দশার ইমোজি, দশার নাম (অমাবস্যা, হিলাল, কোয়ার্টার, গিব্বাস, পূর্ণিমা) এবং আজ থেকে আপেক্ষিক ব্যবধান। যেকোনো দিনে ক্লিক করে তার বিবরণ পৃষ্ঠা খুলুন।`'],
    [`.moon-city-hub-faq-q6`, '`চাঁদের উদয় ও অস্তের সময় শহরভেদে কেন আলাদা?`'],
    [`.moon-city-hub-faq-a6`, '`চাঁদের উদয় ও অস্ত দ্রাঘিমাংশ, অক্ষাংশ ও টাইমজোনের উপর নির্ভর করে। পার্থক্য বিশ্বের পূর্ব ও পশ্চিমের মধ্যে ১২ ঘণ্টা পর্যন্ত হতে পারে। এই পৃষ্ঠার সময়গুলি ${_Cm}-এর স্থানীয় টাইমজোনের জন্য গণনা করা হয়।`'],
    [`.moon-city-hub-faq-q7`, '`এই ক্যালেন্ডার কি ${_Cm}-এর স্থানীয় সময়ে?`'],
    [`.moon-city-hub-faq-a7`, '`হ্যাঁ। সমস্ত চাঁদের উদয়/অস্ত এবং পূর্ণিমা/অমাবস্যার সময় ${_Cm}-এর স্থানীয় টাইমজোনে গণনা করা হয়। শহরের ভৌগোলিক স্থানাঙ্কও দিকনির্দেশ এবং উচ্চতাকে প্রভাবিত করে।`'],
    [`.moon-city-hub-faq-q8`, '`চাঁদের দশা হিজরি ক্যালেন্ডারের সাথে কীভাবে সম্পর্কিত?`'],
    [`.moon-city-hub-faq-a8`, '`হিজরি ক্যালেন্ডার সম্পূর্ণ চান্দ্র — প্রতিটি মাস অমাবস্যার পর হিলাল দেখার মাধ্যমে শুরু হয় এবং ২৯ বা ৩০ দিন স্থায়ী হয়। এই ক্যালেন্ডারে পূর্ণিমা ও অমাবস্যার তারিখগুলি পরবর্তী হিজরি মাসের শুরু অনুমান করতে সাহায্য করে।`'],
  ],
  ms: [
    [`.moon-city-hub-faq-title-text`, '`Soalan lazim tentang kalendar bulan di ${_Cm} — ${_mName} ${_mY}`'],
    [`.moon-city-hub-faq-q1`, '`Apakah kalendar bulan di ${_Cm} untuk ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a1`, '`Kalendar ini memaparkan fasa bulan harian di ${_Cm} sepanjang ${_mName} ${_mY} — hilal, gibus, bulan purnama dan anak bulan — dengan pencahayaan dan masa terbit/terbenam untuk setiap hari.`'],
    [`.moon-city-hub-faq-q2`, '`Apakah fasa bulan hari ini di ${_Cm}?`'],
    [`.moon-city-hub-faq-a2`, '`Laman ini memaparkan fasa semasa dan pencahayaan secara langsung untuk ${_Cm}, dalam konteks kalendar bulanan ini.`'],
    [`.moon-city-hub-faq-q3`, '`Bilakah bulan purnama di ${_Cm} sepanjang ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a3`, '`Bahagian "Fasa bulan akan datang" di atas memaparkan tarikh tepat bulan purnama di ${_Cm}. Sepanjang ${_mName} ${_mY}, bulan purnama mencapai pencahayaan 100% pada malam yang ditetapkan.`'],
    [`.moon-city-hub-faq-q4`, '`Bilakah anak bulan di ${_Cm} sepanjang ${_mName} ${_mY}?`'],
    [`.moon-city-hub-faq-a4`, '`Bahagian "Fasa bulan akan datang" memaparkan tarikh anak bulan seterusnya — yang menandakan permulaan bulan Hijrah baharu. Anak bulan ialah saat Bulan berada antara Bumi dan Matahari (0% pencahayaan).`'],
    [`.moon-city-hub-faq-q5`, '`Bagaimana saya membaca kalendar fasa bulan bulanan?`'],
    [`.moon-city-hub-faq-a5`, '`Setiap sel mewakili satu hari dan memaparkan: tarikh, emoji fasa bulan, nama fasa (anak bulan, hilal, suku, gibus, purnama) dan jurang relatif dari hari ini. Klik mana-mana hari untuk membuka halaman butirannya.`'],
    [`.moon-city-hub-faq-q6`, '`Mengapa waktu terbit dan terbenam Bulan berbeza antara bandar?`'],
    [`.moon-city-hub-faq-a6`, '`Terbit dan terbenam Bulan bergantung pada bujur, lintang dan zon waktu. Perbezaannya boleh mencapai 12 jam antara timur dan barat dunia. Waktu pada halaman ini dikira untuk zon waktu tempatan ${_Cm}.`'],
    [`.moon-city-hub-faq-q7`, '`Adakah kalendar ini dalam waktu tempatan ${_Cm}?`'],
    [`.moon-city-hub-faq-a7`, '`Ya. Semua waktu terbit/terbenam Bulan dan bulan purnama/anak bulan dikira dalam zon waktu tempatan ${_Cm}. Koordinat geografi bandar juga mempengaruhi arah dan ketinggian.`'],
    [`.moon-city-hub-faq-q8`, '`Bagaimana fasa bulan berkaitan dengan kalendar Hijrah?`'],
    [`.moon-city-hub-faq-a8`, '`Kalendar Hijrah adalah sepenuhnya berdasarkan bulan — setiap bulan bermula dengan rukyah hilal selepas anak bulan dan berlangsung 29 atau 30 hari. Tarikh bulan purnama dan anak bulan dalam kalendar ini membantu menjangka permulaan bulan Hijrah seterusnya.`'],
  ],
};

// B2-e edu teasers — kept as ar/en only (deferred to D3.1.3c).
const EDU_TEASERS_AR = [
  [`.moon-city-hub-edu-title`, '`حول تقويم القمر في ${_Cm} لشهر ${_mName} ${_mY}`'],
  [`.moon-city-hub-edu-p1`, '`هذا التقويم يَعرض أطوار القمر اليوميّة في ${_Cm} خلال شهر ${_mName} ${_mY}، مع نسبة الإضاءة لكلّ يوم.`'],
  [`.moon-city-hub-edu-p2`, '`اضغط على أيّ يوم في الجدول أعلاه لفتح صفحة تَفاصيل ذلك اليوم في ${_Cm}.`'],
  [`.moon-city-hub-edu-p3`, '`للمزيد عن قراءة التقويم وأهمّ الأطوار وعلاقة الشهر بالتقويم الهجريّ، اقرأ القسم التَفصيليّ أدناه.`']
];
const EDU_TEASERS_EN = [
  [`.moon-city-hub-edu-title`, '`About the moon calendar in ${_Cm} for ${_mName} ${_mY}`'],
  [`.moon-city-hub-edu-p1`, '`This calendar shows daily moon phases in ${_Cm} during ${_mName} ${_mY}, with illumination percentage for each day.`'],
  [`.moon-city-hub-edu-p2`, "`Click any day in the calendar above to open that day's detailed page for ${_Cm}.`"],
  [`.moon-city-hub-edu-p3`, '`For deeper details on reading the calendar, key phases, and Hijri context, read the educational section below.`']
];

// Build new app.js source.
const renderTuple = (tup) => `[${JSON.stringify(tup[0])}, ${tup[1]}]`;
const renderLang = (lang, faqEntries, eduEntries, indent) => {
  const all = [...faqEntries, ...eduEntries];
  const lines = all.map((tup, i) =>
    `${indent}    ${renderTuple(tup)}${i < all.length - 1 ? ',' : ''}`
  );
  return `${indent}${JSON.stringify(lang)}: [${EOL}${lines.join(EOL)}${EOL}${indent}]`;
};

const indent = '                        '; // 24 spaces (matches surrounding code)
// For ar: FAQ_ar + EDU_TEASERS_AR; for en/all-others: FAQ + EDU_TEASERS_EN.
const langOrder = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const langBlocks = langOrder.map(lang => {
  const faqEntries = FAQ[lang];
  const eduEntries = (lang === 'ar') ? EDU_TEASERS_AR : EDU_TEASERS_EN;
  return renderLang(lang, faqEntries, eduEntries, indent);
}).join(',' + EOL);

const newCode =
`                    // 8-Q month FAQ + edu — overwrite the hub-FAQ DOM placeholders` + EOL +
`                    //   (these \`.moon-city-hub-only\` blocks are visible on month URLs` + EOL +
`                    //   too because they share \`html.moon-hub-page\` class).` + EOL +
`                    // Phase D3.1.3a: 10-lang lookup mirrors server.js _MOON_MONTH_FAQ_BY_LANG` + EOL +
`                    //   (D3.1b SSR JSON-LD source) — visible DOM == JSON-LD avoids GSC mismatch.` + EOL +
`                    //   B2-e edu teasers (4 entries per lang) still ar/en — deferred to D3.1.3c.` + EOL +
`                    try {` + EOL +
`                        const _Cm = _cityName;` + EOL +
`                        const _MONTH_FAQ_BY_LANG = {` + EOL +
langBlocks + EOL +
`                        };` + EOL +
`                        const _monthFaq = _MONTH_FAQ_BY_LANG[_lng_] || _MONTH_FAQ_BY_LANG.en;` + EOL +
`                        _monthFaq.forEach(([sel, text]) => {` + EOL +
`                            const el = document.querySelector(sel);` + EOL +
`                            if (el) el.textContent = text;` + EOL +
`                        });` + EOL +
`                    } catch (_) {}`;

// Locate the existing block: from "// 8-Q month FAQ + edu — overwrite" to its closing `} catch (_) {}`.
const startMarker = '                    // 8-Q month FAQ + edu — overwrite the hub-FAQ DOM placeholders';
const endMarker   = '                        });' + EOL + '                    } catch (_) {}';

const i = src.indexOf(startMarker);
if (i < 0) throw new Error('startMarker not found');
const j = src.indexOf(endMarker, i);
if (j < 0) throw new Error('endMarker not found');
const fullEnd = j + endMarker.length;

const out = src.substring(0, i) + newCode + src.substring(fullEnd);
fs.writeFileSync(file, out, 'utf8');
console.log(`Phase D3.1.3a applied to ${file} (${out.length - src.length} chars).`);
