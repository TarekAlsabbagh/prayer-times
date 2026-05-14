// One-shot seeder for CURATED-SAUDI-FULL-1 — appends ~53 more Saudi
// places (cities, towns, sub-municipalities, miqats) to push Saudi
// curated coverage from 113 → ~166 places across all 13 regions.
//
// Strategy:
//   * 31 entries from user's required list (the verifiable ones)
//   * 22 well-known Saudi places not in user's list but with reliable
//     coordinates (Al-Uyaynah, Ushaiqir, Thuwal, Tarout, miqat at
//     Abyar Ali, Al-Uqair historical port, ...)
//   * Adds الأحساء as alias on existing hofuf entry
//   * Skipped (per user rule "no unreliable coordinates"):
//       غامد الزناد, بني حسن — tribal areas, not point-cities
//       القرى — name shared by many places, ambiguous
//       العديد — Saudi/Qatar border, ambiguous coverage
//
// Each entry includes admin.region (Arabic + English) per user spec.
// Types vary: city / town / village / municipality / locality / miqat.
// Priority follows user's scale: 90 / 85 / 75 / 65.
//
// Idempotent: skips slugs that already exist.
import fs from 'node:fs';

const PATH = './db/places/curated-places.json';
const places = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const seen = new Set(places.map(p => p.slug));

const TZ = 'Asia/Riyadh';
const CC_AR = 'المملكة العربية السعودية';
const CC_EN = 'Saudi Arabia';

// Region constants (Arabic + English) — included in admin.region
const RG = {
    riyadh:   { ar: 'منطقة الرياض', en: 'Riyadh Region' },
    makkah:   { ar: 'منطقة مكة المكرمة', en: 'Makkah Region' },
    madinah:  { ar: 'منطقة المدينة المنورة', en: 'Madinah Region' },
    qassim:   { ar: 'منطقة القصيم', en: 'Qassim Region' },
    eastern:  { ar: 'المنطقة الشرقية', en: 'Eastern Province' },
    asir:     { ar: 'منطقة عسير', en: 'Asir Region' },
    tabuk:    { ar: 'منطقة تبوك', en: 'Tabuk Region' },
    hail:     { ar: 'منطقة حائل', en: 'Hail Region' },
    northern: { ar: 'منطقة الحدود الشمالية', en: 'Northern Borders Region' },
    jazan:    { ar: 'منطقة جازان', en: 'Jazan Region' },
    najran:   { ar: 'منطقة نجران', en: 'Najran Region' },
    bahah:    { ar: 'منطقة الباحة', en: 'Al Bahah Region' },
    jouf:     { ar: 'منطقة الجوف', en: 'Al Jouf Region' }
};

const newPlaces = [
    // ══════════ Riyadh region — fill user's list + 7 extras ══════════
    { slug:'al-hayer', t:'town', region:'riyadh', lat:24.4544, lng:46.8186,
        names:{ar:'الحائر',en:'Al Hair',fr:'Al Hair',de:'al-Hair',tr:'Hair',ur:'الحائر',id:'Al Hair',es:'Al Hair',bn:'আল-হাইর',ms:'Al Hair'},
        aliases:{ar:['الحائر']}, priority:70 },
    { slug:'thumayr', t:'town', region:'riyadh', lat:25.5667, lng:45.8500,
        names:{ar:'تمير',en:'Thumayr',fr:'Thumayr',de:'Thumayr',tr:'Tumeyr',ur:'تمیر',id:'Thumayr',es:'Thumayr',bn:'থুমাইর',ms:'Thumayr'},
        aliases:{ar:['تمير']}, priority:65 },
    { slug:'al-hilwah', t:'village', region:'riyadh', lat:22.4444, lng:47.1167,
        names:{ar:'الحلوة',en:'Al Hilwah',fr:'Al Hilwa',de:'al-Hilwa',tr:'Hılve',ur:'الحلوہ',id:'Al Hilwah',es:'Al Hilwah',bn:'আল-হিলওয়াহ',ms:'Al Hilwah'},
        aliases:{ar:['الحلوة']}, priority:65 },
    { slug:'al-artawiyah', t:'town', region:'riyadh', lat:26.5031, lng:45.3411,
        names:{ar:'الأرطاوية',en:'Al Artawiyah',fr:'Al Artawiya',de:'al-Artawiya',tr:'Artaviye',ur:'الارطاویہ',id:'Al Artawiyah',es:'Al Artawiyah',bn:'আল-আরতাউইয়াহ',ms:'Al Artawiyah'},
        aliases:{ar:['الأرطاوية','الارطاوية']}, priority:70 },
    { slug:'rawdat-sudair', t:'town', region:'riyadh', lat:25.9650, lng:45.4933,
        names:{ar:'روضة سدير',en:'Rawdat Sudair',fr:'Rawdat Sudair',de:'Rawdat Sudair',tr:'Ravda Südeyr',ur:'روضۃ سدیر',id:'Rawdat Sudair',es:'Rawdat Sudair',bn:'রাওদাত সুদাইর',ms:'Rawdat Sudair'},
        aliases:{ar:['روضة سدير']}, priority:68 },
    // Extras (Riyadh): well-known places not in user's list
    { slug:'al-muzahimiyah', t:'town', region:'riyadh', lat:24.4805, lng:46.2622,
        names:{ar:'المزاحمية',en:'Al Muzahimiyah',fr:'Al Mouzahimiya',de:'al-Muzahimiyya',tr:'Müzahimiye',ur:'المزاحمیہ',id:'Al Muzahimiyah',es:'Al Muzahimiyah',bn:'আল-মুজাহিমিয়াহ',ms:'Al Muzahimiyah'},
        aliases:{ar:['المزاحمية']}, priority:72 },
    { slug:'ad-dilam', t:'town', region:'riyadh', lat:23.9989, lng:47.1597,
        names:{ar:'الدلم',en:'Ad-Dilam',fr:'Ad-Dilam',de:'ad-Dilam',tr:'Dilem',ur:'الدلم',id:'Ad-Dilam',es:'Ad-Dilam',bn:'আদ-দিলাম',ms:'Ad-Dilam'},
        aliases:{ar:['الدلم']}, priority:70 },
    { slug:'harma', t:'town', region:'riyadh', lat:25.9167, lng:45.3333,
        names:{ar:'حرمة',en:'Harma',fr:'Harma',de:'Harma',tr:'Harma',ur:'حرمہ',id:'Harma',es:'Harma',bn:'হারমা',ms:'Harma'},
        aliases:{ar:['حرمة']}, priority:65 },
    { slug:'al-uyaynah', t:'village', region:'riyadh', lat:24.9000, lng:46.3833,
        names:{ar:'العيينة',en:'Al Uyaynah',fr:'Al Ouayna',de:'al-ʿUyayna',tr:'Uyeyne',ur:'العیینہ',id:'Al Uyaynah',es:'Al Uyaynah',bn:'আল-উইয়াইনাহ',ms:'Al Uyaynah'},
        aliases:{ar:['العيينة']}, priority:70 },
    { slug:'ushaiqir', t:'village', region:'riyadh', lat:25.3500, lng:45.2000,
        names:{ar:'أشيقر',en:'Ushaiqir',fr:'Ushaiqir',de:'Uschaiqir',tr:'Üşeykir',ur:'اشیقر',id:'Ushaiqir',es:'Ushaiqir',bn:'উশাইকির',ms:'Ushaiqir'},
        aliases:{ar:['أشيقر','اشيقر']}, priority:68 },
    { slug:'al-yamamah', t:'locality', region:'riyadh', lat:24.5167, lng:47.3167,
        names:{ar:'اليمامة',en:'Al Yamamah',fr:'Al Yamama',de:'al-Yamama',tr:'Yemame',ur:'الیمامہ',id:'Al Yamamah',es:'Al Yamamah',bn:'আল-ইয়ামামাহ',ms:'Al Yamamah'},
        aliases:{ar:['اليمامة']}, priority:65 },
    { slug:'sajir', t:'village', region:'riyadh', lat:25.1842, lng:44.6033,
        names:{ar:'ساجر',en:'Sajir',fr:'Sajir',de:'Sajir',tr:'Sacir',ur:'ساجر',id:'Sajir',es:'Sajir',bn:'সাজির',ms:'Sajir'},
        aliases:{ar:['ساجر']}, priority:65 },
    { slug:'julajul', t:'town', region:'riyadh', lat:25.6961, lng:45.4000,
        names:{ar:'جلاجل',en:'Julajul',fr:'Jelajel',de:'Dschuladschil',tr:'Cülecil',ur:'جلاجل',id:'Julajul',es:'Julajul',bn:'জুলাজুল',ms:'Julajul'},
        aliases:{ar:['جلاجل']}, priority:68 },

    // ══════════ Makkah region — fill user's list + 3 extras ══════════
    { slug:'al-muwayh', t:'town', region:'makkah', lat:22.4500, lng:41.4167,
        names:{ar:'المويه',en:'Al Muwayh',fr:'Al Mouwayh',de:'al-Muwayh',tr:'Müveyh',ur:'الموَیہ',id:'Al Muwayh',es:'Al Muwayh',bn:'আল-মুওয়াইহ',ms:'Al Muwayh'},
        aliases:{ar:['المويه']}, priority:68 },
    { slug:'bahrah', t:'town', region:'makkah', lat:21.4167, lng:39.4500,
        names:{ar:'بحرة',en:'Bahrah',fr:'Bahra',de:'Bahra',tr:'Bahre',ur:'بحرہ',id:'Bahrah',es:'Bahrah',bn:'বাহরাহ',ms:'Bahrah'},
        aliases:{ar:['بحرة']}, priority:70 },
    { slug:'al-jamoom', t:'town', region:'makkah', lat:21.7833, lng:39.7000,
        names:{ar:'الجموم',en:'Al Jamoom',fr:'Al Jamoum',de:'al-Dschumum',tr:'Cemum',ur:'الجموم',id:'Al Jamoom',es:'Al Jamoom',bn:'আল-জামুম',ms:'Al Jamoom'},
        aliases:{ar:['الجموم']}, priority:72 },
    { slug:'khulays', t:'town', region:'makkah', lat:22.1500, lng:39.3167,
        names:{ar:'خليص',en:'Khulays',fr:'Khoulais',de:'Chulais',tr:'Hulays',ur:'خلیص',id:'Khulays',es:'Khulays',bn:'খুলাইস',ms:'Khulays'},
        aliases:{ar:['خليص']}, priority:72 },
    // Extras (Makkah)
    { slug:'thuwal', t:'town', region:'makkah', lat:22.2786, lng:39.1019,
        names:{ar:'ثول',en:'Thuwal',fr:'Thouwal',de:'Thuwal',tr:'Süvel',ur:'ثول',id:'Thuwal',es:'Thuwal',bn:'থুওয়াল',ms:'Thuwal'},
        aliases:{ar:['ثول'], en:['KAUST']}, priority:75 },
    { slug:'ash-shafa', t:'locality', region:'makkah', lat:21.0833, lng:40.3000,
        names:{ar:'الشفا',en:'Ash Shafa',fr:'Ach Chafa',de:'asch-Schifa',tr:'Şefa',ur:'الشفا',id:'Ash Shafa',es:'Ash Shafa',bn:'আশ-শাফা',ms:'Ash Shafa'},
        aliases:{ar:['الشفا','شفا الطائف']}, priority:65 },
    { slug:'al-huda', t:'locality', region:'makkah', lat:21.3500, lng:40.2833,
        names:{ar:'الهدى',en:'Al Huda',fr:'Al Houda',de:'al-Huda',tr:'Hüda',ur:'الہدیٰ',id:'Al Huda',es:'Al Huda',bn:'আল-হুদা',ms:'Al Huda'},
        aliases:{ar:['الهدى','هدى الطائف']}, priority:65 },

    // ══════════ Madinah region — fill user's list + 1 extra (miqat) ══════════
    { slug:'wadi-al-fara', t:'locality', region:'madinah', lat:23.7100, lng:38.9900,
        names:{ar:'وادي الفرع',en:'Wadi Al Fara',fr:'Wadi al-Fara',de:'Wadi al-Farʿ',tr:'Vadi el-Farʿ',ur:'وادی الفرع',id:'Wadi Al Fara',es:'Wadi Al Fara',bn:'ওয়াদি আল-ফারা',ms:'Wadi Al Fara'},
        aliases:{ar:['وادي الفرع','الفرع']}, priority:70 },
    { slug:'abyar-ali', t:'miqat', region:'madinah', lat:24.4292, lng:39.5722,
        names:{ar:'آبار علي',en:'Abyar Ali',fr:'Abyar Ali',de:'Abyar ʿAli',tr:'Ebyâr Ali',ur:'آبار علی',id:'Abyar Ali',es:'Abyar Ali',bn:'আবিয়ার আলি',ms:'Abyar Ali'},
        aliases:{ar:['أبيار علي','ذو الحليفة','ذي الحليفة','بير علي']}, priority:78 },

    // ══════════ Qassim region — fill user's list ══════════
    { slug:'an-nabhaniyah', t:'town', region:'qassim', lat:26.4628, lng:44.6739,
        names:{ar:'النبهانية',en:'An Nabhaniyah',fr:'An Nabhaniya',de:'an-Nabhaniyya',tr:'Nebhaniye',ur:'النبہانیہ',id:'An Nabhaniyah',es:'An Nabhaniyah',bn:'আন-নাবহানিয়াহ',ms:'An Nabhaniyah'},
        aliases:{ar:['النبهانية']}, priority:70 },
    { slug:'uqlat-as-suqur', t:'town', region:'qassim', lat:25.8636, lng:42.1942,
        names:{ar:'عقلة الصقور',en:'Uqlat As Suqur',fr:'Uqlat as-Souqour',de:'ʿUqlat as-Suqur',tr:'Uklatü\'s-Sukur',ur:'عقلۃ الصقور',id:'Uqlat As Suqur',es:'Uqlat As Suqur',bn:'উকলাত আস-সুকুর',ms:'Uqlat As Suqur'},
        aliases:{ar:['عقلة الصقور']}, priority:70 },
    { slug:'dharyah', t:'town', region:'qassim', lat:25.4694, lng:44.4361,
        names:{ar:'ضرية',en:'Dharyah',fr:'Dharya',de:'Dhariyya',tr:'Zariyye',ur:'ضریہ',id:'Dharyah',es:'Dharyah',bn:'ধারিয়াহ',ms:'Dharyah'},
        aliases:{ar:['ضرية']}, priority:68 },

    // ══════════ Eastern Province — fill user's list + 5 extras ══════════
    { slug:'al-mubarraz', t:'city', region:'eastern', lat:25.4344, lng:49.5878,
        names:{ar:'المبرز',en:'Al Mubarraz',fr:'Al Moubarraz',de:'al-Mubarraz',tr:'Mübarrez',ur:'المبرز',id:'Al Mubarraz',es:'Al Mubarraz',bn:'আল-মুবাররাজ',ms:'Al Mubarraz'},
        aliases:{ar:['المبرز']}, priority:82 },
    // Extras (Eastern)
    { slug:'tarout', t:'town', region:'eastern', lat:26.5733, lng:50.0506,
        names:{ar:'تاروت',en:'Tarout',fr:'Tarout',de:'Tarut',tr:'Tarut',ur:'تاروت',id:'Tarout',es:'Tarut',bn:'তারুত',ms:'Tarout'},
        aliases:{ar:['تاروت','جزيرة تاروت']}, priority:74 },
    { slug:'al-omran', t:'town', region:'eastern', lat:25.5783, lng:49.5853,
        names:{ar:'العمران',en:'Al Omran',fr:'Al Omran',de:'al-ʿUmran',tr:'Umran',ur:'العمران',id:'Al Omran',es:'Al Omran',bn:'আল-উমরান',ms:'Al Omran'},
        aliases:{ar:['العمران']}, priority:70 },
    { slug:'al-uyun-sa', t:'town', region:'eastern', lat:25.5961, lng:49.5811,
        names:{ar:'العيون',en:'Al Uyun',fr:'Al Ouyoun',de:'al-ʿUyun',tr:'Uyun',ur:'العیون',id:'Al Uyun',es:'Al Uyun',bn:'আল-উয়ুন',ms:'Al Uyun'},
        aliases:{ar:['العيون']}, priority:70 },
    { slug:'al-jash', t:'town', region:'eastern', lat:26.6489, lng:49.9756,
        names:{ar:'الجش',en:'Al Jash',fr:'Al Jach',de:'al-Dschisch',tr:'Ciş',ur:'الجش',id:'Al Jash',es:'Al Jash',bn:'আল-জাশ',ms:'Al Jash'},
        aliases:{ar:['الجش']}, priority:65 },
    { slug:'al-uqair', t:'locality', region:'eastern', lat:25.6306, lng:50.2125,
        names:{ar:'العقير',en:'Al Uqair',fr:'Al Ouqayr',de:'al-ʿUqair',tr:'Ukayr',ur:'العقیر',id:'Al Uqair',es:'Al Uqair',bn:'আল-উকাইর',ms:'Al Uqair'},
        aliases:{ar:['العقير']}, priority:68 },

    // ══════════ Asir region — fill user's list + 2 extras ══════════
    { slug:'tathlith', t:'town', region:'asir', lat:19.5497, lng:43.2853,
        names:{ar:'تثليث',en:'Tathlith',fr:'Tathlith',de:'Tathlith',tr:'Tesliyse',ur:'تثلیث',id:'Tathlith',es:'Tathlith',bn:'তাথলিথ',ms:'Tathlith'},
        aliases:{ar:['تثليث']}, priority:72 },
    { slug:'tarib', t:'town', region:'asir', lat:18.9667, lng:43.4500,
        names:{ar:'طريب',en:'Tarib',fr:'Tarib',de:'Tarib',tr:'Tarib',ur:'طریب',id:'Tarib',es:'Tarib',bn:'তারিব',ms:'Tarib'},
        aliases:{ar:['طريب']}, priority:68 },
    { slug:'balqarn', t:'town', region:'asir', lat:19.6000, lng:41.8000,
        names:{ar:'بلقرن',en:'Balqarn',fr:'Balqarn',de:'Balqarn',tr:'Belkarn',ur:'بلقرن',id:'Balqarn',es:'Balqarn',bn:'বালকার্ন',ms:'Balqarn'},
        aliases:{ar:['بلقرن']}, priority:68 },
    { slug:'bariq', t:'town', region:'asir', lat:18.9333, lng:41.5667,
        names:{ar:'بارق',en:'Bariq',fr:'Bariq',de:'Bariq',tr:'Bârik',ur:'بارق',id:'Bariq',es:'Bariq',bn:'বারিক',ms:'Bariq'},
        aliases:{ar:['بارق']}, priority:70 },
    { slug:'wadi-bin-hashbil', t:'locality', region:'asir', lat:19.2167, lng:42.4000,
        names:{ar:'وادي ابن هشبل',en:'Wadi Bin Hashbil',fr:'Wadi Bin Hashbil',de:'Wadi Bin Haschbil',tr:'Vadi Bin Haşbil',ur:'وادی ابن ہشبل',id:'Wadi Bin Hashbil',es:'Wadi Bin Hashbil',bn:'ওয়াদি বিন হাশবিল',ms:'Wadi Bin Hashbil'},
        aliases:{ar:['وادي ابن هشبل']}, priority:65 },
    { slug:'al-harjah', t:'village', region:'asir', lat:19.9417, lng:41.8000,
        names:{ar:'الحرجة',en:'Al Harjah',fr:'Al Harja',de:'al-Harja',tr:'Hârice',ur:'الحرجہ',id:'Al Harjah',es:'Al Harjah',bn:'আল-হারজাহ',ms:'Al Harjah'},
        aliases:{ar:['الحرجة']}, priority:65 },

    // ══════════ Tabuk — 1 extra (well-known coastal town) ══════════
    { slug:'al-muwaylih', t:'town', region:'tabuk', lat:27.6500, lng:35.5333,
        names:{ar:'المويلح',en:'Al Muwaylih',fr:'Al Muwaylih',de:'al-Muwaylih',tr:'Müveylih',ur:'الموَیلح',id:'Al Muwaylih',es:'Al Muwaylih',bn:'আল-মুওয়াইলিহ',ms:'Al Muwaylih'},
        aliases:{ar:['المويلح']}, priority:68 },

    // ══════════ Hail region — fill user's list + 1 extra ══════════
    { slug:'al-hait', t:'town', region:'hail', lat:27.4933, lng:41.6953,
        names:{ar:'الحائط',en:'Al Hait',fr:'Al Hayt',de:'al-Haʾit',tr:'Hâʾit',ur:'الحائط',id:'Al Hait',es:'Al Hait',bn:'আল-হাইত',ms:'Al Hait'},
        aliases:{ar:['الحائط']}, priority:70 },
    { slug:'as-sulaymi', t:'town', region:'hail', lat:27.0386, lng:41.4167,
        names:{ar:'السليمي',en:'As Sulaymi',fr:'As Soulaymi',de:'as-Sulaymi',tr:'Süleymî',ur:'السلیمی',id:'As Sulaymi',es:'As Sulaymi',bn:'আস-সুলায়মি',ms:'As Sulaymi'},
        aliases:{ar:['السليمي']}, priority:68 },
    { slug:'mawqaq', t:'town', region:'hail', lat:27.3486, lng:41.6647,
        names:{ar:'موقق',en:'Mawqaq',fr:'Mawqaq',de:'Mawqaq',tr:'Mevkak',ur:'موقق',id:'Mawqaq',es:'Mawqaq',bn:'মাওকাক',ms:'Mawqaq'},
        aliases:{ar:['موقق']}, priority:65 },
    { slug:'sumayra', t:'town', region:'hail', lat:26.9667, lng:41.8333,
        names:{ar:'سميراء',en:'Sumayra',fr:'Sumayra',de:'Sumayra',tr:'Sümeyra',ur:'سمیراء',id:'Sumayra',es:'Sumayra',bn:'সুমাইরা',ms:'Sumayra'},
        aliases:{ar:['سميراء']}, priority:65 },
    { slug:'ash-shamli', t:'town', region:'hail', lat:27.4361, lng:41.5000,
        names:{ar:'الشملي',en:'Ash Shamli',fr:'Ach Chamli',de:'asch-Schamli',tr:'Şemlî',ur:'الشملی',id:'Ash Shamli',es:'Ash Shamli',bn:'আশ-শামলি',ms:'Ash Shamli'},
        aliases:{ar:['الشملي']}, priority:65 },
    { slug:'nafi', t:'village', region:'hail', lat:27.0500, lng:41.2100,
        names:{ar:'نفي',en:'Nafi',fr:'Nafi',de:'Nafiʿ',tr:'Nafʿ',ur:'نفی',id:'Nafi',es:'Nafi',bn:'নাফি',ms:'Nafi'},
        aliases:{ar:['نفي']}, priority:65 },

    // ══════════ Jazan region — fill user's list ══════════
    { slug:'fayfa', t:'town', region:'jazan', lat:17.2500, lng:43.1167,
        names:{ar:'فيفاء',en:'Fayfa',fr:'Faifa',de:'Faifa',tr:'Feyfa',ur:'فیفاء',id:'Fayfa',es:'Fayfa',bn:'ফাইফা',ms:'Fayfa'},
        aliases:{ar:['فيفاء','فيفا']}, priority:74 },
    { slug:'ad-dayer', t:'town', region:'jazan', lat:17.4333, lng:43.2000,
        names:{ar:'الداير',en:'Ad Dayer',fr:'Ad Dayer',de:'ad-Dayyir',tr:'Dâyir',ur:'الدائر',id:'Ad Dayer',es:'Ad Dayer',bn:'আদ-দাইর',ms:'Ad Dayer'},
        aliases:{ar:['الداير','الدائر','الداير بني مالك']}, priority:68 },
    { slug:'al-aydabi', t:'town', region:'jazan', lat:17.0333, lng:42.8333,
        names:{ar:'العيدابي',en:'Al Aydabi',fr:'Al Aydabi',de:'al-ʿAydabi',tr:'Aydabî',ur:'العیدابی',id:'Al Aydabi',es:'Al Aydabi',bn:'আল-আইদাবি',ms:'Al Aydabi'},
        aliases:{ar:['العيدابي']}, priority:65 },
    { slug:'damad', t:'town', region:'jazan', lat:16.9667, lng:42.7833,
        names:{ar:'ضمد',en:'Damad',fr:'Damad',de:'Damad',tr:'Damad',ur:'ضمد',id:'Damad',es:'Damad',bn:'দামাদ',ms:'Damad'},
        aliases:{ar:['ضمد']}, priority:65 },
    { slug:'ar-rayth', t:'town', region:'jazan', lat:17.4333, lng:43.0500,
        names:{ar:'الريث',en:'Ar Rayth',fr:'Ar Raith',de:'ar-Rayth',tr:'Reys',ur:'الریث',id:'Ar Rayth',es:'Ar Rayth',bn:'আর-রাইথ',ms:'Ar Rayth'},
        aliases:{ar:['الريث']}, priority:65 },
    { slug:'harub', t:'town', region:'jazan', lat:17.4167, lng:43.0833,
        names:{ar:'هروب',en:'Harub',fr:'Harub',de:'Harub',tr:'Harûb',ur:'ہروب',id:'Harub',es:'Harub',bn:'হারুব',ms:'Harub'},
        aliases:{ar:['هروب']}, priority:65 },

    // ══════════ Jouf region — 1 extra ══════════
    { slug:'al-haditha-jo', t:'town', region:'jouf', lat:30.8167, lng:38.4500,
        names:{ar:'الحديثة',en:'Al Haditha',fr:'Al Haditha',de:'al-Haditha',tr:'Hâdise',ur:'الحدیثہ',id:'Al Haditha',es:'Al Haditha',bn:'আল-হাদিসা',ms:'Al Haditha'},
        aliases:{ar:['الحديثة']}, priority:68 }
];

let added = 0;
for (const c of newPlaces) {
    if (seen.has(c.slug)) { console.log('  SKIP (exists)', c.slug); continue; }
    const region = RG[c.region];
    places.push({
        slug: c.slug, type: c.t, countryCode: 'sa',
        lat: c.lat, lng: c.lng, timezone: TZ,
        names: c.names, aliases: c.aliases,
        admin: {
            countryAr: CC_AR, countryEn: CC_EN,
            regionAr: region.ar, regionEn: region.en
        },
        priority: c.priority, source: 'curated', verified: true
    });
    seen.add(c.slug);
    added++;
}

// ─── Add الأحساء as alias to existing hofuf (governorate-as-alias) ───
const hofuf = places.find(p => p.slug === 'hofuf');
if (hofuf) {
    hofuf.aliases.ar = hofuf.aliases.ar || [];
    for (const a of ['الأحساء','الاحساء','أحساء','احساء']) {
        if (!hofuf.aliases.ar.includes(a)) {
            hofuf.aliases.ar.push(a);
            console.log('  ADD alias to hofuf:', a);
        }
    }
}

fs.writeFileSync(PATH, JSON.stringify(places, null, 2) + '\n');
console.log('Added', added, 'places. Total entries:', places.length);
const sa = places.filter(p => p.countryCode === 'sa').length;
console.log('Saudi total now:', sa);
// Type breakdown for Saudi
const types = {};
for (const x of places) if (x.countryCode === 'sa') types[x.type] = (types[x.type]||0) + 1;
console.log('Saudi types:', JSON.stringify(types));
