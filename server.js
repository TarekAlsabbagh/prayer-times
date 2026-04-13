const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const zlib  = require('zlib');

const PORT    = process.env.PORT || 8080;
const ROOT    = __dirname;
const DB_DIR  = path.join(ROOT, 'db');   // قاعدة البيانات الدائمة

// كاش في الذاكرة لطلبات Nominatim (يمنع تكرار الطلبات ويتجنب rate limit)
const _geocodeCache = new Map();
const _GEOCACHE_TTL = 24 * 60 * 60 * 1000; // 24 ساعة

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff2':'font/woff2',
    '.mp3':  'audio/mpeg',
    '.ogg':  'audio/ogg',
    '.wav':  'audio/wav',
};

// ===== بيانات ثابتة مدمجة للمدن الكبرى =====
const STATIC_CITIES = {
  sa: [
    {nameAr:'الرياض',nameEn:'Riyadh',type:'city',lat:24.6877,lng:46.7219},
    {nameAr:'جدة',nameEn:'Jeddah',type:'city',lat:21.4858,lng:39.1925},
    {nameAr:'مكة المكرمة',nameEn:'Mecca',type:'city',lat:21.3891,lng:39.8579},
    {nameAr:'المدينة المنورة',nameEn:'Medina',type:'city',lat:24.5247,lng:39.5692},
    {nameAr:'الدمام',nameEn:'Dammam',type:'city',lat:26.3927,lng:49.9777},
    {nameAr:'الطائف',nameEn:'Ta\'if',type:'city',lat:21.2854,lng:40.4149},
    {nameAr:'أبها',nameEn:'Abha',type:'city',lat:18.2164,lng:42.5053},
    {nameAr:'تبوك',nameEn:'Tabuk',type:'city',lat:28.3998,lng:36.5701},
    {nameAr:'بريدة',nameEn:'Buraydah',type:'city',lat:26.3592,lng:43.9763},
    {nameAr:'حائل',nameEn:'Ha\'il',type:'city',lat:27.5114,lng:41.7208},
    {nameAr:'الخبر',nameEn:'Al Khobar',type:'city',lat:26.2192,lng:50.1978},
    {nameAr:'نجران',nameEn:'Najran',type:'city',lat:17.5655,lng:44.2276},
    {nameAr:'الجبيل',nameEn:'Al Jubayl',type:'city',lat:27.0174,lng:49.6583},
    {nameAr:'الأحساء',nameEn:'Al Ahsa',type:'city',lat:25.3697,lng:49.5871},
    {nameAr:'القطيف',nameEn:'Al Qatif',type:'city',lat:26.5217,lng:49.9983},
    {nameAr:'ينبع',nameEn:'Yanbu',type:'city',lat:24.0895,lng:38.0618},
    {nameAr:'الدوادمي',nameEn:'Ad Dawadimi',type:'city',lat:24.494,lng:44.3882},
    {nameAr:'عرعر',nameEn:'Arar',type:'city',lat:30.9753,lng:41.0381},
    {nameAr:'الرس',nameEn:'Ar Rass',type:'city',lat:25.8666,lng:43.5103},
    {nameAr:'شقراء',nameEn:'Shaqra',type:'city',lat:25.2318,lng:45.2609},
    {nameAr:'بيشة',nameEn:'Bisha',type:'city',lat:20.0044,lng:42.6035},
    {nameAr:'القريات',nameEn:'Al Qurayyat',type:'city',lat:31.3313,lng:37.3485},
    {nameAr:'الظهران',nameEn:'Dhahran',type:'city',lat:26.3161,lng:50.0747},
    {nameAr:'خميس مشيط',nameEn:'Khamis Mushait',type:'city',lat:18.3063,lng:42.729},
    {nameAr:'الباحة',nameEn:'Al Bahah',type:'city',lat:20.0129,lng:41.4677},
    {nameAr:'صبيا',nameEn:'Sabya',type:'city',lat:17.1528,lng:42.6264},
    {nameAr:'القنفذة',nameEn:'Al Qunfudhah',type:'city',lat:19.1287,lng:41.0793},
    {nameAr:'العيون',nameEn:'Al Oyun',type:'city',lat:26.8527,lng:43.6568},
    {nameAr:'المجمعة',nameEn:'Al Majma\'ah',type:'city',lat:25.8963,lng:45.3562},
    {nameAr:'الخرج',nameEn:'Al Kharj',type:'city',lat:24.1472,lng:47.3133},
    {nameAr:'عنيزة',nameEn:'Unayzah',type:'city',lat:26.0935,lng:43.9993},
    {nameAr:'الليث',nameEn:'Al Lith',type:'city',lat:20.1493,lng:40.2829},
    {nameAr:'القويعية',nameEn:'Al Quway\'iyah',type:'city',lat:24.0655,lng:45.272},
    {nameAr:'جازان',nameEn:'Jizan',type:'city',lat:16.889,lng:42.5512},
    {nameAr:'سكاكا',nameEn:'Sakaka',type:'city',lat:29.9697,lng:40.2048},
    {nameAr:'الوجه',nameEn:'Al Wajh',type:'city',lat:26.2362,lng:36.4601},
    {nameAr:'الزلفي',nameEn:'Az Zulfi',type:'city',lat:26.2938,lng:44.8091},
    {nameAr:'النماص',nameEn:'An Nimas',type:'city',lat:19.1167,lng:42.1294},
    {nameAr:'المثنب',nameEn:'Al Mithnab',type:'city',lat:25.8700,lng:44.2400},
    {nameAr:'رفحاء',nameEn:'Rafha',type:'city',lat:29.6257,lng:43.4866},
    {nameAr:'الهفوف',nameEn:'Al Hofuf',type:'city',lat:25.3662,lng:49.5807},
    {nameAr:'وادي الدواسر',nameEn:'Wadi Al Dawasir',type:'city',lat:20.505,lng:45.1887},
    {nameAr:'محايل عسير',nameEn:'Muhayil',type:'city',lat:18.5617,lng:42.0472},
    {nameAr:'الأفلاج',nameEn:'Al Aflaj',type:'city',lat:22.2763,lng:46.7044},
    {nameAr:'أم القرى',nameEn:'Umm Al Qura',type:'city',lat:21.4225,lng:39.8262},
    {nameAr:'الحوية',nameEn:'Al Hawiyah',type:'city',lat:21.55,lng:41.3},
    {nameAr:'ضباء',nameEn:'Duba',type:'city',lat:27.3584,lng:35.6591},
    {nameAr:'تنومة',nameEn:'Tanumah',type:'city',lat:19.6695,lng:42.3234},
    {nameAr:'الدلم',nameEn:'Ad Dilam',type:'city',lat:23.9926,lng:47.1627},
    {nameAr:'صفوى',nameEn:'Safwa',type:'city',lat:26.6479,lng:49.9979},
  ],
  sy: [
    {nameAr:'دمشق',nameEn:'Damascus',type:'city',lat:33.5102,lng:36.2913},
    {nameAr:'حلب',nameEn:'Aleppo',type:'city',lat:36.2021,lng:37.1343},
    {nameAr:'حمص',nameEn:'Homs',type:'city',lat:34.7324,lng:36.7137},
    {nameAr:'حماة',nameEn:'Hama',type:'city',lat:35.1418,lng:36.7578},
    {nameAr:'اللاذقية',nameEn:'Latakia',type:'city',lat:35.5317,lng:35.7914},
    {nameAr:'دير الزور',nameEn:'Deir ez-Zor',type:'city',lat:35.3352,lng:40.1416},
    {nameAr:'الرقة',nameEn:'Raqqa',type:'city',lat:35.9503,lng:39.0094},
    {nameAr:'السويداء',nameEn:'As-Suwayda',type:'city',lat:32.709,lng:36.5649},
    {nameAr:'درعا',nameEn:'Daraa',type:'city',lat:32.6189,lng:36.1021},
    {nameAr:'القامشلي',nameEn:'Qamishli',type:'city',lat:37.0519,lng:41.2277},
    {nameAr:'إدلب',nameEn:'Idlib',type:'city',lat:35.9311,lng:36.6338},
    {nameAr:'طرطوس',nameEn:'Tartus',type:'city',lat:34.8887,lng:35.8872},
    {nameAr:'بانياس',nameEn:'Baniyas',type:'city',lat:35.1875,lng:35.9417},
    {nameAr:'الحسكة',nameEn:'Al-Hasakah',type:'city',lat:36.5141,lng:40.7453},
    {nameAr:'منبج',nameEn:'Manbij',type:'city',lat:36.5222,lng:37.947},
    {nameAr:'جبلة',nameEn:'Jableh',type:'city',lat:35.3611,lng:35.9242},
    {nameAr:'دومة',nameEn:'Douma',type:'city',lat:33.5731,lng:36.4002},
    {nameAr:'عفرين',nameEn:'Afrin',type:'city',lat:36.5131,lng:36.8686},
    {nameAr:'جرابلس',nameEn:'Jarabulus',type:'city',lat:36.8161,lng:38.0103},
    {nameAr:'تدمر',nameEn:'Palmyra',type:'city',lat:34.5503,lng:38.2674},
    {nameAr:'بصرى الشام',nameEn:'Bosra',type:'city',lat:32.5163,lng:36.4813},
    {nameAr:'صلخد',nameEn:'Salkhad',type:'city',lat:32.4936,lng:36.7131},
  ],
  eg: [
    {nameAr:'القاهرة',nameEn:'Cairo',type:'city',lat:30.0444,lng:31.2357},
    {nameAr:'الإسكندرية',nameEn:'Alexandria',type:'city',lat:31.2001,lng:29.9187},
    {nameAr:'الجيزة',nameEn:'Giza',type:'city',lat:30.0131,lng:31.2089},
    {nameAr:'الإسماعيلية',nameEn:'Ismailia',type:'city',lat:30.5965,lng:32.2715},
    {nameAr:'بورسعيد',nameEn:'Port Said',type:'city',lat:31.2565,lng:32.2841},
    {nameAr:'السويس',nameEn:'Suez',type:'city',lat:29.9668,lng:32.5498},
    {nameAr:'الأقصر',nameEn:'Luxor',type:'city',lat:25.6872,lng:32.6396},
    {nameAr:'أسوان',nameEn:'Aswan',type:'city',lat:24.0889,lng:32.8998},
    {nameAr:'المنصورة',nameEn:'Mansoura',type:'city',lat:31.0364,lng:31.3807},
    {nameAr:'طنطا',nameEn:'Tanta',type:'city',lat:30.7865,lng:31.0004},
    {nameAr:'الزقازيق',nameEn:'Zagazig',type:'city',lat:30.5877,lng:31.5021},
    {nameAr:'دمياط',nameEn:'Damietta',type:'city',lat:31.4165,lng:31.8133},
    {nameAr:'المنيا',nameEn:'Minya',type:'city',lat:28.0871,lng:30.7618},
    {nameAr:'أسيوط',nameEn:'Asyut',type:'city',lat:27.1809,lng:31.1837},
    {nameAr:'سوهاج',nameEn:'Sohag',type:'city',lat:26.559,lng:31.6957},
    {nameAr:'قنا',nameEn:'Qena',type:'city',lat:26.1601,lng:32.7185},
    {nameAr:'الفيوم',nameEn:'Faiyum',type:'city',lat:29.3084,lng:30.8428},
    {nameAr:'بني سويف',nameEn:'Beni Suef',type:'city',lat:29.0661,lng:31.0994},
    {nameAr:'الغردقة',nameEn:'Hurghada',type:'city',lat:27.2574,lng:33.8129},
    {nameAr:'مرسى مطروح',nameEn:'Marsa Matruh',type:'city',lat:31.3543,lng:27.2373},
    {nameAr:'شرم الشيخ',nameEn:'Sharm el-Sheikh',type:'city',lat:27.9158,lng:34.3299},
    {nameAr:'المحلة الكبرى',nameEn:'Mahalla',type:'city',lat:30.9712,lng:31.1653},
    {nameAr:'شبين الكوم',nameEn:'Shibin al-Kawm',type:'city',lat:30.5616,lng:31.0124},
    {nameAr:'كفر الشيخ',nameEn:'Kafr el-Sheikh',type:'city',lat:31.1107,lng:30.9388},
    {nameAr:'بنها',nameEn:'Banha',type:'city',lat:30.4626,lng:31.184},
    {nameAr:'الغربية',nameEn:'Gharbia',type:'city',lat:30.8666,lng:30.9833},
    {nameAr:'دسوق',nameEn:'Desouq',type:'city',lat:31.1283,lng:30.6476},
    {nameAr:'بلبيس',nameEn:'Bilbeis',type:'city',lat:30.4177,lng:31.5619},
    {nameAr:'المنوفية',nameEn:'Monufia',type:'city',lat:30.5975,lng:30.9876},
    {nameAr:'القليوبية',nameEn:'Qalyubia',type:'city',lat:30.3299,lng:31.2168},
  ],
  iq: [
    {nameAr:'بغداد',nameEn:'Baghdad',type:'city',lat:33.3152,lng:44.3661},
    {nameAr:'البصرة',nameEn:'Basra',type:'city',lat:30.5081,lng:47.7835},
    {nameAr:'الموصل',nameEn:'Mosul',type:'city',lat:36.34,lng:43.1333},
    {nameAr:'أربيل',nameEn:'Erbil',type:'city',lat:36.1912,lng:44.0092},
    {nameAr:'السليمانية',nameEn:'Sulaymaniyah',type:'city',lat:35.5572,lng:45.4351},
    {nameAr:'كركوك',nameEn:'Kirkuk',type:'city',lat:35.4681,lng:44.3922},
    {nameAr:'النجف',nameEn:'Najaf',type:'city',lat:32.0081,lng:44.3366},
    {nameAr:'كربلاء',nameEn:'Karbala',type:'city',lat:32.6162,lng:44.0242},
    {nameAr:'الحلة',nameEn:'Al Hillah',type:'city',lat:32.4725,lng:44.4288},
    {nameAr:'الناصرية',nameEn:'Nasiriyah',type:'city',lat:31.0446,lng:46.2577},
    {nameAr:'العمارة',nameEn:'Al Amarah',type:'city',lat:31.839,lng:47.1481},
    {nameAr:'الكوت',nameEn:'Al Kut',type:'city',lat:32.5,lng:45.8319},
    {nameAr:'الرمادي',nameEn:'Ramadi',type:'city',lat:33.4244,lng:43.299},
    {nameAr:'الفلوجة',nameEn:'Fallujah',type:'city',lat:33.3572,lng:43.7796},
    {nameAr:'تكريت',nameEn:'Tikrit',type:'city',lat:34.5965,lng:43.6812},
    {nameAr:'سامراء',nameEn:'Samarra',type:'city',lat:34.2015,lng:43.8756},
    {nameAr:'الديوانية',nameEn:'Al Diwaniyah',type:'city',lat:31.9888,lng:44.9246},
    {nameAr:'دهوك',nameEn:'Dohuk',type:'city',lat:36.8674,lng:42.9946},
    {nameAr:'بعقوبة',nameEn:'Baqubah',type:'city',lat:33.7467,lng:44.6532},
    {nameAr:'زاخو',nameEn:'Zakho',type:'city',lat:37.1444,lng:42.6839},
    {nameAr:'الحي',nameEn:'Al Hayy',type:'city',lat:32.1746,lng:46.0448},
    {nameAr:'العزيزية',nameEn:'Al Aziziyah',type:'city',lat:32.9098,lng:45.0665},
    {nameAr:'النخيب',nameEn:'Al Nukhayb',type:'city',lat:32.0333,lng:42.2667},
  ],
  jo: [
    {nameAr:'عمّان',nameEn:'Amman',type:'city',lat:31.9539,lng:35.9106},
    {nameAr:'الزرقاء',nameEn:'Zarqa',type:'city',lat:32.0728,lng:36.0879},
    {nameAr:'إربد',nameEn:'Irbid',type:'city',lat:32.5568,lng:35.8469},
    {nameAr:'العقبة',nameEn:'Aqaba',type:'city',lat:29.5321,lng:35.0062},
    {nameAr:'السلط',nameEn:'As-Salt',type:'city',lat:32.0392,lng:35.727},
    {nameAr:'مادبا',nameEn:'Madaba',type:'city',lat:31.7167,lng:35.8},
    {nameAr:'الكرك',nameEn:'Al Karak',type:'city',lat:31.1797,lng:35.7047},
    {nameAr:'المفرق',nameEn:'Mafraq',type:'city',lat:32.3418,lng:36.2024},
    {nameAr:'جرش',nameEn:'Jerash',type:'city',lat:32.2764,lng:35.8969},
    {nameAr:'عجلون',nameEn:'Ajloun',type:'city',lat:32.3338,lng:35.7508},
    {nameAr:'معان',nameEn:'Ma\'an',type:'city',lat:30.1942,lng:35.7347},
    {nameAr:'الطفيلة',nameEn:'Tafilah',type:'city',lat:30.8337,lng:35.6043},
    {nameAr:'رصيفة',nameEn:'Russeifa',type:'city',lat:32.0163,lng:36.0615},
    {nameAr:'الرمثا',nameEn:'Ramtha',type:'city',lat:32.5683,lng:35.9994},
    {nameAr:'الحسين',nameEn:'Al Hussein',type:'city',lat:31.5,lng:35.95},
  ],
  lb: [
    {nameAr:'بيروت',nameEn:'Beirut',type:'city',lat:33.8869,lng:35.5131},
    {nameAr:'طرابلس',nameEn:'Tripoli',type:'city',lat:34.4367,lng:35.8497},
    {nameAr:'صيدا',nameEn:'Sidon',type:'city',lat:33.5631,lng:35.3714},
    {nameAr:'صور',nameEn:'Tyre',type:'city',lat:33.2705,lng:35.2037},
    {nameAr:'زحلة',nameEn:'Zahlé',type:'city',lat:33.8467,lng:35.9018},
    {nameAr:'جونية',nameEn:'Jounieh',type:'city',lat:33.9808,lng:35.6178},
    {nameAr:'النبطية',nameEn:'Nabatieh',type:'city',lat:33.3772,lng:35.4839},
    {nameAr:'بعلبك',nameEn:'Baalbek',type:'city',lat:34.0046,lng:36.2109},
    {nameAr:'حلبا',nameEn:'Halba',type:'city',lat:34.5487,lng:36.0785},
    {nameAr:'بنت جبيل',nameEn:'Bint Jbeil',type:'city',lat:33.1181,lng:35.4311},
    {nameAr:'جبيل',nameEn:'Byblos',type:'city',lat:34.1235,lng:35.6488},
    {nameAr:'عاليه',nameEn:'Aley',type:'city',lat:33.8103,lng:35.5986},
    {nameAr:'دير القمر',nameEn:'Deir el Qamar',type:'city',lat:33.6912,lng:35.5798},
  ],
  ae: [
    {nameAr:'دبي',nameEn:'Dubai',type:'city',lat:25.2048,lng:55.2708},
    {nameAr:'أبوظبي',nameEn:'Abu Dhabi',type:'city',lat:24.4539,lng:54.3773},
    {nameAr:'الشارقة',nameEn:'Sharjah',type:'city',lat:25.3463,lng:55.4209},
    {nameAr:'عجمان',nameEn:'Ajman',type:'city',lat:25.4052,lng:55.5136},
    {nameAr:'رأس الخيمة',nameEn:'Ras Al Khaimah',type:'city',lat:25.7895,lng:55.9432},
    {nameAr:'الفجيرة',nameEn:'Fujairah',type:'city',lat:25.1288,lng:56.3265},
    {nameAr:'أم القيوين',nameEn:'Umm Al Quwain',type:'city',lat:25.5647,lng:55.5553},
    {nameAr:'العين',nameEn:'Al Ain',type:'city',lat:24.2075,lng:55.7447},
    {nameAr:'خور فكان',nameEn:'Khor Fakkan',type:'city',lat:25.3318,lng:56.3437},
    {nameAr:'دبا الفجيرة',nameEn:'Dibba',type:'city',lat:25.6186,lng:56.2661},
    {nameAr:'الظيد',nameEn:'Al Dhaid',type:'city',lat:25.2887,lng:55.8763},
    {nameAr:'مدينة زايد',nameEn:'Madinat Zayed',type:'city',lat:23.6567,lng:53.7074},
  ],
  kw: [
    {nameAr:'الكويت',nameEn:'Kuwait City',type:'city',lat:29.3697,lng:47.9783},
    {nameAr:'الجهراء',nameEn:'Al Jahra',type:'city',lat:29.3373,lng:47.6578},
    {nameAr:'الأحمدي',nameEn:'Al Ahmadi',type:'city',lat:29.0769,lng:48.0839},
    {nameAr:'الفروانية',nameEn:'Al Farwaniyah',type:'city',lat:29.2769,lng:47.9534},
    {nameAr:'حولي',nameEn:'Hawalli',type:'city',lat:29.3327,lng:48.0323},
    {nameAr:'مبارك الكبير',nameEn:'Mubarak Al-Kabeer',type:'city',lat:29.2074,lng:48.0591},
    {nameAr:'السالمية',nameEn:'Salmiya',type:'city',lat:29.3345,lng:48.0741},
    {nameAr:'الرميثية',nameEn:'Rumaithiya',type:'city',lat:29.3253,lng:48.0856},
    {nameAr:'صباح السالم',nameEn:'Sabah Al Salem',type:'city',lat:29.2611,lng:48.0664},
  ],
  qa: [
    {nameAr:'الدوحة',nameEn:'Doha',type:'city',lat:25.2854,lng:51.531},
    {nameAr:'الريان',nameEn:'Al Rayyan',type:'city',lat:25.2919,lng:51.4243},
    {nameAr:'الوكرة',nameEn:'Al Wakrah',type:'city',lat:25.1664,lng:51.6084},
    {nameAr:'الخور',nameEn:'Al Khor',type:'city',lat:25.6833,lng:51.5},
    {nameAr:'مسيعيد',nameEn:'Mesaieed',type:'city',lat:24.9951,lng:51.5593},
    {nameAr:'الشحانية',nameEn:'Al Shahaniya',type:'city',lat:25.4167,lng:51.2167},
    {nameAr:'الجميلية',nameEn:'Al Jumaliyah',type:'city',lat:25.6297,lng:51.084},
    {nameAr:'دخان',nameEn:'Dukhan',type:'city',lat:25.4233,lng:50.7804},
  ],
  bh: [
    {nameAr:'المنامة',nameEn:'Manama',type:'city',lat:26.215,lng:50.5832},
    {nameAr:'المحرق',nameEn:'Muharraq',type:'city',lat:26.2468,lng:50.6098},
    {nameAr:'الرفاع',nameEn:'Riffa',type:'city',lat:26.13,lng:50.555},
    {nameAr:'مدينة حمد',nameEn:'Hamad Town',type:'city',lat:26.1121,lng:50.5078},
    {nameAr:'مدينة عيسى',nameEn:'Isa Town',type:'city',lat:26.1734,lng:50.5481},
    {nameAr:'سترة',nameEn:'Sitra',type:'city',lat:26.1568,lng:50.6228},
    {nameAr:'جدحفص',nameEn:'Jidhafs',type:'city',lat:26.2127,lng:50.5394},
    {nameAr:'الجفير',nameEn:'Juffair',type:'city',lat:26.2196,lng:50.5945},
  ],
  om: [
    {nameAr:'مسقط',nameEn:'Muscat',type:'city',lat:23.5957,lng:58.5933},
    {nameAr:'صلالة',nameEn:'Salalah',type:'city',lat:17.0159,lng:54.0924},
    {nameAr:'نزوى',nameEn:'Nizwa',type:'city',lat:22.9333,lng:57.5333},
    {nameAr:'صحار',nameEn:'Sohar',type:'city',lat:24.3429,lng:56.7456},
    {nameAr:'السيب',nameEn:'Seeb',type:'city',lat:23.6693,lng:58.1722},
    {nameAr:'صور',nameEn:'Sur',type:'city',lat:22.5668,lng:59.5289},
    {nameAr:'عبري',nameEn:'Ibri',type:'city',lat:23.2255,lng:56.5128},
    {nameAr:'بهلاء',nameEn:'Bahla',type:'city',lat:22.9645,lng:57.2948},
    {nameAr:'الرستاق',nameEn:'Rustaq',type:'city',lat:23.3919,lng:57.4266},
    {nameAr:'خصب',nameEn:'Khasab',type:'city',lat:26.1891,lng:56.2395},
    {nameAr:'إبراء',nameEn:'Ibra',type:'city',lat:22.6909,lng:58.5357},
    {nameAr:'عمان',nameEn:'Oman',type:'city',lat:21.4735,lng:55.9754},
    {nameAr:'ثمريت',nameEn:'Thumrayt',type:'city',lat:17.6625,lng:54.0285},
    {nameAr:'بركاء',nameEn:'Barka',type:'city',lat:23.6752,lng:57.8901},
    {nameAr:'مطرح',nameEn:'Mutrah',type:'city',lat:23.6191,lng:58.5927},
  ],
  ye: [
    {nameAr:'صنعاء',nameEn:'Sanaa',type:'city',lat:15.3694,lng:44.191},
    {nameAr:'عدن',nameEn:'Aden',type:'city',lat:12.7797,lng:45.0095},
    {nameAr:'تعز',nameEn:'Taiz',type:'city',lat:13.5795,lng:44.0177},
    {nameAr:'الحديدة',nameEn:'Hudaydah',type:'city',lat:14.7978,lng:42.9544},
    {nameAr:'إب',nameEn:'Ibb',type:'city',lat:13.9747,lng:44.1833},
    {nameAr:'مأرب',nameEn:'Marib',type:'city',lat:15.4669,lng:45.3226},
    {nameAr:'ذمار',nameEn:'Dhamar',type:'city',lat:14.5425,lng:44.4041},
    {nameAr:'حجة',nameEn:'Hajjah',type:'city',lat:15.6931,lng:43.5978},
    {nameAr:'المكلا',nameEn:'Mukalla',type:'city',lat:14.5324,lng:49.1247},
    {nameAr:'سيئون',nameEn:'Seiyun',type:'city',lat:15.9426,lng:48.7883},
    {nameAr:'صعدة',nameEn:'Saada',type:'city',lat:16.935,lng:43.7612},
    {nameAr:'الضالع',nameEn:'Daleh',type:'city',lat:13.6957,lng:44.7317},
    {nameAr:'البيضاء',nameEn:'Al Bayda',type:'city',lat:14.0004,lng:45.5727},
    {nameAr:'المنصورة',nameEn:'Al Mansura',type:'city',lat:12.8221,lng:44.9969},
    {nameAr:'شبوة',nameEn:'Shabwah',type:'city',lat:14.5333,lng:47.05},
    {nameAr:'أبين',nameEn:'Abyan',type:'city',lat:13.3617,lng:45.3733},
    {nameAr:'لحج',nameEn:'Lahij',type:'city',lat:13.0588,lng:44.8811},
    {nameAr:'ريدة',nameEn:'Rida',type:'city',lat:15.8667,lng:44.0333},
  ],
  ly: [
    {nameAr:'طرابلس',nameEn:'Tripoli',type:'city',lat:32.8872,lng:13.1913},
    {nameAr:'بنغازي',nameEn:'Benghazi',type:'city',lat:32.1167,lng:20.0667},
    {nameAr:'مصراتة',nameEn:'Misrata',type:'city',lat:32.3754,lng:15.0925},
    {nameAr:'الزاوية',nameEn:'Zawiya',type:'city',lat:32.7522,lng:12.7279},
    {nameAr:'البيضاء',nameEn:'Al Bayda',type:'city',lat:32.7636,lng:21.7553},
    {nameAr:'سبها',nameEn:'Sabha',type:'city',lat:27.0369,lng:14.4289},
    {nameAr:'أجدابيا',nameEn:'Ajdabiya',type:'city',lat:30.7554,lng:20.2264},
    {nameAr:'الخمس',nameEn:'Al Khums',type:'city',lat:32.6486,lng:14.2619},
    {nameAr:'ترهونة',nameEn:'Tarhuna',type:'city',lat:32.4346,lng:13.6367},
    {nameAr:'غريان',nameEn:'Gharyan',type:'city',lat:32.1724,lng:13.0201},
    {nameAr:'زليتن',nameEn:'Zliten',type:'city',lat:32.4674,lng:14.5688},
    {nameAr:'توكرة',nameEn:'Tocra',type:'city',lat:32.5323,lng:20.5823},
    {nameAr:'سرت',nameEn:'Sirte',type:'city',lat:31.2089,lng:16.5887},
    {nameAr:'درنة',nameEn:'Derna',type:'city',lat:32.7668,lng:22.6335},
    {nameAr:'مرزق',nameEn:'Murzuq',type:'city',lat:25.9167,lng:13.9167},
    {nameAr:'غدامس',nameEn:'Ghadames',type:'city',lat:30.1333,lng:9.5},
  ],
  tn: [
    {nameAr:'تونس',nameEn:'Tunis',type:'city',lat:36.8065,lng:10.1815},
    {nameAr:'صفاقس',nameEn:'Sfax',type:'city',lat:34.7406,lng:10.7603},
    {nameAr:'سوسة',nameEn:'Sousse',type:'city',lat:35.8245,lng:10.638},
    {nameAr:'القيروان',nameEn:'Kairouan',type:'city',lat:35.6781,lng:10.0963},
    {nameAr:'بنزرت',nameEn:'Bizerte',type:'city',lat:37.2744,lng:9.8739},
    {nameAr:'قابس',nameEn:'Gabes',type:'city',lat:33.8882,lng:10.0975},
    {nameAr:'المنستير',nameEn:'Monastir',type:'city',lat:35.7643,lng:10.8113},
    {nameAr:'قفصة',nameEn:'Gafsa',type:'city',lat:34.425,lng:8.7842},
    {nameAr:'المهدية',nameEn:'Mahdia',type:'city',lat:35.5047,lng:11.0622},
    {nameAr:'تطاوين',nameEn:'Tataouine',type:'city',lat:32.9297,lng:10.4518},
    {nameAr:'قبلي',nameEn:'Kebili',type:'city',lat:33.7053,lng:8.9726},
    {nameAr:'نابل',nameEn:'Nabeul',type:'city',lat:36.4513,lng:10.7352},
    {nameAr:'زغوان',nameEn:'Zaghouan',type:'city',lat:36.4028,lng:10.1433},
    {nameAr:'سليانة',nameEn:'Siliana',type:'city',lat:36.0848,lng:9.3696},
    {nameAr:'الكاف',nameEn:'Kef',type:'city',lat:36.1741,lng:8.7108},
    {nameAr:'جندوبة',nameEn:'Jendouba',type:'city',lat:36.5011,lng:8.7803},
    {nameAr:'باجة',nameEn:'Beja',type:'city',lat:36.7333,lng:9.1833},
    {nameAr:'أريانة',nameEn:'Ariana',type:'city',lat:36.8625,lng:10.1956},
    {nameAr:'مدنين',nameEn:'Medenine',type:'city',lat:33.3547,lng:10.5053},
    {nameAr:'قرقنة',nameEn:'Kerkennah',type:'city',lat:34.7167,lng:11.1833},
  ],
  dz: [
    {nameAr:'الجزائر العاصمة',nameEn:'Algiers',type:'city',lat:36.7372,lng:3.0865},
    {nameAr:'وهران',nameEn:'Oran',type:'city',lat:35.6969,lng:-0.6331},
    {nameAr:'قسنطينة',nameEn:'Constantine',type:'city',lat:36.365,lng:6.6147},
    {nameAr:'عنابة',nameEn:'Annaba',type:'city',lat:36.9,lng:7.7667},
    {nameAr:'بجاية',nameEn:'Bejaia',type:'city',lat:36.7519,lng:5.0567},
    {nameAr:'تلمسان',nameEn:'Tlemcen',type:'city',lat:34.8828,lng:-1.3153},
    {nameAr:'سطيف',nameEn:'Setif',type:'city',lat:36.1898,lng:5.4108},
    {nameAr:'بسكرة',nameEn:'Biskra',type:'city',lat:34.8503,lng:5.7287},
    {nameAr:'تيزي وزو',nameEn:'Tizi Ouzou',type:'city',lat:36.7169,lng:4.0497},
    {nameAr:'البليدة',nameEn:'Blida',type:'city',lat:36.4703,lng:2.8277},
    {nameAr:'سكيكدة',nameEn:'Skikda',type:'city',lat:36.8761,lng:6.9044},
    {nameAr:'المسيلة',nameEn:'M\'Sila',type:'city',lat:35.7058,lng:4.5439},
    {nameAr:'تيارت',nameEn:'Tiaret',type:'city',lat:35.3706,lng:1.3178},
    {nameAr:'تبسة',nameEn:'Tebessa',type:'city',lat:35.4042,lng:8.1208},
    {nameAr:'جيجل',nameEn:'Jijel',type:'city',lat:36.8167,lng:5.7667},
    {nameAr:'مستغانم',nameEn:'Mostaganem',type:'city',lat:35.9311,lng:0.0894},
    {nameAr:'برج بوعريريج',nameEn:'Bordj Bou Arreridj',type:'city',lat:36.0731,lng:4.7633},
    {nameAr:'باتنة',nameEn:'Batna',type:'city',lat:35.5554,lng:6.1743},
    {nameAr:'الأغواط',nameEn:'Laghouat',type:'city',lat:33.8005,lng:2.8651},
    {nameAr:'الجلفة',nameEn:'Djelfa',type:'city',lat:34.6733,lng:3.2633},
    {nameAr:'غرداية',nameEn:'Ghardaïa',type:'city',lat:32.4903,lng:3.6739},
    {nameAr:'أدرار',nameEn:'Adrar',type:'city',lat:27.8742,lng:-0.2944},
    {nameAr:'تمنراست',nameEn:'Tamanrasset',type:'city',lat:22.785,lng:5.5228},
    {nameAr:'بومرداس',nameEn:'Boumerdes',type:'city',lat:36.7667,lng:3.4772},
    {nameAr:'الشلف',nameEn:'Chlef',type:'city',lat:36.1649,lng:1.3317},
  ],
  ma: [
    {nameAr:'الرباط',nameEn:'Rabat',type:'city',lat:34.0209,lng:-6.8417},
    {nameAr:'الدار البيضاء',nameEn:'Casablanca',type:'city',lat:33.5731,lng:-7.5898},
    {nameAr:'فاس',nameEn:'Fes',type:'city',lat:34.0333,lng:-5.0},
    {nameAr:'مراكش',nameEn:'Marrakech',type:'city',lat:31.6295,lng:-7.9811},
    {nameAr:'مكناس',nameEn:'Meknes',type:'city',lat:33.8935,lng:-5.5473},
    {nameAr:'طنجة',nameEn:'Tangier',type:'city',lat:35.7595,lng:-5.834},
    {nameAr:'أكادير',nameEn:'Agadir',type:'city',lat:30.4278,lng:-9.5981},
    {nameAr:'وجدة',nameEn:'Oujda',type:'city',lat:34.6814,lng:-1.9086},
    {nameAr:'القنيطرة',nameEn:'Kenitra',type:'city',lat:34.261,lng:-6.5802},
    {nameAr:'تطوان',nameEn:'Tetouan',type:'city',lat:35.5785,lng:-5.3684},
    {nameAr:'سلا',nameEn:'Sale',type:'city',lat:34.0531,lng:-6.7985},
    {nameAr:'سطات',nameEn:'Settat',type:'city',lat:33.0,lng:-7.6167},
    {nameAr:'الجديدة',nameEn:'El Jadida',type:'city',lat:33.2316,lng:-8.5007},
    {nameAr:'خريبكة',nameEn:'Khouribga',type:'city',lat:32.8811,lng:-6.9063},
    {nameAr:'الناظور',nameEn:'Nador',type:'city',lat:35.1741,lng:-2.9287},
    {nameAr:'بني ملال',nameEn:'Beni Mellal',type:'city',lat:32.3373,lng:-6.3498},
    {nameAr:'تازة',nameEn:'Taza',type:'city',lat:34.2155,lng:-4.0104},
    {nameAr:'الحسيمة',nameEn:'Al Hoceima',type:'city',lat:35.2517,lng:-3.9372},
    {nameAr:'آسفي',nameEn:'Safi',type:'city',lat:32.2994,lng:-9.2372},
    {nameAr:'ورزازات',nameEn:'Ouarzazate',type:'city',lat:30.9335,lng:-6.9370},
    {nameAr:'العرائش',nameEn:'Larache',type:'city',lat:35.1932,lng:-6.1561},
    {nameAr:'برشيد',nameEn:'Berrechid',type:'city',lat:33.2655,lng:-7.5884},
    {nameAr:'القصر الكبير',nameEn:'Ksar el-Kebir',type:'city',lat:35.0002,lng:-5.9014},
    {nameAr:'المحمدية',nameEn:'Mohammedia',type:'city',lat:33.6861,lng:-7.3828},
    {nameAr:'إفران',nameEn:'Ifrane',type:'city',lat:33.5228,lng:-5.1073},
  ],
  sd: [
    {nameAr:'الخرطوم',nameEn:'Khartoum',type:'city',lat:15.5007,lng:32.5599},
    {nameAr:'أم درمان',nameEn:'Omdurman',type:'city',lat:15.6445,lng:32.4777},
    {nameAr:'بورتسودان',nameEn:'Port Sudan',type:'city',lat:19.6158,lng:37.2164},
    {nameAr:'كسلا',nameEn:'Kassala',type:'city',lat:15.4517,lng:36.4},
    {nameAr:'الأبيض',nameEn:'Al-Ubayyid',type:'city',lat:13.1833,lng:30.2167},
    {nameAr:'نيالا',nameEn:'Nyala',type:'city',lat:12.0489,lng:24.8878},
    {nameAr:'عطبرة',nameEn:'Atbara',type:'city',lat:17.7,lng:33.9833},
    {nameAr:'الفاشر',nameEn:'El Fasher',type:'city',lat:13.6286,lng:25.3511},
    {nameAr:'مدني',nameEn:'Medani',type:'city',lat:14.3836,lng:33.4882},
    {nameAr:'الدمازين',nameEn:'Ad Damazin',type:'city',lat:11.7900,lng:34.3600},
    {nameAr:'سنار',nameEn:'Sennar',type:'city',lat:13.5500,lng:33.6333},
    {nameAr:'ربك',nameEn:'Rabak',type:'city',lat:13.1780,lng:32.7417},
    {nameAr:'القضارف',nameEn:'Al Qadarif',type:'city',lat:14.0439,lng:35.3863},
    {nameAr:'زالنجي',nameEn:'Zalingei',type:'city',lat:12.9068,lng:23.4706},
  ],
  ps: [
    {nameAr:'القدس',nameEn:'Jerusalem',type:'city',lat:31.7683,lng:35.2137},
    {nameAr:'غزة',nameEn:'Gaza',type:'city',lat:31.5017,lng:34.4668},
    {nameAr:'الضفة الغربية',nameEn:'West Bank',type:'city',lat:32.0,lng:35.25},
    {nameAr:'نابلس',nameEn:'Nablus',type:'city',lat:32.2211,lng:35.2544},
    {nameAr:'رام الله',nameEn:'Ramallah',type:'city',lat:31.8996,lng:35.2042},
    {nameAr:'الخليل',nameEn:'Hebron',type:'city',lat:31.5326,lng:35.0998},
    {nameAr:'جنين',nameEn:'Jenin',type:'city',lat:32.4597,lng:35.2979},
    {nameAr:'طولكرم',nameEn:'Tulkarm',type:'city',lat:32.3104,lng:35.0285},
    {nameAr:'أريحا',nameEn:'Jericho',type:'city',lat:31.8613,lng:35.4447},
    {nameAr:'بيت لحم',nameEn:'Bethlehem',type:'city',lat:31.7054,lng:35.2024},
    {nameAr:'خان يونس',nameEn:'Khan Yunis',type:'city',lat:31.3449,lng:34.3068},
    {nameAr:'رفح',nameEn:'Rafah',type:'city',lat:31.2826,lng:34.2547},
    {nameAr:'قلقيلية',nameEn:'Qalqilya',type:'city',lat:32.1865,lng:34.9754},
    {nameAr:'سلفيت',nameEn:'Salfit',type:'city',lat:32.0847,lng:35.1779},
    {nameAr:'طوباس',nameEn:'Tubas',type:'city',lat:32.3209,lng:35.3693},
    {nameAr:'أريحا',nameEn:'Jericho',type:'city',lat:31.8567,lng:35.4631},
  ],
  pk: [
    {nameAr:'كراتشي',nameEn:'Karachi',type:'city',lat:24.8607,lng:67.0011},
    {nameAr:'لاهور',nameEn:'Lahore',type:'city',lat:31.5204,lng:74.3587},
    {nameAr:'إسلام آباد',nameEn:'Islamabad',type:'city',lat:33.6844,lng:73.0479},
    {nameAr:'فيصل آباد',nameEn:'Faisalabad',type:'city',lat:31.4504,lng:73.135},
    {nameAr:'راولبندي',nameEn:'Rawalpindi',type:'city',lat:33.5651,lng:73.0169},
    {nameAr:'ملتان',nameEn:'Multan',type:'city',lat:30.1575,lng:71.5249},
    {nameAr:'حيدر آباد',nameEn:'Hyderabad',type:'city',lat:25.3792,lng:68.3683},
    {nameAr:'كيتا',nameEn:'Quetta',type:'city',lat:30.1798,lng:66.975},
    {nameAr:'بيشاور',nameEn:'Peshawar',type:'city',lat:34.0,lng:71.5},
    {nameAr:'غوجرانوالا',nameEn:'Gujranwala',type:'city',lat:32.1877,lng:74.1945},
    {nameAr:'سيالكوت',nameEn:'Sialkot',type:'city',lat:32.4945,lng:74.5229},
    {nameAr:'سرغودا',nameEn:'Sargodha',type:'city',lat:32.0836,lng:72.6711},
    {nameAr:'بهاولبور',nameEn:'Bahawalpur',type:'city',lat:29.3956,lng:71.6722},
    {nameAr:'سكهر',nameEn:'Sukkur',type:'city',lat:27.7052,lng:68.8574},
    {nameAr:'شيخوبورة',nameEn:'Sheikhupura',type:'city',lat:31.7131,lng:73.9853},
  ],
  tr: [
    {nameAr:'إسطنبول',nameEn:'Istanbul',type:'city',lat:41.0082,lng:28.9784},
    {nameAr:'أنقرة',nameEn:'Ankara',type:'city',lat:39.9334,lng:32.8597},
    {nameAr:'إزمير',nameEn:'Izmir',type:'city',lat:38.4192,lng:27.1287},
    {nameAr:'أنطاليا',nameEn:'Antalya',type:'city',lat:36.8969,lng:30.7133},
    {nameAr:'أضنة',nameEn:'Adana',type:'city',lat:37.0,lng:35.3213},
    {nameAr:'بورصة',nameEn:'Bursa',type:'city',lat:40.1885,lng:29.061},
    {nameAr:'طرابزون',nameEn:'Trabzon',type:'city',lat:41.005,lng:39.7239},
    {nameAr:'كونيا',nameEn:'Konya',type:'city',lat:37.871,lng:32.4932},
    {nameAr:'غازي عنتاب',nameEn:'Gaziantep',type:'city',lat:37.0662,lng:37.3833},
    {nameAr:'مرسين',nameEn:'Mersin',type:'city',lat:36.8,lng:34.6333},
    {nameAr:'قيصري',nameEn:'Kayseri',type:'city',lat:38.7225,lng:35.4875},
    {nameAr:'إسكندرونة',nameEn:'Iskenderun',type:'city',lat:36.5853,lng:36.1667},
    {nameAr:'ديار بكر',nameEn:'Diyarbakir',type:'city',lat:37.9144,lng:40.2306},
    {nameAr:'أورفة',nameEn:'Urfa',type:'city',lat:37.1591,lng:38.7969},
    {nameAr:'ملاطية',nameEn:'Malatya',type:'city',lat:38.3552,lng:38.3095},
    {nameAr:'إسكيشهير',nameEn:'Eskisehir',type:'city',lat:39.7767,lng:30.5206},
    {nameAr:'طرسوس',nameEn:'Tarsus',type:'city',lat:36.9163,lng:34.8956},
    {nameAr:'سامسون',nameEn:'Samsun',type:'city',lat:41.2867,lng:36.33},
  ],
  ir: [
    {nameAr:'طهران',nameEn:'Tehran',type:'city',lat:35.6892,lng:51.389},
    {nameAr:'مشهد',nameEn:'Mashhad',type:'city',lat:36.2972,lng:59.6067},
    {nameAr:'أصفهان',nameEn:'Isfahan',type:'city',lat:32.6539,lng:51.6661},
    {nameAr:'شيراز',nameEn:'Shiraz',type:'city',lat:29.5918,lng:52.5837},
    {nameAr:'تبريز',nameEn:'Tabriz',type:'city',lat:38.08,lng:46.2919},
    {nameAr:'كرج',nameEn:'Karaj',type:'city',lat:35.8325,lng:50.9993},
    {nameAr:'أهواز',nameEn:'Ahvaz',type:'city',lat:31.3183,lng:48.6706},
    {nameAr:'قم',nameEn:'Qom',type:'city',lat:34.6401,lng:50.8764},
    {nameAr:'كرمانشاه',nameEn:'Kermanshah',type:'city',lat:34.3142,lng:47.065},
    {nameAr:'أورمية',nameEn:'Urmia',type:'city',lat:37.5527,lng:45.0761},
    {nameAr:'زاهدان',nameEn:'Zahedan',type:'city',lat:29.4964,lng:60.8629},
    {nameAr:'رشت',nameEn:'Rasht',type:'city',lat:37.2808,lng:49.5832},
    {nameAr:'كرمان',nameEn:'Kerman',type:'city',lat:30.2839,lng:57.0834},
    {nameAr:'همدان',nameEn:'Hamedan',type:'city',lat:34.7986,lng:48.5146},
    {nameAr:'يزد',nameEn:'Yazd',type:'city',lat:31.8974,lng:54.3569},
    {nameAr:'بندر عباس',nameEn:'Bandar Abbas',type:'city',lat:27.1865,lng:56.2808},
    {nameAr:'أردبيل',nameEn:'Ardabil',type:'city',lat:38.2498,lng:48.2934},
    {nameAr:'سنندج',nameEn:'Sanandaj',type:'city',lat:35.3219,lng:46.9987},
  ],
  my: [
    {nameAr:'كوالالمبور',nameEn:'Kuala Lumpur',type:'city',lat:3.1478,lng:101.6953},
    {nameAr:'جورج تاون',nameEn:'George Town',type:'city',lat:5.4141,lng:100.3288},
    {nameAr:'ايبوه',nameEn:'Ipoh',type:'city',lat:4.5975,lng:101.0901},
    {nameAr:'جوهور بهرو',nameEn:'Johor Bahru',type:'city',lat:1.4655,lng:103.7578},
    {nameAr:'كوتا كينابالو',nameEn:'Kota Kinabalu',type:'city',lat:5.9804,lng:116.0735},
    {nameAr:'كوتشينغ',nameEn:'Kuching',type:'city',lat:1.5533,lng:110.3592},
    {nameAr:'بيتالينغ جايا',nameEn:'Petaling Jaya',type:'city',lat:3.1073,lng:101.6067},
    {nameAr:'شاه علم',nameEn:'Shah Alam',type:'city',lat:3.0733,lng:101.5185},
    {nameAr:'سيمبانغ',nameEn:'Seremban',type:'city',lat:2.7297,lng:101.9381},
    {nameAr:'كوانتان',nameEn:'Kuantan',type:'city',lat:3.8077,lng:103.3260},
    {nameAr:'ألور ستار',nameEn:'Alor Setar',type:'city',lat:6.1248,lng:100.3673},
    {nameAr:'ميري',nameEn:'Miri',type:'city',lat:4.3995,lng:113.9914},
    {nameAr:'سيبو',nameEn:'Sibu',type:'city',lat:2.3,lng:111.8167},
    {nameAr:'باهانغ',nameEn:'Pahang',type:'city',lat:3.8126,lng:103.3256},
  ],
  id: [
    {nameAr:'جاكرتا',nameEn:'Jakarta',type:'city',lat:-6.2088,lng:106.8456},
    {nameAr:'سورابايا',nameEn:'Surabaya',type:'city',lat:-7.2575,lng:112.7521},
    {nameAr:'باندونغ',nameEn:'Bandung',type:'city',lat:-6.9175,lng:107.6191},
    {nameAr:'ميدان',nameEn:'Medan',type:'city',lat:3.5952,lng:98.6722},
    {nameAr:'سيمارانغ',nameEn:'Semarang',type:'city',lat:-6.9932,lng:110.4203},
    {nameAr:'بالمبانغ',nameEn:'Palembang',type:'city',lat:-2.9167,lng:104.7458},
    {nameAr:'ماكاسار',nameEn:'Makassar',type:'city',lat:-5.1477,lng:119.4327},
    {nameAr:'يوغياكارتا',nameEn:'Yogyakarta',type:'city',lat:-7.7956,lng:110.3695},
    {nameAr:'باتام',nameEn:'Batam',type:'city',lat:1.0456,lng:104.0305},
    {nameAr:'باليكبابان',nameEn:'Balikpapan',type:'city',lat:-1.2654,lng:116.8312},
    {nameAr:'آتشيه',nameEn:'Banda Aceh',type:'city',lat:5.5483,lng:95.3238},
    {nameAr:'مناهاسا',nameEn:'Manado',type:'city',lat:1.4748,lng:124.8421},
    {nameAr:'أمبون',nameEn:'Ambon',type:'city',lat:-3.6554,lng:128.1908},
  ],
};

// ===== بيانات العواصم الكاملة (اسم عربي + إنجليزي + إحداثيات) =====
const CAPITAL_DATA = {
    sa:{nameAr:'الرياض',       nameEn:'Riyadh',        lat:24.6877,  lng:46.7219},
    sy:{nameAr:'دمشق',         nameEn:'Damascus',      lat:33.5102,  lng:36.2913},
    eg:{nameAr:'القاهرة',      nameEn:'Cairo',         lat:30.0444,  lng:31.2357},
    iq:{nameAr:'بغداد',        nameEn:'Baghdad',       lat:33.3152,  lng:44.3661},
    jo:{nameAr:'عمّان',        nameEn:'Amman',         lat:31.9539,  lng:35.9106},
    lb:{nameAr:'بيروت',        nameEn:'Beirut',        lat:33.8869,  lng:35.5131},
    ps:{nameAr:'القدس',        nameEn:'Jerusalem',     lat:31.7683,  lng:35.2137},
    kw:{nameAr:'الكويت',       nameEn:'Kuwait City',   lat:29.3697,  lng:47.9783},
    ae:{nameAr:'أبوظبي',       nameEn:'Abu Dhabi',     lat:24.4539,  lng:54.3773},
    qa:{nameAr:'الدوحة',       nameEn:'Doha',          lat:25.2854,  lng:51.531},
    bh:{nameAr:'المنامة',      nameEn:'Manama',        lat:26.215,   lng:50.5832},
    om:{nameAr:'مسقط',         nameEn:'Muscat',        lat:23.5957,  lng:58.5933},
    ye:{nameAr:'صنعاء',        nameEn:'Sanaa',         lat:15.3694,  lng:44.191},
    ly:{nameAr:'طرابلس',       nameEn:'Tripoli',       lat:32.8872,  lng:13.1913},
    tn:{nameAr:'تونس',         nameEn:'Tunis',         lat:36.8065,  lng:10.1815},
    dz:{nameAr:'الجزائر العاصمة',nameEn:'Algiers',    lat:36.7372,  lng:3.0865},
    ma:{nameAr:'الرباط',       nameEn:'Rabat',         lat:34.0209,  lng:-6.8417},
    sd:{nameAr:'الخرطوم',      nameEn:'Khartoum',      lat:15.5007,  lng:32.5599},
    pk:{nameAr:'إسلام آباد',   nameEn:'Islamabad',     lat:33.6844,  lng:73.0479},
    tr:{nameAr:'أنقرة',        nameEn:'Ankara',        lat:39.9334,  lng:32.8597},
    ir:{nameAr:'طهران',        nameEn:'Tehran',        lat:35.6892,  lng:51.389},
    id:{nameAr:'جاكرتا',       nameEn:'Jakarta',       lat:-6.2088,  lng:106.8456},
    my:{nameAr:'كوالالمبور',   nameEn:'Kuala Lumpur',  lat:3.1478,   lng:101.6953},
    bd:{nameAr:'دكا',          nameEn:'Dhaka',         lat:23.7104,  lng:90.4074},
    af:{nameAr:'كابول',        nameEn:'Kabul',         lat:34.5553,  lng:69.2075},
    in:{nameAr:'نيودلهي',      nameEn:'New Delhi',     lat:28.6139,  lng:77.209},
    lk:{nameAr:'كولومبو',      nameEn:'Colombo',       lat:6.9271,   lng:79.8612},
    np:{nameAr:'كاتماندو',     nameEn:'Kathmandu',     lat:27.7172,  lng:85.3240},
    cn:{nameAr:'بكين',         nameEn:'Beijing',       lat:39.9042,  lng:116.4074},
    jp:{nameAr:'طوكيو',        nameEn:'Tokyo',         lat:35.6762,  lng:139.6503},
    kr:{nameAr:'سيول',         nameEn:'Seoul',         lat:37.5665,  lng:126.978},
    mn:{nameAr:'أولان باتور',  nameEn:'Ulaanbaatar',   lat:47.8864,  lng:106.9057},
    fr:{nameAr:'باريس',        nameEn:'Paris',         lat:48.8566,  lng:2.3522},
    de:{nameAr:'برلين',        nameEn:'Berlin',        lat:52.52,    lng:13.405},
    gb:{nameAr:'لندن',         nameEn:'London',        lat:51.5074,  lng:-0.1278},
    es:{nameAr:'مدريد',        nameEn:'Madrid',        lat:40.4168,  lng:-3.7038},
    it:{nameAr:'روما',         nameEn:'Rome',          lat:41.9028,  lng:12.4964},
    nl:{nameAr:'أمستردام',     nameEn:'Amsterdam',     lat:52.3676,  lng:4.9041},
    be:{nameAr:'بروكسل',       nameEn:'Brussels',      lat:50.8503,  lng:4.3517},
    pt:{nameAr:'لشبونة',       nameEn:'Lisbon',        lat:38.7223,  lng:-9.1393},
    se:{nameAr:'ستوكهولم',     nameEn:'Stockholm',     lat:59.3293,  lng:18.0686},
    no:{nameAr:'أوسلو',        nameEn:'Oslo',          lat:59.9139,  lng:10.7522},
    dk:{nameAr:'كوبنهاغن',     nameEn:'Copenhagen',    lat:55.6761,  lng:12.5683},
    fi:{nameAr:'هلسنكي',       nameEn:'Helsinki',      lat:60.1699,  lng:24.9384},
    pl:{nameAr:'وارسو',        nameEn:'Warsaw',        lat:52.2297,  lng:21.0122},
    ru:{nameAr:'موسكو',        nameEn:'Moscow',        lat:55.7558,  lng:37.6173},
    ua:{nameAr:'كييف',         nameEn:'Kyiv',          lat:50.4501,  lng:30.5234},
    ch:{nameAr:'برن',          nameEn:'Bern',          lat:46.9481,  lng:7.4474},
    at:{nameAr:'فيينا',        nameEn:'Vienna',        lat:48.2082,  lng:16.3738},
    gr:{nameAr:'أثينا',        nameEn:'Athens',        lat:37.9838,  lng:23.7275},
    cz:{nameAr:'براغ',         nameEn:'Prague',        lat:50.0755,  lng:14.4378},
    ro:{nameAr:'بوخارست',      nameEn:'Bucharest',     lat:44.4268,  lng:26.1025},
    us:{nameAr:'واشنطن',       nameEn:'Washington',    lat:38.9072,  lng:-77.0369},
    ca:{nameAr:'أوتاوا',       nameEn:'Ottawa',        lat:45.4215,  lng:-75.6972},
    mx:{nameAr:'مكسيكو سيتي',  nameEn:'Mexico City',   lat:19.4326,  lng:-99.1332},
    br:{nameAr:'برازيليا',     nameEn:'Brasilia',      lat:-15.7939, lng:-47.8828},
    ar:{nameAr:'بوينس آيرس',   nameEn:'Buenos Aires',  lat:-34.6037, lng:-58.3816},
    co:{nameAr:'بوغوتا',       nameEn:'Bogota',        lat:4.711,    lng:-74.0721},
    pe:{nameAr:'ليما',         nameEn:'Lima',          lat:-12.0464, lng:-77.0428},
    ve:{nameAr:'كاراكاس',      nameEn:'Caracas',       lat:10.4806,  lng:-66.9036},
    cl:{nameAr:'سانتياغو',     nameEn:'Santiago',      lat:-33.4489, lng:-70.6693},
    ec:{nameAr:'كيتو',         nameEn:'Quito',         lat:-0.1807,  lng:-78.4678},
    bo:{nameAr:'سوكري',        nameEn:'Sucre',         lat:-19.0196, lng:-65.2619},
    py:{nameAr:'أسونسيون',     nameEn:'Asuncion',      lat:-25.2867, lng:-57.647},
    uy:{nameAr:'مونتيفيديو',   nameEn:'Montevideo',    lat:-34.9011, lng:-56.1645},
    ng:{nameAr:'أبوجا',        nameEn:'Abuja',         lat:9.0765,   lng:7.3986},
    et:{nameAr:'أديس أبابا',   nameEn:'Addis Ababa',   lat:9.005,    lng:38.7636},
    ke:{nameAr:'نيروبي',       nameEn:'Nairobi',       lat:-1.2921,  lng:36.8219},
    tz:{nameAr:'دودوما',       nameEn:'Dodoma',        lat:-6.1731,  lng:35.7395},
    za:{nameAr:'بريتوريا',     nameEn:'Pretoria',      lat:-25.7461, lng:28.1881},
    gh:{nameAr:'أكرا',         nameEn:'Accra',         lat:5.6037,   lng:-0.187},
    sn:{nameAr:'داكار',        nameEn:'Dakar',         lat:14.6928,  lng:-17.4467},
    cm:{nameAr:'ياوندي',       nameEn:'Yaounde',       lat:3.848,    lng:11.5021},
    ml:{nameAr:'باماكو',       nameEn:'Bamako',        lat:12.6392,  lng:-8.0029},
    so:{nameAr:'مقديشو',       nameEn:'Mogadishu',     lat:2.0469,   lng:45.3182},
    ug:{nameAr:'كمبالا',       nameEn:'Kampala',       lat:0.3476,   lng:32.5825},
    mr:{nameAr:'نواكشوط',      nameEn:'Nouakchott',    lat:18.0735,  lng:-15.9582},
    td:{nameAr:'نجامينا',      nameEn:'N\'Djamena',    lat:12.1048,  lng:15.044},
    ne:{nameAr:'نيامي',        nameEn:'Niamey',        lat:13.5137,  lng:2.1098},
    au:{nameAr:'كانبيرا',      nameEn:'Canberra',      lat:-35.2809, lng:149.13},
    nz:{nameAr:'ويلينغتون',    nameEn:'Wellington',    lat:-41.2865, lng:174.7762},
};

// ===== إزالة المدن المكررة (بالاسم فقط) =====
function deduplicateCities(cities) {
    const seenNames = new Set();
    const result = [];
    for (const city of cities) {
        const key = (city.nameAr || '').trim();
        if (!key) continue;
        if (seenNames.has(key)) continue;
        seenNames.add(key);
        result.push(city);
    }
    return result;
}

function sortWithCapitalFirst(cities, cc) {
    const cap = CAPITAL_DATA[cc];
    if (!cap) {
        // بدون عاصمة: الأكثر سكاناً أولاً، ثم ترتيب أبجدي
        return cities.sort((a, b) => {
            if (b.pop && a.pop) return b.pop - a.pop;
            if (b.pop) return 1;
            if (a.pop) return -1;
            return a.nameAr.localeCompare(b.nameAr, 'ar');
        });
    }

    const capNameEn = (cap.nameEn || '').toLowerCase();
    const capNameAr = cap.nameAr || '';

    // أزل العاصمة من القائمة إن وُجدت لتجنب التكرار
    const filtered = cities.filter(c => {
        const enMatch = (c.nameEn || '').toLowerCase().includes(capNameEn.split(' ')[0]);
        const arMatch = c.nameAr === capNameAr;
        return !enMatch && !arMatch;
    });

    // رتّب: الأكثر سكاناً أولاً، ثم بدون سكان ترتيباً أبجدياً
    const sorted = filtered.sort((a, b) => {
        if (b.pop && a.pop) return b.pop - a.pop;
        if (b.pop) return 1;
        if (a.pop) return -1;
        return a.nameAr.localeCompare(b.nameAr, 'ar');
    });

    // أضف العاصمة في المقدمة دائماً
    const capitalCity = { nameAr: cap.nameAr, nameEn: cap.nameEn, type: 'city', lat: cap.lat, lng: cap.lng };
    return [capitalCity, ...sorted];
}

// ===== Wikidata fallback  =====
const COUNTRY_QID = {
    // الشرق الأوسط وشمال أفريقيا
    sa:'Q851',  sy:'Q858',  eg:'Q79',   iq:'Q796',  jo:'Q810',
    lb:'Q822',  ps:'Q219060', kw:'Q817', ae:'Q878', qa:'Q846',
    bh:'Q398',  om:'Q842',  ye:'Q805',  ly:'Q1016', tn:'Q948',
    dz:'Q262',  ma:'Q1028', sd:'Q1049',
    // جنوب وجنوب شرق آسيا
    pk:'Q843',  tr:'Q43',   ir:'Q794',  id:'Q252',  my:'Q833',
    bd:'Q902',  af:'Q889',  in:'Q668',  lk:'Q854',  np:'Q837',
    th:'Q869',  ph:'Q928',  vn:'Q881',  mm:'Q836',  kh:'Q424',
    la:'Q819',  sg:'Q334',  bn:'Q921',  tl:'Q574',  uz:'Q265',
    kz:'Q232',  kg:'Q813',  tj:'Q863',  tm:'Q874',  az:'Q227',
    ge:'Q230',  am:'Q399',
    // شرق آسيا
    cn:'Q148',  jp:'Q17',   kr:'Q884',  kp:'Q423',  mn:'Q711',
    // أوروبا
    fr:'Q142',  de:'Q183',  gb:'Q145',  es:'Q29',   it:'Q38',
    nl:'Q55',   be:'Q31',   pt:'Q45',   se:'Q34',   no:'Q20',
    dk:'Q35',   fi:'Q33',   pl:'Q36',   ru:'Q159',  ua:'Q212',
    ch:'Q39',   at:'Q40',   gr:'Q41',   cz:'Q213',  ro:'Q218',
    // أمريكا الشمالية
    us:'Q30',   ca:'Q16',   mx:'Q96',
    // أمريكا الوسطى والكاريبي
    gt:'Q774',  hn:'Q783',  sv:'Q792',  ni:'Q811',  cr:'Q800',
    pa:'Q804',  cu:'Q241',  do:'Q786',
    // أمريكا الجنوبية
    br:'Q155',  ar:'Q414',  co:'Q739',  pe:'Q419',  ve:'Q717',
    cl:'Q298',  ec:'Q736',  bo:'Q750',  py:'Q733',  uy:'Q77',
    // أفريقيا جنوب الصحراء
    ng:'Q1033', et:'Q115',  ke:'Q114',  tz:'Q924',  za:'Q258',
    gh:'Q117',  sn:'Q1041', ci:'Q1008', cm:'Q1009', ml:'Q912',
    mr:'Q1025', td:'Q657',  ne:'Q1032', so:'Q1045', ug:'Q1036',
    // أوقيانوسيا
    au:'Q408',  nz:'Q664',  pg:'Q691',  fj:'Q712',
};

function wikidataFetch(sparql) {
    return new Promise((resolve, reject) => {
        const encoded = encodeURIComponent(sparql);
        const req = https.request({
            hostname: 'query.wikidata.org',
            path: `/sparql?query=${encoded}&format=json`,
            method: 'GET',
            headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': 'PrayerTimesApp/1.0' },
            timeout: 25000,
        }, res => {
            if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
            let data = '';
            res.setEncoding('utf8');
            res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.end();
    });
}

async function fetchCitiesWikidata(cc) {
    const qid = COUNTRY_QID[cc];
    // إذا لم يكن QID موجوداً نستعلم بكود ISO مباشرةً (يعمل مع أي دولة)
    const countryFilter = qid
        ? `?item wdt:P17 wd:${qid};`
        : `?country wdt:P297 "${cc.toUpperCase()}". ?item wdt:P17 ?country;`;
    // نجلب السكان (P1082) لترتيب المدن الكبرى أولاً
    const sparql = `SELECT ?nameAr ?nameEn ?lat ?lng (MAX(?popVal) AS ?pop) WHERE {
  VALUES ?type { wd:Q515 wd:Q3957 wd:Q532 wd:Q1549591 }
  ${countryFilter} wdt:P31 ?type;
        p:P625/psv:P625 [ wikibase:geoLatitude ?lat; wikibase:geoLongitude ?lng ].
  OPTIONAL { ?item rdfs:label ?nameAr FILTER(LANG(?nameAr)="ar") }
  OPTIONAL { ?item rdfs:label ?nameEn FILTER(LANG(?nameEn)="en") }
  OPTIONAL { ?item wdt:P1082 ?popVal }
  FILTER(BOUND(?nameAr) || BOUND(?nameEn))
} GROUP BY ?nameAr ?nameEn ?lat ?lng
LIMIT 2000`;
    try {
        const r = await wikidataFetch(sparql);
        const seen = new Set();
        const cities = (r?.results?.bindings || [])
            .map(b => ({
                nameAr: b.nameAr?.value || b.nameEn?.value || '',
                nameEn: b.nameEn?.value || '',
                type: 'city',
                lat: parseFloat(b.lat?.value),
                lng: parseFloat(b.lng?.value),
                pop: b.pop?.value ? parseInt(b.pop.value) : null,
            }))
            .filter(c => c.nameAr && !isNaN(c.lat) && !seen.has(c.nameAr) && seen.add(c.nameAr));
        return sortWithCapitalFirst(cities, cc);
    } catch(e) { console.log(`[Wikidata] ${e.message}`); return null; }
}

// ===== قاعدة البيانات الدائمة =====
function dbFile(cc) {
    return path.join(DB_DIR, `cities-${cc}.json`);
}

function dbRead(cc) {
    try {
        const raw = fs.readFileSync(dbFile(cc), 'utf8');
        return JSON.parse(raw);
    } catch(e) { return null; }
}

function dbWrite(cc, cities) {
    try {
        fs.writeFileSync(dbFile(cc), JSON.stringify(cities, null, 2), 'utf8');
        return true;
    } catch(e) { console.error(`[DB] خطأ في الكتابة ${cc}:`, e.message); return false; }
}

// دمج مدن جديدة في قاعدة البيانات بدون حذف القديمة
function dbMerge(cc, newCities) {
    const existing = dbRead(cc) || [];
    const merged = deduplicateCities([...existing, ...newCities]);
    const added  = merged.length - existing.length;
    dbWrite(cc, merged);
    return { total: merged.length, added };
}

// ===== معالج GET /api/cities =====
async function handleCitiesApi(cc, res) {
    if (!/^[a-z]{2,3}$/.test(cc)) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'invalid cc'})); return;
    }

    // 1) قاعدة البيانات الدائمة — المصدر الأول دائماً
    const stored = dbRead(cc);
    if (stored && stored.length > 0) {
        const result = sortWithCapitalFirst(deduplicateCities(stored), cc);
        res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'db'});
        res.end(JSON.stringify(result));
        console.log(`[DB] ${cc.toUpperCase()} → ${result.length} مدينة من قاعدة البيانات`);

        // في الخلفية: إذا البيانات الثابتة أكبر، ادمجها في DB
        const staticData = STATIC_CITIES[cc];
        if (staticData && staticData.length > stored.length) {
            const r = dbMerge(cc, staticData);
            if (r.added > 0) console.log(`[DB] ${cc.toUpperCase()} → أُضيف ${r.added} من البيانات الثابتة`);
        }
        return;
    }

    // 2) لا توجد في DB → ابدأ بالبيانات الثابتة فوراً وأحضر Wikidata في الخلفية
    const staticData = STATIC_CITIES[cc];
    if (staticData && staticData.length > 0) {
        const initial = sortWithCapitalFirst(deduplicateCities([...staticData]), cc);
        res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'static'});
        res.end(JSON.stringify(initial));
        console.log(`[DB] ${cc.toUpperCase()} → ${initial.length} مدينة من البيانات الثابتة (أول مرة)`);

        // احفظ في DB وحدّث من Wikidata
        dbWrite(cc, initial);
        fetchCitiesWikidata(cc).then(wiki => {
            if (wiki && wiki.length > 0) {
                const r = dbMerge(cc, wiki);
                console.log(`[DB] ${cc.toUpperCase()} → حُدّث من Wikidata: ${r.total} مدينة (+${r.added})`);
            }
        }).catch(() => {});
        return;
    }

    // 3) لا بيانات ثابتة → جلب من Wikidata مباشرة
    console.log(`[DB] ${cc.toUpperCase()} → جلب من Wikidata...`);
    const wiki = await fetchCitiesWikidata(cc);
    if (!wiki || wiki.length === 0) {
        res.writeHead(503, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'unavailable'}));
        return;
    }
    const result = deduplicateCities(wiki);
    dbWrite(cc, result);
    console.log(`[DB] ${cc.toUpperCase()} → ${result.length} مدينة من Wikidata وحُفظت في DB`);
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'wikidata'});
    res.end(JSON.stringify(sortWithCapitalFirst(result, cc)));
}

// ===== معالج POST /api/cities/add — إضافة مدن جديدة من العميل =====
async function handleCitiesAdd(cc, body, res) {
    if (!/^[a-z]{2,3}$/.test(cc)) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'invalid cc'})); return;
    }
    let newCities;
    try { newCities = JSON.parse(body); } catch(e) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'invalid json'})); return;
    }
    if (!Array.isArray(newCities) || newCities.length === 0) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'empty array'})); return;
    }
    const r = dbMerge(cc, newCities);
    console.log(`[DB] ${cc.toUpperCase()} → أُضيف ${r.added} مدينة جديدة (الإجمالي: ${r.total})`);
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
    res.end(JSON.stringify({ ok: true, added: r.added, total: r.total }));
}

// ===== HTTP Server =====
const server = http.createServer(async (req, res) => {
    let urlPath = req.url.split('?')[0];
    const qs    = req.url.includes('?') ? req.url.split('?')[1] : '';

    if (urlPath === '/index.html') {
        res.writeHead(301, {'Location': '/' + (qs ? '?'+qs : '')});
        res.end(); return;
    }
    if (urlPath === '/') urlPath = '/index.html';

    // مسارات النسخة الإنجليزية /en/
    if (urlPath === '/en' || urlPath === '/en/') {
        fs.readFile(path.join(ROOT, 'index.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            res.end(html);
        });
        return;
    }

    if (/^\/en\/prayer-times-cities-[a-z0-9-]+$/.test(urlPath)) {
        fs.readFile(path.join(ROOT, 'prayer-times-cities.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            res.end(html);
        });
        return;
    }

    if (/^\/en\/about-.+$/.test(urlPath)) {
        fs.readFile(path.join(ROOT, 'about-city.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            res.end(html);
        });
        return;
    }

    if (/^\/en\/prayer-times-in-.+$/.test(urlPath)) {
        fs.readFile(path.join(ROOT, 'index.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            res.end(html);
        });
        return;
    }

    if (/^\/(?:en\/)?qibla-in-.+(?:\.html)?$/.test(urlPath)) {
        fs.readFile(path.join(ROOT, 'index.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            res.end(html);
        });
        return;
    }

    // ===== Nominatim Proxy (يحل مشكلة CORS + rate limit) =====
    if (urlPath === '/api/geocode' && req.method === 'GET') {
        const typeMatch = qs.match(/(?:^|&)type=([^&]+)/);
        const type = typeMatch ? typeMatch[1] : 'search';
        const cleanQs = qs.replace(/(?:^|&)type=[^&]+/, '').replace(/^&/, '');
        const cacheKey = `${type}?${cleanQs}`;

        // تحقق من الكاش أولاً
        const cached = _geocodeCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < _GEOCACHE_TTL) {
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});
            res.end(cached.data);
            return;
        }

        const nominatimUrl = `https://nominatim.openstreetmap.org/${type}?${cleanQs}`;
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 6000);
            const nomRes = await fetch(nominatimUrl, {
                signal: ctrl.signal,
                headers: { 'User-Agent': 'Mozilla/5.0 PrayerTimesApp/1.0', 'Accept': 'application/json' }
            });
            clearTimeout(timer);
            if (nomRes.status === 429 || nomRes.status >= 500) {
                res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
                res.end('[]'); return;
            }
            const data = await nomRes.text();
            if (data.trim().startsWith('[') || data.trim().startsWith('{')) {
                _geocodeCache.set(cacheKey, { ts: Date.now(), data });
            }
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=3600'});
            res.end(data.trim().startsWith('[') || data.trim().startsWith('{') ? data : '[]');
        } catch(e) {
            res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
            res.end('[]');
        }
        return;
    }

    if (urlPath === '/api/cities' && req.method === 'GET') {
        const cc = (new URLSearchParams(qs)).get('cc') || '';
        await handleCitiesApi(cc.toLowerCase(), res);
        return;
    }

    if (urlPath === '/api/cities/add' && (req.method === 'POST' || req.method === 'OPTIONS')) {
        // دعم CORS preflight
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
        const cc = (new URLSearchParams(qs)).get('cc') || '';
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => handleCitiesAdd(cc.toLowerCase(), body.trim(), res));
        return;
    }

    if (/^\/prayer-times-cities-[a-z0-9-]+\.html$/.test(urlPath)) {
        fs.readFile(path.join(ROOT, 'prayer-times-cities.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            res.end(html);
        });
        return;
    }

    // صفحة عن المدينة: /about-{slug}.html
    if (/^\/about-.+\.html$/.test(urlPath)) {
        fs.readFile(path.join(ROOT, 'about-city.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            res.end(html);
        });
        return;
    }

    const filePath    = path.join(ROOT, urlPath);
    const ext         = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const compressible = ['.js', '.css', '.html', '.json', '.svg', '.xml'].includes(ext);
    const isVersioned  = req.url.includes('?v=');
    const cacheControl = isVersioned
        ? 'public, max-age=31536000, immutable'
        : ext === '.html' ? 'no-cache' : 'public, max-age=86400';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (!ext || ext === '.html') {
                fs.readFile(path.join(ROOT, 'index.html'), (err2, html) => {
                    if (err2) { res.writeHead(404); res.end('Not Found'); return; }
                    const acceptEnc = req.headers['accept-encoding'] || '';
                    if (acceptEnc.includes('gzip')) {
                        zlib.gzip(html, (e, buf) => {
                            if (e) { res.writeHead(200, {'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-cache'}); res.end(html); return; }
                            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8', 'Content-Encoding':'gzip', 'Cache-Control':'no-cache'});
                            res.end(buf);
                        });
                    } else {
                        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-cache'});
                        res.end(html);
                    }
                });
            } else {
                res.writeHead(404, {'Content-Type':'text/plain'});
                res.end('Not Found');
            }
            return;
        }

        const acceptEnc = req.headers['accept-encoding'] || '';
        if (compressible && acceptEnc.includes('gzip')) {
            zlib.gzip(data, (e, buf) => {
                if (e) {
                    res.writeHead(200, {'Content-Type': contentType, 'Content-Length': data.length, 'Cache-Control': cacheControl});
                    res.end(data);
                    return;
                }
                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Encoding': 'gzip',
                    'Cache-Control': cacheControl,
                    'Vary': 'Accept-Encoding',
                });
                res.end(buf);
            });
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': data.length,
                'Cache-Control': cacheControl,
                'Accept-Ranges': 'bytes',
            });
            res.end(data);
        }
    });
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
