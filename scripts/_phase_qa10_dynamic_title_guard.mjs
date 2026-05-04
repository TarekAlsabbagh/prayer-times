// Phase Q-A10 — Dynamic Title Length Guard.
//
// SEOptimer post-Q-A series: On-Page SEO = A+, but Title Tag stays red on
// city pages with LONG city names like:
//   • "المدينة المنورة" → Title = 67 chars (over 60 sweet spot)
//   • "kuala-lumpur" → similarly long
//
// Per user spec (Q-A10 ONLY):
//   • DO NOT change H1 or Meta or content
//   • DO NOT touch /qibla Hub or moon/hijri/prayer pages
//   • Apply length guard to Title only on /qibla-in-{city}
//   • If full title length ≤ 60 chars, use full version
//   • If > 60 chars, use shorter version (drop "وتحديد القبلة بدقة" tail)
//   • Apply same logic in BOTH server.js (SSR) AND js/app.js (DOM) so they
//     stay in sync (Q-A2 sync preserved)
//
// Templates:
//   AR full:  "اتجاه القبلة في {city} | بوصلة الكعبة وتحديد القبلة بدقة"
//   AR short: "اتجاه القبلة في {city} | بوصلة الكعبة"
//   (and 9 more lang pairs)

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
const APP_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\js\\app.js';

let srvRaw = readFileSync(SRV_PATH, 'utf8');
let appRaw = readFileSync(APP_PATH, 'utf8');

const isCRLFsrv = /\r\n/.test(srvRaw);
const isCRLFapp = /\r\n/.test(appRaw);

if (/Phase Q-A10 \(2026-05-04\)/.test(srvRaw)) {
    throw new Error('[server.js] Q-A10 already applied');
}

function lfToEol(s, isCRLF) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

function makeReplacer(getRaw, setRaw, isCRLF) {
    return function replaceOnce(label, oldStr, newStr) {
        const oldNorm = lfToEol(oldStr, isCRLF);
        const newNorm = lfToEol(newStr, isCRLF);
        const raw = getRaw();
        const cnt = raw.split(oldNorm).length - 1;
        if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
        setRaw(raw.replace(oldNorm, newNorm));
        console.log(`✓ ${label}`);
    };
}

const replaceSrv = makeReplacer(() => srvRaw, v => srvRaw = v, isCRLFsrv);
const replaceApp = makeReplacer(() => appRaw, v => appRaw = v, isCRLFapp);

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — server.js: add short title fallback + length guard.
// Anchor: the existing `title = _qTitles[lang] || _qTitles.en;` line.
// ═══════════════════════════════════════════════════════════════════════════
const SRV_OLD = `        };
        title = _qTitles[lang] || _qTitles.en;
        description = _qDescs[lang] || _qDescs.en;`;

const SRV_NEW = `        };
        // Phase Q-A10 (2026-05-04): dynamic length guard for cities with long
        // names like "المدينة المنورة" (67 chars) or "kuala-lumpur". When the
        // full title exceeds 60 chars, use the SHORT version (drops the
        // "وتحديد القبلة بدقة" / "and Accurate Qibla Finder" tail).
        const _qTitlesShort = {
            ar: \`اتجاه القبلة في \${cityDisplay} | بوصلة الكعبة\`,
            en: \`Qibla Direction in \${cityDisplay} | Kaaba Compass\`,
            fr: \`Direction de la Qibla à \${cityDisplay} | Boussole de la Kaaba\`,
            tr: \`\${cityDisplay} Kıble Yönü | Kâbe Pusulası\`,
            ur: \`\${cityDisplay} میں سمتِ قبلہ | کعبہ کا قطب نما\`,
            de: \`Qibla-Richtung in \${cityDisplay} | Kaaba-Kompass\`,
            id: \`Arah Kiblat di \${cityDisplay} | Kompas Kakbah\`,
            es: \`Dirección de la Qibla en \${cityDisplay} | Brújula de la Kaaba\`,
            bn: \`\${cityDisplay}-এ কিবলার দিক | কাবা কম্পাস\`,
            ms: \`Arah Kiblat di \${cityDisplay} | Kompas Kaabah\`,
        };
        const _qFullTitle = _qTitles[lang] || _qTitles.en;
        const _qShortTitle = _qTitlesShort[lang] || _qTitlesShort.en;
        // Use [...str].length to count actual visible chars (handles emoji/surrogate pairs).
        title = ([..._qFullTitle].length <= 60) ? _qFullTitle : _qShortTitle;
        description = _qDescs[lang] || _qDescs.en;`;

replaceSrv('PART 1 — server.js: add Title length guard (10 langs)', SRV_OLD, SRV_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — js/app.js: add same length guard for client-side DOM title.
// Anchor: the Q-A2 titles array + setSEOMeta call. The titles array currently
// has [withCountry, withoutCountry] both = full title (Q-A2 simplification).
// Replace with: define full + short, pick by length.
// ═══════════════════════════════════════════════════════════════════════════
const APP_OLD = `        // Phase Q-A2 (2026-05-03): client Title + Meta now MIRROR SSR Q-A format
        // exactly so SEOptimer (which may read DOM post-JS) sees the same Title
        // it sees in SSR. Drops the previous [withCountry, withoutCountry] array
        // pattern — single string per lang. Country suffix removed because the
        // SSR Title is already in the 50-60 sweet spot without it.
        const titles = ({
            ar: [\`اتجاه القبلة في \${cityDisplay} | بوصلة الكعبة وتحديد القبلة بدقة\`, \`اتجاه القبلة في \${cityDisplay} | بوصلة الكعبة وتحديد القبلة بدقة\`],
            en: [\`Qibla Direction in \${cityDisplay} | Kaaba Compass and Accurate Qibla Finder\`, \`Qibla Direction in \${cityDisplay} | Kaaba Compass and Accurate Qibla Finder\`],
            fr: [\`Direction de la Qibla à \${cityDisplay} | Boussole de la Kaaba et localisation précise\`, \`Direction de la Qibla à \${cityDisplay} | Boussole de la Kaaba et localisation précise\`],
            tr: [\`\${cityDisplay} Kıble Yönü | Kâbe Pusulası ve Hassas Konum\`, \`\${cityDisplay} Kıble Yönü | Kâbe Pusulası ve Hassas Konum\`],
            ur: [\`\${cityDisplay} میں سمتِ قبلہ | کعبہ کا قطب نما اور درست تعین\`, \`\${cityDisplay} میں سمتِ قبلہ | کعبہ کا قطب نما اور درست تعین\`],
            de: [\`Qibla-Richtung in \${cityDisplay} | Kaaba-Kompass und präzise Ortung\`, \`Qibla-Richtung in \${cityDisplay} | Kaaba-Kompass und präzise Ortung\`],
            id: [\`Arah Kiblat di \${cityDisplay} | Kompas Kakbah dan Penentu Kiblat Akurat\`, \`Arah Kiblat di \${cityDisplay} | Kompas Kakbah dan Penentu Kiblat Akurat\`],
            es: [\`Dirección de la Qibla en \${cityDisplay} | Brújula de la Kaaba y localizador preciso\`, \`Dirección de la Qibla en \${cityDisplay} | Brújula de la Kaaba y localizador preciso\`],
            bn: [\`\${cityDisplay}-এ কিবলার দিক | কাবা কম্পাস ও সঠিক কিবলা নির্ণয়\`, \`\${cityDisplay}-এ কিবলার দিক | কাবা কম্পাস ও সঠিক কিবলা নির্ণয়\`],
            ms: [\`Arah Kiblat di \${cityDisplay} | Kompas Kaabah dan Penentu Kiblat Tepat\`, \`Arah Kiblat di \${cityDisplay} | Kompas Kaabah dan Penentu Kiblat Tepat\`],
        })[lang];`;

const APP_NEW = `        // Phase Q-A10 (2026-05-04): dynamic length guard. Mirrors server.js Q-A10
        // logic — when full title > 60 chars (long city names like "المدينة المنورة"),
        // fall back to the SHORT version (drops the "وتحديد القبلة بدقة" tail).
        // Keeps SSR ↔ DOM in sync (Q-A2 invariant).
        const _fullTitlesByLang = ({
            ar: \`اتجاه القبلة في \${cityDisplay} | بوصلة الكعبة وتحديد القبلة بدقة\`,
            en: \`Qibla Direction in \${cityDisplay} | Kaaba Compass and Accurate Qibla Finder\`,
            fr: \`Direction de la Qibla à \${cityDisplay} | Boussole de la Kaaba et localisation précise\`,
            tr: \`\${cityDisplay} Kıble Yönü | Kâbe Pusulası ve Hassas Konum\`,
            ur: \`\${cityDisplay} میں سمتِ قبلہ | کعبہ کا قطب نما اور درست تعین\`,
            de: \`Qibla-Richtung in \${cityDisplay} | Kaaba-Kompass und präzise Ortung\`,
            id: \`Arah Kiblat di \${cityDisplay} | Kompas Kakbah dan Penentu Kiblat Akurat\`,
            es: \`Dirección de la Qibla en \${cityDisplay} | Brújula de la Kaaba y localizador preciso\`,
            bn: \`\${cityDisplay}-এ কিবলার দিক | কাবা কম্পাস ও সঠিক কিবলা নির্ণয়\`,
            ms: \`Arah Kiblat di \${cityDisplay} | Kompas Kaabah dan Penentu Kiblat Tepat\`,
        })[lang];
        const _shortTitlesByLang = ({
            ar: \`اتجاه القبلة في \${cityDisplay} | بوصلة الكعبة\`,
            en: \`Qibla Direction in \${cityDisplay} | Kaaba Compass\`,
            fr: \`Direction de la Qibla à \${cityDisplay} | Boussole de la Kaaba\`,
            tr: \`\${cityDisplay} Kıble Yönü | Kâbe Pusulası\`,
            ur: \`\${cityDisplay} میں سمتِ قبلہ | کعبہ کا قطب نما\`,
            de: \`Qibla-Richtung in \${cityDisplay} | Kaaba-Kompass\`,
            id: \`Arah Kiblat di \${cityDisplay} | Kompas Kakbah\`,
            es: \`Dirección de la Qibla en \${cityDisplay} | Brújula de la Kaaba\`,
            bn: \`\${cityDisplay}-এ কিবলার দিক | কাবা কম্পাস\`,
            ms: \`Arah Kiblat di \${cityDisplay} | Kompas Kaabah\`,
        })[lang];
        const _chosenTitle = ([..._fullTitlesByLang].length <= 60) ? _fullTitlesByLang : _shortTitlesByLang;
        const titles = [_chosenTitle, _chosenTitle];`;

replaceApp('PART 2 — js/app.js: add Title length guard (10 langs)', APP_OLD, APP_NEW);

writeFileSync(SRV_PATH, srvRaw);
writeFileSync(APP_PATH, appRaw);

console.log('\n✅ Phase Q-A10 — Dynamic Title Length Guard applied.');
console.log('  • Short cities (e.g., جدة، الرياض): use FULL title (~58 chars)');
console.log('  • Long cities (e.g., المدينة المنورة): use SHORT title');
console.log('  • Both SSR (server.js) and DOM (js/app.js) updated for sync');
console.log('\nNext: bump app.js cache version + restart + test on 5 cities.');
