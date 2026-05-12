// PT-LANG-GUARD-1 verification.
// Simulates the EXACT bug the user reported: SSR delivers correct
// Arabic city name, then JS hydration (via geocodeSlug → loadCityData
// → currentCity) ends up with a Latin name like 'Le Pontet' because
// Nominatim didn't have `name:ar` for the small French town. The old
// `_syncCityNameInDom` would then swap "لو بونت" → "Le Pontet"
// everywhere. The Latin-script guard MUST prevent this.
import { JSDOM } from 'jsdom';
import http from 'node:http';

const fetchUrl = (u) => new Promise((res, rej) =>
    http.get(u, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(b)); }).on('error', rej));

// Inline a faithful copy of the PT-LANG-GUARD-1 logic from js/app.js.
function syncCityNameInDom(doc, win, simState) {
    const meta = doc.querySelector('meta[name="ssr-city-name"]');
    if (!meta) return { skipped: 'no meta' };
    const ssrName = (meta.getAttribute('content') || '').trim();
    if (!ssrName) return { skipped: 'empty meta' };

    const _docLang = doc.documentElement.getAttribute('lang') || 'ar';
    const _isAr = (_docLang === 'ar');
    const _hasLatin = (s) => /[A-Za-z]/.test(String(s || ''));

    let goodName = '';
    if (simState.currentCity && simState.currentCity !== 'مكة المكرمة') {
        const v = simState.currentCity.trim();
        if (!(_isAr && _hasLatin(v))) goodName = v;
    }
    if (!goodName && simState.currentLocalizedName) {
        const v = simState.currentLocalizedName.trim();
        if (!(_isAr && _hasLatin(v))) goodName = v;
    }
    if (!goodName || goodName === ssrName) return { skipped: 'no-op' };
    if (_isAr && !_hasLatin(ssrName) && _hasLatin(goodName)) {
        return { skipped: 'AR + clean SSR rejects Latin goodName' };
    }

    // Do the swap (text-nodes + title + meta + json-ld)
    const walker = doc.createTreeWalker(doc.body, win.NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
            const pt = n.parentNode && n.parentNode.nodeName;
            if (pt === 'SCRIPT' || pt === 'STYLE' || pt === 'NOSCRIPT') return win.NodeFilter.FILTER_REJECT;
            return win.NodeFilter.FILTER_ACCEPT;
        }
    });
    let node;
    while ((node = walker.nextNode())) {
        const v = node.nodeValue;
        if (v && v.indexOf(ssrName) !== -1) {
            node.nodeValue = v.split(ssrName).join(goodName);
        }
    }
    if (doc.title.indexOf(ssrName) !== -1) doc.title = doc.title.split(ssrName).join(goodName);
    doc.querySelectorAll('meta').forEach(m => {
        const v = m.getAttribute('content') || '';
        if (v.indexOf(ssrName) !== -1) m.setAttribute('content', v.split(ssrName).join(goodName));
    });
    return { swapped: true, from: ssrName, to: goodName };
}

const SCENARIOS = [
    // [name, url, simState, expected titleAfterSwap]
    [
        '1. AR page + currentCity=Le Pontet (Latin)  ← BUG TRIGGER',
        '/time-left-until-prayer-in-le-pontet',
        { currentCity: 'Le Pontet', currentLocalizedName: '' },
        /لو بونت/,    // title must STILL contain Arabic name (no swap)
        /Le Pontet/,  // title must NOT contain Latin (negated)
    ],
    [
        '2. AR page + currentCity=لو بونت (Arabic, same as SSR)',
        '/time-left-until-prayer-in-le-pontet',
        { currentCity: 'لو بونت', currentLocalizedName: '' },
        /لو بونت/,
        /Le Pontet/,
    ],
    [
        '3. AR page + currentCity empty',
        '/time-left-until-prayer-in-le-pontet',
        { currentCity: '', currentLocalizedName: '' },
        /لو بونت/,
        /Le Pontet/,
    ],
    [
        '4. AR page + currentCity=إكس أون بروفنس (Arabic, BETTER than SSR slug-fallback)',
        '/time-left-until-prayer-in-a-ks-a-wn-brwfans',
        { currentCity: 'إكس أون بروفنس', currentLocalizedName: '' },
        /إكس أون بروفنس/,   // Arabic-only swap should succeed
        /A Ks A Wn Brwfans/, // ugly SSR name should be gone
    ],
    [
        '5. EN page + currentCity=Le Pontet (no AR guard — swap allowed)',
        '/en/time-left-until-prayer-in-le-pontet',
        { currentCity: 'Le Pontet', currentLocalizedName: '' },
        /Le Pontet/,
        /لو بونت/,
    ],
];

let pass = 0, fail = 0;
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PT-LANG-GUARD-1: AR pages reject Latin overwrite of clean SSR name');
console.log('═══════════════════════════════════════════════════════════════════════');

for (const [label, urlPath, sim, mustMatch, mustNotMatch] of SCENARIOS) {
    const html = await fetchUrl('http://localhost:8080' + urlPath);
    const dom = new JSDOM(html, { url: 'http://localhost:8080' + urlPath });
    const result = syncCityNameInDom(dom.window.document, dom.window, sim);

    const title = dom.window.document.title;
    const mm = mustMatch.test(title);
    const mn = mustNotMatch.test(title);
    const ok = mm && !mn;
    if (ok) pass++; else fail++;
    console.log(`\n${label}`);
    console.log(`  swap result: ${JSON.stringify(result).slice(0, 80)}`);
    console.log(`  title:       ${title.slice(0, 90)}`);
    console.log(`  must-match ${mustMatch.toString().slice(0, 30)}: ${mm ? '✓' : '✗'}`);
    console.log(`  must-NOT-match ${mustNotMatch.toString().slice(0, 30)}: ${mn ? '✗ (FOUND IT — BAD)' : '✓'}`);
    console.log(`  → ${ok ? 'PASS' : 'FAIL'}`);
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
