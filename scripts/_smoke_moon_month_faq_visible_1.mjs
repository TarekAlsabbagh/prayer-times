// MOON-MONTH-FAQ-VISIBLE-1 — local smoke (no network beyond 127.0.0.1).
// Boots the BASE tree and the CANDIDATE tree (same fixed test clock, AdSense off, Supabase off,
// a discovered-place fixture whose names carry HTML metacharacters) and checks, on nested month
// pages /[lang/]moon/{country}/{city}/{yyyy}/{mm} in all 10 languages:
//   A) raw HTML (no JavaScript): the visible FAQ (#moon-city-hub-faq) has a real title and 8 Q/A
//      on the candidate (no "—"), and each visible Q/A equals the FAQPage JSON-LD Q/A;
//   B) the FAQPage JSON-LD is byte-identical between BASE and CANDIDATE;
//   C) outside the FAQ section the page body is unchanged (normalised for per-request noise);
//   D) escaping: names with < > & " ' are HTML-escaped in the section (no raw tag, no raw quote);
//   E) other moon pages (city hub, year, moon-today) are unchanged.
// Usage: node scripts/_smoke_moon_month_faq_visible_1.mjs <baseRoot> <candRoot> [outJson]
//   (set NODE_PATH to a node_modules folder if a root has none of its own)
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const BASE = process.argv[2], CAND = process.argv[3], OUT = process.argv[4] || '';
if (!BASE || !CAND) { console.error('usage: <baseRoot> <candRoot> [outJson]'); process.exit(2); }
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const PB = 8881, PC = 8882;
let pass = 0, fail = 0; const failures = []; const evidence = { before: {}, after: {}, other: {} };
const ok = (cond, label, extra) => { if (cond) pass++; else { fail++; failures.push(label + (extra ? ' :: ' + extra : '')); } };

// Hostile discovered city (inert seams: read only while Supabase is off). DISCOVERED_SSR_TEST_RAW_NAMES=1
//   skips the read-side name clean, so the names reach the page raw and the FAQ escaping is tested on its
//   own. Latin pages get a Latin tag payload; ar/ur/bn need a native-script name (script gate), so they
//   carry the HTML metacharacters with native letters.
const HOSTILE = `<img src=x onerror=alert(1)>&"Q'`;
const HOSTILE_NAME = {
    ar: `فاق <ب>&"ق'`, ur: `فاق <ب>&"ق'`, bn: `ফাক <ক>&"ক'`,
};
const hostileFor = (l) => HOSTILE_NAME[l] || ('Faqtown ' + HOSTILE);
const FIXTURE = {
    'faqtown': {
        slug: 'faqtown', lat: 27.5, lng: 1.5, timezone: 'Africa/Algiers', country_code: 'dz', type: 'city',
        names: Object.fromEntries(LANGS.map(l => [l, hostileFor(l)]))
    }
};
const fxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mmfaq-'));
const fxPath = path.join(fxDir, 'fixture.json');
fs.writeFileSync(fxPath, JSON.stringify(FIXTURE), 'utf8');

async function boot(root, port) {
    const env = { ...process.env, PORT: String(port), ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0', WEB_CONCURRENCY: '1',
        TP_MOON_RANGE_TEST_NOW: '2026-11-17T12:00:00Z', DISCOVERED_SSR_TEST_FIXTURE: fxPath, DISCOVERED_SSR_TEST_RAW_NAMES: '1', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' };
    const p = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'ignore'] });
    for (let i = 0; i < 80; i++) {
        await new Promise(r => setTimeout(r, 500));
        try { const r = await fetch(`http://127.0.0.1:${port}/health`); if (r.status === 200) return p; } catch (_) {}
    }
    p.kill(); throw new Error('boot failed ' + root + ' ' + port);
}
async function get(port, u) {
    const r = await fetch(`http://127.0.0.1:${port}${u}`, { redirect: 'manual' });
    const body = r.status === 200 ? await r.text() : (await r.arrayBuffer(), '');
    return { s: r.status, loc: r.headers.get('location') || '', body };
}
const dec = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
function faqSection(body) {
    const at = body.indexOf('id="moon-city-hub-faq"');
    if (at === -1) return null;
    const s0 = body.lastIndexOf('<section', at), s1 = body.indexOf('</section>', at);
    const sec = body.slice(s0, s1 + 10);
    const pick = (re) => { const m = sec.match(re); return m ? m[1] : null; };
    const items = [];
    for (let i = 1; i <= 8; i++) items.push({ q: pick(new RegExp('<summary class="moon-city-hub-faq-q' + i + '"[^>]*>([^<]*)</summary>')),
        a: pick(new RegExp('<p class="moon-city-hub-faq-a' + i + '"[^>]*>([^<]*)</p>')) });
    return { s0, s1: s1 + 10, sec, title: pick(/<span class="moon-city-hub-faq-title-text"[^>]*>([^<]*)<\/span>/), items, ssr: /data-ssr-month-faq="1"/.test(sec) };
}
function faqJsonLd(body) {
    const out = [];
    for (const m of body.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
        let j; try { j = JSON.parse(m[1]); } catch (_) { continue; }
        const nodes = Array.isArray(j) ? j : (j['@graph'] || [j]);
        for (const n of nodes) if (n && n['@type'] === 'FAQPage') out.push({ raw: JSON.stringify(n), items: n.mainEntity.map(e => ({ q: e.name, a: e.acceptedAnswer.text })) });
    }
    return out;
}
const norm = (b) => b.replace(/\r\n/g, '\n').replace(/nonce="[^"]*"/g, 'nonce=""').replace(/https?:\/\/(127\.0\.0\.1|localhost):\d+/g, 'ORIGIN')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/g, 'TS').replace(/[?&]b=[0-9a-f]{7}/g, '').replace(/app\.js\?v=\d+/g, 'app.js?v=N');
const firstDiff = (x, y) => { let i = 0; while (i < x.length && x[i] === y[i]) i++; return JSON.stringify(x.slice(Math.max(0, i - 80), i + 120)) + ' => ' + JSON.stringify(y.slice(Math.max(0, i - 80), i + 120)); };
const lp = (l) => (l === 'ar' ? '' : '/' + l);
const DASH = '—';

const MONTH_PAGES = [   // [country slug, city slug, yyyy, mm, note]
    ['saudi-arabia', 'riyadh', 2026, 12, 'famous, in window'],
    ['saudi-arabia', 'makkah', 2027, 1, 'famous alias, next year'],
    ['south-korea', 'seoul', 2026, 12, 'demand list'],
    ['saudi-arabia', 'abha', 2026, 12, 'outside list (noindex)'],
    ['saudi-arabia', 'riyadh', 2029, 5, 'outside window (noindex)'],
    ['china', 'xian', 2026, 12, "apostrophe in name (Xi'an)"],
    ['algeria', 'faqtown', 2026, 12, 'discovered fixture, hostile name'],
];

async function main() {
    const pb = await boot(BASE, PB), pc = await boot(CAND, PC);
    try {
        for (const [co, ci, y, m, note] of MONTH_PAGES) for (const L of LANGS) {
            const u = `${lp(L)}/moon/${co}/${ci}/${y}/${String(m).padStart(2, '0')}`;
            const b = await get(PB, u), c = await get(PC, u);
            ok(c.s === 200 && b.s === 200, `status ${u}`, `${b.s}/${c.s}`);
            if (c.s !== 200 || b.s !== 200) continue;
            const fb = faqSection(b.body), fc = faqSection(c.body);
            ok(!!fc && !!fb, `faq section present ${u}`);
            if (!fc || !fb) continue;
            const jb = faqJsonLd(b.body), jc = faqJsonLd(c.body);
            ok(jc.length === 1 && jb.length === 1, `one FAQPage ${u}`, `${jb.length}/${jc.length}`);
            // B) JSON-LD unchanged
            ok(jb[0] && jc[0] && norm(jb[0].raw) === norm(jc[0].raw), `FAQPage JSON-LD unchanged ${u}`, jb[0] && jc[0] && norm(jb[0].raw) !== norm(jc[0].raw) ? firstDiff(norm(jb[0].raw), norm(jc[0].raw)) : '');
            // before (base): placeholders
            const dashB = [fb.title, ...fb.items.flatMap(i => [i.q, i.a])].filter(t => t === DASH).length;
            evidence.before[u] = { dashes: dashB, a1: fb.items[0].a };
            // A) candidate: filled + equal to JSON-LD
            const dashC = [fc.title, ...fc.items.flatMap(i => [i.q, i.a])].filter(t => t === null || t.trim() === '' || t === DASH).length;
            ok(dashC === 0, `no placeholder ${u}`, String(dashC));
            ok(fc.ssr, `data-ssr-month-faq ${u}`);
            // visible: the month FAQ no longer carries the hide-unless-hub class (html.moon-hub-page is not set on nested routes)
            ok(!/moon-city-hub-only/.test(fc.sec.slice(0, fc.sec.indexOf('>'))), `faq section not hub-only-hidden ${u}`);
            evidence.before[u + '#class'] = (fb.sec.match(/^<section[^>]*class="([^"]*)"/) || [])[1];
            const vis = fc.items.map(i => ({ q: dec(i.q || ''), a: dec(i.a || '') }));
            ok(JSON.stringify(vis) === JSON.stringify(jc[0].items), `visible == JSON-LD ${u}`,
                vis.map((v, k) => (v.q !== jc[0].items[k].q ? 'q' + (k + 1) : '') + (v.a !== jc[0].items[k].a ? 'a' + (k + 1) : '')).join(''));
            evidence.after[u] = { title: dec(fc.title || ''), a1: vis[0].a, a3: vis[2].a };
            // no rise/set claim for EACH DAY in answer 1 (H wording kept)
            ok(!/rise\/set|moonrise\/moonset|الشروق والغروب لكل يوم|Auf-\/Untergangszeiten für jeden Tag/.test(vis[0].a), `a1 keeps H wording ${u}`);
            // C) body equal outside the FAQ section
            const bOut = norm(b.body.slice(0, fb.s0) + '§FAQ§' + b.body.slice(fb.s1));
            const cOut = norm(c.body.slice(0, fc.s0) + '§FAQ§' + c.body.slice(fc.s1));
            ok(bOut === cOut, `body outside FAQ unchanged ${u}`, bOut === cOut ? '' : firstDiff(bOut, cOut));
            // D) escaping
            if (ci === 'faqtown' || ci === 'xian') {
                // only the section's own markup may appear as tags
                const foreign = fc.sec.match(/<(?!\/?(?:section|h2|svg|use|span|details|summary|p)\b)[^>]*>/);
                ok(!foreign, `no raw tag ${u}`, foreign ? foreign[0] : '');
                const textChunks = fc.sec.replace(/<[^>]*>/g, '\u0000');
                ok(!/["'<>]/.test(textChunks.replace(/\u0000/g, '')), `no raw quote/angle in text ${u}`);
                if (ci === 'faqtown') {
                    const H = hostileFor(L);
                    const esc = H.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                    ok(vis[0].q.includes(H) && fc.sec.includes(esc) && vis[0].q === jc[0].items[0].q, `hostile name escaped ${u}`,
                        JSON.stringify(vis[0].q) + ' || ' + JSON.stringify((fc.sec.match(/faq-q1"[^>]*>([^<]*)/) || [])[1]));
                }
                if (ci === 'xian' && L !== 'ar' && L !== 'ur' && L !== 'bn') ok(fc.sec.includes('&#39;'), `apostrophe escaped ${u}`);
            }
        }
        // E) other moon pages unchanged (city hub, year, today hub, legacy month redirect)
        for (const L of LANGS) for (const u of [`${lp(L)}/moon/saudi-arabia/riyadh`, `${lp(L)}/moon/saudi-arabia/riyadh/2026`, `${lp(L)}/moon-today`, `${lp(L)}/moon-in-riyadh/2026-12`]) {
            const b = await get(PB, u), c = await get(PC, u);
            ok(b.s === c.s && b.loc === c.loc, `other status ${u}`, `${b.s}->${c.s} ${b.loc}|${c.loc}`);
            ok(norm(b.body) === norm(c.body), `other body unchanged ${u}`, norm(b.body) === norm(c.body) ? '' : firstDiff(norm(b.body), norm(c.body)));
            evidence.other[u] = { status: c.s, location: c.loc };
        }
    } finally { pb.kill(); pc.kill(); fs.rmSync(fxDir, { recursive: true, force: true }); }
    console.log(`PASS ${pass} / FAIL ${fail}`);
    failures.slice(0, 40).forEach(f => console.log('  FAIL', f));
    if (OUT) fs.writeFileSync(OUT, JSON.stringify({ pass, fail, failures, evidence }, null, 1), 'utf8');
    process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(2); });
