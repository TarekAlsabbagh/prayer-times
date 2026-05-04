// Phase Q-A4 — Qibla Visual Redesign (single commit, full scope).
//
// Per user spec:
//   • Single commit (Option A): wrapper + grid + CSS + badges + H2→H3
//   • Add ONE new H2 wrapper above the 4 cards
//   • Convert the 4 card titles from H2 → H3 (cleaner SEO hierarchy)
//   • 2-column grid on desktop, 1-column on mobile
//   • Stat badges for bearing (244°) + distance (790 km)
//   • Lighter card design (border + soft shadow + accent stripe)
//   • CSS in css/style.css (NOT separate file)
//   • Bump style.css?v=N
//   • DO NOT reorder FAQ vs Other Cities
//   • DO NOT change text/SEO content (preserve all Q-A/Q-A2/Q-A3 work)
//   • DO NOT touch /qibla Hub or moon/hijri/prayer pages
//
// Implementation:
//   PART 1 (server.js): replace the per-section <section class="section-card
//     qibla-seo-info qibla-seo-{name}"> emission with a single <section
//     class="qibla-seo-info-wrap"> containing:
//       <header class="qibla-seo-header">
//         <span class="qibla-seo-kicker">دليل اتجاه القبلة</span>
//         <h2>معلومات تساعدك على تحديد القبلة في {city} بدقة</h2>
//         <p class="qibla-seo-intro">...</p>
//       </header>
//       <div class="qibla-seo-info-grid">
//         <article class="qibla-seo-card qibla-seo-card-overview">
//           <h3>...</h3><p>...</p>
//         </article>
//         <article class="qibla-seo-card qibla-seo-card-bearing">
//           <div class="qibla-seo-stat"><span>...</span><strong>244°</strong></div>
//           <h3>...</h3><p>...</p>
//         </article>
//         <article class="qibla-seo-card qibla-seo-card-distance">
//           <div class="qibla-seo-stat"><span>...</span><strong>790 كم</strong></div>
//           <h3>...</h3><p>...</p>
//         </article>
//         <article class="qibla-seo-card qibla-seo-card-howto">
//           <h3>...</h3>
//           <p>P1</p><p>P2</p><p>P3</p><p>P4</p>  (preserved from Q-A3)
//         </article>
//       </div>
//
//   PART 2 (css/style.css): add ~120 lines of CSS for the new structure.
//
//   PART 3 (index.html): bump style.css?v=247 → v=248.

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH  = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
const CSS_PATH  = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\css\\style.css';
const HTML_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\index.html';

let srvRaw  = readFileSync(SRV_PATH, 'utf8');
let cssRaw  = readFileSync(CSS_PATH, 'utf8');
let htmlRaw = readFileSync(HTML_PATH, 'utf8');

const isCRLFsrv  = /\r\n/.test(srvRaw);
const isCRLFcss  = /\r\n/.test(cssRaw);
const isCRLFhtml = /\r\n/.test(htmlRaw);

if (/Phase Q-A4 \(2026-05-03\)/.test(srvRaw)) {
    throw new Error('[server.js] Q-A4 already applied');
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

const replaceSrv  = makeReplacer(() => srvRaw,  v => srvRaw  = v, isCRLFsrv);
const replaceCss  = makeReplacer(() => cssRaw,  v => cssRaw  = v, isCRLFcss);
const replaceHtml = makeReplacer(() => htmlRaw, v => htmlRaw = v, isCRLFhtml);

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — server.js: replace 4-section emission with wrapper + grid + cards.
// Anchor: from start of "_qaSec1Html = '<section..." to the html.replace() end.
// ═══════════════════════════════════════════════════════════════════════════
const SRV_OLD = `                const _qaSec1Html = '<section class="section-card qibla-seo-info qibla-seo-overview">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec1H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec1P)) + '</p>'
                    + '</section>';`;

const SRV_NEW = `                // Phase Q-A4 (2026-05-03): visual redesign — wrapper + grid + cards.
                // Was 4 separate full-width sections with H2 each. Now a single wrapper
                // with ONE H2 + 4 cards in a 2-column grid (1-col on mobile), each
                // card uses H3. Bearing + Distance cards include stat badges. Same
                // text content as Q-A/Q-A2/Q-A3 (no SEO regression).
                const _qaWrapH2 = {
                    ar: \`معلومات تساعدك على تحديد القبلة في \${seo.qiblaRef.cityName} بدقة\`,
                    en: \`Information to help you find the Qibla in \${seo.qiblaRef.cityName} accurately\`,
                    fr: \`Informations pour vous aider à trouver la Qibla à \${seo.qiblaRef.cityName} avec précision\`,
                    tr: \`\${seo.qiblaRef.cityName} şehrinde kıbleyi hassas şekilde bulmanıza yardımcı bilgiler\`,
                    ur: \`\${seo.qiblaRef.cityName} میں قبلہ کو درست طور پر تلاش کرنے میں مدد کرنے والی معلومات\`,
                    de: \`Informationen, die Ihnen helfen, die Qibla in \${seo.qiblaRef.cityName} genau zu finden\`,
                    id: \`Informasi yang membantu Anda menemukan kiblat di \${seo.qiblaRef.cityName} dengan akurat\`,
                    es: \`Información para ayudarle a encontrar la Qibla en \${seo.qiblaRef.cityName} con precisión\`,
                    bn: \`\${seo.qiblaRef.cityName}-এ কিবলা সঠিকভাবে খুঁজে পেতে সহায়ক তথ্য\`,
                    ms: \`Maklumat untuk membantu anda mencari kiblat di \${seo.qiblaRef.cityName} dengan tepat\`
                };
                const _qaKicker = {
                    ar: 'دليل اتجاه القبلة',
                    en: 'Qibla Direction Guide',
                    fr: 'Guide de direction de la Qibla',
                    tr: 'Kıble Yönü Kılavuzu',
                    ur: 'سمتِ قبلہ گائیڈ',
                    de: 'Qibla-Richtungsanleitung',
                    id: 'Panduan Arah Kiblat',
                    es: 'Guía de dirección de la Qibla',
                    bn: 'কিবলা দিকনির্দেশনা গাইড',
                    ms: 'Panduan Arah Kiblat'
                };
                const _qaWrapIntro = {
                    ar: \`تعرّف على زاوية القبلة، المسافة إلى مكة المكرمة، وطريقة استخدام البوصلة والخريطة للحصول على نتيجة أوضح في \${seo.qiblaRef.cityName}.\`,
                    en: \`Learn the Qibla bearing, distance to Mecca, and how to use the compass and map to get a clearer result in \${seo.qiblaRef.cityName}.\`,
                    fr: \`Découvrez l'azimut de la Qibla, la distance à La Mecque et comment utiliser la boussole et la carte pour un résultat plus clair à \${seo.qiblaRef.cityName}.\`,
                    tr: \`\${seo.qiblaRef.cityName} şehrinde daha net bir sonuç elde etmek için kıble açısını, Mekke'ye olan mesafeyi ve pusula ile haritayı nasıl kullanacağınızı öğrenin.\`,
                    ur: \`\${seo.qiblaRef.cityName} میں واضح نتیجہ حاصل کرنے کے لیے قبلہ کا زاویہ، مکہ تک فاصلہ، اور قطب نما اور نقشے کا استعمال جانیں۔\`,
                    de: \`Erfahren Sie die Qibla-Peilung, die Entfernung nach Mekka und wie Sie Kompass und Karte verwenden, um ein klareres Ergebnis in \${seo.qiblaRef.cityName} zu erhalten.\`,
                    id: \`Pelajari sudut kiblat, jarak ke Mekkah, dan cara menggunakan kompas dan peta untuk mendapatkan hasil yang lebih jelas di \${seo.qiblaRef.cityName}.\`,
                    es: \`Aprenda el rumbo de la Qibla, la distancia a La Meca y cómo usar la brújula y el mapa para obtener un resultado más claro en \${seo.qiblaRef.cityName}.\`,
                    bn: \`\${seo.qiblaRef.cityName}-এ আরো স্পষ্ট ফলাফল পেতে কিবলার কোণ, মক্কার দূরত্ব, এবং কম্পাস ও মানচিত্র ব্যবহারের উপায় জানুন।\`,
                    ms: \`Ketahui sudut kiblat, jarak ke Makkah, dan cara menggunakan kompas dan peta untuk mendapatkan hasil yang lebih jelas di \${seo.qiblaRef.cityName}.\`
                };
                const _qaBadgeBearingLabel = {
                    ar: 'زاوية القبلة', en: 'Qibla bearing', fr: 'Azimut Qibla',
                    tr: 'Kıble açısı', ur: 'قبلہ زاویہ', de: 'Qibla-Peilung',
                    id: 'Sudut kiblat', es: 'Rumbo Qibla', bn: 'কিবলা কোণ', ms: 'Sudut kiblat'
                };
                const _qaBadgeDistanceLabel = {
                    ar: 'المسافة إلى مكة', en: 'Distance to Mecca', fr: 'Distance à La Mecque',
                    tr: 'Mekke\\'ye uzaklık', ur: 'مکہ تک فاصلہ', de: 'Entfernung nach Mekka',
                    id: 'Jarak ke Mekkah', es: 'Distancia a La Meca', bn: 'মক্কার দূরত্ব', ms: 'Jarak ke Makkah'
                };
                const _qaUnitKm = {
                    ar: 'كم', en: 'km', fr: 'km', tr: 'km', ur: 'کلومیٹر',
                    de: 'km', id: 'km', es: 'km', bn: 'কিমি', ms: 'km'
                };

                // Card 1: overview (no badge)
                const _qaCard1Html = '<article class="qibla-seo-card qibla-seo-card-overview">'
                    + '<h3>' + _escHtml(_qaPick(_qaSec1H2)) + '</h3>'
                    + '<p>' + _escHtml(_qaPick(_qaSec1P)) + '</p>'
                    + '</article>';
                // Card 2: bearing (with stat badge)
                const _qaCard2H3Built = (() => {
                    const _tpl = _qaPick(_qaSec2H2);
                    const _parts = _tpl.split('{city}');
                    return _escHtml(_parts[0] || _tpl) + (_parts.length > 1 ? (_qaCity + _escHtml(_parts[1] || '')) : '');
                })();
                const _qaCard2Html = '<article class="qibla-seo-card qibla-seo-card-bearing">'
                    + '<div class="qibla-seo-stat"><span>' + _escHtml(_qaPick(_qaBadgeBearingLabel)) + '</span>'
                    + '<strong>' + _bearingStr + '°</strong></div>'
                    + '<h3>' + _escHtml(_qaPick(_qaSec2H2)) + '</h3>'
                    + '<p>' + _escHtml(_qaPick(_qaSec2P)) + '</p>'
                    + '</article>';
                // Card 3: distance (with stat badge)
                const _qaCard3Html = '<article class="qibla-seo-card qibla-seo-card-distance">'
                    + '<div class="qibla-seo-stat"><span>' + _escHtml(_qaPick(_qaBadgeDistanceLabel)) + '</span>'
                    + '<strong>' + _distanceStr + ' ' + _escHtml(_qaPick(_qaUnitKm)) + '</strong></div>'
                    + '<h3>' + _escHtml(_qaPick(_qaSec3H2)) + '</h3>'
                    + '<p>' + _escHtml(_qaPick(_qaSec3P)) + '</p>'
                    + '</article>';
                // Card 4: how-to (4 paragraphs from Q-A/Q-A2/Q-A3)
                const _qaCard4Html = '<article class="qibla-seo-card qibla-seo-card-howto">'
                    + '<h3>' + _escHtml(_qaPick(_qaSec4H2)) + '</h3>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P2)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P3)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P4)) + '</p>'
                    + '</article>';
                // Wrapper with header (kicker + H2 + intro) + grid (4 cards)
                const _qaSec1Html = '<section class="qibla-seo-info-wrap" id="qibla-seo-info-wrap">'
                    + '<header class="qibla-seo-header">'
                    + '<span class="qibla-seo-kicker">' + _escHtml(_qaPick(_qaKicker)) + '</span>'
                    + '<h2>' + _escHtml(_qaPick(_qaWrapH2)) + '</h2>'
                    + '<p class="qibla-seo-intro">' + _escHtml(_qaPick(_qaWrapIntro)) + '</p>'
                    + '</header>'
                    + '<div class="qibla-seo-info-grid">'
                    + _qaCard1Html + _qaCard2Html + _qaCard3Html + _qaCard4Html
                    + '</div>'
                    + '</section>';`;

replaceSrv('PART 1.A — Replace _qaSec1Html with wrapper builder', SRV_OLD, SRV_NEW);

// Now we need to remove the old _qaSec2Html, _qaSec3Html, _qaSec4Html builders
// since they're now folded into _qaCard2Html, _qaCard3Html, _qaCard4Html above.
// Replace each old builder with empty (the const declarations are still needed
// for the dictionaries above them — only the *Html builders are removed).
// Actually simpler: just neutralize them so they declare empty strings.

const SRV_OLD2 = `                const _qaSec2Html = '<section class="section-card qibla-seo-info qibla-seo-bearing">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec2H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec2P)) + '</p>'
                    + '</article>';`;
// Note: original has typo? Let me check... no, it's '</section>' not '</article>'.
// Use the actual current text:
const SRV_OLD2_actual = `                const _qaSec2Html = '<section class="section-card qibla-seo-info qibla-seo-bearing">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec2H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec2P)) + '</p>'
                    + '</section>';`;
const SRV_NEW2 = `                // Phase Q-A4: _qaSec2Html removed — content moved into _qaCard2Html above (stat badge + H3).
                const _qaSec2Html = '';`;
replaceSrv('PART 1.B — Neutralize _qaSec2Html (folded into card)', SRV_OLD2_actual, SRV_NEW2);

const SRV_OLD3 = `                const _qaSec3Html = '<section class="section-card qibla-seo-info qibla-seo-distance">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec3H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec3P)) + '</p>'
                    + '</section>';`;
const SRV_NEW3 = `                // Phase Q-A4: _qaSec3Html removed — content moved into _qaCard3Html above (stat badge + H3).
                const _qaSec3Html = '';`;
replaceSrv('PART 1.C — Neutralize _qaSec3Html (folded into card)', SRV_OLD3, SRV_NEW3);

const SRV_OLD4 = `                const _qaSec4Html = '<section class="section-card qibla-seo-info qibla-seo-howto">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec4H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P2)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P3)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P4)) + '</p>'
                    + '</section>';`;
const SRV_NEW4 = `                // Phase Q-A4: _qaSec4Html removed — content moved into _qaCard4Html above (H3 + 4 paragraphs).
                const _qaSec4Html = '';`;
replaceSrv('PART 1.D — Neutralize _qaSec4Html (folded into card)', SRV_OLD4, SRV_NEW4);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — css/style.css: add styles for new wrapper + grid + cards + badges.
// ═══════════════════════════════════════════════════════════════════════════
const CSS_ANCHOR = `/* Phase M6 (2026-05-03): legend explaining +/- semantics shown in calendar`;

const CSS_NEW_BLOCK = `/* ═══════════════════════════════════════════════════════════════════════════
   Phase Q-A4 (2026-05-03): Qibla SEO content visual redesign.
   Restructures the 4 SSR sections injected by Q-A/Q-A2/Q-A3 (server.js
   line ~9505) from full-width section-cards to a 2-column grid with
   header + stat badges. NO change to text content (preserves SEO).
   ═══════════════════════════════════════════════════════════════════════════ */
.qibla-seo-info-wrap {
    max-width: 1180px;
    margin: 32px auto;
    padding: 0 16px;
    box-sizing: border-box;
}
.qibla-seo-header {
    text-align: start;
    margin-bottom: 22px;
    padding: 0 4px;
}
.qibla-seo-kicker {
    display: inline-block;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--primary, #0b7a4b);
    background: rgba(11, 122, 75, 0.10);
    padding: 4px 10px;
    border-radius: 999px;
    margin-bottom: 10px;
}
.qibla-seo-header h2 {
    font-size: 1.5rem;
    line-height: 1.5;
    margin: 0 0 8px;
    color: var(--text, #222);
    font-weight: 800;
}
.qibla-seo-intro {
    margin: 0;
    color: var(--text-light, #555);
    font-size: 0.95rem;
    line-height: 1.7;
    max-width: 800px;
}
.qibla-seo-info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
}
@media (max-width: 768px) {
    .qibla-seo-info-grid {
        grid-template-columns: 1fr;
        gap: 14px;
    }
    .qibla-seo-info-wrap {
        margin: 22px auto;
        padding: 0 12px;
    }
    .qibla-seo-header h2 {
        font-size: 1.25rem;
    }
}
.qibla-seo-card {
    position: relative;
    background: linear-gradient(180deg, #ffffff 0%, #f7fbf8 100%);
    border: 1px solid rgba(11, 122, 75, 0.12);
    border-radius: 18px;
    padding: 22px 22px 20px;
    box-shadow: 0 6px 20px rgba(20, 60, 40, 0.05);
    overflow: hidden;
    transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.qibla-seo-card:hover {
    box-shadow: 0 10px 28px rgba(20, 60, 40, 0.10);
    transform: translateY(-2px);
}
.qibla-seo-card::before {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 22px;
    width: 4px;
    height: 44px;
    border-radius: 0 999px 999px 0;
    background: var(--primary, #0b7a4b);
}
html[dir="rtl"] .qibla-seo-card::before,
html[lang="ar"] .qibla-seo-card::before,
html[lang="ur"] .qibla-seo-card::before {
    border-radius: 999px 0 0 999px;
}
.qibla-seo-card h3 {
    margin: 0 0 12px;
    font-size: 1.1rem;
    line-height: 1.5;
    color: var(--primary, #075c38);
    font-weight: 700;
}
.qibla-seo-card p {
    margin: 0 0 10px;
    font-size: 0.94rem;
    line-height: 1.85;
    color: var(--text, #34443c);
}
.qibla-seo-card p:last-child {
    margin-bottom: 0;
}
.qibla-seo-stat {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(11, 122, 75, 0.10);
    color: var(--primary, #075c38);
    border: 1px solid rgba(11, 122, 75, 0.18);
}
.qibla-seo-stat span {
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.85;
}
.qibla-seo-stat strong {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.3px;
}

`;

replaceCss('PART 2 — Add CSS block for qibla-seo-info-wrap + grid + cards + badges', CSS_ANCHOR, CSS_NEW_BLOCK + CSS_ANCHOR);

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — index.html: bump style.css cache version.
// ═══════════════════════════════════════════════════════════════════════════
function replaceAllInHtml(label, oldStr, newStr, expectCount) {
    const cnt = htmlRaw.split(oldStr).length - 1;
    if (cnt !== expectCount) throw new Error(`[${label}] expected ${expectCount}, got ${cnt}`);
    htmlRaw = htmlRaw.split(oldStr).join(newStr);
    console.log(`✓ ${label} (${cnt} occurrences)`);
}
replaceAllInHtml('PART 3 — Bump style.css?v=247 → v=248', 'style.css?v=247', 'style.css?v=248', 2);

writeFileSync(SRV_PATH,  srvRaw);
writeFileSync(CSS_PATH,  cssRaw);
writeFileSync(HTML_PATH, htmlRaw);

console.log('\n✅ Phase Q-A4 — Qibla visual redesign complete.');
console.log('\nChanges applied:');
console.log('  • server.js: 4 sections → 1 wrapper + grid + 4 cards (10-lang dicts added)');
console.log('  • Card titles: H2 → H3 (single H2 wrapper above)');
console.log('  • Bearing card + Distance card: stat badges (244° / 790 km)');
console.log('  • css/style.css: ~120 lines added for wrapper + grid + cards + badges');
console.log('  • index.html: bumped style.css?v=247 → v=248');
console.log('\nText content UNCHANGED — all Q-A/Q-A2/Q-A3 SEO preserved.');
console.log('NO touch: /qibla Hub, FAQ order, Other-cities order, moon/hijri/prayer.');
