// MOON-HUB-KEYWORD-CONSISTENCY-ALL-LANGS-1 — verification (self-contained).
//
// The global /moon hub distributes its REAL moon keywords across title / meta / H1 / H2 (not random
// SEO-tool tokens). This smoke pins: AR title+H1 carry «تقويم القمر»; the 4 previously-missing keywords
// (المحاق / تقويم القمر / رؤية الهلال / بيانات القمر) now appear inside <h2>; the 2 new SSR sections
// (moon-seo-calendar / moon-seo-hilal) render on the hub ONLY; single H1; titles ≤60; no AR/EN fallback
// in other langs; and /moon/{country} is untouched (no new hub sections leak there).
//
// Run: node scripts/_smoke_moon_hub_keyword_consistency_all_langs_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8251;
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
const titleOf = (b) => { const m = (b.match(/<title>([^<]*)<\/title>/) || [])[1] || ''; return m.replace(/&amp;/g, '&').replace(/&#39;/g, "'"); };
const metaOf = (b) => ((b.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
const h1Count = (b) => (b.match(/<h1\b/g) || []).length;
const h1Text = (b) => { const m = b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : ''; };
const h2Joined = (b) => (b.match(/<h2[^>]*>([\s\S]*?)<\/h2>/g) || []).map(s => s.replace(/<[^>]+>/g, '')).join(' | ');

let exitCode = 1;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

    // ── A) AR hub: title + H1 + heading keyword coverage ──
    console.log('\n── A) /moon (AR) keyword distribution ──');
    const ar = await req('/moon');
    check('200', ar.status === 200, String(ar.status));
    check('title carries «حالة القمر اليوم» + «تقويم القمر»', /حالة القمر اليوم/.test(titleOf(ar.body)) && /تقويم القمر/.test(titleOf(ar.body)), titleOf(ar.body));
    check('title ≤ 60', [...titleOf(ar.body)].length <= 60, String([...titleOf(ar.body)].length));
    check('exactly one H1', h1Count(ar.body) === 1, String(h1Count(ar.body)));
    check('H1 carries «حالة القمر اليوم وتقويم القمر»', /حالة القمر اليوم/.test(h1Text(ar.body)) && /تقويم القمر/.test(h1Text(ar.body)), h1Text(ar.body));
    const _arH2 = h2Joined(ar.body);
    for (const kw of ['المحاق', 'تقويم القمر', 'رؤية الهلال', 'بيانات القمر', 'البدر', 'أطوار القمر', 'طور القمر']) {
        check(`H2 set contains «${kw}»`, _arH2.includes(kw));
    }
    check('meta carries المحاق + تقويم القمر', /المحاق/.test(metaOf(ar.body)) && /تقويم القمر/.test(metaOf(ar.body)));
    check('2 new hub sections present (moon-seo-calendar + moon-seo-hilal)', ar.body.includes('moon-seo-calendar') && ar.body.includes('moon-seo-hilal'));

    // ── B) EN hub: title + H1 ──
    console.log('\n── B) /en/moon keyword distribution ──');
    const en = await req('/en/moon');
    check('title carries «Moon Today» + «Moon Calendar»', /Moon Today/.test(titleOf(en.body)) && /Moon Calendar/.test(titleOf(en.body)), titleOf(en.body));
    check('H1 carries «Moon Calendar»', /Moon Calendar/.test(h1Text(en.body)), h1Text(en.body));
    check('H2 set contains New Moon + Crescent', /New Moon/.test(h2Joined(en.body)) && /Crescent/.test(h2Joined(en.body)));
    check('2 new hub sections present', en.body.includes('moon-seo-calendar') && en.body.includes('moon-seo-hilal'));

    // ── C) no AR/EN fallback in other langs (title is in the page's own script) ──
    console.log('\n── C) native, no fallback ──');
    const ur = await req('/ur/moon'); const bn = await req('/bn/moon'); const fr = await req('/fr/moon');
    check('UR title is Urdu (چاند) and NOT English «Moon Calendar»', /چاند/.test(titleOf(ur.body)) && !/Moon Calendar/.test(titleOf(ur.body)), titleOf(ur.body));
    check('BN title is Bengali (চাঁদ) and NOT English «Moon Calendar»', /চাঁদ/.test(titleOf(bn.body)) && !/Moon Calendar/.test(titleOf(bn.body)), titleOf(bn.body));
    check('FR title is French (calendrier lunaire), not Arabic/English', /calendrier lunaire/.test(titleOf(fr.body)) && !/Moon Calendar/.test(titleOf(fr.body)), titleOf(fr.body));
    check('UR + BN single H1', h1Count(ur.body) === 1 && h1Count(bn.body) === 1);
    check('all three carry the 2 new hub sections', ur.body.includes('moon-seo-hilal') && bn.body.includes('moon-seo-hilal') && fr.body.includes('moon-seo-hilal'));

    // ── D) scope: the new hub sections do NOT leak to /moon/{country} ──
    console.log('\n── D) scope (hub-only) ──');
    const country = await req('/moon/saudi-arabia');
    check('/moon/saudi-arabia 200', country.status === 200, String(country.status));
    check('NO moon-seo-calendar / moon-seo-hilal on /moon/{country}', !country.body.includes('moon-seo-calendar') && !country.body.includes('moon-seo-hilal'));

    s.kill('SIGKILL');
    exitCode = fail === 0 ? 0 : 1;
} catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
process.exit(exitCode);
