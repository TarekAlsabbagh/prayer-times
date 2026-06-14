// DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 — Phase 2 verification (self-contained).
//
// Proves the protected promote-PREVIEW endpoint — PREVIEW ONLY, nothing written:
//   • token-gated: no ADMIN_TOKEN → 403 ; missing/wrong → 401 ; correct → 200
//   • input guards: GET → 405 ; non-JSON → 415 ; bad items → 400
//   • only review_decision=approved cities pass validation; pending/skipped/etc rejected
//   • valid approved city → candidate entry built (native names, source→curated),
//     robots before→after (discovered/noindex → curated/index), commit msg, diff, counts
//   • curated-places.json NOT mutated; NO secrets leak
//
// Self-contained: spawns its own server (Supabase OFF → in-memory reviews + admin
// fixture seam). Run: node scripts/_smoke_discovered_cities_admin_promote_preview_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'preview-secret-9b2e';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const CURATED = path.join(ROOT, 'db', 'places', 'curated-places.json');

const FIXTURE = [
    { id: '1', slug: 'khams-djouamaa', type: 'city', country_code: 'dz', lat: 36.1474693, lng: 3.1331309,
      timezone: 'Africa/Algiers', names: { ar: 'خمس جوامع', en: 'Khams Djouamaa' }, aliases: {}, name_quality: { ar: 'official' },
      admin: {}, source: 'nominatim', source_id: 'osm1', verified: false, search_count: 0, selected_count: 3,
      created_at: '2026-06-10T08:00:00Z', updated_at: '2026-06-13T09:00:00Z', last_used_at: '2026-06-13T09:00:00Z' },
    { id: '2', slug: 'preview-skip-city', type: 'city', country_code: 'dz', lat: 27.0, lng: 2.0,
      timezone: 'Africa/Algiers', names: { ar: 'مدينة تخطّي', en: 'Preview Skip City' }, aliases: {}, name_quality: { ar: 'official' },
      admin: {}, source: 'nominatim', source_id: 'osm2', verified: false, search_count: 0, selected_count: 2,
      created_at: '2026-06-11T08:00:00Z', updated_at: '2026-06-12T09:00:00Z', last_used_at: '2026-06-12T09:00:00Z' }
];

const dir = mkdtempSync(path.join(tmpdir(), 'disc-prev-'));
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
const PREVIEW = '/api/admin/discovered-cities/promote-preview';

console.log('═══ DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 Phase 2 (promote preview) ═══');
let exitCode = 1;

// Phase A: no ADMIN_TOKEN → 403
const PORT_A = 8121;
const srvA = spawnServer(PORT_A, {});
try {
    if (!await waitReady(PORT_A, 20000)) { console.error('✗ server A not ready'); srvA.kill('SIGKILL'); process.exit(1); }
    const r = await postJson(PORT_A, PREVIEW, { items: [{ slug: 'khams-djouamaa', countryCode: 'dz' }] });
    check('no ADMIN_TOKEN → preview 403', r.status === 403, 'got ' + r.status);
} finally { srvA.kill('SIGKILL'); }
await sleep(800);

// Phase B: ADMIN_TOKEN + fixture
const PORT_B = 8122;
const srvB = spawnServer(PORT_B, { ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath });
try {
    if (!await waitReady(PORT_B, 20000)) { console.error('✗ server B not ready'); srvB.kill('SIGKILL'); process.exit(1); }
    const auth = { Authorization: 'Bearer ' + TOKEN };

    // seed review decisions
    await postJson(PORT_B, '/api/admin/discovered-cities/review', { slug: 'khams-djouamaa', countryCode: 'dz', decision: 'approved', note: 'verified خمس جوامع' }, auth);
    await postJson(PORT_B, '/api/admin/discovered-cities/review', { slug: 'preview-skip-city', countryCode: 'dz', decision: 'skipped' }, auth);

    // auth + input guards
    check('preview no token → 401', (await postJson(PORT_B, PREVIEW, { items: [{ slug: 'khams-djouamaa', countryCode: 'dz' }] })).status === 401);
    check('preview wrong token → 401', (await postJson(PORT_B, PREVIEW, { items: [{ slug: 'khams-djouamaa', countryCode: 'dz' }] }, { Authorization: 'Bearer nope' })).status === 401);
    check('preview GET → 405', (await get(PORT_B, PREVIEW, auth)).status === 405);
    check('preview non-JSON → 415', (await reqRaw(PORT_B, 'POST', PREVIEW, Object.assign({ 'Content-Type': 'text/plain' }, auth), 'x')).status === 415);
    check('preview empty items → 400', (await postJson(PORT_B, PREVIEW, { items: [] }, auth)).status === 400);
    check('preview bad item shape → 400', (await postJson(PORT_B, PREVIEW, { items: [{ slug: 'X', countryCode: 'zz9' }] }, auth)).status === 400);

    // approved city → ready + valid candidate
    const rOk = await postJson(PORT_B, PREVIEW, { items: [{ slug: 'khams-djouamaa', countryCode: 'dz' }] }, auth);
    let j = {}; try { j = JSON.parse(rOk.body); } catch (_) {}
    check('approved preview → 200', rOk.status === 200, 'got ' + rOk.status);
    check('status=ready', j.status === 'ready', j.status);
    check('previewOnly flag true', j.previewOnly === true);
    const it = (j.items || [])[0];
    check('khams item valid', !!it && it.valid === true);
    check('candidate names.ar = خمس جوامع', !!it && it.candidate && it.candidate.names && it.candidate.names.ar === 'خمس جوامع', it && it.candidate && it.candidate.names && it.candidate.names.ar);
    check('candidate source = curated', !!it && it.candidate && it.candidate.source === 'curated');
    check('robots before→after discovered→curated index', !!it && /noindex/.test(it.robotsBefore) && /index,follow/.test(it.robotsAfter));
    check('source before→after nominatim→curated', !!it && it.sourceBefore === 'nominatim' && it.sourceAfter === 'curated');
    check('diffPreview has add op', Array.isArray(j.diffPreview) && j.diffPreview.length === 1 && j.diffPreview[0].op === 'add');
    check('filesToChange lists curated-places.json', (j.filesToChange || []).indexOf('db/places/curated-places.json') !== -1);
    check('commitMessageSuggested present', typeof j.commitMessageSuggested === 'string' && j.commitMessageSuggested.indexOf('khams-djouamaa') !== -1);
    check('countryCounts dz before→after (+1)', j.countryCountsBeforeAfter && j.countryCountsBeforeAfter.dz && (j.countryCountsBeforeAfter.dz.after === j.countryCountsBeforeAfter.dz.before + 1));
    check('resultingJsonValid', j.validations && j.validations.resultingJsonValid === true);

    // skipped city → blocked, review_approved fails
    const rSkip = await postJson(PORT_B, PREVIEW, { items: [{ slug: 'preview-skip-city', countryCode: 'dz' }] }, auth);
    let js = {}; try { js = JSON.parse(rSkip.body); } catch (_) {}
    const its = (js.items || [])[0];
    check('skipped city status=blocked', js.status === 'blocked', js.status);
    check('skipped city valid=false', !!its && its.valid === false);
    check('skipped fails review_approved check', !!its && (its.checks || []).some(c => c.name === 'review_approved' && !c.ok));

    // mixed batch → blocked
    const rMix = await postJson(PORT_B, PREVIEW, { items: [{ slug: 'khams-djouamaa', countryCode: 'dz' }, { slug: 'preview-skip-city', countryCode: 'dz' }] }, auth);
    let jm = {}; try { jm = JSON.parse(rMix.body); } catch (_) {}
    check('mixed batch status=blocked', jm.status === 'blocked');

    // page UI present
    const pg = await get(PORT_B, '/admin/discovered-cities?token=' + encodeURIComponent(TOKEN));
    check('page has Prepare button + checkboxes + panel', pg.status === 200 && /id="prep-btn"/.test(pg.body) && /class="selbox"/.test(pg.body) && /id="preview-panel"/.test(pg.body));

    // SECURITY + NOT-WRITTEN
    const leak = (s) => s.indexOf(TOKEN) !== -1 || s.indexOf(FAKE_SERVICE_KEY) !== -1 || /service_role/i.test(s) || /SUPABASE_SERVICE_ROLE_KEY/.test(s);
    check('preview JSON has NO secrets', !leak(rOk.body));
    check('page HTML has NO secrets', !leak(pg.body));
    check('curated-places.json NOT mutated', readFileSync(CURATED, 'utf8') === curatedBefore);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} finally { srvB.kill('SIGKILL'); }
process.exit(exitCode);
