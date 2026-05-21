// Search smoke for TR-FAST wave
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
    // EN ASCII
    { q: 'Eskisehir', slug: 'eskisehir' },
    { q: 'Malatya', slug: 'malatya' },
    { q: 'Van', slug: 'van' },
    { q: 'Samsun', slug: 'samsun' },
    { q: 'Antakya', slug: 'antakya' },
    { q: 'Alanya', slug: 'alanya' },
    { q: 'Tarsus', slug: 'tarsus' },
    { q: 'Edirne', slug: 'edirne' },
    // TR with diacritics
    { q: 'Eskişehir', slug: 'eskisehir' },
    { q: 'Kahramanmaraş', slug: 'kahramanmaras' },
    { q: 'Çorum', slug: 'corum' },
    { q: 'İzmit', slug: 'izmit' },
    { q: 'Elazığ', slug: 'elazig' },
    { q: 'Kütahya', slug: 'kuetahya' },
    { q: 'Adıyaman', slug: 'adiyaman' },
    { q: 'Balıkesir', slug: 'balikesir' },
    // Arabic
    { q: 'أسكي شهر', slug: 'eskisehir' },
    { q: 'ملاطية', slug: 'malatya' },
    { q: 'أنطاكيا', slug: 'antakya' },
    { q: 'طرسوس', slug: 'tarsus' },
    { q: 'أق سراي', slug: 'aksaray' },
    { q: 'باتمان', slug: 'batman' }
];

console.log('═══ TR-FAST Search Smoke ═══\n');

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
