/*
 * _smoke_quran_font_amiri_glyphs_1.mjs
 * Proves the Quran reading font is the official open-licensed Amiri Quran (SIL OFL), vendored unmodified,
 * covers every codepoint of the Tanzil Uthmani text (0 missing glyphs), is wired into css/quran.css, and
 * that the old KFGQPC font is fully gone. Pure-Node cmap parser (formats 4 + 12). Run from the repo root.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONTS = path.join(ROOT, 'fonts');
const TTF = path.join(FONTS, 'AmiriQuran-Regular.ttf');
const BASE = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
const sha = b => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; } else { fail++; console.error('  FAIL: ' + m); } };

// ---- font file + provenance manifest ----
ok(fs.existsSync(TTF), 'fonts/AmiriQuran-Regular.ttf exists');
const buf = fs.readFileSync(TTF);
const manifest = JSON.parse(fs.readFileSync(path.join(FONTS, 'AmiriQuran-Regular.manifest.json'), 'utf8'));
ok(sha(buf) === manifest.sha256, 'font file SHA-256 matches its manifest (' + manifest.sha256 + ')');
ok(buf.readUInt32BE(0) === 0x00010000, 'font is a valid TrueType (sfnt 0x00010000)');
ok(manifest.family === 'AmiriQuran' && /Amiri Quran/.test(manifest.displayName), "manifest family is 'AmiriQuran' (Amiri Quran)");
ok(manifest.version === '1.003' && /aliftype\/amiri/.test(manifest.source), 'manifest records official aliftype version 1.003 + source URL');
ok(/Open Font License/i.test(manifest.license) && manifest.modified === false && manifest.subset === false, 'manifest declares OFL + unmodified + not subset');

// ---- OFL license file ----
const ofl = fs.readFileSync(path.join(FONTS, 'LICENSE-AMIRI.txt'), 'utf8');
ok(/SIL OPEN FONT LICENSE/i.test(ofl) && /Amiri Quran/.test(ofl) && /Khaled Hosny/.test(ofl), 'LICENSE-AMIRI.txt is the SIL OFL naming Amiri Quran + Khaled Hosny');

// ---- css wiring: @font-face → this ttf, reading stacks prefer it, NO KFGQPC anywhere ----
const css = fs.readFileSync(path.join(ROOT, 'css', 'quran.css'), 'utf8');
ok(/@font-face\s*\{[^}]*font-family:\s*'AmiriQuran'[^}]*AmiriQuran-Regular\.ttf[^}]*\}/s.test(css), 'css @font-face AmiriQuran → AmiriQuran-Regular.ttf');
ok(/font-display:\s*swap/.test(css), 'css @font-face uses font-display: swap');
ok(!/KFGQPCHafs|uthmanic_hafs/i.test(css), 'no KFGQPC references remain in css/quran.css');
ok(!fs.existsSync(path.join(FONTS, 'uthmanic_hafs_v20.ttf')), 'old KFGQPC font file fonts/uthmanic_hafs_v20.ttf is removed');

// ---- parse cmap (formats 4 + 12) ----
function coveredCodepoints(b) {
    const numTables = b.readUInt16BE(4); let cmapOff = 0;
    for (let i = 0; i < numTables; i++) { const r = 12 + i * 16; if (b.toString('latin1', r, r + 4) === 'cmap') cmapOff = b.readUInt32BE(r + 8); }
    const n = b.readUInt16BE(cmapOff + 2); let best = null;
    for (let i = 0; i < n; i++) {
        const r = cmapOff + 4 + i * 8, plat = b.readUInt16BE(r), enc = b.readUInt16BE(r + 2), subOff = cmapOff + b.readUInt32BE(r + 4), fmt = b.readUInt16BE(subOff);
        const uni = plat === 0 || (plat === 3 && (enc === 1 || enc === 10));
        if (!uni) continue;
        if (fmt === 12) best = { fmt, subOff }; else if (fmt === 4 && !(best && best.fmt === 12)) best = best || { fmt, subOff };
    }
    const set = new Set();
    if (best && best.fmt === 4) {
        const o = best.subOff, segX2 = b.readUInt16BE(o + 6), sc = segX2 / 2, endO = o + 14, startO = endO + segX2 + 2, deltaO = startO + segX2, rangeO = deltaO + segX2;
        for (let s = 0; s < sc; s++) {
            const end = b.readUInt16BE(endO + s * 2), start = b.readUInt16BE(startO + s * 2), delta = b.readUInt16BE(deltaO + s * 2), ro = b.readUInt16BE(rangeO + s * 2);
            for (let c = start; c <= end && c !== 0xFFFF; c++) { let g; if (ro === 0) g = (c + delta) & 0xFFFF; else { const gi = rangeO + s * 2 + ro + (c - start) * 2; g = gi + 1 >= b.length ? 0 : b.readUInt16BE(gi); if (g) g = (g + delta) & 0xFFFF; } if (g) set.add(c); }
        }
    } else if (best && best.fmt === 12) {
        const o = best.subOff, ng = b.readUInt32BE(o + 12);
        for (let gi = 0; gi < ng; gi++) { const g = o + 16 + gi * 12, s = b.readUInt32BE(g), e = b.readUInt32BE(g + 4); for (let c = s; c <= e; c++) set.add(c); }
    }
    return set;
}
const covered = coveredCodepoints(buf);
ok(covered.size > 0, 'font cmap parsed (covers ' + covered.size + ' codepoints)');

// ---- every codepoint used by the Tanzil verse text + basmala must be covered ----
const used = new Set();
for (let n = 1; n <= 114; n++) { const s = JSON.parse(fs.readFileSync(path.join(BASE, 'surahs', String(n).padStart(3, '0') + '.json'), 'utf8')); for (const a of s.ayahs) for (const ch of a.textUthmaniBody) used.add(ch.codePointAt(0)); }
const bas = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata', 'basmala.json'), 'utf8')); for (const ch of (bas.textUthmaniBody || '')) used.add(ch.codePointAt(0));
const missing = [...used].filter(cp => !covered.has(cp));
ok(missing.length === 0, 'Amiri Quran covers ALL ' + used.size + ' Tanzil text codepoints — 0 missing glyphs' + (missing.length ? ' (missing ' + missing.map(c => 'U+' + c.toString(16).toUpperCase()).join(',') + ')' : ''));

console.log((fail === 0 ? 'PASS' : 'FAIL') + ': _smoke_quran_font_amiri_glyphs_1 — ' + pass + ' passed, ' + fail + ' failed');
if (fail === 0) console.log('  OFFICIAL AMIRI QURAN (OFL) VENDORED, WIRED, 0 MISSING GLYPHS, ZERO KFGQPC FONT');
process.exitCode = fail ? 1 : 0;
