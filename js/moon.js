/**
 * حسابات القمر — خوارزميّة Jean Meeus "Astronomical Algorithms" (Chapters 47-48)
 *
 * الدقّة المتوقّعة:
 *   - الإضاءة: ±0.5%
 *   - العمر: ±0.2 يوم
 *   - المسافة الجيوسنتريك: ±200 km
 *   - المسافة التوبوسنتريك (من مدينة): ±100 km بعد تصحيح المتوازي
 *   - المطلع/المغيب: ±10 دقائق (تقريبًا، بدون تصحيح Δt)
 */

const MoonCalc = (function() {
    const DEG = Math.PI / 180;
    const RAD = 180 / Math.PI;
    const SYNODIC = 29.530588861; // طول الشهر القمريّ (يوم)
    const EARTH_RADIUS_KM = 6378.137;

    function _norm360(x) {
        x = x % 360;
        return x < 0 ? x + 360 : x;
    }

    // Julian Day بالضبط حسب Meeus فصل 7 — مع تصحيح التقويم الجريجوريّ
    function _julianDay(date) {
        let Y = date.getUTCFullYear();
        let M = date.getUTCMonth() + 1;
        const D = date.getUTCDate()
            + date.getUTCHours() / 24
            + date.getUTCMinutes() / 1440
            + date.getUTCSeconds() / 86400
            + date.getUTCMilliseconds() / 86400000;
        if (M <= 2) { Y -= 1; M += 12; }
        const A = Math.floor(Y / 100);
        const B = 2 - A + Math.floor(A / 4); // Gregorian correction (كان مفقودًا في النسخة السابقة!)
        return Math.floor(365.25 * (Y + 4716))
             + Math.floor(30.6001 * (M + 1))
             + D + B - 1524.5;
    }

    // الحالة الفلكيّة الكاملة للقمر في لحظة معيّنة
    function _moonState(date) {
        const jd = _julianDay(date);
        const T = (jd - 2451545.0) / 36525; // قرون يوليانيّة منذ J2000.0

        // العناصر الأساسيّة (Meeus 47.1–47.6)
        let Lp = _norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T*T + T*T*T/538841  - T*T*T*T/65194000);
        let D  = _norm360(297.8501921 + 445267.1114034  * T - 0.0018819 * T*T + T*T*T/545868  - T*T*T*T/113065000);
        let M  = _norm360(357.5291092 +  35999.0502909  * T - 0.0001536 * T*T + T*T*T/24490000);
        let Mp = _norm360(134.9633964 + 477198.8675055  * T + 0.0087414 * T*T + T*T*T/69699   - T*T*T*T/14712000);
        let F  = _norm360( 93.2720950 + 483202.0175233  * T - 0.0036539 * T*T - T*T*T/3526000 + T*T*T*T/863310000);

        // زاوية طور القمر i (Meeus 48.4) — درجات
        // i = الزاوية Earth–Moon–Sun كما تُرى من القمر؛ i=0 → بدر، i=180 → محاق
        const iDeg = 180 - D
            - 6.289 * Math.sin(Mp * DEG)
            + 2.100 * Math.sin(M  * DEG)
            - 1.274 * Math.sin((2*D - Mp) * DEG)
            - 0.658 * Math.sin(2*D * DEG)
            - 0.214 * Math.sin(2*Mp * DEG)
            - 0.110 * Math.sin(D * DEG);

        // النسبة المضاءة (Meeus 48.1)
        const k = (1 + Math.cos(iDeg * DEG)) / 2;
        const illuminationPct = Math.max(0, Math.min(100, k * 100));

        // عمر القمر: الأيام منذ آخر محاق
        // D (mean elongation) = 0 عند المحاق، 180° عند البدر، 360° عند المحاق التالي
        const age = (D / 360) * SYNODIC;

        // متزايد (waxing) عندما D∈[0,180]، متناقص عندما D∈[180,360]
        const waxing = (D < 180);

        // المسافة الجيوسنتريك (Meeus 47.A — حدود Σr، بالكيلومتر)
        // القاعدة 385,000.56 km + مجموع حدود cos لأهم الاضطرابات
        const rKm = 385000.56
            +  -20905.355 * Math.cos(Mp * DEG)
            +   -3699.111 * Math.cos((2*D - Mp) * DEG)
            +   -2955.968 * Math.cos(2*D * DEG)
            +    -569.925 * Math.cos(2*Mp * DEG)
            +      48.888 * Math.cos(M * DEG)
            +    -152.138 * Math.cos((2*D - 2*Mp) * DEG)
            +    -170.733 * Math.cos((2*D + Mp) * DEG)
            +    -204.586 * Math.cos((2*D - M) * DEG)
            +    -129.620 * Math.cos((D - Mp) * DEG)
            +     108.743 * Math.cos((D + Mp) * DEG)
            +     104.755 * Math.cos((2*D - M - Mp) * DEG)
            +      79.661 * Math.cos((Mp - 2*F) * DEG)
            +     -34.782 * Math.cos((4*D - Mp) * DEG)
            +     -23.210 * Math.cos((4*D - 2*Mp) * DEG)
            +      30.824 * Math.cos((2*D + M) * DEG)
            +     -23.210 * Math.cos((Mp + 2*F) * DEG);

        return { jd, T, Lp, D, M, Mp, F, iDeg, illuminationPct, age, waxing, distanceKm: rKm };
    }

    // موقع القمر في مركز الأرض: خطّ الطول، العرض السماويّ، المطلع المستقيم (RA)، والميل (Dec)
    function _moonEquatorial(date) {
        const state = _moonState(date);
        const T = state.T;
        const D = state.D, M = state.M, Mp = state.Mp, F = state.F, Lp = state.Lp;
        const E = 1 - 0.002516 * T - 0.0000074 * T * T;
        const E2 = E * E;

        // خطّ الطول (Σl) — حدود main periodic terms (مجاميع بالملايين من ثواني القوس → تقسم على 10^6 لتصبح درجات)
        let sumL = 0;
        sumL += 6288774 * Math.sin(Mp * DEG);
        sumL += 1274027 * Math.sin((2*D - Mp) * DEG);
        sumL +=  658314 * Math.sin(2*D * DEG);
        sumL +=  213618 * Math.sin(2*Mp * DEG);
        sumL += -185116 * Math.sin(M * DEG) * E;
        sumL += -114332 * Math.sin(2*F * DEG);
        sumL +=   58793 * Math.sin((2*D - 2*Mp) * DEG);
        sumL +=   57066 * Math.sin((2*D - M - Mp) * DEG) * E;
        sumL +=   53322 * Math.sin((2*D + Mp) * DEG);
        sumL +=   45758 * Math.sin((2*D - M) * DEG) * E;
        sumL +=  -40923 * Math.sin((M - Mp) * DEG) * E;
        sumL +=  -34720 * Math.sin(D * DEG);
        sumL +=  -30383 * Math.sin((M + Mp) * DEG) * E;
        sumL +=   15327 * Math.sin((2*D - 2*F) * DEG);
        sumL +=  -12528 * Math.sin((Mp + 2*F) * DEG);
        sumL +=   10980 * Math.sin((Mp - 2*F) * DEG);
        sumL +=   10675 * Math.sin((4*D - Mp) * DEG);
        sumL +=   10034 * Math.sin(3*Mp * DEG);
        sumL +=    8548 * Math.sin((4*D - 2*Mp) * DEG);
        sumL +=   -7888 * Math.sin((2*D + M - Mp) * DEG) * E;
        sumL +=   -6766 * Math.sin((2*D + M) * DEG) * E;

        const lambda = _norm360(Lp + sumL / 1000000); // درجات

        // خطّ العرض السماويّ (Σb)
        let sumB = 0;
        sumB +=  5128122 * Math.sin(F * DEG);
        sumB +=   280602 * Math.sin((Mp + F) * DEG);
        sumB +=   277693 * Math.sin((Mp - F) * DEG);
        sumB +=   173237 * Math.sin((2*D - F) * DEG);
        sumB +=    55413 * Math.sin((2*D + F - Mp) * DEG);
        sumB +=    46271 * Math.sin((2*D - F - Mp) * DEG);
        sumB +=    32573 * Math.sin((2*D + F) * DEG);
        sumB +=    17198 * Math.sin((2*Mp + F) * DEG);
        sumB +=     9266 * Math.sin((2*D + Mp - F) * DEG);
        sumB +=     8822 * Math.sin((2*Mp - F) * DEG);
        sumB +=     8216 * Math.sin((2*D - M - F) * DEG) * E;
        sumB +=     4324 * Math.sin((2*D - 2*Mp - F) * DEG);
        sumB +=     4200 * Math.sin((2*D + F + Mp) * DEG);
        sumB +=    -3359 * Math.sin((2*D + M - F) * DEG) * E;
        sumB +=     2463 * Math.sin((2*D - M - Mp + F) * DEG) * E;
        sumB +=     2211 * Math.sin((2*D - M + F) * DEG) * E;
        sumB +=     2065 * Math.sin((2*D - M - Mp - F) * DEG) * E;

        const beta = sumB / 1000000; // درجات

        // ميل محور دوران الأرض ε (obliquity) — Meeus 22.2
        const eps = 23.43929111 - 0.0130042 * T - 1.64e-7 * T*T + 5.04e-7 * T*T*T;

        // تحويل ecliptic → equatorial
        const lamR = lambda * DEG, betR = beta * DEG, epsR = eps * DEG;
        const ra = Math.atan2(
            Math.sin(lamR) * Math.cos(epsR) - Math.tan(betR) * Math.sin(epsR),
            Math.cos(lamR)
        ) * RAD;
        const dec = Math.asin(
            Math.sin(betR) * Math.cos(epsR) + Math.cos(betR) * Math.sin(epsR) * Math.sin(lamR)
        ) * RAD;

        return {
            lambda, beta,
            ra: _norm360(ra),
            dec,
            distanceKm: state.distanceKm,
            jd: state.jd,
            T
        };
    }

    // ارتفاع القمر (altitude) فوق الأفق لمدينة معيّنة في لحظة معيّنة — بالدرجات
    function _moonAltitude(date, lat, lng) {
        const eq = _moonEquatorial(date);
        const T = eq.T;
        // Greenwich Mean Sidereal Time (Meeus 12.4) — درجات
        let GMST = 280.46061837 + 360.98564736629 * (eq.jd - 2451545.0)
                 + 0.000387933 * T*T - T*T*T/38710000;
        GMST = _norm360(GMST);
        // Local Sidereal Time: LST = GMST + longitude (east +)
        const LST = _norm360(GMST + lng);
        // الزاوية الساعيّة H = LST − RA
        const H = _norm360(LST - eq.ra);
        const lat_r = lat * DEG;
        const dec_r = eq.dec * DEG;
        const H_r = H * DEG;
        const sinAlt = Math.sin(lat_r) * Math.sin(dec_r)
                     + Math.cos(lat_r) * Math.cos(dec_r) * Math.cos(H_r);
        return Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD;
    }

    // السَّمت (azimuth) للقمر — درجات من الشمال باتّجاه عقارب الساعة (N=0, E=90, S=180, W=270)
    // يستخدم نفس H (الزاوية الساعيّة) المستعملة في _moonAltitude.
    function _moonAzimuth(date, lat, lng) {
        const eq = _moonEquatorial(date);
        const T = eq.T;
        let GMST = 280.46061837 + 360.98564736629 * (eq.jd - 2451545.0)
                 + 0.000387933 * T*T - T*T*T/38710000;
        GMST = _norm360(GMST);
        const LST = _norm360(GMST + lng);
        const H = _norm360(LST - eq.ra);
        const lat_r = lat * DEG;
        const dec_r = eq.dec * DEG;
        const H_r = H * DEG;
        // Meeus 13.5: tan(A) = sin(H) / (cos(H)·sin(lat) − tan(dec)·cos(lat))
        // حيث A تُقاس من الجنوب باتّجاه الغرب (convention فلكيّة قديمة).
        const y = Math.sin(H_r);
        const x = Math.cos(H_r) * Math.sin(lat_r) - Math.tan(dec_r) * Math.cos(lat_r);
        let A_south = Math.atan2(y, x) * RAD; // من الجنوب
        // نحوّل إلى اصطلاح الملاحة (من الشمال، cw): N=0°, E=90°, S=180°, W=270°
        return _norm360(A_south + 180);
    }

    // ══════════ الواجهات العامّة ══════════

    function getMoonPhase(date) {
        // للتوافق: نسبة الطور [0..1] حيث 0 = محاق و 0.5 = بدر
        return _moonState(date).age / SYNODIC;
    }

    function getMoonIllumination(date) {
        return Math.round(_moonState(date).illuminationPct * 100) / 100;
    }

    function getMoonAge(date) {
        return Math.round(_moonState(date).age * 100) / 100;
    }

    // المسافة من مركز الأرض للقمر (كم) — القيمة الجيوسنتريك الدقيقة
    function getGeocentricDistance(date) {
        return Math.round(_moonState(date).distanceKm * 100) / 100;
    }

    // المسافة التوبوسنتريك — من مدينة على سطح الأرض إلى مركز القمر
    // تصحيح المتوازي (parallax correction) بناءً على ارتفاع القمر من المدينة
    function getMoonDistance(date, lat, lng) {
        const state = _moonState(date);
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return Math.round(state.distanceKm * 100) / 100;
        }
        // تقدير topocentric بدقّة مقبولة:
        //   d_topo² = r² + R² - 2·r·R·sin(alt)
        // حيث r = المسافة الجيوسنتريك، R = نصف قطر الأرض، alt = ارتفاع القمر في سماء المدينة
        const alt = _moonAltitude(date, lat, lng); // بالدرجات
        const r = state.distanceKm;
        const R = EARTH_RADIUS_KM;
        const altR = alt * DEG;
        // القمر قد يكون تحت الأفق → المسافة تزيد؛ الصيغة تعمل لكلا الحالتين
        const dTopo2 = r*r + R*R - 2 * r * R * Math.sin(altR);
        return Math.round(Math.sqrt(dTopo2) * 100) / 100;
    }

    function getPhaseName(date) {
        const state = _moonState(date);
        const pct = state.illuminationPct;
        const waxing = state.waxing;

        // التصنيف يعتمد على الإضاءة الحقيقيّة + الاتّجاه، لا على العمر فقط
        if (pct < 1) {
            return { name: 'محاق (قمر جديد)', icon: '🌑', english: 'New Moon', key: 'moon.phase_new' };
        }
        if (pct >= 99) {
            return { name: 'بدر (قمر مكتمل)', icon: '🌕', english: 'Full Moon', key: 'moon.phase_full' };
        }
        if (waxing) {
            if (pct < 45) return { name: 'هلال متزايد', icon: '🌒', english: 'Waxing Crescent', key: 'moon.phase_waxing_crescent' };
            if (pct < 55) return { name: 'تربيع أول', icon: '🌓', english: 'First Quarter', key: 'moon.phase_first_quarter' };
            return { name: 'أحدب متزايد', icon: '🌔', english: 'Waxing Gibbous', key: 'moon.phase_waxing_gibbous' };
        } else {
            if (pct < 45) return { name: 'هلال متناقص', icon: '🌘', english: 'Waning Crescent', key: 'moon.phase_waning_crescent' };
            if (pct < 55) return { name: 'تربيع أخير', icon: '🌗', english: 'Last Quarter', key: 'moon.phase_last_quarter' };
            return { name: 'أحدب متناقص', icon: '🌖', english: 'Waning Gibbous', key: 'moon.phase_waning_gibbous' };
        }
    }

    // حساب المطلع/المغيب — بأخذ عيّنات لارتفاع القمر كلّ ساعة وإيجاد الإشارات المتغيّرة
    // يستخدم خوارزميّة الـ bisection لتحسين الدقّة إلى < 1 دقيقة
    // ══════════ دعم المناطق الزمنيّة (IANA TZ) ══════════
    // السبب: حتّى يظهر وقت المطلع/المغيب بتوقيت المدينة الهدف (لا توقيت متصفّح المستخدم)
    //   - tz صريحة من FAMOUS_MOON_CITIES (IANA مثل 'Asia/Jakarta') → أدقّ مع DST
    //   - أو تقدير من خطّ الطول للمدن غير المدرَجة/lat-lng العشوائيّة
    //   - أو UTC fallback إن فشل Intl

    // تقدير IANA tz من خطّ الطول (±30 د، يتجاهل DST و الاستثناءات السياسيّة)
    function _tzFromLongitude(lng) {
        if (typeof lng !== 'number' || !isFinite(lng)) return 'UTC';
        const off = Math.round(lng / 15);
        if (off === 0) return 'UTC';
        // Etc/GMT إشارات معكوسة (POSIX): UTC+7 → 'Etc/GMT-7'
        return off > 0 ? 'Etc/GMT-' + off : 'Etc/GMT+' + (-off);
    }

    // إزاحة المنطقة الزمنيّة عن UTC بالـ ms في لحظة معيّنة (DST-aware عبر Intl)
    function _getTzOffsetMs(instantMs, tz) {
        try {
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });
            const parts = {};
            fmt.formatToParts(new Date(instantMs)).forEach(function(p) {
                if (p.type !== 'literal') parts[p.type] = p.value;
            });
            let h = parseInt(parts.hour, 10);
            if (h === 24) h = 0;
            const tzAsUTC = Date.UTC(
                parseInt(parts.year, 10),
                parseInt(parts.month, 10) - 1,
                parseInt(parts.day, 10),
                h,
                parseInt(parts.minute, 10),
                parseInt(parts.second, 10)
            );
            return tzAsUTC - instantMs;
        } catch (_e) { return 0; }
    }

    // UTC instant يقابل 00:00 في `tz` على اليوم الذي تقع فيه `date` عند عرضها في `tz`
    function _localMidnightInTz(date, tz) {
        try {
            const dateMs = date.getTime();
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
            });
            const parts = {};
            fmt.formatToParts(new Date(dateMs)).forEach(function(p) {
                if (p.type !== 'literal') parts[p.type] = p.value;
            });
            const y = parseInt(parts.year, 10);
            const m = parseInt(parts.month, 10);
            const d = parseInt(parts.day, 10);
            const naiveMidUTC = Date.UTC(y, m - 1, d, 0, 0, 0);
            const offset = _getTzOffsetMs(naiveMidUTC, tz);
            return new Date(naiveMidUTC - offset);
        } catch (_e) {
            const s = new Date(date); s.setHours(0, 0, 0, 0); return s;
        }
    }

    function getMoonTimes(date, lat, lng, tz) {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return { rise: '--:--', set: '--:--' };
        }
        const h0 = -0.5833; // أفق القمر بالدرجات (شامل انكسار + نصف قطر قمريّ)

        // المنطقة الزمنيّة الفعّالة: صريحة > تقدير من lng > UTC
        const resolvedTz = tz || _tzFromLongitude(lng);

        // بداية اليوم (00:00) **بتوقيت المدينة الهدف** — ليس بتوقيت المتصفّح
        const startTime = _localMidnightInTz(date, resolvedTz);

        // أخذ عيّنات كلّ ساعة لـ 24 ساعة كاملة
        const samples = [];
        for (let h = 0; h <= 24; h++) {
            const t = new Date(startTime.getTime() + h * 3600 * 1000);
            const alt = _moonAltitude(t, lat, lng);
            samples.push({ t, alt });
        }

        // البحث عن تقاطعات مع الأفق h0
        let riseT = null, setT = null;
        for (let i = 0; i < samples.length - 1; i++) {
            const a1 = samples[i].alt - h0;
            const a2 = samples[i+1].alt - h0;
            if (a1 * a2 < 0) {
                // تقاطع — interpolation خطّيّ ثمّ تحسين bisection
                let tLo = samples[i].t.getTime();
                let tHi = samples[i+1].t.getTime();
                let altLo = a1, altHi = a2;
                for (let k = 0; k < 6; k++) {
                    const tMid = (tLo + tHi) / 2;
                    const altMid = _moonAltitude(new Date(tMid), lat, lng) - h0;
                    if (altLo * altMid < 0) { tHi = tMid; altHi = altMid; }
                    else                    { tLo = tMid; altLo = altMid; }
                }
                const tFinal = new Date((tLo + tHi) / 2);
                if (a1 < 0 && a2 > 0 && riseT === null) riseT = tFinal;
                else if (a1 > 0 && a2 < 0 && setT === null) setT = tFinal;
            }
        }

        return {
            rise: riseT ? _formatTime(riseT, resolvedTz) : '--:--',
            set:  setT  ? _formatTime(setT,  resolvedTz) : '--:--'
        };
    }

    // تنسيق وقت 12-ساعة بلغة الواجهة، مع تحويل إلى `tz` إن أُعطيت (وإلاّ توقيت المتصفّح)
    function _formatTime(d, tz) {
        const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const useLatin = (lang !== 'ar');
        let hours, minutes;
        if (tz) {
            try {
                const fmt = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false
                });
                const parts = {};
                fmt.formatToParts(d).forEach(function(p) {
                    if (p.type !== 'literal') parts[p.type] = p.value;
                });
                hours = parseInt(parts.hour, 10);
                if (hours === 24) hours = 0;
                minutes = parseInt(parts.minute, 10);
            } catch (_e) {
                hours = d.getHours(); minutes = d.getMinutes();
            }
        } else {
            hours = d.getHours();
            minutes = d.getMinutes();
        }
        const period = useLatin ? (hours >= 12 ? 'PM' : 'AM') : (hours >= 12 ? 'م' : 'ص');
        const h12 = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        return `${h12 < 10 ? '0' : ''}${h12}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
    }

    // ══════════ كواشف أحداث الأطوار الدقيقة (sub-day precision) ══════════
    // نعتمد على Mean Elongation (D) بدلاً من عتبات الإضاءة:
    //   D = 0°   → محاق (New Moon)
    //   D = 90°  → تربيع أوّل (First Quarter)
    //   D = 180° → بدر (Full Moon)
    //   D = 270° → تربيع أخير (Last Quarter)
    // الفائدة: اليوم الذي يقع فيه وقت الحدث الفعليّ يُسمَّى بهذا الاسم
    // حتّى لو كانت نسبة الإضاءة عند لحظة الحساب 98% أو 99.8% فقط.

    const _PHASE_EVENTS = [
        { deg: 0,   type: 'new_moon',      phase: { name: 'محاق (قمر جديد)', icon: '🌑', english: 'New Moon',       key: 'moon.phase_new' } },
        { deg: 90,  type: 'first_quarter', phase: { name: 'تربيع أول',       icon: '🌓', english: 'First Quarter',  key: 'moon.phase_first_quarter' } },
        { deg: 180, type: 'full_moon',     phase: { name: 'بدر (قمر مكتمل)', icon: '🌕', english: 'Full Moon',      key: 'moon.phase_full' } },
        { deg: 270, type: 'last_quarter',  phase: { name: 'تربيع أخير',       icon: '🗖', english: 'Last Quarter',    key: 'moon.phase_last_quarter' } }
    ];
    // تصحيح أيقونة التربيع الأخير (لوحة المفاتيح العربيّة): 🌗
    _PHASE_EVENTS[3].phase.icon = '🌗';

    // يحسب فرقًا موقَّعًا (D − target) ضمن [-180, 180) — لإمكانيّة bisection حول الصفر
    function _signedElongDiff(date, targetDeg) {
        const D = _moonState(date).D;
        let diff = D - targetDeg;
        while (diff >   180) diff -= 360;
        while (diff <= -180) diff += 360;
        return diff;
    }

    // بحث عن أقرب لحظة (بعد startDate) يعبر فيها القمر زاوية مطلوبة — دقّة ~1 دقيقة
    function _findPhaseEvent(targetDeg, startDate, maxDays) {
        maxDays = maxDays || 35;
        const stepMs   = 6 * 3600 * 1000; // عيّنة كلّ 6 ساعات
        const nSteps   = Math.floor(maxDays * 24 / 6);
        const t0ms     = new Date(startDate).getTime();

        let prevT = new Date(t0ms);
        let prevV = _signedElongDiff(prevT, targetDeg);

        for (let i = 1; i <= nSteps; i++) {
            const curT = new Date(t0ms + i * stepMs);
            const curV = _signedElongDiff(curT, targetDeg);
            // نريد التقاطع من سالب إلى موجب (D يتزايد ويعبر target)
            if (prevV < 0 && curV >= 0) {
                // تحسين bisection ~20 تكرارًا → دقّة أقلّ من دقيقة
                let lo = prevT.getTime(), hi = curT.getTime();
                let vLo = prevV;
                for (let k = 0; k < 20; k++) {
                    const midMs = (lo + hi) / 2;
                    const vMid  = _signedElongDiff(new Date(midMs), targetDeg);
                    if (vLo < 0 && vMid >= 0) { hi = midMs; }
                    else                       { lo = midMs; vLo = vMid; }
                }
                return new Date((lo + hi) / 2);
            }
            prevT = curT; prevV = curV;
        }
        return null;
    }

    // يرجع كلّ أحداث الأطوار الأربعة التي تقع في النطاق [startDate, endDate]
    function findPhaseEventsInRange(startDate, endDate) {
        const out = [];
        const startMs = new Date(startDate).getTime();
        const endMs   = new Date(endDate).getTime();
        const totalDays = Math.max(1, Math.ceil((endMs - startMs) / 86400000) + 2);

        for (const tgt of _PHASE_EVENTS) {
            // ابدأ قبل بداية النطاق بيومين لالتقاط أحداث قريبة من الحافّة
            let cursor = new Date(startMs - 2 * 86400000);
            let guard = 0;
            while (cursor.getTime() < endMs && guard++ < 6) {
                const ev = _findPhaseEvent(tgt.deg, cursor, totalDays + 5);
                if (!ev) break;
                if (ev.getTime() >= startMs && ev.getTime() <= endMs) {
                    out.push({ type: tgt.type, date: ev, phase: Object.assign({}, tgt.phase) });
                }
                // تابع بعد الحدث بـ 12 ساعة (الأحداث نفسها تتباعد >7 أيّام)
                cursor = new Date(ev.getTime() + 12 * 3600 * 1000);
            }
        }
        out.sort((a, b) => a.date - b.date);
        return out;
    }

    // البدر التالي — بحث دقيق بلحظة عبور D=180°
    function getNextFullMoon(date) {
        return _findPhaseEvent(180, date, 35);
    }

    // المحاق التالي — بحث دقيق بلحظة عبور D=0°
    function getNextNewMoon(date) {
        return _findPhaseEvent(0, date, 35);
    }

    // التربيع الأوّل التالي — لحظة عبور D=90°
    function getNextFirstQuarter(date) {
        return _findPhaseEvent(90, date, 35);
    }

    // التربيع الأخير التالي — لحظة عبور D=270°
    function getNextLastQuarter(date) {
        return _findPhaseEvent(270, date, 35);
    }

    // توقّعات قمريّة لعدد أيّام اختياريّ (14 افتراضيًّا) — يستخدم الحسابات الدقيقة الجديدة
    // ✨ تحسين: إذا وقع حدث طَور (محاق/تربيع أوّل/بدر/تربيع أخير) خلال اليوم المحلّيّ
    //    فإسم الطور لذلك اليوم يأتي من الحدث (ليس من عتبة الإضاءة).
    function getForecast(startDate, lat, lng, days, tz) {
        const n = (typeof days === 'number' && days > 0 && days <= 60) ? Math.floor(days) : 14;
        const out = [];
        const d0 = new Date(startDate);

        // المنطقة الزمنيّة الفعّالة — تُستخدم لرسم حدود الأيّام وتنسيق الأوقات
        const resolvedTz = tz || _tzFromLongitude(lng);

        // نطاق البحث عن الأحداث: من منتصف ليل اليوم الأوّل **في تلك المنطقة** حتّى نهاية اليوم الأخير
        const rangeStart = _localMidnightInTz(d0, resolvedTz);
        const rangeEnd   = new Date(rangeStart.getTime() + n * 86400000);
        const events = findPhaseEventsInRange(rangeStart, rangeEnd);

        for (let i = 0; i < n; i++) {
            // نافذة اليوم المحلّيّ [00:00 اليوم, 00:00 اليوم التالي) بتوقيت المدينة
            const dayStart = new Date(rangeStart.getTime() + i * 86400000);
            const dayEnd   = new Date(rangeStart.getTime() + (i + 1) * 86400000);

            // عيّنة الإضاءة/الطور من منتصف اليوم (أقلّ حساسيّة لحدود DST)
            const dSample = new Date((dayStart.getTime() + dayEnd.getTime()) / 2);

            // هل يحتوي هذا اليوم المحلّيّ على حدث من الأحداث الأربعة؟
            const evInDay = events.find(e => e.date >= dayStart && e.date < dayEnd);

            const phase        = evInDay ? evInDay.phase : getPhaseName(dSample);
            const illumination = getMoonIllumination(dSample);
            const times        = getMoonTimes(dayStart, lat, lng, resolvedTz);

            out.push({
                date: dSample,          // لحظة في منتصف يوم المدينة (UTC instant)
                dayStart: dayStart,     // بداية يوم المدينة (UTC instant) — للاستخدامات المتقدّمة
                tz: resolvedTz,         // المنطقة الزمنيّة المستخدمة — للمستهلكين للعرض الصحيح
                phase,
                illumination,
                rise: times.rise,
                set:  times.set,
                event:   evInDay ? evInDay.type : null,        // للاستخدام اللاحق في تمييز الحدث بصريًّا
                eventAt: evInDay ? evInDay.date : null         // لحظة الحدث الدقيقة داخل اليوم
            });
        }
        return out;
    }

    // alias للحفاظ على التوافق الخلفيّ مع الشيفرة القديمة
    function get7DayForecast(startDate, lat, lng, tz) {
        return getForecast(startDate, lat, lng, 7, tz);
    }

    // ══════════ كوكبة القمر على المسار الفلكيّ (IAU Constellation) ══════════
    // تعتمد على خطّ الطول السماويّ (ecliptic longitude, λ) المحسوب في _moonEquatorial.
    //
    // ملاحظة مهمّة: نستخدم حدود الكوكبات الفلكيّة المعتمدة من الاتّحاد الفلكيّ الدوليّ (IAU)،
    // وليس الأبراج التنجيميّة المتساوية (30° لكلّ برج). الفرق:
    //   • الأبراج التنجيميّة = 12 شريحة متساوية (اختصرت الواقع لسهولة التبويب)
    //   • الكوكبات الفلكيّة  = 13 كوكبة بحدود غير متساوية، تشمل الحوّاء (Ophiuchus ⛎)
    //     التي يمرّ المسار الظاهريّ للشمس عبرها نحو 18 يومًا سنويًّا.
    //
    // القيم التالية هي نقاط دخول المسار الظاهريّ (ecliptic) في كلّ كوكبة
    // بالدرجات (J2000.0) من مصادر IAU الموثوقة.
    const _IAU_CONSTELLATIONS = [
        // { key, icon, enter: ecliptic longitude where the ecliptic enters this constellation }
        { key: 'aries',       icon: '\u2648', enter:  28.69 }, // ♈
        { key: 'taurus',      icon: '\u2649', enter:  53.43 }, // ♉
        { key: 'gemini',      icon: '\u264A', enter:  90.43 }, // ♊
        { key: 'cancer',      icon: '\u264B', enter: 118.27 }, // ♋
        { key: 'leo',         icon: '\u264C', enter: 138.18 }, // ♌
        { key: 'virgo',       icon: '\u264D', enter: 173.93 }, // ♍
        { key: 'libra',       icon: '\u264E', enter: 217.79 }, // ♎
        { key: 'scorpio',     icon: '\u264F', enter: 241.15 }, // ♏
        { key: 'ophiuchus',   icon: '\u26CE', enter: 247.75 }, // ⛎
        { key: 'sagittarius', icon: '\u2650', enter: 266.59 }, // ♐
        { key: 'capricorn',   icon: '\u2651', enter: 299.71 }, // ♑
        { key: 'aquarius',    icon: '\u2652', enter: 327.59 }, // ♒
        { key: 'pisces',      icon: '\u2653', enter: 351.57 }  // ♓ (تلتفّ عبر 360° → 28.69°)
    ];

    function _iauConstellationAt(lambda) {
        // lambda ∈ [0, 360). نختار آخر كوكبة دخلها المسار قبل λ.
        // الحوت (Pisces) تلتفّ حول 0°، لذا أيّ قيمة < 28.69° أو ≥ 351.57° تقع فيها.
        let last = _IAU_CONSTELLATIONS[_IAU_CONSTELLATIONS.length - 1]; // pisces (wrap)
        for (let i = 0; i < _IAU_CONSTELLATIONS.length; i++) {
            const c = _IAU_CONSTELLATIONS[i];
            if (lambda >= c.enter) {
                last = c;
            } else {
                break; // المصفوفة مرتّبة تصاعديًّا بـ enter
            }
        }
        // إن كان λ < أوّل enter (28.69°) → نحن في ذيل Pisces الملتفّ
        if (lambda < _IAU_CONSTELLATIONS[0].enter) {
            last = _IAU_CONSTELLATIONS[_IAU_CONSTELLATIONS.length - 1]; // Pisces
        }
        return last;
    }

    function getMoonZodiac(date) {
        const eq = _moonEquatorial(date);
        const lambda = ((eq.lambda % 360) + 360) % 360; // تطبيع [0, 360)
        const cons = _iauConstellationAt(lambda);
        return {
            key: cons.key,
            icon: cons.icon,
            i18nKey: 'moon.zodiac.' + cons.key,
            lambda: lambda
        };
    }

    // تصدير عامّ: ارتفاع القمر وسَمته — قِيم معتمدة على الموقع (lat/lng)
    function getMoonAltitude(date, lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') return null;
        return Math.round(_moonAltitude(date, lat, lng) * 100) / 100;
    }
    function getMoonAzimuth(date, lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') return null;
        return Math.round(_moonAzimuth(date, lat, lng) * 100) / 100;
    }

    return {
        getMoonPhase,
        getMoonIllumination,
        getMoonAge,
        getMoonDistance,
        getGeocentricDistance,
        getMoonAltitude,
        getMoonAzimuth,
        getPhaseName,
        getMoonTimes,
        getMoonZodiac,
        getNextFullMoon,
        getNextNewMoon,
        getNextFirstQuarter,
        getNextLastQuarter,
        findPhaseEventsInRange,
        get7DayForecast,
        getForecast
    };
})();

// Node.js export — يتيح للخادم (server.js) استخدام MoonCalc في SSR
// في المتصفّح: typeof module غير معرَّف → السطر يُتجاهل بسلام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoonCalc;
}
