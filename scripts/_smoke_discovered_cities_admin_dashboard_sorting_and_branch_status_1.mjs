// DISCOVERED-CITIES-ADMIN-DASHBOARD-SORTING-AND-BRANCH-STATUS-1 — verification (self-contained).
//
// Proves the admin dashboard's NEW branch-status + sorting layer:
//   • Prepare Promote Preview does NOT change status to ALREADY_CURATED, and does
//     NOT set any promote_status (preview writes nothing).
//   • Commit & Push to Branch records promote_status = 'branch_committed'
//     (+ branch + commit sha), via the SEPARATE discovered_place_promotions store.
//   • main / local curated is NOT mutated; testville stays 'discovered · noindex' and
//     its CLASSIFICATION status never flips to ALREADY_CURATED after a branch commit.
//   • ALREADY_CURATED appears ONLY for a city whose slug is actually in curated.
//   • Default order = Last Activity, Descending (recently-handled city on top).
//   • Sort by (9 options) + Sort direction (desc/asc) controls + per-row data-*
//     sort attributes are present; the promote column + chip render.
//   • NO secrets in HTML/JSON. Public pages 200.
//
// Test seams (inert in prod): DISCOVERED_ADMIN_TEST_FIXTURE + PROMOTE_GITHUB_TEST_MODE=1.
// The promote-status save runs to the in-memory store (Supabase off) — migration 005
// is NOT required to run this smoke.
// Run: node scripts/_smoke_discovered_cities_admin_dashboard_sorting_and_branch_status_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'sortbranch-secret-7c1';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const FAKE_GH_TOKEN = 'ghp_FAKE_TOKEN_MUST_NOT_LEAK_1234567890';
const CURATED = path.join(ROOT, 'db', 'places', 'curated-places.json');

// Pick a real curated entry → a discovered fixture row sharing its slug must
// classify as ALREADY_CURATED (proves the classifier reads the deployed curated).
const curatedArr = JSON.parse(readFileSync(CURATED, 'utf8'));
const cf = curatedArr.find(e => e && e.slug && (e.country_code || e.cc || e.countryCode)) || curatedArr[0];
const cfCc = String(cf.country_code || cf.cc || cf.countryCode || 'sa').toLowerCase();

const FIXTURE = [
    // testville — NOT in curated; recent activity; will be approved + committed to branch.
    { id: '1', slug: 'testville', type: 'city', country_code: 'dz', lat: 27.5, lng: 1.5,
      timezone: 'Africa/Algiers', names: { ar: 'تستفيل', en: 'Testville' }, aliases: {}, name_quality: { ar: 'official' },
      admin: {}, source: 'nominatim', source_id: 'osm1', verified: false, search_count: 0, selected_count: 3,
      created_at: '2026-06-10T08:00:00Z', updated_at: '2026-06-13T09:00:00Z', last_used_at: '2026-06-13T09:00:00Z' },
    // a clone of a real curated entry's slug → must classify ALREADY_CURATED; OLD activity.
    { id: '2', slug: cf.slug, type: 'city', country_code: cfCc, lat: (cf.lat || 21), lng: (cf.lng || 39),
      timezone: (cf.timezone || 'Asia/Riyadh'), names: (cf.names || { ar: '', en: cf.slug }), aliases: {}, name_quality: {},
      admin: {}, source: 'curated-clone', source_id: 'osm2', verified: false, search_count: 0, selected_count: 1,
      created_at: '2020-01-01T00:00:00Z', updated_at: '2020-01-02T00:00:00Z', last_used_at: '2020-01-02T00:00:00Z' }
];

const dir = mkdtempSync(path.join(tmpdir(), 'disc-sort-'));
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

const JSONAPI = '/api/admin/discovered-cities';
const PAGE = '/admin/discovered-cities';
const REVIEW = '/api/admin/discovered-cities/review';
const PREVIEW = '/api/admin/discovered-cities/promote-preview';
const COMMIT = '/api/admin/discovered-cities/promote-commit';
const leak = (s) => s.indexOf(TOKEN) !== -1 || s.indexOf(FAKE_SERVICE_KEY) !== -1 || s.indexOf(FAKE_GH_TOKEN) !== -1 || /service_role/i.test(s);
const findRow = (data, slug) => (data.rows || []).find(r => r.slug === slug) || null;
async function jsonRows(port, auth) { const r = await get(port, JSONAPI, auth); let j = {}; try { j = JSON.parse(r.body); } catch (_) {} return j; }

console.log('═══ DISCOVERED-CITIES-ADMIN-DASHBOARD-SORTING-AND-BRANCH-STATUS-1 ═══');
console.log('  (curated clone slug = ' + cf.slug + ' / ' + cfCc + ')');
let exitCode = 1;

const PORT = 8161;
const s = spawnServer(PORT, { ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath, PROMOTE_GITHUB_TEST_MODE: '1', GITHUB_TOKEN: FAKE_GH_TOKEN, GITHUB_REPO: 'owner/repo' });
try {
    if (!await waitReady(PORT, 20000)) { console.error('✗ not ready'); s.kill('SIGKILL'); process.exit(1); }
    const auth = { Authorization: 'Bearer ' + TOKEN };

    // ── Baseline (no review, no promote) ──
    let data = await jsonRows(PORT, auth);
    let testville = findRow(data, 'testville');
    let clone = findRow(data, cf.slug);
    check('baseline: testville present', !!testville, testville && testville.status);
    check('baseline: testville NOT ALREADY_CURATED', testville && testville.status !== 'ALREADY_CURATED', testville && testville.status);
    check('baseline: testville promoteStatus empty', testville && testville.promoteStatus === '', testville && JSON.stringify(testville.promoteStatus));
    check('ALREADY_CURATED only for in-curated city (clone)', clone && clone.status === 'ALREADY_CURATED', clone && clone.status);
    check('clone pageStatus = curated · indexable', clone && clone.pageStatus === 'curated · indexable', clone && clone.pageStatus);

    // ── Approve testville + Prepare Preview (preview writes NOTHING) ──
    await postJson(PORT, REVIEW, { slug: 'testville', countryCode: 'dz', decision: 'approved' }, auth);
    const prev = await postJson(PORT, PREVIEW, { items: [{ slug: 'testville', countryCode: 'dz' }] }, auth);
    check('preview → 200', prev.status === 200, 'got ' + prev.status);
    data = await jsonRows(PORT, auth); testville = findRow(data, 'testville');
    check('after PREVIEW: testville still NOT ALREADY_CURATED', testville && testville.status !== 'ALREADY_CURATED', testville && testville.status);
    check('after PREVIEW: testville promoteStatus STILL empty (preview wrote nothing)', testville && testville.promoteStatus === '', testville && JSON.stringify(testville.promoteStatus));
    check('after PREVIEW: testville pageStatus still discovered · noindex', testville && testville.pageStatus === 'discovered · noindex', testville && testville.pageStatus);

    // ── Commit & Push to Branch → records promote_status = branch_committed ──
    const rc = await postJson(PORT, COMMIT, { items: [{ slug: 'testville', countryCode: 'dz' }], target: 'branch' }, auth);
    let jc = {}; try { jc = JSON.parse(rc.body); } catch (_) {}
    check('commit → 200 committed', rc.status === 200 && jc.status === 'committed', 'got ' + rc.status + ' ' + jc.status);

    data = await jsonRows(PORT, auth); testville = findRow(data, 'testville');
    check('after COMMIT: testville promoteStatus = branch_committed', testville && testville.promoteStatus === 'branch_committed', testville && testville.promoteStatus);
    check('after COMMIT: testville promoteBranch = admin/promote-discovered-…', testville && /^admin\/promote-discovered-/.test(testville.promoteBranch || ''), testville && testville.promoteBranch);
    check('after COMMIT: testville promoteCommitSha present', testville && typeof testville.promoteCommitSha === 'string' && testville.promoteCommitSha.length > 0, testville && testville.promoteCommitSha);
    check('after COMMIT: testville still NOT ALREADY_CURATED (main unchanged)', testville && testville.status !== 'ALREADY_CURATED', testville && testville.status);
    check('after COMMIT: testville still discovered · noindex (main unchanged)', testville && testville.pageStatus === 'discovered · noindex', testville && testville.pageStatus);
    check('promoteCounts.branch_committed = 1', (data.promoteCounts || {}).branch_committed === 1, JSON.stringify(data.promoteCounts));
    check('local curated-places.json NOT mutated', readFileSync(CURATED, 'utf8') === curatedBefore);

    // ── Default sort = Last Activity, Descending ──
    const rows = data.rows || [];
    check('default sort: row[0] = testville (newest activity after commit)', rows[0] && rows[0].slug === 'testville', rows[0] && rows[0].slug);
    let desc = true; for (let i = 0; i + 1 < rows.length; i++) { if (String(rows[i].lastActivity || '') < String(rows[i + 1].lastActivity || '')) { desc = false; break; } }
    check('default sort: rows are Last Activity DESCENDING', desc);
    check('testville.lastActivity = its promoteCommittedAt', testville && testville.lastActivity && testville.lastActivity === testville.promoteCommittedAt, testville && testville.lastActivity);

    // ── HTML page: controls + columns + attrs + no secrets ──
    const pg = await get(PORT, PAGE + '?token=' + encodeURIComponent(TOKEN));
    check('page 200', pg.status === 200);
    check('page has Sort by select (f-sort) + 9 options', pg.body.indexOf('id="f-sort"') !== -1
        && ['activity', 'lastseen', 'firstseen', 'pick', 'search', 'status', 'review', 'country', 'slug'].every(v => pg.body.indexOf('value="' + v + '"') !== -1));
    check('page has Sort direction select (f-dir desc/asc)', pg.body.indexOf('id="f-dir"') !== -1 && pg.body.indexOf('value="desc"') !== -1 && pg.body.indexOf('value="asc"') !== -1);
    check('page has promote column header', pg.body.indexOf('>promote<') !== -1);
    check('page has branch_committed chip', pg.body.indexOf('branch_committed:') !== -1);
    check('page has per-row sort attrs', ['data-lastactivity', 'data-lastseen', 'data-firstseen', 'data-search', 'data-statusrank', 'data-slug', 'data-promote'].every(a => pg.body.indexOf(a) !== -1));
    check('page shows testville branch_committed badge', pg.body.indexOf('pr-branch_committed') !== -1);
    check('JSON has NO secrets', !leak(rc.body) && !leak(JSON.stringify(data)));
    check('page HTML has NO secrets', !leak(pg.body));

    // ── Public regression on the same server ──
    check('/ → 200', (await get(PORT, '/')).status === 200);
    check('/health → 200', (await get(PORT, '/health')).status === 200);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
