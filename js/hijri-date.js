/**
 * تحويل التاريخ الهجري - الميلادي
 * ═══════════════════════════════════════════════════════════════════════════
 * HIJRI-UMM-AL-QURA-STAGE-B1-ALGORITHM-FLIP (2026-05-23)
 *
 * SOURCE OF TRUTH: db/hijri/umm-al-qura.json (table-based Umm al-Qura).
 * The table is injected by server.js into the HTML <head> as
 *   <script>window._HIJRI_UMM_AL_QURA = { calendar, range, years }</script>
 * BEFORE this file is parsed. In Node-side tests, set
 *   globalThis._HIJRI_UMM_AL_QURA = require('./db/hijri/umm-al-qura.json')
 * before requiring this file.
 *
 * Range: 1356-1500 AH (1937-2076 CE). Out-of-range queries return null.
 *
 * The previous Kuwaiti tabular algorithm (`(11Y+14) % 30 < 11` leap rule,
 * alternating 30/29 month lengths) has been REMOVED. No formula fallback —
 * per user policy, dates outside the table are invalid.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HijriDate = (function() {
    // ─── Table loader ───────────────────────────────────────────────────
    let _table = null;
    function _loadTable() {
        if (_table) return _table;
        if (typeof globalThis !== 'undefined' && globalThis._HIJRI_UMM_AL_QURA) {
            _table = globalThis._HIJRI_UMM_AL_QURA;
        }
        return _table;
    }
    function _setTableForTests(table) { _table = table; }

    // ─── Universal Julian Day helpers (used for date arithmetic, NOT
    //     for Hijri conversion — those use the table) ────────────────────
    function gregorianToJD(year, month, day) {
        if (month <= 2) { year--; month += 12; }
        const A = Math.floor(year / 100);
        const B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524;
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

    // ─── Range + validity gates ─────────────────────────────────────────
    function isYearInRange(year) {
        const t = _loadTable();
        if (!t || !t.range) return false;
        if (typeof year !== 'number' || !Number.isFinite(year)) return false;
        return year >= t.range.startYear && year <= t.range.endYear;
    }
    function _yearEntry(year) {
        const t = _loadTable();
        if (!t || !t.years) return null;
        const e = t.years[String(year)];
        return (e && Array.isArray(e.months) && e.months.length === 12) ? e : null;
    }
    function getDaysInHijriMonth(year, month) {
        if (!Number.isInteger(month) || month < 1 || month > 12) return 0;
        if (!isYearInRange(year)) return 0;
        const e = _yearEntry(year);
        if (!e) return 0;
        return e.months[month - 1] || 0;
    }
    function getHijriYearLength(year) {
        const e = _yearEntry(year);
        if (!e) return 0;
        return (typeof e.yearLength === 'number') ? e.yearLength
            : e.months.reduce((a, b) => a + b, 0);
    }
    function isHijriLeapYear(year) {
        return getHijriYearLength(year) === 355;
    }
    function isValidHijriDate(year, month, day) {
        if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
        if (day < 1) return false;
        const maxDay = getDaysInHijriMonth(year, month);
        return maxDay > 0 && day <= maxDay;
    }

    // ─── Hijri → Gregorian (table lookup) ───────────────────────────────
    function _yearStartJD(year) {
        const e = _yearEntry(year);
        if (!e) return null;
        const [sy, sm, sd] = e.yearStart.split('-').map(Number);
        return gregorianToJD(sy, sm, sd);
    }
    function hijriToGregorian(hYear, hMonth, hDay) {
        if (!isValidHijriDate(hYear, hMonth, hDay)) return null;
        const e = _yearEntry(hYear);
        const startJD = _yearStartJD(hYear);
        if (startJD == null) return null;
        // Days from year start = sum of completed months + (day - 1)
        let offset = 0;
        for (let i = 0; i < hMonth - 1; i++) offset += e.months[i];
        offset += (hDay - 1);
        return jdToGregorian(startJD + offset);
    }
    function hijriToJD(hYear, hMonth, hDay) {
        const g = hijriToGregorian(hYear, hMonth, hDay);
        if (!g) return null;
        return gregorianToJD(g.year, g.month, g.day);
    }

    // ─── Gregorian → Hijri (binary search on year, then linear on month) ─
    function gregorianToHijri(gYear, gMonth, gDay) {
        const t = _loadTable();
        if (!t || !t.range) return null;
        const targetJD = gregorianToJD(gYear, gMonth, gDay);
        // Binary search across years
        let lo = t.range.startYear, hi = t.range.endYear;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const e = _yearEntry(mid);
            if (!e) return null;
            const yStart = _yearStartJD(mid);
            const yEnd   = yStart + (e.yearLength || e.months.reduce((a,b)=>a+b, 0)); // exclusive
            if (targetJD < yStart)      hi = mid - 1;
            else if (targetJD >= yEnd)  lo = mid + 1;
            else {
                // Find month
                let cumulative = yStart;
                for (let m = 0; m < 12; m++) {
                    const monthDays = e.months[m];
                    if (targetJD < cumulative + monthDays) {
                        return { year: mid, month: m + 1, day: targetJD - cumulative + 1 };
                    }
                    cumulative += monthDays;
                }
                return null; // shouldn't reach
            }
        }
        return null; // out of range
    }

    // ─── Month names (unchanged) ────────────────────────────────────────
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

    // ─── Today ──────────────────────────────────────────────────────────
    function getToday() {
        const now = new Date();
        const h = gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
        if (!h) {
            // Today is outside the table range. This is highly unlikely until
            // ~2076 CE, but provide a safe fallback to prevent UI crashes.
            return { year: 0, month: 1, day: 1 };
        }
        return h;
    }
    function getTodayFormatted() {
        const h = getToday();
        const now = new Date();
        const dayName = dayNames[now.getDay()];
        const monthName = h.month >= 1 && h.month <= 12 ? hijriMonths[h.month - 1] : '';
        return `${dayName} ${h.day} ${monthName} ${h.year} هـ`;
    }

    // ─── Calendar (month-grid for /hijri-calendar/{year}-{month}) ───────
    function getHijriCalendar(year, month) {
        const daysInMonth = getDaysInHijriMonth(year, month);
        if (!daysInMonth) {
            return { weeks: [], daysInMonth: 0, startDay: 0 };
        }
        const firstDay = hijriToGregorian(year, month, 1);
        if (!firstDay) {
            return { weeks: [], daysInMonth: 0, startDay: 0 };
        }
        const gDate = new Date(firstDay.year, firstDay.month - 1, firstDay.day);
        const startDay = gDate.getDay();

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

    // ─── Public API ─────────────────────────────────────────────────────
    return {
        toHijri: gregorianToHijri,
        toGregorian: hijriToGregorian,
        getToday,
        getTodayFormatted,
        getHijriCalendar,
        getDaysInHijriMonth,
        getHijriYearLength,
        isHijriLeapYear,
        isValidHijriDate,
        isYearInRange,
        hijriMonths,
        gregorianMonths,
        dayNames,
        hijriToJD,
        gregorianToJD,
        // Internal — for tests only:
        _setTableForTests
    };
})();

// Node CJS export for test scripts (no-op in browser).
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HijriDate;
}
