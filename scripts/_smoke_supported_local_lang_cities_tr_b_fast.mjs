// SSR + search smoke for SUPPORTED-LOCAL-LANG-CITIES-TR-B-FAST
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
    // Top 10 TR-B × /tr/
    { url: '/tr/prayer-times-in-manisa',      expect: 'Manisa' },
    { url: '/tr/prayer-times-in-duezce',      expect: 'Düzce' },
    { url: '/tr/prayer-times-in-aydin',       expect: 'Aydın' },
    { url: '/tr/prayer-times-in-canakkale',   expect: 'Çanakkale' },
    { url: '/tr/prayer-times-in-bingoel',     expect: 'Bingöl' },
    { url: '/tr/prayer-times-in-tekirdag',    expect: 'Tekirdağ' },
    { url: '/tr/prayer-times-in-mugla',       expect: 'Muğla' },
    { url: '/tr/prayer-times-in-igdir',       expect: 'Iğdır' },
    { url: '/tr/prayer-times-in-nevsehir',    expect: 'Nevşehir' },
    { url: '/tr/prayer-times-in-nusaybin',    expect: 'Nusaybin' },
    // Arabic baseline (5)
    { url: '/prayer-times-in-manisa',         expect: 'مانيسا' },
    { url: '/prayer-times-in-canakkale',      expect: 'جناق قلعة' },
    { url: '/prayer-times-in-samandag',       expect: 'السويدية' },
    { url: '/prayer-times-in-nusaybin',       expect: 'نصيبين' },
    { url: '/prayer-times-in-siirt',          expect: 'سعرد' },
    // English baseline (3)
    { url: '/en/prayer-times-in-manisa',      expect: 'Manisa' },
    { url: '/en/prayer-times-in-duezce',      expect: 'Duzce' },
    { url: '/en/prayer-times-in-canakkale',   expect: 'Canakkale' },
    // Pre-existing 14 TR regression
    { url: '/tr/prayer-times-in-istanbul',    expect: 'İstanbul' },
    { url: '/tr/prayer-times-in-izmir',       expect: 'İzmir' },
    { url: '/tr/prayer-times-in-diyarbakir',  expect: 'Diyarbakır' },
    { url: '/tr/prayer-times-in-sanliurfa',   expect: 'Şanlıurfa' },
    // TR-FAST regression (30 from Sub-phase C)
    { url: '/tr/prayer-times-in-eskisehir',   expect: 'Eskişehir' },
    { url: '/tr/prayer-times-in-malatya',     expect: 'Malatya' },
    { url: '/tr/prayer-times-in-antakya',     expect: 'Antakya' },
    { url: '/tr/prayer-times-in-batman',      expect: 'Batman' },
    // Cross-country regression
    { url: '/id/prayer-times-in-malang',      expect: 'Kota Malang' },
    { url: '/ms/prayer-times-in-kuala-lumpur',expect: 'Kuala Lumpur' },
    { url: '/ms/prayer-times-in-putrajaya',   expect: 'Putrajaya' },
    { url: '/ur/prayer-times-in-karachi',     expect: 'کراچی' },
    { url: '/bn/prayer-times-in-dhaka',       expect: 'ঢাকা' },
    { url: '/ur/prayer-times-in-jalgaon',     expect: 'جلگاؤں' },
    { url: '/bn/prayer-times-in-thrissur',    expect: 'তৃশূর' },
    { url: '/fr/prayer-times-in-strasbourg',  expect: 'Strasbourg' },
    { url: '/de/prayer-times-in-dresden',     expect: 'Dresden' },
    { url: '/es/prayer-times-in-medellin',    expect: 'Medellín' },
    { url: '/es/prayer-times-in-cordoba-ar',  expect: 'Córdoba' },
    { url: '/ur/prayer-times-in-gwangju',     expect: 'Gwangju' }
];

console.log('═══ TR-B-FAST SSR Smoke ═══\n');

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
