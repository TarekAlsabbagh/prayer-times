// DISCOVERED-CITIES-ADMIN-FILTER-LAST-ACTIVITY-SORT-1 — verification (self-contained).
//
// Proves the dashboard sorts (and filtered subsets stay) by last_activity_at DESC,
// where last_activity_at = GREATEST (most-recent) of:
//   name_override.updated_at · promote committed_at · review reviewed_at · created_at (fallback)
//   (MAX, not coalesce; nulls ignored; created_at is the floor → no nulls float up).
//
//   • baseline (no admin action) → ordered by created_at desc; last_activity_at = created_at.
//   • a recent NAME OVERRIDE lifts an old-created city above a newer-created one.
//   • a recent REVIEW lifts it higher; a recent PROMOTE lifts it highest.
//   • per status filter (approved / pending / all) the subset is last_activity_at DESC.
//   • a recent-created but in-active city does NOT float above active cities.
//   • no impact on promote-commit / name-save / reviews / promotions ; curated unmutated.
//
// Run: node scripts/_smoke_discovered_cities_admin_filter_last_activity_sort_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'lastact-secret-5d2';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const FAKE_GH_TOKEN = 'ghp_FAKE_TOKEN_MUST_NOT_LEAK_1234567890';
const CURATED = path.join(ROOT, 'db', 'places', 'curated-places.json');

// 4 cities, distinct created_at (oldest → newest). dcity is recent-created but stays inactive.
const mk = (slug, ar, en, lat, lng, created) => ({
    id: slug, slug, type: 'city', country_code: 'dz', lat, lng, timezone: 'Africa/Algiers',
    names: { ar, en }, aliases: {}, name_quality: { ar: 'official' }, admin: {},
    source: 'nominatim', source_id: 'osm-' + slug, verified: false, search_count: 0, selected_count: 2,
    created_at: created, updated_at: created, last_used_at: created
});
const FIXTURE = [
    mk('acity', 'مدينة ألف', 'Acity', 28.0, 0.5, '2020-01-01T00:00:00Z'),
    mk('bcity', 'مدينة باء', 'Bcity', 28.5, 1.0, '2021-01-01T00:00:00Z'),
    mk('ccity', 'مدينة جيم', 'Ccity', 29.0, 1.5, '2022-01-01T00:00:00Z'),
    mk('dcity', 'مدينة دال', 'Dcity', 29.5, 2.0, '2026-06-14T00:00:00Z')   // recent created, no admin action
];

const dir = mkdtempSync(path.join(tmpdir(), 'disc-lastact-'));
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
const NAMES = '/api/admin/discovered-name-overrides';
const REVIEW = '/api/admin/discovered-cities/review';
const COMMIT = '/api/admin/discovered-cities/promote-commit';
const PAGE = '/admin/discovered-cities';
const leak = (s) => s.indexOf(TOKEN) !== -1 || s.indexOf(FAKE_SERVICE_KEY) !== -1 || s.indexOf(FAKE_GH_TOKEN) !== -1 || /service_role/i.test(s);
async function rows(port, auth) { const r = await get(port, JSONAPI, auth); let j = {}; try { j = JSON.parse(r.body); } catch (_) {} return j.rows || []; }
const order = (rs) => rs.map(r => r.slug);
const isDesc = (rs) => { for (let i = 0; i + 1 < rs.length; i++) { if (String(rs[i].last_activity_at || '') < String(rs[i + 1].last_activity_at || '')) return false; } return true; };

console.log('═══ DISCOVERED-CITIES-ADMIN-FILTER-LAST-ACTIVITY-SORT-1 ═══');
let exitCode = 1;
const PORT = 8170;
const s = spawnServer(PORT, { ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath, PROMOTE_GITHUB_TEST_MODE: '1', GITHUB_TOKEN: FAKE_GH_TOKEN, GITHUB_REPO: 'owner/repo' });
try {
    if (!await waitReady(PORT, 20000)) { console.error('✗ not ready'); s.kill('SIGKILL'); process.exit(1); }
    const auth = { Authorization: 'Bearer ' + TOKEN };

    // ── 1) baseline (no admin action) → created_at desc ; last_activity_at = created_at (fallback) ──
    let rs = await rows(PORT, auth);
    check('baseline: order = created desc [dcity,ccity,bcity,acity]', JSON.stringify(order(rs)) === JSON.stringify(['dcity', 'ccity', 'bcity', 'acity']), order(rs).join(','));
    check('baseline: globally last_activity_at DESC', isDesc(rs));
    const a0 = rs.find(r => r.slug === 'acity');
    check('baseline: fallback → last_activity_at = created_at', !!a0 && a0.last_activity_at === '2020-01-01T00:00:00Z', a0 && a0.last_activity_at);

    // ── 2) recent NAME OVERRIDE on the OLDEST city lifts it above the newest-created ──
    await postJson(PORT, NAMES, { slug: 'acity', countryCode: 'dz', name_ar: 'ألف المعدلة', name_en: 'Acity Edited' }, auth);
    rs = await rows(PORT, auth);
    let a = rs.find(r => r.slug === 'acity'), d = rs.find(r => r.slug === 'dcity');
    check('name-override lifts acity to TOP (above dcity 2026-06-14)', order(rs)[0] === 'acity', order(rs)[0]);
    check('name-override: acity.last_activity_at > dcity.last_activity_at', !!a && !!d && a.last_activity_at > d.last_activity_at);
    await sleep(20);

    // ── 3) recent REVIEW on bcity lifts it above acity ──
    await postJson(PORT, REVIEW, { slug: 'bcity', countryCode: 'dz', decision: 'approved' }, auth);
    rs = await rows(PORT, auth);
    check('review lifts bcity above acity', order(rs).indexOf('bcity') < order(rs).indexOf('acity'), order(rs).join(','));
    await sleep(20);

    // ── 4) recent PROMOTE on ccity lifts it to the TOP ──
    await postJson(PORT, REVIEW, { slug: 'ccity', countryCode: 'dz', decision: 'approved' }, auth);
    await sleep(20);
    const rc = await postJson(PORT, COMMIT, { items: [{ slug: 'ccity', countryCode: 'dz' }], target: 'branch' }, auth);
    let jc = {}; try { jc = JSON.parse(rc.body); } catch (_) {}
    check('promote ccity → 200 committed (no impact on promote logic)', rc.status === 200 && jc.status === 'committed', 'got ' + rc.status);
    rs = await rows(PORT, auth);
    check('promote lifts ccity to TOP', order(rs)[0] === 'ccity', order(rs)[0]);

    // ── 5) final global order = [ccity, bcity, acity, dcity] ──
    check('final order [ccity,bcity,acity,dcity]', JSON.stringify(order(rs)) === JSON.stringify(['ccity', 'bcity', 'acity', 'dcity']), order(rs).join(','));
    check('final: globally last_activity_at DESC', isDesc(rs));

    // ── 6) null/fallback: inactive dcity (recent created) does NOT float above active cities ──
    d = rs.find(r => r.slug === 'dcity');
    check('inactive dcity is LAST (no float above active)', order(rs)[order(rs).length - 1] === 'dcity');
    check('dcity last_activity_at = its created_at (fallback, not null)', !!d && d.last_activity_at === '2026-06-14T00:00:00Z', d && d.last_activity_at);

    // ── 7) per-filter subsets are last_activity_at DESC ──
    const approved = rs.filter(r => r.reviewDecision === 'approved');
    check('filter approved → desc [ccity,bcity]', JSON.stringify(order(approved)) === JSON.stringify(['ccity', 'bcity']) && isDesc(approved), order(approved).join(','));
    const pending = rs.filter(r => r.reviewDecision === 'pending');
    check('filter pending → desc [acity,dcity]', JSON.stringify(order(pending)) === JSON.stringify(['acity', 'dcity']) && isDesc(pending), order(pending).join(','));

    // ── 8) no impact on other layers ──
    check('reviews intact: ccity approved', !!rs.find(r => r.slug === 'ccity' && r.reviewDecision === 'approved'));
    check('promotions intact: ccity branch_committed', !!rs.find(r => r.slug === 'ccity' && r.promoteStatus === 'branch_committed'));
    check('name-edit intact: acity override applied', !!rs.find(r => r.slug === 'acity' && r.nameArOverride === 'ألف المعدلة'));
    check('classification untouched (acity not ALREADY_CURATED)', !!rs.find(r => r.slug === 'acity' && r.status !== 'ALREADY_CURATED'));

    // ── 9) page + data-lastactivity attr + security + curated + public ──
    const pg = await get(PORT, PAGE + '?token=' + encodeURIComponent(TOKEN));
    check('page renders + has data-lastactivity attr', pg.status === 200 && pg.body.indexOf('data-lastactivity') !== -1);
    check('NO secrets (JSON + page)', !leak(JSON.stringify(rs)) && !leak(pg.body));
    check('local curated-places.json NOT mutated', readFileSync(CURATED, 'utf8') === curatedBefore);
    check('/ → 200', (await get(PORT, '/')).status === 200);
    check('admin GET no token → 401', (await get(PORT, JSONAPI)).status === 401);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
