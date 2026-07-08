// Smoke — GSC-EVENT-STRUCTURED-DATA-OPTIONAL-FIELDS-FIX-1
// Resolves the GSC "Event structured data" recommended-field warning HONESTLY (no fake data):
//  (B) the prayer-times Event schema (5 daily prayers × every city page) is REMOVED — injectPrayerEventsSchema()
//      now only cleans up any stale #prayer-events-schema (no Event build / no _seoUpsertSchema).
//  (A) the countdown Event (ramadan/eid/hijri-ny) gains an honest endDate (last inclusive day, from the SAME
//      registry the counter uses via _cdEventEndDate) + keeps name/startDate/description/location; NO image,
//      NO performer, NO offers, NO price/availability (recommended-only, inapplicable).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const appSrc  = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const swSrc   = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }
const sameDay = (d, y, m, day) => d instanceof Date && d.getFullYear() === y && d.getMonth() === m && d.getDate() === day;

console.log('================ 1. _cdEventEndDate — honest last-inclusive-day (extracted) ================');
const fn = appSrc.match(/function _cdEventEndDate\(startDate, registryKey, hYear\) \{[\s\S]*?\n\}/);
ok(!!fn, 'extracted _cdEventEndDate');
const mockReg = {
  ramadan: { durationDays: 30, cycles: [{ hijriYear: 1448, durationDays: 29 }] },  // per-cycle override
  fitr:    { durationDays: 3,  cycles: [{ hijriYear: 1448 }] },
  adha:    { durationDays: 4,  cycles: [{ hijriYear: 1448 }] },
  newyear: { durationDays: 1,  cycles: [{ hijriYear: 1448 }] }
};
const _cdEventEndDate = new Function('window', `${fn[0]}\nreturn _cdEventEndDate;`)({ ISLAMIC_EVENT_DATES: mockReg });
ok(sameDay(_cdEventEndDate(new Date(2027, 1, 8),  'ramadan', 1448), 2027, 2, 8),  'ramadan (dur 29) → endDate = start + 28 (8 Feb → 8 Mar 2027)');
ok(sameDay(_cdEventEndDate(new Date(2027, 2, 10), 'fitr',    1448), 2027, 2, 12), 'eid-fitr (dur 3) → endDate = start + 2');
ok(sameDay(_cdEventEndDate(new Date(2027, 5, 1),  'adha',    1448), 2027, 5, 4),  'eid-adha (dur 4) → endDate = start + 3');
ok(sameDay(_cdEventEndDate(new Date(2027, 6, 1),  'newyear', 1448), 2027, 6, 1),  'hijri-new-year (dur 1) → endDate == startDate (single day)');
ok(sameDay(_cdEventEndDate(new Date(2027, 6, 1),  'unknownKey', 1448), 2027, 6, 1), 'unknown key → dur 1 → same day (safe default)');
const _bad = _cdEventEndDate('not-a-date', 'ramadan', 1448);
ok(_bad === 'not-a-date', 'non-Date input → returns input unchanged (safe fallback)');

console.log('\n================ 2. Block B — prayer-times Event schema REMOVED ================');
const pfStart = appSrc.indexOf('function injectPrayerEventsSchema()');
const pfEnd   = appSrc.indexOf('\n}', pfStart) + 2;
const pfBody  = appSrc.slice(pfStart, pfEnd);
ok(pfStart > -1, 'injectPrayerEventsSchema present (kept as a cleanup no-op)');
ok(/_seoRemoveSchema\('prayer-events-schema'\)/.test(pfBody), 'it cleans up any stale #prayer-events-schema');
ok(!/_seoUpsertSchema/.test(pfBody), 'it NO LONGER upserts an Event schema');
ok(!/"@type":\s*"Event"/.test(pfBody) && !/OfflineEventAttendanceMode/.test(pfBody) && !/isAccessibleForFree/.test(pfBody) && !/prayerDefs/.test(pfBody),
   'the prayer Event builder (Event/prayerDefs/attendanceMode) is GONE');
ok(!/_seoUpsertSchema\('prayer-events-schema'/.test(appSrc), 'NO prayer-events Event upsert anywhere in app.js');

console.log('\n================ 3. Block A — countdown Event completed honestly ================');
const cs = appSrc.indexOf("const _schema = {");
const ce = appSrc.indexOf('let _schemaEl', cs);
const schemaBlock = appSrc.slice(cs, ce);
ok(cs > -1 && ce > cs, 'countdown _schema object located');
ok(/'@type':\s*'Event'/.test(schemaBlock), 'countdown schema is still @type Event (dated observance — appropriate)');
ok(/'name':\s*_tt\(_kp \+ '\.event_name'\)/.test(schemaBlock), 'name from .event_name (present per lang)');
ok(/'startDate':/.test(schemaBlock), 'startDate present');
ok(/'endDate':/.test(schemaBlock) && /_cdEventEndDate\(_eventGreg, _registryKey, _eventHYear\)/.test(schemaBlock), 'NEW honest endDate via _cdEventEndDate');
ok(/'description':\s*_tt\(_kp \+ '\.intro'\)/.test(schemaBlock), 'description present (from .intro, per lang)');
ok(/'location':/.test(schemaBlock), 'location present');

console.log('\n================ 4. NO fake/misleading data added (both blocks) ================');
ok(!/performer/i.test(schemaBlock), 'countdown schema has NO performer (no fake performer)');
ok(!/offers/i.test(schemaBlock),    'countdown schema has NO offers (no fake tickets/price)');
ok(!/'price'|"price"|priceCurrency|availability/i.test(schemaBlock), 'countdown schema has NO price/availability');
ok(!/'image'|"image"/.test(schemaBlock), 'countdown schema has NO image yet (og-image is SVG; deferred by decision)');

console.log('\n================ 5. Cache-busters (app bumped; css/server unchanged) ================');
ok(/js\/app\.js\?v=823/.test(htmlSrc), 'index.html app.js?v=823');
ok(/css\/style\.css\?v=492/.test(htmlSrc) && !/css\/style\.css\?v=493/.test(htmlSrc), 'css/style.css?v=492 UNCHANGED this ticket');
ok(/CACHE_VERSION = 'v492'/.test(swSrc), 'sw.js CACHE_VERSION v492');

console.log(`\nPASS=${pass}  FAIL=${fail}`);
if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
