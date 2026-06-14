// DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 — Phase 1 verification (self-contained).
//
// Proves the protected review-decision endpoint + persistence + no promotion:
//   • POST /api/admin/discovered-cities/review is token-gated:
//       no ADMIN_TOKEN env → 403 ; missing/wrong token → 401 ; correct → 200
//   • a saved decision shows in the dashboard GET and PERSISTS across refresh
//       (Supabase off → in-memory dev store; prod uses discovered_place_reviews)
//   • input validation (bad decision → 400 ; non-JSON → 415 ; GET → 405)
//   • NO secret (ADMIN_TOKEN / SUPABASE key / service_role) leaks into responses
//   • saving a decision does NOT mutate curated-places.json (read-only here)
//
// Self-contained: spawns its own server (Supabase OFF, admin fixture seam). Run:
//   node scripts/_smoke_discovered_cities_admin_review_actions_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'review-secret-7c1d';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const CURATED = path.join(ROOT, 'db', 'places', 'curated-places.json');

const FIXTURE = [
    { id: '1', slug: 'khams-djouamaa', type: 'city', country_code: 'dz', lat: 36.1474693, lng: 3.1331309,
      timezone: 'Africa/Algiers', names: { ar: 'خمس جوامع', en: 'Khams Djouamaa' }, aliases: {}, name_quality: { ar: 'official' },
      admin: {}, source: 'nominatim', source_id: 'osm1', verified: false, search_count: 0, selected_count: 3,
      created_at: '2026-06-10T08:00:00Z', updated_at: '2026-06-13T09:00:00Z', last_used_at: '2026-06-13T09:00:00Z' }
];

const dir = mkdtempSync(path.join(tmpdir(), 'disc-rev-'));
const fixturePath = path.join(dir, 'fixture.json');
writeFileSync(fixturePath, JSON.stringify(FIXTURE), 'utf8');
const curatedBefore = readFileSync(CURATED, 'utf8');   // to assert NOT mutated

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
function spawnServer(port, env) {
    return spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(port), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_KEY, ...env }, stdio: ['ignore', 'ignore', 'ignore'] });
}
let pass = 0, fail = 0;
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra ? '   →  ' + extra : ''}`); }

console.log('═══ DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 Phase 1 ═══');

let exitCode = 1;

// Phase A: no ADMIN_TOKEN → fail-closed 403
const PORT_A = 8111;
const srvA = spawnServer(PORT_A, {});
try {
    if (!await waitReady(PORT_A, 20000)) { console.error('✗ server A not ready'); srvA.kill('SIGKILL'); process.exit(1); }
    const r = await postJson(PORT_A, '/api/admin/discovered-cities/review', { slug: 'khams-djouamaa', countryCode: 'dz', decision: 'approved' });
    check('no ADMIN_TOKEN → /review 403', r.status === 403, 'got ' + r.status);
} finally { srvA.kill('SIGKILL'); }
await sleep(800);

// Phase B: ADMIN_TOKEN + fixture
const PORT_B = 8112;
const srvB = spawnServer(PORT_B, { ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath });
try {
    if (!await waitReady(PORT_B, 20000)) { console.error('✗ server B not ready'); srvB.kill('SIGKILL'); process.exit(1); }
    const auth = { Authorization: 'Bearer ' + TOKEN };

    // auth gating
    const rNo = await postJson(PORT_B, '/api/admin/discovered-cities/review', { slug: 'khams-djouamaa', countryCode: 'dz', decision: 'approved' });
    check('review no token → 401', rNo.status === 401, 'got ' + rNo.status);
    const rWrong = await postJson(PORT_B, '/api/admin/discovered-cities/review', { slug: 'khams-djouamaa', countryCode: 'dz', decision: 'approved' }, { Authorization: 'Bearer nope' });
    check('review wrong token → 401', rWrong.status === 401, 'got ' + rWrong.status);
    const rGet = await get(PORT_B, '/api/admin/discovered-cities/review', auth);
    check('review GET method → 405', rGet.status === 405, 'got ' + rGet.status);
    const rForm = await reqRaw(PORT_B, 'POST', '/api/admin/discovered-cities/review', Object.assign({ 'Content-Type': 'text/plain' }, auth), 'slug=x');
    check('review non-JSON → 415', rForm.status === 415, 'got ' + rForm.status);
    const rBad = await postJson(PORT_B, '/api/admin/discovered-cities/review', { slug: 'khams-djouamaa', countryCode: 'dz', decision: 'bogus' }, auth);
    check('review invalid decision → 400', rBad.status === 400, 'got ' + rBad.status);

    // valid save
    const rOk = await postJson(PORT_B, '/api/admin/discovered-cities/review', { slug: 'khams-djouamaa', countryCode: 'dz', decision: 'approved', note: 'Arabic name verified: خمس جوامع' }, auth);
    let okJson = {}; try { okJson = JSON.parse(rOk.body); } catch (_) {}
    check('review correct token → 200 ok', rOk.status === 200 && okJson.ok === true, 'got ' + rOk.status);
    check('review echoes decision approved', okJson.review && okJson.review.decision === 'approved');

    // persists in the dashboard GET (and across a refresh)
    const g1 = await get(PORT_B, '/api/admin/discovered-cities', auth);
    let j1 = {}; try { j1 = JSON.parse(g1.body); } catch (_) {}
    const k1 = (j1.rows || []).find(x => x.slug === 'khams-djouamaa');
    check('GET shows reviewDecision=approved', !!k1 && k1.reviewDecision === 'approved', k1 && k1.reviewDecision);
    check('GET shows the saved note', !!k1 && k1.reviewNote === 'Arabic name verified: خمس جوامع');
    check('reviewCounts.approved >= 1', (j1.reviewCounts && j1.reviewCounts.approved) >= 1, JSON.stringify(j1.reviewCounts));
    const g2 = await get(PORT_B, '/api/admin/discovered-cities', auth);
    let j2 = {}; try { j2 = JSON.parse(g2.body); } catch (_) {}
    const k2 = (j2.rows || []).find(x => x.slug === 'khams-djouamaa');
    check('decision PERSISTS across refresh', !!k2 && k2.reviewDecision === 'approved');

    // page HTML renders the review controls (drawer + buttons) for the authed page
    const pg = await get(PORT_B, '/admin/discovered-cities?token=' + encodeURIComponent(TOKEN));
    check('page has Review button + drawer', pg.status === 200 && /class="rvbtn"/.test(pg.body) && /id="drawer"/.test(pg.body));
    check('page has review filter (f-rv)', /id="f-rv"/.test(pg.body));

    // SECURITY: no secret leaks
    const leak = (s) => s.indexOf(TOKEN) !== -1 || s.indexOf(FAKE_SERVICE_KEY) !== -1 || /service_role/i.test(s) || /SUPABASE_SERVICE_ROLE_KEY/.test(s);
    check('review JSON has NO secrets', !leak(rOk.body));
    check('GET JSON has NO secrets', !leak(g1.body));
    check('page HTML has NO secrets', !leak(pg.body));

    // NOT-PROMOTED: curated-places.json unchanged on disk
    check('curated-places.json NOT mutated', readFileSync(CURATED, 'utf8') === curatedBefore);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} finally { srvB.kill('SIGKILL'); }
process.exit(exitCode);
