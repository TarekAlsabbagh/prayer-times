// Smoke — QURAN-SITEWIDE-SIDEBAR-ENTRY-AND-EXISTING-LOCALE-MODAL-HANDOFF-1.
// Proves the shared green sidebar gains ONE localized «القرآن» → /quran entry that:
//   • renders in SSR for every interface language with the correct translated label,
//   • always keeps href="/quran" (never a /{lang}/quran route — that is a 404), incl. the non-Arabic homepage,
//   • is wired in js/app.js to FULL-navigate to /quran and (only from a non-Arabic UI) stash a single-use
//     sessionStorage handoff flag, and to highlight itself active on /quran + surah routes,
//   • is consumed in js/quran-home.js by opening the EXISTING #quran-locale-modal via openModal/applyLang
//     (read→delete the flag first; supported non-Arabic langs only) — no new modal, no new copy,
//   • carries nav.quran across all 10 client i18n bundles,
// while the Quran text / reader / sitemaps / robots / canonical / the locale-modal dict stay untouched.
//
//   QURAN_SSR_BASE=http://localhost:8080 node scripts/_smoke_quran_sitewide_sidebar_locale_modal_handoff_1.mjs
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://127.0.0.1:8085';
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++) : (fail++, F.push(m), console.log('  FAIL ' + m));

const EXPECT = { ar: 'القرآن', en: 'Quran', fr: 'Coran', de: 'Koran', tr: 'Kur’an', ur: 'قرآن', es: 'Corán', id: "Al-Qur'an", bn: 'কুরআন', ms: 'Al-Quran' };
const LANGS = Object.keys(EXPECT);

// ─────────────── STATIC: server.js ───────────────
const srv = rd('server.js');
ok(/\{\s*href:\s*'\/quran',\s*page:\s*'quran',\s*icon:\s*'i-book-open',\s*i18n:\s*'nav\.quran',\s*text:\s*'القرآن'\s*\}/.test(srv), 'server.js _SIDENAV_GROUPS has the Quran entry (href=/quran, page=quran, i-book-open, nav.quran, القرآن)');
{ // it must sit in the Islamic-services group, right AFTER prayer-times and BEFORE qibla
  const iPray = srv.indexOf("i18n: 'nav.prayer_times'");
  const iQuran = srv.indexOf("i18n: 'nav.quran'");
  const iQibla = srv.indexOf("i18n: 'nav.qibla'");
  ok(iPray > 0 && iQuran > iPray && iQibla > iQuran, 'the Quran entry is placed after prayer-times and before qibla');
}
ok(/<symbol id="i-book-open" viewBox="0 0 24 24">/.test(srv), 'server.js _SIDENAV_SPRITE now carries the i-book-open symbol (for the static templates)');
ok((srv.match(/if \(path === '\/quran' \|\| path\.startsWith\('\/quran\/'\)\) return full;/g) || []).length === 2, 'BOTH server.js language-prefix rewriters EXEMPT /quran (kept unprefixed on every non-Arabic page — a /{lang}/quran is a 404)');
ok(srv.includes("quran-home.js?v=4"), 'server.js bumped the quran-home.js cache-buster to v=4');
ok(/const _i18nVersion = '207'/.test(srv), 'server.js bumped _i18nVersion to 207 (client i18n bundles refreshed)');
// forbidden-scope guards: the locale modal dict/builder and the dedicated sitemap are untouched here
ok(srv.includes('_quranLocaleModalHtml') && srv.includes('_QURAN_LOCALE_MODAL_L10N'), 'the existing locale-modal builder + dict are still referenced (reused, not replaced)');
ok(srv.includes('function _getQuranDedicatedSitemap()') && /const QURAN_PUBLIC_RELEASE_LASTMOD = '2026-07-22';/.test(srv), 'the dedicated sitemap + general sitemap Quran block are left intact');

// ─────────────── STATIC: js/app.js ───────────────
const app = rd('js/app.js');
ok(/if \(pageId === 'quran'\) \{/.test(app), 'js/app.js has a dedicated pageId==="quran" click branch');
ok(/sessionStorage\.setItem\('tp-quran-locale-notice-lang', _qlang\)/.test(app) && /_qlang !== 'ar'/.test(app), 'the branch stashes the source language ONLY for a non-Arabic interface');
ok(/sessionStorage\.removeItem\('tp-quran-locale-notice-lang'\)/.test(app), 'the branch clears the flag on an Arabic interface (no modal for ar)');
ok(/window\.location\.href = '\/quran';/.test(app), 'the branch FULL-navigates to the literal /quran (no pageUrl language prefix)');
ok((app.match(/\.sidebar-nav a\[data-page="quran"\]'\)\?\.classList\.add\('active'\)/g) || []).length >= 2, 'js/app.js highlights the Quran entry active on both /quran and surah routes');
ok(!/pageUrl\('\/quran'\)/.test(app), 'js/app.js never routes /quran through pageUrl() (which would language-prefix it)');

// ─────────────── STATIC: js/quran-home.js ───────────────
const qh = rd('js/quran-home.js');
ok(/sessionStorage\.getItem\('tp-quran-locale-notice-lang'\)[\s\S]{0,80}removeItem\('tp-quran-locale-notice-lang'\)/.test(qh), 'js/quran-home.js reads THEN immediately deletes the handoff flag (single use)');
ok(/if \(modal && _handoffLang && _handoffLang !== 'ar' && _handoffOk\[_handoffLang\] && !open\) openModal\(_handoffLang, null\)/.test(qh), 'it opens the EXISTING modal via openModal() only for a supported non-Arabic language');
ok(!/document\.createElement\('dialog'\)|new Modal|id="quran-locale-modal-2"/.test(qh), 'no second/new modal is created');

// ─────────────── STATIC: client bundles carry nav.quran ───────────────
for (const l of LANGS) {
  const b = rd(`js/i18n/${l}.js`);
  const m = b.match(/'nav\.quran':\s*'((?:[^'\\]|\\.)*)'/);
  const val = m ? m[1].replace(/\\'/g, "'") : null;
  ok(val === EXPECT[l], `js/i18n/${l}.js nav.quran = «${EXPECT[l]}» (got «${val}»)`);
}

async function main() {
  // ─────────────── RUNTIME: SSR sidebar entry across all 10 langs ───────────────
  const homePath = { ar: '/', en: '/en', fr: '/fr', de: '/de', tr: '/tr', ur: '/ur', es: '/es', id: '/id', bn: '/bn', ms: '/ms' };
  for (const l of LANGS) {
    const html = await (await fetch(B + homePath[l])).text();
    const nav = html.slice(html.indexOf('<nav class="sidebar-nav"'), html.indexOf('</nav>', html.indexOf('<nav class="sidebar-nav"')) + 6);
    // exactly one Quran entry, href=/quran (never lang-prefixed), i-book-open icon, nav.quran data-i18n, ar-fallback label القرآن
    const entries = [...nav.matchAll(/<a href="([^"]*)"([^>]*)>\s*<svg[^>]*><use href="#([^"]+)"[^>]*><\/svg>\s*<span data-i18n="([^"]+)">([^<]*)<\/span><\/a>/g)];
    const q = entries.filter(e => e[4] === 'nav.quran');
    ok(q.length === 1, `[${l}] exactly ONE nav.quran sidebar entry — ${q.length}`);
    if (q.length === 1) {
      ok(q[0][1] === '/quran', `[${l}] href is exactly /quran (raw SSR, unprefixed) — «${q[0][1]}»`);
      ok(q[0][3] === 'i-book-open', `[${l}] uses the i-book-open icon`);
      ok(q[0][5] === EXPECT[l], `[${l}] SSR label is the translated «${EXPECT[l]}» (server SSR-translates data-i18n → no Arabic flash) — got «${q[0][5]}»`);
      ok(!/\?|#/.test(q[0][1]), `[${l}] no query/fragment on the href`);
    }
    // no language-prefixed /quran anywhere in the served homepage HTML
    ok(!/href="\/(en|fr|de|tr|ur|es|id|bn|ms)\/quran"/.test(html), `[${l}] served homepage has NO /{lang}/quran link`);
  }
  // /quran is live; /{lang}/quran is a 404 (Arabic-only section)
  ok((await fetch(B + '/quran')).status === 200, '/quran → 200');
  const enQ = await fetch(B + '/en/quran'); ok(enQ.status === 404, '/en/quran → 404 (no language-prefixed Quran route) — ' + enQ.status);
  // the SSR /quran document still ships the ONE existing locale modal (reused, not duplicated)
  const qHtml = await (await fetch(B + '/quran')).text();
  ok((qHtml.match(/id="quran-locale-modal"/g) || []).length === 1, '/quran ships exactly ONE #quran-locale-modal (the existing one, not duplicated)');
  ok(qHtml.includes('id="quran-locale-l10n"'), '/quran still ships the existing #quran-locale-l10n dictionary island');

  console.log('RESULT quran_sitewide_sidebar_locale_modal_handoff: ' + pass + ' passed, ' + fail + ' failed');
  if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
}
main().catch(e => { console.log('  FAIL uncaught ' + (e && e.message)); process.exit(1); });
