// HIJRI-PAGES-SLIM-1 batch B — acceptance smoke (HTTP, 127.0.0.1 only).
//
// Batch B removes dead code only, so every response must equal batch A's after exactly these declared edits:
//   (1) the #page-hijri-day block (and its section comment) is gone from the index.html shell — it was only ever shown on
//       the /hijri-date/ day pages, which answer 410 since HIJRI-DAY-PAGES-REMOVAL-1;
//   (2) the head route-class script no longer has the hijri-day-page branch;
//   (3) the inlined critical CSS is css/critical.css minus its day-page selectors (the inline text must be exactly
//       clean-css level 2 of each tree's critical.css, as server.js builds it);
//   (4) style.css?v=510 → 511 and app.js?v=851 → 852 on the index.html shell;
//   (5) on the four Hijri routes only, the js/qibla.js tag is not sent.
// Sections
//   [I]  10 locales × {hub, 1448, 1448-04, table edges 1356, 1356-01, 1500, 1500-12, today}: B === edit(A), exact (masked
//        nonce / request-time dates / clocks); plus the EEA consent path (CF-IPCountry: DE).
//   [C]  control routes, every template (index.html shell, prayer-times-cities.html, countries.html, guides.html,
//        legal.html), 404 / 410 / redirects: B === edit(A), status and Location equal.
//   [V]  the edits are real: no hijri-day marker left in any B response; qibla.js still sent on qibla routes.
//   [K]  kill switch: B with TP_HIJRI_SLIM=0 === edit(PROD) on the [I] URLs (the switch restores the pre-slim output; the
//        dead-code edits (1)-(4) are permanent).
//   [N]  outbound guard: no ad / analytics / Supabase attempt.
// Usage: node scripts/_smoke_hijri_pages_slim_2.mjs   (env TP_A_ROOT, TP_PROD_ROOT, TP_GUARD)
// Never run against production. Sequential requests only.
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A_ROOT = process.env.TP_A_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-hijrislim';
const PROD_ROOT = process.env.TP_PROD_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-hijriremove';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const require = createRequire(path.join(ROOT, 'package.json'));
const CleanCSS = require('clean-css');
const PB = 8551, PA = 8552, PP = 8553, PK = 8554;
const LANGS = ['', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
const CAL = ['/hijri-calendar', '/hijri-calendar/1448', '/hijri-calendar/1448-04', '/hijri-calendar/1356', '/hijri-calendar/1356-01', '/hijri-calendar/1500', '/hijri-calendar/1500-12'];
const HIJRI_ROUTE = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:today-hijri-date|hijri-calendar(?:\/\d{4}(?:-(?:0[1-9]|1[0-2]))?)?)$/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-hslim2-'));

let pass = 0, fail = 0; const fails = []; const SEC = {};
function ok(label, cond, name, detail) {
    const s = SEC[label] || (SEC[label] = { pass: 0, fail: 0 });
    const n = '[' + label + '] ' + name;
    if (cond) { pass++; s.pass++; console.log('  ✓ ' + n); }
    else { fail++; s.fail++; fails.push(n + (detail ? ' :: ' + detail : '')); console.log('  ✗ ' + n + (detail ? '  :: ' + detail : '')); }
}
const info = (s) => console.log('  · INFO ' + s);
const section = (s) => console.log('\n-- ' + s + ' --');
const get = (port, p, h = {}) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'Mozilla/5.0 (tp-hslim2-smoke)', ...h } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') }));
    });
    r.setTimeout(120000, () => r.destroy(new Error('timeout')));
    r.on('error', () => res({ st: 0, h: {}, b: '' })); r.end();
});
const kids = [];
async function boot(root, port, tag, extra = {}) {
    if ((await get(port, '/health')).st !== 0) throw new Error('port ' + port + ' already in use');
    const guardOut = path.join(TMP, 'guard-' + tag + '.log'); fs.writeFileSync(guardOut, '');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
        ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0', GUARD_OUT: guardOut, ...extra };
    for (const k of ['NODE_OPTIONS', 'TP_ENABLE_SEARCH_TEST', 'DISCOVERED_SSR_TEST_FIXTURE', ...(extra.TP_HIJRI_SLIM ? [] : ['TP_HIJRI_SLIM'])]) delete env[k];
    const k = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, env, stdio: 'ignore' }); k.tag = tag; k.guardOut = guardOut; kids.push(k);
    for (let i = 0; i < 300; i++) { if ((await get(port, '/health')).st === 200) return; await sleep(400); }
    throw new Error('boot failed ' + root + ' :' + port);
}
// offline copy of server.js _pageBlockEnd (comment-aware <div> depth scan)
function blockEnd(html, openIdx, openTagLen) {
    const o = /<div\b/ig, c = /<\/div\s*>/ig, cm = /<!--/g; let d = 1, i = openIdx + openTagLen;
    while (d > 0 && i < html.length) { o.lastIndex = i; c.lastIndex = i; cm.lastIndex = i; const no = o.exec(html), nc = c.exec(html), nm = cm.exec(html);
        if (!nc) return -1; if (nm && nm.index < nc.index && (!no || nm.index < no.index)) { const e = html.indexOf('-->', nm.index); i = e < 0 ? html.length : e + 3; continue; }
        if (no && no.index < nc.index) { d++; i = no.index + no[0].length; continue; } d--; i = nc.index + nc[0].length; }
    return d === 0 ? i : -1;
}
const mask = (b) => b.replace(/nonce="[^"]*"/g, 'nonce="N"').replace(/(article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/("date(?:Modified|Published)":\s*")[^"]*/g, '$1T').replace(/(id="current-time">)\d{1,2}:\d{2}(?::\d{2})?/g, '$1CLOCK')
    .replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')
    .replace(/(\b(?:app|i18n)\.js\?v=\d+)&b=[0-9a-f]+/g, '$1&b=SHA');   // the build stamp: the git HEAD of each checkout
const CC = new CleanCSS({ returnPromise: false, level: 2 });
const CRIT_A = CC.minify(fs.readFileSync(path.join(A_ROOT, 'css/critical.css'), 'utf8')).styles;
const CRIT_P = CC.minify(fs.readFileSync(path.join(PROD_ROOT, 'css/critical.css'), 'utf8')).styles;
const CRIT_B = CC.minify(fs.readFileSync(path.join(ROOT, 'css/critical.css'), 'utf8')).styles;
const DAY_CLASSIFIER = String.raw`}if(/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-date\/\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|30)$/.test(location.pathname)){document.documentElement.classList.add('hijri-day-page');`;
const DAY_COMMENT = '<!-- ===== صفحة اليوم الهجري الفردي ===== -->';
const used = { block: 0, classifier: 0, critical: 0, qibla: 0 };
// the declared batch-B edits applied to a batch-A (or production) body
function edit(body, route, crit, dropQibla = true) {
    let b = body;
    const open = '<div class="page" id="page-hijri-day">';
    const s0 = b.indexOf(open);
    if (s0 !== -1) {
        const e0 = blockEnd(b, s0, open.length); if (e0 < 0) throw new Error('day block end not found on ' + route);
        let s = s0; const c = b.lastIndexOf(DAY_COMMENT, s0);
        if (c !== -1 && /^\s*$/.test(b.slice(c + DAY_COMMENT.length, s0))) s = c;
        while (s > 0 && (b[s - 1] === ' ' || b[s - 1] === '\t')) s--;
        let e = e0; for (let k = 0; k < 2 && b.startsWith('\r\n', e); k++) e += 2;
        b = b.slice(0, s) + b.slice(e); used.block++;
    }
    if (b.includes(DAY_CLASSIFIER)) { b = b.replace(DAY_CLASSIFIER, () => ''); used.classifier++; }
    const tag = '<style id="critical-css">';
    const ci = b.indexOf(tag);
    if (ci !== -1) {
        const ce = b.indexOf('</style>', ci);
        if (b.slice(ci + tag.length, ce) !== crit) throw new Error('inline critical CSS of ' + route + ' is not clean-css(critical.css) of its tree');
        b = b.slice(0, ci + tag.length) + CRIT_B + b.slice(ce); used.critical++;
    }
    b = b.replace(/css\/style\.css\?v=510/g, 'css/style.css?v=511').replace(/js\/app\.js\?v=85[01](?=[&"])/g, 'js/app.js?v=852');
    if (dropQibla && HIJRI_ROUTE.test(route.replace(/\?.*$/, ''))) { const n = b.length; b = b.replace(/[ \t]*<script\b[^>]*\ssrc="js\/qibla\.js[^"]*"[^>]*><\/script>\r?\n?/, ''); if (b.length !== n) used.qibla++; }
    return b;
}
// whitespace-normalized equality: removing the block from the template also drops the blank-line residue the server
//   left where it stripped that block or its section comment (12 spaces + CRLF per line); every other byte must match
const same = (x, y) => mask(x).replace(/\s+/g, ' ') === mask(y).replace(/\s+/g, ' ');
const DAY_MARK = /id="page-hijri-day"|hijri-day-page|#hday-|id="hday-/;
const br = (s) => zlib.brotliCompressSync(Buffer.from(s), { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }).length;

async function main() {
    console.log('HIJRI-PAGES-SLIM-1 batch B smoke — B ' + ROOT + ' vs A ' + A_ROOT + ' (kill switch vs PROD ' + PROD_ROOT + ') — UTC ' + new Date().toISOString());
    info('inline critical CSS (clean-css L2): PROD ' + CRIT_P.length + ' B, A ' + CRIT_A.length + ' B, B ' + CRIT_B.length + ' B (−' + (CRIT_A.length - CRIT_B.length) + ' B in every HTML response that inlines it)');
    try {
        await boot(A_ROOT, PA, 'A'); await boot(ROOT, PB, 'B'); await boot(PROD_ROOT, PP, 'PROD'); await boot(ROOT, PK, 'B-killswitch', { TP_HIJRI_SLIM: '0' });
        const sizes = {};
        section('[I] the four Hijri types, 10 locales: B === edit(A); [K] kill switch === edit(PROD); [V] no day marker');
        for (const L of LANGS) {
            for (const p of [...CAL, '/today-hijri-date']) {
                const u = L + p;
                const a = await get(PA, u), b = await get(PB, u), pr = await get(PP, u), k = await get(PK, u);
                const exp = edit(a.b, u, CRIT_A);
                ok('I', a.st === 200 && b.st === 200 && same(exp, b.b), u + ' === edit(A)', 'len ' + b.b.length + ' vs expected ' + exp.length);
                ok('V', !DAY_MARK.test(b.b) && !/js\/qibla\.js/.test(b.b), u + ' no day-page marker, no qibla.js', 'marker=' + DAY_MARK.test(b.b) + ' qibla=' + /js\/qibla\.js/.test(b.b));
                // TP_HIJRI_SLIM=0 turns the slim shell off, and with it the qibla.js drop (5); the dead-code edits (1)-(4) stay
                const expK = edit(pr.b, u, CRIT_P, false);
                ok('K', k.st === pr.st && same(k.b, expK), u + ' TP_HIJRI_SLIM=0 === edit(PROD) (slim off, dead-code edits on)', 'len ' + k.b.length + ' vs ' + expK.length);
                if (L === '' || L === '/en') sizes[u] = { a: [a.b.length, br(a.b)], b: [b.b.length, br(b.b)] };
            }
        }
        section('[I] EEA consent-strip path (CF-IPCountry: DE)');
        for (const u of ['/today-hijri-date', '/en/today-hijri-date', '/hijri-calendar/1448-04', '/fr/hijri-calendar', '/', '/prayer-times-in-riyadh']) {
            const a = await get(PA, u, { 'CF-IPCountry': 'DE' }), b = await get(PB, u, { 'CF-IPCountry': 'DE' });
            const exp = edit(a.b, u, CRIT_A);
            ok('I', a.st === b.st && same(exp, b.b), 'EEA ' + u + ' === edit(A)', 'len ' + b.b.length + ' vs ' + exp.length);
        }
        section('[C] control routes, every template: B === edit(A) (status, Location, body)');
        const CTRL = ['/', '/en', '/fr', '/prayer-times-in-riyadh', '/en/prayer-times-in-mecca', '/ur/prayer-times-in-karachi', '/time-left-until-next-prayer-in-mecca', '/next-prayer-in-riyadh',
            '/qibla', '/qibla-in-makkah', '/en/qibla-in-cairo', '/moon', '/en/moon', '/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026', '/moon/saudi-arabia/riyadh/2026/10',
            '/moon/saudi-arabia', '/date-converter', '/en/date-converter', '/hijri-new-year-countdown', '/ramadan-countdown', '/eid-al-adha-countdown', '/msbaha', '/zakat-calculator',
            '/azkar', '/azkar/morning-azkar', '/azkar/evening-azkar', '/azkar/prayer-azkar', '/quran', '/quran/al-fatiha', '/prayer-times-worldwide', '/en/prayer-times-worldwide',
            '/prayer-times-in-saudi-arabia', '/en/prayer-times-in-egypt', '/guides', '/en/guides', '/privacy', '/en/terms', '/about-us',
            '/hijri-calendar/1300', '/hijri-calendar/1448-13', '/hijri-calendar/1501', '/hijri-date/1448-05-04', '/en/hijri-date/1447-01-01', '/hijri-date/1448-02-30',
            '/today-hijri-date.html', '/hijri-calendar/1448-04/', '/hijri-calendar.html', '/no-such-page'];
        for (const u of CTRL) {
            const a = await get(PA, u), b = await get(PB, u);
            const exp = a.st === 200 ? edit(a.b, u, CRIT_A) : a.b;
            ok('C', a.st === b.st && (a.h.location || '') === (b.h.location || '') && same(exp, b.b), u + ' (' + b.st + (b.h.location ? ' → ' + b.h.location : '') + ') === edit(A)', 'len ' + b.b.length + ' vs ' + exp.length);
            if (b.st === 200) ok('V', !DAY_MARK.test(b.b), u + ' no day-page marker', (b.b.match(DAY_MARK) || [])[0]);
            if (/qibla/.test(u)) ok('V', /js\/qibla\.js/.test(b.b), u + ' still loads js/qibla.js');
        }
        info('edits applied: day block ' + used.block + '×, classifier ' + used.classifier + '×, critical CSS ' + used.critical + '×, qibla.js tag ' + used.qibla + '×');
        section('sizes A → B (raw / br q5, offline)');
        for (const [u, s] of Object.entries(sizes)) info(u.padEnd(28) + ' raw ' + s.a[0] + ' → ' + s.b[0] + ' (' + (s.b[0] - s.a[0]) + ')   br ' + s.a[1] + ' → ' + s.b[1] + ' (' + (s.b[1] - s.a[1]) + ')');
        for (const u of ['/', '/en', '/prayer-times-in-riyadh', '/moon', '/qibla-in-makkah', '/prayer-times-worldwide', '/guides']) {
            const a = await get(PA, u), b = await get(PB, u);
            info(u.padEnd(28) + ' raw ' + a.b.length + ' → ' + b.b.length + ' (' + (b.b.length - a.b.length) + ')   br ' + br(a.b) + ' → ' + br(b.b) + ' (' + (br(b.b) - br(a.b)) + ')');
        }
    } catch (e) {
        ok('run', false, 'unexpected error', e && e.stack || String(e));
    } finally {
        for (const k of kids) { try { execFileSync('taskkill', ['/PID', String(k.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }
    }
    section('[N] outbound guard');
    for (const k of kids) { const log = fs.existsSync(k.guardOut) ? fs.readFileSync(k.guardOut, 'utf8').trim() : ''; ok('N', !/googlesyndication|doubleclick|google-analytics|googletagmanager|supabase/.test(log), k.tag + ' server: no ad / analytics / Supabase attempt', log.split('\n').slice(0, 3).join(' | ')); }
    console.log('\n== per section ==');
    for (const [k, v] of Object.entries(SEC)) console.log('  ' + k.padEnd(4) + ' pass ' + String(v.pass).padStart(4) + '  fail ' + String(v.fail).padStart(4));
    console.log('\n' + (fail === 0 ? 'PASS' : 'FAIL') + '  ' + pass + ' passed, ' + fail + ' failed');
    if (fails.length) { console.log('\nFailures:'); for (const f of fails.slice(0, 200)) console.log('  - ' + f); }
    try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
    process.exit(fail === 0 ? 0 : 1);
}
main();
