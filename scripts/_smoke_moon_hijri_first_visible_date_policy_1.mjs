#!/usr/bin/env node
// MOON-HIJRI-FIRST-VISIBLE-DATE-POLICY-1 (2026-05-24)
//
// Smoke test for the new "Hijri-first visible date" policy on the moon
// pages. Verifies:
//   1. AR dated H1 shows the Hijri date as primary (with `هـ` suffix).
//   2. The other 9 supported langs keep Gregorian as the primary date.
//   3. The subtitle (`#moon-subtitle-hijri`) always shows the OTHER
//      calendar so both dates remain visible.
//   4. The badge text + class flip together with the H1 (Hijri on AR
//      dated pages, Gregorian on other langs).
//   5. The canonical / hreflang stay Gregorian-format (URL policy
//      unchanged — STRICT GREGORIAN ROUTE POLICY).
//   6. Hijri-format URLs still return HTTP 404 (route policy enforced).
//   7. The 14-day forecast table head uses the new combined
//      `fc-th-date` column (no more separate `fc-th-greg` /
//      `fc-th-hijri` headers).
//   8. Hub / today-in-city / monthly H1 templates are unchanged
//      (the policy flip only applies to the dated page).
//
// Usage:
//   PORT=3231 node scripts/_smoke_moon_hijri_first_visible_date_policy_1.mjs
//   (defaults to PORT=3000 if not set).

const PORT = parseInt(process.env.PORT || '3000', 10);
const BASE = `http://localhost:${PORT}`;

const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const CITY = 'riyadh';
const DATE_GREG = '2026-05-23';   // a known Gregorian date
const DATE_HIJRI = '1447-12-06';  // its Hijri equivalent (must 404)

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, label) {
    if (cond) {
        passed++;
        process.stdout.write('\x1b[32m✓\x1b[0m ' + label + '\n');
    } else {
        failed++;
        failures.push(label);
        process.stdout.write('\x1b[31m✗\x1b[0m ' + label + '\n');
    }
}

async function fetchPath(path) {
    const url = BASE + path;
    const res = await fetch(url);
    const text = res.ok ? await res.text() : '';
    return { status: res.status, text, url };
}

function pickFirst(html, regex) {
    const m = html.match(regex);
    return m ? m[0] : '';
}

(async function main() {
    console.log('━━━ MOON-HIJRI-FIRST-VISIBLE-DATE-POLICY-1 smoke ━━━');
    console.log('Base: ' + BASE);
    console.log('');

    // ── Section 1: AR dated page must use Hijri as primary in H1 ────
    console.log('── Section 1: AR dated H1 = Hijri primary ──');
    {
        const r = await fetchPath(`/moon-in-${CITY}/${DATE_GREG}`);
        assert(r.status === 200, 'AR /moon-in-' + CITY + '/' + DATE_GREG + ' returns 200');
        const h1 = pickFirst(r.text, /<h1[^>]*id="moon-page-h1"[^>]*>[^<]+/);
        assert(/ذو الحجة|الحجة|ذي الحجة/.test(h1), 'AR H1 contains Hijri month name "ذو الحجة"');
        assert(/هـ/.test(h1), 'AR H1 contains Hijri suffix "هـ"');
        assert(!/مايو 2026/.test(h1), 'AR H1 does NOT contain "مايو 2026" (Gregorian moved to subtitle)');

        const sub = pickFirst(r.text, /<p[^>]*id="moon-subtitle-hijri"[^>]*>[^<]+/);
        assert(/الموافق/.test(sub), 'AR subtitle starts with "الموافق"');
        assert(/مايو 2026/.test(sub) || /23\s*مايو/.test(sub), 'AR subtitle contains Gregorian "مايو 2026"');

        const badge = pickFirst(r.text, /<div[^>]*id="moon-date-badge"[^>]*class="moon-date-badge\s+\w+"[^>]*>[^<]+/);
        assert(/moon-date-badge\s+hijri/.test(r.text), 'AR badge has class "hijri"');
        assert(/📿 عرض حسب التاريخ الهجري/.test(r.text), 'AR badge text = "📿 عرض حسب التاريخ الهجري"');
    }

    // ── Section 2: Other 9 langs keep Gregorian primary ─────────────
    console.log('');
    console.log('── Section 2: other 9 langs keep Gregorian primary ──');
    for (const lang of LANGS.filter(l => l !== 'ar')) {
        const r = await fetchPath(`/${lang}/moon-in-${CITY}/${DATE_GREG}`);
        const h1 = pickFirst(r.text, /<h1[^>]*id="moon-page-h1"[^>]*>[^<]+/);
        assert(r.status === 200, `/${lang}/moon-in-${CITY}/${DATE_GREG} returns 200`);
        // Each lang should contain Gregorian date numerics (23 + 2026) — month
        // name varies, but the year + day appear verbatim.
        assert(/23/.test(h1) && /2026/.test(h1), `${lang}: H1 contains Gregorian "23" + "2026"`);
        // Hijri suffix should NOT be in the H1 (Hijri is now in subtitle)
        const hijriSfxRe = /\b(AH|H\b|هـ|ھ|n\.H\.|d\.H\.|হিজরি)/;
        assert(!hijriSfxRe.test(h1), `${lang}: H1 does NOT contain Hijri suffix`);
        // Badge should be "gregorian" class
        assert(/moon-date-badge\s+gregorian/.test(r.text), `${lang}: badge has class "gregorian"`);
        // Subtitle should contain Hijri equivalence
        assert(/moon-subtitle-hijri/.test(r.text), `${lang}: subtitle element present`);
    }

    // ── Section 3: URL policy unchanged (canonical/hreflang Gregorian) ──
    console.log('');
    console.log('── Section 3: URL canonical/hreflang stay Gregorian ──');
    {
        const r = await fetchPath(`/moon-in-${CITY}/${DATE_GREG}`);
        const canonical = pickFirst(r.text, /<link rel="canonical"[^>]*>/);
        assert(canonical.includes(DATE_GREG), 'AR canonical contains Gregorian YYYY-MM-DD');
        assert(!canonical.includes('1447-'), 'AR canonical does NOT contain Hijri YYYY-');
        // datePublished JSON-LD should be Gregorian ISO
        assert(/"datePublished":\s*"2026-05-23/.test(r.text), 'AR JSON-LD datePublished is Gregorian "2026-05-23"');
    }

    // ── Section 4: Strict Gregorian route policy still enforces 404 ──
    console.log('');
    console.log('── Section 4: Hijri URL still 404 (strict route policy) ──');
    {
        const r = await fetchPath(`/moon-in-${CITY}/${DATE_HIJRI}`);
        assert(r.status === 404, `/moon-in-${CITY}/${DATE_HIJRI} returns 404`);
    }

    // ── Section 5: Forecast table thead uses combined fc-th-date ───
    console.log('');
    console.log('── Section 5: 14-day table thead uses combined fc-th-date ──');
    {
        const r = await fetchPath(`/moon-today-in-${CITY}`);
        assert(/<th[^>]*class="fc-th-date"/.test(r.text), 'thead has <th class="fc-th-date">');
        assert(/data-i18n="moon\.fc_date"/.test(r.text), 'thead has data-i18n="moon.fc_date"');
        assert(!/data-i18n="moon\.fc_day"/.test(r.text.split('moon-forecast-table')[1] || ''), 'thead does NOT use moon.fc_day inside the forecast table');
        assert(!/class="fc-th-hijri"/.test(r.text), 'thead does NOT have separate fc-th-hijri');
        assert(!/class="fc-th-greg"/.test(r.text), 'thead does NOT have separate fc-th-greg');
    }

    // ── Section 6: Hub/today/monthly H1 templates unchanged ─────────
    console.log('');
    console.log('── Section 6: hub/today/month H1 unchanged ──');
    {
        const r1 = await fetchPath(`/moon-today-in-${CITY}`);
        const h1a = pickFirst(r1.text, /<h1[^>]*id="moon-page-h1"[^>]*>[^<]+/);
        assert(/حالة القمر اليوم في/.test(h1a), 'AR today-in-city H1 = "حالة القمر اليوم في ..."');

        const r2 = await fetchPath(`/moon-in-${CITY}`);
        const h1b = pickFirst(r2.text, /<h1[^>]*id="moon-page-h1"[^>]*>[^<]+/);
        assert(/تقويم القمر وأطوار الشهر في/.test(h1b), 'AR city-hub H1 = "تقويم القمر وأطوار الشهر في ..."');

        const r3 = await fetchPath(`/moon-in-${CITY}/2026-05`);
        const h1c = pickFirst(r3.text, /<h1[^>]*id="moon-page-h1"[^>]*>[^<]+/);
        assert(/أطوار القمر في/.test(h1c) && /مايو 2026/.test(h1c), 'AR month H1 = "أطوار القمر في {city} — مايو 2026"');
    }

    // ── Summary ─────────────────────────────────────────────────────
    console.log('');
    console.log('━━━ Summary ━━━');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    if (failed > 0) {
        console.log('Failed assertions:');
        failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
        process.exit(1);
    }
    console.log('\x1b[32m✓ ALL CHECKS PASSED\x1b[0m');
    process.exit(0);
})().catch(e => {
    console.error('Test crashed:', e);
    process.exit(2);
});
