// SSR smoke for ASIA-1H-MY: top 10 MY cities × /ms/ + /en/ + regression cases.
import { request } from 'node:http';
const HOST = 'localhost', PORT = 8080;

let pass = 0, fail = 0;
const ok = (l, b, e) => { (b ? pass++ : fail++); console.log((b ? '  ✓ ' : '  ✗ ') + l + (e ? ' [' + e + ']' : '')); };

function get(path) {
    return new Promise((resolve, reject) => {
        const req = request({ host: HOST, port: PORT, path, method: 'GET' }, res => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), headers: res.headers }));
        });
        req.on('error', reject);
        req.end();
    });
}

const CASES = [
    // Top 10 MY new cities under /ms/
    { url: '/ms/prayer-times-in-subang-jaya',       expect: 'Subang Jaya' },
    { url: '/ms/prayer-times-in-iskandar-puteri',   expect: 'Iskandar Puteri' },
    { url: '/ms/prayer-times-in-klang',             expect: 'Klang' },
    { url: '/ms/prayer-times-in-kajang',            expect: 'Kajang' },
    { url: '/ms/prayer-times-in-puchong',           expect: 'Puchong' },
    { url: '/ms/prayer-times-in-taiping',           expect: 'Taiping' },
    { url: '/ms/prayer-times-in-putrajaya',         expect: 'Putrajaya' },
    { url: '/ms/prayer-times-in-cyberjaya',         expect: 'Cyberjaya' },
    { url: '/ms/prayer-times-in-butterworth',       expect: 'Butterworth' },
    { url: '/ms/prayer-times-in-sungai-petani',     expect: 'Sungai Petani' },
    // Arabic baseline
    { url: '/prayer-times-in-subang-jaya',         expect: 'سوبانغ جايا' },
    { url: '/prayer-times-in-klang',               expect: 'كلانغ' },
    { url: '/prayer-times-in-putrajaya',           expect: 'بوتراجايا' },
    // English baseline
    { url: '/en/prayer-times-in-iskandar-puteri',  expect: 'Iskandar Puteri' },
    { url: '/en/prayer-times-in-cyberjaya',        expect: 'Cyberjaya' },
    // Regression — pre-existing entries
    { url: '/id/prayer-times-in-malang',           expect: 'Kota Malang' },
    { url: '/id/prayer-times-in-jakarta',          expect: 'Jakarta' },
    { url: '/id/prayer-times-in-yogyakarta',       expect: 'Yogyakarta' },
    { url: '/ur/prayer-times-in-karachi',          expect: 'کراچی' },
    { url: '/bn/prayer-times-in-dhaka',            expect: 'ঢাকা' },
    // Gwangju fallback: KR with no UR — should fall to EN "Gwangju" (NOT Korean script)
    { url: '/ur/prayer-times-in-gwangju',          expect: 'Gwangju' }
];

console.log('═══ ASIA-1H-MY SSR Smoke ═══\n');

let i = 0;
for (const c of CASES) {
    i++;
    try {
        const r = await get(c.url);
        const has200 = r.status === 200;
        const hasExpected = r.body.includes(c.expect);
        ok(`[${i}/${CASES.length}] ${c.url} → "${c.expect}"`, has200 && hasExpected, !has200 ? 'HTTP ' + r.status : (!hasExpected ? 'missing' : ''));
    } catch (e) {
        ok(`[${i}/${CASES.length}] ${c.url}`, false, e.message);
    }
}

console.log('\n══════════════════════════════════════');
console.log(' SSR Smoke: ' + pass + ' passed, ' + fail + ' failed (' + (pass+fail) + ')');
console.log('══════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
