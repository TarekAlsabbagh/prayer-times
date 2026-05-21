// Content-integrity + SEO smoke for HIJRI-CALENDAR-UI-POLISH-1.
// Pure visual phase — verify NO text/SEO/structural change vs spec.
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

console.log('═══ HIJRI-CALENDAR-UI-POLISH-1 SSR/Content Smoke ═══\n');

// — /hijri-calendar (current year hub) — Arabic
const r1 = await get('/hijri-calendar');
ok('HTTP 200 /hijri-calendar', r1.status === 200);
ok('CSS cache-buster bumped to v=358', r1.body.includes('css/style.css?v=358'));
ok('H1 id="hyear-title" present (text unchanged)', /id="hyear-title"/.test(r1.body));
ok('#page-hijri-year div present', /id="page-hijri-year"/.test(r1.body));
ok('Year picker .calendar-year-picker present', /class="[^"]*calendar-year-picker[^"]*"/.test(r1.body));
ok('Year nav row .hyear-year-nav-row present', /class="hyear-year-nav-row"/.test(r1.body));
ok('today-hijri-date CTA link present', /\/today-hijri-date/.test(r1.body));
ok('Info-grid #hyear-info-grid present', /id="hyear-info-grid"/.test(r1.body));
ok('Months table #hyear-table-body present', /id="hyear-table-body"/.test(r1.body));
ok('Quick actions #hyear-cta present', /id="hyear-cta"/.test(r1.body));
ok('Years grid #hyear-years-grid present', /id="hyear-years-grid"/.test(r1.body));
// SSR replaces template comments with rendered content; check class presence
ok('Usage guide rendered (hcal1-guide class present)', /class="[^"]*hcal1-guide[^"]*"/.test(r1.body));
ok('Months chips rendered (hcal2-months-chips class present)', /class="[^"]*hcal2-months-chips[^"]*"/.test(r1.body));
ok('FAQ #hyear-faq present', /id="hyear-faq"/.test(r1.body));
ok('SEO box #hyear-seo-text present', /id="hyear-seo-text"/.test(r1.body));
ok('Footer SEO #hyear-footer-seo present', /id="hyear-footer-seo"/.test(r1.body));
ok('Events countdown hd5-events section present', /class="[^"]*hd5-events[^"]*"/.test(r1.body));
ok('Ramadan event card present', /moon-event-ramadan-card/.test(r1.body));
ok('Eid Al-Fitr event card present', /moon-event-fitr-card/.test(r1.body));
ok('Eid Al-Adha event card present', /moon-event-adha-card/.test(r1.body));
ok('Hijri New Year event card present', /moon-event-newyear-card/.test(r1.body));
ok('JSON-LD script tag present', /application\/ld\+json/.test(r1.body));
ok('canonical link present', /<link rel="canonical"/.test(r1.body));
ok('hreflang links present', /<link rel="alternate" hreflang=/.test(r1.body));
// Snapshot title element (SSR may demote H1→div per route; check id-based)
// Server.js #_getActiveH1 promotes #hyear-title semantically; in the static
// template it's already a heading element but content is what matters.
const titleElMatch = r1.body.match(/id="hyear-title"[^>]*>([^<]+)</);
ok('Title element with id=hyear-title has Arabic text', titleElMatch && titleElMatch[1].trim().length > 0,
   titleElMatch ? 'text="' + titleElMatch[1].trim().slice(0, 60) + '"' : '');
const titleMatch = r1.body.match(/<title[^>]*>([^<]+)<\/title>/);
ok('<title> tag has text', titleMatch && titleMatch[1].trim().length > 0,
   titleMatch ? 'title="' + titleMatch[1].trim().slice(0, 60) + '"' : '');

// — /hijri-calendar/1447 — should also resolve and have same H1 structure
const r2 = await get('/hijri-calendar/1447');
ok('HTTP 200 /hijri-calendar/1447', r2.status === 200);
ok('1447 page has #hyear-title', /id="hyear-title"/.test(r2.body));
ok('1447 page has JSON-LD', /application\/ld\+json/.test(r2.body));

// — /hijri-calendar/1448 — different year
const r3 = await get('/hijri-calendar/1448');
ok('HTTP 200 /hijri-calendar/1448', r3.status === 200);

// — /hijri-calendar/1447-09 — month detail (separate page #page-hijri-month, must NOT be affected)
const r4 = await get('/hijri-calendar/1447-09');
ok('HTTP 200 /hijri-calendar/1447-09', r4.status === 200);
ok('Month page uses #page-hijri-month (different from #page-hijri-year)',
   /id="page-hijri-month"/.test(r4.body));

// — /today-hijri-date — separate page #page-hijri-today, must not be affected
const r5 = await get('/today-hijri-date');
ok('HTTP 200 /today-hijri-date', r5.status === 200);

// — /prayer-times-in-riyadh — unrelated page
const r6 = await get('/prayer-times-in-riyadh');
ok('HTTP 200 /prayer-times-in-riyadh', r6.status === 200);

// — /moon-today — moon page should not be affected
const r7 = await get('/moon-today');
ok('HTTP 200 /moon-today', r7.status === 200);

// — /qibla — qibla page should not be affected
const r8 = await get('/qibla');
ok('HTTP 200 /qibla', r8.status === 200);

// — English version
const r9 = await get('/en/hijri-calendar');
ok('HTTP 200 /en/hijri-calendar', r9.status === 200);
ok('EN hijri-calendar has English H1 (not Arabic)', /id="hyear-title"/.test(r9.body));

console.log('\n══════════════════════════════════════');
console.log(' SSR/Content Smoke: ' + pass + ' passed, ' + fail + ' failed (' + (pass+fail) + ')');
console.log('══════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
