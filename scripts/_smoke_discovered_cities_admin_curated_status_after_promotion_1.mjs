// DISCOVERED-CITIES-ADMIN-CURATED-STATUS-AFTER-PROMOTION-1 — verification (self-contained).
//
// A discovered city that was approved → promote-committed → merged → is NOW in curated
// must surface as the NEW status CURATED (distinct from ALREADY_CURATED, which is a city
// that was already curated before any review). The evidence required is a branch_committed
// record in discovered_place_promotions — NOT mere curated presence.
//
//   • qatif  (real curated slug) + branch_committed promotion record → CURATED
//   • dammam (real curated slug) + NO promotion record               → ALREADY_CURATED
//   • Fallback (no promotions source / migration 005 absent): qatif stays ALREADY_CURATED,
//     no errors.
//
// Uses two test seams (both inert in prod, only read when Supabase is OFF):
//   DISCOVERED_ADMIN_TEST_FIXTURE (discovered rows) + DISCOVERED_ADMIN_PROMOTIONS_FIXTURE
//   (promote records — needed because a live promote-commit can't run on an already-curated
//   slug: it fails the no_already_curated validation).
//
// Run: node scripts/_smoke_discovered_cities_admin_curated_status_after_promotion_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'curated-status-secret-7c2';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const CURATED = path.join(ROOT, 'db', 'places', 'curated-places.json');
const curatedBefore = readFileSync(CURATED, 'utf8');
let pass = 0, fail = 0;
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); }

console.log('═══ DISCOVERED-CITIES-ADMIN-CURATED-STATUS-AFTER-PROMOTION-1 ═══');

// Two discovered rows whose slugs ARE in curated (so the classifier → ALREADY_CURATED).
const FIXTURE = [
    { id: '1', slug: 'qatif', type: 'city', country_code: 'sa', lat: 26.565, lng: 49.996, timezone: 'Asia/Riyadh',
      names: { ar: 'القطيف', en: 'Qatif' }, aliases: { en: ['Al Qatif'] }, name_quality: { ar: 'official' }, admin: {},
      source: 'nominatim', source_id: 'osm-qatif', verified: false, search_count: 5, selected_count: 3,
      created_at: '2026-06-01T08:00:00Z', updated_at: '2026-06-01T08:00:00Z', last_used_at: '2026-06-05T09:00:00Z' },
    { id: '2', slug: 'dammam', type: 'city', country_code: 'sa', lat: 26.434, lng: 50.103, timezone: 'Asia/Riyadh',
      names: { ar: 'الدمام', en: 'Dammam' }, aliases: {}, name_quality: { ar: 'official' }, admin: {},
      source: 'nominatim', source_id: 'osm-dammam', verified: false, search_count: 2, selected_count: 1,
      created_at: '2026-06-10T08:00:00Z', updated_at: '2026-06-10T08:00:00Z', last_used_at: '2026-06-10T09:00:00Z' }
];
// One promotion record (branch_committed) for qatif ONLY → qatif becomes CURATED.
const COMMITTED_AT = '2026-06-14T10:00:00Z';
const PROMOTIONS = [
    { slug: 'qatif', country_code: 'sa', promote_status: 'branch_committed',
      promote_branch: 'admin/promote-discovered-20260614-1000-qatif', promote_commit_sha: 'abc1234567def',
      promote_report_path: 'reports/admin-promote-batch-202606141000.md', promote_committed_at: COMMITTED_AT }
];
const dir = mkdtempSync(path.join(tmpdir(), 'disc-curated-'));
const fxRows = path.join(dir, 'rows.json');
const fxProm = path.join(dir, 'promotions.json');
writeFileSync(fxRows, JSON.stringify(FIXTURE), 'utf8');
writeFileSync(fxProm, JSON.stringify(PROMOTIONS), 'utf8');

function reqRaw(port, method, p, headers) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port, path: p, method, headers: headers || {} }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
        });
        r.on('error', () => resolve({ status: 0, body: '' }));
        r.end();
    });
}
const get = (port, p, headers) => reqRaw(port, 'GET', p, headers, null);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(port, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await get(port, '/health'); if (r.status === 200) return true; await sleep(400); } return false; }
const leak = (s) => s.indexOf(TOKEN) !== -1 || s.indexOf(FAKE_SERVICE_KEY) !== -1 || /service_role/i.test(s);
const rowChunkFor = (html, slug) => (html.split('</tr>').find(ch => ch.indexOf('data-slug="' + slug + '"') !== -1) || '');

function spawnServer(port, extraEnv) {
    return spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(port), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_KEY, ADMIN_TOKEN: TOKEN, ...extraEnv }, stdio: ['ignore', 'ignore', 'ignore'] });
}

let exitCode = 1;
const auth = { Authorization: 'Bearer ' + TOKEN };

// ═════════ Server A — WITH promotions fixture → CURATED path ═════════
const PORT_A = 8184;
const sA = spawnServer(PORT_A, { DISCOVERED_ADMIN_TEST_FIXTURE: fxRows, DISCOVERED_ADMIN_PROMOTIONS_FIXTURE: fxProm });
// ═════════ Server B — WITHOUT promotions fixture → graceful fallback ═════════
const PORT_B = 8185;
const sB = spawnServer(PORT_B, { DISCOVERED_ADMIN_TEST_FIXTURE: fxRows });   // no promotions source

try {
    if (!await waitReady(PORT_A, 20000)) { console.error('✗ server A not ready'); throw new Error('A'); }
    if (!await waitReady(PORT_B, 20000)) { console.error('✗ server B not ready'); throw new Error('B'); }

    // ── Server A: JSON ──
    const rjA = await get(PORT_A, '/api/admin/discovered-cities', auth);
    let jA = {}; try { jA = JSON.parse(rjA.body); } catch (_) {}
    const rowsA = jA.rows || [];
    const qA = rowsA.find(r => r.slug === 'qatif');
    const dA = rowsA.find(r => r.slug === 'dammam');

    // 1) curated + branch_committed promotion → CURATED (not ALREADY_CURATED).
    check('qatif: status = CURATED', !!qA && qA.status === 'CURATED', qA && qA.status);
    check('qatif: NOT ALREADY_CURATED', !!qA && qA.status !== 'ALREADY_CURATED', qA && qA.status);
    // 2) curated + NO promotion record → ALREADY_CURATED (not CURATED).
    check('dammam: status = ALREADY_CURATED', !!dA && dA.status === 'ALREADY_CURATED', dA && dA.status);
    check('dammam: NOT CURATED', !!dA && dA.status !== 'CURATED', dA && dA.status);
    // counts split correctly.
    check('counts.CURATED = 1', (jA.counts || {}).CURATED === 1, JSON.stringify(jA.counts));
    check('counts.ALREADY_CURATED = 1', (jA.counts || {}).ALREADY_CURATED === 1, JSON.stringify(jA.counts));
    // CURATED carries promotion diagnostics + branch_committed badge data.
    check('qatif: promoteStatus = branch_committed', qA && qA.promoteStatus === 'branch_committed', qA && qA.promoteStatus);
    check('qatif: keeps branch/sha/report/committed_at', qA && qA.promoteBranch && qA.promoteCommitSha && qA.promoteReportPath && qA.promoteCommittedAt);
    // 7) last_activity_at uses committed_at; order = newest first (qatif 6-14 above dammam 6-10).
    check('qatif: last_activity_at = committed_at', qA && qA.last_activity_at === COMMITTED_AT, qA && qA.last_activity_at);
    const qi = rowsA.findIndex(r => r.slug === 'qatif'), di = rowsA.findIndex(r => r.slug === 'dammam');
    check('order: CURATED qatif (6-14) before ALREADY_CURATED dammam (6-10)', qi !== -1 && di !== -1 && qi < di, qi + ' < ' + di);
    let descA = true; for (let i = 0; i + 1 < rowsA.length; i++) if (String(rowsA[i].last_activity_at || '') < String(rowsA[i + 1].last_activity_at || '')) descA = false;
    check('rows last_activity_at DESC preserved', descA);

    // ── Server A: page UI ──
    const pgA = await get(PORT_A, '/admin/discovered-cities?token=' + encodeURIComponent(TOKEN));
    check('page: CURATED count chip', pgA.body.indexOf('CURATED:') !== -1);
    check('page: CURATED filter option', pgA.body.indexOf('<option value="CURATED">') !== -1);
    check('page: .s-CURATED badge CSS', pgA.body.indexOf('.s-CURATED{') !== -1);
    const qChunk = rowChunkFor(pgA.body, 'qatif');
    const dChunk = rowChunkFor(pgA.body, 'dammam');
    check('qatif row: data-status="CURATED"', qChunk.indexOf('data-status="CURATED"') !== -1);
    check('qatif row: badge s-CURATED', qChunk.indexOf('badge s-CURATED') !== -1);
    check('dammam row: data-status="ALREADY_CURATED"', dChunk.indexOf('data-status="ALREADY_CURATED"') !== -1);
    check('qatif row: promote cell shows report path', qChunk.indexOf('admin-promote-batch-202606141000.md') !== -1);
    check('qatif row: promote cell shows committed_at', qChunk.indexOf('2026-06-14 10:00') !== -1);
    // 6) search: data-text covers status(curated)+slug+country+name → searchable, AND filterable.
    const qdt = ((qChunk.match(/data-text="([^"]*)"/) || [])[1] || '').toLowerCase();
    check('qatif data-text has "curated" (status searchable)', qdt.indexOf('curated') !== -1);
    check('qatif data-text has slug + country (qatif, sa)', qdt.indexOf('qatif') !== -1 && /(^| )sa( |$)/.test(qdt));
    check('CURATED row filterable AND searchable (data-status + data-text both set)', qChunk.indexOf('data-status="CURATED"') !== -1 && qdt.length > 0);

    // ── Server B: graceful fallback (no promotions source) ──
    const rjB = await get(PORT_B, '/api/admin/discovered-cities', auth);
    let jB = {}; try { jB = JSON.parse(rjB.body); } catch (_) {}
    const qB = (jB.rows || []).find(r => r.slug === 'qatif');
    check('fallback: qatif → ALREADY_CURATED (no promotion source)', !!qB && qB.status === 'ALREADY_CURATED', qB && qB.status);
    check('fallback: no CURATED rows', !((jB.counts || {}).CURATED), JSON.stringify(jB.counts));
    const pgB = await get(PORT_B, '/admin/discovered-cities?token=' + encodeURIComponent(TOKEN));
    check('fallback: page still renders (200, no errors)', pgB.status === 200 && pgB.body.indexOf('discovered') !== -1);

    // ── Regression / safety ──
    check('NO secrets in JSON/page (A+B)', !leak(rjA.body) && !leak(pgA.body) && !leak(rjB.body) && !leak(pgB.body));
    check('local curated NOT mutated', readFileSync(CURATED, 'utf8') === curatedBefore);
    check('A: / → 200', (await get(PORT_A, '/')).status === 200);
    check('A: admin no token → 401', (await get(PORT_A, '/api/admin/discovered-cities')).status === 401);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { sA.kill('SIGKILL'); sB.kill('SIGKILL'); }
process.exit(exitCode);
