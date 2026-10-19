// TODAY-PAGES-ACCURACY-1 item 1b — local regression guard (no network: outbound guard on both servers, every
//   non-loopback host unresolvable in Chrome, ad / analytics URLs blocked, ADSENSE_CLIENT=off).
//   Defect: the 14-day table of the moon city page (#moon-forecast-body, built in the browser) showed the PREVIOUS
//   day's moonrise / moonset after a clock change: js/moon.js getForecast steps its day windows by a fixed 86400000 ms
//   from the first local midnight, so after a fall-back row.dayStart is 23:00 of the previous city date and
//   getMoonTimes(dayStart) (its own _localMidnightInTz) answers for that date: one repeated row, then every later row
//   one day behind (Berlin 2026-10-26 repeated 25's 03:58 PM / 05:59 AM). On a spring-forward day in zones that switch
//   at/before 00:00 UTC (Sydney, Jerusalem, Beirut, Cairo) the first window already starts at 23:00 the evening
//   before, so the highlighted "today" row carried yesterday's times. The printed dates were always right.
//   Fix (js/app.js only, js/moon.js untouched): in the render loop, when row.dayStart is on another city date than
//   the row's own printed date (dp), the row takes MoonCalc.getMoonTimes(row.date, lat, lng, tz) = the engine's
//   times for the row's own city date; every other row keeps getForecast's values untouched. Phase / illumination /
//   event cells are NOT touched (decision #11 = owner); the 25-hour-day missing event inside getMoonTimes
//   (decision #7) and the engine's transition-day midnight (decision #8) stay as they are.
//   BASE = clean production tree (env TP_BASE_ROOT), CAND = this tree.
//   [S] source: BASE premise (rise/set cells straight from getForecast); CAND's table section == BASE's once the 1b
//       block is cut and rowRise/rowSet read row.rise/row.set again; moon.js, i18n, index.html (?v), sw.js, hijri
//       data byte-identical; CRLF kept.
//   [U] Node, the REAL table code of both trees (the section of js/app.js from _getDayPartsInTz to
//       _fcBody.innerHTML, run with stub document / t / clock) on identical inputs: 14 zones (DST and non-DST,
//       half-hour, southern hemisphere), every visit day in the 15 days up to each 2026-2027 clock change + every 4th
//       day of both years. CAND rise/set == getMoonTimes at the city's own noon of the printed date, every row;
//       BASE rows whose dayStart is on another date == the engine for THAT (previous) date; every row whose dayStart
//       is on its own date byte-identical; dates / Hijri / phase / illumination / today-highlight cells identical
//       everywhere; whole table identical when no clock change touches the 14 days.
//   [B] headless Chrome, the real pages of both servers (same test clock on server and browser): London 2026-10-25
//       (3 visitor zones), New York + Los Angeles 2026-11-01, Sydney 2026-10-04 (spring) / 2027-03-30 (report case) /
//       2027-04-04 (fall-back day: nothing to fix, the engine's late midnight hides the fixed step), Jerusalem
//       2026-10-24 / 2026-10-25 (as Sydney) / 2027-03-26 (spring), Cairo 2026-10-29 / 2027-04-30 (spring), Beirut
//       2026-10-18 (report case) / 2027-03-28 (spring), Berlin 2026-10-18 (report case), ordinary weeks (Berlin June,
//       New York July, Mecca, Sydney December). Raw SSR identical; card, zone note, FAQ and the
//       rest of the page text identical; table: only the rise/set cells of the shifted rows change, CAND == engine
//       for each row's own date (in-page MoonCalc), BASE == engine for the previous date; MET Norway values of the
//       report (±10 min); Seattle (CAND, zone fixed by 1a) vs JPL Horizons values of the report; LA 2026-11-01
//       moonrise 23:34 PST (Horizons) still "--:--" (decision #7 not done).
//   node scripts/_smoke_today_pages_moon_forecast_dst_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT, TP_CHROME)
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-today-pages-base';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = process.env.TP_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const P0 = Number(process.env.TP_SMOKE_PORT || 9740);
const PORT = { base: P0, cand: P0 + 1, cdp: P0 + 9 };
const AD_BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*', '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*gstatic.com/ads*'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity', 'user-agent': 'Mozilla/5.0 smoke' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, h: {}, b: '' })); r.setTimeout(60000, () => r.destroy()); r.end();
});
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + String(d).slice(0, 1200) : '')); } };
// per-request / per-checkout noise only
const noise = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')
    .replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA')
    .replace(/js\/app\.js\?v=\d+/g, 'js/app.js?v=N');
const firstDiff = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i >= a.length && a.length === b.length ? '' : '@' + i + ' A…' + a.slice(Math.max(0, i - 120), i + 160) + '…  B…' + b.slice(Math.max(0, i - 120), i + 160) + '…'; };
const META_RE = /<meta name="moon\.city\.tz" content="([^"]*)">/;
const metaOf = (h) => { const m = h.match(META_RE); return m ? m[1] : null; };
const setMeta = (h, v) => h.replace(META_RE, () => '<meta name="moon.city.tz" content="' + v + '">');
const geoOf = (h) => { const m = h.match(/<meta name="geo\.position" content="(-?[\d.]+);(-?[\d.]+)"/); return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null; };
// ---------------------------------------------------------------- time helpers (Intl, independent of the page code)
const FMT = new Map();
const fmtFor = (tz) => { if (!FMT.has(tz)) FMT.set(tz, new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })); return FMT.get(tz); };
const partsAt = (ms, tz) => { const o = {}; for (const p of fmtFor(tz).formatToParts(new Date(ms))) if (p.type !== 'literal') o[p.type] = Number(p.value); return o; };
const offMin = (ms, tz) => { const p = partsAt(ms, tz); return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000) / 60000); };
const exactNoon = (y, m, d, tz) => { const naive = Date.UTC(y, m - 1, d, 12); let t = naive - offMin(naive, tz) * 60000; t = naive - offMin(t, tz) * 60000; return t; };
const cityDate = (ms, tz) => { const p = partsAt(ms, tz); return { y: p.year, m: p.month, d: p.day }; };
const addDays = (c, n) => { const x = new Date(Date.UTC(c.y, c.m - 1, c.d + n)); return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate() }; };
const ymd = (c) => c.y + '-' + String(c.m).padStart(2, '0') + '-' + String(c.d).padStart(2, '0');
const sameDay = (a, b) => a.y === b.y && a.m === b.m && a.d === b.d;
const EN_WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const label = (c) => EN_WD[new Date(Date.UTC(c.y, c.m - 1, c.d)).getUTCDay()] + ' ' + c.d + ' ' + EN_MO[c.m - 1] + ' ' + c.y;
// "04:15 PM" -> minutes of the day; MET "16:21" -> minutes
const hm12 = (s) => { const m = String(s).match(/^(\d\d):(\d\d) (AM|PM)$/); if (!m) return null; let h = Number(m[1]) % 12; if (m[3] === 'PM') h += 12; return h * 60 + Number(m[2]); };
const hm24 = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const within = (a, b, tol) => a != null && b != null && Math.min(Math.abs(a - b), 1440 - Math.abs(a - b)) <= tol;
globalThis.getCurrentLang = () => 'en';   // moon.js _formatTime: Latin digits + AM/PM, as on the /en/ pages
const MoonCalc = require(path.join(ROOT, 'js/moon.js'));
const engineDay = (c, lat, lng, tz) => { const r = MoonCalc.getMoonTimes(new Date(exactNoon(c.y, c.m, c.d, tz)), lat, lng, tz); return { rise: r.rise, set: r.set }; };
// ---------------------------------------------------------------- source helpers
const appB = fs.readFileSync(path.join(BASE_ROOT, 'js/app.js'), 'utf8'), appC = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
const SECT_A = '    const _getDayPartsInTz = (d, tz) => {', SECT_Z = '        _fcBody.innerHTML = html;';
const section = (src) => { const a = src.indexOf(SECT_A); const e = src.indexOf(SECT_Z, a); const z = src.indexOf('\n    }', e); return (a < 0 || e < 0 || z < 0) ? '' : src.slice(a, z + 6); };
const sB = section(appB), sC = section(appC);
const grabObj = (src, decl) => { const a = src.indexOf(decl); let i = src.indexOf('{', a), dep = 0; for (; i < src.length; i++) { if (src[i] === '{') dep++; else if (src[i] === '}') { dep--; if (!dep) break; } } return new Function('return ' + src.slice(src.indexOf('{', a), i + 1))(); };
const FAMOUS = grabObj(appC, 'const FAMOUS_MOON_CITIES = {');
// ---------------------------------------------------------------- [S]
console.log('-- [S] source');
{
    ok(!!sB && sB.includes('MoonCalc.getForecast(today, _lat, _lng, 14, _tz)') && sB.includes('+ `<td>${row.rise}</td>`') && sB.includes('+ `<td>${row.set}</td>`'), '[S] BASE: the table prints row.rise / row.set exactly as getForecast(today, lat, lng, 14, tz) returns them (defect premise)');
    const L = sC.split('\r\n');
    const a = L.findIndex((l) => l.includes('// TODAY-PAGES-ACCURACY-1 (1b)'));
    const z = L.findIndex((l, i) => i > a && l === '            }');
    const cut = a >= 0 && z > a ? L.slice(0, a).concat(L.slice(z + 1)).join('\r\n').replace('+ `<td>${rowRise}</td>`', '+ `<td>${row.rise}</td>`').replace('+ `<td>${rowSet}</td>`', '+ `<td>${row.set}</td>`') : null;
    ok(cut !== null && cut === sB, '[S] CAND table section == BASE\'s once the 1b block (' + (z - a + 1) + ' lines) is cut and the two cells read row.rise / row.set again: getForecast call, dates, Hijri, phase, illumination, today highlight untouched', cut && firstDiff(cut, sB));
    const blk = a >= 0 ? L.slice(a, z + 1).join('\n') : '';
    ok((blk.match(/MoonCalc\.getMoonTimes\(row\.date, _lat, _lng, _rowTz\)/g) || []).length === 1 && /if \(sp\.y !== dp\.y \|\| sp\.m !== dp\.m \|\| sp\.d !== dp\.d\) \{/.test(blk) && !/illumination|phase\./.test(blk.replace(/^\s*\/\/.*$/gm, '')), '[S] CAND block: one engine call getMoonTimes(row.date, lat, lng, tz), only when row.dayStart is on another city date than the row; no phase / illumination code');
    ok((appC.match(/MoonCalc\.getForecast\(/g) || []).length === (appB.match(/MoonCalc\.getForecast\(/g) || []).length, '[S] same number of getForecast call sites as BASE (the forecast still comes from the engine)');
    for (const f of ['js/moon.js', 'db/hijri/umm-al-qura.json', 'index.html', 'sw.js', 'js/i18n.js', 'js/i18n/en.js', 'js/i18n/ar.js', 'js/hijri-date.js']) {
        const pb = path.join(BASE_ROOT, f), pc = path.join(ROOT, f);
        if (!fs.existsSync(pb) && !fs.existsSync(pc)) continue;
        ok(fs.readFileSync(pb).equals(fs.readFileSync(pc)), '[S] ' + f + ' untouched (byte-identical to BASE' + (f === 'index.html' ? ': same app.js?v / i18n version' : '') + ')');
    }
    ok((appC.match(/\r\n/g) || []).length === (appC.match(/\n/g) || []).length, '[S] CAND js/app.js keeps CRLF line endings throughout');
}
// ---------------------------------------------------------------- [U]
console.log('\n-- [U] Node: the real table code of BASE and CAND on identical inputs');
const mkTable = (src) => new Function('document', 'MoonCalc', 'today', '_lat', '_lng', '_tz', '_wk', '_gm', '_lng_', 't', 'Date', src + '\nreturn document.__html;');
const tB = mkTable(sB), tC = mkTable(sC);
const runTable = (f, nowMs, todayMs, lat, lng, tz) => {
    const R = globalThis.Date;
    class D extends R { constructor(...a) { if (a.length === 0) super(nowMs); else super(...a); } static now() { return nowMs; } }
    const doc = { __html: null, getElementById: (id) => (id === 'moon-forecast-body' ? { set innerHTML(v) { doc.__html = v; } } : null) };
    return f(doc, MoonCalc, new R(todayMs), lat, lng, tz, EN_WD, EN_MO, 'en', (k) => k, D);
};
const rowsOf = (h) => [...String(h).matchAll(/<tr([^>]*)>(.*?)<\/tr>/g)].map((m) => ({ attrs: m[1], html: m[0], cells: [...m[2].matchAll(/<td[^>]*>(.*?)<\/td>/g)].map((x) => x[1].replace(/<[^>]+>/g, '').trim()) }));
const ZONES = [
    { n: 'London', tz: 'Europe/London', lat: 51.5074, lng: -0.1278, dst: true },
    { n: 'Berlin', tz: 'Europe/Berlin', lat: 52.52, lng: 13.405, dst: true },
    { n: 'New York', tz: 'America/New_York', lat: 40.7128, lng: -74.006, dst: true },
    { n: 'Los Angeles', tz: 'America/Los_Angeles', lat: 34.0522, lng: -118.2437, dst: true },
    { n: 'Seattle', tz: 'America/Los_Angeles', lat: 47.605, lng: -122.33, dst: true },
    { n: 'Sydney', tz: 'Australia/Sydney', lat: -33.8688, lng: 151.2093, dst: true },
    { n: 'Jerusalem', tz: 'Asia/Jerusalem', lat: 31.7683, lng: 35.2137, dst: true },
    { n: 'Cairo', tz: 'Africa/Cairo', lat: 30.0444, lng: 31.2357, dst: true },
    { n: 'Beirut', tz: 'Asia/Beirut', lat: 33.8938, lng: 35.5018, dst: true },
    { n: 'Auckland', tz: 'Pacific/Auckland', lat: -36.8485, lng: 174.7633, dst: true },
    { n: 'Santiago', tz: 'America/Santiago', lat: -33.4489, lng: -70.6693, dst: true },
    { n: 'Mecca', tz: 'Asia/Riyadh', lat: 21.4225, lng: 39.8262, dst: false },
    { n: 'Delhi', tz: 'Asia/Kolkata', lat: 28.6139, lng: 77.209, dst: false },
    { n: 'Jakarta', tz: 'Asia/Jakarta', lat: -6.2088, lng: 106.8456, dst: false }
];
{
    const perZone = [];
    let visits = 0, rowsN = 0, candBad = 0, otherCells = 0, alignedRows = 0, alignedDiff = 0, shiftedRows = 0, shiftedPrevOk = 0, baseWrong = 0, labelBad = 0, quietVisits = 0, quietDiff = 0;
    const ex = { cand: [], other: [], aligned: [], prev: [], label: [], quiet: [] };
    let msB = 0, msC = 0;
    for (const Z of ZONES) {
        // clock-change days in 2026-2027 (offset at the start of the city date != at the start of the next one)
        const changes = [];
        for (let c = { y: 2026, m: 1, d: 1 }; c.y < 2028; c = addDays(c, 1)) {
            const n = addDays(c, 1);
            if (offMin(exactNoon(c.y, c.m, c.d, Z.tz) - 12 * 3600000, Z.tz) !== offMin(exactNoon(n.y, n.m, n.d, Z.tz) - 12 * 3600000, Z.tz)) changes.push(ymd(c));
        }
        const want = new Set();
        let i = 0;
        for (let c = { y: 2026, m: 1, d: 1 }; c.y < 2028; c = addDays(c, 1), i++) {
            if (i % 4 === 0) want.add(ymd(c));
            for (const ch of changes) { const [y, m, d] = ch.split('-').map(Number); for (let k = -14; k <= 1; k++) if (ymd(addDays({ y, m, d }, k)) === ymd(c)) want.add(ymd(c)); }
        }
        let zWrong = 0, zVisits = 0, zShifted = 0;
        for (const day of [...want].sort()) {
            const [y, m, d] = day.split('-').map(Number), c0 = { y, m, d };
            const today = exactNoon(y, m, d, Z.tz), now = today;
            const t1 = performance.now(); const hb = runTable(tB, now, today, Z.lat, Z.lng, Z.tz); const t2 = performance.now(); const hc = runTable(tC, now, today, Z.lat, Z.lng, Z.tz); const t3 = performance.now();
            msB += t2 - t1; msC += t3 - t2;
            const rb = rowsOf(hb), rc = rowsOf(hc), fc = MoonCalc.getForecast(new Date(today), Z.lat, Z.lng, 14, Z.tz);
            visits++; zVisits++;
            const quiet = offMin(today - 36 * 3600000, Z.tz) === offMin(today + 15 * 86400000, Z.tz) && !changes.some((ch) => ch >= ymd(addDays(c0, -1)) && ch <= ymd(addDays(c0, 14)));
            if (quiet) { quietVisits++; if (hb !== hc) { quietDiff++; if (ex.quiet.length < 3) ex.quiet.push(Z.n + ' ' + day); } }
            if (rb.length !== 14 || rc.length !== 14) { labelBad++; if (ex.label.length < 3) ex.label.push(Z.n + ' ' + day + ' rows ' + rb.length + '/' + rc.length); continue; }
            for (let r = 0; r < 14; r++) {
                rowsN++;
                const own = addDays(c0, r), e = engineDay(own, Z.lat, Z.lng, Z.tz);
                if (rb[r].cells[0] !== label(own) || rc[r].cells[0] !== label(own)) { labelBad++; if (ex.label.length < 3) ex.label.push(Z.n + ' ' + day + ' row ' + r + ' ' + rb[r].cells[0] + ' / ' + rc[r].cells[0]); }
                if (JSON.stringify(rb[r].cells.slice(0, 4)) !== JSON.stringify(rc[r].cells.slice(0, 4)) || rb[r].attrs !== rc[r].attrs) { otherCells++; if (ex.other.length < 3) ex.other.push(Z.n + ' ' + day + ' row ' + r); }
                if (rc[r].cells[4] !== e.rise || rc[r].cells[5] !== e.set) { candBad++; if (ex.cand.length < 4) ex.cand.push(Z.n + ' ' + day + ' row ' + label(own) + ' CAND ' + rc[r].cells[4] + ' / ' + rc[r].cells[5] + ' engine ' + e.rise + ' / ' + e.set); }
                const sd = cityDate(fc[r].dayStart.getTime(), Z.tz);
                if (sameDay(sd, own)) { alignedRows++; if (rb[r].html !== rc[r].html) { alignedDiff++; if (ex.aligned.length < 3) ex.aligned.push(Z.n + ' ' + day + ' row ' + r); } }
                else {
                    shiftedRows++; zShifted++;
                    const p = engineDay(sd, Z.lat, Z.lng, Z.tz);
                    if (rb[r].cells[4] === p.rise && rb[r].cells[5] === p.set && ymd(sd) === ymd(addDays(own, -1))) shiftedPrevOk++; else if (ex.prev.length < 4) ex.prev.push(Z.n + ' ' + day + ' row ' + label(own) + ' dayStart date ' + ymd(sd) + ' BASE ' + rb[r].cells[4] + ' / ' + rb[r].cells[5] + ' engine(prev) ' + p.rise + ' / ' + p.set);
                    if (rb[r].cells[4] !== e.rise || rb[r].cells[5] !== e.set) { baseWrong++; zWrong++; }
                }
            }
        }
        perZone.push({ Z, changes, zVisits, zShifted, zWrong });
    }
    for (const p of perZone) console.log(`   ${p.Z.n.padEnd(12)} ${p.Z.tz.padEnd(20)} clock changes ${String(p.changes.length).padStart(2)} (${p.changes.join(' ') || '-'}), visits ${p.zVisits}, BASE rows on the wrong day ${p.zShifted}, visibly wrong ${p.zWrong}`);
    console.log(`   table code per render (mean): BASE ${(msB / visits).toFixed(2)} ms, CAND ${(msC / visits).toFixed(2)} ms`);
    ok(visits > 2500 && labelBad === 0, '[U] ' + visits + ' visits x 14 rows: both trees print the same 14 consecutive city dates, starting at the visit\'s city date', ex.label.join(' ; '));
    ok(otherCells === 0, '[U] date, Hijri, phase and illumination cells + today highlight identical BASE vs CAND on all ' + rowsN + ' rows (decision #11: phase / illumination not touched)', ex.other.join(' ; '));
    ok(candBad === 0, '[U] CAND: moonrise / moonset == MoonCalc.getMoonTimes at the city\'s own noon of the printed date, on all ' + rowsN + ' rows', ex.cand.join(' ; '));
    ok(alignedRows > 30000 && alignedDiff === 0, '[U] ' + alignedRows + ' rows whose getForecast window starts on their own date: byte-identical BASE vs CAND', ex.aligned.join(' ; '));
    ok(shiftedRows > 500 && shiftedPrevOk === shiftedRows, '[U] BASE reproduces the defect: on all ' + shiftedRows + ' rows whose window starts on another date it is always the PREVIOUS date and the row prints that date\'s engine times (' + baseWrong + ' visibly wrong)', ex.prev.join(' ; '));
    ok(perZone.filter((p) => p.Z.dst).every((p) => p.zWrong > 0) && perZone.filter((p) => !p.Z.dst).every((p) => p.zShifted === 0 && p.changes.length === 0), '[U] every DST zone has visibly wrong BASE rows; the non-DST zones (Mecca, Delhi +5:30, Jakarta) have none');
    ok(quietVisits > 1500 && quietDiff === 0, '[U] ' + quietVisits + ' visits with no clock change in the 14 days: whole table byte-identical BASE vs CAND', ex.quiet.join(' ; '));
    // decision #7 (owner, not done here): the 24 h window of getMoonTimes on the 25-hour fall-back day
    const LA = ZONES[3], SEA = ZONES[4];
    const n1 = exactNoon(2026, 11, 1, LA.tz);
    const la = rowsOf(runTable(tC, n1, n1, LA.lat, LA.lng, LA.tz))[0], sea = rowsOf(runTable(tC, n1, n1, SEA.lat, SEA.lng, SEA.tz))[0];
    ok(la && la.cells[4] === '--:--' && sea && sea.cells[4] === '--:--', '[U] decision #7 untouched: 1 November 2026 moonrise of Los Angeles (Horizons 23:34 PST) and Seattle (Horizons 23:20 PST) still "--:--" on CAND (25-hour day, js/moon.js window)');
}
// ---------------------------------------------------------------- servers + clock
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-fcdst-'));
const CLOCK_JS = path.join(tmp, 'test-clock.cjs'), CLOCK_FILE = path.join(tmp, 'clock.txt');
fs.writeFileSync(CLOCK_JS, [
    "'use strict';",
    '// TEST-ONLY fake clock (written by scripts/_smoke_today_pages_moon_forecast_dst_1.mjs into a temp dir; never in the repo).',
    '// Inert unless TP_SMOKE_CLOCK_FILE is set: Date.now()/new Date() = T + real time since the clock file was written.',
    "const fs = require('fs'); const FILE = process.env.TP_SMOKE_CLOCK_FILE;",
    'if (FILE) {',
    '  const R = Date; let cache = { at: -1e15, off: 0 };',
    '  const off = () => { const real = R.now(); if (real - cache.at > 100) { try { const st = fs.statSync(FILE); const T = Number(String(fs.readFileSync(FILE, "utf8")).trim()); cache = { at: real, off: isFinite(T) ? T - st.mtimeMs : 0 }; } catch (_e) { cache = { at: real, off: 0 }; } } return cache.off; };',
    '  class D extends R { constructor(...a) { if (a.length === 0) super(R.now() + off()); else super(...a); } static now() { return R.now() + off(); } }',
    '  D.UTC = R.UTC; D.parse = R.parse; Object.defineProperty(D, Symbol.hasInstance, { value: (x) => x instanceof R });',
    '  globalThis.Date = D;',
    '}', ''].join('\n'));
const setClock = async (iso) => { fs.writeFileSync(CLOCK_FILE, String(Date.parse(iso))); await sleep(250); };
const boot = (root, port) => spawn(process.execPath, ['-r', GUARD, '-r', CLOCK_JS, 'server.js'], { cwd: root, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0', TZ: 'UTC', TP_SMOKE_CLOCK_FILE: CLOCK_FILE } });
function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const handlers = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; } if (d.method) handlers.forEach((h) => h(d)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    return new Promise((res) => { ws.onopen = () => res({ send, on: (h) => handlers.push(h), close: () => ws.close() }); });
}
let kB = null, kC = null, chrome = null, cd = null;
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-fcdst-chrome-'));
const summary = [];
try {
    fs.writeFileSync(CLOCK_FILE, String(Date.parse('2026-10-18T10:00:00Z')));
    for (const pt of [PORT.base, PORT.cand]) { if ((await get(pt, '/health')).st !== 0) throw new Error('port ' + pt + ' is already in use - set TP_SMOKE_PORT'); }
    kB = boot(BASE_ROOT, PORT.base); kC = boot(ROOT, PORT.cand);
    for (const pt of [PORT.base, PORT.cand]) { for (let t = 0; t < 400; t++) { if ((await get(pt, '/health')).st === 200) break; await sleep(250); } }
    await sleep(300);
    ok(kB.exitCode === null && kC.exitCode === null, '\nboth servers are this run\'s own processes (alive after /health)');
    // resolve the nested hub of each city through its legacy 301
    const HUB = {};
    for (const s of ['london', 'berlin', 'new-york', 'los-angeles', 'sydney', 'jerusalem', 'cairo', 'beirut', 'makkah', 'seattle']) {
        const r = await get(PORT.cand, '/en/moon-in-' + s);
        HUB[s] = String(r.h.location || '').replace(/^https?:\/\/[^/]+/, '') || null;
    }
    console.log('   hubs: ' + Object.entries(HUB).map(([k, v]) => k + ' -> ' + v).join(' | '));
    ok(Object.values(HUB).every((v) => /^\/en\/moon\/[a-z-]+\/[a-z-]+$/.test(String(v))), '[B] every test city resolves to its nested /en/moon/{country}/{city} hub');
    // ------------------------------------------------------------ Chrome
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT.cdp, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    let ws = null;
    for (let i = 0; i < 60 && !ws; i++) { try { const r = await fetch('http://127.0.0.1:' + PORT.cdp + '/json/new?about:blank', { method: 'PUT' }); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl; } catch (_e) { /* not up */ } if (!ws) await sleep(250); }
    if (!ws) throw new Error('chrome did not start');
    cd = await cdp(ws);
    let uncaught = [];
    cd.on((d) => { if (d.method === 'Runtime.exceptionThrown') { const e = (d.params && d.params.exceptionDetails) || {}; uncaught.push(String((e.exception && e.exception.description) || e.text || '').split('\n')[0]); } });
    await cd.send('Network.enable'); await cd.send('Network.setBlockedURLs', { urls: AD_BLOCK }); await cd.send('Network.setBypassServiceWorker', { bypass: true }); await cd.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cd.send('Page.enable'); await cd.send('Runtime.enable');
    const ev = async (expr) => { const r = await cd.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
    let initId = null;
    // table rows + card + every other visible text of the page (live clocks normalised)
    const READ_JS = "(()=>{const g=(id)=>{const e=document.getElementById(id);return e?e.textContent.trim():null};const fb=document.getElementById('moon-forecast-body');const rows=fb?[...fb.querySelectorAll('tr')].map(tr=>({cls:tr.className,aria:tr.getAttribute('aria-current'),html:tr.outerHTML,cells:[...tr.children].map(td=>td.textContent.trim())})):[];const n=document.getElementById('moon-timezone-note');let rest='';if(fb){const sv=fb.innerHTML;fb.innerHTML='';rest=document.body.innerText;fb.innerHTML=sv;}return {card:{phase:g('moon-phase-name'),illum:g('moon-illumination-pct'),age:g('moon-age'),rise:g('moon-rise'),set:g('moon-set'),tzNote:(n&&!n.hidden)?n.textContent.trim():'',hijri:g('moon-hijri-greg')},rows,rest:rest.replace(/\\b\\d\\d:\\d\\d:\\d\\d\\b/g,'HMS')}})()";
    const load = async (port, p, nowIso, visitorTz) => {
        await setClock(nowIso);
        if (initId) await cd.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: initId });
        const src = '(()=>{try{localStorage.clear();sessionStorage.clear();}catch(_e){}const R=Date,T=' + Date.parse(nowIso) + ',off=T-R.now();' +
            'class D extends R{constructor(...a){if(a.length===0)super(R.now()+off);else super(...a);}static now(){return R.now()+off;}}' +
            'D.UTC=R.UTC;D.parse=R.parse;Object.defineProperty(D,Symbol.hasInstance,{value:(x)=>x instanceof R});globalThis.Date=D;})()';
        const r = await cd.send('Page.addScriptToEvaluateOnNewDocument', { source: src });
        initId = r.result && r.result.identifier;
        await cd.send('Emulation.setTimezoneOverride', { timezoneId: visitorTz });
        uncaught = [];
        await cd.send('Page.navigate', { url: 'http://127.0.0.1:' + port + p });
        for (let i = 0; i < 80; i++) { await sleep(200); if ((await ev('document.readyState')) === 'complete') break; }
        for (let i = 0; i < 50; i++) { const v = await ev("(document.querySelectorAll('#moon-forecast-body tr')||[]).length"); if (v >= 14) break; await sleep(200); }
        await sleep(500);
        return { got: await ev(READ_JS), uncaught: uncaught.slice() };
    };
    // in-page engine (the minified moon.js the page runs) for a list of city dates, at the city's own noon
    const engineInPage = async (dates, tz, lat, lng) => ev(`(()=>{const L=${JSON.stringify(dates.map((c) => exactNoon(c.y, c.m, c.d, tz)))};return L.map(N=>{const r=MoonCalc.getMoonTimes(new Date(N),${lat},${lng},${JSON.stringify(tz)});return {rise:r.rise,set:r.set}})})()`);
    // MET Norway values quoted in the report (VERIFY-REPORT 1b + verify-results [9]/[12]); ±10 min (engine accuracy)
    const MET = {
        berlin: { '2026-10-26': ['16:21', '07:22'], '2026-10-31': ['20:57', '13:25'] },
        'new-york': { '2026-11-03': ['00:26', '14:02'] },
        sydney: { '2027-04-05': ['04:09', '16:35'], '2027-04-06': ['05:09', '17:01'] },
        beirut: { '2026-10-25': ['16:10', '04:51'] },
        jerusalem: { '2027-03-26': ['23:18', '08:37'] },
        cairo: { '2026-10-30': ['20:57', '10:47'] }
    };
    const CASES = [
        { city: 'london', T: '2026-10-25T12:00:00Z', what: 'DST end day (12:00 GMT)', shifted: 13, visitors: ['Asia/Riyadh', 'Europe/London', 'America/Los_Angeles'] },
        { city: 'new-york', T: '2026-11-01T17:00:00Z', what: 'DST end day (12:00 EST)', shifted: 13 },
        { city: 'los-angeles', T: '2026-11-01T20:00:00Z', what: 'DST end day (12:00 PST)', shifted: 13 },
        { city: 'sydney', T: '2026-10-04T01:00:00Z', what: 'DST start day, switch 16:00Z the day before (12:00 AEDT)', shifted: 1 },
        { city: 'sydney', T: '2027-03-30T01:00:00Z', what: 'report case: visit 5 days before the fall-back (12:00 AEDT)', shifted: 8 },
        { city: 'sydney', T: '2027-04-04T02:00:00Z', what: 'DST end day (12:00 AEST): the engine\'s late midnight hides the fixed step', shifted: 0 },
        { city: 'jerusalem', T: '2026-10-24T09:00:00Z', what: 'day before the fall-back (12:00 IDT)', shifted: 12 },
        { city: 'jerusalem', T: '2026-10-25T10:00:00Z', what: 'DST end day, switch 23:00Z the day before (12:00 IST): hidden as in Sydney', shifted: 0 },
        { city: 'jerusalem', T: '2027-03-26T09:00:00Z', what: 'DST start day, switch 00:00Z (12:00 IDT)', shifted: 1 },
        { city: 'cairo', T: '2026-10-29T09:00:00Z', what: 'day of the 24:00 fall-back (12:00 EEST)', shifted: 13 },
        { city: 'cairo', T: '2027-04-30T09:00:00Z', what: 'DST start day, switch 22:00Z the day before (12:00 EEST)', shifted: 1 },
        { city: 'beirut', T: '2026-10-18T09:00:00Z', what: 'report case: visit a week before the 00:00 fall-back', shifted: 7 },
        { city: 'beirut', T: '2027-03-28T09:00:00Z', what: 'DST start day, switch 22:00Z the day before (12:00 EEST)', shifted: 1 },
        { city: 'berlin', T: '2026-10-18T10:00:00Z', what: 'report case: visit a week before the fall-back', shifted: 6 },
        { city: 'berlin', T: '2026-06-10T10:00:00Z', what: 'ordinary week (summer)', shifted: 0 },
        { city: 'new-york', T: '2026-07-01T16:00:00Z', what: 'ordinary week (summer)', shifted: 0 },
        { city: 'makkah', T: '2026-10-18T09:00:00Z', what: 'ordinary week (no DST)', shifted: 0 },
        { city: 'sydney', T: '2026-12-01T01:00:00Z', what: 'ordinary week (southern summer)', shifted: 0 }
    ];
    console.log('\n-- [B] headless Chrome, real pages BASE vs CAND');
    for (const C of CASES) {
        const p = HUB[C.city];
        await setClock(C.T);
        const sb = await get(PORT.base, p), sc = await get(PORT.cand, p);
        const fam = FAMOUS[C.city];
        const geo = geoOf(sc.b);
        const tz = fam ? fam.tz : metaOf(sc.b), lat = fam ? fam.lat : geo.lat, lng = fam ? fam.lng : geo.lng;
        // raw SSR: identical; a moon.city.tz meta difference can only come from item 1a (curated zone vs country zone)
        const bm = metaOf(sb.b), cm = metaOf(sc.b);
        const ssrSame = sb.st === 200 && sc.st === 200 && noise(bm === cm ? sb.b : setMeta(sb.b, cm || '')) === noise(sc.b);
        ok(ssrSame, '[B] ' + p + ' @' + C.T + ': raw SSR identical BASE vs CAND' + (bm !== cm ? ' apart from the moon.city.tz meta of item 1a (' + bm + ' -> ' + cm + '; the client uses FAMOUS ' + tz + ' on both)' : ''), firstDiff(noise(sb.b), noise(sc.b)));
        const t0 = Date.parse(C.T), c0 = cityDate(t0, tz);
        const dates = []; for (let i = -1; i < 14; i++) dates.push(addDays(c0, i));
        const fc = MoonCalc.getForecast(new Date(exactNoon(c0.y, c0.m, c0.d, tz)), lat, lng, 14, tz);
        const shiftedIdx = fc.map((r, i) => (sameDay(cityDate(r.dayStart.getTime(), tz), dates[i + 1]) ? -1 : i)).filter((i) => i >= 0);
        const visitors = C.visitors || ['Asia/Riyadh'];
        const candByVisitor = [];
        for (const V of visitors) {
            const B = await load(PORT.base, p, C.T, V), Cc = await load(PORT.cand, p, C.T, V);
            const eng = await engineInPage(dates, tz, lat, lng);   // eng[i] = date dates[i]; row r -> eng[r + 1], previous date -> eng[r]
            const b = B.got, c = Cc.got;
            const tag = p.replace('/en/moon/', '') + ' ' + ymd(c0) + ' [' + V + ']';
            console.log(`\n== ${tag}  ${C.what}  (zone ${tz}; getForecast windows on the previous date: rows ${shiftedIdx.length ? shiftedIdx.join(',') : 'none'})`);
            if (!b || !c || b.rows.length !== 14 || c.rows.length !== 14) { ok(false, '[B] ' + tag + ': 14 rows on both sides', JSON.stringify({ b: b && b.rows.length, c: c && c.rows.length })); continue; }
            const changed = [];
            for (let r = 0; r < 14; r++) {
                const br = b.rows[r], cr = c.rows[r];
                const mark = shiftedIdx.includes(r) ? '*' : ' ';
                console.log(`   ${mark} ${cr.cells[0].padEnd(28)} ${cr.cells[3].padStart(7)}  BASE ${br.cells[4]} / ${br.cells[5]}   CAND ${cr.cells[4]} / ${cr.cells[5]}   engine(own day) ${eng[r + 1].rise} / ${eng[r + 1].set}${cr.cls ? '  [' + cr.cls + ']' : ''}`);
                if (br.html !== cr.html) changed.push(r);
            }
            ok(c.rows.every((r, i) => r.cells[0] === label(dates[i + 1])) && b.rows.every((r, i) => r.cells[0] === c.rows[i].cells[0]), '[B] ' + tag + ': 14 consecutive city dates from ' + label(c0) + ', same on BASE and CAND');
            ok(c.rows.every((r, i) => r.cells[4] === eng[i + 1].rise && r.cells[5] === eng[i + 1].set), '[B] ' + tag + ': CAND moonrise / moonset == in-page getMoonTimes for each row\'s own city date (all 14 rows)', JSON.stringify(c.rows.map((r, i) => [r.cells[0], r.cells[4], r.cells[5], eng[i + 1]]).filter((x) => x[1] !== x[3].rise || x[2] !== x[3].set)).slice(0, 600));
            ok(b.rows.every((r, i) => JSON.stringify(r.cells.slice(0, 4)) === JSON.stringify(c.rows[i].cells.slice(0, 4)) && r.cls === c.rows[i].cls && r.aria === c.rows[i].aria), '[B] ' + tag + ': date, Hijri, phase, illumination cells and the today highlight identical BASE vs CAND (decision #11 not done)');
            ok(changed.every((r) => shiftedIdx.includes(r)) && b.rows.every((r, i) => shiftedIdx.includes(i) || r.html === c.rows[i].html), '[B] ' + tag + ': rows away from the clock change byte-identical BASE vs CAND (' + (14 - changed.length) + '/14 identical; changed rows ' + (changed.join(',') || 'none') + ')');
            ok(shiftedIdx.length === C.shifted && shiftedIdx.every((r) => b.rows[r].cells[4] === eng[r].rise && b.rows[r].cells[5] === eng[r].set) && (C.shifted === 0 ? changed.length === 0 : changed.length > 0), '[B] ' + tag + ': ' + (C.shifted ? 'BASE reproduces the defect: the ' + C.shifted + ' row(s) after the clock change carry the PREVIOUS date\'s engine times (' + changed.length + ' visibly wrong, ' + (shiftedIdx.length - changed.length) + ' coincide)' : 'no getForecast window starts on another date: whole table identical'), JSON.stringify({ shiftedIdx, changed }));
            ok(JSON.stringify(b.card) === JSON.stringify(c.card) && b.rest === c.rest, '[B] ' + tag + ': card (phase, illumination, age, rise, set, zone note, Hijri card) and the rest of the page text identical BASE vs CAND', JSON.stringify(b.card) === JSON.stringify(c.card) ? firstDiff(b.rest, c.rest) : JSON.stringify({ b: b.card, c: c.card }));
            ok(JSON.stringify(B.uncaught.slice().sort()) === JSON.stringify(Cc.uncaught.slice().sort()), '[B] ' + tag + ': same uncaught exceptions BASE / CAND (' + B.uncaught.length + ' / ' + Cc.uncaught.length + ')', B.uncaught.join(' | ') + ' vs ' + Cc.uncaught.join(' | '));
            if (c.rows[0] && c.rows[0].cls.includes('fc-row-today')) ok(c.rows[0].cells[4] === eng[1].rise && c.rows[0].cells[5] === eng[1].set, '[B] ' + tag + ': the highlighted today row carries today\'s own times (' + c.rows[0].cells[4] + ' / ' + c.rows[0].cells[5] + ')');
            const met = MET[C.city] || {};
            for (const [d, [mr, ms]] of Object.entries(met)) {
                const i = dates.findIndex((x) => ymd(x) === d) - 1; if (i < 0) continue;
                const cr = c.rows[i], br = b.rows[i];
                const good = within(hm12(cr.cells[4]), hm24(mr), 10) && within(hm12(cr.cells[5]), hm24(ms), 10);
                ok(good, '[B] ' + tag + ': row ' + label(dates[i + 1]) + ' CAND ' + cr.cells[4] + ' / ' + cr.cells[5] + ' within 10 min of MET Norway ' + mr + ' / ' + ms + ' (report) — BASE ' + br.cells[4] + ' / ' + br.cells[5]);
                if (V === visitors[0]) summary.push(`   MET ${C.city} ${d}: MET ${mr} / ${ms}   BASE ${br.cells[4]} / ${br.cells[5]}   CAND ${cr.cells[4]} / ${cr.cells[5]}`);
            }
            if (V === visitors[0]) summary.push(`   ${tag.padEnd(48)} ${C.what}: ${changed.length} row(s) corrected (${changed.map((r) => c.rows[r].cells[0].replace(/ 20\d\d$/, '') + ' ' + b.rows[r].cells[4] + '/' + b.rows[r].cells[5] + ' -> ' + c.rows[r].cells[4] + '/' + c.rows[r].cells[5]).slice(0, 3).join('; ')}${changed.length > 3 ? '; …' : ''})`);
            candByVisitor.push(c);
        }
        if (candByVisitor.length > 1) ok(candByVisitor.every((x) => JSON.stringify(x.rows.map((r) => r.cells)) === JSON.stringify(candByVisitor[0].rows.map((r) => r.cells))), '[B] ' + p + ': CAND table identical for visitors in ' + visitors.join(', '));
    }
    // ------------------------------------------------------------ JPL Horizons (report, item 1a, Seattle 47.605 N 122.33 W) + decision #7
    console.log('\n-- [B] Seattle (CAND; its zone America/Los_Angeles comes from item 1a) vs JPL Horizons values of the report');
    {
        const p = HUB.seattle;
        for (const T of ['2026-10-25T19:00:00Z', '2026-11-01T19:00:00Z']) {
            await setClock(T);
            const sc = await get(PORT.cand, p); const geo = geoOf(sc.b), tz = metaOf(sc.b);
            ok(tz === 'America/Los_Angeles' && !!geo, '[B] ' + p + ' CAND meta America/Los_Angeles (item 1a), geo ' + JSON.stringify(geo));
            const Cc = await load(PORT.cand, p, T, 'Asia/Riyadh'); const c = Cc.got;
            const c0 = cityDate(Date.parse(T), tz);
            // BASE's table logic in the same page and zone: getForecast's own rise / set
            const fcPage = await ev(`(()=>{const N=${exactNoon(c0.y, c0.m, c0.d, tz)};return MoonCalc.getForecast(new Date(N),${geo.lat},${geo.lng},14,${JSON.stringify(tz)}).map(r=>({rise:r.rise,set:r.set}))})()`);
            const row = (lbl) => { const i = c.rows.findIndex((r) => r.cells[0] === lbl); return i < 0 ? null : { i, cand: c.rows[i].cells, base: fcPage[i] }; };
            const o31 = row('Saturday 31 October 2026'), n1 = row('Sunday 1 November 2026'), n2 = row('Monday 2 November 2026');
            console.log(`   visit ${ymd(c0)}: 31 Oct ${o31 && o31.cand[4]} / ${o31 && o31.cand[5]} | 1 Nov ${n1 && n1.cand[4]} / ${n1 && n1.cand[5]} | 2 Nov CAND ${n2 && n2.cand[4]} / ${n2 && n2.cand[5]}, getForecast (BASE logic) ${n2 && n2.base.rise} / ${n2 && n2.base.set}`);
            if (o31) {
                ok(within(hm12(o31.cand[4]), hm24('22:58'), 10) && o31.cand[4] === o31.base.rise && o31.cand[5] === o31.base.set, '[B] Seattle row 31 October (before the change): moonrise ' + o31.cand[4] + ' within 10 min of Horizons 2026-Nov-01 05:58Z = 22:58 PDT; CAND == getForecast');
                summary.push(`   Horizons Seattle 31 Oct rise 05:58Z = 22:58 PDT   CAND ${o31.cand[4]} (== getForecast ${o31.base.rise})`);
            }
            ok(n1 && within(hm12(n1.cand[5]), hm24('13:45'), 10) && n1.cand[5] === n1.base.set && n1.cand[4] === '--:--', '[B] Seattle row 1 November (the 25-hour day): moonset ' + (n1 && n1.cand[5]) + ' within 10 min of Horizons 2026-Nov-01 21:45Z = 13:45 PST; moonrise "--:--" although Horizons has 2026-Nov-02 07:20Z = 23:20 PST (decision #7, js/moon.js, not done here)');
            ok(n2 && n2.base.set === n1.base.set && n2.base.rise === n1.base.rise && within(hm12(n2.base.set), hm24('13:45'), 10) && n2.cand[5] !== n2.base.set && hm12(n2.cand[5]) - hm12(n1.cand[5]) >= 20, '[B] Seattle row 2 November: getForecast (BASE logic, same zone) repeats 1 November\'s ' + (n2 && n2.base.rise) + ' / ' + (n2 && n2.base.set) + ' = Horizons\' 1 November moonset 13:45 PST (previous day); CAND prints 2 November\'s own ' + (n2 && n2.cand[4]) + ' / ' + (n2 && n2.cand[5]));
            if (n1 && n2) summary.push(`   Horizons Seattle 1 Nov set 21:45Z = 13:45 PST (visit ${ymd(c0)})   row 1 Nov CAND ${n1.cand[5]}; row 2 Nov BASE-logic ${n2.base.set} (= 1 Nov) -> CAND ${n2.cand[5]}`);
        }
    }
    if (cd) cd.close();
} finally {
    for (const k of [kB, kC]) { try { if (k && k.exitCode === null) k.kill(); } catch (_) { /* gone */ } }
    if (chrome) { try { chrome.kill(); } catch (_) { /* gone */ } }
}
console.log('\n-- summary');
for (const s of summary) console.log(s);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
