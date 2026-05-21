// Search smoke for TR-B-FAST wave
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
    { q: 'Manisa', slug: 'manisa' },
    { q: 'Duzce', slug: 'duezce' },
    { q: 'Canakkale', slug: 'canakkale' },
    { q: 'Tokat', slug: 'tokat' },
    { q: 'Tekirdag', slug: 'tekirdag' },
    { q: 'Kastamonu', slug: 'kastamonu' },
    { q: 'Nusaybin', slug: 'nusaybin' },
    { q: 'Aydın', slug: 'aydin' },
    { q: 'Düzce', slug: 'duezce' },
    { q: 'Çanakkale', slug: 'canakkale' },
    { q: 'Tekirdağ', slug: 'tekirdag' },
    { q: 'Muğla', slug: 'mugla' },
    { q: 'Iğdır', slug: 'igdir' },
    { q: 'Nevşehir', slug: 'nevsehir' },
    { q: 'مانيسا', slug: 'manisa' },
    { q: 'جناق قلعة', slug: 'canakkale' },
    { q: 'السويدية', slug: 'samandag' },
    { q: 'نصيبين', slug: 'nusaybin' },
    { q: 'سعرد', slug: 'siirt' },
    { q: 'كلس', slug: 'kilis' }
];

console.log('═══ TR-B-FAST Search Smoke ═══\n');

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
