// Smoke — QURAN surah-end + prev/next nav (REVISION-4, corrected). The surah-end box keeps EXACTLY ONE
// "browse all surahs" button (de-duped) AND restores the prev(Ta-Ha 20)/next(Al-Hajj 22) navigation as two
// EQUAL cards. PROTOTYPE: cards are aria-disabled with a "coming soon" note and NO href (zero
// /quran/surah/{20,22} 404s); _QURAN_SURAHS_LIVE=false. The 114-generalization flips the flag → the SAME
// builder emits real /quran/surah/N links. Dynamic for every surah (Al-Fatiha no prev, An-Nas no next).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurah21Body()');
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
ok(nav.includes('سورة ${_quranEsc(chapter.nameAr)}'), 'surah NAME shown prominently (dynamic nameAr)');
ok(nav.includes('السورة رقم ${_quranAr(chapter.number)}'), 'surah NUMBER shown as secondary');
ok(/quran-nav-arrow/.test(nav), 'a direction arrow is included');
ok(/if \(!chapter\) return ''/.test(nav), 'Al-Fatiha-no-prev / An-Nas-no-next handled (null → card omitted)');

// prototype safety: flag off, disabled + note, live-link gated, NO literal 404 links
ok(/_QURAN_SURAHS_LIVE = false/.test(src), 'prototype flag _QURAN_SURAHS_LIVE=false');
ok(/aria-disabled="true"/.test(nav) && nav.includes('ستتوفر عند إطلاق جميع سور القرآن'), 'prototype cards are aria-disabled with a coming-soon note');
ok(/if \(_QURAN_SURAHS_LIVE\)[\s\S]*href="\/quran\/surah\/\$\{chapter\.number\}"/.test(nav), 'real /quran/surah/N link exists but is gated behind _QURAN_SURAHS_LIVE');
ok(!/href="\/quran\/surah\/20"/.test(src) && !/href="\/quran\/surah\/22"/.test(src), 'NO literal href to /quran/surah/20 or /22 (no 404s)');
ok(!/href="\/quran\/surah\/2[013-9]"/.test(src), 'NO literal sibling-surah href anywhere');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
