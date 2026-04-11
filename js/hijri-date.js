/**
 * تحويل التاريخ الهجري - الميلادي
 * خوارزمية أم القرى المعدلة
 */

const HijriDate = (function() {
    // تحويل من ميلادي إلى هجري
    function gregorianToHijri(gYear, gMonth, gDay) {
        let d = Math.floor((11 * gYear + 3) / 30) + 354 * gYear + 30 * gMonth
            - Math.floor((gMonth - 1) / 2) + gDay - 385;

        if (gMonth > 2) {
            d -= Math.floor((3 * (Math.floor((gYear - 1) / 100) + 1)) / 4) - Math.floor((gYear - 1) / 4);
        }

        // استخدام خوارزمية جديدة أكثر دقة
        const jd = gregorianToJD(gYear, gMonth, gDay);
        return jdToHijri(jd);
    }

    function gregorianToJD(year, month, day) {
        if (month <= 2) { year--; month += 12; }
        const A = Math.floor(year / 100);
        const B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524;
    }

    function jdToHijri(jd) {
        jd = Math.floor(jd) + 0.5;
        const year = Math.floor((30 * (jd - 1948439.5) + 10646) / 10631);
        const month = Math.min(12, Math.ceil((jd - (29 + hijriToJD(year, 1, 1))) / 29.5) + 1);
        const day = jd - hijriToJD(year, month, 1) + 1;
        return { year: year, month: Math.max(1, month), day: Math.max(1, Math.floor(day)) };
    }

    function hijriToJD(year, month, day) {
        return Math.floor((11 * year + 3) / 30) + 354 * year + 30 * month
            - Math.floor((month - 1) / 2) + day + 1948440 - 385;
    }

    // تحويل من هجري إلى ميلادي
    function hijriToGregorian(hYear, hMonth, hDay) {
        const jd = hijriToJD(hYear, hMonth, hDay);
        return jdToGregorian(jd);
    }

    function jdToGregorian(jd) {
        let l = jd + 68569;
        const n = Math.floor(4 * l / 146097);
        l = l - Math.floor((146097 * n + 3) / 4);
        const i = Math.floor(4000 * (l + 1) / 1461001);
        l = l - Math.floor(1461 * i / 4) + 31;
        const j = Math.floor(80 * l / 2447);
        const day = l - Math.floor(2447 * j / 80);
        l = Math.floor(j / 11);
        const month = j + 2 - 12 * l;
        const year = 100 * (n - 49) + i + l;
        return { year: Math.floor(year), month: Math.floor(month), day: Math.floor(day) };
    }

    // أسماء الأشهر
    const hijriMonths = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
        'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
        'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];

    const gregorianMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل',
        'مايو', 'يونيو', 'يوليو', 'أغسطس',
        'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    function getToday() {
        const now = new Date();
        return gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }

    function getTodayFormatted() {
        const h = getToday();
        const now = new Date();
        const dayName = dayNames[now.getDay()];
        return `${dayName} ${h.day} ${hijriMonths[h.month - 1]} ${h.year} هـ`;
    }

    function getDaysInHijriMonth(year, month) {
        // الأشهر الفردية 30 يوم والزوجية 29 يوم
        if (month % 2 === 1) return 30;
        if (month === 12) {
            // سنة كبيسة
            return isHijriLeapYear(year) ? 30 : 29;
        }
        return 29;
    }

    function isHijriLeapYear(year) {
        return ((11 * year + 14) % 30) < 11;
    }

    function getHijriCalendar(year, month) {
        const firstDay = hijriToGregorian(year, month, 1);
        const gDate = new Date(firstDay.year, firstDay.month - 1, firstDay.day);
        const startDay = gDate.getDay();
        const daysInMonth = getDaysInHijriMonth(year, month);

        const weeks = [];
        let week = new Array(7).fill(null);
        let dayCount = 1;

        for (let i = startDay; i < 7 && dayCount <= daysInMonth; i++) {
            const greg = hijriToGregorian(year, month, dayCount);
            week[i] = { hijri: dayCount, gregorian: greg };
            dayCount++;
        }
        weeks.push(week);

        while (dayCount <= daysInMonth) {
            week = new Array(7).fill(null);
            for (let i = 0; i < 7 && dayCount <= daysInMonth; i++) {
                const greg = hijriToGregorian(year, month, dayCount);
                week[i] = { hijri: dayCount, gregorian: greg };
                dayCount++;
            }
            weeks.push(week);
        }

        return { weeks, daysInMonth, startDay };
    }

    return {
        toHijri: gregorianToHijri,
        toGregorian: hijriToGregorian,
        getToday,
        getTodayFormatted,
        getHijriCalendar,
        getDaysInHijriMonth,
        isHijriLeapYear,
        hijriMonths,
        gregorianMonths,
        dayNames,
        hijriToJD,
        gregorianToJD
    };
})();
