// Phase Q-A — qibla-in-{city} SEO cleanup (H1 + Title/Meta + SSR content).
//
// SEOptimer audit on /qibla-in-riyadh:
//   • Title Tag ❌  short (~52 chars)
//   • Meta Description ❌  short (~95 chars)
//   • H1 ❌  generic ("اتجاه القبلة" — no city; SEOptimer reported "more than one H1"
//                  but SSR audit found exactly 1 — verify post-JS)
//   • Amount of Content ❌  271 words (need 650-900)
//
// Per user's Phase Q-A brief:
//   1. Q1: H1 city-specific + verify post-JS DOM count
//   2. Q2: Title + Meta extension (10 langs)
//   3. Q3: SSR-visible content sections (~540 new AR words → ~811 total)
//   Defer Q-B (H2 reduction) and Q-C (CLS/perf) to later phases.
//
// Scope:
//   • /qibla-in-{city} ONLY
//   • NOT /qibla Hub
//   • NOT /moon-*, /hijri-*, /prayer-times-*
//
// Same code-cleanliness pattern as M1/MM1/MD1:
//   • CRLF-safe replaceOnce
//   • Phase marker comment
//   • Header marker check
//   • Idempotent

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(SRV_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/Phase Q-A \(2026-05-03\)/.test(raw)) {
    throw new Error('[server.js] Q-A already applied (header marker present)');
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
// PART 1 — Title 10-lang extension (server.js:4571-4582).
// ═══════════════════════════════════════════════════════════════════════════
const PART1_OLD = `        // Phase D2: extend short titles per language with separator + descriptor
        const _qTitles = {
            ar: \`اتجاه القبلة في \${cityDisplay} | البوصلة والمسافة إلى الكعبة\`,
            en: \`Qibla Direction in \${cityDisplay} | Compass and Distance\`,
            fr: \`Direction de la Qibla à \${cityDisplay} | Boussole et distance\`,
            tr: \`\${cityDisplay} Kıble Yönü | Kâbe Pusulası ve Uzaklık\`,
            ur: \`\${cityDisplay} سے سمتِ قبلہ | قطب نما اور فاصلہ\`,
            de: \`Qibla-Richtung in \${cityDisplay} | Kompass und Entfernung\`,
            id: \`Arah Kiblat di \${cityDisplay} | Kompas dan Jarak ke Kakbah\`,
            es: \`Dirección de la Qibla en \${cityDisplay} | Brújula y distancia\`,
            bn: \`\${cityDisplay} থেকে কিবলার দিক | কম্পাস ও দূরত্ব\`,
            ms: \`Arah Kiblat di \${cityDisplay} | Kompas dan Jarak ke Kaabah\`,
        };`;

const PART1_NEW = `        // Phase Q-A (2026-05-03): extended Title per language to ~58 chars sweet spot.
        // Was Phase D2 ~52 chars (borderline). Now mentions "بوصلة الكعبة" / "Kaaba
        // Compass" + "بدقة" / "Accurate" — natural keywords for the city qibla page.
        const _qTitles = {
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
        };`;

replaceOnce('PART 1 — Title 10-lang extension', PART1_OLD, PART1_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — Meta 10-lang extension (server.js:4583-4594).
// ═══════════════════════════════════════════════════════════════════════════
const PART2_OLD = `        const _qDescs = {
            ar: \`اتجاه القبلة الدقيق من \${cityDisplay} إلى الكعبة المشرفة، مع الزاوية والمسافة وبوصلة تفاعلية.\`,
            en: \`Accurate Qibla direction from \${cityDisplay} with bearing, distance to the Kaaba and an interactive compass.\`,
            fr: \`Direction précise de la Qibla depuis \${cityDisplay} avec azimut, distance à la Kaaba et boussole interactive.\`,
            tr: \`\${cityDisplay} şehrinden doğru kıble yönü: açı, Kâbe\\u2019ye uzaklık ve etkileşimli pusula.\`,
            ur: \`\${cityDisplay} سے قبلہ کی درست سمت، زاویہ، کعبہ تک فاصلہ اور انٹرایکٹو قطب نما کے ساتھ۔\`,
            de: \`Präzise Qibla-Richtung von \${cityDisplay} mit Peilung, Entfernung zur Kaaba und interaktivem Kompass.\`,
            id: \`Arah kiblat akurat dari \${cityDisplay} dengan sudut, jarak ke Kakbah, dan kompas interaktif.\`,
            es: \`Dirección precisa de la Qibla desde \${cityDisplay} con rumbo, distancia a la Kaaba y brújula interactiva.\`,
            bn: \`\${cityDisplay} থেকে কিবলার সঠিক দিক—কোণ, কাবা পর্যন্ত দূরত্ব এবং ইন্টারঅ্যাকটিভ কম্পাস।\`,
            ms: \`Arah kiblat tepat dari \${cityDisplay} dengan sudut, jarak ke Kaabah dan kompas interaktif.\`,
        };`;

const PART2_NEW = `        // Phase Q-A (2026-05-03): extended Meta from ~95 chars (failing SEOptimer's
        // 120-160 range) to ~140 chars. Added "خريطة تفاعلية تعتمد على موقعك" /
        // "interactive map based on your location" — emphasizes per-user intent.
        const _qDescs = {
            ar: \`اعرف اتجاه القبلة في \${cityDisplay} بدقة باستخدام بوصلة الكعبة وخريطة تفاعلية تعتمد على موقعك، مع زاوية القبلة والمسافة إلى مكة المكرمة.\`,
            en: \`Find the Qibla direction in \${cityDisplay} accurately using a Kaaba compass and interactive map based on your location, with the Qibla bearing and distance to Mecca.\`,
            fr: \`Trouvez la direction de la Qibla à \${cityDisplay} avec précision grâce à une boussole de la Kaaba et une carte interactive basée sur votre position, avec l'azimut et la distance à La Mecque.\`,
            tr: \`\${cityDisplay} için kıble yönünü Kâbe pusulası ve konumunuza dayalı etkileşimli harita ile hassas şekilde bulun; kıble açısı ve Mekke'ye uzaklık dahildir.\`,
            ur: \`\${cityDisplay} میں قبلہ کی درست سمت معلوم کریں، کعبہ کے قطب نما اور آپ کے مقام پر مبنی انٹرایکٹو نقشے کے ساتھ، قبلہ زاویہ اور مکہ تک فاصلے سمیت۔\`,
            de: \`Finden Sie die Qibla-Richtung in \${cityDisplay} präzise mit einem Kaaba-Kompass und einer interaktiven Karte basierend auf Ihrem Standort, mit Qibla-Peilung und Entfernung nach Mekka.\`,
            id: \`Temukan arah kiblat di \${cityDisplay} dengan akurat menggunakan kompas Kakbah dan peta interaktif berdasarkan lokasi Anda, lengkap dengan sudut kiblat dan jarak ke Mekkah.\`,
            es: \`Encuentre la dirección de la Qibla en \${cityDisplay} con precisión usando una brújula de la Kaaba y un mapa interactivo basado en su ubicación, con el rumbo y la distancia a La Meca.\`,
            bn: \`\${cityDisplay}-এ কিবলার দিক সঠিকভাবে জানুন কাবা কম্পাস ও আপনার অবস্থান অনুযায়ী ইন্টারঅ্যাকটিভ মানচিত্রের সাহায্যে, কিবলার কোণ ও মক্কার দূরত্বসহ।\`,
            ms: \`Cari arah kiblat di \${cityDisplay} dengan tepat menggunakan kompas Kaabah dan peta interaktif berdasarkan lokasi anda, lengkap dengan sudut kiblat dan jarak ke Makkah.\`,
        };`;

replaceOnce('PART 2 — Meta 10-lang extension', PART2_OLD, PART2_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — Add SSR injection block AFTER M1's block (line 9414 area).
// Includes:
//   • H1 city-specific text-replace (Q1)
//   • _qiblaCalcSsr helper (inline, scoped to this block)
//   • 4 SSR sections × 10 langs (Q3)
// Anchor: end of M1's catch block at line 9413-9414 — insert NEW Q-A block right after.
// ═══════════════════════════════════════════════════════════════════════════
const PART3_OLD = `            } catch (_e) { /* silent — M1 SSR injection optional, page still serves */ }
        }


        // ── (18-A) Today page: CTA بارز يقود إلى الـ hub (/moon-in-{slug}) ──`;

const PART3_NEW = `            } catch (_e) { /* silent — M1 SSR injection optional, page still serves */ }
        }


        // ── Phase Q-A (2026-05-03): qibla-in-{city} SEO cleanup ──
        //   Q1: H1 city-specific (was generic "اتجاه القبلة" → now "اتجاه القبلة في {city}")
        //   Q3: 4 SSR-visible content sections (overview + bearing + distance + how-to)
        //        Each section per-lang (10 langs). Adds ~540 AR words → total ~811 in
        //        sweet spot for SEOptimer's "Amount of Content" check (650-900).
        //   Gated by seo.qiblaRef.slug (only city pages, never /qibla Hub).
        if (seo.qiblaRef && seo.qiblaRef.slug && typeof seo.qiblaRef.lat === 'number') {
            try {
                const _qaLang = seo.lang || 'ar';
                const _qaPick = (m) => m[_qaLang] || m.en;
                const _qaCity = _escHtml(seo.qiblaRef.cityName || '');

                // ── Q1: city-specific H1 text-replace ──
                // Drop data-i18n attr to prevent _translateI18nAttrs from overwriting.
                const _qaH1 = {
                    ar: \`اتجاه القبلة في \${seo.qiblaRef.cityName}\`,
                    en: \`Qibla Direction in \${seo.qiblaRef.cityName}\`,
                    fr: \`Direction de la Qibla à \${seo.qiblaRef.cityName}\`,
                    tr: \`\${seo.qiblaRef.cityName} Kıble Yönü\`,
                    ur: \`\${seo.qiblaRef.cityName} میں سمتِ قبلہ\`,
                    de: \`Qibla-Richtung in \${seo.qiblaRef.cityName}\`,
                    id: \`Arah Kiblat di \${seo.qiblaRef.cityName}\`,
                    es: \`Dirección de la Qibla en \${seo.qiblaRef.cityName}\`,
                    bn: \`\${seo.qiblaRef.cityName}-এ কিবলার দিক\`,
                    ms: \`Arah Kiblat di \${seo.qiblaRef.cityName}\`
                };
                html = html.replace(
                    /<span data-i18n="qibla\\.title">[^<]*<\\/span>/,
                    \`<span>\${_escHtml(_qaPick(_qaH1))}</span>\`
                );

                // ── Q3 helper: server-side qibla bearing + distance ──
                // Great Circle bearing + Haversine distance to Kaaba (21.4225°N, 39.8262°E).
                const _KAABA_LAT = 21.4225, _KAABA_LNG = 39.8262;
                const _toRad = d => d * Math.PI / 180;
                const _phi1 = _toRad(seo.qiblaRef.lat);
                const _phi2 = _toRad(_KAABA_LAT);
                const _dLambda = _toRad(_KAABA_LNG - seo.qiblaRef.lng);
                const _dPhi = _toRad(_KAABA_LAT - seo.qiblaRef.lat);
                const _y = Math.sin(_dLambda) * Math.cos(_phi2);
                const _x = Math.cos(_phi1) * Math.sin(_phi2) - Math.sin(_phi1) * Math.cos(_phi2) * Math.cos(_dLambda);
                let _bearing = Math.atan2(_y, _x) * 180 / Math.PI;
                if (_bearing < 0) _bearing += 360;
                _bearing = Math.round(_bearing);
                const _hav = Math.sin(_dPhi/2)**2 + Math.cos(_phi1) * Math.cos(_phi2) * Math.sin(_dLambda/2)**2;
                const _distance = Math.round(6371 * 2 * Math.atan2(Math.sqrt(_hav), Math.sqrt(1 - _hav)));
                const _bearingStr = _escHtml(String(_bearing));
                const _distanceStr = _escHtml(_distance.toLocaleString(_qaLang === 'ar' ? 'ar-EG' : 'en-US'));

                // ── Section 1: overview ──
                const _qaSec1H2 = {
                    ar: \`اتجاه القبلة في \${seo.qiblaRef.cityName}\`,
                    en: \`Qibla Direction in \${seo.qiblaRef.cityName}\`,
                    fr: \`Direction de la Qibla à \${seo.qiblaRef.cityName}\`,
                    tr: \`\${seo.qiblaRef.cityName} Kıble Yönü\`,
                    ur: \`\${seo.qiblaRef.cityName} میں قبلہ کی سمت\`,
                    de: \`Qibla-Richtung in \${seo.qiblaRef.cityName}\`,
                    id: \`Arah Kiblat di \${seo.qiblaRef.cityName}\`,
                    es: \`Dirección de la Qibla en \${seo.qiblaRef.cityName}\`,
                    bn: \`\${seo.qiblaRef.cityName}-এ কিবলার দিক\`,
                    ms: \`Arah Kiblat di \${seo.qiblaRef.cityName}\`
                };
                const _qaSec1P = {
                    ar: \`يساعدك هذا الدليل على معرفة اتجاه القبلة في \${seo.qiblaRef.cityName} بدقة، عبر حساب الزاوية بين موقعك والكعبة المشرفة في مكة المكرمة. تعتمد النتيجة على إحداثيات المدينة الجغرافية أو على موقعك الفعلي عند السماح للمتصفح بتحديد الموقع. تُستخدم خريطة تفاعلية وبوصلة رقمية تعمل على معظم الأجهزة الحديثة، مما يجعل تحديد القبلة أمراً سريعاً وسهلاً سواء كنت في المنزل أو المكتب أو أثناء السفر.\`,
                    en: \`This guide helps you find the Qibla direction in \${seo.qiblaRef.cityName} accurately by calculating the bearing between your location and the Kaaba in Mecca. The result depends on the city's geographic coordinates or your actual location when you allow the browser to detect it. An interactive map and digital compass work on most modern devices, making Qibla finding fast and easy whether you are at home, office, or traveling.\`,
                    fr: \`Ce guide vous aide à trouver la direction de la Qibla à \${seo.qiblaRef.cityName} avec précision en calculant l'azimut entre votre position et la Kaaba à La Mecque. Le résultat dépend des coordonnées géographiques de la ville ou de votre position réelle lorsque vous autorisez le navigateur à la détecter. Une carte interactive et une boussole numérique fonctionnent sur la plupart des appareils modernes, rendant la recherche de la Qibla rapide et facile que vous soyez à la maison, au bureau ou en voyage.\`,
                    tr: \`Bu kılavuz, \${seo.qiblaRef.cityName} şehrinde kıble yönünü konumunuz ile Mekke'deki Kâbe arasındaki açıyı hesaplayarak hassas şekilde bulmanıza yardımcı olur. Sonuç, şehrin coğrafi koordinatlarına veya tarayıcının konumunuzu algılamasına izin verdiğinizde gerçek konumunuza bağlıdır. Etkileşimli harita ve dijital pusula çoğu modern cihazda çalışır; evde, ofiste veya seyahatte kıbleyi bulmayı hızlı ve kolay hale getirir.\`,
                    ur: \`یہ گائیڈ آپ کو \${seo.qiblaRef.cityName} میں قبلہ کی سمت درست طور پر معلوم کرنے میں مدد کرتا ہے، آپ کے مقام اور مکہ میں کعبہ کے درمیان زاویہ کا حساب لگا کر۔ نتیجہ شہر کے جغرافیائی نقاط یا براؤزر کو مقام کا پتہ لگانے کی اجازت دینے پر آپ کے حقیقی مقام پر منحصر ہے۔ ایک انٹرایکٹو نقشہ اور ڈیجیٹل قطب نما زیادہ تر جدید آلات پر کام کرتا ہے، جو گھر، دفتر یا سفر کے دوران قبلہ تلاش کرنا تیز اور آسان بناتا ہے۔\`,
                    de: \`Diese Anleitung hilft Ihnen, die Qibla-Richtung in \${seo.qiblaRef.cityName} präzise zu finden, indem die Peilung zwischen Ihrem Standort und der Kaaba in Mekka berechnet wird. Das Ergebnis hängt von den geografischen Koordinaten der Stadt oder Ihrem tatsächlichen Standort ab, wenn Sie dem Browser die Standorterkennung erlauben. Eine interaktive Karte und ein digitaler Kompass funktionieren auf den meisten modernen Geräten und machen die Qibla-Suche schnell und einfach, ob zu Hause, im Büro oder unterwegs.\`,
                    id: \`Panduan ini membantu Anda menemukan arah kiblat di \${seo.qiblaRef.cityName} dengan akurat dengan menghitung sudut antara lokasi Anda dan Kakbah di Mekkah. Hasilnya bergantung pada koordinat geografis kota atau lokasi aktual Anda ketika Anda mengizinkan browser mendeteksinya. Peta interaktif dan kompas digital bekerja pada sebagian besar perangkat modern, membuat pencarian kiblat cepat dan mudah baik di rumah, kantor, maupun saat bepergian.\`,
                    es: \`Esta guía le ayuda a encontrar la dirección de la Qibla en \${seo.qiblaRef.cityName} con precisión calculando el rumbo entre su ubicación y la Kaaba en La Meca. El resultado depende de las coordenadas geográficas de la ciudad o de su ubicación real cuando permite al navegador detectarla. Un mapa interactivo y una brújula digital funcionan en la mayoría de los dispositivos modernos, haciendo que encontrar la Qibla sea rápido y fácil ya sea en casa, oficina o viajando.\`,
                    bn: \`এই গাইড আপনাকে \${seo.qiblaRef.cityName}-এ কিবলার দিক সঠিকভাবে খুঁজে পেতে সাহায্য করে, আপনার অবস্থান এবং মক্কায় কাবার মধ্যে কোণ গণনা করে। ফলাফল শহরের ভৌগোলিক স্থানাঙ্ক বা ব্রাউজারকে অবস্থান সনাক্ত করতে অনুমতি দিলে আপনার প্রকৃত অবস্থানের উপর নির্ভর করে। একটি ইন্টারঅ্যাকটিভ মানচিত্র এবং ডিজিটাল কম্পাস বেশিরভাগ আধুনিক ডিভাইসে কাজ করে, যা ঘরে, অফিসে বা ভ্রমণের সময় কিবলা খুঁজে পাওয়া দ্রুত এবং সহজ করে তোলে।\`,
                    ms: \`Panduan ini membantu anda mencari arah kiblat di \${seo.qiblaRef.cityName} dengan tepat dengan mengira sudut antara lokasi anda dan Kaabah di Makkah. Hasilnya bergantung pada koordinat geografi bandar atau lokasi sebenar anda apabila anda membenarkan pelayar mengesannya. Peta interaktif dan kompas digital berfungsi pada kebanyakan peranti moden, menjadikan pencarian kiblat cepat dan mudah sama ada di rumah, pejabat, atau ketika dalam perjalanan.\`
                };
                const _qaSec1Html = '<section class="section-card qibla-seo-info qibla-seo-overview">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec1H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec1P)) + '</p>'
                    + '</section>';

                // ── Section 2: bearing ──
                const _qaSec2H2 = {
                    ar: \`زاوية القبلة من \${seo.qiblaRef.cityName}\`,
                    en: \`Qibla Bearing from \${seo.qiblaRef.cityName}\`,
                    fr: \`Azimut de la Qibla depuis \${seo.qiblaRef.cityName}\`,
                    tr: \`\${seo.qiblaRef.cityName}'den Kıble Açısı\`,
                    ur: \`\${seo.qiblaRef.cityName} سے قبلہ کا زاویہ\`,
                    de: \`Qibla-Peilung von \${seo.qiblaRef.cityName}\`,
                    id: \`Sudut Kiblat dari \${seo.qiblaRef.cityName}\`,
                    es: \`Rumbo de la Qibla desde \${seo.qiblaRef.cityName}\`,
                    bn: \`\${seo.qiblaRef.cityName} থেকে কিবলার কোণ\`,
                    ms: \`Sudut Kiblat dari \${seo.qiblaRef.cityName}\`
                };
                const _qaSec2P = {
                    ar: \`زاوية القبلة من \${seo.qiblaRef.cityName} هي تقريباً \${_bearing}° من الشمال الجغرافي. تُحسب هذه الزاوية باستخدام صيغة الدائرة العظمى التي تعطي أقصر مسار على سطح الأرض الكروية بين موقعك والكعبة المشرفة. قد تختلف الدرجة الظاهرة على بوصلة الهاتف بسبب فرق الانحراف المغناطيسي عن الشمال الجغرافي، لذا يُنصح بمقارنة قراءة البوصلة مع اتجاه الخريطة للحصول على نتيجة أدق. يستخدم النظام إحداثيات الكعبة الرسمية (21.4225° شمالاً، 39.8262° شرقاً) كنقطة هدف ثابتة لجميع الحسابات.\`,
                    en: \`The Qibla bearing from \${seo.qiblaRef.cityName} is approximately \${_bearing}° from true north. This bearing is calculated using the Great Circle formula, which gives the shortest path on the Earth's spherical surface between your location and the Kaaba. The reading shown on a phone compass may differ slightly due to magnetic declination versus true north, so it is recommended to cross-check the compass with the map heading for the most accurate result. The system uses the Kaaba's official coordinates (21.4225°N, 39.8262°E) as a fixed target for all calculations.\`,
                    fr: \`L'azimut de la Qibla depuis \${seo.qiblaRef.cityName} est d'environ \${_bearing}° par rapport au nord géographique. Cet azimut est calculé à l'aide de la formule du grand cercle, qui donne le chemin le plus court sur la surface sphérique de la Terre entre votre position et la Kaaba. La lecture affichée sur une boussole de téléphone peut différer légèrement en raison de la déclinaison magnétique par rapport au nord géographique, il est donc recommandé de comparer avec l'orientation de la carte pour le résultat le plus précis. Le système utilise les coordonnées officielles de la Kaaba (21,4225°N, 39,8262°E) comme cible fixe.\`,
                    tr: \`\${seo.qiblaRef.cityName} şehrinden kıble açısı yaklaşık \${_bearing}° gerçek kuzeyden ölçülür. Bu açı, konumunuz ile Kâbe arasındaki Dünya'nın küresel yüzeyindeki en kısa yolu veren Büyük Daire formülü kullanılarak hesaplanır. Telefon pusulasında gösterilen okuma, manyetik sapma nedeniyle gerçek kuzeyden biraz farklı olabilir; en doğru sonuç için pusula okuması ile harita yönünü karşılaştırmanız önerilir. Sistem, tüm hesaplamalar için Kâbe'nin resmi koordinatlarını (21.4225°K, 39.8262°D) sabit hedef olarak kullanır.\`,
                    ur: \`\${seo.qiblaRef.cityName} سے قبلہ کا زاویہ تقریباً \${_bearing}° شمال جغرافیائی سے ہے۔ یہ زاویہ گریٹ سرکل فارمولا سے حساب کیا جاتا ہے جو آپ کے مقام اور کعبہ کے درمیان زمین کی کروی سطح پر سب سے چھوٹا راستہ دیتا ہے۔ موبائل کے قطب نما پر دکھائی گئی ریڈنگ مقناطیسی انحراف کی وجہ سے قدرے مختلف ہو سکتی ہے، لہذا قطب نما کی ریڈنگ کا نقشے کی سمت سے موازنہ کرنا تجویز کیا جاتا ہے۔ نظام تمام حسابات کے لیے کعبہ کے سرکاری نقاط (21.4225° شمال، 39.8262° مشرق) کو مقررہ ہدف کے طور پر استعمال کرتا ہے۔\`,
                    de: \`Die Qibla-Peilung von \${seo.qiblaRef.cityName} beträgt etwa \${_bearing}° vom geografischen Norden. Diese Peilung wird mit der Großkreisformel berechnet, die den kürzesten Weg auf der kugelförmigen Erdoberfläche zwischen Ihrem Standort und der Kaaba ergibt. Die auf einem Telefonkompass angezeigte Anzeige kann aufgrund der magnetischen Deklination gegenüber dem geografischen Norden geringfügig abweichen, daher wird empfohlen, die Kompassanzeige mit der Kartenausrichtung zu vergleichen, um das genaueste Ergebnis zu erhalten. Das System verwendet die offiziellen Koordinaten der Kaaba (21,4225° N, 39,8262° O) als festes Ziel.\`,
                    id: \`Sudut kiblat dari \${seo.qiblaRef.cityName} adalah sekitar \${_bearing}° dari utara sejati. Sudut ini dihitung menggunakan rumus Lingkaran Besar yang memberikan jalur terpendek pada permukaan bola bumi antara lokasi Anda dan Kakbah. Pembacaan pada kompas ponsel mungkin sedikit berbeda karena deklinasi magnetis terhadap utara sejati, sehingga disarankan untuk membandingkan pembacaan kompas dengan arah peta untuk hasil paling akurat. Sistem menggunakan koordinat resmi Kakbah (21,4225°LU, 39,8262°BT) sebagai target tetap untuk semua perhitungan.\`,
                    es: \`El rumbo de la Qibla desde \${seo.qiblaRef.cityName} es aproximadamente \${_bearing}° desde el norte verdadero. Este rumbo se calcula usando la fórmula del Círculo Máximo, que da el camino más corto en la superficie esférica de la Tierra entre su ubicación y la Kaaba. La lectura en una brújula de teléfono puede diferir ligeramente debido a la declinación magnética respecto al norte verdadero, por lo que se recomienda comparar la lectura de la brújula con la orientación del mapa para el resultado más preciso. El sistema usa las coordenadas oficiales de la Kaaba (21.4225°N, 39.8262°E) como objetivo fijo para todos los cálculos.\`,
                    bn: \`\${seo.qiblaRef.cityName} থেকে কিবলার কোণ আনুমানিক \${_bearing}° সত্য উত্তর থেকে। এই কোণটি গ্রেট সার্কেল সূত্র ব্যবহার করে গণনা করা হয়, যা আপনার অবস্থান এবং কাবার মধ্যে পৃথিবীর গোলাকার পৃষ্ঠের সবচেয়ে ছোট পথ দেয়। ফোন কম্পাসে দেখানো রিডিং চৌম্বকীয় বিচ্যুতির কারণে সত্য উত্তর থেকে সামান্য ভিন্ন হতে পারে, তাই সবচেয়ে সঠিক ফলাফলের জন্য কম্পাস রিডিং মানচিত্রের দিকনির্দেশের সাথে তুলনা করার পরামর্শ দেওয়া হয়। সিস্টেম সমস্ত গণনার জন্য কাবার সরকারি স্থানাঙ্ক (২১.৪২২৫° উত্তর, ৩৯.৮২৬২° পূর্ব) একটি নির্দিষ্ট লক্ষ্য হিসাবে ব্যবহার করে।\`,
                    ms: \`Sudut kiblat dari \${seo.qiblaRef.cityName} adalah lebih kurang \${_bearing}° dari utara sebenar. Sudut ini dikira menggunakan formula Bulatan Besar yang memberi laluan terpendek pada permukaan sfera Bumi antara lokasi anda dan Kaabah. Bacaan pada kompas telefon mungkin berbeza sedikit kerana penyimpangan magnet berbanding utara sebenar, jadi disyorkan untuk membandingkan bacaan kompas dengan arah peta untuk hasil paling tepat. Sistem menggunakan koordinat rasmi Kaabah (21.4225° U, 39.8262° T) sebagai sasaran tetap untuk semua pengiraan.\`
                };
                const _qaSec2Html = '<section class="section-card qibla-seo-info qibla-seo-bearing">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec2H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec2P)) + '</p>'
                    + '</section>';

                // ── Section 3: distance ──
                const _qaSec3H2 = {
                    ar: \`المسافة من \${seo.qiblaRef.cityName} إلى مكة المكرمة\`,
                    en: \`Distance from \${seo.qiblaRef.cityName} to Mecca\`,
                    fr: \`Distance de \${seo.qiblaRef.cityName} à La Mecque\`,
                    tr: \`\${seo.qiblaRef.cityName}'den Mekke'ye Uzaklık\`,
                    ur: \`\${seo.qiblaRef.cityName} سے مکہ تک فاصلہ\`,
                    de: \`Entfernung von \${seo.qiblaRef.cityName} nach Mekka\`,
                    id: \`Jarak dari \${seo.qiblaRef.cityName} ke Mekkah\`,
                    es: \`Distancia desde \${seo.qiblaRef.cityName} a La Meca\`,
                    bn: \`\${seo.qiblaRef.cityName} থেকে মক্কার দূরত্ব\`,
                    ms: \`Jarak dari \${seo.qiblaRef.cityName} ke Makkah\`
                };
                const _qaSec3P = {
                    ar: \`تبلغ المسافة من \${seo.qiblaRef.cityName} إلى مكة المكرمة قرابة \${_distanceStr} كيلومتر، محسوبة بصيغة هافرسين على سطح كرة الأرض. هذه المسافة تمثل أقصر خط مستقيم بين الإحداثيتين عبر سطح الأرض، وتختلف عن مسافة الطريق الفعلية التي قد تكون أطول بكثير بسبب الجبال أو البحار. كلما كانت المدينة أبعد عن مكة المكرمة، كلما زادت أهمية استخدام البوصلة الرقمية بدقة، لأن الفرق البسيط في الزاوية يترجم إلى انحراف كبير على المسافة الطويلة. يمكن استخدام المسافة كمؤشر سريع للتأكد من صحة موقع المدينة في الحسابات.\`,
                    en: \`The distance from \${seo.qiblaRef.cityName} to Mecca is approximately \${_distanceStr} kilometers, calculated using the Haversine formula on Earth's spherical surface. This distance represents the shortest straight line between the two coordinates across Earth's surface, and differs from actual road distance which may be much longer due to mountains or seas. The farther a city is from Mecca, the more important it becomes to use the digital compass accurately, because a small angle difference translates into a large deviation over long distances. The distance can be used as a quick indicator to verify the correctness of the city's location in calculations.\`,
                    fr: \`La distance de \${seo.qiblaRef.cityName} à La Mecque est d'environ \${_distanceStr} kilomètres, calculée à l'aide de la formule de Haversine sur la surface sphérique de la Terre. Cette distance représente la ligne droite la plus courte entre les deux coordonnées à travers la surface terrestre, et diffère de la distance routière réelle qui peut être beaucoup plus longue en raison des montagnes ou des mers. Plus une ville est éloignée de La Mecque, plus il est important d'utiliser la boussole numérique avec précision, car une petite différence d'angle se traduit par une grande déviation sur de longues distances.\`,
                    tr: \`\${seo.qiblaRef.cityName}'den Mekke'ye uzaklık yaklaşık \${_distanceStr} kilometredir; Haversine formülü ile Dünya'nın küresel yüzeyinde hesaplanır. Bu mesafe, iki koordinat arasındaki Dünya yüzeyi üzerindeki en kısa düz çizgiyi temsil eder ve dağlar veya denizler nedeniyle çok daha uzun olabilen gerçek yol mesafesinden farklıdır. Bir şehir Mekke'den ne kadar uzaksa, dijital pusulayı hassas şekilde kullanmak o kadar önemlidir; çünkü küçük bir açı farkı uzun mesafelerde büyük bir sapmaya dönüşür.\`,
                    ur: \`\${seo.qiblaRef.cityName} سے مکہ تک کا فاصلہ تقریباً \${_distanceStr} کلومیٹر ہے، جو ہاورسائن فارمولا کے ذریعے زمین کی کروی سطح پر حساب کیا جاتا ہے۔ یہ فاصلہ دو نقاط کے درمیان زمین کی سطح پر سب سے چھوٹی سیدھی لکیر کی نمائندگی کرتا ہے، اور پہاڑوں یا سمندروں کی وجہ سے حقیقی سڑک کے فاصلے سے مختلف ہے جو بہت زیادہ لمبا ہو سکتا ہے۔ شہر جتنا مکہ سے دور ہوگا، ڈیجیٹل قطب نما کو درست طریقے سے استعمال کرنا اتنا ہی اہم ہوگا، کیونکہ زاویہ میں چھوٹا فرق طویل فاصلوں پر بڑے انحراف میں ترجمہ ہوتا ہے۔\`,
                    de: \`Die Entfernung von \${seo.qiblaRef.cityName} nach Mekka beträgt etwa \${_distanceStr} Kilometer, berechnet mit der Haversine-Formel auf der kugelförmigen Erdoberfläche. Diese Entfernung stellt die kürzeste gerade Linie zwischen den beiden Koordinaten über die Erdoberfläche dar und unterscheidet sich von der tatsächlichen Straßenentfernung, die aufgrund von Bergen oder Meeren viel länger sein kann. Je weiter eine Stadt von Mekka entfernt ist, desto wichtiger wird die genaue Verwendung des digitalen Kompasses, denn ein kleiner Winkelunterschied führt über große Entfernungen zu einer großen Abweichung.\`,
                    id: \`Jarak dari \${seo.qiblaRef.cityName} ke Mekkah adalah sekitar \${_distanceStr} kilometer, dihitung menggunakan rumus Haversine pada permukaan bola bumi. Jarak ini mewakili garis lurus terpendek antara dua koordinat melintasi permukaan bumi, dan berbeda dari jarak jalan sebenarnya yang mungkin jauh lebih panjang karena pegunungan atau lautan. Semakin jauh sebuah kota dari Mekkah, semakin penting menggunakan kompas digital dengan akurat, karena perbedaan sudut kecil diterjemahkan menjadi penyimpangan besar pada jarak jauh.\`,
                    es: \`La distancia desde \${seo.qiblaRef.cityName} a La Meca es de aproximadamente \${_distanceStr} kilómetros, calculada usando la fórmula de Haversine en la superficie esférica de la Tierra. Esta distancia representa la línea recta más corta entre las dos coordenadas a través de la superficie terrestre, y difiere de la distancia real por carretera que puede ser mucho mayor debido a montañas o mares. Cuanto más lejos esté una ciudad de La Meca, más importante es usar la brújula digital con precisión, porque una pequeña diferencia de ángulo se traduce en una gran desviación en distancias largas.\`,
                    bn: \`\${seo.qiblaRef.cityName} থেকে মক্কার দূরত্ব আনুমানিক \${_distanceStr} কিলোমিটার, হ্যাভারসাইন সূত্র ব্যবহার করে পৃথিবীর গোলাকার পৃষ্ঠে গণনা করা হয়। এই দূরত্ব পৃথিবীর পৃষ্ঠ জুড়ে দুটি স্থানাঙ্কের মধ্যে সবচেয়ে ছোট সরলরেখা প্রতিনিধিত্ব করে, এবং প্রকৃত সড়ক দূরত্ব থেকে ভিন্ন যা পাহাড় বা সমুদ্রের কারণে অনেক দীর্ঘ হতে পারে। একটি শহর মক্কা থেকে যত দূরে, ডিজিটাল কম্পাস সঠিকভাবে ব্যবহার করা তত গুরুত্বপূর্ণ, কারণ ছোট কোণের পার্থক্য দীর্ঘ দূরত্বে বড় বিচ্যুতিতে অনুবাদ হয়।\`,
                    ms: \`Jarak dari \${seo.qiblaRef.cityName} ke Makkah adalah lebih kurang \${_distanceStr} kilometer, dikira menggunakan formula Haversine pada permukaan sfera Bumi. Jarak ini mewakili garisan lurus terpendek antara dua koordinat merentasi permukaan Bumi, dan berbeza daripada jarak jalan sebenar yang mungkin jauh lebih panjang kerana gunung atau laut. Semakin jauh sebuah bandar dari Makkah, semakin penting untuk menggunakan kompas digital dengan tepat, kerana perbezaan sudut kecil diterjemahkan menjadi penyimpangan besar pada jarak jauh.\`
                };
                const _qaSec3Html = '<section class="section-card qibla-seo-info qibla-seo-distance">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec3H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec3P)) + '</p>'
                    + '</section>';

                // ── Section 4: how-to ──
                const _qaSec4H2 = {
                    ar: \`كيفية استخدام بوصلة القبلة في \${seo.qiblaRef.cityName}\`,
                    en: \`How to Use the Qibla Compass in \${seo.qiblaRef.cityName}\`,
                    fr: \`Comment utiliser la boussole de la Qibla à \${seo.qiblaRef.cityName}\`,
                    tr: \`\${seo.qiblaRef.cityName}'de Kıble Pusulası Nasıl Kullanılır\`,
                    ur: \`\${seo.qiblaRef.cityName} میں قبلہ نما کا استعمال کیسے کریں\`,
                    de: \`So nutzen Sie den Qibla-Kompass in \${seo.qiblaRef.cityName}\`,
                    id: \`Cara Menggunakan Kompas Kiblat di \${seo.qiblaRef.cityName}\`,
                    es: \`Cómo usar la brújula de la Qibla en \${seo.qiblaRef.cityName}\`,
                    bn: \`\${seo.qiblaRef.cityName}-এ কিবলা কম্পাস ব্যবহার করার উপায়\`,
                    ms: \`Cara Menggunakan Kompas Kiblat di \${seo.qiblaRef.cityName}\`
                };
                const _qaSec4P = {
                    ar: \`لاستخدام بوصلة القبلة في \${seo.qiblaRef.cityName} بأفضل دقة، احرص على أن يكون الجهاز بعيداً عن المعادن الكبيرة والمكبرات الصوتية والأجهزة الإلكترونية القوية التي قد تشوش الحساس المغناطيسي. عند فتح الصفحة لأول مرة، يطلب المتصفح إذن استخدام البوصلة الرقمية على بعض الأجهزة—امنح الإذن للحصول على اتجاه يتحدث مع كل حركة. حافظ على الجهاز أفقياً وقم بتدوير الجسم ببطء حتى يتحاذى السهم مع اتجاه القبلة المعروض. للتحقق، قارن النتيجة مع الخريطة التفاعلية التي تعرض خط الاتجاه من \${seo.qiblaRef.cityName} نحو الكعبة المشرفة في مكة المكرمة. عند السفر داخل المدينة أو خارجها، أعد تحميل الصفحة لتحديث الموقع وضمان دقة الزاوية.\`,
                    en: \`To use the Qibla compass in \${seo.qiblaRef.cityName} with best accuracy, ensure the device is away from large metals, loudspeakers, and powerful electronic devices that may interfere with the magnetic sensor. When opening the page for the first time, the browser requests permission to use the digital compass on some devices—grant permission to get a direction that updates with every movement. Keep the device horizontal and slowly rotate your body until the arrow aligns with the displayed Qibla direction. To verify, compare the result with the interactive map showing the bearing line from \${seo.qiblaRef.cityName} toward the Kaaba in Mecca. When traveling within or outside the city, reload the page to update the location and ensure angle accuracy.\`,
                    fr: \`Pour utiliser la boussole de la Qibla à \${seo.qiblaRef.cityName} avec la meilleure précision, assurez-vous que l'appareil est éloigné des gros métaux, haut-parleurs et appareils électroniques puissants qui pourraient interférer avec le capteur magnétique. Lors de l'ouverture de la page pour la première fois, le navigateur demande l'autorisation d'utiliser la boussole numérique sur certains appareils — accordez l'autorisation pour obtenir une direction qui se met à jour à chaque mouvement. Gardez l'appareil horizontal et tournez lentement votre corps jusqu'à ce que la flèche s'aligne sur la direction de la Qibla affichée. Pour vérifier, comparez le résultat avec la carte interactive montrant la ligne de direction de \${seo.qiblaRef.cityName} vers la Kaaba à La Mecque.\`,
                    tr: \`\${seo.qiblaRef.cityName} şehrinde kıble pusulasını en yüksek doğrulukla kullanmak için cihazı manyetik sensörü etkileyebilecek büyük metallerden, hoparlörlerden ve güçlü elektronik cihazlardan uzak tutun. Sayfayı ilk açtığınızda tarayıcı bazı cihazlarda dijital pusulayı kullanma izni ister—her hareketle güncellenen bir yön elde etmek için izin verin. Cihazı yatay tutun ve oku gösterilen kıble yönüyle hizalanana kadar vücudunuzu yavaşça döndürün. Doğrulamak için, \${seo.qiblaRef.cityName}'den Kâbe'ye doğru yön çizgisini gösteren etkileşimli haritayla sonucu karşılaştırın. Şehir içinde veya dışında seyahat ederken konumu güncellemek için sayfayı yeniden yükleyin.\`,
                    ur: \`\${seo.qiblaRef.cityName} میں قبلہ نما کو بہترین درستگی کے ساتھ استعمال کرنے کے لیے، یقینی بنائیں کہ آلہ بڑے دھاتوں، اسپیکروں اور طاقتور الیکٹرانک آلات سے دور ہے جو مقناطیسی سینسر میں مداخلت کر سکتے ہیں۔ پہلی بار صفحہ کھولتے وقت، براؤزر کچھ آلات پر ڈیجیٹل قطب نما استعمال کرنے کی اجازت مانگتا ہے—ہر حرکت کے ساتھ اپ ڈیٹ ہونے والی سمت حاصل کرنے کے لیے اجازت دیں۔ آلے کو افقی رکھیں اور آہستہ آہستہ اپنے جسم کو گھمائیں جب تک کہ تیر دکھائی گئی قبلہ کی سمت کے ساتھ منسلک نہ ہو جائے۔ تصدیق کے لیے، \${seo.qiblaRef.cityName} سے کعبہ کی طرف سمت کی لکیر دکھانے والے انٹرایکٹو نقشے سے نتیجہ کا موازنہ کریں۔\`,
                    de: \`Um den Qibla-Kompass in \${seo.qiblaRef.cityName} mit bester Genauigkeit zu nutzen, halten Sie das Gerät von großen Metallen, Lautsprechern und starken elektronischen Geräten fern, die den Magnetsensor stören könnten. Beim ersten Öffnen der Seite fordert der Browser auf einigen Geräten die Erlaubnis zur Nutzung des digitalen Kompasses an—erteilen Sie die Erlaubnis, um eine Richtung zu erhalten, die sich mit jeder Bewegung aktualisiert. Halten Sie das Gerät waagerecht und drehen Sie Ihren Körper langsam, bis der Pfeil mit der angezeigten Qibla-Richtung übereinstimmt. Zur Überprüfung vergleichen Sie das Ergebnis mit der interaktiven Karte, die die Peilungslinie von \${seo.qiblaRef.cityName} zur Kaaba in Mekka zeigt.\`,
                    id: \`Untuk menggunakan kompas kiblat di \${seo.qiblaRef.cityName} dengan akurasi terbaik, pastikan perangkat jauh dari logam besar, pengeras suara, dan perangkat elektronik kuat yang dapat mengganggu sensor magnetik. Saat membuka halaman pertama kali, browser meminta izin untuk menggunakan kompas digital pada beberapa perangkat—berikan izin untuk mendapatkan arah yang diperbarui dengan setiap gerakan. Jaga perangkat tetap horizontal dan putar tubuh Anda perlahan sampai panah sejajar dengan arah kiblat yang ditampilkan. Untuk memverifikasi, bandingkan hasil dengan peta interaktif yang menampilkan garis arah dari \${seo.qiblaRef.cityName} menuju Kakbah di Mekkah.\`,
                    es: \`Para usar la brújula de la Qibla en \${seo.qiblaRef.cityName} con la mejor precisión, asegúrese de que el dispositivo esté lejos de metales grandes, altavoces y dispositivos electrónicos potentes que puedan interferir con el sensor magnético. Al abrir la página por primera vez, el navegador solicita permiso para usar la brújula digital en algunos dispositivos—conceda el permiso para obtener una dirección que se actualiza con cada movimiento. Mantenga el dispositivo horizontal y gire lentamente su cuerpo hasta que la flecha se alinee con la dirección de la Qibla mostrada. Para verificar, compare el resultado con el mapa interactivo que muestra la línea de rumbo desde \${seo.qiblaRef.cityName} hacia la Kaaba en La Meca.\`,
                    bn: \`\${seo.qiblaRef.cityName}-এ কিবলা কম্পাস সর্বোত্তম নির্ভুলতার সাথে ব্যবহার করতে, ডিভাইসটিকে বড় ধাতু, লাউডস্পিকার এবং শক্তিশালী ইলেকট্রনিক ডিভাইস থেকে দূরে রাখুন যা চৌম্বকীয় সেন্সরে হস্তক্ষেপ করতে পারে। প্রথমবার পৃষ্ঠাটি খোলার সময়, ব্রাউজার কিছু ডিভাইসে ডিজিটাল কম্পাস ব্যবহারের অনুমতি চায়—প্রতিটি আন্দোলনের সাথে আপডেট হওয়া দিকনির্দেশ পেতে অনুমতি দিন। ডিভাইসটি অনুভূমিক রাখুন এবং তীরটি প্রদর্শিত কিবলার দিকের সাথে সারিবদ্ধ না হওয়া পর্যন্ত ধীরে ধীরে আপনার শরীর ঘোরান। যাচাই করতে, \${seo.qiblaRef.cityName} থেকে মক্কায় কাবার দিকে দিকনির্দেশনা রেখা দেখানো ইন্টারঅ্যাকটিভ মানচিত্রের সাথে ফলাফল তুলনা করুন।\`,
                    ms: \`Untuk menggunakan kompas kiblat di \${seo.qiblaRef.cityName} dengan ketepatan terbaik, pastikan peranti jauh dari logam besar, pembesar suara, dan peranti elektronik berkuasa yang boleh mengganggu sensor magnetik. Apabila membuka halaman buat pertama kali, pelayar meminta kebenaran untuk menggunakan kompas digital pada sesetengah peranti—berikan kebenaran untuk mendapatkan arah yang dikemas kini dengan setiap pergerakan. Pegang peranti secara mendatar dan putar badan anda perlahan-lahan sehingga anak panah sejajar dengan arah kiblat yang dipaparkan. Untuk mengesahkan, bandingkan hasil dengan peta interaktif yang menunjukkan garisan arah dari \${seo.qiblaRef.cityName} menuju Kaabah di Makkah.\`
                };
                const _qaSec4Html = '<section class="section-card qibla-seo-info qibla-seo-howto">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec4H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P)) + '</p>'
                    + '</section>';

                // Inject all 4 sections immediately before #qibla-other-cities
                const _qaAllSections = _qaSec1Html + _qaSec2Html + _qaSec3Html + _qaSec4Html;
                html = html.replace(
                    /<div id="qibla-other-cities"/,
                    _qaAllSections + '<div id="qibla-other-cities"'
                );
            } catch (_e) { /* silent — Q-A SSR injection optional, page still serves */ }
        }


        // ── (18-A) Today page: CTA بارز يقود إلى الـ hub (/moon-in-{slug}) ──`;

replaceOnce('PART 3 — Q-A H1 + 4 SSR sections (10 langs each)', PART3_OLD, PART3_NEW);

writeFileSync(SRV_PATH, raw);

console.log('\n✅ Phase Q-A — qibla-in-{city} SEO cleanup complete.');
console.log('\nChanges applied (server.js):');
console.log('  • Title 10-lang extension (~52 → ~58 chars)');
console.log('  • Meta 10-lang extension (~95 → ~140 chars)');
console.log('  • H1 SSR text-replace: "اتجاه القبلة" → "اتجاه القبلة في {city}"');
console.log('  • _qiblaCalcSsr inline (Great Circle bearing + Haversine distance)');
console.log('  • 4 SSR sections (overview, bearing, distance, how-to) × 10 langs');
console.log('\nGated by seo.qiblaRef.slug (city pages only — never /qibla Hub).');
console.log('Insert anchor: <div id="qibla-other-cities"...');
