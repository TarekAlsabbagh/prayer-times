// SHAPBOT-ROBOTS-BLOCK-1 — robots.txt regression guard (local only, no network).
//   Boots this tree on 127.0.0.1 (outbound guard, ADSENSE off) and checks /robots.txt against PREV, the robots.txt that
//   production served before this ticket (db5afa7), using RFC 9309 matching as Google documents it ('*' = any run incl.
//   '/', '$' = end, longest match wins, Allow wins a tie, a crawler reads only the group that names it, else '*'):
//   [G] groups: '*', 'GPTBot' (Disallow: / only) and 'ShapBot'. Drift guard: the ShapBot group == the '*' Disallow
//       rules (same order) + exactly MOON_RULES + the '*' Allow rules, so an edit of the '*' group that does not reach
//       ShapBot (or an extra / missing ShapBot rule) fails here. Sitemap lines and headers unchanged.
//   [D] decisions: every other agent (Google incl. ads / verification, Bing, Apple, OpenAI incl. GPTBot, Perplexity,
//       Shap-User, ...) decides on every tested path exactly as it did under PREV (its own group there, else '*');
//       ShapBot is disallowed on the moon year / month forms in 10 languages (and on the removed day pages under the
//       same prefix, which keep answering 410 to everyone else) and decides as under PREV on every other path:
//       moon hub / country (incl. a stray ?cal) / city, prayer, qibla, hijri, the api / search / query rules, ...
//   [S] statuses: the removed day pages still answer 410 and the moon hub / country / city / year / month pages 200.
//   When a later ticket changes robots.txt on purpose, it updates PREV and says so.
//   node scripts/_smoke_shapbot_robots_1.mjs   (env TP_GUARD = the outbound guard, TP_SMOKE_PORT)
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const PORT = Number(process.env.TP_SMOKE_PORT || 8791);
const PREV = ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /search', 'Disallow: /*?city=', 'Disallow: /*?lat=', 'Disallow: /*?lng=', 'Disallow: /*?q=', '',
    'User-agent: GPTBot', 'Disallow: /', '', 'Sitemap: https://timesprayers.com/sitemap.xml', 'Sitemap: https://timesprayers.com/sitemap-quran.xml', ''].join('\r\n');
const MOON_RULES = ['Disallow: /moon/*/*/1', 'Disallow: /moon/*/*/2', 'Disallow: /*/moon/*/*/1', 'Disallow: /*/moon/*/*/2', 'Disallow: /moon/*/*?cal', 'Disallow: /*/moon/*/*?cal',
    'Disallow: /moon-in-*/1', 'Disallow: /moon-in-*/2', 'Disallow: /*/moon-in-*/1', 'Disallow: /*/moon-in-*/2', 'Disallow: /moon-in-*?cal', 'Disallow: /*/moon-in-*?cal'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (p) => new Promise((res) => { const r = http.get({ host: '127.0.0.1', port: PORT, path: p, headers: { 'accept-encoding': 'identity' } }, (x) => { const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') })); }); r.on('error', () => res({ st: 0, h: {}, b: '' })); });
function parse(txt) {
    const groups = [], sitemaps = []; let cur = null, lastAgent = false;
    for (const raw of txt.split(/\r?\n/)) {
        const line = raw.replace(/#.*$/, '').trim(); if (!line) continue;
        const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/); if (!m) continue;
        const key = m[1].toLowerCase(), val = m[2].trim();
        if (key === 'user-agent') { if (!cur || !lastAgent) { cur = { agents: [], rules: [] }; groups.push(cur); } cur.agents.push(val.toLowerCase()); lastAgent = true; }
        else if (key === 'allow' || key === 'disallow') { if (cur) cur.rules.push((key === 'allow' ? 'Allow: ' : 'Disallow: ') + val); lastAgent = false; }
        else { if (key === 'sitemap') sitemaps.push(val); lastAgent = false; }
    }
    groups.sitemaps = sitemaps;
    return groups;
}
const patRe = (pat) => { const anc = pat.endsWith('$'); const body = anc ? pat.slice(0, -1) : pat; let s = ''; for (const ch of body) s += ch === '*' ? '.*' : ch.replace(/[.+?^${}()|[\]\\]/g, '\\$&'); return new RegExp('^' + s + (anc ? '$' : '')); };
function allowed(groups, token, p) {
    const t = token.toLowerCase(); const ex = groups.filter((g) => g.agents.includes(t));
    const rules = (ex.length ? ex : groups.filter((g) => g.agents.includes('*'))).flatMap((g) => g.rules);
    let best = null;
    for (const r of rules) { const allow = r.startsWith('Allow: '); const pat = r.slice(allow ? 7 : 10); if (pat === '' || !patRe(pat).test(p)) continue; if (!best || pat.length > best.len || (pat.length === best.len && allow && !best.allow)) best = { len: pat.length, allow }; }
    return best ? best.allow : true;
}
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + d : '')); } };
const k = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: ROOT, stdio: 'ignore',
    env: { ...process.env, PORT: String(PORT), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0' } });
try {
    for (let i = 0; i < 400; i++) { if ((await get('/health')).st === 200) break; await sleep(300); }
    const r = await get('/robots.txt');
    const g = parse(r.b), prev = parse(PREV);
    const star = g.find((x) => x.agents.includes('*')), gpt = g.find((x) => x.agents.includes('gptbot')), shap = g.find((x) => x.agents.includes('shapbot'));
    console.log('-- [G] groups');
    ok(r.st === 200 && star && gpt && shap && g.length === 3, 'robots.txt 200 with exactly the groups *, GPTBot, ShapBot', g.map((x) => x.agents.join('+')).join(' | '));
    ok(star && star.rules.join('|') === prev[0].rules.join('|'), 'the * group is the one production served before (PREV)', star && star.rules.join('|'));
    ok(gpt && gpt.rules.join('|') === 'Disallow: /', 'GPTBot group unchanged: Disallow: / only', gpt && gpt.rules.join('|'));
    const want = star ? [...star.rules.filter((x) => x.startsWith('Disallow: ')), ...MOON_RULES, ...star.rules.filter((x) => x.startsWith('Allow: '))] : [];
    ok(shap && star && shap.rules.join('\n') === want.join('\n'), 'drift guard: ShapBot group == the * Disallows (same order) + exactly the ' + MOON_RULES.length + ' moon rules + the * Allows (last)',
        shap && 'got ' + JSON.stringify(shap.rules) + ' want ' + JSON.stringify(want));
    ok(shap && shap.agents.length === 1 && star.agents.length === 1 && gpt.agents.length === 1, 'each group names one agent (ShapBot alone; Shap-User is not named)');
    ok(JSON.stringify(g.sitemaps) === JSON.stringify(prev.sitemaps), 'Sitemap lines unchanged', JSON.stringify(g.sitemaps));
    ok(r.h['content-type'] === 'text/plain; charset=utf-8' && r.h['cache-control'] === 'public, max-age=86400', 'robots.txt content-type / cache-control unchanged', r.h['content-type'] + ' / ' + r.h['cache-control']);
    console.log('-- [D] decisions vs PREV');
    const LANGS = ['', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
    const blocked = [], keep = [];
    for (const L of LANGS) {
        blocked.push(L + '/moon/saudi-arabia/riyadh/2026', L + '/moon/saudi-arabia/riyadh/2026/10', L + '/moon/egypt/cairo/2031/12/', L + '/moon/egypt/cairo/2021.html', L + '/moon/turkey/istanbul/1999',
            L + '/moon/saudi-arabia/riyadh?cal=2026-10', L + '/moon/saudi-arabia/riyadh.html?cal-y=2026&cal-m=3', L + '/moon-in-riyadh/2026-10', L + '/moon-in-riyadh-24.71-46.67/2026-10', L + '/moon-in-riyadh?cal=2026-10',
            L + '/moon/saudi-arabia/riyadh/2026/10/14', L + '/moon-in-riyadh/2026-10-14');
        keep.push(L + '/moon', L + '/moon/', L + '/moon.html', L + '/moon/saudi-arabia', L + '/moon/saudi-arabia.html', L + '/moon/saudi-arabia?cal=2026-10', L + '/moon/saudi-arabia.html?cal-y=2026&cal-m=3',
            L + '/moon/saudi-arabia/riyadh', L + '/moon/saudi-arabia/riyadh/', L + '/moon/saudi-arabia/riyadh.html', L + '/moon/saudi-arabia/riyadh/today',
            L + '/moon-in-riyadh', L + '/moon-in-riyadh-24.71-46.67', L + '/moon-today-in-riyadh', L + '/moon-today-in-riyadh/2026-10-14', L + '/prayer-times-in-riyadh', L + '/qibla-in-cairo',
            L + '/hijri-calendar/1448', L + '/today-hijri-date', L + '/ramadan-countdown', L + '/', L + '/quran', L + '/azkar');
    }
    keep.push('/ads.txt', '/robots.txt', '/sitemap.xml', '/css/style.css', '/js/app.js', '/sw.js', '/api/search-place?q=x', '/api/place-by-slug?slug=riyadh', '/search', '/search?q=x', '/x?city=1', '/x?lat=1', '/x?lng=1', '/x?q=1');
    const all = [...blocked, ...keep];
    ok(blocked.every((p) => allowed(prev, 'ShapBot', p)), 'sanity: PREV allowed ShapBot on all ' + blocked.length + ' target paths (the change is real)');
    const badB = blocked.filter((p) => allowed(g, 'ShapBot', p));
    ok(badB.length === 0, 'ShapBot disallowed on ' + blocked.length + ' moon year / month / ?cal / legacy forms (+ removed day pages) in 10 languages', badB.slice(0, 5).join(' | '));
    const badK = keep.filter((p) => allowed(g, 'ShapBot', p) !== allowed(prev, 'ShapBot', p));
    ok(badK.length === 0, 'ShapBot keeps its PREV decision on ' + keep.length + ' other paths (moon hub / country incl. ?cal / city / today, prayer, qibla, hijri, quran, azkar, ads.txt, robots, sitemaps, static, api / search / query rules)', badK.slice(0, 5).join(' | '));
    const kept = LANGS.flatMap((L) => [L + '/moon', L + '/moon/saudi-arabia', L + '/moon/saudi-arabia?cal=2026-10', L + '/moon/saudi-arabia/riyadh']);
    ok(kept.every((p) => allowed(g, 'ShapBot', p)), 'ShapBot may fetch the moon hub, country (also with ?cal) and city pages in 10 languages');
    ok(['/api/search-place?q=x', '/search', '/x?city=1', '/x?lat=1', '/x?lng=1', '/x?q=1'].every((p) => !allowed(g, 'ShapBot', p)), 'ShapBot still kept out of /api/, /search and the query forms');
    const AG = ['Googlebot', 'Googlebot-Image', 'Googlebot-News', 'Google-InspectionTool', 'GoogleOther', 'Google-Extended', 'Storebot-Google', 'Google-Site-Verification', 'FeedFetcher-Google', 'APIs-Google',
        'Mediapartners-Google', 'AdsBot-Google', 'AdsBot-Google-Mobile', 'Bingbot', 'BingPreview', 'Applebot', 'Applebot-Extended', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'PerplexityBot', 'Perplexity-User',
        'Shap-User', 'ClaudeBot', 'CCBot', 'meta-externalagent', 'Amazonbot', 'YandexBot', 'DuckDuckBot', 'SomeRandomBot'];
    const badA = []; for (const a of AG) for (const p of all) if (allowed(g, a, p) !== allowed(prev, a, p)) badA.push(a + ' ' + p);
    ok(badA.length === 0, AG.length + ' other agents (incl. GPTBot on its own group) keep their PREV decision on all ' + all.length + ' paths (' + AG.length * all.length + ' decisions)', badA.slice(0, 5).join(' | '));
    ok(blocked.filter((p) => /\/\d{4}\/\d{2}\/\d{2}$|\d{4}-\d{2}-\d{2}$/.test(p)).every((p) => allowed(g, 'Googlebot', p) && allowed(g, 'Bingbot', p)), 'Googlebot and Bingbot may still fetch the removed day pages (they read their 410)');
    console.log('-- [S] statuses');
    const st = async (p) => (await get(p)).st;
    const gone = []; for (const p of ['/moon/saudi-arabia/riyadh/2026/10/14', '/en/moon/saudi-arabia/riyadh/2026/10/14']) gone.push(p + ' ' + await st(p));
    ok(gone.every((x) => / 410$/.test(x)), 'removed day pages still 410', gone.join(', '));
    const live = []; for (const p of ['/moon', '/moon/saudi-arabia', '/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026', '/moon/saudi-arabia/riyadh/2026/10']) live.push(p + ' ' + await st(p));
    ok(live.every((x) => / 200$/.test(x)), 'moon hub / country / city / year / month pages 200', live.join(', '));
} finally { try { execFileSync('taskkill', ['/PID', String(k.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }
console.log('\n' + (fail === 0 ? 'PASS' : 'FAIL') + '  ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
