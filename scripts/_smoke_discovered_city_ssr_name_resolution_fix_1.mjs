// DISCOVERED-CITY-SSR-NAME-RESOLUTION-FIX-1 verification (self-contained).
//
// Proves: a NON-curated (discovered) city page renders its native
// names[lang] in the SSR title / meta / H1 / breadcrumb / BreadcrumbList
// JSON-LD / body labels — instead of the Latin _slugToTitle(slug) fallback —
// WITHOUT runtime translation, while:
//   • the page STAYS noindex,follow (the discovered-page robots guard is
//     independent of the name fix),
//   • a discovered city with NO names[lang] for the page lang (NEEDS_AR_NAME)
//     never leaks a Latin names.en into an Arabic page (it keeps the
//     slug-derived fallback),
//   • curated pages are completely unchanged (still index,follow).
//
// Self-contained: spawns its own `node server.js` on a unique PORT with
// Supabase DISABLED and the production-inert test seam
// (DISCOVERED_SSR_TEST_FIXTURE) pointing at a temp fixture, so the discovered
// SSR path can be exercised locally without a live Supabase. Kills the server
// on exit. Run: `node scripts/_smoke_discovered_city_ssr_name_resolution_fix_1.mjs`

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8099;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Fixture: one discovered city WITH a native Arabic name, one WITHOUT (only en).
const FIXTURE = {
    'testville': {
        slug: 'testville', lat: 27.5, lng: 1.5,
        timezone: 'Africa/Algiers', country_code: 'dz', type: 'city',
        names: { ar: 'تستفيل', en: 'Testville', fr: 'Testville' }
    },
    'noar-testcity': {
        slug: 'noar-testcity', lat: 36.0, lng: 3.0,
        timezone: 'Africa/Algiers', country_code: 'dz', type: 'city',
        names: { en: 'Noar Testcity Real' }   // NO names.ar → NEEDS_AR_NAME case
    }
};

const dir = mkdtempSync(path.join(tmpdir(), 'disc-ssr-'));
const fixturePath = path.join(dir, 'fixture.json');
writeFileSync(fixturePath, JSON.stringify(FIXTURE), 'utf8');

function get(p) {
    return new Promise((resolve) => {
        http.get({ host: 'localhost', port: PORT, path: p }, r => {
            let body = ''; r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, body }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitReady(timeoutMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
        const r = await get('/health');
        if (r.status === 200) return true;
        await sleep(400);
    }
    return false;
}

let pass = 0, fail = 0;
function check(label, ok, extra) {
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} ${label}${extra ? '   →  ' + extra : ''}`);
}

async function page(p) {
    const r = await get(p);
    const title = (r.body.match(/<title>([^<]*)<\/title>/) || [, ''])[1];
    const h1 = (r.body.match(/<h1[^>]*id="page-h1"[^>]*>([^<]*)<\/h1>/) || [, ''])[1];
    const bcCity = (r.body.match(/<span itemprop="name" id="bc-city"[^>]*>([^<]*)<\/span>/) || [, ''])[1];
    const robots = (r.body.match(/<meta name="robots" content="([^"]*)"/) || [, ''])[1];
    const hasSeed = r.body.indexOf('id="ssr-prayer-city"') !== -1;
    return { http: r.status, title, h1, bcCity, robots, hasSeed, body: r.body };
}

const srv = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), DISCOVERED_SSR_TEST_FIXTURE: fixturePath, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' },
    stdio: ['ignore', 'ignore', 'ignore']
});

let exitCode = 1;
try {
    const ready = await waitReady(20000);
    if (!ready) { console.error('✗ server did not become ready on :' + PORT); process.exitCode = 1; srv.kill('SIGKILL'); process.exit(1); }

    console.log('═══ DISCOVERED-CITY-SSR-NAME-RESOLUTION-FIX-1 ═══');

    // ── 1) Discovered WITH names.ar → Arabic everywhere on the AR page ──
    const kAr = await page('/prayer-times-in-testville');
    check('testville AR  title has تستفيل',        kAr.title.includes('تستفيل'), kAr.title);
    check('testville AR  title has NO Latin name',     !kAr.title.includes('Testville'));
    check('testville AR  H1 has تستفيل',           kAr.h1.includes('تستفيل'), kAr.h1);
    check('testville AR  breadcrumb = تستفيل',      kAr.bcCity === 'تستفيل', kAr.bcCity);
    check('testville AR  JSON-LD has تستفيل crumb',  kAr.body.includes('"name":"تستفيل"'));
    check('testville AR  JSON-LD has NO Latin crumb',   !kAr.body.includes('"name":"Testville"'));
    check('testville AR  __PRAYER_CITY__ seeded',      kAr.hasSeed);
    check('testville AR  STAYS noindex',               /noindex/.test(kAr.robots), kAr.robots);

    // ── 2) en / fr → correct native Latin name ──
    const kEn = await page('/en/prayer-times-in-testville');
    check('testville EN  title has Testville',    kEn.title.includes('Testville'), kEn.title);
    const kFr = await page('/fr/prayer-times-in-testville');
    check('testville FR  title has Testville',    kFr.title.includes('Testville'), kFr.title);

    // ── 3) ur / bn → not broken, no raw i18n key ──
    const kUr = await page('/ur/prayer-times-in-testville');
    check('testville UR  renders (no raw key)',        kUr.http === 200 && !/\b(npt|moon|header)\.\w+/.test(kUr.title), kUr.title);
    const kBn = await page('/bn/prayer-times-in-testville');
    check('testville BN  renders (no raw key)',        kBn.http === 200 && !/\b(npt|moon|header)\.\w+/.test(kBn.title), kBn.title);

    // ── 4) NEEDS_AR_NAME: discovered with only names.en → AR must NOT use names.en ──
    const nAr = await page('/prayer-times-in-noar-testcity');
    check('noar AR  title does NOT leak names.en', !nAr.title.includes('Noar Testcity Real'), nAr.title);
    check('noar AR  STAYS noindex',                /noindex/.test(nAr.robots), nAr.robots);
    check('noar AR  hero NOT seeded with Latin',   !nAr.hasSeed);
    const nEn = await page('/en/prayer-times-in-noar-testcity');
    check('noar EN  uses names.en',                nEn.title.includes('Noar Testcity Real'), nEn.title);

    // ── 5) Curated unchanged (still index,follow, Arabic name) ──
    const mk = await page('/prayer-times-in-makkah');
    check('makkah AR title = مكة المكرمة',         mk.title.includes('مكة المكرمة'), mk.title);
    check('makkah AR stays index,follow',          /(^|,)index,follow/.test(mk.robots), mk.robots);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} finally {
    srv.kill('SIGKILL');
}
process.exit(exitCode);
