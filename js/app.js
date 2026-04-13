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
    cn:'China', jp:'Japan', kr:'South Korea', mn:'Mongolia',
    kz:'Kazakhstan', uz:'Uzbekistan', az:'Azerbaijan', lk:'Sri Lanka',
    np:'Nepal', mm:'Myanmar',
    fr:'France', de:'Germany', gb:'United Kingdom', nl:'Netherlands',
    be:'Belgium', es:'Spain', it:'Italy', pt:'Portugal',
    ru:'Russia', pl:'Poland', se:'Sweden', no:'Norway',
    dk:'Denmark', fi:'Finland', ch:'Switzerland', at:'Austria',
    gr:'Greece', cz:'Czech Republic', ro:'Romania', hu:'Hungary',
    ua:'Ukraine', hr:'Croatia', rs:'Serbia', sk:'Slovakia',
    bg:'Bulgaria', ba:'Bosnia and Herzegovina', al:'Albania', mk:'North Macedonia',
    ie:'Ireland', lu:'Luxembourg', mt:'Malta', cy:'Cyprus',
    us:'United States', ca:'Canada', mx:'Mexico',
    br:'Brazil', ar:'Argentina', co:'Colombia', pe:'Peru',
    ve:'Venezuela', cl:'Chile', ec:'Ecuador', bo:'Bolivia',
    py:'Paraguay', uy:'Uruguay', gt:'Guatemala', cu:'Cuba',
    au:'Australia', nz:'New Zealand',
    ng:'Nigeria', et:'Ethiopia', ke:'Kenya', tz:'Tanzania',
    za:'South Africa', gh:'Ghana', sn:'Senegal', ci:"Côte d'Ivoire",
    cm:'Cameroon', ml:'Mali', ne:'Niger', td:'Chad',
    ug:'Uganda', mz:'Mozambique', zw:'Zimbabwe', mg:'Madagascar',
    ao:'Angola',
};

// ===== دوال مساعدة لعرض الأسماء حسب اللغة =====
function getDisplayCity() {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    if (lang === 'en') {
        return currentEnglishDisplayName || currentEnglishName || currentCity;
    }
    return currentCity; // يحتوي بالفعل على "المدينة، الحي" إن وُجد حي
}
function getDisplayCountry() {
    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    if (lang === 'en') {
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
let _prevCurrentSeconds = null; // لرصد عبور وقت الصلاة بدقة الثواني
let adhanProgressRAF = null;   // requestAnimationFrame للشريط
let _cachedNearbyPlaces = [];  // كاش الأماكن القريبة لإعادة الرسم عند تغيير اللغة

// توجيه طلبات Nominatim:
// - localhost → عبر proxy السيرفر (يحل CORS في بيئة التطوير)
// - domain حقيقي → مباشرة من المتصفح (كل مستخدم له IP خاص، لا ضغط على السيرفر)
function nomUrl(url) {
    if (window.location.protocol === 'file:') return url;
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        return url
            .replace('https://nominatim.openstreetmap.org/reverse?', '/api/geocode?type=reverse&')
            .replace('https://nominatim.openstreetmap.org/search?',  '/api/geocode?type=search&');
    }
    return url; // على الإنتاج: مباشر من المتصفح
}

// مساعد لبناء URL الصفحة حسب اللغة الحالية
function pageUrl(arabicPath) {
    if (window.location.protocol === 'file:') return arabicPath;
    if ((typeof getCurrentLang === 'function') && getCurrentLang() === 'en') {
        return '/en' + arabicPath.replace(/\.html$/, '');
    }
    return arabicPath;
}

// ========= المسبحة الإلكترونية =========
const TASBIH_SEQUENCE = ['سبحان الله', 'الحمد لله', 'الله أكبر'];
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

    btn.classList.remove('pulse');
    void btn.offsetWidth;
    btn.classList.add('pulse');

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
    document.getElementById('tasbih-count').textContent = tasbihCount;
    document.getElementById('tasbih-current-dhikr').textContent = TASBIH_SEQUENCE[tasbihStep];
    TASBIH_SEQUENCE.forEach((_, i) => {
        const el = document.getElementById('step-' + i);
        if (!el) return;
        el.classList.toggle('active', i === tasbihStep);
        el.classList.toggle('done', i < tasbihStep);
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
    btn.classList.remove('pulse');
    void btn.offsetWidth;
    btn.classList.add('pulse');
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
        // أظهر مكة أولاً بدون انتظار
        updateCityDisplay();
        updatePrayerTimes();
        updateQibla();
        // ثم اطلب الإذن للموقع الحقيقي
        detectLocation();
    }

    // تحديث البيانات الأولية
    updateHijriToday();
    updateMoonInfo();
    renderCalendar();

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

    // تفعيل القسم المطلوب من URL param ?page=xxx (مثل /?page=qibla)
    const _pageParam = new URLSearchParams(window.location.search).get('page');
    if (_pageParam && !_isQiblaPage) {
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

            // تحديث الروابط
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // تبديل الصفحات
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const targetPage = document.getElementById('page-' + pageId);
            if (targetPage) {
                targetPage.classList.add('active');
                targetPage.classList.add('fade-in');
                setTimeout(() => targetPage.classList.remove('fade-in'), 400);
            }

            // عند الانتقال لمواقيت الصلاة → انتقل لصفحة المدينة إذا كان هناك موقع محدد
            if (pageId === 'prayer-times' && window.location.protocol !== 'file:') {
                const _citySlug = window.location.pathname.match(/\/(?:en\/)?(?:qibla-in|prayer-times-in)-(.+?)(?:\.html)?$/)?.[1];
                const _slug = _citySlug || (currentLat && currentEnglishName ? makeSlug(currentEnglishName, currentLat, currentLng) : null);
                if (_slug && currentLat) {
                    sessionStorage.setItem(`city_${_slug}`, JSON.stringify({
                        lat: currentLat, lng: currentLng, name: currentCity,
                        country: currentCountry, englishName: currentEnglishName, countryCode: currentCountryCode, timezone: currentTimezone
                    }));
                    window.location.href = pageUrl(`/prayer-times-in-${_slug}.html`);
                    return;
                }
            }

            // عند الانتقال لقسم القبلة:
            // إذا كنا على صفحة مدينة → انتقل لصفحة القبلة المخصصة
            // وإلا → شغّل البوصلة مباشرة
            if (pageId === 'qibla') {
                const _currentSlug = window.location.pathname.match(/\/(?:en\/)?prayer-times-in-(.+?)(?:\.html)?$/)?.[1];
                if (_currentSlug && window.location.protocol !== 'file:') {
                    navigateToQibla(currentLat, currentLng, currentCity, currentCountry, currentEnglishName, currentCountryCode);
                    return;
                }
                startDeviceCompass();
            }

            // إغلاق القائمة على الموبايل
            closeSidebar();
        });
    });
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
    const isEnTitle = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
    document.title = isEnTitle
        ? `Prayer Times in ${englishName || city}`
        : `مواقيت الصلاة في ${city}`;
    updateCityDisplay();
    updatePrayerTimes();
    updateQibla();
    fetchNearbyPlaces(lat, lng);
    updateCityCountryInfo();
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
function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                currentTimezone = await fetchTimezone(currentLat, currentLng);
                // على الصفحة الرئيسية: انتقل لصفحة المدينة بعد التحديد
                // لكن إذا كان URL يحتوي على ?page= فلا تنتقل (المستخدم طلب قسماً بعينه)
                const hasPageParam = new URLSearchParams(window.location.search).has('page');
                const onHomePage = !hasPageParam && (window.location.pathname === '/' || window.location.pathname === '/en/' || window.location.pathname === '/en');
                reverseGeocode(currentLat, currentLng, onHomePage);
                if (!onHomePage) {
                    updatePrayerTimes();
                    updateQibla();
                    fetchNearbyPlaces(currentLat, currentLng);
                }
            },
            async function(error) {
                // فشل تحديد الموقع → المدينة الافتراضية (مكة)
                currentTimezone = await fetchTimezone(currentLat, currentLng);
                updateCityDisplay();
                updatePrayerTimes();
                updateQibla();
                fetchNearbyPlaces(currentLat, currentLng);
                updateCityCountryInfo();
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    } else {
        // المتصفح لا يدعم تحديد الموقع → المدينة الافتراضية
        fetchTimezone(currentLat, currentLng).then(tz => {
            currentTimezone = tz;
            updateCityDisplay();
            updatePrayerTimes();
            updateQibla();
            fetchNearbyPlaces(currentLat, currentLng);
            updateCityCountryInfo();
        });
    }
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
    const isEn = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
    const sep  = isEn ? ', ' : '، ';

    document.getElementById('city-name').textContent = dispCity;
    document.getElementById('country-name').textContent = dispCountry;

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
        qiblaTitle.textContent = isEn
            ? `🧭 Qibla Direction in ${dispCity}`
            : `🧭 اتجاه القبلة في ${dispCity}`;
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
            qiblaBackLabel.textContent = isEn
                ? `Prayer Times in ${dispCity}`
                : `مواقيت الصلاة في ${dispCity}`;
        }
        qiblaBackBtn.style.display = 'flex';
    } else if (qiblaBackBtn) {
        qiblaBackBtn.style.display = 'none';
    }
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
    const dateSep = (typeof getCurrentLang === 'function' && getCurrentLang() === 'en') ? ', ' : '، ';
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
        if (typeof getCurrentLang === 'function' && getCurrentLang() === 'en') {
            fastEl.textContent = fH + ' hr' + (fH !== 1 ? 's' : '') + (fM > 0 ? ' ' + fM + ' min' : '');
        } else {
            fastEl.textContent = fH + ' ساعة' + (fM > 0 ? ' و' + fM + ' دقيقة' : '');
        }
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

    // أيام 1-30
    dayEl.innerHTML = '';
    for (let d = 1; d <= 30; d++) {
        dayEl.innerHTML += `<option value="${d}">${d}</option>`;
    }

    // أشهر
    monthEl.innerHTML = '';
    const months = type === 'hijri' ? HijriDate.hijriMonths : HijriDate.gregorianMonths;
    months.forEach((m, i) => {
        monthEl.innerHTML += `<option value="${i + 1}">${m}</option>`;
    });

    // سنوات
    yearEl.innerHTML = '';
    if (type === 'hijri') {
        const hNow = HijriDate.toHijri(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
        const hSfxSel = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
        for (let y = hNow.year - 2; y <= hNow.year + 5; y++) {
            yearEl.innerHTML += `<option value="${y}">${y}${hSfxSel}</option>`;
        }
    } else {
        const cur = new Date().getFullYear();
        const gSfxSel = (typeof t === 'function') ? t('date.greg_suffix') : ' م';
        for (let y = cur - 2; y <= cur + 5; y++) {
            yearEl.innerHTML += `<option value="${y}">${y}${gSfxSel}</option>`;
        }
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
    populateScheduleSelects();
    setScheduleSelectsToToday();
    onScheduleDateChange();
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
        if (lang === 'en') {
            titleEl.textContent = `📅 Prayer Times Schedule in ${currentEnglishName || currentCity} — ${fmtDate(startDate)} to ${fmtDate(endDate)}`;
        } else {
            titleEl.textContent = `📅 جدول مواقيت الصلاة في ${currentCity} — من ${fmtDate(startDate)} إلى ${fmtDate(endDate)}`;
        }
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
    if (langRC === 'en') {
        title.textContent = `Prayer Times in Cities of ${dispCountryRC}`;
        if (moreBtn) moreBtn.textContent = `More cities of ${dispCountryRC} \u2192`;
    } else {
        title.textContent = `مواقيت الصلاة في مدن ${dispCountryRC}`;
        if (moreBtn) moreBtn.textContent = `المزيد من مدن ${dispCountryRC} \u2190`;
    }

    grid.innerHTML = '';
    others.slice(0, 16).forEach(city => {
        const a = document.createElement('a');
        a.className = 'city-card';
        a.href = buildCityUrl(city.lat, city.lng, city.nameAr, currentCountry, city.nameEn);
        a.textContent = langRC === 'en'
            ? `Prayer Times in ${city.nameEn || city.nameAr}`
            : `مواقيت الصلاة في ${city.nameAr}`;
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
    const local  = CITIES_DB[code];

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
    section.style.display = 'none'; // أخفِ مؤقتاً حتى يصل الرد
    fetch(`/api/cities?cc=${code}`)
        .then(r => r.ok ? r.json() : null)
        .then(cities => {
            if (cities && cities.length > 0) {
                try { localStorage.setItem(`cities_v3_${code}`, JSON.stringify({ ts: Date.now(), cities })); } catch(e) {}
                renderCountryCities(cities, code);
            }
        })
        .catch(() => {});
}

// ========= صفحة جميع المدن =========
function openAllCitiesPage() {
    const code = currentCountryCode || 'sa';
    sessionStorage.setItem('allCitiesCountry', JSON.stringify({
        code, name: currentCountry
    }));
    window.location.href = pageUrl(`/prayer-times-cities-${code}.html`);
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
    const sep     = lang === 'en' ? ', ' : '، ';
    const loc     = country
        ? `<strong>${city}</strong>${sep}<strong>${country}</strong>`
        : `<strong>${city}</strong>`;

    // العنوان
    document.getElementById('faq-title').innerHTML = lang === 'en'
        ? `❓ Prayer Times FAQ for ${loc}`
        : `❓ الأسئلة الشائعة حول مواقيت الصلاة في ${loc}`;

    // س1
    document.getElementById('faq-q1').innerHTML = lang === 'en'
        ? `What are the prayer times in ${loc} today?`
        : `ما هي مواقيت الصلاة في ${loc} اليوم؟`;
    document.getElementById('faq-a1-intro').innerHTML = lang === 'en'
        ? `Below are the prayer times today in ${loc}:`
        : `فيما يلي مواقيت الصلاة اليوم في ${loc}:`;

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

    let fastStr;
    if (lang === 'en') {
        fastStr = `<strong>${fH} hr${fH !== 1 ? 's' : ''}${fM > 0 ? ' ' + fM + ' min' : ''}</strong>`;
        document.getElementById('faq-q2').innerHTML = `How many fasting hours are there in ${loc} today?`;
        document.getElementById('faq-a2').innerHTML = `Fasting hours today in ${loc} are approximately ${fastStr}.`;
    } else {
        fastStr = `<strong>${fH} ساعة${fM > 0 ? ' و' + fM + ' دقيقة' : ''}</strong>`;
        document.getElementById('faq-q2').innerHTML = `ما هي مدة الصيام في ${loc} اليوم؟`;
        document.getElementById('faq-a2').innerHTML = `مدة الصيام اليوم في ${loc} تبلغ حوالي ${fastStr}.`;
    }
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

    if (lang === 'en') {
        const fastingStr = `${fastH} hr${fastH !== 1 ? 's' : ''}${fastM > 0 ? ' ' + fastM + ' min' : ''}`;
        const sep = country ? `, ${country}` : '';
        document.getElementById('seo-line-1').innerHTML =
            `Prayer Times in <strong>${city}</strong>${sep}`;
        document.getElementById('seo-line-2').innerHTML =
            `Today's prayer times in <strong>${city}</strong> start at <strong>${fajr}</strong> (Fajr) and end at <strong>${isha}</strong> (Isha). Total fasting hours today: <strong>${fastingStr}</strong>.`;
    } else {
        const fastingStr = fastH + ' ساعة' + (fastM > 0 ? ' و' + fastM + ' دقيقة' : '');
        document.getElementById('seo-line-1').innerHTML =
            `أوقات الصلاة في <strong>${city}</strong>، ${country}`;
        document.getElementById('seo-line-2').innerHTML =
            `مواقيت الصلاة اليوم في <strong>${city}</strong> تبدأ الساعة <strong>${fajr}</strong> بوقت صلاة الفجر وتنتهي الساعة <strong>${isha}</strong> لصلاة العشاء. وبالنسبة إلى عدد ساعات الصيام لهذا اليوم فإنها <strong>${fastingStr}</strong>.`;
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
        countryLinkEl.href = pageUrl(`/prayer-times-cities-${currentCountryCode}.html`);
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
        const isEn = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
        const period = isEn ? (hh >= 12 ? 'PM' : 'AM') : (hh >= 12 ? 'م' : 'ص');
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
        const sep  = (typeof getCurrentLang === 'function' && getCurrentLang() === 'en') ? ', ' : '، ';
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
    // إذا كان هناك مدينة محددة → انتقل لصفحتها مباشرة
    if (currentLat && currentEnglishName) {
        const slug = makeSlug(currentEnglishName, currentLat, currentLng);
        sessionStorage.setItem(`city_${slug}`, JSON.stringify({
            lat: currentLat, lng: currentLng, name: currentCity,
            country: currentCountry, englishName: currentEnglishName,
            countryCode: currentCountryCode, timezone: currentTimezone
        }));
        window.location.href = pageUrl(`/prayer-times-in-${slug}.html`);
    } else {
        const isEn = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
        window.location.href = isEn ? '/en/' : '/';
    }
}

// ========= الإعدادات (محجوز للتوافق) =========
function showSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) panel.style.display = 'block';
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
    const isEn = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
    if (isEn) {
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
    dot.classList.remove('pop-dot-pulse');
    void dot.offsetWidth; // إعادة تشغيل الأنيميشن
    dot.classList.add('pop-dot-pulse');
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
            const isEn = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
            elSession.textContent = added > 0
                ? (isEn ? `+${formatPopNumber(added)} since page opened` : `+${formatPopNumber(added)} منذ فتح الصفحة`)
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
        const isEn = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
        if (isEn) return getDisplayCountry();
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
        countryLinkEl.href = pageUrl(`/prayer-times-cities-${cc}.html`);
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
}

// ========= الأماكن القريبة =========
async function fetchNearbyPlaces(lat, lng) {
    const section = document.getElementById('nearby-section');
    const grid = document.getElementById('nearby-grid');
    grid.innerHTML = '<div style="padding:16px;color:var(--text-light)">⏳ جاري البحث عن أماكن قريبة...</div>';
    section.style.display = 'block';

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
        const isEnNearby = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
        const placeLabel = isEnNearby
            ? (place.nameEn || place.nameAr)
            : place.nameAr;
        const distLabel = isEnNearby ? `${place.dist} km` : `${place.dist} كم`;
        const nearbyTitle = isEnNearby
            ? `Prayer Times in ${placeLabel}`
            : `مواقيت الصلاة في ${place.nameAr}`;

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
    const direction = Qibla.getDirection(_qiblaAngle);
    const distance = Qibla.getDistance(currentLat, currentLng);

    document.getElementById('qibla-angle').textContent = _qiblaAngle.toFixed(1) + '°';
    document.getElementById('qibla-direction').textContent = 'اتجاه ' + direction;
    document.getElementById('qibla-distance').textContent = `المسافة إلى الكعبة: ${distance.toLocaleString('ar')} كم`;
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
    document.getElementById('moon-phase-name').textContent = phase.name;
    document.getElementById('moon-illumination').textContent = `الإضاءة: ${illumination}%`;
    document.getElementById('moon-age').textContent = age + ' يوم';
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
    const now = new Date();
    const hijri = HijriDate.getToday();
    const dayName = HijriDate.dayNames[now.getDay()];
    const monthName = HijriDate.hijriMonths[hijri.month - 1];

    const gMonths = HijriDate.gregorianMonths;

    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const hSfxH = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
    const gSfxH = (typeof t === 'function') ? t('date.greg_suffix') : ' م';
    const sepH = lang === 'en' ? ', ' : '، ';
    const dayPrefix = lang === 'en' ? '' : 'يوم ';
    const dayLabel = lang === 'en' ? dayName : `يوم ${dayName}`;
    const daysUnit = lang === 'en' ? ' days' : ' يوم';

    // التاريخ الهجري مع اليوم
    document.getElementById('hijri-today-day').textContent = dayLabel;
    document.getElementById('hijri-today-full').textContent = `${hijri.day} ${monthName}`;
    document.getElementById('hijri-today-year').textContent = `${hijri.year}${hSfxH}`;

    // التاريخ الميلادي مع اليوم
    document.getElementById('hijri-today-greg').textContent =
        `${dayName}${sepH}${now.getDate()} ${gMonths[now.getMonth()]} ${now.getFullYear()}${gSfxH}`;

    document.getElementById('hijri-month-name').textContent = monthName;
    document.getElementById('hijri-month-days').textContent =
        HijriDate.getDaysInHijriMonth(hijri.year, hijri.month) + daysUnit;
    document.getElementById('hijri-year-info').textContent = hijri.year + hSfxH;
    document.getElementById('hijri-leap').textContent =
        HijriDate.isHijriLeapYear(hijri.year)
            ? ((typeof t === 'function') ? t('misc.yes') : 'نعم') + ' ✓'
            : ((typeof t === 'function') ? t('misc.no') : 'لا') + ' ✗';
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

    // تعيين التاريخ الحالي
    const now = new Date();
    document.getElementById('conv-g-day').value = now.getDate();
    document.getElementById('conv-g-month').value = now.getMonth() + 1;
    document.getElementById('conv-g-year').value = now.getFullYear();

    const hijri = HijriDate.getToday();
    document.getElementById('conv-h-day').value = hijri.day;
    document.getElementById('conv-h-month').value = hijri.month;
    document.getElementById('conv-h-year').value = hijri.year;

    convertToHijri();
    convertToGreg();
}

function switchConverter(type) {
    document.querySelectorAll('.converter-tab').forEach(t => t.classList.remove('active'));
    if (type === 'to-hijri') {
        document.getElementById('converter-to-hijri').style.display = 'block';
        document.getElementById('converter-to-greg').style.display = 'none';
        document.querySelectorAll('.converter-tab')[0].classList.add('active');
    } else {
        document.getElementById('converter-to-hijri').style.display = 'none';
        document.getElementById('converter-to-greg').style.display = 'block';
        document.querySelectorAll('.converter-tab')[1].classList.add('active');
    }
}

function convertToHijri() {
    const day = parseInt(document.getElementById('conv-g-day').value) || 1;
    const month = parseInt(document.getElementById('conv-g-month').value) || 1;
    const year = parseInt(document.getElementById('conv-g-year').value) || 2026;

    const hijri = HijriDate.toHijri(year, month, day);
    const monthName = HijriDate.hijriMonths[hijri.month - 1];
    const hSfxC = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
    document.getElementById('conv-hijri-result').textContent =
        `${hijri.day} ${monthName} ${hijri.year}${hSfxC}`;
}

function convertToGreg() {
    const day = parseInt(document.getElementById('conv-h-day').value) || 1;
    const month = parseInt(document.getElementById('conv-h-month').value) || 1;
    const year = parseInt(document.getElementById('conv-h-year').value) || 1447;

    const greg = HijriDate.toGregorian(year, month, day);
    const monthName = HijriDate.gregorianMonths[greg.month - 1];
    const gSfxC = (typeof t === 'function') ? t('date.greg_suffix') : ' م';
    document.getElementById('conv-greg-result').textContent =
        `${greg.day} ${monthName} ${greg.year}${gSfxC}`;
}

// ========= التقويم الهجري =========
function renderCalendar() {
    const calendar = HijriDate.getHijriCalendar(calendarYear, calendarMonth);
    const monthName = HijriDate.hijriMonths[calendarMonth - 1];

    const hSfxCal = (typeof t === 'function') ? t('date.hijri_suffix') : ' هـ';
    document.getElementById('calendar-title').textContent =
        `${monthName} ${calendarYear}${hSfxCal}`;

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
