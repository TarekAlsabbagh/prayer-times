// DISCOVERED-CITIES-ADMIN-PROMOTE-COMMIT-ERROR-DIAGNOSTICS-1 — verification (self-contained).
//
// Proves the promote-commit endpoint emits STRUCTURED, SAFE diagnostics when the
// GitHub flow fails — clear error code + stage + GitHub status + safe GitHub
// message, NEVER the token / service key / raw body. Uses the inert test seams
// PROMOTE_GITHUB_TEST_MODE=1 + PROMOTE_GITHUB_TEST_FAIL="stage:status:message"
// to simulate a GitHub failure at a given stage with NO real GitHub call.
//
//   • 401 at get_base_ref          → error=github_auth_failed,            gh=401, HTTP 502
//   • 403 at create_tree           → error=github_permission_denied,      gh=403, HTTP 502
//   • 404 at get_base_curated_meta → error=github_base_branch_not_found,  gh=404, HTTP 502
//   • 422 at create_ref (exists)   → error=github_branch_already_exists,  gh=422, HTTP 409
//   • 500 at create_commit         → error=github_create_commit_failed,   gh=500, HTTP 502
//   • bad GITHUB_REPO format       → error=github_repo_invalid_format,    HTTP 500 (pre-call)
//   • happy path (no injection)    → 200 committed (no regression)
//   • every error body: top-level `error` present (client renders it), ok:false, NO secrets
//
// Run: node scripts/_smoke_discovered_cities_admin_promote_commit_error_diagnostics_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'diag-secret-9b2e';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const FAKE_GH_TOKEN = 'ghp_FAKE_TOKEN_MUST_NOT_LEAK_1234567890';
const CURATED = path.join(ROOT, 'db', 'places', 'curated-places.json');

const FIXTURE = [
    { id: '1', slug: 'khams-djouamaa', type: 'city', country_code: 'dz', lat: 36.1474693, lng: 3.1331309,
      timezone: 'Africa/Algiers', names: { ar: 'خمس جوامع', en: 'Khams Djouamaa' }, aliases: {}, name_quality: { ar: 'official' },
      admin: {}, source: 'nominatim', source_id: 'osm1', verified: false, search_count: 0, selected_count: 3,
      created_at: '2026-06-10T08:00:00Z', updated_at: '2026-06-13T09:00:00Z', last_used_at: '2026-06-13T09:00:00Z' }
];

const dir = mkdtempSync(path.join(tmpdir(), 'disc-diag-'));
const fixturePath = path.join(dir, 'fixture.json');
writeFileSync(fixturePath, JSON.stringify(FIXTURE), 'utf8');
const curatedBefore = readFileSync(CURATED, 'utf8');

function reqRaw(port, method, p, headers, body) {
    return new Promise((resolve) => {
        const data = body == null ? null : (typeof body === 'string' ? body : JSON.stringify(body));
        const r = http.request({ host: 'localhost', port, path: p, method, headers: headers || {} }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
        });
        r.on('error', () => resolve({ status: 0, headers: {}, body: '' }));
        if (data != null) r.write(data);
        r.end();
    });
}
const get = (port, p, headers) => reqRaw(port, 'GET', p, headers, null);
const postJson = (port, p, obj, headers) => reqRaw(port, 'POST', p, Object.assign({ 'Content-Type': 'application/json' }, headers || {}), JSON.stringify(obj));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(port, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await get(port, '/health'); if (r.status === 200) return true; await sleep(400); } return false; }
function spawnServer(port, env) { return spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(port), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_KEY, ...env }, stdio: ['ignore', 'ignore', 'ignore'] }); }
let pass = 0, fail = 0;
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra ? '   →  ' + extra : ''}`); }

const COMMIT = '/api/admin/discovered-cities/promote-commit';
const REVIEW = '/api/admin/discovered-cities/review';
const ITEM = { slug: 'khams-djouamaa', countryCode: 'dz' };
// Secret-LEAK detector: the 3 secret VALUES + service_role. (Env var NAMES like
// GITHUB_REPO/GITHUB_TOKEN are not secrets and may appear in safe `hint` text.)
const leak = (s) => s.indexOf(TOKEN) !== -1 || s.indexOf(FAKE_SERVICE_KEY) !== -1 || s.indexOf(FAKE_GH_TOKEN) !== -1 || /service_role/i.test(s);

// Spawn a test-mode server with an injected GitHub failure, approve khams, POST
// commit, and return { status, body, j }.
async function runInjected(port, failDesc) {
    const s = spawnServer(port, { ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath, PROMOTE_GITHUB_TEST_MODE: '1', PROMOTE_GITHUB_TEST_FAIL: failDesc, GITHUB_TOKEN: FAKE_GH_TOKEN, GITHUB_REPO: 'owner/repo' });
    try {
        if (!await waitReady(port, 20000)) { console.error('✗ not ready ' + port); s.kill('SIGKILL'); process.exit(1); }
        const auth = { Authorization: 'Bearer ' + TOKEN };
        await postJson(port, REVIEW, { slug: 'khams-djouamaa', countryCode: 'dz', decision: 'approved' }, auth);
        const r = await postJson(port, COMMIT, { items: [ITEM], target: 'branch' }, auth);
        let j = {}; try { j = JSON.parse(r.body); } catch (_) {}
        return { status: r.status, body: r.body, j };
    } finally { s.kill('SIGKILL'); }
}

console.log('═══ DISCOVERED-CITIES-ADMIN-PROMOTE-COMMIT-ERROR-DIAGNOSTICS-1 ═══');
let exitCode = 1;
try {
    // 1) 401 auth at get_base_ref
    let R = await runInjected(8141, 'get_base_ref:401:Bad credentials');
    check('401 → HTTP 502', R.status === 502, 'got ' + R.status);
    check('401 → error=github_auth_failed', R.j.error === 'github_auth_failed', R.j.error);
    check('401 → stage=get_base_ref', R.j.stage === 'get_base_ref', R.j.stage);
    check('401 → gh status=401', R.j.status === 401, '' + R.j.status);
    check('401 → ok:false + error present (client renders)', R.j.ok === false && typeof R.j.error === 'string');
    check('401 → NO secrets', !leak(R.body));
    await sleep(500);

    // 2) 403 permission at create_tree
    R = await runInjected(8142, 'create_tree:403:Resource not accessible');
    check('403 → HTTP 502', R.status === 502, 'got ' + R.status);
    check('403 → error=github_permission_denied', R.j.error === 'github_permission_denied', R.j.error);
    check('403 → stage=create_tree', R.j.stage === 'create_tree', R.j.stage);
    check('403 → NO secrets', !leak(R.body));
    await sleep(500);

    // 3) 404 at get_base_curated_meta (root-cause-adjacent stage)
    R = await runInjected(8143, 'get_base_curated_meta:404:Not Found');
    check('404 → HTTP 502', R.status === 502, 'got ' + R.status);
    check('404 → error=github_base_branch_not_found', R.j.error === 'github_base_branch_not_found', R.j.error);
    check('404 → stage=get_base_curated_meta', R.j.stage === 'get_base_curated_meta', R.j.stage);
    check('404 → safe gh message surfaced', R.j.githubMessage === 'Not Found', R.j.githubMessage);
    check('404 → NO secrets', !leak(R.body));
    await sleep(500);

    // 4) 422 branch-already-exists at create_ref
    R = await runInjected(8144, 'create_ref:422:Reference already exists');
    check('422 exists → HTTP 409', R.status === 409, 'got ' + R.status);
    check('422 exists → error=github_branch_already_exists', R.j.error === 'github_branch_already_exists', R.j.error);
    check('422 exists → stage=create_ref', R.j.stage === 'create_ref', R.j.stage);
    check('422 exists → gh status=422', R.j.status === 422, '' + R.j.status);
    check('422 exists → message surfaced', R.j.githubMessage === 'Reference already exists', R.j.githubMessage);
    check('422 exists → NO secrets', !leak(R.body));
    await sleep(500);

    // 5) 500 per-stage default at create_commit
    R = await runInjected(8145, 'create_commit:500:Internal Server Error');
    check('500 → HTTP 502', R.status === 502, 'got ' + R.status);
    check('500 → error=github_create_commit_failed', R.j.error === 'github_create_commit_failed', R.j.error);
    check('500 → stage=create_commit', R.j.stage === 'create_commit', R.j.stage);
    check('500 → NO secrets', !leak(R.body));
    await sleep(500);

    // 6) bad GITHUB_REPO format (non-test-mode, pre-call validation, NO GitHub call)
    {
        const port = 8146;
        const s = spawnServer(port, { ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath, GITHUB_TOKEN: FAKE_GH_TOKEN, GITHUB_REPO: 'badformat-no-slash' });
        try {
            if (!await waitReady(port, 20000)) { console.error('✗ not ready ' + port); s.kill('SIGKILL'); process.exit(1); }
            const auth = { Authorization: 'Bearer ' + TOKEN };
            const r = await postJson(port, COMMIT, { items: [ITEM], target: 'branch' }, auth);
            let j = {}; try { j = JSON.parse(r.body); } catch (_) {}
            check('bad repo → HTTP 500', r.status === 500, 'got ' + r.status);
            check('bad repo → error=github_repo_invalid_format', j.error === 'github_repo_invalid_format', j.error);
            check('bad repo → stage=preflight', j.stage === 'preflight', j.stage);
            check('bad repo → NO secrets', !leak(r.body));
        } finally { s.kill('SIGKILL'); }
    }
    await sleep(500);

    // 7) happy path still works (test-mode, no injection) → 200 committed
    {
        const port = 8147;
        const s = spawnServer(port, { ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath, PROMOTE_GITHUB_TEST_MODE: '1', GITHUB_TOKEN: FAKE_GH_TOKEN, GITHUB_REPO: 'owner/repo' });
        try {
            if (!await waitReady(port, 20000)) { console.error('✗ not ready ' + port); s.kill('SIGKILL'); process.exit(1); }
            const auth = { Authorization: 'Bearer ' + TOKEN };
            await postJson(port, REVIEW, { slug: 'khams-djouamaa', countryCode: 'dz', decision: 'approved' }, auth);
            const r = await postJson(port, COMMIT, { items: [ITEM], target: 'branch' }, auth);
            let j = {}; try { j = JSON.parse(r.body); } catch (_) {}
            check('happy path → 200 committed (no regression)', r.status === 200 && j.status === 'committed', 'got ' + r.status + ' ' + j.status);
            check('happy path → NO secrets', !leak(r.body));
        } finally { s.kill('SIGKILL'); }
    }

    check('local curated-places.json NOT mutated', readFileSync(CURATED, 'utf8') === curatedBefore);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
}
process.exit(exitCode);
