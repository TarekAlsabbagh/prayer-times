// Search smoke for ASIA-1H-MY: top 15 cities via /api/search-place.
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
    // Top 15 MY new cities — query by EN name + expect that slug in first 5 results
    { q: 'Subang Jaya', slug: 'subang-jaya' },
    { q: 'Iskandar Puteri', slug: 'iskandar-puteri' },
    { q: 'Sungai Petani', slug: 'sungai-petani' },
    { q: 'Kota Kuala Muda', slug: 'kota-kuala-muda' },
    { q: 'Puchong', slug: 'puchong' },
    { q: 'Kluang', slug: 'kluang' },
    { q: 'Muar', slug: 'muar' },
    { q: 'Klang', slug: 'klang' },
    { q: 'Kajang', slug: 'kajang' },
    { q: 'Teluk Intan', slug: 'teluk-intan' },
    { q: 'Taiping', slug: 'taiping' },
    { q: 'Putrajaya', slug: 'putrajaya' },
    { q: 'Cyberjaya', slug: 'cyberjaya' },
    { q: 'Butterworth', slug: 'butterworth' },
    { q: 'Bintulu', slug: 'bintulu' },
    // Arabic — query Arabic names
    { q: 'سوبانغ جايا', slug: 'subang-jaya' },
    { q: 'كلانغ', slug: 'klang' },
    { q: 'بوتراجايا', slug: 'putrajaya' }
];

console.log('═══ ASIA-1H-MY Search Smoke ═══\n');

let i = 0;
for (const c of QUERIES) {
    i++;
    try {
        const r = await get('/api/search-place?q=' + encodeURIComponent(c.q) + '&limit=8');
        if (!r.json || !Array.isArray(r.json.results)) {
            ok(`[${i}] q="${c.q}" → expect slug=${c.slug}`, false, 'no results array');
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
