// Search smoke for FR-DE wave: top cities via /api/search-place
import { request } from 'node:http';
const HOST = 'localhost', PORT = 8080;
let pass = 0, fail = 0;
const ok = (l, b, e) => { (b ? pass++ : fail++); console.log((b ? '  ✓ ' : '  ✗ ') + l + (e ? ' [' + e + ']' : '')); };

function get(path) {
    return new Promise((resolve, reject) => {
        const req = request({ host: HOST, port: PORT, path, method: 'GET' }, res => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                try { resolve({ status: res.statusCode, json: JSON.parse(Buffer.concat(chunks).toString('utf8')) }); }
                catch (e) { resolve({ status: res.statusCode, error: e.message }); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

const QUERIES = [
    // FR EN-name queries
    { q: 'Strasbourg', slug: 'strasbourg' },
    { q: 'Montpellier', slug: 'montpellier' },
    { q: 'Lille', slug: 'lille' },
    { q: 'Reims', slug: 'reims' },
    { q: 'Amiens', slug: 'amiens' },
    { q: 'Cannes', slug: 'cannes' },
    { q: 'Versailles', slug: 'versailles' },
    { q: 'Dunkirk', slug: 'dunkirk' },
    // DE EN-name queries
    { q: 'Dresden', slug: 'dresden' },
    { q: 'Leipzig', slug: 'leipzig' },
    { q: 'Wiesbaden', slug: 'wiesbaden' },
    { q: 'Magdeburg', slug: 'magdeburg' },
    { q: 'Potsdam', slug: 'potsdam' },
    { q: 'Erlangen', slug: 'erlangen' },
    // Local-name queries
    { q: 'Nîmes', slug: 'nimes' },
    { q: 'Béziers', slug: 'beziers' },
    { q: 'Münster', slug: 'muenster' },
    { q: 'Saarbrücken', slug: 'saarbruecken' },
    { q: 'Fürth', slug: 'fuerth' },
    // Arabic queries
    { q: 'ستراسبورغ', slug: 'strasbourg' },
    { q: 'دريسدن', slug: 'dresden' },
    { q: 'لايبزغ', slug: 'leipzig' }
];

console.log('═══ FR-DE Search Smoke ═══\n');

let i = 0;
for (const c of QUERIES) {
    i++;
    try {
        const r = await get('/api/search-place?q=' + encodeURIComponent(c.q) + '&limit=8');
        if (!r.json || !Array.isArray(r.json.results)) {
            ok(`[${i}] q="${c.q}"`, false, 'no results array');
            continue;
        }
        const slugs = r.json.results.map(x => x.slug);
        const top5 = slugs.slice(0, 5);
        ok(`[${i}] q="${c.q}" → top-5 includes ${c.slug}`, top5.includes(c.slug),
           top5.includes(c.slug) ? '' : 'top: ' + top5.join(','));
    } catch (e) {
        ok(`[${i}] q="${c.q}"`, false, e.message);
    }
}

console.log('\n══════════════════════════════════════');
console.log(' Search Smoke: ' + pass + ' passed, ' + fail + ' failed (' + (pass+fail) + ')');
console.log('══════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
