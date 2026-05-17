// scripts/geodata/persian_pregate_normalizer.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA — Stage 3.4: PERSIAN PRE-GATE NORMALIZER (standalone)
//
// Design phase: ASIA-1G-STAGE-3.4-PERSIAN-PREGATE-DESIGN-1
// Status: DESIGN ONLY — NOT integrated into main pipeline yet.
//
// Purpose:
//   Convert Persian / Urdu / Pashto / Uyghur letter variants in an
//   Arabic-script string to their canonical Arabic letter equivalents.
//
// Position in pipeline (when adopted):
//
//   Stage 1 — import_geonames.mjs          (raw download)
//   Stage 2 — normalize_places.mjs         (extract names + slug)
//   Stage 3 — validate_candidates.mjs      (tier + collisions)
//   Stage 3.4 — PERSIAN PRE-GATE  ← NEW    (this module, run BEFORE 3.5)
//   Stage 3.5 — arabic_quality_check.mjs   (Arabic-name QA gate)
//   Stage 4 — apply_curated_candidates.mjs (merge to curated)
//
// Why a "pre-gate" and not part of Stage 3.5?
//   Stage 3.5 *classifies* names — it does not mutate them. Mixing
//   normalization into the classifier would couple two concerns and
//   would mean a re-run of 3.5 silently changes data. Stage 3.4 is a
//   separate, opt-in transformation step. Its output replaces
//   names.ar BEFORE 3.5 runs; 3.5 then sees a clean Arabic string and
//   classifies it as 'wikidata' or 'arabic_only' instead of
//   'mixed_script'. Both behaviors stay observable in the per-row JSON.
//
// Reusability:
//   * IR (Iran) — Persian-script alternatenames in GeoNames
//   * AF (Afghanistan) — Persian + Pashto extensions
//   * Future: any country whose GeoNames Arabic is contaminated by
//     Persian variants (some KZ/UZ rows still slip Uyghur ۆ through —
//     the rule is already proven in ASIA-1I-MCF and ASIA-1H-MCF).
//
// Idempotent:
//   * Calling persianPregateClean twice yields the same output as once.
//   * Already-clean Arabic input is returned unchanged (changed=false).
//
// Safe-by-default:
//   * Maps cover ONLY visually/semantically equivalent letter pairs.
//   * It does NOT translate, transliterate, or guess a more-Arabic name.
//   * It does NOT touch Latin, digits, or punctuation.
//   * No semantic decisions: a wrong-city name like "جلال آباد" used for
//     Manas stays wrong — that's MCF territory (NAME_AR_FIXES), not 3.4.
// ─────────────────────────────────────────────────────────────────────────

// 1. Letter map (single-codepoint substitutions)
//
// Sources cross-checked against:
//   - Unicode 15.1 charts for Arabic (U+0600), Arabic Supplement (U+0750),
//     Arabic Extended-A (U+08A0), Arabic Extended-B (U+0870)
//   - aren.wikipedia.org guidance on Persian → Arabic transliteration
//   - The ad-hoc rules used in ASIA-1H-MCF and ASIA-1I-MCF
//     (already battle-tested, kg/manas + ge/sokhumi + many KZ aliases)
//
// Rules of inclusion:
//   * Letter is NOT in the standard Arabic 28-letter set.
//   * Letter has a single, unambiguous Arabic substitute that
//     preserves the pronunciation closely enough for Arabic readers.
//   * The substitute is already what curated entries use in practice.
//
// Letters DELIBERATELY EXCLUDED:
//   * گ → غ is the default Persian gaf mapping, but in some names گ
//     should stay as ك or ج. We default to غ; reviewers MAY override
//     via NAME_AR_FIXES per row.
//   * Hamza variants (ؤ ئ إ أ آ) are STANDARD Arabic — never rewritten.
//   * Tatweel ـ is left to a separate strip helper (it survives map).
//
export const PERSIAN_CHAR_MAP = Object.freeze({
    // ─── Persian core (Farsi) ───
    'ی': 'ي',   // U+06CC Persian yeh           → U+064A Arabic yeh
    'ک': 'ك',   // U+06A9 Persian keheh         → U+0643 Arabic kaf
    'پ': 'ب',   // U+067E peh                   → U+0628 ba
    'گ': 'غ',   // U+06AF gaf                   → U+063A ghain (default)
    'چ': 'ج',   // U+0686 tcheh                 → U+062C jim
    'ژ': 'ز',   // U+0698 jeh                   → U+0632 zay
    'ۀ': 'ه',   // U+06C0 heh + hamza above     → U+0647 ha

    // ─── Urdu extensions ───
    'ٹ': 'ت',   // U+0679 retroflex tteh        → ta
    'ڈ': 'د',   // U+0688 retroflex ddal        → dal
    'ڑ': 'ر',   // U+0691 retroflex rreh        → ra
    'ہ': 'ه',   // U+06C1 heh goal              → ha
    'ے': 'ي',   // U+06D2 bari yeh              → ya
    'ھ': 'ه',   // U+06BE heh doachashmee       → ha (rarely seen but safe)

    // ─── Pashto extensions ───
    'ښ': 'ش',   // U+069A seen with dot above   → shin
    'ګ': 'غ',   // U+06AB kaf with ring         → ghain (mirror گ default)
    'څ': 'ج',   // U+0685 hah with three dots above → jim
    'ځ': 'ز',   // U+0681 hah with hamza above  → zay
    'ډ': 'د',   // U+0689 dal with ring         → dal
    'ړ': 'ر',   // U+0693 reh with ring         → ra
    'ڼ': 'ن',   // U+06BC noon with ring        → noon

    // ─── Uyghur (stable since ASIA-1I-MCF, 2026-05-17) ───
    'ۆ': 'و',   // U+06C6 oe                    → waw

    // ─── Kurdish (rare but present in some IR rows) ───
    'ڕ': 'ر',   // U+0695 reh with small v      → ra
    'ڵ': 'ل',   // U+06B5 lam with small v      → lam
    'ۊ': 'و',   // U+06CA waw with two dots     → waw
});

// 2. Whitespace / formatting controls that must be stripped or replaced
//
//   * U+200C ZWNJ      — Persian word-internal separator. Strip to nothing.
//                        Arabic readers do not insert ZWNJ.
//   * U+200D ZWJ       — Strip.
//   * U+202C / U+202D / U+202E / U+202A / U+202B — directional overrides.
//                        Strip.
//   * U+0640 tatweel ـ — Strip (purely decorative).
//   * U+FEFF BOM       — Strip (in case GeoNames row has stray BOM).
//
const STRIP_CHARS = /[‌‍‪‫‬‭‮ـ﻿]/g;

// 3. The actual cleaner — pure function.
//
// Returns: { cleaned, changed, originalAr, perCharChanges }
//   * cleaned:        the normalized string
//   * changed:        true if cleaned !== originalAr
//   * originalAr:     the input string verbatim (for audit)
//   * perCharChanges: [{ from, to, count }] — useful for reports
//
// Safe on:
//   * '' / null / undefined         → returns { cleaned: '', changed: false, ... }
//   * already-clean Arabic          → changed=false, perCharChanges=[]
//   * mixed-script (Latin in)       → letters in Latin pass through unchanged
//                                     (Stage 3.5 will still flag mixed_latin)
//
export function persianPregateClean(ar) {
    const originalAr = (ar == null) ? '' : String(ar);
    if (!originalAr) {
        return { cleaned: '', changed: false, originalAr: '', perCharChanges: [] };
    }

    // First pass: drop ZWNJ / tatweel / BOM / direction marks
    let s = originalAr.replace(STRIP_CHARS, '');

    // Second pass: per-char Persian→Arabic substitution
    const counts = new Map();
    let out = '';
    for (const ch of s) {
        const sub = PERSIAN_CHAR_MAP[ch];
        if (sub !== undefined) {
            out += sub;
            counts.set(ch, (counts.get(ch) || 0) + 1);
        } else {
            out += ch;
        }
    }

    // Third pass: collapse runs of 2+ spaces that may now have appeared
    // after a tatweel strip (e.g. "حـاجـي" → "حاجي" not "ح اج ي").
    const cleaned = out.replace(/\s{2,}/g, ' ').trim();

    const perCharChanges = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([from, count]) => ({ from, to: PERSIAN_CHAR_MAP[from], count }));

    return {
        cleaned,
        changed: cleaned !== originalAr,
        originalAr,
        perCharChanges,
    };
}

// 4. Batch helper — for processing arrays of {slug, ar} during dry-runs.
//
// Does NOT write anywhere; the caller decides whether to apply the
// cleaned value to the entry's names.ar before passing the row to
// Stage 3.5.
//
export function persianPregateBatch(rows, { arField = 'ar' } = {}) {
    const report = {
        total: rows.length,
        changed: 0,
        unchanged: 0,
        empty: 0,
        topCharSubstitutions: new Map(),
    };
    const results = [];
    for (const row of rows) {
        const ar = row && row[arField];
        const r = persianPregateClean(ar);
        results.push({ row, result: r });
        if (!r.originalAr) report.empty++;
        else if (r.changed) report.changed++;
        else report.unchanged++;
        for (const { from, count } of r.perCharChanges) {
            report.topCharSubstitutions.set(
                from,
                (report.topCharSubstitutions.get(from) || 0) + count
            );
        }
    }
    // Convert map to sorted array for stable serialization
    report.topCharSubstitutions = [...report.topCharSubstitutions.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([from, count]) => ({ from, to: PERSIAN_CHAR_MAP[from], count }));
    return { results, report };
}

// 5. Re-export the map for tests / docs.
export default {
    PERSIAN_CHAR_MAP,
    persianPregateClean,
    persianPregateBatch,
};
