// DISCOVERED-CITIES-ADMIN-DASHBOARD-MVP-1 verification (self-contained).
//
// Proves the private read-only admin dashboard over discovered_places:
//   • fail-closed: ADMIN_TOKEN env unset → 403 (page + API)
//   • missing/wrong token → 401 ; correct token (?token= or Bearer) → 200
//   • API returns SAFE JSON (rows/counts/total) with NO secrets
//   • page renders the table (fixture rows; Testville = تستفيل) and
//     carries noindex,nofollow (meta + X-Robots-Tag)
//   • NO secret (SUPABASE key / ADMIN_TOKEN value / service_role) leaks into
//     HTML or JSON
//
// Self-contained: spawns its own `node server.js` on unique ports. Supabase is
// OFF; the production-inert DISCOVERED_ADMIN_TEST_FIXTURE seam supplies rows so
// layout/escaping/auth verify locally. Run:
//   node scripts/_smoke_discovered_cities_admin_dashboard_mvp_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'test-secret-token-3f9a';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_SHOULD_NEVER_APPEAR';

// Raw discovered_places rows (snake_case, as Supabase returns).
const FIXTURE = [
    { id: '1', slug: 'testville', type: 'city', country_code: 'dz', lat: 27.5, lng: 1.5,
      timezone: 'Africa/Algiers', names: { ar: 'تستفيل', en: 'Testville', fr: 'Testville' },
      aliases: {}, name_quality: { ar: 'official' }, admin: {}, source: 'nominatim', source_id: 'osm123',
      verified: false, search_count: 0, selected_count: 3, created_at: '2026-06-10T08:00:00Z', updated_at: '2026-06-13T09:00:00Z', last_used_at: '2026-06-13T09:00:00Z' },
    { id: '2', slug: 'testnoar-city', type: 'city', country_code: 'dz', lat: 35.0, lng: 3.0,
      timezone: 'Africa/Algiers', names: { en: 'Testnoar City' }, aliases: {}, name_quality: {}, admin: {},
      source: 'nominatim', source_id: null, verified: false, search_count: 1, selected_count: 2,
      created_at: '2026-06-11T08:00:00Z', updated_at: '2026-06-12T09:00:00Z', last_used_at: '2026-06-12T09:00:00Z' },
    { id: '3', slug: 'lowconf-city', type: 'city', country_code: 'ma', lat: 34.0, lng: -5.0,
      timezone: 'Africa/Casablanca', names: { ar: 'مدينة اختبار', en: 'Lowconf City' }, aliases: {}, name_quality: { ar: 'official' },
      admin: {}, source: 'nominatim', source_id: null, verified: true, search_count: 0, selected_count: 0,
      created_at: '2026-06-09T08:00:00Z', updated_at: '2026-06-09T09:00:00Z', last_used_at: null }
];

const dir = mkdtempSync(path.join(tmpdir(), 'disc-admin-'));
const fixturePath = path.join(dir, 'fixture.json');
writeFileSync(fixturePath, JSON.stringify(FIXTURE), 'utf8');

function req(port, p, headers) {
    return new Promise((resolve) => {
        http.get({ host: 'localhost', port, path: p, headers: headers || {} }, r => {
            let body = ''; r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, headers: r.headers, body }));
        }).on('error', () => resolve({ status: 0, headers: {}, body: '' }));
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(port, ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { const r = await req(port, '/health'); if (r.status === 200) return true; await sleep(400); }
    return false;
}
function spawnServer(port, env) {
    return spawn(process.execPath, ['server.js'], {
        cwd: ROOT,
        env: { ...process.env, PORT: String(port), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_KEY, ...env },
        stdio: ['ignore', 'ignore', 'ignore']
    });
}

let pass = 0, fail = 0;
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra ? '   →  ' + extra : ''}`); }

console.log('═══ DISCOVERED-CITIES-ADMIN-DASHBOARD-MVP-1 ═══');

// ── Phase 1: NO ADMIN_TOKEN → fail-closed 403 ──
const PORT_A = 8101;
const srvA = spawnServer(PORT_A, { /* ADMIN_TOKEN intentionally unset */ });
let exitCode = 1;
try {
    if (!await waitReady(PORT_A, 20000)) { console.error('✗ server A not ready'); srvA.kill('SIGKILL'); process.exit(1); }
    const pNo = await req(PORT_A, '/admin/discovered-cities');
    const aNo = await req(PORT_A, '/api/admin/discovered-cities');
    check('no ADMIN_TOKEN → page 403',  pNo.status === 403, 'got ' + pNo.status);
    check('no ADMIN_TOKEN → api  403',  aNo.status === 403, 'got ' + aNo.status);
    check('403 carries X-Robots-Tag noindex,nofollow', /noindex,\s*nofollow/.test(pNo.headers['x-robots-tag'] || ''), pNo.headers['x-robots-tag']);
} finally { srvA.kill('SIGKILL'); }
await sleep(800);

// ── Phase 2: ADMIN_TOKEN set + fixture ──
const PORT_B = 8102;
const srvB = spawnServer(PORT_B, { ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath });
try {
    if (!await waitReady(PORT_B, 20000)) { console.error('✗ server B not ready'); srvB.kill('SIGKILL'); process.exit(1); }

    const pMissing = await req(PORT_B, '/admin/discovered-cities');
    const pWrong   = await req(PORT_B, '/admin/discovered-cities?token=nope');
    const pOk      = await req(PORT_B, '/admin/discovered-cities?token=' + encodeURIComponent(TOKEN));
    const aMissing = await req(PORT_B, '/api/admin/discovered-cities');
    const aWrong   = await req(PORT_B, '/api/admin/discovered-cities', { Authorization: 'Bearer wrong' });
    const aOkQ     = await req(PORT_B, '/api/admin/discovered-cities?token=' + encodeURIComponent(TOKEN));
    const aOkH     = await req(PORT_B, '/api/admin/discovered-cities', { Authorization: 'Bearer ' + TOKEN });

    check('page no token → 401',          pMissing.status === 401, 'got ' + pMissing.status);
    check('page wrong token → 401',       pWrong.status === 401,   'got ' + pWrong.status);
    check('page correct ?token= → 200',   pOk.status === 200,      'got ' + pOk.status);
    check('api no token → 401',           aMissing.status === 401, 'got ' + aMissing.status);
    check('api wrong Bearer → 401',       aWrong.status === 401,   'got ' + aWrong.status);
    check('api ?token= → 200',            aOkQ.status === 200,     'got ' + aOkQ.status);
    check('api Bearer header → 200',      aOkH.status === 200,     'got ' + aOkH.status);

    // headers
    check('page 200 X-Robots-Tag noindex,nofollow', /noindex,\s*nofollow/.test(pOk.headers['x-robots-tag'] || ''), pOk.headers['x-robots-tag']);
    check('api 200 X-Robots-Tag noindex,nofollow',  /noindex,\s*nofollow/.test(aOkH.headers['x-robots-tag'] || ''), aOkH.headers['x-robots-tag']);
    check('page has <meta robots noindex,nofollow>', /name="robots"\s+content="noindex,nofollow"/.test(pOk.body));

    // JSON shape
    let j = {}; try { j = JSON.parse(aOkH.body); } catch (_) {}
    check('api JSON has total/counts/rows', typeof j.total === 'number' && j.counts && Array.isArray(j.rows), 'total=' + j.total);
    const testville = (j.rows || []).find(r => r.slug === 'testville');
    check('api row testville nameAr = تستفيل', !!testville && testville.nameAr === 'تستفيل', testville && testville.nameAr);
    check('api row testville status READY_FOR_REVIEW', !!testville && testville.status === 'READY_FOR_REVIEW', testville && testville.status);
    const noar = (j.rows || []).find(r => r.slug === 'testnoar-city');
    check('api row testnoar status NEEDS_AR_NAME', !!noar && noar.status === 'NEEDS_AR_NAME', noar && noar.status);
    check('api counts include READY_FOR_REVIEW', (j.counts && j.counts.READY_FOR_REVIEW) >= 1, JSON.stringify(j.counts));

    // page renders the table + testville
    check('page renders table + testville', /<table/.test(pOk.body) && pOk.body.indexOf('تستفيل') !== -1);

    // SECURITY: no secret leaks anywhere
    const leaked = (s) => s.indexOf(TOKEN) !== -1 || s.indexOf(FAKE_SERVICE_KEY) !== -1 || /service_role/i.test(s) || /SUPABASE_SERVICE_ROLE_KEY/.test(s);
    check('page HTML has NO secrets', !leaked(pOk.body));
    check('api JSON has NO secrets',  !leaked(aOkH.body));

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} finally { srvB.kill('SIGKILL'); }
process.exit(exitCode);
