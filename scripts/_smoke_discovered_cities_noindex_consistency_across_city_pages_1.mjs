// DISCOVERED-CITIES-NOINDEX-CONSISTENCY-ACROSS-CITY-PAGES-1 — verification (self-contained).
//
// Source of truth for indexability = presence in the FINAL curated set (_findPlaceBySlug).
// Any city NOT in curated must be noindex on ALL its city SEO routes — prayer-times, qibla,
// moon (today / hub / dated / month), time-left, next-prayer — not just prayer-times. Before
// this fix, qibla & moon out-indexed prayer-times for discovered / legacy-only cities.
//
//   • Curated city (makkah, an-nabiah-after-promote) → every route indexable, HTTP 200.
//   • Non-curated city (kamikawa, del-rio — real legacy/GeoNames towns NOT in curated) →
//     every route noindex, still HTTP 200 (works for the user, just not crawled).
//   • Bare tool hubs (/qibla, /moon-today, /) + country listing (/prayer-times-in-morocco)
//     stay indexable — only city-on-non-curated routes are noindex'd.
//   • Sitemap stays curated-only: non-curated slug absent from sitemap-cities; curated present.
//
// Run: node scripts/_smoke_discovered_cities_noindex_consistency_across_city_pages_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); }

console.log('═══ DISCOVERED-CITIES-NOINDEX-CONSISTENCY-ACROSS-CITY-PAGES-1 ═══');

const PORT = 8195;
function get(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET' }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
        });
        r.on('error', () => resolve({ status: 0, body: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await get('/health'); if (r.status === 200) return true; await sleep(400); } return false; }
// extract the SSR robots directive (noindex | index | none)
async function robotsOf(p) {
    const r = await get(p);
    const m = r.body.match(/name="robots"\s+content="(noindex|index)/i);
    return { robots: m ? m[1].toLowerCase() : 'none', status: r.status };
}

// City route families that take a {slug}.
const CITY_ROUTES = (slug) => ([
    ['prayer-times', '/prayer-times-in-' + slug],
    ['qibla',        '/qibla-in-' + slug],
    ['moon-today',   '/moon-today-in-' + slug],
    ['moon-hub',     '/moon-in-' + slug],
    ['moon-dated',   '/moon-in-' + slug + '/2026-06-20'],
    ['time-left',    '/time-left-until-next-prayer-in-' + slug],
    ['next-prayer',  '/next-prayer-in-' + slug],
]);

let exitCode = 1;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(20000)) { console.error('✗ not ready'); s.kill('SIGKILL'); process.exit(1); }

    // ── Curated cities → EVERY route indexable + HTTP 200 ──
    for (const slug of ['makkah', 'an-nabiah']) {
        console.log(`-- curated: ${slug} (must be index on all routes) --`);
        for (const [name, p] of CITY_ROUTES(slug)) {
            const { robots, status } = await robotsOf(p);
            check(`${slug} ${name}: index + 200`, robots === 'index' && status === 200, `${robots} / ${status}`);
        }
    }

    // ── Non-curated cities → EVERY route noindex, still HTTP 200 ──
    for (const slug of ['kamikawa', 'del-rio']) {
        console.log(`-- non-curated: ${slug} (must be noindex on all routes, still 200) --`);
        // oracle: prayer-times noindex confirms the slug is genuinely NOT curated.
        const pt = await robotsOf('/prayer-times-in-' + slug);
        check(`${slug}: confirmed non-curated (prayer-times noindex)`, pt.robots === 'noindex', pt.robots);
        for (const [name, p] of CITY_ROUTES(slug)) {
            const { robots, status } = await robotsOf(p);
            check(`${slug} ${name}: noindex + 200`, robots === 'noindex' && status === 200, `${robots} / ${status}`);
        }
    }

    // ── Hubs / tools / country must stay indexable ──
    console.log('-- hubs / tools / country (must stay index) --');
    for (const [label, p] of [['/qibla', '/qibla'], ['/moon-today', '/moon-today'], ['home /', '/'], ['country morocco', '/prayer-times-in-morocco']]) {
        const { robots, status } = await robotsOf(p);
        check(`${label}: index + 200`, robots === 'index' && status === 200, `${robots} / ${status}`);
    }

    // ── Sitemap stays curated-only (non-curated absent, curated present) ──
    console.log('-- sitemap is curated-only --');
    const sm = await get('/sitemap-cities-1.xml');
    check('sitemap-cities-1.xml served', sm.status === 200 && sm.body.indexOf('<urlset') !== -1);
    check('sitemap HAS curated /prayer-times-in-makkah', sm.body.indexOf('/prayer-times-in-makkah<') !== -1 || sm.body.indexOf('/prayer-times-in-makkah"') !== -1 || sm.body.indexOf('prayer-times-in-makkah') !== -1);
    check('sitemap HAS curated /qibla-in-makkah', sm.body.indexOf('qibla-in-makkah') !== -1);
    check('sitemap does NOT list non-curated kamikawa', sm.body.indexOf('kamikawa') === -1);
    check('sitemap does NOT list non-curated del-rio', sm.body.indexOf('del-rio') === -1);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
