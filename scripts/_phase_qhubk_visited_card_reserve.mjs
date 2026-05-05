// Phase Q-Hub-K — Reserve Visited Card Space (2026-05-05).
//
// After Q-Hub-J + extensions, R1+R2 hit Performance 88-89 and CLS <0.05,
// but R3 still showed CLS 0.236 due to a footer shift caused by:
//   <div id="qibla-hub-visited-card" hidden>...</div>
// JS toggles hidden=false when localStorage.qibla_visited_cities has
// entries (from previous Lighthouse runs sharing storage). The
// hidden→visible toggle grows the card from 0 → 150-250px, pushing
// every section below it (including the site footer) downward.
//
// Q-Hub-K removes the `hidden` attribute on /qibla Hub SSR and replaces
// it with a permanent SSR-rendered placeholder ("ابدأ باختيار مدينة...").
// JS continues populating real city chips when LRU has data; when empty
// the placeholder stays visible. Card always occupies its reserved
// min-height → zero CLS contribution.
//
// SCOPE: /qibla ONLY. Title/Meta/H1/SEO/scripts untouched.
// /qibla-in-{city}, /moon-*, /hijri-*, /prayer-times-* untouched.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRV_PATH = path.join(ROOT, 'server.js');
const APP_PATH = path.join(ROOT, 'js', 'app.js');
const CSS_PATH = path.join(ROOT, 'css', 'style.css');
const HTML_PATH = path.join(ROOT, 'index.html');

let srvRaw = readFileSync(SRV_PATH, 'utf8');
let appRaw = readFileSync(APP_PATH, 'utf8');
let cssRaw = readFileSync(CSS_PATH, 'utf8');
let htmlRaw = readFileSync(HTML_PATH, 'utf8');

const isCRLFsrv = /\r\n/.test(srvRaw);
const isCRLFapp = /\r\n/.test(appRaw);
const isCRLFcss = /\r\n/.test(cssRaw);
const isCRLFhtml = /\r\n/.test(htmlRaw);

let srv = srvRaw.replace(/\r\n/g, '\n');
let app = appRaw.replace(/\r\n/g, '\n');
let css = cssRaw.replace(/\r\n/g, '\n');
let html = htmlRaw.replace(/\r\n/g, '\n');

if (/Phase Q-Hub-K \(2026-05-05\)/.test(srv)) {
    throw new Error('[server.js] Q-Hub-K already applied');
}

function toEol(s, useCRLF) { return useCRLF ? s.replace(/\n/g, '\r\n') : s; }
function replaceOnce(haystack, needle, replacement, label) {
    const i = haystack.indexOf(needle);
    if (i < 0) throw new Error(`[${label}] anchor not found`);
    if (haystack.indexOf(needle, i + 1) >= 0) {
        throw new Error(`[${label}] anchor not unique`);
    }
    return haystack.substring(0, i) + replacement + haystack.substring(i + needle.length);
}

// ───────────────────────────────────────────────────────────────────────
// 1) server.js — extend the existing Q-Hub-A SSR injection block to also
//    fill the visited-card placeholder + remove its `hidden` attribute.
// ───────────────────────────────────────────────────────────────────────

const SRV_ANCHOR = `        const _qhh = _qHubHeroSSR[seo.lang] || _qHubHeroSSR.en;
        // Subtitle`;

if (srv.indexOf(SRV_ANCHOR) < 0) {
    throw new Error('[server.js] Q-Hub-H anchor not found');
}

const SRV_INJECT = `        const _qhh = _qHubHeroSSR[seo.lang] || _qHubHeroSSR.en;
        // Phase Q-Hub-K (2026-05-05): visited-card SSR placeholder. JS used to
        // toggle this card via the hidden attribute, causing a 0→170-250px
        // height jump that propagated CLS down to the footer (the residual
        // 0.21 shift seen on Lighthouse Run 3 after Q-Hub-J landed).
        // Now SSR renders the card fully visible with a per-lang placeholder
        // grid item; JS replaces the grid contents when LRU has data and
        // leaves the placeholder when empty.
        const _qHubVisitedSSR = {
            ar: { title: '🕓 آخر المدن التي زرتها', placeholder: 'ابدأ باختيار مدينة لمعرفة اتجاه القبلة بدقة' },
            en: { title: '🕓 Recently visited cities', placeholder: 'Start by picking a city to find the Qibla direction' },
            fr: { title: '🕓 Villes récemment visitées', placeholder: 'Commencez par choisir une ville pour trouver la Qibla' },
            tr: { title: '🕓 Son ziyaret edilen şehirler', placeholder: 'Kıble yönünü bulmak için bir şehir seçerek başlayın' },
            ur: { title: '🕓 حال ہی میں دیکھے گئے شہر', placeholder: 'اپنا قبلہ معلوم کرنے کے لیے شہر منتخب کریں' },
            de: { title: '🕓 Zuletzt besuchte Städte', placeholder: 'Wählen Sie eine Stadt, um die Qibla zu finden' },
            id: { title: '🕓 Kota yang baru dikunjungi', placeholder: 'Mulai dengan memilih kota untuk menemukan arah kiblat' },
            es: { title: '🕓 Ciudades visitadas recientemente', placeholder: 'Comience eligiendo una ciudad para encontrar la Qibla' },
            bn: { title: '🕓 সম্প্রতি পরিদর্শিত শহর', placeholder: 'কিবলার দিক জানতে একটি শহর বেছে নিয়ে শুরু করুন' },
            ms: { title: '🕓 Bandar terkini yang dilawati', placeholder: 'Mulakan dengan memilih bandar untuk mencari arah kiblat' },
        };
        const _qhv = _qHubVisitedSSR[seo.lang] || _qHubVisitedSSR.en;
        // Replace the entire visited-card div (with hidden attr) with an
        // SSR-filled visible version carrying data-qhh-ssr="1".
        html = html.replace(
            /<div class="section-card qibla-hub-only" id="qibla-hub-visited-card" hidden>\\s*<h2 id="qibla-hub-visited-title"[^>]*><\\/h2>\\s*<div id="qibla-hub-visited-grid"[^>]*><\\/div>\\s*<\\/div>/,
            \`<div class="section-card qibla-hub-only" id="qibla-hub-visited-card" data-qhh-ssr="1"><h2 id="qibla-hub-visited-title" class="qibla-hub-visited-title" data-qhh-ssr="1">\${_escHtml(_qhv.title)}</h2><div id="qibla-hub-visited-grid" class="qibla-hub-visited-grid" data-qhh-placeholder="1"><p class="qhv-placeholder">\${_escHtml(_qhv.placeholder)}</p></div></div>\`
        );
        // Subtitle`;

srv = replaceOnce(srv, SRV_ANCHOR, SRV_INJECT, 'Q-Hub-K visited card SSR');

// ───────────────────────────────────────────────────────────────────────
// 2) app.js — visited-card logic update. Never toggle `hidden`. When LRU
//    has data, replace the placeholder. When empty, leave it alone.
// ───────────────────────────────────────────────────────────────────────

const APP_OLD = `    if (visitedCard && visitedGrid) {
        if (visited.length > 0) {
            if (visitedTitle) visitedTitle.textContent = ui.visited_title;
            visitedGrid.innerHTML = visited.map(v => {
                const display = _resolveCityNameClient(v.slug, lang, v.englishName || v.slug);
                const href = _buildQiblaCityUrl(v.englishName || v.slug, v.lat, v.lng, v.slug);
                return \`<a class="qhv-chip" href="\${href}" data-slug="\${v.slug}">\`
                     + \`<span class="qhv-icon" aria-hidden="true">🕓</span>\`
                     + \`<span class="qhv-name">\${display}</span>\`
                     + \`<span class="qhv-arrow" aria-hidden="true">→</span></a>\`;
            }).join('');
            visitedCard.hidden = false;
        } else {
            visitedGrid.innerHTML = '';
            visitedCard.hidden = true;
        }
    }`;

const APP_NEW = `    if (visitedCard && visitedGrid) {
        // Phase Q-Hub-K (2026-05-05): SSR-rendered card always visible.
        // - Has data: REPLACE placeholder with city chips. Skip if SSR
        //   title is already in place (data-qhh-ssr) to preserve LCP-area
        //   stability — the title is identical to ui.visited_title.
        // - Empty: leave the SSR placeholder in place. Don't toggle
        //   hidden/display (those caused the residual 0.21 footer CLS
        //   shift on Lighthouse Run 3 before this fix).
        if (visited.length > 0) {
            if (visitedTitle && visitedTitle.getAttribute('data-qhh-ssr') !== '1') {
                visitedTitle.textContent = ui.visited_title;
            }
            visitedGrid.innerHTML = visited.map(v => {
                const display = _resolveCityNameClient(v.slug, lang, v.englishName || v.slug);
                const href = _buildQiblaCityUrl(v.englishName || v.slug, v.lat, v.lng, v.slug);
                return \`<a class="qhv-chip" href="\${href}" data-slug="\${v.slug}">\`
                     + \`<span class="qhv-icon" aria-hidden="true">🕓</span>\`
                     + \`<span class="qhv-name">\${display}</span>\`
                     + \`<span class="qhv-arrow" aria-hidden="true">→</span></a>\`;
            }).join('');
            visitedGrid.removeAttribute('data-qhh-placeholder');
        }
        // Else: keep the SSR placeholder. No DOM mutation = no CLS.
    }`;

app = replaceOnce(app, APP_OLD, APP_NEW, 'Q-Hub-K app.js visited logic');

// ───────────────────────────────────────────────────────────────────────
// 3) css/style.css — reserve min-height on the visited card + style the
//    placeholder so it looks like a proper hint, not an empty void.
// ───────────────────────────────────────────────────────────────────────

const CSS_OLD = `html.qibla-hub-page #qibla-hub-howto-card { min-height: 295px; }
html.qibla-hub-page #qibla-hub-usecases-card { min-height: 200px; }`;

const CSS_NEW = `html.qibla-hub-page #qibla-hub-howto-card { min-height: 295px; }
html.qibla-hub-page #qibla-hub-usecases-card { min-height: 200px; }
/* Phase Q-Hub-K (2026-05-05): visited-card always-visible reservation. */
html.qibla-hub-page #qibla-hub-visited-card {
    min-height: 170px;
    display: block !important;  /* defeat any [hidden] residual */
}
html.qibla-hub-page .qhv-placeholder {
    margin: 8px 0 0;
    padding: 14px 16px;
    color: var(--text-light);
    background: rgba(26,74,26,0.04);
    border: 1px dashed rgba(26,74,26,0.18);
    border-radius: 12px;
    font-size: 0.95rem;
    line-height: 1.6;
    text-align: center;
}
html[data-theme="dark"] html.qibla-hub-page .qhv-placeholder {
    background: rgba(255,255,255,0.03);
    border-color: rgba(127,199,127,0.22);
}`;

css = replaceOnce(css, CSS_OLD, CSS_NEW, 'Q-Hub-K CSS visited card');

// Add mobile-side min-height inside the existing media query.
const CSS_MOBILE_OLD = `@media (max-width: 768px) {
    html.qibla-hub-page #qibla-hub-howto-card { min-height: 410px; }
    html.qibla-hub-page #qibla-hub-usecases-card { min-height: 280px; }
    html.qibla-hub-page #qibla-faq { min-height: 280px; }
}`;

const CSS_MOBILE_NEW = `@media (max-width: 768px) {
    html.qibla-hub-page #qibla-hub-howto-card { min-height: 410px; }
    html.qibla-hub-page #qibla-hub-usecases-card { min-height: 280px; }
    html.qibla-hub-page #qibla-faq { min-height: 280px; }
    html.qibla-hub-page #qibla-hub-visited-card { min-height: 220px; }
}`;

css = replaceOnce(css, CSS_MOBILE_OLD, CSS_MOBILE_NEW, 'Q-Hub-K CSS mobile');

// ───────────────────────────────────────────────────────────────────────
// 4) Bump CSS version
// ───────────────────────────────────────────────────────────────────────

html = html.replace(/css\/style\.css\?v=\d+/g, 'css/style.css?v=266');

writeFileSync(SRV_PATH, toEol(srv, isCRLFsrv), 'utf8');
writeFileSync(APP_PATH, toEol(app, isCRLFapp), 'utf8');
writeFileSync(CSS_PATH, toEol(css, isCRLFcss), 'utf8');
writeFileSync(HTML_PATH, toEol(html, isCRLFhtml), 'utf8');

console.log('\n✅ Phase Q-Hub-K — Visited card always-visible reservation applied.');
console.log('  • server.js: SSR-injects visited card (no hidden attr) with per-lang placeholder');
console.log('  • app.js: never toggles hidden; replaces placeholder if LRU has data');
console.log('  • css: min-height 170/220px reservation + dashed placeholder styling');
console.log('  • CSS bumped to v=266');
