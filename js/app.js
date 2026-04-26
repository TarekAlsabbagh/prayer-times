/**
 * التطبيق الرئيسي - ربط جميع المكونات
 */

// ========= المتغيرات العامة =========
let currentLat = 21.4225;
let currentLng = 39.8262;
let currentCity = 'مكة المكرمة';
let currentEnglishName = 'Mecca'; // الاسم الإنجليزي للمدينة (للـ slug)
let currentEnglishDisplayName = 'Mecca'; // الاسم الإنجليزي مع الحي (للعرض)
let currentCountry = 'المملكة العربية السعودية';
let currentEnglishCountry = 'Saudi Arabia'; // الاسم الإنجليزي للدولة
let currentCountryCode = 'sa'; // كود ISO للدولة الحالية
// أسماء مترجمة إلى اللغة الحالية (ur/tr/fr) — تُعبَّأ من Nominatim بـ accept-language={lang}
// تبقى فارغة للعربية والإنجليزية لأنّ currentCity/currentEnglishName يغطيان الحالتَيْن
let currentLocalizedName = '';
let currentLocalizedCountry = '';

// ===== أسماء الدول بالإنجليزية (مفهرسة بكود ISO) =====
const COUNTRY_EN_NAMES = {
    sa:'Saudi Arabia', eg:'Egypt', sy:'Syria', iq:'Iraq',
    jo:'Jordan', lb:'Lebanon', ae:'United Arab Emirates', kw:'Kuwait',
    qa:'Qatar', bh:'Bahrain', om:'Oman', ye:'Yemen', ps:'Palestine',
    ma:'Morocco', dz:'Algeria', tn:'Tunisia', ly:'Libya', sd:'Sudan',
    mr:'Mauritania', so:'Somalia', km:'Comoros',
    pk:'Pakistan', in:'India', bd:'Bangladesh', af:'Afghanistan',
    tr:'Turkey', ir:'Iran', id:'Indonesia', my:'Malaysia',
    sg:'Singapore', bn:'Brunei', ph:'Philippines', th:'Thailand',
    vn:'Vietnam', kh:'Cambodia', la:'Laos', tl:'Timor-Leste',
    cn:'China', jp:'Japan', kr:'South Korea', kp:'North Korea', mn:'Mongolia',
    kz:'Kazakhstan', uz:'Uzbekistan', az:'Azerbaijan', lk:'Sri Lanka',
    np:'Nepal', mm:'Myanmar', kg:'Kyrgyzstan', tj:'Tajikistan',
    tm:'Turkmenistan', ge:'Georgia', am:'Armenia',
    fr:'France', de:'Germany', gb:'United Kingdom', nl:'Netherlands',
    be:'Belgium', es:'Spain', it:'Italy', pt:'Portugal',
    ru:'Russia', pl:'Poland', se:'Sweden', no:'Norway',
    dk:'Denmark', fi:'Finland', ch:'Switzerland', at:'Austria',
    gr:'Greece', cz:'Czech Republic', ro:'Romania', hu:'Hungary',
    ua:'Ukraine', hr:'Croatia', rs:'Serbia', sk:'Slovakia',
    bg:'Bulgaria', ba:'Bosnia and Herzegovina', al:'Albania', mk:'North Macedonia',
    xk:'Kosovo', me:'Montenegro', si:'Slovenia', ee:'Estonia',
    lv:'Latvia', lt:'Lithuania', md:'Moldova', by:'Belarus',
    ie:'Ireland', lu:'Luxembourg', mt:'Malta', cy:'Cyprus',
    is:'Iceland', li:'Liechtenstein',
    us:'United States', ca:'Canada', mx:'Mexico',
    hn:'Honduras', sv:'El Salvador', ni:'Nicaragua', cr:'Costa Rica',
    pa:'Panama', do:'Dominican Republic', ht:'Haiti', jm:'Jamaica',
    br:'Brazil', ar:'Argentina', co:'Colombia', pe:'Peru',
    ve:'Venezuela', cl:'Chile', ec:'Ecuador', bo:'Bolivia',
    py:'Paraguay', uy:'Uruguay', gt:'Guatemala', cu:'Cuba',
    gy:'Guyana', sr:'Suriname',
    au:'Australia', nz:'New Zealand', pg:'Papua New Guinea', fj:'Fiji',
    ng:'Nigeria', et:'Ethiopia', ke:'Kenya', tz:'Tanzania',
    za:'South Africa', gh:'Ghana', sn:'Senegal', ci:"Cote d'Ivoire",
    cm:'Cameroon', ml:'Mali', ne:'Niger', td:'Chad',
    ug:'Uganda', mz:'Mozambique', zw:'Zimbabwe', mg:'Madagascar',
    ao:'Angola', dj:'Djibouti', er:'Eritrea', rw:'Rwanda',
    bi:'Burundi', mw:'Malawi', zm:'Zambia', na:'Namibia',
    bw:'Botswana', ls:'Lesotho', sz:'Eswatini',
    // Round 7k additions (2026-04-16): missing from above
    bf:'Burkina Faso', gn:'Guinea', gm:'Gambia', sl:'Sierra Leone',
    mv:'Maldives', ss:'South Sudan', tg:'Togo', bj:'Benin',
    cd:'DR Congo', lr:'Liberia', mu:'Mauritius', bt:'Bhutan',
    tt:'Trinidad and Tobago',
    // Microstates with same-name capital collisions (handled via "-city" suffix)
    mc:'Monaco', sm:'San Marino', va:'Vatican City', ad:'Andorra',
};

// ===== خرائط أسماء الدول المترجَمة (بديل إذا Nominatim لم يعد ترجمة محلية) =====
const COUNTRY_NAMES_BN = {
    sa:'সৌদি আরব', eg:'মিশর', sy:'সিরিয়া', iq:'ইরাক', jo:'জর্ডান', lb:'লেবানন',
    ae:'সংযুক্ত আরব আমিরাত', kw:'কুয়েত', qa:'কাতার', bh:'বাহরাইন', om:'ওমান',
    ye:'ইয়েমেন', ps:'ফিলিস্তিন', ma:'মরক্কো', dz:'আলজেরিয়া', tn:'তিউনিসিয়া',
    ly:'লিবিয়া', sd:'সুদান', mr:'মৌরিতানিয়া', so:'সোমালিয়া', km:'কোমোরোস',
    pk:'পাকিস্তান', in:'ভারত', bd:'বাংলাদেশ', af:'আফগানিস্তান', tr:'তুরস্ক',
    ir:'ইরান', id:'ইন্দোনেশিয়া', my:'মালয়েশিয়া', sg:'সিঙ্গাপুর', bn:'ব্রুনাই',
    ph:'ফিলিপাইন', th:'থাইল্যান্ড', cn:'চীন', jp:'জাপান', kr:'দক্ষিণ কোরিয়া',
    fr:'ফ্রান্স', de:'জার্মানি', gb:'যুক্তরাজ্য', nl:'নেদারল্যান্ডস', es:'স্পেন',
    it:'ইতালি', pt:'পর্তুগাল', ru:'রাশিয়া', us:'যুক্তরাষ্ট্র', ca:'কানাডা',
    mx:'মেক্সিকো', br:'ব্রাজিল', ar:'আর্জেন্টিনা', au:'অস্ট্রেলিয়া',
    ng:'নাইজেরিয়া', et:'ইথিওপিয়া', ke:'কেনিয়া', za:'দক্ষিণ আফ্রিকা',
    mv:'মালদ্বীপ', lk:'শ্রীলঙ্কা', np:'নেপাল', mm:'মিয়ানমার', bt:'ভুটান',
    dj:'জিবুতি',
};
const COUNTRY_NAMES_ES = {
    sa:'Arabia Saudita', eg:'Egipto', sy:'Siria', iq:'Irak', jo:'Jordania',
    lb:'Líbano', ae:'Emiratos Árabes Unidos', kw:'Kuwait', qa:'Catar',
    bh:'Baréin', om:'Omán', ye:'Yemen', ps:'Palestina', ma:'Marruecos',
    dz:'Argelia', tn:'Túnez', ly:'Libia', sd:'Sudán', mr:'Mauritania',
    so:'Somalia', km:'Comoras', pk:'Pakistán', in:'India', bd:'Bangladés',
    af:'Afganistán', tr:'Turquía', ir:'Irán', id:'Indonesia', my:'Malasia',
    sg:'Singapur', bn:'Brunéi', ph:'Filipinas', th:'Tailandia', cn:'China',
    jp:'Japón', kr:'Corea del Sur', fr:'Francia', de:'Alemania',
    gb:'Reino Unido', nl:'Países Bajos', es:'España', it:'Italia',
    pt:'Portugal', ru:'Rusia', us:'Estados Unidos', ca:'Canadá',
    mx:'México', br:'Brasil', ar:'Argentina', au:'Australia',
    ng:'Nigeria', et:'Etiopía', ke:'Kenia', za:'Sudáfrica',
    mv:'Maldivas', lk:'Sri Lanka', np:'Nepal', mm:'Myanmar', bt:'Bután',
    dj:'Yibuti',
};
const COUNTRY_NAMES_MS = {
    sa:'Arab Saudi', eg:'Mesir', sy:'Syria', iq:'Iraq', jo:'Jordan',
    lb:'Lubnan', ae:'Emiriah Arab Bersatu', kw:'Kuwait', qa:'Qatar',
    bh:'Bahrain', om:'Oman', ye:'Yaman', ps:'Palestin', ma:'Maghribi',
    dz:'Algeria', tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania',
    so:'Somalia', km:'Komoros', pk:'Pakistan', in:'India', bd:'Bangladesh',
    af:'Afghanistan', tr:'Turki', ir:'Iran', id:'Indonesia', my:'Malaysia',
    sg:'Singapura', bn:'Brunei', ph:'Filipina', th:'Thailand', cn:'China',
    jp:'Jepun', kr:'Korea Selatan', fr:'Perancis', de:'Jerman',
    gb:'United Kingdom', nl:'Belanda', es:'Sepanyol', it:'Itali',
    pt:'Portugal', ru:'Rusia', us:'Amerika Syarikat', ca:'Kanada',
    mx:'Mexico', br:'Brazil', ar:'Argentina', au:'Australia',
    ng:'Nigeria', et:'Ethiopia', ke:'Kenya', za:'Afrika Selatan',
    mv:'Maldives', lk:'Sri Lanka', np:'Nepal', mm:'Myanmar', bt:'Bhutan',
    dj:'Djibouti',
};
// ===== أسماء المدن الشائعة بالبنغالية/الإسبانية/الملايو (مفتاح: اسم إنجليزي) =====
const CITY_NAMES_BN = {
    Mecca:'মক্কা', Medina:'মদিনা', Riyadh:'রিয়াদ', Jeddah:'জেদ্দা',
    Dammam:'দাম্মাম', Khobar:'খোবার', Taif:'তায়েফ', Tabuk:'তাবুক',
    Buraidah:'বুরাইদা', Buraydah:'বুরাইদা', Abha:'আভা', Yanbu:'ইয়ানবু', Hail:'হাইল',
    Najran:'নাজরান', Jizan:'জিজান', Khamis:'খামিস', 'Khamis Mushait':'খামিস মুশাইত',
    'Al Hofuf':'আল হুফুফ', Hofuf:'হুফুফ', 'Al Kharj':'আল খারজ',
    Qatif:'কাতিফ', 'Al Jubail':'আল জুবাইল', Jubail:'জুবাইল',
    Cairo:'কায়রো', Alexandria:'আলেকজান্দ্রিয়া', Giza:'গিজা',
    Istanbul:'ইস্তাম্বুল', Ankara:'আঙ্কারা', Izmir:'ইজমির',
    Dubai:'দুবাই', 'Abu Dhabi':'আবুধাবি', Sharjah:'শারজাহ',
    Amman:'আম্মান', Baghdad:'বাগদাদ', Basra:'বসরা', Mosul:'মসুল',
    Damascus:'দামেস্ক', Aleppo:'আলেপ্পো', Homs:'হোমস',
    Casablanca:'কাসাব্লাঙ্কা', Rabat:'রাবাত', Marrakesh:'মারাকেশ',
    Jerusalem:'জেরুজালেম', Gaza:'গাজা', Ramallah:'রামাল্লাহ',
    Doha:'দোহা', 'Kuwait City':'কুয়েত সিটি', Manama:'মানামা',
    Muscat:'মাস্কাট', Sanaa:'সানা', Aden:'এডেন',
    Dhaka:'ঢাকা', Chittagong:'চট্টগ্রাম', Rajshahi:'রাজশাহী',
    Khulna:'খুলনা', Sylhet:'সিলেট', Barisal:'বরিশাল',
    Karachi:'করাচি', Lahore:'লাহোর', Islamabad:'ইসলামাবাদ',
    Delhi:'দিল্লি', Mumbai:'মুম্বাই', Kolkata:'কলকাতা',
    Bangalore:'বেঙ্গালুরু', Chennai:'চেন্নাই', Hyderabad:'হায়দ্রাবাদ',
    Jakarta:'জাকার্তা', Surabaya:'সুরাবায়া', Bandung:'বান্দুং',
    'Kuala Lumpur':'কুয়ালালামপুর', Singapore:'সিঙ্গাপুর',
    London:'লন্ডন', Manchester:'ম্যানচেস্টার', Birmingham:'বার্মিংহাম',
    Paris:'প্যারিস', Berlin:'বার্লিন', Munich:'মিউনিখ',
    Madrid:'মাদ্রিদ', Barcelona:'বার্সেলোনা', Rome:'রোম',
    Milan:'মিলান', Moscow:'মস্কো', 'New York':'নিউ ইয়র্ক',
    'Los Angeles':'লস অ্যাঞ্জেলেস', Chicago:'শিকাগো', Toronto:'টরন্টো',
    Tokyo:'টোকিও', Beijing:'বেইজিং', Shanghai:'সাংহাই',
    Sydney:'সিডনি', Melbourne:'মেলবোর্ন',
    // Microstates / city-states
    Monaco:'মোনাকো', 'Monte Carlo':'মন্টে কার্লো',
    'San Marino':'সান মারিনো', 'Vatican City':'ভ্যাটিকান সিটি',
    'Andorra la Vella':'আন্দোরা লা ভেলা', Vaduz:'ফাদুৎস',
    Luxembourg:'লুক্সেমবার্গ', Valletta:'ভ্যালেটা',
};
const CITY_NAMES_ES = {
    Mecca:'La Meca', Medina:'Medina', Riyadh:'Riad', Jeddah:'Yeda',
    Cairo:'El Cairo', Istanbul:'Estambul', Dubai:'Dubái', Amman:'Ammán',
    Baghdad:'Bagdad', Damascus:'Damasco', Casablanca:'Casablanca',
    Jerusalem:'Jerusalén', Dhaka:'Daca', Karachi:'Karachi',
    Delhi:'Delhi', Mumbai:'Bombay', Jakarta:'Yakarta',
    'Kuala Lumpur':'Kuala Lumpur', London:'Londres', Paris:'París',
    Berlin:'Berlín', Madrid:'Madrid', Rome:'Roma', Moscow:'Moscú',
    'New York':'Nueva York',
    // Microstates / city-states
    Monaco:'Mónaco', 'Monte Carlo':'Montecarlo',
    'San Marino':'San Marino', 'Vatican City':'Ciudad del Vaticano',
    'Andorra la Vella':'Andorra la Vieja', Vaduz:'Vaduz',
    Luxembourg:'Luxemburgo', Valletta:'La Valeta',
};
const CITY_NAMES_MS = {
    Mecca:'Makkah', Medina:'Madinah', Riyadh:'Riyadh', Jeddah:'Jeddah',
    Cairo:'Kaherah', Istanbul:'Istanbul', Dubai:'Dubai', Amman:'Amman',
    Baghdad:'Baghdad', Damascus:'Damsyik', Casablanca:'Casablanca',
    Jerusalem:'Baitulmaqdis', Dhaka:'Dhaka', Karachi:'Karachi',
    Delhi:'Delhi', Mumbai:'Mumbai', Jakarta:'Jakarta',
    'Kuala Lumpur':'Kuala Lumpur', London:'London', Paris:'Paris',
    Berlin:'Berlin', Madrid:'Madrid', Rome:'Rom', Moscow:'Moscow',
    'New York':'New York',
    // Microstates / city-states
    Monaco:'Monaco', 'Monte Carlo':'Monte Carlo',
    'San Marino':'San Marino', 'Vatican City':'Kota Vatican',
    'Andorra la Vella':'Andorra la Vella', Vaduz:'Vaduz',
    Luxembourg:'Luxembourg', Valletta:'Valletta',
};
// ===== أسماء المدن بالأوردو =====
const CITY_NAMES_UR = {
    Mecca:'مکہ', Medina:'مدینہ', Riyadh:'ریاض', Jeddah:'جدہ',
    Dammam:'دمام', Khobar:'الخبر', Taif:'طائف', Tabuk:'تبوک',
    Buraidah:'بریدہ', Buraydah:'بریدہ', Abha:'ابھا', Yanbu:'ینبع', Hail:'حائل',
    Najran:'نجران', Jizan:'جیزان', 'Khamis Mushait':'خمیس مشیط',
    'Al Hofuf':'الہفوف', Hofuf:'الہفوف', 'Al Kharj':'الخرج',
    Qatif:'القطیف', 'Al Jubail':'الجبیل', Jubail:'الجبیل',
    Cairo:'قاہرہ', Alexandria:'اسکندریہ', Giza:'جیزہ',
    Istanbul:'استنبول', Ankara:'انقرہ', Izmir:'ازمیر',
    Dubai:'دبئی', 'Abu Dhabi':'ابوظہبی', Sharjah:'شارجہ',
    Amman:'عمّان', Baghdad:'بغداد', Basra:'بصرہ', Mosul:'موصل',
    Damascus:'دمشق', Aleppo:'حلب', Homs:'حمص',
    Casablanca:'کاسابلانکا', Rabat:'رباط', Marrakesh:'مراکش',
    Jerusalem:'یروشلم', Gaza:'غزہ', Ramallah:'رام اللہ',
    Doha:'دوحہ', 'Kuwait City':'کویت سٹی', Manama:'منامہ',
    Muscat:'مسقط', Sanaa:'صنعا', Aden:'عدن',
    Dhaka:'ڈھاکہ', Chittagong:'چٹاگانگ',
    Karachi:'کراچی', Lahore:'لاہور', Islamabad:'اسلام آباد',
    Delhi:'دہلی', Mumbai:'ممبئی', Kolkata:'کولکاتا',
    Bangalore:'بنگلور', Chennai:'چنئی', Hyderabad:'حیدرآباد',
    Jakarta:'جکارتا', Surabaya:'سورابایا', Bandung:'بندونگ',
    'Kuala Lumpur':'کوالالمپور', Singapore:'سنگاپور',
    London:'لندن', Manchester:'مانچسٹر', Birmingham:'برمنگھم',
    Paris:'پیرس', Berlin:'برلن', Munich:'میونخ',
    Madrid:'میڈرڈ', Barcelona:'بارسلونا', Rome:'روم',
    Milan:'میلان', Moscow:'ماسکو', 'New York':'نیویارک',
    'Los Angeles':'لاس اینجلس', Chicago:'شکاگو', Toronto:'ٹورنٹو',
    Tokyo:'ٹوکیو', Beijing:'بیجنگ', Shanghai:'شنگھائی',
    Sydney:'سڈنی', Melbourne:'میلبورن',
    // Microstates / city-states
    Monaco:'موناکو', 'Monte Carlo':'مونٹی کارلو',
    'San Marino':'سان مارینو', 'Vatican City':'ویٹیکن سٹی',
    'Andorra la Vella':'انڈورا لا ویا', Vaduz:'فادوز',
    Luxembourg:'لکسمبرگ', Valletta:'ویلیٹا',
};
// ===== أسماء المدن بالتركية =====
const CITY_NAMES_TR = {
    Mecca:'Mekke', Medina:'Medine', Riyadh:'Riyad', Jeddah:'Cidde',
    Dammam:'Dammam', Khobar:'Hubar', Taif:'Taif', Tabuk:'Tebük',
    Buraidah:'Bureyde', Buraydah:'Bureyde', Abha:'Ebha', Yanbu:'Yenbu', Hail:'Hail',
    Najran:'Necran', Jizan:'Cizan', 'Khamis Mushait':'Hamis Müşeyt',
    'Al Hofuf':'Hufuf', Hofuf:'Hufuf', 'Al Kharj':'El-Harc',
    Qatif:'Katif', 'Al Jubail':'Cübeyl', Jubail:'Cübeyl',
    Cairo:'Kahire', Alexandria:'İskenderiye', Giza:'Giza',
    Istanbul:'İstanbul', Ankara:'Ankara', Izmir:'İzmir',
    Dubai:'Dubai', 'Abu Dhabi':'Abu Dabi', Sharjah:'Şarika',
    Amman:'Amman', Baghdad:'Bağdat', Basra:'Basra', Mosul:'Musul',
    Damascus:'Şam', Aleppo:'Halep', Homs:'Humus',
    Casablanca:'Kazablanka', Rabat:'Rabat', Marrakesh:'Marakeş',
    Jerusalem:'Kudüs', Gaza:'Gazze', Ramallah:'Ramallah',
    Doha:'Doha', 'Kuwait City':'Kuveyt Şehri', Manama:'Manama',
    Muscat:'Maskat', Sanaa:'Sana', Aden:'Aden',
    Dhaka:'Dakka', Chittagong:'Chittagong',
    Karachi:'Karaçi', Lahore:'Lahor', Islamabad:'İslamabad',
    Delhi:'Delhi', Mumbai:'Mumbai', Kolkata:'Kalküta',
    Bangalore:'Bangalore', Chennai:'Chennai', Hyderabad:'Haydarabad',
    Jakarta:'Cakarta', Surabaya:'Surabaya', Bandung:'Bandung',
    'Kuala Lumpur':'Kuala Lumpur', Singapore:'Singapur',
    London:'Londra', Manchester:'Manchester', Birmingham:'Birmingham',
    Paris:'Paris', Berlin:'Berlin', Munich:'Münih',
    Madrid:'Madrid', Barcelona:'Barselona', Rome:'Roma',
    Milan:'Milano', Moscow:'Moskova', 'New York':'New York',
    'Los Angeles':'Los Angeles', Chicago:'Chicago', Toronto:'Toronto',
    Tokyo:'Tokyo', Beijing:'Pekin', Shanghai:'Şanghay',
    Sydney:'Sidney', Melbourne:'Melbourne',
    // Microstates / city-states
    Monaco:'Monako', 'Monte Carlo':'Monte Karlo',
    'San Marino':'San Marino', 'Vatican City':'Vatikan',
    'Andorra la Vella':'Andorra la Vella', Vaduz:'Vaduz',
    Luxembourg:'Lüksemburg', Valletta:'Valletta',
};
// ===== أسماء المدن بالفرنسية =====
const CITY_NAMES_FR = {
    Mecca:'La Mecque', Medina:'Médine', Riyadh:'Riyad', Jeddah:'Djeddah',
    Dammam:'Dammam', Khobar:'Khobar', Taif:'Taïf', Tabuk:'Tabouk',
    Buraidah:'Buraydah', Buraydah:'Buraydah', Abha:'Abha', Yanbu:'Yanbu', Hail:'Haïl',
    Najran:'Najran', Jizan:'Jizan', 'Khamis Mushait':'Khamis Mushait',
    'Al Hofuf':'Hofuf', Hofuf:'Hofuf', 'Al Kharj':'Al Kharj',
    Qatif:'Qatif', 'Al Jubail':'Al Jubail', Jubail:'Jubail',
    Cairo:'Le Caire', Alexandria:'Alexandrie', Giza:'Gizeh',
    Istanbul:'Istanbul', Ankara:'Ankara', Izmir:'Izmir',
    Dubai:'Dubaï', 'Abu Dhabi':'Abou Dabi', Sharjah:'Charjah',
    Amman:'Amman', Baghdad:'Bagdad', Basra:'Bassora', Mosul:'Mossoul',
    Damascus:'Damas', Aleppo:'Alep', Homs:'Homs',
    Casablanca:'Casablanca', Rabat:'Rabat', Marrakesh:'Marrakech',
    Jerusalem:'Jérusalem', Gaza:'Gaza', Ramallah:'Ramallah',
    Doha:'Doha', 'Kuwait City':'Koweït', Manama:'Manama',
    Muscat:'Mascate', Sanaa:'Sanaa', Aden:'Aden',
    Dhaka:'Dacca', Chittagong:'Chattogram',
    Karachi:'Karachi', Lahore:'Lahore', Islamabad:'Islamabad',
    Delhi:'Delhi', Mumbai:'Bombay', Kolkata:'Calcutta',
    Bangalore:'Bangalore', Chennai:'Chennai', Hyderabad:'Hyderabad',
    Jakarta:'Jakarta', Surabaya:'Surabaya', Bandung:'Bandung',
    'Kuala Lumpur':'Kuala Lumpur', Singapore:'Singapour',
    London:'Londres', Manchester:'Manchester', Birmingham:'Birmingham',
    Paris:'Paris', Berlin:'Berlin', Munich:'Munich',
    Madrid:'Madrid', Barcelona:'Barcelone', Rome:'Rome',
    Milan:'Milan', Moscow:'Moscou', 'New York':'New York',
    'Los Angeles':'Los Angeles', Chicago:'Chicago', Toronto:'Toronto',
    Tokyo:'Tokyo', Beijing:'Pékin', Shanghai:'Shanghai',
    Sydney:'Sydney', Melbourne:'Melbourne',
    // Microstates / city-states
    Monaco:'Monaco', 'Monte Carlo':'Monte-Carlo',
    'San Marino':'Saint-Marin', 'Vatican City':'Cité du Vatican',
    'Andorra la Vella':'Andorre-la-Vieille', Vaduz:'Vaduz',
    Luxembourg:'Luxembourg', Valletta:'La Valette',
};
// ===== أسماء المدن بالألمانية =====
const CITY_NAMES_DE = {
    Mecca:'Mekka', Medina:'Medina', Riyadh:'Riad', Jeddah:'Dschidda',
    Dammam:'Dammam', Khobar:'Al-Chubar', Taif:'Taif', Tabuk:'Tabuk',
    Buraidah:'Buraida', Buraydah:'Buraida', Abha:'Abha', Yanbu:'Yanbu', Hail:'Hail',
    Najran:'Nadschran', Jizan:'Dschazan', 'Khamis Mushait':'Chamis Muschait',
    'Al Hofuf':'Hufuf', Hofuf:'Hufuf', 'Al Kharj':'Al-Chardsch',
    Qatif:'Qatif', 'Al Jubail':'Dschubail', Jubail:'Dschubail',
    Cairo:'Kairo', Alexandria:'Alexandria', Giza:'Gizeh',
    Istanbul:'Istanbul', Ankara:'Ankara', Izmir:'Izmir',
    Dubai:'Dubai', 'Abu Dhabi':'Abu Dhabi', Sharjah:'Schardscha',
    Amman:'Amman', Baghdad:'Bagdad', Basra:'Basra', Mosul:'Mossul',
    Damascus:'Damaskus', Aleppo:'Aleppo', Homs:'Homs',
    Casablanca:'Casablanca', Rabat:'Rabat', Marrakesh:'Marrakesch',
    Jerusalem:'Jerusalem', Gaza:'Gaza', Ramallah:'Ramallah',
    Doha:'Doha', 'Kuwait City':'Kuwait-Stadt', Manama:'Manama',
    Muscat:'Maskat', Sanaa:'Sanaa', Aden:'Aden',
    Dhaka:'Dhaka', Chittagong:'Chittagong',
    Karachi:'Karatschi', Lahore:'Lahore', Islamabad:'Islamabad',
    Delhi:'Delhi', Mumbai:'Mumbai', Kolkata:'Kalkutta',
    Bangalore:'Bengaluru', Chennai:'Chennai', Hyderabad:'Hyderabad',
    Jakarta:'Jakarta', Surabaya:'Surabaya', Bandung:'Bandung',
    'Kuala Lumpur':'Kuala Lumpur', Singapore:'Singapur',
    London:'London', Manchester:'Manchester', Birmingham:'Birmingham',
    Paris:'Paris', Berlin:'Berlin', Munich:'München',
    Madrid:'Madrid', Barcelona:'Barcelona', Rome:'Rom',
    Milan:'Mailand', Moscow:'Moskau', 'New York':'New York',
    'Los Angeles':'Los Angeles', Chicago:'Chicago', Toronto:'Toronto',
    Tokyo:'Tokio', Beijing:'Peking', Shanghai:'Shanghai',
    Sydney:'Sydney', Melbourne:'Melbourne',
    // Microstates / city-states
    Monaco:'Monaco', 'Monte Carlo':'Monte Carlo',
    'San Marino':'San Marino', 'Vatican City':'Vatikanstadt',
    'Andorra la Vella':'Andorra la Vella', Vaduz:'Vaduz',
    Luxembourg:'Luxemburg', Valletta:'Valletta',
};
// ===== أسماء المدن بالإندونيسية =====
const CITY_NAMES_ID = {
    Mecca:'Makkah', Medina:'Madinah', Riyadh:'Riyadh', Jeddah:'Jeddah',
    Dammam:'Dammam', Khobar:'Khobar', Taif:'Taif', Tabuk:'Tabuk',
    Buraidah:'Buraidah', Buraydah:'Buraidah', Abha:'Abha', Yanbu:'Yanbu', Hail:'Hail',
    Najran:'Najran', Jizan:'Jizan', 'Khamis Mushait':'Khamis Mushait',
    'Al Hofuf':'Hofuf', Hofuf:'Hofuf', 'Al Kharj':'Al Kharj',
    Qatif:'Qatif', 'Al Jubail':'Al Jubail', Jubail:'Jubail',
    Cairo:'Kairo', Alexandria:'Alexandria', Giza:'Giza',
    Istanbul:'Istanbul', Ankara:'Ankara', Izmir:'Izmir',
    Dubai:'Dubai', 'Abu Dhabi':'Abu Dhabi', Sharjah:'Sharjah',
    Amman:'Amman', Baghdad:'Baghdad', Basra:'Basra', Mosul:'Mosul',
    Damascus:'Damaskus', Aleppo:'Aleppo', Homs:'Homs',
    Casablanca:'Casablanca', Rabat:'Rabat', Marrakesh:'Marrakesh',
    Jerusalem:'Yerusalem', Gaza:'Gaza', Ramallah:'Ramallah',
    Doha:'Doha', 'Kuwait City':'Kota Kuwait', Manama:'Manama',
    Muscat:'Muskat', Sanaa:'Sanaa', Aden:'Aden',
    Dhaka:'Dhaka', Chittagong:'Chittagong',
    Karachi:'Karachi', Lahore:'Lahore', Islamabad:'Islamabad',
    Delhi:'Delhi', Mumbai:'Mumbai', Kolkata:'Kolkata',
    Bangalore:'Bangalore', Chennai:'Chennai', Hyderabad:'Hyderabad',
    Jakarta:'Jakarta', Surabaya:'Surabaya', Bandung:'Bandung',
    'Kuala Lumpur':'Kuala Lumpur', Singapore:'Singapura',
    London:'London', Manchester:'Manchester', Birmingham:'Birmingham',
    Paris:'Paris', Berlin:'Berlin', Munich:'München',
    Madrid:'Madrid', Barcelona:'Barcelona', Rome:'Roma',
    Milan:'Milan', Moscow:'Moskwa', 'New York':'New York',
    'Los Angeles':'Los Angeles', Chicago:'Chicago', Toronto:'Toronto',
    Tokyo:'Tokyo', Beijing:'Beijing', Shanghai:'Shanghai',
    Sydney:'Sydney', Melbourne:'Melbourne',
    // Microstates / city-states
    Monaco:'Monako', 'Monte Carlo':'Monte Carlo',
    'San Marino':'San Marino', 'Vatican City':'Kota Vatikan',
    'Andorra la Vella':'Andorra la Vella', Vaduz:'Vaduz',
    Luxembourg:'Luksemburg', Valletta:'Valletta',
};
// ===== أسماء المدن بالعربيّة =====
// للـ fallback في _moonCityDisplayName عند الزيارة المباشرة لـ /moon-today-in-<slug>
// بدون session storage (مثلًا طوكيو بدون إعادة توجيه من صفحة الصلاة).
const CITY_NAMES_AR = {
    Mecca:'مكّة المكرّمة', Medina:'المدينة المنوّرة', Riyadh:'الرياض', Jeddah:'جدّة',
    Dammam:'الدمام', Khobar:'الخُبر', Taif:'الطائف', Tabuk:'تبوك',
    Buraidah:'بريدة', Buraydah:'بريدة', Abha:'أبها', Yanbu:'ينبع', Hail:'حائل',
    Najran:'نجران', Jizan:'جازان', 'Khamis Mushait':'خميس مشيط',
    'Al Hofuf':'الهفوف', Hofuf:'الهفوف', 'Al Kharj':'الخرج',
    Qatif:'القطيف', 'Al Jubail':'الجبيل', Jubail:'الجبيل',
    Cairo:'القاهرة', Alexandria:'الإسكندريّة', Giza:'الجيزة',
    Istanbul:'إسطنبول', Ankara:'أنقرة', Izmir:'إزمير',
    Dubai:'دبي', 'Abu Dhabi':'أبوظبي', Sharjah:'الشارقة',
    Amman:'عمّان', Baghdad:'بغداد', Basra:'البصرة', Mosul:'الموصل',
    Damascus:'دمشق', Aleppo:'حلب', Homs:'حمص',
    Casablanca:'الدار البيضاء', Rabat:'الرباط', Marrakesh:'مرّاكش',
    Jerusalem:'القدس', Gaza:'غزّة', Ramallah:'رام الله',
    Doha:'الدوحة', 'Kuwait City':'مدينة الكويت', Manama:'المنامة',
    Muscat:'مسقط', Sanaa:'صنعاء', Aden:'عدن',
    Dhaka:'دكّا', Chittagong:'شيتاغونغ',
    Karachi:'كراتشي', Lahore:'لاهور', Islamabad:'إسلام آباد',
    Delhi:'دلهي', Mumbai:'مومباي', Kolkata:'كولكاتا',
    Bangalore:'بنغالور', Chennai:'تشيناي', Hyderabad:'حيدر آباد',
    Jakarta:'جاكرتا', Surabaya:'سورابايا', Bandung:'باندونغ',
    'Kuala Lumpur':'كوالالمبور', Singapore:'سنغافورة',
    London:'لندن', Manchester:'مانشستر', Birmingham:'برمنغهام',
    Paris:'باريس', Berlin:'برلين', Munich:'ميونخ',
    Madrid:'مدريد', Barcelona:'برشلونة', Rome:'روما',
    Milan:'ميلانو', Moscow:'موسكو', 'New York':'نيويورك',
    'Los Angeles':'لوس أنجلوس', Chicago:'شيكاغو', Toronto:'تورنتو',
    Tokyo:'طوكيو', Beijing:'بكين', Shanghai:'شنغهاي',
    Seoul:'سيول', Bangkok:'بانكوك', Hanoi:'هانوي',
    'Ho Chi Minh City':'هو تشي منه', Manila:'مانيلا',
    Sydney:'سيدني', Melbourne:'ملبورن',
    // Microstates / city-states
    Monaco:'موناكو', 'Monte Carlo':'مونت كارلو',
    'San Marino':'سان مارينو', 'Vatican City':'مدينة الفاتيكان',
    'Andorra la Vella':'أندورا لا فيلا', Vaduz:'فادوتس',
    Luxembourg:'لوكسمبورغ', Valletta:'فاليتا',
};
// ===== أسماء الدول بالأوردو =====
const COUNTRY_NAMES_UR = {
    sa:'سعودی عرب', eg:'مصر', sy:'شام', iq:'عراق', jo:'اردن', lb:'لبنان',
    ae:'متحدہ عرب امارات', kw:'کویت', qa:'قطر', bh:'بحرین', om:'عمان',
    ye:'یمن', ps:'فلسطین', ma:'مراکش', dz:'الجزائر', tn:'تیونس',
    ly:'لیبیا', sd:'سوڈان', mr:'موریتانیہ', so:'صومالیہ', km:'کوموروس',
    pk:'پاکستان', in:'بھارت', bd:'بنگلہ دیش', af:'افغانستان', tr:'ترکیہ',
    ir:'ایران', id:'انڈونیشیا', my:'ملائیشیا', sg:'سنگاپور', bn:'برونائی',
    ph:'فلپائن', th:'تھائی لینڈ', cn:'چین', jp:'جاپان', kr:'جنوبی کوریا',
    fr:'فرانس', de:'جرمنی', gb:'برطانیہ', nl:'نیدرلینڈز', es:'سپین',
    it:'اٹلی', pt:'پرتگال', ru:'روس', us:'ریاستہائے متحدہ امریکہ', ca:'کینیڈا',
    mx:'میکسیکو', br:'برازیل', ar:'ارجنٹینا', au:'آسٹریلیا',
    ng:'نائجیریا', et:'ایتھوپیا', ke:'کینیا', za:'جنوبی افریقہ',
    mv:'مالدیپ', lk:'سری لنکا', np:'نیپال', mm:'میانمار', bt:'بھوٹان',
    dj:'جبوتی',
};
// ===== أسماء الدول بالتركية =====
const COUNTRY_NAMES_TR = {
    sa:'Suudi Arabistan', eg:'Mısır', sy:'Suriye', iq:'Irak', jo:'Ürdün', lb:'Lübnan',
    ae:'Birleşik Arap Emirlikleri', kw:'Kuveyt', qa:'Katar', bh:'Bahreyn', om:'Umman',
    ye:'Yemen', ps:'Filistin', ma:'Fas', dz:'Cezayir', tn:'Tunus',
    ly:'Libya', sd:'Sudan', mr:'Moritanya', so:'Somali', km:'Komorlar',
    pk:'Pakistan', in:'Hindistan', bd:'Bangladeş', af:'Afganistan', tr:'Türkiye',
    ir:'İran', id:'Endonezya', my:'Malezya', sg:'Singapur', bn:'Brunei',
    ph:'Filipinler', th:'Tayland', cn:'Çin', jp:'Japonya', kr:'Güney Kore',
    fr:'Fransa', de:'Almanya', gb:'Birleşik Krallık', nl:'Hollanda', es:'İspanya',
    it:'İtalya', pt:'Portekiz', ru:'Rusya', us:'Amerika Birleşik Devletleri', ca:'Kanada',
    mx:'Meksika', br:'Brezilya', ar:'Arjantin', au:'Avustralya',
    ng:'Nijerya', et:'Etiyopya', ke:'Kenya', za:'Güney Afrika',
    mv:'Maldivler', lk:'Sri Lanka', np:'Nepal', mm:'Myanmar', bt:'Butan',
    dj:'Cibuti',
};
// ===== أسماء الدول بالفرنسية =====
const COUNTRY_NAMES_FR = {
    sa:'Arabie saoudite', eg:'Égypte', sy:'Syrie', iq:'Irak', jo:'Jordanie', lb:'Liban',
    ae:'Émirats arabes unis', kw:'Koweït', qa:'Qatar', bh:'Bahreïn', om:'Oman',
    ye:'Yémen', ps:'Palestine', ma:'Maroc', dz:'Algérie', tn:'Tunisie',
    ly:'Libye', sd:'Soudan', mr:'Mauritanie', so:'Somalie', km:'Comores',
    pk:'Pakistan', in:'Inde', bd:'Bangladesh', af:'Afghanistan', tr:'Turquie',
    ir:'Iran', id:'Indonésie', my:'Malaisie', sg:'Singapour', bn:'Brunei',
    ph:'Philippines', th:'Thaïlande', cn:'Chine', jp:'Japon', kr:'Corée du Sud',
    fr:'France', de:'Allemagne', gb:'Royaume-Uni', nl:'Pays-Bas', es:'Espagne',
    it:'Italie', pt:'Portugal', ru:'Russie', us:'États-Unis', ca:'Canada',
    mx:'Mexique', br:'Brésil', ar:'Argentine', au:'Australie',
    ng:'Nigeria', et:'Éthiopie', ke:'Kenya', za:'Afrique du Sud',
    mv:'Maldives', lk:'Sri Lanka', np:'Népal', mm:'Birmanie', bt:'Bhoutan',
    dj:'Djibouti',
};
// ===== أسماء الدول بالألمانية =====
const COUNTRY_NAMES_DE = {
    sa:'Saudi-Arabien', eg:'Ägypten', sy:'Syrien', iq:'Irak', jo:'Jordanien', lb:'Libanon',
    ae:'Vereinigte Arabische Emirate', kw:'Kuwait', qa:'Katar', bh:'Bahrain', om:'Oman',
    ye:'Jemen', ps:'Palästina', ma:'Marokko', dz:'Algerien', tn:'Tunesien',
    ly:'Libyen', sd:'Sudan', mr:'Mauretanien', so:'Somalia', km:'Komoren',
    pk:'Pakistan', in:'Indien', bd:'Bangladesch', af:'Afghanistan', tr:'Türkei',
    ir:'Iran', id:'Indonesien', my:'Malaysia', sg:'Singapur', bn:'Brunei',
    ph:'Philippinen', th:'Thailand', cn:'China', jp:'Japan', kr:'Südkorea',
    fr:'Frankreich', de:'Deutschland', gb:'Vereinigtes Königreich', nl:'Niederlande', es:'Spanien',
    it:'Italien', pt:'Portugal', ru:'Russland', us:'Vereinigte Staaten', ca:'Kanada',
    mx:'Mexiko', br:'Brasilien', ar:'Argentinien', au:'Australien',
    ng:'Nigeria', et:'Äthiopien', ke:'Kenia', za:'Südafrika',
    mv:'Malediven', lk:'Sri Lanka', np:'Nepal', mm:'Myanmar', bt:'Bhutan',
    dj:'Dschibuti',
};
// ===== أسماء الدول بالإندونيسية =====
const COUNTRY_NAMES_ID = {
    sa:'Arab Saudi', eg:'Mesir', sy:'Suriah', iq:'Irak', jo:'Yordania', lb:'Lebanon',
    ae:'Uni Emirat Arab', kw:'Kuwait', qa:'Qatar', bh:'Bahrain', om:'Oman',
    ye:'Yaman', ps:'Palestina', ma:'Maroko', dz:'Aljazair', tn:'Tunisia',
    ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia', km:'Komoro',
    pk:'Pakistan', in:'India', bd:'Bangladesh', af:'Afganistan', tr:'Turki',
    ir:'Iran', id:'Indonesia', my:'Malaysia', sg:'Singapura', bn:'Brunei',
    ph:'Filipina', th:'Thailand', cn:'Tiongkok', jp:'Jepang', kr:'Korea Selatan',
    fr:'Prancis', de:'Jerman', gb:'Britania Raya', nl:'Belanda', es:'Spanyol',
    it:'Italia', pt:'Portugal', ru:'Rusia', us:'Amerika Serikat', ca:'Kanada',
    mx:'Meksiko', br:'Brasil', ar:'Argentina', au:'Australia',
    ng:'Nigeria', et:'Etiopia', ke:'Kenya', za:'Afrika Selatan',
    mv:'Maladewa', lk:'Sri Lanka', np:'Nepal', mm:'Myanmar', bt:'Bhutan',
    dj:'Djibouti',
};
const _LOCALIZED_COUNTRY_MAPS = {
    ur: COUNTRY_NAMES_UR, tr: COUNTRY_NAMES_TR, fr: COUNTRY_NAMES_FR,
    de: COUNTRY_NAMES_DE, id: COUNTRY_NAMES_ID,
    bn: COUNTRY_NAMES_BN, es: COUNTRY_NAMES_ES, ms: COUNTRY_NAMES_MS,
};
const _LOCALIZED_CITY_MAPS = {
    ur: CITY_NAMES_UR, tr: CITY_NAMES_TR, fr: CITY_NAMES_FR,
    de: CITY_NAMES_DE, id: CITY_NAMES_ID,
    bn: CITY_NAMES_BN, es: CITY_NAMES_ES, ms: CITY_NAMES_MS,
};

// ===== دوال مساعدة لعرض الأسماء حسب اللغة =====
// أولوية المدينة: Nominatim المترجَم (إن تَوفَّر وكان بخطّ متوافق) → قاموس محلي (مباشر لأسماء المدن الشائعة)
// → fallback إنجليزي. نفس المنطق لكل 8 لغات غير ar/en.
// _isDisplayScriptAcceptable: يتحقّق من أنّ currentLocalizedName بخطّ يمكن قراءته للغة الواجهة
//   (مثلاً يرفض "千代田区" في صفحة بالتركيّة → يسقط للقاموس أو الإنجليزيّة).
function _isDisplayScriptAcceptable(s, lang) {
    if (!s) return false;
    // CJK (ياباني/صينيّ/كوريّ/Halfwidth-Fullwidth)
    if (/[\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/.test(s)) return false;
    // خطوط أخرى غير مدعومة في لغات الواجهة (Cyrillic/Greek/Hebrew/Devanagari/Thai/Tamil/…)
    if (/[\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0700-\u074F\u0900-\u097F\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F]/.test(s)) return false;
    const hasArabic  = /[\u0600-\u06FF]/.test(s);
    const hasBengali = /[\u0980-\u09FF]/.test(s);
    const hasUrduSpecific = /[\u067E\u0686\u0698\u06A9\u06AF\u0688\u0691\u0679\u06BA\u06CC\u06D2\u06C1]/.test(s);
    if (lang === 'ar') return !hasBengali;
    if (lang === 'ur') { if (hasArabic && !hasUrduSpecific) return false; return !hasBengali; }
    if (lang === 'bn') return !hasArabic;
    // EN/FR/TR/DE/ID/ES/MS: لاتينيّ بحت — ارفض العربيّ والبنغاليّة
    return !hasArabic && !hasBengali;
}
function getDisplayCity() {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    if (lang === 'ar') return currentCity;
    if (lang === 'en') return currentEnglishDisplayName || currentEnglishName || currentCity;
    // Nominatim أعاد اسماً مترجَماً حقيقياً (ليس endonym إنجليزي) وبخطّ متوافق → استخدمه
    if (currentLocalizedName
        && currentLocalizedName !== currentEnglishName
        && currentLocalizedName !== currentEnglishDisplayName
        && _isDisplayScriptAcceptable(currentLocalizedName, lang)) {
        return currentLocalizedName;
    }
    // قاموس محلي (متوفّر للغات 8 كلّها: ur/tr/fr/de/id/bn/es/ms)
    const cityMap = _LOCALIZED_CITY_MAPS[lang];
    if (cityMap) {
        const key = currentEnglishName || currentEnglishDisplayName || '';
        if (cityMap[key]) return cityMap[key];
    }
    // fallback إنجليزي نهائي
    return currentEnglishDisplayName || currentEnglishName || currentCity;
}
// أولوية الدولة: قاموس محلي (ثابت وموثوق) → Nominatim → fallback إنجليزي.
// القاموس أولاً لأنّ أسماء الدول مستقرّة ونادراً ما تتغيّر — أسرع وأوثق من Nominatim.
function getDisplayCountry() {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    if (lang === 'ar') return currentCountry;
    if (lang === 'en') return currentEnglishCountry || COUNTRY_EN_NAMES[currentCountryCode] || currentCountry;
    const ctryMap = _LOCALIZED_COUNTRY_MAPS[lang];
    if (ctryMap && ctryMap[currentCountryCode]) return ctryMap[currentCountryCode];
    if (currentLocalizedCountry && currentLocalizedCountry !== currentEnglishCountry) {
        return currentLocalizedCountry;
    }
    return currentEnglishCountry || COUNTRY_EN_NAMES[currentCountryCode] || currentCountry;
}
let currentTimezone = 3; // UTC+3 للسعودية افتراضياً
let currentPrayerTimes = null;
let calendarYear, calendarMonth;
let countdownInterval;
let searchDebounceTimer = null;
let searchFocusedIndex = -1;
let lastAzanPrayer = null;     // آخر صلاة شُغِّل لها الأذان (لمنع التكرار)
let _lastNextKey = null;       // 🆕 Round 3.1: تتبّع آخر next.key لاكتشاف انتقال حدّ الصلاة

// 🆕 Round 11: HIJRI_MONTH_SLUGS removed — URLs are now numeric zero-padded (e.g. 1447-11 / 1447-11-05).
const HIJRI_MONTHS_EN = [
    'Muharram','Safar','Rabi al-Awwal','Rabi al-Thani',
    'Jumada al-Awwal','Jumada al-Thani','Rajab','Shaban',
    'Ramadan','Shawwal','Dhu al-Qidah','Dhu al-Hijjah'
];
const DAY_NAMES_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const G_MONTHS_AR  = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const G_MONTHS_EN  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ========= تسميات الأشهر الهجرية حسب اللغة (10 لغات) =========
const HIJRI_MONTHS_BY_LANG = {
    ar: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
    en: HIJRI_MONTHS_EN,
    fr: ['Mouharram','Safar','Rabi al-Awwal','Rabi al-Thani','Joumada al-Oula','Joumada al-Thania','Rajab','Chaabane','Ramadan','Chawwal','Dhou al-Qida','Dhou al-Hijja'],
    tr: ['Muharrem','Safer','Rebiülevvel','Rebiülahir','Cemaziyelevvel','Cemaziyelahir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'],
    ur: ['محرّم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذوالقعدہ','ذوالحجہ'],
    de: ['Muharram','Safar','Rabīʿ al-awwal','Rabīʿ ath-thānī','Dschumādā l-ūlā','Dschumādā th-thāniya','Radschab','Schaʿbān','Ramadan','Schawwāl','Dhū l-qaʿda','Dhū l-hidscha'],
    id: ['Muharram','Safar','Rabiul Awal','Rabiul Akhir','Jumadil Awal','Jumadil Akhir','Rajab','Syaban','Ramadan','Syawal','Zulkaidah','Zulhijah'],
    es: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Yumada al-Awwal','Yumada al-Thani','Rayab','Shaabán','Ramadán','Shawwal','Du al-Qida','Du al-Hiyya'],
    bn: ['মুহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'],
    ms: ['Muharam','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah']
};

// خرائط locale للمتصفّح (لـ Intl.DateTimeFormat)
const _INTL_LOCALES = { ar: 'ar', en: 'en-US', fr: 'fr-FR', tr: 'tr-TR', ur: 'ur-PK', de: 'de-DE', id: 'id-ID', es: 'es-ES', bn: 'bn-BD', ms: 'ms-MY' };

function hijriMonthsFor(lang) {
    return HIJRI_MONTHS_BY_LANG[lang] || HIJRI_MONTHS_EN;
}
function gregMonthFor(lang, monthIdx) {
    if (lang === 'ar') return G_MONTHS_AR[monthIdx];
    if (lang === 'en') return G_MONTHS_EN[monthIdx];
    try {
        return new Intl.DateTimeFormat(_INTL_LOCALES[lang] || lang, { month: 'long' })
            .format(new Date(2000, monthIdx, 1));
    } catch(_) { return G_MONTHS_EN[monthIdx]; }
}
function dayNameFor(lang, dow) {
    if (lang === 'ar') return ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][dow];
    if (lang === 'en') return DAY_NAMES_EN[dow];
    try {
        // Jan 2 2000 was Sunday (dow=0)
        return new Intl.DateTimeFormat(_INTL_LOCALES[lang] || lang, { weekday: 'long' })
            .format(new Date(2000, 0, 2 + dow));
    } catch(_) { return DAY_NAMES_EN[dow]; }
}
// اللاحقة الهجرية والميلادية حسب اللغة
const HSFX_BY_LANG = { ar: ' هـ', en: ' AH', fr: ' H', tr: ' H', ur: ' ہجری', de: ' AH', id: ' H', es: ' H', bn: ' হিজরি', ms: ' H' };
const GSFX_BY_LANG = { ar: ' م', en: ' CE', fr: ' EC', tr: '', ur: ' عیسوی', de: ' n.Chr.', id: ' M', es: ' d.C.', bn: ' খ্রিস্টাব্দ', ms: ' M' };
function hSfxFor(lang)  { return HSFX_BY_LANG[lang]  || ' AH'; }
function gSfxFor(lang)  { return GSFX_BY_LANG[lang]  || ''; }

// ========= تسميات واجهة صفحة اليوم الهجري (/hijri-date/...) لكلّ لغة =========
const _HDAY_UI = {
    ar: { home:'الرئيسية', cal:'التقويم الهجري', prev:'اليوم السابق', next:'اليوم التالي',
          leap_yes:'نعم ✓', leap_no:'لا ✗', leap_text:(y)=>y?'كبيسة':'بسيطة',
          cards:['📅 اليوم','🗓 التاريخ الهجري','📆 التاريخ الميلادي','🌙 الشهر','📊 عدد أيام الشهر','✔️ السنة'],
          days_word:'يوم', site:'مواقيت الصلاة والتقويم الهجري',
          link_convert:'🔄 تحويل التاريخ هجري ميلادي', link_today:'📌 التاريخ الهجري اليوم',
          link_cal: c => `📅 التقويم الهجري لشهر ${c.monthName} ${c.year}`,
          title:   c => `التاريخ الهجري اليوم: ${c.dayName} ${c.hDate}`,
          subtitle:c => `الموافق: ${c.dayName} ${c.gDate} – حسب تقويم أم القرى`,
          intro:   c => `يعرض هذا اليوم التاريخ الهجري الموافق ${c.hDate} مع التاريخ الميلادي المقابل حسب تقويم أم القرى في ${c.country}، بالإضافة إلى معلومات اليوم والأحداث التاريخية.`,
          otd:     c => `في مثل هذا اليوم، ${c.dayName} ${c.hDate}، وقعت العديد من الأحداث المهمة في التاريخ الإسلامي.`,
          footer:  c => `التقويم الهجري يعتمد على دورة القمر، ويستخدم في تحديد المناسبات الإسلامية مثل رمضان والحج. يوافق التاريخ ${c.hDate} في التقويم الميلادي ${c.gDate}، حسب تقويم أم القرى المعتمد في ${c.countryLabel}. يمكنك استخدام أداة تحويل التاريخ للتحويل بين التاريخ الهجري والميلادي، أو تصفح التقويم الهجري لمعرفة التاريخ الهجري اليوم.`,
          headline:c => `${c.hDate} (${c.dayName}) — التاريخ الهجري والميلادي`,
          desc:    c => `يعرض هذا اليوم التاريخ الهجري الموافق ${c.hDate} مع التاريخ الميلادي المقابل حسب تقويم أم القرى في ${c.country}.`,
          faq:     c => [
              [`ما هو التاريخ الهجري لهذا اليوم؟`, c.hDate],
              [`ماذا يوافق ${c.hDate} ميلادي؟`, c.gDate],
              [`هل سنة ${c.year}${c.hSfx} سنة كبيسة؟`, c.isLeap?`نعم، سنة ${c.year}${c.hSfx} سنة كبيسة (355 يوماً).`:`لا، سنة ${c.year}${c.hSfx} سنة بسيطة (354 يوماً).`],
              [`كم يوافق ${c.hDate} بالميلادي في ${c.country}؟`, c.gDate],
              [`ما هو التاريخ الهجري اليوم في ${c.country}؟`, c.todayH],
          ] },
    en: { home:'Home', cal:'Hijri Calendar', prev:'Previous Day', next:'Next Day',
          leap_yes:'Yes ✓', leap_no:'No ✗', leap_text:(y)=>y?'Yes':'No',
          cards:['📅 Day','🗓 Hijri Date','📆 Gregorian Date','🌙 Month','📊 Days in Month','✔️ Leap Year'],
          days_word:'days', site:'Prayer Times & Hijri Calendar',
          link_convert:'🔄 Convert Hijri ↔ Gregorian', link_today:"📌 Today's Hijri Date",
          link_cal: c => `📅 Hijri Calendar: ${c.monthName} ${c.year} AH`,
          title:   c => `Hijri Date: ${c.dayName}, ${c.hDate}`,
          subtitle:c => `Corresponding to: ${c.dayName}, ${c.gDate} – according to the Umm al-Qura calendar`,
          intro:   c => `This page shows the Hijri date ${c.hDate} with the corresponding Gregorian date, historical events of this day, and the ability to easily convert dates.`,
          otd:     c => `On this day, ${c.dayName} ${c.hDate}, many important events occurred in Islamic history.`,
          footer:  c => `The Hijri calendar is based on the lunar cycle and is used to determine Islamic occasions such as Ramadan and Hajj. The date ${c.hDate} corresponds to ${c.gDate}, according to the Umm al-Qura calendar used in ${c.countryLabel}. Use our date converter to easily convert between Hijri and Gregorian calendars, or browse the Hijri calendar to see today's Hijri date.`,
          headline:c => `${c.hDate} (${c.dayName}) — Hijri & Gregorian`,
          desc:    c => `This page shows the Hijri date ${c.hDate} with its corresponding Gregorian date according to the Umm al-Qura calendar in ${c.country}.`,
          faq:     c => [
              [`What is the Hijri date for this day?`, c.hDate],
              [`What Gregorian date corresponds to ${c.hDate}?`, c.gDate],
              [`Is ${c.year} AH a leap year?`, c.isLeap?`Yes, ${c.year} AH is a leap year (355 days).`:`No, ${c.year} AH is a regular year (354 days).`],
              [`What does ${c.hDate} correspond to in Gregorian in ${c.country}?`, c.gDate],
              [`What is today's Hijri date in ${c.country}?`, c.todayH],
          ] },
    fr: { home:'Accueil', cal:'Calendrier hégirien', prev:'Jour précédent', next:'Jour suivant',
          leap_yes:'Oui ✓', leap_no:'Non ✗', leap_text:(y)=>y?'Oui':'Non',
          cards:['📅 Jour','🗓 Date hégirienne','📆 Date grégorienne','🌙 Mois','📊 Jours dans le mois','✔️ Année bissextile'],
          days_word:'jours', site:'Heures de prière & Calendrier hégirien',
          link_convert:'🔄 Convertir Hégire ↔ Grégorien', link_today:"📌 Date hégirienne d'aujourd'hui",
          link_cal: c => `📅 Calendrier hégirien : ${c.monthName} ${c.year} H`,
          title:   c => `Date hégirienne : ${c.dayName}, ${c.hDate}`,
          subtitle:c => `Correspond à : ${c.dayName}, ${c.gDate} – selon le calendrier Umm al-Qura`,
          intro:   c => `Cette page affiche la date hégirienne ${c.hDate} avec la date grégorienne correspondante, les événements historiques de ce jour et la possibilité de convertir les dates facilement.`,
          otd:     c => `Ce jour-là, ${c.dayName} ${c.hDate}, de nombreux événements importants ont eu lieu dans l'histoire islamique.`,
          footer:  c => `Le calendrier hégirien est basé sur le cycle lunaire et sert à déterminer les occasions islamiques telles que le Ramadan et le Hajj. La date ${c.hDate} correspond à ${c.gDate}, selon le calendrier Umm al-Qura utilisé en ${c.countryLabel}. Utilisez notre convertisseur pour passer facilement entre les calendriers hégirien et grégorien, ou parcourez le calendrier hégirien pour voir la date du jour.`,
          headline:c => `${c.hDate} (${c.dayName}) — Hégire et grégorien`,
          desc:    c => `Cette page affiche la date hégirienne ${c.hDate} avec sa date grégorienne correspondante selon le calendrier Umm al-Qura à ${c.country}.`,
          faq:     c => [
              [`Quelle est la date hégirienne de ce jour ?`, c.hDate],
              [`Quelle date grégorienne correspond à ${c.hDate} ?`, c.gDate],
              [`${c.year} H est-elle une année bissextile ?`, c.isLeap?`Oui, ${c.year} H est une année bissextile (355 jours).`:`Non, ${c.year} H est une année ordinaire (354 jours).`],
              [`À quelle date grégorienne correspond ${c.hDate} à ${c.country} ?`, c.gDate],
              [`Quelle est la date hégirienne d'aujourd'hui à ${c.country} ?`, c.todayH],
          ] },
    tr: { home:'Anasayfa', cal:'Hicri Takvim', prev:'Önceki Gün', next:'Sonraki Gün',
          leap_yes:'Evet ✓', leap_no:'Hayır ✗', leap_text:(y)=>y?'Evet':'Hayır',
          cards:['📅 Gün','🗓 Hicri Tarih','📆 Miladi Tarih','🌙 Ay','📊 Ay Günleri','✔️ Artık Yıl'],
          days_word:'gün', site:'Namaz Vakitleri ve Hicri Takvim',
          link_convert:'🔄 Hicri ↔ Miladi Çevir', link_today:'📌 Bugünün Hicri Tarihi',
          link_cal: c => `📅 Hicri Takvim: ${c.monthName} ${c.year} H`,
          title:   c => `Hicri Tarih: ${c.dayName}, ${c.hDate}`,
          subtitle:c => `Karşılığı: ${c.dayName}, ${c.gDate} – Ümmülkura takvimine göre`,
          intro:   c => `Bu sayfa ${c.hDate} hicri tarihini, karşılığı olan miladi tarihi, bu günün tarihi olaylarını ve kolay tarih dönüştürme imkânını gösterir.`,
          otd:     c => `Bu günde, ${c.dayName} ${c.hDate}, İslam tarihinde birçok önemli olay yaşanmıştır.`,
          footer:  c => `Hicri takvim ay döngüsüne dayanır ve Ramazan, Hac gibi İslami olayları belirlemek için kullanılır. ${c.hDate} tarihi, ${c.countryLabel} ülkesinde kullanılan Ümmülkura takvimine göre ${c.gDate} tarihine denk gelir. Hicri ve miladi takvimler arasında kolayca dönüşüm yapmak için tarih dönüştürücümüzü kullanın veya bugünün hicri tarihini görmek için hicri takvime göz atın.`,
          headline:c => `${c.hDate} (${c.dayName}) — Hicri ve Miladi`,
          desc:    c => `Bu sayfa ${c.hDate} hicri tarihini, ${c.country} ülkesinde Ümmülkura takvimine göre karşılığı olan miladi tarih ile birlikte gösterir.`,
          faq:     c => [
              [`Bu günün hicri tarihi nedir?`, c.hDate],
              [`${c.hDate} hangi miladi tarihe karşılık gelir?`, c.gDate],
              [`${c.year} H artık yıl mı?`, c.isLeap?`Evet, ${c.year} H artık yıldır (355 gün).`:`Hayır, ${c.year} H normal yıldır (354 gün).`],
              [`${c.hDate}, ${c.country} ülkesinde hangi miladi tarihe denk gelir?`, c.gDate],
              [`${c.country} ülkesinde bugünün hicri tarihi nedir?`, c.todayH],
          ] },
    ur: { home:'ہوم', cal:'ہجری کیلنڈر', prev:'پچھلا دن', next:'اگلا دن',
          leap_yes:'ہاں ✓', leap_no:'نہیں ✗', leap_text:(y)=>y?'ہاں':'نہیں',
          cards:['📅 دن','🗓 ہجری تاریخ','📆 عیسوی تاریخ','🌙 مہینہ','📊 مہینے کے ایام','✔️ لیپ سال'],
          days_word:'دن', site:'اوقاتِ نماز اور ہجری کیلنڈر',
          link_convert:'🔄 ہجری ↔ عیسوی تبدیل کریں', link_today:'📌 آج کی ہجری تاریخ',
          link_cal: c => `📅 ہجری کیلنڈر: ${c.monthName} ${c.year} ہجری`,
          title:   c => `ہجری تاریخ: ${c.dayName}، ${c.hDate}`,
          subtitle:c => `موافق: ${c.dayName}، ${c.gDate} – ام القری کیلنڈر کے مطابق`,
          intro:   c => `یہ صفحہ ہجری تاریخ ${c.hDate} اور اس کے موافق عیسوی تاریخ، اس دن کے تاریخی واقعات، اور آسانی سے تاریخ تبدیل کرنے کی سہولت فراہم کرتا ہے۔`,
          otd:     c => `اس دن، ${c.dayName} ${c.hDate}، اسلامی تاریخ میں کئی اہم واقعات پیش آئے۔`,
          footer:  c => `ہجری کیلنڈر چاند کی گردش پر مبنی ہے اور اسے رمضان اور حج جیسے اسلامی مواقع کا تعین کرنے کے لیے استعمال کیا جاتا ہے۔ ${c.hDate}، ${c.countryLabel} میں رائج ام القری کیلنڈر کے مطابق ${c.gDate} کے موافق ہے۔ ہجری اور عیسوی کیلنڈر کے درمیان آسانی سے تبدیلی کے لیے ہمارا تاریخ کنورٹر استعمال کریں، یا آج کی ہجری تاریخ دیکھنے کے لیے ہجری کیلنڈر دیکھیں۔`,
          headline:c => `${c.hDate} (${c.dayName}) — ہجری اور عیسوی`,
          desc:    c => `یہ صفحہ ہجری تاریخ ${c.hDate} اور اس کے موافق عیسوی تاریخ ${c.country} میں ام القری کیلنڈر کے مطابق دکھاتا ہے۔`,
          faq:     c => [
              [`اس دن کی ہجری تاریخ کیا ہے؟`, c.hDate],
              [`${c.hDate} کس عیسوی تاریخ کے موافق ہے؟`, c.gDate],
              [`کیا ${c.year} ہجری لیپ سال ہے؟`, c.isLeap?`ہاں، ${c.year} ہجری لیپ سال ہے (355 دن)۔`:`نہیں، ${c.year} ہجری عام سال ہے (354 دن)۔`],
              [`${c.country} میں ${c.hDate} کس عیسوی تاریخ کے موافق ہے؟`, c.gDate],
              [`${c.country} میں آج کی ہجری تاریخ کیا ہے؟`, c.todayH],
          ] },
    de: { home:'Startseite', cal:'Hidschri-Kalender', prev:'Vorheriger Tag', next:'Nächster Tag',
          leap_yes:'Ja ✓', leap_no:'Nein ✗', leap_text:(y)=>y?'Ja':'Nein',
          cards:['📅 Tag','🗓 Hidschri-Datum','📆 Gregorianisches Datum','🌙 Monat','📊 Tage im Monat','✔️ Schaltjahr'],
          days_word:'Tage', site:'Gebetszeiten & Hidschri-Kalender',
          link_convert:'🔄 Hidschri ↔ Gregorianisch umrechnen', link_today:'📌 Heutiges Hidschri-Datum',
          link_cal: c => `📅 Hidschri-Kalender: ${c.monthName} ${c.year} AH`,
          title:   c => `Hidschri-Datum: ${c.dayName}, ${c.hDate}`,
          subtitle:c => `Entspricht: ${c.dayName}, ${c.gDate} – gemäß dem Umm-al-Qura-Kalender`,
          intro:   c => `Diese Seite zeigt das Hidschri-Datum ${c.hDate} mit dem entsprechenden gregorianischen Datum, historischen Ereignissen dieses Tages und der Möglichkeit, Daten einfach umzurechnen.`,
          otd:     c => `An diesem Tag, ${c.dayName} ${c.hDate}, ereigneten sich viele bedeutende Ereignisse der islamischen Geschichte.`,
          footer:  c => `Der Hidschri-Kalender basiert auf dem Mondzyklus und dient der Bestimmung islamischer Anlässe wie Ramadan und Hadsch. Das Datum ${c.hDate} entspricht gemäß dem in ${c.countryLabel} verwendeten Umm-al-Qura-Kalender dem ${c.gDate}. Verwenden Sie unseren Datumsumrechner, um einfach zwischen Hidschri- und gregorianischem Kalender umzurechnen, oder durchsuchen Sie den Hidschri-Kalender, um das heutige Hidschri-Datum zu sehen.`,
          headline:c => `${c.hDate} (${c.dayName}) — Hidschri & Gregorianisch`,
          desc:    c => `Diese Seite zeigt das Hidschri-Datum ${c.hDate} mit seinem entsprechenden gregorianischen Datum gemäß dem Umm-al-Qura-Kalender in ${c.country}.`,
          faq:     c => [
              [`Welches ist das Hidschri-Datum dieses Tages?`, c.hDate],
              [`Welchem gregorianischen Datum entspricht ${c.hDate}?`, c.gDate],
              [`Ist ${c.year} AH ein Schaltjahr?`, c.isLeap?`Ja, ${c.year} AH ist ein Schaltjahr (355 Tage).`:`Nein, ${c.year} AH ist ein normales Jahr (354 Tage).`],
              [`Welchem gregorianischen Datum in ${c.country} entspricht ${c.hDate}?`, c.gDate],
              [`Welches ist das heutige Hidschri-Datum in ${c.country}?`, c.todayH],
          ] },
    id: { home:'Beranda', cal:'Kalender Hijriah', prev:'Hari Sebelumnya', next:'Hari Berikutnya',
          leap_yes:'Ya ✓', leap_no:'Tidak ✗', leap_text:(y)=>y?'Ya':'Tidak',
          cards:['📅 Hari','🗓 Tanggal Hijriah','📆 Tanggal Masehi','🌙 Bulan','📊 Jumlah Hari','✔️ Tahun Kabisat'],
          days_word:'hari', site:'Jadwal Sholat & Kalender Hijriah',
          link_convert:'🔄 Konversi Hijriah ↔ Masehi', link_today:'📌 Tanggal Hijriah Hari Ini',
          link_cal: c => `📅 Kalender Hijriah: ${c.monthName} ${c.year} H`,
          title:   c => `Tanggal Hijriah: ${c.dayName}, ${c.hDate}`,
          subtitle:c => `Bertepatan dengan: ${c.dayName}, ${c.gDate} – menurut kalender Umm al-Qura`,
          intro:   c => `Halaman ini menampilkan tanggal Hijriah ${c.hDate} dengan tanggal Masehi yang bertepatan, peristiwa sejarah hari ini, dan kemudahan konversi tanggal.`,
          otd:     c => `Pada hari ini, ${c.dayName} ${c.hDate}, banyak peristiwa penting terjadi dalam sejarah Islam.`,
          footer:  c => `Kalender Hijriah didasarkan pada siklus bulan dan digunakan untuk menentukan peristiwa Islam seperti Ramadan dan Haji. Tanggal ${c.hDate} bertepatan dengan ${c.gDate}, menurut kalender Umm al-Qura yang digunakan di ${c.countryLabel}. Gunakan konverter tanggal kami untuk dengan mudah mengonversi antara kalender Hijriah dan Masehi, atau jelajahi kalender Hijriah untuk melihat tanggal Hijriah hari ini.`,
          headline:c => `${c.hDate} (${c.dayName}) — Hijriah & Masehi`,
          desc:    c => `Halaman ini menampilkan tanggal Hijriah ${c.hDate} dengan tanggal Masehi yang bertepatan menurut kalender Umm al-Qura di ${c.country}.`,
          faq:     c => [
              [`Apa tanggal Hijriah hari ini?`, c.hDate],
              [`Tanggal Masehi apa yang bertepatan dengan ${c.hDate}?`, c.gDate],
              [`Apakah ${c.year} H tahun kabisat?`, c.isLeap?`Ya, ${c.year} H adalah tahun kabisat (355 hari).`:`Tidak, ${c.year} H adalah tahun biasa (354 hari).`],
              [`${c.hDate} bertepatan dengan tanggal Masehi apa di ${c.country}?`, c.gDate],
              [`Apa tanggal Hijriah hari ini di ${c.country}?`, c.todayH],
          ] },
    es: { home:'Inicio', cal:'Calendario Hégira', prev:'Día anterior', next:'Día siguiente',
          leap_yes:'Sí ✓', leap_no:'No ✗', leap_text:(y)=>y?'Sí':'No',
          cards:['📅 Día','🗓 Fecha Hégira','📆 Fecha Gregoriana','🌙 Mes','📊 Días del mes','✔️ Año bisiesto'],
          days_word:'días', site:'Horarios de Oración y Calendario Hégira',
          link_convert:'🔄 Convertir Hégira ↔ Gregoriano', link_today:'📌 Fecha Hégira de hoy',
          link_cal: c => `📅 Calendario Hégira: ${c.monthName} ${c.year} H`,
          title:   c => `Fecha Hégira: ${c.dayName}, ${c.hDate}`,
          subtitle:c => `Corresponde a: ${c.dayName}, ${c.gDate} – según el calendario Umm al-Qura`,
          intro:   c => `Esta página muestra la fecha Hégira ${c.hDate} con la fecha gregoriana correspondiente, eventos históricos de este día y la posibilidad de convertir fechas fácilmente.`,
          otd:     c => `En este día, ${c.dayName} ${c.hDate}, ocurrieron muchos eventos importantes en la historia islámica.`,
          footer:  c => `El calendario Hégira se basa en el ciclo lunar y se utiliza para determinar ocasiones islámicas como el Ramadán y el Hajj. La fecha ${c.hDate} corresponde a ${c.gDate}, según el calendario Umm al-Qura utilizado en ${c.countryLabel}. Use nuestro convertidor de fechas para convertir fácilmente entre los calendarios Hégira y gregoriano, o explore el calendario Hégira para ver la fecha Hégira de hoy.`,
          headline:c => `${c.hDate} (${c.dayName}) — Hégira y Gregoriano`,
          desc:    c => `Esta página muestra la fecha Hégira ${c.hDate} con su fecha gregoriana correspondiente según el calendario Umm al-Qura en ${c.country}.`,
          faq:     c => [
              [`¿Cuál es la fecha Hégira para este día?`, c.hDate],
              [`¿Qué fecha gregoriana corresponde a ${c.hDate}?`, c.gDate],
              [`¿Es ${c.year} H un año bisiesto?`, c.isLeap?`Sí, ${c.year} H es un año bisiesto (355 días).`:`No, ${c.year} H es un año regular (354 días).`],
              [`¿Qué fecha gregoriana corresponde a ${c.hDate} en ${c.country}?`, c.gDate],
              [`¿Cuál es la fecha Hégira de hoy en ${c.country}?`, c.todayH],
          ] },
    bn: { home:'হোম', cal:'হিজরি ক্যালেন্ডার', prev:'পূর্ববর্তী দিন', next:'পরবর্তী দিন',
          leap_yes:'হ্যাঁ ✓', leap_no:'না ✗', leap_text:(y)=>y?'হ্যাঁ':'না',
          cards:['📅 দিন','🗓 হিজরি তারিখ','📆 খ্রিস্টীয় তারিখ','🌙 মাস','📊 মাসের দিন সংখ্যা','✔️ অধিবর্ষ'],
          days_word:'দিন', site:'নামাজের সময় ও হিজরি ক্যালেন্ডার',
          link_convert:'🔄 হিজরি ↔ খ্রিস্টীয় রূপান্তর', link_today:'📌 আজকের হিজরি তারিখ',
          link_cal: c => `📅 হিজরি ক্যালেন্ডার: ${c.monthName} ${c.year} হিজরি`,
          title:   c => `হিজরি তারিখ: ${c.dayName}, ${c.hDate}`,
          subtitle:c => `সমতুল্য: ${c.dayName}, ${c.gDate} – উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী`,
          intro:   c => `এই পৃষ্ঠাটি ${c.hDate} হিজরি তারিখ এবং এর সংশ্লিষ্ট খ্রিস্টীয় তারিখ, এই দিনের ঐতিহাসিক ঘটনা এবং সহজে তারিখ রূপান্তরের সুবিধা প্রদর্শন করে।`,
          otd:     c => `এই দিনে, ${c.dayName} ${c.hDate}, ইসলামিক ইতিহাসে অনেক গুরুত্বপূর্ণ ঘটনা ঘটেছিল।`,
          footer:  c => `হিজরি ক্যালেন্ডার চন্দ্রচক্রের উপর ভিত্তি করে এবং রমজান ও হজের মতো ইসলামিক অনুষ্ঠান নির্ধারণ করতে ব্যবহৃত হয়। ${c.hDate} তারিখটি ${c.countryLabel}-এ ব্যবহৃত উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী ${c.gDate}-এর সমতুল্য। হিজরি ও খ্রিস্টীয় ক্যালেন্ডারের মধ্যে সহজে রূপান্তর করতে আমাদের তারিখ কনভার্টার ব্যবহার করুন, অথবা আজকের হিজরি তারিখ দেখতে হিজরি ক্যালেন্ডার ব্রাউজ করুন।`,
          headline:c => `${c.hDate} (${c.dayName}) — হিজরি ও খ্রিস্টীয়`,
          desc:    c => `এই পৃষ্ঠাটি ${c.hDate} হিজরি তারিখ এবং ${c.country}-এ উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী এর সংশ্লিষ্ট খ্রিস্টীয় তারিখ প্রদর্শন করে।`,
          faq:     c => [
              [`এই দিনের হিজরি তারিখ কী?`, c.hDate],
              [`${c.hDate} কোন খ্রিস্টীয় তারিখের সমতুল্য?`, c.gDate],
              [`${c.year} হিজরি কি অধিবর্ষ?`, c.isLeap?`হ্যাঁ, ${c.year} হিজরি একটি অধিবর্ষ (355 দিন)।`:`না, ${c.year} হিজরি একটি সাধারণ বছর (354 দিন)।`],
              [`${c.country}-এ ${c.hDate} কোন খ্রিস্টীয় তারিখের সমতুল্য?`, c.gDate],
              [`${c.country}-এ আজকের হিজরি তারিখ কী?`, c.todayH],
          ] },
    ms: { home:'Laman Utama', cal:'Kalendar Hijrah', prev:'Hari Sebelumnya', next:'Hari Berikutnya',
          leap_yes:'Ya ✓', leap_no:'Tidak ✗', leap_text:(y)=>y?'Ya':'Tidak',
          cards:['📅 Hari','🗓 Tarikh Hijrah','📆 Tarikh Masihi','🌙 Bulan','📊 Hari dalam Bulan','✔️ Tahun Lompat'],
          days_word:'hari', site:'Waktu Solat & Kalendar Hijrah',
          link_convert:'🔄 Tukar Hijrah ↔ Masihi', link_today:'📌 Tarikh Hijrah Hari Ini',
          link_cal: c => `📅 Kalendar Hijrah: ${c.monthName} ${c.year} H`,
          title:   c => `Tarikh Hijrah: ${c.dayName}, ${c.hDate}`,
          subtitle:c => `Bersamaan dengan: ${c.dayName}, ${c.gDate} – mengikut kalendar Umm al-Qura`,
          intro:   c => `Halaman ini memaparkan tarikh Hijrah ${c.hDate} bersama tarikh Masihi yang bersamaan, peristiwa sejarah pada hari ini, dan kemudahan menukar tarikh.`,
          otd:     c => `Pada hari ini, ${c.dayName} ${c.hDate}, banyak peristiwa penting berlaku dalam sejarah Islam.`,
          footer:  c => `Kalendar Hijrah berdasarkan kitaran bulan dan digunakan untuk menentukan peristiwa Islam seperti Ramadan dan Haji. Tarikh ${c.hDate} bersamaan dengan ${c.gDate}, mengikut kalendar Umm al-Qura yang digunakan di ${c.countryLabel}. Gunakan penukar tarikh kami untuk menukar dengan mudah antara kalendar Hijrah dan Masihi, atau layari kalendar Hijrah untuk melihat tarikh Hijrah hari ini.`,
          headline:c => `${c.hDate} (${c.dayName}) — Hijrah & Masihi`,
          desc:    c => `Halaman ini memaparkan tarikh Hijrah ${c.hDate} dengan tarikh Masihi yang bersamaan mengikut kalendar Umm al-Qura di ${c.country}.`,
          faq:     c => [
              [`Apakah tarikh Hijrah bagi hari ini?`, c.hDate],
              [`Tarikh Masihi apakah yang bersamaan dengan ${c.hDate}?`, c.gDate],
              [`Adakah ${c.year} H tahun lompat?`, c.isLeap?`Ya, ${c.year} H adalah tahun lompat (355 hari).`:`Tidak, ${c.year} H adalah tahun biasa (354 hari).`],
              [`${c.hDate} bersamaan dengan tarikh Masihi apa di ${c.country}?`, c.gDate],
              [`Apakah tarikh Hijrah hari ini di ${c.country}?`, c.todayH],
          ] }
};
function hdayUi(lang) { return _HDAY_UI[lang] || _HDAY_UI.en; }

// 🆕 Answer-Page extras: CTA + related + faq title (strings only — no intro/otd)
// ⚡ Anchor variation: CTA text ≠ Related text (SEO best practice)
const _HDAY_EXTRA = {
    ar: { faqTitle:'❓ أسئلة عن اليوم الهجري', relatedTitle:'🌙 روابط ذات صلة',
          ctaConv:'🔄 تحويل التاريخ', ctaMoon:'🌙 حالة القمر اليوم', ctaPrayer:'🕌 مواقيت الصلاة اليوم',
          relMonth:(m,y)=>`🌙 شهر ${m} ${y} هـ`, relYear:(y)=>`📆 تقويم سنة ${y} هـ`,
          relConv:'🔄 أداة تحويل التاريخ الهجري والميلادي', relMoon:'🌙 مراحل القمر اليوم', relPrayer:'🕌 أوقات الصلاة الخمس',
          footerLink:(m,y)=>`التقويم الهجري لشهر ${m} ${y} هـ` },
    en: { faqTitle:'❓ Frequently Asked Questions', relatedTitle:'🌙 Related Links',
          ctaConv:'🔄 Date Converter', ctaMoon:"🌙 Moon Today", ctaPrayer:'🕌 Prayer Times Today',
          relMonth:(m,y)=>`🌙 ${m} ${y} Calendar`, relYear:(y)=>`📆 ${y} AH Full Year`,
          relConv:'🔄 Hijri-Gregorian Conversion Tool', relMoon:'🌙 Current Moon Phase', relPrayer:'🕌 Five Daily Prayer Times',
          footerLink:(m,y)=>`full ${m} ${y} Hijri calendar` },
    fr: { faqTitle:'❓ Questions fréquentes', relatedTitle:'🌙 Liens connexes',
          ctaConv:'🔄 Convertisseur de dates', ctaMoon:'🌙 Lune aujourd’hui', ctaPrayer:'🕌 Heures de prière',
          relMonth:(m,y)=>`🌙 Mois de ${m} ${y} H`, relYear:(y)=>`📆 Année complète ${y} H`,
          relConv:'🔄 Outil de conversion hégire ↔ grégorien', relMoon:'🌙 Phase lunaire actuelle', relPrayer:'🕌 Les cinq prières quotidiennes',
          footerLink:(m,y)=>`calendrier hégirien complet de ${m} ${y} H` },
    tr: { faqTitle:'❓ Sıkça Sorulan Sorular', relatedTitle:'🌙 İlgili Bağlantılar',
          ctaConv:'🔄 Tarih Dönüştürücü', ctaMoon:'🌙 Bugünkü Ay', ctaPrayer:'🕌 Bugünün Namaz Vakitleri',
          relMonth:(m,y)=>`🌙 ${m} ${y} H Ayı`, relYear:(y)=>`📆 ${y} H Tam Yıl`,
          relConv:'🔄 Hicri–Miladi Çevrim Aracı', relMoon:'🌙 Güncel Ay Evresi', relPrayer:'🕌 Beş Vakit Namaz',
          footerLink:(m,y)=>`${m} ${y} H tam hicri takvimi` },
    ur: { faqTitle:'❓ اکثر پوچھے گئے سوالات', relatedTitle:'🌙 متعلقہ روابط',
          ctaConv:'🔄 تاریخ کنورٹر', ctaMoon:'🌙 آج کی چاند کی حالت', ctaPrayer:'🕌 آج کی نماز کے اوقات',
          relMonth:(m,y)=>`🌙 ${m} ${y} کا مہینہ`, relYear:(y)=>`📆 ${y} ہجری کا مکمل سال`,
          relConv:'🔄 ہجری–عیسوی کنورژن ٹول', relMoon:'🌙 چاند کا موجودہ مرحلہ', relPrayer:'🕌 پانچ نمازوں کے اوقات',
          footerLink:(m,y)=>`${m} ${y} کا مکمل ہجری کیلنڈر` },
    de: { faqTitle:'❓ Häufig gestellte Fragen', relatedTitle:'🌙 Verwandte Links',
          ctaConv:'🔄 Datumsumrechner', ctaMoon:'🌙 Mond heute', ctaPrayer:'🕌 Gebetszeiten heute',
          relMonth:(m,y)=>`🌙 Monat ${m} ${y} AH`, relYear:(y)=>`📆 Gesamtes Jahr ${y} AH`,
          relConv:'🔄 Hidschri-Gregorianisches Umrechnungstool', relMoon:'🌙 Aktuelle Mondphase', relPrayer:'🕌 Fünf tägliche Gebetszeiten',
          footerLink:(m,y)=>`vollständiger Hidschri-Kalender ${m} ${y} AH` },
    id: { faqTitle:'❓ Pertanyaan yang Sering Diajukan', relatedTitle:'🌙 Tautan Terkait',
          ctaConv:'🔄 Konverter Tanggal', ctaMoon:'🌙 Bulan Hari Ini', ctaPrayer:'🕌 Jadwal Sholat Hari Ini',
          relMonth:(m,y)=>`🌙 Bulan ${m} ${y} H`, relYear:(y)=>`📆 Setahun Penuh ${y} H`,
          relConv:'🔄 Alat Konversi Hijriah–Masehi', relMoon:'🌙 Fase Bulan Saat Ini', relPrayer:'🕌 Lima Waktu Sholat',
          footerLink:(m,y)=>`kalender Hijriah lengkap ${m} ${y} H` },
    es: { faqTitle:'❓ Preguntas frecuentes', relatedTitle:'🌙 Enlaces relacionados',
          ctaConv:'🔄 Convertidor de fechas', ctaMoon:'🌙 Luna hoy', ctaPrayer:'🕌 Horarios de oración hoy',
          relMonth:(m,y)=>`🌙 Mes de ${m} ${y} H`, relYear:(y)=>`📆 Año completo ${y} H`,
          relConv:'🔄 Herramienta de conversión Hégira–Gregoriano', relMoon:'🌙 Fase lunar actual', relPrayer:'🕌 Cinco oraciones diarias',
          footerLink:(m,y)=>`calendario Hégira completo de ${m} ${y} H` },
    bn: { faqTitle:'❓ প্রায়শই জিজ্ঞাসিত প্রশ্ন', relatedTitle:'🌙 সম্পর্কিত লিঙ্ক',
          ctaConv:'🔄 তারিখ রূপান্তরকারী', ctaMoon:'🌙 আজকের চাঁদ', ctaPrayer:'🕌 আজকের নামাজের সময়',
          relMonth:(m,y)=>`🌙 ${m} ${y} হিজরির মাস`, relYear:(y)=>`📆 ${y} হিজরি পূর্ণ বছর`,
          relConv:'🔄 হিজরি–খ্রিস্টীয় রূপান্তর টুল', relMoon:'🌙 বর্তমান চাঁদের পর্যায়', relPrayer:'🕌 পাঁচ ওয়াক্ত নামাজ',
          footerLink:(m,y)=>`${m} ${y} হিজরির পূর্ণ ক্যালেন্ডার` },
    ms: { faqTitle:'❓ Soalan Lazim', relatedTitle:'🌙 Pautan Berkaitan',
          ctaConv:'🔄 Penukar Tarikh', ctaMoon:'🌙 Bulan Hari Ini', ctaPrayer:'🕌 Waktu Solat Hari Ini',
          relMonth:(m,y)=>`🌙 Bulan ${m} ${y} H`, relYear:(y)=>`📆 Setahun Penuh ${y} H`,
          relConv:'🔄 Alat Penukaran Hijrah–Masihi', relMoon:'🌙 Fasa Bulan Semasa', relPrayer:'🕌 Lima Waktu Solat',
          footerLink:(m,y)=>`kalendar Hijrah penuh ${m} ${y} H` },
};
function hdayExtraUi(lang) { return _HDAY_EXTRA[lang] || _HDAY_EXTRA.en; }

// 🆕 Non-today date page extras (for /hijri-date/YYYY-MM-DD when date ≠ today)
// Rule: NO "today" phrasing anywhere — this is a static reference page for a specific date.
const _HDAY_NONTODAY = {
    ar: {
        faqTitle:'❓ أسئلة عن هذا التاريخ',
        cardYear:'📅 السنة', cardOrder:'📊 ترتيب اليوم', orderOf:(d,t)=>`${d} من ${t}`,
        relPrayerCity:(city)=>`🕌 مواقيت الصلاة في ${city}`,
        footer:(c)=>`يوافق التاريخ ${c.hDate} التاريخ الميلادي ${c.gDate} حسب تقويم أم القرى. شهر ${c.monthName} هو الشهر رقم ${c.monthNum} في السنة الهجرية، وتحتوي سنة ${c.year}${c.hSfx} على ${c.totalYearDays} يوماً. يمكنك تصفّح التقويم الهجري الكامل أو استخدام أداة تحويل التاريخ.`,
        faq:(c)=>[
            [`ما هو التاريخ الميلادي الموافق لـ ${c.hDate}؟`, `${c.hDate} يوافق ${c.gDate} حسب تقويم أم القرى.`],
            [`ما هو اليوم الذي يوافق ${c.hDate}؟`, `${c.hDate} يوافق يوم ${c.dayName}.`],
            [`ما هو شهر ${c.monthName}؟`, `${c.monthName} هو الشهر الهجري رقم ${c.monthNum} ضمن أشهر السنة الهجرية الاثني عشر.`],
            [`هل سنة ${c.year}${c.hSfx} سنة كبيسة؟`, c.isLeap?`نعم، سنة ${c.year}${c.hSfx} سنة كبيسة عدد أيامها 355 يوماً.`:`لا، سنة ${c.year}${c.hSfx} سنة بسيطة عدد أيامها 354 يوماً.`],
            [`كم عدد أيام شهر ${c.monthName} ${c.year}؟`, `شهر ${c.monthName} ${c.year}${c.hSfx} يتكوّن من ${c.totalDays} يوماً.`],
        ],
    },
    en: {
        faqTitle:'❓ About this date',
        cardYear:'📅 Year', cardOrder:'📊 Day of month', orderOf:(d,t)=>`${d} of ${t}`,
        relPrayerCity:(city)=>`🕌 Prayer Times in ${city}`,
        footer:(c)=>`${c.hDate} corresponds to ${c.gDate} according to the Umm al-Qura calendar. ${c.monthName} is month ${c.monthNum} of the Hijri year, and ${c.year}${c.hSfx} has ${c.totalYearDays} days in total. Browse the full Hijri calendar or use the date converter tool.`,
        faq:(c)=>[
            [`Which Gregorian date corresponds to ${c.hDate}?`, `${c.hDate} corresponds to ${c.gDate} under the Umm al-Qura calendar.`],
            [`What day of the week is ${c.hDate}?`, `${c.hDate} falls on ${c.dayName}.`],
            [`What is the month of ${c.monthName}?`, `${c.monthName} is the ${c.monthNum}${_ord(c.monthNum)} month of the Hijri lunar year.`],
            [`Is ${c.year}${c.hSfx} a leap year?`, c.isLeap?`Yes — ${c.year}${c.hSfx} is a leap year of 355 days.`:`No — ${c.year}${c.hSfx} is a common year of 354 days.`],
            [`How many days in ${c.monthName} ${c.year}?`, `${c.monthName} ${c.year}${c.hSfx} has ${c.totalDays} days.`],
        ],
    },
    fr: {
        faqTitle:'❓ À propos de cette date',
        cardYear:'📅 Année', cardOrder:'📊 Jour du mois', orderOf:(d,t)=>`${d} sur ${t}`,
        relPrayerCity:(city)=>`🕌 Heures de prière à ${city}`,
        footer:(c)=>`${c.hDate} correspond au ${c.gDate} selon le calendrier Umm al-Qura. ${c.monthName} est le mois n° ${c.monthNum} de l’année hégirienne, et ${c.year}${c.hSfx} compte ${c.totalYearDays} jours. Consultez le calendrier hégirien complet ou le convertisseur de dates.`,
        faq:(c)=>[
            [`À quelle date grégorienne correspond ${c.hDate} ?`, `${c.hDate} correspond au ${c.gDate} selon le calendrier Umm al-Qura.`],
            [`Quel jour de la semaine est ${c.hDate} ?`, `${c.hDate} tombe un ${c.dayName}.`],
            [`Qu’est-ce que le mois de ${c.monthName} ?`, `${c.monthName} est le ${c.monthNum}ᵉ mois de l’année hégirienne lunaire.`],
            [`${c.year}${c.hSfx} est-elle une année bissextile ?`, c.isLeap?`Oui — ${c.year}${c.hSfx} est une année bissextile de 355 jours.`:`Non — ${c.year}${c.hSfx} est une année ordinaire de 354 jours.`],
            [`Combien de jours compte ${c.monthName} ${c.year} ?`, `${c.monthName} ${c.year}${c.hSfx} compte ${c.totalDays} jours.`],
        ],
    },
    tr: {
        faqTitle:'❓ Bu tarih hakkında',
        cardYear:'📅 Yıl', cardOrder:'📊 Ayın günü', orderOf:(d,t)=>`${d} / ${t}`,
        relPrayerCity:(city)=>`🕌 ${city} Namaz Vakitleri`,
        footer:(c)=>`${c.hDate}, Ümmülkura takvimine göre ${c.gDate} tarihine denk gelir. ${c.monthName}, hicri yılın ${c.monthNum}. ayıdır ve ${c.year}${c.hSfx} yılı toplam ${c.totalYearDays} gün sürer. Tam hicri takvime göz atın veya tarih dönüştürücüyü kullanın.`,
        faq:(c)=>[
            [`${c.hDate} hangi miladi tarihe denk gelir?`, `${c.hDate}, Ümmülkura takvimine göre ${c.gDate} tarihine denk gelir.`],
            [`${c.hDate} hangi güne denk gelir?`, `${c.hDate}, ${c.dayName} gününe denk gelir.`],
            [`${c.monthName} ayı nedir?`, `${c.monthName}, hicri kameri yılın ${c.monthNum}. ayıdır.`],
            [`${c.year}${c.hSfx} artık yıl mı?`, c.isLeap?`Evet — ${c.year}${c.hSfx} 355 günlük artık yıldır.`:`Hayır — ${c.year}${c.hSfx} 354 günlük normal yıldır.`],
            [`${c.monthName} ${c.year} kaç gündür?`, `${c.monthName} ${c.year}${c.hSfx} ${c.totalDays} gündür.`],
        ],
    },
    ur: {
        faqTitle:'❓ اس تاریخ کے بارے میں',
        cardYear:'📅 سال', cardOrder:'📊 مہینے کا دن', orderOf:(d,t)=>`${d} از ${t}`,
        relPrayerCity:(city)=>`🕌 ${city} میں نماز کے اوقات`,
        footer:(c)=>`${c.hDate} ام القری کیلنڈر کے مطابق ${c.gDate} کے موافق ہے۔ ${c.monthName} ہجری سال کا ${c.monthNum} واں مہینہ ہے، اور سال ${c.year}${c.hSfx} کل ${c.totalYearDays} دن پر مشتمل ہے۔ مکمل ہجری کیلنڈر دیکھیں یا تاریخ کنورٹر استعمال کریں۔`,
        faq:(c)=>[
            [`${c.hDate} کس عیسوی تاریخ کے موافق ہے؟`, `${c.hDate} ام القری کیلنڈر کے مطابق ${c.gDate} کے موافق ہے۔`],
            [`${c.hDate} کس دن کو پڑتی ہے؟`, `${c.hDate} ${c.dayName} کو پڑتی ہے۔`],
            [`${c.monthName} کا مہینہ کیا ہے؟`, `${c.monthName} ہجری سال کا ${c.monthNum} واں مہینہ ہے۔`],
            [`کیا سال ${c.year}${c.hSfx} لیپ سال ہے؟`, c.isLeap?`جی ہاں — ${c.year}${c.hSfx} 355 دن کا لیپ سال ہے۔`:`نہیں — ${c.year}${c.hSfx} 354 دن کا عام سال ہے۔`],
            [`${c.monthName} ${c.year} میں کتنے دن ہیں؟`, `${c.monthName} ${c.year}${c.hSfx} میں ${c.totalDays} دن ہیں۔`],
        ],
    },
    de: {
        faqTitle:'❓ Über dieses Datum',
        cardYear:'📅 Jahr', cardOrder:'📊 Tag des Monats', orderOf:(d,t)=>`${d} von ${t}`,
        relPrayerCity:(city)=>`🕌 Gebetszeiten in ${city}`,
        footer:(c)=>`${c.hDate} entspricht nach dem Umm-al-Qura-Kalender dem ${c.gDate}. ${c.monthName} ist der ${c.monthNum}. Monat des Hidschri-Jahres; ${c.year}${c.hSfx} umfasst insgesamt ${c.totalYearDays} Tage. Durchsuchen Sie den vollständigen Hidschri-Kalender oder nutzen Sie den Datumsumrechner.`,
        faq:(c)=>[
            [`Welchem gregorianischen Datum entspricht ${c.hDate}?`, `${c.hDate} entspricht ${c.gDate} nach dem Umm-al-Qura-Kalender.`],
            [`Auf welchen Wochentag fällt ${c.hDate}?`, `${c.hDate} fällt auf einen ${c.dayName}.`],
            [`Was ist der Monat ${c.monthName}?`, `${c.monthName} ist der ${c.monthNum}. Monat des Hidschri-Mondjahres.`],
            [`Ist ${c.year}${c.hSfx} ein Schaltjahr?`, c.isLeap?`Ja — ${c.year}${c.hSfx} ist ein Schaltjahr mit 355 Tagen.`:`Nein — ${c.year}${c.hSfx} ist ein Gemeinjahr mit 354 Tagen.`],
            [`Wie viele Tage hat ${c.monthName} ${c.year}?`, `${c.monthName} ${c.year}${c.hSfx} hat ${c.totalDays} Tage.`],
        ],
    },
    id: {
        faqTitle:'❓ Tentang tanggal ini',
        cardYear:'📅 Tahun', cardOrder:'📊 Hari ke', orderOf:(d,t)=>`${d} dari ${t}`,
        relPrayerCity:(city)=>`🕌 Jadwal Sholat di ${city}`,
        footer:(c)=>`${c.hDate} bertepatan dengan ${c.gDate} menurut kalender Umm al-Qura. ${c.monthName} adalah bulan ke-${c.monthNum} dalam tahun Hijriah, dan tahun ${c.year}${c.hSfx} berdurasi ${c.totalYearDays} hari. Telusuri kalender Hijriah lengkap atau gunakan konverter tanggal.`,
        faq:(c)=>[
            [`Tanggal Masehi apa yang bertepatan dengan ${c.hDate}?`, `${c.hDate} bertepatan dengan ${c.gDate} menurut kalender Umm al-Qura.`],
            [`${c.hDate} jatuh pada hari apa?`, `${c.hDate} jatuh pada hari ${c.dayName}.`],
            [`Apa itu bulan ${c.monthName}?`, `${c.monthName} adalah bulan ke-${c.monthNum} dalam tahun Hijriah.`],
            [`Apakah tahun ${c.year}${c.hSfx} tahun kabisat?`, c.isLeap?`Ya — ${c.year}${c.hSfx} adalah tahun kabisat dengan 355 hari.`:`Tidak — ${c.year}${c.hSfx} adalah tahun biasa dengan 354 hari.`],
            [`Berapa jumlah hari bulan ${c.monthName} ${c.year}?`, `${c.monthName} ${c.year}${c.hSfx} berjumlah ${c.totalDays} hari.`],
        ],
    },
    es: {
        faqTitle:'❓ Sobre esta fecha',
        cardYear:'📅 Año', cardOrder:'📊 Día del mes', orderOf:(d,t)=>`${d} de ${t}`,
        relPrayerCity:(city)=>`🕌 Horarios de oración en ${city}`,
        footer:(c)=>`${c.hDate} corresponde al ${c.gDate} según el calendario Umm al-Qura. ${c.monthName} es el mes n.º ${c.monthNum} del año hégira, y ${c.year}${c.hSfx} consta de ${c.totalYearDays} días. Explore el calendario hégira completo o use el convertidor de fechas.`,
        faq:(c)=>[
            [`¿A qué fecha gregoriana corresponde ${c.hDate}?`, `${c.hDate} corresponde al ${c.gDate} según el calendario Umm al-Qura.`],
            [`¿Qué día de la semana cae ${c.hDate}?`, `${c.hDate} cae en ${c.dayName}.`],
            [`¿Qué es el mes de ${c.monthName}?`, `${c.monthName} es el ${c.monthNum}.º mes del año hégira lunar.`],
            [`¿Es ${c.year}${c.hSfx} un año bisiesto?`, c.isLeap?`Sí — ${c.year}${c.hSfx} es un año bisiesto de 355 días.`:`No — ${c.year}${c.hSfx} es un año común de 354 días.`],
            [`¿Cuántos días tiene ${c.monthName} ${c.year}?`, `${c.monthName} ${c.year}${c.hSfx} tiene ${c.totalDays} días.`],
        ],
    },
    bn: {
        faqTitle:'❓ এই তারিখ সম্পর্কে',
        cardYear:'📅 বছর', cardOrder:'📊 মাসের দিন', orderOf:(d,t)=>`${d} / ${t}`,
        relPrayerCity:(city)=>`🕌 ${city}-এ নামাজের সময়`,
        footer:(c)=>`${c.hDate} উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী ${c.gDate}-এর সমতুল্য। ${c.monthName} হলো হিজরি বর্ষের ${c.monthNum}তম মাস, এবং ${c.year}${c.hSfx} বছরে মোট ${c.totalYearDays} দিন রয়েছে। পূর্ণ হিজরি ক্যালেন্ডার ব্রাউজ করুন বা তারিখ রূপান্তরকারী ব্যবহার করুন।`,
        faq:(c)=>[
            [`${c.hDate} কোন খ্রিস্টীয় তারিখের সমতুল্য?`, `${c.hDate} উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী ${c.gDate}-এর সমতুল্য।`],
            [`${c.hDate} সপ্তাহের কোন দিনে পড়ে?`, `${c.hDate} ${c.dayName}-এ পড়ে।`],
            [`${c.monthName} মাসটি কী?`, `${c.monthName} হলো হিজরি চন্দ্র বর্ষের ${c.monthNum}তম মাস।`],
            [`${c.year}${c.hSfx} কি অধিবর্ষ?`, c.isLeap?`হ্যাঁ — ${c.year}${c.hSfx} ৩৫৫ দিনের একটি অধিবর্ষ।`:`না — ${c.year}${c.hSfx} ৩৫৪ দিনের একটি সাধারণ বছর।`],
            [`${c.monthName} ${c.year} মাসে কত দিন?`, `${c.monthName} ${c.year}${c.hSfx} মাসে ${c.totalDays} দিন।`],
        ],
    },
    ms: {
        faqTitle:'❓ Tentang tarikh ini',
        cardYear:'📅 Tahun', cardOrder:'📊 Hari dalam bulan', orderOf:(d,t)=>`${d} daripada ${t}`,
        relPrayerCity:(city)=>`🕌 Waktu Solat di ${city}`,
        footer:(c)=>`${c.hDate} bersamaan dengan ${c.gDate} mengikut kalendar Umm al-Qura. ${c.monthName} ialah bulan ke-${c.monthNum} tahun Hijrah, dan tahun ${c.year}${c.hSfx} mempunyai jumlah ${c.totalYearDays} hari. Layari kalendar Hijrah penuh atau gunakan penukar tarikh.`,
        faq:(c)=>[
            [`Tarikh Masihi apa bersamaan dengan ${c.hDate}?`, `${c.hDate} bersamaan dengan ${c.gDate} mengikut kalendar Umm al-Qura.`],
            [`${c.hDate} jatuh pada hari apa?`, `${c.hDate} jatuh pada hari ${c.dayName}.`],
            [`Apakah bulan ${c.monthName}?`, `${c.monthName} ialah bulan ke-${c.monthNum} tahun qamari Hijrah.`],
            [`Adakah ${c.year}${c.hSfx} tahun lompat?`, c.isLeap?`Ya — ${c.year}${c.hSfx} tahun lompat 355 hari.`:`Tidak — ${c.year}${c.hSfx} tahun biasa 354 hari.`],
            [`Berapa hari dalam ${c.monthName} ${c.year}?`, `${c.monthName} ${c.year}${c.hSfx} mempunyai ${c.totalDays} hari.`],
        ],
    },
};
function _ord(n) { const s=['th','st','nd','rd'], v=n%100; return s[(v-20)%10]||s[v]||s[0]; }
function hdayNonTodayUi(lang) { return _HDAY_NONTODAY[lang] || _HDAY_NONTODAY.en; }

// 🆕 Geo-aware strings for today-page (/hijri-date/YYYY-MM-DD when date === today AND city known)
// Pattern: a city-aware suffix/inline that upgrades intent strength ("date + location").
const _HDAY_GEO = {
    ar: {
        h1:(loc,day,date)=>`التاريخ الهجري اليوم في ${loc}: ${day} ${date}`,
        ctaPrayer:(loc)=>`🕌 مواقيت الصلاة اليوم في ${loc}`,
        ctaMoon:(loc)=>`🌙 حالة القمر اليوم في ${loc}`,
        relPrayer:(loc)=>`🕌 مواقيت الصلاة في ${loc}`,
        relMoon:(loc)=>`🌙 مراحل القمر اليوم في ${loc}`,
        footer:(c,loc)=>`يعرض هذا القسم التاريخ الهجري اليوم بدقة حسب تقويم أم القرى في ${loc}. التاريخ اليوم هو ${c.hDate} الموافق ${c.gDate}.`,
        footerLink:(m,y,loc)=>`التقويم الهجري لشهر ${m} ${y} هـ في ${loc}`,
        faqFirstQ:(loc)=>`ما هو التاريخ الهجري اليوم في ${loc}؟`,
        faqFirstA:(c,loc)=>`التاريخ الهجري اليوم في ${loc} هو ${c.hDate} الموافق ${c.gDate} حسب تقويم أم القرى.`,
        seoTitle:(loc,date)=>`التاريخ الهجري اليوم في ${loc}: ${date}`,
        schemaName:(loc)=>`التاريخ الهجري اليوم في ${loc}`,
        schemaAbout:'التاريخ الهجري اليوم حسب تقويم أم القرى',
    },
    en: {
        h1:(loc,day,date)=>`Today's Hijri Date in ${loc}: ${day}, ${date}`,
        ctaPrayer:(loc)=>`🕌 Today's Prayer Times in ${loc}`,
        ctaMoon:(loc)=>`🌙 Moon Today in ${loc}`,
        relPrayer:(loc)=>`🕌 Prayer Times in ${loc}`,
        relMoon:(loc)=>`🌙 Current Moon Phase in ${loc}`,
        footer:(c,loc)=>`This section shows today's Hijri date accurately per the Umm al-Qura calendar in ${loc}. Today is ${c.hDate} corresponding to ${c.gDate}.`,
        footerLink:(m,y,loc)=>`full ${m} ${y} Hijri calendar in ${loc}`,
        faqFirstQ:(loc)=>`What is today's Hijri date in ${loc}?`,
        faqFirstA:(c,loc)=>`Today's Hijri date in ${loc} is ${c.hDate}, corresponding to ${c.gDate} per the Umm al-Qura calendar.`,
        seoTitle:(loc,date)=>`Today's Hijri Date in ${loc}: ${date}`,
        schemaName:(loc)=>`Today's Hijri Date in ${loc}`,
        schemaAbout:"Today's Hijri date per the Umm al-Qura calendar",
    },
    fr: {
        h1:(loc,day,date)=>`Date hégirienne aujourd'hui à ${loc} : ${day}, ${date}`,
        ctaPrayer:(loc)=>`🕌 Heures de prière aujourd'hui à ${loc}`,
        ctaMoon:(loc)=>`🌙 Lune aujourd'hui à ${loc}`,
        relPrayer:(loc)=>`🕌 Heures de prière à ${loc}`,
        relMoon:(loc)=>`🌙 Phase lunaire actuelle à ${loc}`,
        footer:(c,loc)=>`Cette section affiche la date hégirienne d'aujourd'hui selon le calendrier Oumm al-Qoura à ${loc}. Aujourd'hui c'est ${c.hDate}, soit ${c.gDate}.`,
        footerLink:(m,y,loc)=>`calendrier hégirien complet de ${m} ${y} H à ${loc}`,
        faqFirstQ:(loc)=>`Quelle est la date hégirienne aujourd'hui à ${loc} ?`,
        faqFirstA:(c,loc)=>`La date hégirienne aujourd'hui à ${loc} est ${c.hDate}, correspondant à ${c.gDate} selon le calendrier Oumm al-Qoura.`,
        seoTitle:(loc,date)=>`Date hégirienne aujourd'hui à ${loc} : ${date}`,
        schemaName:(loc)=>`Date hégirienne aujourd'hui à ${loc}`,
        schemaAbout:"Date hégirienne aujourd'hui selon le calendrier Oumm al-Qoura",
    },
    tr: {
        h1:(loc,day,date)=>`Bugünün Hicri Tarihi (${loc}): ${day}, ${date}`,
        ctaPrayer:(loc)=>`🕌 ${loc} için Bugünün Namaz Vakitleri`,
        ctaMoon:(loc)=>`🌙 Bugün ${loc}'de Ay`,
        relPrayer:(loc)=>`🕌 ${loc} Namaz Vakitleri`,
        relMoon:(loc)=>`🌙 ${loc} Güncel Ay Evresi`,
        footer:(c,loc)=>`Bu bölüm, Ümmü'l-Kura takvimine göre ${loc} için bugünün hicri tarihini doğru şekilde gösterir. Bugün ${c.hDate}, miladi ${c.gDate}.`,
        footerLink:(m,y,loc)=>`${loc} için ${m} ${y} H tam hicri takvimi`,
        faqFirstQ:(loc)=>`${loc} için bugünün hicri tarihi nedir?`,
        faqFirstA:(c,loc)=>`${loc} için bugünün hicri tarihi ${c.hDate}, miladi ${c.gDate} (Ümmü'l-Kura takvimine göre).`,
        seoTitle:(loc,date)=>`Bugünün Hicri Tarihi (${loc}): ${date}`,
        schemaName:(loc)=>`${loc} için Bugünün Hicri Tarihi`,
        schemaAbout:"Ümmü'l-Kura takvimine göre bugünün hicri tarihi",
    },
    ur: {
        h1:(loc,day,date)=>`آج کی ہجری تاریخ ${loc} میں: ${day}، ${date}`,
        ctaPrayer:(loc)=>`🕌 آج ${loc} میں نماز کے اوقات`,
        ctaMoon:(loc)=>`🌙 آج ${loc} میں چاند کی حالت`,
        relPrayer:(loc)=>`🕌 ${loc} میں نماز کے اوقات`,
        relMoon:(loc)=>`🌙 ${loc} میں چاند کا موجودہ مرحلہ`,
        footer:(c,loc)=>`یہ سیکشن ام القریٰ کیلنڈر کے مطابق ${loc} میں آج کی ہجری تاریخ ظاہر کرتا ہے۔ آج ${c.hDate} ہے، جو ${c.gDate} کے مطابق ہے۔`,
        footerLink:(m,y,loc)=>`${loc} کے لیے ${m} ${y} کا مکمل ہجری کیلنڈر`,
        faqFirstQ:(loc)=>`${loc} میں آج کی ہجری تاریخ کیا ہے؟`,
        faqFirstA:(c,loc)=>`${loc} میں آج کی ہجری تاریخ ${c.hDate} ہے، جو ام القریٰ کیلنڈر کے مطابق ${c.gDate} ہے۔`,
        seoTitle:(loc,date)=>`آج کی ہجری تاریخ ${loc} میں: ${date}`,
        schemaName:(loc)=>`${loc} میں آج کی ہجری تاریخ`,
        schemaAbout:'ام القریٰ کیلنڈر کے مطابق آج کی ہجری تاریخ',
    },
    de: {
        h1:(loc,day,date)=>`Heutiges Hidschri-Datum in ${loc}: ${day}, ${date}`,
        ctaPrayer:(loc)=>`🕌 Heutige Gebetszeiten in ${loc}`,
        ctaMoon:(loc)=>`🌙 Mond heute in ${loc}`,
        relPrayer:(loc)=>`🕌 Gebetszeiten in ${loc}`,
        relMoon:(loc)=>`🌙 Aktuelle Mondphase in ${loc}`,
        footer:(c,loc)=>`Dieser Abschnitt zeigt das heutige Hidschri-Datum nach dem Umm-al-Qura-Kalender in ${loc}. Heute ist ${c.hDate}, entspricht ${c.gDate}.`,
        footerLink:(m,y,loc)=>`vollständiger Hidschri-Kalender ${m} ${y} AH für ${loc}`,
        faqFirstQ:(loc)=>`Was ist das heutige Hidschri-Datum in ${loc}?`,
        faqFirstA:(c,loc)=>`Das heutige Hidschri-Datum in ${loc} ist ${c.hDate}, entspricht ${c.gDate} nach dem Umm-al-Qura-Kalender.`,
        seoTitle:(loc,date)=>`Heutiges Hidschri-Datum in ${loc}: ${date}`,
        schemaName:(loc)=>`Heutiges Hidschri-Datum in ${loc}`,
        schemaAbout:'Heutiges Hidschri-Datum nach dem Umm-al-Qura-Kalender',
    },
    id: {
        h1:(loc,day,date)=>`Tanggal Hijriah Hari Ini di ${loc}: ${day}, ${date}`,
        ctaPrayer:(loc)=>`🕌 Jadwal Sholat Hari Ini di ${loc}`,
        ctaMoon:(loc)=>`🌙 Bulan Hari Ini di ${loc}`,
        relPrayer:(loc)=>`🕌 Jadwal Sholat di ${loc}`,
        relMoon:(loc)=>`🌙 Fase Bulan Saat Ini di ${loc}`,
        footer:(c,loc)=>`Bagian ini menampilkan tanggal Hijriah hari ini secara akurat menurut kalender Umm al-Qura di ${loc}. Hari ini adalah ${c.hDate}, bertepatan dengan ${c.gDate}.`,
        footerLink:(m,y,loc)=>`kalender Hijriah lengkap ${m} ${y} H di ${loc}`,
        faqFirstQ:(loc)=>`Apa tanggal Hijriah hari ini di ${loc}?`,
        faqFirstA:(c,loc)=>`Tanggal Hijriah hari ini di ${loc} adalah ${c.hDate}, bertepatan dengan ${c.gDate} menurut kalender Umm al-Qura.`,
        seoTitle:(loc,date)=>`Tanggal Hijriah Hari Ini di ${loc}: ${date}`,
        schemaName:(loc)=>`Tanggal Hijriah Hari Ini di ${loc}`,
        schemaAbout:'Tanggal Hijriah hari ini menurut kalender Umm al-Qura',
    },
    es: {
        h1:(loc,day,date)=>`Fecha hégira hoy en ${loc}: ${day}, ${date}`,
        ctaPrayer:(loc)=>`🕌 Horarios de oración hoy en ${loc}`,
        ctaMoon:(loc)=>`🌙 Luna hoy en ${loc}`,
        relPrayer:(loc)=>`🕌 Horarios de oración en ${loc}`,
        relMoon:(loc)=>`🌙 Fase lunar actual en ${loc}`,
        footer:(c,loc)=>`Esta sección muestra la fecha hégira de hoy con precisión según el calendario Umm al-Qura en ${loc}. Hoy es ${c.hDate}, correspondiente a ${c.gDate}.`,
        footerLink:(m,y,loc)=>`calendario Hégira completo de ${m} ${y} H en ${loc}`,
        faqFirstQ:(loc)=>`¿Cuál es la fecha hégira hoy en ${loc}?`,
        faqFirstA:(c,loc)=>`La fecha hégira hoy en ${loc} es ${c.hDate}, correspondiente a ${c.gDate} según el calendario Umm al-Qura.`,
        seoTitle:(loc,date)=>`Fecha hégira hoy en ${loc}: ${date}`,
        schemaName:(loc)=>`Fecha hégira hoy en ${loc}`,
        schemaAbout:'Fecha hégira hoy según el calendario Umm al-Qura',
    },
    bn: {
        h1:(loc,day,date)=>`আজকের হিজরি তারিখ ${loc}-এ: ${day}, ${date}`,
        ctaPrayer:(loc)=>`🕌 আজ ${loc}-এ নামাজের সময়`,
        ctaMoon:(loc)=>`🌙 আজ ${loc}-এ চাঁদ`,
        relPrayer:(loc)=>`🕌 ${loc}-এ নামাজের সময়`,
        relMoon:(loc)=>`🌙 ${loc}-এ বর্তমান চাঁদের পর্যায়`,
        footer:(c,loc)=>`এই বিভাগটি উম্মুল কুরা ক্যালেন্ডার অনুযায়ী ${loc}-এ আজকের হিজরি তারিখ সঠিকভাবে প্রদর্শন করে। আজ ${c.hDate}, যা ${c.gDate}-এর সমতুল্য।`,
        footerLink:(m,y,loc)=>`${loc}-এর জন্য ${m} ${y} হিজরির পূর্ণ ক্যালেন্ডার`,
        faqFirstQ:(loc)=>`${loc}-এ আজকের হিজরি তারিখ কী?`,
        faqFirstA:(c,loc)=>`${loc}-এ আজকের হিজরি তারিখ ${c.hDate}, উম্মুল কুরা ক্যালেন্ডার অনুযায়ী ${c.gDate}-এর সমতুল্য।`,
        seoTitle:(loc,date)=>`আজকের হিজরি তারিখ ${loc}-এ: ${date}`,
        schemaName:(loc)=>`${loc}-এ আজকের হিজরি তারিখ`,
        schemaAbout:'উম্মুল কুরা ক্যালেন্ডার অনুযায়ী আজকের হিজরি তারিখ',
    },
    ms: {
        h1:(loc,day,date)=>`Tarikh Hijrah Hari Ini di ${loc}: ${day}, ${date}`,
        ctaPrayer:(loc)=>`🕌 Waktu Solat Hari Ini di ${loc}`,
        ctaMoon:(loc)=>`🌙 Bulan Hari Ini di ${loc}`,
        relPrayer:(loc)=>`🕌 Waktu Solat di ${loc}`,
        relMoon:(loc)=>`🌙 Fasa Bulan Semasa di ${loc}`,
        footer:(c,loc)=>`Bahagian ini memaparkan tarikh Hijrah hari ini dengan tepat mengikut kalendar Umm al-Qura di ${loc}. Hari ini ialah ${c.hDate}, bersamaan ${c.gDate}.`,
        footerLink:(m,y,loc)=>`kalendar Hijrah penuh ${m} ${y} H di ${loc}`,
        faqFirstQ:(loc)=>`Apakah tarikh Hijrah hari ini di ${loc}?`,
        faqFirstA:(c,loc)=>`Tarikh Hijrah hari ini di ${loc} ialah ${c.hDate}, bersamaan ${c.gDate} mengikut kalendar Umm al-Qura.`,
        seoTitle:(loc,date)=>`Tarikh Hijrah Hari Ini di ${loc}: ${date}`,
        schemaName:(loc)=>`Tarikh Hijrah Hari Ini di ${loc}`,
        schemaAbout:'Tarikh Hijrah hari ini mengikut kalendar Umm al-Qura',
    },
};
function hdayGeoUi(lang) { return _HDAY_GEO[lang] || _HDAY_GEO.en; }

// ========= تسميات واجهة صفحة السنة الهجرية (/hijri-calendar[/year]) لكلّ لغة =========
// c = { year, hSfx, country, isLeap, totalYearDays, monthName, todayYear }
const _HYEAR_UI = {
    ar: { home:'الرئيسية', cal:'التقويم الهجري', faq_title:'❓ أسئلة شائعة', seo_title:'🌙 عن التقويم الهجري',
          site:'مواقيت الصلاة والتقويم الهجري',
          card_labels:['السنة','عدد الأيام','نوع السنة','عدد الأشهر'],
          months_val:'12 شهراً', days_word:'يوم',
          leap_yes: d => `كبيسة (${d} يوماً)`, leap_no: d => `بسيطة (${d} يوماً)`,
          leap_text:(y,d)=>y?`سنة كبيسة`:`سنة بسيطة`,
          th:['الشهر','البداية (ميلادي)','النهاية (ميلادي)','الأيام'],
          cta_today:'📌 التاريخ الهجري اليوم', cta_converter:'🔄 تحويل التاريخ',
          cta_month: (mn, y) => `🌙 عرض تقويم شهر ${mn} ${y}`,
          title: c => `التقويم الهجري لعام ${c.year}${c.hSfx} — كامل مع التواريخ الميلادية`,
          intro: c => `يعرض هذا التقويم الهجري لعام ${c.year}${c.hSfx} جميع الأشهر الهجرية مع التواريخ الميلادية المقابلة حسب تقويم أم القرى في ${c.country}.`,
          table_title: c => `📊 جميع أشهر السنة الهجرية ${c.year}${c.hSfx}:`,
          months_grid_title: c => `📅 تصفح أشهر السنة الهجرية ${c.year}${c.hSfx}`,
          today_in_year: (d, mn, y, hSfx, href) => `📌 اليوم الهجري اليوم: <strong><a href="${href}">${d} ${mn} ${y}${hSfx}</a></strong>`,
          years_title: '📆 تصفّح السنوات الهجرية',
          years_current: ()=>'سنوات قريبة:',
          years_active_suffix: '',
          years_all_link: '→ عرض التقويم الهجري الكامل',
          seo_text: c => `يتكون التقويم الهجري من 12 شهراً تبدأ بمحرم وتنتهي بذي الحجة، ويعتمد على دورة القمر حيث يبدأ كل شهر برؤية الهلال. عام ${c.year}${c.hSfx} يحتوي على ${c.totalYearDays} يوماً وهو ${c.isLeap?'سنة كبيسة':'سنة بسيطة'}. تقويم أم القرى المعتمد في المملكة العربية السعودية هو تقويم قمري حسابي يستخدم لتحديد المناسبات الإسلامية مثل رمضان وعيد الفطر وعيد الأضحى.`,
          footer: c => `يعرض هذا التقويم الهجري لعام ${c.year}${c.hSfx} جميع الأشهر مع التواريخ الميلادية المقابلة، مما يساعدك على متابعة المناسبات الإسلامية ومعرفة التاريخ الهجري بدقة حسب تقويم أم القرى في المملكة العربية السعودية. يمكنك أيضًا الانتقال إلى أي شهر أو يوم هجري بسهولة أو استخدام أداة تحويل التاريخ بين الهجري والميلادي.`,
          faq: c => [
              [`كم عدد أيام السنة الهجرية ${c.year}${c.hSfx}؟`, `${c.totalYearDays} يوماً.`],
              [`هل سنة ${c.year}${c.hSfx} كبيسة؟`, c.isLeap?`نعم، سنة ${c.year}${c.hSfx} كبيسة وعدد أيامها 355 يوماً.`:`لا، سنة ${c.year}${c.hSfx} بسيطة وعدد أيامها 354 يوماً.`],
              [`كم عدد الأشهر الهجرية؟`, `12 شهراً، تبدأ بمحرم وتنتهي بذي الحجة.`]
          ],
          headline: c => `التقويم الهجري لعام ${c.year}${c.hSfx}`,
          meta_desc: c => `التقويم الهجري الكامل لعام ${c.year}${c.hSfx} مع جميع الأشهر الهجرية والتواريخ الميلادية المقابلة حسب تقويم أم القرى في ${c.country}.`,
          meta_title: c => `التقويم الهجري لعام ${c.year}${c.hSfx}` },
    en: { home:'Home', cal:'Hijri Calendar', faq_title:'❓ Frequently Asked Questions', seo_title:'🌙 About the Hijri Calendar',
          site:'Prayer Times & Hijri Calendar',
          card_labels:['Year','Total Days','Year Type','Months'],
          months_val:'12 months', days_word:'days',
          leap_yes: d => `Leap Year (${d} days)`, leap_no: d => `Regular Year (${d} days)`,
          leap_text:(y,d)=>y?`a leap year`:`a regular year`,
          th:['Month','Start (Gregorian)','End (Gregorian)','Days'],
          cta_today:"📌 Today's Hijri Date", cta_converter:'🔄 Date Converter',
          cta_month: (mn, y) => `🌙 View ${mn} ${y} Calendar`,
          title: c => `Hijri Calendar for the Year ${c.year}${c.hSfx} — Complete with Gregorian Dates`,
          intro: c => `This calendar displays all Hijri months of ${c.year}${c.hSfx} with their corresponding Gregorian dates, according to the Umm al-Qura calendar in ${c.country}.`,
          table_title: c => `📊 All Months of Hijri Year ${c.year}${c.hSfx}:`,
          months_grid_title: c => `📅 Browse Months of ${c.year}${c.hSfx}`,
          today_in_year: (d, mn, y, hSfx, href) => `📌 Today's Hijri Date: <strong><a href="${href}">${mn} ${d}, ${y}${hSfx}</a></strong>`,
          years_title: '📆 Browse Hijri Years',
          years_current: ()=>'Nearby years:',
          years_active_suffix: '',
          years_all_link: '→ View the full Hijri calendar',
          seo_text: c => `The Hijri calendar consists of 12 months starting with Muharram and ending with Dhu al-Hijjah. It is based on the lunar cycle, where each month begins with the sighting of the new crescent moon. The year ${c.year}${c.hSfx} contains ${c.totalYearDays} days and is ${c.isLeap?'a leap year':'a regular year'}. The Umm al-Qura calendar, used in Saudi Arabia, is a calculated lunar calendar used to determine Islamic occasions such as Ramadan, Eid al-Fitr, and Eid al-Adha.`,
          footer: c => `This Hijri calendar for ${c.year}${c.hSfx} shows all months with their corresponding Gregorian dates, helping you follow Islamic occasions and track the Hijri date accurately according to the Umm al-Qura calendar used in Saudi Arabia. You can also navigate to any Hijri month or day easily, or use our date converter tool to convert between Hijri and Gregorian calendars.`,
          faq: c => [
              [`How many days are in the Hijri year ${c.year}${c.hSfx}?`, `${c.totalYearDays} days.`],
              [`Is ${c.year}${c.hSfx} a leap year?`, c.isLeap?`Yes, ${c.year}${c.hSfx} is a leap year with 355 days.`:`No, ${c.year}${c.hSfx} is a regular year with 354 days.`],
              [`How many months are in the Hijri calendar?`, `12 months, from Muharram to Dhu al-Hijjah.`]
          ],
          headline: c => `Hijri Calendar for the Year ${c.year}${c.hSfx}`,
          meta_desc: c => `Full Hijri calendar for ${c.year}${c.hSfx} with all 12 months and corresponding Gregorian dates, according to the Umm al-Qura calendar in ${c.country}.`,
          meta_title: c => `Hijri Calendar ${c.year}${c.hSfx}` },
    fr: { home:'Accueil', cal:'Calendrier hégirien', faq_title:'❓ Questions fréquentes', seo_title:'🌙 À propos du calendrier hégirien',
          site:'Heures de prière & Calendrier hégirien',
          card_labels:['Année','Total des jours','Type d\'année','Mois'],
          months_val:'12 mois', days_word:'jours',
          leap_yes: d => `Année bissextile (${d} jours)`, leap_no: d => `Année ordinaire (${d} jours)`,
          leap_text:(y,d)=>y?`une année bissextile`:`une année ordinaire`,
          th:['Mois','Début (grégorien)','Fin (grégorien)','Jours'],
          cta_today:"📌 Date hégirienne d'aujourd'hui", cta_converter:'🔄 Convertisseur de dates',
          cta_month: (mn, y) => `🌙 Voir le calendrier de ${mn} ${y}`,
          title: c => `Calendrier hégirien de l'année ${c.year}${c.hSfx} — complet avec les dates grégoriennes`,
          intro: c => `Ce calendrier affiche tous les mois hégiriens de ${c.year}${c.hSfx} avec leurs dates grégoriennes correspondantes, selon le calendrier Umm al-Qura à ${c.country}.`,
          table_title: c => `📊 Tous les mois de l'année hégirienne ${c.year}${c.hSfx} :`,
          months_grid_title: c => `📅 Parcourir les mois de ${c.year}${c.hSfx}`,
          today_in_year: (d, mn, y, hSfx, href) => `📌 Date hégirienne d'aujourd'hui : <strong><a href="${href}">${d} ${mn} ${y}${hSfx}</a></strong>`,
          years_title: '📆 Parcourir les années hégiriennes',
          years_current: ()=>'Années proches :',
          years_active_suffix: '',
          years_all_link: '→ Voir le calendrier hégirien complet',
          seo_text: c => `Le calendrier hégirien se compose de 12 mois, de Mouharram à Dhou al-Hijja. Il est basé sur le cycle lunaire, où chaque mois commence par l'observation du croissant de lune. L'année ${c.year}${c.hSfx} contient ${c.totalYearDays} jours et est ${c.isLeap?'une année bissextile':'une année ordinaire'}. Le calendrier Umm al-Qura, utilisé en Arabie saoudite, est un calendrier lunaire calculé utilisé pour déterminer les occasions islamiques telles que le Ramadan, l'Aïd el-Fitr et l'Aïd el-Adha.`,
          footer: c => `Ce calendrier hégirien pour ${c.year}${c.hSfx} affiche tous les mois avec leurs dates grégoriennes correspondantes, vous permettant de suivre les occasions islamiques et de connaître la date hégirienne avec précision selon le calendrier Umm al-Qura utilisé en Arabie saoudite. Vous pouvez également accéder facilement à n'importe quel mois ou jour hégirien, ou utiliser notre convertisseur de dates pour passer entre les calendriers hégirien et grégorien.`,
          faq: c => [
              [`Combien de jours compte l'année hégirienne ${c.year}${c.hSfx} ?`, `${c.totalYearDays} jours.`],
              [`${c.year}${c.hSfx} est-elle une année bissextile ?`, c.isLeap?`Oui, ${c.year}${c.hSfx} est une année bissextile de 355 jours.`:`Non, ${c.year}${c.hSfx} est une année ordinaire de 354 jours.`],
              [`Combien de mois compte le calendrier hégirien ?`, `12 mois, de Mouharram à Dhou al-Hijja.`]
          ],
          headline: c => `Calendrier hégirien de l'année ${c.year}${c.hSfx}`,
          meta_desc: c => `Calendrier hégirien complet de ${c.year}${c.hSfx} avec les 12 mois et les dates grégoriennes correspondantes, selon le calendrier Umm al-Qura à ${c.country}.`,
          meta_title: c => `Calendrier hégirien ${c.year}${c.hSfx}` },
    tr: { home:'Anasayfa', cal:'Hicri Takvim', faq_title:'❓ Sıkça Sorulan Sorular', seo_title:'🌙 Hicri Takvim Hakkında',
          site:'Namaz Vakitleri ve Hicri Takvim',
          card_labels:['Yıl','Toplam Gün','Yıl Tipi','Ay Sayısı'],
          months_val:'12 ay', days_word:'gün',
          leap_yes: d => `Artık Yıl (${d} gün)`, leap_no: d => `Normal Yıl (${d} gün)`,
          leap_text:(y,d)=>y?`artık yıl`:`normal yıl`,
          th:['Ay','Başlangıç (Miladi)','Bitiş (Miladi)','Gün'],
          cta_today:'📌 Bugünün Hicri Tarihi', cta_converter:'🔄 Tarih Dönüştürücü',
          cta_month: (mn, y) => `🌙 ${mn} ${y} Takvimini Görüntüle`,
          title: c => `${c.year}${c.hSfx} Hicri Takvimi — Tüm Aylar Miladi Tarihlerle`,
          intro: c => `Bu takvim, ${c.year}${c.hSfx} yılının tüm hicri aylarını, ${c.country} ülkesinde Ümmülkura takvimine göre miladi karşılıklarıyla birlikte gösterir.`,
          table_title: c => `📊 ${c.year}${c.hSfx} Hicri Yılının Tüm Ayları:`,
          months_grid_title: c => `📅 ${c.year}${c.hSfx} Aylarına Göz At`,
          today_in_year: (d, mn, y, hSfx, href) => `📌 Bugünün Hicri Tarihi: <strong><a href="${href}">${d} ${mn} ${y}${hSfx}</a></strong>`,
          years_title: '📆 Hicri Yıllarına Göz At',
          years_current: ()=>'Yakın yıllar:',
          years_active_suffix: '',
          years_all_link: '→ Tam Hicri takvimi görüntüle',
          seo_text: c => `Hicri takvim, Muharrem'den Zilhicce'ye kadar 12 aydan oluşur. Ay döngüsüne dayanır; her ay yeni hilalin görülmesiyle başlar. ${c.year}${c.hSfx} yılı ${c.totalYearDays} gündür ve ${c.isLeap?'artık yıl':'normal yıl'}dır. Suudi Arabistan'da kullanılan Ümmülkura takvimi, Ramazan, Ramazan Bayramı ve Kurban Bayramı gibi İslami olayları belirlemek için kullanılan hesaplanmış bir ay takvimidir.`,
          footer: c => `${c.year}${c.hSfx} hicri takvimi tüm ayları ve karşılık gelen miladi tarihleri göstererek İslami olayları takip etmenize ve hicri tarihi Suudi Arabistan'da kullanılan Ümmülkura takvimine göre kesin şekilde bilmenize yardımcı olur. Ayrıca herhangi bir hicri aya veya güne kolayca ulaşabilir ya da hicri-miladi dönüştürücümüzü kullanabilirsiniz.`,
          faq: c => [
              [`${c.year}${c.hSfx} hicri yılı kaç gündür?`, `${c.totalYearDays} gün.`],
              [`${c.year}${c.hSfx} artık yıl mı?`, c.isLeap?`Evet, ${c.year}${c.hSfx} artık yıldır ve 355 gündür.`:`Hayır, ${c.year}${c.hSfx} normal yıldır ve 354 gündür.`],
              [`Hicri takvim kaç aydan oluşur?`, `12 ay, Muharrem'den Zilhicce'ye kadar.`]
          ],
          headline: c => `${c.year}${c.hSfx} Hicri Takvimi`,
          meta_desc: c => `${c.year}${c.hSfx} yılının tam hicri takvimi — 12 ay ve ${c.country} ülkesinde Ümmülkura takvimine göre miladi karşılıkları.`,
          meta_title: c => `Hicri Takvim ${c.year}${c.hSfx}` },
    ur: { home:'ہوم', cal:'ہجری کیلنڈر', faq_title:'❓ اکثر پوچھے جانے والے سوالات', seo_title:'🌙 ہجری کیلنڈر کے بارے میں',
          site:'اوقاتِ نماز اور ہجری کیلنڈر',
          card_labels:['سال','کل دن','سال کی قسم','مہینوں کی تعداد'],
          months_val:'12 مہینے', days_word:'دن',
          leap_yes: d => `لیپ سال (${d} دن)`, leap_no: d => `عام سال (${d} دن)`,
          leap_text:(y,d)=>y?`لیپ سال`:`عام سال`,
          th:['مہینہ','آغاز (عیسوی)','اختتام (عیسوی)','دن'],
          cta_today:'📌 آج کی ہجری تاریخ', cta_converter:'🔄 تاریخ کنورٹر',
          cta_month: (mn, y) => `🌙 ${mn} ${y} کا کیلنڈر دیکھیں`,
          title: c => `${c.year}${c.hSfx} کا مکمل ہجری کیلنڈر — عیسوی تاریخوں کے ساتھ`,
          intro: c => `یہ کیلنڈر ${c.year}${c.hSfx} کے تمام ہجری مہینے ${c.country} میں ام القری کیلنڈر کے مطابق عیسوی تاریخوں کے ساتھ دکھاتا ہے۔`,
          table_title: c => `📊 ${c.year}${c.hSfx} ہجری سال کے تمام مہینے:`,
          months_grid_title: c => `📅 ${c.year}${c.hSfx} کے مہینے دیکھیں`,
          today_in_year: (d, mn, y, hSfx, href) => `📌 آج کی ہجری تاریخ: <strong><a href="${href}">${d} ${mn} ${y}${hSfx}</a></strong>`,
          years_title: '📆 ہجری سال دیکھیں',
          years_current: ()=>'قریبی سال:',
          years_active_suffix: '',
          years_all_link: '→ مکمل ہجری کیلنڈر دیکھیں',
          seo_text: c => `ہجری کیلنڈر محرم سے ذی الحجہ تک 12 مہینوں پر مشتمل ہے۔ یہ چاند کی گردش پر مبنی ہے، جہاں ہر مہینہ نئے چاند کے دیدار سے شروع ہوتا ہے۔ ${c.year}${c.hSfx} ${c.totalYearDays} دن کا ہے اور یہ ${c.isLeap?'لیپ سال':'عام سال'} ہے۔ سعودی عرب میں استعمال ہونے والا ام القری کیلنڈر ایک حسابی چاند کا کیلنڈر ہے جو رمضان، عید الفطر اور عید الاضحی جیسے اسلامی مواقع کا تعین کرتا ہے۔`,
          footer: c => `${c.year}${c.hSfx} کا یہ ہجری کیلنڈر تمام مہینے عیسوی تاریخوں کے ساتھ ظاہر کرتا ہے، جو سعودی عرب میں رائج ام القری کیلنڈر کے مطابق ہجری تاریخ کو درست طور پر جاننے اور اسلامی مواقع کا پیچھا کرنے میں مدد کرتا ہے۔ آپ کسی بھی ہجری مہینے یا دن تک آسانی سے پہنچ سکتے ہیں یا ہجری اور عیسوی کیلنڈر کے درمیان تاریخ کنورٹر استعمال کر سکتے ہیں۔`,
          faq: c => [
              [`${c.year}${c.hSfx} ہجری سال میں کتنے دن ہیں؟`, `${c.totalYearDays} دن۔`],
              [`کیا ${c.year}${c.hSfx} لیپ سال ہے؟`, c.isLeap?`ہاں، ${c.year}${c.hSfx} لیپ سال ہے جس میں 355 دن ہیں۔`:`نہیں، ${c.year}${c.hSfx} عام سال ہے جس میں 354 دن ہیں۔`],
              [`ہجری کیلنڈر میں کتنے مہینے ہوتے ہیں؟`, `12 مہینے، محرم سے ذی الحجہ تک۔`]
          ],
          headline: c => `${c.year}${c.hSfx} کا ہجری کیلنڈر`,
          meta_desc: c => `${c.year}${c.hSfx} کا مکمل ہجری کیلنڈر — تمام 12 مہینے اور ${c.country} میں ام القری کیلنڈر کے مطابق عیسوی تاریخیں۔`,
          meta_title: c => `ہجری کیلنڈر ${c.year}${c.hSfx}` },
    de: { home:'Startseite', cal:'Hidschri-Kalender', faq_title:'❓ Häufig gestellte Fragen', seo_title:'🌙 Über den Hidschri-Kalender',
          site:'Gebetszeiten & Hidschri-Kalender',
          card_labels:['Jahr','Tage gesamt','Jahrestyp','Monate'],
          months_val:'12 Monate', days_word:'Tage',
          leap_yes: d => `Schaltjahr (${d} Tage)`, leap_no: d => `Normales Jahr (${d} Tage)`,
          leap_text:(y,d)=>y?`ein Schaltjahr`:`ein normales Jahr`,
          th:['Monat','Beginn (gregorianisch)','Ende (gregorianisch)','Tage'],
          cta_today:'📌 Heutiges Hidschri-Datum', cta_converter:'🔄 Datumsumrechner',
          cta_month: (mn, y) => `🌙 Kalender für ${mn} ${y} anzeigen`,
          title: c => `Hidschri-Kalender für das Jahr ${c.year}${c.hSfx} — vollständig mit gregorianischen Daten`,
          intro: c => `Dieser Kalender zeigt alle Hidschri-Monate des Jahres ${c.year}${c.hSfx} mit ihren entsprechenden gregorianischen Daten gemäß dem Umm-al-Qura-Kalender in ${c.country}.`,
          table_title: c => `📊 Alle Monate des Hidschri-Jahres ${c.year}${c.hSfx}:`,
          months_grid_title: c => `📅 Monate von ${c.year}${c.hSfx} durchsuchen`,
          today_in_year: (d, mn, y, hSfx, href) => `📌 Heutiges Hidschri-Datum: <strong><a href="${href}">${d}. ${mn} ${y}${hSfx}</a></strong>`,
          years_title: '📆 Hidschri-Jahre durchsuchen',
          years_current: ()=>'Benachbarte Jahre:',
          years_active_suffix: '',
          years_all_link: '→ Vollständigen Hidschri-Kalender anzeigen',
          seo_text: c => `Der Hidschri-Kalender besteht aus 12 Monaten, beginnend mit Muharram und endend mit Dhū l-hidscha. Er basiert auf dem Mondzyklus, wobei jeder Monat mit der Sichtung der neuen Mondsichel beginnt. Das Jahr ${c.year}${c.hSfx} enthält ${c.totalYearDays} Tage und ist ${c.isLeap?'ein Schaltjahr':'ein normales Jahr'}. Der in Saudi-Arabien verwendete Umm-al-Qura-Kalender ist ein berechneter Mondkalender zur Bestimmung islamischer Anlässe wie Ramadan, Eid al-Fitr und Eid al-Adha.`,
          footer: c => `Dieser Hidschri-Kalender für ${c.year}${c.hSfx} zeigt alle Monate mit entsprechenden gregorianischen Daten und hilft Ihnen, islamische Anlässe zu verfolgen und das Hidschri-Datum genau gemäß dem in Saudi-Arabien verwendeten Umm-al-Qura-Kalender zu kennen. Sie können auch einfach zu jedem Hidschri-Monat oder -Tag navigieren oder unseren Datumsumrechner zwischen Hidschri- und gregorianischem Kalender verwenden.`,
          faq: c => [
              [`Wie viele Tage hat das Hidschri-Jahr ${c.year}${c.hSfx}?`, `${c.totalYearDays} Tage.`],
              [`Ist ${c.year}${c.hSfx} ein Schaltjahr?`, c.isLeap?`Ja, ${c.year}${c.hSfx} ist ein Schaltjahr mit 355 Tagen.`:`Nein, ${c.year}${c.hSfx} ist ein normales Jahr mit 354 Tagen.`],
              [`Wie viele Monate hat der Hidschri-Kalender?`, `12 Monate, von Muharram bis Dhū l-hidscha.`]
          ],
          headline: c => `Hidschri-Kalender für das Jahr ${c.year}${c.hSfx}`,
          meta_desc: c => `Vollständiger Hidschri-Kalender für ${c.year}${c.hSfx} mit allen 12 Monaten und entsprechenden gregorianischen Daten gemäß dem Umm-al-Qura-Kalender in ${c.country}.`,
          meta_title: c => `Hidschri-Kalender ${c.year}${c.hSfx}` },
    id: { home:'Beranda', cal:'Kalender Hijriah', faq_title:'❓ Pertanyaan yang Sering Diajukan', seo_title:'🌙 Tentang Kalender Hijriah',
          site:'Jadwal Sholat & Kalender Hijriah',
          card_labels:['Tahun','Total Hari','Jenis Tahun','Jumlah Bulan'],
          months_val:'12 bulan', days_word:'hari',
          leap_yes: d => `Tahun Kabisat (${d} hari)`, leap_no: d => `Tahun Biasa (${d} hari)`,
          leap_text:(y,d)=>y?`tahun kabisat`:`tahun biasa`,
          th:['Bulan','Awal (Masehi)','Akhir (Masehi)','Hari'],
          cta_today:'📌 Tanggal Hijriah Hari Ini', cta_converter:'🔄 Konversi Tanggal',
          cta_month: (mn, y) => `🌙 Lihat Kalender ${mn} ${y}`,
          title: c => `Kalender Hijriah Tahun ${c.year}${c.hSfx} — Lengkap dengan Tanggal Masehi`,
          intro: c => `Kalender ini menampilkan semua bulan Hijriah tahun ${c.year}${c.hSfx} beserta tanggal Masehi yang bertepatan, menurut kalender Umm al-Qura di ${c.country}.`,
          table_title: c => `📊 Semua Bulan Tahun Hijriah ${c.year}${c.hSfx}:`,
          months_grid_title: c => `📅 Jelajahi Bulan-bulan ${c.year}${c.hSfx}`,
          today_in_year: (d, mn, y, hSfx, href) => `📌 Tanggal Hijriah Hari Ini: <strong><a href="${href}">${d} ${mn} ${y}${hSfx}</a></strong>`,
          years_title: '📆 Jelajahi Tahun Hijriah',
          years_current: ()=>'Tahun terdekat:',
          years_active_suffix: '',
          years_all_link: '→ Lihat kalender Hijriah lengkap',
          seo_text: c => `Kalender Hijriah terdiri dari 12 bulan, mulai dari Muharram hingga Zulhijah. Didasarkan pada siklus bulan, di mana setiap bulan dimulai dengan terlihatnya hilal. Tahun ${c.year}${c.hSfx} memiliki ${c.totalYearDays} hari dan merupakan ${c.isLeap?'tahun kabisat':'tahun biasa'}. Kalender Umm al-Qura yang digunakan di Arab Saudi adalah kalender lunar terhitung yang digunakan untuk menentukan peristiwa Islam seperti Ramadan, Idul Fitri, dan Idul Adha.`,
          footer: c => `Kalender Hijriah tahun ${c.year}${c.hSfx} ini menampilkan semua bulan beserta tanggal Masehi yang bertepatan, membantu Anda mengikuti peristiwa Islam dan mengetahui tanggal Hijriah secara akurat menurut kalender Umm al-Qura yang digunakan di Arab Saudi. Anda juga dapat berpindah ke bulan atau hari Hijriah mana pun dengan mudah atau menggunakan alat konversi tanggal antara Hijriah dan Masehi.`,
          faq: c => [
              [`Berapa jumlah hari dalam tahun Hijriah ${c.year}${c.hSfx}?`, `${c.totalYearDays} hari.`],
              [`Apakah ${c.year}${c.hSfx} tahun kabisat?`, c.isLeap?`Ya, ${c.year}${c.hSfx} adalah tahun kabisat dengan 355 hari.`:`Tidak, ${c.year}${c.hSfx} adalah tahun biasa dengan 354 hari.`],
              [`Berapa jumlah bulan dalam kalender Hijriah?`, `12 bulan, dari Muharram hingga Zulhijah.`]
          ],
          headline: c => `Kalender Hijriah Tahun ${c.year}${c.hSfx}`,
          meta_desc: c => `Kalender Hijriah lengkap untuk ${c.year}${c.hSfx} dengan semua 12 bulan dan tanggal Masehi yang bertepatan, menurut kalender Umm al-Qura di ${c.country}.`,
          meta_title: c => `Kalender Hijriah ${c.year}${c.hSfx}` },
    es: { home:'Inicio', cal:'Calendario Hégira', faq_title:'❓ Preguntas frecuentes', seo_title:'🌙 Acerca del calendario Hégira',
          site:'Horarios de Oración y Calendario Hégira',
          card_labels:['Año','Total de días','Tipo de año','Meses'],
          months_val:'12 meses', days_word:'días',
          leap_yes: d => `Año bisiesto (${d} días)`, leap_no: d => `Año regular (${d} días)`,
          leap_text:(y,d)=>y?`un año bisiesto`:`un año regular`,
          th:['Mes','Inicio (Gregoriano)','Fin (Gregoriano)','Días'],
          cta_today:'📌 Fecha Hégira de hoy', cta_converter:'🔄 Convertidor de fechas',
          cta_month: (mn, y) => `🌙 Ver calendario de ${mn} ${y}`,
          title: c => `Calendario Hégira del año ${c.year}${c.hSfx} — completo con fechas gregorianas`,
          intro: c => `Este calendario muestra todos los meses del calendario Hégira del año ${c.year}${c.hSfx} con sus fechas gregorianas correspondientes, según el calendario Umm al-Qura en ${c.country}.`,
          table_title: c => `📊 Todos los meses del año Hégira ${c.year}${c.hSfx}:`,
          months_grid_title: c => `📅 Explorar meses de ${c.year}${c.hSfx}`,
          today_in_year: (d, mn, y, hSfx, href) => `📌 Fecha Hégira de hoy: <strong><a href="${href}">${d} ${mn} ${y}${hSfx}</a></strong>`,
          years_title: '📆 Explorar años Hégira',
          years_current: ()=>'Años cercanos:',
          years_active_suffix: '',
          years_all_link: '→ Ver el calendario Hégira completo',
          seo_text: c => `El calendario Hégira se compone de 12 meses, empezando por Muharram y terminando con Du al-Hiyya. Se basa en el ciclo lunar, donde cada mes comienza con el avistamiento de la luna nueva. El año ${c.year}${c.hSfx} contiene ${c.totalYearDays} días y es ${c.isLeap?'un año bisiesto':'un año regular'}. El calendario Umm al-Qura, utilizado en Arabia Saudí, es un calendario lunar calculado que se utiliza para determinar ocasiones islámicas como el Ramadán, Eid al-Fitr y Eid al-Adha.`,
          footer: c => `Este calendario Hégira para ${c.year}${c.hSfx} muestra todos los meses con sus fechas gregorianas correspondientes, ayudándote a seguir las ocasiones islámicas y conocer la fecha Hégira con precisión según el calendario Umm al-Qura utilizado en Arabia Saudí. También puedes ir fácilmente a cualquier mes o día Hégira, o usar nuestro convertidor de fechas entre el calendario Hégira y gregoriano.`,
          faq: c => [
              [`¿Cuántos días tiene el año Hégira ${c.year}${c.hSfx}?`, `${c.totalYearDays} días.`],
              [`¿Es ${c.year}${c.hSfx} un año bisiesto?`, c.isLeap?`Sí, ${c.year}${c.hSfx} es un año bisiesto con 355 días.`:`No, ${c.year}${c.hSfx} es un año regular con 354 días.`],
              [`¿Cuántos meses tiene el calendario Hégira?`, `12 meses, de Muharram a Du al-Hiyya.`]
          ],
          headline: c => `Calendario Hégira del año ${c.year}${c.hSfx}`,
          meta_desc: c => `Calendario Hégira completo de ${c.year}${c.hSfx} con los 12 meses y las fechas gregorianas correspondientes, según el calendario Umm al-Qura en ${c.country}.`,
          meta_title: c => `Calendario Hégira ${c.year}${c.hSfx}` },
    bn: { home:'হোম', cal:'হিজরি ক্যালেন্ডার', faq_title:'❓ সাধারণ জিজ্ঞাসা', seo_title:'🌙 হিজরি ক্যালেন্ডার সম্পর্কে',
          site:'নামাজের সময় ও হিজরি ক্যালেন্ডার',
          card_labels:['বছর','মোট দিন','বছরের ধরন','মাস সংখ্যা'],
          months_val:'১২ মাস', days_word:'দিন',
          leap_yes: d => `অধিবর্ষ (${d} দিন)`, leap_no: d => `সাধারণ বছর (${d} দিন)`,
          leap_text:(y,d)=>y?`একটি অধিবর্ষ`:`একটি সাধারণ বছর`,
          th:['মাস','শুরু (খ্রিস্টীয়)','শেষ (খ্রিস্টীয়)','দিন'],
          cta_today:'📌 আজকের হিজরি তারিখ', cta_converter:'🔄 তারিখ রূপান্তরকারী',
          cta_month: (mn, y) => `🌙 ${mn} ${y} এর ক্যালেন্ডার দেখুন`,
          title: c => `${c.year}${c.hSfx} সনের পূর্ণ হিজরি ক্যালেন্ডার — খ্রিস্টীয় তারিখ সহ`,
          intro: c => `এই ক্যালেন্ডারটি ${c.country}-এ উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী ${c.year}${c.hSfx} সনের সব হিজরি মাস এবং সেগুলোর সংশ্লিষ্ট খ্রিস্টীয় তারিখ প্রদর্শন করে।`,
          table_title: c => `📊 ${c.year}${c.hSfx} হিজরি বর্ষের সব মাস:`,
          months_grid_title: c => `📅 ${c.year}${c.hSfx} সনের মাস ব্রাউজ করুন`,
          today_in_year: (d, mn, y, hSfx, href) => `📌 আজকের হিজরি তারিখ: <strong><a href="${href}">${d} ${mn} ${y}${hSfx}</a></strong>`,
          years_title: '📆 হিজরি বছর ব্রাউজ করুন',
          years_current: ()=>'কাছাকাছি বছর:',
          years_active_suffix: '',
          years_all_link: '→ সম্পূর্ণ হিজরি ক্যালেন্ডার দেখুন',
          seo_text: c => `হিজরি ক্যালেন্ডার ১২টি মাস নিয়ে গঠিত — মুহররম থেকে জিলহজ পর্যন্ত। এটি চন্দ্রচক্রের উপর ভিত্তি করে গঠিত, প্রতিটি মাস নতুন চাঁদ দেখার মধ্য দিয়ে শুরু হয়। ${c.year}${c.hSfx} সনে ${c.totalYearDays} দিন রয়েছে এবং এটি ${c.isLeap?'একটি অধিবর্ষ':'একটি সাধারণ বছর'}। সৌদি আরবে ব্যবহৃত উম্ম আল-কুরা ক্যালেন্ডার একটি গণনাকৃত চন্দ্র ক্যালেন্ডার যা রমজান, ঈদুল ফিতর ও ঈদুল আযহার মতো ইসলামি উপলক্ষ নির্ধারণে ব্যবহৃত হয়।`,
          footer: c => `${c.year}${c.hSfx} সনের এই হিজরি ক্যালেন্ডার সব মাস খ্রিস্টীয় তারিখের সাথে দেখায়, যা আপনাকে সৌদি আরবে ব্যবহৃত উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী হিজরি তারিখ নির্ভুলভাবে জানতে এবং ইসলামি উপলক্ষ অনুসরণ করতে সাহায্য করে। আপনি যেকোনো হিজরি মাস বা দিনে সহজেই যেতে পারেন অথবা হিজরি ও খ্রিস্টীয় ক্যালেন্ডারের মধ্যে তারিখ রূপান্তরকারী ব্যবহার করতে পারেন।`,
          faq: c => [
              [`${c.year}${c.hSfx} হিজরি সনে কত দিন আছে?`, `${c.totalYearDays} দিন।`],
              [`${c.year}${c.hSfx} কি অধিবর্ষ?`, c.isLeap?`হ্যাঁ, ${c.year}${c.hSfx} একটি অধিবর্ষ যাতে ৩৫৫ দিন আছে।`:`না, ${c.year}${c.hSfx} একটি সাধারণ বছর যাতে ৩৫৪ দিন আছে।`],
              [`হিজরি ক্যালেন্ডারে কতটি মাস আছে?`, `১২ মাস, মুহররম থেকে জিলহজ পর্যন্ত।`]
          ],
          headline: c => `${c.year}${c.hSfx} সনের হিজরি ক্যালেন্ডার`,
          meta_desc: c => `${c.year}${c.hSfx} এর সম্পূর্ণ হিজরি ক্যালেন্ডার — সব ১২টি মাস এবং ${c.country}-এ উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী সংশ্লিষ্ট খ্রিস্টীয় তারিখ।`,
          meta_title: c => `হিজরি ক্যালেন্ডার ${c.year}${c.hSfx}` },
    ms: { home:'Laman Utama', cal:'Kalendar Hijrah', faq_title:'❓ Soalan Lazim', seo_title:'🌙 Mengenai Kalendar Hijrah',
          site:'Waktu Solat & Kalendar Hijrah',
          card_labels:['Tahun','Jumlah Hari','Jenis Tahun','Bilangan Bulan'],
          months_val:'12 bulan', days_word:'hari',
          leap_yes: d => `Tahun Lompat (${d} hari)`, leap_no: d => `Tahun Biasa (${d} hari)`,
          leap_text:(y,d)=>y?`tahun lompat`:`tahun biasa`,
          th:['Bulan','Mula (Masihi)','Tamat (Masihi)','Hari'],
          cta_today:'📌 Tarikh Hijrah Hari Ini', cta_converter:'🔄 Penukar Tarikh',
          cta_month: (mn, y) => `🌙 Lihat Kalendar ${mn} ${y}`,
          title: c => `Kalendar Hijrah Tahun ${c.year}${c.hSfx} — Lengkap dengan Tarikh Masihi`,
          intro: c => `Kalendar ini memaparkan semua bulan Hijrah bagi tahun ${c.year}${c.hSfx} dengan tarikh Masihi yang bersamaan, mengikut kalendar Umm al-Qura di ${c.country}.`,
          table_title: c => `📊 Semua Bulan Tahun Hijrah ${c.year}${c.hSfx}:`,
          months_grid_title: c => `📅 Layari Bulan-bulan ${c.year}${c.hSfx}`,
          today_in_year: (d, mn, y, hSfx, href) => `📌 Tarikh Hijrah Hari Ini: <strong><a href="${href}">${d} ${mn} ${y}${hSfx}</a></strong>`,
          years_title: '📆 Layari Tahun Hijrah',
          years_current: ()=>'Tahun berdekatan:',
          years_active_suffix: '',
          years_all_link: '→ Lihat kalendar Hijrah penuh',
          seo_text: c => `Kalendar Hijrah terdiri daripada 12 bulan bermula dengan Muharam dan berakhir dengan Zulhijah. Ia berdasarkan kitaran bulan, di mana setiap bulan bermula dengan kelihatan anak bulan. Tahun ${c.year}${c.hSfx} mengandungi ${c.totalYearDays} hari dan ia adalah ${c.isLeap?'tahun lompat':'tahun biasa'}. Kalendar Umm al-Qura yang digunakan di Arab Saudi ialah kalendar lunar yang dikira untuk menentukan peristiwa Islam seperti Ramadan, Aidilfitri dan Aidiladha.`,
          footer: c => `Kalendar Hijrah tahun ${c.year}${c.hSfx} ini memaparkan semua bulan bersama tarikh Masihi yang bersamaan, membantu anda mengikuti peristiwa Islam dan mengetahui tarikh Hijrah dengan tepat mengikut kalendar Umm al-Qura yang digunakan di Arab Saudi. Anda juga boleh beralih ke mana-mana bulan atau hari Hijrah dengan mudah atau menggunakan penukar tarikh antara kalendar Hijrah dan Masihi.`,
          faq: c => [
              [`Berapakah jumlah hari dalam tahun Hijrah ${c.year}${c.hSfx}?`, `${c.totalYearDays} hari.`],
              [`Adakah ${c.year}${c.hSfx} tahun lompat?`, c.isLeap?`Ya, ${c.year}${c.hSfx} ialah tahun lompat dengan 355 hari.`:`Tidak, ${c.year}${c.hSfx} ialah tahun biasa dengan 354 hari.`],
              [`Berapakah jumlah bulan dalam kalendar Hijrah?`, `12 bulan, dari Muharam hingga Zulhijah.`]
          ],
          headline: c => `Kalendar Hijrah Tahun ${c.year}${c.hSfx}`,
          meta_desc: c => `Kalendar Hijrah lengkap bagi ${c.year}${c.hSfx} dengan kesemua 12 bulan dan tarikh Masihi yang bersamaan, mengikut kalendar Umm al-Qura di ${c.country}.`,
          meta_title: c => `Kalendar Hijrah ${c.year}${c.hSfx}` }
};
function hyearUi(lang) { return _HYEAR_UI[lang] || _HYEAR_UI.en; }

// ========= تسميات واجهة صفحة الشهر الهجري (/hijri-calendar/{month-year}) لكلّ لغة =========
// c = { monthName, year, hSfx, gSfx, totalDays, isLeap, gFirstStr, gLastStr, gRange, country }
const _HMONTH_UI = {
    ar: { home:'الرئيسية', cal:'التقويم الهجري', site:'مواقيت الصلاة والتقويم الهجري',
          card_labels:['📅 عدد الأيام','🗓️ يبدأ','🗓️ ينتهي'],
          days_word_n:(n)=>`${n} يوماً`,
          section_info:'📋 معلومات الشهر', section_days:'📅 أيام هذا الشهر الهجري', section_links:'🔗 روابط مرتبطة',
          th_hijri:'التاريخ الهجري', th_greg:'التاريخ الميلادي',
          prev_label:'الشهر السابق', next_label:'الشهر التالي',
          link_convert:'🔄 تحويل التاريخ الهجري والميلادي', link_today:'📌 التاريخ الهجري اليوم',
          link_year:(y,hSfx)=>`📅 تقويم سنة ${y}${hSfx}`,
          link_moon:'🌙 حالة القمر اليوم',
          today_in_month:(d,mn,y,hSfx,href)=>`📌 اليوم الحالي في شهر ${mn} ${y}${hSfx}: <strong><a href="${href}">${d} ${mn}</a></strong>`,
          day_row_title:(hDate,gDate)=>`التاريخ الهجري ${hDate} الموافق ${gDate}`,
          title:c=>`التقويم الهجري لشهر ${c.monthName} ${c.year}${c.hSfx} (${c.totalDays} يوماً)`,
          subtitle:c=>`يوافق الفترة من ${c.gFirstStr} إلى ${c.gLastStr} حسب تقويم أم القرى`,
          days_summary:c=>`📅 عدد أيام شهر ${c.monthName} ${c.year}${c.hSfx} هو ${c.totalDays} يوماً.`,
          other_months_title:c=>`🌙 التقويم الهجري لعام ${c.year}${c.hSfx} — جميع الأشهر`,
          other_months_active_suffix:' (الحالي)',
          years_title:'📆 تصفّح السنوات الهجرية',
          years_current:()=>'سنوات قريبة:',
          years_active_suffix:'',
          years_all_link:'→ عرض التقويم الهجري الكامل',
          footer:c=>`يعرض هذا التقويم جميع أيام شهر ${c.monthName} ${c.year}${c.hSfx} مع ما يقابلها بالتاريخ الميلادي بدقة حسب تقويم أم القرى، مما يساعدك على متابعة التاريخ الهجري والمناسبات الإسلامية بسهولة. يمكنك أيضًا معرفة <a href="${c.todayUrl}">التاريخ الهجري اليوم</a> أو تصفح <a href="${c.yearUrl}">التقويم الهجري الكامل لعام ${c.year}${c.hSfx}</a> أو الانتقال إلى أي يوم داخل الشهر.`,
          headline:c=>`التقويم الهجري لشهر ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`التقويم الهجري الكامل لشهر ${c.monthName} ${c.year}${c.hSfx} مع التاريخ الميلادي لكل يوم حسب تقويم أم القرى.`,
          meta_title:c=>`التقويم الهجري لشهر ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_name:c=>`جدول أيام شهر ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_desc:c=>`جدول يوضح الأيام الهجرية لشهر ${c.monthName} ${c.year}${c.hSfx} مع ما يقابلها من التاريخ الميلادي.`,
          about:c=>`التقويم الهجري لشهر ${c.monthName} ${c.year}${c.hSfx}`,
          faq:c=>[
              [`كم عدد أيام شهر ${c.monthName} ${c.year}${c.hSfx}؟`, `عدد أيام شهر ${c.monthName} ${c.year}${c.hSfx} هو ${c.totalDays} يوماً.`],
              [`متى يبدأ شهر ${c.monthName} ${c.year}${c.hSfx}؟`, `يبدأ شهر ${c.monthName} ${c.year}${c.hSfx} يوم ${c.gFirstStr}${c.gSfx} حسب تقويم أم القرى.`],
              [`متى ينتهي شهر ${c.monthName} ${c.year}${c.hSfx}؟`, `ينتهي شهر ${c.monthName} ${c.year}${c.hSfx} يوم ${c.gLastStr}${c.gSfx} حسب تقويم أم القرى.`]
          ] },
    en: { home:'Home', cal:'Hijri Calendar', site:'Prayer Times & Hijri Calendar',
          card_labels:['📅 Days Count','🗓️ Starts','🗓️ Ends'],
          days_word_n:(n)=>`${n} days`,
          section_info:'📋 Month Information', section_days:'📅 Days of This Hijri Month', section_links:'🔗 Related Links',
          th_hijri:'Hijri Date', th_greg:'Gregorian Date',
          prev_label:'Previous Month', next_label:'Next Month',
          link_convert:'🔄 Convert Hijri ↔ Gregorian', link_today:'📌 Today\'s Hijri Date',
          link_year:(y,hSfx)=>`📅 Year ${y}${hSfx} Calendar`,
          link_moon:'🌙 Moon Today',
          today_in_month:(d,mn,y,hSfx,href)=>`📌 Today in ${mn} ${y}${hSfx}: <strong><a href="${href}">${d} ${mn}</a></strong>`,
          day_row_title:(hDate,gDate)=>`Hijri date ${hDate} equivalent to ${gDate}`,
          title:c=>`Hijri Calendar: ${c.monthName} ${c.year}${c.hSfx} (${c.totalDays} days)`,
          subtitle:c=>`Covers ${c.gFirstStr} to ${c.gLastStr} per the Umm al-Qura calendar`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} contains ${c.totalDays} days.`,
          other_months_title:c=>`🌙 Hijri Calendar for ${c.year}${c.hSfx} — All Months`,
          other_months_active_suffix:' (current)',
          years_title:'📆 Browse Hijri Years',
          years_current:()=>'Nearby years:',
          years_active_suffix:'',
          years_all_link:'→ View Full Hijri Calendar',
          footer:c=>`This calendar lists every day of ${c.monthName} ${c.year}${c.hSfx} with its Gregorian equivalent per the Umm al-Qura calendar, helping you track the Hijri date and Islamic occasions easily. You can also check <a href="${c.todayUrl}">today's Hijri date</a>, browse the <a href="${c.yearUrl}">full Hijri calendar for ${c.year}${c.hSfx}</a>, or jump to any day within the month.`,
          headline:c=>`Hijri Calendar: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Full Hijri calendar for ${c.monthName} ${c.year}${c.hSfx} with Gregorian date for each day, per the Umm al-Qura calendar.`,
          meta_title:c=>`Hijri Calendar: ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_name:c=>`Days of ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_desc:c=>`Table showing the Hijri days of ${c.monthName} ${c.year}${c.hSfx} with their Gregorian equivalents.`,
          about:c=>`Hijri Calendar for ${c.monthName} ${c.year}${c.hSfx}`,
          faq:c=>[
              [`How many days are in ${c.monthName} ${c.year}${c.hSfx}?`, `${c.monthName} ${c.year}${c.hSfx} has ${c.totalDays} days.`],
              [`When does ${c.monthName} ${c.year}${c.hSfx} begin?`, `${c.monthName} ${c.year}${c.hSfx} begins on ${c.gFirstStr}${c.gSfx} according to the Umm al-Qura calendar.`],
              [`When does ${c.monthName} ${c.year}${c.hSfx} end?`, `${c.monthName} ${c.year}${c.hSfx} ends on ${c.gLastStr}${c.gSfx} according to the Umm al-Qura calendar.`]
          ] },
    fr: { home:'Accueil', cal:'Calendrier hégirien', site:'Horaires de prière et calendrier hégirien',
          card_labels:['📅 Nombre de jours','🗓️ Début','🗓️ Fin'],
          days_word_n:(n)=>`${n} jours`,
          section_info:'📋 Informations sur le mois', section_days:'📅 Jours de ce mois hégirien', section_links:'🔗 Liens associés',
          th_hijri:'Date hégirienne', th_greg:'Date grégorienne',
          prev_label:'Mois précédent', next_label:'Mois suivant',
          link_convert:'🔄 Convertir hégirien ↔ grégorien', link_today:'📌 Date hégirienne d\'aujourd\'hui',
          link_year:(y,hSfx)=>`📅 Calendrier de l'an ${y}${hSfx}`,
          link_moon:'🌙 État de la lune aujourd\'hui',
          today_in_month:(d,mn,y,hSfx,href)=>`📌 Aujourd'hui dans ${mn} ${y}${hSfx} : <strong><a href="${href}">${d} ${mn}</a></strong>`,
          day_row_title:(hDate,gDate)=>`Date hégirienne ${hDate} correspondant au ${gDate}`,
          title:c=>`Calendrier hégirien : ${c.monthName} ${c.year}${c.hSfx} (${c.totalDays} jours)`,
          subtitle:c=>`Couvre du ${c.gFirstStr} au ${c.gLastStr} selon le calendrier Umm al-Qura`,
          days_summary:c=>`📅 Le mois de ${c.monthName} ${c.year}${c.hSfx} compte ${c.totalDays} jours.`,
          other_months_title:c=>`🌙 Calendrier hégirien de l'an ${c.year}${c.hSfx} — tous les mois`,
          other_months_active_suffix:' (actuel)',
          years_title:'📆 Parcourir les années hégiriennes',
          years_current:()=>'Années proches :',
          years_active_suffix:'',
          years_all_link:'→ Voir le calendrier hégirien complet',
          footer:c=>`Ce calendrier répertorie tous les jours du mois de ${c.monthName} ${c.year}${c.hSfx} avec leur équivalent grégorien selon le calendrier Umm al-Qura, vous aidant à suivre la date hégirienne et les occasions islamiques facilement. Vous pouvez aussi consulter <a href="${c.todayUrl}">la date hégirienne d'aujourd'hui</a>, parcourir le <a href="${c.yearUrl}">calendrier hégirien complet de l'an ${c.year}${c.hSfx}</a>, ou accéder à n'importe quel jour du mois.`,
          headline:c=>`Calendrier hégirien : ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Calendrier hégirien complet de ${c.monthName} ${c.year}${c.hSfx} avec la date grégorienne de chaque jour, selon le calendrier Umm al-Qura.`,
          meta_title:c=>`Calendrier hégirien : ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_name:c=>`Jours de ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_desc:c=>`Tableau des jours hégiriens de ${c.monthName} ${c.year}${c.hSfx} avec leurs équivalents grégoriens.`,
          about:c=>`Calendrier hégirien du mois de ${c.monthName} ${c.year}${c.hSfx}`,
          faq:c=>[
              [`Combien de jours compte ${c.monthName} ${c.year}${c.hSfx} ?`, `${c.monthName} ${c.year}${c.hSfx} compte ${c.totalDays} jours.`],
              [`Quand commence ${c.monthName} ${c.year}${c.hSfx} ?`, `${c.monthName} ${c.year}${c.hSfx} commence le ${c.gFirstStr}${c.gSfx} selon le calendrier Umm al-Qura.`],
              [`Quand se termine ${c.monthName} ${c.year}${c.hSfx} ?`, `${c.monthName} ${c.year}${c.hSfx} se termine le ${c.gLastStr}${c.gSfx} selon le calendrier Umm al-Qura.`]
          ] },
    tr: { home:'Ana Sayfa', cal:'Hicri Takvim', site:'Namaz Vakitleri ve Hicri Takvim',
          card_labels:['📅 Gün Sayısı','🗓️ Başlangıç','🗓️ Bitiş'],
          days_word_n:(n)=>`${n} gün`,
          section_info:'📋 Ay Bilgileri', section_days:'📅 Bu Hicri Ayın Günleri', section_links:'🔗 İlgili Bağlantılar',
          th_hijri:'Hicri Tarih', th_greg:'Miladi Tarih',
          prev_label:'Önceki Ay', next_label:'Sonraki Ay',
          link_convert:'🔄 Hicri ↔ Miladi Dönüştür', link_today:'📌 Bugünün Hicri Tarihi',
          link_year:(y,hSfx)=>`📅 ${y}${hSfx} Yılı Takvimi`,
          link_moon:'🌙 Bugün Ay Durumu',
          today_in_month:(d,mn,y,hSfx,href)=>`📌 ${mn} ${y}${hSfx} ayındaki bugün: <strong><a href="${href}">${d} ${mn}</a></strong>`,
          day_row_title:(hDate,gDate)=>`Hicri tarih ${hDate}, ${gDate} tarihine karşılık gelir`,
          title:c=>`Hicri Takvim: ${c.monthName} ${c.year}${c.hSfx} (${c.totalDays} gün)`,
          subtitle:c=>`${c.gFirstStr} ile ${c.gLastStr} tarihleri arasını kapsar (Ümmülkura takvimine göre)`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} ayı ${c.totalDays} gündür.`,
          other_months_title:c=>`🌙 ${c.year}${c.hSfx} Yılı Hicri Takvimi — Tüm Aylar`,
          other_months_active_suffix:' (güncel)',
          years_title:'📆 Hicri Yıllara Gözat',
          years_current:()=>'Yakın yıllar:',
          years_active_suffix:'',
          years_all_link:'→ Tam Hicri Takvimi Görüntüle',
          footer:c=>`Bu takvim, ${c.monthName} ${c.year}${c.hSfx} ayının her gününü miladi karşılığıyla Ümmülkura takvimine göre listeler ve hicri tarihi ile İslami münasebetleri kolayca takip etmenize yardımcı olur. <a href="${c.todayUrl}">Bugünün hicri tarihini</a> kontrol edebilir, <a href="${c.yearUrl}">${c.year}${c.hSfx} yılının tam hicri takvimini</a> görüntüleyebilir veya ay içindeki herhangi bir güne geçebilirsiniz.`,
          headline:c=>`Hicri Takvim: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`${c.monthName} ${c.year}${c.hSfx} için tam hicri takvim, her günün miladi tarihiyle, Ümmülkura takvimine göre.`,
          meta_title:c=>`Hicri Takvim: ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_name:c=>`${c.monthName} ${c.year}${c.hSfx} Günleri`,
          dataset_desc:c=>`${c.monthName} ${c.year}${c.hSfx} hicri günlerini miladi karşılıklarıyla gösteren tablo.`,
          about:c=>`${c.monthName} ${c.year}${c.hSfx} Hicri Takvimi`,
          faq:c=>[
              [`${c.monthName} ${c.year}${c.hSfx} ayı kaç gündür?`, `${c.monthName} ${c.year}${c.hSfx} ayı ${c.totalDays} gündür.`],
              [`${c.monthName} ${c.year}${c.hSfx} ne zaman başlar?`, `${c.monthName} ${c.year}${c.hSfx}, Ümmülkura takvimine göre ${c.gFirstStr}${c.gSfx} tarihinde başlar.`],
              [`${c.monthName} ${c.year}${c.hSfx} ne zaman biter?`, `${c.monthName} ${c.year}${c.hSfx}, Ümmülkura takvimine göre ${c.gLastStr}${c.gSfx} tarihinde biter.`]
          ] },
    ur: { home:'ہوم', cal:'ہجری کیلنڈر', site:'نماز کے اوقات اور ہجری کیلنڈر',
          card_labels:['📅 دنوں کی تعداد','🗓️ آغاز','🗓️ اختتام'],
          days_word_n:(n)=>`${n} دن`,
          section_info:'📋 مہینے کی معلومات', section_days:'📅 اس ہجری مہینے کے دن', section_links:'🔗 متعلقہ روابط',
          th_hijri:'ہجری تاریخ', th_greg:'عیسوی تاریخ',
          prev_label:'پچھلا مہینہ', next_label:'اگلا مہینہ',
          link_convert:'🔄 ہجری اور عیسوی تاریخ کی تبدیلی', link_today:'📌 آج کی ہجری تاریخ',
          link_year:(y,hSfx)=>`📅 ${y}${hSfx} کا کیلنڈر`,
          link_moon:'🌙 آج چاند کی حالت',
          today_in_month:(d,mn,y,hSfx,href)=>`📌 ${mn} ${y}${hSfx} میں آج کا دن: <strong><a href="${href}">${d} ${mn}</a></strong>`,
          day_row_title:(hDate,gDate)=>`ہجری تاریخ ${hDate} مطابق ${gDate}`,
          title:c=>`ہجری کیلنڈر: ${c.monthName} ${c.year}${c.hSfx} (${c.totalDays} دن)`,
          subtitle:c=>`${c.gFirstStr} سے ${c.gLastStr} تک (ام القری کیلنڈر کے مطابق)`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} میں ${c.totalDays} دن ہیں۔`,
          other_months_title:c=>`🌙 ${c.year}${c.hSfx} کا ہجری کیلنڈر — تمام مہینے`,
          other_months_active_suffix:' (موجودہ)',
          years_title:'📆 ہجری سالوں کی تصفّح',
          years_current:()=>'قریبی سال:',
          years_active_suffix:'',
          years_all_link:'→ مکمل ہجری کیلنڈر دیکھیں',
          footer:c=>`یہ کیلنڈر ${c.monthName} ${c.year}${c.hSfx} کے تمام دنوں کو ان کی عیسوی تاریخ کے ساتھ ام القری کیلنڈر کے مطابق درج کرتا ہے، جس سے آپ ہجری تاریخ اور اسلامی مواقع کی آسانی سے پیروی کر سکتے ہیں۔ آپ <a href="${c.todayUrl}">آج کی ہجری تاریخ</a> دیکھ سکتے ہیں، <a href="${c.yearUrl}">${c.year}${c.hSfx} کا مکمل ہجری کیلنڈر</a> براؤز کر سکتے ہیں، یا مہینے کے کسی بھی دن پر جا سکتے ہیں۔`,
          headline:c=>`ہجری کیلنڈر: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`${c.monthName} ${c.year}${c.hSfx} کا مکمل ہجری کیلنڈر، ہر دن کی عیسوی تاریخ کے ساتھ، ام القری کیلنڈر کے مطابق۔`,
          meta_title:c=>`ہجری کیلنڈر: ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_name:c=>`${c.monthName} ${c.year}${c.hSfx} کے دن`,
          dataset_desc:c=>`${c.monthName} ${c.year}${c.hSfx} کے ہجری دنوں کو ان کی عیسوی مطابقت کے ساتھ دکھانے والا جدول۔`,
          about:c=>`${c.monthName} ${c.year}${c.hSfx} کا ہجری کیلنڈر`,
          faq:c=>[
              [`${c.monthName} ${c.year}${c.hSfx} میں کتنے دن ہیں؟`, `${c.monthName} ${c.year}${c.hSfx} میں ${c.totalDays} دن ہیں۔`],
              [`${c.monthName} ${c.year}${c.hSfx} کب شروع ہوتا ہے؟`, `${c.monthName} ${c.year}${c.hSfx} ام القری کیلنڈر کے مطابق ${c.gFirstStr}${c.gSfx} کو شروع ہوتا ہے۔`],
              [`${c.monthName} ${c.year}${c.hSfx} کب ختم ہوتا ہے؟`, `${c.monthName} ${c.year}${c.hSfx} ام القری کیلنڈر کے مطابق ${c.gLastStr}${c.gSfx} کو ختم ہوتا ہے۔`]
          ] },
    de: { home:'Startseite', cal:'Hidschri-Kalender', site:'Gebetszeiten & Hidschri-Kalender',
          card_labels:['📅 Anzahl Tage','🗓️ Beginn','🗓️ Ende'],
          days_word_n:(n)=>`${n} Tage`,
          section_info:'📋 Monatsinformationen', section_days:'📅 Tage dieses Hidschri-Monats', section_links:'🔗 Verwandte Links',
          th_hijri:'Hidschri-Datum', th_greg:'Gregorianisches Datum',
          prev_label:'Vorheriger Monat', next_label:'Nächster Monat',
          link_convert:'🔄 Hidschri ↔ Gregorianisch umrechnen', link_today:'📌 Heutiges Hidschri-Datum',
          link_year:(y,hSfx)=>`📅 Kalender für das Jahr ${y}${hSfx}`,
          link_moon:'🌙 Mond heute',
          today_in_month:(d,mn,y,hSfx,href)=>`📌 Heute im ${mn} ${y}${hSfx}: <strong><a href="${href}">${d} ${mn}</a></strong>`,
          day_row_title:(hDate,gDate)=>`Hidschri-Datum ${hDate} entspricht ${gDate}`,
          title:c=>`Hidschri-Kalender: ${c.monthName} ${c.year}${c.hSfx} (${c.totalDays} Tage)`,
          subtitle:c=>`Umfasst den Zeitraum vom ${c.gFirstStr} bis zum ${c.gLastStr} gemäß dem Umm-al-Qura-Kalender`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} hat ${c.totalDays} Tage.`,
          other_months_title:c=>`🌙 Hidschri-Kalender für das Jahr ${c.year}${c.hSfx} — alle Monate`,
          other_months_active_suffix:' (aktuell)',
          years_title:'📆 Hidschri-Jahre durchsuchen',
          years_current:()=>'Nahegelegene Jahre:',
          years_active_suffix:'',
          years_all_link:'→ Vollständigen Hidschri-Kalender anzeigen',
          footer:c=>`Dieser Kalender listet alle Tage des Monats ${c.monthName} ${c.year}${c.hSfx} mit ihrem gregorianischen Äquivalent gemäß dem Umm-al-Qura-Kalender auf und hilft Ihnen, das Hidschri-Datum und islamische Anlässe einfach nachzuverfolgen. Sie können auch <a href="${c.todayUrl}">das heutige Hidschri-Datum</a> prüfen, den <a href="${c.yearUrl}">vollständigen Hidschri-Kalender für ${c.year}${c.hSfx}</a> durchsuchen oder zu einem beliebigen Tag des Monats springen.`,
          headline:c=>`Hidschri-Kalender: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Vollständiger Hidschri-Kalender für ${c.monthName} ${c.year}${c.hSfx} mit gregorianischem Datum für jeden Tag, gemäß dem Umm-al-Qura-Kalender.`,
          meta_title:c=>`Hidschri-Kalender: ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_name:c=>`Tage von ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_desc:c=>`Tabelle der Hidschri-Tage von ${c.monthName} ${c.year}${c.hSfx} mit ihren gregorianischen Entsprechungen.`,
          about:c=>`Hidschri-Kalender für ${c.monthName} ${c.year}${c.hSfx}`,
          faq:c=>[
              [`Wie viele Tage hat ${c.monthName} ${c.year}${c.hSfx}?`, `${c.monthName} ${c.year}${c.hSfx} hat ${c.totalDays} Tage.`],
              [`Wann beginnt ${c.monthName} ${c.year}${c.hSfx}?`, `${c.monthName} ${c.year}${c.hSfx} beginnt am ${c.gFirstStr}${c.gSfx} gemäß dem Umm-al-Qura-Kalender.`],
              [`Wann endet ${c.monthName} ${c.year}${c.hSfx}?`, `${c.monthName} ${c.year}${c.hSfx} endet am ${c.gLastStr}${c.gSfx} gemäß dem Umm-al-Qura-Kalender.`]
          ] },
    id: { home:'Beranda', cal:'Kalender Hijriah', site:'Jadwal Sholat & Kalender Hijriah',
          card_labels:['📅 Jumlah Hari','🗓️ Mulai','🗓️ Berakhir'],
          days_word_n:(n)=>`${n} hari`,
          section_info:'📋 Informasi Bulan', section_days:'📅 Hari-hari Bulan Hijriah Ini', section_links:'🔗 Tautan Terkait',
          th_hijri:'Tanggal Hijriah', th_greg:'Tanggal Masehi',
          prev_label:'Bulan Sebelumnya', next_label:'Bulan Berikutnya',
          link_convert:'🔄 Konversi Hijriah ↔ Masehi', link_today:'📌 Tanggal Hijriah Hari Ini',
          link_year:(y,hSfx)=>`📅 Kalender Tahun ${y}${hSfx}`,
          link_moon:'🌙 Kondisi Bulan Hari Ini',
          today_in_month:(d,mn,y,hSfx,href)=>`📌 Hari ini di ${mn} ${y}${hSfx}: <strong><a href="${href}">${d} ${mn}</a></strong>`,
          day_row_title:(hDate,gDate)=>`Tanggal Hijriah ${hDate} bertepatan dengan ${gDate}`,
          title:c=>`Kalender Hijriah: ${c.monthName} ${c.year}${c.hSfx} (${c.totalDays} hari)`,
          subtitle:c=>`Mencakup ${c.gFirstStr} hingga ${c.gLastStr} menurut kalender Umm al-Qura`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} memiliki ${c.totalDays} hari.`,
          other_months_title:c=>`🌙 Kalender Hijriah Tahun ${c.year}${c.hSfx} — Semua Bulan`,
          other_months_active_suffix:' (saat ini)',
          years_title:'📆 Jelajahi Tahun-tahun Hijriah',
          years_current:()=>'Tahun terdekat:',
          years_active_suffix:'',
          years_all_link:'→ Lihat Kalender Hijriah Lengkap',
          footer:c=>`Kalender ini menampilkan seluruh hari bulan ${c.monthName} ${c.year}${c.hSfx} beserta padanan Masehinya menurut kalender Umm al-Qura, membantu Anda mengikuti tanggal Hijriah dan momen-momen Islam dengan mudah. Anda juga dapat melihat <a href="${c.todayUrl}">tanggal Hijriah hari ini</a>, menjelajahi <a href="${c.yearUrl}">kalender Hijriah lengkap tahun ${c.year}${c.hSfx}</a>, atau menuju hari apa pun dalam bulan ini.`,
          headline:c=>`Kalender Hijriah: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Kalender Hijriah lengkap untuk ${c.monthName} ${c.year}${c.hSfx} dengan tanggal Masehi setiap hari, menurut kalender Umm al-Qura.`,
          meta_title:c=>`Kalender Hijriah: ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_name:c=>`Hari-hari ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_desc:c=>`Tabel yang menampilkan hari-hari Hijriah ${c.monthName} ${c.year}${c.hSfx} beserta padanannya dalam Masehi.`,
          about:c=>`Kalender Hijriah untuk ${c.monthName} ${c.year}${c.hSfx}`,
          faq:c=>[
              [`Berapa jumlah hari dalam ${c.monthName} ${c.year}${c.hSfx}?`, `${c.monthName} ${c.year}${c.hSfx} memiliki ${c.totalDays} hari.`],
              [`Kapan ${c.monthName} ${c.year}${c.hSfx} dimulai?`, `${c.monthName} ${c.year}${c.hSfx} dimulai pada ${c.gFirstStr}${c.gSfx} menurut kalender Umm al-Qura.`],
              [`Kapan ${c.monthName} ${c.year}${c.hSfx} berakhir?`, `${c.monthName} ${c.year}${c.hSfx} berakhir pada ${c.gLastStr}${c.gSfx} menurut kalender Umm al-Qura.`]
          ] },
    es: { home:'Inicio', cal:'Calendario Hégira', site:'Horarios de oración y calendario Hégira',
          card_labels:['📅 Número de días','🗓️ Inicio','🗓️ Fin'],
          days_word_n:(n)=>`${n} días`,
          section_info:'📋 Información del mes', section_days:'📅 Días de este mes Hégira', section_links:'🔗 Enlaces relacionados',
          th_hijri:'Fecha Hégira', th_greg:'Fecha gregoriana',
          prev_label:'Mes anterior', next_label:'Mes siguiente',
          link_convert:'🔄 Convertir Hégira ↔ Gregoriano', link_today:'📌 Fecha Hégira de hoy',
          link_year:(y,hSfx)=>`📅 Calendario del año ${y}${hSfx}`,
          link_moon:'🌙 Estado de la luna hoy',
          today_in_month:(d,mn,y,hSfx,href)=>`📌 Hoy en ${mn} ${y}${hSfx}: <strong><a href="${href}">${d} ${mn}</a></strong>`,
          day_row_title:(hDate,gDate)=>`Fecha Hégira ${hDate}, equivalente a ${gDate}`,
          title:c=>`Calendario Hégira: ${c.monthName} ${c.year}${c.hSfx} (${c.totalDays} días)`,
          subtitle:c=>`Abarca desde el ${c.gFirstStr} hasta el ${c.gLastStr} según el calendario Umm al-Qura`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} tiene ${c.totalDays} días.`,
          other_months_title:c=>`🌙 Calendario Hégira del año ${c.year}${c.hSfx} — todos los meses`,
          other_months_active_suffix:' (actual)',
          years_title:'📆 Explorar años Hégira',
          years_current:()=>'Años cercanos:',
          years_active_suffix:'',
          years_all_link:'→ Ver calendario Hégira completo',
          footer:c=>`Este calendario enumera todos los días de ${c.monthName} ${c.year}${c.hSfx} con su equivalente gregoriano según el calendario Umm al-Qura, ayudándole a seguir la fecha Hégira y las ocasiones islámicas con facilidad. También puede consultar <a href="${c.todayUrl}">la fecha Hégira de hoy</a>, explorar el <a href="${c.yearUrl}">calendario Hégira completo del año ${c.year}${c.hSfx}</a>, o ir a cualquier día del mes.`,
          headline:c=>`Calendario Hégira: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Calendario Hégira completo de ${c.monthName} ${c.year}${c.hSfx} con la fecha gregoriana de cada día, según el calendario Umm al-Qura.`,
          meta_title:c=>`Calendario Hégira: ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_name:c=>`Días de ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_desc:c=>`Tabla con los días Hégira de ${c.monthName} ${c.year}${c.hSfx} y sus equivalentes gregorianos.`,
          about:c=>`Calendario Hégira de ${c.monthName} ${c.year}${c.hSfx}`,
          faq:c=>[
              [`¿Cuántos días tiene ${c.monthName} ${c.year}${c.hSfx}?`, `${c.monthName} ${c.year}${c.hSfx} tiene ${c.totalDays} días.`],
              [`¿Cuándo comienza ${c.monthName} ${c.year}${c.hSfx}?`, `${c.monthName} ${c.year}${c.hSfx} comienza el ${c.gFirstStr}${c.gSfx} según el calendario Umm al-Qura.`],
              [`¿Cuándo termina ${c.monthName} ${c.year}${c.hSfx}?`, `${c.monthName} ${c.year}${c.hSfx} termina el ${c.gLastStr}${c.gSfx} según el calendario Umm al-Qura.`]
          ] },
    bn: { home:'হোম', cal:'হিজরি ক্যালেন্ডার', site:'নামাজের সময় ও হিজরি ক্যালেন্ডার',
          card_labels:['📅 দিনসংখ্যা','🗓️ শুরু','🗓️ শেষ'],
          days_word_n:(n)=>`${n} দিন`,
          section_info:'📋 মাসের তথ্য', section_days:'📅 এই হিজরি মাসের দিনগুলো', section_links:'🔗 সংশ্লিষ্ট লিংক',
          th_hijri:'হিজরি তারিখ', th_greg:'খ্রিস্টীয় তারিখ',
          prev_label:'আগের মাস', next_label:'পরের মাস',
          link_convert:'🔄 হিজরি ও খ্রিস্টীয় তারিখ রূপান্তর', link_today:'📌 আজকের হিজরি তারিখ',
          link_year:(y,hSfx)=>`📅 ${y}${hSfx} সনের ক্যালেন্ডার`,
          link_moon:'🌙 আজকের চাঁদের অবস্থা',
          today_in_month:(d,mn,y,hSfx,href)=>`📌 ${mn} ${y}${hSfx}-এর আজকের দিন: <strong><a href="${href}">${d} ${mn}</a></strong>`,
          day_row_title:(hDate,gDate)=>`হিজরি তারিখ ${hDate}, ${gDate}-এর সংশ্লিষ্ট`,
          title:c=>`হিজরি ক্যালেন্ডার: ${c.monthName} ${c.year}${c.hSfx} (${c.totalDays} দিন)`,
          subtitle:c=>`${c.gFirstStr} থেকে ${c.gLastStr} পর্যন্ত (উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী)`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} মাসে ${c.totalDays} দিন রয়েছে।`,
          other_months_title:c=>`🌙 ${c.year}${c.hSfx} সনের হিজরি ক্যালেন্ডার — সব মাস`,
          other_months_active_suffix:' (বর্তমান)',
          years_title:'📆 হিজরি সনসমূহ ব্রাউজ করুন',
          years_current:()=>'নিকটবর্তী সন:',
          years_active_suffix:'',
          years_all_link:'→ সম্পূর্ণ হিজরি ক্যালেন্ডার দেখুন',
          footer:c=>`এই ক্যালেন্ডার ${c.monthName} ${c.year}${c.hSfx} মাসের প্রতিটি দিন সংশ্লিষ্ট খ্রিস্টীয় তারিখসহ উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী প্রদর্শন করে, যা আপনাকে হিজরি তারিখ এবং ইসলামী উপলক্ষ সহজে অনুসরণ করতে সাহায্য করে। আপনি <a href="${c.todayUrl}">আজকের হিজরি তারিখ</a> দেখতে পারেন, <a href="${c.yearUrl}">${c.year}${c.hSfx} সনের সম্পূর্ণ হিজরি ক্যালেন্ডার</a> ব্রাউজ করতে পারেন, বা মাসের যেকোনো দিনে যেতে পারেন।`,
          headline:c=>`হিজরি ক্যালেন্ডার: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`${c.monthName} ${c.year}${c.hSfx}-এর সম্পূর্ণ হিজরি ক্যালেন্ডার প্রতিটি দিনের খ্রিস্টীয় তারিখসহ, উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী।`,
          meta_title:c=>`হিজরি ক্যালেন্ডার: ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_name:c=>`${c.monthName} ${c.year}${c.hSfx}-এর দিনগুলো`,
          dataset_desc:c=>`${c.monthName} ${c.year}${c.hSfx}-এর হিজরি দিনগুলো এবং তাদের খ্রিস্টীয় সমতুল্য দেখানো সারণি।`,
          about:c=>`${c.monthName} ${c.year}${c.hSfx} মাসের হিজরি ক্যালেন্ডার`,
          faq:c=>[
              [`${c.monthName} ${c.year}${c.hSfx} মাসে কত দিন আছে?`, `${c.monthName} ${c.year}${c.hSfx} মাসে ${c.totalDays} দিন আছে।`],
              [`${c.monthName} ${c.year}${c.hSfx} কখন শুরু হয়?`, `${c.monthName} ${c.year}${c.hSfx} উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী ${c.gFirstStr}${c.gSfx}-এ শুরু হয়।`],
              [`${c.monthName} ${c.year}${c.hSfx} কখন শেষ হয়?`, `${c.monthName} ${c.year}${c.hSfx} উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী ${c.gLastStr}${c.gSfx}-এ শেষ হয়।`]
          ] },
    ms: { home:'Laman Utama', cal:'Kalendar Hijrah', site:'Waktu Solat & Kalendar Hijrah',
          card_labels:['📅 Jumlah Hari','🗓️ Bermula','🗓️ Berakhir'],
          days_word_n:(n)=>`${n} hari`,
          section_info:'📋 Maklumat Bulan', section_days:'📅 Hari-hari Bulan Hijrah Ini', section_links:'🔗 Pautan Berkaitan',
          th_hijri:'Tarikh Hijrah', th_greg:'Tarikh Masihi',
          prev_label:'Bulan Sebelumnya', next_label:'Bulan Berikutnya',
          link_convert:'🔄 Tukar Hijrah ↔ Masihi', link_today:'📌 Tarikh Hijrah Hari Ini',
          link_year:(y,hSfx)=>`📅 Kalendar Tahun ${y}${hSfx}`,
          link_moon:'🌙 Keadaan Bulan Hari Ini',
          today_in_month:(d,mn,y,hSfx,href)=>`📌 Hari ini dalam ${mn} ${y}${hSfx}: <strong><a href="${href}">${d} ${mn}</a></strong>`,
          day_row_title:(hDate,gDate)=>`Tarikh Hijrah ${hDate} bersamaan dengan ${gDate}`,
          title:c=>`Kalendar Hijrah: ${c.monthName} ${c.year}${c.hSfx} (${c.totalDays} hari)`,
          subtitle:c=>`Meliputi ${c.gFirstStr} hingga ${c.gLastStr} mengikut kalendar Umm al-Qura`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} mempunyai ${c.totalDays} hari.`,
          other_months_title:c=>`🌙 Kalendar Hijrah Tahun ${c.year}${c.hSfx} — Semua Bulan`,
          other_months_active_suffix:' (semasa)',
          years_title:'📆 Layari Tahun-tahun Hijrah',
          years_current:()=>'Tahun berdekatan:',
          years_active_suffix:'',
          years_all_link:'→ Lihat Kalendar Hijrah Penuh',
          footer:c=>`Kalendar ini menyenaraikan semua hari bulan ${c.monthName} ${c.year}${c.hSfx} beserta padanan Masihinya mengikut kalendar Umm al-Qura, membantu anda mengikuti tarikh Hijrah dan peristiwa Islam dengan mudah. Anda boleh menyemak <a href="${c.todayUrl}">tarikh Hijrah hari ini</a>, melayari <a href="${c.yearUrl}">kalendar Hijrah penuh tahun ${c.year}${c.hSfx}</a>, atau pergi ke mana-mana hari dalam bulan ini.`,
          headline:c=>`Kalendar Hijrah: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Kalendar Hijrah lengkap bagi ${c.monthName} ${c.year}${c.hSfx} dengan tarikh Masihi bagi setiap hari, mengikut kalendar Umm al-Qura.`,
          meta_title:c=>`Kalendar Hijrah: ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_name:c=>`Hari-hari ${c.monthName} ${c.year}${c.hSfx}`,
          dataset_desc:c=>`Jadual yang memaparkan hari-hari Hijrah ${c.monthName} ${c.year}${c.hSfx} beserta padanan Masihinya.`,
          about:c=>`Kalendar Hijrah bagi ${c.monthName} ${c.year}${c.hSfx}`,
          faq:c=>[
              [`Berapakah jumlah hari dalam ${c.monthName} ${c.year}${c.hSfx}?`, `${c.monthName} ${c.year}${c.hSfx} mempunyai ${c.totalDays} hari.`],
              [`Bilakah ${c.monthName} ${c.year}${c.hSfx} bermula?`, `${c.monthName} ${c.year}${c.hSfx} bermula pada ${c.gFirstStr}${c.gSfx} mengikut kalendar Umm al-Qura.`],
              [`Bilakah ${c.monthName} ${c.year}${c.hSfx} berakhir?`, `${c.monthName} ${c.year}${c.hSfx} berakhir pada ${c.gLastStr}${c.gSfx} mengikut kalendar Umm al-Qura.`]
          ] }
};
function hmonthUi(lang) { return _HMONTH_UI[lang] || _HMONTH_UI.en; }

// 🆕 Round 11: Numeric zero-padded URL scheme (ISO-like). Old text-slug format fully removed.
//   /hijri-calendar/1447-11     (month)
//   /hijri-date/1447-11-05      (day)
const _pad2 = n => String(n).padStart(2, '0');

function hijriDayUrl(year, month, day) {
    const _ln  = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const base = (_ln === 'ar') ? '' : ('/' + _ln);
    return `${base}/hijri-date/${year}-${_pad2(month)}-${_pad2(day)}`;
}

function hijriMonthUrl(year, month) {
    const _ln  = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const base = (_ln === 'ar') ? '' : ('/' + _ln);
    return `${base}/hijri-calendar/${year}-${_pad2(month)}`;
}

/** يبني <ol class="breadcrumb-list"> بنفس تصميم city-breadcrumb لصفحات التقويم الهجري */
function _buildHijriBreadcrumbOl(items) {
    const parts = ['<ol class="breadcrumb-list">'];
    items.forEach((it, i) => {
        if (i > 0) parts.push('<li class="bc-sep" aria-hidden="true">›</li>');
        if (it.current) {
            parts.push(`<li class="bc-item bc-current" aria-current="page">${it.text}</li>`);
        } else {
            parts.push(`<li class="bc-item"><a class="bc-link" href="${it.href}">${it.text}</a></li>`);
        }
    });
    parts.push('</ol>');
    return parts.join('');
}
let _prevCurrentSeconds = null; // لرصد عبور وقت الصلاة بدقة الثواني
let adhanProgressRAF = null;   // requestAnimationFrame للشريط
let _cachedNearbyPlaces = [];  // كاش الأماكن القريبة لإعادة الرسم عند تغيير اللغة

// توجيه طلبات Nominatim:
// - localhost → عبر proxy السيرفر (يحل CORS في بيئة التطوير)
// - domain حقيقي → مباشرة من المتصفح (كل مستخدم له IP خاص، لا ضغط على السيرفر)
function nomUrl(url) {
    if (window.location.protocol === 'file:') return url;
    // دائماً عبر proxy الخادم (يحمي من rate-limit ويستفيد من كاش 24 ساعة)
    return url
        .replace('https://nominatim.openstreetmap.org/reverse?', '/api/geocode?type=reverse&')
        .replace('https://nominatim.openstreetmap.org/search?',  '/api/geocode?type=search&');
}

// ─────────────────────────────────────────────────────────────
// كاش localStorage للـ API (nominatim + open-meteo)
// يقلل الطلبات الخارجية عند زيارة نفس الموقع مرتين.
// fallback transparent: إذا فشل localStorage → fetch مباشر.
// ─────────────────────────────────────────────────────────────
// مفاتيح "revGeo*" تتوقّع object فيه .address — أيّ شيء بدونها نعتبره فشلاً (لا تخزين، لا قراءة).
// هذا يحمي من proxy fallback `[]`/`{}` على مضيف بطيء (render.com cold-start).
function _isEmptyJunkForKey(v, key) {
    if (v === null || v === undefined) return true;
    if (Array.isArray(v) && v.length === 0) return true;
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return true;
    if (typeof v === 'object' && /^revGeo/.test(key) && !v.address) return true;
    return false;
}
async function _cached(key, fetchFn, ttlMs) {
    // قراءة الكاش — نتجاهل أيّ قيمة فارغة/junk حتى لو لم تنتهِ TTL
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (Date.now() - parsed.t) < ttlMs && !_isEmptyJunkForKey(parsed.v, key)) {
                return parsed.v;
            }
        }
    } catch(e) { /* localStorage غير متاح؟ نتابع */ }
    // استدعاء المصدر الأصلي
    const value = await fetchFn();
    if (!_isEmptyJunkForKey(value, key)) {
        try {
            localStorage.setItem(key, JSON.stringify({ v: value, t: Date.now() }));
        } catch(e) { /* quota ممتلئ؟ نتجاهل بصمت */ }
    }
    return value;
}

// مفتاح كاش مبنيّ على الإحداثيات (4 منازل ≈ 11 متر)
function _coordKey(prefix, lat, lng, lang) {
    const la = Math.round(parseFloat(lat) * 10000) / 10000;
    const lo = Math.round(parseFloat(lng) * 10000) / 10000;
    return `${prefix}_${la}_${lo}${lang ? '_' + lang : ''}`;
}

// مساعد لبناء URL الصفحة حسب اللغة الحالية
function pageUrl(arabicPath) {
    if (window.location.protocol === 'file:') return arabicPath;
    const _ln = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const _clean = arabicPath.replace(/\.html$/, '');
    if (_ln === 'ar') return _clean;
    return '/' + _ln + _clean;
}

// ========= المسبحة الإلكترونية =========
const TASBIH_SEQUENCE    = ['سبحان الله', 'الحمد لله', 'الله أكبر'];
const TASBIH_SEQUENCE_EN = ['Subhan Allah', 'Alhamdulillah', 'Allahu Akbar'];
function getTasbihSequence() {
    return (typeof getCurrentLang === 'function' && getCurrentLang() === 'en')
        ? TASBIH_SEQUENCE_EN : TASBIH_SEQUENCE;
}
const TASBIH_EACH = 33;
let tasbihStep = 0;
let tasbihCount = 0;
let tasbihSessionTotal = 0;
let tasbihMode = 'auto';
let tasbihFreeCount = 0;
let tasbihFreeTotal = 0;

/* اهتزاز الجوال */
function tasbihVibrate() {
    if (navigator.vibrate) navigator.vibrate(30);
}

/* ---- وضع التسبيح التلقائي ---- */
function tasbihClick() {
    const btn = document.getElementById('tasbih-btn');
    if (btn.disabled) return; // مُعطّل أثناء الانتقال

    tasbihCount++;
    tasbihSessionTotal++;
    document.getElementById('tasbih-count').textContent = tasbihCount;
    document.getElementById('tasbih-session-total').textContent = tasbihSessionTotal;

    tasbihVibrate();

    // PERF: RAF بدل offsetWidth لإعادة تشغيل الأنيميشن بدون forced reflow
    btn.classList.remove('pulse');
    requestAnimationFrame(() => requestAnimationFrame(() => btn.classList.add('pulse')));

    tasbihUpdateProgress();

    if (tasbihCount >= TASBIH_EACH) {
        // أوقف الزر فوراً
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'default';
        setTimeout(() => tasbihNextStep(), 350);
    }
}

function tasbihNextStep() {
    const btn = document.getElementById('tasbih-btn');

    if (tasbihStep < TASBIH_SEQUENCE.length - 1) {
        btn.style.background = 'linear-gradient(135deg,#f59e0b,#d97706)';
        if (navigator.vibrate) navigator.vibrate([60, 80, 60]);
        setTimeout(() => {
            btn.style.background = '';
            tasbihStep++;
            tasbihCount = 0;
            tasbihUpdateAutoUI();
            // أعد تفعيل الزر
            btn.disabled = false;
            btn.style.opacity = '';
            btn.style.cursor = '';
        }, 700);
    } else {
        btn.style.background = 'linear-gradient(135deg,#8b5cf6,#6d28d9)';
        if (navigator.vibrate) navigator.vibrate([100, 60, 100, 60, 200]);
        setTimeout(() => {
            btn.style.background = '';
            tasbihStep = 0;
            tasbihCount = 0;
            tasbihUpdateAutoUI();
            // أعد تفعيل الزر
            btn.disabled = false;
            btn.style.opacity = '';
            btn.style.cursor = '';
        }, 1000);
    }
}

function tasbihUpdateAutoUI() {
    const seq = getTasbihSequence();
    document.getElementById('tasbih-count').textContent = tasbihCount;
    document.getElementById('tasbih-current-dhikr').textContent = seq[tasbihStep];
    seq.forEach((name, i) => {
        const el = document.getElementById('step-' + i);
        if (!el) return;
        el.classList.toggle('active', i === tasbihStep);
        el.classList.toggle('done', i < tasbihStep);
        const nameEl = el.querySelector('.tasbih-step-name');
        if (nameEl) nameEl.textContent = name;
    });
    tasbihUpdateProgress();
}

function tasbihUpdateProgress() {
    const fill  = document.getElementById('tasbih-progress');
    const label = document.getElementById('tasbih-progress-label');
    if (!fill) return;
    const pct = Math.min((tasbihCount / TASBIH_EACH) * 100, 100);
    fill.style.width = pct + '%';
    label.textContent = tasbihCount + ' / ' + TASBIH_EACH;
}

/* إعادة تفعيل الزر دائماً عند أي إعادة تعيين */
function tasbihEnableBtn() {
    const btn = document.getElementById('tasbih-btn');
    if (!btn) return;
    btn.disabled = false;
    btn.style.opacity = '';
    btn.style.cursor = '';
    btn.style.background = '';
}

/* تصفير العداد فقط (يحتفظ بإجمالي الجلسة) */
function tasbihResetCount() {
    tasbihStep = 0;
    tasbihCount = 0;
    tasbihEnableBtn();
    tasbihUpdateAutoUI();
}

/* تصفير الجلسة كاملة */
function tasbihReset() {
    tasbihStep = 0; tasbihCount = 0; tasbihSessionTotal = 0;
    tasbihEnableBtn();
    tasbihUpdateAutoUI();
    document.getElementById('tasbih-session-total').textContent = '0';
}

/* ---- وضع العداد المفتوح ---- */
function tasbihFreeClick() {
    tasbihFreeCount++;
    tasbihFreeTotal++;
    document.getElementById('tasbih-free-count').textContent = tasbihFreeCount;
    document.getElementById('tasbih-free-total').textContent = tasbihFreeTotal;
    tasbihVibrate();
    const btn = document.getElementById('tasbih-free-btn');
    // PERF: RAF بدل offsetWidth
    btn.classList.remove('pulse');
    requestAnimationFrame(() => requestAnimationFrame(() => btn.classList.add('pulse')));
}

/* تصفير العداد فقط */
function tasbihFreeReset() {
    tasbihFreeCount = 0;
    document.getElementById('tasbih-free-count').textContent = '0';
}

/* تصفير الجلسة كاملة */
function tasbihFreeResetAll() {
    tasbihFreeCount = 0;
    tasbihFreeTotal = 0;
    document.getElementById('tasbih-free-count').textContent = '0';
    document.getElementById('tasbih-free-total').textContent = '0';
}

/* ---- تبديل الوضع ---- */
function tasbihSwitchMode(mode) {
    tasbihMode = mode;
    document.getElementById('tasbih-mode-auto').classList.toggle('u-hidden', mode !== 'auto');
    document.getElementById('tasbih-mode-free').classList.toggle('u-hidden', mode !== 'free');
    document.getElementById('tab-auto').classList.toggle('active', mode === 'auto');
    document.getElementById('tab-free').classList.toggle('active', mode === 'free');
}

function initTasbih() {
    tasbihUpdateAutoUI();
}

// تحويل كود الدولة لعلم emoji
function countryCodeToFlag(code) {
    if (!code || code.length !== 2) return '🌍';
    return code.toUpperCase().split('').map(c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    ).join('');
}

// جلب المنطقة الزمنية من الإحداثيات (مع كاش 7 أيام — TZ لا تتغير عادة)
async function fetchTimezone(lat, lng) {
    const tz = await _cached(_coordKey('tz', lat, lng), async () => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&daily=weathercode&forecast_days=1`;
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);
            const data = await fetch(url, { signal: controller.signal })
                .then(r => r.json())
                .finally(() => clearTimeout(timer));
            if (data && data.utc_offset_seconds !== undefined) {
                return data.utc_offset_seconds / 3600;
            }
        } catch(e) {}
        return null; // null لن يُحفظ في الكاش
    }, 7 * 86400000);
    if (tz !== null && tz !== undefined) return tz;
    // احتياطي محسّن: أقرب نصف ساعة لخط الطول
    return Math.round((lng / 15) * 2) / 2;
}

// يقبل Latin Extended (ø/ü/ç/ā/…) لأسماء أوروبية (Tromsø, Zürich, São Paulo)
// ويرفض العربية/CJK. يُستخدم لاختيار أفضل "اسم إنجليزي" من نتائج Nominatim.
const _LATIN_NAME_RE = /^[A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF\s\-'.]+$/;
function _latinOr(name) { return (name && _LATIN_NAME_RE.test(name)) ? name : ''; }

// كاشف «حيّ/مقاطعة فرعيّة» — للتمييز بين المدن الحقيقيّة وبين أحياء تُصنَّف في OSM كـ city
//   مثال: Chiyoda-ku في طوكيو (addresstype='city' في OSM) لأنّ الأحياء الخاصّة بطوكيو لها
//   استقلاليّة بلديّة. لكن من منظور المستخدم هي أحياء داخل طوكيو، لا مدن مستقلّة.
// نَكتشف:
//   • CJK: 区 (ياباني/صيني ward) = U+533A، 구 (كوريّ gu) = U+AD6C
//   • رومنة: -ku/-gu في الاسم اللاتينيّ (Tokyo-ku, Chongno-gu)
//   • كلمات مفتاحيّة: Ward, Borough, Bezirk, Arrondissement, Kecamatan, Distrito, İlçe(si), Daerah
function _isWardLike(name) {
    if (!name) return false;
    const s = String(name);
    // CJK ward characters
    if (s.indexOf('\u533A') !== -1) return true; // 区 (Japanese/Chinese ward)
    if (s.indexOf('\uAD6C') !== -1) return true; // 구 (Korean gu)
    // Romanized ward suffixes
    if (/[-\s]ku$/i.test(s)) return true;
    if (/[-\s]gu$/i.test(s)) return true;
    // Western/Turkish/Malay/Indonesian ward indicators
    if (/\b(Ward|Bezirk|Arrondissement|Distrito|Kecamatan|Daerah)\b/i.test(s)) return true;
    // Turkish: "ilçe" / "ilçesi" — `\b` لا يعمل مع İ/ç، نعتمد على حدود بيضاء/نهاية
    if (/(^|[\s\-,])[Iİ]l[çc]e(si)?($|[\s\-,])/i.test(s)) return true;
    return false;
}

/**
 * يُحدِّد إذا كان الاسم يبدو كتقسيم إداريّ (محافظة/منطقة/مقاطعة) أو شارع/طريق/حي/ضاحية
 * في أيّ من الـ10 لغات المدعومة (ar/en/fr/tr/ur/de/id/es/bn/ms).
 * يُستخدم في فلترة اقتراحات البحث لعرض **المدن والقرى فقط**.
 * ملاحظة: "Desa/Kampung/Village/Villaggio" تبقى مقبولة (قرى حقيقيّة).
 */
function _isAdminOrStreetLike(name) {
    if (!name) return false;
    const s = String(name).trim();

    // ── Arabic (ar) ─── prefix form, followed by whitespace
    if (/^(محافظة|منطقة|مقاطعة|ولاية|إمارة|حي|شارع|طريق|مخيم|ضاحية|ناحية|قضاء|بلدية)\s/.test(s)) return true;

    // ── Urdu (ur) ─── prefix or space-separated
    if (/(?:^|\s)(صوبہ|ضلع|تحصیل|محلہ|گلی|سڑک|علاقہ)(?:$|\s)/.test(s)) return true;

    // ── Bengali (bn) ─── contains these suffix/prefix terms
    if (/(জেলা|উপজেলা|বিভাগ|মহকুমা|মহল্লা|সড়ক|রোড|এভিনিউ|থানা)/.test(s)) return true;

    // ── Latin-script languages (en, fr, tr, de, id, es, ms) ─── word-boundary match
    // Admin divisions
    if (/\b(Governorate|Province|Region|District|Sub-?District|County|Prefecture|State|Emirate|Municipality|Township|Parish|Canton|Oblast|Raion)\b/i.test(s)) return true;
    // Neighborhoods / suburbs / quarters (English)
    if (/\b(Neighbou?rhood|Quarter|Suburb)\b/i.test(s)) return true;
    // Streets / roads (English)
    if (/\b(Street|Road|Avenue|Boulevard|Lane|Drive|Way|Plaza|Highway|Freeway|Motorway|Expressway)\b/i.test(s)) return true;
    // French
    if (/\b(Gouvernorat|Préfecture|Département|Arrondissement|Quartier|Faubourg|Banlieue|Rue|Chemin|Allée|Impasse|Cours|Ruelle)\b/i.test(s)) return true;
    // Turkish — İ/ı/ç تحتاج تعامل خاص — Köyü (village) & Beldesi (town) مقبولتان فلا تُرفَضان
    if (/(^|[\s\-,])(Vilayeti|[Iİ]li|[Iİ]l[çc]esi|Mahallesi|Soka[ğg][iı]|Caddesi|Bulvar[iı]|Yolu|Bölge(si)?|Eyaleti)($|[\s\-,])/i.test(s)) return true;
    // German — أسماء الشوارع تُركَّب كلمة واحدة (Hauptstraße, Alexanderplatz…)، لذا نطابق لاحقة أيضاً
    if (/\b(Bezirk|Kreis|Landkreis|Regierungsbezirk|Bundesland|Stadtteil|Stadtviertel|Viertel|Vorort|Chaussee)\b/i.test(s)) return true;
    // `\w` لا يُغطّي Unicode في JS بدون علم `u`؛ نستخدم [^\s\-,]* لتمرير ö/ü/ä…
    if (/(?:^|[\s\-])[^\s\-,]*(?:stra(?:ß|ss)e|platz|allee|damm|gasse|weg|chaussee|ufer)(?:$|[\s\-,])/i.test(s)) return true;
    // Indonesian / Malay (shared Malay family) — Desa/Kampung/Kampong = village → DON'T reject
    if (/\b(Provinsi|Wilayah|Kabupaten|Kecamatan|Kelurahan|Daerah|Banjaran|Mukim|Jalan|Lorong|Lebuh|Persiaran|Lebuhraya)\b/i.test(s)) return true;
    // Spanish
    if (/\b(Provincia|Departamento|Distrito|Comarca|Condado|Barrio|Colonia|Urbanización|Fraccionamiento|Calle|Avenida|Carrera|Paseo|Camino|Ronda|Autopista|Autovía)\b/i.test(s)) return true;

    return false;
}

// إنشاء slug لاسم المدينة (للـ URL)
// NFD يُفكِّك الحروف ذات العلامات (ã → a+◌̃) فيُحتَفَظ بالحرف الأساسيّ بعد حذف العلامات.
// مثال: "São Paulo" → "sao-paulo" (بدل "so-paulo" المُشوَّه في النسخة القديمة).
function makeSlug(englishName, lat, lng) {
    const latin = (englishName || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]+/g, '')
        .trim()
        .replace(/\s+/g, '-');
    if (latin.length >= 2) return latin;
    // للمدن بأسماء غير لاتينية: استخدام الإحداثيات مع prefix "loc-" ليبدأ بحرف
    // (يطابق regex الراوتر الموحَّد: /prayer-times-in-([a-z][a-z0-9.-]+))
    const la = Math.abs(lat).toFixed(1) + (lat >= 0 ? 'n' : 's');
    const lo = Math.abs(lng).toFixed(1) + (lng >= 0 ? 'e' : 'w');
    return `loc-${la}-${lo}`;
}

// قراءة بيانات المدينة من URL عند تحميل الصفحة
// استخراج slug المدينة من الرابط الحالي
function getSlugFromURL() {
    // 🆕 Polish Round (F): دعم /time-left-until-prayer-in-{slug} — نعامله كصفحة مدينة لجلب الـ data
    const tlMatch = window.location.pathname.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?time-left-until-prayer-in-([a-z][a-z0-9-]+)$/);
    if (tlMatch) return tlMatch[1];
    // 🆕 Round 4 (Minimal): دعم /next-prayer-time-in-{slug}
    const nptMatch = window.location.pathname.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?next-prayer-time-in-([a-z][a-z0-9-]+)$/);
    if (nptMatch) return nptMatch[1];
    const pathMatch = window.location.pathname.match(/\/(?:en\/)?(?:prayer-times-in|qibla-in)-(.+?)(?:\.html)?$/);
    if (pathMatch) return pathMatch[1];
    const hashMatch = window.location.hash.match(/#prayer-times-in-([^?]+)/);
    if (hashMatch) return hashMatch[1];
    if (/\/(?:en\/)?today-hijri-date$/.test(window.location.pathname)) return 'hijri-today';
    if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-date\/\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|30)$/.test(window.location.pathname)) return 'hijri-day';
    if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar\/\d{4}$/.test(window.location.pathname)) return 'hijri-year';
    if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar\/\d{4}-(?:0[1-9]|1[0-2])$/.test(window.location.pathname)) return 'hijri-month';
    // القمر: /moon-today أو /moon-today-in-{slug}[-{lat}-{lng}][/{YYYY-MM-DD}] — نعيد 'moon' كمفتاح جلسة
    //   لاستعادة موقع المستخدم (لاستمراريّة السياق عند الانتقال من صفحة المدينة).
    //   Round 12: نضيف دعم coord-suffix (-LAT-LNG) + تاريخ اختياريّ.
    if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today(?:-in-[a-z][a-z0-9-]+(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?(?:\/\d{4}-\d{2}-\d{2})?)?$/.test(window.location.pathname)) return 'moon';
    return null;
}

// التنقل إلى صفحة القبلة المخصصة للمدينة
function navigateToQibla(lat, lng, city, country, englishName = '', countryCode = '') {
    const slug = makeSlug(englishName || city, lat, lng);
    sessionStorage.setItem(`city_${slug}`, JSON.stringify({ lat, lng, name: city, country, englishName, countryCode, timezone: currentTimezone, _v: 2 }));
    if (window.location.protocol === 'file:') {
        window.location.hash = `qibla-in-${slug}`;
    } else {
        // Clean URL (/qibla-in-{slug}) for known cities; long-tail fallback keeps coords.
        window.location.href = (typeof _buildQiblaCityUrl === 'function')
            ? _buildQiblaCityUrl(englishName || city, lat, lng, slug)
            : pageUrl(`/qibla-in-${slug}.html`);
    }
}

// geocoding احتياطي عند فتح رابط مباشر (بدون sessionStorage)
async function geocodeSlug(slug) {
    // لغة المستخدم الحاليّة (لجلب اسم المدينة بلغته)
    const userLang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const needsLocalized = (userLang !== 'ar' && userLang !== 'en');
    // التحقّق من صلاحيّة النصّ حسب اللغة (نفس المنطق في fetchLocalizedCityName)
    const _hasArabicChar = (s) => /[\u0600-\u06FF]/.test(String(s || ''));
    const _hasUrduSpecific = (s) => /[\u067E\u0686\u0698\u06A9\u06AF\u0688\u0691\u0679\u06BA\u06CC\u06D2\u06C1]/.test(String(s || ''));
    const _isAcceptableScript = (s) => {
        if (!s) return false;
        if (!_hasArabicChar(s)) return true;
        return (userLang === 'ur') && _hasUrduSpecific(s);
    };
    const _pickLocalized = (addr) => {
        if (!addr) return '';
        return addr.city || addr.town || addr.village || '';
    };

    // slug بإحداثيات: loc-33.6n-7.6w (أو نمط قديم بدون prefix للتوافق مع روابط قديمة)
    const coordMatch = slug.match(/^(?:loc-)?(\d+\.?\d*)(n|s)-(\d+\.?\d*)(e|w)$/i);
    if (coordMatch) {
        const lat = parseFloat(coordMatch[1]) * (coordMatch[2].toLowerCase() === 's' ? -1 : 1);
        const lng = parseFloat(coordMatch[3]) * (coordMatch[4].toLowerCase() === 'w' ? -1 : 1);
        // 2 أو 3 طلبات بالتوازي: عربي + إنجليزي + (لغة المستخدم إن لزم) مع كاش 30 يوم
        const fetches = [
            _cached(_coordKey('revGeoFull', lat, lng, 'ar'), () =>
                fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar&namedetails=1`)).then(r=>r.json()).catch(()=>null),
                30 * 86400000),
            _cached(_coordKey('revGeoFull', lat, lng, 'en'), () =>
                fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)).then(r=>r.json()).catch(()=>null),
                30 * 86400000)
        ];
        if (needsLocalized) {
            fetches.push(_cached(_coordKey('revGeoFull', lat, lng, userLang), () =>
                fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${userLang}&namedetails=1`)).then(r=>r.json()).catch(()=>null),
                30 * 86400000));
        }
        const resolved = await Promise.all(fetches);
        const arData = resolved[0], enData = resolved[1], locData = needsLocalized ? resolved[2] : null;

        if (arData?.address) {
            const addr = arData.address;
            const enName = arData.namedetails?.['name:en']
                || enData?.address?.city || enData?.address?.town || enData?.address?.village || '';
            // الاسم الرئيسي (currentCity): أولوية للّغة الحاليّة إن توفّرت ومقبولة، ثمّ إنجليزي، ثمّ عربي
            let mainName = '';
            if (locData?.address) {
                const loc = _pickLocalized(locData.address);
                if (loc && _isAcceptableScript(loc)) mainName = loc;
            }
            if (!mainName && (userLang === 'en' || userLang === 'ar' || needsLocalized)) {
                // للمستخدم الإنجليزي أو عند فشل اللغة المحليّة → الإنجليزي
                if (userLang !== 'ar') {
                    mainName = enName || (enData?.address?.city || enData?.address?.town || enData?.address?.village || '');
                }
            }
            if (!mainName) {
                mainName = addr.city || addr.town || addr.village || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
            }
            return { lat, lng,
                name: mainName,
                country: addr.country || '',
                countryCode: (addr.country_code || '').toLowerCase(),
                englishName: enName
            };
        }
        return { lat, lng, name: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`, country: '', countryCode: '', englishName: '' };
    }
    // slug نصي: london → slug نفسه هو الاسم الإنجليزي
    const query = slug.replace(/-/g, ' ');
    // جلب بلغة المستخدم (إن لزم) بالإضافة للعربيّة
    const searchUrls = [
        nomUrl(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=ar&addressdetails=1&namedetails=1`)
    ];
    if (needsLocalized) {
        searchUrls.push(nomUrl(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=${userLang}&addressdetails=1&namedetails=1`));
    } else if (userLang === 'en') {
        searchUrls.push(nomUrl(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=en&addressdetails=1&namedetails=1`));
    }
    const searchResults = await Promise.all(searchUrls.map(u =>
        fetch(u).then(r => r.json()).catch(() => [])
    ));
    const arResults = searchResults[0] || [];
    const locResults = (searchResults[1] || []);
    if (arResults.length > 0) {
        const p = arResults[0], addr = p.address || {};
        const enName = p.namedetails?.['name:en'] || query;
        // الاسم الرئيسي بلغة المستخدم إن توفّر ومقبول
        let mainName = '';
        if (needsLocalized && locResults.length > 0) {
            const locP = locResults[0];
            const locAddr = locP.address || {};
            const candidate = locP.name || locAddr.city || locAddr.town || locAddr.village || '';
            if (candidate && _isAcceptableScript(candidate)) mainName = candidate;
        }
        if (!mainName && userLang === 'en' && locResults.length > 0) {
            const locP = locResults[0];
            mainName = locP.name || (locP.address && (locP.address.city || locP.address.town || locP.address.village)) || '';
        }
        if (!mainName) {
            mainName = p.name || addr.city || addr.town || addr.village || p.display_name.split(',')[0];
        }
        return {
            lat: parseFloat(p.lat), lng: parseFloat(p.lon),
            name: mainName,
            country: addr.country || '',
            countryCode: (addr.country_code || '').toLowerCase(),
            englishName: enName
        };
    }
    return null;
}

// Ward-fix migration helper: إذا كان sessionStorage القديم يحتوي على حيّ (مثل Chiyoda-ku
//   محفوظ بالإنجليزيّة "Chiyoda" بدون -ku واضح) نعيد اكتشاف الموقع.
// الخدعة: الاسم الإنجليزيّ "Chiyoda" لا يُظهر ward-ness، لكنّ namedetails تحتوي على:
//   name:ja=千代田区 (فيه 区)، name:ja-Latn=Chiyoda-ku (فيه -ku)، name:fr=Arrondissement de Chiyoda
//   فإن وُجد أيّ اسم ward-like في namedetails → نطلب zoom=8 للمدينة الأمّ (Tokyo).
async function _revalidateCachedCity(lat, lng, slug, expectedEn) {
    try {
        const resp = await fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=en&namedetails=1`))
            .then(r => r.json()).catch(() => null);
        if (!resp?.address) return;
        // افحص namedetails: إذا وجد أيّ اسم ward-like (بالـ 区/ku/구/Arrondissement/…) → حيّ
        const nd = resp.namedetails || {};
        const _anyWardLike = (() => {
            for (const k in nd) {
                if (_isWardLike(nd[k])) return true;
            }
            return _isWardLike(resp.name) || _isWardLike(resp.address?.city);
        })();
        let freshEn = '';
        if (_anyWardLike) {
            // اطلب zoom=8 للصعود إلى الأمّ (province/state)
            const parent = await fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=8&accept-language=en&namedetails=1`))
                .then(r => r.json()).catch(() => null);
            if (parent?.address) {
                freshEn = (parent.address.city || parent.address.state || parent.address.province || parent.name || '')
                    .replace(/\s*(Region|Governorate|Province|Prefecture|Metropolis|District)\b/gi, '').trim();
            }
        }
        const _norm = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '');
        let healed = false;
        if (freshEn && _norm(freshEn) !== _norm(expectedEn)) {
            // كان الاسم القديم حيّاً — نستدعي reverseGeocode الذي سيكتشف نفس الشيء ويحدّث الواجهة
            await reverseGeocode(lat, lng, false);
            healed = true;
            // إعادة رسم صفحة القمر إن كنّا عليها
            try {
                const onMoon = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today(?:-in-[a-z][a-z0-9-]+)?$/
                    .test(window.location.pathname);
                if (onMoon && typeof updateMoonInfo === 'function') updateMoonInfo();
            } catch (_e) { /* silent */ }
        }
        // تحديث جلسة التخزين:
        //   • healed=true → اكتُب الاسم الجديد (currentCity/currentEnglishName من reverseGeocode)
        //   • healed=false → فقط ضَع _v:2 لمنع إعادة الفحص مستقبلاً
        try {
            const k = `city_${slug}`;
            const cur = sessionStorage.getItem(k);
            if (cur) {
                const obj = JSON.parse(cur);
                if (healed) {
                    // currentCity قد يكون fallback رقميّ إن فشل reverseGeocode — لا تقبل إلا القيم الحقيقيّة
                    if (typeof currentCity === 'string' && currentCity && !/^\d/.test(currentCity)) obj.name = currentCity;
                    if (typeof currentCountry === 'string' && currentCountry) obj.country = currentCountry;
                    if (typeof currentEnglishName === 'string' && currentEnglishName) obj.englishName = currentEnglishName;
                    if (typeof currentCountryCode === 'string' && currentCountryCode) obj.countryCode = currentCountryCode;
                }
                obj._v = 2;
                sessionStorage.setItem(k, JSON.stringify(obj));
            }
        } catch (_e) { /* silent */ }
    } catch (_e) { /* silent */ }
}

async function initFromURL() {
    const slug = getSlugFromURL();
    if (!slug) return false;

    // 1) من sessionStorage (تنقل عادي داخل الموقع)
    const cached = sessionStorage.getItem(`city_${slug}`);
    if (cached) {
        const parsed = JSON.parse(cached);
        const { lat, lng, name, country, countryCode, englishName, timezone, _v } = parsed;
        await loadCityData(lat, lng, name, country, countryCode || '', englishName || '', timezone || null);
        // Ward-fix migration: جلسات قديمة (_v غير موجود) قد تحتوي على أحياء مثل "Chiyoda"
        //   بدل المدينة الأمّ "Tokyo". نعيد التحقّق في الخلفيّة عبر reverseGeocode الذي
        //   يستخدم الآن _pickCityLevel (يتخطّى الأحياء-المقنّعة).
        try {
            if (_v !== 2 && !isNaN(lat) && !isNaN(lng)) {
                setTimeout(() => _revalidateCachedCity(lat, lng, slug, englishName || name), 600);
            }
        } catch (_e) { /* silent */ }
        return true;
    }

    // ⭐ slug='moon' مفتاح جلسة فقط — لا نحاول geocoding له (يعطي Muhu/Estonia خاطئًا).
    //   بدون جلسة → نترك الصفحة تَعمل بالـ slug من URL (مثل /moon-today-in-mecca) عبر
    //   منطق صفحة القمر الخاصّ، مع currentCity/Lat الافتراضيّة للمستخدم.
    if (slug === 'moon') return false;

    // 2) من query string (روابط قديمة)
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get('lat'));
    const lng = parseFloat(params.get('lng'));
    const name = params.get('name');
    const country = params.get('country') || '';
    if (!isNaN(lat) && !isNaN(lng) && name) {
        await loadCityData(lat, lng, name, country, '');
        return true;
    }

    // 3) بحث محلي سريع في LOCAL_CITIES (بدون API)
    const localMatch = LOCAL_CITIES.find(c => makeSlug(c.en, c.lat, c.lng) === slug);
    if (localMatch) {
        await loadCityData(localMatch.lat, localMatch.lng, localMatch.ar, localMatch.country, localMatch.cc || '', localMatch.en || '');
        return true;
    }

    // 4) geocoding احتياطي (رابط مباشر)
    const result = await geocodeSlug(slug);
    if (result) {
        await loadCityData(result.lat, result.lng, result.name, result.country, result.countryCode || '', result.englishName || '');
        return true;
    }

    return false;
}

// ========= التهيئة =========
// —— إعادة كتابة روابط /today-hijri-date → /hijri-date/YYYY-MM-DD (canonical) ——
// قاعدة ذهبيّة: no user-facing link يجب أن يقود إلى /today-hijri-date؛ الـ canonical هو
// الصفحة المؤرّخة. يتمّ هذا قبل DOMContentLoaded عبر MutationObserver البسيط لإلتقاط
// أيّ إضافات لاحقة (holiday sidebars، countries.html، legal.html).
(function rewriteTodayHijriLinks() {
    if (typeof HijriDate === 'undefined' || !HijriDate.getToday) return;
    const _h = HijriDate.getToday();
    const _pad2 = (n) => String(n).padStart(2, '0');
    const _datedPath = `/hijri-date/${_h.year}-${_pad2(_h.month)}-${_pad2(_h.day)}`;
    const _rewrite = (root) => {
        const nodes = (root || document).querySelectorAll('a[href*="/today-hijri-date"]');
        nodes.forEach((a) => {
            const href = a.getAttribute('href') || '';
            const m = href.match(/^(\/(?:en|fr|tr|ur|de|id|es|bn|ms))?\/today-hijri-date(?:[?#].*)?$/);
            if (m) a.setAttribute('href', (m[1] || '') + _datedPath);
        });
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => _rewrite(document));
    } else {
        _rewrite(document);
    }
})();

// R37r — reorder: move #home-quick-access to sit immediately after
// #nearby-section on both home and city pages (per user request).
// Runs synchronously before initApp so the new order is the FIRST paint.
(function _reorderQuickAccessAfterNearby() {
    function reorder() {
        try {
            const qa = document.getElementById('home-quick-access');
            const nb = document.getElementById('nearby-section');
            if (qa && nb && nb.nextElementSibling !== qa) {
                nb.parentNode.insertBefore(qa, nb.nextElementSibling);
            }
        } catch (_e) { /* silent */ }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', reorder, { once: true });
    } else {
        reorder();
    }
})();

document.addEventListener('DOMContentLoaded', async function() {
    await initApp();
});

// دعم التنقل بالـ hash (عند فتح الملف مباشرة بدون سيرفر)
window.addEventListener('hashchange', async function() {
    await initFromURL();
});

function updateSidebar() {
    // التاريخ الهجري في الشريط الجانبي
    let hijriFormatted = HijriDate.getTodayFormatted();
    const hSuffix = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
    hijriFormatted = hijriFormatted.replace(/ هـ$/, hSuffix);
    const sHijriEl = document.getElementById('sidebar-hijri-date');
    if (sHijriEl) sHijriEl.textContent = hijriFormatted;

    // التاريخ الميلادي في الشريط الجانبي
    const _now = new Date();
    const _gMonths = HijriDate.gregorianMonths;
    const _gSuffix = (typeof t === 'function') ? t('date.greg_suffix') : ' م';
    const _gregEl = document.getElementById('sidebar-greg-date');
    if (_gregEl) _gregEl.textContent = `${_now.getDate()} ${_gMonths[_now.getMonth()]} ${_now.getFullYear()}${_gSuffix}`;
}

async function initApp() {
    // تعيين السنة في الفوتر
    document.getElementById('footer-year').textContent = new Date().getFullYear();

    // تحديد نوع الصفحة (مدينة / رئيسية) مبكراً
    applyPageType();

    // إعادة عرض اقتراح المدينة المحفوظة (إن وُجد)
    checkSavedLocationSuggestion();

    // حقن Schema للصفحة الرئيسية + SEO meta للصفحات غير الديناميكية
    injectHomepageSchema();
    updatePageSEO();

    // تحديث الشريط الجانبي
    updateSidebar();

    // تهيئة التنقل
    initNavigation();

    // تهيئة محول التاريخ
    initDateConverter();

    // تهيئة التقويم
    const today = HijriDate.getToday();
    calendarYear = today.year;
    calendarMonth = today.month;

    // تهيئة الأذان الصوتي
    initAdhanSettings();

    // تهيئة الأدعية
    initDuas();
    initTasbih();

    // تهيئة منتقي التاريخ في الجدول
    initScheduleDatePicker();

    // عرض مكة المكرمة فوراً (البيانات الافتراضية جاهزة)
    let loadedFromURL = false;
    try { loadedFromURL = await initFromURL(); }
    catch (_e) { try { console.warn('[initApp] initFromURL:', _e); } catch(_){} }
    if (!loadedFromURL) {
        // ── Round 31: على الصفحات غير-المدنية (dateconverter, zakat-calculator,
        //   msbaha, duas, hijri-calendar بدون سنة، …) حمِّل آخر سياق مدينة
        //   معروف حتّى يحمل الشريط الجانبي هذا السياق لأيّ نقرة لاحقة.
        //   قاعدة المستخدم: "من الرئيسيّة → مكّة / من أيّ مكان آخر → الموقع الحاليّ".
        //   نعرّف "الرئيسيّة" كـ "/" أو "/index.html" (مع prefix اللغة اختياريّاً).
        let _isHomeRoute = false;
        try {
            const _p = window.location.pathname;
            _isHomeRoute = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/?)?(?:index\.html)?$/.test(_p);
        } catch (_e) { _isHomeRoute = false; }
        let _hydratedFromContext = false;
        if (!_isHomeRoute) {
            try {
                const _stash = sessionStorage.getItem('last_city_context');
                if (_stash) {
                    const _p = JSON.parse(_stash);
                    if (_p && _p.englishName && isFinite(_p.lat) && isFinite(_p.lng)) {
                        currentLat         = _p.lat;
                        currentLng         = _p.lng;
                        currentCity        = _p.name        || currentCity;
                        currentEnglishName = _p.englishName || currentEnglishName;
                        currentCountry     = _p.country     || currentCountry;
                        currentCountryCode = _p.countryCode || currentCountryCode;
                        if (typeof _p.timezone === 'number') currentTimezone = _p.timezone;
                        _hydratedFromContext = true;
                    }
                }
            } catch (_e) { /* silent */ }
        } else {
            // على الرئيسيّة: امسح آخر سياق مدينة حتى تعود نقرات الشريط الجانبي
            //   افتراضيّاً إلى مكّة حسب قاعدة المستخدم.
            try { sessionStorage.removeItem('last_city_context'); } catch (_e) { /* silent */ }
        }
        // الصفحة الرئيسية تعرض مكة دائماً كافتراضي — لا نستبدلها بموقع المستخدم المحفوظ
        // موقع المستخدم (إن وُجد) يظهر فقط في شريط الاقتراح عبر checkSavedLocationSuggestion()
        try { updateCityDisplay(); } catch(_e) { try { console.warn('[initApp] updateCityDisplay:', _e); } catch(_){} }
        try { updatePrayerTimes(); } catch(_e) { try { console.warn('[initApp] updatePrayerTimes:', _e); } catch(_){} }
        try { updateQibla();       } catch(_e) { try { console.warn('[initApp] updateQibla:',       _e); } catch(_){} }
        // Round 31: لا تستدعِ detectLocation على صفحة غير-مدنيّة حين يوجد سياق
        //   (مثل /dateconverter بعد /prayer-times-in-tokyo): detectLocation يكتب
        //   فوق currentLat/Lng/EnglishName بموقع GPS الحقيقيّ للمستخدم عبر
        //   reverseGeocode، فيضيع سياق طوكيو قبل أن يقرأه الشريط الجانبي.
        //   اطلب الإذن للموقع الحقيقي — يستعمله detectLocation() لملء شريط الاقتراح فقط على الرئيسية
        if (!_hydratedFromContext) {
            try { detectLocation(); } catch(_e) { try { console.warn('[initApp] detectLocation:', _e); } catch(_){} }
        }
    }

    // تحديث البيانات الأولية — كلّ استدعاء ملفوف في try/catch لضمان الوصول إلى startCountdown()
    // على الصفحات المقصوصة (time-left-page) قد تفقد بعض الدوال عناصرها فترمي.
    try { updateHijriToday(); } catch (_e) { try { console.warn('[initApp] updateHijriToday:', _e); } catch(_){} }
    try { updateMoonInfo();  } catch (_e) { try { console.warn('[initApp] updateMoonInfo:',  _e); } catch(_){} }
    // PERF: تأجيل renderCalendar على الصفحات غير الهجرية (توفير 100-150ms من load)
    try {
        const _onHijriCalPage = /\/(?:en\/)?hijri-calendar\//.test(window.location.pathname);
        if (_onHijriCalPage) {
            renderCalendar();
        } else if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(() => { try { renderCalendar(); } catch(_){} }, { timeout: 3000 });
        } else {
            setTimeout(() => { try { renderCalendar(); } catch(_){} }, 800);
        }
    } catch (_e) { try { console.warn('[initApp] renderCalendar:', _e); } catch(_){} }

    // دعم SearchAction (?q=) على الصفحة الرئيسية
    try { handleHomeSearchQuery(); } catch (_e) { try { console.warn('[initApp] handleHomeSearchQuery:', _e); } catch(_){} }

    // بدء العد التنازلي — must run; دوال مسبقة محميّة فلا تكسر initApp
    try { startCountdown(); } catch (_e) { try { console.warn('[initApp] startCountdown:', _e); } catch(_){} }

    // تفعيل قسم القبلة تلقائياً إذا كان المسار /qibla-in-*
    const _isQiblaPage = /\/(?:en\/)?qibla-in-/.test(window.location.pathname);
    if (_isQiblaPage) {
        const _qiblaLink = document.querySelector(`.sidebar-nav a[data-page="qibla"]`);
        if (_qiblaLink) _qiblaLink.click();
        // تحديث العناصر الديناميكية بعد تفعيل القسم (مثل زر العودة)
        updateCityDisplay();
        // إزالة class الإخفاء المؤقت بعد تفعيل القسم الصحيح
        document.documentElement.classList.remove('qibla-page-loading');
    }

    // تفعيل صفحة المسبحة عند URL /msbaha
    const _isMsbahaPage = /\/(?:en\/)?msbaha$/.test(window.location.pathname);
    if (_isMsbahaPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-tasbih')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="tasbih"]')?.classList.add('active');
        document.documentElement.classList.remove('msbaha-page');
    }

    // Helper: صفحات التاريخ الهجري لا تستعمل Sticky Next-Prayer Bar — نُعيد الهيدر العلوي.
    // R24 fix: يُزيل .has-sticky-bar من body و .snb-visible من الشريط نفسه عند تفعيل أيّ صفحة هجريّة.
    const _resetStickyBarForHijri = () => {
        try {
            document.getElementById('sticky-next-bar')?.classList.remove('snb-visible');
            document.getElementById('moon-sticky-bar')?.classList.remove('is-visible');
            document.body.classList.remove('has-sticky-bar');
        } catch (_) {}
    };

    // تفعيل صفحة التاريخ الهجري عند URL /today-hijri-date
    const _isHijriPage = /\/(?:en\/)?today-hijri-date$/.test(window.location.pathname);
    if (_isHijriPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-hijri-today')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="hijri-today"]')?.classList.add('active');
        document.documentElement.classList.remove('hijri-today-page');
        _resetStickyBarForHijri();
    }

    // تفعيل صفحة اليوم الهجري الفردي عند URL /hijri-date/YYYY-MM-DD
    const _isHijriDayPage = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-date\/\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|30)$/.test(window.location.pathname);
    if (_isHijriDayPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-hijri-day')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="hijri-today"]')?.classList.add('active');
        loadHijriDayPage();
        document.documentElement.classList.remove('hijri-day-page');
        _resetStickyBarForHijri();
    }

    // تفعيل صفحة التقويم الهجري السنوي عند URL /hijri-calendar أو /hijri-calendar/1447
    const _isHijriYearPage = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar(?:\/\d{4})?$/.test(window.location.pathname);
    if (_isHijriYearPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-hijri-year')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="hijri-calendar"]')?.classList.add('active');
        loadHijriYearPage();
        document.documentElement.classList.remove('hijri-year-page');
        _resetStickyBarForHijri();
    }

    // تفعيل صفحة التقويم الهجري الشهري عند URL /hijri-calendar/YYYY-MM
    const _isHijriMonthPage = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar\/\d{4}-(?:0[1-9]|1[0-2])$/.test(window.location.pathname);
    if (_isHijriMonthPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-hijri-month')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="hijri-calendar"]')?.classList.add('active');
        loadHijriMonthPage();
        document.documentElement.classList.remove('hijri-month-page');
        _resetStickyBarForHijri();
    }

    // تفعيل صفحة تحويل التاريخ عند URL /dateconverter
    const _isDateConverterPage = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?dateconverter$/.test(window.location.pathname);
    if (_isDateConverterPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-date-converter')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="date-converter"]')?.classList.add('active');
        // FIX: تحويل inputs الـ number إلى stepper مع أزرار +/− مرئيّة
        try { _enhanceConverterSteppers(); } catch (_) {}
    }

    // تفعيل صفحة الأدعية عند URL /duas
    const _isDuasPage = /\/(?:(?:en|ar)\/)?duas$/.test(window.location.pathname);
    if (_isDuasPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-duas')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="duas"]')?.classList.add('active');
    }

    // تفعيل صفحة القبلة عند URL:
    //   • /qibla                                                   (hub)
    //   • /qibla-in-{slug}[-{lat}-{lng}]                            (city page)
    const _qiblaPath = window.location.pathname;
    const _isQiblaHubPage  = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla$/.test(_qiblaPath);
    const _isQiblaCityPage = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla-in-[a-z][a-z0-9-]+(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/.test(_qiblaPath);
    if (_isQiblaHubPage || _isQiblaCityPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-qibla')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="qibla"]')?.classList.add('active');

        let _qctx = { mode: 'hub' };
        if (_isQiblaCityPage) {
            const _qm = _qiblaPath.match(/\/qibla-in-([a-z][a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/);
            if (_qm) {
                const _slug = _qm[1];
                const _cityData = {};
                if (_qm[2] && _qm[3]) {
                    _cityData.lat = parseFloat(_qm[2]);
                    _cityData.lng = parseFloat(_qm[3]);
                    _cityData.slug = _slug;
                    _cityData.name = _slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                    _qctx = { mode: 'city', citySlug: _slug, cityData: _cityData };
                } else {
                    _qctx = { mode: 'city', citySlug: _slug };
                }
            }
        }
        try { loadQiblaPage(_qctx); } catch (_e) {}
    }

    // تفعيل صفحة حاسبة الزكاة عند URL /zakat-calculator
    const _isZakatPage = /\/(?:(?:en|fr|tr|ur)\/)?zakat-calculator$/.test(window.location.pathname);
    if (_isZakatPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-zakat')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="zakat"]')?.classList.add('active');
    }

    // تفعيل صفحة القمر عند URL:
    //   • /moon-today                                          (canonical)
    //   • /moon-today-in-{slug}[-{lat}-{lng}]                   (Round 12: coord-suffix)
    //   • /moon-in-{slug}[-{lat}-{lng}]                         (Round 16: hub)
    //   • /moon-in-{slug}[-{lat}-{lng}]/{YYYY-MM-DD}            (Round 15: dated)
    const _mpPath = window.location.pathname;
    const _isMoonPage = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today(?:-in-[a-z][a-z0-9-]+(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?)?$/.test(_mpPath)
        || /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-in-[a-z][a-z0-9-]+(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?(?:\/\d{4}-\d{2}-\d{2})?$/.test(_mpPath);
    if (_isMoonPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-moon')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="moon"]')?.classList.add('active');
        // إعادة احتساب بيانات القمر بعد تفعيل القسم (لملء جدول التوقّعات والعنوان والموقع)
        try { updateMoonInfo(); } catch (_e) {}

        // FIX: استبدال اسم المدينة في moon-hub-cta بالاسم الفعليّ الظاهر في الهيدر
        //   (يحلّ مشكلة "At Taif" بدل "الطائف" بدون الاعتماد على slug resolution)
        try {
            const _patchCityNameInCta = () => {
                const _liveCityName = (document.getElementById('city-name')?.textContent || '').trim();
                if (!_liveCityName) return;
                const _cta = document.querySelector('.moon-hub-cta');
                if (!_cta) return;
                // قوالب 10 لغات — مطابقة لـ server.js
                const _tpl = {
                    ar: '📅 تقويم القمر في {city} — استعرض أيّ تاريخ',
                    en: '📅 Moon Calendar for {city} — Explore any date',
                    fr: '📅 Calendrier de la Lune pour {city} — Explorer toute date',
                    tr: '📅 {city} Ay Takvimi — İstediğiniz tarihi keşfedin',
                    ur: '📅 {city} کا چاند کا تقویم — کوئی بھی تاریخ دیکھیں',
                    de: '📅 Mondkalender für {city} — Jedes Datum erkunden',
                    id: '📅 Kalender Bulan untuk {city} — Jelajahi tanggal apa pun',
                    es: '📅 Calendario Lunar para {city} — Explora cualquier fecha',
                    bn: '📅 {city}-এর চাঁদের পঞ্জিকা — যেকোনো তারিখ দেখুন',
                    ms: '📅 Kalendar Bulan untuk {city} — Terokai mana-mana tarikh'
                };
                const _lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                const _newText = (_tpl[_lang] || _tpl.en).replace('{city}', _liveCityName);
                if (_cta.textContent !== _newText) _cta.textContent = _newText;
            };
            // patch فوريّ + بعد تحديث city-name (قد يأتي بعد geocoding)
            _patchCityNameInCta();
            const _cityNameEl = document.getElementById('city-name');
            if (_cityNameEl && window.MutationObserver) {
                new MutationObserver(_patchCityNameInCta)
                    .observe(_cityNameEl, { childList: true, characterData: true, subtree: true });
            }
        } catch (_e) {}

        // BOND 7: Sticky Mini Bar — show/hide on scroll past hero (~250px)
        try {
            const _stickyBar = document.getElementById('moon-sticky-bar');
            const _stickyUp  = document.getElementById('moon-sticky-up');
            if (_stickyBar) {
                _stickyBar.hidden = false;
                let _ticking = false;
                // قياس ارتفاع الشريط مرّة واحدة عند التهيئة → CSS var --moon-sticky-h
                const _measureBar = () => {
                    try {
                        const _h = Math.round(_stickyBar.getBoundingClientRect().height) || 50;
                        document.documentElement.style.setProperty('--moon-sticky-h', _h + 'px');
                    } catch (_) {}
                };
                // قياس فوريّ + تأخير قصير لاحتساب الخطوط
                _measureBar();
                setTimeout(_measureBar, 200);
                if (window.ResizeObserver) {
                    try { new ResizeObserver(_measureBar).observe(_stickyBar); } catch (_) {}
                }

                const _onScroll = () => {
                    if (_ticking) return;
                    _ticking = true;
                    requestAnimationFrame(() => {
                        const _shouldShow = window.scrollY > 250;
                        const _wasVisible = _stickyBar.classList.contains('is-visible');
                        if (_shouldShow !== _wasVisible) {
                            _stickyBar.classList.toggle('is-visible', _shouldShow);
                            // FIX: نُضيف has-moon-sticky على body → CSS يُضيف padding-top
                            // على #page-moon ليُفسح مكاناً للشريط فلا يغطّي المحتوى
                            document.body.classList.toggle('has-moon-sticky', _shouldShow);
                        }
                        _ticking = false;
                    });
                };
                window.addEventListener('scroll', _onScroll, { passive: true });
                if (_stickyUp) _stickyUp.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
            }
        } catch(_se) {}
    }

    // ═══════════════ صفحات العدّ التنازليّ (رمضان، عيد الفطر، عيد الأضحى، رأس السنة الهجريّة) ═══════════════
    const _CD_PAGES = {
        'ramadan-countdown':        { id: 'ramadan',        keyPrefix: 'ramadan',   pageId: 'page-ramadan-countdown',        hMonth: 9,  hDay: 1  },
        'eid-al-fitr-countdown':    { id: 'eid-al-fitr',    keyPrefix: 'eid_fitr',  pageId: 'page-eid-al-fitr-countdown',    hMonth: 10, hDay: 1  },
        'eid-al-adha-countdown':    { id: 'eid-al-adha',    keyPrefix: 'eid_adha',  pageId: 'page-eid-al-adha-countdown',    hMonth: 12, hDay: 10 },
        'hijri-new-year-countdown': { id: 'hijri-new-year', keyPrefix: 'hijri_ny',  pageId: 'page-hijri-new-year-countdown', hMonth: 1,  hDay: 1  }
    };
    const _cdPathMatch = window.location.pathname.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?([a-z-]+-countdown)$/);
    const _cdPageKey = _cdPathMatch && _CD_PAGES[_cdPathMatch[1]] ? _cdPathMatch[1] : null;
    if (_cdPageKey) {
        const _cdCfg = _CD_PAGES[_cdPageKey];
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(_cdCfg.pageId)?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        try { _initCountdownPage(_cdCfg); } catch (_cdErr) { console.warn('[countdown]', _cdErr); }
    }

    /**
     * تهيئة صفحة العدّ التنازليّ لمناسبة إسلاميّة.
     * cfg = { id, pageId, hMonth, hDay }
     */
    function _initCountdownPage(cfg) {
        if (typeof HijriDate === 'undefined' || !HijriDate) return;
        const _lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const _tt = (k, params) => {
            try {
                if (typeof t === 'function') {
                    const tr = t(k, params);
                    if (tr && tr !== k) return tr;
                }
            } catch (_) {}
            return '';
        };
        const _hToday = HijriDate.getToday();
        // HijriDate.toGregorian يُرجع {year, month, day} (month 1-based) — نحوّلها إلى Date حقيقيّ
        const _toGreg = (y, m, d) => {
            try {
                const g = HijriDate.toGregorian(y, m, d);
                if (!g) return null;
                if (g instanceof Date) return g;
                if (typeof g.year === 'number') {
                    return new Date(g.year, (g.month || 1) - 1, g.day || 1);
                }
                return null;
            } catch (_) { return null; }
        };
        const _startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
        const _todayStart = _startOfDay(new Date());

        // احسب تاريخ الحدث القادم — إن فات هذا العام هجريًّا، استخدم العام التالي
        let _eventHYear = _hToday.year;
        let _eventGreg = _toGreg(_eventHYear, cfg.hMonth, cfg.hDay);
        if (_eventGreg && _startOfDay(_eventGreg) < _todayStart) {
            _eventHYear += 1;
            _eventGreg = _toGreg(_eventHYear, cfg.hMonth, cfg.hDay);
        }
        if (!_eventGreg) return;

        // بادئة مفاتيح i18n الخاصّة بهذه الصفحة (ramadan / eid_fitr / eid_adha / hijri_ny)
        const _kp = cfg.keyPrefix || cfg.id;

        // ── (أ) تحديث meta tags + document.title ──
        try {
            const _title = _tt(_kp + '.meta_title') || _tt(_kp + '.h1') || document.title;
            if (_title) document.title = _title;
            let _metaDesc = document.querySelector('meta[name="description"]');
            if (!_metaDesc) {
                _metaDesc = document.createElement('meta');
                _metaDesc.setAttribute('name', 'description');
                document.head.appendChild(_metaDesc);
            }
            const _desc = _tt(_kp + '.meta_desc') || _tt(_kp + '.intro') || '';
            if (_desc) _metaDesc.setAttribute('content', _desc);
        } catch (_) {}

        // ── (ب) قيم ثابتة من الـ event ──
        const _fmtGreg = (d) => {
            if (!d) return '—';
            const day = d.getDate();
            const mon = _tt('gmonth.' + (d.getMonth() + 1)) || (d.getMonth() + 1);
            return day + ' ' + mon + ' ' + d.getFullYear();
        };
        const _setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        const _P = cfg.id === 'ramadan' ? 'ram'
                 : cfg.id === 'eid-al-fitr' ? 'fitr'
                 : cfg.id === 'eid-al-adha' ? 'adha'
                 : 'ny';

        _setText(_P + '-hyear', _eventHYear);
        _setText(_P + '-card-hy', _eventHYear);
        _setText(_P + '-greg', _fmtGreg(_eventGreg));
        _setText(_P + '-card-start', _fmtGreg(_eventGreg));

        // ── الأيّام المتبقّية بنفس صيغة العدّاد (Math.floor diff/86400000) — ضماناً للاتّساق ──
        const _diffNow = _eventGreg.getTime() - Date.now();
        const _daysLeft = Math.max(0, Math.floor(_diffNow / 86400000));

        // ── جملة SEO تحت العدّاد (10 لغات) — مع "يوم" قبل التاريخ ──
        // "يبدأ شهر {event} {hyear}هـ يوم {date}، ويتبقّى عليه X يوماً"
        try {
            const _eventName = _tt(_kp + '.event_name') || cfg.id;
            const _gregFmt = _fmtGreg(_eventGreg);
            const _seoTpl = {
                ar: `يبدأ شهر ${_eventName} ${_eventHYear} هـ يوم ${_gregFmt}، ويتبقّى عليه ${_daysLeft} يوماً`,
                en: `${_eventName} ${_eventHYear} AH begins on ${_gregFmt}, with ${_daysLeft} days remaining`,
                fr: `${_eventName} ${_eventHYear} AH commence le jour du ${_gregFmt}, il reste ${_daysLeft} jours`,
                tr: `${_eventName} ${_eventHYear} AH ${_gregFmt} günü başlar, ${_daysLeft} gün kaldı`,
                ur: `${_eventName} ${_eventHYear} ھ ${_gregFmt} کے دن شروع ہوگا، ${_daysLeft} دن باقی`,
                de: `${_eventName} ${_eventHYear} AH beginnt am ${_gregFmt}, noch ${_daysLeft} Tage`,
                id: `${_eventName} ${_eventHYear} H dimulai pada hari ${_gregFmt}, tersisa ${_daysLeft} hari`,
                es: `${_eventName} ${_eventHYear} AH comienza el día ${_gregFmt}, faltan ${_daysLeft} días`,
                bn: `${_eventName} ${_eventHYear} হিজরি ${_gregFmt}-এ শুরু হবে, ${_daysLeft} দিন বাকি`,
                ms: `${_eventName} ${_eventHYear} H bermula pada hari ${_gregFmt}, ${_daysLeft} hari lagi`
            };
            _setText(_P + '-seo-line', _seoTpl[_lang] || _seoTpl.en);
        } catch (_) {}

        // ── helper: للحدث "رمضان" نستخدم "شهر رمضان" — للأعياد/السنة بدون "شهر"
        const _isRamadan = cfg.id === 'ramadan';
        const _evWithPrefix = (eventName) => {
            if (_lang === 'ar' && _isRamadan) return `شهر ${eventName}`;
            return eventName;
        };

        // ── جملة واحدة قويّة تحت H1 — جواب فقط (السؤال موجود في H1) ──
        // "يتبقّى 287 يوماً على بداية شهر رمضان 1448 هـ الموافق 8 فبراير 2027."
        try {
            const _h1SeoEl = document.getElementById(_P + '-h1-seo');
            if (_h1SeoEl) {
                const _evN = _tt(_kp + '.event_name') || cfg.id;
                const _evNFull = _evWithPrefix(_evN);
                const _gFmt = _fmtGreg(_eventGreg);
                const _aTpl = {
                    ar: `يتبقّى ${_daysLeft} يوماً على بداية ${_evNFull} ${_eventHYear} هـ الموافق ${_gFmt}.`,
                    en: `${_daysLeft} days remain until ${_evN} ${_eventHYear} AH begins on ${_gFmt}.`,
                    fr: `Il reste ${_daysLeft} jours avant le début de ${_evN} ${_eventHYear} AH le ${_gFmt}.`,
                    tr: `${_evN} ${_eventHYear} AH'ın ${_gFmt} tarihinde başlamasına ${_daysLeft} gün kaldı.`,
                    ur: `${_evN} ${_eventHYear} ھ ${_gFmt} کو شروع ہوگا، ${_daysLeft} دن باقی۔`,
                    de: `Noch ${_daysLeft} Tage bis ${_evN} ${_eventHYear} AH am ${_gFmt} beginnt.`,
                    id: `Tersisa ${_daysLeft} hari sampai ${_evN} ${_eventHYear} H dimulai pada ${_gFmt}.`,
                    es: `Faltan ${_daysLeft} días para que ${_evN} ${_eventHYear} AH comience el ${_gFmt}.`,
                    bn: `${_evN} ${_eventHYear} হিজরি ${_gFmt}-এ শুরু হবে, ${_daysLeft} দিন বাকি।`,
                    ms: `${_daysLeft} hari lagi sebelum ${_evN} ${_eventHYear} H bermula pada ${_gFmt}.`
                };
                _h1SeoEl.textContent = _aTpl[_lang] || _aTpl.en;
            }
        } catch (_) {}

        // ── H1 ديناميكيّ: "كم باقي على رمضان 1448 في طوكيو؟" ──
        try {
            const _h1El = document.querySelector('#' + cfg.pageId + ' .countdown-h1');
            if (_h1El) {
                const _evN = _tt(_kp + '.event_name') || cfg.id;
                const _city0 = currentCity || (_lang === 'ar' ? 'مكة المكرمة' : 'Mecca');
                const _emojiMap = { ramadan: '🕋', 'eid-al-fitr': '🌙', 'eid-al-adha': '🐑', 'hijri-new-year': '📅' };
                const _emoji = _emojiMap[cfg.id] || '📅';
                const _h1Tpl = {
                    ar: `${_emoji} كم باقي على ${_evN} ${_eventHYear} في ${_city0}؟`,
                    en: `${_emoji} How long until ${_evN} ${_eventHYear} in ${_city0}?`,
                    fr: `${_emoji} Combien de jours jusqu'à ${_evN} ${_eventHYear} à ${_city0} ?`,
                    tr: `${_emoji} ${_city0}'de ${_evN} ${_eventHYear}'a ne kadar kaldı?`,
                    ur: `${_emoji} ${_city0} میں ${_evN} ${_eventHYear} میں کتنے دن باقی؟`,
                    de: `${_emoji} Wie lange bis ${_evN} ${_eventHYear} in ${_city0}?`,
                    id: `${_emoji} Berapa hari lagi ${_evN} ${_eventHYear} di ${_city0}?`,
                    es: `${_emoji} ¿Cuántos días faltan para ${_evN} ${_eventHYear} en ${_city0}?`,
                    bn: `${_emoji} ${_city0}-এ ${_evN} ${_eventHYear} পর্যন্ত কতদিন?`,
                    ms: `${_emoji} Berapa hari lagi ${_evN} ${_eventHYear} di ${_city0}?`
                };
                _h1El.textContent = _h1Tpl[_lang] || _h1Tpl.en;
            }
        } catch (_) {}

        // ── CTA hint: يربط بصفحة مواقيت الصلاة للمدينة الحاليّة (أو مكّة افتراضياً) ──
        try {
            const _ctaEl = document.querySelector('#' + cfg.pageId + ' .cd-cta-hint');
            if (_ctaEl) {
                let _ctaSlug = null;
                if (currentEnglishName && currentLat != null && currentLng != null
                    && typeof makeSlug === 'function') {
                    try { _ctaSlug = makeSlug(currentEnglishName, currentLat, currentLng); } catch (_) {}
                }
                if (!_ctaSlug) _ctaSlug = 'mecca';
                // احفظ سياق المدينة قبل التنقّل (مطابقاً لباقي الموقع)
                _ctaEl.addEventListener('click', function _ctaClickOnce(e) {
                    e.preventDefault();
                    try {
                        if (currentLat != null && currentLng != null && currentEnglishName) {
                            sessionStorage.setItem('city_' + _ctaSlug, JSON.stringify({
                                lat: currentLat, lng: currentLng, name: currentCity,
                                country: currentCountry, englishName: currentEnglishName,
                                countryCode: currentCountryCode, timezone: currentTimezone, _v: 2
                            }));
                            sessionStorage.setItem('last_city_context', JSON.stringify({
                                lat: currentLat, lng: currentLng, name: currentCity,
                                country: currentCountry, englishName: currentEnglishName,
                                countryCode: currentCountryCode, timezone: currentTimezone, ts: Date.now()
                            }));
                        }
                    } catch (_) {}
                    const _prefix = (typeof getCurrentLang === 'function' && getCurrentLang() !== 'ar')
                        ? '/' + getCurrentLang() : '';
                    window.location.href = _prefix + '/prayer-times-in-' + _ctaSlug;
                }, { once: true });
                // حدّث الـ href أيضاً (لـ tooltips ومحرّكات البحث)
                const _prefix2 = (_lang !== 'ar') ? '/' + _lang : '';
                _ctaEl.setAttribute('href', _prefix2 + '/prayer-times-in-' + _ctaSlug);
            }
        } catch (_) {}

        // ── شريط التخصيص: يظهر دائماً (بمدينة المستخدم أو مكّة كافتراضي) ──
        try {
            const _personalBar = document.getElementById(_P + '-personal-bar');
            const _personalText = document.getElementById(_P + '-personal-text');
            // ترطيب من sessionStorage إن لم يكن currentCity معبّأ
            if ((!currentCity || !currentLat) && typeof _hydrateCurrentCityFromUrlOrStorage === 'function') {
                try { _hydrateCurrentCityFromUrlOrStorage(); } catch (_) {}
                try {
                    const _stash = sessionStorage.getItem('last_city_context');
                    if (_stash && (!currentCity || !currentLat)) {
                        const _o = JSON.parse(_stash);
                        if (_o && _o.name) currentCity = _o.name;
                    }
                } catch (_) {}
            }
            const _city = currentCity || (_lang === 'ar' ? 'مكة المكرمة' : 'Mecca');
            const _evName = _tt(_kp + '.event_name') || cfg.id;
            if (_personalBar && _personalText) {
                // سطران: عنوان مدينة + جملة كاملة
                //   📍 في مكة المكرمة:
                //   يتبقّى 287 يوماً على بداية رمضان
                const _line1Tpl = {
                    ar: `في ${_city}:`,
                    en: `In ${_city}:`,
                    fr: `À ${_city} :`,
                    tr: `${_city}'de:`,
                    ur: `${_city} میں:`,
                    de: `In ${_city}:`,
                    id: `Di ${_city}:`,
                    es: `En ${_city}:`,
                    bn: `${_city}-এ:`,
                    ms: `Di ${_city}:`
                };
                const _evNameFull = _evWithPrefix(_evName);
                const _line2Tpl = {
                    ar: `يتبقّى ${_daysLeft} يوماً على بداية ${_evNameFull}`,
                    en: `${_daysLeft} days remain until ${_evName} begins`,
                    fr: `Il reste ${_daysLeft} jours avant le début de ${_evName}`,
                    tr: `${_evName}'ın başlamasına ${_daysLeft} gün kaldı`,
                    ur: `${_evName} کی شروعات تک ${_daysLeft} دن باقی`,
                    de: `Noch ${_daysLeft} Tage bis ${_evName} beginnt`,
                    id: `Tersisa ${_daysLeft} hari sebelum ${_evName} dimulai`,
                    es: `Faltan ${_daysLeft} días para que comience ${_evName}`,
                    bn: `${_evName} শুরু হতে ${_daysLeft} দিন বাকি`,
                    ms: `${_daysLeft} hari lagi sebelum ${_evName} bermula`
                };
                const _l1 = _line1Tpl[_lang] || _line1Tpl.en;
                const _l2 = _line2Tpl[_lang] || _line2Tpl.en;
                _personalText.innerHTML = '<strong class="cdp-l1">' + _escHtml(_l1) + '</strong>'
                                        + '<span class="cdp-l2">' + _escHtml(_l2) + '</span>';
                _personalBar.hidden = false;
            }
        } catch (_) {}

        // ── سطر تعريفيّ مختصر فوق "معلومات عن المناسبة" (SEO boost) ──
        try {
            const _infoSection = document.querySelector('#page-' + cfg.pageId.replace('page-', '') + ' .countdown-info');
            const _infoSectionByCfg = document.getElementById(cfg.pageId)?.querySelector('.countdown-info');
            const _section = _infoSectionByCfg || _infoSection;
            if (_section) {
                let _intro = _section.querySelector('.cd-info-intro');
                if (!_intro) {
                    _intro = document.createElement('p');
                    _intro.className = 'cd-info-intro';
                    const _h2 = _section.querySelector('h2');
                    if (_h2 && _h2.nextSibling) _section.insertBefore(_intro, _h2.nextSibling);
                    else if (_h2) _section.appendChild(_intro);
                    else _section.insertBefore(_intro, _section.firstChild);
                }
                const _evN = _tt(_kp + '.event_name') || cfg.id;
                const _gFmt = _fmtGreg(_eventGreg);
                const _introTpl = {
                    ar: `${_evN} هو إحدى أهمّ المناسبات الإسلاميّة، ويبدأ هذا العام في ${_gFmt}.`,
                    en: `${_evN} is one of the most important Islamic occasions, beginning this year on ${_gFmt}.`,
                    fr: `${_evN} est l'une des occasions islamiques les plus importantes, commence cette année le ${_gFmt}.`,
                    tr: `${_evN}, en önemli İslami günlerden biridir ve bu yıl ${_gFmt} tarihinde başlar.`,
                    ur: `${_evN} اہم ترین اسلامی مواقع میں سے ایک ہے، اس سال ${_gFmt} کو شروع ہوگا۔`,
                    de: `${_evN} ist eine der wichtigsten islamischen Anlässe und beginnt dieses Jahr am ${_gFmt}.`,
                    id: `${_evN} adalah salah satu peristiwa Islam terpenting, dimulai tahun ini pada ${_gFmt}.`,
                    es: `${_evN} es una de las ocasiones islámicas más importantes, comienza este año el ${_gFmt}.`,
                    bn: `${_evN} সবচেয়ে গুরুত্বপূর্ণ ইসলামী উপলক্ষগুলির একটি, এই বছর ${_gFmt}-এ শুরু হবে।`,
                    ms: `${_evN} adalah salah satu peristiwa Islam terpenting, bermula tahun ini pada ${_gFmt}.`
                };
                _intro.textContent = _introTpl[_lang] || _introTpl.en;
            }
        } catch (_) {}

        // ── حدّث سطر القمر:
        //   ترتيب جديد: "🌙 القمر الآن: أحدب متزايد (74%) — اقتراب فلكي من رمضان"
        //   نُعيد بناء الـ box بالكامل (إلّا strong و illum spans يحتفظان بـ IDs).
        try {
            const _lunarBox = document.getElementById(_P + '-lunar-inline');
            if (_lunarBox) {
                const _evN = _tt(_kp + '.event_name') || cfg.id;
                const _curEl = document.getElementById(_P + '-current-phase');
                const _illEl = document.getElementById(_P + '-current-illum');
                const _curText = _curEl ? _curEl.textContent : '—';
                const _illText = _illEl ? _illEl.textContent : '—';
                const _labelTpl = {
                    ar: 'القمر الآن:',
                    en: 'Moon now:',
                    fr: 'Lune actuelle :',
                    tr: 'Şu an Ay:',
                    ur: 'چاند ابھی:',
                    de: 'Mond jetzt:',
                    id: 'Bulan sekarang:',
                    es: 'Luna ahora:',
                    bn: 'চাঁদ এখন:',
                    ms: 'Bulan sekarang:'
                };
                const _evNS = _evWithPrefix(_evN);
                const _suffixTpl = {
                    ar: `— اقتراب فلكيّ من ${_evNS}`,
                    en: `— astronomical approach to ${_evN}`,
                    fr: `— approche astronomique de ${_evN}`,
                    tr: `— ${_evN}'a astronomik yaklaşım`,
                    ur: `— ${_evN} کا فلکی قرب`,
                    de: `— astronomische Annäherung an ${_evN}`,
                    id: `— pendekatan astronomis ${_evN}`,
                    es: `— aproximación astronómica a ${_evN}`,
                    bn: `— ${_evN}-এর জ্যোতির্বিদ্যাগত নৈকট্য`,
                    ms: `— pendekatan astronomi ${_evN}`
                };
                const _lblHtml = (_labelTpl[_lang] || _labelTpl.en);
                const _sufHtml = (_suffixTpl[_lang] || _suffixTpl.en);
                _lunarBox.innerHTML =
                    '<span class="cdli-icon">🌙</span>' +
                    '<span>' + _escHtml(_lblHtml) + '</span>' +
                    '<strong id="' + _P + '-current-phase">' + _escHtml(_curText) + '</strong>' +
                    '<span class="lunar-illum">(<span id="' + _P + '-current-illum">' + _escHtml(_illText) + '</span>)</span>' +
                    '<span class="cdli-suffix">' + _escHtml(_sufHtml) + '</span>';
            }
        } catch (_) {}

        // ── (ج) بيانات الارتباط القمريّ ──
        try {
            if (typeof MoonCalc !== 'undefined' && MoonCalc) {
                const now = new Date();
                const illum = MoonCalc.getMoonIllumination(now);
                const phase = MoonCalc.getPhaseName(now);
                if (phase) {
                    const phaseName = _tt(phase.key) || phase.name || phase.english || '';
                    _setText(_P + '-current-phase', (phase.icon || '') + ' ' + phaseName);
                }
                _setText(_P + '-current-illum', (typeof illum === 'number') ? illum.toFixed(1) + '%' : '—');
            }
        } catch (_) {}

        // ── (د) قسم "ما قبل" (يظهر لرمضان فقط بمنطقه الخاصّ) ──
        if (cfg.id === 'ramadan') {
            try {
                const _curMonthKey = 'hmonth.' + _hToday.month;
                const _curMonthName = _tt(_curMonthKey) || ('شهر ' + _hToday.month);
                _setText('ram-pre-month', _curMonthName + ' ' + _hToday.year);
                // أيّام متبقّية على نهاية شعبان (شهر 8)
                if (typeof HijriDate.getDaysInHijriMonth === 'function') {
                    if (_hToday.month === 8) {
                        const totalShaban = HijriDate.getDaysInHijriMonth(_hToday.year, 8);
                        _setText('ram-pre-shaban', (totalShaban - _hToday.day) + ' ' + (_tt('countdown.days_suffix') || 'يوم'));
                    } else if (_hToday.month < 8) {
                        _setText('ram-pre-shaban', _tt('ramadan.pre_shaban_not_yet') || 'لم يبدأ شعبان بعد');
                    } else {
                        _setText('ram-pre-shaban', _tt('ramadan.pre_shaban_passed') || 'انتهى شعبان');
                    }
                }
                // قرب المحاق
                if (typeof MoonCalc !== 'undefined' && MoonCalc.getMoonIllumination) {
                    const illumNow = MoonCalc.getMoonIllumination(new Date());
                    const nearNew = illumNow < 10;
                    _setText('ram-pre-near-new', nearNew ? (_tt('ramadan.pre_yes') || 'نعم، نحن قريبون') : (_tt('ramadan.pre_no') || 'ليس بعد'));
                }
            } catch (_) {}
        }

        // ── (هـ) جدول السنوات القادمة (5 سنوات) — تمييز "القادم" + "بعد X يوم" + داخل note ──
        const _yearsTbody = document.getElementById(_P + '-years-tbody');
        if (_yearsTbody) {
            const rows = [];
            const _nextLabel = _tt(_kp + '.year_next_badge') || (_lang === 'ar' ? 'القادم' : 'Next');
            const _afterTpl = (n) => {
                const t = {
                    ar: `بعد ${n} يوماً`,
                    en: `in ${n} days`,
                    fr: `dans ${n} jours`,
                    tr: `${n} gün sonra`,
                    ur: `${n} دن بعد`,
                    de: `in ${n} Tagen`,
                    id: `dalam ${n} hari`,
                    es: `en ${n} días`,
                    bn: `${n} দিন পরে`,
                    ms: `dalam ${n} hari`
                };
                return t[_lang] || t.en;
            };
            for (let i = 0; i < 5; i++) {
                const hy = _eventHYear + i;
                const gd = _toGreg(hy, cfg.hMonth, cfg.hDay);
                if (!gd) continue;
                const _isNext = (i === 0); // أوّل صفّ = القادم
                const _badge = _isNext ? ' <span class="cd-badge-next">' + _escHtml(_nextLabel) + '</span>' : '';
                const _noteCell = _isNext
                    ? '<strong class="cd-after-days">' + _escHtml(_afterTpl(_daysLeft)) + '</strong>'
                    : (_tt(_kp + '.years_note_cell') || 'تقديريّ · يعتمد على الرؤية');
                rows.push(
                    '<tr' + (_isNext ? ' class="cd-row-current"' : '') + '>' +
                        '<td>' + hy + ' ' + (_lang === 'ar' ? 'هـ' : 'AH') + _badge + '</td>' +
                        '<td>' + gd.getFullYear() + '</td>' +
                        '<td>' + _fmtGreg(gd) + '</td>' +
                        '<td class="countdown-small-note">' + _noteCell + '</td>' +
                    '</tr>'
                );
            }
            _yearsTbody.innerHTML = rows.join('') || '<tr><td colspan="4" class="countdown-loading">—</td></tr>';
        }

        // ── (هـ-2) معلومات قمريّة مبسّطة: المحاق القادم + الهلال المتوقّع ──
        try {
            if (typeof MoonCalc !== 'undefined' && MoonCalc.getNextNewMoon) {
                const nm = MoonCalc.getNextNewMoon(new Date());
                if (nm) _setText(_P + '-next-new-moon', _fmtGreg(nm));
                // الهلال = اليوم التالي للمحاق (تقدير عمليّ)
                if (nm) {
                    const cr = new Date(nm.getTime() + 86400000);
                    _setText(_P + '-next-crescent', _fmtGreg(cr));
                }
            }
        } catch (_) {}

        // ── (و) أسئلة FAQ ── (10 أسئلة) + زرّ "عرض المزيد" يعرض أوّل 4 ──
        const _faqList = document.getElementById(_P + '-faq-list');
        if (_faqList) {
            const _daysLeft = Math.round((_startOfDay(_eventGreg) - _todayStart) / 86400000);
            const _gregStr = _fmtGreg(_eventGreg);
            const _faqParams = { n: _daysLeft, date: _gregStr, hyear: _eventHYear };
            const faqs = [];
            for (let _i = 1; _i <= 10; _i++) {
                const _q = _tt(_kp + '.faq_q' + _i);
                const _a = _tt(_kp + '.faq_a' + _i, _faqParams);
                if (_q && _a) faqs.push({ q: _q, a: _a });
            }
            _faqList.innerHTML = faqs.map(function(f) {
                return '<details><summary>' + _escHtml(f.q) + '</summary><p>' + _escHtml(f.a) + '</p></details>';
            }).join('');
            // أضف زرّ "عرض المزيد" إن كان عدد الأسئلة > 3
            if (faqs.length > 3) {
                const _showLbl = _tt(_kp + '.faq_show_more') || (_lang === 'ar' ? '↓ عرض جميع الأسئلة' : '↓ Show all questions');
                const _hideLbl = _tt(_kp + '.faq_show_less') || (_lang === 'ar' ? '↑ عرض أقلّ' : '↑ Show less');
                const _btn = document.createElement('button');
                _btn.type = 'button';
                _btn.className = 'cd-faq-toggle';
                _btn.textContent = _showLbl;
                _btn.addEventListener('click', () => {
                    const expanded = _faqList.classList.toggle('is-expanded');
                    _btn.textContent = expanded ? _hideLbl : _showLbl;
                });
                // أزل زرّ سابق (إن كان موجوداً من re-init)
                const _prev = _faqList.parentNode.querySelector('.cd-faq-toggle');
                if (_prev) _prev.remove();
                _faqList.parentNode.appendChild(_btn);
            }
        }

        // ── (ز) Countdown timer يحدّث كلّ ثانية ──
        const _timerEl = document.getElementById(cfg.id === 'ramadan' ? 'ramadan-timer' :
                                                 cfg.id === 'eid-al-fitr' ? 'fitr-timer' :
                                                 cfg.id === 'eid-al-adha' ? 'adha-timer' :
                                                 'ny-timer');
        const _tick = () => {
            const now = new Date();
            let diff = _eventGreg.getTime() - now.getTime();
            if (diff < 0) diff = 0;
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            _setText(_P + '-days', days);
            _setText(_P + '-hours', String(hours).padStart(2, '0'));
            _setText(_P + '-mins', String(mins).padStart(2, '0'));
            _setText(_P + '-secs', String(secs).padStart(2, '0'));
            _setText(_P + '-card-days', days + ' ' + (_tt('countdown.days_suffix') || 'يوم'));
            if (_timerEl) {
                _timerEl.classList.toggle('is-close', days > 0 && days <= 5);
                _timerEl.classList.toggle('is-today', days === 0);
            }
        };
        _tick();
        setInterval(_tick, 1000);

        // ── (ح) JSON-LD Schema ──
        try {
            const _schema = {
                '@context': 'https://schema.org',
                '@type': 'Event',
                'name': _tt(_kp + '.event_name') || cfg.id,
                'startDate': _eventGreg.toISOString().slice(0, 10),
                'description': _tt(_kp + '.intro') || '',
                'eventAttendanceMode': 'https://schema.org/MixedEventAttendanceMode',
                'eventStatus': 'https://schema.org/EventScheduled',
                'location': {
                    '@type': 'Place',
                    'name': 'Worldwide',
                    'address': 'Worldwide'
                }
            };
            let _schemaEl = document.getElementById('countdown-schema');
            if (!_schemaEl) {
                _schemaEl = document.createElement('script');
                _schemaEl.id = 'countdown-schema';
                _schemaEl.type = 'application/ld+json';
                document.head.appendChild(_schemaEl);
            }
            _schemaEl.textContent = JSON.stringify(_schema);
        } catch (_) {}

        function _escHtml(s) {
            return String(s == null ? '' : s)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }
    }

    // تفعيل القسم المطلوب من URL param ?page=xxx (مثل /?page=qibla)
    const _pageParam = new URLSearchParams(window.location.search).get('page');
    if (_pageParam && !_isQiblaPage && !_isMsbahaPage && !_isHijriPage && !_isDateConverterPage && !_isZakatPage && !_isMoonPage && !_cdPageKey) {
        const _targetLink = document.querySelector(`.sidebar-nav a[data-page="${_pageParam}"]`);
        if (_targetLink) _targetLink.click();
    }

    // ربط Hero search mirror (يعكس #city-suggestions إلى #loc-hero-suggestions تلقائيّاً)
    try { wireHeroSuggestionsMirror(); } catch (_e) { /* silent */ }

    // Location-hero extras: pick-btn scroll + smart-pill hydration
    try { _wireLocHeroExtras(); } catch (_e) { /* silent */ }

    // تطبيق عناوين SEO الثابتة (country tiles + popular cities في الفوتر)
    try { applyStaticLinkTitlesSEO(); } catch (_e) { /* silent */ }

    // Round 22: تهيئة Sticky Next-Prayer Bar (IntersectionObserver على Hero Banner)
    try { initStickyNextBar(); } catch (_e) { /* silent */ }

    // Round 22: تهيئة Ramadan Countdown Badge (إن كان الصفحة الرئيسيّة)
    try { initRamadanBadge(); } catch (_e) { /* silent */ }
}

// ========= التنقل بين الصفحات =========
// FIX: يحفظ السياق الحاليّ في last_city_context — تستعمله صفحات أخرى عند التنقّل
//   مثل /ramadan-countdown و /eid-* و /hijri-* لتُحافظ على المدينة بدل العودة لمكّة.
function _saveLastCityContextNow() {
    try {
        if (currentLat && currentLng && currentEnglishName) {
            sessionStorage.setItem('last_city_context', JSON.stringify({
                lat: currentLat, lng: currentLng,
                name: currentCity, country: currentCountry,
                englishName: currentEnglishName, countryCode: currentCountryCode,
                timezone: (typeof currentTimezone === 'number') ? currentTimezone : null,
                ts: Date.now()
            }));
        }
    } catch (_) {}
}

// FIX: helper موحّد يضمن أنّ currentLat/currentLng/currentEnglishName معبّأة قبل
//   أي تنقّل من الـ sidebar — يهيّئها من الـ URL الحاليّ أو sessionStorage.
//   يُستعمَل تلقائياً في initNavigation قبل تنفيذ كل branch.
// FIX: يحوّل كل <input type="number"> داخل صفحة محوّل التاريخ إلى combobox-stepper:
//   [−]  [ input ▼ ]  [+]
//   • الكتابة: input عاديّ — مع تثبيت القيمة داخل [min, max]
//   • الاختيار: زرّ ▼ يفتح قائمة بكل القيم من min إلى max — ضغطة تُحدّد
//   • الزيادة/النقصان: أزرار + و − (مع ضغط مطوّل للسرعة)
//   يحترم min/max على الـ input. يُطلِق input+change بعد كل تغيير.
//   • للأيّام: max يُحدَّث ديناميكياً حسب الشهر/السنة المختارَين (28-31 ميلاديّ، 29-30 هجريّ).
function _enhanceConverterSteppers() {
    const _root = document.getElementById('page-date-converter');
    if (!_root) return;

    // ── helper: عدد أيّام الشهر الميلاديّ ──
    //   new Date(y, m, 0).getDate() = آخر يوم من الشهر الميلاديّ (يحسب الكبيسة تلقائياً)
    const _daysInGregMonth = (y, m) => new Date(y, m, 0).getDate();

    // ── helper: عدد أيّام الشهر الهجريّ ──
    //   نستخدم HijriDate.getDaysInHijriMonth مباشرة لأنّ:
    //   1) نفس المكتبة تستخدمها كل صفحات الموقع (تحويل، تقويم، مواقيت).
    //   2) لو استخدمنا حساباً فلكياً مختلفاً → تناقض بين validation الواجهة
    //      ومنطق التحويل (المستخدم يُدخل يوم 30 صفر فيُعطيه التحويل نتيجة خاطئة).
    //   القاعدة: validation الواجهة يجب أن يطابق منطق التحويل.
    const _daysInHijriMonth = (y, m) => {
        try {
            if (typeof HijriDate !== 'undefined' && HijriDate.getDaysInHijriMonth) {
                return HijriDate.getDaysInHijriMonth(y, m);
            }
        } catch (_) {}
        // fallback (لن يُستخدم إن كانت المكتبة محمَّلة): قاعدة الحسابيّ
        if (m === 12) return 29;
        return (m % 2 === 1) ? 30 : 29;
    };

    // ── helper: عدد أيّام الشهر الشمسيّ (Jalali / Persian) ──
    //   • شهور 1-6 (فروردين إلى شهريور):  31 يوماً
    //   • شهور 7-11 (مهر إلى بهمن):       30 يوماً
    //   • شهر 12 (إسفند):                 29 يوماً عاديّة، 30 في السنة الكبيسة
    //   نستخدم round-trip عبر jalaliToGregorian: السنة الكبيسة تحتوي 366 يوماً
    //   فالفرق بين Farvardin 1 لسنة (y) و Farvardin 1 لسنة (y+1) = 366.
    const _isJalaliLeap = (jy) => {
        try {
            if (typeof jalaliToGregorian !== 'function') return false;
            const g0 = jalaliToGregorian(jy, 1, 1);
            const g1 = jalaliToGregorian(jy + 1, 1, 1);
            const d0 = new Date(g0.year, g0.month - 1, g0.day).getTime();
            const d1 = new Date(g1.year, g1.month - 1, g1.day).getTime();
            const diffDays = Math.round((d1 - d0) / 86400000);
            return diffDays === 366;
        } catch (_) { return false; }
    };
    const _daysInJalaliMonth = (y, m) => {
        if (m >= 1 && m <= 6) return 31;
        if (m >= 7 && m <= 11) return 30;
        if (m === 12) return _isJalaliLeap(y) ? 30 : 29;
        return 30; // fallback آمن
    };

    // ── helper: حدّث max لحقل اليوم بناءً على month/year + نوع التقويم ──
    //   ويثبّت قيمته الحاليّة داخل النطاق الجديد.
    const _updateDayMax = (dayInp, monthSel, yearInp, calType) => {
        if (!dayInp || !monthSel || !yearInp) return;
        const m = parseInt(monthSel.value, 10) || 1;
        const y = parseInt(yearInp.value, 10)
                  || (calType === 'hijri' ? 1447 : calType === 'jalali' ? 1404 : 2026);
        let newMax;
        if (calType === 'hijri')      newMax = _daysInHijriMonth(y, m);
        else if (calType === 'jalali') newMax = _daysInJalaliMonth(y, m);
        else                           newMax = _daysInGregMonth(y, m);
        dayInp.max = String(newMax);
        const cur = parseInt(dayInp.value, 10) || 1;
        if (cur > newMax) {
            dayInp.value = String(newMax);
            dayInp.dispatchEvent(new Event('input',  { bubbles: true }));
            dayInp.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // أعد بناء القائمة المنسدلة (إن كانت موجودة)
        if (dayInp._rebuildList) dayInp._rebuildList();
    };

    // ── ربط شهر/سنة → تحديث يوم لكل تقويم ──
    const _wireGroup = (dayId, monthId, yearId, calType) => {
        const di = document.getElementById(dayId);
        const mi = document.getElementById(monthId);
        const yi = document.getElementById(yearId);
        if (!di || !mi || !yi) return;
        const _refresh = () => _updateDayMax(di, mi, yi, calType);
        mi.addEventListener('change', _refresh);
        yi.addEventListener('change', _refresh);
        yi.addEventListener('input',  _refresh);
        // نفّذ مرّة عند التهيئة
        setTimeout(_refresh, 50);
    };
    _wireGroup('conv-g-day', 'conv-g-month', 'conv-g-year', 'gregorian');
    _wireGroup('conv-h-day', 'conv-h-month', 'conv-h-year', 'hijri');
    _wireGroup('conv-s-day', 'conv-s-month', 'conv-s-year', 'jalali');

    _root.querySelectorAll('input[type="number"]').forEach(inp => {
        if (inp.dataset.stepperWrapped === '1') return;
        const min = inp.min !== '' ? parseInt(inp.min, 10) : 1;
        const initMax = inp.max !== '' ? parseInt(inp.max, 10) : 31;
        // قائمة الـ dropdown — تُولَّد فقط للنطاقات المعقولة (≤ 200 قيمة)
        // للسنوات (نطاق كبير)، نولّد ±50 سنة حول القيمة الحاليّة
        const _isLargeRange = (initMax - min) > 200;

        const wrap = document.createElement('div');
        wrap.className = 'number-stepper';
        const minus = document.createElement('button');
        minus.type = 'button';
        minus.className = 'ns-btn ns-minus';
        minus.textContent = '−';
        minus.setAttribute('aria-label', 'Decrease');
        const plus = document.createElement('button');
        plus.type = 'button';
        plus.className = 'ns-btn ns-plus';
        plus.textContent = '+';
        plus.setAttribute('aria-label', 'Increase');
        // زرّ الـ dropdown — مدمج داخل الـ input visually
        const dropBtn = document.createElement('button');
        dropBtn.type = 'button';
        dropBtn.className = 'ns-drop';
        dropBtn.innerHTML = '▼';
        dropBtn.setAttribute('aria-label', 'Open list');
        dropBtn.setAttribute('aria-haspopup', 'listbox');
        dropBtn.setAttribute('aria-expanded', 'false');
        // حاوية الـ input + زرّ الـ dropdown (يُلصقان معاً)
        const inputBox = document.createElement('div');
        inputBox.className = 'ns-input-box';
        // قائمة الخيارات (مخفيّة حتى تُفتح)
        const list = document.createElement('ul');
        list.className = 'ns-list';
        list.setAttribute('role', 'listbox');
        list.hidden = true;

        const parent = inp.parentNode;
        parent.insertBefore(wrap, inp);
        wrap.appendChild(minus);
        wrap.appendChild(inputBox);
        inputBox.appendChild(inp);
        inputBox.appendChild(dropBtn);
        inputBox.appendChild(list);
        wrap.appendChild(plus);

        const _fire = () => {
            inp.dispatchEvent(new Event('input',  { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
        };
        // ── helper: اقرأ الحدّ الأعلى الحاليّ من الـ input (يتغيّر ديناميكياً) ──
        const _curMax = () => (inp.max !== '' ? parseInt(inp.max, 10) : initMax);
        const _curMin = () => (inp.min !== '' ? parseInt(inp.min, 10) : min);
        const _step = (dir) => {
            const cur = parseFloat(inp.value || '0');
            const stp = parseFloat(inp.step || '1') || 1;
            const lo = _curMin(), hi = _curMax();
            let next = cur + (dir * stp);
            if (_isLargeRange) {
                // سنوات / نطاقات كبيرة: clamp بدل wrap-around (تجنّب القفز الكبير)
                if (next < lo) next = lo;
                if (next > hi) next = hi;
            } else {
                // أيّام / شهور: wrap-around مفيد للتنقّل بين أوّل/آخر الشهر
                if (next < lo) next = hi;
                if (next > hi) next = lo;
            }
            inp.value = String(next);
            _fire();
        };
        // ── ثبّت قيمة الـ input داخل [min, max] ── يمنع السالب وخارج النطاق
        const _clamp = () => {
            let v = parseInt(inp.value, 10);
            const lo = _curMin(), hi = _curMax();
            if (isNaN(v)) return; // فارغ — نتجاهل أثناء الكتابة
            if (v < lo) v = lo;
            if (v > hi) v = hi;
            if (String(v) !== inp.value) {
                inp.value = String(v);
            }
        };
        // أثناء الكتابة: أزل الإشارات السالبة والأحرف غير-الرقميّة
        inp.addEventListener('input', () => {
            const cleaned = inp.value.replace(/[^0-9]/g, '');
            if (cleaned !== inp.value) inp.value = cleaned;
        });
        // عند الخروج/blur: ثبّت داخل النطاق
        inp.addEventListener('blur', () => {
            if (inp.value === '') inp.value = String(_curMin());
            _clamp();
            _fire();
        });
        // عند Enter: نفس الـ blur logic
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                _clamp();
                _fire();
                inp.blur();
            }
            // امنع علامة السالب صراحةً
            if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        });
        // ─── ضغط مطوّل للأزرار (350ms ثمّ تكرار كل 100ms) ───
        const _hold = (btn, dir) => {
            let t1 = null, t2 = null;
            const _start = (e) => {
                e.preventDefault();
                _step(dir);
                t1 = setTimeout(() => {
                    t2 = setInterval(() => _step(dir), 100);
                }, 350);
            };
            const _stop = () => { clearTimeout(t1); clearInterval(t2); t1 = t2 = null; };
            btn.addEventListener('mousedown', _start);
            btn.addEventListener('touchstart', _start, { passive: false });
            ['mouseup','mouseleave','touchend','touchcancel','blur'].forEach(ev => btn.addEventListener(ev, _stop));
        };
        _hold(minus, -1);
        _hold(plus,  +1);

        // ─── منطق الـ dropdown ───
        const _buildList = () => {
            list.innerHTML = '';
            const cur = parseInt(inp.value, 10) || _curMin();
            const lo0 = _curMin();
            const hi0 = _curMax();
            let lo = lo0, hi = hi0;
            if (_isLargeRange) {
                // ±50 حول القيمة الحاليّة (بحدود min/max)
                lo = Math.max(lo0, cur - 50);
                hi = Math.min(hi0, cur + 50);
            }
            for (let i = lo; i <= hi; i++) {
                const li = document.createElement('li');
                li.className = 'ns-item';
                li.textContent = i;
                li.setAttribute('role', 'option');
                li.dataset.value = i;
                if (i === cur) li.classList.add('is-selected');
                list.appendChild(li);
            }
        };
        // اعرض الدالّة على الـ input ليُمكن لـ _updateDayMax إعادة بناء القائمة
        inp._rebuildList = _buildList;
        const _openList = () => {
            _buildList();
            list.hidden = false;
            dropBtn.setAttribute('aria-expanded', 'true');
            wrap.classList.add('is-open');
            // مرّر إلى العنصر المحدّد
            const sel = list.querySelector('.is-selected');
            if (sel) sel.scrollIntoView({ block: 'nearest' });
        };
        const _closeList = () => {
            list.hidden = true;
            dropBtn.setAttribute('aria-expanded', 'false');
            wrap.classList.remove('is-open');
        };
        const _toggleList = () => {
            if (list.hidden) _openList(); else _closeList();
        };
        dropBtn.addEventListener('click', (e) => {
            e.preventDefault();
            _toggleList();
        });
        list.addEventListener('click', (e) => {
            const li = e.target.closest('.ns-item');
            if (!li) return;
            inp.value = li.dataset.value;
            _fire();
            _closeList();
            inp.focus();
        });
        // إغلاق عند النقر خارجاً
        document.addEventListener('click', (e) => {
            if (!wrap.contains(e.target)) _closeList();
        });
        // كيبورد: Escape يُغلق، Down/Up يفتح ويتنقّل
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') _closeList();
            else if (e.key === 'ArrowDown' && list.hidden) {
                e.preventDefault();
                _openList();
            }
        });

        inp.dataset.stepperWrapped = '1';
    });
}

function _hydrateCurrentCityFromUrlOrStorage() {
    if (currentLat && currentLng && currentEnglishName) return; // معبّأة بالفعل
    const _p = window.location.pathname;
    // جرّب استخراج slug + إحداثيّات من URL (قمر/قبلة/صلاة)
    const _m = _p.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:qibla-in|prayer-times-in|moon-today-in|moon-in)-([a-z][a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?(?:\/\d{4}-\d{2}-\d{2})?(?:\.html)?$/);
    if (!_m) return;
    const _slug = _m[1];
    const _urlLat = _m[2] != null ? parseFloat(_m[2]) : NaN;
    const _urlLng = _m[3] != null ? parseFloat(_m[3]) : NaN;
    // 1) sessionStorage بمفتاح `city_{slug}` أو `city_moon` أو `city_hijri-*`
    try {
        const _stored = sessionStorage.getItem('city_' + _slug)
                     || sessionStorage.getItem('city_moon');
        if (_stored) {
            const _o = JSON.parse(_stored);
            if (_o && _o.lat != null && _o.lng != null) {
                currentLat = _o.lat; currentLng = _o.lng;
                if (_o.name) currentCity = _o.name;
                if (_o.country) currentCountry = _o.country;
                if (_o.englishName) currentEnglishName = _o.englishName;
                if (_o.countryCode) currentCountryCode = _o.countryCode;
                if (_o.timezone != null) currentTimezone = _o.timezone;
                return;
            }
        }
    } catch (_) {}
    // 2) إحداثيّات من الـ URL مباشرة (إن وُجدت)
    if (isFinite(_urlLat) && isFinite(_urlLng)) {
        currentLat = _urlLat; currentLng = _urlLng;
    }
    // 3) إحداثيّات + اسم من خرائط المدن الشهيرة
    if ((!currentLat || !currentLng) && typeof FAMOUS_MOON_CITIES !== 'undefined' && FAMOUS_MOON_CITIES[_slug]) {
        currentLat = FAMOUS_MOON_CITIES[_slug].lat;
        currentLng = FAMOUS_MOON_CITIES[_slug].lng;
    }
    if (!currentEnglishName && _slug) {
        currentEnglishName = _slug.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
    }
    if (!currentCity && typeof _moonCityDisplayName === 'function') {
        try { currentCity = _moonCityDisplayName(_slug) || currentCity; } catch (_) {}
    }
    if (!currentCountryCode && typeof _MOON_CITY_COUNTRY_KEYS !== 'undefined' && _MOON_CITY_COUNTRY_KEYS[_slug]) {
        currentCountryCode = _MOON_CITY_COUNTRY_KEYS[_slug];
    }
}

// FIX: معالج عامّ يحفظ سياق المدينة الحاليّة قبل أي تنقّل عبر <a> داخل الموقع.
//   يُغطّي moon-event-cards (رمضان/عيد الفطر/عيد الأضحى/رأس السنة الهجريّة)،
//   روابط FAQ، روابط Hijri/تاريخ، وأي رابط داخليّ آخر.
//   لا يُنفَّذ على: الرئيسيّة (/), بادئة لغة فقط (/en/), تنزيلات، روابط جديدة-تبويب.
//   النتيجة: الصفحة الوجهة تقرأ last_city_context وتُحافظ على المدينة بدل العودة لمكّة.
(function _wireGlobalCityCtxOnNav() {
    document.addEventListener('click', function(e) {
        try {
            const a = e.target.closest('a[href]');
            if (!a) return;
            const href = a.getAttribute('href') || '';
            if (!href || href === '#' || href.startsWith('#') || href.startsWith('javascript:')
                || a.target === '_blank' || a.hasAttribute('download')
                || /^(?:https?:|mailto:|tel:)/i.test(href)) return;
            // استثناء الرئيسيّة → نمسح السياق ليعود الافتراضي إلى مكّة
            const _isHomeHref = /^\/?(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/?)?(?:index\.html)?(?:[?#].*)?$/.test(href);
            if (_isHomeHref) {
                try { sessionStorage.removeItem('last_city_context'); } catch (_) {}
                return;
            }
            // ترطيب من الـ URL الحاليّ إن لم تكن globals جاهزة
            _hydrateCurrentCityFromUrlOrStorage();
            _saveLastCityContextNow();
        } catch (_) {}
    }, true /* capture: قبل أي معالج آخر */);
})();

function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.dataset.page;
            // FIX: ترطيب الموقع الحاليّ قبل أي تنقّل (يحلّ مشكلة "يأخذني إلى مكّة دائماً")
            try { _hydrateCurrentCityFromUrlOrStorage(); _saveLastCityContextNow(); } catch (_) {}

            // ── الصفحات التي لها URL خاص → تنقّل فوراً قبل أي تبديل ──────────

            // FIX: helper مساعد لحفظ سياق مدينة باسم مفتاح مخصّص — يأخذ المدينة الحاليّة
            //   إن وُجدت، وإلا يحفظ مكّة كافتراضي. يضمن أن الصفحة الوجهة تجد سياقاً دائماً.
            const _saveCityCtxFor = (key) => {
                try {
                    const _payload = {
                        lat: currentLat || 21.4225,
                        lng: currentLng || 39.8262,
                        name: currentCity || 'مكة المكرمة',
                        country: currentCountry || 'المملكة العربية السعودية',
                        englishName: currentEnglishName || 'Mecca',
                        countryCode: currentCountryCode || 'sa',
                        timezone: (typeof currentTimezone === 'number') ? currentTimezone : 3
                    };
                    sessionStorage.setItem('city_' + key, JSON.stringify(_payload));
                    sessionStorage.setItem('last_city_context', JSON.stringify({ ..._payload, ts: Date.now() }));
                } catch (_) {}
            };

            // التاريخ الهجري → /hijri-date/YYYY-MM-DD (canonical، لا يمرّ بـ /today-hijri-date)
            if (pageId === 'hijri-today' && window.location.protocol !== 'file:') {
                try {
                    const _h = (typeof HijriDate !== 'undefined' && HijriDate.getToday)
                        ? HijriDate.getToday()
                        : null;
                    if (_h) {
                        const _pad2 = (n) => String(n).padStart(2, '0');
                        const _datedPath = `/hijri-date/${_h.year}-${_pad2(_h.month)}-${_pad2(_h.day)}`;
                        const _re = /\/(?:en|fr|tr|ur|de|id|es|bn|ms)?\/?hijri-date\/\d{4}-\d{2}-\d{2}$/;
                        if (!_re.test(window.location.pathname)) {
                            // FIX: حفظ سياق المدينة الحاليّة أو مكّة كافتراضي
                            _saveCityCtxFor('hijri-today');
                            window.location.href = pageUrl(_datedPath);
                        }
                        return;
                    }
                } catch (_e) { /* fallthrough */ }
                // fallback لو مكتبة الهجري غير مُحمّلة
                if (!/\/(?:en\/)?today-hijri-date$/.test(window.location.pathname)) {
                    _saveCityCtxFor('hijri-today');
                    window.location.href = pageUrl('/today-hijri-date');
                }
                return;
            }

            // تحويل التاريخ → /dateconverter
            if (pageId === 'date-converter' && window.location.protocol !== 'file:') {
                if (!/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?dateconverter$/.test(window.location.pathname)) {
                    // FIX: حفظ سياق المدينة الحاليّة أو مكّة كافتراضي
                    _saveCityCtxFor('date-converter');
                    window.location.href = pageUrl('/dateconverter');
                }
                return;
            }

            // حاسبة الزكاة → /zakat-calculator
            if (pageId === 'zakat' && window.location.protocol !== 'file:') {
                if (!/\/(?:(?:en|fr|tr|ur)\/)?zakat-calculator$/.test(window.location.pathname)) {
                    window.location.href = pageUrl('/zakat-calculator');
                }
                return;
            }

            // القمر → /moon-today-in-{slug}[-{lat}-{lng}] — يربط دائمًا بمدينة:
            //   • من صفحة مدينة (prayer-times-in-X / qibla-in-X) → استخدم slugها
            //   • من الرئيسيّة/صفحة عامّة → استخدم المدينة المحدّدة حاليًّا (Mecca افتراضيًّا)
            //   • يبقى كما هو إن كان المستخدم أصلًا على أيّ صفحة قمر
            //
            // Round 12: لأيّ مدينة (حتّى خارج cities-*.json) نضع coord-suffix في الـ URL.
            // الخادم يُصدِر 301 إلى الرابط القصير إن كانت المدينة في الـ DB، وإلّا يرسم
            // الصفحة بـ noindex. هذا يحلّ مشكلة "city not found" نهائيّاً.
            if (pageId === 'moon' && window.location.protocol !== 'file:') {
                const _alreadyOnMoon = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today(?:-in-[a-z][a-z0-9-]+(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?)?$/.test(window.location.pathname);
                if (!_alreadyOnMoon) {
                    // 1) جرّب استخراج slug من URL صفحة المدينة الحاليّة (prayer-times-in-* / qibla-in-*)
                    //    ثمّ تنظيفه من الإحداثيّات: "tokyo-35.6895-139.6917" → "tokyo"
                    let _moonSlug = window.location.pathname.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:prayer-times-in|qibla-in)-(.+?)(?:\.html)?$/)?.[1] || null;
                    if (_moonSlug) {
                        _moonSlug = _moonSlug.replace(/-?-?\d.*$/, '').replace(/-+$/, '');
                    }
                    // 2) fallback: من المدينة الحاليّة في الذاكرة عبر makeSlug (NFD-aware)
                    //    مثال: "São Paulo" → "sao-paulo" (بدل "so-paulo" المُشوَّه).
                    if (!_moonSlug && currentEnglishName) {
                        _moonSlug = makeSlug(currentEnglishName, currentLat, currentLng);
                    }
                    // 3) آخر ملجأ: مكّة
                    if (!_moonSlug) _moonSlug = 'mecca';
                    // ⭐ حفظ موقع المدينة لصفحة القمر — بحيث تُعرَض Tokyo الصحيحة حتّى لو لم تكن في FAMOUS_MOON_CITIES
                    if (currentLat != null && currentLng != null) {
                        try {
                            sessionStorage.setItem('city_moon', JSON.stringify({
                                lat: currentLat, lng: currentLng,
                                name: currentCity, country: currentCountry,
                                englishName: currentEnglishName, countryCode: currentCountryCode,
                                timezone: currentTimezone
                            }));
                        } catch (_e) { /* silent */ }
                    }
                    // Round 12: نُضمّن coord-suffix لكلّ مدينة (حتّى خارج DB).
                    // الخادم يُطبّق 301 إلى الرابط القصير تلقائيّاً للمدن المعروفة.
                    let _moonUrl = `/moon-today-in-${_moonSlug}`;
                    if (currentLat != null && currentLng != null &&
                        isFinite(currentLat) && isFinite(currentLng) &&
                        !/loc-/.test(_moonSlug)) {
                        // إحداثيّات بدقّة معقولة (4 كسور ≈ 11 م)
                        const _latStr = Number(currentLat).toFixed(4);
                        const _lngStr = Number(currentLng).toFixed(4);
                        _moonUrl = `/moon-today-in-${_moonSlug}-${_latStr}-${_lngStr}`;
                    }
                    window.location.href = pageUrl(_moonUrl);
                }
                return;
            }

            // التقويم الهجري → /hijri-calendar (بدون سنة — landing page)
            if (pageId === 'hijri-calendar' && window.location.protocol !== 'file:') {
                if (!/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar$/.test(window.location.pathname)) {
                    // FIX: حفظ سياق المدينة الحاليّة أو مكّة كافتراضي (مع last_city_context)
                    _saveCityCtxFor('hijri-calendar');
                    window.location.href = pageUrl('/hijri-calendar');
                }
                return;
            }

            // ── تحديث الروابط والتبديل للصفحات العادية ──────────────────────

            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const targetPage = document.getElementById('page-' + pageId);
            if (targetPage) {
                targetPage.classList.add('active');
                targetPage.classList.add('fade-in');
                setTimeout(() => targetPage.classList.remove('fade-in'), 400);
            }

            // عند الانتقال لمواقيت الصلاة → انتقل لصفحة المدينة الحاليّة (لا الافتراضيّة).
            // FIX: نوسّع التغطية لتشمل URLs القمر (moon-today-in-* / moon-in-*) والقبلة (qibla-in-*)
            //      والصلاة (prayer-times-in-*). نُسقط الإحداثيّات ولاحقة التاريخ من الـ slug.
            if (pageId === 'prayer-times' && window.location.protocol !== 'file:') {
                let _slug = (currentLat && currentEnglishName)
                    ? makeSlug(currentEnglishName, currentLat, currentLng)
                    : null;
                if (!_slug) {
                    // استخرج من URL الحاليّ (قمر/قبلة/صلاة بأيّ بادئة لغة)
                    const _m = window.location.pathname.match(
                        /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:qibla-in|prayer-times-in|moon-today-in|moon-in)-([a-z][a-z0-9-]+?)(?:\/\d{4}-\d{2}-\d{2})?(?:\.html)?$/
                    );
                    if (_m) {
                        // أزل ذيل الإحداثيّات إن وُجد (مثل: at-taif-21.2854-40.4151)
                        _slug = _m[1].replace(/-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/, '');
                    }
                }
                // FIX: استرجاع موقع المدينة من sessionStorage إذا غاب currentLat
                //   (يحدث عند الوصول لصفحة قمر مباشرةً عبر URL — currentLat لم يُعبَّأ بعد)
                if (_slug && (!currentLat || !currentLng)) {
                    try {
                        const _stored = sessionStorage.getItem('city_moon')
                                     || sessionStorage.getItem('city_' + _slug);
                        if (_stored) {
                            const _o = JSON.parse(_stored);
                            if (_o && _o.lat != null && _o.lng != null) {
                                currentLat = _o.lat; currentLng = _o.lng;
                                if (_o.name) currentCity = _o.name;
                                if (_o.country) currentCountry = _o.country;
                                if (_o.englishName) currentEnglishName = _o.englishName;
                                if (_o.countryCode) currentCountryCode = _o.countryCode;
                                if (_o.timezone != null) currentTimezone = _o.timezone;
                            }
                        }
                    } catch (_e) {}
                }
                if (_slug && currentLat) {
                    // Round 29 fix: إذا كان currentCountryCode فارغاً (قدوم من سياق قمر/قبلة
                    //   حيث لم يُحلّ رمز الدولة) — استنتجه من الـ slug عبر خريطة المدن.
                    let _pcCC = currentCountryCode || '';
                    if (!_pcCC) {
                        // استخرج الـ base slug (بدون الإحداثيّات) لمطابقة خريطة المدن
                        const _baseSlug = String(_slug).replace(/-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/, '');
                        if (typeof _MOON_CITY_COUNTRY_KEYS !== 'undefined' && _MOON_CITY_COUNTRY_KEYS[_baseSlug]) {
                            _pcCC = _MOON_CITY_COUNTRY_KEYS[_baseSlug];
                        }
                    }
                    sessionStorage.setItem(`city_${_slug}`, JSON.stringify({
                        lat: currentLat, lng: currentLng, name: currentCity,
                        country: currentCountry, englishName: currentEnglishName, countryCode: _pcCC, timezone: currentTimezone,
                        _v: 2
                    }));
                    window.location.href = pageUrl(`/prayer-times-in-${_slug}`);
                    return;
                }
            }

            // عند الانتقال لقسم القبلة
            if (pageId === 'qibla') {
                const _alreadyOnQibla = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla-in-/.test(window.location.pathname);
                if (!_alreadyOnQibla && window.location.protocol !== 'file:') {
                    // ── Round 28 fix: إذا كان المستخدم على صفحة سياق-مدينة (قمر/صلاة/…)
                    //   لكن currentLat/currentEnglishName لا يعكسان تلك المدينة (زيارة مباشرة
                    //   لـ /moon-today-in-tokyo-… مثلًا)، استخرج الـ slug + الإحداثيّات من
                    //   الـ URL بدلًا من الاعتماد على الموقع الحاليّ للمستخدم.
                    const _cp = window.location.pathname;
                    let _ctx = null; // { slug, lat, lng }
                    const _mm = _cp.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today-in-([a-z][a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/)
                             || _cp.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-in-([a-z][a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?(?:\/\d{4}-\d{2}-\d{2})?$/)
                             || _cp.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?prayer-times-in-([a-z][a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?(?:\.html)?$/);
                    if (_mm) {
                        const _slug = _mm[1];
                        let _lat = _mm[2] != null ? parseFloat(_mm[2]) : NaN;
                        let _lng = _mm[3] != null ? parseFloat(_mm[3]) : NaN;
                        // Fallback: إحداثيّات المدن المشهورة من FAMOUS_MOON_CITIES
                        if ((!isFinite(_lat) || !isFinite(_lng))
                            && typeof FAMOUS_MOON_CITIES !== 'undefined'
                            && FAMOUS_MOON_CITIES[_slug]) {
                            _lat = FAMOUS_MOON_CITIES[_slug].lat;
                            _lng = FAMOUS_MOON_CITIES[_slug].lng;
                        }
                        if (_slug && isFinite(_lat) && isFinite(_lng)) {
                            _ctx = { slug: _slug, lat: _lat, lng: _lng };
                        }
                    }
                    if (_ctx) {
                        // حفظ جلسة لصفحة القبلة حتّى تعرض اسم المدينة الصحيح.
                        //   نحفظ تحت مفتاحَين:
                        //     (أ) `city_{slug}`                  — لـ /qibla-in-tokyo (بلا إحداثيّات)
                        //     (ب) `city_{slug}-{lat}-{lng}`      — لـ /qibla-in-tokyo-35.68-139.65
                        //   لأنّ getSlugFromURL يُرجع الرمز الكامل بعد "qibla-in-" وهو يختلف
                        //   بين الحالتَين — فنضمن أنّ القيمة تُقرَأ من الجلسة في كلا الحالتَين
                        //   ولا تجري عملية reverse-geocode تعيد اسماً مبنيّاً على الإحداثيّات
                        //   (مثل "東京メトロ丸ノ内線" لـ Tokyo).
                        const _la = Number(_ctx.lat).toFixed(2);
                        const _lo = Number(_ctx.lng).toFixed(2);
                        try {
                            const _enName = (typeof _prettifySlug === 'function')
                                ? _prettifySlug(_ctx.slug)
                                : _ctx.slug.replace(/-/g, ' ');
                            const _displayName = (typeof _moonCityDisplayName === 'function')
                                ? _moonCityDisplayName(_ctx.slug)
                                : _enName;
                            // timezone: لا نحفظ IANA string ("Asia/Tokyo") من FAMOUS_MOON_CITIES
                            //   لأنّ updatePrayerTimes يتوقّع offset رقميّ (ساعات-UTC).
                            //   نتركه فارغاً ليُحلّه loadCityData عبر fetchTimezone(lat,lng).
                            const _tz = null;
                            // اسم الدولة الصحيح للسياق (طوكيو → اليابان، لا السعودية)
                            const _lngNow = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                            const _ctxCountry = (typeof _moonCityCountryName === 'function')
                                ? (_moonCityCountryName(_ctx.slug, _lngNow) || '')
                                : '';
                            // رمز الدولة ISO (tokyo → jp) — ضروري لـ autoSelectMethod ومواقيت الصلاة
                            const _ctxCountryCode = (typeof _MOON_CITY_COUNTRY_KEYS !== 'undefined' && _MOON_CITY_COUNTRY_KEYS[_ctx.slug])
                                ? _MOON_CITY_COUNTRY_KEYS[_ctx.slug]
                                : '';
                            const _sessionPayload = JSON.stringify({
                                lat: _ctx.lat, lng: _ctx.lng,
                                name: _displayName || _enName,
                                country: _ctxCountry,
                                englishName: _enName,
                                countryCode: _ctxCountryCode,
                                timezone: _tz,
                                _v: 2
                            });
                            sessionStorage.setItem(`city_${_ctx.slug}`, _sessionPayload);
                            sessionStorage.setItem(`city_${_ctx.slug}-${_la}-${_lo}`, _sessionPayload);
                        } catch (_e) { /* silent */ }
                        // Emit clean URL (/qibla-in-{slug}) for known cities; keep coords
                        // only for long-tail slugs not in FAMOUS_MOON_CITIES.
                        const _enName = (typeof _prettifySlug === 'function')
                            ? _prettifySlug(_ctx.slug)
                            : _ctx.slug.replace(/-/g, ' ');
                        window.location.href = (typeof _buildQiblaCityUrl === 'function')
                            ? _buildQiblaCityUrl(_enName, _ctx.lat, _ctx.lng, _ctx.slug)
                            : pageUrl(`/qibla-in-${_ctx.slug}-${_la}-${_lo}`);
                        return;
                    }
                    // Fallback الأصليّ: استخدم موقع المستخدم الحاليّ
                    if (currentLat && currentEnglishName) {
                        navigateToQibla(currentLat, currentLng, currentCity, currentCountry, currentEnglishName, currentCountryCode);
                        return;
                    }
                }
                startDeviceCompass();
            }

            // عند الضغط على المسبحة → انتقل لصفحة /msbaha
            if (pageId === 'tasbih' && window.location.protocol !== 'file:') {
                if (!/\/(?:en\/)?msbaha$/.test(window.location.pathname)) {
                    window.location.href = pageUrl('/msbaha');
                    return;
                }
            }

            // إغلاق القائمة على الموبايل
            closeSidebar();
        });
    });

    // اعتراض روابط /hijri-date/ لحفظ المدينة الحالية قبل التنقل
    document.addEventListener('click', function(e) {
        const a = e.target.closest('a[href*="/hijri-date/"]');
        if (!a || window.location.protocol === 'file:') return;
        if (currentLat && currentEnglishName) {
            sessionStorage.setItem('city_hijri-day', JSON.stringify({
                lat: currentLat, lng: currentLng, name: currentCity,
                country: currentCountry, englishName: currentEnglishName,
                countryCode: currentCountryCode, timezone: currentTimezone
            }));
        }
    }, true);
}

// ========= الشريط الجانبي (موبايل) =========
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

// ========= الوضع الداكن/الفاتح (R37) =========
// الـ early-load script في <head> يطبّق الـ data-theme قبل first paint
// (يمنع FOUC). هذه الدالة فقط للنقر اليدويّ من زرّ الهيدر.
function toggleTheme() {
    try {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        const next = isDark ? 'light' : 'dark';
        if (next === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', next);
        // حدّث meta[name=theme-color] لتلوين شريط المتصفّح على الجوال
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) metaThemeColor.setAttribute('content', next === 'dark' ? '#22272e' : '#1e5631');
        const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
        if (metaColorScheme) metaColorScheme.setAttribute('content', next);
    } catch (_e) { /* silent */ }
}
// R37p — restored per user request: site follows OS dark-mode preference on
// both mobile and desktop. Manual toggle (writes localStorage['theme']) takes
// precedence — only when the user hasn't explicitly chosen do we follow the
// system. The matchMedia listener keeps the page in sync if the OS preference
// flips while the page is open.
// ─── Measure top-header height → CSS var --top-header-h ───
// يُستخدم لوضع الأشرطة العلويّة (moon-sticky-bar / sticky-next-bar) أسفل الهيدر تماماً
// بدلاً من تغطيته. يُحدَّث عند load و resize و تغيير DOM.
(function _trackTopHeaderHeight() {
    try {
        const _setVar = () => {
            const _h = document.querySelector('.top-header');
            if (!_h) return;
            const _height = Math.round(_h.getBoundingClientRect().height);
            if (_height > 0) {
                document.documentElement.style.setProperty('--top-header-h', _height + 'px');
            }
        };
        // قياس فوريّ + تكرار قصير لاحتساب FOUC والخطوط
        _setVar();
        window.addEventListener('load', _setVar);
        window.addEventListener('resize', _setVar, { passive: true });
        // observe header content changes (لغة، اسم مدينة طويل، إلخ.)
        const _h = document.querySelector('.top-header');
        if (_h && window.ResizeObserver) {
            const _ro = new ResizeObserver(_setVar);
            _ro.observe(_h);
        }
        // Fallback: re-measure after fonts load
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(_setVar).catch(() => {});
        }
    } catch (_e) { /* silent */ }
})();

(function _watchSystemTheme() {
    try {
        if (!window.matchMedia) return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) document.documentElement.setAttribute('data-theme', 'dark');
                else document.documentElement.removeAttribute('data-theme');
            }
        };
        if (mq.addEventListener) mq.addEventListener('change', handler);
        else if (mq.addListener) mq.addListener(handler); // Safari < 14
    } catch (_e) { /* silent */ }
})();

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
}

// ========= البحث عن المدن =========
function onCitySearchInput(query) {
    clearTimeout(searchDebounceTimer);
    const suggestionsEl = document.getElementById('city-suggestions');
    query = query.trim();

    if (query.length < 2) {
        suggestionsEl.classList.remove('open');
        suggestionsEl.innerHTML = '';
        return;
    }

    const isEnSearch = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';

    // ⚡ عرض فوريّ للنتائج المحلّيّة — بلا debounce. يرى المستخدم النتائج مباشرة.
    const localResults = searchLocalCities(query);
    suggestionsEl.innerHTML = '';
    if (localResults.length > 0) {
        localResults.forEach(city => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            const displayName = isEnSearch ? city.en : city.ar;
            const countryName = isEnSearch ? (city.countryEn || city.country) : city.country;
            const flagImg = city.cc
                ? `<img src="https://flagcdn.com/28x21/${city.cc}.png" class="sugg-flag" alt="${city.cc}" onerror="this.style.display='none'">`
                : `<span style="font-size:1.2rem">🌍</span>`;
            div.innerHTML = `${flagImg}<div><div class="sugg-name">${displayName}</div><div class="sugg-country">${countryName}</div></div>`;
            div.addEventListener('click', async () => {
                document.getElementById('city-search-input').value = displayName;
                suggestionsEl.classList.remove('open');
                await selectCity(city.lat, city.lng, city.ar, countryName, city.en, city.cc);
            });
            suggestionsEl.appendChild(div);
        });
    } else {
        // FIX i18n: نصّ البحث لكل اللغات (10) — كان AR/EN فقط
        suggestionsEl.innerHTML = `<div class="search-loading">${(typeof t === 'function' ? t('search.loading') : null) || '🔍 Searching...'}</div>`;
    }
    suggestionsEl.classList.add('open');

    // استدعاء Nominatim بعد debounce قصير جداً لإثراء النتائج
    searchDebounceTimer = setTimeout(() => {
        fetchCitySuggestions(query);
    }, 120);
}

// ===== قاعدة بيانات محلية للمدن الكبرى (بحث فوري بدون API) =====
const LOCAL_CITIES = [
    // السعودية
    {ar:'مكة المكرمة',en:'Mecca',lat:21.4225,lng:39.8262,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'المدينة المنورة',en:'Medina',lat:24.5247,lng:39.5692,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'الرياض',en:'Riyadh',lat:24.7136,lng:46.6753,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'جدة',en:'Jeddah',lat:21.5433,lng:39.1728,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'الدمام',en:'Dammam',lat:26.4207,lng:50.0888,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'الطائف',en:'Taif',lat:21.2854,lng:40.4151,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'تبوك',en:'Tabuk',lat:28.3998,lng:36.5715,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'أبها',en:'Abha',lat:18.2164,lng:42.5053,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'القصيم',en:'Qassim',lat:26.3260,lng:43.9750,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'الأحساء',en:'Al-Ahsa',lat:25.3833,lng:49.5861,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'حائل',en:'Hail',lat:27.5114,lng:41.7208,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'نجران',en:'Najran',lat:17.4925,lng:44.1277,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'جازان',en:'Jazan',lat:16.8892,lng:42.5511,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'الباحة',en:'Al Baha',lat:20.0129,lng:41.4677,cc:'sa',country:'المملكة العربية السعودية'},
    {ar:'الجوف',en:'Al Jouf',lat:29.9697,lng:38.9435,cc:'sa',country:'المملكة العربية السعودية'},
    // الإمارات
    {ar:'دبي',en:'Dubai',lat:25.2048,lng:55.2708,cc:'ae',country:'الإمارات العربية المتحدة'},
    {ar:'أبوظبي',en:'Abu Dhabi',lat:24.4539,lng:54.3773,cc:'ae',country:'الإمارات العربية المتحدة'},
    {ar:'الشارقة',en:'Sharjah',lat:25.3463,lng:55.4209,cc:'ae',country:'الإمارات العربية المتحدة'},
    // مصر
    {ar:'القاهرة',en:'Cairo',lat:30.0444,lng:31.2357,cc:'eg',country:'مصر'},
    {ar:'الإسكندرية',en:'Alexandria',lat:31.2001,lng:29.9187,cc:'eg',country:'مصر'},
    {ar:'الجيزة',en:'Giza',lat:30.0131,lng:31.2089,cc:'eg',country:'مصر'},
    {ar:'الإسماعيلية',en:'Ismailia',lat:30.5965,lng:32.2715,cc:'eg',country:'مصر'},
    {ar:'أسوان',en:'Aswan',lat:24.0889,lng:32.8998,cc:'eg',country:'مصر'},
    {ar:'الأقصر',en:'Luxor',lat:25.6872,lng:32.6396,cc:'eg',country:'مصر'},
    // الكويت
    {ar:'الكويت',en:'Kuwait City',lat:29.3759,lng:47.9774,cc:'kw',country:'الكويت'},
    // قطر
    {ar:'الدوحة',en:'Doha',lat:25.2854,lng:51.5310,cc:'qa',country:'قطر'},
    // البحرين
    {ar:'المنامة',en:'Manama',lat:26.2154,lng:50.5832,cc:'bh',country:'البحرين'},
    // عُمان
    {ar:'مسقط',en:'Muscat',lat:23.5880,lng:58.3829,cc:'om',country:'عُمان'},
    // اليمن
    {ar:'صنعاء',en:'Sanaa',lat:15.3694,lng:44.1910,cc:'ye',country:'اليمن'},
    {ar:'عدن',en:'Aden',lat:12.7794,lng:45.0367,cc:'ye',country:'اليمن'},
    // الأردن
    {ar:'عمّان',en:'Amman',lat:31.9454,lng:35.9284,cc:'jo',country:'الأردن'},
    // سوريا
    {ar:'دمشق',en:'Damascus',lat:33.5138,lng:36.2765,cc:'sy',country:'سوريا'},
    {ar:'حلب',en:'Aleppo',lat:36.2021,lng:37.1343,cc:'sy',country:'سوريا'},
    // العراق
    {ar:'بغداد',en:'Baghdad',lat:33.3152,lng:44.3661,cc:'iq',country:'العراق'},
    {ar:'البصرة',en:'Basra',lat:30.5085,lng:47.7804,cc:'iq',country:'العراق'},
    {ar:'النجف',en:'Najaf',lat:31.9896,lng:44.3422,cc:'iq',country:'العراق'},
    {ar:'كربلاء',en:'Karbala',lat:32.6160,lng:44.0285,cc:'iq',country:'العراق'},
    // لبنان
    {ar:'بيروت',en:'Beirut',lat:33.8938,lng:35.5018,cc:'lb',country:'لبنان'},
    // المغرب
    {ar:'الرباط',en:'Rabat',lat:34.0209,lng:-6.8416,cc:'ma',country:'المغرب'},
    {ar:'الدار البيضاء',en:'Casablanca',lat:33.5731,lng:-7.5898,cc:'ma',country:'المغرب'},
    {ar:'مراكش',en:'Marrakech',lat:31.6295,lng:-7.9811,cc:'ma',country:'المغرب'},
    {ar:'فاس',en:'Fes',lat:34.0181,lng:-5.0078,cc:'ma',country:'المغرب'},
    // الجزائر
    {ar:'الجزائر',en:'Algiers',lat:36.7372,lng:3.0865,cc:'dz',country:'الجزائر'},
    // تونس
    {ar:'تونس',en:'Tunis',lat:36.8190,lng:10.1658,cc:'tn',country:'تونس'},
    // ليبيا
    {ar:'طرابلس',en:'Tripoli',lat:32.9022,lng:13.1801,cc:'ly',country:'ليبيا'},
    // السودان
    {ar:'الخرطوم',en:'Khartoum',lat:15.5007,lng:32.5599,cc:'sd',country:'السودان'},
    // باكستان
    {ar:'كراتشي',en:'Karachi',lat:24.8607,lng:67.0011,cc:'pk',country:'باكستان'},
    {ar:'لاهور',en:'Lahore',lat:31.5204,lng:74.3587,cc:'pk',country:'باكستان'},
    {ar:'إسلام آباد',en:'Islamabad',lat:33.6844,lng:73.0479,cc:'pk',country:'باكستان'},
    // تركيا
    {ar:'إسطنبول',en:'Istanbul',lat:41.0082,lng:28.9784,cc:'tr',country:'تركيا'},
    {ar:'أنقرة',en:'Ankara',lat:39.9334,lng:32.8597,cc:'tr',country:'تركيا'},
    // إيران
    {ar:'طهران',en:'Tehran',lat:35.6892,lng:51.3890,cc:'ir',country:'إيران'},
    // ماليزيا
    {ar:'كوالالمبور',en:'Kuala Lumpur',lat:3.1390,lng:101.6869,cc:'my',country:'ماليزيا'},
    // إندونيسيا
    {ar:'جاكرتا',en:'Jakarta',lat:-6.2088,lng:106.8456,cc:'id',country:'إندونيسيا'},
    // فلسطين
    {ar:'القدس',en:'Jerusalem',lat:31.7683,lng:35.2137,cc:'ps',country:'فلسطين'},
    {ar:'غزة',en:'Gaza',lat:31.5017,lng:34.4668,cc:'ps',country:'فلسطين'},
    // المملكة المتحدة
    {ar:'لندن',en:'London',lat:51.5074,lng:-0.1278,cc:'gb',country:'المملكة المتحدة'},
    // فرنسا
    {ar:'باريس',en:'Paris',lat:48.8566,lng:2.3522,cc:'fr',country:'فرنسا'},
    // ألمانيا
    {ar:'برلين',en:'Berlin',lat:52.5200,lng:13.4050,cc:'de',country:'ألمانيا'},
    // الولايات المتحدة
    {ar:'نيويورك',en:'New York',lat:40.7128,lng:-74.0060,cc:'us',country:'الولايات المتحدة'},
    {ar:'لوس أنجلوس',en:'Los Angeles',lat:34.0522,lng:-118.2437,cc:'us',country:'الولايات المتحدة'},
    {ar:'واشنطن',en:'Washington',lat:38.9072,lng:-77.0369,cc:'us',country:'الولايات المتحدة'},
    {ar:'شيكاغو',en:'Chicago',lat:41.8781,lng:-87.6298,cc:'us',country:'الولايات المتحدة'},
    {ar:'لاس فيغاس',en:'Las Vegas',lat:36.1699,lng:-115.1398,cc:'us',country:'الولايات المتحدة'},
    {ar:'ميامي',en:'Miami',lat:25.7617,lng:-80.1918,cc:'us',country:'الولايات المتحدة'},
    {ar:'هيوستن',en:'Houston',lat:29.7604,lng:-95.3698,cc:'us',country:'الولايات المتحدة'},
    {ar:'دالاس',en:'Dallas',lat:32.7767,lng:-96.7970,cc:'us',country:'الولايات المتحدة'},
    {ar:'سان فرانسيسكو',en:'San Francisco',lat:37.7749,lng:-122.4194,cc:'us',country:'الولايات المتحدة'},
    {ar:'بوسطن',en:'Boston',lat:42.3601,lng:-71.0589,cc:'us',country:'الولايات المتحدة'},
    {ar:'سياتل',en:'Seattle',lat:47.6062,lng:-122.3321,cc:'us',country:'الولايات المتحدة'},
    {ar:'فيلادلفيا',en:'Philadelphia',lat:39.9526,lng:-75.1652,cc:'us',country:'الولايات المتحدة'},
    {ar:'أتلانتا',en:'Atlanta',lat:33.7490,lng:-84.3880,cc:'us',country:'الولايات المتحدة'},
    {ar:'دنفر',en:'Denver',lat:39.7392,lng:-104.9903,cc:'us',country:'الولايات المتحدة'},
    {ar:'مينيابوليس',en:'Minneapolis',lat:44.9778,lng:-93.2650,cc:'us',country:'الولايات المتحدة'},
    {ar:'بورتلاند',en:'Portland',lat:45.5152,lng:-122.6784,cc:'us',country:'الولايات المتحدة'},
    // كندا
    {ar:'مونتريال',en:'Montreal',lat:45.5017,lng:-73.5673,cc:'ca',country:'كندا'},
    {ar:'فانكوفر',en:'Vancouver',lat:49.2827,lng:-123.1207,cc:'ca',country:'كندا'},
    {ar:'أوتاوا',en:'Ottawa',lat:45.4215,lng:-75.6972,cc:'ca',country:'كندا'},
    {ar:'كالغاري',en:'Calgary',lat:51.0447,lng:-114.0719,cc:'ca',country:'كندا'},
    // اليابان/كوريا/الصين (city-states & metropolises)
    {ar:'طوكيو',en:'Tokyo',lat:35.6762,lng:139.6503,cc:'jp',country:'اليابان'},
    {ar:'أوساكا',en:'Osaka',lat:34.6937,lng:135.5023,cc:'jp',country:'اليابان'},
    {ar:'سيول',en:'Seoul',lat:37.5665,lng:126.9780,cc:'kr',country:'كوريا الجنوبية'},
    {ar:'بكين',en:'Beijing',lat:39.9042,lng:116.4074,cc:'cn',country:'الصين'},
    {ar:'شنغهاي',en:'Shanghai',lat:31.2304,lng:121.4737,cc:'cn',country:'الصين'},
    {ar:'هونغ كونغ',en:'Hong Kong',lat:22.3193,lng:114.1694,cc:'hk',country:'هونغ كونغ'},
    {ar:'سنغافورة',en:'Singapore',lat:1.3521,lng:103.8198,cc:'sg',country:'سنغافورة'},
    {ar:'بانكوك',en:'Bangkok',lat:13.7563,lng:100.5018,cc:'th',country:'تايلاند'},
    {ar:'مانيلا',en:'Manila',lat:14.5995,lng:120.9842,cc:'ph',country:'الفلبين'},
    // أوروبا الكبرى
    {ar:'موسكو',en:'Moscow',lat:55.7558,lng:37.6173,cc:'ru',country:'روسيا'},
    {ar:'روما',en:'Rome',lat:41.9028,lng:12.4964,cc:'it',country:'إيطاليا'},
    {ar:'مدريد',en:'Madrid',lat:40.4168,lng:-3.7038,cc:'es',country:'إسبانيا'},
    {ar:'فيينا',en:'Vienna',lat:48.2082,lng:16.3738,cc:'at',country:'النمسا'},
    {ar:'أمستردام',en:'Amsterdam',lat:52.3676,lng:4.9041,cc:'nl',country:'هولندا'},
    {ar:'هامبورغ',en:'Hamburg',lat:53.5511,lng:9.9937,cc:'de',country:'ألمانيا'},
    {ar:'ميونخ',en:'Munich',lat:48.1351,lng:11.5820,cc:'de',country:'ألمانيا'},
    // أخرى
    {ar:'مكسيكو سيتي',en:'Mexico City',lat:19.4326,lng:-99.1332,cc:'mx',country:'المكسيك'},
    {ar:'بوينس آيرس',en:'Buenos Aires',lat:-34.6037,lng:-58.3816,cc:'ar',country:'الأرجنتين'},
    {ar:'ساو باولو',en:'São Paulo',lat:-23.5505,lng:-46.6333,cc:'br',country:'البرازيل'},
    {ar:'سيدني',en:'Sydney',lat:-33.8688,lng:151.2093,cc:'au',country:'أستراليا'},
    {ar:'تورنتو',en:'Toronto',lat:43.6532,lng:-79.3832,cc:'ca',country:'كندا'},
    // R35 expansion — fill country gaps so nearest-city lookup never returns a far-away city
    // الهند
    {ar:'مومباي',en:'Mumbai',lat:19.0760,lng:72.8777,cc:'in',country:'الهند'},
    {ar:'دلهي',en:'Delhi',lat:28.6139,lng:77.2090,cc:'in',country:'الهند'},
    {ar:'حيدر آباد',en:'Hyderabad',lat:17.3850,lng:78.4867,cc:'in',country:'الهند'},
    {ar:'بنغالور',en:'Bengaluru',lat:12.9716,lng:77.5946,cc:'in',country:'الهند'},
    {ar:'كولكاتا',en:'Kolkata',lat:22.5726,lng:88.3639,cc:'in',country:'الهند'},
    {ar:'تشيناي',en:'Chennai',lat:13.0827,lng:80.2707,cc:'in',country:'الهند'},
    // نيجيريا
    {ar:'لاغوس',en:'Lagos',lat:6.5244,lng:3.3792,cc:'ng',country:'نيجيريا'},
    {ar:'كانو',en:'Kano',lat:12.0022,lng:8.5920,cc:'ng',country:'نيجيريا'},
    {ar:'أبوجا',en:'Abuja',lat:9.0765,lng:7.3986,cc:'ng',country:'نيجيريا'},
    {ar:'إيبادان',en:'Ibadan',lat:7.3776,lng:3.9470,cc:'ng',country:'نيجيريا'},
    // إندونيسيا
    {ar:'سورابايا',en:'Surabaya',lat:-7.2575,lng:112.7521,cc:'id',country:'إندونيسيا'},
    {ar:'باندونغ',en:'Bandung',lat:-6.9175,lng:107.6191,cc:'id',country:'إندونيسيا'},
    {ar:'ميدان',en:'Medan',lat:3.5952,lng:98.6722,cc:'id',country:'إندونيسيا'},
    {ar:'ماكاسار',en:'Makassar',lat:-5.1477,lng:119.4327,cc:'id',country:'إندونيسيا'},
    // باكستان
    {ar:'فيصل آباد',en:'Faisalabad',lat:31.4504,lng:73.1350,cc:'pk',country:'باكستان'},
    {ar:'مولتان',en:'Multan',lat:30.1575,lng:71.5249,cc:'pk',country:'باكستان'},
    // تركيا
    {ar:'إزمير',en:'Izmir',lat:38.4192,lng:27.1287,cc:'tr',country:'تركيا'},
    {ar:'بورصة',en:'Bursa',lat:40.1828,lng:29.0665,cc:'tr',country:'تركيا'},
    // ألمانيا
    {ar:'كولونيا',en:'Cologne',lat:50.9375,lng:6.9603,cc:'de',country:'ألمانيا'},
    {ar:'فرانكفورت',en:'Frankfurt',lat:50.1109,lng:8.6821,cc:'de',country:'ألمانيا'},
    // المملكة المتحدة
    {ar:'برمنغهام',en:'Birmingham',lat:52.4862,lng:-1.8904,cc:'gb',country:'المملكة المتحدة'},
    {ar:'مانشستر',en:'Manchester',lat:53.4808,lng:-2.2426,cc:'gb',country:'المملكة المتحدة'},
    // فرنسا
    {ar:'مرسيليا',en:'Marseille',lat:43.2965,lng:5.3698,cc:'fr',country:'فرنسا'},
    {ar:'ليون',en:'Lyon',lat:45.7640,lng:4.8357,cc:'fr',country:'فرنسا'},
    // روسيا
    {ar:'سانت بطرسبرغ',en:'Saint Petersburg',lat:59.9311,lng:30.3609,cc:'ru',country:'روسيا'},
    {ar:'كازان',en:'Kazan',lat:55.8304,lng:49.0661,cc:'ru',country:'روسيا'},
    // الصين
    {ar:'قوانغتشو',en:'Guangzhou',lat:23.1291,lng:113.2644,cc:'cn',country:'الصين'},
];

// ═══ المدن-المحافظات/العواصم الخاصّة (city-states & special metropolises) ═══
// Nominatim يُصنّف هذه كـstate/province/region رغم أنّها فعليّاً مدن (مثل Tokyo, HK, Singapore).
// الاسم هنا = name:en من Nominatim — يُستخدم لاستثنائها من whitelist rejection.
const SPECIAL_CITY_STATES = new Set([
    'Tokyo', 'Hong Kong', 'Macau', 'Macao', 'Singapore',
    'Kuala Lumpur', 'Jakarta', 'Special Capital Region of Jakarta',
    'Seoul', 'Bangkok', 'Manila',
    'Beijing', 'Shanghai', 'Chongqing', 'Tianjin',
    'Moscow', 'Saint Petersburg', 'St. Petersburg',
    'Berlin', 'Hamburg', 'Bremen',
    'Vienna', 'Wien',
    'Washington, D.C.', 'Washington',
    'Mexico City',
    'Buenos Aires',
    'Brasília', 'Brasilia',
    'Bucharest', 'București',
    'Budapest',
    'Vatican City',
    'Monaco', 'Monaco-Ville',
    'San Marino',
    'Andorra la Vella'
]);

// Arabic normalization — توحيد الهمزات والألف والتاء المربوطة حتّى يطابق "الاسكندر" → "الإسكندرية"
function _normArabic(s) {
    if (!s) return '';
    return String(s)
        .toLowerCase()
        .replace(/[إأآٱا]/g, 'ا')           // كلّ أشكال الألف → ا
        .replace(/ى/g, 'ي')                   // ألف مقصورة → ياء
        .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
        .replace(/ة/g, 'ه')                   // تاء مربوطة → هاء (يتجاوز اختلاف ة/ه)
        .replace(/[\u064B-\u065F\u0670]/g, ''); // إزالة التشكيل
}
function searchLocalCities(query) {
    const qRaw  = query.trim().toLowerCase();
    const qNorm = _normArabic(qRaw);
    if (!qRaw) return [];
    // ترتيب ذكيّ: prefix match أوّلاً ثمّ substring — لتظهر "لاس فيغاس" قبل "دالاس" عند البحث عن "لاس"
    const scored = [];
    for (const c of LOCAL_CITIES) {
        const arNorm = _normArabic(c.ar);
        const enLow  = c.en.toLowerCase();
        let score = 0;
        if (arNorm.startsWith(qNorm) || enLow.startsWith(qRaw))      score = 3;
        else if (arNorm.includes(' ' + qNorm) || enLow.includes(' ' + qRaw)) score = 2; // تطابق بداية كلمة ثانية
        else if (arNorm.includes(qNorm) || enLow.includes(qRaw))     score = 1;
        if (score > 0) scored.push({ c, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6).map(x => x.c);
}

function fetchCitySuggestions(query) {
    const suggestionsEl = document.getElementById('city-suggestions');
    const currentLang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const isEnSugg = (currentLang === 'en');

    // ===== دالة عرض عنصر اقتراح من LOCAL_CITIES =====
    function renderLocalItem(city) {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        const displayName = isEnSugg ? city.en : city.ar;
        const countryName = isEnSugg ? (city.countryEn || city.country) : city.country;
        const flagImg = city.cc
            ? `<img src="https://flagcdn.com/28x21/${city.cc}.png" class="sugg-flag" alt="${city.cc}" onerror="this.style.display='none'">`
            : `<span style="font-size:1.2rem">🌍</span>`;
        div.innerHTML = `${flagImg}<div><div class="sugg-name">${displayName}</div><div class="sugg-country">${countryName}</div></div>`;
        div.addEventListener('click', async () => {
            document.getElementById('city-search-input').value = displayName;
            suggestionsEl.classList.remove('open');
            await selectCity(city.lat, city.lng, city.ar, countryName, city.en, city.cc);
        });
        return div;
    }

    // ===== عرض النتائج المحلية فوراً =====
    const localResults = searchLocalCities(query);
    suggestionsEl.innerHTML = '';
    if (localResults.length > 0) {
        localResults.forEach(city => suggestionsEl.appendChild(renderLocalItem(city)));
        suggestionsEl.classList.add('open');
    } else {
        // FIX i18n: نصّ البحث لكل اللغات
        suggestionsEl.innerHTML = `<div class="search-loading">${(typeof t === 'function' ? t('search.loading') : null) || '⏳ Searching...'}</div>`;
        suggestionsEl.classList.add('open');
    }

    // ===== ثم جلب نتائج Nominatim وإضافتها =====
    // Nominatim يدعم كلّ الأكواد الـ10 كـ accept-language — نُمرّر لغة المستخدم الحاليّة
    const searchLang = currentLang;
    const base = `format=json&limit=8&accept-language=${searchLang}&addressdetails=1&namedetails=1`;
    const urlQ    = nomUrl(`https://nominatim.openstreetmap.org/search?${base}&q=${encodeURIComponent(query)}`);
    const urlCity = nomUrl(`https://nominatim.openstreetmap.org/search?${base}&city=${encodeURIComponent(query)}`);

    Promise.all([
        fetch(urlQ).then(r => r.json()).catch(() => []),
        fetch(urlCity).then(r => r.json()).catch(() => [])
    ])
    .then(([resQ, resCity]) => {
        if (!Array.isArray(resQ)) resQ = [];
        if (!Array.isArray(resCity)) resCity = [];

        // دمج النتائج مع إزالة المكررات بـ place_id
        const seen = new Set();
        const all  = [...resQ, ...resCity].filter(p => {
            if (!p || seen.has(p.place_id)) return false;
            seen.add(p.place_id);
            return true;
        });

        // ===== دالة عرض زر البحث الخارجي =====
        function showOnlineSearchBtn() {
            const btn = document.createElement('div');
            btn.className = 'sugg-online-btn';
            // FIX i18n: نصّ البحث الأونلاين لكل اللغات
            const _onlineLbl = (typeof t === 'function' ? t('search.online_for') : null) || 'Search online for';
            btn.innerHTML = `<span>🌐</span> ${_onlineLbl} "${query}"`;
            btn.addEventListener('click', () => {
                const _searchingLbl = (typeof t === 'function' ? t('search.loading') : null) || '⏳ Searching...';
                btn.innerHTML = `<span>⏳</span> ${_searchingLbl}`;
                btn.style.opacity = '0.6';
                btn.style.pointerEvents = 'none';
                fetchCityOnlineBroader(query);
            });
            suggestionsEl.appendChild(btn);
        }

        // قائمة بيضاء صارمة (Tier 1): مدن/قرى/بلدات/مزارع صغيرة
        const acceptedTypes = new Set(['city', 'town', 'village', 'municipality', 'borough', 'hamlet', 'locality']);
        // ─── الفلتر الصارم (Tier 1) ───
        const _strictFilter = (p) => {
            if (p.class === 'country' || p.class === 'highway') return false;
            const addrT  = p.addresstype || '';
            const plainT = p.type || '';
            const _nmEn = (p.namedetails?.['name:en'] || p.name || '').trim();
            const isSpecialCityState = SPECIAL_CITY_STATES.has(_nmEn);
            if (!acceptedTypes.has(addrT) && !acceptedTypes.has(plainT) && !isSpecialCityState) return false;
            const rawName   = p.name || '';
            const ndName    = (p.namedetails && (p.namedetails.name || p.namedetails['name:en'])) || '';
            const firstPart = (p.display_name || '').split(',')[0] || '';
            if (!isSpecialCityState) {
                if (_isAdminOrStreetLike(rawName))   return false;
                if (_isAdminOrStreetLike(ndName))    return false;
                if (_isAdminOrStreetLike(firstPart)) return false;
            }
            const _rawEn = (p.namedetails?.['name:en'] || p.namedetails?.['name:en-US']
                || (p.address && (p.address.city || p.address.town || p.address.village))
                || firstPart || '');
            if (_isWardLike(rawName) || _isWardLike(_rawEn)) return false;
            return true;
        };
        // ─── الفلتر المتساهل (Tier 2 — fallback): يقبل أي مكان مأهول له إحداثيّات
        //   مفيد للمدن/القرى الصغيرة التي لا يصنّفها OSM دائماً بـ city/town/village.
        //   نرفض فقط ما هو ليس "مكان": دولة، طريق، مبنى، POI، حدود إداريّة بحتة.
        const _laxRejectTypes = new Set(['country', 'highway', 'building', 'amenity', 'shop',
            'office', 'leisure', 'tourism', 'historic', 'craft', 'man_made']);
        const _laxFilter = (p) => {
            if (_laxRejectTypes.has(p.class)) return false;
            // يجب أن يكون له إحداثيّات صالحة
            const lat = parseFloat(p.lat), lon = parseFloat(p.lon);
            if (!isFinite(lat) || !isFinite(lon)) return false;
            // يجب أن يكون له اسم
            if (!p.name && !p.display_name) return false;
            // استبعد الشوارع/الأحياء الواضحة بالاسم
            const firstPart = (p.display_name || '').split(',')[0] || '';
            if (_isAdminOrStreetLike(firstPart) && !p.namedetails?.name) return false;
            return true;
        };
        // Tier 1: صارم
        let results = all.filter(_strictFilter);
        // Tier 2: لو فاضي → أعد المحاولة بالفلتر المرن (لا تُسقط نتائج صارمة موجودة)
        if (results.length === 0) {
            results = all.filter(_laxFilter);
        }

        const typeRank = p => {
            const t = p.addresstype || p.type || '';
            if (t === 'city')                                       return 0;
            if (['town', 'municipality'].includes(t))               return 1;
            if (['village', 'hamlet'].includes(t))                  return 2;
            if (['suburb', 'quarter', 'neighbourhood'].includes(t)) return 3;
            return 4;
        };
        results.sort((a, b) => {
            const tr = typeRank(a) - typeRank(b);
            return tr !== 0 ? tr : (b.importance || 0) - (a.importance || 0);
        });
        results = results.slice(0, 6);

        // إعادة بناء القائمة: المحلية أولاً ثم نتائج Nominatim الجديدة
        suggestionsEl.innerHTML = '';

        // عرض النتائج المحلية أولاً
        const localSet = new Set(localResults.map(c => c.ar + '|' + c.en));
        localResults.forEach(city => suggestionsEl.appendChild(renderLocalItem(city)));

        // إضافة نتائج Nominatim التي لا تتكرر مع المحلية
        results.forEach((place) => {
            const addr = place.address || {};
            const nd   = place.namedetails || {};

            // فلتر اسميّ إضافيّ متعدّد اللغات (belt & suspenders)
            const rawName = place.name || '';
            if (_isAdminOrStreetLike(rawName)) return;

            // المدينة الرئيسية فقط (بدون أحياء)
            const arCityMain = nd['name:ar'] || addr.city || addr.town || addr.village || addr.municipality || place.name || '';
            // Nominatim بلغة عربية قد لا يُرجِع name:en — لكن nd.name هو الـ endonym (Tromsø, Zürich…)
            // لذا نُفضِّله كبديل Latin موثوق، ثم نُطبّق _latinOr على بقيّة الحقول لتصفية العربي/CJK.
            const rawEnCity  = nd['name:en'] || nd['name:en-US']
                    || _latinOr(nd.name)
                    || _latinOr(place.name)
                    || _latinOr(addr.city) || _latinOr(addr.town) || _latinOr(addr.village) || _latinOr(addr.municipality)
                    || place.display_name.split(',')[0];
            const enCityMain = rawEnCity.replace(/\s*District\b/gi, '').trim();

            // تجنب التكرار مع النتائج المحلية
            const dupKey = arCityMain + '|' + enCityMain;
            if (localSet.has(dupKey)) return;

            const country     = addr.country || '';
            const countryCode = (addr.country_code || '').toLowerCase();
            const displayCity = isEnSugg ? enCityMain : arCityMain;
            const flagImg = countryCode
                ? `<img src="https://flagcdn.com/28x21/${countryCode}.png" class="sugg-flag" alt="${countryCode}" onerror="this.style.display='none'">`
                : `<span style="font-size:1.2rem">🌍</span>`;

            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `${flagImg}<div><div class="sugg-name">${displayCity}</div><div class="sugg-country">${country}</div></div>`;
            div.addEventListener('click', async () => {
                document.getElementById('city-search-input').value = displayCity;
                suggestionsEl.classList.remove('open');
                currentEnglishDisplayName = enCityMain;
                await selectCity(parseFloat(place.lat), parseFloat(place.lon), arCityMain, country, enCityMain, countryCode);
            });
            suggestionsEl.appendChild(div);
        });

        // إذا لم توجد أي نتائج أضف زر البحث الخارجي
        if (localResults.length === 0 && results.length === 0) {
            showOnlineSearchBtn();
        } else if (results.length === 0 && localResults.length > 0) {
            // نتائج محلية فقط — لا حاجة لزر خارجي إلا إذا أراد المستخدم المزيد
        } else {
            // يوجد نتائج — لا نضيف زر خارجي تلقائياً
        }

        suggestionsEl.classList.add('open');
    })
    .catch(() => {
        // في حالة الخطأ: نُبقي على النتائج المحلية إن وجدت
        if (localResults.length === 0) {
            const _errMsg = (typeof t === 'function')
                ? `${t('cities_page.error')} ${t('cities_page.check_connection')}`
                : (isEnSugg ? 'Error, check your connection' : 'حدث خطأ، تحقق من الاتصال');
            suggestionsEl.innerHTML = `<div class="search-loading">${_errMsg}</div>`;
        }
    });
}

function onSearchKeyDown(e) {
    const suggestions = document.querySelectorAll('.suggestion-item');
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        searchFocusedIndex = Math.min(searchFocusedIndex + 1, suggestions.length - 1);
        suggestions.forEach((s, i) => s.classList.toggle('focused', i === searchFocusedIndex));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        searchFocusedIndex = Math.max(searchFocusedIndex - 1, 0);
        suggestions.forEach((s, i) => s.classList.toggle('focused', i === searchFocusedIndex));
    } else if (e.key === 'Enter' && searchFocusedIndex >= 0) {
        e.preventDefault();
        suggestions[searchFocusedIndex]?.click();
    } else if (e.key === 'Escape') {
        document.getElementById('city-suggestions').classList.remove('open');
        closeSettingsModal(); // إغلاق Modal الإعدادات إن كانت مفتوحة
    }
}

// ===== البحث الخارجي الموسّع (مدن وقرى فقط، لا مناطق) =====
function fetchCityOnlineBroader(query) {
    const suggestionsEl = document.getElementById('city-suggestions');
    if (!suggestionsEl) return;

    // Nominatim يدعم كلّ الأكواد الـ10 — نُمرّر لغة المستخدم الحاليّة
    const currentLang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const isEn = (currentLang === 'en');
    const searchLang = currentLang;
    const url = nomUrl(`https://nominatim.openstreetmap.org/search?format=json&limit=15&accept-language=${searchLang}&addressdetails=1&namedetails=1&q=${encodeURIComponent(query)}`);

    // قائمة بيضاء: مدن/قرى/بلدات + hamlet/locality للمدن الصغيرة
    const accepted = new Set(['city','town','village','municipality','borough','hamlet','locality']);

    fetch(url)
        .then(r => r.json())
        .catch(() => [])
        .then(data => {
            suggestionsEl.innerHTML = '';

            // ─── helpers: فلترة مع dedup ───
            const seen = new Set();
            const _dedup = (p) => {
                if (seen.has(p.place_id)) return false;
                seen.add(p.place_id);
                return true;
            };
            // Tier 1 (صارم): مدن/قرى/بلدات + hamlet/locality
            const _strict = (p) => {
                if (p.class === 'country' || p.class === 'highway') return false;
                const addrT  = p.addresstype || '';
                const plainT = p.type || '';
                const _nmEn2 = (p.namedetails?.['name:en'] || p.name || '').trim();
                const isSpecialCityState = SPECIAL_CITY_STATES.has(_nmEn2);
                if (!accepted.has(addrT) && !accepted.has(plainT) && !isSpecialCityState) return false;
                const nm        = p.name || '';
                const ndName2   = (p.namedetails && (p.namedetails.name || p.namedetails['name:en'])) || '';
                const firstPart = (p.display_name || '').split(',')[0] || '';
                if (!isSpecialCityState) {
                    if (_isAdminOrStreetLike(nm))        return false;
                    if (_isAdminOrStreetLike(ndName2))   return false;
                    if (_isAdminOrStreetLike(firstPart)) return false;
                }
                const _rawEnForWard = (p.namedetails?.['name:en'] || p.namedetails?.['name:en-US']
                    || (p.address && (p.address.city || p.address.town || p.address.village))
                    || firstPart || '');
                if (_isWardLike(nm) || _isWardLike(_rawEnForWard)) return false;
                return true;
            };
            // Tier 2 (مرن): أيّ مكان جغرافيّ — يرفض فقط الواضح غير-المكاني
            const _laxRejectTypes = new Set(['country', 'highway', 'building', 'amenity',
                'shop', 'office', 'leisure', 'tourism', 'historic', 'craft', 'man_made']);
            const _lax = (p) => {
                if (_laxRejectTypes.has(p.class)) return false;
                const lat = parseFloat(p.lat), lon = parseFloat(p.lon);
                if (!isFinite(lat) || !isFinite(lon)) return false;
                if (!p.name && !p.display_name) return false;
                return true;
            };
            const arr = (data || []).filter(_dedup);
            // Tier 1 أوّلاً
            let results = arr.filter(_strict).slice(0, 6);
            // Tier 2 لو فاضي
            if (results.length === 0) {
                seen.clear();
                results = (data || []).filter(_dedup).filter(_lax).slice(0, 6);
            }

            if (results.length === 0) {
                const _noRes = (typeof t === 'function')
                    ? t('cities_page.no_results')
                    : (isEn ? 'No results found' : 'لم يُعثر على نتائج');
                suggestionsEl.innerHTML = `<div class="search-loading">${_noRes}</div>`;
                return;
            }

            results.forEach(place => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                const addr        = place.address || {};
                const nd          = place.namedetails || {};

                // المدينة الرئيسية فقط (بدون أحياء)
                const arCityMain  = nd['name:ar'] || addr.city || addr.town || addr.village || addr.municipality || place.name || place.display_name.split(',')[0];
                const rawEnName   = nd['name:en'] || nd['name:en-US']
                        || _latinOr(nd.name) || _latinOr(place.name)
                        || _latinOr(addr.city) || _latinOr(addr.town) || _latinOr(addr.village) || _latinOr(addr.municipality)
                        || place.display_name.split(',')[0];
                const englishName = rawEnName.replace(/\s*District\b/gi, '').trim();

                const displayCity = isEn ? (englishName || place.name) : arCityMain;
                const country     = addr.country || '';
                const cc          = (addr.country_code || '').toLowerCase();
                const flagImg     = cc ? `<img src="https://flagcdn.com/28x21/${cc}.png" class="sugg-flag" alt="${cc}" onerror="this.style.display='none'">` : `<span style="font-size:1.2rem">🌍</span>`;
                div.innerHTML = `${flagImg}<div><div class="sugg-name">${displayCity}</div><div class="sugg-country">${country}</div></div>`;
                div.addEventListener('click', async () => {
                    document.getElementById('city-search-input').value = displayCity;
                    suggestionsEl.classList.remove('open');
                    currentEnglishDisplayName = englishName;
                    await selectCity(parseFloat(place.lat), parseFloat(place.lon), arCityMain, country, englishName, cc);
                });
                suggestionsEl.appendChild(div);
            });
        });
}

// بناء رابط مدينة (نظيف بدون params)
function buildCityUrl(lat, lng, city, country, englishName) {
    const slug = makeSlug(englishName || city, lat, lng);
    if (window.location.protocol === 'file:') {
        return `#prayer-times-in-${slug}`;
    }
    return pageUrl(`/prayer-times-in-${slug}`);
}

// التنقل الحقيقي لصفحة المدينة (حفظ البيانات في sessionStorage)
function navigateToCity(lat, lng, city, country, englishName = '', countryCode = '') {
    let slug = makeSlug(englishName || city, lat, lng);
    // Djibouti: slug الافتراضي "djibouti" يتضارب مع slug الدولة (/prayer-times-in-djibouti
    // يُعالَج كـ "قائمة مدن دولة"). نستعمل slug خاصّاً "djibouti-city" للعاصمة فقط.
    if (slug === 'djibouti' && (countryCode || '').toLowerCase() === 'dj') {
        slug = 'djibouti-city';
    }
    // Singapore: نفس التضارب — slug "singapore" يطابق slug الدولة. نحوّله إلى "singapore-city".
    if (slug === 'singapore' && (countryCode || '').toLowerCase() === 'sg') {
        slug = 'singapore-city';
    }
    // لا نخزّن timezone هنا لأن currentTimezone قد يكون للمدينة السابقة
    // سيتم جلب timezone الصحيح عند تحميل الصفحة الجديدة
    sessionStorage.setItem(`city_${slug}`, JSON.stringify({ lat, lng, name: city, country, englishName, countryCode, _v: 2 }));
    if (window.location.protocol === 'file:') {
        window.location.hash = `prayer-times-in-${slug}`;
    } else {
        window.location.href = pageUrl(`/prayer-times-in-${slug}`);
    }
}

// اختيار طريقة الحساب تلقائياً — يعتمد على كود الدولة ISO (ثابت دائماً بغض النظر عن اللغة)
function autoSelectMethod(countryCode, countryName) {
    // خريطة كود ISO → طريقة الحساب
    const codeMap = {
        // الخليج والجزيرة العربية
        'sa': 'Makkah', 'ae': 'Makkah', 'bh': 'Makkah', 'om': 'Makkah', 'ye': 'Makkah',
        'kw': 'Kuwait',
        'qa': 'Qatar',
        // المشرق العربي
        'sy': 'Makkah', 'iq': 'MWL', 'jo': 'MWL', 'lb': 'MWL', 'ps': 'MWL',
        // شمال أفريقيا
        'eg': 'Egypt', 'ly': 'Egypt', 'sd': 'Egypt', 'ss': 'Egypt',
        'dz': 'MWL', 'ma': 'MWL', 'tn': 'MWL', 'mr': 'MWL',
        // أفريقيا جنوب الصحراء
        'so': 'MWL', 'et': 'MWL', 'ng': 'MWL', 'sn': 'MWL', 'ml': 'MWL',
        'ne': 'MWL', 'td': 'MWL', 'gh': 'MWL', 'tz': 'MWL', 'ke': 'MWL',
        'mz': 'MWL', 'gn': 'MWL', 'bf': 'MWL', 'ci': 'MWL', 'cm': 'MWL',
        'gm': 'MWL', 'sl': 'MWL', 'tg': 'MWL', 'bj': 'MWL', 'ug': 'MWL',
        // آسيا الوسطى والجنوبية
        'pk': 'Karachi', 'in': 'Karachi', 'bd': 'Karachi', 'af': 'Karachi',
        'kz': 'MWL', 'uz': 'MWL', 'tm': 'MWL', 'tj': 'MWL', 'kg': 'MWL',
        // الشرق الأوسط
        'ir': 'Tehran',
        'tr': 'Turkey',
        'az': 'MWL',
        // جنوب شرق آسيا
        'my': 'Singapore', 'id': 'Singapore', 'sg': 'Singapore',
        'bn': 'MWL', 'ph': 'MWL', 'th': 'MWL', 'mm': 'MWL',
        // أمريكا الشمالية
        'us': 'ISNA', 'ca': 'ISNA',
        // أمريكا اللاتينية — تستخدم طريقة أمريكا الشمالية (ISNA)
        'mx': 'ISNA', 'br': 'ISNA', 'ar': 'ISNA', 'co': 'ISNA', 've': 'ISNA',
        'cl': 'ISNA', 'pe': 'ISNA', 'ec': 'ISNA', 'bo': 'ISNA', 'py': 'ISNA',
        'uy': 'ISNA', 'gt': 'ISNA', 'cu': 'ISNA', 'hn': 'ISNA', 'ni': 'ISNA',
        'sv': 'ISNA', 'cr': 'ISNA', 'pa': 'ISNA', 'do': 'ISNA', 'ht': 'ISNA',
        'jm': 'ISNA', 'tt': 'ISNA', 'bb': 'ISNA', 'bz': 'ISNA', 'gy': 'ISNA',
        'sr': 'ISNA', 'gf': 'ISNA',
        // أوروبا — دول عالية الخط الجغرافي (فوق 55°) تستخدم MWL
        // لأن طريقة مكة (90 دقيقة ثابتة) غير مناسبة للعروض العالية
        'no': 'MWL', 'se': 'MWL', 'fi': 'MWL', 'dk': 'MWL', 'is': 'MWL',
        'ee': 'MWL', 'lv': 'MWL', 'lt': 'MWL',
        // بقية أوروبا — أم القرى
        'fr': 'Makkah', 'be': 'Makkah', 'lu': 'Makkah',
        'ru': 'Makkah',
        'gb': 'Makkah', 'de': 'Makkah', 'nl': 'Makkah', 'es': 'Makkah', 'it': 'Makkah',
        'ch': 'Makkah',
        'at': 'Makkah', 'pt': 'Makkah', 'gr': 'Makkah', 'pl': 'Makkah', 'cz': 'Makkah',
        'sk': 'Makkah', 'hu': 'Makkah', 'ro': 'Makkah', 'bg': 'Makkah', 'hr': 'Makkah',
        'ba': 'Makkah', 'rs': 'Makkah', 'mk': 'Makkah', 'al': 'Makkah', 'xk': 'Makkah',
        'ua': 'Makkah', 'by': 'Makkah', 'md': 'Makkah', 'mt': 'Makkah', 'cy': 'Makkah',
        'ie': 'Makkah',
        // أوقيانوسيا
        'au': 'MWL', 'nz': 'MWL',
    };

    // أولاً: ابحث عبر كود الدولة (الأكثر موثوقية)
    const code = (countryCode || '').toLowerCase().trim();
    let method = codeMap[code];

    // ثانياً: إذا لم يُوجد الكود، ابحث عبر الاسم (احتياطي)
    if (!method && countryName) {
        const nameMap = {
            'Saudi Arabia': 'Makkah', 'المملكة العربية السعودية': 'Makkah',
            'UAE': 'Makkah', 'United Arab Emirates': 'Makkah', 'الإمارات': 'Makkah',
            'Kuwait': 'Kuwait', 'الكويت': 'Kuwait',
            'Qatar': 'Qatar', 'قطر': 'Qatar',
            'Egypt': 'Egypt', 'مصر': 'Egypt',
            'Pakistan': 'Karachi', 'باكستان': 'Karachi',
            'India': 'Karachi', 'الهند': 'Karachi',
            'Iran': 'Tehran', 'إيران': 'Tehran',
            'Turkey': 'Turkey', 'تركيا': 'Turkey',
            'Malaysia': 'Singapore', 'ماليزيا': 'Singapore',
            'Indonesia': 'Singapore', 'إندونيسيا': 'Singapore',
            'United States': 'ISNA', 'USA': 'ISNA', 'الولايات المتحدة': 'ISNA',
            'Canada': 'ISNA', 'كندا': 'ISNA',
            'France': 'Makkah', 'فرنسا': 'Makkah',
            'Russia': 'Makkah', 'روسيا': 'Makkah',
            'United Kingdom': 'Makkah', 'UK': 'Makkah', 'Britain': 'Makkah', 'المملكة المتحدة': 'Makkah',
            'Germany': 'Makkah', 'ألمانيا': 'Makkah',
            'Spain': 'Makkah', 'إسبانيا': 'Makkah',
            'Italy': 'Makkah', 'إيطاليا': 'Makkah',
            'Netherlands': 'Makkah', 'هولندا': 'Makkah',
            'Belgium': 'Makkah', 'بلجيكا': 'Makkah',
        };
        method = nameMap[countryName];
    }

    if (method) {
        const sel = document.getElementById('calc-method');
        if (sel && sel.value !== method) sel.value = method;
    }
}

// جلب اسم المدينة/الدولة مترجَم إلى اللغة الحالية (ur/tr/fr فقط — ar/en مغطّاة بمسارات أخرى)
// يُحدِّث currentLocalizedName/currentLocalizedCountry ثم يُعيد رسم الواجهة
async function fetchLocalizedCityName(lat, lng) {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    if (lang === 'ar' || lang === 'en') return; // ليس مطلوباً
    try {
        // zoom=12 يُعيد مستوى القرية/البلدة (town/village) بدل zoom=10 الذي يُعيد المدينة الأمّ
        // لا نستخدم zoom=14+ لأنّه يُعيد أحياء/حارات داخل المدن (suburb/neighbourhood) — وهذا غير مطلوب
        // نجلب طلبان بالتوازي (اللغة + الإنجليزية) لمطابقة currentEnglishName مع المستوى الصحيح
        // (مثلاً في تركيا Fatih مسجَّل كـ town بينما اسم المدينة الحقيقي city=İstanbul)
        const fetchRev = (l, zoom) => _cached(_coordKey(`revGeoLoc${zoom}`, lat, lng, l), () =>
            fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=${zoom}&accept-language=${l}&namedetails=1`)).then(r=>r.json()).catch(()=>null),
            30 * 86400000);
        let [data, dataEn] = await Promise.all([fetchRev(lang, 12), fetchRev('en', 12)]);
        if (!data?.address) return;
        // Edge case: للإحداثيات الخاصّة جدّاً (مثل الكعبة 21.4225, 39.8262) zoom=12 يُعيد province/state فقط
        // بدون city/town/village. نُجرِّب zoom=14 كـ fallback لنحصل على addr.city الصحيح.
        const _hasSettlement = (a) => Boolean(a && (a.village || a.hamlet || a.town || a.city || a.municipality));
        if (!_hasSettlement(data.address) && !_hasSettlement((dataEn && dataEn.address) || {})) {
            const [d14, dEn14] = await Promise.all([fetchRev(lang, 14), fetchRev('en', 14)]);
            if (d14?.address && _hasSettlement(d14.address)) { data = d14; dataEn = dEn14; }
        }
        const addr   = data.address;
        const addrEn = (dataEn && dataEn.address) ? dataEn.address : {};
        const nd     = data.namedetails || {};

        // حاول مطابقة currentEnglishName مع مستوى addr الإنجليزي — ثم استخدم نظيره المُترجَم
        // أمثلة:
        //   • الشرائع (town داخل مكة): addrEn.town="Ash Sharai" == currentEnglishName="Ash Sharai" → نستخدم addr.town
        //   • وسط إسطنبول: addrEn.town="Fatih" != currentEnglishName="Istanbul" → نتخطّى town ونأخذ addr.city
        //   • وسط مكة: addrEn.city="Mecca" == currentEnglishName="Mecca" → نستخدم addr.city
        const _normalizeEn = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ').trim();
        // Arabic Unicode block (U+0600-U+06FF)
        const _hasArabicChar = (s) => /[\u0600-\u06FF]/.test(String(s || ''));
        // أحرف خاصّة بالأوردو (موجودة في Unicode block Arabic لكنّ الأوردو فقط يستخدمها)
        // مثال: "مکہ" تحوي ک U+06A9 و ہ U+06C1 — بينما "مكة" (عربية) ليس فيها
        const _hasUrduSpecific = (s) => /[\u067E\u0686\u0698\u06A9\u06AF\u0688\u0691\u0679\u06BA\u06CC\u06D2\u06C1]/.test(String(s || ''));
        // خطوط CJK (صينيّة/يابانيّة/كوريّة) — لا تُستخدَم في أيٍّ من لغاتنا العشر
        //   3000-30FF: Japanese Hiragana/Katakana + CJK Symbols
        //   3400-4DBF: CJK Extension A
        //   4E00-9FFF: CJK Unified Ideographs
        //   AC00-D7AF: Korean Hangul Syllables
        //   F900-FAFF: CJK Compatibility Ideographs
        //   FF00-FFEF: Halfwidth/Fullwidth Forms
        const _hasCjkChar = (s) => /[\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/.test(String(s || ''));
        // Bengali Unicode block (U+0980-U+09FF) — تُستخدم فقط في bn
        const _hasBengaliChar = (s) => /[\u0980-\u09FF]/.test(String(s || ''));
        // خطوط أخرى غير مدعومة (Cyrillic/Devanagari/Thai/Hebrew/Greek/Tamil/Telugu/…)
        const _hasOtherUnsupportedChar = (s) => /[\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0700-\u074F\u0900-\u097F\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F]/.test(String(s || ''));
        // التحقّق من أنّ النصّ بخطّ متوافق مع لغة الواجهة:
        //  AR      → يسمح عربيّ + لاتينيّ. يرفض CJK/البنغاليّة/السيريليّة/…
        //  UR      → لاتينيّ أو عربيّ-بأوردو-خاصّ. يرفض العربيّ المحض والخطوط الأخرى
        //  BN      → لاتينيّ أو بنغاليّ. يرفض العربيّ/CJK/…
        //  غيرها  → لاتينيّ بحت (EN/FR/TR/DE/ID/ES/MS). يرفض كلّ ما عدا اللاتينيّة
        const _isAcceptableScript = (s) => {
            if (!s) return false;
            // أوّلاً: ارفض CJK وباقي الخطوط غير المدعومة لجميع اللغات
            if (_hasCjkChar(s)) return false;
            if (_hasOtherUnsupportedChar(s)) return false;
            if (lang === 'ar') {
                // يسمح عربيّ أو لاتينيّ، يرفض البنغاليّة
                return !_hasBengaliChar(s);
            }
            if (lang === 'ur') {
                // عربيّ محض بدون أحرف أوردو خاصّة → غير مقبول (endonym عربيّ)
                if (_hasArabicChar(s) && !_hasUrduSpecific(s)) return false;
                return !_hasBengaliChar(s);
            }
            if (lang === 'bn') {
                // bn: بنغاليّ أو لاتينيّ، ارفض العربيّ
                return !_hasArabicChar(s);
            }
            // EN/FR/TR/DE/ID/ES/MS: لاتينيّ بحت — ارفض العربيّ والبنغاليّة
            return !_hasArabicChar(s) && !_hasBengaliChar(s);
        };
        const targetEn = _normalizeEn(currentEnglishName);
        let cityMain = '';
        if (targetEn) {
            // المستويات من الأخصّ للأعمّ — بعض الدول (مثل الإمارات) تُسجِّل الإمارة كـ state (مثلاً Dubai)
            // نتخطّى المستويات التي يكون اسمها الإنجليزيّ «حيّاً-مقنّعاً» (ward-like) مثل Chiyoda-ku
            const levels = [
                [addr.village,      addrEn.village],
                [addr.hamlet,       addrEn.hamlet],
                [addr.town,         addrEn.town],
                [addr.city,         addrEn.city],
                [addr.municipality, addrEn.municipality],
                [addr.state,        addrEn.state],
            ];
            for (const [loc, en] of levels) {
                if (!loc || !en) continue;
                if (_isWardLike(en) || _isWardLike(loc)) continue;
                if (_normalizeEn(en) === targetEn) {
                    // إذا Nominatim لم يكن لديه ترجمة حقيقية → يُعيد endonym عربي (مثل "الجموم")
                    // فنَستخدم الإنجليزي بدلاً منه (مثلاً "Al Jumum" لصفحات DE/TR/FR)
                    cityMain = _isAcceptableScript(loc) ? loc : en;
                    break;
                }
            }
        }
        // fallback: الأولوية الأصلية (قرية > بلدة > مدينة) لحالات بدون currentEnglishName أو عدم مطابقة
        // مع تخطّي المستويات الـ ward-like في كلا اللغتين
        if (!cityMain) {
            const _pickNonWard = (a) => {
                const candidates = [a.village, a.hamlet, a.town, a.city, a.municipality];
                for (const c of candidates) { if (c && !_isWardLike(c)) return c; }
                const st = (a.state || '').trim();
                return (st && !_isWardLike(st)) ? st : '';
            };
            // إن كان لدينا currentEnglishName (مثل "Tokyo") ولم يتطابق أيّ مستوى معه، فالـ fallback يجب ألّا
            // يختار اسماً عشوائيّاً من zoom=12 (مثل "Chiyoda") — فهذا حيّ فرعيّ لا يُمثّل المدينة.
            //   الحلّ: إن كان addrEn لا يحوي مستوى مطابق لـ targetEn → استخدم currentEnglishName مباشرةً
            //   (يتيح للواجهة عرض "Tokyo" بدلاً من "Chiyoda" حتّى لو لم نجد الترجمة المحلّيّة).
            let _mismatchedToTarget = false;
            if (targetEn) {
                const enCandidates = [addrEn.village, addrEn.hamlet, addrEn.town, addrEn.city, addrEn.municipality, addrEn.state];
                const anyMatches = enCandidates.some(c => c && _normalizeEn(c) === targetEn);
                _mismatchedToTarget = !anyMatches;
            }
            if (_mismatchedToTarget) {
                // استخدم namedetails[`name:${lang}`] إن كان متطابقاً مع currentEnglishName
                const ndLocal = nd[`name:${lang}`] || '';
                const ndEn = nd[`name:en`] || nd[`name:en-US`] || '';
                if (ndLocal && !_isWardLike(ndLocal) && _isAcceptableScript(ndLocal)
                    && (_normalizeEn(ndEn) === targetEn || !ndEn)) {
                    cityMain = ndLocal;
                } else {
                    // لا ترجمة موثوقة — استخدم الإنجليزيّ مباشرةً (Tokyo)
                    cityMain = currentEnglishName;
                }
            } else {
                const _localeFirst = _pickNonWard(addr)
                    || (nd[`name:${lang}`] && !_isWardLike(nd[`name:${lang}`]) ? nd[`name:${lang}`] : '')
                    || '';
                const _enFirst = _pickNonWard(addrEn);
                cityMain = _isAcceptableScript(_localeFirst) ? _localeFirst : (_enFirst || _localeFirst);
            }
        }
        const countryMain = addr.country || '';
        const _prevLocalized = currentLocalizedName;
        if (cityMain)    currentLocalizedName    = cityMain;
        if (countryMain) currentLocalizedCountry = countryMain;
        // إعادة رسم جميع عناصر المدينة/الدولة (banner, H1, breadcrumb, info-location, …)
        if (typeof updateCityDisplay === 'function') updateCityDisplay();
        // إعادة بناء SEO (title/description/schema) باسم المدينة المترجَم — لولاه ستبقى القيم على اسم fallback
        if (typeof updateCitySEO === 'function' && typeof currentLat === 'number') {
            updateCitySEO(currentCity, currentEnglishName, currentCountry, currentLat, currentLng);
        }
        // إعادة جلب قسم "عن المدينة" باسم ويكيبيديا المترجَم (مهمّ لـur حيث يوجد فقط الاسم بالأحرف المحلية)
        if (currentLocalizedName && currentLocalizedName !== _prevLocalized
            && typeof loadCityAboutSection === 'function') {
            loadCityAboutSection();
        }
        // إعادة رسم محتوى صفحة القمر (H1/H2/intro/FAQ) بالاسم المترجَم — مهمّ للغات UR/TR/FR/DE/ID/BN/ES/MS
        //   لأنّ updateMoonInfo() يستخدم _moonCityDisplayName() الذي يعتمد على currentCity/currentLocalizedName.
        try {
            const _onMoonPage = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today(?:-in-[a-z][a-z0-9-]+)?$/
                .test(window.location.pathname);
            if (_onMoonPage && typeof updateMoonInfo === 'function') updateMoonInfo();
        } catch (_e) { /* silent */ }
    } catch (_e) { /* تجاهل — الـ fallback الإنجليزي يعمل */ }
}

// تحميل بيانات المدينة وتحديث كل الواجهة (بدون تنقل)
async function loadCityData(lat, lng, city, country, countryCode = '', englishName = '', timezone = null) {
    currentLat = lat;
    currentLng = lng;
    currentCity = city;
    currentEnglishName = englishName || '';
    currentEnglishDisplayName = englishName || ''; // عند الاختيار اليدوي لا يوجد حي
    currentCountry = country;
    currentCountryCode = countryCode;
    currentEnglishCountry = COUNTRY_EN_NAMES[countryCode] || '';
    currentLocalizedName = ''; // إعادة ضبط قبل الجلب
    currentLocalizedCountry = '';

    // ── Resilience: if name/country are missing (e.g. nav landed via coords-only
    //   slug from _locHeroDetectAndNavigate when Nominatim was slow),
    //   trigger reverseGeocode in the background to populate H1/breadcrumb/SEO.
    //   navigateAfter=false → just resolves and updates display, no second navigation.
    if ((!city || !englishName || !countryCode) && isFinite(lat) && isFinite(lng)) {
        try {
            reverseGeocode(lat, lng, false).then(() => {
                try { updateCityDisplay(); } catch (_e) {}
                try { updateCityCountryInfo(); } catch (_e) {}
                try { updateCitySEO(currentCity, currentEnglishName, currentCountry, lat, lng); } catch (_e) {}
                try { updatePrayerCardsSEO(); } catch (_e) {} // refreshes the hero H1 with city name
                try { loadCityAboutSection(); } catch (_e) {}
                try { fetchLocalizedCityName(lat, lng); } catch (_e) {}
            }).catch(() => {});
        } catch (_e) { /* silent */ }
    }
    // timezone يجب أن يكون offset رقميّ (ساعات-UTC)؛ نرفض IANA strings مثل "Asia/Tokyo"
    //   (جلسات قديمة قد تحتوي على السلسلة) ونُعيد الحلّ عبر fetchTimezone.
    const _tzNum = (typeof timezone === 'number' && isFinite(timezone)) ? timezone : null;
    currentTimezone = (_tzNum !== null) ? _tzNum : await fetchTimezone(lat, lng);
    // اختيار طريقة الحساب بكود الدولة ISO (موثوق) ثم الاسم كاحتياطي
    autoSelectMethod(countryCode, country);
    // SEO شامل: title + description + canonical + hreflang + OG + Twitter + schema
    updateCitySEO(city, englishName, country, lat, lng);
    updateCityDisplay();
    updatePrayerTimes();
    updateQibla();
    fetchNearbyPlaces(lat, lng);
    updateCityCountryInfo();
    loadCityAboutSection();
    // UR/TR/FR: جلب الاسم المترجَم في الخلفية ثمّ إعادة رسم الواجهة
    fetchLocalizedCityName(lat, lng);

    // ── Round 31: احفظ آخر سياق مدينة معروف في sessionStorage حتّى
    //   تحتفظ الصفحات غير-المدنية (dateconverter, zakat, msbaha, duas…)
    //   بالموقع الحاليّ عند المرور عليها، ثمّ يُسلِّمه الشريط الجانبي لأيّ
    //   صفحة لاحقة. القاعدة: من الرئيسيّة → مكّة (لا يُحفظ سياق)؛ من صفحة
    //   سياق → نحفظ ونحمِّل لاحقًا. loadCityData هو choke point مشترك.
    try {
        if (lat && lng && englishName) {
            sessionStorage.setItem('last_city_context', JSON.stringify({
                lat: lat, lng: lng, name: city, country: country,
                englishName: englishName, countryCode: countryCode,
                timezone: (typeof currentTimezone === 'number') ? currentTimezone : null,
                ts: Date.now()
            }));
        }
    } catch (_e) { /* silent */ }

    // Qibla hub LRU: when user lands on a /qibla-in-* route, push this city
    // into the visited-cities list so the hub can display it on return.
    try {
        if (lat && lng && englishName && typeof _pushQiblaVisited === 'function'
            && /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla-in-/.test(window.location.pathname)) {
            _pushQiblaVisited({
                englishName: englishName,
                lat: lat,
                lng: lng,
                slug: (typeof makeSlug === 'function') ? makeSlug(englishName, lat, lng) : ''
            });
        }
    } catch (_e) { /* silent */ }
}

// ========= قسم "عن المدينة" من ويكيبيديا — حُذف بالكامل بناءً على طلب المستخدم =========
// stubs محتفظ بها لتجنّب أخطاء مراجع خارجيّة
function loadCityAboutSection() { /* removed */ }
function _renderCityAbout() { /* removed */ }
function toggleCityAbout() { /* removed */ }

// للتوافق مع الكود القديم - ينتقل للصفحة مباشرة
async function selectCity(lat, lng, city, country, englishName = '', countryCode = '') {
    navigateToCity(lat, lng, city, country, englishName, countryCode);
    searchFocusedIndex = -1;
}

// إخفاء الاقتراحات عند النقر خارجها
document.addEventListener('click', function(e) {
    if (!e.target.closest('.city-search-wrapper')) {
        document.getElementById('city-suggestions')?.classList.remove('open');
    }
});

// ========= تحديد الموقع =========
let _locationInProgress = false;

function detectLocation() {
    // منع الطلبات المتزامنة عند الضغط المتكرر على "موقعي"
    if (_locationInProgress) return;
    _locationInProgress = true;

    if (!navigator.geolocation) {
        _locationInProgress = false;
        fetchTimezone(currentLat, currentLng).then(tz => {
            currentTimezone = tz;
            updateCityDisplay();
            updatePrayerTimes();
            updateQibla();
            fetchNearbyPlaces(currentLat, currentLng);
            updateCityCountryInfo();
        });
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async function(position) {
            _locationInProgress = false;
            const _detLat = position.coords.latitude;
            const _detLng = position.coords.longitude;

            const _hasPageParam = new URLSearchParams(window.location.search).has('page');
            const _isCityPage = /\/(?:en\/)?(?:prayer-times-in|qibla-in)-/.test(window.location.pathname);
            const _p = window.location.pathname;
            const _onHomePage  = !_hasPageParam && (
                _p === '/' || _p === '' ||
                /^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\/?$/.test(_p)
            );
            const _isProtocol = window.location.protocol !== 'file:';

            if (_onHomePage && _isProtocol) {
                // ─── الصفحة الرئيسية: لا تحويل ─────────────────────────
                // احتفظ بمكة افتراضياً، واعرض شريط اقتراح فقط
                reverseGeocodeForSuggestion(_detLat, _detLng);
                return;
            }

            // ─── الصفحات الأخرى: تصرف طبيعي ─────────────────────────
            currentLat = _detLat;
            currentLng = _detLng;
            currentTimezone = await fetchTimezone(currentLat, currentLng);
            const _shouldNavigate = _isCityPage && _isProtocol;
            reverseGeocode(currentLat, currentLng, _shouldNavigate);
            if (!_shouldNavigate) {
                updatePrayerTimes();
                updateQibla();
                fetchNearbyPlaces(currentLat, currentLng);
            }
        },
        async function(error) {
            _locationInProgress = false;
            currentTimezone = await fetchTimezone(currentLat, currentLng);
            updateCityDisplay();
            updatePrayerTimes();
            updateQibla();
            fetchNearbyPlaces(currentLat, currentLng);
            updateCityCountryInfo();
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function reverseGeocode(lat, lng, navigateAfter = false) {
    // zoom=10 يُعيد مستوى المدينة بدلاً من مستوى الشارع/الحي (مع كاش 30 يوم)
    const arReq = _cached(_coordKey('revGeoCity', lat, lng, 'ar'), () =>
        fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=ar&namedetails=1`)).then(r=>r.json()).catch(()=>null),
        30 * 86400000);
    const enReq = _cached(_coordKey('revGeoCity', lat, lng, 'en'), () =>
        fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=en&namedetails=1`)).then(r=>r.json()).catch(()=>null),
        30 * 86400000);

    return Promise.all([arReq, enReq]).then(async ([arData, enData]) => {
        if (arData?.address) {
            const addr = arData.address;
            const enAddr = enData?.address || {};

            // اسم المدينة الرئيسية فقط (بدون أحياء) مع احتياط لحالة غياب city
            // إذا كان addr.city/town/village حيّاً مُقنَّعاً (مثل 千代田区 في طوكيو) → نصعد إلى state
            const _stripAdminSuffixes = (s) => (s || '')
                .replace(/^منطقة\s+/, '').replace(/^محافظة\s+/, '')
                .replace(/\s*(Region|Governorate|Province|Prefecture|Metropolis|District)\b/gi, '')
                .trim();
            const _pickCityLevel = (a) => {
                const candidates = [a.city, a.town, a.village];
                for (const c of candidates) {
                    if (c && !_isWardLike(c)) return c;
                }
                // كلّها أحياء-مقنّعة أو فارغة → استخدم state
                return _stripAdminSuffixes(a.state || '');
            };
            let arCityMain = _pickCityLevel(addr) || '';
            let rawEnCity = _pickCityLevel(enAddr) || '';

            // Ward-fix escalation: إن كان city في zoom=10 حيّاً-مقنّعاً (مثل 千代田区 في Arabic)
            //   أو كانت جميع الحقول فارغة/أحياء ولم يوجد state → نصعد إلى zoom=8 (المدينة الأمّ).
            //   مثال: Chiyoda(Arabic zoom=10) = 千代田区 بدون state → نصعد إلى Tokyo عبر zoom=8.
            //   ملاحظة: الإنجليزي "Chiyoda" وحده لا يُكتَشف كحيّ، لكنّ namedetails (name:ja=千代田区،
            //   name:ja-Latn=Chiyoda-ku، name:fr=Arrondissement de Chiyoda) تكشف طبيعته الحقيقيّة.
            //   لذا نفحص namedetails في أيّ من arData/enData: إذا وُجد أيّ ward-like → تصعيد إجباريّ.
            const arCityIsWard = _isWardLike(addr.city) || _isWardLike(addr.town) || _isWardLike(addr.village);
            const enCityIsWard = _isWardLike(enAddr.city) || _isWardLike(enAddr.town) || _isWardLike(enAddr.village);
            const _anyNdWard = (r) => {
                const nd = r?.namedetails || {};
                for (const k in nd) { if (_isWardLike(nd[k])) return true; }
                return false;
            };
            const ndWardDetected = _anyNdWard(arData) || _anyNdWard(enData);
            const needParentAr = !arCityMain || (arCityIsWard && !addr.state) || ndWardDetected;
            const needParentEn = !rawEnCity || (enCityIsWard && !enAddr.state) || ndWardDetected;
            if (needParentAr || needParentEn) {
                try {
                    const arP = needParentAr
                        ? _cached(_coordKey('revGeoParent8', lat, lng, 'ar'), () =>
                            fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=8&accept-language=ar&namedetails=1`)).then(r=>r.json()).catch(()=>null),
                            30 * 86400000)
                        : null;
                    const enP = needParentEn
                        ? _cached(_coordKey('revGeoParent8', lat, lng, 'en'), () =>
                            fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=8&accept-language=en&namedetails=1`)).then(r=>r.json()).catch(()=>null),
                            30 * 86400000)
                        : null;
                    const [arPD, enPD] = await Promise.all([arP, enP]);
                    if (needParentAr && arPD) {
                        const pAddr = arPD.address || {};
                        const parentAr = _stripAdminSuffixes(pAddr.city || pAddr.town || pAddr.village || pAddr.province || pAddr.state || arPD.name || '');
                        if (parentAr) arCityMain = parentAr;
                    }
                    if (needParentEn && enPD) {
                        const pAddr = enPD.address || {};
                        const parentEn = _stripAdminSuffixes(pAddr.city || pAddr.town || pAddr.village || pAddr.province || pAddr.state || enPD.name || '');
                        if (parentEn) rawEnCity = parentEn;
                    }
                } catch (_e) { /* silent — fall back to original values */ }
            }

            // حذف كلمة District من الأسماء الإنجليزية
            const enCityMain = rawEnCity.replace(/\s*District\b/gi, '').trim();

            currentCity = arCityMain || 'غير معروف';

            currentCountry     = addr.country || '';
            currentCountryCode = (addr.country_code || '').toLowerCase();

            // الاسم الإنجليزي (للـ slug والعرض): المدينة فقط بدون District
            // namedetails عبر arData قد تحتوي أيضاً على ward-like name:en (مثلاً "Chiyoda")
            //   لذا عند تصعيد zoom=8 نفضّل rawEnCity (من zoom=8) على namedetails.
            const ndEnRaw = (arData.namedetails?.['name:en'] || arData.namedetails?.['name:en-US'] || '').trim();
            const ndEnIsWard = _isWardLike(ndEnRaw);
            currentEnglishName = ((needParentEn ? '' : ndEnRaw && !ndEnIsWard ? ndEnRaw : '')
                || enCityMain
                || ndEnRaw
                || '').replace(/\s*District\b/gi, '').trim();

            currentEnglishDisplayName = enCityMain || currentEnglishName || '';

            currentEnglishCountry = enAddr.country
                || COUNTRY_EN_NAMES[currentCountryCode] || '';
            autoSelectMethod(currentCountryCode, currentCountry);

            // إعادة ضبط الأسماء المترجَمة لكلّ مدينة جديدة (ستُعبَّأ لاحقاً لـ UR/TR/FR)
            currentLocalizedName = '';
            currentLocalizedCountry = '';

            // انتقل إلى صفحة المدينة إذا طُلب ذلك (باستخدام اسم المدينة الرئيسية للـ slug)
            const navEnName = enCityMain || currentEnglishName;
            if (navigateAfter && navEnName && window.location.protocol !== 'file:') {
                navigateToCity(lat, lng, arCityMain || currentCity, currentCountry, navEnName, currentCountryCode);
                return;
            }
        }
        updateCityDisplay();
        updateCityCountryInfo();
        // UR/TR/FR: جلب الاسم المترجَم في الخلفية ثمّ إعادة رسم الواجهة
        fetchLocalizedCityName(lat, lng);
    }).catch(() => {
        currentCity = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
        currentCountry = '';
        currentEnglishName = '';
        updateCityDisplay();
        updateCityCountryInfo();
    });
}

function updateCityDisplay() {
    const dispCity    = getDisplayCity();
    const dispCountry = getDisplayCountry();
    const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const isEn = (_lng === 'en');
    const sep  = (_lng === 'ar' || _lng === 'ur') ? '، ' : ', ';

    document.getElementById('city-name').textContent = dispCity;
    document.getElementById('country-name').textContent = dispCountry;

    // Round 20: Location Hero city label (ركن البحث الأساسيّ في الأعلى)
    const _locHeroLbl = document.getElementById('loc-hero-city-label');
    if (_locHeroLbl) {
        _locHeroLbl.textContent = dispCountry ? `${dispCity}${sep}${dispCountry}` : dispCity;
    }

    // مسار التنقل (Breadcrumb)
    updateBreadcrumb();

    // سطر الموقع في المعلومات الإضافية
    const locEl = document.getElementById('info-location');
    if (locEl) locEl.textContent = dispCountry ? `${dispCity}${sep}${dispCountry}` : dispCity;

    // تحديث صفحة القبلة
    document.getElementById('qibla-city').textContent = dispCity;
    document.getElementById('qibla-lat').textContent = currentLat.toFixed(4) + '°';
    document.getElementById('qibla-lng').textContent = currentLng.toFixed(4) + '°';

    // عنوان صفحة القبلة: "اتجاه القبلة في (المدينة)"
    const qiblaTitle = document.querySelector('#page-qibla h2[data-i18n="qibla.title"]');
    if (qiblaTitle && dispCity) {
        qiblaTitle.textContent = t('qibla.title_in', { city: dispCity });
    }

    // زر العودة لمواقيت الصلاة (يظهر فقط على صفحة /qibla-in-*)
    const qiblaBackBtn = document.getElementById('qibla-back-btn');
    const qiblaBackLabel = document.getElementById('qibla-back-label');
    const isQiblaPage = /\/(?:en\/)?qibla-in-/.test(window.location.pathname);
    if (qiblaBackBtn && isQiblaPage && dispCity) {
        const slug = makeSlug(currentEnglishName || dispCity, currentLat, currentLng);
        qiblaBackBtn.href = pageUrl(`/prayer-times-in-${slug}`);
        qiblaBackBtn.onclick = e => {
            e.preventDefault();
            sessionStorage.setItem(`city_${slug}`, JSON.stringify({
                lat: currentLat, lng: currentLng,
                name: currentCity, country: currentCountry,
                englishName: currentEnglishName, countryCode: currentCountryCode, timezone: currentTimezone,
                _v: 2
            }));
            window.location.href = qiblaBackBtn.href;
        };
        if (qiblaBackLabel) {
            qiblaBackLabel.textContent = t('prayer_times_in', { city: dispCity });
        }
        qiblaBackBtn.style.display = 'flex';
    } else if (qiblaBackBtn) {
        qiblaBackBtn.style.display = 'none';
    }

    // ── تجاوز خاصّ بصفحة /moon-today-in-{slug}: ────────────────────────────
    //   يجب أن يظهر الهيدر العلويّ باسم مدينة الصفحة (Tokyo/Japan) لا باسم
    //   موقع المستخدم (Mecca/Saudi Arabia). لا نُعدّل currentCity/Lat/Lng —
    //   فقط النصّ المعروض في #city-name و #country-name.
    //
    //   للسيناريو الأهمّ (انتقال من prayer-times-in-tokyo → moon): تعتمد
    //   العرض على sessionStorage 'city_moon' الذي يُحمَّل في initFromURL —
    //   وبالتالي currentCity/Country يحملان Tokyo، ولا نحتاج التجاوز هنا.
    //   لكن عند الزيارة المباشرة لـ /moon-today-in-{famous-slug} (بدون جلسة)،
    //   نستبدل الهيدر بناءً على slug في FAMOUS_MOON_CITIES فقط — لضمان أنّ
    //   currentCity/Country ما زالا صحيحَين للمدن المعروفة.
    try {
        // ── Round 28 fix: يشمل moon/qibla/prayer-times + يستخرج slug بلا coord-suffix
        //   + يُمرّر lang صحيحاً (كان _lng غير معرَّف سابقاً → الدولة فارغة).
        const _lngNow = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const _pathHere = window.location.pathname;
        const _reCityCtx = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:moon-today-in|moon-in|qibla-in|prayer-times-in)-([a-z][a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?(?:\/\d{4}-\d{2}-\d{2})?(?:\.html)?$/;
        const _mmatch = _pathHere.match(_reCityCtx);
        if (_mmatch && _mmatch[1]) {
            const _mSlug = _mmatch[1];
            // لا نتجاوز إلا إذا:
            //   (أ) المدينة معروفة في FAMOUS_MOON_CITIES أو جدول الدول، أو
            //   (ب) لم يتمّ استعادة الجلسة (currentEnglishName لا يطابق الـ slug)
            const _inFamous = (typeof FAMOUS_MOON_CITIES !== 'undefined') && !!FAMOUS_MOON_CITIES[_mSlug];
            const _inCountryMap = (typeof _MOON_CITY_COUNTRY_KEYS !== 'undefined') && !!_MOON_CITY_COUNTRY_KEYS[_mSlug];
            const _simpleCurEn = (currentEnglishName || '').toLowerCase().trim().replace(/\s+/g, '-');
            const _sessionMatchesSlug = (_simpleCurEn === _mSlug);
            if ((_inFamous || _inCountryMap) && !_sessionMatchesSlug) {
                const _mCity = (typeof _moonCityDisplayName === 'function') ? _moonCityDisplayName(_mSlug) : _mSlug;
                const _mCountry = (typeof _moonCityCountryName === 'function') ? _moonCityCountryName(_mSlug, _lngNow) : '';
                const _cityEl = document.getElementById('city-name');
                const _countryEl = document.getElementById('country-name');
                if (_cityEl && _mCity) {
                    _cityEl.textContent = _mCity;
                    _cityEl.removeAttribute('data-i18n');
                }
                if (_countryEl) {
                    _countryEl.textContent = _mCountry || '';
                    _countryEl.removeAttribute('data-i18n');
                }
            }
        }
    } catch (_e) { /* silent */ }
}

// ─────────────────────────────────────────────────────────────
//   Breadcrumb ديناميكي + BreadcrumbList Schema
// ─────────────────────────────────────────────────────────────

/**
 * يُحدِّث عناصر Breadcrumb في الـ DOM ويُحقن Schema JSON-LD
 * يُستدعى بعد تحديد بيانات المدينة/الدولة
 */
function updateBreadcrumb() {
    const isCityPage = document.body.classList.contains('city-prayer-page');
    if (!isCityPage) {
        // إزالة Schema القديم إذا تنقّل المستخدم من صفحة مدينة
        const old = document.getElementById('breadcrumb-schema');
        if (old) old.remove();
        return;
    }

    const lang        = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const isAr        = (lang === 'ar');
    const langPrefix  = isAr ? '/' : ('/' + lang + '/');
    const origin      = window.SITE_URL || window.location.origin;
    const countrySlug = makeCountrySlug(currentCountryCode, currentEnglishCountry);

    // ── نصوص العرض (عبر i18n مع fallback) ──
    const _t = (typeof t === 'function') ? t : (k) => k;
    const homeLabel        = _t('breadcrumb.home') || (isAr ? 'الرئيسية' : 'Home');
    // AR: عربي — EN: إنجليزي — UR/TR/FR/DE/ID/BN/ES/MS: getDisplayCountry() يفحص _LOCALIZED_COUNTRY_MAPS أوّلاً
    const countryLabel = (lang === 'ar')
        ? (currentCountry        || currentEnglishCountry || countrySlug)
        : (lang === 'en')
            ? (currentEnglishCountry || currentCountry    || countrySlug)
            : ((typeof getDisplayCountry === 'function' && getDisplayCountry())
                || currentLocalizedCountry || currentEnglishCountry || currentCountry || countrySlug);
    // UR/TR/FR/DE/ID/BN/ES/MS: نستعمل getDisplayCity() لتطبيق قاموس CITY_NAMES_* المحلّي
    // قبل الرجوع للاسم الإنجليزي — يضمن ترجمة عواصم الدول-المدن (Monaco → موناکو للأوردو).
    const cityLabel = (lang === 'ar')
        ? (currentCity               || currentEnglishName    || currentEnglishDisplayName)
        : (lang === 'en')
            ? (currentEnglishDisplayName || currentEnglishName    || currentCity)
            : ((typeof getDisplayCity === 'function' && getDisplayCity())
                || currentLocalizedName || currentEnglishDisplayName || currentEnglishName || currentCity);

    // "مواقيت الصلاة في {name}" — نفس القالب يُطبَّق على الدولة والمدينة
    // (نمرّر متغيّر placeholder اسمه 'city' لأن مفتاح i18n يستخدمه — لكن القيمة قد تكون اسم دولة)
    const countryFinal = _t('prayer_times_in', { city: countryLabel })
        || (isAr ? `مواقيت الصلاة في ${countryLabel}` : `Prayer Times in ${countryLabel}`);
    const finalLabel = _t('prayer_times_in', { city: cityLabel })
        || (isAr ? `مواقيت الصلاة في ${cityLabel}` : `Prayer Times in ${cityLabel}`);

    // ── روابط (فقط للعنصرين الأوّلَيْن — العنصر الأخير current بلا href) ──
    // نُولِّد الرابط على نمط /prayer-times-in-{slug} مباشرةً لتفادي 301 hop وتحسين SEO.
    const countryHref = `${origin}${langPrefix}prayer-times-in-${countrySlug}`;

    // ── تحديث DOM ──
    // ملاحظة: الـmarkup الجديد يحوي <span itemprop="name"> داخل الـ<a>/<span> الأبّ
    //        نكتب على الـinner span فقط لحفظ Schema.org microdata.
    const bcHome     = document.getElementById('bc-home');
    const bcHomeName = document.getElementById('bc-home-name');
    const bcCountry     = document.getElementById('bc-country');
    const bcCountryName = document.getElementById('bc-country-name');
    const bcCity        = document.getElementById('bc-city');

    if (bcHomeName) bcHomeName.textContent = homeLabel;
    else if (bcHome) bcHome.textContent = homeLabel;
    if (bcHome) bcHome.href = `${origin}${langPrefix}`;

    if (bcCountryName) bcCountryName.textContent = countryFinal;
    else if (bcCountry) bcCountry.textContent = countryFinal;
    if (bcCountry) bcCountry.href = countryHref;

    if (bcCity) bcCity.textContent = finalLabel;  // <span> لا <a> — بدون href

    // ── تحديث H1 باسم المدينة الأصلي (SSR يعرف slug فقط — الـ client يعرف الاسم العربي) ──
    // مثلاً: "مواقيت الصلاة في Riyadh اليوم" → "مواقيت الصلاة في الرياض اليوم"
    const h1El = document.getElementById('page-h1');
    if (h1El) {
        const h1Text = ({
            ar: `مواقيت الصلاة في ${cityLabel} اليوم`,
            en: `Prayer Times in ${cityLabel} Today`,
            fr: `Heures de prière à ${cityLabel} aujourd'hui`,
            tr: `${cityLabel} için bugünkü namaz vakitleri`,
            ur: `آج ${cityLabel} میں اوقاتِ نماز`,
            de: `Gebetszeiten in ${cityLabel} heute`,
            id: `Jadwal Sholat di ${cityLabel} Hari Ini`,
            es: `Horarios de Oración en ${cityLabel} hoy`,
            bn: `${cityLabel}-এ আজকের নামাজের সময়`,
            ms: `Waktu Solat di ${cityLabel} hari ini`,
        })[lang] || `Prayer times in ${cityLabel}`;
        h1El.textContent = h1Text;
    }

    // ── حقن / تحديث BreadcrumbList Schema ──
    // نُرسِل countryFinal (المسبوق بـ "مواقيت الصلاة في") ليُطابق ما يراه المستخدم
    _injectBreadcrumbSchema({
        origin, homeLabel, countryLabel: countryFinal, countryHref, finalLabel, lang
    });
}

/** يحقن أو يُحدِّث <script id="breadcrumb-schema"> في <head> */
function _injectBreadcrumbSchema({ origin, homeLabel, countryLabel, countryHref, finalLabel }) {
    // لا تحقن Schema في وضع الملف المحلي
    if (window.location.protocol === 'file:') return;

    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": homeLabel,
                "item": `${origin}/`
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": countryLabel,
                "item": countryHref
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": finalLabel
                // لا يوجد "item" — هذا هو العنصر الحالي (aria-current)
            }
        ]
    };

    // إزالة قديم (عند تنقّل SPA بين مدن)
    const old = document.getElementById('breadcrumb-schema');
    if (old) old.remove();

    const script = document.createElement('script');
    script.id          = 'breadcrumb-schema';
    script.type        = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
}

// ========= مواقيت الصلاة =========
function updatePrayerTimes() {
    const method     = document.getElementById('calc-method').value;
    const asrMethod  = document.getElementById('asr-method').value;
    const timeFormat = document.getElementById('time-format').value;
    const highLats   = document.getElementById('high-lats').value;

    PrayerTimes.setMethod(method);
    PrayerTimes.setAsrMethod(asrMethod);
    PrayerTimes.setTimeFormat(timeFormat);
    PrayerTimes.setHighLats(highLats);

    // حساب التاريخ بتوقيت المدينة المختارة (لا توقيت المتصفح)
    const now = new Date();
    const localOffset = -now.getTimezoneOffset() / 60;
    const cityDate = new Date(now.getTime() + (currentTimezone - localOffset) * 3600000);

    currentPrayerTimes = PrayerTimes.getTimes(cityDate, currentLat, currentLng, currentTimezone);

    // ⚠️ مهم: عند تغيّر المدينة/المنطقة الزمنيّة، نُصفّر رصّاد العبور حتّى لا
    //   يكشف "فجوة وهميّة" تبتلع وقت صلاة وتُطلِق الأذان خطأً.
    //   مثال: كانت الصفحة على توقيت مكّة (UTC+3) ثمّ تحمَّلت بكين (UTC+8) →
    //   currentSeconds يقفز 5 ساعات فجأة، فيبدو وكأنّ ظهر/عصر/مغرب بكين قد عُبر،
    //   والأذان يدقّ فوراً رغم أنّنا لم نكن فعلياً عند وقت الصلاة.
    //   لا نُصفّر lastAzanPrayer للحفاظ على منع تكرار الأذان خلال فترة تشغيله.
    _prevCurrentSeconds = null;

    // تحديث العرض — null-guards لأنّ #prayer-cards مقصوص على صفحة time-left (DOM pruner)
    const _tfEl = document.getElementById('time-fajr');    if (_tfEl) _tfEl.textContent = currentPrayerTimes.fajr;
    const _tsEl = document.getElementById('time-sunrise'); if (_tsEl) _tsEl.textContent = currentPrayerTimes.sunrise;
    const _tdEl = document.getElementById('time-dhuhr');   if (_tdEl) _tdEl.textContent = currentPrayerTimes.dhuhr;
    const _taEl = document.getElementById('time-asr');     if (_taEl) _taEl.textContent = currentPrayerTimes.asr;
    const _tmEl = document.getElementById('time-maghrib'); if (_tmEl) _tmEl.textContent = currentPrayerTimes.maghrib;
    const _tiEl = document.getElementById('time-isha');    if (_tiEl) _tiEl.textContent = currentPrayerTimes.isha;

    // تحديث المعلومات الإضافية
    const hijri = HijriDate.getToday();
    const dayName = HijriDate.dayNames[cityDate.getDay()];
    const hSuffix = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
    const gSuffix = (typeof t === 'function') ? t('date.greg_suffix') : ' م';
    const _dsLng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const dateSep = (_dsLng === 'ar' || _dsLng === 'ur') ? '، ' : ', ';
    // Round 20: info-hijri/info-gregorian/info-fasting حُذفت (كانت في قسم "معلومات إضافية" المدموج)
    // null-guards للحماية في حال ظهرت على صفحات قادمة:
    const _ihEl = document.getElementById('info-hijri');
    if (_ihEl) _ihEl.textContent = `${dayName}${dateSep}${hijri.day} ${HijriDate.hijriMonths[hijri.month-1]} ${hijri.year}${hSuffix}`;
    const gMonths = HijriDate.gregorianMonths;
    const _igEl = document.getElementById('info-gregorian');
    if (_igEl) _igEl.textContent = `${dayName}${dateSep}${cityDate.getDate()} ${gMonths[cityDate.getMonth()]} ${cityDate.getFullYear()}${gSuffix}`;

    // ساعات الصيام (فجر → مغرب)
    const rawFajr    = currentPrayerTimes.raw.fajr;
    const rawMaghrib = currentPrayerTimes.raw.maghrib;
    let fastMins = Math.round((rawMaghrib - rawFajr) * 60);
    if (fastMins < 0) fastMins += 24 * 60;
    const fH = Math.floor(fastMins / 60), fM = fastMins % 60;
    const fastEl = document.getElementById('info-fasting');
    if (fastEl) {
        const _ln = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const hrLbl = (typeof t === 'function') ? t(fH === 1 ? 'unit.hour' : 'unit.hours') : 'ساعة';
        const minLbl = (typeof t === 'function') ? t('unit.min') : 'دقيقة';
        const andLbl = (typeof t === 'function') ? t('unit.and') : ' و';
        fastEl.textContent = fH + ' ' + hrLbl + (fM > 0 ? andLbl + fM + ' ' + minLbl : '');
    }

    // Round 20: Summary+Info Strip (Imsak + Fasting + Last Third of Night + Settings)
    if (typeof updateSummaryInfoStrip === 'function') {
        try { updateSummaryInfoStrip(currentPrayerTimes, fH, fM); } catch (_) {}
    }

    // تحديث الصلاة النشطة
    updateActivePrayer();

    // تحديث جدول المواقيت — كلّها ملفوفة بـ try/catch لأقسام قد تكون مقصوصة على time-left
    scheduleStartDate = null; // إعادة ضبط إلى اليوم عند تغيير المدينة
    try { initScheduleDatePicker(); }              catch (_e) {}
    try { renderPrayerSchedule(scheduleDays, null); } catch (_e) {}

    // تحديث الأسئلة الشائعة
    try { updateFaqSection(); }                    catch (_e) {}

    // تحديث قسم مدن الدولة
    try { updateCountryCitiesSection(); }          catch (_e) {}

    // تحديث قسم الكلمات المفتاحية
    try { updateSeoSection(); }                    catch (_e) {}

    // تحديث البوابة الذكية (الصفحة الرئيسية)
    try { updateHomeGateway(); }                   catch (_e) {}

    // تعبئة روابط الخدمات ذات الصلة (صفحات المدن فقط)
    try { updateCityRelatedServices(); }           catch (_e) {}

    // حقن Event schema لأوقات الصلاة (صفحات المدن فقط)
    try { injectPrayerEventsSchema(); }            catch (_e) {}

    // ═══ Phase 2 — City Page orchestration (6 أقسام جديدة + weekly/faq switches) ═══
    try {
        if (typeof applyPhase2CityPage === 'function' && currentPrayerTimes) {
            // الصلاة القادمة — اسم مترجم + وقت منسّق
            let _nextName = '', _nextTime = '';
            try {
                if (typeof PrayerTimes !== 'undefined' && PrayerTimes.getNextPrayer) {
                    const _nx = PrayerTimes.getNextPrayer(currentPrayerTimes, currentTimezone);
                    if (_nx) {
                        _nextName = (typeof t === 'function') ? t('prayer.' + _nx.key) : (_nx.name || '');
                        _nextTime = currentPrayerTimes[_nx.key] || '';
                    }
                }
            } catch (_) {}
            applyPhase2CityPage(currentPrayerTimes, _nextName, _nextTime);
        }
    } catch (_e) {}

    // 🆕 Round 3.1 — auto-scroll + initial progress + notif prompt (بعد آخر DOM settle)
    try { updatePrayerProgress(); } catch (_e) {}
    try { autoScrollToActivePrayer(); } catch (_e) {}
    try { maybeShowNotifPrompt(); } catch (_e) {}

    // 🆕 Round 4 (Minimal) — تحديث صفحة NPT (Schedule Awareness)
    try { updateNextPrayerPage(); } catch (_e) {}
}

/**
 * Schema.org Event per daily prayer (Fajr/Dhuhr/Asr/Maghrib/Isha) للمدينة الحالية.
 * يُستدعى بعد توفر currentPrayerTimes في صفحات prayer-times-in-*.
 */
function injectPrayerEventsSchema() {
    if (window.location.protocol === 'file:') return;
    const path = window.location.pathname.replace(/\.html$/, '');
    if (!/\/(?:en\/)?prayer-times-in-/.test(path)) { _seoRemoveSchema('prayer-events-schema'); return; }
    if (!currentPrayerTimes || !currentPrayerTimes.raw) return;

    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const isEn = lang !== 'ar';
    const origin = window.SITE_URL || window.location.origin;
    const pageUrl = origin + window.location.pathname;
    const cityDisplay = isEn ? (currentEnglishName || currentCity) : currentCity;
    const countryName = isEn ? (currentEnglishCountry || currentCountry) : currentCountry;

    const now = new Date();
    const localOffset = -now.getTimezoneOffset() / 60;
    const cityDate = new Date(now.getTime() + (currentTimezone - localOffset) * 3600000);
    const tz = currentTimezone || 0;

    const pad2 = (n) => String(n).padStart(2, '0');
    const tzSign = tz >= 0 ? '+' : '-';
    const tzAbs  = Math.abs(tz);
    const tzStr  = `${tzSign}${pad2(Math.floor(tzAbs))}:${pad2(Math.round((tzAbs - Math.floor(tzAbs)) * 60))}`;
    const dateStr = `${cityDate.getFullYear()}-${pad2(cityDate.getMonth() + 1)}-${pad2(cityDate.getDate())}`;
    const isoAt = (hDec) => {
        if (typeof hDec !== 'number' || isNaN(hDec)) return null;
        const h = Math.floor(hDec);
        const m = Math.floor((hDec - h) * 60);
        return `${dateStr}T${pad2(h)}:${pad2(m)}:00${tzStr}`;
    };
    // مدة الصلاة الافتراضية لـ Event schema (30 دقيقة) — قابلة للاستخدام في تقاويم Google
    const isoAtPlus = (hDec, addMinutes) => {
        if (typeof hDec !== 'number' || isNaN(hDec)) return null;
        const total = hDec * 60 + addMinutes;
        const h = Math.floor(total / 60);
        const m = Math.floor(total % 60);
        return `${dateStr}T${pad2(h)}:${pad2(m)}:00${tzStr}`;
    };

    const raw = currentPrayerTimes.raw;
    const prayerDefs = [
        { key: 'fajr',    nameAr: 'صلاة الفجر',    nameEn: 'Fajr Prayer' },
        { key: 'dhuhr',   nameAr: 'صلاة الظهر',    nameEn: 'Dhuhr Prayer' },
        { key: 'asr',     nameAr: 'صلاة العصر',    nameEn: 'Asr Prayer' },
        { key: 'maghrib', nameAr: 'صلاة المغرب',   nameEn: 'Maghrib Prayer' },
        { key: 'isha',    nameAr: 'صلاة العشاء',   nameEn: 'Isha Prayer' },
    ];

    const location = {
        "@type": "Place",
        "name": cityDisplay,
        "address": countryName ? {
            "@type": "PostalAddress",
            "addressLocality": cityDisplay,
            "addressCountry": countryName
        } : undefined,
        "geo": (typeof currentLat === 'number' && typeof currentLng === 'number') ? {
            "@type": "GeoCoordinates",
            "latitude": currentLat,
            "longitude": currentLng
        } : undefined
    };

    const events = prayerDefs.map((p) => {
        const start = isoAt(raw[p.key]);
        if (!start) return null;
        const end = isoAtPlus(raw[p.key], 30); // 30 دقيقة افتراضياً
        return {
            "@type": "Event",
            "@id": `${pageUrl}#event-${p.key}-${dateStr}`,
            "name": isEn ? `${p.nameEn} in ${cityDisplay}` : `${p.nameAr} في ${cityDisplay}`,
            "startDate": start,
            "endDate": end,
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "eventStatus": "https://schema.org/EventScheduled",
            "location": location,
            "inLanguage": isEn ? 'en' : 'ar',
            "isAccessibleForFree": true,
            "organizer": {
                "@type": "Organization",
                "name": isEn ? 'Prayer Times' : 'مواقيت الصلاة',
                "url": origin + '/'
            }
        };
    }).filter(Boolean);

    if (!events.length) return;
    _seoUpsertSchema('prayer-events-schema', {
        "@context": "https://schema.org",
        "@graph": events
    });
}

// ─────────────────────────────────────────────────────────────
//   البوابة الذكية — دوال الصفحة الرئيسية
// ─────────────────────────────────────────────────────────────

/**
 * التنقل عبر بطاقات البوابة (تُحاكي نقر رابط الشريط الجانبي)
 */
function navToPage(pageId) {
    const link = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`);
    if (link) link.click();
}

/**
 * تحديث بيانات البوابة الذكية في الصفحة الرئيسية
 */
function updateHomeGateway() {
    // ── 1. التاريخ الهجري ──────────────────────────────────
    const hijri = HijriDate.getToday();
    const hMonths = HijriDate.hijriMonths;
    const hSuffix = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
    const hijriStr = `${hijri.day} ${hMonths[hijri.month - 1]} ${hijri.year}${hSuffix}`;

    const qaHijri = document.getElementById('qa-hijri-date');
    if (qaHijri) qaHijri.textContent = hijriStr;

    // ── 2. اتجاه القبلة (يُحسب من الموقع الحالي) ──────────
    const qiblaDirEl = document.getElementById('qa-qibla-dir');
    if (qiblaDirEl && currentLat && currentLng) {
        try {
            const angle = Qibla.calculate(currentLat, currentLng);
            const lang  = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
            const dir   = Qibla.getDirection(angle, lang);
            qiblaDirEl.textContent = Math.round(angle) + '° — ' + dir;
        } catch (e) { /* استمر بدون زاوية */ }
    }

    // ── 3. طور القمر (يُحسب للتاريخ الحالي) ────────────────
    const moonPhaseEl = document.getElementById('qa-moon-phase');
    const moonIconEl  = document.getElementById('qa-moon-icon');
    if (moonPhaseEl) {
        try {
            const phaseInfo = MoonCalc.getPhaseName(new Date());
            const _ln = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
            moonPhaseEl.textContent = (phaseInfo.key && typeof t === 'function') ? t(phaseInfo.key) : phaseInfo.name;
            if (moonIconEl) moonIconEl.textContent = phaseInfo.icon;
        } catch (e) { /* استمر بدون طور */ }
    }

    // ── 3b. 🆕 Round 7 (Homepage Audit): upgrade time-left / next-prayer tiles hrefs to user's city
    //    على الرئيسيّة فقط (لا نلمس على صفحات المدن). إذا المستخدم في الرياض مثلاً، نحدّث:
    //    /time-left-until-prayer-in-mecca → /time-left-until-prayer-in-riyadh
    try {
        const _onHomepage = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/?)?$/.test(window.location.pathname);
        if (_onHomepage && typeof currentEnglishName === 'string' && currentEnglishName) {
            const _slug = currentEnglishName.toLowerCase().trim()
                .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
            if (_slug) {
                const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                const _pfx = (_lng === 'ar') ? '' : ('/' + _lng);
                const _tlTile = document.getElementById('qa-time-left');
                const _npTile = document.getElementById('qa-next-prayer');
                if (_tlTile) _tlTile.href = _pfx + '/time-left-until-prayer-in-' + _slug;
                if (_npTile) _npTile.href = _pfx + '/next-prayer-time-in-' + _slug;
            }
        }
    } catch (_e) { /* keep default mecca href */ }

    // ── 4. في صفحات المدن: عناوين البطاقات الثلاث (هجري/قبلة/قمر) تحمل اسم المدينة
    //   "التاريخ الهجري اليوم في {المدينة}"، "اتجاه القبلة في {المدينة}"، "القمر اليوم في {المدينة}"
    //   — نعدّل .qa-title ونُزيل data-i18n لمنع i18n auto-binder من دَوس نصّنا
    try {
        const _isCityPage = document.body.classList.contains('city-prayer-page')
                         || (document.documentElement && document.documentElement.classList.contains('city-page'));
        if (_isCityPage) {
            // استخراج slug المدينة من عنوان URL أوّلاً (أدق من currentCity على صفحات URL-based)
            //   مثال: /en/prayer-times-in-london-51.5074-0.1278 → london
            //   ثم نستخدم _moonCityDisplayName للتعريب التلقائيّ (city.<slug>) مع fallback للـ prettify
            let _cityLabelQA = '';
            try {
                const _pmatch = window.location.pathname.match(
                    /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:prayer-times-in|qibla-in)-(.+?)(?:\.html)?$/
                );
                if (_pmatch && _pmatch[1]) {
                    const _cleanSlug = _pmatch[1].replace(/-?-?\d.*$/, '').replace(/-+$/, '');
                    if (_cleanSlug && typeof _moonCityDisplayName === 'function') {
                        _cityLabelQA = _moonCityDisplayName(_cleanSlug);
                    }
                }
            } catch (_e1) { /* silent */ }
            // fallback: getDisplayCity() / currentCity — مع تنظيف دفاعيّ لأيّ أرقام إحداثيّات
            if (!_cityLabelQA) {
                _cityLabelQA = (typeof getDisplayCity === 'function') ? getDisplayCity() : (currentCity || '');
                if (_cityLabelQA && /\s+-?\d+\.\d+/.test(_cityLabelQA)) {
                    _cityLabelQA = _cityLabelQA.replace(/\s+-?\d+\.\d+.*$/, '').trim();
                }
            }
            if (_cityLabelQA) {
                const _lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                // قوالب معرّبة لـ 10 لغات (hijri / qibla / moon)
                const QA_TPL = {
                    ar: { hijri: c => `التاريخ الهجري اليوم في ${c}`, qibla: c => `اتجاه القبلة في ${c}`,   moon: c => `القمر اليوم في ${c}` },
                    en: { hijri: c => `Today's Hijri Date in ${c}`,   qibla: c => `Qibla Direction in ${c}`, moon: c => `Moon Today in ${c}` },
                    fr: { hijri: c => `Date hégirienne aujourd'hui à ${c}`, qibla: c => `Direction de la Qibla à ${c}`, moon: c => `Lune aujourd'hui à ${c}` },
                    tr: { hijri: c => `${c} için Bugünkü Hicri Tarih`, qibla: c => `${c} Kıble Yönü`,    moon: c => `${c} için Bugün Ay` },
                    ur: { hijri: c => `${c} میں آج کی ہجری تاریخ`,    qibla: c => `${c} میں قبلہ کا رخ`, moon: c => `${c} میں آج کا چاند` },
                    de: { hijri: c => `Hidschri-Datum heute in ${c}`, qibla: c => `Qibla-Richtung in ${c}`, moon: c => `Mond heute in ${c}` },
                    id: { hijri: c => `Tanggal Hijriah Hari Ini di ${c}`, qibla: c => `Arah Kiblat di ${c}`, moon: c => `Bulan Hari Ini di ${c}` },
                    es: { hijri: c => `Fecha hijri de hoy en ${c}`,  qibla: c => `Dirección de la Qibla en ${c}`, moon: c => `Luna hoy en ${c}` },
                    bn: { hijri: c => `${c}-এ আজকের হিজরি তারিখ`,   qibla: c => `${c}-এ কিবলার দিক`, moon: c => `${c}-এ আজকের চাঁদ` },
                    ms: { hijri: c => `Tarikh Hijrah Hari Ini di ${c}`, qibla: c => `Arah Kiblat di ${c}`, moon: c => `Bulan Hari Ini di ${c}` }
                };
                const _tpl = QA_TPL[_lang] || QA_TPL.en;
                const _apply = (selector, tplFn) => {
                    const el = document.querySelector(selector);
                    if (!el) return;
                    el.textContent = tplFn(_cityLabelQA);
                    // منع i18n من إعادة الكتابة لاحقًا
                    el.removeAttribute('data-i18n');
                };
                _apply('#home-quick-access a[onclick*="hijri-today"] .qa-title', _tpl.hijri);
                _apply('#home-quick-access a[onclick*="qibla"] .qa-title',        _tpl.qibla);
                _apply('#home-quick-access a[onclick*="\'moon\'"] .qa-title',     _tpl.moon);
            }
        }
    } catch (_e) { /* silent */ }

    // Round 20: Moon Today Card — update href to city + phase label + illumination/age
    try { updateMoonTodayCard(); } catch (_e2) { /* silent */ }
}

// ─────────────────────────────────────────────────────────────
//   Round 20 — Summary Strip + Moon Today Card + Weekly/FAQ toggles
// ─────────────────────────────────────────────────────────────

/**
 * تحديث Summary+Info Strip (3 عناصر + زرّ إعدادات):
 * - الإمساك (الفجر − 10 دقائق)
 * - مدّة الصيام (Fajr → Maghrib)
 * - آخر ثلث الليل (Maghrib → Fajr، الثلث الأخير)
 */
function updateSummaryInfoStrip(times, fH, fM) {
    if (!times || !times.raw) return;
    const _imsakEl   = document.getElementById('sis-imsak');
    const _fastEl    = document.getElementById('sis-fasting');
    const _thirdEl   = document.getElementById('sis-last-third');
    const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const _tf  = (typeof PrayerTimes !== 'undefined' && typeof PrayerTimes.getTimeFormat === 'function')
        ? PrayerTimes.getTimeFormat() : '24h';

    // ── (1) Imsak = Fajr − 10 دقائق ─────────────────────────
    if (_imsakEl) {
        try {
            const imsakDec = (times.raw.fajr - 10/60 + 24) % 24;
            _imsakEl.textContent = _formatDecimalHours(imsakDec, _tf);
        } catch (_) { _imsakEl.textContent = '—'; }
    }

    // ── (2) Fasting duration (reuse precomputed fH, fM) ─────
    if (_fastEl && typeof fH === 'number') {
        const hrLbl = (typeof t === 'function') ? t(fH === 1 ? 'unit.hour' : 'unit.hours') : 'ساعة';
        const minLbl = (typeof t === 'function') ? t('unit.min') : 'دقيقة';
        const andLbl = (typeof t === 'function') ? t('unit.and') : ' و';
        _fastEl.textContent = fH + ' ' + hrLbl + (fM > 0 ? andLbl + fM + ' ' + minLbl : '');
    }

    // ── (3) Last Third of Night (من المغرب → الفجر، الثلث الأخير) ─
    if (_thirdEl) {
        try {
            const magh = times.raw.maghrib;
            const fajr = times.raw.fajr;
            let nightLen = fajr - magh; if (nightLen <= 0) nightLen += 24; // عبر منتصف الليل
            const lastThirdStart = (magh + (nightLen * 2/3)) % 24;
            const lastThirdEnd   = fajr;
            _thirdEl.textContent = _formatDecimalHours(lastThirdStart, _tf) + ' → ' + _formatDecimalHours(lastThirdEnd, _tf);
        } catch (_) { _thirdEl.textContent = '—'; }
    }

    // ── (4) 🆕 Calculation Method (city-page OR homepage — SEO) ───
    const _calcEl = document.getElementById('sis-calc-method');
    if (_calcEl) {
        try {
            let method = '';
            if (typeof PrayerTimes !== 'undefined' && PrayerTimes.getMethod) {
                method = PrayerTimes.getMethod();
            } else {
                const sel = document.getElementById('calc-method');
                if (sel) method = sel.value;
            }
            method = (method || 'MWL').toString();
            // محاولة الترجمة عبر i18n، مع fallback لـshort label من <option>
            let label = '';
            if (typeof t === 'function') {
                const _try = t('method.' + method);
                if (_try && _try !== 'method.' + method) label = _try;
            }
            if (!label) {
                const sel = document.getElementById('calc-method');
                const opt = sel ? sel.querySelector('option[value="' + method + '"]') : null;
                if (opt) label = (opt.textContent || '').trim().split('(')[0].trim();
            }
            _calcEl.textContent = label || method;
        } catch (_) { _calcEl.textContent = '—'; }
    }
}

// Helper: decimal hours (e.g. 4.5) → "HH:MM" (respects 12h/24h format)
function _formatDecimalHours(dec, tf) {
    const h = Math.floor(dec);
    const m = Math.round((dec - h) * 60);
    const hh = ((m === 60) ? (h + 1) : h) % 24;
    const mm = (m === 60) ? 0 : m;
    if (tf === '12h') {
        const ampm = hh >= 12 ? 'PM' : 'AM';
        let h12 = hh % 12; if (h12 === 0) h12 = 12;
        return h12 + ':' + String(mm).padStart(2, '0') + ' ' + ampm;
    }
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

// ═════════════════════════════════════════════════════════════════
//   Phase 2 — City Page helpers (City Hero, Summary Paragraph,
//   Next Days Forecast, Related Links, Other Trending Cities,
//   Mini Islamic Tools)
// ═════════════════════════════════════════════════════════════════

/**
 * Phase 2 helper: get current city slug from pathname
 * @returns {string} citySlug (e.g. 'riyadh')
 */
function _getCitySlugFromPath() {
    try {
        const m = window.location.pathname.match(/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?prayer-times-in-([a-z][a-z0-9-]+?)(?:-\-?\d+(?:\.\d+)?-\-?\d+(?:\.\d+)?)?\/?$/);
        return (m && m[1]) ? m[1] : '';
    } catch (_) { return ''; }
}

/**
 * Phase 2 helper: get country slug from currentCountryCode / currentEnglishCountry
 * يستعمل الـ helper الموجود في الملف: makeCountrySlug()
 */
function _getCurrentCountrySlug() {
    try {
        if (typeof makeCountrySlug === 'function') {
            return makeCountrySlug(currentCountryCode, currentEnglishCountry) || '';
        }
    } catch (_) {}
    return '';
}

/**
 * Phase 2 helper: is this a city page?
 */
function _isCityPagePhase2() {
    try {
        return document.body.classList.contains('city-prayer-page')
            || document.documentElement.classList.contains('city-page');
    } catch (_) { return false; }
}

/**
 * 🆕 updateCityHeroAnswer — Answer-First hero for SEO.
 * يملأ: اسم المدينة/الدولة، الصلاة القادمة + وقتها، 6 chips (أذان ⇢ وقت).
 * (Polish round: أُزيل sub-question المكرِّر مع countdown).
 */
function updateCityHeroAnswer(times, nextName, nextTime, cityName, countryName) {
    const sec = document.getElementById('city-hero-answer');
    if (!sec || !_isCityPagePhase2()) return;
    sec.classList.remove('u-hidden');

    const _t = (typeof t === 'function') ? t : (k) => k;
    const _setText = (id, val) => {
        const el = document.getElementById(id);
        if (el && (val !== undefined && val !== null && val !== '')) el.textContent = val;
    };

    _setText('cha-city-label',    cityName || '—');
    _setText('cha-country-label', countryName || '');
    _setText('cha-city-inline',   cityName || '');
    _setText('cha-next-name',     nextName || '—');
    _setText('cha-next-time',     nextTime || '—');

    // 6 chips: الفجر/الشروق/الظهر/العصر/المغرب/العشاء
    _renderChaQuickTimes(times);
}

/**
 * داخليّ: يرسم 6 chips لـcha-quick-times من times.raw
 */
function _renderChaQuickTimes(times) {
    const host = document.getElementById('cha-quick-times');
    if (!host || !times || !times.raw) return;
    const tf = (typeof PrayerTimes !== 'undefined' && PrayerTimes.getTimeFormat)
        ? PrayerTimes.getTimeFormat() : '24h';
    const _t = (typeof t === 'function') ? t : (k) => k;
    const keys = [
        ['fajr',    'prayer.fajr',    'الفجر'],
        ['sunrise', 'prayer.sunrise', 'الشروق'],
        ['dhuhr',   'prayer.dhuhr',   'الظهر'],
        ['asr',     'prayer.asr',     'العصر'],
        ['maghrib', 'prayer.maghrib', 'المغرب'],
        ['isha',    'prayer.isha',    'العشاء'],
    ];
    host.innerHTML = keys.map(([k, i18nKey, fallback]) => {
        const dec = times.raw[k];
        if (typeof dec !== 'number') return '';
        const label = _t(i18nKey) || fallback;
        return `<span class="cha-chip"><span class="cha-chip-label">${label}</span> <b>${_formatDecimalHours(dec, tf)}</b></span>`;
    }).join('');
}

/**
 * 🆕 updateCityHeroCountdown — يُحدَّث كلّ ثانية مع عدّاد الصلاة القادمة.
 * يستقبل نصّ العدّاد (مثلاً "2h 15m") — لا يحسبه بنفسه.
 */
function updateCityHeroCountdown(countdownText) {
    const el = document.getElementById('cha-countdown');
    if (el && _isCityPagePhase2()) el.textContent = countdownText || '—';
}

/**
 * 🆕 updateCitySummaryParagraph — فقرة SEO بعد Summary Strip.
 * إذا تمّ حقنها SSR لا نلمسها (detection via text length > 30).
 */
function updateCitySummaryParagraph(cityName, countryName, methodLabel, tz) {
    const sec = document.getElementById('city-summary-paragraph');
    const el  = document.getElementById('city-summary-text');
    const visEl = document.getElementById('city-summary-visible');
    if (!sec || !el || !_isCityPagePhase2()) return;
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';

    // 🆕 Round 2.1: ملء النصّ القصير المرئيّ (humanized + Hijri keyword للـSEO)
    if (visEl && (visEl.textContent || '').trim().length < 10) {
        const shortTpl = (({
            ar: `مواقيت الصلاة اليوم في ${cityName || ''} بالتوقيت المحلّي — مع التاريخ الهجريّ والميلاديّ.`,
            en: `Today's prayer times in ${cityName || ''} in local time — with Hijri and Gregorian dates.`,
            fr: `Heures de prière aujourd'hui à ${cityName || ''} à l'heure locale — avec les dates hégirienne et grégorienne.`,
            tr: `${cityName || ''} için bugünün namaz vakitleri — yerel saatle, Hicri ve Miladi tarihle birlikte.`,
            ur: `آج ${cityName || ''} میں اوقاتِ نماز مقامی وقت کے مطابق — ہجری اور عیسوی تاریخ کے ساتھ۔`,
            de: `Heutige Gebetszeiten in ${cityName || ''} in Ortszeit — mit Hijri- und gregorianischem Datum.`,
            id: `Jadwal sholat hari ini di ${cityName || ''} dalam waktu setempat — dengan tanggal Hijriah dan Masehi.`,
            es: `Horarios de oración hoy en ${cityName || ''} en hora local — con fechas Hijri y Gregoriana.`,
            bn: `আজ ${cityName || ''}-এ নামাজের সময় স্থানীয় সময়ে — হিজরি ও গ্রেগরিয়ান তারিখসহ।`,
            ms: `Waktu solat hari ini di ${cityName || ''} dalam waktu tempatan — dengan tarikh Hijrah dan Masihi.`,
        })[lang]) || `Today's prayer times in ${cityName || ''} in local time — with Hijri and Gregorian dates.`;
        visEl.textContent = shortTpl;
    }

    // إن كان SSR حقنه — اكتفِ بإزالة u-hidden
    if ((el.textContent || '').trim().length > 30) {
        sec.classList.remove('u-hidden');
        return;
    }
    const _t = (typeof t === 'function') ? t : null;
    const tpl = (_t ? _t('city.summary.tpl') : '') ||
        (({
            ar: 'تعرض هذه الصفحة مواقيت الصلاة لمدينة {city}, {country}, وفق طريقة {method}, بتوقيت {tz}. تُحدَّث المواقيت يوميّاً وتشمل الفجر والشروق والظهر والعصر والمغرب والعشاء.',
            en: 'This page shows prayer times for {city}, {country} using the {method} method, in timezone {tz}. Times are updated daily and include Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha.',
            fr: "Cette page affiche les heures de prière pour {city}, {country} selon la méthode {method}, fuseau horaire {tz}. Mises à jour quotidiennement.",
            tr: '{city}, {country} için namaz vakitleri — {method} yöntemi, {tz} zaman dilimi. Günlük güncellenir.',
            ur: 'یہ صفحہ {city}, {country} کے اوقاتِ نماز دکھاتا ہے — طریقہ {method}, ٹائم زون {tz}۔',
            de: 'Diese Seite zeigt die Gebetszeiten für {city}, {country} nach der {method}-Methode, Zeitzone {tz}.',
            id: 'Halaman ini menampilkan jadwal sholat untuk {city}, {country} menggunakan metode {method}, zona waktu {tz}.',
            es: 'Esta página muestra los horarios de oración para {city}, {country} usando el método {method}, zona horaria {tz}.',
            bn: 'এই পৃষ্ঠায় {city}, {country}-এর নামাজের সময় দেখানো হয়েছে — পদ্ধতি {method}, টাইমজোন {tz}।',
            ms: 'Halaman ini menunjukkan waktu solat untuk {city}, {country} menggunakan kaedah {method}, zon waktu {tz}.',
        })[lang] || 'This page shows prayer times for {city}, {country} using the {method} method, timezone {tz}.');
    el.textContent = tpl
        .replace(/\{city\}/g,    cityName    || '')
        .replace(/\{country\}/g, countryName || '')
        .replace(/\{method\}/g,  methodLabel || '')
        .replace(/\{tz\}/g,      tz          || '');
    sec.classList.remove('u-hidden');
}

/**
 * 🆕 updateRelatedLinks — 6 روابط في 3 tiers (Polish Round E)
 * 🟢 Live: time-left, qibla   🔵 Info: hijri, moon   ⚪ Nav: weekly, country
 */
function updateRelatedLinks(citySlug, cityName, countrySlug, countryName, lang) {
    const sec = document.getElementById('related-links-section');
    if (!sec || !_isCityPagePhase2()) return;

    const _t = (typeof t === 'function') ? t : null;
    const prefix = (lang && lang !== 'ar') ? ('/' + lang) : '';

    // عنوان القسم "روابط ذات صلة في {المدينة}"
    const lblCity = document.getElementById('rls-city-label');
    if (lblCity && cityName) lblCity.textContent = cityName;

    const items = [
        // 🟢 Live tier (Refinement #5 — i18n badge): time-left, next-prayer, qibla
        ['rl-time-left',    prefix + '/time-left-until-prayer-in-' + citySlug, 'rls.time_left',    cityName, true],
        ['rl-next-prayer',  prefix + '/next-prayer-time-in-' + citySlug,       'rls.next_prayer',  cityName, true],
        ['rl-qibla',        prefix + '/qibla-in-' + citySlug,                  'rls.qibla',        cityName, true],
        // 🔵 Info tier
        ['rl-hijri',     prefix + '/hijri-calendar',                        'rls.hijri',     cityName, true],
        ['rl-moon',      prefix + '/moon-today-in-' + citySlug,             'rls.moon',      cityName, true],
        // ⚪ Nav tier (Refinement #4 — country link uses "اليوم")
        ['rl-weekly',    prefix + '/prayer-times-in-' + citySlug + '#prayer-schedule-section', 'rls.weekly', cityName, true],
        ['rl-country',   prefix + '/prayer-times-in-' + (countrySlug || ''), 'rls.country',   countryName || cityName, !!countrySlug],
    ];

    const fallbackTpl = {
        'rls.time_left': { ar: 'كم باقي على الصلاة في {loc}', en: 'Time left until prayer in {loc}', fr: 'Temps restant avant la prière à {loc}', tr: '{loc} namaza kalan süre', ur: '{loc} اگلی نماز میں وقت باقی', de: 'Zeit bis zum nächsten Gebet in {loc}', id: 'Berapa lama lagi sholat di {loc}', es: 'Tiempo restante para la oración en {loc}', bn: '{loc}-এ পরবর্তী নামাজের বাকি সময়', ms: 'Berapa lama lagi solat di {loc}' },
        'rls.next_prayer': { ar: 'الصلاة القادمة في {loc}', en: 'Next prayer in {loc}', fr: 'Prochaine prière à {loc}', tr: '{loc} için sıradaki namaz', ur: '{loc} میں اگلی نماز', de: 'Nächstes Gebet in {loc}', id: 'Sholat berikutnya di {loc}', es: 'Próxima oración en {loc}', bn: '{loc}-এ পরবর্তী নামাজ', ms: 'Solat seterusnya di {loc}' },
        'rls.country':   { ar: 'مواقيت الصلاة اليوم في {loc}', en: "Today's Prayer Times in {loc}", fr: "Heures de prière aujourd'hui à {loc}", tr: '{loc} için bugünkü namaz vakitleri', ur: 'آج {loc} میں اوقاتِ نماز', de: 'Gebetszeiten heute in {loc}', id: 'Jadwal Sholat Hari Ini di {loc}', es: 'Horarios de Oración Hoy en {loc}', bn: 'আজ {loc}-এ নামাজের সময়', ms: 'Waktu Solat Hari Ini di {loc}' },
        'rls.weekly':    { ar: 'الجدول الأسبوعيّ في {loc}',    en: 'Weekly Schedule in {loc}',      fr: 'Programme hebdomadaire à {loc}', tr: '{loc} Haftalık Program', ur: '{loc} ہفتہ وار شیڈول', de: 'Wochenplan in {loc}', id: 'Jadwal Mingguan di {loc}', es: 'Programa Semanal en {loc}', bn: '{loc}-এ সাপ্তাহিক সূচি', ms: 'Jadual Mingguan di {loc}' },
        'rls.qibla':     { ar: 'اتّجاه القبلة في {loc}',       en: 'Qibla Direction in {loc}',      fr: 'Direction de la Qibla à {loc}', tr: '{loc} Kıble Yönü', ur: '{loc} سمتِ قبلہ', de: 'Qibla-Richtung in {loc}', id: 'Arah Kiblat di {loc}', es: 'Dirección de Qibla en {loc}', bn: '{loc}-এ কিবলার দিক', ms: 'Arah Kiblat di {loc}' },
        'rls.hijri':     { ar: 'التاريخ الهجريّ في {loc}',     en: 'Hijri Date in {loc}',           fr: 'Date Hijri à {loc}', tr: '{loc} Hicri Tarih', ur: '{loc} ہجری تاریخ', de: 'Hidschri-Datum in {loc}', id: 'Tanggal Hijriah di {loc}', es: 'Fecha Hijri en {loc}', bn: '{loc}-এ হিজরি তারিখ', ms: 'Tarikh Hijriah di {loc}' },
        'rls.moon':      { ar: 'حالة القمر اليوم في {loc}',    en: 'Moon Phase Today in {loc}',     fr: 'Phase de la lune à {loc}', tr: '{loc} Ay Evresi', ur: '{loc} میں چاند کی حالت', de: 'Mondphase heute in {loc}', id: 'Fase Bulan Hari Ini di {loc}', es: 'Fase Lunar Hoy en {loc}', bn: '{loc}-এ আজকের চাঁদ', ms: 'Fasa Bulan Hari Ini di {loc}' },
    };

    items.forEach(([id, href, key, loc, enabled]) => {
        const a = document.getElementById(id);
        if (!a) return;
        const li = a.closest('li');
        if (!enabled) { if (li) li.style.display = 'none'; return; }
        if (li) li.style.display = '';
        a.href = href;
        let tpl = '';
        if (_t) {
            const _try = _t(key);
            if (_try && _try !== key) tpl = _try;
        }
        if (!tpl) tpl = (fallbackTpl[key] && fallbackTpl[key][lang]) || (fallbackTpl[key] && fallbackTpl[key].en) || ('{loc}');
        // Polish Round E: update inner .rls-text span (not the whole anchor — icon/badge/arrow preserved)
        const txt = a.querySelector('.rls-text');
        const finalText = tpl.replace(/\{loc\}/g, loc || '');
        if (txt) {
            txt.textContent = finalText;
        } else {
            a.textContent = finalText; // fallback compat if structure not yet loaded
        }
    });

    sec.classList.remove('u-hidden');
}

/**
 * 🆕 updateOtherTrendingCities — مدن مبنيّة على popularity (مختلفة عن Nearby الجغرافيّة).
 * تستبعد المدينة الحاليّة ديناميكيّاً.
 */
function updateOtherTrendingCities(currentSlug, lang) {
    const sec = document.getElementById('other-trending-cities');
    const host = document.getElementById('otc-list');
    if (!sec || !host || !_isCityPagePhase2()) return;

    // قائمة popularity موسّعة لتعبئة الفراغ (16 مدينة بدل 8).
    // تُستبدَل Phase 3 بـ analytics. أسماء محلّية لكلّ لغة.
    const POP = [
        { slug: 'mecca',         names: { ar:'مكّة المكرّمة', en:'Mecca', fr:'La Mecque', tr:'Mekke', ur:'مکّہ مکرّمہ', de:'Mekka', id:'Makkah', es:'La Meca', bn:'মক্কা', ms:'Mekah' } },
        { slug: 'medina',        names: { ar:'المدينة المنوّرة', en:'Medina', fr:'Médine', tr:'Medine', ur:'مدینہ منوّرہ', de:'Medina', id:'Madinah', es:'Medina', bn:'মদিনা', ms:'Madinah' } },
        { slug: 'riyadh',        names: { ar:'الرياض', en:'Riyadh', fr:'Riyad', tr:'Riyad', ur:'ریاض', de:'Riad', id:'Riyadh', es:'Riad', bn:'রিয়াদ', ms:'Riyadh' } },
        { slug: 'jeddah',        names: { ar:'جدّة', en:'Jeddah', fr:'Djeddah', tr:'Cidde', ur:'جدہ', de:'Dschidda', id:'Jeddah', es:'Yeda', bn:'জেদ্দা', ms:'Jeddah' } },
        { slug: 'cairo',         names: { ar:'القاهرة', en:'Cairo', fr:'Le Caire', tr:'Kahire', ur:'قاہرہ', de:'Kairo', id:'Kairo', es:'El Cairo', bn:'কায়রো', ms:'Kaherah' } },
        { slug: 'alexandria',    names: { ar:'الإسكندرية', en:'Alexandria', fr:'Alexandrie', tr:'İskenderiye', ur:'اسکندریہ', de:'Alexandria', id:'Aleksandria', es:'Alejandría', bn:'আলেকজান্দ্রিয়া', ms:'Alexandria' } },
        { slug: 'dubai',         names: { ar:'دبي', en:'Dubai', fr:'Dubaï', tr:'Dubai', ur:'دبئی', de:'Dubai', id:'Dubai', es:'Dubái', bn:'দুবাই', ms:'Dubai' } },
        { slug: 'abu-dhabi',     names: { ar:'أبوظبي', en:'Abu Dhabi', fr:'Abou Dabi', tr:'Abu Dabi', ur:'ابوظہبی', de:'Abu Dhabi', id:'Abu Dhabi', es:'Abu Dabi', bn:'আবুধাবি', ms:'Abu Dhabi' } },
        { slug: 'istanbul',      names: { ar:'إسطنبول', en:'Istanbul', fr:'Istanbul', tr:'İstanbul', ur:'استنبول', de:'Istanbul', id:'Istanbul', es:'Estambul', bn:'ইস্তাম্বুল', ms:'Istanbul' } },
        { slug: 'amman',         names: { ar:'عمّان', en:'Amman', fr:'Amman', tr:'Amman', ur:'عمان', de:'Amman', id:'Amman', es:'Amán', bn:'আম্মান', ms:'Amman' } },
        { slug: 'baghdad',       names: { ar:'بغداد', en:'Baghdad', fr:'Bagdad', tr:'Bağdat', ur:'بغداد', de:'Bagdad', id:'Baghdad', es:'Bagdad', bn:'বাগদাদ', ms:'Baghdad' } },
        { slug: 'doha',          names: { ar:'الدوحة', en:'Doha', fr:'Doha', tr:'Doha', ur:'دوحہ', de:'Doha', id:'Doha', es:'Doha', bn:'দোহা', ms:'Doha' } },
        { slug: 'kuwait-city',   names: { ar:'مدينة الكويت', en:'Kuwait City', fr:'Koweït', tr:'Kuveyt', ur:'کویت سٹی', de:'Kuwait-Stadt', id:'Kota Kuwait', es:'Kuwait', bn:'কুয়েত সিটি', ms:'Bandar Kuwait' } },
        { slug: 'london',        names: { ar:'لندن', en:'London', fr:'Londres', tr:'Londra', ur:'لندن', de:'London', id:'London', es:'Londres', bn:'লন্ডন', ms:'London' } },
        { slug: 'paris',         names: { ar:'باريس', en:'Paris', fr:'Paris', tr:'Paris', ur:'پیرس', de:'Paris', id:'Paris', es:'París', bn:'প্যারিস', ms:'Paris' } },
        { slug: 'new-york',      names: { ar:'نيويورك', en:'New York', fr:'New York', tr:'New York', ur:'نیویارک', de:'New York', id:'New York', es:'Nueva York', bn:'নিউ ইয়র্ক', ms:'New York' } },
        { slug: 'jakarta',       names: { ar:'جاكرتا', en:'Jakarta', fr:'Jakarta', tr:'Cakarta', ur:'جکارتہ', de:'Jakarta', id:'Jakarta', es:'Yakarta', bn:'জাকার্তা', ms:'Jakarta' } },
        { slug: 'kuala-lumpur',  names: { ar:'كوالالمبور', en:'Kuala Lumpur', fr:'Kuala Lumpur', tr:'Kuala Lumpur', ur:'کوالالمپور', de:'Kuala Lumpur', id:'Kuala Lumpur', es:'Kuala Lumpur', bn:'কুয়ালালামপুর', ms:'Kuala Lumpur' } },
        { slug: 'karachi',       names: { ar:'كراتشي', en:'Karachi', fr:'Karachi', tr:'Karaçi', ur:'کراچی', de:'Karatschi', id:'Karachi', es:'Karachi', bn:'করাচি', ms:'Karachi' } },
        { slug: 'lahore',        names: { ar:'لاهور', en:'Lahore', fr:'Lahore', tr:'Lahor', ur:'لاہور', de:'Lahore', id:'Lahore', es:'Lahore', bn:'লাহোর', ms:'Lahore' } },
        { slug: 'dhaka',         names: { ar:'دكا', en:'Dhaka', fr:'Dacca', tr:'Dakka', ur:'ڈھاکہ', de:'Dhaka', id:'Dhaka', es:'Daca', bn:'ঢাকা', ms:'Dhaka' } },
    ];

    // FIX: Prefix الترجمة "مواقيت الصلاة في" قبل اسم كل مدينة (لكل اللغات)
    const PREFIX_LBL = {
        ar: 'مواقيت الصلاة في',
        en: 'Prayer Times in',
        fr: 'Horaires des prières à',
        tr: 'Namaz vakitleri',
        ur: 'نماز کے اوقات',
        de: 'Gebetszeiten in',
        id: 'Jadwal Sholat',
        es: 'Horarios de oración en',
        bn: 'নামাজের সময় -',
        ms: 'Waktu Solat'
    };
    const prefix = (lang && lang !== 'ar') ? ('/' + lang) : '';
    const _lblPrefix = PREFIX_LBL[lang] || PREFIX_LBL.en;
    const list = POP.filter(c => c.slug !== currentSlug).slice(0, 16);
    host.innerHTML = list.map(c => {
        const name = (c.names && (c.names[lang] || c.names.en)) || c.slug;
        return `<a class="otc-chip" href="${prefix}/prayer-times-in-${c.slug}">${_lblPrefix} ${name}</a>`;
    }).join('');
    sec.classList.remove('u-hidden');
}

/**
 * 🆕 updateMiniIslamicTools — 3 أدوات فقط (قبلة/هجري/قمر) موجّهة للمدينة.
 */
function updateMiniIslamicTools(citySlug, lang) {
    const sec = document.getElementById('mini-islamic-tools');
    if (!sec || !_isCityPagePhase2()) return;

    const prefix = (lang && lang !== 'ar') ? ('/' + lang) : '';
    const _t = (typeof t === 'function') ? t : null;

    const items = [
        { id: 'mit-qibla', href: prefix + '/qibla-in-' + citySlug,     key: 'mit.qibla', fallback: { ar:'القبلة',     en:'Qibla',     fr:'Qibla',     tr:'Kıble',    ur:'قبلہ',      de:'Qibla',       id:'Kiblat',     es:'Qibla',   bn:'কিবলা',     ms:'Kiblat' } },
        { id: 'mit-hijri', href: prefix + '/hijri-calendar',           key: 'mit.hijri', fallback: { ar:'التاريخ الهجريّ', en:'Hijri Date', fr:'Date Hijri', tr:'Hicri Tarih', ur:'ہجری تاریخ', de:'Hidschri',    id:'Tanggal Hijriah', es:'Fecha Hijri', bn:'হিজরি তারিখ', ms:'Tarikh Hijriah' } },
        { id: 'mit-moon',  href: prefix + '/moon-today-in-' + citySlug, key: 'mit.moon',  fallback: { ar:'القمر اليوم',    en:'Moon Today', fr:'Lune aujourd\'hui', tr:'Bugün Ay', ur:'آج کا چاند', de:'Mond heute', id:'Bulan Hari Ini', es:'Luna Hoy', bn:'আজকের চাঁদ',  ms:'Bulan Hari Ini' } },
    ];

    items.forEach(it => {
        const a = document.getElementById(it.id);
        if (!a) return;
        a.href = it.href;
        const lblEl = a.querySelector('.mit-label');
        if (lblEl) {
            let txt = '';
            if (_t) { const _try = _t(it.key); if (_try && _try !== it.key) txt = _try; }
            if (!txt) txt = it.fallback[lang] || it.fallback.en;
            lblEl.textContent = txt;
        }
    });
}

/**
 * 🆕 applyCityPageWeekly — في صفحة المدينة: 7 أيّام كاملة + زرّ يوجّه لـmonthly.
 */
function applyCityPageWeekly(citySlug, lang) {
    if (!_isCityPagePhase2()) return;
    const wrap = document.getElementById('weekly-table-wrap');
    if (wrap) wrap.setAttribute('data-full', 'true');
    // 🔧 BUGFIX: الزرّ كان يوجّه إلى /monthly-prayer-times-in-{slug} الذي لم يُنشَأ بعد (Phase 3).
    //          الضغط عليه يفتح 404 — نُخفيه حتّى إنشاء الصفحة الشهريّة.
    //          + الجدول الأسبوعيّ كلّه ظاهر (data-full=true) فلا حاجة لزرّ "عرض المزيد".
    const btn = document.querySelector('.weekly-expand-btn, [data-weekly-toggle]');
    if (btn) {
        btn.style.display = 'none';
        btn.setAttribute('hidden', '');
        btn.onclick = null;
    }
    const pag = document.getElementById('schedule-pagination');
    if (pag) pag.classList.add('u-hidden');
}

/**
 * 🆕 applyFaqCityMode — فتح كلّ الـ7 أسئلة في city-page + تطبيق placeholders.
 */
function applyFaqCityMode(cityName, methodLabel, countryName) {
    const faq = document.getElementById('faq-section');
    if (!faq) return;
    if (_isCityPagePhase2()) {
        faq.classList.add('faq-city-mode');
        faq.classList.add('faq-full');
    }
    // تطبيق {loc} / {method} / {country} على كلّ الأسئلة
    try {
        if (typeof replaceFaqPlaceholders === 'function') {
            replaceFaqPlaceholders(cityName, methodLabel, countryName);
        }
    } catch (_) {}
}

// ═════════════════════════════════════════════════════════════════
//   Phase 2 — Orchestration (يُستدعى بعد تحديث المواقيت)
// ═════════════════════════════════════════════════════════════════

/**
 * orchestrator يُستدعى من updatePrayerTimes() بعد حساب الصلاة القادمة.
 * يستقبل: times (pt object), nextPrayerName, nextPrayerTime (formatted).
 */
function applyPhase2CityPage(times, nextPrayerName, nextPrayerTime) {
    if (!_isCityPagePhase2()) return;
    try {
        const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const citySlug = _getCitySlugFromPath();
        const countrySlug = _getCurrentCountrySlug();

        // أسماء محلّية
        const cityNameLoc = (lang === 'ar')
            ? (currentCity || currentEnglishDisplayName || currentEnglishName || '')
            : ((typeof getDisplayCity === 'function' && getDisplayCity())
                || currentLocalizedName || currentEnglishDisplayName || currentEnglishName || currentCity || '');
        // 🔧 Round 2 fix: استخدام getDisplayCountry() للتحقّق من _LOCALIZED_COUNTRY_MAPS أوّلاً
        // (يُصلح مشكلة ظهور "Saudi Arabia" بدل "সৌদি আরব" في البنغاليّة وغيرها من اللغات)
        const countryNameLoc = (lang === 'ar')
            ? (currentCountry || currentEnglishCountry || '')
            : ((typeof getDisplayCountry === 'function' && getDisplayCountry())
                || currentLocalizedCountry || currentEnglishCountry || currentCountry || '');

        // method label
        let methodLabel = '';
        try {
            const sel = document.getElementById('calc-method');
            const methodVal = (typeof PrayerTimes !== 'undefined' && PrayerTimes.getMethod) ? PrayerTimes.getMethod() : (sel ? sel.value : 'MWL');
            if (typeof t === 'function') {
                const _try = t('method.' + methodVal);
                if (_try && _try !== 'method.' + methodVal) methodLabel = _try;
            }
            if (!methodLabel && sel) {
                const opt = sel.querySelector('option[value="' + methodVal + '"]');
                if (opt) methodLabel = (opt.textContent || '').trim().split('(')[0].trim();
            }
            if (!methodLabel) methodLabel = methodVal || 'MWL';
        } catch (_) { methodLabel = 'MWL'; }

        // tz
        let tz = '';
        try { tz = (typeof PrayerTimes !== 'undefined' && PrayerTimes.getTimeZone) ? (PrayerTimes.getTimeZone() || '') : ''; } catch (_) {}
        if (!tz) { try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (_) { tz = 'UTC'; } }

        // coords
        const lat = (typeof currentLat === 'number') ? currentLat : null;
        const lng = (typeof currentLng === 'number') ? currentLng : null;

        // 1. City Hero Answer
        updateCityHeroAnswer(times, nextPrayerName, nextPrayerTime, cityNameLoc, countryNameLoc);

        // 2. City Summary Paragraph (SSR-aware)
        updateCitySummaryParagraph(cityNameLoc, countryNameLoc, methodLabel, tz);

        // 4. Related Links (5 هرميّة)
        if (citySlug) {
            updateRelatedLinks(citySlug, cityNameLoc, countrySlug, countryNameLoc, lang);
        }

        // 5. Other Trending Cities (popularity)
        if (citySlug) {
            updateOtherTrendingCities(citySlug, lang);
        }

        // 6. Mini Islamic Tools (3 أدوات)
        if (citySlug) {
            updateMiniIslamicTools(citySlug, lang);
        }

        // 7. Weekly → full + monthly re-route
        if (citySlug) {
            applyCityPageWeekly(citySlug, lang);
        }

        // 8. FAQ city mode + placeholders
        applyFaqCityMode(cityNameLoc, methodLabel, countryNameLoc);
    } catch (e) {
        try { console.warn('[Phase2] applyPhase2CityPage failed', e); } catch (_) {}
    }
}

/**
 * Weekly Table — toggle between compact (3 days) and full (7+ days).
 * يُغيّر data-full على #weekly-table-wrap + نصّ الزرّ.
 */
function toggleWeeklyFull(btn) {
    const wrap = document.getElementById('weekly-table-wrap');
    if (!wrap) return;
    const isFull = wrap.getAttribute('data-full') === 'true';
    wrap.setAttribute('data-full', isFull ? 'false' : 'true');
    const newKey = isFull ? 'weekly.show_all' : 'weekly.collapse';
    if (btn) {
        btn.setAttribute('data-i18n', newKey);
        btn.textContent = (typeof t === 'function') ? t(newKey) : (isFull ? 'عرض الجدول الكامل' : 'طيّ الجدول');
    }
}

/**
 * FAQ — toggle between compact (3 questions) and full (all).
 * يُضيف/يُزيل كلاس faq-full على #faq-section + يُغيّر نصّ الزرّ.
 */
function toggleFaqAll(btn) {
    const faq = document.getElementById('faq-section');
    if (!faq) return;
    const expanded = faq.classList.toggle('faq-full');
    const newKey = expanded ? 'faq.collapse' : 'faq.show_all';
    if (btn) {
        btn.setAttribute('data-i18n', newKey);
        btn.textContent = (typeof t === 'function') ? t(newKey) : (expanded ? 'طيّ الأسئلة' : 'عرض كلّ الأسئلة');
    }
}

/**
 * Countries Toggle — يفتح/يُطوي قسم الدول (Round 21).
 * افتراضيّاً يعرض 12 دولة عربيّة + 10 عالميّة؛ الزرّ يكشف الباقي.
 */
function toggleCountriesFull(btn) {
    const sec = document.getElementById('arab-countries-section');
    if (!sec) return;
    const isFull = sec.getAttribute('data-full') === 'true';
    sec.setAttribute('data-full', isFull ? 'false' : 'true');
    const newKey = isFull ? 'countries.show_all' : 'countries.collapse';
    if (btn) {
        btn.setAttribute('data-i18n', newKey);
        btn.textContent = (typeof t === 'function') ? t(newKey) : (isFull ? '📖 عرض كلّ الدول' : '🔼 طيّ');
    }
}

/**
 * Moon Today Card — compact moon status card (استبدلت Moon Hubs الكاملة).
 * يحدّث: href → /moon-today-in-{city}، phase name، illum + age.
 */
function updateMoonTodayCard() {
    const cta = document.getElementById('mtc-cta');
    if (!cta) return;

    // ── (1) href: /moon-today-in-{citySlug} (with language prefix) ──
    const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const _langPrefix = (_lng === 'ar') ? '' : ('/' + _lng);
    let _citySlug = 'mecca';
    try {
        const _m = window.location.pathname.match(/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?prayer-times-in-([a-z][a-z0-9-]+?)(?:-\-?\d+(?:\.\d+)?-\-?\d+(?:\.\d+)?)?\/?$/);
        if (_m && _m[1]) _citySlug = _m[1];
    } catch (_) {}
    cta.setAttribute('href', _langPrefix + '/moon-today-in-' + _citySlug);

    // ── (2) phase name + illum + age ──────────────────────────
    const phaseEl = document.getElementById('mtc-phase-label');
    const subEl   = document.getElementById('mtc-illum-age');
    const iconEl  = document.getElementById('mtc-icon');
    try {
        if (typeof MoonCalc !== 'undefined' && MoonCalc.getPhaseName) {
            const p = MoonCalc.getPhaseName(new Date());
            if (phaseEl) phaseEl.textContent = (p.key && typeof t === 'function') ? t(p.key) : p.name;
            if (iconEl)  iconEl.textContent  = p.icon || '🌙';
        }
        if (typeof MoonCalc !== 'undefined' && (MoonCalc.getMoonIllumination || MoonCalc.getIllumination)) {
            const _illumRaw = (MoonCalc.getMoonIllumination || MoonCalc.getIllumination)(new Date());
            // قد يكون object {phase, fraction} أو رقم بين 0-1 أو 0-100
            let illum = (typeof _illumRaw === 'object' && _illumRaw !== null)
                ? (typeof _illumRaw.fraction === 'number' ? _illumRaw.fraction : (_illumRaw.phase || 0))
                : _illumRaw;
            if (illum > 0 && illum <= 1) illum = illum * 100;
            const _getAge = MoonCalc.getMoonAge || MoonCalc.getAge;
            const ageDays = (typeof _getAge === 'function') ? Math.round(_getAge(new Date())) : null;
            const daysLbl = (typeof t === 'function') ? t('moon.days') : 'يوم';
            if (subEl) {
                subEl.textContent = Math.round(illum) + '%' + (ageDays != null ? ' · ' + ageDays + ' ' + daysLbl : '');
            }
        }
    } catch (_e) { /* silent */ }
}

/**
 * يُعكس suggestions من حقل البحث الأصليّ (city-suggestions) إلى حقل البحث الكبير في Hero.
 * يُستدعى تلقائيّاً عبر MutationObserver — راجع wireHeroSuggestionsMirror().
 */
function mirrorSuggestionsToHero() {
    const src = document.getElementById('city-suggestions');
    const dst = document.getElementById('loc-hero-suggestions');
    if (!src || !dst) return;
    dst.innerHTML = src.innerHTML;
    // عكس حالة الفتح/الإغلاق أيضاً
    if (src.classList.contains('open')) {
        dst.classList.add('open');
    } else {
        dst.classList.remove('open');
    }
}

/**
 * يربط MutationObserver بـ #city-suggestions فيعكس أيّ تغيير تلقائيّاً إلى #loc-hero-suggestions.
 * كذلك يُفوِّض النقرات في Hero إلى العنصر المطابق في المصدر.
 * يُستدعى مرّة واحدة بعد DOMContentLoaded.
 */
let _heroMirrorObserver = null;
function wireHeroSuggestionsMirror() {
    try {
        const src = document.getElementById('city-suggestions');
        const dst = document.getElementById('loc-hero-suggestions');
        if (!src || !dst || _heroMirrorObserver) return;
        _heroMirrorObserver = new MutationObserver(() => {
            try { mirrorSuggestionsToHero(); } catch (_e) { /* silent */ }
        });
        _heroMirrorObserver.observe(src, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['class']
        });
        // تفويض النقر: عند الضغط على عنصر في Hero suggestions، نُشغّل click على الـ counterpart في المصدر
        // FIX: يشمل .sugg-online-btn أيضاً (كان مَنسياً → الزر لا يعمل من Hero)
        dst.addEventListener('click', function (ev) {
            // (1) suggestion-item ← مدن مقترحة
            const item = ev.target.closest('.suggestion-item');
            if (item) {
                const srcItems = src.querySelectorAll('.suggestion-item');
                const dstItems = dst.querySelectorAll('.suggestion-item');
                let idx = -1;
                dstItems.forEach((el, i) => { if (el === item) idx = i; });
                if (idx >= 0 && srcItems[idx]) {
                    srcItems[idx].click();
                    try {
                        const mainInput = document.getElementById('city-search-input');
                        const heroInput = document.getElementById('loc-hero-search');
                        if (mainInput && heroInput) heroInput.value = mainInput.value;
                    } catch (_e) {}
                }
                return;
            }
            // (2) sugg-online-btn ← زرّ "ابحث على الإنترنت عن X" — كان مكسوراً
            const onlineBtn = ev.target.closest('.sugg-online-btn');
            if (onlineBtn) {
                const srcBtn = src.querySelector('.sugg-online-btn');
                if (srcBtn) srcBtn.click();
                return;
            }
        });
        // إغلاق Hero suggestions عند النقر خارج loc-hero-search-wrap
        document.addEventListener('click', function (ev) {
            if (!ev.target.closest('.loc-hero-search-wrap')) {
                dst.classList.remove('open');
            }
        });
        // تحقّق أوّليّ
        mirrorSuggestionsToHero();
    } catch (_e) { /* silent */ }
}

/**
 * Hero "use my location" handler — explicitly user-triggered.
 * Detects geolocation and navigates DIRECTLY to /prayer-times-in-{city-slug}.
 *
 * R35 strategy — local-first nearest-city, never `loc-*`:
 *   1) Fast path — if localStorage['lsb_detected'] is fresh (≤ 30 min),
 *      navigate instantly using the cached city. No GPS, no network. ~50ms.
 *   2) GPS — getCurrentPosition (1-3s typical, unavoidable).
 *   3) Local nearest-city via _findNearestKnownCity(lat, lng) — ~10ms,
 *      offline, deterministic, always returns a result.
 *   4) navigateToCity with USER's coords + nearest city's name fields →
 *      URL slug = clean English city name (e.g. /prayer-times-in-riyadh),
 *      prayer-times/qibla math runs on the user's actual coords.
 *   5) Side-effect: _writeLsbDetected so future clicks hit the fast path.
 *
 * Singapore/Djibouti slug-collision guards live in navigateToCity().
 * No Nominatim. No timeouts. No retries. No `loc-*` URL ever produced from this button.
 */
let _locHeroNavInProgress = false;
function _locHeroDetectAndNavigate() {
    if (_locHeroNavInProgress) return;
    _locHeroNavInProgress = true;

    const btn   = document.getElementById('loc-hero-geo-btn');
    const label = btn?.querySelector('.lhb-label');
    const origText = label?.textContent || '';
    const loadingText = (typeof t === 'function' ? (t('header.locating') || origText) : origText);
    if (label) label.textContent = loadingText;
    if (btn)   btn.disabled = true;

    const _restore = () => {
        _locHeroNavInProgress = false;
        if (label && origText) label.textContent = origText;
        if (btn) btn.disabled = false;
    };

    // ── 1) مسار سريع — استخدم lsb_detected إن كان حديثاً (≤ 30 دقيقة) ──
    try {
        const raw = localStorage.getItem('lsb_detected');
        if (raw) {
            const d = JSON.parse(raw);
            if (d && isFinite(+d.lat) && isFinite(+d.lng) && (d.enName || d.arCity)
                && d.ts && (Date.now() - d.ts) < 30 * 60 * 1000) {
                try {
                    navigateToCity(+d.lat, +d.lng,
                        d.arCity || (d.names && d.names.ar) || '',
                        d.country || '',
                        d.enName || (d.names && d.names.en) || '',
                        (d.countryCode || '').toLowerCase());
                } catch (e) { _restore(); try { console.warn('[locHeroNav] fast-path nav failed:', e); } catch(_) {} }
                return;
            }
        }
    } catch (_e) { /* silent */ }

    // ── 2) GPS → 3) أقرب مدينة محليّة → 4) تنقّل مباشر ──
    if (!navigator.geolocation) {
        _restore();
        try { alert('الموقع غير مدعوم في هذا المتصفح'); } catch (_e) {}
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            try {
                const c = _findNearestKnownCity(lat, lng);
                _writeLsbDetected(c, lat, lng);
                navigateToCity(lat, lng, c.ar, c.country, c.en, c.cc);
            } catch (e) {
                _restore();
                try { console.warn('[locHeroNav] navigateToCity failed:', e); } catch (_) {}
            }
        },
        function (error) {
            _restore();
            try {
                alert('فشل تحديد الموقع. يُرجى السماح بالوصول إلى الموقع من إعدادات المتصفح.');
                console.warn('[locHeroNav] geo error:', error?.message);
            } catch (_e) {}
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
}

/**
 * Location-hero persuasive landing extras:
 *   1) Secondary "pick city" button → smooth-scroll to #loc-hero-search and focus it.
 *   2) Smart-pill hydration from localStorage['lsb_detected'] (last detected location).
 *      Clicking the pill navigates to /prayer-times-in-{slug} of that city.
 */
function _wireLocHeroExtras() {
    // ── Pick-city button → scroll to search + focus ──
    const pickBtn = document.getElementById('loc-hero-pick-btn');
    if (pickBtn && !pickBtn.dataset.wired) {
        pickBtn.dataset.wired = '1';
        pickBtn.addEventListener('click', function () {
            const s = document.getElementById('loc-hero-search');
            if (!s) return;
            try { s.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_e) {}
            setTimeout(() => { try { s.focus(); } catch (_e) {} }, 200);
        });
    }

    // ── Smart-redirect pill ──
    const pill = document.getElementById('loc-hero-smart-pill');
    if (!pill) return;

    let shown = false;
    try {
        const raw = localStorage.getItem('lsb_detected');
        if (raw) {
            const d = JSON.parse(raw);
            const ttlMs = 7 * 86400000;
            if (d && isFinite(d.lat) && isFinite(d.lng) && (d.enName || d.arCity)
                && (!d.ts || (Date.now() - d.ts) < ttlMs)) {
                const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                const localized = (d.names && d.names[lang])
                    || (lang === 'ar' ? (d.arCity || d.enName) : (d.enName || d.arCity));
                const enName = d.enName || d.arCity;
                const slug = (typeof makeSlug === 'function')
                    ? makeSlug(enName, d.lat, d.lng)
                    : String(enName).toLowerCase().replace(/\s+/g, '-');
                // Djibouti capital uses special slug to avoid collision with country page
                const finalSlug = (slug === 'djibouti' && (d.countryCode || '').toLowerCase() === 'dj')
                    ? 'djibouti-city'
                    : slug;
                const href = (typeof pageUrl === 'function')
                    ? pageUrl(`/prayer-times-in-${finalSlug}`)
                    : `/prayer-times-in-${finalSlug}`;

                // Localized labels
                const prefixMap = {
                    ar: 'آخر موقع استخدمته', en: 'Last location you used',
                    fr: 'Dernier emplacement utilisé', tr: 'Son kullandığınız konum',
                    ur: 'آخری استعمال شدہ مقام', de: 'Zuletzt verwendeter Standort',
                    id: 'Lokasi terakhir yang kamu pakai', es: 'Última ubicación usada',
                    bn: 'শেষ ব্যবহৃত অবস্থান', ms: 'Lokasi terakhir anda guna'
                };
                const ctaMap = {
                    ar: 'عرض مواقيت الصلاة', en: 'Show prayer times',
                    fr: 'Voir les horaires', tr: 'Namaz vakitlerini göster',
                    ur: 'اوقاتِ نماز دیکھیں', de: 'Gebetszeiten anzeigen',
                    id: 'Lihat jadwal sholat', es: 'Ver horarios de oración',
                    bn: 'নামাজের সময় দেখুন', ms: 'Lihat waktu solat'
                };
                const prefix = prefixMap[lang] || prefixMap.en;
                const cta    = ctaMap[lang]    || ctaMap.en;

                pill.setAttribute('href', href);
                pill.innerHTML =
                    `<span class="lhsp-icon" aria-hidden="true">📍</span>` +
                    `<span class="lhsp-prefix">${prefix}:</span>` +
                    `<strong class="lhsp-city">${localized}</strong>` +
                    `<span class="lhsp-arrow" aria-hidden="true">→</span>` +
                    `<span class="lhsp-cta">${cta}</span>`;
                pill.hidden = false;
                pill.classList.add('is-visible');
                shown = true;
            }
        }
    } catch (_e) { /* silent */ }

    if (!shown) {
        pill.hidden = true;
        pill.classList.remove('is-visible');
    }
}

/**
 * إدخال Hero search يُحوَّل إلى حقل البحث الأصليّ onCitySearchInput.
 */
function onHeroSearchInput(query) {
    try {
        const mainInput = document.getElementById('city-search-input');
        if (mainInput) mainInput.value = query;
    } catch (_e) { /* silent */ }
    try { onCitySearchInput(query); } catch (_e) { /* silent */ }
}

/**
 * إدخال Enter/Escape/Arrow keys من Hero search — نعيد التوجيه إلى المعالج الأصليّ.
 */
function onHeroSearchKeyDown(e) {
    try { onSearchKeyDown(e); } catch (_e) { /* silent */ }
}

// ─────────────────────────────────────────────────────────────
//   شريط اقتراح المدينة (بدون تحويل تلقائي)
// ─────────────────────────────────────────────────────────────

/**
 * اكتشاف عكسي للاقتراح فقط — لا يُحدّث المتغيرات العامة ولا يوجّه
 */
function reverseGeocodeForSuggestion(lat, lng) {
    // نفس الكاش الذي يستخدمه reverseGeocode (zoom=10) — توفير مضاعف عند زيارة نفس المدينة
    const _fetchLang = (l) => _cached(_coordKey('revGeoCity', lat, lng, l), () => fetch(nomUrl(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=${l}&namedetails=1`
    )).then(r => r.json()).catch(() => null), 30 * 86400000);

    const _uiLang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const arReq   = _fetchLang('ar');
    const enReq   = _fetchLang('en');
    // اطلب اللغة الحاليّة أيضًا إن كانت غير ar/en
    const extraReq = (_uiLang !== 'ar' && _uiLang !== 'en') ? _fetchLang(_uiLang) : Promise.resolve(null);

    Promise.all([arReq, enReq, extraReq]).then(([arData, enData, localData]) => {
        if (!arData?.address) return;
        const addr   = arData.address;
        const enAddr = enData?.address || {};
        const locAddr = (localData && localData.address) ? localData.address : {};

        const arCity = addr.city || addr.town || addr.village
            || (addr.state || '').replace(/^منطقة\s+|^محافظة\s+/g, '').trim() || '';
        const rawEn  = enAddr.city || enAddr.town || enAddr.village
            || (enAddr.state || '').replace(/\s*(Region|Governorate|Province)\b/gi, '').trim() || '';
        const enCity = (arData.namedetails?.['name:en']
            || arData.namedetails?.['name:en-US']
            || rawEn || '').replace(/\s*District\b/gi, '').trim();
        const countryCode = (addr.country_code || '').toLowerCase();

        // اسم المدينة بلغة الواجهة الحاليّة (غير ar/en)
        // مصدران: namedetails[`name:${lang}`] (من OSM tags، أدقّ) ← ثمّ address.city من الطلب بلغة المستخدم
        const names = { ar: arCity, en: enCity };
        if (_uiLang !== 'ar' && _uiLang !== 'en') {
            const fromDetails = arData.namedetails?.[`name:${_uiLang}`]
                             || enData?.namedetails?.[`name:${_uiLang}`]
                             || localData?.namedetails?.[`name:${_uiLang}`];
            const fromLocAddr = locAddr.city || locAddr.town || locAddr.village || '';
            const localCity = (fromDetails || fromLocAddr || '').trim();
            if (localCity) names[_uiLang] = localCity;
        }

        if (arCity && enCity) {
            _saveAndShowSuggestion(arCity, lat, lng, enCity, addr.country || '', countryCode, names);
        }
    }).catch(() => {});
}

/** حفظ البيانات في localStorage وعرض الشريط */
function _saveAndShowSuggestion(arCity, lat, lng, enName, country, countryCode, names) {
    try {
        localStorage.setItem('lsb_detected', JSON.stringify({
            arCity, lat, lng, enName, country, countryCode,
            names: names || { ar: arCity, en: enName },
            ts: Date.now()
        }));
    } catch (e) {}
    _renderLocationBar(arCity, lat, lng, enName, names);
}

/** رسم شريط الاقتراح في DOM */
function _renderLocationBar(arCity, lat, lng, enName, names) {
    const bar  = document.getElementById('location-suggestion-bar');
    const city = document.getElementById('lsb-city-name');
    const btn  = document.getElementById('lsb-go-btn');
    if (!bar || !city || !btn) return;

    // اختر اسم المدينة حسب لغة الواجهة:
    //   names[lang] إن وُجد (مُخزَّن من جلب Nominatim بتلك اللغة)، وإلّا fallback ذكي
    const _lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const _fromMap = names && names[_lang];
    city.textContent = _fromMap || (_lang === 'ar' ? arCity : (enName || arCity));
    const slug = makeSlug(enName, lat, lng);
    btn.href = pageUrl(`/prayer-times-in-${slug}`);

    bar.style.display = 'block';
    requestAnimationFrame(() =>
        requestAnimationFrame(() => bar.classList.add('lsb-visible'))
    );
}

/** إخفاء الشريط عند رفض المستخدم */
function dismissLocationSuggestion() {
    const bar = document.getElementById('location-suggestion-bar');
    if (bar) {
        bar.classList.remove('lsb-visible');
        setTimeout(() => { bar.style.display = 'none'; }, 400);
    }
    try { localStorage.setItem('lsb_dismissed_ts', String(Date.now())); } catch (e) {}
}

/**
 * عند تحميل الصفحة الرئيسية: إعادة عرض الاقتراح المحفوظ (صلاحية 7 أيام)
 * إلا إذا رفضه المستخدم في آخر ساعة
 */
/**
 * حقن Schema @graph للصفحة الرئيسية في <head>
 * WebSite + Organization + WebPage + SiteNavigationElement
 */
function injectHomepageSchema() {
    const path = window.location.pathname;
    const onHome = path === '/' || path === '' || /^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\/?$/.test(path);
    if (!onHome || window.location.protocol === 'file:') return;
    if (document.getElementById('homepage-schema')) return; // تجنب التكرار

    const origin      = window.SITE_URL || window.location.origin;
    const _hToday     = HijriDate.getToday();
    const hijriYear   = _hToday.year;
    const _p2         = (n) => String(n).padStart(2, '0');
    const hijriDated  = `/hijri-date/${_hToday.year}-${_p2(_hToday.month)}-${_p2(_hToday.day)}`;
    const siteName    = 'مواقيت الصلاة';
    const siteDesc    = 'منصة إسلامية تعرض مواقيت الصلاة، التاريخ الهجري، تحويل التاريخ، اتجاه القبلة، القمر اليوم، وحاسبة الزكاة.';

    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": `${origin}/#website`,
                "url": `${origin}/`,
                "name": siteName,
                "alternateName": "مواقيت الصلاة والتاريخ الهجري",
                "inLanguage": "ar",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": `${origin}/?q={search_term_string}`
                    },
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "Organization",
                "@id": `${origin}/#organization`,
                "name": siteName,
                "url": `${origin}/`
            },
            {
                "@type": "WebPage",
                "@id": `${origin}/#webpage`,
                "url": `${origin}/`,
                "name": `${siteName} والتاريخ الهجري`,
                "headline": `${siteName} والتاريخ الهجري`,
                "description": siteDesc,
                "inLanguage": "ar",
                "isPartOf": { "@id": `${origin}/#website` },
                "about": [
                    { "@type": "Thing", "name": "مواقيت الصلاة" },
                    { "@type": "Thing", "name": "التاريخ الهجري" },
                    { "@type": "Thing", "name": "تحويل التاريخ" },
                    { "@type": "Thing", "name": "اتجاه القبلة" },
                    { "@type": "Thing", "name": "القمر اليوم" },
                    { "@type": "Thing", "name": "حاسبة الزكاة" }
                ],
                "publisher": { "@id": `${origin}/#organization` }
            },
            { "@type": "SiteNavigationElement", "name": "مواقيت الصلاة",      "url": `${origin}/`                              },
            { "@type": "SiteNavigationElement", "name": "اتجاه القبلة",       "url": `${origin}/qibla`                         },
            { "@type": "SiteNavigationElement", "name": "القمر اليوم",         "url": `${origin}/moon-today`                    },
            { "@type": "SiteNavigationElement", "name": "حاسبة الزكاة",       "url": `${origin}/zakat-calculator`              },
            { "@type": "SiteNavigationElement", "name": "الأدعية والأذكار",   "url": `${origin}/duas`                          },
            { "@type": "SiteNavigationElement", "name": "المسبحة الإلكترونية","url": `${origin}/msbaha`                        },
            { "@type": "SiteNavigationElement", "name": "التاريخ الهجري اليوم","url": `${origin}${hijriDated}`                  },
            { "@type": "SiteNavigationElement", "name": "التقويم الهجري",     "url": `${origin}/hijri-calendar/${hijriYear}`   },
            { "@type": "SiteNavigationElement", "name": "تحويل التاريخ",      "url": `${origin}/dateconverter`                 }
        ]
    };

    const script = document.createElement('script');
    script.id   = 'homepage-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
}

/**
 * يدعم SearchAction من Schema.org — يعبئ حقل البحث بالقيمة من ?q=
 * ويفعّل حدث input لإظهار اقتراحات المدن.
 */
function handleHomeSearchQuery() {
    const path = window.location.pathname;
    const onHome = path === '/' || path === '' || /^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\/?$/.test(path);
    if (!onHome) return;
    const params = new URLSearchParams(window.location.search);
    // دعم ?detect=1 (من الصفحات التي تعيد التوجيه للرئيسية)
    // النيّة هنا صريحة: المستخدم ضغط "استخدم موقعي" — لذا نتنقّل مباشرة إلى صفحة المدينة
    // عبر _locHeroDetectAndNavigate (لا مجرّد تحديث الرئيسية في-المكان).
    if (params.get('detect') === '1') {
        if (typeof _locHeroDetectAndNavigate === 'function') {
            setTimeout(() => _locHeroDetectAndNavigate(), 300);
        } else if (typeof detectLocation === 'function') {
            setTimeout(() => detectLocation(), 300);
        }
        return;
    }
    // دعم ?q= و ?search= (من الصفحات التي تعيد التوجيه للرئيسية)
    const q = params.get('q') || params.get('search');
    if (!q) return;
    const input = document.getElementById('city-search-input');
    if (!input) return;
    input.value = q;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
}

// ============================================================
// ===== مركز SEO: meta + canonical + hreflang + OG + Schema =====
// ============================================================

function _seoUpsertMeta(key, keyType, content) {
    const sel = `meta[${keyType}="${key}"]`;
    let el = document.head.querySelector(sel);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(keyType, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function _seoUpsertLink(rel, href, hreflang) {
    const sel = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]:not([hreflang])`;
    let el = document.head.querySelector(sel);
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        if (hreflang) el.setAttribute('hreflang', hreflang);
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

function _seoUpsertSchema(id, graphObj) {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.type = 'application/ld+json';
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(graphObj);
}

function _seoRemoveSchema(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// يُعطي الروابط المقابلة لكل لغة (للـ hreflang) + canonical
// يدعم 10 لغات: ar (افتراضي بدون prefix)، en، fr، tr، ur، de، id، es، bn، ms
function _seoGetBilingualUrls() {
    const origin = window.SITE_URL || window.location.origin;
    let path = window.location.pathname.replace(/\.html$/, '');
    if (path === '') path = '/';
    const LANGS = ['en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
    let lang = 'ar';
    let corePath = path;
    for (const l of LANGS) {
        const m = path.match(new RegExp('^\\/' + l + '(\\/.*)?$'));
        if (m) { lang = l; corePath = m[1] || '/'; break; }
    }
    const langUrl = (l) => {
        const prefix = (l === 'ar') ? '' : ('/' + l);
        return origin + prefix + (corePath === '/' ? '/' : corePath);
    };
    return {
        lang,
        ar: langUrl('ar'),
        en: langUrl('en'),
        fr: langUrl('fr'),
        tr: langUrl('tr'),
        ur: langUrl('ur'),
        de: langUrl('de'),
        id: langUrl('id'),
        es: langUrl('es'),
        bn: langUrl('bn'),
        ms: langUrl('ms'),
        canonical: origin + path,
        isEn: (lang === 'en') // للتوافق الخلفي
    };
}

/**
 * ضبط meta/canonical/hreflang/OG/Twitter دفعة واحدة.
 * تُستدعى من updatePageSEO وأيضاً من loaders ديناميكية (hijri/city).
 */
function setSEOMeta({ title, description, ogType = 'website', schemaId, schemaGraph }) {
    if (window.location.protocol === 'file:') return; // لا SEO على ملف محلي
    const urls = _seoGetBilingualUrls();
    const lang = urls.lang;
    const origin = window.SITE_URL || window.location.origin;
    const SITE_NAMES = {
        ar: 'مواقيت الصلاة', en: 'Prayer Times', fr: 'Heures de Prière',
        tr: 'Namaz Vakitleri', ur: 'اوقاتِ نماز', de: 'Gebetszeiten',
        id: 'Jadwal Sholat', es: 'Horarios de Oración', bn: 'নামাজের সময়সূচী', ms: 'Waktu Solat'
    };
    const OG_LOCALES = {
        ar: 'ar_SA', en: 'en_US', fr: 'fr_FR', tr: 'tr_TR', ur: 'ur_PK', de: 'de_DE', id: 'id_ID',
        es: 'es_ES', bn: 'bn_BD', ms: 'ms_MY'
    };
    const siteName = SITE_NAMES[lang] || SITE_NAMES.ar;

    if (title) document.title = title;

    if (description) {
        _seoUpsertMeta('description', 'name', description);
    }

    // Robots: افتراضياً index, follow (يمكن رفضه لاحقاً لصفحات معيّنة)
    _seoUpsertMeta('robots', 'name', 'index, follow');

    // Canonical + hreflang (6 لغات + x-default)
    _seoUpsertLink('canonical', urls.canonical);
    _seoUpsertLink('alternate', urls.ar, 'ar');
    _seoUpsertLink('alternate', urls.en, 'en');
    _seoUpsertLink('alternate', urls.fr, 'fr');
    _seoUpsertLink('alternate', urls.tr, 'tr');
    _seoUpsertLink('alternate', urls.ur, 'ur');
    _seoUpsertLink('alternate', urls.de, 'de');
    _seoUpsertLink('alternate', urls.id, 'id');
    _seoUpsertLink('alternate', urls.es, 'es');
    _seoUpsertLink('alternate', urls.bn, 'bn');
    _seoUpsertLink('alternate', urls.ms, 'ms');
    _seoUpsertLink('alternate', urls.ar, 'x-default');

    // OpenGraph
    if (title) _seoUpsertMeta('og:title', 'property', title);
    if (description) _seoUpsertMeta('og:description', 'property', description);
    _seoUpsertMeta('og:url', 'property', urls.canonical);
    _seoUpsertMeta('og:type', 'property', ogType);
    _seoUpsertMeta('og:site_name', 'property', siteName);
    _seoUpsertMeta('og:locale', 'property', OG_LOCALES[lang] || OG_LOCALES.ar);
    // alternate locales: كل اللغات عدا الحالية
    const altLocales = Object.entries(OG_LOCALES).filter(([l]) => l !== lang).map(([, loc]) => loc);
    // إزالة ما قد يكون موجوداً سابقاً (fallback: عنصر واحد)
    document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.remove());
    altLocales.forEach(loc => {
        const el = document.createElement('meta');
        el.setAttribute('property', 'og:locale:alternate');
        el.setAttribute('content', loc);
        document.head.appendChild(el);
    });
    _seoUpsertMeta('og:image', 'property', `${origin}/favicon.ico`);

    // Twitter
    _seoUpsertMeta('twitter:card', 'name', 'summary');
    if (title) _seoUpsertMeta('twitter:title', 'name', title);
    if (description) _seoUpsertMeta('twitter:description', 'name', description);

    // Optional Schema
    if (schemaId && schemaGraph) {
        _seoUpsertSchema(schemaId, schemaGraph);
    }
}

/**
 * Dispatcher: يتعرّف على نوع الصفحة من URL ويستدعي setSEOMeta بالمعطيات المناسبة.
 * للصفحات الديناميكية (city/hijri-day/year/month) تُعرَّف الـ meta داخل الـ loader نفسه.
 */
function updatePageSEO() {
    if (window.location.protocol === 'file:') return;
    const path = window.location.pathname.replace(/\.html$/, '');
    const urls = _seoGetBilingualUrls();
    const lang = urls.lang;
    const isEn = urls.isEn;

    // ── الصفحة الرئيسية (6 لغات: ar, en, fr, tr, ur, de) ──
    const HOME_PATHS = {
        '/': 'ar',
        '/en/': 'en', '/en': 'en',
        '/fr/': 'fr', '/fr': 'fr',
        '/tr/': 'tr', '/tr': 'tr',
        '/ur/': 'ur', '/ur': 'ur',
        '/de/': 'de', '/de': 'de',
    };
    const homeLang = HOME_PATHS[path];
    if (homeLang) {
        // Round 7e: محاذاة نصوص SSR (buildSeoForPath في server.js) — keywords ديناميكية
        // تشمل: اليوم، مكة المكرمة، الشهر الهجري الحالي، الشهر الميلادي، أسماء الصلوات الـ5.
        const _hToday  = (typeof HijriDate !== 'undefined' && HijriDate.getToday) ? HijriDate.getToday() : null;
        const _hMAr    = _hToday ? HijriDate.hijriMonths[_hToday.month - 1] : '';
        const _hMEn    = _hToday ? HIJRI_MONTHS_EN[_hToday.month - 1]       : '';
        const _hY      = _hToday ? _hToday.year : '';
        const _gNow    = new Date();
        const _gMIdx   = _gNow.getMonth();
        const _gY      = _gNow.getFullYear();
        const _gMAr    = G_MONTHS_AR[_gMIdx];
        const _gMEn    = G_MONTHS_EN[_gMIdx];
        const _gMFr    = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'][_gMIdx];
        const _gMTr    = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'][_gMIdx];
        const _gMUr    = ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'][_gMIdx];
        const _gMDe    = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'][_gMIdx];
        const _gMId    = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][_gMIdx];
        const _gMEs    = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][_gMIdx];
        const _gMBn    = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'][_gMIdx];
        const _gMMs    = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'][_gMIdx];

        const HOME_TITLES = {
            ar: `مواقيت الصلاة في مكة المكرمة اليوم | ${_hMAr} ${_hY} هـ`,
            en: `Today's Prayer Times in Mecca & Medina | ${_hMEn} ${_hY}`,
            fr: `Heures de prière à La Mecque & Médine | ${_hMEn} ${_hY}`,
            tr: `Namaz Vakitleri: Mekke, Medine, Dünya | ${_hMEn} ${_hY}`,
            ur: `اوقاتِ نماز: مکہ، مدینہ اور دنیا | ${_hMEn} ${_hY}`,
            de: `Gebetszeiten — Mekka, Medina & Welt | ${_hMEn} ${_hY}`,
            id: `Jadwal Sholat: Makkah, Madinah & Dunia | ${_hMEn} ${_hY}`,
            es: `Horarios de Oración — La Meca, Medina | ${_hMEn} ${_hY}`,
            bn: `নামাজের সময়সূচী: মক্কা, মদিনা ও বিশ্ব | ${_hMEn} ${_hY}`,
            ms: `Waktu Solat: Makkah, Madinah & Dunia | ${_hMEn} ${_hY}`,
        };
        // Round 7h: إضافة الشهر الميلاديّ المحلَّى — phrase "أبريل 2026" في seoptimer
        const HOME_DESCS = {
            ar: `مواقيت الصلاة في مكة المكرمة والمدينة اليوم ${_gMAr} ${_gY}: الفجر، الظهر، العصر، المغرب، العشاء. التاريخ الهجري ${_hMAr} ${_hY} هـ، القبلة والزكاة.`,
            en: `Prayer times today in Mecca, Medina ${_gMEn} ${_gY}: Fajr, Dhuhr, Asr, Maghrib, Isha. Hijri ${_hMEn} ${_hY} AH, Qibla, Zakat.`,
            fr: `Heures de prière aujourd'hui à La Mecque, Médine ${_gMFr} ${_gY} : Fajr, Dhuhr, Asr, Maghrib, Isha. Hégire ${_hMEn} ${_hY}, Qibla, Zakat.`,
            tr: `Bugün Mekke, Medine namaz vakitleri ${_gMTr} ${_gY}: Fecir, Öğle, İkindi, Akşam, Yatsı. Hicri ${_hMEn} ${_hY}, kıble, zekât.`,
            ur: `آج مکہ مکرمہ، مدینہ اور دنیا میں اوقاتِ نماز ${_gMUr} ${_gY}: فجر، ظہر، عصر، مغرب، عشاء۔ ہجری کیلنڈر ${_hMEn} ${_hY}، قبلہ، زکاۃ، دعائیں۔`,
            de: `Heutige Gebetszeiten in Mekka, Medina ${_gMDe} ${_gY}: Fajr, Dhuhr, Asr, Maghrib, Isha. Hidschri ${_hMEn} ${_hY}, Qibla, Zakat.`,
            id: `Jadwal sholat hari ini di Makkah, Madinah ${_gMId} ${_gY}: Subuh, Zuhur, Asar, Magrib, Isya. Hijriah ${_hMEn} ${_hY}, kiblat, zakat.`,
            es: `Horarios de oración hoy en La Meca, Medina ${_gMEs} ${_gY}: Fayr, Dhuhr, Asr, Magrib, Isha. Hijri ${_hMEn} ${_hY}, Qibla, Zakat.`,
            bn: `আজকের নামাজের সময় মক্কা, মদিনা ও বিশ্বের শহরগুলিতে ${_gMBn} ${_gY}: ফজর, জোহর, আসর, মাগরিব, এশা। হিজরি ক্যালেন্ডার ${_hMEn} ${_hY}, কিবলা, যাকাত, দোয়া।`,
            ms: `Waktu solat hari ini di Makkah, Madinah ${_gMMs} ${_gY}: Subuh, Zohor, Asar, Maghrib, Isyak. Hijrah ${_hMEn} ${_hY}, Kiblat, Zakat.`,
        };
        setSEOMeta({
            title: HOME_TITLES[homeLang] || HOME_TITLES.ar,
            description: HOME_DESCS[homeLang] || HOME_DESCS.ar,
            ogType: 'website'
        });
        return;
    }

    // ── أداة القبلة العامة ──
    if (/^\/(?:en\/)?qibla$/.test(path)) {
        setSEOMeta({
            title: isEn ? 'Qibla Direction Finder — Online Compass to Mecca' : 'اتجاه القبلة — بوصلة الكعبة المشرفة في مكة',
            description: isEn
                ? 'Find the accurate Qibla direction from your location using GPS. Interactive compass and map to locate the Kaaba in Mecca.'
                : 'تحديد اتجاه القبلة الدقيق من موقعك عبر GPS. بوصلة وخريطة تفاعلية لمعرفة اتجاه الكعبة المشرفة في مكة.',
            ogType: 'website',
            schemaId: 'page-seo-schema',
            schemaGraph: {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "@id": urls.canonical + '#app',
                "url": urls.canonical,
                "name": isEn ? 'Qibla Direction Finder' : 'اتجاه القبلة',
                "applicationCategory": "UtilityApplication",
                "operatingSystem": "Any",
                "inLanguage": lang,
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            }
        });
        return;
    }

    // ── القمر ──
    if (/^\/(?:en\/)?moon$/.test(path)) {
        setSEOMeta({
            title: isEn ? 'Moon Today — Phase, Age & Illumination' : 'القمر اليوم — الطور، العمر والإضاءة',
            description: isEn
                ? "Track tonight's moon phase, age, illumination percentage, and upcoming moon events based on your location."
                : 'معلومات القمر اليوم: طور القمر، عمره، نسبة إضاءته، والأحداث القادمة حسب موقعك.',
            ogType: 'website'
        });
        return;
    }

    // ── الزكاة ──
    if (/^\/(?:en\/)?zakat$/.test(path)) {
        setSEOMeta({
            title: isEn ? 'Zakat Calculator — Free Islamic Tool' : 'حاسبة الزكاة — أداة إسلامية مجانية',
            description: isEn
                ? 'Calculate your Zakat accurately with our free Islamic tool. Covers cash, gold, silver, stocks & investments.'
                : 'احسب زكاتك بدقة عبر حاسبة الزكاة المجانية: النقد، الذهب، الفضة، الأسهم والاستثمارات.',
            ogType: 'website',
            schemaId: 'page-seo-schema',
            schemaGraph: {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "@id": urls.canonical + '#app',
                "url": urls.canonical,
                "name": isEn ? 'Zakat Calculator' : 'حاسبة الزكاة',
                "applicationCategory": "FinanceApplication",
                "operatingSystem": "Any",
                "inLanguage": lang,
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            }
        });
        return;
    }

    // ── الأدعية والأذكار ──
    if (/^\/(?:en\/)?duas$/.test(path)) {
        setSEOMeta({
            title: isEn ? 'Duas & Athkar — Islamic Supplications' : 'الأدعية والأذكار الصحيحة',
            description: isEn
                ? 'Collection of authentic Islamic duas and athkar: morning & evening remembrance, after-prayer duas, Quranic supplications.'
                : 'مجموعة الأدعية والأذكار المأثورة: أذكار الصباح والمساء، أدعية بعد الصلاة، أدعية مستجابة وأدعية قرآنية.',
            ogType: 'article'
        });
        return;
    }

    // ── المسبحة الإلكترونية ──
    if (/^\/(?:en\/)?msbaha$/.test(path)) {
        setSEOMeta({
            title: isEn ? 'Digital Tasbih Counter (Masbaha)' : 'المسبحة الإلكترونية',
            description: isEn
                ? 'Free digital tasbih counter for dhikr and athkar — count subhanallah, alhamdulillah, allahu akbar and custom dhikr.'
                : 'مسبحة إلكترونية مجانية لعدّ الأذكار: سبحان الله، الحمد لله، الله أكبر، واستغفر الله مع حفظ العداد.',
            ogType: 'website',
            schemaId: 'page-seo-schema',
            schemaGraph: {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "@id": urls.canonical + '#app',
                "url": urls.canonical,
                "name": isEn ? 'Digital Tasbih Counter' : 'المسبحة الإلكترونية',
                "applicationCategory": "UtilityApplication",
                "operatingSystem": "Any",
                "inLanguage": lang,
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            }
        });
        return;
    }

    // ── محول التاريخ ──
    if (/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?dateconverter$/.test(path)) {
        setSEOMeta({
            title: isEn ? 'Hijri ↔ Gregorian Date Converter' : 'محول التاريخ الهجري ↔ الميلادي',
            description: isEn
                ? 'Convert Hijri to Gregorian or Gregorian to Hijri dates accurately. Free Islamic date converter for any year.'
                : 'تحويل التاريخ بين الهجري والميلادي بدقة عالية لأي سنة. أداة مجانية لتحويل التواريخ الإسلامية.',
            ogType: 'website',
            schemaId: 'page-seo-schema',
            schemaGraph: {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "@id": urls.canonical + '#app',
                "url": urls.canonical,
                "name": isEn ? 'Hijri/Gregorian Date Converter' : 'محول التاريخ الهجري والميلادي',
                "applicationCategory": "UtilityApplication",
                "operatingSystem": "Any",
                "inLanguage": lang,
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            }
        });
        return;
    }

    // ── التاريخ الهجري اليوم ──
    if (/^\/(?:en\/)?today-hijri-date$/.test(path)) {
        let hijriStr;
        try {
            const t = HijriDate.getToday();
            const monthsAr = ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
            const monthsEn = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Akhira','Rajab','Shaban','Ramadan','Shawwal','Dhu al-Qidah','Dhu al-Hijjah'];
            hijriStr = isEn
                ? `${t.day} ${monthsEn[t.month - 1]} ${t.year} AH`
                : `${t.day} ${monthsAr[t.month - 1]} ${t.year} هـ`;
        } catch(e) { hijriStr = ''; }
        setSEOMeta({
            title: isEn ? `Today's Hijri Date${hijriStr ? ' — ' + hijriStr : ''}` : `التاريخ الهجري اليوم${hijriStr ? ' — ' + hijriStr : ''}`,
            description: isEn
                ? `Today's Hijri (Islamic) date: ${hijriStr}. Find the accurate Islamic date and its Gregorian equivalent.`
                : `التاريخ الهجري اليوم: ${hijriStr}. عرض التاريخ الإسلامي ومقابله الميلادي بدقة.`,
            ogType: 'article',
            schemaId: 'page-seo-schema',
            schemaGraph: {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "@id": urls.canonical + '#webpage',
                "url": urls.canonical,
                "name": isEn ? "Today's Hijri Date" : 'التاريخ الهجري اليوم',
                "description": hijriStr,
                "inLanguage": lang
            }
        });
        return;
    }
    // الصفحات التالية تتولّى الـ meta بنفسها داخل الـ loaders:
    // - city pages (prayer-times-in-*, qibla-in-*, about-*) → updateCitySEO()
    // - hijri-date/{day-month-year} → loadHijriDayPage()
    // - hijri-calendar/{year} → loadHijriYearPage()
    // - hijri-calendar/{month-year} → loadHijriMonthPage()
    // - prayer-times-cities-{country} → prayer-times-cities.html يتولاها بنفسه
}

/**
 * تُستدعى من loadCityData() بعد توفّر بيانات المدينة.
 * تغطي 3 أنماط: prayer-times-in-*, qibla-in-*, about-*.
 */
function updateCitySEO(city, englishName, country, lat, lng) {
    if (window.location.protocol === 'file:') return;
    const path = window.location.pathname.replace(/\.html$/, '');
    const urls = _seoGetBilingualUrls();
    const lang = urls.lang || 'ar';

    // اختيار اسم المدينة والدولة بحسب اللغة
    // 🆕 Round 6 (City Audit Fix #2): استخدام الـ helpers لضمان عدم تسرُّب العربيّ إلى title غير-عربيّ.
    //   السابق: EN branch كان يستخدم `country || ''` مباشرة ⇒ يُسرّب الاسم العربيّ إلى <title>.
    //   الحالي: نمرّ عبر getDisplayCity/getDisplayCountry — يضمن فلترة الخطّ + fallback لقاموس EN.
    let cityDisplay, countryDisplay;
    if (lang === 'ar') {
        cityDisplay = city;
        countryDisplay = country || '';
    } else {
        // استخدِم الـ helpers (تعالج جميع اللغات الـ9 غير-AR + تمنع تسرُّب الأسماء العربية)
        cityDisplay = (typeof getDisplayCity === 'function')
            ? getDisplayCity()
            : (englishName || city);
        countryDisplay = (typeof getDisplayCountry === 'function')
            ? getDisplayCountry()
            : (country || '');
        // Hard-guard: لا نسمح بحروف عربية أو بنغالية في title لغة لاتينية/تركية/ألمانية...
        if (typeof _isDisplayScriptAcceptable === 'function') {
            if (!_isDisplayScriptAcceptable(cityDisplay, lang)) cityDisplay = englishName || city;
            if (!_isDisplayScriptAcceptable(countryDisplay, lang)) countryDisplay = '';
        }
    }

    // فاصل: ar/ur يستخدمان الفاصلة العربية، الباقي الفاصلة اللاتينية
    const sep = (lang === 'ar' || lang === 'ur') ? '، ' : ', ';
    const countrySuffix = countryDisplay ? (sep + countryDisplay) : '';

    // مساعد: يختار title كامل أو مُختصر ليبقى ≤ 60 حرفاً
    const pickTitle = (full, short) => (full.length > 60 ? short : full);

    // prayer-times-in-*
    if (/\/prayer-times-in-/.test(path)) {
        const titles = ({
            ar: [`مواقيت الصلاة في ${cityDisplay}${countrySuffix}`, `مواقيت الصلاة في ${cityDisplay}`],
            en: [`Prayer Times in ${cityDisplay}${countrySuffix}`, `Prayer Times in ${cityDisplay}`],
            fr: [`Heures de prière à ${cityDisplay}${countrySuffix}`, `Heures de prière à ${cityDisplay}`],
            tr: [`${cityDisplay}${countrySuffix} Namaz Vakitleri`, `${cityDisplay} Namaz Vakitleri`],
            ur: [`${cityDisplay}${countrySuffix} میں اوقاتِ نماز`, `${cityDisplay} میں اوقاتِ نماز`],
            de: [`Gebetszeiten in ${cityDisplay}${countrySuffix}`, `Gebetszeiten in ${cityDisplay}`],
            id: [`Jadwal Sholat di ${cityDisplay}${countrySuffix}`, `Jadwal Sholat di ${cityDisplay}`],
            es: [`Horarios de Oración en ${cityDisplay}${countrySuffix}`, `Horarios de Oración en ${cityDisplay}`],
            bn: [`${cityDisplay}${countrySuffix}-এ নামাজের সময়`, `${cityDisplay}-এ নামাজের সময়`],
            ms: [`Waktu Solat di ${cityDisplay}${countrySuffix}`, `Waktu Solat di ${cityDisplay}`],
        })[lang];
        const desc = ({
            ar: `مواقيت الصلاة الدقيقة في ${cityDisplay}${countrySuffix}: الفجر، الظهر، العصر، المغرب، العشاء، اتجاه القبلة، التاريخ الهجري والجدول الأسبوعي.`,
            en: `Accurate Islamic prayer times for ${cityDisplay}${countrySuffix}: Fajr, Dhuhr, Asr, Maghrib, Isha, Qibla direction, today's Hijri date and weekly schedule.`,
            fr: `Heures de prière islamique précises pour ${cityDisplay}${countrySuffix} : Fajr, Dhuhr, Asr, Maghrib, Isha, direction de la Qibla, date hégirienne et programme hebdomadaire.`,
            tr: `${cityDisplay}${countrySuffix} için doğru İslami namaz vakitleri: Fecir, Öğle, İkindi, Akşam, Yatsı, Kıble yönü, bugünün Hicri tarihi ve haftalık program.`,
            ur: `${cityDisplay}${countrySuffix} کے لیے درست اسلامی اوقاتِ نماز: فجر، ظہر، عصر، مغرب، عشاء، قبلہ کی سمت، آج کی ہجری تاریخ اور ہفتہ وار شیڈول۔`,
            de: `Genaue islamische Gebetszeiten für ${cityDisplay}${countrySuffix}: Fajr, Dhuhr, Asr, Maghrib, Isha, Qibla-Richtung, heutiges Hidschri-Datum und Wochenplan.`,
            id: `Jadwal sholat Islam yang akurat untuk ${cityDisplay}${countrySuffix}: Subuh, Zuhur, Asar, Magrib, Isya, arah Kiblat, tanggal Hijriyah hari ini dan jadwal mingguan.`,
            es: `Horarios de oración islámica precisos para ${cityDisplay}${countrySuffix}: Fayr, Dhuhr, Asr, Magrib, Isha, dirección de la Qibla, fecha Hijri de hoy y horario semanal.`,
            bn: `${cityDisplay}${countrySuffix}-এর জন্য সঠিক ইসলামিক নামাজের সময়: ফজর, জোহর, আসর, মাগরিব, এশা, কিবলার দিক, আজকের হিজরি তারিখ ও সাপ্তাহিক সময়সূচী।`,
            ms: `Waktu solat Islam tepat untuk ${cityDisplay}${countrySuffix}: Subuh, Zohor, Asar, Maghrib, Isyak, arah Kiblat, tarikh Hijrah hari ini dan jadual mingguan.`,
        })[lang];
        setSEOMeta({
            title: pickTitle(titles[0], titles[1]),
            description: desc,
            ogType: 'article'
        });
        return;
    }

    // qibla-in-*
    if (/\/qibla-in-/.test(path)) {
        const titles = ({
            ar: [`اتجاه القبلة في ${cityDisplay}${countrySuffix}`, `اتجاه القبلة في ${cityDisplay}`],
            en: [`Qibla Direction in ${cityDisplay}${countrySuffix}`, `Qibla Direction in ${cityDisplay}`],
            fr: [`Direction de la Qibla à ${cityDisplay}${countrySuffix}`, `Direction de la Qibla à ${cityDisplay}`],
            tr: [`${cityDisplay}${countrySuffix} Kıble Yönü`, `${cityDisplay} Kıble Yönü`],
            ur: [`${cityDisplay}${countrySuffix} میں قبلہ کی سمت`, `${cityDisplay} میں قبلہ کی سمت`],
            de: [`Qibla-Richtung in ${cityDisplay}${countrySuffix}`, `Qibla-Richtung in ${cityDisplay}`],
            id: [`Arah Kiblat di ${cityDisplay}${countrySuffix}`, `Arah Kiblat di ${cityDisplay}`],
            es: [`Dirección de la Qibla en ${cityDisplay}${countrySuffix}`, `Dirección de la Qibla en ${cityDisplay}`],
            bn: [`${cityDisplay}${countrySuffix}-এ কিবলার দিক`, `${cityDisplay}-এ কিবলার দিক`],
            ms: [`Arah Kiblat di ${cityDisplay}${countrySuffix}`, `Arah Kiblat di ${cityDisplay}`],
        })[lang];
        const desc = ({
            ar: `اتجاه القبلة الدقيق من ${cityDisplay}${countrySuffix} إلى الكعبة المشرفة في مكة، مع درجة الانحراف وبوصلة وخريطة تفاعلية.`,
            en: `Accurate Qibla direction from ${cityDisplay}${countrySuffix} to the Kaaba in Mecca, with exact bearing, compass and map view.`,
            fr: `Direction précise de la Qibla depuis ${cityDisplay}${countrySuffix} vers la Kaaba à La Mecque, avec angle exact, boussole et vue sur carte.`,
            tr: `${cityDisplay}${countrySuffix} konumundan Mekke'deki Kâbe'ye doğru kesin Kıble yönü, tam açı, pusula ve harita görünümü.`,
            ur: `${cityDisplay}${countrySuffix} سے مکہ میں کعبہ شریف کی درست قبلہ سمت، درست زاویہ، کمپاس اور نقشہ ویو کے ساتھ۔`,
            de: `Genaue Qibla-Richtung von ${cityDisplay}${countrySuffix} zur Kaaba in Mekka, mit exaktem Winkel, Kompass und Kartenansicht.`,
            id: `Arah Kiblat yang akurat dari ${cityDisplay}${countrySuffix} ke Ka'bah di Mekkah, dengan sudut tepat, kompas, dan tampilan peta.`,
            es: `Dirección precisa de la Qibla desde ${cityDisplay}${countrySuffix} hacia la Kaaba en La Meca, con ángulo exacto, brújula y vista de mapa.`,
            bn: `${cityDisplay}${countrySuffix} থেকে মক্কার কাবার দিকে সঠিক কিবলার দিক, সুনির্দিষ্ট কোণ, কম্পাস এবং মানচিত্র দৃশ্যসহ।`,
            ms: `Arah Kiblat tepat dari ${cityDisplay}${countrySuffix} ke Kaabah di Makkah, dengan sudut tepat, kompas dan pandangan peta.`,
        })[lang];
        const wpName = ({
            ar: `اتجاه القبلة في ${cityDisplay}`,
            en: `Qibla Direction in ${cityDisplay}`,
            fr: `Direction de la Qibla à ${cityDisplay}`,
            tr: `${cityDisplay} Kıble Yönü`,
            ur: `${cityDisplay} میں قبلہ کی سمت`,
            de: `Qibla-Richtung in ${cityDisplay}`,
            id: `Arah Kiblat di ${cityDisplay}`,
            es: `Dirección de la Qibla en ${cityDisplay}`,
            bn: `${cityDisplay}-এ কিবলার দিক`,
            ms: `Arah Kiblat di ${cityDisplay}`,
        })[lang];
        setSEOMeta({
            title: pickTitle(titles[0], titles[1]),
            description: desc,
            ogType: 'article',
            schemaId: 'page-seo-schema',
            schemaGraph: {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "@id": urls.canonical + '#webpage',
                "url": urls.canonical,
                "name": wpName,
                "inLanguage": lang,
                "about": {
                    "@type": "Place",
                    "name": cityDisplay,
                    "geo": (typeof lat === 'number' && typeof lng === 'number') ? {
                        "@type": "GeoCoordinates",
                        "latitude": lat,
                        "longitude": lng
                    } : undefined
                }
            }
        });
        return;
    }

    // about-*
    if (/\/about-/.test(path)) {
        const titles = ({
            ar: [`عن ${cityDisplay}${countrySuffix}`, `عن ${cityDisplay}`],
            en: [`About ${cityDisplay}${countrySuffix}`, `About ${cityDisplay}`],
            fr: [`À propos de ${cityDisplay}${countrySuffix}`, `À propos de ${cityDisplay}`],
            tr: [`${cityDisplay}${countrySuffix} Hakkında`, `${cityDisplay} Hakkında`],
            ur: [`${cityDisplay}${countrySuffix} کے بارے میں`, `${cityDisplay} کے بارے میں`],
            de: [`Über ${cityDisplay}${countrySuffix}`, `Über ${cityDisplay}`],
            id: [`Tentang ${cityDisplay}${countrySuffix}`, `Tentang ${cityDisplay}`],
            es: [`Sobre ${cityDisplay}${countrySuffix}`, `Sobre ${cityDisplay}`],
            bn: [`${cityDisplay}${countrySuffix} সম্পর্কে`, `${cityDisplay} সম্পর্কে`],
            ms: [`Tentang ${cityDisplay}${countrySuffix}`, `Tentang ${cityDisplay}`],
        })[lang];
        const desc = ({
            ar: `معلومات عن ${cityDisplay}${countrySuffix}: الموقع الجغرافي، المنطقة الزمنية، مواقيت الصلاة، اتجاه القبلة وحقائق مهمة.`,
            en: `Information about ${cityDisplay}${countrySuffix}: geographic location, timezone, Islamic prayer times, Qibla direction and key facts.`,
            fr: `Informations sur ${cityDisplay}${countrySuffix} : emplacement géographique, fuseau horaire, heures de prière islamique, direction de la Qibla et faits clés.`,
            tr: `${cityDisplay}${countrySuffix} hakkında bilgiler: coğrafi konum, saat dilimi, İslami namaz vakitleri, Kıble yönü ve önemli bilgiler.`,
            ur: `${cityDisplay}${countrySuffix} کے بارے میں معلومات: جغرافیائی محلِ وقوع، ٹائم زون، اسلامی اوقاتِ نماز، قبلہ کی سمت اور اہم حقائق۔`,
            de: `Informationen über ${cityDisplay}${countrySuffix}: geografische Lage, Zeitzone, islamische Gebetszeiten, Qibla-Richtung und wichtige Fakten.`,
            id: `Informasi tentang ${cityDisplay}${countrySuffix}: lokasi geografis, zona waktu, jadwal sholat Islam, arah Kiblat, dan fakta penting.`,
            es: `Información sobre ${cityDisplay}${countrySuffix}: ubicación geográfica, zona horaria, horarios de oración islámica, dirección de la Qibla y datos clave.`,
            bn: `${cityDisplay}${countrySuffix} সম্পর্কে তথ্য: ভৌগলিক অবস্থান, সময় অঞ্চল, ইসলামিক নামাজের সময়, কিবলার দিক এবং মূল তথ্য।`,
            ms: `Maklumat tentang ${cityDisplay}${countrySuffix}: lokasi geografi, zon waktu, waktu solat Islam, arah Kiblat dan fakta utama.`,
        })[lang];
        setSEOMeta({
            title: pickTitle(titles[0], titles[1]),
            description: desc,
            ogType: 'article'
        });
        return;
    }
}

function checkSavedLocationSuggestion() {
    const path = window.location.pathname;
    const onHome = path === '/' || path === '' || /^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\/?$/.test(path);
    if (!onHome || window.location.protocol === 'file:') return;

    try {
        const raw = localStorage.getItem('lsb_detected');
        if (!raw) return;
        const d = JSON.parse(raw);
        if (Date.now() - d.ts > 7 * 24 * 3600 * 1000) return; // انتهت الصلاحية

        const dismissedTs = parseInt(localStorage.getItem('lsb_dismissed_ts') || '0');
        if (Date.now() - dismissedTs < 3600 * 1000) return; // رفض مؤخراً

        _renderLocationBar(d.arCity, d.lat, d.lng, d.enName, d.names);
    } catch (e) {}
}

// ─────────────────────────────────────────────────────────────
//   نوع الصفحة — Modal الإعدادات — روابط ذات صلة
// ─────────────────────────────────────────────────────────────

/**
 * تحديد نوع الصفحة وإضافة class مناسب للـ body
 * city-prayer-page  →  /prayer-times-in-{city}
 * home-page         →  / أو /en/
 */
function applyPageType() {
    const path = window.location.pathname;
    if (/\/(?:en\/)?prayer-times-in-/.test(path)) {
        document.body.classList.add('city-prayer-page');
    } else {
        document.body.classList.remove('city-prayer-page');
        // إزالة Breadcrumb Schema عند مغادرة صفحة المدينة
        const _oldBc = document.getElementById('breadcrumb-schema');
        if (_oldBc) _oldBc.remove();
    }
}

/** لقطة للإعدادات قبل فتح Modal — تُستخدم من قبل "إلغاء" لاستعادة القيم */
let _settingsSnapshot = null;
function _takeSettingsSnapshot() {
    const calc = document.getElementById('calc-method');
    const asr  = document.getElementById('asr-method');
    const fmt  = document.getElementById('time-format');
    const hl   = document.getElementById('high-lats');
    const ad   = document.getElementById('adhan-toggle');
    _settingsSnapshot = {
        calc: calc ? calc.value : null,
        asr:  asr  ? asr.value  : null,
        fmt:  fmt  ? fmt.value  : null,
        hl:   hl   ? hl.value   : null,
        adhan: ad  ? !!ad.checked : null,
    };
}
function _restoreSettingsSnapshot() {
    if (!_settingsSnapshot) return;
    const s = _settingsSnapshot;
    const calc = document.getElementById('calc-method');
    const asr  = document.getElementById('asr-method');
    const fmt  = document.getElementById('time-format');
    const hl   = document.getElementById('high-lats');
    const ad   = document.getElementById('adhan-toggle');
    if (calc && s.calc !== null) calc.value = s.calc;
    if (asr  && s.asr  !== null) asr.value  = s.asr;
    if (fmt  && s.fmt  !== null) fmt.value  = s.fmt;
    if (hl   && s.hl   !== null) hl.value   = s.hl;
    if (ad   && s.adhan !== null && ad.checked !== s.adhan) {
        ad.checked = s.adhan;
        // إعادة مزامنة حالة localStorage لضمان التطابق مع اللقطة
        try { localStorage.setItem('adhan_enabled', s.adhan ? 'true' : 'false'); } catch (e) {}
    }
}

/** فتح Modal إعدادات المواقيت */
function openSettingsModal() {
    const overlay = document.getElementById('settings-modal-overlay');
    if (overlay) {
        _takeSettingsSnapshot();
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

/** إغلاق Modal إعدادات المواقيت */
function closeSettingsModal() {
    const overlay = document.getElementById('settings-modal-overlay');
    if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

/** تطبيق الإعدادات — الحفظ الفوري يجري عبر onchange، فيكفي الإغلاق */
function applySettings() {
    try { if (typeof updatePrayerTimes === 'function') updatePrayerTimes(); } catch (e) {}
    closeSettingsModal();
}

/** إلغاء: استعادة القيم قبل الفتح وإعادة الاحتساب */
function cancelSettings() {
    _restoreSettingsSnapshot();
    try { if (typeof updatePrayerTimes === 'function') updatePrayerTimes(); } catch (e) {}
    closeSettingsModal();
}

/** إغلاق عند الضغط خارج الـ box — يعامَل كإلغاء (استعادة القيم) */
function onSettingsOverlayClick(event) {
    if (event.target === document.getElementById('settings-modal-overlay')) {
        cancelSettings();
    }
}

/**
 * تعبئة قسم "روابط ذات صلة" في صفحات المدن
 * يُستدعى من updatePrayerTimes() عند تحميل بيانات المدينة
 */
function updateCityRelatedServices() {
    if (!document.body.classList.contains('city-prayer-page')) return;

    const grid = document.getElementById('related-services-grid');
    if (!grid) return;

    const lang   = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const slug   = (currentLat && currentEnglishName)
        ? makeSlug(currentEnglishName, currentLat, currentLng) : '';
    const cityLabel = getDisplayCity();

    // قاموس تسميات الخدمات لكلّ لغة (10 لغات)
    const L = {
        ar: { hijri_today: 'التاريخ الهجري اليوم', date_conv: 'تحويل التاريخ', hijri_cal: 'التقويم الهجري', moon: 'القمر اليوم', zakat: 'حاسبة الزكاة' },
        en: { hijri_today: 'Hijri Date Today',     date_conv: 'Date Converter',  hijri_cal: 'Hijri Calendar',  moon: 'Moon Today',   zakat: 'Zakat Calculator' },
        fr: { hijri_today: "Date hégirienne aujourd'hui", date_conv: 'Convertisseur de date', hijri_cal: 'Calendrier hégirien', moon: 'Lune aujourd\'hui', zakat: 'Calculateur de Zakat' },
        tr: { hijri_today: 'Bugünün Hicri Tarihi', date_conv: 'Tarih Dönüştürücü', hijri_cal: 'Hicri Takvim', moon: 'Bugün Ay',      zakat: 'Zekat Hesaplayıcı' },
        ur: { hijri_today: 'آج کی ہجری تاریخ',      date_conv: 'تاریخ کنورٹر',     hijri_cal: 'ہجری کیلنڈر',    moon: 'آج کا چاند',   zakat: 'زکات کیلکولیٹر' },
        de: { hijri_today: 'Hidschri-Datum heute', date_conv: 'Datumsumrechner', hijri_cal: 'Hidschri-Kalender', moon: 'Mond heute', zakat: 'Zakat-Rechner' },
        id: { hijri_today: 'Tanggal Hijriah Hari Ini', date_conv: 'Konverter Tanggal', hijri_cal: 'Kalender Hijriah', moon: 'Bulan Hari Ini', zakat: 'Kalkulator Zakat' },
        es: { hijri_today: 'Fecha hijri de hoy',   date_conv: 'Conversor de fecha', hijri_cal: 'Calendario hijri', moon: 'Luna hoy',    zakat: 'Calculadora de Zakat' },
        bn: { hijri_today: 'আজকের হিজরি তারিখ',     date_conv: 'তারিখ রূপান্তরকারী', hijri_cal: 'হিজরি ক্যালেন্ডার', moon: 'আজকের চাঁদ',   zakat: 'যাকাত ক্যালকুলেটর' },
        ms: { hijri_today: 'Tarikh Hijrah Hari Ini', date_conv: 'Penukar Tarikh', hijri_cal: 'Kalendar Hijrah', moon: 'Bulan Hari Ini', zakat: 'Kalkulator Zakat' }
    };
    const t = L[lang] || L.ar;

    // للقمر: يربط دائمًا بـ /moon-today-in-{slug} (نستخدم اسم المدينة النظيف).
    // sessionStorage يحمل الإحداثيّات، لذا لا حاجة لقصر الاختيار على FAMOUS_MOON_CITIES.
    // 1) استخراج slug من URL الحاليّ (prayer-times-in-X / qibla-in-X) → تنظيفه من الإحداثيّات.
    // 2) fallback: من currentEnglishName (lowercase + hyphens).
    const _moonCitySlug = (function() {
        let candidate = null;
        try {
            const m = window.location.pathname.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:prayer-times-in|qibla-in)-(.+?)(?:\.html)?$/);
            if (m && m[1]) {
                // "london-51.5-0.1" → "london"; "abu-dhabi-24.4-54.3" → "abu-dhabi"
                candidate = m[1].replace(/-?-?\d.*$/, '').replace(/-+$/, '');
            }
        } catch (_e) { /* silent */ }
        if (!candidate && currentEnglishName) {
            candidate = currentEnglishName.toLowerCase().trim().replace(/\s+/g, '-');
        }
        return candidate || null;
    })();

    // تنسيق "القبلة في {المدينة}" حسب اللغة (SOV للعربية والأردية والبنغالية)
    const qiblaLabel = (function(c) {
        switch (lang) {
            case 'ar': return `اتجاه القبلة في ${c}`;
            case 'ur': return `${c} میں قبلہ کا رخ`;
            case 'bn': return `${c}-এ কিবলা`;
            case 'fr': return `Qibla à ${c}`;
            case 'tr': return `${c} Kıble Yönü`;
            case 'de': return `Qibla in ${c}`;
            case 'id': return `Arah Kiblat di ${c}`;
            case 'es': return `Qibla en ${c}`;
            case 'ms': return `Arah Kiblat di ${c}`;
            default:   return `Qibla in ${c}`;
        }
    })(cityLabel);

    const services = [
        {
            icon: '🧭',
            label: qiblaLabel,
            url: slug ? pageUrl(`/qibla-in-${slug}.html`) : pageUrl('/qibla')
        },
        {
            icon: '📅',
            label: t.hijri_today,
            url: pageUrl('/today-hijri-date')
        },
        {
            icon: '🔄',
            label: t.date_conv,
            url: pageUrl('/dateconverter')
        },
        {
            icon: '🗓️',
            label: t.hijri_cal,
            url: pageUrl(`/hijri-calendar/${HijriDate.getToday().year}`)
        },
        {
            icon: '🌙',
            label: t.moon,
            url: _moonCitySlug ? pageUrl(`/moon-today-in-${_moonCitySlug}`) : pageUrl('/moon-today')
        },
        {
            icon: '💰',
            label: t.zakat,
            url: pageUrl('/zakat-calculator')
        }
    ];

    grid.innerHTML = services.map(s =>
        `<a class="rel-service-link" href="${s.url}">
            <span class="rel-service-icon">${s.icon}</span>
            <span>${s.label}</span>
        </a>`
    ).join('');

    // ⭐ عند النقر على رابط القمر: احفظ موقع المدينة الحاليّة في sessionStorage
    //   حتّى تعرضها صفحة القمر بشكل صحيح (مفيد للمدن خارج FAMOUS_MOON_CITIES مثل Tokyo)
    try {
        const _moonLink = grid.querySelector('a.rel-service-link[href*="moon-today"]');
        if (_moonLink) {
            _moonLink.addEventListener('click', () => {
                if (currentLat != null && currentLng != null) {
                    try {
                        sessionStorage.setItem('city_moon', JSON.stringify({
                            lat: currentLat, lng: currentLng,
                            name: currentCity, country: currentCountry,
                            englishName: currentEnglishName, countryCode: currentCountryCode,
                            timezone: currentTimezone
                        }));
                    } catch (_e) { /* silent */ }
                }
            });
        }
    } catch (_e) { /* silent */ }
}

// ========= جدول مواقيت الأسبوع/الشهر =========
let scheduleDays = 7;
let scheduleStartDate = null; // null = اليوم الحالي

// تهيئة منتقي التاريخ
function initScheduleDatePicker() {
    populateScheduleSelects();
    setScheduleSelectsToToday();
}

function getDateType() {
    return document.querySelector('input[name="dateType"]:checked')?.value || 'gregorian';
}

function populateScheduleSelects() {
    const type = getDateType();
    const dayEl   = document.getElementById('sched-day');
    const monthEl = document.getElementById('sched-month');
    const yearEl  = document.getElementById('sched-year');
    if (!dayEl) return;

    // PERF: تجميع HTML في نص ثم إسناد مرة واحدة — يُزيل ~50 layout reflow
    // أيام 1-30
    let dayHtml = '';
    for (let d = 1; d <= 30; d++) dayHtml += `<option value="${d}">${d}</option>`;
    dayEl.innerHTML = dayHtml;

    // أشهر
    const months = type === 'hijri' ? HijriDate.hijriMonths : HijriDate.gregorianMonths;
    monthEl.innerHTML = months.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');

    // سنوات
    if (type === 'hijri') {
        const hNow = HijriDate.toHijri(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
        const hSfxSel = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
        let yHtml = '';
        for (let y = hNow.year - 2; y <= hNow.year + 5; y++)
            yHtml += `<option value="${y}">${y}${hSfxSel}</option>`;
        yearEl.innerHTML = yHtml;
    } else {
        const cur = new Date().getFullYear();
        const gSfxSel = (typeof t === 'function') ? t('date.greg_suffix') : ' م';
        let yHtml = '';
        for (let y = cur - 2; y <= cur + 5; y++)
            yHtml += `<option value="${y}">${y}${gSfxSel}</option>`;
        yearEl.innerHTML = yHtml;
    }
}

function setScheduleSelectsToToday() {
    const type = getDateType();
    const now = new Date();
    let day, month, year;

    if (type === 'hijri') {
        const h = HijriDate.toHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
        day = h.day; month = h.month; year = h.year;
    } else {
        day = now.getDate(); month = now.getMonth() + 1; year = now.getFullYear();
    }

    const d = document.getElementById('sched-day');
    const m = document.getElementById('sched-month');
    const y = document.getElementById('sched-year');
    if (d) d.value = day;
    if (m) m.value = month;
    if (y) y.value = year;
}

function onDateTypeChange() {
    const type = getDateType();
    const singlePicker = document.getElementById('single-date-picker');
    const rangePicker  = document.getElementById('range-date-picker');

    if (type === 'manual') {
        if (singlePicker) singlePicker.classList.add('u-hidden');
        if (rangePicker)  rangePicker.classList.remove('u-hidden');
        populateRangeSelects();
        onRangeDateChange();
    } else {
        if (singlePicker) singlePicker.classList.remove('u-hidden');
        if (rangePicker)  rangePicker.classList.add('u-hidden');
        hidePagination();
        populateScheduleSelects();
        setScheduleSelectsToToday();
        onScheduleDateChange();
    }
}

function onScheduleDateChange() {
    const type  = getDateType();
    const day   = parseInt(document.getElementById('sched-day')?.value || 1);
    const month = parseInt(document.getElementById('sched-month')?.value || 1);
    const year  = parseInt(document.getElementById('sched-year')?.value || new Date().getFullYear());

    if (type === 'hijri') {
        const g = HijriDate.toGregorian(year, month, day);
        scheduleStartDate = new Date(g.year, g.month - 1, g.day);
    } else {
        scheduleStartDate = new Date(year, month - 1, day);
    }
    renderPrayerSchedule(scheduleDays, null);
}

// ========= البحث اليدوي - نطاق التاريخ =========
function populateRangeSelects() {
    const now  = new Date();
    const year = now.getFullYear();

    ['from', 'to'].forEach(prefix => {
        const dayEl   = document.getElementById(`range-${prefix}-day`);
        const monthEl = document.getElementById(`range-${prefix}-month`);
        const yearEl  = document.getElementById(`range-${prefix}-year`);
        if (!dayEl) return;

        // PERF: تجميع HTML في نص ثم إسناد مرة واحدة
        // أيام 1-31
        let dHtml = '';
        for (let d = 1; d <= 31; d++) dHtml += `<option value="${d}">${d}</option>`;
        dayEl.innerHTML = dHtml;

        // أشهر ميلادية
        monthEl.innerHTML = HijriDate.gregorianMonths.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');

        // سنوات: السنة الحالية -1 حتى +5
        let yHtml = '';
        for (let y = year - 1; y <= year + 5; y++) yHtml += `<option value="${y}">${y}</option>`;
        yearEl.innerHTML = yHtml;
    });

    // القيم الافتراضية: من اليوم — إلى اليوم + 6
    const toDate = new Date(now);
    toDate.setDate(toDate.getDate() + 6);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set('range-from-day',   now.getDate());
    set('range-from-month', now.getMonth() + 1);
    set('range-from-year',  year);
    set('range-to-day',     toDate.getDate());
    set('range-to-month',   toDate.getMonth() + 1);
    set('range-to-year',    toDate.getFullYear());
}

// حالة ترقيم الصفحات للبحث اليدوي
let manualRangeStart   = null;
let manualRangeDays    = 0;
let manualCurrentPage  = 0;
const MANUAL_PAGE_SIZE = 30; // أيام لكل صفحة

function onRangeDateChange() {
    const get = id => parseInt(document.getElementById(id)?.value || 1);
    const fromDay   = get('range-from-day');
    const fromMonth = get('range-from-month');
    const fromYear  = parseInt(document.getElementById('range-from-year')?.value || new Date().getFullYear());
    const toDay     = get('range-to-day');
    const toMonth   = get('range-to-month');
    const toYear    = parseInt(document.getElementById('range-to-year')?.value || new Date().getFullYear());

    const errorEl = document.getElementById('range-error');
    const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
    const toDate   = new Date(toYear,   toMonth   - 1, toDay);

    // التحقق: تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية
    if (toDate < fromDate) {
        if (errorEl) {
            errorEl.classList.remove('u-hidden');
            // FIX i18n: رسالة الخطأ لكل اللغات
            errorEl.textContent = (typeof t === 'function' ? t('schedule.err_to_before_from') : null)
                || 'End date must be on or after start date';
        }
        const toYearEl = document.getElementById('range-to-year');
        if (toYearEl && toYear < fromYear) toYearEl.value = fromYear;
        return;
    }

    // الحد الأقصى 365 يوماً
    const diffDays = Math.round((toDate - fromDate) / 86400000) + 1;
    if (diffDays > 365) {
        if (errorEl) {
            errorEl.classList.remove('u-hidden');
            // FIX i18n: رسالة الخطأ لكل اللغات
            errorEl.textContent = (typeof t === 'function' ? t('schedule.err_max_365') : null)
                || 'Cannot select range exceeding 365 days';
        }
        return;
    }

    if (errorEl) errorEl.classList.add('u-hidden');

    // تخزين حالة النطاق والترقيم
    manualRangeStart  = fromDate;
    manualRangeDays   = diffDays;
    manualCurrentPage = 0;

    if (diffDays > MANUAL_PAGE_SIZE) {
        renderManualSchedulePage(0);
    } else {
        hidePagination();
        scheduleStartDate = fromDate;
        renderPrayerSchedule(diffDays, null);
    }
}

function renderManualSchedulePage(page) {
    const totalPages = Math.ceil(manualRangeDays / MANUAL_PAGE_SIZE);
    page = Math.max(0, Math.min(page, totalPages - 1));
    manualCurrentPage = page;

    const pageStart = new Date(manualRangeStart);
    pageStart.setDate(pageStart.getDate() + page * MANUAL_PAGE_SIZE);
    const daysInPage = Math.min(MANUAL_PAGE_SIZE, manualRangeDays - page * MANUAL_PAGE_SIZE);

    scheduleStartDate = pageStart;
    renderPrayerSchedule(daysInPage, null);
    renderSchedulePagination(page, totalPages);

    // تمرير ناعم للأعلى عند تغيير الصفحة
    const tableEl = document.getElementById('schedule-table');
    if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSchedulePagination(currentPage, totalPages) {
    const paginationEl = document.getElementById('schedule-pagination');
    if (!paginationEl) return;

    if (totalPages <= 1) { paginationEl.classList.add('u-hidden'); return; }
    paginationEl.classList.remove('u-hidden');

    const isRTL = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
    const prevLabel = isRTL ? '→ السابق' : '← Prev';
    const nextLabel = isRTL ? 'التالي ←' : 'Next →';
    const pageLabel = isRTL
        ? `الصفحة ${currentPage + 1} من ${totalPages}`
        : `Page ${currentPage + 1} of ${totalPages}`;

    // بناء أزرار الصفحات مع عرض حذف (...) إذا كانت الصفحات كثيرة
    let pagesHtml = '';
    for (let i = 0; i < totalPages; i++) {
        const isActive = i === currentPage;
        // عرض الصفحة الأولى، الأخيرة، والمجاورة للصفحة الحالية
        const show = i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1;
        const showEllipsis = !show && (i === 1 || i === totalPages - 2);
        if (showEllipsis) {
            pagesHtml += `<span class="pagination-ellipsis">…</span>`;
        } else if (show) {
            pagesHtml += `<button class="pagination-page${isActive ? ' active' : ''}" onclick="renderManualSchedulePage(${i})">${i + 1}</button>`;
        }
    }

    paginationEl.innerHTML = `
        <div class="pagination-controls">
            <button class="pagination-btn" onclick="renderManualSchedulePage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>${prevLabel}</button>
            <div class="pagination-pages">${pagesHtml}</div>
            <button class="pagination-btn" onclick="renderManualSchedulePage(${currentPage + 1})" ${currentPage === totalPages - 1 ? 'disabled' : ''}>${nextLabel}</button>
        </div>
        <div class="pagination-info">${pageLabel}</div>
    `;
}

function hidePagination() {
    const el = document.getElementById('schedule-pagination');
    if (el) el.classList.add('u-hidden');
}

function setScheduleDays(days, btn) {
    scheduleDays = days;
    if (btn) {
        document.querySelectorAll('.schedule-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    renderPrayerSchedule(days, null);
}

function renderPrayerSchedule(days, btn) {
    if (btn) {
        scheduleDays = days;
        document.querySelectorAll('.schedule-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    const tbody = document.getElementById('schedule-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // تحديد تاريخ البداية
    const now = new Date();
    const localOffset = -now.getTimezoneOffset() / 60;
    const cityNow = new Date(now.getTime() + (currentTimezone - localOffset) * 3600000);
    const startDate = scheduleStartDate
        ? new Date(scheduleStartDate)
        : new Date(cityNow.getFullYear(), cityNow.getMonth(), cityNow.getDate());

    // تحديث العنوان
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1);

    const fmtDate = d => `${d.getDate()} ${HijriDate.gregorianMonths[d.getMonth()]} ${d.getFullYear()}`;
    const titleEl = document.getElementById('schedule-title');
    if (titleEl) {
        titleEl.textContent = t('schedule.title_with_range', {
            city: getDisplayCity(),
            start: fmtDate(startDate),
            end: fmtDate(endDate)
        });
    }

    // بناء الصفوف
    const todayStr = `${cityNow.getFullYear()}-${cityNow.getMonth()}-${cityNow.getDate()}`;

    for (let i = 0; i < days; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + i);

        const times   = PrayerTimes.getTimes(dayDate, currentLat, currentLng, currentTimezone);
        const hijri   = HijriDate.toHijri(dayDate.getFullYear(), dayDate.getMonth() + 1, dayDate.getDate());
        const dayName = HijriDate.dayNames[dayDate.getDay()];
        const monthName = HijriDate.gregorianMonths[dayDate.getMonth()];
        const greg    = `${dayDate.getDate()} ${monthName} ${dayDate.getFullYear()}`;
        const hSfx2 = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
        const hijriStr = `${hijri.day} ${HijriDate.hijriMonths[hijri.month-1]} ${hijri.year}${hSfx2}`;

        const isToday = `${dayDate.getFullYear()}-${dayDate.getMonth()}-${dayDate.getDate()}` === todayStr;
        const tr = document.createElement('tr');
        if (isToday) tr.classList.add('today-row');
        const dayHref = hijriDayUrl(hijri.year, hijri.month, hijri.day);
        tr.innerHTML = `
            <td>
                <a class="sched-day-link" href="${dayHref}">
                    <div class="sched-day">${dayName}</div>
                    <div class="sched-greg">${greg}</div>
                    <div class="sched-hijri">${hijriStr}</div>
                </a>
            </td>
            <td>${times.fajr}</td>
            <td>${times.sunrise}</td>
            <td>${times.dhuhr}</td>
            <td>${times.asr}</td>
            <td>${times.maghrib}</td>
            <td>${times.isha}</td>
        `;
        tbody.appendChild(tr);
    }
}

function makeCountrySlug(cc, englishName) {
    // 1) اسم من geocoding (الأشمل — يعمل مع أي دولة)
    // 2) COUNTRY_EN_NAMES المعرَّف أعلى الملف
    const name = englishName || COUNTRY_EN_NAMES[cc];
    if (name) return name
        .normalize('NFD')                           // Côte → Co + combining circumflex
        .replace(/[\u0300-\u036f]/g, '')            // حذف العلامات التشكيليّة فقط
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    return cc;
}

// ========= قاعدة بيانات المدن =========
const CITIES_DB = {
    'sa': [
        { nameAr: 'الرياض',           nameEn: 'Riyadh',            lat: 24.6877, lng: 46.7219 },
        { nameAr: 'جدة',              nameEn: 'Jeddah',            lat: 21.4858, lng: 39.1925 },
        { nameAr: 'مكة المكرمة',      nameEn: 'Mecca',             lat: 21.3891, lng: 39.8579 },
        { nameAr: 'المدينة المنورة',  nameEn: 'Medina',            lat: 24.4672, lng: 39.6150 },
        { nameAr: 'الدمام',           nameEn: 'Dammam',            lat: 26.4207, lng: 50.0888 },
        { nameAr: 'الخبر',            nameEn: 'Khobar',            lat: 26.2172, lng: 50.1971 },
        { nameAr: 'الطائف',           nameEn: 'Taif',              lat: 21.2703, lng: 40.4158 },
        { nameAr: 'تبوك',             nameEn: 'Tabuk',             lat: 28.3835, lng: 36.5662 },
        { nameAr: 'بريدة',            nameEn: 'Buraydah',          lat: 26.3260, lng: 43.9750 },
        { nameAr: 'خميس مشيط',       nameEn: 'Khamis Mushait',    lat: 18.3000, lng: 42.7333 },
        { nameAr: 'أبها',             nameEn: 'Abha',              lat: 18.2164, lng: 42.5053 },
        { nameAr: 'نجران',            nameEn: 'Najran',            lat: 17.4927, lng: 44.1322 },
        { nameAr: 'حائل',             nameEn: 'Hail',              lat: 27.5219, lng: 41.7057 },
        { nameAr: 'جيزان',            nameEn: 'Jizan',             lat: 16.8892, lng: 42.5611 },
        { nameAr: 'الجبيل',           nameEn: 'Jubail',            lat: 27.0046, lng: 49.6586 },
        { nameAr: 'ينبع',             nameEn: 'Yanbu',             lat: 24.0894, lng: 38.0618 },
        { nameAr: 'الأحساء',          nameEn: 'Al-Ahsa',           lat: 25.3000, lng: 49.6000 },
        { nameAr: 'القطيف',           nameEn: 'Qatif',             lat: 26.5565, lng: 50.0114 },
        { nameAr: 'الظهران',          nameEn: 'Dhahran',           lat: 26.2828, lng: 50.1548 },
        { nameAr: 'سكاكا',            nameEn: 'Sakaka',            lat: 29.9697, lng: 40.2066 },
        { nameAr: 'عرعر',             nameEn: 'Arar',              lat: 30.9753, lng: 41.0381 },
        { nameAr: 'عنيزة',            nameEn: 'Unaizah',           lat: 26.0836, lng: 43.9939 },
        { nameAr: 'الرس',             nameEn: 'Al-Rass',           lat: 25.8707, lng: 43.4904 },
        { nameAr: 'المجمعة',          nameEn: 'Majmaah',           lat: 25.9028, lng: 45.3444 },
        { nameAr: 'الزلفي',           nameEn: 'Zulfi',             lat: 26.2958, lng: 44.8031 },
        { nameAr: 'الدوادمي',         nameEn: 'Dawadmi',           lat: 24.4981, lng: 44.3903 },
        { nameAr: 'شقراء',            nameEn: 'Shaqra',            lat: 25.2432, lng: 45.2517 },
        { nameAr: 'وادي الدواسر',     nameEn: 'Wadi ad-Dawasir',  lat: 20.5041, lng: 44.5961 },
        { nameAr: 'الباحة',           nameEn: 'Baha',              lat: 20.0129, lng: 41.4677 },
        { nameAr: 'رابغ',             nameEn: 'Rabigh',            lat: 22.7995, lng: 39.0342 },
        { nameAr: 'القنفذة',          nameEn: 'Qunfudhah',         lat: 19.1293, lng: 41.0817 },
        { nameAr: 'بيشة',             nameEn: 'Bisha',             lat: 19.9840, lng: 42.6042 },
        { nameAr: 'النماص',           nameEn: 'Namas',             lat: 19.1221, lng: 42.1322 },
        { nameAr: 'حفر الباطن',       nameEn: 'Hafar al-Batin',    lat: 28.4338, lng: 45.9601 },
        { nameAr: 'رفحاء',            nameEn: 'Rafha',             lat: 29.6261, lng: 43.4974 },
        { nameAr: 'صبيا',             nameEn: 'Sabya',             lat: 17.1531, lng: 42.6271 },
        { nameAr: 'أبو عريش',         nameEn: 'Abu Arish',         lat: 16.9746, lng: 42.8351 },
        { nameAr: 'شرورة',            nameEn: 'Sharura',           lat: 17.5070, lng: 47.1020 },
        { nameAr: 'المخواة',          nameEn: 'Mikhwah',           lat: 19.9333, lng: 41.4333 },
        { nameAr: 'القريات',          nameEn: 'Qurayyat',          lat: 31.3310, lng: 37.3438 },
        { nameAr: 'دومة الجندل',      nameEn: 'Dumat al-Jandal',  lat: 29.8140, lng: 39.8663 },
        { nameAr: 'ضباء',             nameEn: 'Duba',              lat: 27.3400, lng: 35.6900 },
        { nameAr: 'العلا',            nameEn: 'AlUla',             lat: 26.6088, lng: 37.9228 },
        { nameAr: 'الحناكية',         nameEn: 'Hanakyah',          lat: 24.8547, lng: 40.4787 },
        { nameAr: 'المزاحمية',        nameEn: 'Muzahimiyah',       lat: 24.4833, lng: 46.1333 },
        { nameAr: 'حوطة بني تميم',    nameEn: 'Hawtat Bani Tamim', lat: 23.5250, lng: 46.8333 },
        { nameAr: 'الأفلاج',          nameEn: 'Aflaj',             lat: 22.2667, lng: 46.7333 },
        { nameAr: 'تثليث',            nameEn: 'Tathlith',          lat: 19.5667, lng: 43.4833 },
        { nameAr: 'الجموم',           nameEn: 'Al-Jumum',          lat: 21.5826, lng: 39.6765 },
        { nameAr: 'بقعاء',            nameEn: 'Buqayq',            lat: 27.3167, lng: 45.5833 },
    ],
    'sy': [
        { nameAr: 'دمشق',        nameEn: 'Damascus',    lat: 33.5102, lng: 36.2913 },
        { nameAr: 'حلب',         nameEn: 'Aleppo',      lat: 36.2021, lng: 37.1343 },
        { nameAr: 'حمص',         nameEn: 'Homs',        lat: 34.7324, lng: 36.7137 },
        { nameAr: 'حماة',        nameEn: 'Hama',        lat: 35.1333, lng: 36.7500 },
        { nameAr: 'اللاذقية',    nameEn: 'Latakia',     lat: 35.5317, lng: 35.7915 },
        { nameAr: 'دير الزور',  nameEn: 'Deir ez-Zor', lat: 35.3360, lng: 40.1408 },
        { nameAr: 'الرقة',       nameEn: 'Raqqa',       lat: 35.9500, lng: 39.0167 },
        { nameAr: 'درعا',        nameEn: 'Daraa',       lat: 32.6208, lng: 36.1044 },
        { nameAr: 'إدلب',        nameEn: 'Idlib',       lat: 35.9319, lng: 36.6326 },
        { nameAr: 'السويداء',    nameEn: 'As-Suwayda',  lat: 32.7070, lng: 36.5680 },
        { nameAr: 'القامشلي',    nameEn: 'Qamishli',    lat: 37.0500, lng: 41.2167 },
        { nameAr: 'طرطوس',       nameEn: 'Tartus',      lat: 34.8963, lng: 35.8872 },
        { nameAr: 'بانياس',      nameEn: 'Baniyas',     lat: 35.1827, lng: 35.9449 },
        { nameAr: 'جبلة',        nameEn: 'Jableh',      lat: 35.3600, lng: 35.9278 },
        { nameAr: 'معرة النعمان',nameEn: 'Maarat al-Numan', lat: 35.6432, lng: 36.6710 },
        { nameAr: 'منبج',        nameEn: 'Manbij',      lat: 36.5119, lng: 37.9456 },
    ],
    'eg': [
        { nameAr: 'القاهرة',        nameEn: 'Cairo',          lat: 30.0444, lng: 31.2357 },
        { nameAr: 'الإسكندرية',     nameEn: 'Alexandria',     lat: 31.2001, lng: 29.9187 },
        { nameAr: 'الجيزة',         nameEn: 'Giza',           lat: 30.0131, lng: 31.2089 },
        { nameAr: 'شبرا الخيمة',    nameEn: 'Shubra el-Kheima', lat: 30.1286, lng: 31.2422 },
        { nameAr: 'بورسعيد',        nameEn: 'Port Said',      lat: 31.2565, lng: 32.2841 },
        { nameAr: 'السويس',         nameEn: 'Suez',           lat: 29.9737, lng: 32.5265 },
        { nameAr: 'الأقصر',         nameEn: 'Luxor',          lat: 25.6872, lng: 32.6396 },
        { nameAr: 'أسوان',          nameEn: 'Aswan',          lat: 24.0889, lng: 32.8998 },
        { nameAr: 'المنصورة',       nameEn: 'Mansoura',       lat: 31.0364, lng: 31.3807 },
        { nameAr: 'طنطا',           nameEn: 'Tanta',          lat: 30.7865, lng: 31.0004 },
        { nameAr: 'الإسماعيلية',    nameEn: 'Ismailia',       lat: 30.5965, lng: 32.2715 },
        { nameAr: 'الفيوم',         nameEn: 'Faiyum',         lat: 29.3084, lng: 30.8428 },
        { nameAr: 'أسيوط',          nameEn: 'Asyut',          lat: 27.1809, lng: 31.1837 },
        { nameAr: 'الزقازيق',       nameEn: 'Zagazig',        lat: 30.5877, lng: 31.5021 },
        { nameAr: 'دمياط',          nameEn: 'Damietta',       lat: 31.4165, lng: 31.8133 },
        { nameAr: 'كفر الشيخ',      nameEn: 'Kafr el-Sheikh', lat: 31.1107, lng: 30.9388 },
    ],
    'iq': [
        { nameAr: 'بغداد',      nameEn: 'Baghdad',    lat: 33.3406, lng: 44.4009 },
        { nameAr: 'البصرة',     nameEn: 'Basra',      lat: 30.5085, lng: 47.7804 },
        { nameAr: 'الموصل',     nameEn: 'Mosul',      lat: 36.3400, lng: 43.1300 },
        { nameAr: 'أربيل',      nameEn: 'Erbil',      lat: 36.1912, lng: 44.0092 },
        { nameAr: 'السليمانية', nameEn: 'Sulaymaniyah', lat: 35.5605, lng: 45.4327 },
        { nameAr: 'النجف',      nameEn: 'Najaf',      lat: 32.0001, lng: 44.3422 },
        { nameAr: 'كربلاء',     nameEn: 'Karbala',    lat: 32.6158, lng: 44.0243 },
        { nameAr: 'كركوك',      nameEn: 'Kirkuk',     lat: 35.4682, lng: 44.3923 },
        { nameAr: 'الحلة',      nameEn: 'Hillah',     lat: 32.4661, lng: 44.4218 },
        { nameAr: 'الفلوجة',    nameEn: 'Fallujah',   lat: 33.3533, lng: 43.7938 },
        { nameAr: 'الرمادي',    nameEn: 'Ramadi',     lat: 33.4258, lng: 43.2991 },
        { nameAr: 'دهوك',       nameEn: 'Dohuk',      lat: 36.8669, lng: 42.9888 },
        { nameAr: 'ديالى',      nameEn: 'Baquba',     lat: 33.7467, lng: 44.6429 },
        { nameAr: 'سامراء',     nameEn: 'Samarra',    lat: 34.2000, lng: 43.8667 },
        { nameAr: 'الناصرية',   nameEn: 'Nasiriyah',  lat: 31.0461, lng: 46.2578 },
        { nameAr: 'العمارة',    nameEn: 'Amarah',     lat: 31.8350, lng: 47.1466 },
    ],
};

let allCitiesData = [];
let allCitiesFiltered = [];
let allCitiesPage = 1;
const CITIES_PER_PAGE = 26;
const PAGES_VISIBLE = 10;

// ========= قسم مدن الدولة =========
function renderCountryCities(cities, code) {
    const section = document.getElementById('country-cities-section');
    const grid    = document.getElementById('country-cities-grid');
    const title   = document.getElementById('country-cities-title');
    const moreBtn = document.getElementById('more-cities-btn');
    if (!section || !grid) return;

    // استبعاد المدينة الحالية
    const others = cities.filter(c =>
        !(Math.abs(c.lat - currentLat) < 0.5 && Math.abs(c.lng - currentLng) < 0.5)
    );

    if (others.length === 0) { section.style.display = 'none'; return; }

    section.style.display = 'block';
    const langRC = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const dispCountryRC = getDisplayCountry();
    title.textContent = t('cities.section_title', { country: dispCountryRC });
    if (moreBtn) moreBtn.textContent = t('cities.more_btn_country', { country: dispCountryRC });

    grid.innerHTML = '';
    others.slice(0, 16).forEach(city => {
        const a = document.createElement('a');
        a.className = 'city-card';
        a.href = buildCityUrl(city.lat, city.lng, city.nameAr, currentCountry, city.nameEn);
        let _cityName;
        if (langRC === 'ar') {
            _cityName = city.nameAr;
        } else {
            const cityMap = _LOCALIZED_CITY_MAPS[langRC];
            _cityName = (cityMap && cityMap[city.nameEn]) || city.nameEn || city.nameAr;
        }
        a.textContent = t('prayer_times_in', { city: _cityName });
        a.addEventListener('click', e => {
            e.preventDefault();
            navigateToCity(city.lat, city.lng, city.nameAr, currentCountry, city.nameEn, code);
        });
        grid.appendChild(a);
    });
}

function updateCountryCitiesSection() {
    const section = document.getElementById('country-cities-section');
    if (!section) return;

    const code   = currentCountryCode;

    // PERF: تأجيل render قليلاً إلى idle time بدون منع الظهور
    // (القسم يبدأ display:none في HTML — IntersectionObserver لا يعمل على عناصر display:none
    //  لأن مقاسها 0×0. لذا نستخدم requestIdleCallback فقط.)
    const _doFetchAndRender = () => {
        const local = CITIES_DB[code];
        // 1) إذا عندنا بيانات محلية استخدمها فوراً
        if (local && local.length > 0) {
            renderCountryCities(local, code);
            return;
        }
        // 2) جرّب الكاش في localStorage
        try {
            const raw = localStorage.getItem(`cities_v3_${code}`);
            if (raw) {
                const { cities } = JSON.parse(raw);
                if (cities && cities.length > 0) { renderCountryCities(cities, code); return; }
            }
        } catch(e) {}
        // 3) اجلب من API الخادم المحلي
        section.style.display = 'none';
        fetch(`/api/cities?cc=${code}`)
            .then(r => r.ok ? r.json() : null)
            .then(cities => {
                if (cities && cities.length > 0) {
                    try { localStorage.setItem(`cities_v3_${code}`, JSON.stringify({ ts: Date.now(), cities })); } catch(e) {}
                    renderCountryCities(cities, code);
                }
            })
            .catch(() => {});
    };

    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(_doFetchAndRender, { timeout: 1500 });
    } else {
        setTimeout(_doFetchAndRender, 300);
    }
}

// ========= صفحة جميع المدن =========
function openAllCitiesPage() {
    const code = currentCountryCode || 'sa';
    const slug = makeCountrySlug(code, currentEnglishCountry);
    const citySlug = (currentEnglishName && currentLat)
        ? makeSlug(currentEnglishName, currentLat, currentLng) : null;
    sessionStorage.setItem('allCitiesCountry', JSON.stringify({
        code, name: currentCountry, slug, citySlug
    }));
    window.location.href = pageUrl(`/${slug}`);
}

function filterAllCities() {
    const q = (document.getElementById('all-cities-search')?.value || '').trim().toLowerCase();
    allCitiesFiltered = q
        ? allCitiesData.filter(c => c.nameAr.includes(q) || c.nameEn.toLowerCase().includes(q))
        : [...allCitiesData];
    allCitiesPage = 1;
    renderAllCitiesGrid();
}

function renderAllCitiesGrid() {
    const container = document.getElementById('all-cities-container');
    if (!container) return;

    const total = allCitiesFiltered.length;
    const totalPages = Math.ceil(total / CITIES_PER_PAGE);
    const start = (allCitiesPage - 1) * CITIES_PER_PAGE;
    const pageCities = allCitiesFiltered.slice(start, start + CITIES_PER_PAGE);

    if (pageCities.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:24px">\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c</p>';
        document.getElementById('cities-pagination').innerHTML = '';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'all-cities-grid';

    pageCities.forEach(city => {
        const a = document.createElement('a');
        a.className = 'all-city-item';
        a.href = buildCityUrl(city.lat, city.lng, city.nameAr, currentCountry, city.nameEn);
        a.textContent = `مواقيت الصلاة في ${city.nameAr}`;
        a.addEventListener('click', e => {
            e.preventDefault();
            navigateToCity(city.lat, city.lng, city.nameAr, currentCountry, city.nameEn, currentCountryCode);
        });
        grid.appendChild(a);
    });

    container.innerHTML = '';
    container.appendChild(grid);

    renderCitiesPagination(totalPages);
}

function renderCitiesPagination(totalPages) {
    const el = document.getElementById('cities-pagination');
    if (!el || totalPages <= 1) { if(el) el.innerHTML=''; return; }

    el.innerHTML = '';

    const addBtn = (label, page, isActive, isArrow) => {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (isActive ? ' active' : '') + (isArrow ? ' arrow' : '');
        btn.textContent = label;
        btn.disabled = isActive && !isArrow;
        btn.onclick = () => { allCitiesPage = page; renderAllCitiesGrid(); };
        el.appendChild(btn);
    };

    // حساب نطاق الصفحات المرئية
    const half = Math.floor(PAGES_VISIBLE / 2);
    let pageStart = Math.max(1, allCitiesPage - half);
    let pageEnd   = Math.min(totalPages, pageStart + PAGES_VISIBLE - 1);
    if (pageEnd - pageStart < PAGES_VISIBLE - 1) pageStart = Math.max(1, pageEnd - PAGES_VISIBLE + 1);

    // سهم للخلف
    if (allCitiesPage > 1) addBtn('\u2192', allCitiesPage - 1, false, true);

    // أرقام الصفحات
    for (let i = pageStart; i <= pageEnd; i++) {
        addBtn(i, i, i === allCitiesPage, false);
    }

    // سهم للأمام
    if (allCitiesPage < totalPages) addBtn('\u2190', allCitiesPage + 1, false, true);
}

// ========= الأسئلة الشائعة FAQ =========
function updateFaqSection() {
    if (!currentPrayerTimes || !currentCity) return;
    // Early-exit إذا كان #faq-section مقصوص (صفحة time-left) — يوفّر الكثير من null-guards
    if (!document.getElementById('faq-title')) return;

    const lang    = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const city    = getDisplayCity();
    const country = getDisplayCountry();
    const sep     = (lang === 'ar' || lang === 'ur') ? '، ' : ', ';
    const loc     = country
        ? `<strong>${city}</strong>${sep}<strong>${country}</strong>`
        : `<strong>${city}</strong>`;

    // العنوان
    document.getElementById('faq-title').innerHTML = t('faq.title_loc', { loc });

    // س1
    document.getElementById('faq-q1').innerHTML = t('faq.q1', { loc });
    document.getElementById('faq-a1-intro').innerHTML = t('faq.a1_intro', { loc });

    // SEO: كلّ صفّ يحوي "أذان {الصلاة} في {المدينة}" ليتطابق مع استعلامات Google الشائعة.
    // الشروق استثناء (لا أذان له) → قالب "وقت الشروق في {المدينة}".
    const cityOnly = city; // getDisplayCity() بدون دولة، بدون <strong>
    const prayers = [
        { key: 'prayer.fajr',    time: currentPrayerTimes.fajr,    isSunrise: false },
        { key: 'prayer.sunrise', time: currentPrayerTimes.sunrise, isSunrise: true  },
        { key: 'prayer.dhuhr',   time: currentPrayerTimes.dhuhr,   isSunrise: false },
        { key: 'prayer.asr',     time: currentPrayerTimes.asr,     isSunrise: false },
        { key: 'prayer.maghrib', time: currentPrayerTimes.maghrib, isSunrise: false },
        { key: 'prayer.isha',    time: currentPrayerTimes.isha,    isSunrise: false },
    ];
    const listEl = document.getElementById('faq-times-list');
    listEl.innerHTML = prayers.map(p => {
        const prayer = t(p.key);
        const label = p.isSunrise
            ? t('faq.sunrise_line', { loc: cityOnly })
            : t('faq.adhan_line', { prayer, loc: cityOnly });
        return `<li><span>${label}</span><span>${p.time}</span></li>`;
    }).join('');

    // س2 - ساعات الصيام
    const rawFajr    = currentPrayerTimes.raw.fajr;
    const rawMaghrib = currentPrayerTimes.raw.maghrib;
    let fastMins = Math.round((rawMaghrib - rawFajr) * 60);
    if (fastMins < 0) fastMins += 24 * 60;
    const fH = Math.floor(fastMins / 60), fM = fastMins % 60;

    const hrLbl2 = t(fH === 1 ? 'unit.hour' : 'unit.hours');
    const minLbl2 = t('unit.min');
    const andLbl2 = t('unit.and');
    const fastStr = `<strong>${fH} ${hrLbl2}${fM > 0 ? andLbl2 + fM + ' ' + minLbl2 : ''}</strong>`;
    document.getElementById('faq-q2').innerHTML = t('faq.q2', { loc });
    document.getElementById('faq-a2').innerHTML = t('faq.a2', { loc, duration: fastStr });

    // ═══ Phase 2 — FAQ q3..q7 (city-page فقط) ═══
    const _isCityPage = (typeof _isCityPagePhase2 === 'function' && _isCityPagePhase2());
    if (_isCityPage) {
        // method + country labels
        let methodLabel = '';
        try {
            const sel = document.getElementById('calc-method');
            const methodVal = (typeof PrayerTimes !== 'undefined' && PrayerTimes.getMethod) ? PrayerTimes.getMethod() : (sel ? sel.value : 'MWL');
            const _try = t('method.' + methodVal);
            methodLabel = (_try && _try !== 'method.' + methodVal) ? _try : methodVal;
        } catch (_) { methodLabel = 'MWL'; }
        const methodStr = `<strong>${methodLabel}</strong>`;
        const countryStr = country ? `<strong>${country}</strong>` : `<strong>${city}</strong>`;
        const cityStr = `<strong>${city}</strong>`;

        // ساعات الصيام (نفس fastStr محسوب أعلاه)
        const fastHoursStr = fastStr;

        const _fill = (id, key, vars) => {
            const el = document.getElementById(id);
            if (!el) return;
            const _try = t(key, vars);
            if (_try && _try !== key) el.innerHTML = _try;
        };

        // q3/a3 — كيف تُحسب المواقيت
        _fill('faq-q3', 'faq.city.q3', { loc });
        _fill('faq-a3', 'faq.city.a3', { loc, method: methodStr });

        // q4/a4 — اتّجاه القبلة
        _fill('faq-q4', 'faq.city.q4', { loc });
        _fill('faq-a4', 'faq.city.a4', { loc });

        // q5/a5 — الفرق عن المجاورة
        _fill('faq-q5', 'faq.city.q5', { loc });
        _fill('faq-a5', 'faq.city.a5', { loc });

        // q6/a6 — ساعات الصيام
        _fill('faq-q6', 'faq.city.q6', { loc });
        _fill('faq-a6', 'faq.city.a6', { loc, duration: fastHoursStr });

        // q7/a7 — مقارنة بمكّة
        _fill('faq-q7', 'faq.city.q7', { loc });
        _fill('faq-a7', 'faq.city.a7', { loc });

        // 🆕 Round 4 (Minimal) — q8/a8 رابط time-left + q9/a9 رابط next-prayer-time
        try {
            const _slug = (typeof getSlugFromURL === 'function') ? getSlugFromURL() : '';
            const _lng = (typeof getCurrentLang === 'function' && getCurrentLang() !== 'ar') ? '/' + getCurrentLang() : '';
            const tlHref = _slug ? (_lng + '/time-left-until-prayer-in-' + _slug) : '#';
            const nptHref = _slug ? (_lng + '/next-prayer-time-in-' + _slug) : '#';
            _fill('faq-q8', 'faq.city.q8', { loc });
            _fill('faq-a8', 'faq.city.a8', { loc, tlHref });
            _fill('faq-q9', 'faq.city.q9', { loc });
            _fill('faq-a9', 'faq.city.a9', { loc, nptHref });
        } catch (_e) {}
    }
}

/**
 * 🆕 Phase 2 — يُطبَّق قوالب {loc}/{method}/{country} على كلّ #faq-section
 * تُستدعى من applyFaqCityMode() — تكمّل الـfill الموجود في updateFaqSection().
 * تحديداً: تمرير على عناصر data-i18n التي ربّما لم تُعالج أثناء updateFaqSection.
 */
function replaceFaqPlaceholders(cityName, methodLabel, countryName) {
    const faq = document.getElementById('faq-section');
    if (!faq) return;
    const vars = {};
    if (cityName)    vars.loc     = cityName;
    if (methodLabel) vars.method  = methodLabel;
    if (countryName) vars.country = countryName;
    // إذا عنصر data-i18n مازال فيه placeholder — نستبدله
    faq.querySelectorAll('[data-i18n]').forEach(el => {
        const txt = el.textContent || '';
        if (!/\{(loc|method|country|duration)\}/.test(txt)) return;
        el.textContent = txt
            .replace(/\{loc\}/g,     cityName || '')
            .replace(/\{method\}/g,  methodLabel || '')
            .replace(/\{country\}/g, countryName || '');
    });
}

// ========= قسم الكلمات المفتاحية SEO =========
function updateSeoSection() {
    if (!currentPrayerTimes || !currentCity) return;

    const lang    = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const city    = getDisplayCity();
    const country = getDisplayCountry();
    const fajr    = currentPrayerTimes.fajr;
    const isha    = currentPrayerTimes.isha;

    // حساب ساعات الصيام (من الفجر إلى المغرب)
    const rawFajr    = currentPrayerTimes.raw.fajr;
    const rawMaghrib = currentPrayerTimes.raw.maghrib;
    let fastingMins  = Math.round((rawMaghrib - rawFajr) * 60);
    if (fastingMins < 0) fastingMins += 24 * 60;
    const fastH = Math.floor(fastingMins / 60);
    const fastM = fastingMins % 60;

    const hrLbl = t(fastH === 1 ? 'unit.hour' : 'unit.hours');
    const minLbl = t('unit.min');
    const andLbl = t('unit.and');
    const fastingStr = `<strong>${fastH} ${hrLbl}${fastM > 0 ? andLbl + fastM + ' ' + minLbl : ''}</strong>`;
    const sep = country ? ((lang === 'ar' || lang === 'ur') ? '، ' : ', ') : '';
    const countryPart = country || '';
    document.getElementById('seo-line-1').innerHTML =
        t('seo.line_1_title', { city: `<strong>${city}</strong>`, sep, country: countryPart });
    document.getElementById('seo-line-2').innerHTML =
        t('seo.line_2_desc', { city: `<strong>${city}</strong>`, fajr: `<strong>${fajr}</strong>`, isha: `<strong>${isha}</strong>`, duration: fastingStr });

    // سطر 3: طريقة الحساب الحالية + طريقة حساب العصر (متوافق مع اللغة المختارة)
    const line3El = document.getElementById('seo-line-3');
    if (line3El) {
        const calcSel = document.getElementById('calc-method');
        const asrSel  = document.getElementById('asr-method');
        const calcKey = calcSel ? calcSel.value : 'Makkah';
        const asrKey  = asrSel  ? asrSel.value  : 'Shafi';
        const calcLabel = t('method.' + calcKey);
        const asrLabel  = t('asr.' + asrKey);
        line3El.innerHTML = t('seo.line_3_method', {
            city: `<strong>${city}</strong>`,
            method: `<strong>${calcLabel}</strong>`,
            asr: `<strong>${asrLabel}</strong>`,
        });
    }
}

function updateActivePrayer() {
    if (!currentPrayerTimes) return;

    const next = PrayerTimes.getNextPrayer(currentPrayerTimes, currentTimezone);
    // 🆕 null-guard: #next-prayer-name مقصوص على صفحة time-left (DOM pruner)
    const _npnEl2 = document.getElementById('next-prayer-name');
    if (_npnEl2) _npnEl2.textContent = (typeof t === 'function') ? t('prayer.' + next.key) : next.name;

    // Round 22: تحديث البطاقة النشطة + الحاليّة
    const curr = (typeof PrayerTimes.getCurrentPrayer === 'function')
        ? PrayerTimes.getCurrentPrayer(currentPrayerTimes, currentTimezone)
        : null;
    // R23 polish: إن كان الوقت بعد الشروق وقبل الظهر → لا نُعلِّم أيّ بطاقة كـ current
    //            (الشروق ليس صلاة مفروضة)
    const _isSunrisePseudo = curr && curr.key === 'sunrise' && curr.afterSunrise;
    // 🆕 Round 3.1 — Prayer State System: past + upcoming
    const _PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const _nextIdx = next ? _PRAYER_ORDER.indexOf(next.key) : -1;
    document.querySelectorAll('.prayer-card').forEach(card => {
        card.classList.remove('active', 'current', 'past', 'upcoming');
        const cardIdx = _PRAYER_ORDER.indexOf(card.dataset.prayer);
        if (cardIdx === -1) return;
        if (card.dataset.prayer === next.key) { card.classList.add('active'); return; }
        if (curr && !_isSunrisePseudo && card.dataset.prayer === curr.key) { card.classList.add('current'); return; }
        // past vs upcoming — قبل الفجر كلّ الصلوات السابقة تُعدّ past
        if (_nextIdx === 0 /* next=fajr */ && cardIdx !== 0) {
            card.classList.add('past');
        } else if (_nextIdx > 0 && cardIdx < _nextIdx) {
            card.classList.add('past');
        } else if (_nextIdx >= 0 && cardIdx > _nextIdx) {
            card.classList.add('upcoming');
        }
    });

    // Round 22: Hero Banner — pill الصلاة الحاليّة
    // R23 polish: في نافذة ما بعد الشروق نُخفي pill "نحن الآن في وقت" (ليس وقت صلاة)
    try {
        const bcpWrap = document.getElementById('banner-current-prayer');
        const bcpName = document.getElementById('banner-current-prayer-name');
        if (bcpWrap && bcpName && curr && !_isSunrisePseudo) {
            const localName = (typeof t === 'function') ? t('prayer.' + curr.key) : curr.name;
            bcpName.textContent = localName;
            bcpWrap.hidden = false;
        } else if (bcpWrap) {
            bcpWrap.hidden = true;
        }
    } catch (_e) {}

    // Round 22 + R23 polish: Hero Banner — "ثمّ" الصلاة القادمة بعدها
    // ملاحظة: إن كان next.key === 'isha' فإنّ الصلاة التي تليها هي فجر الغد،
    // لذا نُخفي السطر لتجنّب عرض وقت فجر اليوم الحاليّ (الذي مضى) كـ"القادمة بعد العشاء".
    try {
        const btWrap = document.getElementById('banner-then-prayer');
        const btName = document.getElementById('banner-then-prayer-name');
        const btTime = document.getElementById('banner-then-prayer-time');
        if (btWrap && btName && btTime && next && next.key) {
            // نخفي السطر عند العشاء (الفجر القادم غداً، ولا نملك قيمة الغد بسهولة)
            if (next.key === 'isha') {
                btWrap.hidden = true;
            } else {
                const nextAfter = _getNextAfter(next.key);
                if (nextAfter && currentPrayerTimes[nextAfter] && nextAfter !== 'fajr') {
                    btName.textContent = (typeof t === 'function') ? t('prayer.' + nextAfter) : nextAfter;
                    btTime.textContent = currentPrayerTimes[nextAfter];
                    btWrap.hidden = false;
                } else {
                    btWrap.hidden = true;
                }
            }
        }
    } catch (_e) {}

    try { updatePrayerCardsSEO(); } catch (_e) {}
}

/**
 * Round 22 helper: يُرجع key الصلاة التي تأتي بعد الـ currentKey في التسلسل.
 * التسلسل: fajr → sunrise → dhuhr → asr → maghrib → isha → (fajr غد)
 * نتجاهل sunrise لأنّه ليس صلاة مكتوبة.
 */
function _getNextAfter(currentKey) {
    const seq = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    // نحن عند currentKey (= "next prayer"). ما يأتي بعده؟
    let idx = seq.indexOf(currentKey);
    if (currentKey === 'sunrise') idx = seq.indexOf('fajr'); // بعد sunrise التالية هي dhuhr
    if (idx < 0) return null;
    const nextIdx = idx + 1;
    if (nextIdx < seq.length) return seq[nextIdx];
    return 'fajr'; // بعد العشاء → فجر الغد
}

/**
 * Round 22: Sticky Next-Prayer Bar — يُحدَّث كلّ ثانية من updateCountdown().
 * مع IntersectionObserver على البانر الأخضر — يظهر عند اختفاء البانر من viewport.
 */
function updateStickyBar(countdownStr) {
    const inner     = document.querySelector('#sticky-next-bar .snb-inner');
    const remaining = document.getElementById('snb-remaining');
    const prayer    = document.getElementById('snb-prayer-name');
    const cityEl    = document.getElementById('snb-city');
    if (!remaining) return;

    // 🆕 Round 3.1 — حالة «حان الآن»: countdownStr === "00:00:00" تعني الأذان دُقّ هذه الثانية
    if (inner) {
        const _isNowTime = (countdownStr === '00:00:00');
        inner.classList.toggle('snb-now', _isNowTime);
    }

    if (countdownStr) remaining.textContent = countdownStr;

    // اسم الصلاة القادمة + المدينة
    if (currentPrayerTimes && typeof PrayerTimes !== 'undefined' && PrayerTimes.getNextPrayer) {
        try {
            const next = PrayerTimes.getNextPrayer(currentPrayerTimes, currentTimezone);
            if (prayer && next) {
                prayer.textContent = (typeof t === 'function') ? t('prayer.' + next.key) : next.name;
            }
        } catch (_e) {}
    }
    if (cityEl) {
        try { cityEl.textContent = getCurrentCityLabel() || ''; } catch (_e) {}
    }

    // 🆕 Round 4 (Minimal) — Sticky bar clickable → /time-left-until-prayer-in-{slug}
    try { updateStickyBarHref(); } catch (_e) {}
}

/**
 * 🆕 Round 4 (Minimal) — يُحدّث href الـsticky bar ليشير إلى صفحة time-left للمدينة الحاليّة.
 * يُستدعى من updateStickyBar() في كلّ تحديث. على time-left-page نفسها CSS يُعطّل الضغط.
 */
function updateStickyBarHref() {
    const bar = document.getElementById('sticky-next-bar');
    if (!bar || bar.tagName !== 'A') return;
    let slug = (typeof getSlugFromURL === 'function') ? getSlugFromURL() : '';
    // FIX: على الرئيسيّة (لا slug في URL) — استعمل المدينة الحاليّة (currentEnglishName)
    //   ⇒ إن لم تكن متاحة أو كانت loc-/hijri- ⇒ مكّة كافتراضي.
    if (!slug || /^hijri-|^loc-/.test(slug)) {
        if (currentEnglishName && currentLat != null && currentLng != null
            && typeof makeSlug === 'function') {
            try {
                const _s = makeSlug(currentEnglishName, currentLat, currentLng);
                if (_s && !/^loc-/.test(_s)) slug = _s;
            } catch (_) {}
        }
        if (!slug || /^hijri-|^loc-/.test(slug)) slug = 'mecca';
    }
    const lang = (typeof getCurrentLang === 'function' && getCurrentLang() !== 'ar') ? '/' + getCurrentLang() : '';
    bar.href = `${lang}/time-left-until-prayer-in-${slug}`;
}

/**
 * 🆕 Round 4 (Minimal) — يُحدّث محتويات /next-prayer-time-in-{city} page.
 * هدف الصفحة: Schedule Awareness — اسم الصلاة القادمة + وقتها + 3 صلوات تالية.
 * R-2: دائماً 3 صلوات (loop حتّى 12 step لضمان consistency).
 */
const _NPT_PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
function updateNextPrayerPage() {
    if (!document.documentElement.classList.contains('next-prayer-time-page')) return;
    if (!currentPrayerTimes || !currentPrayerTimes.raw) return;
    if (typeof PrayerTimes === 'undefined' || !PrayerTimes.getNextPrayer) return;

    const next = PrayerTimes.getNextPrayer(currentPrayerTimes, currentTimezone);
    if (!next) return;

    // اسم الصلاة القادمة
    const nameEl = document.getElementById('npt-next-name');
    if (nameEl) {
        nameEl.textContent = (typeof t === 'function') ? t('prayer.' + next.key) : (next.name || next.key);
    }
    // وقت الصلاة القادمة — currentPrayerTimes[key] نصّ منسَّق جاهز
    const timeEl = document.getElementById('npt-next-time');
    if (timeEl) {
        const formatted = currentPrayerTimes[next.key];
        timeEl.textContent = (formatted != null) ? String(formatted) : '—';
    }

    // اسم المدينة في H1
    const cityEl = document.getElementById('npt-h1-city');
    if (cityEl) {
        try {
            const label = (typeof getCurrentCityLabel === 'function') ? getCurrentCityLabel() : '';
            if (label) cityEl.textContent = label;
        } catch (_e) {}
    }

    // R-2: 3 صلوات قادمة (loop حتّى 12 step لضمان consistency حتّى لو wrap-around)
    const list = document.getElementById('npt-upcoming-list');
    if (list) {
        const startIdx = _NPT_PRAYER_ORDER.indexOf(next.key);
        const upcoming = [];
        if (startIdx >= 0) {
            for (let i = 1; i <= 12 && upcoming.length < 3; i++) {
                const key = _NPT_PRAYER_ORDER[(startIdx + i) % _NPT_PRAYER_ORDER.length];
                if (!key || key === 'sunrise') continue;  // sunrise ليست صلاة
                if (upcoming.some(u => u.key === key)) continue;  // تجنّب duplicate
                const formatted = currentPrayerTimes[key];
                if (formatted == null) continue;
                upcoming.push({ key, time: formatted });
            }
        }
        list.innerHTML = upcoming.map(u => {
            const name = (typeof t === 'function') ? t('prayer.' + u.key) : u.key;
            // escape basic — _esc أسفل القيم من currentPrayerTimes (مُولّد داخلياً، آمن)
            return `<li><span class="npt-up-name">${name}</span><span class="npt-up-time">${u.time}</span></li>`;
        }).join('');
    }

    // 🆕 NPT Single-purpose: CTA + secondary link + SEO paragraph
    //    نفس نمط TL — {loc}/{prayer}/{city} تُستبدَل بالقيم الفعليّة بلغة المستخدم.
    const _nptMatch = window.location.pathname.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?next-prayer-time-in-([a-z][a-z0-9-]+)$/);
    if (_nptMatch) {
        const _nptSlug = _nptMatch[1];
        const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const _langPfx = (_lng === 'ar') ? '' : ('/' + _lng);
        const _city = (typeof getDisplayCity === 'function') ? getDisplayCity() : _nptSlug;
        const _prayer = (typeof t === 'function') ? t('prayer.' + next.key) : (next.name || next.key);

        // Primary CTA → /prayer-times-in-{slug}
        const _cta = document.getElementById('npt-cta');
        if (_cta) {
            if (!_cta.dataset.wired) {
                _cta.href = _langPfx + '/prayer-times-in-' + _nptSlug;
                _cta.dataset.wired = '1';
            }
            const _ctaTxt = document.getElementById('npt-cta-text');
            if (_ctaTxt && _ctaTxt.textContent.includes('{loc}')) {
                _ctaTxt.textContent = _ctaTxt.textContent.replace('{loc}', _city);
            }
        }

        // Secondary link → /time-left-until-prayer-in-{slug}
        const _sec = document.getElementById('npt-secondary');
        if (_sec) {
            if (!_sec.dataset.wired) {
                _sec.href = _langPfx + '/time-left-until-prayer-in-' + _nptSlug;
                _sec.dataset.wired = '1';
            }
            // استبدل {prayer} و {city} في نصّ الرابط (يتجدّد عند تغيّر الصلاة)
            if (_sec.dataset.lastPrayer !== next.key) {
                const _tpl = (typeof t === 'function') ? t('npt.how_long') : 'Time left until {prayer} in {city}?';
                _sec.textContent = String(_tpl)
                    .replace('{prayer}', _prayer)
                    .replace('{city}', _city);
                _sec.dataset.lastPrayer = next.key;
            }
        }

        // SEO paragraph (refresh عند تغيّر الصلاة للكتابة الحيويّة)
        const _seo = document.getElementById('npt-seo');
        if (_seo && _seo.dataset.lastCity !== _city) {
            const _seoTpl = (typeof t === 'function') ? t('npt.seo') : '';
            if (_seoTpl) {
                _seo.textContent = String(_seoTpl)
                    .replace('{prayer}', _prayer)
                    .replace('{city}', _city);
                _seo.dataset.lastCity = _city;
            }
        }
    }
}

function initStickyNextBar() {
    const bar = document.getElementById('sticky-next-bar');
    if (!bar || typeof IntersectionObserver === 'undefined') return;
    // FIX: حدّث href فوراً (لا تنتظر updateCountdown) — يحلّ مشكلة "لا يعمل في الرئيسيّة"
    try { updateStickyBarHref(); } catch (_) {}
    // FIX: click handler احتياطيّ — لو href ما زال "#" أو فارغاً، نَنتقل برمجياً للمدينة الحاليّة
    if (!bar.dataset.fallbackWired) {
        bar.dataset.fallbackWired = '1';
        bar.addEventListener('click', function(e) {
            try {
                // إعادة الحساب الآن (currentEnglishName قد يكون متاحاً الآن)
                updateStickyBarHref();
                const _href = bar.getAttribute('href') || '';
                if (!_href || _href === '#') {
                    e.preventDefault();
                    // fallback نهائيّ: مكّة
                    const _lng = (typeof getCurrentLang === 'function' && getCurrentLang() !== 'ar')
                        ? '/' + getCurrentLang() : '';
                    window.location.href = _lng + '/time-left-until-prayer-in-mecca';
                }
            } catch (_) {}
        });
    }
    // 🆕 Round 3.1 — اختيار pivot ذكيّ: homepage → .next-prayer-banner، city-page → #location-hero (was .city-hero-answer)
    // R34: city-hero-answer removed; #location-hero now serves as the city-page hero pivot
    const isCity = document.documentElement.classList.contains('city-page');
    const pivot = isCity
        ? document.querySelector('#location-hero, .city-hero-answer')
        : document.querySelector('.next-prayer-banner');
    if (!pivot) return;
    // لا نُظهر الـ Sticky Bar إلا بعد التمرير تحت الـpivot.
    // R23 fix: نُضيف .has-sticky-bar على body → CSS يُخفي .top-header لتجنّب التداخل.
    // R24 fix: نتأكّد أنّ الـpivot داخل صفحة نشطة قبل إظهار الشريط — وإلا الشريط يظلّ ظاهراً
    // عند التنقّل (SPA) إلى صفحة لا تحتوي pivot (مثل صفحات التاريخ الهجري).
    const _pivotPageActive = () => {
        const pg = pivot.closest('.page');
        return !pg || pg.classList.contains('active');
    };
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting || !_pivotPageActive()) {
                bar.classList.remove('snb-visible');
                document.body.classList.remove('has-sticky-bar');
            } else {
                // ظهر فقط إن نزلنا أسفل الـpivot (ليس عند الصعود قبله)
                if (window.scrollY > 60) {
                    bar.classList.add('snb-visible');
                    document.body.classList.add('has-sticky-bar');
                }
            }
        });
    }, { rootMargin: '-50px 0px 0px 0px', threshold: 0 });
    io.observe(pivot);
}

// 🆕 Round 3.1 — Progress Bar: يُحدِّث عرض الشريط داخل .prayer-card.current
// يُستدعى من updateCountdown() مرّة كلّ 60 ثانية (ليس كلّ ثانية)
// ملاحظة: startSeconds هي seconds-of-day (0–86400) بتوقيت المدينة، وليست epoch.
// getNextPrayer لا يُرجع startSeconds — نحسبه من times.raw[key].
function updatePrayerProgress() {
    if (!currentPrayerTimes || !currentPrayerTimes.raw) return;
    if (!PrayerTimes || typeof PrayerTimes.getCurrentPrayer !== 'function') return;
    const curr = PrayerTimes.getCurrentPrayer(currentPrayerTimes, currentTimezone);
    if (!curr || curr.afterSunrise || curr.notAPrayer) return;
    // R36 fix: keep updating progress when curr.beforeFajr=true AND curr.key='isha'.
    // That state means "after Isha, before tomorrow's Fajr" — Isha is still the active
    // prayer and its progress (toward next Fajr) should keep filling overnight.
    // The wrap-around math below already handles startSeconds > nextStartSec.
    if (curr.beforeFajr && curr.key !== 'isha') return;
    if (typeof curr.startSeconds !== 'number') return;
    const next = PrayerTimes.getNextPrayer(currentPrayerTimes, currentTimezone);
    if (!next || !next.key) return;
    const rawNext = currentPrayerTimes.raw[next.key];
    if (typeof rawNext !== 'number') return;

    // seconds-of-day في توقيت المدينة (نفس منطق getCurrentPrayer)
    const nowDate = new Date();
    const localOffset = -nowDate.getTimezoneOffset() / 60;
    const tz = (typeof currentTimezone === 'number' && !isNaN(currentTimezone)) ? currentTimezone : localOffset;
    const cityTime = new Date(nowDate.getTime() + (tz - localOffset) * 3600000);
    const currentSecOfDay = cityTime.getHours() * 3600 + cityTime.getMinutes() * 60 + cityTime.getSeconds();

    // next startSeconds (seconds-of-day) — مع إضافة 86400 إذا كان فجر الغد
    let nextStartSec = Math.floor(((rawNext % 24) + 24) % 24 * 3600);
    if (nextStartSec <= curr.startSeconds) nextStartSec += 86400; // فجر الغد بعد العشاء

    const elapsed = currentSecOfDay >= curr.startSeconds
        ? currentSecOfDay - curr.startSeconds
        : currentSecOfDay + 86400 - curr.startSeconds; // fallback لو عبرنا منتصف الليل
    const total = nextStartSec - curr.startSeconds;
    if (total <= 0) return; // حماية من division-by-zero
    const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));

    const fill = document.querySelector(`.prayer-card[data-prayer="${curr.key}"] .prayer-progress-fill`);
    if (fill) fill.style.width = pct.toFixed(1) + '%';
}

// 🆕 Round 3.1 — Auto-scroll إلى .prayer-card.active/.current (city-page فقط، مرّة واحدة)
let _autoScrollDone = false;

// إذا المستخدم بدأ scroll قبل ما نطلق الـauto-scroll، نُلغي العمليّة فوراً
(function _armAutoScrollGuard() {
    try {
        window.addEventListener('scroll', () => {
            try { sessionStorage.setItem('tp_no_autoscroll', '1'); } catch (_e) {}
        }, { once: true, passive: true });
    } catch (_e) {}
})();

function autoScrollToActivePrayer() {
    if (_autoScrollDone) return;
    if (!document.documentElement.classList.contains('city-page')) return;
    if (window.scrollY > 10) return;
    if (window.location.hash) return;
    try {
        if (sessionStorage.getItem('tp_no_autoscroll')) return;
    } catch (_e) {}
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = document.querySelector('.prayer-card.current')
                || document.querySelector('.prayer-card.active');
    if (!target) return;
    _autoScrollDone = true;
    setTimeout(() => {
        // فحص ثاني قبل الـscroll فعلياً — user قد يكون تفاعل بين now + 500ms
        try { if (sessionStorage.getItem('tp_no_autoscroll')) return; } catch (_e) {}
        try {
            target.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                block: 'center'
            });
        } catch (_e) {}
    }, 500);
}

// 🆕 Round 3.1 — Smart CTA: القفز إلى البطاقة القادمة مع offset للـheader + sticky bar
function jumpToActivePrayer() {
    const tgt = document.querySelector('.prayer-card.active')
             || document.querySelector('.prayer-card.current');
    if (!tgt) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const y = tgt.getBoundingClientRect().top + window.scrollY - 120; // 120px = top-header + sticky-bar
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}

// 🆕 Round 3.1 — Smart Notification Suggestion
const _NOTIF_STORAGE_KEY = 'tp_notif';
let _notifTimer = null;

function maybeShowNotifPrompt() {
    // الشروط:
    // 1) فقط على city-page (تقليل noise على homepage)
    // 2) Notification API مدعوم
    // 3) لم يُقرَّر قبلاً (لا 'on' ولا 'dismissed')
    // 4) permission ليس مرفوضاً مسبقاً من المتصفّح
    if (!document.documentElement.classList.contains('city-page')) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'denied') return;
    if (Notification.permission === 'granted') {
        try { localStorage.setItem(_NOTIF_STORAGE_KEY, 'on'); } catch (_e) {}
        schedulePrayerNotif();
        return;
    }
    let state = null;
    try { state = localStorage.getItem(_NOTIF_STORAGE_KEY); } catch (_e) {}
    if (state === 'dismissed' || state === 'on') return;
    setTimeout(() => {
        const el = document.getElementById('notif-prompt');
        if (el) el.hidden = false;
    }, 10000);
}

function onNotifEnable() {
    const el = document.getElementById('notif-prompt');
    if (el) el.hidden = true;
    try {
        const p = Notification.requestPermission();
        const _handle = (perm) => {
            if (perm === 'granted') {
                try { localStorage.setItem(_NOTIF_STORAGE_KEY, 'on'); } catch (_e) {}
                schedulePrayerNotif();
            } else {
                try { localStorage.setItem(_NOTIF_STORAGE_KEY, 'dismissed'); } catch (_e) {}
            }
        };
        if (p && typeof p.then === 'function') p.then(_handle).catch(() => {
            try { localStorage.setItem(_NOTIF_STORAGE_KEY, 'dismissed'); } catch (_e) {}
        });
        else _handle(p);
    } catch (_e) {
        try { localStorage.setItem(_NOTIF_STORAGE_KEY, 'dismissed'); } catch (_e2) {}
    }
}

function onNotifDismiss() {
    const el = document.getElementById('notif-prompt');
    if (el) el.hidden = true;
    try { localStorage.setItem(_NOTIF_STORAGE_KEY, 'dismissed'); } catch (_e) {}
}

function _fireNotif(next) {
    // guard ضدّ إطلاق notification من tab مخفيّ
    if (document.visibilityState !== 'visible') return;
    try {
        const localName = (typeof t === 'function') ? t('prayer.' + next.key) : next.name;
        const city = (typeof getCurrentCityLabel === 'function') ? (getCurrentCityLabel() || '') : '';
        let body;
        if (typeof t === 'function') {
            const raw = t('notif.before_10_body') || '';
            body = raw.replace('{prayer}', localName).replace('{city}', city);
        } else {
            body = `${localName} in ${city} — in 10 minutes`;
        }
        new Notification('🕌 ' + localName, { body, tag: 'tp-prayer-notif' });
    } catch (_e) {}
}

function schedulePrayerNotif() {
    if (_notifTimer) { clearTimeout(_notifTimer); _notifTimer = null; }
    if (!currentPrayerTimes) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    if (!PrayerTimes || typeof PrayerTimes.getNextPrayer !== 'function') return;
    const next = PrayerTimes.getNextPrayer(currentPrayerTimes, currentTimezone);
    if (!next || typeof next.remainingMinutes !== 'number') return;

    // Smart trigger: إذا المتبقّي ≤ 10 دقائق → أطلق فوراً (لا ننتظر event فات)
    if (next.remainingMinutes <= 10) {
        _fireNotif(next);
        // جدولة للصلاة التاليّة بعد انقضاء هذه (remainingMinutes + 1min buffer)
        _notifTimer = setTimeout(schedulePrayerNotif, (next.remainingMinutes + 1) * 60 * 1000);
        return;
    }
    // المعتاد: قبل 10 دقائق من دخول الصلاة
    const _delaySec = (next.remainingMinutes - 10) * 60;
    _notifTimer = setTimeout(() => {
        _fireNotif(next);
        setTimeout(schedulePrayerNotif, 60 * 1000);
    }, _delaySec * 1000);
}

/**
 * Round 22: Ramadan Countdown Badge على الصفحة الرئيسيّة
 * - يحسب الأيّام المتبقّية حتّى 1 رمضان (شهر 9 هجريّ، يوم 1)
 * - يُعرض فقط إن كان ≤ 180 يوم (seasonal signal)
 * - يرتبط بصفحة /ramadan-countdown الموجودة سلفاً
 */
function initRamadanBadge() {
    const badge = document.getElementById('event-countdown-badge');
    const daysEl = document.getElementById('ecb-days');
    if (!badge || !daysEl) return;
    if (typeof HijriDate === 'undefined' || !HijriDate.toGregorian || !HijriDate.getToday) return;

    try {
        const _hToday = HijriDate.getToday();
        let hYear = _hToday.year;
        // إن كنّا بعد 1 رمضان هذا العام → احسب السنة القادمة
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        let ramGreg = _toDate(HijriDate.toGregorian(hYear, 9, 1));
        if (ramGreg && ramGreg < todayStart) {
            hYear += 1;
            ramGreg = _toDate(HijriDate.toGregorian(hYear, 9, 1));
        }
        if (!ramGreg) return;

        const diffDays = Math.round((ramGreg - todayStart) / 86400000);
        if (diffDays < 0) return;
        if (diffDays > 180) return; // خارج موسم الاهتمام

        const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        // نصّ العدّ: "142 يوم" / "142 days"
        const dayWord = (typeof t === 'function') ? t('countdown.days_suffix') : 'يوم';
        daysEl.textContent = diffDays + ' ' + (dayWord || 'يوم');

        // أضف lang prefix للرابط
        try {
            const prefix = (typeof _langPrefix === 'function') ? _langPrefix(lang) : '';
            badge.setAttribute('href', (prefix || '') + '/ramadan-countdown');
        } catch (_e) {}

        badge.hidden = false;

        // SEO title
        try {
            const cityLabel = getCurrentCityLabel();
            const titleAr = `باقي على رمضان ${diffDays} يوم — اعرض العدّاد التفصيليّ${cityLabel ? ' في ' + cityLabel : ''}`;
            const titleEn = `${diffDays} days until Ramadan — open full countdown${cityLabel ? ' in ' + cityLabel : ''}`;
            badge.setAttribute('title', lang === 'ar' ? titleAr : titleEn);
            badge.setAttribute('aria-label', lang === 'ar' ? titleAr : titleEn);
        } catch (_e) {}
    } catch (_e) {
        // silent
    }

    // helper
    function _toDate(g) {
        if (!g) return null;
        if (g instanceof Date) return g;
        if (typeof g.year === 'number') {
            const d = new Date(g.year, (g.month || 1) - 1, g.day || 1);
            d.setHours(0, 0, 0, 0);
            return d;
        }
        return null;
    }
}

/**
 * يُرجع اسم المدينة الحاليّة (Ar أو localized) — fallback helper (Round 21).
 * يعتمد على المتغيّرات العامّة: currentCity (Ar), currentLocalizedName (localized).
 */
function getCurrentCityLabel() {
    const _ln = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    if (_ln === 'ar') return (typeof currentCity !== 'undefined' && currentCity) ? currentCity : '';
    // للّغات الأخرى: جرّب localized name أوّلاً ثم map ثم English
    if (typeof currentLocalizedName !== 'undefined' && currentLocalizedName) return currentLocalizedName;
    try {
        const cityMap = (typeof _LOCALIZED_CITY_MAPS !== 'undefined') ? _LOCALIZED_CITY_MAPS[_ln] : null;
        const enName = (typeof currentEnglishName !== 'undefined') ? currentEnglishName : '';
        if (cityMap && enName && cityMap[enName]) return cityMap[enName];
        return enName || (typeof currentCity !== 'undefined' ? currentCity : '');
    } catch (_e) {
        return (typeof currentCity !== 'undefined') ? currentCity : '';
    }
}

/**
 * SEO Layering لبطاقات الصلوات (Round 21).
 * يضيف title + aria-label ديناميكيّاً بصيغة: "موعد صلاة {الصلاة} اليوم في {المدينة}".
 * المستخدم يرى فقط الاسم المختصر ("الفجر")، لكنّ Google يرى الجملة الكاملة.
 */
function updatePrayerCardsSEO() {
    const cityLabel = getCurrentCityLabel();
    if (!cityLabel) return;
    const _ln = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    document.querySelectorAll('.prayer-card').forEach(card => {
        const key = card.dataset.prayer;
        if (!key) return;
        const prayerName = (typeof t === 'function') ? t('prayer.' + key) : key;
        // 🆕 Round 8c (Loc cleanup): 10-lang templates (was: AR + EN-fallback for 8)
        const _prayerTitleByLang = {
            ar: `موعد صلاة ${prayerName} اليوم في ${cityLabel}`,
            en: `${prayerName} prayer time today in ${cityLabel}`,
            fr: `Horaire de la prière ${prayerName} aujourd'hui à ${cityLabel}`,
            tr: `${cityLabel} için bugünün ${prayerName} namaz vakti`,
            ur: `${cityLabel} میں آج ${prayerName} کی نماز کا وقت`,
            de: `${prayerName} Gebetszeit heute in ${cityLabel}`,
            id: `Waktu sholat ${prayerName} hari ini di ${cityLabel}`,
            es: `Hora de oración ${prayerName} hoy en ${cityLabel}`,
            bn: `${cityLabel} এ আজকের ${prayerName} নামাজের সময়`,
            ms: `Waktu solat ${prayerName} hari ini di ${cityLabel}`
        };
        const title = _prayerTitleByLang[_ln] || _prayerTitleByLang.en;
        card.setAttribute('title', title);
        card.setAttribute('aria-label', title);
    });

    // Weekly button → title ديناميكيّ (🆕 Round 8c: 10-lang)
    const wb = document.querySelector('.weekly-expand-btn');
    if (wb) {
        const _weeklyByLang = {
            ar: `جدول مواقيت الصلاة الأسبوعيّ في ${cityLabel}`,
            en: `Weekly prayer times schedule in ${cityLabel}`,
            fr: `Horaires de prière hebdomadaires à ${cityLabel}`,
            tr: `${cityLabel} için haftalık namaz vakitleri`,
            ur: `${cityLabel} میں ہفتہ وار اوقاتِ نماز`,
            de: `Wöchentliche Gebetszeiten in ${cityLabel}`,
            id: `Jadwal sholat mingguan di ${cityLabel}`,
            es: `Horarios semanales de oración en ${cityLabel}`,
            bn: `${cityLabel} এ সাপ্তাহিক নামাজের সময়সূচি`,
            ms: `Jadual waktu solat mingguan di ${cityLabel}`
        };
        wb.setAttribute('title', _weeklyByLang[_ln] || _weeklyByLang.en);
    }

    // Moon CTA → title ديناميكيّ (🆕 Round 8c: 10-lang)
    const mtc = document.getElementById('mtc-cta');
    if (mtc) {
        const _moonCtaByLang = {
            ar: `حالة القمر اليوم في ${cityLabel} — الطور والنسبة والعمر`,
            en: `Moon status today in ${cityLabel}`,
            fr: `État de la Lune aujourd'hui à ${cityLabel}`,
            tr: `${cityLabel} için bugün ay durumu`,
            ur: `${cityLabel} میں آج چاند کی حالت`,
            de: `Mondstatus heute in ${cityLabel}`,
            id: `Status bulan hari ini di ${cityLabel}`,
            es: `Estado de la Luna hoy en ${cityLabel}`,
            bn: `${cityLabel} এ আজকের চাঁদের অবস্থা`,
            ms: `Status bulan hari ini di ${cityLabel}`
        };
        mtc.setAttribute('title', _moonCtaByLang[_ln] || _moonCtaByLang.en);
    }

    // Hero tagline → H1 ديناميكيّ يحوي اسم المدينة + التاريخ (Round 21 → R23: 10 langs)
    // R34: renamed from h2.loc-hero-tagline → h1.loc-hero-title (persuasive-landing refactor)
    const tagline = document.querySelector('.loc-hero-title, .loc-hero-tagline');
    if (tagline) {
        const _taglineByLang = {
            ar: `مواقيت الصلاة اليوم في ${cityLabel} والتاريخ الهجريّ والميلاديّ`,
            en: `Prayer Times Today in ${cityLabel} — Hijri & Gregorian Date`,
            fr: `Horaires de prière aujourd'hui à ${cityLabel} — Date hégirienne et grégorienne`,
            tr: `${cityLabel} İçin Bugünün Namaz Vakitleri — Hicri ve Miladi Tarih`,
            ur: `آج ${cityLabel} میں اوقاتِ نماز — ہجری و عیسوی تاریخ`,
            de: `Gebetszeiten heute in ${cityLabel} — Hidschri- und gregorianisches Datum`,
            id: `Jadwal Sholat Hari Ini di ${cityLabel} — Tanggal Hijriah & Masehi`,
            es: `Horarios de oración hoy en ${cityLabel} — Fecha hijri y gregoriana`,
            bn: `আজকের নামাজের সময়সূচি ${cityLabel} — হিজরি ও গ্রেগরিয়ান তারিখ`,
            ms: `Waktu Solat Hari Ini di ${cityLabel} — Tarikh Hijrah & Masihi`
        };
        tagline.textContent = _taglineByLang[_ln] || _taglineByLang.en;
    }
}

/**
 * SEO Static — يُطبّق titles لروابط Countries و Popular Cities (Round 21).
 * تلك العناصر تحوي نصّاً كاملاً بالفعل ("مواقيت الصلاة في X")، لكنّ إضافة title
 * يعطي tooltip + يُعزّز الإشارة لـ crawlers.
 */
function applyStaticLinkTitlesSEO() {
    // Country tiles
    document.querySelectorAll('.country-tile').forEach(a => {
        if (a.getAttribute('title')) return; // لا تُعد الكتابة لو ضُبط يدوياً
        const txt = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (txt) {
            a.setAttribute('title', txt);
            if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', txt);
        }
    });
    // Popular cities in footer
    document.querySelectorAll('.popular-cities-grid a').forEach(a => {
        if (a.getAttribute('title')) return;
        const txt = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (txt) {
            a.setAttribute('title', txt);
            if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', txt);
        }
    });
}

// ========= الأذان الصوتي =========

// ===== شريط تقدم الأذان =====
function showAdhanProgress() {
    const audio = document.getElementById('adhan-audio');
    const wrap  = document.getElementById('adhan-progress-wrap');
    const fill  = document.getElementById('adhan-progress-fill');
    if (!audio || !wrap || !fill) return;

    fill.style.width = '0%';
    fill.classList.remove('adhan-progress-pulse');
    wrap.style.display = 'block';

    if (adhanProgressRAF) cancelAnimationFrame(adhanProgressRAF);

    if (isFinite(audio.duration) && audio.duration > 0) {
        // المدة متاحة — ابدأ الـ RAF مباشرة
        adhanProgressRAF = requestAnimationFrame(tickAdhanProgress);
    } else {
        // انتظر حتى تصبح المدة متاحة
        fill.classList.add('adhan-progress-pulse');
        audio.addEventListener('durationchange', function onDur() {
            if (!isFinite(audio.duration) || audio.duration <= 0) return;
            audio.removeEventListener('durationchange', onDur);
            fill.classList.remove('adhan-progress-pulse');
            fill.style.width = '0%';
            if (adhanProgressRAF) cancelAnimationFrame(adhanProgressRAF);
            adhanProgressRAF = requestAnimationFrame(tickAdhanProgress);
        });
    }
}

function hideAdhanProgress() {
    const wrap = document.getElementById('adhan-progress-wrap');
    if (wrap) wrap.style.display = 'none';
    if (adhanProgressRAF) { cancelAnimationFrame(adhanProgressRAF); adhanProgressRAF = null; }
}

function tickAdhanProgress() {
    const audio = document.getElementById('adhan-audio');
    const fill  = document.getElementById('adhan-progress-fill');
    if (!audio || !fill || audio.paused) return;  // فقط إذا توقف الصوت
    // تحديث العرض إذا كانت المدة متاحة وصحيحة
    if (audio.duration && isFinite(audio.duration)) {
        fill.style.width = ((audio.currentTime / audio.duration) * 100).toFixed(2) + '%';
    }
    adhanProgressRAF = requestAnimationFrame(tickAdhanProgress);
}

function initAdhanSettings() {
    const toggle = document.getElementById('adhan-toggle');
    if (!toggle) return;
    const saved = localStorage.getItem('adhan_enabled');
    // افتراضي: مفعّل (true) إلا إذا أوقفه المستخدم صراحةً
    toggle.checked = (saved !== 'false');
}

function onAdhanToggleChange() {
    const on = document.getElementById('adhan-toggle').checked;
    localStorage.setItem('adhan_enabled', on ? 'true' : 'false');
}

// ========= تحديث عناوين المدينة/الدولة بدون إعادة fetch =========
function updateCityInfoLabels() {
    const dispCountry = getDisplayCountry();
    const dispCity    = getDisplayCity();

    // اسم الدولة في قسم السكان
    const popName = document.getElementById('pop-country-name');
    if (popName) popName.textContent = dispCountry;

    // رابط بلوك الدولة
    const countryLinkEl = document.getElementById('country-block-link');
    if (countryLinkEl) {
        countryLinkEl.textContent = dispCountry;
        countryLinkEl.href = pageUrl(`/prayer-times-in-${makeCountrySlug(currentCountryCode, currentEnglishCountry)}`);
    }

    // عنوان قسم المدينة
    const cityTitleEl = document.getElementById('city-info-heading');
    if (cityTitleEl) cityTitleEl.textContent = `📍 ${dispCity}`;

    // نص pop-session-added
    const elSession = document.getElementById('pop-session-added');
    if (elSession) elSession.textContent = (typeof t === 'function') ? t('pop.live') : 'تابع التحديث المباشر';
}

// ========= تغيير اللغة — إعادة رسم المحتوى الديناميكي =========
function onLanguageChange(lang) {
    updateSidebar();
    updateCityDisplay();
    if (currentPrayerTimes) {
        updatePrayerTimes();
        updateActivePrayer();
        updateFaqSection();
        updateSeoSection();
    }
    updateCityInfoLabels();
    updateCountryCitiesSection();
    if (_cachedNearbyPlaces.length > 0) renderNearbyGrid(_cachedNearbyPlaces);
    renderCalendar();
    updateHijriToday();
    updateConverterSelects();
    initScheduleDatePicker();
    if (currentPrayerTimes) renderPrayerSchedule(scheduleDays, scheduleStartDate);
}

// إعادة ملء قوائم محوّل التاريخ بعد تغيير اللغة — مع ترقيم الأشهر
function updateConverterSelects() {
    const gSelect = document.getElementById('conv-g-month');
    if (gSelect) {
        const curG = gSelect.value;
        gSelect.innerHTML = '';
        HijriDate.gregorianMonths.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i + 1;
            opt.textContent = `${i + 1} - ${m}`;
            gSelect.appendChild(opt);
        });
        gSelect.value = curG;
    }
    const hSelect = document.getElementById('conv-h-month');
    if (hSelect) {
        const curH = hSelect.value;
        hSelect.innerHTML = '';
        HijriDate.hijriMonths.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i + 1;
            opt.textContent = `${i + 1} - ${m}`;
            hSelect.appendChild(opt);
        });
        hSelect.value = curH;
    }
}

// فتح بوب آب الأذان وتشغيل الصوت إذا كان مفعلاً
function showAdhanPopup(prayerName, cityName) {
    const popup   = document.getElementById('adhan-popup');
    const nameEl  = document.getElementById('adhan-popup-prayer-name');
    const cityEl  = document.getElementById('adhan-popup-city');
    if (!popup) return;

    if (nameEl) nameEl.textContent = prayerName  || 'الصلاة';
    if (cityEl) cityEl.textContent = cityName    || getDisplayCity();

    popup.style.display = 'flex';

    const enabled = localStorage.getItem('adhan_enabled') !== 'false';
    if (!enabled) return; // عرض البوب آب بدون صوت

    const audio = document.getElementById('adhan-audio');
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = 1;
    audio.play()
        .then(() => { showAdhanProgress(); })
        .catch(() => {});
}

// إغلاق البوب آب وإيقاف الصوت
function closeAdhanPopup() {
    const popup = document.getElementById('adhan-popup');
    if (popup) popup.style.display = 'none';

    const audio = document.getElementById('adhan-audio');
    if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
    }
    hideAdhanProgress();
}

// تشغيل الأذان تلقائياً عند حلول وقت الصلاة
function playAdhan() {
    const name = (typeof t === 'function') ? t('prayer.' + lastAzanPrayer) : lastAzanPrayer || 'الصلاة';
    showAdhanPopup(name, getDisplayCity());
}

// زر التجربة في الإعدادات — يفتح البوب آب ويُشغِّل الصوت دائماً بصرف النظر عن الإعداد
function testAdhan() {
    const audio = document.getElementById('adhan-audio');
    const popup = document.getElementById('adhan-popup');
    if (!audio) return;

    // إذا كان الصوت يعمل بالفعل (البوب آب مفتوح) → أغلق
    if (popup && popup.style.display !== 'none') {
        closeAdhanPopup();
        return;
    }

    // افتح البوب آب وشغّل الصوت (بغض النظر عن حالة المفتاح)
    const nameEl = document.getElementById('adhan-popup-prayer-name');
    const cityEl = document.getElementById('adhan-popup-city');
    if (nameEl) nameEl.textContent = (typeof t === 'function') ? t('prayer.fajr') : 'الفجر';
    if (cityEl) cityEl.textContent = getDisplayCity();
    if (popup)  popup.style.display = 'flex';

    audio.currentTime = 0;
    audio.volume = 1;
    audio.play()
        .then(() => { showAdhanProgress(); })
        .catch(() => {});
}

// إغلاق البوب آب تلقائياً عند انتهاء الصوت
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('adhan-audio');
    if (audio) {
        audio.addEventListener('ended', () => {
            hideAdhanProgress();
            // أبقِ البوب آب مفتوحاً ليرى المستخدم انتهاء الأذان — أو أغلقه تلقائياً:
            setTimeout(closeAdhanPopup, 1500);
        });
    }
});

// ========= العد التنازلي =========
function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    function updateCountdown() {
        const now = new Date();
        const pad = n => n < 10 ? '0' + n : '' + n;

        // حساب وقت المدينة المختارة بدلاً من الوقت المحلي للمتصفح
        const localOffset = -now.getTimezoneOffset() / 60;
        const cityOffsetMs = (currentTimezone - localOffset) * 3600000;
        const cityTime = new Date(now.getTime() + cityOffsetMs);

        const hh = cityTime.getHours();
        const mm = cityTime.getMinutes();
        const ss = cityTime.getSeconds();
        const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const useLatin = (_lng !== 'ar');
        const period = useLatin ? (hh >= 12 ? 'PM' : 'AM') : (hh >= 12 ? 'م' : 'ص');
        const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
        // CSS يفرض direction:ltr على العنصر. للغة العربية نضع ص/م أوّلاً في النصّ
        // حتى يقرأها المستخدم أخيراً (RTL): "04:11:24 ص" بدل "ص 04:11:24".
        const _timeStr = useLatin
            ? `${pad(h12)}:${pad(mm)}:${pad(ss)} ${period}`
            : `${period} ${pad(h12)}:${pad(mm)}:${pad(ss)}`;
        // 🆕 null-guards: البانر مقصوص على صفحة time-left (DOM pruner)
        const _ctEl = document.getElementById('current-time');
        if (_ctEl) _ctEl.textContent = _timeStr;

        // اسم المدينة في البانر
        const _bcnEl = document.getElementById('banner-city-name');
        if (_bcnEl) _bcnEl.textContent = getDisplayCity();

        // التاريخ الهجري والميلادي في البانر
        const hijri = HijriDate.getToday();
        const dayName = HijriDate.dayNames[cityTime.getDay()];
        const hijriMonthName = HijriDate.hijriMonths[hijri.month - 1];
        const hSfx = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
        const gSfx = (typeof t === 'function') ? t('date.greg_suffix') : ' م';
        const _bLng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const sep  = (_bLng === 'ar' || _bLng === 'ur') ? '، ' : ', ';
        const gMonths = HijriDate.gregorianMonths;
        const _bhdEl = document.getElementById('banner-hijri-date');
        if (_bhdEl) _bhdEl.textContent =
            `${dayName}${sep}${hijri.day} ${hijriMonthName} ${hijri.year}${hSfx}`;
        const _bgdEl = document.getElementById('banner-greg-date');
        if (_bgdEl) _bgdEl.textContent =
            `${dayName}${sep}${cityTime.getDate()} ${gMonths[cityTime.getMonth()]} ${cityTime.getFullYear()}${gSfx}`;

        // (التاريخ تحت الوقت تم حذفه حسب طلب المستخدم)

        if (!currentPrayerTimes) return;

        const next = PrayerTimes.getNextPrayer(currentPrayerTimes, currentTimezone);
        // 🆕 null-guard: #next-prayer-name مقصوص على صفحة time-left (DOM pruner)
        const _npnEl = document.getElementById('next-prayer-name');
        if (_npnEl) _npnEl.textContent = (typeof t === 'function') ? t('prayer.' + next.key) : next.name;

        // حساب العد التنازلي بالثواني (بتوقيت المدينة المختارة)
        const currentSeconds = cityTime.getHours() * 3600 + cityTime.getMinutes() * 60 + cityTime.getSeconds();
        const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
        let targetSeconds = -1;

        for (let prayer of prayers) {
            const raw = currentPrayerTimes.raw[prayer];
            const h = ((raw % 24) + 24) % 24;
            const pSec = Math.floor(h * 3600);
            if (pSec > currentSeconds) {
                targetSeconds = pSec;
                break;
            }
        }

        if (targetSeconds === -1) {
            // بعد العشاء - العد للفجر
            const fajrRaw = currentPrayerTimes.raw.fajr;
            const fh = ((fajrRaw % 24) + 24) % 24;
            targetSeconds = Math.floor(fh * 3600) + 86400;
        }

        let diff = targetSeconds - currentSeconds;
        if (diff < 0) diff += 86400;

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        const _countdownStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        // 🆕 null-guard: #next-prayer-countdown مقصوص على صفحة time-left (DOM pruner)
        const _npcEl = document.getElementById('next-prayer-countdown');
        if (_npcEl) _npcEl.textContent = _countdownStr;
        // Round 22: sync Sticky Bar countdown + prayer name
        try { updateStickyBar(_countdownStr); } catch (_e) {}
        // 🆕 Round 3.1: تحديث progress bar داخل .current كلّ 60 ثانية (تحديث سلس مع transition 1s)
        try { if ((diff % 60) === 0) updatePrayerProgress(); } catch (_e) {}
        // 🆕 Round 3.1: state boundary — عند تبدّل next.key نُعيد تطبيق past/current/active/upcoming
        try {
            if (next && next.key && next.key !== _lastNextKey) {
                _lastNextKey = next.key;
                updateActivePrayer();
                try { schedulePrayerNotif(); } catch (_e) {}
                // 🆕 NPT: حدّث صفحة next-prayer-time على انتقال الحدّ — حتّى يتبدّل اسم/وقت الصلاة والرابط الثانويّ
                try { updateNextPrayerPage(); } catch (_e) {}
            }
        } catch (_e) {}
        // Phase 2: sync City Hero Answer countdown
        try { if (typeof updateCityHeroCountdown === 'function') updateCityHeroCountdown(_countdownStr); } catch (_e) {}
        // Polish Round (B): sync City Summary Live tagline — اسم الصلاة + عدّاد طبيعيّ
        try {
            const _cslPrayer = document.getElementById('csl-prayer-name');
            const _cslCd     = document.getElementById('csl-countdown');
            if (_cslPrayer) {
                _cslPrayer.textContent = (typeof t === 'function') ? (t('prayer.' + next.key) || next.name) : next.name;
            }
            if (_cslCd) {
                // صياغة طبيعيّة: "14 دقيقة" / "1 ساعة و 23 دقيقة" / "45 ثانية"
                const _cslLng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                const _units = {
                    ar: { h: 'ساعة', m: 'دقيقة', s: 'ثانية', and: ' و ' },
                    en: { h: 'h', m: 'min', s: 'sec', and: ' ' },
                    fr: { h: 'h', m: 'min', s: 's', and: ' ' },
                    tr: { h: 'sa', m: 'dk', s: 'sn', and: ' ' },
                    ur: { h: 'گھنٹہ', m: 'منٹ', s: 'سیکنڈ', and: ' اور ' },
                    de: { h: 'Std', m: 'Min', s: 'Sek', and: ' ' },
                    id: { h: 'jam', m: 'menit', s: 'detik', and: ' ' },
                    es: { h: 'h', m: 'min', s: 's', and: ' ' },
                    bn: { h: 'ঘণ্টা', m: 'মিনিট', s: 'সেকেন্ড', and: ' ও ' },
                    ms: { h: 'jam', m: 'minit', s: 'saat', and: ' ' }
                };
                const _u = _units[_cslLng] || _units.en;
                let _natural = '';
                if (hours > 0) {
                    _natural = `${hours} ${_u.h}${minutes > 0 ? _u.and + minutes + ' ' + _u.m : ''}`;
                } else if (minutes > 0) {
                    _natural = `${minutes} ${_u.m}`;
                } else {
                    _natural = `${seconds} ${_u.s}`;
                }
                _cslCd.textContent = _natural;
            }
        } catch (_e) {}

        // 🆕 Round 5 (Tool Page): sync Time-Left Page hero — BIG countdown + timeline + dynamic title + SEO
        try {
            if (document.documentElement.classList.contains('time-left-page')) {
                const _tlH1Prayer = document.getElementById('tl-h1-prayer');
                const _tlPrayer   = document.getElementById('tl-prayer-name');
                const _tlPTime    = document.getElementById('tl-prayer-time');
                const _tlCd       = document.getElementById('tl-countdown');
                const _tlCity     = document.getElementById('tl-city');
                const _tlCityLabel= document.getElementById('tl-city-label');
                const _tlCta      = document.getElementById('tl-cta');
                const _tlTimeline = document.getElementById('tl-timeline');
                const _tlSeo      = document.getElementById('tl-seo');

                const _prayerLabel = (typeof t === 'function') ? (t('prayer.' + next.key) || next.name) : next.name;
                if (_tlH1Prayer) _tlH1Prayer.textContent = _prayerLabel;
                if (_tlPrayer)   _tlPrayer.textContent   = _prayerLabel;
                if (_tlCd) {
                    // 🆕 Level 3: micro-tick animation كل ثانية
                    if (_tlCd.textContent !== _countdownStr) {
                        _tlCd.textContent = _countdownStr;
                        _tlCd.classList.remove('tl-tick-pulse');
                        // force reflow to restart animation
                        void _tlCd.offsetWidth;
                        _tlCd.classList.add('tl-tick-pulse');
                    }
                }

                // وقت الصلاة القادمة — استخدام النصّ المنسَّق الجاهز من prayer-times.js
                if (_tlPTime && currentPrayerTimes && currentPrayerTimes[next.key]) {
                    _tlPTime.textContent = currentPrayerTimes[next.key];
                }

                // 🔥 Dynamic document.title — live countdown (CTR boost)
                const _tlDocCity = (_tlCity && _tlCity.textContent && _tlCity.textContent !== '—')
                    ? _tlCity.textContent
                    : '';
                if (_tlDocCity && _countdownStr) {
                    const _tlT = (typeof t === 'function') ? t('tl.title_live') : '{cd} | {prayer} in {city}';
                    document.title = String(_tlT || '{cd} | {prayer} in {city}')
                        .replace('{cd}', _countdownStr)
                        .replace('{prayer}', _prayerLabel)
                        .replace('{city}', _tlDocCity);
                }

                // City name + CTA href (once)
                const _tlMatch = window.location.pathname.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?time-left-until-prayer-in-([a-z][a-z0-9-]+)$/);
                if (_tlMatch) {
                    const _tlSlug = _tlMatch[1];
                    const _tlLang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                    const _tlCityDisplay = (typeof getDisplayCity === 'function') ? getDisplayCity() : _tlSlug;
                    if (_tlCity && _tlCity.textContent !== _tlCityDisplay) _tlCity.textContent = _tlCityDisplay;
                    if (_tlCityLabel && _tlCityLabel.textContent !== _tlCityDisplay) _tlCityLabel.textContent = _tlCityDisplay;
                    if (_tlCta && !_tlCta.dataset.wired) {
                        const _langPfx = (_tlLang === 'ar') ? '' : ('/' + _tlLang);
                        _tlCta.href = _langPfx + '/prayer-times-in-' + _tlSlug;
                        // 🆕 Level 2: substitute {loc} in CTA text with actual city
                        const _ctaTextEl = document.getElementById('tl-cta-text') || _tlCta.querySelector('.tl-cta-text');
                        if (_ctaTextEl && _ctaTextEl.textContent.includes('{loc}')) {
                            _ctaTextEl.textContent = _ctaTextEl.textContent.replace('{loc}', _tlCityDisplay);
                        }
                        _tlCta.dataset.wired = '1';
                    }

                    // 🆕 Level 3: Sticky mini timer — wire scroll listener once
                    const _tlSticky = document.getElementById('tl-sticky');
                    if (_tlSticky && !_tlSticky.dataset.wired) {
                        const _heroEl = document.getElementById('tl-hero');
                        const _onScroll = function () {
                            if (!_heroEl) return;
                            const rect = _heroEl.getBoundingClientRect();
                            // يظهر بعد تجاوز الـ hero (bottom < 80)
                            const shouldShow = rect.bottom < 80;
                            _tlSticky.classList.toggle('tl-sticky-on', shouldShow);
                        };
                        window.addEventListener('scroll', _onScroll, { passive: true });
                        _onScroll();
                        _tlSticky.dataset.wired = '1';
                    }

                    // 🆕 SEO paragraph (2 lines) — refresh عند تغيّر الصلاة
                    if (_tlSeo && _tlSeo.dataset.lastPrayer !== next.key) {
                        const _seoTpl = (typeof t === 'function') ? t('tl.seo') : '';
                        if (_seoTpl) {
                            _tlSeo.textContent = String(_seoTpl)
                                .replace('{prayer}', _prayerLabel)
                                .replace('{city}', _tlCityDisplay);
                            _tlSeo.dataset.lastPrayer = next.key;
                        }
                    }
                }

                // 🆕 Level 3: Smart color states (urgency tiers)
                // > 60min: default (green) | < 30min: warn (orange) | < 10min: urgent (red)
                if (_tlCd && typeof diff === 'number') {
                    const _remMin = diff / 60;
                    let _urg = '';
                    if      (_remMin < 10) _urg = 'urgent';
                    else if (_remMin < 30) _urg = 'warn';
                    if (_urg) _tlCd.setAttribute('data-urgency', _urg);
                    else      _tlCd.removeAttribute('data-urgency');

                    // Also set state class on .tl-hero for live dot sync
                    const _tlHero = document.getElementById('tl-hero');
                    if (_tlHero) {
                        _tlHero.classList.toggle('tl-state-urgent', _urg === 'urgent');
                        _tlHero.classList.toggle('tl-state-soon',   _urg === 'warn');
                    }
                }

                // 🆕 Level 3: Sticky Mini Timer — تحديث القيم
                const _tlStickyCd     = document.getElementById('tl-sticky-cd');
                const _tlStickyPrayer = document.getElementById('tl-sticky-prayer');
                if (_tlStickyCd && _tlStickyCd.textContent !== _countdownStr) {
                    _tlStickyCd.textContent = _countdownStr;
                }
                if (_tlStickyPrayer && _tlStickyPrayer.textContent !== _prayerLabel) {
                    _tlStickyPrayer.textContent = _prayerLabel;
                }

                // 🆕 Timeline render (✓ done / ← now / · upcoming)
                if (_tlTimeline && currentPrayerTimes && currentPrayerTimes.raw) {
                    const _ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
                    const _nowSec = (function () {
                        const d = new Date();
                        return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
                    })();
                    const _items = _ORDER.map(function (k) {
                        const raw = currentPrayerTimes.raw[k];
                        if (typeof raw !== 'number') return null;
                        const ph = ((raw % 24) + 24) % 24;
                        const sec = Math.floor(ph * 3600);
                        let state = 'upcoming';
                        if (sec < _nowSec) state = 'done';
                        if (k === next.key) state = 'now';
                        const nm = (typeof t === 'function') ? (t('prayer.' + k) || k) : k;
                        // استخدام النصّ المنسَّق الجاهز (currentPrayerTimes[k]) بدل raw decimal
                        const tm = currentPrayerTimes[k] || '';
                        const icon = state === 'done' ? '✓' : (state === 'now' ? '←' : '·');
                        return '<li class="tl-' + state + '"><span class="tl-tl-icon">' + icon + '</span><span class="tl-tl-name">' + nm + '</span><span class="tl-tl-time">' + tm + '</span></li>';
                    }).filter(Boolean).join('');
                    if (_tlTimeline.dataset.lastRender !== _items) {
                        _tlTimeline.innerHTML = _items;
                        _tlTimeline.dataset.lastRender = _items;
                    }
                }
            }
        } catch (_e) {}

        // تشغيل الأذان عند عبور ثانية وقت الصلاة بدقة كاملة
        if (_prevCurrentSeconds !== null) {
            const prayerKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
            for (const pk of prayerKeys) {
                const raw = currentPrayerTimes.raw[pk];
                const ph = ((raw % 24) + 24) % 24;
                const pSec = Math.floor(ph * 3600);
                if (pSec > _prevCurrentSeconds && pSec <= currentSeconds && pk !== lastAzanPrayer) {
                    lastAzanPrayer = pk;
                    playAdhan();
                    break;
                }
            }
        }
        _prevCurrentSeconds = currentSeconds;
    }

    // 🆕 Defensive: wrap first-tick so a synchronous throw on the stripped time-left page
    // cannot prevent setInterval from starting. Subsequent ticks are independent.
    try { updateCountdown(); } catch (_e) { try { console.warn('[countdown] first-tick failed:', _e); } catch(_) {} }
    countdownInterval = setInterval(function () {
        try { updateCountdown(); } catch (_e) { /* swallow per-tick errors */ }
    }, 1000);
}

// ========= الرجوع للرئيسية =========
function goHome() {
    if (window.location.protocol === 'file:') {
        window.location.hash = '';
        window.location.reload();
        return;
    }
    const _ln = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    window.location.href = (_ln === 'ar') ? '/' : ('/' + _ln + '/');
}

// ========= الإعدادات (محجوز للتوافق) =========
function showSettings() {
    openSettingsModal();
}

// ========= معلومات الدولة والمدينة + عداد السكان =========
const COUNTRY_INFO_DB = {
    sa:{desc:'المملكة العربية السعودية تحتضن أقدس البقاع الإسلامية: مكة المكرمة والمدينة المنورة. تتميز بثروتها النفطية وتطلعها نحو المستقبل ضمن رؤية 2030.',food:'الكبسة، المندي، الجريش، السليق، الحنيني، الهريس',pop:36947025,gr:0.0195},
    eg:{desc:'مصر وطن الحضارة الفرعونية وموطن الأهرامات وأبو الهول، يشقها نهر النيل العظيم، وهي أكثر الدول العربية سكانًا وأعمقها تاريخًا.',food:'الكشري، الفول المدمس، الطعمية، الملوخية، أم علي، المحشي',pop:104258327,gr:0.018},
    sy:{desc:'سوريا ذات حضارة عريقة تمتد لآلاف السنين، موطن دمشق أقدم عاصمة مأهولة في التاريخ، وأرض الياسمين والمأكولات الشامية الشهية.',food:'الكباب الحلبي، الفتة الشامية، الفطائر، المحمرة، الشاورما',pop:22125249,gr:0.005},
    iq:{desc:'العراق أرض ما بين النهرين (دجلة والفرات) حيث نشأت أولى الحضارات الإنسانية البابلية والسومرية. تحتضن النجف وكربلاء وبغداد التاريخية.',food:'المسقوف، الباجة، البرياني العراقي، القيمر، الكليجة',pop:40222493,gr:0.023},
    jo:{desc:'الأردن يحتضن مدينة البتراء الأثرية الرائعة والبحر الميت أخفض نقطة على وجه الأرض، ويتميز بموقعه في قلب المنطقة العربية.',food:'المنسف، الزعتر، الفلافل، الكنافة النابلسية، المجدرة',pop:10203140,gr:0.012},
    lb:{desc:'لبنان صغير المساحة كبير الحضور، تُعرف بجبالها الخضراء وتنوعها الثقافي وبيروتها الجميلة وإطلالتها المميزة على البحر المتوسط.',food:'الحمص، التبولة، الكبة، الفتوش، السفيحة، البقلاوة',pop:5489739,gr:0.008},
    ae:{desc:'الإمارات مركز عالمي للأعمال والسياحة نجحت في عقود قليلة أن تتحول إلى دولة حديثة متطورة تستضيف ناطحات السحاب ومعالم العمران الحديث.',food:'الهريس، المجبوس، اللقيمات، الثريد، البرياني الإماراتي',pop:9282410,gr:0.012},
    kw:{desc:'الكويت دولة خليجية تتميز بتراثها البحري الأصيل وضيافتها الكريمة وثروتها النفطية التي حوّلتها إلى واحدة من أعلى الدول دخلًا في العالم.',food:'المجبوس، المرقوق، الگاوري، الثريد، المطبق',pop:4270563,gr:0.018},
    qa:{desc:'قطر تحولت من صيد اللؤلؤ إلى إمارة نفطية حديثة وضعت بصمتها عالميًا باستضافة كأس العالم 2022 وبناء مشاريع الطموح الكبرى.',food:'الهريس، المجبوس، الثريد، المرقوق، المفطح',pop:2695122,gr:0.020},
    bh:{desc:'البحرين أرخبيل جزر في الخليج العربي ذو تاريخ عريق في صيد اللؤلؤ، يُعدّ اليوم مركزًا ماليًا وسياحيًا بارزًا يجمع الأصالة والحداثة.',food:'المجبوس، الهريس، البليلة، المثروبة، القوزي',pop:1463265,gr:0.012},
    om:{desc:'سلطنة عُمان تتميز بطبيعتها الجبلية الخلابة وسواحلها الجميلة وأسواقها العتيقة وحضارتها الزاهرة التي تمتد لآلاف السنين.',food:'الشواء العماني، الصحناة، القبولي، الحلوى العمانية، المراق',pop:4644384,gr:0.0155},
    ye:{desc:'اليمن موطن حضارة سبأ القديمة ومملكة ملكة سبأ، يتميز ببيوت صنعاء الحجرية الفريدة وجزيرة سقطرى ذات التنوع البيولوجي النادر.',food:'السلتة، الفهسة، الملوج، البنطاش، العصيد',pop:32981641,gr:0.023},
    ma:{desc:'المغرب يجمع بين التراث العربي والأمازيغي ويطل على البحر المتوسط والمحيط الأطلسي، تشتهر مدنه العتيقة كفاس ومراكش وشفشاون.',food:'الطاجين، الكسكس، الحريرة، البسطيلة، الرفيسة',pop:37457971,gr:0.011},
    dz:{desc:'الجزائر أكبر دول أفريقيا مساحةً، تجمع بين الساحل المتوسطي وجبال الأطلس والصحراء الكبرى، وتزخر بحضارات عريقة من القرطاجية إلى العثمانية.',food:'الكسكس، الشخشوخة، الدشيشة، البريك، الرشتة',pop:44903225,gr:0.015},
    tn:{desc:'تونس دولة في شمال أفريقيا تحتضن آثار حضارة قرطاج العريقة وتتميز بشواطئها الجميلة وأسواقها التقليدية وضيافة أهلها الكريمة.',food:'الكسكس، البريك، اللبلابي، الشكشوكة، الأسفنج',pop:11935766,gr:0.009},
    ly:{desc:'ليبيا تتميز بصحرائها الشاسعة وسواحل البحر المتوسط وآثار المدن الرومانية الرائعة كلبدة الكبرى وقصر ليبيا.',food:'الكسكسي الليبي، الشربة الليبية، الزلابية، البازين، العصيدة',pop:6735277,gr:0.013},
    sd:{desc:'السودان تعبره النيل الأزرق والأبيض ويحتضن آثار الحضارة النوبية وأهرامات مروي الرائعة، وهو بوابة أفريقيا الشرقية.',food:'كسرة، مولاح شارموط، الفتة السودانية، العصيدة، الكداية',pop:43849260,gr:0.025},
    ps:{desc:'فلسطين أرض الأنبياء ومهد الديانات السماوية الثلاث، تحتضن القدس الشريف بمسجدها الأقصى المبارك وقيامة الميلاد.',food:'المقلوبة، المسخن، الكنافة النابلسية، الزعتر، الفلافل',pop:5101414,gr:0.025},
    pk:{desc:'باكستان ثامنة الدول من حيث السكان، تتميز بجبال الكاراكورام الشاهقة وتنوعها الثقافي الغني وإرثها الحضاري العريق.',food:'البيريان الباكستاني، النهاري، الكاري، السموسة، النان',pop:220892340,gr:0.020},
    tr:{desc:'تركيا وريثة الحضارة العثمانية العريقة تمتد على قارتي آسيا وأوروبا، تتميز بإسطنبول التاريخية وطبيعتها الخلابة من البحر المتوسط إلى كابادوكيا.',food:'الكباب، البوريك، الدونر، البقلاوة، الأيران، المرق',pop:84339067,gr:0.009},
    ir:{desc:'إيران موطن الحضارة الفارسية العريقة وتتميز بشعرها وموسيقاها وبساطها الرائعة وآثار بيرسيبوليس وأصفهان.',food:'الغورمة سبزي، الكباب الإيراني، الفسنجان، الأبگوشت',pop:85028759,gr:0.008},
    in:{desc:'الهند أكبر ديمقراطية في العالم وثانيها من حيث السكان، تتميز بتنوعها الهائل ثقافيًا ودينيًا وبتراجها المعماري كتاج محل الرائع.',food:'البيريان، الكاري، البانير، السموسة، دوسا، التشاي',pop:1393409038,gr:0.009},
    id:{desc:'إندونيسيا أكبر أرخبيل في العالم ويضم أكثر من 17000 جزيرة، وتحتضن أكبر مجتمع مسلم في العالم وغابات استوائية خصبة.',food:'ناسي غورنغ، رندانغ، ساتاي، مي غورنغ، غادو غادو',pop:273523615,gr:0.009},
    my:{desc:'ماليزيا تتميز بتنوعها العرقي بين الملايو والصينيين والهنود وتتمتع بغابات استوائية خصبة وناطحات سحاب شاهقة في كوالالمبور.',food:'ناسي ليماك، رندانغ، لاكسا، بوبور آيام، ساراواك لاكسا',pop:32365999,gr:0.012},
    fr:{desc:'فرنسا تحتضن باريس عاصمة الضوء والفن والرومانسية، وهي من أكثر الوجهات السياحية زيارةً في العالم وموطن جمهورية جالية مسلمة كبيرة.',food:'الكرواسون، راتاتوي، الجبن الفرنسي، الباغيت، الكريب، فوا غرا',pop:67391582,gr:0.003},
    de:{desc:'ألمانيا أكبر اقتصاديات أوروبا وبها جالية مسلمة كبيرة، تشتهر بصناعتها المتطورة وتراثها الثقافي وقلاعها الأسطورية وأسواق عيد الميلاد.',food:'النقانق، الشنيتزل، البريتزل، عجة البطاطس، مخلل الملفوف',pop:83132799,gr:0.001},
    gb:{desc:'المملكة المتحدة تجمع إنجلترا واسكتلندا وويلز وأيرلندا الشمالية، وتحتضن لندن إحدى أكثر مدن العالم تنوعًا وتميزًا.',food:'فيش آند تشيبس، الباي، الفطور الإنجليزي، سكونز التي',pop:67215293,gr:0.003},
    nl:{desc:'هولندا تتميز بطواحين هوائها الأيقونية وحدائق الزنبق الرائعة وإدارتها الرائدة للمياه، وتحتضن جالية مسلمة كبيرة.',food:'ستروبوافل، كيباب هولندي، البطاطس المقلية، بانيكوك',pop:17441139,gr:0.003},
    be:{desc:'بلجيكا مقر الاتحاد الأوروبي والناتو وموطن جالية مسلمة كبيرة في بروكسل، تشتهر بشوكولاتتها والبيرة والوافل.',food:'الوافل البلجيكي، الشوكولاتة، موليه فريت، ستافبوت',pop:11589623,gr:0.005},
    es:{desc:'إسبانيا موطن العمارة الأندلسية الرائعة كمسجد قرطبة وقصر الحمراء، وتتميز بثقافتها الزاخرة وتراثها الإسلامي العريق.',food:'الباييلا، التورتيلا الإسبانية، الخامون، الغازباتشو، تشوريثو',pop:47342613,gr:0.002},
    it:{desc:'إيطاليا موطن الحضارة الرومانية وعصر النهضة وتحتضن أكثر المواقع المدرجة على قائمة التراث العالمي لليونسكو.',food:'البيتزا، الباستا، الريزوتو، الجيلاتو، التيراميسو',pop:60367477,gr:-0.001},
    ru:{desc:'روسيا أكبر دول العالم مساحةً وتمتد عبر قارتي آسيا وأوروبا، تتميز بتراثها الثقافي الغني وغاباتها الشاسعة.',food:'البورشت، البيروجي، البيف ستروجانوف، البليني، سلطة أوليفييه',pop:145912025,gr:0.001},
    us:{desc:'الولايات المتحدة أكبر الاقتصادات في العالم وتضم 50 ولاية وتتميز بتنوعها الثقافي الهائل وتأثيرها الواسع على ثقافة العالم.',food:'البرغر، الستيك، هوت دوج، المافن، ضلوع الشواء',pop:331449281,gr:0.007},
    ca:{desc:'كندا ثاني أكبر دول العالم مساحةً وتتميز بطبيعتها الخلابة من جبال الروكي إلى شلالات نياغارا وتعدديتها الثقافية.',food:'بوتين، الفطيرة الكندية، السيروب، شوربة المأكولات البحرية',pop:38246108,gr:0.009},
    au:{desc:'أستراليا قارة ودولة في آن واحد تتميز بحيواناتها الفريدة كالكنغر وتضاريسها المتنوعة من الشعاب المرجانية إلى الصحراء الحمراء.',food:'باراميتا، فيش آند تشيبس، الفطور الأسترالي، ميت باي',pop:25687041,gr:0.011},
    br:{desc:'البرازيل أكبر دول أمريكا اللاتينية وتحتضن غابة الأمازون الشهيرة، تتميز بكرنفالها الشهير وتنوعها الثقافي وعشقها لكرة القدم.',food:'الفيجوادا، الشوراسكو، كيبي برازيلي، ببيكا',pop:213993437,gr:0.007},
    mx:{desc:'المكسيك تجمع بين تراث الحضارات الأزتكية والمايا والثقافة الإسبانية وتشتهر بأهرامات تيوتيواكان وشواطئ كانكون الرائعة.',food:'التاكو، الإنكيلاداس، الغواكامولي، التامالي، الموليه',pop:128932753,gr:0.012},
    cn:{desc:'الصين أكثر دول العالم سكانًا وثاني أكبر اقتصاد، تمتد حضارتها لأكثر من 5000 عام وتشتهر بسورها العظيم ومطبخها الغني.',food:'الدم سم، الشاومي، الكونف باو، نودلز بكين، رافيولي الصين',pop:1402112000,gr:0.003},
    jp:{desc:'اليابان تجمع بين التراث الثقافي الأصيل والتكنولوجيا المتطورة وتشتهر بزهر الكرز وجبل فوجي ومطبخها العالمي.',food:'السوشي، الراشيو، التيمبورا، الكاتسودون، التاكويابي',pop:125961625,gr:-0.002},
    ng:{desc:'نيجيريا أكثر دول أفريقيا سكانًا وأكبر اقتصاداتها، تتميز بتنوعها الثقافي الهائل وموسيقاها وسينما نوليوود.',food:'جولاف رايس، إيغوسي سوب، سويا، فوفو، عصيدة الذرة',pop:206139589,gr:0.025},
    et:{desc:'إثيوبيا أكثر دول أفريقيا سكانًا بعد نيجيريا وذات تاريخ حضاري عريق، تتميز بهضابها الجبلية ومحمياتها الطبيعية الغنية.',food:'الأنجيرا، زيغني، دورو وات، تيبس، الفول الإثيوبي',pop:117876227,gr:0.025},
    ke:{desc:'كينيا تشتهر بسهولها الشاسعة ومحمياتها الطبيعية كسيرنغيتي وبحيرة فيكتوريا ومثيلجا بيرة الحياة البرية الاستثنائية.',food:'أوغالي، سوكوما ويكي، نياما تشوما، ماندازي',pop:53771296,gr:0.023},
    za:{desc:'جنوب أفريقيا تتميز بتنوعها الثقافي الكبير المعروف بالقوس قزح وبيئتها الطبيعية الاستثنائية وطبيعتها الساحرة.',food:'براي، بوبوتي، بيلتونغ، البنجو، ماليو كاري',pop:59308690,gr:0.013},
    ar:{desc:'الأرجنتين ثاني أكبر دول أمريكا اللاتينية تشتهر بالتانغو وكرة القدم وسهولها الخصبة الشاسعة وبوينس آيرس العاصمة الراقية.',food:'أسادو، شوريثو، إمباناداس، ماتي، دولسي دي ليتشي',pop:45195774,gr:0.009},
    co:{desc:'كولومبيا في شمال أمريكا الجنوبية تتميز بتنوع مناخها وبيئاتها من الغابات الاستوائية إلى جبال الأنديز وسواحل المحيطين الأطلسي والهادئ.',food:'باندييخا بايسا، أريباس، سانكوتشو، أفياكو، تشيريموايا',pop:51265844,gr:0.012},
};

let _popTimer = null;
let _popSessionStart = 0;
let _popGrowthPerSec = 0;
let _popBase = 0;

function stopPopulationCounter() {
    if (_popTimer) { clearInterval(_popTimer); _popTimer = null; }
}

// تنسيق الرقم بأرقام إنجليزية مع فاصل الآلاف
function formatPopNumber(n) {
    return Math.round(n).toLocaleString('en-US');
}

// فئة الرقم حسب اللغة
function getPopCategory(n) {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    // استخدم مفاتيح i18n عند توفرها
    const key = n >= 1_000_000_000 ? 'unit.billion'
              : n >= 1_000_000     ? 'unit.million'
              : n >= 1_000         ? 'unit.thousand'
              : 'unit.hundred';
    if (typeof t === 'function') {
        const v = t(key);
        if (v && v !== key) return v;
    }
    // احتياط
    if (lang !== 'ar') {
        if (n >= 1_000_000_000) return 'Billion';
        if (n >= 1_000_000)     return 'Million';
        if (n >= 1_000)         return 'Thousand';
        return 'Hundred';
    }
    if (n >= 1_000_000_000) return 'مليار';
    if (n >= 1_000_000)     return 'مليون';
    if (n >= 1_000)         return 'ألف';
    return 'مئة';
}

// تنبيض النقطة الخضراء عند كل زيادة
let _lastPopInt = 0;
function pulsePopDot() {
    const dot = document.getElementById('pop-live-dot');
    if (!dot) return;
    // PERF: double RAF بدل offsetWidth لإعادة تشغيل الأنيميشن بدون forced reflow
    dot.classList.remove('pop-dot-pulse');
    requestAnimationFrame(() => requestAnimationFrame(() => dot.classList.add('pop-dot-pulse')));
}

function startPopulationCounter(basePop, growthRate) {
    stopPopulationCounter();

    const el        = document.getElementById('pop-live-number');
    const elCat     = document.getElementById('pop-category');
    const elSession = document.getElementById('pop-session-added');
    if (!el) return;

    // تاريخ مرجعي ثابت: 1 يناير 2025 — basePop يمثّل العدد في هذا التاريخ
    const REF_MS       = new Date('2025-01-01T00:00:00Z').getTime();
    const growthPerSec = (basePop * Math.max(growthRate, 0)) / (365 * 24 * 3600);

    // حساب العدد الحقيقي الحالي بناءً على الوقت المنقضي منذ التاريخ المرجعي
    function getCurrentPop() {
        const elapsedSec = (Date.now() - REF_MS) / 1000;
        return Math.round(basePop + elapsedSec * growthPerSec);
    }

    const popAtOpen = getCurrentPop(); // العدد لحظة فتح الصفحة
    _popBase        = popAtOpen;
    _popSessionStart = Date.now();
    _lastPopInt     = popAtOpen;

    if (elCat) elCat.textContent = getPopCategory(popAtOpen);

    // عرض الرقم الحالي فوراً (صحيح عند كل ريفرش)
    el.textContent = formatPopNumber(popAtOpen);
    if (elSession) elSession.textContent = (typeof t === 'function') ? t('pop.live') : 'تابع التحديث المباشر';

    // تحديث كل ثانية بالرقم الحقيقي المحسوب
    _popTimer = setInterval(() => {
        const current = getCurrentPop();
        el.textContent = formatPopNumber(current);
        // تنبيض النقطة عند كل زيادة فعلية
        if (current > _lastPopInt) { pulsePopDot(); _lastPopInt = current; }
        if (elSession) {
            const added = Math.max(0, current - popAtOpen);
            elSession.textContent = added > 0
                ? ((typeof t === 'function') ? t('pop.since_opened', { count: formatPopNumber(added) }) : `+${formatPopNumber(added)} منذ فتح الصفحة`)
                : ((typeof t === 'function') ? t('pop.live') : 'تابع التحديث المباشر');
        }
    }, 1000);
}

async function updateCityCountryInfo() {
    const section = document.getElementById('city-country-info-section');
    if (!section) return;

    const cc = (currentCountryCode || '').toLowerCase();
    const info = COUNTRY_INFO_DB[cc];

    // ===== أسماء الدول بالعربية (مفهرسة بكود ISO) =====
    const COUNTRY_AR_NAMES = {
        sa:'المملكة العربية السعودية', eg:'مصر', sy:'سوريا', iq:'العراق',
        jo:'الأردن', lb:'لبنان', ae:'الإمارات العربية المتحدة', kw:'الكويت',
        qa:'قطر', bh:'البحرين', om:'سلطنة عُمان', ye:'اليمن', ps:'فلسطين',
        ma:'المغرب', dz:'الجزائر', tn:'تونس', ly:'ليبيا', sd:'السودان',
        mr:'موريتانيا', so:'الصومال', km:'جزر القمر',
        pk:'باكستان', in:'الهند', bd:'بنغلاديش', af:'أفغانستان',
        tr:'تركيا', ir:'إيران', id:'إندونيسيا', my:'ماليزيا',
        sg:'سنغافورة', bn:'بروناي', ph:'الفلبين', th:'تايلاند',
        cn:'الصين', jp:'اليابان', kr:'كوريا الجنوبية', mn:'منغوليا',
        kz:'كازاخستان', uz:'أوزبكستان', az:'أذربيجان', lk:'سريلانكا',
        np:'نيبال', mm:'ميانمار',
        fr:'فرنسا', de:'ألمانيا', gb:'المملكة المتحدة', nl:'هولندا',
        be:'بلجيكا', es:'إسبانيا', it:'إيطاليا', pt:'البرتغال',
        ru:'روسيا', pl:'بولندا', se:'السويد', no:'النرويج',
        dk:'الدنمارك', fi:'فنلندا', ch:'سويسرا', at:'النمسا',
        gr:'اليونان', cz:'جمهورية التشيك', ro:'رومانيا', hu:'المجر',
        ua:'أوكرانيا', hr:'كرواتيا', rs:'صربيا', sk:'سلوفاكيا',
        bg:'بلغاريا', ba:'البوسنة والهرسك', al:'ألبانيا', mk:'مقدونيا',
        ie:'أيرلندا', lu:'لوكسمبورغ', mt:'مالطا', cy:'قبرص',
        us:'الولايات المتحدة الأمريكية', ca:'كندا', mx:'المكسيك',
        br:'البرازيل', ar:'الأرجنتين', co:'كولومبيا', pe:'بيرو',
        ve:'فنزويلا', cl:'تشيلي', ec:'الإكوادور', bo:'بوليفيا',
        py:'باراغواي', uy:'أوروغواي', gt:'غواتيمالا', cu:'كوبا',
        au:'أستراليا', nz:'نيوزيلندا',
        ng:'نيجيريا', et:'إثيوبيا', ke:'كينيا', tz:'تنزانيا',
        za:'جنوب أفريقيا', gh:'غانا', sn:'السنغال', ci:'ساحل العاج',
        cm:'الكاميرون', ml:'مالي', ne:'النيجر', td:'تشاد',
        ug:'أوغندا', mz:'موزمبيق', zw:'زيمبابوي', mg:'مدغشقر',
        ao:'أنغولا', dz:'الجزائر',
    };

    // استخدام الاسم المناسب حسب اللغة
    function getCountryDisplayName() {
        const _ln = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        if (_ln !== 'ar') return getDisplayCountry();
        if (cc && COUNTRY_AR_NAMES[cc]) return COUNTRY_AR_NAMES[cc];
        if (/[\u0600-\u06FF]/.test(currentCountry)) return currentCountry;
        return currentCountry;
    }

    // ===== عداد السكان =====
    const popName = document.getElementById('pop-country-name');
    if (popName) popName.textContent = getCountryDisplayName();

    if (info) {
        startPopulationCounter(info.pop, info.gr);
    } else {
        // جلب السكان من RestCountries كاحتياطي
        try {
            const r = await fetch(`https://restcountries.com/v3.1/alpha/${cc}?fields=population`);
            if (r.ok) {
                const d = await r.json();
                if (d.population) startPopulationCounter(d.population, 0.012);
            }
        } catch(e) {}
    }

    // ===== معلومات الدولة =====
    const countryDescEl = document.getElementById('country-desc-text');
    const countryFoodEl = document.getElementById('country-food-text');
    if (countryDescEl) countryDescEl.textContent = info ? info.desc : '';
    if (countryFoodEl) countryFoodEl.textContent = info ? info.food : '';

    // رابط عنوان بلوك الدولة → صفحة مدن الدولة
    const countryLinkEl = document.getElementById('country-block-link');
    if (countryLinkEl) {
        const countryDisplayName = getCountryDisplayName();
        countryLinkEl.textContent = countryDisplayName;
        countryLinkEl.href = pageUrl(`/prayer-times-in-${makeCountrySlug(cc, currentEnglishCountry)}`);
    }

    // العلم
    const flagEl = document.getElementById('city-country-flag');
    if (flagEl && cc && cc.length === 2) {
        flagEl.innerHTML = `<img src="https://flagcdn.com/64x48/${cc}.png" alt="${currentCountry}" style="border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15)">`;
    }

    // ===== معلومات المدينة =====
    const cityTitleEl = document.getElementById('city-info-heading');
    if (cityTitleEl) cityTitleEl.textContent = `📍 ${getDisplayCity()}`;

    // الوقت المحلي للمدينة
    const now = new Date();
    const localOffset = -now.getTimezoneOffset() / 60;
    const cityTime = new Date(now.getTime() + (currentTimezone - localOffset) * 3600000);

    const timeEl = document.getElementById('city-local-time');
    if (timeEl) {
        const hh = String(cityTime.getHours()).padStart(2, '0');
        const mm = String(cityTime.getMinutes()).padStart(2, '0');
        timeEl.textContent = `${hh}:${mm}`;
        // تحديث الوقت كل دقيقة
        if (window._cityTimeTimer) clearInterval(window._cityTimeTimer);
        window._cityTimeTimer = setInterval(() => {
            const n2 = new Date();
            const ct = new Date(n2.getTime() + (currentTimezone - localOffset) * 3600000);
            timeEl.textContent = `${String(ct.getHours()).padStart(2,'0')}:${String(ct.getMinutes()).padStart(2,'0')}`;
        }, 60000);
    }

    // التاريخ الهجري والميلادي
    const hijri = HijriDate.getToday();
    const hijriEl = document.getElementById('city-hijri-date');
    const gregEl  = document.getElementById('city-greg-date');
    if (hijriEl) hijriEl.textContent = `${hijri.day} ${HijriDate.hijriMonths[hijri.month-1]} ${hijri.year} هـ`;
    if (gregEl)  gregEl.textContent  = `${cityTime.getDate()} ${HijriDate.gregorianMonths[cityTime.getMonth()]} ${cityTime.getFullYear()} م`;

    // وصف المدينة من ويكيبيديا — حُذف بالكامل بناءً على طلب المستخدم
    const cityDescEl  = document.getElementById('city-wiki-desc');
    const readMoreBtn = document.getElementById('city-read-more');
    if (cityDescEl) cityDescEl.textContent = '';
    if (readMoreBtn) readMoreBtn.style.display = 'none';

    section.style.display = 'block';
    // CLS: على صفحات المدن البطاقة محجوزة مسبقاً (visibility:hidden) — نكشفها الآن
    section.classList.add('cls-ready');
}

// ========= الأماكن القريبة =========
async function fetchNearbyPlaces(lat, lng) {
    const section = document.getElementById('nearby-section');
    const grid = document.getElementById('nearby-grid');
    // FIX i18n: نصّ التحميل لكل اللغات
    const _loadingTxt = (typeof t === 'function')
        ? (t('nearby.loading') || '⏳ Loading nearby places...')
        : '⏳ Loading nearby places...';
    grid.innerHTML = '<div style="padding:16px;color:var(--text-light)">' + _loadingTxt + '</div>';
    section.style.display = 'block';
    section.classList.add('cls-ready');

    // ترجمة الأسماء الإنجليزية إلى العربية عبر MyMemory (مجاني)
    async function translateName(name) {
        if (/[\u0600-\u06FF]/.test(name)) return name; // عربي بالفعل
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(name)}&langpair=en|ar`;
            const d = await fetch(url).then(r => r.json());
            const t = d.responseData?.translatedText;
            if (t && /[\u0600-\u06FF]/.test(t)) return t;
        } catch(e) {}
        return name;
    }

    // --- Nominatim (سريع وموثوق، يعيد أسماء عربية) ---
    async function nominatimNearby() {
        // صندوق أكبر للمدن، أصغر للبلدات
        const d1 = 2.5, d2 = 1.5;
        const vbCity = `${(lng-d1).toFixed(4)},${(lat+d1).toFixed(4)},${(lng+d1).toFixed(4)},${(lat-d1).toFixed(4)}`;
        const vbTown = `${(lng-d2).toFixed(4)},${(lat+d2).toFixed(4)},${(lng+d2).toFixed(4)},${(lat-d2).toFixed(4)}`;
        const base = `https://nominatim.openstreetmap.org/search?format=json&accept-language=ar&addressdetails=1&namedetails=1&bounded=1&limit=20`;
        const [c, t] = await Promise.allSettled([
            fetch(nomUrl(`${base}&viewbox=${vbCity}&q=city`)).then(r=>r.json()),
            fetch(nomUrl(`${base}&viewbox=${vbTown}&q=town`)).then(r=>r.json()),
        ]);
        const all = [...(c.value||[]), ...(t.value||[])];
        // فقط place nodes/areas، بدون حدود إدارية
        return all.filter(p => p.class === 'place' && ['city','town'].includes(p.type));
    }

    // --- Overpass (أشمل بيانات لكن أبطأ) ---
    async function overpassNearby() {
        const query = `[out:json][timeout:10];(node[place~"^(city|town|village)$"](around:100000,${lat},${lng}););out 20;`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        try {
            const r = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query), { signal: controller.signal });
            clearTimeout(timer);
            const d = await r.json();
            return (d.elements || []).length > 0 ? d.elements : [];
        } catch(e) {
            clearTimeout(timer);
            return [];
        }
    }

    // شغّل الاثنين معاً - خذ Nominatim فور جاهزيته
    const nominatimPromise = nominatimNearby();
    const overpassPromise  = overpassNearby();

    let rawPlaces = [];

    // انتظر Nominatim أولاً (عادةً 2-3 ثوانٍ)
    const nomResults = await nominatimPromise;
    if (nomResults.length >= 3) {
        rawPlaces = nomResults.map(p => {
            const elLat = parseFloat(p.lat), elLon = parseFloat(p.lon);
            const nd = p.namedetails || {};
            const nameAr = p.name || p.display_name.split(',')[0];
            const nameEn = nd['name:en'] || nd['name:en-US'] || (/^[a-zA-Z\s\-'.]+$/.test(p.name) ? p.name : '');
            const dist = Math.round(Math.sqrt((elLat-lat)**2 + (elLon-lng)**2) * 111);
            const icon = p.type === 'village' ? '🏘️' : p.type === 'town' ? '🏡' : '🏙️';
            // 🆕 Round 2.1: preserve type + importance for smart badge logic
            return { lat: elLat, lon: elLon, dist, nameAr, nameEn, icon, type: p.type || 'city', importance: parseFloat(p.importance || 0) };
        });
    } else {
        // Nominatim أعاد القليل — انتظر Overpass
        const ovResults = await overpassPromise;
        rawPlaces = ovResults.map(el => {
            const tags = el.tags || {};
            const nameAr = tags['name:ar'] || tags.name || '';
            const nameEn = tags['name:en'] || (/^[a-zA-Z\s\-'.]+$/.test(tags.name) ? tags.name : '');
            const dist = Math.round(Math.sqrt((el.lat-lat)**2 + (el.lon-lng)**2) * 111);
            const icon = tags.place === 'village' ? '🏘️' : tags.place === 'town' ? '🏡' : '🏙️';
            // 🆕 Round 2.1: preserve type + population for smart badge logic
            return { lat: el.lat, lon: el.lon, dist, nameAr, nameEn, icon, type: tags.place || 'city', importance: parseFloat(tags.population || 0) / 1e7 };
        });
    }

    // إزالة التكرارات (بالاسم) وترتيب وتحديد 12
    const seen = new Set();
    let places = rawPlaces
        .filter(p => p.nameAr && p.dist > 0 && !seen.has(p.nameAr) && seen.add(p.nameAr))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 12);

    // ترجمة الأسماء الإنجليزية إلى العربية
    places = await Promise.all(places.map(async p => {
        if (/^[a-zA-Z]/.test(p.nameAr)) {
            p.nameAr = await translateName(p.nameAr);
        }
        return p;
    }));

    if (places.length === 0) {
        // FIX i18n: نصّ "لا توجد" لكل اللغات
        const _noneTxt = (typeof t === 'function')
            ? (t('nearby.none') || 'No nearby places found')
            : 'No nearby places found';
        grid.innerHTML = '<div style="padding:16px;color:var(--text-light)">' + _noneTxt + '</div>';
        return;
    }

    _cachedNearbyPlaces = places;
    renderNearbyGrid(places, grid);
}

function renderNearbyGrid(places, grid) {
    if (!grid) grid = document.getElementById('nearby-grid');
    if (!grid || !places || places.length === 0) return;
    grid.innerHTML = '';
    const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    // 🆕 Round 2.1: smart badge selector — closest / popular / capital
    // المنطق: dist <= 30km → الأقرب | dist > 30km && type==='city' → بارزة قريبة | else → الأقرب
    const _pickBadge = (place) => {
        const _fb = {
            closest: { ar: '📍 الأقرب إليك الآن', en: '📍 Closest to you', fr: '📍 Le plus proche', tr: '📍 Size en yakın', ur: '📍 آپ کے قریب ترین', de: '📍 Am nächsten', id: '📍 Terdekat', es: '📍 Más cercano', bn: '📍 আপনার কাছাকাছি', ms: '📍 Terdekat' },
            popular: { ar: '⭐ مدينة قريبة بارزة', en: '⭐ Popular nearby city', fr: '⭐ Ville populaire proche', tr: '⭐ Popüler yakın şehir', ur: '⭐ قریبی مشہور شہر', de: '⭐ Beliebte Nachbarstadt', id: '⭐ Kota populer terdekat', es: '⭐ Ciudad cercana popular', bn: '⭐ কাছাকাছি জনপ্রিয় শহর', ms: '⭐ Bandar popular berdekatan' },
        };
        const _tier = (typeof place.dist === 'number' && place.dist <= 30)
            ? 'closest'
            : ((place.type === 'city' || place.importance >= 0.5) ? 'popular' : 'closest');
        const _key = `nearby.badge_${_tier}`;
        if (typeof t === 'function') {
            const _try = t(_key);
            if (_try && _try !== _key) return _try;
        }
        return (_fb[_tier] && _fb[_tier][_lng]) || _fb.closest[_lng] || _fb.closest.en;
    };

    places.forEach((place, _idx) => {
        const _nLng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const isArNearby = (_nLng === 'ar');
        let placeLabel;
        if (isArNearby) {
            placeLabel = place.nameAr;
        } else {
            const cityMap = _LOCALIZED_CITY_MAPS[_nLng];
            placeLabel = (cityMap && cityMap[place.nameEn]) || place.nameEn || place.nameAr;
        }
        const distLabel = isArNearby ? `${place.dist} كم` : `${place.dist} km`;
        // Polish Round (C): إضافة "اليوم" — SEO boost + اتّساق مع chips الصفحة الرئيسيّة
        const _nearbyTplFallback = {
            ar: 'مواقيت الصلاة اليوم في {loc}',
            en: "Today's Prayer Times in {loc}",
            fr: "Heures de prière aujourd'hui à {loc}",
            tr: '{loc} için bugünkü namaz vakitleri',
            ur: 'آج {loc} میں اوقاتِ نماز',
            de: 'Gebetszeiten heute in {loc}',
            id: 'Jadwal Sholat Hari Ini di {loc}',
            es: 'Horarios de Oración Hoy en {loc}',
            bn: 'আজ {loc}-এ নামাজের সময়',
            ms: 'Waktu Solat Hari Ini di {loc}'
        };
        let _nearbyTpl = '';
        if (typeof t === 'function') {
            const _try = t('nearby.item_today');
            if (_try && _try !== 'nearby.item_today') _nearbyTpl = _try;
        }
        if (!_nearbyTpl) _nearbyTpl = _nearbyTplFallback[_nLng] || _nearbyTplFallback.en;
        const nearbyTitle = _nearbyTpl.replace(/\{loc\}/g, placeLabel);

        const a = document.createElement('a');
        a.className = 'nearby-item';
        // 🆕 Round 2.1: أوّل عنصر يحصل على .featured + badge ديناميكيّ (closest / popular)
        if (_idx === 0) {
            a.classList.add('featured');
            a.setAttribute('data-closest-label', _pickBadge(place));
        }
        a.href = buildCityUrl(place.lat, place.lon, place.nameAr, currentCountry, place.nameEn);
        a.title = nearbyTitle;
        a.innerHTML = `
            <span class="nearby-flag">${place.icon}</span>
            <div class="nearby-info">
                <span class="nearby-label">${nearbyTitle}</span>
                <span class="nearby-dist">${distLabel}</span>
            </div>
        `;
        a.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToCity(place.lat, place.lon, place.nameAr, currentCountry, place.nameEn, currentCountryCode);
        });
        grid.appendChild(a);
    });
}

// ========= القبلة =========
let _qiblaAngle = 0;
let _compassListening = false;
let _orientationHandler = null;

// ───── Qibla helpers (Round 25: Tool Page + localized city names) ─────

// Localized city-name resolver (client-side mirror of server's _resolveCityName).
// Source 1: window.__POPULAR_CITY_NAMES__ (injected by SSR; ~40 cities × 10 langs).
// Source 2: LOCAL_CITIES (ar + en only) — fallback for cities not in #1.
// Last resort: `fallback` (should be the English name, never a Title-cased slug).
// DO NOT Title-case slugs anywhere — that leaks English into non-Latin pages.
function _resolveCityNameClient(slug, lang, fallback) {
    // قائمة بادئات أداة التعريف العربيّة (شمسيّة/قمريّة) — fallback عند غياب slug
    //   at-taif → taif، al-qahirah → qahirah، إلخ. (مطابِقة لـ server.js)
    const _ARAB_PFX = /^(at|al|el|ad|an|ar|as|ash|ath|az|ed)-/;
    const _tryLookup = (s) => {
        try {
            const pop = (typeof window !== 'undefined') && window.__POPULAR_CITY_NAMES__;
            if (pop && s && pop[s]) {
                return pop[s][lang] || pop[s].en || null;
            }
        } catch (_e) {}
        try {
            if (typeof LOCAL_CITIES !== 'undefined' && Array.isArray(LOCAL_CITIES) && s) {
                const hit = LOCAL_CITIES.find(c => {
                    try { return makeSlug(c.en, c.lat, c.lng).startsWith(s); }
                    catch (_e2) { return false; }
                });
                if (hit) return (lang === 'ar') ? hit.ar : hit.en;
            }
        } catch (_e) {}
        return null;
    };
    let r = _tryLookup(slug);
    if (r) return r;
    // Fallback: انزع بادئة "ال" العربيّة (at-/al-/...) → جرّب اللوكاب مرّة أخرى
    if (slug && _ARAB_PFX.test(slug)) {
        r = _tryLookup(slug.replace(_ARAB_PFX, ''));
        if (r) return r;
    }
    return fallback || slug || '';
}

function _haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const DEG = Math.PI / 180;
    const dLat = (lat2 - lat1) * DEG;
    const dLng = (lng2 - lng1) * DEG;
    const a = Math.sin(dLat / 2) ** 2
            + Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function _nearestCitiesFrom(lat, lng, citiesArr, n, excludeKey) {
    if (!Array.isArray(citiesArr) || citiesArr.length === 0) return [];
    const arr = citiesArr
        .filter(c => c && (excludeKey == null || c.key !== excludeKey)
                       && typeof c.lat === 'number' && typeof c.lng === 'number')
        .map(c => ({ ...c, _d: _haversineKm(lat, lng, c.lat, c.lng) }))
        .sort((a, b) => a._d - b._d);
    return arr.slice(0, n || 5);
}

/**
 * Single source of truth for "nearest known city" lookups across all geo buttons.
 * Returns a record with {ar, en, lat, lng, cc, country, _d, _src} — never null,
 * because LOCAL_CITIES is non-empty in practice (Tier 1).
 *
 * Tier 1: LOCAL_CITIES — full {ar, en, lat, lng, cc, country} records.
 * Tier 2: FAMOUS_MOON_CITIES — slug-keyed; we synthesize ar/en via existing resolvers.
 *         Defensive only; LOCAL_CITIES alone is enough on Earth.
 *
 * Used by:
 *   - _locHeroDetectAndNavigate (prayer-times hero geo button)
 *   - qibla-hub-geo-btn click handler (qibla hub)
 *
 * Goal: NO geo button click ever produces /prayer-times-in-loc-* or /qibla-in-loc-*.
 */
function _findNearestKnownCity(lat, lng) {
    try {
        if (typeof LOCAL_CITIES !== 'undefined' && Array.isArray(LOCAL_CITIES) && LOCAL_CITIES.length) {
            const t1 = _nearestCitiesFrom(lat, lng, LOCAL_CITIES, 1)[0];
            if (t1 && typeof t1.lat === 'number' && typeof t1.lng === 'number' && t1.en) {
                return {
                    ar: t1.ar || '', en: t1.en,
                    lat: t1.lat, lng: t1.lng,
                    cc: t1.cc || '', country: t1.country || '',
                    _d: t1._d, _src: 'local'
                };
            }
        }
    } catch (_e) { /* fall through to tier 2 */ }

    try {
        if (typeof FAMOUS_MOON_CITIES !== 'undefined' && FAMOUS_MOON_CITIES) {
            const famArr = Object.entries(FAMOUS_MOON_CITIES)
                .filter(([_, c]) => c && typeof c.lat === 'number' && typeof c.lng === 'number')
                .map(([slug, c]) => {
                    const titleEn = slug.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
                    const arName = (typeof _resolveCityNameClient === 'function')
                        ? (_resolveCityNameClient(slug, 'ar', '') || '')
                        : '';
                    return { slug, en: titleEn, ar: arName, lat: c.lat, lng: c.lng, cc: '', country: '' };
                });
            const t2 = _nearestCitiesFrom(lat, lng, famArr, 1)[0];
            if (t2) {
                return {
                    ar: t2.ar, en: t2.en,
                    lat: t2.lat, lng: t2.lng,
                    cc: '', country: '',
                    _d: t2._d, _src: 'famous'
                };
            }
        }
    } catch (_e) { /* fall through */ }

    // Last-ditch defensive — should be unreachable. Returns user's coords with empty names;
    // navigateToCity will then use a coords-only slug. The destination's loadCityData
    // self-heal (reverseGeocode fallback) will populate the name on the destination page.
    return { ar: '', en: '', lat, lng, cc: '', country: '', _d: 0, _src: 'self' };
}

/**
 * Side-effect helper: write localStorage['lsb_detected'] in the canonical shape so
 * (a) the prayer-times hero fast path can hit it instantly on next click,
 * (b) the smart-pill on the hero shows the right city,
 * (c) the location-suggestion bar stays in sync.
 *
 * Safe to call from any geo entry point (prayer hero, qibla hub).
 */
function _writeLsbDetected(city, userLat, userLng) {
    try {
        if (!city || !city.en) return;
        const lat = (typeof userLat === 'number') ? userLat : city.lat;
        const lng = (typeof userLng === 'number') ? userLng : city.lng;
        const uiLang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const names = { ar: city.ar || '', en: city.en };
        // Best-effort localized name for the current UI language (no API call —
        // just the in-memory map shipped with the bundle).
        try {
            const cityMap = (typeof _LOCALIZED_CITY_MAPS !== 'undefined') ? _LOCALIZED_CITY_MAPS[uiLang] : null;
            if (cityMap && cityMap[city.en]) names[uiLang] = cityMap[city.en];
        } catch (_e) {}
        localStorage.setItem('lsb_detected', JSON.stringify({
            arCity: city.ar || '',
            lat: lat, lng: lng,
            enName: city.en,
            country: city.country || '',
            countryCode: (city.cc || '').toLowerCase(),
            names: names,
            ts: Date.now()
        }));
    } catch (_e) { /* quota or disabled storage — silent */ }
}

function _popularCitiesList(currentKey, n) {
    // يستخدم LOCAL_CITIES إن وُجد، وإلا FAMOUS_MOON_CITIES كـ fallback
    const max = n || 6;
    const out = [];
    try {
        if (typeof LOCAL_CITIES !== 'undefined' && Array.isArray(LOCAL_CITIES)) {
            for (const c of LOCAL_CITIES) {
                const key = makeSlug(c.en, c.lat, c.lng);
                if (key === currentKey) continue;
                out.push({ key, name: c.en, nameAr: c.ar, lat: c.lat, lng: c.lng });
                if (out.length >= max) break;
            }
            if (out.length > 0) return out;
        }
    } catch (_e) {}
    try {
        if (typeof FAMOUS_MOON_CITIES !== 'undefined' && FAMOUS_MOON_CITIES) {
            for (const key of Object.keys(FAMOUS_MOON_CITIES)) {
                if (key === currentKey) continue;
                const c = FAMOUS_MOON_CITIES[key];
                const name = key.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                out.push({ key, name, nameAr: name, lat: c.lat, lng: c.lng });
                if (out.length >= max) break;
            }
        }
    } catch (_e) {}
    return out;
}

function _buildQiblaUrl(citySlug, lat, lng) {
    // Always append -{lat}-{lng} so target page can parse coords via URL regex
    // and compute the correct Qibla angle — never fall back to Mecca by accident.
    if (isFinite(lat) && isFinite(lng)) {
        const la = Number(lat).toFixed(2);
        const lo = Number(lng).toFixed(2);
        return pageUrl(`/qibla-in-${citySlug}-${la}-${lo}`);
    }
    return pageUrl(`/qibla-in-${citySlug}`);
}

// Resolve a canonical Qibla slug for (englishName, lat, lng).
// Returns a FAMOUS_MOON_CITIES key when the input matches a known city
// (either by slug or within ~30 km by coordinates) — else null.
// Used to emit clean URLs (/qibla-in-riyadh) instead of coord URLs.
function _canonicalQiblaSlug(englishName, lat, lng) {
    try {
        if (typeof FAMOUS_MOON_CITIES === 'undefined') return null;
        // 1) Exact slug match
        if (englishName) {
            const slug = (typeof makeSlug === 'function') ? makeSlug(englishName, lat, lng) : '';
            if (slug && Object.prototype.hasOwnProperty.call(FAMOUS_MOON_CITIES, slug)) return slug;
        }
        // 2) Common aliases (Arabic-name slugs for the two holy cities)
        const ALIASES = {
            'makkah': 'mecca', 'makkah-al-mukarramah': 'mecca', 'makkah-al-mukarrama': 'mecca',
            'madinah': 'medina', 'al-madinah': 'medina', 'al-madinah-al-munawwarah': 'medina',
            'al-madinah-al-munawara': 'medina',
            'al-qahirah': 'cairo',
            'istanbul-turkey': 'istanbul'
        };
        if (englishName) {
            const rawSlug = (typeof makeSlug === 'function') ? makeSlug(englishName, lat, lng) : '';
            if (rawSlug && ALIASES[rawSlug]) return ALIASES[rawSlug];
        }
        // 3) Proximity search — match by coordinates (≤ 30 km)
        if (isFinite(lat) && isFinite(lng)) {
            let best = null, bestKm = Infinity;
            for (const k in FAMOUS_MOON_CITIES) {
                if (!Object.prototype.hasOwnProperty.call(FAMOUS_MOON_CITIES, k)) continue;
                const c = FAMOUS_MOON_CITIES[k];
                const d = _haversineKm(lat, lng, c.lat, c.lng);
                if (d < bestKm) { bestKm = d; best = k; }
            }
            if (best && bestKm <= 30) return best;
        }
    } catch (_e) {}
    return null;
}

// Build a clean Qibla city URL — ALWAYS /qibla-in-{slug}, never with coords.
//   • Priority 1: canonical FAMOUS_MOON_CITIES key via _canonicalQiblaSlug()
//   • Priority 2: hintSlug (when it matches a known famous slug)
//   • Priority 3: slug derived from the English name via makeSlug()
//   • Priority 4: last-resort slug derived from coords ("loc-xx-yy")
// Any slug returned here is resolvable client-side (LOCAL_CITIES) and server-side
// (_resolveCityForMoon → _getCitySlugIndex over db/cities-*.json).
function _buildQiblaCityUrl(englishName, lat, lng, hintSlug) {
    const canonical = _canonicalQiblaSlug(englishName || hintSlug || '', lat, lng);
    if (canonical) return pageUrl(`/qibla-in-${canonical}`);
    if (hintSlug && typeof FAMOUS_MOON_CITIES !== 'undefined'
        && Object.prototype.hasOwnProperty.call(FAMOUS_MOON_CITIES, hintSlug)) {
        return pageUrl(`/qibla-in-${hintSlug}`);
    }
    // Derive a slug from the English name — no coords suffix.
    let slug = hintSlug;
    if (!slug && englishName && typeof makeSlug === 'function') {
        slug = makeSlug(englishName, lat, lng);
    }
    // Last-resort when name missing: coordinate-only slug "loc-xx-yy" (still clean — no numeric suffix).
    if (!slug) {
        if (isFinite(lat) && isFinite(lng)) {
            const la = Math.abs(lat).toFixed(1) + (lat >= 0 ? 'n' : 's');
            const lo = Math.abs(lng).toFixed(1) + (lng >= 0 ? 'e' : 'w');
            slug = `loc-${la}-${lo}`;
        } else {
            slug = 'mecca';
        }
    }
    return pageUrl(`/qibla-in-${slug}`);
}

function _buildQiblaBreadcrumbOl(cityName, isHub, lang) {
    const ui = _QIBLA_UI[lang] || _QIBLA_UI.en;
    const homeHref = pageUrl('/') || '/';
    const qiblaHref = pageUrl('/qibla');
    const items = [
        { text: ui.bc_home, href: homeHref }
    ];
    if (isHub) {
        items.push({ text: ui.bc_qibla, current: true });
    } else {
        items.push({ text: ui.bc_qibla, href: qiblaHref });
        items.push({ text: cityName, current: true });
    }
    return _buildHijriBreadcrumbOl(items);
}

function _cardinalKeyFromAngle(deg) {
    const a = ((deg % 360) + 360) % 360;
    if (a < 22.5)  return 'qibla.direction_north';
    if (a < 67.5)  return 'qibla.direction_ne';
    if (a < 112.5) return 'qibla.direction_east';
    if (a < 157.5) return 'qibla.direction_se';
    if (a < 202.5) return 'qibla.direction_south';
    if (a < 247.5) return 'qibla.direction_sw';
    if (a < 292.5) return 'qibla.direction_west';
    if (a < 337.5) return 'qibla.direction_nw';
    return 'qibla.direction_north';
}

// ───── i18n UI table for Qibla Tool pages (10 languages) ─────
// Shape (Tool page — minimal):
//   bc_home, bc_qibla                       — breadcrumb labels
//   h1(city, isHub)                         — page title
//   summary(angle, cardinal, distanceKm, lang) — one-line summary "0° • شمال • 0 كم إلى الكعبة"
//   info_city, info_angle, info_lat, info_lng — 4 card labels
//   cta_prayer(city)                        — main button
//   link_moon(city), link_hijri, link_home  — 3 quick text links
//   other_cities_title                      — section heading
//   faq(ctx) → [[q, a]×4]                   — FAQ array (city already localized)
//   footer(ctx)                             — 1–2 sentence SEO paragraph
//   related_labels[3]                       — 3 related text-link labels
const _QIBLA_UI = {
    ar: {
        bc_home: 'الرئيسية', bc_qibla: 'اتجاه القبلة',
        h1: (city, isHub) => isHub ? `🧭 اتجاه القبلة` : `🧭 اتجاه القبلة في ${city}`,
        summary: (angle, cardinal, distKm, L) => `${angle}° • ${cardinal} • ${distKm.toLocaleString(L)} كم إلى الكعبة`,
        info_city: 'المدينة', info_angle: 'زاوية القبلة', info_lat: 'خط العرض', info_lng: 'خط الطول',
        cta_prayer: city => `🕌 مواقيت الصلاة في ${city}`,
        cta_note: city => `اعرف أوقات الصلاة في ${city} الآن →`,
        wow_caption: (city, cardinal) => `← أنت تتجه نحو الكعبة المشرفة (${cardinal})`,
        link_moon: city => `🌙 حالة القمر اليوم في ${city}`,
        link_hijri: '📅 التاريخ الهجري اليوم',
        link_home: '🏠 الصفحة الرئيسية',
        other_cities_title: 'مدن أخرى لاتجاه القبلة',
        faq_title: 'أسئلة شائعة',
        faq: (ctx) => [
            [`ما هي زاوية القبلة من ${ctx.cityName}؟`, `زاوية القبلة من ${ctx.cityName} تساوي تقريباً ${ctx.angle}° باتجاه ${ctx.cardinal}، مُقاسة من الشمال الجغرافي باتجاه عقارب الساعة.`],
            [`كم تبعد ${ctx.cityName} عن الكعبة؟`, `المسافة بين ${ctx.cityName} والكعبة المشرفة في مكة المكرمة تبلغ ${ctx.distanceKm.toLocaleString('ar')} كم تقريباً.`],
            [`كيف أحدّد اتجاه القبلة يدوياً؟`, `استخدم البوصلة أعلاه وأَدِر نفسك حتى يشير السهم إلى ${ctx.angle}°، مع الابتعاد عن المعادن لزيادة الدقة.`],
            [`هل الصلاة صحيحة مع انحراف بسيط؟`, `نعم، الانحراف اليسير مغتفر شرعاً ما دام الاتجاه العام إلى الكعبة.`]
        ],
        footer: ctx => `اتجاه القبلة في ${ctx.cityName} هو ${ctx.angle}° (${ctx.cardinal})، وتبلغ المسافة إلى الكعبة المشرفة ${ctx.distanceKm.toLocaleString('ar')} كم. يمكنك استخدام البوصلة أعلاه لتحديد الاتجاه بدقّة، أو الاستفادة من الخدمات التالية المرتبطة بمدينة ${ctx.cityName}:`,
        trust_note: '📍 يُحسب الاتجاه باستخدام إحداثيات الموقع الجغرافيّة بدقّة فلكيّة عالية.',
        related_labels: city => [`🕌 اعرف مواقيت الصلاة في ${city}`, `🌙 تحقّق من حالة القمر اليوم في ${city}`, `📅 اعرف التاريخ الهجري اليوم`],
    },
    en: {
        bc_home: 'Home', bc_qibla: 'Qibla Direction',
        h1: (city, isHub) => isHub ? `🧭 Qibla Direction` : `🧭 Qibla Direction in ${city}`,
        summary: (angle, cardinal, distKm, L) => `${angle}° • ${cardinal} • ${distKm.toLocaleString(L)} km to the Kaaba`,
        info_city: 'City', info_angle: 'Qibla Angle', info_lat: 'Latitude', info_lng: 'Longitude',
        cta_prayer: city => `🕌 Prayer Times in ${city}`,
        cta_note: city => `See today's prayer times in ${city} →`,
        wow_caption: (city, cardinal) => `← You are facing the Holy Kaaba (${cardinal})`,
        link_moon: city => `🌙 Moon Today in ${city}`,
        link_hijri: "📅 Today's Hijri Date",
        link_home: '🏠 Home',
        other_cities_title: 'Other cities for Qibla direction',
        faq_title: 'Frequently asked questions',
        faq: (ctx) => [
            [`What is the Qibla angle from ${ctx.cityName}?`, `The Qibla bearing from ${ctx.cityName} is about ${ctx.angle}° toward ${ctx.cardinal}, measured clockwise from true north.`],
            [`How far is ${ctx.cityName} from the Kaaba?`, `The great-circle distance between ${ctx.cityName} and the Kaaba is about ${ctx.distanceKm.toLocaleString('en')} km.`],
            [`How do I face the Qibla manually?`, `Use the compass above and turn until the needle points to ${ctx.angle}°; stay away from metal and magnets for better accuracy.`],
            [`Is my prayer valid with a small deviation?`, `Yes — minor deviation is religiously excused as long as you face the general direction of the Kaaba.`]
        ],
        footer: ctx => `The Qibla direction from ${ctx.cityName} is ${ctx.angle}° (${ctx.cardinal}), and the distance to the Holy Kaaba is ${ctx.distanceKm.toLocaleString('en')} km. Use the compass above to align precisely, or jump to services linked to ${ctx.cityName}:`,
        trust_note: '📍 The bearing is computed from geographic coordinates with high astronomical precision.',
        related_labels: city => [`🕌 See Prayer Times in ${city}`, `🌙 Check the Moon tonight in ${city}`, `📅 View today's Hijri date`],
    },
    fr: {
        bc_home: 'Accueil', bc_qibla: 'Direction de la Qibla',
        h1: (city, isHub) => isHub ? `🧭 Direction de la Qibla` : `🧭 Direction de la Qibla à ${city}`,
        summary: (angle, cardinal, distKm, L) => `${angle}° • ${cardinal} • ${distKm.toLocaleString(L)} km jusqu\u2019à la Kaaba`,
        info_city: 'Ville', info_angle: 'Angle de la Qibla', info_lat: 'Latitude', info_lng: 'Longitude',
        cta_prayer: city => `🕌 Horaires de prière à ${city}`,
        cta_note: city => `Voir les horaires de prière à ${city} →`,
        wow_caption: (city, cardinal) => `← Vous êtes orienté vers la Kaaba (${cardinal})`,
        link_moon: city => `🌙 La Lune aujourd\u2019hui à ${city}`,
        link_hijri: '📅 Date hégirienne du jour',
        link_home: '🏠 Accueil',
        other_cities_title: 'Autres villes pour la direction de la Qibla',
        faq_title: 'Questions fréquentes',
        faq: (ctx) => [
            [`Quel est l'angle de la Qibla depuis ${ctx.cityName} ?`, `L'azimut de la Qibla depuis ${ctx.cityName} est d'environ ${ctx.angle}° vers ${ctx.cardinal}, mesuré dans le sens horaire à partir du nord géographique.`],
            [`Quelle est la distance entre ${ctx.cityName} et la Kaaba ?`, `La distance orthodromique entre ${ctx.cityName} et la Kaaba est d'environ ${ctx.distanceKm.toLocaleString('fr')} km.`],
            [`Comment s'orienter vers la Qibla manuellement ?`, `Utilisez la boussole ci-dessus et tournez jusqu'à pointer ${ctx.angle}°; éloignez-vous du métal et des aimants pour plus de précision.`],
            [`La prière est-elle valide avec un léger écart ?`, `Oui, un écart mineur est toléré tant que l'orientation générale est vers la Kaaba.`]
        ],
        footer: ctx => `La direction de la Qibla depuis ${ctx.cityName} est de ${ctx.angle}° (${ctx.cardinal}), et la distance jusqu'à la Sainte Kaaba est d'environ ${ctx.distanceKm.toLocaleString('fr')} km. Utilisez la boussole ci-dessus pour vous orienter précisément, ou accédez aux services liés à ${ctx.cityName} :`,
        trust_note: '📍 Le cap est calculé à partir des coordonnées géographiques avec une haute précision astronomique.',
        related_labels: city => [`🕌 Voir les horaires de prière à ${city}`, `🌙 Vérifier la Lune ce soir à ${city}`, `📅 Voir la date hégirienne du jour`],
    },
    tr: {
        bc_home: 'Ana Sayfa', bc_qibla: 'Kıble Yönü',
        h1: (city, isHub) => isHub ? `🧭 Kıble Yönü` : `🧭 ${city} Kıble Yönü`,
        summary: (angle, cardinal, distKm, L) => `${angle}° • ${cardinal} • Kâbe\u2019ye ${distKm.toLocaleString(L)} km`,
        info_city: 'Şehir', info_angle: 'Kıble Açısı', info_lat: 'Enlem', info_lng: 'Boylam',
        cta_prayer: city => `🕌 ${city} Namaz Vakitleri`,
        cta_note: city => `${city} için günün namaz vakitlerini görün →`,
        wow_caption: (city, cardinal) => `← Kutsal Kâbe'ye yöneliksiniz (${cardinal})`,
        link_moon: city => `🌙 ${city}'de Bugün Ay`,
        link_hijri: '📅 Bugün Hicri Tarih',
        link_home: '🏠 Ana Sayfa',
        other_cities_title: 'Kıble yönü için diğer şehirler',
        faq_title: 'Sıkça sorulan sorular',
        faq: (ctx) => [
            [`${ctx.cityName} için kıble açısı nedir?`, `${ctx.cityName} için kıble açısı yaklaşık ${ctx.angle}°, ${ctx.cardinal} yönünde; coğrafi kuzeyden saat yönünde ölçülür.`],
            [`${ctx.cityName} Kâbe'ye ne kadar uzak?`, `${ctx.cityName} ile Kâbe arasındaki büyük daire mesafesi yaklaşık ${ctx.distanceKm.toLocaleString('tr')} km'dir.`],
            [`Kıbleye manuel olarak nasıl yönelirim?`, `Yukarıdaki pusulayı kullanın ve iğne ${ctx.angle}° gösterene kadar dönün; metal ve mıknatıslardan uzak durun.`],
            [`Küçük bir sapma ile namaz geçerli mi?`, `Evet — genel olarak Kâbe'ye yöneldiğiniz sürece küçük sapmalar mazurdur.`]
        ],
        footer: ctx => `${ctx.cityName} için kıble yönü ${ctx.angle}° (${ctx.cardinal}), Kutsal Kâbe'ye uzaklık ise ${ctx.distanceKm.toLocaleString('tr')} km'dir. Hassas yönelim için yukarıdaki pusulayı kullanın veya ${ctx.cityName} ile ilgili aşağıdaki hizmetlere geçin:`,
        trust_note: '📍 Yön, coğrafi koordinatlardan yüksek astronomik doğrulukla hesaplanır.',
        related_labels: city => [`🕌 ${city} için namaz vakitlerini görün`, `🌙 Bu gece ${city} için Ay durumunu kontrol edin`, `📅 Bugünün hicri tarihini görün`],
    },
    ur: {
        bc_home: 'ہوم', bc_qibla: 'سمتِ قبلہ',
        h1: (city, isHub) => isHub ? `🧭 سمتِ قبلہ` : `🧭 ${city} سے سمتِ قبلہ`,
        summary: (angle, cardinal, distKm, L) => `${angle}° • ${cardinal} • کعبہ تک ${distKm.toLocaleString(L)} کلومیٹر`,
        info_city: 'شہر', info_angle: 'قبلہ کا زاویہ', info_lat: 'عرض البلد', info_lng: 'طول البلد',
        cta_prayer: city => `🕌 ${city} کے نماز اوقات`,
        cta_note: city => `${city} کے آج کے نماز اوقات دیکھیں →`,
        wow_caption: (city, cardinal) => `← آپ کعبہ مکرمہ کی طرف رخ کیے ہوئے ہیں (${cardinal})`,
        link_moon: city => `🌙 ${city} میں آج چاند`,
        link_hijri: '📅 آج کی ہجری تاریخ',
        link_home: '🏠 ہوم',
        other_cities_title: 'قبلہ کی سمت کے لیے دیگر شہر',
        faq_title: 'اکثر پوچھے جانے والے سوالات',
        faq: (ctx) => [
            [`${ctx.cityName} سے قبلہ کا زاویہ کیا ہے؟`, `${ctx.cityName} سے قبلہ کا زاویہ تقریباً ${ctx.angle}° ہے بسمت ${ctx.cardinal}، جغرافیائی شمال سے گھڑی کی سوئی کی سمت ناپا جاتا ہے۔`],
            [`${ctx.cityName} کعبہ سے کتنا دور ہے؟`, `${ctx.cityName} اور کعبہ کے درمیان فاصلہ تقریباً ${ctx.distanceKm.toLocaleString('ur')} کلومیٹر ہے۔`],
            [`قبلہ کی سمت کیسے متعین کریں؟`, `اوپر دی گئی بوصلہ استعمال کریں اور اس وقت تک مڑیں جب تک سوئی ${ctx.angle}° کی طرف اشارہ نہ کرے، دھات و مقناطیس سے دور رہیں۔`],
            [`کیا معمولی فرق کے ساتھ نماز درست ہے؟`, `جی ہاں، معمولی انحراف شرعاً معاف ہے جب تک آپ عمومی طور پر کعبہ کی طرف ہوں۔`]
        ],
        footer: ctx => `${ctx.cityName} سے سمتِ قبلہ ${ctx.angle}° (${ctx.cardinal}) ہے، اور کعبہ مکرمہ تک فاصلہ ${ctx.distanceKm.toLocaleString('ur')} کلومیٹر ہے۔ درست سمت کے لیے اوپر دی گئی بوصلہ استعمال کریں، یا ${ctx.cityName} سے متعلقہ درج ذیل خدمات پر جائیں:`,
        trust_note: '📍 سمت جغرافیائی نقاط سے فلکی دقت کے ساتھ احتساب کی جاتی ہے۔',
        related_labels: city => [`🕌 ${city} کے نماز اوقات دیکھیں`, `🌙 آج رات ${city} میں چاند کی حالت چیک کریں`, `📅 آج کی ہجری تاریخ دیکھیں`],
    },
    de: {
        bc_home: 'Startseite', bc_qibla: 'Qibla-Richtung',
        h1: (city, isHub) => isHub ? `🧭 Qibla-Richtung` : `🧭 Qibla-Richtung in ${city}`,
        summary: (angle, cardinal, distKm, L) => `${angle}° • ${cardinal} • ${distKm.toLocaleString(L)} km zur Kaaba`,
        info_city: 'Stadt', info_angle: 'Qibla-Winkel', info_lat: 'Breitengrad', info_lng: 'Längengrad',
        cta_prayer: city => `🕌 Gebetszeiten in ${city}`,
        cta_note: city => `Gebetszeiten in ${city} heute anzeigen →`,
        wow_caption: (city, cardinal) => `← Sie sind zur heiligen Kaaba ausgerichtet (${cardinal})`,
        link_moon: city => `🌙 Mond heute in ${city}`,
        link_hijri: '📅 Heutiges Hidschri-Datum',
        link_home: '🏠 Startseite',
        other_cities_title: 'Andere Städte für die Qibla-Richtung',
        faq_title: 'Häufig gestellte Fragen',
        faq: (ctx) => [
            [`Wie groß ist der Qibla-Winkel von ${ctx.cityName}?`, `Die Qibla-Peilung von ${ctx.cityName} beträgt etwa ${ctx.angle}° nach ${ctx.cardinal}, im Uhrzeigersinn vom geografischen Norden gemessen.`],
            [`Wie weit ist ${ctx.cityName} von der Kaaba entfernt?`, `Die Großkreis-Entfernung zwischen ${ctx.cityName} und der Kaaba beträgt etwa ${ctx.distanceKm.toLocaleString('de')} km.`],
            [`Wie richte ich mich manuell zur Qibla aus?`, `Benutzen Sie den Kompass oben und drehen Sie sich, bis die Nadel auf ${ctx.angle}° zeigt; halten Sie sich von Metall und Magneten fern.`],
            [`Ist mein Gebet bei kleiner Abweichung gültig?`, `Ja — eine geringfügige Abweichung ist religiös entschuldigt, solange Sie in die allgemeine Richtung der Kaaba schauen.`]
        ],
        footer: ctx => `Die Qibla-Richtung von ${ctx.cityName} beträgt ${ctx.angle}° (${ctx.cardinal}), die Entfernung zur heiligen Kaaba liegt bei ${ctx.distanceKm.toLocaleString('de')} km. Richten Sie sich mit dem Kompass oben präzise aus oder nutzen Sie die folgenden auf ${ctx.cityName} bezogenen Dienste:`,
        trust_note: '📍 Die Peilung wird aus geografischen Koordinaten mit hoher astronomischer Genauigkeit berechnet.',
        related_labels: city => [`🕌 Gebetszeiten in ${city} ansehen`, `🌙 Mond heute Abend in ${city} prüfen`, `📅 Heutiges Hidschri-Datum anzeigen`],
    },
    id: {
        bc_home: 'Beranda', bc_qibla: 'Arah Kiblat',
        h1: (city, isHub) => isHub ? `🧭 Arah Kiblat` : `🧭 Arah Kiblat di ${city}`,
        summary: (angle, cardinal, distKm, L) => `${angle}° • ${cardinal} • ${distKm.toLocaleString(L)} km ke Kakbah`,
        info_city: 'Kota', info_angle: 'Sudut Kiblat', info_lat: 'Lintang', info_lng: 'Bujur',
        cta_prayer: city => `🕌 Jadwal Salat di ${city}`,
        cta_note: city => `Lihat jadwal salat di ${city} hari ini →`,
        wow_caption: (city, cardinal) => `← Anda menghadap Ka'bah (${cardinal})`,
        link_moon: city => `🌙 Bulan Hari Ini di ${city}`,
        link_hijri: '📅 Tanggal Hijriah Hari Ini',
        link_home: '🏠 Beranda',
        other_cities_title: 'Kota lain untuk arah kiblat',
        faq_title: 'Pertanyaan umum',
        faq: (ctx) => [
            [`Berapa sudut kiblat dari ${ctx.cityName}?`, `Sudut kiblat dari ${ctx.cityName} sekitar ${ctx.angle}° ke arah ${ctx.cardinal}, diukur searah jarum jam dari utara sejati.`],
            [`Berapa jarak ${ctx.cityName} ke Kakbah?`, `Jarak lingkaran besar antara ${ctx.cityName} dan Kakbah sekitar ${ctx.distanceKm.toLocaleString('id')} km.`],
            [`Bagaimana menentukan kiblat secara manual?`, `Gunakan kompas di atas dan putar tubuh hingga jarum menunjuk ke ${ctx.angle}°; jauhkan dari logam dan magnet.`],
            [`Apakah salat sah dengan sedikit pergeseran?`, `Ya — pergeseran kecil dimaafkan selama Anda menghadap arah umum Kakbah.`]
        ],
        footer: ctx => `Arah kiblat dari ${ctx.cityName} adalah ${ctx.angle}° (${ctx.cardinal}), dan jarak ke Kakbah yang mulia sekitar ${ctx.distanceKm.toLocaleString('id')} km. Gunakan kompas di atas untuk mengarah dengan tepat, atau buka layanan berikut yang terkait dengan ${ctx.cityName}:`,
        trust_note: '📍 Sudut dihitung dari koordinat geografis dengan presisi astronomis tinggi.',
        related_labels: city => [`🕌 Lihat jadwal salat di ${city}`, `🌙 Cek bulan malam ini di ${city}`, `📅 Lihat tanggal Hijriah hari ini`],
    },
    es: {
        bc_home: 'Inicio', bc_qibla: 'Dirección de la Qibla',
        h1: (city, isHub) => isHub ? `🧭 Dirección de la Qibla` : `🧭 Dirección de la Qibla en ${city}`,
        summary: (angle, cardinal, distKm, L) => `${angle}° • ${cardinal} • ${distKm.toLocaleString(L)} km hasta la Kaaba`,
        info_city: 'Ciudad', info_angle: 'Ángulo de la Qibla', info_lat: 'Latitud', info_lng: 'Longitud',
        cta_prayer: city => `🕌 Horarios de oración en ${city}`,
        cta_note: city => `Ver los horarios de oración en ${city} hoy →`,
        wow_caption: (city, cardinal) => `← Estás orientado hacia la Kaaba (${cardinal})`,
        link_moon: city => `🌙 La Luna hoy en ${city}`,
        link_hijri: '📅 Fecha Hijri de hoy',
        link_home: '🏠 Inicio',
        other_cities_title: 'Otras ciudades para la dirección de la Qibla',
        faq_title: 'Preguntas frecuentes',
        faq: (ctx) => [
            [`¿Cuál es el ángulo de la Qibla desde ${ctx.cityName}?`, `El rumbo de la Qibla desde ${ctx.cityName} es de unos ${ctx.angle}° hacia ${ctx.cardinal}, medido en sentido horario desde el norte verdadero.`],
            [`¿A qué distancia está ${ctx.cityName} de la Kaaba?`, `La distancia ortodrómica entre ${ctx.cityName} y la Kaaba es de unos ${ctx.distanceKm.toLocaleString('es')} km.`],
            [`¿Cómo oriento manualmente hacia la Qibla?`, `Use la brújula de arriba y gire hasta que la aguja apunte a ${ctx.angle}°; manténgase lejos de metales e imanes.`],
            [`¿Es válida la oración con una pequeña desviación?`, `Sí — una desviación leve está excusada siempre que mire en la dirección general de la Kaaba.`]
        ],
        footer: ctx => `La dirección de la Qibla desde ${ctx.cityName} es de ${ctx.angle}° (${ctx.cardinal}), y la distancia a la Sagrada Kaaba es de unos ${ctx.distanceKm.toLocaleString('es')} km. Use la brújula de arriba para orientarse con precisión, o acceda a los siguientes servicios vinculados a ${ctx.cityName}:`,
        trust_note: '📍 El rumbo se calcula a partir de las coordenadas geográficas con alta precisión astronómica.',
        related_labels: city => [`🕌 Ver los horarios de oración en ${city}`, `🌙 Consultar la Luna esta noche en ${city}`, `📅 Ver la fecha Hijri de hoy`],
    },
    bn: {
        bc_home: 'হোম', bc_qibla: 'কিবলার দিক',
        h1: (city, isHub) => isHub ? `🧭 কিবলার দিক` : `🧭 ${city}-এ কিবলার দিক`,
        summary: (angle, cardinal, distKm, L) => `${angle}° • ${cardinal} • কাবা পর্যন্ত ${distKm.toLocaleString(L)} কিমি`,
        info_city: 'শহর', info_angle: 'কিবলার কোণ', info_lat: 'অক্ষাংশ', info_lng: 'দ্রাঘিমাংশ',
        cta_prayer: city => `🕌 ${city}-এ নামাজের সময়`,
        cta_note: city => `${city}-এ আজকের নামাজের সময় দেখুন →`,
        wow_caption: (city, cardinal) => `← আপনি পবিত্র কাবার দিকে মুখ করে আছেন (${cardinal})`,
        link_moon: city => `🌙 আজ চাঁদ ${city}-এ`,
        link_hijri: '📅 আজকের হিজরি তারিখ',
        link_home: '🏠 হোম',
        other_cities_title: 'কিবলার দিকের জন্য অন্যান্য শহর',
        faq_title: 'সাধারণ প্রশ্ন',
        faq: (ctx) => [
            [`${ctx.cityName} থেকে কিবলার কোণ কত?`, `${ctx.cityName} থেকে কিবলার কোণ আনুমানিক ${ctx.angle}° ${ctx.cardinal} অভিমুখে, প্রকৃত উত্তর থেকে ঘড়ির কাঁটার দিকে মাপা হয়।`],
            [`${ctx.cityName} কাবা থেকে কত দূরে?`, `${ctx.cityName} এবং কাবার মধ্যে মহাবৃত্তীয় দূরত্ব প্রায় ${ctx.distanceKm.toLocaleString('bn')} কিমি।`],
            [`ম্যানুয়ালি কিবলার দিক কীভাবে নির্ধারণ করব?`, `উপরের কম্পাস ব্যবহার করুন এবং সূঁচ ${ctx.angle}° না পৌঁছানো পর্যন্ত ঘুরুন; ধাতু ও চুম্বক থেকে দূরে থাকুন।`],
            [`সামান্য ভিন্নতায় কি নামাজ শুদ্ধ?`, `হ্যাঁ — যতক্ষণ আপনি সাধারণভাবে কাবার দিকে মুখ করে আছেন, সামান্য বিচ্যুতি শরীয়তের দৃষ্টিতে মাফ।`]
        ],
        footer: ctx => `${ctx.cityName} থেকে কিবলার দিক ${ctx.angle}° (${ctx.cardinal}), এবং পবিত্র কাবা পর্যন্ত দূরত্ব প্রায় ${ctx.distanceKm.toLocaleString('bn')} কিমি। সঠিকভাবে মুখ করার জন্য উপরের কম্পাস ব্যবহার করুন, অথবা ${ctx.cityName}-এর সাথে সম্পর্কিত নিম্নলিখিত পরিষেবাগুলিতে যান:`,
        trust_note: '📍 দিকটি ভৌগোলিক স্থানাঙ্ক থেকে উচ্চ জ্যোতির্বিজ্ঞানীয় নির্ভুলতায় গণনা করা হয়।',
        related_labels: city => [`🕌 ${city}-এ নামাজের সময় দেখুন`, `🌙 আজ রাতে ${city}-এ চাঁদের অবস্থা দেখুন`, `📅 আজকের হিজরি তারিখ দেখুন`],
    },
    ms: {
        bc_home: 'Utama', bc_qibla: 'Arah Kiblat',
        h1: (city, isHub) => isHub ? `🧭 Arah Kiblat` : `🧭 Arah Kiblat di ${city}`,
        summary: (angle, cardinal, distKm, L) => `${angle}° • ${cardinal} • ${distKm.toLocaleString(L)} km ke Kaabah`,
        info_city: 'Bandar', info_angle: 'Sudut Kiblat', info_lat: 'Latitud', info_lng: 'Longitud',
        cta_prayer: city => `🕌 Waktu Solat di ${city}`,
        cta_note: city => `Lihat waktu solat di ${city} hari ini →`,
        wow_caption: (city, cardinal) => `← Anda sedang menghadap Kaabah (${cardinal})`,
        link_moon: city => `🌙 Bulan Hari Ini di ${city}`,
        link_hijri: '📅 Tarikh Hijrah Hari Ini',
        link_home: '🏠 Utama',
        other_cities_title: 'Bandar lain untuk arah kiblat',
        faq_title: 'Soalan lazim',
        faq: (ctx) => [
            [`Apakah sudut kiblat dari ${ctx.cityName}?`, `Sudut kiblat dari ${ctx.cityName} adalah kira-kira ${ctx.angle}° menuju ${ctx.cardinal}, diukur mengikut arah jam dari utara sebenar.`],
            [`Berapa jauh ${ctx.cityName} dari Kaabah?`, `Jarak bulatan agung antara ${ctx.cityName} dan Kaabah adalah kira-kira ${ctx.distanceKm.toLocaleString('ms')} km.`],
            [`Bagaimana menentukan kiblat secara manual?`, `Gunakan kompas di atas dan pusing sehingga jarum menunjuk ke ${ctx.angle}°; jauhkan dari logam dan magnet.`],
            [`Adakah solat sah dengan sedikit penyimpangan?`, `Ya — penyimpangan kecil dimaafkan selagi anda menghadap arah umum Kaabah.`]
        ],
        footer: ctx => `Arah kiblat dari ${ctx.cityName} ialah ${ctx.angle}° (${ctx.cardinal}), dan jarak ke Kaabah yang mulia adalah kira-kira ${ctx.distanceKm.toLocaleString('ms')} km. Gunakan kompas di atas untuk mengarah dengan tepat, atau lawati perkhidmatan berikut yang berkaitan dengan ${ctx.cityName}:`,
        trust_note: '📍 Arah dikira daripada koordinat geografi dengan ketepatan astronomi yang tinggi.',
        related_labels: city => [`🕌 Lihat waktu solat di ${city}`, `🌙 Semak bulan malam ini di ${city}`, `📅 Lihat tarikh Hijrah hari ini`],
    },
};

// ============================================================================
// Round 30 — Qibla HUB UI (Decision-Engine landing page)
//   /qibla = tool-entry page: Hero CTA → geolocation OR city chip → /qibla-in-*
//   No fake angle/distance/city values. No Place schema.
// ============================================================================
const _QIBLA_HUB_UI = {
    ar: {
        title: '🧭 اعرف اتجاه القبلة بدقّة من أيّ مكان في العالم',
        subtitle: 'باستخدام بوصلة ذكيّة تعتمد على موقعك الجغرافيّ أو اختيار مدينتك',
        hero_badges: ['يعمل في جميع الدول', 'دقّة فلكيّة عالية'],
        smart_pill_prefix: 'آخر موقع استخدمته',
        smart_pill_cta: 'اعرف اتجاه القبلة',
        geo_btn: '📍 اعرف اتجاه القبلة من موقعي',
        geo_btn_loading: 'جارٍ تحديد موقعك…',
        cta_pick_city: '🌍 اختر مدينتك يدويّاً',
        cta_microcopy: 'سيتمّ تحديد موقعك تلقائيًّا خلال ثوانٍ',
        geo_status_loading: '… جارٍ تحديد موقعك',
        geo_status_denied: '⚠️ لم نتمكّن من تحديد موقعك — يمكنك البحث عن مدينتك في الأسفل.',
        geo_status_unavailable: 'متصفّحك لا يدعم تحديد الموقع — ابحث عن مدينتك في الأسفل.',
        trust_chips: ['دقّة عالية باستخدام GPS', 'يعمل بدون تطبيق', 'مناسب لجميع الدول'],
        authority_note: '📍 يُحسب اتجاه القبلة باستخدام إحداثيّات دقيقة ونماذج فلكيّة معتمدة.',
        search_placeholder: 'ابحث عن مدينتك (مثال: الرياض، القاهرة، Istanbul)',
        search_empty: 'لا توجد مدن مطابقة — جرّب اختيار بلد من الأسفل.',
        visited_title: '🕓 آخر المدن التي زرتها',
        cities_title: 'المدن الأكثر بحثًا عن القبلة',
        tier1_label: 'مميّز',
        countries_title: '🌐 اختر بلدك',
        countries_note: 'اختر بلدك لعرض أقرب المدن إليك.',
        howto_title: 'كيف تحدّد اتجاه القبلة؟',
        howto_steps: [
            'اضغط «اعرف اتجاه القبلة من موقعي»، أو اكتب اسم مدينتك في شريط البحث أعلاه.',
            'نحسب الزاوية الدقيقة نحو الكعبة المشرّفة باستخدام صيغة Great-Circle الفلكيّة.',
            'اتّجِه بهاتفك أو بوصلتك نحو الزاوية المعروضة — ستكون الكعبة أمامك مباشرةً.'
        ],
        usecases_title: 'يمكنك استخدامها في أيّ مكان',
        usecases: [
            { icon: '🏠', label: 'في البيت' },
            { icon: '✈️', label: 'في السفر' },
            { icon: '🕌', label: 'في المسجد' },
            { icon: '🌍', label: 'حول العالم' }
        ],
        faq_title: 'أسئلة شائعة',
        faq: [
            ['كيف أحدّد اتجاه القبلة بدقّة؟',
             'اضغط زرّ «اعرف اتجاه القبلة من موقعي» ليحدّد المتصفّح موقعك تلقائيًّا، ثمّ نحسب الزاوية هندسيًّا نحو الكعبة المشرّفة بمعادلة Great-Circle الفلكيّة. إذا لم ترغب بمشاركة الموقع، يمكنك اختيار مدينتك من قائمة المدن للحصول على نفس الدقّة.'],
            ['هل يمكن معرفة القبلة بدون GPS؟',
             'نعم — اختر مدينتك من قائمة المدن أو ابحث عن اسمها، وسنعرض لك اتجاه القبلة الدقيق من تلك المدينة بالاعتماد على إحداثيّاتها الرسميّة.'],
            ['ما هي زاوية القبلة؟',
             'زاوية القبلة هي الاتجاه الأقصر هندسيًّا بين موقعك والكعبة المشرّفة على سطح الكرة الأرضيّة، وتُقاس بالدرجات انطلاقًا من الشمال الجغرافيّ.'],
            ['هل تختلف القبلة حسب الموقع؟',
             'نعم — تختلف زاوية القبلة من مدينة إلى أخرى بحسب موقعها نسبةً إلى مكّة المكرّمة، لذلك نحسب الزاوية مخصّصة لموقعك أو لمدينتك المختارة.']
        ],
        footer: 'استخدم هذه الصفحة لتحديد اتجاه القبلة من أيّ مكان في العالم، عبر تحديد موقعك تلقائيًّا أو اختيار مدينتك، للحصول على زاوية دقيقة نحو الكعبة المشرّفة.',
        trust_note: '📍 يُحسب الاتجاه باستخدام إحداثيّات الموقع الجغرافيّة بدقّة فلكيّة عالية.',
        bc_home: 'الرئيسيّة', bc_qibla: 'اتجاه القبلة'
    },
    en: {
        title: '🧭 Find the exact Qibla direction from anywhere in the world',
        subtitle: 'Use a smart compass powered by your geolocation — or pick your city manually',
        hero_badges: ['Works in every country', 'High astronomical precision'],
        smart_pill_prefix: 'Last location you used',
        smart_pill_cta: 'Show Qibla',
        geo_btn: '📍 Show Qibla from my location',
        geo_btn_loading: 'Detecting your location…',
        cta_pick_city: '🌍 Pick your city manually',
        cta_microcopy: 'Your location will be detected automatically in seconds',
        geo_status_loading: '… Detecting your location',
        geo_status_denied: "⚠️ Couldn't detect your location — search for your city below.",
        geo_status_unavailable: 'Your browser does not support geolocation — search for your city below.',
        trust_chips: ['High-precision GPS', 'No app required', 'Works in every country'],
        authority_note: '📍 Qibla direction is computed from precise coordinates using certified astronomical models.',
        search_placeholder: 'Search for your city (e.g. Riyadh, Cairo, Istanbul)',
        search_empty: 'No matching city — try picking a country below.',
        visited_title: '🕓 Recently visited cities',
        cities_title: 'Most-searched Qibla cities',
        tier1_label: 'Featured',
        countries_title: '🌐 Choose your country',
        countries_note: 'Pick your country to see the nearest cities.',
        howto_title: 'How do you find the Qibla?',
        howto_steps: [
            'Tap "Show Qibla from my location" — or type your city into the search above.',
            'We compute the precise bearing toward the Kaaba using the astronomical Great-Circle formula.',
            'Point your phone or compass at the displayed angle — the Kaaba is directly in front of you.'
        ],
        usecases_title: 'Use it anywhere',
        usecases: [
            { icon: '🏠', label: 'At home' },
            { icon: '✈️', label: 'While traveling' },
            { icon: '🕌', label: 'At the mosque' },
            { icon: '🌍', label: 'Anywhere in the world' }
        ],
        faq_title: 'Frequently asked questions',
        faq: [
            ['How do I determine the Qibla direction accurately?',
             "Click 'Show Qibla from my location' and let your browser detect your position. We then compute the bearing toward the Kaaba geometrically using the Great-Circle formula. If you prefer not to share location, pick your city from the list to get the same precision."],
            ['Can I find the Qibla without GPS?',
             'Yes — pick your city from the list or search for it by name. We display the exact Qibla direction from that city using its official coordinates.'],
            ['What is the Qibla angle?',
             'The Qibla angle is the shortest geometric bearing between your location and the Holy Kaaba on the surface of the Earth, measured in degrees from true north.'],
            ['Does the Qibla differ by location?',
             'Yes — the Qibla bearing changes from one city to another based on its position relative to Makkah, so we compute a custom angle for your location or chosen city.']
        ],
        footer: 'Use this page to find the Qibla direction from anywhere in the world, either by detecting your location automatically or by choosing your city, to get a precise bearing toward the Holy Kaaba.',
        trust_note: '📍 The bearing is computed from geographic coordinates with high astronomical precision.',
        bc_home: 'Home', bc_qibla: 'Qibla Direction'
    },
    fr: {
        title: '🧭 Trouvez la direction exacte de la Qibla depuis n\'importe où',
        subtitle: 'Boussole intelligente basée sur votre géolocalisation ou sur le choix de votre ville',
        hero_badges: ['Fonctionne dans tous les pays', 'Haute précision astronomique'],
        smart_pill_prefix: 'Dernière position utilisée',
        smart_pill_cta: 'Voir la Qibla',
        geo_btn: '📍 Afficher la Qibla depuis ma position',
        geo_btn_loading: 'Détection de votre position…',
        cta_pick_city: '🌍 Choisissez votre ville manuellement',
        cta_microcopy: 'Votre position sera détectée automatiquement en quelques secondes',
        geo_status_loading: '… Détection de votre position',
        geo_status_denied: '⚠️ Impossible de détecter votre position — recherchez votre ville ci-dessous.',
        geo_status_unavailable: 'Votre navigateur ne prend pas en charge la géolocalisation — recherchez votre ville.',
        trust_chips: ['GPS haute précision', 'Sans application', 'Fonctionne partout'],
        authority_note: '📍 La Qibla est calculée à partir de coordonnées précises et de modèles astronomiques certifiés.',
        search_placeholder: 'Recherchez votre ville (ex. Paris, Le Caire, Istanbul)',
        search_empty: 'Aucune ville trouvée — essayez un pays ci-dessous.',
        visited_title: '🕓 Villes récemment visitées',
        cities_title: 'Villes les plus consultées pour la Qibla',
        tier1_label: 'En vedette',
        countries_title: '🌐 Choisissez votre pays',
        countries_note: 'Choisissez votre pays pour voir les villes les plus proches.',
        howto_title: 'Comment trouvez-vous la Qibla ?',
        howto_steps: [
            'Appuyez sur « Afficher la Qibla depuis ma position » — ou saisissez votre ville dans la recherche.',
            "Nous calculons l'angle précis vers la Kaaba avec la formule astronomique du cercle orthodromique.",
            "Orientez votre téléphone ou votre boussole sur l'angle affiché — la Kaaba est droit devant vous."
        ],
        usecases_title: 'Utilisable partout',
        usecases: [
            { icon: '🏠', label: 'À la maison' },
            { icon: '✈️', label: 'En voyage' },
            { icon: '🕌', label: 'À la mosquée' },
            { icon: '🌍', label: 'Partout dans le monde' }
        ],
        faq_title: 'Questions fréquentes',
        faq: [
            ['Comment déterminer la direction de la Qibla avec précision ?',
             "Cliquez sur « Afficher la Qibla depuis ma position » pour que le navigateur détecte votre position. Nous calculons ensuite l'angle vers la Kaaba géométriquement avec la formule du cercle orthodromique. Si vous préférez ne pas partager votre position, choisissez votre ville dans la liste."],
            ['Peut-on connaître la Qibla sans GPS ?',
             'Oui — sélectionnez votre ville dans la liste ou recherchez-la. Nous affichons la direction exacte de la Qibla depuis cette ville à partir de ses coordonnées officielles.'],
            ['Qu\'est-ce que l\'angle de la Qibla ?',
             'L\'angle de la Qibla est l\'orientation géométrique la plus courte entre votre position et la Sainte Kaaba à la surface de la Terre, mesurée en degrés à partir du nord géographique.'],
            ['La Qibla varie-t-elle selon la position ?',
             'Oui — l\'angle de la Qibla change d\'une ville à l\'autre selon sa position par rapport à La Mecque, c\'est pourquoi nous calculons un angle personnalisé pour votre localisation ou votre ville.']
        ],
        footer: 'Cette page vous permet de trouver la direction de la Qibla de n\'importe où dans le monde, en détectant votre position ou en choisissant votre ville, pour obtenir un angle précis vers la Sainte Kaaba.',
        trust_note: '📍 La direction est calculée à partir de coordonnées géographiques avec une haute précision astronomique.',
        bc_home: 'Accueil', bc_qibla: 'Direction de la Qibla'
    },
    tr: {
        title: '🧭 Dünyanın her yerinden Kıble yönünü hassasiyetle bulun',
        subtitle: 'Coğrafi konumunuza veya şehrinizi seçmenize dayalı akıllı pusula',
        hero_badges: ['Her ülkede çalışır', 'Yüksek astronomik doğruluk'],
        smart_pill_prefix: 'Son kullandığınız konum',
        smart_pill_cta: 'Kıbleyi göster',
        geo_btn: '📍 Konumumdan Kıbleyi göster',
        geo_btn_loading: 'Konumunuz belirleniyor…',
        cta_pick_city: '🌍 Şehrinizi elle seçin',
        cta_microcopy: 'Konumunuz saniyeler içinde otomatik olarak tespit edilecek',
        geo_status_loading: '… Konumunuz belirleniyor',
        geo_status_denied: '⚠️ Konumunuza erişilemedi — aşağıdan şehrinizi arayın.',
        geo_status_unavailable: 'Tarayıcınız konum desteklemiyor — aşağıdan şehrinizi arayın.',
        trust_chips: ['Yüksek hassasiyetli GPS', 'Uygulama gerekmez', 'Her ülkede çalışır'],
        authority_note: '📍 Kıble yönü, hassas koordinatlar ve onaylı astronomik modellerle hesaplanır.',
        search_placeholder: 'Şehrinizi arayın (örn. İstanbul, Kahire, Riyad)',
        search_empty: 'Eşleşen şehir yok — aşağıdan bir ülke deneyin.',
        visited_title: '🕓 Son ziyaret edilen şehirler',
        cities_title: 'En çok aranan Kıble şehirleri',
        tier1_label: 'Öne çıkan',
        countries_title: '🌐 Ülkenizi seçin',
        countries_note: 'Size en yakın şehirleri görmek için ülkenizi seçin.',
        howto_title: 'Kıbleyi nasıl buluyorsunuz?',
        howto_steps: [
            '"Konumumdan Kıbleyi göster" butonuna dokunun veya yukarıdaki aramadan şehrinizi seçin.',
            "Büyük Çember (Great-Circle) formülüyle Kâbe'ye olan kesin açıyı hesaplarız.",
            'Telefonunuzu veya pusulanızı gösterilen açıya çevirin — Kâbe tam karşınızdadır.'
        ],
        usecases_title: 'Her yerde kullanılır',
        usecases: [
            { icon: '🏠', label: 'Evde' },
            { icon: '✈️', label: 'Seyahatte' },
            { icon: '🕌', label: 'Camide' },
            { icon: '🌍', label: 'Dünyanın her yerinde' }
        ],
        faq_title: 'Sıkça sorulan sorular',
        faq: [
            ['Kıble yönünü tam olarak nasıl belirlerim?',
             "'Konumumdan Kıbleyi göster' düğmesine dokunun; tarayıcı konumunuzu tespit etsin. Ardından Büyük Çember formülüyle Kâbe'ye yönü geometrik olarak hesaplarız. Konum paylaşmak istemiyorsanız aşağıdaki listeden şehrinizi seçebilirsiniz."],
            ['GPS olmadan Kıble yönü bulunabilir mi?',
             'Evet — şehrinizi listeden seçin veya adını arayın. O şehrin resmî koordinatlarına göre tam Kıble yönünü gösteririz.'],
            ['Kıble açısı nedir?',
             'Kıble açısı, bulunduğunuz yer ile Kâbe arasındaki en kısa geometrik yöndür; gerçek kuzeyden dereceyle ölçülür.'],
            ['Kıble konuma göre değişir mi?',
             'Evet — Kıble açısı Mekke\'ye göre her şehirde farklıdır; bu yüzden konumunuza veya seçtiğiniz şehre özel bir açı hesaplarız.']
        ],
        footer: 'Bu sayfayı dünyanın her yerinden Kıble yönünü bulmak için kullanabilirsiniz; konumunuzu otomatik tespit ederek veya şehrinizi seçerek Mübarek Kâbe\'ye tam açıyı elde edin.',
        trust_note: '📍 Yön, coğrafi koordinatlardan yüksek astronomik doğrulukla hesaplanır.',
        bc_home: 'Ana Sayfa', bc_qibla: 'Kıble Yönü'
    },
    ur: {
        title: '🧭 دنیا کے کسی بھی مقام سے قبلہ کی درست سمت جانیں',
        subtitle: 'آپ کی جغرافیائی لوکیشن یا منتخب شہر پر مبنی ذہین کمپاس',
        hero_badges: ['ہر ملک میں کام کرتا ہے', 'اعلیٰ فلکیاتی درستگی'],
        smart_pill_prefix: 'آخری استعمال شدہ مقام',
        smart_pill_cta: 'قبلہ دکھائیں',
        geo_btn: '📍 میرے مقام سے قبلہ دکھائیں',
        geo_btn_loading: 'مقام تلاش کیا جا رہا ہے…',
        cta_pick_city: '🌍 دستی طور پر اپنا شہر چنیں',
        cta_microcopy: 'آپ کا مقام چند سیکنڈ میں خود بخود معلوم ہو جائے گا',
        geo_status_loading: '… آپ کا مقام معلوم کیا جا رہا ہے',
        geo_status_denied: '⚠️ آپ کے مقام تک رسائی نہ ہو سکی — نیچے سے شہر تلاش کریں۔',
        geo_status_unavailable: 'آپ کا براؤزر مقام کی حمایت نہیں کرتا — نیچے سے شہر تلاش کریں۔',
        trust_chips: ['اعلیٰ درستگی والا GPS', 'ایپ کی ضرورت نہیں', 'ہر ملک میں کام کرتا ہے'],
        authority_note: '📍 قبلہ کی سمت درست نقاط اور معتبر فلکیاتی ماڈلز سے حساب کی جاتی ہے۔',
        search_placeholder: 'اپنا شہر تلاش کریں (مثال: لاہور، کراچی، Istanbul)',
        search_empty: 'کوئی شہر نہیں ملا — نیچے سے ملک چنیں۔',
        visited_title: '🕓 حال ہی میں دیکھے گئے شہر',
        cities_title: 'سب سے زیادہ تلاش کیے گئے قبلہ شہر',
        tier1_label: 'نمایاں',
        countries_title: '🌐 اپنا ملک چنیں',
        countries_note: 'قریبی شہر دیکھنے کے لیے اپنا ملک چنیں۔',
        howto_title: 'آپ قبلہ کیسے معلوم کرتے ہیں؟',
        howto_steps: [
            '"میرے مقام سے قبلہ دکھائیں" دبائیں یا اوپر والے سرچ میں اپنا شہر لکھیں۔',
            'ہم Great-Circle فلکیاتی فارمولے سے کعبہ کی سمت کا درست زاویہ نکالتے ہیں۔',
            'فون یا کمپاس کو دکھائے گئے زاویے کی طرف موڑیں — کعبہ عین آپ کے سامنے ہے۔'
        ],
        usecases_title: 'ہر جگہ استعمال کریں',
        usecases: [
            { icon: '🏠', label: 'گھر میں' },
            { icon: '✈️', label: 'سفر میں' },
            { icon: '🕌', label: 'مسجد میں' },
            { icon: '🌍', label: 'دنیا بھر میں' }
        ],
        faq_title: 'اکثر پوچھے گئے سوالات',
        faq: [
            ['قبلہ کی سمت درست طور پر کیسے معلوم کروں؟',
             '"میرے مقام سے قبلہ دکھائیں" بٹن دبائیں تاکہ براؤزر خود بخود آپ کا مقام معلوم کرے۔ پھر ہم Great-Circle فارمولے کے ذریعے کعبہ کی سمت کا زاویہ نکالتے ہیں۔ اگر آپ مقام شیئر نہیں کرنا چاہتے تو فہرست سے اپنا شہر چنیں۔'],
            ['کیا GPS کے بغیر قبلہ معلوم ہو سکتا ہے؟',
             'جی ہاں — فہرست سے اپنا شہر چنیں یا نام سے تلاش کریں؛ ہم اس شہر کے سرکاری نقاط کے مطابق قبلہ کی درست سمت دکھائیں گے۔'],
            ['قبلہ کا زاویہ کیا ہے؟',
             'قبلہ کا زاویہ زمین کی سطح پر آپ کے مقام اور کعبہ معظمہ کے درمیان مختصر ترین ہندسی سمت ہے، جو جغرافیائی شمال سے ڈگری میں ناپا جاتا ہے۔'],
            ['کیا قبلہ مقام کے لحاظ سے مختلف ہوتا ہے؟',
             'جی ہاں — ہر شہر کا قبلہ زاویہ مکہ مکرمہ کے مقام کے لحاظ سے مختلف ہے، اس لیے ہم آپ کے مقام یا منتخب شہر کے لیے مخصوص زاویہ نکالتے ہیں۔']
        ],
        footer: 'آپ اس صفحے سے دنیا کے کسی بھی مقام سے قبلہ کی سمت معلوم کر سکتے ہیں؛ یا تو اپنا مقام خود متعین کریں یا شہر چنیں، اور مقدّس کعبہ کی طرف درست زاویہ حاصل کریں۔',
        trust_note: '📍 سمت جغرافیائی نقاط سے فلکیاتی درستگی کے ساتھ نکالی جاتی ہے۔',
        bc_home: 'ہوم', bc_qibla: 'قبلہ کی سمت'
    },
    de: {
        title: '🧭 Finden Sie die exakte Qibla-Richtung von überall auf der Welt',
        subtitle: 'Intelligenter Kompass – basierend auf Ihrem Standort oder Ihrer gewählten Stadt',
        hero_badges: ['Funktioniert in jedem Land', 'Hohe astronomische Präzision'],
        smart_pill_prefix: 'Zuletzt genutzter Standort',
        smart_pill_cta: 'Qibla anzeigen',
        geo_btn: '📍 Qibla von meinem Standort anzeigen',
        geo_btn_loading: 'Standort wird ermittelt…',
        cta_pick_city: '🌍 Stadt manuell auswählen',
        cta_microcopy: 'Ihr Standort wird automatisch in Sekunden ermittelt',
        geo_status_loading: '… Standort wird ermittelt',
        geo_status_denied: '⚠️ Standort nicht ermittelbar — suchen Sie unten nach Ihrer Stadt.',
        geo_status_unavailable: 'Ihr Browser unterstützt keine Standortbestimmung — suchen Sie unten nach Ihrer Stadt.',
        trust_chips: ['Hochpräziser GPS', 'Keine App erforderlich', 'Funktioniert in jedem Land'],
        authority_note: '📍 Die Qibla wird aus präzisen Koordinaten und zertifizierten astronomischen Modellen berechnet.',
        search_placeholder: 'Nach Ihrer Stadt suchen (z. B. Berlin, Kairo, Istanbul)',
        search_empty: 'Keine passende Stadt — versuchen Sie ein Land unten.',
        visited_title: '🕓 Kürzlich besuchte Städte',
        cities_title: 'Meistgesuchte Qibla-Städte',
        tier1_label: 'Ausgewählt',
        countries_title: '🌐 Wählen Sie Ihr Land',
        countries_note: 'Wählen Sie Ihr Land, um die nächstgelegenen Städte zu sehen.',
        howto_title: 'Wie findet man die Qibla?',
        howto_steps: [
            'Tippen Sie auf „Qibla von meinem Standort anzeigen" — oder geben Sie Ihre Stadt oben in die Suche ein.',
            'Wir berechnen den exakten Winkel zur Kaaba mit der astronomischen Großkreisformel.',
            'Richten Sie Ihr Telefon oder Ihren Kompass auf den angezeigten Winkel — die Kaaba liegt direkt vor Ihnen.'
        ],
        usecases_title: 'Überall nutzbar',
        usecases: [
            { icon: '🏠', label: 'Zu Hause' },
            { icon: '✈️', label: 'Auf Reisen' },
            { icon: '🕌', label: 'In der Moschee' },
            { icon: '🌍', label: 'Überall auf der Welt' }
        ],
        faq_title: 'Häufig gestellte Fragen',
        faq: [
            ['Wie bestimme ich die Qibla-Richtung genau?',
             "Klicken Sie auf \"Qibla von meinem Standort anzeigen\" und lassen Sie den Browser Ihren Standort ermitteln. Anschließend berechnen wir den Winkel zur Kaaba geometrisch mit der Großkreisformel. Wenn Sie Ihren Standort nicht teilen möchten, wählen Sie Ihre Stadt aus der Liste."],
            ['Kann ich die Qibla ohne GPS finden?',
             'Ja — wählen Sie Ihre Stadt aus der Liste oder suchen Sie nach ihrem Namen. Wir zeigen die exakte Qibla-Richtung von dieser Stadt basierend auf ihren offiziellen Koordinaten.'],
            ['Was ist der Qibla-Winkel?',
             'Der Qibla-Winkel ist die kürzeste geometrische Richtung zwischen Ihrem Standort und der Heiligen Kaaba auf der Erdoberfläche, gemessen in Grad vom geografischen Norden.'],
            ['Unterscheidet sich die Qibla je nach Standort?',
             'Ja — der Qibla-Winkel ändert sich von Stadt zu Stadt je nach Lage zu Mekka. Deshalb berechnen wir einen individuellen Winkel für Ihren Standort oder Ihre gewählte Stadt.']
        ],
        footer: 'Mit dieser Seite finden Sie die Qibla-Richtung von überall auf der Welt – entweder durch automatische Standortbestimmung oder durch Auswahl Ihrer Stadt – für einen präzisen Winkel zur Heiligen Kaaba.',
        trust_note: '📍 Die Richtung wird aus geografischen Koordinaten mit hoher astronomischer Präzision berechnet.',
        bc_home: 'Startseite', bc_qibla: 'Qibla-Richtung'
    },
    id: {
        title: '🧭 Temukan arah kiblat yang tepat dari mana saja di dunia',
        subtitle: 'Kompas cerdas berbasis geolokasi Anda atau pilihan kota Anda',
        hero_badges: ['Berfungsi di setiap negara', 'Presisi astronomi tinggi'],
        smart_pill_prefix: 'Lokasi terakhir yang digunakan',
        smart_pill_cta: 'Tampilkan kiblat',
        geo_btn: '📍 Tampilkan kiblat dari lokasi saya',
        geo_btn_loading: 'Mendeteksi lokasi Anda…',
        cta_pick_city: '🌍 Pilih kota Anda secara manual',
        cta_microcopy: 'Lokasi Anda akan terdeteksi otomatis dalam beberapa detik',
        geo_status_loading: '… Mendeteksi lokasi Anda',
        geo_status_denied: '⚠️ Tidak dapat mendeteksi lokasi Anda — cari kota Anda di bawah.',
        geo_status_unavailable: 'Peramban Anda tidak mendukung lokasi — cari kota Anda di bawah.',
        trust_chips: ['GPS berpresisi tinggi', 'Tanpa perlu aplikasi', 'Berfungsi di setiap negara'],
        authority_note: '📍 Arah kiblat dihitung dari koordinat presisi dan model astronomi tersertifikasi.',
        search_placeholder: 'Cari kota Anda (mis. Jakarta, Kairo, Istanbul)',
        search_empty: 'Tidak ada kota yang cocok — coba pilih negara di bawah.',
        visited_title: '🕓 Kota yang baru saja dikunjungi',
        cities_title: 'Kota kiblat yang paling banyak dicari',
        tier1_label: 'Unggulan',
        countries_title: '🌐 Pilih negara Anda',
        countries_note: 'Pilih negara Anda untuk melihat kota terdekat.',
        howto_title: 'Bagaimana cara menemukan kiblat?',
        howto_steps: [
            'Ketuk "Tampilkan kiblat dari lokasi saya" — atau ketik nama kota Anda pada pencarian di atas.',
            "Kami menghitung sudut yang tepat ke Ka'bah dengan rumus astronomi Great-Circle.",
            "Arahkan ponsel atau kompas Anda ke sudut yang ditampilkan — Ka'bah tepat di depan Anda."
        ],
        usecases_title: 'Gunakan di mana saja',
        usecases: [
            { icon: '🏠', label: 'Di rumah' },
            { icon: '✈️', label: 'Saat bepergian' },
            { icon: '🕌', label: 'Di masjid' },
            { icon: '🌍', label: 'Di seluruh dunia' }
        ],
        faq_title: 'Pertanyaan yang sering diajukan',
        faq: [
            ['Bagaimana menentukan arah kiblat dengan akurat?',
             'Klik "Tampilkan kiblat dari lokasi saya" agar peramban mendeteksi posisi Anda. Kami kemudian menghitung arah ke Ka\'bah secara geometris dengan rumus Great-Circle. Bila Anda tidak ingin berbagi lokasi, pilih kota Anda dari daftar untuk mendapatkan presisi yang sama.'],
            ['Bisakah mengetahui kiblat tanpa GPS?',
             'Ya — pilih kota Anda dari daftar atau cari namanya. Kami menampilkan arah kiblat yang tepat dari kota tersebut berdasarkan koordinat resminya.'],
            ['Apa itu sudut kiblat?',
             'Sudut kiblat adalah arah geometris terpendek antara lokasi Anda dan Ka\'bah di permukaan Bumi, diukur dalam derajat dari utara sebenarnya.'],
            ['Apakah arah kiblat berbeda menurut lokasi?',
             'Ya — sudut kiblat berubah dari satu kota ke kota lain berdasarkan posisinya relatif terhadap Makkah, sehingga kami menghitung sudut khusus untuk lokasi atau kota pilihan Anda.']
        ],
        footer: 'Gunakan halaman ini untuk menemukan arah kiblat dari mana pun di dunia, baik dengan mendeteksi lokasi secara otomatis maupun memilih kota, agar memperoleh sudut yang tepat menuju Kabah.',
        trust_note: '📍 Arah dihitung dari koordinat geografis dengan presisi astronomi tinggi.',
        bc_home: 'Beranda', bc_qibla: 'Arah Kiblat'
    },
    es: {
        title: '🧭 Encuentra la dirección exacta de la Qibla desde cualquier lugar del mundo',
        subtitle: 'Brújula inteligente basada en tu geolocalización o en la ciudad que elijas',
        hero_badges: ['Funciona en todos los países', 'Alta precisión astronómica'],
        smart_pill_prefix: 'Última ubicación usada',
        smart_pill_cta: 'Ver la Qibla',
        geo_btn: '📍 Ver la Qibla desde mi ubicación',
        geo_btn_loading: 'Detectando tu ubicación…',
        cta_pick_city: '🌍 Elige tu ciudad manualmente',
        cta_microcopy: 'Tu ubicación se detectará automáticamente en segundos',
        geo_status_loading: '… Detectando tu ubicación',
        geo_status_denied: '⚠️ No pudimos detectar tu ubicación — busca tu ciudad abajo.',
        geo_status_unavailable: 'Tu navegador no admite geolocalización — busca tu ciudad abajo.',
        trust_chips: ['GPS de alta precisión', 'Sin necesidad de app', 'Funciona en todos los países'],
        authority_note: '📍 La dirección se calcula a partir de coordenadas precisas y modelos astronómicos certificados.',
        search_placeholder: 'Busca tu ciudad (p. ej. Madrid, El Cairo, Estambul)',
        search_empty: 'No hay ciudades que coincidan — prueba con un país abajo.',
        visited_title: '🕓 Ciudades visitadas recientemente',
        cities_title: 'Ciudades Qibla más buscadas',
        tier1_label: 'Destacada',
        countries_title: '🌐 Elige tu país',
        countries_note: 'Elige tu país para ver las ciudades más cercanas.',
        howto_title: '¿Cómo encuentras la Qibla?',
        howto_steps: [
            'Toca "Ver la Qibla desde mi ubicación" — o escribe tu ciudad en la búsqueda de arriba.',
            'Calculamos el ángulo preciso hacia la Kaaba con la fórmula astronómica del círculo máximo.',
            'Apunta tu móvil o brújula al ángulo mostrado — la Kaaba estará justo frente a ti.'
        ],
        usecases_title: 'Úsala en cualquier lugar',
        usecases: [
            { icon: '🏠', label: 'En casa' },
            { icon: '✈️', label: 'De viaje' },
            { icon: '🕌', label: 'En la mezquita' },
            { icon: '🌍', label: 'En todo el mundo' }
        ],
        faq_title: 'Preguntas frecuentes',
        faq: [
            ['¿Cómo determino la dirección de la Qibla con precisión?',
             'Haz clic en "Ver la Qibla desde mi ubicación" y deja que el navegador detecte tu posición. Luego calculamos el ángulo hacia la Kaaba con la fórmula del círculo máximo. Si prefieres no compartir la ubicación, elige tu ciudad en la lista para obtener la misma precisión.'],
            ['¿Puedo saber la Qibla sin GPS?',
             'Sí — elige tu ciudad en la lista o búscala por su nombre. Mostramos la dirección exacta de la Qibla desde esa ciudad usando sus coordenadas oficiales.'],
            ['¿Qué es el ángulo de la Qibla?',
             'El ángulo de la Qibla es la dirección geométrica más corta entre tu ubicación y la Sagrada Kaaba sobre la superficie de la Tierra, medida en grados desde el norte verdadero.'],
            ['¿La Qibla cambia según la ubicación?',
             'Sí — el ángulo de la Qibla cambia de una ciudad a otra según su posición respecto a La Meca, por eso calculamos un ángulo personalizado para tu ubicación o la ciudad elegida.']
        ],
        footer: 'Puedes usar esta página para hallar la dirección de la Qibla desde cualquier lugar del mundo, ya sea detectando tu ubicación automáticamente o eligiendo tu ciudad, para obtener un ángulo preciso hacia la Sagrada Kaaba.',
        trust_note: '📍 La dirección se calcula a partir de coordenadas geográficas con alta precisión astronómica.',
        bc_home: 'Inicio', bc_qibla: 'Dirección de la Qibla'
    },
    bn: {
        title: '🧭 বিশ্বের যেকোনো স্থান থেকে কিবলার সঠিক দিক জানুন',
        subtitle: 'আপনার ভৌগোলিক অবস্থান বা নির্বাচিত শহরের উপর নির্ভর করে স্মার্ট কম্পাস',
        hero_badges: ['প্রতিটি দেশে কাজ করে', 'উচ্চ জ্যোতির্বিদ্যার নির্ভুলতা'],
        smart_pill_prefix: 'সর্বশেষ ব্যবহৃত অবস্থান',
        smart_pill_cta: 'কিবলা দেখুন',
        geo_btn: '📍 আমার অবস্থান থেকে কিবলা দেখুন',
        geo_btn_loading: 'আপনার অবস্থান খোঁজা হচ্ছে…',
        cta_pick_city: '🌍 ম্যানুয়ালি আপনার শহর বাছাই করুন',
        cta_microcopy: 'আপনার অবস্থান কয়েক সেকেন্ডে স্বয়ংক্রিয়ভাবে শনাক্ত হবে',
        geo_status_loading: '… আপনার অবস্থান খোঁজা হচ্ছে',
        geo_status_denied: '⚠️ আপনার অবস্থান পাওয়া যায়নি — নিচে আপনার শহর খুঁজুন।',
        geo_status_unavailable: 'আপনার ব্রাউজার জিওলোকেশন সমর্থন করে না — নিচে আপনার শহর খুঁজুন।',
        trust_chips: ['উচ্চ-নির্ভুলতার GPS', 'অ্যাপের প্রয়োজন নেই', 'প্রতিটি দেশে কাজ করে'],
        authority_note: '📍 কিবলার দিক নির্ভুল স্থানাঙ্ক ও প্রত্যয়িত জ্যোতির্বৈজ্ঞানিক মডেল থেকে গণনা করা হয়।',
        search_placeholder: 'আপনার শহর খুঁজুন (যেমন ঢাকা, কায়রো, Istanbul)',
        search_empty: 'কোন শহর মিলেনি — নিচ থেকে একটি দেশ বেছে নিন।',
        visited_title: '🕓 সম্প্রতি দেখা শহর',
        cities_title: 'সর্বাধিক অনুসন্ধানকৃত কিবলা শহর',
        tier1_label: 'নির্বাচিত',
        countries_title: '🌐 আপনার দেশ বাছাই করুন',
        countries_note: 'আপনার কাছের শহর দেখতে আপনার দেশ বাছাই করুন।',
        howto_title: 'আপনি কীভাবে কিবলা খুঁজে পান?',
        howto_steps: [
            '"আমার অবস্থান থেকে কিবলা দেখুন" চাপুন — অথবা উপরের সার্চে আপনার শহরের নাম লিখুন।',
            'আমরা Great-Circle জ্যোতির্বৈজ্ঞানিক সূত্রে কাবার দিকে সঠিক কোণ গণনা করি।',
            'আপনার ফোন বা কম্পাস দেখানো কোণের দিকে ঘোরান — কাবা সরাসরি আপনার সামনে।'
        ],
        usecases_title: 'যেকোনো জায়গায় ব্যবহার করুন',
        usecases: [
            { icon: '🏠', label: 'ঘরে' },
            { icon: '✈️', label: 'ভ্রমণে' },
            { icon: '🕌', label: 'মসজিদে' },
            { icon: '🌍', label: 'বিশ্বের যেকোনো জায়গায়' }
        ],
        faq_title: 'সাধারণ জিজ্ঞাসা',
        faq: [
            ['কিবলার দিক কীভাবে নির্ভুলভাবে নির্ধারণ করব?',
             '"আমার অবস্থান থেকে কিবলা দেখুন" ক্লিক করুন; ব্রাউজার আপনার অবস্থান স্বয়ংক্রিয়ভাবে শনাক্ত করবে। এরপর আমরা Great-Circle সূত্রে কাবা পর্যন্ত কোণ জ্যামিতিকভাবে গণনা করি। যদি অবস্থান শেয়ার করতে না চান, তালিকা থেকে আপনার শহর বেছে নিন।'],
            ['GPS ছাড়া কি কিবলা জানা যায়?',
             'হ্যাঁ — তালিকা থেকে আপনার শহর বাছাই করুন বা নাম দিয়ে খুঁজুন; সেই শহরের সরকারি স্থানাঙ্ক অনুসারে আমরা কিবলার সঠিক দিক দেখাব।'],
            ['কিবলার কোণ কী?',
             'কিবলার কোণ হলো পৃথিবীর পৃষ্ঠে আপনার অবস্থান ও পবিত্র কাবার মধ্যে সবচেয়ে সংক্ষিপ্ত জ্যামিতিক দিক, যা প্রকৃত উত্তর থেকে ডিগ্রিতে পরিমাপ করা হয়।'],
            ['কিবলা কি অবস্থান অনুযায়ী ভিন্ন হয়?',
             'হ্যাঁ — মক্কার সাপেক্ষে প্রতিটি শহরের অবস্থানে কিবলার কোণ ভিন্ন হয়, তাই আমরা আপনার অবস্থান বা নির্বাচিত শহরের জন্য কাস্টম কোণ গণনা করি।']
        ],
        footer: 'এই পৃষ্ঠাটি ব্যবহার করে বিশ্বের যেকোনো জায়গা থেকে কিবলার দিক নির্ণয় করতে পারেন — স্বয়ংক্রিয়ভাবে অবস্থান শনাক্ত করে বা শহর নির্বাচন করে — পবিত্র কাবার দিকে নির্ভুল কোণ পাওয়ার জন্য।',
        trust_note: '📍 দিকটি ভৌগোলিক স্থানাঙ্ক থেকে উচ্চ জ্যোতির্বিদ্যার নির্ভুলতার সাথে গণনা করা হয়।',
        bc_home: 'হোম', bc_qibla: 'কিবলার দিক'
    },
    ms: {
        title: '🧭 Cari arah kiblat yang tepat dari mana-mana tempat di dunia',
        subtitle: 'Kompas pintar berdasarkan geolokasi anda atau bandar pilihan anda',
        hero_badges: ['Berfungsi di setiap negara', 'Ketepatan astronomi yang tinggi'],
        smart_pill_prefix: 'Lokasi terakhir digunakan',
        smart_pill_cta: 'Tunjukkan kiblat',
        geo_btn: '📍 Tunjukkan kiblat dari lokasi saya',
        geo_btn_loading: 'Mengesan lokasi anda…',
        cta_pick_city: '🌍 Pilih bandar anda secara manual',
        cta_microcopy: 'Lokasi anda akan dikesan secara automatik dalam beberapa saat',
        geo_status_loading: '… Mengesan lokasi anda',
        geo_status_denied: '⚠️ Tidak dapat mengesan lokasi anda — cari bandar anda di bawah.',
        geo_status_unavailable: 'Pelayar anda tidak menyokong lokasi — cari bandar anda di bawah.',
        trust_chips: ['GPS berketepatan tinggi', 'Tiada aplikasi diperlukan', 'Berfungsi di setiap negara'],
        authority_note: '📍 Arah kiblat dikira daripada koordinat tepat dan model astronomi bertauliah.',
        search_placeholder: 'Cari bandar anda (cth. Kuala Lumpur, Kaherah, Istanbul)',
        search_empty: 'Tiada bandar sepadan — cuba pilih negara di bawah.',
        visited_title: '🕓 Bandar yang baru dilawati',
        cities_title: 'Bandar kiblat yang paling banyak dicari',
        tier1_label: 'Pilihan',
        countries_title: '🌐 Pilih negara anda',
        countries_note: 'Pilih negara anda untuk melihat bandar berdekatan.',
        howto_title: 'Bagaimana anda mencari kiblat?',
        howto_steps: [
            'Ketuk "Tunjukkan kiblat dari lokasi saya" — atau taip nama bandar anda dalam carian di atas.',
            'Kami mengira sudut tepat ke Kaabah dengan formula astronomi Great-Circle.',
            'Halakan telefon atau kompas anda ke sudut yang dipaparkan — Kaabah tepat di hadapan anda.'
        ],
        usecases_title: 'Guna di mana-mana',
        usecases: [
            { icon: '🏠', label: 'Di rumah' },
            { icon: '✈️', label: 'Semasa mengembara' },
            { icon: '🕌', label: 'Di masjid' },
            { icon: '🌍', label: 'Di seluruh dunia' }
        ],
        faq_title: 'Soalan lazim',
        faq: [
            ['Bagaimana saya menentukan arah kiblat dengan tepat?',
             'Klik "Tunjukkan kiblat dari lokasi saya" supaya pelayar mengesan posisi anda. Seterusnya kami mengira sudut ke arah Kaabah secara geometri dengan formula Great-Circle. Jika anda enggan berkongsi lokasi, pilih bandar anda dari senarai untuk mendapatkan ketepatan yang sama.'],
            ['Bolehkah mengetahui kiblat tanpa GPS?',
             'Ya — pilih bandar anda dari senarai atau cari namanya; kami memaparkan arah kiblat yang tepat dari bandar tersebut berdasarkan koordinat rasminya.'],
            ['Apakah sudut kiblat?',
             'Sudut kiblat ialah arah geometri terpendek antara lokasi anda dan Kaabah di permukaan Bumi, diukur dalam darjah dari utara sebenar.'],
            ['Adakah kiblat berbeza mengikut lokasi?',
             'Ya — sudut kiblat berbeza bagi setiap bandar berdasarkan kedudukannya berbanding Makkah, jadi kami mengira sudut khusus untuk lokasi atau bandar pilihan anda.']
        ],
        footer: 'Anda boleh menggunakan halaman ini untuk mencari arah kiblat dari mana-mana tempat di dunia, sama ada dengan mengesan lokasi secara automatik atau memilih bandar anda, untuk mendapatkan sudut yang tepat ke arah Kaabah yang mulia.',
        trust_note: '📍 Arah dikira daripada koordinat geografi dengan ketepatan astronomi yang tinggi.',
        bc_home: 'Laman Utama', bc_qibla: 'Arah Kiblat'
    }
};

// Hub city chips — 12 popular global cities (slug matches POPULAR_CITY_NAMES / FAMOUS_MOON_CITIES)
const _QIBLA_HUB_CITY_KEYS = [
    'mecca', 'medina', 'riyadh', 'jeddah', 'cairo',
    'istanbul', 'dubai', 'doha',
    'jakarta', 'kuala-lumpur', 'london', 'paris'
];

// Hub country picker — { slug, flag, code, representative city slug (for /qibla-in-*) }
const _QIBLA_HUB_COUNTRIES = [
    { code: 'sa', flag: '🇸🇦', city: 'mecca' },
    { code: 'eg', flag: '🇪🇬', city: 'cairo' },
    { code: 'tr', flag: '🇹🇷', city: 'istanbul' },
    { code: 'id', flag: '🇮🇩', city: 'jakarta' },
    { code: 'pk', flag: '🇵🇰', city: 'karachi' },
    { code: 'ae', flag: '🇦🇪', city: 'dubai' },
    { code: 'ma', flag: '🇲🇦', city: 'casablanca' },
    { code: 'fr', flag: '🇫🇷', city: 'paris' },
    { code: 'gb', flag: '🇬🇧', city: 'london' },
    { code: 'de', flag: '🇩🇪', city: 'berlin' },
    { code: 'my', flag: '🇲🇾', city: 'kuala-lumpur' },
    { code: 'bd', flag: '🇧🇩', city: 'dhaka' }
];

// ── Visited-cities LRU (qibla hub) ──────────────────────────────────────
// localStorage['qibla_visited_cities'] = [{ slug, englishName, lat, lng, ts }, …]
// Cap 5, most-recent first.
const _QIBLA_VISITED_KEY = 'qibla_visited_cities';
const _QIBLA_VISITED_MAX = 5;
function _readQiblaVisited() {
    try {
        const raw = localStorage.getItem(_QIBLA_VISITED_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        return arr.filter(x => x && isFinite(x.lat) && isFinite(x.lng) && x.slug);
    } catch (_e) { return []; }
}
function _pushQiblaVisited(entry) {
    try {
        if (!entry || !isFinite(entry.lat) || !isFinite(entry.lng)) return;
        const slug = entry.slug || (typeof makeSlug === 'function'
            ? makeSlug(entry.englishName || '', entry.lat, entry.lng) : '');
        if (!slug) return;
        const list = _readQiblaVisited().filter(x => x.slug !== slug);
        list.unshift({
            slug: slug,
            englishName: entry.englishName || slug,
            lat: Number(entry.lat),
            lng: Number(entry.lng),
            ts: Date.now()
        });
        while (list.length > _QIBLA_VISITED_MAX) list.pop();
        localStorage.setItem(_QIBLA_VISITED_KEY, JSON.stringify(list));
    } catch (_e) { /* silent */ }
}

// Hub renderer — persuasive landing page (v4). No compass DOM touches.
function _loadQiblaHubPage(ctx) {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const ui = _QIBLA_HUB_UI[lang] || _QIBLA_HUB_UI.en;

    // Switch page to hub mode (CSS hides city-only sections)
    const pageEl = document.getElementById('page-qibla');
    if (pageEl) pageEl.setAttribute('data-qibla-mode', 'hub');

    // ── 1. Breadcrumb: Home > Qibla (2 items only) ──
    const bcOl = document.querySelector('#qibla-breadcrumb > ol.breadcrumb-list');
    if (bcOl) {
        try {
            const prefix = (lang === 'ar') ? '' : ('/' + lang);
            const homeHref = (lang === 'ar') ? '/' : (prefix + '/');
            bcOl.outerHTML = _buildQiblaBreadcrumbOl('', true, lang) ||
                `<ol class="breadcrumb-list"><li class="bc-item"><a href="${homeHref}">${ui.bc_home}</a></li><li class="bc-item bc-current" aria-current="page">${ui.bc_qibla}</li></ol>`;
        } catch (_e) { /* silent */ }
    }

    // ── 2. Smart-redirect pill (only if last_city_context exists) ──
    const pillEl = document.getElementById('qibla-hub-smart-pill');
    if (pillEl) {
        let _pillShown = false;
        try {
            const raw = sessionStorage.getItem('last_city_context');
            if (raw) {
                const ctxObj = JSON.parse(raw);
                if (ctxObj && isFinite(ctxObj.lat) && isFinite(ctxObj.lng) && ctxObj.englishName) {
                    const canonical = _canonicalQiblaSlug(ctxObj.englishName, ctxObj.lat, ctxObj.lng);
                    const slug = canonical || ((typeof makeSlug === 'function')
                        ? makeSlug(ctxObj.englishName, ctxObj.lat, ctxObj.lng)
                        : String(ctxObj.englishName).toLowerCase().replace(/\s+/g, '-'));
                    const target = _buildQiblaCityUrl(ctxObj.englishName, ctxObj.lat, ctxObj.lng, slug);
                    const localized = _resolveCityNameClient(slug, lang,
                        (lang === 'ar' ? (ctxObj.name || ctxObj.englishName) : (ctxObj.englishName || ctxObj.name)));
                    pillEl.setAttribute('href', target);
                    pillEl.innerHTML =
                        `<span class="qhsp-icon" aria-hidden="true">📍</span>` +
                        `<span class="qhsp-prefix">${ui.smart_pill_prefix}:</span>` +
                        `<strong class="qhsp-city">${localized}</strong>` +
                        `<span class="qhsp-arrow" aria-hidden="true">→</span>` +
                        `<span class="qhsp-cta">${ui.smart_pill_cta}</span>`;
                    pillEl.hidden = false;
                    pillEl.classList.add('is-visible');
                    _pillShown = true;
                }
            }
        } catch (_e) { /* silent */ }
        if (!_pillShown) {
            pillEl.hidden = true;
            pillEl.classList.remove('is-visible');
        }
    }

    // ── 3. Hero — H1 + subtitle + trust chips ──
    const h1El  = document.getElementById('qibla-hero-title');
    const subEl = document.getElementById('qibla-hub-subtitle');
    const badgesEl = document.getElementById('qibla-hub-hero-badges');
    if (h1El)  h1El.textContent  = ui.title;
    if (subEl) subEl.textContent = ui.subtitle;
    if (badgesEl) {
        const chips = Array.isArray(ui.hero_badges) ? ui.hero_badges : [];
        badgesEl.innerHTML = chips.map(c =>
            `<li class="qhhb-chip"><span class="qhhb-tick" aria-hidden="true">✔</span>${c}</li>`
        ).join('');
    }

    // ── 4. Dual CTA — primary (geo) + secondary (pick-city scroll) ──
    const geoBtn    = document.getElementById('qibla-hub-geo-btn');
    const geoStatus = document.getElementById('qibla-hub-geo-status');
    const geoMicro  = document.getElementById('qibla-hub-geo-microcopy');
    const pickBtn   = document.getElementById('qibla-hub-pick-btn');
    const geoLabel  = geoBtn ? geoBtn.querySelector('.qhb-label') : null;
    if (geoLabel)  geoLabel.textContent  = ui.geo_btn;
    if (geoMicro)  geoMicro.textContent  = ui.cta_microcopy || '';
    if (geoStatus) { geoStatus.textContent = ''; geoStatus.classList.remove('is-error'); }
    if (geoBtn)    { geoBtn.classList.remove('is-loading'); geoBtn.disabled = false; }
    if (pickBtn)   pickBtn.textContent = ui.cta_pick_city;

    if (geoBtn && !geoBtn.dataset.wired) {
        geoBtn.dataset.wired = '1';
        geoBtn.addEventListener('click', function () {
            if (!navigator.geolocation) {
                if (geoStatus) {
                    geoStatus.textContent = ui.geo_status_unavailable;
                    geoStatus.classList.add('is-error');
                }
                return;
            }
            geoBtn.disabled = true;
            geoBtn.classList.add('is-loading');
            if (geoLabel) geoLabel.textContent = ui.geo_btn_loading || ui.geo_btn;
            if (geoStatus) {
                geoStatus.textContent = ui.geo_status_loading;
                geoStatus.classList.remove('is-error');
            }
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    const la = pos.coords.latitude;
                    const lo = pos.coords.longitude;
                    try {
                        sessionStorage.setItem('qibla_hub_user_loc',
                            JSON.stringify({ lat: la, lng: lo, ts: Date.now() }));
                    } catch (_) {}
                    // R35: unified nearest-city helper across all geo buttons.
                    // Always returns a clean city slug — never `qibla-in-loc-*`.
                    // Also writes lsb_detected so the prayer-times hero fast-path picks it up.
                    let target;
                    try {
                        const c = _findNearestKnownCity(la, lo);
                        const slug = makeSlug(c.en, c.lat, c.lng);
                        target = pageUrl(`/qibla-in-${slug}`);
                        try { _writeLsbDetected(c, la, lo); } catch (_) {}
                    } catch (_) {
                        // Truly unreachable defensive — keep coord-only as a last resort
                        // (this branch should never fire because LOCAL_CITIES is non-empty).
                        const laS = Math.abs(la).toFixed(1) + (la >= 0 ? 'n' : 's');
                        const loS = Math.abs(lo).toFixed(1) + (lo >= 0 ? 'e' : 'w');
                        target = pageUrl(`/qibla-in-loc-${laS}-${loS}`);
                    }
                    window.location.href = target;
                },
                function (_err) {
                    if (geoStatus) {
                        geoStatus.textContent = ui.geo_status_denied;
                        geoStatus.classList.add('is-error');
                    }
                    geoBtn.disabled = false;
                    geoBtn.classList.remove('is-loading');
                    if (geoLabel) geoLabel.textContent = ui.geo_btn;
                    const s = document.getElementById('qibla-hub-search');
                    if (s && s.scrollIntoView) s.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (s) { try { s.focus(); } catch (_) {} }
                },
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 120000 }
            );
        });
    }
    if (pickBtn && !pickBtn.dataset.wired) {
        pickBtn.dataset.wired = '1';
        pickBtn.addEventListener('click', function () {
            const s = document.getElementById('qibla-hub-search');
            if (s && s.scrollIntoView) s.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (s) { try { s.focus(); } catch (_) {} }
        });
    }

    // ── 5. (removed: standalone trust strip is now inline hero badges) ──

    // ── 6. Hero-scale search — local-first autocomplete into #qibla-hub-search-results ──
    const searchEl    = document.getElementById('qibla-hub-search');
    const searchList  = document.getElementById('qibla-hub-search-results');
    const searchEmpty = document.getElementById('qibla-hub-search-empty');
    if (searchEl) {
        searchEl.placeholder = ui.search_placeholder || '';
        if (!searchEl.dataset.wired) {
            searchEl.dataset.wired = '1';
            let _qhsDebounce = null;
            const renderSuggestions = (q) => {
                if (!searchList) return;
                const results = (typeof searchLocalCities === 'function') ? searchLocalCities(q) : [];
                if (!q || q.length < 2) {
                    searchList.innerHTML = '';
                    searchList.classList.remove('is-open');
                    if (searchEmpty) searchEmpty.hidden = true;
                    return;
                }
                if (results.length === 0) {
                    searchList.innerHTML = '';
                    searchList.classList.remove('is-open');
                    if (searchEmpty) {
                        searchEmpty.textContent = ui.search_empty || '';
                        searchEmpty.hidden = false;
                    }
                    return;
                }
                if (searchEmpty) searchEmpty.hidden = true;
                const isEnUi = (lang === 'en');
                const html = results.map((c, i) => {
                    const display = isEnUi ? c.en : c.ar;
                    const country = isEnUi ? (c.countryEn || c.country) : c.country;
                    const flag = c.cc
                        ? `<img src="https://flagcdn.com/28x21/${c.cc}.png" class="qhsr-flag" alt="${c.cc}" onerror="this.style.display='none'">`
                        : `<span class="qhsr-flag">🌍</span>`;
                    return `<li class="qhsr-item" role="option" data-idx="${i}">`
                         + `${flag}<div class="qhsr-text"><div class="qhsr-name">${display}</div>`
                         + `<div class="qhsr-country">${country}</div></div>`
                         + `<span class="qhsr-arrow" aria-hidden="true">→</span>`
                         + `</li>`;
                }).join('');
                searchList.innerHTML = html;
                searchList.classList.add('is-open');
                searchList.querySelectorAll('.qhsr-item').forEach(li => {
                    li.addEventListener('click', () => {
                        const idx = parseInt(li.dataset.idx, 10);
                        const city = results[idx];
                        if (!city) return;
                        const canonical = _canonicalQiblaSlug(city.en, city.lat, city.lng);
                        const storeSlug = canonical || ((typeof makeSlug === 'function')
                            ? makeSlug(city.en, city.lat, city.lng) : '');
                        _pushQiblaVisited({
                            englishName: city.en,
                            lat: city.lat,
                            lng: city.lng,
                            slug: storeSlug
                        });
                        // Pre-seed sessionStorage so the target page resolves lat/lng instantly
                        // even for cities outside FAMOUS_MOON_CITIES / LOCAL_CITIES (defensive).
                        try {
                            const _payload = JSON.stringify({
                                lat: city.lat, lng: city.lng,
                                name: (lang === 'ar' ? city.ar : city.en),
                                country: (lang === 'ar' ? city.country : (city.countryEn || city.country)),
                                englishName: city.en,
                                countryCode: city.cc || '',
                                _v: 2
                            });
                            sessionStorage.setItem(`city_${storeSlug}`, _payload);
                        } catch (_) {}
                        const target = _buildQiblaCityUrl(city.en, city.lat, city.lng, storeSlug);
                        window.location.href = target;
                    });
                });
            };
            searchEl.addEventListener('input', function () {
                clearTimeout(_qhsDebounce);
                const q = String(searchEl.value || '').trim();
                _qhsDebounce = setTimeout(() => renderSuggestions(q), 80);
            });
            // Close dropdown on outside click (search now lives inside #qibla-hub-hero)
            document.addEventListener('click', function (e) {
                if (!e.target.closest('#qibla-hub-hero')) {
                    if (searchList) searchList.classList.remove('is-open');
                }
            });
        }
    }

    // ── 7. Visited cities (LRU) ──
    const visitedCard  = document.getElementById('qibla-hub-visited-card');
    const visitedTitle = document.getElementById('qibla-hub-visited-title');
    const visitedGrid  = document.getElementById('qibla-hub-visited-grid');
    const visited = _readQiblaVisited();
    if (visitedCard && visitedGrid) {
        if (visited.length > 0) {
            if (visitedTitle) visitedTitle.textContent = ui.visited_title;
            visitedGrid.innerHTML = visited.map(v => {
                const display = _resolveCityNameClient(v.slug, lang, v.englishName || v.slug);
                const href = _buildQiblaCityUrl(v.englishName || v.slug, v.lat, v.lng, v.slug);
                return `<a class="qhv-chip" href="${href}" data-slug="${v.slug}">`
                     + `<span class="qhv-icon" aria-hidden="true">🕓</span>`
                     + `<span class="qhv-name">${display}</span>`
                     + `<span class="qhv-arrow" aria-hidden="true">→</span></a>`;
            }).join('');
            visitedCard.hidden = false;
        } else {
            visitedGrid.innerHTML = '';
            visitedCard.hidden = true;
        }
    }

    // ── 8. How-to: 3 guided steps (replaces tiered popular-cities grid on hub) ──
    const howtoTitleEl = document.getElementById('qibla-hub-howto-title');
    const howtoStepsEl = document.getElementById('qibla-hub-howto-steps');
    if (howtoTitleEl) howtoTitleEl.textContent = ui.howto_title || '';
    if (howtoStepsEl) {
        const steps = Array.isArray(ui.howto_steps) ? ui.howto_steps : [];
        howtoStepsEl.innerHTML = steps.map((txt, i) =>
            `<li class="qhhs-step">`
          + `<span class="qhhs-num" aria-hidden="true">${i + 1}</span>`
          + `<span class="qhhs-text">${txt}</span>`
          + `</li>`
        ).join('');
    }

    // ── 9. Use-cases strip (replaces countries picker on hub) ──
    const ucTitleEl = document.getElementById('qibla-hub-usecases-title');
    const ucListEl  = document.getElementById('qibla-hub-usecases');
    if (ucTitleEl) ucTitleEl.textContent = ui.usecases_title || '';
    if (ucListEl) {
        const cases = Array.isArray(ui.usecases) ? ui.usecases : [];
        ucListEl.innerHTML = cases.map(c =>
            `<li class="qhuc-item">`
          + `<span class="qhuc-icon" aria-hidden="true">${c.icon || '🌍'}</span>`
          + `<span class="qhuc-label">${c.label || ''}</span>`
          + `</li>`
        ).join('');
    }

    // ── 10. FAQ ──
    const faqTitle = document.getElementById('qibla-faq-title');
    const faqEl    = document.getElementById('qibla-faq');
    if (faqTitle) faqTitle.textContent = ui.faq_title;
    if (faqEl) {
        const items = Array.isArray(ui.faq) ? ui.faq : [];
        faqEl.innerHTML = items.map(pair =>
            `<details class="qibla-faq-item"><summary>${pair[0]}</summary><div class="qibla-faq-answer">${pair[1]}</div></details>`
        ).join('');
    }

    // ── 11. Footer + trust note ──
    const footEl  = document.getElementById('qibla-footer-seo');
    const tNoteEl = document.getElementById('qibla-trust-note');
    if (footEl)  footEl.textContent  = ui.footer;
    if (tNoteEl) tNoteEl.textContent = ui.trust_note;

    // ── 12. JSON-LD: BreadcrumbList + WebPage + FAQPage (no Place on hub) ──
    try {
        const jsonldEl = document.getElementById('qibla-jsonld');
        if (jsonldEl) {
            const origin = (typeof window !== 'undefined' && window.SITE_URL)
                ? window.SITE_URL
                : (window.location.origin || '');
            const pageUrlAbs = origin + window.location.pathname;
            const prefix = (lang === 'ar') ? '' : ('/' + lang);
            const homeUrlAbs = origin + ((lang === 'ar') ? '/' : (prefix + '/'));
            const graph = [
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: ui.bc_home,  item: homeUrlAbs },
                        { '@type': 'ListItem', position: 2, name: ui.bc_qibla, item: pageUrlAbs }
                    ]
                },
                {
                    '@type': 'WebPage',
                    '@id': pageUrlAbs + '#webpage',
                    name: ui.title,
                    url: pageUrlAbs,
                    description: ui.subtitle,
                    inLanguage: lang
                },
                {
                    '@type': 'FAQPage',
                    mainEntity: (ui.faq || []).map(p => ({
                        '@type': 'Question',
                        name: p[0],
                        acceptedAnswer: { '@type': 'Answer', text: p[1] }
                    }))
                }
            ];
            jsonldEl.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
        }
    } catch (_e) { /* silent */ }
}

// ───── Renderer for /qibla (hub) and /qibla-in-{slug} (city) — Tool page ─────
function loadQiblaPage(ctx) {
    try {
        ctx = ctx || { mode: 'hub' };
        const mode = ctx.mode || 'hub';

        // ── Round 30: hub becomes a decision-engine landing page.
        //   Early-return to the hub renderer — no fake angle/distance/city data.
        if (mode === 'hub') {
            _loadQiblaHubPage(ctx);
            return;
        }

        // ── City mode: switch page-qibla to city layout (shows city-only DOM) ──
        const _pageEl = document.getElementById('page-qibla');
        if (_pageEl) _pageEl.setAttribute('data-qibla-mode', 'city');
        const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const ui = _QIBLA_UI[lang] || _QIBLA_UI.en;

        // ── 1. Resolve city — lat/lng + localized display name via _resolveCityNameClient ──
        let lat, lng, cityName, citySlugForUrl, currentKey;
        if (mode === 'city' && ctx.cityData) {
            lat = ctx.cityData.lat;
            lng = ctx.cityData.lng;
            citySlugForUrl = ctx.cityData.slug || (ctx.citySlug || '');
            currentKey = citySlugForUrl;
            // cityData.name may already be localized; pass it as fallback.
            cityName = _resolveCityNameClient(citySlugForUrl, lang, ctx.cityData.name);
        } else if (mode === 'city' && ctx.citySlug) {
            const slug = ctx.citySlug;
            const fam = (typeof FAMOUS_MOON_CITIES !== 'undefined') ? FAMOUS_MOON_CITIES[slug] : null;
            // Priority 1: server-injected __QIBLA_CITY__ (authoritative for clean URLs).
            let ssrCity = null;
            try {
                if (typeof window !== 'undefined' && window.__QIBLA_CITY__
                    && window.__QIBLA_CITY__.slug === slug
                    && isFinite(window.__QIBLA_CITY__.lat)
                    && isFinite(window.__QIBLA_CITY__.lng)) {
                    ssrCity = window.__QIBLA_CITY__;
                }
            } catch (_) {}
            if (ssrCity) {
                lat = ssrCity.lat;
                lng = ssrCity.lng;
            } else if (fam) {
                lat = fam.lat;
                lng = fam.lng;
            } else {
                // Priority 3: LOCAL_CITIES by slug(English name) match.
                try {
                    if (typeof LOCAL_CITIES !== 'undefined' && typeof makeSlug === 'function') {
                        for (let i = 0; i < LOCAL_CITIES.length; i++) {
                            const c = LOCAL_CITIES[i];
                            if (makeSlug(c.en, c.lat, c.lng) === slug) {
                                lat = c.lat; lng = c.lng; break;
                            }
                        }
                        // "loc-xx-yy" coord-slug fallback (GPS without a city match).
                        if (!isFinite(lat) || !isFinite(lng)) {
                            const locM = slug.match(/^loc-(\d+\.\d)([ns])-(\d+\.\d)([ew])$/);
                            if (locM) {
                                lat = parseFloat(locM[1]) * (locM[2] === 'n' ? 1 : -1);
                                lng = parseFloat(locM[3]) * (locM[4] === 'e' ? 1 : -1);
                            }
                        }
                    }
                } catch (_) {}
                // Legacy coord-suffix URL still supported: /qibla-in-{slug}-{lat}-{lng}
                if (!isFinite(lat) || !isFinite(lng)) {
                    const u = window.location.pathname.match(/\/qibla-in-[a-z][a-z0-9-]+?-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
                    if (u) { lat = parseFloat(u[1]); lng = parseFloat(u[2]); }
                }
            }
            if (!isFinite(lat) || !isFinite(lng)) {
                // give up to Mecca
                lat = 21.4225; lng = 39.8262;
            }
            citySlugForUrl = slug;
            currentKey = slug;
            // Name resolution — prefer SSR name table (10 langs), then client resolver, then slug.
            if (ssrCity && ssrCity.names && ssrCity.names[lang]) {
                cityName = ssrCity.names[lang];
            } else if (ssrCity && ssrCity.name) {
                cityName = ssrCity.name;
            } else {
                cityName = _resolveCityNameClient(slug, lang, slug);
            }
        } else {
            // hub — use geolocation globals, fall back to Mecca
            if (isFinite(currentLat) && isFinite(currentLng)) {
                lat = currentLat;
                lng = currentLng;
                citySlugForUrl = (currentEnglishName ? makeSlug(currentEnglishName, lat, lng) : 'mecca');
                // Prefer resolver (popular cities) then app globals (user-chosen). Never raw English.
                const geoFallback = (lang === 'ar') ? (currentCity || '') : (currentEnglishName || currentCity || '');
                cityName = _resolveCityNameClient(citySlugForUrl, lang, geoFallback);
                currentKey = citySlugForUrl;
            } else {
                lat = 21.4225; lng = 39.8262;
                citySlugForUrl = 'mecca';
                currentKey = 'mecca';
                cityName = _resolveCityNameClient('mecca', lang, 'Mecca');
            }
        }

        // ── 2. Compute angle, cardinal, distance ──
        const angle = Qibla.calculate(lat, lng);
        const angleDisplay = angle.toFixed(1);
        const cardinalKey = _cardinalKeyFromAngle(angle);
        let cardinalLabel = cardinalKey;
        try { if (typeof t === 'function') cardinalLabel = t(cardinalKey) || cardinalKey; } catch (_e) {}
        const distanceKm = Math.round(_haversineKm(lat, lng, 21.4225, 39.8262));
        // R36g — distance always rendered in Western Arabic numerals (0-9) regardless
        //   of UI language, for consistency with the angle (243.8°) which already uses
        //   Latin digits via toFixed().
        const _distLocale = 'en';

        // ── 3. Breadcrumb ──
        const bcOl = document.querySelector('#qibla-breadcrumb > ol.breadcrumb-list');
        if (bcOl) bcOl.outerHTML = _buildQiblaBreadcrumbOl(cityName, mode === 'hub', lang);

        // ── 4. H1 + one-line summary ──
        const h1El = document.getElementById('qibla-hero-title');
        const sumEl = document.getElementById('qibla-summary-line');
        if (h1El) h1El.textContent = ui.h1(cityName, mode === 'hub');
        if (sumEl) sumEl.textContent = ui.summary(angleDisplay, cardinalLabel, distanceKm, _distLocale);

        // ── 5. Compass init (unchanged) ──
        if (mode === 'city') {
            currentLat = lat;
            currentLng = lng;
        }
        try { updateQibla(); } catch (_e) {}

        // ── 6. Main CTA — one prominent button ──
        const mainCtaEl = document.getElementById('qibla-main-cta');
        if (mainCtaEl) {
            mainCtaEl.href = citySlugForUrl
                ? pageUrl(`/prayer-times-in-${citySlugForUrl}`)
                : pageUrl('/');
            mainCtaEl.textContent = ui.cta_prayer(cityName);
        }
        // Round 27: CTA microcopy (short reassurance line under the button)
        const ctaNoteEl = document.getElementById('qibla-main-cta-note');
        if (ctaNoteEl && typeof ui.cta_note === 'function') {
            ctaNoteEl.textContent = ui.cta_note(cityName) || '';
        }

        // Round 27: WOW caption below the compass readout
        const wowEl = document.getElementById('qibla-wow-caption');
        if (wowEl && typeof ui.wow_caption === 'function') {
            wowEl.textContent = ui.wow_caption(cityName, cardinalLabel) || '';
        }

        // ── 7. Info cards (4: city · angle · lat · lng) ──
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText('qibla-info-label-city',  ui.info_city);
        setText('qibla-info-label-angle', ui.info_angle);
        setText('qibla-info-label-lat',   ui.info_lat);
        setText('qibla-info-label-lng',   ui.info_lng);
        setText('qibla-city',        cityName);
        setText('qibla-exact-angle', angle.toFixed(2) + '°');
        setText('qibla-lat',         Number(lat).toFixed(4));
        setText('qibla-lng',         Number(lng).toFixed(4));

        // Round 27: icons on info labels + primary highlight on the angle card
        try {
            const iconMap = {
                'qibla-info-label-city':  '📍',
                'qibla-info-label-angle': '📐',
                'qibla-info-label-lat':   '🌐',
                'qibla-info-label-lng':   '🌐'
            };
            Object.keys(iconMap).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.setAttribute('data-icon', iconMap[id]);
            });
            // Mark the ANGLE card as primary — it's the true hero readout.
            const angleCard = document.getElementById('qibla-info-label-angle')?.closest('.info-card');
            document.querySelectorAll('#qibla-info-grid .info-card.info-card-primary')
                .forEach(c => c.classList.remove('info-card-primary'));
            if (angleCard) angleCard.classList.add('info-card-primary');
        } catch (_e) {}

        // ── 8. 3 quick text links ──
        const qlEl = document.getElementById('qibla-quicklinks');
        if (qlEl) {
            // Round 27.1: moon link must point to the CITY-specific moon page
            // (/moon-today-in-{slug}-{lat}-{lng}) since the label reads
            // "Moon Today in {city}". Bare /moon-today would mismatch the copy.
            let moonHref;
            if (citySlugForUrl && isFinite(lat) && isFinite(lng)) {
                const la = Number(lat).toFixed(2);
                const lo = Number(lng).toFixed(2);
                moonHref = pageUrl(`/moon-today-in-${citySlugForUrl}-${la}-${lo}`);
            } else if (citySlugForUrl) {
                moonHref = pageUrl(`/moon-today-in-${citySlugForUrl}`);
            } else {
                moonHref = pageUrl('/moon-today');
            }
            const hijriHref = pageUrl('/today-hijri-date');
            const homeHref  = pageUrl('/') || '/';
            qlEl.innerHTML = [
                `<li><a href="${moonHref}">${ui.link_moon(cityName)}</a></li>`,
                `<li><a href="${hijriHref}">${ui.link_hijri}</a></li>`,
                `<li><a href="${homeHref}">${ui.link_home}</a></li>`
            ].join('');
        }

        // ── 9. Other cities for Qibla direction (merged: nearest + popular) ──
        const otherTitleEl = document.getElementById('qibla-other-cities-title');
        if (otherTitleEl) otherTitleEl.textContent = ui.other_cities_title;
        const otherEl = document.getElementById('qibla-other-cities');
        if (otherEl) {
            // Build pool from LOCAL_CITIES + FAMOUS_MOON_CITIES. All names through resolver.
            const pool = [];
            try {
                if (typeof LOCAL_CITIES !== 'undefined' && Array.isArray(LOCAL_CITIES)) {
                    for (const c of LOCAL_CITIES) {
                        const k = makeSlug(c.en, c.lat, c.lng);
                        const nm = _resolveCityNameClient(k, lang, (lang === 'ar' ? c.ar : c.en));
                        pool.push({ key: k, name: nm, lat: c.lat, lng: c.lng });
                    }
                }
            } catch (_e) {}
            try {
                if (typeof FAMOUS_MOON_CITIES !== 'undefined' && FAMOUS_MOON_CITIES) {
                    for (const k of Object.keys(FAMOUS_MOON_CITIES)) {
                        if (pool.some(p => p.key === k)) continue;
                        const c = FAMOUS_MOON_CITIES[k];
                        // Resolver first; last-resort fallback uses slug itself (not Title-case).
                        const nm = _resolveCityNameClient(k, lang, k);
                        pool.push({ key: k, name: nm, lat: c.lat, lng: c.lng });
                    }
                }
            } catch (_e) {}

            // 5 nearest + up to 6 popular (deduped, excluding current city)
            const nearest = _nearestCitiesFrom(lat, lng, pool, 5, currentKey);
            const seenKeys = new Set([currentKey, ...nearest.map(e => e.key)]);
            const popularRaw = _popularCitiesList(currentKey, 10);
            const popularLocalized = popularRaw
                .filter(p => p && !seenKeys.has(p.key))
                .slice(0, 6)
                .map(p => ({
                    ...p,
                    name: _resolveCityNameClient(p.key, lang, (lang === 'ar' ? (p.nameAr || p.name) : p.name))
                }));

            // Round 27: show distance on the "nearest" chips (honest UX signal).
            // Popular chips skip distance so the visual rhythm stays calm.
            const nearestWithDist = nearest.map(e => ({
                ...e,
                _distKm: Math.round(_haversineKm(lat, lng, e.lat, e.lng))
            }));
            const merged = [...nearestWithDist, ...popularLocalized];
            const _distLoc = (lang === 'bn' ? 'bn' : lang);
            const _kmLabel = (lang === 'en') ? 'km' :
                             (lang === 'fr') ? 'km' :
                             (lang === 'tr') ? 'km' :
                             (lang === 'de') ? 'km' :
                             (lang === 'es') ? 'km' :
                             (lang === 'id' || lang === 'ms') ? 'km' :
                             (lang === 'ur') ? 'کلومیٹر' :
                             (lang === 'bn') ? 'কিমি' : 'كم';
            otherEl.innerHTML = merged.map(e => {
                const href = _buildQiblaUrl(e.key, e.lat, e.lng);
                const safe = String(e.name || e.key).replace(/</g, '&lt;');
                if (typeof e._distKm === 'number' && isFinite(e._distKm) && e._distKm > 0) {
                    const d = e._distKm.toLocaleString(_distLoc);
                    return `<a href="${href}">${safe} <span class="chip-dist">· ${d} ${_kmLabel}</span></a>`;
                }
                return `<a href="${href}">${safe}</a>`;
            }).join('');
        }

        // ── 10. FAQ — city name already localized ──
        const faqTitleEl = document.getElementById('qibla-faq-title');
        if (faqTitleEl) faqTitleEl.textContent = ui.faq_title;
        const faqEl = document.getElementById('qibla-faq');
        const faqCtx = {
            cityName,
            angle: angleDisplay,
            cardinal: cardinalLabel,
            distanceKm,
            lat: Number(lat).toFixed(4),
            lng: Number(lng).toFixed(4)
        };
        let faqItems = [];
        try { faqItems = ui.faq(faqCtx) || []; } catch (_e) { faqItems = []; }
        if (faqEl) {
            faqEl.innerHTML = faqItems.map(([q, a]) =>
                `<details><summary>${q}</summary><div>${a}</div></details>`
            ).join('');
        }

        // ── 11. SEO footer (Smart Summary) + Trust micro-line + 3 use-case links ──
        const footerEl = document.getElementById('qibla-footer-seo');
        if (footerEl) footerEl.textContent = ui.footer(faqCtx);
        // Round 29: Trust micro-line beneath the smart summary
        const trustEl = document.getElementById('qibla-trust-note');
        if (trustEl) trustEl.textContent = ui.trust_note || '';
        const relatedEl = document.getElementById('qibla-related');
        if (relatedEl) {
            const prayerHref = citySlugForUrl ? pageUrl(`/prayer-times-in-${citySlugForUrl}`) : pageUrl('/');
            // Round 27.1: same moon-URL logic as the quicklinks — prefer city page
            let relMoonHref;
            if (citySlugForUrl && isFinite(lat) && isFinite(lng)) {
                const la = Number(lat).toFixed(2);
                const lo = Number(lng).toFixed(2);
                relMoonHref = pageUrl(`/moon-today-in-${citySlugForUrl}-${la}-${lo}`);
            } else if (citySlugForUrl) {
                relMoonHref = pageUrl(`/moon-today-in-${citySlugForUrl}`);
            } else {
                relMoonHref = pageUrl('/moon-today');
            }
            // Round 29: related_labels is now a function taking cityName — use-case verbs with city interpolation
            const _labels = (typeof ui.related_labels === 'function')
                ? ui.related_labels(cityName)
                : (ui.related_labels || []);
            const rels = [
                { href: prayerHref,                    label: _labels[0] || '' },
                { href: relMoonHref,                   label: _labels[1] || '' },
                { href: pageUrl('/today-hijri-date'),  label: _labels[2] || '' }
            ];
            relatedEl.innerHTML = rels.map(r => `<li><a href="${r.href}">${r.label}</a></li>`).join('');
        }

        // ── 12. JSON-LD @graph (BreadcrumbList + WebPage about Kaaba + FAQPage + Place) ──
        const jsonldEl = document.getElementById('qibla-jsonld');
        if (jsonldEl) {
            const origin = (window.location.protocol === 'file:') ? '' : window.location.origin;
            const canonicalUrl = origin + window.location.pathname;
            const homeUrl = origin + (pageUrl('/') || '/');
            const qiblaHubUrl = origin + pageUrl('/qibla');
            const h1Text = ui.h1(cityName, mode === 'hub');
            const summaryText = ui.summary(angleDisplay, cardinalLabel, distanceKm, _distLocale);

            const bcItems = [
                { "@type": "ListItem", "position": 1, "name": ui.bc_home, "item": homeUrl }
            ];
            if (mode === 'hub') {
                bcItems.push({ "@type": "ListItem", "position": 2, "name": ui.bc_qibla, "item": canonicalUrl });
            } else {
                bcItems.push({ "@type": "ListItem", "position": 2, "name": ui.bc_qibla, "item": qiblaHubUrl });
                bcItems.push({ "@type": "ListItem", "position": 3, "name": cityName,    "item": canonicalUrl });
            }

            const faqEntities = faqItems.map(([q, a]) => ({
                "@type": "Question",
                "name": q,
                "acceptedAnswer": { "@type": "Answer", "text": a }
            }));

            const graph = {
                "@context": "https://schema.org",
                "@graph": [
                    { "@type": "BreadcrumbList", "itemListElement": bcItems },
                    {
                        "@type": "WebPage",
                        "name": h1Text,
                        "url": canonicalUrl,
                        "description": summaryText,
                        "about": {
                            "@type": "Place",
                            "name": "Kaaba",
                            "geo": { "@type": "GeoCoordinates", "latitude": 21.4225, "longitude": 39.8262 }
                        }
                    },
                    { "@type": "FAQPage", "mainEntity": faqEntities },
                    { "@type": "Place", "name": cityName,
                      "geo": { "@type": "GeoCoordinates", "latitude": lat, "longitude": lng } }
                ]
            };
            jsonldEl.textContent = JSON.stringify(graph);
        }
    } catch (e) {
        try { console.warn('loadQiblaPage failed:', e); } catch (_e) {}
    }
}

function updateQibla() {
    _qiblaAngle = Qibla.calculate(currentLat, currentLng);
    const _ln = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const direction = Qibla.getDirection(_qiblaAngle, _ln);
    const distance = Qibla.getDistance(currentLat, currentLng);

    document.getElementById('qibla-angle').textContent = _qiblaAngle.toFixed(1) + '°';
    document.getElementById('qibla-direction').textContent = t('qibla.direction_label', { dir: direction });
    // R36g — always render the distance in Western Arabic numerals (0-9). User reported
    //   that Arabic-Indic digits (٧٩٠) on Arabic UI were unwanted; Latin digits read
    //   easier alongside the unit and feel more consistent with the angle display.
    document.getElementById('qibla-distance').textContent = t('qibla.distance_to_kaaba', {
        distance: distance.toLocaleString('en'),
        unit: t('unit.km')
    });
    document.getElementById('qibla-exact-angle').textContent = _qiblaAngle.toFixed(2) + '°';

    // تدوير سهم البوصلة (ثابت على زاوية القبلة)
    const arrow = document.getElementById('qibla-arrow');
    if (arrow) arrow.style.transform = `translate(-50%, -100%) rotate(${_qiblaAngle}deg)`;

    // تشغيل البوصلة التلقائية (Android / غير iOS)
    startDeviceCompass();
}

function _applyCompassHeading(heading) {
    const compass = document.getElementById('compass');
    const arrow   = document.getElementById('qibla-arrow');
    if (!compass || !arrow) return;
    // دوّر الكمبس عكس اتجاه الجهاز حتى يبقى الشمال في أعلى
    compass.style.transform = `rotate(${-heading}deg)`;
    // السهم يشير إلى القبلة بزاوية مطلقة (بغض النظر عن دوران الجهاز)
    arrow.style.transform = `translate(-50%, -100%) rotate(${_qiblaAngle}deg)`;
}

function startDeviceCompass() {
    if (_compassListening || !window.DeviceOrientationEvent) return;

    const _btn = document.getElementById('compass-permission-btn');
    const _hideBtnOnFirstEvent = () => { if (_btn) _btn.style.display = 'none'; };

    // Simple original handler — any usable heading wins.
    _orientationHandler = function(e) {
        let heading = null;
        if (e.webkitCompassHeading != null && !isNaN(e.webkitCompassHeading)) {
            heading = e.webkitCompassHeading; // iOS — true magnetic heading
        } else if (e.alpha != null) {
            heading = (360 - e.alpha) % 360;   // Android — alpha is screen-relative
        }
        if (heading === null) return;
        _hideBtnOnFirstEvent();
        _applyCompassHeading(heading);
    };

    // Always attach listeners (safe on iOS — works if permission already granted).
    try { window.addEventListener('deviceorientationabsolute', _orientationHandler, true); } catch (_) {}
    try { window.addEventListener('deviceorientation',         _orientationHandler, true); } catch (_) {}
    _compassListening = true;

    // Surface the enable button on iOS or any touchscreen (WebView / strict-policy
    // browsers may need the user gesture to flow). Hides automatically on first event.
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        if (_btn) _btn.style.display = 'block';
    } else {
        const _isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (_isTouch && _btn) _btn.style.display = 'block';
    }
}

function requestCompassPermission() {
    const _attach = () => {
        // قد تكون المستمعون مُسجّلون مسبقاً من startDeviceCompass على Android — مكرّر آمن.
        try { window.addEventListener('deviceorientationabsolute', _orientationHandler, true); } catch (_) {}
        try { window.addEventListener('deviceorientation',         _orientationHandler, true); } catch (_) {}
        _compassListening = true;
        const btn = document.getElementById('compass-permission-btn');
        if (btn) btn.style.display = 'none';
    };
    // iOS 13+ — يحتاج إذن صريح عبر requestPermission()
    if (typeof DeviceOrientationEvent !== 'undefined'
        && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(state => {
            if (state === 'granted') _attach();
        }).catch(console.error);
        return;
    }
    // R36: غير-iOS — مجرّد user-gesture يكفي لكي يسمح المتصفّح بأحداث المستشعر.
    _attach();
}

// ========= القمر =========
// جدول المدن المشهورة (يُطابق FAMOUS_CITY_OVERRIDES في server.js) —
// يُستخدم فقط على صفحة /moon-today-in-{slug} لمطابقة الإحداثيّات مع الـ URL.
// ملاحظة: كلّ مدينة تحمل tz (IANA) دقيقة + DST-aware.
// للمواقع التي يحدّدها المستخدم لاحقًا خارج هذه القائمة (لو وُسِّعت المنصّة) →
// MoonCalc.getMoonTimes تستخدم تقدير من lng (Etc/GMT±N) — دقّة ±30 د للقمر، كافٍ.
const FAMOUS_MOON_CITIES = {
    'mecca':         { lat: 21.4225, lng: 39.8262,  tz: 'Asia/Riyadh' },
    'medina':        { lat: 24.4672, lng: 39.6112,  tz: 'Asia/Riyadh' },
    'riyadh':        { lat: 24.7136, lng: 46.6753,  tz: 'Asia/Riyadh' },
    'jeddah':        { lat: 21.4858, lng: 39.1925,  tz: 'Asia/Riyadh' },
    'dammam':        { lat: 26.4207, lng: 50.0888,  tz: 'Asia/Riyadh' },
    'cairo':         { lat: 30.0444, lng: 31.2357,  tz: 'Africa/Cairo' },
    'alexandria':    { lat: 31.2001, lng: 29.9187,  tz: 'Africa/Cairo' },
    'istanbul':      { lat: 41.0082, lng: 28.9784,  tz: 'Europe/Istanbul' },
    'ankara':        { lat: 39.9334, lng: 32.8597,  tz: 'Europe/Istanbul' },
    'dubai':         { lat: 25.2048, lng: 55.2708,  tz: 'Asia/Dubai' },
    'abu-dhabi':     { lat: 24.4539, lng: 54.3773,  tz: 'Asia/Dubai' },
    'doha':          { lat: 25.2854, lng: 51.5310,  tz: 'Asia/Qatar' },
    'kuwait':        { lat: 29.3759, lng: 47.9774,  tz: 'Asia/Kuwait' },
    'manama':        { lat: 26.2285, lng: 50.5860,  tz: 'Asia/Bahrain' },
    'muscat':        { lat: 23.5859, lng: 58.4059,  tz: 'Asia/Muscat' },
    'amman':         { lat: 31.9454, lng: 35.9284,  tz: 'Asia/Amman' },
    'baghdad':       { lat: 33.3152, lng: 44.3661,  tz: 'Asia/Baghdad' },
    'beirut':        { lat: 33.8938, lng: 35.5018,  tz: 'Asia/Beirut' },
    'damascus':      { lat: 33.5138, lng: 36.2765,  tz: 'Asia/Damascus' },
    'sanaa':         { lat: 15.3694, lng: 44.1910,  tz: 'Asia/Aden' },
    'tunis':         { lat: 36.8065, lng: 10.1815,  tz: 'Africa/Tunis' },
    'algiers':       { lat: 36.7538, lng: 3.0588,   tz: 'Africa/Algiers' },
    'rabat':         { lat: 34.0209, lng: -6.8416,  tz: 'Africa/Casablanca' },
    'casablanca':    { lat: 33.5731, lng: -7.5898,  tz: 'Africa/Casablanca' },
    'khartoum':      { lat: 15.5007, lng: 32.5599,  tz: 'Africa/Khartoum' },
    'tripoli':       { lat: 32.8872, lng: 13.1913,  tz: 'Africa/Tripoli' },
    'jerusalem':     { lat: 31.7683, lng: 35.2137,  tz: 'Asia/Jerusalem' },
    'karachi':       { lat: 24.8607, lng: 67.0011,  tz: 'Asia/Karachi' },
    'lahore':        { lat: 31.5204, lng: 74.3587,  tz: 'Asia/Karachi' },
    'islamabad':     { lat: 33.6844, lng: 73.0479,  tz: 'Asia/Karachi' },
    'dhaka':         { lat: 23.8103, lng: 90.4125,  tz: 'Asia/Dhaka' },
    'jakarta':       { lat: -6.2088, lng: 106.8456, tz: 'Asia/Jakarta' },
    'kuala-lumpur':  { lat: 3.1390,  lng: 101.6869, tz: 'Asia/Kuala_Lumpur' },
    'london':        { lat: 51.5074, lng: -0.1278,  tz: 'Europe/London' },
    'paris':         { lat: 48.8566, lng: 2.3522,   tz: 'Europe/Paris' },
    'berlin':        { lat: 52.5200, lng: 13.4050,  tz: 'Europe/Berlin' },
    'madrid':        { lat: 40.4168, lng: -3.7038,  tz: 'Europe/Madrid' },
    'rome':          { lat: 41.9028, lng: 12.4964,  tz: 'Europe/Rome' },
    'new-york':      { lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
    'toronto':       { lat: 43.6532, lng: -79.3832, tz: 'America/Toronto' },
    'sydney':        { lat: -33.8688, lng: 151.2093, tz: 'Australia/Sydney' },
    // ── Asia-Pacific (added so Tokyo/Seoul/Bangkok users see real neighbors) ──
    'tokyo':         { lat: 35.6762, lng: 139.6503, tz: 'Asia/Tokyo' },
    'seoul':         { lat: 37.5665, lng: 126.9780, tz: 'Asia/Seoul' },
    'beijing':       { lat: 39.9042, lng: 116.4074, tz: 'Asia/Shanghai' },
    'shanghai':      { lat: 31.2304, lng: 121.4737, tz: 'Asia/Shanghai' },
    'hong-kong':     { lat: 22.3193, lng: 114.1694, tz: 'Asia/Hong_Kong' },
    'taipei':        { lat: 25.0330, lng: 121.5654, tz: 'Asia/Taipei' },
    'manila':        { lat: 14.5995, lng: 120.9842, tz: 'Asia/Manila' },
    'bangkok':       { lat: 13.7563, lng: 100.5018, tz: 'Asia/Bangkok' },
    'singapore':     { lat: 1.3521,  lng: 103.8198, tz: 'Asia/Singapore' },
    'delhi':         { lat: 28.6139, lng: 77.2090,  tz: 'Asia/Kolkata' },
    'mumbai':        { lat: 19.0760, lng: 72.8777,  tz: 'Asia/Kolkata' },
    // ── Africa / Americas / Europe extras ──
    'lagos':         { lat: 6.5244,  lng: 3.3792,   tz: 'Africa/Lagos' },
    'nairobi':       { lat: -1.2921, lng: 36.8219,  tz: 'Africa/Nairobi' },
    'johannesburg':  { lat: -26.2041, lng: 28.0473, tz: 'Africa/Johannesburg' },
    'addis-ababa':   { lat: 9.0320,  lng: 38.7469,  tz: 'Africa/Addis_Ababa' },
    'los-angeles':   { lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
    'chicago':       { lat: 41.8781, lng: -87.6298,  tz: 'America/Chicago' },
    'mexico-city':   { lat: 19.4326, lng: -99.1332,  tz: 'America/Mexico_City' },
    'sao-paulo':     { lat: -23.5505, lng: -46.6333, tz: 'America/Sao_Paulo' },
    'amsterdam':     { lat: 52.3676, lng: 4.9041,    tz: 'Europe/Amsterdam' },
    'moscow':        { lat: 55.7558, lng: 37.6173,   tz: 'Europe/Moscow' },
    'vienna':        { lat: 48.2082, lng: 16.3738,   tz: 'Europe/Vienna' }
};

function _moonCitySlugFromPath() {
    // Round 15 + Round 16: فصل الـ URLs — ثلاثة أشكال:
    //   /moon-today-in-{slug}[-{lat}-{lng}]                → صفحة اليوم
    //   /moon-in-{slug}[-{lat}-{lng}]/YYYY-MM-DD          → صفحة مؤرَّخة
    //   /moon-in-{slug}[-{lat}-{lng}]                      → صفحة hub (Round 16)
    // نُرجِع slug فقط — الإحداثيّات تُقرأ عبر _moonCoordsFromPath().
    const p = window.location.pathname;
    let m = p.match(/\/moon-today-in-([a-z][a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/);
    if (m) return m[1];
    m = p.match(/\/moon-in-([a-z][a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?\/\d{4}-\d{2}-\d{2}$/);
    if (m) return m[1];
    // Round 16: hub — /moon-in-{slug}[-{lat}-{lng}] بلا تاريخ
    m = p.match(/\/moon-in-([a-z][a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/);
    return m ? m[1] : null;
}

// Round 16: يرجِع true إذا كان المسار الحاليّ هو hub page للمدينة (/moon-in-{slug} بلا تاريخ).
// مستخدَم لـ:
//   (أ) إخفاء moon-date-nav عن الـ hub (غير مفيد هناك)
//   (ب) تعديل H1 إن لزم
//   (ج) تعديل روابط «مدن أخرى» لتشير إلى hub بدل today
function _moonIsHubPath() {
    const p = window.location.pathname;
    // استبعد صفحة التاريخ أوّلاً (التاريخ ينتهي بـ /YYYY-MM-DD)
    if (/\/moon-in-[a-z][a-z0-9-]+(?:-[-.\d]+-[-.\d]+)?\/\d{4}-\d{2}-\d{2}$/.test(p)) return false;
    return /\/moon-in-[a-z][a-z0-9-]+?(?:-(?:-?\d+(?:\.\d+)?)-(?:-?\d+(?:\.\d+)?))?$/.test(p);
}

// Round 12: إحداثيّات المدينة من الـ URL إن كانت coord-suffix موجودة.
// Round 15 + Round 16: ندعم ثلاثة أشكال (today + dated + hub). يُرجِع {lat, lng} أو null.
function _moonCoordsFromPath() {
    const p = window.location.pathname;
    let m = p.match(/\/moon-today-in-[a-z][a-z0-9-]+?-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
    if (!m) {
        m = p.match(/\/moon-in-[a-z][a-z0-9-]+?-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)\/\d{4}-\d{2}-\d{2}$/);
    }
    if (!m) {
        // Round 16: hub — /moon-in-{slug}-lat-lng (بلا تاريخ)
        m = p.match(/\/moon-in-[a-z][a-z0-9-]+?-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
    }
    if (!m) return null;
    const lat = parseFloat(m[1]);
    const lng = parseFloat(m[2]);
    if (!isFinite(lat) || !isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
}

// يستخرج التاريخ الـ ISO من المسار (إن وُجد)، ويُرجِع Date صالحاً أو null
//   مثال ميلاديّ: /moon-in-mecca/2026-04-19 → Date(2026, 3, 19)
//   مثال هجريّ:  /moon-in-mecca/1447-10-03 → يُحوَّل إلى Date ميلاديّ المكافئ
//   heuristic: السنوات < 1800 تُعامَل هجريّة (لا تداخل مع سنوات ميلاديّة مستعملة).
//   الـ Date يعود في منتصف النهار (12:00) لتجنّب حدود DST.
//   Round 15: التاريخ موجود فقط تحت /moon-in- (ليس /moon-today-in-).
function _moonDateFromPath() {
    const m = window.location.pathname.match(/\/moon-in-[a-z][a-z0-9-]+(?:-(?:-?\d+(?:\.\d+)?)-(?:-?\d+(?:\.\d+)?))?\/(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    if (!y || !mo || !d || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    // سنة < 1800 → تاريخ هجريّ (نطاق Hijri ≈ 1300-1600، Gregorian ≥ 1900)
    if (y < 1800) {
        if (typeof HijriDate === 'undefined' || typeof HijriDate.toGregorian !== 'function') return null;
        try {
            const g = HijriDate.toGregorian(y, mo, d);
            if (!g || !g.year || !g.month || !g.day) return null;
            const dt = new Date(g.year, g.month - 1, g.day, 12, 0, 0, 0);
            if (isNaN(dt.getTime())) return null;
            return dt;
        } catch (_e) { return null; }
    }
    const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
    // تأكّد من صحّة التقويم (مثلاً: 2026-02-30 → تنزلق إلى 2 مارس)
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return dt;
}

// يرجع {y, m, d} بصيغة ISO strings (padded) من Date
function _isoDateStr(d) {
    const pad = n => n < 10 ? '0' + n : String(n);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// Round 15: ينتج رابط صفحة القمر — today أو dated:
//   بدون تاريخ → /moon-today-in-{slug}         (صفحة اليوم)
//   مع تاريخ   → /moon-in-{slug}/{iso}         (صفحة مؤرَّخة)
// يحافظ على بادئة اللغة الحاليّة.
function _moonDatePagePath(slug, dateOrNull) {
    const path = window.location.pathname;
    const langMatch = path.match(/^\/(en|fr|tr|ur|de|id|es|bn|ms)\//);
    const prefix = langMatch ? '/' + langMatch[1] : '';
    const base = prefix + (dateOrNull ? '/moon-in-' : '/moon-today-in-') + slug;
    return dateOrNull ? (base + '/' + _isoDateStr(dateOrNull)) : base;
}

function _prettifySlug(slug) {
    return String(slug || '')
        .split('-')
        .map(w => w.length ? w[0].toUpperCase() + w.slice(1) : w)
        .join(' ');
}

// يرجع اسم المدينة بلغة الواجهة.
// الأولويّة:
//   1) مفتاح i18n "city.<slug_normalized>" (للمدن المعروفة مع ترجمات يدويّة).
//   2) currentCity (إن كان اسم المدينة الحاليّة يُطابق الـ slug) — يُعرِّب المدن غير
//      المُدرَجة في i18n تلقائيًّا عبر reverse-geocoding أو DB السيرفر (مثل "طوكيو").
//   3) fallback: تجميل الـ slug (e.g., "tokyo" → "Tokyo").
function _moonCityDisplayName(slug) {
    if (!slug) return '';
    // 1) مفتاح i18n city.<slug>
    const key = 'city.' + slug.replace(/-/g, '_');
    if (typeof t === 'function') {
        const localized = t(key);
        if (localized && localized !== key) return localized;
    }
    // 2) الاسم الحاليّ (lang-aware) إن كان يُمثِّل نفس المدينة في الـ slug
    //    نستخدم getDisplayCity() التي ترجع الاسم بلغة الواجهة:
    //      AR → currentCity (عربيّ)، EN → currentEnglishDisplayName/Name، غيرها → currentLocalizedName أو قاموس
    try {
        if (typeof currentEnglishName === 'string' && currentEnglishName) {
            const _simpleCurEn = currentEnglishName.toLowerCase().trim()
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            // slug يُطابق إذا كان currentEnglishName = slug أو يبدأ بـ slug + '-'
            //   مثال: slug="tokyo" مع currentEnglishName="Tokyo Metropolitan Government Main Building 1"
            //   → simpleCurEn="tokyo-metropolitan-government..." يبدأ بـ "tokyo-" → نطابق.
            if (_simpleCurEn === slug || _simpleCurEn.startsWith(slug + '-')) {
                const _lngCur = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                // حارس خطّ: إن كان _disp/currentCity بخطّ غير متوافق مع اللغة
                //   (مثلاً "千代田区" في صفحة تركيّة)، نتجاوز هذا المستوى لنسقط للقاموس/tier 3+.
                const _scriptOk = (v) => {
                    if (!v) return false;
                    if (typeof _isDisplayScriptAcceptable === 'function') {
                        return _isDisplayScriptAcceptable(v, _lngCur);
                    }
                    return true;
                };
                if (typeof getDisplayCity === 'function') {
                    const _disp = getDisplayCity();
                    if (_disp && _scriptOk(_disp)) return _disp;
                }
                if (typeof currentCity === 'string' && currentCity && _scriptOk(currentCity)) return currentCity;
            }
        }
    } catch (_e) { /* silent */ }
    // 3) قاموس _LOCALIZED_CITY_MAPS للغات UR/TR/FR/DE/ID/BN/ES/MS
    //    (عندما لا يوجد مفتاح i18n ولا session currentCity — الزيارة المباشرة للـ URL)
    try {
        const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        if (_lng && _lng !== 'ar' && _lng !== 'en'
            && typeof _LOCALIZED_CITY_MAPS !== 'undefined'
            && _LOCALIZED_CITY_MAPS[_lng]) {
            const _englishName = _prettifySlug(slug); // "tokyo" → "Tokyo", "kuala-lumpur" → "Kuala Lumpur"
            const _localized = _LOCALIZED_CITY_MAPS[_lng][_englishName];
            if (_localized) return _localized;
        }
    } catch (_e) { /* silent */ }
    // 4) قاموس CITY_NAMES_AR للعربيّة (زيارة مباشرة بدون session)
    try {
        const _lng2 = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        if (_lng2 === 'ar' && typeof CITY_NAMES_AR !== 'undefined') {
            const _englishName2 = _prettifySlug(slug);
            if (CITY_NAMES_AR[_englishName2]) return CITY_NAMES_AR[_englishName2];
        }
    } catch (_e) { /* silent */ }
    // 5) fallback نهائيّ: _prettifySlug (يُرجع النسخة الإنجليزيّة فقط إذا لم يوجد شيء آخر)
    return _prettifySlug(slug);
}

// خريطة المدينة → البلد (key 'country.<code>' في i18n)؛ تُستخدم في الفقرة التعريفيّة وH1
const _MOON_CITY_COUNTRY_KEYS = {
    'mecca': 'sa', 'medina': 'sa', 'riyadh': 'sa', 'jeddah': 'sa', 'dammam': 'sa',
    'khobar': 'sa', 'taif': 'sa', 'tabuk': 'sa', 'buraidah': 'sa', 'buraydah': 'sa',
    'abha': 'sa', 'yanbu': 'sa', 'hail': 'sa', 'najran': 'sa', 'jizan': 'sa',
    'qatif': 'sa', 'jubail': 'sa', 'hofuf': 'sa',
    'cairo': 'eg', 'alexandria': 'eg', 'giza': 'eg',
    'istanbul': 'tr', 'ankara': 'tr', 'izmir': 'tr',
    'dubai': 'ae', 'abu-dhabi': 'ae', 'sharjah': 'ae',
    'doha': 'qa', 'kuwait': 'kw', 'kuwait-city': 'kw', 'manama': 'bh', 'muscat': 'om',
    'amman': 'jo', 'baghdad': 'iq', 'basra': 'iq', 'mosul': 'iq',
    'beirut': 'lb', 'damascus': 'sy', 'aleppo': 'sy', 'homs': 'sy', 'sanaa': 'ye', 'aden': 'ye',
    'tunis': 'tn', 'algiers': 'dz', 'rabat': 'ma', 'casablanca': 'ma', 'marrakesh': 'ma',
    'khartoum': 'sd', 'tripoli': 'ly', 'jerusalem': 'ps', 'gaza': 'ps', 'ramallah': 'ps',
    'karachi': 'pk', 'lahore': 'pk', 'islamabad': 'pk',
    'dhaka': 'bd', 'chittagong': 'bd',
    'jakarta': 'id', 'surabaya': 'id', 'bandung': 'id',
    'kuala-lumpur': 'my', 'singapore': 'sg',
    'london': 'gb', 'manchester': 'gb', 'birmingham': 'gb',
    'paris': 'fr', 'berlin': 'de', 'munich': 'de',
    'madrid': 'es', 'barcelona': 'es', 'rome': 'it', 'milan': 'it',
    'moscow': 'ru',
    'new-york': 'us', 'los-angeles': 'us', 'chicago': 'us',
    'toronto': 'ca',
    'tokyo': 'jp', 'beijing': 'cn', 'shanghai': 'cn',
    'seoul': 'kr', 'bangkok': 'th', 'hanoi': 'vn', 'manila': 'ph',
    'delhi': 'in', 'mumbai': 'in', 'kolkata': 'in', 'bangalore': 'in', 'chennai': 'in', 'hyderabad': 'in',
    'sydney': 'au', 'melbourne': 'au'
};
const _MOON_COUNTRY_NAMES = {
    ar: { sa:'السعوديّة', eg:'مصر', tr:'تركيا', ae:'الإمارات', qa:'قطر', kw:'الكويت', bh:'البحرين', om:'عُمان', jo:'الأردن', iq:'العراق', lb:'لبنان', sy:'سوريا', ye:'اليمن', tn:'تونس', dz:'الجزائر', ma:'المغرب', sd:'السودان', ly:'ليبيا', ps:'فلسطين', pk:'باكستان', bd:'بنغلاديش', id:'إندونيسيا', my:'ماليزيا', gb:'المملكة المتّحدة', fr:'فرنسا', de:'ألمانيا', es:'إسبانيا', it:'إيطاليا', us:'الولايات المتّحدة', ca:'كندا', au:'أستراليا', jp:'اليابان', cn:'الصين', kr:'كوريا الجنوبيّة', th:'تايلاند', vn:'فيتنام', ph:'الفلبّين', in:'الهند', ru:'روسيا', sg:'سنغافورة' },
    en: { sa:'Saudi Arabia', eg:'Egypt', tr:'Turkey', ae:'UAE', qa:'Qatar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Jordan', iq:'Iraq', lb:'Lebanon', sy:'Syria', ye:'Yemen', tn:'Tunisia', dz:'Algeria', ma:'Morocco', sd:'Sudan', ly:'Libya', ps:'Palestine', pk:'Pakistan', bd:'Bangladesh', id:'Indonesia', my:'Malaysia', gb:'United Kingdom', fr:'France', de:'Germany', es:'Spain', it:'Italy', us:'United States', ca:'Canada', au:'Australia', jp:'Japan', cn:'China', kr:'South Korea', th:'Thailand', vn:'Vietnam', ph:'Philippines', in:'India', ru:'Russia', sg:'Singapore' },
    fr: { sa:'Arabie saoudite', eg:'Égypte', tr:'Turquie', ae:'Émirats arabes unis', qa:'Qatar', kw:'Koweït', bh:'Bahreïn', om:'Oman', jo:'Jordanie', iq:'Irak', lb:'Liban', sy:'Syrie', ye:'Yémen', tn:'Tunisie', dz:'Algérie', ma:'Maroc', sd:'Soudan', ly:'Libye', ps:'Palestine', pk:'Pakistan', bd:'Bangladesh', id:'Indonésie', my:'Malaisie', gb:'Royaume-Uni', fr:'France', de:'Allemagne', es:'Espagne', it:'Italie', us:'États-Unis', ca:'Canada', au:'Australie', jp:'Japon', cn:'Chine', kr:'Corée du Sud', th:'Thaïlande', vn:'Vietnam', ph:'Philippines', in:'Inde', ru:'Russie', sg:'Singapour' },
    tr: { sa:'Suudi Arabistan', eg:'Mısır', tr:'Türkiye', ae:'BAE', qa:'Katar', kw:'Kuveyt', bh:'Bahreyn', om:'Umman', jo:'Ürdün', iq:'Irak', lb:'Lübnan', sy:'Suriye', ye:'Yemen', tn:'Tunus', dz:'Cezayir', ma:'Fas', sd:'Sudan', ly:'Libya', ps:'Filistin', pk:'Pakistan', bd:'Bangladeş', id:'Endonezya', my:'Malezya', gb:'Birleşik Krallık', fr:'Fransa', de:'Almanya', es:'İspanya', it:'İtalya', us:'ABD', ca:'Kanada', au:'Avustralya', jp:'Japonya', cn:'Çin', kr:'Güney Kore', th:'Tayland', vn:'Vietnam', ph:'Filipinler', in:'Hindistan', ru:'Rusya', sg:'Singapur' },
    ur: { sa:'سعودی عرب', eg:'مصر', tr:'ترکی', ae:'متحدہ عرب امارات', qa:'قطر', kw:'کویت', bh:'بحرین', om:'عمان', jo:'اردن', iq:'عراق', lb:'لبنان', sy:'شام', ye:'یمن', tn:'تیونس', dz:'الجزائر', ma:'مراکش', sd:'سوڈان', ly:'لیبیا', ps:'فلسطین', pk:'پاکستان', bd:'بنگلہ دیش', id:'انڈونیشیا', my:'ملیشیا', gb:'برطانیہ', fr:'فرانس', de:'جرمنی', es:'اسپین', it:'اٹلی', us:'امریکہ', ca:'کینیڈا', au:'آسٹریلیا', jp:'جاپان', cn:'چین', kr:'جنوبی کوریا', th:'تھائی لینڈ', vn:'ویتنام', ph:'فلپائن', in:'بھارت', ru:'روس', sg:'سنگاپور' },
    de: { sa:'Saudi-Arabien', eg:'Ägypten', tr:'Türkei', ae:'VAE', qa:'Katar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Jordanien', iq:'Irak', lb:'Libanon', sy:'Syrien', ye:'Jemen', tn:'Tunesien', dz:'Algerien', ma:'Marokko', sd:'Sudan', ly:'Libyen', ps:'Palästina', pk:'Pakistan', bd:'Bangladesch', id:'Indonesien', my:'Malaysia', gb:'Vereinigtes Königreich', fr:'Frankreich', de:'Deutschland', es:'Spanien', it:'Italien', us:'USA', ca:'Kanada', au:'Australien', jp:'Japan', cn:'China', kr:'Südkorea', th:'Thailand', vn:'Vietnam', ph:'Philippinen', in:'Indien', ru:'Russland', sg:'Singapur' },
    id: { sa:'Arab Saudi', eg:'Mesir', tr:'Turki', ae:'UEA', qa:'Qatar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Yordania', iq:'Irak', lb:'Lebanon', sy:'Suriah', ye:'Yaman', tn:'Tunisia', dz:'Aljazair', ma:'Maroko', sd:'Sudan', ly:'Libya', ps:'Palestina', pk:'Pakistan', bd:'Bangladesh', id:'Indonesia', my:'Malaysia', gb:'Britania Raya', fr:'Prancis', de:'Jerman', es:'Spanyol', it:'Italia', us:'Amerika Serikat', ca:'Kanada', au:'Australia', jp:'Jepang', cn:'Tiongkok', kr:'Korea Selatan', th:'Thailand', vn:'Vietnam', ph:'Filipina', in:'India', ru:'Rusia', sg:'Singapura' },
    es: { sa:'Arabia Saudí', eg:'Egipto', tr:'Turquía', ae:'EAU', qa:'Catar', kw:'Kuwait', bh:'Baréin', om:'Omán', jo:'Jordania', iq:'Irak', lb:'Líbano', sy:'Siria', ye:'Yemen', tn:'Túnez', dz:'Argelia', ma:'Marruecos', sd:'Sudán', ly:'Libia', ps:'Palestina', pk:'Pakistán', bd:'Bangladés', id:'Indonesia', my:'Malasia', gb:'Reino Unido', fr:'Francia', de:'Alemania', es:'España', it:'Italia', us:'Estados Unidos', ca:'Canadá', au:'Australia', jp:'Japón', cn:'China', kr:'Corea del Sur', th:'Tailandia', vn:'Vietnam', ph:'Filipinas', in:'India', ru:'Rusia', sg:'Singapur' },
    bn: { sa:'সৌদি আরব', eg:'মিশর', tr:'তুরস্ক', ae:'সংযুক্ত আরব আমিরাত', qa:'কাতার', kw:'কুয়েত', bh:'বাহরাইন', om:'ওমান', jo:'জর্ডান', iq:'ইরাক', lb:'লেবানন', sy:'সিরিয়া', ye:'ইয়েমেন', tn:'তিউনিসিয়া', dz:'আলজেরিয়া', ma:'মরক্কো', sd:'সুদান', ly:'লিবিয়া', ps:'ফিলিস্তিন', pk:'পাকিস্তান', bd:'বাংলাদেশ', id:'ইন্দোনেশিয়া', my:'মালয়েশিয়া', gb:'যুক্তরাজ্য', fr:'ফ্রান্স', de:'জার্মানি', es:'স্পেন', it:'ইতালি', us:'মার্কিন যুক্তরাষ্ট্র', ca:'কানাডা', au:'অস্ট্রেলিয়া', jp:'জাপান', cn:'চীন', kr:'দক্ষিণ কোরিয়া', th:'থাইল্যান্ড', vn:'ভিয়েতনাম', ph:'ফিলিপাইন', in:'ভারত', ru:'রাশিয়া', sg:'সিঙ্গাপুর' },
    ms: { sa:'Arab Saudi', eg:'Mesir', tr:'Turki', ae:'UAE', qa:'Qatar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Jordan', iq:'Iraq', lb:'Lubnan', sy:'Syria', ye:'Yaman', tn:'Tunisia', dz:'Algeria', ma:'Maghribi', sd:'Sudan', ly:'Libya', ps:'Palestin', pk:'Pakistan', bd:'Bangladesh', id:'Indonesia', my:'Malaysia', gb:'United Kingdom', fr:'Perancis', de:'Jerman', es:'Sepanyol', it:'Itali', us:'Amerika Syarikat', ca:'Kanada', au:'Australia', jp:'Jepun', cn:'China', kr:'Korea Selatan', th:'Thailand', vn:'Vietnam', ph:'Filipina', in:'India', ru:'Rusia', sg:'Singapura' }
};

function _moonCityCountryName(slug, lang) {
    if (!slug) return '';
    const cc = _MOON_CITY_COUNTRY_KEYS[slug];
    if (!cc) return '';
    const dict = _MOON_COUNTRY_NAMES[lang] || _MOON_COUNTRY_NAMES.en;
    return dict[cc] || '';
}

// يبني مسار SVG لشكل القمر من نسبة الإضاءة الحقيقيّة.
// illum: [0..1] (0=محاق، 0.5=تربيع، 1=بدر)
// waxing: true = القمر يتزايد (مضاء على اليمين في نصف الكرة الشماليّ)،
//         false = يتناقص (مضاء على اليسار)
// r: نصف قطر القمر في إحداثيّات SVG (افتراضيًّا 45 للـ viewBox -50 -50 100 100)
//
// الخوارزميّة:
//   - limb = نصف دائرة من الأعلى إلى الأسفل على الجهة المضاءة.
//   - terminator = نصف قطع ناقص من الأسفل إلى الأعلى، نصف محوره الأفقيّ rx = |1-2·illum|·r.
//   - موقع القطع الناقص:
//       هلال (i<0.5): terminator على الجهة المضاءة (يمرّ عبر +rx لواكس).
//       أحدب (i>0.5): terminator على الجهة المظلمة (يمرّ عبر -rx لواكس).
//   - إشارة sweep لـ SVG: "CCW على الشاشة" (y يزداد للأسفل) = sweep=0، والعكس.
function _buildMoonPhasePath(illum, waxing, r) {
    r = r || 45;
    const i = Math.max(0, Math.min(1, illum));
    if (i <= 0.003) return '';  // محاق: لا شيء مضاء
    if (i >= 0.997) {
        // بدر: دائرة كاملة (قوسان كبيران)
        return `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`;
    }
    const rx = r * Math.abs(1 - 2 * i);
    const isCrescent = i < 0.5;
    if (waxing) {
        // limb على اليمين → sweep=1 (من الأعلى للأسفل عبر +x)
        // terminator من (0,+r) إلى (0,-r):
        //   هلال → يمرّ عبر (+rx,0) → sweep=0 (CCW on screen: bottom→+x→top)
        //   أحدب → يمرّ عبر (-rx,0) → sweep=1 (CW on screen: bottom→-x→top)
        const sweep = isCrescent ? 0 : 1;
        return `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${rx} ${r} 0 0 ${sweep} 0 ${-r} Z`;
    } else {
        // limb على اليسار → sweep=0
        // terminator:
        //   هلال → يمرّ عبر (-rx,0) → sweep=1
        //   أحدب → يمرّ عبر (+rx,0) → sweep=0
        const sweep = isCrescent ? 1 : 0;
        return `M 0 ${-r} A ${r} ${r} 0 0 0 0 ${r} A ${rx} ${r} 0 0 ${sweep} 0 ${-r} Z`;
    }
}

// يبني «المدينة، البلد» بترجمة مناسبة للغة وفاصل مناسب (AR/UR → ، و غيرها → ,).
// يُستخدم للفقرة التعريفيّة وللـ Article schema — يطابق ما يراه Googlebot من SSR.
function _moonCityLabel(slug, lang, cityFallback) {
    const city = slug ? _moonCityDisplayName(slug) : (cityFallback || '');
    const country = slug ? _moonCityCountryName(slug, lang) : '';
    if (!country) return city;
    const sep = (lang === 'ar' || lang === 'ur') ? '، ' : ', ';
    return city + sep + country;
}

// يحدِّد ما إذا كان الجزء التاريخيّ في الـ URL بصيغة هجريّة (السنة < 1800)
// يعود {isHijri: boolean, hYear, hMonth, hDay, gYear, gMonth, gDay} أو null إن لا تاريخ
// Round 15: التاريخ موجود فقط تحت /moon-in- (ليس /moon-today-in-)، ويدعم coord-suffix.
function _moonDateKindFromPath() {
    const m = window.location.pathname.match(/\/moon-in-[a-z][a-z0-9-]+(?:-(?:-?\d+(?:\.\d+)?)-(?:-?\d+(?:\.\d+)?))?\/(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    if (!y || !mo || !d) return null;
    if (y < 1800) {
        if (typeof HijriDate === 'undefined' || typeof HijriDate.toGregorian !== 'function') return null;
        try {
            const g = HijriDate.toGregorian(y, mo, d);
            if (!g || !g.year) return null;
            return { isHijri: true, hYear: y, hMonth: mo, hDay: d, gYear: g.year, gMonth: g.month, gDay: g.day };
        } catch (_e) { return null; }
    }
    // ميلاديّ — نحسب الهجريّ للعرض
    let hj = null;
    if (typeof HijriDate !== 'undefined' && typeof HijriDate.toHijri === 'function') {
        try { hj = HijriDate.toHijri(y, mo, d); } catch (_e) { hj = null; }
    }
    return { isHijri: false, gYear: y, gMonth: mo, gDay: d, hYear: hj ? hj.year : null, hMonth: hj ? hj.month : null, hDay: hj ? hj.day : null };
}

// يُعيد نصًّا مقروءًا للتاريخ الهجريّ (مثال: "3 ذو القعدة 1447 هـ") بلغة الواجهة
function _formatHijriLabelLang(hY, hM, hD, lang) {
    if (!hY || !hM || !hD) return '';
    const _H = {
        ar: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
        en: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab','Shaban','Ramadan','Shawwal','Dhu al-Qidah','Dhu al-Hijjah'],
        fr: ['Mouharram','Safar','Rabi al-Awwal','Rabi al-Thani','Joumada al-Oula','Joumada al-Thania','Rajab','Chaabane','Ramadan','Chawwal','Dhou al-Qida','Dhou al-Hijja'],
        tr: ['Muharrem','Safer','Rebiülevvel','Rebiülahir','Cemaziyelevvel','Cemaziyelahir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'],
        ur: ['محرم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذی القعدہ','ذی الحجہ'],
        de: ['Muharram','Safar','Rabiʿ al-awwal','Rabiʿ ath-thani','Dschumada l-ula','Dschumada th-thaniya','Radschab','Schaʿban','Ramadan','Schawwal','Dhu l-qaʿda','Dhu l-hiddscha'],
        id: ['Muharram','Safar','Rabiul Awal','Rabiul Akhir','Jumadil Awal','Jumadil Akhir','Rajab','Syakban','Ramadan','Syawal','Zulkaidah','Zulhijah'],
        es: ['Muharram','Safar','Rabí al-Awwal','Rabí al-Thani','Yumada al-Awwal','Yumada al-Thani','Rayab','Shaabán','Ramadán','Shawwal','Dhu al-Qida','Dhu al-Hiyya'],
        bn: ['মহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জুমাদাল আউয়াল','জুমাদাস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'],
        ms: ['Muharam','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah']
    };
    const _SFX = { ar: ' هـ', en: ' AH', fr: ' H', tr: ' H', ur: ' ھ', de: ' n.H.', id: ' H', es: ' d.H.', bn: ' হিজরি', ms: ' H' };
    const names = _H[lang] || _H.en;
    const mName = names[hM - 1] || String(hM);
    const sfx = _SFX[lang] || _SFX.en;
    return hD + ' ' + mName + ' ' + hY + sfx;
}

// يُنشئ/يُحدِّث الـ badge والسطر التوضيحيّ تحت H1 عند الدخول عبر رابط هجريّ/ميلاديّ
function _applyMoonDateBadge() {
    const kind = _moonDateKindFromPath();
    const h1 = document.getElementById('moon-page-h1');
    if (!h1) return;
    // إزالة أيّ شارة/subtitle سابقة من SSR ثمّ إعادة البناء (لدعم SPA nav)
    const prevBadge = document.getElementById('moon-date-badge');
    const prevSub = document.getElementById('moon-subtitle-hijri');
    if (prevBadge && prevBadge.parentNode) prevBadge.parentNode.removeChild(prevBadge);
    if (prevSub && prevSub.parentNode) prevSub.parentNode.removeChild(prevSub);
    // أزل classes السياقيّة
    document.documentElement.classList.remove('moon-hijri-context', 'moon-gregorian-context');
    if (!kind) return;
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    // أعد ضبط الـ class السياقيّة
    document.documentElement.classList.add(kind.isHijri ? 'moon-hijri-context' : 'moon-gregorian-context');
    // نصّ الـ badge
    const _BADGES = {
        ar: { hijri: '🌙 عرض حسب التاريخ الهجري', greg: '📅 عرض حسب التاريخ الميلادي' },
        en: { hijri: '🌙 Viewing by Hijri date', greg: '📅 Viewing by Gregorian date' },
        fr: { hijri: '🌙 Affichage par date hégirienne', greg: '📅 Affichage par date grégorienne' },
        tr: { hijri: '🌙 Hicri tarihe göre görüntüleme', greg: '📅 Miladi tarihe göre görüntüleme' },
        ur: { hijri: '🌙 ہجری تاریخ کے مطابق نمائش', greg: '📅 میلادی تاریخ کے مطابق نمائش' },
        de: { hijri: '🌙 Anzeige nach Hidschri-Datum', greg: '📅 Anzeige nach gregorianischem Datum' },
        id: { hijri: '🌙 Dilihat menurut tanggal Hijriah', greg: '📅 Dilihat menurut tanggal Masehi' },
        es: { hijri: '🌙 Vista por fecha hijrí', greg: '📅 Vista por fecha gregoriana' },
        bn: { hijri: '🌙 হিজরি তারিখ অনুযায়ী দেখা', greg: '📅 গ্রেগরীয় তারিখ অনুযায়ী দেখা' },
        ms: { hijri: '🌙 Paparan mengikut tarikh Hijrah', greg: '📅 Paparan mengikut tarikh Masihi' }
    };
    const badgeText = ((_BADGES[lang] || _BADGES.en)[kind.isHijri ? 'hijri' : 'greg']);
    const badge = document.createElement('div');
    badge.id = 'moon-date-badge';
    badge.className = 'moon-date-badge ' + (kind.isHijri ? 'hijri' : 'gregorian');
    badge.textContent = badgeText;
    // نصّ الـ subtitle «الموافق الميلاديّ/الهجريّ»
    const _EQUIV = {
        ar: (d) => `الموافق ${d}`,
        en: (d) => `(equivalent to ${d})`,
        fr: (d) => `(équivalent au ${d})`,
        tr: (d) => `(${d} tarihine denk gelir)`,
        ur: (d) => `بمطابق ${d}`,
        de: (d) => `(entspricht ${d})`,
        id: (d) => `(setara dengan ${d})`,
        es: (d) => `(equivalente al ${d})`,
        bn: (d) => `(${d}-এর সমতুল্য)`,
        ms: (d) => `(bersamaan ${d})`
    };
    // حساب التاريخ الثانويّ:
    //   إن كان الرابط هجريًّا → الميلاديّ (من getMoonForecast أو formatter محليّ)
    //   إن كان الرابط ميلاديًّا → الهجريّ
    let secondaryLabel = '';
    if (kind.isHijri) {
        try {
            const gdt = new Date(kind.gYear, kind.gMonth - 1, kind.gDay);
            // نفضّل مُنسّق اللغة للتأريخ الميلاديّ (Intl)
            const _GLOCALE = { ar: 'ar', en: 'en-US', fr: 'fr-FR', tr: 'tr-TR', ur: 'ur-PK', de: 'de-DE', id: 'id-ID', es: 'es-ES', bn: 'bn-BD', ms: 'ms-MY' };
            secondaryLabel = new Intl.DateTimeFormat(_GLOCALE[lang] || 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(gdt);
        } catch (_e) { secondaryLabel = kind.gYear + '-' + String(kind.gMonth).padStart(2, '0') + '-' + String(kind.gDay).padStart(2, '0'); }
    } else if (kind.hYear) {
        secondaryLabel = _formatHijriLabelLang(kind.hYear, kind.hMonth, kind.hDay, lang);
    }
    const subtitle = document.createElement('p');
    subtitle.id = 'moon-subtitle-hijri';
    subtitle.className = 'moon-subtitle-hijri';
    subtitle.textContent = secondaryLabel ? (_EQUIV[lang] || _EQUIV.en)(secondaryLabel) : '';
    // أدرج بعد H1 مباشرةً: أوّلاً subtitle ثمّ badge
    if (subtitle.textContent) {
        h1.parentNode.insertBefore(subtitle, h1.nextSibling);
        h1.parentNode.insertBefore(badge, subtitle.nextSibling);
    } else {
        h1.parentNode.insertBefore(badge, h1.nextSibling);
    }
}

function updateMoonInfo() {
    // إن كان المسار /moon-today-in-{slug}/YYYY-MM-DD → استخدم التاريخ المطلوب
    // وإلا اليوم الحاليّ.
    const _requestedDate = _moonDateFromPath();
    const today = _requestedDate || new Date();
    const _isDatePage = !!_requestedDate;
    // Round 16: hub page = /moon-in-{slug} (بلا تاريخ) — نستعمله في هذا الملفّ لـ:
    //   (أ) اختيار H1 بلا "اليوم"  (ب) إخفاء moon-date-nav (عبر CSS أيضاً)  (ج) تعديل subtitle
    const _isHubPage = !_isDatePage && _moonIsHubPath();

    // Round 13: تطبيق سياق الرابط (هجريّ/ميلاديّ) — badge + subtitle
    try { _applyMoonDateBadge(); } catch (_e) { /* silent */ }

    // إن كانت الصفحة هي /moon-today-in-{slug} → استخدم إحداثيّات المدينة لمطابقة الـ URL
    const _citySlug = _moonCitySlugFromPath();
    const _cityCoords = _citySlug && FAMOUS_MOON_CITIES[_citySlug];
    // Round 12: إحداثيّات من coord-suffix في الـ URL (للمدن خارج DB/FAMOUS).
    const _urlCoords = _moonCoordsFromPath();
    // Round 11 fallback: للمدن خارج FAMOUS_MOON_CITIES (مثل Tokyo من cities-jp.json)
    //   نقرأ البيانات التي حقنها SSR في <meta>:
    //   - <meta name="geo.position" content="lat;lng">
    //   - <meta name="moon.city.tz" content="Asia/Tokyo">
    //   وبهذا تُعرَض شروق/غروب القمر بتوقيت المدينة الصحيح وتظهر ملاحظة
    //   «جميع الأوقات بتوقيت {city} ({tz})» حتّى لو كانت المدينة غير شهيرة.
    let _metaLat = null, _metaLng = null, _metaTz = null;
    if (_citySlug && !_cityCoords) {
        try {
            const _geoMeta = document.querySelector('meta[name="geo.position"]');
            if (_geoMeta) {
                const _parts = String(_geoMeta.getAttribute('content') || '').split(';');
                const _pLat = parseFloat(_parts[0]);
                const _pLng = parseFloat(_parts[1]);
                if (isFinite(_pLat) && isFinite(_pLng)) {
                    _metaLat = _pLat; _metaLng = _pLng;
                }
            }
            const _tzMeta = document.querySelector('meta[name="moon.city.tz"]');
            if (_tzMeta) {
                const _tzVal = String(_tzMeta.getAttribute('content') || '').trim();
                if (_tzVal) _metaTz = _tzVal;
            }
        } catch (_e) { /* silent */ }
    }
    // أولويّة مصادر الإحداثيّات:
    //   1) FAMOUS_MOON_CITIES (قاموس العميل، مع tz دقيق)
    //   2) coord-suffix في الـ URL (Round 12 — أعلى من meta لأنّها جاءت من المستخدم)
    //   3) SSR meta geo.position (Round 11 — للمدن في cities-*.json)
    //   4) currentLat/currentLng (موقع المستخدم الحاليّ)
    const _lat = _cityCoords ? _cityCoords.lat
               : (_urlCoords ? _urlCoords.lat
               : (_metaLat != null ? _metaLat : currentLat));
    const _lng = _cityCoords ? _cityCoords.lng
               : (_urlCoords ? _urlCoords.lng
               : (_metaLng != null ? _metaLng : currentLng));
    // tz للمدن المعروفة من القاموس (دقيقة + DST). للمدن من الـ SSR meta: IANA دقيق أيضًا.
    // للمستخدم الحاليّ (بلا slug): نترك tz=undefined → getMoonTimes تستعمل تقدير من lng
    // (Etc/GMT±N) وهو قريب من توقيت المتصفّح في معظم الحالات.
    const _tz = _cityCoords ? _cityCoords.tz : (_metaTz || undefined);

    const phase = MoonCalc.getPhaseName(today);
    const illumination = MoonCalc.getMoonIllumination(today);
    const age = MoonCalc.getMoonAge(today);
    const moonTimes = MoonCalc.getMoonTimes(today, _lat, _lng, _tz);
    const nextFull = MoonCalc.getNextFullMoon(today);
    const nextNew = MoonCalc.getNextNewMoon(today);

    const _iconEl = document.getElementById('moon-icon');
    if (_iconEl) _iconEl.textContent = phase.icon;
    const _phaseNameEl = document.getElementById('moon-phase-name');
    if (_phaseNameEl) {
        const _phaseLocalized = (phase.key && typeof t === 'function') ? t(phase.key) : phase.name;
        const _phaseValid = (_phaseLocalized && _phaseLocalized !== phase.key) ? _phaseLocalized : (phase.name || '');
        // أدرج الإيموجي كـ badge صغير قبل اسم الطور
        _phaseNameEl.textContent = `${phase.icon || ''} ${_phaseValid}`.trim();
    }

    // ── رسم SVG دقيق لشكل القمر من نسبة الإضاءة الفعليّة ──
    // دقيق لـ 100 درجة — يغطّي كلّ وضعيّة بين المحاق والبدر بسلاسة (ليس 8 أطوار فقط)
    try {
        const _litEl = document.getElementById('moon-svg-lit');
        if (_litEl) {
            const _phaseFrac = MoonCalc.getMoonPhase(today); // 0..1 (0=new, 0.5=full, 1=new)
            const _waxing = _phaseFrac < 0.5;
            const _illumNorm = Math.max(0, Math.min(1, illumination / 100));
            _litEl.setAttribute('d', _buildMoonPhasePath(_illumNorm, _waxing, 45));
        }
    } catch (_e) {
        try { console.warn('Moon SVG render failed:', _e && _e.message); } catch(_){}
    }

    const _illumLabel = (typeof t === 'function') ? t('moon.illumination_label') : 'الإضاءة';
    const _daysSfx = (typeof t === 'function') ? t('moon.days_suffix') : 'يوم';
    const _illumEl = document.getElementById('moon-illumination');
    if (_illumEl) _illumEl.textContent = `${_illumLabel}: ${illumination}%`;
    const _ageEl = document.getElementById('moon-age');
    if (_ageEl) _ageEl.textContent = age + ' ' + _daysSfx;
    const _illumPctEl = document.getElementById('moon-illumination-pct');
    if (_illumPctEl) _illumPctEl.textContent = illumination + '%';
    const _riseEl = document.getElementById('moon-rise');
    if (_riseEl) _riseEl.textContent = moonTimes.rise;
    const _setEl = document.getElementById('moon-set');
    if (_setEl) _setEl.textContent = moonTimes.set;

    // ── ملاحظة المنطقة الزمنيّة — تظهر فقط في صفحات المدن المحدّدة ────────
    // الهدف: إبلاغ المستخدم أنّ أوقات المطلع/المغيب/الجدول بتوقيت المدينة
    // المختارة، حتّى لو كان هو في منطقة زمنيّة مختلفة.
    const _tzNoteEl = document.getElementById('moon-timezone-note');
    if (_tzNoteEl) {
        if (_citySlug && _tz && typeof t === 'function') {
            const _cityNameForTz = _moonCityDisplayName(_citySlug);
            const _tzNote = t('moon.tz_note_template', {
                city: _cityNameForTz,
                tz: _tz
            });
            if (_tzNote && _tzNote !== 'moon.tz_note_template') {
                _tzNoteEl.textContent = _tzNote;
                _tzNoteEl.hidden = false;
            }
        } else {
            _tzNoteEl.hidden = true;
        }
    }

    if (nextFull) {
        const months = HijriDate.gregorianMonths;
        const _nfEl = document.getElementById('next-full-moon');
        if (_nfEl) _nfEl.textContent = `${nextFull.getDate()} ${months[nextFull.getMonth()]}`;
    }
    if (nextNew) {
        const months = HijriDate.gregorianMonths;
        const _nnEl = document.getElementById('next-new-moon');
        if (_nnEl) _nnEl.textContent = `${nextNew.getDate()} ${months[nextNew.getMonth()]}`;
    }

    // ── المسافة بين موقع المستخدم/المدينة والقمر (كم، topocentric) ─────────
    const _distEl = document.getElementById('moon-distance');
    if (_distEl && typeof MoonCalc.getMoonDistance === 'function') {
        const distKm = MoonCalc.getMoonDistance(today, _lat, _lng);
        const _lng_fmt = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        try {
            // نستخدم en-US دائمًا لعرض أرقام لاتينيّة (لا Arabic-Indic ٠١٢) حتّى في الواجهة العربيّة
            _distEl.textContent = distKm.toLocaleString('en-US', { maximumFractionDigits: 0 });
        } catch (_e) {
            _distEl.textContent = Math.round(distKm).toString();
        }
    }

    // ── H1 وموقع الصفحة (ديناميكيّ حسب المدينة من الـ URL) ─────────────
    const _lng_ = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const _h1El = document.getElementById('moon-page-h1');
    const _locEl = document.getElementById('moon-location-note');
    if (_citySlug) {
        const _cityName = _moonCityDisplayName(_citySlug);
        const _countryName = _moonCityCountryName(_citySlug, _lng_);
        // H1 — قالب غنيّ بالكلمات المفتاحيّة (طور/إضاءة/عمر) من i18n
        if (_h1El) {
            if (typeof t === 'function') {
                const tplH1 = t('moon.h1_city_template', { city: _cityName, country: _countryName });
                if (tplH1 && tplH1 !== 'moon.h1_city_template') {
                    _h1El.textContent = tplH1;
                }
            }
        }
        // H2 الأقسام الديناميكيّة (حالة القمر / توقّعات / FAQ الليلة) — تُستبدَل بأسماء المدينة
        const _setH2 = (id, key) => {
            const el = document.getElementById(id);
            if (!el || typeof t !== 'function') return;
            const v = t(key, { city: _cityName });
            if (v && v !== key) el.textContent = v;
        };
        _setH2('moon-title-h2', 'moon.title_city_template');
        _setH2('moon-forecast-h2', 'moon.forecast_title_city_template');
        _setH2('moon-faq-live-h2', 'moon.faq_live_title_city_template');
        // 🆕 Priority A: subtitle تحت H1 — نسخة city-specific
        _setH2('moon-subtitle', 'moon.subtitle_city_template');
        // ── Round 13 polish: على صفحة التاريخ المحدَّد نَستبدل «اليوم» بصياغة زمنيّة محايدة
        // حتّى لا تبدو الصفحة المؤرشفة/المستقبليّة كأنّها اليوم الحاليّ. نُعيد كتابة عناوين
        // الأقسام الثانويّة مباشرةً (بدل مفاتيح i18n التي تحوي «اليوم»).
        if (_isDatePage) {
            // نصّ تعريفيّ للمدينة لتوليد العنوان (لأنّ أسماء المدن الشهيرة مترجَمة فعلاً)
            const _kindForH2 = (function(){ try { return _moonDateKindFromPath(); } catch(_){ return null; } })();
            const _dateForH2 = _kindForH2 && _kindForH2.isHijri && _kindForH2.hYear
                ? _formatHijriLabelLang(_kindForH2.hYear, _kindForH2.hMonth, _kindForH2.hDay, _lng_)
                : '';
            const _H2TPL = {
                ar: {
                    title: 'تفاصيل حالة القمر في ' + _cityName,
                    cities: 'حالة القمر في مدن أخرى لنفس التاريخ',
                    faq: 'أسئلة شائعة عن حالة القمر في ' + _cityName + (_dateForH2 ? ' يوم ' + _dateForH2 : ''),
                    subtitle: 'تابع حالة القمر في ' + _cityName + ' بدقّة فلكيّة — الطور والإضاءة والعمر ومواعيد الشروق والغروب'
                },
                en: {
                    title: 'Moon details in ' + _cityName,
                    cities: 'Moon in other cities for the same date',
                    faq: 'FAQ about the Moon in ' + _cityName + (_dateForH2 ? ' on ' + _dateForH2 : ''),
                    subtitle: 'Track the Moon in ' + _cityName + ' with astronomical precision — phase, illumination, age, rise & set'
                },
                fr: {
                    title: 'Détails de la Lune à ' + _cityName,
                    cities: 'La Lune dans d\u2019autres villes pour la même date',
                    faq: 'FAQ sur la Lune à ' + _cityName + (_dateForH2 ? ' le ' + _dateForH2 : ''),
                    subtitle: 'Suivez la Lune à ' + _cityName + ' avec précision astronomique — phase, illumination, âge, lever et coucher'
                },
                tr: {
                    title: _cityName + ' için Ay ayrıntıları',
                    cities: 'Aynı tarih için diğer şehirlerde Ay',
                    faq: _cityName + ' için Ay hakkında SSS' + (_dateForH2 ? ' — ' + _dateForH2 : ''),
                    subtitle: _cityName + ' için Ay\'ı astronomik doğrulukla takip edin — evre, aydınlanma, yaş, doğuş ve batış'
                },
                ur: {
                    title: _cityName + ' میں چاند کی تفصیلات',
                    cities: 'اسی تاریخ کے لیے دیگر شہروں میں چاند',
                    faq: _cityName + ' میں چاند کے بارے میں عام سوالات' + (_dateForH2 ? ' ' + _dateForH2 + ' کو' : ''),
                    subtitle: _cityName + ' میں چاند کو فلکیاتی درستگی کے ساتھ دیکھیں — مرحلہ، روشنی، عمر، طلوع اور غروب'
                },
                de: {
                    title: 'Monddetails in ' + _cityName,
                    cities: 'Der Mond in anderen Städten am selben Datum',
                    faq: 'FAQ zum Mond in ' + _cityName + (_dateForH2 ? ' am ' + _dateForH2 : ''),
                    subtitle: 'Verfolgen Sie den Mond in ' + _cityName + ' mit astronomischer Präzision — Phase, Beleuchtung, Alter, Auf- und Untergang'
                },
                id: {
                    title: 'Detail Bulan di ' + _cityName,
                    cities: 'Bulan di kota lain untuk tanggal yang sama',
                    faq: 'FAQ Bulan di ' + _cityName + (_dateForH2 ? ' pada ' + _dateForH2 : ''),
                    subtitle: 'Pantau Bulan di ' + _cityName + ' dengan presisi astronomi — fase, iluminasi, usia, terbit dan terbenam'
                },
                es: {
                    title: 'Detalles de la Luna en ' + _cityName,
                    cities: 'La Luna en otras ciudades para la misma fecha',
                    faq: 'Preguntas frecuentes sobre la Luna en ' + _cityName + (_dateForH2 ? ' el ' + _dateForH2 : ''),
                    subtitle: 'Sigue la Luna en ' + _cityName + ' con precisión astronómica — fase, iluminación, edad, salida y puesta'
                },
                bn: {
                    title: _cityName + '-এ চাঁদের বিস্তারিত',
                    cities: 'একই তারিখে অন্যান্য শহরে চাঁদ',
                    faq: _cityName + '-এ চাঁদ সম্পর্কে সাধারণ প্রশ্ন' + (_dateForH2 ? ' (' + _dateForH2 + ')' : ''),
                    subtitle: _cityName + '-এ চাঁদকে জ্যোতির্বৈজ্ঞানিক নির্ভুলতার সাথে অনুসরণ করুন — দশা, আলোকসজ্জা, বয়স, উদয় ও অস্ত'
                },
                ms: {
                    title: 'Butiran Bulan di ' + _cityName,
                    cities: 'Bulan di bandar lain untuk tarikh yang sama',
                    faq: 'Soalan lazim tentang Bulan di ' + _cityName + (_dateForH2 ? ' pada ' + _dateForH2 : ''),
                    subtitle: 'Ikuti Bulan di ' + _cityName + ' dengan ketepatan astronomi — fasa, pencahayaan, usia, terbit dan terbenam'
                }
            };
            const _tpl = _H2TPL[_lng_] || _H2TPL.en;
            const _overH2 = (id, txt, keepIcon) => {
                const el = document.getElementById(id);
                if (!el || !txt) return;
                // نحفظ الإيموجي إن كان في بداية النصّ الأصليّ
                const _raw = el.textContent || '';
                const _emoMatch = _raw.match(/^\s*([\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*)/u);
                const _prefix = (keepIcon && _emoMatch) ? _emoMatch[1] : '';
                el.textContent = _prefix + txt;
            };
            _overH2('moon-title-h2', _tpl.title, true);
            _overH2('moon-faq-live-h2', _tpl.faq, true);
            _overH2('moon-faq-city-h2', _tpl.faq, true);
            _overH2('moon-subtitle', _tpl.subtitle, false);
            // H2 «القمر اليوم في مدن أخرى» — نبحث بالـ data-i18n
            try {
                const _otherCitiesH2 = document.querySelector('[data-i18n="moon.cities_title"]');
                if (_otherCitiesH2) {
                    const _emoMatch = (_otherCitiesH2.textContent || '').match(/^\s*([\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*)/u);
                    _otherCitiesH2.textContent = (_emoMatch ? _emoMatch[1] : '') + _tpl.cities;
                }
            } catch (_e) { /* silent */ }
            // Round 14 polish #3: عنوان قسم المناسبات الإسلاميّة — نحيِّد «العدّ التنازليّ» في الصفحات المؤرَّخة
            //   لأنّ الزائر على صفحة تاريخ محدَّد قد يتوقَّع عدّاً تنازليّاً من ذلك التاريخ (غير صحيح —
            //   نحن دائماً نحسب من الآن). نستبدلها بـ «مناسبات إسلاميّة قادمة» وهو وصف زمنيّ محايد.
            try {
                const _EVENTS_H2 = {
                    ar: 'مناسبات إسلاميّة قادمة',
                    en: 'Upcoming Islamic occasions',
                    fr: 'Occasions islamiques à venir',
                    tr: 'Yaklaşan İslami günler',
                    ur: 'آنے والے اسلامی مواقع',
                    de: 'Bevorstehende islamische Anlässe',
                    id: 'Acara Islam mendatang',
                    es: 'Próximas ocasiones islámicas',
                    bn: 'আসন্ন ইসলামিক উপলক্ষ',
                    ms: 'Acara Islam yang akan datang'
                };
                const _evH2 = document.getElementById('moon-events-h2');
                if (_evH2) {
                    const _raw = _evH2.textContent || '';
                    const _em = _raw.match(/^\s*([\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*)/u);
                    const _prefix = _em ? _em[1] : '⏳ ';
                    _evH2.textContent = _prefix + (_EVENTS_H2[_lng_] || _EVENTS_H2.en);
                    // نزيل data-i18n كي لا يُعاد استبداله عند تغيير اللغة لاحقاً في الـ SPA
                    _evH2.removeAttribute('data-i18n');
                }
            } catch (_e) { /* silent */ }
            // Round 14 polish #3b: عنوان «الأطوار القمريّة القادمة» يبقى كما هو (يحوي «القادمة» أصلاً
            //   وهي صياغة محايدة)، لكن نُبرز الكلمة «القادمة» في الـ subtitle بلغة المستخدم
            //   لتطمئن الزائر بأنّ هذه توقّعات مستقبليّة (من الآن، لا من تاريخ الصفحة).

            // ── Round 16a: روابط «مدن أخرى» على صفحة التاريخ تفتح نفس التاريخ في المدن الأخرى
            //   (بدل فتح صفحة اليوم في تلك المدن). يحافظ على اتّساق النيّة الزمنيّة:
            //   زائر يقرأ عن القمر يوم 2026-05-01 في مكّة ← يضغط «القاهرة» ← يتوقّع نفس اليوم
            //   في القاهرة، لا «اليوم الحاليّ» في القاهرة.
            //   نُحوّل href من "/moon-today-in-{slug}" إلى "/moon-in-{slug}/{YYYY-MM-DD}".
            //   نستخدم الصيغة الميلاديّة دائماً (canonical) حتّى لو كان الرابط الحاليّ هجريّاً —
            //   الـ server يقبل الشكلَين ويعيد canonical للميلاديّ تلقائيّاً.
            try {
                const _kindForLinks = _moonDateKindFromPath();
                if (_kindForLinks && _kindForLinks.gYear) {
                    const _padN = (n) => String(n).padStart(2, '0');
                    const _isoG = _kindForLinks.gYear + '-' + _padN(_kindForLinks.gMonth) + '-' + _padN(_kindForLinks.gDay);
                    const _gridLinks = document.querySelectorAll('.moon-cities-grid a[href^="/moon-today-in-"], .moon-cities-grid a[href*="/moon-today-in-"]');
                    _gridLinks.forEach(a => {
                        const _h = a.getAttribute('href') || '';
                        // ندعم بادئة اللغة: /moon-today-in-X أو /en/moon-today-in-X
                        const _newHref = _h.replace(/(^|\/)moon-today-in-([a-z0-9-]+)$/, '$1moon-in-$2/' + _isoG);
                        if (_newHref !== _h) a.setAttribute('href', _newHref);
                    });
                }
            } catch (_e) { /* silent */ }
        }
        // ── Round 16: Hub page — H1 بلا «اليوم» + subtitle عامّ للمدينة ──
        // الصفحة evergreen؛ تمثّل المدينة كـ entity، لا يوم معيّن. العنوان هنا
        // يجب ألّا يحوي «اليوم/Today/...»  ليعكس دوره الدلاليّ (hub/canonical للمدينة).
        if (_isHubPage) {
            const _HUB_H1 = {
                ar: `🌙 حالة القمر في ${_cityName}، ${_countryName} — الطور والإضاءة والتقويم`,
                en: `🌙 The Moon in ${_cityName}, ${_countryName} — Phase, Illumination & Calendar`,
                fr: `🌙 La Lune à ${_cityName}, ${_countryName} — Phase, illumination et calendrier`,
                tr: `🌙 ${_cityName}, ${_countryName}'da Ay — Evre, Aydınlanma ve Takvim`,
                ur: `🌙 ${_cityName}، ${_countryName} میں چاند — مرحلہ، روشنی اور تقویم`,
                de: `🌙 Der Mond in ${_cityName}, ${_countryName} — Phase, Beleuchtung und Kalender`,
                id: `🌙 Bulan di ${_cityName}, ${_countryName} — Fase, Iluminasi & Kalender`,
                es: `🌙 La Luna en ${_cityName}, ${_countryName} — Fase, iluminación y calendario`,
                bn: `🌙 ${_cityName}, ${_countryName}-এ চাঁদ — দশা, আলোকসজ্জা ও ক্যালেন্ডার`,
                ms: `🌙 Bulan di ${_cityName}, ${_countryName} — Fasa, Pencahayaan & Kalendar`
            };
            if (_h1El) _h1El.textContent = _HUB_H1[_lng_] || _HUB_H1.en;
            // H2 الأقسام — نستبدل بعناوين محايدة زمنيّاً (لا تحوي «اليوم»)
            const _HUB_H2 = {
                ar: {
                    title: `تفاصيل حالة القمر في ${_cityName}`,
                    faq: `أسئلة شائعة عن القمر في ${_cityName}`,
                    subtitle: `كلّ ما تحتاجه عن القمر في ${_cityName}: الطور الحاليّ، التقويم الهجريّ، ومواعيد البدر والمحاق القادمة`
                },
                en: {
                    title: `Moon details in ${_cityName}`,
                    faq: `FAQ about the Moon in ${_cityName}`,
                    subtitle: `Everything about the Moon in ${_cityName}: current phase, Hijri calendar, upcoming full moon and new moon dates`
                },
                fr: {
                    title: `Détails de la Lune à ${_cityName}`,
                    faq: `FAQ sur la Lune à ${_cityName}`,
                    subtitle: `Tout sur la Lune à ${_cityName} : phase actuelle, calendrier hégirien, prochaines pleines et nouvelles lunes`
                },
                tr: {
                    title: `${_cityName} için Ay ayrıntıları`,
                    faq: `${_cityName} için Ay hakkında SSS`,
                    subtitle: `${_cityName}'da Ay hakkında her şey: güncel evre, hicri takvim ve yaklaşan dolunay/yeni ay tarihleri`
                },
                ur: {
                    title: `${_cityName} میں چاند کی تفصیلات`,
                    faq: `${_cityName} میں چاند کے بارے میں عام سوالات`,
                    subtitle: `${_cityName} میں چاند کے بارے میں سب کچھ: موجودہ مرحلہ، ہجری تقویم، آنے والے بدر اور نئے چاند کی تاریخیں`
                },
                de: {
                    title: `Monddetails in ${_cityName}`,
                    faq: `FAQ zum Mond in ${_cityName}`,
                    subtitle: `Alles über den Mond in ${_cityName}: aktuelle Phase, Hidschri-Kalender, kommende Vollmond- und Neumonddaten`
                },
                id: {
                    title: `Detail Bulan di ${_cityName}`,
                    faq: `FAQ Bulan di ${_cityName}`,
                    subtitle: `Segala tentang Bulan di ${_cityName}: fase saat ini, kalender Hijriah, tanggal purnama dan bulan baru mendatang`
                },
                es: {
                    title: `Detalles de la Luna en ${_cityName}`,
                    faq: `Preguntas frecuentes sobre la Luna en ${_cityName}`,
                    subtitle: `Todo sobre la Luna en ${_cityName}: fase actual, calendario hijri, próximas lunas llenas y nuevas`
                },
                bn: {
                    title: `${_cityName}-এ চাঁদের বিস্তারিত`,
                    faq: `${_cityName}-এ চাঁদ সম্পর্কে সাধারণ প্রশ্ন`,
                    subtitle: `${_cityName}-এ চাঁদ সম্পর্কে সবকিছু: বর্তমান দশা, হিজরি ক্যালেন্ডার, আসন্ন পূর্ণিমা ও অমাবস্যার তারিখ`
                },
                ms: {
                    title: `Butiran Bulan di ${_cityName}`,
                    faq: `Soalan lazim tentang Bulan di ${_cityName}`,
                    subtitle: `Semua tentang Bulan di ${_cityName}: fasa semasa, kalendar Hijrah, tarikh bulan purnama dan anak bulan akan datang`
                }
            };
            const _hubTpl = _HUB_H2[_lng_] || _HUB_H2.en;
            const _overH2Hub = (id, txt, keepIcon) => {
                const el = document.getElementById(id);
                if (!el || !txt) return;
                const _raw = el.textContent || '';
                const _emoMatch = _raw.match(/^\s*([\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*)/u);
                const _prefix = (keepIcon && _emoMatch) ? _emoMatch[1] : '';
                el.textContent = _prefix + txt;
            };
            _overH2Hub('moon-title-h2', _hubTpl.title, true);
            _overH2Hub('moon-faq-live-h2', _hubTpl.faq, true);
            _overH2Hub('moon-faq-city-h2', _hubTpl.faq, true);
            _overH2Hub('moon-subtitle', _hubTpl.subtitle, false);
            // إخفاء شريط التنقّل بين الأيّام على صفحة hub (لا يوجد «prev/next date»)
            try {
                const _navElHub = document.getElementById('moon-date-nav');
                if (_navElHub) _navElHub.hidden = true;
            } catch (_e) { /* silent */ }
        }
        if (_locEl) {
            const _locTemplates = {
                ar: `الموقع: ${_cityName}`,
                en: `Location: ${_cityName}`,
                fr: `Emplacement : ${_cityName}`,
                tr: `Konum: ${_cityName}`,
                ur: `مقام: ${_cityName}`,
                de: `Standort: ${_cityName}`,
                id: `Lokasi: ${_cityName}`,
                es: `Ubicación: ${_cityName}`,
                bn: `অবস্থান: ${_cityName}`,
                ms: `Lokasi: ${_cityName}`
            };
            _locEl.textContent = _locTemplates[_lng_] || _locTemplates.en;
        }
    } else if (_h1El && typeof t === 'function') {
        // /moon-today عامّ — استخدم العنوان العامّ الجديد
        const tplGen = t('moon.h1_generic');
        if (tplGen && tplGen !== 'moon.h1_generic') _h1El.textContent = tplGen;
    }
    if (!_citySlug && _locEl && currentCity) {
        // /moon-today العامّ — استخدم المدينة الحاليّة المكتشفة
        const _locTemplates = {
            ar: `الموقع: ${currentCity}`,
            en: `Location: ${currentCity}`,
            fr: `Emplacement : ${currentCity}`,
            tr: `Konum: ${currentCity}`,
            ur: `مقام: ${currentCity}`,
            de: `Standort: ${currentCity}`,
            id: `Lokasi: ${currentCity}`,
            es: `Ubicación: ${currentCity}`,
            bn: `অবস্থান: ${currentCity}`,
            ms: `Lokasi: ${currentCity}`
        };
        _locEl.textContent = _locTemplates[_lng_] || _locTemplates.en;
    }

    // ── جداول أسماء الأيّام/الأشهر — تُستخدم في الجدول والـ FAQ ─────
    const _weekdayNames = {
        ar: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
        en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        fr: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
        tr: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
        ur: ['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ'],
        de: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
        id: ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],
        es: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
        bn: ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'],
        ms: ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu']
    };
    const _gregMonthNames = {
        ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
        en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
        fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
        tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
        ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
        de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
        id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
        es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
        bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
        ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']
    };
    const _wk = _weekdayNames[_lng_] || _weekdayNames.en;
    const _gm = _gregMonthNames[_lng_] || _gregMonthNames.en;

    // ── توقّعات الأربعة عشر يومًا القادمة ─────────────────────────────
    // ملاحظة مهمّة: `row.date` هو لحظة UTC تمثّل منتصف يوم *المدينة*. إن كان
    // المتصفّح في منطقة مختلفة (مثلًا مكّة يشاهد جاكرتا) فإنّ getDay()/getDate()
    // قد تُرجع يومًا مختلفًا. لذلك نستخرج الحقول عبر Intl بتوقيت المدينة.
    const _getDayPartsInTz = (d, tz) => {
        if (!tz) return { wd: d.getDay(), d: d.getDate(), m: d.getMonth(), y: d.getFullYear() };
        try {
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric'
            });
            const parts = {};
            fmt.formatToParts(d).forEach(p => { if (p.type !== 'literal') parts[p.type] = p.value; });
            const wdMap = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
            return {
                wd: (wdMap[parts.weekday] != null) ? wdMap[parts.weekday] : d.getDay(),
                d:  parseInt(parts.day, 10),
                m:  parseInt(parts.month, 10) - 1,
                y:  parseInt(parts.year, 10)
            };
        } catch (_e) {
            return { wd: d.getDay(), d: d.getDate(), m: d.getMonth(), y: d.getFullYear() };
        }
    };

    const _fcBody = document.getElementById('moon-forecast-body');
    const _getForecast = MoonCalc.getForecast || MoonCalc.get7DayForecast;
    if (_fcBody && typeof _getForecast === 'function') {
        const fc = MoonCalc.getForecast
            ? MoonCalc.getForecast(today, _lat, _lng, 14, _tz)
            : MoonCalc.get7DayForecast(today, _lat, _lng, _tz);

        // رابط اليوم → صفحة ذلك اليوم لنفس المدينة (فقط إن وُجد slug)
        const _lngFC = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const _langPrefixFC = (_lngFC === 'ar') ? '' : ('/' + _lngFC);
        const _escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const _pad2 = (n) => (n < 10 ? '0' + n : String(n));
        const _fcIso = (parts, fallbackDate) => {
            // parts من _getDayPartsInTz (y/m/d — m is zero-based). fallback للـ date إن لم يتوفّر.
            if (parts && parts.y != null && parts.m != null && parts.d != null) {
                return parts.y + '-' + _pad2(parts.m + 1) + '-' + _pad2(parts.d);
            }
            const _d = fallbackDate;
            return _d.getFullYear() + '-' + _pad2(_d.getMonth() + 1) + '-' + _pad2(_d.getDate());
        };

        // أسماء الأشهر الهجريّة باللغة الحاليّة (للعمود الجديد)
        const _hMonthsLang = (typeof hijriMonthsFor === 'function')
            ? hijriMonthsFor(_lng_)
            : (typeof HijriDate !== 'undefined' && HijriDate.hijriMonths ? HijriDate.hijriMonths : []);

        // Highlight the row matching the real current date (in city timezone) — regardless of
        // whether the user is on the generic /moon-today page or a specific /moon-in-{city}/{date} page.
        const _nowParts = _getDayPartsInTz(new Date(), _tz);

        let html = '';
        for (let i = 0; i < fc.length; i++) {
            const row = fc[i];
            const dp = _getDayPartsInTz(row.date, row.tz || _tz);
            const wd = _wk[dp.wd];
            const dd = dp.d;
            const mm = _gm[dp.m];
            const yy = dp.y;
            const _isTodayRow = (_nowParts && dp.y === _nowParts.y && dp.m === _nowParts.m && dp.d === _nowParts.d);
            const phaseLabel = (row.phase.key && typeof t === 'function') ? t(row.phase.key) : row.phase.name;

            // تاريخ هجريّ لهذا اليوم (وفق Umm al-Qura) — الرابط يفتح صفحة
            // moon-in-{city}/{HYYYY-HMM-HDD} (Round 15: صفحات التاريخ تحت /moon-in-).
            let hijriCell = '<td class="fc-hijri-cell">—</td>';
            try {
                if (typeof HijriDate !== 'undefined' && typeof HijriDate.toHijri === 'function') {
                    const hj = HijriDate.toHijri(dp.y, dp.m + 1, dp.d);
                    const hMonthName = _hMonthsLang[hj.month - 1] || String(hj.month);
                    const hijriText = hj.day + ' ' + hMonthName + ' ' + hj.year;
                    if (_citySlug) {
                        const _hIso = hj.year + '-' + _pad2(hj.month) + '-' + _pad2(hj.day);
                        const _hHref = _langPrefixFC + '/moon-in-' + _citySlug + '/' + _hIso;
                        hijriCell = `<td class="fc-hijri-cell"><a class="fc-hijri-link" href="${_escHtml(_hHref)}" aria-label="${_escHtml(hijriText)}"><span class="fc-hijri-icon" aria-hidden="true">🌙</span> ${_escHtml(hijriText)}</a></td>`;
                    } else {
                        hijriCell = `<td class="fc-hijri-cell"><span class="fc-hijri-icon" aria-hidden="true">🌙</span> ${_escHtml(hijriText)}</td>`;
                    }
                }
            } catch (_e) { /* keep placeholder */ }

            // بناء خليّة اليوم: إن كان لدينا slug → رابط، وإلا نصّ عاديّ
            // (Round 16b: أُزيل عمود «تفاصيل» — خليّة اليوم والخليّة الهجريّة تبقيان قابلتَين للنقر.)
            let dayCell, rowClasses = [];
            const _dayText = wd + ' ' + dd + ' ' + mm + ' ' + yy;
            if (_citySlug) {
                const _iso = _fcIso(dp, row.date);
                // Round 15: صفحة التاريخ المحدَّد تحت /moon-in- (لا /moon-today-in-).
                const _href = _langPrefixFC + '/moon-in-' + _citySlug + '/' + _iso;
                dayCell = `<td class="fc-day-cell"><a class="fc-day-link" href="${_escHtml(_href)}">${_escHtml(_dayText)}</a></td>`;
                rowClasses.push('fc-row-clickable');
            } else {
                dayCell = `<td>${_escHtml(_dayText)}</td>`;
            }
            if (_isTodayRow) rowClasses.push('fc-row-today');
            const rowClass = rowClasses.length ? ` class="${rowClasses.join(' ')}"` : '';
            const rowAria  = _isTodayRow ? ' aria-current="date"' : '';

            html += `<tr${rowClass}${rowAria}>`
                + dayCell
                + hijriCell
                + `<td><span class="fc-phase-icon" aria-hidden="true">${row.phase.icon}</span> ${_escHtml(phaseLabel)}</td>`
                + `<td>${row.illumination}%</td>`
                + `<td>${row.rise}</td>`
                + `<td>${row.set}</td>`
                + `</tr>`;
        }
        _fcBody.innerHTML = html;
    }

    // ── FAQ ديناميكيّ: يملأ dq1..dq8 بأرقام وتواريخ حقيقيّة للمدينة المختارة ─
    try {
        const _cityDisplay = _citySlug
            ? _moonCityDisplayName(_citySlug)
            : (currentCity || (_lng_ === 'ar' ? 'مدينتك' : 'your city'));

        const _fmtNum = (n, maxFD) => {
            try {
                // أرقام لاتينيّة دائمًا (حتّى في العربيّة) — تجنّب Arabic-Indic ٠١٢٣
                const _fmtLocale = (_lng_ === 'ar') ? 'en-US' : _lng_;
                return Number(n).toLocaleString(_fmtLocale, { maximumFractionDigits: maxFD != null ? maxFD : 2 });
            } catch (_e) { return String(n); }
        };

        // تاريخ ميلاديّ منسّق بلغة الواجهة
        const _fmtDate = (d) => {
            if (!d) return '--';
            const wd = _wk[d.getDay()];
            const dd = d.getDate();
            const mo = _gm[d.getMonth()];
            const yy = d.getFullYear();
            return `${wd} ${dd} ${mo} ${yy}`;
        };

        // تاريخ هجريّ للبدر/المحاق (يعرض بالعربيّة دائمًا — اسم الشهر الهجريّ)
        const _hijriStr = (d) => {
            if (!d || typeof HijriDate === 'undefined' || typeof HijriDate.toHijri !== 'function') return '';
            try {
                const h = HijriDate.toHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
                const monthName = (HijriDate.hijriMonths && HijriDate.hijriMonths[h.month - 1]) || String(h.month);
                return `${h.day} ${monthName} ${h.year}`;
            } catch (_e) { return ''; }
        };

        // عدد الأيّام بين تاريخين (تجاهل الوقت)
        const _daysBetween = (a, b) => {
            if (!a || !b) return 0;
            const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
            const d2 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
            return Math.round((d2 - d1) / 86400000);
        };

        const _phaseLabel = (phase.key && typeof t === 'function') ? t(phase.key) : phase.name;
        const _daysUntilFull = nextFull ? _daysBetween(today, nextFull) : '—';
        const _daysUntilNew  = nextNew  ? _daysBetween(today, nextNew)  : '—';
        const _distKm = (typeof MoonCalc.getMoonDistance === 'function') ? MoonCalc.getMoonDistance(today, _lat, _lng) : null;

        const _setAnswer = (id, key, params) => {
            const el = document.getElementById(id);
            if (!el) return;
            const tpl = (typeof t === 'function') ? t(key, params) : key;
            // فقط إن تمّ استبدال placeholder فعليًّا — وإلّا أبقِ النصّ الافتراضيّ
            if (tpl && tpl !== key) el.textContent = tpl;
        };

        // عنوان قسم FAQ خاصّ بالمدينة — استبدال {city}
        const _cityFaqH2 = document.getElementById('moon-faq-city-h2');
        if (_cityFaqH2 && typeof t === 'function') {
            const _h2Tpl = t('moon.faq_city_title', { city: _cityDisplay });
            if (_h2Tpl && _h2Tpl !== 'moon.faq_city_title') _cityFaqH2.textContent = _h2Tpl;
        }

        // أسئلة FAQ — استبدال «مدينتك» باسم المدينة الفعليّ
        _setAnswer('moon-dq1-q', 'moon.faq.tpl_dq1_q', { city: _cityDisplay });
        _setAnswer('moon-dq6-q', 'moon.faq.tpl_dq6_q', { city: _cityDisplay });
        _setAnswer('moon-dq7-q', 'moon.faq.tpl_dq7_q', { city: _cityDisplay });
        _setAnswer('moon-dq8-q', 'moon.faq.tpl_dq8_q', { city: _cityDisplay });

        _setAnswer('moon-dq1-a', 'moon.faq.tpl_dq1', {
            city: _cityDisplay,
            phaseIcon: phase.icon,
            phaseName: _phaseLabel,
            illum: _fmtNum(illumination, 2)
        });
        _setAnswer('moon-dq2-a', 'moon.faq.tpl_dq2', {
            date: _fmtDate(nextFull),
            hijri: _hijriStr(nextFull),
            days: _fmtNum(_daysUntilFull, 0)
        });
        _setAnswer('moon-dq3-a', 'moon.faq.tpl_dq3', {
            date: _fmtDate(nextNew),
            hijri: _hijriStr(nextNew),
            days: _fmtNum(_daysUntilNew, 0)
        });
        _setAnswer('moon-dq4-a', 'moon.faq.tpl_dq4', {
            date: _fmtDate(nextFull),
            days: _fmtNum(_daysUntilFull, 0)
        });
        _setAnswer('moon-dq5-a', 'moon.faq.tpl_dq5', {
            age: _fmtNum(age, 2)
        });
        _setAnswer('moon-dq6-a', 'moon.faq.tpl_dq6', {
            city: _cityDisplay,
            time: moonTimes.rise
        });
        _setAnswer('moon-dq7-a', 'moon.faq.tpl_dq7', {
            city: _cityDisplay,
            time: moonTimes.set
        });
        if (_distKm != null) {
            _setAnswer('moon-dq8-a', 'moon.faq.tpl_dq8', {
                city: _cityDisplay,
                distance: _fmtNum(Math.round(_distKm), 0)
            });
        }

        // ── LIVE DASHBOARD (HERO + Events + Quick Stats) — populates compact, scannable values
        const _setText = (id, value) => {
            const el = document.getElementById(id);
            if (el && value != null) el.textContent = value;
        };

        // مساعد للعدّ التنازليّ مع تعريب اللغة وأخذ الجمع/المثنّى/المفرد بالاعتبار
        const _countdownLabel = (n) => {
            if (n === 0) {
                const todayLbl = (typeof t === 'function') ? t('moon.live.today') : 'Today';
                return (todayLbl && todayLbl !== 'moon.live.today') ? todayLbl : 'Today';
            }
            if (n === 1) {
                const tmrwLbl = (typeof t === 'function') ? t('moon.live.tomorrow') : 'Tomorrow';
                return (tmrwLbl && tmrwLbl !== 'moon.live.tomorrow') ? tmrwLbl : 'Tomorrow';
            }
            const tpl = (typeof t === 'function') ? t('moon.live.in_n_days', { n: _fmtNum(n, 0) }) : null;
            if (tpl && tpl !== 'moon.live.in_n_days') return tpl;
            return 'in ' + n + ' days';
        };

        // 1) Top Summary line — chip سريع تحت H1 (يحلّ محلّ HERO المحذوف، يستخدم نفس البيانات)
        _setText('moon-summary-icon', phase.icon || '🌙');
        _setText('moon-summary-phase', _phaseLabel || phase.name || '');
        _setText('moon-summary-illum', _fmtNum(illumination, 2) + '%');
        _setText('moon-summary-age', _fmtNum(age, 1) + ' / 29.5');

        // BOND 7: Sticky Mini Bar — نفس البيانات لشريط ثابت يظهر عند التمرير
        _setText('moon-sticky-icon', phase.icon || '🌙');
        _setText('moon-sticky-phase', _phaseLabel || phase.name || '');
        _setText('moon-sticky-illum', '· ' + _fmtNum(illumination, 1) + '%');

        // 2) EVENTS — full moon + new moon cards (date + countdown + hijri + clickable link to that day)
        const _lngLD = (typeof getCurrentLang === 'function') ? getCurrentLang() : (_lng_ || 'ar');
        const _langPrefixLD = (_lngLD === 'ar') ? '' : ('/' + _lngLD);
        const _isoOf = (d) => {
            if (!d) return '';
            const _p = (n) => (n < 10 ? '0' + n : String(n));
            return d.getFullYear() + '-' + _p(d.getMonth() + 1) + '-' + _p(d.getDate());
        };
        const _eventHref = (d) => {
            if (!d || !_citySlug) return null;
            // Round 15: روابط أحداث القمر (بدر/محاق) لتاريخ محدَّد → /moon-in-.
            return _langPrefixLD + '/moon-in-' + _citySlug + '/' + _isoOf(d);
        };

        // 2) Quick Highlights box (BOND 6 + 8): البدر التالي + المحاق التالي + تقييم الرؤية بالنجوم
        if (nextFull) {
            _setText('moon-hl-full-date', _fmtDate(nextFull));
            _setText('moon-hl-full-countdown', _countdownLabel(_daysUntilFull));
        }
        if (nextNew) {
            _setText('moon-hl-new-date', _fmtDate(nextNew));
            _setText('moon-hl-new-countdown', _countdownLabel(_daysUntilNew));
        }

        // BOND 8: Visibility rating — يستند إلى نسبة الإضاءة بشكل أساسيّ.
        // 5★ ≥ 80%, 4★ 50-80%, 3★ 20-50%, 2★ 5-20%, 1★ < 5%
        const _illumPct = Number(illumination) || 0;
        let _stars, _visKey, _visFallback;
        if (_illumPct >= 80) { _stars = 5; _visKey = 'moon.hl.vis_excellent'; _visFallback = 'ممتازة'; }
        else if (_illumPct >= 50) { _stars = 4; _visKey = 'moon.hl.vis_very_good'; _visFallback = 'جيّدة جداً'; }
        else if (_illumPct >= 20) { _stars = 3; _visKey = 'moon.hl.vis_good'; _visFallback = 'جيّدة'; }
        else if (_illumPct >= 5)  { _stars = 2; _visKey = 'moon.hl.vis_fair'; _visFallback = 'متوسّطة'; }
        else { _stars = 1; _visKey = 'moon.hl.vis_poor'; _visFallback = 'ضعيفة'; }
        const _starsStr = '★'.repeat(_stars) + '☆'.repeat(5 - _stars);
        _setText('moon-hl-vis-stars', _starsStr);
        let _visLabel = _visFallback;
        try {
            const _visT = (typeof t === 'function') ? t(_visKey) : '';
            if (_visT && _visT !== _visKey) _visLabel = _visT;
        } catch(_) {}
        _setText('moon-hl-vis-label', _visLabel + ' (' + _fmtNum(_illumPct, 1) + '%)');

        // ═══ Wave A: التاريخ الهجريّ + عدّ تنازليّ للمناسبات الإسلاميّة ═══
        try {
            if (typeof HijriDate !== 'undefined' && HijriDate) {
                const _today = new Date();
                const _hToday = HijriDate.getToday(); // { day, month, year }
                const _lngA = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                const _tt = (k, p) => {
                    try {
                        const v = (typeof t === 'function') ? t(k, p) : null;
                        return (v && v !== k) ? v : null;
                    } catch(_) { return null; }
                };

                // (1) التاريخ الهجريّ — اسم اليوم + اليوم + الشهر + السنة
                const _dayName = _tt('wday.' + _today.getDay()) || '';
                const _hMonthName = _tt('hmonth.' + _hToday.month) || '';
                // فاصلة مناسبة لكلّ لغة (عربيّة/أردية = «، »، الباقي = «, »)
                const _comma = (_lngA === 'ar' || _lngA === 'ur') ? '، ' : ', ';
                // لاحقة السنة الهجريّة: «هـ» للعربيّة والأردية، «AH» للبقيّة
                const _ahSuffix = (_lngA === 'ar') ? ' هـ' : (_lngA === 'ur') ? ' ہجری' : ' AH';
                const _hijriText = (_dayName ? _dayName + _comma : '') +
                    _hToday.day + ' ' + _hMonthName + ' ' + _hToday.year + _ahSuffix;
                _setText('moon-hijri-date', _hijriText);

                // (2) التاريخ الميلاديّ — اليوم + اسم الشهر + السنة
                const _gMonthName = _tt('gmonth.' + (_today.getMonth() + 1)) || String(_today.getMonth() + 1);
                _setText('moon-hijri-greg', _today.getDate() + ' ' + _gMonthName + ' ' + _today.getFullYear());

                // (3) رابط اليوم في الشهر القمريّ
                try {
                    const _daysInMonth = (typeof HijriDate.getDaysInHijriMonth === 'function')
                        ? HijriDate.getDaysInHijriMonth(_hToday.year, _hToday.month)
                        : 29;
                    const _remaining = Math.max(0, _daysInMonth - _hToday.day);
                    const _lunarTxt = _tt('moon.hijri.lunar_day_template', {
                        day: _hToday.day,
                        month: _hMonthName,
                        remaining: _remaining
                    });
                    if (_lunarTxt) _setText('moon-hijri-lunar', _lunarTxt);
                } catch(_) {}

                // (4) حساب المناسبات الإسلاميّة الأربع
                // helper: هل hijri-date (y,m,d) في المستقبل أو اليوم؟
                const _toGreg = (hy, hm, hd) => {
                    try {
                        const g = HijriDate.toGregorian(hy, hm, hd); // { year, month, day }
                        return new Date(g.year, g.month - 1, g.day);
                    } catch(_) { return null; }
                };
                const _startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
                const _todayStart = _startOfDay(_today);
                const _daysBetween = (futureDate) => {
                    if (!futureDate) return null;
                    const _f = _startOfDay(futureDate);
                    return Math.round((_f - _todayStart) / 86400000);
                };

                // لكلّ حدث: نحسب التاريخ القادم — إن كان اليوم قد فات، ننتقل للسنة الهجريّة التالية.
                const _nextEventDate = (targetMonth, targetDay) => {
                    // اختبر السنة الحاليّة أوّلاً
                    let d = _toGreg(_hToday.year, targetMonth, targetDay);
                    if (d && d >= _todayStart) return d;
                    // إن فات، جرّب السنة التالية
                    d = _toGreg(_hToday.year + 1, targetMonth, targetDay);
                    return d;
                };

                // فرمتة تاريخ ميلاديّ مختصرة (DD MMM YYYY)
                const _fmtEventDate = (d) => {
                    if (!d) return '—';
                    const m = _tt('gmonth.' + (d.getMonth() + 1)) || String(d.getMonth() + 1);
                    return d.getDate() + ' ' + m + ' ' + d.getFullYear();
                };

                // وسم الأيام المتبقّية
                const _daysLabel = (n) => {
                    if (n === 0) return _tt('moon.events.today') || 'Today';
                    if (n === 1) return _tt('moon.events.tomorrow') || 'Tomorrow';
                    return _tt('moon.events.days_template', { n: n }) || (n + ' days');
                };

                // قائمة الأحداث: [id, hijriMonth, hijriDay]
                const _events = [
                    { id: 'ramadan', hm: 9,  hd: 1  }, // 1 رمضان
                    { id: 'fitr',    hm: 10, hd: 1  }, // 1 شوّال — عيد الفطر
                    { id: 'adha',    hm: 12, hd: 10 }, // 10 ذو الحجّة — عيد الأضحى
                    { id: 'newyear', hm: 1,  hd: 1  }  // 1 محرّم — رأس السنة
                ];

                // FIX: نحدّث كل العناصر (سواء بالـ ID الأصليّ أو بالكلاس) — يدعم
                //   نسخاً متعدّدة من moon-events-section في صفحات مختلفة (الرئيسيّة + المدينة).
                const _setAll = (selector, value) => {
                    document.querySelectorAll(selector).forEach(el => { el.textContent = value; });
                };
                _events.forEach(ev => {
                    const d = _nextEventDate(ev.hm, ev.hd);
                    const days = _daysBetween(d);
                    const _daysVal = (days != null) ? _daysLabel(days) : '—';
                    const _dateVal = _fmtEventDate(d);
                    // updates ALL instances by ID OR class (for multi-page support)
                    _setAll('#moon-event-' + ev.id + '-days, .moon-event-' + ev.id + '-days', _daysVal);
                    _setAll('#moon-event-' + ev.id + '-date, .moon-event-' + ev.id + '-date', _dateVal);
                    // تمييز إن كان قريباً (≤ 5 أيّام) — لكل البطاقات
                    try {
                        document.querySelectorAll('#moon-event-' + ev.id + ', .moon-event-' + ev.id + '-card').forEach(_card => {
                            if (days != null && days >= 0 && days <= 5) {
                                _card.classList.add('moon-event-soon');
                            } else {
                                _card.classList.remove('moon-event-soon');
                            }
                        });
                    } catch(_) {}
                });
            }
        } catch (_hijriErr) {
            if (window.console && console.warn) console.warn('Hijri/events fill failed:', _hijriErr);
        }
    } catch (_err) {
        // فشل هادئ — تبقى الإجابات الافتراضيّة ظاهرة
        if (window.console && console.warn) console.warn('Dynamic moon FAQ fill failed:', _err);
    }

    // ── Round 10: الكوكبة + الفقرة التعريفيّة + المقارنة مع الأمس + نظرة على الطور ─
    try {
        // استخدم getDisplayCity() بدل currentCity الخام — فالأخير عربيّ دائماً من reverseGeocode
        //   بينما getDisplayCity يُرجع الاسم المناسب للغة الواجهة (tr→Türkçe، es→Español، إلخ).
        const _rawDisplayCity = (typeof getDisplayCity === 'function') ? getDisplayCity() : currentCity;
        const _cityDisplay2 = _citySlug
            ? _moonCityDisplayName(_citySlug)
            : (_rawDisplayCity || currentCity || (_lng_ === 'ar' ? 'مدينتك' : 'your city'));
        const _countryDisplay = _citySlug ? _moonCityCountryName(_citySlug, _lng_) : '';
        const _phaseLabel2 = (phase.key && typeof t === 'function') ? t(phase.key) : phase.name;
        const _fmtNum2 = (n, maxFD) => {
            try {
                // أرقام لاتينيّة دائمًا (حتّى في العربيّة) — تجنّب Arabic-Indic ٠١٢٣
                const _fmtLocale = (_lng_ === 'ar') ? 'en-US' : _lng_;
                return Number(n).toLocaleString(_fmtLocale, { maximumFractionDigits: maxFD != null ? maxFD : 2 });
            } catch (_e) { return String(n); }
        };

        // الكوكبة (zodiac)
        let zodiac = null;
        if (typeof MoonCalc.getMoonZodiac === 'function') {
            try { zodiac = MoonCalc.getMoonZodiac(today); } catch (_e) {}
        }
        const _zodiacEl = document.getElementById('moon-zodiac');
        if (_zodiacEl && zodiac) {
            const zName = (typeof t === 'function') ? t(zodiac.i18nKey) : zodiac.key;
            const zNameDisplay = (zName && zName !== zodiac.i18nKey) ? zName : zodiac.key;
            _zodiacEl.textContent = `${zodiac.icon} ${zNameDisplay}`;
        }

        // فقرة تعريفيّة ديناميكيّة — نستخدم «المدينة، البلد» مطابقةً للـ SSR
        // Round 11: أضفنا جملة الارتفاع/السَّمت لجعل الفقرة فعلاً معتمدة على الموقع
        //   (قبل ذلك كانت جميع القيم عالميّة، والعبارة "بناءً على إحداثيّات موقعك" مُضلِّلة).
        const _introEl = document.getElementById('moon-intro');
        if (_introEl && typeof t === 'function' && zodiac) {
            const zName = t(zodiac.i18nKey);
            const zNameDisplay = (zName && zName !== zodiac.i18nKey) ? zName : zodiac.key;
            const _cityLabelForIntro = _citySlug
                ? _moonCityLabel(_citySlug, _lng_, _cityDisplay2)
                : _cityDisplay2;

            // ─ بناء جملة الارتفاع/السَّمت (معتمدة على lat/lng) ─
            let _altitudeSentence = '';
            try {
                if (typeof _lat === 'number' && typeof _lng === 'number'
                    && typeof MoonCalc.getMoonAltitude === 'function') {
                    const _alt = MoonCalc.getMoonAltitude(today, _lat, _lng);
                    if (_alt !== null && isFinite(_alt)) {
                        const _altFmt = _fmtNum2(Math.abs(_alt), 1);
                        if (_alt > 0) {
                            // القمر فوق الأفق: نذكر الاتجاه (N/NE/E/SE/S/SW/W/NW)
                            const _az = MoonCalc.getMoonAzimuth(today, _lat, _lng);
                            const _dirKeys = ['n','ne','e','se','s','sw','w','nw'];
                            // نُقسّم الدائرة إلى 8 قطاعات 45° مركزها الاتّجاهات الرئيسيّة
                            const _dirIdx = Math.round(((_az || 0) % 360) / 45) % 8;
                            const _dirKey = 'moon.compass.' + _dirKeys[_dirIdx];
                            let _dirName = t(_dirKey);
                            if (!_dirName || _dirName === _dirKey) {
                                // fallback إنجليزيّ
                                const _dirEn = ['N','NE','E','SE','S','SW','W','NW'];
                                _dirName = _dirEn[_dirIdx];
                            }
                            const _aboveTpl = t('moon.altitude_above', { alt: _altFmt, dir: _dirName });
                            if (_aboveTpl && _aboveTpl !== 'moon.altitude_above') {
                                _altitudeSentence = _aboveTpl;
                            }
                        } else {
                            // القمر تحت الأفق
                            const _belowTpl = t('moon.altitude_below', { alt: _altFmt });
                            if (_belowTpl && _belowTpl !== 'moon.altitude_below') {
                                _altitudeSentence = _belowTpl;
                            }
                        }
                    }
                }
            } catch (_e) { /* silent — الجملة اختياريّة */ }

            const tpl = t('moon.intro_template', {
                city: _cityLabelForIntro,
                country: _countryDisplay,
                phaseIcon: phase.icon,
                phaseName: _phaseLabel2,
                illum: _fmtNum2(illumination, 2),
                age: _fmtNum2(age, 2),
                zodiacIcon: zodiac.icon,
                zodiacName: zNameDisplay,
                altitudeSentence: _altitudeSentence
            });
            if (tpl && tpl !== 'moon.intro_template') _introEl.textContent = tpl;
        }

        // مقارنة الأمس vs اليوم — بطاقة تفاعليّة غنيّة
        // البنية: كلّ قسم في try/catch منفصل حتّى لا يمنع فشل أحدها ظهور البقيّة
        const _cmpWrap = document.getElementById('moon-comparison');
        if (_cmpWrap && typeof t === 'function') {
            let _yesterday = null, yIllum = 0, diffRaw = 0, diffAbs = 0, isWaxing = true, yPhaseIcon = '🌑';
            let nextPhaseIcon = '', nextPhaseName = '', nextEventDate = null;
            let progressPct = 0, daysToNext = null;

            // 1) حساب أمس/اليوم/الاتّجاه
            try {
                _yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12, 0, 0);
                yIllum = MoonCalc.getMoonIllumination(_yesterday);
                diffRaw = illumination - yIllum;
                diffAbs = Math.abs(diffRaw);
                isWaxing = diffRaw >= 0;
                try {
                    const yPhase = (typeof MoonCalc.getPhaseName === 'function') ? MoonCalc.getPhaseName(_yesterday) : null;
                    if (yPhase && yPhase.icon) yPhaseIcon = yPhase.icon;
                } catch (_eP) { /* silent */ }
            } catch (_e1) { if (window.console && console.warn) console.warn('mc step1 (yesterday) failed:', _e1); }

            // 2) الطور القادم
            try {
                if (typeof MoonCalc.findPhaseEventsInRange === 'function') {
                    const events = MoonCalc.findPhaseEventsInRange(today, new Date(today.getTime() + 14 * 86400000));
                    if (events && events.length) {
                        const ev = events[0];
                        nextPhaseIcon = (ev.phase && ev.phase.icon) || '';
                        nextEventDate = ev.date || ev.time || null;
                        const evKey = ev.phase && ev.phase.key;
                        const evName = (evKey && typeof t === 'function') ? t(evKey) : ((ev.phase && ev.phase.name) || '');
                        nextPhaseName = evName;
                    }
                }
                if (!nextPhaseName && MoonCalc.getNextFullMoon && MoonCalc.getNextNewMoon) {
                    const nf = MoonCalc.getNextFullMoon(today);
                    const nn = MoonCalc.getNextNewMoon(today);
                    let picked, pickedKey, pickedIcon;
                    if (nf && nn) {
                        if (nf - today < nn - today) { picked = nf; pickedKey = 'moon.phase_full'; pickedIcon = '🌕'; }
                        else { picked = nn; pickedKey = 'moon.phase_new'; pickedIcon = '🌑'; }
                    } else if (nf) { picked = nf; pickedKey = 'moon.phase_full'; pickedIcon = '🌕'; }
                    else if (nn) { picked = nn; pickedKey = 'moon.phase_new'; pickedIcon = '🌑'; }
                    if (picked && typeof t === 'function') {
                        const pn = t(pickedKey);
                        nextPhaseName = (pn && pn !== pickedKey) ? pn : '';
                        nextPhaseIcon = pickedIcon;
                        nextEventDate = picked;
                    }
                }
            } catch (_e2) { if (window.console && console.warn) console.warn('mc step2 (next phase) failed:', _e2); }

            // 3) حساب progress
            try {
                if (nextEventDate) {
                    const _msPerDay = 86400000;
                    const _ned = (nextEventDate instanceof Date) ? nextEventDate.getTime() : Number(nextEventDate);
                    const _tod = today.getTime();
                    daysToNext = Math.max(0, Math.round((_ned - _tod) / _msPerDay));
                    let prevEventDate = null;
                    if (typeof MoonCalc.findPhaseEventsInRange === 'function') {
                        const pEvents = MoonCalc.findPhaseEventsInRange(new Date(_tod - 14 * _msPerDay), today);
                        if (pEvents && pEvents.length) {
                            const pev = pEvents[pEvents.length - 1];
                            prevEventDate = pev.date || pev.time || null;
                        }
                    }
                    if (prevEventDate) {
                        const _ped = (prevEventDate instanceof Date) ? prevEventDate.getTime() : Number(prevEventDate);
                        if (_ned > _ped) {
                            const total = _ned - _ped;
                            const elapsed = _tod - _ped;
                            progressPct = Math.max(0, Math.min(100, (elapsed / total) * 100));
                        }
                    }
                    if (!progressPct && daysToNext != null) {
                        // fallback: 7 days cycle
                        progressPct = Math.max(0, Math.min(100, ((7 - daysToNext) / 7) * 100));
                    }
                    if (!isFinite(progressPct)) progressPct = 0;
                }
            } catch (_e3) { if (window.console && console.warn) console.warn('mc step3 (progress calc) failed:', _e3); }

            // 4) ملء DOM — العنوان وعلامة الاتّجاه
            try {
                _cmpWrap.setAttribute('data-direction', isWaxing ? 'waxing' : 'waning');
                const _mcBadge = document.getElementById('mc-direction-badge');
                if (_mcBadge) {
                    const badgeKey = isWaxing ? 'moon.mc_waxing' : 'moon.mc_waning';
                    const badgeText = t(badgeKey);
                    if (badgeText && badgeText !== badgeKey) _mcBadge.textContent = badgeText;
                }
            } catch (_e4) { if (window.console && console.warn) console.warn('mc step4 (badge) failed:', _e4); }

            // 5) الأمس واليوم
            try {
                const _yIcon = document.getElementById('mc-yesterday-icon');
                const _yIllumEl = document.getElementById('mc-yesterday-illum');
                const _tIcon = document.getElementById('mc-today-icon');
                const _tIllumEl = document.getElementById('mc-today-illum');
                if (_yIcon) _yIcon.textContent = yPhaseIcon;
                if (_yIllumEl) _yIllumEl.textContent = _fmtNum2(yIllum, 1) + '%';
                if (_tIcon) _tIcon.textContent = phase.icon || '🌙';
                if (_tIllumEl) _tIllumEl.textContent = _fmtNum2(illumination, 1) + '%';
            } catch (_e5) { if (window.console && console.warn) console.warn('mc step5 (y/t fill) failed:', _e5); }

            // 6) الدلتا
            try {
                const _dArrow = document.getElementById('mc-delta-arrow');
                const _dValue = document.getElementById('mc-delta-value');
                if (_dArrow) _dArrow.textContent = isWaxing ? '↑' : '↓';
                if (_dValue) _dValue.textContent = (isWaxing ? '+' : '−') + _fmtNum2(diffAbs, 1) + '%';
            } catch (_e6) { if (window.console && console.warn) console.warn('mc step6 (delta) failed:', _e6); }

            // 7) Progress bar (نصّ + سهم + حالة)
            try {
                const _pCur = document.getElementById('mc-progress-current');
                const _pNext = document.getElementById('mc-progress-next');
                const _pFill = document.getElementById('mc-progress-fill');
                const _pDot = document.getElementById('mc-progress-dot');
                const _pStatus = document.getElementById('mc-progress-status');
                const _safeProgress = (typeof progressPct === 'number' && isFinite(progressPct)) ? progressPct : 0;
                if (_pCur) _pCur.textContent = (phase.icon || '') + ' ' + (_phaseLabel2 || phase.name || '');
                if (_pNext && nextPhaseName) _pNext.textContent = (nextPhaseIcon || '') + ' ' + nextPhaseName;
                if (_pFill) _pFill.style.width = _safeProgress.toFixed(1) + '%';
                if (_pDot) _pDot.style.insetInlineStart = _safeProgress.toFixed(1) + '%';
                if (_pStatus && nextPhaseName) {
                    let statusKey = 'moon.mc_status_days';
                    const statusParams = { nextPhaseIcon: nextPhaseIcon, nextPhaseName: nextPhaseName };
                    if (daysToNext != null) {
                        if (daysToNext === 0) statusKey = 'moon.mc_status_today';
                        else if (daysToNext === 1) statusKey = 'moon.mc_status_tomorrow';
                        else statusParams.days = _fmtNum2(daysToNext, 0);
                    }
                    const sTpl = t(statusKey, statusParams);
                    if (sTpl && sTpl !== statusKey) _pStatus.textContent = sTpl;
                }
            } catch (_e7) { if (window.console && console.warn) console.warn('mc step7 (progress DOM) failed:', _e7); }

            // 7b) 🆕 Priority A: إبراز الطور الحاليّ على شريط دورة الأطوار (5 slots)
            //      التعيين: 8 أطوار فلكيّة → 5 خانات في الشريط
            //        moon.phase_new                 → "new"
            //        moon.phase_waxing/waning_crescent  → "crescent"
            //        moon.phase_first/last_quarter      → "quarter"
            //        moon.phase_waxing/waning_gibbous   → "gibbous"
            //        moon.phase_full                → "full"
            try {
                const _phaseToCycle = {
                    'moon.phase_new': 'new',
                    'moon.phase_waxing_crescent': 'crescent',
                    'moon.phase_waning_crescent': 'crescent',
                    'moon.phase_first_quarter': 'quarter',
                    'moon.phase_last_quarter': 'quarter',
                    'moon.phase_waxing_gibbous': 'gibbous',
                    'moon.phase_waning_gibbous': 'gibbous',
                    'moon.phase_full': 'full'
                };
                const _currentCycle = _phaseToCycle[phase && phase.key] || null;
                const _cycleOrder = isWaxing
                    ? ['new', 'crescent', 'quarter', 'gibbous', 'full']
                    : ['full', 'gibbous', 'quarter', 'crescent', 'new'];
                const _currentIdx = _currentCycle ? _cycleOrder.indexOf(_currentCycle) : -1;
                const _cycleSteps = document.querySelectorAll('#mc-phase-cycle .mc-cycle-step');
                _cycleSteps.forEach((step) => {
                    const slot = step.getAttribute('data-phase');
                    step.classList.remove('is-active', 'is-past');
                    if (!_currentCycle) return;
                    if (slot === _currentCycle) {
                        step.classList.add('is-active');
                    } else {
                        const slotIdx = _cycleOrder.indexOf(slot);
                        if (_currentIdx >= 0 && slotIdx >= 0 && slotIdx < _currentIdx) {
                            step.classList.add('is-past');
                        }
                    }
                });
            } catch (_e7b) { if (window.console && console.warn) console.warn('mc step7b (phase cycle) failed:', _e7b); }

            // 8) إظهار البطاقة دائمًا — حتّى لو فشل قسم واحد، تظهر الباقي
            _cmpWrap.hidden = false;
        }

        // نظرة على الطور الحاليّ — 3 أسطر
        if (phase.key && typeof t === 'function') {
            // phase.key شكله 'moon.phase_waxing_crescent' → نستخرج 'waxing_crescent'
            const m = String(phase.key).match(/moon\.phase_(.+)$/);
            const phaseSlug = m ? m[1] : null;
            if (phaseSlug) {
                const _setInsight = (elId, key) => {
                    const el = document.getElementById(elId);
                    if (!el) return;
                    const v = t(key);
                    if (v && v !== key) el.textContent = v;
                };
                _setInsight('moon-insight-visual', 'moon.insight.' + phaseSlug + '.visual');
                _setInsight('moon-insight-visibility', 'moon.insight.' + phaseSlug + '.visibility');
                _setInsight('moon-insight-about', 'moon.insight.' + phaseSlug + '.about');
            }
        }
    } catch (_err2) {
        if (window.console && console.warn) console.warn('Moon Round-10 fill failed:', _err2);
    }

    // ── 🆕 Priority C: الأطوار القمريّة القادمة (Timeline) ─────────────
    //     أربع أطوار تالية: كلّ واحد ببطاقة ببصمته ولحظته الدقيقة
    try {
        const _upTimelineEl = document.getElementById('moon-upcoming-timeline');
        if (_upTimelineEl && typeof MoonCalc !== 'undefined' && MoonCalc.findPhaseEventsInRange) {
            const _nowD = today;
            const _endD = new Date(_nowD.getTime() + 35 * 86400000);
            const _evs = MoonCalc.findPhaseEventsInRange(_nowD, _endD);
            const _next4 = _evs.filter(e => e.date.getTime() > _nowD.getTime()).slice(0, 4);

            // H2 بالعنوان الموقعيّ عند توفّر مدينة
            if (_citySlug) {
                const _h2 = document.getElementById('moon-upcoming-h2');
                if (_h2 && typeof t === 'function') {
                    const _cityName = _moonCityDisplayName(_citySlug);
                    const _v = t('moon.upcoming.title_city', { city: _cityName });
                    if (_v && _v !== 'moon.upcoming.title_city') _h2.textContent = _v;
                }
            }

            // تنسيقات ساعة (24h) وتاريخ (يوم شهر سنة)
            const _fmtUpTime = (d) => {
                const hh = String(d.getHours()).padStart(2, '0');
                const mm = String(d.getMinutes()).padStart(2, '0');
                return hh + ':' + mm;
            };
            const _fmtUpDate = (d) => {
                const wd = _wk[d.getDay()] || '';
                const dd = d.getDate();
                const mo = _gm[d.getMonth()] || '';
                const yy = d.getFullYear();
                return `${wd}، ${dd} ${mo} ${yy}`;
            };
            // عدّ تنازليّ مرن: اليوم/غدًا/بعد يومين/بعد N يوم
            const _fmtCountdown = (d) => {
                const msDiff = d.getTime() - _nowD.getTime();
                const days = Math.round(msDiff / 86400000);
                if (typeof t !== 'function') return '';
                if (days <= 0) return t('moon.upcoming.today');
                if (days === 1) return t('moon.upcoming.in_1_day');
                if (days === 2) return t('moon.upcoming.in_2_days');
                return t('moon.upcoming.in_days', { days: days });
            };

            // اسم الطور بلغة المستخدم — نعيد استخدام مفاتيح moon.phase_*
            const _phaseDisplayName = (phase) => {
                if (!phase || typeof t !== 'function') return (phase && phase.name) || '';
                const v = t(phase.key);
                if (v && v !== phase.key) return v;
                return phase.name || '';
            };

            // بنِ البطاقات
            _upTimelineEl.innerHTML = '';
            _next4.forEach((ev, idx) => {
                const card = document.createElement('div');
                card.className = 'moon-upcoming-card mu-phase-' + (ev.type || '');
                card.setAttribute('data-phase-type', ev.type || '');
                card.setAttribute('role', 'listitem');
                if (idx === 0) card.classList.add('is-next');

                const icon = document.createElement('span');
                icon.className = 'mu-icon';
                icon.setAttribute('aria-hidden', 'true');
                icon.textContent = (ev.phase && ev.phase.icon) || '🌙';

                const body = document.createElement('div');
                body.className = 'mu-body';

                const nameEl = document.createElement('div');
                nameEl.className = 'mu-phase-name';
                nameEl.textContent = _phaseDisplayName(ev.phase);

                const dateEl = document.createElement('div');
                dateEl.className = 'mu-date';
                dateEl.textContent = _fmtUpDate(ev.date);

                const timeEl = document.createElement('div');
                timeEl.className = 'mu-time';
                timeEl.textContent = _fmtUpTime(ev.date);

                const cdEl = document.createElement('div');
                cdEl.className = 'mu-countdown';
                cdEl.textContent = _fmtCountdown(ev.date);

                body.appendChild(nameEl);
                body.appendChild(dateEl);
                body.appendChild(timeEl);
                body.appendChild(cdEl);
                card.appendChild(icon);
                card.appendChild(body);
                _upTimelineEl.appendChild(card);
            });
        }
    } catch (_uerr) {
        if (window.console && console.warn) console.warn('Upcoming phases render failed:', _uerr);
    }

    // ── صفحة التاريخ (moon-date-page): شريط التنقّل + الرسم البيانيّ ──
    //   يُستدعى دائمًا؛ شريط التنقّل يظهر عبر CSS فقط على moon-date-page،
    //   أمّا الرسم فيُرسم على كلّ صفحات القمر (اليوم + تاريخ محدّد).
    try {
        const _chartContainer = document.getElementById('moon-chart-container');
        if (_chartContainer && typeof MoonChart !== 'undefined' && MoonChart.render) {
            const _langNow = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
            MoonChart.render(_chartContainer, {
                date: today,
                rangeDays: 7,
                lang: _langNow,
                citySlug: _citySlug || '',
                langPrefix: (_langNow === 'ar') ? '' : ('/' + _langNow)
            });
        }
    } catch (_cerr) {
        if (window.console && console.warn) console.warn('Moon chart render failed:', _cerr);
    }

    // شريط التنقّل بين الأيّام — يُملأ دائمًا (hidden على الصفحات غير date-page عبر CSS)
    // Round 16: لا نُعرِضه على صفحة hub (لا يوجد prev/next date في سياق hub).
    try {
        const _navEl = document.getElementById('moon-date-nav');
        if (_navEl && _citySlug && !_isHubPage) {
            const _prevDate = new Date(today); _prevDate.setDate(_prevDate.getDate() - 1);
            const _nextDate = new Date(today); _nextDate.setDate(_nextDate.getDate() + 1);

            const _prevEl = document.getElementById('moon-date-prev');
            const _nextEl = document.getElementById('moon-date-next');
            const _todayLinkEl = document.getElementById('moon-date-today');
            const _prevSubEl = document.getElementById('moon-date-prev-sub');
            const _nextSubEl = document.getElementById('moon-date-next-sub');

            if (_prevEl) _prevEl.href = _moonDatePagePath(_citySlug, _prevDate);
            if (_nextEl) _nextEl.href = _moonDatePagePath(_citySlug, _nextDate);
            if (_todayLinkEl) _todayLinkEl.href = _moonDatePagePath(_citySlug, null);

            // نصوص فرعيّة: "19 أبريل" / "21 أبريل" بلغة المستخدم
            const _fmtShort = (d) => {
                const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                let mon = '';
                try { if (typeof t === 'function') mon = t('gmonth.' + (d.getMonth() + 1)); } catch(_){}
                if (!mon || mon === 'gmonth.' + (d.getMonth() + 1)) {
                    mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
                }
                return d.getDate() + ' ' + mon;
            };
            if (_prevSubEl) _prevSubEl.textContent = _fmtShort(_prevDate);
            if (_nextSubEl) _nextSubEl.textContent = _fmtShort(_nextDate);

            // إظهار الشريط على كلّ صفحات المدينة القمريّة (today + date-pages)
            //   على صفحة اليوم: زرّ "اليوم" يصبح active بصريّاً عبر CSS class.
            _navEl.hidden = false;
            const _todayLinkEl2 = document.getElementById('moon-date-today');
            if (_todayLinkEl2) {
                if (!_isDatePage) {
                    _todayLinkEl2.classList.add('moon-date-today-active');
                    _todayLinkEl2.setAttribute('aria-current', 'page');
                } else {
                    _todayLinkEl2.classList.remove('moon-date-today-active');
                    _todayLinkEl2.removeAttribute('aria-current');
                }
            }
            // ── Round 14 polish: على صفحة التاريخ، الزرّ الأوسط يعرض التاريخ المعروض
            // حاليًّا (بدلاً من «اليوم» الذي يُربك المستخدم). الرابط يبقى إلى /moon-today-in-X
            // (صفحة اليوم الحقيقيّة) لكن النصّ المرئيّ يُطابق التاريخ المعروض الآن.
            //   - رابط هجريّ → نعرض التسمية الهجريّة (مثلاً «3 ذو القعدة 1447»).
            //   - رابط ميلاديّ → نعرض التسمية الميلاديّة المختصرة (مثلاً «20 أبريل 2026»).
            //   على صفحة اليوم الحقيقيّة: يبقى النصّ الافتراضيّ «اليوم» / «Today».
            if (_todayLinkEl2 && _isDatePage) {
                try {
                    const _labelEl = _todayLinkEl2.querySelector('.moon-date-label');
                    if (_labelEl) {
                        const _lngNav = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                        const _kindNav = (function(){ try { return _moonDateKindFromPath(); } catch(_){ return null; } })();
                        let _midText = '';
                        if (_kindNav && _kindNav.isHijri && _kindNav.hYear) {
                            // تسمية هجريّة كاملة
                            try { _midText = _formatHijriLabelLang(_kindNav.hYear, _kindNav.hMonth, _kindNav.hDay, _lngNav); } catch(_){}
                        }
                        if (!_midText) {
                            // تسمية ميلاديّة: "20 أبريل 2026" / "Apr 20, 2026"
                            let _gm = '';
                            try { if (typeof t === 'function') _gm = t('gmonth.' + (today.getMonth() + 1)); } catch(_){}
                            if (!_gm || _gm === 'gmonth.' + (today.getMonth() + 1)) {
                                _gm = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][today.getMonth()];
                            }
                            // ترتيب: لغات RTL وعربيّة → يوم شهر سنة؛ EN → مختصر "Apr 20, 2026"
                            if (_lngNav === 'en') {
                                _midText = _gm + ' ' + today.getDate() + ', ' + today.getFullYear();
                            } else {
                                _midText = today.getDate() + ' ' + _gm + ' ' + today.getFullYear();
                            }
                        }
                        _labelEl.textContent = _midText;
                        // نزيل data-i18n حتّى لا يُعاد استبداله بـ «اليوم» عند تغيير اللغة
                        _labelEl.removeAttribute('data-i18n');
                        // aria-label وصفيّ للـ screen readers
                        _todayLinkEl2.setAttribute('aria-label', _midText);
                        _todayLinkEl2.setAttribute('title', _midText);
                    }
                    // الأيقونة: على صفحة التاريخ نُغيّر 🏠 إلى 📅 (تاريخ) لأنّها ليست «العودة للرئيسيّة»
                    const _arrowEl = _todayLinkEl2.querySelector('.moon-date-arrow');
                    if (_arrowEl) _arrowEl.textContent = '📅';
                } catch (_mlerr) { /* silent */ }
            }
        }
    } catch (_nerr) {
        if (window.console && console.warn) console.warn('Moon date nav fill failed:', _nerr);
    }

    // ── إعادة كتابة H1 + intro لتتضمّن التاريخ على moon-date-page ──
    try {
        if (_isDatePage && _citySlug) {
            const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
            const _cityName = _moonCityDisplayName(_citySlug);
            let _gMon = '';
            try { _gMon = (typeof t === 'function') ? t('gmonth.' + (today.getMonth() + 1)) : ''; } catch(_) {}
            if (!_gMon || _gMon === 'gmonth.' + (today.getMonth() + 1)) {
                _gMon = ['January','February','March','April','May','June','July','August','September','October','November','December'][today.getMonth()];
            }
            let _wday = '';
            try { _wday = (typeof t === 'function') ? t('wday.' + today.getDay()) : ''; } catch(_) {}
            if (!_wday || _wday === 'wday.' + today.getDay()) {
                _wday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][today.getDay()];
            }
            const _gregLabel = _wday + ' ' + today.getDate() + ' ' + _gMon + ' ' + today.getFullYear();
            // Round 13: عند رابط هجريّ → الـ label الرئيسيّ هجريّ (الميلاديّ في الـ subtitle)
            let _dateLabel = _gregLabel;
            try {
                const _kind = _moonDateKindFromPath();
                if (_kind && _kind.isHijri && _kind.hYear) {
                    _dateLabel = _formatHijriLabelLang(_kind.hYear, _kind.hMonth, _kind.hDay, _lng);
                }
            } catch (_e) { /* silent */ }

            const _h1 = document.getElementById('moon-page-h1');
            if (_h1) {
                let _h1Tpl = '';
                try { _h1Tpl = (typeof t === 'function') ? t('moon.h1_date_template', { city: _cityName, date: _dateLabel }) : ''; } catch(_){}
                if (_h1Tpl && _h1Tpl !== 'moon.h1_date_template') {
                    _h1.textContent = _h1Tpl;
                    _h1.removeAttribute('data-i18n');
                }
            }

            // intro paragraph — تمكّن من الإبقاء على النصّ الديناميكيّ لو وُجد (يُملأ لاحقًا)
            const _introEl = document.getElementById('moon-intro');
            if (_introEl) {
                // zodiac للتاريخ المطلوب (قد يختلف عن اليوم الحاليّ)
                let _zodIcon = '', _zodName = '';
                try {
                    if (typeof MoonCalc !== 'undefined' && typeof MoonCalc.getMoonZodiac === 'function') {
                        const _z = MoonCalc.getMoonZodiac(today);
                        if (_z) {
                            _zodIcon = _z.icon || '';
                            let _zn = '';
                            try { _zn = (typeof t === 'function') ? t(_z.i18nKey) : ''; } catch(_){}
                            _zodName = (_zn && _zn !== _z.i18nKey) ? _zn : (_z.key || '');
                        }
                    }
                } catch(_){}

                // تنسيق رقميّ 2 خانات عشريّة حسب لغة الواجهة
                const _fmtNumDate = (n, maxFD) => {
                    try {
                        const _lng2 = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
                        const _loc = (_lng2 === 'ar') ? 'en-US' : _lng2;
                        return Number(n).toLocaleString(_loc, { maximumFractionDigits: maxFD != null ? maxFD : 2 });
                    } catch(_e) { return String(n); }
                };

                let _introTpl = '';
                try {
                    _introTpl = (typeof t === 'function') ? t('moon.intro_date_template', {
                        city: _cityName,
                        date: _dateLabel,
                        phaseIcon: (phase && phase.icon) || '',
                        phaseName: (phase && phase.key && typeof t === 'function') ? t(phase.key) : ((phase && phase.name) || ''),
                        illum: _fmtNumDate(illumination, 2),
                        age: _fmtNumDate(age, 2),
                        zodiacIcon: _zodIcon,
                        zodiacName: _zodName
                    }) : '';
                } catch(_){}
                if (_introTpl && _introTpl !== 'moon.intro_date_template') {
                    _introEl.textContent = _introTpl;
                    _introEl.removeAttribute('data-i18n');
                }
            }
        }
    } catch (_derr) {
        if (window.console && console.warn) console.warn('Moon date H1/intro override failed:', _derr);
    }

    // ── Breadcrumb: Home › [القمر اليوم | القمر اليوم في {City}] › {Date} ──
    //   - بلا city slug وبلا مدينة حاليّة → Home › (current) القمر اليوم
    //   - بلا city slug مع مدينة حاليّة → Home › (current) القمر اليوم في {CurrentCity}
    //   - مع city slug بلا تاريخ → Home › (current) القمر اليوم في {City}
    //   - مع city slug + تاريخ → Home › (link) القمر اليوم في {City} › (current) {Date}
    try {
        const _bcMoon       = document.getElementById('bc-moon');
        const _bcDateSep    = document.getElementById('bc-date-sep');
        const _bcDate       = document.getElementById('bc-date');

        // تطبيع: أخفِ عناصر التاريخ أوّلًا
        [_bcDateSep, _bcDate].forEach((el) => {
            if (el) el.hidden = true;
        });

        const _lngBC = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const _langPrefixBC = (_lngBC === 'ar') ? '' : ('/' + _lngBC);

        // قالب "القمر اليوم في {city}" أو "القمر في {city}" — يستخدم مفتاح i18n أو fallback يدويّ حسب اللغة.
        // skipToday=true → يحذف كلمة "اليوم" (للتواريخ غير تاريخ اليوم الحاليّ).
        const _buildMoonCityText = function(cityName, skipToday) {
            const _key = skipToday ? 'moon.bc_moon_in_city_nodate' : 'moon.bc_moon_in_city';
            let _tpl = '';
            try { _tpl = (typeof t === 'function') ? t(_key) : ''; } catch(_){}
            if (_tpl && _tpl !== _key && _tpl.indexOf('{city}') !== -1) {
                return _tpl.replace('{city}', cityName);
            }
            // Fallback بلغة الواجهة
            let _bcCurrent = '';
            if (skipToday) {
                _bcCurrent = (_lngBC === 'ar' || _lngBC === 'ur') ? 'القمر' :
                             (_lngBC === 'fr') ? 'La Lune' :
                             (_lngBC === 'de') ? 'Mond' :
                             (_lngBC === 'tr') ? 'Ay' :
                             (_lngBC === 'es') ? 'La Luna' :
                             (_lngBC === 'id' || _lngBC === 'ms') ? 'Bulan' :
                             (_lngBC === 'bn') ? 'চাঁদ' :
                             'Moon';
            } else {
                try { _bcCurrent = (typeof t === 'function') ? t('moon.bc_current') : ''; } catch(_){}
                if (!_bcCurrent || _bcCurrent === 'moon.bc_current') _bcCurrent = 'Moon Today';
            }
            const _sep = (_lngBC === 'ar' || _lngBC === 'ur') ? ' في ' :
                         (_lngBC === 'fr') ? ' à ' :
                         (_lngBC === 'de') ? ' in ' :
                         (_lngBC === 'tr') ? ' - ' :
                         (_lngBC === 'es') ? ' en ' :
                         (_lngBC === 'id' || _lngBC === 'ms') ? ' di ' :
                         (_lngBC === 'bn') ? ' - ' :
                         ' in ';
            return _bcCurrent + _sep + cityName;
        };

        // هل الـ URL date هو نفس تاريخ اليوم؟ (لتقرير حذف كلمة "اليوم" من breadcrumb)
        const _isUrlDateToday = function() {
            try {
                const _k = _moonDateKindFromPath();
                if (!_k) return true; // لا تاريخ في الـ URL → نعتبره اليوم
                const _n = new Date();
                return (_k.gYear === _n.getFullYear() && _k.gMonth === (_n.getMonth() + 1) && _k.gDay === _n.getDate());
            } catch (_) { return true; }
        };

        // مُساعِد: تحويل عنصر الـ breadcrumb إلى "current page" غير قابل للضغط
        // يزيل href ويضيف aria-current، ممّا يحوّله دلاليًّا وبصريًّا إلى نصّ جامد.
        // يضيف أيضاً .bc-current على عنصر الـ <li> الأب ليوائم ستايل bread-crumb-list.
        const _markAsCurrentPage = function(el) {
            if (!el) return;
            el.removeAttribute('href');
            el.setAttribute('aria-current', 'page');
            const _li = el.closest && el.closest('li.bc-item');
            if (_li) _li.classList.add('bc-current');
        };
        // مُساعِد: إعادة عنصر الـ breadcrumb إلى حالة "رابط قابل للضغط"
        // يزيل .bc-current من الـ <li> الأب ويزيل aria-current من الـ <a>.
        const _markAsLink = function(el) {
            if (!el) return;
            el.removeAttribute('aria-current');
            const _li = el.closest && el.closest('li.bc-item');
            if (_li) _li.classList.remove('bc-current');
        };

        if (_citySlug) {
            const _cityNameBC = _moonCityDisplayName(_citySlug) || _citySlug;
            // عند صفحة تاريخ مختلف عن اليوم → نحذف كلمة "اليوم"
            const _skipTodayBC = _isDatePage && !_isUrlDateToday();
            const _moonCityText = _buildMoonCityText(_cityNameBC, _skipTodayBC);

            if (_isDatePage) {
                // المستوى 2: "القمر [اليوم] في {City}" كرابط لـ /moon-today-in-{slug} (قابل للضغط)
                if (_bcMoon) {
                    _bcMoon.textContent = _moonCityText;
                    _bcMoon.removeAttribute('data-i18n');
                    _bcMoon.setAttribute('href', _langPrefixBC + '/moon-today-in-' + _citySlug);
                    _markAsLink(_bcMoon);
                }
                // المستوى 3: {Date} — current page (span أصلاً، غير قابل للضغط)
                //   Round 14 polish #4: إن كان URL هجريّاً نستخدم التسمية الهجريّة؛ وإلّا الميلاديّة.
                if (_bcDateSep) _bcDateSep.hidden = false;
                if (_bcDate) {
                    let _bcDateText = '';
                    try {
                        const _kindBC = _moonDateKindFromPath();
                        if (_kindBC && _kindBC.isHijri && _kindBC.hYear) {
                            _bcDateText = _formatHijriLabelLang(_kindBC.hYear, _kindBC.hMonth, _kindBC.hDay, _lngBC);
                        }
                    } catch (_e) { /* silent */ }
                    if (!_bcDateText) {
                        // Fallback: تاريخ ميلاديّ مختصر "25 أبريل 2026"
                        let _gmBC = '';
                        try { _gmBC = (typeof t === 'function') ? t('gmonth.' + (today.getMonth() + 1)) : ''; } catch(_){}
                        if (!_gmBC || _gmBC === 'gmonth.' + (today.getMonth() + 1)) {
                            _gmBC = ['January','February','March','April','May','June','July','August','September','October','November','December'][today.getMonth()];
                        }
                        _bcDateText = today.getDate() + ' ' + _gmBC + ' ' + today.getFullYear();
                    }
                    _bcDate.textContent = _bcDateText;
                    _bcDate.hidden = false;
                }
            } else {
                // المستوى 2 النهائيّ: "القمر اليوم في {City}" — current page (بلا href)
                if (_bcMoon) {
                    _bcMoon.textContent = _moonCityText;
                    _bcMoon.removeAttribute('data-i18n');
                    _markAsCurrentPage(_bcMoon);
                }
            }
        } else {
            // لا slug في الـ URL، لكن قد توجد مدينة محدّدة حاليًّا (جيولوكيشن أو اختيار)
            let _currentCityLabel = '';
            try {
                if (typeof getDisplayCity === 'function') {
                    _currentCityLabel = (getDisplayCity() || '').trim();
                } else if (typeof currentCity === 'string') {
                    _currentCityLabel = currentCity.trim();
                }
            } catch (_) {}
            // لا نعرض إحداثيّات خامّة كـ "21.42°, 39.83°" إن لم يُعرَف الاسم
            const _isRawCoords = /^-?\d+(?:\.\d+)?\s*°?\s*,\s*-?\d+(?:\.\d+)?\s*°?$/.test(_currentCityLabel);

            if (_currentCityLabel && !_isRawCoords) {
                // المستوى 2: "القمر اليوم في {CurrentCity}" — current page (بلا href)
                if (_bcMoon) {
                    _bcMoon.textContent = _buildMoonCityText(_currentCityLabel);
                    _bcMoon.removeAttribute('data-i18n');
                    _markAsCurrentPage(_bcMoon);
                }
            } else {
                // لا مدينة معروفة → "القمر اليوم" كـ current (بلا href)
                _markAsCurrentPage(_bcMoon);
            }
        }
    } catch (_bcerr) {
        if (window.console && console.warn) console.warn('Moon breadcrumb fill failed:', _bcerr);
    }
}

// ========= التاريخ الهجري اليوم =========
// ───────── i18n dictionary for the "Today's Hijri Date" page ─────────
const HT_I18N = {
    ar: {
        hSfx:' هـ',
        days:['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
        gM:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
        hM:['محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الثانية','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
        bcHome:'الرئيسية', bcCal:'التقويم الهجري',
        bcYear:y=>`${y} هـ`, bcMonth:(m,y)=>`${m} ${y} هـ`, bcDay:(d,m,y)=>`${d} ${m} ${y} هـ`,
        hero:(dn,d,m,y)=>`التاريخ الهجري اليوم: ${dn} ${d} ${m} ${y} هـ`,
        greg:(dn,g)=>`الموافق: ${dn} ${g} م – حسب تقويم أم القرى`,
        desc:c=>`يعرض التاريخ الهجري اليوم في ${c} بدقة حسب تقويم أم القرى، مع التاريخ الميلادي المقابل.`,
        descLink:'تحويل التاريخ بين الهجري والميلادي',
        infoLabels:['اليوم','التاريخ الهجري','التاريخ الميلادي','الشهر','السنة','سنة كبيسة'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} هـ`, infoGreg:g=>`${g} م`, infoYear:y=>`${y} هـ`,
        leapYes:'نعم (355 يوماً)', leapNo:'لا (354 يوماً)',
        ctaConv:'🔄 تحويل التاريخ',
        ctaMoon:'🌙 حالة القمر اليوم',
        ctaPrayer:'🕌 مواقيت الصلاة اليوم',
        ctaToday:(dn,d,m,y)=>`📅 ${dn} ${d} ${m} ${y} هـ`,
        ctaMonth:(m,y)=>`🌙 التقويم الهجري لشهر ${m} ${y}`,
        ctaYear:y=>`📆 التقويم الهجري ${y} هـ كامل`,
        faqTitle:'❓ أسئلة شائعة',
        faqQ1:'ما هو التاريخ الهجري اليوم؟',
        faqA1:(dn,d,m,y)=>`${dn} ${d} ${m} ${y} هـ`,
        faqQ2:'ماذا يوافق اليوم هجريًا بالميلادي؟',
        faqA2:g=>`${g} م`,
        faqQ3:y=>`هل سنة ${y} هـ كبيسة؟`,
        leapYesA:y=>`نعم، ${y} هـ سنة كبيسة وعدد أيامها 355 يوماً.`,
        leapNoA:y=>`لا، ${y} هـ سنة بسيطة وعدد أيامها 354 يوماً.`,
        otdTitle:'📖 أبرز أحداث هذا اليوم في التاريخ الهجري',
        otdSub:(dn,d,m,y)=>`في مثل هذا اليوم، ${dn} ${d} ${m} ${y} هـ، وقعت العديد من الأحداث المهمة في التاريخ الإسلامي.`,
        prev:'اليوم السابق', next:'اليوم التالي',
        miniTitle:'📅 التنقل السريع', thHijri:'التاريخ الهجري', thGreg:'التاريخ الميلادي',
        extraTitle:'🌙 روابط إضافية',
        extraMonth:m=>`🌙 التقويم الهجري لشهر ${m}`,
        extraYear:y=>`📆 التقويم الهجري ${y} هـ كامل`,
        extraConv:'🔄 تحويل التاريخ',
        extraMoon:'🌙 حالة القمر اليوم',
        extraTimeLeft:'⏳ كم باقي على الصلاة اليوم',
        footer:c=>`يعرض هذا القسم التاريخ الهجري اليوم بدقة حسب تقويم أم القرى في ${c}، مع التاريخ الميلادي المقابل. استخدم الروابط أعلاه للوصول السريع إلى التقويم الهجري الكامل وأداة تحويل التاريخ وحالة القمر اليوم.`,
    },
    en: {
        hSfx:' AH',
        days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        gM:['January','February','March','April','May','June','July','August','September','October','November','December'],
        hM:['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab','Shaban','Ramadan','Shawwal','Dhu al-Qidah','Dhu al-Hijjah'],
        bcHome:'Home', bcCal:'Hijri Calendar',
        bcYear:y=>`${y} AH`, bcMonth:(m,y)=>`${m} ${y} AH`, bcDay:(d,m,y)=>`${d} ${m} ${y} AH`,
        hero:(dn,d,m,y)=>`Today's Hijri Date: ${dn}, ${d} ${m} ${y} AH`,
        greg:(dn,g)=>`Corresponding to: ${dn} ${g} CE – Umm al-Qura Calendar`,
        desc:c=>`Displays today's Hijri date in ${c} accurately according to the Umm al-Qura calendar, alongside the corresponding Gregorian date.`,
        descLink:'convert dates between Hijri and Gregorian',
        infoLabels:['Day','Hijri Date','Gregorian Date','Month','Year','Leap Year'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} AH`, infoGreg:g=>`${g} CE`, infoYear:y=>`${y} AH`,
        leapYes:'Yes (355 days)', leapNo:'No (354 days)',
        ctaConv:'🔄 Date Converter',
        ctaMoon:'🌙 Moon Status Today',
        ctaPrayer:'🕌 Today\'s Prayer Times',
        ctaToday:(dn,d,m,y)=>`📅 ${dn} ${d} ${m} ${y} AH`,
        ctaMonth:(m,y)=>`🌙 ${m} ${y} AH Calendar`,
        ctaYear:y=>`📆 Full ${y} AH Calendar`,
        faqTitle:'❓ Frequently Asked Questions',
        faqQ1:"What is today's Hijri date?",
        faqA1:(dn,d,m,y)=>`${dn}, ${d} ${m} ${y} AH`,
        faqQ2:"What is today's Hijri date in Gregorian?",
        faqA2:g=>`${g} CE`,
        faqQ3:y=>`Is ${y} AH a leap year?`,
        leapYesA:y=>`Yes, ${y} AH is a leap year with 355 days.`,
        leapNoA:y=>`No, ${y} AH is a regular year with 354 days.`,
        otdTitle:'📖 Notable Events on This Day in Islamic History',
        otdSub:(dn,d,m,y)=>`On this day, ${dn} ${d} ${m} ${y} AH, many important events occurred in Islamic history.`,
        prev:'Previous Day', next:'Next Day',
        miniTitle:'📅 Quick Navigation', thHijri:'Hijri Date', thGreg:'Gregorian Date',
        extraTitle:'🌙 More Resources',
        extraMonth:m=>`🌙 ${m} Calendar`,
        extraYear:y=>`📆 ${y} AH Full Calendar`,
        extraConv:'🔄 Date Converter',
        extraMoon:'🌙 Moon Status Today',
        extraTimeLeft:'⏳ Time Left Until Next Prayer',
        footer:c=>`This page shows today's Hijri date accurately according to the Umm al-Qura calendar in ${c}, along with its Gregorian equivalent. Use the links above for quick access to the full Hijri calendar, the date converter, and today's moon status.`,
    },
    fr: {
        hSfx:' AH',
        days:['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
        gM:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
        hM:['Mouharram','Safar','Rabi al-Awwal','Rabi al-Thani','Joumada al-Awwal','Joumada al-Thani','Rajab','Chaabane','Ramadan','Chawwal','Dhou al-Qida','Dhou al-Hijja'],
        bcHome:'Accueil', bcCal:'Calendrier hégirien',
        bcYear:y=>`${y} AH`, bcMonth:(m,y)=>`${m} ${y} AH`, bcDay:(d,m,y)=>`${d} ${m} ${y} AH`,
        hero:(dn,d,m,y)=>`Date hégirienne d'aujourd'hui : ${dn}, ${d} ${m} ${y} AH`,
        greg:(dn,g)=>`Correspondant au : ${dn} ${g} – Calendrier Oumm al-Qura`,
        desc:c=>`Affiche la date hégirienne d'aujourd'hui à ${c} avec précision selon le calendrier Oumm al-Qura, ainsi que la date grégorienne correspondante.`,
        descLink:'convertir les dates entre hégirien et grégorien',
        infoLabels:['Jour','Date hégirienne','Date grégorienne','Mois','Année','Année bissextile'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} AH`, infoGreg:g=>`${g}`, infoYear:y=>`${y} AH`,
        leapYes:'Oui (355 jours)', leapNo:'Non (354 jours)',
        ctaConv:'🔄 Convertisseur de Date',
        ctaMoon:'🌙 État de la Lune aujourd\'hui',
        ctaPrayer:'🕌 Horaires de prière aujourd\'hui',
        ctaToday:(dn,d,m,y)=>`📅 ${dn} ${d} ${m} ${y} AH`,
        ctaMonth:(m,y)=>`🌙 Calendrier ${m} ${y} AH`,
        ctaYear:y=>`📆 Calendrier ${y} AH complet`,
        faqTitle:'❓ Foire aux questions',
        faqQ1:"Quelle est la date hégirienne d'aujourd'hui ?",
        faqA1:(dn,d,m,y)=>`${dn}, ${d} ${m} ${y} AH`,
        faqQ2:"À quelle date grégorienne correspond aujourd'hui ?",
        faqA2:g=>`${g}`,
        faqQ3:y=>`L'an ${y} AH est-il bissextile ?`,
        leapYesA:y=>`Oui, l'an ${y} AH est une année bissextile de 355 jours.`,
        leapNoA:y=>`Non, l'an ${y} AH est une année ordinaire de 354 jours.`,
        otdTitle:"📖 Événements marquants de ce jour dans l'histoire islamique",
        otdSub:(dn,d,m,y)=>`Ce jour, ${dn} ${d} ${m} ${y} AH, de nombreux événements importants ont eu lieu dans l'histoire islamique.`,
        prev:'Jour précédent', next:'Jour suivant',
        miniTitle:'📅 Navigation rapide', thHijri:'Date hégirienne', thGreg:'Date grégorienne',
        extraTitle:'🌙 Plus de ressources',
        extraMonth:m=>`🌙 Calendrier ${m}`,
        extraYear:y=>`📆 Calendrier ${y} AH complet`,
        extraConv:'🔄 Convertisseur de dates',
        extraMoon:'🌙 État de la Lune aujourd\'hui',
        extraTimeLeft:'⏳ Temps restant jusqu\'à la prière',
        footer:c=>`Cette page affiche la date hégirienne d'aujourd'hui avec précision selon le calendrier Oumm al-Qura en ${c}, ainsi que son équivalent grégorien. Utilisez les liens ci-dessus pour accéder rapidement au calendrier hégirien complet, au convertisseur de dates et à l'état de la Lune.`,
    },
    tr: {
        hSfx:' H',
        days:['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
        gM:['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
        hM:['Muharrem','Safer','Rebiülevvel','Rebiülahir','Cemaziyelevvel','Cemaziyelahir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'],
        bcHome:'Ana Sayfa', bcCal:'Hicri Takvim',
        bcYear:y=>`${y} H`, bcMonth:(m,y)=>`${m} ${y} H`, bcDay:(d,m,y)=>`${d} ${m} ${y} H`,
        hero:(dn,d,m,y)=>`Bugünün Hicri Tarihi: ${dn}, ${d} ${m} ${y} H`,
        greg:(dn,g)=>`Miladi karşılığı: ${dn} ${g} M – Ümmü'l-Kurra Takvimi`,
        desc:c=>`${c} için bugünün Hicri tarihini Ümmü'l-Kurra takvimine göre tam olarak, karşılık gelen Miladi tarihle birlikte gösterir.`,
        descLink:'Hicri ile Miladi arasında tarih dönüştürme',
        infoLabels:['Gün','Hicri Tarih','Miladi Tarih','Ay','Yıl','Artık Yıl'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} H`, infoGreg:g=>`${g} M`, infoYear:y=>`${y} H`,
        leapYes:'Evet (355 gün)', leapNo:'Hayır (354 gün)',
        ctaConv:'🔄 Tarih Çevirici',
        ctaMoon:'🌙 Bugün Ay Durumu',
        ctaPrayer:'🕌 Bugünün Namaz Vakitleri',
        ctaToday:(dn,d,m,y)=>`📅 ${dn} ${d} ${m} ${y} H`,
        ctaMonth:(m,y)=>`🌙 ${m} ${y} H Takvimi`,
        ctaYear:y=>`📆 ${y} H Tam Takvim`,
        faqTitle:'❓ Sıkça Sorulan Sorular',
        faqQ1:'Bugünün Hicri tarihi nedir?',
        faqA1:(dn,d,m,y)=>`${dn}, ${d} ${m} ${y} H`,
        faqQ2:'Bugünün Miladi karşılığı nedir?',
        faqA2:g=>`${g} M`,
        faqQ3:y=>`${y} H yılı artık yıl mı?`,
        leapYesA:y=>`Evet, ${y} H yılı 355 günlük bir artık yıldır.`,
        leapNoA:y=>`Hayır, ${y} H yılı 354 günlük normal bir yıldır.`,
        otdTitle:'📖 İslam Tarihinde Bugünün Önemli Olayları',
        otdSub:(dn,d,m,y)=>`Tarihte bugün, ${dn} ${d} ${m} ${y} H, İslam tarihinde birçok önemli olay yaşandı.`,
        prev:'Önceki Gün', next:'Sonraki Gün',
        miniTitle:'📅 Hızlı Gezinme', thHijri:'Hicri Tarih', thGreg:'Miladi Tarih',
        extraTitle:'🌙 Daha Fazla Kaynak',
        extraMonth:m=>`🌙 ${m} Takvimi`,
        extraYear:y=>`📆 ${y} H Tam Takvim`,
        extraConv:'🔄 Tarih Dönüştürücü',
        extraMoon:'🌙 Bugün Ay Durumu',
        extraTimeLeft:'⏳ Bir Sonraki Namaza Kalan Süre',
        footer:c=>`Bu sayfa, ${c} için bugünün Hicri tarihini Ümmü'l-Kurra takvimine göre tam olarak ve Miladi karşılığıyla birlikte gösterir. Tam Hicri takvime, tarih dönüştürücüye ve bugünkü ay durumuna hızlı erişim için yukarıdaki bağlantıları kullanın.`,
    },
    ur: {
        hSfx:' ہجری',
        days:['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ'],
        gM:['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
        hM:['محرم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذی قعدہ','ذی الحجہ'],
        bcHome:'ہوم', bcCal:'ہجری کیلنڈر',
        bcYear:y=>`${y} ہجری`, bcMonth:(m,y)=>`${m} ${y} ہجری`, bcDay:(d,m,y)=>`${d} ${m} ${y} ہجری`,
        hero:(dn,d,m,y)=>`آج کی ہجری تاریخ: ${dn}، ${d} ${m} ${y} ہجری`,
        greg:(dn,g)=>`مطابق: ${dn} ${g} عیسوی – ام القریٰ کیلنڈر`,
        desc:c=>`${c} میں آج کی ہجری تاریخ ام القریٰ کیلنڈر کے مطابق بالکل درست دکھاتا ہے، ساتھ میں متعلقہ عیسوی تاریخ بھی۔`,
        descLink:'ہجری اور عیسوی کے درمیان تاریخ کی تبدیلی',
        infoLabels:['دن','ہجری تاریخ','عیسوی تاریخ','مہینہ','سال','لیپ سال'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} ہجری`, infoGreg:g=>`${g} عیسوی`, infoYear:y=>`${y} ہجری`,
        leapYes:'ہاں (355 دن)', leapNo:'نہیں (354 دن)',
        ctaConv:'🔄 تاریخ تبدیل',
        ctaMoon:'🌙 آج چاند کی حالت',
        ctaPrayer:'🕌 آج کے نماز کے اوقات',
        ctaToday:(dn,d,m,y)=>`📅 ${dn} ${d} ${m} ${y} ہجری`,
        ctaMonth:(m,y)=>`🌙 ${m} ${y} ہجری کیلنڈر`,
        ctaYear:y=>`📆 ${y} ہجری مکمل کیلنڈر`,
        faqTitle:'❓ اکثر پوچھے گئے سوالات',
        faqQ1:'آج کی ہجری تاریخ کیا ہے؟',
        faqA1:(dn,d,m,y)=>`${dn}، ${d} ${m} ${y} ہجری`,
        faqQ2:'آج عیسوی میں کس تاریخ کے مطابق ہے؟',
        faqA2:g=>`${g} عیسوی`,
        faqQ3:y=>`کیا ${y} ہجری لیپ سال ہے؟`,
        leapYesA:y=>`جی ہاں، ${y} ہجری ایک لیپ سال ہے جس میں 355 دن ہیں۔`,
        leapNoA:y=>`نہیں، ${y} ہجری ایک عام سال ہے جس میں 354 دن ہیں۔`,
        otdTitle:'📖 اسلامی تاریخ میں آج کے اہم واقعات',
        otdSub:(dn,d,m,y)=>`آج کے دن، ${dn} ${d} ${m} ${y} ہجری کو، اسلامی تاریخ میں بہت سے اہم واقعات پیش آئے۔`,
        prev:'پچھلا دن', next:'اگلا دن',
        miniTitle:'📅 فوری نیویگیشن', thHijri:'ہجری تاریخ', thGreg:'عیسوی تاریخ',
        extraTitle:'🌙 مزید وسائل',
        extraMonth:m=>`🌙 ${m} کیلنڈر`,
        extraYear:y=>`📆 ${y} ہجری مکمل کیلنڈر`,
        extraConv:'🔄 تاریخ کنورٹر',
        extraMoon:'🌙 آج چاند کی حالت',
        extraTimeLeft:'⏳ اگلی نماز تک باقی وقت',
        footer:c=>`یہ صفحہ ${c} میں ام القریٰ کیلنڈر کے مطابق آج کی ہجری تاریخ کو درست طور پر دکھاتا ہے، اس کے عیسوی مساوی کے ساتھ۔ مکمل ہجری کیلنڈر، تاریخ کنورٹر، اور آج کے چاند کی حالت تک فوری رسائی کے لیے اوپر دیے گئے روابط استعمال کریں۔`,
    },
    de: {
        hSfx:' AH',
        days:['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
        gM:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
        hM:['Muharram','Safar','Rabi al-Awwal','Rabi ath-Thani','Jumada al-Ula','Jumada al-Akhirah','Rajab','Shaban','Ramadan','Schawwal','Dhu al-Qida','Dhu al-Hijja'],
        bcHome:'Startseite', bcCal:'Hidschri-Kalender',
        bcYear:y=>`${y} AH`, bcMonth:(m,y)=>`${m} ${y} AH`, bcDay:(d,m,y)=>`${d} ${m} ${y} AH`,
        hero:(dn,d,m,y)=>`Heutiges Hidschri-Datum: ${dn}, ${d} ${m} ${y} AH`,
        greg:(dn,g)=>`Entspricht: ${dn} ${g} n. Chr. – Umm-al-Qura-Kalender`,
        desc:c=>`Zeigt das heutige Hidschri-Datum in ${c} präzise nach dem Umm-al-Qura-Kalender zusammen mit dem entsprechenden gregorianischen Datum.`,
        descLink:'Daten zwischen Hidschri und Gregorianisch umrechnen',
        infoLabels:['Tag','Hidschri-Datum','Gregorianisches Datum','Monat','Jahr','Schaltjahr'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} AH`, infoGreg:g=>`${g} n. Chr.`, infoYear:y=>`${y} AH`,
        leapYes:'Ja (355 Tage)', leapNo:'Nein (354 Tage)',
        ctaConv:'🔄 Datumsumrechner',
        ctaMoon:'🌙 Heutiger Mondstatus',
        ctaPrayer:'🕌 Heutige Gebetszeiten',
        ctaToday:(dn,d,m,y)=>`📅 ${dn} ${d} ${m} ${y} AH`,
        ctaMonth:(m,y)=>`🌙 ${m} ${y} AH Kalender`,
        ctaYear:y=>`📆 Kompletter ${y} AH Kalender`,
        faqTitle:'❓ Häufig gestellte Fragen',
        faqQ1:'Was ist das heutige Hidschri-Datum?',
        faqA1:(dn,d,m,y)=>`${dn}, ${d} ${m} ${y} AH`,
        faqQ2:'Welches gregorianische Datum entspricht heute?',
        faqA2:g=>`${g} n. Chr.`,
        faqQ3:y=>`Ist ${y} AH ein Schaltjahr?`,
        leapYesA:y=>`Ja, ${y} AH ist ein Schaltjahr mit 355 Tagen.`,
        leapNoA:y=>`Nein, ${y} AH ist ein normales Jahr mit 354 Tagen.`,
        otdTitle:'📖 Bedeutende Ereignisse an diesem Tag in der islamischen Geschichte',
        otdSub:(dn,d,m,y)=>`An diesem Tag, ${dn} ${d} ${m} ${y} AH, ereigneten sich viele wichtige Geschehnisse in der islamischen Geschichte.`,
        prev:'Vorheriger Tag', next:'Nächster Tag',
        miniTitle:'📅 Schnellnavigation', thHijri:'Hidschri-Datum', thGreg:'Gregorianisches Datum',
        extraTitle:'🌙 Weitere Ressourcen',
        extraMonth:m=>`🌙 ${m} Kalender`,
        extraYear:y=>`📆 ${y} AH Kompletter Kalender`,
        extraConv:'🔄 Datumsumrechner',
        extraMoon:'🌙 Heutiger Mondstatus',
        extraTimeLeft:'⏳ Verbleibende Zeit bis zum nächsten Gebet',
        footer:c=>`Diese Seite zeigt das heutige Hidschri-Datum in ${c} präzise nach dem Umm-al-Qura-Kalender zusammen mit dem entsprechenden gregorianischen Datum. Nutzen Sie die Links oben für schnellen Zugriff auf den vollständigen Hidschri-Kalender, den Datumsumrechner und den heutigen Mondstatus.`,
    },
    id: {
        hSfx:' H',
        days:['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],
        gM:['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
        hM:['Muharram','Safar',"Rabi'ul Awwal","Rabi'ul Akhir",'Jumadil Awwal','Jumadil Akhir','Rajab',"Sya'ban",'Ramadan','Syawal','Dzulkaidah','Dzulhijjah'],
        bcHome:'Beranda', bcCal:'Kalender Hijriah',
        bcYear:y=>`${y} H`, bcMonth:(m,y)=>`${m} ${y} H`, bcDay:(d,m,y)=>`${d} ${m} ${y} H`,
        hero:(dn,d,m,y)=>`Tanggal Hijriah Hari Ini: ${dn}, ${d} ${m} ${y} H`,
        greg:(dn,g)=>`Bertepatan dengan: ${dn} ${g} M – Kalender Umm al-Qura`,
        desc:c=>`Menampilkan tanggal Hijriah hari ini di ${c} secara akurat menurut kalender Umm al-Qura bersama dengan tanggal Masehi yang sesuai.`,
        descLink:'mengonversi tanggal antara Hijriah dan Masehi',
        infoLabels:['Hari','Tanggal Hijriah','Tanggal Masehi','Bulan','Tahun','Tahun Kabisat'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} H`, infoGreg:g=>`${g} M`, infoYear:y=>`${y} H`,
        leapYes:'Ya (355 hari)', leapNo:'Tidak (354 hari)',
        ctaConv:'🔄 Konverter Tanggal',
        ctaMoon:'🌙 Status Bulan Hari Ini',
        ctaPrayer:'🕌 Waktu Shalat Hari Ini',
        ctaToday:(dn,d,m,y)=>`📅 ${dn} ${d} ${m} ${y} H`,
        ctaMonth:(m,y)=>`🌙 Kalender ${m} ${y} H`,
        ctaYear:y=>`📆 Kalender Lengkap ${y} H`,
        faqTitle:'❓ Pertanyaan yang Sering Diajukan',
        faqQ1:'Berapa tanggal Hijriah hari ini?',
        faqA1:(dn,d,m,y)=>`${dn}, ${d} ${m} ${y} H`,
        faqQ2:'Berapa tanggal Masehi untuk hari ini?',
        faqA2:g=>`${g} M`,
        faqQ3:y=>`Apakah tahun ${y} H adalah tahun kabisat?`,
        leapYesA:y=>`Ya, tahun ${y} H adalah tahun kabisat dengan 355 hari.`,
        leapNoA:y=>`Tidak, tahun ${y} H adalah tahun biasa dengan 354 hari.`,
        otdTitle:'📖 Peristiwa Penting Hari Ini dalam Sejarah Islam',
        otdSub:(dn,d,m,y)=>`Pada hari ini, ${dn} ${d} ${m} ${y} H, banyak peristiwa penting terjadi dalam sejarah Islam.`,
        prev:'Hari Sebelumnya', next:'Hari Berikutnya',
        miniTitle:'📅 Navigasi Cepat', thHijri:'Tanggal Hijriah', thGreg:'Tanggal Masehi',
        extraTitle:'🌙 Sumber Daya Lainnya',
        extraMonth:m=>`🌙 Kalender ${m}`,
        extraYear:y=>`📆 Kalender Lengkap ${y} H`,
        extraConv:'🔄 Konverter Tanggal',
        extraMoon:'🌙 Status Bulan Hari Ini',
        extraTimeLeft:'⏳ Waktu Tersisa Hingga Shalat Berikutnya',
        footer:c=>`Halaman ini menampilkan tanggal Hijriah hari ini di ${c} secara akurat menurut kalender Umm al-Qura bersama dengan tanggal Masehi yang sesuai. Gunakan tautan di atas untuk akses cepat ke kalender Hijriah lengkap, konverter tanggal, dan status bulan hari ini.`,
    },
    es: {
        hSfx:' AH',
        days:['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
        gM:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
        hM:['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Yumada al-Awwal','Yumada al-Thani','Rayab','Shaban','Ramadán','Shawwal','Dhu al-Qidah','Dhu al-Hiyyah'],
        bcHome:'Inicio', bcCal:'Calendario Hégira',
        bcYear:y=>`${y} AH`, bcMonth:(m,y)=>`${m} ${y} AH`, bcDay:(d,m,y)=>`${d} ${m} ${y} AH`,
        hero:(dn,d,m,y)=>`Fecha Hégira de Hoy: ${dn}, ${d} ${m} ${y} AH`,
        greg:(dn,g)=>`Corresponde al: ${dn} ${g} d.C. – Calendario Umm al-Qura`,
        desc:c=>`Muestra la fecha Hégira de hoy en ${c} con precisión según el calendario Umm al-Qura junto con la fecha gregoriana correspondiente.`,
        descLink:'convertir fechas entre Hégira y Gregoriano',
        infoLabels:['Día','Fecha Hégira','Fecha Gregoriana','Mes','Año','Año Bisiesto'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} AH`, infoGreg:g=>`${g} d.C.`, infoYear:y=>`${y} AH`,
        leapYes:'Sí (355 días)', leapNo:'No (354 días)',
        ctaConv:'🔄 Conversor de Fechas',
        ctaMoon:'🌙 Estado de la Luna Hoy',
        ctaPrayer:'🕌 Horarios de Oración Hoy',
        ctaToday:(dn,d,m,y)=>`📅 ${dn} ${d} ${m} ${y} AH`,
        ctaMonth:(m,y)=>`🌙 Calendario ${m} ${y} AH`,
        ctaYear:y=>`📆 Calendario Completo ${y} AH`,
        faqTitle:'❓ Preguntas Frecuentes',
        faqQ1:'¿Cuál es la fecha Hégira de hoy?',
        faqA1:(dn,d,m,y)=>`${dn}, ${d} ${m} ${y} AH`,
        faqQ2:'¿A qué fecha gregoriana corresponde hoy?',
        faqA2:g=>`${g} d.C.`,
        faqQ3:y=>`¿Es ${y} AH un año bisiesto?`,
        leapYesA:y=>`Sí, ${y} AH es un año bisiesto con 355 días.`,
        leapNoA:y=>`No, ${y} AH es un año regular con 354 días.`,
        otdTitle:'📖 Eventos Notables de Este Día en la Historia Islámica',
        otdSub:(dn,d,m,y)=>`En este día, ${dn} ${d} ${m} ${y} AH, ocurrieron muchos eventos importantes en la historia islámica.`,
        prev:'Día Anterior', next:'Día Siguiente',
        miniTitle:'📅 Navegación Rápida', thHijri:'Fecha Hégira', thGreg:'Fecha Gregoriana',
        extraTitle:'🌙 Más Recursos',
        extraMonth:m=>`🌙 Calendario ${m}`,
        extraYear:y=>`📆 Calendario Completo ${y} AH`,
        extraConv:'🔄 Conversor de Fechas',
        extraMoon:'🌙 Estado de la Luna Hoy',
        extraTimeLeft:'⏳ Tiempo Restante Hasta la Próxima Oración',
        footer:c=>`Esta página muestra la fecha Hégira de hoy en ${c} con precisión según el calendario Umm al-Qura junto con la fecha gregoriana correspondiente. Utiliza los enlaces de arriba para acceder rápidamente al calendario Hégira completo, al conversor de fechas y al estado de la luna hoy.`,
    },
    bn: {
        hSfx:' হিজরি',
        days:['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'],
        gM:['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
        hM:['মহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জুমাদাল উলা','জুমাদাল উখরা','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'],
        bcHome:'হোম', bcCal:'হিজরি ক্যালেন্ডার',
        bcYear:y=>`${y} হিজরি`, bcMonth:(m,y)=>`${m} ${y} হিজরি`, bcDay:(d,m,y)=>`${d} ${m} ${y} হিজরি`,
        hero:(dn,d,m,y)=>`আজকের হিজরি তারিখ: ${dn}, ${d} ${m} ${y} হিজরি`,
        greg:(dn,g)=>`সমতুল্য: ${dn} ${g} খ্রিস্টাব্দ – উম্মুল কুরা ক্যালেন্ডার`,
        desc:c=>`${c}-এ উম্মুল কুরা ক্যালেন্ডার অনুযায়ী আজকের হিজরি তারিখ সঠিকভাবে প্রদর্শন করে, সঙ্গে সংশ্লিষ্ট খ্রিস্টীয় তারিখও।`,
        descLink:'হিজরি ও খ্রিস্টীয় তারিখের মধ্যে রূপান্তর',
        infoLabels:['দিন','হিজরি তারিখ','খ্রিস্টীয় তারিখ','মাস','বছর','অধিবর্ষ'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} হিজরি`, infoGreg:g=>`${g} খ্রিস্টাব্দ`, infoYear:y=>`${y} হিজরি`,
        leapYes:'হ্যাঁ (৩৫৫ দিন)', leapNo:'না (৩৫৪ দিন)',
        ctaConv:'🔄 তারিখ রূপান্তর',
        ctaMoon:'🌙 আজকের চাঁদের অবস্থা',
        ctaPrayer:'🕌 আজকের নামাজের সময়',
        ctaToday:(dn,d,m,y)=>`📅 ${dn} ${d} ${m} ${y} হিজরি`,
        ctaMonth:(m,y)=>`🌙 ${m} ${y} হিজরি ক্যালেন্ডার`,
        ctaYear:y=>`📆 ${y} হিজরি পূর্ণ ক্যালেন্ডার`,
        faqTitle:'❓ প্রায়শই জিজ্ঞাসিত প্রশ্ন',
        faqQ1:'আজকের হিজরি তারিখ কত?',
        faqA1:(dn,d,m,y)=>`${dn}, ${d} ${m} ${y} হিজরি`,
        faqQ2:'আজ খ্রিস্টীয় কোন তারিখের সাথে সমতুল্য?',
        faqA2:g=>`${g} খ্রিস্টাব্দ`,
        faqQ3:y=>`${y} হিজরি কি অধিবর্ষ?`,
        leapYesA:y=>`হ্যাঁ, ${y} হিজরি একটি অধিবর্ষ যার ৩৫৫ দিন রয়েছে।`,
        leapNoA:y=>`না, ${y} হিজরি একটি সাধারণ বছর যার ৩৫৪ দিন রয়েছে।`,
        otdTitle:'📖 ইসলামি ইতিহাসে আজকের দিনের উল্লেখযোগ্য ঘটনা',
        otdSub:(dn,d,m,y)=>`আজকের দিনে, ${dn} ${d} ${m} ${y} হিজরি, ইসলামি ইতিহাসে অনেক গুরুত্বপূর্ণ ঘটনা ঘটেছে।`,
        prev:'আগের দিন', next:'পরের দিন',
        miniTitle:'📅 দ্রুত নেভিগেশন', thHijri:'হিজরি তারিখ', thGreg:'খ্রিস্টীয় তারিখ',
        extraTitle:'🌙 আরও সম্পদ',
        extraMonth:m=>`🌙 ${m} ক্যালেন্ডার`,
        extraYear:y=>`📆 ${y} হিজরি পূর্ণ ক্যালেন্ডার`,
        extraConv:'🔄 তারিখ রূপান্তরকারী',
        extraMoon:'🌙 আজকের চাঁদের অবস্থা',
        extraTimeLeft:'⏳ পরবর্তী নামাজ পর্যন্ত বাকি সময়',
        footer:c=>`এই পৃষ্ঠাটি ${c}-এ উম্মুল কুরা ক্যালেন্ডার অনুযায়ী আজকের হিজরি তারিখ সঠিকভাবে প্রদর্শন করে এবং সংশ্লিষ্ট খ্রিস্টীয় তারিখও দেখায়। উপরের লিঙ্কগুলি ব্যবহার করে সম্পূর্ণ হিজরি ক্যালেন্ডার, তারিখ রূপান্তরকারী এবং আজকের চাঁদের অবস্থায় দ্রুত অ্যাক্সেস পান।`,
    },
    ms: {
        hSfx:' H',
        days:['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'],
        gM:['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'],
        hM:['Muharram','Safar',"Rabi'ul Awwal","Rabi'ul Akhir",'Jumadil Awwal','Jumadil Akhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijjah'],
        bcHome:'Utama', bcCal:'Kalendar Hijrah',
        bcYear:y=>`${y} H`, bcMonth:(m,y)=>`${m} ${y} H`, bcDay:(d,m,y)=>`${d} ${m} ${y} H`,
        hero:(dn,d,m,y)=>`Tarikh Hijrah Hari Ini: ${dn}, ${d} ${m} ${y} H`,
        greg:(dn,g)=>`Bersamaan dengan: ${dn} ${g} M – Kalendar Umm al-Qura`,
        desc:c=>`Memaparkan tarikh Hijrah hari ini di ${c} dengan tepat mengikut kalendar Umm al-Qura bersama dengan tarikh Masihi yang sepadan.`,
        descLink:'menukar tarikh antara Hijrah dan Masihi',
        infoLabels:['Hari','Tarikh Hijrah','Tarikh Masihi','Bulan','Tahun','Tahun Lompat'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} H`, infoGreg:g=>`${g} M`, infoYear:y=>`${y} H`,
        leapYes:'Ya (355 hari)', leapNo:'Tidak (354 hari)',
        ctaConv:'🔄 Penukar Tarikh',
        ctaMoon:'🌙 Status Bulan Hari Ini',
        ctaPrayer:'🕌 Waktu Solat Hari Ini',
        ctaToday:(dn,d,m,y)=>`📅 ${dn} ${d} ${m} ${y} H`,
        ctaMonth:(m,y)=>`🌙 Kalendar ${m} ${y} H`,
        ctaYear:y=>`📆 Kalendar Penuh ${y} H`,
        faqTitle:'❓ Soalan Lazim',
        faqQ1:'Apakah tarikh Hijrah hari ini?',
        faqA1:(dn,d,m,y)=>`${dn}, ${d} ${m} ${y} H`,
        faqQ2:'Apakah tarikh Masihi untuk hari ini?',
        faqA2:g=>`${g} M`,
        faqQ3:y=>`Adakah tahun ${y} H tahun lompat?`,
        leapYesA:y=>`Ya, tahun ${y} H adalah tahun lompat dengan 355 hari.`,
        leapNoA:y=>`Tidak, tahun ${y} H adalah tahun biasa dengan 354 hari.`,
        otdTitle:'📖 Peristiwa Penting Pada Hari Ini Dalam Sejarah Islam',
        otdSub:(dn,d,m,y)=>`Pada hari ini, ${dn} ${d} ${m} ${y} H, banyak peristiwa penting berlaku dalam sejarah Islam.`,
        prev:'Hari Sebelumnya', next:'Hari Seterusnya',
        miniTitle:'📅 Navigasi Pantas', thHijri:'Tarikh Hijrah', thGreg:'Tarikh Masihi',
        extraTitle:'🌙 Lebih Banyak Sumber',
        extraMonth:m=>`🌙 Kalendar ${m}`,
        extraYear:y=>`📆 Kalendar Penuh ${y} H`,
        extraConv:'🔄 Penukar Tarikh',
        extraMoon:'🌙 Status Bulan Hari Ini',
        extraTimeLeft:'⏳ Masa Berbaki Sehingga Solat Seterusnya',
        footer:c=>`Halaman ini memaparkan tarikh Hijrah hari ini di ${c} dengan tepat mengikut kalendar Umm al-Qura bersama-sama dengan tarikh Masihi yang sepadan. Gunakan pautan di atas untuk akses pantas ke kalendar Hijrah penuh, penukar tarikh, dan status bulan hari ini.`,
    },
};

function updateHijriToday() {
    const now      = new Date();
    const hijri    = HijriDate.getToday();
    const lang     = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const T        = HT_I18N[lang] || HT_I18N.en;
    const prefix   = lang === 'ar' ? '' : '/' + lang;
    const dow      = now.getDay();
    const dayName  = T.days[dow];
    const monthIdx = hijri.month - 1;
    const monthName = T.hM[monthIdx];
    const totalDays = HijriDate.getDaysInHijriMonth(hijri.year, hijri.month);
    const isLeap    = HijriDate.isHijriLeapYear(hijri.year);
    const country   = getDisplayCountry();
    const gregToday = `${now.getDate()} ${T.gM[now.getMonth()]} ${now.getFullYear()}`;

    // ── 0. Breadcrumb ─────────────────────────────────────────────
    const htBcEl = document.getElementById('htoday-breadcrumbs');
    if (htBcEl) {
        const yearUrl   = `${prefix}/hijri-calendar/${hijri.year}`;
        const monthUrl0 = hijriMonthUrl(hijri.year, hijri.month);
        const homeUrl   = (lang === 'ar') ? '/' : (prefix + '/');
        const calHubUrl = `${prefix}/hijri-calendar`;
        const _t        = (typeof t === 'function') ? t : (k) => k;
        const homeL     = _t('breadcrumb.home') || T.bcHome;
        htBcEl.innerHTML = _buildHijriBreadcrumbOl([
            { href: homeUrl,   text: homeL },
            { href: calHubUrl, text: T.bcCal  },
            { href: yearUrl,   text: T.bcYear(hijri.year) },
            { href: monthUrl0, text: T.bcMonth(monthName, hijri.year) },
            { text: T.bcDay(hijri.day, monthName, hijri.year), current: true }
        ]);
    }

    // ── 1. Hero — 🆕 Round 9: H2 full sentence (SEO) + big-number visual stack ────
    const fullEl = document.getElementById('hijri-today-full');
    if (fullEl) fullEl.textContent = T.hero(dayName, hijri.day, monthName, hijri.year);

    // Visual stack (aria-hidden — duplicates H2 info semantically)
    const dayNumEl = document.getElementById('hijri-today-day-num');
    if (dayNumEl) dayNumEl.textContent = hijri.day;
    const monthEl  = document.getElementById('hijri-today-month');
    if (monthEl)  monthEl.textContent  = monthName;
    const yearEl   = document.getElementById('hijri-today-year');
    if (yearEl)   yearEl.textContent   = `${hijri.year}${T.hSfx}`;

    const gregEl = document.getElementById('hijri-today-greg');
    if (gregEl) gregEl.textContent = T.greg(dayName, gregToday);

    const descEl = document.getElementById('hijri-today-desc');
    if (descEl) {
        descEl.textContent = T.desc(country);
    }

    // ── 2. Quick Info Cards ───────────────────────────────────────
    const infoGrid = document.getElementById('hijri-today-info-grid');
    if (infoGrid) {
        const leapLabel = isLeap ? T.leapYes : T.leapNo;
        const cards = [
            ['📅', T.infoLabels[0], dayName],
            ['🗓', T.infoLabels[1], T.infoHijri(hijri.day, monthName, hijri.year)],
            ['📆', T.infoLabels[2], T.infoGreg(gregToday)],
            ['🌙', T.infoLabels[3], monthName],
            ['✔️', T.infoLabels[4], T.infoYear(hijri.year)],
            ['✅', T.infoLabels[5], leapLabel],
        ];
        infoGrid.innerHTML = cards.map(([icon, label, value]) =>
            `<div class="info-card"><div class="info-card-label">${icon} ${label}</div><div class="info-card-value">${value}</div></div>`
        ).join('');
    }

    // ── 3. CTA Distribution — 🆕 Round 9: 3 focused entries (converter + moon + smart prayer) ─
    const ctaEl = document.getElementById('hijri-today-cta');
    if (ctaEl) {
        // Smart prayer routing: city known → /prayer-times-in-{slug}; else → homepage
        let _citySlug = '';
        try {
            if (typeof currentEnglishName === 'string' && currentEnglishName) {
                _citySlug = currentEnglishName.toLowerCase().trim()
                    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
            }
        } catch (_) {}
        const _prayerHref = _citySlug
            ? `${prefix}/prayer-times-in-${_citySlug}`
            : ((lang === 'ar') ? '/' : (prefix + '/'));
        const ctas = [
            [`${prefix}/dateconverter`,           T.ctaConv,   true],   // primary
            [`${prefix}/moon-today`,              T.ctaMoon,   false],
            [_prayerHref,                         T.ctaPrayer, false],
        ];
        ctaEl.innerHTML = ctas.map(([href, text, primary]) =>
            `<a href="${href}" style="display:inline-block;padding:10px 20px;background:${primary ? 'var(--primary)' : 'var(--bg)'};color:${primary ? '#fff' : 'var(--primary)'};border-radius:8px;text-decoration:none;font-size:0.9rem;font-weight:${primary ? '700' : '500'};border:1px solid var(--border);margin:4px;">${text}</a>`
        ).join('');
    }

    // ── 4. FAQ ────────────────────────────────────────────────────
    const faqTitleEl = document.getElementById('hijri-today-faq-title');
    if (faqTitleEl) faqTitleEl.textContent = T.faqTitle;

    const faqEl = document.getElementById('hijri-today-faq');
    if (faqEl) {
        const leapAns = isLeap ? T.leapYesA(hijri.year) : T.leapNoA(hijri.year);
        const faqs = [
            [T.faqQ1,             T.faqA1(dayName, hijri.day, monthName, hijri.year)],
            [T.faqQ2,             T.faqA2(gregToday)],
            [T.faqQ3(hijri.year), leapAns],
        ];
        faqEl.innerHTML = faqs.map(([q, a]) =>
            `<div style="background:var(--bg);border-radius:10px;padding:14px 18px;margin-bottom:10px;">
                <div style="font-weight:700;color:var(--primary);margin-bottom:6px;">${q}</div>
                <div style="color:var(--text);font-size:0.95rem;">${a}</div>
            </div>`
        ).join('');
    }

    // ── 5. [REMOVED Round 9] OTD historical events — different intent, moved off this page.
    //      (Kept loadWikiOTD() and HT_I18N.otd* strings intact for future standalone page.)

    // ── 6. Prev / Next Navigation ─────────────────────────────────
    const navEl = document.getElementById('hijri-today-nav');
    if (navEl) {
        let prevD = hijri.day - 1, prevM = hijri.month, prevY = hijri.year;
        if (prevD < 1) {
            prevM--;
            if (prevM < 1) { prevM = 12; prevY--; }
            prevD = HijriDate.getDaysInHijriMonth(prevY, prevM);
        }
        let nextD = hijri.day + 1, nextM = hijri.month, nextY = hijri.year;
        if (nextD > totalDays) {
            nextD = 1; nextM++;
            if (nextM > 12) { nextM = 1; nextY++; }
        }
        const prevMN = T.hM[prevM-1];
        const nextMN = T.hM[nextM-1];
        navEl.innerHTML = `
            <a href="${hijriDayUrl(prevY, prevM, prevD)}" style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text-light);">← ${T.prev}</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${prevD} ${prevMN} ${prevY}${T.hSfx}</span>
            </a>
            <a href="${hijriDayUrl(nextY, nextM, nextD)}" style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text-light);">${T.next} →</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${nextD} ${nextMN} ${nextY}${T.hSfx}</span>
            </a>`;
    }

    // ── 7. [REMOVED Round 9] Mini Calendar 3-row table — redundant with Prev/Next navigation.

    // ── 8. Extra Links ────────────────────────────────────────────
    const extraTitleEl = document.getElementById('hijri-today-extra-title');
    if (extraTitleEl) extraTitleEl.textContent = T.extraTitle;

    const extraEl = document.getElementById('hijri-today-extra-links');
    if (extraEl) {
        const monthUrl = hijriMonthUrl(hijri.year, hijri.month);
        const yearUrl2 = `${prefix}/hijri-calendar/${hijri.year}`;
        // 🆕 Smart prayer-times routing: city known → /prayer-times-in-{slug}; else → homepage
        let _citySlug2 = '';
        try {
            if (typeof currentEnglishName === 'string' && currentEnglishName) {
                _citySlug2 = currentEnglishName.toLowerCase().trim()
                    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
            }
        } catch (_) {}
        const _prayerHref2 = _citySlug2
            ? `${prefix}/prayer-times-in-${_citySlug2}`
            : ((lang === 'ar') ? '/' : (prefix + '/'));
        // Only truly-related secondary links. Month + Year (hierarchy) render above under the Hero.
        const extras = [
            [`${prefix}/dateconverter`,  T.extraConv],
            [`${prefix}/moon-today`,     T.extraMoon],
            [_prayerHref2,               T.extraTimeLeft],
        ];
        extraEl.innerHTML = extras.map(([href, text]) =>
            `<a href="${href}" style="display:inline-block;padding:9px 18px;background:var(--bg);color:var(--primary);border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid var(--border);margin:4px;">${text}</a>`
        ).join('');
    }

    // ── 1b. Hierarchy Navigation (Today → Month → Year) — above the fold, primary-colored for crawl priority ──
    const hierTodayEl = document.getElementById('hijri-today-hierarchy');
    if (hierTodayEl) {
        const _monthLabelT = (typeof T.extraMonth === 'function')
            ? T.extraMonth(`${monthName} ${hijri.year}${T.hSfx}`.trim())
            : `${monthName} ${hijri.year}${T.hSfx}`;
        const _yearLabelT = (typeof T.extraYear === 'function')
            ? T.extraYear(hijri.year)
            : `${hijri.year}${T.hSfx}`;
        const hierRows = [
            [hijriMonthUrl(hijri.year, hijri.month),   _monthLabelT],
            [`${prefix}/hijri-calendar/${hijri.year}`, _yearLabelT],
        ];
        hierTodayEl.innerHTML = hierRows.map(([href, text]) =>
            `<a href="${href}" style="display:inline-flex;align-items:center;justify-content:center;padding:12px 22px;background:var(--primary);color:#fff;border-radius:10px;text-decoration:none;font-size:0.95rem;font-weight:700;margin:6px;border:1px solid var(--primary);min-height:44px;">${text}</a>`
        ).join('');
    }

    // ── 9. Footer SEO — with inline internal link to the current Hijri month (anchor variation + crawl depth) ──
    const footerEl = document.getElementById('hijri-today-footer-seo');
    if (footerEl) {
        const _esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const _ex  = (typeof hdayExtraUi === 'function') ? hdayExtraUi(lang) : null;
        const _baseText = _esc(T.footer(country));
        const _linkHref = _esc(hijriMonthUrl(hijri.year, hijri.month));
        const _linkText = _ex
            ? _esc(_ex.footerLink(monthName, hijri.year))
            : _esc(`${monthName} ${hijri.year}${T.hSfx}`);
        footerEl.innerHTML = `${_baseText} — <a href="${_linkHref}" style="color:var(--primary);text-decoration:underline;">${_linkText}</a>.`;
    }
}

// ========= صفحة اليوم الهجري الفردي — Answer Page (مختصرة + مركّزة) =========
function loadHijriDayPage() {
    const match = window.location.pathname.match(/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-date\/(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return;

    // ── Hydrate current-city globals from sessionStorage (set by sidebar "التاريخ الهجري" click) ──
    // After a full-page navigation the globals reset to Mecca defaults; if the user had another
    // city selected, the nav handler stashed it under `city_hijri-today` so we can geo-localize.
    try {
        const _stash = sessionStorage.getItem('city_hijri-today');
        if (_stash) {
            const _p = JSON.parse(_stash);
            if (_p && _p.englishName && _p.name) {
                currentCity         = _p.name         || currentCity;
                currentEnglishName  = _p.englishName  || currentEnglishName;
                currentCountry      = _p.country      || currentCountry;
                currentCountryCode  = _p.countryCode  || currentCountryCode;
                if (typeof _p.lat === 'number')  currentLat = _p.lat;
                if (typeof _p.lng === 'number')  currentLng = _p.lng;
                if (_p.timezone)                 currentTimezone = _p.timezone;
            }
        }
    } catch (_) {}

    const year  = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day   = parseInt(match[3], 10);
    if (month < 1 || month > 12 || day < 1 || day > 30) return;
    const monthIdx = month - 1;

    const lang       = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const ui         = hdayUi(lang);
    const ex         = hdayExtraUi(lang);
    const nt         = hdayNonTodayUi(lang); // static (non-today) overrides
    const geo        = hdayGeoUi(lang);      // geo-aware today overrides
    const hijriNames = hijriMonthsFor(lang);
    const monthName  = hijriNames[monthIdx];
    const hSfx       = hSfxFor(lang);
    const gSfx       = gSfxFor(lang);

    // Greg equivalent + day-of-week
    const greg       = HijriDate.toGregorian(year, month, day);
    const gregDate   = new Date(greg.year, greg.month - 1, greg.day);
    const dow        = gregDate.getDay();
    const dayName    = dayNameFor(lang, dow);
    const gMonthName = gregMonthFor(lang, greg.month - 1);

    const totalDays  = HijriDate.getDaysInHijriMonth(year, month);
    const isLeap     = HijriDate.isHijriLeapYear(year);
    const totalYearDays = isLeap ? 355 : 354;
    const country    = getDisplayCountry();
    const countryLabel = (lang === 'ar') ? (currentCountry || currentCity || country) : country;
    const prefix     = (lang === 'ar') ? '' : '/' + lang;

    const hDate   = `${day} ${monthName} ${year}${hSfx}`;
    const gDate   = `${greg.day} ${gMonthName} ${greg.year}${gSfx}`;
    const _todayH  = HijriDate.getToday();
    const _todayMN = hijriNames[_todayH.month - 1];
    const todayH  = `${_todayH.day} ${_todayMN} ${_todayH.year}${hSfx}`;
    // Are we rendering today's date? (Distinguishes H1 between "Today's Hijri Date: X" vs "Hijri Date: X")
    const isToday = (_todayH.year === year && _todayH.month === month && _todayH.day === day);
    const ctx = { day, monthName, year, dayName, hDate, gDate, country, countryLabel, todayH, isLeap, hSfx, gSfx, isToday,
                  monthNum: month, totalDays, totalYearDays };

    // ── City (geo-aware) — used when isToday && city known ─────────
    // Use the app's proper display-name resolver so every language gets the
    // localized city name (Bengali "রিয়াদ", Urdu "ریاض", Turkish "Riyad"…).
    // Helper order: currentLocalizedName (Nominatim) → per-lang dictionary → English fallback.
    let locDisplay = '', locSlug = '';
    try {
        locDisplay = (typeof getDisplayCity === 'function') ? (getDisplayCity() || '') : '';
        if (!locDisplay) {
            locDisplay = (lang === 'ar') ? (currentCity || currentEnglishName || '')
                                         : (currentEnglishName || currentCity || '');
        }
        if (typeof currentEnglishName === 'string' && currentEnglishName) {
            locSlug = currentEnglishName.toLowerCase().trim()
                .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        }
    } catch (_) {}
    const isGeoToday = isToday && !!locDisplay && !!locSlug;

    // ── 1. Breadcrumbs ─────────────────────────────────────────────
    const bcEl = document.getElementById('hday-breadcrumbs');
    if (bcEl) {
        const calHubUrl = `${prefix}/hijri-calendar`;
        const yearPath  = `${prefix}/hijri-calendar/${year}`;
        const monthPath = hijriMonthUrl(year, month);
        const homeUrl   = (lang === 'ar') ? '/' : (prefix + '/');
        const _t        = (typeof t === 'function') ? t : (k) => k;
        const homeL     = _t('breadcrumb.home') || ui.home;
        // Geo-aware breadcrumb: insert city hop after Home (local-SEO boost) when today + city known
        const _bcItems = [{ href: homeUrl, text: homeL }];
        if (isGeoToday) {
            _bcItems.push({ href: `${prefix}/prayer-times-in-${locSlug}`, text: locDisplay });
        }
        _bcItems.push(
            { href: calHubUrl, text: ui.cal },
            { href: yearPath,  text: `${year}${hSfx}` },
            { href: monthPath, text: `${monthName} ${year}${hSfx}` },
            { text: hDate, current: true }
        );
        bcEl.innerHTML = _buildHijriBreadcrumbOl(_bcItems);
    }

    // ── 2. Hero — H1 SEO sentence (date-aware: today vs arbitrary) + big-number stack + Gregorian subtitle ──
    const titleEl    = document.getElementById('hday-title');
    if (titleEl) {
        // ui.title always says "Today's Hijri Date: X" — correct only when date === today.
        // For past/future dates, swap to plain "Hijri Date: X" per lang.
        const _H1_PLAIN = {
            ar: `التاريخ الهجري: ${dayName} ${hDate}`,
            en: `Hijri Date: ${dayName}, ${hDate}`,
            fr: `Date hégirienne : ${dayName}, ${hDate}`,
            tr: `Hicri Tarih: ${dayName}, ${hDate}`,
            ur: `ہجری تاریخ: ${dayName}، ${hDate}`,
            de: `Hidschri-Datum: ${dayName}, ${hDate}`,
            id: `Tanggal Hijriah: ${dayName}, ${hDate}`,
            es: `Fecha Hégira: ${dayName}, ${hDate}`,
            bn: `হিজরি তারিখ: ${dayName}, ${hDate}`,
            ms: `Tarikh Hijrah: ${dayName}, ${hDate}`,
        };
        titleEl.textContent = isGeoToday
            ? geo.h1(locDisplay, dayName, hDate)
            : (isToday ? ui.title(ctx) : (_H1_PLAIN[lang] || _H1_PLAIN.en));
    }

    const dayNumEl = document.getElementById('hday-day-num');
    if (dayNumEl) dayNumEl.textContent = day;
    const monthElH = document.getElementById('hday-month');
    if (monthElH)  monthElH.textContent = monthName;
    const yearElH  = document.getElementById('hday-year');
    if (yearElH)   yearElH.textContent  = `${year}${hSfx}`;

    const subtitleEl = document.getElementById('hday-subtitle');
    if (subtitleEl) subtitleEl.textContent = ui.subtitle(ctx);

    // ── 3. Info Cards (today vs non-today: drop redundant hDate card, add year + order-of-day) ──
    const gridEl = document.getElementById('hday-info-grid');
    if (gridEl) {
        const leapText = isLeap ? ui.leap_yes : ui.leap_no;
        const cards = isToday ? [
            [ui.cards[0], dayName],
            [ui.cards[2], gDate],
            [ui.cards[3], monthName],
            [ui.cards[4], `${totalDays} ${ui.days_word}`],
            [nt.cardOrder, nt.orderOf(day, totalDays)],
            [ui.cards[5], leapText],
        ] : [
            [ui.cards[0], dayName],
            [ui.cards[2], gDate],
            [ui.cards[3], monthName],
            [nt.cardYear,  `${year}${hSfx}`],
            [ui.cards[4],  `${totalDays} ${ui.days_word}`],
            [nt.cardOrder, nt.orderOf(day, totalDays)],
        ];
        gridEl.innerHTML = cards.map(([label, val]) =>
            `<div class="info-card"><div class="info-label">${label}</div><div class="info-value">${val}</div></div>`
        ).join('');
    }

    // ── 4. CTA — 3 focused buttons (converter + moon + smart prayer) ──
    // Smart prayer routing: city known → /prayer-times-in-{slug}; else → homepage
    const ctaEl = document.getElementById('hday-cta');
    if (ctaEl) {
        let _citySlug = '';
        try {
            if (typeof currentEnglishName === 'string' && currentEnglishName) {
                _citySlug = currentEnglishName.toLowerCase().trim()
                    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
            }
        } catch (_) {}
        const prayerHref = _citySlug
            ? `${prefix}/prayer-times-in-${_citySlug}`
            : ((lang === 'ar') ? '/' : (prefix + '/'));
        const _ctaPrayerText = isGeoToday ? geo.ctaPrayer(locDisplay) : ex.ctaPrayer;
        const _ctaMoonText   = isGeoToday ? geo.ctaMoon(locDisplay)   : ex.ctaMoon;
        // Geo-aware moon URL: /moon-today-in-{slug}[-{lat}-{lng}] when city known, else generic /moon-today
        let _moonHref = `${prefix}/moon-today`;
        if (isGeoToday) {
            _moonHref = `${prefix}/moon-today-in-${locSlug}`;
            if (currentLat != null && currentLng != null && isFinite(currentLat) && isFinite(currentLng) && !/loc-/.test(locSlug)) {
                _moonHref = `${prefix}/moon-today-in-${locSlug}-${Number(currentLat).toFixed(4)}-${Number(currentLng).toFixed(4)}`;
            }
        }
        const ctas = [
            [`${prefix}/dateconverter`, ex.ctaConv,     true],   // primary
            [_moonHref,                 _ctaMoonText,   false],
            [prayerHref,                _ctaPrayerText, false],
        ];
        ctaEl.innerHTML = ctas.map(([href, text, primary]) =>
            `<a href="${href}" style="display:inline-block;padding:10px 20px;background:${primary ? 'var(--primary)' : 'var(--bg)'};color:${primary ? '#fff' : 'var(--primary)'};border-radius:8px;text-decoration:none;font-size:0.9rem;font-weight:${primary ? '700' : '500'};border:1px solid var(--border);margin:4px;">${text}</a>`
        ).join('');
    }

    // ── 5. Prev / Next Navigation ──────────────────────────────────
    const navEl = document.getElementById('hday-nav');
    if (navEl) {
        let prevD2, prevM2, prevY2, nextD2, nextM2, nextY2;
        if (day > 1)       { prevD2 = day - 1; prevM2 = month; prevY2 = year; }
        else if (month > 1){ prevM2 = month - 1; prevY2 = year; prevD2 = HijriDate.getDaysInHijriMonth(prevY2, prevM2); }
        else               { prevY2 = year - 1; prevM2 = 12; prevD2 = HijriDate.getDaysInHijriMonth(prevY2, prevM2); }
        if (day < totalDays)   { nextD2 = day + 1; nextM2 = month; nextY2 = year; }
        else if (month < 12)   { nextD2 = 1; nextM2 = month + 1; nextY2 = year; }
        else                   { nextD2 = 1; nextM2 = 1; nextY2 = year + 1; }

        const prevName = hijriNames[prevM2 - 1];
        const nextName = hijriNames[nextM2 - 1];
        const prevUrl  = hijriDayUrl(prevY2, prevM2, prevD2);
        const nextUrl  = hijriDayUrl(nextY2, nextM2, nextD2);
        const prevFullName = `${prevD2} ${prevName} ${prevY2}${hSfx}`;
        const nextFullName = `${nextD2} ${nextName} ${nextY2}${hSfx}`;
        navEl.innerHTML = `
            <a href="${prevUrl}" style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text-light);">← ${ui.prev}</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${prevFullName}</span>
            </a>
            <a href="${nextUrl}" style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text-light);">${ui.next} →</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${nextFullName}</span>
            </a>`;
    }

    // ── 6. FAQ (today: "اليوم" Qs; non-today: date-specific Qs without "today" phrasing) ──
    const faqTitleEl = document.getElementById('hday-faq-title');
    if (faqTitleEl) faqTitleEl.textContent = isToday ? ex.faqTitle : nt.faqTitle;

    const faqEl = document.getElementById('hday-faq');
    if (faqEl) {
        // Geo-aware: when city known, substitute city name for country name in ALL FAQ pairs
        const _faqCtx = isGeoToday ? { ...ctx, country: locDisplay, countryLabel: locDisplay } : ctx;
        let faqs = isToday ? ui.faq(_faqCtx) : nt.faq(_faqCtx);
        // Geo-aware: if today + city known, swap the first FAQ pair for a location-specific Q/A
        if (isGeoToday && faqs.length) {
            faqs = [[geo.faqFirstQ(locDisplay), geo.faqFirstA(ctx, locDisplay)], ...faqs.slice(1)];
        }
        faqEl.innerHTML = faqs.map(([q, a]) =>
            `<div style="margin-bottom:14px;padding:14px 18px;background:var(--bg);border-radius:10px;border-right:4px solid var(--primary);">
                <div style="font-weight:700;color:var(--primary);margin-bottom:6px;">${q}</div>
                <div style="color:var(--text);font-size:0.95rem;">${a}</div>
            </div>`
        ).join('');
    }

    // ── 7. Related Links (5 items: month cal + year cal + converter + moon + prayer) ──
    const relTitleEl = document.getElementById('hday-related-title');
    if (relTitleEl) relTitleEl.textContent = ex.relatedTitle;

    const relEl = document.getElementById('hday-related');
    if (relEl) {
        let _citySlug2 = '';
        try {
            if (typeof currentEnglishName === 'string' && currentEnglishName) {
                _citySlug2 = currentEnglishName.toLowerCase().trim()
                    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
            }
        } catch (_) {}
        const prayerHref2 = _citySlug2
            ? `${prefix}/prayer-times-in-${_citySlug2}`
            : ((lang === 'ar') ? '/' : (prefix + '/'));
        // Geo-aware prayer + moon labels (city known) — localized via getDisplayCity()
        const _cityDisplay = locDisplay
            || ((typeof getDisplayCity === 'function') ? (getDisplayCity() || '') : '')
            || ((lang === 'ar') ? (currentCity || currentEnglishName || '') : (currentEnglishName || currentCity || ''));
        const _cityKnown = _citySlug2 && _cityDisplay;
        const _prayerLabel = _cityKnown
            ? (isToday ? geo.relPrayer(_cityDisplay) : nt.relPrayerCity(_cityDisplay))
            : ex.relPrayer;
        const _moonLabel = (isToday && _cityKnown) ? geo.relMoon(_cityDisplay) : ex.relMoon;
        // Geo-aware moon URL for today+city: /moon-today-in-{slug}[-{lat}-{lng}]
        let _moonRelHref = `${prefix}/moon-today`;
        if (isToday && _cityKnown) {
            _moonRelHref = `${prefix}/moon-today-in-${_citySlug2}`;
            if (currentLat != null && currentLng != null && isFinite(currentLat) && isFinite(currentLng) && !/loc-/.test(_citySlug2)) {
                _moonRelHref = `${prefix}/moon-today-in-${_citySlug2}-${Number(currentLat).toFixed(4)}-${Number(currentLng).toFixed(4)}`;
            }
        }
        // Only truly-related secondary links here. Month + Year (hierarchy) live above under the Hero.
        const rels = [
            [`${prefix}/dateconverter`,            ex.relConv],
            [_moonRelHref,                         _moonLabel],
            [prayerHref2,                          _prayerLabel],
        ];
        relEl.innerHTML = rels.map(([href, text]) =>
            `<a href="${href}" style="display:inline-block;padding:9px 18px;background:var(--bg);color:var(--primary);border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid var(--border);margin:4px;">${text}</a>`
        ).join('');
    }

    // ── 1b. Hierarchy Navigation (Day → Month → Year) — placed above the fold for crawl priority ──
    const hierEl = document.getElementById('hday-hierarchy');
    if (hierEl) {
        const hier = [
            [hijriMonthUrl(year, month),          ex.relMonth(monthName, year)],
            [`${prefix}/hijri-calendar/${year}`,  ex.relYear(year)],
        ];
        hierEl.innerHTML = hier.map(([href, text]) =>
            `<a href="${href}" style="display:inline-flex;align-items:center;justify-content:center;padding:12px 22px;background:var(--primary);color:#fff;border-radius:10px;text-decoration:none;font-size:0.95rem;font-weight:700;margin:6px;border:1px solid var(--primary);min-height:44px;">${text}</a>`
        ).join('');
    }

    // ── 8. Footer SEO — with inline internal link to the month calendar (anchor variation + crawl depth) ──
    const footerEl = document.getElementById('hday-footer-seo');
    if (footerEl) {
        // Escape user-facing text (country/date strings) before embedding raw HTML
        const _esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const _baseText  = _esc(isGeoToday
            ? geo.footer(ctx, locDisplay)
            : (isToday ? ui.footer(ctx) : nt.footer(ctx)));
        const _linkText  = _esc(isGeoToday
            ? geo.footerLink(monthName, year, locDisplay)
            : ex.footerLink(monthName, year));
        const _linkHref  = _esc(hijriMonthUrl(year, month));
        // Append a linked sentence at the end — clean separator, anchor varies per language
        const _separator = (lang === 'ar' || lang === 'ur') ? ' — ' : ' — ';
        footerEl.innerHTML = `${_baseText}${_separator}<a href="${_linkHref}" style="color:var(--primary);text-decoration:underline;">${_linkText}</a>.`;
    }

    // ── 9. Schema JSON-LD — @graph: BreadcrumbList + WebPage + FAQPage (NO Article — Answer Page) ──
    ['hday-schema-faq','hday-schema-bc','hday-schema-article','hday-schema-graph'].forEach(id => document.getElementById(id)?.remove());

    const _origin    = window.SITE_URL || window.location.origin;
    const _pageUrl   = _origin + window.location.pathname;
    const _calHubUrl = _origin + `${prefix}/hijri-calendar`;
    const _yearUrl   = _origin + `${prefix}/hijri-calendar/${year}`;
    const _monthUrl  = _origin + hijriMonthUrl(year, month);
    const _siteName  = ui.site;
    const _headline  = ui.headline(ctx);
    const _desc      = ui.desc(ctx);
    const _homeUrl   = _origin + ((lang === 'ar') ? '/' : ('/' + lang + '/'));

    // Mirror the visible FAQ: substitute city for country when city known, then swap first pair
    const _faqCtxLd = isGeoToday ? { ...ctx, country: locDisplay, countryLabel: locDisplay } : ctx;
    let _faqSrc = isToday ? ui.faq(_faqCtxLd) : nt.faq(_faqCtxLd);
    if (isGeoToday && _faqSrc.length) {
        _faqSrc = [[geo.faqFirstQ(locDisplay), geo.faqFirstA(ctx, locDisplay)], ..._faqSrc.slice(1)];
    }
    const _faqItems = _faqSrc.map(([q, a]) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a }
    }));

    // BreadcrumbList (geo-aware: insert city hop after Home when today + city known)
    const _bcList = [];
    let _bcPos = 1;
    _bcList.push({ "@type":"ListItem", "position": _bcPos++, "name": ui.home, "item": _homeUrl });
    if (isGeoToday) {
        _bcList.push({ "@type":"ListItem", "position": _bcPos++, "name": locDisplay, "item": _origin + `${prefix}/prayer-times-in-${locSlug}` });
    }
    _bcList.push(
        { "@type":"ListItem", "position": _bcPos++, "name": ui.cal,  "item": _calHubUrl },
        { "@type":"ListItem", "position": _bcPos++, "name": `${year}${hSfx}`, "item": _yearUrl },
        { "@type":"ListItem", "position": _bcPos++, "name": `${monthName} ${year}${hSfx}`, "item": _monthUrl },
        { "@type":"ListItem", "position": _bcPos++, "name": hDate, "item": _pageUrl }
    );

    const hdaySchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${_pageUrl}#breadcrumb`,
                "itemListElement": _bcList
            },
            Object.assign({
                "@type": "WebPage",
                "@id": `${_pageUrl}#webpage`,
                "url": _pageUrl,
                "name": isGeoToday ? geo.schemaName(locDisplay) : _headline,
                "headline": _headline,
                "description": _desc,
                "inLanguage": lang,
                "isPartOf": { "@type":"WebSite", "name": _siteName, "url": _homeUrl },
                "breadcrumb": { "@id": `${_pageUrl}#breadcrumb` }
            }, isGeoToday ? {
                "about": geo.schemaAbout,
                "spatialCoverage": { "@type": "Place", "name": locDisplay }
            } : {}),
            {
                "@type": "FAQPage",
                "@id": `${_pageUrl}#faq`,
                "mainEntity": _faqItems
            }
        ]
    };

    const hdaySchemaScript = document.createElement('script');
    hdaySchemaScript.id   = 'hday-schema-graph';
    hdaySchemaScript.type = 'application/ld+json';
    hdaySchemaScript.textContent = JSON.stringify(hdaySchema);
    document.head.appendChild(hdaySchemaScript);

    // ── 10. SEO Meta — Answer Page → ogType:'website' (not 'article'), geo-aware title when city known ──
    const _seoTitle = isGeoToday ? geo.seoTitle(locDisplay, hDate) : _headline;
    setSEOMeta({ title: _seoTitle, description: _desc, ogType: 'website' });
}

// ========= صفحة التقويم الهجري السنوي /hijri-calendar أو /hijri-calendar/1447 =========
function loadHijriYearPage() {
    const match = window.location.pathname.match(/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar(?:\/(\d{4}))?$/);
    if (!match) return;

    // ── استعادة سياق المدينة إن كان المستخدم قادماً من صفحة مدينة ──
    //   (الشريط الجانبي يحفظ city_hijri-calendar قبل التنقل)
    try {
        const _stash = sessionStorage.getItem('city_hijri-calendar');
        if (_stash) {
            const _p = JSON.parse(_stash);
            if (_p && _p.englishName && _p.name) {
                currentCity         = _p.name         || currentCity;
                currentEnglishName  = _p.englishName  || currentEnglishName;
                currentCountry      = _p.country      || currentCountry;
                currentCountryCode  = _p.countryCode  || currentCountryCode;
                if (typeof _p.lat === 'number')  currentLat = _p.lat;
                if (typeof _p.lng === 'number')  currentLng = _p.lng;
                if (typeof _p.timezone === 'number') currentTimezone = _p.timezone;
                try { if (typeof updateCityDisplay === 'function') updateCityDisplay(); } catch (_) {}
            }
        }
    } catch (_) {}
    // إن لم تُحدَّد السنة في الـ URL → استخدم السنة الهجرية الحالية
    const year   = match[1] ? parseInt(match[1]) : HijriDate.getToday().year;
    const lang   = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const ui     = hyearUi(lang);
    const hijriNames = hijriMonthsFor(lang);
    const prefix = lang === 'ar' ? '' : '/' + lang;
    const hSfx   = hSfxFor(lang);
    const _origin = window.SITE_URL || window.location.origin;
    const _pageUrl = _origin + window.location.pathname;
    const country  = getDisplayCountry();
    const isLeap   = HijriDate.isHijriLeapYear(year);
    const totalYearDays = isLeap ? 355 : 354;
    const ctx = { year, hSfx, country, isLeap, totalYearDays };

    // ── 1. Breadcrumb ─────────────────────────────────────────────
    const bcEl = document.getElementById('hyear-breadcrumbs');
    if (bcEl) {
        const calPath = `${prefix}/hijri-calendar/${year}`;
        const homeUrl = (lang === 'ar') ? '/' : (prefix + '/');
        const _t      = (typeof t === 'function') ? t : (k) => k;
        const homeL   = _t('breadcrumb.home') || ui.home;
        const calL    = ui.cal;
        const yearL   = `${year}${hSfx}`;
        bcEl.innerHTML = _buildHijriBreadcrumbOl([
            { href: homeUrl, text: homeL },
            { href: calPath, text: calL },
            { text: yearL, current: true }
        ]);
    }

    // ── 2. Title & Intro ─────────────────────────────────────────
    const titleEl = document.getElementById('hyear-title');
    if (titleEl) titleEl.textContent = ui.title(ctx);

    const introEl = document.getElementById('hyear-intro');
    if (introEl) introEl.textContent = ui.intro(ctx);

    // ── 2.5 Year Picker ──────────────────────────────────────────
    const yrSel = document.getElementById('hyear-year-select');
    if (yrSel) {
        const todayYear = HijriDate.getToday().year;
        const min = todayYear - 20;
        const max = todayYear + 20;
        let html = '';
        for (let y = min; y <= max; y++) {
            const selected = (y === year) ? ' selected' : '';
            html += `<option value="${y}"${selected}>${y}${hSfx}</option>`;
        }
        yrSel.innerHTML = html;
    }

    // ── 3. Info Cards ─────────────────────────────────────────────
    const infoGrid = document.getElementById('hyear-info-grid');
    if (infoGrid) {
        const leapLabel = isLeap ? ui.leap_yes(totalYearDays) : ui.leap_no(totalYearDays);
        const cards = [
            ['📆', ui.card_labels[0], `${year}${hSfx}`],
            ['📊', ui.card_labels[1], `${totalYearDays} ${ui.days_word}`],
            ['✔️', ui.card_labels[2], leapLabel],
            ['🌙', ui.card_labels[3], ui.months_val],
        ];
        infoGrid.innerHTML = cards.map(([icon, label, value]) =>
            `<div class="info-card"><div class="info-card-label">${icon} ${label}</div><div class="info-card-value">${value}</div></div>`
        ).join('');
    }

    // ── 4. Months Table ───────────────────────────────────────────
    const thMonth = document.getElementById('hyear-th-month');
    const thStart = document.getElementById('hyear-th-start');
    const thEnd   = document.getElementById('hyear-th-end');
    const thDays  = document.getElementById('hyear-th-days');
    if (thMonth) thMonth.textContent = ui.th[0];
    if (thStart) thStart.textContent = ui.th[1];
    if (thEnd)   thEnd.textContent   = ui.th[2];
    if (thDays)  thDays.textContent  = ui.th[3];

    const tableTitleEl = document.getElementById('hyear-table-title');
    if (tableTitleEl) tableTitleEl.textContent = ui.table_title(ctx);

    const tbody = document.getElementById('hyear-table-body');
    if (tbody) {
        tbody.innerHTML = '';
        const _pad2 = (n) => String(n).padStart(2, '0');
        const gSfx = (typeof gSfxFor === 'function') ? gSfxFor(lang) : '';
        for (let m = 1; m <= 12; m++) {
            const mDays   = HijriDate.getDaysInHijriMonth(year, m);
            const gFirst  = HijriDate.toGregorian(year, m, 1);
            const gLast   = HijriDate.toGregorian(year, m, mDays);
            const mName   = hijriNames[m - 1];
            const mUrl    = hijriMonthUrl(year, m);
            const gm1     = gregMonthFor(lang, gFirst.month - 1);
            const gm2     = gregMonthFor(lang, gLast.month - 1);
            const startStr = `${gFirst.day} ${gm1} ${gFirst.year}`;
            const endStr   = `${gLast.day} ${gm2} ${gLast.year}`;
            // Each Gregorian boundary links to its specific Hijri day page (long-tail SEO + UX).
            const startHref = `${prefix}/hijri-date/${year}-${_pad2(m)}-01`;
            const endHref   = `${prefix}/hijri-date/${year}-${_pad2(m)}-${_pad2(mDays)}`;
            const isCurrentMonth = (() => { const h = HijriDate.getToday(); return h.year === year && h.month === m; })();
            const rowBg  = isCurrentMonth ? 'background:var(--primary-light);' : (m % 2 === 0 ? 'background:var(--bg);' : '');
            const lnkClr = isCurrentMonth ? 'color:#fff;font-weight:700;text-decoration:none;' : 'color:var(--primary);text-decoration:none;';
            const txtClr = isCurrentMonth ? 'color:#fff;' : '';
            const td = 'padding:10px 14px;border-bottom:1px solid var(--border);text-align:center;';
            // Localized tooltips: "التاريخ الهجري 1 محرم 1447 هـ الموافق 27 يونيو 2025"
            const startTitle = (typeof ui.day_row_title === 'function')
                ? ui.day_row_title(`1 ${mName} ${year}${hSfx}`, `${gFirst.day} ${gm1} ${gFirst.year}${gSfx}`)
                : '';
            const endTitle   = (typeof ui.day_row_title === 'function')
                ? ui.day_row_title(`${mDays} ${mName} ${year}${hSfx}`, `${gLast.day} ${gm2} ${gLast.year}${gSfx}`)
                : '';
            const startTitleAttr = startTitle ? ` title="${startTitle.replace(/"/g, '&quot;')}"` : '';
            const endTitleAttr   = endTitle   ? ` title="${endTitle.replace(/"/g, '&quot;')}"`   : '';
            tbody.innerHTML += `<tr style="${rowBg}">
                <td style="${td}${txtClr}"><a href="${mUrl}" style="${lnkClr}">${mName} ${year}${hSfx}</a></td>
                <td style="${td}${txtClr}"><a href="${startHref}"${startTitleAttr} style="${lnkClr}">${startStr}</a></td>
                <td style="${td}${txtClr}"><a href="${endHref}"${endTitleAttr} style="${lnkClr}">${endStr}</a></td>
                <td style="${td}${txtClr}"><a href="${mUrl}" style="${lnkClr}">${mDays}</a></td>
            </tr>`;
        }
    }

    // Today-in-year banner — shown only when viewing the current Hijri year
    const todayInYearEl = document.getElementById('hyear-today-in-year');
    if (todayInYearEl) {
        const todayH = HijriDate.getToday();
        if (todayH.year === year && typeof ui.today_in_year === 'function') {
            const _todayMN = hijriNames[todayH.month - 1];
            const _pad2 = (n) => String(n).padStart(2, '0');
            const _todayHref = `${prefix}/hijri-date/${todayH.year}-${_pad2(todayH.month)}-${_pad2(todayH.day)}`;
            todayInYearEl.innerHTML = ui.today_in_year(todayH.day, _todayMN, todayH.year, hSfx, _todayHref);
            todayInYearEl.hidden = false;
        } else {
            todayInYearEl.innerHTML = '';
            todayInYearEl.hidden = true;
        }
    }

    // Month Buttons Grid removed — duplicated the table above. Hierarchy now flows through the table.

    // ── 6. CTA Links ─────────────────────────────────────────────
    const ctaEl = document.getElementById('hyear-cta');
    if (ctaEl) {
        const todayH = HijriDate.getToday();
        const curMonthUrl = hijriMonthUrl(year, todayH.month);
        const curMonthName = hijriNames[todayH.month - 1];
        const ctas = [
            [`${prefix}/today-hijri-date`, ui.cta_today, true],
            [curMonthUrl,                  ui.cta_month(curMonthName, `${year}${hSfx}`), false],
            [`${prefix}/dateconverter`,    ui.cta_converter, false],
        ];
        ctaEl.innerHTML = ctas.map(([href, text, primary]) =>
            `<a href="${href}" style="display:inline-block;padding:10px 20px;background:${primary ? 'var(--primary)' : 'var(--bg)'};color:${primary ? '#fff' : 'var(--primary)'};border-radius:8px;text-decoration:none;font-size:0.9rem;font-weight:${primary ? '700' : '500'};border:1px solid var(--border);">${text}</a>`
        ).join('');
    }

    // Years Navigation — 5-year window (y-2..y+2), current year highlighted
    const yearsTitleEl   = document.getElementById('hyear-years-title');
    const yearsCurrentEl = document.getElementById('hyear-years-current');
    const yearsGridEl    = document.getElementById('hyear-years-grid');
    const yearsAllLinkEl = document.getElementById('hyear-years-all');
    if (yearsTitleEl   && ui.years_title)   yearsTitleEl.textContent = ui.years_title;
    if (yearsCurrentEl && ui.years_current) yearsCurrentEl.innerHTML = ui.years_current(year, hSfx);
    if (yearsGridEl) {
        const yearsWindow = [year - 2, year - 1, year, year + 1, year + 2].filter(y => y >= 1);
        yearsGridEl.innerHTML = yearsWindow.map((y) => {
            const isActive = (y === year);
            const bg       = isActive ? 'var(--primary)' : 'var(--bg)';
            const fg       = isActive ? '#fff'           : 'var(--primary)';
            const wt       = isActive ? 'font-weight:700;' : '';
            const suffix   = (isActive && ui.years_active_suffix) ? ui.years_active_suffix : '';
            return `<a href="${prefix}/hijri-calendar/${y}" style="display:inline-block;padding:8px 16px;background:${bg};color:${fg};border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid var(--border);${wt}">${y}${hSfx}${suffix}</a>`;
        }).join('');
    }
    if (yearsAllLinkEl && ui.years_all_link) {
        yearsAllLinkEl.textContent = ui.years_all_link;
        yearsAllLinkEl.href = `${prefix}/hijri-calendar`;
    }

    // ── 7. FAQ ────────────────────────────────────────────────────
    const faqTitleEl = document.getElementById('hyear-faq-title');
    if (faqTitleEl) faqTitleEl.textContent = ui.faq_title;

    const faqEl = document.getElementById('hyear-faq');
    if (faqEl) {
        const faqs = ui.faq(ctx);
        faqEl.innerHTML = faqs.map(([q, a]) =>
            `<div style="background:var(--bg);border-radius:10px;padding:14px 18px;margin-bottom:10px;">
                <div style="font-weight:700;color:var(--primary);margin-bottom:6px;">${q}</div>
                <div style="color:var(--text);font-size:0.95rem;">${a}</div>
            </div>`
        ).join('');
    }

    // ── 8. SEO Text ───────────────────────────────────────────────
    const seoTitleEl = document.getElementById('hyear-seo-title');
    if (seoTitleEl) seoTitleEl.textContent = ui.seo_title;

    const seoTextEl = document.getElementById('hyear-seo-text');
    if (seoTextEl) seoTextEl.textContent = ui.seo_text(ctx);

    // ── 9. Footer SEO ─────────────────────────────────────────────
    const footerEl = document.getElementById('hyear-footer-seo');
    if (footerEl) footerEl.textContent = ui.footer(ctx);

    // ── 10. Schema JSON-LD ────────────────────────────────────────
    document.getElementById('hyear-schema-graph')?.remove();
    const _siteName = ui.site;
    const _hyearHeadline = ui.headline(ctx);
    const _hyearDesc = ui.meta_desc(ctx);
    const _homeUrl = _origin + ((lang === 'ar') ? '/' : ('/' + lang + '/'));
    const _hyearNowIso = new Date().toISOString();
    const _faqItems = ui.faq(ctx).map(([q, a]) => ({
        "@type":"Question", "name": q,
        "acceptedAnswer": { "@type":"Answer", "text": a }
    }));
    const hyearSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${_pageUrl}#breadcrumb`,
                "itemListElement": [
                    { "@type":"ListItem","position":1, "name": ui.home, "item": _homeUrl },
                    { "@type":"ListItem","position":2, "name": ui.cal,  "item": _origin+`${prefix}/hijri-calendar` },
                    { "@type":"ListItem","position":3, "name": `${year}${hSfx}`, "item": _pageUrl }
                ]
            },
            {
                "@type": "Article",
                "@id": `${_pageUrl}#article`,
                "headline": _hyearHeadline,
                "description": _hyearDesc,
                "inLanguage": lang,
                "datePublished": _hyearNowIso,
                "dateModified": _hyearNowIso,
                "mainEntityOfPage": { "@id": `${_pageUrl}#webpage` },
                "author": { "@type": "Organization", "name": _siteName, "url": _homeUrl },
                "publisher": { "@type": "Organization", "name": _siteName, "url": _homeUrl }
            },
            {
                "@type": "WebPage",
                "@id": `${_pageUrl}#webpage`,
                "url": _pageUrl,
                "name": ui.meta_title(ctx),
                "headline": _hyearHeadline,
                "description": _hyearDesc,
                "inLanguage": lang,
                "isPartOf": { "@type":"WebSite","name":_siteName,"url":_homeUrl },
                "breadcrumb": { "@id":`${_pageUrl}#breadcrumb` }
            },
            {
                "@type": "FAQPage",
                "@id": `${_pageUrl}#faq`,
                "mainEntity": _faqItems
            }
        ]
    };
    const hyearSchemaScript = document.createElement('script');
    hyearSchemaScript.id   = 'hyear-schema-graph';
    hyearSchemaScript.type = 'application/ld+json';
    hyearSchemaScript.textContent = JSON.stringify(hyearSchema);
    document.head.appendChild(hyearSchemaScript);

    // ── 11. SEO Meta (title + description + canonical + hreflang + OG + Twitter) ──
    setSEOMeta({
        title: ui.meta_title(ctx),
        description: _hyearDesc,
        ogType: 'article'
    });
}

// ========= صفحة التقويم الهجري الشهري =========
function loadHijriMonthPage() {
    const match = window.location.pathname.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar\/(\d{4})-(\d{2})$/);
    if (!match) return;

    // ── استعادة سياق المدينة إن كان المستخدم قادماً من صفحة مدينة ──
    try {
        const _stash = sessionStorage.getItem('city_hijri-calendar');
        if (_stash) {
            const _p = JSON.parse(_stash);
            if (_p && _p.englishName && _p.name) {
                currentCity         = _p.name         || currentCity;
                currentEnglishName  = _p.englishName  || currentEnglishName;
                currentCountry      = _p.country      || currentCountry;
                currentCountryCode  = _p.countryCode  || currentCountryCode;
                if (typeof _p.lat === 'number')  currentLat = _p.lat;
                if (typeof _p.lng === 'number')  currentLng = _p.lng;
                if (typeof _p.timezone === 'number') currentTimezone = _p.timezone;
                try { if (typeof updateCityDisplay === 'function') updateCityDisplay(); } catch (_) {}
            }
        }
    } catch (_) {}

    const year  = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    if (month < 1 || month > 12) return;
    const monthIdx = month - 1;

    const lang       = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const prefix     = (lang && lang !== 'ar') ? '/' + lang : '';
    const hijriNames = hijriMonthsFor(lang);
    const monthName  = hijriNames[monthIdx];
    const totalDays  = HijriDate.getDaysInHijriMonth(year, month);
    const isLeap     = HijriDate.isHijriLeapYear(year);
    const hSfx       = hSfxFor(lang);
    const gSfx       = gSfxFor(lang);
    const gregFirst  = HijriDate.toGregorian(year, month, 1);
    const gregLast   = HijriDate.toGregorian(year, month, totalDays);
    const todayH     = HijriDate.getToday();
    const country    = getDisplayCountry();
    const _origin    = window.SITE_URL || window.location.origin;
    const ui         = hmonthUi(lang);

    const gm1 = gregMonthFor(lang, gregFirst.month - 1);
    const gm2 = gregMonthFor(lang, gregLast.month - 1);
    const gRange = gregFirst.month !== gregLast.month ? `${gm1} – ${gm2} ${gregLast.year}` : `${gm1} ${gregLast.year}`;
    const gFirstStr = `${gregFirst.day} ${gm1} ${gregFirst.year}`;
    const gLastStr  = `${gregLast.day} ${gm2} ${gregLast.year}`;

    // URLs that the footer paragraph embeds as internal links (crawl-equity + UX)
    const _hmTodayUrl = `${prefix}/today-hijri-date`;
    const _hmYearUrl  = `${prefix}/hijri-calendar/${year}`;
    const ctx = { monthName, year, hSfx, gSfx, totalDays, isLeap, gRange, gFirstStr, gLastStr, country,
                  todayUrl: _hmTodayUrl, yearUrl: _hmYearUrl };

    // 1. Breadcrumbs
    const bcEl = document.getElementById('hmonth-breadcrumbs');
    if (bcEl) {
        const calPath  = `${prefix}/hijri-calendar`;
        const yearPath = `${prefix}/hijri-calendar/${year}`;
        const homeUrl  = (lang === 'ar') ? '/' : (prefix + '/');
        bcEl.innerHTML = _buildHijriBreadcrumbOl([
            { href: homeUrl, text: ui.home },
            { href: calPath, text: ui.cal },
            { href: yearPath, text: `${year}${hSfx}` },
            { text: `${monthName} ${year}${hSfx}`, current: true }
        ]);
    }

    // 2. Title & Subtitle (Answer-page style: clean H1, descriptive subtitle)
    const titleEl    = document.getElementById('hmonth-title');
    const subtitleEl = document.getElementById('hmonth-subtitle');
    if (titleEl)    titleEl.textContent    = ui.title(ctx);
    if (subtitleEl) subtitleEl.textContent = ui.subtitle(ctx);

    // Intro element is removed from the new skeleton. Keep defensive cleanup in case legacy DOM exists.
    const introEl = document.getElementById('hmonth-intro');
    if (introEl) { introEl.textContent = ''; introEl.hidden = true; }

    // 2b. Section headings + table column headers (localized)
    const infoTitleEl  = document.getElementById('hmonth-info-title');
    const daysTitleEl  = document.getElementById('hmonth-days-title');
    const linksTitleEl = document.getElementById('hmonth-links-title');
    const thHijriEl    = document.getElementById('hmonth-th-hijri');
    const thGregEl     = document.getElementById('hmonth-th-greg');
    if (infoTitleEl  && ui.section_info)  infoTitleEl.textContent  = ui.section_info;
    if (daysTitleEl  && ui.section_days)  daysTitleEl.textContent  = ui.section_days;
    if (linksTitleEl && ui.section_links) linksTitleEl.textContent = ui.section_links;
    if (thHijriEl    && ui.th_hijri)      thHijriEl.textContent    = ui.th_hijri;
    if (thGregEl     && ui.th_greg)       thGregEl.textContent     = ui.th_greg;

    // 3. Info Cards — reduced to 3 essential facts: days count, start (Gregorian), end (Gregorian)
    const gridEl = document.getElementById('hmonth-info-grid');
    if (gridEl) {
        const cards = [
            [ui.card_labels[0], ui.days_word_n(totalDays)],
            [ui.card_labels[1], `${gregFirst.day} ${gm1} ${gregFirst.year}`],
            [ui.card_labels[2], `${gregLast.day} ${gm2} ${gregLast.year}`],
        ];
        gridEl.innerHTML = cards.map(([label, value]) =>
            `<div class="info-card"><div class="info-card-label">${label}</div><div class="info-card-value">${value}</div></div>`
        ).join('');
    }

    // 3b. "Today in this month" indicator — only when the rendered month IS the current hijri month.
    // The date itself is a link to the day page (hijri-date/YYYY-MM-DD).
    const todayInMonthEl = document.getElementById('hmonth-today-in-month');
    if (todayInMonthEl) {
        const _isCurrentMonth = (todayH.year === year && todayH.month === month);
        if (_isCurrentMonth && typeof ui.today_in_month === 'function') {
            const _todayMN   = hijriNames[todayH.month - 1];
            const _todayHref = hijriDayUrl(todayH.year, todayH.month, todayH.day);
            todayInMonthEl.innerHTML = ui.today_in_month(todayH.day, _todayMN, todayH.year, hSfx, _todayHref);
            todayInMonthEl.hidden = false;
        } else {
            todayInMonthEl.innerHTML = '';
            todayInMonthEl.hidden = true;
        }
    }

    // 5. Full Calendar Table
    const tbody = document.getElementById('hmonth-table-body');
    if (tbody) {
        tbody.innerHTML = '';
        for (let d = 1; d <= totalDays; d++) {
            const greg    = HijriDate.toGregorian(year, month, d);
            const isToday = (d === todayH.day && month === todayH.month && year === todayH.year);
            const tr      = document.createElement('tr');
            tr.style.cssText = isToday ? 'background:var(--primary-light);color:#fff;font-weight:700;' : (d % 2 === 0 ? 'background:var(--bg);' : '');
            const dayUrl    = hijriDayUrl(year, month, d);
            const linkStyle = isToday ? 'color:#fff;text-decoration:none;font-weight:700;' : 'color:var(--primary);text-decoration:none;';
            const dowIdx    = new Date(greg.year, greg.month - 1, greg.day).getDay();
            const dayName   = dayNameFor(lang, dowIdx);
            const gmLoc     = gregMonthFor(lang, greg.month - 1);
            // Long-tail SEO: per-row title="التاريخ الهجري {hDate} الموافق {gDate}"
            const _hDate    = `${d} ${monthName} ${year}${hSfx}`;
            const _gDate    = `${greg.day} ${gmLoc} ${greg.year}${gSfx}`;
            const _rowTitle = (typeof ui.day_row_title === 'function') ? ui.day_row_title(_hDate, _gDate) : '';
            const _titleAttr = _rowTitle ? ` title="${_rowTitle.replace(/"/g, '&quot;')}"` : '';
            tr.innerHTML = `
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;">
                    <a href="${dayUrl}"${_titleAttr} style="${linkStyle}">${d} ${monthName} ${year}${hSfx} (${dayName})</a>
                </td>
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;">
                    <a href="${dayUrl}"${_titleAttr} style="${linkStyle}">${dayName} ${greg.day} ${gmLoc} ${greg.year}</a>
                </td>`;
            tbody.appendChild(tr);
        }
    }

    // 6. Related Links — 4 ecosystem anchors (today + year calendar + converter + moon today)
    const linksEl = document.getElementById('hmonth-links');
    if (linksEl) {
        const links = [
            [`${prefix}/today-hijri-date`, ui.link_today],
            [`${prefix}/hijri-calendar/${year}`, ui.link_year(year, hSfx)],
            [`${prefix}/dateconverter`, ui.link_convert],
            [`${prefix}/moon-today`, ui.link_moon],
        ];
        linksEl.innerHTML = links.map(([href, text]) =>
            `<a href="${href}" style="display:inline-block;padding:9px 18px;background:var(--primary);color:#fff;border-radius:8px;text-decoration:none;font-size:0.9rem;">${text}</a>`
        ).join('');
    }

    // 5b. Days summary sentence (above table)
    const daysSumEl = document.getElementById('hmonth-days-summary');
    if (daysSumEl) daysSumEl.textContent = ui.days_summary(ctx);

    // 7. Other Months
    const otherEl      = document.getElementById('hmonth-other-months');
    const otherTitleEl = document.getElementById('hmonth-other-months-title');
    if (otherTitleEl) otherTitleEl.textContent = ui.other_months_title(ctx);

    if (otherEl) {
        // All 12 months of the current Hijri year, in calendar order (1 → 12).
        // Each card: single-line "اسم الشهر 1447 هـ" — current month highlighted + aria-current + (الحالي) suffix.
        const items = [];
        for (let mo = 1; mo <= 12; mo++) items.push(mo);
        const activeSfx = ui.other_months_active_suffix || '';
        otherEl.innerHTML = items.map((mo) => {
            const mName    = hijriNames[mo-1];
            const isActive = (mo === month);
            const bg       = isActive ? 'var(--primary)' : 'var(--bg)';
            const fg       = isActive ? '#fff'           : 'var(--primary)';
            const fw       = isActive ? '700' : '500';
            const aria     = isActive ? ' aria-current="true"' : '';
            const sfx      = isActive ? activeSfx : '';
            return `<a href="${hijriMonthUrl(year, mo)}"${aria} style="display:block;padding:12px 10px;background:${bg};color:${fg};border-radius:10px;text-decoration:none;font-size:0.9rem;font-weight:${fw};text-align:center;border:1px solid var(--border);">${mName} ${year}${hSfx}${sfx}</a>`;
        }).join('');
    }

    // 7b. Years Navigation — 5-year window (y-2 .. y+2), current year highlighted, "full calendar" link below.
    const yearsTitleEl   = document.getElementById('hmonth-years-title');
    const yearsCurrentEl = document.getElementById('hmonth-years-current');
    const yearsGridEl    = document.getElementById('hmonth-years-grid');
    const yearsAllLinkEl = document.getElementById('hmonth-years-all');
    if (yearsTitleEl   && ui.years_title)   yearsTitleEl.textContent = ui.years_title;
    if (yearsCurrentEl && ui.years_current) yearsCurrentEl.innerHTML = ui.years_current(year, hSfx);
    if (yearsGridEl) {
        const yearsWindow = [year - 2, year - 1, year, year + 1, year + 2].filter(y => y >= 1);
        yearsGridEl.innerHTML = yearsWindow.map((y) => {
            const isActive = (y === year);
            const bg       = isActive ? 'var(--primary)' : 'var(--bg)';
            const fg       = isActive ? '#fff'           : 'var(--primary)';
            const wt       = isActive ? 'font-weight:700;' : '';
            const suffix   = (isActive && ui.years_active_suffix) ? ui.years_active_suffix : '';
            return `<a href="${prefix}/hijri-calendar/${y}" style="display:inline-block;padding:8px 16px;background:${bg};color:${fg};border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid var(--border);${wt}">${y}${hSfx}${suffix}</a>`;
        }).join('');
    }
    if (yearsAllLinkEl && ui.years_all_link) {
        yearsAllLinkEl.textContent = ui.years_all_link;
        yearsAllLinkEl.href = `${prefix}/hijri-calendar`;
    }

    // 8. Prev / Next Month Navigation
    const navEl = document.getElementById('hmonth-nav');
    if (navEl) {
        let prevM = month - 1, prevY = year, nextM = month + 1, nextY = year;
        if (prevM < 1)  { prevM = 12; prevY--; }
        if (nextM > 12) { nextM = 1;  nextY++; }
        const prevName = hijriNames[prevM-1];
        const nextName = hijriNames[nextM-1];
        const prevUrl  = hijriMonthUrl(prevY, prevM);
        const nextUrl  = hijriMonthUrl(nextY, nextM);
        navEl.innerHTML = `
            <a href="${prevUrl}" style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text-light);">← ${ui.prev_label}</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${prevName} ${prevY}${hSfx}</span>
            </a>
            <a href="${nextUrl}" style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text-light);">${ui.next_label} →</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${nextName} ${nextY}${hSfx}</span>
            </a>`;
    }

    // 9. Footer SEO — dynamic paragraph with inline internal links (today + year calendar)
    const footerEl = document.getElementById('hmonth-footer-seo');
    if (footerEl) footerEl.innerHTML = ui.footer(ctx);

    // 10. Schema JSON-LD — @graph: BreadcrumbList + Article + WebPage + FAQPage
    document.getElementById('hmonth-schema-graph')?.remove();
    const pageUrl_  = _origin + window.location.pathname;
    const calUrl_   = _origin + `${prefix}/hijri-calendar`;
    const yearUrl_  = _origin + `${prefix}/hijri-calendar/${year}`;
    const siteName_ = ui.site;
    const _faqItems = ui.faq(ctx).map(([q, a]) => ({
        "@type": "Question", "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a }
    }));
    const schemaGraph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl_}#breadcrumb`,
                "itemListElement": [
                    {"@type":"ListItem","position":1,"name": ui.home,                     "item": _origin + (lang==='ar' ? '/' : (prefix+'/'))},
                    {"@type":"ListItem","position":2,"name": ui.cal,                      "item": calUrl_},
                    {"@type":"ListItem","position":3,"name": `${year}${hSfx}`,            "item": yearUrl_},
                    {"@type":"ListItem","position":4,"name": `${monthName} ${year}${hSfx}`,"item": pageUrl_}
                ]
            },
            {
                "@type": "WebPage",
                "@id": `${pageUrl_}#webpage`,
                "url": pageUrl_,
                "name": ui.headline(ctx),
                "headline": ui.headline(ctx),
                "description": ui.meta_desc(ctx),
                "inLanguage": lang,
                "isPartOf": {
                    "@type": "WebSite",
                    "name": siteName_,
                    "url": _origin + (lang==='ar' ? '/' : (prefix+'/'))
                },
                "breadcrumb": {"@id": `${pageUrl_}#breadcrumb`},
                "about": { "@type": "Thing", "name": ui.about(ctx) },
                "mainEntity": {
                    "@type": "Dataset",
                    "name": ui.dataset_name(ctx),
                    "description": ui.dataset_desc(ctx)
                }
            },
            {
                "@type": "FAQPage",
                "@id": `${pageUrl_}#faq`,
                "mainEntity": _faqItems
            }
        ]
    };

    const schemaScriptM = document.createElement('script');
    schemaScriptM.id   = 'hmonth-schema-graph';
    schemaScriptM.type = 'application/ld+json';
    schemaScriptM.textContent = JSON.stringify(schemaGraph);
    document.head.appendChild(schemaScriptM);

    // ── 11. SEO Meta (title + description + canonical + hreflang + OG + Twitter) ──
    setSEOMeta({
        title: ui.meta_title(ctx),
        description: ui.meta_desc(ctx),
        ogType: 'website'
    });
}

// ========= تحميل أحداث اليوم لصفحة اليوم الفردي =========
async function loadHijriDayOTD(day, monthName) {
    const lang      = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const loadingEl = document.getElementById('hday-otd-loading');
    const listEl    = document.getElementById('hday-otd-list');
    if (!loadingEl || !listEl) return;
    loadingEl.style.display = 'block';
    listEl.style.display    = 'none';
    listEl.innerHTML        = '';

    try {
        const url = window.location.protocol === 'file:'
            ? `https://ar.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(day + ' ' + monthName)}&prop=wikitext&format=json&origin=*`
            : `/api/wiki-onthisday?day=${day}&month=${encodeURIComponent(monthName)}`;

        const res  = await fetch(url);
        const data = await res.json();
        let events = data.events || [];

        if (!events.length && data?.parse?.wikitext) {
            const wikitext = data.parse.wikitext['*'] || '';
            const eventsMatch = wikitext.match(/==\s*أحداث\s*==([\s\S]*?)(?:==|$)/);
            const raw = eventsMatch ? eventsMatch[1] : '';
            for (const line of raw.split('\n')) {
                const m = line.match(/^\*+\s*(.*)/);
                if (!m) continue;
                let text = m[1].replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g,'$1').replace(/\{\{[^}]*\}\}/g,'').replace(/<[^>]+>/g,'').replace(/'{2,}/g,'').trim();
                if (text.length > 10) events.push({ text });
            }
        }

        const seen = new Set();
        events = events.filter(ev => { if (seen.has(ev.text)) return false; seen.add(ev.text); return true; });

        const getHijriYear = text => { const m = text.match(/^(\d{1,4})\s*هـ/); return m ? parseInt(m[1]) : null; };
        const finalEvents  = events.filter(ev => { if (!ev.text) return false; const y = getHijriYear(ev.text); return y !== null && y <= 897; });

        if (!finalEvents.length) {
            loadingEl.textContent = lang !== 'ar' ? 'No events found.' : 'لا توجد أحداث متاحة.';
            return;
        }

        finalEvents.slice(0, 20).forEach(ev => {
            const li = document.createElement('li');
            const text = ev.text || '';
            // يدعم كل أنواع الفواصل العربية والإنجليزية:
            // - hyphen-minus, – en-dash, — em-dash, ـ Arabic tatweel, − minus
            const yearMatch = text.match(/^(\d{1,4})\s*هـ\s*[\-–—ـ−:]+\s*(.*)/s);
            if (yearMatch) {
                const year2  = yearMatch[1];
                const detail = yearMatch[2].trim();
                const typeMap = {
                    'مواليد': { cls:'birth', label: lang !== 'ar' ? 'Birth' : 'ولادة' },
                    'وفيات':  { cls:'death', label: lang !== 'ar' ? 'Death' : 'وفاة' }
                };
                const badge  = typeMap[ev.type] || { cls:'event', label: lang !== 'ar' ? 'Historical event' : 'حدث تاريخي' };
                li.innerHTML = `<strong class="otd-year">${year2} هـ</strong><span class="otd-badge ${badge.cls}">${badge.label}</span><span class="otd-text">${detail}</span>`;
                if (ev.article && (ev.type === 'مواليد' || ev.type === 'وفيات')) {
                    renderBio(li, ev.article, lang);
                }
            } else {
                // محاولة استخراج السنة دون فاصل (نص مباشر بعد "هـ")
                const altMatch = text.match(/^(\d{1,4})\s*هـ\s+(.*)/s);
                if (altMatch) {
                    const year2  = altMatch[1];
                    const detail = altMatch[2].trim();
                    const badge  = { cls:'event', label: lang !== 'ar' ? 'Historical event' : 'حدث تاريخي' };
                    li.innerHTML = `<strong class="otd-year">${year2} هـ</strong><span class="otd-badge ${badge.cls}">${badge.label}</span><span class="otd-text">${detail}</span>`;
                } else {
                    li.textContent = text;
                }
            }
            listEl.appendChild(li);
        });

        loadingEl.style.display = 'none';
        listEl.style.display    = 'block';
    } catch(e) {
        loadingEl.textContent = lang !== 'ar' ? 'Failed to load events.' : 'تعذّر تحميل الأحداث.';
    }
}

// ========= أبرز أحداث اليوم من ويكيبيديا =========
// كلمات مفتاحية تدل على الأحداث الإسلامية والعربية
const _islamicKeywords = [
    'إسلام','مسلم','مسلمي','خليف','سلطان','أمير المؤمنين','إمار','عثمان','أموي','عباس','فاطم',
    'فتح','غزو','معركة','هجر','صلح','بيعة','النبي','الرسول','صحاب','قرآن','مسجد',
    'مكة','المدينة المنورة','بغداد','دمشق','القدس','الأندلس','الحجاز','الخلافة',
    'الدولة العثمانية','الدولة الأموية','الدولة العباسية','الدولة الفاطمية',
    'علماء الإسلام','فقيه','الإمام','الفتح الإسلامي','الجيش الإسلامي',
    'حاكم مصر','أمير','خليفة'
];
// كلمات تدل على أحداث غير إسلامية بامتياز
const _nonIslamicKeywords = [
    'فرنسا','أمريكا','أمريكية','الولايات المتحدة','بريطانيا','روسيا','إسرائيل',
    'نابليون','اليهود','الكنيسة','أوروبا','الناتو','المحكمة الأمريكية'
];

// ====== مساعد عرض الترجمة المختصرة للشخصيات ======
function renderBio(li, article, lang) {
    const bioEl = document.createElement('p');
    bioEl.className = 'otd-bio';
    bioEl.textContent = '...';
    li.appendChild(bioEl);
    const summaryUrl = window.location.protocol === 'file:'
        ? `https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article)}`
        : `/api/wiki-summary?title=${encodeURIComponent(article)}`;
    fetch(summaryUrl).then(r => r.json()).then(s => {
        const full = (s.extract || s.description || '').trim();
        if (!full) { bioEl.remove(); return; }
        const SHORT = 150;
        const isLong = full.length > SHORT;
        bioEl.textContent = isLong ? full.substring(0, SHORT) + '…' : full;
        if (isLong) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'otd-bio-toggle';
            toggleBtn.textContent = lang !== 'ar' ? 'Show more' : 'أظهر المزيد';
            let expanded = false;
            toggleBtn.addEventListener('click', () => {
                expanded = !expanded;
                bioEl.textContent = expanded ? full : full.substring(0, SHORT) + '…';
                toggleBtn.textContent = expanded
                    ? (lang !== 'ar' ? 'Show less' : 'أظهر أقل')
                    : (lang !== 'ar' ? 'Show more' : 'أظهر المزيد');
            });
            bioEl.after(toggleBtn);
        }
    }).catch(() => bioEl.remove());
}

let _wikiOTDLoaded = false;
async function loadWikiOTD() {
    if (_wikiOTDLoaded) return;
    _wikiOTDLoaded = true;
    const hijri = HijriDate.getToday();
    const hijriMonthName = HijriDate.hijriMonths[hijri.month - 1];
    const lang  = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';

    const loadingEl = document.getElementById('wiki-otd-loading');
    const listEl    = document.getElementById('wiki-otd-list');
    if (!loadingEl || !listEl) { _wikiOTDLoaded = false; return; }

    loadingEl.style.display = 'block';
    listEl.style.display    = 'none';
    listEl.innerHTML        = '';

    try {
        const url = window.location.protocol === 'file:'
            ? `https://ar.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(hijri.day + ' ' + hijriMonthName)}&prop=wikitext&format=json&origin=*`
            : `/api/wiki-onthisday?day=${hijri.day}&month=${encodeURIComponent(hijriMonthName)}`;

        const res  = await fetch(url);
        const data = await res.json();

        let events = data.events || [];
        if (!events.length && data?.parse?.wikitext) {
            const wikitext = data.parse.wikitext['*'] || '';
            const eventsMatch = wikitext.match(/==\s*أحداث\s*==([\s\S]*?)(?:==|$)/);
            const raw = eventsMatch ? eventsMatch[1] : '';
            for (const line of raw.split('\n')) {
                const m = line.match(/^\*+\s*(.*)/);
                if (!m) continue;
                let text = m[1].replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g,'$1').replace(/\{\{[^}]*\}\}/g,'').replace(/<[^>]+>/g,'').replace(/'{2,}/g,'').trim();
                if (text.length > 10) events.push({ text });
            }
        }

        // إزالة المكررات
        const seen = new Set();
        events = events.filter(ev => {
            if (seen.has(ev.text)) return false;
            seen.add(ev.text); return true;
        });

        // استخراج السنة الهجرية من نص الحدث
        const getHijriYear = text => {
            const m = text.match(/^(\d{1,4})\s*هـ/);
            return m ? parseInt(m[1]) : null;
        };

        // فلتر: أحداث حتى سقوط الأندلس (897 هـ)
        const ANDALUSIA_FALL = 897;
        const finalEvents = events.filter(ev => {
            if (!ev.text) return false;
            const year = getHijriYear(ev.text);
            return year !== null && year <= ANDALUSIA_FALL;
        });

        if (!finalEvents.length) {
            loadingEl.textContent = lang !== 'ar' ? 'No events found.' : 'لا توجد أحداث متاحة.';
            _wikiOTDLoaded = false;
            return;
        }

        finalEvents.slice(0, 20).forEach(ev => {
            const li = document.createElement('li');
            const text = ev.text || '';
            // استخرج السنة من بداية النص (مثل "310 هـ - ...")
            const yearMatch = text.match(/^(\d{1,4})\s*هـ\s*[-–]\s*(.*)/s);
            if (yearMatch) {
                const year    = yearMatch[1];
                const detail  = yearMatch[2].trim();
                const typeMap = { 'مواليد': { cls: 'birth', label: 'ولادة' }, 'وفيات': { cls: 'death', label: 'وفاة' } };
                const badge   = typeMap[ev.type] || { cls: 'event', label: 'حدث تاريخي:' };
                li.innerHTML  = `<strong class="otd-year">${year} هـ</strong><span class="otd-badge ${badge.cls}">${badge.label}</span>${detail}`;
                // جلب تفاصيل الشخص من ويكيبيديا للمواليد والوفيات
                if (ev.article && (ev.type === 'مواليد' || ev.type === 'وفيات')) {
                    renderBio(li, ev.article, lang);
                }
            } else {
                li.textContent = text;
            }
            listEl.appendChild(li);
        });

        loadingEl.style.display = 'none';
        listEl.style.display    = 'block';
    } catch(e) {
        loadingEl.textContent = lang !== 'ar' ? 'Failed to load events.' : 'تعذّر تحميل الأحداث.';
        _wikiOTDLoaded = false;
    }
}

// ========= تحويل التاريخ =========
function initDateConverter() {
    // FIX: امسح الخيارات قبل الإضافة (idempotent) — يمنع تكرار الأشهر إن استُدعيت
    // الدالّة أكثر من مرّة (تغيير لغة، إعادة تهيئة، إلخ.)
    // ملء الأشهر الميلادية — مع رقم الشهر للوضوح
    const gSelect = document.getElementById('conv-g-month');
    if (gSelect) {
        gSelect.innerHTML = '';
        HijriDate.gregorianMonths.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i + 1;
            opt.textContent = `${i + 1} - ${m}`;
            gSelect.appendChild(opt);
        });
    }

    // ملء الأشهر الهجرية — مع رقم الشهر للوضوح
    const hSelect = document.getElementById('conv-h-month');
    if (hSelect) {
        hSelect.innerHTML = '';
        HijriDate.hijriMonths.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i + 1;
            opt.textContent = `${i + 1} - ${m}`;
            hSelect.appendChild(opt);
        });
    }

    // ملء الأشهر الشمسية (الأبراج للعربية والأردو، الأسماء الفارسية لباقي اللغات)
    const sSelect = document.getElementById('conv-s-month');
    if (sSelect) {
        sSelect.innerHTML = '';
        const _tx = (k, fb) => ((typeof t === 'function') ? t(k) : fb);
        for (let i = 0; i < 12; i++) {
            const localized = _tx('jmonth.' + (i + 1), _jalaliMonths[i]);
            const opt = document.createElement('option');
            opt.value = i + 1;
            // أظهر الرقم + التسمية المترجمة + الاسم الفارسي الأصلي كمرجع ثابت
            opt.textContent = `${i + 1} - ${localized} - ${_jalaliMonthsOriginal[i]}`;
            sSelect.appendChild(opt);
        }
    }

    // تعيين التاريخ الحالي
    const now = new Date();
    document.getElementById('conv-g-day').value = now.getDate();
    document.getElementById('conv-g-month').value = now.getMonth() + 1;
    document.getElementById('conv-g-year').value = now.getFullYear();

    const hijri = HijriDate.getToday();
    document.getElementById('conv-h-day').value = hijri.day;
    document.getElementById('conv-h-month').value = hijri.month;
    document.getElementById('conv-h-year').value = hijri.year;

    const todaySolar = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    if (document.getElementById('conv-s-day')) {
        document.getElementById('conv-s-day').value = todaySolar.day;
        document.getElementById('conv-s-month').value = todaySolar.month;
        document.getElementById('conv-s-year').value = todaySolar.year;
    }

    convertToHijri();
    convertToGreg();
    convertFromSolar();
}

// ===== تحويل ميلادي → شمسي (جلالي) وعكسه =====
const _jalaliMonths = ['حمل','ثور','جوزا','سرطان','أسد','سنبلة','ميزان','عقرب','قوس','جدي','دلو','حوت'];
const _jalaliMonthsEn = ['Hamal','Sawr','Jawza','Saratan','Asad','Sunbula','Mizan','Aqrab','Qaws','Jadi','Dalw','Hut'];
const _jalaliMonthsOriginal = ['Farvardin','Ordibehesht','Khordad','Tir','Mordad','Shahrivar','Mehr','Aban','Azar','Dey','Bahman','Esfand'];

function gregorianToJalali(gy, gm, gd) {
    const g_y = gy - 1600, g_m = gm - 1, g_d = gd - 1;
    const leap = (g_y % 4 === 0 && g_y % 100 !== 0) || g_y % 400 === 0;
    const gMonthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let g_day_no = 365 * g_y + Math.floor((g_y + 3) / 4) - Math.floor((g_y + 99) / 100) + Math.floor((g_y + 399) / 400);
    for (let i = 0; i < g_m; i++) g_day_no += gMonthDays[i];
    g_day_no += g_d;
    let j_day_no = g_day_no - 79;
    const j_np = Math.floor(j_day_no / 12053);
    j_day_no %= 12053;
    let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
    j_day_no %= 1461;
    if (j_day_no >= 366) { jy += Math.floor((j_day_no - 1) / 365); j_day_no = (j_day_no - 1) % 365; }
    let jm = 0;
    const jMD = [31,31,31,31,31,31,30,30,30,30,30,29];
    for (let i = 0; i < 11 && j_day_no >= jMD[i]; i++) { j_day_no -= jMD[i]; jm++; }
    return { year: jy, month: jm + 1, day: j_day_no + 1 };
}

function jalaliToGregorian(jy, jm, jd) {
    jy -= 979;
    jm -= 1;
    jd -= 1;
    let j_day_no = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4);
    const jMD = [31,31,31,31,31,31,30,30,30,30,30,29];
    for (let i = 0; i < jm; i++) j_day_no += jMD[i];
    j_day_no += jd;
    let g_day_no = j_day_no + 79;
    let gy = 1600 + 400 * Math.floor(g_day_no / 146097);
    g_day_no %= 146097;
    let leap = true;
    if (g_day_no >= 36525) { g_day_no--; gy += 100 * Math.floor(g_day_no / 36524); g_day_no %= 36524; if (g_day_no >= 365) g_day_no++; else leap = false; }
    gy += 4 * Math.floor(g_day_no / 1461);
    g_day_no %= 1461;
    if (g_day_no >= 366) { leap = false; g_day_no--; gy += Math.floor(g_day_no / 365); g_day_no %= 365; }
    const gMD = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 0;
    for (let i = 0; i < 12 && g_day_no >= gMD[i]; i++) { g_day_no -= gMD[i]; gm++; }
    return { year: gy, month: gm + 1, day: g_day_no + 1 };
}

function buildConvSummaryHTML(gy, gm, gd, hy, hm, hd, resultType = 'hijri') {
    const _lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const _t    = (k, fallback) => ((typeof t === 'function') ? t(k) : fallback);
    const gDate = new Date(gy, gm - 1, gd);

    // أيام الأسبوع / الأشهر / اللواحق — كلها من i18n للغات الخمس
    const dayName = _t('wday.' + gDate.getDay(), HijriDate.dayNames[gDate.getDay()]);
    const hSfx    = _t('date.hijri_suffix', ' هـ');
    const gSfx    = _t('date.greg_suffix',  ' م');
    const sSfx    = _t('date.solar_suffix', ' ش');
    const hMonths = Array.from({length:12}, (_, i) => _t('hmonth.' + (i+1), HijriDate.hijriMonths[i]));
    const gMonths = Array.from({length:12}, (_, i) => _t('gmonth.' + (i+1), HijriDate.gregorianMonths[i]));
    const jMonths = Array.from({length:12}, (_, i) => _t('jmonth.' + (i+1), _jalaliMonths[i]));
    const yesTxt  = _t('converter.yes', 'نعم ✓');
    const noTxt   = _t('converter.no',  'لا ✗');

    const hijriText  = `${dayName} ${hd} ${hMonths[hm - 1]} ${hy}${hSfx}`;
    const hijriNums  = `${hd}/${hm}/${hy}`;
    const gregText   = `${dayName} ${gd} ${gMonths[gm-1]} ${gy}${gSfx}`;
    const gregNums   = `${gd}/${gm}/${gy}`;
    const isHijriLeap = HijriDate.isHijriLeapYear(hy);
    const isGregLeap  = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
    const hijriLeapText = `${hy}${hSfx} — ${isHijriLeap ? yesTxt : noTxt}`;
    const gregLeapText  = `${gy}${gSfx} — ${isGregLeap  ? yesTxt : noTxt}`;
    const jalali     = gregorianToJalali(gy, gm, gd);
    const solarText  = `${dayName} ${jalali.day} ${jMonths[jalali.month - 1]} ${jalali.year}${sSfx}`;
    const solarNums  = `${jalali.day}/${jalali.month}/${jalali.year}`;

    const rows = [
        [_t('converter.label_hijri',        'التاريخ الهجري'),             hijriText],
        [_t('converter.label_hijri_nums',   'التاريخ الهجري بالأرقام'),    hijriNums],
        [_t('converter.label_hijri_leap',   'هل السنة الهجرية كبيسة'),     hijriLeapText],
        [_t('converter.label_gregorian',    'التاريخ الميلادي'),           gregText],
        [_t('converter.label_gregorian_nums','التاريخ الميلادي بالأرقام'), gregNums],
        [_t('converter.label_gregorian_leap','هل السنة الميلادية كبيسة'),   gregLeapText],
        [_t('converter.label_solar',        'التاريخ الشمسي'),             solarText],
        [_t('converter.label_solar_nums',   'التاريخ الشمسي بالأرقام'),    solarNums],
    ];

    const resultDateFull = resultType === 'hijri'
        ? `${dayName} ${hd} ${hMonths[hm - 1]} ${hy}${hSfx}`
        : resultType === 'solar'
        ? `${dayName} ${jalali.day} ${jMonths[jalali.month - 1]} ${jalali.year}${sSfx}`
        : `${dayName} ${gd} ${gMonths[gm-1]} ${gy}${gSfx}`;

    const rowsHTML = rows.map(([l, v]) =>
        `<div class="conv-summary-row"><span class="conv-summary-label">${l}</span><span class="conv-summary-value">${v}</span></div>`
    ).join('');

    return `<div class="conv-summary"><div class="conv-summary-day">${resultDateFull}</div>${rowsHTML}</div>`;
}

function switchConverter(type) {
    document.querySelectorAll('.converter-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('converter-to-hijri').style.display  = (type === 'to-hijri')  ? 'block' : 'none';
    document.getElementById('converter-to-greg').style.display   = (type === 'to-greg')   ? 'block' : 'none';
    document.getElementById('converter-to-solar').style.display  = (type === 'to-solar')  ? 'block' : 'none';
    const idx = type === 'to-hijri' ? 0 : type === 'to-greg' ? 1 : 2;
    document.querySelectorAll('.converter-tab')[idx]?.classList.add('active');
}

function convertToHijri() {
    const gd = parseInt(document.getElementById('conv-g-day').value) || 1;
    const gm = parseInt(document.getElementById('conv-g-month').value) || 1;
    const gy = parseInt(document.getElementById('conv-g-year').value) || 2026;
    const hijri = HijriDate.toHijri(gy, gm, gd);
    document.getElementById('conv-hijri-result').innerHTML =
        buildConvSummaryHTML(gy, gm, gd, hijri.year, hijri.month, hijri.day, 'hijri');
}

function convertToGreg() {
    const hd = parseInt(document.getElementById('conv-h-day').value) || 1;
    const hm = parseInt(document.getElementById('conv-h-month').value) || 1;
    const hy = parseInt(document.getElementById('conv-h-year').value) || 1447;
    const greg = HijriDate.toGregorian(hy, hm, hd);
    document.getElementById('conv-greg-result').innerHTML =
        buildConvSummaryHTML(greg.year, greg.month, greg.day, hy, hm, hd, 'greg');
}

function convertFromSolar() {
    const jd = parseInt(document.getElementById('conv-s-day').value) || 1;
    const jm = parseInt(document.getElementById('conv-s-month').value) || 1;
    const jy = parseInt(document.getElementById('conv-s-year').value) || 1404;
    const greg = jalaliToGregorian(jy, jm, jd);
    const hijri = HijriDate.toHijri(greg.year, greg.month, greg.day);
    document.getElementById('conv-solar-result').innerHTML =
        buildConvSummaryHTML(greg.year, greg.month, greg.day, hijri.year, hijri.month, hijri.day, 'solar');
}

// ========= أحداث التاريخ المحوّل =========
let _converterOTDToken = 0;
async function loadConverterOTD(hijriDay, hijriMonthIndex, hijriYear) {
    const myToken = ++_converterOTDToken;
    const section    = document.getElementById('conv-otd-section');
    const loadingEl  = document.getElementById('conv-otd-loading');
    const listEl     = document.getElementById('conv-otd-list');
    const subtitleEl = document.getElementById('conv-otd-subtitle');
    if (!section || !loadingEl || !listEl) return;

    const lang           = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const hijriMonthName = HijriDate.hijriMonths[hijriMonthIndex - 1];
    const hijriMonthsEn  = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab','Shaban','Ramadan','Shawwal','Dhu al-Qidah','Dhu al-Hijjah'];

    // تحديث العنوان الفرعي فوراً
    if (subtitleEl) {
        subtitleEl.textContent = lang !== 'ar'
            ? `On this day, ${hijriDay} ${hijriMonthsEn[hijriMonthIndex - 1]} ${hijriYear} AH, we review the most notable events in Islamic history.`
            : `في مثل هذا اليوم، ${hijriDay} ${hijriMonthName} ${hijriYear} هـ، نستعرض أبرز الأحداث التي وقعت عبر التاريخ الإسلامي.`;
    }

    section.style.display    = 'block';
    loadingEl.style.display  = 'block';
    listEl.style.display     = 'none';
    listEl.innerHTML         = '';

    try {
        const url  = `/api/wiki-onthisday?day=${hijriDay}&month=${encodeURIComponent(hijriMonthName)}`;
        const res  = await fetch(url);
        if (myToken !== _converterOTDToken) return;
        const data = await res.json();
        if (myToken !== _converterOTDToken) return;

        let events = data.events || [];
        const seen = new Set();
        events = events.filter(ev => { if (!ev.text || seen.has(ev.text)) return false; seen.add(ev.text); return true; });

        const getYear = t => { const m = t.match(/^(\d{1,4})\s*هـ/); return m ? parseInt(m[1]) : null; };
        const final   = events.filter(ev => { const y = getYear(ev.text); return y !== null && y <= 897; });

        if (!final.length) {
            loadingEl.textContent = lang !== 'ar' ? 'No events found for this date.' : 'لا توجد أحداث متاحة لهذا التاريخ.';
            return;
        }

        const typeMap = { 'مواليد': { cls: 'birth', label: 'ولادة' }, 'وفيات': { cls: 'death', label: 'وفاة' } };
        final.slice(0, 20).forEach(ev => {
            const li = document.createElement('li');
            const m  = (ev.text || '').match(/^(\d{1,4})\s*هـ\s*[-–]\s*(.*)/s);
            if (m) {
                const badge = typeMap[ev.type] || { cls: 'event', label: 'حدث تاريخي:' };
                li.innerHTML = `<strong class="otd-year">${m[1]} هـ</strong><span class="otd-badge ${badge.cls}">${badge.label}</span>${m[2].trim()}`;
                if (ev.article && (ev.type === 'مواليد' || ev.type === 'وفيات')) {
                    renderBio(li, ev.article, lang);
                }
            } else {
                li.textContent = ev.text;
            }
            listEl.appendChild(li);
        });

        loadingEl.style.display = 'none';
        listEl.style.display    = 'block';
    } catch(e) {
        if (myToken === _converterOTDToken)
            loadingEl.textContent = lang !== 'ar' ? 'Failed to load events.' : 'تعذّر تحميل الأحداث.';
    }
}

// ========= التقويم الهجري =========
function populateHijriYearSelect() {
    const sel = document.getElementById('calendar-year-select');
    if (!sel) return;
    const todayYear = HijriDate.getToday().year;
    const min = todayYear - 20;
    const max = todayYear + 20;
    let html = '';
    for (let y = min; y <= max; y++) {
        const selected = (y === calendarYear) ? ' selected' : '';
        html += `<option value="${y}"${selected}>${y}</option>`;
    }
    sel.innerHTML = html;
}

function goToHijriYear(year) {
    const y = parseInt(year, 10);
    if (!y || isNaN(y)) return;
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const prefix = (lang && lang !== 'ar') ? ('/' + lang) : '';
    window.location.href = `${prefix}/hijri-calendar/${y}`;
}

function renderCalendar() {
    const calendar = HijriDate.getHijriCalendar(calendarYear, calendarMonth);
    const monthName = HijriDate.hijriMonths[calendarMonth - 1];

    const hSfxCal = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
    document.getElementById('calendar-title').textContent =
        `${monthName} ${calendarYear}${hSfxCal}`;

    populateHijriYearSelect();

    const tbody = document.getElementById('calendar-body');
    tbody.innerHTML = '';

    const today = HijriDate.getToday();

    calendar.weeks.forEach(week => {
        const tr = document.createElement('tr');
        week.forEach(day => {
            const td = document.createElement('td');
            if (day) {
                const isToday = day.hijri === today.day &&
                    calendarMonth === today.month &&
                    calendarYear === today.year;

                if (isToday) td.classList.add('today');

                td.innerHTML = `
                    <div class="hijri-day">${day.hijri}</div>
                    <div class="greg-day">${day.gregorian.day}/${day.gregorian.month}</div>
                `;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function changeCalendarMonth(delta) {
    calendarMonth += delta;
    if (calendarMonth > 12) { calendarMonth = 1; calendarYear++; }
    if (calendarMonth < 1) { calendarMonth = 12; calendarYear--; }
    renderCalendar();
}

// ========= حاسبة الزكاة =========
function calculateZakat() {
    const cash = parseFloat(document.getElementById('zakat-cash').value) || 0;
    const gold = parseFloat(document.getElementById('zakat-gold').value) || 0;
    const silver = parseFloat(document.getElementById('zakat-silver').value) || 0;
    const stocks = parseFloat(document.getElementById('zakat-stocks').value) || 0;
    const property = parseFloat(document.getElementById('zakat-property').value) || 0;
    const debts = parseFloat(document.getElementById('zakat-debts').value) || 0;

    const total = cash + gold + silver + stocks + property - debts;
    const zakatAmount = total > 0 ? total * 0.025 : 0;

    const currency = document.getElementById('zakat-currency').value;
    const resultDiv = document.getElementById('zakat-result');

    if (total > 0) {
        resultDiv.style.display = 'block';
        document.getElementById('zakat-total').textContent =
            total.toLocaleString('ar') + ' ' + currency;
        document.getElementById('zakat-amount').textContent =
            zakatAmount.toLocaleString('ar', { maximumFractionDigits: 2 }) + ' ' + currency;
    } else {
        resultDiv.style.display = 'none';
    }
}

// ========= الأدعية والأذكار =========
function initDuas() {
    const container = document.getElementById('dua-categories');
    container.innerHTML = '';

    DuasDB.categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'dua-category';
        div.onclick = () => showDuaCategory(cat.id);
        div.innerHTML = `
            <span class="icon">${cat.icon}</span>
            <div class="name">${cat.name}</div>
            <div class="count">${cat.duas.length} ذكر</div>
        `;
        container.appendChild(div);
    });
}

function showDuaCategory(categoryId) {
    const category = DuasDB.categories.find(c => c.id === categoryId);
    if (!category) return;

    // تحديث النشط
    document.querySelectorAll('.dua-category').forEach(c => c.classList.remove('active'));
    event.currentTarget?.classList.add('active');

    const listSection = document.getElementById('dua-list-section');
    listSection.style.display = 'block';
    document.getElementById('dua-list-title').textContent = category.icon + ' ' + category.name;

    const list = document.getElementById('dua-list');
    list.innerHTML = '';

    category.duas.forEach((dua, index) => {
        const div = document.createElement('div');
        div.className = 'dua-item fade-in';
        div.style.animationDelay = (index * 0.05) + 's';

        let counterId = `counter-${categoryId}-${index}`;
        let currentCount = 0;

        div.innerHTML = `
            <div class="dua-text">${dua.text}</div>
            <div class="dua-reference">📚 ${dua.reference}</div>
            ${dua.repeat > 1 ? `
                <div class="dua-count" onclick="incrementCounter('${counterId}', ${dua.repeat}, this)">
                    🔄 <span id="${counterId}">0</span> / ${dua.repeat}
                </div>
            ` : ''}
        `;
        list.appendChild(div);
    });

    // التمرير للأسفل
    listSection.scrollIntoView({ behavior: 'smooth' });
}

function incrementCounter(id, max, element) {
    const span = document.getElementById(id);
    let count = parseInt(span.textContent) + 1;
    if (count > max) count = 0;
    span.textContent = count;

    if (count === max) {
        element.style.background = 'var(--gold)';
        element.style.color = '#fff';
    } else {
        element.style.background = '';
        element.style.color = '';
    }
}
