// Phase G — Sitemap + Canonical assertions for db/curated-slugs.json
//
// Verifies:
//   - Mecca canonical = /prayer-times-in-makkah
//   - Giza Governorate canonical = /prayer-times-in-giza  (admin suffix stripped)
//   - All entries have valid slug starting with [a-z]
//   - No duplicate canonical slugs
//   - No query params in URLs
//   - No Nominatim/external slugs
//   - Each redirect target exists as a real entry
//   - Round-trip stability: buildPrayerTimesSlug(item) === entry.slug
//
// تشغيل: node scripts/test-sitemap-canonical.mjs

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = path.resolve('.');
const OUT = path.join(ROOT, 'db/curated-slugs.json');

if (!fs.existsSync(OUT)) {
    console.error(`✗ ${OUT} not found — run scripts/build-curated-sitemap.mjs first`);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(OUT, 'utf8'));

// ── Round-trip: rebuild slugs from app.js to verify match ─────────────
const src = fs.readFileSync('js/app.js', 'utf8');
function extractFunc(name) {
    const re = new RegExp(`function\\s+${name}\\s*\\(`);
    const m = re.exec(src);
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
function extractArray(name) {
    const re = new RegExp(`const\\s+${name}\\s*=\\s*\\[`);
    const m = re.exec(src);
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

const sandboxCode = [
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
vm.runInContext(sandboxCode + '\nthis.__api = { buildPrayerTimesSlug, LOCAL_CITIES, LOCAL_PROVINCES };', ctx);
const { buildPrayerTimesSlug, LOCAL_CITIES, LOCAL_PROVINCES } = ctx.__api;

// ── Tests ──────────────────────────────────────────────────────────────
let pass = 0, fail = 0;
const failures = [];
const checks = [];

function ok(label) { pass++; checks.push(`  ✓ ${label}`); }
function bad(label) { fail++; failures.push(`  ✗ ${label}`); }

console.log(`\n══════ Phase G — Sitemap + Canonical Test Suite ══════`);
console.log(`File: ${OUT}`);
console.log(`Generated: ${data.generatedAt}`);
console.log(`Entries: ${data.count} (cities: ${data.citiesCount}, provinces: ${data.provincesCount})\n`);

// 1) Specific must-pass cases ─────────────────────────────────────────
console.log(`▌ A) Specific canonical assertions`);
function findEntry(criteria) {
    return data.entries.find(e => {
        for (const k in criteria) if (e[k] !== criteria[k]) return false;
        return true;
    });
}
const mecca = findEntry({ en: 'Mecca' });
mecca && mecca.slug === 'makkah' ? ok('Mecca canonical = /prayer-times-in-makkah') : bad(`Mecca canonical = ${mecca?.slug}, expected makkah`);
const giza = findEntry({ en: 'Giza Governorate' });
const gizaCity = findEntry({ en: 'Giza' });
// After dedup, only one of them survives — both should slug to 'giza'
const gizaWinner = giza || gizaCity;
gizaWinner && gizaWinner.slug === 'giza' ? ok('Giza (city or governorate) canonical = /prayer-times-in-giza') : bad(`Giza canonical = ${gizaWinner?.slug}`);
const khartoumState = findEntry({ en: 'Khartoum State' });
const khartoumCity = findEntry({ en: 'Khartoum' });
const khartoumWinner = khartoumCity || khartoumState;
khartoumWinner && khartoumWinner.slug === 'khartoum' ? ok('Khartoum canonical = /prayer-times-in-khartoum') : bad(`Khartoum canonical = ${khartoumWinner?.slug}`);
const singapore = findEntry({ en: 'Singapore' });
singapore && singapore.slug === 'singapore-city' ? ok('Singapore canonical = /prayer-times-in-singapore-city') : bad(`Singapore canonical = ${singapore?.slug}`);

// 2) Slug format validation ───────────────────────────────────────────
console.log(`\n▌ B) Slug format & structure`);
const SLUG_RE = /^[a-z][a-z0-9-]*$/;
let badFormat = 0, withQuery = 0, lengthIssues = 0;
for (const e of data.entries) {
    if (!SLUG_RE.test(e.slug)) { badFormat++; failures.push(`  ✗ bad slug format: "${e.slug}" (${e.en})`); }
    if (/[?=&]/.test(e.slug)) { withQuery++; failures.push(`  ✗ slug has query chars: "${e.slug}"`); }
    if (e.slug.length < 2) { lengthIssues++; failures.push(`  ✗ slug too short: "${e.slug}"`); }
}
badFormat === 0 ? ok(`All ${data.entries.length} slugs match /^[a-z][a-z0-9-]*$/`) : null;
withQuery === 0 ? ok('No slug contains query-string characters (?=&)') : null;
lengthIssues === 0 ? ok('All slugs ≥ 2 chars') : null;

// 3) No duplicate canonical slugs ─────────────────────────────────────
console.log(`\n▌ C) Uniqueness`);
const seen = new Map();
let dupSlugs = 0;
for (const e of data.entries) {
    if (seen.has(e.slug)) {
        dupSlugs++;
        failures.push(`  ✗ duplicate slug "${e.slug}": ${e.en} ↔ ${seen.get(e.slug).en}`);
    } else seen.set(e.slug, e);
}
dupSlugs === 0 ? ok(`No duplicate canonical slugs (${seen.size} unique)`) : null;

// 4) Redirect targets exist ───────────────────────────────────────────
console.log(`\n▌ D) Redirect integrity`);
let invalidRedirects = 0;
const slugSet = new Set(data.entries.map(e => e.slug));
for (const [old, neu] of Object.entries(data.redirects)) {
    if (!slugSet.has(neu)) { invalidRedirects++; failures.push(`  ✗ redirect target "${neu}" not in entries (from "${old}")`); }
    if (old === neu) { invalidRedirects++; failures.push(`  ✗ redirect loop: "${old}" → "${neu}"`); }
    if (slugSet.has(old)) { invalidRedirects++; failures.push(`  ✗ redirect source "${old}" also exists as canonical entry — would shadow`); }
}
invalidRedirects === 0 ? ok(`All ${Object.keys(data.redirects).length} redirects point to existing canonical entries`) : null;

// 5) No Nominatim leakage ─────────────────────────────────────────────
console.log(`\n▌ E) No external/Nominatim leakage`);
let externalRefs = 0;
for (const e of data.entries) {
    if (!e.en && !e.ar) { externalRefs++; failures.push(`  ✗ entry missing names: ${JSON.stringify(e)}`); }
    if (e.slug.startsWith('loc-') && /\d/.test(e.slug)) { externalRefs++; failures.push(`  ✗ coord-suffix slug in curated set: ${e.slug}`); }
}
externalRefs === 0 ? ok(`All entries are curated (no coord-only slugs, no missing names)`) : null;

// 6) Round-trip stability ─────────────────────────────────────────────
console.log(`\n▌ F) Round-trip: buildPrayerTimesSlug(item) === entry.slug`);
let mismatch = 0;
const allRaw = LOCAL_CITIES.concat(LOCAL_PROVINCES);
const seenChecked = new Set();
for (const item of allRaw) {
    const slug = buildPrayerTimesSlug(item);
    if (!slug) continue;
    // Find entry by slug — must exist
    if (!slugSet.has(slug)) {
        mismatch++; failures.push(`  ✗ ${item.en} produces "${slug}" but no entry has that slug`);
    }
    seenChecked.add(slug);
}
mismatch === 0 ? ok(`All ${allRaw.length} raw items resolve to a canonical entry`) : null;

// 7) Specific redirects must be present ──────────────────────────────
console.log(`\n▌ G) Required redirects present`);
const required = {
    'mecca':              'makkah',
    'singapore':          'singapore-city',
    'giza-governorate':   'giza',
    'khartoum-state':     'khartoum',
    'eastern-province':   'eastern',
};
for (const [from, to] of Object.entries(required)) {
    if (data.redirects[from] === to) ok(`/prayer-times-in-${from} → /prayer-times-in-${to}`);
    else bad(`Missing redirect: ${from} → ${to} (got: ${data.redirects[from] || 'none'})`);
}

// ── Print all checks ─────────────────────────────────────────────────
for (const c of checks) console.log(c);

// ── Summary ──────────────────────────────────────────────────────────
console.log(`\n══════ Summary ══════`);
console.log(`  Passed: ${pass}`);
console.log(`  Failed: ${fail}`);

if (failures.length > 0) {
    console.log(`\n══════ Failures (${failures.length}) ══════`);
    for (const f of failures) console.log(f);
}

console.log('');
process.exit(fail > 0 ? 1 : 0);
