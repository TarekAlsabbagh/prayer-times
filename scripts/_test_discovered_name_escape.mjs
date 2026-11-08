// SSR-DISCOVERED-NAME-ESCAPE-1 — permanent local test (no network: every socket is loopback).
//
// Discovered places are written by an ANONYMOUS POST /api/place-selected and shown on the SSR city
// pages (prayer times, qibla, moon hub / year / month, next prayer, time left) in 10 languages. This test
// boots `server.js` twice:
//
//   A. production read path: Supabase pointed at an in-process loopback stand-in that serves rows
//      "as stored before the fix" (unsafe names, $-sequences, lone surrogates, bad type / timezone)
//      and records every write body. Checks the write clean / validator, the read clean of
//      /api/place-by-slug, /api/search-place and SSR, and page size / latency.
//   B. SSR layer on its own: Supabase off + the DISCOVERED_SSR_TEST_FIXTURE seam +
//      DISCOVERED_SSR_TEST_RAW_NAMES=1 (names reach SSR UNCLEANED), with a preload that records every
//      String.prototype.replace / replaceAll whose STRING replacement carries a marker name. Any such
//      call would expand $` $' $& inside a name, so the list must be empty; $-names must print literally
//      and the pages keep their normal size.
//
// Usage:  node scripts/_test_discovered_name_escape.mjs
//   env  TEST_PORT_A (9976) TEST_PORT_B (9977) FAKE_SUPA_PORT (9978)
//        TEST_NODE_PRELOAD  comma-separated extra `-r` modules for the server (e.g. an outbound guard)
//        TEST_ROOT          checkout whose server.js is tested (default: this repo)
// Exit code 0 = all checks pass.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.TEST_ROOT ? path.resolve(process.env.TEST_ROOT)          // run against another checkout
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT_A = Number(process.env.TEST_PORT_A || 9976);
const PORT_B = Number(process.env.TEST_PORT_B || 9977);
const SUPA_PORT = Number(process.env.FAKE_SUPA_PORT || 9978);
const PRELOAD = String(process.env.TEST_NODE_PRELOAD || '').split(',').map(s => s.trim()).filter(Boolean);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-name-escape-'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

let pass = 0, fail = 0;
function check(label, ok, extra) {
    if (ok) pass++; else fail++;
    console.log((ok ? 'PASS ' : 'FAIL ') + label + (extra ? '   ' + extra : ''));
}

// ── fixture rows (as stored, i.e. never cleaned) ─────────────────────────────────────────────
const L7 = ['en', 'fr', 'de', 'tr', 'id', 'es', 'ms'];
const names = (f, ar, ur, bn) => { const o = {}; for (const l of L7) o[l] = f(l); o.ar = ar; o.ur = ur; o.bn = bn; return o; };
const row = (slug, n, extra) => Object.assign({ id: 'id-' + slug, slug, type: 'city', country_code: 'us', lat: 40, lng: -75,
    timezone: 'America/New_York', names: n, aliases: {}, admin: {}, name_quality: {}, source: 'nominatim', source_id: null,
    verified: false, selected_count: 1 }, extra || {});
const DOLLAR = "A$`B$'C$&D$$E$1F";
const ROWS = {
    zqtwin:   row('zqtwin', names(l => 'Zq' + l + ' AxBxCxDxExF', 'مدينة سس', 'شہر سس', 'শহর সস'), { admin: { country: { en: 'Zqland plain' } } }),
    zqdollar: row('zqdollar', names(l => 'Zq' + l + ' ' + DOLLAR, "مدينة $`$'", "شہر $`$'", "শহর $`$'"), { admin: { country: { en: "Zqland $`$'" } } }),
    zqmark:   row('zqmark', names(l => 'Zq' + l + ' ZQMARK city', 'مدينة ززمرك', 'شہر ززمرك', 'শহর জজমক'),
        { aliases: { en: ['Zqalias ZQMARK'] }, admin: { country: { en: 'Zqland ZQMARK', ar: 'بلد ززمرك' }, state: 'Zqstate ZQMARK', originalName: 'Zqorig ZQMARK' } }),
    zqsur:    row('zqsur', names(l => 'Zq' + l + ' x\ud800y', 'مدينة', 'شہر', 'শহর')),
    zqtag:    row('zqtag', names(l => 'Zq' + l + ' </script><zqinj x=1>', 'مدينة', 'شہر', 'শহর'), { admin: { country: { en: 'Zqland<zqinj>' } } }),
    zqtype:   row('zqtype', names(l => 'Zq' + l + ' type', 'مدينة', 'شہر', 'শহর'),
        { type: 'city</script><zqinj>', source: 'nominatim</script><b>', source_id: '<zqinj>1', name_quality: { 'en<b>': 'curated', en: 'curated' } }),
    zqtz:     row('zqtz', names(l => 'Zq' + l + ' tz', 'مدينة', 'شہر', 'শহর'), { timezone: 'America/New_York</script><zqinj>' }),
    zqtz2:    row('zqtz2', names(l => 'Zq' + l + ' tz2', 'مدينة', 'شہر', 'শহর'), { timezone: 'Not/AZone' }),
    zqtzok:   row('zqtzok', names(l => 'Zq' + l + ' tzok', 'مدينة', 'شہر', 'শহর'), { timezone: 'America/Argentina/Buenos_Aires', type: 'town' }),
};
const FIXTURE = path.join(TMP, 'rows.json');
fs.writeFileSync(FIXTURE, JSON.stringify(ROWS));

// ── loopback Supabase stand-in ─────────────────────────────────────────────────────────────────
const writes = [];
const supa = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
        const u = req.url || '';
        const send = (d) => { res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Range': '0-0/' + (Array.isArray(d) ? d.length : 1) }); res.end(JSON.stringify(d)); };
        if (req.method === 'POST' && u.startsWith('/rest/v1/rpc/search_discovered_places')) {
            let q = ''; try { q = String(JSON.parse(body).q || '').toLowerCase(); } catch (_) {}
            return send(Object.values(ROWS).filter(r => r.slug.indexOf(q) !== -1));
        }
        const m = /^\/rest\/v1\/discovered_places\?(?:.*&)?slug=eq\.([^&]+)/.exec(u);
        if (req.method === 'GET' && m) { const r = ROWS[decodeURIComponent(m[1])]; return send(r ? [r] : []); }
        if (req.method === 'POST' || req.method === 'PATCH') {
            let b = {}; try { b = JSON.parse(body); } catch (_) {}
            if (u.startsWith('/rest/v1/discovered_places')) writes.push({ method: req.method, url: u, body: b, raw: body });
            return send([b]);
        }
        return send([]);
    });
});
await new Promise(r => supa.listen(SUPA_PORT, '127.0.0.1', r));

// ── replace hook (server B) ────────────────────────────────────────────────────────────────────
const HOOK_OUT = path.join(TMP, 'replace-hook.jsonl');
const HOOK = path.join(TMP, 'replace-hook.cjs');
fs.writeFileSync(HOOK, `'use strict';
const fs = require('fs'); const OUT = ${JSON.stringify(HOOK_OUT)}; const MARKS = ['ZQMARK', 'ززمرك', 'জজমক']; const seen = new Set();
for (const name of ['replace', 'replaceAll']) {
    const orig = String.prototype[name];
    Object.defineProperty(String.prototype, name, { configurable: true, writable: true, value: function (a, b) {
        if (typeof b === 'string' && MARKS.some(m => b.indexOf(m) !== -1)) {
            const st = String(new Error().stack || '').split('\\n'); let w = '?';
            for (const l of st) { const x = /server\\.js:(\\d+):(\\d+)/.exec(l); if (x) { w = x[1] + ':' + x[2]; break; } }
            if (!seen.has(w)) { seen.add(w); try { fs.appendFileSync(OUT, w + '\\n'); } catch (_) {} }
        }
        return orig.call(this, a, b);
    } });
}
`);

// ── server boot ────────────────────────────────────────────────────────────────────────────────
function boot(port, extraEnv, extraPreload) {
    const env = Object.assign({}, process.env);
    for (const k of Object.keys(env)) if (/^(SUPABASE_|DISCOVERED_|TP_|NODE_OPTIONS$|ADMIN_TOKEN$|GA_MEASUREMENT_ID$|LOCATIONIQ_KEY$|RENDER)/.test(k)) delete env[k];
    Object.assign(env, { PORT: String(port), ADSENSE_CLIENT: 'off', TZ: 'UTC', SITE_URL: 'https://timesprayers.com', WEB_CONCURRENCY: '1',
        SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' }, extraEnv);
    const pre = PRELOAD.concat(extraPreload || []).flatMap(p => ['-r', p]);
    const child = spawn(process.execPath, pre.concat(['server.js']), { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = ''; child.stdout.on('data', d => log += d); child.stderr.on('data', d => log += d);
    return (async () => {
        for (let i = 0; i < 240 && !log.includes('Server running at http://localhost:' + port); i++) await sleep(250);
        if (!log.includes('Server running at http://localhost:' + port)) { kill(child); throw new Error('server did not start on ' + port + ':\n' + log.slice(-1500)); }
        return { base: 'http://127.0.0.1:' + port, child, log: () => log };
    })();
}
function kill(child) {
    try { if (process.platform === 'win32') execSync('taskkill /PID ' + child.pid + ' /T /F', { stdio: 'ignore' }); else child.kill('SIGKILL'); } catch (_) { try { child.kill(); } catch (_e) {} }
}
async function get(S, p, ms) {
    const t0 = Date.now();
    try {
        const r = await fetch(S.base + p, { redirect: 'manual', signal: AbortSignal.timeout(ms || 15000) });
        const rd = r.body.getReader(); let n = 0; const parts = [];
        for (;;) { const x = await rd.read(); if (x.done) break; n += x.value.length; if (n <= 4e6) parts.push(Buffer.from(x.value)); if (n > 20e6) { try { await rd.cancel(); } catch (_) {} break; } }
        return { st: r.status, bytes: n, body: Buffer.concat(parts).toString('utf8'), ms: Date.now() - t0 };
    } catch (e) { return { st: 'ERR:' + e.name, bytes: 0, body: '', ms: Date.now() - t0 }; }
}
const LANGS = ['', 'en/', 'fr/', 'tr/', 'ur/', 'de/', 'id/', 'es/', 'bn/', 'ms/'];
const FAM = (s) => ['prayer-times-in-' + s, 'qibla-in-' + s, 'moon/united-states/' + s, 'moon/united-states/' + s + '/2026',
    'moon/united-states/' + s + '/2026/11', 'next-prayer-in-' + s, 'time-left-until-next-prayer-in-' + s];
const countDoctype = (b) => (b.match(/<!doctype/gi) || []).length;
const injected = (b) => /<zqinj|<\/script><zq|nominatim<\/script>/i.exec(b);

let A = null, B = null;
try {
    A = await boot(PORT_A, { SUPABASE_URL: 'http://127.0.0.1:' + SUPA_PORT, SUPABASE_SERVICE_ROLE_KEY: 'loopback-test-key-not-a-secret' });
    B = await boot(PORT_B, { DISCOVERED_SSR_TEST_FIXTURE: FIXTURE, DISCOVERED_SSR_TEST_RAW_NAMES: '1' }, [HOOK]);

    // ── A1. write path ─────────────────────────────────────────────────────────────────────────
    console.log('\n-- A1. POST /api/place-selected (clean on write, validator) --');
    const P = (o) => Object.assign({ slug: 'zqw', countryCode: 'us', lat: 40, lng: -75, timezone: 'America/New_York', type: 'city', names: { en: 'Zq ok' } }, o);
    const post = async (body) => {
        const before = writes.length;
        const r = await fetch(A.base + '/api/place-selected', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        await r.text(); await sleep(30);
        return { st: r.status, w: writes.slice(before) };
    };
    const refused = {
        dollarOnlyName:   P({ names: { en: 'Zq ' + DOLLAR } }),
        markupOnlyName:   P({ names: { en: 'X</script><img src=x onerror=1>' } }),
        loneSurrogate:    P({ names: { en: 'Zq x\ud800y' } }),
        typeMarkup:       P({ type: 'city</script><zqinj>' }),
        typeUnknown:      P({ type: 'spaceport' }),
        typePoi:          P({ type: 'road' }),
        tzMarkup:         P({ timezone: 'America/New_York</script><zqinj>' }),
        tzUnknown:        P({ timezone: 'Not/AZone' }),
        tzEmpty:          P({ timezone: '' }),
    };
    for (const [k, b] of Object.entries(refused)) { const r = await post(b); check('refused ' + k, r.st === 400 && r.w.length === 0, 'status ' + r.st + ', db writes ' + r.w.length); }
    const dropped = {
        dollarAlias:   [P({ aliases: { en: ['Zq $`', 'Zq alias ok'] } }), (b) => JSON.stringify(b.aliases) === '{"en":["Zq alias ok"]}'],
        dollarSafeFr:  [P({ names: { en: 'Zq $\'', fr: 'Zq fr ok' } }), (b) => JSON.stringify(b.names) === '{"fr":"Zq fr ok"}'],
        adminDollar:   [P({ admin: { country: { en: 'C $&', fr: 'C ok' } } }), (b) => JSON.stringify(b.admin) === '{"country":{"fr":"C ok"}}'],
        sourceMarkup:  [P({ source: 'nominatim</script><b>', sourceId: '<b>1' }), (b) => b.source === 'nominatim' && b.source_id === null],
        qualityKey:    [P({ nameQuality: { 'en<b>': 'curated', en: 'curated' } }), (b) => JSON.stringify(b.name_quality) === '{"en":"curated"}'],
        legitNames:    [P({ names: { en: "L'Aquila", fr: 'Biel/Bienne', de: 'Al-`Ula', es: 'Trinidad & Tobago (Port of Spain)', ar: 'الرَّسّ', tr: 'Şanlıurfa \u{20000}' } }),
            (b) => b.names.en === "L'Aquila" && b.names.fr === 'Biel/Bienne' && b.names.de === 'Al-`Ula' && b.names.es === 'Trinidad & Tobago (Port of Spain)' && b.names.ar === 'الرَّسّ' && b.names.tr === 'Şanlıurfa \u{20000}'],
        tzThreePart:   [P({ timezone: 'America/Argentina/Buenos_Aires', type: 'town' }), (b) => b.timezone === 'America/Argentina/Buenos_Aires' && b.type === 'town'],
    };
    for (const [k, [b, ok]] of Object.entries(dropped)) {
        const r = await post(b);
        const ins = r.w.find(x => x.method === 'POST');
        check('accepted+cleaned ' + k, r.st === 200 && ins && ok(ins.body) && !/[<>]|\$[`'&$]/.test(ins.raw), 'status ' + r.st + (ins ? ' ' + ins.raw.slice(0, 160) : ' (no insert)'));
    }
    {   // merge into a stored unsafe row: the PATCH drops what the row carried
        const r = await post(P({ slug: 'zqdollar', names: { en: 'Zq merge ok' } }));
        const pt = r.w.find(x => x.method === 'PATCH');
        check('merge PATCH drops stored $-names', r.st === 200 && pt && !/\$[`'&$1]/.test(pt.raw) && pt.body.names.en === 'Zq merge ok', pt ? pt.raw.slice(0, 160) : 'no PATCH');
        const r2 = await post(P({ slug: 'zqtype', names: { en: 'Zq type ok' } }));
        const pt2 = r2.w.find(x => x.method === 'PATCH');
        check('merge PATCH drops stored unsafe name_quality key', r2.st === 200 && pt2 && !/<b>/.test(pt2.raw), pt2 ? pt2.raw.slice(0, 200) : 'no PATCH');
    }

    // ── A2. read APIs over unsafe stored rows ──────────────────────────────────────────────────
    console.log('\n-- A2. read APIs (clean on read) --');
    const api = async (p) => { const r = await get(A, p); let j = null; try { j = JSON.parse(r.body); } catch (_) {} return { st: r.st, j, body: r.body }; };
    {
        const t = await api('/api/place-by-slug?slug=zqtype&lang=en');
        check('place-by-slug: unknown stored type shown as city', t.j && t.j.result && t.j.result.type === 'city' && !/<|\\u003c/i.test(t.body), t.body.slice(0, 200));
        for (const s of ['zqtz', 'zqtz2']) {
            const z = await api('/api/place-by-slug?slug=' + s + '&lang=en');
            check('place-by-slug: invalid stored timezone -> not served (' + s + ')', z.j && z.j.result === null && z.j.source === 'none', z.body.slice(0, 160));
        }
        const ok = await api('/api/place-by-slug?slug=zqtzok&lang=en');
        check('place-by-slug: valid 3-part zone kept', ok.j && ok.j.result && ok.j.result.timezone === 'America/Argentina/Buenos_Aires' && ok.j.result.type === 'town', ok.body.slice(0, 200));
        const d = await api('/api/place-by-slug?slug=zqdollar&lang=en');
        check('place-by-slug: $-name not served', d.j && d.j.result && !/\$[`'&$1]/.test(d.body), d.body.slice(0, 200));
        const s1 = await api('/api/search-place?q=zqtype&lang=en');
        const hit = s1.j && Array.isArray(s1.j.results) ? s1.j.results.find(x => x.slug === 'zqtype') : null;
        check('search-place: type / typeLabel whitelisted', hit && hit.type === 'city' && hit.typeLabel === 'City' && !/<|\\u003c/i.test(s1.body), s1.body.slice(0, 200));
        const s2 = await api('/api/search-place?q=zqtz&lang=en');
        const bad = s2.j && Array.isArray(s2.j.results) ? s2.j.results.filter(x => x.slug === 'zqtz' || x.slug === 'zqtz2') : [];
        check('search-place: rows with an invalid timezone are dropped', s2.st === 200 && bad.length === 0 && !/<\/script>/i.test(s2.body), s2.body.slice(0, 200));
    }

    // ── A3. SSR on the production read path ────────────────────────────────────────────────────
    console.log('\n-- A3. SSR, production read path (size / latency / injection) --');
    {
        let worst = 0, slow = 0, dup = 0, inj = 0, bad = 0, n = 0, injEx = '';
        for (const s of ['zqdollar', 'zqsur', 'zqtag', 'zqtype']) for (const L of LANGS) for (const f of FAM(s)) {
            const r = await get(A, '/' + L + f); n++;
            worst = Math.max(worst, r.bytes);
            if (r.ms > 5000) slow++;
            if (r.st !== 200) bad++;
            else {
                if (countDoctype(r.body) !== 1) dup++;
                const im = injected(r.body);
                if (im) { inj++; if (!injEx) injEx = '/' + L + f + ': ' + JSON.stringify(r.body.slice(Math.max(0, im.index - 80), im.index + 60)); }
            }
        }
        check('SSR pages answer 200 (' + n + ')', bad === 0, bad + ' non-200');
        check('SSR pages stay < 1 MB', worst < 1e6, 'max ' + worst + ' bytes');
        check('SSR pages answer < 5 s', slow === 0, slow + ' slow');
        check('SSR pages hold one document', dup === 0, dup + ' with != 1 doctype');
        check('SSR pages carry no injected markup', inj === 0, inj + ' pages ' + injEx);
        for (const s of ['zqtz', 'zqtz2']) {
            const r = await get(A, '/en/moon/united-states/' + s + '/2026');
            check('SSR: invalid stored timezone -> row not used (' + s + ')', r.st === 404 && !injected(r.body), 'status ' + r.st);
        }
        const h = await get(A, '/health');
        check('server A healthy after the SSR sweep', h.st === 200);
    }

    // ── B. SSR layer alone (raw names) ─────────────────────────────────────────────────────────
    console.log('\n-- B. SSR layer alone (names NOT cleaned) --');
    {
        let n = 0, sizeBad = 0, dup = 0, bad = 0;
        for (const L of LANGS) for (const f of FAM('zqmark')) { const r = await get(B, '/' + L + f); n++; if (r.st !== 200) bad++; }
        check('marker pages answer 200 (' + n + ')', bad === 0, bad + ' non-200');
        const sites = fs.existsSync(HOOK_OUT) ? fs.readFileSync(HOOK_OUT, 'utf8').split('\n').filter(Boolean) : [];
        check('no String.replace inserts a city name through a STRING replacement', sites.length === 0, sites.length ? 'server.js ' + sites.join(', ') : '');
        for (const L of LANGS) for (let i = 0; i < FAM('zqdollar').length; i++) {
            const a = await get(B, '/' + L + FAM('zqdollar')[i]), t = await get(B, '/' + L + FAM('zqtwin')[i]);
            if (a.st !== 200 || t.st !== 200) { bad++; continue; }
            if (countDoctype(a.body) !== 1) dup++;
            if (Math.abs(a.bytes - t.bytes) > 5000) sizeBad++;
        }
        check('$-name pages hold one document', dup === 0, dup + ' pages');
        check('$-name pages keep the twin page size (+-5 KB)', sizeBad === 0, sizeBad + ' pages');
        const en = await get(B, '/en/prayer-times-in-zqdollar');
        const title = (en.body.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
        check('$-name printed literally in <title>', title.includes('Zqen A$`B$&#39;C$&amp;D$$E$1F'), title);
        check('$-name printed literally in JSON-LD', en.body.includes('"Zqen A$`B$\'C$&D$$E$1F"'));
        const sur = await get(B, '/en/prayer-times-in-zqsur', 10000);
        check('lone-surrogate name: page still answered', sur.st === 200, 'status ' + sur.st + ' in ' + sur.ms + ' ms');
        let tagInj = 0;
        for (const L of LANGS) for (const f of FAM('zqtag')) { const r = await get(B, '/' + L + f); if (r.st === 200 && /<zqinj/i.test(r.body)) tagInj++; }
        check('markup name escaped by context (no <zqinj> element)', tagInj === 0, tagInj + ' pages');
        const h = await get(B, '/health');
        check('server B healthy', h.st === 200);
    }
} catch (e) {
    fail++; console.log('FAIL harness error: ' + (e && e.stack || e));
} finally {
    if (A) kill(A.child);
    if (B) kill(B.child);
    supa.close();
    try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
