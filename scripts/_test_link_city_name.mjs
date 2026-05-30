// PT-LINK-CITY-NAME-1 verification.
// Worst-case scenario: cold visit to /prayer-times-in-le-pontet where:
//   - SSR meta `ssr-city-name` = "لو بونت"  (via _AR_CITY_OVERRIDES_SAFE)
//   - currentCity = ''                      (not hydrated yet)
//   - currentEnglishName = 'Le Pontet'      (from _prettifySlug fallback)
// Old code path: `cityNameLoc = currentCity || currentEnglishName = 'Le Pontet'`
//   → related-links labels show "كم باقي على الصلاة في Le Pontet"  ✗
// New helper: pulls "لو بونت" from the SSR meta first.
import { JSDOM } from 'jsdom';
import http from 'node:http';

const fetchUrl = (u) => new Promise((res, rej) =>
    http.get(u, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(b)); }).on('error', rej));

// Inline the helper exactly as written in js/app.js. We can't import the
// 22k-LOC app.js into JSDOM easily, so we test the helper's logic
// in isolation against a real SSR response.
function _getLocalizedCityDisplayName(slug, lang, win) {
    const _isArLang = (lang === 'ar');
    const _hasLatin = (s) => /[a-zA-Z]/.test(String(s || ''));
    try {
        const meta = win.document.querySelector('meta[name="ssr-city-name"]');
        const ssr = meta && (meta.getAttribute('content') || '').trim();
        if (ssr) {
            if (_isArLang && _hasLatin(ssr)) {
                // fall through
            } else {
                return ssr;
            }
        }
    } catch (_) {}
    // Simulate currentCity / currentLocalizedName / currentEnglishName as
    // they would be at "warm" hydration:
    const _state = win.__simState__ || {};
    try {
        if (typeof _state.currentCity === 'string' && _state.currentCity) {
            if (_isArLang && _hasLatin(_state.currentCity)) {
                // fall through
            } else {
                return _state.currentCity;
            }
        }
    } catch (_) {}
    if (!_isArLang) {
        if (_state.currentLocalizedName) return _state.currentLocalizedName;
        if (_state.currentEnglishDisplayName) return _state.currentEnglishDisplayName;
        if (_state.currentEnglishName) return _state.currentEnglishName;
    }
    if (slug) {
        return String(slug).split('-').filter(Boolean)
            .map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    return _state.currentCity || '';
}

const SCENARIOS = [
    // [slug, expected for AR, expected when SSR meta is correct]
    ['le-pontet',                  'لو بونت'],
    ['port-de-bouc',               'بور دو بوك'],
    ['provence-alpes-cote-d-azur', 'بروفنس ألب كوت دازور'],
    ['marseille',                  'مرسيليا'],
    ['lyon',                       'ليون'],
    ['paris',                      'باريس'],
];

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Helper resolves localized city display name from SSR meta ↘');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('Scenario                  | AR helper out                     | Pass');
console.log('--------------------------|-----------------------------------|-----');

let passes = 0, fails = 0;

for (const [slug, expectedAr] of SCENARIOS) {
    for (const route of ['prayer-times-in', 'time-left-until-next-prayer-in', 'next-prayer-in']) {
        const url = `http://localhost:8080/${route}-${slug}`;
        const html = await fetchUrl(url);
        const dom = new JSDOM(html, { url });
        const win = dom.window;

        // Worst-case JS state: currentCity empty, currentEnglishName = Title-Case slug.
        const titleCaseSlug = slug.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        win.__simState__ = {
            currentCity: '',
            currentEnglishName: titleCaseSlug,
            currentEnglishDisplayName: titleCaseSlug,
            currentLocalizedName: '',
        };

        const got = _getLocalizedCityDisplayName(slug, 'ar', win);
        const ok = (got === expectedAr);
        if (ok) passes++; else fails++;
        const label = `${route.padEnd(26).slice(0,26)} ${slug}`;
        console.log(`  ${label.padEnd(50).slice(0,50)} | ${got.padEnd(33).slice(0,33)} | ${ok ? '✓' : '✗  expected ' + expectedAr}`);
    }
}

console.log('');
console.log(`Result: ${passes} pass / ${fails} fail`);
if (fails > 0) process.exit(1);
