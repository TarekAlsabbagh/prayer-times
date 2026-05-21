// SSR + search smoke for SUPPORTED-LOCAL-LANG-CITIES-TR-FAST
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
    // Top 10 TR-FAST × /tr/
    { url: '/tr/prayer-times-in-eskisehir',      expect: 'Eskişehir' },
    { url: '/tr/prayer-times-in-malatya',        expect: 'Malatya' },
    { url: '/tr/prayer-times-in-van',            expect: 'Van' },
    { url: '/tr/prayer-times-in-batman',         expect: 'Batman' },
    { url: '/tr/prayer-times-in-elazig',         expect: 'Elazığ' },
    { url: '/tr/prayer-times-in-antakya',        expect: 'Antakya' },
    { url: '/tr/prayer-times-in-samsun',         expect: 'Samsun' },
    { url: '/tr/prayer-times-in-kahramanmaras',  expect: 'Kahramanmaraş' },
    { url: '/tr/prayer-times-in-alanya',         expect: 'Alanya' },
    { url: '/tr/prayer-times-in-tarsus',         expect: 'Tarsus' },
    // Arabic baseline (5)
    { url: '/prayer-times-in-eskisehir',         expect: 'أسكي شهر' },
    { url: '/prayer-times-in-malatya',           expect: 'ملاطية' },
    { url: '/prayer-times-in-antakya',           expect: 'أنطاكيا' },
    { url: '/prayer-times-in-tarsus',            expect: 'طرسوس' },
    { url: '/prayer-times-in-aksaray',           expect: 'أق سراي' },
    // English baseline (3)
    { url: '/en/prayer-times-in-eskisehir',      expect: 'Eskisehir' },
    { url: '/en/prayer-times-in-kahramanmaras',  expect: 'Kahramanmaras' },
    { url: '/en/prayer-times-in-kuetahya',       expect: 'Kutahya' },
    // Pre-existing TR regression (must still work)
    { url: '/tr/prayer-times-in-istanbul',       expect: 'İstanbul' },
    { url: '/tr/prayer-times-in-izmir',          expect: 'İzmir' },
    { url: '/tr/prayer-times-in-diyarbakir',     expect: 'Diyarbakır' },
    { url: '/tr/prayer-times-in-sanliurfa',      expect: 'Şanlıurfa' },
    // Regression: pre-existing IN/ID/MY/PK/BD/FR/DE/ES-LATAM
    { url: '/id/prayer-times-in-malang',         expect: 'Kota Malang' },
    { url: '/ms/prayer-times-in-kuala-lumpur',   expect: 'Kuala Lumpur' },
    { url: '/ms/prayer-times-in-putrajaya',      expect: 'Putrajaya' },
    { url: '/ur/prayer-times-in-karachi',        expect: 'کراچی' },
    { url: '/bn/prayer-times-in-dhaka',          expect: 'ঢাকা' },
    { url: '/ur/prayer-times-in-jalgaon',        expect: 'جلگاؤں' },
    { url: '/bn/prayer-times-in-thrissur',       expect: 'তৃশূর' },
    { url: '/fr/prayer-times-in-strasbourg',     expect: 'Strasbourg' },
    { url: '/de/prayer-times-in-dresden',        expect: 'Dresden' },
    { url: '/fr/prayer-times-in-saint-denis-fr', expect: 'Saint-Denis' },
    { url: '/de/prayer-times-in-zwickau',        expect: 'Zwickau' },
    { url: '/es/prayer-times-in-medellin',       expect: 'Medellín' },
    { url: '/es/prayer-times-in-cordoba-ar',     expect: 'Córdoba' },
    { url: '/es/prayer-times-in-cartagena-co',   expect: 'Cartagena' },
    { url: '/es/prayer-times-in-valencia-ve',    expect: 'Valencia' },
    { url: '/ur/prayer-times-in-gwangju',        expect: 'Gwangju' }
];

console.log('═══ TR-FAST SSR Smoke ═══\n');

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
