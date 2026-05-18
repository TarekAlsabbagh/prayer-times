// scripts/_test_place_names_l10n_foundation.mjs
// PLACE-NAMES-L10N-FOUNDATION-CODE-1 — SSR foundation smoke test.
//
// Verifies the four invariants of the foundation:
//   (1) /ur/prayer-times-in-<slug> for a row WITHOUT names.ur renders
//       the absence-state UI ("مقامی نام دستیاب نہیں" label + secondary
//       English) — NOT "Charikar" presented as if it were the Urdu name.
//   (2) Same for /bn/.
//   (3) /ar/ for the same slug renders the real Arabic name (no regression).
//   (4) /en/ for the same slug renders the English name (no regression).
//
// Also checks the new `<meta name="ssr-city-name-source">` tag for the
// expected source value per page.
import http from 'node:http';

function get(path) {
    return new Promise(r => {
        http.get({ host: 'localhost', port: 8080, path }, rs => {
            let b = '';
            rs.on('data', c => b += c);
            rs.on('end', () => r({ status: rs.statusCode, body: b }));
        }).on('error', () => r({ status: 0, body: '' }));
    });
}

function extractMeta(html, name) {
    const re = new RegExp('<meta\\s+name="' + name + '"\\s+content="([^"]*)"', 'i');
    const m = html.match(re);
    return m ? m[1] : '';
}

function extractCityNameDiv(html) {
    // Captures the full <div class="city-name" id="city-name" ...>...</div> block.
    const m = html.match(/<div class="city-name" id="city-name"[^>]*>[\s\S]*?<\/div>/);
    return m ? m[0] : '';
}

function hasLatin(s)  { return /[A-Za-z]/.test(s || ''); }
function hasArabic(s) { return /[؀-ۿ]/.test(s || ''); }
function hasBengali(s){ return /[ঀ-৿]/.test(s || ''); }

// ─── Tests ─────────────────────────────────────────────────────────────
// `qibah` (SA) is a small curated entry with no names.ur and no names.bn —
// suitable for the absence-state check. Previously this test used `charikar`,
// but after PLACE-NAMES-UR-AF-1 charikar HAS names.ur="چاریکار" so the
// absence-state no longer fires for it. The foundation behavior (showing the
// absence-state UI when names.ur is missing) is still active for all other
// non-enriched rows in curated.
const TESTS = [
    // ABSENCE-STATE — fires when names.ur is missing
    {
        name: 'ur — absence-state when names.ur missing',
        url: '/ur/prayer-times-in-qibah',
        assert: (html) => {
            const source = extractMeta(html, 'ssr-city-name-source');
            const cityDiv = extractCityNameDiv(html);
            const expectAbsenceLabel = 'مقامی نام دستیاب نہیں';
            const hasAbsenceLabel = cityDiv.includes(expectAbsenceLabel);
            const hasSecondaryEn = cityDiv.includes('city-name-en-secondary');
            const hasDataAttr = /data-name-source="missing-localized"/.test(cityDiv);
            return {
                ok: source === 'missing-localized'
                    && hasAbsenceLabel
                    && hasSecondaryEn
                    && hasDataAttr,
                detail: 'source=' + source + ' absenceLabel=' + hasAbsenceLabel + ' secondaryEn=' + hasSecondaryEn + ' dataAttr=' + hasDataAttr,
            };
        }
    },
    // Bengali — same absence state.
    {
        name: 'bn — absence-state when names.bn missing',
        url: '/bn/prayer-times-in-qibah',
        assert: (html) => {
            const source = extractMeta(html, 'ssr-city-name-source');
            const cityDiv = extractCityNameDiv(html);
            const expectAbsenceLabel = 'স্থানীয় নাম উপলব্ধ নয়';
            return {
                ok: source === 'missing-localized'
                    && cityDiv.includes(expectAbsenceLabel)
                    && cityDiv.includes('city-name-en-secondary'),
                detail: 'source=' + source + ' divFragment=' + cityDiv.slice(0, 200),
            };
        }
    },
    // POST-UR-AF-1 — charikar NOW has names.ur (no longer absence). Spot-check.
    {
        name: 'ur — charikar after UR-AF-1 enrichment (no absence)',
        url: '/ur/prayer-times-in-charikar',
        assert: (html) => {
            const source = extractMeta(html, 'ssr-city-name-source');
            const cityName = extractMeta(html, 'ssr-city-name');
            return {
                ok: source === 'explicit-localized' && cityName === 'چاریکار',
                detail: 'source=' + source + ' cityName=' + cityName,
            };
        }
    },
    // Arabic — explicit names.ar is set (تشاريكار). The site uses the bare
    // URL (no /ar/ prefix) for Arabic, so `/prayer-times-in-charikar` IS
    // the Arabic page. Verify both the SSR meta + the city-name div.
    {
        name: 'ar bare — explicit Arabic name (regression check)',
        url: '/prayer-times-in-charikar',
        assert: (html) => {
            const source = extractMeta(html, 'ssr-city-name-source');
            const cityName = extractMeta(html, 'ssr-city-name');
            return {
                ok: source === 'explicit-localized'
                    && cityName === 'تشاريكار'
                    && hasArabic(cityName)
                    && !hasLatin(cityName),
                detail: 'source=' + source + ' cityName=' + cityName,
            };
        }
    },
    // English — must show the Latin name (no regression).
    {
        name: 'en — Latin name (regression check)',
        url: '/en/prayer-times-in-charikar',
        assert: (html) => {
            const source = extractMeta(html, 'ssr-city-name-source');
            const cityName = extractMeta(html, 'ssr-city-name');
            return {
                ok: source === 'explicit-localized'
                    && cityName === 'Charikar'
                    && hasLatin(cityName)
                    && !hasArabic(cityName),
                detail: 'source=' + source + ' cityName=' + cityName,
            };
        }
    },
    // Latin-script lang (fr) — should render Latin name (`names.en` as fallback).
    {
        name: 'fr — Latin fallback (no absence state)',
        url: '/fr/prayer-times-in-charikar',
        assert: (html) => {
            const source = extractMeta(html, 'ssr-city-name-source');
            const cityName = extractMeta(html, 'ssr-city-name');
            return {
                ok: source === 'fallback-en-latin-script'
                    && cityName === 'Charikar'
                    && hasLatin(cityName)
                    && !hasArabic(cityName),
                detail: 'source=' + source + ' cityName=' + cityName,
            };
        }
    },
    // Latin-script langs — sanity that none of them render the Urdu absence label.
    ...['de', 'es', 'tr', 'id', 'ms'].map(lang => ({
        name: lang + ' — Latin fallback (no absence label)',
        url: '/' + lang + '/prayer-times-in-charikar',
        assert: (html) => {
            const source = extractMeta(html, 'ssr-city-name-source');
            const cityDiv = extractCityNameDiv(html);
            // The absence label should NOT appear in non-ar/ur/bn pages
            const hasNoAbsenceLabel = !cityDiv.includes('مقامی نام دستیاب نہیں')
                && !cityDiv.includes('স্থানীয় নাম উপলব্ধ নয়')
                && !cityDiv.includes('الاسم المحلي غير متوفر');
            return {
                ok: source === 'fallback-en-latin-script' && hasNoAbsenceLabel,
                detail: 'source=' + source + ' hasNoAbsenceLabel=' + hasNoAbsenceLabel,
            };
        }
    })),
    // Cross-check on a row WITH explicit names.ur — riyadh has ar=الرياض + ur=ریاض.
    {
        name: 'ur — explicit names.ur returns Urdu (sanity)',
        url: '/ur/prayer-times-in-riyadh',
        assert: (html) => {
            const source = extractMeta(html, 'ssr-city-name-source');
            const cityName = extractMeta(html, 'ssr-city-name');
            return {
                ok: source === 'explicit-localized'
                    && cityName === 'ریاض'
                    && hasArabic(cityName)
                    && !hasLatin(cityName),
                detail: 'source=' + source + ' cityName=' + cityName,
            };
        }
    },
];

let pass = 0, fail = 0;
console.log('═══ PLACE-NAMES-L10N-FOUNDATION-CODE-1 — SSR foundation smoke test ═══\n');

for (const t of TESTS) {
    const r = await get(t.url);
    if (r.status !== 200) {
        fail++;
        console.log('✗ ' + t.name.padEnd(58) + ' — HTTP ' + r.status);
        continue;
    }
    const a = t.assert(r.body);
    if (a.ok) {
        pass++;
        console.log('✓ ' + t.name.padEnd(58) + ' — ' + a.detail);
    } else {
        fail++;
        console.log('✗ ' + t.name.padEnd(58) + ' — ' + a.detail);
    }
}

console.log('\n' + '═'.repeat(60));
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + TESTS.length + ')');

// ─── 🚨 CRITICAL CHECK — absence-state still fires for non-enriched rows ──
// After PLACE-NAMES-UR-AF-1, charikar HAS a real names.ur="چاریکار" so it no
// longer renders absence state. Pick a non-enriched row (qibah) to verify the
// absence-state mechanism is still active for any other row without names.ur.
const r = await get('/ur/prayer-times-in-qibah');
const cityDiv = extractCityNameDiv(r.body);
const source = extractMeta(r.body, 'ssr-city-name-source');
const hasProperAbsenceMarkup =
    cityDiv.includes('مقامی نام دستیاب نہیں')
    && cityDiv.includes('city-name-en-secondary')
    && source === 'missing-localized';
console.log('\n🚨 CRITICAL: /ur/prayer-times-in-qibah (no names.ur) must render absence-state UI');
console.log(hasProperAbsenceMarkup
    ? '  ✓ PASS: absence label + secondary English markup rendered (source=' + source + ')'
    : '  ✗ FAIL: absence markup not detected. cityDiv=' + cityDiv.slice(0, 300));

process.exit(fail === 0 && hasProperAbsenceMarkup ? 0 : 1);
