// One-off smoke test for TL-CITY-SYNC-1.
// Verifies that the JS-side `_syncTlCityNameInDom()` correctly swaps
// the SSR transliterated city name with `currentCity` (the same source
// the header uses) in DOM text + <title> + meta description.
import { JSDOM } from 'jsdom';
import http from 'node:http';

function fetchUrl(u) {
    return new Promise((resolve, reject) => {
        http.get(u, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve(body));
        }).on('error', reject);
    });
}

const URL = 'http://localhost:8080/time-left-until-prayer-in-a-ks-a-wn-brwfans';
const html = await fetchUrl(URL);

const dom = new JSDOM(html, { url: URL });
const win = dom.window;
const doc = win.document;

const GOOD = 'إكس أون بروفنس';

// Inline the same function logic from js/app.js (TL-CITY-SYNC-1).
// This is a TEST harness — we don't need to import the giant app.js.
function _syncTlCityNameInDom() {
    try {
        if (!/\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?time-left-until-prayer-in-/
            .test(win.location.pathname)) return;
    } catch (_) { return; }
    const wrapper = doc.querySelector('.tl-seo-wrapper');
    if (!wrapper) return;
    const ssrName = (wrapper.getAttribute('data-ssr-city-name') || '').trim();
    if (!ssrName) return;
    const goodName = GOOD;
    if (!goodName || goodName === ssrName) return;
    const walker = doc.createTreeWalker(
        doc.body, win.NodeFilter.SHOW_TEXT,
        {
            acceptNode: (n) => {
                const pt = n.parentNode && n.parentNode.nodeName;
                if (pt === 'SCRIPT' || pt === 'STYLE' || pt === 'NOSCRIPT') {
                    return win.NodeFilter.FILTER_REJECT;
                }
                return win.NodeFilter.FILTER_ACCEPT;
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
    const ariaSection = wrapper.querySelector('.time-left-content-grid');
    if (ariaSection) {
        const _aria = ariaSection.getAttribute('aria-label') || '';
        if (_aria && _aria.indexOf(ssrName) !== -1) {
            ariaSection.setAttribute('aria-label', _aria.split(ssrName).join(goodName));
        }
    }
    if (doc.title && doc.title.indexOf(ssrName) !== -1) {
        doc.title = doc.title.split(ssrName).join(goodName);
    }
    const descMeta = doc.querySelector('meta[name="description"]');
    if (descMeta) {
        const desc = descMeta.getAttribute('content') || '';
        if (desc.indexOf(ssrName) !== -1) {
            descMeta.setAttribute('content', desc.split(ssrName).join(goodName));
        }
    }
    doc.querySelectorAll(
        'meta[property="og:title"], meta[property="og:description"], ' +
        'meta[property="og:image:alt"], meta[name="twitter:title"], ' +
        'meta[name="twitter:description"]'
    ).forEach(m => {
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
    wrapper.setAttribute('data-ssr-city-name', goodName);
}

console.log('=== BEFORE swap:');
const wrapper = doc.querySelector('.tl-seo-wrapper');
console.log('  wrapper present     :', !!wrapper);
console.log('  data-ssr-city-name  :', wrapper?.getAttribute('data-ssr-city-name'));
console.log('  document.title      :', doc.title);
console.log('  ugly in raw HTML    :', (html.match(/A Ks A Wn Brwfans/g) || []).length);

_syncTlCityNameInDom();

console.log('\n=== AFTER swap:');
console.log('  data-ssr-city-name  :', wrapper?.getAttribute('data-ssr-city-name'));
console.log('  document.title      :', doc.title);
const after = dom.serialize();
console.log('  ugly in serialized  :', (after.match(/A Ks A Wn Brwfans/g) || []).length, '(should be 0 in visible text)');
console.log('  good in serialized  :', (after.match(new RegExp(GOOD, 'g')) || []).length);

const faq = doc.querySelector('.time-left-faq-item h3');
console.log('  FAQ q first item    :', faq?.textContent?.slice(0, 80));
const guide = doc.querySelector('.time-left-guide h2');
console.log('  Guide H2            :', guide?.textContent?.slice(0, 80));
const aria = doc.querySelector('.time-left-content-grid')?.getAttribute('aria-label');
console.log('  Aria-label          :', aria?.slice(0, 80));
const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
console.log('  Meta description    :', desc?.slice(0, 100));

// Audit where the 23 leftover "A Ks A Wn Brwfans" occurrences live.
console.log('\n=== Audit of remaining ugly-name occurrences:');
const SSR = 'A Ks A Wn Brwfans';
const inScripts = [];
doc.querySelectorAll('script').forEach(s => {
    const ct = (s.textContent.match(new RegExp(SSR, 'g')) || []).length;
    if (ct) inScripts.push({ id: s.id || s.type || '<inline>', count: ct });
});
const inAttrs = {};
doc.querySelectorAll('*').forEach(el => {
    for (const a of el.attributes || []) {
        if (a.value && a.value.indexOf(SSR) !== -1) {
            const key = `${el.tagName}[${a.name}]`;
            inAttrs[key] = (inAttrs[key] || 0) + 1;
        }
    }
});
console.log('  <script> bodies     :', inScripts);
console.log('  attributes          :', inAttrs);
