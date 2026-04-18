/**
 * Shared dictionary of country + city names for all 10 site languages.
 * Single source of truth — loaded by index.html and prayer-times-cities.html
 * BEFORE app.js and i18n.js, so both pages see the same translations.
 *
 * All dicts are declared as globals via `var` (no `const`) so downstream
 * scripts (app.js, prayer-times-cities.html) can reference them directly.
 */

// ============================================================
// أسماء الدول بالعربية (مفهرسة بكود ISO)
// ============================================================
var COUNTRY_NAMES_AR = {
    sa:'المملكة العربية السعودية', sy:'سوريا', eg:'مصر', iq:'العراق',
    jo:'الأردن', lb:'لبنان', ps:'فلسطين', kw:'الكويت', ae:'الإمارات',
    qa:'قطر', bh:'البحرين', om:'عُمان', ye:'اليمن', ly:'ليبيا',
    tn:'تونس', dz:'الجزائر', ma:'المغرب', sd:'السودان',
    dj:'جيبوتي', km:'جزر القمر',
    pk:'باكستان', tr:'تركيا', ir:'إيران', id:'إندونيسيا', my:'ماليزيا',
    bd:'بنغلاديش', af:'أفغانستان', in:'الهند', lk:'سريلانكا', np:'نيبال',
    cn:'الصين', jp:'اليابان', kr:'كوريا الجنوبية', kp:'كوريا الشمالية', mn:'منغوليا',
    fr:'فرنسا', de:'ألمانيا', gb:'المملكة المتحدة', es:'إسبانيا', it:'إيطاليا',
    nl:'هولندا', be:'بلجيكا', pt:'البرتغال', se:'السويد', no:'النرويج',
    dk:'الدنمارك', fi:'فنلندا', pl:'بولندا', ru:'روسيا', ua:'أوكرانيا',
    ch:'سويسرا', at:'النمسا', gr:'اليونان', cz:'التشيك', ro:'رومانيا',
    us:'الولايات المتحدة', ca:'كندا', mx:'المكسيك',
    gt:'غواتيمالا', cu:'كوبا', do:'الدومينيكان',
    br:'البرازيل', ar:'الأرجنتين', co:'كولومبيا', pe:'بيرو', ve:'فنزويلا',
    cl:'تشيلي', ec:'الإكوادور', bo:'بوليفيا', py:'باراغواي', uy:'أوروغواي',
    ng:'نيجيريا', et:'إثيوبيا', ke:'كينيا', tz:'تنزانيا', za:'جنوب أفريقيا',
    gh:'غانا', sn:'السنغال', cm:'الكاميرون', ml:'مالي', so:'الصومال',
    ug:'أوغندا', mr:'موريتانيا', td:'تشاد', ne:'النيجر',
    au:'أستراليا', nz:'نيوزيلندا', xk:'كوسوفو',
    th:'تايلاند', ph:'الفلبين', vn:'فيتنام', mm:'ميانمار',
    kh:'كمبوديا', la:'لاوس', sg:'سنغافورة', bn:'بروناي', tl:'تيمور الشرقية',
    uz:'أوزبكستان', kz:'كازاخستان', kg:'قيرغيزستان', tj:'طاجيكستان',
    tm:'تركمانستان', az:'أذربيجان', ge:'جورجيا', am:'أرمينيا',
    ba:'البوسنة والهرسك', al:'ألبانيا', mk:'مقدونيا الشمالية',
    bf:'بوركينا فاسو', ci:'ساحل العاج', gn:'غينيا', gm:'غامبيا',
    sl:'سيراليون', mv:'المالديف', er:'إريتريا', ss:'جنوب السودان',
    tg:'توغو', bj:'بنين',
    ie:'أيرلندا', hu:'المجر', hr:'كرواتيا', rs:'صربيا',
    bg:'بلغاريا', si:'سلوفينيا', sk:'سلوفاكيا',
    mg:'مدغشقر', mz:'موزمبيق', ao:'أنغولا', cd:'جمهورية الكونغو الديمقراطية',
    rw:'رواندا', zw:'زيمبابوي', zm:'زامبيا', mu:'موريشيوس',
    lr:'ليبيريا', mw:'مالاوي',
    sr:'سورينام', gy:'غيانا', tt:'ترينيداد وتوباغو', jm:'جامايكا',
    pa:'بنما', ht:'هايتي', cr:'كوستاريكا',
    bt:'بوتان', fj:'فيجي', pg:'بابوا غينيا الجديدة',
    // دول-مدن ومايكروستيتس
    mc:'موناكو', sm:'سان مارينو', va:'الفاتيكان', ad:'أندورا',
    li:'ليختنشتاين', lu:'لوكسمبورغ', mt:'مالطا',
};

// ============================================================
// أسماء الدول بالإنجليزية (Superset — يحوي كلّ الرموز من كلا الملفَّين)
// ============================================================
var COUNTRY_NAMES_EN = {
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
    bf:'Burkina Faso', gn:'Guinea', gm:'Gambia', sl:'Sierra Leone',
    mv:'Maldives', ss:'South Sudan', tg:'Togo', bj:'Benin',
    cd:'DR Congo', lr:'Liberia', mu:'Mauritius', bt:'Bhutan',
    tt:'Trinidad and Tobago',
    // Microstates with same-name capital collisions (handled via "-city" suffix)
    mc:'Monaco', sm:'San Marino', va:'Vatican City', ad:'Andorra',
};
// Alias for legacy app.js references
var COUNTRY_EN_NAMES = COUNTRY_NAMES_EN;

// ============================================================
// أسماء الدول بالفرنسية (merged من app.js + prayer-times-cities.html)
// ============================================================
var COUNTRY_NAMES_FR = {
    sa:'Arabie saoudite', eg:'Égypte', sy:'Syrie', iq:'Irak', jo:'Jordanie', lb:'Liban',
    ae:'Émirats arabes unis', kw:'Koweït', qa:'Qatar', bh:'Bahreïn', om:'Oman',
    ye:'Yémen', ps:'Palestine', ma:'Maroc', dz:'Algérie', tn:'Tunisie',
    ly:'Libye', sd:'Soudan', mr:'Mauritanie', so:'Somalie', km:'Comores',
    dj:'Djibouti',
    pk:'Pakistan', in:'Inde', bd:'Bangladesh', af:'Afghanistan', tr:'Turquie',
    ir:'Iran', id:'Indonésie', my:'Malaisie', sg:'Singapour', bn:'Brunei',
    ph:'Philippines', th:'Thaïlande', cn:'Chine', jp:'Japon', kr:'Corée du Sud',
    fr:'France', de:'Allemagne', gb:'Royaume-Uni', nl:'Pays-Bas', es:'Espagne',
    it:'Italie', pt:'Portugal', ru:'Russie', us:'États-Unis', ca:'Canada',
    mx:'Mexique', br:'Brésil', ar:'Argentine', au:'Australie',
    ng:'Nigeria', et:'Éthiopie', ke:'Kenya', za:'Afrique du Sud',
    mv:'Maldives', lk:'Sri Lanka', np:'Népal', mm:'Birmanie', bt:'Bhoutan',
    ba:'Bosnie-Herzégovine', al:'Albanie', mk:'Macédoine du Nord',
    bf:'Burkina Faso', ci:"Côte d'Ivoire", gn:'Guinée', gm:'Gambie',
    sl:'Sierra Leone', er:'Érythrée', ss:'Soudan du Sud',
    tg:'Togo', bj:'Bénin', ie:'Irlande', hu:'Hongrie', hr:'Croatie',
    rs:'Serbie', bg:'Bulgarie', si:'Slovénie', sk:'Slovaquie',
    mg:'Madagascar', mz:'Mozambique', ao:'Angola', cd:'République démocratique du Congo',
    rw:'Rwanda', zw:'Zimbabwe', zm:'Zambie', mu:'Maurice',
    lr:'Libéria', mw:'Malawi', sr:'Suriname', gy:'Guyana',
    tt:'Trinité-et-Tobago', jm:'Jamaïque', pa:'Panama', ht:'Haïti',
    cr:'Costa Rica', fj:'Fidji', pg:'Papouasie-Nouvelle-Guinée',
    // Microstates / city-states
    mc:'Monaco', sm:'Saint-Marin', va:'Vatican', ad:'Andorre',
    li:'Liechtenstein', lu:'Luxembourg', mt:'Malte',
};

// ============================================================
// أسماء الدول بالتركية
// ============================================================
var COUNTRY_NAMES_TR = {
    sa:'Suudi Arabistan', eg:'Mısır', sy:'Suriye', iq:'Irak', jo:'Ürdün', lb:'Lübnan',
    ae:'Birleşik Arap Emirlikleri', kw:'Kuveyt', qa:'Katar', bh:'Bahreyn', om:'Umman',
    ye:'Yemen', ps:'Filistin', ma:'Fas', dz:'Cezayir', tn:'Tunus',
    ly:'Libya', sd:'Sudan', mr:'Moritanya', so:'Somali', km:'Komorlar',
    dj:'Cibuti',
    pk:'Pakistan', in:'Hindistan', bd:'Bangladeş', af:'Afganistan', tr:'Türkiye',
    ir:'İran', id:'Endonezya', my:'Malezya', sg:'Singapur', bn:'Brunei',
    ph:'Filipinler', th:'Tayland', cn:'Çin', jp:'Japonya', kr:'Güney Kore',
    fr:'Fransa', de:'Almanya', gb:'Birleşik Krallık', nl:'Hollanda', es:'İspanya',
    it:'İtalya', pt:'Portekiz', ru:'Rusya', us:'Amerika Birleşik Devletleri', ca:'Kanada',
    mx:'Meksika', br:'Brezilya', ar:'Arjantin', au:'Avustralya',
    ng:'Nijerya', et:'Etiyopya', ke:'Kenya', za:'Güney Afrika',
    mv:'Maldivler', lk:'Sri Lanka', np:'Nepal', mm:'Myanmar', bt:'Butan',
    ba:'Bosna Hersek', al:'Arnavutluk', mk:'Kuzey Makedonya',
    bf:'Burkina Faso', ci:'Fildişi Sahili', gn:'Gine', gm:'Gambiya',
    sl:'Sierra Leone', er:'Eritre', ss:'Güney Sudan',
    tg:'Togo', bj:'Benin', ie:'İrlanda', hu:'Macaristan', hr:'Hırvatistan',
    rs:'Sırbistan', bg:'Bulgaristan', si:'Slovenya', sk:'Slovakya',
    mg:'Madagaskar', mz:'Mozambik', ao:'Angola', cd:'Demokratik Kongo Cumhuriyeti',
    rw:'Ruanda', zw:'Zimbabve', zm:'Zambiya', mu:'Mauritius',
    lr:'Liberya', mw:'Malavi', sr:'Surinam', gy:'Guyana',
    tt:'Trinidad ve Tobago', jm:'Jamaika', pa:'Panama', ht:'Haiti',
    cr:'Kosta Rika', fj:'Fiji', pg:'Papua Yeni Gine',
    // Microstates / city-states
    mc:'Monako', sm:'San Marino', va:'Vatikan', ad:'Andorra',
    li:'Lihtenştayn', lu:'Lüksemburg', mt:'Malta',
};

// ============================================================
// أسماء الدول بالأوردو
// ============================================================
var COUNTRY_NAMES_UR = {
    sa:'سعودی عرب', eg:'مصر', sy:'شام', iq:'عراق', jo:'اردن', lb:'لبنان',
    ae:'متحدہ عرب امارات', kw:'کویت', qa:'قطر', bh:'بحرین', om:'عمان',
    ye:'یمن', ps:'فلسطین', ma:'مراکش', dz:'الجزائر', tn:'تیونس',
    ly:'لیبیا', sd:'سوڈان', mr:'موریتانیہ', so:'صومالیہ', km:'جزائرِ قمر',
    dj:'جبوتی',
    pk:'پاکستان', in:'بھارت', bd:'بنگلہ دیش', af:'افغانستان', tr:'ترکیہ',
    ir:'ایران', id:'انڈونیشیا', my:'ملائیشیا', sg:'سنگاپور', bn:'برونائی',
    ph:'فلپائن', th:'تھائی لینڈ', cn:'چین', jp:'جاپان', kr:'جنوبی کوریا',
    fr:'فرانس', de:'جرمنی', gb:'برطانیہ', nl:'نیدرلینڈز', es:'سپین',
    it:'اٹلی', pt:'پرتگال', ru:'روس', us:'ریاستہائے متحدہ', ca:'کینیڈا',
    mx:'میکسیکو', br:'برازیل', ar:'ارجنٹینا', au:'آسٹریلیا',
    ng:'نائجیریا', et:'ایتھوپیا', ke:'کینیا', za:'جنوبی افریقہ',
    mv:'مالدیپ', lk:'سری لنکا', np:'نیپال', mm:'میانمار', bt:'بھوٹان',
    ba:'بوسنیا و ہرزیگووینا', al:'البانیا', mk:'شمالی مقدونیہ',
    bf:'برکینا فاسو', ci:'آئیوری کوسٹ', gn:'گنی', gm:'گیمبیا',
    sl:'سیرا لیون', er:'اریٹریا', ss:'جنوبی سوڈان',
    tg:'ٹوگو', bj:'بینن', ie:'آئرلینڈ', hu:'ہنگری', hr:'کروشیا',
    rs:'سربیا', bg:'بلغاریہ', si:'سلووینیا', sk:'سلوواکیہ',
    mg:'مڈغاسکر', mz:'موزمبیق', ao:'انگولا', cd:'جمہوری جمہوریہ کانگو',
    rw:'روانڈا', zw:'زمبابوے', zm:'زیمبیا', mu:'ماریشس',
    lr:'لائبیریا', mw:'ملاوی', sr:'سرینام', gy:'گیانا',
    tt:'ٹرینیڈاڈ اور ٹوباگو', jm:'جمیکا', pa:'پاناما', ht:'ہیٹی',
    cr:'کوسٹا ریکا', fj:'فجی', pg:'پاپوا نیو گنی',
    // Microstates / city-states
    mc:'موناکو', sm:'سان مارینو', va:'ویٹیکن', ad:'انڈورا',
    li:'لیختنسٹائن', lu:'لکسمبرگ', mt:'مالٹا',
};

// ============================================================
// أسماء الدول بالألمانية
// ============================================================
var COUNTRY_NAMES_DE = {
    sa:'Saudi-Arabien', eg:'Ägypten', sy:'Syrien', iq:'Irak', jo:'Jordanien', lb:'Libanon',
    ae:'Vereinigte Arabische Emirate', kw:'Kuwait', qa:'Katar', bh:'Bahrain', om:'Oman',
    ye:'Jemen', ps:'Palästina', ma:'Marokko', dz:'Algerien', tn:'Tunesien',
    ly:'Libyen', sd:'Sudan', mr:'Mauretanien', so:'Somalia', km:'Komoren',
    dj:'Dschibuti',
    pk:'Pakistan', in:'Indien', bd:'Bangladesch', af:'Afghanistan', tr:'Türkei',
    ir:'Iran', id:'Indonesien', my:'Malaysia', sg:'Singapur', bn:'Brunei',
    ph:'Philippinen', th:'Thailand', cn:'China', jp:'Japan', kr:'Südkorea',
    fr:'Frankreich', de:'Deutschland', gb:'Vereinigtes Königreich', nl:'Niederlande', es:'Spanien',
    it:'Italien', pt:'Portugal', ru:'Russland', us:'Vereinigte Staaten', ca:'Kanada',
    mx:'Mexiko', br:'Brasilien', ar:'Argentinien', au:'Australien',
    ng:'Nigeria', et:'Äthiopien', ke:'Kenia', za:'Südafrika',
    mv:'Malediven', lk:'Sri Lanka', np:'Nepal', mm:'Myanmar', bt:'Bhutan',
    be:'Belgien', se:'Schweden', no:'Norwegen', dk:'Dänemark', fi:'Finnland',
    pl:'Polen', ua:'Ukraine', ch:'Schweiz', at:'Österreich', gr:'Griechenland',
    cz:'Tschechien', ro:'Rumänien',
    ba:'Bosnien und Herzegowina', al:'Albanien', mk:'Nordmazedonien',
    bf:'Burkina Faso', ci:'Elfenbeinküste', gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leone', er:'Eritrea', ss:'Südsudan',
    tg:'Togo', bj:'Benin', ie:'Irland', hu:'Ungarn', hr:'Kroatien',
    rs:'Serbien', bg:'Bulgarien', si:'Slowenien', sk:'Slowakei',
    mg:'Madagaskar', mz:'Mosambik', ao:'Angola', cd:'Demokratische Republik Kongo',
    rw:'Ruanda', zw:'Simbabwe', zm:'Sambia', mu:'Mauritius',
    lr:'Liberia', mw:'Malawi', sr:'Suriname', gy:'Guyana',
    tt:'Trinidad und Tobago', jm:'Jamaika', pa:'Panama', ht:'Haiti',
    cr:'Costa Rica', fj:'Fidschi', pg:'Papua-Neuguinea',
    tz:'Tansania', gh:'Ghana', sn:'Senegal', cm:'Kamerun', ml:'Mali',
    ug:'Uganda', td:'Tschad', ne:'Niger',
    nz:'Neuseeland', xk:'Kosovo',
    vn:'Vietnam', kh:'Kambodscha', la:'Laos', tl:'Timor-Leste',
    uz:'Usbekistan', kz:'Kasachstan', kg:'Kirgisistan', tj:'Tadschikistan',
    tm:'Turkmenistan', az:'Aserbaidschan', ge:'Georgien', am:'Armenien',
    cl:'Chile', ec:'Ecuador', bo:'Bolivien', py:'Paraguay', uy:'Uruguay',
    gt:'Guatemala', cu:'Kuba', do:'Dominikanische Republik',
    co:'Kolumbien', pe:'Peru', ve:'Venezuela',
    kp:'Nordkorea', mn:'Mongolei',
    // Microstates / city-states
    mc:'Monaco', sm:'San Marino', va:'Vatikanstadt', ad:'Andorra',
    li:'Liechtenstein', lu:'Luxemburg', mt:'Malta',
};

// ============================================================
// أسماء الدول بالإندونيسية
// ============================================================
var COUNTRY_NAMES_ID = {
    sa:'Arab Saudi', eg:'Mesir', sy:'Suriah', iq:'Irak', jo:'Yordania', lb:'Lebanon',
    ae:'Uni Emirat Arab', kw:'Kuwait', qa:'Qatar', bh:'Bahrain', om:'Oman',
    ye:'Yaman', ps:'Palestina', ma:'Maroko', dz:'Aljazair', tn:'Tunisia',
    ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia', km:'Komoro',
    dj:'Djibouti',
    pk:'Pakistan', in:'India', bd:'Bangladesh', af:'Afganistan', tr:'Turki',
    ir:'Iran', id:'Indonesia', my:'Malaysia', sg:'Singapura', bn:'Brunei',
    ph:'Filipina', th:'Thailand', cn:'Tiongkok', jp:'Jepang', kr:'Korea Selatan',
    fr:'Prancis', de:'Jerman', gb:'Britania Raya', nl:'Belanda', es:'Spanyol',
    it:'Italia', pt:'Portugal', ru:'Rusia', us:'Amerika Serikat', ca:'Kanada',
    mx:'Meksiko', br:'Brasil', ar:'Argentina', au:'Australia',
    ng:'Nigeria', et:'Etiopia', ke:'Kenya', za:'Afrika Selatan',
    mv:'Maladewa', lk:'Sri Lanka', np:'Nepal', mm:'Myanmar', bt:'Bhutan',
    be:'Belgia', se:'Swedia', no:'Norwegia', dk:'Denmark', fi:'Finlandia',
    pl:'Polandia', ua:'Ukraina', ch:'Swiss', at:'Austria', gr:'Yunani',
    cz:'Ceko', ro:'Rumania',
    ba:'Bosnia dan Herzegovina', al:'Albania', mk:'Makedonia Utara',
    bf:'Burkina Faso', ci:'Pantai Gading', gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leone', er:'Eritrea', ss:'Sudan Selatan',
    tg:'Togo', bj:'Benin', ie:'Irlandia', hu:'Hungaria', hr:'Kroasia',
    rs:'Serbia', bg:'Bulgaria', si:'Slovenia', sk:'Slovakia',
    mg:'Madagaskar', mz:'Mozambik', ao:'Angola', cd:'Republik Demokratik Kongo',
    rw:'Rwanda', zw:'Zimbabwe', zm:'Zambia', mu:'Mauritius',
    lr:'Liberia', mw:'Malawi', sr:'Suriname', gy:'Guyana',
    tt:'Trinidad dan Tobago', jm:'Jamaika', pa:'Panama', ht:'Haiti',
    cr:'Kosta Rika', fj:'Fiji', pg:'Papua Nugini',
    tz:'Tanzania', gh:'Ghana', sn:'Senegal', cm:'Kamerun', ml:'Mali',
    ug:'Uganda', td:'Chad', ne:'Niger',
    nz:'Selandia Baru', xk:'Kosovo',
    vn:'Vietnam', kh:'Kamboja', la:'Laos', tl:'Timor Leste',
    uz:'Uzbekistan', kz:'Kazakhstan', kg:'Kirgistan', tj:'Tajikistan',
    tm:'Turkmenistan', az:'Azerbaijan', ge:'Georgia', am:'Armenia',
    cl:'Chili', ec:'Ekuador', bo:'Bolivia', py:'Paraguay', uy:'Uruguay',
    gt:'Guatemala', cu:'Kuba', do:'Republik Dominika',
    co:'Kolombia', pe:'Peru', ve:'Venezuela',
    kp:'Korea Utara', mn:'Mongolia',
    // Microstates / city-states
    mc:'Monako', sm:'San Marino', va:'Kota Vatikan', ad:'Andorra',
    li:'Liechtenstein', lu:'Luksemburg', mt:'Malta',
};

// ============================================================
// أسماء الدول بالإسبانية
// ============================================================
var COUNTRY_NAMES_ES = {
    sa:'Arabia Saudita', eg:'Egipto', sy:'Siria', iq:'Irak', jo:'Jordania',
    lb:'Líbano', ae:'Emiratos Árabes Unidos', kw:'Kuwait', qa:'Catar',
    bh:'Baréin', om:'Omán', ye:'Yemen', ps:'Palestina', ma:'Marruecos',
    dz:'Argelia', tn:'Túnez', ly:'Libia', sd:'Sudán', mr:'Mauritania',
    so:'Somalia', km:'Comoras', dj:'Yibuti',
    pk:'Pakistán', in:'India', bd:'Bangladés',
    af:'Afganistán', tr:'Turquía', ir:'Irán', id:'Indonesia', my:'Malasia',
    sg:'Singapur', bn:'Brunéi', ph:'Filipinas', th:'Tailandia', cn:'China',
    jp:'Japón', kr:'Corea del Sur', fr:'Francia', de:'Alemania',
    gb:'Reino Unido', nl:'Países Bajos', es:'España', it:'Italia',
    pt:'Portugal', ru:'Rusia', us:'Estados Unidos', ca:'Canadá',
    mx:'México', br:'Brasil', ar:'Argentina', au:'Australia',
    ng:'Nigeria', et:'Etiopía', ke:'Kenia', za:'Sudáfrica',
    mv:'Maldivas', lk:'Sri Lanka', np:'Nepal', mm:'Birmania', bt:'Bután',
    be:'Bélgica', se:'Suecia', no:'Noruega', dk:'Dinamarca', fi:'Finlandia',
    pl:'Polonia', ua:'Ucrania', ch:'Suiza', at:'Austria', gr:'Grecia',
    cz:'Chequia', ro:'Rumanía',
    tz:'Tanzania', gh:'Ghana', sn:'Senegal', cm:'Camerún', ml:'Malí', ug:'Uganda',
    nz:'Nueva Zelanda', vn:'Vietnam', kh:'Camboya', la:'Laos',
    kp:'Corea del Norte', mn:'Mongolia',
    // Microstates / city-states
    mc:'Mónaco', sm:'San Marino', va:'Ciudad del Vaticano', ad:'Andorra',
    li:'Liechtenstein', lu:'Luxemburgo', mt:'Malta',
};

// ============================================================
// أسماء الدول بالبنغالية
// ============================================================
var COUNTRY_NAMES_BN = {
    sa:'সৌদি আরব', eg:'মিশর', sy:'সিরিয়া', iq:'ইরাক', jo:'জর্ডান', lb:'লেবানন',
    ae:'সংযুক্ত আরব আমিরাত', kw:'কুয়েত', qa:'কাতার', bh:'বাহরাইন', om:'ওমান',
    ye:'ইয়েমেন', ps:'ফিলিস্তিন', ma:'মরক্কো', dz:'আলজেরিয়া', tn:'তিউনিসিয়া',
    ly:'লিবিয়া', sd:'সুদান', mr:'মৌরিতানিয়া', so:'সোমালিয়া', km:'কোমোরোস',
    dj:'জিবুতি',
    pk:'পাকিস্তান', in:'ভারত', bd:'বাংলাদেশ', af:'আফগানিস্তান', tr:'তুরস্ক',
    ir:'ইরান', id:'ইন্দোনেশিয়া', my:'মালয়েশিয়া', sg:'সিঙ্গাপুর', bn:'ব্রুনাই',
    ph:'ফিলিপাইন', th:'থাইল্যান্ড', cn:'চীন', jp:'জাপান', kr:'দক্ষিণ কোরিয়া',
    fr:'ফ্রান্স', de:'জার্মানি', gb:'যুক্তরাজ্য', nl:'নেদারল্যান্ডস', es:'স্পেন',
    it:'ইতালি', pt:'পর্তুগাল', ru:'রাশিয়া', us:'যুক্তরাষ্ট্র', ca:'কানাডা',
    mx:'মেক্সিকো', br:'ব্রাজিল', ar:'আর্জেন্টিনা', au:'অস্ট্রেলিয়া',
    ng:'নাইজেরিয়া', et:'ইথিওপিয়া', ke:'কেনিয়া', za:'দক্ষিণ আফ্রিকা',
    mv:'মালদ্বীপ', lk:'শ্রীলঙ্কা', np:'নেপাল', mm:'মিয়ানমার', bt:'ভুটান',
    be:'বেলজিয়াম',
    nz:'নিউজিল্যান্ড', vn:'ভিয়েতনাম',
    // Microstates / city-states
    mc:'মোনাকো', sm:'সান মারিনো', va:'ভ্যাটিকান সিটি', ad:'আন্দোরা',
    li:'লিখটেনস্টাইন', lu:'লুক্সেমবার্গ', mt:'মাল্টা',
};

// ============================================================
// أسماء الدول بالملايو
// ============================================================
var COUNTRY_NAMES_MS = {
    sa:'Arab Saudi', eg:'Mesir', sy:'Syria', iq:'Iraq', jo:'Jordan',
    lb:'Lubnan', ae:'Emiriah Arab Bersatu', kw:'Kuwait', qa:'Qatar',
    bh:'Bahrain', om:'Oman', ye:'Yaman', ps:'Palestin', ma:'Maghribi',
    dz:'Algeria', tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania',
    so:'Somalia', km:'Komoros', dj:'Djibouti',
    pk:'Pakistan', in:'India', bd:'Bangladesh',
    af:'Afghanistan', tr:'Turki', ir:'Iran', id:'Indonesia', my:'Malaysia',
    sg:'Singapura', bn:'Brunei', ph:'Filipina', th:'Thailand', cn:'China',
    jp:'Jepun', kr:'Korea Selatan', fr:'Perancis', de:'Jerman',
    gb:'United Kingdom', nl:'Belanda', es:'Sepanyol', it:'Itali',
    pt:'Portugal', ru:'Rusia', us:'Amerika Syarikat', ca:'Kanada',
    mx:'Mexico', br:'Brazil', ar:'Argentina', au:'Australia',
    ng:'Nigeria', et:'Ethiopia', ke:'Kenya', za:'Afrika Selatan',
    mv:'Maldives', lk:'Sri Lanka', np:'Nepal', mm:'Myanmar', bt:'Bhutan',
    be:'Belgium',
    nz:'New Zealand', vn:'Vietnam',
    // Microstates / city-states
    mc:'Monaco', sm:'San Marino', va:'Kota Vatican', ad:'Andorra',
    li:'Liechtenstein', lu:'Luxembourg', mt:'Malta',
};

// ============================================================
// أسماء المدن حسب اللغة (المفتاح: الاسم الإنجليزي من cities-{cc}.json)
// كلّ قاموس يحوي مدناً كبرى شائعة + عواصم الدول الصغيرة (microstates)
// ============================================================

// ----- بالأوردو -----
var CITY_NAMES_UR = {
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
    Monaco:'موناکو', 'Monte Carlo':'مونٹی کارلو', 'La Condamine':'لا کونڈامین',
    Fontvieille:'فونٹفیے', Moneghetti:'مونیگیٹی', 'La Rousse':'لا روس',
    Larvotto:'لارووٹو', 'Saint Michel':'سان میشیل', 'Jardin Exotique':'ژاردین ایگزوٹیک',
    'La Colle':'لا کول',
    'San Marino':'سان مارینو', Serravalle:'سیراوالے', 'Borgo Maggiore':'بورگو ماجوری',
    Domagnano:'دوماجنانو', Fiorentino:'فیورنٹینو', Faetano:'فائیتانو',
    Acquaviva:'اکواویوا', Chiesanuova:'کیئسانووا', Montegiardino:'مونٹیجاردینو',
    'Vatican City':'ویٹیکن سٹی', "St. Peter's Square":'سینٹ پیٹر اسکوائر', 'Vatican Gardens':'ویٹیکن گارڈنز',
    'Andorra la Vella':'انڈورا لا ویا', 'Escaldes-Engordany':'ایسکالدیس-انگوردانی',
    Encamp:'انکمپ', 'Sant Julià de Lòria':'سانت جولیا', 'La Massana':'لا ماسانا',
    Ordino:'اوردینو', Canillo:'کانیلو', 'Pas de la Casa':'پاس دے لا کاسا',
    Arinsal:'ارنسال', Soldeu:'سولدو',
    Vaduz:'فادوز', Schaan:'شان', Balzers:'بالزرز', Triesen:'ٹریزن',
    Eschen:'ایشن', Mauren:'مارین', Triesenberg:'ٹریزنبرگ', Ruggell:'روگل',
    Gamprin:'گامپرن', Schellenberg:'شیلنبرگ', Planken:'پلانکن',
    Luxembourg:'لکسمبرگ', 'Esch-sur-Alzette':'ایش سور الزیٹ', Differdange:'ڈیفرڈینج',
    Dudelange:'ڈوڈلانج', 'Pétange':'پیٹانج', Sanem:'سانم', Hesperange:'ہسپرانج',
    Bettembourg:'بیٹمبرگ', Schifflange:'شفلانج', 'Käerjeng':'کیرژینگ', Mamer:'مامر',
    Strassen:'شٹراسن', Diekirch:'ڈیکرچ', Ettelbruck:'ایٹلبروک',
    Valletta:'ویلیٹا', Birkirkara:'برکرکارا', Mosta:'موستا', Qormi:'قورمی',
    "Saint Paul's Bay":'سینٹ پال بے', Sliema:'سلیما', Naxxar:'ناکسار', 'Żabbar':'زبار',
    "St. Julian's":'سینٹ جولینز', Fgura:'فجورا', Mdina:'مدینہ',
    Victoria:'وکٹوریا', Marsaskala:'مارساسکالا',
};

// ----- بالتركية -----
var CITY_NAMES_TR = {
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
    Monaco:'Monako', 'Monte Carlo':'Monte Karlo', 'La Condamine':'La Condamine',
    Fontvieille:'Fontvieille',
    'San Marino':'San Marino', Serravalle:'Serravalle', 'Borgo Maggiore':'Borgo Maggiore',
    'Vatican City':'Vatikan',
    'Andorra la Vella':'Andorra la Vella', 'Escaldes-Engordany':'Escaldes-Engordany',
    Encamp:'Encamp', 'Sant Julià de Lòria':'Sant Julià de Lòria',
    Vaduz:'Vaduz', Schaan:'Schaan', Balzers:'Balzers',
    Luxembourg:'Lüksemburg', 'Esch-sur-Alzette':'Esch-sur-Alzette',
    Valletta:'Valletta', Birkirkara:'Birkirkara', Mosta:'Mosta', Sliema:'Sliema',
};

// ----- بالفرنسية -----
var CITY_NAMES_FR = {
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
    Casablanca:'Casablanca', Marrakesh:'Marrakech',
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
    Monaco:'Monaco', 'Monte Carlo':'Monte-Carlo', 'La Condamine':'La Condamine',
    Fontvieille:'Fontvieille',
    'San Marino':'Saint-Marin', Serravalle:'Serravalle', 'Borgo Maggiore':'Borgo Maggiore',
    'Vatican City':'Cité du Vatican', "St. Peter's Square":'Place Saint-Pierre',
    'Andorra la Vella':'Andorre-la-Vieille', 'Escaldes-Engordany':'Escaldes-Engordany',
    Vaduz:'Vaduz',
    Luxembourg:'Luxembourg', 'Esch-sur-Alzette':'Esch-sur-Alzette',
    Valletta:'La Valette', Rabat:'Rabat', Victoria:'Victoria',
};

// ----- بالألمانية -----
var CITY_NAMES_DE = {
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
    Casablanca:'Casablanca', Marrakesh:'Marrakesch',
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
    Monaco:'Monaco', 'Monte Carlo':'Monte-Carlo',
    'San Marino':'San Marino', 'Vatican City':'Vatikanstadt',
    'Andorra la Vella':'Andorra la Vella',
    Vaduz:'Vaduz',
    Luxembourg:'Luxemburg', 'Esch-sur-Alzette':'Esch an der Alzette',
    Valletta:'Valletta', Rabat:'Rabat',
};

// ----- بالإندونيسية -----
var CITY_NAMES_ID = {
    Mecca:'Makkah', Medina:'Madinah', Riyadh:'Riyadh', Jeddah:'Jeddah',
    Dammam:'Dammam', Khobar:'Khobar', Taif:'Taif', Tabuk:'Tabuk',
    Buraidah:'Buraidah', Buraydah:'Buraidah', Abha:'Abha', Yanbu:'Yanbu', Hail:'Hail',
    Najran:'Najran', Jizan:'Jizan', 'Khamis Mushait':'Khamis Mushait',
    'Al Hofuf':'Hofuf', Hofuf:'Hofuf', 'Al Kharj':'Al Kharj',
    Qatif:'Qatif', 'Al Jubail':'Al Jubail', Jubail:'Al Jubail',
    Cairo:'Kairo', Alexandria:'Alexandria', Giza:'Giza',
    Istanbul:'Istanbul', Ankara:'Ankara', Izmir:'Izmir',
    Dubai:'Dubai', 'Abu Dhabi':'Abu Dhabi', Sharjah:'Sharjah',
    Amman:'Amman', Baghdad:'Baghdad', Basra:'Basra', Mosul:'Mosul',
    Damascus:'Damaskus', Aleppo:'Aleppo', Homs:'Homs',
    Casablanca:'Casablanca', Marrakesh:'Marrakesh',
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
    'Andorra la Vella':'Andorra la Vella',
    Vaduz:'Vaduz',
    Luxembourg:'Luksemburg',
    Valletta:'Valletta',
};

// ----- بالبنغالية -----
var CITY_NAMES_BN = {
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
    Casablanca:'কাসাব্লাঙ্কা', Marrakesh:'মারাকেশ',
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
    Monaco:'মোনাকো', 'Monte Carlo':'মন্টে কার্লো', 'La Condamine':'লা কঁদামিন',
    Fontvieille:'ফন্টভিয়েই', Moneghetti:'মনেগেত্তি', 'La Rousse':'লা রুস',
    Larvotto:'লারভোট্টো', 'Saint Michel':'সেন্ট মিশেল', 'Jardin Exotique':'জারদিন এক্সোটিক',
    'La Colle':'লা কল',
    'San Marino':'সান মারিনো', Serravalle:'সেরাভালে', 'Borgo Maggiore':'বর্গো মাজ্জোরে',
    Domagnano:'দোমাঞানো', Fiorentino:'ফিওরেন্তিনো', Faetano:'ফায়েতানো',
    Acquaviva:'আকুয়াভিভা', Chiesanuova:'কিয়েসানুওভা', Montegiardino:'মন্তেজার্দিনো',
    'Vatican City':'ভ্যাটিকান সিটি', "St. Peter's Square":'সেন্ট পিটার্স স্কোয়ার', 'Vatican Gardens':'ভ্যাটিকান গার্ডেনস',
    'Andorra la Vella':'আন্দোরা লা ভেলা', 'Escaldes-Engordany':'এসকালদেস-এনগর্দানি',
    Encamp:'এনক্যাম্প', 'Sant Julià de Lòria':'সান্ত জুলিয়া দে লোরিয়া', 'La Massana':'লা মাসানা',
    Ordino:'অর্দিনো', Canillo:'কানিলো', 'Pas de la Casa':'পা দে লা কাসা',
    Arinsal:'আরিনসাল', Soldeu:'সলদেউ',
    Vaduz:'ফাদুৎস', Schaan:'শান', Balzers:'বালৎসার্স', Triesen:'ট্রিজেন',
    Eschen:'এশেন', Mauren:'মাউরেন', Triesenberg:'ট্রিজেনবার্গ', Ruggell:'রুগ্গেল',
    Gamprin:'গ্যামপ্রিন', Schellenberg:'শেলেনবার্গ', Planken:'প্লাঙ্কেন',
    Luxembourg:'লুক্সেমবার্গ', 'Esch-sur-Alzette':'এশ-সুর-আলজেত', Differdange:'দিফারদাঞ্জ',
    Dudelange:'দুদেলাঞ্জ', 'Pétange':'পেতাঞ্জ', Sanem:'সানেম', Hesperange:'এসপেরাঞ্জ',
    Bettembourg:'বেটেমবর্গ', Schifflange:'শিফলাঞ্জ', 'Käerjeng':'ক্যারজেং', Mamer:'মামের',
    Strassen:'স্ট্রাসেন', Diekirch:'দিকির্ক', Ettelbruck:'এটেলব্রাক',
    Valletta:'ভ্যালেটা', Birkirkara:'বিরকিরকারা', Mosta:'মোস্তা', Qormi:'কোরমি',
    "Saint Paul's Bay":'সেন্ট পলস বে', Sliema:'স্লিমা', Naxxar:'নাক্সার', 'Żabbar':'জাব্বার',
    "St. Julian's":'সেন্ট জুলিয়ানস', Fgura:'ফগুরা', Rabat:'রাবাত', Mdina:'মদিনা',
    Victoria:'ভিক্টোরিয়া', Marsaskala:'মার্সাস্কালা',
};

// ----- بالإسبانية -----
var CITY_NAMES_ES = {
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
    'Andorra la Vella':'Andorra la Vieja', 'Escaldes-Engordany':'Escaldes-Engordany',
    Vaduz:'Vaduz',
    Luxembourg:'Luxemburgo', 'Esch-sur-Alzette':'Esch-sur-Alzette',
    Valletta:'La Valeta',
};

// ----- بالملايو -----
var CITY_NAMES_MS = {
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
    'Andorra la Vella':'Andorra la Vella',
    Vaduz:'Vaduz',
    Luxembourg:'Luxembourg',
    Valletta:'Valletta',
};

// ============================================================
// سجلّات خريطة اللغة → القاموس (يستعملها app.js & prayer-times-cities.html)
// ============================================================
var _LOCALIZED_COUNTRY_MAPS = {
    ar: COUNTRY_NAMES_AR,
    ur: COUNTRY_NAMES_UR, tr: COUNTRY_NAMES_TR, fr: COUNTRY_NAMES_FR,
    de: COUNTRY_NAMES_DE, id: COUNTRY_NAMES_ID,
    bn: COUNTRY_NAMES_BN, es: COUNTRY_NAMES_ES, ms: COUNTRY_NAMES_MS,
};
var _LOCALIZED_CITY_MAPS = {
    ur: CITY_NAMES_UR, tr: CITY_NAMES_TR, fr: CITY_NAMES_FR,
    de: CITY_NAMES_DE, id: CITY_NAMES_ID,
    bn: CITY_NAMES_BN, es: CITY_NAMES_ES, ms: CITY_NAMES_MS,
};

// ============================================================
// alias مؤقت للتوافق مع الكود الموجود في prayer-times-cities.html
// الذي يستخدم CITY_NAMES_LOCAL[lang] كبنية مفتَرَضة
// ============================================================
var CITY_NAMES_LOCAL = _LOCALIZED_CITY_MAPS;

// alias لاستخدام `COUNTRY_NAMES` بدون لاحقة (AR) في prayer-times-cities.html
var COUNTRY_NAMES = COUNTRY_NAMES_AR;
