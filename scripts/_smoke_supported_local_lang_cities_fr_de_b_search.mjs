// Search smoke for FR-DE-B wave
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
    // FR-B EN queries
    { q: 'Montreuil', slug: 'montreuil' },
    { q: 'Boulogne-Billancourt', slug: 'boulogne-billancourt' },
    { q: 'Argenteuil', slug: 'argenteuil' },
    { q: 'Roubaix', slug: 'roubaix' },
    { q: 'Tourcoing', slug: 'tourcoing' },
    { q: 'Nanterre', slug: 'nanterre' },
    { q: 'Troyes', slug: 'troyes' },
    { q: 'Annecy', slug: 'annecy' },
    { q: 'Lorient', slug: 'lorient' },
    // DE-B EN queries
    { q: 'Zwickau', slug: 'zwickau' },
    { q: 'Kaiserslautern', slug: 'kaiserslautern' },
    { q: 'Esslingen', slug: 'esslingen' },
    { q: 'Konstanz', slug: 'konstanz' },
    { q: 'Bamberg', slug: 'bamberg' },
    { q: 'Bayreuth', slug: 'bayreuth' },
    // Local-name queries (accented)
    { q: 'Créteil', slug: 'creteil' },
    { q: 'Chambéry', slug: 'chambery' },
    { q: 'Évreux', slug: 'evreux' },
    { q: 'Tübingen', slug: 'tuebingen' },
    { q: 'Düren', slug: 'dueren' },
    { q: 'Gütersloh', slug: 'guetersloh' },
    // Arabic queries
    { q: 'تسفيكاو', slug: 'zwickau' },
    { q: 'كايزرسلاوترن', slug: 'kaiserslautern' },
    { q: 'بامبرغ', slug: 'bamberg' },
    { q: 'مونتروي', slug: 'montreuil' }
];

console.log('═══ FR-DE-B Search Smoke ═══\n');

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
