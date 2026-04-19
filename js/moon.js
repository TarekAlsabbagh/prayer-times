/**
 * حساب أطوار القمر ومعلوماته
 */

const MoonCalc = (function() {
    const DEG = Math.PI / 180;
    const RAD = 180 / Math.PI;

    function getMoonPhase(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        let c = 0, e = 0, jd = 0, b = 0;

        if (month < 3) {
            c = year - 1;
            e = month + 12;
        } else {
            c = year;
            e = month;
        }

        jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5;
        const daysSinceNew = jd - 2451549.5;
        const newMoons = daysSinceNew / 29.53058867;
        const phase = newMoons - Math.floor(newMoons);

        return phase;
    }

    function getMoonIllumination(date) {
        const phase = getMoonPhase(date);
        // الإضاءة تقريبية بناءً على الطور
        if (phase < 0.5) {
            return Math.round(phase * 2 * 100);
        } else {
            return Math.round((1 - (phase - 0.5) * 2) * 100);
        }
    }

    function getMoonAge(date) {
        const phase = getMoonPhase(date);
        return Math.round(phase * 29.53);
    }

    function getPhaseName(date) {
        const phase = getMoonPhase(date);
        const age = getMoonAge(date);

        if (age <= 1) return { name: 'محاق (قمر جديد)', icon: '🌑', english: 'New Moon', key: 'moon.phase_new' };
        if (age <= 6) return { name: 'هلال متزايد', icon: '🌒', english: 'Waxing Crescent', key: 'moon.phase_waxing_crescent' };
        if (age <= 9) return { name: 'تربيع أول', icon: '🌓', english: 'First Quarter', key: 'moon.phase_first_quarter' };
        if (age <= 13) return { name: 'أحدب متزايد', icon: '🌔', english: 'Waxing Gibbous', key: 'moon.phase_waxing_gibbous' };
        if (age <= 16) return { name: 'بدر (قمر مكتمل)', icon: '🌕', english: 'Full Moon', key: 'moon.phase_full' };
        if (age <= 20) return { name: 'أحدب متناقص', icon: '🌖', english: 'Waning Gibbous', key: 'moon.phase_waning_gibbous' };
        if (age <= 23) return { name: 'تربيع أخير', icon: '🌗', english: 'Last Quarter', key: 'moon.phase_last_quarter' };
        if (age <= 28) return { name: 'هلال متناقص', icon: '🌘', english: 'Waning Crescent', key: 'moon.phase_waning_crescent' };
        return { name: 'محاق (قمر جديد)', icon: '🌑', english: 'New Moon', key: 'moon.phase_new' };
    }

    function getMoonTimes(date, lat, lng) {
        // تقدير تقريبي لأوقات شروق وغروب القمر
        const phase = getMoonPhase(date);
        const age = getMoonAge(date);

        // شروق القمر يتأخر حوالي 50 دقيقة كل يوم
        const baseRise = 18; // القمر الجديد يشرق تقريبًا مع الشمس
        const riseHour = (baseRise + age * 0.83) % 24;
        const setHour = (riseHour + 12) % 24;

        return {
            rise: formatHour(riseHour),
            set: formatHour(setHour)
        };
    }

    function formatHour(h) {
        h = ((h % 24) + 24) % 24;
        const hours = Math.floor(h);
        const minutes = Math.floor((h - hours) * 60);
        const _lng = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
        const useLatin = (_lng !== 'ar');
        const period = useLatin ? (hours >= 12 ? 'PM' : 'AM') : (hours >= 12 ? 'م' : 'ص');
        const h12 = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        return `${h12 < 10 ? '0' : ''}${h12}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
    }

    function getNextFullMoon(date) {
        let d = new Date(date);
        for (let i = 0; i < 35; i++) {
            const age = getMoonAge(d);
            if (age >= 14 && age <= 16) return d;
            d.setDate(d.getDate() + 1);
        }
        return null;
    }

    function getNextNewMoon(date) {
        let d = new Date(date);
        for (let i = 0; i < 35; i++) {
            const age = getMoonAge(d);
            if (age <= 1 || age >= 29) return d;
            d.setDate(d.getDate() + 1);
        }
        return null;
    }

    // Round 9: 7-day forecast generator
    function get7DayForecast(startDate, lat, lng) {
        const out = [];
        const d0 = new Date(startDate);
        for (let i = 0; i < 7; i++) {
            const d = new Date(d0);
            d.setDate(d0.getDate() + i);
            const phase = getPhaseName(d);
            const illumination = getMoonIllumination(d);
            const times = getMoonTimes(d, lat, lng);
            out.push({
                date: d,
                phase,
                illumination,
                rise: times.rise,
                set: times.set
            });
        }
        return out;
    }

    return {
        getMoonPhase,
        getMoonIllumination,
        getMoonAge,
        getPhaseName,
        getMoonTimes,
        getNextFullMoon,
        getNextNewMoon,
        get7DayForecast
    };
})();
