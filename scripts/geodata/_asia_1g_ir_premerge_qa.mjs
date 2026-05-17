// scripts/geodata/_asia_1g_ir_premerge_qa.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1G-IR-PREMERGE-QA-1 — pre-merge quality assurance for passes-gate
// entries from ASIA-1G-IR (Iran only).
//
// Inputs:
//   db/places/candidates/ir-geonames-candidates.json (post-Stage-3.4 + 3.5)
//   db/places/curated-places.json
//
// Output:
//   reports/geodata-asia-1g-ir-premerge-qa.md
//
// Does NOT modify any input. The 8 checks follow the established
// post-EUROPE-3 pattern adapted to Iran:
//   1. Duplicate Arabic within passes-gate
//   2. Cross-set duplicate against existing curated
//   3. Incomplete compound names (Iran's PPLA2 suffixes like -shahr)
//   4. Aliases.ar still containing Persian/Urdu/Latin
//   5. names.ar failing the clean-check (defense-in-depth)
//   6. Bad slug pattern
//   7. Watch-list collision review (user-flagged Iranian cities)
//   8. Auto-derived major-cities-blocked recommendation
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { pathsFor, BASE_PATHS } from './_geonames_common.mjs';

const CC = 'ir';

// Same regex as Stage 3.5 — Persian/Urdu/Pashto/Uyghur/Kurdish letters
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۆۇۈېەڕ]/;
const LATIN_IN_AR  = /[A-Za-z]/;

// User-flagged watchlist — 20 Iranian cities to scrutinize
const WATCHLIST = [
    'tehran', 'mashhad', 'isfahan', 'karaj', 'shiraz', 'tabriz',
    'qom', 'ahvaz', 'kermanshah', 'urmia', 'orumiyeh', 'rasht',
    'zahedan', 'hamadan', 'yazd', 'ardabil', 'bandar-abbas',
    'kerman', 'zanjan', 'sanandaj', 'qazvin'
];

// Persian compound-name hints — IR-specific
//   "-shahr" = شهر (city) — often appears in PPLA2 names like Khomeyni-shahr
//   "bandar" = بندر (port) — appears in Bandar-Abbas, Bushehr
const COMPOUND_HINTS = {
    'shahr': { en: 'shahr',  ar_expected: 'شهر',  desc: '"X-shahr"' },
    'abad':  { en: 'abad',   ar_expected: 'آباد', desc: '"X-abad"' },
    'kord':  { en: 'kord',   ar_expected: 'كرد',  desc: '"X-e Kord"' },
    'bandar':{ en: 'bandar', ar_expected: 'بندر', desc: '"Bandar X"' }
};

function isCleanArabic(name) {
    if (!name) return false;
    const stripped = String(name).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped)) return false;
    if (LATIN_IN_AR.test(stripped))  return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

function hasPersianOrUrduChars(name) {
    return PERSIAN_URDU.test(String(name || ''));
}

function detectIncompleteName(slug, enName, arName) {
    if (!enName || !arName) return null;
    const enLower = enName.toLowerCase();
    const issues = [];
    for (const [key, hint] of Object.entries(COMPOUND_HINTS)) {
        const enRegex = new RegExp('\\b' + key + '\\b', 'i');
        if (enRegex.test(enLower)) {
            if (!arName.includes(hint.ar_expected)) {
                issues.push({ enToken: key, expected: hint.ar_expected, found: arName });
            }
        }
    }
    return issues.length > 0 ? issues : null;
}

function main() {
    const entries = JSON.parse(fs.readFileSync(pathsFor(CC).candidatesJson, 'utf8'));
    const curated = JSON.parse(fs.readFileSync(pathsFor(CC).curatedPath, 'utf8'));

    // Build passes-gate list
    const passes = [];
    for (const e of entries) {
        if (e.status === 'pending' && e.tier === 'high' && e.pendingAfterArGate === true) {
            passes.push({ cc: CC, entry: e });
        }
    }
    console.log('[qa] loaded ' + passes.length + ' passes-gate entries');

    // Index curated by ar + slug
    const curatedByAr = new Map();
    for (const c of curated) {
        const ar = c.names && c.names.ar;
        if (ar) {
            if (!curatedByAr.has(ar)) curatedByAr.set(ar, []);
            curatedByAr.get(ar).push(c);
        }
    }

    // === Check 1: dup-Arabic within passes-gate ===
    const arCount = new Map();
    for (const p of passes) {
        const ar = p.entry.candidate.names.ar;
        if (!arCount.has(ar)) arCount.set(ar, []);
        arCount.get(ar).push(p);
    }
    const dupsInWave = [];
    for (const [ar, list] of arCount) {
        if (list.length > 1) dupsInWave.push({ ar, list });
    }

    // === Check 2: dup-Arabic against existing curated ===
    const dupsAgainstCurated = [];
    for (const p of passes) {
        const ar = p.entry.candidate.names.ar;
        if (curatedByAr.has(ar)) {
            const matching = curatedByAr.get(ar);
            dupsAgainstCurated.push({
                wave: { cc: p.cc, slug: p.entry.slug, en: p.entry.candidate.names.en, ar },
                curated: matching.map(c => ({ cc: c.countryCode, slug: c.slug }))
            });
        }
    }

    // === Check 3: Incomplete compound names ===
    const incompleteNames = [];
    for (const p of passes) {
        const c = p.entry.candidate;
        const issues = detectIncompleteName(p.entry.slug, c.names.en, c.names.ar);
        if (issues) {
            incompleteNames.push({
                cc: p.cc, slug: p.entry.slug, en: c.names.en, ar: c.names.ar,
                issues
            });
        }
    }

    // === Check 4: Aliases pollution ===
    const dirtyAliases = [];
    for (const p of passes) {
        const aliases = (p.entry.candidate.aliases && p.entry.candidate.aliases.ar) || [];
        const dirty = aliases.filter(a => hasPersianOrUrduChars(a) || LATIN_IN_AR.test(a));
        if (dirty.length) {
            dirtyAliases.push({
                cc: p.cc, slug: p.entry.slug, ar: p.entry.candidate.names.ar,
                dirty
            });
        }
    }

    // === Check 5: name.ar passes the clean-check ===
    const dirtyNamesAr = [];
    for (const p of passes) {
        const ar = p.entry.candidate.names.ar;
        if (!isCleanArabic(ar)) {
            dirtyNamesAr.push({ cc: p.cc, slug: p.entry.slug, en: p.entry.candidate.names.en, ar });
        }
    }

    // === Check 6: Slug validity ===
    const slugPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;
    const badSlugs = [];
    for (const p of passes) {
        if (!slugPattern.test(p.entry.slug)) {
            badSlugs.push({ cc: p.cc, slug: p.entry.slug });
        }
    }

    // === Check 7: Watch-list collision review ===
    const watchHits = [];
    for (const slug of WATCHLIST) {
        const inWave = passes.filter(p => p.entry.slug === slug);
        const inCurated = curated.filter(c => c.slug === slug);
        const inCuratedSuffixed = curated.filter(c => c.slug.startsWith(slug + '-'));

        const blockedSameSlug = entries.filter(e =>
            e.slug === slug && e.status === 'pending' && e.tier === 'high'
            && e.pendingAfterArGate === false
        );

        const matchedExisting = entries.filter(e =>
            e.slug === slug && e.status === 'existing'
        );

        if (inWave.length || inCurated.length || inCuratedSuffixed.length ||
            blockedSameSlug.length || matchedExisting.length) {
            watchHits.push({
                slug,
                curatedOwner: inCurated.length ? inCurated[0].countryCode : null,
                curatedOwnerAr: inCurated.length ? (inCurated[0].names && inCurated[0].names.ar) : null,
                curatedSuffixed: inCuratedSuffixed.map(c => c.slug + ' [' + c.countryCode + ']'),
                passingGateInWave: inWave.map(p => ({
                    cc: p.cc, pop: p.entry.candidate.population,
                    ar: p.entry.candidate.names.ar,
                    region: p.entry.candidate.admin && p.entry.candidate.admin.regionEn
                })),
                blockedInWave: blockedSameSlug.map(b => ({
                    cc: CC, pop: b.candidate.population, ar: b.candidate.names.ar,
                    arQ: b.arQuality && b.arQuality.quality
                })),
                matchedExisting: matchedExisting.map(b => ({ to: b.matchedExisting }))
            });
        }
    }

    // === Check 8: Auto-derived major-cities-blocked recommendation ===
    const majorBlockedAutoReco = [];
    for (const e of entries) {
        if (e.status === 'pending' && e.tier === 'high' && e.pendingAfterArGate === false) {
            const c = e.candidate;
            const pop = c.population || 0;
            const isAdmin = c.featureCode === 'PPLC' || c.featureCode === 'PPLA';
            const qualifies = (pop >= 200000) || isAdmin;
            if (qualifies) {
                let issue;
                if (e.collisionInWave) issue = 'wave-collision';
                else if (e.collisionAgainstCurated) issue = 'curated-collision: ' + e.collisionAgainstCurated.existingCc;
                else {
                    const q = (e.arQuality && e.arQuality.quality) || '?';
                    issue = 'ar-gate ' + q;
                }
                majorBlockedAutoReco.push({
                    cc: CC, slug: e.slug, pop, fc: c.featureCode,
                    ar: c.names.ar, en: c.names.en,
                    issue,
                    suggestedRename: e.suggestedSlugIfCollision || ''
                });
            }
        }
    }
    majorBlockedAutoReco.sort((a, b) => b.pop - a.pop);

    // === Build report ===
    const lines = [];
    lines.push('# ASIA-1G-IR Pre-Merge QA Report');
    lines.push('');
    lines.push('**Wave**: `CURATED-GEODATA-ASIA-1G-IR`');
    lines.push('**Country**: Iran (إيران)');
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('**Passes-gate entries scanned**: ' + passes.length);
    lines.push('');

    lines.push('## Top-line counts');
    lines.push('');
    lines.push('| Check | Hits |');
    lines.push('| --- | ---: |');
    lines.push('| Duplicate Arabic names within passes-gate | **' + dupsInWave.length + '** |');
    lines.push('| Passes-gate Arabic matching existing curated entry | **' + dupsAgainstCurated.length + '** |');
    lines.push('| Incomplete compound names | **' + incompleteNames.length + '** |');
    lines.push('| Aliases.ar with Persian/Urdu/Latin pollution | **' + dirtyAliases.length + '** |');
    lines.push('| Names.ar failing clean check (should be 0) | **' + dirtyNamesAr.length + '** |');
    lines.push('| Bad slugs | **' + badSlugs.length + '** |');
    lines.push('| Watch-list slugs touched | **' + watchHits.length + '** |');
    lines.push('| Major-blocked candidates (auto-derived) | **' + majorBlockedAutoReco.length + '** |');
    lines.push('');

    lines.push('## ① Duplicate Arabic within passes-gate (' + dupsInWave.length + ')');
    lines.push('');
    if (!dupsInWave.length) {
        lines.push('_✅ No duplicates — every entry has a unique Arabic name._');
    } else {
        lines.push('| name.ar | cc/slug | en |');
        lines.push('| --- | --- | --- |');
        for (const dup of dupsInWave) {
            for (const p of dup.list) {
                lines.push('| `' + dup.ar + '` | ' + p.cc + '/' + p.entry.slug + ' | ' + p.entry.candidate.names.en + ' |');
            }
        }
    }
    lines.push('');

    lines.push('## ② Passes-gate Arabic matches existing curated (' + dupsAgainstCurated.length + ')');
    lines.push('');
    if (!dupsAgainstCurated.length) {
        lines.push('_✅ No collisions against existing curated by Arabic name._');
    } else {
        lines.push('| wave cc/slug | wave en | shared ar | existing curated |');
        lines.push('| --- | --- | --- | --- |');
        for (const d of dupsAgainstCurated) {
            const existing = d.curated.map(c => c.cc + '/' + c.slug).join(', ');
            lines.push('| ' + d.wave.cc + '/' + d.wave.slug + ' | ' + d.wave.en + ' | `' + d.wave.ar + '` | ' + existing + ' |');
        }
    }
    lines.push('');

    lines.push('## ③ Incomplete compound names (' + incompleteNames.length + ')');
    lines.push('');
    if (!incompleteNames.length) {
        lines.push('_✅ No incomplete compound names detected._');
    } else {
        lines.push('| cc/slug | en | current ar | missing Arabic for English token |');
        lines.push('| --- | --- | --- | --- |');
        for (const item of incompleteNames) {
            const issuesStr = item.issues.map(i => '`' + i.enToken + '` → expects `' + i.expected + '`').join('; ');
            lines.push('| ' + item.cc + '/' + item.slug + ' | ' + item.en + ' | `' + item.ar + '` | ' + issuesStr + ' |');
        }
    }
    lines.push('');

    lines.push('## ④ Aliases.ar with Persian/Urdu/Latin pollution (' + dirtyAliases.length + ')');
    lines.push('');
    if (!dirtyAliases.length) {
        lines.push('_✅ All aliases.ar across passes-gate are clean (Stage 3.4 cleaned them in-place)._');
    } else {
        lines.push('| cc/slug | name.ar | dirty alias(es) |');
        lines.push('| --- | --- | --- |');
        for (const item of dirtyAliases.slice(0, 30)) {
            lines.push('| ' + item.cc + '/' + item.slug + ' | `' + item.ar + '` | `' + item.dirty.join('` ، `') + '` |');
        }
        if (dirtyAliases.length > 30) {
            lines.push('');
            lines.push('_(... ' + (dirtyAliases.length - 30) + ' more — see candidates JSON)_');
        }
    }
    lines.push('');

    lines.push('## ⑤ Names.ar failing clean-check (defense-in-depth) (' + dirtyNamesAr.length + ')');
    lines.push('');
    if (!dirtyNamesAr.length) {
        lines.push('_✅ All passes-gate names.ar pass the clean-check._');
    } else {
        lines.push('| cc/slug | en | ar |');
        lines.push('| --- | --- | --- |');
        for (const item of dirtyNamesAr) {
            lines.push('| ' + item.cc + '/' + item.slug + ' | ' + item.en + ' | `' + item.ar + '` |');
        }
    }
    lines.push('');

    lines.push('## ⑥ Bad slugs (' + badSlugs.length + ')');
    lines.push('');
    if (!badSlugs.length) {
        lines.push('_✅ All slugs match the safe pattern `[a-z0-9][a-z0-9-]{0,79}`._');
    } else {
        for (const b of badSlugs) lines.push('  - ' + b.cc + '/' + b.slug);
    }
    lines.push('');

    lines.push('## ⑦ Watch-list collision review (' + watchHits.length + ')');
    lines.push('');
    lines.push('User-flagged Iranian cities: `' + WATCHLIST.join('`, `') + '`');
    lines.push('');
    if (!watchHits.length) {
        lines.push('_(no watch-list slugs touched)_');
    } else {
        lines.push('| slug | curated owner | curated suffixed | wave passes-gate | wave blocked | matched-existing | recommendation |');
        lines.push('| --- | --- | --- | --- | --- | --- | --- |');
        for (const w of watchHits) {
            const ownerStr = w.curatedOwner
                ? '`' + w.curatedOwner + '` owns bare (`' + (w.curatedOwnerAr || '?') + '`)'
                : '_(free)_';
            const sufStr = w.curatedSuffixed.length ? w.curatedSuffixed.join(', ') : '—';
            const passes = w.passingGateInWave.map(p => 'pop=' + p.pop + ' ar=`' + p.ar + '`').join(' • ') || '—';
            const blocked = w.blockedInWave.map(b => 'pop=' + b.pop + ' (' + (b.arQ || '?') + ')').join(' • ') || '—';
            const existing = w.matchedExisting.map(b => 'matched=`' + b.to + '`').join(' • ') || '—';
            let rec = '';
            if (w.matchedExisting.length && !w.passingGateInWave.length && !w.blockedInWave.length) {
                rec = '✅ already curated';
            } else if (w.passingGateInWave.length) {
                rec = '⚠️ wave proposes new entry — review Arabic';
            } else if (w.blockedInWave.length) {
                rec = '⏭️ deferred to ASIA-1G-IR-MCF';
            } else {
                rec = '—';
            }
            lines.push('| `' + w.slug + '` | ' + ownerStr + ' | ' + sufStr + ' | ' + passes + ' | ' + blocked + ' | ' + existing + ' | ' + rec + ' |');
        }
    }
    lines.push('');

    lines.push('## ⑧ Major-cities-blocked auto-derived recommendation (' + majorBlockedAutoReco.length + ')');
    lines.push('');
    if (!majorBlockedAutoReco.length) {
        lines.push('_✅ No major-blocked candidates — Stage 3.4 rescued everything._');
    } else {
        lines.push('Major (pop ≥ 200k OR PPLC/PPLA) high-tier entries CURRENTLY BLOCKED. Candidates for a future `ASIA-1G-IR-MCF` mini-phase.');
        lines.push('');
        lines.push('| slug | pop | fc | current ar | en | issue | suggestedRename |');
        lines.push('| --- | ---: | --- | --- | --- | --- | --- |');
        for (const m of majorBlockedAutoReco) {
            lines.push('| `' + m.slug + '` | ' + m.pop.toLocaleString() + ' | ' + m.fc + ' | `' + (m.ar || '(empty)') + '` | ' + m.en + ' | ' + m.issue + ' | ' + (m.suggestedRename || '—') + ' |');
        }
    }
    lines.push('');

    const dupCount = dupsInWave.reduce((s, d) => s + d.list.length, 0);
    const safeCount = Math.max(0,
        passes.length - dupCount - incompleteNames.length - dupsAgainstCurated.length - dirtyNamesAr.length);
    lines.push('## Summary');
    lines.push('');
    lines.push('| Outcome | Count |');
    lines.push('| --- | ---: |');
    lines.push('| Total passes-gate scanned | ' + passes.length + ' |');
    lines.push('| **Safe-to-merge clean** | **~' + safeCount + '** |');
    lines.push('| Needs manual Arabic fix (dup OR incomplete) | ~' + (dupCount + incompleteNames.length + dupsAgainstCurated.length) + ' |');
    lines.push('| Aliases need cleaning (cosmetic, not blocking) | ' + dirtyAliases.length + ' |');
    lines.push('| Major blocked (deferred to MCF) | ' + majorBlockedAutoReco.length + ' |');
    lines.push('');

    lines.push('## Next steps');
    lines.push('');
    lines.push('Reply with one of:');
    lines.push('');
    lines.push('- **`approve A — clean passes-gate (~' + safeCount + ')`** — merge safe set');
    lines.push('- **`fix arabic per row`** — supply (slug → correct ar) before merge');
    lines.push('- **`exclude specific slugs`** — list slugs to drop');
    lines.push('- **`run major-cities-fix first`** — handle ' + majorBlockedAutoReco.length + ' blocked-major before merge');
    lines.push('');
    lines.push('**No merge yet — Stage 4 awaits user approval.**');

    const outPath = path.join(BASE_PATHS.reportDir, 'geodata-asia-1g-ir-premerge-qa.md');
    fs.writeFileSync(outPath, lines.join('\n'));
    console.log('[qa] wrote ' + outPath);

    console.log('');
    console.log('═══ ASIA-1G-IR Pre-Merge QA ═══');
    console.log('Passes-gate total:         ' + passes.length);
    console.log('Dup-Arabic within wave:    ' + dupsInWave.length);
    console.log('Dup against curated:       ' + dupsAgainstCurated.length);
    console.log('Incomplete compound names: ' + incompleteNames.length);
    console.log('Dirty aliases.ar:          ' + dirtyAliases.length);
    console.log('Bad names.ar:              ' + dirtyNamesAr.length);
    console.log('Bad slugs:                 ' + badSlugs.length);
    console.log('Watch-list hits:           ' + watchHits.length);
    console.log('Major-blocked candidates:  ' + majorBlockedAutoReco.length);
    console.log('');
    console.log('Estimated safe-to-merge:   ~' + safeCount);
}

main();
