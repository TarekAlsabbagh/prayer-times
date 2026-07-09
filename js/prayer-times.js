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
        // TURKEY-DIYANET-TEMKIN-APPLY-1 (2026-07-05, PRAYER-TR-DIYANET-TEMKIN-1):
        //   The raw 18°/17° angles are Diyanet-correct, but Diyanet's published
        //   tables (namazvakitleri.diyanet.gov.tr — what Google shows for Turkey)
        //   add a fixed "temkin/ihtiyat" precaution on top. Without it our Turkey
        //   output == raw MWL: İmsak/Fajr + Yatsı/Isha already matched Diyanet to
        //   the minute (Diyanet dropped their temkin on those two in 1983), but
        //   sunrise ran ~7 min late and dhuhr/asr/maghrib ~5-7 min early.
        //   Verified against the OFFICIAL Diyanet site + aladhan method 13 across
        //   Istanbul/Ankara/Izmir/Bursa/Konya × summer/winter/autumn/Ramadan:
        //   sunrise -7, dhuhr +5, maghrib +7 are city- and season-stable to the
        //   minute; fajr/isha stay 0 (they already match Diyanet). Asr carries a
        //   genuine ±1-2 min SEASONAL temkin drift (offset ranges +2..+5), so +4
        //   is the best fixed value (mean |err| ≈ 0.9, max 2). Raw academic angles
        //   preserved; the minute tune is applied via `adj` inside computeAllTimes
        //   (before the user's per-card adjustment), exactly like JAKIM/MoroccoAwqaf.
        'Turkey':    { name: 'تركيا - ديانت', fajr: 18, isha: 17,
                       adj: { sunrise: -7, dhuhr: 5, asr: 4, maghrib: 7 } },
        'France':    { name: 'اتحاد المنظمات الإسلامية في فرنسا (UIOF)',  fajr: 12,   isha: 12       },
        'Russia':    { name: 'روسيا',                                      fajr: 16,   isha: 15       },
        // COUNTRY-SPECIFIC-CALC-METHODS-1 (2026-05-26):
        //   3 new country-specific authorities (defaults wired in app.js
        //   _AUTO_METHOD_BY_CC). Angles below come from the published
        //   conventions of the respective authorities — NOT guessed:
        //   • JAKIM (Malaysia) — Jabatan Kemajuan Islam Malaysia.
        //     Official: Fajr 20°, Isha 18° (matches the broader SEA
        //     convention shared with Singapore/Indonesia).
        //   • KemenagJakarta (Indonesia) — Kementerian Agama RI,
        //     Jakarta Pusat reference. Official: Fajr 20°, Isha 18°.
        //   • MoroccoAwqaf (Morocco) — Ministry of Awqaf & Islamic
        //     Affairs (وزارة الأوقاف والشؤون الإسلامية). The Habous
        //     publishes Fajr 18°, Isha 17° (numerically equal to MWL
        //     but kept as a distinct entry so the UI + analytics can
        //     attribute the choice to the Moroccan authority).
        // MALAYSIA-JAKIM-IHTIYAT-APPLY-1 (2026-05-26):
        //   JAKIM's published e-solat.gov.my tables add an "ihtiyat" (احتياط
        //   = precaution-minutes) to the raw 20°/18° angles. The convention
        //   used by Google, e-solat, and mosque schedules across Malaysia is:
        //     Fajr +10 · Dhuhr +1 · Asr +1 · Maghrib +1 · Isha +1
        //     Sunrise +0 (astronomical, no precaution applied)
        //   Stored as `adj` and applied inside computeAllTimes BEFORE the
        //   user's per-card config.adjustment, so the user can still tweak
        //   on top. Picking JAKIM manually for any other country also gets
        //   the ihtiyat — per user spec the JAKIM dropdown entry now means
        //   "the table values" not "the raw angle".
        'JAKIM': {
            name: 'ماليزيا - جاكيم (JAKIM)',
            fajr: 20, isha: 18,
            adj: { fajr: 10, sunrise: 0, dhuhr: 1, asr: 1, maghrib: 1, isha: 1 }
        },
        'KemenagJakarta':   { name: 'إندونيسيا - وزارة الشؤون الدينية (Kemenag) جاكرتا', fajr: 20, isha: 18 },
        // MOROCCO-AWQAF-FAJR-ADJUST-APPLY-1 (2026-05-26):
        //   Per MOROCCO-AWQAF-VERIFY-1 (counter-test #2): adding a -6 min
        //   Fajr adjustment to the raw 18°/17° angles makes the project's
        //   Rabat Fajr match Google's "Ministry of Islamic Affairs, Morocco"
        //   value EXACTLY (Fajr 04:33 instead of 04:39). Other 5 prayers
        //   were already 0–1 min from Google (Sunrise/Dhuhr/Maghrib/Isha
        //   exact, Asr -1 min rounding noise) — the angle is correct, only
        //   the Fajr publishing convention adds an ihtiyat-style offset
        //   in the Habous Ministry's tables. Mirrors the JAKIM ihtiyat
        //   pattern: raw academic angles preserved, table-style minute
        //   adjustment applied via `adj`. Adjustment is Fajr-only.
        'MoroccoAwqaf': {
            name: 'المغرب - وزارة الأوقاف والشؤون الإسلامية',
            fajr: 18, isha: 17,
            adj: { fajr: -6 }
        },
    };

    let config = {
        method:     'Makkah',
        asrMethod:  'Shafi',
        highLats:   'AngleBased',
        timeFormat: '12h',
        adjustment: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
    };

    // ====== تعديل العروض الجغرافية العالية ======
    function nightPortion(angle, night) {
        if (config.highLats === 'AngleBased') return angle / 60 * night;
        if (config.highLats === 'OneSeventh') return night / 7;
        return night / 2; // NightMiddle (افتراضي)
    }

    // هل تبلغ الشمس زاوية العرض العالي فعلاً في هذا اليوم/الموقع؟
    // PRAYER-DE-GERMANY-FAJR-ISHA-HYBRID-HIGHLAT-FIX-1: نفس صيغة cosV المستخدمة في sunAngleTime
    // لكن *قبل* القصّ إلى [-1,1]. إذا كان |cosV| <= 1 فالزاوية تُبلَغ (يوجد وقت فلكي حقيقي للفجر/
    // العشاء)؛ وإلا فلا تُبلَغ (الشمس لا تنزل لتلك الزاوية أصلاً — شائع في العرض العالي صيفاً).
    function angleReachable(angle, t, lat, jd) {
        var decl = sunDeclination(jd + t / 24);
        var cosV = (-Math.sin(dtr(angle)) - Math.sin(dtr(decl)) * Math.sin(dtr(lat))) /
                   ( Math.cos(dtr(decl)) * Math.cos(dtr(lat)));
        return Math.abs(cosV) <= 1;
    }

    // PRAYER-DE-FRANKFURT-ISHA-MARGIN-THRESHOLD-FIX-1: كم درجةً تنزل الشمس تحت الزاوية عند أدنى
    // ارتفاع لها (منتصف الليل الشمسي) = |minSunAlt| − angle.  ≥0 ⟺ الزاوية تُبلَغ؛ وكلما صغُر الهامش
    // اقترب وقتُ الزاوية الحقيقي من منتصف الليل الشمسي ⇒ عشاء متأخّر غير مستقر (Frankfurt 17° هامش
    // +0.5° ⇒ Isha 00:47). minSunAlt = ارتفاع الشمس عند القرين الأدنى.
    function angleMargin(angle, t, lat, jd) {
        var decl = sunDeclination(jd + t / 24);
        var minAlt = rtd(Math.asin(Math.sin(dtr(lat)) * Math.sin(dtr(decl)) -
                                   Math.cos(dtr(lat)) * Math.cos(dtr(decl))));
        return -minAlt - angle; // درجات تحت الزاوية (>0 = تُبلَغ بهامش، <0 = لا تُبلَغ)
    }

    function adjustHighLat(time, base, angle, night, dir, reached, margin) {
        // PRAYER-DE-GERMANY-FAJR-ISHA-HYBRID-HIGHLAT-FIX-1 (DE-only, عبر setHighLats('DEHybrid')):
        //   • إذا تُبلَغ الزاوية فعلاً  → استخدم وقت الزاوية الحقيقي بلا قصّ (يطابق Google في جنوب
        //     ألمانيا؛ يتجنّب القصّ الزائد لـ AngleBased الذي كان يؤخّر الفجر/يقدّم العشاء).
        //   • إذا لا تُبلَغ الزاوية      → استخدم قصّ AngleBased المنتشر (يطابق المراجع المنتشرة في
        //     شمال ألمانيا؛ يتجنّب انهيار NightMiddle إلى منتصف الليل الشمسي حيث Fajr≈Isha≈01:xx).
        //   يُقرَّر لكل صلاة (فجر/عشاء) على حدة عبر `reached` (يعالج المدن المختلطة مثل Frankfurt).
        //   كل الدول الأخرى تمرّ عبر المنطق الأصلي أدناه دون تغيير (config.highLats !== 'DEHybrid').
        // PRAYER-DE-FRANKFURT-ISHA-MARGIN-THRESHOLD-FIX-1: للعشاء فقط (dir==='cw') عتبة هامش إضافية —
        //   إن كانت زاوية 17° تُبلَغ لكن *بالكاد* (هامش < DE_ISHA_MIN_MARGIN) فوقتها الحقيقي يتكدّس نحو
        //   منتصف الليل الشمسي (Frankfurt 00:47) ⇒ استخدم AngleBased fallback (≈23:48، يطابق المراجع
        //   السائدة). الفجر (dir==='ccw') يبقى على البلوغ وحده بلا عتبة (هامش Heilbronn للفجر 18° = +0.4°
        //   فقط، ويجب أن يبقى real → 02:06). Heilbronn/Stuttgart Isha هامشهما ≥ العتبة ⇒ يبقيان real.
        if (config.highLats === 'DEHybrid') {
            var DE_ISHA_MIN_MARGIN = 1.0; // درجة — Frankfurt(+0.5)<العتبة⇒fallback؛ Heilbronn(+1.4)/Stuttgart(+1.8)≥⇒real
            var useReal = (dir === 'cw')
                ? (reached && margin >= DE_ISHA_MIN_MARGIN)   // العشاء: يتطلّب هامشًا كافيًا
                : reached;                                    // الفجر: البلوغ وحده (بلا عتبة)
            if (useReal) return time;                         // وقت الزاوية الحقيقي (بلا قصّ)
            var p = angle / 60 * night;                       // AngleBased fallback
            return base + (dir === 'ccw' ? -p : p);
        }
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
        var _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        var useLatin = (_lng !== 'ar');
        var period = useLatin ? (h >= 12 ? 'PM' : 'AM') : (h >= 12 ? 'م' : 'ص');
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
        // PRAYER-DE-GERMANY-FAJR-ISHA-HYBRID-HIGHLAT-FIX-1: كشف بلوغ الزاوية لكل صلاة على حدة
        // (يُستخدم فقط في مسار 'DEHybrid'؛ يُتجاهل في كل القواعد الأخرى فلا يغيّر أي دولة).
        raw.fajr = adjustHighLat(raw.fajr, raw.sunrise, m.fajr, night, 'ccw',
                                 angleReachable(m.fajr, t.fajr, lat, jd), angleMargin(m.fajr, t.fajr, lat, jd));
        if (typeof m.isha !== 'string')
            raw.isha = adjustHighLat(raw.isha, raw.sunset, m.isha, night, 'cw',
                                     angleReachable(m.isha, t.isha, lat, jd), angleMargin(m.isha, t.isha, lat, jd));

        // MALAYSIA-JAKIM-IHTIYAT-APPLY-1 (2026-05-26):
        //   Method-level "ihtiyat" adjustments (e.g. JAKIM's published-table
        //   precaution-minutes). Applied BEFORE the user's per-card overrides
        //   so the user can still nudge on top if they want. Methods without
        //   `adj` skip this block (typeof m.adj === 'undefined' → no-op).
        if (m.adj) {
            for (var ap in m.adj) {
                if (raw[ap] !== undefined) raw[ap] += (m.adj[ap] || 0) / 60;
            }
        }

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
        // استخدام الثواني لدقة أعلى وتجنب تخطي الصلاة في نفس الدقيقة
        var currentSeconds = cityTime.getHours() * 3600 + cityTime.getMinutes() * 60 + cityTime.getSeconds();

        // NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1 (2026-06-01):
        // Sunrise (الشروق) is a falaki marker, NOT a fard prayer. The
        // "next prayer" semantic across the app (sticky bar, banner, csl,
        // hero, time-left page, home pill, etc.) must skip sunrise — it
        // should never appear as "القادمة: الشروق". Matches the existing
        // policy in getCurrentPrayer() below (line ~289) which already
        // uses the same 5-prayer list. Sunrise time data itself remains
        // available via times.raw.sunrise + currentPrayerTimes.sunrise
        // for the day's prayer-times table display.
        var prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        var names   = {
            fajr: 'الفجر', dhuhr: 'الظهر',
            asr:  'العصر', maghrib: 'المغرب', isha:  'العشاء'
        };

        for (var i = 0; i < prayers.length; i++) {
            var pr = prayers[i];
            var ps = Math.floor(fixHour(times.raw[pr]) * 3600);
            if (ps > currentSeconds) {
                var diff = Math.round((ps - currentSeconds) / 60);
                var h = Math.floor(diff / 60), mm = diff % 60;
                return { key: pr, name: names[pr],
                    remaining: (h > 0 ? h + ' ساعة و ' : '') + mm + ' دقيقة',
                    remainingMinutes: diff };
            }
        }
        // بعد العشاء → فجر الغد
        var fs   = Math.floor(fixHour(times.raw.fajr) * 3600);
        var diff = Math.round((86400 - currentSeconds + fs) / 60);
        var h = Math.floor(diff / 60), mm = diff % 60;
        return { key: 'fajr', name: names.fajr,
            remaining: (h > 0 ? h + ' ساعة و ' : '') + mm + ' دقيقة',
            remainingMinutes: diff };
    }

    // ====== الصلاة الحاليّة (Round 22 + R23 sunrise polish) ======
    // تُعيد الصلاة الأخيرة التي بدأت (بمعنى: الوقت الحاليّ ضمن نافذتها).
    // إن كنّا قبل الفجر → نُعيد عشاء اليوم السابق (key = 'isha').
    // إن كنّا بعد الشروق وقبل الظهر → نُعيد pseudo "sunrise" (ليس صلاة مفروضة).
    function getCurrentPrayer(times, timezone) {
        var now = new Date();
        var localOffset = -now.getTimezoneOffset() / 60;
        var tz = (timezone !== undefined && !isNaN(timezone)) ? timezone : localOffset;
        var cityTime = new Date(now.getTime() + (tz - localOffset) * 3600000);
        var currentSeconds = cityTime.getHours() * 3600 + cityTime.getMinutes() * 60 + cityTime.getSeconds();

        // نستخدم فقط صلوات "الفجر، الظهر، العصر، المغرب، العشاء" (الشروق ليس صلاة مفروضة)
        var prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        var names   = {
            fajr: 'الفجر', dhuhr: 'الظهر',
            asr:  'العصر', maghrib: 'المغرب', isha:  'العشاء'
        };

        var last = null;
        for (var i = 0; i < prayers.length; i++) {
            var pr = prayers[i];
            var ps = Math.floor(fixHour(times.raw[pr]) * 3600);
            if (ps <= currentSeconds) {
                last = { key: pr, name: names[pr], startSeconds: ps };
            }
        }
        // قبل الفجر → الصلاة الحاليّة هي عشاء البارحة
        // R36: نُرجِع startSeconds (وقت بدء عشاء أمس بقيمة اليوم — التغيّر اليوميّ < دقيقة)
        // ليتمكّن updatePrayerProgress من حساب الـpct أثناء الفترة بين العشاء والفجر.
        // wrap-around: currentSeconds < ishaStart → الـ consumer يضيف 86400 للحصول على elapsed صحيح.
        if (!last) {
            var ishaStartSeconds = (times.raw && typeof times.raw.isha === 'number')
                ? Math.floor(fixHour(times.raw.isha) * 3600) : undefined;
            return { key: 'isha', name: names.isha, beforeFajr: true, startSeconds: ishaStartSeconds };
        }
        // R23: إن كنّا في نافذة "بعد الشروق وقبل الظهر" → علامة خاصّة (ليست صلاة)
        if (last.key === 'fajr' && times.raw.sunrise !== undefined) {
            var sunriseSeconds = Math.floor(fixHour(times.raw.sunrise) * 3600);
            if (currentSeconds >= sunriseSeconds) {
                return { key: 'sunrise', name: 'الشروق', afterSunrise: true, notAPrayer: true };
            }
        }
        return last;
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
        getNextPrayer,
        getCurrentPrayer
    };
})();

// SSR/Node.js compatibility — exports the PrayerTimes module to Node without
//   breaking the browser. In the browser `module` is undefined, so the typeof
//   guard short-circuits and PrayerTimes remains a window-attached const.
//   In Node.js, server.js can `require('./js/prayer-times.js')` to compute
//   times during SSR (kills the "--:--" placeholder seen by Googlebot).
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrayerTimes;
}
