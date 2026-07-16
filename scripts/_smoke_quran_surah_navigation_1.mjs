// Smoke — QURAN surah-end + prev/next nav (REVISION-4, corrected). The surah-end box keeps EXACTLY ONE
// "browse all surahs" button (de-duped) AND restores the prev(Ta-Ha 20)/next(Al-Hajj 22) navigation as two
// EQUAL cards. PROTOTYPE: cards are aria-disabled with a "coming soon" note and NO href (zero
// /quran/surah/{20,22} 404s); _QURAN_SURAHS_LIVE=false. The 114-generalization flips the flag → the SAME
// builder emits real /quran/surah/N links. Dynamic for every surah (Al-Fatiha no prev, An-Nas no next).
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
ok(/<a class="quran-surah-nav-card quran-surah-nav-card--\$\{kind\}" href="\/quran\/surah\/\$\{chapter\.number\}"/.test(nav), 'every neighbour card is an unconditional real link to /quran/surah/N');
ok(/if \(!chapter\) return '';/.test(nav), 'a missing neighbour (Al-Fatiha prev / An-Nas next) renders NOTHING — never a dead card');
ok(!/href="\/quran\/surah\/20"/.test(src) && !/href="\/quran\/surah\/22"/.test(src), 'NO literal href to /quran/surah/20 or /22 (no 404s)');
ok(!/href="\/quran\/surah\/2[013-9]"/.test(src), 'NO literal sibling-surah href anywhere');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
