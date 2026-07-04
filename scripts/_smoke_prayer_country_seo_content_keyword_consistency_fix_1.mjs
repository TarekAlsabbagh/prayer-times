// PRAYER-COUNTRY-SEO-CONTENT-KEYWORD-CONSISTENCY-FIX-1 verification (self-contained).
//
// Verifies the /prayer-times-in-{country} SEO layer after the title/meta ladder + content additions:
//   • Title = length-aware ladder aiming 50–60 code points, keyword-first («مواقيت الصلاة في {C}» /
//     «Prayer Times in {C}»), never > 60. Long AR names may land 48–50 (documented, not a fail).
//   • Meta = length-aware LONG/SHORT, 120–160 cp, keyword-first.
//   • H1 = 1 and carries the country name. FAQ = 5 (H3) with FAQPage JSON-LD. BreadcrumbList JSON-LD.
//   • NEW «available prayer times per city» section present (AR + EN).
//   • canonical self, robots index,follow, hreflang alternates present.
//   • Regression: a CITY page (riyadh) keeps its own title (NOT the country «حسب مدنها» template);
//     a discovered city (abu-hardub) stays noindex.
//
// Run: node scripts/_smoke_prayer_country_seo_content_keyword_consistency_fix_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8186;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cpLen = s => [...(s || '')].length;

const FIXTURE = {
    'abu-hardub': { slug:'abu-hardub', lat:35.0223, lng:40.4392, timezone:'Asia/Damascus', country_code:'sy', type:'city', names:{ ar:'أبو حردوب', en:'Abu Hardoub' } }
};
const dir = mkdtempSync(path.join(tmpdir(), 'pc-seo-'));
const fixturePath = path.join(dir, 'fixture.json');
writeFileSync(fixturePath, JSON.stringify(FIXTURE), 'utf8');

function get(p, depth) { return new Promise((res) => { http.get({ host:'localhost', port:PORT, path:p }, r => {
    if ([301,302,307,308].includes(r.statusCode) && r.headers.location && (depth||0)<3) { r.resume(); const loc=r.headers.location.replace(/^https?:\/\/[^/]+/,''); return res(get(loc,(depth||0)+1)); }
    let b=''; r.on('data',c=>b+=c); r.on('end',()=>res({ status:r.statusCode, body:b }));
}).on('error',()=>res({ status:0, body:'' })); }); }
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function waitReady(t){ const t0=Date.now(); while(Date.now()-t0<t){ const r=await get('/health'); if(r.status===200) return true; await sleep(400);} return false; }

let pass=0, fail=0; const notes=[];
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
    };
}
function seoWords(b){
    const m = b.match(/<div id="country-seo-content">([\s\S]*?)<\/div>\s*(?:<\/section>|<script|<div id=)/);
    const seg = m ? m[1] : (b.match(/country-seo-wrap[\s\S]*?(?=<footer|<script type="application\/ld)/)||[,''])[1];
    const txt = seg.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    return txt ? txt.split(' ').length : 0;
}

// [slug, lang, localizedCountryName, keywordPrefix, newSectionNeedle]
const CASES = [
    ['saudi-arabia','ar','المملكة العربية السعودية','مواقيت الصلاة في المملكة العربية السعودية','أوقات الصلاة المتاحة لكل مدينة'],
    ['egypt','ar','مصر','مواقيت الصلاة في مصر','أوقات الصلاة المتاحة لكل مدينة'],
    ['qatar','ar','قطر','مواقيت الصلاة في قطر','أوقات الصلاة المتاحة لكل مدينة'],
    ['bahrain','ar','البحرين','مواقيت الصلاة في البحرين','أوقات الصلاة المتاحة لكل مدينة'],
    ['cape-verde','ar','الرأس الأخضر','مواقيت الصلاة في الرأس الأخضر','أوقات الصلاة المتاحة لكل مدينة'],
    ['seychelles','ar','سيشل','مواقيت الصلاة في سيشل','أوقات الصلاة المتاحة لكل مدينة'],
    ['saudi-arabia','en','Saudi Arabia','Prayer Times in Saudi Arabia','Prayer Times Available for Each City'],
    ['egypt','en','Egypt','Prayer Times in Egypt','Prayer Times Available for Each City'],
    ['qatar','en','Qatar','Prayer Times in Qatar','Prayer Times Available for Each City'],
    ['cape-verde','en','Cape Verde','Prayer Times in Cape Verde','Prayer Times Available for Each City'],
    ['seychelles','en','Seychelles','Prayer Times in Seychelles','Prayer Times Available for Each City'],
];

const srv = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT:String(PORT), DISCOVERED_SSR_TEST_FIXTURE:fixturePath, SUPABASE_URL:'', SUPABASE_SERVICE_ROLE_KEY:'' },
    stdio: ['ignore','ignore','ignore']
});
let exitCode = 1;
try {
    if (!await waitReady(20000)) { console.error('✗ server not ready :'+PORT); srv.kill('SIGKILL'); process.exit(1); }
    console.log('═══ PRAYER-COUNTRY-SEO-CONTENT-KEYWORD-CONSISTENCY-FIX-1 ═══\n');

    for (const [slug, lang, cn, kw, sect] of CASES) {
        const url = lang==='en' ? `/en/prayer-times-in-${slug}` : `/prayer-times-in-${slug}`;
        const r = await get(url); const m = parse(r.body);
        const tl = cpLen(m.title), dl = cpLen(m.desc), w = seoWords(r.body);
        const tag = `[${lang}] ${slug}`;
        console.log(`── ${tag}  title[${tl}] meta[${dl}] words≈${w}`);
        check(`${tag} 200`, r.status===200, r.status);
        check(`${tag} title ≤ 60 cp`, tl<=60, `[${tl}] ${m.title}`);
        check(`${tag} title ≥ 48 cp`, tl>=48, `[${tl}] ${m.title}`);
        if (tl>=48 && tl<50) notes.push(`${tag} title ${tl}cp (long name, <50 by design)`);
        check(`${tag} title keyword-first «${kw.slice(0,22)}…»`, m.title.startsWith(kw), m.title);
        check(`${tag} meta 120–160 cp`, dl>=120 && dl<=160, `[${dl}] ${m.desc.slice(0,50)}…`);
        check(`${tag} meta contains keyword`, m.desc.includes(kw) || m.desc.toLowerCase().includes(kw.toLowerCase()), m.desc.slice(0,60));
        check(`${tag} H1 = 1`, m.h1n===1, m.h1n);
        check(`${tag} body carries country «${cn}»`, r.body.includes(cn));
        check(`${tag} NEW section «${sect.slice(0,20)}…» present`, r.body.includes(sect));
        check(`${tag} FAQ = 5 items`, m.faqItems===5, m.faqItems);
        check(`${tag} FAQPage JSON-LD`, m.faqLd);
        check(`${tag} BreadcrumbList JSON-LD`, m.crumbLd);
        check(`${tag} robots index,follow`, /(^|,)index,follow/.test(m.robots), m.robots);
        check(`${tag} canonical = ${url}`, m.canon===url, m.canon);
        check(`${tag} hreflang alternates ≥ 10`, m.hreflang>=10, m.hreflang);
        console.log('');
    }

    // ── REGRESSION ──
    console.log('── regression ──');
    const rc = await get('/prayer-times-in-riyadh'); const rcm = parse(rc.body);
    check('CITY /prayer-times-in-riyadh 200 + index', rc.status===200 && /(^|,)index/.test(rcm.robots), rc.status+' '+rcm.robots);
    check('CITY riyadh title carries «الرياض»', rcm.title.includes('الرياض'), rcm.title);
    check('CITY riyadh title is NOT the country «حسب مدنها» template', !rcm.title.includes('حسب مدنها'), rcm.title);
    const ah = await get('/prayer-times-in-abu-hardub'); const ahm = parse(ah.body);
    check('DISCOVERED /prayer-times-in-abu-hardub 200 + noindex', ah.status===200 && /noindex/.test(ahm.robots), ah.status+' '+ahm.robots);
    // country page for a DISCOVERED-only country slug still gated appropriately (sanity: syria country page works)
    const sc = await get('/prayer-times-in-syria'); const scm = parse(sc.body);
    check('country /prayer-times-in-syria title keyword-first', scm.title.startsWith('مواقيت الصلاة في'), scm.title);
    check('country /prayer-times-in-syria title ≤ 60', cpLen(scm.title)<=60, cpLen(scm.title)+' '+scm.title);

    if (notes.length) { console.log('\n── notes ──'); notes.forEach(n=>console.log('  • '+n)); }
    console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail===0?0:1;
} finally { srv.kill('SIGKILL'); }
process.exit(exitCode);
