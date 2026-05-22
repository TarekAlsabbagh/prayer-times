'use strict';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  HIJRI-UMM-AL-QURA-INFRA-STAGE-A0 (2026-05-22)
 *
 *  Pure Umm al-Qura table reader + validation helpers.
 *  Node-only CommonJS module. INTENTIONALLY NOT exposed to the browser:
 *  not referenced from any <script> tag, not loaded by index.html, not
 *  imported by js/app.js, not required by any code path in server.js
 *  that serves user-facing requests. The ONLY consumer right now is the
 *  Node smoke-test at scripts/_smoke_hijri_umm_al_qura_a0.mjs.
 *
 *  Purpose: pre-wire the infrastructure so Stage B (algorithm flip) and
 *  Stage C (route guards) can plug in without inventing the helper API
 *  on the fly. This file does NOT change the behaviour of any page —
 *  the existing Kuwaiti tabular algorithm in js/hijri-date.js and the
 *  SSR mirror in server.js:4881-4917 remain the live source of truth
 *  for all Hijri calculations until Stage B is approved.
 *
 *  Schema of the underlying JSON table (db/hijri/umm-al-qura.json):
 *
 *      {
 *          "calendar": "umm-al-qura",       // identifier constant
 *          "source": null | "<url|name>",   // documented data source
 *          "sourceMeta": null | { ... },    // optional provenance object
 *          "range": {
 *              "startYear": <int>,          // inclusive (1356 by default)
 *              "endYear":   <int>           // inclusive (1500 by default)
 *          },
 *          "status": "data-pending"         // no per-year data yet
 *                  | "populated"            // EVERY year in [start..end] present
 *                  | "partial",             // some years present, some not
 *          "fetchedAt": null | "YYYY-MM-DD",
 *          "years": {
 *              "<hijriYear>": {
 *                  "months":     [<int×12>],  // each entry ∈ {29, 30}
 *                  "yearStart":  "YYYY-MM-DD", // Gregorian of 1 Muharram <Y>
 *                  "yearLength": <int>        // sum of months (354 or 355)
 *              }
 *          }
 *      }
 *
 *  Public helpers (all pure functions — no I/O outside the initial load):
 *      loadTable()                        → object | null
 *      tableMeta()                        → { calendar, range, status, source }
 *      isYearInUmmAlQuraRange(year)       → boolean
 *      hasYearData(year)                  → boolean   (year has months[])
 *      getUmmAlQuraMonthLength(y, m)      → 29 | 30 | null
 *      isValidUmmAlQuraDate(y, m, d)      → boolean
 *      getUmmAlQuraYearLength(y)          → 354 | 355 | null
 *      getUmmAlQuraYearStart(y)           → "YYYY-MM-DD" | null
 *      _resetForTests()                   → undefined  (test fixture helper)
 *      _setTableForTests(table)           → undefined  (test fixture helper)
 *
 *  null returns: "data not available" for this year (or year out of range,
 *  or table not loaded). Callers MUST distinguish null (no data) from a
 *  numeric answer.
 *
 *  Stage A0 status: helpers operate against the empty placeholder table.
 *  All "has data" checks return false; "validity" checks return false for
 *  every date (until the table is populated). This is intentional — the
 *  helpers' shape is finalised, but the data isn't.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const path = require('path');
const fs   = require('fs');

const TABLE_PATH = path.join(__dirname, '..', 'db', 'hijri', 'umm-al-qura.json');

let _table = null;
let _tableLoadAttempted = false;

/**
 * Load the JSON table from disk on first call; cache for subsequent calls.
 * Returns the parsed object, or null if the file is missing or malformed.
 * Errors are swallowed (returning null) — callers must handle null.
 */
function loadTable() {
    if (_tableLoadAttempted) return _table;
    _tableLoadAttempted = true;
    try {
        const raw = fs.readFileSync(TABLE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.calendar === 'umm-al-qura') {
            _table = parsed;
        }
    } catch (_err) {
        _table = null;
    }
    return _table;
}

/** Reset cached state — test fixture only. NOT for production use. */
function _resetForTests() {
    _table = null;
    _tableLoadAttempted = false;
}

/** Inject an arbitrary table — test fixture only. NOT for production use. */
function _setTableForTests(table) {
    _table = table;
    _tableLoadAttempted = true;
}

/**
 * Returns metadata about the loaded table:
 *     { calendar, range, status, source }
 * Returns null if no table loaded.
 */
function tableMeta() {
    const t = loadTable();
    if (!t) return null;
    return {
        calendar: t.calendar,
        range: t.range,
        status: t.status,
        source: t.source
    };
}

/**
 * true iff `year` falls within the configured table range [startYear, endYear].
 * Note: returning true here does NOT mean per-year data exists — use
 * hasYearData() to confirm the year is actually populated.
 */
function isYearInUmmAlQuraRange(year) {
    const t = loadTable();
    if (!t || !t.range) return false;
    if (typeof year !== 'number' || !Number.isFinite(year)) return false;
    return year >= t.range.startYear && year <= t.range.endYear;
}

/**
 * true iff the table has a fully populated entry for this year
 * (12-element months[] array). Independent of in-range check.
 */
function hasYearData(year) {
    const t = loadTable();
    if (!t || !t.years) return false;
    const entry = t.years[String(year)];
    return !!(entry && Array.isArray(entry.months) && entry.months.length === 12);
}

/**
 * Returns the number of days in (year, month) per the Umm al-Qura table.
 * Returns null if:
 *   - the year is out of range,
 *   - the month is not 1..12,
 *   - the table has no data for that year.
 */
function getUmmAlQuraMonthLength(year, month) {
    if (typeof month !== 'number' || month < 1 || month > 12) return null;
    if (!isYearInUmmAlQuraRange(year)) return null;
    if (!hasYearData(year)) return null;
    const t = loadTable();
    const entry = t.years[String(year)];
    const days = entry.months[month - 1];
    if (typeof days !== 'number' || (days !== 29 && days !== 30)) return null;
    return days;
}

/**
 * true iff (year, month, day) is a valid Hijri date per the Umm al-Qura table.
 * Returns false for any of:
 *   - non-numeric / non-finite inputs,
 *   - year out of range,
 *   - year not yet populated (data-pending),
 *   - month outside 1..12,
 *   - day < 1,
 *   - day > monthLength.
 */
function isValidUmmAlQuraDate(year, month, day) {
    if (typeof year !== 'number' || !Number.isFinite(year)) return false;
    if (typeof month !== 'number' || !Number.isFinite(month)) return false;
    if (typeof day !== 'number' || !Number.isFinite(day)) return false;
    if (day < 1) return false;
    const monthLen = getUmmAlQuraMonthLength(year, month);
    if (monthLen === null) return false;
    return day <= monthLen;
}

/**
 * Returns the total day count (354 or 355) for the Hijri year.
 * Returns null if year out of range, no data, or table malformed.
 */
function getUmmAlQuraYearLength(year) {
    if (!hasYearData(year)) return null;
    const t = loadTable();
    const entry = t.years[String(year)];
    if (typeof entry.yearLength === 'number' && (entry.yearLength === 354 || entry.yearLength === 355)) {
        return entry.yearLength;
    }
    // Compute from months as fallback
    if (Array.isArray(entry.months) && entry.months.length === 12) {
        const sum = entry.months.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
        if (sum === 354 || sum === 355) return sum;
    }
    return null;
}

/**
 * Returns the Gregorian start date of the Hijri year, as ISO "YYYY-MM-DD" string.
 * Returns null if year out of range or no data.
 */
function getUmmAlQuraYearStart(year) {
    if (!hasYearData(year)) return null;
    const t = loadTable();
    const entry = t.years[String(year)];
    if (typeof entry.yearStart === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.yearStart)) {
        return entry.yearStart;
    }
    return null;
}

module.exports = {
    loadTable,
    tableMeta,
    isYearInUmmAlQuraRange,
    hasYearData,
    getUmmAlQuraMonthLength,
    isValidUmmAlQuraDate,
    getUmmAlQuraYearLength,
    getUmmAlQuraYearStart,
    _resetForTests,
    _setTableForTests,
    TABLE_PATH
};
