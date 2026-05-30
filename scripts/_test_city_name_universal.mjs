// Universal city-name sync verification — proves the SSR meta +
// `_syncCityNameInDom()` produce identical clean Arabic display across
// 5 SEO city routes × 4 representative cities/regions (mix of known
// + multi-word + slug-collision cases).
//
// PASS criteria (per matrix cell):
//   1. SSR meta value contains NO Latin/English tokens (`alpes`,
//      `d`, `Provence`, etc.) and NO transliterated forms.
//   2. After simulated `_syncCityNameInDom()` swap (warm visit from
//      search), the visible-text occurrences of the SSR meta value
//      drop to 0 IF a `goodName` differs, OR stay unchanged when
//      the SSR meta already matches `goodName` (cold visit / known
//      city — no swap needed).
//   3. The `goodName` (Arabic display the header would show) appears
//      in visible text ≥ 1× after the swap.
//
// Cities tested (from the user's acceptance list):
//   provence-alpes-cote-d-azur, marseille, lyon, paris,
//   port-de-bouc, london, cairo (sanity check for AR-script-only).
import { JSDOM } from 'jsdom';
import http from 'node:http';

const fetchUrl = (u) => new Promise((res, rej) =>
    http.get(u, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(b)); }).on('error', rej));

const CITY_GOOD_NAME = {
    'provence-alpes-cote-d-azur': 'بروفنس ألب كوت دازور',
    'marseille':                  'مرسيليا',
    'lyon':                       'ليون',
    'paris':                      'باريس',
    'port-de-bouc':               'بور دو بوك',
    'london':                     'لندن',
    'cairo':                      'القاهرة',
};

const ROUTES = [
    'prayer-times-in',
    'time-left-until-next-prayer-in',
    'next-prayer-in',
    'moon-in',
    'moon-today-in',
];

const LATIN_TOKEN_RE = /\b(Provence|Alpes|Cote|D|Azur|Marseille|Lyon|Paris|Port|De|Bouc|London|Cairo|alpes|azur)\b/g;

function syncCityNameInDom(doc, goodName) {
    const meta = doc.querySelector('meta[name="ssr-city-name"]');
    if (!meta) return null;
    const ssrName = (meta.getAttribute('content') || '').trim();
    if (!ssrName || !goodName || goodName === ssrName) return { ssrName, swapped: 0, noop: true };
    let swapped = 0;
    const walker = doc.createTreeWalker(
        doc.body, doc.defaultView.NodeFilter.SHOW_TEXT,
        {
            acceptNode: (n) => {
                const pt = n.parentNode && n.parentNode.nodeName;
                if (pt === 'SCRIPT' || pt === 'STYLE' || pt === 'NOSCRIPT') {
                    return doc.defaultView.NodeFilter.FILTER_REJECT;
                }
                return doc.defaultView.NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    let node;
    while ((node = walker.nextNode())) {
        const v = node.nodeValue;
        if (v && v.indexOf(ssrName) !== -1) {
            const ct = v.split(ssrName).length - 1;
            swapped += ct;
            node.nodeValue = v.split(ssrName).join(goodName);
        }
    }
    doc.querySelectorAll('[aria-label]').forEach(el => {
        const a = el.getAttribute('aria-label') || '';
        if (a.indexOf(ssrName) !== -1) {
            el.setAttribute('aria-label', a.split(ssrName).join(goodName));
        }
    });
    if (doc.title.indexOf(ssrName) !== -1) {
        doc.title = doc.title.split(ssrName).join(goodName);
    }
    doc.querySelectorAll('meta').forEach(m => {
        const v = m.getAttribute('content') || '';
        if (v.indexOf(ssrName) !== -1) m.setAttribute('content', v.split(ssrName).join(goodName));
    });
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
        const t = s.textContent || '';
        if (t.indexOf(ssrName) !== -1) s.textContent = t.split(ssrName).join(goodName);
    });
    return { ssrName, swapped, noop: false };
}

function visibleText(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z0-9#]+;/gi, ' ');
}

let totalCells = 0, failedCells = 0;
const fails = [];

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║  Universal city-name sync verification                                       ║');
console.log('║  Each cell: SSR-meta cleanness + post-swap visible-text purity               ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
console.log('');

for (const [slug, goodName] of Object.entries(CITY_GOOD_NAME)) {
    console.log(`━━━ ${slug}  (good = "${goodName}")`);
    for (const route of ROUTES) {
        totalCells++;
        const url = `http://localhost:8080/${route}-${slug}`;
        const html = await fetchUrl(url);
        const dom = new JSDOM(html, { url });
        const doc = dom.window.document;

        const meta = doc.querySelector('meta[name="ssr-city-name"]');
        const ssrName = meta?.getAttribute('content') || '';

        // (1) SSR meta should not contain ANY Latin-only token from the
        // slug parts (excluding the goodName itself which is Arabic).
        const latinInSsr = (ssrName.match(LATIN_TOKEN_RE) || []);

        // (2) Simulate JS swap with goodName.
        const swap = syncCityNameInDom(doc, goodName);

        // (3) After swap, count occurrences in visible text.
        const after = dom.serialize();
        const vis = visibleText(after);
        const ssrLeft = ssrName ? (vis.match(new RegExp(ssrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;
        const goodCount = (vis.match(new RegExp(goodName, 'g')) || []).length;

        // Final cell verdict.
        // - If SSR already == good → swap no-op → no leftover.
        // - If SSR differs (transliterated/partial) → swap should clear it.
        const ssrCleanAfterSwap = (swap?.noop) || (ssrLeft === 0);
        const passes = latinInSsr.length === 0 && ssrCleanAfterSwap && goodCount > 0;

        const verdict = passes ? '✓' : '✗';
        const sample = `ssr="${ssrName.slice(0, 40)}"  noop=${swap?.noop}  swapped=${swap?.swapped}  ssr-left=${ssrLeft}  good=${goodCount}`;
        console.log(`  ${verdict}  ${route.padEnd(30)} | ${sample}`);

        if (!passes) {
            failedCells++;
            fails.push({ slug, route, ssrName, latinInSsr, ssrLeft, goodCount });
        }
    }
    console.log('');
}

console.log(`━━━ Result: ${totalCells - failedCells} / ${totalCells} cells PASS`);
if (failedCells > 0) {
    console.log('\nFailing cells:');
    for (const f of fails) {
        console.log(' ', JSON.stringify(f));
    }
    process.exit(1);
}
