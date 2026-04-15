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
};

// ===== دوال مساعدة لعرض الأسماء حسب اللغة =====
function getDisplayCity() {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    // لكل اللغات غير العربية: استخدم الاسم اللاتيني (الإنجليزي) كاحتياط موحّد
    if (lang !== 'ar') {
        return currentEnglishDisplayName || currentEnglishName || currentCity;
    }
    return currentCity; // يحتوي بالفعل على "المدينة، الحي" إن وُجد حي
}
function getDisplayCountry() {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    if (lang !== 'ar') {
        return currentEnglishCountry || COUNTRY_EN_NAMES[currentCountryCode] || currentCountry;
    }
    return currentCountry;
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
    'Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",
    'Jumada al-Awwal','Jumada al-Thani','Rajab',"Sha'ban",
    'Ramadan','Shawwal',"Dhu al-Qi'dah",'Dhu al-Hijjah'
];
const DAY_NAMES_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const G_MONTHS_AR  = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const G_MONTHS_EN  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function hijriDayUrl(year, month, day) {
    const slug = HIJRI_MONTH_SLUGS[month - 1];
    const base = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en' ? '/en' : '';
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
    document.getElementById('tasbih-mode-auto').style.display = mode === 'auto' ? '' : 'none';
    document.getElementById('tasbih-mode-free').style.display = mode === 'free' ? '' : 'none';
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

// جلب المنطقة الزمنية من الإحداثيات
async function fetchTimezone(lat, lng) {
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
    // احتياطي محسّن: أقرب نصف ساعة لخط الطول
    return Math.round((lng / 15) * 2) / 2;
}

// إنشاء slug لاسم المدينة (للـ URL)
function makeSlug(englishName, lat, lng) {
    const latin = (englishName || '').toLowerCase()
        .replace(/[^a-z0-9\s]+/g, '')
        .trim()
        .replace(/\s+/g, '-');
    if (latin.length >= 2) return latin;
    // للمدن بأسماء غير لاتينية: استخدام الإحداثيات
    const la = Math.abs(lat).toFixed(1) + (lat >= 0 ? 'n' : 's');
    const lo = Math.abs(lng).toFixed(1) + (lng >= 0 ? 'e' : 'w');
    return `${la}-${lo}`;
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
    if (/\/(?:en\/)?hijri-calendar\/[a-z-]+-\d+$/.test(window.location.pathname)) return 'hijri-month';
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
    // slug بإحداثيات: 33.6n-7.6w
    const coordMatch = slug.match(/^(\d+\.?\d*)(n|s)-(\d+\.?\d*)(e|w)$/i);
    if (coordMatch) {
        const lat = parseFloat(coordMatch[1]) * (coordMatch[2].toLowerCase() === 's' ? -1 : 1);
        const lng = parseFloat(coordMatch[3]) * (coordMatch[4].toLowerCase() === 'w' ? -1 : 1);
        // طلبان بالتوازي: عربي + إنجليزي
        const [arData, enData] = await Promise.all([
            fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar&namedetails=1`)).then(r=>r.json()).catch(()=>null),
            fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)).then(r=>r.json()).catch(()=>null)
        ]);
        if (arData?.address) {
            const addr = arData.address;
            const enName = arData.namedetails?.['name:en']
                || enData?.address?.city || enData?.address?.town || enData?.address?.village || '';
            return { lat, lng,
                name: addr.city || addr.town || addr.village || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
                country: addr.country || '',
                countryCode: (addr.country_code || '').toLowerCase(),
                englishName: enName
            };
        }
        return { lat, lng, name: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`, country: '', countryCode: '', englishName: '' };
    }
    // slug نصي: london → slug نفسه هو الاسم الإنجليزي
    const query = slug.replace(/-/g, ' ');
    const url = nomUrl(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=ar&addressdetails=1&namedetails=1`);
    const results = await fetch(url).then(r => r.json()).catch(() => []);
    if (results.length > 0) {
        const p = results[0], addr = p.address || {};
        // الـ slug نفسه إنجليزي دائماً — أفضل مصدر للاسم الإنجليزي
        const enName = p.namedetails?.['name:en'] || query;
        return {
            lat: parseFloat(p.lat), lng: parseFloat(p.lon),
            name: addr.city || addr.town || addr.village || p.display_name.split(',')[0],
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

    // تفعيل صفحة التقويم الهجري السنوي عند URL /hijri-calendar/1447
    const _isHijriYearPage = /\/(?:en\/)?hijri-calendar\/\d{4}$/.test(window.location.pathname);
    if (_isHijriYearPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-hijri-year')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="hijri-calendar"]')?.classList.add('active');
        loadHijriYearPage();
        document.documentElement.classList.remove('hijri-year-page');
    }

    // تفعيل صفحة التقويم الهجري الشهري عند URL /hijri-calendar/shawwal-1447
    const _isHijriMonthPage = /\/(?:en\/)?hijri-calendar\/[a-z-]+-\d+$/.test(window.location.pathname);
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

    // تفعيل القسم المطلوب من URL param ?page=xxx (مثل /?page=qibla)
    const _pageParam = new URLSearchParams(window.location.search).get('page');
    if (_pageParam && !_isQiblaPage && !_isMsbahaPage && !_isHijriPage && !_isDateConverterPage && !_isZakatPage) {
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

            // التقويم الهجري → /hijri-calendar/{السنة الحالية}
            if (pageId === 'hijri-calendar' && window.location.protocol !== 'file:') {
                const _hijriYear = HijriDate.getToday().year;
                const _yearPath  = `/hijri-calendar/${_hijriYear}`;
                if (!new RegExp(`\\/(?:en\\/)?hijri-calendar\\/${_hijriYear}$`).test(window.location.pathname)) {
                    window.location.href = pageUrl(_yearPath);
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
                    window.location.href = pageUrl(`/prayer-times-in-${_slug}.html`);
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
    const isEnSugg = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';

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
    const searchLang = isEnSugg ? 'en' : 'ar';
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
            const arCityMain = nd['name:ar'] || addr.city || addr.town || addr.village || place.name || '';
            const rawEnCity  = nd['name:en'] || nd['name:en-US']
                    || (/^[a-zA-Z\s\-'.]+$/.test(place.name) ? place.name : '')
                    || addr.city || addr.town || addr.village
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
            suggestionsEl.innerHTML = `<div class="search-loading">${isEnSugg ? 'Error, check your connection' : 'حدث خطأ، تحقق من الاتصال'}</div>`;
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

    const isEn = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
    const searchLang = isEn ? 'en' : 'ar';
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
                suggestionsEl.innerHTML = `<div class="search-loading">${isEn ? 'No results found' : 'لم يُعثر على نتائج'}</div>`;
                return;
            }

            results.forEach(place => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                const addr        = place.address || {};
                const nd          = place.namedetails || {};

                // المدينة الرئيسية فقط (بدون أحياء)
                const arCityMain  = nd['name:ar'] || addr.city || addr.town || addr.village || place.name || place.display_name.split(',')[0];
                const rawEnName   = nd['name:en'] || nd['name:en-US'] || (/^[a-zA-Z\s\-'.]+$/.test(place.name) ? place.name : '') || addr.city || addr.town || addr.village || place.display_name.split(',')[0];
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
    return pageUrl(`/prayer-times-in-${slug}.html`);
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
        window.location.href = pageUrl(`/prayer-times-in-${slug}.html`);
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
}

// ========= قسم "عن المدينة" من ويكيبيديا (Point 12: محتوى فريد لكل مدينة) =========
async function loadCityAboutSection() {
    const section = document.getElementById('city-about-section');
    if (!section) return;

    // يظهر فقط في صفحات مواقيت المدينة
    const isCityPage = /\/(?:en\/)?prayer-times-in-/.test(window.location.pathname);
    if (!isCityPage) { section.style.display = 'none'; return; }

    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const isEn = (lang !== 'ar');
    const cityName = isEn ? (currentEnglishName || currentCity) : currentCity;
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

    // كاش في localStorage (7 أيام)
    const cacheKey = `wiki_city_${lang}_${cityName}`;
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

    // محاولات متعددة: الاسم الكامل، ثم الكلمة الأولى فقط (لأسماء مثل "Mecca Museum")
    const candidates = [cityName];
    const firstToken = cityName.split(/\s+/)[0];
    if (firstToken && firstToken !== cityName && firstToken.length >= 3) {
        candidates.push(firstToken);
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
            const _onHomePage  = !_hasPageParam && (
                window.location.pathname === '/' ||
                window.location.pathname === '/en/' ||
                window.location.pathname === '/en'
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
    // zoom=10 يُعيد مستوى المدينة بدلاً من مستوى الشارع/الحي
    const arReq = fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=ar&namedetails=1`)).then(r=>r.json()).catch(()=>null);
    const enReq = fetch(nomUrl(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=en`)).then(r=>r.json()).catch(()=>null);

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

            // انتقل إلى صفحة المدينة إذا طُلب ذلك (باستخدام اسم المدينة الرئيسية للـ slug)
            const navEnName = enCityMain || currentEnglishName;
            if (navigateAfter && navEnName && window.location.protocol !== 'file:') {
                navigateToCity(lat, lng, arCityMain || currentCity, currentCountry, navEnName, currentCountryCode);
                return;
            }
        }
        updateCityDisplay();
        updateCityCountryInfo();
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
        qiblaBackBtn.href = pageUrl(`/prayer-times-in-${slug}.html`);
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
    const citySlug    = makeSlug(currentEnglishName || currentCity, currentLat, currentLng);
    const countrySlug = makeCountrySlug(currentCountryCode, currentEnglishCountry);

    // ── نصوص العرض (عبر i18n مع fallback) ──
    const _t = (typeof t === 'function') ? t : (k) => k;
    const homeLabel        = _t('breadcrumb.home') || (isAr ? 'الرئيسية' : 'Home');
    const prayerTimesLabel = _t('breadcrumb.prayer_times') || (isAr ? 'مواقيت الصلاة' : 'Prayer Times');
    // العربية: أسماء عربية — غيرها: أسماء إنجليزية
    const countryLabel    = isAr
        ? (currentCountry        || currentEnglishCountry || countrySlug)
        : (currentEnglishCountry || currentCountry        || countrySlug);
    const cityLabel       = isAr
        ? (currentCity               || currentEnglishName    || currentEnglishDisplayName)
        : (currentEnglishDisplayName || currentEnglishName    || currentCity);

    // ── روابط ──
    const countryHref = `${origin}${langPrefix}${countrySlug}`;
    const cityHref    = `${origin}${langPrefix}prayer-times-in-${citySlug}`;

    // ── تحديث DOM ──
    const bcHome    = document.getElementById('bc-home');
    const bcCountry = document.getElementById('bc-country');
    const bcCity    = document.getElementById('bc-city');
    const bcCurrent = document.getElementById('bc-current');

    if (bcHome)    bcHome.textContent    = homeLabel;
    if (bcHome)    bcHome.href           = `${origin}${langPrefix}`;
    if (bcCountry) { bcCountry.textContent = countryLabel; bcCountry.href = countryHref; }
    if (bcCity)    { bcCity.textContent    = cityLabel;    bcCity.href    = cityHref;    }
    if (bcCurrent) bcCurrent.textContent  = prayerTimesLabel;

    // ── حقن / تحديث BreadcrumbList Schema ──
    _injectBreadcrumbSchema({
        origin, homeLabel, countryLabel, countryHref,
        cityLabel, cityHref, prayerTimesLabel, lang
    });
}

/** يحقن أو يُحدِّث <script id="breadcrumb-schema"> في <head> */
function _injectBreadcrumbSchema({ origin, homeLabel, countryLabel, countryHref, cityLabel, cityHref, prayerTimesLabel }) {
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
                "name": cityLabel,
                "item": cityHref
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": prayerTimesLabel
                // لا يوجد "item" — هذا هو العنصر الحالي
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
    const arReq = fetch(nomUrl(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=ar&namedetails=1`
    )).then(r => r.json()).catch(() => null);
    const enReq = fetch(nomUrl(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=en`
    )).then(r => r.json()).catch(() => null);

    Promise.all([arReq, enReq]).then(([arData, enData]) => {
        if (!arData?.address) return;
        const addr   = arData.address;
        const enAddr = enData?.address || {};

        const arCity = addr.city || addr.town || addr.village
            || (addr.state || '').replace(/^منطقة\s+|^محافظة\s+/g, '').trim() || '';
        const rawEn  = enAddr.city || enAddr.town || enAddr.village
            || (enAddr.state || '').replace(/\s*(Region|Governorate|Province)\b/gi, '').trim() || '';
        const enCity = (arData.namedetails?.['name:en']
            || arData.namedetails?.['name:en-US']
            || rawEn || '').replace(/\s*District\b/gi, '').trim();
        const countryCode = (addr.country_code || '').toLowerCase();

        if (arCity && enCity) {
            _saveAndShowSuggestion(arCity, lat, lng, enCity, addr.country || '', countryCode);
        }
    }).catch(() => {});
}

/** حفظ البيانات في localStorage وعرض الشريط */
function _saveAndShowSuggestion(arCity, lat, lng, enName, country, countryCode) {
    try {
        localStorage.setItem('lsb_detected', JSON.stringify({
            arCity, lat, lng, enName, country, countryCode, ts: Date.now()
        }));
    } catch (e) {}
    _renderLocationBar(arCity, lat, lng, enName);
}

/** رسم شريط الاقتراح في DOM */
function _renderLocationBar(arCity, lat, lng, enName) {
    const bar  = document.getElementById('location-suggestion-bar');
    const city = document.getElementById('lsb-city-name');
    const btn  = document.getElementById('lsb-go-btn');
    if (!bar || !city || !btn) return;

    city.textContent = arCity;
    const slug = makeSlug(enName, lat, lng);
    btn.href = pageUrl(`/prayer-times-in-${slug}.html`);

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
    const onHome = path === '/' || path === '/en/' || path === '/en' || path === '';
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
            { "@type": "SiteNavigationElement", "name": "القمر اليوم",         "url": `${origin}/moon`                          },
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
    const onHome = path === '/' || /^\/(?:en|fr|tr|ur)\/?$/.test(path) || path === '';
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
// يدعم 5 لغات: ar (افتراضي بدون prefix)، en، fr، tr، ur
function _seoGetBilingualUrls() {
    const origin = window.SITE_URL || window.location.origin;
    let path = window.location.pathname.replace(/\.html$/, '');
    if (path === '') path = '/';
    const LANGS = ['en', 'fr', 'tr', 'ur'];
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
        tr: 'Namaz Vakitleri', ur: 'اوقاتِ نماز'
    };
    const OG_LOCALES = {
        ar: 'ar_SA', en: 'en_US', fr: 'fr_FR', tr: 'tr_TR', ur: 'ur_PK'
    };
    const siteName = SITE_NAMES[lang] || SITE_NAMES.ar;

    if (title) document.title = title;

    if (description) {
        _seoUpsertMeta('description', 'name', description);
    }

    // Robots: افتراضياً index, follow (يمكن رفضه لاحقاً لصفحات معيّنة)
    _seoUpsertMeta('robots', 'name', 'index, follow');

    // Canonical + hreflang (5 لغات + x-default)
    _seoUpsertLink('canonical', urls.canonical);
    _seoUpsertLink('alternate', urls.ar, 'ar');
    _seoUpsertLink('alternate', urls.en, 'en');
    _seoUpsertLink('alternate', urls.fr, 'fr');
    _seoUpsertLink('alternate', urls.tr, 'tr');
    _seoUpsertLink('alternate', urls.ur, 'ur');
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

    // ── الصفحة الرئيسية (5 لغات: ar, en, fr, tr, ur) ──
    const HOME_PATHS = {
        '/': 'ar',
        '/en/': 'en', '/en': 'en',
        '/fr/': 'fr', '/fr': 'fr',
        '/tr/': 'tr', '/tr': 'tr',
        '/ur/': 'ur', '/ur': 'ur',
    };
    const homeLang = HOME_PATHS[path];
    if (homeLang) {
        // محاذاة نصوص SSR بالضبط (buildSeoForPath في server.js) — يشمل أسماء الصلوات الـ5
        const HOME_TITLES = {
            ar: 'مواقيت الصلاة والتاريخ الهجري | القبلة، الأدعية، الزكاة',
            en: 'Prayer Times & Hijri Calendar — Qibla, Duas, Zakat',
            fr: 'Heures de Prière & Calendrier Hégirien — Qibla, Douas, Zakat',
            tr: 'Namaz Vakitleri ve Hicri Takvim — Kıble, Dualar, Zekat',
            ur: 'اوقاتِ نماز اور ہجری کیلنڈر — قبلہ، دعائیں، زکوٰۃ',
        };
        const HOME_DESCS = {
            ar: 'مواقيت الصلاة اليوم في مدن العالم: الفجر، الظهر، العصر، المغرب، العشاء. التقويم الهجري، تحويل التاريخ، اتجاه القبلة، الأدعية وحاسبة الزكاة في تطبيق واحد.',
            en: 'Accurate daily prayer times today in cities worldwide: Fajr, Dhuhr, Asr, Maghrib, Isha. Hijri calendar, date converter, Qibla direction, Zakat calculator, duas in one place.',
            fr: "Heures de prière aujourd'hui dans les villes du monde : Fajr, Dhuhr, Asr, Maghrib, Isha. Calendrier hégirien, convertisseur de date, Qibla, Zakat, douas en un seul endroit.",
            tr: 'Bugün dünya şehirleri için namaz vakitleri: Fecir, Öğle, İkindi, Akşam, Yatsı. Hicri takvim, tarih dönüştürücü, kıble yönü, zekât hesaplayıcı ve dualar tek uygulamada.',
            ur: 'آج دنیا کے شہروں میں اوقاتِ نماز: فجر، ظہر، عصر، مغرب، عشاء۔ ہجری کیلنڈر، تاریخ کنورٹر، قبلہ کی سمت، زکاۃ کیلکولیٹر اور دعائیں — ایک ایپ میں۔',
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
            const monthsEn = ['Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",'Jumada al-Ula','Jumada al-Akhira','Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhu al-Qi'dah",'Dhu al-Hijjah'];
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
    const isEn = urls.isEn;
    const lang = isEn ? 'en' : 'ar';
    const cityDisplay = isEn ? (englishName || city) : city;
    const countrySuffix = country ? (isEn ? ', ' + country : '، ' + country) : '';

    // مساعد: يبني title مع/بدون اسم الدولة بحيث لا يتجاوز 60 حرفاً
    const buildTitle = (prefix) => {
        const full = `${prefix} ${cityDisplay}${countrySuffix}`;
        return full.length > 60 ? `${prefix} ${cityDisplay}` : full;
    };

    // prayer-times-in-*
    if (/\/prayer-times-in-/.test(path)) {
        setSEOMeta({
            title: isEn
                ? buildTitle('Prayer Times in')
                : buildTitle('مواقيت الصلاة في'),
            description: isEn
                ? `Accurate Islamic prayer times for ${cityDisplay}${countrySuffix}: Fajr, Dhuhr, Asr, Maghrib, Isha, Qibla direction, today's Hijri date and weekly schedule.`
                : `مواقيت الصلاة الدقيقة في ${cityDisplay}${countrySuffix}: الفجر، الظهر، العصر، المغرب، العشاء، اتجاه القبلة، التاريخ الهجري والجدول الأسبوعي.`,
            ogType: 'article'
        });
        return;
    }

    // qibla-in-*
    if (/\/qibla-in-/.test(path)) {
        setSEOMeta({
            title: isEn
                ? buildTitle('Qibla Direction in')
                : buildTitle('اتجاه القبلة في'),
            description: isEn
                ? `Accurate Qibla direction from ${cityDisplay}${countrySuffix} to the Kaaba in Mecca, with exact bearing, compass and map view.`
                : `اتجاه القبلة الدقيق من ${cityDisplay}${countrySuffix} إلى الكعبة المشرفة في مكة، مع درجة الانحراف وبوصلة وخريطة تفاعلية.`,
            ogType: 'article',
            schemaId: 'page-seo-schema',
            schemaGraph: {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "@id": urls.canonical + '#webpage',
                "url": urls.canonical,
                "name": isEn ? `Qibla Direction in ${cityDisplay}` : `اتجاه القبلة في ${cityDisplay}`,
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
        setSEOMeta({
            title: isEn
                ? buildTitle('About')
                : buildTitle('عن'),
            description: isEn
                ? `Information about ${cityDisplay}${countrySuffix}: geographic location, timezone, Islamic prayer times, Qibla direction and key facts.`
                : `معلومات عن ${cityDisplay}${countrySuffix}: الموقع الجغرافي، المنطقة الزمنية، مواقيت الصلاة، اتجاه القبلة وحقائق مهمة.`,
            ogType: 'article'
        });
        return;
    }
}

function checkSavedLocationSuggestion() {
    const path = window.location.pathname;
    const onHome = path === '/' || path === '/en/' || path === '/en';
    if (!onHome || window.location.protocol === 'file:') return;

    try {
        const raw = localStorage.getItem('lsb_detected');
        if (!raw) return;
        const d = JSON.parse(raw);
        if (Date.now() - d.ts > 7 * 24 * 3600 * 1000) return; // انتهت الصلاحية

        const dismissedTs = parseInt(localStorage.getItem('lsb_dismissed_ts') || '0');
        if (Date.now() - dismissedTs < 3600 * 1000) return; // رفض مؤخراً

        _renderLocationBar(d.arCity, d.lat, d.lng, d.enName);
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

/** فتح Modal إعدادات المواقيت */
function openSettingsModal() {
    const overlay = document.getElementById('settings-modal-overlay');
    if (overlay) {
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

/** إغلاق عند الضغط خارج الـ box */
function onSettingsOverlayClick(event) {
    if (event.target === document.getElementById('settings-modal-overlay')) {
        closeSettingsModal();
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
    const prefix = lang === 'ar' ? '' : '/' + lang;
    const slug   = (currentLat && currentEnglishName)
        ? makeSlug(currentEnglishName, currentLat, currentLng) : '';
    const cityLabel = getDisplayCity();
    const isEn  = lang !== 'ar';

    const services = [
        {
            icon: '🧭',
            label: isEn ? `Qibla in ${cityLabel}` : `اتجاه القبلة في ${cityLabel}`,
            url: slug ? pageUrl(`/qibla-in-${slug}.html`) : pageUrl('/qibla')
        },
        {
            icon: '📅',
            label: isEn ? 'Hijri Date Today' : 'التاريخ الهجري اليوم',
            url: pageUrl(`${prefix}/today-hijri-date`)
        },
        {
            icon: '🔄',
            label: isEn ? 'Date Converter' : 'تحويل التاريخ',
            url: pageUrl(`${prefix}/dateconverter`)
        },
        {
            icon: '🗓️',
            label: isEn ? 'Hijri Calendar' : 'التقويم الهجري',
            url: pageUrl(`${prefix}/hijri-calendar/${HijriDate.getToday().year}`)
        },
        {
            icon: '🌙',
            label: isEn ? 'Moon Today' : 'القمر اليوم',
            url: pageUrl('/moon')
        },
        {
            icon: '💰',
            label: isEn ? 'Zakat Calculator' : 'حاسبة الزكاة',
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
        if (singlePicker) singlePicker.style.display = 'none';
        if (rangePicker)  rangePicker.style.display  = '';
        populateRangeSelects();
        onRangeDateChange();
    } else {
        if (singlePicker) singlePicker.style.display = '';
        if (rangePicker)  rangePicker.style.display  = 'none';
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
            errorEl.style.display = '';
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
            errorEl.style.display = '';
            errorEl.textContent   = 'لا يمكن اختيار نطاق يتجاوز 365 يوماً';
        }
        return;
    }

    if (errorEl) errorEl.style.display = 'none';

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

    if (totalPages <= 1) { paginationEl.style.display = 'none'; return; }
    paginationEl.style.display = '';

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
    if (el) el.style.display = 'none';
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
        const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const _cityNm = (lang !== 'ar') ? (currentEnglishName || currentCity) : currentCity;
        titleEl.textContent = t('schedule.title_with_range', {
            city: _cityNm,
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
        tr.innerHTML = `
            <td>
                <div class="sched-day">${dayName}</div>
                <div class="sched-greg">${greg}</div>
                <div class="sched-hijri">${hijriStr}</div>
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
        const _cityName = (langRC !== 'ar') ? (city.nameEn || city.nameAr) : city.nameAr;
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

    const prayers = [
        { name: t('prayer.fajr'),    time: currentPrayerTimes.fajr    },
        { name: t('prayer.sunrise'), time: currentPrayerTimes.sunrise  },
        { name: t('prayer.dhuhr'),   time: currentPrayerTimes.dhuhr   },
        { name: t('prayer.asr'),     time: currentPrayerTimes.asr     },
        { name: t('prayer.maghrib'), time: currentPrayerTimes.maghrib },
        { name: t('prayer.isha'),    time: currentPrayerTimes.isha    },
    ];
    const listEl = document.getElementById('faq-times-list');
    listEl.innerHTML = prayers.map(p =>
        `<li><span>${p.name}</span><span>${p.time}</span></li>`
    ).join('');

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
        countryLinkEl.href = pageUrl(`/${makeCountrySlug(currentCountryCode, currentEnglishCountry)}`);
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
        document.getElementById('current-time').textContent = `${pad(h12)}:${pad(mm)}:${pad(ss)} ${period}`;

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
        countryLinkEl.href = pageUrl(`/${makeCountrySlug(cc, currentEnglishCountry)}`);
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
        const placeLabel = isArNearby
            ? place.nameAr
            : (place.nameEn || place.nameAr);
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
    const _distLocale = _ln === 'ar' ? 'ar' : (_ln === 'ur' ? 'ur' : (_ln === 'fr' ? 'fr' : (_ln === 'tr' ? 'tr' : 'en')));
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
function updateMoonInfo() {
    const today = new Date();
    const phase = MoonCalc.getPhaseName(today);
    const illumination = MoonCalc.getMoonIllumination(today);
    const age = MoonCalc.getMoonAge(today);
    const moonTimes = MoonCalc.getMoonTimes(today, currentLat, currentLng);
    const nextFull = MoonCalc.getNextFullMoon(today);
    const nextNew = MoonCalc.getNextNewMoon(today);

    document.getElementById('moon-icon').textContent = phase.icon;
    document.getElementById('moon-phase-name').textContent = (phase.key && typeof t === 'function') ? t(phase.key) : phase.name;
    const _illumLabel = (typeof t === 'function') ? t('moon.illumination_label') : 'الإضاءة';
    const _daysSfx = (typeof t === 'function') ? t('moon.days_suffix') : 'يوم';
    document.getElementById('moon-illumination').textContent = `${_illumLabel}: ${illumination}%`;
    document.getElementById('moon-age').textContent = age + ' ' + _daysSfx;
    document.getElementById('moon-illumination-pct').textContent = illumination + '%';
    document.getElementById('moon-rise').textContent = moonTimes.rise;
    document.getElementById('moon-set').textContent = moonTimes.set;

    if (nextFull) {
        const months = HijriDate.gregorianMonths;
        document.getElementById('next-full-moon').textContent =
            `${nextFull.getDate()} ${months[nextFull.getMonth()]}`;
    }
    if (nextNew) {
        const months = HijriDate.gregorianMonths;
        document.getElementById('next-new-moon').textContent =
            `${nextNew.getDate()} ${months[nextNew.getMonth()]}`;
    }
}

// ========= التاريخ الهجري اليوم =========
function updateHijriToday() {
    const now      = new Date();
    const hijri    = HijriDate.getToday();
    const lang     = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const prefix   = lang === 'ar' ? '' : '/' + lang;
    const hSfx     = lang !== 'ar' ? ' AH' : ' هـ';
    const gSfx     = lang !== 'ar' ? ' م' : ' م';
    const gMonthsAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const gMonthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const gMonths   = lang !== 'ar' ? gMonthsEn : gMonthsAr;
    const dayNamesAr = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const dayNamesEn = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dow       = now.getDay();
    const dayNameAr = dayNamesAr[dow];
    const dayNameEn = dayNamesEn[dow];
    const dayName   = lang !== 'ar' ? dayNameEn : dayNameAr;
    const monthIdx  = hijri.month - 1;
    const monthName = HijriDate.hijriMonths[monthIdx];
    const monthNameEn = HIJRI_MONTHS_EN[monthIdx];
    const monthSlug = HIJRI_MONTH_SLUGS[monthIdx];
    const totalDays = HijriDate.getDaysInHijriMonth(hijri.year, hijri.month);
    const isLeap    = HijriDate.isHijriLeapYear(hijri.year);
    const country   = getDisplayCountry();
    const gregToday = `${now.getDate()} ${gMonths[now.getMonth()]} ${now.getFullYear()}`;

    // ── 0. Breadcrumb ─────────────────────────────────────────────
    const htBcEl = document.getElementById('htoday-breadcrumbs');
    if (htBcEl) {
        const yearUrl   = `${prefix}/hijri-calendar/${hijri.year}`;
        const monthUrl0 = hijriMonthUrl(hijri.year, hijri.month);
        const homeUrl   = (lang === 'ar') ? '/' : (prefix + '/');
        const calUrl    = `${prefix}/hijri-calendar/${hijri.year}`;
        const isAr      = (lang === 'ar');
        const _t        = (typeof t === 'function') ? t : (k) => k;
        const homeL     = _t('breadcrumb.home') || (isAr ? 'الرئيسية' : 'Home');
        const calL      = isAr ? 'التقويم الهجري' : 'Hijri Calendar';
        const yearL     = isAr ? `${hijri.year} هـ` : `${hijri.year} AH`;
        const monthL    = isAr ? `${monthName} ${hijri.year} هـ` : `${monthNameEn} ${hijri.year} AH`;
        const dayL      = isAr ? `${hijri.day} ${monthName} ${hijri.year} هـ` : `${hijri.day} ${monthNameEn} ${hijri.year} AH`;
        htBcEl.innerHTML = _buildHijriBreadcrumbOl([
            { href: homeUrl, text: homeL },
            { href: calUrl,  text: calL  },
            { href: yearUrl, text: yearL },
            { href: monthUrl0, text: monthL },
            { text: dayL, current: true }
        ]);
    }

    // ── 1. Hero ──────────────────────────────────────────────────
    const fullEl = document.getElementById('hijri-today-full');
    if (fullEl) fullEl.textContent = lang !== 'ar'
        ? `Today's Hijri Date: ${dayNameEn}, ${hijri.day} ${monthNameEn} ${hijri.year} AH`
        : `التاريخ الهجري اليوم: ${dayNameAr} ${hijri.day} ${monthName} ${hijri.year} هـ`;

    const gregEl = document.getElementById('hijri-today-greg');
    if (gregEl) gregEl.textContent = lang !== 'ar'
        ? `Corresponding to: ${dayNameEn} ${gregToday} CE – Umm al-Qura Calendar`
        : `الموافق: ${dayNameAr} ${gregToday} م – حسب تقويم أم القرى`;

    const descEl = document.getElementById('hijri-today-desc');
    if (descEl) {
        const cvPath = `${prefix}/dateconverter`;
        descEl.innerHTML = lang !== 'ar'
            ? `Know today's Hijri date accurately in ${country} according to the Umm al-Qura calendar, with the ability to <a href="${cvPath}" style="color:var(--primary);text-decoration:underline;">convert dates between Hijri and Gregorian</a> easily.`
            : `اعرف التاريخ الهجري اليوم بدقة في ${country} حسب تقويم أم القرى، مع إمكانية <a href="${cvPath}" style="color:var(--primary);text-decoration:underline;">تحويل التاريخ بين الهجري والميلادي</a> بسهولة.`;
    }

    // ── 2. Quick Info Cards ───────────────────────────────────────
    const infoGrid = document.getElementById('hijri-today-info-grid');
    if (infoGrid) {
        const leapLabel = isLeap
            ? (lang !== 'ar' ? 'Yes (355 days)' : 'نعم (355 يوماً)')
            : (lang !== 'ar' ? 'No (354 days)'  : 'لا (354 يوماً)');
        const cards = lang !== 'ar' ? [
            ['📅', 'Day',            dayNameEn],
            ['🗓', 'Hijri Date',     `${hijri.day} ${monthNameEn} ${hijri.year} AH`],
            ['📆', 'Gregorian Date', `${gregToday} CE`],
            ['🌙', 'Month',          monthNameEn],
            ['✔️', 'Year',           `${hijri.year} AH`],
            ['✅', 'Leap Year',      leapLabel],
        ] : [
            ['📅', 'اليوم',            dayNameAr],
            ['🗓', 'التاريخ الهجري',   `${hijri.day} ${monthName} ${hijri.year} هـ`],
            ['📆', 'التاريخ الميلادي', `${gregToday} م`],
            ['🌙', 'الشهر',            monthName],
            ['✔️', 'السنة',            `${hijri.year} هـ`],
            ['✅', 'سنة كبيسة',        leapLabel],
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
        const ctas = lang !== 'ar' ? [
            [`${prefix}/dateconverter`, '🔥 Convert Hijri ↔ Gregorian', true],
            [todayUrl,                  `📅 ${dayNameEn} ${hijri.day} ${monthNameEn} ${hijri.year} AH`, false],
            [monthUrl,                  `🌙 ${monthNameEn} ${hijri.year} AH Calendar`, false],
            [yearUrl,                   `📆 Full ${hijri.year} AH Calendar`, false],
        ] : [
            [`${prefix}/dateconverter`, '🔥 تحويل التاريخ هجري ميلادي', true],
            [todayUrl,                  `📅 ${dayNameAr} ${hijri.day} ${monthName} ${hijri.year} هـ`, false],
            [monthUrl,                  `🌙 التقويم الهجري لشهر ${monthName} ${hijri.year}`, false],
            [yearUrl,                   `📆 التقويم الهجري ${hijri.year} هـ كامل`, false],
        ];
        ctaEl.innerHTML = ctas.map(([href, text, primary]) =>
            `<a href="${href}" style="display:inline-block;padding:10px 20px;background:${primary ? 'var(--primary)' : 'var(--bg)'};color:${primary ? '#fff' : 'var(--primary)'};border-radius:8px;text-decoration:none;font-size:0.9rem;font-weight:${primary ? '700' : '500'};border:1px solid var(--border);">${text}</a>`
        ).join('');
    }

    // ── 4. FAQ ────────────────────────────────────────────────────
    const faqTitleEl = document.getElementById('hijri-today-faq-title');
    if (faqTitleEl) faqTitleEl.textContent = lang !== 'ar' ? '❓ Frequently Asked Questions' : '❓ أسئلة شائعة';

    const faqEl = document.getElementById('hijri-today-faq');
    if (faqEl) {
        const leapAns = isLeap
            ? (lang !== 'ar' ? `Yes, ${hijri.year} AH is a leap year with 355 days.` : `نعم، ${hijri.year} هـ سنة كبيسة وعدد أيامها 355 يوماً.`)
            : (lang !== 'ar' ? `No, ${hijri.year} AH is a regular year with 354 days.` : `لا، ${hijri.year} هـ سنة بسيطة وعدد أيامها 354 يوماً.`);
        const faqs = lang !== 'ar' ? [
            ["What is today's Hijri date?",          `${dayNameEn}, ${hijri.day} ${monthNameEn} ${hijri.year} AH`],
            ["What is today's Hijri date in Gregorian?", `${gregToday} CE`],
            [`Is ${hijri.year} AH a leap year?`,     leapAns],
        ] : [
            ['ما هو التاريخ الهجري اليوم؟',          `${dayNameAr} ${hijri.day} ${monthName} ${hijri.year} هـ`],
            ['ماذا يوافق اليوم هجريًا بالميلادي؟',   `${gregToday} م`],
            [`هل سنة ${hijri.year} هـ كبيسة؟`,       leapAns],
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
    if (otdTitleEl) otdTitleEl.textContent = lang !== 'ar'
        ? `📖 Notable Events on This Day in Islamic History`
        : `📖 أبرز أحداث هذا اليوم في التاريخ الهجري`;

    const subtitleEl = document.getElementById('wiki-otd-subtitle');
    if (subtitleEl) subtitleEl.textContent = lang !== 'ar'
        ? `On this day, ${dayNameEn} ${hijri.day} ${monthNameEn} ${hijri.year} AH, many important events occurred in Islamic history.`
        : `في مثل هذا اليوم، ${dayNameAr} ${hijri.day} ${monthName} ${hijri.year} هـ، وقعت العديد من الأحداث المهمة في التاريخ الإسلامي.`;

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
        const prevMN = lang !== 'ar' ? HIJRI_MONTHS_EN[prevM-1] : HijriDate.hijriMonths[prevM-1];
        const nextMN = lang !== 'ar' ? HIJRI_MONTHS_EN[nextM-1] : HijriDate.hijriMonths[nextM-1];
        const prevLabel = lang !== 'ar' ? 'Previous Day' : 'اليوم السابق';
        const nextLabel = lang !== 'ar' ? 'Next Day'     : 'اليوم التالي';
        navEl.innerHTML = `
            <a href="${hijriDayUrl(prevY, prevM, prevD)}" style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text-light);">← ${prevLabel}</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${prevD} ${prevMN} ${prevY}${hSfx}</span>
            </a>
            <a href="${hijriDayUrl(nextY, nextM, nextD)}" style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text-light);">${nextLabel} →</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${nextD} ${nextMN} ${nextY}${hSfx}</span>
            </a>`;
    }

    // ── 7. Mini Calendar (3 rows: yesterday, today, tomorrow) ─────
    const miniTitleEl = document.getElementById('hijri-today-mini-title');
    if (miniTitleEl) miniTitleEl.textContent = lang !== 'ar' ? '📅 Quick Navigation' : '📅 التنقل السريع';

    const thHijri = document.getElementById('hijri-today-th-hijri');
    const thGreg  = document.getElementById('hijri-today-th-greg');
    if (thHijri) thHijri.textContent = lang !== 'ar' ? 'Hijri Date' : 'التاريخ الهجري';
    if (thGreg)  thGreg.textContent  = lang !== 'ar' ? 'Gregorian Date' : 'التاريخ الميلادي';

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
            const mN   = lang !== 'ar' ? HIJRI_MONTHS_EN[m-1] : HijriDate.hijriMonths[m-1];
            const gMN  = lang !== 'ar' ? gMonthsEn[g.month-1] : gMonthsAr[g.month-1];
            const dowG = new Date(g.year, g.month-1, g.day).getDay();
            const dNAr = dayNamesAr[dowG];
            const dNEn = dayNamesEn[dowG];
            const dN   = lang !== 'ar' ? dNEn : dNAr;
            const dayUrl = hijriDayUrl(y, m, d);
            const rowBg  = isT ? 'background:var(--primary-light);' : '';
            const lnkClr = isT ? 'color:#fff;font-weight:700;text-decoration:none;' : 'color:var(--primary);text-decoration:none;';
            const txtClr = isT ? 'color:#fff;' : '';
            rows.push(`<tr style="${rowBg}">
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;${txtClr}">
                    <a href="${dayUrl}" style="${lnkClr}">${d} ${mN} ${y}${hSfx} (${dN})</a>
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
    if (extraTitleEl) extraTitleEl.textContent = lang !== 'ar' ? '🌙 More Resources' : '🌙 روابط إضافية';

    const extraEl = document.getElementById('hijri-today-extra-links');
    if (extraEl) {
        const monthUrl = hijriMonthUrl(hijri.year, hijri.month);
        const yearUrl2 = `${prefix}/hijri-calendar/${hijri.year}`;
        const extras = lang !== 'ar' ? [
            [monthUrl,                  `🌙 ${monthNameEn} ${hijri.year} AH Calendar`],
            [yearUrl2,                  `📆 ${hijri.year} AH Full Calendar`],
            [`${prefix}/dateconverter`, '🔄 Date Converter'],
        ] : [
            [monthUrl,                  `🌙 التقويم الهجري لشهر ${monthName}`],
            [yearUrl2,                  `📆 التقويم الهجري ${hijri.year} هـ كامل`],
            [`${prefix}/dateconverter`, '🔄 تحويل التاريخ'],
        ];
        extraEl.innerHTML = extras.map(([href, text]) =>
            `<a href="${href}" style="display:inline-block;padding:9px 18px;background:var(--bg);color:var(--primary);border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid var(--border);">${text}</a>`
        ).join('');
    }

    // ── 9. Footer SEO ─────────────────────────────────────────────
    const footerEl = document.getElementById('hijri-today-footer-seo');
    if (footerEl) footerEl.textContent = lang !== 'ar'
        ? `The Hijri calendar is based on the lunar cycle and is used to determine Islamic occasions such as Ramadan and Hajj. This site displays today's Hijri date accurately according to the Umm al-Qura calendar in ${country}. You can also use the date converter tool to convert between Hijri and Gregorian, or browse the full Hijri calendar.`
        : `يعتمد التقويم الهجري على دورة القمر، ويستخدم في تحديد المناسبات الإسلامية مثل رمضان والحج. يعرض هذا الموقع التاريخ الهجري اليوم بدقة حسب تقويم أم القرى في ${country}. يمكنك أيضاً استخدام أداة تحويل التاريخ بين الهجري والميلادي، أو تصفح التقويم الهجري الكامل، أو معرفة التاريخ الهجري اليوم.`;
}

// ========= صفحة اليوم الهجري الفردي =========
function loadHijriDayPage() {
    const match = window.location.pathname.match(/\/(?:en\/)?hijri-date\/(\d+)-([a-z-]+)-(\d+)$/);
    if (!match) return;

    const day      = parseInt(match[1]);
    const monthSlug = match[2];
    const year     = parseInt(match[3]);
    const monthIdx = HIJRI_MONTH_SLUGS.indexOf(monthSlug);
    if (monthIdx === -1 || day < 1 || day > 30) return;
    const month    = monthIdx + 1;

    const lang       = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const monthName  = HijriDate.hijriMonths[monthIdx];   // يتغير مع اللغة
    const monthNameEn = HIJRI_MONTHS_EN[monthIdx];
    const hSfx       = lang !== 'ar' ? ' AH' : ' هـ';
    const gSfx       = lang !== 'ar' ? ' CE' : ' م';
    const gMonths    = lang !== 'ar' ? G_MONTHS_EN : G_MONTHS_AR;

    // احسب التاريخ الميلادي وأيام الأسبوع
    const greg       = HijriDate.toGregorian(year, month, day);
    const gregDate   = new Date(greg.year, greg.month - 1, greg.day);
    const dow        = gregDate.getDay();
    const dayNameAr  = HijriDate.dayNames[dow];
    const dayNameEn  = DAY_NAMES_EN[dow];
    const dayName    = lang !== 'ar' ? dayNameEn : dayNameAr;

    const totalDays  = HijriDate.getDaysInHijriMonth(year, month);
    const isLeap     = HijriDate.isHijriLeapYear(year);
    const countryLabel = lang !== 'ar' ? getDisplayCountry() : (currentCountry || currentCity || '');
    const prefix     = lang === 'ar' ? '' : '/' + lang;

    // 1. Breadcrumbs
    const bcEl = document.getElementById('hday-breadcrumbs');
    if (bcEl) {
        const calPath   = `${prefix}/hijri-calendar/${year}`;
        const yearPath  = `${prefix}/hijri-calendar/${year}`;
        const monthPath = hijriMonthUrl(year, month);
        const homeUrl   = (lang === 'ar') ? '/' : (prefix + '/');
        const isAr      = (lang === 'ar');
        const _t        = (typeof t === 'function') ? t : (k) => k;
        const homeL     = _t('breadcrumb.home') || (isAr ? 'الرئيسية' : 'Home');
        const calL      = isAr ? 'التقويم الهجري' : 'Hijri Calendar';
        const yearL     = isAr ? `${year} هـ` : `${year} AH`;
        const monthL    = isAr ? `${monthName} ${year} هـ` : `${monthNameEn} ${year} AH`;
        const dayL      = isAr ? `${day} ${monthName} ${year} هـ` : `${day} ${monthNameEn} ${year} AH`;
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
    if (lang !== 'ar') {
        if (titleEl)    titleEl.textContent    = `Hijri Date: ${dayNameEn}, ${day} ${monthNameEn} ${year} AH`;
        if (subtitleEl) subtitleEl.textContent = `Corresponding to: ${dayNameEn}, ${greg.day} ${gMonths[greg.month-1]} ${greg.year} CE – according to the Umm al-Qura calendar`;
    } else {
        if (titleEl)    titleEl.textContent    = `التاريخ الهجري اليوم: ${dayNameAr} ${day} ${monthName} ${year} هـ`;
        if (subtitleEl) subtitleEl.textContent = `الموافق: ${dayNameAr} ${greg.day} ${gMonths[greg.month-1]} ${greg.year} م – حسب تقويم أم القرى`;
    }

    // 3. SEO Intro
    const introEl = document.getElementById('hday-intro');
    if (introEl) {
        introEl.textContent = lang !== 'ar'
            ? `This page shows the Hijri date ${day} ${monthNameEn} ${year} AH with the corresponding Gregorian date, historical events of this day, and the ability to easily convert dates.`
            : `يعرض هذا اليوم التاريخ الهجري الموافق ${day} ${monthName} ${year} هـ مع التاريخ الميلادي المقابل حسب تقويم أم القرى في ${getDisplayCountry()}، بالإضافة إلى معلومات اليوم والأحداث التاريخية.`;
    }

    // 4. Info Cards
    const gridEl = document.getElementById('hday-info-grid');
    if (gridEl) {
        const leapText = isLeap ? (lang !== 'ar' ? 'Yes ✓' : 'نعم ✓') : (lang !== 'ar' ? 'No ✗' : 'لا ✗');
        const cards = lang !== 'ar' ? [
            ['📅 Day', dayNameEn],
            ['🗓 Hijri Date', `${day} ${monthNameEn} ${year} AH`],
            ['📆 Gregorian Date', `${greg.day} ${gMonths[greg.month-1]} ${greg.year} CE`],
            ['🌙 Month', monthNameEn],
            ['📊 Days in Month', `${totalDays} days`],
            ['✔️ Leap Year', leapText],
        ] : [
            ['📅 اليوم', dayNameAr],
            ['🗓 التاريخ الهجري', `${day} ${monthName} ${year} هـ`],
            ['📆 التاريخ الميلادي', `${greg.day} ${gMonths[greg.month-1]} ${greg.year} م`],
            ['🌙 الشهر', monthName],
            ['📊 عدد أيام الشهر', `${totalDays} يوم`],
            ['✔️ السنة', isLeap ? 'كبيسة' : 'بسيطة'],
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
        const links = lang !== 'ar' ? [
            [converterPath, '🔄 Convert Hijri ↔ Gregorian'],
            [hijriMonthUrl(year, month), `📅 Hijri Calendar: ${monthNameEn} ${year} AH`],
            [todayPath2, "📌 Today's Hijri Date"],
        ] : [
            [converterPath, '🔄 تحويل التاريخ هجري ميلادي'],
            [hijriMonthUrl(year, month), `📅 التقويم الهجري لشهر ${monthName} ${year}`],
            [todayPath2, '📌 التاريخ الهجري اليوم'],
        ];
        linksEl.innerHTML = links.map(([href, text]) =>
            `<a href="${href}" style="display:inline-block;padding:9px 18px;background:var(--primary);color:#fff;border-radius:8px;text-decoration:none;font-size:0.9rem;">${text}</a>`
        ).join('');
    }

    // 6. FAQ
    const faqEl = document.getElementById('hday-faq');
    if (faqEl) {
        const _todayH   = HijriDate.getToday();
        const _todayMN  = lang !== 'ar' ? HIJRI_MONTHS_EN[_todayH.month - 1] : HijriDate.hijriMonths[_todayH.month - 1];
        const _todaySfx = lang !== 'ar' ? ' AH' : ' هـ';
        const _country  = getDisplayCountry();
        const faqs = lang !== 'ar' ? [
            [`What is the Hijri date for this day?`, `${day} ${monthNameEn} ${year} AH`],
            [`What Gregorian date corresponds to ${day} ${monthNameEn} ${year} AH?`, `${greg.day} ${gMonths[greg.month-1]} ${greg.year} CE`],
            [`Is ${year} AH a leap year?`, isLeap ? `Yes, ${year} AH is a leap year (355 days).` : `No, ${year} AH is a regular year (354 days).`],
            [`What does ${day} ${monthNameEn} ${year} AH correspond to in Gregorian in ${_country}?`, `${greg.day} ${gMonths[greg.month-1]} ${greg.year} CE`],
            [`What is today's Hijri date in ${_country}?`, `${_todayH.day} ${_todayMN} ${_todayH.year}${_todaySfx}`],
        ] : [
            [`ما هو التاريخ الهجري لهذا اليوم؟`, `${day} ${monthName} ${year} هـ`],
            [`ماذا يوافق ${day} ${monthName} ${year} ميلادي؟`, `${greg.day} ${gMonths[greg.month-1]} ${greg.year} م`],
            [`هل سنة ${year} هـ سنة كبيسة؟`, isLeap ? `نعم، سنة ${year} هـ سنة كبيسة (355 يوماً).` : `لا، سنة ${year} هـ سنة بسيطة (354 يوماً).`],
            [`كم يوافق ${day} ${monthName} ${year} هـ بالميلادي في ${_country}؟`, `${greg.day} ${gMonths[greg.month-1]} ${greg.year} م`],
            [`ما هو التاريخ الهجري اليوم في ${_country}؟`, `${_todayH.day} ${_todayMN} ${_todayH.year}${_todaySfx}`],
        ];
        faqEl.innerHTML = faqs.map(([q, a]) =>
            `<div style="margin-bottom:14px;padding:14px 18px;background:var(--bg);border-radius:10px;border-right:4px solid var(--primary);">
                <div style="font-weight:700;color:var(--primary);margin-bottom:6px;">${q}</div>
                <div style="color:var(--text);font-size:0.95rem;">${a}</div>
            </div>`
        ).join('');
    }

    // 7. OTD Subtitle + Load
    const otdSubEl = document.getElementById('hday-otd-subtitle');
    if (otdSubEl) {
        otdSubEl.textContent = lang !== 'ar'
            ? `On this day, ${dayNameEn} ${day} ${monthNameEn} ${year} AH, many important events occurred in Islamic history.`
            : `في مثل هذا اليوم، ${dayNameAr} ${day} ${monthName} ${year} هـ، وقعت العديد من الأحداث المهمة في التاريخ الإسلامي.`;
    }
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
            const mName = HijriDate.hijriMonths[m - 1];
            const url   = hijriDayUrl(y, m, d);
            const style = cur ? 'background:var(--primary-light);color:#fff;font-weight:700;' : (d % 2 === 0 ? 'background:var(--bg);' : '');
            const hCell = cur ? `${d} ${mName} ${y}${hSfx}` : `<a href="${url}" style="color:var(--primary);text-decoration:none;">${d} ${mName} ${y}${hSfx}</a>`;
            const gCell = cur ? `${g.day} ${gMonths[g.month-1]} ${g.year}${gSfx}` : `<a href="${url}" style="color:var(--primary);text-decoration:none;">${g.day} ${gMonths[g.month-1]} ${g.year}${gSfx}</a>`;
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

        const prevName = HijriDate.hijriMonths[prevM2 - 1];
        const nextName = HijriDate.hijriMonths[nextM2 - 1];
        const prevUrl  = hijriDayUrl(prevY2, prevM2, prevD2);
        const nextUrl  = hijriDayUrl(nextY2, nextM2, nextD2);
        const prevLabel = lang !== 'ar' ? 'Previous Day' : 'اليوم السابق';
        const nextLabel = lang !== 'ar' ? 'Next Day' : 'اليوم التالي';
        const prevFullName = lang !== 'ar' ? `${prevD2} ${HIJRI_MONTHS_EN[prevM2-1]} ${prevY2} AH` : `${prevD2} ${prevName} ${prevY2} هـ`;
        const nextFullName = lang !== 'ar' ? `${nextD2} ${HIJRI_MONTHS_EN[nextM2-1]} ${nextY2} AH` : `${nextD2} ${nextName} ${nextY2} هـ`;
        navEl.innerHTML = `
            <a href="${prevUrl}" style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);transition:border-color .2s;">
                <span style="font-size:0.75rem;color:var(--text-light);display:flex;align-items:center;gap:4px;">← ${prevLabel}</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${prevFullName}</span>
            </a>
            <a href="${nextUrl}" style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);transition:border-color .2s;">
                <span style="font-size:0.75rem;color:var(--text-light);display:flex;align-items:center;gap:4px;">${nextLabel} →</span>
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
            const mName = HijriDate.hijriMonths[mo - 1];
            const url   = hijriDayUrl(yr, mo, 1);
            return `<a href="${url}" style="display:inline-block;padding:8px 16px;background:var(--bg);color:var(--primary);border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid var(--border);">${mName} ${yr}${hSfx}</a>`;
        }).join('');
    }

    // 11. Footer SEO
    const footerEl = document.getElementById('hday-footer-seo');
    if (footerEl) {
        footerEl.textContent = lang !== 'ar'
            ? `The Hijri calendar is based on the lunar cycle and is used to determine Islamic occasions such as Ramadan and Hajj. The date ${day} ${monthNameEn} ${year} AH corresponds to ${greg.day} ${gMonths[greg.month-1]} ${greg.year} CE, according to the Umm al-Qura calendar used in ${countryLabel}. Use our date converter to easily convert between Hijri and Gregorian calendars, or browse the Hijri calendar to see today's Hijri date.`
            : `التقويم الهجري يعتمد على دورة القمر، ويستخدم في تحديد المناسبات الإسلامية مثل رمضان والحج. يوافق التاريخ ${day} ${monthName} ${year} هـ في التقويم الميلادي ${greg.day} ${gMonths[greg.month-1]} ${greg.year} م، حسب تقويم أم القرى المعتمد في ${countryLabel}. يمكنك استخدام أداة تحويل التاريخ للتحويل بين التاريخ الهجري والميلادي، أو تصفح التقويم الهجري لمعرفة التاريخ الهجري اليوم.`;
    }

    // 12. Schema JSON-LD — @graph: BreadcrumbList + WebPage + FAQPage
    ['hday-schema-faq','hday-schema-bc','hday-schema-article','hday-schema-graph'].forEach(id => document.getElementById(id)?.remove());

    const _origin    = window.SITE_URL || window.location.origin;
    const _country   = getDisplayCountry();
    const _todayH2   = HijriDate.getToday();
    const _todayMN2  = lang !== 'ar' ? HIJRI_MONTHS_EN[_todayH2.month-1] : HijriDate.hijriMonths[_todayH2.month-1];
    const _todaySfx2 = lang !== 'ar' ? ' AH' : ' هـ';
    const _pageUrl   = _origin + window.location.pathname;
    const _calUrl    = _origin + `${prefix}/today-hijri-date`;
    const _monthUrl  = _origin + hijriMonthUrl(year, month);
    const _siteName  = lang !== 'ar' ? 'Prayer Times & Hijri Calendar' : 'مواقيت الصلاة والتقويم الهجري';
    const _gregStr   = `${greg.day} ${G_MONTHS_AR[greg.month-1]} ${greg.year}`;
    const _gregStrEn = `${greg.day} ${G_MONTHS_EN[greg.month-1]} ${greg.year}`;
    // عناوين مُثراة (~55 حرفاً) — تتضمن إشارة للميلادي لأهميتها لـ SEO جوجل
    const _headline  = lang !== 'ar'
        ? `${day} ${monthNameEn} ${year} AH (${dayNameEn}) — Hijri & Gregorian`
        : `${day} ${monthName} ${year} هـ (${dayNameAr}) — التاريخ الهجري والميلادي`;
    const _desc = lang !== 'ar'
        ? `This page shows the Hijri date ${day} ${monthNameEn} ${year} AH with its corresponding Gregorian date according to the Umm al-Qura calendar in ${_country}.`
        : `يعرض هذا اليوم التاريخ الهجري الموافق ${day} ${monthName} ${year} هـ مع التاريخ الميلادي المقابل حسب تقويم أم القرى في ${_country}.`;

    const _nowIso = new Date().toISOString();
    const hdaySchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${_pageUrl}#breadcrumb`,
                "itemListElement": [
                    { "@type":"ListItem","position":1,
                      "name": lang==='en'?"Home":"الرئيسية",
                      "item": _origin+(lang==='en'?'/en':'/') },
                    { "@type":"ListItem","position":2,
                      "name": lang==='en'?"Hijri Calendar":"التقويم الهجري",
                      "item": _calUrl },
                    { "@type":"ListItem","position":3,
                      "name": lang==='en'?`${year} AH`:`${year} هـ`,
                      "item": _calUrl },
                    { "@type":"ListItem","position":4,
                      "name": lang==='en'?`${monthNameEn} ${year} AH`:`${monthName} ${year} هـ`,
                      "item": _monthUrl },
                    { "@type":"ListItem","position":5,
                      "name": lang==='en'?`${day} ${monthNameEn} ${year} AH`:`${day} ${monthName} ${year} هـ`,
                      "item": _pageUrl }
                ]
            },
            {
                "@type": "Article",
                "@id": `${_pageUrl}#article`,
                "headline": _headline,
                "description": _desc,
                "inLanguage": lang !== 'ar' ? 'en' : 'ar',
                "datePublished": _nowIso,
                "dateModified": _nowIso,
                "mainEntityOfPage": { "@id": `${_pageUrl}#webpage` },
                "author": { "@type": "Organization", "name": _siteName, "url": _origin + (lang==='en'?'/en':'/') },
                "publisher": { "@type": "Organization", "name": _siteName, "url": _origin + (lang==='en'?'/en':'/') }
            },
            {
                "@type": "WebPage",
                "@id": `${_pageUrl}#webpage`,
                "url": _pageUrl,
                "name": _headline,
                "headline": _headline,
                "description": _desc,
                "inLanguage": lang !== 'ar' ? 'en' : 'ar',
                "isPartOf": {
                    "@type": "WebSite",
                    "name": _siteName,
                    "url": _origin + (lang==='en'?'/en':'/')
                },
                "breadcrumb": { "@id": `${_pageUrl}#breadcrumb` }
            },
            {
                "@type": "FAQPage",
                "@id": `${_pageUrl}#faq`,
                "mainEntity": lang !== 'ar' ? [
                    { "@type":"Question",
                      "name": `What is the Hijri date for this day?`,
                      "acceptedAnswer": { "@type":"Answer","text": `The Hijri date for this day is ${dayNameEn}, ${day} ${monthNameEn} ${year} AH.` } },
                    { "@type":"Question",
                      "name": `What Gregorian date is ${day} ${monthNameEn} ${year} AH?`,
                      "acceptedAnswer": { "@type":"Answer","text": `${day} ${monthNameEn} ${year} AH corresponds to ${_gregStrEn} CE.` } },
                    { "@type":"Question",
                      "name": `Is ${year} AH a leap year?`,
                      "acceptedAnswer": { "@type":"Answer","text": isLeap ? `Yes, ${year} AH is a leap year with 355 days.` : `No, ${year} AH is a regular year with 354 days.` } },
                    { "@type":"Question",
                      "name": `What does ${day} ${monthNameEn} ${year} AH correspond to in ${_country}?`,
                      "acceptedAnswer": { "@type":"Answer","text": `${day} ${monthNameEn} ${year} AH corresponds to ${_gregStrEn} CE.` } },
                    { "@type":"Question",
                      "name": `What is today's Hijri date in ${_country}?`,
                      "acceptedAnswer": { "@type":"Answer","text": `Today's Hijri date is ${_todayH2.day} ${_todayMN2} ${_todayH2.year}${_todaySfx2}.` } },
                ] : [
                    { "@type":"Question",
                      "name": `ما هو التاريخ الهجري لهذا اليوم؟`,
                      "acceptedAnswer": { "@type":"Answer","text": `التاريخ الهجري لهذا اليوم هو ${dayNameAr} ${day} ${monthName} ${year} هـ.` } },
                    { "@type":"Question",
                      "name": `ماذا يوافق ${day} ${monthName} ${year} ميلادي؟`,
                      "acceptedAnswer": { "@type":"Answer","text": `يوافق ${day} ${monthName} ${year} هـ تاريخ ${_gregStr} م.` } },
                    { "@type":"Question",
                      "name": `هل سنة ${year} هـ سنة كبيسة؟`,
                      "acceptedAnswer": { "@type":"Answer","text": isLeap ? `نعم، سنة ${year} هـ سنة كبيسة وعدد أيامها 355 يوماً.` : `لا، سنة ${year} هـ سنة بسيطة وعدد أيامها 354 يوماً.` } },
                    { "@type":"Question",
                      "name": `كم يوافق ${day} ${monthName} ${year} هـ بالميلادي في ${_country}؟`,
                      "acceptedAnswer": { "@type":"Answer","text": `يوافق ${day} ${monthName} ${year} هـ تاريخ ${_gregStr} م.` } },
                    { "@type":"Question",
                      "name": `ما هو التاريخ الهجري اليوم في ${_country}؟`,
                      "acceptedAnswer": { "@type":"Answer","text": `التاريخ الهجري اليوم هو ${_todayH2.day} ${_todayMN2} ${_todayH2.year}${_todaySfx2}.` } },
                ]
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

// ========= صفحة التقويم الهجري السنوي /hijri-calendar/1447 =========
function loadHijriYearPage() {
    const match = window.location.pathname.match(/\/(?:en\/)?hijri-calendar\/(\d{4})$/);
    if (!match) return;
    const year   = parseInt(match[1]);
    const lang   = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const prefix = lang === 'ar' ? '' : '/' + lang;
    const hSfx   = lang !== 'ar' ? ' AH' : ' هـ';
    const _origin = window.SITE_URL || window.location.origin;
    const _pageUrl = _origin + window.location.pathname;
    const country  = getDisplayCountry();
    const isLeap   = HijriDate.isHijriLeapYear(year);
    const totalYearDays = isLeap ? 355 : 354;
    const gMonthsAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const gMonthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const gMonths   = lang !== 'ar' ? gMonthsEn : gMonthsAr;

    // ── 1. Breadcrumb ─────────────────────────────────────────────
    const bcEl = document.getElementById('hyear-breadcrumbs');
    if (bcEl) {
        const calPath = `${prefix}/hijri-calendar/${year}`;
        const homeUrl = (lang === 'ar') ? '/' : (prefix + '/');
        const isAr    = (lang === 'ar');
        const _t      = (typeof t === 'function') ? t : (k) => k;
        const homeL   = _t('breadcrumb.home') || (isAr ? 'الرئيسية' : 'Home');
        const calL    = isAr ? 'التقويم الهجري' : 'Hijri Calendar';
        const yearL   = isAr ? `${year} هـ` : `${year} AH`;
        bcEl.innerHTML = _buildHijriBreadcrumbOl([
            { href: homeUrl, text: homeL },
            { href: calPath, text: calL },
            { text: yearL, current: true }
        ]);
    }

    // ── 2. Title & Intro ─────────────────────────────────────────
    const titleEl = document.getElementById('hyear-title');
    if (titleEl) titleEl.textContent = lang !== 'ar'
        ? `Hijri Calendar for the Year ${year} AH`
        : `التقويم الهجري لعام ${year} هـ`;

    const introEl = document.getElementById('hyear-intro');
    if (introEl) introEl.textContent = lang !== 'ar'
        ? `This calendar displays all Hijri months of ${year} AH with their corresponding Gregorian dates, according to the Umm al-Qura calendar in ${country}.`
        : `يعرض هذا التقويم الهجري لعام ${year} هـ جميع الأشهر الهجرية مع التواريخ الميلادية المقابلة حسب تقويم أم القرى في ${country}.`;

    // ── 2.5 Year Picker ──────────────────────────────────────────
    const yrSel = document.getElementById('hyear-year-select');
    if (yrSel) {
        const todayYear = HijriDate.getToday().year;
        const min = todayYear - 20;
        const max = todayYear + 20;
        let html = '';
        for (let y = min; y <= max; y++) {
            const selected = (y === year) ? ' selected' : '';
            const label = lang !== 'ar' ? `${y} AH` : `${y} هـ`;
            html += `<option value="${y}"${selected}>${label}</option>`;
        }
        yrSel.innerHTML = html;
    }

    // ── 3. Info Cards ─────────────────────────────────────────────
    const infoGrid = document.getElementById('hyear-info-grid');
    if (infoGrid) {
        const leapLabel = isLeap
            ? (lang !== 'ar' ? 'Leap Year (355 days)' : 'كبيسة (355 يوماً)')
            : (lang !== 'ar' ? 'Regular Year (354 days)' : 'بسيطة (354 يوماً)');
        const cards = lang !== 'ar' ? [
            ['📆', 'Year',          `${year} AH`],
            ['📊', 'Total Days',    `${totalYearDays} days`],
            ['✔️', 'Year Type',     leapLabel],
            ['🌙', 'Months',        '12 months'],
        ] : [
            ['📆', 'السنة',         `${year} هـ`],
            ['📊', 'عدد الأيام',    `${totalYearDays} يوم`],
            ['✔️', 'نوع السنة',     leapLabel],
            ['🌙', 'عدد الأشهر',    '12 شهراً'],
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
    if (thMonth) thMonth.textContent = lang !== 'ar' ? 'Month'           : 'الشهر';
    if (thStart) thStart.textContent = lang !== 'ar' ? 'Start (Gregorian)' : 'البداية (ميلادي)';
    if (thEnd)   thEnd.textContent   = lang !== 'ar' ? 'End (Gregorian)'   : 'النهاية (ميلادي)';
    if (thDays)  thDays.textContent  = lang !== 'ar' ? 'Days'            : 'الأيام';

    const tableTitleEl = document.getElementById('hyear-table-title');
    if (tableTitleEl) tableTitleEl.textContent = lang !== 'ar'
        ? `🗓️ Months of ${year} AH`
        : `🗓️ أشهر السنة الهجرية ${year} هـ`;

    const tbody = document.getElementById('hyear-table-body');
    if (tbody) {
        tbody.innerHTML = '';
        for (let m = 1; m <= 12; m++) {
            const mDays   = HijriDate.getDaysInHijriMonth(year, m);
            const gFirst  = HijriDate.toGregorian(year, m, 1);
            const gLast   = HijriDate.toGregorian(year, m, mDays);
            const mName   = lang !== 'ar' ? HIJRI_MONTHS_EN[m-1] : HijriDate.hijriMonths[m-1];
            const mUrl    = hijriMonthUrl(year, m);
            const startStr = `${gFirst.day} ${gMonths[gFirst.month-1]} ${gFirst.year}`;
            const endStr   = `${gLast.day} ${gMonths[gLast.month-1]} ${gLast.year}`;
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
    if (monthsTitleEl) monthsTitleEl.textContent = lang !== 'ar'
        ? `📅 Browse Months of ${year} AH`
        : `📅 تصفح أشهر السنة الهجرية ${year} هـ`;

    const monthsGrid = document.getElementById('hyear-months-grid');
    if (monthsGrid) {
        monthsGrid.innerHTML = '';
        for (let m = 1; m <= 12; m++) {
            const mName = lang !== 'ar' ? HIJRI_MONTHS_EN[m-1] : HijriDate.hijriMonths[m-1];
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
        const ctas = lang !== 'ar' ? [
            [`${prefix}/today-hijri-date`, '📌 Today\'s Hijri Date', true],
            [curMonthUrl,                  `🌙 ${HIJRI_MONTHS_EN[todayH.month-1]} ${year} AH`, false],
            [`${prefix}/dateconverter`,    '🔄 Date Converter', false],
        ] : [
            [`${prefix}/today-hijri-date`, '📌 التاريخ الهجري اليوم', true],
            [curMonthUrl,                  `🌙 التقويم الهجري لشهر ${HijriDate.hijriMonths[todayH.month-1]} ${year}`, false],
            [`${prefix}/dateconverter`,    '🔄 تحويل التاريخ', false],
        ];
        ctaEl.innerHTML = ctas.map(([href, text, primary]) =>
            `<a href="${href}" style="display:inline-block;padding:10px 20px;background:${primary ? 'var(--primary)' : 'var(--bg)'};color:${primary ? '#fff' : 'var(--primary)'};border-radius:8px;text-decoration:none;font-size:0.9rem;font-weight:${primary ? '700' : '500'};border:1px solid var(--border);">${text}</a>`
        ).join('');
    }

    // ── 7. FAQ ────────────────────────────────────────────────────
    const faqTitleEl = document.getElementById('hyear-faq-title');
    if (faqTitleEl) faqTitleEl.textContent = lang !== 'ar' ? '❓ Frequently Asked Questions' : '❓ أسئلة شائعة';

    const faqEl = document.getElementById('hyear-faq');
    if (faqEl) {
        const leapAns = isLeap
            ? (lang !== 'ar' ? `Yes, ${year} AH is a leap year with 355 days.` : `نعم، سنة ${year} هـ كبيسة وعدد أيامها 355 يوماً.`)
            : (lang !== 'ar' ? `No, ${year} AH is a regular year with 354 days.` : `لا، سنة ${year} هـ بسيطة وعدد أيامها 354 يوماً.`);
        const faqs = lang !== 'ar' ? [
            [`How many days are in the Hijri year ${year} AH?`, `${totalYearDays} days.`],
            [`Is ${year} AH a leap year?`,                      leapAns],
            ['How many months are in the Hijri calendar?',      '12 months, from Muharram to Dhu al-Hijjah.'],
        ] : [
            [`كم عدد أيام السنة الهجرية ${year} هـ؟`,   `${totalYearDays} يوماً.`],
            [`هل سنة ${year} هـ كبيسة؟`,               leapAns],
            ['كم عدد الأشهر الهجرية؟',                  '12 شهراً، تبدأ بمحرم وتنتهي بذي الحجة.'],
        ];
        faqEl.innerHTML = faqs.map(([q, a]) =>
            `<div style="background:var(--bg);border-radius:10px;padding:14px 18px;margin-bottom:10px;">
                <div style="font-weight:700;color:var(--primary);margin-bottom:6px;">${q}</div>
                <div style="color:var(--text);font-size:0.95rem;">${a}</div>
            </div>`
        ).join('');
    }

    // ── 8. SEO Text ───────────────────────────────────────────────
    const seoTitleEl = document.getElementById('hyear-seo-title');
    if (seoTitleEl) seoTitleEl.textContent = lang !== 'ar' ? '🌙 About the Hijri Calendar' : '🌙 عن التقويم الهجري';

    const seoTextEl = document.getElementById('hyear-seo-text');
    if (seoTextEl) seoTextEl.textContent = lang !== 'ar'
        ? `The Hijri calendar consists of 12 months starting with Muharram and ending with Dhu al-Hijjah. It is based on the lunar cycle, where each month begins with the sighting of the new crescent moon. The year ${year} AH contains ${totalYearDays} days and is ${isLeap ? 'a leap year' : 'a regular year'}. The Umm al-Qura calendar, used in Saudi Arabia, is a calculated lunar calendar used to determine Islamic occasions such as Ramadan, Eid al-Fitr, and Eid al-Adha.`
        : `يتكون التقويم الهجري من 12 شهراً تبدأ بمحرم وتنتهي بذي الحجة، ويعتمد على دورة القمر حيث يبدأ كل شهر برؤية الهلال. عام ${year} هـ يحتوي على ${totalYearDays} يوماً وهو ${isLeap ? 'سنة كبيسة' : 'سنة بسيطة'}. تقويم أم القرى المعتمد في المملكة العربية السعودية هو تقويم قمري حسابي يستخدم لتحديد المناسبات الإسلامية مثل رمضان وعيد الفطر وعيد الأضحى.`;

    // ── 9. Footer SEO ─────────────────────────────────────────────
    const footerEl = document.getElementById('hyear-footer-seo');
    if (footerEl) footerEl.textContent = lang !== 'ar'
        ? `The Hijri calendar for ${year} AH covers a full year of ${totalYearDays} days across 12 months. Browse each month to see the complete Hijri calendar with corresponding Gregorian dates according to the Umm al-Qura calendar in ${country}. You can also check today's Hijri date or use the date converter to convert any date between Hijri and Gregorian.`
        : `التقويم الهجري لعام ${year} هـ يشمل سنة كاملة من ${totalYearDays} يوماً موزعة على 12 شهراً. تصفح كل شهر لعرض التقويم الهجري الكامل مع التواريخ الميلادية المقابلة حسب تقويم أم القرى في ${country}. يمكنك أيضاً معرفة التاريخ الهجري اليوم أو استخدام تحويل التاريخ بين الهجري والميلادي.`;

    // ── 10. Schema JSON-LD ────────────────────────────────────────
    document.getElementById('hyear-schema-graph')?.remove();
    const _siteName = lang !== 'ar' ? 'Prayer Times & Hijri Calendar' : 'مواقيت الصلاة والتقويم الهجري';
    const _hyearHeadline = lang==='en'?`Hijri Calendar for the Year ${year} AH`:`التقويم الهجري لعام ${year} هـ`;
    const _hyearDesc = lang==='en'
        ? `Full Hijri calendar for ${year} AH with all 12 months and corresponding Gregorian dates, according to the Umm al-Qura calendar in ${country}.`
        : `التقويم الهجري الكامل لعام ${year} هـ مع جميع الأشهر الهجرية والتواريخ الميلادية المقابلة حسب تقويم أم القرى في ${country}.`;
    const _hyearNowIso = new Date().toISOString();
    const hyearSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${_pageUrl}#breadcrumb`,
                "itemListElement": [
                    { "@type":"ListItem","position":1,
                      "name": lang==='en'?"Home":"الرئيسية",
                      "item": _origin+(lang==='en'?'/en':'/') },
                    { "@type":"ListItem","position":2,
                      "name": lang==='en'?"Hijri Calendar":"التقويم الهجري",
                      "item": _origin+`${prefix}/today-hijri-date` },
                    { "@type":"ListItem","position":3,
                      "name": lang==='en'?`${year} AH`:`${year} هـ`,
                      "item": _pageUrl }
                ]
            },
            {
                "@type": "Article",
                "@id": `${_pageUrl}#article`,
                "headline": _hyearHeadline,
                "description": _hyearDesc,
                "inLanguage": lang !== 'ar' ? 'en' : 'ar',
                "datePublished": _hyearNowIso,
                "dateModified": _hyearNowIso,
                "mainEntityOfPage": { "@id": `${_pageUrl}#webpage` },
                "author": { "@type": "Organization", "name": _siteName, "url": _origin + (lang==='en'?'/en':'/') },
                "publisher": { "@type": "Organization", "name": _siteName, "url": _origin + (lang==='en'?'/en':'/') }
            },
            {
                "@type": "WebPage",
                "@id": `${_pageUrl}#webpage`,
                "url": _pageUrl,
                "name": lang==='en'?`Hijri Calendar ${year} AH`:`التقويم الهجري لعام ${year} هـ`,
                "headline": lang==='en'?`Hijri Calendar for the Year ${year} AH`:`التقويم الهجري لعام ${year} هـ`,
                "description": lang==='en'
                    ? `Full Hijri calendar for ${year} AH with all 12 months and corresponding Gregorian dates, according to the Umm al-Qura calendar in ${country}.`
                    : `التقويم الهجري الكامل لعام ${year} هـ مع جميع الأشهر الهجرية والتواريخ الميلادية المقابلة حسب تقويم أم القرى في ${country}.`,
                "inLanguage": lang==='en'?'en':'ar',
                "isPartOf": { "@type":"WebSite","name":_siteName,"url":_origin+(lang==='en'?'/en':'/') },
                "breadcrumb": { "@id":`${_pageUrl}#breadcrumb` }
            },
            {
                "@type": "FAQPage",
                "@id": `${_pageUrl}#faq`,
                "mainEntity": lang==='en' ? [
                    { "@type":"Question","name":`How many days are in ${year} AH?`,
                      "acceptedAnswer":{"@type":"Answer","text":`${year} AH has ${totalYearDays} days.`} },
                    { "@type":"Question","name":`Is ${year} AH a leap year?`,
                      "acceptedAnswer":{"@type":"Answer","text": isLeap?`Yes, ${year} AH is a leap year with 355 days.`:`No, ${year} AH is a regular year with 354 days.`} },
                    { "@type":"Question","name":"How many months are in the Hijri calendar?",
                      "acceptedAnswer":{"@type":"Answer","text":"12 months, from Muharram to Dhu al-Hijjah."} },
                ] : [
                    { "@type":"Question","name":`كم عدد أيام السنة الهجرية ${year} هـ؟`,
                      "acceptedAnswer":{"@type":"Answer","text":`عدد أيام سنة ${year} هـ هو ${totalYearDays} يوماً.`} },
                    { "@type":"Question","name":`هل سنة ${year} هـ كبيسة؟`,
                      "acceptedAnswer":{"@type":"Answer","text": isLeap?`نعم، سنة ${year} هـ كبيسة وعدد أيامها 355 يوماً.`:`لا، سنة ${year} هـ بسيطة وعدد أيامها 354 يوماً.`} },
                    { "@type":"Question","name":"كم عدد الأشهر الهجرية؟",
                      "acceptedAnswer":{"@type":"Answer","text":"12 شهراً، تبدأ بمحرم وتنتهي بذي الحجة."} },
                ]
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
        title: lang !== 'ar' ? `Hijri Calendar ${year} AH` : `التقويم الهجري لعام ${year} هـ`,
        description: lang !== 'ar'
            ? `Full Hijri calendar for ${year} AH with all 12 months and corresponding Gregorian dates, according to the Umm al-Qura calendar in ${country}.`
            : `التقويم الهجري الكامل لعام ${year} هـ مع جميع الأشهر الهجرية والتواريخ الميلادية المقابلة حسب تقويم أم القرى في ${country}.`,
        ogType: 'article'
    });
}

// ========= صفحة التقويم الهجري الشهري =========
function loadHijriMonthPage() {
    const match = window.location.pathname.match(/\/(?:en\/)?hijri-calendar\/([a-z-]+)-(\d+)$/);
    if (!match) return;
    const monthSlug = match[1];
    const year      = parseInt(match[2]);
    const monthIdx  = HIJRI_MONTH_SLUGS.indexOf(monthSlug);
    if (monthIdx === -1) return;
    const month     = monthIdx + 1;

    const lang        = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const prefix      = lang === 'ar' ? '' : '/' + lang;
    const monthName   = HijriDate.hijriMonths[monthIdx];
    const monthNameEn = HIJRI_MONTHS_EN[monthIdx];
    const totalDays   = HijriDate.getDaysInHijriMonth(year, month);
    const isLeap      = HijriDate.isHijriLeapYear(year);
    const hSfx        = lang !== 'ar' ? ' AH' : ' هـ';
    const gSfx        = lang !== 'ar' ? ' CE' : ' م';
    const gMonths     = lang !== 'ar' ? G_MONTHS_EN : G_MONTHS_AR;
    const gregFirst   = HijriDate.toGregorian(year, month, 1);
    const gregLast    = HijriDate.toGregorian(year, month, totalDays);
    const todayH      = HijriDate.getToday();
    const countryLabel = getDisplayCountry();
    const _origin     = window.SITE_URL || window.location.origin;

    // 1. Breadcrumbs
    const bcEl = document.getElementById('hmonth-breadcrumbs');
    if (bcEl) {
        const calPath  = `${prefix}/hijri-calendar/${year}`;
        const yearPath = `${prefix}/hijri-calendar/${year}`;
        const homeUrl  = (lang === 'ar') ? '/' : (prefix + '/');
        const isAr     = (lang === 'ar');
        const _t       = (typeof t === 'function') ? t : (k) => k;
        const homeL    = _t('breadcrumb.home') || (isAr ? 'الرئيسية' : 'Home');
        const calL     = isAr ? 'التقويم الهجري' : 'Hijri Calendar';
        const yearL    = isAr ? `${year} هـ` : `${year} AH`;
        const monthL   = isAr ? `${monthName} ${year} هـ` : `${monthNameEn} ${year} AH`;
        bcEl.innerHTML = _buildHijriBreadcrumbOl([
            { href: homeUrl, text: homeL },
            { href: calPath, text: calL },
            { href: yearPath, text: yearL },
            { text: monthL, current: true }
        ]);
    }

    // 2. Title & Subtitle
    const titleEl    = document.getElementById('hmonth-title');
    const subtitleEl = document.getElementById('hmonth-subtitle');
    const gm1 = gMonths[gregFirst.month - 1];
    const gm2 = gMonths[gregLast.month - 1];
    const gRange = gregFirst.month !== gregLast.month ? `${gm1} – ${gm2} ${gregLast.year}` : `${gm1} ${gregLast.year}`;
    if (titleEl) titleEl.textContent = lang !== 'ar'
        ? `Hijri Calendar: ${monthNameEn} ${year} AH (${gRange})`
        : `التقويم الهجري لشهر ${monthName} ${year} هـ (${gRange})`;
    if (subtitleEl) subtitleEl.textContent = lang !== 'ar'
        ? `Corresponding to: ${gRange}`
        : `الموافق: ${gRange}`;

    // 3. Intro
    const introEl = document.getElementById('hmonth-intro');
    if (introEl) introEl.textContent = lang !== 'ar'
        ? `This table shows the full Hijri calendar for ${monthNameEn} ${year} AH with the corresponding Gregorian date for each day, according to the Umm al-Qura calendar in ${countryLabel}.`
        : `يعرض هذا الجدول التقويم الهجري الكامل لشهر ${monthName} ${year} هـ مع التاريخ الميلادي المقابل لكل يوم حسب تقويم أم القرى في ${countryLabel}.`;

    // 4. Info Cards
    const gridEl = document.getElementById('hmonth-info-grid');
    if (gridEl) {
        const cards = lang !== 'ar' ? [
            ['📅','Month', monthNameEn],
            ['🔢','Days in Month', `${totalDays} days`],
            ['🗓️','First Day (Gregorian)', `${gregFirst.day} ${G_MONTHS_EN[gregFirst.month-1]} ${gregFirst.year}`],
            ['🗓️','Last Day (Gregorian)', `${gregLast.day} ${G_MONTHS_EN[gregLast.month-1]} ${gregLast.year}`],
            ['✅','Year', `${year} AH`],
            ['✔️','Leap Year', isLeap ? 'Yes (355 days)' : 'No (354 days)'],
        ] : [
            ['📅','الشهر', monthName],
            ['🔢','عدد أيام الشهر', `${totalDays} يوم`],
            ['🗓️','أول يوم (ميلادي)', `${gregFirst.day} ${G_MONTHS_AR[gregFirst.month-1]} ${gregFirst.year}`],
            ['🗓️','آخر يوم (ميلادي)', `${gregLast.day} ${G_MONTHS_AR[gregLast.month-1]} ${gregLast.year}`],
            ['✅','السنة', `${year} هـ`],
            ['✔️','سنة كبيسة', isLeap ? 'نعم (355 يوماً)' : 'لا (354 يوماً)'],
        ];
        gridEl.innerHTML = cards.map(([icon, label, value]) =>
            `<div class="info-card"><div class="info-card-label">${icon} ${label}</div><div class="info-card-value">${value}</div></div>`
        ).join('');
    }

    // 5. Full Calendar Table
    const tbody = document.getElementById('hmonth-table-body');
    if (tbody) {
        const dayNamesAr = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
        tbody.innerHTML = '';
        for (let d = 1; d <= totalDays; d++) {
            const greg    = HijriDate.toGregorian(year, month, d);
            const isToday = (d === todayH.day && month === todayH.month && year === todayH.year);
            const tr      = document.createElement('tr');
            tr.style.cssText = isToday ? 'background:var(--primary-light);color:#fff;font-weight:700;' : (d % 2 === 0 ? 'background:var(--bg);' : '');
            const dayUrl    = hijriDayUrl(year, month, d);
            const linkStyle = isToday ? 'color:#fff;text-decoration:none;font-weight:700;' : 'color:var(--primary);text-decoration:none;';
            const dowIdx    = new Date(greg.year, greg.month - 1, greg.day).getDay();
            const dayNameAr = dayNamesAr[dowIdx];
            const dayNameEn = DAY_NAMES_EN[dowIdx];
            tr.innerHTML = `
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;">
                    <a href="${dayUrl}" style="${linkStyle}">${d} ${monthName} ${year}${hSfx} (${lang !== 'ar' ? dayNameEn : dayNameAr})</a>
                </td>
                <td style="padding:9px 14px;border-bottom:1px solid var(--border);text-align:center;">
                    <a href="${dayUrl}" style="${linkStyle}">${lang !== 'ar' ? dayNameEn : dayNameAr} ${greg.day} ${gMonths[greg.month-1]} ${greg.year}</a>
                </td>`;
            tbody.appendChild(tr);
        }
    }

    // 6. Internal Links
    const linksEl = document.getElementById('hmonth-links');
    if (linksEl) {
        const links = lang !== 'ar' ? [
            [`${prefix}/dateconverter`, '🔄 Convert Hijri ↔ Gregorian'],
            [`${prefix}/today-hijri-date`, '📌 Today\'s Hijri Date'],
            [hijriDayUrl(year, month, todayH.day && month === todayH.month && year === todayH.year ? todayH.day : 1), `📅 ${monthNameEn} ${year} AH – Day 1`],
        ] : [
            [`${prefix}/dateconverter`, '🔄 تحويل التاريخ هجري ميلادي'],
            [`${prefix}/today-hijri-date`, '📌 التاريخ الهجري اليوم'],
            [hijriDayUrl(year, month, 1), `📅 اليوم الأول من ${monthName} ${year}`],
        ];
        linksEl.innerHTML = links.map(([href, text]) =>
            `<a href="${href}" style="display:inline-block;padding:9px 18px;background:var(--primary);color:#fff;border-radius:8px;text-decoration:none;font-size:0.9rem;">${text}</a>`
        ).join('');
    }

    // 5b. Days summary sentence (above table)
    const daysSumEl = document.getElementById('hmonth-days-summary');
    if (daysSumEl) daysSumEl.textContent = lang !== 'ar'
        ? `📅 ${monthNameEn} ${year} AH contains ${totalDays} days.`
        : `📅 عدد أيام شهر ${monthName} ${year} هـ هو ${totalDays} يوماً.`;

    // 7. Other Months
    const otherEl = document.getElementById('hmonth-other-months');
    const otherTitleEl = document.getElementById('hmonth-other-months-title');
    if (otherTitleEl) otherTitleEl.textContent = lang !== 'ar'
        ? `🌙 Hijri Calendar for Other Months of ${year} AH`
        : `🌙 التقويم الهجري للأشهر الأخرى لعام ${year} هـ`;

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
            const mName = lang !== 'ar' ? HIJRI_MONTHS_EN[mo-1] : HijriDate.hijriMonths[mo-1];
            return `<a href="${hijriMonthUrl(yr, mo)}" style="display:inline-block;padding:8px 16px;background:var(--bg);color:var(--primary);border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid var(--border);">${mName} ${yr}${hSfx}</a>`;
        }).join('');
    }

    // 8. Prev / Next Month Navigation
    const navEl = document.getElementById('hmonth-nav');
    if (navEl) {
        let prevM = month - 1, prevY = year, nextM = month + 1, nextY = year;
        if (prevM < 1)  { prevM = 12; prevY--; }
        if (nextM > 12) { nextM = 1;  nextY++; }
        const prevName = lang !== 'ar' ? HIJRI_MONTHS_EN[prevM-1] : HijriDate.hijriMonths[prevM-1];
        const nextName = lang !== 'ar' ? HIJRI_MONTHS_EN[nextM-1] : HijriDate.hijriMonths[nextM-1];
        const prevUrl  = hijriMonthUrl(prevY, prevM);
        const nextUrl  = hijriMonthUrl(nextY, nextM);
        const prevLabel = lang !== 'ar' ? 'Previous Month' : 'الشهر السابق';
        const nextLabel = lang !== 'ar' ? 'Next Month'     : 'الشهر التالي';
        navEl.innerHTML = `
            <a href="${prevUrl}" style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text-light);">← ${prevLabel}</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${prevName} ${prevY}${hSfx}</span>
            </a>
            <a href="${nextUrl}" style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding:14px 18px;background:var(--bg);border-radius:12px;text-decoration:none;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text-light);">${nextLabel} →</span>
                <span style="font-weight:700;color:var(--primary);font-size:0.95rem;">${nextName} ${nextY}${hSfx}</span>
            </a>`;
    }

    // 9. Footer SEO
    const footerEl = document.getElementById('hmonth-footer-seo');
    if (footerEl) footerEl.textContent = lang !== 'ar'
        ? `The Hijri calendar for ${monthNameEn} ${year} AH spans from ${gregFirst.day} ${G_MONTHS_EN[gregFirst.month-1]} to ${gregLast.day} ${G_MONTHS_EN[gregLast.month-1]} ${gregLast.year} CE. It contains ${totalDays} days according to the Umm al-Qura calendar in ${countryLabel}. Use our date converter to convert any Hijri date to Gregorian, browse the Hijri calendar, or check today's Hijri date.`
        : `التقويم الهجري لشهر ${monthName} ${year} هـ يمتد من ${gregFirst.day} ${G_MONTHS_AR[gregFirst.month-1]} إلى ${gregLast.day} ${G_MONTHS_AR[gregLast.month-1]} ${gregLast.year} م، ويحتوي على ${totalDays} يوماً حسب تقويم أم القرى في ${countryLabel}. يمكنك استخدام أداة تحويل التاريخ بين الهجري والميلادي، أو تصفح التقويم الهجري الكامل، أو معرفة التاريخ الهجري اليوم.`;

    // 10. Schema JSON-LD — @graph: BreadcrumbList + WebPage + FAQPage
    document.getElementById('hmonth-schema-graph')?.remove();
    const pageUrl_  = _origin + window.location.pathname;
    const calUrl_   = _origin + `${prefix}/today-hijri-date`;
    const yearUrl_  = _origin + `${prefix}/today-hijri-date`;
    const siteName_ = lang !== 'ar' ? 'Prayer Times & Hijri Calendar' : 'مواقيت الصلاة والتقويم الهجري';
    const gregFirstStr = `${gregFirst.day} ${G_MONTHS_AR[gregFirst.month-1]} ${gregFirst.year}`;
    const gregLastStr  = `${gregLast.day}  ${G_MONTHS_AR[gregLast.month-1]} ${gregLast.year}`;
    const gregFirstStrEn = `${gregFirst.day} ${G_MONTHS_EN[gregFirst.month-1]} ${gregFirst.year}`;
    const gregLastStrEn  = `${gregLast.day} ${G_MONTHS_EN[gregLast.month-1]} ${gregLast.year}`;

    const _hmonthHeadline = lang==='en'
        ? `Hijri Calendar: ${monthNameEn} ${year} AH`
        : `التقويم الهجري لشهر ${monthName} ${year} هـ`;
    const _hmonthDesc = lang==='en'
        ? `This table shows the full Hijri calendar for ${monthNameEn} ${year} AH with the corresponding Gregorian date for each day, according to the Umm al-Qura calendar in ${countryLabel}.`
        : `يعرض هذا الجدول التقويم الهجري الكامل لشهر ${monthName} ${year} هـ مع التاريخ الميلادي المقابل لكل يوم حسب تقويم أم القرى في ${countryLabel}.`;
    const _hmonthNowIso = new Date().toISOString();
    const schemaGraph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl_}#breadcrumb`,
                "itemListElement": [
                    {"@type":"ListItem","position":1,
                     "name": lang==='en'?"Home":"الرئيسية",
                     "item": _origin+(lang==='en'?'/en':'/')},
                    {"@type":"ListItem","position":2,
                     "name": lang==='en'?"Hijri Calendar":"التقويم الهجري",
                     "item": calUrl_},
                    {"@type":"ListItem","position":3,
                     "name": lang==='en'?`${year} AH`:`${year} هـ`,
                     "item": yearUrl_},
                    {"@type":"ListItem","position":4,
                     "name": lang==='en'?`${monthNameEn} ${year} AH`:`${monthName} ${year} هـ`,
                     "item": pageUrl_}
                ]
            },
            {
                "@type": "Article",
                "@id": `${pageUrl_}#article`,
                "headline": _hmonthHeadline,
                "description": _hmonthDesc,
                "inLanguage": lang !== 'ar' ? 'en' : 'ar',
                "datePublished": _hmonthNowIso,
                "dateModified": _hmonthNowIso,
                "mainEntityOfPage": { "@id": `${pageUrl_}#webpage` },
                "author": { "@type": "Organization", "name": siteName_, "url": _origin + (lang==='en'?'/en':'/') },
                "publisher": { "@type": "Organization", "name": siteName_, "url": _origin + (lang==='en'?'/en':'/') }
            },
            {
                "@type": "WebPage",
                "@id": `${pageUrl_}#webpage`,
                "url": pageUrl_,
                "name": lang==='en'
                    ? `Hijri Calendar: ${monthNameEn} ${year} AH`
                    : `التقويم الهجري لشهر ${monthName} ${year} هـ`,
                "headline": lang==='en'
                    ? `Hijri Calendar: ${monthNameEn} ${year} AH`
                    : `التقويم الهجري لشهر ${monthName} ${year} هـ`,
                "description": lang==='en'
                    ? `This table shows the full Hijri calendar for ${monthNameEn} ${year} AH with the corresponding Gregorian date for each day, according to the Umm al-Qura calendar in ${countryLabel}.`
                    : `يعرض هذا الجدول التقويم الهجري الكامل لشهر ${monthName} ${year} هـ مع التاريخ الميلادي المقابل لكل يوم حسب تقويم أم القرى في ${countryLabel}.`,
                "inLanguage": lang !== 'ar' ? 'en' : 'ar',
                "isPartOf": {
                    "@type": "WebSite",
                    "name": siteName_,
                    "url": _origin + (lang==='en'?'/en':'/')
                },
                "breadcrumb": {"@id": `${pageUrl_}#breadcrumb`},
                "about": {
                    "@type": "Thing",
                    "name": lang==='en'
                        ? `Hijri Calendar for ${monthNameEn} ${year} AH`
                        : `التقويم الهجري لشهر ${monthName} ${year} هـ`
                },
                "mainEntity": {
                    "@type": "Dataset",
                    "name": lang==='en'
                        ? `Days of ${monthNameEn} ${year} AH`
                        : `جدول أيام شهر ${monthName} ${year} هـ`,
                    "description": lang==='en'
                        ? `Table showing the Hijri days of ${monthNameEn} ${year} AH with their Gregorian equivalents.`
                        : `جدول يوضح الأيام الهجرية لشهر ${monthName} ${year} هـ مع ما يقابلها من التاريخ الميلادي.`
                }
            },
            {
                "@type": "FAQPage",
                "@id": `${pageUrl_}#faq`,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": lang==='en'
                            ? `How many days are in ${monthNameEn} ${year} AH?`
                            : `كم عدد أيام شهر ${monthName} ${year} هـ؟`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": lang==='en'
                                ? `${monthNameEn} ${year} AH has ${totalDays} days.`
                                : `عدد أيام شهر ${monthName} ${year} هـ هو ${totalDays} يوماً.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": lang==='en'
                            ? `When does ${monthNameEn} ${year} AH begin?`
                            : `متى يبدأ شهر ${monthName} ${year} هـ؟`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": lang==='en'
                                ? `${monthNameEn} ${year} AH begins on ${gregFirstStrEn} CE according to the Umm al-Qura calendar.`
                                : `يبدأ شهر ${monthName} ${year} هـ يوم ${gregFirstStr} م حسب تقويم أم القرى.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": lang==='en'
                            ? `When does ${monthNameEn} ${year} AH end?`
                            : `متى ينتهي شهر ${monthName} ${year} هـ؟`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": lang==='en'
                                ? `${monthNameEn} ${year} AH ends on ${gregLastStrEn} CE according to the Umm al-Qura calendar.`
                                : `ينتهي شهر ${monthName} ${year} هـ يوم ${gregLastStr} م حسب تقويم أم القرى.`
                        }
                    }
                ]
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
        title: lang !== 'ar'
            ? `Hijri Calendar: ${monthNameEn} ${year} AH`
            : `التقويم الهجري لشهر ${monthName} ${year} هـ`,
        description: lang !== 'ar'
            ? `Full Hijri calendar for ${monthNameEn} ${year} AH with Gregorian date for each day, per Umm al-Qura calendar in ${countryLabel}.`
            : `التقويم الهجري الكامل لشهر ${monthName} ${year} هـ مع التاريخ الميلادي لكل يوم حسب تقويم أم القرى في ${countryLabel}.`,
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
    const hijriMonthsEn  = ['Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",'Jumada al-Awwal','Jumada al-Thani','Rajab',"Sha'ban",'Ramadan','Shawwal','Dhu al-Qi\'dah','Dhu al-Hijjah'];

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
    const isEn = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
    const prefix = isEn ? '/en' : '';
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
