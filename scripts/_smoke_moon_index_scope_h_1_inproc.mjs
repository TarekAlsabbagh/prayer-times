// MOON-INDEX-SCOPE-H-1 — IN-PROCESS year-transition check (owner request 2026-11-17, before deploy).
// ONE candidate server (2 cluster workers) is booted ONCE; a test-only preload (_test_fake_clock.cjs) moves the clock
// inside the running processes. With the sitemap plan cache and page paths warm, the clock crosses
//   31 Dec -> 1 Jan (grace starts, next year opens)  and  31 Jan -> 1 Feb (grace ends)
// and the robots meta + sitemap contents must follow WITHOUT a restart and without a stale cached decision.
// Usage: node scripts/_smoke_moon_index_scope_h_1_inproc.mjs <candRoot> [outJson]
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const CAND = process.argv[2], OUT = process.argv[3] || '';
if (!CAND) { console.error('usage: <candRoot> [outJson]'); process.exit(2); }
const PORT = 8873;
const CLOCK = path.join(os.tmpdir(), 'tp-fake-clock-' + process.pid + '.json');
const PRELOAD = path.join(CAND, 'scripts', '_test_fake_clock.cjs');
const LIST = new Map(JSON.parse(fs.readFileSync(path.join(CAND, 'db', 'moon-month-index-cities.json'), 'utf8')).cities.map(c => [c.slug, c.cc]));
const SITEMAP_TTL_MS = 30 * 60 * 1000;
let pass = 0, fail = 0; const failures = []; const notes = [];
const ok = (cond, label, extra) => { if (cond) pass++; else { fail++; failures.push(label + (extra ? ' :: ' + extra : '')); } };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function setClock(iso) {
    fs.writeFileSync(CLOCK, JSON.stringify({ target: iso, at: Date.now() }));
    await sleep(700);   // every process re-reads the file every 100 ms
}
async function get(u) {
    const r = await fetch(`http://127.0.0.1:${PORT}${u}`, { redirect: 'manual' });
    const body = r.status === 200 ? await r.text() : (await r.arrayBuffer(), '');
    return { s: r.status, xrt: r.headers.get('x-robots-tag') || '', robots: (body.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '', body };
}
const isIdx = (r) => r.s === 200 && /^index/.test(r.robots);
const isNoidx = (r) => r.s === 200 && /^noindex,follow/.test(r.robots);
function win(now) { const d = new Date(now), y = d.getUTCFullYear(); return { min: d.getUTCMonth() === 0 ? y - 1 : y, max: y + 1, y }; }
function expectIndexable(now, slug, cc, year, isMonth) {
    const w = win(now); if (year < w.min || year > w.max) return false;
    return !isMonth || LIST.get(slug) === cc;
}
const CITIES = [['saudi-arabia', 'riyadh', 'sa', 'famous'], ['saudi-arabia', 'makkah', 'sa', 'famous-alias'],
    ['south-korea', 'seoul', 'kr', 'demand'], ['saudi-arabia', 'abha', 'sa', 'outside'], ['canada', 'quebec', 'ca', 'outside']];
const lp = (l) => (l === 'ar' ? '' : '/' + l);
const moonYM = /^(?:\/(?:en|fr|tr|ur|de|id|es|bn|ms))?\/moon\/([a-z][a-z0-9-]+)\/([a-z][a-z0-9-]+)\/(\d{4})(\/\d{2})?$/;

async function pages(now, tag) {
    const w = win(now);
    for (const [co, ci, cc, grp] of CITIES) for (const yr of [2025, 2026, 2027, 2028]) for (const isM of [false, true]) for (const L of ['ar', 'en']) {
        const u = `${lp(L)}/moon/${co}/${ci}/${yr}${isM ? '/06' : ''}`;
        const want = expectIndexable(now, ci, cc, yr, isM);
        for (let k = 0; k < 3; k++) {   // repeated: the requests spread over both workers
            const c = await get(u);
            ok(c.s === 200 && !c.xrt && (want ? isIdx(c) : isNoidx(c)), `${tag} ${grp} ${u} #${k} want=${want ? 'index' : 'noindex'}`, `${c.s} ${c.robots} ${c.xrt}`);
        }
    }
    // Unchanged around the boundary: hubs stay index; the ±5 render window still decides 200 vs 404 at the edges.
    for (const u of ['/moon', '/en/moon', '/moon/saudi-arabia', '/moon/saudi-arabia/riyadh', '/en/moon/canada/quebec']) {
        const c = await get(u); ok(isIdx(c), `${tag} hub index ${u}`, `${c.s} ${c.robots}`);
    }
    for (const yr of [w.y - 6, w.y - 5, w.y + 5, w.y + 6]) {
        const c = await get(`/moon/saudi-arabia/riyadh/${yr}`); const inRender = yr >= w.y - 5 && yr <= w.y + 5;
        ok(inRender ? isNoidx(c) : c.s === 404, `${tag} render edge /${yr} want=${inRender ? '200 noindex' : '404'}`, `${c.s} ${c.robots}`);
    }
}

async function sitemaps(now, tag) {
    const idx = (await get('/sitemap.xml')).body;
    const famFiles = [...idx.matchAll(/<loc>[^<]*\/(sitemap-[a-z0-9-]+\.xml)<\/loc>/g)].map(m => m[1]);
    const legacy = []; for (let i = 1; i <= 40; i++) legacy.push(`sitemap-cities-${i}.xml`);
    const moonFiles = famFiles.filter(f => /^sitemap-moon(-\d+)?\.xml$/.test(f));
    ok(moonFiles.length >= 1, `${tag} index lists moon files`, famFiles.join(','));
    const collect = async (files) => {
        const per = {}; const all = new Set(); let sum = 0;
        for (const f of files) {
            const r = await get('/' + f); if (r.s !== 200) { per[f] = null; continue; }
            const locs = [...r.body.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1].replace(/^https?:\/\/[^/]+/, ''));
            per[f] = locs.length; sum += locs.length; ok(locs.length <= 50000, `${tag} ${f} <= 50k urls`, String(locs.length));
            for (const x of locs) all.add(x);
        }
        return { per, all, sum };
    };
    const fam = await collect(moonFiles), leg = await collect(legacy);
    ok(fam.sum === fam.all.size, `${tag} moon family: no URL repeated across shards`, `${fam.sum} vs ${fam.all.size}`);
    const w = win(now); const wantYears = []; for (let y = w.min; y <= w.max; y++) wantYears.push(y);
    const check = (S, name) => {
        const years = new Set(); let bad = 0, badEx = '';
        for (const x of S) { const m = x.match(moonYM); if (!m) continue; years.add(+m[3]);
            if (!expectIndexable(now, m[2], LIST.get(m[2]) || '?', +m[3], !!m[4])) { bad++; badEx = badEx || x; } }
        ok(bad === 0, `${tag} ${name}: no noindex page listed`, `${bad} e.g. ${badEx}`);
        ok(JSON.stringify([...years].sort()) === JSON.stringify(wantYears), `${tag} ${name}: years = window`, [...years].sort().join(','));
    };
    check(fam.all, 'moon family'); check(leg.all, 'legacy cities');
    const famYM = [...fam.all].filter(x => moonYM.test(x)).sort(), legYM = [...leg.all].filter(x => moonYM.test(x)).sort();
    ok(JSON.stringify(famYM) === JSON.stringify(legYM), `${tag} family and legacy list the same year/month pages`, `${famYM.length} vs ${legYM.length}`);
    // Expected size of the moon family: 2,730 non-year entries (/moon, countries, 107 city hubs, x10 langs)
    //   + 107 famous cities x 10 langs x (years + 12 months per year).
    const nY = w.max - w.min + 1; const wantMoon = 2730 + 107 * 10 * (nY + 12 * nY);
    ok(fam.all.size === wantMoon, `${tag} moon family size`, `${fam.all.size} want ${wantMoon}`);
    notes.push({ tag, now, moonFiles: fam.per, moonUrls: fam.all.size, moonYearMonth: famYM.length, legacyYearMonth: legYM.length, legacyFiles: Object.values(leg.per).filter(v => v !== null).length });
}

const STEPS = [   // [tag, clock]. Each boundary jump happens minutes after the previous step filled every cache.
    ['T0 2026-11-17', '2026-11-17T12:00:00Z'],
    ['T1 31-Dec', '2026-12-31T23:50:00Z'],
    ['T2 1-Jan', '2027-01-01T00:00:05Z'],
    ['T3 31-Jan', '2027-01-31T23:50:00Z'],
    ['T4 1-Feb', '2027-02-01T00:00:05Z'],
];
const t0 = Date.now();
await setClock(STEPS[0][1]);
const env = { ...process.env, PORT: String(PORT), ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0', WEB_CONCURRENCY: '2',
    TP_FAKE_CLOCK_FILE: CLOCK, NODE_OPTIONS: ((process.env.NODE_OPTIONS || '') + ' --require ' + JSON.stringify(PRELOAD)).trim() };
delete env.TP_MOON_RANGE_TEST_NOW;
const p = spawn(process.execPath, ['server.js'], { cwd: CAND, env, stdio: ['ignore', 'ignore', 'pipe'] });
let errTail = ''; p.stderr.on('data', d => { errTail = (errTail + d).slice(-4000); });
try {
    let up = false;
    for (let i = 0; i < 120 && !up; i++) { await sleep(500); try { up = (await fetch(`http://127.0.0.1:${PORT}/health`)).status === 200; } catch (_) {} }
    if (!up) throw new Error('boot failed: ' + errTail);
    let lastFillReal = 0, lastFillFake = 0;
    for (const [tag, iso] of STEPS) {
        await setClock(iso);
        if (lastFillReal && /^T[24] /.test(tag)) {   // boundary jumps land well inside SITEMAP_TTL of the previous fill => only the key can refresh it
            const gapFake = Date.parse(iso) - lastFillFake;
            notes.push({ tag, msSincePreviousCacheFill: gapFake });
            ok(gapFake < SITEMAP_TTL_MS, `${tag} jump lands inside the sitemap cache TTL`, String(gapFake));
        }
        const startFake = Date.parse(iso), startReal = Date.now();
        await sitemaps(iso, tag);
        await pages(iso, tag);
        lastFillReal = Date.now(); lastFillFake = startFake + (lastFillReal - startReal);
        notes.push({ tag, stepSeconds: Math.round((lastFillReal - startReal) / 1000) });
        ok(win(new Date(lastFillFake)).min === win(iso).min && new Date(lastFillFake).getUTCMonth() === new Date(iso).getUTCMonth(), `${tag} step did not cross a boundary`);
    }
} finally { p.kill(); try { fs.unlinkSync(CLOCK); } catch (_) {} }
const res = { pass, fail, failures, notes, seconds: Math.round((Date.now() - t0) / 1000) };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log(`moon-index-scope-h-1 in-process: ${pass} pass / ${fail} fail (${res.seconds}s)`);
for (const f of failures.slice(0, 40)) console.log('  FAIL', f);
console.log(JSON.stringify(notes));
process.exit(fail ? 1 : 0);
