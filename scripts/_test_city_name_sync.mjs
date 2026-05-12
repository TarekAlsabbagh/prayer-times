// CITY-NAME-SYNC-1 smoke test — verifies that the generalized
// `_syncCityNameInDom()` swaps the SSR-rendered city name across
// every visible surface on ALL city SEO routes.
//
// Mirror of `_syncCityNameInDom` from js/app.js, inlined into the
// JSDOM test harness so we don't pull the giant app.js into the
// page context.
import { JSDOM } from 'jsdom';
import http from 'node:http';

const fetchUrl = (u) => new Promise((res, rej) =>
    http.get(u, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(b)); }).on('error', rej));

const GOOD = 'إكس أون بروفنس';
const UGLY = 'A Ks A Wn Brwfans';

function syncCityNameInDom(doc, goodName) {
    const meta = doc.querySelector('meta[name="ssr-city-name"]');
    if (!meta) return;
    const ssrName = (meta.getAttribute('content') || '').trim();
    if (!ssrName || !goodName || goodName === ssrName) return;
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
            node.nodeValue = v.split(ssrName).join(goodName);
        }
    }
    doc.querySelectorAll('[aria-label]').forEach(el => {
        const a = el.getAttribute('aria-label') || '';
        if (a && a.indexOf(ssrName) !== -1) {
            el.setAttribute('aria-label', a.split(ssrName).join(goodName));
        }
    });
    if (doc.title && doc.title.indexOf(ssrName) !== -1) {
        doc.title = doc.title.split(ssrName).join(goodName);
    }
    doc.querySelectorAll('meta').forEach(m => {
        const v = m.getAttribute('content') || '';
        if (v && v.indexOf(ssrName) !== -1) {
            m.setAttribute('content', v.split(ssrName).join(goodName));
        }
    });
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
        const t = s.textContent || '';
        if (t.indexOf(ssrName) !== -1) {
            s.textContent = t.split(ssrName).join(goodName);
        }
    });
}

const routes = [
    'prayer-times-in',
    'time-left-until-prayer-in',
    'next-prayer-in',
    'qibla-in',
    'moon-today-in',
    'moon-in',
];

console.log('=== Ugly-slug swap test (slug = a-ks-a-wn-brwfans) ===\n');
console.log('Route                              | Before | After  | Good   ');
console.log('-----------------------------------|--------|--------|--------');

for (const route of routes) {
    const url = `http://localhost:8080/${route}-a-ks-a-wn-brwfans`;
    const html = await fetchUrl(url);
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;
    const before = (html.match(new RegExp(UGLY, 'g')) || []).length;
    syncCityNameInDom(doc, GOOD);
    const after = dom.serialize();
    const afterUgly = (after.match(new RegExp(UGLY, 'g')) || []).length;
    const afterGood = (after.match(new RegExp(GOOD, 'g')) || []).length;
    console.log(`${route.padEnd(35)} | ${String(before).padEnd(6)} | ${String(afterUgly).padEnd(6)} | ${afterGood}`);
}

console.log('\n=== No-regression on known slug (slug = port-de-bouc) ===\n');
console.log('Route                              | SSR-meta             | Same-as-good?');
console.log('-----------------------------------|----------------------|--------------');
for (const route of routes) {
    const url = `http://localhost:8080/${route}-port-de-bouc`;
    const html = await fetchUrl(url);
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;
    const meta = doc.querySelector('meta[name="ssr-city-name"]');
    const ssr = meta?.getAttribute('content') || '<MISSING>';
    const goodName = 'بور دو بوك';
    const isNoop = ssr === goodName;
    console.log(`${route.padEnd(35)} | ${ssr.padEnd(20)} | ${isNoop ? 'YES (no-op ✓)' : 'NO  (would swap)'}`);
}
