// SSR + search smoke for SUPPORTED-LOCAL-LANG-CITIES-FR-DE-B-FAST
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
    // Top 10 FR-B
    { url: '/fr/prayer-times-in-montreuil',             expect: 'Montreuil' },
    { url: '/fr/prayer-times-in-boulogne-billancourt',  expect: 'Boulogne-Billancourt' },
    { url: '/fr/prayer-times-in-argenteuil',            expect: 'Argenteuil' },
    { url: '/fr/prayer-times-in-roubaix',               expect: 'Roubaix' },
    { url: '/fr/prayer-times-in-tourcoing',             expect: 'Tourcoing' },
    { url: '/fr/prayer-times-in-saint-denis-fr',        expect: 'Saint-Denis' },
    { url: '/fr/prayer-times-in-nanterre',              expect: 'Nanterre' },
    { url: '/fr/prayer-times-in-creteil',               expect: 'Créteil' },
    { url: '/fr/prayer-times-in-chambery',              expect: 'Chambéry' },
    { url: '/fr/prayer-times-in-troyes',                expect: 'Troyes' },
    // Top 10 DE-B
    { url: '/de/prayer-times-in-zwickau',               expect: 'Zwickau' },
    { url: '/de/prayer-times-in-kaiserslautern',        expect: 'Kaiserslautern' },
    { url: '/de/prayer-times-in-guetersloh',            expect: 'Gütersloh' },
    { url: '/de/prayer-times-in-dueren',                expect: 'Düren' },
    { url: '/de/prayer-times-in-esslingen',             expect: 'Esslingen' },
    { url: '/de/prayer-times-in-tuebingen',             expect: 'Tübingen' },
    { url: '/de/prayer-times-in-hanau',                 expect: 'Hanau am Main' },
    { url: '/de/prayer-times-in-marburg',               expect: 'Marburg an der Lahn' },
    { url: '/de/prayer-times-in-konstanz',              expect: 'Konstanz' },
    { url: '/de/prayer-times-in-bamberg',               expect: 'Bamberg' },
    // Arabic baseline
    { url: '/prayer-times-in-montreuil',                expect: 'مونتروي' },
    { url: '/prayer-times-in-saint-denis-fr',           expect: 'سان دوني' },
    { url: '/prayer-times-in-troyes',                   expect: 'تروا' },
    { url: '/prayer-times-in-annecy',                   expect: 'أنيسي' },
    { url: '/prayer-times-in-zwickau',                  expect: 'تسفيكاو' },
    { url: '/prayer-times-in-kaiserslautern',           expect: 'كايزرسلاوترن' },
    { url: '/prayer-times-in-bamberg',                  expect: 'بامبرغ' },
    // English baseline
    { url: '/en/prayer-times-in-creteil',               expect: 'Creteil' },
    { url: '/en/prayer-times-in-tuebingen',             expect: 'Tubingen' },
    { url: '/en/prayer-times-in-hanau',                 expect: 'Hanau' },
    // Disambiguation regression: laval (CA) vs laval-fr (FR)
    { url: '/prayer-times-in-laval',                    expect: 'Laval' },        // CA Laval
    { url: '/fr/prayer-times-in-laval-fr',              expect: 'Laval' },        // FR Laval
    // Wave A still works
    { url: '/fr/prayer-times-in-strasbourg',            expect: 'Strasbourg' },
    { url: '/de/prayer-times-in-dresden',               expect: 'Dresden' },
    // Regression — pre-existing entries
    { url: '/id/prayer-times-in-malang',                expect: 'Kota Malang' },
    { url: '/ms/prayer-times-in-kuala-lumpur',          expect: 'Kuala Lumpur' },
    { url: '/ms/prayer-times-in-putrajaya',             expect: 'Putrajaya' },
    { url: '/ur/prayer-times-in-karachi',               expect: 'کراچی' },
    { url: '/bn/prayer-times-in-dhaka',                 expect: 'ঢাকা' },
    { url: '/ur/prayer-times-in-jalgaon',               expect: 'جلگاؤں' },
    { url: '/bn/prayer-times-in-thrissur',              expect: 'তৃশূর' },
    { url: '/ur/prayer-times-in-gwangju',               expect: 'Gwangju' }
];

console.log('═══ FR-DE-B SSR Smoke ═══\n');

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
