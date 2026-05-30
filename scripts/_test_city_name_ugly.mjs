// Verifies the COLD-VISIT recovery path: when `makeSlug()` produced
// a transliterated URL (slug = `a-ks-a-wn-brwfans`) because Nominatim
// returned only `name:ar`, the user lands on the URL with no
// sessionStorage seed AND no curated DB entry for this exact slug.
//
// In the WARM-VISIT case (from search), `currentCity` carries the
// original Arabic name and the JS swap replaces the SSR fallback
// everywhere. This test exercises that path.
import { JSDOM } from 'jsdom';
import http from 'node:http';

const fetchUrl = (u) => new Promise((res, rej) =>
    http.get(u, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(b)); }).on('error', rej));

const UGLY_SLUG = 'a-ks-a-wn-brwfans';   // transliteration of 'إكس أون بروفنس'
const GOOD = 'إكس أون بروفنس';            // what sessionStorage seed would hold

function syncCityNameInDom(doc, goodName) {
    const meta = doc.querySelector('meta[name="ssr-city-name"]');
    if (!meta) return null;
    const ssrName = (meta.getAttribute('content') || '').trim();
    if (!ssrName || !goodName || goodName === ssrName) return { ssrName, noop: true };
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
        if (v && v.indexOf(ssrName) !== -1) node.nodeValue = v.split(ssrName).join(goodName);
    }
    doc.querySelectorAll('[aria-label]').forEach(el => {
        const a = el.getAttribute('aria-label') || '';
        if (a.indexOf(ssrName) !== -1) el.setAttribute('aria-label', a.split(ssrName).join(goodName));
    });
    if (doc.title.indexOf(ssrName) !== -1) doc.title = doc.title.split(ssrName).join(goodName);
    doc.querySelectorAll('meta').forEach(m => {
        const v = m.getAttribute('content') || '';
        if (v.indexOf(ssrName) !== -1) m.setAttribute('content', v.split(ssrName).join(goodName));
    });
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
        const t = s.textContent || '';
        if (t.indexOf(ssrName) !== -1) s.textContent = t.split(ssrName).join(goodName);
    });
    return { ssrName, noop: false };
}

function visibleText(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]+>/g, ' ');
}

const routes = ['prayer-times-in', 'time-left-until-next-prayer-in', 'next-prayer-in', 'moon-in', 'moon-today-in'];

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Ugly slug: ${UGLY_SLUG}  →  warm-visit goodName: "${GOOD}"`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let pass = 0, fail = 0;

for (const route of routes) {
    const url = `http://localhost:8080/${route}-${UGLY_SLUG}`;
    const html = await fetchUrl(url);
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;

    // Cold-visit visible state (before swap):
    const visBefore = visibleText(html);
    const ssrName = doc.querySelector('meta[name="ssr-city-name"]')?.getAttribute('content') || '';
    const uglyBefore = ssrName ? (visBefore.match(new RegExp(ssrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;

    // Warm-visit swap:
    syncCityNameInDom(doc, GOOD);
    const after = dom.serialize();
    const visAfter = visibleText(after);
    const uglyAfter = ssrName ? (visAfter.match(new RegExp(ssrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;
    const goodAfter = (visAfter.match(new RegExp(GOOD, 'g')) || []).length;

    const passes = (uglyAfter === 0) && (goodAfter > 0);
    const verdict = passes ? '✓' : '✗';
    if (passes) pass++; else fail++;
    console.log(`  ${verdict}  ${route.padEnd(30)} | cold-vis="${ssrName.slice(0, 30)}"  cold-count=${uglyBefore}  →  after-swap=${uglyAfter}  good=${goodAfter}`);
}

console.log('');
console.log(`Result: ${pass} / ${pass + fail} cells PASS`);
if (fail > 0) process.exit(1);
