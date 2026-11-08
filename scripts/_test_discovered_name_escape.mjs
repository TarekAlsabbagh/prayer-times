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
//   C. promote path (discovered -> curated): Supabase pointed at the same stand-in (told apart by its
//      key), which serves stored rows with unsafe names / aliases / admin / type / timezone, a stored
//      unsafe admin name override, and legitimate rows. The real admin API runs (random ADMIN_TOKEN made
//      here, never written anywhere) with PROMOTE_GITHUB_TEST_MODE=1 and PROMOTE_GITHUB_TEST_CURATED_FILE
//      = a scratch copy of curated-places.json: unsafe items are refused and the copy keeps its bytes;
//      legitimate items are written with their exact names. The repo's own db/ is never written.
//   D. the hand-run promote scripts (add-discovered-city-to-curated, promote-discovered-sa-batch-1),
//      run from a scratch copy of the tree: an unsafe entry is refused, a legitimate one is written.
//
// Usage:  node scripts/_test_discovered_name_escape.mjs
//   env  TEST_PORT_A (9976) TEST_PORT_B (9977) FAKE_SUPA_PORT (9978) TEST_PORT_C (9979)
//        TEST_NODE_PRELOAD  comma-separated extra `-r` modules for the server (e.g. an outbound guard)
//        TEST_ROOT          checkout whose server.js is tested (default: this repo)
//        TEST_SECTIONS      comma-separated subset of A,B,C,D (default: all)
// Exit code 0 = all checks pass.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const ROOT = process.env.TEST_ROOT ? path.resolve(process.env.TEST_ROOT)          // run against another checkout
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT_A = Number(process.env.TEST_PORT_A || 9976);
const PORT_B = Number(process.env.TEST_PORT_B || 9977);
const SUPA_PORT = Number(process.env.FAKE_SUPA_PORT || 9978);
const PORT_C = Number(process.env.TEST_PORT_C || 9979);
const SECTIONS = new Set(String(process.env.TEST_SECTIONS || 'A,B,C,D').toUpperCase().split(',').map(s => s.trim()).filter(Boolean));
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

// ── promote fixture (server C): stored discovered rows, as stored ─────────────────────────────
const PROMOTE_KEY = 'loopback-promote-key-not-a-secret';
let _plat = 29.40;
const prow = (slug, n, extra) => Object.assign({ id: 'pid-' + slug, slug, type: 'town', country_code: 'ma', lat: (_plat += 0.07), lng: -10.4,
    timezone: 'Africa/Casablanca', names: n, aliases: {}, admin: {}, name_quality: { ar: 'official' }, source: 'nominatim',
    source_id: 'osm-' + slug, verified: false, search_count: 0, selected_count: 3,
    created_at: '2026-11-01T08:00:00Z', updated_at: '2026-11-01T08:00:00Z', last_used_at: '2026-11-01T08:00:00Z' }, extra || {});
const OK_NAMES = { ar: 'زقورة الشرقية', en: "Zq L'Oued & Sidi", fr: 'Zq Bél-Abbès Côté' };
const OK_ALIASES = { fr: ["Zq l'Été & Cie"] };
const OVR_OK_EN = "Zq Override L'Île & Co";
const PROMOTE_ROWS = [
    prow('zqp-ok', OK_NAMES, { aliases: OK_ALIASES }),
    prow('zqp-tag', { ar: 'زقورة الغربية', en: 'Zq West</script><zqinj x=1>' }),
    prow('zqp-quote', { ar: 'زقورة الوسطى', en: 'Zq "Mid" x=1' }),
    prow('zqp-dollar', { ar: 'زقورة الدولار', en: "Zq $` dollar" }),
    prow('zqp-alias', { ar: 'زقورة الجنوبية', en: 'Zq South' }, { aliases: { en: ['Zq <b>South</b>'] } }),
    prow('zqp-admin', { ar: 'زقورة الشمالية', en: 'Zq North' }, { admin: { originalName: 'Zq<zqinj>' } }),
    prow('zqp-type', { ar: 'زقورة النوع', en: 'Zq Kind' }, { type: 'town</script><zqinj>' }),
    prow('zqp-tz', { ar: 'زقورة المنطقة', en: 'Zq Zone' }, { timezone: 'Africa/Casablanca<zqinj>' }),
    prow('zqp-ovr', { ar: 'زقورة المعدلة', en: 'Zq Edited' }),
    prow('zqp-ovrok', { ar: 'زقورة السليمة', en: 'Zq Plain' }),
];
const PROMOTE_OVERRIDES = [
    { slug: 'zqp-ovr', country_code: 'ma', name_en: 'Zq<img src=x onerror=alert(1)>', updated_at: '2026-11-02T08:00:00Z' },
    { slug: 'zqp-ovrok', country_code: 'ma', name_en: OVR_OK_EN, updated_at: '2026-11-02T08:00:00Z' },
];
const promoteWrites = [];

// ── loopback Supabase stand-in ─────────────────────────────────────────────────────────────────
const writes = [];
const supa = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
        const u = req.url || '';
        const send = (d) => { res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Range': '0-0/' + (Array.isArray(d) ? d.length : 1) }); res.end(JSON.stringify(d)); };
        if (req.headers['apikey'] === PROMOTE_KEY) {                       // server C (promote path)
            if (req.method === 'GET' && u.startsWith('/rest/v1/discovered_places?select=')) return send(PROMOTE_ROWS);
            if (req.method === 'GET' && u.startsWith('/rest/v1/discovered_place_reviews')) {
                return send(PROMOTE_ROWS.map(r => ({ slug: r.slug, country_code: 'ma', decision: 'approved', note: '', duplicate_of: null, reviewed_at: '2026-11-03T08:00:00Z', reviewed_by: 'test' })));
            }
            if (req.method === 'GET' && u.startsWith('/rest/v1/discovered_place_name_overrides')) return send(PROMOTE_OVERRIDES);
            if (req.method !== 'GET') { promoteWrites.push({ method: req.method, url: u, raw: body }); return send([]); }
            return send([]);
        }
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
    for (const k of Object.keys(env)) if (/^(SUPABASE_|DISCOVERED_|TP_|NODE_OPTIONS$|ADMIN_TOKEN$|GA_MEASUREMENT_ID$|LOCATIONIQ_KEY$|RENDER|GITHUB_|PROMOTE_)/.test(k)) delete env[k];
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

let A = null, B = null, C = null;
try {
    if (SECTIONS.has('A')) A = await boot(PORT_A, { SUPABASE_URL: 'http://127.0.0.1:' + SUPA_PORT, SUPABASE_SERVICE_ROLE_KEY: 'loopback-test-key-not-a-secret' });
    if (SECTIONS.has('B')) B = await boot(PORT_B, { DISCOVERED_SSR_TEST_FIXTURE: FIXTURE, DISCOVERED_SSR_TEST_RAW_NAMES: '1' }, [HOOK]);

    if (A) {
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

    }   // A
    if (B) {
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
    }   // B
    if (A) { kill(A.child); A = null; }
    if (B) { kill(B.child); B = null; }

    if (SECTIONS.has('C')) {
    // ── C. promote path (discovered -> curated) ────────────────────────────────────────────────
    console.log('\n-- C. promote path: unsafe stored rows / overrides refused, legitimate rows written --');
    {
        const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
        const REPO_CURATED = path.join(ROOT, 'db', 'places', 'curated-places.json');
        const repoSha0 = sha(fs.readFileSync(REPO_CURATED));
        const COPY = path.join(TMP, 'curated-copy', 'curated-places.json');
        fs.mkdirSync(path.dirname(COPY), { recursive: true });
        fs.copyFileSync(REPO_CURATED, COPY);
        const copy0 = fs.readFileSync(COPY);
        const TOKEN = crypto.randomBytes(24).toString('hex');            // this run only, never stored
        C = await boot(PORT_C, { SUPABASE_URL: 'http://127.0.0.1:' + SUPA_PORT, SUPABASE_SERVICE_ROLE_KEY: PROMOTE_KEY,
            ADMIN_TOKEN: TOKEN, PROMOTE_GITHUB_TEST_MODE: '1', PROMOTE_GITHUB_TEST_CURATED_FILE: COPY });
        const api = async (p, body) => {
            const r = await fetch(C.base + p, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN }, body: JSON.stringify(body) });
            const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (_) {}
            return { st: r.status, j, t };
        };
        const it = (slug) => ({ slug, countryCode: 'ma' });
        const failing = (item) => (item && Array.isArray(item.checks) ? item.checks.filter(c => !c.ok).map(c => c.name) : []);

        // C1. preview: each unsafe item is refused with a named check
        const expect = {
            'zqp-tag':    ['stored_text_safe'], 'zqp-quote': ['stored_text_safe'], 'zqp-dollar': ['stored_text_safe'],
            'zqp-alias':  ['stored_text_safe'], 'zqp-admin': ['stored_text_safe'], 'zqp-type':   ['stored_text_safe'],
            'zqp-tz':     ['stored_text_safe', 'timezone_valid'],
            'zqp-ovr':    ['text_safe'],                                    // stored row clean; the override is not
        };
        for (const [slug, names] of Object.entries(expect)) {
            const r = await api('/api/admin/discovered-cities/promote-preview', { items: [it(slug)] });
            const item = r.j && r.j.items && r.j.items[0];
            const f = failing(item);
            check('preview refuses ' + slug, r.st === 200 && r.j.status === 'blocked' && item && item.valid === false && names.every(n => f.includes(n)),
                'status ' + r.st + ' ' + (r.j && r.j.status) + ' failing=' + f.join(','));
        }
        {
            const r = await api('/api/admin/discovered-cities/promote-preview', { items: [it('zqp-ovr')] });
            const f = failing(r.j && r.j.items && r.j.items[0]);
            check('override refused by the write-side check alone (stored row passes)', !f.includes('stored_text_safe') && f.includes('text_safe'), f.join(','));
        }
        {
            const r = await api('/api/admin/discovered-cities/promote-preview', { items: [it('zqp-ok'), it('zqp-ovrok')] });
            const c0 = r.j && r.j.items && r.j.items[0] && r.j.items[0].candidate;
            check('preview accepts the legitimate rows', r.st === 200 && r.j.status === 'ready' && r.j.validations.validCount === 2,
                'status ' + r.st + ' ' + (r.j && r.j.status) + ' ' + JSON.stringify(r.j && r.j.errors));
            check('preview candidate keeps exact names', c0 && JSON.stringify(c0.names) === JSON.stringify(OK_NAMES) && JSON.stringify(c0.aliases) === JSON.stringify(OK_ALIASES),
                c0 ? JSON.stringify(c0.names) + ' ' + JSON.stringify(c0.aliases) : 'no candidate');
        }

        // C2. commit: nothing unsafe is written; a mixed batch is refused whole
        const commit = (items) => api('/api/admin/discovered-cities/promote-commit', { items, target: 'branch', commitMessage: 'test: promote guard' });
        const REPORT = COPY + '.report.md';
        for (const slug of Object.keys(expect).concat(['zqp-ok+zqp-tag', 'zqp-ovrok+zqp-ovr'])) {
            const items = slug.split('+').map(it);
            const r = await commit(items);
            const now = fs.readFileSync(COPY);
            check('commit refuses ' + slug + ' (file bytes unchanged)', r.st === 422 && r.j && r.j.error === 'validation_blocked'
                && now.equals(copy0) && !fs.existsSync(REPORT), 'status ' + r.st + ' ' + (r.j && r.j.error) + ' sha ' + sha(now).slice(0, 12));
        }
        check('no promote status written for refused items', promoteWrites.filter(w => w.url.startsWith('/rest/v1/discovered_place_promotions')).length === 0);
        {
            const r = await commit([it('zqp-ok'), it('zqp-ovrok')]);
            const after = fs.readFileSync(COPY);
            const before = JSON.parse(copy0.toString('utf8'));
            let arr = null; try { arr = JSON.parse(after.toString('utf8')); } catch (_) {}
            check('commit accepts the legitimate rows', r.st === 200 && r.j && r.j.status === 'committed' && r.j.testMode === true
                && JSON.stringify(r.j.citiesPromoted) === '["zqp-ok","zqp-ovrok"]', 'status ' + r.st + ' ' + r.t.slice(0, 200));
            check('written file = previous entries + 2', Array.isArray(arr) && arr.length === before.length + 2
                && JSON.stringify(arr.slice(0, before.length)) === JSON.stringify(before), (arr ? arr.length : 'unparsable') + ' vs ' + before.length);
            const okE = arr && arr.find(e => e.slug === 'zqp-ok'), ovE = arr && arr.find(e => e.slug === 'zqp-ovrok');
            check('written entry keeps exact names (ar, fr accents, \' and &)', okE && JSON.stringify(okE.names) === JSON.stringify(OK_NAMES)
                && JSON.stringify(okE.aliases) === JSON.stringify(OK_ALIASES) && okE.type === 'town' && okE.timezone === 'Africa/Casablanca',
                okE ? JSON.stringify(okE.names) : 'missing');
            check('written override name exact', ovE && ovE.names.en === OVR_OK_EN && ovE.names.ar === 'زقورة السليمة', ovE ? JSON.stringify(ovE.names) : 'missing');
            // the previous entries are unchanged (parsed-JSON equality above), so only the new part is scanned
            const txt = JSON.stringify(arr ? arr.slice(before.length) : []) + (fs.existsSync(REPORT) ? fs.readFileSync(REPORT, 'utf8') : '');
            const bad = ['zqinj', '<img', '<b>', '</script>', 'zqp-tag', 'zqp-quote', 'zqp-dollar', 'zqp-alias', 'zqp-admin', 'zqp-type', 'zqp-tz', '"zqp-ovr"', 'Zq "Mid"', '$`'].filter(m => txt.includes(m));
            check('written file + report carry no unsafe row / marker', fs.existsSync(REPORT) && bad.length === 0, bad.join(' | '));
            check('promote status saved for the 2 written rows only', promoteWrites.filter(w => w.url.startsWith('/rest/v1/discovered_place_promotions')).length === 2);
        }

        // C3. name-override API: an unsafe override cannot be stored in the first place
        {
            const ov = async (b) => { const n = promoteWrites.length; const r = await api('/api/admin/discovered-name-overrides', b); return { st: r.st, j: r.j, w: promoteWrites.slice(n) }; };
            const a = await ov({ slug: 'zqp-x', countryCode: 'ma', name_en: 'Zq<script>x' });
            check('override API refuses unsafe name_en', a.st === 400 && a.j && a.j.error === 'unsafe_name_en' && a.w.length === 0, 'status ' + a.st);
            const b = await ov({ slug: 'zqp-x', countryCode: 'ma', name_ar: 'زقورة "=1' });
            check('override API refuses unsafe name_ar', b.st === 400 && b.j && b.j.error === 'unsafe_name_ar' && b.w.length === 0, 'status ' + b.st);
            const c = await ov({ slug: 'zqp-x', countryCode: 'ma', name_en: OVR_OK_EN, name_ar: 'زقورة' });
            let cb = null; try { cb = JSON.parse((c.w[0] || {}).raw || 'null'); } catch (_) {}
            check('override API stores a legitimate name exactly', c.st === 200 && cb && cb.name_en === OVR_OK_EN && cb.name_ar === 'زقورة', 'status ' + c.st);
        }
        check('repo db/places/curated-places.json untouched', sha(fs.readFileSync(REPO_CURATED)) === repoSha0);
        const h = await get(C, '/health');
        check('server C healthy', h.st === 200);
        kill(C.child); C = null;
    }

    }   // C
    if (SECTIONS.has('D')) {
    // ── D. hand-run promote scripts (scratch copy of the tree) ─────────────────────────────────
    console.log('\n-- D. promote scripts refuse unsafe entries --');
    {
        const T = path.join(TMP, 'tree');
        fs.mkdirSync(path.join(T, 'scripts'), { recursive: true });
        fs.mkdirSync(path.join(T, 'db', 'places'), { recursive: true });
        const CUR = path.join(T, 'db', 'places', 'curated-places.json');
        const SCRIPTS = {
            'add-discovered-city-to-curated.mjs': { slug: "slug: 'huraymila'", lat: 'lat: 25.126667', ar: "ar: 'حريملاء'", en: "en: 'Huraymila'" },
            'promote-discovered-sa-batch-1-to-curated.mjs': { slug: "slug: 'uray-irah'", lat: 'lat: 25.977396', ar: "ar: 'عريعرة'", en: "en: 'Uray‘irah'" },
        };
        for (const [name, k] of Object.entries(SCRIPTS)) {
            const src = fs.readFileSync(path.join(ROOT, 'scripts', name), 'utf8');
            const run = (patched, label) => {
                fs.copyFileSync(path.join(ROOT, 'db', 'places', 'curated-places.json'), CUR);
                for (const f of fs.readdirSync(path.dirname(CUR))) if (f.endsWith('.bak')) fs.rmSync(path.join(path.dirname(CUR), f));
                const file = path.join(T, 'scripts', name);
                fs.writeFileSync(file, patched);
                const before = fs.readFileSync(CUR);
                const pre = PRELOAD.flatMap(p => ['-r', p]);
                const r = spawnSync(process.execPath, pre.concat([file]), { cwd: T, encoding: 'utf8', timeout: 60000 });
                return { code: r.status, out: (r.stdout || '') + (r.stderr || ''), changed: !fs.readFileSync(CUR).equals(before), cur: fs.readFileSync(CUR, 'utf8') };
            };
            const allIn = Object.values(k).every(s => src.includes(s));
            check(name + ': patch anchors present', allIn);
            if (!allIn) continue;
            const base = src.replace(k.slug, "slug: 'zqs-entry'").replace(k.lat, 'lat: 21.5').replace(k.ar, "ar: 'زقورة السكربت'");
            const u = run(base.replace(k.en, "en: 'Zq Script<zqinj x=1>'"), 'unsafe');
            check(name + ': unsafe entry refused, file bytes unchanged', u.code === 1 && /REJECT zqs-entry: unsafe/.test(u.out) && !u.changed, 'exit ' + u.code + ' ' + u.out.trim().split('\n').slice(-2).join(' / '));
            const ok = run(base.replace(k.en, "en: \"Zq Script L'Ok & Co\""), 'legit');
            let e = null; try { e = JSON.parse(ok.cur).find(x => x.slug === 'zqs-entry'); } catch (_) {}
            check(name + ': legitimate entry written with exact names', ok.code === 0 && ok.changed && e && e.names.en === "Zq Script L'Ok & Co" && e.names.ar === 'زقورة السكربت',
                'exit ' + ok.code + ' ' + (e ? JSON.stringify(e.names) : 'missing'));
        }
    }
    }   // D
} catch (e) {
    fail++; console.log('FAIL harness error: ' + (e && e.stack || e));
} finally {
    if (A) kill(A.child);
    if (B) kill(B.child);
    if (C) kill(C.child);
    supa.close();
    try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
