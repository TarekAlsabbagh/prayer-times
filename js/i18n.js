/**
 * نظام ثنائي اللغة — عربي / إنجليزي
 */

const TRANSLATIONS = {
    ar: {
        // التطبيق
        'app.title': '🕌 مواقيت الصلاة',
        // التنقل
        'nav.prayer_times': 'مواقيت الصلاة',
        'nav.qibla': 'إتجاه القبلة',
        'nav.moon': 'القمر اليوم',
        'nav.zakat': 'حاسبة الزكاة',
        'nav.hijri_today': 'التاريخ الهجري',
        'nav.date_converter': 'تحويل التاريخ',
        'nav.hijri_calendar': 'التقويم الهجري',
        'nav.duas': 'الأدعية والأذكار',
        'nav.tasbih': 'المسبحة الإلكترونية',
        // الهيدر
        'header.locating': 'جاري تحديد الموقع...',
        'header.search_placeholder': '🔍 ابحث عن مدينة أو موقع...',
        'header.my_location': 'موقعي',
        'header.home': 'الرئيسية',
        // البانر
        'banner.current_time': 'الوقت الحالي في',
        'banner.next_prayer': 'الوقت المتبقي للصلاة التالية',
        'banner.today_date': 'التاريخ اليوم',
        // أسماء الصلوات
        'prayer.fajr': 'الفجر',
        'prayer.sunrise': 'الشروق',
        'prayer.dhuhr': 'الظهر',
        'prayer.asr': 'العصر',
        'prayer.maghrib': 'المغرب',
        'prayer.isha': 'العشاء',
        // الإعدادات
        'settings.title': '⚙️ إعدادات حساب المواقيت',
        'settings.method': 'طريقة الحساب',
        'settings.asr_method': 'طريقة حساب العصر',
        'settings.time_format': 'صيغة الوقت',
        'settings.high_lats': 'خطوط العرض العالية',
        // طرق الحساب
        'method.Makkah': 'أم القرى - مكة المكرمة',
        'method.MWL': 'رابطة العالم الإسلامي',
        'method.ISNA': 'أمريكا الشمالية (ISNA)',
        'method.Egypt': 'الهيئة المصرية العامة للمساحة',
        'method.Karachi': 'جامعة العلوم الإسلامية - كراتشي',
        'method.Tehran': 'معهد الجيوفيزياء - طهران',
        'method.Jafari': 'المذهب الجعفري',
        'method.Gulf': 'دول الخليج',
        'method.Kuwait': 'الكويت',
        'method.Qatar': 'قطر',
        'method.Singapore': 'سنغافورة',
        'method.Turkey': 'تركيا - ديانت',
        'method.France': 'اتحاد المنظمات الإسلامية في فرنسا (UIOF)',
        'method.Russia': 'روسيا',
        // طرق العصر
        'asr.Shafi': 'شافعي / حنبلي / مالكي',
        'asr.Hanafi': 'حنفي',
        // صيغ الوقت
        'format.12h': '12 ساعة',
        'format.24h': '24 ساعة',
        // خطوط العرض العالية
        'highlat.NightMiddle': 'منتصف الليل',
        'highlat.OneSeventh': 'سُبع الليل',
        'highlat.AngleBased': 'حسب الزاوية',
        // الأذان
        'adhan.title': 'تشغيل الأذان تلقائياً',
        'adhan.desc': 'يُشغَّل صوت الأذان عند دخول وقت كل صلاة',
        'adhan.test': '▶ تجربة',
        // السكان
        'pop.label': 'عدد سكان',
        'pop.live': 'تابع التحديث المباشر',
        'pop.note': '📊 تقدير إحصائي — يُحسب بناءً على آخر إحصاء رسمي مضافاً إليه معدل النمو السنوي للدولة مقسّماً على ثانية',
        // الأماكن القريبة
        'nearby.title': '📍 أماكن قريبة من موقعك',
        // معلومات إضافية
        'info.title': '📊 معلومات إضافية',
        'info.hijri': 'التاريخ الهجري',
        'info.gregorian': 'التاريخ الميلادي',
        'info.fasting': 'ساعات الصيام',
        // الجدول
        'schedule.title': '📅 جدول مواقيت الصلاة',
        'schedule.week': 'أسبوع',
        'schedule.two_weeks': 'أسبوعان',
        'schedule.month': 'شهر',
        'schedule.gregorian': 'ميلادي',
        'schedule.hijri': 'هجري',
        'schedule.day_label': 'اليوم',
        'schedule.month_label': 'الشهر',
        'schedule.year_label': 'السنة',
        'schedule.th_day': 'اليوم',
        // الأسئلة الشائعة
        'faq.title': '❓ الأسئلة الشائعة حول مواقيت الصلاة',
        // مدن الدولة
        'cities.more_btn': 'عرض جميع المدن',
        // الحديث
        'hadith.title': '📜 حديث اليوم',
        // القبلة
        'qibla.title': '🧭 اتجاه القبلة',
        'qibla.location_title': '📍 موقعك الحالي',
        'qibla.city': 'المدينة',
        'qibla.lat': 'خط العرض',
        'qibla.lng': 'خط الطول',
        'qibla.angle': 'زاوية القبلة',
        'qibla.N': 'شمال',
        'qibla.S': 'جنوب',
        'qibla.E': 'شرق',
        'qibla.W': 'غرب',
        'qibla.NE': 'شمال شرق',
        'qibla.NW': 'شمال غرب',
        'qibla.SE': 'جنوب شرق',
        'qibla.SW': 'جنوب غرب',
        // القمر
        'moon.title': '🌙 القمر اليوم',
        'moon.age': 'عمر القمر',
        'moon.illumination': 'نسبة الإضاءة',
        'moon.rise': 'شروق القمر',
        'moon.set': 'غروب القمر',
        'moon.next_full': 'البدر القادم',
        'moon.next_new': 'المحاق القادم',
        // الزكاة
        'zakat.title': '💰 حاسبة الزكاة',
        'zakat.currency': 'العملة',
        'zakat.cash': 'النقد (كاش + حسابات بنكية)',
        'zakat.gold': 'قيمة الذهب',
        'zakat.silver': 'قيمة الفضة',
        'zakat.stocks': 'أسهم واستثمارات',
        'zakat.property': 'عقارات تجارية (للبيع)',
        'zakat.debt': 'ديون عليك (تُخصم)',
        'zakat.total': 'إجمالي الأموال الخاضعة للزكاة',
        'zakat.amount': 'مبلغ الزكاة المستحق (2.5%)',
        'zakat.conditions_title': '📋 شروط وجوب الزكاة',
        'zakat.cond1': 'بلوغ النصاب: ما يعادل 85 غراماً من الذهب أو 595 غراماً من الفضة',
        'zakat.cond2': 'مرور حول كامل (سنة هجرية) على المال',
        'zakat.cond3': 'أن يكون المال ملكاً تاماً لصاحبه',
        'zakat.cond4': 'أن يكون المال نامياً أو قابلاً للنماء',
        'zakat.cond5': 'نسبة الزكاة: 2.5% من إجمالي الأموال',
        // التاريخ الهجري
        'hijri_today.title': '📅 التاريخ الهجري اليوم',
        'hijri_today.day_label': 'اليوم',
        'hijri_today.equivalent': 'يوافق بالتاريخ الميلادي',
        'hijri_today.month_info': '📊 معلومات الشهر الهجري',
        'hijri_today.month_name': 'الشهر الهجري',
        'hijri_today.days_count': 'عدد أيام الشهر',
        'hijri_today.year': 'السنة الهجرية',
        'hijri_today.leap': 'سنة كبيسة؟',
        // محول التاريخ
        'converter.title': '🔄 تحويل التاريخ',
        'converter.to_hijri': 'من ميلادي إلى هجري',
        'converter.to_gregorian': 'من هجري إلى ميلادي',
        'converter.day': 'اليوم',
        'converter.month': 'الشهر',
        'converter.year': 'السنة',
        'converter.result_hijri': 'التاريخ الهجري المقابل',
        'converter.result_gregorian': 'التاريخ الميلادي المقابل',
        // التقويم
        'calendar.title': '🗓️ التقويم الهجري',
        'calendar.prev': '→ السابق',
        'calendar.next': 'التالي ←',
        // الأدعية
        'duas.title': '🤲 الأدعية والأذكار',
        // المسبحة
        'tasbih.title': '📿 المسبحة الإلكترونية',
        'tasbih.auto': 'التسبيح التلقائي',
        'tasbih.free': 'عداد مفتوح',
        'tasbih.press': 'اضغط للعد',
        'tasbih.reset': '↺ تصفير العداد',
        'tasbih.reset_session': '🗑 تصفير الجلسة',
        'tasbih.session_label': 'إجمالي الجلسة:',
        'tasbih.unit': 'تسبيحة',
        'tasbih.free_unit': 'ضغطة',
        // بوب آب الأذان
        'adhan_popup.prefix': 'يحين الآن موعد أذان',
        'adhan_popup.location': 'بالتوقيت المحلي لـ',
        'adhan_popup.close': '⏹ إغلاق',
        // الفوتر
        'footer.rights': 'جميع الحقوق محفوظة',
        'footer.note': 'الأوقات محسوبة بخوارزمية فلكية تعتمد على خطوط الطول والعرض',
        // أسماء الأشهر الهجرية
        'hmonth.1':'محرم','hmonth.2':'صفر','hmonth.3':'ربيع الأول',
        'hmonth.4':'ربيع الآخر','hmonth.5':'جمادى الأولى','hmonth.6':'جمادى الآخرة',
        'hmonth.7':'رجب','hmonth.8':'شعبان','hmonth.9':'رمضان',
        'hmonth.10':'شوال','hmonth.11':'ذو القعدة','hmonth.12':'ذو الحجة',
        // أسماء الأشهر الميلادية
        'gmonth.1':'يناير','gmonth.2':'فبراير','gmonth.3':'مارس',
        'gmonth.4':'أبريل','gmonth.5':'مايو','gmonth.6':'يونيو',
        'gmonth.7':'يوليو','gmonth.8':'أغسطس','gmonth.9':'سبتمبر',
        'gmonth.10':'أكتوبر','gmonth.11':'نوفمبر','gmonth.12':'ديسمبر',
        // أيام الأسبوع
        'wday.0':'الأحد','wday.1':'الاثنين','wday.2':'الثلاثاء',
        'wday.3':'الأربعاء','wday.4':'الخميس','wday.5':'الجمعة','wday.6':'السبت',
        // لاحقة التاريخ
        'date.hijri_suffix': ' هـ',
        'date.greg_suffix': ' م',
        // الوحدات
        'unit.hour': 'ساعة',
        'unit.hours': 'ساعة',
        'unit.min': 'دقيقة',
        'unit.and': ' و',
        // صفحة المدن
        'cities_page.loading': 'جاري تحميل المدن...',
        'cities_page.error': '⚠️ تعذّر تحميل البيانات حالياً.',
        'cities_page.retry': '↺ إعادة المحاولة',
        'cities_page.no_results': 'لا توجد نتائج',
        'cities_page.searching': '🔍 جاري البحث...',
        'cities_page.search_placeholder': '🔍 ابحث عن مدينة أو منطقة...',
        // صفحة المدينة
        'about.back': '← رجوع',
        'about.loading': 'جاري تحميل بيانات المدينة...',
        'about.local_time': 'الوقت المحلي',
        'about.hijri_date': 'التاريخ الهجري',
        'about.greg_date': 'التاريخ الميلادي',
        'about.prayer_times': 'أوقات الصلاة',
        'about.see_times': 'اضغط للعرض',
        'about.highlights': '📌 معلومات سريعة',
        'about.about_city': '📖 عن المدينة',
        'about.map': '🗺️ موقع المدينة على الخريطة',
        'about.wiki_read_more': '📚 اقرأ المزيد في ويكيبيديا',
        'about.no_wiki': 'لا تتوفر معلومات تفصيلية في ويكيبيديا العربية لهذه المدينة.',
        // متفرقات
        'misc.yes': 'نعم',
        'misc.no': 'لا',
    },

    en: {
        // App
        'app.title': '🕌 Prayer Times',
        // Navigation
        'nav.prayer_times': 'Prayer Times',
        'nav.qibla': 'Qibla Direction',
        'nav.moon': 'Moon Today',
        'nav.zakat': 'Zakat Calculator',
        'nav.hijri_today': 'Hijri Date',
        'nav.date_converter': 'Date Converter',
        'nav.hijri_calendar': 'Hijri Calendar',
        'nav.duas': 'Duas & Adhkar',
        'nav.tasbih': 'Digital Tasbih',
        // Header
        'header.locating': 'Detecting location...',
        'header.search_placeholder': '🔍 Search for a city...',
        'header.my_location': 'My Location',
        'header.home': 'Home',
        // Banner
        'banner.current_time': 'Current time in',
        'banner.next_prayer': 'Time until next prayer',
        'banner.today_date': "Today's date",
        // Prayer names
        'prayer.fajr': 'Fajr',
        'prayer.sunrise': 'Sunrise',
        'prayer.dhuhr': 'Dhuhr',
        'prayer.asr': 'Asr',
        'prayer.maghrib': 'Maghrib',
        'prayer.isha': 'Isha',
        // Settings
        'settings.title': '⚙️ Calculation Settings',
        'settings.method': 'Calculation Method',
        'settings.asr_method': 'Asr Method',
        'settings.time_format': 'Time Format',
        'settings.high_lats': 'High Latitudes',
        // Calc methods
        'method.Makkah': 'Umm al-Qura – Makkah',
        'method.MWL': 'Muslim World League',
        'method.ISNA': 'North America (ISNA)',
        'method.Egypt': 'Egyptian General Authority',
        'method.Karachi': 'Univ. of Islamic Sciences – Karachi',
        'method.Tehran': 'Institute of Geophysics – Tehran',
        'method.Jafari': 'Jafari School',
        'method.Gulf': 'Gulf Countries',
        'method.Kuwait': 'Kuwait',
        'method.Qatar': 'Qatar',
        'method.Singapore': 'Singapore',
        'method.Turkey': 'Turkey (Diyanet)',
        'method.France': 'Union of Islamic Orgs. France (UIOF)',
        'method.Russia': 'Russia',
        // Asr methods
        'asr.Shafi': "Shafi'i / Hanbali / Maliki",
        'asr.Hanafi': 'Hanafi',
        // Time formats
        'format.12h': '12-hour',
        'format.24h': '24-hour',
        // High lat methods
        'highlat.NightMiddle': 'Middle of Night',
        'highlat.OneSeventh': 'One-Seventh of Night',
        'highlat.AngleBased': 'Angle-Based',
        // Adhan
        'adhan.title': 'Auto-play Adhan',
        'adhan.desc': 'Plays adhan sound at each prayer time',
        'adhan.test': '▶ Test',
        // Population
        'pop.label': 'Population of',
        'pop.live': 'Live updates',
        'pop.note': '📊 Statistical estimate — based on the latest census plus annual growth rate per second',
        // Nearby
        'nearby.title': '📍 Nearby Places',
        // Info
        'info.title': '📊 Additional Info',
        'info.hijri': 'Hijri Date',
        'info.gregorian': 'Gregorian Date',
        'info.fasting': 'Fasting Hours',
        // Schedule
        'schedule.title': '📅 Prayer Schedule',
        'schedule.week': 'Week',
        'schedule.two_weeks': '2 Weeks',
        'schedule.month': 'Month',
        'schedule.gregorian': 'Gregorian',
        'schedule.hijri': 'Hijri',
        'schedule.day_label': 'Day',
        'schedule.month_label': 'Month',
        'schedule.year_label': 'Year',
        'schedule.th_day': 'Day',
        // FAQ
        'faq.title': '❓ Prayer Times FAQ',
        // Country cities
        'cities.more_btn': 'View All Cities',
        // Hadith
        'hadith.title': '📜 Hadith of the Day',
        // Qibla
        'qibla.title': '🧭 Qibla Direction',
        'qibla.location_title': '📍 Your Location',
        'qibla.city': 'City',
        'qibla.lat': 'Latitude',
        'qibla.lng': 'Longitude',
        'qibla.angle': 'Qibla Angle',
        'qibla.N': 'N',
        'qibla.S': 'S',
        'qibla.E': 'E',
        'qibla.W': 'W',
        'qibla.NE': 'NE',
        'qibla.NW': 'NW',
        'qibla.SE': 'SE',
        'qibla.SW': 'SW',
        // Moon
        'moon.title': '🌙 Moon Today',
        'moon.age': 'Moon Age',
        'moon.illumination': 'Illumination',
        'moon.rise': 'Moonrise',
        'moon.set': 'Moonset',
        'moon.next_full': 'Next Full Moon',
        'moon.next_new': 'Next New Moon',
        // Zakat
        'zakat.title': '💰 Zakat Calculator',
        'zakat.currency': 'Currency',
        'zakat.cash': 'Cash (cash + bank accounts)',
        'zakat.gold': 'Gold Value',
        'zakat.silver': 'Silver Value',
        'zakat.stocks': 'Stocks & Investments',
        'zakat.property': 'Commercial Property (for sale)',
        'zakat.debt': 'Debts owed (deducted)',
        'zakat.total': 'Total Zakatable Assets',
        'zakat.amount': 'Zakat Due (2.5%)',
        'zakat.conditions_title': '📋 Zakat Conditions',
        'zakat.cond1': 'Nisab: equivalent to 85g of gold or 595g of silver',
        'zakat.cond2': 'One full lunar year must pass on the wealth (Hawl)',
        'zakat.cond3': 'The wealth must be fully owned by its possessor',
        'zakat.cond4': 'The wealth must be growing or capable of growth',
        'zakat.cond5': 'Zakat rate: 2.5% of total assets',
        // Hijri Today
        'hijri_today.title': '📅 Hijri Date Today',
        'hijri_today.day_label': 'Today',
        'hijri_today.equivalent': 'Gregorian equivalent',
        'hijri_today.month_info': '📊 Hijri Month Info',
        'hijri_today.month_name': 'Hijri Month',
        'hijri_today.days_count': 'Days in Month',
        'hijri_today.year': 'Hijri Year',
        'hijri_today.leap': 'Leap Year?',
        // Date Converter
        'converter.title': '🔄 Date Converter',
        'converter.to_hijri': 'Gregorian to Hijri',
        'converter.to_gregorian': 'Hijri to Gregorian',
        'converter.day': 'Day',
        'converter.month': 'Month',
        'converter.year': 'Year',
        'converter.result_hijri': 'Hijri equivalent',
        'converter.result_gregorian': 'Gregorian equivalent',
        // Calendar
        'calendar.title': '🗓️ Hijri Calendar',
        'calendar.prev': '← Prev',
        'calendar.next': 'Next →',
        // Duas
        'duas.title': '🤲 Duas & Adhkar',
        // Tasbih
        'tasbih.title': '📿 Digital Tasbih',
        'tasbih.auto': 'Auto Tasbih',
        'tasbih.free': 'Free Counter',
        'tasbih.press': 'Tap to Count',
        'tasbih.reset': '↺ Reset',
        'tasbih.reset_session': '🗑 Reset Session',
        'tasbih.session_label': 'Session Total:',
        'tasbih.unit': 'times',
        'tasbih.free_unit': 'taps',
        // Adhan popup
        'adhan_popup.prefix': 'It is now time for',
        'adhan_popup.location': 'local time in',
        'adhan_popup.close': '⏹ Close',
        // Footer
        'footer.rights': 'All rights reserved',
        'footer.note': 'Times calculated using an astronomical algorithm based on latitude and longitude',
        // Hijri month names
        'hmonth.1':'Muharram','hmonth.2':'Safar','hmonth.3':"Rabi' al-Awwal",
        'hmonth.4':"Rabi' al-Thani",'hmonth.5':'Jumada al-Ula','hmonth.6':'Jumada al-Akhira',
        'hmonth.7':'Rajab','hmonth.8':"Sha'ban",'hmonth.9':'Ramadan',
        'hmonth.10':'Shawwal','hmonth.11':"Dhu al-Qi'dah",'hmonth.12':'Dhu al-Hijjah',
        // Gregorian month names
        'gmonth.1':'January','gmonth.2':'February','gmonth.3':'March',
        'gmonth.4':'April','gmonth.5':'May','gmonth.6':'June',
        'gmonth.7':'July','gmonth.8':'August','gmonth.9':'September',
        'gmonth.10':'October','gmonth.11':'November','gmonth.12':'December',
        // Weekdays
        'wday.0':'Sunday','wday.1':'Monday','wday.2':'Tuesday',
        'wday.3':'Wednesday','wday.4':'Thursday','wday.5':'Friday','wday.6':'Saturday',
        // Date suffixes
        'date.hijri_suffix': ' AH',
        'date.greg_suffix': '',
        // Units
        'unit.hour': 'hr',
        'unit.hours': 'hrs',
        'unit.min': 'min',
        'unit.and': ' ',
        // Cities page
        'cities_page.loading': 'Loading cities...',
        'cities_page.error': '⚠️ Failed to load data.',
        'cities_page.retry': '↺ Retry',
        'cities_page.no_results': 'No results found',
        'cities_page.searching': '🔍 Searching...',
        'cities_page.search_placeholder': '🔍 Search for a city...',
        // About city page
        'about.back': '→ Back',
        'about.loading': 'Loading city data...',
        'about.local_time': 'Local Time',
        'about.hijri_date': 'Hijri Date',
        'about.greg_date': 'Gregorian Date',
        'about.prayer_times': 'Prayer Times',
        'about.see_times': 'View times',
        'about.highlights': '📌 Quick Facts',
        'about.about_city': '📖 About the City',
        'about.map': '🗺️ City Location on Map',
        'about.wiki_read_more': '📚 Read more on Wikipedia',
        'about.no_wiki': 'No detailed information available on Arabic Wikipedia for this city.',
        // Miscellaneous
        'misc.yes': 'Yes',
        'misc.no': 'No',
    }
};

// اكتشاف اللغة: URL أولاً → localStorage → لغة المتصفح
function _detectLang() {
    if (window.location.pathname.startsWith('/en')) return 'en';
    const saved = localStorage.getItem('app_lang');
    if (saved) return saved;
    // زيارة أولى: استخدام لغة المتصفح
    const bl = (navigator.language || navigator.userLanguage || 'ar').toLowerCase();
    return bl.startsWith('ar') ? 'ar' : 'en';
}
let _lang = _detectLang();

function t(key) {
    const v = TRANSLATIONS[_lang]?.[key];
    if (v !== undefined) return v;
    const ar = TRANSLATIONS['ar']?.[key];
    if (ar !== undefined) return ar;
    return key;
}

function getCurrentLang() { return _lang; }

function setLanguage(lang) {
    if (lang !== 'ar' && lang !== 'en') return;
    // التنقل بين إصدارات URL عند تغيير اللغة
    const curPath = window.location.pathname;
    const isEnUrl = curPath.startsWith('/en');
    if (lang === 'en' && !isEnUrl && window.location.protocol !== 'file:') {
        // حوّل /foo.html → /en/foo أو / → /en/
        const withoutHtml = curPath.replace(/\.html$/, '');
        localStorage.setItem('app_lang', 'en');
        window.location.href = '/en' + (withoutHtml === '/' ? '/' : withoutHtml) + window.location.search;
        return;
    }
    if (lang === 'ar' && isEnUrl && window.location.protocol !== 'file:') {
        // حوّل /en/foo → /foo.html أو /en/ → /
        const arPath = curPath.replace(/^\/en/, '') || '/';
        const withHtml = arPath === '/' ? '/' : arPath + '.html';
        localStorage.setItem('app_lang', 'ar');
        window.location.href = withHtml + window.location.search;
        return;
    }
    _lang = lang;
    localStorage.setItem('app_lang', lang);

    // تحديث اتجاه الصفحة
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';

    // تطبيق النصوص الثابتة
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const val = t(key);
        if (val && val !== key) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const val = t(el.dataset.i18nPlaceholder);
        if (val) el.placeholder = val;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const val = t(el.dataset.i18nTitle);
        if (val) el.title = val;
    });

    // تحديث زر اللغة
    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
        btn.textContent = lang === 'ar' ? 'EN' : 'عر';
    });

    // تحديث أشهر الهجري والميلادي وأيام الأسبوع في HijriDate
    if (typeof HijriDate !== 'undefined') {
        const hm = Array.from({length:12}, (_,i) => t('hmonth.'+(i+1)));
        const gm = Array.from({length:12}, (_,i) => t('gmonth.'+(i+1)));
        const wd = Array.from({length:7},  (_,i) => t('wday.'+i));
        HijriDate.hijriMonths.splice(0, 12, ...hm);
        HijriDate.gregorianMonths.splice(0, 12, ...gm);
        HijriDate.dayNames.splice(0, 7, ...wd);
    }

    // إعادة رسم المحتوى الديناميكي
    if (typeof onLanguageChange === 'function') onLanguageChange(lang);
}

function toggleLanguage() {
    setLanguage(_lang === 'ar' ? 'en' : 'ar');
}

// تطبيق اللغة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => setLanguage(_lang));
