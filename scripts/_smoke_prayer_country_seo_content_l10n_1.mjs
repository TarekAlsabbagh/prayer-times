// PRAYER-COUNTRY-SEO-CONTENT-L10N-1 verification (self-contained).
//
// The «available prayer times per city» section was added to AR+EN in the prior ticket; this ticket
// localizes it to the other 8 langs (fr/tr/ur/de/id/es/bn/ms) in _COUNTRY_SEO_L10N.sec. Verifies:
//   • the new section heading renders SSR in each of the 8 langs (per-lang needle) → 6 content blocks
//   • title ≤ 60 cp, meta 120–160 cp (unchanged from the closed base ticket)
//   • H1 = 1, FAQ = 5, FAQPage + BreadcrumbList JSON-LD, canonical self, robots index, hreflang ≥ 10
//   • AR + EN section still present (unchanged); regression: a lang-prefixed CITY page + discovered noindex
//
// Run: node scripts/_smoke_prayer_country_seo_content_l10n_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8192;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cpLen = s => [...(s || '')].length;

const FIXTURE = {
    'abu-hardub': { slug:'abu-hardub', lat:35.0223, lng:40.4392, timezone:'Asia/Damascus', country_code:'sy', type:'city', names:{ ar:'أبو حردوب', en:'Abu Hardoub' } }
};
const dir = mkdtempSync(path.join(tmpdir(), 'pc-l10n-'));
const fixturePath = path.join(dir, 'fixture.json');
writeFileSync(fixturePath, JSON.stringify(FIXTURE), 'utf8');

function get(p, depth) { return new Promise((res) => { http.get({ host:'localhost', port:PORT, path:p }, r => {
    if ([301,302,307,308].includes(r.statusCode) && r.headers.location && (depth||0)<3) { r.resume(); const loc=r.headers.location.replace(/^https?:\/\/[^/]+/,''); return res(get(loc,(depth||0)+1)); }
    let b=''; r.on('data',c=>b+=c); r.on('end',()=>res({ status:r.statusCode, body:b }));
}).on('error',()=>res({ status:0, body:'' })); }); }
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function waitReady(t){ const t0=Date.now(); while(Date.now()-t0<t){ const r=await get('/health'); if(r.status===200) return true; await sleep(400);} return false; }

let pass=0, fail=0;
const check=(l,ok,x)=>{ if(ok)pass++; else fail++; console.log(`${ok?'✓':'✗'} ${l}${x!==undefined?'   →  '+x:''}`); };
function parse(b){
    return {
        title:(b.match(/<title>([^<]*)<\/title>/)||[,''])[1],
        desc:(b.match(/<meta name="description" content="([^"]*)"/)||[,''])[1],
        robots:(b.match(/name="robots" content="([^"]*)"/)||[,''])[1],
        canon:((b.match(/rel="canonical" href="([^"]*)"/)||[,''])[1]).replace(/^https?:\/\/[^/]+/,''),
        h1n:(b.match(/<h1[\s>]/g)||[]).length,
        faqLd:/"@type"\s*:\s*"FAQPage"/.test(b),
        crumbLd:/"@type"\s*:\s*"BreadcrumbList"/.test(b),
        hreflang:(b.match(/rel="alternate" hreflang="/g)||[]).length,
        faqItems:(b.match(/class="country-faq-item"/g)||[]).length,
        blocks:(b.match(/class="country-seo-block">/g)||[]).length, // content sections only (excl. FAQ block + CSS refs)
    };
}
// [lang, new-section heading needle (distinctive, language-native)]
const LANGS = [
    ['fr','Heures de prière disponibles pour chaque ville de'],
    ['tr','İçindeki Her Şehrin Namaz Vakitleri'],
    ['ur','کے ہر شہر کے لیے دستیاب اوقاتِ نماز'],
    ['de','Verfügbare Gebetszeiten für jede Stadt in'],
    ['id','Jadwal Sholat yang Tersedia untuk Setiap Kota di'],
    ['es','Horarios de oración disponibles para cada ciudad de'],
    ['bn','প্রতিটি শহরের জন্য উপলব্ধ নামাজের সময়'],
    ['ms','Waktu Solat Tersedia untuk Setiap Bandar di'],
];

const srv = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT:String(PORT), DISCOVERED_SSR_TEST_FIXTURE:fixturePath, SUPABASE_URL:'', SUPABASE_SERVICE_ROLE_KEY:'' },
    stdio: ['ignore','ignore','ignore']
});
let exitCode = 1;
try {
    if (!await waitReady(20000)) { console.error('✗ server not ready :'+PORT); srv.kill('SIGKILL'); process.exit(1); }
    console.log('═══ PRAYER-COUNTRY-SEO-CONTENT-L10N-1 ═══\n');

    for (const [lang, needle] of LANGS) {
        const url = `/${lang}/prayer-times-in-saudi-arabia`;
        const r = await get(url); const m = parse(r.body);
        const tl = cpLen(m.title), dl = cpLen(m.desc);
        console.log(`── [${lang}] title[${tl}] meta[${dl}] blocks=${m.blocks}`);
        check(`${lang} 200`, r.status===200, r.status);
        check(`${lang} NEW section rendered SSR`, r.body.includes(needle));
        check(`${lang} 6 content blocks (was 5)`, m.blocks===6, m.blocks);
        check(`${lang} title ≤ 60`, tl<=60, `[${tl}] ${m.title}`);
        check(`${lang} meta 120–160`, dl>=120 && dl<=160, `[${dl}]`);
        check(`${lang} H1 = 1`, m.h1n===1, m.h1n);
        check(`${lang} FAQ = 5`, m.faqItems===5, m.faqItems);
        check(`${lang} FAQPage + Breadcrumb JSON-LD`, m.faqLd && m.crumbLd, `${m.faqLd}/${m.crumbLd}`);
        check(`${lang} canonical = ${url}`, m.canon===url, m.canon);
        check(`${lang} robots index`, /(^|,)index,follow/.test(m.robots));
        check(`${lang} hreflang ≥ 10`, m.hreflang>=10, m.hreflang);
        console.log('');
    }

    // ── AR + EN section still present (unchanged) ──
    console.log('── AR + EN unchanged (still 6 blocks + section) ──');
    const ar = await get('/prayer-times-in-saudi-arabia'); const arm = parse(ar.body);
    check('AR still has section «أوقات الصلاة المتاحة»', ar.body.includes('أوقات الصلاة المتاحة لكل مدينة') && arm.blocks===6, arm.blocks);
    const en = await get('/en/prayer-times-in-saudi-arabia'); const enm = parse(en.body);
    check('EN still has section «Prayer Times Available» + 6 blocks', en.body.includes('Prayer Times Available for Each City') && enm.blocks===6, enm.blocks);

    // ── regression ──
    console.log('\n── regression ──');
    const fr = await get('/fr/prayer-times-in-riyadh'); const frm = parse(fr.body);
    check('lang CITY /fr/prayer-times-in-riyadh 200 + index', fr.status===200 && /(^|,)index/.test(frm.robots), fr.status+' '+frm.robots);
    check('  → NOT a country page (no country «available» heading)', !fr.body.includes('Heures de prière disponibles pour chaque ville de'));
    const ah = await get('/prayer-times-in-abu-hardub'); const ahm = parse(ah.body);
    check('DISCOVERED /prayer-times-in-abu-hardub 200 + noindex', ah.status===200 && /noindex/.test(ahm.robots), ah.status+' '+ahm.robots);

    console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail===0?0:1;
} finally { srv.kill('SIGKILL'); }
process.exit(exitCode);
