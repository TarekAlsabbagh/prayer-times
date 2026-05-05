// Phase Q-Hub-H — Root LCP Fix for Qibla Hub (2026-05-05).
//
// Q-Hub-G fixed the H1 textContent, but Lighthouse still reports a 7.5s
// "Element render delay" on h1#qibla-hero-title. Reason: even though H1
// text matches SSR, the surrounding hero elements (subtitle, badges,
// geo-button label, microcopy, pick-city button, search placeholder)
// are EMPTY in SSR and get filled by app.js after hydration. Each fill
// triggers a layout reflow that delays the H1's "stable paint" timing.
//
// Q-Hub-H makes the entire hero a STATIC SSR ISLAND: every above-the-
// fold text inside #qibla-hub-hero is SSR-injected from server.js, and
// app.js skips the corresponding setters whenever they're already filled.
// JS only attaches click/input event listeners — no DOM mutation.
//
// SCOPE: /qibla ONLY. Title/Meta/H1 untouched. /qibla-in-{city},
// /moon-*, /hijri-*, /prayer-times-* untouched.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRV_PATH = path.join(ROOT, 'server.js');
const APP_PATH = path.join(ROOT, 'js', 'app.js');
const HTML_PATH = path.join(ROOT, 'index.html');

let srvRaw = readFileSync(SRV_PATH, 'utf8');
let appRaw = readFileSync(APP_PATH, 'utf8');
let htmlRaw = readFileSync(HTML_PATH, 'utf8');

const isCRLFsrv = /\r\n/.test(srvRaw);
const isCRLFapp = /\r\n/.test(appRaw);
const isCRLFhtml = /\r\n/.test(htmlRaw);

let srv = srvRaw.replace(/\r\n/g, '\n');
let app = appRaw.replace(/\r\n/g, '\n');
let html = htmlRaw.replace(/\r\n/g, '\n');

if (/Phase Q-Hub-H \(2026-05-05\)/.test(srv)) {
    throw new Error('[server.js] Q-Hub-H already applied');
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
// 1) server.js — extend Q-Hub-A SSR injection block: after replacing the
//    H1 and BEFORE the guide section block, also fill subtitle, badges,
//    button labels, microcopy, search placeholder. This creates the
//    "static SSR island" so JS hydration has nothing to update above-the-
//    fold (which would force layout reflow → LCP delay).
// ───────────────────────────────────────────────────────────────────────

const SRV_ANCHOR = `        const _qHubH1 = _qHubH1ByLang[seo.lang] || _qHubH1ByLang.en;
        html = html.replace(`;

if (srv.indexOf(SRV_ANCHOR) < 0) {
    throw new Error('[server.js] Q-Hub-A H1 anchor not found');
}

const SRV_INJECT = `        const _qHubH1 = _qHubH1ByLang[seo.lang] || _qHubH1ByLang.en;
        // Phase Q-Hub-H (2026-05-05): hero static SSR island. Fill subtitle,
        // hero-badges, geo-button label, microcopy, pick-city button, and
        // search placeholder so JS hydration finds them already populated and
        // skips the textContent/innerHTML overwrite (configured in app.js).
        // Eliminates layout reflow from JS, fixing the 7.5s LCP render delay.
        const _qHubHeroSSR = {
            ar: { sub: 'باستخدام بوصلة ذكيّة تعتمد على موقعك الجغرافيّ أو اختيار مدينتك', b1: 'يعمل في جميع الدول', b2: 'دقّة فلكيّة عالية', geo: '📍 اعرف اتجاه القبلة من موقعي', micro: 'سيتمّ تحديد موقعك تلقائيًّا خلال ثوانٍ', pick: '🌍 اختر مدينتك يدويّاً', srch: 'ابحث عن مدينتك (مثال: الرياض، القاهرة، Istanbul)' },
            en: { sub: 'Use a smart compass powered by your geolocation — or pick your city manually', b1: 'Works in every country', b2: 'High astronomical precision', geo: '📍 Show Qibla from my location', micro: 'Your location will be detected automatically in seconds', pick: '🌍 Pick your city manually', srch: 'Search for your city (e.g. Riyadh, Cairo, Istanbul)' },
            fr: { sub: 'Utilisez une boussole intelligente basée sur votre position — ou choisissez votre ville manuellement', b1: 'Fonctionne dans tous les pays', b2: 'Haute précision astronomique', geo: '📍 Trouver la Qibla depuis ma position', micro: 'Votre position sera détectée automatiquement en quelques secondes', pick: '🌍 Choisir votre ville manuellement', srch: 'Recherchez votre ville (ex. Riyad, Le Caire, Istanbul)' },
            tr: { sub: 'Konumunuza dayalı akıllı bir pusula kullanın veya şehrinizi manuel seçin', b1: 'Her ülkede çalışır', b2: 'Yüksek astronomik hassasiyet', geo: '📍 Konumumdan kıbleyi bul', micro: 'Konumunuz birkaç saniye içinde otomatik tespit edilecek', pick: '🌍 Şehrinizi manuel seçin', srch: 'Şehrinizi arayın (ör. Riyad, Kahire, İstanbul)' },
            ur: { sub: 'اپنے مقام پر مبنی ذہین قطب نما استعمال کریں یا اپنا شہر دستی منتخب کریں', b1: 'ہر ملک میں کام کرتا ہے', b2: 'اعلیٰ فلکی درستگی', geo: '📍 میرے مقام سے قبلہ دکھائیں', micro: 'آپ کا مقام چند سیکنڈ میں خود بخود معلوم ہو جائے گا', pick: '🌍 اپنا شہر دستی منتخب کریں', srch: 'اپنے شہر کا نام تلاش کریں (مثال: ریاض، قاہرہ، استنبول)' },
            de: { sub: 'Nutzen Sie einen intelligenten Kompass basierend auf Ihrem Standort oder wählen Sie Ihre Stadt manuell', b1: 'Funktioniert in jedem Land', b2: 'Hohe astronomische Genauigkeit', geo: '📍 Qibla von meinem Standort anzeigen', micro: 'Ihr Standort wird in Sekunden automatisch erkannt', pick: '🌍 Stadt manuell wählen', srch: 'Suchen Sie Ihre Stadt (z. B. Riad, Kairo, Istanbul)' },
            id: { sub: 'Gunakan kompas pintar berdasarkan lokasi Anda atau pilih kota Anda secara manual', b1: 'Bekerja di setiap negara', b2: 'Akurasi astronomi tinggi', geo: '📍 Tampilkan kiblat dari lokasi saya', micro: 'Lokasi Anda akan terdeteksi otomatis dalam hitungan detik', pick: '🌍 Pilih kota Anda secara manual', srch: 'Cari kota Anda (mis. Riyadh, Kairo, Istanbul)' },
            es: { sub: 'Use una brújula inteligente basada en su ubicación o elija su ciudad manualmente', b1: 'Funciona en todos los países', b2: 'Alta precisión astronómica', geo: '📍 Mostrar la Qibla desde mi ubicación', micro: 'Su ubicación se detectará automáticamente en segundos', pick: '🌍 Elegir su ciudad manualmente', srch: 'Busque su ciudad (p. ej. Riad, El Cairo, Estambul)' },
            bn: { sub: 'আপনার অবস্থান ভিত্তিক স্মার্ট কম্পাস ব্যবহার করুন বা আপনার শহর ম্যানুয়ালি বেছে নিন', b1: 'প্রতিটি দেশে কাজ করে', b2: 'উচ্চ জ্যোতির্বৈজ্ঞানিক নির্ভুলতা', geo: '📍 আমার অবস্থান থেকে কিবলা দেখান', micro: 'আপনার অবস্থান সেকেন্ডের মধ্যে স্বয়ংক্রিয়ভাবে শনাক্ত হবে', pick: '🌍 ম্যানুয়ালি আপনার শহর বেছে নিন', srch: 'আপনার শহর অনুসন্ধান করুন (যেমন রিয়াদ, কায়রো, ইস্তাম্বুল)' },
            ms: { sub: 'Gunakan kompas pintar berdasarkan lokasi anda atau pilih bandar anda secara manual', b1: 'Berfungsi di setiap negara', b2: 'Ketepatan astronomi tinggi', geo: '📍 Tunjukkan kiblat dari lokasi saya', micro: 'Lokasi anda akan dikesan secara automatik dalam beberapa saat', pick: '🌍 Pilih bandar anda secara manual', srch: 'Cari bandar anda (mis. Riyadh, Kaherah, Istanbul)' },
        };
        const _qhh = _qHubHeroSSR[seo.lang] || _qHubHeroSSR.en;
        // Subtitle
        html = html.replace(
            /<p id="qibla-hub-subtitle"[^>]*><\\/p>/,
            \`<p id="qibla-hub-subtitle" class="qibla-hub-subtitle qibla-hub-only" data-qhh-ssr="1">\${_escHtml(_qhh.sub)}</p>\`
        );
        // Badges (ul filled with 2 li chips)
        html = html.replace(
            /<ul id="qibla-hub-hero-badges"[^>]*><\\/ul>/,
            \`<ul id="qibla-hub-hero-badges" class="qibla-hub-hero-badges" data-qhh-ssr="1"><li class="qhhb-chip"><span class="qhhb-tick" aria-hidden="true">\\u2714</span>\${_escHtml(_qhh.b1)}</li><li class="qhhb-chip"><span class="qhhb-tick" aria-hidden="true">\\u2714</span>\${_escHtml(_qhh.b2)}</li></ul>\`
        );
        // Geo-button label
        html = html.replace(
            /(<button type="button" id="qibla-hub-geo-btn"[^>]*>\\s*<span class="qhb-spinner"[^>]*><\\/span>\\s*)<span class="qhb-label"><\\/span>/,
            \`$1<span class="qhb-label" data-qhh-ssr="1">\${_escHtml(_qhh.geo)}</span>\`
        );
        // Microcopy
        html = html.replace(
            /<p id="qibla-hub-geo-microcopy"[^>]*><\\/p>/,
            \`<p id="qibla-hub-geo-microcopy" class="qibla-hub-geo-microcopy" data-qhh-ssr="1">\${_escHtml(_qhh.micro)}</p>\`
        );
        // Pick-city button
        html = html.replace(
            /<button type="button" id="qibla-hub-pick-btn"[^>]*><\\/button>/,
            \`<button type="button" id="qibla-hub-pick-btn" class="qibla-hub-pick-btn" data-qhh-ssr="1">\${_escHtml(_qhh.pick)}</button>\`
        );
        // Search placeholder
        html = html.replace(
            /<input type="search" id="qibla-hub-search"([^>]*?)\\/?>/,
            \`<input type="search" id="qibla-hub-search"$1 placeholder="\${_escHtml(_qhh.srch)}" data-qhh-ssr="1" />\`
        );
        html = html.replace(`;

srv = replaceOnce(srv, SRV_ANCHOR, SRV_INJECT, 'q-hub-h hero ssr');

// ───────────────────────────────────────────────────────────────────────
// 2) app.js — gate hero setters. If element has data-qhh-ssr="1", skip
//    the JS overwrite. Only attach event listeners.
// ───────────────────────────────────────────────────────────────────────

const APP_OLD = `    if (h1El) {
        // Phase Q-Hub-G (2026-05-05): if SSR text matches JS title, skip the
        // textContent assignment entirely so the H1 paints once at SSR time.
        // This eliminates the post-hydration re-paint that Lighthouse was
        // recording as 13s "Element render delay" on the LCP H1.
        const _curText = (h1El.textContent || '').trim();
        const _newText = String(ui.title || '').trim();
        if (_curText !== _newText) {
            h1El.textContent = ui.title;
        }
    }
    if (subEl) subEl.textContent = ui.subtitle;
    if (badgesEl) {
        const chips = Array.isArray(ui.hero_badges) ? ui.hero_badges : [];
        badgesEl.innerHTML = chips.map(c =>
            \`<li class="qhhb-chip"><span class="qhhb-tick" aria-hidden="true">✔</span>\${c}</li>\`
        ).join('');
    }`;

const APP_NEW = `    // Phase Q-Hub-H (2026-05-05): hero static SSR island. Each above-the-
    // fold element pre-filled by server.js carries data-qhh-ssr="1". When
    // present, skip the JS overwrite entirely so the hero paints once at
    // SSR time and never re-flows post-hydration. This was the root cause
    // of the 7.5s LCP "Element render delay" on /qibla.
    const _qhhSkip = (el) => el && el.getAttribute('data-qhh-ssr') === '1';
    if (h1El && !_qhhSkip(h1El)) {
        const _curText = (h1El.textContent || '').trim();
        const _newText = String(ui.title || '').trim();
        if (_curText !== _newText) {
            h1El.textContent = ui.title;
        }
    }
    if (subEl && !_qhhSkip(subEl)) subEl.textContent = ui.subtitle;
    if (badgesEl && !_qhhSkip(badgesEl)) {
        const chips = Array.isArray(ui.hero_badges) ? ui.hero_badges : [];
        badgesEl.innerHTML = chips.map(c =>
            \`<li class="qhhb-chip"><span class="qhhb-tick" aria-hidden="true">✔</span>\${c}</li>\`
        ).join('');
    }`;

app = replaceOnce(app, APP_OLD, APP_NEW, 'app.js hero gate');

// Also gate the geoLabel, geoMicro, pickBtn, search placeholder setters
const APP_OLD2 = `    if (geoLabel)  geoLabel.textContent  = ui.geo_btn;
    if (geoMicro)  geoMicro.textContent  = ui.cta_microcopy || '';
    if (geoStatus) { geoStatus.textContent = ''; geoStatus.classList.remove('is-error'); }
    if (geoBtn)    { geoBtn.classList.remove('is-loading'); geoBtn.disabled = false; }
    if (pickBtn)   pickBtn.textContent = ui.cta_pick_city;`;

const APP_NEW2 = `    // Phase Q-Hub-H — same SSR-skip guard for hero buttons & microcopy.
    if (geoLabel && !_qhhSkip(geoLabel))  geoLabel.textContent  = ui.geo_btn;
    if (geoMicro && !_qhhSkip(geoMicro))  geoMicro.textContent  = ui.cta_microcopy || '';
    if (geoStatus) { geoStatus.textContent = ''; geoStatus.classList.remove('is-error'); }
    if (geoBtn)    { geoBtn.classList.remove('is-loading'); geoBtn.disabled = false; }
    if (pickBtn && !_qhhSkip(pickBtn))   pickBtn.textContent = ui.cta_pick_city;`;

app = replaceOnce(app, APP_OLD2, APP_NEW2, 'app.js buttons gate');

// Also gate the search input placeholder
const APP_OLD3 = `    if (searchInput) searchInput.placeholder = ui.search_placeholder || '';`;
if (app.indexOf(APP_OLD3) >= 0) {
    const APP_NEW3 = `    if (searchInput && !_qhhSkip(searchInput)) searchInput.placeholder = ui.search_placeholder || '';`;
    app = app.replace(APP_OLD3, APP_NEW3);
}

// ───────────────────────────────────────────────────────────────────────
// 3) Bump CSS version
// ───────────────────────────────────────────────────────────────────────

html = html.replace(/css\/style\.css\?v=\d+/g, 'css/style.css?v=261');

writeFileSync(SRV_PATH, toEol(srv, isCRLFsrv), 'utf8');
writeFileSync(APP_PATH, toEol(app, isCRLFapp), 'utf8');
writeFileSync(HTML_PATH, toEol(html, isCRLFhtml), 'utf8');

console.log('\n✅ Phase Q-Hub-H — Hero static SSR island applied.');
console.log('  • server.js: 6 new SSR hero fills (subtitle, 2 badges, geo-btn, microcopy, pick-btn, search placeholder)');
console.log('  • app.js: SSR-skip guards on h1/sub/badges/geoLabel/geoMicro/pickBtn/searchInput');
console.log('  • CSS bumped to v=261');
