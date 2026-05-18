// scripts/_test_place_names_homepage_default_city_l10n_fix_1.mjs
//
// PLACE-NAMES-HOMEPAGE-DEFAULT-CITY-L10N-FIX-1 verification.
//
// Bug: on `/ur/` (and any non-AR homepage) the default city display
// rendered the Arabic name `مكة المكرمة` in #city-name + #qibla-city +
// currentCity global because line 8 of js/app.js hardcoded
//   `let currentCity = 'مكة المكرمة';`
// and the _initialSyncHydrate IIFE only handles URL-slug routes — the
// homepage matches nothing in its regex so the default stood.
//
// Fix: line 8 is now a small IIFE that reads document.documentElement.lang
// and picks a localized Mecca name from a 10-lang map (values aligned
// with the existing CITY_NAMES_* maps so first-paint matches what
// getDisplayCity() resolves to once init runs).
//
// This test covers:
//   A. Disk source markers (js/app.js IIFE + cache-buster bump).
//   B. SSR `<html lang>` attribute on all 10 lang homepages (regression).
//   C. The localized Mecca map values in source match the
//      CITY_NAMES_<LANG> values used elsewhere (consistency).

import http from 'node:http';
import { readFileSync } from 'node:fs';

function get(path) {
    return new Promise(resolve => {
        http.get({ host: 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, body, location: r.headers.location || '' }));
        }).on('error', () => resolve({ status: 0, body: '', location: '' }));
    });
}
async function getFollowingRedirect(path) {
    let r = await get(path);
    if ((r.status === 301 || r.status === 302) && r.location) {
        const next = r.location.startsWith('http')
            ? new URL(r.location).pathname
            : r.location;
        r = await get(next);
    }
    return r;
}

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-NAMES-HOMEPAGE-DEFAULT-CITY-L10N-FIX-1 verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — Disk source markers
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — Disk source markers ──');

const APP_PATH   = new URL('../js/app.js', import.meta.url);
const INDEX_PATH = new URL('../index.html', import.meta.url);
const appSrc   = readFileSync(APP_PATH, 'utf8');
const indexSrc = readFileSync(INDEX_PATH, 'utf8');

ok('js/app.js contains _MECCA_BY_LANG IIFE on currentCity',
    /let\s+currentCity\s*=\s*\(function\s*\(\s*\)\s*\{\s*[\s\S]*?_MECCA_BY_LANG/.test(appSrc));

ok('PLACE-NAMES-HOMEPAGE-DEFAULT-CITY-L10N-FIX-1 phase marker present',
    appSrc.includes('PLACE-NAMES-HOMEPAGE-DEFAULT-CITY-L10N-FIX-1'));

const verMatches = indexSrc.match(/js\/app\.js\?v=(\d+)/g) || [];
const allVers = verMatches.map(s => parseInt(s.match(/(\d+)/)[1], 10));
const minVer = allVers.length ? Math.min(...allVers) : 0;
ok('index.html cache-buster bumped (>= 663 across all references)',
    minVer >= 663);

// ───────────────────────────────────────────────────────────────────────
// PART B — SSR <html lang> attribute on all 10 lang homepages
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — SSR <html lang> on all 10 homepages ──');

const HOMEPAGES = [
    { url: '/',    lang: 'ar' },
    { url: '/en/', lang: 'en' },
    { url: '/fr/', lang: 'fr' },
    { url: '/tr/', lang: 'tr' },
    { url: '/ur/', lang: 'ur' },
    { url: '/de/', lang: 'de' },
    { url: '/id/', lang: 'id' },
    { url: '/es/', lang: 'es' },
    { url: '/bn/', lang: 'bn' },
    { url: '/ms/', lang: 'ms' }
];

for (const h of HOMEPAGES) {
    const r = await getFollowingRedirect(h.url);
    const m = r.body.match(/<html[^>]*lang="([^"]+)"/);
    const got = m ? m[1] : '';
    ok(h.url.padEnd(8) + ' SSR <html lang>="' + h.lang + '"',
        r.status === 200 && got === h.lang,
        '(got "' + got + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART C — _MECCA_BY_LANG values match CITY_NAMES_<LANG>['Mecca']
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — IIFE map values match legacy CITY_NAMES_* maps ──');

const IIFE_MAP_M = appSrc.match(/_MECCA_BY_LANG\s*=\s*\{([\s\S]*?)\}/);
const iifeBlock = IIFE_MAP_M ? IIFE_MAP_M[1] : '';

function extractIIFE(lang) {
    const re = new RegExp(lang + "\\s*:\\s*'([^']+)'", 'i');
    const m = iifeBlock.match(re);
    return m ? m[1] : '';
}
function extractCityName(constName) {
    const re = new RegExp('const\\s+' + constName + '\\s*=\\s*\\{[^}]*?Mecca\\s*:\\s*\\\'([^\\\']+)\\\'', 's');
    const m = appSrc.match(re);
    return m ? m[1] : '';
}

const CHECKS = [
    { lang: 'fr', constName: 'CITY_NAMES_FR' },
    { lang: 'de', constName: 'CITY_NAMES_DE' },
    { lang: 'tr', constName: 'CITY_NAMES_TR' },
    { lang: 'ur', constName: 'CITY_NAMES_UR' },
    { lang: 'es', constName: 'CITY_NAMES_ES' },
    { lang: 'bn', constName: 'CITY_NAMES_BN' },
    { lang: 'id', constName: 'CITY_NAMES_ID' },
    { lang: 'ms', constName: 'CITY_NAMES_MS' }
];

for (const c of CHECKS) {
    const iifeV = extractIIFE(c.lang);
    const legacyV = extractCityName(c.constName);
    ok('IIFE map[' + c.lang + ']="' + iifeV + '" matches ' + c.constName + "['Mecca']=\"" + legacyV + '"',
        iifeV !== '' && iifeV === legacyV);
}

// AR + EN don't have legacy maps (they're the source values)
ok("IIFE map[ar]='مكة المكرمة' (canonical Arabic)",
    extractIIFE('ar') === 'مكة المكرمة');
ok("IIFE map[en]='Mecca' (canonical English)",
    extractIIFE('en') === 'Mecca');

// ───────────────────────────────────────────────────────────────────────
// PART D — Homepage HTTP 200 regression on all 10 langs
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — Homepage HTTP 200 regression ──');

for (const h of HOMEPAGES) {
    const r = await getFollowingRedirect(h.url);
    ok(h.url.padEnd(8) + ' HTTP 200', r.status === 200);
}

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
