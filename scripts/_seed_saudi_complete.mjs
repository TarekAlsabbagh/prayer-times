// One-shot seeder for CURATED-SAUDI-COMPLETE-1 — appends ~86 Saudi
// cities and towns so the Arabic prayer-times audience never falls
// back to Nominatim for ANY Saudi locality (Nominatim is rate_limited
// on Render's shared IP, so this is the only reliable tier for SA).
//
// Coverage (all 13 Saudi regions):
//   Riyadh (17), Makkah (9), Madinah (6), Qassim (8), Asir (9),
//   Tabuk (6), Northern Borders (3), Najran (4), Jazan (8),
//   Eastern Province (5 — excluding Abqaiq/Khafji/Hafar already in curated),
//   Al Bahah (5), Jouf+Hail (6)
//
// Skipped (already in curated_places.json):
//   ينبع (yanbu — alias ينبع البحر added separately),
//   بقيق (abqaiq), الخفجي (khafji), حفر الباطن (hafar-al-batin)
//
// Priority scale (per user spec):
//   85 = important Saudi city / major governorate
//   75 = governorate / regional city
//   65 = smaller town
//
// Idempotent (skips slugs that already exist).
import fs from 'node:fs';

const PATH = './db/places/curated-places.json';
const places = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const seen = new Set(places.map(p => p.slug));

const TZ = 'Asia/Riyadh';
const CC_AR = 'المملكة العربية السعودية';
const CC_EN = 'Saudi Arabia';

const newCities = [
    // ══════════ Riyadh region (17) ══════════
    { slug: 'shaqra', lat: 25.2533, lng: 45.2563,
        names: {ar:'شقرا',en:'Shaqra',fr:'Shaqra',de:'Shaqra',tr:'Shaqra',ur:'شقراء',id:'Shaqra',es:'Shaqra',bn:'শাকরা',ms:'Shaqra'},
        aliases: {ar:['شقرا','شقراء']}, priority: 75 },
    { slug: 'wadi-ad-dawasir', lat: 20.4944, lng: 44.8050,
        names: {ar:'وادي الدواسر',en:'Wadi ad-Dawasir',fr:'Wadi ad-Dawasir',de:'Wadi ad-Dawasir',tr:'Vadi ed-Devasir',ur:'وادی الدواسر',id:'Wadi ad-Dawasir',es:'Wadi ad-Dawasir',bn:'ওয়াদি আদ-দাওয়াসির',ms:'Wadi ad-Dawasir'},
        aliases: {ar:['وادي الدواسر','الدواسر'], en:['Wadi Al-Dawasir','Wadi Dawasir']}, priority: 85 },
    { slug: 'az-zulfi', lat: 26.3022, lng: 44.8147,
        names: {ar:'الزلفي',en:'Az-Zulfi',fr:'Az-Zulfi',de:'az-Zulfi',tr:'Zülfi',ur:'الزلفی',id:'Az-Zulfi',es:'Az-Zulfi',bn:'আজ-জুলফি',ms:'Az-Zulfi'},
        aliases: {ar:['الزلفي','زلفي'], en:['Zulfi','Al Zulfi']}, priority: 80 },
    { slug: 'al-majmaah', lat: 25.9101, lng: 45.3622,
        names: {ar:'المجمعة',en:'Al Majmaah',fr:'Al Majmaa',de:'al-Madschmaʿa',tr:'Mecmaa',ur:'المجمعہ',id:'Al Majmaah',es:'Al Majmaʻa',bn:'আল-মাজমাহ',ms:'Al Majmaah'},
        aliases: {ar:['المجمعة','مجمعة'], en:['Majmaah']}, priority: 80 },
    { slug: 'al-aflaj', lat: 22.2740, lng: 46.7339,
        names: {ar:'الأفلاج',en:'Al Aflaj',fr:'Al Aflaj',de:'al-Aflaj',tr:'Eflac',ur:'الاَفلاج',id:'Al Aflaj',es:'Al Aflaj',bn:'আল-আফলাজ',ms:'Al Aflaj'},
        aliases: {ar:['الأفلاج','الافلاج','ليلى'], en:['Layla']}, priority: 75 },
    { slug: 'ad-dawadmi', lat: 24.5060, lng: 44.3950,
        names: {ar:'الدوادمي',en:'Ad-Dawadmi',fr:'Ad-Dawadmi',de:'ad-Dawadimi',tr:'Devadimi',ur:'الدوادمی',id:'Ad-Dawadmi',es:'Ad-Dawadmi',bn:'আদ-দাওয়াদমি',ms:'Ad-Dawadmi'},
        aliases: {ar:['الدوادمي','دوادمي']}, priority: 78 },
    { slug: 'dirma', lat: 24.6086, lng: 46.1192,
        names: {ar:'ضرما',en:'Dirma',fr:'Dirma',de:'Dirma',tr:'Dırma',ur:'ضرما',id:'Dirma',es:'Dirma',bn:'ধির্মা',ms:'Dirma'},
        aliases: {ar:['ضرما','ضرماء']}, priority: 70 },
    { slug: 'hawtat-bani-tamim', lat: 23.5333, lng: 46.8500,
        names: {ar:'حوطة بني تميم',en:'Hawtat Bani Tamim',fr:'Hawtat Bani Tamim',de:'Hawtat Bani Tamim',tr:'Havta Beni Temim',ur:'حوطۃ بنی تمیم',id:'Hawtat Bani Tamim',es:'Hawtat Bani Tamim',bn:'হাওতাত বানি তামিম',ms:'Hawtat Bani Tamim'},
        aliases: {ar:['حوطة بني تميم','الحوطة']}, priority: 72 },
    { slug: 'al-ghat', lat: 26.0094, lng: 44.9925,
        names: {ar:'الغاط',en:'Al Ghat',fr:'Al Ghat',de:'al-Ghat',tr:'Gat',ur:'الغاط',id:'Al Ghat',es:'Al Gat',bn:'আল-গাত',ms:'Al Ghat'},
        aliases: {ar:['الغاط','غاط']}, priority: 68 },
    { slug: 'al-hariq', lat: 23.6094, lng: 46.5119,
        names: {ar:'الحريق',en:'Al Hariq',fr:'Al Hariq',de:'al-Hariq',tr:'Harik',ur:'الحریق',id:'Al Hariq',es:'Al Hariq',bn:'আল-হারিক',ms:'Al Hariq'},
        aliases: {ar:['الحريق','حريق']}, priority: 68 },
    { slug: 'hawtat-sudair', lat: 25.8728, lng: 45.5294,
        names: {ar:'حوطة سدير',en:'Hawtat Sudair',fr:'Hawtat Sudair',de:'Hawtat Sudair',tr:'Havta Südeyr',ur:'حوطۃ سدیر',id:'Hawtat Sudair',es:'Hawtat Sudair',bn:'হাওতাত সুদাইর',ms:'Hawtat Sudair'},
        aliases: {ar:['حوطة سدير','سدير']}, priority: 68 },
    { slug: 'afif', lat: 23.9097, lng: 42.9239,
        names: {ar:'عفيف',en:'Afif',fr:'Afif',de:'Afif',tr:'Afif',ur:'عفیف',id:'Afif',es:'Afif',bn:'আফিফ',ms:'Afif'},
        aliases: {ar:['عفيف']}, priority: 75 },
    { slug: 'rumah', lat: 25.5667, lng: 47.1500,
        names: {ar:'رماح',en:'Rumah',fr:'Rumah',de:'Rumah',tr:'Rumah',ur:'رماح',id:'Rumah',es:'Rumah',bn:'রুমাহ',ms:'Rumah'},
        aliases: {ar:['رماح']}, priority: 65 },
    { slug: 'thadiq', lat: 25.2945, lng: 45.8628,
        names: {ar:'ثادق',en:'Thadiq',fr:'Thadiq',de:'Thadiq',tr:'Sadık',ur:'ثادق',id:'Thadiq',es:'Thadiq',bn:'থাদিক',ms:'Thadiq'},
        aliases: {ar:['ثادق']}, priority: 65 },
    { slug: 'marat', lat: 25.0667, lng: 45.4500,
        names: {ar:'مرات',en:'Marat',fr:'Marat',de:'Marat',tr:'Merat',ur:'مرات',id:'Marat',es:'Marat',bn:'মারাত',ms:'Marat'},
        aliases: {ar:['مرات','المرات']}, priority: 65 },
    { slug: 'al-quwaiyah', lat: 24.0500, lng: 45.2667,
        names: {ar:'القويعية',en:'Al Quwaiyah',fr:'Al Quwaïya',de:'al-Quwayʿiyya',tr:'Kuvayiyye',ur:'القویعیہ',id:'Al Quwaiyah',es:'Al Quwaiyah',bn:'আল-কুওয়াইয়াহ',ms:'Al Quwaiyah'},
        aliases: {ar:['القويعية','قويعية']}, priority: 76 },
    { slug: 'as-sulayyil', lat: 20.4625, lng: 45.5752,
        names: {ar:'السليل',en:'As-Sulayyil',fr:'As-Sulayyil',de:'as-Sulayyil',tr:'Süleyyil',ur:'السلیّل',id:'As-Sulayyil',es:'As-Sulayyil',bn:'আস-সুলায়িল',ms:'As-Sulayyil'},
        aliases: {ar:['السليل','سليل']}, priority: 72 },

    // ══════════ Makkah region (9) ══════════
    { slug: 'al-qunfudhah', lat: 19.1264, lng: 41.0791,
        names: {ar:'القنفذة',en:'Al Qunfudhah',fr:'Al Qunfudha',de:'al-Qunfudha',tr:'Kunfize',ur:'القنفذہ',id:'Al Qunfudhah',es:'Al Qunfudhah',bn:'আল-কুনফুদাহ',ms:'Al Qunfudhah'},
        aliases: {ar:['القنفذة','قنفذة'], en:['Qunfudah']}, priority: 80 },
    { slug: 'al-lith', lat: 20.1421, lng: 40.2671,
        names: {ar:'الليث',en:'Al Lith',fr:'Al Lith',de:'al-Lith',tr:'Leys',ur:'اللیث',id:'Al Lith',es:'Al Lith',bn:'আল-লিথ',ms:'Al Lith'},
        aliases: {ar:['الليث','ليث']}, priority: 76 },
    { slug: 'rabigh', lat: 22.7990, lng: 39.0345,
        names: {ar:'رابغ',en:'Rabigh',fr:'Rabigh',de:'Rabigh',tr:'Rabig',ur:'رابغ',id:'Rabigh',es:'Rabigh',bn:'রাবিগ',ms:'Rabigh'},
        aliases: {ar:['رابغ']}, priority: 80 },
    { slug: 'al-khurmah', lat: 21.9242, lng: 42.0489,
        names: {ar:'الخرمة',en:'Al Khurmah',fr:'Al Khourma',de:'al-Churma',tr:'Hurme',ur:'الخرمہ',id:'Al Khurmah',es:'Al Jurma',bn:'আল-খুরমাহ',ms:'Al Khurmah'},
        aliases: {ar:['الخرمة','خرمة']}, priority: 72 },
    { slug: 'turabah', lat: 21.2167, lng: 41.6333,
        names: {ar:'تربة',en:'Turabah',fr:'Tourba',de:'Turaba',tr:'Türebe',ur:'تربہ',id:'Turabah',es:'Turaba',bn:'তুরাবাহ',ms:'Turabah'},
        aliases: {ar:['تربة']}, priority: 70 },
    { slug: 'raniyah', lat: 21.2683, lng: 42.8633,
        names: {ar:'رنية',en:'Raniyah',fr:'Raniya',de:'Raniya',tr:'Raniye',ur:'رنیہ',id:'Raniyah',es:'Raniyah',bn:'রানিয়াহ',ms:'Raniyah'},
        aliases: {ar:['رنية']}, priority: 68 },
    { slug: 'al-kamil', lat: 21.8261, lng: 39.7800,
        names: {ar:'الكامل',en:'Al Kamil',fr:'Al Kamil',de:'al-Kamil',tr:'Kamil',ur:'الکامل',id:'Al Kamil',es:'Al Kamil',bn:'আল-কামিল',ms:'Al Kamil'},
        aliases: {ar:['الكامل','كامل']}, priority: 65 },
    { slug: 'adham', lat: 19.3611, lng: 41.4736,
        names: {ar:'أضم',en:'Adham',fr:'Adham',de:'Adham',tr:'Adham',ur:'اضم',id:'Adham',es:'Adham',bn:'আদাম',ms:'Adham'},
        aliases: {ar:['أضم','اضم']}, priority: 65 },
    { slug: 'maysan-sa', lat: 20.6500, lng: 41.0833,
        names: {ar:'ميسان',en:'Maysan',fr:'Maysan',de:'Maysan',tr:'Meysan',ur:'میسان',id:'Maysan',es:'Maysan',bn:'মাইসান',ms:'Maysan'},
        aliases: {ar:['ميسان']}, priority: 65 },

    // ══════════ Madinah region (6) — yanbu already curated, ينبع البحر added as alias ══════════
    { slug: 'al-ula', lat: 26.6086, lng: 37.9233,
        names: {ar:'العلا',en:'Al Ula',fr:'Al-`Ula',de:'al-ʿUla',tr:'Ula',ur:'العلا',id:'Al Ula',es:'Al-Ula',bn:'আল-উলা',ms:'Al Ula'},
        aliases: {ar:['العلا'], en:['AlUla','Ula']}, priority: 85 },
    { slug: 'khaybar', lat: 25.7000, lng: 39.2900,
        names: {ar:'خيبر',en:'Khaybar',fr:'Khaybar',de:'Chaibar',tr:'Hayber',ur:'خیبر',id:'Khaybar',es:'Jaybar',bn:'খাইবার',ms:'Khaybar'},
        aliases: {ar:['خيبر'], en:['Khaibar']}, priority: 80 },
    { slug: 'badr-sa', lat: 23.7800, lng: 38.7900,
        names: {ar:'بدر',en:'Badr',fr:'Badr',de:'Badr',tr:'Bedir',ur:'بدر',id:'Badr',es:'Badr',bn:'বদর',ms:'Badr'},
        aliases: {ar:['بدر'], en:['Badr Hunayn']}, priority: 78 },
    { slug: 'al-hanakiyah', lat: 24.8736, lng: 40.5147,
        names: {ar:'الحناكية',en:'Al Hanakiyah',fr:'Al Hanakiya',de:'al-Hanakiya',tr:'Hanakiye',ur:'الحناکیہ',id:'Al Hanakiyah',es:'Al Hanakiyah',bn:'আল-হানাকিয়াহ',ms:'Al Hanakiyah'},
        aliases: {ar:['الحناكية','حناكية']}, priority: 68 },
    { slug: 'al-mahd', lat: 23.4900, lng: 40.8533,
        names: {ar:'المهد',en:'Al Mahd',fr:'Al Mahd',de:'al-Mahd',tr:'Mehd',ur:'المہد',id:'Al Mahd',es:'Al Mahd',bn:'আল-মাহাদ',ms:'Al Mahd'},
        aliases: {ar:['المهد','مهد الذهب']}, priority: 68 },
    { slug: 'al-ays', lat: 25.0930, lng: 38.0530,
        names: {ar:'العيص',en:'Al Ays',fr:'Al Ays',de:'al-ʿAys',tr:'Ays',ur:'العیص',id:'Al Ays',es:'Al Ays',bn:'আল-আইস',ms:'Al Ays'},
        aliases: {ar:['العيص']}, priority: 65 },

    // ══════════ Qassim region (8) ══════════
    { slug: 'ar-rass', lat: 25.8696, lng: 43.4895,
        names: {ar:'الرس',en:'Ar Rass',fr:'Ar Rass',de:'ar-Rass',tr:'Ress',ur:'الرس',id:'Ar Rass',es:'Ar Rass',bn:'আর-রাস',ms:'Ar Rass'},
        aliases: {ar:['الرس'], en:['Al Rass','Rass']}, priority: 85 },
    { slug: 'al-bukayriyah', lat: 26.1389, lng: 43.6500,
        names: {ar:'البكيرية',en:'Al Bukayriyah',fr:'Al Bukayriya',de:'al-Bukayriyya',tr:'Bükeyriye',ur:'البکیریہ',id:'Al Bukayriyah',es:'Al Bukayriyah',bn:'আল-বুকাইরিয়াহ',ms:'Al Bukayriyah'},
        aliases: {ar:['البكيرية','بكيرية']}, priority: 76 },
    { slug: 'al-badayi', lat: 26.0500, lng: 43.7167,
        names: {ar:'البدائع',en:'Al Badayi',fr:'Al Badayi',de:'al-Badaʾiʿ',tr:'Bedayi',ur:'البدائع',id:'Al Badayi',es:'Al Badayi',bn:'আল-বাদাইয়ি',ms:'Al Badayi'},
        aliases: {ar:['البدائع','بدائع']}, priority: 70 },
    { slug: 'al-mithnab', lat: 25.8550, lng: 44.2225,
        names: {ar:'المذنب',en:'Al Mithnab',fr:'Al Mithnab',de:'al-Midhnab',tr:'Miznab',ur:'المذنب',id:'Al Mithnab',es:'Al Mithnab',bn:'আল-মিথনাব',ms:'Al Mithnab'},
        aliases: {ar:['المذنب','مذنب']}, priority: 72 },
    { slug: 'riyad-al-khabra', lat: 26.4961, lng: 43.6356,
        names: {ar:'رياض الخبراء',en:'Riyad Al Khabra',fr:'Riyad al-Khabra',de:'Riyad al-Chabraʾ',tr:'Riyad el-Habra',ur:'ریاض الخبراء',id:'Riyad Al Khabra',es:'Riyad Al Khabra',bn:'রিয়াদ আল-খাবরা',ms:'Riyad Al Khabra'},
        aliases: {ar:['رياض الخبراء']}, priority: 68 },
    { slug: 'al-asyah', lat: 26.1581, lng: 43.9714,
        names: {ar:'الأسياح',en:'Al Asyah',fr:'Al Asyah',de:'al-Asyah',tr:'Asyah',ur:'الأسیاح',id:'Al Asyah',es:'Al Asyah',bn:'আল-আসিয়াহ',ms:'Al Asyah'},
        aliases: {ar:['الأسياح','الاسياح']}, priority: 65 },
    { slug: 'uyun-al-jawa', lat: 26.5500, lng: 43.7167,
        names: {ar:'عيون الجواء',en:'Uyun Al Jawa',fr:'Uyun al-Jawa',de:'ʿUyun al-Dschiwaʾ',tr:'Uyun el-Cevvaʾ',ur:'عیون الجواء',id:'Uyun Al Jawa',es:'Uyun Al Jawa',bn:'উয়ুন আল-জাওয়া',ms:'Uyun Al Jawa'},
        aliases: {ar:['عيون الجواء']}, priority: 68 },
    { slug: 'ash-shimasiyah', lat: 26.5667, lng: 44.4167,
        names: {ar:'الشماسية',en:'Ash-Shimasiyah',fr:'Ach-Chimasiya',de:'asch-Schimasiyya',tr:'Şimasiye',ur:'الشماسیہ',id:'Ash-Shimasiyah',es:'Ash-Shimasiyah',bn:'আশ-শিমাসিয়াহ',ms:'Ash-Shimasiyah'},
        aliases: {ar:['الشماسية']}, priority: 65 },

    // ══════════ Asir region (9) ══════════
    { slug: 'bishah', lat: 19.9837, lng: 42.6033,
        names: {ar:'بيشة',en:'Bishah',fr:'Bicha',de:'Bischa',tr:'Bişe',ur:'بیشہ',id:'Bishah',es:'Bisha',bn:'বিশাহ',ms:'Bishah'},
        aliases: {ar:['بيشة'], en:['Bisha']}, priority: 85 },
    { slug: 'muhayil-asir', lat: 18.5400, lng: 42.0500,
        names: {ar:'محايل عسير',en:'Muhayil Asir',fr:'Muhayil Asir',de:'Muhayil ʿAsir',tr:'Muhayil',ur:'محایل عسیر',id:'Muhayil Asir',es:'Muhayil Asir',bn:'মুহাইল আসির',ms:'Muhayil Asir'},
        aliases: {ar:['محايل عسير','محايل','محائل']}, priority: 80 },
    { slug: 'an-nimas', lat: 19.1453, lng: 42.1217,
        names: {ar:'النماص',en:'An-Nimas',fr:'An-Nimas',de:'an-Nimas',tr:'Nimas',ur:'النماص',id:'An-Nimas',es:'An-Nimas',bn:'আন-নিমাস',ms:'An-Nimas'},
        aliases: {ar:['النماص','نماص']}, priority: 75 },
    { slug: 'tanuma', lat: 18.8800, lng: 42.4283,
        names: {ar:'تنومة',en:'Tanuma',fr:'Tanouma',de:'Tanuma',tr:'Tanume',ur:'تنومہ',id:'Tanuma',es:'Tanuma',bn:'তানুমা',ms:'Tanuma'},
        aliases: {ar:['تنومة']}, priority: 68 },
    { slug: 'al-majaridah', lat: 19.0467, lng: 42.0042,
        names: {ar:'المجاردة',en:'Al Majaridah',fr:'Al Majarida',de:'al-Madscharida',tr:'Mecaride',ur:'المجاردہ',id:'Al Majaridah',es:'Al Majaridah',bn:'আল-মাজারিদাহ',ms:'Al Majaridah'},
        aliases: {ar:['المجاردة','مجاردة']}, priority: 70 },
    { slug: 'rijal-alma', lat: 18.1958, lng: 42.2933,
        names: {ar:'رجال ألمع',en:'Rijal Alma',fr:'Rijal Alma',de:'Ridschal Almaʿ',tr:'Rical Almaʿ',ur:'رجال الَمع',id:'Rijal Alma',es:'Rijal Alma',bn:'রিজাল আলমা',ms:'Rijal Alma'},
        aliases: {ar:['رجال ألمع','رجال المع','رجال ألمعاء']}, priority: 70 },
    { slug: 'ahad-rufaidah', lat: 18.2167, lng: 42.7833,
        names: {ar:'أحد رفيدة',en:'Ahad Rufaidah',fr:'Ahad Rufaida',de:'Ahad Rufaida',tr:'Ahad Rüfeyde',ur:'احد رفیدہ',id:'Ahad Rufaidah',es:'Ahad Rufaidah',bn:'আহাদ রুফাইদাহ',ms:'Ahad Rufaidah'},
        aliases: {ar:['أحد رفيدة','احد رفيدة']}, priority: 70 },
    { slug: 'dhahran-al-janub', lat: 17.6294, lng: 43.4583,
        names: {ar:'ظهران الجنوب',en:'Dhahran Al Janub',fr:'Dhahran al-Janoub',de:'Dhahran al-Dschanub',tr:'Zahran el-Cenub',ur:'ظہران الجنوب',id:'Dhahran Al Janub',es:'Dhahran Al Janub',bn:'ধাহরান আল-জানুব',ms:'Dhahran Al Janub'},
        aliases: {ar:['ظهران الجنوب']}, priority: 68 },
    { slug: 'sarat-ubaidah', lat: 18.3933, lng: 43.0011,
        names: {ar:'سراة عبيدة',en:'Sarat Ubaidah',fr:'Sarat Ubayda',de:'Sarat ʿUbayda',tr:'Sarat Ubeyde',ur:'سراۃ عبیدہ',id:'Sarat Ubaidah',es:'Sarat Ubaidah',bn:'সারাত উবাইদা',ms:'Sarat Ubaidah'},
        aliases: {ar:['سراة عبيدة']}, priority: 68 },

    // ══════════ Tabuk region (6) ══════════
    { slug: 'tayma', lat: 27.6320, lng: 38.5390,
        names: {ar:'تيماء',en:'Tayma',fr:'Tayma',de:'Tayma',tr:'Teyma',ur:'تیماء',id:'Tayma',es:'Taima',bn:'তায়মা',ms:'Tayma'},
        aliases: {ar:['تيماء','تيما']}, priority: 76 },
    { slug: 'duba', lat: 27.3458, lng: 35.6917,
        names: {ar:'ضباء',en:'Duba',fr:'Douba',de:'Duba',tr:'Dube',ur:'ضباء',id:'Duba',es:'Duba',bn:'দুবা',ms:'Duba'},
        aliases: {ar:['ضباء','ضبا']}, priority: 75 },
    { slug: 'al-wajh', lat: 26.2417, lng: 36.4500,
        names: {ar:'الوجه',en:'Al Wajh',fr:'Al Wajh',de:'al-Wadschh',tr:'Vech',ur:'الوجہ',id:'Al Wajh',es:'Al Wayh',bn:'আল-ওয়াজ',ms:'Al Wajh'},
        aliases: {ar:['الوجه','وجه']}, priority: 75 },
    { slug: 'haql', lat: 29.2820, lng: 34.9450,
        names: {ar:'حقل',en:'Haql',fr:'Haql',de:'Haql',tr:'Hakl',ur:'حقل',id:'Haql',es:'Haql',bn:'হাকল',ms:'Haql'},
        aliases: {ar:['حقل']}, priority: 70 },
    { slug: 'umluj', lat: 25.0290, lng: 37.2658,
        names: {ar:'أملج',en:'Umluj',fr:'Oumlouj',de:'Umludsch',tr:'Umlüc',ur:'املج',id:'Umluj',es:'Umluj',bn:'উমলুজ',ms:'Umluj'},
        aliases: {ar:['أملج','املج']}, priority: 72 },
    { slug: 'al-bad', lat: 28.4644, lng: 35.0094,
        names: {ar:'البدع',en:'Al Bad',fr:'Al Bad',de:'al-Badʿ',tr:'Bedʿ',ur:'البدع',id:'Al Bad',es:'Al Bad',bn:'আল-বাদ',ms:'Al Bad'},
        aliases: {ar:['البدع','بدع']}, priority: 65 },

    // ══════════ Northern Borders (3) ══════════
    { slug: 'rafha', lat: 29.6300, lng: 43.5000,
        names: {ar:'رفحاء',en:'Rafha',fr:'Rafha',de:'Rafha',tr:'Refha',ur:'رفحاء',id:'Rafha',es:'Rafha',bn:'রাফহা',ms:'Rafha'},
        aliases: {ar:['رفحاء','رفحا']}, priority: 78 },
    { slug: 'turaif', lat: 31.6800, lng: 38.6633,
        names: {ar:'طريف',en:'Turaif',fr:'Tourayf',de:'Turaif',tr:'Türeyf',ur:'طریف',id:'Turaif',es:'Turaif',bn:'তুরাইফ',ms:'Turaif'},
        aliases: {ar:['طريف']}, priority: 76 },
    { slug: 'al-uwayqilah', lat: 30.3328, lng: 42.4322,
        names: {ar:'العويقيلة',en:'Al Uwayqilah',fr:'Al Uwayqila',de:'al-ʿUwayqila',tr:'Uveykile',ur:'العویقیلہ',id:'Al Uwayqilah',es:'Al Uwayqilah',bn:'আল-উওয়াইকিলাহ',ms:'Al Uwayqilah'},
        aliases: {ar:['العويقيلة']}, priority: 65 },

    // ══════════ Najran region (4) ══════════
    { slug: 'sharurah', lat: 17.4842, lng: 47.1167,
        names: {ar:'شرورة',en:'Sharurah',fr:'Charoura',de:'Scharura',tr:'Şarvara',ur:'شرورہ',id:'Sharurah',es:'Sharurah',bn:'শারূরাহ',ms:'Sharurah'},
        aliases: {ar:['شرورة']}, priority: 78 },
    { slug: 'habuna', lat: 17.9333, lng: 44.3667,
        names: {ar:'حبونا',en:'Habuna',fr:'Habuna',de:'Habuna',tr:'Habuna',ur:'حبونا',id:'Habuna',es:'Habuna',bn:'হাবুনা',ms:'Habuna'},
        aliases: {ar:['حبونا']}, priority: 65 },
    { slug: 'yadama', lat: 18.1331, lng: 45.0683,
        names: {ar:'يدمة',en:'Yadama',fr:'Yadama',de:'Yadama',tr:'Yedeme',ur:'یدمہ',id:'Yadama',es:'Yadama',bn:'য়াদামা',ms:'Yadama'},
        aliases: {ar:['يدمة']}, priority: 65 },
    { slug: 'badr-al-janub', lat: 17.8717, lng: 45.0850,
        names: {ar:'بدر الجنوب',en:'Badr Al Janub',fr:'Badr al-Janoub',de:'Badr al-Dschanub',tr:'Bedir el-Cenub',ur:'بدر الجنوب',id:'Badr Al Janub',es:'Badr Al Janub',bn:'বদর আল-জানুব',ms:'Badr Al Janub'},
        aliases: {ar:['بدر الجنوب']}, priority: 65 },

    // ══════════ Jazan region (8) ══════════
    { slug: 'sabya', lat: 17.1486, lng: 42.6249,
        names: {ar:'صبيا',en:'Sabya',fr:'Sabya',de:'Sabya',tr:'Sabya',ur:'صبیا',id:'Sabya',es:'Sabya',bn:'সাবিয়া',ms:'Sabya'},
        aliases: {ar:['صبيا']}, priority: 78 },
    { slug: 'samtah', lat: 16.5969, lng: 42.9469,
        names: {ar:'صامطة',en:'Samtah',fr:'Samta',de:'Samta',tr:'Samta',ur:'صامطہ',id:'Samtah',es:'Samtah',bn:'সামতাহ',ms:'Samtah'},
        aliases: {ar:['صامطة']}, priority: 72 },
    { slug: 'abu-arish', lat: 16.9692, lng: 42.8328,
        names: {ar:'أبو عريش',en:'Abu Arish',fr:'Abou Arich',de:'Abu ʿArisch',tr:'Ebu Ariş',ur:'ابو عریش',id:'Abu Arish',es:'Abu Arish',bn:'আবু আরিশ',ms:'Abu Arish'},
        aliases: {ar:['أبو عريش','ابو عريش']}, priority: 74 },
    { slug: 'bish', lat: 17.3947, lng: 42.5908,
        names: {ar:'بيش',en:'Bish',fr:'Bish',de:'Bisch',tr:'Biş',ur:'بیش',id:'Bish',es:'Bish',bn:'বিশ',ms:'Bish'},
        aliases: {ar:['بيش']}, priority: 68 },
    { slug: 'ad-darb', lat: 17.7333, lng: 41.9667,
        names: {ar:'الدرب',en:'Ad-Darb',fr:'Ad-Darb',de:'ad-Darb',tr:'Derb',ur:'الدرب',id:'Ad-Darb',es:'Ad-Darb',bn:'আদ-দারব',ms:'Ad-Darb'},
        aliases: {ar:['الدرب','درب']}, priority: 70 },
    { slug: 'farasan', lat: 16.6961, lng: 42.1186,
        names: {ar:'فرسان',en:'Farasan',fr:'Farasan',de:'Farasan',tr:'Ferasan',ur:'فرسان',id:'Farasan',es:'Farasan',bn:'ফারাসান',ms:'Farasan'},
        aliases: {ar:['فرسان','جزر فرسان']}, priority: 70 },
    { slug: 'ahad-al-masarihah', lat: 16.7081, lng: 42.9572,
        names: {ar:'أحد المسارحة',en:'Ahad Al Masarihah',fr:'Ahad al-Masariha',de:'Ahad al-Masariha',tr:'Ahad el-Mesariha',ur:'احد المسارحہ',id:'Ahad Al Masarihah',es:'Ahad Al Masarihah',bn:'আহাদ আল-মাসারিহাহ',ms:'Ahad Al Masarihah'},
        aliases: {ar:['أحد المسارحة','احد المسارحة']}, priority: 65 },
    { slug: 'al-aridah', lat: 16.9697, lng: 43.1075,
        names: {ar:'العارضة',en:'Al Aridah',fr:'Al Arida',de:'al-ʿArida',tr:'Aride',ur:'العارضہ',id:'Al Aridah',es:'Al Aridah',bn:'আল-আরিদাহ',ms:'Al Aridah'},
        aliases: {ar:['العارضة']}, priority: 65 },

    // ══════════ Eastern Province (5 NEW; abqaiq/khafji/hafar-al-batin already exist) ══════════
    { slug: 'an-nuayriyah', lat: 27.4774, lng: 48.4838,
        names: {ar:'النعيرية',en:'An-Nuayriyah',fr:'An-Nouayriya',de:'an-Nuʿayriyya',tr:'Nuayriye',ur:'النعیریہ',id:'An-Nuayriyah',es:'An-Nuayriyah',bn:'আন-নুআইরিয়াহ',ms:'An-Nuayriyah'},
        aliases: {ar:['النعيرية','نعيرية']}, priority: 74 },
    { slug: 'ras-tanura', lat: 26.6442, lng: 50.1581,
        names: {ar:'رأس تنورة',en:'Ras Tanura',fr:'Ras Tanura',de:'Ras Tanura',tr:'Ras Tanura',ur:'راس تنورہ',id:'Ras Tanura',es:'Ras Tanura',bn:'রাস তানুরা',ms:'Ras Tanura'},
        aliases: {ar:['رأس تنورة','راس تنورة']}, priority: 80 },
    { slug: 'safwa', lat: 26.6500, lng: 49.9667,
        names: {ar:'صفوى',en:'Safwa',fr:'Safwa',de:'Safwa',tr:'Safva',ur:'صفوی',id:'Safwa',es:'Safwa',bn:'সাফওয়া',ms:'Safwa'},
        aliases: {ar:['صفوى']}, priority: 72 },
    { slug: 'saihat', lat: 26.4833, lng: 49.9961,
        names: {ar:'سيهات',en:'Saihat',fr:'Saihat',de:'Sayhat',tr:'Seyhat',ur:'سیہات',id:'Saihat',es:'Saihat',bn:'সাইহাত',ms:'Saihat'},
        aliases: {ar:['سيهات']}, priority: 72 },
    { slug: 'qaryat-al-ulya', lat: 27.6167, lng: 47.5500,
        names: {ar:'قرية العليا',en:'Qaryat Al Ulya',fr:'Qaryat al-Ulya',de:'Qaryat al-ʿUlya',tr:'Karyetü\'l-Ulya',ur:'قریۃ العلیا',id:'Qaryat Al Ulya',es:'Qaryat Al Ulya',bn:'কারিয়াত আল-উলিয়া',ms:'Qaryat Al Ulya'},
        aliases: {ar:['قرية العليا']}, priority: 68 },

    // ══════════ Al Bahah region (5) ══════════
    { slug: 'baljurashi', lat: 19.8580, lng: 41.5670,
        names: {ar:'بلجرشي',en:'Baljurashi',fr:'Beljourachi',de:'Baldschuraschi',tr:'Belcüreşi',ur:'بلجرشی',id:'Baljurashi',es:'Baljurashi',bn:'বালজুরাশি',ms:'Baljurashi'},
        aliases: {ar:['بلجرشي']}, priority: 76 },
    { slug: 'al-makhwah', lat: 19.7556, lng: 41.4080,
        names: {ar:'المخواة',en:'Al Makhwah',fr:'Al Makhwa',de:'al-Machwa',tr:'Mahve',ur:'المخواہ',id:'Al Makhwah',es:'Al Makhwah',bn:'আল-মাখওয়াহ',ms:'Al Makhwah'},
        aliases: {ar:['المخواة','مخواة']}, priority: 70 },
    { slug: 'al-mandaq', lat: 20.1614, lng: 41.2789,
        names: {ar:'المندق',en:'Al Mandaq',fr:'Al Mandaq',de:'al-Mandaq',tr:'Mendak',ur:'المندق',id:'Al Mandaq',es:'Al Mandaq',bn:'আল-মান্দাক',ms:'Al Mandaq'},
        aliases: {ar:['المندق']}, priority: 68 },
    { slug: 'qilwah', lat: 19.7639, lng: 41.6314,
        names: {ar:'قلوة',en:'Qilwah',fr:'Qilwa',de:'Qilwa',tr:'Kilve',ur:'قلوہ',id:'Qilwah',es:'Qilwah',bn:'কিলওয়াহ',ms:'Qilwah'},
        aliases: {ar:['قلوة']}, priority: 65 },
    { slug: 'al-aqiq-sa', lat: 20.2700, lng: 41.6442,
        names: {ar:'العقيق',en:'Al Aqiq',fr:'Al Aqiq',de:'al-ʿAqiq',tr:'Akik',ur:'العقیق',id:'Al Aqiq',es:'Al Aqiq',bn:'আল-আকিক',ms:'Al Aqiq'},
        aliases: {ar:['العقيق']}, priority: 70 },

    // ══════════ Jouf + Hail (6) ══════════
    { slug: 'dumat-al-jandal', lat: 29.8084, lng: 39.8666,
        names: {ar:'دومة الجندل',en:'Dumat Al Jandal',fr:'Doumat al-Jandal',de:'Dumat al-Dschandal',tr:'Dumetü\'l-Cendel',ur:'دومۃ الجندل',id:'Dumat Al Jandal',es:'Dumat Al Jandal',bn:'দূমাত আল-জান্দাল',ms:'Dumat Al Jandal'},
        aliases: {ar:['دومة الجندل']}, priority: 78 },
    { slug: 'al-qurayyat', lat: 31.3340, lng: 37.3631,
        names: {ar:'القريات',en:'Al Qurayyat',fr:'Al Qourayyat',de:'al-Qurayyat',tr:'Kuriyat',ur:'القریات',id:'Al Qurayyat',es:'Al Qurayyat',bn:'আল-কুরাইয়াত',ms:'Al Qurayyat'},
        aliases: {ar:['القريات','قريات']}, priority: 80 },
    { slug: 'tabarjal', lat: 30.5036, lng: 38.2156,
        names: {ar:'طبرجل',en:'Tabarjal',fr:'Tabarjal',de:'Tabarjal',tr:'Tabarcel',ur:'طبرجل',id:'Tabarjal',es:'Tabarjal',bn:'তাবারজাল',ms:'Tabarjal'},
        aliases: {ar:['طبرجل']}, priority: 70 },
    { slug: 'baqaa', lat: 27.4500, lng: 41.9000,
        names: {ar:'بقعاء',en:'Baqaa',fr:'Baqaa',de:'Baqʿaʾ',tr:'Bakaaʾ',ur:'بقعاء',id:'Baqaa',es:'Baqaa',bn:'বাকা',ms:'Baqaa'},
        aliases: {ar:['بقعاء']}, priority: 65 },
    { slug: 'ash-shanan', lat: 27.0667, lng: 42.4833,
        names: {ar:'الشنان',en:'Ash-Shanan',fr:'Ach-Chanan',de:'asch-Schanan',tr:'Şenan',ur:'الشنان',id:'Ash-Shanan',es:'Ash-Shanan',bn:'আশ-শানান',ms:'Ash-Shanan'},
        aliases: {ar:['الشنان']}, priority: 65 },
    { slug: 'al-ghazalah', lat: 26.8000, lng: 41.7167,
        names: {ar:'الغزالة',en:'Al Ghazalah',fr:'Al Ghazala',de:'al-Ghazala',tr:'Gazale',ur:'الغزالہ',id:'Al Ghazalah',es:'Al Gazala',bn:'আল-গাজালা',ms:'Al Ghazalah'},
        aliases: {ar:['الغزالة']}, priority: 65 }
];

let added = 0;
for (const c of newCities) {
    if (seen.has(c.slug)) { console.log('  SKIP (exists)', c.slug); continue; }
    places.push({
        slug: c.slug, type: 'city', countryCode: 'sa',
        lat: c.lat, lng: c.lng, timezone: TZ,
        names: c.names, aliases: c.aliases,
        admin: { countryAr: CC_AR, countryEn: CC_EN },
        priority: c.priority, source: 'curated', verified: true
    });
    seen.add(c.slug);
    added++;
}

// ─── Add ينبع البحر as alias to existing yanbu entry ───
const yanbu = places.find(p => p.slug === 'yanbu');
if (yanbu) {
    yanbu.aliases.ar = yanbu.aliases.ar || [];
    for (const a of ['ينبع البحر','ينبع البحري']) {
        if (!yanbu.aliases.ar.includes(a)) {
            yanbu.aliases.ar.push(a);
            console.log('  ADD alias to yanbu:', a);
        }
    }
}

fs.writeFileSync(PATH, JSON.stringify(places, null, 2) + '\n');
console.log('Added', added, 'cities. Total entries:', places.length);
const sa = places.filter(p => p.countryCode === 'sa').length;
console.log('Saudi total now:', sa);
