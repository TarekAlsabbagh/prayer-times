// scripts/geodata/_supported_local_lang_cities_es_latam_fast_apply.mjs
//
// SUPPORTED-LOCAL-LANG-CITIES-ES-LATAM-FAST — Sub-phase B of
// SUPPORTED-LOCAL-LANG-CITIES-FINAL-FAST.
//
// Adds 59 cities across Spain + Spanish-speaking LATAM countries, each
// with EXACTLY the three supported UI langs required (per place-data-
// maintenance-policy §2):
//
//   ES, MX, AR, CO, PE, CL, VE → names.{ar, en, es}
//
// Defensive disambiguation slugs (collision with existing curated entries):
//   - cordoba-ar  (vs `cordoba` ES + `cordoba-mx` MX)
//   - cartagena-co (vs `cartagena` ES)
//   - valencia-ve  (vs `valencia` ES)
//
// Per-country admin1 codes (FIPS, empirically GeoNames):
//   ES: 07=Baleares, 51=Andalucía, 53=Canarias, 56=Cataluña, 58=Galicia,
//       59=País Vasco, 60=C. Valenciana
//   MX: 01=Aguascalientes, 02=Baja California, 06=Chihuahua, 07=Coahuila,
//       11=Guanajuato, 15=México (state), 22=Querétaro, 24=San Luis Potosí,
//       28=Tamaulipas
//   AR: 01=Buenos Aires, 03=Chaco, 05=Córdoba, 06=Corrientes, 13=Mendoza,
//       15=Neuquén, 18=San Juan, 21=Santa Fe, 24=Tucumán
//   CO: 02=Antioquia, 04=Atlántico, 21=Norte Santander, 24=Risaralda,
//       26=Santander, 28=Tolima, 29=Valle del Cauca, 35=Bolívar,
//       37=Caldas, 38=Magdalena
//   PE: 06=Cajamarca, 12=Junín, 13=La Libertad, 23=Tacna, 25=Ucayali
//   CL: 01=Valparaíso, 03=Antofagasta, 04=Araucanía, 06=Biobío,
//       07=Coquimbo, 08=O'Higgins
//   VE: 04=Aragua, 06=Bolívar, 07=Carabobo, 23=Zulia
//
// All Mexican entries use timezone America/Mexico_City (default).
// AR cities use America/Argentina/Buenos_Aires.
// CO use America/Bogota. PE use America/Lima. CL use America/Santiago.
// VE use America/Caracas. ES use Europe/Madrid (except Canarias which
// uses Atlantic/Canary — Las Palmas).

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preSupportedEsLatamFast.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/supported-local-lang-cities-es-latam-fast-apply-report.json', import.meta.url);

const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
function isCleanArabic(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[؀-ۿ]/.test(s)) return false;
    if (/[ঀ-৿]|[A-Za-z]|[ऀ-ॿ]|[஀-௿]/.test(s)) return false;
    if (URDU_ONLY.test(s)) return false;
    return true;
}
function isCleanLatin(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[A-Za-z]/.test(s)) return false;
    if (/[؀-ۿ]|[ঀ-৿]/.test(s)) return false;
    return true;
}
function scriptGuard(value, lang) {
    if (lang === 'ar') return isCleanArabic(value);
    if (lang === 'en' || lang === 'es') return isCleanLatin(value);
    return false;
}

// ────────────────────────────────────────────────────────────────────────
// ES — 12 cities
// ────────────────────────────────────────────────────────────────────────
const ES_CITIES = [
    { slug: 'palma',                       geonameId: '2512989', lat: 39.56939, lng: 2.65024,   population: 438234, admin1: '07', region: 'Islas Baleares',           regionAr: 'جزر البليار',            timezone: 'Europe/Madrid', names: { ar: 'بالما',                     en: 'Palma',                    es: 'Palma' } },
    { slug: 'las-palmas-de-gran-canaria',  geonameId: '2515270', lat: 28.10178, lng: -15.41573, population: 383516, admin1: '53', region: 'Canarias',                  regionAr: 'جزر الكناري',            timezone: 'Atlantic/Canary', names: { ar: 'لاس بالماس دي غران كاناريا', en: 'Las Palmas de Gran Canaria', es: 'Las Palmas de Gran Canaria' } },
    { slug: 'alicante',                    geonameId: '2521978', lat: 38.34517, lng: -0.48149,  population: 348901, admin1: '60', region: 'Comunidad Valenciana',      regionAr: 'بلنسية',                 timezone: 'Europe/Madrid', names: { ar: 'أليكانتي',                  en: 'Alicante',                 es: 'Alicante' } },
    { slug: 'vigo',                        geonameId: '3105976', lat: 42.23282, lng: -8.72264,  population: 293642, admin1: '58', region: 'Galicia',                   regionAr: 'غاليثيا',                timezone: 'Europe/Madrid', names: { ar: 'فيغو',                      en: 'Vigo',                     es: 'Vigo' } },
    { slug: 'hospitalet-de-llobregat',     geonameId: '3120619', lat: 41.35967, lng: 2.10028,   population: 257038, admin1: '56', region: 'Cataluña',                  regionAr: 'كاتالونيا',              timezone: 'Europe/Madrid', names: { ar: 'أوسبيتاليت دي يوبريغات',    en: 'Hospitalet de Llobregat',  es: "L'Hospitalet de Llobregat" } },
    { slug: 'vitoria-gasteiz',             geonameId: '3104499', lat: 42.84998, lng: -2.67268,  population: 257407, admin1: '59', region: 'País Vasco',                regionAr: 'إقليم الباسك',           timezone: 'Europe/Madrid', names: { ar: 'فيتوريا-غاستيز',            en: 'Vitoria-Gasteiz',          es: 'Vitoria-Gasteiz' } },
    { slug: 'a-coruna',                    geonameId: '3119841', lat: 43.37135, lng: -8.396,    population: 250438, admin1: '58', region: 'Galicia',                   regionAr: 'غاليثيا',                timezone: 'Europe/Madrid', names: { ar: 'لا كورونيا',                en: 'A Coruna',                 es: 'A Coruña' } },
    { slug: 'terrassa',                    geonameId: '3108286', lat: 41.56667, lng: 2.01667,   population: 218535, admin1: '56', region: 'Cataluña',                  regionAr: 'كاتالونيا',              timezone: 'Europe/Madrid', names: { ar: 'تيراسا',                    en: 'Terrassa',                 es: 'Terrassa' } },
    { slug: 'jerez-de-la-frontera',        geonameId: '2516326', lat: 36.68645, lng: -6.13606,  population: 212879, admin1: '51', region: 'Andalucía',                 regionAr: 'الأندلس',                timezone: 'Europe/Madrid', names: { ar: 'خيريث دي لا فرونتيرا',     en: 'Jerez de la Frontera',     es: 'Jerez de la Frontera' } },
    { slug: 'sabadell',                    geonameId: '3111199', lat: 41.54329, lng: 2.10942,   population: 211734, admin1: '56', region: 'Cataluña',                  regionAr: 'كاتالونيا',              timezone: 'Europe/Madrid', names: { ar: 'سابادي',                    en: 'Sabadell',                 es: 'Sabadell' } },
    { slug: 'tarragona',                   geonameId: '3108288', lat: 41.11905, lng: 1.24544,   population: 141542, admin1: '56', region: 'Cataluña',                  regionAr: 'كاتالونيا',              timezone: 'Europe/Madrid', names: { ar: 'تاراغونا',                  en: 'Tarragona',                es: 'Tarragona' } },
    { slug: 'lleida',                      geonameId: '3118514', lat: 41.61674, lng: 0.62218,   population: 140797, admin1: '56', region: 'Cataluña',                  regionAr: 'كاتالونيا',              timezone: 'Europe/Madrid', names: { ar: 'ليدا',                      en: 'Lleida',                   es: 'Lleida' } }
];

// ────────────────────────────────────────────────────────────────────────
// MX — 8 cities (ciudad-juarez + santiago-de-queretaro already in
//                curated; leon-mx defensive slug vs ES `leon` gid 3118532)
// ────────────────────────────────────────────────────────────────────────
const MX_TZ = 'America/Mexico_City';
const MX_CITIES = [
    { slug: 'leon-mx',           geonameId: '3998655', lat: 21.12183, lng: -101.68253, population: 1579803, admin1: '11', region: 'Guanajuato',         regionAr: 'غواناخواتو',         timezone: MX_TZ, names: { ar: 'ليون',              en: 'León',                    es: 'León' } },
    { slug: 'chihuahua',         geonameId: '4014338', lat: 28.63528, lng: -106.08889, population: 925762,  admin1: '06', region: 'Chihuahua',          regionAr: 'تشيواوا',            timezone: MX_TZ, names: { ar: 'تشيواوا',           en: 'Chihuahua',               es: 'Chihuahua' } },
    { slug: 'san-luis-potosi',   geonameId: '3985606', lat: 22.15234, lng: -100.97135, population: 722772,  admin1: '24', region: 'San Luis Potosí',    regionAr: 'سان لويس بوتوسي',    timezone: MX_TZ, names: { ar: 'سان لويس بوتوسي',  en: 'San Luis Potosí',         es: 'San Luis Potosí' } },
    { slug: 'aguascalientes',    geonameId: '4019233', lat: 21.88262, lng: -102.2843,  population: 722250,  admin1: '01', region: 'Aguascalientes',     regionAr: 'أغواسكاليينتيس',     timezone: MX_TZ, names: { ar: 'أغواسكاليينتيس',    en: 'Aguascalientes',          es: 'Aguascalientes' } },
    { slug: 'saltillo',          geonameId: '3988086', lat: 25.42595, lng: -100.97963, population: 709671,  admin1: '07', region: 'Coahuila',           regionAr: 'كواويلا',            timezone: MX_TZ, names: { ar: 'ساتييو',            en: 'Saltillo',                es: 'Saltillo' } },
    { slug: 'toluca',            geonameId: '3515302', lat: 19.28786, lng: -99.65324,  population: 489333,  admin1: '15', region: 'México',             regionAr: 'ميخيكو',             timezone: MX_TZ, names: { ar: 'تولوكا',            en: 'Toluca',                  es: 'Toluca' } },
    { slug: 'mexicali',          geonameId: '3996069', lat: 32.62781, lng: -115.45446, population: 1032686, admin1: '02', region: 'Baja California',    regionAr: 'باها كاليفورنيا',    timezone: 'America/Tijuana', names: { ar: 'مكسيكالي',          en: 'Mexicali',                es: 'Mexicali' } },
    { slug: 'tampico',           geonameId: '3516355', lat: 22.28519, lng: -97.87777,  population: 309003,  admin1: '28', region: 'Tamaulipas',         regionAr: 'تاماوليباس',         timezone: MX_TZ, names: { ar: 'تامبيكو',           en: 'Tampico',                 es: 'Tampico' } }
];

// ────────────────────────────────────────────────────────────────────────
// AR — 12 cities (Argentine Córdoba → cordoba-ar disambiguation)
// ────────────────────────────────────────────────────────────────────────
const AR_TZ = 'America/Argentina/Buenos_Aires';
const AR_CITIES = [
    { slug: 'cordoba-ar',            geonameId: '3860259', lat: -31.40648, lng: -64.18853, population: 2106734, admin1: '05', region: 'Córdoba',     regionAr: 'كوردوبا',         timezone: 'America/Argentina/Cordoba',    names: { ar: 'كوردوبا',                  en: 'Córdoba',              es: 'Córdoba' } },
    { slug: 'rosario',               geonameId: '3838583', lat: -32.94682, lng: -60.63932, population: 948312,  admin1: '21', region: 'Santa Fe',    regionAr: 'سانتا في',         timezone: AR_TZ, names: { ar: 'روساريو',                 en: 'Rosario',              es: 'Rosario' } },
    { slug: 'mar-del-plata',         geonameId: '3430863', lat: -38.00042, lng: -57.5562,  population: 593337,  admin1: '01', region: 'Buenos Aires', regionAr: 'بوينس آيرس',     timezone: AR_TZ, names: { ar: 'مار ديل بلاتا',         en: 'Mar del Plata',        es: 'Mar del Plata' } },
    { slug: 'san-miguel-de-tucuman', geonameId: '3836873', lat: -26.81601, lng: -65.21051, population: 548866,  admin1: '24', region: 'Tucumán',     regionAr: 'توكومان',          timezone: 'America/Argentina/Tucuman',    names: { ar: 'سان ميغيل دي توكومان',    en: 'San Miguel de Tucumán', es: 'San Miguel de Tucumán' } },
    { slug: 'santa-fe',              geonameId: '3836277', lat: -31.64881, lng: -60.70868, population: 391164,  admin1: '21', region: 'Santa Fe',    regionAr: 'سانتا في',         timezone: AR_TZ, names: { ar: 'سانتا في',                en: 'Santa Fe',             es: 'Santa Fe' } },
    { slug: 'corrientes',            geonameId: '3435217', lat: -27.46784, lng: -58.8344,  population: 346334,  admin1: '06', region: 'Corrientes',  regionAr: 'كوريينتيس',        timezone: AR_TZ, names: { ar: 'كوريينتيس',               en: 'Corrientes',           es: 'Corrientes' } },
    { slug: 'bahia-blanca',          geonameId: '3865086', lat: -38.7176,  lng: -62.26545, population: 299101,  admin1: '01', region: 'Buenos Aires', regionAr: 'بوينس آيرس',     timezone: AR_TZ, names: { ar: 'باهيا بلانكا',          en: 'Bahía Blanca',         es: 'Bahía Blanca' } },
    { slug: 'resistencia',           geonameId: '3429577', lat: -27.46363, lng: -58.98665, population: 290793,  admin1: '03', region: 'Chaco',       regionAr: 'تشاكو',            timezone: AR_TZ, names: { ar: 'ريسيستينسيا',            en: 'Resistencia',          es: 'Resistencia' } },
    { slug: 'neuquen',               geonameId: '3843123', lat: -38.95078, lng: -68.0592,  population: 231198,  admin1: '15', region: 'Neuquén',     regionAr: 'نيوكين',           timezone: 'America/Argentina/Salta',      names: { ar: 'نيوكين',                  en: 'Neuquén',              es: 'Neuquén' } },
    { slug: 'la-plata',              geonameId: '3432043', lat: -34.92126, lng: -57.95442, population: 195443,  admin1: '01', region: 'Buenos Aires', regionAr: 'بوينس آيرس',     timezone: AR_TZ, names: { ar: 'لا بلاتا',                en: 'La Plata',             es: 'La Plata' } },
    { slug: 'mendoza',               geonameId: '3844421', lat: -32.88946, lng: -68.84582, population: 114893,  admin1: '13', region: 'Mendoza',     regionAr: 'مندوزا',           timezone: 'America/Argentina/Mendoza',    names: { ar: 'مندوزا',                  en: 'Mendoza',              es: 'Mendoza' } },
    { slug: 'san-juan',              geonameId: '3837213', lat: -31.53726, lng: -68.52568, population: 109123,  admin1: '18', region: 'San Juan',    regionAr: 'سان خوان',         timezone: 'America/Argentina/San_Juan',   names: { ar: 'سان خوان',                en: 'San Juan',             es: 'San Juan' } }
];

// ────────────────────────────────────────────────────────────────────────
// CO — 10 cities (Cartagena CO → cartagena-co disambiguation)
// ────────────────────────────────────────────────────────────────────────
const CO_TZ = 'America/Bogota';
const CO_CITIES = [
    { slug: 'cali',           geonameId: '3687925', lat: 3.43054,  lng: -76.5199,  population: 2392877, admin1: '29', region: 'Valle del Cauca',     regionAr: 'فاييه ديل كاوكا',   timezone: CO_TZ, names: { ar: 'كالي',           en: 'Cali',         es: 'Cali' } },
    { slug: 'medellin',       geonameId: '3674962', lat: 6.245,    lng: -75.57151, population: 1999979, admin1: '02', region: 'Antioquia',           regionAr: 'أنتيوكيا',           timezone: CO_TZ, names: { ar: 'ميديلين',         en: 'Medellín',     es: 'Medellín' } },
    { slug: 'barranquilla',   geonameId: '3689147', lat: 10.96854, lng: -74.78132, population: 1206319, admin1: '04', region: 'Atlántico',           regionAr: 'أتلانتيكو',          timezone: CO_TZ, names: { ar: 'بارانكييا',      en: 'Barranquilla', es: 'Barranquilla' } },
    { slug: 'cartagena-co',   geonameId: '3687238', lat: 10.39817, lng: -75.49328, population: 914552,  admin1: '35', region: 'Bolívar',             regionAr: 'بوليفار',            timezone: CO_TZ, names: { ar: 'كارتاخينا',      en: 'Cartagena',    es: 'Cartagena' } },
    { slug: 'cucuta',         geonameId: '3685533', lat: 7.90745,  lng: -72.5049,  population: 777106,  admin1: '21', region: 'Norte de Santander',  regionAr: 'نورتي دي سانتاندير', timezone: CO_TZ, names: { ar: 'كوكوتا',         en: 'Cúcuta',       es: 'Cúcuta' } },
    { slug: 'bucaramanga',    geonameId: '3688465', lat: 7.125,    lng: -73.11895, population: 581130,  admin1: '26', region: 'Santander',           regionAr: 'سانتاندير',          timezone: CO_TZ, names: { ar: 'بوكارامانغا',    en: 'Bucaramanga',  es: 'Bucaramanga' } },
    { slug: 'ibague',         geonameId: '3680656', lat: 4.43573,  lng: -75.20289, population: 529635,  admin1: '28', region: 'Tolima',              regionAr: 'توليما',             timezone: CO_TZ, names: { ar: 'إيباغي',          en: 'Ibagué',       es: 'Ibagué' } },
    { slug: 'santa-marta',    geonameId: '3668605', lat: 11.23855, lng: -74.19427, population: 499192,  admin1: '38', region: 'Magdalena',           regionAr: 'ماغدالينا',          timezone: CO_TZ, names: { ar: 'سانتا مارتا',    en: 'Santa Marta',  es: 'Santa Marta' } },
    { slug: 'pereira',        geonameId: '3672486', lat: 4.81428,  lng: -75.69488, population: 467269,  admin1: '24', region: 'Risaralda',           regionAr: 'ريسارالدا',          timezone: CO_TZ, names: { ar: 'بيريرا',         en: 'Pereira',      es: 'Pereira' } },
    { slug: 'manizales',      geonameId: '3675443', lat: 5.0668,   lng: -75.50684, population: 434403,  admin1: '37', region: 'Caldas',              regionAr: 'كالداس',             timezone: CO_TZ, names: { ar: 'مانيزاليس',      en: 'Manizales',    es: 'Manizales' } }
];

// ────────────────────────────────────────────────────────────────────────
// PE — 5 cities (Tarapoto dropped due to pop=0 data quality)
// ────────────────────────────────────────────────────────────────────────
const PE_TZ = 'America/Lima';
const PE_CITIES = [
    { slug: 'trujillo',  geonameId: '3691175', lat: -8.11599,  lng: -79.02998, population: 919899, admin1: '13', region: 'La Libertad', regionAr: 'لا ليبرتاد',  timezone: PE_TZ, names: { ar: 'تروخيو',    en: 'Trujillo', es: 'Trujillo' } },
    { slug: 'huancayo',  geonameId: '3939459', lat: -12.06866, lng: -75.21027, population: 456250, admin1: '12', region: 'Junín',       regionAr: 'خونين',        timezone: PE_TZ, names: { ar: 'هوانكايو',   en: 'Huancayo', es: 'Huancayo' } },
    { slug: 'pucallpa',  geonameId: '3693345', lat: -8.37915,  lng: -74.55387, population: 326040, admin1: '25', region: 'Ucayali',     regionAr: 'أوكايالي',    timezone: PE_TZ, names: { ar: 'بوكالبا',    en: 'Pucallpa', es: 'Pucallpa' } },
    { slug: 'tacna',     geonameId: '3928128', lat: -18.01465, lng: -70.25362, population: 286240, admin1: '23', region: 'Tacna',       regionAr: 'تاكنا',        timezone: PE_TZ, names: { ar: 'تاكنا',     en: 'Tacna',    es: 'Tacna' } },
    { slug: 'cajamarca', geonameId: '3699088', lat: -7.16378,  lng: -78.50027, population: 201329, admin1: '06', region: 'Cajamarca',   regionAr: 'كاخاماركا',   timezone: PE_TZ, names: { ar: 'كاخاماركا', en: 'Cajamarca', es: 'Cajamarca' } }
];

// ────────────────────────────────────────────────────────────────────────
// CL — 6 cities
// ────────────────────────────────────────────────────────────────────────
const CL_TZ = 'America/Santiago';
const CL_CITIES = [
    { slug: 'antofagasta', geonameId: '3899539', lat: -23.65094, lng: -70.39752, population: 401096, admin1: '03', region: 'Antofagasta',  regionAr: 'أنتوفاغاستا',  timezone: CL_TZ, names: { ar: 'أنتوفاغاستا',    en: 'Antofagasta', es: 'Antofagasta' } },
    { slug: 'valparaiso',  geonameId: '3868626', lat: -33.036,   lng: -71.62963, population: 282448, admin1: '01', region: 'Valparaíso',   regionAr: 'فالبارايسو',   timezone: CL_TZ, names: { ar: 'فالبارايسو',     en: 'Valparaíso',  es: 'Valparaíso' } },
    { slug: 'temuco',      geonameId: '3870011', lat: -38.73628, lng: -72.59738, population: 238129, admin1: '04', region: 'Araucanía',    regionAr: 'أراوكانيا',    timezone: CL_TZ, names: { ar: 'تيموكو',         en: 'Temuco',      es: 'Temuco' } },
    { slug: 'concepcion',  geonameId: '3893894', lat: -36.82699, lng: -73.04977, population: 223574, admin1: '06', region: 'Biobío',       regionAr: 'بيوبيو',        timezone: CL_TZ, names: { ar: 'كونسيبسيون',     en: 'Concepción',  es: 'Concepción' } },
    { slug: 'rancagua',    geonameId: '3873775', lat: -34.1691,  lng: -70.74053, population: 212695, admin1: '08', region: "O'Higgins",    regionAr: 'أوهيغينز',     timezone: CL_TZ, names: { ar: 'رانكاغوا',       en: 'Rancagua',    es: 'Rancagua' } },
    { slug: 'la-serena',   geonameId: '3884373', lat: -29.90591, lng: -71.25014, population: 154521, admin1: '07', region: 'Coquimbo',     regionAr: 'كوكيمبو',      timezone: CL_TZ, names: { ar: 'لا سيرينا',      en: 'La Serena',   es: 'La Serena' } }
];

// ────────────────────────────────────────────────────────────────────────
// VE — 4 cities (Valencia VE → valencia-ve disambiguation)
// ────────────────────────────────────────────────────────────────────────
const VE_TZ = 'America/Caracas';
const VE_CITIES = [
    { slug: 'maracaibo',      geonameId: '3633009', lat: 10.64232, lng: -71.61089, population: 1752602, admin1: '23', region: 'Zulia',     regionAr: 'زوليا',     timezone: VE_TZ, names: { ar: 'ماراكايبو',      en: 'Maracaibo',     es: 'Maracaibo' } },
    { slug: 'valencia-ve',    geonameId: '3625549', lat: 10.16153, lng: -68.00044, population: 1619470, admin1: '07', region: 'Carabobo',  regionAr: 'كارابوبو',  timezone: VE_TZ, names: { ar: 'فالنسيا',          en: 'Valencia',      es: 'Valencia' } },
    { slug: 'ciudad-guayana', geonameId: '3645528', lat: 8.35122,  lng: -62.64102, population: 978202,  admin1: '06', region: 'Bolívar',   regionAr: 'بوليفار',    timezone: VE_TZ, names: { ar: 'سيوداد غوايانا', en: 'Ciudad Guayana', es: 'Ciudad Guayana' } },
    { slug: 'maracay',        geonameId: '3632998', lat: 10.24972, lng: -67.59475, population: 464700,  admin1: '04', region: 'Aragua',    regionAr: 'أراغوا',    timezone: VE_TZ, names: { ar: 'ماراكاي',         en: 'Maracay',       es: 'Maracay' } }
];

// ─── Load + backup ─────────────────────────────────────────────────────
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
if (!existsSync(BACKUP_PATH)) { copyFileSync(CURATED_PATH, BACKUP_PATH); console.log('Backup written'); }
const orig = JSON.parse(readFileSync(BACKUP_PATH, 'utf8'));
function hashEntry(e) { return createHash('sha256').update(JSON.stringify(e)).digest('hex').slice(0, 16); }
const priorHashes = new Map();
for (const e of orig) priorHashes.set(e.slug, hashEntry(e));

const existingSlugs = new Set(curated.map(e => e.slug));
const existingSourceIds = new Set(curated.filter(e => e.sourceId).map(e => e.sourceId));

const NEW_CITIES = [
    ...ES_CITIES.map(c => ({ ...c, cc: 'es', countryAr: 'إسبانيا', countryEn: 'Spain' })),
    ...MX_CITIES.map(c => ({ ...c, cc: 'mx', countryAr: 'المكسيك', countryEn: 'Mexico' })),
    ...AR_CITIES.map(c => ({ ...c, cc: 'ar', countryAr: 'الأرجنتين', countryEn: 'Argentina' })),
    ...CO_CITIES.map(c => ({ ...c, cc: 'co', countryAr: 'كولومبيا', countryEn: 'Colombia' })),
    ...PE_CITIES.map(c => ({ ...c, cc: 'pe', countryAr: 'بيرو', countryEn: 'Peru' })),
    ...CL_CITIES.map(c => ({ ...c, cc: 'cl', countryAr: 'تشيلي', countryEn: 'Chile' })),
    ...VE_CITIES.map(c => ({ ...c, cc: 've', countryAr: 'فنزويلا', countryEn: 'Venezuela' }))
];

const dupSlugs = [], dupGids = [], scriptFails = [], langKeyFails = [];
for (const c of NEW_CITIES) {
    if (existingSlugs.has(c.slug)) dupSlugs.push(c.slug);
    if (existingSourceIds.has('geonames:' + c.geonameId)) dupGids.push(c.geonameId);
    const langs = Object.keys(c.names).sort();
    if (JSON.stringify(langs) !== JSON.stringify(['ar', 'en', 'es'])) langKeyFails.push({ slug: c.slug, langs });
    for (const L of langs) {
        if (!scriptGuard(c.names[L], L)) scriptFails.push({ slug: c.slug, lang: L, value: c.names[L] });
    }
}
if (dupSlugs.length || dupGids.length || scriptFails.length || langKeyFails.length) {
    console.error('PREFLIGHT FAIL:');
    if (dupSlugs.length) console.error('  dup slugs: ' + JSON.stringify(dupSlugs));
    if (dupGids.length) console.error('  dup gids: ' + JSON.stringify(dupGids));
    for (const f of langKeyFails) console.error('  lang-keys: ' + f.slug + ' = ' + JSON.stringify(f.langs));
    for (const f of scriptFails) console.error('  script fail: ' + f.slug + '.names.' + f.lang + ' = "' + f.value + '"');
    process.exit(1);
}

for (const c of NEW_CITIES) {
    const entry = {
        slug: c.slug, type: 'city', countryCode: c.cc,
        lat: c.lat, lng: c.lng, timezone: c.timezone,
        names: c.names,
        admin: { countryAr: c.countryAr, countryEn: c.countryEn, regionAr: c.regionAr, regionEn: c.region, admin1Code: c.admin1 },
        priority: 70, source: 'geonames', sourceId: 'geonames:' + c.geonameId, verified: false
    };
    curated.push(entry);
}

let af = 0;
for (const e of orig) {
    const eNow = curated.find(x => x.slug === e.slug);
    if (!eNow) { console.error('MISSING: ' + e.slug); af++; continue; }
    if (priorHashes.get(e.slug) !== hashEntry(eNow)) { console.error('MUTATED: ' + e.slug); af++; }
}
if (curated.length !== orig.length + NEW_CITIES.length) { console.error('COUNT FAIL'); af++; }
const slugs = curated.map(e => e.slug);
if (slugs.filter((s,i,a) => a.indexOf(s) !== i).length) { console.error('DUP SLUG'); af++; }
const srcs = curated.map(e => e.sourceId).filter(Boolean);
if (srcs.filter((s,i,a) => a.indexOf(s) !== i).length) { console.error('DUP SRC'); af++; }
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','id','fr','de','tr','ms'];
for (const c of NEW_CITIES) {
    const e = curated.find(x => x.slug === c.slug);
    if (!e) continue;
    for (const k of Object.keys(e.names)) {
        if (FORBIDDEN.includes(k)) { console.error('FORBIDDEN: ' + c.slug + '.names.' + k); af++; }
    }
}
if (af > 0) { console.error('APPLY ABORTED — ' + af + ' invariant fails'); process.exit(1); }

writeFileSync(CURATED_PATH, JSON.stringify(curated, null, 2) + '\n', 'utf8');
const before = {};
const after = {};
for (const cc of ['es','mx','ar','co','pe','cl','ve']) {
    before[cc] = orig.filter(e => e.countryCode === cc).length;
    after[cc]  = curated.filter(e => e.countryCode === cc).length;
}
writeFileSync(REPORT_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    citiesAdded: NEW_CITIES.length,
    perCountry: { before, after },
    totalCuratedBefore: orig.length, totalCuratedAfter: curated.length,
    addedSlugs: NEW_CITIES.map(c => ({ cc: c.cc, slug: c.slug }))
}, null, 2), 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' SUPPORTED-LOCAL-LANG-CITIES-ES-LATAM-FAST — APPLY OK');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('  Cities added         : ' + NEW_CITIES.length);
for (const cc of ['es','mx','ar','co','pe','cl','ve']) {
    console.log('  ' + cc.toUpperCase() + ' count           : ' + before[cc] + ' → ' + after[cc]);
}
console.log('  Total curated        : ' + orig.length + ' → ' + curated.length);
console.log('═══════════════════════════════════════════════════════════════════════');
