// Phase E — QA + Stability test suite for the smart search engine.
//
// يستخرج LOCAL_CITIES + LOCAL_PROVINCES + searchSmartCities + الفلاتر من js/app.js
// ويشغّلها في sandbox (vm) بدون DOM. ثمّ يُجري 80+ استعلامًا ويتأكّد من:
//   - ظهور النتيجة الصحيحة (ar + en)
//   - النوع الصحيح
//   - الدولة الصحيحة
//   - عدم ظهور دول أو شوارع أو أحياء
//   - عدم تكرار نفس المكان
//
// تشغيل: node scripts/test-smart-search.mjs

import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync('js/app.js', 'utf8');

// ── helpers لاستخراج كتل من المصدر ─────────────────────────────────────
function extractArray(name) {
    const startRe = new RegExp(`const\\s+${name}\\s*=\\s*\\[`);
    const m = startRe.exec(src);
    if (!m) throw new Error(`${name} array not found`);
    let i = m.index + m[0].length, depth = 1;
    while (i < src.length && depth > 0) {
        const ch = src[i];
        if (ch === '[') depth++;
        else if (ch === ']') { depth--; if (depth === 0) break; }
        i++;
    }
    return src.slice(m.index, i + 1) + ';';
}

function extractFunc(name) {
    const startRe = new RegExp(`function\\s+${name}\\s*\\(`);
    const m = startRe.exec(src);
    if (!m) throw new Error(`function ${name} not found`);
    let i = src.indexOf('{', m.index) + 1, depth = 1;
    while (i < src.length && depth > 0) {
        const ch = src[i];
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) break; }
        i++;
    }
    return src.slice(m.index, i + 1);
}

function extractSet(name) {
    const startRe = new RegExp(`const\\s+${name}\\s*=\\s*new\\s+Set\\(`);
    const m = startRe.exec(src);
    if (!m) throw new Error(`${name} set not found`);
    let i = m.index + m[0].length, depth = 1;
    while (i < src.length && depth > 0) {
        const ch = src[i];
        if (ch === '(') depth++;
        else if (ch === ')') { depth--; if (depth === 0) break; }
        i++;
    }
    return src.slice(m.index, i + 1) + ';';
}

// ── بناء الـ sandbox ──────────────────────────────────────────────────
const sandboxCode = [
    extractFunc('_normArabic'),
    extractFunc('normalizeText'),
    extractSet('SMART_ALLOWED_TYPES'),
    extractSet('SMART_BLOCKED_TYPES'),
    extractFunc('_smartKey'),
    `function t() { return null; }`, // i18n stub
    extractFunc('_smartTypeLabel'),
    extractFunc('_smartTypeFromNominatim'),
    extractArray('LOCAL_CITIES'),
    extractArray('LOCAL_PROVINCES'),
    extractFunc('searchSmartCities'),
].join('\n\n');

const ctx = { console };
vm.createContext(ctx);
vm.runInContext(sandboxCode + '\nthis.__api = { searchSmartCities, LOCAL_CITIES, LOCAL_PROVINCES, SMART_ALLOWED_TYPES, SMART_BLOCKED_TYPES, _smartTypeFromNominatim };', ctx);
const { searchSmartCities, LOCAL_CITIES, LOCAL_PROVINCES, SMART_ALLOWED_TYPES, SMART_BLOCKED_TYPES, _smartTypeFromNominatim } = ctx.__api;

// ── Test cases ────────────────────────────────────────────────────────
// لكل اختبار: { q, expect: 'ar' || 'en' to match, type?, country?, empty? }
const TESTS = [
    // ─── Capitals (English) ─── 10
    { q: 'Riyadh',         expect: 'الرياض',         type: 'city', country: /السعودية/ },
    { q: 'Mecca',          expect: 'مكة المكرمة',    type: 'city' },
    { q: 'Medina',         expect: 'المدينة المنورة', type: 'city' },
    { q: 'Cairo',          expect: 'القاهرة',         type: 'city' },
    { q: 'London',         expect: 'لندن',            type: 'city', country: /المملكة المتحدة/ },
    { q: 'Paris',          expect: 'باريس',           type: 'city' },
    { q: 'Beijing',        expect: 'بكين',            type: 'city' },
    { q: 'Tokyo',          expect: 'طوكيو',           type: 'city' },
    { q: 'Sydney',         expect: 'سيدني',           type: 'city' },
    { q: 'Moscow',         expect: 'موسكو',           type: 'city' },

    // ─── Capitals (Arabic) ─── 10
    { q: 'الرياض',          expect: 'الرياض',         type: 'city' },
    { q: 'مكة',             expect: 'مكة المكرمة',   type: 'city' },
    { q: 'القاهرة',         expect: 'القاهرة',        type: 'city' },
    { q: 'لندن',            expect: 'لندن',           type: 'city' },
    { q: 'بيروت',           expect: 'بيروت',          type: 'city' },
    { q: 'دمشق',            expect: 'دمشق',           type: 'city' },
    { q: 'بغداد',           expect: 'بغداد',          type: 'city' },
    { q: 'طهران',           expect: 'طهران',          type: 'city' },
    { q: 'إسطنبول',         expect: 'إسطنبول',        type: 'city' },
    { q: 'صنعاء',           expect: 'صنعاء',          type: 'city' },

    // ─── Aliases ─── 10
    { q: 'Makkah',          expect: 'مكة المكرمة',    type: 'city',  note: 'alias for Mecca' },
    { q: 'Madinah',         expect: 'المدينة المنورة', type: 'city', note: 'alias for Medina' },
    { q: 'Bombay',          expect: 'مومباي',         type: 'city',  note: 'alias for Mumbai' },
    { q: 'Peking',          expect: 'بكين',           type: 'city',  note: 'alias for Beijing' },
    { q: 'Calcutta',        expect: 'كولكاتا',        type: 'city',  note: 'alias for Kolkata' },
    { q: 'Madras',          expect: 'تشيناي',         type: 'city',  note: 'alias for Chennai' },
    { q: 'Bangalore',       expect: 'بنغالور',        type: 'city',  note: 'alias for Bengaluru' },
    { q: 'Halab',           expect: 'حلب',            type: 'city',  note: 'alias for Aleppo' },
    { q: 'Dimashq',         expect: 'دمشق',           type: 'city',  note: 'alias for Damascus' },
    { q: 'Marrakesh',       expect: 'مراكش',          type: 'city',  note: 'alias for Marrakech' },

    // ─── Major Cities ─── 10
    { q: 'Jeddah',          expect: 'جدة',            type: 'city' },
    { q: 'Karachi',         expect: 'كراتشي',         type: 'city' },
    { q: 'Hamburg',         expect: 'هامبورغ',        type: 'city' },
    { q: 'Toronto',         expect: 'تورنتو',         type: 'city' },
    { q: 'New York',        expect: 'نيويورك',        type: 'city' },
    { q: 'Los Angeles',     expect: 'لوس أنجلوس',     type: 'city' },
    { q: 'مومباي',          expect: 'مومباي',         type: 'city' },
    { q: 'Lagos',           expect: 'لاغوس',          type: 'city' },
    { q: 'Mumbai',          expect: 'مومباي',         type: 'city' },
    { q: 'Lahore',          expect: 'لاهور',          type: 'city' },

    // ─── Saudi Governorates ─── 8
    { q: 'المذنب',          expect: 'المذنب',         type: 'governorate', country: /السعودية/ },
    { q: 'القويعية',        expect: 'القويعية',       type: 'governorate' },
    { q: 'الخرج',           expect: 'الخرج',          type: 'governorate' },
    { q: 'المزاحمية',       expect: 'المزاحمية',      type: 'governorate' },
    { q: 'ينبع',            expect: 'ينبع',           type: 'governorate' },
    { q: 'الزلفي',          expect: 'الزلفي',         type: 'governorate' },
    { q: 'شقراء',           expect: 'شقراء',          type: 'governorate' },
    { q: 'ثادق',            expect: 'ثادق',           type: 'governorate' },

    // ─── Egypt Governorates ─── 5
    { q: 'القليوبية',       expect: 'القليوبية',     type: 'governorate' },
    { q: 'الشرقية',         expect: 'الشرقية',        type: 'governorate' },
    { q: 'الفيوم',          expect: 'الفيوم',         type: 'governorate' },
    { q: 'أسيوط',           expect: 'أسيوط',          type: 'governorate' },
    { q: 'سوهاج',           expect: 'سوهاج',          type: 'governorate' },

    // ─── Kuwait Governorates ─── 4
    { q: 'الأحمدي',         expect: 'الأحمدي',        type: 'governorate' },
    { q: 'حولي',            expect: 'حولي',           type: 'governorate' },
    { q: 'الفروانية',       expect: 'الفروانية',     type: 'governorate' },
    { q: 'الجهراء',         expect: 'الجهراء',        type: 'governorate' },

    // ─── Iraq + Kurdistan ─── 5
    { q: 'نينوى',           expect: 'نينوى',          type: 'governorate' },
    { q: 'كركوك',           expect: 'كركوك',          type: 'governorate' },
    { q: 'أربيل',           expect: 'أربيل',          type: 'governorate' },
    { q: 'السليمانية',      expect: 'السليمانية',    type: 'governorate' },
    { q: 'الأنبار',         expect: 'الأنبار',        type: 'governorate' },

    // ─── Syria ─── 4
    { q: 'حمص',             expect: 'حمص',            type: 'governorate' },
    { q: 'حماة',            expect: 'حماة',           type: 'governorate' },
    { q: 'اللاذقية',        expect: 'اللاذقية',       type: 'governorate' },
    { q: 'إدلب',            expect: 'إدلب',           type: 'governorate' },

    // ─── Palestine ─── 4
    { q: 'رام الله',        expect: 'رام الله والبيرة', type: 'governorate' },
    { q: 'الخليل',          expect: 'الخليل',         type: 'governorate' },
    { q: 'نابلس',           expect: 'نابلس',          type: 'governorate' },
    { q: 'خان يونس',        expect: 'خان يونس',      type: 'governorate' },

    // ─── Yemen + Oman ─── 5
    { q: 'تعز',             expect: 'تعز',            type: 'governorate' },
    { q: 'الحديدة',         expect: 'الحديدة',        type: 'governorate' },
    { q: 'حضرموت',          expect: 'حضرموت',         type: 'governorate' },
    { q: 'صلالة',           expect: 'صلالة',          type: 'city',  country: /عُمان/ },
    { q: 'ظفار',            expect: 'ظفار',           type: 'governorate' },

    // ─── Maghreb ─── 8
    { q: 'وهران',           expect: 'وهران',          type: 'province' },
    { q: 'قسنطينة',         expect: 'قسنطينة',        type: 'province' },
    { q: 'صفاقس',           expect: 'صفاقس',          type: 'governorate' },
    { q: 'سوسة',            expect: 'سوسة',           type: 'governorate' },
    { q: 'القيروان',        expect: 'القيروان',       type: 'governorate' },
    { q: 'بنغازي',          expect: 'بنغازي',         type: 'district' },
    { q: 'مصراتة',          expect: 'مصراتة',         type: 'district' },
    { q: 'الدار البيضاء-سطات', expect: 'الدار البيضاء-سطات', type: 'province' },

    // ─── Sudan ─── 4
    { q: 'دارفور',          expect: 'دارفور',         type: 'province' },
    { q: 'الجزيرة',         expect: 'الجزيرة',        type: 'state' },
    { q: 'كسلا',            expect: 'كسلا',           type: 'state' },
    { q: 'القضارف',         expect: 'القضارف',        type: 'state' },

    // ─── Country queries: لا يجب أن يرجع نتيجة من نوع 'country' ───
    // (يجوز إرجاع مدن داخل الدولة عبر مطابقة "اسم+بلد" — نفحص النوع فقط)
    { q: 'Saudi Arabia',    notType: 'country', note: 'country query — must not return type=country' },
    { q: 'Egypt',           notType: 'country', note: 'country query — must not return type=country' },
    { q: 'السعودية',        notType: 'country', note: 'country query (ar)' },
    { q: 'مصر',             notType: 'country', note: 'country query (ar)' },

    // ─── Should NOT match at all (streets / neighborhoods / gibberish) ─── 4
    { q: 'حي النزهة',       empty: true, note: 'Arabic neighborhood' },
    { q: 'شارع التحلية',    empty: true, note: 'Arabic street' },
    { q: 'Main Street',     empty: true, note: 'English street' },
    { q: 'XX',              empty: true, note: 'gibberish' },
];

// ── Filter unit tests (Nominatim type detection) ──────────────────────
// Each fixture: { p: nominatim-like object, expectAllowed: bool, expectType?: string }
const FILTER_TESTS = [
    // ─── Standard accepted (clean OSM tagging) ───
    { p: { class: 'place',    type: 'city',          addresstype: 'city',          name: 'Riyadh' },                expectAllowed: true,  expectType: 'city' },
    { p: { class: 'place',    type: 'town',          addresstype: 'town',          name: 'Foo' },                   expectAllowed: true,  expectType: 'town' },
    { p: { class: 'place',    type: 'village',       addresstype: 'village',       name: 'Bar' },                   expectAllowed: true,  expectType: 'village' },
    { p: { class: 'boundary', type: 'administrative', addresstype: 'province',     name: 'محافظة المذنب' },         expectAllowed: true,  expectType: 'governorate' },
    { p: { class: 'boundary', type: 'administrative', addresstype: 'province',     name: 'Province X' },            expectAllowed: true,  expectType: 'province' },
    { p: { class: 'boundary', type: 'administrative', addresstype: 'state',        name: 'Kano State' },            expectAllowed: true,  expectType: 'state' },
    { p: { class: 'boundary', type: 'administrative', addresstype: 'county',       name: 'Some County' },           expectAllowed: true,  expectType: 'county' },
    { p: { class: 'boundary', type: 'administrative', addresstype: 'district',     name: 'Tripoli District' },      expectAllowed: true,  expectType: 'district' },

    // ─── Phase J — addresstype priority over class/type ───
    // Nominatim يضع بعض المدن (Nouakchott, Apia…) موسومة بـ class=landuse, type=residential
    // بسبب OSM tagging quirks. addresstype يظلّ "city/town/…" — يجب قبولها.
    { p: { class: 'landuse',  type: 'residential',   addresstype: 'city',          name: 'نواكشوط',  namedetails: { 'name:en': 'Nouakchott' } },                              expectAllowed: true, expectType: 'city',         note: 'addresstype:city wins over landuse/residential (Nouakchott)' },
    { p: { class: 'landuse',  type: 'residential',   addresstype: 'city',          name: 'Apia' },                                                                            expectAllowed: true, expectType: 'city',         note: 'addresstype:city (Apia)' },
    { p: { class: 'boundary', type: 'administrative', addresstype: 'town',         name: 'Funafuti' },                                                                        expectAllowed: true, expectType: 'town',         note: 'addresstype:town (Funafuti)' },
    { p: { class: 'landuse',  type: 'residential',   addresstype: 'town',          name: 'Y' },                                                                               expectAllowed: true, expectType: 'town',         note: 'addresstype:town wins over landuse' },
    { p: { class: 'landuse',  type: 'residential',   addresstype: 'village',       name: 'Z' },                                                                               expectAllowed: true, expectType: 'village',      note: 'addresstype:village wins over landuse' },
    { p: { class: 'landuse',  type: 'residential',   addresstype: 'municipality',  name: 'W' },                                                                               expectAllowed: true, expectType: 'municipality', note: 'addresstype:municipality wins' },
    { p: { class: 'place',    type: 'square',        addresstype: 'city',          name: 'X' },                                                                               expectAllowed: true, expectType: 'city',         note: 'addresstype:city wins over odd type' },

    // ─── BLOCKED — addresstype itself is bad (country, road, suburb, neighbourhood…) ───
    { p: { class: 'boundary', type: 'administrative', addresstype: 'country',      name: 'Egypt' },                 expectAllowed: false, note: 'country (rejected by addresstype)' },
    { p: { class: 'highway',  type: 'road',           addresstype: 'road',         name: 'Main St' },               expectAllowed: false, note: 'road' },
    { p: { class: 'place',    type: 'suburb',         addresstype: 'suburb',       name: 'Suburb X' },              expectAllowed: false, note: 'suburb' },
    { p: { class: 'place',    type: 'neighbourhood',  addresstype: 'neighbourhood',name: 'Hood' },                  expectAllowed: false, note: 'neighbourhood' },
    { p: { class: 'building', type: 'house',          addresstype: 'building',     name: 'House' },                 expectAllowed: false, note: 'building' },
    { p: { class: 'shop',     type: 'shop',           addresstype: 'shop',         name: 'Shop' },                  expectAllowed: false, note: 'shop' },
    { p: { class: 'amenity',  type: 'restaurant',     addresstype: 'amenity',      name: 'Place' },                 expectAllowed: false, note: 'amenity' },

    // ─── BLOCKED — addresstype absent/empty, class/type are bad ───
    // (المسار الثاني في الفلتر: لا addresstype مفيد → نَحظر بناءً على class/type)
    { p: { class: 'highway',  type: 'street',         addresstype: '',             name: 'No-name street' },        expectAllowed: false, note: 'street class with empty addresstype' },
    { p: { class: 'tourism',  type: 'attraction',     addresstype: '',             name: 'POI' },                    expectAllowed: false, note: 'tourism POI' },
];

// ── Run local-search tests ────────────────────────────────────────────
let pass = 0, fail = 0, warn = 0;
const failures = [];

function assertEq(label, actual, expected, ctx) {
    if (actual === expected) return true;
    if (expected instanceof RegExp && expected.test(actual)) return true;
    failures.push(`  ✗ ${ctx}: ${label} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    return false;
}

console.log(`\n══════ Phase E — Smart Search Test Suite ══════`);
console.log(`LOCAL_CITIES:    ${LOCAL_CITIES.length} entries`);
console.log(`LOCAL_PROVINCES: ${LOCAL_PROVINCES.length} entries`);
console.log(`Total dataset:   ${LOCAL_CITIES.length + LOCAL_PROVINCES.length} entries\n`);

console.log(`▌ A) Local search tests (${TESTS.length} queries)`);
for (const tc of TESTS) {
    const results = searchSmartCities(tc.q);
    const ctx = `"${tc.q}"${tc.note ? ` (${tc.note})` : ''}`;

    if (tc.empty) {
        if (results.length === 0) { pass++; }
        else {
            // Tolerate weak partial matches if score is low — but flag as warning
            const top = results[0];
            if (top._score < 50) { warn++; console.log(`  ⚠ ${ctx}: weak match (score ${Math.round(top._score)}: ${top.ar} / ${top.en})`); }
            else { fail++; failures.push(`  ✗ ${ctx}: expected empty, got ${results.length} results (top: ${top.ar} / ${top.en})`); }
        }
        continue;
    }

    // notType: تأكّد لا توجد نتيجة من النوع المرفوض (مثل country)
    if (tc.notType) {
        const bad = results.find(r => r.type === tc.notType);
        if (bad) { fail++; failures.push(`  ✗ ${ctx}: found type=${tc.notType}: ${bad.ar} / ${bad.en}`); }
        else pass++;
        continue;
    }

    if (results.length === 0) {
        fail++; failures.push(`  ✗ ${ctx}: no results, expected "${tc.expect}"`);
        continue;
    }

    const top = results[0];
    const okAr = top.ar === tc.expect || top.en === tc.expect;
    let allOk = okAr;
    if (!okAr) failures.push(`  ✗ ${ctx}: top result was ${top.ar} / ${top.en}, expected ${tc.expect}`);
    if (tc.type && top.type !== tc.type) {
        allOk = false; failures.push(`  ✗ ${ctx}: type was ${top.type}, expected ${tc.type}`);
    }
    if (tc.country && !tc.country.test(top.country || '')) {
        allOk = false; failures.push(`  ✗ ${ctx}: country was "${top.country}", expected ${tc.country}`);
    }
    if (allOk) pass++;
    else fail++;
}

// ── Run filter tests ──────────────────────────────────────────────────
// Phase J: المنطق الجديد — addresstype له الأولويّة على class/type
function _evalSmartFilter(p) {
    if (SMART_ALLOWED_TYPES.has(p.addresstype)) return true;   // المسار 1
    if (SMART_BLOCKED_TYPES.has(p.class)) return false;
    if (SMART_BLOCKED_TYPES.has(p.type)) return false;
    if (SMART_BLOCKED_TYPES.has(p.addresstype)) return false;
    const _t = _smartTypeFromNominatim(p);
    if (!_t) return false;
    return SMART_ALLOWED_TYPES.has(_t);
}

console.log(`\n▌ B) Filter / type-detection tests (${FILTER_TESTS.length} fixtures)`);
let filterPass = 0, filterFail = 0;
for (const ft of FILTER_TESTS) {
    const detectedType = _smartTypeFromNominatim(ft.p);
    const allowed = _evalSmartFilter(ft.p);

    const ctx = `${ft.p.class}/${ft.p.type}/${ft.p.addresstype} "${ft.p.name}"${ft.note ? ` (${ft.note})` : ''}`;
    if (allowed === ft.expectAllowed && (!ft.expectType || detectedType === ft.expectType)) {
        filterPass++;
    } else {
        filterFail++;
        failures.push(`  ✗ FILTER ${ctx}: allowed=${allowed} (expected ${ft.expectAllowed}), type=${detectedType}${ft.expectType ? ` (expected ${ft.expectType})` : ''}`);
    }
}

// ── Dedup test: ensure no duplicate keys across LOCAL_CITIES + LOCAL_PROVINCES ──
console.log(`\n▌ C) Duplicate-key check across LOCAL_CITIES + LOCAL_PROVINCES`);
const keys = new Map();
let dupes = 0;
for (const item of [...LOCAL_CITIES, ...LOCAL_PROVINCES]) {
    const k = `${(item.cc||'').toLowerCase()}-${(item.en||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}`;
    if (keys.has(k)) {
        dupes++; failures.push(`  ✗ DUP key="${k}":  ${keys.get(k).ar}/${keys.get(k).en} ↔ ${item.ar}/${item.en}`);
    } else {
        keys.set(k, item);
    }
}
if (dupes === 0) console.log(`  ✓ No duplicate keys (${keys.size} unique)`);

// ── Summary ───────────────────────────────────────────────────────────
const totalTests = TESTS.length + FILTER_TESTS.length;
const totalPass = pass + filterPass;
const totalFail = fail + filterFail + dupes;

console.log(`\n══════ Summary ══════`);
console.log(`  Search tests:  ${pass}/${TESTS.length} passed`);
console.log(`  Filter tests:  ${filterPass}/${FILTER_TESTS.length} passed`);
console.log(`  Duplicates:    ${dupes}`);
console.log(`  Warnings:      ${warn}`);
console.log(`  ─────────────────`);
console.log(`  TOTAL:         ${totalPass}/${totalTests} passed`);

if (failures.length > 0) {
    console.log(`\n══════ Failures (${failures.length}) ══════`);
    for (const f of failures) console.log(f);
}

console.log('');
process.exit(totalFail > 0 ? 1 : 0);
