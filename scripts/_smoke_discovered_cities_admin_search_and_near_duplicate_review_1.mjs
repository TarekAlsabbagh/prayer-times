// DISCOVERED-CITIES-ADMIN-SEARCH-AND-NEAR-DUPLICATE-REVIEW-1 — verification (self-contained).
//
// PART 1 (classifier unit test): NEAR_DUPLICATE now requires a NAME signal, not
//   proximity alone. A place near a curated city but with a clearly different name
//   (an-Nabiyah near al-Qatif) → READY_FOR_REVIEW, not NEAR_DUPLICATE. Strong cases
//   (same slug / alias / exact / fuzzy+near) stay duplicates. Diagnostics: matched
//   curated slug/name, distance_km, name_similarity, signal.
// PART 2 (admin search): the dashboard search covers ar/en/slug/cc/status/alias,
//   has a clear button, surfaces dedup diagnostics, and preserves last_activity_at DESC.
//
// Run: node scripts/_smoke_discovered_cities_admin_search_and_near_duplicate_review_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { classifyRow, buildCuratedIndex } from './review-discovered-cities.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'searchdup-secret-8a3';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const CURATED = path.join(ROOT, 'db', 'places', 'curated-places.json');
const curatedBefore = readFileSync(CURATED, 'utf8');
let pass = 0, fail = 0;
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); }

console.log('═══ DISCOVERED-CITIES-ADMIN-SEARCH-AND-NEAR-DUPLICATE-REVIEW-1 ═══');

// ════════════════ PART 1 — classifier unit test (deterministic) ════════════════
const CUR = [
    { slug: 'qatif', countryCode: 'sa', lat: 26.565, lng: 49.996, names: { ar: 'القطيف', en: 'Qatif' }, aliases: { en: ['Al Qatif'] } },
    { slug: 'jazan', countryCode: 'sa', lat: 16.889, lng: 42.551, names: { ar: 'جازان', en: 'Jazan' }, aliases: {} }
];
const idx = buildCuratedIndex(CUR);
const cr = (row) => classifyRow(row, idx, {});

// 1) an-Nabiyah — near al-Qatif but a clearly DIFFERENT name → READY_FOR_REVIEW (the reported bug).
let c = cr({ slug: 'an-nabiyah', country_code: 'sa', lat: 26.60, lng: 50.00, names: { ar: 'النابية', en: 'An Nabiyah' }, selected_count: 2 });
check('nabiyah: NOT NEAR_DUPLICATE', c.class !== 'NEAR_DUPLICATE', c.class);
check('nabiyah: READY_FOR_REVIEW', c.class === 'READY_FOR_REVIEW', c.class);
check('nabiyah: signal=coordinate_near_only', c.dedup.signal === 'coordinate_near_only', c.dedup.signal);
check('nabiyah: nearHit=qatif', c.dedup.nearHit === 'qatif', c.dedup.nearHit);
check('nabiyah: matched_curated_slug=qatif', c.dedup.matched_curated_slug === 'qatif', c.dedup.matched_curated_slug);
check('nabiyah: matched name diagnostics (ar/en)', c.dedup.matched_curated_name_ar === 'القطيف' && c.dedup.matched_curated_name_en === 'Qatif');
check('nabiyah: distance_km is a number', typeof c.dedup.distance_km === 'number', c.dedup.distance_km);
check('nabiyah: name_similarity LOW (<0.72)', c.dedup.name_similarity != null && c.dedup.name_similarity < 0.72, c.dedup.name_similarity);

// 2) fuzzy spelling + proximity → stays NEAR_DUPLICATE (mixed_signal).
c = cr({ slug: 'qateef-x', country_code: 'sa', lat: 26.58, lng: 50.00, names: { ar: 'القطيفة', en: 'Qateef' }, selected_count: 2 });
check('qateef: NEAR_DUPLICATE (fuzzy name + near)', c.class === 'NEAR_DUPLICATE', c.class);
check('qateef: signal=mixed_signal', c.dedup.signal === 'mixed_signal', c.dedup.signal);
check('qateef: name_similarity HIGH (>=0.72)', c.dedup.name_similarity >= 0.72, c.dedup.name_similarity);

// 3) exact name match (anywhere) → ALREADY_CURATED, strong_name_match.
c = cr({ slug: 'qatif-dup', country_code: 'sa', lat: 25.0, lng: 45.0, names: { ar: 'القطيف', en: 'Qatif' }, selected_count: 2 });
check('exact name: ALREADY_CURATED', c.class === 'ALREADY_CURATED', c.class);
check('exact name: signal=strong_name_match', c.dedup.signal === 'strong_name_match', c.dedup.signal);

// 4) alias-only match → ALREADY_CURATED, alias_match.
c = cr({ slug: 'alqatif-x', country_code: 'sa', lat: 25.0, lng: 45.0, names: { ar: 'منطقة مختلفة جدا', en: 'Al Qatif' }, selected_count: 2 });
check('alias match: ALREADY_CURATED', c.class === 'ALREADY_CURATED', c.class);
check('alias match: signal=alias_match', c.dedup.signal === 'alias_match', c.dedup.signal);

// 5) same slug (same cc), different name → ALREADY_CURATED, same_slug.
c = cr({ slug: 'qatif', country_code: 'sa', lat: 25.0, lng: 45.0, names: { ar: 'مدينة مختلفة', en: 'Different Place' }, selected_count: 2 });
check('same slug: ALREADY_CURATED', c.class === 'ALREADY_CURATED', c.class);
check('same slug: signal=same_slug', c.dedup.signal === 'same_slug', c.dedup.signal);

// 6) far + distinct → READY_FOR_REVIEW, no dedup signal.
c = cr({ slug: 'remote-town', country_code: 'sa', lat: 20.0, lng: 45.0, names: { ar: 'بلدة نائية', en: 'Remote Town' }, selected_count: 2 });
check('far distinct: READY_FOR_REVIEW', c.class === 'READY_FOR_REVIEW', c.class);
check('far distinct: signal=null + distance_km=null', c.dedup.signal === null && c.dedup.distance_km === null);

// ════════════════ PART 2 — admin search bar (server) ════════════════
const FIXTURE = [
    { id: '1', slug: 'searchtest-one', type: 'city', country_code: 'sa', lat: 18.0, lng: 48.0, timezone: 'Asia/Riyadh',
      names: { ar: 'بلدة البحث', en: 'Searchtest One' }, aliases: { en: ['Alpha Town'] }, name_quality: { ar: 'official' }, admin: {},
      source: 'nominatim', source_id: 'osm1', verified: false, search_count: 0, selected_count: 2,
      created_at: '2026-06-10T08:00:00Z', updated_at: '2026-06-12T09:00:00Z', last_used_at: '2026-06-12T09:00:00Z' },
    { id: '2', slug: 'searchtest-two', type: 'city', country_code: 'eg', lat: 24.0, lng: 30.0, timezone: 'Africa/Cairo',
      names: { ar: 'مدينة ثانية', en: 'Searchtest Two' }, aliases: {}, name_quality: { ar: 'official' }, admin: {},
      source: 'nominatim', source_id: 'osm2', verified: false, search_count: 0, selected_count: 1,
      created_at: '2026-06-09T08:00:00Z', updated_at: '2026-06-11T09:00:00Z', last_used_at: '2026-06-11T09:00:00Z' }
];
const dir = mkdtempSync(path.join(tmpdir(), 'disc-search-'));
const fixturePath = path.join(dir, 'fixture.json');
writeFileSync(fixturePath, JSON.stringify(FIXTURE), 'utf8');

function reqRaw(port, method, p, headers, body) {
    return new Promise((resolve) => {
        const data = body == null ? null : JSON.stringify(body);
        const r = http.request({ host: 'localhost', port, path: p, method, headers: headers || {} }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
        });
        r.on('error', () => resolve({ status: 0, body: '' }));
        if (data != null) r.write(data);
        r.end();
    });
}
const get = (port, p, headers) => reqRaw(port, 'GET', p, headers, null);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(port, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await get(port, '/health'); if (r.status === 200) return true; await sleep(400); } return false; }
const leak = (s) => s.indexOf(TOKEN) !== -1 || s.indexOf(FAKE_SERVICE_KEY) !== -1 || /service_role/i.test(s);

let exitCode = 1;
const PORT = 8172;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_KEY, ADMIN_TOKEN: TOKEN, DISCOVERED_ADMIN_TEST_FIXTURE: fixturePath }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(PORT, 20000)) { console.error('✗ not ready'); s.kill('SIGKILL'); process.exit(1); }
    const auth = { Authorization: 'Bearer ' + TOKEN };

    // dashboard JSON: diagnostics fields present on every row's detail.dedup ; order preserved.
    const rj = await get(PORT, '/api/admin/discovered-cities', auth);
    let j = {}; try { j = JSON.parse(rj.body); } catch (_) {}
    const rows = j.rows || [];
    const one = rows.find(r => r.slug === 'searchtest-one');
    check('JSON: row carries dedup diagnostics keys', !!one && one.detail && one.detail.dedup && ('signal' in one.detail.dedup) && ('distance_km' in one.detail.dedup) && ('name_similarity' in one.detail.dedup) && ('matched_curated_slug' in one.detail.dedup));
    let desc = true; for (let i = 0; i + 1 < rows.length; i++) { if (String(rows[i].last_activity_at || '') < String(rows[i + 1].last_activity_at || '')) { desc = false; break; } }
    check('JSON: rows still last_activity_at DESC (order preserved)', desc);

    // page: search input + clear button + broadened placeholder.
    const pg = await get(PORT, '/admin/discovered-cities?token=' + encodeURIComponent(TOKEN));
    check('page has search input #f-q', pg.status === 200 && pg.body.indexOf('id="f-q"') !== -1);
    check('page has clear button #f-q-clear', pg.body.indexOf('id="f-q-clear"') !== -1);
    check('page placeholder broadened (ar/en/slug/cc/status/alias)', pg.body.indexOf('search ar / en / slug / cc / status / alias') !== -1);

    // data-text covers ar, en, slug, cc, status, alias → search will match each.
    const m = pg.body.match(/<tr[^>]*data-slug="searchtest-one"[^>]*>/) || pg.body.match(/<tr[^>]*>(?:(?!<\/tr>)[\s\S])*searchtest-one/);
    const trTag = (pg.body.match(/<tr [^>]*data-text="([^"]*)"[^>]*>(?:(?!<\/tr>)[\s\S])*?searchtest-one/) || [])[1]
        || ((pg.body.split('searchtest-one')[0] || '').match(/<tr [^>]*data-text="([^"]*)"[^>]*>\s*$/) || [])[1] || '';
    // robust: find the data-text of the row containing 'searchtest-one'
    const rowChunk = pg.body.split('</tr>').find(ch => ch.indexOf('searchtest-one') !== -1) || '';
    const dt = ((rowChunk.match(/data-text="([^"]*)"/) || [])[1] || '').toLowerCase();
    check('data-text has ar name', dt.indexOf('بلدة البحث') !== -1, dt ? 'ok' : 'NO data-text');
    check('data-text has en name', dt.indexOf('searchtest one') !== -1);
    check('data-text has slug', dt.indexOf('searchtest-one') !== -1);
    check('data-text has country_code', dt.indexOf(' sa ') !== -1 || /(^| )sa( |$)/.test(dt));
    check('data-text has status', dt.indexOf('ready_for_review') !== -1);
    check('data-text has alias (Alpha Town)', dt.indexOf('alpha town') !== -1);

    check('JSON/page NO secrets', !leak(rj.body) && !leak(pg.body));
    check('local curated NOT mutated', readFileSync(CURATED, 'utf8') === curatedBefore);
    check('/ → 200', (await get(PORT, '/')).status === 200);
    check('admin no token → 401', (await get(PORT, '/api/admin/discovered-cities')).status === 401);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
