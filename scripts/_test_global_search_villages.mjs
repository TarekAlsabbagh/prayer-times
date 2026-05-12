// GLOBAL-HOME-SEARCH-2 verification.
// Tests two aspects of the village-search broadening:
//
//   1. Smart-filter now accepts `town`, `village`, `hamlet`,
//      `municipality`, `suburb`, `subdistrict`, `state_district`,
//      `administrative`, etc. — so a real-but-tiny place doesn't get
//      rejected as if it were a road / shop.
//   2. When the user's spelling doesn't match OSM exactly (e.g.
//      `اللطامنه` with ه vs OSM's `اللطامنة` with ة), the
//      Arabic-query-variants helper produces forms that DO match.
//
// Plus: against the LIVE local proxy, confirms that each of the
// user-reported villages returns a valid city-type place via the
// full pipeline.

import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Part A: Unit-test smart-filter + variants helper ───
const SMART_ALLOWED = new Set([
    'city', 'town', 'village', 'municipality',
    'province', 'governorate', 'state', 'county', 'district',
    'administrative', 'borough', 'hamlet', 'locality', 'region',
    'suburb', 'subdistrict', 'state_district'
]);
const SMART_BLOCKED = new Set([
    'country', 'road', 'street', 'highway',
    'neighbourhood', 'quarter', 'building', 'shop', 'amenity',
    'tourism', 'landmark', 'address', 'postcode',
    'office', 'leisure', 'historic', 'craft', 'man_made',
    'waterway', 'natural', 'landuse', 'aeroway', 'railway',
    'residential', 'hamlet_neighbourhood', 'isolated_dwelling',
    'farm', 'plot'
]);
function isAccepted(p) {
    if (SMART_ALLOWED.has(p.addresstype)) return true;
    if (SMART_BLOCKED.has(p.class)) return false;
    if (SMART_BLOCKED.has(p.type)) return false;
    if (SMART_BLOCKED.has(p.addresstype)) return false;
    return true;
}
function variants(q) {
    const orig = String(q || '').trim();
    if (!orig) return [];
    const seen = new Set([orig]);
    const out = [orig];
    const push = (v) => { const t = String(v||'').trim(); if (t && !seen.has(t)) { seen.add(t); out.push(t); } };
    if (orig.includes('ة')) push(orig.replace(/ة/g, 'ه'));
    if (orig.includes('ه')) push(orig.replace(/ه(?=\s|$)/g, 'ة'));
    if (/^ال/.test(orig)) push(orig.replace(/^ال/, ''));
    if (/^ال/.test(orig) && orig.includes('ة')) {
        push(orig.replace(/^ال/, '').replace(/ة/g, 'ه'));
    }
    return out.slice(0, 4);
}

let pass = 0, fail = 0;
function check(label, ok) { if (ok) pass++; else fail++; console.log((ok?'✓':'✗') + ' ' + label); }

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' GLOBAL-HOME-SEARCH-2 — village support + Arabic variants');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('\n── Part A: smart-filter type rules ──');

check('addresstype=town accepted',           isAccepted({ addresstype:'town' })           === true);
check('addresstype=village accepted',        isAccepted({ addresstype:'village' })        === true);
check('addresstype=hamlet accepted',         isAccepted({ addresstype:'hamlet' })         === true);
check('addresstype=suburb NOW accepted',     isAccepted({ addresstype:'suburb' })         === true);
check('addresstype=subdistrict accepted',    isAccepted({ addresstype:'subdistrict' })    === true);
check('addresstype=state_district accepted', isAccepted({ addresstype:'state_district' }) === true);
check('addresstype=district accepted',       isAccepted({ addresstype:'district' })       === true);
check('addresstype=road STILL rejected',     isAccepted({ addresstype:'road', class:'highway', type:'residential' }) === false);
check('addresstype=neighbourhood rejected',  isAccepted({ addresstype:'neighbourhood', class:'place', type:'neighbourhood' }) === false);
check('addresstype=shop rejected',           isAccepted({ addresstype:'shop', class:'shop', type:'beauty' }) === false);
check('class=natural (peak/mountain) reject',isAccepted({ addresstype:'peak', class:'natural', type:'peak' }) === false);

console.log('\n── Part B: Arabic variants helper ──');
const v1 = variants('اللطامنه');  // user typed ه instead of ة
check('اللطامنه → اللطامنة variant', v1.includes('اللطامنة'));
check('اللطامنه → لطامنه variant',   v1.includes('لطامنه'));

const v2 = variants('الأتارب');  // direct article + Hamza
check('الأتارب → أتارب variant',     v2.includes('أتارب'));

const v3 = variants('السفيره');  // user typed ه
check('السفيره → السفيرة variant',   v3.includes('السفيرة'));
check('السفيره → سفيره variant',     v3.includes('سفيره'));

const v4 = variants('Paris');  // Latin — no variants needed
check('Paris → no extra variants',   v4.length === 1);

const v5 = variants('');
check('empty input → empty array',   v5.length === 0);

// ─── Part C: live pipeline (only if server is running) ───
console.log('\n── Part C: live Nominatim pipeline (homepage queries) ──');

function nomFetch(q) {
    const url = `/api/geocode?type=search&format=json&limit=6&accept-language=ar&addressdetails=1&namedetails=1&q=${encodeURIComponent(q)}`;
    return new Promise((resolve) => {
        const req = http.get({ host:'localhost', port:8080, path:url, timeout:8000 }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => { try { resolve(JSON.parse(body)); } catch (_) { resolve([]); } });
        });
        req.on('error', () => resolve([]));
        req.on('timeout', () => { req.destroy(); resolve([]); });
    });
}

const VILLAGE_QUERIES = [
    { q: 'اللطامنة', expectCountry: 'سوريا' },
    { q: 'الأتارب', expectCountry: 'سوريا' },
    { q: 'السفيرة', expectCountry: 'سوريا' },
];

const checkServer = await fetch('http://localhost:8080/health').catch(() => null);
if (!checkServer) {
    console.log('  (server not running on :8080 — skipping live tests)');
} else {
    for (const { q, expectCountry } of VILLAGE_QUERIES) {
        // First try original spelling
        const raw = await nomFetch(q);
        const accepted = (raw || []).filter(isAccepted);
        let resolved = accepted.length > 0;
        let used = q;

        if (!resolved) {
            // Try variants
            for (const v of variants(q).slice(1)) {
                const r = await nomFetch(v);
                const a = (r || []).filter(isAccepted);
                if (a.length > 0) { resolved = true; used = v; break; }
                await new Promise(r => setTimeout(r, 1200));
            }
        }

        if (resolved) {
            pass++;
            const top = accepted[0] || raw[0];
            console.log(`✓ "${q}" → resolved via "${used}" → ${top.name} (${(top.address||{}).country})`);
        } else {
            fail++;
            console.log(`✗ "${q}" → no valid result via any variant`);
        }
        await new Promise(r => setTimeout(r, 1200));
    }
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
