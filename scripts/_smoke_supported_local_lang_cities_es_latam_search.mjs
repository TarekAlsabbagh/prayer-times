// Search smoke for ES-LATAM wave
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
    // EN
    { q: 'Palma', slug: 'palma' },
    { q: 'Alicante', slug: 'alicante' },
    { q: 'Vigo', slug: 'vigo' },
    { q: 'León', slug: 'leon-mx' },
    { q: 'Mexicali', slug: 'mexicali' },
    { q: 'Rosario', slug: 'rosario' },
    { q: 'Mar del Plata', slug: 'mar-del-plata' },
    { q: 'Medellín', slug: 'medellin' },
    { q: 'Cali', slug: 'cali' },
    { q: 'Trujillo', slug: 'trujillo' },
    { q: 'Valparaíso', slug: 'valparaiso' },
    { q: 'Maracaibo', slug: 'maracaibo' },
    // ES with accent
    { q: 'Medellín', slug: 'medellin' },
    { q: 'Córdoba', slug: 'cordoba' },     // ES Córdoba should rank first
    { q: 'Cúcuta', slug: 'cucuta' },
    { q: 'Bahía Blanca', slug: 'bahia-blanca' },
    { q: 'San Luis Potosí', slug: 'san-luis-potosi' },
    // Arabic
    { q: 'ميديلين', slug: 'medellin' },
    { q: 'ماراكايبو', slug: 'maracaibo' },
    { q: 'تروخيو', slug: 'trujillo' },
    { q: 'فالبارايسو', slug: 'valparaiso' },
    { q: 'بارانكييا', slug: 'barranquilla' }
];

console.log('═══ ES-LATAM Search Smoke ═══\n');

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
