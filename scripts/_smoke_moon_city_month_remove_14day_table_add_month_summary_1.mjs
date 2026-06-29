// MOON-CITY-MONTH-REMOVE-14DAY-TABLE-ADD-MONTH-SUMMARY-1 — verification (self-contained).
//
// On the moon MONTH page (/moon/{country}/{city}/{YYYY}/{MM}) the 14-day forecast table belongs on
// /today, repeats phase words, and buries the month overview. This ticket REMOVES it on month pages
// only and adds a DATA-DRIVEN monthly STAT summary (#moon-month-stats) after the Hijri-range card:
// four reused .moon-stat cells — highest/lowest illumination (day + %) and the longest waxing/waning
// (rising/falling illumination) spans — computed from the SAME MoonCalc.getMonthGrid engine. NO major
// phase timeline (the existing #moon-upcoming-section already lists the 4 major phases → no duplication,
// no repeated phase names). Reuses .section-card / .moon-seo-grid / .moon-stat → server-side only:
// no app.js / index.html / css change, no cache-buster. /today, /day, /year and the hub keep the table.
//
// Run: node scripts/_smoke_moon_city_month_remove_14day_table_add_month_summary_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8312;
function req(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
        });
        r.on('error', () => resolve({ status: 0, body: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await req('/health'); if (r.status === 200) return true; await sleep(400); } return false; }
const cp = (s) => [...String(s)].length;
const titleOf = (b) => ((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').replace(/&amp;/g, '&');
const metaOf = (b) => ((b.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/&amp;/g, '&');
const secOf = (b) => { const i = b.indexOf('id="moon-month-stats"'); if (i < 0) return ''; const st = b.lastIndexOf('<section', i); const en = b.indexOf('</section>', i); return (st >= 0 && en >= 0) ? b.slice(st, en + 10) : ''; };
const dup = (b) => (b.split('id="moon-month-stats"').length - 1);
const vals = (sec) => [...sec.matchAll(/<span class="moon-stat-value">([^<]*)<\/span>/g)].map(m => m[1]);
const pctOf = (s) => { const m = String(s).match(/(\d+)\s*%/); return m ? parseInt(m[1], 10) : null; };
const twoNums = (s) => ((String(s).match(/\d+/g) || []).length >= 2);

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const IDX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
const APPJS = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const MOONJS = fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');

// English major phase names that must NOT reappear in the summary (no duplication with #moon-upcoming-section)
const EN_PHASES = ['Full Moon', 'New Moon', 'First Quarter', 'Last Quarter', 'Waxing Crescent', 'Waning Crescent', 'Waxing Gibbous', 'Waning Gibbous'];
const AR_PHASES = ['بدر', 'محاق', 'تربيع', 'أحدب', 'هلال'];

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        // ── A) month pages: forecast removed + data-driven summary present (per lang/city) ──
        console.log('── A) forecast removed + data-driven month summary (month pages) ──');
        const cases = [
            ['EN Cairo 2026/06', '/en/moon/egypt/cairo/2026/06', 'Cairo', 'June 2026', ['Highest illumination', 'Lowest illumination', 'Waxing period', 'Waning period'], 'en'],
            ['AR Cairo 2026/06', '/moon/egypt/cairo/2026/06', 'القاهرة', 'يونيو 2026', ['أعلى إضاءة', 'أدنى إضاءة', 'فترة التزايد', 'فترة التناقص'], 'ar'],
            ['EN Madrid 2026/01', '/en/moon/spain/madrid/2026/01', 'Madrid', 'January 2026', ['Highest illumination', 'Lowest illumination', 'Waxing period', 'Waning period'], 'en'],
            ['AR Riyadh 2026/09', '/moon/saudi-arabia/riyadh/2026/09', 'الرياض', 'سبتمبر 2026', ['أعلى إضاءة', 'أدنى إضاءة', 'فترة التزايد', 'فترة التناقص'], 'ar'],
        ];
        for (const [name, p, city, monthYear, labels, lang] of cases) {
            const b = (await req(p)).body;
            const sec = secOf(b);
            check(`${name}: #moon-month-stats present (exactly 1)`, !!sec && dup(b) === 1, String(dup(b)));
            check(`${name}: 14-day forecast REMOVED on month page`, !b.includes('id="moon-forecast"'));
            check(`${name}: H2 names city + month/year ("${city}" + "${monthYear}")`, /<h2[^>]*id="moon-month-stats-h2"/.test(sec) && sec.includes(city) && sec.includes(monthYear));
            check(`${name}: 4 stat labels present [${labels.join(', ')}]`, labels.every(l => sec.includes(l)), labels.filter(l => !sec.includes(l)).join(',') || 'all');
            const v = vals(sec);
            check(`${name}: exactly 4 stat values`, v.length === 4, String(v.length));
            check(`${name}: highest illumination ≥ 90% (${v[0]})`, pctOf(v[0]) !== null && pctOf(v[0]) >= 90);
            check(`${name}: lowest illumination ≤ 10% (${v[1]})`, pctOf(v[1]) !== null && pctOf(v[1]) <= 10);
            check(`${name}: waxing + waning are date ranges`, twoNums(v[2]) && twoNums(v[3]), `${v[2]} | ${v[3]}`);
            const phases = lang === 'ar' ? AR_PHASES : EN_PHASES;
            check(`${name}: NO major phase names in summary (no dup with #moon-upcoming-section)`, phases.every(ph => !sec.includes(ph)), phases.filter(ph => sec.includes(ph)).join(',') || 'none');
            check(`${name}: existing #moon-upcoming-section still present (untouched)`, b.includes('id="moon-upcoming-section"'));
            check(`${name}: #moon-month-context (db2bc18) survives the strip`, b.includes('id="moon-month-context"'));
            check(`${name}: #moon-other-cities survives the strip`, b.includes('id="moon-other-cities"'));
            check(`${name}: NO fc-month-group (865f505 not back)`, !b.includes('fc-month-group'));
        }

        // ── B) SEO contract unchanged on month pages ──
        console.log('\n── B) SEO contract (title 50-60, meta 120-160, H1=1, canonical self, hreflang, indexable) ──');
        for (const [name, p] of cases.map(c => [c[0], c[1]])) {
            const b = (await req(p)).body;
            const t = cp(titleOf(b)), m = cp(metaOf(b)), h1 = (b.match(/<h1\b/g) || []).length;
            const canonSelf = new RegExp(p.replace(/[/]/g, '\\/') + '"').test(b);
            check(`${name}: title 50-60 (${t}), meta 120-160 (${m}), H1=1 (${h1})`, t >= 50 && t <= 60 && m >= 120 && m <= 160 && h1 === 1);
            check(`${name}: canonical self + hreflang + noindex=false`, canonSelf && /<link rel="canonical"/.test(b) && /hreflang=/.test(b) && !/name="robots"[^>]*noindex/.test(b));
        }

        // ── C) 10-lang H2 present on month page ──
        console.log('\n── C) 10-lang: #moon-month-stats H2 present ──');
        const L10N = [
            ['ar', '/moon/egypt/cairo/2026/06'], ['en', '/en/moon/egypt/cairo/2026/06'], ['fr', '/fr/moon/france/paris/2026/06'],
            ['tr', '/tr/moon/turkey/istanbul/2026/06'], ['ur', '/ur/moon/pakistan/karachi/2026/06'], ['de', '/de/moon/germany/berlin/2026/06'],
            ['id', '/id/moon/indonesia/jakarta/2026/06'], ['es', '/es/moon/spain/madrid/2026/06'], ['bn', '/bn/moon/bangladesh/dhaka/2026/06'],
            ['ms', '/ms/moon/malaysia/kuala-lumpur/2026/06'],
        ];
        for (const [lang, p] of L10N) {
            const sec = secOf((await req(p)).body);
            check(`${lang}: summary H2 present + 4 stat values`, /<h2[^>]*id="moon-month-stats-h2"/.test(sec) && vals(sec).length === 4);
        }

        // ── D) scope: /today & /day keep the forecast (no summary); hub/year/country/home/prayer/qibla no summary ──
        console.log('\n── D) scope guard ──');
        const keepFc = ['/moon/egypt/cairo/today', '/moon/egypt/cairo/2026/06/14', '/moon/egypt/cairo'];
        for (const p of keepFc) {
            const b = (await req(p)).body;
            check(`${p}: keeps #moon-forecast + NO summary`, b.includes('id="moon-forecast"') && dup(b) === 0);
        }
        for (const p of ['/moon/egypt/cairo/2026', '/moon/egypt', '/moon', '/', '/prayer-times-in-cairo', '/qibla-in-cairo']) {
            check(`${p}: NO #moon-month-stats`, dup((await req(p)).body) === 0);
        }

        // ── E) source guards: server-side only, no cache-buster ──
        console.log('\n── E) source guards (server-only, no cache-buster, moon.js untouched) ──');
        check('server.js: MOON-CITY-MONTH-REMOVE-14DAY-TABLE-ADD-MONTH-SUMMARY-1 block present', /MOON-CITY-MONTH-REMOVE-14DAY-TABLE-ADD-MONTH-SUMMARY-1/.test(SRV));
        check('server.js: builds summary via MoonCalc.getMonthGrid, gated on _isMoonMonthPageSsr', /MoonCalc\.getMonthGrid\(_mY, _mM/.test(SRV) && /_monthSummaryHtml/.test(SRV));
        check('server.js: strips #moon-forecast on month pages', SRV.includes('Remove the 14-day forecast table on MONTH pages only'));
        check('index.html does NOT carry moon-month-stats (not a template change)', !IDX.includes('moon-month-stats'));
        check('css/style.css does NOT carry moon-month-stats (reuses existing classes)', !CSS.includes('moon-month-stats'));
        check('js/app.js does NOT carry moon-month-stats (server-side only)', !APPJS.includes('moon-month-stats'));
        check('index.html app.js?v=805 preserved (NO cache-buster)', /app\.js\?v=805\b/.test(IDX));
        check('js/moon.js untouched (no ticket marker)', !MOONJS.includes('MOON-CITY-MONTH-REMOVE-14DAY-TABLE'));

        console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`);
        s.kill('SIGKILL');
        process.exit(fail === 0 ? 0 : 1);
    } catch (e) {
        console.error('✗ smoke error:', e && e.message);
        try { s.kill('SIGKILL'); } catch (_) {}
        process.exit(1);
    }
})();
