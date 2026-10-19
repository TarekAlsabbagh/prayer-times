// TODAY-PAGES-ACCURACY-1 — TEMPORARY moon-zone exemption, owner decisions 2026-10-19 on #13: al-quneitra (sy), sokhumi
//   (ge) and katzrin (sy). Local regression guard, no network: outbound guard on every server, every non-loopback host
//   unresolvable in Chrome (+ dead proxy), ad / analytics URLs blocked, ADSENSE_CLIENT=off, ports 9800-9849 only.
//   Background: 891a2f8 moved the moon city pages from the COUNTRY zone to the city's own zone (`_ssrMoonCityIana` ->
//   `_ssrCityIana`). Three cities would carry a doubtful zone to their moon pages: the curated al-quneitra (registered
//   Asia/Jerusalem) and sokhumi (registered Europe/Moscow), and the db/cities-sy entry katzrin (no zone of its own; its
//   coordinate zone Asia/Jerusalem passes `_ssrCityIana`'s country gate only because the al-quneitra record puts that zone
//   in Syria's trusted set). The owner chose to keep their moon pages exactly as on production (2db11f5) until the right
//   zone is decided; NOT an endorsement of the previous zone. Coverage = these three known, tested cities only; the data
//   of other discovered cities needs its own audit (this is not a general fix for them).
//   Fix: `_ssrMoonCityIana` returns the country zone (BASE's expression) for the EXACT slug + country code the moon route
//   resolved (sy/al-quneitra, ge/sokhumi, sy/katzrin), before anything else.
//   Servers (all with the guard + the SAME test clock: a TEST-ONLY preload written to a temp dir by this script, never in
//   the repo, inert unless TP_SMOKE_CLOCK_FILE is set):
//     BASE  = the clean production tree 2db11f5 (env TP_BASE_ROOT) — every comparison is against it, never a branch commit
//     CAND  = this tree (branch head)
//     PROBE = CAND + a TEST-ONLY compile hook that logs every _ssrMoonCityIana(slug, cc, lat, lng) call (output unchanged)
//     ABL   = CAND with ONLY the exemption line removed by the same TEST-ONLY hook (= the branch without the exemption):
//             shows which pages the exemption holds on production's zone, and that the tests can see the difference.
//   [S] source + data: the exemption line + its comment, only in _ssrMoonCityIana; _ssrCityIana, _ssrTrustedZonesFor and
//       _CC_TO_PRIMARY_TZ byte-identical to BASE; the three city records; js/moon.js, umm-al-qura.json,
//       curated-places.json untouched; CRLF kept.
//   [U] _ssrMoonCityIana CAND vs ABLATED (CAND source minus the exemption line) with the same injected dependencies over
//       every curated slug, every db/cities entry, curated slugs under 7 other country codes and namesake / spelling / case
//       keys: the output differs for exactly the three (slug, cc) keys; there CAND = BASE's `_CC_TO_PRIMARY_TZ[cc] || null`.
//   [R] route resolution (PROBE): every moon URL form x 10 languages of the three cities: which (slug, cc, lat, lng)
//       reaches _ssrMoonCityIana — 200 forms exactly once with the city id, redirects end on a 200 form of the same city,
//       410 / 404 forms never reach it.
//   [A] ABL vs CAND vs BASE on every 200 form: ABL carries the doubtful zone, CAND == BASE == the country zone.
//   [H] raw SSR BASE vs CAND, every form x 10 languages x 3 cities at 3 instants (status, Location, canonical, meta robots,
//       X-Robots-Tag, hreflang, HTML after normalisation: nonce, request stamps, live clocks, &b=, app.js?v); controls
//       (quneitra, damascus, tbilisi, Golan neighbours, kenitra, ...) BASE == CAND == ABL; prayer pages; other fixes.
//   [Z] every Syria / Georgia moon page reachable locally (FAMOUS + curated + db/cities-sy [+ db/cities-ge]; hub, year,
//       2 months, en): BASE vs CAND identical; ABL vs BASE zone differs for exactly the three cities (no further case).
//   [B] headless Chrome at several instants (local midnight, the Jerusalem DST end 2026-10-25 / start 2027-03-26, visitors
//       in 3 zones, en / ar / fr): post-JS date, phase, illumination, age, rise, set, 14-day table rows, zone line, meta,
//       Hijri card, month calendar, year page text BASE == CAND == js/moon.js with the country zone; ABL differs where the
//       zones fall on different dates; controls BASE == CAND; Seattle / Jayapura fix still applies.
//   node scripts/_smoke_today_pages_tz_exempt_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT (9800-9840), TP_CHROME)
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
const P0 = Number(process.env.TP_SMOKE_PORT || 9800);
if (!(P0 >= 9800 && P0 + 9 <= 9849)) throw new Error('TP_SMOKE_PORT must keep every port inside 9800-9849');
const PORT = { base: P0, cand: P0 + 1, probe: P0 + 2, abl: P0 + 3, cdp: P0 + 9 };
const AD_BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*', '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*gstatic.com/ads*'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const lp = (L) => (L === 'ar' ? '' : '/' + L);
const EXEMPT = [
    { slug: 'al-quneitra', cc: 'sy', country: 'syria', src: 'curated', other: 'Asia/Jerusalem', primary: 'Asia/Damascus', wrong: ['lebanon', 'israel'] },
    { slug: 'sokhumi', cc: 'ge', country: 'georgia', src: 'curated', other: 'Europe/Moscow', primary: 'Asia/Tbilisi', wrong: ['russia', 'abkhazia'] },
    { slug: 'katzrin', cc: 'sy', country: 'syria', src: 'db/cities-sy', other: 'Asia/Jerusalem', primary: 'Asia/Damascus', wrong: ['lebanon', 'israel'] }];
const EX_BY = Object.fromEntries(EXEMPT.map((E) => [E.slug, E]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity', 'user-agent': 'Mozilla/5.0 smoke' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, h: {}, b: '' })); r.setTimeout(60000, () => r.destroy()); r.end();
});
const locOf = (r) => String(r.h.location || '').replace(/^https?:\/\/[^/]+/, '');
let pass = 0, fail = 0; const G = {};
const ok = (g, c, n, d) => { G[g] = G[g] || { p: 0, f: 0 }; if (c) { pass++; G[g].p++; console.log('  ✓ ' + g + ' ' + n); } else { fail++; G[g].f++; console.log('  ✗ ' + g + ' ' + n + (d ? '  :: ' + String(d).slice(0, 1500) : '')); } };
// per-request noise only (nonce, request-time stamps, live clock / countdown)
const noiseReq = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN');
// + the build identity, the ONLY expected difference between the two trees on these pages
const build = (s) => s.replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA').replace(/js\/app\.js\?v=\d+/g, 'js/app.js?v=N');
const noise = (s) => build(noiseReq(s));
const firstDiff = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i >= a.length && a.length === b.length ? '' : '@' + i + ' A…' + a.slice(Math.max(0, i - 120), i + 160) + '…  B…' + b.slice(Math.max(0, i - 120), i + 160) + '…'; };
const diffLines = (a, b) => { const A = a.split('\n'), B = b.split('\n'); if (A.length !== B.length) return null; const out = []; for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) out.push([A[i], B[i]]); return out; };
const META_RE = /<meta name="moon\.city\.tz" content="([^"]*)">/;
const metaOf = (h) => { const m = h.match(META_RE); return m ? m[1] : null; };
const CHIP_RE = /<span class="my-chip-lbl">[^<]*<\/span> <b>((?:Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)\/[A-Za-z_+\/-]+)<\/b>/;
const chipOf = (h) => { const m = h.match(CHIP_RE); return m ? m[1] : null; };
const zoneOf = (h) => metaOf(h) || chipOf(h);     // hub / month: the head meta; year page: its "local time zone" chip
const dropMeta = (h) => h.replace(/\r?\n[ \t]*<meta name="moon\.city\.tz" content="[^"]*">/, '');
const setMeta = (h, v) => h.replace(META_RE, () => '<meta name="moon.city.tz" content="' + v + '">');
const geoOf = (h) => { const m = h.match(/<meta name="geo\.position" content="(-?[\d.]+);(-?[\d.]+)"/); return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null; };
const canonOf = (h) => (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const robotsOf = (h) => (h.match(/<meta name="robots" content="([^"]+)"/) || [])[1] || '';
const hreflangOf = (h) => [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => m[1] + '=' + m[2]).join(' ');
const headF = (r) => [r.st, locOf(r), canonOf(r.b), robotsOf(r.b), String(r.h['x-robots-tag'] || ''), hreflangOf(r.b)].join(' | ');
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
const grabFn = (src, name) => { const a = src.indexOf('function ' + name + '('); if (a < 0) return ''; let i = src.indexOf('{', a), dep = 0; for (; i < src.length; i++) { if (src[i] === '{') dep++; else if (src[i] === '}') { dep--; if (!dep) break; } } return src.slice(a, i + 1); };
const grabObj = (src, decl) => { const a = src.indexOf(decl); let i = src.indexOf('{', a), dep = 0; for (; i < src.length; i++) { if (src[i] === '{') dep++; else if (src[i] === '}') { dep--; if (!dep) break; } } return new Function('return ' + src.slice(src.indexOf('{', a), i + 1))(); };
const PRIMARY_B = grabObj(srvB, 'const _CC_TO_PRIMARY_TZ = {'), PRIMARY_C = grabObj(srvC, 'const _CC_TO_PRIMARY_TZ = {');
const FAMOUS_C = grabObj(srvC, 'const FAMOUS_CITY_OVERRIDES = {');
const CUR = (() => { const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'db/places/curated-places.json'), 'utf8')); return Array.isArray(j) ? j : (j.places || []); })();
const CUR_REDIRECTS = (() => { const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'db/places/curated-places.json'), 'utf8')); return (j && !Array.isArray(j) && j.redirects) || {}; })();
// the server's own slug functions (db/cities index keys: new slug + legacy slug, first match wins in file order)
const makeCitySlugSrv = new Function(grabFn(srvC, 'makeCitySlugSrv') + '\nreturn makeCitySlugSrv;')();
const makeLegacySlug = new Function(grabFn(srvC, '_makeCityLegacySlug') + '\nreturn _makeCityLegacySlug;')();
const DB_FILES = fs.readdirSync(path.join(ROOT, 'db')).filter((x) => /^cities-[a-z]{2}\.json$/.test(x)).sort();
const DB = DB_FILES.map((f) => { let arr = []; try { const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'db', f), 'utf8')); arr = Array.isArray(j) ? j : []; } catch (_e) { arr = []; } return { f, cc: f.slice(7, 9), arr }; });
const DB_INDEX = (() => { const m = new Map(); for (const { cc, arr, f } of DB) for (const c of arr) { if (!(c && c.nameAr && c.nameEn && typeof c.lat === 'number' && typeof c.lng === 'number')) continue; const s = makeCitySlugSrv(c.nameEn, c.lat, c.lng); if (s && !m.has(s)) m.set(s, { ...c, cc, f }); const ls = makeLegacySlug(c.nameEn); if (ls && ls !== s && !m.has(ls)) m.set(ls, { ...c, cc, f, legacy: true }); } return m; })();
const codeOnly = (s) => s.split(/\r?\n/).map((l) => l.replace(/^\s*\/\/.*$/, '').replace(/\s\/\/ .*$/, '')).join('\n');
const EX_LINE = "    if ((slug === 'al-quneitra' && cc === 'sy') || (slug === 'sokhumi' && cc === 'ge') || (slug === 'katzrin' && cc === 'sy')) return _countryZone();   // TEMPORARY, see above";
const CZ_LINE = "    const _countryZone = () => (typeof _CC_TO_PRIMARY_TZ !== 'undefined') ? (_CC_TO_PRIMARY_TZ[cc] || null) : null;";
const SIMILAR = ['katsrin', 'qatsrin', 'qasrin', 'qazrin', 'qatzrin', 'katzerin', 'kazrin', 'katzrin-golan', 'sukhumi', 'sokhum', 'sukhum', 'al-qunaytirah', 'qunaytirah'];
// ---------------------------------------------------------------- [S]
console.log('-- [S] source + data (CAND vs production ' + BASE_REF + ')');
{
    const shaB = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: BASE_ROOT }).toString().trim();
    const dirtyB = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: BASE_ROOT }).toString().trim();
    ok('[S]', shaB === BASE_REF && dirtyB === '', 'BASE = clean production tree at ' + BASE_REF, shaB + ' ' + dirtyB);
    const fMC = grabFn(srvC, '_ssrMoonCityIana').replace(/\r/g, '');
    const L = fMC.split('\n');
    ok('[S]', L[1] === CZ_LINE && L[2] === EX_LINE, '_ssrMoonCityIana starts with the exemption: exact slug + country code sy/al-quneitra, ge/sokhumi, sy/katzrin -> _countryZone()', L.slice(0, 3).join(' / '));
    ok('[S]', srvC.split(EX_LINE.trim()).length === 2 && !grabFn(srvB, '_ssrMoonCityIana'), 'the exemption line exists once in server.js (BASE has no _ssrMoonCityIana: its moon pages used the country zone)');
    const lits = (s) => (codeOnly(s).match(/'(?:al-quneitra|sokhumi|katzrin)'/g) || []).length;
    ok('[S]', lits(srvC) === 3 && lits(srvB) === 0 && (EX_LINE.match(/'(?:al-quneitra|sokhumi|katzrin)'/g) || []).length === 3, 'server.js code names the three slugs only on the exemption line (BASE: none)');
    const at = srvC.indexOf('function _ssrMoonCityIana('), cm = srvC.slice(srvC.lastIndexOf('\n\r\n', at), at).replace(/\r/g, '').replace(/\n\/\/ ?/g, ' ');
    const need = ['TEMPORARY EXEMPTION', 'owner decisions 2026-10-19 on #13', 'remove once their zone is decided', 'exactly three cities', 'EXACT slug + country code the moon route resolved, never on a name', 'sy/al-quneitra', 'ge/sokhumi', 'sy/katzrin', 'db/cities-sy', 'trusted set', 'NOT an endorsement', 'stay open', 'Namesakes are deliberately not matched', 'only these known, tested cities', 'other discovered cities needs its own audit', 'not a general fix'];
    ok('[S]', need.every((w) => cm.includes(w)), 'the comment above it: temporary, the three exact ids, why katzrin, not an endorsement, data review open, coverage = the known tested cities only, other discovered cities need their own audit', need.filter((w) => !cm.includes(w)).join(' | '));
    const kLines = srvC.split(/\r?\n/).map((l, i) => [i, l]).filter(([, l]) => /katzrin/i.test(l));
    ok('[S]', kLines.every(([, l]) => l.startsWith('//') || l === EX_LINE) && kLines.length >= 2, 'every server.js line naming katzrin is the exemption comment or the exemption line (' + kLines.length + ' lines)', kLines.map(([i, l]) => (i + 1) + ': ' + l.slice(0, 120)).join(' | '));
    ok('[S]', !/al-quneitra|sokhumi|katzrin/.test(appC), 'js/app.js has no exemption of its own: the client computes with <meta name="moon.city.tz">, which the server fills from _ssrMoonCityIana');
    const callM = "const _moonTz = _moonDiscoveredTz || (_moonCc ? (_ssrMoonCityIana(citySlug, _moonCc, cityGeo.lat, cityGeo.lng) || null) : null);";
    const callY = "|| (_ycDisc && _ycDisc.timezone) || (_ssrMoonCityIana(_yc.citySlug, _yc.cc, _ycLat, _ycLng) || null);";
    ok('[S]', srvC.split(callM).length === 2 && srvC.split(callY).length === 2 && (codeOnly(srvC).match(/_ssrMoonCityIana\(/g) || []).length === 3, '_ssrMoonCityIana is the one helper behind both moon-zone call sites (hub / month meta, year page last tier), called nowhere else');
    for (const fn of ['_ssrCityIana', '_ssrTrustedZonesFor', 'makeCitySlugSrv', '_resolveCityForMoon', '_resolveCcForMoonSlug', '_classifyNestedMoonHub', '_classifyMoonYear', '_classifyMoonMonth']) ok('[S]', !!grabFn(srvB, fn) && grabFn(srvC, fn) === grabFn(srvB, fn), fn + ' byte-identical to BASE (prayer resolver / trusted zones / route resolution unchanged)');
    ok('[S]', JSON.stringify(PRIMARY_C) === JSON.stringify(PRIMARY_B) && PRIMARY_B.sy === 'Asia/Damascus' && PRIMARY_B.ge === 'Asia/Tbilisi', '_CC_TO_PRIMARY_TZ identical to BASE: _countryZone() = BASE\'s value (sy Asia/Damascus, ge Asia/Tbilisi)');
    for (const E of EXEMPT.filter((x) => x.src === 'curated')) {
        const recs = CUR.filter((p) => p.slug === E.slug);
        ok('[S]', recs.length === 1 && String(recs[0].countryCode).toLowerCase() === E.cc && recs[0].timezone === E.other, 'curated ' + E.slug + ': one record, cc ' + E.cc + ', registered ' + E.other + '; country zone ' + PRIMARY_B[E.cc], JSON.stringify(recs.map((r) => [r.countryCode, r.timezone])));
    }
    {
        const k = DB_INDEX.get('katzrin');
        const allK = []; for (const { f, arr } of DB) for (const c of arr) if (c && (makeCitySlugSrv(c.nameEn, c.lat, c.lng) === 'katzrin' || makeLegacySlug(c.nameEn) === 'katzrin')) allK.push(f + ' ' + c.nameEn);
        ok('[S]', !!k && k.cc === 'sy' && k.f === 'cities-sy.json' && allK.length === 1 && !CUR.some((p) => p.slug === 'katzrin') && !FAMOUS_C.katzrin && !Object.keys(CUR_REDIRECTS).concat(Object.values(CUR_REDIRECTS)).includes('katzrin'), 'katzrin = exactly one db/cities entry (db/cities-sy.json «' + (k && k.nameAr) + '» ' + (k && k.lat) + ', ' + (k && k.lng) + '), not curated, not a famous override, no curated redirect to / from it', allK.join(' | '));
        const tzl = require(path.join(ROOT, 'node_modules/tz-lookup'));
        const st = [[0, 0], [0.15, 0], [-0.15, 0], [0, 0.15], [0, -0.15]].map(([a, b]) => tzl(k.lat + a, k.lng + b));
        const syJer = CUR.filter((p) => String(p.countryCode).toLowerCase() === 'sy' && p.timezone === 'Asia/Jerusalem').map((p) => p.slug);
        ok('[S]', st.every((z) => z === 'Asia/Jerusalem') && syJer.join(',') === 'al-quneitra', 'katzrin: its coordinate zone is Asia/Jerusalem (stable under the gate\'s 0.15 deg nudges) and the only curated sy record with Asia/Jerusalem is al-quneitra (why it passes the country gate)', st.join(',') + ' / ' + syJer.join(','));
    }
    const simHit = SIMILAR.filter((s) => DB_INDEX.has(s) || CUR.some((p) => p.slug === s) || FAMOUS_C[s]);
    ok('[S]', simHit.length === 0, 'no city exists under a similar slug (' + SIMILAR.join(', ') + '): nothing else can be matched by mistake', simHit.join(','));
    for (const f of ['js/moon.js', 'db/hijri/umm-al-qura.json', 'db/places/curated-places.json', 'db/cities-sy.json']) ok('[S]', fs.readFileSync(path.join(BASE_ROOT, f)).equals(fs.readFileSync(path.join(ROOT, f))), f + ' untouched (byte-identical to BASE)');
    ok('[S]', (srvC.match(/\r\n/g) || []).length === (srvC.match(/\n/g) || []).length, 'CAND server.js keeps CRLF line endings throughout');
}
// ---------------------------------------------------------------- [U]
console.log('\n-- [U] _ssrMoonCityIana CAND vs ABLATED (CAND minus the exemption line), same injected dependencies');
{
    const bySlug = new Map(CUR.map((p) => [p.slug, p]));
    const deps = [(s) => bySlug.get(s) || null, (s, c) => 'RESOLVER(' + s + '|' + c + ')', PRIMARY_C];
    const mk = (src) => new Function('_findPlaceBySlug', '_ssrCityIana', '_CC_TO_PRIMARY_TZ', grabFn(src, '_ssrMoonCityIana') + '\nreturn _ssrMoonCityIana;')(...deps);
    const srvA = srvC.replace(EX_LINE.trim(), '/* ablated */');
    const fA = mk(srvA), fC = mk(srvC);
    const inputs = new Map(); const add = (s, c, la, ln) => { const k = s + '|' + c + '|' + la + '|' + ln; if (!inputs.has(k)) inputs.set(k, [s, c, la, ln]); };
    for (const p of CUR) { const c = String(p.countryCode || '').toLowerCase(); add(p.slug, c, p.lat, p.lng); for (const o of ['sy', 'ge', 'ma', 'il', 'ru', 'lb', 'th']) if (o !== c) add(p.slug, o, p.lat, p.lng); }
    let dbN = 0;
    for (const { cc, arr } of DB) for (const r of arr) { if (!r || !r.nameEn) continue; const s = makeCitySlugSrv(r.nameEn, r.lat, r.lng); if (s) { add(s, cc, r.lat, r.lng); dbN++; } const ls = makeLegacySlug(r.nameEn); if (ls && ls !== s) add(ls, cc, r.lat, r.lng); }
    const NAMESAKES = [['quneitra', 'sy'], ['quneitra', 'il'], ['kenitra', 'ma'], ['al-quneitra', 'ma'], ['al-quneitra', 'il'], ['al-quneitra', 'lb'], ['al-quneitra', 'jo'], ['al-qunaytirah', 'sy'], ['al-qunaitra', 'sy'], ['qunaytirah', 'sy'], ['kuneytire', 'sy'], ['al-kuneitra', 'sy'], ['quneitra-governorate', 'sy'], ['rabat-sale-kenitra', 'ma'],
        ['sokhumi', 'ru'], ['sokhumi', 'ab'], ['sokhumi', 'tr'], ['sukhumi', 'ge'], ['sukhumi', 'ru'], ['sokhum', 'ge'], ['sukhum', 'ge'], ['suhumi', 'ge'], ['sochumi', 'ge'], ['sukhothai', 'th'], ['suehbaatar', 'mn'],
        ['katzrin', 'il'], ['katzrin', 'lb'], ['katzrin', 'ge'], ['katzrin', 'ps'], ['katzrin', 'jo'], ['katsrin', 'sy'], ['qatsrin', 'sy'], ['qasrin', 'sy'], ['qazrin', 'sy'], ['qatzrin', 'sy'], ['katzrin-golan', 'sy'], ['katzrin-sy', 'sy'], ['majdal-shams', 'sy'], ['masade', 'sy'], ['buqata', 'sy'], ['ghajar', 'sy'], ['ghajar', 'lb'], ['damascus', 'sy'], ['tbilisi', 'ge'],
        ['Al-Quneitra', 'sy'], ['AL-QUNEITRA', 'sy'], ['al-quneitra', 'SY'], ['al-quneitra ', 'sy'], ['al_quneitra', 'sy'], ['alquneitra', 'sy'], ['al-quneitra-sy', 'sy'], ['Sokhumi', 'ge'], ['sokhumi', 'GE'], ['sokhumi ', 'ge'], ['Katzrin', 'sy'], ['KATZRIN', 'sy'], ['katzrin', 'SY'], ['katzrin ', 'sy'], [' katzrin', 'sy'],
        ['', 'sy'], ['', 'ge'], [null, 'sy'], [undefined, 'ge'], ['al-quneitra', ''], ['sokhumi', null], ['katzrin', ''], ['katzrin', undefined]];
    for (const [s, c] of NAMESAKES) { add(s, c, 33.12, 35.82); add(s, c, 43.0, 40.99); add(s, c, NaN, NaN); }
    for (const E of EXEMPT) { add(E.slug, E.cc, 34.261, -6.5802); add(E.slug, E.cc, NaN, NaN); add(E.slug, E.cc, 32.9925, 35.690555555556); }   // the exact key at other coordinates is still the same city id
    const diff = [], err = [];
    for (const [k, a] of inputs) { let p, c; try { p = fA(...a); c = fC(...a); } catch (e) { err.push(k + ' ' + e.message); continue; } if (p !== c) diff.push({ k, a, p, c }); }
    const keys = [...new Set(diff.map((d) => d.a[0] + '|' + d.a[1]))].sort();
    console.log(`   ${inputs.size} distinct inputs (${CUR.length} curated slugs x own + 7 other country codes, ${dbN} db/cities entries + legacy slugs, ${NAMESAKES.length} namesake / variant keys at 3 positions); outputs differing ABLATED vs CAND: ${diff.length}, keys ${keys.join(', ')}`);
    ok('[U]', err.length === 0, 'no input throws (ABLATED or CAND)', err.slice(0, 3).join(' ; '));
    ok('[U]', keys.join(',') === 'al-quneitra|sy,katzrin|sy,sokhumi|ge', 'the exemption changes the output for exactly three (slug, cc) keys: al-quneitra|sy, katzrin|sy, sokhumi|ge', keys.join(','));
    for (const E of EXEMPT) {
        const all = [...inputs.values()].filter((a) => a[0] === E.slug && a[1] === E.cc);
        const base = PRIMARY_B[E.cc] || null;   // BASE's moon-page expression: _CC_TO_PRIMARY_TZ[cc] || null
        ok('[U]', all.length >= 3 && all.every((a) => fC(...a) === base), E.cc + '/' + E.slug + ': CAND == BASE\'s country zone ' + base + ' at all ' + all.length + ' positions (ABLATED: ' + [...new Set(all.map((a) => fA(...a)))].join(' / ') + ')');
    }
    const nsOther = NAMESAKES.filter(([s, c]) => !EXEMPT.some((E) => E.slug === s && E.cc === c));
    ok('[U]', nsOther.every(([s, c]) => [[33.12, 35.82], [43.0, 40.99], [NaN, NaN]].every(([la, ln]) => fA(s, c, la, ln) === fC(s, c, la, ln))), nsOther.length + ' namesake / other-country / spelling / case variants (quneitra, kenitra, sukhumi, katsrin, qatsrin, katzrin|il, Katzrin, katzrin|SY, majdal-shams, ...): CAND == ABLATED (not exempt)');
}
// ---------------------------------------------------------------- servers + clock + test hooks
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-tzx-'));
const CLOCK_JS = path.join(tmp, 'test-clock.cjs'), CLOCK_FILE = path.join(tmp, 'clock.txt');
const HOOK_JS = path.join(tmp, 'test-hook.cjs'), PROBE_FILE = path.join(tmp, 'probe.jsonl');
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
fs.writeFileSync(HOOK_JS, [
    "'use strict';",
    '// TEST-ONLY compile hook (written by scripts/_smoke_today_pages_tz_exempt_1.mjs into a temp dir; never in the repo).',
    '// Inert unless TP_SRV_HOOK is set. probe: log each _ssrMoonCityIana(slug, cc, lat, lng) call (output unchanged);',
    '// ablate: remove ONLY the exemption line (= the branch without the exemption).',
    "const MODE = process.env.TP_SRV_HOOK || '';",
    'if (MODE) {',
    "  const Module = require('module'), path = require('path'), fs = require('fs');",
    "  const target = path.resolve(process.cwd(), 'server.js');",
    '  const EX = ' + JSON.stringify(EX_LINE.trim()) + ';',
    "  const HEAD = 'function _ssrMoonCityIana(slug, cc, lat, lng) {';",
    '  const _c = Module.prototype._compile;',
    '  Module.prototype._compile = function (content, filename) {',
    '    if (path.resolve(filename) === target) {',
    "      if (MODE === 'ablate') { if (content.split(EX).length !== 2) throw new Error('test hook: exemption line not found'); content = content.replace(EX, () => '/* TEST ablation: exemption removed */'); }",
    "      else if (MODE === 'probe') { if (content.split(HEAD).length !== 2) throw new Error('test hook: _ssrMoonCityIana not found'); content = content.replace(HEAD, () => HEAD + ' try { require(\"fs\").appendFileSync(process.env.TP_PROBE_FILE, JSON.stringify([slug, cc, lat, lng]) + \"\\\\n\"); } catch (_e) { /* test probe */ }'); }",
    "      try { fs.appendFileSync(process.env.TP_HOOK_OK_FILE, MODE + ' ' + process.pid + '\\n'); } catch (_e) { /* marker */ }",
    '    }',
    '    return _c.call(this, content, filename);',
    '  };',
    '}', ''].join('\n'));
const setClock = async (iso) => { fs.writeFileSync(CLOCK_FILE, String(typeof iso === 'number' ? iso : Date.parse(iso))); await sleep(250); };
const boot = (root, port, hook) => spawn(process.execPath, ['-r', GUARD, '-r', CLOCK_JS, '-r', HOOK_JS, 'server.js'], { cwd: root, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0', TZ: 'UTC', TP_SMOKE_CLOCK_FILE: CLOCK_FILE,
        TP_SRV_HOOK: hook || '', TP_PROBE_FILE: PROBE_FILE, TP_HOOK_OK_FILE: path.join(tmp, 'hook-' + (hook || 'none') + '.txt') } });
const probeGet = async (p) => { fs.writeFileSync(PROBE_FILE, ''); const r = await get(PORT.probe, p); await sleep(20); const calls = fs.readFileSync(PROBE_FILE, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)); return { r, calls }; };
function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const handlers = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; } if (d.method) handlers.forEach((h) => h(d)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    return new Promise((res) => { ws.onopen = () => res({ send, on: (h) => handlers.push(h), close: () => ws.close() }); });
}
// every moon URL form of a city (relative, no language prefix): [path, kind]
// the YEAR page of a CURATED city takes the record's own zone first (production behaviour, `_ycCurated.timezone`) and never
//   asks _ssrMoonCityIana; katzrin (db/cities only) and every hub / month page go through it
const isYearPath = (p) => /\/moon\/[a-z-]+\/[a-z0-9-]+\/\d{4}(?:[?#].*)?$/.test(p);
const viaRecord = (E, p) => E.src === 'curated' && isYearPath(p);
const coordOf = (E) => { const rec = E.src === 'curated' ? CUR.find((p) => p.slug === E.slug) : DB_INDEX.get(E.slug); return rec ? { lat: rec.lat, lng: rec.lng } : null; };
const FORMS = (E, yNow) => {
    const c = '/moon/' + E.country + '/' + E.slug, g = coordOf(E), cap = E.slug[0].toUpperCase() + E.slug.slice(1);
    const y = String(yNow);
    return [[c, 'hub'], [c + '?utm_source=x', 'hub + query'], [c + '/' + y, 'year'], [c + '/' + (yNow - 5), 'year (window start)'], [c + '/' + (yNow + 5), 'year (window end)'],
        [c + '/2026/10', 'month'], [c + '/2026/11', 'month'], [c + '/2027/03', 'month'], [c + '/2027/04', 'month'], [c + '/' + y + '/01', 'month'],
        ['/moon-in-' + E.slug, 'legacy hub'], ['/moon-in-' + E.slug + '/2026-10', 'legacy month'], ['/moon-in-' + E.slug + '-' + g.lat.toFixed(4) + '-' + g.lng.toFixed(4), 'legacy coord suffix'],
        [c + '.html', '.html'], [c + '/', 'trailing slash'], [c + '/' + y + '.html', 'year .html'], [c + '/2026/10.html', 'month .html'], [c + '/2026/10/', 'month trailing slash'],
        ['/moon/' + E.wrong[0] + '/' + E.slug, 'other country'], ['/moon/' + E.wrong[0] + '/' + E.slug + '/' + y, 'other country year'], ['/moon/' + E.wrong[0] + '/' + E.slug + '/2026/10', 'other country month'], ['/moon/' + E.wrong[1] + '/' + E.slug, 'not a moon country'],
        [c + '/today', 'removed today'], [c + '/2026/10/19', 'removed day'], ['/moon-in-' + E.slug + '/2026-10-19', 'removed legacy day'], ['/moon-today-in-' + E.slug, 'removed legacy today'],
        [c + '/' + (yNow - 6), 'year out of window'], [c + '/' + (yNow + 6), 'year out of window'], [c + '/2026/13', 'invalid month'], ['/moon-in-' + E.slug + '/1448-05', 'hijri form'], ['/moon/' + E.country + '/' + cap, 'upper case']];
};
const T_A = '2026-10-19T20:30:00Z';   // sokhumi: 23:30 Moscow Oct 19 / 00:30 Tbilisi Oct 20 (Jerusalem = Damascus = +3)
const T_B = '2026-10-27T21:30:00Z';   // al-quneitra / katzrin: 23:30 Jerusalem Oct 27 (IST) / 00:30 Damascus Oct 28; sokhumi likewise
const T_C = '2027-03-25T21:30:00Z';   // eve of the Jerusalem DST start (2027-03-26): 23:30 Jerusalem Mar 25 / 00:30 Damascus Mar 26
const T_SCAN = '2026-10-18T19:05:00Z';
let kB = null, kC = null, kP = null, kA = null, chrome = null, cd = null;
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-tzx-chrome-'));
const summary = [];
try {
    fs.writeFileSync(CLOCK_FILE, String(Date.parse(T_B)));
    for (const pt of [PORT.base, PORT.cand, PORT.probe, PORT.abl, PORT.cdp]) { if ((await get(pt, '/health')).st !== 0) throw new Error('port ' + pt + ' is already in use - set TP_SMOKE_PORT'); }
    kB = boot(BASE_ROOT, PORT.base, ''); kC = boot(ROOT, PORT.cand, ''); kP = boot(ROOT, PORT.probe, 'probe'); kA = boot(ROOT, PORT.abl, 'ablate');
    for (const pt of [PORT.base, PORT.cand, PORT.probe, PORT.abl]) { for (let t = 0; t < 480; t++) { if ((await get(pt, '/health')).st === 200) break; await sleep(250); } }
    await sleep(300);
    const hookOk = (m) => { try { return fs.readFileSync(path.join(tmp, 'hook-' + m + '.txt'), 'utf8').split('\n').filter(Boolean).every((l) => l.startsWith(m + ' ')) && fs.readFileSync(path.join(tmp, 'hook-' + m + '.txt'), 'utf8').length > 0; } catch (_e) { return false; } };
    ok('[S]', [kB, kC, kP, kA].every((k) => k.exitCode === null) && hookOk('probe') && hookOk('ablate') && !fs.existsSync(path.join(tmp, 'hook-none.txt')), 'four servers are this run\'s own processes (alive after /health); the probe / ablate hooks engaged on their servers only (BASE / CAND unhooked)');
    // ------------------------------------------------------------ [R] route resolution
    console.log('\n-- [R] which (slug, cc) reaches _ssrMoonCityIana for every moon URL form (PROBE server, 10 languages) at ' + T_B);
    const rTable = [];
    {
        const bad = [], nCalls = {}; let n = 0, n200 = 0, nRedir = 0, nGone = 0;
        for (const E of EXEMPT) {
            const g = coordOf(E);
            for (const [rel, kind] of FORMS(E, 2026)) for (const L of LANGS) {
                const p = lp(L) + rel; n++;
                const { r, calls } = await probeGet(p);
                const idOk = (cs, pp) => viaRecord(E, pp) ? cs.length === 0 : (cs.length >= 1 && cs.every((x) => x[0] === E.slug && x[1] === E.cc && Math.abs(x[2] - g.lat) < 1e-9 && Math.abs(x[3] - g.lng) < 1e-9));
                let why = '', fin = '';
                if (r.st === 200) { n200++; nCalls[calls.length] = (nCalls[calls.length] || 0) + 1; if (!idOk(calls, p)) why = 'calls ' + JSON.stringify(calls); }
                else if (r.st === 301 || r.st === 302) {
                    nRedir++; if (calls.length) why = 'a redirect reached _ssrMoonCityIana ' + JSON.stringify(calls);
                    let cur = locOf(r), last = null;
                    for (let i = 0; i < 4 && cur; i++) { const x = await probeGet(cur); last = { p: cur, ...x }; if (x.r.st === 301 || x.r.st === 302) cur = locOf(x.r); else break; }
                    fin = last ? last.p + ' ' + last.r.st : '';
                    const finOk = last && last.r.st === 200 && new RegExp('^' + lp(L).replace('/', '\\/') + '\\/moon\\/' + E.country + '\\/' + E.slug + '(?:\\/\\d{4}(?:\\/\\d{2})?)?$').test(last.p) && idOk(last.calls, last.p);
                    if (!finOk) why += ' final ' + fin + ' ' + JSON.stringify(last && last.calls);
                } else { nGone++; if (calls.length) why = 'status ' + r.st + ' reached _ssrMoonCityIana ' + JSON.stringify(calls); }
                if (L === 'en') rTable.push(`   ${E.cc}/${E.slug.padEnd(11)} ${kind.padEnd(22)} ${rel.padEnd(52)} ${r.st}${r.st === 200 ? (calls.length ? ' -> _ssrMoonCityIana(' + calls[0].slice(0, 2).join(', ') + ') x' + calls.length : ' -> record zone (not asked)') : (fin ? ' -> ' + fin.replace('/en', '') : '')}`);
                if (why) bad.push(p + ' ' + r.st + ' ' + why);
            }
        }
        for (const l of rTable) console.log(l);
        console.log(`   ${n} requests: ${n200} rendered (200; _ssrMoonCityIana calls per page ${JSON.stringify(nCalls)}), ${nRedir} redirects, ${nGone} 404 / 410`);
        ok('[R]', bad.length === 0 && n200 > 0 && nRedir > 0 && nGone > 0, 'every 200 form reaches _ssrMoonCityIana only with the city id (slug, cc, lat, lng of its record) - except the year page of the 2 curated cities, which reads the record zone first (production) and never asks it; every redirect reaches no zone and ends (<= 4 hops) on a 200 form of the same city; every 404 / 410 form never reaches it', bad.slice(0, 5).join(' ; '));
    }
    // ------------------------------------------------------------ [A] + [H] the exempt pages
    console.log('\n-- [A] + [H] the three exempt cities: every form x 10 languages, BASE vs CAND (+ ABL zone)');
    const hJobs = [];
    for (const E of EXEMPT) for (const [rel, kind] of FORMS(E, 2026)) for (const L of LANGS) hJobs.push({ T: T_B, E, L, kind, p: lp(L) + rel });
    for (const [T, yNow] of [[T_A, 2026], [T_C, 2027]]) for (const E of EXEMPT) for (const rel of ['', '/' + yNow, '/2026/10', '/2026/11', '/2027/03', '/2027/04']) for (const L of LANGS) hJobs.push({ T, E, L, kind: rel ? (rel.split('/').length === 2 ? 'year' : 'month') : 'hub', p: lp(L) + '/moon/' + E.country + '/' + E.slug + rel });
    {
        const bad = [], aBad = [], vPairs = new Set(), diffKinds = new Set(), stC = {}; let n = 0, rawSame = 0, nA = 0, nRec = 0;
        let curT = null;
        for (const j of hJobs) {
            if (j.T !== curT) { await setClock(j.T); curT = j.T; }
            const [b, c, a] = await Promise.all([get(PORT.base, j.p), get(PORT.cand, j.p), get(PORT.abl, j.p)]);
            n++; stC[b.st] = (stC[b.st] || 0) + 1;
            let why = '';
            if (headF(b) !== headF(c)) why = 'head ' + headF(b).slice(0, 200) + ' || ' + headF(c).slice(0, 200);
            else if (b.st === 200) {
                const nb = noise(b.b), nc = noise(c.b);
                const zb = zoneOf(b.b), zc = zoneOf(c.b), za = zoneOf(a.b);
                const want = viaRecord(j.E, j.p) ? j.E.other : j.E.primary;
                if (zb !== want || zc !== want) why = 'zone ' + zb + ' / ' + zc + ' (want ' + want + ')';
                else if (nb !== nc) why = firstDiff(nb, nc);
                else {
                    const dl = diffLines(noiseReq(b.b), noiseReq(c.b));
                    if (!dl) why = 'line count differs';
                    else if (!dl.length) rawSame++;
                    else for (const [x, y] of dl) { if (build(x) !== build(y)) why = 'raw line ' + x.slice(0, 200) + ' | ' + y.slice(0, 200); diffKinds.add((/app\.js\?v=/.test(x) ? 'app.js?v' : '') + (/(?:[?&]|&amp;)b=[0-9a-f]/.test(x) ? '+b=sha' : '')); }
                    vPairs.add(appV(b.b) + '->' + appV(c.b));
                }
                // [A] the branch WITHOUT the exemption would move this page to the doubtful zone
                if (viaRecord(j.E, j.p)) { nRec++; if (!(a.st === 200 && za === j.E.other && noise(a.b) === nc)) aBad.push(j.T + ' ' + j.p + ' record-zone year page, ABL ' + za + ' ' + firstDiff(noise(a.b), nc).slice(0, 200)); }
                else { nA++; if (!(a.st === 200 && za === j.E.other && noise(a.b) !== nc)) aBad.push(j.T + ' ' + j.p + ' ABL zone ' + za); }
            } else if (noise(b.b) !== noise(c.b)) why = 'body of ' + b.st + ' differs ' + firstDiff(noise(b.b), noise(c.b)).slice(0, 300);
            if (why) bad.push(j.T + ' ' + j.p + ' ' + why);
        }
        console.log(`   ${n} URL pairs (3 cities x 31 forms x 10 languages at ${T_B}; hub + years + 4 months x 10 languages at ${T_A} and ${T_C}); BASE statuses ${JSON.stringify(stC)}; raw-identical 200 pages ${rawSame}; build-identity lines that differ: ${[...diffKinds].join(', ') || 'none'}; app.js?v BASE->CAND ${[...vPairs].join(', ')}`);
        ok('[H]', bad.length === 0, 'all ' + n + ' URLs: same status, Location, canonical, meta robots, X-Robots-Tag, hreflang; every 200 page on production\'s zone (meta / year chip: the country zone; the curated cities\' year chip: their record zone, as on production) and byte-identical BASE vs CAND after normalisation; 404 / 410 bodies identical', bad.slice(0, 4).join(' ; '));
        ok('[H]', [...diffKinds].every((k) => /^(app\.js\?v)?(\+b=sha)?$/.test(k) && k) && [...vPairs].every((v) => /^\d+->\d+$/.test(v)), 'the only raw differences are the build identity (app.js?v / b=sha); nothing else is normalised away', [...diffKinds].join(', '));
        ok('[A]', nA > 0 && aBad.length === 0, nA + ' rendered pages reach the exemption: ABL (the branch without the exemption) carries the doubtful zone (al-quneitra / katzrin Asia/Jerusalem, sokhumi Europe/Moscow) and a different page — the exemption is what keeps each one on production\'s zone; the ' + nRec + ' curated-city year pages never reach it (ABL == CAND, record zone as on production)', aBad.slice(0, 4).join(' ; '));
    }
    // ------------------------------------------------------------ [H] controls, prayer pages, other fixes
    console.log('\n-- [H] controls (same / similar names, same countries) BASE vs CAND vs ABL at ' + T_B);
    await setClock(T_B);
    {
        const NS = [['/moon/syria/quneitra', 'db/cities-sy Quneitra «القنيطرة»'], ['/moon/syria/damascus', 'famous + curated'], ['/moon/syria/aleppo', 'famous + curated'], ['/moon/syria/daraa', 'curated'], ['/moon/syria/majdal-shams', 'db/cities-sy, Golan'], ['/moon/syria/masade', 'db/cities-sy, Golan'], ['/moon/syria/buqata', 'db/cities-sy, Golan'], ['/moon/syria/ein-qiniyye', 'db/cities-sy, Golan'], ['/moon/syria/ein-zivan', 'db/cities-sy, Golan'],
            ['/moon/georgia/tbilisi', 'curated'], ['/moon/georgia/batumi', 'curated'], ['/moon/georgia/zugdidi', 'curated, next to Abkhazia'], ['/moon/morocco/kenitra', 'curated, «القنيطرة»'], ['/moon/thailand/sukhothai', 'curated, Sukh-'], ['/moon/mongolia/suehbaatar', 'curated, alias Sukhbaatar']];
        const bad = [], log = [];
        for (const [p0, note] of NS) for (const suf of ['', '/2026', '/2026/10']) for (const L of ['en', 'ar']) {
            const p = lp(L) + p0 + suf; const [b, c, a] = await Promise.all([get(PORT.base, p), get(PORT.cand, p), get(PORT.abl, p)]);
            if (L === 'en' && suf === '') log.push(p0 + ' ' + b.st + ' zone ' + zoneOf(b.b) + ' / ' + zoneOf(c.b) + ' / ABL ' + zoneOf(a.b) + (note ? ' (' + note + ')' : ''));
            if (!(b.st === 200 && c.st === 200 && a.st === 200 && zoneOf(c.b) && zoneOf(b.b) === zoneOf(c.b) && zoneOf(a.b) === zoneOf(c.b) && noise(b.b) === noise(c.b) && noise(a.b) === noise(c.b))) bad.push(p + ' ' + b.st + '/' + c.st + '/' + a.st + ' ' + zoneOf(b.b) + '/' + zoneOf(c.b) + '/' + zoneOf(a.b) + ' ' + firstDiff(noise(b.b), noise(c.b)).slice(0, 300));
        }
        for (const l of log) console.log('   ' + l);
        ok('[H]', bad.length === 0, NS.length + ' controls x (hub, year 2026, month 2026/10) x (en, ar): 200, same zone, byte-identical BASE vs CAND, and CAND == ABL (the exemption does not touch them)', bad.slice(0, 4).join(' ; '));
        const RT = ['/en/moon/syria/katsrin', '/en/moon/syria/qatsrin', '/en/moon-in-qasrin', '/en/moon-in-qazrin', '/en/moon/syria/katzrin-golan', '/en/moon/israel/katzrin', '/en/moon/georgia/sukhumi', '/en/moon-in-sukhumi', '/en/moon/syria/al-qunaytirah', '/en/moon/israel/al-quneitra', '/en/moon/abkhazia/sokhumi', '/en/moon-in-quneitra', '/en/moon-in-kenitra', '/en/moon/syria/ghajar', '/moon/syria/katsrin', '/moon-in-qatsrin'];
        const rBad = [], rLog = [];
        for (const p of RT) {
            const [b, c, a] = await Promise.all([get(PORT.base, p), get(PORT.cand, p), get(PORT.abl, p)]);
            rLog.push(p + ' ' + b.st + (locOf(b) ? ' -> ' + locOf(b) : ''));
            if (!(headF(b) === headF(c) && headF(a) === headF(c) && [200, 301, 404, 410].includes(b.st) && noise(b.b) === noise(c.b))) rBad.push(p + ' ' + headF(b).slice(0, 120) + ' | ' + headF(c).slice(0, 120));
        }
        console.log('   ' + rLog.join(' | '));
        ok('[H]', rBad.length === 0, RT.length + ' similar / wrong slugs (katsrin, qatsrin, qasrin, qazrin, katzrin-golan, sukhumi, al-qunaytirah, katzrin under israel, ghajar, ...): same status, Location, canonical, robots and body BASE vs CAND vs ABL', rBad.join(' ; '));
        const PR = ['/en/prayer-times-in-al-quneitra', '/prayer-times-in-al-quneitra', '/en/prayer-times-in-sokhumi', '/prayer-times-in-sokhumi', '/en/prayer-times-in-katzrin', '/prayer-times-in-katzrin', '/en/qibla-in-katzrin'];
        const pBad = [], pLog = [];
        for (const p of PR) {
            let b = await get(PORT.base, p), c = await get(PORT.cand, p);
            if (noise(b.b) !== noise(c.b)) { await sleep(1200); b = await get(PORT.base, p); c = await get(PORT.cand, p); }
            const zones = [...new Set((c.b.match(/(?:Asia|Europe)\/(?:Jerusalem|Damascus|Moscow|Tbilisi)/g) || []))].join(',');
            pLog.push(p + ' ' + c.st + ' zones in HTML: ' + (zones || 'none'));
            if (!(b.st === 200 && c.st === 200 && noise(b.b) === noise(c.b))) pBad.push(p + ' ' + b.st + '/' + c.st + ' ' + firstDiff(noise(b.b), noise(c.b)).slice(0, 300));
        }
        for (const l of pLog) console.log('   ' + l);
        ok('[H]', pBad.length === 0, 'prayer / qibla pages of the three cities identical BASE vs CAND (the exemption is moon-only; prayer-vs-moon consistency stays an open data item)', pBad.join(' ; '));
    }
    console.log('\n-- [H] the other moon-zone fixes still apply, at ' + T_SCAN);
    await setClock(T_SCAN);
    {
        const tS = Date.parse(T_SCAN);
        for (const [p, bm, cm, kind] of [['/en/moon/united-states/seattle', 'America/New_York', 'America/Los_Angeles', 'zone'], ['/moon/united-states/seattle', 'America/New_York', 'America/Los_Angeles', 'zone'], ['/en/moon/indonesia/jayapura', 'Asia/Jakarta', 'Asia/Jayapura', 'zone'], ['/en/moon/latvia/riga', null, 'Europe/Riga', 'added'], ['/en/moon/united-states/seattle/2026/10', 'America/New_York', 'America/Los_Angeles', 'zone']]) {
            const b = await get(PORT.base, p), c = await get(PORT.cand, p);
            const same = kind === 'zone' ? noise(setMeta(b.b, cm)) === noise(c.b) : noise(dropMeta(c.b)) === noise(b.b);
            const looseOk = kind === 'zone' && !same && (() => { const dl = diffLines(noise(setMeta(b.b, cm)), noise(c.b)); return !!dl && dl.every(([x, y]) => /moon-stat-value|moon-hub-cal|moon-city-hub-edu-link|moon-hub-related|ssr-moon-article-schema|FAQPage|"@type":"Question"/.test(x + y)); })();
            ok('[H]', b.st === 200 && c.st === 200 && metaOf(b.b) === bm && metaOf(c.b) === cm && (same || looseOk), p + ': meta ' + bm + ' -> ' + cm + (same ? ', nothing else differs' : ', plus only the month / link values that follow the zone'), firstDiff(noise(setMeta(b.b, cm)), noise(c.b)));
        }
        const ak = '/en/moon/new-zealand/auckland', b = await get(PORT.base, ak), c = await get(PORT.cand, ak);
        const cd0 = cityDate(tS, 'Pacific/Auckland'), noonC = exactNoon(cd0.y, cd0.m, cd0.d, 'Pacific/Auckland'), nx = new Date(Date.UTC(cd0.y, cd0.m - 1, cd0.d + 1)), noonN = exactNoon(nx.getUTCFullYear(), nx.getUTCMonth() + 1, nx.getUTCDate(), 'Pacific/Auckland');
        const wantC = MoonCalc.getMoonIllumination(new Date(noonC)), wantB = MoonCalc.getMoonIllumination(new Date(noonN));
        console.log(`   auckland JSON-LD illumination BASE ${articleIllum(b.b)}% CAND ${articleIllum(c.b)}% (engine: Auckland noon ${cd0.d} Oct ${wantC}%, next day ${wantB}%)`);
        ok('[H]', metaOf(c.b) === 'Pacific/Auckland' && articleIllum(c.b) === wantC && articleIllum(b.b) === wantB && wantC !== wantB, 'Auckland (UTC+13): CAND JSON-LD = the engine at today\'s Auckland noon, BASE = tomorrow\'s (noon fix still applies)');
        const oc = '/en/moon/united-states/orlando', ob = await get(PORT.base, oc), occ = await get(PORT.cand, oc);
        ok('[H]', metaOf(ob.b) === 'America/New_York' && metaOf(occ.b) === 'America/New_York' && noise(ob.b) === noise(occ.b), 'slug collision orlando keeps BASE (decision #14 not done), byte-identical');
    }
    // ------------------------------------------------------------ [Z] every Syria / Georgia moon page
    console.log('\n-- [Z] every Syria / Georgia moon page reachable locally (en), BASE vs CAND; ABL vs BASE zone, at ' + T_B);
    await setClock(T_B);
    {
        const slugs = new Map();
        for (const k of Object.keys(FAMOUS_C)) if (/^(sy|ge)$/i.test(FAMOUS_C[k].cc || '')) slugs.set(k, 'famous:' + String(FAMOUS_C[k].cc).toLowerCase());
        for (const p of CUR) if (/^(sy|ge)$/i.test(p.countryCode || '') && !slugs.has(p.slug)) slugs.set(p.slug, 'curated:' + p.countryCode.toLowerCase());
        const dbFiles = DB.filter((d) => d.cc === 'sy' || d.cc === 'ge');
        for (const { cc, arr } of dbFiles) for (const c of arr) {
            if (!(c && c.nameAr && c.nameEn && typeof c.lat === 'number' && typeof c.lng === 'number')) continue;
            const s = makeCitySlugSrv(c.nameEn, c.lat, c.lng); if (s && !slugs.has(s)) slugs.set(s, 'db:' + cc);
            const ls = makeLegacySlug(c.nameEn); if (ls && ls !== s && !slugs.has(ls)) slugs.set(ls, 'db-legacy:' + cc);
        }
        const list = [...slugs.entries()];
        const res = { pages: 0, st: {}, elsewhere: [], diffs: [], ablDiff: new Map(), metaPairs: {} };
        let next = 0; const t0 = Date.now();
        await Promise.all(Array.from({ length: 4 }, async () => {
            while (next < list.length) {
                const [s, src] = list[next++];
                const country = /:ge$/.test(src) ? 'georgia' : 'syria';
                for (const suf of ['', '/2026', '/2026/10', '/2026/11']) {
                    const p = '/en/moon/' + country + '/' + s + suf;
                    const withAbl = suf === '' || suf === '/2026';
                    const [b, c, a] = await Promise.all([get(PORT.base, p), get(PORT.cand, p), withAbl ? get(PORT.abl, p) : Promise.resolve(null)]);
                    const key = b.st + '/' + c.st; res.st[key] = (res.st[key] || 0) + 1;
                    if (b.st !== 200) {
                        if (headF(b) !== headF(c)) res.diffs.push(p + ' ' + headF(b).slice(0, 120) + ' | ' + headF(c).slice(0, 120));
                        if (suf === '') { res.elsewhere.push(s + ' (' + src + ') ' + b.st + ' ' + locOf(b)); break; }
                        continue;
                    }
                    res.pages++;
                    const zb = zoneOf(b.b), zc = zoneOf(c.b);
                    const mk = zb + ' -> ' + zc; res.metaPairs[mk] = (res.metaPairs[mk] || 0) + 1;
                    if (headF(b) !== headF(c) || zb !== zc || noise(b.b) !== noise(c.b)) res.diffs.push(p + ' zone ' + zb + ' -> ' + zc + ' ' + firstDiff(noise(b.b), noise(c.b)).slice(0, 300));
                    if (a && zoneOf(a.b) !== zb) res.ablDiff.set(s, (res.ablDiff.get(s) || []).concat([(suf || 'hub') + ' ' + zb + ' -> ABL ' + zoneOf(a.b)]));
                }
            }
        }));
        const bySrc = {}; for (const [, v] of list) bySrc[v.split(':')[0]] = (bySrc[v.split(':')[0]] || 0) + 1;
        console.log(`   ${list.length} slugs (${JSON.stringify(bySrc)}; db files: ${dbFiles.map((d) => d.f).join(', ')}), ${res.pages} rendered pages (hub, year 2026, months 2026/10 + 2026/11) in ${Math.round((Date.now() - t0) / 1000)} s; statuses BASE/CAND ${JSON.stringify(res.st)}`);
        console.log('   zone BASE -> CAND: ' + JSON.stringify(res.metaPairs));
        console.log('   slugs of db/cities-sy that resolve to another country (no Syrian moon page of their own, same on both): ' + res.elsewhere.join(' | '));
        console.log('   ABL (no exemption) vs BASE zone: ' + [...res.ablDiff.entries()].map(([k, v]) => k + ' [' + v.join('; ') + ']').join(' | '));
        ok('[Z]', res.pages > 6000 && res.diffs.length === 0, res.pages + ' Syria / Georgia moon pages: status, Location, canonical, robots, hreflang, zone and normalised HTML identical BASE vs CAND (no remaining zone change in either country)', res.diffs.slice(0, 5).join(' ; '));
        ok('[Z]', [...res.ablDiff.keys()].sort().join(',') === 'al-quneitra,katzrin,sokhumi', 'without the exemption exactly three Syria / Georgia cities would leave production\'s zone (al-quneitra, katzrin, sokhumi): no further confirmed case reachable locally', [...res.ablDiff.keys()].sort().join(','));
        summary.push(`   [Z] ${list.length} sy/ge slugs, ${res.pages} pages: BASE vs CAND differences ${res.diffs.length}; cities the exemption holds: ${[...res.ablDiff.keys()].sort().join(', ')}`);
    }
    // ------------------------------------------------------------ [B]
    console.log('\n-- [B] headless Chrome: post-JS card, 14-day table, zone line, month calendar, year page');
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT.cdp, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--disable-extensions',
        '--proxy-server=http=127.0.0.1:9;https=127.0.0.1:9', '--proxy-bypass-list=127.0.0.1', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    let ws = null;
    for (let i = 0; i < 60 && !ws; i++) { try { const r = await fetch('http://127.0.0.1:' + PORT.cdp + '/json/new?about:blank', { method: 'PUT' }); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl; } catch (_e) { /* not up */ } if (!ws) await sleep(250); }
    if (!ws) throw new Error('chrome did not start');
    cd = await cdp(ws);
    let uncaught = [], offsite = [];
    cd.on((d) => {
        if (d.method === 'Runtime.exceptionThrown') { const e = (d.params && d.params.exceptionDetails) || {}; uncaught.push(String((e.exception && e.exception.description) || e.text || '').split('\n')[0]); }
        else if (d.method === 'Network.requestWillBeSent') { const u = String((d.params && d.params.request && d.params.request.url) || ''); if (/^https?:/.test(u) && !/^https?:\/\/127\.0\.0\.1[:/]/.test(u)) offsite.push(u); }
    });
    await cd.send('Network.enable'); await cd.send('Network.setBlockedURLs', { urls: AD_BLOCK }); await cd.send('Network.setBypassServiceWorker', { bypass: true }); await cd.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cd.send('Page.enable'); await cd.send('Runtime.enable');
    const ev = async (expr) => { const r = await cd.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
    let initId = null;
    const READ_JS = "(()=>{const g=(id)=>{const e=document.getElementById(id);return e?e.textContent.trim():null};const h=(id)=>{const e=document.getElementById(id);return e?e.innerHTML:''};const rows=[...document.querySelectorAll('#moon-forecast-body tr')];const td=document.querySelector('#moon-forecast-body tr.fc-row-today');const n=document.getElementById('moon-timezone-note');const m=document.querySelector('meta[name=\"moon.city.tz\"]');const y=document.getElementById('page-moon-year');return {phase:g('moon-phase-name'),illum:g('moon-illumination-pct'),age:g('moon-age'),rise:g('moon-rise'),set:g('moon-set'),setNote:g('moon-set-note'),zodiac:g('moon-zodiac'),hijriToday:g('moon-hijri-today'),subtitle:g('moon-subtitle'),dateBadge:g('moon-date-badge'),tzNote:(n&&!n.hidden)?n.textContent.trim():'',row0:rows[0]&&rows[0].children[0]?rows[0].children[0].textContent.trim():null,todayRow:td&&td.children[0]?td.children[0].textContent.trim():null,nRows:rows.length,hijriGreg:g('moon-hijri-greg'),meta:m?m.content:null,fcHtml:h('moon-forecast-body'),calHtml:h('moon-hub-cal'),upcoming:g('moon-upcoming-timeline'),yearText:(y&&y.offsetParent!==null)?y.innerText:null}})()";
    const EXPECT_JS = (noon, tz, lat, lng) => `(()=>{const N=${noon},tz=${JSON.stringify(tz)},la=${lat},ln=${lng};const d=new Date(N);const dp=MoonCalc.getDayPhase(d,tz);const ph=(dp&&dp.phase)||MoonCalc.getPhaseName(d);const loc=(ph.key&&typeof t==='function')?t(ph.key):ph.name;const nm=(loc&&loc!==ph.key)?loc:(ph.name||'');const mt=MoonCalc.getMoonTimes(d,la,ln,tz);let set=mt.set;try{if(mt.riseTime instanceof Date){const sb=(mt.setTime instanceof Date)&&mt.setTime.getTime()<mt.riseTime.getTime();if(sb||!(mt.setTime instanceof Date)){const t2=MoonCalc.getMoonTimes(new Date(N+86400000),la,ln,tz);if(t2&&t2.setTime instanceof Date)set=t2.set;}}}catch(e){}return {phase:((ph.icon||'')+' '+nm).trim(),illum:MoonCalc.getMoonIllumination(d)+'%',age:MoonCalc.getMoonAge(d)+' '+t('moon.days_suffix'),rise:mt.rise,set:set}})()`;
    const load = async (port, p, nowIso, visitorTz, waitFor) => {
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
        for (let i = 0; i < 50; i++) { if (await ev(waitFor || "/\\d/.test((document.getElementById('moon-illumination-pct')||{}).textContent||'')")) break; await sleep(200); }
        await sleep(600);
        return { got: await ev(READ_JS), uncaught: uncaught.slice() };
    };
    const F = ['phase', 'illum', 'age', 'rise', 'set'];
    const FALL = F.concat(['setNote', 'zodiac', 'hijriToday', 'subtitle', 'dateBadge', 'tzNote', 'row0', 'todayRow', 'nRows', 'hijriGreg', 'meta', 'fcHtml', 'calHtml', 'upcoming', 'yearText']);
    const show = (g) => g ? `${g.row0} | ${g.phase} | ${g.illum} | ${g.age} | rise ${g.rise} | set ${g.set} | rows ${g.nRows} | meta ${g.meta}` : 'null';
    const sameAll = (a, b) => FALL.filter((k) => !(a && b && a[k] === b[k]));
    // [slug, instant, language, visitor zone, note]
    const BM = [
        ['katzrin', '2026-10-19T20:59:00Z', 'en', 'Asia/Riyadh', '1 min before local midnight (Damascus = Jerusalem = +3 until 25 Oct)'],
        ['katzrin', '2026-10-19T21:01:00Z', 'ar', 'Asia/Riyadh', '1 min after local midnight'],
        ['katzrin', '2026-10-24T20:30:00Z', 'en', 'Asia/Riyadh', 'eve of the Jerusalem DST end 2026-10-25: the 14-day table spans it'],
        ['katzrin', '2026-10-25T21:30:00Z', 'en', 'Asia/Riyadh', 'first night after the Jerusalem DST end: Damascus 26 Oct 00:30 / Jerusalem 25 Oct 23:30'],
        ['katzrin', '2026-10-25T21:30:00Z', 'ar', 'America/New_York', 'same instant, visitor in New York'],
        ['katzrin', '2026-10-25T21:30:00Z', 'fr', 'Europe/Paris', 'same instant, visitor in Paris'],
        ['katzrin', '2026-10-27T21:30:00Z', 'en', 'America/New_York', 'Damascus 28 Oct 00:30 / Jerusalem 27 Oct 23:30'],
        ['katzrin', '2026-10-27T20:59:00Z', 'en', 'Asia/Riyadh', '1 min before Damascus midnight (Jerusalem 22:59)'],
        ['katzrin', '2027-03-25T21:30:00Z', 'en', 'Asia/Riyadh', 'eve of the Jerusalem DST start 2027-03-26: Damascus 26 Mar 00:30 / Jerusalem 25 Mar 23:30'],
        ['katzrin', '2027-03-27T20:59:00Z', 'ar', 'Asia/Riyadh', '1 min before local midnight after the Jerusalem DST start (both +3)'],
        ['al-quneitra', '2026-10-25T21:30:00Z', 'en', 'Asia/Riyadh', 'after the Jerusalem DST end, different dates'],
        ['al-quneitra', '2027-03-25T21:30:00Z', 'ar', 'Asia/Riyadh', 'eve of the Jerusalem DST start, different dates'],
        ['sokhumi', '2026-10-19T20:30:00Z', 'en', 'Asia/Riyadh', 'Tbilisi 20 Oct 00:30 / Moscow 19 Oct 23:30'],
        ['sokhumi', '2026-10-19T20:30:00Z', 'ar', 'Europe/Moscow', 'same instant, visitor in Moscow'],
        ['sokhumi', '2026-10-25T21:30:00Z', 'en', 'Asia/Riyadh', 'Tbilisi 26 Oct 01:30 / Moscow 26 Oct 00:30']];
    const bBad = []; let nB = 0, nDisc = 0;
    for (const [slug, T, L, V, note] of BM) {
        const E = EX_BY[slug], tMs = Date.parse(T), p = lp(L) + '/moon/' + E.country + '/' + E.slug;
        const discriminating = ymd(tMs, E.primary) !== ymd(tMs, E.other);
        const B = await load(PORT.base, p, T, V), C = await load(PORT.cand, p, T, V);
        const A = discriminating ? await load(PORT.abl, p, T, V) : null;
        const geo = geoOf((await get(PORT.cand, p)).b), want = cityDate(tMs, E.primary), noon = exactNoon(want.y, want.m, want.d, E.primary);
        await load(PORT.cand, p, T, V);
        const exp = await ev(EXPECT_JS(noon, E.primary, geo.lat, geo.lng));
        const g = C.got, bg = B.got; nB++;
        console.log(`   · ${p} at ${T} [${V}] — ${note}\n       country ${E.primary} ${ymd(tMs, E.primary)} ${hm(tMs, E.primary)} | doubtful ${E.other} ${ymd(tMs, E.other)} ${hm(tMs, E.other)}\n       engine (${E.primary}): ${dateLabel(tMs, E.primary)} | ${exp && exp.phase} | ${exp && exp.illum} | ${exp && exp.age} | rise ${exp && exp.rise} | set ${exp && exp.set}\n       BASE: ${show(bg)}\n       CAND: ${show(g)}` + (A ? `\n       ABL : ${show(A.got)}` : ''));
        const dk = sameAll(bg, g);
        ok('[B]', dk.length === 0, p + ' @' + T + ' [' + V + ']: BASE == CAND on every post-JS field (date, phase, illumination, age, rise, set, set note, zodiac, Hijri, subtitle, zone line, all ' + (g && g.nRows) + ' table rows, meta, upcoming)', dk.join(',') + ' ' + firstDiff(String(bg && bg.fcHtml), String(g && g.fcHtml)));
        ok('[B]', g && exp && F.every((k) => g[k] === exp[k]) && g.meta === E.primary && g.tzNote.includes('(' + E.primary + ')') && g.nRows === 14 && (L !== 'en' || (g.row0 === dateLabel(tMs, E.primary) && g.todayRow === dateLabel(tMs, E.primary))), p + ' @' + T + ': card == js/moon.js with ' + E.primary + ' at the noon of ' + ymd(tMs, E.primary) + '; zone line + meta ' + E.primary + (L === 'en' ? '; today row ' + dateLabel(tMs, E.primary) : ''), JSON.stringify({ g: g && { ...g, fcHtml: undefined, calHtml: undefined }, exp }));
        ok('[B]', JSON.stringify(B.uncaught.slice().sort()) === JSON.stringify(C.uncaught.slice().sort()) && C.uncaught.length === 0, p + ' @' + T + ': no uncaught exception on CAND (BASE ' + B.uncaught.length + ')', B.uncaught.join(' | ') + ' vs ' + C.uncaught.join(' | '));
        if (A) {
            nDisc++;
            ok('[B]', A.got && A.got.meta === E.other && A.got.row0 !== g.row0 && A.got.fcHtml !== g.fcHtml, p + ' @' + T + ': discriminating instant — ABL (no exemption) would show ' + (A.got && A.got.row0) + ' on ' + E.other + ' instead of ' + (g && g.row0));
        }
    }
    // month calendar + year page
    for (const [slug, rel, T, L] of [['katzrin', '/2026/10', '2026-10-25T21:30:00Z', 'en'], ['katzrin', '/2027/03', '2027-03-25T21:30:00Z', 'ar'], ['katzrin', '/2026', '2026-10-25T21:30:00Z', 'en'], ['katzrin', '/2027', '2027-03-25T21:30:00Z', 'fr'], ['al-quneitra', '/2026/10', '2026-10-27T21:30:00Z', 'en'], ['sokhumi', '/2026/10', '2026-10-19T20:30:00Z', 'en'], ['sokhumi', '/2026', '2026-10-19T20:30:00Z', 'ar']]) {
        const E = EX_BY[slug], p = lp(L) + '/moon/' + E.country + '/' + E.slug + rel, isYear = rel.split('/').length === 2;
        const wf = isYear ? "!!document.getElementById('page-moon-year')" : null;
        const B = await load(PORT.base, p, T, 'Asia/Riyadh', wf), C = await load(PORT.cand, p, T, 'Asia/Riyadh', wf);
        const dk = sameAll(B.got, C.got);
        console.log(`   · ${p} at ${T}: ${isYear ? 'year text ' + String(C.got && C.got.yearText).length + ' chars' : 'calendar ' + String(C.got && C.got.calHtml).length + ' chars, ' + show(C.got)}`);
        const wz = viaRecord(E, p) ? E.other : E.primary;
        ok('[B]', dk.length === 0 && (isYear ? (C.got.yearText || '').length > 500 && C.got.yearText.includes(wz) : C.got.meta === E.primary && C.got.calHtml.length > 500) && C.uncaught.length === 0, p + ' @' + T + ': ' + (isYear ? 'year page text after JS (incl. its "' + wz + '" zone chip)' : 'month page card + calendar after JS') + ' BASE == CAND', dk.join(',') + ' ' + firstDiff(String(B.got && (B.got.yearText || B.got.calHtml)), String(C.got && (C.got.yearText || C.got.calHtml))));
    }
    // controls in the browser: same / similar names and the same countries stay as production
    for (const [p, T] of [['/en/moon/syria/quneitra', '2026-10-25T21:30:00Z'], ['/en/moon/syria/damascus', '2026-10-25T21:30:00Z'], ['/en/moon/syria/majdal-shams', '2026-10-25T21:30:00Z'], ['/moon/syria/masade', '2027-03-25T21:30:00Z'], ['/en/moon/georgia/tbilisi', '2026-10-19T20:30:00Z'], ['/en/moon/morocco/kenitra', '2026-10-25T21:30:00Z']]) {
        const B = await load(PORT.base, p, T, 'Asia/Riyadh'), C = await load(PORT.cand, p, T, 'Asia/Riyadh');
        const dk = sameAll(B.got, C.got);
        ok('[B]', dk.length === 0 && C.got && C.got.meta && C.got.nRows === 14, 'control ' + p + ' @' + T + ': BASE == CAND after JS (' + show(C.got) + ')', dk.join(','));
    }
    // the fix still applies in the browser next to the exemption
    for (const [T, p, tz] of [['2026-10-18T19:00:00Z', '/en/moon/united-states/seattle', 'America/Los_Angeles'], ['2026-10-18T15:30:00Z', '/en/moon/indonesia/jayapura', 'Asia/Jayapura']]) {
        const tMs = Date.parse(T); await setClock(T);
        const geo = geoOf((await get(PORT.cand, p)).b);
        const B = await load(PORT.base, p, T, 'Asia/Riyadh'), C = await load(PORT.cand, p, T, 'Asia/Riyadh');
        const want = cityDate(tMs, tz), noon = exactNoon(want.y, want.m, want.d, tz), label = dateLabel(tMs, tz);
        const exp = await ev(EXPECT_JS(noon, tz, geo.lat, geo.lng));
        const g = C.got;
        console.log(`   · ${p} at ${T}: engine (${tz}) ${label} | ${exp && exp.illum} | rise ${exp && exp.rise} | set ${exp && exp.set}\n       BASE: ${show(B.got)}\n       CAND: ${show(g)}`);
        ok('[B]', g && exp && F.every((k) => g[k] === exp[k]) && g.row0 === label && g.todayRow === label && g.meta === tz && g.tzNote.includes('(' + tz + ')'), p + ': CAND card == engine with ' + tz + ' on ' + label + ' (zone fix still applies)', JSON.stringify({ got: g && { ...g, fcHtml: undefined, calHtml: undefined }, exp }));
        ok('[B]', B.got && B.got.meta !== tz, p + ': BASE still on the country zone (' + (B.got && B.got.meta) + ')');
    }
    summary.push(`   [B] ${nB} exempt-city loads (${nDisc} at instants where the country and the doubtful zone fall on different dates), month + year pages, 6 controls, 2 fixed cities`);
    const hosts = [...new Set(offsite.map((u) => { try { return new URL(u).host; } catch (_e) { return u; } }))];
    console.log('   off-127.0.0.1 requests attempted by the pages (unresolvable: host-resolver MAP * ~NOTFOUND + dead proxy; ads blocked): ' + (hosts.join(', ') || 'none'));
    if (cd) cd.close();
} finally {
    for (const k of [kB, kC, kP, kA]) { try { if (k && k.exitCode === null) k.kill(); } catch (_) { /* gone */ } }
    if (chrome) { try { chrome.kill(); } catch (_) { /* gone */ } }
}
console.log('\n-- summary');
for (const s of summary) console.log(s);
console.log('\n-- per point: ' + Object.entries(G).map(([g, v]) => g + ' ' + v.p + '/' + (v.p + v.f)).join('  '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
