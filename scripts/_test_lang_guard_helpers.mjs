// PT-LANG-GUARD-2 verification.
// Tests that getDisplayCity() and getCurrentCityLabel() — which are
// consumed by the NPT and TL hero/CTA update functions — REJECT a
// Latin `currentCity` on AR pages and fall back to the SSR meta value.
//
// Direct mirror of the patched logic in js/app.js so we can unit-test
// without booting the whole 22k-LOC bundle.
import { JSDOM } from 'jsdom';
import http from 'node:http';

const fetchUrl = (u) => new Promise((res, rej) =>
    http.get(u, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(b)); }).on('error', rej));

// Reproduce the helper exactly (Latin-guard tier).
function makeHelpers(win, doc, state) {
    function _getLocalizedCityDisplayName(slug, lang) {
        const _isAr = (lang === 'ar');
        const _hasLatin = (s) => /[A-Za-z]/.test(String(s || ''));
        const meta = doc.querySelector('meta[name="ssr-city-name"]');
        const ssr = meta && (meta.getAttribute('content') || '').trim();
        if (ssr) {
            if (!(_isAr && _hasLatin(ssr))) return ssr;
        }
        if (slug) {
            return String(slug).split('-').filter(Boolean)
                .map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        }
        return state.currentCity || '';
    }
    function getDisplayCity() {
        const lang = state.lang || 'ar';
        if (lang === 'ar') {
            if (state.currentCity && !/[A-Za-z]/.test(state.currentCity)) {
                return state.currentCity;
            }
            const r = _getLocalizedCityDisplayName('', 'ar');
            if (r && !/[A-Za-z]/.test(r)) return r;
            return state.currentCity || '';
        }
        return state.currentEnglishDisplayName || state.currentEnglishName || state.currentCity;
    }
    function getCurrentCityLabel() {
        const lang = state.lang || 'ar';
        if (lang === 'ar') {
            if (state.currentCity && !/[A-Za-z]/.test(state.currentCity)) {
                return state.currentCity;
            }
            const r = _getLocalizedCityDisplayName('', 'ar');
            if (r && !/[A-Za-z]/.test(r)) return r;
            return state.currentCity || '';
        }
        return state.currentLocalizedName || state.currentEnglishName || state.currentCity;
    }
    return { getDisplayCity, getCurrentCityLabel };
}

const SCENARIOS = [
    // [name, url, state, expectedDisplay, expectedLabel]
    [
        'A) AR + currentCity="Le Pontet" (LATIN — BUG TRIGGER)',
        '/next-prayer-in-le-pontet',
        { lang: 'ar', currentCity: 'Le Pontet', currentEnglishName: 'Le Pontet' },
        'لو بونت', 'لو بونت',
    ],
    [
        'B) AR + currentCity="لو بونت" (clean Arabic)',
        '/next-prayer-in-le-pontet',
        { lang: 'ar', currentCity: 'لو بونت', currentEnglishName: 'Le Pontet' },
        'لو بونت', 'لو بونت',
    ],
    [
        'C) AR + currentCity="" (cold visit)',
        '/next-prayer-in-le-pontet',
        { lang: 'ar', currentCity: '', currentEnglishName: 'Le Pontet' },
        'لو بونت', 'لو بونت',
    ],
    [
        'D) AR + currentCity="بور دو بوك" (different city slug)',
        '/time-left-until-next-prayer-in-port-de-bouc',
        { lang: 'ar', currentCity: 'Port De Bouc', currentEnglishName: 'Port De Bouc' },
        'بور دو بوك', 'بور دو بوك',
    ],
    [
        'E) AR + Marseille mixed state',
        '/prayer-times-in-marseille',
        { lang: 'ar', currentCity: 'Marseille', currentEnglishName: 'Marseille' },
        'مرسيليا', 'مرسيليا',
    ],
    [
        'F) EN page (guard does NOT apply)',
        '/en/prayer-times-in-le-pontet',
        { lang: 'en', currentCity: 'Le Pontet', currentEnglishName: 'Le Pontet', currentEnglishDisplayName: 'Le Pontet' },
        'Le Pontet', 'Le Pontet',
    ],
];

let pass = 0, fail = 0;
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' getDisplayCity() / getCurrentCityLabel() Latin-guard verification');
console.log('═══════════════════════════════════════════════════════════════════════');

for (const [label, urlPath, state, expectDisplay, expectLabel] of SCENARIOS) {
    const html = await fetchUrl('http://localhost:8080' + urlPath);
    const dom = new JSDOM(html, { url: 'http://localhost:8080' + urlPath });
    const { getDisplayCity, getCurrentCityLabel } = makeHelpers(dom.window, dom.window.document, state);

    const dgot = getDisplayCity();
    const lgot = getCurrentCityLabel();
    const dok = (dgot === expectDisplay);
    const lok = (lgot === expectLabel);
    const ok = dok && lok;
    if (ok) pass++; else fail++;
    console.log(`\n${label}`);
    console.log(`   state: currentCity="${state.currentCity}"  lang="${state.lang}"`);
    console.log(`   getDisplayCity()       → "${dgot}"   ${dok ? '✓' : '✗ expected "' + expectDisplay + '"'}`);
    console.log(`   getCurrentCityLabel() → "${lgot}"   ${lok ? '✓' : '✗ expected "' + expectLabel + '"'}`);
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
