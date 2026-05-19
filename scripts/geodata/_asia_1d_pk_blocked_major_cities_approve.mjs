// scripts/geodata/_asia_1d_pk_blocked_major_cities_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1D-PK-MCF — approve 17 deferred PK major cities blocked by Stage 3.5
// in the ASIA-1D-PK clean merge (mixed_latin + mixed_unknown).
//
// User decision (2026-05-19): "approve all 17 with proposed NAME_AR_FIXES"
// per `reports/asia-1d-pk-mcf-review.md` with 8 specific overlay choices:
//   1. gujranwala  → غوجرانوالا (NOT غوجرانواله)
//   2. bannu       → بنو (no shadda; no بنوں alias — Urdu ں)
//   3. umarkot     → أمركوت (with initial hamza)
//   4. dera-ghazi-khan → ديرة غازي خان (tah marbuta; NOT country-suffix form)
//   5. kharian     → كهاريان (ں → ن conversion; no Urdu-ں alias)
//   6. badin       → بدين (strip invisible RLM U+200F)
//   7. chunian     → جونيان (strip admin prefix "تصيل")
//   8. Polluted aliases (Urdu ں, Pashto ټ/ې, Sindhi ڪ/ڙ, country suffix,
//      admin prefix, Latin mojibake, diacritics-heavy) — ALL DROPPED
//
// All 17 use bare slugs — 0 collisions, 0 renames per review §2.
//
// Mutates only pk-geonames-candidates.json. Idempotent re-run support.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CC = 'pk';

// Same character class as standard Arabic-quality gate
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۆۇۈېەڕڼ]/;
const LATIN = /[A-Za-z]/;
// Urdu ں (U+06BA) — explicitly invalid for PK MCF aliases per user §2,§5
const URDU_NUN_GHUNNA = /[ں]/;
// Pashto/Sindhi non-Arabic letters (extended per user §8)
const PASHTO_SINDHI = /[ټېڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;
// Invisible RLM/LRM/ZWJ/ZWNJ
const INVISIBLE_CONTROL = /[‎‏‌‍]/g;

function cleanArabicChars(s) {
    if (!s) return '';
    return String(s)
        .replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/پ/g, 'ب')
        .replace(/گ/g, 'غ').replace(/چ/g, 'ج').replace(/ٹ/g, 'ت')
        .replace(/ڈ/g, 'د').replace(/ڑ/g, 'ر').replace(/ہ/g, 'ه')
        .replace(/ے/g, 'ي').replace(/ۀ/g, 'ه').replace(/ۆ/g, 'و')
        .replace(/ڕ/g, 'ر').replace(/ە/g, 'ه')
        .replace(/ښ/g, 'ش').replace(/ګ/g, 'غ').replace(/څ/g, 'ج')
        .replace(/ځ/g, 'ز').replace(/ډ/g, 'د').replace(/ړ/g, 'ر')
        .replace(/ڼ/g, 'ن')
        // Strip invisible control chars
        .replace(INVISIBLE_CONTROL, '');
}

function isCleanArabic(s) {
    if (!s) return false;
    const stripped = String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped)) return false;
    if (LATIN.test(stripped))  return false;
    if (URDU_NUN_GHUNNA.test(stripped)) return false;
    if (PASHTO_SINDHI.test(stripped)) return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

// Aliases EXPLICITLY DROPPED per user §8 (in addition to clean-check fails):
//   - Country suffix variants (، باكستان)
//   - Admin prefix (تصيل)
//   - Diacritics-heavy variants matching the canonical primary
//   - Semantic mismatches (chitral's جهترار)
const DROP_ALIAS_IF_CONTAINS = [
    '، باكستان', // country suffix
    'تصيل',      // admin prefix
];
const DROP_ALIAS_EXACT = {
    'chitral':  new Set(['جهترار']),               // semantic mismatch (different word)
    'sahiwal':  new Set(['ساهِيوال']),             // diacritics-heavy variant
    'lala-musa':new Set(['لاله موسيٰ']),           // alif-with-superscript variant
    'rawalakot':new Set(['rawlakwت'])              // Latin mojibake (also fails clean-check)
};

// ═══ FIXES — 17 entries with user-approved name.ar ═══
const FIXES = [
    { slug: 'gujranwala',      newAr: 'غوجرانوالا',     note: 'AR Wikipedia canonical (final ا, NOT ه)' },
    { slug: 'bannu',           newAr: 'بنو',            note: 'clean Wikipedia AR; user §2: no Urdu ں alias' },
    { slug: 'sahiwal',         newAr: 'ساهيوال',        note: 'promoted from existing clean alias' },
    { slug: 'dera-ghazi-khan', newAr: 'ديرة غازي خان', note: 'user §4: Wikipedia AR with tah marbuta; NO country suffix' },
    { slug: 'chiniot',         newAr: 'جنيوت',          note: 'promoted from existing clean alias (Pashto ټ dropped)' },
    { slug: 'muzaffargarh',    newAr: 'مظفر غره',       note: 'promoted from existing clean alias (country suffix dropped)' },
    { slug: 'jacobabad',       newAr: 'جيكب آباد',      note: 'with madda; promoted from existing clean alias' },
    { slug: 'umarkot',         newAr: 'أمركوت',         note: 'user §3: Wikipedia AR with initial hamza-on-alif' },
    { slug: 'new-mirpur-city', newAr: 'نيا ميربر شهر',  note: 'promoted from existing clean alias' },
    { slug: 'badin',           newAr: 'بدين',           note: 'user §6: strip invisible RLM (U+200F)' },
    { slug: 'kharian',         newAr: 'كهاريان',        note: 'user §5: ں → ن conversion (clean Arabic)' },
    { slug: 'gujar-khan',      newAr: 'غوجر خان',       note: 'promoted from existing clean alias (Urdu ں dropped)' },
    { slug: 'lala-musa',       newAr: 'لاله موسي',      note: 'promoted from existing clean alias' },
    { slug: 'chunian',         newAr: 'جونيان',         note: 'user §7: strip admin prefix "تصيل" (like mailsi)' },
    { slug: 'chitral',         newAr: 'جترال',          note: 'promoted from existing clean alias (semantic mismatch جهترار dropped)' },
    { slug: 'rohri',           newAr: 'روهري',          note: 'promoted from existing clean alias (Sindhi ڙ dropped)' },
    { slug: 'rawalakot',       newAr: 'راولاكوت',       note: 'promoted from existing clean alias (Latin mojibake dropped)' },
];

function main() {
    // Pre-flight: every newAr must pass clean-check + unique within wave
    const arErrors = [];
    const seenAr = new Map();
    for (const fix of FIXES) {
        if (!isCleanArabic(fix.newAr)) {
            arErrors.push(fix.slug + ' → newAr="' + fix.newAr + '" failed clean-check');
        }
        if (seenAr.has(fix.newAr)) {
            arErrors.push('DUP-AR: "' + fix.newAr + '" used by ' + seenAr.get(fix.newAr) + ' AND ' + fix.slug);
        }
        seenAr.set(fix.newAr, fix.slug);
    }
    if (arErrors.length) {
        console.error('[pk-mcf] FAILED — pre-flight:');
        for (const e of arErrors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[pk-mcf] pre-flight OK — ' + FIXES.length + ' NAME_AR_FIXES validated');

    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    let totalApproved = 0;
    let totalSkipped = 0;
    let totalAliasCleaned = 0;
    let totalAliasesDropped = 0;
    let totalAliasesPreserved = 0;
    const droppedReasons = [];

    for (const fix of FIXES) {
        const slug = fix.slug;
        const candidates = list.filter(e =>
            e.slug === slug
            && e.tier === 'high'
            && (e.status === 'pending'
                || (e.status === 'approved' && e.candidate.names.ar === fix.newAr))
        );
        if (!candidates.length) {
            console.error('[pk-mcf] FAILED — no blocked-high-tier entry for pk/' + slug);
            process.exit(1);
        }
        const alreadyApplied = candidates.find(c =>
            c.status === 'approved' && c.candidate.names.ar === fix.newAr
        );
        if (alreadyApplied) {
            console.log('[pk-mcf] pk/' + slug.padEnd(20) + ' SKIP (already applied)');
            totalSkipped++;
            continue;
        }

        const target = candidates[0];
        const oldAr = target.candidate.names.ar || '(empty)';

        // 1. Apply NAME_AR_FIX
        target.candidate.names.ar = fix.newAr;

        // 2. Clean aliases
        const inAliases = (target.candidate.aliases && target.candidate.aliases.ar) || [];
        const cleanedAliases = [];
        const seen = new Set([fix.newAr]);
        let cleanedCount = 0;
        let droppedCount = 0;
        let preservedCount = 0;

        const slugDropSet = DROP_ALIAS_EXACT[slug] || new Set();

        for (const orig of inAliases) {
            // Explicit drops (semantic mismatch, diacritics-heavy, etc.)
            if (slugDropSet.has(orig)) {
                droppedCount++;
                droppedReasons.push({ slug, alias: orig, reason: 'explicit-drop-per-user-decision' });
                continue;
            }
            // Drop if contains country suffix / admin prefix
            const drophit = DROP_ALIAS_IF_CONTAINS.find(p => orig.includes(p));
            if (drophit) {
                droppedCount++;
                droppedReasons.push({ slug, alias: orig, reason: 'contains "' + drophit + '"' });
                continue;
            }
            const cleaned = cleanArabicChars(orig);
            if (cleaned && isCleanArabic(cleaned) && !seen.has(cleaned)) {
                cleanedAliases.push(cleaned);
                seen.add(cleaned);
                if (cleaned !== orig) cleanedCount++;
                else preservedCount++;
            } else {
                droppedCount++;
                droppedReasons.push({ slug, alias: orig, reason: 'failed-clean-check' });
            }
        }
        target.candidate.aliases = target.candidate.aliases || {};
        target.candidate.aliases.ar = cleanedAliases;
        totalAliasCleaned += cleanedCount;
        totalAliasesDropped += droppedCount;
        totalAliasesPreserved += preservedCount;

        // 3. Flip status + arQuality
        target.status = 'approved';
        target.pendingAfterArGate = true;
        target.arQuality = {
            quality: 'manual',
            detail: 'user-supplied canonical Arabic via ASIA-1D-PK-MCF',
            fromArTag: false,
        };

        totalApproved++;
        console.log('[pk-mcf] pk/' + slug.padEnd(20) +
            ' ar:"' + (oldAr.slice(0, 22) || '').padEnd(22) + '" → "' + fix.newAr + '"' +
            '  aliases=' + inAliases.length + '→' + cleanedAliases.length +
            '  (' + fix.note + ')');
    }

    fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');

    console.log('');
    console.log('═══ ASIA-1D-PK-MCF — Summary ═══');
    console.log('  Total approved (new):                       ' + totalApproved);
    console.log('  Total skipped (idempotent):                 ' + totalSkipped);
    console.log('  Aliases cleaned (Persian/Sindhi→Arabic):    ' + totalAliasCleaned);
    console.log('  Aliases preserved (already clean):          ' + totalAliasesPreserved);
    console.log('  Aliases dropped (mojibake/script-mismatch/admin/suffix): ' + totalAliasesDropped);
    if (droppedReasons.length) {
        console.log('');
        console.log('  Dropped aliases (audit trail):');
        for (const d of droppedReasons) {
            console.log('    pk/' + d.slug.padEnd(20) + ' "' + d.alias + '" (' + d.reason + ')');
        }
    }
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs pk');
}

main();
