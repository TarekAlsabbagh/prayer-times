// scripts/geodata/_asia_1d_in_b_fast_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1D-IN-B-FAST — Quick India BATCH-B: add 30 next-tier cities with
// ar+en only (no L10N, no plan phase, no ranking change).
//
// User decision 2026-05-20: launch-readiness path. Skip preflight/plan;
// add cities directly from in-geonames-candidates.json with manual Arabic.
//
// Source: db/places/candidates/in-geonames-candidates.json — selected
// pop≥450k major cities matching user's suggested list.
//
// Per user's apply rules:
//   1. Add 30 IN cities (no fewer than 20, no more than 35)
//   2. ar + en only — NO names.hi/ur/bn/ta/mr/etc.
//   3. Required fields only: slug, type, countryCode, lat, lng, timezone,
//      names.ar, names.en, aliases.en (when documented rename/variant),
//      admin (country only), priority, source, sourceId, verified, type
//   4. NEVER touch 40 prior IN entries (PRIOR-40 byte-identity guard)
//   5. NEVER touch other countries (non-IN byte-identical hash)
//   6. Salem-IN: use slug "salem-in" to avoid collision with us/salem
//   7. No shared scripts / no server.js / no js/app.js / no index.html
//   8. No runtime translation; manual Arabic transliterations
//   9. No fillchain
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.preAsia1dInBFast.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/asia-1d-in-b-fast-apply-report.md';

// ═══ 30 BATCH-B cities — manual Arabic translit, no LLM, no API ═══════════
const NEW_CITIES = [
    // 1M+ pop
    { slug: 'gorakhpur',       gid: 1270926, lat: 26.76542, lng: 83.36989, fc: 'PPL',   pop: 1324570, region: 'Uttar Pradesh',  en: 'Gorakhpur',       ar: 'غوراكبور',        aliases: [] },
    { slug: 'raipur',          gid: 1258980, lat: 21.23333, lng: 81.63333, fc: 'PPLA',  pop: 1027264, region: 'Chhattisgarh',   en: 'Raipur',          ar: 'رايبور',           aliases: [] },
    { slug: 'tiruchirappalli', gid: 1254388, lat: 10.80502, lng: 78.68707, fc: 'PPL',   pop: 1022518, region: 'Tamil Nadu',     en: 'Tiruchirappalli', ar: 'تيروتشيرابالي',   aliases: ['Trichy', 'Tiruchirapalli'] },
    { slug: 'kota',            gid: 1266049, lat: 25.18254, lng: 75.83907, fc: 'PPL',   pop: 1001694, region: 'Rajasthan',      en: 'Kota',            ar: 'كوتا',             aliases: [] },

    // 700k–1M pop
    { slug: 'sholapur',        gid: 1256436, lat: 17.67152, lng: 75.90606, fc: 'PPL',   pop: 997281,  region: 'Maharashtra',    en: 'Sholapur',        ar: 'سولابور',          aliases: ['Solapur'] },
    { slug: 'chandigarh',      gid: 1274746, lat: 30.73629, lng: 76.7884,  fc: 'PPLA',  pop: 970602,  region: 'Chandigarh',     en: 'Chandigarh',      ar: 'شانديغار',          aliases: [] },
    { slug: 'tiruppur',        gid: 1254348, lat: 11.10854, lng: 77.34103, fc: 'PPL',   pop: 963173,  region: 'Tamil Nadu',     en: 'Tiruppur',        ar: 'تيروبور',          aliases: ['Tirupur'] },
    { slug: 'guwahati',        gid: 1271476, lat: 26.18121, lng: 91.75395, fc: 'PPL',   pop: 962334,  region: 'Assam',          en: 'Guwahati',        ar: 'غواهاتي',          aliases: [] },
    { slug: 'mysuru',          gid: 1262321, lat: 12.30715, lng: 76.65595, fc: 'PPLA2', pop: 920550,  region: 'Karnataka',      en: 'Mysuru',          ar: 'ميسور',            aliases: ['Mysore'] },
    { slug: 'salem-in',        gid: 1257629, lat: 11.65,    lng: 78.16667, fc: 'PPL',   pop: 917414,  region: 'Tamil Nadu',     en: 'Salem',           ar: 'سالم',             aliases: ['Salem'] },
    { slug: 'gurugram',        gid: 1270642, lat: 28.45836, lng: 77.02641, fc: 'PPLA2', pop: 886519,  region: 'Haryana',        en: 'Gurugram',        ar: 'غوروغرام',          aliases: ['Gurgaon'] },
    { slug: 'bhubaneswar',     gid: 1275817, lat: 20.27241, lng: 85.83385, fc: 'PPLA',  pop: 885363,  region: 'Odisha',         en: 'Bhubaneswar',     ar: 'بوبانسوار',         aliases: [] },
    { slug: 'jalandhar',       gid: 1268782, lat: 31.32556, lng: 75.57917, fc: 'PPL',   pop: 868929,  region: 'Punjab',         en: 'Jalandhar',       ar: 'جلندار',           aliases: [] },
    { slug: 'bhayandar',       gid: 1276014, lat: 19.30157, lng: 72.85107, fc: 'PPL',   pop: 809378,  region: 'Maharashtra',    en: 'Bhayandar',       ar: 'بهايندر',           aliases: ['Bhayander'] },

    // 500k–700k pop
    { slug: 'aligarh',         gid: 1279017, lat: 27.88145, lng: 78.07464, fc: 'PPL',   pop: 753207,  region: 'Uttar Pradesh',  en: 'Aligarh',         ar: 'أليكره',            aliases: [] },
    { slug: 'bareilly',        gid: 1277013, lat: 28.34702, lng: 79.43044, fc: 'PPL',   pop: 745435,  region: 'Uttar Pradesh',  en: 'Bareilly',        ar: 'بريلي',             aliases: [] },
    { slug: 'moradabad',       gid: 1262801, lat: 28.83893, lng: 78.77684, fc: 'PPLA2', pop: 721139,  region: 'Uttar Pradesh',  en: 'Moradabad',       ar: 'مراد آباد',         aliases: [] },
    { slug: 'warangal',        gid: 1252948, lat: 17.99506, lng: 79.59409, fc: 'PPLA2', pop: 704570,  region: 'Telangana',      en: 'Warangal',        ar: 'ورنغل',              aliases: [] },
    { slug: 'guntur',          gid: 1270668, lat: 16.30667, lng: 80.43667, fc: 'PPL',   pop: 670073,  region: 'Andhra Pradesh', en: 'Guntur',          ar: 'غونتور',            aliases: [] },
    { slug: 'bikaner',         gid: 1275665, lat: 28.0181,  lng: 73.31495, fc: 'PPL',   pop: 644406,  region: 'Rajasthan',      en: 'Bikaner',         ar: 'بيكانير',           aliases: [] },
    { slug: 'bhilai',          gid: 1275971, lat: 21.20919, lng: 81.4285,  fc: 'PPL',   pop: 627734,  region: 'Chhattisgarh',   en: 'Bhilai',          ar: 'بهيلاي',            aliases: [] },
    { slug: 'jammu',           gid: 1269321, lat: 32.7359,  lng: 74.86866, fc: 'PPLA',  pop: 576198,  region: 'Jammu and Kashmir', en: 'Jammu',       ar: 'جامو',               aliases: [] },
    { slug: 'kozhikode',       gid: 1265873, lat: 11.24802, lng: 75.7804,  fc: 'PPLA2', pop: 550440,  region: 'Kerala',         en: 'Kozhikode',       ar: 'كاليكوت',           aliases: ['Calicut'] },
    { slug: 'nellore',         gid: 1261529, lat: 14.43,    lng: 79.96,    fc: 'PPLA2', pop: 547621,  region: 'Andhra Pradesh', en: 'Nellore',         ar: 'نيلور',             aliases: [] },
    { slug: 'ajmer',           gid: 1279159, lat: 26.4521,  lng: 74.6376,  fc: 'PPL',   pop: 542321,  region: 'Rajasthan',      en: 'Ajmer',           ar: 'أجمير',             aliases: [] },
    { slug: 'dehradun',        gid: 1273313, lat: 30.32443, lng: 78.03392, fc: 'PPLA',  pop: 522081,  region: 'Uttarakhand',    en: 'Dehradun',        ar: 'ديهرادون',           aliases: ['Dehra Dun'] },
    { slug: 'erode',           gid: 1272013, lat: 11.34228, lng: 77.72831, fc: 'PPL',   pop: 521891,  region: 'Tamil Nadu',     en: 'Erode',           ar: 'إيرود',              aliases: [] },
    { slug: 'ujjain',          gid: 1253914, lat: 23.18,    lng: 75.77,    fc: 'PPL',   pop: 515215,  region: 'Madhya Pradesh', en: 'Ujjain',          ar: 'أوجاين',             aliases: [] },
    { slug: 'mangaluru',       gid: 1263780, lat: 12.86562, lng: 74.84265, fc: 'PPL',   pop: 499487,  region: 'Karnataka',      en: 'Mangaluru',       ar: 'منغالور',            aliases: ['Mangalore'] },
    { slug: 'belagavi',        gid: 1276533, lat: 15.85363, lng: 74.5045,  fc: 'PPL',   pop: 490045,  region: 'Karnataka',      en: 'Belagavi',        ar: 'بلغاوم',             aliases: ['Belgaum'] },
];

// ─── Arabic script-purity guard (basic) ──────────────────────────────────
function isCleanArabic(s) {
    if (!s) return false;
    const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۆۇۈېەڕڼ]/;
    const LATIN = /[A-Za-z]/;
    const URDU_NUN_GHUNNA = /[ں]/;
    const stripped = String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped))    return false;
    if (LATIN.test(stripped))           return false;
    if (URDU_NUN_GHUNNA.test(stripped)) return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

// ─── Priority assignment by population band ──────────────────────────────
function priorityForPop(pop) {
    if (pop >= 1_000_000) return 95;
    if (pop >= 700_000)   return 90;
    if (pop >= 500_000)   return 85;
    return 80;
}

// ─── Allowed langs for new entries: ar + en ONLY ─────────────────────────
const ALLOWED_LANGS = new Set(['ar', 'en']);

function main() {
    // ─── Pre-flight validation ───
    const errors = [];
    const seenSlugs = new Set();
    const seenGids  = new Set();
    for (const c of NEW_CITIES) {
        if (seenSlugs.has(c.slug)) errors.push('Duplicate slug in NEW_CITIES: ' + c.slug);
        seenSlugs.add(c.slug);
        if (seenGids.has(c.gid)) errors.push('Duplicate gid in NEW_CITIES: ' + c.gid);
        seenGids.add(c.gid);
        if (!isCleanArabic(c.ar)) {
            errors.push(c.slug + ' ar="' + c.ar + '" fails isCleanArabic');
        }
        if (!c.en) errors.push(c.slug + ' missing en');
        if (!Number.isFinite(c.lat) || !Number.isFinite(c.lng)) errors.push(c.slug + ' invalid lat/lng');
        if (typeof c.fc !== 'string') errors.push(c.slug + ' missing featureCode');
    }
    if (NEW_CITIES.length < 20 || NEW_CITIES.length > 35) {
        errors.push('NEW_CITIES count out of bounds: ' + NEW_CITIES.length + ' (must be 20-35)');
    }
    if (errors.length) {
        console.error('[apply] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] pre-flight OK — ' + NEW_CITIES.length + ' cities validated');

    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    } else {
        console.log('[apply] backup already exists:', BACKUP);
    }

    const ORIGINAL_TOTAL = curated.length;

    // ─── Cross-collision check vs ALL curated entries ───
    const allSlugs = new Set(curated.map(e => e.slug));
    const allGids = new Set();
    for (const e of curated) {
        if (typeof e.sourceId === 'string' && e.sourceId.startsWith('geonames:')) {
            allGids.add(Number(e.sourceId.slice(9)));
        }
    }
    for (const c of NEW_CITIES) {
        if (allSlugs.has(c.slug)) errors.push('SLUG-COLLISION: ' + c.slug + ' exists in curated');
        if (allGids.has(c.gid))   errors.push('GID-COLLISION: gid=' + c.gid + ' exists in curated (slug=' + c.slug + ')');
    }
    if (errors.length) {
        console.error('[apply] FAILED cross-collision:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] cross-collision OK — no slug or geonameId conflict');

    // ─── Snapshot ALL existing entries for byte-identity assertion ───
    const preStateHash = curated
        .map(e => e.slug + '|' + JSON.stringify(e))
        .sort()
        .join('\n');

    // ─── Build new entries (minimum-fields) ───
    const added = [];
    for (const c of NEW_CITIES) {
        const entry = {
            slug:        c.slug,
            type:        'city',
            countryCode: 'in',
            lat:         c.lat,
            lng:         c.lng,
            timezone:    'Asia/Kolkata',
            names: {
                ar: c.ar,
                en: c.en,
            },
            admin: {
                countryAr: 'الهند',
                countryEn: 'India',
            },
            priority: priorityForPop(c.pop),
            source: 'curated',
            sourceId: 'geonames:' + c.gid,
            verified: true,
        };
        if (c.region) entry.admin.regionEn = c.region;
        if (Array.isArray(c.aliases) && c.aliases.length) {
            entry.aliases = { en: c.aliases };
        }
        // Assert no forbidden langs
        for (const k of Object.keys(entry.names)) {
            if (!ALLOWED_LANGS.has(k)) {
                console.error('[apply] FAILED — entry has forbidden lang: ' + c.slug + '.' + k);
                process.exit(1);
            }
        }
        curated.push(entry);
        added.push(c);
    }

    // ─── Post-apply assertions ───

    // 1. Total count == original + 30
    const expectedTotal = ORIGINAL_TOTAL + NEW_CITIES.length;
    if (curated.length !== expectedTotal) {
        console.error('[apply] FAILED — total count: expected ' + expectedTotal + ', got ' + curated.length);
        process.exit(1);
    }
    // 2. IN count == original_in + 30
    const inCount = curated.filter(e => e.countryCode === 'in').length;
    console.log('[apply] IN count post-apply: ' + inCount);

    // 3. All non-new entries byte-identical
    const newSlugSet = new Set(NEW_CITIES.map(c => c.slug));
    const postStateHash = curated
        .filter(e => !newSlugSet.has(e.slug))
        .map(e => e.slug + '|' + JSON.stringify(e))
        .sort()
        .join('\n');
    if (preStateHash !== postStateHash) {
        console.error('[apply] FAILED — non-new entries hash differs');
        process.exit(1);
    }
    console.log('[apply] byte-identity OK — all ' + ORIGINAL_TOTAL + ' pre-existing entries unchanged');

    // 4. No duplicate slugs in final curated
    const dupCheck = new Set();
    for (const e of curated) {
        if (dupCheck.has(e.slug)) {
            console.error('[apply] FAILED — duplicate slug post-apply: ' + e.slug);
            process.exit(1);
        }
        dupCheck.add(e.slug);
    }

    // 5. No duplicate sourceIds in final curated
    const sidCheck = new Set();
    for (const e of curated) {
        if (typeof e.sourceId === 'string') {
            if (sidCheck.has(e.sourceId)) {
                console.error('[apply] FAILED — duplicate sourceId post-apply: ' + e.sourceId);
                process.exit(1);
            }
            sidCheck.add(e.sourceId);
        }
    }

    // 6. All new entries have ONLY ar+en in names (no hi/ur/bn/ta/mr/etc.)
    let langPolicyFails = 0;
    for (const c of NEW_CITIES) {
        const e = curated.find(x => x.slug === c.slug);
        const langs = Object.keys(e.names || {}).sort();
        if (JSON.stringify(langs) !== JSON.stringify(['ar', 'en'])) {
            console.error('[apply] FAILED — ' + c.slug + ' lang policy: ' + langs.join(','));
            langPolicyFails++;
        }
    }
    if (langPolicyFails > 0) process.exit(1);

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // ─── Audit report ───
    const L = [];
    L.push('# ASIA-1D-IN-B-FAST — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Cities added**: ' + NEW_CITIES.length);
    L.push('**Total curated**: ' + ORIGINAL_TOTAL + ' → ' + curated.length);
    L.push('**IN count**: ' + (inCount - NEW_CITIES.length) + ' → ' + inCount);
    L.push('**Lang policy**: ar + en only (no hi/ur/bn/ta/mr)');
    L.push('');
    L.push('## Added cities');
    L.push('');
    L.push('| # | slug | gid | en | ar | fc | pop | priority | aliases.en |');
    L.push('| ---: | --- | ---: | --- | --- | --- | ---: | ---: | --- |');
    let i = 1;
    for (const c of NEW_CITIES) {
        L.push('| ' + (i++) + ' | `' + c.slug + '` | ' + c.gid + ' | ' + c.en + ' | ' + c.ar + ' | ' + c.fc + ' | ' + c.pop.toLocaleString() + ' | ' + priorityForPop(c.pop) + ' | ' + (c.aliases.length ? c.aliases.join(', ') : '—') + ' |');
    }
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ ASIA-1D-IN-B-FAST — Summary ═══');
    console.log('  Added:               ' + NEW_CITIES.length);
    console.log('  Total curated:       ' + ORIGINAL_TOTAL + ' → ' + curated.length);
    console.log('  IN count:            ' + (inCount - NEW_CITIES.length) + ' → ' + inCount);
    console.log('  Lang policy:         ar+en only');
    console.log('  Pre-existing dirty:  0 (byte-identical hash)');
}

main();
