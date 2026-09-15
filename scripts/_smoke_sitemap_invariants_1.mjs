// INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 (Phase 1) — sitemap invariants smoke.
//
// Every <loc> the site publishes (robots.txt Sitemap lines → sitemap index → children, + sitemap-quran) must be a
// real, indexable, self-canonical, unique, clean URL. This suite proves it statically on ALL <loc>s and over HTTP on
// a deterministic sample (or on every loc in full mode).
//
//   [D] discovery: robots.txt Sitemap lines, index recursion, every file 200 / application/xml / <50MB / <50k urls,
//       well-formed urlset (one <loc> per <url>), index children = main + city shards, next shard number → 404
//   [C] exact loc SETS and counts vs the set computed from the data files (curated-places.json, curated-slugs.json,
//       umm-al-qura.json, guides-content.js, surah-routes.json + the server.js literals FAMOUS_CITY_OVERRIDES /
//       COUNTRY_NAMES_EN / COUNTRY_SLUG_OVERRIDES / SITEMAP_URL_BUDGET), + today's snapshot 7,430 / 168,590 / 115 / 176,135
//   [U] uniqueness within each file and across files
//   [P] path hygiene: https apex, no query / # / .html / '.' / '//' / % / uppercase / whitespace / non-canonical
//       trailing slash, no /ar/ prefix, loc === origin + pathname
//   [K] slug policy: no coordinate or loc- slug, no curated redirect-key slug (a live curated slug is exempt —
//       the server drops that key at boot; today only 'singapore'), no SAR/country-code prayer slug, 0 'singapore-city'
//   [M] moon: no day URL, no legacy flat URL, nested year/month years == UTC year ±1, inside the supported range (±5)
//   [J] Hijri: calendar years == current Hijri year (Asia/Riyadh date, table-driven) ±1, hijri-date == current year only
//   [G] Singapore / countries: no /prayer-times-in-X in both sitemap-main and a shard; singapore is a city (4 families
//       × 10 locales, once each, in a shard), never a country; named country samples are listed
//   [Q] Quran: only in sitemap-quran, 0 alternates, ar-only paths
//   [R] hreflang: 11 alternates (10 locales + x-default = ar), self entry === loc, prefixes match, every alternate is
//       itself a <loc>, groups reciprocal (the 10 members of a group carry the identical group)
//   [L] lastmod policy: only sitemap-quran (2026-07-22) and /[lang/]privacy + /[lang/]terms (2026-08-09, = the
//       LEGAL_PAGES legal-meta literal); index children none; never the request day
//   [H] HTTP per sampled loc (redirect: manual, read until </head>): 200, no Location, text/html, exactly one meta
//       robots with index and without noindex, no X-Robots-Tag noindex, exactly one canonical === loc, head hreflang
//       map === sitemap alternates, <html lang> === URL locale, not the 404 template
//   [B] base comparison (TP_BASE_ROOT booted here, or TP_BASE_URL on loopback): robots.txt + sitemap-quran.xml
//       byte-identical (same ETag / Last-Modified, 304 on If-None-Match); same index children; every <url> block
//       identical once <lastmod> lines are removed, except the approved removals in sitemap-main (115 Quran URLs +
//       10 /[lang/]prayer-times-in-singapore country URLs). Without a base these checks FAIL unless
//       SITEMAP_INV_NO_BASE=1 disables them explicitly (used when the target IS the base).
//
// Usage:
//   TP_BASE_ROOT=<base checkout> node scripts/_smoke_sitemap_invariants_1.mjs
//   env: SITEMAP_INV_MODE=sample (default) | full      SITEMAP_INV_ROOT=<tree to boot> (default: this checkout)
//        SITEMAP_INV_PORT (default 8851)  SITEMAP_INV_BASE_PORT (default 8852)  — both must be within 8851-8859
//        WEB_CONCURRENCY passthrough (default 8, full 16)   SITEMAP_INV_FAILS_CSV=<path>   SITEMAP_INV_SNAPSHOT=0
// Local servers only: every request goes to 127.0.0.1; a sitemap/loc on any other origin is a failure, never fetched.
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { StringDecoder } from 'node:string_decoder';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET_ROOT = path.resolve(process.env.SITEMAP_INV_ROOT || ROOT);
const MODE = String(process.env.SITEMAP_INV_MODE || 'sample').toLowerCase();
const PORT = Number(process.env.SITEMAP_INV_PORT || 8851);
const BASE_PORT = Number(process.env.SITEMAP_INV_BASE_PORT || 8852);
const WEB_CONCURRENCY = String(process.env.WEB_CONCURRENCY || (MODE === 'full' ? '16' : '8'));
const BASE_WEB_CONCURRENCY = '2';   // the base only serves robots.txt + the sitemap files
const HTTP_CONCURRENCY = MODE === 'full' ? 32 : 16;
const BASE_ROOT = process.env.TP_BASE_ROOT ? path.resolve(process.env.TP_BASE_ROOT) : null;
const BASE_URL = process.env.TP_BASE_URL || null;
const NO_BASE = process.env.SITEMAP_INV_NO_BASE === '1';
const FAILS_CSV = process.env.SITEMAP_INV_FAILS_CSV || '';
const SNAPSHOT = process.env.SITEMAP_INV_SNAPSHOT !== '0';

const SITE = 'https://timesprayers.com';
const LOCALES = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const SNAP = { main: 7430, shards: 168590, quran: 115, total: 176135, shardFiles: 23 };   // 2026-09-15 snapshot
const QURAN_LASTMOD = '2026-07-22';
const LEGAL_LASTMOD = '2026-08-09';
const MAX_BYTES = 50 * 1024 * 1024;
const MAX_URLS = 50000;
// sitemap-main static block (approved policy — the order the server emits them in)
const STATIC_PATHS = ['/', '/qibla', '/moon', '/zakat-calculator', '/azkar', '/azkar/morning-azkar', '/azkar/evening-azkar',
    '/azkar/prayer-azkar', '/msbaha', '/date-converter', '/today-hijri-date', '/prayer-times-worldwide', '/about-us',
    '/contact', '/privacy', '/terms'];
const PRAYER_CITY_ONLY_COUNTRY = { sg: 'singapore' };   // D6/D7: singapore is a curated CITY on the prayer route
const PRAYER_CC_REDIRECT_CODES = ['mo', 'hk', 'tw', 'lv', 'lt', 'cy', 'is', 'ee', 'me'];   // /prayer-times-in-{code} → 301
const SAMPLE_COUNTRIES = ['saudi-arabia', 'cote-d-ivoire', 'united-arab-emirates'];
const SAMPLE_MOON_CITIES_REQUIRED = ['riyadh', 'singapore'];
const SAMPLE_MOON_CITIES_OPTIONAL = ['makkah'];   // not a FAMOUS_CITY_OVERRIDES key → no moon locs by design
const CITY_FAMILIES = ['prayer-times-in', 'qibla-in', 'time-left-until-next-prayer-in', 'next-prayer-in'];
const COORD_TAIL_RE = /-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/;

if (MODE !== 'sample' && MODE !== 'full') { console.error('SITEMAP_INV_MODE must be sample or full'); process.exit(2); }
for (const p of [PORT, BASE_PORT]) if (!(Number.isInteger(p) && p >= 8851 && p <= 8859)) { console.error('ports must be within 8851-8859: ' + p); process.exit(2); }
if (PORT === BASE_PORT) { console.error('SITEMAP_INV_PORT and SITEMAP_INV_BASE_PORT must differ'); process.exit(2); }

// ─────────────────────────────── reporting ───────────────────────────────
let pass = 0, fail = 0; const fails = []; const csvRows = [];
function ok(label, cond, name, detail) {
    const n = '[' + label + '] ' + name;
    if (cond) { pass++; console.log('  ✓ ' + n); }
    else { fail++; fails.push(n + (detail ? ' :: ' + detail : '')); console.log('  ✗ ' + n + (detail ? '  :: ' + detail : '')); if (!csvRows.some(r => r[0] === label && r[1] === name)) csvRows.push([label, name, '', detail || '']); }
}
// aggregated per-URL check: one PASS/FAIL line, every bad URL goes to the CSV
function agg(label, name) {
    const bad = []; let n = 0;
    return {
        test(url, cond, detail) { n++; if (!cond) bad.push([url, detail == null ? '' : String(detail)]); },
        get bad() { return bad; },
        done(suffix, allowEmpty) {
            for (const [u, d] of bad) csvRows.push([label, name, u, d]);
            const ex = bad.slice(0, 6).map(([u, d]) => u + (d ? ' (' + d + ')' : '')).join(' ; ');
            ok(label, bad.length === 0 && (n > 0 || !!allowEmpty), name + ' — ' + (n - bad.length) + '/' + n + (suffix || ''), bad.length ? bad.length + ' bad, e.g. ' + ex : (n === 0 ? 'nothing checked' : ''));
        },
    };
}
const info = (s) => console.log('  · INFO ' + s);
const section = (s) => console.log('\n-- ' + s + ' --');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const setDiff = (a, b) => [...a].filter(x => !b.has(x));
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');
const xmlUnescape = (s) => String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const htmlUnescape = (s) => String(s).replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// ─────────────────────────────── URL helpers ───────────────────────────────
function locFor(rel, l) {
    if (l === 'ar') return SITE + rel;
    return SITE + '/' + l + (rel === '/' ? '' : rel);
}
function splitLocale(pathname) {
    const m = pathname.match(/^\/(en|fr|tr|ur|de|id|es|bn|ms)(\/.*)?$/);
    return m ? { locale: m[1], rel: m[2] || '/' } : { locale: 'ar', rel: pathname };
}
function pathOf(loc) { return loc.startsWith(SITE) ? (loc.slice(SITE.length) || '/') : null; }
// slug-bearing families → { family, slug }
function slugOf(rel) {
    let m = rel.match(/^\/(prayer-times-in|qibla-in|time-left-until-next-prayer-in|next-prayer-in)-(.+)$/);
    if (m) return { family: m[1], slug: m[2] };
    m = rel.match(/^\/moon\/([^/]+)\/([^/]+)(?:\/.*)?$/);
    if (m) return { family: 'moon-city', slug: m[2], country: m[1] };
    m = rel.match(/^\/moon\/([^/]+)$/);
    if (m) return { family: 'moon-country', slug: m[1] };
    return null;
}
const isQuranRel = (rel) => /^\/quran(?:\/|$)/.test(rel);

// ─────────────────────────────── expectation from data ───────────────────────────────
function extractObjectLiteral(src, name) {
    const m = new RegExp('(?:const|let|var)\\s+' + name + '\\s*=\\s*\\{').exec(src);
    if (!m) throw new Error('object literal not found in server.js: ' + name);
    const start = m.index + m[0].length - 1; let depth = 0;
    for (let i = start; i < src.length; i++) {
        const c = src[i], n = src[i + 1];
        if (c === '/' && n === '/') { i = src.indexOf('\n', i); if (i < 0) break; continue; }
        if (c === '/' && n === '*') { i = src.indexOf('*/', i + 2) + 1; continue; }
        if (c === '"' || c === "'" || c === '`') { const q = c; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; } continue; }
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return vm.runInNewContext('(' + src.slice(start, i + 1) + ')', Object.create(null)); }
    }
    throw new Error('unbalanced object literal: ' + name);
}
function isPrayerTimesReady(p) {   // mirrors server.js _isPrayerTimesReady (the sitemap city source filter)
    if (!p || typeof p !== 'object') return false;
    if (typeof p.slug !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.slug)) return false;
    if (typeof p.countryCode !== 'string' || !/^[a-z]{2}$/.test(p.countryCode)) return false;
    const lat = Number(p.lat), lng = Number(p.lng);
    if (!isFinite(lat) || lat < -90 || lat > 90) return false;
    if (!isFinite(lng) || lng < -180 || lng > 180) return false;
    if (typeof p.timezone !== 'string' || !p.timezone) return false;
    if (!p.names || typeof p.names !== 'object') return false;
    return true;
}
function g2jd(year, month, day) {
    if (month <= 2) { year--; month += 12; }
    const A = Math.floor(year / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524;
}
function hijriFromTable(table, y, m, d) {
    const jd = g2jd(y, m, d);
    for (const [k, v] of Object.entries(table.years)) {
        const [sy, sm, sd] = v.yearStart.split('-').map(Number);
        const s = g2jd(sy, sm, sd);
        const len = typeof v.yearLength === 'number' ? v.yearLength : v.months.reduce((a, b) => a + b, 0);
        if (jd >= s && jd < s + len) {
            let c = s;
            for (let i = 0; i < 12; i++) { if (jd < c + v.months[i]) return { year: Number(k), month: i + 1, day: jd - c + 1 }; c += v.months[i]; }
        }
    }
    return null;
}
const ymdIn = (tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

function buildExpectation(root) {
    const req = createRequire(import.meta.url);
    const src = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const FAMOUS = extractObjectLiteral(src, 'FAMOUS_CITY_OVERRIDES');
    const CN = extractObjectLiteral(src, 'COUNTRY_NAMES_EN');
    const OV = extractObjectLiteral(src, 'COUNTRY_SLUG_OVERRIDES');
    let MANUAL = {};
    try { MANUAL = extractObjectLiteral(src, '_MANUAL_PROMOTED_REDIRECTS'); } catch (_) { MANUAL = {}; }
    const bm = src.match(/const SITEMAP_URL_BUDGET = (\d+);/);
    if (!bm) throw new Error('SITEMAP_URL_BUDGET not found in server.js');
    const BUDGET = Number(bm[1]);
    const legalDates = [...src.matchAll(/class="legal-meta">[^<]*?(\d{4}-\d{2}-\d{2})</g)].map(x => x[1]);
    const countrySlug = (cc) => OV[cc] || (CN[cc] ? CN[cc].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '');

    const places = JSON.parse(fs.readFileSync(path.join(root, 'db', 'places', 'curated-places.json'), 'utf8')).filter(isPrayerTimesReady);
    const slugs = [...new Set(places.map(p => p.slug))];
    const curatedSet = new Set(slugs);
    const ccs = [...new Set(places.map(p => p.countryCode.toLowerCase()))];
    const curatedSlugsJson = JSON.parse(fs.readFileSync(path.join(root, 'db', 'curated-slugs.json'), 'utf8'));
    const redirectKeys = [...new Set([...Object.keys(curatedSlugsJson.redirects || {}), ...Object.keys(MANUAL)])];
    const exemptKeys = redirectKeys.filter(k => curatedSet.has(k)).sort();
    const blockedSlugs = new Set(redirectKeys.filter(k => !curatedSet.has(k)));
    const guideSlugs = Object.keys(req(path.join(root, 'js', 'guides-content.js')).GUIDES);
    const hijriTable = JSON.parse(fs.readFileSync(path.join(root, 'db', 'hijri', 'umm-al-qura.json'), 'utf8'));
    const quranRoutes = JSON.parse(fs.readFileSync(path.join(root, 'data', 'quran', 'tanzil-uthmani-1-1', 'metadata', 'surah-routes.json'), 'utf8')).surahs;

    // moon window (UTC) + supported range
    const Y = new Date().getUTCFullYear();
    const moonMin = Math.max(1900, Y - 5), moonMax = Math.min(2100, Y + 5);
    const moonYears = [Y - 1, Y, Y + 1].filter(y => y >= moonMin && y <= moonMax);
    // Hijri "now" = Asia/Riyadh civil date through the Umm al-Qura table
    const [ry, rm, rd] = ymdIn('Asia/Riyadh').split('-').map(Number);
    const hNow = hijriFromTable(hijriTable, ry, rm, rd);
    if (!hNow) throw new Error('current Hijri date outside umm-al-qura.json');
    const hInRange = (y) => y >= hijriTable.range.startYear && y <= hijriTable.range.endYear;
    const hMonthDays = (y, m) => (hInRange(y) && hijriTable.years[String(y)] && hijriTable.years[String(y)].months[m - 1]) || 0;

    const pad2 = (n) => String(n).padStart(2, '0');
    const all10 = (rel) => LOCALES.map(l => locFor(rel, l));
    const main = [];
    for (const p of STATIC_PATHS) main.push(...all10(p));
    main.push(...all10('/guides'));
    for (const g of guideSlugs) main.push(...all10('/guides/' + g));
    const prayerCountrySlugs = [], moonCountrySlugs = [];
    for (const cc of ccs) {
        if (OV[cc]) continue;
        const s = countrySlug(cc); if (!s) continue;
        if (PRAYER_CITY_ONLY_COUNTRY[cc] === s && curatedSet.has(s)) continue;
        prayerCountrySlugs.push(s); main.push(...all10('/prayer-times-in-' + s));
    }
    for (const cc of ccs) {
        if (OV[cc]) continue;
        const s = countrySlug(cc); if (!s) continue;
        moonCountrySlugs.push(s); main.push(...all10('/moon/' + s));
    }
    const hijriCalYears = [hNow.year - 1, hNow.year, hNow.year + 1].filter(hInRange);
    for (const hy of hijriCalYears) {
        main.push(...all10('/hijri-calendar/' + hy));
        for (let m = 1; m <= 12; m++) if (hMonthDays(hy, m)) main.push(...all10('/hijri-calendar/' + hy + '-' + pad2(m)));
    }
    let hijriDayCount = 0;
    if (hInRange(hNow.year)) for (let m = 1; m <= 12; m++) for (let d = 1; d <= hMonthDays(hNow.year, m); d++) { hijriDayCount++; main.push(...all10('/hijri-date/' + hNow.year + '-' + pad2(m) + '-' + pad2(d))); }

    // city shards: same chunking as server.js (_estCityUrlCount + SITEMAP_URL_BUDGET) and the same emission gates
    const baseOf = (s) => FAMOUS[s] ? s : ((s.match(/^([a-z][a-z0-9-]+?)-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/) || [])[1] || null);
    const est = (s) => { let n = 20; if (!COORD_TAIL_RE.test(s)) n += 20; const b = baseOf(s); if (b && FAMOUS[b]) { n += 20; n += 130 * moonYears.length; } return n; };
    const chunkSlugs = []; let cur = [], curCount = 0;
    for (const s of slugs) { const c = est(s); if (cur.length > 0 && curCount + c > BUDGET) { chunkSlugs.push(cur); cur = []; curCount = 0; } cur.push(s); curCount += c; }
    if (cur.length) chunkSlugs.push(cur);
    const famousEmitted = [];
    const chunks = chunkSlugs.map(list => {
        const out = [];
        for (const s of list) {
            out.push(...all10('/prayer-times-in-' + s));
            out.push(...all10('/qibla-in-' + s));
            if (!COORD_TAIL_RE.test(s)) { out.push(...all10('/time-left-until-next-prayer-in-' + s)); out.push(...all10('/next-prayer-in-' + s)); }
            const b = baseOf(s);
            if (b && FAMOUS[b]) {
                const cs = countrySlug(String(FAMOUS[b].cc || '').toLowerCase());
                if (cs) {
                    famousEmitted.push(b);
                    out.push(...all10('/moon/' + cs + '/' + b));
                    out.push(...all10('/moon/' + cs + '/' + b + '/today'));
                    for (const yy of moonYears) { out.push(...all10('/moon/' + cs + '/' + b + '/' + yy)); for (let mm = 1; mm <= 12; mm++) out.push(...all10('/moon/' + cs + '/' + b + '/' + yy + '/' + pad2(mm))); }
                }
            }
        }
        return out;
    });
    const quran = [SITE + '/quran', ...quranRoutes.map(r => SITE + r.path)];
    const shardTotal = chunks.reduce((a, c) => a + c.length, 0);
    return { main, chunks, quran, shardTotal, total: main.length + shardTotal + quran.length, curatedSet, redirectKeys, exemptKeys, blockedSlugs,
        legalDates, Y, moonMin, moonMax, moonYears, hNow, hijriCalYears, hijriDayCount, hMonthDays, prayerCountrySlugs, moonCountrySlugs,
        famousEmitted, guideSlugs, slugCount: slugs.length, riyadhYmd: ymdIn('Asia/Riyadh'), utcYmd: new Date().toISOString().slice(0, 10) };
}

// ─────────────────────────────── servers + HTTP ───────────────────────────────
const agent = new http.Agent({ keepAlive: true, maxSockets: 96 });
// GET 127.0.0.1:<port><p>. headUntil → stop once the cleaned text contains </head> (body = text so far).
function request(port, p, { headers = {}, headUntil = false, timeoutMs = 180000 } = {}) {
    return new Promise((resolve) => {
        let settled = false; const done = (v) => { if (!settled) { settled = true; resolve(v); } };
        const req = http.request({ host: '127.0.0.1', port, path: p, method: 'GET', agent,
            headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'tp-sitemap-invariants/1', ...headers } }, (res) => {
            const enc = String(res.headers['content-encoding'] || '').toLowerCase();
            let stream = res;
            if (enc === 'gzip') stream = res.pipe(zlib.createGunzip()); else if (enc === 'br') stream = res.pipe(zlib.createBrotliDecompress());
            const chunks = []; const dec = new StringDecoder('utf8'); let text = '';
            stream.on('data', (c) => {
                if (!headUntil) { chunks.push(c); return; }
                text += dec.write(c);
                if (/<\/head\s*>/i.test(text) && /<\/head\s*>/i.test(stripNonMarkup(text))) {
                    done({ status: res.statusCode, headers: res.headers, body: text, complete: false });
                    req.destroy();
                }
            });
            stream.on('end', () => done(headUntil ? { status: res.statusCode, headers: res.headers, body: text + dec.end(), complete: true }
                : { status: res.statusCode, headers: res.headers, raw: Buffer.concat(chunks), complete: true }));
            stream.on('error', (e) => done({ status: res.statusCode, headers: res.headers, body: text, raw: Buffer.concat(chunks), err: e.message }));
        });
        req.on('error', (e) => done({ status: 0, headers: {}, body: '', raw: Buffer.alloc(0), err: e.message }));
        req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout ' + timeoutMs + 'ms')));
        req.end();
    });
}
async function boot(root, port, workers) {
    const pre = await request(port, '/health', { timeoutMs: 2000 });
    if (pre.status !== 0) throw new Error('port ' + port + ' is already serving (status ' + pre.status + ') — refusing to test a foreign server');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: workers, SITE_URL: SITE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' };
    delete env.TP_ENABLE_SEARCH_TEST; delete env.TP_MOON_RANGE_TEST_NOW;
    const child = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'pipe'] });
    let errTail = ''; child.stderr.on('data', (d) => { errTail = (errTail + d).slice(-3000); });
    let exited = null; child.on('exit', (c) => { exited = c; });
    for (let i = 0; i < 400; i++) {
        if (exited !== null) break;
        const r = await request(port, '/health', { timeoutMs: 3000 });
        if (r.status === 200) return child;
        await sleep(500);
    }
    stop(child);
    throw new Error('server did not become healthy: ' + root + ' :' + port + (exited !== null ? ' (exited ' + exited + ')' : '') + ' stderr: ' + errTail.slice(-600));
}
function stop(child) {
    if (!child || child.__stopped) return; child.__stopped = true;
    if (process.platform === 'win32') { try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) { try { child.kill(); } catch (_) { } } }
    else { try { child.kill('SIGKILL'); } catch (_) { } }
}

// ─────────────────────────────── sitemap discovery + parsing ───────────────────────────────
const attrsOf = (tag) => { const o = {}; for (const m of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) { const k = m[1].toLowerCase(); if (!(k in o)) o[k] = m[2] != null ? m[2] : m[3]; } return o; };
const stripLastmod = (block) => block.replace(/\n[ \t]*<lastmod>[^<]*<\/lastmod>/g, '');

// light=true keeps only per-file loc → block hash (base comparison)
async function discover(port, { light = false, keepHashes = false } = {}) {
    const out = { robots: null, files: [], entries: [], groups: [], groupByKey: new Map(), foreign: [], dupFileRefs: [], singaporeCityHits: {} };
    const robots = await request(port, '/robots.txt');
    const robotsText = robots.raw.toString('utf8');
    out.robots = { status: robots.status, raw: robots.raw, lines: robotsText.split(/\r?\n/).map(l => l.match(/^Sitemap:\s*(\S+)\s*$/i)).filter(Boolean).map(m => m[1]) };
    out.singaporeCityHits['/robots.txt'] = robotsText.split('singapore-city').length - 1;
    const queue = out.robots.lines.map(u => ({ url: u, from: 'robots.txt' }));
    const seen = new Set();
    while (queue.length) {
        const { url, from } = queue.shift();
        if (seen.has(url)) { out.dupFileRefs.push(url + ' (from ' + from + ')'); continue; }
        seen.add(url);
        if (!url.startsWith(SITE + '/')) { out.foreign.push(url + ' (from ' + from + ')'); continue; }   // never fetched
        const p = url.slice(SITE.length);
        const r = await request(port, p);
        const text = r.raw.toString('utf8');
        const f = { url, path: p, from, status: r.status, ctype: String(r.headers['content-type'] || ''), etag: r.headers['etag'] || null,
            lastModified: r.headers['last-modified'] || null, raw: null, bytes: r.raw.length, kind: 'unknown', children: [], childLastmods: 0,
            urlOpen: 0, urlClose: 0, locTags: 0, urls: 0, lastmodTags: 0, hashes: keepHashes ? new Map() : null, locs: [] };
        out.singaporeCityHits[p] = text.split('singapore-city').length - 1;
        if (p === '/sitemap-quran.xml') f.raw = r.raw;
        if (/<sitemapindex\b/.test(text)) {
            f.kind = 'index';
            for (const m of text.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)) {
                const lm = m[1].match(/<loc>([^<]*)<\/loc>/);
                if (lm) { const child = xmlUnescape(lm[1].trim()); f.children.push(child); queue.push({ url: child, from: p }); }
                f.childLastmods += (m[1].match(/<lastmod>/g) || []).length;
            }
            f.urls = f.children.length;
        } else if (/<urlset\b/.test(text)) {
            f.kind = 'urlset';
            f.nsOk = /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(text);
            f.urlOpen = (text.match(/<url>/g) || []).length;
            f.urlClose = (text.match(/<\/url>/g) || []).length;
            f.locTags = (text.match(/<loc>/g) || []).length;
            f.lastmodTags = (text.match(/<lastmod>/g) || []).length;
            const fi = out.files.length;
            for (const m of text.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
                const block = m[1];
                const locMs = [...block.matchAll(/<loc>([^<]*)<\/loc>/g)];
                const loc = locMs.length ? xmlUnescape(locMs[0][1].trim()) : '';
                f.urls++;
                f.locs.push(loc);
                if (f.hashes) f.hashes.set(loc, sha1(stripLastmod(block)));
                if (light) continue;
                const lastmods = [...block.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map(x => x[1]);
                const pairs = [], rels = [];
                for (const lk of block.matchAll(/<xhtml:link\b([^>]*?)\/?>/g)) { const a = attrsOf(lk[1]); pairs.push([a.hreflang || '', xmlUnescape(a.href || '')]); rels.push(a.rel || ''); }
                const key = pairs.map(x => x[0] + '=' + x[1]).sort().join('\n') + '|' + rels.join(',');
                let gid = out.groupByKey.get(key);
                if (gid === undefined) { gid = out.groups.length; out.groupByKey.set(key, gid); out.groups.push({ id: gid, pairs, rels, members: [] }); }
                out.groups[gid].members.push(loc);
                out.entries.push({ loc, fi, lastmods, gid, nLoc: locMs.length });
            }
        }
        out.files.push(f);
    }
    return out;
}

// ─────────────────────────────── static invariants ───────────────────────────────
function staticChecks(A, E) {
    const files = A.files;
    const byPath = new Map(files.map(f => [f.path, f]));
    const index = byPath.get('/sitemap.xml');
    const main = byPath.get('/sitemap-main.xml');
    const quran = byPath.get('/sitemap-quran.xml');
    const shards = files.filter(f => /^\/sitemap-cities-\d+\.xml$/.test(f.path)).sort((a, b) => Number(a.path.match(/\d+/)[0]) - Number(b.path.match(/\d+/)[0]));
    const fileKind = (f) => f === main ? 'main' : f === quran ? 'quran' : /sitemap-cities-/.test(f.path) ? 'shard' : 'other';

    section('[D] discovery: robots.txt → index → children; per-file limits');
    ok('D', A.robots.status === 200, 'robots.txt → 200');
    ok('D', JSON.stringify(A.robots.lines) === JSON.stringify([SITE + '/sitemap.xml', SITE + '/sitemap-quran.xml']),
        'robots.txt Sitemap lines === [' + SITE + '/sitemap.xml, ' + SITE + '/sitemap-quran.xml]', JSON.stringify(A.robots.lines));
    ok('D', A.foreign.length === 0, 'no sitemap reference on a foreign origin (none fetched)', A.foreign.join(', '));
    ok('D', A.dupFileRefs.length === 0, 'no sitemap file referenced twice', A.dupFileRefs.join(', '));
    ok('D', !!index && index.kind === 'index', '/sitemap.xml is a <sitemapindex>');
    ok('D', !!main && main.kind === 'urlset' && !!quran && quran.kind === 'urlset', 'sitemap-main.xml and sitemap-quran.xml are <urlset>s');
    const expShardNames = E ? E.chunks.map((_, i) => SITE + '/sitemap-cities-' + (i + 1) + '.xml') : [];
    if (index) {
        ok('D', E && JSON.stringify(index.children) === JSON.stringify([SITE + '/sitemap-main.xml', ...expShardNames]),
            'index children === [sitemap-main, sitemap-cities-1..' + (E ? E.chunks.length : '?') + '] (computed chunking)', index.children.length + ' children: ' + index.children.slice(0, 3).join(', ') + ' …');
        ok('D', index.childLastmods === 0, 'index children carry no <lastmod>', index.childLastmods + ' <lastmod>');
    }
    if (SNAPSHOT) ok('D', shards.length === SNAP.shardFiles, 'snapshot: ' + SNAP.shardFiles + ' city shard files', String(shards.length));
    const perFile = { status: agg('D', 'every sitemap file → HTTP 200'), ctype: agg('D', 'every sitemap file Content-Type application/xml'),
        size: agg('D', 'every sitemap file uncompressed < 50MB'), count: agg('D', 'every sitemap file < 50,000 entries'),
        wf: agg('D', 'every urlset well-formed (sitemaps 0.9 ns, <url> === </url> === <loc> === parsed urls)') };
    let largest = 0;
    for (const f of files) {
        perFile.status.test(f.path, f.status === 200, f.status);
        perFile.ctype.test(f.path, /^application\/xml\b/.test(f.ctype), f.ctype);
        perFile.size.test(f.path, f.bytes < MAX_BYTES, f.bytes);
        perFile.count.test(f.path, f.urls < MAX_URLS, f.urls);
        if (f.kind === 'urlset') perFile.wf.test(f.path, f.nsOk && f.urlOpen === f.urlClose && f.urlClose === f.locTags && f.locTags === f.urls, JSON.stringify({ ns: f.nsOk, open: f.urlOpen, close: f.urlClose, loc: f.locTags, urls: f.urls }));
        largest = Math.max(largest, f.bytes);
    }
    Object.values(perFile).forEach(a => a.done());
    info('files=' + files.length + ' | largest=' + (largest / 1048576).toFixed(2) + 'MB | shards=' + shards.length);
    const oneLoc = agg('D', 'every <url> has exactly one <loc>');
    for (const e of A.entries) oneLoc.test(e.loc || '(empty)', e.nLoc === 1, e.nLoc);
    oneLoc.done();

    section('[U] uniqueness within and across files');
    const firstFile = new Map(); const dupWithin = [], dupAcross = [];
    for (const e of A.entries) {
        if (!firstFile.has(e.loc)) { firstFile.set(e.loc, e.fi); continue; }
        const f0 = firstFile.get(e.loc);
        if (f0 === e.fi) dupWithin.push(e.loc + ' in ' + files[e.fi].path); else dupAcross.push(e.loc + ' in ' + files[f0].path + ' + ' + files[e.fi].path);
    }
    for (const d of dupWithin) csvRows.push(['U', 'no duplicate <loc> within a file', d, '']);
    for (const d of dupAcross) csvRows.push(['U', 'no duplicate <loc> across files', d, '']);
    ok('U', dupWithin.length === 0, 'no duplicate <loc> within a file', dupWithin.length + ' dup, e.g. ' + dupWithin.slice(0, 4).join(' ; '));
    ok('U', dupAcross.length === 0, 'no duplicate <loc> across files', dupAcross.length + ' dup, e.g. ' + dupAcross.slice(0, 4).join(' ; '));
    ok('U', A.entries.length === firstFile.size, 'total entries === unique <loc>s (' + A.entries.length + ' vs ' + firstFile.size + ')');

    section('[C] exact loc sets + counts vs data files' + (SNAPSHOT ? ' + 2026-09-15 snapshot' : ''));
    const locsOf = (f) => f ? f.locs : [];
    const shardTotal = shards.reduce((a, f) => a + f.urls, 0);
    const total = (main ? main.urls : 0) + shardTotal + (quran ? quran.urls : 0);
    if (E) {
        info('data: curated slugs=' + E.slugCount + ' | famous moon cities emitted=' + E.famousEmitted.length + ' | prayer countries=' + E.prayerCountrySlugs.length + ' | moon countries=' + E.moonCountrySlugs.length
            + ' | guides=' + E.guideSlugs.length + ' | Hijri now ' + E.hNow.year + '-' + E.hNow.month + '-' + E.hNow.day + ' (Riyadh ' + E.riyadhYmd + ') days=' + E.hijriDayCount + ' | moon years ' + E.moonYears.join(',') + ' in [' + E.moonMin + ',' + E.moonMax + ']');
        const cmpSet = (label, got, exp) => {
            const g = new Set(got), x = new Set(exp);
            const missing = setDiff(x, g), extra = setDiff(g, x);
            for (const u of missing) csvRows.push(['C', label + ' (missing)', u, '']);
            for (const u of extra) csvRows.push(['C', label + ' (extra)', u, '']);
            ok('C', missing.length === 0 && extra.length === 0 && got.length === exp.length, label + ' — got ' + got.length + ', expected ' + exp.length,
                'missing ' + missing.length + ' (e.g. ' + missing.slice(0, 3).join(', ') + ') extra ' + extra.length + ' (e.g. ' + extra.slice(0, 3).join(', ') + ')');
        };
        cmpSet('sitemap-main loc set === computed (static + guides + countries − singapore + moon countries + Hijri ±1 + hijri-date)', locsOf(main), E.main);
        ok('C', shards.length === E.chunks.length, 'city shard file count === computed chunking (' + E.chunks.length + ')', String(shards.length));
        const shardAgg = agg('C', 'every sitemap-cities-N loc set === computed chunk N (prayer/qibla/time-left/next-prayer + famous moon hub/today/years/months)');
        for (let i = 0; i < Math.max(shards.length, E.chunks.length); i++) {
            const got = shards[i] ? shards[i].locs : []; const exp = E.chunks[i] || [];
            const g = new Set(got), x = new Set(exp);
            const missing = setDiff(x, g), extra = setDiff(g, x);
            shardAgg.test('/sitemap-cities-' + (i + 1) + '.xml', missing.length === 0 && extra.length === 0 && got.length === exp.length,
                'got ' + got.length + ' exp ' + exp.length + ' missing ' + missing.slice(0, 2).join(',') + ' extra ' + extra.slice(0, 2).join(','));
        }
        shardAgg.done();
        cmpSet('sitemap-quran loc set === /quran + surah-routes.json (' + E.quran.length + ')', locsOf(quran), E.quran);
        ok('C', main && main.urls === E.main.length, 'sitemap-main count === computed ' + E.main.length, String(main && main.urls));
        ok('C', shardTotal === E.shardTotal, 'city shards total === computed ' + E.shardTotal, String(shardTotal));
        ok('C', total === E.total, 'all sitemaps total === computed ' + E.total, String(total));
    } else {
        ok('C', false, 'computed expectation available', 'expectation could not be built from the target data');
    }
    if (SNAPSHOT) {
        ok('C', main && main.urls === SNAP.main, 'snapshot: sitemap-main === ' + SNAP.main.toLocaleString('en'), String(main && main.urls));
        ok('C', shardTotal === SNAP.shards, 'snapshot: city shards total === ' + SNAP.shards.toLocaleString('en'), String(shardTotal));
        ok('C', quran && quran.urls === SNAP.quran, 'snapshot: sitemap-quran === ' + SNAP.quran, String(quran && quran.urls));
        ok('C', total === SNAP.total && firstFile.size === SNAP.total, 'snapshot: ' + SNAP.total.toLocaleString('en') + ' entries === ' + SNAP.total.toLocaleString('en') + ' unique', total + ' entries / ' + firstFile.size + ' unique');
    }

    section('[P] path hygiene on every <loc>');
    const rules = [
        ['https apex origin (no www / port / credentials)', (raw, u) => !!u && u.protocol === 'https:' && u.host === 'timesprayers.com' && !u.port && !u.username && !u.password],
        ['no query string', (raw) => !raw.includes('?')],
        ['no fragment', (raw) => !raw.includes('#')],
        ['no .html', (raw) => !/\.html?\b/i.test(raw)],
        ['no dot in the path', (raw, u) => !!u && !u.pathname.includes('.')],
        ['no // in the path', (raw, u) => !!u && !u.pathname.includes('//')],
        ['no percent-encoding', (raw) => !raw.includes('%')],
        ['lowercase', (raw) => raw === raw.toLowerCase()],
        ['no whitespace', (raw) => !/\s/.test(raw)],
        ['no non-canonical trailing slash (only the ar home is /)', (raw, u) => !!u && (u.pathname === '/' || !u.pathname.endsWith('/'))],
        ['no /ar/ locale prefix', (raw, u) => !!u && !/^\/ar(?:\/|$)/.test(u.pathname)],
        ['loc === origin + pathname (canonical form)', (raw, u) => !!u && raw === SITE + u.pathname],
    ].map(([name, fn]) => ({ a: agg('P', name), fn }));
    for (const e of A.entries) {
        let u = null; try { u = new URL(e.loc); } catch (_) { u = null; }
        for (const r of rules) r.a.test(e.loc, r.fn(e.loc, u));
    }
    rules.forEach(r => r.a.done());

    section('[K] slug policy');
    const coordA = agg('K', 'no coordinate ({slug}-{lat}-{lng}) or loc- slug in a city/country family');
    const redirA = agg('K', 'no curated redirect-key slug (db/curated-slugs.json + manual; live curated slug exempt)');
    const ccA = agg('K', 'no SAR/country-code prayer slug (' + PRAYER_CC_REDIRECT_CODES.join('/') + ')');
    for (const e of A.entries) {
        const p = pathOf(e.loc); if (p == null) continue;
        const s = slugOf(splitLocale(p).rel); if (!s) continue;
        coordA.test(e.loc, !COORD_TAIL_RE.test(s.slug) && !/^loc-/.test(s.slug), s.slug);
        if (E) redirA.test(e.loc, !E.blockedSlugs.has(s.slug) && !(s.country && E.blockedSlugs.has(s.country)), s.slug);
        if (s.family === 'prayer-times-in') ccA.test(e.loc, !PRAYER_CC_REDIRECT_CODES.includes(s.slug), s.slug);
    }
    coordA.done(); redirA.done(); ccA.done();
    if (E) ok('K', JSON.stringify(E.exemptKeys) === JSON.stringify(['singapore']), 'redirect keys exempt as live curated slugs === [singapore]', JSON.stringify(E.exemptKeys) + ' of ' + E.redirectKeys.length + ' keys');
    const scHits = Object.entries(A.singaporeCityHits).filter(([, n]) => n > 0);
    ok('K', scHits.length === 0, "0 'singapore-city' occurrences in robots.txt and every sitemap body", scHits.map(([p, n]) => p + '×' + n).join(', '));

    section('[M] moon URLs');
    const moonShape = agg('M', 'moon locs are hub / country / city hub / today / year / month only (no day URL)');
    const legacy = agg('M', 'no legacy flat /moon-in- or /moon-today-in- URL');
    const moonYear = agg('M', 'nested moon year/month: year ∈ UTC year ±1' + (E ? ' {' + E.moonYears.join(',') + '}' : ''));
    const moonRange = agg('M', 'nested moon year/month: year inside the supported range (UTC year ±5)' + (E ? ' [' + E.moonMin + ',' + E.moonMax + ']' : ''));
    const moonYearsSeen = new Set(); let moonYM = 0;
    for (const e of A.entries) {
        const p = pathOf(e.loc); if (p == null) continue; const rel = splitLocale(p).rel;
        legacy.test(e.loc, !/^\/moon-(?:today-)?in-/.test(rel));
        if (!/^\/moon(?:\/|$)/.test(rel)) continue;
        const ok1 = /^\/moon$/.test(rel) || /^\/moon\/[a-z][a-z0-9-]*$/.test(rel) || /^\/moon\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*(?:\/today|\/\d{4}|\/\d{4}\/(?:0[1-9]|1[0-2]))?$/.test(rel);
        moonShape.test(e.loc, ok1, rel);
        const ym = rel.match(/^\/moon\/[^/]+\/[^/]+\/(\d{4})(?:\/(\d{2}))?$/);
        if (ym && E) {
            const y = Number(ym[1]); moonYM++; moonYearsSeen.add(y);
            moonYear.test(e.loc, E.moonYears.includes(y), y);
            moonRange.test(e.loc, y >= E.moonMin && y <= E.moonMax && y >= 1900 && y <= 2100, y);
        }
    }
    moonShape.done(); legacy.done(); moonYear.done(); moonRange.done();
    if (E) ok('M', E.moonYears.every(y => moonYearsSeen.has(y)) && moonYearsSeen.size === E.moonYears.length, 'every window year ' + E.moonYears.join(',') + ' is listed (and no other)', [...moonYearsSeen].sort().join(','));
    info('nested moon year/month locs=' + moonYM);

    section('[J] Hijri URLs');
    if (E) {
        const calA = agg('J', 'hijri-calendar year/month locs: year ∈ current Hijri year ±1 {' + E.hijriCalYears.join(',') + '}, month valid');
        const dayA = agg('J', 'hijri-date locs: current Hijri year ' + E.hNow.year + ' only, valid table date');
        const otherA = agg('J', 'no other Hijri URL shape (only /hijri-calendar/{y}, /hijri-calendar/{y}-{mm}, /hijri-date/{y}-{mm}-{dd})');
        const calYearsSeen = new Set(); let dayCount = 0;
        for (const e of A.entries) {
            const p = pathOf(e.loc); if (p == null) continue; const rel = splitLocale(p).rel;
            if (!/^\/hijri-(?:calendar|date)(?:\/|$)/.test(rel)) continue;
            otherA.test(e.loc, /^\/hijri-calendar\/\d{4}(?:-\d{2})?$/.test(rel) || /^\/hijri-date\/\d{4}-\d{2}-\d{2}$/.test(rel), rel);
            let m;
            if ((m = rel.match(/^\/hijri-calendar\/(\d{4})(?:-(\d{2}))?$/))) {
                const y = Number(m[1]); calYearsSeen.add(y);
                calA.test(e.loc, E.hijriCalYears.includes(y) && (!m[2] || E.hMonthDays(y, Number(m[2])) > 0), rel);
            } else if ((m = rel.match(/^\/hijri-date\/(\d{4})-(\d{2})-(\d{2})$/))) {
                const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]); dayCount++;
                dayA.test(e.loc, y === E.hNow.year && d >= 1 && d <= E.hMonthDays(y, mo), rel);
            }
        }
        calA.done(); dayA.done(); otherA.done();
        ok('J', E.hijriCalYears.every(y => calYearsSeen.has(y)) && calYearsSeen.size === E.hijriCalYears.length, 'every Hijri calendar year ' + E.hijriCalYears.join(',') + ' is listed (and no other)', [...calYearsSeen].sort().join(','));
        ok('J', dayCount === E.hijriDayCount * 10, 'hijri-date count === days in ' + E.hNow.year + ' (' + E.hijriDayCount + ') × 10 locales', String(dayCount));
    }

    section('[G] Singapore + country listings');
    const mainPrayer = new Set((main ? main.locs : []).filter(l => { const p = pathOf(l); return p && /^\/prayer-times-in-/.test(splitLocale(p).rel); }));
    const shardLocSet = new Set(shards.flatMap(f => f.locs));
    const both = [...mainPrayer].filter(l => shardLocSet.has(l));
    ok('G', both.length === 0, 'no /prayer-times-in-X listed in both sitemap-main and a city shard', both.length + ': ' + both.slice(0, 5).join(', '));
    const sgMain = (main ? main.locs : []).filter(l => /\/prayer-times-in-singapore$/.test(l));
    ok('G', sgMain.length === 0, 'singapore is not listed as a prayer country in sitemap-main', sgMain.join(', '));
    const sgExpected = CITY_FAMILIES.flatMap(fam => LOCALES.map(l => locFor('/' + fam + '-singapore', l)));
    const sgCounts = sgExpected.map(u => [u, A.entries.filter(e => e.loc === u).map(e => files[e.fi].path)]);
    const sgBad = sgCounts.filter(([, where]) => where.length !== 1 || !/sitemap-cities-/.test(where[0]));
    ok('G', sgBad.length === 0, 'singapore city: 4 families × 10 locales each listed exactly once, in a city shard (40)', sgBad.slice(0, 4).map(([u, w]) => u + ' → [' + w.join(',') + ']').join(' ; '));
    for (const c of SAMPLE_COUNTRIES) {
        const pr = LOCALES.map(l => locFor('/prayer-times-in-' + c, l)), mo = LOCALES.map(l => locFor('/moon/' + c, l));
        const miss = [...pr, ...mo].filter(u => !(main && main.locs.includes(u)));
        ok('G', miss.length === 0, 'country ' + c + ': prayer + moon country page listed in sitemap-main × 10 locales', miss.slice(0, 3).join(', '));
    }

    section('[Q] Quran');
    const qMain = (main ? main.locs : []).filter(l => { const p = pathOf(l); return p && isQuranRel(splitLocale(p).rel); });
    const qShard = shards.flatMap(f => f.locs).filter(l => { const p = pathOf(l); return p && isQuranRel(splitLocale(p).rel); });
    ok('Q', qMain.length === 0, 'sitemap-main lists 0 /quran URLs', qMain.length + ': ' + qMain.slice(0, 3).join(', '));
    ok('Q', qShard.length === 0, 'city shards list 0 /quran URLs', String(qShard.length));
    const qEntries = A.entries.filter(e => files[e.fi] === quran);
    const qAlt = agg('Q', 'every sitemap-quran <url> has 0 alternates');
    const qPath = agg('Q', 'every sitemap-quran <loc> is an ar-only /quran[/slug] URL');
    for (const e of qEntries) { qAlt.test(e.loc, A.groups[e.gid].pairs.length === 0, A.groups[e.gid].pairs.length); qPath.test(e.loc, /^https:\/\/timesprayers\.com\/quran(?:\/[a-z0-9-]+)?$/.test(e.loc)); }
    qAlt.done(); qPath.done();

    section('[R] hreflang alternates (main + shards)');
    const mainShardLoc = new Map(A.entries.filter(e => files[e.fi] !== quran).map(e => [e.loc, e]));
    const r11 = agg('R', 'every <url> has exactly 11 alternates, rel="alternate", hreflang = 10 locales + x-default, each once');
    const rX = agg('R', 'x-default href === ar href');
    const rSelf = agg('R', 'own-locale alternate href === <loc>');
    const rPrefix = agg('R', 'every alternate href carries its hreflang locale prefix (ar unprefixed)');
    const rIsLoc = agg('R', 'every alternate href is itself a <loc> in sitemap-main / city shards');
    const rRecip = agg('R', 'reciprocal: every alternate target carries the identical alternate group; group members === its 10 hrefs');
    const want = [...LOCALES, 'x-default'].sort().join(',');
    const groupOkCache = new Map();
    for (const g of A.groups) {
        const hls = g.pairs.map(x => x[0]);
        const map = Object.fromEntries(g.pairs);
        const shapeOk = g.pairs.length === 11 && hls.slice().sort().join(',') === want && g.rels.every(r => r === 'alternate');
        const xOk = shapeOk && map['x-default'] === map.ar;
        const prefixOk = shapeOk && LOCALES.every(l => { const p = pathOf(map[l] || ''); return p != null && splitLocale(p).locale === l; });
        const hrefs = shapeOk ? LOCALES.map(l => map[l]) : [];
        const isLocBad = hrefs.filter(h => !mainShardLoc.has(h));
        const recipBad = hrefs.filter(h => mainShardLoc.has(h) && mainShardLoc.get(h).gid !== g.id);
        const membersOk = shapeOk && g.members.length === 10 && new Set(g.members).size === 10 && hrefs.every(h => g.members.includes(h));
        groupOkCache.set(g.id, { shapeOk, xOk, prefixOk, map, isLocBad, recipOk: recipBad.length === 0 && membersOk, recipDetail: 'members=' + g.members.length + ' bad=' + recipBad.slice(0, 2).join(',') });
    }
    for (const e of A.entries) {
        if (files[e.fi] === quran) continue;
        const g = groupOkCache.get(e.gid);
        r11.test(e.loc, g.shapeOk, A.groups[e.gid].pairs.length + ' alternates');
        rX.test(e.loc, g.xOk);
        const p = pathOf(e.loc); const loc = p != null ? splitLocale(p).locale : null;
        rSelf.test(e.loc, g.shapeOk && g.map[loc] === e.loc, g.map[loc]);
        rPrefix.test(e.loc, g.prefixOk);
        rIsLoc.test(e.loc, g.shapeOk && g.isLocBad.length === 0, g.isLocBad.slice(0, 2).join(','));
        rRecip.test(e.loc, g.recipOk, g.recipDetail);
    }
    [r11, rX, rSelf, rPrefix, rIsLoc, rRecip].forEach(a => a.done());

    section('[L] lastmod policy');
    const lmFmt = agg('L', 'every <lastmod> is YYYY-MM-DD and at most one per <url>');
    const lmQuran = agg('L', 'sitemap-quran: every <url> has exactly one <lastmod> === ' + QURAN_LASTMOD);
    const lmMain = agg('L', 'sitemap-main: <lastmod> only on /[lang/]privacy + /[lang/]terms, === ' + LEGAL_LASTMOD);
    const lmShard = agg('L', 'city shards: 0 <lastmod>');
    const lmToday = agg('L', 'no <lastmod> equals the request day (UTC ' + (E ? E.utcYmd : '?') + ' / Riyadh ' + (E ? E.riyadhYmd : '?') + ')');
    let mainLegal = 0;
    const todayUtc = new Date().toISOString().slice(0, 10), todayRiyadh = ymdIn('Asia/Riyadh');
    for (const e of A.entries) {
        const f = files[e.fi];
        lmFmt.test(e.loc, e.lastmods.length <= 1 && e.lastmods.every(x => /^\d{4}-\d{2}-\d{2}$/.test(x)), e.lastmods.join('|'));
        for (const x of e.lastmods) lmToday.test(e.loc, x !== todayUtc && x !== todayRiyadh, x);
        if (f === quran) lmQuran.test(e.loc, e.lastmods.length === 1 && e.lastmods[0] === QURAN_LASTMOD, e.lastmods.join('|'));
        else if (f === main) {
            const rel = splitLocale(pathOf(e.loc) || '').rel;
            const legal = rel === '/privacy' || rel === '/terms';
            if (legal) mainLegal++;
            lmMain.test(e.loc, legal ? (e.lastmods.length === 1 && e.lastmods[0] === LEGAL_LASTMOD) : e.lastmods.length === 0, e.lastmods.join('|') || '(none)');
        } else if (fileKind(f) === 'shard') lmShard.test(e.loc, e.lastmods.length === 0, e.lastmods.join('|'));
    }
    lmFmt.done(); lmQuran.done(); lmMain.done(); lmShard.done();
    lmToday.done('', true);
    ok('L', mainLegal === 20, 'sitemap-main lists exactly 20 privacy/terms URLs (2 × 10 locales)', String(mainLegal));
    if (E) ok('L', E.legalDates.length === 20 && E.legalDates.every(d => d === LEGAL_LASTMOD), 'target server.js LEGAL_PAGES legal-meta literals: 20, all === ' + LEGAL_LASTMOD + ' (the lastmod source)', E.legalDates.length + ' ' + [...new Set(E.legalDates)].join(','));
    const totalLastmodTags = files.reduce((a, f) => a + (f.lastmodTags || 0) + (f.childLastmods || 0), 0);
    ok('L', totalLastmodTags === (quran ? quran.urls : 0) + 20, '<lastmod> tags across all sitemaps === ' + ((quran ? quran.urls : 0) + 20) + ' (Quran + privacy/terms only)', String(totalLastmodTags));
}

// ─────────────────────────────── base comparison ───────────────────────────────
async function baseChecks(A, B, afterPort) {
    section('[B] base comparison (robots / sitemap-quran identical; <url> blocks identical minus lastmod except approved removals)');
    ok('B', B.robots.status === 200 && Buffer.compare(A.robots.raw, B.robots.raw) === 0, 'robots.txt byte-identical to base', A.robots.raw.length + ' vs ' + B.robots.raw.length + ' bytes');
    const aq = A.files.find(f => f.path === '/sitemap-quran.xml'), bq = B.files.find(f => f.path === '/sitemap-quran.xml');
    ok('B', !!aq && !!bq && !!aq.raw && !!bq.raw && Buffer.compare(aq.raw, bq.raw) === 0, 'sitemap-quran.xml byte-identical to base', (aq && aq.bytes) + ' vs ' + (bq && bq.bytes));
    ok('B', !!aq && !!bq && aq.etag && aq.etag === bq.etag, 'sitemap-quran.xml ETag identical to base', (aq && aq.etag) + ' vs ' + (bq && bq.etag));
    ok('B', !!aq && !!bq && aq.lastModified && aq.lastModified === bq.lastModified && aq.lastModified === new Date(QURAN_LASTMOD + 'T00:00:00Z').toUTCString(), 'sitemap-quran.xml Last-Modified identical to base (= ' + QURAN_LASTMOD + ')', (aq && aq.lastModified) + ' vs ' + (bq && bq.lastModified));
    if (aq && aq.etag) { const r = await request(afterPort, '/sitemap-quran.xml', { headers: { 'If-None-Match': aq.etag } }); ok('B', r.status === 304, 'sitemap-quran.xml → 304 on If-None-Match', String(r.status)); }
    const ai = A.files.find(f => f.path === '/sitemap.xml'), bi = B.files.find(f => f.path === '/sitemap.xml');
    ok('B', !!ai && !!bi && JSON.stringify(ai.children) === JSON.stringify(bi.children), 'sitemap index children identical to base', (ai && ai.children.length) + ' vs ' + (bi && bi.children.length));
    const approvedRemoval = (p, loc) => {
        if (p !== '/sitemap-main.xml') return false;
        const lp = pathOf(loc); if (lp == null) return false; const rel = splitLocale(lp).rel;
        return isQuranRel(rel) || rel === '/prayer-times-in-singapore';
    };
    const blockAgg = agg('B', 'every sitemap-main / city shard <url> block identical to base once <lastmod> lines are removed (approved removals excepted)');
    let removed = 0, removedQuran = 0, removedSg = 0;
    for (const bf of B.files) {
        if (bf.kind !== 'urlset' || bf.path === '/sitemap-quran.xml') continue;
        const af = A.files.find(f => f.path === bf.path);
        if (!af) { blockAgg.test(bf.path, false, 'file missing on after'); continue; }
        for (const [loc, h] of bf.hashes) {
            if (approvedRemoval(bf.path, loc)) {
                removed++; if (isQuranRel(splitLocale(pathOf(loc)).rel)) removedQuran++; else removedSg++;
                blockAgg.test(loc, !af.hashes.has(loc), 'approved removal still present on after');
                continue;
            }
            blockAgg.test(loc, af.hashes.get(loc) === h, af.hashes.has(loc) ? 'block differs' : 'missing on after');
        }
        for (const loc of af.hashes.keys()) if (!bf.hashes.has(loc)) blockAgg.test(loc, false, 'added on after (not in base ' + bf.path + ')');
    }
    blockAgg.done();
    ok('B', removed === 125 && removedQuran === 115 && removedSg === 10, 'base → after removed exactly 115 Quran + 10 singapore-country URLs from sitemap-main', 'removed ' + removed + ' (quran ' + removedQuran + ', singapore ' + removedSg + ')');
}

// ─────────────────────────────── sample selection ───────────────────────────────
function selectUrls(A, E) {
    const files = A.files;
    const quran = files.find(f => f.path === '/sitemap-quran.xml');
    const main = files.find(f => f.path === '/sitemap-main.xml');
    const entryByLoc = new Map(); for (const e of A.entries) if (!entryByLoc.has(e.loc)) entryByLoc.set(e.loc, e);
    const all = [...entryByLoc.keys()];
    if (MODE === 'full') return { urls: all, entryByLoc, missingNamed: [] };
    const picked = new Set(); const missingNamed = [];
    const expand = (loc) => {
        const e = entryByLoc.get(loc); if (!e) return false;
        if (files[e.fi] === quran) { picked.add(loc); return true; }
        const g = A.groups[e.gid]; picked.add(loc);
        for (const [hl, href] of g.pairs) if (hl !== 'x-default' && entryByLoc.has(href)) picked.add(href);
        return true;
    };
    const relOf = (l) => { const p = pathOf(l); return p == null ? null : splitLocale(p); };
    // 1) static + guides + legal (all locales) and every Quran URL
    for (const l of main ? main.locs : []) { const r = relOf(l); if (r && (STATIC_PATHS.includes(r.rel) || /^\/guides(?:\/|$)/.test(r.rel))) expand(l); }
    for (const l of quran ? quran.locs : []) expand(l);
    // 2) countries (prayer + moon): first/last + named
    const arMain = (main ? main.locs : []).filter(l => relOf(l) && relOf(l).locale === 'ar');
    const prayerCountries = arMain.filter(l => /^\/prayer-times-in-/.test(relOf(l).rel));
    const moonCountries = arMain.filter(l => /^\/moon\/[^/]+$/.test(relOf(l).rel));
    for (const list of [prayerCountries, moonCountries]) if (list.length) { expand(list[0]); expand(list[list.length - 1]); }
    for (const c of SAMPLE_COUNTRIES) for (const rel of ['/prayer-times-in-' + c, '/moon/' + c]) if (!expand(SITE + rel)) missingNamed.push(SITE + rel);
    // 3) first + last city of every shard × the 4 city families (× 10 locales)
    for (const f of files.filter(x => /^\/sitemap-cities-\d+\.xml$/.test(x.path))) {
        const order = [];
        for (const l of f.locs) { const r = relOf(l); if (r && r.locale === 'ar') { const m = r.rel.match(/^\/prayer-times-in-(.+)$/); if (m && !order.includes(m[1])) order.push(m[1]); } }
        for (const slug of order.length ? [order[0], order[order.length - 1]] : []) for (const fam of CITY_FAMILIES) expand(SITE + '/' + fam + '-' + slug);
    }
    // 4) Singapore city page (D6/D7) × 4 families
    for (const fam of CITY_FAMILIES) if (!expand(SITE + '/' + fam + '-singapore')) missingNamed.push(SITE + '/' + fam + '-singapore');
    // 5) moon cities: hub / today / 3 years / boundary months (01 + 12)
    const moonPick = (city) => {
        const hits = all.filter(l => { const r = relOf(l); return r && r.locale === 'ar' && new RegExp('^/moon/[^/]+/' + city + '(?:/today|/\\d{4}|/\\d{4}/(?:01|12))?$').test(r.rel); });
        hits.forEach(expand); return hits.length;
    };
    const moonInfo = [];
    for (const c of SAMPLE_MOON_CITIES_REQUIRED) { const n = moonPick(c); moonInfo.push(c + '=' + n); if (n !== 2 + (E ? E.moonYears.length * 3 : 9)) missingNamed.push('moon ' + c + ' hub/today/years/boundary months: ' + n + ' ar locs'); }
    for (const c of SAMPLE_MOON_CITIES_OPTIONAL) moonInfo.push(c + '=' + moonPick(c) + ' (optional)');
    // 6) Hijri boundaries
    if (E) {
        const pad2 = (n) => String(n).padStart(2, '0');
        for (const y of E.hijriCalYears) for (const rel of ['/hijri-calendar/' + y, '/hijri-calendar/' + y + '-01', '/hijri-calendar/' + y + '-12']) if (!expand(SITE + rel)) missingNamed.push(SITE + rel);
        const H = E.hNow.year;
        for (const rel of ['/hijri-date/' + H + '-01-01', '/hijri-date/' + H + '-12-' + pad2(E.hMonthDays(H, 12)), '/hijri-date/' + H + '-' + pad2(E.hNow.month) + '-' + pad2(E.hNow.day)]) if (!expand(SITE + rel)) missingNamed.push(SITE + rel);
    }
    // 7) deterministic hash stride
    let stride = 0;
    for (const l of all) if (BigInt('0x' + sha1(l)) % 997n === 0n) { stride++; expand(l); }
    info('sample: moon ' + moonInfo.join(' ') + ' | hash-stride hits=' + stride + ' | total sampled=' + picked.size);
    return { urls: [...picked], entryByLoc, missingNamed };
}

// ─────────────────────────────── HTTP invariants ───────────────────────────────
const STRIP_RE = /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi;
function stripNonMarkup(s) { return s.replace(STRIP_RE, ''); }
// The ONLY sitemap locs allowed to ship without a robots meta (pre-existing on base; indexable by default).
const KNOWN_NO_ROBOTS_META_RE = /^https:\/\/timesprayers\.com\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?prayer-times-worldwide$/;
const KNOWN_NO_ROBOTS_META_HITS = new Set();
const H_CHECKS = ['status 200', 'no Location header', 'Content-Type text/html', 'head complete (</head> reached)', 'exactly one <meta name="robots">',
    'meta robots contains index and not noindex/none', 'no X-Robots-Tag noindex/none', 'exactly one rel=canonical', 'canonical === sitemap <loc>',
    'head hreflang map === sitemap alternates (0 for Quran)', '<html lang> === URL locale', 'not the 404 template'];
function analyze(r, loc, expAlts, locale) {
    const f = {};
    const bad = (k, d) => { f[k] = d == null ? '' : String(d); };
    if (r.status !== 200) bad('status 200', r.status + (r.err ? ' ' + r.err : ''));
    if (r.headers && r.headers.location) bad('no Location header', r.headers.location);
    if (!/^text\/html\b/i.test(String((r.headers || {})['content-type'] || ''))) bad('Content-Type text/html', (r.headers || {})['content-type']);
    const xrt = String((r.headers || {})['x-robots-tag'] || '');
    if (/\bnoindex\b|\bnone\b/i.test(xrt)) bad('no X-Robots-Tag noindex/none', xrt);
    const cleaned = stripNonMarkup(r.body || '');
    const hi = cleaned.search(/<\/head\s*>/i);
    if (hi < 0) { bad('head complete (</head> reached)', 'no </head> (' + (r.body || '').length + ' chars)'); for (const k of H_CHECKS.slice(4)) if (!(k in f) && k !== 'no X-Robots-Tag noindex/none') bad(k, 'head not parsed'); return f; }
    const head = cleaned.slice(0, hi);
    const metas = [...head.matchAll(/<meta\b([^>]*)>/gi)].map(m => attrsOf(m[1]));
    const robots = metas.filter(a => String(a.name || '').toLowerCase() === 'robots');
    const toks = robots.flatMap(a => String(a.content || '').toLowerCase().split(',').map(t => t.trim()));
    if (KNOWN_NO_ROBOTS_META_RE.test(loc)) {
        // Pre-existing, disclosed gap (PRAYER-WORLDWIDE-ROBOTS-META-1): serveCountriesPage writes its own head with no
        //   robots meta, so the page is indexable by default. Pin that exact state: a robots meta appearing here (fixed
        //   or broken) fails until this exception is removed; a noindex can never pass.
        if (robots.length !== 0) bad('exactly one <meta name="robots">', 'known no-robots-meta exception now has ' + robots.length + ' — remove the exception: ' + robots.map(a => a.content).join(' | '));
        if (toks.includes('noindex') || toks.includes('none')) bad('meta robots contains index and not noindex/none', robots.map(a => a.content).join(' | '));
        KNOWN_NO_ROBOTS_META_HITS.add(loc);
    } else {
        if (robots.length !== 1) bad('exactly one <meta name="robots">', robots.length + ': ' + robots.map(a => a.content).join(' | '));
        if (!(robots.length >= 1 && toks.includes('index') && !toks.includes('noindex') && !toks.includes('none'))) bad('meta robots contains index and not noindex/none', robots.map(a => a.content).join(' | ') || '(none)');
    }
    const links = [...head.matchAll(/<link\b([^>]*)>/gi)].map(m => attrsOf(m[1]));
    const canon = links.filter(a => String(a.rel || '').toLowerCase().split(/\s+/).includes('canonical'));
    if (canon.length !== 1) bad('exactly one rel=canonical', canon.length + ': ' + canon.map(a => a.href).join(' | '));
    if (!(canon.length >= 1 && canon.every(a => htmlUnescape(a.href || '') === loc))) bad('canonical === sitemap <loc>', canon.map(a => a.href).join(' | ') || '(none)');
    const alts = links.filter(a => String(a.rel || '').toLowerCase().split(/\s+/).includes('alternate') && a.hreflang != null).map(a => [a.hreflang, htmlUnescape(a.href || '')]);
    const altMap = {}; let dupHl = [];
    for (const [hl, href] of alts) { if (hl in altMap) dupHl.push(hl); altMap[hl] = href; }
    const expEntries = Object.entries(expAlts);
    const altOk = dupHl.length === 0 && alts.length === expEntries.length && expEntries.every(([hl, href]) => altMap[hl] === href);
    if (!altOk) {
        const diff = expEntries.filter(([hl, href]) => altMap[hl] !== href).map(([hl, href]) => hl + ':' + (altMap[hl] || '∅') + '≠' + href).slice(0, 2);
        bad('head hreflang map === sitemap alternates (0 for Quran)', 'head ' + alts.length + ' vs sitemap ' + expEntries.length + (dupHl.length ? ' dup=' + dupHl.join(',') : '') + (diff.length ? ' ' + diff.join(' ; ') : ''));
    }
    const htmlTag = cleaned.match(/<html\b([^>]*)>/i);
    const lang = htmlTag ? attrsOf(htmlTag[1]).lang : undefined;
    if (lang !== locale) bad('<html lang> === URL locale', 'lang=' + lang + ' expected ' + locale);
    const title = (head.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
    if (/\b404\b/.test(title) || /\.code\{font-size:5rem/.test(r.body || '') || /<div class="code"[^>]*>404<\/div>/.test(r.body || '')) bad('not the 404 template', 'title=' + title);
    return f;
}
async function httpChecks(port, sel, A) {
    section('[H] HTTP invariants — ' + MODE + ' mode, ' + sel.urls.length + ' URLs, concurrency ' + HTTP_CONCURRENCY + ' (redirect: manual, read until </head>)');
    ok('H', sel.missingNamed.length === 0, 'every named sample URL is present in the sitemaps', sel.missingNamed.slice(0, 6).join(' ; '));
    const aggs = Object.fromEntries(H_CHECKS.map(k => [k, agg('H', k)]));
    const quran = A.files.find(f => f.path === '/sitemap-quran.xml');
    let next = 0, doneN = 0, transportRetries = 0; const t0 = Date.now();
    const worker = async () => {
        for (;;) {
            const i = next++; if (i >= sel.urls.length) return;
            const loc = sel.urls[i];
            const e = sel.entryByLoc.get(loc);
            const g = A.groups[e.gid];
            const expAlts = (A.files[e.fi] === quran) ? {} : Object.fromEntries(g.pairs);
            const lp = pathOf(loc);
            if (lp == null) { for (const k of H_CHECKS) aggs[k].test(loc, false, 'foreign origin — not fetched'); continue; }
            const locale = splitLocale(lp).locale;
            let r = await request(port, lp, { headUntil: true });
            if (r.status === 0) { transportRetries++; await sleep(1000); r = await request(port, lp, { headUntil: true }); }
            const f = analyze(r, loc, expAlts, locale);
            for (const k of H_CHECKS) aggs[k].test(loc, !(k in f), f[k]);
            doneN++;
            if (doneN % 1000 === 0) info(doneN + '/' + sel.urls.length + ' fetched (' + ((Date.now() - t0) / 1000).toFixed(0) + 's)');
        }
    };
    await Promise.all(Array.from({ length: HTTP_CONCURRENCY }, worker));
    for (const k of H_CHECKS) aggs[k].done();
    info('HTTP phase ' + ((Date.now() - t0) / 1000).toFixed(1) + 's | transport retries=' + transportRetries);
    if (KNOWN_NO_ROBOTS_META_HITS.size) info('known pre-existing exception PRAYER-WORLDWIDE-ROBOTS-META-1: ' + KNOWN_NO_ROBOTS_META_HITS.size + ' sampled loc(s) with no robots meta (indexable by default; noindex would still fail)');
}

// ─────────────────────────────── main ───────────────────────────────
let afterChild = null, baseChild = null;
const cleanup = () => { stop(afterChild); stop(baseChild); };
process.on('SIGINT', () => { cleanup(); process.exit(130); });

async function main() {
    const t0 = Date.now();
    console.log('INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 — sitemap invariants (' + MODE + ')');
    console.log('  target root: ' + TARGET_ROOT + ' :' + PORT + ' (WEB_CONCURRENCY=' + WEB_CONCURRENCY + ')');
    console.log('  base: ' + (BASE_URL ? BASE_URL : BASE_ROOT ? BASE_ROOT + ' :' + BASE_PORT : NO_BASE ? 'disabled (SITEMAP_INV_NO_BASE=1)' : 'none'));
    let E = null;
    section('[C] expectation from the target data files');
    try { E = buildExpectation(TARGET_ROOT); ok('C', true, 'expectation computed from data files (main ' + E.main.length + ', shards ' + E.shardTotal + ' in ' + E.chunks.length + ' files, quran ' + E.quran.length + ')'); }
    catch (e) { ok('C', false, 'expectation computed from data files', e.message); }

    let baseLoopback = null;
    if (BASE_URL) {
        const u = new URL(BASE_URL);
        if (!['127.0.0.1', 'localhost'].includes(u.hostname)) throw new Error('TP_BASE_URL must be a loopback URL');
        const bp = Number(u.port); if (!(bp >= 8851 && bp <= 8859)) throw new Error('TP_BASE_URL port must be within 8851-8859');
        baseLoopback = bp;
    }
    const boots = [boot(TARGET_ROOT, PORT, WEB_CONCURRENCY).then(c => { afterChild = c; })];
    if (!BASE_URL && BASE_ROOT) boots.push(boot(BASE_ROOT, BASE_PORT, BASE_WEB_CONCURRENCY).then(c => { baseChild = c; baseLoopback = BASE_PORT; }));
    await Promise.all(boots);
    info('servers healthy after ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');

    const baseOn = baseLoopback != null;
    const A = await discover(PORT, { keepHashes: baseOn });
    info('after: ' + A.files.length + ' sitemap files, ' + A.entries.length + ' <url> entries, ' + A.groups.length + ' alternate groups (' + ((Date.now() - t0) / 1000).toFixed(1) + 's)');
    staticChecks(A, E);
    if (baseOn) {
        const B = await discover(baseLoopback, { light: true, keepHashes: true });
        stop(baseChild); baseChild = null;
        await baseChecks(A, B, PORT);
    } else if (NO_BASE) {
        section('[B] base comparison');
        console.log('  - [B] disabled explicitly (SITEMAP_INV_NO_BASE=1) — not counted');
    } else {
        section('[B] base comparison');
        ok('B', false, 'base comparison ran', 'no TP_BASE_ROOT / TP_BASE_URL (set SITEMAP_INV_NO_BASE=1 only when the target IS the base)');
    }
    for (const f of A.files) f.hashes = null;
    const sel = selectUrls(A, E);
    await httpChecks(PORT, sel, A);
    info('total ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
}

let crashed = null;
try { await main(); } catch (e) { crashed = e; ok('X', false, 'suite completed without an exception', e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e)); }
finally { cleanup(); agent.destroy(); }
if (FAILS_CSV) {
    const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    fs.writeFileSync(FAILS_CSV, ['guard,check,url,detail', ...csvRows.map(r => r.map(esc).join(','))].join('\n') + '\n', 'utf8');
    console.log('  failures CSV: ' + FAILS_CSV + ' (' + csvRows.length + ' rows)');
}
console.log('\n' + (fail ? 'FAILED CHECKS:\n  ' + fails.join('\n  ') + '\n' : ''));
console.log('RESULT sitemap_invariants: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
