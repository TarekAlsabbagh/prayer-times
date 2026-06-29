// MOON-CITY-MONTH-KEYWORD-CONSISTENCY-DATA-DRIVEN-CONTEXT-1 — verification (self-contained).
//
// The moon MONTH page (/moon/{country}/{city}/{yyyy}/{mm}) repeats the moon-phase words and the Hijri
// month names many times in its forecast/calendar; SEOptimer read them as the page's main words but
// they were absent from the headings → "Keyword Consistency". Fix: a VISIBLE, DATA-DRIVEN context
// block (#moon-month-context) injected SSR before #moon-forecast — H2 + intro naming the real Hijri
// month(s) this Gregorian month spans + an H3 legend of the moon phases ACTUALLY present in the month
// grid (same MoonCalc engine as the table; AR phase names for ar, English otherwise). MONTH pages only.
// Server-side: reuses .section-card → no app.js / index.html / css / cache-buster; the table is untouched.
//
// Run: node scripts/_smoke_moon_city_month_keyword_consistency_data_driven_context_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8289;
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
const titleOf = (b) => ((b.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/&amp;/g, '&');
const metaOf = (b) => ((b.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/&amp;/g, '&');
const ctxSec = (b) => { const i = b.indexOf('id="moon-month-context"'); if (i < 0) return ''; const st = b.lastIndexOf('<section', i); const en = b.indexOf('</section>', i); return (st >= 0 && en >= 0) ? b.slice(st, en + 10) : ''; };
const dupCount = (b) => (b.split('id="moon-month-context"').length - 1);

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const IDX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        // ── A) the data-driven context block is present (once) + data-driven content, per lang/city ──
        console.log('── A) data-driven month context (per lang/city) ──');
        const cases = [
            ['EN Cairo 2026/06', '/en/moon/egypt/cairo/2026/06', ['Dhu al-Hijjah', 'Muharram'], ['Waxing', 'Waning', 'Crescent', 'Gibbous', 'Full Moon', 'New Moon', 'Moon phases', 'Hijri'], 'Moon phases and Hijri months'],
            ['AR Cairo 2026/06', '/moon/egypt/cairo/2026/06', ['ذو الحجة', 'محرم'], ['هلال', 'أحدب', 'بدر', 'محاق', 'متزايد', 'متناقص', 'أطوار القمر', 'الهجري'], 'أطوار القمر والشهور الهجرية'],
            ['EN Madrid 2026/01', '/en/moon/spain/madrid/2026/01', ['Rajab', 'Shaban'], ['Waxing', 'Full Moon', 'Moon phases'], 'Moon phases and Hijri months'],
            ['AR Riyadh 2026/09', '/moon/saudi-arabia/riyadh/2026/09', ['ربيع'], ['أطوار القمر', 'هلال'], 'أطوار القمر والشهور الهجرية'],
            ['FR Paris 2026/06', '/fr/moon/france/paris/2026/06', ['Mouharram'], ['Phases de la Lune'], 'Phases de la Lune et mois hégiriens'],
        ];
        for (const [name, p, hijri, terms, h2needle] of cases) {
            const b = (await req(p)).body;
            const sec = ctxSec(b);
            check(`${name}: #moon-month-context present (exactly 1)`, !!sec && dupCount(b) === 1, String(dupCount(b)));
            check(`${name}: H2 names phases+Hijri ("${h2needle}…")`, /<h2[^>]*id="moon-month-context-h2"/.test(sec) && sec.includes(h2needle));
            check(`${name}: two H3 sub-headings (Hijri months + phases)`, (sec.match(/<h3\b/g) || []).length === 2);
            check(`${name}: data-driven Hijri month(s) [${hijri.join(',')}]`, hijri.every(h => sec.includes(h)), '');
            check(`${name}: phase/Hijri keyword terms present in the block`, terms.every(t => sec.includes(t)), terms.filter(t => !sec.includes(t)).join(',') || 'all');
        }

        // ── B) SEO contract unchanged (title 50-60, meta 120-160, H1=1) + table untouched ──
        console.log('\n── B) title/meta/H1 contract + table untouched ──');
        for (const [name, p] of cases.map(c => [c[0], c[1]])) {
            const b = (await req(p)).body;
            const t = cp(titleOf(b)), m = cp(metaOf(b)), h1 = (b.match(/<h1\b/g) || []).length;
            check(`${name}: title 50-60 (${t}), meta 120-160 (${m}), H1=1`, t >= 50 && t <= 60 && m >= 120 && m <= 160 && h1 === 1, `t=${t} m=${m} h1=${h1}`);
            check(`${name}: NO fc-month-group (865f505 not reintroduced)`, !b.includes('fc-month-group'));
            // MOON-CITY-MONTH-REMOVE-14DAY-TABLE-ADD-MONTH-SUMMARY-1 (2026-06-29): the 14-day forecast
            // is now REMOVED on month pages (kept on /today) and replaced by #moon-month-stats.
            check(`${name}: 14-day forecast REMOVED on month page`, !b.includes('id="moon-forecast"'));
            check(`${name}: month summary present (replacement)`, b.includes('id="moon-month-stats"'));
            check(`${name}: canonical self + hreflang present + noindex=false`, /<link rel="canonical"/.test(b) && /hreflang=/.test(b) && !/name="robots"[^>]*noindex/.test(b));
        }

        // ── C) scope: ONLY month pages (not hub/today/day/year/country/home/prayer/qibla) ──
        console.log('\n── C) scope guard — month pages only ──');
        for (const p of ['/moon/egypt/cairo', '/moon/egypt/cairo/today', '/moon/egypt/cairo/2026/06/14', '/moon/egypt/cairo/2026', '/moon/egypt', '/moon', '/', '/prayer-times-in-cairo', '/qibla-in-cairo']) {
            check(`${p}: NO #moon-month-context`, dupCount((await req(p)).body) === 0);
        }

        // ── D) source guards: server-side only, no cache-buster ──
        console.log('\n── D) source guards (server-only, no cache-buster) ──');
        check('server.js: MOON-CITY-MONTH-KEYWORD-CONSISTENCY-DATA-DRIVEN-CONTEXT-1 block present', /MOON-CITY-MONTH-KEYWORD-CONSISTENCY-DATA-DRIVEN-CONTEXT-1/.test(SRV));
        check('server.js: gated on _isMoonMonthPageSsr + builds via MoonCalc.getMonthGrid', /if \(_isMoonMonthPageSsr && _monthYearSsr && _monthMonthSsr\)/.test(SRV) && /MoonCalc\.getMonthGrid\(_monthYearSsr/.test(SRV));
        check('index.html does NOT carry moon-month-context (not a template change)', !IDX.includes('moon-month-context'));
        check('css/style.css does NOT carry moon-month-context (reuses .section-card)', !CSS.includes('moon-month-context'));
        check('index.html app.js?v=805 preserved (NO cache-buster)', /app\.js\?v=805\b/.test(IDX));

        console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`);
        s.kill('SIGKILL');
        process.exit(fail === 0 ? 0 : 1);
    } catch (e) {
        console.error('✗ smoke error:', e && e.message);
        try { s.kill('SIGKILL'); } catch (_) {}
        process.exit(1);
    }
})();
