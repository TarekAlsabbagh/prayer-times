// TODAY-PAGES-ACCURACY-1 — FINAL combined FUNCTIONAL smoke on the branch head (the exact tree that will be deployed).
//   Owner decision 2026-10-19 (item 3): prove the fixes work TOGETHER on the final head, separately from the per-commit
//   file-identity smokes (those compare against intermediate commits; they are NOT used here). Local only: outbound
//   guard on both servers, every non-loopback host unresolvable in Chrome (+ dead proxy), ad / analytics URLs blocked,
//   ADSENSE_CLIENT=off, ports 9800-9849 only, js/moon.js and the Umm al-Qura table never written.
//   BASE = clean production tree (2db11f5, env TP_BASE_ROOT), CAND = this tree (branch head). Both servers read the SAME
//   test clock (TEST-ONLY preload written to a temp dir by this script, never in the repo, inert unless
//   TP_SMOKE_CLOCK_FILE is set: Date.now()/new Date() = T + real time since the clock file was written). Chrome gets the
//   same instant through a Date override and a visitor time zone (Emulation.setTimezoneOverride).
//   [S] tree: files changed vs 2db11f5 = index.html, js/app.js, server.js (+ test scripts); js/moon.js, the Umm al-Qura
//       table, i18n untouched; index.html differs by the one app.js?v line; CRLF kept; BASE tree clean at 2db11f5.
//   [1] city zone + date (Chrome, /en moon city hubs of Seattle, New York, Los Angeles, Jayapura, Jakarta, Auckland,
//       Apia (+13), Riga, London, Riyadh) at a common instant and 1 min before / after each city's own local midnight:
//       <meta moon.city.tz> = the city's zone; post-JS date, phase, illumination, age, moonrise, moonset, today row and
//       zone line == js/moon.js (in-page, untouched) called with the city's own IANA zone at the city's own noon;
//       controls BASE == CAND; the defect cities reproduce the defect on BASE.
//   [2] DST (Chrome): 14-day table on the documented clock-change cases (Europe/London 2026-10-25, America/New_York and
//       America/Los_Angeles 2026-11-01, Australia/Sydney 2026-10-04 + 2027-04-04, Asia/Jerusalem 2026-10-25 + 2027-03-26,
//       Africa/Cairo 2026-10-29 + 2027-04-30; visits on the day and a few days before): 14 consecutive own dates; every
//       row's rise / set == the engine for that row's own city date; rows away from the change byte-identical to BASE.
//   [3] structured data vs visible (Chrome, same loads as [1]): the Article JSON-LD articleBody illumination + age ==
//       the visible card == the engine at the visible date's noon (and != the neighbouring dates' values); the zone of
//       the head meta == the visible zone line.
//   [4] status + Location + canonical + meta robots + X-Robots-Tag + hreflang identical BASE vs CAND over a broad URL
//       set x 3 languages (moon hub / today / countries / 19 city hubs / years + months in and out of the window /
//       removed day + today URLs / legacy /moon-in- + /moon-today-in- forms / hijri calendar in / out / invalid /
//       hijri-date / today-hijri-date / prayer, qibla, next-prayer, time-left city pages / 404 probes).
//   [5] JS (Chrome, Debugger pauses on caught + uncaught exceptions): /moon with a stored city (London, Riyadh, Hong
//       Kong, Macau) in ar / en / fr: no COUNTRY_SLUG_OVERRIDES error (BASE: thrown), the pill shows, its link answers 200.
//   [6] expected differences, EXACTLY, over the full normalised HTML of the [4] URL set (normalised: nonce,
//       article:modified_time, ISO ms stamps, live clocks only). Each one is CHECKED, not masked:
//       (a) build identity: js/app.js?v=856 -> 857 and the &b= stamp (each tree's own git HEAD) on app.js / i18n.js;
//       (b) /today-hijri-date card 6: leapNo -> leapYes (1448 = 355 days in the table), 10 languages;
//       (c) moon city pages whose zone != the country zone (not slug collisions, not the 3 exempt cities): the
//           moon.city.tz meta (added where the country has no primary zone) + the month page values computed in that
//           zone (summary stats, phase list: re-computed with js/moon.js) + month links at a month boundary (the CAND
//           page == the BASE page of the city's own date);
//       (d) UTC+12 and beyond (same noon fix): Article JSON-LD values of those city pages (re-rendered with js/moon.js
//           at the city's noon) and the illumination card of their country page;
//       (e) /moon hub (10 languages): the Hong Kong / Macau smart-pill island (owner decision 19-10 item 1), exact content.
//       The 3 cities of the TEMPORARY moon-zone exemption (owner decisions 19-10 on #13: sy/al-quneitra, ge/sokhumi and
//       sy/katzrin, the db/cities-sy entry) are NOT an expected difference: every one of their URLs must equal production
//       apart from the build identity (katzrin is not curated, so any zone change there is unexplained by construction).
//       Any other byte difference = FAIL.
//   node scripts/_smoke_today_pages_final_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT (9800-9840), TP_CHROME)
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-today-pages-base';
const BASE_REF = '2db11f5';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = process.env.TP_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const P0 = Number(process.env.TP_SMOKE_PORT || 9830);
if (!(P0 >= 9800 && P0 + 9 <= 9849)) throw new Error('TP_SMOKE_PORT must keep every port inside 9800-9849');
const PORT = { base: P0, cand: P0 + 1, cdp: P0 + 9 };
const AD_BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*', '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*gstatic.com/ads*'];
const LANGS10 = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const LANGS3 = ['ar', 'en', 'fr'];
const lpOf = (L) => (L === 'ar' ? '' : '/' + L);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity', 'user-agent': 'Mozilla/5.0 smoke' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, h: {}, b: '' })); r.setTimeout(60000, () => r.destroy()); r.end();
});
const chain = async (port, p) => { const out = []; let cur = p; for (let i = 0; i < 4 && cur; i++) { const r = await get(port, cur); out.push({ p: cur, st: r.st }); if (r.st >= 300 && r.st < 400 && r.h.location) cur = String(r.h.location).replace(/^https?:\/\/[^/]+/, ''); else break; } return out; };
let pass = 0, fail = 0; const G = {};
const ok = (g, c, n, d) => { G[g] = G[g] || { p: 0, f: 0 }; if (c) { pass++; G[g].p++; console.log('  ✓ ' + g + ' ' + n); } else { fail++; G[g].f++; console.log('  ✗ ' + g + ' ' + n + (d ? '  :: ' + String(d).slice(0, 1500) : '')); } };
// per-request / per-run noise ONLY (the build identity and everything else is compared exactly)
const noise = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN');
const firstDiff = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i >= a.length && a.length === b.length ? '' : '@' + i + ' A…' + a.slice(Math.max(0, i - 140), i + 160) + '…  B…' + b.slice(Math.max(0, i - 140), i + 160) + '…'; };
const escHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const META_RE = /<meta name="moon\.city\.tz" content="([^"]*)">/;
const metaOf = (h) => { const m = h.match(META_RE); return m ? m[1] : null; };
const dropMeta = (h) => h.replace(/\r?\n[ \t]*<meta name="moon\.city\.tz" content="[^"]*">/, '');
const setMeta = (h, v) => h.replace(META_RE, () => '<meta name="moon.city.tz" content="' + v + '">');
const geoOf = (h) => { const m = h.match(/<meta name="geo\.position" content="(-?[\d.]+);(-?[\d.]+)"/); return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null; };
const canonOf = (h) => (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const robotsOf = (h) => (h.match(/<meta name="robots" content="([^"]+)"/) || [])[1] || '';
const hreflangOf = (h) => [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => m[1] + '=' + m[2]).join(' ');
// ---------------------------------------------------------------- time helpers (Intl, independent of the page code)
const FMT = new Map();
const fmtFor = (tz) => { if (!FMT.has(tz)) FMT.set(tz, new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })); return FMT.get(tz); };
const partsAt = (ms, tz) => { const o = {}; for (const p of fmtFor(tz).formatToParts(new Date(ms))) if (p.type !== 'literal') o[p.type] = Number(p.value); return o; };
const offMin = (ms, tz) => { const p = partsAt(ms, tz); return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000) / 60000); };
const localToUtc = (y, m, d, hh, mm, tz) => { const naive = Date.UTC(y, m - 1, d, hh, mm); let t = naive - offMin(naive, tz) * 60000; t = naive - offMin(t, tz) * 60000; return t; };
const exactNoon = (y, m, d, tz) => localToUtc(y, m, d, 12, 0, tz);
const cityDate = (ms, tz) => { const p = partsAt(ms, tz); return { y: p.year, m: p.month, d: p.day }; };
const addDays = (c, n) => { const x = new Date(Date.UTC(c.y, c.m - 1, c.d + n)); return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate() }; };
const ymd = (c) => c.y + '-' + String(c.m).padStart(2, '0') + '-' + String(c.d).padStart(2, '0');
const sameDay = (a, b) => a.y === b.y && a.m === b.m && a.d === b.d;
const EN_WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const label = (c) => EN_WD[new Date(Date.UTC(c.y, c.m - 1, c.d)).getUTCDay()] + ' ' + c.d + ' ' + EN_MO[c.m - 1] + ' ' + c.y;
const fmt2 = (x) => Number(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
globalThis.getCurrentLang = () => 'en';   // js/moon.js _formatTime: Latin digits (as on the /en/ pages)
const MoonCalc = require(path.join(ROOT, 'js/moon.js'));
const { TRANSLATIONS: I18N } = require(path.join(ROOT, 'js/i18n.js'));
// ---------------------------------------------------------------- data
const srvB = fs.readFileSync(path.join(BASE_ROOT, 'server.js'), 'utf8'), appC = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
const grabObj = (src, decl) => { const a = src.indexOf(decl); if (a < 0) throw new Error('missing ' + decl); let i = src.indexOf('{', a), dep = 0; for (; i < src.length; i++) { if (src[i] === '{') dep++; else if (src[i] === '}') { dep--; if (!dep) break; } } return new Function('return ' + src.slice(src.indexOf('{', a), i + 1))(); };
const PRIMARY = grabObj(srvB, 'const _CC_TO_PRIMARY_TZ = {');      // production's country -> zone map
const FAMOUS = grabObj(appC, 'const FAMOUS_MOON_CITIES = {');
const CUR = (() => { const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'db/places/curated-places.json'), 'utf8')); const a = Array.isArray(j) ? j : (j.places || []); const m = {}; for (const p of a) if (p && p.slug && !m[p.slug]) m[p.slug] = p; return m; })();
const HIJRI = JSON.parse(fs.readFileSync(path.join(ROOT, 'db/hijri/umm-al-qura.json'), 'utf8'));
const LEAP = {   // the card's existing wording [yes (355), no (354)] (server _HD12_INFO / client HT_I18N; unchanged)
    ar: ['نعم (355 يوماً)', 'لا (354 يوماً)'], en: ['Yes (355 days)', 'No (354 days)'], fr: ['Oui (355 jours)', 'Non (354 jours)'],
    tr: ['Evet (355 gün)', 'Hayır (354 gün)'], ur: ['ہاں (355 دن)', 'نہیں (354 دن)'], de: ['Ja (355 Tage)', 'Nein (354 Tage)'],
    id: ['Ya (355 hari)', 'Tidak (354 hari)'], es: ['Sí (355 días)', 'No (354 días)'], bn: ['হ্যাঁ (৩৫৫ দিন)', 'না (৩৫৪ দিন)'],
    ms: ['Ya (355 hari)', 'Tidak (354 hari)']
};
const EXEMPT = new Set(['sy/al-quneitra', 'ge/sokhumi', 'sy/katzrin']);     // owner decisions 2026-10-19 on #13 (temporary); katzrin = db/cities-sy
// the 10 cities of [1]: expected zone = the curated record's zone (checked against this explicit list)
const CITY10 = { seattle: 'America/Los_Angeles', 'new-york': 'America/New_York', 'los-angeles': 'America/Los_Angeles', jayapura: 'Asia/Jayapura', jakarta: 'Asia/Jakarta', auckland: 'Pacific/Auckland', apia: 'Pacific/Apia', riga: 'Europe/Riga', london: 'Europe/London', riyadh: 'Asia/Riyadh' };
const CONTROLS = new Set(['new-york', 'los-angeles', 'jakarta', 'london', 'riyadh']);
const EXTRA = ['orlando', 'columbia', 'al-quneitra', 'sokhumi', 'katzrin', 'hong-kong', 'macau', 'jerusalem', 'cairo', 'sydney'];
const SHA = (root) => execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root }).toString().trim();
const SHA_B = SHA(BASE_ROOT), SHA_C = SHA(ROOT);
// ---------------------------------------------------------------- [S]
console.log('-- [S] tree (final head ' + SHA_C + ' vs production ' + SHA_B + ')');
{
    const baseDirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: BASE_ROOT }).toString().trim();
    ok('[S]', SHA_B === BASE_REF && baseDirty === '', 'BASE tree = clean production copy at ' + BASE_REF, SHA_B + ' ' + baseDirty);
    const changed = execFileSync('git', ['diff', '--name-only', BASE_REF], { cwd: ROOT }).toString().trim().split(/\r?\n/).filter(Boolean);
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: ROOT }).toString().trim().split(/\r?\n/).filter(Boolean);
    const all = changed.concat(untracked);
    const code = ['index.html', 'js/app.js', 'server.js'];
    ok('[S]', code.every((f) => all.includes(f)) && all.every((f) => code.includes(f) || /^scripts\/_smoke_today_pages_[a-z0-9_]+\.mjs$/.test(f)), 'files changed vs ' + BASE_REF + ': exactly index.html, js/app.js, server.js + ' + (all.length - 3) + ' scripts/_smoke_today_pages_*.mjs', all.join(', '));
    for (const f of ['js/moon.js', 'db/hijri/umm-al-qura.json', 'js/i18n.js', 'js/hijri-date.js', 'sw.js', 'db/places/curated-places.json']) {
        if (!fs.existsSync(path.join(BASE_ROOT, f)) && !fs.existsSync(path.join(ROOT, f))) continue;
        ok('[S]', fs.readFileSync(path.join(BASE_ROOT, f)).equals(fs.readFileSync(path.join(ROOT, f))), f + ' byte-identical to production');
    }
    const ib = fs.readFileSync(path.join(BASE_ROOT, 'index.html'), 'utf8').split('\n'), ic = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n');
    const dl = ib.length === ic.length ? ib.map((l, i) => [l, ic[i]]).filter(([a, b]) => a !== b) : null;
    ok('[S]', dl && dl.length === 1 && dl[0][0].replace('js/app.js?v=856"', 'js/app.js?v=857"') === dl[0][1] && dl[0][0].includes('js/app.js?v=856"'), 'index.html: the only line that differs is js/app.js?v=856 -> 857', JSON.stringify(dl));
    for (const f of code) { const s = fs.readFileSync(path.join(ROOT, f), 'utf8'); ok('[S]', (s.match(/\r\n/g) || []).length === (s.match(/\n/g) || []).length, f + ' keeps CRLF line endings throughout'); }
}
// ---------------------------------------------------------------- servers + clock
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-final-'));
const CLOCK_JS = path.join(tmp, 'test-clock.cjs'), CLOCK_FILE = path.join(tmp, 'clock.txt');
fs.writeFileSync(CLOCK_JS, [
    "'use strict';",
    '// TEST-ONLY fake clock (written by scripts/_smoke_today_pages_final_1.mjs into a temp dir; never in the repo).',
    '// Inert unless TP_SMOKE_CLOCK_FILE is set: Date.now()/new Date() = T + real time since the clock file was written.',
    "const fs = require('fs'); const FILE = process.env.TP_SMOKE_CLOCK_FILE;",
    'if (FILE) {',
    '  const R = Date; let cache = { at: -1e15, off: 0 };',
    '  const off = () => { const real = R.now(); if (real - cache.at > 100) { try { const st = fs.statSync(FILE); const T = Number(String(fs.readFileSync(FILE, "utf8")).trim()); cache = { at: real, off: isFinite(T) ? T - st.mtimeMs : 0 }; } catch (_e) { cache = { at: real, off: 0 }; } } return cache.off; };',
    '  class D extends R { constructor(...a) { if (a.length === 0) super(R.now() + off()); else super(...a); } static now() { return R.now() + off(); } }',
    '  D.UTC = R.UTC; D.parse = R.parse; Object.defineProperty(D, Symbol.hasInstance, { value: (x) => x instanceof R });',
    '  globalThis.Date = D;',
    '}', ''].join('\n'));
const setClock = async (iso) => { fs.writeFileSync(CLOCK_FILE, String(typeof iso === 'number' ? iso : Date.parse(iso))); await sleep(250); };
const boot = (root, port) => spawn(process.execPath, ['-r', GUARD, '-r', CLOCK_JS, 'server.js'], { cwd: root, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0', TZ: 'UTC', TP_SMOKE_CLOCK_FILE: CLOCK_FILE } });
function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const handlers = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; } if (d.method) handlers.forEach((h) => h(d)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    return new Promise((res) => { ws.onopen = () => res({ send, on: (h) => handlers.push(h), close: () => ws.close() }); });
}
// ---------------------------------------------------------------- [6] verifiers: each REBUILDS the expected CAND text from BASE + js/moon.js
const monthStats = (y, m, tz) => {
    const g = MoonCalc.getMonthGrid(y, m, tz) || [];
    let maxG = g[0], minG = g[0];
    for (const x of g) { if ((x.illumination || 0) > (maxG.illumination || 0)) maxG = x; if ((x.illumination || 0) < (minG.illumination || 0)) minG = x; }
    let wax = null, wan = null, waxS = -1, wanS = -1;
    for (let i = 1; i < g.length; i++) {
        if ((g[i].illumination || 0) >= (g[i - 1].illumination || 0)) { if (waxS < 0) waxS = i - 1; if (!wax || (i - waxS) > (wax.e - wax.s)) wax = { s: waxS, e: i }; wanS = -1; }
        else { if (wanS < 0) wanS = i - 1; if (!wan || (i - wanS) > (wan.e - wan.s)) wan = { s: wanS, e: i }; waxS = -1; }
    }
    return { g, maxG, minG, wax, wan };
};
const STAT_RE = /<span class="moon-stat-value">([^<]*)<\/span>/g;
const statSection = (line) => { const a = line.indexOf('<section class="section-card moon-month-stats" id="moon-month-stats"'); if (a < 0) return null; const z = line.indexOf('</section>', a); return z < 0 ? null : [a, z + 10]; };
// returns { line, why } — line = BASE line with the 4 stats re-computed in zone zc (after checking BASE's own == zone zb)
const repairStats = (line, y, m, zb, zc) => {
    const sec = statSection(line); if (!sec) return { line };
    const html = line.slice(sec[0], sec[1]); const vals = [...html.matchAll(STAT_RE)].map((x) => x[1]);
    if (vals.length !== 4) return { line, why: 'stats: ' + vals.length + ' values' };
    const mm = vals[0].match(/^\d+ (.+) · \d+%$/); if (!mm) return { line, why: 'stats: month name not parsed ' + vals[0] };
    const mName = mm[1]; const rng = [vals[2], vals[3]].find((v) => v !== '—'); let toW = null;
    if (rng) { const r = rng.slice(0, rng.length - mName.length - 1).match(/^\d+ (.+) \d+$/); if (r && rng.endsWith(' ' + mName)) toW = r[1]; }
    const render = (st) => [`${st.maxG.day} ${mName} · ${Math.round(st.maxG.illumination || 0)}%`, `${st.minG.day} ${mName} · ${Math.round(st.minG.illumination || 0)}%`,
        st.wax ? `${st.g[st.wax.s].day} ${toW} ${st.g[st.wax.e].day} ${mName}` : '—', st.wan ? `${st.g[st.wan.s].day} ${toW} ${st.g[st.wan.e].day} ${mName}` : '—'].map((v) => escHtml(v));
    const want = render(monthStats(y, m, zb));
    if (JSON.stringify(want) !== JSON.stringify(vals)) return { line, why: 'stats: BASE ' + JSON.stringify(vals) + ' != js/moon.js in ' + zb + ' ' + JSON.stringify(want) };
    const got = render(monthStats(y, m, zc)); let k = 0;
    const html2 = html.replace(STAT_RE, () => '<span class="moon-stat-value">' + got[k++] + '</span>');
    return { line: line.slice(0, sec[0]) + html2 + line.slice(sec[1]), used: JSON.stringify(vals) !== JSON.stringify(got) ? 'stats ' + vals[0] + ' -> ' + got[0] + ' …' : '' };
};
const PH_RE = /<p class="moon-month-context-phases">([^<]*)<\/p>/;
const repairPhases = (line, L, y, m, zb, zc) => {
    const mt = line.match(PH_RE); if (!mt) return { line };
    const list = (tz) => { const seen = new Set(), items = []; for (const g of (MoonCalc.getMonthGrid(y, m, tz) || [])) { const l = (L === 'ar' ? (g.phase && g.phase.name) : (g.phase && g.phase.english)) || ''; if (!l || seen.has(l)) continue; seen.add(l); items.push(`${(g.phase && g.phase.icon) || '🌙'} ${l}`); } return escHtml(items.join(' · ')); };
    if (list(zb) !== mt[1]) return { line, why: 'phases: BASE != js/moon.js in ' + zb };
    const nv = list(zc);
    return { line: line.replace(PH_RE, () => '<p class="moon-month-context-phases">' + nv + '</p>'), used: nv !== mt[1] ? 'phase list' : '' };
};
// the Article JSON-LD articleBody (server _buildSsrMoonIntro, hub / month / year: city-local noon of TODAY) re-rendered with js/moon.js
const renderBody = (L, city, ms, tz, lat, lng) => {
    const dict = I18N[L] || I18N.en, en = I18N.en, d = new Date(ms);
    const tpl = dict['moon.intro_template'] || en['moon.intro_template'];
    const dp = MoonCalc.getDayPhase(d, tz); const phase = (dp && dp.phase) || MoonCalc.getPhaseName(d);
    const z = MoonCalc.getMoonZodiac(d);
    let alt = ''; const a = MoonCalc.getMoonAltitude(d, lat, lng); const af = Number(Math.abs(a)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (a > 0) { const az = MoonCalc.getMoonAzimuth(d, lat, lng); const k = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'][Math.round(((Number(az) || 0) % 360) / 45) % 8]; const dn = dict['moon.compass.' + k] || en['moon.compass.' + k] || k.toUpperCase(); const t = dict['moon.altitude_above'] || en['moon.altitude_above'] || ''; alt = t.replace(/\{alt\}/g, af).replace(/\{dir\}/g, dn); }
    else { const t = dict['moon.altitude_below'] || en['moon.altitude_below'] || ''; alt = t.replace(/\{alt\}/g, af); }
    return tpl.replace(/\{city\}/g, city).replace(/\{date\}/g, '').replace(/\{hijriInline\}/g, '').replace(/\{phaseIcon\}/g, phase.icon || '').replace(/\{phaseName\}/g, dict[phase.key] || en[phase.key] || phase.english || phase.name || '')
        .replace(/\{illum\}/g, fmt2(MoonCalc.getMoonIllumination(d))).replace(/\{age\}/g, fmt2(MoonCalc.getMoonAge(d))).replace(/\{zodiacIcon\}/g, z.icon || '').replace(/\{zodiacName\}/g, dict[z.i18nKey] || en[z.i18nKey] || z.key || '')
        .replace(/\{altitudeSentence\}/g, alt).replace(/\s{2,}/g, ' ').trim();
};
const BODY_RE = /"articleBody":("(?:[^"\\]|\\.)*")/;
const repairArticle = (line, ctx) => {
    const mt = line.match(BODY_RE); if (!mt || !line.includes('ssr-moon-article-schema')) return { line };
    const body = JSON.parse(mt[1]);
    const D = cityDate(ctx.T, ctx.tz), Dn = addDays(D, 1);
    const nC = exactNoon(D.y, D.m, D.d, ctx.tz), nB = exactNoon(Dn.y, Dn.m, Dn.d, ctx.tz);   // BASE's noon helper = tomorrow at >= +12
    const probe = renderBody(ctx.L, '\u0000', nB, ctx.tz, ctx.geo.lat, ctx.geo.lng).split('\u0000');
    if (!body.startsWith(probe[0])) return { line, why: 'article: BASE body does not start with the template' };
    const rest = body.slice(probe[0].length);
    const city = (probe.length > 1 && probe[1]) ? rest.slice(0, rest.indexOf(probe[1])) : rest;
    const wantB = renderBody(ctx.L, city, nB, ctx.tz, ctx.geo.lat, ctx.geo.lng);
    if (wantB !== body) return { line, why: 'article: BASE body != js/moon.js at tomorrow\'s noon ' + firstDiff(body, wantB) };
    const wantC = renderBody(ctx.L, city, nC, ctx.tz, ctx.geo.lat, ctx.geo.lng);
    return { line: line.replace(mt[0], () => '"articleBody":' + JSON.stringify(wantC)), used: 'article ' + (body.match(/(\d+\.\d\d)[%٪]/) || [])[1] + ' -> ' + (wantC.match(/(\d+\.\d\d)[%٪]/) || [])[1] };
};
const repairCountryIllum = (line, ctx) => {
    if (!line.includes('<section class="mc-summary">')) return { line };
    const D = cityDate(ctx.T, ctx.tz), Dn = addDays(D, 1);
    const vB = String(MoonCalc.getMoonIllumination(new Date(exactNoon(Dn.y, Dn.m, Dn.d, ctx.tz)))) + '%', vC = String(MoonCalc.getMoonIllumination(new Date(exactNoon(D.y, D.m, D.d, ctx.tz)))) + '%';
    const cell = (v) => '<div class="mc-card-val">' + v + '</div>';
    if (line.split(cell(vB)).length !== 2) return { line, why: 'country: BASE illumination != js/moon.js at tomorrow\'s noon (' + vB + ')' };
    return { line: line.replace(cell(vB), () => cell(vC)), used: 'country illumination ' + vB + ' -> ' + vC };
};
const repairLeap = (line, L) => {
    if (!line.includes('id="hijri-today-info-grid"')) return { line };
    const no = '<div class="info-card-value">' + LEAP[L][1] + '</div></div></div>', yes = '<div class="info-card-value">' + LEAP[L][0] + '</div></div></div>';
    if (line.split(no).length !== 2) return { line, why: 'leap: BASE card 6 is not "' + LEAP[L][1] + '"' };
    return { line: line.replace(no, () => yes), used: 'leap card ' + LEAP[L][1] + ' -> ' + LEAP[L][0] };
};
// build identity: BASE app.js?v=856&b=<BASE HEAD> -> app.js?v=857&b=<CAND HEAD>; i18n*.js ?v=N&b=<BASE HEAD> -> &b=<CAND HEAD>
const idSub = (B) => {
    let n = 0;
    let s = B.split('js/app.js?v=856&b=' + SHA_B).join('\u0001'); n += B.split('js/app.js?v=856&b=' + SHA_B).length - 1;
    s = s.replace(/js\/app\.js\?v=856(?=["'\s])/g, () => { n++; return 'js/app.js?v=857'; }).split('\u0001').join('js/app.js?v=857&b=' + SHA_C);
    s = s.replace(new RegExp('(i18n[a-z0-9/._-]*\\.js\\?v=\\d+)&b=' + SHA_B, 'g'), (m, a) => { n++; return a + '&b=' + SHA_C; });
    return { s, n, left: s.includes('&b=' + SHA_B) || /js\/app\.js\?v=856/.test(s) };
};
const ISLAND_RE = /\n    <script nonce="" id="ssr-moon-hub-sar">window\.__MOON_HUB_SAR__=(\{[^<]*\});<\/script>/g;
// classify one URL: { ok, cats[], why }
const classify = (u, b, c, ctx) => {
    const cats = [];
    const nb0 = noise(b.b), nc0 = noise(c.b);
    const id = idSub(nb0);
    if (id.left || /js\/app\.js\?v=856/.test(nc0) || nc0.includes('&b=' + SHA_B)) return { ok: false, cats, why: 'build identity not exact' };
    if (id.n) cats.push('build-identity');
    let B = id.s, C = nc0;
    // (e) the /moon hub island
    const isl = [...C.matchAll(ISLAND_RE)];
    if (ctx.kind === 'moon-hub') {
        if (isl.length !== 1 || [...B.matchAll(ISLAND_RE)].length) return { ok: false, cats, why: 'island count CAND ' + isl.length };
        let j = null; try { j = JSON.parse(isl[0][1]); } catch (_e) { j = null; }
        if (!j || JSON.stringify(Object.keys(j).sort()) !== JSON.stringify(Object.keys(ctx.island).sort()) || Object.keys(j).some((k) => j[k] !== ctx.island[k])) return { ok: false, cats, why: 'island content ' + isl[0][1] + ' != ' + JSON.stringify(ctx.island) };
        C = C.replace(ISLAND_RE, ''); cats.push('island');
    } else if (isl.length) return { ok: false, cats, why: 'island outside the bare /moon hub' };
    // (c) the moon.city.tz meta
    const bm = metaOf(B), cm = metaOf(C);
    if (bm !== cm) {
        if (!ctx.city || !ctx.zoneChange) return { ok: false, cats, why: 'meta ' + bm + ' -> ' + cm + ' not expected here' };
        if (cm !== ctx.city.timezone || bm !== (PRIMARY[ctx.cc] || null)) return { ok: false, cats, why: 'meta ' + bm + ' -> ' + cm + ' (want ' + (PRIMARY[ctx.cc] || null) + ' -> ' + ctx.city.timezone + ')' };
        if (bm === null) C = dropMeta(C); else B = setMeta(B, cm);
        cats.push(bm === null ? 'meta-added' : 'meta');
    }
    if (B === C) return { ok: true, cats };
    const A = B.split('\n'), Z = C.split('\n');
    if (A.length !== Z.length) return { ok: false, cats, why: 'line count ' + A.length + ' vs ' + Z.length + ' ' + firstDiff(B, C) };
    for (let i = 0; i < A.length; i++) {
        if (A[i] === Z[i]) continue;
        let line = A[i]; const whys = [];
        const step = (r) => { if (r.why) whys.push(r.why); if (r.used) cats.push(r.used.split(' ')[0] + (r.used.startsWith('country') ? '-illum' : '')); line = r.line; };
        if (ctx.kind === 'month' && ctx.srvZoneB !== ctx.srvZoneC) { step(repairStats(line, ctx.y, ctx.m, ctx.srvZoneB, ctx.srvZoneC)); step(repairPhases(line, ctx.L, ctx.y, ctx.m, ctx.srvZoneB, ctx.srvZoneC)); }
        if (ctx.plus12 && ctx.city) step(repairArticle(line, { T: ctx.T, tz: ctx.city.timezone, L: ctx.L, geo: ctx.geo }));
        if (ctx.kind === 'country' && ctx.plus12) step(repairCountryIllum(line, { T: ctx.T, tz: ctx.countryTz }));
        if (ctx.kind === 'leap') step(repairLeap(line, ctx.L));
        if (line !== Z[i]) return { ok: false, cats, why: 'unexplained line ' + i + ' ' + whys.join('; ') + ' ' + firstDiff(line, Z[i]) };
    }
    return { ok: true, cats };
};
// ---------------------------------------------------------------- run
const T_SCAN = '2026-10-19T19:30:00Z';
let kB = null, kC = null, chrome = null, cd = null;
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-final-chrome-'));
const summary = [];
try {
    fs.writeFileSync(CLOCK_FILE, String(Date.parse(T_SCAN)));
    for (const pt of [PORT.base, PORT.cand, PORT.cdp]) { if ((await get(pt, '/health')).st !== 0) throw new Error('port ' + pt + ' is already in use - set TP_SMOKE_PORT'); }
    kB = boot(BASE_ROOT, PORT.base); kC = boot(ROOT, PORT.cand);
    for (const pt of [PORT.base, PORT.cand]) { for (let t = 0; t < 400; t++) { if ((await get(pt, '/health')).st === 200) break; await sleep(250); } }
    await sleep(300);
    ok('[S]', kB.exitCode === null && kC.exitCode === null, 'both servers are this run\'s own processes (alive after /health)');
    {
        const hb = await get(PORT.base, '/'), hc = await get(PORT.cand, '/');
        ok('[S]', hb.b.includes('js/app.js?v=856&b=' + SHA_B) && hc.b.includes('js/app.js?v=857&b=' + SHA_C), 'served build identity: BASE app.js?v=856&b=' + SHA_B + ', CAND app.js?v=857&b=' + SHA_C);
    }
    // ------------------------------------------------------------ hubs (via the production legacy 301)
    const HUB = {};
    for (const s of Object.keys(CITY10).concat(EXTRA)) {
        const r = await get(PORT.base, '/en/moon-in-' + s);
        const loc = String(r.h.location || '').replace(/^https?:\/\/[^/]+/, '');
        HUB[s] = /^\/en\/moon\/[a-z-]+\/[a-z0-9.-]+$/.test(loc) ? loc.slice(3) : null;
    }
    console.log('   hubs: ' + Object.entries(HUB).map(([k, v]) => k + ' ' + v).join(' | '));
    ok('[4]', Object.values(HUB).every(Boolean), 'every test city resolves (production legacy 301) to a nested /moon/{country}/{city} hub');
    // the island the /moon hub must carry: for each curated hk / mo city, its moon hub path when that answers 200 on production, else ''
    const ISLAND = {};
    for (const s of Object.keys(CUR).filter((k) => /^(hk|mo)$/i.test(CUR[k].countryCode || ''))) {
        const r = await get(PORT.base, '/moon-in-' + s); const loc = String(r.h.location || '').replace(/^https?:\/\/[^/]+/, '');
        ISLAND[s] = (r.st === 301 && /^\/moon\/[a-z-]+\/[a-z0-9.-]+$/.test(loc) && (await get(PORT.base, loc)).st === 200) ? loc : '';
    }
    console.log('   expected /moon island (production routes): ' + JSON.stringify(ISLAND));
    // ------------------------------------------------------------ [4] + [6] URL set
    const urls = [];
    const countries = [...new Set(Object.values(HUB).filter(Boolean).map((h) => h.split('/')[2]))].concat(['new-zealand', 'samoa', 'fiji', 'tonga', 'narnia']);
    for (const L of LANGS3) {
        const lp = lpOf(L);
        for (const p of ['/moon', '/moon-today', '/today-hijri-date', '/hijri-calendar', '/hijri-calendar/1447', '/hijri-calendar/1448', '/hijri-calendar/1449', '/hijri-calendar/1446', '/hijri-calendar/1450', '/hijri-calendar/1355',
            '/hijri-calendar/1448-04', '/hijri-calendar/1446-04', '/hijri-calendar/1450-01', '/hijri-calendar/1448-13', '/hijri-date/1448-05-08', '/hijri-date/1440-01-01']) urls.push(lp + p);
        for (const c of [...new Set(countries)]) urls.push(lp + '/moon/' + c);
        for (const s of Object.keys(CITY10).concat(EXTRA)) {
            const h = HUB[s]; if (!h) continue;
            const full = Object.prototype.hasOwnProperty.call(CITY10, s) || ['orlando', 'columbia', 'al-quneitra', 'sokhumi', 'katzrin'].includes(s);
            const tails = full ? ['', '/2021', '/2026', '/2031', '/2020', '/2032', '/2040', '/2026/10', '/2026/11', '/2021/01', '/2031/12', '/2020/12', '/2032/01', '/2026/13', '/2026/10/19', '/2026/10/20', '/2031/12/31', '/today']
                : ['', '/2026', '/2026/10', '/2026/10/19', '/today'];
            for (const t of tails) urls.push(lp + h + t);
            urls.push(lp + '/moon-in-' + s, lp + '/moon-in-' + s + '/2026-10', lp + '/moon-in-' + s + '/2026-10-19', lp + '/moon-today-in-' + s);
            if (full) for (const q of ['/prayer-times-in-', '/qibla-in-', '/next-prayer-in-', '/time-left-until-next-prayer-in-']) urls.push(lp + q + s);
        }
        for (const p of ['/moon/united-states/narnia', '/moon/narnia/seattle', '/moon/hong-kong/hong-kong', '/moon/macau/macau', '/moon/united-states/seattle/2026/10/19/x', '/no-such-page-xyz', '/prayer-times-in-zzzz-nowhere', '/qibla-in-zzzz-nowhere', '/moon-in-zzzz-nowhere']) urls.push(lp + p);
    }
    console.log('\n-- [4] + [6] ' + urls.length + ' URLs x BASE / CAND at ' + T_SCAN);
    await setClock(T_SCAN);
    const tScan = Date.parse(T_SCAN);
    const ctxFor = (u, bBody, cBody, T) => {
        const L = (u.match(/^\/(en|fr|tr|ur|de|id|es|bn|ms)(?=\/|$)/) || [])[1] || 'ar';
        const p = u.slice(lpOf(L).length) || '/';
        const ctx = { L, T, kind: 'other' };
        if (p === '/moon') { ctx.kind = 'moon-hub'; ctx.island = ISLAND; return ctx; }
        if (p === '/today-hijri-date') { ctx.kind = 'leap'; return ctx; }
        let m = p.match(/^\/moon\/([a-z-]+)$/);
        if (m) { const cc = { 'new-zealand': 'nz', samoa: 'ws', fiji: 'fj', tonga: 'to' }[m[1]]; ctx.kind = 'country'; ctx.countryTz = cc ? (PRIMARY[cc] || null) : null; ctx.plus12 = !!ctx.countryTz && offMin(T, ctx.countryTz) >= 720; return ctx; }
        m = p.match(/^\/moon\/([a-z-]+)\/([a-z0-9.-]+)(?:\/(\d{4})(?:\/(\d{2}))?)?$/);
        if (!m || !CUR[m[2]]) return ctx;
        const city = CUR[m[2]], cc = String(city.countryCode || '').toLowerCase();
        ctx.kind = m[4] ? 'month' : (m[3] ? 'year' : 'hub'); ctx.y = Number(m[3]); ctx.m = Number(m[4]);
        ctx.city = city; ctx.cc = cc; ctx.geo = geoOf(cBody) || geoOf(bBody);
        const bm = metaOf(noise(bBody));
        // slug collision (decision #14 not done): the page describes another place than the curated record — a namesake more
        // than 1 deg away, or the page resolved under another country (production meta = that country's zone, /moon/china/hong-kong)
        const farAway = !ctx.geo || Math.abs(ctx.geo.lat - city.lat) > 1 || Math.abs(ctx.geo.lng - city.lng) > 1;
        const otherCountry = bm !== null && bm !== (PRIMARY[cc] || null);
        ctx.collision = farAway || otherCountry;
        ctx.exempt = EXEMPT.has(cc + '/' + city.slug);
        ctx.zoneChange = !ctx.collision && !ctx.exempt && city.timezone !== (PRIMARY[cc] || null);
        ctx.plus12 = !ctx.collision && !ctx.exempt && offMin(T, city.timezone) >= 720;
        ctx.srvZoneB = bm || 'Asia/Riyadh'; ctx.srvZoneC = metaOf(noise(cBody)) || 'Asia/Riyadh';
        return ctx;
    };
    const runScan = async (list, T, tag) => {
        const res = []; let next = 0;
        await Promise.all(Array.from({ length: 4 }, async () => {
            while (next < list.length) {
                const u = list[next++];
                let [b, c] = await Promise.all([get(PORT.base, u), get(PORT.cand, u)]);
                let ctx = ctxFor(u, b.b, c.b, T), r = classify(u, b, c, ctx), retried = false;
                if (!r.ok) { await sleep(300); [b, c] = await Promise.all([get(PORT.base, u), get(PORT.cand, u)]); ctx = ctxFor(u, b.b, c.b, T); r = classify(u, b, c, ctx); retried = true; }
                res.push({ u, b, c, ctx, r, retried });
            }
        }));
        return res;
    };
    const scan = await runScan(urls, tScan, 'T1');
    // [4] statuses + redirects + canonical + robots + hreflang
    {
        const st = {}; const bad = [];
        for (const x of scan) {
            const f = (r) => [r.st, String(r.h.location || ''), canonOf(r.b), robotsOf(r.b), String(r.h['x-robots-tag'] || ''), hreflangOf(r.b)].join(' | ');
            st[x.b.st] = (st[x.b.st] || 0) + 1;
            if (f(x.b) !== f(x.c)) bad.push(x.u + ' BASE ' + f(x.b).slice(0, 200) + ' CAND ' + f(x.c).slice(0, 200));
        }
        console.log('   statuses (BASE): ' + JSON.stringify(st));
        ok('[4]', bad.length === 0 && scan.length === urls.length, scan.length + ' URLs: status + Location + canonical + meta robots + X-Robots-Tag + hreflang identical BASE vs CAND', bad.slice(0, 6).join(' ; '));
        for (const code of [200, 301, 404, 410]) ok('[4]', (st[code] || 0) > 10, 'the set covers status ' + code + ' (' + (st[code] || 0) + ' URLs)');
        const sp = (re, want) => { const xs = scan.filter((x) => re.test(x.u)); return xs.length > 0 && xs.every((x) => want(x)); };
        ok('[4]', sp(/\/moon\/[a-z-]+\/[a-z0-9.-]+\/(?:2026\/10\/19|2026\/10\/20|2031\/12\/31|today)$/, (x) => x.c.st === 410 && !x.c.h.location), 'removed moon day + today URLs: 410 without a Location on CAND (as production)');
        ok('[4]', sp(/\/moon-in-[a-z0-9.-]+\/2026-10-19$/, (x) => x.c.st === 410), 'legacy dated /moon-in-{city}/YYYY-MM-DD: 410 on CAND (as production)');
        ok('[4]', sp(/\/moon-in-(?:seattle|riga|apia|auckland|jayapura)$/, (x) => x.c.st === 301 && /\/moon\/[a-z-]+\/[a-z0-9.-]+$/.test(String(x.c.h.location))), 'legacy /moon-in-{city}: 301 to the nested hub on CAND (as production)');
        ok('[4]', sp(/\/hijri-calendar\/1446$/, (x) => x.c.st === 410) && sp(/\/hijri-calendar\/(?:1450|1355)$/, (x) => x.c.st === 404) && sp(/\/hijri-calendar\/(?:1447|1448|1449)$/, (x) => x.c.st === 200), 'hijri calendar window 1447-1449 = 200, 1446 = 410, 1450 / 1355 = 404 on CAND (as production)');
        const stOf = (re) => { const m = {}; for (const x of scan.filter((y) => re.test(y.u))) { const k = x.b.st + '/' + x.c.st; m[k] = (m[k] || 0) + 1; } return JSON.stringify(m); };
        console.log('   moon years in window (2021, 2026, 2031) BASE/CAND: ' + stOf(/\/moon\/[a-z-]+\/[a-z0-9.-]+\/(?:2021|2026|2031)$/) + '; out of window (2020, 2032, 2040): ' + stOf(/\/moon\/[a-z-]+\/[a-z0-9.-]+\/(?:2020|2032|2040)$/) + '; months in (2026/10, 2026/11, 2021/01, 2031/12): ' + stOf(/\/(?:2026\/1[01]|2021\/01|2031\/12)$/) + '; months out / invalid (2020/12, 2032/01, 2026/13): ' + stOf(/\/(?:2020\/12|2032\/01|2026\/13)$/));
        ok('[4]', sp(/\/moon\/[a-z-]+\/(?:seattle|riga|apia|auckland|jayapura|new-york|london)\/(?:2021|2026|2031|2026\/10|2026\/11|2021\/01|2031\/12)$/, (x) => x.c.st === 200) && sp(/\/moon\/[a-z-]+\/[a-z0-9.-]+\/(?:2020|2032|2040|2020\/12|2032\/01|2026\/13)$/, (x) => x.c.st !== 200 && x.c.st === x.b.st), 'moon years / months: in the window 200, outside it the same non-200 as production');
        ok('[4]', sp(/\/(?:moon\/narnia|moon\/narnia\/seattle|moon\/united-states\/narnia|moon\/hong-kong\/hong-kong|moon\/macau\/macau|no-such-page-xyz|moon-in-zzzz-nowhere)$/, (x) => x.c.st === 404), '404 probes (unknown moon country / city, /moon/hong-kong|macau/{city}, unknown page) stay 404 on CAND');
        console.log('   unknown-city prayer / qibla probes BASE/CAND (pre-existing behaviour, outside this ticket): ' + stOf(/\/(?:prayer-times|qibla)-in-zzzz-nowhere$/));
    }
    // [6] full normalised HTML
    {
        const cats = {}; const bad = []; let retried = 0;
        for (const x of scan) { if (x.retried) retried++; if (!x.r.ok) bad.push(x.u + ' [' + x.ctx.kind + '] ' + x.r.why); for (const k of new Set(x.r.cats)) cats[k] = (cats[k] || 0) + 1; }
        const only = scan.filter((x) => x.r.ok && x.r.cats.every((k) => k === 'build-identity')).length;
        console.log('   expected-difference categories (pages): ' + JSON.stringify(cats) + '; identical apart from the build identity: ' + only + '; re-fetched once: ' + retried);
        ok('[6]', bad.length === 0, scan.length + ' URLs: every byte difference is one of (a)-(e), each re-computed and matched exactly; ' + bad.length + ' unexplained', bad.slice(0, 8).join(' ;; '));
        const pages = (pred) => scan.filter((x) => pred(x)).map((x) => x.u);
        const has = (u, k) => { const x = scan.find((y) => y.u === u); return !!x && x.r.ok && x.r.cats.includes(k); };
        const none = (u) => { const x = scan.find((y) => y.u === u); return !!x && x.r.ok && x.r.cats.every((k) => k === 'build-identity'); };
        ok('[6]', LANGS3.every((L) => has(lpOf(L) + '/today-hijri-date', 'leap')), '(b) /today-hijri-date card 6 leapNo -> leapYes in ar / en / fr (10 languages below)');
        ok('[6]', LANGS3.every((L) => has(lpOf(L) + '/moon', 'island')), '(e) /moon island present with the expected content in ar / en / fr');
        ok('[6]', LANGS3.every((L) => ['seattle', 'los-angeles', 'jayapura'].every((s) => has(lpOf(L) + HUB[s], 'meta') && has(lpOf(L) + HUB[s] + '/2026/10', 'meta'))), '(c) Seattle, Los Angeles, Jayapura hubs + months: meta = the city zone (BASE: the country zone)');
        ok('[6]', LANGS3.every((L) => ['riga', 'apia'].every((s) => has(lpOf(L) + HUB[s], 'meta-added'))), '(c) Riga, Apia (country without a primary zone): CAND adds the meta = the city zone');
        ok('[6]', LANGS3.every((L) => has(lpOf(L) + HUB.seattle + '/2026/10', 'stats') && has(lpOf(L) + HUB.jayapura + '/2026/11', 'stats')), '(c) month summary values re-computed in the city zone (Seattle 2026/10, Jayapura 2026/11)');
        ok('[6]', LANGS3.every((L) => has(lpOf(L) + HUB.auckland, 'article') && has(lpOf(L) + HUB.apia, 'article')), '(d) Auckland + Apia (UTC+13 at ' + T_SCAN + '): Article JSON-LD re-rendered at the city\'s own noon (BASE: tomorrow\'s)');
        ok('[6]', LANGS3.every((L) => has(lpOf(L) + '/moon/new-zealand', 'country-illum')), '(d) /moon/new-zealand illumination card at Auckland\'s own noon (BASE: tomorrow\'s)');
        const ctrl = ['new-york', 'jakarta', 'london', 'riyadh', 'orlando', 'columbia', 'al-quneitra', 'sokhumi', 'katzrin', 'hong-kong', 'macau', 'cairo', 'sydney'];
        const ctrlBad = []; for (const L of LANGS3) for (const s of ctrl) for (const t of ['', '/2026', '/2026/10']) { const u = lpOf(L) + HUB[s] + t; if (scan.find((y) => y.u === u) && !none(u)) ctrlBad.push(u); }
        ok('[6]', ctrlBad.length === 0, 'controls, slug collisions (orlando, columbia, hong-kong, macau under china), the 3 exempt cities (al-quneitra, sokhumi, katzrin): hub / year / month identical apart from the build identity', ctrlBad.join(' '));
        // the 3 exempt cities: EVERY scanned URL (hub, years and months in / out of the window, removed day / today, legacy
        //   /moon-in- + /moon-today-in-, prayer / qibla / next-prayer / time-left) = production apart from the build identity
        const exU = scan.filter((x) => /\/(?:al-quneitra|sokhumi|katzrin)(?:[/?]|$)|-in-(?:al-quneitra|sokhumi|katzrin)(?:[/?]|$)/.test(x.u));
        const exBad = exU.filter((x) => !(x.r.ok && x.r.cats.every((k) => k === 'build-identity'))).map((x) => x.u + ' ' + (x.r.why || x.r.cats.join(',')));
        ok('[6]', exU.length >= 3 * 3 * 26 && exU.some((x) => /katzrin/.test(x.u) && x.c.st === 200) && exBad.length === 0, 'the 3 exempt cities (al-quneitra, sokhumi, katzrin): all ' + exU.length + ' of their URLs (ar, en, fr) identical to production apart from the build identity', exBad.slice(0, 6).join(' ; '));
        const qBad = pages((x) => /\/(?:prayer-times|qibla|next-prayer|time-left-until-next-prayer)-in-/.test(x.u) && !none(x.u));
        ok('[6]', qBad.length === 0, 'prayer / qibla / next-prayer / time-left city pages: identical apart from the build identity', qBad.join(' '));
        const tagged = scan.filter((x) => x.r.cats.some((k) => k !== 'build-identity')).map((x) => x.u + ' {' + [...new Set(x.r.cats)].filter((k) => k !== 'build-identity').join(',') + '}');
        summary.push('   [6] pages with an expected difference beyond the build identity (' + tagged.length + '): ' + tagged.join(' | '));
    }
    // [6] 10 languages: leap card + island
    {
        const bad = [];
        for (const L of LANGS10) for (const p of ['/today-hijri-date', '/moon']) {
            const u = lpOf(L) + p; let b = await get(PORT.base, u), c = await get(PORT.cand, u);
            const ctx = ctxFor(u, b.b, c.b, tScan); let r = classify(u, b, c, ctx);
            if (!r.ok) { await sleep(300); b = await get(PORT.base, u); c = await get(PORT.cand, u); r = classify(u, b, c, ctx); }
            if (!(b.st === 200 && c.st === 200 && r.ok && r.cats.includes(p === '/moon' ? 'island' : 'leap'))) bad.push(u + ' ' + r.why);
        }
        const hy = (() => { const ry = cityDate(tScan, 'Asia/Riyadh'); const key = ymd(ry); let cur = null; for (const [y, v] of Object.entries(HIJRI.years)) if (v.yearStart <= key) cur = Number(y); return cur; })();
        ok('[6]', hy === 1448 && HIJRI.years['1448'].yearLength === 355, '(b) current Hijri year by Riyadh date = ' + hy + ', table length ' + (HIJRI.years[hy] || {}).yearLength + ' -> the card must say "' + LEAP.en[0] + '"');
        ok('[6]', bad.length === 0, '(b)+(e) 10 languages: /today-hijri-date differs ONLY by card 6 leapNo -> leapYes, /moon ONLY by the island (+ build identity)', bad.join(' ; '));
    }
    // [6] month boundary: month links follow the CITY's month; CAND(T) == BASE(T') where T' = the same city date in both zones
    {
        console.log('\n-- [6] month boundary (tz-derived month links)');
        const MB = [['seattle', '2026-11-01T05:30:00Z', '2026-10-31T19:30:00Z'], ['los-angeles', '2026-11-01T05:30:00Z', '2026-10-31T19:30:00Z'], ['jayapura', '2026-10-31T16:30:00Z', '2026-11-01T03:00:00Z']];
        for (const [s, T, Tp] of MB) for (const L of LANGS3) {
            const u = lpOf(L) + HUB[s]; const z = CUR[s].timezone;
            await setClock(T); const b = await get(PORT.base, u), c = await get(PORT.cand, u);
            await setClock(Tp); const bp = await get(PORT.base, u);
            const idc = noise(c.b), idb = idSub(noise(b.b)).s, idbp = idSub(noise(bp.b)).s;
            // "this month" (edu link + related card 2) and "next month" (related card 3)
            const links = (h) => ['moon-city-hub-edu-link-other', 'moon-hub-related-2', 'moon-hub-related-3'].map((k) => (h.match(new RegExp('<a class="(?:[^"]* )?' + k + '(?: [^"]*)?" href="[^"]*/(\\d{4}/\\d{2})"')) || [])[1] || null);
            const ym = (c) => c.y + '/' + String(c.m).padStart(2, '0');
            const cMonth = cityDate(Date.parse(T), z), bMonth = cityDate(Date.parse(T), PRIMARY[CUR[s].countryCode.toLowerCase()]);
            const lc = links(idc), lb = links(idb);
            const nextOf = (c) => ym(addDays({ y: c.y, m: c.m, d: 1 }, 32));
            ok('[6]', c.st === 200 && cMonth.m !== bMonth.m && lc[0] === ym(cMonth) && lc[1] === ym(cMonth) && lc[2] === nextOf(cMonth) && lb[0] === ym(bMonth) && lb[1] === ym(bMonth) && setMeta(idbp, z) === idc,
                '(c) ' + u + ' @' + T + ': CAND month links ' + lc.join(',') + ' (city date ' + ymd(cMonth) + '), BASE ' + lb.join(',') + ' (country zone ' + ymd(bMonth) + '); CAND == BASE at ' + Tp + ' (same city date) apart from the meta', firstDiff(setMeta(idbp, z), idc));
        }
        await setClock(T_SCAN);
    }
    // ------------------------------------------------------------ Chrome
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT.cdp, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--disable-extensions',
        '--proxy-server=http=127.0.0.1:9;https=127.0.0.1:9', '--proxy-bypass-list=127.0.0.1', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    let ws = null;
    for (let i = 0; i < 60 && !ws; i++) { try { const r = await fetch('http://127.0.0.1:' + PORT.cdp + '/json/new?about:blank', { method: 'PUT' }); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl; } catch (_e) { /* not up */ } if (!ws) await sleep(250); }
    if (!ws) throw new Error('chrome did not start');
    cd = await cdp(ws);
    let caught = [], uncaught = [], offsite = [];
    cd.on((d) => {
        if (d.method === 'Debugger.paused') {
            const p = d.params || {};
            if (p.reason === 'exception' || p.reason === 'promiseRejection') { const ex = p.data || {}; caught.push({ desc: String(ex.description || ex.value || ex.className || p.reason).split('\n')[0], frames: (p.callFrames || []).map((f) => f.functionName || '(anon)') }); }
            cd.send('Debugger.resume');
        } else if (d.method === 'Runtime.exceptionThrown') { const e = (d.params && d.params.exceptionDetails) || {}; uncaught.push(String((e.exception && e.exception.description) || e.text || '').split('\n')[0]); }
        else if (d.method === 'Network.requestWillBeSent') { const u = String((d.params && d.params.request && d.params.request.url) || ''); if (/^https?:/.test(u) && !/^https?:\/\/127\.0\.0\.1[:/]/.test(u)) offsite.push(u); }
    });
    await cd.send('Network.enable'); await cd.send('Network.setBlockedURLs', { urls: AD_BLOCK }); await cd.send('Network.setBypassServiceWorker', { bypass: true }); await cd.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cd.send('Page.enable'); await cd.send('Runtime.enable'); await cd.send('Debugger.enable'); await cd.send('Debugger.setPauseOnExceptions', { state: 'all' });
    const ev = async (expr) => { const r = await cd.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
    let initId = null;
    const load = async (port, p, nowMs, visitorTz, store, waitFor) => {
        await setClock(nowMs);
        if (initId) await cd.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: initId });
        const src = '(()=>{try{localStorage.clear();sessionStorage.clear();' + (store || '') + '}catch(_e){}const R=Date,T=' + nowMs + ',off=T-R.now();' +
            'class D extends R{constructor(...a){if(a.length===0)super(R.now()+off);else super(...a);}static now(){return R.now()+off;}}' +
            'D.UTC=R.UTC;D.parse=R.parse;Object.defineProperty(D,Symbol.hasInstance,{value:(x)=>x instanceof R});globalThis.Date=D;})()';
        const r = await cd.send('Page.addScriptToEvaluateOnNewDocument', { source: src });
        initId = r.result && r.result.identifier;
        await cd.send('Emulation.setTimezoneOverride', { timezoneId: visitorTz });
        caught = []; uncaught = [];
        await cd.send('Page.navigate', { url: 'http://127.0.0.1:' + port + p });
        for (let i = 0; i < 100; i++) { await sleep(150); if ((await ev('document.readyState')) === 'complete') break; }
        if (waitFor) for (let i = 0; i < 60; i++) { if (await ev(waitFor)) break; await sleep(150); }
        await sleep(500);
        return { caught: caught.slice(), uncaught: uncaught.slice() };
    };
    const csoErr = (R) => R.caught.some((x) => /COUNTRY_SLUG_OVERRIDES/.test(x.desc)) || R.uncaught.some((x) => /COUNTRY_SLUG_OVERRIDES/.test(x));
    const multiset = (arr) => { const m = {}; arr.forEach((x) => { m[x] = (m[x] || 0) + 1; }); return JSON.stringify(Object.keys(m).sort().map((k) => [k, m[k]])); };
    // ------------------------------------------------------------ [1] + [3]
    console.log('\n-- [1] + [3] headless Chrome: city zone + date, structured data vs visible');
    const READ_JS = "(()=>{const g=(id)=>{const e=document.getElementById(id);return e?e.textContent.trim():null};const rows=[...document.querySelectorAll('#moon-forecast-body tr')];const td=document.querySelector('#moon-forecast-body tr.fc-row-today');const n=document.getElementById('moon-timezone-note');const m=document.querySelector('meta[name=\"moon.city.tz\"]');const fb=document.getElementById('moon-forecast-body');const a=document.getElementById('ssr-moon-article-schema');let body=null;try{body=JSON.parse(a.textContent).articleBody}catch(_e){}return {phase:g('moon-phase-name'),illum:g('moon-illumination-pct'),age:g('moon-age'),rise:g('moon-rise'),set:g('moon-set'),tzNote:(n&&!n.hidden)?n.textContent.trim():'',row0:rows[0]&&rows[0].children[0]?rows[0].children[0].textContent.trim():null,todayRow:td&&td.children[0]?td.children[0].textContent.trim():null,hijriGreg:g('moon-hijri-greg'),meta:m?m.content:null,fcHtml:fb?fb.innerHTML:'',rowsHtml:rows.map(r=>r.outerHTML),body}})()";
    const EXPECT_JS = (noon, tz, lat, lng) => `(()=>{const N=${noon},tz=${JSON.stringify(tz)},la=${lat},ln=${lng};const d=new Date(N);const dp=MoonCalc.getDayPhase(d,tz);const ph=(dp&&dp.phase)||MoonCalc.getPhaseName(d);const loc=(ph.key&&typeof t==='function')?t(ph.key):ph.name;const nm=(loc&&loc!==ph.key)?loc:(ph.name||'');const mt=MoonCalc.getMoonTimes(d,la,ln,tz);let set=mt.set;try{if(mt.riseTime instanceof Date){const sb=(mt.setTime instanceof Date)&&mt.setTime.getTime()<mt.riseTime.getTime();if(sb||!(mt.setTime instanceof Date)){const t2=MoonCalc.getMoonTimes(new Date(N+86400000),la,ln,tz);if(t2&&t2.setTime instanceof Date)set=t2.set;}}}catch(e){}return {phase:((ph.icon||'')+' '+nm).trim(),illum:MoonCalc.getMoonIllumination(d)+'%',age:MoonCalc.getMoonAge(d)+' '+t('moon.days_suffix'),rise:mt.rise,set:set}})()`;
    const F = ['phase', 'illum', 'age', 'rise', 'set'];
    const defectSeen = {}; const exAll = { B: [], C: [] };
    for (const s of Object.keys(CITY10)) {
        const Z = CITY10[s]; const p = '/en' + HUB[s];
        ok('[1]', CUR[s] && CUR[s].timezone === Z, s + ': the curated record\'s zone is ' + Z);
        const mid = (() => { const c = { y: 2026, m: 10, d: 21 }; return localToUtc(c.y, c.m, c.d, 0, 0, Z); })();
        const instants = [[Date.parse('2026-10-19T19:30:00Z'), 'common instant 2026-10-19T19:30Z'], [mid - 60000, '1 min before local midnight 2026-10-21'], [mid + 60000, '1 min after local midnight 2026-10-21']];
        for (const [T, what] of instants) {
            const visitors = (['seattle', 'auckland', 'apia'].includes(s) && what.startsWith('common')) ? ['Asia/Riyadh', 'Pacific/Kiritimati', 'America/Los_Angeles'] : ['Asia/Riyadh'];
            const D = cityDate(T, Z), noon = exactNoon(D.y, D.m, D.d, Z), lbl = label(D);
            const Dm = addDays(D, -1), Dp = addDays(D, 1);
            const results = [];
            for (const V of visitors) {
                const RB = await load(PORT.base, p, T, V, '', "/\\d/.test((document.getElementById('moon-illumination-pct')||{}).textContent||'')");
                const gb = await ev(READ_JS);
                const RC = await load(PORT.cand, p, T, V, '', "/\\d/.test((document.getElementById('moon-illumination-pct')||{}).textContent||'')");
                const gc = await ev(READ_JS);
                const geo = await ev("(()=>{const m=document.querySelector('meta[name=\"geo.position\"]');if(!m)return null;const [a,b]=m.content.split(';').map(Number);return {lat:a,lng:b}})()");
                const exp = await ev(EXPECT_JS(noon, Z, geo.lat, geo.lng));
                exAll.B.push(...RB.uncaught); exAll.C.push(...RC.uncaught);
                const tag = s + ' @' + new Date(T).toISOString().slice(0, 16) + 'Z (' + what + ', city ' + ymd(D) + ') [' + V + ']';
                console.log(`   · ${tag}\n       engine (${Z}): ${lbl} | ${exp.phase} | ${exp.illum} | ${exp.age} | rise ${exp.rise} | set ${exp.set}\n       BASE: ${gb.row0} | ${gb.phase} | ${gb.illum} | ${gb.age} | rise ${gb.rise} | set ${gb.set} | meta ${gb.meta}\n       CAND: ${gc.row0} | ${gc.phase} | ${gc.illum} | ${gc.age} | rise ${gc.rise} | set ${gc.set} | meta ${gc.meta}`);
                ok('[1]', gc.meta === Z && F.every((k) => gc[k] === exp[k]) && gc.row0 === lbl && gc.todayRow === lbl && gc.tzNote.includes('(' + Z + ')') && String(gc.hijriGreg || '').includes(D.d + ' ' + EN_MO[D.m - 1] + ' ' + D.y),
                    'CAND ' + tag + ': meta ' + Z + '; day ' + lbl + '; phase / illumination / age / rise / set == js/moon.js with ' + Z + ' at the city\'s noon; today row, zone line, date card agree', JSON.stringify({ gc: { ...gc, fcHtml: undefined, body: undefined }, exp }));
                // [3] structured data == visible == engine for the visible date (and not the neighbouring dates)
                const bi = gc.body && (gc.body.match(/(\d+\.\d\d)%/) || [])[1], ba = gc.body && (gc.body.match(/(\d+\.\d\d) days/) || [])[1];
                const ci = String(gc.illum || '').replace('%', ''), ca = String(gc.age || '').replace(/ days?$/, '');
                const e0 = fmt2(MoonCalc.getMoonIllumination(new Date(noon))), em = fmt2(MoonCalc.getMoonIllumination(new Date(exactNoon(Dm.y, Dm.m, Dm.d, Z)))), ep = fmt2(MoonCalc.getMoonIllumination(new Date(exactNoon(Dp.y, Dp.m, Dp.d, Z))));
                ok('[3]', bi && Number(bi) === Number(ci) && ba && Number(ba) === Number(ca) && bi === e0 && bi !== em && bi !== ep && gc.meta === Z && gc.tzNote.includes('(' + Z + ')'),
                    'CAND ' + tag + ': JSON-LD articleBody ' + bi + '% / ' + ba + ' days == card ' + gc.illum + ' / ' + gc.age + ' == js/moon.js at noon of ' + ymd(D) + ' (' + e0 + '%; ' + ymd(Dm) + ' ' + em + '%, ' + ymd(Dp) + ' ' + ep + '%); head meta zone == zone line == ' + Z, gc.body);
                ok('[1]', RC.uncaught.length === 0 && !csoErr(RC), 'CAND ' + tag + ': no uncaught exception, no COUNTRY_SLUG_OVERRIDES error', RC.uncaught.join(' | '));
                if (CONTROLS.has(s)) {
                    // the 14-day table: rows whose engine window starts on another date (a clock change inside the 14 days) are the
                    // DST fix's ([2]); every other row must be byte-identical
                    const fam = FAMOUS[s];
                    const fcN = MoonCalc.getForecast(new Date(noon), fam.lat, fam.lng, 14, fam.tz);
                    const sh = fcN.map((r, i) => (sameDay(cityDate(r.dayStart.getTime(), fam.tz), addDays(D, i)) ? -1 : i)).filter((i) => i >= 0);
                    const rowsSame = gb.rowsHtml.length === 14 && gc.rowsHtml.length === 14 && gb.rowsHtml.every((h, i) => sh.includes(i) || h === gc.rowsHtml[i]);
                    ok('[1]', fam.tz === Z && F.every((k) => gb[k] === gc[k]) && gb.row0 === gc.row0 && gb.todayRow === gc.todayRow && gb.tzNote === gc.tzNote && rowsSame, 'control ' + tag + ': BASE == CAND (card, zone line, 14-day table' + (sh.length ? ' apart from the ' + sh.length + ' DST-window rows of [2]' : ', whole') + ')', firstDiff(String(gb.fcHtml), String(gc.fcHtml)));
                } else {
                    const wrong = F.filter((k) => gb[k] !== exp[k]).concat(gb.row0 !== lbl ? ['day'] : []).concat(gb.meta !== Z ? ['meta'] : []);
                    const bodyB = gb.body && (gb.body.match(/(\d+\.\d\d)%/) || [])[1];
                    if (wrong.length || (bodyB && Number(bodyB) !== Number(String(gb.illum).replace('%', '')))) defectSeen[s] = (defectSeen[s] || []).concat([ymd(D) + ' ' + what.split(' ')[0] + ': ' + (wrong.join('/') || 'card != JSON-LD')]);
                    summary.push(`   ${tag}  BASE ${gb.row0} ${gb.illum} rise ${gb.rise} set ${gb.set} meta ${gb.meta} (JSON-LD ${bodyB}%)  ->  CAND ${gc.row0} ${gc.illum} rise ${gc.rise} set ${gc.set} (JSON-LD ${bi}%)`);
                }
                results.push(gc);
            }
            if (results.length > 1) ok('[1]', results.every((r) => F.every((k) => r[k] === results[0][k]) && r.row0 === results[0].row0 && r.meta === results[0].meta), 'CAND ' + s + ' ' + what + ': same card and day for visitors in ' + visitors.join(', '));
        }
    }
    for (const s of Object.keys(CITY10).filter((x) => !CONTROLS.has(x))) ok('[1]', (defectSeen[s] || []).length > 0, 'BASE reproduces the defect on ' + s + ': ' + (defectSeen[s] || []).join('; '));
    ok('[1]', multiset(exAll.C) === '[]', 'no uncaught exception on any CAND moon city page load (BASE: ' + multiset(exAll.B) + ')');
    // ------------------------------------------------------------ [2] DST
    console.log('\n-- [2] headless Chrome: 14-day table across clock changes');
    const TBL_JS = "(()=>{const fb=document.getElementById('moon-forecast-body');return fb?[...fb.querySelectorAll('tr')].map(tr=>({cls:tr.className,aria:tr.getAttribute('aria-current'),html:tr.outerHTML,cells:[...tr.children].map(td=>td.textContent.trim())})):[]})()";
    const DST = [
        ['london', '2026-10-25', 'DST end'], ['london', '2026-10-19', '6 days before DST end'],
        ['new-york', '2026-11-01', 'DST end'], ['new-york', '2026-10-27', '5 days before DST end'],
        ['los-angeles', '2026-11-01', 'DST end'], ['los-angeles', '2026-10-27', '5 days before DST end'],
        ['sydney', '2026-10-04', 'DST start'], ['sydney', '2026-09-30', '4 days before DST start'], ['sydney', '2027-04-04', 'DST end'], ['sydney', '2027-03-30', '5 days before DST end'],
        ['jerusalem', '2026-10-25', 'DST end'], ['jerusalem', '2026-10-20', '5 days before DST end'], ['jerusalem', '2027-03-26', 'DST start'], ['jerusalem', '2027-03-22', '4 days before DST start'],
        ['cairo', '2026-10-29', 'DST end'], ['cairo', '2026-10-24', '5 days before DST end'], ['cairo', '2027-04-30', 'DST start'], ['cairo', '2027-04-25', '5 days before DST start'],
        ['riyadh', '2026-10-19', 'no DST (control)'], ['london', '2026-06-10', 'ordinary summer week (control)']
    ];
    for (const [s, day, what] of DST) {
        const fam = FAMOUS[s]; const tz = fam.tz, lat = fam.lat, lng = fam.lng; const p = '/en' + HUB[s];
        const [y, m, d] = day.split('-').map(Number); const c0 = { y, m, d }; const T = exactNoon(y, m, d, tz);
        if (/^DST/.test(what)) {
            // the clock changes on this city date (switches at 00:00 / 24:00 included): the UTC offset differs between 21:00 the
            // evening before and 01:00 the morning after; the exact switch instant is printed
            const pv = addDays(c0, -1), nx = addDays(c0, 1), tA = localToUtc(pv.y, pv.m, pv.d, 21, 0, tz), oA = offMin(tA, tz), oB = offMin(localToUtc(nx.y, nx.m, nx.d, 1, 0, tz), tz);
            let sw = null; for (let t = tA; t < tA + 28 * 3600000 && !sw; t += 60000) if (offMin(t, tz) !== oA) sw = new Date(t).toISOString().slice(0, 16) + 'Z';
            ok('[2]', oA !== oB && !!sw, s + ' ' + day + ' is a clock-change day in ' + tz + ' (UTC offset ' + oA + ' -> ' + oB + ' min, switch at ' + sw + ')');
        }
        const dates = []; for (let i = 0; i < 14; i++) dates.push(addDays(c0, i));
        const fc = MoonCalc.getForecast(new Date(T), lat, lng, 14, tz);
        const shifted = fc.map((r, i) => (sameDay(cityDate(r.dayStart.getTime(), tz), dates[i]) ? -1 : i)).filter((i) => i >= 0);
        const RB = await load(PORT.base, p, T, 'Asia/Riyadh', '', "document.querySelectorAll('#moon-forecast-body tr').length>=14"); const tb = await ev(TBL_JS);
        const RC = await load(PORT.cand, p, T, 'Asia/Riyadh', '', "document.querySelectorAll('#moon-forecast-body tr').length>=14"); const tc = await ev(TBL_JS);
        const eng = await ev(`(()=>{const L=${JSON.stringify(dates.map((c) => exactNoon(c.y, c.m, c.d, tz)))};return L.map(N=>{const r=MoonCalc.getMoonTimes(new Date(N),${lat},${lng},${JSON.stringify(tz)});return {rise:r.rise,set:r.set}})})()`);
        const tag = s + ' ' + day + ' (' + what + ', ' + tz + ')';
        if (tb.length !== 14 || tc.length !== 14) { ok('[2]', false, tag + ': 14 rows on both sides', tb.length + '/' + tc.length); continue; }
        const changed = []; for (let r = 0; r < 14; r++) if (tb[r].html !== tc[r].html) changed.push(r);
        ok('[2]', tc.every((r, i) => r.cells[0] === label(dates[i])) && tb.every((r, i) => r.cells[0] === tc[i].cells[0]), tag + ': 14 consecutive own city dates from ' + label(c0) + ' (BASE == CAND)');
        ok('[2]', tc.every((r, i) => r.cells[4] === eng[i].rise && r.cells[5] === eng[i].set), tag + ': CAND moonrise / moonset of every row == js/moon.js for that row\'s own date', JSON.stringify(tc.map((r, i) => [r.cells[0], r.cells[4], r.cells[5], eng[i]]).filter((x) => x[1] !== x[3].rise || x[2] !== x[3].set)).slice(0, 500));
        ok('[2]', tb.every((r, i) => JSON.stringify(r.cells.slice(0, 4)) === JSON.stringify(tc[i].cells.slice(0, 4)) && r.cls === tc[i].cls && r.aria === tc[i].aria), tag + ': date, Hijri, phase, illumination cells + today highlight identical BASE vs CAND');
        ok('[2]', changed.every((r) => shifted.includes(r)) && tb.every((r, i) => shifted.includes(i) || r.html === tc[i].html), tag + ': rows away from the clock change byte-identical to BASE (' + (14 - changed.length) + '/14; corrected rows ' + (changed.map((r) => tc[r].cells[0].replace(/ 20\d\d$/, '') + ' ' + tb[r].cells[4] + '/' + tb[r].cells[5] + ' -> ' + tc[r].cells[4] + '/' + tc[r].cells[5]).join('; ') || 'none') + ')', JSON.stringify({ shifted, changed }));
        ok('[2]', RC.uncaught.length === 0, tag + ': no uncaught exception on CAND', RC.uncaught.join(' | '));
        if (/control/.test(what)) ok('[2]', changed.length === 0 && shifted.length === 0, tag + ': whole table identical BASE vs CAND');
        summary.push(`   [2] ${tag.padEnd(58)} engine windows on another date: ${shifted.length ? shifted.join(',') : 'none'}; corrected rows ${changed.length}`);
    }
    // ------------------------------------------------------------ [5] JS error + smart pill on /moon
    console.log('\n-- [5] headless Chrome: /moon with a stored city');
    const CITY = {
        'hong-kong': { ar: 'هونغ كونغ', en: 'Hong Kong', lat: 22.3193, lng: 114.1694, cc: 'hk', country: 'Hong Kong' },
        macau: { ar: 'ماكاو', en: 'Macau', lat: 22.20056, lng: 113.54611, cc: 'mo', country: 'Macau' },
        london: { ar: 'لندن', en: 'London', lat: 51.5074, lng: -0.1278, cc: 'gb', country: 'United Kingdom' },
        riyadh: { ar: 'الرياض', en: 'Riyadh', lat: 24.7136, lng: 46.6753, cc: 'sa', country: 'Saudi Arabia' }
    };
    const storeJs = (slug, store) => {
        const c = CITY[slug];
        if (store === 'lsb+cc') { const o = { arCity: c.ar, lat: c.lat, lng: c.lng, enName: c.en, country: c.country, names: { ar: c.ar, en: c.en }, countryCode: c.cc, ts: '__TS__' }; return "localStorage.setItem('lsb_detected', " + JSON.stringify(JSON.stringify(o)).replace('\\"__TS__\\"', '"+Date.now()+"') + ');'; }
        const o = { name: c.ar, englishName: c.en, lat: c.lat, lng: c.lng }; if (store === 'ctx+cc') o.countryCode = c.cc.toUpperCase();
        return "sessionStorage.setItem('last_city_context', " + JSON.stringify(JSON.stringify(o)) + ');';
    };
    const PILL_JS = "(()=>{const p=document.getElementById('moon-hub-smart-pill');if(!p)return null;const q=(s)=>{const e=p.querySelector(s);return e?e.textContent:null};return {hidden:p.hidden,visible:p.classList.contains('is-visible'),rendered:!!(p.offsetWidth||p.offsetHeight),href:p.getAttribute('href'),city:q('.mhsp-city')}})()";
    let nPill = 0, baseErrN = 0; const pillBad = [], baseErr = []; const pillLog = [];
    for (const L of LANGS3) for (const slug of Object.keys(CITY)) for (const store of ['lsb+cc', 'ctx+cc', 'ctx-nocc']) {
        const T = Date.parse(T_SCAN);
        const RB = await load(PORT.base, lpOf(L) + '/moon', T, 'Asia/Riyadh', storeJs(slug, store)); const pb = await ev(PILL_JS);
        const RC = await load(PORT.cand, lpOf(L) + '/moon', T, 'Asia/Riyadh', storeJs(slug, store)); const pc = await ev(PILL_JS);
        const id = L + ' ' + slug + ' ' + store; const errs = [];
        if (csoErr(RC)) errs.push('COUNTRY_SLUG_OVERRIDES error on CAND');
        if (RC.uncaught.length) errs.push('uncaught ' + RC.uncaught.join('|'));
        if (csoErr(RB)) baseErrN++; else if (store !== 'ctx-nocc') baseErr.push(id);
        if (!(pc && pc.hidden === false && pc.visible && pc.rendered && pc.href && pc.href.startsWith(lpOf(L) + '/moon/'))) errs.push('pill not shown ' + JSON.stringify(pc));
        const ch = pc && pc.href ? await chain(PORT.cand, pc.href) : [];
        const direct = ch.length === 1 && ch[0].st === 200;
        if (!(ch.length && ch[ch.length - 1].st === 200)) errs.push('link chain ' + JSON.stringify(ch));
        if (store !== 'ctx-nocc' && !direct) errs.push('link not a direct 200 ' + JSON.stringify(ch));
        if (/\/moon\/(?:hong-kong|macau)\//.test(String(pc && pc.href))) errs.push('known-404 link ' + pc.href);
        if (pc && pc.city !== (L === 'ar' ? CITY[slug].ar : CITY[slug].en)) errs.push('city text ' + pc.city);
        if (L === 'en' || store === 'lsb+cc') pillLog.push(id + ' -> ' + (pc && pc.href) + ' [' + ch.map((x) => x.st).join('>') + '] (BASE pill ' + (pb && pb.visible ? 'shown ' + pb.href : 'hidden') + ', TDZ ' + csoErr(RB) + ')');
        if (errs.length) pillBad.push(id + ': ' + errs.join('; ')); else nPill++;
    }
    for (const x of pillLog) console.log('     ' + x);
    ok('[5]', pillBad.length === 0, nPill + '/36 CAND loads of /moon (ar, en, fr x London, Riyadh, Hong Kong, Macau x 3 stores): no COUNTRY_SLUG_OVERRIDES error, no uncaught exception, pill shown with the stored city, link ends in 200 (with a country code: a direct 200), never /moon/hong-kong|macau/', pillBad.slice(0, 6).join(' || '));
    ok('[5]', baseErr.length === 0, 'BASE (production) throws the COUNTRY_SLUG_OVERRIDES error on every load with a stored country code (defect reproduced; ' + baseErrN + '/36 loads in all)', baseErr.join(', '));
    const hosts = [...new Set(offsite.map((u) => { try { return new URL(u).host; } catch (_e) { return u; } }))];
    console.log('   off-127.0.0.1 requests attempted by the pages (unresolvable: host-resolver MAP * ~NOTFOUND + dead proxy; ads blocked): ' + (hosts.join(', ') || 'none'));
    if (cd) cd.close();
} finally {
    for (const k of [kB, kC]) { try { if (k && k.exitCode === null) k.kill(); } catch (_) { /* gone */ } }
    if (chrome) { try { chrome.kill(); } catch (_) { /* gone */ } }
}
console.log('\n-- summary');
for (const s of summary) console.log(s);
console.log('\n-- per point: ' + Object.entries(G).map(([g, v]) => g + ' ' + v.p + '/' + (v.p + v.f)).join('  '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
