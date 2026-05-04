// Phase Q-A11 — Initial-load loading overlay for /qibla-in-{city}.
//
// User feedback: "هناك تأخير في تحميل الصفحة بالبداية، لماذا لا تطبق مثل
// ماطبقنا في حالة القمر مثل loading"
// → on initial load (not navigation), the qibla page shows blank/incomplete
// content for 1-2s while JS hydrates the compass + city data.
//
// The existing E3-a `nav-loading-overlay` is shown ONLY during navigation
// (when user clicks an internal link). On INITIAL load (URL bar / refresh /
// search engine), no overlay is shown.
//
// Q-A11 fix: show the same overlay on INITIAL load too, then auto-hide
// when ANY of these conditions met (defensive — page never stuck):
//   • window.load event fires (all resources loaded)
//   • compass element gets populated (qibla.js init signal)
//   • 1500ms timeout (safety net, even if JS never runs)
//
// Per user spec:
//   • DO NOT change Title/Meta/H1/SEO content
//   • Apply only to /qibla-in-{city} (NOT /qibla Hub or other pages)
//   • Per-lang overlay text (10 langs)
//   • Pure inline script — no need for app.js changes (tiny + bootstraps fast)

import { readFileSync, writeFileSync } from 'node:fs';

const HTML_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\index.html';
let raw = readFileSync(HTML_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);

if (/Phase Q-A11 \(2026-05-04\)/.test(raw)) {
    throw new Error('[index.html] Q-A11 already applied');
}

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
// Insert a small <script> RIGHT AFTER the nav-loading-overlay element so
// the overlay is in the DOM when our script runs. Anchor: end of overlay div.
// ═══════════════════════════════════════════════════════════════════════════
const OLD = `    <div id="nav-loading-overlay" class="nav-loading-overlay" hidden role="dialog" aria-live="polite" aria-label="Loading">
        <div class="nav-loading-content">
            <div class="nav-loading-icon" id="nav-loading-icon" aria-hidden="true">⏳</div>
            <div class="nav-loading-text" id="nav-loading-text">Loading...</div>
            <div class="nav-loading-spinner" aria-hidden="true"></div>
        </div>
    </div>`;

const NEW = `    <div id="nav-loading-overlay" class="nav-loading-overlay" hidden role="dialog" aria-live="polite" aria-label="Loading">
        <div class="nav-loading-content">
            <div class="nav-loading-icon" id="nav-loading-icon" aria-hidden="true">⏳</div>
            <div class="nav-loading-text" id="nav-loading-text">Loading...</div>
            <div class="nav-loading-spinner" aria-hidden="true"></div>
        </div>
    </div>
    <!-- ═══ Phase Q-A11 (2026-05-04): initial-load overlay for /qibla-in-{city} ═══
         User feedback: blank/incomplete content for 1-2s while JS hydrates the compass.
         Shows the existing nav-loading-overlay IMMEDIATELY on initial load, then
         auto-hides via 3 defensive triggers (window.load OR compass populated OR
         1500ms timeout). Pure inline JS — no app.js dependency. -->
    <script>
    (function(){
        if (!/\\/(?:[a-z]{2}\\/)?qibla-in-/.test(location.pathname)) return;
        var ov = document.getElementById('nav-loading-overlay');
        if (!ov) return;
        var iconEl = document.getElementById('nav-loading-icon');
        var textEl = document.getElementById('nav-loading-text');
        // Per-lang overlay text
        var lang = (location.pathname.match(/^\\/([a-z]{2})\\//) || [])[1] || 'ar';
        var TXT = {
            ar: '🧭 جارٍ تحميل اتجاه القبلة...',
            en: '🧭 Loading Qibla direction...',
            fr: '🧭 Chargement de la direction de la Qibla...',
            tr: '🧭 Kıble yönü yükleniyor...',
            ur: '🧭 سمتِ قبلہ لوڈ ہو رہی ہے...',
            de: '🧭 Qibla-Richtung wird geladen...',
            id: '🧭 Memuat arah kiblat...',
            es: '🧭 Cargando dirección de la Qibla...',
            bn: '🧭 কিবলার দিক লোড হচ্ছে...',
            ms: '🧭 Memuatkan arah kiblat...'
        };
        var msg = TXT[lang] || TXT.en;
        var iconChar = msg.charAt(0); // 🧭
        var textRest = msg.substring(2); // skip emoji + space
        if (iconEl) iconEl.textContent = iconChar;
        if (textEl) textEl.textContent = textRest;
        ov.removeAttribute('hidden');
        // Hide function
        var hidden = false;
        function hideOverlay() {
            if (hidden) return;
            hidden = true;
            ov.setAttribute('hidden', '');
        }
        // Trigger 1: window.load (all resources done)
        window.addEventListener('load', function(){ setTimeout(hideOverlay, 200); });
        // Trigger 2: compass populated (qibla.js sets aria-label or moves arrow)
        try {
            var mo = new MutationObserver(function(mutations){
                for (var i = 0; i < mutations.length; i++) {
                    var t = mutations[i].target;
                    if (t && (t.id === 'qibla-arrow' || (t.id && t.id.indexOf('qibla') === 0 && t.style && t.style.transform))) {
                        hideOverlay();
                        mo.disconnect();
                        return;
                    }
                }
            });
            // Observe the page-qibla container for any attribute/style change after init
            window.addEventListener('DOMContentLoaded', function(){
                var pq = document.getElementById('page-qibla');
                if (pq) mo.observe(pq, { attributes: true, subtree: true, attributeFilter: ['style', 'aria-label'] });
            });
        } catch(_e) {}
        // Trigger 3: hard timeout safety net (page never stuck)
        setTimeout(hideOverlay, 1500);
    })();
    </script>`;

replaceOnce('Q-A11 — Insert initial-load overlay script after nav-loading-overlay', OLD, NEW);

writeFileSync(HTML_PATH, raw);

console.log('\n✅ Phase Q-A11 — Initial-load overlay applied.');
console.log('  • Shows overlay IMMEDIATELY on initial /qibla-in-{city} load');
console.log('  • Per-lang text (10 langs)');
console.log('  • 3 hide triggers (defensive): window.load + compass change + 1500ms timeout');
console.log('  • Pure inline script — no JS file changes needed');
