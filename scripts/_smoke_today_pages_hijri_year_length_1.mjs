// TODAY-PAGES-ACCURACY-1 item 2a (option A) — local regression guard (no network: outbound guard on every server,
//   every non-loopback host unresolvable in Chrome, ad / analytics URLs blocked, ADSENSE_CLIENT=off).
//   Defect: the 6th info card of /today-hijri-date (+ 9 language copies) ("Leap Year" / «سنة كبيسة») was decided by
//   the tabular 30-year-cycle rule ((11*y + 14) % 30 < 11) in the HD-12 SSR block of server.js, not by the site's
//   own calendar (db/hijri/umm-al-qura.json). 1448 AH has 355 days in the table, but the card said "No (354 days)"
//   in all 10 languages — and the client never corrected it (updateHijriToday skips the rebuild when the grid
//   carries data-hd12-ssr). Fix A: _isLeap = (_getHijriYearLength(_hNow.year) === 355) — the client's own rule
//   (HijriDate.isHijriLeapYear). Same wording / strings; no js/app.js, i18n, ?v or table change.
//   BASE = clean production tree (env TP_BASE_ROOT), CAND = this tree. One BASE + one CAND server per test moment,
//   moved with the existing clock seam TP_HIJRI_RANGE_TEST_NOW; Chrome gets the same instant through a Date
//   override + the Asia/Riyadh timezone, so client and server agree on "today".
//   [U] the table: 1447=355, 1448=355, 1449=354, 1450=354; the tabular rule disagrees with it for 1448 and 1450
//       (and 64 of the 145 table years); the client HijriDate.isHijriLeapYear == (yearLength === 355) for every year.
//   [S] source: BASE has the tabular line (premise); CAND has no "% 30) < 11" anywhere and decides the card with
//       _getHijriYearLength(_hNow.year) === 355 inside the HD-12 block; the HD-12 block and the whole server.js are
//       byte-identical to BASE once those lines are cut; the 10 leapYes/leapNo strings are unchanged and equal to
//       the client's HT_I18N strings; js/hijri-date.js, js/i18n.js and db/hijri/umm-al-qura.json are untouched.
//   [R] raw SSR HTML, 8 moments x 10 languages (1447, both sides of 1 Muharram 1448, 1448, last day of 1448,
//       1 Muharram 1449, 1449, 1450): CAND card 6 == the language's leapYes/leapNo picked by the table length for
//       the current year, every time; BASE card 6 == the tabular rule, wrong at every 1448 / 1450 moment (defect
//       reproduced), right by coincidence for 1447 / 1449; cards 1-5 identical; the whole page identical BASE vs
//       CAND once card 6 is swapped (per-request noise normalised).
//   [P] same moment: the day count in the today card == "Total Days" on /hijri-calendar/{current year} (ar/en/fr).
//   [E] other pages identical BASE vs CAND at the 1448 moment (hijri hub / year / month pages, converter, home,
//       prayer, moon, qibla) after noise normalisation.
//   [B] headless Chrome at a 1447, a 1448 and a 1449 moment, ar + en + bn: the client "today" matches the server;
//       hydrated card 6 == raw SSR card 6 (marker kept); the card the client builds itself when the marker is
//       removed == CAND's SSR card (BASE: differs for 1448 = the SSR/client contradiction); #page-hijri-today DOM
//       after JS identical BASE vs CAND apart from card 6; same exceptions on both sides.
//   node scripts/_smoke_today_pages_hijri_year_length_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT, TP_CHROME)
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
const P0 = Number(process.env.TP_SMOKE_PORT || 9760);   // moment i -> BASE P0+2i, CAND P0+2i+1; CDP P0+19
const CDP_PORT = P0 + 19;
const AD_BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*', '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*gstatic.com/ads*'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const B_LANGS = ['ar', 'en', 'bn'];
// the card's existing wording (server.js _HD12_INFO / js/app.js HT_I18N) — [yes (355), no (354)]; NOT changed by the fix
const LEAP = {
    ar: ['نعم (355 يوماً)', 'لا (354 يوماً)'], en: ['Yes (355 days)', 'No (354 days)'], fr: ['Oui (355 jours)', 'Non (354 jours)'],
    tr: ['Evet (355 gün)', 'Hayır (354 gün)'], ur: ['ہاں (355 دن)', 'نہیں (354 دن)'], de: ['Ja (355 Tage)', 'Nein (354 Tage)'],
    id: ['Ya (355 hari)', 'Tidak (354 hari)'], es: ['Sí (355 días)', 'No (354 días)'], bn: ['হ্যাঁ (৩৫৫ দিন)', 'না (৩৫৪ দিন)'],
    ms: ['Ya (355 hari)', 'Tidak (354 hari)']
};
const MOMENTS = [
    { now: '2026-01-15T09:00:00Z', label: '26 Rajab 1447', chrome: true },
    { now: '2026-06-15T20:59:59Z', label: 'last day of 1447 (Riyadh 23:59:59)' },
    { now: '2026-06-15T21:00:00Z', label: '1 Muharram 1448 (Riyadh midnight)' },
    { now: '2026-10-18T15:00:00Z', label: '7 Jumada al-Awwal 1448 (today)', chrome: true, other: true },
    { now: '2027-06-05T20:59:59Z', label: 'last day of 1448 (30 Dhu al-Hijjah)' },
    { now: '2027-06-05T21:00:00Z', label: '1 Muharram 1449 (Riyadh midnight)' },
    { now: '2027-10-15T09:00:00Z', label: '1449', chrome: true },
    { now: '2028-06-15T09:00:00Z', label: '22 Muharram 1450 (next year the tabular rule gets wrong)' }
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity', 'user-agent': 'Mozilla/5.0 smoke' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, h: {}, b: '' })); r.setTimeout(30000, () => r.destroy()); r.end();
});
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + String(d).slice(0, 900) : '')); } };
// per-request / per-checkout noise only
const noise = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')
    .replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA')
    .replace(/js\/app\.js\?v=\d+/g, 'js/app.js?v=N');
const firstDiff = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i >= a.length && a.length === b.length ? '' : '@' + i + ' A…' + a.slice(Math.max(0, i - 100), i + 140) + '…  B…' + b.slice(Math.max(0, i - 100), i + 140) + '…'; };
const bnDigits = (s) => String(s).replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
const dayCount = (s) => { const m = bnDigits(s).match(/\b(35[345])\b/); return m ? Number(m[1]) : null; };
// ---- the table (the site's calendar) + the Riyadh civil date of an instant -> expected Hijri date
const TABLE = require(path.join(ROOT, 'db/hijri/umm-al-qura.json'));
const RIY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' });
const dayNo = (ymd) => { const [y, m, d] = ymd.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
function hijriAt(iso) {
    const ymd = RIY.format(new Date(iso)); const n = dayNo(ymd);
    let hy = null;
    for (let y = TABLE.range.startYear; y <= TABLE.range.endYear; y++) { if (dayNo(TABLE.years[y].yearStart) <= n) hy = y; else break; }
    let rest = n - dayNo(TABLE.years[hy].yearStart), hm = 1;
    while (rest >= TABLE.years[hy].months[hm - 1]) { rest -= TABLE.years[hy].months[hm - 1]; hm++; }
    return { ymd, hy, hm, hd: rest + 1, len: TABLE.years[hy].yearLength };
}
const tabular = (y) => ((11 * y + 14) % 30) < 11;
// ---- card parsing: the 6 SSR cards of #hijri-today-info-grid
const CARD_RE = /<div class="info-card"><div class="info-card-label">([^<]*)<\/div><div class="info-card-value">([^<]*)<\/div><\/div>/g;
function cardsOf(html) {
    const at = html.indexOf('<div class="info-grid" id="hijri-today-info-grid"');
    if (at < 0) return null;
    const open = html.slice(at, html.indexOf('>', at) + 1);
    const seg = html.slice(at, at + 6000);
    const cards = [...seg.matchAll(CARD_RE)].slice(0, 6).map((m) => ({ label: m[1], value: m[2], raw: m[0] }));
    return { marker: /data-hd12-ssr="1"/.test(open), cards };
}
const boot = (root, port, now) => spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0', TP_HIJRI_RANGE_TEST_NOW: now } });
const stop = (k) => new Promise((res) => { if (!k || k.exitCode !== null) return res(); k.once('exit', () => res()); try { k.kill(); } catch (_) { res(); } setTimeout(res, 5000); });
function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const handlers = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; } if (d.method) handlers.forEach((h) => h(d)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    return new Promise((res) => { ws.onopen = () => res({ send, on: (h) => handlers.push(h), close: () => ws.close() }); });
}
// ---------------------------------------------------------------- [U]
console.log('-- [U] the Umm al-Qura table (the site calendar) vs the tabular rule');
const LEN = (y) => TABLE.years[y].yearLength;
ok(LEN(1447) === 355 && LEN(1448) === 355 && LEN(1449) === 354 && LEN(1450) === 354, '[U] table: 1447=355, 1448=355, 1449=354, 1450=354', [1447, 1448, 1449, 1450].map(LEN).join(','));
ok(tabular(1448) === false && tabular(1450) === true && tabular(1447) === true && tabular(1449) === false, '[U] tabular rule: 1448 "354" and 1450 "355" (both wrong); 1447 / 1449 agree by coincidence');
let disagree = 0;
for (let y = TABLE.range.startYear; y <= TABLE.range.endYear; y++) { if (tabular(y) !== (LEN(y) === 355)) disagree++; }
ok(disagree === 64, '[U] the tabular rule disagrees with the table in ' + disagree + ' of ' + (TABLE.range.endYear - TABLE.range.startYear + 1) + ' table years');
globalThis._HIJRI_UMM_AL_QURA = TABLE;
const HijriDate = require(path.join(ROOT, 'js/hijri-date.js'));
let cliBad = [];
for (let y = TABLE.range.startYear; y <= TABLE.range.endYear; y++) { if (HijriDate.isHijriLeapYear(y) !== (LEN(y) === 355) || HijriDate.getHijriYearLength(y) !== LEN(y)) cliBad.push(y); }
ok(cliBad.length === 0, '[U] client HijriDate.isHijriLeapYear(y) == (yearLength === 355) and getHijriYearLength == table, every year 1356-1500', cliBad.join(','));
// ---------------------------------------------------------------- [S]
console.log('-- [S] source');
const srvB = fs.readFileSync(path.join(BASE_ROOT, 'server.js'), 'utf8'), srvC = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const TAB_LINE = 'const _isLeap = ((11 * _hNow.year + 14) % 30) < 11;';
const FIX_LINE = 'const _isLeap = (_getHijriYearLength(_hNow.year) === 355);';
ok(srvB.includes(TAB_LINE), '[S] BASE decides the card with the tabular rule (defect premise)');
ok(!/%\s*30\)\s*<\s*11/.test(srvC) && !srvC.includes(TAB_LINE), '[S] CAND server.js has no tabular "% 30) < 11" rule anywhere');
const hd12 = (s) => { const a = s.indexOf('const _HD12_INFO = {'), b = s.indexOf('} catch (_hd12Err)'); return a > 0 && b > a ? s.slice(a, b) : ''; };
const blkB = hd12(srvB), blkC = hd12(srvC);
const fixAt = blkC.indexOf(FIX_LINE);
ok(srvC.split(FIX_LINE).length === 2 && fixAt > blkC.indexOf('const _monthName = _info.hM[_hNow.month - 1];') && fixAt < blkC.indexOf('const _cards = ['), '[S] CAND: exactly one "' + FIX_LINE + '", inside the HD-12 block, before the cards');
// the decision lines = the comment line(s) right above _isLeap + the _isLeap line itself
const LEAP_RE = /(?:[ \t]*\/\/[^\n]*\n)+[ \t]*const _isLeap = [^\n]*\n/;
const cutB = blkB.replace(LEAP_RE, ''), cutC = blkC.replace(LEAP_RE, '');
ok(blkB && blkC && cutB !== blkB && cutC !== blkC && cutB === cutC, '[S] HD-12 block: CAND == BASE byte for byte once the _isLeap decision (+ its comment) is cut from both (same dictionaries, same cards, same markup)', firstDiff(cutB, cutC));
const fileCutB = srvB.replace(blkB, () => cutB), fileCutC = srvC.replace(blkC, () => cutC);
ok(fileCutB === fileCutC, '[S] server.js: CAND == BASE byte for byte outside the _isLeap decision', firstDiff(fileCutB, fileCutC));
ok((srvC.match(/\r\n/g) || []).length === (srvC.match(/\n/g) || []).length, '[S] CAND server.js keeps CRLF line endings throughout');
const appC = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
const wordBad = LANGS.filter((L) => !(blkC.includes(`leapYes: '${LEAP[L][0]}', leapNo: '${LEAP[L][1]}'`) && appC.includes(`leapYes:'${LEAP[L][0]}', leapNo:'${LEAP[L][1]}'`)));
ok(wordBad.length === 0, '[S] wording unchanged: the 10 server leapYes/leapNo pairs are the existing strings and equal the client HT_I18N pairs', wordBad.join(','));
for (const f of ['js/hijri-date.js', 'js/i18n.js', 'db/hijri/umm-al-qura.json', 'js/moon.js']) {
    ok(fs.readFileSync(path.join(BASE_ROOT, f)).equals(fs.readFileSync(path.join(ROOT, f))), '[S] ' + f + ' untouched (byte-identical to BASE)');
}
// ---------------------------------------------------------------- moments
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-hyl-'));
let chrome = null, cd = null;
const kids = [];
const summary = [];
try {
    if (MOMENTS.some((m) => m.chrome)) {
        chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
        let ws = null;
        for (let i = 0; i < 60 && !ws; i++) { try { const r = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/new?about:blank', { method: 'PUT' }); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl; } catch (_e) { /* not up */ } if (!ws) await sleep(250); }
        if (!ws) throw new Error('chrome did not start');
        cd = await cdp(ws);
    }
    let uncaught = [];
    if (cd) {
        cd.on((d) => { if (d.method === 'Runtime.exceptionThrown') { const e = (d.params && d.params.exceptionDetails) || {}; uncaught.push(String((e.exception && e.exception.description) || e.text || '').split('\n')[0]); } });
        await cd.send('Network.enable'); await cd.send('Network.setBlockedURLs', { urls: AD_BLOCK }); await cd.send('Network.setBypassServiceWorker', { bypass: true }); await cd.send('Network.setCacheDisabled', { cacheDisabled: true });
        await cd.send('Page.enable'); await cd.send('Runtime.enable');
        await cd.send('Emulation.setTimezoneOverride', { timezoneId: 'Asia/Riyadh' });
    }
    const ev = async (expr) => { const r = await cd.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
    let initId = null;
    const CARD6_JS = "(()=>{const g=document.getElementById('hijri-today-info-grid');if(!g)return null;const v=g.querySelectorAll('.info-card .info-card-value');return {marker:g.dataset.hd12Ssr||null,n:g.querySelectorAll('.info-card').length,card6:v[5]?v[5].textContent:null}})()";
    const REBUILD_JS = "(()=>{const g=document.getElementById('hijri-today-info-grid');delete g.dataset.hd12Ssr;g.innerHTML='';updateHijriToday();const v=g.querySelectorAll('.info-card .info-card-value');return {n:g.querySelectorAll('.info-card').length,card6:v[5]?v[5].textContent:null}})()";
    const DOM_JS = "(()=>{const r=document.getElementById('page-hijri-today')||document.body;const c=r.cloneNode(true);const v=c.querySelectorAll('#hijri-today-info-grid .info-card .info-card-value');if(v[5])v[5].textContent='CARD6';return c.outerHTML})()";
    const domNorm = (s) => String(s || '').replace(/nonce="[^"]*"/g, '');
    const load = async (port, p, nowIso) => {
        if (initId) await cd.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: initId });
        // the test instant for the client clock (moves on from there), like the server seam
        const src = '(()=>{try{localStorage.clear();sessionStorage.clear();}catch(_e){}const R=Date,T=' + Date.parse(nowIso) + ',off=T-R.now();' +
            'class D extends R{constructor(...a){if(a.length===0)super(R.now()+off);else super(...a);}static now(){return R.now()+off;}}' +
            'D.UTC=R.UTC;D.parse=R.parse;globalThis.Date=D;})()';
        const r = await cd.send('Page.addScriptToEvaluateOnNewDocument', { source: src });
        initId = r.result && r.result.identifier;
        uncaught = [];
        await cd.send('Page.navigate', { url: 'http://127.0.0.1:' + port + p });
        for (let i = 0; i < 80; i++) { await sleep(250); if ((await ev('document.readyState')) === 'complete') break; }
        await sleep(2000);
        const today = await ev('(()=>{const h=HijriDate.getToday();return {y:h.year,m:h.month,d:h.day,len:HijriDate.getHijriYearLength(h.year),leap:HijriDate.isHijriLeapYear(h.year)}})()');
        const res = { lang: await ev('document.documentElement.lang'), today, hyd: await ev(CARD6_JS), dom: await ev(DOM_JS), uncaught: uncaught.slice() };
        res.rebuilt = await ev(REBUILD_JS);
        return res;
    };
    for (let i = 0; i < MOMENTS.length; i++) {
        const M = MOMENTS[i], X = hijriAt(M.now);
        const want355 = X.len === 355, tabWrong = tabular(X.hy) !== want355;
        const port = { base: P0 + 2 * i, cand: P0 + 2 * i + 1 };
        console.log(`\n== moment ${M.now} (${M.label}) -> Riyadh ${X.ymd} = ${X.hd}/${X.hm}/${X.hy} AH, table length ${X.len}, tabular says ${tabular(X.hy) ? 355 : 354}`);
        for (const pt of [port.base, port.cand]) { if ((await get(pt, '/health')).st !== 0) throw new Error('port ' + pt + ' is already in use - set TP_SMOKE_PORT'); }
        const kB = boot(BASE_ROOT, port.base, M.now), kC = boot(ROOT, port.cand, M.now); kids.push(kB, kC);
        for (const pt of [port.base, port.cand]) { for (let t = 0; t < 400; t++) { if ((await get(pt, '/health')).st === 200) break; await sleep(250); } }
        await sleep(300);
        ok(kB.exitCode === null && kC.exitCode === null, '[R] both servers are this run\'s own processes (alive after /health)');
        // ------------------------------------------------ [R]
        let baseWrong = 0, candWrong = 0; const rBad = [], same15Bad = [], pageBad = [], dateBad = [];
        const todayCard = {};
        for (const L of LANGS) {
            const p = (L === 'ar' ? '' : '/' + L) + '/today-hijri-date';
            const want = want355 ? LEAP[L][0] : LEAP[L][1];
            const tabVal = tabular(X.hy) ? LEAP[L][0] : LEAP[L][1];
            let b = await get(port.base, p), c = await get(port.cand, p);
            const cb = cardsOf(b.b), cc = cardsOf(c.b);
            if (!(b.st === 200 && c.st === 200 && cb && cc && cb.marker && cc.marker && cb.cards.length === 6 && cc.cards.length === 6)) { rBad.push(L + ' st ' + b.st + '/' + c.st + ' cards ' + (cb && cb.cards.length) + '/' + (cc && cc.cards.length)); continue; }
            if (!(cc.cards[1].value.includes(String(X.hy)) && cc.cards[4].value.includes(String(X.hy)) && cc.cards[1].value.startsWith(X.hd + ' '))) dateBad.push(L + ' ' + cc.cards[1].value);
            for (let k = 0; k < 5; k++) { if (cb.cards[k].raw !== cc.cards[k].raw) same15Bad.push(L + '#' + (k + 1)); }
            const bv = cb.cards[5].value, cv = cc.cards[5].value;
            todayCard[L] = { base: bv, cand: cv };
            if (bv !== want) baseWrong++;
            if (cv !== want) { candWrong++; rBad.push(L + ' CAND "' + cv + '" want "' + want + '"'); }
            if (bv !== tabVal) rBad.push(L + ' BASE "' + bv + '" is not the tabular value "' + tabVal + '"');
            // only card 6 may differ: swap it into BASE, then the whole page must match
            let swapped = b.b.replace(cb.cards[5].raw, () => cc.cards[5].raw);
            if (noise(swapped) !== noise(c.b)) { await sleep(1500); b = await get(port.base, p); c = await get(port.cand, p); const nc = cardsOf(c.b).cards[5].raw; swapped = b.b.replace(cardsOf(b.b).cards[5].raw, () => nc); }
            if (noise(swapped) !== noise(c.b)) pageBad.push(L + ' ' + firstDiff(noise(swapped), noise(c.b)));
        }
        console.log('   card 6  BASE: ' + LANGS.map((L) => todayCard[L] ? todayCard[L].base : '?').join(' | '));
        console.log('   card 6  CAND: ' + LANGS.map((L) => todayCard[L] ? todayCard[L].cand : '?').join(' | '));
        ok(dateBad.length === 0, '[R] the server clock seam took effect: card 2 / card 5 show ' + X.hd + ' … ' + X.hy + ' AH (10 languages)', dateBad.join(' ; '));
        ok(candWrong === 0 && rBad.length === 0, '[R] CAND card 6 == table (' + X.len + ' days -> "' + (want355 ? LEAP.en[0] : LEAP.en[1]) + '" …) in all 10 languages; BASE card 6 == the tabular rule', rBad.join(' ; '));
        if (tabWrong) ok(baseWrong === 10, '[R] BASE reproduces the defect: card 6 contradicts the table in ' + baseWrong + '/10 languages ("' + (todayCard.en && todayCard.en.base) + '" vs ' + X.len + ' days)');
        else ok(baseWrong === 0, '[R] BASE happens to be right for ' + X.hy + ' (the tabular rule agrees with the table this year): ' + baseWrong + '/10 wrong');
        ok(same15Bad.length === 0, '[R] cards 1-5 (day, Hijri date, Gregorian date, month, year) identical BASE vs CAND', same15Bad.join(','));
        ok(pageBad.length === 0, '[R] whole page identical BASE vs CAND once card 6 is swapped (10 languages, noise normalised)', pageBad.join(' ; '));
        summary.push({ moment: M.now, hy: X.hy, len: X.len, base: todayCard.en && todayCard.en.base, cand: todayCard.en && todayCard.en.cand, baseWrong, candWrong });
        // ------------------------------------------------ [P]
        const pBad = [];
        for (const L of ['ar', 'en', 'fr']) {
            const y = await get(port.cand, (L === 'ar' ? '' : '/' + L) + '/hijri-calendar/' + X.hy);
            const g = y.b.indexOf('id="hyear-info-grid"');
            const vals = g > 0 ? [...y.b.slice(g, g + 4000).matchAll(/<div class="info-card-value">([^<]*)<\/div>/g)].map((m) => m[1]) : [];
            const yearDays = vals[1] ? dayCount(vals[1]) : null;
            if (!(y.st === 200 && yearDays === X.len && todayCard[L] && dayCount(todayCard[L].cand) === yearDays)) pBad.push(L + ' year page ' + y.st + ' "' + vals[1] + '" vs today CAND "' + (todayCard[L] && todayCard[L].cand) + '"');
        }
        const baseContra = ['ar', 'en', 'fr'].filter((L) => todayCard[L] && dayCount(todayCard[L].base) !== X.len).length;
        ok(pBad.length === 0, '[P] CAND: today card day count == "Total Days" on /hijri-calendar/' + X.hy + ' (= ' + X.len + ') in ar/en/fr' + (tabWrong ? ' (BASE contradicts it in ' + baseContra + '/3)' : ''), pBad.join(' ; '));
        // ------------------------------------------------ [E]
        if (M.other) {
            const OTHER = ['/hijri-calendar', '/en/hijri-calendar', '/hijri-calendar/' + X.hy, '/en/hijri-calendar/' + X.hy, '/bn/hijri-calendar/' + X.hy, '/hijri-calendar/' + (X.hy - 1), '/en/hijri-calendar/' + (X.hy + 1),
                '/hijri-calendar/' + X.hy + '-' + String(X.hm).padStart(2, '0'), '/en/hijri-calendar/' + X.hy + '-' + String(X.hm).padStart(2, '0'), '/date-converter', '/en/date-converter',
                '/', '/en', '/fr', '/prayer-times-in-makkah', '/en/prayer-times-in-london', '/moon', '/en/moon', '/qibla'];
            let eOk = 0; const eBad = [];
            for (const p of OTHER) {
                let b = await get(port.base, p), c = await get(port.cand, p);
                if (noise(b.b) !== noise(c.b)) { await sleep(1500); b = await get(port.base, p); c = await get(port.cand, p); }
                if (b.st === c.st && b.st === 200 && noise(b.b) === noise(c.b)) eOk++; else eBad.push(p + ' ' + b.st + '/' + c.st + ' ' + firstDiff(noise(b.b), noise(c.b)).slice(0, 300));
            }
            ok(eOk === OTHER.length, '[E] ' + OTHER.length + ' other URLs (hijri hub / year / month pages, converter, home, prayer, moon, qibla) answer 200 with identical HTML BASE vs CAND', eBad.join(' ; '));
        }
        // ------------------------------------------------ [B]
        if (M.chrome && cd) {
            for (const L of B_LANGS) {
                const p = (L === 'ar' ? '' : '/' + L) + '/today-hijri-date';
                const want = want355 ? LEAP[L][0] : LEAP[L][1];
                const B = await load(port.base, p, M.now), C = await load(port.cand, p, M.now);
                console.log(`   · Chrome ${p}: BASE raw→hydrated "${todayCard[L].base}"→"${B.hyd && B.hyd.card6}", client rebuild "${B.rebuilt && B.rebuilt.card6}" | CAND "${todayCard[L].cand}"→"${C.hyd && C.hyd.card6}", client rebuild "${C.rebuilt && C.rebuilt.card6}"`);
                ok(B.lang === L && C.lang === L && B.today && C.today && B.today.y === X.hy && C.today.y === X.hy && C.today.m === X.hm && C.today.d === X.hd && C.today.len === X.len && C.today.leap === want355,
                    '[B] ' + L + ': client "today" == server (' + X.hd + '/' + X.hm + '/' + X.hy + ', length ' + X.len + ') on both sides', JSON.stringify(B.today) + ' / ' + JSON.stringify(C.today));
                ok(C.hyd && C.hyd.marker === '1' && C.hyd.n === 6 && C.hyd.card6 === todayCard[L].cand && C.hyd.card6 === want, '[B] ' + L + ': CAND hydrated card 6 == raw SSR == table ("' + want + '")', JSON.stringify(C.hyd));
                ok(B.hyd && B.hyd.marker === '1' && B.hyd.card6 === todayCard[L].base, '[B] ' + L + ': BASE hydrated card 6 == its raw SSR (JS keeps the server value)', JSON.stringify(B.hyd));
                ok(C.rebuilt && C.rebuilt.n === 6 && C.rebuilt.card6 === C.hyd.card6, '[B] ' + L + ': CAND SSR == the card the client builds itself (marker removed, updateHijriToday())', JSON.stringify(C.rebuilt));
                if (tabWrong) ok(B.rebuilt && B.rebuilt.card6 === want && B.hyd.card6 !== B.rebuilt.card6, '[B] ' + L + ': BASE reproduces the SSR/client contradiction (SSR "' + (B.hyd && B.hyd.card6) + '" vs client "' + (B.rebuilt && B.rebuilt.card6) + '")');
                else ok(B.rebuilt && B.rebuilt.card6 === B.hyd.card6, '[B] ' + L + ': BASE SSR == client build for ' + X.hy + ' (coincidence year)');
                const dB = domNorm(B.dom), dC = domNorm(C.dom);
                ok(dB.length > 1000 && dB === dC, '[B] ' + L + ': #page-hijri-today DOM after JS identical BASE vs CAND apart from card 6 (' + dB.length + ' chars)', firstDiff(dB, dC));
                if (C.uncaught.length) console.log('     uncaught (CAND, compared with BASE): ' + C.uncaught.join(' | '));
                ok(JSON.stringify(B.uncaught.slice().sort()) === JSON.stringify(C.uncaught.slice().sort()), '[B] ' + L + ': same uncaught exceptions on BASE and CAND (' + B.uncaught.length + ' / ' + C.uncaught.length + ')', B.uncaught.join(' | ') + ' vs ' + C.uncaught.join(' | '));
            }
        }
        await stop(kB); await stop(kC);
    }
    if (cd) cd.close();
} finally {
    for (const k of kids) { try { if (k.exitCode === null) k.kill(); } catch (_) { /* gone */ } }
    if (chrome) { try { chrome.kill(); } catch (_) { /* gone */ } }
}
console.log('\n-- summary (en card 6 per moment)');
for (const s of summary) console.log(`   ${s.moment}  ${s.hy} AH (table ${s.len})  BASE "${s.base}" (${s.baseWrong}/10 wrong)  CAND "${s.cand}" (${s.candWrong}/10 wrong)`);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
