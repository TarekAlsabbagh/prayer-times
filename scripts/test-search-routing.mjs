// Phase F — Search Routing tests for buildPrayerTimesSlug / buildPrayerTimesUrl.
//
// Verifies:
//   - Mecca → /prayer-times-in-makkah  (explicit slug override)
//   - Cairo → /prayer-times-in-cairo
//   - Tripoli LY → /prayer-times-in-tripoli  (no LB conflict in current data)
//                  أو tripoli-libya إن أُضيفت بيروت Tripoli LB لاحقًا
//   - Al Mithnab → /prayer-times-in-al-mithnab
//   - Giza Governorate → /prayer-times-in-giza  (admin suffix stripped)
//   - Phonsavan (ad-hoc, non-local) → /prayer-times-in-phonsavan
//
// تشغيل: node scripts/test-search-routing.mjs

import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync('js/app.js', 'utf8');

function extractArray(name) {
    const startRe = new RegExp(`const\\s+${name}\\s*=\\s*\\[`);
    const m = startRe.exec(src);
    if (!m) throw new Error(`${name} not found`);
    let i = m.index + m[0].length, depth = 1;
    while (i < src.length && depth > 0) {
        const ch = src[i];
        if (ch === '[') depth++;
        else if (ch === ']') { depth--; if (depth === 0) break; }
        i++;
    }
    return src.slice(m.index, i + 1) + ';';
}

function extractFunc(name) {
    const startRe = new RegExp(`function\\s+${name}\\s*\\(`);
    const m = startRe.exec(src);
    if (!m) throw new Error(`function ${name} not found`);
    let i = src.indexOf('{', m.index) + 1, depth = 1;
    while (i < src.length && depth > 0) {
        const ch = src[i];
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) break; }
        i++;
    }
    return src.slice(m.index, i + 1);
}

// Build sandbox with routing helpers + data
const sandbox = [
    extractFunc('makeSlug'),
    `const _ROUTING_ADMIN_SUFFIX_RE = /\\s+(Governorate|Province|Region|State|Emirate|Municipality|District|County)$/i;`,
    extractFunc('_routingBaseSlug'),
    `let _routingSlugIndex = null;`,
    extractFunc('_buildRoutingIndex'),
    extractFunc('_isRoutingSlugConflict'),
    extractFunc('buildPrayerTimesSlug'),
    extractArray('LOCAL_CITIES'),
    extractArray('LOCAL_PROVINCES'),
].join('\n\n');

const ctx = { console };
vm.createContext(ctx);
vm.runInContext(sandbox + '\nthis.__api = { buildPrayerTimesSlug, LOCAL_CITIES, LOCAL_PROVINCES, _buildRoutingIndex };', ctx);
const { buildPrayerTimesSlug, LOCAL_CITIES, LOCAL_PROVINCES, _buildRoutingIndex } = ctx.__api;

const findByEn = (en, cc) => {
    const all = LOCAL_CITIES.concat(LOCAL_PROVINCES);
    return all.find(x => x.en === en && (!cc || (x.cc || '').toLowerCase() === cc.toLowerCase()));
};

// ── Tests ──────────────────────────────────────────────────────────────
const TESTS = [
    // ── Capitals (LOCAL_CITIES) ──
    { name: 'Riyadh',         lookup: () => findByEn('Riyadh'),                  expectSlug: 'riyadh' },
    { name: 'Mecca→makkah',   lookup: () => findByEn('Mecca'),                   expectSlug: 'makkah',     note: 'explicit slug override' },
    { name: 'Cairo',          lookup: () => findByEn('Cairo'),                   expectSlug: 'cairo' },
    { name: 'London',         lookup: () => findByEn('London', 'gb'),            expectSlug: 'london',     note: 'or london-united-kingdom if conflict' },
    { name: 'Beijing',        lookup: () => findByEn('Beijing'),                 expectSlug: 'beijing' },
    { name: 'Singapore',      lookup: () => findByEn('Singapore'),               expectSlug: 'singapore-city', note: 'avoids country-slug collision' },

    // ── Governorates (LOCAL_PROVINCES) ──
    { name: 'Al Mithnab',         lookup: () => findByEn('Al Mithnab'),          expectSlug: 'al-mithnab' },
    { name: 'Al Quwayiyah',       lookup: () => findByEn('Al Quwayiyah'),        expectSlug: 'al-quwayiyah' },
    { name: 'Al Kharj',           lookup: () => findByEn('Al Kharj'),            expectSlug: 'al-kharj' },
    { name: 'Giza Governorate',   lookup: () => findByEn('Giza Governorate'),    expectSlug: 'giza',       note: 'admin suffix stripped' },
    { name: 'Khartoum State',     lookup: () => findByEn('Khartoum State'),      expectSlug: 'khartoum',   note: 'admin suffix stripped' },
    { name: 'Eastern Province',   lookup: () => findByEn('Eastern Province'),    expectSlug: 'eastern',    note: 'admin suffix stripped' },
    { name: 'Tripoli LY',         lookup: () => findByEn('Tripoli', 'ly'),       expectSlug: 'tripoli',    note: 'no LB Tripoli in LOCAL data → no conflict' },
    { name: 'Tripoli District LY',lookup: () => findByEn('Tripoli District'),    expectSlug: 'tripoli',    note: 'admin suffix stripped' },

    // ── Ad-hoc (non-local) entries ──
    { name: 'Phonsavan',          lookup: () => ({ en: 'Phonsavan', cc: 'la', countryEn: 'Laos', lat: 19.45, lng: 103.21 }), expectSlug: 'phonsavan' },
    { name: 'Some New City',      lookup: () => ({ en: 'Foo Bar', cc: 'xx', countryEn: 'Nowhere', lat: 0, lng: 0 }),         expectSlug: 'foo-bar' },
    { name: 'Non-Latin city',     lookup: () => ({ en: '', cc: 'jp', countryEn: 'Japan', lat: 35.0, lng: 139.0 }),            expectSlug: /^loc-/, note: 'falls back to coord slug' },
];

let pass = 0, fail = 0;
const failures = [];

console.log(`\n══════ Phase F — Search Routing Test Suite ══════`);
console.log(`LOCAL_CITIES:    ${LOCAL_CITIES.length}`);
console.log(`LOCAL_PROVINCES: ${LOCAL_PROVINCES.length}\n`);

console.log(`▌ A) buildPrayerTimesSlug correctness (${TESTS.length} cases)`);
for (const tc of TESTS) {
    const item = tc.lookup();
    if (!item) { fail++; failures.push(`  ✗ ${tc.name}: lookup returned null`); continue; }
    const slug = buildPrayerTimesSlug(item);
    const ok = tc.expectSlug instanceof RegExp ? tc.expectSlug.test(slug) : slug === tc.expectSlug;
    if (ok) {
        pass++;
        console.log(`  ✓ ${tc.name.padEnd(30)} → /prayer-times-in-${slug}${tc.note ? '   (' + tc.note + ')' : ''}`);
    } else {
        fail++;
        failures.push(`  ✗ ${tc.name}: expected slug ${JSON.stringify(tc.expectSlug)}, got ${JSON.stringify(slug)}`);
    }
}

// ── Conflict-detection report ────────────────────────────────────────
console.log(`\n▌ B) Slug conflicts in dataset`);
const idx = _buildRoutingIndex();
let conflicts = 0;
for (const [slug, list] of idx) {
    if (list.length < 2) continue;
    const ccs = new Set(list.map(x => (x.cc || '').toLowerCase()));
    if (ccs.size < 2) continue;          // same-cc duplicates handled elsewhere
    conflicts++;
    console.log(`  ⚠  "${slug}" used by ${list.length} entries in ${ccs.size} countries:`);
    for (const x of list) {
        const fullSlug = buildPrayerTimesSlug(x);
        console.log(`       - ${x.ar} / ${x.en}  (${x.cc})  →  ${fullSlug}`);
    }
}
if (conflicts === 0) console.log(`  ✓ No cross-country conflicts in current dataset`);

// ── Stability test: same item → same slug, multiple calls ─────────────
console.log(`\n▌ C) Stability — slug deterministic across calls`);
let stableOk = 0, stableFail = 0;
for (const item of LOCAL_CITIES.slice(0, 50)) {
    const s1 = buildPrayerTimesSlug(item);
    const s2 = buildPrayerTimesSlug(item);
    if (s1 === s2 && s1.length > 0) stableOk++;
    else { stableFail++; failures.push(`  ✗ unstable slug for ${item.ar}: ${s1} vs ${s2}`); }
}
console.log(`  ${stableFail === 0 ? '✓' : '✗'} ${stableOk}/${stableOk + stableFail} stable across calls`);

// ── Summary ───────────────────────────────────────────────────────────
console.log(`\n══════ Summary ══════`);
console.log(`  Routing tests:  ${pass}/${TESTS.length} passed`);
console.log(`  Stability:      ${stableOk}/${stableOk + stableFail} passed`);
console.log(`  Conflicts:      ${conflicts} (resolved via -country suffix)`);
console.log(`  ─────────────────`);
console.log(`  TOTAL:          ${pass + stableOk}/${TESTS.length + stableOk + stableFail} passed`);

if (failures.length > 0) {
    console.log(`\n══════ Failures (${failures.length}) ══════`);
    for (const f of failures) console.log(f);
}

console.log('');
process.exit(fail + stableFail > 0 ? 1 : 0);
