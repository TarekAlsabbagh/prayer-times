// SSR + search smoke for SUPPORTED-LOCAL-LANG-CITIES-FR-DE-FAST
// Top 10 FR × /fr/ + Top 10 DE × /de/ + Arabic baseline + 6 regression cases.
import { request } from 'node:http';
const HOST = 'localhost', PORT = 8080;
let pass = 0, fail = 0;
const ok = (l, b, e) => { (b ? pass++ : fail++); console.log((b ? '  ✓ ' : '  ✗ ') + l + (e ? ' [' + e + ']' : '')); };

function get(path) {
    return new Promise((resolve, reject) => {
        const req = request({ host: HOST, port: PORT, path, method: 'GET' }, res => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
        });
        req.on('error', reject);
        req.end();
    });
}

const CASES = [
    // Top 10 FR cities — /fr/
    { url: '/fr/prayer-times-in-strasbourg',    expect: 'Strasbourg' },
    { url: '/fr/prayer-times-in-montpellier',   expect: 'Montpellier' },
    { url: '/fr/prayer-times-in-lille',         expect: 'Lille' },
    { url: '/fr/prayer-times-in-reims',         expect: 'Reims' },
    { url: '/fr/prayer-times-in-angers',        expect: 'Angers' },
    { url: '/fr/prayer-times-in-nimes',         expect: 'Nîmes' },
    { url: '/fr/prayer-times-in-brest',         expect: 'Brest' },
    { url: '/fr/prayer-times-in-amiens',        expect: 'Amiens' },
    { url: '/fr/prayer-times-in-limoges',       expect: 'Limoges' },
    { url: '/fr/prayer-times-in-mulhouse',      expect: 'Mulhouse' },
    // Top 10 DE cities — /de/
    { url: '/de/prayer-times-in-dresden',       expect: 'Dresden' },
    { url: '/de/prayer-times-in-leipzig',       expect: 'Leipzig' },
    { url: '/de/prayer-times-in-muenster',      expect: 'Münster' },
    { url: '/de/prayer-times-in-wiesbaden',     expect: 'Wiesbaden' },
    { url: '/de/prayer-times-in-braunschweig',  expect: 'Braunschweig' },
    { url: '/de/prayer-times-in-magdeburg',     expect: 'Magdeburg' },
    { url: '/de/prayer-times-in-oberhausen',    expect: 'Oberhausen' },
    { url: '/de/prayer-times-in-erfurt',        expect: 'Erfurt' },
    { url: '/de/prayer-times-in-saarbruecken',  expect: 'Saarbrücken' },
    { url: '/de/prayer-times-in-fuerth',        expect: 'Fürth' },
    // Arabic baseline (3 each)
    { url: '/prayer-times-in-strasbourg',       expect: 'ستراسبورغ' },
    { url: '/prayer-times-in-lille',            expect: 'ليل' },
    { url: '/prayer-times-in-cannes',           expect: 'كان' },
    { url: '/prayer-times-in-dresden',          expect: 'دريسدن' },
    { url: '/prayer-times-in-leipzig',          expect: 'لايبزغ' },
    { url: '/prayer-times-in-jena',             expect: 'يينا' },
    // English baseline (2 each)
    { url: '/en/prayer-times-in-montpellier',   expect: 'Montpellier' },
    { url: '/en/prayer-times-in-dunkirk',       expect: 'Dunkirk' },
    { url: '/en/prayer-times-in-braunschweig',  expect: 'Brunswick' },
    { url: '/en/prayer-times-in-muenster',      expect: 'Munster' },
    // Regression: pre-existing entries must still resolve correctly
    { url: '/id/prayer-times-in-malang',        expect: 'Kota Malang' },
    { url: '/ms/prayer-times-in-kuala-lumpur',  expect: 'Kuala Lumpur' },
    { url: '/ms/prayer-times-in-putrajaya',     expect: 'Putrajaya' },
    { url: '/ur/prayer-times-in-karachi',       expect: 'کراچی' },
    { url: '/bn/prayer-times-in-dhaka',         expect: 'ঢাকা' },
    { url: '/ur/prayer-times-in-jalgaon',       expect: 'جلگاؤں' },     // IN-D wave
    { url: '/bn/prayer-times-in-thrissur',      expect: 'তৃশূর' },     // IN-E wave
    { url: '/ur/prayer-times-in-gwangju',       expect: 'Gwangju' }     // fallback (KR has no UR)
];

console.log('═══ FR-DE SSR Smoke ═══\n');

let i = 0;
for (const c of CASES) {
    i++;
    try {
        const r = await get(c.url);
        const has200 = r.status === 200;
        const hasExpected = r.body.includes(c.expect);
        ok(`[${i}/${CASES.length}] ${c.url} → "${c.expect}"`, has200 && hasExpected,
           !has200 ? 'HTTP ' + r.status : (!hasExpected ? 'missing' : ''));
    } catch (e) {
        ok(`[${i}/${CASES.length}] ${c.url}`, false, e.message);
    }
}

console.log('\n══════════════════════════════════════');
console.log(' SSR Smoke: ' + pass + ' passed, ' + fail + ' failed (' + (pass+fail) + ')');
console.log('══════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
