// HIJRI-PAGES-SLIM-1 — acceptance smoke (HTTP, 127.0.0.1 only).
//
// Owner decision under test (2026-10-15): the remaining Hijri pages — /[lang/]today-hijri-date, the calendar hub
// /[lang/]hijri-calendar, year /[lang/]hijri-calendar/YYYY and month /[lang/]hijri-calendar/YYYY-MM — are slimmed at the
// SOURCE: the foreign `.page` blocks are removed before the SSR passes (today: #page-hijri-today promoted to active in the
// same guarded step), the default-city (Mecca) prayer computation no longer runs for them, and four shell items they
// never use are not sent (adhan <audio> preload → none, js/moon-chart.js, js/duas.js, the hidden #sticky-next-bar, the
// /qibla-in- overlay script). Content, navigation, conversion, languages, ads and consent are unchanged.
//
// Sections
//   [I]  identity, 10 locales × {hub, 1448, 1448-04, table edges 1356, 1356-01, 1500, 1500-12, today}: calendar types
//        byte-identical to BEFORE after the same shell edits (masking only the CSP nonce, request-time dates and the
//        clock); today === BEFORE with the 23 foreign blocks removed offline and #page-hijri-today promoted
//        (whitespace-normalized). Also via the EEA consent-strip path (CF-IPCountry: DE).
//   [S]  structure on AFTER: exactly one `.page` block = the route's block, marked active; one H1; the shell items gone;
//        sizes BEFORE → AFTER (identity / br) printed.
//   [H]  SEO head fields identical to BEFORE: title, meta description, robots, canonical, the 11 hreflang links, og:*,
//        every JSON-LD block (masked dates).
//   [C]  control routes byte-identical to BEFORE (masked), plus invalid calendar URLs (404s) identical.
//   [K]  kill switch: AFTER booted with TP_HIJRI_SLIM=0 === BEFORE on every [I] URL (masked).
//   [N]  outbound guard: 0 non-loopback attempts.
// Usage: node scripts/_smoke_hijri_pages_slim_1.mjs
//   env TP_BASE_ROOT BEFORE checkout (default C:/Users/Tarek/Downloads/timesprayers-hijriremove = ac98319, the production
//       tree after HIJRI-DAY-PAGES-REMOVAL-1), TP_GUARD (default …/timesprayers-shed-qa/guard.cjs).
// Never run against production. No load: every request is sequential.
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-hijriremove';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const PB = 8531, PA = 8532, PK = 8533;
const LANGS = ['', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
const CAL = ['/hijri-calendar', '/hijri-calendar/1448', '/hijri-calendar/1448-04', '/hijri-calendar/1356', '/hijri-calendar/1356-01', '/hijri-calendar/1500', '/hijri-calendar/1500-12'];
const KEEP = (p) => (p.endsWith('today-hijri-date') ? 'page-hijri-today' : /\/hijri-calendar\/\d{4}-\d{2}$/.test(p) ? 'page-hijri-month' : 'page-hijri-year');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-hslim-'));

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
    const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'Mozilla/5.0 (tp-hslim-smoke)', ...h } }, (x) => {
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
// offline copy of server.js _pageBlockEnd + _stripForeignPageBlocks (the expected today output)
function blockEnd(html, openIdx, openTagLen) {
    const o = /<div\b/ig, c = /<\/div\s*>/ig, cm = /<!--/g; let d = 1, i = openIdx + openTagLen;
    while (d > 0 && i < html.length) { o.lastIndex = i; c.lastIndex = i; cm.lastIndex = i; const no = o.exec(html), nc = c.exec(html), nm = cm.exec(html);
        if (!nc) return -1; if (nm && nm.index < nc.index && (!no || nm.index < no.index)) { const e = html.indexOf('-->', nm.index); i = e < 0 ? html.length : e + 3; continue; }
        if (no && no.index < nc.index) { d++; i = no.index + no[0].length; continue; } d--; i = nc.index + nc[0].length; }
    return d === 0 ? i : -1;
}
function stripForeign(html, keepId) {
    const re = /<div\b[^>]*\bid="(page-[^"]+)"[^>]*>/gi; const rem = new Set(); const parts = []; let cur = 0, m;
    while ((m = re.exec(html))) { if (!/\bclass="[^"]*\bpage\b[^"]*"/i.test(m[0])) continue; const id = m[1]; if (id === keepId || rem.has(id)) continue;
        const e = blockEnd(html, m.index, m[0].length); if (e < 0 || m.index < cur) continue; rem.add(id); parts.push(html.slice(cur, m.index)); cur = e; re.lastIndex = e; }
    if (!parts.length) return html; parts.push(html.slice(cur)); return parts.join('');
}
const mask = (b) => b.replace(/nonce="[^"]*"/g, 'nonce="N"').replace(/(article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/("date(?:Modified|Published)":\s*")[^"]*/g, '$1T').replace(/(id="current-time">)\d{1,2}:\d{2}(?::\d{2})?/g, '$1CLOCK')
    .replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')    // the two live clocks of the full (BEFORE) shell
    .replace(/js\/app\.js\?v=\d+/g, 'js/app.js?v=V');                   // the app.js cache-buster (bumped by this ticket for the sidebar fix)
const norm = (b) => mask(b).replace(/\s+/g, ' ');
// the shell items AFTER does not send on these routes, applied to the BEFORE body
const SHELL = (b) => b.replace('<audio id="adhan-audio" preload="metadata"', '<audio id="adhan-audio" preload="none"')
    .replace(/[ \t]*<script\b[^>]*\ssrc="js\/moon-chart\.js[^"]*"[^>]*><\/script>\r?\n?/, '')
    .replace(/[ \t]*<script\b[^>]*\ssrc="js\/duas\.js[^"]*"[^>]*><\/script>\r?\n?/, '')
    .replace(/<a class="sticky-next-bar"[\s\S]*?<\/a>/, '')
    .replace(/[ \t]*<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?qibla-in-\/\.test\(location\.pathname\)\) return;[\s\S]*?<\/script>\r?\n?/, '');
const shellGone = (b) => /<audio id="adhan-audio" preload="none"/.test(b) && !/js\/moon-chart\.js/.test(b) && !/js\/duas\.js/.test(b) && !/id="sticky-next-bar"/.test(b)
    && b.indexOf('qibla-in-/.test(location.pathname)) return;') === -1;
const expectedToday = (b) => stripForeign(b, 'page-hijri-today').replace('<div class="page" id="page-hijri-today">', '<div class="page active" id="page-hijri-today">');
const blocks = (b) => [...b.matchAll(/<div\b[^>]*\bclass="([^"]*\bpage\b[^"]*)"[^>]*\bid="(page-[^"]+)"/g)].map((m) => m[2] + (/\bactive\b/.test(m[1]) ? '*' : ''));
const noComments = (b) => String(b).replace(/<!--[\s\S]*?-->/g, '');
const head = (b) => (noComments(b).match(/<head>[\s\S]*?<\/head>/) || [''])[0];
function seoFields(b) {
    const h = mask(head(b));
    const attr = (re) => (h.match(re) || [])[1] || null;
    return {
        title: attr(/<title[^>]*>([^<]*)<\/title>/), desc: attr(/<meta name="description" content="([^"]*)"/), robots: attr(/<meta name="robots" content="([^"]*)"/),
        canonical: attr(/<link rel="canonical" href="([^"]*)"/), hreflang: [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => m[1] + ' ' + m[2]),
        og: [...h.matchAll(/<meta property="og:[^"]+" content="[^"]*"/g)].map((m) => m[0]),
        jsonld: [...mask(noComments(b)).matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1].trim()),
    };
}
const br = (s) => zlib.brotliCompressSync(Buffer.from(s), { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }).length;

async function main() {
    console.log('HIJRI-PAGES-SLIM-1 smoke — AFTER ' + ROOT + ' vs BEFORE ' + BASE_ROOT + ' — UTC ' + new Date().toISOString());
    try {
        await boot(BASE_ROOT, PB, 'before'); await boot(ROOT, PA, 'after'); await boot(ROOT, PK, 'killswitch', { TP_HIJRI_SLIM: '0' });
        const sizes = {};
        section('[I] identity + [S] structure + [H] SEO head + [K] kill switch, 10 locales');
        for (const L of LANGS) {
            for (const p of [...CAL, '/today-hijri-date']) {
                const u = L + p, keep = KEEP(p), today = p === '/today-hijri-date';
                const b = await get(PB, u), a = await get(PA, u), k = await get(PK, u);
                let exp = today ? expectedToday(b.b) : b.b; exp = SHELL(exp);
                const same = today ? norm(exp) === norm(a.b) : mask(exp) === mask(a.b);
                ok('I', a.st === 200 && b.st === 200 && same, u + ' === BEFORE ' + (today ? '(23 foreign blocks removed, block promoted, whitespace-normalized)' : '(after the shell edits)'), 'len ' + a.b.length + ' vs expected ' + exp.length);
                const bl = blocks(a.b), h1 = (noComments(a.b).match(/<h1\b/g) || []).length;
                ok('S', bl.length === 1 && bl[0] === keep + '*' && h1 === 1 && shellGone(a.b), u + ' one block ' + bl.join(',') + ', H1=' + h1 + ', shell items gone', 'blocks=' + bl.join(',') + ' h1=' + h1 + ' shellGone=' + shellGone(a.b));
                const fa = seoFields(a.b), fb = seoFields(b.b);
                const diffs = Object.keys(fa).filter((x) => JSON.stringify(fa[x]) !== JSON.stringify(fb[x]));
                ok('H', diffs.length === 0 && fa.hreflang.length === 11 && !!fa.canonical, u + ' SEO head === BEFORE (title, description, robots, canonical, 11 hreflang, og, ' + fa.jsonld.length + ' JSON-LD)', 'differs: ' + diffs.join(','));
                ok('K', k.st === b.st && mask(k.b) === mask(b.b), u + ' TP_HIJRI_SLIM=0 === BEFORE', 'len ' + k.b.length + ' vs ' + b.b.length);
                if (L === '' || L === '/en' || L === '/ur') sizes[u] = { before: [b.b.length, br(b.b)], after: [a.b.length, br(a.b)] };
            }
        }
        section('[I] EEA consent-strip path (CF-IPCountry: DE)');
        for (const u of ['/today-hijri-date', '/en/today-hijri-date', '/hijri-calendar/1448-04', '/fr/hijri-calendar']) {
            const b = await get(PB, u, { 'CF-IPCountry': 'DE' }), a = await get(PA, u, { 'CF-IPCountry': 'DE' });
            let exp = u.endsWith('today-hijri-date') ? expectedToday(b.b) : b.b; exp = SHELL(exp);
            ok('I', a.st === b.st && norm(exp) === norm(a.b), 'EEA ' + u + ' === BEFORE', 'len ' + a.b.length + ' vs ' + exp.length);
        }
        section('[C] control routes byte-identical to BEFORE (masked)');
        for (const u of ['/', '/en', '/prayer-times-in-riyadh', '/en/prayer-times-in-mecca', '/time-left-until-next-prayer-in-mecca', '/next-prayer-in-riyadh', '/moon',
            '/moon/saudi-arabia/riyadh', '/date-converter', '/hijri-new-year-countdown', '/qibla-in-cairo', '/msbaha', '/zakat-calculator', '/azkar/morning-azkar',
            '/hijri-calendar/1300', '/hijri-calendar/1448-13', '/hijri-calendar/1501', '/hijri-date/1448-05-04', '/today-hijri-date.html', '/hijri-calendar/1448-04/']) {
            const b = await get(PB, u), a = await get(PA, u);
            ok('C', a.st === b.st && mask(a.b) === mask(b.b) && (a.h.location || '') === (b.h.location || ''), u + ' (' + a.st + ') === BEFORE', 'len ' + a.b.length + ' vs ' + b.b.length);
        }
        section('sizes BEFORE → AFTER (raw / br q5, offline)');
        for (const [u, s] of Object.entries(sizes)) info(u.padEnd(30) + ' raw ' + s.before[0] + ' → ' + s.after[0] + ' (' + (100 * (s.after[0] / s.before[0] - 1)).toFixed(0) + '%)   br ' + s.before[1] + ' → ' + s.after[1] + ' (' + (100 * (s.after[1] / s.before[1] - 1)).toFixed(0) + '%)');
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
