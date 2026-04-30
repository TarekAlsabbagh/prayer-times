// Phase D1: Localized SEO copy cleanup for 7 static pages × 10 languages.
// Strategy: anchor-based block replacement (find by unique start substring,
// scan forward to a known terminator), so character-encoding quirks like
// "’ literal" vs U+2019 in the source don't affect anchoring.
import fs from 'fs';
const file = 'server.js';
const srcRaw = fs.readFileSync(file, 'utf8');
const isCRLF = /\r\n/.test(srcRaw);
const EOL = isCRLF ? '\r\n' : '\n';

const BS = String.fromCharCode(92);          // backslash literal
const u2019 = BS + 'u2019';                  // 6-char literal escape

// Helper: render a logical block
const block = (lines) => lines.join(EOL);

// replaceBetween(startAnchor, endAnchor, newContent) replaces the substring
// starting at startAnchor's first occurrence and ending at endAnchor (inclusive).
function replaceBetween(s, name, startAnchor, endAnchor, newContent) {
  const i = s.indexOf(startAnchor);
  if (i < 0) throw new Error(`${name}: startAnchor not found`);
  const j = s.indexOf(endAnchor, i + startAnchor.length);
  if (j < 0) throw new Error(`${name}: endAnchor not found after startAnchor`);
  const fullEnd = j + endAnchor.length;
  // Verify the start anchor is unique enough — fail if it appears elsewhere too.
  const second = s.indexOf(startAnchor, i + 1);
  if (second >= 0 && second < fullEnd) throw new Error(`${name}: startAnchor non-unique inside block`);
  console.log(`OK ${name}: replacing ${fullEnd - i} chars at index ${i}`);
  return s.substring(0, i) + newContent + s.substring(fullEnd);
}

let s = srcRaw;

// ── Block 1: _HOME_TITLES ──
{
  const newContent = block([
    '// Phase D1: shorter homepage titles — drop redundant "prayer/Solat/Sholat/Namaz/oración" repetition',
    '    const _HOME_TITLES = {',
    "        ar: 'مواقيت الصلاة اليوم | التاريخ الهجري واتجاه القبلة وحالة القمر',",
    '        en: "Prayer Times Today | Hijri Date, Qibla Direction & Moon Phase",',
    '        fr: "Heures de prière aujourd\'hui | Date hégirienne, Qibla et phase lunaire",',
    "        tr: 'Bugünkü Namaz Vakitleri | Hicri Tarih, Kıble Yönü ve Ay Evresi',",
    "        ur: 'آج اوقاتِ نماز | ہجری تاریخ، سمتِ قبلہ اور چاند کی حالت',",
    "        de: 'Heutige Gebetszeiten | Hidschri-Datum, Qibla & Mondphase',",
    "        id: 'Jadwal Sholat Hari Ini | Tanggal Hijriah, Arah Kiblat & Fase Bulan',",
    "        es: 'Horarios de Oración Hoy | Fecha Hijri, Qibla y Fase Lunar',",
    "        bn: 'আজকের নামাজের সময় | হিজরি তারিখ, কিবলা ও চাঁদের অবস্থা',",
    "        ms: 'Waktu Solat Hari Ini | Tarikh Hijrah, Arah Kiblat & Fasa Bulan',",
    '    };'
  ]);
  s = replaceBetween(s, 'HOME_TITLES',
    '    const _HOME_TITLES = {',
    EOL + '    };',
    newContent);
}

// ── Block 2: _HOME_DESCS ──
{
  const newContent = block([
    '// Phase D1: shorter homepage descs — trim to ~125–148 chars per language',
    '    const _HOME_DESCS = {',
    "        ar: 'اعرف مواقيت الصلاة اليوم لأي مدينة حول العالم: الفجر والظهر والعصر والمغرب والعشاء، والتاريخ الهجري واتجاه القبلة.',",
    "        en: 'Find accurate prayer times for any city worldwide — Fajr, Dhuhr, Asr, Maghrib, Isha — with Hijri date, Qibla direction and moon phase.',",
    '        fr: "Horaires de prière exacts pour toute ville — Fajr, Dohr, Asr, Maghrib, Icha — avec la date hégirienne, la direction de la Qibla et la phase lunaire.",',
    "        tr: 'Tüm dünyada her şehir için doğru namaz vakitleri — Fecir, Öğle, İkindi, Akşam, Yatsı — hicri tarih, kıble yönü ve ay evresi ile birlikte.',",
    "        ur: 'دنیا کے کسی بھی شہر کے لیے درست اوقاتِ نماز — فجر، ظہر، عصر، مغرب، عشاء — ہجری تاریخ، سمتِ قبلہ اور چاند کی حالت کے ساتھ۔',",
    "        de: 'Genaue Gebetszeiten für jede Stadt weltweit — Fajr, Dhuhr, Asr, Maghrib, Isha — mit Hidschri-Datum, Qibla-Richtung und Mondphase.',",
    "        id: 'Jadwal sholat akurat untuk semua kota di dunia — Subuh, Zuhur, Asar, Magrib, Isya — dengan tanggal Hijriah, arah kiblat dan fase bulan.',",
    "        es: 'Horarios de oración exactos para cualquier ciudad del mundo — Fayr, Dohr, Asr, Magrib, Isha — con fecha Hijri, dirección de la Qibla y fase lunar.',",
    "        bn: 'বিশ্বের যেকোনো শহরের নির্ভুল নামাজের সময় — ফজর, জোহর, আসর, মাগরিব, এশা — হিজরি তারিখ, কিবলার দিক ও চাঁদের অবস্থা সহ।',",
    "        ms: 'Waktu solat tepat untuk mana-mana bandar di dunia — Subuh, Zohor, Asar, Maghrib, Isyak — dengan tarikh Hijrah, arah kiblat dan fasa bulan.',",
    '    };'
  ]);
  s = replaceBetween(s, 'HOME_DESCS',
    '    const _HOME_DESCS = {',
    EOL + '    };',
    newContent);
}

// ── Block 3: /qibla full ──
// Replace from "        '/qibla': {" to "        }," that ends the block.
// End anchor: "        },\n        '/moon-today':" — matches uniquely.
{
  const newContent = block([
    "        '/qibla': {",
    '            // Phase D1: replace em-dash with "|", extend short titles, normalize TR desc',
    '            title: {',
    "                ar: 'اتجاه القبلة | بوصلة الكعبة المشرفة والمسافة',",
    "                en: 'Qibla Direction | Compass and Distance to the Kaaba',",
    "                fr: 'Direction de la Qibla | Boussole et distance à la Kaaba',",
    "                tr: 'Kıble Yönü | Kâbe" + u2019 + "ye Pusula ve Uzaklık Hesaplama',",
    "                ur: 'سمتِ قبلہ | خانہ کعبہ کی طرف قطب نما اور فاصلہ',",
    "                de: 'Qibla-Richtung | Kompass und Entfernung zur Kaaba',",
    "                id: 'Arah Kiblat | Kompas Online dan Jarak ke Kakbah',",
    "                es: 'Dirección de la Qibla | Brújula y distancia a la Kaaba',",
    "                bn: 'কিবলার দিক | কাবার দিকনির্দেশ ও দূরত্ব নির্ণয়',",
    "                ms: 'Arah Kiblat | Kompas Dalam Talian dan Jarak ke Kaabah',",
    '            },',
    '            desc: {',
    "                ar: 'احسب اتجاه القبلة بدقة من أي موقع مع المسافة إلى الكعبة المشرفة وبوصلة تفاعلية وأسئلة شائعة.',",
    "                en: 'Calculate the Qibla direction accurately from any location with the distance to the Kaaba, an interactive compass and a helpful FAQ.',",
    "                fr: 'Calculez la direction précise de la Qibla depuis n" + u2019 + "importe quel lieu : distance à la Kaaba, boussole interactive et FAQ utile.',",
    "                tr: 'Her konumdan kıble yönünü doğru hesaplayın: Kâbe" + u2019 + "ye uzaklık (km), etkileşimli pusula, anlık döndürme ve sıkça sorulan sorular.',",
    "                ur: 'کسی بھی مقام سے قبلہ کی درست سمت، کعبہ تک فاصلہ، انٹرایکٹو قطب نما اور عام سوالات کے ساتھ۔',",
    "                de: 'Berechnen Sie die Qibla-Richtung genau von jedem Ort aus: Entfernung zur Kaaba, interaktiver Kompass und hilfreiche FAQ.',",
    "                id: 'Hitung arah kiblat dengan akurat dari lokasi mana pun, lengkap dengan jarak ke Kakbah, kompas interaktif, dan FAQ.',",
    "                es: 'Calcule la dirección precisa de la Qibla desde cualquier lugar con la distancia a la Kaaba, una brújula interactiva y una FAQ útil.',",
    "                bn: 'যেকোনো অবস্থান থেকে কিবলার সঠিক দিক—কাবা পর্যন্ত দূরত্ব, ইন্টারঅ্যাকটিভ কম্পাস এবং FAQ সহ।',",
    "                ms: 'Kira arah kiblat dengan tepat dari mana-mana lokasi dengan jarak ke Kaabah, kompas interaktif dan FAQ berguna.',",
    '            },',
    "            app: { category: 'UtilitiesApplication' },",
    "            ogType: 'website',",
    '        },'
  ]);
  s = replaceBetween(s, '/qibla',
    "        '/qibla': {",
    "        }," + EOL + "        '/moon-today': {",
    newContent + EOL + "        '/moon-today': {");
}

// ── Block 4: /zakat-calculator (array → object) ──
{
  const newContent = block([
    "        '/zakat-calculator': {",
    '            // UAT-Z1 + Phase D1: array→object structure; localized for all 10 langs',
    '            title: {',
    "                ar: 'حاسبة الزكاة | احسب زكاة المال والذهب والأسهم بسهولة',",
    "                en: 'Zakat Calculator | Money, Gold and Investments',",
    "                fr: 'Calculateur de Zakat | Argent, Or et Investissements',",
    "                tr: 'Zekât Hesaplayıcı | Para, Altın ve Yatırımlarda Zekât',",
    "                ur: 'زکوٰۃ کیلکولیٹر | نقد، سونے اور سرمایہ کاری پر زکوٰۃ',",
    "                de: 'Zakat-Rechner | Geld, Gold und Investitionen',",
    "                id: 'Kalkulator Zakat | Uang, Emas dan Investasi',",
    "                es: 'Calculadora de Zakat | Dinero, Oro e Inversiones',",
    "                bn: 'যাকাত ক্যালকুলেটর | অর্থ, সোনা ও বিনিয়োগের যাকাত',",
    "                ms: 'Kalkulator Zakat | Wang, Emas, Pelaburan dan Saham',",
    '            },',
    '            desc: {',
    "                ar: 'احسب زكاة المال والمدخرات والذهب والفضة والأسهم والاستثمارات والعقارات المعدّة للبيع وفق النصاب ونسبة 2.5%، مع توضيح طريقة الحساب.',",
    "                en: 'Use the Zakat Calculator to estimate zakat on cash, savings, gold, silver, investments, and trade assets with nisab and 2.5% zakat calculation.',",
    "                fr: 'Calculez la Zakat sur l" + u2019 + "argent, l" + u2019 + "épargne, l" + u2019 + "or, l" + u2019 + "argent et les investissements avec le nisab et le taux de 2,5%.',",
    "                tr: 'Zekât hesaplayıcı ile para, birikim, altın, gümüş, yatırım ve ticaret malları üzerinden zekâtınızı %2,5 ve nisaba göre hesaplayın.',",
    "                ur: 'زکوٰۃ کیلکولیٹر سے نقد، بچت، سونا، چاندی، سرمایہ کاری اور تجارتی اثاثوں پر زکوٰۃ نصاب اور 2.5% شرح کے مطابق شمار کریں۔',",
    "                de: 'Berechnen Sie mit dem Zakat-Rechner die Zakat auf Bargeld, Ersparnisse, Gold, Silber, Investitionen und Handelsgüter mit Nisab und 2,5%.',",
    "                id: 'Hitung zakat uang tunai, tabungan, emas, perak, investasi dan barang dagangan dengan nisab dan tarif 2,5% pakai kalkulator zakat ini.',",
    "                es: 'Calcula la Zakat sobre dinero, ahorros, oro, plata, inversiones y mercancías con el nisab y la tasa del 2,5% — guía completa.',",
    "                bn: 'যাকাত ক্যালকুলেটর দিয়ে নগদ, সঞ্চয়, সোনা, রুপা, বিনিয়োগ ও বাণিজ্য পণ্যের যাকাত নিসাব ও ২.৫% হারে হিসাব করুন।',",
    "                ms: 'Kira zakat wang tunai, simpanan, emas, perak, pelaburan dan barang dagangan dengan nisab dan kadar 2.5% guna kalkulator ini.',",
    '            },',
    "            app: { category: 'FinanceApplication' },",
    '            zakatFaq: true,    // UAT-Z1: enables FAQPage + HowTo schemas',
    '        },'
  ]);
  s = replaceBetween(s, '/zakat-calculator',
    "        '/zakat-calculator': {",
    "        }," + EOL + "        '/duas': {",
    newContent + EOL + "        '/duas': {");
}

// ── Block 5: /duas (array → object) ──
{
  const newContent = block([
    "        '/duas': {",
    '            // Phase D1: array→object structure; localized for all 10 langs',
    '            title: {',
    "                ar: 'الأدعية والأذكار الصحيحة من الكتاب والسنة',",
    "                en: 'Duas & Athkar | Authentic Islamic Supplications',",
    "                fr: 'Douas et Athkar | Invocations authentiques de l" + u2019 + "islam',",
    "                tr: 'Dualar ve Zikirler | Kur" + u2019 + "an ve Sünnet" + u2019 + "ten Sahih Dualar',",
    "                ur: 'دعائیں اور اذکار | قرآن و سنت سے صحیح اسلامی دعائیں',",
    "                de: 'Duas & Athkar | Authentische Bittgebete aus Quran & Sunna',",
    "                id: 'Doa dan Zikir | Doa Sahih dari Al-Quran dan Sunnah',",
    "                es: 'Duas y Athkar | Súplicas Auténticas del Islam',",
    "                bn: 'দোয়া ও জিকির | কুরআন ও সুন্নাহ থেকে সহিহ দোয়া',",
    "                ms: 'Doa dan Zikir | Doa Sahih dari Al-Quran dan Sunnah',",
    '            },',
    '            desc: {',
    "                ar: 'أدعية وأذكار صحيحة من القرآن والسنة: أذكار الصباح والمساء، بعد الصلاة، النوم، السفر، الكرب، ويوم الجمعة — مع التخريج.',",
    "                en: 'Authentic duas from Quran & Sunnah: morning & evening athkar, after-prayer remembrance, sleep, travel, distress and Friday duas with sources.',",
    "                fr: 'Douas authentiques du Coran et de la Sunna : athkar du matin et du soir, après la prière, sommeil, voyage, détresse et vendredi avec sources.',",
    "                tr: 'Kur" + u2019 + "an ve Sünnet" + u2019 + "ten sahih dualar ve zikirler: sabah-akşam zikirleri, namaz sonrası, uyku, yolculuk, sıkıntı ve Cuma duaları kaynaklarıyla.',",
    "                ur: 'قرآن و سنت سے صحیح دعائیں اور اذکار: صبح و شام کے اذکار، نماز کے بعد، سونے، سفر، پریشانی اور جمعہ کی دعائیں حوالہ جات کے ساتھ۔',",
    "                de: 'Authentische Duas aus Quran und Sunna: Morgen- und Abend-Athkar, nach dem Gebet, Schlaf, Reise, Not und Freitags-Duas mit Quellen.',",
    "                id: 'Doa sahih dari Al-Quran dan Sunnah: zikir pagi dan petang, setelah sholat, tidur, perjalanan, kesusahan dan doa Jumat dengan sumber.',",
    "                es: 'Duas auténticas del Corán y la Sunna: athkar de la mañana y la tarde, tras la oración, sueño, viaje, angustia y duas del viernes con fuentes.',",
    "                bn: 'কুরআন ও সুন্নাহ থেকে সহিহ দোয়া ও জিকির: সকাল-সন্ধ্যার জিকির, নামাজের পর, ঘুম, ভ্রমণ, কষ্ট ও জুমার দোয়া সূত্র সহকারে।',",
    "                ms: 'Doa sahih dari Al-Quran dan Sunnah: zikir pagi dan petang, selepas solat, tidur, perjalanan, kesusahan dan doa Jumaat berserta sumber.',",
    '            },',
    "            ogType: 'article',",
    '        },'
  ]);
  s = replaceBetween(s, '/duas',
    "        '/duas': {",
    "        }," + EOL + "        '/msbaha': {",
    newContent + EOL + "        '/msbaha': {");
}

// ── Block 6: /msbaha full ──
{
  const newContent = block([
    "        '/msbaha': {",
    '            // Phase D1: replace em-dash with "|", extend titles, trim ar/bn descs',
    '            title: {',
    "                ar: 'المسبحة الإلكترونية | عدّاد الذكر اليومي مع حفظ العدّ',",
    "                en: 'Digital Tasbih Counter | Masbaha for Daily Dhikr Tracking',",
    "                fr: 'Tasbih Numérique | Compteur de Dhikr Quotidien en Ligne',",
    "                tr: 'Dijital Tesbih | Günlük Zikir Sayacı ve Hedef Takibi',",
    "                ur: 'ڈیجیٹل تسبیح | روزانہ ذکر کا شمار اور ہدف ٹریکنگ',",
    "                de: 'Digitale Tasbih | Dhikr-Zähler mit täglichem Ziel',",
    "                id: 'Tasbih Digital | Penghitung Dzikir dengan Target Harian',",
    "                es: 'Tasbih Digital | Contador de Dhikr con Meta Diaria',",
    "                bn: 'ডিজিটাল তাসবিহ | দৈনিক জিকির কাউন্টার ও লক্ষ্য নির্ধারণ',",
    "                ms: 'Tasbih Digital | Pengira Zikir dengan Sasaran Harian',",
    '            },',
    '            desc: {',
    "                ar: 'مسبحة إلكترونية مجانية تحفظ العدّ بين الجلسات. سبّح: سبحان الله، الحمد لله، الله أكبر، أو حدّد ذكراً مخصّصاً وهدفاً يومياً.',",
    "                en: 'Free digital tasbih counter that saves your dhikr count between sessions. Track Subhanallah, Alhamdulillah, Allahu Akbar and custom dhikr targets.',",
    "                fr: 'Compteur de tasbih numérique gratuit qui sauvegarde votre compte de dhikr entre les sessions. Suivez Subhanallah, Alhamdulillah, Allahu Akbar et des cibles personnalisées.',",
    "                tr: 'Oturumlar arasında zikir sayınızı kaydeden ücretsiz dijital tesbih sayacı. Subhanallah, Elhamdulillah, Allahu Ekber ve özel zikir hedeflerini takip edin.',",
    "                ur: 'مفت ڈیجیٹل تسبیح کاؤنٹر جو آپ کے ذکر کی گنتی محفوظ رکھتا ہے۔ سبحان اللہ، الحمد للہ، اللہ اکبر اور اپنے حسب ضرورت ذکر کا ہدف مقرر کریں۔',",
    "                de: 'Kostenloser digitaler Tasbih-Zähler, der Ihren Dhikr-Zählstand zwischen Sitzungen speichert. Zählen Sie Subhanallah, Alhamdulillah, Allahu Akbar und eigene Ziele.',",
    "                id: 'Tasbih digital gratis yang menyimpan hitungan dzikir antar sesi. Pantau Subhanallah, Alhamdulillah, Allahu Akbar dan target dzikir kustom.',",
    "                es: 'Contador de tasbih digital gratuito que guarda su conteo de dhikr entre sesiones. Registre Subhanallah, Alhamdulillah, Allahu Akbar y objetivos personalizados.',",
    "                bn: 'বিনামূল্যে ডিজিটাল তাসবিহ যা সেশনের মধ্যে জিকির সংরক্ষণ করে। সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার ও কাস্টম জিকির গণনা করুন।',",
    "                ms: 'Pengira tasbih digital percuma yang menyimpan kiraan zikir anda antara sesi. Jejaki Subhanallah, Alhamdulillah, Allahu Akbar dan sasaran zikir tersuai.',",
    '            },',
    "            app: { category: 'UtilitiesApplication' },",
    '        },'
  ]);
  s = replaceBetween(s, '/msbaha',
    "        '/msbaha': {",
    "        }," + EOL + "        '/dateconverter': {",
    newContent + EOL + "        '/dateconverter': {");
}

// ── Block 7: /dateconverter full ──
{
  const newContent = block([
    "        '/dateconverter': {",
    '            // Phase D1: extend short titles (TR/UR/BN/MS) with "| Online tool" suffix; trim de/bn descs',
    '            title: {',
    "                ar: 'محوّل التاريخ الهجري والميلادي | تقويم أم القرى',",
    "                en: 'Hijri ↔ Gregorian Date Converter | Online Tool',",
    "                fr: 'Convertisseur Hégire ↔ Grégorien | Outil en ligne',",
    "                tr: 'Hicri ↔ Miladi Tarih Dönüştürücü | Online Hesaplayıcı',",
    "                ur: 'ہجری اور میلادی تاریخ کنورٹر | آن لائن کیلکولیٹر',",
    "                de: 'Hidschri ↔ Gregorianisch Umrechner | Online-Tool',",
    "                id: 'Konverter Tanggal Hijriyah ↔ Masehi | Alat Online',",
    "                es: 'Conversor de Fecha Hijri ↔ Gregoriana | Herramienta',",
    "                bn: 'হিজরি ↔ গ্রেগরিয়ান তারিখ রূপান্তর | অনলাইন ক্যালকুলেটর',",
    "                ms: 'Penukar Tarikh Hijrah ↔ Gregorian | Alat Dalam Talian',",
    '            },',
    '            desc: {',
    "                ar: 'حوِّل بين الهجري والميلادي لأي سنة من 1 هـ حتى 1500 هـ، وفق تقويم أم القرى، مع اليوم من الأسبوع والأحداث التاريخية.',",
    "                en: 'Convert Hijri to Gregorian and vice versa for any year from 1 AH to 1500 AH. Based on Umm al-Qura calendar with weekday and historical event lookup.',",
    "                fr: 'Convertissez entre dates hégiriennes et grégoriennes de 1 AH à 1500 AH. Basé sur le calendrier Umm al-Qura avec jour de semaine et événements historiques.',",
    "                tr: '1 H" + BS + "'den 1500 H" + BS + "'ye kadar herhangi bir yıl için Hicri ile Miladi arasında tarih dönüştürün. Ümmü" + BS + "'l-Kura takvimi esaslı; haftanın günü ve tarihi olaylar dahil.',",
    "                ur: '1 ہجری سے 1500 ہجری تک کسی بھی سال کے لیے ہجری اور میلادی تاریخ میں تبدیلی۔ ام القرى کیلنڈر پر مبنی، ہفتے کا دن اور تاریخی واقعات۔',",
    "                de: 'Konvertieren Sie Hidschri und Gregorianisch (1–1500 AH) per Umm al-Qura-Kalender — mit Wochentag und historischen Ereignissen.',",
    "                id: 'Konversi tanggal Hijriyah ke Masehi dan sebaliknya untuk tahun 1 H hingga 1500 H. Berbasis kalender Umm al-Qura dengan hari dalam seminggu dan peristiwa sejarah.',",
    "                es: 'Convierte fechas Hijri a gregorianas y viceversa para cualquier año de 1 AH a 1500 AH. Basado en el calendario Umm al-Qura con día de la semana y eventos históricos.',",
    "                bn: '১ থেকে ১৫০০ হিজরি পর্যন্ত হিজরি ও গ্রেগরিয়ান তারিখ রূপান্তর — উম্মুল কুরা ক্যালেন্ডার, সপ্তাহের দিন ও ঐতিহাসিক ঘটনা সহ।',",
    "                ms: 'Tukar tarikh Hijrah ke Gregorian dan sebaliknya untuk mana-mana tahun dari 1 H hingga 1500 H. Berdasarkan kalendar Umm al-Qura dengan hari minggu dan peristiwa bersejarah.',",
    '            },',
    "            app: { category: 'UtilitiesApplication' },",
    '        },'
  ]);
  s = replaceBetween(s, '/dateconverter',
    "        '/dateconverter': {",
    "        }," + EOL + "        '/today-hijri-date': {",
    newContent + EOL + "        '/today-hijri-date': {");
}

// ── Block 8: _HDAY_TITLE — change ":" to "|" ──
{
  const newContent = block([
    '        // Phase D1: replace ":" with "|" for separator consistency',
    '        const _HDAY_TITLE = {',
    "            ar: `التاريخ الهجري | ${day} ${_mName} ${year}${_hSfx}`,",
    "            en: `Hijri Date | ${day} ${_mName} ${year}${_hSfx}`,",
    "            fr: `Date hégirienne | ${day} ${_mName} ${year}${_hSfx}`,",
    "            tr: `Hicri Tarih | ${day} ${_mName} ${year}${_hSfx}`,",
    "            ur: `ہجری تاریخ | ${day} ${_mName} ${year}${_hSfx}`,",
    "            de: `Hidschri-Datum | ${day} ${_mName} ${year}${_hSfx}`,",
    "            id: `Tanggal Hijriah | ${day} ${_mName} ${year}${_hSfx}`,",
    "            es: `Fecha Hégira | ${day} ${_mName} ${year}${_hSfx}`,",
    "            bn: `হিজরি তারিখ | ${day} ${_mName} ${year}${_hSfx}`,",
    "            ms: `Tarikh Hijrah | ${day} ${_mName} ${year}${_hSfx}`,",
    '        };'
  ]);
  // End anchor: the next const declaration after the title block.
  s = replaceBetween(s, 'HDAY_TITLE',
    '        const _HDAY_TITLE = {',
    EOL + '        };',
    newContent);
}

if (s === srcRaw) {
  console.error('No changes were made.');
  process.exit(3);
}

fs.writeFileSync(file, s, 'utf8');
console.log(`All Phase D1 edits applied. (EOL=${isCRLF ? 'CRLF' : 'LF'})`);
