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
// أولوية المدينة: Nominatim المترجَم (إن تَوفَّر) → قاموس محلي (مباشر لأسماء المدن الشائعة)
// → fallback إنجليزي. نفس المنطق لكل 8 لغات غير ar/en.
function getDisplayCity() {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    if (lang === 'ar') return currentCity;
    if (lang === 'en') return currentEnglishDisplayName || currentEnglishName || currentCity;
    // Nominatim أعاد اسماً مترجَماً حقيقياً (ليس endonym إنجليزي) → استخدمه
    if (currentLocalizedName
        && currentLocalizedName !== currentEnglishName
        && currentLocalizedName !== currentEnglishDisplayName) {
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

// ===== slugs الأشهر الهجرية (للروابط) =====
const HIJRI_MONTH_SLUGS = [
    'muharram','safar','rabi-al-awwal','rabi-al-thani',
    'jumada-al-awwal','jumada-al-thani','rajab','shaban',
    'ramadan','shawwal','dhu-al-qidah','dhu-al-hijjah'
];
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
          cta_month: (mn, y) => `🌙 التقويم الهجري لشهر ${mn} ${y}`,
          title: c => `التقويم الهجري لعام ${c.year}${c.hSfx}`,
          intro: c => `يعرض هذا التقويم الهجري لعام ${c.year}${c.hSfx} جميع الأشهر الهجرية مع التواريخ الميلادية المقابلة حسب تقويم أم القرى في ${c.country}.`,
          table_title: c => `🗓️ أشهر السنة الهجرية ${c.year}${c.hSfx}`,
          months_grid_title: c => `📅 تصفح أشهر السنة الهجرية ${c.year}${c.hSfx}`,
          seo_text: c => `يتكون التقويم الهجري من 12 شهراً تبدأ بمحرم وتنتهي بذي الحجة، ويعتمد على دورة القمر حيث يبدأ كل شهر برؤية الهلال. عام ${c.year}${c.hSfx} يحتوي على ${c.totalYearDays} يوماً وهو ${c.isLeap?'سنة كبيسة':'سنة بسيطة'}. تقويم أم القرى المعتمد في المملكة العربية السعودية هو تقويم قمري حسابي يستخدم لتحديد المناسبات الإسلامية مثل رمضان وعيد الفطر وعيد الأضحى.`,
          footer: c => `التقويم الهجري لعام ${c.year}${c.hSfx} يشمل سنة كاملة من ${c.totalYearDays} يوماً موزعة على 12 شهراً. تصفح كل شهر لعرض التقويم الهجري الكامل مع التواريخ الميلادية المقابلة حسب تقويم أم القرى في ${c.country}. يمكنك أيضاً معرفة التاريخ الهجري اليوم أو استخدام تحويل التاريخ بين الهجري والميلادي.`,
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
          cta_month: (mn, y) => `🌙 ${mn} ${y}`,
          title: c => `Hijri Calendar for the Year ${c.year}${c.hSfx}`,
          intro: c => `This calendar displays all Hijri months of ${c.year}${c.hSfx} with their corresponding Gregorian dates, according to the Umm al-Qura calendar in ${c.country}.`,
          table_title: c => `🗓️ Months of ${c.year}${c.hSfx}`,
          months_grid_title: c => `📅 Browse Months of ${c.year}${c.hSfx}`,
          seo_text: c => `The Hijri calendar consists of 12 months starting with Muharram and ending with Dhu al-Hijjah. It is based on the lunar cycle, where each month begins with the sighting of the new crescent moon. The year ${c.year}${c.hSfx} contains ${c.totalYearDays} days and is ${c.isLeap?'a leap year':'a regular year'}. The Umm al-Qura calendar, used in Saudi Arabia, is a calculated lunar calendar used to determine Islamic occasions such as Ramadan, Eid al-Fitr, and Eid al-Adha.`,
          footer: c => `The Hijri calendar for ${c.year}${c.hSfx} covers a full year of ${c.totalYearDays} days across 12 months. Browse each month to see the complete Hijri calendar with corresponding Gregorian dates according to the Umm al-Qura calendar in ${c.country}. You can also check today's Hijri date or use the date converter to convert any date between Hijri and Gregorian.`,
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
          cta_month: (mn, y) => `🌙 ${mn} ${y}`,
          title: c => `Calendrier hégirien de l'année ${c.year}${c.hSfx}`,
          intro: c => `Ce calendrier affiche tous les mois hégiriens de ${c.year}${c.hSfx} avec leurs dates grégoriennes correspondantes, selon le calendrier Umm al-Qura à ${c.country}.`,
          table_title: c => `🗓️ Mois de ${c.year}${c.hSfx}`,
          months_grid_title: c => `📅 Parcourir les mois de ${c.year}${c.hSfx}`,
          seo_text: c => `Le calendrier hégirien se compose de 12 mois, de Mouharram à Dhou al-Hijja. Il est basé sur le cycle lunaire, où chaque mois commence par l'observation du croissant de lune. L'année ${c.year}${c.hSfx} contient ${c.totalYearDays} jours et est ${c.isLeap?'une année bissextile':'une année ordinaire'}. Le calendrier Umm al-Qura, utilisé en Arabie saoudite, est un calendrier lunaire calculé utilisé pour déterminer les occasions islamiques telles que le Ramadan, l'Aïd el-Fitr et l'Aïd el-Adha.`,
          footer: c => `Le calendrier hégirien de ${c.year}${c.hSfx} couvre une année complète de ${c.totalYearDays} jours répartis sur 12 mois. Parcourez chaque mois pour voir le calendrier hégirien complet avec les dates grégoriennes correspondantes selon le calendrier Umm al-Qura à ${c.country}. Vous pouvez également consulter la date hégirienne du jour ou utiliser le convertisseur de dates.`,
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
          cta_month: (mn, y) => `🌙 ${mn} ${y}`,
          title: c => `${c.year}${c.hSfx} Hicri Takvimi`,
          intro: c => `Bu takvim, ${c.year}${c.hSfx} yılının tüm hicri aylarını, ${c.country} ülkesinde Ümmülkura takvimine göre miladi karşılıklarıyla birlikte gösterir.`,
          table_title: c => `🗓️ ${c.year}${c.hSfx} Ayları`,
          months_grid_title: c => `📅 ${c.year}${c.hSfx} Aylarına Göz At`,
          seo_text: c => `Hicri takvim, Muharrem'den Zilhicce'ye kadar 12 aydan oluşur. Ay döngüsüne dayanır; her ay yeni hilalin görülmesiyle başlar. ${c.year}${c.hSfx} yılı ${c.totalYearDays} gündür ve ${c.isLeap?'artık yıl':'normal yıl'}dır. Suudi Arabistan'da kullanılan Ümmülkura takvimi, Ramazan, Ramazan Bayramı ve Kurban Bayramı gibi İslami olayları belirlemek için kullanılan hesaplanmış bir ay takvimidir.`,
          footer: c => `${c.year}${c.hSfx} hicri takvimi, 12 ay boyunca ${c.totalYearDays} günden oluşan tam bir yılı kapsar. ${c.country} ülkesinde Ümmülkura takvimine göre miladi karşılıklarıyla birlikte tüm ayları gözden geçirin. Ayrıca bugünün hicri tarihini kontrol edebilir veya tarih dönüştürücüyü kullanabilirsiniz.`,
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
          cta_month: (mn, y) => `🌙 ${mn} ${y}`,
          title: c => `${c.year}${c.hSfx} کا ہجری کیلنڈر`,
          intro: c => `یہ کیلنڈر ${c.year}${c.hSfx} کے تمام ہجری مہینے ${c.country} میں ام القری کیلنڈر کے مطابق عیسوی تاریخوں کے ساتھ دکھاتا ہے۔`,
          table_title: c => `🗓️ ${c.year}${c.hSfx} کے مہینے`,
          months_grid_title: c => `📅 ${c.year}${c.hSfx} کے مہینے دیکھیں`,
          seo_text: c => `ہجری کیلنڈر محرم سے ذی الحجہ تک 12 مہینوں پر مشتمل ہے۔ یہ چاند کی گردش پر مبنی ہے، جہاں ہر مہینہ نئے چاند کے دیدار سے شروع ہوتا ہے۔ ${c.year}${c.hSfx} ${c.totalYearDays} دن کا ہے اور یہ ${c.isLeap?'لیپ سال':'عام سال'} ہے۔ سعودی عرب میں استعمال ہونے والا ام القری کیلنڈر ایک حسابی چاند کا کیلنڈر ہے جو رمضان، عید الفطر اور عید الاضحی جیسے اسلامی مواقع کا تعین کرتا ہے۔`,
          footer: c => `${c.year}${c.hSfx} کا ہجری کیلنڈر 12 مہینوں پر مشتمل ${c.totalYearDays} دن کا مکمل سال ہے۔ ${c.country} میں ام القری کیلنڈر کے مطابق مکمل ہجری کیلنڈر کے لیے ہر مہینہ دیکھیں۔ آپ آج کی ہجری تاریخ بھی دیکھ سکتے ہیں یا تاریخ کنورٹر استعمال کر سکتے ہیں۔`,
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
          cta_month: (mn, y) => `🌙 ${mn} ${y}`,
          title: c => `Hidschri-Kalender für das Jahr ${c.year}${c.hSfx}`,
          intro: c => `Dieser Kalender zeigt alle Hidschri-Monate des Jahres ${c.year}${c.hSfx} mit ihren entsprechenden gregorianischen Daten gemäß dem Umm-al-Qura-Kalender in ${c.country}.`,
          table_title: c => `🗓️ Monate von ${c.year}${c.hSfx}`,
          months_grid_title: c => `📅 Monate von ${c.year}${c.hSfx} durchsuchen`,
          seo_text: c => `Der Hidschri-Kalender besteht aus 12 Monaten, beginnend mit Muharram und endend mit Dhū l-hidscha. Er basiert auf dem Mondzyklus, wobei jeder Monat mit der Sichtung der neuen Mondsichel beginnt. Das Jahr ${c.year}${c.hSfx} enthält ${c.totalYearDays} Tage und ist ${c.isLeap?'ein Schaltjahr':'ein normales Jahr'}. Der in Saudi-Arabien verwendete Umm-al-Qura-Kalender ist ein berechneter Mondkalender zur Bestimmung islamischer Anlässe wie Ramadan, Eid al-Fitr und Eid al-Adha.`,
          footer: c => `Der Hidschri-Kalender für ${c.year}${c.hSfx} umfasst ein volles Jahr mit ${c.totalYearDays} Tagen, verteilt auf 12 Monate. Durchsuchen Sie jeden Monat, um den vollständigen Hidschri-Kalender mit entsprechenden gregorianischen Daten gemäß dem Umm-al-Qura-Kalender in ${c.country} zu sehen. Sie können auch das heutige Hidschri-Datum prüfen oder den Datumsumrechner verwenden.`,
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
          cta_month: (mn, y) => `🌙 ${mn} ${y}`,
          title: c => `Kalender Hijriah Tahun ${c.year}${c.hSfx}`,
          intro: c => `Kalender ini menampilkan semua bulan Hijriah tahun ${c.year}${c.hSfx} beserta tanggal Masehi yang bertepatan, menurut kalender Umm al-Qura di ${c.country}.`,
          table_title: c => `🗓️ Bulan-bulan ${c.year}${c.hSfx}`,
          months_grid_title: c => `📅 Jelajahi Bulan-bulan ${c.year}${c.hSfx}`,
          seo_text: c => `Kalender Hijriah terdiri dari 12 bulan, mulai dari Muharram hingga Zulhijah. Didasarkan pada siklus bulan, di mana setiap bulan dimulai dengan terlihatnya hilal. Tahun ${c.year}${c.hSfx} memiliki ${c.totalYearDays} hari dan merupakan ${c.isLeap?'tahun kabisat':'tahun biasa'}. Kalender Umm al-Qura yang digunakan di Arab Saudi adalah kalender lunar terhitung yang digunakan untuk menentukan peristiwa Islam seperti Ramadan, Idul Fitri, dan Idul Adha.`,
          footer: c => `Kalender Hijriah untuk ${c.year}${c.hSfx} mencakup satu tahun penuh sebanyak ${c.totalYearDays} hari yang tersebar di 12 bulan. Jelajahi setiap bulan untuk melihat kalender Hijriah lengkap dengan tanggal Masehi yang bertepatan menurut kalender Umm al-Qura di ${c.country}. Anda juga dapat melihat tanggal Hijriah hari ini atau menggunakan konverter tanggal.`,
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
          cta_month: (mn, y) => `🌙 ${mn} ${y}`,
          title: c => `Calendario Hégira del año ${c.year}${c.hSfx}`,
          intro: c => `Este calendario muestra todos los meses del calendario Hégira del año ${c.year}${c.hSfx} con sus fechas gregorianas correspondientes, según el calendario Umm al-Qura en ${c.country}.`,
          table_title: c => `🗓️ Meses de ${c.year}${c.hSfx}`,
          months_grid_title: c => `📅 Explorar meses de ${c.year}${c.hSfx}`,
          seo_text: c => `El calendario Hégira se compone de 12 meses, empezando por Muharram y terminando con Du al-Hiyya. Se basa en el ciclo lunar, donde cada mes comienza con el avistamiento de la luna nueva. El año ${c.year}${c.hSfx} contiene ${c.totalYearDays} días y es ${c.isLeap?'un año bisiesto':'un año regular'}. El calendario Umm al-Qura, utilizado en Arabia Saudí, es un calendario lunar calculado que se utiliza para determinar ocasiones islámicas como el Ramadán, Eid al-Fitr y Eid al-Adha.`,
          footer: c => `El calendario Hégira para ${c.year}${c.hSfx} cubre un año completo de ${c.totalYearDays} días repartidos en 12 meses. Explore cada mes para ver el calendario Hégira completo con las fechas gregorianas correspondientes según el calendario Umm al-Qura en ${c.country}. También puede consultar la fecha Hégira de hoy o usar el convertidor de fechas.`,
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
          cta_month: (mn, y) => `🌙 ${mn} ${y}`,
          title: c => `${c.year}${c.hSfx} সনের হিজরি ক্যালেন্ডার`,
          intro: c => `এই ক্যালেন্ডারটি ${c.country}-এ উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী ${c.year}${c.hSfx} সনের সব হিজরি মাস এবং সেগুলোর সংশ্লিষ্ট খ্রিস্টীয় তারিখ প্রদর্শন করে।`,
          table_title: c => `🗓️ ${c.year}${c.hSfx} সনের মাস`,
          months_grid_title: c => `📅 ${c.year}${c.hSfx} সনের মাস ব্রাউজ করুন`,
          seo_text: c => `হিজরি ক্যালেন্ডার ১২টি মাস নিয়ে গঠিত — মুহররম থেকে জিলহজ পর্যন্ত। এটি চন্দ্রচক্রের উপর ভিত্তি করে গঠিত, প্রতিটি মাস নতুন চাঁদ দেখার মধ্য দিয়ে শুরু হয়। ${c.year}${c.hSfx} সনে ${c.totalYearDays} দিন রয়েছে এবং এটি ${c.isLeap?'একটি অধিবর্ষ':'একটি সাধারণ বছর'}। সৌদি আরবে ব্যবহৃত উম্ম আল-কুরা ক্যালেন্ডার একটি গণনাকৃত চন্দ্র ক্যালেন্ডার যা রমজান, ঈদুল ফিতর ও ঈদুল আযহার মতো ইসলামি উপলক্ষ নির্ধারণে ব্যবহৃত হয়।`,
          footer: c => `${c.year}${c.hSfx} সনের হিজরি ক্যালেন্ডার ১২ মাসে ${c.totalYearDays} দিনের পুরো একটি বছর নিয়ে গঠিত। ${c.country}-এ উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী সংশ্লিষ্ট খ্রিস্টীয় তারিখ সহ সম্পূর্ণ হিজরি ক্যালেন্ডার দেখতে প্রতিটি মাস ব্রাউজ করুন। আপনি আজকের হিজরি তারিখও দেখতে পারেন বা তারিখ রূপান্তরকারী ব্যবহার করতে পারেন।`,
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
          cta_month: (mn, y) => `🌙 ${mn} ${y}`,
          title: c => `Kalendar Hijrah Tahun ${c.year}${c.hSfx}`,
          intro: c => `Kalendar ini memaparkan semua bulan Hijrah bagi tahun ${c.year}${c.hSfx} dengan tarikh Masihi yang bersamaan, mengikut kalendar Umm al-Qura di ${c.country}.`,
          table_title: c => `🗓️ Bulan-bulan ${c.year}${c.hSfx}`,
          months_grid_title: c => `📅 Layari Bulan-bulan ${c.year}${c.hSfx}`,
          seo_text: c => `Kalendar Hijrah terdiri daripada 12 bulan bermula dengan Muharam dan berakhir dengan Zulhijah. Ia berdasarkan kitaran bulan, di mana setiap bulan bermula dengan kelihatan anak bulan. Tahun ${c.year}${c.hSfx} mengandungi ${c.totalYearDays} hari dan ia adalah ${c.isLeap?'tahun lompat':'tahun biasa'}. Kalendar Umm al-Qura yang digunakan di Arab Saudi ialah kalendar lunar yang dikira untuk menentukan peristiwa Islam seperti Ramadan, Aidilfitri dan Aidiladha.`,
          footer: c => `Kalendar Hijrah bagi ${c.year}${c.hSfx} meliputi satu tahun penuh selama ${c.totalYearDays} hari merentasi 12 bulan. Layari setiap bulan untuk melihat kalendar Hijrah lengkap dengan tarikh Masihi yang bersamaan mengikut kalendar Umm al-Qura di ${c.country}. Anda juga boleh menyemak tarikh Hijrah hari ini atau menggunakan penukar tarikh.`,
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
          card_labels:['📅 الشهر','🔢 عدد أيام الشهر','🗓️ أول يوم (ميلادي)','🗓️ آخر يوم (ميلادي)','✅ السنة','✔️ سنة كبيسة'],
          leap_yes:'نعم (355 يوماً)', leap_no:'لا (354 يوماً)',
          days_word_n:(n)=>`${n} يوم`,
          section_info:'📋 معلومات الشهر الهجري', section_days:'📅 أيام هذا الشهر الهجري', section_links:'🔗 روابط مرتبطة بهذا الشهر',
          th_hijri:'التاريخ الهجري', th_greg:'التاريخ الميلادي',
          prev_label:'الشهر السابق', next_label:'الشهر التالي',
          link_convert:'🔄 تحويل التاريخ هجري ميلادي', link_today:'📌 التاريخ الهجري اليوم',
          link_day1:(mn,y)=>`📅 اليوم الأول من ${mn} ${y}`,
          title:c=>`التقويم الهجري لشهر ${c.monthName} ${c.year}${c.hSfx} (${c.gRange})`,
          subtitle:c=>`الموافق: ${c.gRange}`,
          intro:c=>`يعرض هذا الجدول التقويم الهجري الكامل لشهر ${c.monthName} ${c.year}${c.hSfx} مع التاريخ الميلادي المقابل لكل يوم حسب تقويم أم القرى في ${c.country}.`,
          days_summary:c=>`📅 عدد أيام شهر ${c.monthName} ${c.year}${c.hSfx} هو ${c.totalDays} يوماً.`,
          other_months_title:c=>`🌙 التقويم الهجري للأشهر الأخرى لعام ${c.year}${c.hSfx}`,
          footer:c=>`التقويم الهجري لشهر ${c.monthName} ${c.year}${c.hSfx} يمتد من ${c.gFirstStr} إلى ${c.gLastStr}${c.gSfx}، ويحتوي على ${c.totalDays} يوماً حسب تقويم أم القرى في ${c.country}. يمكنك استخدام أداة تحويل التاريخ بين الهجري والميلادي، أو تصفح التقويم الهجري الكامل، أو معرفة التاريخ الهجري اليوم.`,
          headline:c=>`التقويم الهجري لشهر ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`التقويم الهجري الكامل لشهر ${c.monthName} ${c.year}${c.hSfx} مع التاريخ الميلادي لكل يوم حسب تقويم أم القرى في ${c.country}.`,
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
          card_labels:['📅 Month','🔢 Days in Month','🗓️ First Day (Gregorian)','🗓️ Last Day (Gregorian)','✅ Year','✔️ Leap Year'],
          leap_yes:'Yes (355 days)', leap_no:'No (354 days)',
          days_word_n:(n)=>`${n} days`,
          section_info:'📋 Month Information', section_days:'📅 Days of This Hijri Month', section_links:'🔗 Related Links for This Month',
          th_hijri:'Hijri Date', th_greg:'Gregorian Date',
          prev_label:'Previous Month', next_label:'Next Month',
          link_convert:'🔄 Convert Hijri ↔ Gregorian', link_today:'📌 Today\'s Hijri Date',
          link_day1:(mn,y)=>`📅 ${mn} ${y} – Day 1`,
          title:c=>`Hijri Calendar: ${c.monthName} ${c.year}${c.hSfx} (${c.gRange})`,
          subtitle:c=>`Corresponding to: ${c.gRange}`,
          intro:c=>`This table shows the full Hijri calendar for ${c.monthName} ${c.year}${c.hSfx} with the corresponding Gregorian date for each day, according to the Umm al-Qura calendar in ${c.country}.`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} contains ${c.totalDays} days.`,
          other_months_title:c=>`🌙 Hijri Calendar for Other Months of ${c.year}${c.hSfx}`,
          footer:c=>`The Hijri calendar for ${c.monthName} ${c.year}${c.hSfx} spans from ${c.gFirstStr} to ${c.gLastStr}${c.gSfx}. It contains ${c.totalDays} days according to the Umm al-Qura calendar in ${c.country}. Use our date converter to convert any Hijri date to Gregorian, browse the Hijri calendar, or check today's Hijri date.`,
          headline:c=>`Hijri Calendar: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Full Hijri calendar for ${c.monthName} ${c.year}${c.hSfx} with Gregorian date for each day, per Umm al-Qura calendar in ${c.country}.`,
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
          card_labels:['📅 Mois','🔢 Jours du mois','🗓️ Premier jour (grégorien)','🗓️ Dernier jour (grégorien)','✅ Année','✔️ Année bissextile'],
          leap_yes:'Oui (355 jours)', leap_no:'Non (354 jours)',
          days_word_n:(n)=>`${n} jours`,
          section_info:'📋 Informations sur le mois', section_days:'📅 Jours de ce mois hégirien', section_links:'🔗 Liens liés à ce mois',
          th_hijri:'Date hégirienne', th_greg:'Date grégorienne',
          prev_label:'Mois précédent', next_label:'Mois suivant',
          link_convert:'🔄 Convertir hégirien ↔ grégorien', link_today:'📌 Date hégirienne d\'aujourd\'hui',
          link_day1:(mn,y)=>`📅 Premier jour de ${mn} ${y}`,
          title:c=>`Calendrier hégirien : ${c.monthName} ${c.year}${c.hSfx} (${c.gRange})`,
          subtitle:c=>`Correspondant à : ${c.gRange}`,
          intro:c=>`Ce tableau présente le calendrier hégirien complet du mois de ${c.monthName} ${c.year}${c.hSfx} avec la date grégorienne correspondante pour chaque jour, selon le calendrier Umm al-Qura à ${c.country}.`,
          days_summary:c=>`📅 Le mois de ${c.monthName} ${c.year}${c.hSfx} compte ${c.totalDays} jours.`,
          other_months_title:c=>`🌙 Calendrier hégirien pour les autres mois de ${c.year}${c.hSfx}`,
          footer:c=>`Le calendrier hégirien du mois de ${c.monthName} ${c.year}${c.hSfx} s'étend du ${c.gFirstStr} au ${c.gLastStr}${c.gSfx}. Il comprend ${c.totalDays} jours selon le calendrier Umm al-Qura à ${c.country}. Utilisez notre convertisseur pour passer d'une date hégirienne à une date grégorienne, parcourez le calendrier hégirien ou consultez la date hégirienne d'aujourd'hui.`,
          headline:c=>`Calendrier hégirien : ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Calendrier hégirien complet de ${c.monthName} ${c.year}${c.hSfx} avec la date grégorienne de chaque jour, selon le calendrier Umm al-Qura à ${c.country}.`,
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
          card_labels:['📅 Ay','🔢 Ayın Gün Sayısı','🗓️ İlk Gün (Miladi)','🗓️ Son Gün (Miladi)','✅ Yıl','✔️ Artık Yıl'],
          leap_yes:'Evet (355 gün)', leap_no:'Hayır (354 gün)',
          days_word_n:(n)=>`${n} gün`,
          section_info:'📋 Ay Bilgileri', section_days:'📅 Bu Hicri Ayın Günleri', section_links:'🔗 Bu Aya İlişkin Bağlantılar',
          th_hijri:'Hicri Tarih', th_greg:'Miladi Tarih',
          prev_label:'Önceki Ay', next_label:'Sonraki Ay',
          link_convert:'🔄 Hicri ↔ Miladi Dönüştür', link_today:'📌 Bugünün Hicri Tarihi',
          link_day1:(mn,y)=>`📅 ${mn} ${y} – 1. Gün`,
          title:c=>`Hicri Takvim: ${c.monthName} ${c.year}${c.hSfx} (${c.gRange})`,
          subtitle:c=>`Karşılık gelen: ${c.gRange}`,
          intro:c=>`Bu tablo, ${c.country} ülkesinde Ümmülkura takvimine göre ${c.monthName} ${c.year}${c.hSfx} ayının tam hicri takvimini, her gün için miladi karşılığıyla birlikte gösterir.`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} ayı ${c.totalDays} gündür.`,
          other_months_title:c=>`🌙 ${c.year}${c.hSfx} Yılının Diğer Aylarının Hicri Takvimi`,
          footer:c=>`${c.monthName} ${c.year}${c.hSfx} hicri takvimi ${c.gFirstStr} tarihinden ${c.gLastStr}${c.gSfx} tarihine kadar uzanır. ${c.country} ülkesinde Ümmülkura takvimine göre ${c.totalDays} gün içerir. Herhangi bir hicri tarihi miladiye çevirmek için dönüştürücümüzü kullanın, hicri takvime göz atın veya bugünün hicri tarihini kontrol edin.`,
          headline:c=>`Hicri Takvim: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`${c.monthName} ${c.year}${c.hSfx} için tam hicri takvim, her günün miladi tarihiyle, ${c.country} ülkesinde Ümmülkura takvimine göre.`,
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
          card_labels:['📅 مہینہ','🔢 مہینے کے دن','🗓️ پہلا دن (عیسوی)','🗓️ آخری دن (عیسوی)','✅ سال','✔️ لیپ سال'],
          leap_yes:'ہاں (355 دن)', leap_no:'نہیں (354 دن)',
          days_word_n:(n)=>`${n} دن`,
          section_info:'📋 مہینے کی معلومات', section_days:'📅 اس ہجری مہینے کے دن', section_links:'🔗 اس مہینے سے متعلق روابط',
          th_hijri:'ہجری تاریخ', th_greg:'عیسوی تاریخ',
          prev_label:'پچھلا مہینہ', next_label:'اگلا مہینہ',
          link_convert:'🔄 ہجری ↔ عیسوی تبدیل کریں', link_today:'📌 آج کی ہجری تاریخ',
          link_day1:(mn,y)=>`📅 ${mn} ${y} کا پہلا دن`,
          title:c=>`ہجری کیلنڈر: ${c.monthName} ${c.year}${c.hSfx} (${c.gRange})`,
          subtitle:c=>`مطابق: ${c.gRange}`,
          intro:c=>`یہ جدول ${c.country} میں ام القری کیلنڈر کے مطابق ${c.monthName} ${c.year}${c.hSfx} کا مکمل ہجری کیلنڈر ہر دن کی عیسوی تاریخ کے ساتھ دکھاتا ہے۔`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} میں ${c.totalDays} دن ہیں۔`,
          other_months_title:c=>`🌙 ${c.year}${c.hSfx} کے دیگر مہینوں کا ہجری کیلنڈر`,
          footer:c=>`${c.monthName} ${c.year}${c.hSfx} کا ہجری کیلنڈر ${c.gFirstStr} سے ${c.gLastStr}${c.gSfx} تک پھیلا ہوا ہے۔ ${c.country} میں ام القری کیلنڈر کے مطابق یہ ${c.totalDays} دن پر مشتمل ہے۔ کسی بھی ہجری تاریخ کو عیسوی میں بدلنے کے لیے ہمارا کنورٹر استعمال کریں، ہجری کیلنڈر دیکھیں یا آج کی ہجری تاریخ معلوم کریں۔`,
          headline:c=>`ہجری کیلنڈر: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`${c.monthName} ${c.year}${c.hSfx} کا مکمل ہجری کیلنڈر، ہر دن کی عیسوی تاریخ کے ساتھ، ${c.country} میں ام القری کیلنڈر کے مطابق۔`,
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
          card_labels:['📅 Monat','🔢 Tage des Monats','🗓️ Erster Tag (gregorianisch)','🗓️ Letzter Tag (gregorianisch)','✅ Jahr','✔️ Schaltjahr'],
          leap_yes:'Ja (355 Tage)', leap_no:'Nein (354 Tage)',
          days_word_n:(n)=>`${n} Tage`,
          section_info:'📋 Monatsinformationen', section_days:'📅 Tage dieses Hidschri-Monats', section_links:'🔗 Verwandte Links zu diesem Monat',
          th_hijri:'Hidschri-Datum', th_greg:'Gregorianisches Datum',
          prev_label:'Vorheriger Monat', next_label:'Nächster Monat',
          link_convert:'🔄 Hidschri ↔ Gregorianisch umrechnen', link_today:'📌 Heutiges Hidschri-Datum',
          link_day1:(mn,y)=>`📅 Erster Tag von ${mn} ${y}`,
          title:c=>`Hidschri-Kalender: ${c.monthName} ${c.year}${c.hSfx} (${c.gRange})`,
          subtitle:c=>`Entspricht: ${c.gRange}`,
          intro:c=>`Diese Tabelle zeigt den vollständigen Hidschri-Kalender für ${c.monthName} ${c.year}${c.hSfx} mit dem entsprechenden gregorianischen Datum für jeden Tag, gemäß dem Umm-al-Qura-Kalender in ${c.country}.`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} hat ${c.totalDays} Tage.`,
          other_months_title:c=>`🌙 Hidschri-Kalender für weitere Monate des Jahres ${c.year}${c.hSfx}`,
          footer:c=>`Der Hidschri-Kalender für ${c.monthName} ${c.year}${c.hSfx} reicht vom ${c.gFirstStr} bis zum ${c.gLastStr}${c.gSfx}. Er umfasst ${c.totalDays} Tage gemäß dem Umm-al-Qura-Kalender in ${c.country}. Nutzen Sie unseren Datumsumrechner, um jedes Hidschri-Datum ins Gregorianische zu übertragen, blättern Sie durch den Hidschri-Kalender oder prüfen Sie das heutige Hidschri-Datum.`,
          headline:c=>`Hidschri-Kalender: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Vollständiger Hidschri-Kalender für ${c.monthName} ${c.year}${c.hSfx} mit gregorianischem Datum für jeden Tag, gemäß dem Umm-al-Qura-Kalender in ${c.country}.`,
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
          card_labels:['📅 Bulan','🔢 Jumlah Hari dalam Bulan','🗓️ Hari Pertama (Masehi)','🗓️ Hari Terakhir (Masehi)','✅ Tahun','✔️ Tahun Kabisat'],
          leap_yes:'Ya (355 hari)', leap_no:'Tidak (354 hari)',
          days_word_n:(n)=>`${n} hari`,
          section_info:'📋 Informasi Bulan', section_days:'📅 Hari-hari Bulan Hijriah Ini', section_links:'🔗 Tautan Terkait Bulan Ini',
          th_hijri:'Tanggal Hijriah', th_greg:'Tanggal Masehi',
          prev_label:'Bulan Sebelumnya', next_label:'Bulan Berikutnya',
          link_convert:'🔄 Konversi Hijriah ↔ Masehi', link_today:'📌 Tanggal Hijriah Hari Ini',
          link_day1:(mn,y)=>`📅 Hari pertama ${mn} ${y}`,
          title:c=>`Kalender Hijriah: ${c.monthName} ${c.year}${c.hSfx} (${c.gRange})`,
          subtitle:c=>`Bertepatan dengan: ${c.gRange}`,
          intro:c=>`Tabel ini menampilkan kalender Hijriah lengkap untuk ${c.monthName} ${c.year}${c.hSfx} beserta tanggal Masehi yang bertepatan untuk setiap hari, menurut kalender Umm al-Qura di ${c.country}.`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} memiliki ${c.totalDays} hari.`,
          other_months_title:c=>`🌙 Kalender Hijriah untuk Bulan-bulan Lain Tahun ${c.year}${c.hSfx}`,
          footer:c=>`Kalender Hijriah untuk ${c.monthName} ${c.year}${c.hSfx} berlangsung dari ${c.gFirstStr} hingga ${c.gLastStr}${c.gSfx}. Bulan ini terdiri dari ${c.totalDays} hari menurut kalender Umm al-Qura di ${c.country}. Gunakan pengonversi tanggal kami untuk mengubah tanggal Hijriah ke Masehi, jelajahi kalender Hijriah, atau periksa tanggal Hijriah hari ini.`,
          headline:c=>`Kalender Hijriah: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Kalender Hijriah lengkap untuk ${c.monthName} ${c.year}${c.hSfx} dengan tanggal Masehi setiap hari, menurut kalender Umm al-Qura di ${c.country}.`,
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
          card_labels:['📅 Mes','🔢 Días del mes','🗓️ Primer día (gregoriano)','🗓️ Último día (gregoriano)','✅ Año','✔️ Año bisiesto'],
          leap_yes:'Sí (355 días)', leap_no:'No (354 días)',
          days_word_n:(n)=>`${n} días`,
          section_info:'📋 Información del mes', section_days:'📅 Días de este mes Hégira', section_links:'🔗 Enlaces relacionados con este mes',
          th_hijri:'Fecha Hégira', th_greg:'Fecha gregoriana',
          prev_label:'Mes anterior', next_label:'Mes siguiente',
          link_convert:'🔄 Convertir Hégira ↔ Gregoriano', link_today:'📌 Fecha Hégira de hoy',
          link_day1:(mn,y)=>`📅 Primer día de ${mn} ${y}`,
          title:c=>`Calendario Hégira: ${c.monthName} ${c.year}${c.hSfx} (${c.gRange})`,
          subtitle:c=>`Correspondiente a: ${c.gRange}`,
          intro:c=>`Esta tabla muestra el calendario Hégira completo de ${c.monthName} ${c.year}${c.hSfx} con la fecha gregoriana correspondiente a cada día, según el calendario Umm al-Qura en ${c.country}.`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} tiene ${c.totalDays} días.`,
          other_months_title:c=>`🌙 Calendario Hégira para otros meses de ${c.year}${c.hSfx}`,
          footer:c=>`El calendario Hégira de ${c.monthName} ${c.year}${c.hSfx} abarca desde el ${c.gFirstStr} hasta el ${c.gLastStr}${c.gSfx}. Incluye ${c.totalDays} días según el calendario Umm al-Qura en ${c.country}. Use nuestro conversor para convertir cualquier fecha Hégira a gregoriana, explore el calendario Hégira o consulte la fecha Hégira de hoy.`,
          headline:c=>`Calendario Hégira: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Calendario Hégira completo de ${c.monthName} ${c.year}${c.hSfx} con la fecha gregoriana de cada día, según el calendario Umm al-Qura en ${c.country}.`,
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
          card_labels:['📅 মাস','🔢 মাসের দিনসংখ্যা','🗓️ প্রথম দিন (খ্রিস্টীয়)','🗓️ শেষ দিন (খ্রিস্টীয়)','✅ বছর','✔️ অধিবর্ষ'],
          leap_yes:'হ্যাঁ (355 দিন)', leap_no:'না (354 দিন)',
          days_word_n:(n)=>`${n} দিন`,
          section_info:'📋 মাসের তথ্য', section_days:'📅 এই হিজরি মাসের দিনগুলো', section_links:'🔗 এই মাস সম্পর্কিত লিংক',
          th_hijri:'হিজরি তারিখ', th_greg:'খ্রিস্টীয় তারিখ',
          prev_label:'আগের মাস', next_label:'পরের মাস',
          link_convert:'🔄 হিজরি ↔ খ্রিস্টীয় রূপান্তর', link_today:'📌 আজকের হিজরি তারিখ',
          link_day1:(mn,y)=>`📅 ${mn} ${y}-এর প্রথম দিন`,
          title:c=>`হিজরি ক্যালেন্ডার: ${c.monthName} ${c.year}${c.hSfx} (${c.gRange})`,
          subtitle:c=>`সংশ্লিষ্ট: ${c.gRange}`,
          intro:c=>`এই সারণিটি ${c.country}-এ উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী ${c.monthName} ${c.year}${c.hSfx} মাসের সম্পূর্ণ হিজরি ক্যালেন্ডার প্রতিটি দিনের সংশ্লিষ্ট খ্রিস্টীয় তারিখসহ দেখায়।`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} মাসে ${c.totalDays} দিন রয়েছে।`,
          other_months_title:c=>`🌙 ${c.year}${c.hSfx} সনের অন্যান্য মাসের হিজরি ক্যালেন্ডার`,
          footer:c=>`${c.monthName} ${c.year}${c.hSfx} মাসের হিজরি ক্যালেন্ডার ${c.gFirstStr} থেকে ${c.gLastStr}${c.gSfx} পর্যন্ত বিস্তৃত। ${c.country}-এ উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী এতে ${c.totalDays} দিন রয়েছে। যেকোনো হিজরি তারিখকে খ্রিস্টীয় তারিখে রূপান্তর করতে আমাদের কনভার্টার ব্যবহার করুন, হিজরি ক্যালেন্ডার ব্রাউজ করুন বা আজকের হিজরি তারিখ দেখুন।`,
          headline:c=>`হিজরি ক্যালেন্ডার: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`${c.monthName} ${c.year}${c.hSfx}-এর সম্পূর্ণ হিজরি ক্যালেন্ডার প্রতিটি দিনের খ্রিস্টীয় তারিখসহ, ${c.country}-এ উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী।`,
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
          card_labels:['📅 Bulan','🔢 Bilangan Hari Bulan','🗓️ Hari Pertama (Masihi)','🗓️ Hari Terakhir (Masihi)','✅ Tahun','✔️ Tahun Lompat'],
          leap_yes:'Ya (355 hari)', leap_no:'Tidak (354 hari)',
          days_word_n:(n)=>`${n} hari`,
          section_info:'📋 Maklumat Bulan', section_days:'📅 Hari-hari Bulan Hijrah Ini', section_links:'🔗 Pautan Berkaitan Bulan Ini',
          th_hijri:'Tarikh Hijrah', th_greg:'Tarikh Masihi',
          prev_label:'Bulan Sebelumnya', next_label:'Bulan Berikutnya',
          link_convert:'🔄 Tukar Hijrah ↔ Masihi', link_today:'📌 Tarikh Hijrah Hari Ini',
          link_day1:(mn,y)=>`📅 Hari pertama ${mn} ${y}`,
          title:c=>`Kalendar Hijrah: ${c.monthName} ${c.year}${c.hSfx} (${c.gRange})`,
          subtitle:c=>`Bersamaan dengan: ${c.gRange}`,
          intro:c=>`Jadual ini memaparkan kalendar Hijrah lengkap bagi ${c.monthName} ${c.year}${c.hSfx} dengan tarikh Masihi yang bersamaan untuk setiap hari, mengikut kalendar Umm al-Qura di ${c.country}.`,
          days_summary:c=>`📅 ${c.monthName} ${c.year}${c.hSfx} mempunyai ${c.totalDays} hari.`,
          other_months_title:c=>`🌙 Kalendar Hijrah untuk Bulan-bulan Lain Tahun ${c.year}${c.hSfx}`,
          footer:c=>`Kalendar Hijrah bagi ${c.monthName} ${c.year}${c.hSfx} berlangsung dari ${c.gFirstStr} hingga ${c.gLastStr}${c.gSfx}. Ia merangkumi ${c.totalDays} hari mengikut kalendar Umm al-Qura di ${c.country}. Gunakan penukar tarikh kami untuk menukar sebarang tarikh Hijrah kepada Masihi, layari kalendar Hijrah, atau semak tarikh Hijrah hari ini.`,
          headline:c=>`Kalendar Hijrah: ${c.monthName} ${c.year}${c.hSfx}`,
          meta_desc:c=>`Kalendar Hijrah lengkap bagi ${c.monthName} ${c.year}${c.hSfx} dengan tarikh Masihi bagi setiap hari, mengikut kalendar Umm al-Qura di ${c.country}.`,
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

function hijriDayUrl(year, month, day) {
    const slug = HIJRI_MONTH_SLUGS[month - 1];
    const _ln  = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const base = (_ln === 'ar') ? '' : ('/' + _ln);
    return `${base}/hijri-date/${day}-${slug}-${year}`;
}

function hijriMonthUrl(year, month) {
    const slug = HIJRI_MONTH_SLUGS[month - 1];
    const _ln  = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const base = (_ln === 'ar') ? '' : ('/' + _ln);
    return `${base}/hijri-calendar/${slug}-${year}`;
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
async function _cached(key, fetchFn, ttlMs) {
    // قراءة الكاش
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.v !== null && parsed.v !== undefined
                && (Date.now() - parsed.t) < ttlMs) {
                return parsed.v;
            }
        }
    } catch(e) { /* localStorage غير متاح؟ نتابع */ }
    // استدعاء المصدر الأصلي
    const value = await fetchFn();
    // حفظ فقط إن كانت القيمة صالحة (لا نخزّن null/undefined — أخطاء)
    if (value !== null && value !== undefined) {
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

// إنشاء slug لاسم المدينة (للـ URL)
function makeSlug(englishName, lat, lng) {
    const latin = (englishName || '').toLowerCase()
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
    const pathMatch = window.location.pathname.match(/\/(?:en\/)?(?:prayer-times-in|qibla-in)-(.+?)(?:\.html)?$/);
    if (pathMatch) return pathMatch[1];
    const hashMatch = window.location.hash.match(/#prayer-times-in-([^?]+)/);
    if (hashMatch) return hashMatch[1];
    if (/\/(?:en\/)?today-hijri-date$/.test(window.location.pathname)) return 'hijri-today';
    if (/\/(?:en\/)?hijri-date\/\d+-[a-z-]+-\d+$/.test(window.location.pathname)) return 'hijri-day';
    if (/\/(?:en\/)?hijri-calendar\/\d{4}$/.test(window.location.pathname)) return 'hijri-year';
    if (/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar\/[a-z-]+-\d+$/.test(window.location.pathname)) return 'hijri-month';
    return null;
}

// التنقل إلى صفحة القبلة المخصصة للمدينة
function navigateToQibla(lat, lng, city, country, englishName = '', countryCode = '') {
    const slug = makeSlug(englishName || city, lat, lng);
    sessionStorage.setItem(`city_${slug}`, JSON.stringify({ lat, lng, name: city, country, englishName, countryCode, timezone: currentTimezone }));
    if (window.location.protocol === 'file:') {
        window.location.hash = `qibla-in-${slug}`;
    } else {
        window.location.href = pageUrl(`/qibla-in-${slug}.html`);
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

async function initFromURL() {
    const slug = getSlugFromURL();
    if (!slug) return false;

    // 1) من sessionStorage (تنقل عادي داخل الموقع)
    const cached = sessionStorage.getItem(`city_${slug}`);
    if (cached) {
        const { lat, lng, name, country, countryCode, englishName, timezone } = JSON.parse(cached);
        await loadCityData(lat, lng, name, country, countryCode || '', englishName || '', timezone || null);
        return true;
    }

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
    const loadedFromURL = await initFromURL();
    if (!loadedFromURL) {
        // الصفحة الرئيسية تعرض مكة دائماً كافتراضي — لا نستبدلها بموقع المستخدم المحفوظ
        // موقع المستخدم (إن وُجد) يظهر فقط في شريط الاقتراح عبر checkSavedLocationSuggestion()
        updateCityDisplay();
        updatePrayerTimes();
        updateQibla();
        // اطلب الإذن للموقع الحقيقي — يستعمله detectLocation() لملء شريط الاقتراح فقط على الرئيسية
        detectLocation();
    }

    // تحديث البيانات الأولية
    updateHijriToday();
    updateMoonInfo();
    // PERF: تأجيل renderCalendar على الصفحات غير الهجرية (توفير 100-150ms من load)
    const _onHijriCalPage = /\/(?:en\/)?hijri-calendar\//.test(window.location.pathname);
    if (_onHijriCalPage) {
        renderCalendar();
    } else if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => renderCalendar(), { timeout: 3000 });
    } else {
        setTimeout(() => renderCalendar(), 800);
    }

    // دعم SearchAction (?q=) على الصفحة الرئيسية
    handleHomeSearchQuery();

    // بدء العد التنازلي
    startCountdown();

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

    // تفعيل صفحة التاريخ الهجري عند URL /today-hijri-date
    const _isHijriPage = /\/(?:en\/)?today-hijri-date$/.test(window.location.pathname);
    if (_isHijriPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-hijri-today')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="hijri-today"]')?.classList.add('active');
        document.documentElement.classList.remove('hijri-today-page');
    }

    // تفعيل صفحة اليوم الهجري الفردي عند URL /hijri-date/26-shawwal-1447
    const _isHijriDayPage = /\/(?:en\/)?hijri-date\/\d+-[a-z-]+-\d+$/.test(window.location.pathname);
    if (_isHijriDayPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-hijri-day')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="hijri-today"]')?.classList.add('active');
        loadHijriDayPage();
        document.documentElement.classList.remove('hijri-day-page');
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
    }

    // تفعيل صفحة التقويم الهجري الشهري عند URL /hijri-calendar/shawwal-1447
    const _isHijriMonthPage = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar\/[a-z-]+-\d+$/.test(window.location.pathname);
    if (_isHijriMonthPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-hijri-month')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="hijri-calendar"]')?.classList.add('active');
        loadHijriMonthPage();
        document.documentElement.classList.remove('hijri-month-page');
    }

    // تفعيل صفحة تحويل التاريخ عند URL /dateconverter
    const _isDateConverterPage = /\/(?:(?:en|ar)\/)?dateconverter$/.test(window.location.pathname);
    if (_isDateConverterPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-date-converter')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="date-converter"]')?.classList.add('active');
    }

    // تفعيل صفحة الأدعية عند URL /duas
    const _isDuasPage = /\/(?:(?:en|ar)\/)?duas$/.test(window.location.pathname);
    if (_isDuasPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-duas')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="duas"]')?.classList.add('active');
    }

    // تفعيل صفحة القبلة عند URL /qibla (بدون -in-)
    const _isQiblaIndexPage = /\/(?:(?:en|ar)\/)?qibla$/.test(window.location.pathname);
    if (_isQiblaIndexPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-qibla')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="qibla"]')?.classList.add('active');
    }

    // تفعيل صفحة حاسبة الزكاة عند URL /zakat-calculator
    const _isZakatPage = /\/(?:(?:en|fr|tr|ur)\/)?zakat-calculator$/.test(window.location.pathname);
    if (_isZakatPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-zakat')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="zakat"]')?.classList.add('active');
    }

    // تفعيل صفحة القمر عند URL /moon-today (canonical) أو /moon-today-in-{slug}
    const _isMoonPage = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today(?:-in-[a-z][a-z0-9-]+)?$/.test(window.location.pathname);
    if (_isMoonPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-moon')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="moon"]')?.classList.add('active');
        // إعادة احتساب بيانات القمر بعد تفعيل القسم (لملء جدول التوقّعات والعنوان والموقع)
        try { updateMoonInfo(); } catch (_e) {}
    }

    // تفعيل القسم المطلوب من URL param ?page=xxx (مثل /?page=qibla)
    const _pageParam = new URLSearchParams(window.location.search).get('page');
    if (_pageParam && !_isQiblaPage && !_isMsbahaPage && !_isHijriPage && !_isDateConverterPage && !_isZakatPage && !_isMoonPage) {
        const _targetLink = document.querySelector(`.sidebar-nav a[data-page="${_pageParam}"]`);
        if (_targetLink) _targetLink.click();
    }
}

// ========= التنقل بين الصفحات =========
function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.dataset.page;

            // ── الصفحات التي لها URL خاص → تنقّل فوراً قبل أي تبديل ──────────

            // التاريخ الهجري → /today-hijri-date
            if (pageId === 'hijri-today' && window.location.protocol !== 'file:') {
                if (!/\/(?:en\/)?today-hijri-date$/.test(window.location.pathname)) {
                    if (currentLat && currentEnglishName) {
                        sessionStorage.setItem('city_hijri-today', JSON.stringify({
                            lat: currentLat, lng: currentLng, name: currentCity,
                            country: currentCountry, englishName: currentEnglishName,
                            countryCode: currentCountryCode, timezone: currentTimezone
                        }));
                    }
                    window.location.href = pageUrl('/today-hijri-date');
                }
                return;
            }

            // تحويل التاريخ → /dateconverter
            if (pageId === 'date-converter' && window.location.protocol !== 'file:') {
                if (!/\/(?:(?:en|ar)\/)?dateconverter$/.test(window.location.pathname)) {
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

            // القمر → /moon-today-in-{slug} — يربط دائمًا بمدينة:
            //   • من صفحة مدينة (prayer-times-in-X / qibla-in-X) → استخدم slugها
            //   • من الرئيسيّة/صفحة عامّة → استخدم المدينة المحدّدة حاليًّا (Mecca افتراضيًّا)
            //   • يبقى كما هو إن كان المستخدم أصلًا على أيّ صفحة قمر
            if (pageId === 'moon' && window.location.protocol !== 'file:') {
                const _alreadyOnMoon = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today(?:-in-[a-z][a-z0-9-]+)?$/.test(window.location.pathname);
                if (!_alreadyOnMoon) {
                    // 1) جرّب استخراج slug من URL صفحة المدينة الحاليّة (prayer-times-in-* / qibla-in-*)
                    let _moonSlug = window.location.pathname.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:prayer-times-in|qibla-in)-(.+?)(?:\.html)?$/)?.[1] || null;
                    // 2) fallback: من المدينة الحاليّة في الذاكرة (Mecca بشكل افتراضيّ في بداية الجلسة)
                    if (!_moonSlug && currentEnglishName && currentLat != null) {
                        try { _moonSlug = makeSlug(currentEnglishName, currentLat, currentLng); } catch (_e) { /* silent */ }
                    }
                    // 3) آخر ملجأ: مكّة
                    if (!_moonSlug) _moonSlug = 'mecca';
                    window.location.href = pageUrl(`/moon-today-in-${_moonSlug}`);
                }
                return;
            }

            // التقويم الهجري → /hijri-calendar (بدون سنة — landing page)
            if (pageId === 'hijri-calendar' && window.location.protocol !== 'file:') {
                // صفحة الهبوط الجديدة بدون سنة؛ السنة تُفتح من داخل الصفحة
                if (!/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar$/.test(window.location.pathname)) {
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

            // عند الانتقال لمواقيت الصلاة → انتقل لصفحة المدينة إذا كان هناك موقع محدد
            if (pageId === 'prayer-times' && window.location.protocol !== 'file:') {
                const _slug = (currentLat && currentEnglishName)
                    ? makeSlug(currentEnglishName, currentLat, currentLng)
                    : window.location.pathname.match(/\/(?:en\/)?(?:qibla-in|prayer-times-in)-(.+?)(?:\.html)?$/)?.[1] || null;
                if (_slug && currentLat) {
                    sessionStorage.setItem(`city_${_slug}`, JSON.stringify({
                        lat: currentLat, lng: currentLng, name: currentCity,
                        country: currentCountry, englishName: currentEnglishName, countryCode: currentCountryCode, timezone: currentTimezone
                    }));
                    window.location.href = pageUrl(`/prayer-times-in-${_slug}`);
                    return;
                }
            }

            // عند الانتقال لقسم القبلة
            if (pageId === 'qibla') {
                const _alreadyOnQibla = /\/(?:en\/)?qibla-in-/.test(window.location.pathname);
                if (!_alreadyOnQibla && currentLat && currentEnglishName && window.location.protocol !== 'file:') {
                    navigateToQibla(currentLat, currentLng, currentCity, currentCountry, currentEnglishName, currentCountryCode);
                    return;
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
    suggestionsEl.innerHTML = `<div class="search-loading">${isEnSearch ? '🔍 Searching...' : '🔍 جاري البحث...'}</div>`;
    suggestionsEl.classList.add('open');

    searchDebounceTimer = setTimeout(() => {
        fetchCitySuggestions(query);
    }, 400);
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
];

function searchLocalCities(query) {
    const q = query.trim().toLowerCase();
    return LOCAL_CITIES.filter(c =>
        c.ar.toLowerCase().includes(q) ||
        c.en.toLowerCase().includes(q)
    ).slice(0, 5);
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
        suggestionsEl.innerHTML = `<div class="search-loading">${isEnSugg ? '⏳ Searching...' : '⏳ جاري البحث...'}</div>`;
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
            btn.innerHTML = isEnSugg
                ? `<span>🌐</span> Search online for "${query}"`
                : `<span>🌐</span> ابحث على الإنترنت عن "${query}"`;
            btn.addEventListener('click', () => {
                btn.innerHTML = isEnSugg ? `<span>⏳</span> Searching...` : `<span>⏳</span> جاري البحث...`;
                btn.style.opacity = '0.6';
                btn.style.pointerEvents = 'none';
                fetchCityOnlineBroader(query);
            });
            suggestionsEl.appendChild(btn);
        }

        // الأنواع المرفوضة (أحياء وشوارع ومناطق فرعية)
        const rejected = new Set(['state', 'county', 'country', 'region',
                                  'continent', 'ocean', 'sea', 'island',
                                  'suburb', 'quarter', 'neighbourhood', 'hamlet',
                                  'road', 'path', 'footway', 'motorway', 'trunk',
                                  'primary', 'secondary', 'tertiary', 'unclassified',
                                  'service', 'track', 'living_street', 'residential']);
        let results = all.filter(p =>
            !rejected.has(p.addresstype) &&
            !rejected.has(p.type) &&
            p.class !== 'country' &&
            p.class !== 'highway'
        );

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

            // فلتر اسمي إضافي: استبعاد الأحياء والشوارع بالعربي والإنجليزي
            const rawName = place.name || '';
            if (rawName.startsWith('حي ') || rawName.startsWith('شارع ')) return;
            if (/\b(District|Neighborhood|Neighbourhood|Quarter|Street|Road|Avenue|Boulevard|Lane|Drive|Way)\s*$/i.test(rawName)) return;

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

    const rejected = new Set(['state','county','country','region','continent','ocean','sea','island',
                              'suburb','quarter','neighbourhood','hamlet','residential','plot',
                              'road','path','footway','motorway','trunk','primary','secondary',
                              'tertiary','unclassified','service','track','living_street']);
    const accepted = new Set(['city','town','village','municipality','borough','administrative']);

    fetch(url)
        .then(r => r.json())
        .catch(() => [])
        .then(data => {
            suggestionsEl.innerHTML = '';

            // فلترة: مدن وقرى فقط — استبعاد الأحياء والمناطق الفرعية
            const seen = new Set();
            const results = (data || [])
                .filter(p => {
                    if (seen.has(p.place_id)) return false;
                    seen.add(p.place_id);
                    const pt = p.addresstype || p.type || '';
                    if (rejected.has(pt) || p.class === 'country' || p.class === 'highway') return false;
                    if (pt && !accepted.has(pt) && p.class === 'place') return false;
                    // فلتر اسمي: أحياء وشوارع بالعربي والإنجليزي
                    const nm = p.name || '';
                    if (nm.startsWith('حي ') || nm.startsWith('شارع ')) return false;
                    if (/\b(District|Neighborhood|Neighbourhood|Quarter|Street|Road|Avenue|Boulevard|Lane|Drive|Way)\s*$/i.test(nm)) return false;
                    return true;
                })
                .slice(0, 6);

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
    const slug = makeSlug(englishName || city, lat, lng);
    // لا نخزّن timezone هنا لأن currentTimezone قد يكون للمدينة السابقة
    // سيتم جلب timezone الصحيح عند تحميل الصفحة الجديدة
    sessionStorage.setItem(`city_${slug}`, JSON.stringify({ lat, lng, name: city, country, englishName, countryCode }));
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
        // لغات مكتوبة بحروف لاتينية فقط → لا نقبل محتوى عربي
        // UR يستخدم خطّاً عربياً لكن فقط إذا كان يحوي أحرف أوردو خاصة (ليس مجرّد endonym عربي)
        const _isAcceptableScript = (s) => {
            if (!s) return false;
            if (!_hasArabicChar(s)) return true; // لاتيني/سيريليّ/لاتيني-ممتدّ → مقبول
            // يحوي حروفاً عربية — مقبول فقط إذا كانت UR وتحوي أحرف أوردو خاصّة
            return (lang === 'ur') && _hasUrduSpecific(s);
        };
        const targetEn = _normalizeEn(currentEnglishName);
        let cityMain = '';
        if (targetEn) {
            // المستويات من الأخصّ للأعمّ — بعض الدول (مثل الإمارات) تُسجِّل الإمارة كـ state (مثلاً Dubai)
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
                if (_normalizeEn(en) === targetEn) {
                    // إذا Nominatim لم يكن لديه ترجمة حقيقية → يُعيد endonym عربي (مثل "الجموم")
                    // فنَستخدم الإنجليزي بدلاً منه (مثلاً "Al Jumum" لصفحات DE/TR/FR)
                    cityMain = _isAcceptableScript(loc) ? loc : en;
                    break;
                }
            }
        }
        // fallback: الأولوية الأصلية (قرية > بلدة > مدينة) لحالات بدون currentEnglishName أو عدم مطابقة
        if (!cityMain) {
            const _localeFirst = addr.village || addr.hamlet || addr.town
                || addr.city || addr.municipality
                || (addr.state || '').trim()
                || nd[`name:${lang}`]
                || '';
            const _enFirst = addrEn.village || addrEn.hamlet || addrEn.town
                || addrEn.city || addrEn.municipality
                || (addrEn.state || '').trim()
                || '';
            cityMain = _isAcceptableScript(_localeFirst) ? _localeFirst : (_enFirst || _localeFirst);
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
    currentTimezone = timezone || await fetchTimezone(lat, lng);
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
}

// ========= قسم "عن المدينة" من ويكيبيديا (Point 12: محتوى فريد لكل مدينة) =========
async function loadCityAboutSection() {
    const section = document.getElementById('city-about-section');
    if (!section) return;

    // يظهر فقط في صفحات مواقيت المدينة
    const isCityPage = /\/(?:en\/)?prayer-times-in-/.test(window.location.pathname);
    if (!isCityPage) { section.style.display = 'none'; return; }

    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    // الاسم العربي لـar، الاسم المحلي (إن توفر) للغات الأخرى، ثم الإنجليزي كـfallback
    const cityName = (lang === 'ar')
        ? currentCity
        : (currentLocalizedName || currentEnglishName || currentCity);
    if (!cityName) { section.style.display = 'none'; return; }

    const titleEl   = document.getElementById('city-about-title');
    const extractEl = document.getElementById('city-about-extract');
    const linkEl    = document.getElementById('city-about-link');
    if (!titleEl || !extractEl || !linkEl) return;

    titleEl.textContent   = t('cityabout.title', { city: cityName });
    extractEl.textContent = t('cityabout.loading');
    linkEl.style.display  = 'none';
    section.style.display = 'block';
    section.classList.add('cls-ready');

    // كاش في localStorage (7 أيام) — v2 بعد إصلاح دعم tr/fr/ur/de
    const cacheKey = `wiki_city_v2_${lang}_${cityName}`;
    const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
    try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
            const obj = JSON.parse(raw);
            if (obj && obj.ts && (Date.now() - obj.ts) < CACHE_TTL && obj.data) {
                _renderCityAbout(obj.data, { titleEl, extractEl, linkEl, section, cityName });
                return;
            }
        }
    } catch(_) {}

    // محاولات متعددة: الاسم المحلي، الإنجليزي، ثم الكلمة الأولى من كل منهما
    const candidates = [];
    const _pushCand = (n) => { if (n && !candidates.includes(n)) candidates.push(n); };
    _pushCand(cityName);
    if (lang !== 'ar' && currentEnglishName && currentEnglishName !== cityName) {
        _pushCand(currentEnglishName);
    }
    // الكلمة الأولى كاحتياطي لأسماء مثل "Mecca Museum" أو "New York"
    for (const base of [...candidates]) {
        const firstToken = base.split(/\s+/)[0];
        if (firstToken && firstToken !== base && firstToken.length >= 3) {
            _pushCand(firstToken);
        }
    }

    for (const candidate of candidates) {
        try {
            const url = `/api/wiki-summary?title=${encodeURIComponent(candidate)}&lang=${encodeURIComponent(lang)}`;
            const r = await fetch(url);
            if (!r.ok) continue;
            const data = await r.json();
            if (!data || !data.extract) continue;
            try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data })); } catch(_) {}
            _renderCityAbout(data, { titleEl, extractEl, linkEl, section, cityName });
            return;
        } catch(_) { /* try next candidate */ }
    }
    section.style.display = 'none';
}

function _renderCityAbout(data, refs) {
    if (!data || !data.extract) { refs.section.style.display = 'none'; return; }
    // عند نجاح الـ fallback (مثلاً "Mecca Museum" → "Mecca")، استخدم عنوان ويكيبيديا الحقيقي
    const displayName = (data.title && data.title !== refs.cityName) ? data.title : refs.cityName;
    refs.titleEl.textContent = t('cityabout.title', { city: displayName });
    refs.extractEl.textContent = data.extract;
    if (data.url) {
        refs.linkEl.href = data.url;
        refs.linkEl.textContent = t('cityabout.read_more');
        refs.linkEl.style.display = 'inline-block';
    }
    refs.section.style.display = 'block';
    refs.section.classList.add('cls-ready');
}

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
        fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=en`)).then(r=>r.json()).catch(()=>null),
        30 * 86400000);

    Promise.all([arReq, enReq]).then(([arData, enData]) => {
        if (arData?.address) {
            const addr = arData.address;
            const enAddr = enData?.address || {};

            // اسم المدينة الرئيسية فقط (بدون أحياء) مع احتياط لحالة غياب city
            const arCityMain = addr.city || addr.town || addr.village
                || (addr.state || '').replace(/^منطقة\s+/, '').replace(/^محافظة\s+/, '').trim()
                || '';
            const rawEnCity = enAddr.city || enAddr.town || enAddr.village
                || (enAddr.state || '').replace(/\s*(Region|Governorate|Province)\b/gi, '').trim()
                || '';
            // حذف كلمة District من الأسماء الإنجليزية
            const enCityMain = rawEnCity.replace(/\s*District\b/gi, '').trim();

            currentCity = arCityMain || 'غير معروف';

            currentCountry     = addr.country || '';
            currentCountryCode = (addr.country_code || '').toLowerCase();

            // الاسم الإنجليزي (للـ slug والعرض): المدينة فقط بدون District
            currentEnglishName = (arData.namedetails?.['name:en']
                || arData.namedetails?.['name:en-US']
                || enCityMain
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
                englishName: currentEnglishName, countryCode: currentCountryCode, timezone: currentTimezone
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
    // AR: عربي — EN: إنجليزي — UR/TR/FR: الاسم المترجَم ثم الإنجليزي fallback
    const countryLabel = (lang === 'ar')
        ? (currentCountry        || currentEnglishCountry || countrySlug)
        : (lang === 'en')
            ? (currentEnglishCountry || currentCountry    || countrySlug)
            : (currentLocalizedCountry || currentEnglishCountry || currentCountry || countrySlug);
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
    const bcHome    = document.getElementById('bc-home');
    const bcCountry = document.getElementById('bc-country');
    const bcCity    = document.getElementById('bc-city');

    if (bcHome)    bcHome.textContent    = homeLabel;
    if (bcHome)    bcHome.href           = `${origin}${langPrefix}`;
    if (bcCountry) { bcCountry.textContent = countryFinal; bcCountry.href = countryHref; }
    if (bcCity)    bcCity.textContent    = finalLabel;  // <span> لا <a> — بدون href

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

    // تحديث العرض
    document.getElementById('time-fajr').textContent    = currentPrayerTimes.fajr;
    document.getElementById('time-sunrise').textContent = currentPrayerTimes.sunrise;
    document.getElementById('time-dhuhr').textContent   = currentPrayerTimes.dhuhr;
    document.getElementById('time-asr').textContent     = currentPrayerTimes.asr;
    document.getElementById('time-maghrib').textContent = currentPrayerTimes.maghrib;
    document.getElementById('time-isha').textContent    = currentPrayerTimes.isha;

    // تحديث المعلومات الإضافية
    const hijri = HijriDate.getToday();
    const dayName = HijriDate.dayNames[cityDate.getDay()];
    const hSuffix = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
    const gSuffix = (typeof t === 'function') ? t('date.greg_suffix') : ' م';
    const _dsLng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const dateSep = (_dsLng === 'ar' || _dsLng === 'ur') ? '، ' : ', ';
    document.getElementById('info-hijri').textContent =
        `${dayName}${dateSep}${hijri.day} ${HijriDate.hijriMonths[hijri.month-1]} ${hijri.year}${hSuffix}`;
    const gMonths = HijriDate.gregorianMonths;
    document.getElementById('info-gregorian').textContent =
        `${dayName}${dateSep}${cityDate.getDate()} ${gMonths[cityDate.getMonth()]} ${cityDate.getFullYear()}${gSuffix}`;

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

    // تحديث الصلاة النشطة
    updateActivePrayer();

    // تحديث جدول المواقيت
    scheduleStartDate = null; // إعادة ضبط إلى اليوم عند تغيير المدينة
    initScheduleDatePicker();
    renderPrayerSchedule(scheduleDays, null);

    // تحديث الأسئلة الشائعة
    updateFaqSection();

    // تحديث قسم مدن الدولة
    updateCountryCitiesSection();

    // تحديث قسم الكلمات المفتاحية
    updateSeoSection();

    // تحديث البوابة الذكية (الصفحة الرئيسية)
    updateHomeGateway();

    // تعبئة روابط الخدمات ذات الصلة (صفحات المدن فقط)
    updateCityRelatedServices();

    // حقن Event schema لأوقات الصلاة (صفحات المدن فقط)
    injectPrayerEventsSchema();
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
    const hijriYear   = HijriDate.getToday().year;
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
            { "@type": "SiteNavigationElement", "name": "التاريخ الهجري اليوم","url": `${origin}/today-hijri-date`             },
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
    if (params.get('detect') === '1') {
        if (typeof detectLocation === 'function') setTimeout(() => detectLocation(), 300);
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
    if (/^\/(?:en\/)?dateconverter$/.test(path)) {
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
    // fr/tr/ur/de: نُفضِّل currentLocalizedName (مِن Nominatim accept-language) إذا توفَّر،
    // وإلّا نرجع إلى englishName كحلّ وسط (لتجنُّب عرض اسم عربي في صفحة لاتينية)
    let cityDisplay, countryDisplay;
    if (lang === 'ar') {
        cityDisplay = city;
        countryDisplay = country || '';
    } else if (lang === 'en') {
        cityDisplay = englishName || city;
        countryDisplay = country || '';
    } else {
        cityDisplay = (typeof currentLocalizedName === 'string' && currentLocalizedName)
            ? currentLocalizedName : (englishName || city);
        countryDisplay = (typeof currentLocalizedCountry === 'string' && currentLocalizedCountry)
            ? currentLocalizedCountry : (country || '');
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
            url: pageUrl('/moon-today')
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
            errorEl.textContent   = 'يجب أن يكون تاريخ النهاية بعد تاريخ البداية أو مساوياً له';
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
            errorEl.textContent   = 'لا يمكن اختيار نطاق يتجاوز 365 يوماً';
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
    if (name) return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
    document.getElementById('next-prayer-name').textContent = (typeof t === 'function') ? t('prayer.' + next.key) : next.name;

    // تحديث البطاقة النشطة
    document.querySelectorAll('.prayer-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.prayer === next.key) {
            card.classList.add('active');
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

// إعادة ملء قوائم محوّل التاريخ بعد تغيير اللغة
function updateConverterSelects() {
    const gSelect = document.getElementById('conv-g-month');
    if (gSelect) {
        const curG = gSelect.value;
        gSelect.innerHTML = '';
        HijriDate.gregorianMonths.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i + 1;
            opt.textContent = m;
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
            opt.textContent = m;
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
        document.getElementById('current-time').textContent = _timeStr;

        // اسم المدينة في البانر
        document.getElementById('banner-city-name').textContent = getDisplayCity();

        // التاريخ الهجري والميلادي في البانر
        const hijri = HijriDate.getToday();
        const dayName = HijriDate.dayNames[cityTime.getDay()];
        const hijriMonthName = HijriDate.hijriMonths[hijri.month - 1];
        const hSfx = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
        const gSfx = (typeof t === 'function') ? t('date.greg_suffix') : ' م';
        const _bLng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const sep  = (_bLng === 'ar' || _bLng === 'ur') ? '، ' : ', ';
        const gMonths = HijriDate.gregorianMonths;
        document.getElementById('banner-hijri-date').textContent =
            `${dayName}${sep}${hijri.day} ${hijriMonthName} ${hijri.year}${hSfx}`;
        document.getElementById('banner-greg-date').textContent =
            `${dayName}${sep}${cityTime.getDate()} ${gMonths[cityTime.getMonth()]} ${cityTime.getFullYear()}${gSfx}`;

        // (التاريخ تحت الوقت تم حذفه حسب طلب المستخدم)

        if (!currentPrayerTimes) return;

        const next = PrayerTimes.getNextPrayer(currentPrayerTimes, currentTimezone);
        document.getElementById('next-prayer-name').textContent = (typeof t === 'function') ? t('prayer.' + next.key) : next.name;

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

        document.getElementById('next-prayer-countdown').textContent =
            `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

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

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
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

    // وصف المدينة من ويكيبيديا العربية
    const cityDescEl   = document.getElementById('city-wiki-desc');
    const readMoreBtn  = document.getElementById('city-read-more');
    const CITY_DESC_MAX = 200; // عدد الأحرف قبل "اقرأ المزيد"

    if (cityDescEl) {
        cityDescEl.textContent = '...';
        if (readMoreBtn) readMoreBtn.style.display = 'none';
        try {
            const wikiUrl = `https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(currentCity)}`;
            const wr = await fetch(wikiUrl);
            if (wr.ok) {
                const wd = await wr.json();
                if (wd.extract) {
                    const fullText = wd.extract;
                    if (fullText.length > CITY_DESC_MAX) {
                        cityDescEl.textContent = fullText.substring(0, CITY_DESC_MAX) + '...';
                        // زر اقرأ المزيد → صفحة about-{slug}
                        if (readMoreBtn) {
                            // prayerSlug: من URL الصفحة الحالية (الأدق) أو من الاسم الإنجليزي
                            const prayerSlug = getSlugFromURL()
                                || makeSlug(currentEnglishName || currentCity, currentLat, currentLng);
                            // احفظ البيانات مع prayerSlug لضمان تطابق رابط أوقات الصلاة
                            sessionStorage.setItem(`about_${prayerSlug}`, JSON.stringify({
                                city: currentCity, country: currentCountry,
                                countryCode: currentCountryCode,
                                lat: currentLat, lng: currentLng,
                                englishName: currentEnglishName || '',
                                prayerSlug: prayerSlug,
                                wikiTitle: wd.title || currentCity,
                                wikiExtract: fullText,
                                wikiUrl: wd.content_urls?.desktop?.page || wd.content_urls?.mobile?.page || '',
                            }));
                            const aboutUrl = pageUrl(`/about-${prayerSlug}.html`);
                            readMoreBtn.href = aboutUrl;
                            readMoreBtn.onclick = e => {
                                e.preventDefault();
                                window.location.href = aboutUrl;
                            };
                            readMoreBtn.style.display = 'inline-block';
                        }
                    } else {
                        cityDescEl.textContent = fullText;
                        if (readMoreBtn) readMoreBtn.style.display = 'none';
                    }
                } else { cityDescEl.textContent = ''; }
            } else { cityDescEl.textContent = ''; }
        } catch(e) { cityDescEl.textContent = ''; }
    }

    section.style.display = 'block';
    // CLS: على صفحات المدن البطاقة محجوزة مسبقاً (visibility:hidden) — نكشفها الآن
    section.classList.add('cls-ready');
}

// ========= الأماكن القريبة =========
async function fetchNearbyPlaces(lat, lng) {
    const section = document.getElementById('nearby-section');
    const grid = document.getElementById('nearby-grid');
    grid.innerHTML = '<div style="padding:16px;color:var(--text-light)">⏳ جاري البحث عن أماكن قريبة...</div>';
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
            return { lat: elLat, lon: elLon, dist, nameAr, nameEn, icon };
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
            return { lat: el.lat, lon: el.lon, dist, nameAr, nameEn, icon };
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
        grid.innerHTML = '<div style="padding:16px;color:var(--text-light)">لا توجد أماكن قريبة</div>';
        return;
    }

    _cachedNearbyPlaces = places;
    renderNearbyGrid(places, grid);
}

function renderNearbyGrid(places, grid) {
    if (!grid) grid = document.getElementById('nearby-grid');
    if (!grid || !places || places.length === 0) return;
    grid.innerHTML = '';
    places.forEach(place => {
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
        const nearbyTitle = isArNearby
            ? `مواقيت الصلاة في ${place.nameAr}`
            : ((typeof t === 'function') ? t('prayer_times_in', { city: placeLabel }) : `Prayer Times in ${placeLabel}`);

        const a = document.createElement('a');
        a.className = 'nearby-item';
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

function updateQibla() {
    _qiblaAngle = Qibla.calculate(currentLat, currentLng);
    const _ln = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const direction = Qibla.getDirection(_qiblaAngle, _ln);
    const distance = Qibla.getDistance(currentLat, currentLng);

    document.getElementById('qibla-angle').textContent = _qiblaAngle.toFixed(1) + '°';
    document.getElementById('qibla-direction').textContent = t('qibla.direction_label', { dir: direction });
    const _distLocale = _ln === 'ar' ? 'ar' : (_ln === 'ur' ? 'ur' : (_ln === 'fr' ? 'fr' : (_ln === 'tr' ? 'tr' : (_ln === 'de' ? 'de' : 'en'))));
    document.getElementById('qibla-distance').textContent = t('qibla.distance_to_kaaba', {
        distance: distance.toLocaleString(_distLocale),
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

    let _usingAbsolute = false;

    _orientationHandler = function(e) {
        // على iOS: استخدم webkitCompassHeading (شمال حقيقي)
        if (e.webkitCompassHeading != null && !isNaN(e.webkitCompassHeading)) {
            _applyCompassHeading(e.webkitCompassHeading);
            return;
        }
        // على Android: فضّل deviceorientationabsolute واتجاهل deviceorientation العادي
        if (e.type === 'deviceorientation' && _usingAbsolute) return;
        if (e.type === 'deviceorientationabsolute') _usingAbsolute = true;
        if (e.alpha == null) return;
        _applyCompassHeading((360 - e.alpha) % 360);
    };

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ يحتاج إذن صريح — أظهر الزر
        const btn = document.getElementById('compass-permission-btn');
        if (btn) btn.style.display = 'block';
    } else {
        // Android وغيرها — يعمل تلقائياً
        window.addEventListener('deviceorientationabsolute', _orientationHandler, true);
        window.addEventListener('deviceorientation',         _orientationHandler, true);
        _compassListening = true;
    }
}

function requestCompassPermission() {
    if (typeof DeviceOrientationEvent.requestPermission !== 'function') return;
    DeviceOrientationEvent.requestPermission().then(state => {
        if (state === 'granted') {
            window.addEventListener('deviceorientationabsolute', _orientationHandler, true);
            window.addEventListener('deviceorientation',         _orientationHandler, true);
            _compassListening = true;
            const btn = document.getElementById('compass-permission-btn');
            if (btn) btn.style.display = 'none';
        }
    }).catch(console.error);
}

// ========= القمر =========
// جدول المدن المشهورة (يُطابق FAMOUS_CITY_OVERRIDES في server.js) —
// يُستخدم فقط على صفحة /moon-today-in-{slug} لمطابقة الإحداثيّات مع الـ URL.
const FAMOUS_MOON_CITIES = {
    'mecca':         { lat: 21.4225, lng: 39.8262 },
    'medina':        { lat: 24.4672, lng: 39.6112 },
    'riyadh':        { lat: 24.7136, lng: 46.6753 },
    'jeddah':        { lat: 21.4858, lng: 39.1925 },
    'dammam':        { lat: 26.4207, lng: 50.0888 },
    'cairo':         { lat: 30.0444, lng: 31.2357 },
    'alexandria':    { lat: 31.2001, lng: 29.9187 },
    'istanbul':      { lat: 41.0082, lng: 28.9784 },
    'ankara':        { lat: 39.9334, lng: 32.8597 },
    'dubai':         { lat: 25.2048, lng: 55.2708 },
    'abu-dhabi':     { lat: 24.4539, lng: 54.3773 },
    'doha':          { lat: 25.2854, lng: 51.5310 },
    'kuwait':        { lat: 29.3759, lng: 47.9774 },
    'manama':        { lat: 26.2285, lng: 50.5860 },
    'muscat':        { lat: 23.5859, lng: 58.4059 },
    'amman':         { lat: 31.9454, lng: 35.9284 },
    'baghdad':       { lat: 33.3152, lng: 44.3661 },
    'beirut':        { lat: 33.8938, lng: 35.5018 },
    'damascus':      { lat: 33.5138, lng: 36.2765 },
    'sanaa':         { lat: 15.3694, lng: 44.1910 },
    'tunis':         { lat: 36.8065, lng: 10.1815 },
    'algiers':       { lat: 36.7538, lng: 3.0588 },
    'rabat':         { lat: 34.0209, lng: -6.8416 },
    'casablanca':    { lat: 33.5731, lng: -7.5898 },
    'khartoum':      { lat: 15.5007, lng: 32.5599 },
    'tripoli':       { lat: 32.8872, lng: 13.1913 },
    'jerusalem':     { lat: 31.7683, lng: 35.2137 },
    'karachi':       { lat: 24.8607, lng: 67.0011 },
    'lahore':        { lat: 31.5204, lng: 74.3587 },
    'islamabad':     { lat: 33.6844, lng: 73.0479 },
    'dhaka':         { lat: 23.8103, lng: 90.4125 },
    'jakarta':       { lat: -6.2088, lng: 106.8456 },
    'kuala-lumpur':  { lat: 3.1390, lng: 101.6869 },
    'london':        { lat: 51.5074, lng: -0.1278 },
    'paris':         { lat: 48.8566, lng: 2.3522 },
    'berlin':        { lat: 52.5200, lng: 13.4050 },
    'madrid':        { lat: 40.4168, lng: -3.7038 },
    'rome':          { lat: 41.9028, lng: 12.4964 },
    'new-york':      { lat: 40.7128, lng: -74.0060 },
    'toronto':       { lat: 43.6532, lng: -79.3832 },
    'sydney':        { lat: -33.8688, lng: 151.2093 }
};

function _moonCitySlugFromPath() {
    const m = window.location.pathname.match(/\/moon-today-in-([a-z][a-z0-9-]+)$/);
    return m ? m[1] : null;
}

function _prettifySlug(slug) {
    return String(slug || '')
        .split('-')
        .map(w => w.length ? w[0].toUpperCase() + w.slice(1) : w)
        .join(' ');
}

// يرجع اسم المدينة بلغة الواجهة (من i18n key "city.<slug_normalized>" إن وُجد)،
// وإلاّ يعود إلى تجميل الـ slug.
function _moonCityDisplayName(slug) {
    if (!slug) return '';
    const key = 'city.' + slug.replace(/-/g, '_');
    if (typeof t === 'function') {
        const localized = t(key);
        if (localized && localized !== key) return localized;
    }
    return _prettifySlug(slug);
}

// خريطة المدينة → البلد (key 'country.<code>' في i18n)؛ تُستخدم في الفقرة التعريفيّة وH1
const _MOON_CITY_COUNTRY_KEYS = {
    'mecca': 'sa', 'medina': 'sa', 'riyadh': 'sa', 'jeddah': 'sa', 'dammam': 'sa',
    'cairo': 'eg', 'alexandria': 'eg',
    'istanbul': 'tr', 'ankara': 'tr',
    'dubai': 'ae', 'abu-dhabi': 'ae',
    'doha': 'qa', 'kuwait': 'kw', 'manama': 'bh', 'muscat': 'om',
    'amman': 'jo', 'baghdad': 'iq', 'beirut': 'lb', 'damascus': 'sy', 'sanaa': 'ye',
    'tunis': 'tn', 'algiers': 'dz', 'rabat': 'ma', 'casablanca': 'ma',
    'khartoum': 'sd', 'tripoli': 'ly', 'jerusalem': 'ps',
    'karachi': 'pk', 'lahore': 'pk', 'islamabad': 'pk',
    'dhaka': 'bd', 'jakarta': 'id', 'kuala-lumpur': 'my',
    'london': 'gb', 'paris': 'fr', 'berlin': 'de', 'madrid': 'es', 'rome': 'it',
    'new-york': 'us', 'toronto': 'ca', 'sydney': 'au'
};
const _MOON_COUNTRY_NAMES = {
    ar: { sa:'السعوديّة', eg:'مصر', tr:'تركيا', ae:'الإمارات', qa:'قطر', kw:'الكويت', bh:'البحرين', om:'عُمان', jo:'الأردن', iq:'العراق', lb:'لبنان', sy:'سوريا', ye:'اليمن', tn:'تونس', dz:'الجزائر', ma:'المغرب', sd:'السودان', ly:'ليبيا', ps:'فلسطين', pk:'باكستان', bd:'بنغلاديش', id:'إندونيسيا', my:'ماليزيا', gb:'المملكة المتّحدة', fr:'فرنسا', de:'ألمانيا', es:'إسبانيا', it:'إيطاليا', us:'الولايات المتّحدة', ca:'كندا', au:'أستراليا' },
    en: { sa:'Saudi Arabia', eg:'Egypt', tr:'Turkey', ae:'UAE', qa:'Qatar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Jordan', iq:'Iraq', lb:'Lebanon', sy:'Syria', ye:'Yemen', tn:'Tunisia', dz:'Algeria', ma:'Morocco', sd:'Sudan', ly:'Libya', ps:'Palestine', pk:'Pakistan', bd:'Bangladesh', id:'Indonesia', my:'Malaysia', gb:'United Kingdom', fr:'France', de:'Germany', es:'Spain', it:'Italy', us:'United States', ca:'Canada', au:'Australia' },
    fr: { sa:'Arabie saoudite', eg:'Égypte', tr:'Turquie', ae:'Émirats arabes unis', qa:'Qatar', kw:'Koweït', bh:'Bahreïn', om:'Oman', jo:'Jordanie', iq:'Irak', lb:'Liban', sy:'Syrie', ye:'Yémen', tn:'Tunisie', dz:'Algérie', ma:'Maroc', sd:'Soudan', ly:'Libye', ps:'Palestine', pk:'Pakistan', bd:'Bangladesh', id:'Indonésie', my:'Malaisie', gb:'Royaume-Uni', fr:'France', de:'Allemagne', es:'Espagne', it:'Italie', us:'États-Unis', ca:'Canada', au:'Australie' },
    tr: { sa:'Suudi Arabistan', eg:'Mısır', tr:'Türkiye', ae:'BAE', qa:'Katar', kw:'Kuveyt', bh:'Bahreyn', om:'Umman', jo:'Ürdün', iq:'Irak', lb:'Lübnan', sy:'Suriye', ye:'Yemen', tn:'Tunus', dz:'Cezayir', ma:'Fas', sd:'Sudan', ly:'Libya', ps:'Filistin', pk:'Pakistan', bd:'Bangladeş', id:'Endonezya', my:'Malezya', gb:'Birleşik Krallık', fr:'Fransa', de:'Almanya', es:'İspanya', it:'İtalya', us:'ABD', ca:'Kanada', au:'Avustralya' },
    ur: { sa:'سعودی عرب', eg:'مصر', tr:'ترکی', ae:'متحدہ عرب امارات', qa:'قطر', kw:'کویت', bh:'بحرین', om:'عمان', jo:'اردن', iq:'عراق', lb:'لبنان', sy:'شام', ye:'یمن', tn:'تیونس', dz:'الجزائر', ma:'مراکش', sd:'سوڈان', ly:'لیبیا', ps:'فلسطین', pk:'پاکستان', bd:'بنگلہ دیش', id:'انڈونیشیا', my:'ملیشیا', gb:'برطانیہ', fr:'فرانس', de:'جرمنی', es:'اسپین', it:'اٹلی', us:'امریکہ', ca:'کینیڈا', au:'آسٹریلیا' },
    de: { sa:'Saudi-Arabien', eg:'Ägypten', tr:'Türkei', ae:'VAE', qa:'Katar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Jordanien', iq:'Irak', lb:'Libanon', sy:'Syrien', ye:'Jemen', tn:'Tunesien', dz:'Algerien', ma:'Marokko', sd:'Sudan', ly:'Libyen', ps:'Palästina', pk:'Pakistan', bd:'Bangladesch', id:'Indonesien', my:'Malaysia', gb:'Vereinigtes Königreich', fr:'Frankreich', de:'Deutschland', es:'Spanien', it:'Italien', us:'USA', ca:'Kanada', au:'Australien' },
    id: { sa:'Arab Saudi', eg:'Mesir', tr:'Turki', ae:'UEA', qa:'Qatar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Yordania', iq:'Irak', lb:'Lebanon', sy:'Suriah', ye:'Yaman', tn:'Tunisia', dz:'Aljazair', ma:'Maroko', sd:'Sudan', ly:'Libya', ps:'Palestina', pk:'Pakistan', bd:'Bangladesh', id:'Indonesia', my:'Malaysia', gb:'Britania Raya', fr:'Prancis', de:'Jerman', es:'Spanyol', it:'Italia', us:'Amerika Serikat', ca:'Kanada', au:'Australia' },
    es: { sa:'Arabia Saudí', eg:'Egipto', tr:'Turquía', ae:'EAU', qa:'Catar', kw:'Kuwait', bh:'Baréin', om:'Omán', jo:'Jordania', iq:'Irak', lb:'Líbano', sy:'Siria', ye:'Yemen', tn:'Túnez', dz:'Argelia', ma:'Marruecos', sd:'Sudán', ly:'Libia', ps:'Palestina', pk:'Pakistán', bd:'Bangladés', id:'Indonesia', my:'Malasia', gb:'Reino Unido', fr:'Francia', de:'Alemania', es:'España', it:'Italia', us:'Estados Unidos', ca:'Canadá', au:'Australia' },
    bn: { sa:'সৌদি আরব', eg:'মিশর', tr:'তুরস্ক', ae:'সংযুক্ত আরব আমিরাত', qa:'কাতার', kw:'কুয়েত', bh:'বাহরাইন', om:'ওমান', jo:'জর্ডান', iq:'ইরাক', lb:'লেবানন', sy:'সিরিয়া', ye:'ইয়েমেন', tn:'তিউনিসিয়া', dz:'আলজেরিয়া', ma:'মরক্কো', sd:'সুদান', ly:'লিবিয়া', ps:'ফিলিস্তিন', pk:'পাকিস্তান', bd:'বাংলাদেশ', id:'ইন্দোনেশিয়া', my:'মালয়েশিয়া', gb:'যুক্তরাজ্য', fr:'ফ্রান্স', de:'জার্মানি', es:'স্পেন', it:'ইতালি', us:'মার্কিন যুক্তরাষ্ট্র', ca:'কানাডা', au:'অস্ট্রেলিয়া' },
    ms: { sa:'Arab Saudi', eg:'Mesir', tr:'Turki', ae:'UAE', qa:'Qatar', kw:'Kuwait', bh:'Bahrain', om:'Oman', jo:'Jordan', iq:'Iraq', lb:'Lubnan', sy:'Syria', ye:'Yaman', tn:'Tunisia', dz:'Algeria', ma:'Maghribi', sd:'Sudan', ly:'Libya', ps:'Palestin', pk:'Pakistan', bd:'Bangladesh', id:'Indonesia', my:'Malaysia', gb:'United Kingdom', fr:'Perancis', de:'Jerman', es:'Sepanyol', it:'Itali', us:'Amerika Syarikat', ca:'Kanada', au:'Australia' }
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

function updateMoonInfo() {
    const today = new Date();

    // إن كانت الصفحة هي /moon-today-in-{slug} → استخدم إحداثيّات المدينة لمطابقة الـ URL
    const _citySlug = _moonCitySlugFromPath();
    const _cityCoords = _citySlug && FAMOUS_MOON_CITIES[_citySlug];
    const _lat = _cityCoords ? _cityCoords.lat : currentLat;
    const _lng = _cityCoords ? _cityCoords.lng : currentLng;

    const phase = MoonCalc.getPhaseName(today);
    const illumination = MoonCalc.getMoonIllumination(today);
    const age = MoonCalc.getMoonAge(today);
    const moonTimes = MoonCalc.getMoonTimes(today, _lat, _lng);
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
    const _fcBody = document.getElementById('moon-forecast-body');
    const _getForecast = MoonCalc.getForecast || MoonCalc.get7DayForecast;
    if (_fcBody && typeof _getForecast === 'function') {
        const fc = MoonCalc.getForecast ? MoonCalc.getForecast(today, _lat, _lng, 14) : MoonCalc.get7DayForecast(today, _lat, _lng);
        let html = '';
        for (let i = 0; i < fc.length; i++) {
            const row = fc[i];
            const wd = _wk[row.date.getDay()];
            const dd = row.date.getDate();
            const mm = _gm[row.date.getMonth()];
            const phaseLabel = (row.phase.key && typeof t === 'function') ? t(row.phase.key) : row.phase.name;
            html += `<tr>`
                + `<td>${wd} ${dd} ${mm}</td>`
                + `<td><span class="fc-phase-icon" aria-hidden="true">${row.phase.icon}</span> ${phaseLabel}</td>`
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
    } catch (_err) {
        // فشل هادئ — تبقى الإجابات الافتراضيّة ظاهرة
        if (window.console && console.warn) console.warn('Dynamic moon FAQ fill failed:', _err);
    }

    // ── Round 10: الكوكبة + الفقرة التعريفيّة + المقارنة مع الأمس + نظرة على الطور ─
    try {
        const _cityDisplay2 = _citySlug
            ? _moonCityDisplayName(_citySlug)
            : (currentCity || (_lng_ === 'ar' ? 'مدينتك' : 'your city'));
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
        const _introEl = document.getElementById('moon-intro');
        if (_introEl && typeof t === 'function' && zodiac) {
            const zName = t(zodiac.i18nKey);
            const zNameDisplay = (zName && zName !== zodiac.i18nKey) ? zName : zodiac.key;
            const _cityLabelForIntro = _citySlug
                ? _moonCityLabel(_citySlug, _lng_, _cityDisplay2)
                : _cityDisplay2;
            const tpl = t('moon.intro_template', {
                city: _cityLabelForIntro,
                country: _countryDisplay,
                phaseIcon: phase.icon,
                phaseName: _phaseLabel2,
                illum: _fmtNum2(illumination, 2),
                age: _fmtNum2(age, 2),
                zodiacIcon: zodiac.icon,
                zodiacName: zNameDisplay
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
        desc:(c,l)=>`اعرف التاريخ الهجري اليوم بدقة في ${c} حسب تقويم أم القرى، مع إمكانية ${l} بسهولة.`,
        descLink:'تحويل التاريخ بين الهجري والميلادي',
        infoLabels:['اليوم','التاريخ الهجري','التاريخ الميلادي','الشهر','السنة','سنة كبيسة'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} هـ`, infoGreg:g=>`${g} م`, infoYear:y=>`${y} هـ`,
        leapYes:'نعم (355 يوماً)', leapNo:'لا (354 يوماً)',
        ctaConv:'🔥 تحويل التاريخ هجري ميلادي',
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
        footer:c=>`يعتمد التقويم الهجري على دورة القمر، ويستخدم في تحديد المناسبات الإسلامية مثل رمضان والحج. يعرض هذا الموقع التاريخ الهجري اليوم بدقة حسب تقويم أم القرى في ${c}. يمكنك أيضاً استخدام أداة تحويل التاريخ بين الهجري والميلادي، أو تصفح التقويم الهجري الكامل، أو معرفة التاريخ الهجري اليوم.`,
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
        desc:(c,l)=>`Know today's Hijri date accurately in ${c} according to the Umm al-Qura calendar, with the ability to ${l} easily.`,
        descLink:'convert dates between Hijri and Gregorian',
        infoLabels:['Day','Hijri Date','Gregorian Date','Month','Year','Leap Year'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} AH`, infoGreg:g=>`${g} CE`, infoYear:y=>`${y} AH`,
        leapYes:'Yes (355 days)', leapNo:'No (354 days)',
        ctaConv:'🔥 Convert Hijri ↔ Gregorian',
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
        footer:c=>`The Hijri calendar is based on the lunar cycle and is used to determine Islamic occasions such as Ramadan and Hajj. This site displays today's Hijri date accurately according to the Umm al-Qura calendar in ${c}. You can also use the date converter tool to convert between Hijri and Gregorian, or browse the full Hijri calendar.`,
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
        desc:(c,l)=>`Connaissez la date hégirienne d'aujourd'hui avec précision en ${c} selon le calendrier Oumm al-Qura, avec la possibilité de ${l} facilement.`,
        descLink:'convertir les dates entre hégirien et grégorien',
        infoLabels:['Jour','Date hégirienne','Date grégorienne','Mois','Année','Année bissextile'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} AH`, infoGreg:g=>`${g}`, infoYear:y=>`${y} AH`,
        leapYes:'Oui (355 jours)', leapNo:'Non (354 jours)',
        ctaConv:'🔥 Convertir hégirien ↔ grégorien',
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
        footer:c=>`Le calendrier hégirien est basé sur le cycle lunaire et sert à déterminer les occasions islamiques comme le Ramadan et le Hajj. Ce site affiche la date hégirienne d'aujourd'hui avec précision selon le calendrier Oumm al-Qura en ${c}. Vous pouvez aussi utiliser le convertisseur pour convertir entre hégirien et grégorien, ou parcourir le calendrier hégirien complet.`,
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
        desc:(c,l)=>`${c} için bugünün Hicri tarihini Ümmü'l-Kurra takvimine göre tam olarak öğrenin, ayrıca ${l} kolayca yapabilirsiniz.`,
        descLink:'Hicri ile Miladi arasında tarih dönüştürme',
        infoLabels:['Gün','Hicri Tarih','Miladi Tarih','Ay','Yıl','Artık Yıl'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} H`, infoGreg:g=>`${g} M`, infoYear:y=>`${y} H`,
        leapYes:'Evet (355 gün)', leapNo:'Hayır (354 gün)',
        ctaConv:'🔥 Hicri ↔ Miladi Dönüştür',
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
        footer:c=>`Hicri takvim, ay döngüsüne dayanır ve Ramazan ile Hac gibi İslami olayları belirlemede kullanılır. Bu site, ${c} için bugünün Hicri tarihini Ümmü'l-Kurra takvimine göre tam olarak gösterir. Ayrıca Hicri ile Miladi arasında dönüştürme aracını kullanabilir veya tam Hicri takvime göz atabilirsiniz.`,
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
        desc:(c,l)=>`${c} میں آج کی ہجری تاریخ ام القریٰ کیلنڈر کے مطابق بالکل درست جانیں، اور آسانی سے ${l} کر سکتے ہیں۔`,
        descLink:'ہجری اور عیسوی کے درمیان تاریخ کی تبدیلی',
        infoLabels:['دن','ہجری تاریخ','عیسوی تاریخ','مہینہ','سال','لیپ سال'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} ہجری`, infoGreg:g=>`${g} عیسوی`, infoYear:y=>`${y} ہجری`,
        leapYes:'ہاں (355 دن)', leapNo:'نہیں (354 دن)',
        ctaConv:'🔥 ہجری ↔ عیسوی تبدیل کریں',
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
        footer:c=>`ہجری کیلنڈر چاند کے چکر پر مبنی ہے اور رمضان اور حج جیسے اسلامی مواقع کا تعین کرنے کے لیے استعمال ہوتا ہے۔ یہ سائٹ ${c} میں ام القریٰ کیلنڈر کے مطابق آج کی ہجری تاریخ درست طور پر دکھاتی ہے۔ آپ ہجری اور عیسوی کے درمیان تبدیل کرنے کے لیے کنورٹر بھی استعمال کر سکتے ہیں یا مکمل ہجری کیلنڈر دیکھ سکتے ہیں۔`,
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
        desc:(c,l)=>`Erfahren Sie das heutige Hidschri-Datum in ${c} genau nach dem Umm-al-Qura-Kalender und können Sie einfach ${l}.`,
        descLink:'Daten zwischen Hidschri und Gregorianisch umrechnen',
        infoLabels:['Tag','Hidschri-Datum','Gregorianisches Datum','Monat','Jahr','Schaltjahr'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} AH`, infoGreg:g=>`${g} n. Chr.`, infoYear:y=>`${y} AH`,
        leapYes:'Ja (355 Tage)', leapNo:'Nein (354 Tage)',
        ctaConv:'🔥 Hidschri ↔ Gregorianisch umrechnen',
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
        footer:c=>`Der Hidschri-Kalender basiert auf dem Mondzyklus und dient zur Bestimmung islamischer Anlässe wie Ramadan und Hadsch. Diese Seite zeigt das heutige Hidschri-Datum in ${c} genau nach dem Umm-al-Qura-Kalender. Sie können auch das Umrechnungstool verwenden, um zwischen Hidschri und Gregorianisch umzurechnen, oder den vollständigen Hidschri-Kalender durchsuchen.`,
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
        desc:(c,l)=>`Ketahui tanggal Hijriah hari ini secara akurat di ${c} menurut kalender Umm al-Qura, dengan kemampuan untuk ${l} dengan mudah.`,
        descLink:'mengonversi tanggal antara Hijriah dan Masehi',
        infoLabels:['Hari','Tanggal Hijriah','Tanggal Masehi','Bulan','Tahun','Tahun Kabisat'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} H`, infoGreg:g=>`${g} M`, infoYear:y=>`${y} H`,
        leapYes:'Ya (355 hari)', leapNo:'Tidak (354 hari)',
        ctaConv:'🔥 Konversi Hijriah ↔ Masehi',
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
        footer:c=>`Kalender Hijriah didasarkan pada siklus bulan dan digunakan untuk menentukan peristiwa Islam seperti Ramadan dan Haji. Situs ini menampilkan tanggal Hijriah hari ini secara akurat menurut kalender Umm al-Qura di ${c}. Anda juga dapat menggunakan alat konverter tanggal untuk mengonversi antara Hijriah dan Masehi, atau menelusuri kalender Hijriah lengkap.`,
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
        desc:(c,l)=>`Conoce la fecha Hégira de hoy con precisión en ${c} según el calendario Umm al-Qura, con la capacidad de ${l} fácilmente.`,
        descLink:'convertir fechas entre Hégira y Gregoriano',
        infoLabels:['Día','Fecha Hégira','Fecha Gregoriana','Mes','Año','Año Bisiesto'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} AH`, infoGreg:g=>`${g} d.C.`, infoYear:y=>`${y} AH`,
        leapYes:'Sí (355 días)', leapNo:'No (354 días)',
        ctaConv:'🔥 Convertir Hégira ↔ Gregoriano',
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
        footer:c=>`El calendario Hégira se basa en el ciclo lunar y se utiliza para determinar las ocasiones islámicas como el Ramadán y el Hach. Este sitio muestra la fecha Hégira de hoy con precisión según el calendario Umm al-Qura en ${c}. También puedes usar la herramienta de conversión de fechas para convertir entre Hégira y Gregoriano, o explorar el calendario Hégira completo.`,
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
        desc:(c,l)=>`${c}-এ উম্মুল কুরা ক্যালেন্ডার অনুযায়ী আজকের হিজরি তারিখ সঠিকভাবে জানুন, এবং সহজেই ${l} করতে পারেন।`,
        descLink:'হিজরি ও খ্রিস্টীয় তারিখের মধ্যে রূপান্তর',
        infoLabels:['দিন','হিজরি তারিখ','খ্রিস্টীয় তারিখ','মাস','বছর','অধিবর্ষ'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} হিজরি`, infoGreg:g=>`${g} খ্রিস্টাব্দ`, infoYear:y=>`${y} হিজরি`,
        leapYes:'হ্যাঁ (৩৫৫ দিন)', leapNo:'না (৩৫৪ দিন)',
        ctaConv:'🔥 হিজরি ↔ খ্রিস্টীয় রূপান্তর',
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
        footer:c=>`হিজরি ক্যালেন্ডার চন্দ্র চক্রের উপর ভিত্তি করে তৈরি এবং রমজান ও হজের মতো ইসলামি অনুষ্ঠান নির্ধারণে ব্যবহৃত হয়। এই সাইট ${c}-এ উম্মুল কুরা ক্যালেন্ডার অনুযায়ী আজকের হিজরি তারিখ সঠিকভাবে প্রদর্শন করে। আপনি হিজরি ও খ্রিস্টীয়ের মধ্যে রূপান্তর করার জন্য তারিখ রূপান্তরকারী টুলটিও ব্যবহার করতে পারেন, অথবা সম্পূর্ণ হিজরি ক্যালেন্ডার ব্রাউজ করতে পারেন।`,
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
        desc:(c,l)=>`Ketahui tarikh Hijrah hari ini dengan tepat di ${c} mengikut kalendar Umm al-Qura, dengan kemampuan untuk ${l} dengan mudah.`,
        descLink:'menukar tarikh antara Hijrah dan Masihi',
        infoLabels:['Hari','Tarikh Hijrah','Tarikh Masihi','Bulan','Tahun','Tahun Lompat'],
        infoHijri:(d,m,y)=>`${d} ${m} ${y} H`, infoGreg:g=>`${g} M`, infoYear:y=>`${y} H`,
        leapYes:'Ya (355 hari)', leapNo:'Tidak (354 hari)',
        ctaConv:'🔥 Tukar Hijrah ↔ Masihi',
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
        footer:c=>`Kalendar Hijrah berdasarkan kitaran bulan dan digunakan untuk menentukan peristiwa Islam seperti Ramadan dan Haji. Laman ini memaparkan tarikh Hijrah hari ini dengan tepat mengikut kalendar Umm al-Qura di ${c}. Anda juga boleh menggunakan alat penukar tarikh untuk menukar antara Hijrah dan Masihi, atau melayari kalendar Hijrah penuh.`,
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
        const calUrl    = `${prefix}/hijri-calendar/${hijri.year}`;
        const _t        = (typeof t === 'function') ? t : (k) => k;
        const homeL     = _t('breadcrumb.home') || T.bcHome;
        htBcEl.innerHTML = _buildHijriBreadcrumbOl([
            { href: homeUrl,   text: homeL },
            { href: calUrl,    text: T.bcCal  },
            { href: yearUrl,   text: T.bcYear(hijri.year) },
            { href: monthUrl0, text: T.bcMonth(monthName, hijri.year) },
            { text: T.bcDay(hijri.day, monthName, hijri.year), current: true }
        ]);
    }

    // ── 1. Hero ──────────────────────────────────────────────────
    const fullEl = document.getElementById('hijri-today-full');
    if (fullEl) fullEl.textContent = T.hero(dayName, hijri.day, monthName, hijri.year);

    const gregEl = document.getElementById('hijri-today-greg');
    if (gregEl) gregEl.textContent = T.greg(dayName, gregToday);

    const descEl = document.getElementById('hijri-today-desc');
    if (descEl) {
        const cvPath = `${prefix}/dateconverter`;
        const linkHtml = `<a href="${cvPath}" style="color:var(--primary);text-decoration:underline;">${T.descLink}</a>`;
        descEl.innerHTML = T.desc(country, linkHtml);
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

    // ── 3. CTA Links ─────────────────────────────────────────────
    const ctaEl = document.getElementById('hijri-today-cta');
    if (ctaEl) {
        const monthUrl  = hijriMonthUrl(hijri.year, hijri.month);
        const yearUrl   = `${prefix}/hijri-calendar/${hijri.year}`;
        const todayUrl  = hijriDayUrl(hijri.year, hijri.month, hijri.day);
        const ctas = [
            [`${prefix}/dateconverter`, T.ctaConv, true],
            [todayUrl,                  T.ctaToday(dayName, hijri.day, monthName, hijri.year), false],
            [monthUrl,                  T.ctaMonth(monthName, hijri.year), false],
            [yearUrl,                   T.ctaYear(hijri.year), false],
        ];
        ctaEl.innerHTML = ctas.map(([href, text, primary]) =>
            `<a href="${href}" style="display:inline-block;padding:10px 20px;background:${primary ? 'var(--primary)' : 'var(--bg)'};color:${primary ? '#fff' : 'var(--primary)'};border-radius:8px;text-decoration:none;font-size:0.9rem;font-weight:${primary ? '700' : '500'};border:1px solid var(--border);">${text}</a>`
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

    // ── 5. OTD subtitle ──────────────────────────────────────────
    const otdTitleEl = document.getElementById('hijri-today-otd-title');
    if (otdTitleEl) otdTitleEl.textContent = T.otdTitle;

    const subtitleEl = document.getElementById('wiki-otd-subtitle');
    if (subtitleEl) subtitleEl.textContent = T.otdSub(dayName, hijri.day, monthName, hijri.year);

    loadWikiOTD();

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

    // ── 7. Mini Calendar (3 rows: yesterday, today, tomorrow) ─────
    const miniTitleEl = document.getElementById('hijri-today-mini-title');
    if (miniTitleEl) miniTitleEl.textContent = T.miniTitle;

    const thHijri = document.getElementById('hijri-today-th-hijri');
    const thGreg  = document.getElementById('hijri-today-th-greg');
    if (thHijri) thHijri.textContent = T.thHijri;
    if (thGreg)  thGreg.textContent  = T.thGreg;

    const miniBody = document.getElementById('hijri-today-mini-body');
    if (miniBody) {
        const rows = [];
        // yesterday (hijri)
        let yd = hijri.day - 1, ym = hijri.month, yy = hijri.year;
        if (yd < 1) { ym--; if (ym < 1) { ym = 12; yy--; } yd = HijriDate.getDaysInHijriMonth(yy, ym); }
        // tomorrow (hijri)
        let td2 = hijri.day + 1, tm = hijri.month, ty = hijri.year;
        if (td2 > totalDays) { td2 = 1; tm++; if (tm > 12) { tm = 1; ty++; } }

        [[yd, ym, yy, false], [hijri.day, hijri.month, hijri.year, true], [td2, tm, ty, false]].forEach(([d, m, y, isT]) => {
            const g    = HijriDate.toGregorian(y, m, d);
            const mN   = T.hM[m-1];
            const gMN  = T.gM[g.month-1];
            const dowG = new Date(g.year, g.month-1, g.day).getDay();
            const dN   = T.days[dowG];
            const dayUrl = hijriDayUrl(y, m, d);
            const rowBg  = isT ? 'background:var(--primary-light);' : '';
            const lnkClr = isT ? 'color:#fff;font-weight:700;text-decoration:none;' : 'color:var(--primary);text-decoration:none;';
            const txtClr = isT ? 'color:#fff;' : '';
            rows.push(`<tr style="${rowBg}">
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;${txtClr}">
                    <a href="${dayUrl}" style="${lnkClr}">${d} ${mN} ${y}${T.hSfx} (${dN})</a>
                </td>
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;${txtClr}">
                    <a href="${dayUrl}" style="${lnkClr}">${dN} ${g.day} ${gMN} ${g.year}</a>
                </td>
            </tr>`);
        });
        miniBody.innerHTML = rows.join('');
    }

    // ── 8. Extra Links ────────────────────────────────────────────
    const extraTitleEl = document.getElementById('hijri-today-extra-title');
    if (extraTitleEl) extraTitleEl.textContent = T.extraTitle;

    const extraEl = document.getElementById('hijri-today-extra-links');
    if (extraEl) {
        const monthUrl = hijriMonthUrl(hijri.year, hijri.month);
        const yearUrl2 = `${prefix}/hijri-calendar/${hijri.year}`;
        const extras = [
            [monthUrl,                  T.extraMonth(`${monthName} ${hijri.year}${T.hSfx}`.trim())],
            [yearUrl2,                  T.extraYear(hijri.year)],
            [`${prefix}/dateconverter`, T.extraConv],
        ];
        extraEl.innerHTML = extras.map(([href, text]) =>
            `<a href="${href}" style="display:inline-block;padding:9px 18px;background:var(--bg);color:var(--primary);border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid var(--border);">${text}</a>`
        ).join('');
    }

    // ── 9. Footer SEO ─────────────────────────────────────────────
    const footerEl = document.getElementById('hijri-today-footer-seo');
    if (footerEl) footerEl.textContent = T.footer(country);
}

// ========= صفحة اليوم الهجري الفردي =========
function loadHijriDayPage() {
    const match = window.location.pathname.match(/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-date\/(\d+)-([a-z-]+)-(\d+)$/);
    if (!match) return;

    const day      = parseInt(match[1]);
    const monthSlug = match[2];
    const year     = parseInt(match[3]);
    const monthIdx = HIJRI_MONTH_SLUGS.indexOf(monthSlug);
    if (monthIdx === -1 || day < 1 || day > 30) return;
    const month    = monthIdx + 1;

    const lang       = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const ui         = hdayUi(lang);
    const hijriNames = hijriMonthsFor(lang);
    const monthName  = hijriNames[monthIdx];
    const monthNameEn = HIJRI_MONTHS_EN[monthIdx];
    const hSfx       = hSfxFor(lang);
    const gSfx       = gSfxFor(lang);

    // احسب التاريخ الميلادي وأيام الأسبوع
    const greg       = HijriDate.toGregorian(year, month, day);
    const gregDate   = new Date(greg.year, greg.month - 1, greg.day);
    const dow        = gregDate.getDay();
    const dayName    = dayNameFor(lang, dow);
    const gMonthName = gregMonthFor(lang, greg.month - 1);

    const totalDays  = HijriDate.getDaysInHijriMonth(year, month);
    const isLeap     = HijriDate.isHijriLeapYear(year);
    const country    = getDisplayCountry();
    const countryLabel = (lang === 'ar') ? (currentCountry || currentCity || country) : country;
    const prefix     = (lang === 'ar') ? '' : '/' + lang;

    // بناء context لقوالب ui
    const hDate   = `${day} ${monthName} ${year}${hSfx}`;
    const gDate   = `${greg.day} ${gMonthName} ${greg.year}${gSfx}`;
    const _todayH  = HijriDate.getToday();
    const _todayMN = hijriNames[_todayH.month - 1];
    const todayH  = `${_todayH.day} ${_todayMN} ${_todayH.year}${hSfx}`;
    const ctx = { day, monthName, year, dayName, hDate, gDate, country, countryLabel, todayH, isLeap, hSfx, gSfx };

    // 1. Breadcrumbs
    const bcEl = document.getElementById('hday-breadcrumbs');
    if (bcEl) {
        const calPath   = `${prefix}/hijri-calendar/${year}`;
        const yearPath  = `${prefix}/hijri-calendar/${year}`;
        const monthPath = hijriMonthUrl(year, month);
        const homeUrl   = (lang === 'ar') ? '/' : (prefix + '/');
        const _t        = (typeof t === 'function') ? t : (k) => k;
        const homeL     = _t('breadcrumb.home') || ui.home;
        const calL      = ui.cal;
        const yearL     = `${year}${hSfx}`;
        const monthL    = `${monthName} ${year}${hSfx}`;
        const dayL      = hDate;
        bcEl.innerHTML = _buildHijriBreadcrumbOl([
            { href: homeUrl, text: homeL },
            { href: calPath, text: calL },
            { href: yearPath, text: yearL },
            { href: monthPath, text: monthL },
            { text: dayL, current: true }
        ]);
    }

    // 2. Title & Subtitle
    const titleEl    = document.getElementById('hday-title');
    const subtitleEl = document.getElementById('hday-subtitle');
    if (titleEl)    titleEl.textContent    = ui.title(ctx);
    if (subtitleEl) subtitleEl.textContent = ui.subtitle(ctx);

    // 3. SEO Intro
    const introEl = document.getElementById('hday-intro');
    if (introEl) introEl.textContent = ui.intro(ctx);

    // 4. Info Cards
    const gridEl = document.getElementById('hday-info-grid');
    if (gridEl) {
        const leapText = isLeap ? ui.leap_yes : ui.leap_no;
        const cards = [
            [ui.cards[0], dayName],
            [ui.cards[1], hDate],
            [ui.cards[2], gDate],
            [ui.cards[3], monthName],
            [ui.cards[4], `${totalDays} ${ui.days_word}`],
            [ui.cards[5], leapText],
        ];
        gridEl.innerHTML = cards.map(([label, val]) =>
            `<div class="info-card"><div class="info-label">${label}</div><div class="info-value">${val}</div></div>`
        ).join('');
    }

    // 5. Internal Links
    const linksEl = document.getElementById('hday-links');
    if (linksEl) {
        const converterPath = `${prefix}/dateconverter`;
        const todayPath2    = `${prefix}/today-hijri-date`;
        const links = [
            [converterPath, ui.link_convert],
            [hijriMonthUrl(year, month), ui.link_cal(ctx)],
            [todayPath2, ui.link_today],
        ];
        linksEl.innerHTML = links.map(([href, text]) =>
            `<a href="${href}" style="display:inline-block;padding:9px 18px;background:var(--primary);color:#fff;border-radius:8px;text-decoration:none;font-size:0.9rem;">${text}</a>`
        ).join('');
    }

    // 6. FAQ
    const faqEl = document.getElementById('hday-faq');
    if (faqEl) {
        const faqs = ui.faq(ctx);
        faqEl.innerHTML = faqs.map(([q, a]) =>
            `<div style="margin-bottom:14px;padding:14px 18px;background:var(--bg);border-radius:10px;border-right:4px solid var(--primary);">
                <div style="font-weight:700;color:var(--primary);margin-bottom:6px;">${q}</div>
                <div style="color:var(--text);font-size:0.95rem;">${a}</div>
            </div>`
        ).join('');
    }

    // 7. OTD Subtitle + Load
    const otdSubEl = document.getElementById('hday-otd-subtitle');
    if (otdSubEl) otdSubEl.textContent = ui.otd(ctx);
    loadHijriDayOTD(day, HijriDate.hijriMonths[monthIdx]);

    // 8. Mini Calendar (prev, current, next day)
    const miniCal = document.getElementById('hday-mini-cal');
    if (miniCal) {
        let prevD, prevM, prevY, nextD, nextM, nextY;
        if (day > 1)       { prevD = day - 1; prevM = month; prevY = year; }
        else if (month > 1){ prevM = month - 1; prevY = year; prevD = HijriDate.getDaysInHijriMonth(prevY, prevM); }
        else               { prevY = year - 1; prevM = 12; prevD = HijriDate.getDaysInHijriMonth(prevY, prevM); }

        if (day < totalDays)   { nextD = day + 1; nextM = month; nextY = year; }
        else if (month < 12)   { nextD = 1; nextM = month + 1; nextY = year; }
        else                   { nextD = 1; nextM = 1; nextY = year + 1; }

        const rows = [
            { d: prevD, m: prevM, y: prevY, cur: false },
            { d: day,   m: month, y: year,  cur: true  },
            { d: nextD, m: nextM, y: nextY, cur: false },
        ];
        miniCal.innerHTML = rows.map(({ d, m, y, cur }) => {
            const g     = HijriDate.toGregorian(y, m, d);
            const mName = hijriNames[m - 1];
            const gM    = gregMonthFor(lang, g.month - 1);
            const url   = hijriDayUrl(y, m, d);
            const style = cur ? 'background:var(--primary-light);color:#fff;font-weight:700;' : (d % 2 === 0 ? 'background:var(--bg);' : '');
            const hCell = cur ? `${d} ${mName} ${y}${hSfx}` : `<a href="${url}" style="color:var(--primary);text-decoration:none;">${d} ${mName} ${y}${hSfx}</a>`;
            const gCell = cur ? `${g.day} ${gM} ${g.year}${gSfx}` : `<a href="${url}" style="color:var(--primary);text-decoration:none;">${g.day} ${gM} ${g.year}${gSfx}</a>`;
            return `<tr style="${style}">
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;">${hCell}</td>
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;">${gCell}</td>
            </tr>`;
        }).join('');
    }

    // 9. Prev / Next Navigation
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
            <a href="${prevUrl}" style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);transition:border-color .2s;">
                <span style="font-size:0.75rem;color:var(--text-light);display:flex;align-items:center;gap:4px;">← ${ui.prev}</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${prevFullName}</span>
            </a>
            <a href="${nextUrl}" style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);transition:border-color .2s;">
                <span style="font-size:0.75rem;color:var(--text-light);display:flex;align-items:center;gap:4px;">${ui.next} →</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${nextFullName}</span>
            </a>`;
    }

    // 10. Other Months
    const otherEl = document.getElementById('hday-other-months');
    if (otherEl) {
        const otherMonths = [];
        for (let delta = -2; delta <= 3; delta++) {
            if (delta === 0) continue;
            let mo = month + delta, yr = year;
            if (mo < 1)  { mo += 12; yr--; }
            if (mo > 12) { mo -= 12; yr++; }
            otherMonths.push({ mo, yr });
        }
        otherEl.innerHTML = otherMonths.map(({ mo, yr }) => {
            const mName = hijriNames[mo - 1];
            const url   = hijriDayUrl(yr, mo, 1);
            return `<a href="${url}" style="display:inline-block;padding:8px 16px;background:var(--bg);color:var(--primary);border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid var(--border);">${mName} ${yr}${hSfx}</a>`;
        }).join('');
    }

    // 11. Footer SEO
    const footerEl = document.getElementById('hday-footer-seo');
    if (footerEl) footerEl.textContent = ui.footer(ctx);

    // 12. Schema JSON-LD — @graph: BreadcrumbList + WebPage + FAQPage
    ['hday-schema-faq','hday-schema-bc','hday-schema-article','hday-schema-graph'].forEach(id => document.getElementById(id)?.remove());

    const _origin    = window.SITE_URL || window.location.origin;
    const _pageUrl   = _origin + window.location.pathname;
    const _calUrl    = _origin + `${prefix}/today-hijri-date`;
    const _monthUrl  = _origin + hijriMonthUrl(year, month);
    const _siteName  = ui.site;
    const _headline  = ui.headline(ctx);
    const _desc      = ui.desc(ctx);
    const _homeUrl   = _origin + ((lang === 'ar') ? '/' : ('/' + lang + '/'));

    const _nowIso = new Date().toISOString();
    // روابط FAQ: نعيد استخدام نفس أسئلة ui.faq مع إجابات كاملة
    const _faqItems = ui.faq(ctx).map(([q, a]) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a }
    }));

    const hdaySchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${_pageUrl}#breadcrumb`,
                "itemListElement": [
                    { "@type":"ListItem","position":1, "name": ui.home, "item": _homeUrl },
                    { "@type":"ListItem","position":2, "name": ui.cal,  "item": _calUrl },
                    { "@type":"ListItem","position":3, "name": `${year}${hSfx}`, "item": _calUrl },
                    { "@type":"ListItem","position":4, "name": `${monthName} ${year}${hSfx}`, "item": _monthUrl },
                    { "@type":"ListItem","position":5, "name": hDate, "item": _pageUrl }
                ]
            },
            {
                "@type": "Article",
                "@id": `${_pageUrl}#article`,
                "headline": _headline,
                "description": _desc,
                "inLanguage": lang,
                "datePublished": _nowIso,
                "dateModified": _nowIso,
                "mainEntityOfPage": { "@id": `${_pageUrl}#webpage` },
                "author": { "@type": "Organization", "name": _siteName, "url": _homeUrl },
                "publisher": { "@type": "Organization", "name": _siteName, "url": _homeUrl }
            },
            {
                "@type": "WebPage",
                "@id": `${_pageUrl}#webpage`,
                "url": _pageUrl,
                "name": _headline,
                "headline": _headline,
                "description": _desc,
                "inLanguage": lang,
                "isPartOf": {
                    "@type": "WebSite",
                    "name": _siteName,
                    "url": _homeUrl
                },
                "breadcrumb": { "@id": `${_pageUrl}#breadcrumb` }
            },
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

    // ── 13. SEO Meta (title + description + canonical + hreflang + OG + Twitter) ──
    setSEOMeta({ title: _headline, description: _desc, ogType: 'article' });
}

// ========= صفحة التقويم الهجري السنوي /hijri-calendar أو /hijri-calendar/1447 =========
function loadHijriYearPage() {
    const match = window.location.pathname.match(/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar(?:\/(\d{4}))?$/);
    if (!match) return;
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
            const isCurrentMonth = (() => { const h = HijriDate.getToday(); return h.year === year && h.month === m; })();
            const rowBg  = isCurrentMonth ? 'background:var(--primary-light);' : (m % 2 === 0 ? 'background:var(--bg);' : '');
            const lnkClr = isCurrentMonth ? 'color:#fff;font-weight:700;text-decoration:none;' : 'color:var(--primary);text-decoration:none;';
            const txtClr = isCurrentMonth ? 'color:#fff;' : '';
            const td = 'padding:10px 14px;border-bottom:1px solid var(--border);text-align:center;';
            tbody.innerHTML += `<tr style="${rowBg}">
                <td style="${td}${txtClr}"><a href="${mUrl}" style="${lnkClr}">${mName} ${year}${hSfx}</a></td>
                <td style="${td}${txtClr}">${startStr}</td>
                <td style="${td}${txtClr}">${endStr}</td>
                <td style="${td}${txtClr}">${mDays}</td>
            </tr>`;
        }
    }

    // ── 5. Month Buttons Grid ─────────────────────────────────────
    const monthsTitleEl = document.getElementById('hyear-months-title');
    if (monthsTitleEl) monthsTitleEl.textContent = ui.months_grid_title(ctx);

    const monthsGrid = document.getElementById('hyear-months-grid');
    if (monthsGrid) {
        monthsGrid.innerHTML = '';
        for (let m = 1; m <= 12; m++) {
            const mName = hijriNames[m - 1];
            const mUrl  = hijriMonthUrl(year, m);
            const isCurrentMonth = (() => { const h = HijriDate.getToday(); return h.year === year && h.month === m; })();
            const bg  = isCurrentMonth ? 'var(--primary)' : 'var(--bg)';
            const clr = isCurrentMonth ? '#fff' : 'var(--primary)';
            const fw  = isCurrentMonth ? '700' : '500';
            monthsGrid.innerHTML += `<a href="${mUrl}" style="display:block;padding:12px 10px;background:${bg};color:${clr};border-radius:10px;text-decoration:none;font-size:0.9rem;font-weight:${fw};text-align:center;border:1px solid var(--border);">${mName}<br><span style="font-size:0.78rem;opacity:0.75;">${year}${hSfx}</span></a>`;
        }
    }

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
                    { "@type":"ListItem","position":2, "name": ui.cal,  "item": _origin+`${prefix}/today-hijri-date` },
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
    const match = window.location.pathname.match(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar\/([a-z-]+)-(\d+)$/);
    if (!match) return;
    const monthSlug = match[1];
    const year      = parseInt(match[2]);
    const monthIdx  = HIJRI_MONTH_SLUGS.indexOf(monthSlug);
    if (monthIdx === -1) return;
    const month     = monthIdx + 1;

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

    const ctx = { monthName, year, hSfx, gSfx, totalDays, isLeap, gRange, gFirstStr, gLastStr, country };

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

    // 2. Title & Subtitle
    const titleEl    = document.getElementById('hmonth-title');
    const subtitleEl = document.getElementById('hmonth-subtitle');
    if (titleEl)    titleEl.textContent    = ui.title(ctx);
    if (subtitleEl) subtitleEl.textContent = ui.subtitle(ctx);

    // 3. Intro
    const introEl = document.getElementById('hmonth-intro');
    if (introEl) introEl.textContent = ui.intro(ctx);

    // 3b. Section headings + table column headers (localized)
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

    // 4. Info Cards
    const gridEl = document.getElementById('hmonth-info-grid');
    if (gridEl) {
        const cards = [
            [ui.card_labels[0], monthName],
            [ui.card_labels[1], ui.days_word_n(totalDays)],
            [ui.card_labels[2], `${gregFirst.day} ${gm1} ${gregFirst.year}`],
            [ui.card_labels[3], `${gregLast.day} ${gm2} ${gregLast.year}`],
            [ui.card_labels[4], `${year}${hSfx}`],
            [ui.card_labels[5], isLeap ? ui.leap_yes : ui.leap_no],
        ];
        gridEl.innerHTML = cards.map(([label, value]) =>
            `<div class="info-card"><div class="info-card-label">${label}</div><div class="info-card-value">${value}</div></div>`
        ).join('');
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
            tr.innerHTML = `
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;">
                    <a href="${dayUrl}" style="${linkStyle}">${d} ${monthName} ${year}${hSfx} (${dayName})</a>
                </td>
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;">
                    <a href="${dayUrl}" style="${linkStyle}">${dayName} ${greg.day} ${gmLoc} ${greg.year}</a>
                </td>`;
            tbody.appendChild(tr);
        }
    }

    // 6. Internal Links
    const linksEl = document.getElementById('hmonth-links');
    if (linksEl) {
        const day1Target = (month === todayH.month && year === todayH.year) ? todayH.day : 1;
        const links = [
            [`${prefix}/dateconverter`, ui.link_convert],
            [`${prefix}/today-hijri-date`, ui.link_today],
            [hijriDayUrl(year, month, day1Target), ui.link_day1(monthName, `${year}${hSfx}`)],
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
        const others = [];
        for (let delta = -3; delta <= 3; delta++) {
            if (delta === 0) continue;
            let mo = month + delta, yr = year;
            if (mo < 1)  { mo += 12; yr--; }
            if (mo > 12) { mo -= 12; yr++; }
            others.push({ mo, yr });
        }
        otherEl.innerHTML = others.map(({ mo, yr }) => {
            const mName = hijriNames[mo-1];
            return `<a href="${hijriMonthUrl(yr, mo)}" style="display:inline-block;padding:8px 16px;background:var(--bg);color:var(--primary);border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid var(--border);">${mName} ${yr}${hSfx}</a>`;
        }).join('');
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

    // 9. Footer SEO
    const footerEl = document.getElementById('hmonth-footer-seo');
    if (footerEl) footerEl.textContent = ui.footer(ctx);

    // 10. Schema JSON-LD — @graph: BreadcrumbList + Article + WebPage + FAQPage
    document.getElementById('hmonth-schema-graph')?.remove();
    const pageUrl_  = _origin + window.location.pathname;
    const calUrl_   = _origin + `${prefix}/hijri-calendar`;
    const yearUrl_  = _origin + `${prefix}/hijri-calendar/${year}`;
    const siteName_ = ui.site;
    const _hmonthNowIso = new Date().toISOString();
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
                "@type": "Article",
                "@id": `${pageUrl_}#article`,
                "headline": ui.headline(ctx),
                "description": ui.meta_desc(ctx),
                "inLanguage": lang,
                "datePublished": _hmonthNowIso,
                "dateModified": _hmonthNowIso,
                "mainEntityOfPage": { "@id": `${pageUrl_}#webpage` },
                "author": { "@type": "Organization", "name": siteName_, "url": _origin + (lang==='ar' ? '/' : (prefix+'/')) },
                "publisher": { "@type": "Organization", "name": siteName_, "url": _origin + (lang==='ar' ? '/' : (prefix+'/')) }
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
        ogType: 'article'
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
    // ملء الأشهر الميلادية
    const gSelect = document.getElementById('conv-g-month');
    HijriDate.gregorianMonths.forEach((m, i) => {
        const opt = document.createElement('option');
        opt.value = i + 1;
        opt.textContent = m;
        gSelect.appendChild(opt);
    });

    // ملء الأشهر الهجرية
    const hSelect = document.getElementById('conv-h-month');
    HijriDate.hijriMonths.forEach((m, i) => {
        const opt = document.createElement('option');
        opt.value = i + 1;
        opt.textContent = m;
        hSelect.appendChild(opt);
    });

    // ملء الأشهر الشمسية (الأبراج للعربية والأردو، الأسماء الفارسية لباقي اللغات)
    const sSelect = document.getElementById('conv-s-month');
    if (sSelect) {
        const _tx = (k, fb) => ((typeof t === 'function') ? t(k) : fb);
        for (let i = 0; i < 12; i++) {
            const localized = _tx('jmonth.' + (i + 1), _jalaliMonths[i]);
            const opt = document.createElement('option');
            opt.value = i + 1;
            // أظهر التسمية المترجمة + الاسم الفارسي الأصلي كمرجع ثابت
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
