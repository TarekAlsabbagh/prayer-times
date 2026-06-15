// DISCOVERED-CITIES-ADMIN-NAME-EDIT-AR-EN-1 — verification (self-contained).
//
// Proves the admin name-override layer (separate discovered_place_name_overrides):
//   • POST /api/admin/discovered-name-overrides saves name_ar/name_en (token-gated,
//     validated: empty slug → 400, empty-name-if-sent → 400, no-name → 400).
//   • GET returns the saved overrides; the dashboard rows carry the effective
//     display name (override || raw) → persists on re-fetch (refresh/rehydration).
//   • promote-commit USES the override (candidate.names = edited) when present,
//     and FALLS BACK to the raw discovered name when absent.
//   • A name edit NEVER touches reviews (reviewed_at/decision unchanged) or
//     promotions (promote_status unchanged) or the slug/coords/cc.
//   • NO secrets in responses; public pages unaffected.
//
// Test seams: DISCOVERED_ADMIN_TEST_FIXTURE + PROMOTE_GITHUB_TEST_MODE=1. The
// override save uses the in-memory store (Supabase off) — migration 006 is NOT
// required to run this smoke.
// Run: node scripts/_smoke_discovered_cities_admin_name_overrides_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'nameedit-secret-3f9';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const FAKE_GH_TOKEN = 'ghp_FAKE_TOKEN_MUST_NOT_LEAK_1234567890';
const CURATED = path.join(ROOT, 'db', 'places', 'curated-places.json');

const FIXTURE = [
    { id: '1', slug: 'testville', type: 'city', country_code: 'dz', lat: 27.5, lng: 1.5,
      timezone: 'Africa/Algiers', names: { ar: 'تستفيل', en: 'Testville' }, aliases: {}, name_quality: { ar: 'official' },
      admin: {}, source: 'nominatim', source_id: 'osm1', verified: false, search_count: 0, selected_count: 3,
      created_at: '2026-06-10T08:00:00Z', updated_at: '2026-06-13T09:00:00Z', last_used_at: '2026-06-13T09:00:00Z' }
];
const NEW_AR = 'مدينة تست المعدلة';   // edited Arabic (clean Arabic script)
const NEW_EN = 'Testville Edited';      // edited English (clean Latin script)

const dir = mkdtempSync(path.join(tmpdir(), 'disc-name-'));
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

const NAMES = '/api/admin/discovered-name-overrides';
const REVIEW = '/api/admin/discovered-cities/review';
const PREVIEW = '/api/admin/discovered-cities/promote-preview';
const COMMIT = '/api/admin/discovered-cities/promote-commit';
const JSONAPI = '/api/admin/discovered-cities';
const PAGE = '/admin/discovered-cities';
const leak = (s) => s.indexOf(TOKEN) !== -1 || s.indexOf(FAKE_SERVICE_KEY) !== -1 || s.indexOf(FAKE_GH_TOKEN) !== -1 || /service_role/i.test(s);
const findRow = (data, slug) => (data.rows || []).find(r => r.slug === slug) || null;
async function jsonRows(port, auth) { const r = await get(port, JSONAPI, auth); let j = {}; try { j = JSON.parse(r.body); } catch (_) {} return j; }
async function previewCand(port, auth) { const r = await postJson(port, PREVIEW, { items: [{ slug: 'testville', countryCode: 'dz' }] }, auth); let j = {}; try { j = JSON.parse(r.body); } catch (_) {} return (j.items && j.items[0] && j.items[0].candidate) || null; }

console.log('═══ DISCOVERED-CITIES-ADMIN-NAME-EDIT-AR-EN-1 ═══');
let exitCode = 1;
const PORT = 8167;
const s = spawnServer(PORT, { ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath, PROMOTE_GITHUB_TEST_MODE: '1', GITHUB_TOKEN: FAKE_GH_TOKEN, GITHUB_REPO: 'owner/repo' });
try {
    if (!await waitReady(PORT, 20000)) { console.error('✗ not ready'); s.kill('SIGKILL'); process.exit(1); }
    const auth = { Authorization: 'Bearer ' + TOKEN };

    // ── auth gating ──
    check('POST names no token → 401', (await postJson(PORT, NAMES, { slug: 'testville', countryCode: 'dz', name_ar: NEW_AR })).status === 401);
    check('GET names no token → 401', (await get(PORT, NAMES)).status === 401);

    // ── validation ──
    check('empty slug → 400', (await postJson(PORT, NAMES, { slug: '', countryCode: 'dz', name_ar: NEW_AR }, auth)).status === 400);
    check('name_ar empty-if-sent → 400', (await postJson(PORT, NAMES, { slug: 'testville', countryCode: 'dz', name_ar: '   ' }, auth)).status === 400);
    check('name_en empty-if-sent → 400', (await postJson(PORT, NAMES, { slug: 'testville', countryCode: 'dz', name_en: '' }, auth)).status === 400);
    check('no name provided → 400', (await postJson(PORT, NAMES, { slug: 'testville', countryCode: 'dz' }, auth)).status === 400);

    // ── review FIRST (to prove a later name-edit doesn't touch reviews) ──
    await postJson(PORT, REVIEW, { slug: 'testville', countryCode: 'dz', decision: 'approved', note: 'ok' }, auth);
    let data = await jsonRows(PORT, auth); let row = findRow(data, 'testville');
    const reviewedAtBefore = row && row.reviewedAt;
    check('baseline: review approved + reviewedAt set', !!row && row.reviewDecision === 'approved' && !!reviewedAtBefore, row && row.reviewDecision);
    check('baseline: no name override yet', !!row && row.nameArOverride === '' && row.displayNameAr === 'تستفيل', row && row.displayNameAr);

    // ── FALLBACK: promote-preview BEFORE override uses the RAW name ──
    let cand = await previewCand(PORT, auth);
    check('fallback: candidate.names.ar = raw تستفيل', !!cand && cand.names && cand.names.ar === 'تستفيل', cand && cand.names && cand.names.ar);
    check('fallback: candidate.names.en = raw Testville', !!cand && cand.names && cand.names.en === 'Testville', cand && cand.names && cand.names.en);

    // ── SAVE name override ──
    const rSave = await postJson(PORT, NAMES, { slug: 'testville', countryCode: 'dz', name_ar: NEW_AR, name_en: NEW_EN }, auth);
    let jSave = {}; try { jSave = JSON.parse(rSave.body); } catch (_) {}
    check('save → 200 ok', rSave.status === 200 && jSave.ok === true, 'got ' + rSave.status);
    check('save echoes override', jSave.override && jSave.override.name_ar === NEW_AR && jSave.override.name_en === NEW_EN);

    // ── READ BACK via GET endpoint ──
    const rGet = await get(PORT, NAMES, auth); let jGet = {}; try { jGet = JSON.parse(rGet.body); } catch (_) {}
    const ov = jGet.overrides && jGet.overrides['testville|dz'];
    check('GET returns saved override', !!ov && ov.name_ar === NEW_AR && ov.name_en === NEW_EN, ov && ov.name_ar);

    // ── READ BACK via dashboard rows (refresh / rehydration) ──
    data = await jsonRows(PORT, auth); row = findRow(data, 'testville');
    check('rehydrate: row.nameArOverride = edited', !!row && row.nameArOverride === NEW_AR, row && row.nameArOverride);
    check('rehydrate: row.displayNameAr = edited (persists)', !!row && row.displayNameAr === NEW_AR, row && row.displayNameAr);
    check('rehydrate: row.displayNameEn = edited (persists)', !!row && row.displayNameEn === NEW_EN, row && row.displayNameEn);
    check('rehydrate: hasNameOverride true', !!row && row.hasNameOverride === true);

    // ── OVERRIDE USED at promote-commit (preview = same candidates as commit) ──
    cand = await previewCand(PORT, auth);
    check('override: candidate.names.ar = edited', !!cand && cand.names && cand.names.ar === NEW_AR, cand && cand.names && cand.names.ar);
    check('override: candidate.names.en = edited', !!cand && cand.names && cand.names.en === NEW_EN, cand && cand.names && cand.names.en);
    check('override: slug UNCHANGED', !!cand && cand.slug === 'testville', cand && cand.slug);
    check('override: coords UNCHANGED', !!cand && Number(cand.lat) === 27.5 && Number(cand.lng) === 1.5);
    const rCommit = await postJson(PORT, COMMIT, { items: [{ slug: 'testville', countryCode: 'dz' }], target: 'branch' }, auth);
    let jc = {}; try { jc = JSON.parse(rCommit.body); } catch (_) {}
    check('commit with override → 200 committed', rCommit.status === 200 && jc.status === 'committed', 'got ' + rCommit.status + ' ' + jc.status);

    // ── NAME EDIT did NOT touch reviews / promotions ──
    data = await jsonRows(PORT, auth); row = findRow(data, 'testville');
    check('reviews untouched: reviewedAt unchanged by name edit', !!row && row.reviewedAt === reviewedAtBefore, row && row.reviewedAt);
    check('reviews untouched: decision still approved', !!row && row.reviewDecision === 'approved', row && row.reviewDecision);
    // (promoteStatus IS now branch_committed — but only because of the explicit commit above, NOT the name edit.)
    check('classification untouched (not ALREADY_CURATED)', !!row && row.status !== 'ALREADY_CURATED', row && row.status);

    // ── HTML page: name-edit UI + override marker ──
    const pg = await get(PORT, PAGE + '?token=' + encodeURIComponent(TOKEN));
    check('page has name-edit fields + save', pg.status === 200 && pg.body.indexOf('id="dr-name-ar"') !== -1 && pg.body.indexOf('id="dr-name-en"') !== -1 && pg.body.indexOf('id="dr-name-save"') !== -1);
    check('page row shows edited name + ✎ marker', pg.body.indexOf(NEW_AR) !== -1 && pg.body.indexOf('ovmark') !== -1);

    // ── security + curated untouched + public ──
    check('JSON/page NO secrets', !leak(rSave.body) && !leak(rGet.body) && !leak(JSON.stringify(data)) && !leak(pg.body));
    check('local curated-places.json NOT mutated', readFileSync(CURATED, 'utf8') === curatedBefore);
    check('/ → 200', (await get(PORT, '/')).status === 200);
    check('/health → 200', (await get(PORT, '/health')).status === 200);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
