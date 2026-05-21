// SSR + search smoke for SUPPORTED-LOCAL-LANG-CITIES-ES-LATAM-FAST
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
    // Top ES (5)
    { url: '/es/prayer-times-in-palma',                       expect: 'Palma' },
    { url: '/es/prayer-times-in-las-palmas-de-gran-canaria',  expect: 'Las Palmas de Gran Canaria' },
    { url: '/es/prayer-times-in-alicante',                    expect: 'Alicante' },
    { url: '/es/prayer-times-in-hospitalet-de-llobregat',     expect: "L'Hospitalet de Llobregat" },
    { url: '/es/prayer-times-in-vitoria-gasteiz',             expect: 'Vitoria-Gasteiz' },
    // Top MX (5)
    { url: '/es/prayer-times-in-leon-mx',                     expect: 'León' },
    { url: '/es/prayer-times-in-chihuahua',                   expect: 'Chihuahua' },
    { url: '/es/prayer-times-in-san-luis-potosi',             expect: 'San Luis Potosí' },
    { url: '/es/prayer-times-in-mexicali',                    expect: 'Mexicali' },
    { url: '/es/prayer-times-in-toluca',                      expect: 'Toluca' },
    // Top AR (4)
    { url: '/es/prayer-times-in-cordoba-ar',                  expect: 'Córdoba' },
    { url: '/es/prayer-times-in-rosario',                     expect: 'Rosario' },
    { url: '/es/prayer-times-in-mar-del-plata',               expect: 'Mar del Plata' },
    { url: '/es/prayer-times-in-bahia-blanca',                expect: 'Bahía Blanca' },
    // Top CO (4)
    { url: '/es/prayer-times-in-medellin',                    expect: 'Medellín' },
    { url: '/es/prayer-times-in-cali',                        expect: 'Cali' },
    { url: '/es/prayer-times-in-cartagena-co',                expect: 'Cartagena' },
    { url: '/es/prayer-times-in-barranquilla',                expect: 'Barranquilla' },
    // Top PE (3)
    { url: '/es/prayer-times-in-trujillo',                    expect: 'Trujillo' },
    { url: '/es/prayer-times-in-huancayo',                    expect: 'Huancayo' },
    { url: '/es/prayer-times-in-pucallpa',                    expect: 'Pucallpa' },
    // Top CL (3)
    { url: '/es/prayer-times-in-valparaiso',                  expect: 'Valparaíso' },
    { url: '/es/prayer-times-in-concepcion',                  expect: 'Concepción' },
    { url: '/es/prayer-times-in-antofagasta',                 expect: 'Antofagasta' },
    // Top VE (3)
    { url: '/es/prayer-times-in-maracaibo',                   expect: 'Maracaibo' },
    { url: '/es/prayer-times-in-valencia-ve',                 expect: 'Valencia' },
    { url: '/es/prayer-times-in-ciudad-guayana',              expect: 'Ciudad Guayana' },
    // Arabic baseline (5)
    { url: '/prayer-times-in-medellin',                       expect: 'ميديلين' },
    { url: '/prayer-times-in-maracaibo',                      expect: 'ماراكايبو' },
    { url: '/prayer-times-in-cordoba-ar',                     expect: 'كوردوبا' },
    { url: '/prayer-times-in-trujillo',                       expect: 'تروخيو' },
    { url: '/prayer-times-in-valparaiso',                     expect: 'فالبارايسو' },
    // English baseline (2)
    { url: '/en/prayer-times-in-cartagena-co',                expect: 'Cartagena' },
    { url: '/en/prayer-times-in-a-coruna',                    expect: 'A Coruna' },
    // Disambiguation: existing entries still resolve
    { url: '/es/prayer-times-in-cordoba',                     expect: 'Córdoba' },       // ES Córdoba
    { url: '/es/prayer-times-in-cordoba-mx',                  expect: 'Córdoba' },       // MX Córdoba
    { url: '/es/prayer-times-in-cartagena',                   expect: 'Cartagena' },     // ES Cartagena
    { url: '/es/prayer-times-in-valencia',                    expect: 'Valencia' },      // ES Valencia
    { url: '/es/prayer-times-in-leon',                        expect: 'León' },          // ES León
    // Regression: pre-existing IN/ID/MY/PK/BD/FR/DE
    { url: '/id/prayer-times-in-malang',                      expect: 'Kota Malang' },
    { url: '/ms/prayer-times-in-kuala-lumpur',                expect: 'Kuala Lumpur' },
    { url: '/ms/prayer-times-in-putrajaya',                   expect: 'Putrajaya' },
    { url: '/ur/prayer-times-in-karachi',                     expect: 'کراچی' },
    { url: '/bn/prayer-times-in-dhaka',                       expect: 'ঢাকা' },
    { url: '/ur/prayer-times-in-jalgaon',                     expect: 'جلگاؤں' },
    { url: '/bn/prayer-times-in-thrissur',                    expect: 'তৃশূর' },
    { url: '/fr/prayer-times-in-strasbourg',                  expect: 'Strasbourg' },
    { url: '/de/prayer-times-in-dresden',                     expect: 'Dresden' },
    { url: '/fr/prayer-times-in-saint-denis-fr',              expect: 'Saint-Denis' },
    { url: '/de/prayer-times-in-zwickau',                     expect: 'Zwickau' },
    { url: '/ur/prayer-times-in-gwangju',                     expect: 'Gwangju' }
];

console.log('═══ ES-LATAM SSR Smoke ═══\n');

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
