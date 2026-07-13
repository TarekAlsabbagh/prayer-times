// DISCOVERED-CITIES-PROMOTE-PREVIEW-CLEAN-SLUG-RAW-KEY-FIX-1 — verification (self-contained).
//
// Proves _buildPromotePreview now matches discovered rows by BOTH the raw slug key
// (r.slug|cc) AND the clean slug key (cleanSlugFor(r.slug)|cc). The dashboard checkbox
// emits the CLEAN slug, so a suffixed raw row (e.g. "schenefeld-de") must resolve when the
// selection is "schenefeld". Before the fix that yielded "discovered row not found".
//
//   • clean slug "schenefeld" (cc de) → resolves the raw row "schenefeld-de", status READY,
//     candidate.slug = "schenefeld" (clean), cc de, tz Europe/Berlin, lat/lng carried, source→curated
//   • raw slug "schenefeld-de" (cc de) → also resolves, IDENTICAL candidate
//   • no-suffix row "kleinstadt" (clean == raw) → still resolves (regression, old behaviour intact)
//   • genuinely-absent slug → still "discovered row not found" (true-negative intact)
//   • PREVIEW ONLY: curated-places.json NOT mutated · NO secrets leak
//
// Self-contained: spawns its own server (Supabase OFF → in-memory reviews + admin fixture seam).
// The ADMIN_TOKEN here is a THROWAWAY local test token, NOT the production token; production is
// never contacted. Run: node scripts/_smoke_discovered_cities_admin_promote_preview_clean_slug_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'cleanslug-secret-7c4f';                       // throwaway local test token (NOT production)
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const CURATED = path.join(ROOT, 'db', 'places', 'curated-places.json');

// Fixture discovered rows (Supabase OFF locally). Row 1 carries the discovery "-de" suffix
// (raw "schenefeld-de", clean "schenefeld"); Row 2 has NO suffix (raw == clean) for regression.
const FIXTURE = [
    { id: 's1', slug: 'schenefeld-de', type: 'town', country_code: 'de', lat: 53.600266, lng: 9.836387,
      timezone: 'Europe/Berlin', names: { ar: 'شنفلد', en: 'Schenefeld' }, aliases: {}, name_quality: { ar: 'official', en: 'official' },
      admin: {}, source: 'discovered', source_id: 'osm-sch', verified: false, search_count: 4, selected_count: 5,
      created_at: '2026-07-01T08:00:00Z', updated_at: '2026-07-10T09:00:00Z', last_used_at: '2026-07-10T09:00:00Z' },
    { id: 'k1', slug: 'kleinstadt', type: 'town', country_code: 'de', lat: 51.900000, lng: 10.400000,
      timezone: 'Europe/Berlin', names: { ar: 'كلاينشتات', en: 'Kleinstadt' }, aliases: {}, name_quality: { ar: 'official', en: 'official' },
      admin: {}, source: 'discovered', source_id: 'osm-kl', verified: false, search_count: 1, selected_count: 2,
      created_at: '2026-07-02T08:00:00Z', updated_at: '2026-07-09T09:00:00Z', last_used_at: '2026-07-09T09:00:00Z' }
];

const dir = mkdtempSync(path.join(tmpdir(), 'disc-cleanslug-'));
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
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined ? '   →  ' + extra : ''}`); }
const PREVIEW = '/api/admin/discovered-cities/promote-preview';

console.log('═══ DISCOVERED-CITIES-PROMOTE-PREVIEW-CLEAN-SLUG-RAW-KEY-FIX-1 ═══');
let exitCode = 1;

// token-gate intact (no ADMIN_TOKEN → 403)
const PORT_A = 8131;
const srvA = spawnServer(PORT_A, {});
try {
    if (!await waitReady(PORT_A, 20000)) { console.error('✗ server A not ready'); srvA.kill('SIGKILL'); process.exit(1); }
    check('no ADMIN_TOKEN → preview 403 (token-gate intact)', (await postJson(PORT_A, PREVIEW, { items: [{ slug: 'schenefeld', countryCode: 'de' }] })).status === 403);
} finally { srvA.kill('SIGKILL'); }
await sleep(800);

const PORT_B = 8132;
const srvB = spawnServer(PORT_B, { ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath });
try {
    if (!await waitReady(PORT_B, 20000)) { console.error('✗ server B not ready'); srvB.kill('SIGKILL'); process.exit(1); }
    const auth = { Authorization: 'Bearer ' + TOKEN };

    // seed review = approved (dashboard submits the CLEAN slug; seed raw too so both selection paths → ready)
    await postJson(PORT_B, '/api/admin/discovered-cities/review', { slug: 'schenefeld', countryCode: 'de', decision: 'approved', note: 'شنفلد ok' }, auth);
    await postJson(PORT_B, '/api/admin/discovered-cities/review', { slug: 'schenefeld-de', countryCode: 'de', decision: 'approved', note: 'raw key' }, auth);
    await postJson(PORT_B, '/api/admin/discovered-cities/review', { slug: 'kleinstadt', countryCode: 'de', decision: 'approved' }, auth);

    // ── 1. CLEAN slug resolves the suffixed raw row (THE FIX) ──
    const rClean = await postJson(PORT_B, PREVIEW, { items: [{ slug: 'schenefeld', countryCode: 'de' }] }, auth);
    let jc = {}; try { jc = JSON.parse(rClean.body); } catch (_) {}
    const itC = (jc.items || [])[0];
    check('clean preview → 200', rClean.status === 200, rClean.status);
    check('clean "schenefeld" NOT "discovered row not found"', !!itC && !(itC.errors || []).includes('discovered row not found'), itC && (itC.errors || []).join(','));
    check('clean discovered_row_exists check passes', !!itC && !(itC.checks || []).some(c => c.name === 'discovered_row_exists' && !c.ok));
    check('clean status = ready', jc.status === 'ready', jc.status);
    check('clean item valid', !!itC && itC.valid === true);
    check('clean candidate.slug = schenefeld (clean final slug)', !!itC && itC.candidate && itC.candidate.slug === 'schenefeld', itC && itC.candidate && itC.candidate.slug);
    check('clean candidate.countryCode = de', !!itC && itC.candidate && itC.candidate.countryCode === 'de');
    check('clean candidate.timezone = Europe/Berlin', !!itC && itC.candidate && itC.candidate.timezone === 'Europe/Berlin', itC && itC.candidate && itC.candidate.timezone);
    check('clean candidate.lat/lng carried from raw row', !!itC && itC.candidate && Number(itC.candidate.lat) === 53.600266 && Number(itC.candidate.lng) === 9.836387, itC && itC.candidate && (itC.candidate.lat + ',' + itC.candidate.lng));
    check('clean candidate.names.en = Schenefeld / names.ar = شنفلد', !!itC && itC.candidate && itC.candidate.names && itC.candidate.names.en === 'Schenefeld' && itC.candidate.names.ar === 'شنفلد');
    check('clean source before=discovered after=curated', !!itC && itC.sourceBefore === 'discovered' && itC.sourceAfter === 'curated' && itC.candidate.source === 'curated');
    check('clean robots discovered/noindex → curated/index', !!itC && /noindex/.test(itC.robotsBefore) && /index,follow/.test(itC.robotsAfter));

    // ── 2. RAW slug also resolves → IDENTICAL candidate ──
    const rRaw = await postJson(PORT_B, PREVIEW, { items: [{ slug: 'schenefeld-de', countryCode: 'de' }] }, auth);
    let jr = {}; try { jr = JSON.parse(rRaw.body); } catch (_) {}
    const itR = (jr.items || [])[0];
    check('raw "schenefeld-de" → 200 + status ready', rRaw.status === 200 && jr.status === 'ready', jr.status);
    check('raw item valid + resolves same row', !!itR && itR.valid === true && !(itR.errors || []).includes('discovered row not found'));
    check('raw candidate IDENTICAL to clean candidate', !!itR && !!itC && JSON.stringify(itR.candidate) === JSON.stringify(itC.candidate));

    // ── 3. Regression: no-suffix row (clean == raw) still resolves ──
    const rReg = await postJson(PORT_B, PREVIEW, { items: [{ slug: 'kleinstadt', countryCode: 'de' }] }, auth);
    let jg = {}; try { jg = JSON.parse(rReg.body); } catch (_) {}
    const itG = (jg.items || [])[0];
    check('no-suffix "kleinstadt" still resolves (status ready)', rReg.status === 200 && jg.status === 'ready', jg.status);
    check('no-suffix candidate.slug = kleinstadt (unchanged)', !!itG && itG.candidate && itG.candidate.slug === 'kleinstadt', itG && itG.candidate && itG.candidate.slug);

    // ── 4. True-negative intact: genuinely-absent slug still "discovered row not found" ──
    const rMiss = await postJson(PORT_B, PREVIEW, { items: [{ slug: 'ghosttown', countryCode: 'de' }] }, auth);
    let jmi = {}; try { jmi = JSON.parse(rMiss.body); } catch (_) {}
    const itM = (jmi.items || [])[0];
    check('absent slug still "discovered row not found"', !!itM && (itM.errors || []).includes('discovered row not found') && itM.valid === false);
    check('absent slug status = blocked', jmi.status === 'blocked', jmi.status);

    // ── 5. PREVIEW ONLY + security ──
    const leak = (s) => s.indexOf(TOKEN) !== -1 || s.indexOf(FAKE_SERVICE_KEY) !== -1 || /service_role/i.test(s) || /SUPABASE_SERVICE_ROLE_KEY/.test(s);
    check('clean/raw preview JSON has NO secrets', !leak(rClean.body) && !leak(rRaw.body));
    check('previewOnly flag true', jc.previewOnly === true && jr.previewOnly === true);
    check('curated-places.json NOT mutated (preview only)', readFileSync(CURATED, 'utf8') === curatedBefore);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} finally { srvB.kill('SIGKILL'); }
process.exit(exitCode);
