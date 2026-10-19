// TODAY-PAGES-ACCURACY-1 item 1a — local regression guard (no network: outbound guard on both servers, every
//   non-loopback host unresolvable in Chrome, ad / analytics URLs blocked, ADSENSE_CLIENT=off).
//   Defect: the moon city pages (/moon/{country}/{city}, its month and year pages, 10 languages) took their time zone
//   from the COUNTRY (`_CC_TO_PRIMARY_TZ[cc]`): <meta name="moon.city.tz"> said America/New_York for Seattle, and
//   the client computes the whole card (day, phase, illumination, age, rise/set, zone note, 14-day table) with that
//   meta for every city outside FAMOUS_MOON_CITIES. Cities of countries missing from that map (Riga) got no zone
//   at all, db-only cities (denver) the country zone. Separately the city-local-noon helpers
//   (_moonCityLocalNoonSsr / _moonCityLocalNoon) read the hour alone and returned TOMORROW's noon all year at
//   UTC+12 and beyond (Auckland, Apia), on the server (intro / JSON-LD) and in the client alike.
//   Fix: seo.moonCity.tz = discovered zone || _ssrMoonCityIana(slug, cc, lat, lng) = _ssrCityIana (the prayer pages'
//   resolver: curated zone -> discovered -> gated coordinate lookup -> country zone) EXCEPT on slug collisions
//   (the slug's curated record describes another place: other country or > 1 deg away, the `_samePlace` test), which
//   keep the country zone exactly as before (decision #14 / SSR-CITY-SLUG-COLLISION-1); the year page's last tier
//   the same; both noon helpers add 24 h per day the local date at 12:00 UTC is ahead of the city date (0 below +12
//   -> same instant). js/moon.js untouched; no visible string, i18n or ?v change.
//   Visible on purpose (decision #13, registered data used as is, owner approval pending): al-quneitra
//   Asia/Damascus -> Asia/Jerusalem and sokhumi Asia/Tbilisi -> Europe/Moscow (printed by [X]).
//   BASE = clean production tree (env TP_BASE_ROOT), CAND = this tree. One BASE + one CAND server; both read the
//   SAME test clock (a TEST-ONLY preload written to a temp dir by this script, never in the repo, inert unless
//   TP_SMOKE_CLOCK_FILE is set: Date.now()/new Date() = T + real time since the clock file was written). Chrome
//   gets the same instant through a Date override and a visitor time zone (Emulation.setTimezoneOverride).
//   [S] source: BASE premise (country zone) + CAND resolver lines; js/moon.js, i18n, index.html (?v), sw.js,
//       curated-places.json, umm-al-qura.json byte-identical; CRLF kept.
//   [U] the two noon helpers, every curated / primary zone, every 31 h over 2026-2027 + hourly around DST changes:
//       CAND server == CAND client; CAND = 12:xx on the city date always; CAND == BASE wherever the local date at
//       12:00 UTC is the city date (every zone below +12: half-hour zones keep their 12:30 / 12:45 = decision #10);
//       BASE = tomorrow on 100% of the >= +12 samples (defect reproduced).
//   [X] raw SSR, all curated cities (en; ar every 7th): zone == country zone -> byte-identical; other zone -> only
//       the meta value; country without primary zone -> only the meta line added; >= +12 -> meta + JSON-LD numbers
//       (CAND == engine at the city's noon, BASE == tomorrow's); slug collisions -> meta == BASE and the page
//       byte-identical (#14 not done).
//   [M] month page summary vs its own calendar (Seattle; collisions orlando / columbia: summary == calendar and
//       BASE == CAND), month links at 22:30 PDT Oct 31, year page of a db-only city (denver), country pages (only
//       New Zealand moves: same noon helper), other pages identical.
//   [B] headless Chrome, post-JS values vs the engine called with the CITY zone at the city's noon (in-page
//       MoonCalc, independent noon): Seattle vs New York, Jayapura vs Jakarta, Auckland (+13 / +12 / DST start),
//       Riga, denver; Seattle 1 min before / after its own midnight and New York's midnight; Seattle DST end
//       (2026-11-01) and start (2027-03-14). BASE wrong / CAND right; controls identical; visitor-zone independent;
//       slug collisions orlando (en + ar) / columbia: card == JSON-LD and BASE == CAND.
//   node scripts/_smoke_today_pages_moon_city_tz_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT, TP_CHROME)
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
const P0 = Number(process.env.TP_SMOKE_PORT || 9720);
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
const diffLines = (a, b) => { const A = a.split('\n'), B = b.split('\n'); if (A.length !== B.length) return null; const out = []; for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) out.push([A[i], B[i]]); return out; };
const META_RE = /<meta name="moon\.city\.tz" content="([^"]*)">/;
const metaOf = (h) => { const m = h.match(META_RE); return m ? m[1] : null; };
const dropMeta = (h) => h.replace(/\r?\n[ \t]*<meta name="moon\.city\.tz" content="[^"]*">/, '');
const setMeta = (h, v) => h.replace(META_RE, () => '<meta name="moon.city.tz" content="' + v + '">');
const geoOf = (h) => { const m = h.match(/<meta name="geo\.position" content="(-?[\d.]+);(-?[\d.]+)"/); return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null; };
const ARTICLE_RE = /<script id="ssr-moon-article-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/;
const articleIllum = (h) => { const a = (h.match(ARTICLE_RE) || [])[1] || ''; const m = a.match(/(\d{1,3}\.\d{2})\s?[%٪]/); return m ? Number(m[1]) : null; };
// ---------------------------------------------------------------- time helpers (Intl, independent of the page code)
const FMT = new Map();
const fmtFor = (tz) => { if (!FMT.has(tz)) FMT.set(tz, new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })); return FMT.get(tz); };
const partsAt = (ms, tz) => { const o = {}; for (const p of fmtFor(tz).formatToParts(new Date(ms))) if (p.type !== 'literal') o[p.type] = Number(p.value); return o; };
const offMin = (ms, tz) => { const p = partsAt(ms, tz); return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000) / 60000); };
const exactNoon = (y, m, d, tz) => { const naive = Date.UTC(y, m - 1, d, 12); let t = naive - offMin(naive, tz) * 60000; t = naive - offMin(t, tz) * 60000; return t; };
const cityDate = (ms, tz) => { const p = partsAt(ms, tz); return { y: p.year, m: p.month, d: p.day }; };
const noonOf = (ms, tz) => { const c = cityDate(ms, tz); return exactNoon(c.y, c.m, c.d, tz); };
const EN_WD = (ms, tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long' }).format(new Date(ms));
const EN_MO = (m) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1];
const dateLabel = (ms, tz) => { const c = cityDate(ms, tz); return EN_WD(ms, tz) + ' ' + c.d + ' ' + EN_MO(c.m) + ' ' + c.y; };
const MoonCalc = require(path.join(ROOT, 'js/moon.js'));
// ---------------------------------------------------------------- source helpers
const srvB = fs.readFileSync(path.join(BASE_ROOT, 'server.js'), 'utf8'), srvC = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const appB = fs.readFileSync(path.join(BASE_ROOT, 'js/app.js'), 'utf8'), appC = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
const grabFn = (src, name) => { const a = src.indexOf('function ' + name + '('); if (a < 0) return ''; let i = src.indexOf('{', a), dep = 0; for (; i < src.length; i++) { if (src[i] === '{') dep++; else if (src[i] === '}') { dep--; if (!dep) break; } } return src.slice(a, i + 1); };
const mkFn = (src, name) => new Function(src + '\nreturn ' + name + ';')();
const grabObj = (src, decl) => { const a = src.indexOf(decl); let i = src.indexOf('{', a), dep = 0; for (; i < src.length; i++) { if (src[i] === '{') dep++; else if (src[i] === '}') { dep--; if (!dep) break; } } return new Function('return ' + src.slice(src.indexOf('{', a), i + 1))(); };
const PRIMARY = grabObj(srvC, 'const _CC_TO_PRIMARY_TZ = {');
const CUR = (() => { const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'db/places/curated-places.json'), 'utf8')); return Array.isArray(j) ? j : (j.places || []); })();
// ---------------------------------------------------------------- [S]
console.log('-- [S] source');
const BASE_TZ_LINE = "const _moonTz = _moonDiscoveredTz || (_moonCc ? (_CC_TO_PRIMARY_TZ[_moonCc] || null) : null);";
const CAND_TZ_LINE = "const _moonTz = _moonDiscoveredTz || (_moonCc ? (_ssrMoonCityIana(citySlug, _moonCc, cityGeo.lat, cityGeo.lng) || null) : null);";
ok(srvB.includes(BASE_TZ_LINE), '[S] BASE: seo.moonCity.tz = discovered zone || the COUNTRY zone _CC_TO_PRIMARY_TZ[cc] (defect premise)');
ok(srvC.split(CAND_TZ_LINE).length === 2 && !srvC.includes(BASE_TZ_LINE), '[S] CAND: seo.moonCity.tz = discovered zone || _ssrMoonCityIana(citySlug, cc, lat, lng), once');
const BASE_YC = "|| (_ycDisc && _ycDisc.timezone) || (_CC_TO_PRIMARY_TZ[_yc.cc] || null);";
const CAND_YC = "|| (_ycDisc && _ycDisc.timezone) || (_ssrMoonCityIana(_yc.citySlug, _yc.cc, _ycLat, _ycLng) || null);";
ok(srvB.includes(BASE_YC) && srvC.includes(CAND_YC) && !srvC.includes(BASE_YC) && srvC.indexOf('const _ycLng = ') < srvC.indexOf(CAND_YC), '[S] year page _ycTz: curated / discovered tiers unchanged, last tier _ssrMoonCityIana instead of the country zone (declared after _ycLat/_ycLng)');
// _ssrMoonCityIana = the prayer resolver (untouched) + the collision guard, which applies `_samePlace` copied verbatim
{
    const fM = grabFn(srvC, '_ssrMoonCityIana'), fI = grabFn(srvC, '_ssrCityIana'), fIB = grabFn(srvB, '_ssrCityIana');
    const sp = (f) => { const a = f.indexOf('const _samePlace = (rec) => {'); return a < 0 ? null : f.slice(a, f.indexOf('};', a) + 2).replace(/\r/g, ''); };
    ok(!!fIB && fI === fIB, '[S] _ssrCityIana (the prayer-city resolver) byte-identical to BASE');
    ok(!!sp(fM) && sp(fM) === sp(fI), '[S] _ssrMoonCityIana applies the very same `_samePlace` test (verbatim copy of _ssrCityIana\'s)');
    const body = fM.replace(/\r/g, '');
    ok(/if \(_cur && !_samePlace\(_cur\)\) return \(typeof _CC_TO_PRIMARY_TZ !== 'undefined'\) \? \(_CC_TO_PRIMARY_TZ\[cc\] \|\| null\) : null;/.test(body) && /\n    return _ssrCityIana\(slug, cc, lat, lng\);\n\}$/.test(body), '[S] _ssrMoonCityIana: curated record of ANOTHER place -> the country zone (BASE behaviour); otherwise exactly _ssrCityIana');
}
const cntPrim = (s) => (s.split(/\r?\n/).map((l) => l.replace(/^\s*\/\/.*$/, '')).join('\n').match(/_CC_TO_PRIMARY_TZ\[/g) || []).length;   // code lines only
ok(cntPrim(srvB) - cntPrim(srvC) === 1, '[S] the two moon-page country-zone lookups are gone, the only new one is the collision fallback (' + cntPrim(srvB) + ' -> ' + cntPrim(srvC) + ' _CC_TO_PRIMARY_TZ[...] uses)');
for (const f of ['js/moon.js', 'db/hijri/umm-al-qura.json', 'index.html', 'sw.js', 'js/i18n.js', 'js/i18n/en.js', 'js/i18n/ar.js', 'db/places/curated-places.json', 'js/hijri-date.js']) {
    const pb = path.join(BASE_ROOT, f), pc = path.join(ROOT, f);
    if (!fs.existsSync(pb) && !fs.existsSync(pc)) continue;
    ok(fs.readFileSync(pb).equals(fs.readFileSync(pc)), '[S] ' + f + ' untouched (byte-identical to BASE' + (f === 'index.html' ? ': same app.js?v / i18n version' : '') + ')');
}
for (const [n, s] of [['server.js', srvC], ['js/app.js', appC]]) ok((s.match(/\r\n/g) || []).length === (s.match(/\n/g) || []).length, '[S] CAND ' + n + ' keeps CRLF line endings throughout');
// ---------------------------------------------------------------- [U]
console.log('-- [U] the city-local-noon helpers (server + client), BASE vs CAND');
const nSB = mkFn(grabFn(srvB, '_moonCityLocalNoonSsr'), '_moonCityLocalNoonSsr'), nSC = mkFn(grabFn(srvC, '_moonCityLocalNoonSsr'), '_moonCityLocalNoonSsr');
const nCB = mkFn(grabFn(appB, '_moonCityLocalNoon'), '_moonCityLocalNoon'), nCC = mkFn(grabFn(appC, '_moonCityLocalNoon'), '_moonCityLocalNoon');
{
    const zones = [...new Set(CUR.map((p) => p.timezone).concat(Object.values(PRIMARY)).filter((z) => typeof z === 'string' && z.includes('/')))].sort();
    const inst = [];
    for (let t = Date.UTC(2026, 0, 1); t < Date.UTC(2028, 0, 1); t += 31 * 3600000) inst.push(t);
    const DST_DAYS = ['2026-03-08', '2026-11-01', '2027-03-14', '2027-11-07', '2026-03-29', '2026-10-25', '2027-03-28', '2027-10-31', '2026-04-05', '2026-09-27', '2027-04-04', '2027-09-26', '2026-10-04', '2027-10-03', '2026-03-27', '2026-09-06'];
    let n = 0, srvCli = 0, candBad = 0, sameNeeded = 0, sameOk = 0, plus12 = 0, baseWrong12 = 0, half = 0, halfKept = 0, baseMirror = 0; const badEx = [], diffEx = [];
    const check = (tz, t) => {
        n++;
        const d = new Date(t), a = nSC(tz, d), c = nCC(tz, d), b = nSB(tz, d);
        if (!a || !c || a.getTime() !== c.getTime()) { srvCli++; if (badEx.length < 5) badEx.push('srv!=cli ' + tz + ' ' + d.toISOString()); }
        if (n % 9 === 0) { const e = nCB(tz, d); if (!e || !b || e.getTime() !== b.getTime()) baseMirror++; }
        const want = cityDate(t, tz), got = partsAt(a.getTime(), tz);
        if (!(got.year === want.y && got.month === want.m && got.day === want.d && got.hour === 12)) { candBad++; if (badEx.length < 5) badEx.push('cand ' + tz + ' ' + d.toISOString() + ' -> ' + a.toISOString()); }
        const noonUtc = Date.UTC(want.y, want.m - 1, want.d, 12), seen = cityDate(noonUtc, tz);
        const ahead = Date.UTC(seen.y, seen.m - 1, seen.d) > Date.UTC(want.y, want.m - 1, want.d);
        if (!ahead) { sameNeeded++; if (b && a.getTime() === b.getTime()) sameOk++; else if (diffEx.length < 5) diffEx.push(tz + ' ' + d.toISOString() + ' BASE ' + (b && b.toISOString()) + ' CAND ' + a.toISOString()); if (got.minute) { half++; if (b && a.getTime() === b.getTime()) halfKept++; } }
        else { plus12++; const bp = partsAt(b.getTime(), tz); if (!(bp.year === want.y && bp.month === want.m && bp.day === want.d)) baseWrong12++; }
    };
    for (const tz of zones) for (const t of inst) check(tz, t);
    for (const day of DST_DAYS) {
        const [y, m, dd] = day.split('-').map(Number), c0 = Date.UTC(y, m - 1, dd);
        for (const tz of zones) {
            if (offMin(c0 - 86400000 * 1.5, tz) === offMin(c0 + 86400000 * 1.5, tz)) continue;   // no clock change near this day
            for (let t = c0 - 86400000 * 1.5; t <= c0 + 86400000 * 1.5; t += 3600000) check(tz, t);
        }
    }
    console.log(`   ${zones.length} zones, ${n} samples (every 31 h over 2026-2027 + hourly over ±36 h of ${DST_DAYS.length} clock-change days)`);
    ok(srvCli === 0, '[U] CAND server _moonCityLocalNoonSsr == CAND client _moonCityLocalNoon on every sample', badEx.join(' ; '));
    ok(baseMirror === 0, '[U] BASE server == BASE client (the two were mirrors before; checked on every 9th sample)');
    ok(candBad === 0, '[U] CAND: the returned instant is 12:xx on the CITY\'s own local date, every sample (' + candBad + ' bad)', badEx.join(' ; '));
    ok(sameNeeded > 0 && sameOk === sameNeeded, '[U] CAND == BASE (same instant) on all ' + sameNeeded + ' samples where 12:00 UTC is still the city date (every zone below +12)', diffEx.join(' ; '));
    ok(half > 0 && halfKept === half, '[U] half-hour / 45-min zones unchanged: ' + halfKept + '/' + half + ' samples keep BASE\'s 12:30 / 12:45 (refinement = owner decision #10, not done)');
    ok(plus12 > 0 && baseWrong12 === plus12, '[U] BASE reproduces the defect: tomorrow\'s noon on ' + baseWrong12 + '/' + plus12 + ' samples at UTC+12 and beyond (CAND: 0 wrong)');
}
// ---------------------------------------------------------------- servers + clock
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-mtz-'));
const CLOCK_JS = path.join(tmp, 'test-clock.cjs'), CLOCK_FILE = path.join(tmp, 'clock.txt');
fs.writeFileSync(CLOCK_JS, [
    "'use strict';",
    '// TEST-ONLY fake clock (written by scripts/_smoke_today_pages_moon_city_tz_1.mjs into a temp dir; never in the repo).',
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
const T_SCAN = '2026-10-18T19:05:00Z';
let kB = null, kC = null, chrome = null, cd = null;
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-mtz-chrome-'));
const summary = [];
try {
    fs.writeFileSync(CLOCK_FILE, String(Date.parse(T_SCAN)));
    for (const pt of [PORT.base, PORT.cand]) { if ((await get(pt, '/health')).st !== 0) throw new Error('port ' + pt + ' is already in use - set TP_SMOKE_PORT'); }
    kB = boot(BASE_ROOT, PORT.base); kC = boot(ROOT, PORT.cand);
    for (const pt of [PORT.base, PORT.cand]) { for (let t = 0; t < 400; t++) { if ((await get(pt, '/health')).st === 200) break; await sleep(250); } }
    await sleep(300);
    ok(kB.exitCode === null && kC.exitCode === null, 'both servers are this run\'s own processes (alive after /health)');
    // ------------------------------------------------------------ [X]
    console.log('\n-- [X] raw SSR of every curated city hub at ' + T_SCAN + ' (en; ar every 7th city)');
    await setClock(T_SCAN);
    const tScan = Date.parse(T_SCAN);
    const cls = { same: 0, zone: 0, added: 0, plus12: 0, collision: 0, skipped: 0, non200: 0 }; const non200 = []; const bad = { same: [], zone: [], added: [], plus12: [], collision: [] }; const skipped = [];
    let arChecked = 0; const arBad = []; const collisionLog = []; const d13 = {};
    const one = async (cur, L) => {
        const lp = L === 'ar' ? '' : '/' + L;
        const r = await get(PORT.cand, lp + '/moon-in-' + cur.slug);
        const loc = String(r.h.location || '').replace(/^https?:\/\/[^/]+/, '');
        if (r.st !== 301 || !new RegExp('^' + lp + '/moon/[a-z0-9-]+/[a-z0-9.-]+$').test(loc)) { if (L === 'en') { cls.skipped++; skipped.push(cur.slug + ' ' + r.st + ' ' + loc); } return; }
        const [b, c] = await Promise.all([get(PORT.base, loc), get(PORT.cand, loc)]);
        if (b.st !== 200 || c.st !== 200) {   // a pre-existing non-200 nested URL: must stay exactly as it is
            if (b.st === c.st && noise(b.b) === noise(c.b)) { if (L === 'en') { cls.non200++; non200.push(loc + ' ' + b.st); } }
            else (L === 'en' ? bad.same : arBad).push(loc + ' st ' + b.st + '/' + c.st);
            return;
        }
        const cc = String(cur.countryCode || '').toLowerCase(), ctz = cur.timezone, ptz = PRIMARY[cc] || null;
        const bm = metaOf(b.b), cm = metaOf(c.b), geo = geoOf(c.b);
        if (cur.slug === 'al-quneitra' || cur.slug === 'sokhumi') d13[cur.slug + ' ' + L] = { loc, bm, cm, ctz };
        const nb = noise(b.b), nc = noise(c.b);
        // collision = the page describes another place than the curated record: coordinates of a namesake abroad, or the
        // page resolved under another country (BASE meta = that country's zone, e.g. /moon/china/hong-kong, /moon/syria/saida)
        const collision = !geo || Math.abs(geo.lat - cur.lat) > 1 || Math.abs(geo.lng - cur.lng) > 1 || bm !== ptz;
        const p12 = offMin(tScan, ctz) >= 720;
        let kind, good, why = '';
        if (collision) {
            // decision #14 not done: the meta stays BASE's and the page is byte-identical; the only tolerated difference
            // is the shared noon helper moving JSON-LD / FAQ numbers when a zone the page uses is at UTC+12 or beyond
            kind = 'collision';
            let same = nb === nc, dl = null;
            if (!same && bm === cm) { dl = diffLines(nb, nc); same = !!dl && dl.every(([x, y]) => /ssr-moon-article-schema|FAQPage|moon-faq|"@type":"Question"/.test(x + y)) && [ctz, bm].some((z) => z && offMin(tScan, z) >= 720); }
            good = bm === cm && same; why = 'meta ' + bm + ' -> ' + cm + (nb === nc ? '' : ' ' + firstDiff(nb, nc).slice(0, 400));
            if (L === 'en') collisionLog.push(cur.slug + (nb === nc ? '' : '*') + ' ' + (bm || 'no meta'));
        } else if (p12) {
            kind = 'plus12';
            const nb2 = bm ? noise(setMeta(b.b, cm || '')) : nb, nc2 = bm ? nc : noise(dropMeta(c.b));
            const dl = diffLines(nb2, nc2);
            const onlyValues = !!dl && dl.every(([x, y]) => /ssr-moon-article-schema|FAQPage|moon-faq|"@type":"Question"/.test(x + y));
            const cd0 = cityDate(tScan, ctz), noonC = exactNoon(cd0.y, cd0.m, cd0.d, ctz);
            const nx = new Date(Date.UTC(cd0.y, cd0.m - 1, cd0.d + 1)), noonN = exactNoon(nx.getUTCFullYear(), nx.getUTCMonth() + 1, nx.getUTCDate(), ctz);
            const ci = articleIllum(c.b), bi = articleIllum(b.b);
            const wantC = MoonCalc.getMoonIllumination(new Date(noonC)), wantB = MoonCalc.getMoonIllumination(new Date(noonN));
            good = cm === ctz && onlyValues && ci === wantC && bi === wantB && ci !== bi;
            why = 'meta ' + bm + ' -> ' + cm + ' JSON-LD ' + bi + '% -> ' + ci + '% (engine: city noon ' + wantC + '%, tomorrow ' + wantB + '%)' + (onlyValues ? '' : ' other lines differ: ' + JSON.stringify(dl && dl.slice(0, 2)).slice(0, 400));
            if (L === 'en') summary.push('   +12  ' + cur.slug + ' (' + ctz + ')  ' + why);
        } else if (ctz === ptz) {
            kind = 'same'; good = bm === ptz && cm === ctz && nb === nc; why = firstDiff(nb, nc);
        } else if (ptz) {
            kind = 'zone'; good = bm === ptz && cm === ctz && noise(setMeta(b.b, ctz)) === nc; why = 'meta ' + bm + ' -> ' + cm + ' ' + firstDiff(noise(setMeta(b.b, ctz)), nc);
        } else {
            kind = 'added'; good = bm === null && cm === ctz && noise(dropMeta(c.b)) === nb; why = 'meta ' + bm + ' -> ' + cm + ' ' + firstDiff(noise(dropMeta(c.b)), nb);
        }
        if (L === 'en') { cls[kind]++; if (!good) bad[kind].push(loc + ' ' + why); }
        else { arChecked++; if (!good) arBad.push(loc + ' [' + kind + '] ' + why); }
    };
    const jobs = [];
    const AR_ALWAYS = new Set(['al-quneitra', 'sokhumi', 'orlando', 'columbia']);
    CUR.forEach((cur, i) => { jobs.push([cur, 'en']); if (i % 7 === 0 || AR_ALWAYS.has(cur.slug)) jobs.push([cur, 'ar']); });
    let next = 0;
    await Promise.all(Array.from({ length: 4 }, async () => { while (next < jobs.length) { const j = jobs[next++]; await one(j[0], j[1]); } }));
    console.log(`   en: ${CUR.length} curated cities -> zone == country zone ${cls.same}, other zone ${cls.zone}, country without primary zone ${cls.added}, UTC+12 and beyond ${cls.plus12}, slug collisions ${cls.collision}, non-200 on both ${cls.non200}, not a nested moon hub ${cls.skipped}`);
    if (skipped.length) console.log('   not served as /moon/{country}/{city}: ' + skipped.slice(0, 12).join(' | '));
    if (non200.length) console.log('   pre-existing non-200 nested hubs (identical BASE / CAND): ' + non200.join(' | '));
    ok(cls.same > 2000 && bad.same.length === 0, '[X] ' + cls.same + ' cities whose zone == the country zone (below +12): HTML byte-identical BASE vs CAND (noise normalised)', bad.same.slice(0, 4).join(' ; '));
    ok(cls.zone > 100 && bad.zone.length === 0, '[X] ' + cls.zone + ' cities in another zone of their country: BASE meta = country zone, CAND meta = the city\'s curated zone, nothing else differs', bad.zone.slice(0, 4).join(' ; '));
    ok(cls.added > 100 && bad.added.length === 0, '[X] ' + cls.added + ' cities of countries missing from _CC_TO_PRIMARY_TZ: BASE no meta, CAND adds <meta name="moon.city.tz"> = the curated zone, nothing else differs', bad.added.slice(0, 4).join(' ; '));
    ok(cls.plus12 > 5 && bad.plus12.length === 0, '[X] ' + cls.plus12 + ' cities at UTC+12 and beyond: CAND meta = curated zone; JSON-LD illumination CAND == engine at the city\'s noon, BASE == tomorrow\'s noon; only those value lines differ', bad.plus12.slice(0, 4).join(' ; '));
    console.log('   slug collisions (meta; * = JSON-LD numbers moved by the +12 noon fix): ' + collisionLog.sort().join(' | '));
    ok(cls.collision > 50 && bad.collision.length === 0, '[X] ' + cls.collision + ' slug-collision pages (namesake coordinates / another country): CAND meta == BASE meta and the page byte-identical (SSR-CITY-SLUG-COLLISION-1 / decision #14 not done)', bad.collision.slice(0, 6).join(' ; '));
    for (const [s, st] of [['orlando', 'Florida'], ['columbia', 'South Carolina']]) ok(collisionLog.includes(s + ' America/New_York'), '[X] collision ' + s + ' (curated: ' + st + '; page coordinates: a db/cities-us namesake > 1 deg away) keeps BASE meta America/New_York, page byte-identical');
    ok(arChecked > 400 && arBad.length === 0, '[X] ar: ' + arChecked + ' city hubs (every 7th + al-quneitra, sokhumi, orlando, columbia) follow the same rule as en', arBad.slice(0, 4).join(' ; '));
    // decision #13 (owner approval pending): the two doubtful REGISTERED zones now reach the moon pages exactly as the
    // prayer pages / JSON-LD already use them — a visible change, listed here on purpose, not hidden
    const D13 = { 'al-quneitra': ['Asia/Damascus', 'Asia/Jerusalem'], sokhumi: ['Asia/Tbilisi', 'Europe/Moscow'] };
    for (const s of Object.keys(D13)) for (const L of ['en', 'ar']) {
        const r = d13[s + ' ' + L];
        console.log('   decision #13 visible change: ' + (r ? r.loc + ' meta ' + r.bm + ' -> ' + r.cm + ' (curated ' + r.ctz + ')' : s + ' ' + L + ' not reached'));
        ok(r && r.bm === D13[s][0] && r.cm === D13[s][1] && r.ctz === D13[s][1], '[X] decision #13 (VISIBLE, owner approval pending): ' + s + ' ' + L + ' meta ' + D13[s][0] + ' -> ' + D13[s][1] + ' = the registered curated zone, as on its prayer page');
    }
    // ------------------------------------------------------------ [M]
    console.log('\n-- [M] month / year / country pages');
    {
        await setClock('2026-10-18T19:00:00Z');
        const p = '/en/moon/united-states/seattle/2026/10';
        const b = await get(PORT.base, p), c = await get(PORT.cand, p);
        const hi = (h) => (h.match(/<span class="moon-stat-value">(\d+) October · 100%<\/span><span class="moon-stat-label">Highest illumination/) || [])[1];
        const fullCell = (h) => (h.match(/moon-hub-cal-date">October (\d+)<\/span>(?:(?!<\/li>)[\s\S])*?moon-hub-cal-phase-name">Full Moon</) || [])[1];
        const grid = MoonCalc.getMonthGrid(2026, 10, 'America/Los_Angeles').find((x) => x.phase && x.phase.english === 'Full Moon');
        console.log(`   seattle/2026/10 "Highest illumination": BASE ${hi(b.b)} Oct, CAND ${hi(c.b)} Oct; calendar Full Moon cell: BASE ${fullCell(b.b)}, CAND ${fullCell(c.b)}; getMonthGrid(LA) full moon day ${grid && grid.day}`);
        ok(b.st === 200 && c.st === 200 && metaOf(b.b) === 'America/New_York' && metaOf(c.b) === 'America/Los_Angeles', '[M] Seattle month page meta: BASE America/New_York -> CAND America/Los_Angeles');
        ok(hi(b.b) === '26' && fullCell(b.b) === '25', '[M] BASE reproduces the contradiction: month summary "Highest illumination 26 October" vs its own calendar Full Moon on 25');
        ok(hi(c.b) === '25' && fullCell(c.b) === '25' && grid && String(grid.day) === '25', '[M] CAND: summary 25 October == calendar cell == getMonthGrid(2026, 10, America/Los_Angeles)');
        const nb = noise(b.b), nc = noise(c.b);
        const ny = '/en/moon/united-states/new-york/2026/10';
        const b2 = await get(PORT.base, ny), c2 = await get(PORT.cand, ny);
        ok(b2.st === 200 && noise(b2.b) === noise(c2.b), '[M] New York month page (zone == country zone) byte-identical', firstDiff(noise(b2.b), noise(c2.b)));
        ok(nb !== nc, '[M] (Seattle month page differs only where the zone is used)');
        // slug collisions (decision #14 not done): the month summary must keep agreeing with its own calendar, as on BASE
        await setClock('2026-10-19T06:00:00Z');
        for (const p2 of ['/en/moon/united-states/orlando/2026/10', '/en/moon/united-states/columbia/2026/10', '/moon/united-states/orlando/2026/10']) {
            const bb = await get(PORT.base, p2), cc2 = await get(PORT.cand, p2);
            const en = p2.startsWith('/en/');
            const hiC = en ? hi(cc2.b) : null, cellC = en ? fullCell(cc2.b) : null;
            console.log(`   ${p2} at 2026-10-19T06:00Z: meta BASE ${metaOf(bb.b)} CAND ${metaOf(cc2.b)}` + (en ? `; "Highest illumination" BASE ${hi(bb.b)} CAND ${hiC}; calendar Full Moon cell BASE ${fullCell(bb.b)} CAND ${cellC}` : ''));
            ok(bb.st === 200 && cc2.st === 200 && metaOf(cc2.b) === metaOf(bb.b) && noise(bb.b) === noise(cc2.b) && (!en || (hiC && hiC === cellC)), '[M] collision ' + p2 + ': meta == BASE (' + metaOf(cc2.b) + '), page byte-identical' + (en ? ', month summary ' + hiC + ' Oct == calendar cell ' + cellC : ''), firstDiff(noise(bb.b), noise(cc2.b)));
        }
    }
    {
        await setClock('2026-11-01T05:30:00Z');   // 22:30 PDT Oct 31 = 01:30 EDT Nov 1
        const p = '/en/moon/united-states/seattle';
        const b = await get(PORT.base, p), c = await get(PORT.cand, p);
        const months = (h) => { const ids = {}; for (const id of ['moon-city-hub-edu-link-other', 'moon-hub-related-2', 'moon-hub-related-3']) { const m = h.match(new RegExp('<a class="(?:[^"]* )?' + id + '(?: [^"]*)?" href="[^"]*/seattle/(\\d{4}/\\d{2})"')); ids[id] = m ? m[1] : null; } return ids; };
        const mb = months(b.b), mc = months(c.b);
        console.log('   seattle hub at 22:30 PDT Oct 31, month links  BASE ' + JSON.stringify(mb) + '  CAND ' + JSON.stringify(mc));
        ok(mb['moon-city-hub-edu-link-other'] === '2026/11' && mb['moon-hub-related-2'] === '2026/11' && mb['moon-hub-related-3'] === '2026/12', '[M] BASE reproduces: "this month / next month" links already November / December (New York\'s month)');
        ok(mc['moon-city-hub-edu-link-other'] === '2026/10' && mc['moon-hub-related-2'] === '2026/10' && mc['moon-hub-related-3'] === '2026/11', '[M] CAND: links follow Seattle\'s own month (October / November)');
    }
    {
        await setClock('2026-10-18T19:00:00Z');
        const p = '/en/moon/united-states/denver/2026';
        const b = await get(PORT.base, p), c = await get(PORT.cand, p);
        const fullOct = (h) => { const m = h.match(/<td>(\d+ October 2026)<\/td><td>(\d\d:\d\d)<\/td><td><span class="my-ph-ico" aria-hidden="true">🌕<\/span> Full Moon<\/td>/); return m ? m[1] + ' ' + m[2] : null; };
        const ev = MoonCalc.findPhaseEventsInRange(new Date(Date.UTC(2026, 9, 20)), new Date(Date.UTC(2026, 10, 1))).find((e) => /full/i.test(String(e.type || e.name || e.phase || '')));
        const evMs = ev && (ev.date instanceof Date ? ev.date.getTime() : (ev.time instanceof Date ? ev.time.getTime() : Number(ev.date || ev.time)));
        const den = evMs ? (() => { const q = partsAt(evMs, 'America/Denver'); return q.day + ' October 2026 ' + String(q.hour).padStart(2, '0') + ':' + String(q.minute).padStart(2, '0'); })() : null;
        console.log(`   denver/2026 (db-only, noindex) October full moon row: BASE "${fullOct(b.b)}"  CAND "${fullOct(c.b)}"  engine in America/Denver "${den}"`);
        ok(b.st === 200 && c.st === 200 && den && fullOct(c.b) === den && fullOct(b.b) !== den, '[M] year page of a db-only city: BASE in New York time, CAND in its own zone (America/Denver via the gated coordinate lookup)');
        // db/cities-only and FAMOUS-only slugs (no curated record): hub meta follows the gated coordinate lookup
        const DBX = { denver: 'America/Denver', 'san-diego': 'America/Los_Angeles', tucson: 'America/Phoenix', fresno: 'America/Los_Angeles', surrey: 'America/Vancouver' };
        const dBad = [], dLog = [];
        for (const s of Object.keys(DBX)) {
            const r = await get(PORT.cand, '/en/moon-in-' + s); const loc = String(r.h.location || '').replace(/^https?:\/\/[^/]+/, '');
            const hb = await get(PORT.base, loc), hc = await get(PORT.cand, loc);
            const bm = metaOf(hb.b), cm = metaOf(hc.b);
            // no curated zone -> the intro / JSON-LD (which fall back to seo.moonCity.tz) move with the meta: the
            // numbers must be the engine at the city's own noon (CAND) vs New York's / Toronto's noon (BASE)
            const tNow = Date.parse('2026-10-18T19:00:00Z');
            const dl = diffLines(noise(setMeta(hb.b, cm || '')), noise(hc.b));
            const onlyValues = !!dl && dl.every(([x, y]) => /ssr-moon-article-schema|FAQPage|"@type":"Question"/.test(x + y));
            const ci = articleIllum(hc.b), bi = articleIllum(hb.b);
            const wantC = cm ? MoonCalc.getMoonIllumination(new Date(noonOf(tNow, cm))) : null, wantB = bm ? MoonCalc.getMoonIllumination(new Date(noonOf(tNow, bm))) : null;
            dLog.push(s + ' meta ' + bm + ' -> ' + cm + ', JSON-LD ' + bi + '% -> ' + ci + '%');
            if (!(r.st === 301 && hb.st === 200 && hc.st === 200 && cm === DBX[s] && bm === 'America/' + (s === 'surrey' ? 'Toronto' : 'New_York') && onlyValues && ci === wantC && bi === wantB)) dBad.push(s + ' ' + loc + ' ' + hb.st + '/' + hc.st + ' meta ' + bm + ' -> ' + cm + ' JSON-LD ' + bi + ' -> ' + ci + ' (engine ' + wantB + ' / ' + wantC + ') ' + (onlyValues ? '' : JSON.stringify(dl && dl.slice(0, 2)).slice(0, 400)));
        }
        console.log('   db-only hubs: ' + dLog.join(' | '));
        ok(dBad.length === 0, '[M] ' + Object.keys(DBX).length + ' db/cities-only city hubs (noindex): BASE meta = country zone, CAND meta = the city\'s own zone; JSON-LD numbers follow it (engine at the city\'s noon); nothing else differs', dBad.join(' ; '));
        const fBad = [];
        for (const s of ['mecca', 'kuwait', 'tripoli', 'delhi']) {
            const r = await get(PORT.cand, '/en/moon-in-' + s); const loc = String(r.h.location || '').replace(/^https?:\/\/[^/]+/, '') || ('/en/moon-in-' + s);
            const hb = await get(PORT.base, loc), hc = await get(PORT.cand, loc);
            if (!(hb.st === hc.st && noise(hb.b) === noise(hc.b))) fBad.push(s + ' ' + loc + ' ' + hb.st + '/' + hc.st + ' ' + firstDiff(noise(hb.b), noise(hc.b)).slice(0, 300));
        }
        ok(fBad.length === 0, '[M] FAMOUS-only slugs (mecca, kuwait, tripoli, delhi): identical BASE vs CAND', fBad.join(' ; '));
        for (const y of ['/en/moon/united-states/seattle/2026', '/en/moon/united-states/new-york/2026', '/moon/indonesia/jakarta/2026']) {
            const yb = await get(PORT.base, y), yc = await get(PORT.cand, y);
            ok(yb.st === 200 && noise(yb.b) === noise(yc.b), '[M] ' + y + ' (curated zone already used) byte-identical', firstDiff(noise(yb.b), noise(yc.b)));
        }
        // country pages: only New Zealand (+13) moves, because the shared noon helper no longer lands on tomorrow
        const ctry = ['/en/moon/united-states', '/en/moon/indonesia', '/en/moon/saudi-arabia', '/moon/egypt', '/en/moon/germany', '/en/moon/latvia', '/en/moon/australia', '/en/moon/india'];
        const cBad = [];
        for (const q of ctry) { const qb = await get(PORT.base, q), qc = await get(PORT.cand, q); if (!(qb.st === 200 && noise(qb.b) === noise(qc.b))) cBad.push(q + ' ' + qb.st + '/' + qc.st + ' ' + firstDiff(noise(qb.b), noise(qc.b)).slice(0, 300)); }
        ok(cBad.length === 0, '[M] ' + ctry.length + ' country moon pages (incl. Australia +11, India +5:30, Latvia) byte-identical', cBad.join(' ; '));
        const nzb = await get(PORT.base, '/en/moon/new-zealand'), nzc = await get(PORT.cand, '/en/moon/new-zealand');
        const ill = (h) => { const m = h.match(/mc-card-lbl">[^<]*Illumination[^<]*<\/div><div class="mc-card-val">([\d.]+)%/i); return m ? Number(m[1]) : null; };
        const ak = cityDate(Date.parse('2026-10-18T19:00:00Z'), 'Pacific/Auckland');
        const wantNz = MoonCalc.getMoonIllumination(new Date(exactNoon(ak.y, ak.m, ak.d, 'Pacific/Auckland')));
        const tmr = MoonCalc.getMoonIllumination(new Date(exactNoon(ak.y, ak.m, ak.d + 1, 'Pacific/Auckland')));
        const dl = diffLines(noise(nzb.b), noise(nzc.b));
        console.log(`   /en/moon/new-zealand illumination card: BASE ${ill(nzb.b)}%  CAND ${ill(nzc.b)}%  (engine: Auckland noon ${ak.d} Oct ${wantNz}%, next day ${tmr}%)`);
        ok(ill(nzc.b) === wantNz && ill(nzb.b) === tmr && dl && dl.length === 1 && /mc-summary/.test(dl[0][1]), '[M] side effect of the shared noon helper: /moon/new-zealand illumination card BASE = tomorrow, CAND = today; only that summary line differs');
        const OTHER = ['/', '/en', '/prayer-times-in-makkah', '/en/prayer-times-in-seattle', '/en/prayer-times-in-riga', '/qibla', '/moon', '/en/moon', '/hijri-calendar', '/en/qibla-in-seattle'];
        const oBad = [];
        for (const q of OTHER) { let qb = await get(PORT.base, q), qc = await get(PORT.cand, q); if (noise(qb.b) !== noise(qc.b)) { await sleep(1200); qb = await get(PORT.base, q); qc = await get(PORT.cand, q); } if (!(qb.st === qc.st && noise(qb.b) === noise(qc.b))) oBad.push(q + ' ' + qb.st + '/' + qc.st + ' ' + firstDiff(noise(qb.b), noise(qc.b)).slice(0, 300)); }
        ok(oBad.length === 0, '[M] ' + OTHER.length + ' other pages (home, prayer, qibla, /moon hub, hijri hub) identical BASE vs CAND', oBad.join(' ; '));
    }
    // ------------------------------------------------------------ [B]
    console.log('\n-- [B] headless Chrome: post-JS values vs the engine with the CITY zone');
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
    const READ_JS = "(()=>{const g=(id)=>{const e=document.getElementById(id);return e?e.textContent.trim():null};const rows=[...document.querySelectorAll('#moon-forecast-body tr')];const td=document.querySelector('#moon-forecast-body tr.fc-row-today');const n=document.getElementById('moon-timezone-note');const m=document.querySelector('meta[name=\"moon.city.tz\"]');const fb=document.getElementById('moon-forecast-body');return {phase:g('moon-phase-name'),illum:g('moon-illumination-pct'),age:g('moon-age'),rise:g('moon-rise'),set:g('moon-set'),tzNote:(n&&!n.hidden)?n.textContent.trim():'',row0:rows[0]&&rows[0].children[0]?rows[0].children[0].textContent.trim():null,todayRow:td&&td.children[0]?td.children[0].textContent.trim():null,hijriGreg:g('moon-hijri-greg'),meta:m?m.content:null,fcHtml:fb?fb.innerHTML:''}})()";
    // the engine itself, called with the CITY zone at the city's noon (computed here with Intl, not by the page helper);
    // same moonset rule as the card (set before rise / missing -> next day's set)
    const EXPECT_JS = (noon, tz, lat, lng) => `(()=>{const N=${noon},tz=${JSON.stringify(tz)},la=${lat},ln=${lng};const d=new Date(N);const dp=MoonCalc.getDayPhase(d,tz);const ph=(dp&&dp.phase)||MoonCalc.getPhaseName(d);const loc=(ph.key&&typeof t==='function')?t(ph.key):ph.name;const nm=(loc&&loc!==ph.key)?loc:(ph.name||'');const mt=MoonCalc.getMoonTimes(d,la,ln,tz);let set=mt.set;try{if(mt.riseTime instanceof Date){const sb=(mt.setTime instanceof Date)&&mt.setTime.getTime()<mt.riseTime.getTime();if(sb||!(mt.setTime instanceof Date)){const t2=MoonCalc.getMoonTimes(new Date(N+86400000),la,ln,tz);if(t2&&t2.setTime instanceof Date)set=t2.set;}}}catch(e){}return {phase:((ph.icon||'')+' '+nm).trim(),illum:MoonCalc.getMoonIllumination(d)+'%',age:MoonCalc.getMoonAge(d)+' '+t('moon.days_suffix'),rise:mt.rise,set:set}})()`;
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
        for (let i = 0; i < 50; i++) { const v = await ev("(document.getElementById('moon-illumination-pct')||{}).textContent||''"); if (/\d/.test(v)) break; await sleep(200); }
        await sleep(600);
        const got = await ev(READ_JS);
        return { got, uncaught: uncaught.slice() };
    };
    const SEA = { p: '/en/moon/united-states/seattle', tz: 'America/Los_Angeles', baseTz: 'America/New_York' };
    const CASES = [
        { T: '2026-10-18T19:00:00Z', label: '12:00 PDT Oct 18 (Seattle) = 15:00 EDT (New York)', pages: [
            { ...SEA, kind: 'other zone', visitors: ['Asia/Riyadh', 'America/Los_Angeles', 'Pacific/Auckland'] },
            { p: '/en/moon/united-states/new-york', tz: 'America/New_York', kind: 'control' },
            { p: '/en/moon/latvia/riga', tz: 'Europe/Riga', baseTz: null, kind: 'no primary zone' },
            { p: '/en/moon/new-zealand/auckland', tz: 'Pacific/Auckland', baseTz: 'Pacific/Auckland', kind: '+13' },
            { p: '/en/moon/united-states/denver', tz: 'America/Denver', baseTz: 'America/New_York', kind: 'db-only city' }] },
        { T: '2026-10-18T15:30:00Z', label: '00:30 WIT Oct 19 (Jayapura) = 22:30 WIB Oct 18 (Jakarta)', pages: [
            { p: '/en/moon/indonesia/jayapura', tz: 'Asia/Jayapura', baseTz: 'Asia/Jakarta', kind: 'other zone' },
            { p: '/en/moon/indonesia/jakarta', tz: 'Asia/Jakarta', kind: 'control' }] },
        { T: '2026-10-18T00:00:00Z', label: '13:00 NZDT Oct 18 (Auckland) / 03:00 EEST (Riga)', pages: [
            { p: '/en/moon/new-zealand/auckland', tz: 'Pacific/Auckland', baseTz: 'Pacific/Auckland', kind: '+13', visitors: ['Asia/Riyadh', 'Pacific/Auckland'] },
            { p: '/en/moon/latvia/riga', tz: 'Europe/Riga', baseTz: null, kind: 'no primary zone' }] },
        { T: '2026-06-15T01:00:00Z', label: '13:00 NZST Jun 15 (Auckland at +12)', pages: [{ p: '/en/moon/new-zealand/auckland', tz: 'Pacific/Auckland', baseTz: 'Pacific/Auckland', kind: '+12' }] },
        { T: '2026-09-26T23:30:00Z', label: '12:30 NZDT Sep 27 (Auckland DST start day)', pages: [{ p: '/en/moon/new-zealand/auckland', tz: 'Pacific/Auckland', baseTz: 'Pacific/Auckland', kind: '+13 DST start' }] },
        { T: '2026-10-18T03:59:00Z', label: '20:59 PDT Oct 17 (1 min before New York midnight)', pages: [{ ...SEA, kind: 'midnight' }] },
        { T: '2026-10-18T04:01:00Z', label: '21:01 PDT Oct 17 (1 min after New York midnight)', pages: [{ ...SEA, kind: 'midnight' }] },
        { T: '2026-10-18T06:59:00Z', label: '23:59 PDT Oct 17 (1 min before Seattle midnight)', pages: [{ ...SEA, kind: 'midnight', visitors: ['America/Los_Angeles'] }] },
        { T: '2026-10-18T07:01:00Z', label: '00:01 PDT Oct 18 (1 min after Seattle midnight)', pages: [{ ...SEA, kind: 'midnight', visitors: ['America/Los_Angeles'] }] },
        { T: '2026-11-01T19:00:00Z', label: '11:00 PST Nov 1 (Seattle DST end day)', pages: [{ ...SEA, kind: 'DST end' }] },
        { T: '2026-11-02T07:30:00Z', label: '23:30 PST Nov 1 (DST end day evening)', pages: [{ ...SEA, kind: 'DST end' }] },
        { T: '2027-03-14T19:00:00Z', label: '12:00 PDT Mar 14 2027 (Seattle DST start day)', pages: [{ ...SEA, kind: 'DST start' }] },
        { T: '2027-03-15T05:30:00Z', label: '22:30 PDT Mar 14 2027 (DST start day evening)', pages: [{ ...SEA, kind: 'DST start' }] },
        // slug collisions (decision #14 not done): curated orlando = Florida, columbia = South Carolina, but the page renders the
        // first db/cities-us namesake (Orlando OK, Columbia MO). The card must stay on BASE's zone and agree with its own JSON-LD
        { T: '2026-10-19T06:00:00Z', label: '02:00 EDT / 01:00 CDT Oct 19 (slug collisions orlando / columbia)', pages: [
            { p: '/en/moon/united-states/orlando', tz: 'America/New_York', kind: 'collision' },
            { p: '/moon/united-states/orlando', tz: 'America/New_York', kind: 'collision', ar: true },
            { p: '/en/moon/united-states/columbia', tz: 'America/New_York', kind: 'collision' }] }
    ];
    const F = ['phase', 'illum', 'age', 'rise', 'set'];
    for (const C of CASES) {
        console.log(`\n== ${C.T}  ${C.label}`);
        for (const P of C.pages) {
            const visitors = P.visitors || ['Asia/Riyadh'];
            const tMs = Date.parse(C.T);
            await setClock(C.T);
            const rb = await get(PORT.base, P.p), rc = await get(PORT.cand, P.p);
            const geo = geoOf(rc.b);
            ok(rb.st === 200 && rc.st === 200 && geo && JSON.stringify(geo) === JSON.stringify(geoOf(rb.b)), '[B] ' + P.p + ': 200 on both, same coordinates (geo.position) BASE and CAND');
            const want = cityDate(tMs, P.tz), noon = exactNoon(want.y, want.m, want.d, P.tz), label = dateLabel(tMs, P.tz);
            const shortDate = want.d + ' ' + EN_MO(want.m) + ' ' + want.y;
            const results = [];
            for (const V of visitors) {
                const B = await load(PORT.base, P.p, C.T, V), Cc = await load(PORT.cand, P.p, C.T, V);
                const exp = await ev(EXPECT_JS(noon, P.tz, geo.lat, geo.lng));
                results.push({ V, B: B.got, C: Cc.got, exp, ub: B.uncaught, uc: Cc.uncaught });
                const show = (g) => g ? `${g.row0} | ${g.phase} | ${g.illum} | ${g.age} | rise ${g.rise} | set ${g.set} | meta ${g.meta}` : 'null';
                console.log(`   · ${P.p} [${P.kind}] visitor ${V}  city date ${want.y}-${String(want.m).padStart(2, '0')}-${String(want.d).padStart(2, '0')} (${P.tz})`);
                console.log(`       engine (city zone): ${label} | ${exp && exp.phase} | ${exp && exp.illum} | ${exp && exp.age} | rise ${exp && exp.rise} | set ${exp && exp.set}`);
                console.log(`       BASE: ${show(B.got)}`);
                console.log(`       CAND: ${show(Cc.got)}`);
                const g = Cc.got;
                // (the Arabic page prints Arabic labels: there only the zone is checked here, the values via JSON-LD and BASE == CAND)
                const candRight = P.ar ? (g && g.meta === P.tz && g.tzNote.includes('(' + P.tz + ')'))
                    : (g && exp && F.every((k) => g[k] === exp[k]) && g.row0 === label && g.todayRow === label && g.meta === P.tz && g.tzNote.includes('(' + P.tz + ')') && String(g.hijriGreg || '').includes(shortDate));
                ok(candRight, '[B] CAND ' + P.p + ' (' + V + '): ' + (P.ar ? 'meta and zone note ' + P.tz : 'day ' + label + ', phase / illumination / age / rise / set == engine with ' + P.tz + '; today row, zone note and the page\'s own Hijri card agree'), JSON.stringify({ got: g && { ...g, fcHtml: undefined }, exp }));
                const bg = B.got;
                if (P.kind === 'control' || P.kind === 'collision') {
                    ok(bg && g && F.every((k) => bg[k] === g[k]) && bg.row0 === g.row0 && bg.todayRow === g.todayRow && bg.tzNote === g.tzNote && bg.fcHtml === g.fcHtml && bg.meta === g.meta, '[B] ' + P.kind + ' ' + P.p + ': BASE == CAND (card, zone note and the whole 14-day table)', firstDiff(String(bg && bg.fcHtml), String(g && g.fcHtml)));
                    if (P.kind === 'collision') summary.push(`   ${C.T} collision ${P.p} [${V}]  BASE ${bg && bg.illum} rise ${bg && bg.rise} meta ${bg && bg.meta}  ==  CAND ${g && g.illum} rise ${g && g.rise} meta ${g && g.meta}  (JSON-LD ${articleIllum(rc.b)}%)`);
                } else {
                    const wrong = bg && exp ? F.filter((k) => bg[k] !== exp[k]).concat(bg.row0 !== label ? ['day'] : []).concat(bg.meta !== P.tz ? ['meta'] : []) : ['n/a'];
                    ok(wrong.length > 0 && bg.meta === (P.baseTz === undefined ? bg.meta : P.baseTz), '[B] BASE reproduces the defect on ' + P.p + ': wrong ' + wrong.join(', ') + ' (meta ' + (bg && bg.meta) + ')');
                    summary.push(`   ${C.T} ${P.p.replace('/en/moon/', '')} [${V}]  BASE ${bg && bg.row0} ${bg && bg.illum} rise ${bg && bg.rise} set ${bg && bg.set}  ->  CAND ${g && g.row0} ${g && g.illum} rise ${g && g.rise} set ${g && g.set}  (engine ${exp && exp.illum} ${exp && exp.rise} ${exp && exp.set})`);
                }
                const asNum = (x) => Number(String(x).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660)).replace('٫', '.').replace(/[%٪\s]/g, ''));
                const jsonld = articleIllum(rc.b), gNum = g ? asNum(g.illum) : NaN;
                ok(jsonld != null && gNum === jsonld, '[B] CAND ' + P.p + ': server JSON-LD illumination (' + jsonld + '%) == the post-JS card (' + (g && g.illum) + ')');
                ok(JSON.stringify(B.uncaught.slice().sort()) === JSON.stringify(Cc.uncaught.slice().sort()), '[B] same uncaught exceptions BASE / CAND (' + B.uncaught.length + ' / ' + Cc.uncaught.length + ')', B.uncaught.join(' | ') + ' vs ' + Cc.uncaught.join(' | '));
            }
            if (results.length > 1) {
                const k0 = results[0].C;
                ok(results.every((r) => r.C && F.every((k) => r.C[k] === k0[k]) && r.C.row0 === k0.row0 && r.C.todayRow === k0.todayRow), '[B] CAND ' + P.p + ': the same card and day for visitors in ' + results.map((r) => r.V).join(', '));
            }
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
