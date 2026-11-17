// MOON-INDEX-SCOPE-H-1 — local smoke (no network beyond 127.0.0.1).
// Boots the BASE tree (deployed commit) and the CANDIDATE tree (this branch) with a fixed test clock and compares:
//   A) robots/status/canonical/hreflang/X-Robots-Tag + body equality outside the approved changes, 10 languages;
//   B) every sitemap file (family + legacy chunks): only noindexed year/month entries removed, nothing added;
//   C) year transition on the candidate (31 Dec, 1 Jan, 31 Jan, 1 Feb) for robots AND the moon sitemap.
// Usage: node scripts/_smoke_moon_index_scope_h_1.mjs <baseRoot> <candRoot> [outJson]
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE = process.argv[2], CAND = process.argv[3], OUT = process.argv[4] || '';
if (!BASE || !CAND) { console.error('usage: <baseRoot> <candRoot> [outJson]'); process.exit(2); }
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const LIST = new Map(JSON.parse(fs.readFileSync(path.join(CAND, 'db', 'moon-month-index-cities.json'), 'utf8')).cities.map(c => [c.slug, c.cc]));
let pass = 0, fail = 0; const failures = []; const notes = [];
const ok = (cond, label, extra) => { if (cond) pass++; else { fail++; failures.push(label + (extra ? ' :: ' + extra : '')); } };

async function boot(root, port, now) {
    const env = { ...process.env, PORT: String(port), ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0', WEB_CONCURRENCY: '1' };
    if (now) env.TP_MOON_RANGE_TEST_NOW = now; else delete env.TP_MOON_RANGE_TEST_NOW;
    const p = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'ignore'] });
    for (let i = 0; i < 80; i++) {
        await new Promise(r => setTimeout(r, 500));
        try { const r = await fetch(`http://127.0.0.1:${port}/health`); if (r.status === 200) return p; } catch (_) {}
    }
    p.kill(); throw new Error('boot failed ' + root + ' ' + port);
}
async function get(port, u) {
    const r = await fetch(`http://127.0.0.1:${port}${u}`, { redirect: 'manual' });
    const body = r.status === 200 ? await r.text() : (await r.arrayBuffer(), '');
    const m = (re) => (body.match(re) || [])[1] || '';
    return {
        s: r.status, loc: r.headers.get('location') || '', xrt: r.headers.get('x-robots-tag') || '',
        robots: m(/<meta name="robots" content="([^"]*)"/), canon: m(/<link rel="canonical" href="([^"]*)"/).replace(/^https?:\/\/[^/]+/, ''),
        hreflang: (body.match(/<link rel="alternate" hreflang="/g) || []).length, body,
    };
}
// Body normalisation: per-request noise only (nonce, host:port, ISO timestamps, build stamps).
const norm = (b) => b.replace(/\r\n/g, '\n').replace(/nonce="[^"]*"/g, 'nonce=""').replace(/https?:\/\/(127\.0\.0\.1|localhost):\d+/g, 'ORIGIN')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/g, 'TS').replace(/[?&]b=[0-9a-f]{7}/g, '').replace(/app\.js\?v=\d+/g, 'app.js?v=N')
    .replace(/<meta name="robots" content="[^"]*"/, '<meta name="robots" content="R"');
const firstDiff = (x, y) => { let i = 0; while (i < x.length && x[i] === y[i]) i++; return JSON.stringify(x.slice(Math.max(0, i - 60), i + 120)) + ' => ' + JSON.stringify(y.slice(Math.max(0, i - 60), i + 120)); };
const isIdx = (r) => r.s === 200 && /^index/.test(r.robots);
const isNoidx = (r) => r.s === 200 && /^noindex,follow/.test(r.robots);

// Expected rule (independent re-implementation of the approved scope).
function expectIndexable(now, slug, cc, year, isMonth) {
    const d = new Date(now); const y = d.getUTCFullYear(); const min = d.getUTCMonth() === 0 ? y - 1 : y;
    if (year < min || year > y + 1) return false;
    if (!isMonth) return true;
    return LIST.get(slug) === cc;
}
const CITIES = [   // [country slug, city slug, cc, group]
    ['saudi-arabia', 'riyadh', 'sa', 'famous'], ['saudi-arabia', 'makkah', 'sa', 'famous-alias'],
    ['south-korea', 'seoul', 'kr', 'demand'], ['saudi-arabia', 'abha', 'sa', 'outside'], ['canada', 'quebec', 'ca', 'outside'],
];
const lp = (l) => (l === 'ar' ? '' : '/' + l);

async function phaseA() {
    const now = '2026-11-17T12:00:00Z';
    const pb = await boot(BASE, 8871, now), pc = await boot(CAND, 8872, now);
    const diffs = [];
    try {
        for (const [co, ci, cc, grp] of CITIES) for (const L of LANGS) {
            const hub = `${lp(L)}/moon/${co}/${ci}`;
            const paths = [[hub, null, false], [hub + '/2025', 2025, false], [hub + '/2026', 2026, false], [hub + '/2027', 2027, false], [hub + '/2029', 2029, false],
                [hub + '/2025/12', 2025, true], [hub + '/2026/12', 2026, true], [hub + '/2027/01', 2027, true], [hub + '/2029/05', 2029, true]];
            for (const [u, yr, isM] of paths) {
                const b = await get(8871, u), c = await get(8872, u);
                ok(b.s === c.s, `status ${u}`, `${b.s}->${c.s}`);
                ok(b.canon === c.canon && c.canon === u.replace(/^\/ar\b/, ''), `canonical self ${u}`, c.canon);
                ok(b.hreflang === c.hreflang && c.hreflang >= 10, `hreflang ${u}`, `${b.hreflang}->${c.hreflang}`);
                ok(!c.xrt, `no X-Robots-Tag ${u}`, c.xrt);
                ok(isIdx(b), `base indexable ${u}`, b.robots);
                if (yr === null) ok(isIdx(c), `hub stays index ${u}`, c.robots);
                else {
                    const want = expectIndexable(now, ci, cc, yr, isM);
                    ok(want ? isIdx(c) : isNoidx(c), `rule ${grp} ${u} want=${want ? 'index' : 'noindex'}`, c.robots);
                }
                if (norm(b.body) !== norm(c.body)) diffs.push(u + ' :: ' + firstDiff(norm(b.body), norm(c.body)));
            }
        }
        // Untouched families + error/redirect paths: status, robots, location identical to base.
        const same = ['/moon', '/en/moon', '/moon/saudi-arabia', '/de/moon/germany', '/moon-today', '/prayer-times-in-riyadh', '/en/qibla-in-riyadh',
            '/next-prayer-in-riyadh', '/time-left-until-next-prayer-in-riyadh', '/moon/saudi-arabia/riyadh/2026/11/17', '/en/moon/saudi-arabia/riyadh/2027/01/05',
            '/moon/saudi-arabia/riyadh/2032', '/moon/saudi-arabia/riyadh/2020/01', '/moon/saudi-arabia/riyadh/2026/13', '/moon/saudi-arabia/riyadh/today',
            '/moon-in-riyadh', '/moon-in-riyadh/2026-12', '/moon-in-riyadh?cal=2026-12', '/moon-today-in-riyadh', '/moon/egypt/riyadh/2026',
            '/moon/saudi-arabia/kamikawa/2026', '/moon/japan/kamikawa/2026/12', '/moon/hong-kong/central/2026', '/moon/saudi-arabia/no-such-city/2026/12'];
        for (const u of same) {
            const b = await get(8871, u), c = await get(8872, u);
            ok(b.s === c.s && b.loc === c.loc && b.robots === c.robots && b.xrt === c.xrt, `unchanged ${u}`, `${b.s}/${b.robots}/${b.loc} -> ${c.s}/${c.robots}/${c.loc}`);
            if (b.s === 200 && norm(b.body) !== norm(c.body)) diffs.push(u + ' :: ' + firstDiff(norm(b.body), norm(c.body)));
        }
        // Reachability of indexable pages that are NOT in the sitemap: plain links from kept pages.
        const reach = {};
        for (const [from, to] of [['/moon/saudi-arabia/abha', '/moon/saudi-arabia/abha/2026'], ['/moon/saudi-arabia/abha', '/moon/saudi-arabia/abha/2027'],
            ['/moon/south-korea/seoul/2026', '/moon/south-korea/seoul/2026/12'], ['/moon/south-korea/seoul/2027', '/moon/south-korea/seoul/2027/01'],
            ['/en/moon/canada/quebec', '/en/moon/canada/quebec/2027'], ['/moon/saudi-arabia', '/moon/saudi-arabia/abha'],
            ['/moon/saudi-arabia/abha/2026', '/moon/saudi-arabia/abha/2027'], ['/en/moon/canada/quebec/2026', '/en/moon/canada/quebec/2027'], ['/moon/saudi-arabia/abha/2026/12', '/moon/saudi-arabia/abha/2027/01'], ['/moon/saudi-arabia/abha/2026', '/moon/saudi-arabia/abha/2026/12']]) {
            const c = await get(8872, from); const has = c.body.includes(`href="${to}"`);
            reach[`${from} -> ${to}`] = has; notes.push({ reach: `${from} -> ${to}`, plainHref: has });
        }
        // Month-page FAQ: what the SSR HTML carries (visible block vs FAQPage JSON-LD) — evidence only, not asserted.
        { const c = await get(8872, '/en/moon/saudi-arabia/riyadh/2026/12');
          const ld = (c.body.match(/"@type":"FAQPage"/g) || []).length; const a1 = (c.body.match(/class="moon-city-hub-faq-a1"[^>]*>([^<]*)</) || [])[1];
          notes.push({ monthFaq: { faqPageJsonLd: ld, visibleA1Ssr: a1 === undefined ? 'absent' : a1 } }); }
        notes.push({ phase: 'A', bodyDiffOutsideRobots: diffs });
    } finally { pb.kill(); pc.kill(); }
}

async function sitemapLocs(port) {
    const idx = (await get(port, '/sitemap.xml')).body;
    const files = [...idx.matchAll(/<loc>[^<]*\/(sitemap-[a-z0-9-]+\.xml)<\/loc>/g)].map(m => m[1]);
    const legacy = ['sitemap-main.xml']; for (let i = 1; i <= 40; i++) legacy.push(`sitemap-cities-${i}.xml`);
    const out = {};
    for (const f of [...new Set([...files, ...legacy])]) {
        const r = await get(port, '/' + f);
        if (r.s !== 200) { out[f] = null; continue; }
        out[f] = new Set([...r.body.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1].replace(/^https?:\/\/[^/]+/, '')));
    }
    return out;
}
const moonYM = /^(?:\/(?:en|fr|tr|ur|de|id|es|bn|ms))?\/moon\/([a-z][a-z0-9-]+)\/([a-z][a-z0-9-]+)\/(\d{4})(\/\d{2})?$/;

async function phaseB() {
    const now = '2026-11-17T12:00:00Z';
    const pb = await boot(BASE, 8871, now), pc = await boot(CAND, 8872, now);
    try {
        const B0 = await sitemapLocs(8871), C0 = await sitemapLocs(8872);
        const fam = (f) => f.replace(/-\d+\.xml$/, '-N.xml');
        for (const f of Object.keys(B0)) ok((B0[f] === null) === (C0[f] === null), `sitemap file name kept ${f}`);
        const group = (X) => { const o = {}; for (const [f, v] of Object.entries(X)) { const k = fam(f); if (v === null) { if (!(k in o)) o[k] = null; continue; } o[k] = o[k] || new Set(); for (const x of v) o[k].add(x); } return o; };
        const B = group(B0), C = group(C0);
        notes.push({ sitemapFilesBase: Object.fromEntries(Object.entries(B0).filter(([, v]) => v).map(([k, v]) => [k, v.size])), sitemapFilesCand: Object.fromEntries(Object.entries(C0).filter(([, v]) => v).map(([k, v]) => [k, v.size])) });
        const changed = [];
        for (const f of Object.keys(B)) {
            ok((B[f] === null) === (C[f] === null), `sitemap file presence ${f}`);
            if (!B[f] || !C[f]) continue;
            const added = [...C[f]].filter(x => !B[f].has(x)), removed = [...B[f]].filter(x => !C[f].has(x));
            ok(added.length === 0, `sitemap ${f} adds nothing`, added.slice(0, 3).join(' '));
            const badRemoved = removed.filter(x => { const m = x.match(moonYM); if (!m) return true; return expectIndexable(now, m[2], LIST.get(m[2]) || '?', +m[3], !!m[4]); });
            ok(badRemoved.length === 0, `sitemap ${f} removes only noindexed year/month`, badRemoved.slice(0, 3).join(' '));
            for (const x of C[f]) { const m = x.match(moonYM); if (m && !expectIndexable(now, m[2], LIST.get(m[2]) || '?', +m[3], !!m[4])) { ok(false, `sitemap ${f} lists noindex page`, x); break; } }
            if (removed.length) changed.push({ file: f, before: B[f].size, after: C[f].size, removed: removed.length });
        }
        notes.push({ phase: 'B', changedFiles: changed });
    } finally { pb.kill(); pc.kill(); }
}

async function phaseC() {
    const clocks = ['2026-12-31T23:59:59Z', '2027-01-01T00:00:01Z', '2027-01-31T23:59:59Z', '2027-02-01T00:00:01Z'];
    for (const now of clocks) {
        const pc = await boot(CAND, 8872, now);
        try {
            for (const [co, ci, cc, grp] of CITIES) for (const yr of [2025, 2026, 2027, 2028]) for (const isM of [false, true]) for (const L of ['ar', 'en']) {
                const u = `${lp(L)}/moon/${co}/${ci}/${yr}${isM ? '/06' : ''}`;
                const c = await get(8872, u);
                const want = expectIndexable(now, ci, cc, yr, isM);
                ok(c.s === 200 && (want ? isIdx(c) : isNoidx(c)), `clock ${now} ${grp} ${u} want=${want ? 'index' : 'noindex'}`, `${c.s} ${c.robots}`);
            }
            const sm = await sitemapLocs(8872); const years = new Set();
            for (const f of Object.keys(sm)) if (sm[f]) for (const x of sm[f]) { const m = x.match(moonYM); if (m) years.add(+m[3]); }
            const d = new Date(now), y = d.getUTCFullYear(), min = d.getUTCMonth() === 0 ? y - 1 : y;
            const want = []; for (let k = min; k <= y + 1; k++) want.push(k);
            ok(JSON.stringify([...years].sort()) === JSON.stringify(want), `clock ${now} sitemap years`, [...years].sort().join(','));
        } finally { pc.kill(); }
    }
}

const t0 = Date.now();
await phaseA(); await phaseB(); await phaseC();
const res = { pass, fail, failures, notes, seconds: Math.round((Date.now() - t0) / 1000) };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log(`moon-index-scope-h-1: ${pass} pass / ${fail} fail (${res.seconds}s)`);
for (const f of failures.slice(0, 40)) console.log('  FAIL', f);
console.log(JSON.stringify(notes).slice(0, 2000));
process.exit(fail ? 1 : 0);
