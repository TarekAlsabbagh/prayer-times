// Phase E4-city-e — Moon main-card reservation recalibration.
//
// See header in v1 for full diagnosis. Quick recap:
//   • Hub + Month pages render only 6 of 8 children → 753px desktop / 1538px
//     mobile real content. Old shared min-height (1370/1810) padded white
//     space (~617px desktop, ~272px mobile).
//   • Today-city + Date pages render all 8 children → real content already
//     exceeds old min-height (1419 > 1370 desktop, 2290+ > 1810 mobile).
//
// Strategy:
//   • Lower Hub + Month min-height to real-content + 17px buffer:
//       desktop:  770px  (was 1370 — saves 600px white space)
//       mobile:  1555px  (was 1810 — saves 255px white space)
//   • Keep today-city + date min-height UNCHANGED (already correct).

import { readFileSync, writeFileSync } from 'node:fs';

const CSS_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\css\\style.css';
let raw = readFileSync(CSS_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/Phase E4-city-e \(2026-05-03\)/.test(raw)) {
    throw new Error('[style.css] E4-city-e already applied (header marker present)');
}

// Normalize template literals (LF) to file's actual EOL (CRLF on Windows).
function lfToEol(s) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

function replaceOnce(label, oldStr, newStr) {
    const oldNorm = lfToEol(oldStr);
    const newNorm = lfToEol(newStr);
    const cnt = raw.split(oldNorm).length - 1;
    if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
    raw = raw.replace(oldNorm, newNorm);
    console.log(`✓ ${label}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — Mobile: replace shared 4-selector rule with 2 split rules.
// ═══════════════════════════════════════════════════════════════════════════
const MOBILE_OLD = `html.moon-today-city-page #moon-main-card,
html.moon-hub-page #moon-main-card,
html.moon-month-page #moon-main-card,
html.moon-date-page #moon-main-card {
    min-height: 1810px;  /* mobile: 1804 on real nav + 6px buffer
                            (srcdoc test underestimated by ~76px due to
                            JS-injected dynamic content not running in srcdoc) */
}`;

const MOBILE_NEW = `/* Phase E4-city-e (2026-05-03): split 4-selector shared rule into 2 groups.
   Today-city + Date have 8 children → real content 2290+px mobile, 1419px
   desktop. Hub + Month have 6 children only (no moon-comparison or phase-
   insight) → real content 1538px mobile, 753px desktop. Sharing one min-
   height padded Hub/Month with ~272px (mobile) / ~617px (desktop) white
   space. Recalibrated values measured live in preview server, AR lang. */
html.moon-today-city-page #moon-main-card,
html.moon-date-page #moon-main-card {
    min-height: 1810px;  /* mobile (UNCHANGED): today-city/date real content
                            ~2290+px > min-height; kept as safety floor for
                            partial-load CLS resistance */
}

html.moon-hub-page #moon-main-card,
html.moon-month-page #moon-main-card {
    min-height: 1555px;  /* Phase E4-city-e: mobile real content 1538 + 17 buffer
                            (was 1810 — saves ~255px white space below the card
                            on Hub + Month pages, 6-children layout) */
}`;

replaceOnce('PART 1 — Mobile split (today-city/date kept; hub/month → 1555px)', MOBILE_OLD, MOBILE_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — Desktop: replace shared 4-selector rule with 2 split rules.
// ═══════════════════════════════════════════════════════════════════════════
const DESKTOP_OLD = `    html.moon-today-city-page #moon-main-card,
    html.moon-hub-page #moon-main-card,
    html.moon-month-page #moon-main-card,
    html.moon-date-page #moon-main-card {
        min-height: 1370px;  /* desktop: measured 1361 + 9px buffer */
    }`;

const DESKTOP_NEW = `    /* Phase E4-city-e (2026-05-03): desktop split — same rationale as mobile */
    html.moon-today-city-page #moon-main-card,
    html.moon-date-page #moon-main-card {
        min-height: 1370px;  /* desktop (UNCHANGED): today-city/date real
                                content 1419px > min-height; safety floor */
    }

    html.moon-hub-page #moon-main-card,
    html.moon-month-page #moon-main-card {
        min-height: 770px;  /* Phase E4-city-e: desktop real content 753 + 17
                               buffer (was 1370 — saves ~600px white space
                               below the card on Hub + Month pages) */
    }`;

replaceOnce('PART 2 — Desktop split (today-city/date kept; hub/month → 770px)', DESKTOP_OLD, DESKTOP_NEW);

writeFileSync(CSS_PATH, raw);

console.log('\n✅ Phase E4-city-e — main-card reservation recalibration complete.');
console.log('\nChanges applied:');
console.log('  • Mobile hub/month: 1810px → 1555px (saves 255px white space)');
console.log('  • Desktop hub/month: 1370px → 770px (saves 600px white space)');
console.log('  • Today-city/date min-height UNCHANGED (real content already exceeds)');
