// SEO-COUNTRY-CITY-CRAWL-PATHS-1 — local regression guard + cost measurement (no network; outbound guard, ADSENSE off).
//   BASE = a clean tree of the production commit (env TP_BASE_ROOT), CAND = this tree.
//   [W] /prayer-times-worldwide (10 langs): every curated country that has a prayer country page is a tile (BASE missed
//       46), tiles are language-prefixed and every tile URL answers 200 (no redirect); the 145 tiles BASE had are kept
//       in the same order; no "[worldwide] … placed by timezone" warning (every country placed explicitly).
//   [M] country pages: the 30 countries with > 26 curated cities get one "more cities" section at the end of the page (after
//       the guide + FAQ, immediately before the footer) with exactly the remaining N−26 cities (plain <a href>, unique, alphabetical by localized name); cards ∪ section ==
//       all curated cities of the country; each link answers 200. Every other country page is byte-identical to BASE
//       apart from the inline CSS rules this ticket adds (same for the moon variant /moon/{country}).
//   [G] the country guide no longer links /moon/{country} on the 26 city-less country pages (that URL is a 404), and
//       still does on country pages with cities.
//   [R] reachability proof (ar + en, raw HTML only): / → /prayer-times-worldwide → every country page → every city:
//       the union of city links found == every curated city that belongs to a country page (3,114; Hong Kong / Macau
//       have no country page — reported, owner decision).
//   [P] cost: raw / gzip / brotli-11 / brotli-5 bytes, element count and render time (median of 7 after 2 warm-ups,
//       localhost wall time — not CPU) for India, Saudi Arabia, Pakistan, Egypt, Iceland and the worldwide page.
//   node scripts/_smoke_seo_country_city_crawl_paths_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT)
import http from 'node:http';
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-shapbot';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const P0 = Number(process.env.TP_SMOKE_PORT || 8891);
const PORT = { base: P0, cand: P0 + 1 };
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const pfx = (L) => (L === 'ar' ? '' : '/' + L);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p, enc) => new Promise((res) => {
    const t0 = process.hrtime.bigint();
    const r = http.get({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': enc || 'identity' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8'), ms: Number(process.hrtime.bigint() - t0) / 1e6 }));
    });
    r.on('error', () => res({ st: 0, h: {}, b: '', ms: 0 }));
});
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + String(d).slice(0, 700) : '')); } };
const norm = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')
    .replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA')
    // the inline CSS rules this ticket adds to the country template
    .replace(/\r?\n[ \t]*main\.main-content:not\(\.moon-country-layout\) > \.cities-more-card,/g, '')
    .replace(/[ \t]*\/\* SEO-COUNTRY-CITY-CRAWL-PATHS-1:[^\n]*\*\/\r?\n(?:[ \t]*(?:\.cities-more-|\/\* --primary-dark is the site's TEXT green|\/\* same column \+ card look|@media \(max-width: 480px\) \{ \.cities-more-card)[^\n]*\r?\n)+/g, '');
const boot = (root, port, logf) => {
    const out = fs.openSync(logf, 'w');
    return spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, stdio: ['ignore', out, out],
        env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0' } });
};
const LOGDIR = process.env.TP_SMOKE_LOGDIR || ROOT;
const candLog = path.join(LOGDIR, '.smoke-nav-cand.log');
const kids = [boot(BASE_ROOT, PORT.base, path.join(LOGDIR, '.smoke-nav-base.log')), boot(ROOT, PORT.cand, candLog)];
// ground truth = the full curated list the server itself embeds on each country page (#country-cities-data,
//   built by the same _curatedCitiesForCc as the cards) — filled below from CAND's country pages.
const byCc = new Map();
const dataSlugs = (html) => { const m = html.match(/<script type="application\/json" id="country-cities-data">([\s\S]*?)<\/script>/); if (!m) return []; try { return JSON.parse(m[1]).map((c) => c.slug); } catch (_) { return []; } };
const rawCurated = JSON.parse(fs.readFileSync(path.join(ROOT, 'db/places/curated-places.json'), 'utf8'));
const tiles = (html) => [...html.matchAll(/<a href="([^"]+)" class="country-tile" data-cc="([a-z]{2})"/g)].map((m) => ({ href: m[1], cc: m[2] }));
const gridLinks = (html) => { const m = html.match(/<div id="cities-container" data-ssr-grid="1">([\s\S]*?)<\/div>\s*<div class="pagination"/); return m ? [...m[1].matchAll(/href="([^"]+)"/g)].map((x) => x[1]) : []; };
const moreSection = (html) => { const m = html.match(/<section class="cities-more-card" id="country-more-cities"[\s\S]*?<\/section>/); return m ? m[0] : ''; };
const moreLinks = (sec) => [...sec.matchAll(/<a href="([^"]+)">([^<]*)<\/a>/g)].map((x) => ({ href: x[1], label: x[2] }));
const slugOf = (href) => { const m = href.match(/\/prayer-times-in-([a-z0-9-]+)$/); return m ? m[1] : null; };
const elements = (html) => (html.match(/<[a-zA-Z][a-zA-Z0-9-]*[\s>/]/g) || []).length;
try {
    for (const port of Object.values(PORT)) { for (let i = 0; i < 400; i++) { if ((await get(port, '/health')).st === 200) break; await sleep(300); } }
    // ---------------------------------------------------------------- [W]
    console.log('-- [W] worldwide list');
    const wwBase = await get(PORT.base, '/prayer-times-worldwide'), wwCand = await get(PORT.cand, '/prayer-times-worldwide');
    const tB = tiles(wwBase.b), tC = tiles(wwCand.b);
    const candCcs = new Set(tC.map((t) => t.cc));
    // which tiles are country pages WITH cities? read the server's own embedded list (#country-cities-data)
    const pageCcs = [];
    const slugByCc = new Map();
    for (const t of tC) {
        const slug = t.href.replace(/^.*\/prayer-times-in-/, '');
        const r = await get(PORT.cand, '/prayer-times-in-' + slug);
        const ds = dataSlugs(r.b);
        if (ds.length) { byCc.set(t.cc, ds); pageCcs.push(t.cc); slugByCc.set(t.cc, slug); }
    }
    // curated countries (file, any record) that never got a tile — expected: only hk / mo (no country page)
    const fileCcs = new Set((Array.isArray(rawCurated) ? rawCurated : []).map((p) => String(p && p.countryCode || '').toLowerCase()).filter(Boolean));
    const missing = [...fileCcs].filter((cc) => !candCcs.has(cc));
    ok(tB.length === 145, 'BASE had 145 tiles (control)', tB.length);
    ok(JSON.stringify(tC.map((t) => t.cc).filter((cc) => tB.some((b) => b.cc === cc))) === JSON.stringify(tB.map((t) => t.cc)), 'CAND keeps the 145 BASE tiles in the same order');
    ok(missing.every((cc) => cc === 'hk' || cc === 'mo'), 'every curated country except hk / mo (no country page) is a CAND tile; CAND tiles ' + tC.length, missing.join(','));
    let wwSt = 0, wwN = 0; const wwBad = [];
    for (const t of tC) { const r = await get(PORT.cand, t.href); wwN++; if (r.st === 200) wwSt++; else wwBad.push(t.href + ' ' + r.st); }
    ok(wwSt === wwN, 'every CAND tile URL answers 200 (no redirect / 404)', wwBad.slice(0, 8).join(', '));
    let langOk = 0;
    for (const L of LANGS) { const r = await get(PORT.cand, pfx(L) + '/prayer-times-worldwide'); const tl = tiles(r.b); if (r.st === 200 && tl.length === tC.length && tl.every((t) => t.href.startsWith(pfx(L) + '/prayer-times-in-'))) langOk++; }
    ok(langOk === LANGS.length, 'all 10 language versions list the same ' + tC.length + ' tiles with language-prefixed links', langOk + '/10');
    const warn = fs.existsSync(candLog) ? fs.readFileSync(candLog, 'utf8').match(/\[worldwide\][^\n]*/) : null;
    ok(!warn, 'no "[worldwide] placed by timezone" warning (all countries placed explicitly)', warn && warn[0]);
    // ---------------------------------------------------------------- [M] + [G] + [R]
    console.log('-- [M][G][R] country pages');
    const big = pageCcs.filter((cc) => byCc.get(cc).length > 26), small = pageCcs.filter((cc) => byCc.get(cc).length <= 26);
    const emptyTiles = tC.filter((t) => !byCc.has(t.cc));
    let posOk = 0; const posFail = [];
    let mOk = 0, mFail = [], smallEq = 0, smallFail = [], gOk = 0, gFail = [], linkSt = 0, linkN = 0; const linkBad = [];
    const reach = { ar: new Set(), en: new Set() };
    for (const L of ['ar', 'en']) {
        for (const cc of pageCcs) {
            const p = pfx(L) + '/prayer-times-in-' + slugByCc.get(cc);
            const c = await get(PORT.cand, p);
            const g = gridLinks(c.b).map(slugOf).filter(Boolean), sec = moreSection(c.b), ml = moreLinks(sec), ms = ml.map((x) => slugOf(x.href)).filter(Boolean);
            g.concat(ms).forEach((s) => reach[L].add(s));
            reach[L].add(slugByCc.get(cc));   // a tile may point straight at a city page (Singapore: country == city page)
            const want = byCc.get(cc);
            if (want.length > 26) {
                const union = new Set(g.concat(ms));
                const sortedOk = ml.every((x, i) => i === 0 || new Intl.Collator(L, { sensitivity: 'base' }).compare(ml[i - 1].label, x.label) <= 0);
                const good = g.length === 26 && ms.length === want.length - 26 && new Set(ms).size === ms.length && !ms.some((s) => g.includes(s))
                    && want.every((s) => union.has(s)) && union.size === want.length && sortedOk && ml.every((x) => x.href.startsWith(pfx(L) + '/prayer-times-in-'));
                // placement: at the end of the page, after the guide + FAQ (#country-seo-content), right before the footer
                const iSec = c.b.indexOf('<section class="cities-more-card"'), iSeo = c.b.indexOf('<div id="country-seo-content">'), iFoot = c.b.indexOf('<footer class="site-footer">');
                if (iSec > iSeo && iSeo > -1 && /^<\/section>\s*$/.test(c.b.slice(iSec + sec.length - '</section>'.length, iFoot)) && c.b.indexOf('<section class="cities-more-card"', iSec + 1) === -1) posOk++; else posFail.push(L + ':' + cc);
                if (good) mOk++; else mFail.push(L + ':' + cc + ' grid ' + g.length + ' more ' + ms.length + ' want ' + want.length + (sortedOk ? '' : ' unsorted'));
                if (L === 'ar') for (const s of ms) { const r = await get(PORT.cand, '/prayer-times-in-' + s); linkN++; if (r.st === 200) linkSt++; else linkBad.push(s + ' ' + r.st); }
            } else {
                let b = await get(PORT.base, p), c2 = c;
                // city pages carry minute-level live values: one refetch of both sides if a minute rolled over
                if (norm(b.b) !== norm(c2.b)) { await sleep(1500); b = await get(PORT.base, p); c2 = await get(PORT.cand, p); }
                if (!sec && norm(b.b) === norm(c2.b)) smallEq++; else smallFail.push(L + ':' + cc);
            }
        }
        for (const t of emptyTiles) {
            const p = pfx(L) + '/prayer-times-in-' + t.href.replace(/^.*\/prayer-times-in-/, '');
            const c = await get(PORT.cand, p), b = await get(PORT.base, p);
            const slug = t.href.replace(/^.*\/prayer-times-in-/, '');
            const moonHref = pfx(L) + '/moon/' + slug;
            if (c.st === 200 && b.b.includes('href="' + moonHref + '"') && !c.b.includes('href="' + moonHref + '"')) gOk++; else gFail.push(L + ':' + t.cc);
        }
    }
    ok(big.length === 30, '30 countries have more than 26 curated cities', big.length);
    ok(mOk === big.length * 2, '[M] big countries (ar + en): 26 cards + a section with exactly the other N−26 cities, unique, alphabetical, union == all', mFail.slice(0, 6).join(' | '));
    ok(posOk === big.length * 2, '[M] the section sits once at the end of the page: after the guide + FAQ, immediately before the footer', posFail.slice(0, 6).join(' | '));
    ok(linkSt === linkN && linkN === big.reduce((a, cc) => a + byCc.get(cc).length - 26, 0), '[M] every "more cities" link answers 200 (' + linkN + ' links, ar)', linkBad.slice(0, 6).join(', '));
    ok(smallEq === small.length * 2, '[M] countries with <= 26 cities: no section, page identical to BASE apart from the added CSS (ar + en, ' + small.length + ' countries)', smallFail.slice(0, 8).join(', '));
    ok(emptyTiles.length === 26 && gOk === 52, '[G] the 26 city-less country pages no longer link /moon/{country} (BASE did) — ar + en', gFail.slice(0, 8).join(', '));
    let gKeep = 0; for (const cc of pageCcs.slice(0, 20)) { const c = await get(PORT.cand, '/prayer-times-in-' + slugByCc.get(cc)); if (c.b.includes('href="/moon/' + slugByCc.get(cc) + '"')) gKeep++; }
    ok(gKeep === 20, '[G] country pages WITH cities still link their /moon/{country} page (20 checked)', gKeep);
    const allPageCities = pageCcs.flatMap((cc) => byCc.get(cc));
    for (const L of ['ar', 'en']) {
        const miss = allPageCities.filter((s) => !reach[L].has(s));
        ok(miss.length === 0, '[R] ' + L + ': / → worldwide → country pages reaches all ' + allPageCities.length + ' curated cities with a country page', miss.length + ' missing e.g. ' + miss.slice(0, 5).join(','));
    }
    const home = await get(PORT.cand, '/');
    ok(/href="\/prayer-times-worldwide"/.test(home.b), '[R] the home page links /prayer-times-worldwide');
    const hkmo = rawCurated.filter((p) => p && /^(hk|mo)$/i.test(String(p.countryCode || ''))).map((p) => p.slug);
    console.log('     not covered (no country page — owner decision): ' + hkmo.join(', '));
    // moon variant unchanged apart from CSS
    let moonEq = 0; const moonFail = [];
    for (const cc of ['in', 'sa', 'is', 'eg']) { const p = '/moon/' + slugByCc.get(cc); const b = await get(PORT.base, p), c = await get(PORT.cand, p); if (b.st === c.st && norm(b.b) === norm(c.b)) moonEq++; else moonFail.push(p); }
    ok(moonEq === 4, 'moon country pages unchanged apart from the added CSS', moonFail.join(', '));
    // growth guard (owner condition): every remaining city is listed (never truncated) and today's largest section
    //   must stay under the soft cap that forces extra crawlable pages before bigger data ships
    const capM = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8').match(/const _MORE_CITIES_SOFT_CAP = (\d+);/);
    const maxRest = Math.max(...big.map((cc) => byCc.get(cc).length - 26));
    ok(capM && maxRest <= Number(capM[1]), '[M] largest "more cities" section (' + maxRest + ' links) <= soft cap ' + (capM && capM[1]) + ' (above it: extra crawlable pages, no city dropped)');
    // neutral group (owner condition): no curated country is left without an explicit region today
    const wwAr = await get(PORT.cand, '/prayer-times-worldwide');
    ok(!/data-region="other"/.test(wwAr.b), '[W] no country falls into the neutral "other" group (every curated country has an explicit region; no timezone guess)');
    // dark-mode contrast (review finding): the links use the site's text green (--primary-dark) in both themes
    const tplCss = fs.readFileSync(path.join(ROOT, 'prayer-times-cities.html'), 'utf8');
    ok(/\.cities-more-links a \{ color: var\(--primary-dark\);/.test(tplCss), '[M] "more cities" links use --primary-dark (#4dcb8c on the dark card ≈ 6.2:1, #0d4a28 on white ≈ 10.4:1)');
    // ---------------------------------------------------------------- [P]
    console.log('-- [P] cost (BASE → CAND)');
    const sz = (b) => ({ raw: Buffer.byteLength(b), gz: zlib.gzipSync(b, { level: 6 }).length, br11: zlib.brotliCompressSync(b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
        br5: zlib.brotliCompressSync(b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }).length, el: elements(b), a: (b.match(/<a\s[^>]*href=/g) || []).length });
    const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
    const timeIt = async (port, p) => { for (let i = 0; i < 2; i++) await get(port, p, 'br'); const t = []; for (let i = 0; i < 7; i++) t.push((await get(port, p, 'br')).ms); return med(t); };
    const rows = [];
    for (const p of ['/prayer-times-in-india', '/en/prayer-times-in-india', '/prayer-times-in-saudi-arabia', '/en/prayer-times-in-pakistan', '/prayer-times-in-egypt', '/prayer-times-in-iceland', '/prayer-times-worldwide', '/en/prayer-times-worldwide']) {
        const b = await get(PORT.base, p), c = await get(PORT.cand, p);
        const sb = sz(b.b), sc = sz(c.b);
        const tb = await timeIt(PORT.base, p), tcand = await timeIt(PORT.cand, p);
        rows.push(p + ' | raw ' + sb.raw + '→' + sc.raw + ' | gz ' + sb.gz + '→' + sc.gz + ' | br11 ' + sb.br11 + '→' + sc.br11 + ' | br5 ' + sb.br5 + '→' + sc.br5 + ' | el ' + sb.el + '→' + sc.el + ' | a ' + sb.a + '→' + sc.a + ' | ms ' + tb.toFixed(1) + '→' + tcand.toFixed(1));
    }
    rows.forEach((r) => console.log('     ' + r));
} finally {
    for (const k of kids) { try { k.kill(); } catch (_) { /* gone */ } }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
