/**
 * خوارزمية حساب مواقيت الصلاة
 * مبنية على المكتبة الرسمية PrayTimes.js - Hamid Zarrabi-Zadeh
 * praytimes.org | GNU LGPL v3.0
 *
 * الفرق عن الإصدار السابق:
 * - الميل الشمسي يُحسب عند وقت كل صلاة (وليس عند الظهر فقط)
 * - حسابات تكرارية (iterative) لضمان الدقة
 * - تثبيت cosV في [-1,1] لتجنب NaN عند العروض الجغرافية العالية
 */

const PrayerTimes = (function () {

    // ====== أدوات رياضية ======
    function dtr(d) { return d * Math.PI / 180; }
    function rtd(r) { return r * 180 / Math.PI; }
    function fixAngle(a) { return fix(a, 360); }
    function fixHour(a)  { return fix(a, 24);  }
    function fix(a, b)   { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; }

    // ====== التاريخ اليولياني ======
    function julianDate(y, m, d) {
        if (m <= 2) { y--; m += 12; }
        var A = Math.floor(y / 100);
        var B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (y + 4716)) +
               Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
    }

    // ====== موضع الشمس (يُستدعى بـ jd+t/24 لكل صلاة على حدة) ======
    function sunPosition(jd) {
        var D = jd - 2451545.0;
        var g = fixAngle(357.529 + 0.98560028 * D);
        var q = fixAngle(280.459 + 0.98564736 * D);
        var L = fixAngle(q + 1.915 * Math.sin(dtr(g)) + 0.020 * Math.sin(dtr(2 * g)));
        var e = 23.439 - 0.00000036 * D;
        var RA = rtd(Math.atan2(Math.cos(dtr(e)) * Math.sin(dtr(L)), Math.cos(dtr(L)))) / 15;
        return {
            declination: rtd(Math.asin(Math.sin(dtr(e)) * Math.sin(dtr(L)))),
            equation:    q / 15 - fixHour(RA)
        };
    }

    function sunDeclination(jd) { return sunPosition(jd).declination; }
    function equationOfTime(jd) { return sunPosition(jd).equation; }

    // ====== منتصف النهار الشمسي (الظهر الحقيقي) ======
    function midDay(t, jd) {
        return fixHour(12 - equationOfTime(jd + t / 24));
    }

    // ====== الوقت الذي تكون فيه الشمس عند زاوية معينة تحت الأفق ======
    // direction: 'ccw' = قبل الظهر (فجر/شروق) | 'cw' = بعد الظهر (غروب/عشاء)
    function sunAngleTime(angle, t, lat, jd, direction) {
        var decl = sunDeclination(jd + t / 24);
        var noon = midDay(t, jd);
        var cosV = (-Math.sin(dtr(angle)) - Math.sin(dtr(decl)) * Math.sin(dtr(lat))) /
                   ( Math.cos(dtr(decl)) * Math.cos(dtr(lat)));
        cosV = Math.min(1, Math.max(-1, cosV)); // تجنب NaN عند العروض العالية
        var V = rtd(Math.acos(cosV)) / 15;
        return noon + (direction === 'ccw' ? -V : V);
    }

    // ====== وقت العصر ======
    function asrTime(factor, t, lat, jd) {
        var decl  = sunDeclination(jd + t / 24);
        var angle = -rtd(Math.atan(1 / (factor + Math.tan(dtr(Math.abs(lat - decl))))));
        return sunAngleTime(angle, t, lat, jd, 'cw');
    }

    // زاوية الشروق/الغروب (0.833° تشمل الانكسار الجوي وقطر الشمس)
    function riseSetAngle() { return 0.833; }

    // ====== طرق الحساب ======
    const methods = {
        'MWL':       { name: 'رابطة العالم الإسلامي',                     fajr: 18,   isha: 17       },
        'ISNA':      { name: 'أمريكا الشمالية (ISNA)',                     fajr: 15,   isha: 15       },
        'Egypt':     { name: 'الهيئة المصرية العامة للمساحة',              fajr: 19.5, isha: 17.5     },
        'Makkah':    { name: 'أم القرى - مكة المكرمة',                    fajr: 18.5, isha: '90 min' },
        'Karachi':   { name: 'جامعة العلوم الإسلامية - كراتشي',            fajr: 18,   isha: 18       },
        'Tehran':    { name: 'معهد الجيوفيزياء - طهران',   fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'Jafari' },
        'Jafari':    { name: 'المذهب الجعفري',              fajr: 16,   isha: 14, maghrib: 4,   midnight: 'Jafari' },
        'Gulf':      { name: 'دول الخليج',                                 fajr: 19.5, isha: '90 min' },
        'Kuwait':    { name: 'الكويت',                                     fajr: 18,   isha: 17.5     },
        'Qatar':     { name: 'قطر',                                        fajr: 18,   isha: '90 min' },
        'Singapore': { name: 'سنغافورة / إندونيسيا',                      fajr: 20,   isha: 18       },
        'Turkey':    { name: 'تركيا - ديانت',                              fajr: 18,   isha: 17       },
        'France':    { name: 'اتحاد المنظمات الإسلامية في فرنسا (UIOF)',  fajr: 12,   isha: 12       },
        'Russia':    { name: 'روسيا',                                      fajr: 16,   isha: 15       },
    };

    let config = {
        method:     'Makkah',
        asrMethod:  'Shafi',
        highLats:   'NightMiddle',
        timeFormat: '12h',
        adjustment: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
    };

    // ====== تعديل العروض الجغرافية العالية ======
    function nightPortion(angle, night) {
        if (config.highLats === 'AngleBased') return angle / 60 * night;
        if (config.highLats === 'OneSeventh') return night / 7;
        return night / 2; // NightMiddle (افتراضي)
    }

    function adjustHighLat(time, base, angle, night, dir) {
        var portion = nightPortion(angle, night);
        var diff = dir === 'ccw' ? fixHour(base - time) : fixHour(time - base);
        if (isNaN(time) || diff > portion)
            time = base + (dir === 'ccw' ? -portion : portion);
        return time;
    }

    // ====== تنسيق الوقت ======
    function formatTime(hours, fmt) {
        if (isNaN(hours)) return '--:--';
        hours = fixHour(hours);
        var h = Math.floor(hours);
        var m = Math.floor((hours - h) * 60 + 0.5);
        if (m >= 60) { m = 0; h = (h + 1) % 24; }
        var hS = String(h).padStart(2, '0');
        var mS = String(m).padStart(2, '0');
        if (fmt === '24h') return hS + ':' + mS;
        var isEn = (typeof getCurrentLang === 'function') && getCurrentLang() === 'en';
        var period = isEn ? (h >= 12 ? 'PM' : 'AM') : (h >= 12 ? 'م' : 'ص');
        var h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return String(h12).padStart(2, '0') + ':' + mS + ' ' + period;
    }

    // ====== الحساب الرئيسي ======
    function computeAllTimes(date, lat, lng, timezone) {
        var m  = methods[config.method] || methods['Makkah'];
        var af = config.asrMethod === 'Hanafi' ? 2 : 1;

        // التاريخ اليولياني مضبوطاً على خط الطول
        var jd = julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
                 - lng / (15 * 24);

        // تقديرات ابتدائية بالساعات
        var t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, maghrib: 18, isha: 18 };

        // دورتان تكراريتان: كل دورة تُحسّن دقة الوقت السابق
        for (var iter = 0; iter < 2; iter++) {
            t.dhuhr   = midDay(t.dhuhr, jd);
            t.sunrise = sunAngleTime(riseSetAngle(), t.sunrise, lat, jd, 'ccw');
            t.fajr    = sunAngleTime(m.fajr,         t.fajr,   lat, jd, 'ccw');
            t.asr     = asrTime(af, t.asr, lat, jd);
            t.sunset  = sunAngleTime(riseSetAngle(), t.sunset,  lat, jd, 'cw');
            t.maghrib = typeof m.maghrib === 'number'
                ? t.sunset + m.maghrib / 60            // دقائق بعد الغروب (طهران/جعفري)
                : t.sunset;                            // = وقت الغروب
            t.isha    = typeof m.isha === 'string'
                ? t.maghrib + parseInt(m.isha) / 60    // دقائق بعد المغرب (أم القرى/قطر/خليج)
                : sunAngleTime(m.isha, t.isha, lat, jd, 'cw');
        }

        // تحويل إلى التوقيت المحلي للمدينة
        var offset = timezone - lng / 15;
        var raw = {};
        for (var k in t) raw[k] = t[k] + offset;

        // تعديل العروض الجغرافية العالية
        var night = fixHour(raw.sunrise + 24 - raw.sunset);
        raw.fajr = adjustHighLat(raw.fajr, raw.sunrise, m.fajr, night, 'ccw');
        if (typeof m.isha !== 'string')
            raw.isha = adjustHighLat(raw.isha, raw.sunset, m.isha, night, 'cw');

        // التعديلات اليدوية بالدقائق
        for (var p in config.adjustment) {
            if (raw[p] !== undefined) raw[p] += (config.adjustment[p] || 0) / 60;
        }

        // بناء النتيجة
        var result = {};
        ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'sunset'].forEach(function (key) {
            result[key] = formatTime(raw[key], config.timeFormat);
        });
        result.raw = raw;
        return result;
    }

    // ====== الصلاة التالية ======
    function getNextPrayer(times, timezone) {
        var now = new Date();
        var localOffset = -now.getTimezoneOffset() / 60;
        var tz = (timezone !== undefined && !isNaN(timezone)) ? timezone : localOffset;
        var cityTime = new Date(now.getTime() + (tz - localOffset) * 3600000);
        var currentMinutes = cityTime.getHours() * 60 + cityTime.getMinutes();

        var prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
        var names   = {
            fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر',
            asr:  'العصر', maghrib: 'المغرب', isha:  'العشاء'
        };

        for (var i = 0; i < prayers.length; i++) {
            var pr = prayers[i];
            var pm = Math.floor(fixHour(times.raw[pr]) * 60);
            if (pm > currentMinutes) {
                var diff = pm - currentMinutes;
                var h = Math.floor(diff / 60), mm = diff % 60;
                return { key: pr, name: names[pr],
                    remaining: (h > 0 ? h + ' ساعة و ' : '') + mm + ' دقيقة',
                    remainingMinutes: diff };
            }
        }
        // بعد العشاء → فجر الغد
        var fm   = Math.floor(fixHour(times.raw.fajr) * 60);
        var diff = (24 * 60 - currentMinutes) + fm;
        var h = Math.floor(diff / 60), mm = diff % 60;
        return { key: 'fajr', name: names.fajr,
            remaining: (h > 0 ? h + ' ساعة و ' : '') + mm + ' دقيقة',
            remainingMinutes: diff };
    }

    // ====== الواجهة العامة ======
    return {
        methods,
        setMethod(m)     { config.method     = m; },
        setAsrMethod(m)  { config.asrMethod  = m; },
        setTimeFormat(f) { config.timeFormat  = f; },
        setHighLats(m)   { config.highLats   = m; },
        setAdjustment(a) { config.adjustment = { ...config.adjustment, ...a }; },
        getConfig()      { return { ...config }; },

        getTimes(date, lat, lng, timezone) {
            return computeAllTimes(date, lat, lng, timezone);
        },
        getTimesByAddress(date, lat, lng) {
            return computeAllTimes(date, lat, lng, -date.getTimezoneOffset() / 60);
        },
        getNextPrayer
    };
})();
