// TODAY-PAGES-ACCURACY-1 — TEMPORARY moon-zone exemption for al-quneitra (sy) and sokhumi (ge), owner decision 2026-10-19
//   on #13. Local regression guard, no network: outbound guard on both servers, every non-loopback host unresolvable in
//   Chrome, ad / analytics URLs blocked, ADSENSE_CLIENT=off.
//   Background: 891a2f8 moved the moon city pages from the COUNTRY zone to the city's own zone (`_ssrMoonCityIana` ->
//   `_ssrCityIana`). For two curated cities that carried a doubtful REGISTERED zone to the moon pages (al-quneitra
//   Asia/Damascus -> Asia/Jerusalem, sokhumi Asia/Tbilisi -> Europe/Moscow). The owner chose to keep their moon pages
//   exactly as on production (2db11f5) until the right zone is decided; NOT an endorsement of that previous zone.
//   Fix: `_ssrMoonCityIana` returns the country zone (BASE's expression) for the EXACT curated slug + country code
//   sy/al-quneitra and ge/sokhumi, before anything else; every other input behaves as before the exemption.
//   BASE = clean production tree (env TP_BASE_ROOT), CAND = this tree, PREV = the branch commit just before the exemption
//   (env TP_PREV_REF, source only via `git show`). Both servers read the SAME test clock (TEST-ONLY preload written to a
//   temp dir by this script, never in the repo, inert unless TP_SMOKE_CLOCK_FILE is set).
//   [S] source: the exemption line + its comment, only in _ssrMoonCityIana; the two curated records; _ssrCityIana (prayer
//       resolver), js/moon.js, umm-al-qura.json, curated-places.json untouched; CRLF kept.
//   [U] `_ssrMoonCityIana` of PREV vs CAND with the same injected dependencies over every curated slug, every db/cities
//       entry, every curated slug under 7 other country codes and a list of namesakes / spelling / case variants: the
//       output differs for exactly the two (slug, cc) keys and nowhere else.
//   [H] raw SSR BASE vs CAND at two instants where the registered and the country zone give DIFFERENT local dates: the
//       two cities x 10 languages x (hub, month 2026/10, month 2026/11, year 2026) byte-identical after normalisation; the
//       only raw difference is the build identity (app.js?v / b=sha); namesakes (quneitra sy, kenitra ma = «القنيطرة»,
//       sukhothai, suehbaatar) identical; redirects / 404s of slug variants unchanged; their prayer pages unchanged; the
//       other zone fixes still apply (Seattle, Riga, Jayapura meta; Auckland JSON-LD at its own noon).
//   [B] headless Chrome: the exempt pages' post-JS card, zone note and 14-day table BASE == CAND (en + ar), on the
//       country zone's date; Seattle and Jayapura still == the engine with the city's own zone.
//   node scripts/_smoke_today_pages_tz_exempt_1.mjs   (env TP_BASE_ROOT, TP_PREV_REF, TP_GUARD, TP_SMOKE_PORT, TP_CHROME)
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
const PREV_REF = process.env.TP_PREV_REF || '8e33170';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = process.env.TP_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const P0 = Number(process.env.TP_SMOKE_PORT || 9750);
const PORT = { base: P0, cand: P0 + 1, cdp: P0 + 9 };
const AD_BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*', '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*gstatic.com/ads*'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const lp = (L) => (L === 'ar' ? '' : '/' + L);
const EXEMPT = [
    { slug: 'al-quneitra', cc: 'sy', country: 'syria', registered: 'Asia/Jerusalem', primary: 'Asia/Damascus' },
    { slug: 'sokhumi', cc: 'ge', country: 'georgia', registered: 'Europe/Moscow', primary: 'Asia/Tbilisi' }];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity', 'user-agent': 'Mozilla/5.0 smoke' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, h: {}, b: '' })); r.setTimeout(60000, () => r.destroy()); r.end();
});
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + String(d).slice(0, 1200) : '')); } };
// per-request noise only (nonce, request-time stamps, live clock / countdown)
const noiseReq = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN');
// + the build identity, the ONLY expected difference between two trees on these pages
const build = (s) => s.replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA').replace(/js\/app\.js\?v=\d+/g, 'js/app.js?v=N');
const noise = (s) => build(noiseReq(s));
const firstDiff = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i >= a.length && a.length === b.length ? '' : '@' + i + ' A…' + a.slice(Math.max(0, i - 120), i + 160) + '…  B…' + b.slice(Math.max(0, i - 120), i + 160) + '…'; };
const diffLines = (a, b) => { const A = a.split('\n'), B = b.split('\n'); if (A.length !== B.length) return null; const out = []; for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) out.push([A[i], B[i]]); return out; };
const META_RE = /<meta name="moon\.city\.tz" content="([^"]*)">/;
const metaOf = (h) => { const m = h.match(META_RE); return m ? m[1] : null; };
const dropMeta = (h) => h.replace(/\r?\n[ \t]*<meta name="moon\.city\.tz" content="[^"]*">/, '');
const setMeta = (h, v) => h.replace(META_RE, () => '<meta name="moon.city.tz" content="' + v + '">');
const geoOf = (h) => { const m = h.match(/<meta name="geo\.position" content="(-?[\d.]+);(-?[\d.]+)"/); return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null; };
const ARTICLE_RE = /<script id="ssr-moon-article-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/;
const articleIllum = (h) => { const a = (h.match(ARTICLE_RE) || [])[1] || ''; const m = a.match(/(\d{1,3}\.\d{2})\s?[%٪]/); return m ? Number(m[1]) : null; };
const appV = (h) => (h.match(/js\/app\.js\?v=(\d+)/) || [])[1] || null;
// ---------------------------------------------------------------- time helpers (Intl, independent of the page code)
const FMT = new Map();
const fmtFor = (tz) => { if (!FMT.has(tz)) FMT.set(tz, new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })); return FMT.get(tz); };
const partsAt = (ms, tz) => { const o = {}; for (const p of fmtFor(tz).formatToParts(new Date(ms))) if (p.type !== 'literal') o[p.type] = Number(p.value); return o; };
const offMin = (ms, tz) => { const p = partsAt(ms, tz); return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000) / 60000); };
const exactNoon = (y, m, d, tz) => { const naive = Date.UTC(y, m - 1, d, 12); let t = naive - offMin(naive, tz) * 60000; t = naive - offMin(t, tz) * 60000; return t; };
const cityDate = (ms, tz) => { const p = partsAt(ms, tz); return { y: p.year, m: p.month, d: p.day }; };
const ymd = (ms, tz) => { const c = cityDate(ms, tz); return c.y + '-' + String(c.m).padStart(2, '0') + '-' + String(c.d).padStart(2, '0'); };
const hm = (ms, tz) => { const p = partsAt(ms, tz); return String(p.hour).padStart(2, '0') + ':' + String(p.minute).padStart(2, '0'); };
const EN_WD = (ms, tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long' }).format(new Date(ms));
const EN_MO = (m) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1];
const dateLabel = (ms, tz) => { const c = cityDate(ms, tz); return EN_WD(ms, tz) + ' ' + c.d + ' ' + EN_MO(c.m) + ' ' + c.y; };
const MoonCalc = require(path.join(ROOT, 'js/moon.js'));
// ---------------------------------------------------------------- source helpers
const srvB = fs.readFileSync(path.join(BASE_ROOT, 'server.js'), 'utf8'), srvC = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const appC = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
let srvP = '';
try { srvP = execFileSync('git', ['-C', ROOT, 'show', PREV_REF + ':server.js'], { encoding: 'utf8', maxBuffer: 1 << 28 }); } catch (_e) { srvP = ''; }
const grabFn = (src, name) => { const a = src.indexOf('function ' + name + '('); if (a < 0) return ''; let i = src.indexOf('{', a), dep = 0; for (; i < src.length; i++) { if (src[i] === '{') dep++; else if (src[i] === '}') { dep--; if (!dep) break; } } return src.slice(a, i + 1); };
const grabObj = (src, decl) => { const a = src.indexOf(decl); let i = src.indexOf('{', a), dep = 0; for (; i < src.length; i++) { if (src[i] === '{') dep++; else if (src[i] === '}') { dep--; if (!dep) break; } } return new Function('return ' + src.slice(src.indexOf('{', a), i + 1))(); };
const PRIMARY = grabObj(srvC, 'const _CC_TO_PRIMARY_TZ = {');
const CUR = (() => { const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'db/places/curated-places.json'), 'utf8')); return Array.isArray(j) ? j : (j.places || []); })();
const codeOnly = (s) => s.split(/\r?\n/).map((l) => l.replace(/^\s*\/\/.*$/, '').replace(/\s\/\/ .*$/, '')).join('\n');
// ---------------------------------------------------------------- [S]
console.log('-- [S] source');
const EX_LINE = "    if ((slug === 'al-quneitra' && cc === 'sy') || (slug === 'sokhumi' && cc === 'ge')) return _countryZone();   // TEMPORARY, see above";
const CZ_LINE = "    const _countryZone = () => (typeof _CC_TO_PRIMARY_TZ !== 'undefined') ? (_CC_TO_PRIMARY_TZ[cc] || null) : null;";
const fMC = grabFn(srvC, '_ssrMoonCityIana').replace(/\r/g, ''), fMP = grabFn(srvP, '_ssrMoonCityIana').replace(/\r/g, '');
ok(!!srvP && !!fMP && !fMP.includes('al-quneitra'), '[S] PREV (' + PREV_REF + ') source read via git; its _ssrMoonCityIana has no exemption');
{
    const L = fMC.split('\n');
    ok(L[1] === CZ_LINE && L[2] === EX_LINE, '[S] _ssrMoonCityIana starts with the exemption: exact slug + country code sy/al-quneitra, ge/sokhumi -> _countryZone() (BASE\'s _CC_TO_PRIMARY_TZ[cc] || null)', L.slice(0, 3).join(' / '));
    ok(srvC.split(EX_LINE.trim()).length === 2, '[S] the exemption line exists once in server.js');
    // the rest of the function = PREV's, with the collision fallback now spelled _countryZone() (same expression)
    const rest = [L[0]].concat(L.slice(3)).join('\n');
    const prevNorm = fMP.replace("if (_cur && !_samePlace(_cur)) return (typeof _CC_TO_PRIMARY_TZ !== 'undefined') ? (_CC_TO_PRIMARY_TZ[cc] || null) : null;", 'if (_cur && !_samePlace(_cur)) return _countryZone();');
    ok(!!fMP && rest === prevNorm, '[S] everything else in _ssrMoonCityIana is PREV\'s (collision test + _ssrCityIana), the collision fallback only re-spelled as _countryZone()', firstDiff(rest, prevNorm));
    const at = srvC.indexOf('function _ssrMoonCityIana('), cm = srvC.slice(srvC.lastIndexOf('\n\r\n', at), at).replace(/\r/g, '');
    const need = ['TEMPORARY EXEMPTION', 'owner decision 2026-10-19 on #13', 'remove once their zone is decided', 'EXACT curated slug + country code, never on a name', 'sy/al-quneitra', 'ge/sokhumi', 'NOT an endorsement', 'stay open', 'Namesakes are deliberately not matched'];
    ok(need.every((w) => cm.includes(w)), '[S] the comment above it says: temporary, why, exact key, not an endorsement, data review stays open', need.filter((w) => !cm.includes(w)).join(' | '));
}
{
    const lits = (s) => (codeOnly(s).match(/'(?:al-quneitra|sokhumi)'/g) || []).length;
    ok(lits(srvC) === 2 && lits(srvB) === 0, '[S] server.js code mentions the two slugs only on the exemption line (BASE: none)');
    ok(!/al-quneitra|sokhumi/.test(appC), '[S] js/app.js has no exemption of its own: the client computes with <meta name="moon.city.tz">, which the server fills from _ssrMoonCityIana');
    const callM = "const _moonTz = _moonDiscoveredTz || (_moonCc ? (_ssrMoonCityIana(citySlug, _moonCc, cityGeo.lat, cityGeo.lng) || null) : null);";
    const callY = "|| (_ycDisc && _ycDisc.timezone) || (_ssrMoonCityIana(_yc.citySlug, _yc.cc, _ycLat, _ycLng) || null);";
    ok(srvC.split(callM).length === 2 && srvC.split(callY).length === 2 && (codeOnly(srvC).match(/_ssrMoonCityIana\(/g) || []).length === 3, '[S] _ssrMoonCityIana is the one helper behind both moon-zone call sites (hub / month meta, year page last tier), called nowhere else');
    ok(grabFn(srvC, '_ssrCityIana') === grabFn(srvB, '_ssrCityIana') && !!grabFn(srvB, '_ssrCityIana'), '[S] _ssrCityIana (prayer-city resolver) byte-identical to BASE: prayer pages keep the registered zone');
}
{
    for (const E of EXEMPT) {
        const recs = CUR.filter((p) => p.slug === E.slug);
        ok(recs.length === 1 && String(recs[0].countryCode).toLowerCase() === E.cc && recs[0].timezone === E.registered && PRIMARY[E.cc] === E.primary, '[S] curated ' + E.slug + ': one record, cc ' + E.cc + ', registered ' + E.registered + '; country zone ' + PRIMARY[E.cc], JSON.stringify(recs.map((r) => [r.countryCode, r.timezone])));
    }
    for (const f of ['js/moon.js', 'db/hijri/umm-al-qura.json', 'db/places/curated-places.json']) ok(fs.readFileSync(path.join(BASE_ROOT, f)).equals(fs.readFileSync(path.join(ROOT, f))), '[S] ' + f + ' untouched (byte-identical to BASE)');
    ok((srvC.match(/\r\n/g) || []).length === (srvC.match(/\n/g) || []).length, '[S] CAND server.js keeps CRLF line endings throughout');
}
// ---------------------------------------------------------------- [U]
console.log('-- [U] _ssrMoonCityIana PREV vs CAND, same injected dependencies');
{
    const bySlug = new Map(CUR.map((p) => [p.slug, p]));
    const deps = [(s) => bySlug.get(s) || null, (s, c, la, ln) => 'RESOLVER(' + s + '|' + c + ')', PRIMARY];
    const mk = (src) => new Function('_findPlaceBySlug', '_ssrCityIana', '_CC_TO_PRIMARY_TZ', grabFn(src, '_ssrMoonCityIana') + '\nreturn _ssrMoonCityIana;')(...deps);
    const fP = mk(srvP), fC = mk(srvC);
    const slugify = (s) => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const inputs = new Map(); const add = (s, c, la, ln) => { const k = s + '|' + c + '|' + la + '|' + ln; if (!inputs.has(k)) inputs.set(k, [s, c, la, ln]); };
    for (const p of CUR) { const c = String(p.countryCode || '').toLowerCase(); add(p.slug, c, p.lat, p.lng); for (const o of ['sy', 'ge', 'ma', 'il', 'ru', 'lb', 'th']) if (o !== c) add(p.slug, o, p.lat, p.lng); }
    let dbN = 0;
    for (const f of fs.readdirSync(path.join(ROOT, 'db')).filter((x) => /^cities-[a-z]{2}\.json$/.test(x))) {
        const c = f.slice(7, 9); let arr = []; try { const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'db', f), 'utf8')); arr = Array.isArray(j) ? j : (j.cities || []); } catch (_e) { arr = []; }
        for (const r of arr) { const s = slugify(r.nameEn || r.name); if (s) { add(s, c, r.lat, r.lng); dbN++; } }
    }
    const NAMESAKES = [['quneitra', 'sy'], ['quneitra', 'il'], ['kenitra', 'ma'], ['al-quneitra', 'ma'], ['al-quneitra', 'il'], ['al-quneitra', 'lb'], ['al-quneitra', 'jo'], ['al-qunaytirah', 'sy'], ['al-qunaitra', 'sy'], ['qunaytirah', 'sy'], ['kuneytire', 'sy'], ['al-kuneitra', 'sy'], ['quneitra-governorate', 'sy'], ['rabat-sale-kenitra', 'ma'],
        ['sokhumi', 'ru'], ['sokhumi', 'ab'], ['sokhumi', 'tr'], ['sukhumi', 'ge'], ['sukhumi', 'ru'], ['sokhum', 'ge'], ['sukhum', 'ge'], ['suhumi', 'ge'], ['sochumi', 'ge'], ['sukhothai', 'th'], ['suehbaatar', 'mn'],
        ['Al-Quneitra', 'sy'], ['AL-QUNEITRA', 'sy'], ['al-quneitra', 'SY'], ['al-quneitra ', 'sy'], ['al_quneitra', 'sy'], ['alquneitra', 'sy'], ['al-quneitra-sy', 'sy'], ['Sokhumi', 'ge'], ['sokhumi', 'GE'], ['sokhumi ', 'ge'], ['', 'sy'], ['', 'ge'], [null, 'sy'], [undefined, 'ge'], ['al-quneitra', ''], ['sokhumi', null]];
    for (const [s, c] of NAMESAKES) { add(s, c, 33.12, 35.82); add(s, c, 43.0, 40.99); add(s, c, NaN, NaN); }
    for (const E of EXEMPT) { add(E.slug, E.cc, 34.261, -6.5802); add(E.slug, E.cc, NaN, NaN); }   // the exact key at other coordinates is still the same city id
    const diff = [], err = [];
    for (const [k, a] of inputs) { let p, c; try { p = fP(...a); c = fC(...a); } catch (e) { err.push(k + ' ' + e.message); continue; } if (p !== c) diff.push({ k, a, p, c }); }
    const keys = [...new Set(diff.map((d) => d.a[0] + '|' + d.a[1]))].sort();
    console.log(`   ${inputs.size} distinct inputs (${CUR.length} curated slugs x own + 7 other country codes, ${dbN} db/cities entries, ${NAMESAKES.length} namesake / variant keys at 3 positions); outputs differing PREV vs CAND: ${diff.length}, keys ${keys.join(', ')}`);
    ok(err.length === 0, '[U] no input throws (PREV or CAND)', err.slice(0, 3).join(' ; '));
    ok(keys.join(',') === 'al-quneitra|sy,sokhumi|ge', '[U] the output changes for exactly two (slug, cc) keys: al-quneitra|sy and sokhumi|ge', keys.join(','));
    for (const E of EXEMPT) {
        const ds = diff.filter((d) => d.a[0] === E.slug && d.a[1] === E.cc), all = [...inputs.values()].filter((a) => a[0] === E.slug && a[1] === E.cc);
        // CAND: the country zone at EVERY position of the exact key; PREV: the city resolver wherever the curated record is
        // the same place (elsewhere PREV's collision guard already gave the country zone, so nothing changes there)
        ok(all.length >= 3 && all.every((a) => fC(...a) === E.primary) && ds.length >= 2 && ds.every((d) => d.c === E.primary && d.p === 'RESOLVER(' + E.slug + '|' + E.cc + ')'), '[U] ' + E.cc + '/' + E.slug + ': CAND -> the country zone ' + E.primary + ' at all ' + all.length + ' positions (BASE behaviour); PREV -> the city resolver (registered ' + E.registered + ') at the ' + ds.length + ' same-place positions', JSON.stringify(ds.slice(0, 3)));
    }
    const nsSame = NAMESAKES.filter(([s, c]) => !EXEMPT.some((E) => E.slug === s && E.cc === c));
    ok(nsSame.every(([s, c]) => [[33.12, 35.82], [43.0, 40.99], [NaN, NaN]].every(([la, ln]) => fP(s, c, la, ln) === fC(s, c, la, ln))), '[U] ' + nsSame.length + ' namesake / other-country / spelling / case variants (quneitra, kenitra, sukhumi, Al-Quneitra, sokhumi|ru, al-quneitra|SY ...): CAND == PREV');
}
// ---------------------------------------------------------------- servers + clock
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-tzx-'));
const CLOCK_JS = path.join(tmp, 'test-clock.cjs'), CLOCK_FILE = path.join(tmp, 'clock.txt');
fs.writeFileSync(CLOCK_JS, [
    "'use strict';",
    '// TEST-ONLY fake clock (written by scripts/_smoke_today_pages_tz_exempt_1.mjs into a temp dir; never in the repo).',
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
// instants where the registered and the country zone of each city are on DIFFERENT local dates
const T_A = '2026-10-19T20:30:00Z';   // sokhumi: 23:30 Moscow Oct 19 / 00:30 Tbilisi Oct 20 (al-quneitra: +3 both, same date)
const T_B = '2026-10-27T21:30:00Z';   // al-quneitra: 23:30 Jerusalem Oct 27 (IST) / 00:30 Damascus Oct 28; sokhumi likewise
const T_SCAN = '2026-10-18T19:05:00Z';
let kB = null, kC = null, chrome = null, cd = null;
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-tzx-chrome-'));
const summary = [];
try {
    fs.writeFileSync(CLOCK_FILE, String(Date.parse(T_SCAN)));
    for (const pt of [PORT.base, PORT.cand]) { if ((await get(pt, '/health')).st !== 0) throw new Error('port ' + pt + ' is already in use - set TP_SMOKE_PORT'); }
    kB = boot(BASE_ROOT, PORT.base); kC = boot(ROOT, PORT.cand);
    for (const pt of [PORT.base, PORT.cand]) { for (let t = 0; t < 400; t++) { if ((await get(pt, '/health')).st === 200) break; await sleep(250); } }
    await sleep(300);
    ok(kB.exitCode === null && kC.exitCode === null, 'both servers are this run\'s own processes (alive after /health)');
    // ------------------------------------------------------------ [H] exempt pages
    console.log('\n-- [H] the two exempt cities: raw SSR BASE vs CAND, 10 languages');
    for (const T of [T_A, T_B]) {
        const t = Date.parse(T);
        for (const E of EXEMPT) console.log(`   ${T}: ${E.slug} registered ${E.registered} ${ymd(t, E.registered)} ${hm(t, E.registered)} | country ${E.primary} ${ymd(t, E.primary)} ${hm(t, E.primary)}`);
    }
    // sokhumi: Moscow +3 / Tbilisi +4 all year -> different dates 20:00-21:00Z (T_A); al-quneitra: Jerusalem = Damascus = +3
    // until 2026-10-25, then +2 / +3 -> different dates 21:00-22:00Z (T_B). At the other instant the hour still differs.
    ok(ymd(Date.parse(T_A), 'Europe/Moscow') !== ymd(Date.parse(T_A), 'Asia/Tbilisi') && ymd(Date.parse(T_B), 'Asia/Jerusalem') !== ymd(Date.parse(T_B), 'Asia/Damascus') && offMin(Date.parse(T_B), 'Europe/Moscow') !== offMin(Date.parse(T_B), 'Asia/Tbilisi'), '[H] the test instants discriminate: sokhumi at ' + T_A + ' and al-quneitra at ' + T_B + ' fall on different local dates in the registered vs the country zone (a page on the registered zone could not match BASE)');
    {
        const jobs = [];
        for (const T of [T_A, T_B]) for (const E of EXEMPT) for (const L of LANGS) for (const [kind, suf] of [['hub', ''], ['month', '/2026/10'], ['month', '/2026/11'], ['year', '/2026']]) jobs.push({ T, E, L, kind, p: lp(L) + '/moon/' + E.country + '/' + E.slug + suf });
        const bad = [], vPairs = new Set(), diffKinds = new Set(); let n = 0, rawSame = 0;
        let curT = null;
        for (const j of jobs) {
            if (j.T !== curT) { await setClock(j.T); curT = j.T; }
            const [b, c] = await Promise.all([get(PORT.base, j.p), get(PORT.cand, j.p)]);
            n++;
            const wantMeta = j.kind === 'year' ? null : j.E.primary;
            const nb = noise(b.b), nc = noise(c.b);
            let why = '';
            if (b.st !== 200 || c.st !== 200) why = 'status ' + b.st + '/' + c.st;
            else if (metaOf(b.b) !== wantMeta || metaOf(c.b) !== wantMeta) why = 'meta ' + metaOf(b.b) + ' / ' + metaOf(c.b) + ' (want ' + wantMeta + ')';
            else if (nb !== nc) why = firstDiff(nb, nc);
            else {
                const dl = diffLines(noiseReq(b.b), noiseReq(c.b));
                if (!dl) why = 'line count differs';
                else if (!dl.length) rawSame++;
                else for (const [x, y] of dl) { if (build(x) !== build(y)) why = 'raw line ' + x.slice(0, 200) + ' | ' + y.slice(0, 200); diffKinds.add((/app\.js\?v=/.test(x) ? 'app.js?v' : '') + (/(?:[?&]|&amp;)b=[0-9a-f]/.test(x) ? '+b=sha' : '')); }
                vPairs.add(appV(b.b) + '->' + appV(c.b));
            }
            if (why) bad.push(j.T + ' ' + j.p + ' ' + why);
        }
        console.log(`   ${n} page pairs (2 instants x 2 cities x 10 languages x hub + month 2026/10 + month 2026/11 + year 2026); raw-identical ${rawSame}; build-identity lines that differ: ${[...diffKinds].join(', ') || 'none'}; app.js?v BASE->CAND ${[...vPairs].join(', ')}`);
        ok(bad.length === 0, '[H] all ' + n + ' exempt pages: 200 on both, meta = the country zone (hub / month; the year page prints none, as on BASE), byte-identical BASE vs CAND after normalisation', bad.slice(0, 4).join(' ; '));
        ok(diffKinds.size > 0 && [...diffKinds].every((k) => /^(app\.js\?v)?(\+b=sha)?$/.test(k) && k) && [...vPairs].every((v) => /^\d+->\d+$/.test(v)), '[H] the only raw differences are the build identity (app.js?v / b=sha); nothing else is normalised away', [...diffKinds].join(', '));
    }
    // ------------------------------------------------------------ [H] namesakes, routes, prayer pages
    console.log('\n-- [H] namesakes / slug variants / prayer pages, BASE vs CAND at ' + T_B);
    await setClock(T_B);
    {
        const NS = [['/moon/syria/quneitra', 'db/cities-sy «القنيطرة» Quneitra (noindex)'], ['/moon/syria/quneitra/2026/10', ''], ['/moon/morocco/kenitra', 'curated kenitra, Arabic name «القنيطرة»'], ['/moon/morocco/kenitra/2026/10', ''], ['/moon/thailand/sukhothai', 'curated, Sukh- spelling'], ['/moon/mongolia/suehbaatar', 'curated, alias Sukhbaatar']];
        const bad = [], log = [];
        for (const [p0, note] of NS) for (const L of ['en', 'ar']) {
            const p = lp(L) + p0, b = await get(PORT.base, p), c = await get(PORT.cand, p);
            if (L === 'en') log.push(p0 + ' ' + b.st + ' meta ' + metaOf(b.b) + ' / ' + metaOf(c.b) + (note ? ' (' + note + ')' : ''));
            if (!(b.st === 200 && c.st === 200 && metaOf(c.b) && metaOf(b.b) === metaOf(c.b) && noise(b.b) === noise(c.b))) bad.push(p + ' ' + b.st + '/' + c.st + ' ' + metaOf(b.b) + '/' + metaOf(c.b) + ' ' + firstDiff(noise(b.b), noise(c.b)).slice(0, 300));
        }
        for (const l of log) console.log('   ' + l);
        ok(bad.length === 0, '[H] same / similar names (quneitra sy, kenitra ma, sukhothai, suehbaatar; hub + month, en + ar): 200, same meta, byte-identical BASE vs CAND (not exempt: see [U])', bad.join(' ; '));
        const RT = ['/en/moon-in-al-quneitra', '/moon-in-sokhumi', '/en/moon/morocco/al-quneitra', '/en/moon/russia/sokhumi', '/en/moon/israel/al-quneitra', '/en/moon/georgia/sukhumi', '/en/moon-in-sukhumi', '/en/moon/syria/al-qunaytirah', '/en/moon/abkhazia/sokhumi', '/en/moon-in-quneitra', '/en/moon-in-kenitra'];
        const rBad = [], rLog = [];
        for (const p of RT) {
            const b = await get(PORT.base, p), c = await get(PORT.cand, p);
            const lb = String(b.h.location || '').replace(/^https?:\/\/[^/]+/, ''), lc = String(c.h.location || '').replace(/^https?:\/\/[^/]+/, '');
            rLog.push(p + ' ' + b.st + (lb ? ' -> ' + lb : ''));
            if (!(b.st === c.st && lb === lc && [200, 301, 404, 410].includes(b.st) && noise(b.b) === noise(c.b))) rBad.push(p + ' ' + b.st + '/' + c.st + ' ' + lb + ' | ' + lc);
        }
        console.log('   ' + rLog.join(' | '));
        ok(rBad.length === 0, '[H] ' + RT.length + ' redirects / 404s around the two slugs: same status, same Location, same body BASE vs CAND', rBad.join(' ; '));
        const PR = ['/en/prayer-times-in-al-quneitra', '/prayer-times-in-al-quneitra', '/en/prayer-times-in-sokhumi', '/prayer-times-in-sokhumi'];
        const pBad = [], pLog = [];
        for (const p of PR) {
            let b = await get(PORT.base, p), c = await get(PORT.cand, p);
            if (noise(b.b) !== noise(c.b)) { await sleep(1200); b = await get(PORT.base, p); c = await get(PORT.cand, p); }
            const zones = [...new Set((c.b.match(/(?:Asia|Europe)\/(?:Jerusalem|Damascus|Moscow|Tbilisi)/g) || []))].join(',');
            pLog.push(p + ' ' + c.st + ' zones in HTML: ' + (zones || 'none'));
            if (!(b.st === 200 && c.st === 200 && noise(b.b) === noise(c.b))) pBad.push(p + ' ' + b.st + '/' + c.st + ' ' + firstDiff(noise(b.b), noise(c.b)).slice(0, 300));
        }
        for (const l of pLog) console.log('   ' + l);
        ok(pBad.length === 0, '[H] prayer pages of the two cities identical BASE vs CAND (the exemption is moon-only; prayer-vs-moon consistency stays an open data item)', pBad.join(' ; '));
    }
    // ------------------------------------------------------------ [H] the other zone fixes still apply
    console.log('\n-- [H] the other moon-zone fixes still apply, at ' + T_SCAN);
    await setClock(T_SCAN);
    {
        const tS = Date.parse(T_SCAN);
        for (const [p, bm, cm, kind] of [['/en/moon/united-states/seattle', 'America/New_York', 'America/Los_Angeles', 'zone'], ['/moon/united-states/seattle', 'America/New_York', 'America/Los_Angeles', 'zone'], ['/en/moon/indonesia/jayapura', 'Asia/Jakarta', 'Asia/Jayapura', 'zone'], ['/en/moon/latvia/riga', null, 'Europe/Riga', 'added'], ['/en/moon/united-states/seattle/2026/10', 'America/New_York', 'America/Los_Angeles', 'zone']]) {
            const b = await get(PORT.base, p), c = await get(PORT.cand, p);
            const same = kind === 'zone' ? noise(setMeta(b.b, cm)) === noise(c.b) : noise(dropMeta(c.b)) === noise(b.b);
            const looseOk = kind === 'zone' && !same && (() => { const dl = diffLines(noise(setMeta(b.b, cm)), noise(c.b)); return !!dl && dl.every(([x, y]) => /moon-stat-value|moon-hub-cal|moon-city-hub-edu-link|moon-hub-related|ssr-moon-article-schema|FAQPage|"@type":"Question"/.test(x + y)); })();
            ok(b.st === 200 && c.st === 200 && metaOf(b.b) === bm && metaOf(c.b) === cm && (same || looseOk), '[H] ' + p + ': meta ' + bm + ' -> ' + cm + (same ? ', nothing else differs' : ', plus only the month / link values that follow the zone'), firstDiff(noise(setMeta(b.b, cm)), noise(c.b)));
        }
        const ak = '/en/moon/new-zealand/auckland', b = await get(PORT.base, ak), c = await get(PORT.cand, ak);
        const cd0 = cityDate(tS, 'Pacific/Auckland'), noonC = exactNoon(cd0.y, cd0.m, cd0.d, 'Pacific/Auckland'), nx = new Date(Date.UTC(cd0.y, cd0.m - 1, cd0.d + 1)), noonN = exactNoon(nx.getUTCFullYear(), nx.getUTCMonth() + 1, nx.getUTCDate(), 'Pacific/Auckland');
        const wantC = MoonCalc.getMoonIllumination(new Date(noonC)), wantB = MoonCalc.getMoonIllumination(new Date(noonN));
        console.log(`   auckland JSON-LD illumination BASE ${articleIllum(b.b)}% CAND ${articleIllum(c.b)}% (engine: Auckland noon ${cd0.d} Oct ${wantC}%, next day ${wantB}%)`);
        ok(metaOf(c.b) === 'Pacific/Auckland' && articleIllum(c.b) === wantC && articleIllum(b.b) === wantB && wantC !== wantB, '[H] Auckland (UTC+13): CAND JSON-LD = the engine at today\'s Auckland noon, BASE = tomorrow\'s (noon fix still applies)');
        const oc = '/en/moon/united-states/orlando', ob = await get(PORT.base, oc), occ = await get(PORT.cand, oc);
        ok(metaOf(ob.b) === 'America/New_York' && metaOf(occ.b) === 'America/New_York' && noise(ob.b) === noise(occ.b), '[H] slug collision orlando keeps BASE (decision #14 not done), byte-identical');
        void tS;
    }
    // ------------------------------------------------------------ [B]
    console.log('\n-- [B] headless Chrome: post-JS card');
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
        return { got: await ev(READ_JS), uncaught: uncaught.slice() };
    };
    const F = ['phase', 'illum', 'age', 'rise', 'set'];
    const show = (g) => g ? `${g.row0} | ${g.phase} | ${g.illum} | ${g.age} | rise ${g.rise} | set ${g.set} | meta ${g.meta}` : 'null';
    // exempt pages: the card must be exactly BASE's (country zone), on the country zone's date
    for (const [T, E, L] of [[T_B, EXEMPT[0], 'en'], [T_B, EXEMPT[0], 'ar'], [T_A, EXEMPT[1], 'en'], [T_B, EXEMPT[1], 'ar'], [T_B, EXEMPT[1], 'en']]) {
        const p = lp(L) + '/moon/' + E.country + '/' + E.slug, tMs = Date.parse(T);
        const B = await load(PORT.base, p, T, 'Asia/Riyadh'), C = await load(PORT.cand, p, T, 'Asia/Riyadh');
        const rc = await get(PORT.cand, p);
        console.log(`   · ${p} at ${T} (country ${E.primary} ${ymd(tMs, E.primary)}, registered ${E.registered} ${ymd(tMs, E.registered)})`);
        console.log(`       BASE: ${show(B.got)}`);
        console.log(`       CAND: ${show(C.got)}`);
        const bg = B.got, g = C.got;
        ok(bg && g && F.every((k) => bg[k] === g[k]) && bg.row0 === g.row0 && bg.todayRow === g.todayRow && bg.tzNote === g.tzNote && bg.fcHtml === g.fcHtml && bg.meta === g.meta && bg.hijriGreg === g.hijriGreg, '[B] ' + p + ': BASE == CAND (card, zone note, Hijri card and the whole 14-day table)', firstDiff(String(bg && bg.fcHtml), String(g && g.fcHtml)));
        ok(g && g.meta === E.primary && g.tzNote.includes('(' + E.primary + ')') && (L !== 'en' || (g.row0 === dateLabel(tMs, E.primary) && g.todayRow === dateLabel(tMs, E.primary))), '[B] ' + p + ': card on the country zone ' + E.primary + (L === 'en' ? ' (today row ' + dateLabel(tMs, E.primary) + (ymd(tMs, E.primary) !== ymd(tMs, E.registered) ? ', not the registered zone\'s ' + dateLabel(tMs, E.registered) : '') + ')' : ''), JSON.stringify(g && { ...g, fcHtml: undefined }));
        ok(JSON.stringify(B.uncaught.slice().sort()) === JSON.stringify(C.uncaught.slice().sort()), '[B] same uncaught exceptions BASE / CAND (' + B.uncaught.length + ' / ' + C.uncaught.length + ')', B.uncaught.join(' | ') + ' vs ' + C.uncaught.join(' | '));
        const asNum = (x) => Number(String(x).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660)).replace('٫', '.').replace(/[%٪\s]/g, ''));
        summary.push(`   ${p} at ${T}: card ${g && g.illum} (meta ${g && g.meta}) vs server JSON-LD ${articleIllum(rc.b)}% — BASE behaviour kept (${g && asNum(g.illum) === articleIllum(rc.b) ? 'they agree' : 'pre-existing: SSR intro / JSON-LD / calendar read the registered zone, the card the meta'})`);
    }
    // the fix still applies in the browser next to the exemption
    for (const [T, p, tz] of [['2026-10-18T19:00:00Z', '/en/moon/united-states/seattle', 'America/Los_Angeles'], ['2026-10-18T15:30:00Z', '/en/moon/indonesia/jayapura', 'Asia/Jayapura']]) {
        const tMs = Date.parse(T); await setClock(T);
        const geo = geoOf((await get(PORT.cand, p)).b);
        const B = await load(PORT.base, p, T, 'Asia/Riyadh'), C = await load(PORT.cand, p, T, 'Asia/Riyadh');
        const want = cityDate(tMs, tz), noon = exactNoon(want.y, want.m, want.d, tz), label = dateLabel(tMs, tz);
        const exp = await ev(EXPECT_JS(noon, tz, geo.lat, geo.lng));
        const g = C.got;
        console.log(`   · ${p} at ${T}: engine (${tz}) ${label} | ${exp && exp.illum} | rise ${exp && exp.rise} | set ${exp && exp.set}`);
        console.log(`       BASE: ${show(B.got)}`);
        console.log(`       CAND: ${show(g)}`);
        ok(g && exp && F.every((k) => g[k] === exp[k]) && g.row0 === label && g.todayRow === label && g.meta === tz && g.tzNote.includes('(' + tz + ')'), '[B] ' + p + ': CAND card == engine with ' + tz + ' on ' + label + ' (zone fix still applies)', JSON.stringify({ got: g && { ...g, fcHtml: undefined }, exp }));
        ok(B.got && B.got.meta !== tz, '[B] ' + p + ': BASE still on the country zone (' + (B.got && B.got.meta) + ')');
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
