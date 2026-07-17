// Smoke — QURAN surah-end + prev/next nav. The surah-end box keeps EXACTLY ONE "browse all surahs" button
// (de-duped) AND renders the prev/next neighbours as two EQUAL cards. Both are now unconditional real links
// built through `_quranPathFor` — the ONE helper that turns a surah number into its official slug URL, so a
// neighbour card can never hand-assemble a path of its own. Dynamic for every surah (Al-Fatiha has no prev,
// An-Nas no next: a missing neighbour renders NOTHING rather than a dead card).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurahBody(n)');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
const nav0 = src.indexOf('function _quranNavCard(');
const nav = src.slice(nav0, src.indexOf('\n}', nav0) + 2);

// completion box + de-dup preserved
ok(/class="quran-surah-end"/.test(b), 'surah-end completion box present');
const ctaCalls = (b.match(/_quranBrowseCta\(/g) || []).length;
ok(ctaCalls === 2, 'the distinctive browse CTA is rendered in EXACTLY two places (hero + surah-end) — found ' + ctaCalls);
ok(/_quranBrowseCta\(chapters\.length, 'hero'\)/.test(b) && /_quranBrowseCta\(chapters\.length, 'end'\)/.test(b), 'one hero CTA + one surah-end CTA');
ok(/تصفّح جميع سور القرآن/.test(src) && /data-quran-surah-browser-trigger/.test(src) && /aria-haspopup="dialog"/.test(src), 'the CTA helper emits the label + shared trigger + aria-haspopup=dialog');
ok(b.indexOf('quran-browse-cta-wrap') > b.indexOf('class="quran-surah-nav"'), 'the bottom browse CTA sits AFTER the prev/next nav cards');
ok(!/quran-browse-all/.test(b), 'the OLD duplicate .quran-browse-all button is gone');

// prev/next nav RESTORED (two cards, dynamic from chapters.json)
ok(/class="quran-surah-nav"/.test(b), 'surah-nav block restored');
ok(/const prevSurah = chapters\.find/.test(b) && /const nextSurah = chapters\.find/.test(b), 'prev/next computed dynamically from chapters.json');
ok(/_quranNavCard\(prevSurah, 'prev'\)/.test(b) && /_quranNavCard\(nextSurah, 'next'\)/.test(b), 'both cards emitted (prev first = right in RTL, next second = left)');

// card internals (in the module-level _quranNavCard builder)
ok(nav.includes('السورة السابقة') && nav.includes('السورة التالية'), 'prev + next direction labels');
// the neighbour name goes through the display-name helper now (so 36/38/50 read «يس» «ص» «ق», not «يسٓ» «صٓ» «قٓ»)
ok(nav.includes('سورة ${_quranEsc(_quranCleanName(chapter.nameAr))}'), 'surah NAME shown prominently, via the display-name helper');
ok(nav.includes('السورة رقم ${_quranAr(chapter.number)}'), 'surah NUMBER shown as secondary');
ok(/quran-nav-arrow/.test(nav), 'a direction arrow is included');
ok(/if \(!chapter\) return ''/.test(nav), 'Al-Fatiha-no-prev / An-Nas-no-next handled (null → card omitted)');

// QURAN-AR-SSR-SURAH-GENERALIZATION-1 inverted the three assertions that used to live here. They encoded the
// PROTOTYPE's safety rule — "only surah 21 exists, so the neighbour cards must be inert or they would 404".
// All 114 surahs are built now, so that rule is not merely obsolete, its opposite is the requirement: a
// disabled card or a "coming soon" note would be a lie about a page that exists. The scaffolding flag
// (_QURAN_SURAHS_LIVE) and its dead branch are gone from server.js entirely, not left switched on.
ok(!/_QURAN_SURAHS_LIVE/.test(src), 'the prototype flag _QURAN_SURAHS_LIVE is GONE (not just flipped to true)');
ok(!/aria-disabled="true"/.test(nav) && !src.includes('ستتوفر عند إطلاق جميع سور القرآن'), 'no aria-disabled card and no «ستتوفر عند إطلاق جميع سور القرآن» anywhere');
ok(/<a class="quran-surah-nav-card quran-surah-nav-card--\$\{kind\}" href="\$\{_quranPathFor\(chapter\.number\)\}"/.test(nav), 'every neighbour card is an unconditional real link built by _quranPathFor (the one number→slug helper)');
ok(/if \(!chapter\) return '';/.test(nav), 'a missing neighbour (Al-Fatiha prev / An-Nas next) renders NOTHING — never a dead card');
// The retired numeric structure must not survive in ANY href, and no surah URL may be hand-written either:
// every one has to come from _quranPathFor, or the routes table stops being the single source of truth.
ok(!/href="\/quran\/surah\//.test(src), 'NO href anywhere still points at the retired /quran/surah/… structure');
const ROUTES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0/metadata/surah-routes.json'), 'utf8')).surahs;
const hardcoded = ROUTES.filter(r => src.includes('href="' + r.path + '"'));
ok(hardcoded.length === 0, 'NO surah slug is hard-coded into an href — all 114 are built by _quranPathFor'
   + (hardcoded.length ? ' — ' + JSON.stringify(hardcoded.slice(0, 3).map(r => r.path)) : ''));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
