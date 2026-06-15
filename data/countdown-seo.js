/**
 * HIJRI-NEW-YEAR-COUNTDOWN-SEO-CONTENT-H1-FIX-1 (2026-06-15)
 * Server-only SEO content for the 4 Islamic-event countdown pages.
 * Loaded once at server boot (require) — NOT shipped to the client.
 *
 * Shape per occasion × lang:
 *   titles : { long, medium, short }  — dynamic title ladder; the server picks
 *            the longest variant that fits ~[50,60] chars AFTER substituting the
 *            {hy} (target Hijri year) / {gy} (target Gregorian year) placeholders.
 *   desc   : meta description, 120–160 chars after substitution.
 *   sections: 4 practical / calendrical educational H2 sections (when it starts /
 *            why the date differs between countries / how the countdown works /
 *            the lunar-calendar drift). These COMPLEMENT — do not duplicate — the
 *            religious "info" section already present in each page block in
 *            index.html. Injected server-side into the #cd-edu-{occasion}
 *            placeholder; rendered with the existing .section-card CSS (no new CSS).
 *
 * Substitution tokens (resolved at request time): {hy} {gy} {date} {n}.
 * Content is occasion-tailored and natively authored per language (no machine
 * fan-out, no keyword stuffing). FAQ is reused from js/i18n.js — not here.
 */
'use strict';

module.exports = {
  // ════════════════════════════════════════════════════════════════════════
  // HIJRI NEW YEAR — 1 Muharram
  // ════════════════════════════════════════════════════════════════════════
  'hijri-ny': {
    ar: {
      titles: {
        long:   'كم باقي على رأس السنة الهجرية {hy}؟ عدّ تنازليّ ليوم 1 محرّم',
        medium: 'كم باقي على رأس السنة الهجرية {hy}؟ | عدّ تنازليّ',
        short:  'العدّ التنازليّ لرأس السنة الهجرية {hy}',
      },
      desc: 'كم باقي على رأس السنة الهجرية {hy}؟ عدّ تنازليّ مباشر لأوّل يوم من شهر محرّم {hy} هـ مع التاريخ الميلاديّ المتوقّع وجدول مواعيد السنوات القادمة.',
      sections: [
        { h2: 'متى تبدأ السنة الهجرية الجديدة؟',
          body: 'تبدأ السنة الهجرية الجديدة بأوّل يوم من شهر محرّم، وهو أوّل شهور التقويم القمريّ الإسلاميّ. ويُحدَّد دخوله برؤية هلال محرّم بعد انقضاء شهر ذي الحجّة، فإن لم يُرَ الهلال أُكمل ذو الحجّة ثلاثين يومًا. وتتكوّن السنة الهجرية من اثني عشر شهرًا قمريًّا تبدأ بمحرّم وتنتهي بذي الحجّة. ولأنّ الأشهر القمرية تتراوح بين 29 و30 يومًا، فإنّ موعد رأس السنة الهجرية على التقويم الميلاديّ يتغيّر كلّ عام ولا يثبت على فصل بعينه. ويعرض هذا العدّ التنازليّ التاريخ الميلاديّ المتوقّع لأوّل محرّم {hy} هـ مع الأيّام المتبقّية حتّى ذلك اليوم.' },
        { h2: 'لماذا يختلف موعد رأس السنة الهجرية بين الدول؟',
          body: 'تعتمد بعض الدول على رؤية الهلال بالعين المجرّدة، بينما تعتمد دول أخرى على الحساب الفلكيّ لتحديد بداية الشهر. وقد يُرى هلال محرّم في منطقة قبل أخرى بيوم واحد، فيختلف إعلان أوّل محرّم رسميًّا بين بلد وآخر بمقدار يوم. ويعتمد هذا العدّ التنازليّ تاريخ تقويم أمّ القرى الحسابيّ مرجعًا تقديريًّا، ويبقى التأكيد النهائيّ لما تعلنه الجهة الشرعية في بلدك. ولهذا قد تجد فارقًا بسيطًا بين ما يعرضه العدّ هنا وما يُعلَن في بلدك، وهو أمر معتاد في المناسبات القمرية.' },
        { h2: 'كيف يعمل هذا العدّ التنازليّ؟',
          body: 'يعرض المؤقّت المباشر الأيّام والساعات والدقائق والثواني المتبقّية حتّى بداية السنة الهجرية الجديدة المتوقّعة بتوقيت بلدك. ويُدرِج جدول السنوات مواعيد أوّل محرّم للأعوام القادمة كي تخطّط مسبقًا، بينما تُظهر اللوحة القمرية طور القمر الحاليّ. وجميع التواريخ المعروضة تقديريّة محسوبة فلكيًّا، وقد تتقدّم أو تتأخّر يومًا واحدًا حسب ثبوت رؤية الهلال رسميًّا.' },
        { h2: 'رأس السنة الهجرية والتقويم القمريّ',
          body: 'تتكوّن السنة الهجرية من نحو 354 يومًا، أي أقصر بنحو 11 يومًا من السنة الميلادية الشمسية البالغة 365 يومًا. ولهذا يتقدّم رأس السنة الهجرية نحو 11 يومًا كلّ عام ميلاديّ، فيكون العدّ التنازليّ مختلفًا في كلّ سنة. وعلى مدى نحو 33 عامًا يدور رأس السنة الهجرية عبر فصول السنة الأربعة كاملةً، فيأتي مرّة في الصيف ومرّة في الشتاء. وبسبب هذا الفارق قد يقع أوّل محرّم مرّتين داخل عام ميلاديّ واحد في حالات نادرة، ويظلّ ضبط موعده بالتقويم الميلاديّ بحاجة إلى متابعة سنويّة دقيقة.' },
      ],
    },
    en: {
      titles: {
        long:   'How Long Until the Hijri New Year {hy}? 1 Muharram Countdown',
        medium: 'Hijri New Year {hy} Countdown | Days Until 1 Muharram',
        short:  'Hijri New Year {hy} Countdown',
      },
      desc: 'How long until the Hijri New Year {hy}? A live countdown to 1 Muharram {hy} AH with the expected Gregorian date ({gy}) and upcoming new year dates.',
      sections: [
        { h2: 'When does the new Hijri year begin?',
          body: 'The new Hijri year begins on the first day of Muharram, the opening month of the Islamic lunar calendar. Its start is determined by sighting the Muharram crescent once Dhul-Hijjah ends; if the crescent is not seen, Dhul-Hijjah is completed as thirty days. Because lunar months last 29 or 30 days, the Gregorian date of the Hijri New Year shifts a little every year. This countdown shows the expected Gregorian date for 1 Muharram {hy} AH along with the days remaining until that day.' },
        { h2: 'Why does the date differ between countries?',
          body: 'Some countries rely on physically sighting the crescent moon, while others use astronomical calculation to mark the start of the month. The Muharram crescent may be visible in one region a day earlier than another, so the official date of 1 Muharram can differ by a day from country to country. This countdown uses the calculated Umm al-Qura date as a reference; always confirm with the religious authority in your own country.' },
        { h2: 'How does this countdown work?',
          body: 'The live timer shows the days, hours, minutes and seconds remaining until the expected start of the new Hijri year in your local time. The years table lists the dates of 1 Muharram for the coming years so you can plan ahead, while the lunar panel shows the current moon phase. Every date displayed is an astronomical estimate and may move a day earlier or later once the crescent is officially confirmed.' },
        { h2: 'The Hijri New Year and the lunar calendar',
          body: 'The Hijri year is about 354 days long — roughly 11 days shorter than the 365-day solar Gregorian year. As a result, the Hijri New Year arrives about 11 days earlier each Gregorian year, which is why the countdown is different every year. Over a cycle of roughly 33 years, 1 Muharram moves through all four seasons, falling once in summer and once in winter.' },
      ],
    },
    fr: {
      titles: {
        long:   'Combien de jours avant le Nouvel An hégirien {hy} ? Compte à rebours',
        medium: 'Nouvel An hégirien {hy} | Compte à rebours du 1er Mouharram',
        short:  'Compte à rebours du Nouvel An hégirien {hy}',
      },
      desc: 'Combien de jours avant le Nouvel An hégirien {hy} ? Compte à rebours vers le 1er Mouharram {hy} H, avec la date grégorienne prévue ({gy}).',
      sections: [
        { h2: 'Quand commence la nouvelle année hégirienne ?',
          body: 'La nouvelle année hégirienne commence le premier jour de Mouharram, le mois d’ouverture du calendrier lunaire islamique. Son début est déterminé par l’observation du croissant de Mouharram une fois Dhou al-Hijja terminé ; si le croissant n’est pas vu, Dhou al-Hijja est complété à trente jours. Comme les mois lunaires durent 29 ou 30 jours, la date grégorienne du Nouvel An hégirien se décale légèrement chaque année. Ce compte à rebours indique la date grégorienne prévue du 1er Mouharram {hy} H ainsi que les jours restants.' },
        { h2: 'Pourquoi la date diffère-t-elle selon les pays ?',
          body: 'Certains pays se fondent sur l’observation physique du croissant, tandis que d’autres utilisent le calcul astronomique pour marquer le début du mois. Le croissant de Mouharram peut être visible un jour plus tôt dans une région que dans une autre, si bien que la date officielle du 1er Mouharram peut varier d’un jour d’un pays à l’autre. Ce compte à rebours utilise la date calculée d’Oumm al-Qoura comme référence ; confirmez toujours auprès de l’autorité religieuse de votre pays.' },
        { h2: 'Comment fonctionne ce compte à rebours ?',
          body: 'Le minuteur en direct affiche les jours, heures, minutes et secondes restant avant le début prévu de la nouvelle année hégirienne, à votre heure locale. Le tableau des années indique les dates du 1er Mouharram pour les prochaines années afin de planifier à l’avance, tandis que le panneau lunaire montre la phase actuelle de la lune. Chaque date affichée est une estimation astronomique et peut avancer ou reculer d’un jour après confirmation officielle du croissant.' },
        { h2: 'Le Nouvel An hégirien et le calendrier lunaire',
          body: 'L’année hégirienne compte environ 354 jours, soit à peu près 11 jours de moins que l’année grégorienne solaire de 365 jours. C’est pourquoi le Nouvel An hégirien arrive environ 11 jours plus tôt chaque année grégorienne, et le compte à rebours diffère d’une année à l’autre. Sur un cycle d’environ 33 ans, le 1er Mouharram traverse les quatre saisons, tombant une fois en été et une fois en hiver.' },
      ],
    },
    tr: {
      titles: {
        long:   'Hicri Yılbaşı {hy} için Geri Sayım | 1 Muharrem’e Kaç Gün?',
        medium: 'Hicri Yılbaşı {hy} Geri Sayımı | 1 Muharrem',
        short:  'Hicri Yılbaşı {hy} Geri Sayımı',
      },
      desc: 'Hicri Yılbaşı {hy} için geri sayım. 1 Muharrem {hy} H gününe kalan süreyi, beklenen miladi tarihi ({gy}) ve gelecek yılların tablosunu birlikte görün.',
      sections: [
        { h2: 'Yeni hicri yıl ne zaman başlar?',
          body: 'Yeni hicri yıl, İslami kameri takvimin ilk ayı olan Muharrem’in ilk günü başlar. Başlangıcı, Zilhicce sona erdikten sonra Muharrem hilalinin görülmesiyle belirlenir; hilal görülmezse Zilhicce otuz güne tamamlanır. Kameri aylar 29 veya 30 gün sürdüğü için Hicri Yılbaşı’nın miladi tarihi her yıl biraz kayar. Bu geri sayım, 1 Muharrem {hy} H için beklenen miladi tarihi ve o güne kalan günleri gösterir.' },
        { h2: 'Tarih ülkeden ülkeye neden değişir?',
          body: 'Bazı ülkeler hilali gözle görmeye dayanırken, bazıları ayın başlangıcını belirlemek için astronomik hesabı kullanır. Muharrem hilali bir bölgede diğerinden bir gün önce görülebilir; bu yüzden resmî 1 Muharrem tarihi ülkeden ülkeye bir gün farklılık gösterebilir. Bu geri sayım, referans olarak hesaplanmış Ümmülkura tarihini kullanır; kesin bilgi için kendi ülkenizdeki dinî mercie başvurun.' },
        { h2: 'Bu geri sayım nasıl çalışır?',
          body: 'Canlı sayaç, yeni hicri yılın beklenen başlangıcına yerel saatinizle kalan gün, saat, dakika ve saniyeyi gösterir. Yıllar tablosu, önceden planlayabilmeniz için önümüzdeki yılların 1 Muharrem tarihlerini listeler; ay paneli ise mevcut ay evresini gösterir. Görüntülenen her tarih astronomik bir tahmindir ve hilal resmen doğrulandığında bir gün öne ya da geriye kayabilir.' },
        { h2: 'Hicri Yılbaşı ve kameri takvim',
          body: 'Hicri yıl yaklaşık 354 gündür; yani 365 günlük güneş esaslı miladi yıldan yaklaşık 11 gün kısadır. Bu nedenle Hicri Yılbaşı her miladi yılda yaklaşık 11 gün önce gelir ve geri sayım her yıl değişir. Yaklaşık 33 yıllık bir döngüde 1 Muharrem dört mevsimin tamamından geçer; bir kez yazda, bir kez kışta gelir.' },
      ],
    },
    ur: {
      titles: {
        long:   'ہجری نیا سال {hy} میں کتنے دن باقی؟ 1 محرّم کی الٹی گنتی',
        medium: 'ہجری نیا سال {hy} الٹی گنتی | 1 محرّم',
        short:  'ہجری نیا سال {hy} الٹی گنتی',
      },
      desc: 'ہجری نئے سال {hy} میں کتنے دن باقی ہیں؟ 1 محرّم {hy} ہجری کی براہِ راست الٹی گنتی، متوقع میلادی تاریخ ({gy}) اور آنے والے سالوں کے جدول کے ساتھ۔',
      sections: [
        { h2: 'ہجری نیا سال کب شروع ہوتا ہے؟',
          body: 'ہجری نیا سال محرّم کی پہلی تاریخ سے شروع ہوتا ہے، جو اسلامی قمری تقویم کا پہلا مہینہ ہے۔ اس کا آغاز ذوالحجہ ختم ہونے کے بعد محرّم کے چاند کی رویت سے طے ہوتا ہے؛ اگر چاند نظر نہ آئے تو ذوالحجہ کے تیس دن مکمل کر لیے جاتے ہیں۔ چونکہ قمری مہینے 29 یا 30 دن کے ہوتے ہیں، اس لیے ہجری نئے سال کی میلادی تاریخ ہر سال کچھ آگے کھسک جاتی ہے۔ یہ الٹی گنتی 1 محرّم {hy} ہجری کی متوقع میلادی تاریخ اور باقی دن دکھاتی ہے۔' },
        { h2: 'مختلف ممالک میں تاریخ کیوں مختلف ہوتی ہے؟',
          body: 'کچھ ممالک چاند کو آنکھ سے دیکھنے پر انحصار کرتے ہیں، جبکہ بعض مہینے کے آغاز کے لیے فلکیاتی حساب استعمال کرتے ہیں۔ محرّم کا چاند ایک خطے میں دوسرے سے ایک دن پہلے نظر آ سکتا ہے، اس لیے سرکاری طور پر 1 محرّم کی تاریخ ملک بہ ملک ایک دن کے فرق سے مختلف ہو سکتی ہے۔ یہ الٹی گنتی بطورِ حوالہ اُمّ القریٰ کی حسابی تاریخ استعمال کرتی ہے؛ حتمی تصدیق اپنے ملک کے دینی ادارے سے کریں۔' },
        { h2: 'یہ الٹی گنتی کیسے کام کرتی ہے؟',
          body: 'براہِ راست ٹائمر آپ کے مقامی وقت کے مطابق نئے ہجری سال کے متوقع آغاز تک باقی دن، گھنٹے، منٹ اور سیکنڈ دکھاتا ہے۔ سالوں کا جدول آنے والے برسوں کی 1 محرّم کی تاریخیں درج کرتا ہے تاکہ آپ پیشگی منصوبہ بندی کر سکیں، جبکہ قمری پینل چاند کا موجودہ مرحلہ دکھاتا ہے۔ ہر دکھائی گئی تاریخ ایک فلکیاتی تخمینہ ہے اور رویت کی سرکاری تصدیق پر ایک دن آگے یا پیچھے ہو سکتی ہے۔' },
        { h2: 'ہجری نیا سال اور قمری تقویم',
          body: 'ہجری سال تقریباً 354 دن کا ہوتا ہے، یعنی 365 دن کے شمسی میلادی سال سے قریباً 11 دن چھوٹا۔ اسی لیے ہجری نیا سال ہر میلادی سال میں تقریباً 11 دن پہلے آتا ہے، اور الٹی گنتی ہر سال مختلف ہوتی ہے۔ تقریباً 33 سال کے دور میں 1 محرّم چاروں موسموں سے گزرتا ہے، کبھی گرمیوں میں تو کبھی سردیوں میں آتا ہے۔' },
      ],
    },
    de: {
      titles: {
        long:   'Islamisches Neujahr {hy} Countdown | Tage bis 1. Muharram',
        medium: 'Islamisches Neujahr {hy} Countdown | 1. Muharram',
        short:  'Islamisches Neujahr {hy} Countdown',
      },
      desc: 'Wie lange bis zum islamischen Neujahr {hy}? Live-Countdown zum 1. Muharram {hy} AH mit dem erwarteten gregorianischen Datum ({gy}).',
      sections: [
        { h2: 'Wann beginnt das neue Hidschri-Jahr?',
          body: 'Das neue Hidschri-Jahr beginnt am ersten Tag des Muharram, des Eröffnungsmonats des islamischen Mondkalenders. Sein Beginn wird durch die Sichtung der Muharram-Mondsichel bestimmt, sobald Dhul-Hidscha endet; wird die Sichel nicht gesehen, wird Dhul-Hidscha auf dreißig Tage vervollständigt. Da Mondmonate 29 oder 30 Tage dauern, verschiebt sich das gregorianische Datum des islamischen Neujahrs jedes Jahr ein wenig. Dieser Countdown zeigt das erwartete gregorianische Datum für den 1. Muharram {hy} AH sowie die verbleibenden Tage.' },
        { h2: 'Warum unterscheidet sich das Datum je nach Land?',
          body: 'Manche Länder verlassen sich auf die physische Sichtung der Mondsichel, andere nutzen die astronomische Berechnung, um den Monatsbeginn festzulegen. Die Muharram-Sichel kann in einer Region einen Tag früher sichtbar sein als in einer anderen, sodass das offizielle Datum des 1. Muharram von Land zu Land um einen Tag abweichen kann. Dieser Countdown verwendet das berechnete Umm-al-Qura-Datum als Richtwert; bestätigen Sie es stets bei der religiösen Autorität Ihres Landes.' },
        { h2: 'Wie funktioniert dieser Countdown?',
          body: 'Der Live-Timer zeigt die Tage, Stunden, Minuten und Sekunden bis zum erwarteten Beginn des neuen Hidschri-Jahres in Ihrer Ortszeit. Die Jahrestabelle listet die Daten des 1. Muharram für die kommenden Jahre auf, damit Sie vorausplanen können, während das Mondpanel die aktuelle Mondphase zeigt. Jedes angezeigte Datum ist eine astronomische Schätzung und kann sich nach der offiziellen Bestätigung der Sichel um einen Tag nach vorne oder hinten verschieben.' },
        { h2: 'Das islamische Neujahr und der Mondkalender',
          body: 'Das Hidschri-Jahr ist etwa 354 Tage lang – rund 11 Tage kürzer als das 365-tägige gregorianische Sonnenjahr. Daher beginnt das islamische Neujahr jedes gregorianische Jahr etwa 11 Tage früher, weshalb der Countdown jedes Jahr anders ausfällt. Über einen Zyklus von rund 33 Jahren wandert der 1. Muharram durch alle vier Jahreszeiten und fällt einmal in den Sommer und einmal in den Winter.' },
      ],
    },
    id: {
      titles: {
        long:   'Berapa Lama Lagi Tahun Baru Hijriah {hy}? Hitung Mundur 1 Muharram',
        medium: 'Hitung Mundur Tahun Baru Hijriah {hy} | 1 Muharram',
        short:  'Hitung Mundur Tahun Baru Hijriah {hy}',
      },
      desc: 'Berapa lama lagi menuju Tahun Baru Hijriah {hy}? Hitung mundur ke 1 Muharram {hy} H dengan tanggal Masehi yang diperkirakan ({gy}).',
      sections: [
        { h2: 'Kapan tahun Hijriah baru dimulai?',
          body: 'Tahun Hijriah baru dimulai pada hari pertama Muharram, bulan pembuka kalender qamariah Islam. Permulaannya ditentukan oleh rukyat hilal Muharram setelah Zulhijah berakhir; jika hilal tidak terlihat, Zulhijah disempurnakan menjadi tiga puluh hari. Karena bulan qamariah berlangsung 29 atau 30 hari, tanggal Masehi Tahun Baru Hijriah bergeser sedikit setiap tahun. Hitung mundur ini menampilkan tanggal Masehi yang diperkirakan untuk 1 Muharram {hy} H beserta sisa harinya.' },
        { h2: 'Mengapa tanggalnya berbeda antarnegara?',
          body: 'Sebagian negara mengandalkan rukyat hilal secara langsung, sementara yang lain menggunakan perhitungan astronomi untuk menandai awal bulan. Hilal Muharram bisa terlihat di satu wilayah sehari lebih awal daripada wilayah lain, sehingga tanggal resmi 1 Muharram dapat berbeda satu hari antarnegara. Hitung mundur ini memakai tanggal Umm al-Qura hasil perhitungan sebagai rujukan; selalu konfirmasikan dengan otoritas keagamaan di negara Anda.' },
        { h2: 'Bagaimana cara kerja hitung mundur ini?',
          body: 'Pengatur waktu langsung menampilkan sisa hari, jam, menit, dan detik menuju perkiraan awal Tahun Baru Hijriah dalam waktu setempat Anda. Tabel tahun mencantumkan tanggal 1 Muharram untuk tahun-tahun mendatang agar Anda dapat merencanakan lebih awal, sementara panel bulan menunjukkan fase bulan saat ini. Setiap tanggal yang ditampilkan adalah perkiraan astronomi dan dapat maju atau mundur satu hari setelah hilal dikonfirmasi secara resmi.' },
        { h2: 'Tahun Baru Hijriah dan kalender qamariah',
          body: 'Tahun Hijriah berlangsung sekitar 354 hari — kira-kira 11 hari lebih pendek daripada tahun Masehi syamsiah yang 365 hari. Karena itu Tahun Baru Hijriah datang sekitar 11 hari lebih awal setiap tahun Masehi, sehingga hitung mundurnya berbeda tiap tahun. Dalam siklus sekitar 33 tahun, 1 Muharram melewati keempat musim, jatuh sekali di musim panas dan sekali di musim dingin.' },
      ],
    },
    es: {
      titles: {
        long:   '¿Cuánto falta para el Año Nuevo hégira {hy}? Cuenta atrás 1 Muharram',
        medium: 'Cuenta atrás del Año Nuevo hégira {hy} | 1 Muharram',
        short:  'Cuenta atrás del Año Nuevo hégira {hy}',
      },
      desc: '¿Cuánto falta para el Año Nuevo hégira {hy}? Cuenta atrás hasta el 1 de Muharram {hy} H con la fecha gregoriana prevista ({gy}).',
      sections: [
        { h2: '¿Cuándo comienza el nuevo año hégira?',
          body: 'El nuevo año hégira comienza el primer día de Muharram, el mes que abre el calendario lunar islámico. Su inicio se determina por el avistamiento del creciente de Muharram una vez que termina Dhul-Hiyya; si no se ve el creciente, Dhul-Hiyya se completa a treinta días. Como los meses lunares duran 29 o 30 días, la fecha gregoriana del Año Nuevo hégira se desplaza un poco cada año. Esta cuenta atrás muestra la fecha gregoriana prevista del 1 de Muharram {hy} H junto con los días restantes.' },
        { h2: '¿Por qué la fecha difiere entre países?',
          body: 'Algunos países se basan en el avistamiento físico del creciente, mientras que otros emplean el cálculo astronómico para marcar el inicio del mes. El creciente de Muharram puede verse en una región un día antes que en otra, de modo que la fecha oficial del 1 de Muharram puede variar un día de un país a otro. Esta cuenta atrás usa la fecha calculada de Umm al-Qura como referencia; confirma siempre con la autoridad religiosa de tu país.' },
        { h2: '¿Cómo funciona esta cuenta atrás?',
          body: 'El temporizador en directo muestra los días, horas, minutos y segundos que faltan para el inicio previsto del nuevo año hégira en tu hora local. La tabla de años enumera las fechas del 1 de Muharram para los próximos años para que planifiques con antelación, mientras que el panel lunar muestra la fase actual de la luna. Cada fecha mostrada es una estimación astronómica y puede adelantarse o atrasarse un día tras la confirmación oficial del creciente.' },
        { h2: 'El Año Nuevo hégira y el calendario lunar',
          body: 'El año hégira dura unos 354 días, alrededor de 11 días menos que el año gregoriano solar de 365 días. Por eso el Año Nuevo hégira llega unos 11 días antes cada año gregoriano, y la cuenta atrás es distinta cada año. A lo largo de un ciclo de unos 33 años, el 1 de Muharram recorre las cuatro estaciones, cayendo una vez en verano y otra en invierno.' },
      ],
    },
    bn: {
      titles: {
        long:   'হিজরি নববর্ষ {hy} আসতে কত দিন? ১ মুহাররমের কাউন্টডাউন',
        medium: 'হিজরি নববর্ষ {hy} কাউন্টডাউন | ১ মুহাররম',
        short:  'হিজরি নববর্ষ {hy} কাউন্টডাউন',
      },
      desc: 'হিজরি নববর্ষ {hy} আসতে আর কত দিন? ১ মুহাররম {hy} হিজরির সরাসরি কাউন্টডাউন, প্রত্যাশিত গ্রেগরিয়ান তারিখ ({gy}) ও আগামী বছরগুলোর তালিকাসহ।',
      sections: [
        { h2: 'নতুন হিজরি বছর কখন শুরু হয়?',
          body: 'নতুন হিজরি বছর শুরু হয় মুহাররমের প্রথম দিন থেকে, যা ইসলামি চান্দ্র পঞ্জিকার প্রথম মাস। জিলহজ শেষ হওয়ার পর মুহাররমের চাঁদ দেখা গেলে এর সূচনা নির্ধারিত হয়; চাঁদ দেখা না গেলে জিলহজ ত্রিশ দিনে পূর্ণ করা হয়। চান্দ্র মাস ২৯ বা ৩০ দিনের হওয়ায় হিজরি নববর্ষের গ্রেগরিয়ান তারিখ প্রতি বছর কিছুটা সরে যায়। এই কাউন্টডাউন ১ মুহাররম {hy} হিজরির প্রত্যাশিত গ্রেগরিয়ান তারিখ ও বাকি দিনগুলো দেখায়।' },
        { h2: 'দেশভেদে তারিখ কেন আলাদা হয়?',
          body: 'কিছু দেশ সরাসরি চাঁদ দেখার উপর নির্ভর করে, আবার কিছু দেশ মাসের সূচনা নির্ধারণে জ্যোতির্বৈজ্ঞানিক হিসাব ব্যবহার করে। মুহাররমের চাঁদ এক অঞ্চলে অন্য অঞ্চলের চেয়ে এক দিন আগে দেখা যেতে পারে, তাই সরকারিভাবে ১ মুহাররমের তারিখ দেশভেদে এক দিন আলাদা হতে পারে। এই কাউন্টডাউন রেফারেন্স হিসেবে উম্মুল কুরার হিসাবকৃত তারিখ ব্যবহার করে; চূড়ান্ত নিশ্চয়তার জন্য নিজ দেশের ধর্মীয় কর্তৃপক্ষের সঙ্গে মিলিয়ে নিন।' },
        { h2: 'এই কাউন্টডাউন কীভাবে কাজ করে?',
          body: 'সরাসরি টাইমারটি আপনার স্থানীয় সময় অনুযায়ী নতুন হিজরি বছরের প্রত্যাশিত সূচনা পর্যন্ত বাকি দিন, ঘণ্টা, মিনিট ও সেকেন্ড দেখায়। বছরের তালিকাটি আগামী কয়েক বছরের ১ মুহাররমের তারিখ দেখায় যাতে আপনি আগেভাগে পরিকল্পনা করতে পারেন, আর চাঁদ-প্যানেলটি বর্তমান চাঁদের দশা দেখায়। প্রদর্শিত প্রতিটি তারিখ একটি জ্যোতির্বৈজ্ঞানিক অনুমান এবং চাঁদ আনুষ্ঠানিকভাবে নিশ্চিত হলে এক দিন আগে-পরে হতে পারে।' },
        { h2: 'হিজরি নববর্ষ ও চান্দ্র পঞ্জিকা',
          body: 'হিজরি বছর প্রায় ৩৫৪ দিনের — অর্থাৎ ৩৬৫ দিনের সৌর গ্রেগরিয়ান বছরের চেয়ে প্রায় ১১ দিন ছোট। এ কারণে হিজরি নববর্ষ প্রতি গ্রেগরিয়ান বছরে প্রায় ১১ দিন আগে আসে, আর কাউন্টডাউন প্রতি বছর ভিন্ন হয়। প্রায় ৩৩ বছরের একটি চক্রে ১ মুহাররম চারটি ঋতুর মধ্য দিয়ে ঘোরে — একবার গ্রীষ্মে আর একবার শীতে পড়ে।' },
      ],
    },
    ms: {
      titles: {
        long:   'Berapa Lama Lagi Tahun Baru Hijrah {hy}? Kira Detik',
        medium: 'Kira Detik Tahun Baru Hijrah {hy} | 1 Muharram',
        short:  'Kira Detik Tahun Baru Hijrah {hy}',
      },
      desc: 'Berapa lama lagi menjelang Tahun Baru Hijrah {hy}? Kira detik ke 1 Muharam {hy} H dengan tarikh Masihi yang dijangka ({gy}).',
      sections: [
        { h2: 'Bilakah tahun Hijrah baharu bermula?',
          body: 'Tahun Hijrah baharu bermula pada hari pertama Muharam, bulan pembuka kalendar qamari Islam. Permulaannya ditentukan oleh rukyah anak bulan Muharam selepas Zulhijah berakhir; jika anak bulan tidak kelihatan, Zulhijah disempurnakan kepada tiga puluh hari. Oleh sebab bulan qamari berlangsung 29 atau 30 hari, tarikh Masihi Tahun Baru Hijrah beralih sedikit setiap tahun. Kira detik ini memaparkan tarikh Masihi yang dijangka bagi 1 Muharam {hy} H berserta baki harinya.' },
        { h2: 'Mengapa tarikh berbeza antara negara?',
          body: 'Sesetengah negara bergantung pada rukyah anak bulan secara fizikal, manakala yang lain menggunakan pengiraan astronomi untuk menanda permulaan bulan. Anak bulan Muharam mungkin kelihatan di satu wilayah sehari lebih awal daripada yang lain, jadi tarikh rasmi 1 Muharam boleh berbeza satu hari antara negara. Kira detik ini menggunakan tarikh Umm al-Qura yang dikira sebagai rujukan; sahkan sentiasa dengan pihak berkuasa agama di negara anda.' },
        { h2: 'Bagaimana kira detik ini berfungsi?',
          body: 'Pemasa langsung memaparkan baki hari, jam, minit dan saat menuju permulaan dijangka Tahun Baru Hijrah mengikut waktu tempatan anda. Jadual tahun menyenaraikan tarikh 1 Muharam bagi tahun-tahun mendatang supaya anda boleh merancang lebih awal, manakala panel bulan menunjukkan fasa bulan semasa. Setiap tarikh yang dipaparkan ialah anggaran astronomi dan boleh maju atau mundur sehari selepas anak bulan disahkan secara rasmi.' },
        { h2: 'Tahun Baru Hijrah dan kalendar qamari',
          body: 'Tahun Hijrah mengandungi kira-kira 354 hari — lebih kurang 11 hari lebih pendek daripada tahun Masihi syamsi yang 365 hari. Oleh itu Tahun Baru Hijrah tiba kira-kira 11 hari lebih awal setiap tahun Masihi, dan kira detiknya berbeza setiap tahun. Dalam kitaran kira-kira 33 tahun, 1 Muharam merentasi keempat-empat musim, jatuh sekali pada musim panas dan sekali pada musim sejuk.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════════
  // RAMADAN — 1 Ramadan (month of fasting)
  // ════════════════════════════════════════════════════════════════════════
  'ramadan': {
    ar: {
      titles: {
        long:   'كم باقي على شهر رمضان {hy}؟ عدّ تنازليّ لبداية الصيام',
        medium: 'كم باقي على رمضان {hy}؟ | عدّ تنازليّ للصيام',
        short:  'العدّ التنازليّ لرمضان {hy}',
      },
      desc: 'كم باقي على شهر رمضان {hy}؟ عدّ تنازليّ مباشر لأوّل أيّام الصيام في رمضان {hy} هـ مع التاريخ الميلاديّ المتوقّع وجدول مواعيد السنوات القادمة.',
      sections: [
        { h2: 'متى يبدأ شهر رمضان؟',
          body: 'يبدأ شهر رمضان بثبوت رؤية هلاله بعد انقضاء شهر شعبان، فإن لم يُرَ الهلال أُكمل شعبان ثلاثين يومًا. ورمضان هو الشهر التاسع في التقويم الهجريّ، وفيه يصوم المسلمون من طلوع الفجر إلى غروب الشمس امتثالًا لأمر الله. وقد خصّ الله هذا الشهر بإنزال القرآن الكريم وبليلة القدر التي هي خير من ألف شهر، فيُكثر المسلمون فيه من قيام الليل وتلاوة القرآن والصدقة ويختمون نهاره بفطورٍ يجمع الأهل. ولأنّ الأشهر القمرية تتراوح بين 29 و30 يومًا، يتغيّر موعد بداية رمضان على التقويم الميلاديّ كلّ عام. ويعرض هذا العدّ التنازليّ التاريخ الميلاديّ المتوقّع لأوّل أيّام رمضان {hy} هـ مع الأيّام المتبقّية حتّى ذلك اليوم.' },
        { h2: 'لماذا يختلف موعد رمضان بين الدول؟',
          body: 'تعتمد بعض الدول على رؤية هلال رمضان بالعين المجرّدة، بينما تعتمد دول أخرى على الحساب الفلكيّ لتحديد بداية الشهر. وقد يُرى الهلال في منطقة قبل أخرى بيوم واحد، فيبدأ الصيام رسميًّا في بلد قبل آخر بمقدار يوم. ويعتمد هذا العدّ التنازليّ تاريخ تقويم أمّ القرى الحسابيّ مرجعًا تقديريًّا، ويبقى التأكيد النهائيّ لما تعلنه الجهة الشرعية في بلدك، فلا تثريب إن وجدت فارق يوم بين بلدك وما يُعرض هنا. ويبقى الأصل أنّ شهر الصيام واحد تشترك فيه الأمّة جمعاء، وإن تفاوتت ساعة بدايته بين المشارق والمغارب.' },
        { h2: 'كيف يعمل هذا العدّ التنازليّ؟',
          body: 'يعرض المؤقّت المباشر الأيّام والساعات والدقائق والثواني المتبقّية حتّى بداية رمضان المتوقّعة بتوقيت بلدك. ويُدرِج جدول السنوات مواعيد بداية رمضان للأعوام القادمة كي تخطّط للصيام والعبادة مسبقًا، بينما تُظهر اللوحة القمرية طور القمر الحاليّ. وجميع التواريخ المعروضة تقديريّة محسوبة فلكيًّا، وقد تتقدّم أو تتأخّر يومًا واحدًا حسب ثبوت رؤية الهلال رسميًّا.' },
        { h2: 'رمضان والتقويم القمريّ',
          body: 'يقع رمضان في الشهر التاسع من السنة الهجرية القمرية التي تبلغ نحو 354 يومًا، أي أقصر بنحو 11 يومًا من السنة الميلادية الشمسية. ولهذا يتقدّم رمضان نحو 11 يومًا كلّ عام ميلاديّ، فيمرّ عبر فصول السنة جميعها على مدى نحو 33 عامًا. ولذلك تطول ساعات الصيام أو تقصر تبعًا للفصل الذي يقع فيه رمضان وموقعك على الأرض، فيصوم أهل الشمال نهارًا طويلًا في الصيف وقصيرًا في الشتاء. ولهذا تفيدك معرفة موعد رمضان مبكّرًا في تنظيم مواعيد السحور والإفطار والعمل والدراسة، وفي الاستعداد روحيًّا وبدنيًّا قبل دخول الشهر الكريم بوقتٍ كافٍ.' },
      ],
    },
    en: {
      titles: {
        long:   'How Long Until Ramadan {hy}? Countdown to the Fasting Month',
        medium: 'Ramadan {hy} Countdown | Days Until the Fasting Month',
        short:  'Ramadan {hy} Countdown',
      },
      desc: 'How long until Ramadan {hy}? A live countdown to the first day of fasting in Ramadan {hy} AH with the expected Gregorian date ({gy}) and upcoming Ramadan dates.',
      sections: [
        { h2: 'When does Ramadan begin?',
          body: 'Ramadan begins once the crescent moon is sighted after the month of Shaban ends; if the crescent is not seen, Shaban is completed as thirty days. Ramadan is the ninth month of the Hijri calendar, and throughout it Muslims fast from dawn until sunset. Because lunar months last 29 or 30 days, the Gregorian start date of Ramadan shifts a little every year. This countdown shows the expected Gregorian date for the first day of Ramadan {hy} AH along with the days remaining.' },
        { h2: 'Why does the date differ between countries?',
          body: 'Some countries rely on physically sighting the Ramadan crescent, while others use astronomical calculation to mark the start of the month. The crescent may be visible in one region a day earlier than another, so fasting can begin officially a day apart from country to country. This countdown uses the calculated Umm al-Qura date as a reference, so a difference of a day from your own country is normal; always confirm with your local religious authority.' },
        { h2: 'How does this countdown work?',
          body: 'The live timer shows the days, hours, minutes and seconds remaining until the expected start of Ramadan in your local time. The years table lists the start dates of Ramadan for the coming years so you can plan your fast and worship ahead, while the lunar panel shows the current moon phase. Every date displayed is an astronomical estimate and may move a day earlier or later once the crescent is officially confirmed.' },
        { h2: 'Ramadan and the lunar calendar',
          body: 'Ramadan falls in the ninth month of the Hijri lunar year, which is about 354 days — roughly 11 days shorter than the solar Gregorian year. As a result, Ramadan arrives about 11 days earlier each Gregorian year and moves through all the seasons over a cycle of roughly 33 years. This is why the length of the daily fast grows longer or shorter depending on the season in which Ramadan falls and your location on Earth.' },
      ],
    },
    fr: {
      titles: {
        long:   'Combien de jours avant le Ramadan {hy} ? Compte à rebours',
        medium: 'Ramadan {hy} | Compte à rebours du mois de jeûne',
        short:  'Compte à rebours du Ramadan {hy}',
      },
      desc: 'Combien de jours avant le Ramadan {hy} ? Compte à rebours en direct vers le premier jour de jeûne du Ramadan {hy} H, avec la date grégorienne prévue ({gy}).',
      sections: [
        { h2: 'Quand commence le Ramadan ?',
          body: 'Le Ramadan commence dès que le croissant de lune est observé après la fin du mois de Chaabane ; si le croissant n’est pas vu, Chaabane est complété à trente jours. Le Ramadan est le neuvième mois du calendrier hégirien, et tout au long de ce mois les musulmans jeûnent de l’aube au coucher du soleil. Comme les mois lunaires durent 29 ou 30 jours, la date grégorienne du début du Ramadan se décale légèrement chaque année. Ce compte à rebours indique la date grégorienne prévue du premier jour du Ramadan {hy} H ainsi que les jours restants.' },
        { h2: 'Pourquoi la date diffère-t-elle selon les pays ?',
          body: 'Certains pays se fondent sur l’observation physique du croissant du Ramadan, tandis que d’autres utilisent le calcul astronomique pour marquer le début du mois. Le croissant peut être visible un jour plus tôt dans une région que dans une autre, si bien que le jeûne peut commencer officiellement à un jour d’écart d’un pays à l’autre. Ce compte à rebours utilise la date calculée d’Oumm al-Qoura comme référence ; un écart d’un jour avec votre pays est donc normal, confirmez toujours auprès de votre autorité religieuse.' },
        { h2: 'Comment fonctionne ce compte à rebours ?',
          body: 'Le minuteur en direct affiche les jours, heures, minutes et secondes restant avant le début prévu du Ramadan, à votre heure locale. Le tableau des années indique les dates de début du Ramadan pour les prochaines années afin de préparer votre jeûne à l’avance, tandis que le panneau lunaire montre la phase actuelle de la lune. Chaque date affichée est une estimation astronomique et peut avancer ou reculer d’un jour après la confirmation officielle du croissant.' },
        { h2: 'Le Ramadan et le calendrier lunaire',
          body: 'Le Ramadan tombe au neuvième mois de l’année hégirienne lunaire, qui compte environ 354 jours, soit à peu près 11 jours de moins que l’année grégorienne solaire. C’est pourquoi le Ramadan arrive environ 11 jours plus tôt chaque année grégorienne et traverse toutes les saisons sur un cycle d’environ 33 ans. C’est aussi pourquoi la durée du jeûne quotidien s’allonge ou se raccourcit selon la saison du Ramadan et votre position sur la Terre.' },
      ],
    },
    tr: {
      titles: {
        long:   'Ramazan {hy} için Geri Sayım | Oruç Ayına Kaç Gün Kaldı?',
        medium: 'Ramazan {hy} Geri Sayımı | Oruç Ayına Kalan',
        short:  'Ramazan {hy} Geri Sayımı',
      },
      desc: 'Ramazan {hy} için geri sayım. Ramazan {hy} H orucunun ilk gününe kalan süreyi, beklenen miladi tarihi ({gy}) ve gelecek yılların tablosunu birlikte görün.',
      sections: [
        { h2: 'Ramazan ne zaman başlar?',
          body: 'Ramazan, Şaban ayı sona erdikten sonra hilalin görülmesiyle başlar; hilal görülmezse Şaban otuz güne tamamlanır. Ramazan, hicri takvimin dokuzuncu ayıdır ve bu ay boyunca Müslümanlar tan yerinin ağarmasından gün batımına kadar oruç tutar. Kameri aylar 29 veya 30 gün sürdüğü için Ramazan’ın başladığı miladi tarih her yıl biraz kayar. Bu geri sayım, Ramazan {hy} H ilk günü için beklenen miladi tarihi ve o güne kalan günleri gösterir.' },
        { h2: 'Tarih ülkeden ülkeye neden değişir?',
          body: 'Bazı ülkeler Ramazan hilalini gözle görmeye dayanırken, bazıları ayın başlangıcını belirlemek için astronomik hesabı kullanır. Hilal bir bölgede diğerinden bir gün önce görülebilir; bu yüzden oruç resmî olarak ülkeden ülkeye bir gün arayla başlayabilir. Bu geri sayım referans olarak hesaplanmış Ümmülkura tarihini kullanır, dolayısıyla kendi ülkenizle bir günlük fark olması olağandır; kesin bilgi için yerel dinî mercie başvurun.' },
        { h2: 'Bu geri sayım nasıl çalışır?',
          body: 'Canlı sayaç, Ramazan’ın beklenen başlangıcına yerel saatinizle kalan gün, saat, dakika ve saniyeyi gösterir. Yıllar tablosu, orucunuzu ve ibadetinizi önceden planlayabilmeniz için önümüzdeki yılların Ramazan başlangıç tarihlerini listeler; ay paneli ise mevcut ay evresini gösterir. Görüntülenen her tarih astronomik bir tahmindir ve hilal resmen doğrulandığında bir gün öne ya da geriye kayabilir.' },
        { h2: 'Ramazan ve kameri takvim',
          body: 'Ramazan, yaklaşık 354 gün olan hicri kameri yılın dokuzuncu ayına denk gelir; bu da 365 günlük güneş esaslı miladi yıldan yaklaşık 11 gün kısadır. Bu nedenle Ramazan her miladi yılda yaklaşık 11 gün önce gelir ve yaklaşık 33 yıllık bir döngüde tüm mevsimlerden geçer. Bu yüzden günlük orucun süresi, Ramazan’ın denk geldiği mevsime ve yeryüzündeki konumunuza göre uzar ya da kısalır. Bu sayfaya dönerek orucun başlangıcına kalan süreyi önceden takip edebilir ve hazırlığınızı erkenden yapabilirsiniz.' },
      ],
    },
    ur: {
      titles: {
        long:   'رمضان {hy} میں کتنے دن باقی؟ روزوں کے آغاز کی الٹی گنتی',
        medium: 'رمضان {hy} الٹی گنتی | روزوں کا مہینہ',
        short:  'رمضان {hy} الٹی گنتی',
      },
      desc: 'رمضان {hy} میں کتنے دن باقی ہیں؟ رمضان {hy} ہجری کے پہلے روزے کی براہِ راست الٹی گنتی، متوقع میلادی تاریخ ({gy}) اور آنے والے سالوں کے جدول کے ساتھ۔',
      sections: [
        { h2: 'رمضان کب شروع ہوتا ہے؟',
          body: 'رمضان کا آغاز شعبان ختم ہونے کے بعد اس کے چاند کی رویت سے ہوتا ہے؛ اگر چاند نظر نہ آئے تو شعبان کے تیس دن مکمل کر لیے جاتے ہیں۔ رمضان ہجری تقویم کا نواں مہینہ ہے، اور اس پورے مہینے میں مسلمان طلوعِ فجر سے غروبِ آفتاب تک روزہ رکھتے ہیں۔ چونکہ قمری مہینے 29 یا 30 دن کے ہوتے ہیں، اس لیے رمضان کے آغاز کی میلادی تاریخ ہر سال کچھ آگے کھسک جاتی ہے۔ یہ الٹی گنتی رمضان {hy} ہجری کے پہلے دن کی متوقع میلادی تاریخ اور باقی دن دکھاتی ہے۔' },
        { h2: 'مختلف ممالک میں تاریخ کیوں مختلف ہوتی ہے؟',
          body: 'کچھ ممالک رمضان کے چاند کو آنکھ سے دیکھنے پر انحصار کرتے ہیں، جبکہ بعض مہینے کے آغاز کے لیے فلکیاتی حساب استعمال کرتے ہیں۔ چاند ایک خطے میں دوسرے سے ایک دن پہلے نظر آ سکتا ہے، اس لیے روزے کا آغاز سرکاری طور پر ملک بہ ملک ایک دن کے فرق سے ہو سکتا ہے۔ یہ الٹی گنتی بطورِ حوالہ اُمّ القریٰ کی حسابی تاریخ استعمال کرتی ہے، اس لیے آپ کے ملک سے ایک دن کا فرق معمول کی بات ہے؛ حتمی تصدیق اپنے ملک کے دینی ادارے سے کریں۔' },
        { h2: 'یہ الٹی گنتی کیسے کام کرتی ہے؟',
          body: 'براہِ راست ٹائمر آپ کے مقامی وقت کے مطابق رمضان کے متوقع آغاز تک باقی دن، گھنٹے، منٹ اور سیکنڈ دکھاتا ہے۔ سالوں کا جدول آنے والے برسوں میں رمضان کے آغاز کی تاریخیں درج کرتا ہے تاکہ آپ روزے اور عبادت کی پیشگی منصوبہ بندی کر سکیں، جبکہ قمری پینل چاند کا موجودہ مرحلہ دکھاتا ہے۔ ہر دکھائی گئی تاریخ ایک فلکیاتی تخمینہ ہے اور رویت کی سرکاری تصدیق پر ایک دن آگے یا پیچھے ہو سکتی ہے۔' },
        { h2: 'رمضان اور قمری تقویم',
          body: 'رمضان ہجری قمری سال کے نویں مہینے میں آتا ہے، جو تقریباً 354 دن کا ہوتا ہے، یعنی شمسی میلادی سال سے قریباً 11 دن چھوٹا۔ اسی لیے رمضان ہر میلادی سال میں تقریباً 11 دن پہلے آتا ہے اور تقریباً 33 سال کے دور میں تمام موسموں سے گزرتا ہے۔ یہی وجہ ہے کہ روزے کا دورانیہ اُس موسم اور آپ کے جغرافیائی محلِ وقوع کے مطابق بڑھتا یا گھٹتا ہے جس میں رمضان آتا ہے۔' },
      ],
    },
    de: {
      titles: {
        long:   'Ramadan {hy} Countdown | Tage bis zum heiligen Fastenmonat',
        medium: 'Ramadan {hy} Countdown | Beginn des Fastens',
        short:  'Ramadan {hy} Countdown',
      },
      desc: 'Wie lange bis Ramadan {hy}? Live-Countdown zum ersten Fastentag im Ramadan {hy} AH mit dem erwarteten gregorianischen Datum ({gy}).',
      sections: [
        { h2: 'Wann beginnt der Ramadan?',
          body: 'Der Ramadan beginnt, sobald die Mondsichel nach dem Ende des Monats Schaban gesichtet wird; wird die Sichel nicht gesehen, wird Schaban auf dreißig Tage vervollständigt. Ramadan ist der neunte Monat des Hidschri-Kalenders, und den ganzen Monat über fasten Muslime von der Morgendämmerung bis zum Sonnenuntergang. Da Mondmonate 29 oder 30 Tage dauern, verschiebt sich das gregorianische Startdatum des Ramadan jedes Jahr ein wenig. Dieser Countdown zeigt das erwartete gregorianische Datum für den ersten Tag des Ramadan {hy} AH sowie die verbleibenden Tage.' },
        { h2: 'Warum unterscheidet sich das Datum je nach Land?',
          body: 'Manche Länder verlassen sich auf die physische Sichtung der Ramadan-Sichel, andere nutzen die astronomische Berechnung, um den Monatsbeginn festzulegen. Die Sichel kann in einer Region einen Tag früher sichtbar sein als in einer anderen, sodass das Fasten offiziell um einen Tag versetzt beginnen kann. Dieser Countdown verwendet das berechnete Umm-al-Qura-Datum als Richtwert; eine Abweichung von einem Tag zu Ihrem Land ist daher normal, bestätigen Sie es stets bei Ihrer religiösen Autorität.' },
        { h2: 'Wie funktioniert dieser Countdown?',
          body: 'Der Live-Timer zeigt die Tage, Stunden, Minuten und Sekunden bis zum erwarteten Beginn des Ramadan in Ihrer Ortszeit. Die Jahrestabelle listet die Anfangsdaten des Ramadan für die kommenden Jahre auf, damit Sie Fasten und Gottesdienst vorausplanen können, während das Mondpanel die aktuelle Mondphase zeigt. Jedes angezeigte Datum ist eine astronomische Schätzung und kann sich nach der offiziellen Bestätigung der Sichel um einen Tag verschieben.' },
        { h2: 'Ramadan und der Mondkalender',
          body: 'Ramadan fällt in den neunten Monat des Hidschri-Mondjahres, das etwa 354 Tage zählt – rund 11 Tage kürzer als das gregorianische Sonnenjahr. Daher beginnt der Ramadan jedes gregorianische Jahr etwa 11 Tage früher und wandert über einen Zyklus von rund 33 Jahren durch alle Jahreszeiten. Deshalb wird die tägliche Fastenzeit je nach Jahreszeit des Ramadan und Ihrem Standort auf der Erde länger oder kürzer.' },
      ],
    },
    id: {
      titles: {
        long:   'Berapa Lama Lagi Ramadan {hy}? Hitung Mundur Awal Puasa',
        medium: 'Hitung Mundur Ramadan {hy} | Bulan Puasa',
        short:  'Hitung Mundur Ramadan {hy}',
      },
      desc: 'Berapa lama lagi menuju Ramadan {hy}? Hitung mundur langsung ke hari pertama puasa Ramadan {hy} H dengan tanggal Masehi yang diperkirakan ({gy}).',
      sections: [
        { h2: 'Kapan Ramadan dimulai?',
          body: 'Ramadan dimulai setelah hilal terlihat ketika bulan Syaban berakhir; jika hilal tidak terlihat, Syaban disempurnakan menjadi tiga puluh hari. Ramadan adalah bulan kesembilan dalam kalender Hijriah, dan sepanjang bulan ini umat Islam berpuasa dari terbit fajar hingga terbenam matahari. Karena bulan qamariah berlangsung 29 atau 30 hari, tanggal Masehi awal Ramadan bergeser sedikit setiap tahun. Hitung mundur ini menampilkan tanggal Masehi yang diperkirakan untuk hari pertama Ramadan {hy} H beserta sisa harinya.' },
        { h2: 'Mengapa tanggalnya berbeda antarnegara?',
          body: 'Sebagian negara mengandalkan rukyat hilal Ramadan secara langsung, sementara yang lain menggunakan perhitungan astronomi untuk menandai awal bulan. Hilal bisa terlihat di satu wilayah sehari lebih awal daripada wilayah lain, sehingga puasa dapat dimulai secara resmi dengan selisih satu hari antarnegara. Hitung mundur ini memakai tanggal Umm al-Qura hasil perhitungan sebagai rujukan, jadi selisih satu hari dengan negara Anda adalah hal biasa; selalu konfirmasikan dengan otoritas keagamaan setempat.' },
        { h2: 'Bagaimana cara kerja hitung mundur ini?',
          body: 'Pengatur waktu langsung menampilkan sisa hari, jam, menit, dan detik menuju perkiraan awal Ramadan dalam waktu setempat Anda. Tabel tahun mencantumkan tanggal awal Ramadan untuk tahun-tahun mendatang agar Anda dapat merencanakan puasa dan ibadah lebih awal, sementara panel bulan menunjukkan fase bulan saat ini. Setiap tanggal yang ditampilkan adalah perkiraan astronomi dan dapat maju atau mundur satu hari setelah hilal dikonfirmasi secara resmi.' },
        { h2: 'Ramadan dan kalender qamariah',
          body: 'Ramadan jatuh pada bulan kesembilan tahun Hijriah qamariah yang berjumlah sekitar 354 hari — kira-kira 11 hari lebih pendek daripada tahun Masehi syamsiah. Karena itu Ramadan datang sekitar 11 hari lebih awal setiap tahun Masehi dan melewati seluruh musim dalam siklus sekitar 33 tahun. Inilah sebabnya durasi puasa harian menjadi lebih panjang atau lebih pendek tergantung musim saat Ramadan jatuh dan lokasi Anda di bumi.' },
      ],
    },
    es: {
      titles: {
        long:   '¿Cuánto falta para el Ramadán {hy}? Cuenta atrás del ayuno',
        medium: 'Cuenta atrás del Ramadán {hy} | Mes de ayuno',
        short:  'Cuenta atrás del Ramadán {hy}',
      },
      desc: '¿Cuánto falta para el Ramadán {hy}? Cuenta atrás en directo hasta el primer día de ayuno del Ramadán {hy} H con la fecha gregoriana prevista ({gy}).',
      sections: [
        { h2: '¿Cuándo comienza el Ramadán?',
          body: 'El Ramadán comienza cuando se avista el creciente de luna tras finalizar el mes de Shaabán; si no se ve el creciente, Shaabán se completa a treinta días. El Ramadán es el noveno mes del calendario hégira, y durante todo el mes los musulmanes ayunan desde el alba hasta la puesta del sol. Como los meses lunares duran 29 o 30 días, la fecha gregoriana del inicio del Ramadán se desplaza un poco cada año. Esta cuenta atrás muestra la fecha gregoriana prevista del primer día del Ramadán {hy} H junto con los días restantes.' },
        { h2: '¿Por qué la fecha difiere entre países?',
          body: 'Algunos países se basan en el avistamiento físico del creciente del Ramadán, mientras que otros emplean el cálculo astronómico para marcar el inicio del mes. El creciente puede verse en una región un día antes que en otra, de modo que el ayuno puede comenzar oficialmente con un día de diferencia de un país a otro. Esta cuenta atrás usa la fecha calculada de Umm al-Qura como referencia, así que una diferencia de un día con tu país es normal; confirma siempre con tu autoridad religiosa.' },
        { h2: '¿Cómo funciona esta cuenta atrás?',
          body: 'El temporizador en directo muestra los días, horas, minutos y segundos que faltan para el inicio previsto del Ramadán en tu hora local. La tabla de años enumera las fechas de inicio del Ramadán para los próximos años para que planifiques tu ayuno y tu culto con antelación, mientras que el panel lunar muestra la fase actual de la luna. Cada fecha mostrada es una estimación astronómica y puede adelantarse o atrasarse un día tras la confirmación oficial del creciente.' },
        { h2: 'El Ramadán y el calendario lunar',
          body: 'El Ramadán cae en el noveno mes del año hégira lunar, que dura unos 354 días, alrededor de 11 días menos que el año gregoriano solar. Por eso el Ramadán llega unos 11 días antes cada año gregoriano y recorre todas las estaciones a lo largo de un ciclo de unos 33 años. Esta es la razón por la que la duración del ayuno diario se alarga o se acorta según la estación en que cae el Ramadán y tu ubicación en la Tierra.' },
      ],
    },
    bn: {
      titles: {
        long:   'রমজান {hy} আসতে আর কত দিন? রোজা শুরুর লাইভ কাউন্টডাউন',
        medium: 'রমজান {hy} কাউন্টডাউন | রোজার মাস',
        short:  'রমজান {hy} কাউন্টডাউন',
      },
      desc: 'রমজান {hy} আসতে আর কত দিন? রমজান {hy} হিজরির প্রথম রোজার সরাসরি কাউন্টডাউন, প্রত্যাশিত গ্রেগরিয়ান তারিখ ({gy}) ও আগামী বছরগুলোর তালিকাসহ।',
      sections: [
        { h2: 'রমজান কখন শুরু হয়?',
          body: 'শাবান মাস শেষ হওয়ার পর চাঁদ দেখা গেলে রমজান শুরু হয়; চাঁদ দেখা না গেলে শাবান ত্রিশ দিনে পূর্ণ করা হয়। রমজান হিজরি পঞ্জিকার নবম মাস, আর এই পুরো মাস জুড়ে মুসলিমরা ভোর থেকে সূর্যাস্ত পর্যন্ত রোজা রাখেন। চান্দ্র মাস ২৯ বা ৩০ দিনের হওয়ায় রমজান শুরুর গ্রেগরিয়ান তারিখ প্রতি বছর কিছুটা সরে যায়। এই কাউন্টডাউন রমজান {hy} হিজরির প্রথম দিনের প্রত্যাশিত গ্রেগরিয়ান তারিখ ও বাকি দিনগুলো দেখায়।' },
        { h2: 'দেশভেদে তারিখ কেন আলাদা হয়?',
          body: 'কিছু দেশ রমজানের চাঁদ সরাসরি দেখার উপর নির্ভর করে, আবার কিছু দেশ মাসের সূচনা নির্ধারণে জ্যোতির্বৈজ্ঞানিক হিসাব ব্যবহার করে। চাঁদ এক অঞ্চলে অন্য অঞ্চলের চেয়ে এক দিন আগে দেখা যেতে পারে, তাই রোজা সরকারিভাবে দেশভেদে এক দিন আগে-পরে শুরু হতে পারে। এই কাউন্টডাউন রেফারেন্স হিসেবে উম্মুল কুরার হিসাবকৃত তারিখ ব্যবহার করে, তাই আপনার দেশের সঙ্গে এক দিনের পার্থক্য স্বাভাবিক; চূড়ান্ত নিশ্চয়তার জন্য স্থানীয় ধর্মীয় কর্তৃপক্ষের সঙ্গে মিলিয়ে নিন।' },
        { h2: 'এই কাউন্টডাউন কীভাবে কাজ করে?',
          body: 'সরাসরি টাইমারটি আপনার স্থানীয় সময় অনুযায়ী রমজানের প্রত্যাশিত সূচনা পর্যন্ত বাকি দিন, ঘণ্টা, মিনিট ও সেকেন্ড দেখায়। বছরের তালিকাটি আগামী কয়েক বছরে রমজান শুরুর তারিখ দেখায় যাতে আপনি রোজা ও ইবাদতের আগেভাগে পরিকল্পনা করতে পারেন, আর চাঁদ-প্যানেলটি বর্তমান চাঁদের দশা দেখায়। প্রদর্শিত প্রতিটি তারিখ একটি জ্যোতির্বৈজ্ঞানিক অনুমান এবং চাঁদ আনুষ্ঠানিকভাবে নিশ্চিত হলে এক দিন আগে-পরে হতে পারে।' },
        { h2: 'রমজান ও চান্দ্র পঞ্জিকা',
          body: 'রমজান হিজরি চান্দ্র বছরের নবম মাসে পড়ে, যা প্রায় ৩৫৪ দিনের — সৌর গ্রেগরিয়ান বছরের চেয়ে প্রায় ১১ দিন ছোট। এ কারণে রমজান প্রতি গ্রেগরিয়ান বছরে প্রায় ১১ দিন আগে আসে এবং প্রায় ৩৩ বছরের চক্রে সব ঋতুর মধ্য দিয়ে ঘোরে। এ কারণেই দৈনিক রোজার সময়কাল রমজান যে ঋতুতে পড়ে এবং পৃথিবীতে আপনার অবস্থান অনুযায়ী দীর্ঘ বা সংক্ষিপ্ত হয়।' },
      ],
    },
    ms: {
      titles: {
        long:   'Berapa Lama Lagi Ramadan {hy}? Kira Detik Mula Puasa',
        medium: 'Kira Detik Ramadan {hy} | Bulan Puasa',
        short:  'Kira Detik Ramadan {hy}',
      },
      desc: 'Berapa lama lagi menjelang Ramadan {hy}? Kira detik secara langsung ke hari pertama puasa Ramadan {hy} H dengan tarikh Masihi yang dijangka ({gy}).',
      sections: [
        { h2: 'Bilakah Ramadan bermula?',
          body: 'Ramadan bermula sebaik anak bulan kelihatan selepas bulan Syaban berakhir; jika anak bulan tidak kelihatan, Syaban disempurnakan kepada tiga puluh hari. Ramadan ialah bulan kesembilan kalendar Hijrah, dan sepanjang bulan ini umat Islam berpuasa dari terbit fajar hingga terbenam matahari. Oleh sebab bulan qamari berlangsung 29 atau 30 hari, tarikh Masihi permulaan Ramadan beralih sedikit setiap tahun. Kira detik ini memaparkan tarikh Masihi yang dijangka bagi hari pertama Ramadan {hy} H berserta baki harinya.' },
        { h2: 'Mengapa tarikh berbeza antara negara?',
          body: 'Sesetengah negara bergantung pada rukyah anak bulan Ramadan secara fizikal, manakala yang lain menggunakan pengiraan astronomi untuk menanda permulaan bulan. Anak bulan mungkin kelihatan di satu wilayah sehari lebih awal daripada yang lain, jadi puasa boleh bermula secara rasmi dengan beza satu hari antara negara. Kira detik ini menggunakan tarikh Umm al-Qura yang dikira sebagai rujukan, jadi beza satu hari dengan negara anda adalah perkara biasa; sahkan sentiasa dengan pihak berkuasa agama tempatan.' },
        { h2: 'Bagaimana kira detik ini berfungsi?',
          body: 'Pemasa langsung memaparkan baki hari, jam, minit dan saat menuju permulaan dijangka Ramadan mengikut waktu tempatan anda. Jadual tahun menyenaraikan tarikh permulaan Ramadan bagi tahun-tahun mendatang supaya anda boleh merancang puasa dan ibadah lebih awal, manakala panel bulan menunjukkan fasa bulan semasa. Setiap tarikh yang dipaparkan ialah anggaran astronomi dan boleh maju atau mundur sehari selepas anak bulan disahkan secara rasmi.' },
        { h2: 'Ramadan dan kalendar qamari',
          body: 'Ramadan jatuh pada bulan kesembilan tahun Hijrah qamari yang berjumlah kira-kira 354 hari — lebih kurang 11 hari lebih pendek daripada tahun Masihi syamsi. Oleh itu Ramadan tiba kira-kira 11 hari lebih awal setiap tahun Masihi dan merentasi semua musim dalam kitaran kira-kira 33 tahun. Inilah sebabnya tempoh puasa harian menjadi lebih panjang atau lebih pendek bergantung pada musim Ramadan jatuh dan lokasi anda di bumi.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════════
  // EID AL-FITR — 1 Shawwal (feast that ends Ramadan)
  // ════════════════════════════════════════════════════════════════════════
  'eid-fitr': {
    ar: {
      titles: {
        long:   'كم باقي على عيد الفطر {hy}؟ عدّ تنازليّ لأوّل شوّال',
        medium: 'كم باقي على عيد الفطر {hy}؟ | عدّ تنازليّ',
        short:  'العدّ التنازليّ لعيد الفطر {hy}',
      },
      desc: 'كم باقي على عيد الفطر {hy}؟ عدّ تنازليّ مباشر لأوّل أيّام شوّال {hy} هـ بعد انقضاء رمضان، مع التاريخ الميلاديّ المتوقّع وجدول السنوات القادمة.',
      sections: [
        { h2: 'متى يأتي عيد الفطر؟',
          body: 'يأتي عيد الفطر في أوّل يوم من شهر شوّال، عقب انقضاء شهر رمضان وثبوت رؤية هلال شوّال، فإن لم يُرَ الهلال أُكمل رمضان ثلاثين يومًا وكان العيد في اليوم التالي. ويُصلّي المسلمون صلاة العيد ويُخرجون زكاة الفطر قبلها فرحًا بإتمام الصيام. ويبدأ المسلمون عيدهم بالتكبير من ليلته، ويتبادلون التهاني والزيارات وصلة الأرحام، ويُدخلون الفرح على الفقراء والأطفال بالكسوة والطعام، فيكون يومًا للشكر على إتمام عبادة الصيام والقيام طوال الشهر. ولأنّ الأشهر القمرية تتراوح بين 29 و30 يومًا، يتغيّر موعد العيد على التقويم الميلاديّ كلّ عام. ويعرض هذا العدّ التنازليّ التاريخ الميلاديّ المتوقّع لعيد الفطر {hy} هـ مع الأيّام المتبقّية حتّى ذلك اليوم.' },
        { h2: 'لماذا يختلف موعد عيد الفطر بين الدول؟',
          body: 'تعتمد بعض الدول على رؤية هلال شوّال بالعين المجرّدة، بينما تعتمد دول أخرى على الحساب الفلكيّ لتحديد نهاية رمضان وبداية العيد. وقد يُرى الهلال في منطقة قبل أخرى بيوم واحد، فيُعيّد بلد قبل آخر بمقدار يوم. ويعتمد هذا العدّ التنازليّ تاريخ تقويم أمّ القرى الحسابيّ مرجعًا تقديريًّا، ويبقى التأكيد النهائيّ لما تعلنه الجهة الشرعية في بلدك، فلا غرابة في وجود فارق يوم بين بلد وآخر. والمقصد أن يجتمع الناس على الفرح بإتمام طاعتهم، فاتّبع في عيدك ما تُقرّره الجهة المعتمدة في بلدك.' },
        { h2: 'كيف يعمل هذا العدّ التنازليّ؟',
          body: 'يعرض المؤقّت المباشر الأيّام والساعات والدقائق والثواني المتبقّية حتّى عيد الفطر المتوقّع بتوقيت بلدك. ويُدرِج جدول السنوات مواعيد العيد للأعوام القادمة كي تخطّط للاحتفال والزيارة والسفر مسبقًا، بينما تُظهر اللوحة القمرية طور القمر الحاليّ. وجميع التواريخ المعروضة تقديريّة محسوبة فلكيًّا، وقد تتقدّم أو تتأخّر يومًا واحدًا حسب ثبوت رؤية الهلال رسميًّا.' },
        { h2: 'عيد الفطر والتقويم القمريّ',
          body: 'يقع عيد الفطر في أوّل شوّال، الشهر العاشر من السنة الهجرية القمرية التي تبلغ نحو 354 يومًا، أي أقصر بنحو 11 يومًا من السنة الميلادية الشمسية. ولهذا يتقدّم العيد نحو 11 يومًا كلّ عام ميلاديّ، فيمرّ عبر فصول السنة جميعها على مدى نحو 33 عامًا. ولذلك يتغيّر موعد العيد بالتقويم الميلاديّ من سنة لأخرى ويظلّ بحاجة إلى متابعة سنويّة لضبطه بدقّة. ويساعدك هذا العدّ على معرفة موعد العيد مبكّرًا لتخطيط الإجازة والسفر وزيارة الأهل وتجهيز ما يلزم للاحتفال قبل حلول اليوم بوقتٍ كافٍ.' },
      ],
    },
    en: {
      titles: {
        long:   'How Long Until Eid al-Fitr {hy}? Countdown to 1 Shawwal',
        medium: 'Eid al-Fitr {hy} Countdown | Days Until 1 Shawwal',
        short:  'Eid al-Fitr {hy} Countdown',
      },
      desc: 'How long until Eid al-Fitr {hy}? A live countdown to 1 Shawwal {hy} AH, the feast after Ramadan, with the expected Gregorian date ({gy}) and upcoming Eid dates.',
      sections: [
        { h2: 'When is Eid al-Fitr?',
          body: 'Eid al-Fitr falls on the first day of Shawwal, right after the month of Ramadan ends and the Shawwal crescent is sighted. If the crescent is not seen, Ramadan is completed as thirty days and the feast follows the next day. Muslims pray the Eid prayer and give zakat al-fitr beforehand, celebrating the completion of the fast. Because lunar months last 29 or 30 days, the Gregorian date of Eid shifts a little every year. This countdown shows the expected Gregorian date for Eid al-Fitr {hy} AH along with the days remaining.' },
        { h2: 'Why does the date differ between countries?',
          body: 'Some countries rely on physically sighting the Shawwal crescent, while others use astronomical calculation to mark the end of Ramadan and the start of Eid. The crescent may be visible in one region a day earlier than another, so one country may celebrate a day before another. This countdown uses the calculated Umm al-Qura date as a reference, so a difference of a day between countries is normal; always confirm with your local religious authority.' },
        { h2: 'How does this countdown work?',
          body: 'The live timer shows the days, hours, minutes and seconds remaining until the expected Eid al-Fitr in your local time. The years table lists the dates of Eid for the coming years so you can plan your celebration, visits and travel ahead, while the lunar panel shows the current moon phase. Every date displayed is an astronomical estimate and may move a day earlier or later once the crescent is officially confirmed.' },
        { h2: 'Eid al-Fitr and the lunar calendar',
          body: 'Eid al-Fitr falls on 1 Shawwal, the tenth month of the Hijri lunar year, which is about 354 days — roughly 11 days shorter than the solar Gregorian year. As a result, Eid arrives about 11 days earlier each Gregorian year and moves through all the seasons over a cycle of roughly 33 years. This is why the Gregorian date of Eid changes from one year to the next and needs to be checked each year.' },
      ],
    },
    fr: {
      titles: {
        long:   'Combien de jours avant l’Aïd el-Fitr {hy} ? Compte à rebours',
        medium: 'Aïd el-Fitr {hy} | Compte à rebours du 1er Chawwal',
        short:  'Compte à rebours de l’Aïd el-Fitr {hy}',
      },
      desc: 'Combien de jours avant l’Aïd el-Fitr {hy} ? Compte à rebours vers le 1er Chawwal {hy} H, la fête de fin du Ramadan, avec la date grégorienne prévue ({gy}).',
      sections: [
        { h2: 'Quand a lieu l’Aïd el-Fitr ?',
          body: 'L’Aïd el-Fitr tombe le premier jour de Chawwal, juste après la fin du mois de Ramadan et l’observation du croissant de Chawwal. Si le croissant n’est pas vu, le Ramadan est complété à trente jours et la fête a lieu le lendemain. Les musulmans accomplissent la prière de l’Aïd et donnent la zakat al-fitr auparavant, célébrant l’achèvement du jeûne. Comme les mois lunaires durent 29 ou 30 jours, la date grégorienne de l’Aïd se décale légèrement chaque année. Ce compte à rebours indique la date grégorienne prévue de l’Aïd el-Fitr {hy} H ainsi que les jours restants.' },
        { h2: 'Pourquoi la date diffère-t-elle selon les pays ?',
          body: 'Certains pays se fondent sur l’observation physique du croissant de Chawwal, tandis que d’autres utilisent le calcul astronomique pour marquer la fin du Ramadan et le début de l’Aïd. Le croissant peut être visible un jour plus tôt dans une région que dans une autre, si bien qu’un pays peut célébrer un jour avant un autre. Ce compte à rebours utilise la date calculée d’Oumm al-Qoura comme référence ; un écart d’un jour entre pays est donc normal, confirmez toujours auprès de votre autorité religieuse.' },
        { h2: 'Comment fonctionne ce compte à rebours ?',
          body: 'Le minuteur en direct affiche les jours, heures, minutes et secondes restant avant l’Aïd el-Fitr prévu, à votre heure locale. Le tableau des années indique les dates de l’Aïd pour les prochaines années afin de préparer votre fête, vos visites et vos voyages à l’avance, tandis que le panneau lunaire montre la phase actuelle de la lune. Chaque date affichée est une estimation astronomique et peut avancer ou reculer d’un jour après la confirmation officielle du croissant.' },
        { h2: 'L’Aïd el-Fitr et le calendrier lunaire',
          body: 'L’Aïd el-Fitr tombe le 1er Chawwal, dixième mois de l’année hégirienne lunaire, qui compte environ 354 jours, soit à peu près 11 jours de moins que l’année grégorienne solaire. C’est pourquoi l’Aïd arrive environ 11 jours plus tôt chaque année grégorienne et traverse toutes les saisons sur un cycle d’environ 33 ans. C’est aussi pourquoi la date grégorienne de l’Aïd change d’une année à l’autre et doit être vérifiée chaque année.' },
      ],
    },
    tr: {
      titles: {
        long:   'Ramazan Bayramı {hy} için Geri Sayım | 1 Şevval’e Kaç Gün?',
        medium: 'Ramazan Bayramı {hy} Geri Sayımı | 1 Şevval',
        short:  'Ramazan Bayramı {hy} Geri Sayımı',
      },
      desc: 'Ramazan Bayramı {hy} için geri sayım. Ramazan’ı bitiren bayram olan 1 Şevval {hy} H gününe kalan süreyi ve beklenen miladi tarihi ({gy}) görün.',
      sections: [
        { h2: 'Ramazan Bayramı ne zaman?',
          body: 'Ramazan Bayramı, Ramazan ayı sona erip Şevval hilali görüldükten hemen sonra, Şevval’in ilk günü kutlanır. Hilal görülmezse Ramazan otuz güne tamamlanır ve bayram ertesi gün olur. Müslümanlar bayram namazını kılar ve öncesinde fıtır sadakasını verir, orucun tamamlanmasını sevinçle karşılar. Kameri aylar 29 veya 30 gün sürdüğü için bayramın miladi tarihi her yıl biraz kayar. Bu geri sayım, Ramazan Bayramı {hy} H için beklenen miladi tarihi ve o güne kalan günleri gösterir.' },
        { h2: 'Tarih ülkeden ülkeye neden değişir?',
          body: 'Bazı ülkeler Şevval hilalini gözle görmeye dayanırken, bazıları Ramazan’ın bitişini ve bayramın başlangıcını belirlemek için astronomik hesabı kullanır. Hilal bir bölgede diğerinden bir gün önce görülebilir; bu yüzden bir ülke diğerinden bir gün önce bayram yapabilir. Bu geri sayım referans olarak hesaplanmış Ümmülkura tarihini kullanır, dolayısıyla ülkeler arasında bir günlük fark olması olağandır; kesin bilgi için yerel dinî mercie başvurun.' },
        { h2: 'Bu geri sayım nasıl çalışır?',
          body: 'Canlı sayaç, beklenen Ramazan Bayramı’na yerel saatinizle kalan gün, saat, dakika ve saniyeyi gösterir. Yıllar tablosu, kutlama, ziyaret ve seyahatinizi önceden planlayabilmeniz için önümüzdeki yılların bayram tarihlerini listeler; ay paneli ise mevcut ay evresini gösterir. Görüntülenen her tarih astronomik bir tahmindir ve hilal resmen doğrulandığında bir gün öne ya da geriye kayabilir.' },
        { h2: 'Ramazan Bayramı ve kameri takvim',
          body: 'Ramazan Bayramı, hicri kameri yılın onuncu ayı olan Şevval’in ilk gününe denk gelir; bu yıl yaklaşık 354 gündür, yani 365 günlük güneş esaslı miladi yıldan yaklaşık 11 gün kısadır. Bu nedenle bayram her miladi yılda yaklaşık 11 gün önce gelir ve yaklaşık 33 yıllık bir döngüde tüm mevsimlerden geçer. Bu yüzden bayramın miladi tarihi yıldan yıla değişir ve her yıl yeniden kontrol edilmesi gerekir.' },
      ],
    },
    ur: {
      titles: {
        long:   'عید الفطر {hy} میں کتنے دن باقی؟ 1 شوّال کی الٹی گنتی',
        medium: 'عید الفطر {hy} الٹی گنتی | 1 شوّال',
        short:  'عید الفطر {hy} الٹی گنتی',
      },
      desc: 'عید الفطر {hy} میں کتنے دن باقی ہیں؟ رمضان کے بعد آنے والی عید یعنی 1 شوّال {hy} ہجری کی براہِ راست الٹی گنتی، متوقع میلادی تاریخ ({gy}) کے ساتھ۔',
      sections: [
        { h2: 'عید الفطر کب ہوتی ہے؟',
          body: 'عید الفطر شوّال کی پہلی تاریخ کو ہوتی ہے، رمضان ختم ہونے اور شوّال کا چاند نظر آنے کے فوراً بعد۔ اگر چاند نظر نہ آئے تو رمضان کے تیس دن مکمل کر لیے جاتے ہیں اور اگلے دن عید ہوتی ہے۔ مسلمان عید کی نماز ادا کرتے ہیں اور اس سے پہلے صدقۂ فطر دیتے ہیں، روزوں کی تکمیل پر خوشی مناتے ہوئے۔ چونکہ قمری مہینے 29 یا 30 دن کے ہوتے ہیں، عید کی میلادی تاریخ ہر سال کچھ آگے کھسک جاتی ہے۔ یہ الٹی گنتی عید الفطر {hy} ہجری کی متوقع میلادی تاریخ اور باقی دن دکھاتی ہے۔' },
        { h2: 'مختلف ممالک میں تاریخ کیوں مختلف ہوتی ہے؟',
          body: 'کچھ ممالک شوّال کے چاند کو آنکھ سے دیکھنے پر انحصار کرتے ہیں، جبکہ بعض رمضان کے اختتام اور عید کے آغاز کے لیے فلکیاتی حساب استعمال کرتے ہیں۔ چاند ایک خطے میں دوسرے سے ایک دن پہلے نظر آ سکتا ہے، اس لیے ایک ملک دوسرے سے ایک دن پہلے عید منا سکتا ہے۔ یہ الٹی گنتی بطورِ حوالہ اُمّ القریٰ کی حسابی تاریخ استعمال کرتی ہے، اس لیے ممالک کے درمیان ایک دن کا فرق معمول کی بات ہے؛ حتمی تصدیق اپنے ملک کے دینی ادارے سے کریں۔' },
        { h2: 'یہ الٹی گنتی کیسے کام کرتی ہے؟',
          body: 'براہِ راست ٹائمر آپ کے مقامی وقت کے مطابق متوقع عید الفطر تک باقی دن، گھنٹے، منٹ اور سیکنڈ دکھاتا ہے۔ سالوں کا جدول آنے والے برسوں کی عید کی تاریخیں درج کرتا ہے تاکہ آپ جشن، ملاقات اور سفر کی پیشگی منصوبہ بندی کر سکیں، جبکہ قمری پینل چاند کا موجودہ مرحلہ دکھاتا ہے۔ ہر دکھائی گئی تاریخ ایک فلکیاتی تخمینہ ہے اور رویت کی سرکاری تصدیق پر ایک دن آگے یا پیچھے ہو سکتی ہے۔' },
        { h2: 'عید الفطر اور قمری تقویم',
          body: 'عید الفطر 1 شوّال کو آتی ہے، جو ہجری قمری سال کا دسواں مہینہ ہے؛ یہ سال تقریباً 354 دن کا ہوتا ہے، یعنی شمسی میلادی سال سے قریباً 11 دن چھوٹا۔ اسی لیے عید ہر میلادی سال میں تقریباً 11 دن پہلے آتی ہے اور تقریباً 33 سال کے دور میں تمام موسموں سے گزرتی ہے۔ یہی وجہ ہے کہ عید کی میلادی تاریخ ہر سال بدلتی رہتی ہے اور ہر سال اِسے دیکھنا پڑتا ہے۔' },
      ],
    },
    de: {
      titles: {
        long:   'Eid al-Fitr {hy} Countdown | Tage bis zum 1. Schawwal',
        medium: 'Eid al-Fitr {hy} Countdown | 1. Schawwal',
        short:  'Eid al-Fitr {hy} Countdown',
      },
      desc: 'Wie lange bis Eid al-Fitr {hy}? Live-Countdown zum 1. Schawwal {hy} AH, dem Fest am Ende des Ramadan, mit dem erwarteten gregorianischen Datum ({gy}).',
      sections: [
        { h2: 'Wann ist Eid al-Fitr?',
          body: 'Eid al-Fitr fällt auf den ersten Tag des Schawwal, unmittelbar nachdem der Monat Ramadan endet und die Schawwal-Sichel gesichtet wird. Wird die Sichel nicht gesehen, wird Ramadan auf dreißig Tage vervollständigt und das Fest folgt am nächsten Tag. Muslime verrichten das Festgebet und geben zuvor die Zakat al-Fitr, in Freude über den Abschluss des Fastens. Da Mondmonate 29 oder 30 Tage dauern, verschiebt sich das gregorianische Datum des Festes jedes Jahr ein wenig. Dieser Countdown zeigt das erwartete gregorianische Datum für Eid al-Fitr {hy} AH sowie die verbleibenden Tage.' },
        { h2: 'Warum unterscheidet sich das Datum je nach Land?',
          body: 'Manche Länder verlassen sich auf die physische Sichtung der Schawwal-Sichel, andere nutzen die astronomische Berechnung, um das Ende des Ramadan und den Beginn des Festes festzulegen. Die Sichel kann in einer Region einen Tag früher sichtbar sein als in einer anderen, sodass ein Land einen Tag vor einem anderen feiern kann. Dieser Countdown verwendet das berechnete Umm-al-Qura-Datum als Richtwert; eine Abweichung von einem Tag zwischen Ländern ist daher normal, bestätigen Sie es stets bei Ihrer religiösen Autorität.' },
        { h2: 'Wie funktioniert dieser Countdown?',
          body: 'Der Live-Timer zeigt die Tage, Stunden, Minuten und Sekunden bis zum erwarteten Eid al-Fitr in Ihrer Ortszeit. Die Jahrestabelle listet die Daten des Festes für die kommenden Jahre auf, damit Sie Feier, Besuche und Reisen vorausplanen können, während das Mondpanel die aktuelle Mondphase zeigt. Jedes angezeigte Datum ist eine astronomische Schätzung und kann sich nach der offiziellen Bestätigung der Sichel um einen Tag verschieben.' },
        { h2: 'Eid al-Fitr und der Mondkalender',
          body: 'Eid al-Fitr fällt auf den 1. Schawwal, den zehnten Monat des Hidschri-Mondjahres, das etwa 354 Tage zählt – rund 11 Tage kürzer als das gregorianische Sonnenjahr. Daher kommt das Fest jedes gregorianische Jahr etwa 11 Tage früher und wandert über einen Zyklus von rund 33 Jahren durch alle Jahreszeiten. Deshalb ändert sich das gregorianische Datum des Festes von Jahr zu Jahr und sollte jedes Jahr geprüft werden.' },
      ],
    },
    id: {
      titles: {
        long:   'Berapa Lama Lagi Idulfitri {hy}? Hitung Mundur 1 Syawal',
        medium: 'Hitung Mundur Idulfitri {hy} | 1 Syawal',
        short:  'Hitung Mundur Idulfitri {hy}',
      },
      desc: 'Berapa lama lagi menuju Idulfitri {hy}? Hitung mundur langsung ke 1 Syawal {hy} H, hari raya setelah Ramadan, dengan tanggal Masehi yang diperkirakan ({gy}).',
      sections: [
        { h2: 'Kapan Idulfitri?',
          body: 'Idulfitri jatuh pada hari pertama Syawal, tepat setelah bulan Ramadan berakhir dan hilal Syawal terlihat. Jika hilal tidak terlihat, Ramadan disempurnakan menjadi tiga puluh hari dan hari raya jatuh pada keesokan harinya. Umat Islam menunaikan salat Id dan menunaikan zakat fitrah sebelumnya, merayakan selesainya puasa. Karena bulan qamariah berlangsung 29 atau 30 hari, tanggal Masehi Idulfitri bergeser sedikit setiap tahun. Hitung mundur ini menampilkan tanggal Masehi yang diperkirakan untuk Idulfitri {hy} H beserta sisa harinya.' },
        { h2: 'Mengapa tanggalnya berbeda antarnegara?',
          body: 'Sebagian negara mengandalkan rukyat hilal Syawal secara langsung, sementara yang lain menggunakan perhitungan astronomi untuk menandai akhir Ramadan dan awal hari raya. Hilal bisa terlihat di satu wilayah sehari lebih awal daripada wilayah lain, sehingga satu negara dapat berlebaran sehari sebelum yang lain. Hitung mundur ini memakai tanggal Umm al-Qura hasil perhitungan sebagai rujukan, jadi selisih satu hari antarnegara adalah hal biasa; selalu konfirmasikan dengan otoritas keagamaan setempat.' },
        { h2: 'Bagaimana cara kerja hitung mundur ini?',
          body: 'Pengatur waktu langsung menampilkan sisa hari, jam, menit, dan detik menuju perkiraan Idulfitri dalam waktu setempat Anda. Tabel tahun mencantumkan tanggal hari raya untuk tahun-tahun mendatang agar Anda dapat merencanakan perayaan, silaturahmi, dan perjalanan lebih awal, sementara panel bulan menunjukkan fase bulan saat ini. Setiap tanggal yang ditampilkan adalah perkiraan astronomi dan dapat maju atau mundur satu hari setelah hilal dikonfirmasi secara resmi.' },
        { h2: 'Idulfitri dan kalender qamariah',
          body: 'Idulfitri jatuh pada 1 Syawal, bulan kesepuluh tahun Hijriah qamariah yang berjumlah sekitar 354 hari — kira-kira 11 hari lebih pendek daripada tahun Masehi syamsiah. Karena itu hari raya datang sekitar 11 hari lebih awal setiap tahun Masehi dan melewati seluruh musim dalam siklus sekitar 33 tahun. Inilah sebabnya tanggal Masehi Idulfitri berubah dari tahun ke tahun dan perlu diperiksa setiap tahun.' },
      ],
    },
    es: {
      titles: {
        long:   '¿Cuánto falta para el Eid al-Fitr {hy}? Cuenta atrás',
        medium: 'Cuenta atrás del Eid al-Fitr {hy} | 1 de Shawwal',
        short:  'Cuenta atrás del Eid al-Fitr {hy}',
      },
      desc: '¿Cuánto falta para el Eid al-Fitr {hy}? Cuenta atrás hasta el 1 de Shawwal {hy} H, la fiesta tras el Ramadán, con la fecha gregoriana prevista ({gy}).',
      sections: [
        { h2: '¿Cuándo es el Eid al-Fitr?',
          body: 'El Eid al-Fitr cae el primer día de Shawwal, justo después de que termina el mes de Ramadán y se avista el creciente de Shawwal. Si no se ve el creciente, el Ramadán se completa a treinta días y la fiesta llega al día siguiente. Los musulmanes rezan la oración del Eid y dan la zakat al-fitr antes, celebrando la culminación del ayuno. Como los meses lunares duran 29 o 30 días, la fecha gregoriana del Eid se desplaza un poco cada año. Esta cuenta atrás muestra la fecha gregoriana prevista del Eid al-Fitr {hy} H junto con los días restantes.' },
        { h2: '¿Por qué la fecha difiere entre países?',
          body: 'Algunos países se basan en el avistamiento físico del creciente de Shawwal, mientras que otros emplean el cálculo astronómico para marcar el fin del Ramadán y el inicio del Eid. El creciente puede verse en una región un día antes que en otra, de modo que un país puede celebrar un día antes que otro. Esta cuenta atrás usa la fecha calculada de Umm al-Qura como referencia, así que una diferencia de un día entre países es normal; confirma siempre con tu autoridad religiosa.' },
        { h2: '¿Cómo funciona esta cuenta atrás?',
          body: 'El temporizador en directo muestra los días, horas, minutos y segundos que faltan para el Eid al-Fitr previsto en tu hora local. La tabla de años enumera las fechas del Eid para los próximos años para que planifiques la celebración, las visitas y los viajes con antelación, mientras que el panel lunar muestra la fase actual de la luna. Cada fecha mostrada es una estimación astronómica y puede adelantarse o atrasarse un día tras la confirmación oficial del creciente.' },
        { h2: 'El Eid al-Fitr y el calendario lunar',
          body: 'El Eid al-Fitr cae el 1 de Shawwal, el décimo mes del año hégira lunar, que dura unos 354 días, alrededor de 11 días menos que el año gregoriano solar. Por eso el Eid llega unos 11 días antes cada año gregoriano y recorre todas las estaciones a lo largo de un ciclo de unos 33 años. Esta es la razón por la que la fecha gregoriana del Eid cambia de un año a otro y debe consultarse cada año.' },
      ],
    },
    bn: {
      titles: {
        long:   'ঈদুল ফিতর {hy} আসতে কত দিন? ১ শাওয়ালের কাউন্টডাউন',
        medium: 'ঈদুল ফিতর {hy} কাউন্টডাউন | ১ শাওয়াল',
        short:  'ঈদুল ফিতর {hy} কাউন্টডাউন',
      },
      desc: 'ঈদুল ফিতর {hy} আসতে আর কত দিন? রমজানের পরের উৎসব অর্থাৎ ১ শাওয়াল {hy} হিজরির সরাসরি কাউন্টডাউন, প্রত্যাশিত গ্রেগরিয়ান তারিখ ({gy}) সহ।',
      sections: [
        { h2: 'ঈদুল ফিতর কখন হয়?',
          body: 'ঈদুল ফিতর শাওয়াল মাসের প্রথম দিনে হয়, রমজান শেষ হওয়া ও শাওয়ালের চাঁদ দেখার ঠিক পরে। চাঁদ দেখা না গেলে রমজান ত্রিশ দিনে পূর্ণ করা হয় এবং পরদিন ঈদ হয়। মুসলিমরা ঈদের নামাজ আদায় করেন এবং তার আগে যাকাতুল ফিতর দেন, রোজা পূর্ণ হওয়ার আনন্দে। চান্দ্র মাস ২৯ বা ৩০ দিনের হওয়ায় ঈদের গ্রেগরিয়ান তারিখ প্রতি বছর কিছুটা সরে যায়। এই কাউন্টডাউন ঈদুল ফিতর {hy} হিজরির প্রত্যাশিত গ্রেগরিয়ান তারিখ ও বাকি দিনগুলো দেখায়।' },
        { h2: 'দেশভেদে তারিখ কেন আলাদা হয়?',
          body: 'কিছু দেশ শাওয়ালের চাঁদ সরাসরি দেখার উপর নির্ভর করে, আবার কিছু দেশ রমজানের সমাপ্তি ও ঈদের সূচনা নির্ধারণে জ্যোতির্বৈজ্ঞানিক হিসাব ব্যবহার করে। চাঁদ এক অঞ্চলে অন্য অঞ্চলের চেয়ে এক দিন আগে দেখা যেতে পারে, তাই এক দেশ অন্য দেশের চেয়ে এক দিন আগে ঈদ উদযাপন করতে পারে। এই কাউন্টডাউন রেফারেন্স হিসেবে উম্মুল কুরার হিসাবকৃত তারিখ ব্যবহার করে, তাই দেশভেদে এক দিনের পার্থক্য স্বাভাবিক; স্থানীয় ধর্মীয় কর্তৃপক্ষের সঙ্গে মিলিয়ে নিন।' },
        { h2: 'এই কাউন্টডাউন কীভাবে কাজ করে?',
          body: 'সরাসরি টাইমারটি আপনার স্থানীয় সময় অনুযায়ী প্রত্যাশিত ঈদুল ফিতর পর্যন্ত বাকি দিন, ঘণ্টা, মিনিট ও সেকেন্ড দেখায়। বছরের তালিকাটি আগামী কয়েক বছরের ঈদের তারিখ দেখায় যাতে আপনি উদযাপন, সাক্ষাৎ ও ভ্রমণের আগেভাগে পরিকল্পনা করতে পারেন, আর চাঁদ-প্যানেলটি বর্তমান চাঁদের দশা দেখায়। প্রদর্শিত প্রতিটি তারিখ একটি জ্যোতির্বৈজ্ঞানিক অনুমান এবং চাঁদ আনুষ্ঠানিকভাবে নিশ্চিত হলে এক দিন আগে-পরে হতে পারে।' },
        { h2: 'ঈদুল ফিতর ও চান্দ্র পঞ্জিকা',
          body: 'ঈদুল ফিতর ১ শাওয়ালে হয়, যা হিজরি চান্দ্র বছরের দশম মাস; এই বছর প্রায় ৩৫৪ দিনের, সৌর গ্রেগরিয়ান বছরের চেয়ে প্রায় ১১ দিন ছোট। এ কারণে ঈদ প্রতি গ্রেগরিয়ান বছরে প্রায় ১১ দিন আগে আসে এবং প্রায় ৩৩ বছরের চক্রে সব ঋতুর মধ্য দিয়ে ঘোরে। এ কারণেই ঈদের গ্রেগরিয়ান তারিখ বছরে বছরে বদলায় এবং প্রতি বছর তা মিলিয়ে দেখতে হয়।' },
      ],
    },
    ms: {
      titles: {
        long:   'Berapa Lama Lagi Aidilfitri {hy}? Kira Detik 1 Syawal',
        medium: 'Kira Detik Aidilfitri {hy} | 1 Syawal',
        short:  'Kira Detik Aidilfitri {hy}',
      },
      desc: 'Berapa lama lagi menjelang Aidilfitri {hy}? Kira detik secara langsung ke 1 Syawal {hy} H, hari raya selepas Ramadan, dengan tarikh Masihi yang dijangka ({gy}).',
      sections: [
        { h2: 'Bilakah Aidilfitri?',
          body: 'Aidilfitri jatuh pada hari pertama Syawal, sebaik bulan Ramadan berakhir dan anak bulan Syawal kelihatan. Jika anak bulan tidak kelihatan, Ramadan disempurnakan kepada tiga puluh hari dan hari raya jatuh pada keesokan harinya. Umat Islam menunaikan solat Aidilfitri dan menunaikan zakat fitrah sebelumnya, meraikan kesempurnaan puasa. Oleh sebab bulan qamari berlangsung 29 atau 30 hari, tarikh Masihi Aidilfitri beralih sedikit setiap tahun. Kira detik ini memaparkan tarikh Masihi yang dijangka bagi Aidilfitri {hy} H berserta baki harinya.' },
        { h2: 'Mengapa tarikh berbeza antara negara?',
          body: 'Sesetengah negara bergantung pada rukyah anak bulan Syawal secara fizikal, manakala yang lain menggunakan pengiraan astronomi untuk menanda penghujung Ramadan dan permulaan hari raya. Anak bulan mungkin kelihatan di satu wilayah sehari lebih awal daripada yang lain, jadi satu negara boleh beraya sehari lebih awal daripada yang lain. Kira detik ini menggunakan tarikh Umm al-Qura yang dikira sebagai rujukan, jadi beza satu hari antara negara adalah perkara biasa; sahkan sentiasa dengan pihak berkuasa agama tempatan.' },
        { h2: 'Bagaimana kira detik ini berfungsi?',
          body: 'Pemasa langsung memaparkan baki hari, jam, minit dan saat menuju Aidilfitri yang dijangka mengikut waktu tempatan anda. Jadual tahun menyenaraikan tarikh hari raya bagi tahun-tahun mendatang supaya anda boleh merancang sambutan, ziarah dan perjalanan lebih awal, manakala panel bulan menunjukkan fasa bulan semasa. Setiap tarikh yang dipaparkan ialah anggaran astronomi dan boleh maju atau mundur sehari selepas anak bulan disahkan secara rasmi.' },
        { h2: 'Aidilfitri dan kalendar qamari',
          body: 'Aidilfitri jatuh pada 1 Syawal, bulan kesepuluh tahun Hijrah qamari yang berjumlah kira-kira 354 hari — lebih kurang 11 hari lebih pendek daripada tahun Masihi syamsi. Oleh itu hari raya tiba kira-kira 11 hari lebih awal setiap tahun Masihi dan merentasi semua musim dalam kitaran kira-kira 33 tahun. Inilah sebabnya tarikh Masihi Aidilfitri berubah dari tahun ke tahun dan perlu disemak setiap tahun.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════════
  // EID AL-ADHA — 10 Dhul-Hijjah (feast of sacrifice, during Hajj)
  // ════════════════════════════════════════════════════════════════════════
  'eid-adha': {
    ar: {
      titles: {
        long:   'كم باقي على عيد الأضحى {hy}؟ عدّ تنازليّ ليوم النحر',
        medium: 'كم باقي على عيد الأضحى {hy}؟ | عدّ تنازليّ',
        short:  'العدّ التنازليّ لعيد الأضحى {hy}',
      },
      desc: 'كم باقي على عيد الأضحى {hy}؟ عدّ تنازليّ مباشر ليوم النحر في 10 ذي الحجّة {hy} هـ بعد يوم عرفة، مع التاريخ الميلاديّ المتوقّع وجدول السنوات.',
      sections: [
        { h2: 'متى يأتي عيد الأضحى؟',
          body: 'يأتي عيد الأضحى في اليوم العاشر من شهر ذي الحجّة، عقب يوم عرفة الذي هو التاسع منه، وفي موسم الحجّ الأكبر. ويُحدَّد دخول ذي الحجّة برؤية هلاله بعد انقضاء ذي القعدة، فإن لم يُرَ الهلال أُكمل ذو القعدة ثلاثين يومًا. ويُصلّي المسلمون صلاة العيد ثمّ يذبحون الأضاحي إحياءً لسنّة إبراهيم عليه السلام، وتمتدّ أيّام العيد إلى الثالث عشر. ويُستحبّ توزيع لحم الأضحية على الفقراء والأقارب والجيران فيشمل الفرح المحتاجين، وتُسمّى الأيّام الثلاثة التالية للعيد أيّام التشريق يُكثر فيها المسلمون من ذكر الله والتكبير. ويعرض هذا العدّ التنازليّ التاريخ الميلاديّ المتوقّع لعيد الأضحى {hy} هـ مع الأيّام المتبقّية.' },
        { h2: 'لماذا يختلف موعد عيد الأضحى بين الدول؟',
          body: 'تعتمد بعض الدول على رؤية هلال ذي الحجّة بالعين المجرّدة، بينما تعتمد دول أخرى على الحساب الفلكيّ لتحديد بدايته. وقد يُرى الهلال في منطقة قبل أخرى بيوم واحد، فيختلف يوم عرفة والعيد رسميًّا بين بلد وآخر بمقدار يوم، مع أنّ وقفة عرفة مرتبطة بموسم الحجّ في مكّة. ويعتمد هذا العدّ التنازليّ تاريخ تقويم أمّ القرى الحسابيّ مرجعًا تقديريًّا، ويبقى التأكيد لما تعلنه الجهة الشرعية في بلدك. ويبقى يوم عرفة لأهل الموقف هو التاسع من ذي الحجّة في مكّة، ويصومه المسلمون في بلدانهم وفق إعلان جهاتهم.' },
        { h2: 'كيف يعمل هذا العدّ التنازليّ؟',
          body: 'يعرض المؤقّت المباشر الأيّام والساعات والدقائق والثواني المتبقّية حتّى عيد الأضحى المتوقّع بتوقيت بلدك، وقبله بيوم تكون وقفة عرفة. ويُدرِج جدول السنوات مواعيد العيد للأعوام القادمة كي تخطّط للأضحية والحجّ والسفر مسبقًا، بينما تُظهر اللوحة القمرية طور القمر الحاليّ. وجميع التواريخ تقديريّة محسوبة فلكيًّا، وقد تتقدّم أو تتأخّر يومًا حسب ثبوت الرؤية رسميًّا.' },
        { h2: 'عيد الأضحى والتقويم القمريّ',
          body: 'يقع عيد الأضحى في العاشر من ذي الحجّة، آخر شهور السنة الهجرية القمرية التي تبلغ نحو 354 يومًا، أي أقصر بنحو 11 يومًا من السنة الميلادية الشمسية. ولهذا يتقدّم العيد ووقفة عرفة نحو 11 يومًا كلّ عام ميلاديّ، فيمرّان عبر فصول السنة جميعها على مدى نحو 33 عامًا. ولذلك يختلف موعد العيد بالتقويم الميلاديّ من سنة لأخرى ويحتاج إلى متابعة سنويّة. ويساعدك هذا العدّ على معرفة موعد العيد ووقفة عرفة مبكّرًا لتخطيط الأضحية والحجّ والإجازة والسفر وتجهيز ما يلزم قبل حلول الموسم بوقتٍ كافٍ.' },
      ],
    },
    en: {
      titles: {
        long:   'How Long Until Eid al-Adha {hy}? Countdown to 10 Dhul-Hijjah',
        medium: 'Eid al-Adha {hy} Countdown | Days Until the Feast',
        short:  'Eid al-Adha {hy} Countdown',
      },
      desc: 'How long until Eid al-Adha {hy}? A live countdown to 10 Dhul-Hijjah {hy} AH, the day after Arafah during Hajj, with the expected Gregorian date ({gy}).',
      sections: [
        { h2: 'When is Eid al-Adha?',
          body: 'Eid al-Adha falls on the tenth day of Dhul-Hijjah, right after the Day of Arafah on the ninth, during the season of the Hajj pilgrimage. The start of Dhul-Hijjah is set by sighting its crescent after Dhul-Qadah ends; if the crescent is not seen, Dhul-Qadah is completed as thirty days. Muslims pray the Eid prayer and then offer a sacrifice in remembrance of Prophet Ibrahim, and the feast extends to the thirteenth. This countdown shows the expected Gregorian date for Eid al-Adha {hy} AH along with the days remaining.' },
        { h2: 'Why does the date differ between countries?',
          body: 'Some countries rely on physically sighting the Dhul-Hijjah crescent, while others use astronomical calculation to mark its start. The crescent may be visible in one region a day earlier than another, so the Day of Arafah and Eid can fall a day apart from country to country, even though Arafah is tied to the Hajj season in Makkah. This countdown uses the calculated Umm al-Qura date as a reference; always confirm with your local religious authority.' },
        { h2: 'How does this countdown work?',
          body: 'The live timer shows the days, hours, minutes and seconds remaining until the expected Eid al-Adha in your local time, with the Day of Arafah falling the day before. The years table lists the dates of Eid for the coming years so you can plan your sacrifice, pilgrimage and travel ahead, while the lunar panel shows the current moon phase. Every date displayed is an astronomical estimate and may move a day once the crescent is officially confirmed.' },
        { h2: 'Eid al-Adha and the lunar calendar',
          body: 'Eid al-Adha falls on 10 Dhul-Hijjah, the final month of the Hijri lunar year, which is about 354 days — roughly 11 days shorter than the solar Gregorian year. As a result, Eid and the Day of Arafah arrive about 11 days earlier each Gregorian year and move through all the seasons over a cycle of roughly 33 years. This is why the Gregorian date of Eid changes from one year to the next and needs to be checked each year.' },
      ],
    },
    fr: {
      titles: {
        long:   'Combien de jours avant l’Aïd el-Adha {hy} ? Compte à rebours',
        medium: 'Aïd el-Adha {hy} | Compte à rebours du 10 Dhou al-Hijja',
        short:  'Compte à rebours de l’Aïd el-Adha {hy}',
      },
      desc: 'Combien de jours avant l’Aïd el-Adha {hy} ? Compte à rebours vers le 10 Dhou al-Hijja {hy} H pendant le Hajj, avec la date grégorienne prévue ({gy}).',
      sections: [
        { h2: 'Quand a lieu l’Aïd el-Adha ?',
          body: 'L’Aïd el-Adha tombe le dixième jour de Dhou al-Hijja, juste après le jour d’Arafat le neuvième, durant la saison du pèlerinage du Hajj. Le début de Dhou al-Hijja est fixé par l’observation de son croissant après la fin de Dhou al-Qada ; si le croissant n’est pas vu, Dhou al-Qada est complété à trente jours. Les musulmans accomplissent la prière de l’Aïd puis offrent un sacrifice en souvenir du prophète Ibrahim, et la fête s’étend jusqu’au treizième jour. Ce compte à rebours indique la date grégorienne prévue de l’Aïd el-Adha {hy} H ainsi que les jours restants.' },
        { h2: 'Pourquoi la date diffère-t-elle selon les pays ?',
          body: 'Certains pays se fondent sur l’observation physique du croissant de Dhou al-Hijja, tandis que d’autres utilisent le calcul astronomique pour en marquer le début. Le croissant peut être visible un jour plus tôt dans une région que dans une autre, si bien que le jour d’Arafat et l’Aïd peuvent tomber à un jour d’écart d’un pays à l’autre, même si Arafat est lié à la saison du Hajj à La Mecque. Ce compte à rebours utilise la date calculée d’Oumm al-Qoura comme référence ; confirmez toujours auprès de votre autorité religieuse.' },
        { h2: 'Comment fonctionne ce compte à rebours ?',
          body: 'Le minuteur en direct affiche les jours, heures, minutes et secondes restant avant l’Aïd el-Adha prévu, à votre heure locale, le jour d’Arafat tombant la veille. Le tableau des années indique les dates de l’Aïd pour les prochaines années afin de préparer votre sacrifice, votre pèlerinage et vos voyages à l’avance, tandis que le panneau lunaire montre la phase actuelle de la lune. Chaque date affichée est une estimation astronomique et peut avancer ou reculer d’un jour après la confirmation officielle du croissant.' },
        { h2: 'L’Aïd el-Adha et le calendrier lunaire',
          body: 'L’Aïd el-Adha tombe le 10 Dhou al-Hijja, dernier mois de l’année hégirienne lunaire, qui compte environ 354 jours, soit à peu près 11 jours de moins que l’année grégorienne solaire. C’est pourquoi l’Aïd et le jour d’Arafat arrivent environ 11 jours plus tôt chaque année grégorienne et traversent toutes les saisons sur un cycle d’environ 33 ans. C’est aussi pourquoi la date grégorienne de l’Aïd change d’une année à l’autre et doit être vérifiée chaque année.' },
      ],
    },
    tr: {
      titles: {
        long:   'Kurban Bayramı {hy} için Geri Sayım | 10 Zilhicce’ye',
        medium: 'Kurban Bayramı {hy} Geri Sayımı | 10 Zilhicce',
        short:  'Kurban Bayramı {hy} Geri Sayımı',
      },
      desc: 'Kurban Bayramı {hy} için geri sayım. Hac mevsiminde, Arefe’nin ertesi günü olan 10 Zilhicce {hy} H gününe kalan süreyi ve beklenen miladi tarihi ({gy}) görün.',
      sections: [
        { h2: 'Kurban Bayramı ne zaman?',
          body: 'Kurban Bayramı, Zilhicce ayının onuncu gününde, dokuzuncu gün olan Arefe’nin hemen ardından ve hac mevsiminde kutlanır. Zilhicce’nin başlangıcı, Zilkade sona erdikten sonra hilalinin görülmesiyle belirlenir; hilal görülmezse Zilkade otuz güne tamamlanır. Müslümanlar bayram namazını kılar ve ardından Hz. İbrahim’in sünnetini anarak kurban keser; bayram günleri on üçüne kadar sürer. Bu geri sayım, Kurban Bayramı {hy} H için beklenen miladi tarihi ve o güne kalan günleri gösterir.' },
        { h2: 'Tarih ülkeden ülkeye neden değişir?',
          body: 'Bazı ülkeler Zilhicce hilalini gözle görmeye dayanırken, bazıları başlangıcını belirlemek için astronomik hesabı kullanır. Hilal bir bölgede diğerinden bir gün önce görülebilir; bu yüzden Arefe ve bayram resmî olarak ülkeden ülkeye bir gün arayla düşebilir, ancak Arefe Mekke’deki hac mevsimine bağlıdır. Bu geri sayım referans olarak hesaplanmış Ümmülkura tarihini kullanır; kesin bilgi için yerel dinî mercie başvurun.' },
        { h2: 'Bu geri sayım nasıl çalışır?',
          body: 'Canlı sayaç, beklenen Kurban Bayramı’na yerel saatinizle kalan gün, saat, dakika ve saniyeyi gösterir; Arefe günü bir gün öncesine denk gelir. Yıllar tablosu, kurbanınızı, haccınızı ve seyahatinizi önceden planlayabilmeniz için önümüzdeki yılların bayram tarihlerini listeler; ay paneli ise mevcut ay evresini gösterir. Görüntülenen her tarih astronomik bir tahmindir ve hilal resmen doğrulandığında bir gün kayabilir.' },
        { h2: 'Kurban Bayramı ve kameri takvim',
          body: 'Kurban Bayramı, hicri kameri yılın son ayı olan Zilhicce’nin onuncu gününe denk gelir; bu yıl yaklaşık 354 gündür, yani 365 günlük güneş esaslı miladi yıldan yaklaşık 11 gün kısadır. Bu nedenle bayram ve Arefe günü her miladi yılda yaklaşık 11 gün önce gelir ve yaklaşık 33 yıllık bir döngüde tüm mevsimlerden geçer. Bu yüzden bayramın miladi tarihi yıldan yıla değişir ve her yıl kontrol edilmesi gerekir.' },
      ],
    },
    ur: {
      titles: {
        long:   'عید الاضحیٰ {hy} میں کتنے دن باقی؟ 10 ذی الحجہ کی الٹی گنتی',
        medium: 'عید الاضحیٰ {hy} الٹی گنتی | 10 ذی الحجہ',
        short:  'عید الاضحیٰ {hy} الٹی گنتی',
      },
      desc: 'عید الاضحیٰ {hy} میں کتنے دن باقی ہیں؟ حج کے موسم میں عرفہ کے اگلے دن یعنی 10 ذی الحجہ {hy} ہجری کی براہِ راست الٹی گنتی، متوقع میلادی تاریخ ({gy}) کے ساتھ۔',
      sections: [
        { h2: 'عید الاضحیٰ کب ہوتی ہے؟',
          body: 'عید الاضحیٰ ذی الحجہ کے دسویں دن ہوتی ہے، نویں دن یعنی یومِ عرفہ کے فوراً بعد اور حج کے موسم میں۔ ذی الحجہ کا آغاز ذوالقعدہ ختم ہونے کے بعد اس کے چاند کی رویت سے طے ہوتا ہے؛ اگر چاند نظر نہ آئے تو ذوالقعدہ کے تیس دن مکمل کر لیے جاتے ہیں۔ مسلمان عید کی نماز ادا کرتے ہیں پھر سیدنا ابراہیم علیہ السلام کی سنت کی یاد میں قربانی کرتے ہیں، اور عید کے دن تیرہویں تک رہتے ہیں۔ یہ الٹی گنتی عید الاضحیٰ {hy} ہجری کی متوقع میلادی تاریخ اور باقی دن دکھاتی ہے۔' },
        { h2: 'مختلف ممالک میں تاریخ کیوں مختلف ہوتی ہے؟',
          body: 'کچھ ممالک ذی الحجہ کے چاند کو آنکھ سے دیکھنے پر انحصار کرتے ہیں، جبکہ بعض اس کے آغاز کے لیے فلکیاتی حساب استعمال کرتے ہیں۔ چاند ایک خطے میں دوسرے سے ایک دن پہلے نظر آ سکتا ہے، اس لیے یومِ عرفہ اور عید سرکاری طور پر ملک بہ ملک ایک دن کے فرق سے ہو سکتے ہیں، اگرچہ عرفہ مکّہ میں حج کے موسم سے جڑا ہوا ہے۔ یہ الٹی گنتی بطورِ حوالہ اُمّ القریٰ کی حسابی تاریخ استعمال کرتی ہے؛ حتمی تصدیق اپنے ملک کے دینی ادارے سے کریں۔' },
        { h2: 'یہ الٹی گنتی کیسے کام کرتی ہے؟',
          body: 'براہِ راست ٹائمر آپ کے مقامی وقت کے مطابق متوقع عید الاضحیٰ تک باقی دن، گھنٹے، منٹ اور سیکنڈ دکھاتا ہے، اور اس سے ایک دن پہلے یومِ عرفہ ہوتا ہے۔ سالوں کا جدول آنے والے برسوں کی عید کی تاریخیں درج کرتا ہے تاکہ آپ قربانی، حج اور سفر کی پیشگی منصوبہ بندی کر سکیں، جبکہ قمری پینل چاند کا موجودہ مرحلہ دکھاتا ہے۔ ہر دکھائی گئی تاریخ ایک فلکیاتی تخمینہ ہے اور رویت کی سرکاری تصدیق پر ایک دن آگے یا پیچھے ہو سکتی ہے۔' },
        { h2: 'عید الاضحیٰ اور قمری تقویم',
          body: 'عید الاضحیٰ 10 ذی الحجہ کو آتی ہے، جو ہجری قمری سال کا آخری مہینہ ہے؛ یہ سال تقریباً 354 دن کا ہوتا ہے، یعنی شمسی میلادی سال سے قریباً 11 دن چھوٹا۔ اسی لیے عید اور یومِ عرفہ ہر میلادی سال میں تقریباً 11 دن پہلے آتے ہیں اور تقریباً 33 سال کے دور میں تمام موسموں سے گزرتے ہیں۔ یہی وجہ ہے کہ عید کی میلادی تاریخ ہر سال بدلتی رہتی ہے اور ہر سال اِسے دیکھنا پڑتا ہے۔' },
      ],
    },
    de: {
      titles: {
        long:   'Eid al-Adha {hy} Countdown | Tage bis zum 10. Dhul-Hijjah',
        medium: 'Eid al-Adha {hy} Countdown | 10. Dhul-Hijjah',
        short:  'Eid al-Adha {hy} Countdown',
      },
      desc: 'Wie lange bis Eid al-Adha {hy}? Live-Countdown zum 10. Dhul-Hijjah {hy} AH während des Hadsch, mit dem erwarteten gregorianischen Datum ({gy}).',
      sections: [
        { h2: 'Wann ist Eid al-Adha?',
          body: 'Eid al-Adha fällt auf den zehnten Tag des Dhul-Hijjah, unmittelbar nach dem Tag von Arafat am neunten, während der Saison der Hadsch-Pilgerfahrt. Der Beginn des Dhul-Hijjah wird durch die Sichtung seiner Mondsichel nach dem Ende des Dhul-Qadah festgelegt; wird die Sichel nicht gesehen, wird Dhul-Qadah auf dreißig Tage vervollständigt. Muslime verrichten das Festgebet und bringen dann ein Opfer im Gedenken an den Propheten Ibrahim dar, und das Fest reicht bis zum dreizehnten Tag. Dieser Countdown zeigt das erwartete gregorianische Datum für Eid al-Adha {hy} AH sowie die verbleibenden Tage.' },
        { h2: 'Warum unterscheidet sich das Datum je nach Land?',
          body: 'Manche Länder verlassen sich auf die physische Sichtung der Dhul-Hijjah-Sichel, andere nutzen die astronomische Berechnung, um ihren Beginn festzulegen. Die Sichel kann in einer Region einen Tag früher sichtbar sein, sodass der Tag von Arafat und Eid von Land zu Land um einen Tag versetzt fallen können, obwohl Arafat an die Hadsch-Saison in Mekka gebunden ist. Dieser Countdown verwendet das berechnete Umm-al-Qura-Datum als Richtwert; bestätigen Sie es stets bei Ihrer religiösen Autorität.' },
        { h2: 'Wie funktioniert dieser Countdown?',
          body: 'Der Live-Timer zeigt die Tage, Stunden, Minuten und Sekunden bis zum erwarteten Eid al-Adha in Ihrer Ortszeit, wobei der Tag von Arafat auf den Vortag fällt. Die Jahrestabelle listet die Daten des Festes für die kommenden Jahre auf, damit Sie Opfer, Pilgerfahrt und Reisen vorausplanen können, während das Mondpanel die aktuelle Mondphase zeigt. Jedes angezeigte Datum ist eine astronomische Schätzung und kann sich nach der offiziellen Bestätigung der Sichel um einen Tag verschieben.' },
        { h2: 'Eid al-Adha und der Mondkalender',
          body: 'Eid al-Adha fällt auf den 10. Dhul-Hijjah, den letzten Monat des Hidschri-Mondjahres, das etwa 354 Tage zählt – rund 11 Tage kürzer als das gregorianische Sonnenjahr. Daher kommen das Fest und der Tag von Arafat jedes gregorianische Jahr etwa 11 Tage früher und wandern über einen Zyklus von rund 33 Jahren durch alle Jahreszeiten. Deshalb ändert sich das gregorianische Datum des Festes von Jahr zu Jahr und sollte jedes Jahr geprüft werden.' },
      ],
    },
    id: {
      titles: {
        long:   'Berapa Lama Lagi Iduladha {hy}? Hitung Mundur 10 Zulhijah',
        medium: 'Hitung Mundur Iduladha {hy} | 10 Zulhijah',
        short:  'Hitung Mundur Iduladha {hy}',
      },
      desc: 'Berapa lama lagi menuju Iduladha {hy}? Hitung mundur ke 10 Zulhijah {hy} H pada musim haji, dengan tanggal Masehi yang diperkirakan ({gy}).',
      sections: [
        { h2: 'Kapan Iduladha?',
          body: 'Iduladha jatuh pada hari kesepuluh Zulhijah, tepat setelah hari Arafah pada tanggal sembilan, pada musim ibadah haji. Awal Zulhijah ditetapkan dengan rukyat hilalnya setelah Zulkaidah berakhir; jika hilal tidak terlihat, Zulkaidah disempurnakan menjadi tiga puluh hari. Umat Islam menunaikan salat Id lalu menyembelih hewan kurban untuk mengenang Nabi Ibrahim, dan hari raya berlangsung hingga tanggal tiga belas. Hitung mundur ini menampilkan tanggal Masehi yang diperkirakan untuk Iduladha {hy} H beserta sisa harinya.' },
        { h2: 'Mengapa tanggalnya berbeda antarnegara?',
          body: 'Sebagian negara mengandalkan rukyat hilal Zulhijah secara langsung, sementara yang lain menggunakan perhitungan astronomi untuk menandai awalnya. Hilal bisa terlihat di satu wilayah sehari lebih awal, sehingga hari Arafah dan Id dapat jatuh dengan selisih satu hari antarnegara, meskipun Arafah terkait dengan musim haji di Makkah. Hitung mundur ini memakai tanggal Umm al-Qura hasil perhitungan sebagai rujukan; selalu konfirmasikan dengan otoritas keagamaan setempat.' },
        { h2: 'Bagaimana cara kerja hitung mundur ini?',
          body: 'Pengatur waktu langsung menampilkan sisa hari, jam, menit, dan detik menuju perkiraan Iduladha dalam waktu setempat Anda, dengan hari Arafah jatuh sehari sebelumnya. Tabel tahun mencantumkan tanggal hari raya untuk tahun-tahun mendatang agar Anda dapat merencanakan kurban, haji, dan perjalanan lebih awal, sementara panel bulan menunjukkan fase bulan saat ini. Setiap tanggal yang ditampilkan adalah perkiraan astronomi dan dapat bergeser sehari setelah hilal dikonfirmasi secara resmi.' },
        { h2: 'Iduladha dan kalender qamariah',
          body: 'Iduladha jatuh pada 10 Zulhijah, bulan terakhir tahun Hijriah qamariah yang berjumlah sekitar 354 hari — kira-kira 11 hari lebih pendek daripada tahun Masehi syamsiah. Karena itu Id dan hari Arafah datang sekitar 11 hari lebih awal setiap tahun Masehi dan melewati seluruh musim dalam siklus sekitar 33 tahun. Inilah sebabnya tanggal Masehi Id berubah dari tahun ke tahun dan perlu diperiksa setiap tahun.' },
      ],
    },
    es: {
      titles: {
        long:   '¿Cuánto falta para el Eid al-Adha {hy}? Cuenta atrás',
        medium: 'Cuenta atrás del Eid al-Adha {hy} | 10 de Dhul-Hiyya',
        short:  'Cuenta atrás del Eid al-Adha {hy}',
      },
      desc: '¿Cuánto falta para el Eid al-Adha {hy}? Cuenta atrás hasta el 10 de Dhul-Hiyya {hy} H durante el Hayy, con la fecha gregoriana prevista ({gy}).',
      sections: [
        { h2: '¿Cuándo es el Eid al-Adha?',
          body: 'El Eid al-Adha cae el décimo día de Dhul-Hiyya, justo después del Día de Arafat en el noveno, durante la temporada de la peregrinación del Hayy. El inicio de Dhul-Hiyya se fija por el avistamiento de su creciente tras finalizar Dhul-Qada; si no se ve el creciente, Dhul-Qada se completa a treinta días. Los musulmanes rezan la oración del Eid y luego ofrecen un sacrificio en memoria del profeta Ibrahim, y la fiesta se extiende hasta el día trece. Esta cuenta atrás muestra la fecha gregoriana prevista del Eid al-Adha {hy} H junto con los días restantes.' },
        { h2: '¿Por qué la fecha difiere entre países?',
          body: 'Algunos países se basan en el avistamiento físico del creciente de Dhul-Hiyya, mientras que otros emplean el cálculo astronómico para marcar su inicio. El creciente puede verse en una región un día antes, de modo que el Día de Arafat y el Eid pueden caer con un día de diferencia de un país a otro, aunque Arafat está ligado a la temporada del Hayy en La Meca. Esta cuenta atrás usa la fecha calculada de Umm al-Qura como referencia; confirma siempre con tu autoridad religiosa.' },
        { h2: '¿Cómo funciona esta cuenta atrás?',
          body: 'El temporizador en directo muestra los días, horas, minutos y segundos que faltan para el Eid al-Adha previsto en tu hora local, con el Día de Arafat cayendo la víspera. La tabla de años enumera las fechas del Eid para los próximos años para que planifiques tu sacrificio, peregrinación y viajes con antelación, mientras que el panel lunar muestra la fase actual de la luna. Cada fecha mostrada es una estimación astronómica y puede desplazarse un día tras la confirmación oficial del creciente.' },
        { h2: 'El Eid al-Adha y el calendario lunar',
          body: 'El Eid al-Adha cae el 10 de Dhul-Hiyya, el último mes del año hégira lunar, que dura unos 354 días, alrededor de 11 días menos que el año gregoriano solar. Por eso el Eid y el Día de Arafat llegan unos 11 días antes cada año gregoriano y recorren todas las estaciones a lo largo de un ciclo de unos 33 años. Esta es la razón por la que la fecha gregoriana del Eid cambia de un año a otro y debe consultarse cada año.' },
      ],
    },
    bn: {
      titles: {
        long:   'ঈদুল আজহা {hy} আসতে আর কত দিন? ১০ জিলহজের লাইভ কাউন্টডাউন',
        medium: 'ঈদুল আজহা {hy} কাউন্টডাউন | ১০ জিলহজ',
        short:  'ঈদুল আজহা {hy} কাউন্টডাউন',
      },
      desc: 'ঈদুল আজহা {hy} আসতে আর কত দিন? হজের মৌসুমে আরাফার পরের দিন অর্থাৎ ১০ জিলহজ {hy} হিজরির সরাসরি কাউন্টডাউন, প্রত্যাশিত গ্রেগরিয়ান তারিখ ({gy}) সহ।',
      sections: [
        { h2: 'ঈদুল আজহা কখন হয়?',
          body: 'ঈদুল আজহা জিলহজ মাসের দশম দিনে হয়, নবম দিন অর্থাৎ আরাফার দিনের ঠিক পরে এবং হজের মৌসুমে। জিলহজের সূচনা জিলকদ শেষ হওয়ার পর তার চাঁদ দেখার মাধ্যমে নির্ধারিত হয়; চাঁদ দেখা না গেলে জিলকদ ত্রিশ দিনে পূর্ণ করা হয়। মুসলিমরা ঈদের নামাজ আদায় করেন, এরপর নবী ইব্রাহিমের স্মরণে পশু কোরবানি করেন, আর ঈদের দিন তেরো তারিখ পর্যন্ত চলে। এই কাউন্টডাউন ঈদুল আজহা {hy} হিজরির প্রত্যাশিত গ্রেগরিয়ান তারিখ ও বাকি দিনগুলো দেখায়।' },
        { h2: 'দেশভেদে তারিখ কেন আলাদা হয়?',
          body: 'কিছু দেশ জিলহজের চাঁদ সরাসরি দেখার উপর নির্ভর করে, আবার কিছু দেশ এর সূচনা নির্ধারণে জ্যোতির্বৈজ্ঞানিক হিসাব ব্যবহার করে। চাঁদ এক অঞ্চলে অন্য অঞ্চলের চেয়ে এক দিন আগে দেখা যেতে পারে, তাই আরাফার দিন ও ঈদ দেশভেদে এক দিন আগে-পরে হতে পারে, যদিও আরাফা মক্কায় হজের মৌসুমের সঙ্গে যুক্ত। এই কাউন্টডাউন রেফারেন্স হিসেবে উম্মুল কুরার হিসাবকৃত তারিখ ব্যবহার করে; স্থানীয় ধর্মীয় কর্তৃপক্ষের সঙ্গে মিলিয়ে নিন।' },
        { h2: 'এই কাউন্টডাউন কীভাবে কাজ করে?',
          body: 'সরাসরি টাইমারটি আপনার স্থানীয় সময় অনুযায়ী প্রত্যাশিত ঈদুল আজহা পর্যন্ত বাকি দিন, ঘণ্টা, মিনিট ও সেকেন্ড দেখায়, আর তার এক দিন আগে আরাফার দিন পড়ে। বছরের তালিকাটি আগামী কয়েক বছরের ঈদের তারিখ দেখায় যাতে আপনি কোরবানি, হজ ও ভ্রমণের আগেভাগে পরিকল্পনা করতে পারেন, আর চাঁদ-প্যানেলটি বর্তমান চাঁদের দশা দেখায়। প্রদর্শিত প্রতিটি তারিখ একটি জ্যোতির্বৈজ্ঞানিক অনুমান এবং চাঁদ নিশ্চিত হলে এক দিন সরে যেতে পারে।' },
        { h2: 'ঈদুল আজহা ও চান্দ্র পঞ্জিকা',
          body: 'ঈদুল আজহা ১০ জিলহজে হয়, যা হিজরি চান্দ্র বছরের শেষ মাস; এই বছর প্রায় ৩৫৪ দিনের, সৌর গ্রেগরিয়ান বছরের চেয়ে প্রায় ১১ দিন ছোট। এ কারণে ঈদ ও আরাফার দিন প্রতি গ্রেগরিয়ান বছরে প্রায় ১১ দিন আগে আসে এবং প্রায় ৩৩ বছরের চক্রে সব ঋতুর মধ্য দিয়ে ঘোরে। এ কারণেই ঈদের গ্রেগরিয়ান তারিখ বছরে বছরে বদলায় এবং প্রতি বছর তা মিলিয়ে দেখতে হয়।' },
      ],
    },
    ms: {
      titles: {
        long:   'Berapa Lama Lagi Aidiladha {hy}? Kira Detik 10 Zulhijah',
        medium: 'Kira Detik Aidiladha {hy} | 10 Zulhijah',
        short:  'Kira Detik Aidiladha {hy}',
      },
      desc: 'Berapa lama lagi menjelang Aidiladha {hy}? Kira detik ke 10 Zulhijah {hy} H, sehari selepas Arafah pada musim haji, dengan tarikh Masihi yang dijangka ({gy}).',
      sections: [
        { h2: 'Bilakah Aidiladha?',
          body: 'Aidiladha jatuh pada hari kesepuluh Zulhijah, sebaik selepas hari Arafah pada hari kesembilan, pada musim ibadah haji. Permulaan Zulhijah ditetapkan dengan rukyah anak bulannya selepas Zulkaedah berakhir; jika anak bulan tidak kelihatan, Zulkaedah disempurnakan kepada tiga puluh hari. Umat Islam menunaikan solat Aidiladha lalu menyembelih korban mengenang Nabi Ibrahim, dan hari raya berlanjutan hingga hari ketiga belas. Kira detik ini memaparkan tarikh Masihi yang dijangka bagi Aidiladha {hy} H berserta baki harinya.' },
        { h2: 'Mengapa tarikh berbeza antara negara?',
          body: 'Sesetengah negara bergantung pada rukyah anak bulan Zulhijah secara fizikal, manakala yang lain menggunakan pengiraan astronomi untuk menanda permulaannya. Anak bulan mungkin kelihatan di satu wilayah sehari lebih awal, jadi hari Arafah dan Aidiladha boleh jatuh dengan beza satu hari antara negara, walaupun Arafah terikat dengan musim haji di Makkah. Kira detik ini menggunakan tarikh Umm al-Qura yang dikira sebagai rujukan; sahkan sentiasa dengan pihak berkuasa agama tempatan.' },
        { h2: 'Bagaimana kira detik ini berfungsi?',
          body: 'Pemasa langsung memaparkan baki hari, jam, minit dan saat menuju Aidiladha yang dijangka mengikut waktu tempatan anda, dengan hari Arafah jatuh sehari sebelumnya. Jadual tahun menyenaraikan tarikh hari raya bagi tahun-tahun mendatang supaya anda boleh merancang korban, haji dan perjalanan lebih awal, manakala panel bulan menunjukkan fasa bulan semasa. Setiap tarikh yang dipaparkan ialah anggaran astronomi dan boleh beralih sehari selepas anak bulan disahkan secara rasmi.' },
        { h2: 'Aidiladha dan kalendar qamari',
          body: 'Aidiladha jatuh pada 10 Zulhijah, bulan terakhir tahun Hijrah qamari yang berjumlah kira-kira 354 hari — lebih kurang 11 hari lebih pendek daripada tahun Masihi syamsi. Oleh itu hari raya dan hari Arafah tiba kira-kira 11 hari lebih awal setiap tahun Masihi dan merentasi semua musim dalam kitaran kira-kira 33 tahun. Inilah sebabnya tarikh Masihi Aidiladha berubah dari tahun ke tahun dan perlu disemak setiap tahun.' },
      ],
    },
  },
};
