// PT-SEARCH-AR-2 verification.
// Tests the server-side discovered-cities flow end-to-end against the
// running local server: validates `POST /api/discover-city` accepts
// well-formed cities, rejects malformed payloads, dedupes by cc+slug,
// and that `GET /api/discovered-cities` returns the persisted list.
//
// Pre-req: `node server.js` running on localhost:8080.

import http from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'db', 'discovered-cities.json');

// Save the current file so we can restore at the end (test pollution control).
const ORIG = existsSync(DB_PATH) ? readFileSync(DB_PATH, 'utf8') : '[]';

function req(method, path, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            host: 'localhost', port: 8080, method, path,
            headers: {
                'Content-Type': 'application/json',
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
            }
        };
        const r = http.request(opts, (res) => {
            let chunks = '';
            res.on('data', c => chunks += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: chunks ? JSON.parse(chunks) : null });
                } catch (_e) {
                    resolve({ status: res.statusCode, body: chunks });
                }
            });
        });
        r.on('error', reject);
        if (data) r.write(data);
        r.end();
    });
}

// Reset the file to a known empty state before tests so dedup tests are predictable.
writeFileSync(DB_PATH, '[]\n', 'utf8');

let pass = 0, fail = 0;
function check(label, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} ${label}`);
    if (!ok) {
        console.log(`     expected: ${JSON.stringify(expected)}`);
        console.log(`     got:      ${JSON.stringify(actual)}`);
    }
}

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PT-SEARCH-AR-2 — discovered-cities API verification');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

// 1. Empty list initially
let r = await req('GET', '/api/discovered-cities');
check('GET (empty)            → []', r.body, []);

// 2. Add a valid city
r = await req('POST', '/api/discover-city', {
    ar: 'لو بونت', en: 'Le Pontet', cc: 'fr', slug: 'le-pontet',
    lat: 43.961, lng: 4.86, country: 'فرنسا', countryEn: 'France', type: 'city'
});
check('POST valid Le Pontet   → {ok:true,added:true}', r.body, { ok: true, added: true });

// 3. Re-POST same city → already
r = await req('POST', '/api/discover-city', {
    ar: 'لو بونت', en: 'Le Pontet', cc: 'fr', slug: 'le-pontet',
    lat: 43.961, lng: 4.86, country: 'فرنسا', countryEn: 'France', type: 'city'
});
check('POST duplicate         → {ok:true,already:true}', r.body, { ok: true, already: true });

// 4. GET returns the city
r = await req('GET', '/api/discovered-cities');
const list = r.body;
const ok4 = Array.isArray(list) && list.length === 1
    && list[0].slug === 'le-pontet' && list[0].cc === 'fr'
    && list[0].ar === 'لو بونت';
check('GET (1 item)           → Le Pontet present', ok4, true);

// 5. Reject missing slug
r = await req('POST', '/api/discover-city', {
    ar: 'X', en: 'X', cc: 'fr', lat: 1, lng: 1
});
check('POST no slug           → 400 invalid', r.status, 400);

// 6. Reject invalid slug (uppercase / underscore)
r = await req('POST', '/api/discover-city', {
    ar: 'X', en: 'X', cc: 'fr', slug: 'Foo_Bar', lat: 1, lng: 1
});
check('POST bad slug          → 400 invalid', r.status, 400);

// 7. Reject invalid cc
r = await req('POST', '/api/discover-city', {
    ar: 'X', en: 'X', cc: 'FRA', slug: 'foo', lat: 1, lng: 1
});
check('POST cc=FRA            → 400 invalid', r.status, 400);

// 8. Reject out-of-range lat
r = await req('POST', '/api/discover-city', {
    ar: 'X', en: 'X', cc: 'fr', slug: 'foo', lat: 200, lng: 1
});
check('POST lat=200           → 400 invalid', r.status, 400);

// 9. Reject blocked type (e.g. road)
r = await req('POST', '/api/discover-city', {
    ar: 'X', en: 'X', cc: 'fr', slug: 'foo', lat: 1, lng: 1, type: 'road'
});
check('POST type=road         → 400 invalid', r.status, 400);

// 10. Accept allowed type (governorate)
r = await req('POST', '/api/discover-city', {
    ar: 'محافظة جديدة', en: 'New Gov', cc: 'fr', slug: 'new-gov',
    lat: 1, lng: 1, type: 'governorate'
});
check('POST type=governorate  → ok added', r.body, { ok: true, added: true });

// 11. Reject empty body
r = await req('POST', '/api/discover-city', null);
check('POST null body         → 400', r.status, 400);

// 12. Reject random `test city`-style noise (missing required fields)
r = await req('POST', '/api/discover-city', { query: 'test city' });
check('POST {query:...}       → 400 invalid', r.status, 400);

// 13. Add a second real city
r = await req('POST', '/api/discover-city', {
    ar: 'بور دو بوك', en: 'Port-de-Bouc', cc: 'fr', slug: 'port-de-bouc',
    lat: 43.404, lng: 4.989, country: 'فرنسا', countryEn: 'France', type: 'city'
});
check('POST Port-de-Bouc      → ok added', r.body, { ok: true, added: true });

// 14. GET returns both
r = await req('GET', '/api/discovered-cities');
const slugs = (Array.isArray(r.body) ? r.body : []).map(c => c.slug).sort();
check('GET (2 items)          → [le-pontet, new-gov, port-de-bouc]',
    slugs, ['le-pontet', 'new-gov', 'port-de-bouc']);

// Restore the file
writeFileSync(DB_PATH, ORIG, 'utf8');

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
