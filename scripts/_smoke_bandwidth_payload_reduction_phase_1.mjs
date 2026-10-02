/* BANDWIDTH-PAYLOAD-REDUCTION-PHASE-1 — durable guard for the five payload levers of this ticket.
   Run against a LOCAL server started from this checkout (never production):
     BWP1_SMOKE_URL=http://127.0.0.1:8080 node scripts/_smoke_bandwidth_payload_reduction_phase_1.mjs
   §1 time-left / next-prayer ship exactly ONE .page block (#page-prayer-times, active) that still holds the H1
   §2 _pageKeepGuardOk fails SAFE (unit test on the function source extracted from server.js)
   §3 developer HTML comments are gone from every family; only the KEEP list survives
   §4 js/azkar-data.js / js/azkar-prayer-ui-l10n.js ship only on the azkar list routes
   §5 sw.js precache lists no obsolete URL; CACHE_VERSION unchanged
   §6 /audio/adhan.mp3 honours a single byte range; the open-ended bytes=0- stays the cacheable 200 */
import fs from 'fs';
import vm from 'vm';

const B = process.env.BWP1_SMOKE_URL || 'http://localhost:8080';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const get = async (p, headers = {}) => { const r = await fetch(B + p, { headers, redirect: 'manual' }); return { status: r.status, h: r.headers, text: await r.text() }; };
const LANGS = ['', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
const pageBlocks = h => [...h.matchAll(/<div\b[^>]*\bid="(page-[^"]+)"[^>]*>/g)].filter(m => /\bclass="[^"]*\bpage\b/.test(m[0])).map(m => ({ id: m[1], active: /\bclass="[^"]*\bactive\b/.test(m[0]) }));
const outsideRaw = h => h.replace(/<(script|style|textarea|title|pre|noscript)\b[\s\S]*?<\/\1\s*>/gi, ' ');
const KEEP = /^<!--(?:#|\/?email_off|\s*(?:\[if\b|<!\[endif\]|Google tag \(gtag\.js\)|Google AdSense\b|ADSENSE-SITE-OWNERSHIP|google_ad_section|googleo(?:ff|n)\b))/;

console.log('--- §1 time-left / next-prayer: one .page block, H1 intact ---');
for (const [fam, prefix, h1] of [['time-left', '/time-left-until-next-prayer-in-', 'tl-h1'], ['next-prayer', '/next-prayer-in-', 'npt-h1']]) {
    let one = 0, active = 0, h1in = 0, robots = 0, n = 0;
    for (const l of LANGS) for (const c of ['riyadh', 'london', 'jakarta']) {
        const r = await get(l + prefix + c); n++;
        const blocks = pageBlocks(r.text);
        if (r.status === 200 && blocks.length === 1 && blocks[0].id === 'page-prayer-times') one++;
        if (blocks.length === 1 && blocks[0].active) active++;
        if (r.text.includes('id="' + h1 + '"') && (r.text.match(/<h1\b/g) || []).length === 1) h1in++;
        if (/<meta name="robots" content="index,follow/.test(r.text) && /<link rel="canonical"/.test(r.text) && (r.text.match(/hreflang=/g) || []).length >= 11) robots++;
    }
    ok(one === n, `${fam}: ${one}/${n} pages ship exactly one .page block (#page-prayer-times)`);
    ok(active === n, `${fam}: ${active}/${n} keep it active`);
    ok(h1in === n, `${fam}: ${h1in}/${n} keep #${h1} as the single H1`);
    ok(robots === n, `${fam}: ${robots}/${n} keep robots index + canonical + 11 hreflang`);
}
{
    const r = await get('/time-left-until-next-prayer-in-riyadh');
    ok(/id="tl-hero"/.test(r.text) && /id="tl-sticky"/.test(r.text), 'time-left keeps #tl-hero and #tl-sticky');
    const n = await get('/next-prayer-in-riyadh');
    ok(/id="npt-hero"/.test(n.text), 'next-prayer keeps #npt-hero');
    const p = await get('/');
    ok(pageBlocks(p.text).length >= 20, `home keeps its full shell (${pageBlocks(p.text).length} blocks) — out of scope of this ticket`);
}

console.log('\n--- §2 _pageKeepGuardOk fails safe (unit test on the server.js source) ---');
{
    const src = fs.readFileSync(new URL('../server.js', import.meta.url), 'utf8');
    const fnSrc = (name) => { const i = src.indexOf('function ' + name + '('); let d = 0, j = src.indexOf('{', i); for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}' && --d === 0) return src.slice(i, k + 1); } return ''; };
    const constSrc = (name) => (src.match(new RegExp('^const ' + name + '\\s*=.*$', 'm')) || [''])[0];
    const ctx = {}; vm.createContext(ctx);
    vm.runInContext([constSrc('_PAGE_KEEP_LANG_RE'), constSrc('_PAGE_KEEP_TL_RE'), constSrc('_PAGE_KEEP_NPT_RE'), constSrc('_PAGE_PRAYER_TIMES_OPEN_RE'), fnSrc('_pageBlockEnd'), fnSrc('_pageKeepGuardOk'), 'this.g = _pageKeepGuardOk;'].join('\n'), ctx);
    const doc = (cls, inside) => `<div class="${cls}" id="page-prayer-times"><div>${inside ? '<h1 id="tl-h1">x</h1>' : ''}</div></div><h1 id="tl-h1-out">y</h1><div class="page" id="page-moon"><p>m</p></div>`;
    ok(ctx.g(doc('page active', true), '/en/time-left-until-next-prayer-in-riyadh', 'page-prayer-times') === true, 'active block + marker inside → strip allowed');
    ok(ctx.g(doc('page', true), '/time-left-until-next-prayer-in-riyadh', 'page-prayer-times') === false, 'block NOT active → refused (page kept whole)');
    ok(ctx.g(doc('page active', false).replace('tl-h1-out', 'tl-h1'), '/time-left-until-next-prayer-in-riyadh', 'page-prayer-times') === false, 'H1 marker OUTSIDE the kept block → refused');
    ok(ctx.g('<div class="page active" id="page-prayer-times"><h1 id="npt-h1">x</h1></div>', '/fr/next-prayer-in-paris', 'page-prayer-times') === true, 'next-prayer marker #npt-h1 recognised');
    ok(ctx.g('<div class="page active" id="page-prayer-times"><h1 id="tl-h1">x</h1></div>', '/fr/next-prayer-in-paris', 'page-prayer-times') === false, 'next-prayer route with only #tl-h1 → refused');
    ok(ctx.g('anything', '/prayer-times-in-riyadh', 'page-prayer-times') === true, 'pre-existing rules are not affected by the guard');
    // the guard must stay WIRED at the exit-A call site (a unit test alone would not catch its removal)
    ok(src.includes('if (_keepPageId && _pageKeepGuardOk(html, urlPath, _keepPageId)) html = _stripForeignPageBlocks(html, _keepPageId);'), 'guard is wired at the strip call site');
    ok(/html = _stripHtmlComments\(html\);\s*\r?\n\s*\r?\n\s*\/\/ ADSENSE-STRICT-CSP-MIGRATION-1: the LAST transform/.test(src), 'comment strip runs right before the nonce substitution at exit A');
    // _dropScriptTagBySrc only removes a REAL external <script src> tag
    vm.runInContext(fnSrc('_dropScriptTagBySrc') + ';this.d = _dropScriptTagBySrc;', ctx);
    const keep1 = '<script defer data-src="js/azkar-data.js" src="js/other.js"></script>';
    const keep2 = '<script>var s=\'<script src="js/azkar-data.js"></scr\'+\'ipt>\';</script>';
    ok(ctx.d(keep1, 'js/azkar-data.js') === keep1, 'data-src= is never mistaken for src=');
    ok(ctx.d(keep2, 'js/azkar-data.js') === keep2, 'an inline script that merely contains the string is never cut');
    ok(ctx.d('a\r\n    <script nonce="N" defer src="js/azkar-data.js?v=55"></script>\r\nb', 'js/azkar-data.js') === 'a\r\nb', 'the real tag and its line are removed');
}

console.log('\n--- §3 developer HTML comments are stripped (KEEP list only) ---');
for (const p of ['/', '/en', '/prayer-times-in-riyadh', '/en/qibla-in-cairo', '/time-left-until-next-prayer-in-riyadh', '/de/next-prayer-in-berlin',
    '/moon', '/en/moon/egypt/cairo/2026/10', '/moon/egypt/cairo/2026/10/02', '/hijri-date/1448-04-10', '/en/today-hijri-date', '/hijri-calendar/1448',
    '/azkar', '/azkar/morning-azkar', '/en/azkar/prayer-azkar', '/quran', '/quran/al-baqarah', '/ramadan-countdown', '/zakat-calculator', '/msbaha',
    '/date-converter', '/prayer-times-worldwide', '/prayer-times-in-egypt', '/en/moon/egypt', '/en/guides', '/en/privacy']) {
    const r = await get(p);
    const rest = outsideRaw(r.text);
    const comments = rest.match(/<!--[\s\S]*?-->/g) || [];
    const dev = comments.filter(c => !KEEP.test(c));
    const orphans = (rest.replace(/<!--[\s\S]*?-->/g, '').match(/-->/g) || []).length;
    ok(r.status === 200 && dev.length === 0 && orphans === 0 && !/<!--SHARED-/.test(r.text), `${p}: 0 developer comments (kept ${comments.length}), 0 orphan '-->'`);
}

console.log('\n--- §4 azkar data scripts only on the azkar list routes ---');
for (const [p, data, l10n] of [['/azkar/morning-azkar', true, false], ['/en/azkar/evening-azkar', true, false], ['/azkar/prayer-azkar', true, true], ['/bn/azkar/prayer-azkar', true, true],
    ['/azkar', false, false], ['/', false, false], ['/prayer-times-in-riyadh', false, false], ['/time-left-until-next-prayer-in-riyadh', false, false], ['/en/next-prayer-in-london', false, false],
    ['/qibla-in-cairo', false, false], ['/moon/egypt/cairo/2026/10/02', false, false], ['/hijri-date/1448-04-10', false, false], ['/quran/al-baqarah', false, false], ['/ramadan-countdown', false, false]]) {
    const r = await get(p);
    const hasD = /<script\b[^>]*\bsrc="\/?js\/azkar-data\.js/.test(r.text), hasL = /<script\b[^>]*\bsrc="\/?js\/azkar-prayer-ui-l10n\.js/.test(r.text);
    ok(hasD === data && hasL === l10n, `${p}: azkar-data ${hasD ? 'present' : 'absent'}, l10n ${hasL ? 'present' : 'absent'}`);
}
{
    const idx = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    ok((idx.match(/src="js\/azkar-data\.js\?v=\d+"/g) || []).length === 1 && (idx.match(/src="js\/azkar-prayer-ui-l10n\.js\?v=\d+"/g) || []).length === 1, 'the template still carries exactly one tag of each (the server scopes them)');
}

console.log('\n--- §5 sw.js precache ---');
{
    const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
    const list = (sw.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/) || [, ''])[1].match(/'[^']+'/g).map(s => s.slice(1, -1));
    for (const gone of ['/js/i18n.js?v=194', '/js/prayer-times.js?v=54', '/js/moon-chart.js?v=10', '/js/azkar-data.js?v=2', '/js/app.js?v=817'])
        ok(!list.includes(gone), 'obsolete precache entry removed: ' + gone);
    const idx = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const tpl = ['countries.html', 'prayer-times-cities.html', 'guides.html', 'legal.html'].map(f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8')).join('\n');
    for (const u of list) ok(idx.includes(u.slice(1)) || idx.includes(u) || tpl.includes(u.slice(1)) || tpl.includes(u) || /logo-white\.svg/.test(u), 'kept entry is still referenced: ' + u);
    ok(/const CACHE_VERSION = 'v555';/.test(sw), 'CACHE_VERSION unchanged (v555)');
    // D1: a same-version sw.js update must not force-reload open tabs; only a real purge of an older tp-static-* cache
    //     (a CACHE_VERSION bump) keeps the one-time SW_ACTIVATED reload.
    ok(/purgedOldStatic = old\.some\(\(k\) => k\.indexOf\('tp-static-'\) === 0\);/.test(sw), 'activate records whether an OLDER tp-static-* cache was purged');
    ok(/\.then\(\(\) => \(purgedOldStatic \? self\.clients\.matchAll\(\{ type: 'window' \}\) : \[\]\)\)/.test(sw), 'SW_ACTIVATED is posted only when an older static cache was purged');
    ok((sw.match(/postMessage\(\{ type: 'SW_ACTIVATED'/g) || []).length === 1, 'exactly one SW_ACTIVATED broadcast site');
}

console.log('\n--- §6 /audio/adhan.mp3 byte ranges ---');
{
    const full = await fetch(B + '/audio/adhan.mp3'); const fb = Buffer.from(await full.arrayBuffer());
    ok(full.status === 200 && full.headers.get('accept-ranges') === 'bytes' && Number(full.headers.get('content-length')) === fb.length, `no Range → 200 full (${fb.length} B)`);
    const z = await fetch(B + '/audio/adhan.mp3', { headers: { Range: 'bytes=0-' } }); await z.arrayBuffer();
    ok(z.status === 200 && !z.headers.get('content-range'), 'bytes=0- (whole file) → cacheable 200, no Content-Range');
    const zz = await fetch(B + '/audio/adhan.mp3', { headers: { Range: `bytes=0-${fb.length - 1}` } }); await zz.arrayBuffer();
    ok(zz.status === 206 && zz.headers.get('content-range') === `bytes 0-${fb.length - 1}/${fb.length}`, 'bytes=0-(size-1) (explicit, WebKit style) → 206 with Content-Range');
    const sp = await fetch(B + '/audio/adhan.mp3', { headers: { Range: 'bytes=0-1' } }); const spb = Buffer.from(await sp.arrayBuffer());
    ok(sp.status === 206 && spb.length === 2 && sp.headers.get('content-range') === `bytes 0-1/${fb.length}`, 'Safari probe bytes=0-1 → 206, 2 bytes');
    const r = await fetch(B + '/audio/adhan.mp3', { headers: { Range: 'bytes=1000-1999' } }); const rb = Buffer.from(await r.arrayBuffer());
    ok(r.status === 206 && r.headers.get('content-range') === `bytes 1000-1999/${fb.length}` && rb.length === 1000 && rb.equals(fb.subarray(1000, 2000)), 'bytes=1000-1999 → 206, exact Content-Range and bytes');
    const s = await fetch(B + '/audio/adhan.mp3', { headers: { Range: 'bytes=-100' } }); const sb = Buffer.from(await s.arrayBuffer());
    ok(s.status === 206 && sb.equals(fb.subarray(fb.length - 100)), 'suffix bytes=-100 → 206, last 100 bytes');
    const u = await fetch(B + '/audio/adhan.mp3', { headers: { Range: `bytes=${fb.length}-` } }); await u.arrayBuffer();
    ok(u.status === 416 && u.headers.get('content-range') === `bytes */${fb.length}`, 'unsatisfiable → 416 with Content-Range bytes */size');
    const m = await fetch(B + '/audio/adhan.mp3', { headers: { Range: 'bytes=0-1,5-9' } }); await m.arrayBuffer();
    ok(m.status === 200, 'multi-range → ignored → 200');
    const png = await fetch(B + '/og-images/og-ar.png', { headers: { Range: 'bytes=0-10' } }); await png.arrayBuffer();
    ok(png.status === 200, 'other static types still ignore Range (og PNG → 200)');
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
