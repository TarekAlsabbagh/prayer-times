// scripts/geodata/_asia_1c_premerge_qa.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1C-PREMERGE-QA-1 — pre-merge quality assurance for passes-gate
// entries from ASIA-1C (JP + KR + HK + TW + MO).
// Generates a comprehensive QA report at:
//   reports/geodata-asia-1c-premerge-qa.md
//
// Does NOT modify candidates JSONs or curated-places.json.
//
// Checks performed (same 8 checks as prior waves):
//   1. Duplicate Arabic scan
//   2. Cross-set Arabic comparison
//   3. Incomplete compound names (City/-shi/-si etc. for CJK)
//   4. Aliases.ar Persian/Urdu/Latin pollution
//   5. Names.ar failing clean check
//   6. Bad slug pattern check
//   7. Watch-list collision review (user-specified)
//   8. Auto-derived major-cities-blocked recommendation
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { pathsFor, BASE_PATHS } from './_geonames_common.mjs';

const CCS = ['jp','kr','hk','tw','mo'];
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/;
const LATIN_IN_AR = /[A-Za-z]/;

// User-flagged watchlist for collision review (kickoff 2026-05-17)
const WATCHLIST = ['tokyo','osaka','kyoto','yokohama','nagoya','sapporo','sendai','nara','okinawa',
                   'seoul','busan','daegu','daejeon','incheon','hong-kong','macau','macao',
                   'taipei','kaohsiung','taichung','tainan',
                   'kobe','fukuoka','hiroshima','nagasaki'];

// Common compound-name tokens for ASIA-1C (CJK English transliteration patterns)
const COMPOUND_HINTS = {
    'city':         { en: 'city',         ar_expected: 'سيتي',     desc: '"X City"' },
    'island':       { en: 'island',       ar_expected: 'جزيرة',    desc: '"X Island"' },
    'bay':          { en: 'bay',          ar_expected: 'باي',      desc: '"X Bay"' },
    // CJK suffixes (Japanese: -shi=city, -ku=ward, -gun=district)
    'shi':          { en: '-shi',         ar_expected: 'شي',       desc: 'JP "-shi" city suffix (X-shi)' },
    'ku':           { en: '-ku',          ar_expected: 'كو',       desc: 'JP "-ku" ward suffix' },
    // Korean: -si=city
    'si':           { en: '-si',          ar_expected: 'سي',       desc: 'KR "-si" city suffix (X-si)' },
    'gun':          { en: '-gun',         ar_expected: 'غون',      desc: 'KR/JP "-gun" district' }
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
        const enRegex = new RegExp('\\b' + key.replace(/\./g, '\\.') + '\\b', 'i');
        if (enRegex.test(enLower)) {
            if (!arName.includes(hint.ar_expected)) {
                issues.push({ enToken: key, expected: hint.ar_expected, found: arName });
            }
        }
    }
    return issues.length > 0 ? issues : null;
}

function main() {
    // Load all candidates per cc
    const allCandidatesByCc = {};
    for (const cc of CCS) {
        allCandidatesByCc[cc] = JSON.parse(fs.readFileSync(pathsFor(cc).candidatesJson, 'utf8'));
    }

    // Build passes-gate list
    const passes = [];
    for (const cc of CCS) {
        for (const e of allCandidatesByCc[cc]) {
            if (e.status === 'pending' && e.tier === 'high' && e.pendingAfterArGate === true) {
                passes.push({ cc, entry: e });
            }
        }
    }
    console.log('[qa] loaded ' + passes.length + ' passes-gate entries');

    // Load existing curated for cross-comparison
    const curated = JSON.parse(fs.readFileSync(pathsFor('br').curatedPath, 'utf8'));
    const curatedByAr = new Map();
    for (const c of curated) {
        const ar = c.names && c.names.ar;
        if (ar) {
            if (!curatedByAr.has(ar)) curatedByAr.set(ar, []);
            curatedByAr.get(ar).push(c);
        }
    }
    const curatedSlugs = new Set(curated.map(x => x.slug));

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

    // === Check 4: Aliases.ar Persian/Urdu/Latin pollution ===
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

    // === Check 5: Re-verify name.ar passes the clean check ===
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

        const blockedSameSlug = [];
        for (const cc of CCS) {
            const list = allCandidatesByCc[cc];
            const blocked = list.filter(e =>
                e.slug === slug && e.status === 'pending' && e.tier === 'high'
                && e.pendingAfterArGate === false
            );
            for (const b of blocked) blockedSameSlug.push({
                cc, pop: b.candidate.population,
                ar: b.candidate.names.ar,
                arQ: b.arQuality && b.arQuality.quality,
                region: b.candidate.admin && b.candidate.admin.regionEn,
                collisionInWave: b.collisionInWave,
                collisionAgainstCurated: b.collisionAgainstCurated
            });
        }

        if (inWave.length || inCurated.length || inCuratedSuffixed.length || blockedSameSlug.length) {
            watchHits.push({
                slug,
                curatedOwner: inCurated.length ? inCurated[0].countryCode : null,
                curatedOwnerAr: inCurated.length ? (inCurated[0].names && inCurated[0].names.ar) : null,
                curatedSuffixed: inCuratedSuffixed.map(c => c.slug + ' [' + c.countryCode + ']'),
                passingGateInWave: inWave.map(p => ({
                    cc: p.cc,
                    pop: p.entry.candidate.population,
                    ar: p.entry.candidate.names.ar,
                    region: p.entry.candidate.admin && p.entry.candidate.admin.regionEn
                })),
                blockedInWave: blockedSameSlug
            });
        }
    }

    // === Check 8: Auto-derived major-cities-blocked recommendation ===
    // For each cc, find blocked high-tier entries with pop >= 200k OR PPLC/PPLA
    // and surface them as candidates for a future MAJOR-CITIES-FIX phase.
    const majorBlockedAutoReco = [];
    for (const cc of CCS) {
        const list = allCandidatesByCc[cc];
        for (const e of list) {
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
                        cc, slug: e.slug, pop, fc: c.featureCode,
                        ar: c.names.ar, en: c.names.en,
                        issue,
                        suggestedRename: e.suggestedSlugIfCollision || ''
                    });
                }
            }
        }
    }
    majorBlockedAutoReco.sort((a, b) => b.pop - a.pop);

    // === Build markdown report ===
    const lines = [];
    lines.push('# ASIA-1C Pre-Merge QA Report');
    lines.push('');
    lines.push('**Wave**: `CURATED-GEODATA-ASIA-1C`');
    lines.push('**Countries**: ' + CCS.map(c => c.toUpperCase()).join(', '));
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('**Passes-gate entries scanned**: ' + passes.length);
    lines.push('');

    lines.push('## Top-line counts');
    lines.push('');
    lines.push('| Check | Hits |');
    lines.push('| --- | ---: |');
    lines.push('| Duplicate Arabic names within passes-gate | **' + dupsInWave.length + '** |');
    lines.push('| Passes-gate Arabic matching existing curated entry | **' + dupsAgainstCurated.length + '** |');
    lines.push('| Incomplete compound names (City/Beach/San/etc.) | **' + incompleteNames.length + '** |');
    lines.push('| Aliases.ar with Persian/Urdu/Latin pollution | **' + dirtyAliases.length + '** |');
    lines.push('| Names.ar failing clean check (should be 0) | **' + dirtyNamesAr.length + '** |');
    lines.push('| Bad slugs | **' + badSlugs.length + '** |');
    lines.push('| Watch-list slugs touched | **' + watchHits.length + '** |');
    lines.push('| Major-blocked candidates (auto-derived) | **' + majorBlockedAutoReco.length + '** |');
    lines.push('');

    // Section 1: Dup-Arabic within wave
    lines.push('## ① Duplicate Arabic within passes-gate (' + dupsInWave.length + ')');
    lines.push('');
    if (!dupsInWave.length) {
        lines.push('_✅ No duplicates — every entry has a unique Arabic name._');
        lines.push('');
    } else {
        lines.push('Each row shows entries with **identical** `names.ar`. Likely indicates a wrong/templated transliteration.');
        lines.push('');
        lines.push('| name.ar | cc/slug | en |');
        lines.push('| --- | --- | --- |');
        for (const dup of dupsInWave) {
            for (const p of dup.list) {
                lines.push('| `' + dup.ar + '` | ' + p.cc + '/' + p.entry.slug + ' | ' + p.entry.candidate.names.en + ' |');
            }
        }
        lines.push('');
    }

    // Section 2: Dup against curated
    lines.push('## ② Passes-gate Arabic matches existing curated (' + dupsAgainstCurated.length + ')');
    lines.push('');
    if (!dupsAgainstCurated.length) {
        lines.push('_✅ No collisions against existing curated by Arabic name._');
        lines.push('');
    } else {
        lines.push('Each row shows a passes-gate entry whose `names.ar` is also used by an existing curated entry. The user may want to verify these are genuinely different cities (or fix the Arabic).');
        lines.push('');
        lines.push('| wave cc/slug | wave en | shared ar | existing curated |');
        lines.push('| --- | --- | --- | --- |');
        for (const d of dupsAgainstCurated) {
            const existing = d.curated.map(c => c.cc + '/' + c.slug).join(', ');
            lines.push('| ' + d.wave.cc + '/' + d.wave.slug + ' | ' + d.wave.en + ' | `' + d.wave.ar + '` | ' + existing + ' |');
        }
        lines.push('');
    }

    // Section 3: Incomplete compound names
    lines.push('## ③ Incomplete compound names (' + incompleteNames.length + ')');
    lines.push('');
    if (!incompleteNames.length) {
        lines.push('_✅ No incomplete compound names detected._');
        lines.push('');
    } else {
        lines.push('English name contains a common suffix/prefix (City, Beach, San, Santa, São, etc.) but the Arabic name does not include the corresponding Arabic translation. Likely incomplete.');
        lines.push('');
        lines.push('| cc/slug | en | current ar | missing Arabic for English token |');
        lines.push('| --- | --- | --- | --- |');
        for (const item of incompleteNames) {
            const issuesStr = item.issues.map(i => '`' + i.enToken + '` → expects `' + i.expected + '`').join('; ');
            lines.push('| ' + item.cc + '/' + item.slug + ' | ' + item.en + ' | `' + item.ar + '` | ' + issuesStr + ' |');
        }
        lines.push('');
    }

    // Section 4: Aliases pollution
    lines.push('## ④ Aliases.ar with Persian/Urdu/Latin pollution (' + dirtyAliases.length + ')');
    lines.push('');
    if (!dirtyAliases.length) {
        lines.push('_✅ All aliases.ar across passes-gate are clean._');
        lines.push('');
    } else {
        lines.push('Auto-cleaning could be applied via the same rules as EUROPE-3 alias fix (`ی→ي ک→ك پ→ب گ→غ` etc.). Listing top 30:');
        lines.push('');
        lines.push('| cc/slug | name.ar | dirty alias(es) |');
        lines.push('| --- | --- | --- |');
        for (const item of dirtyAliases.slice(0, 30)) {
            lines.push('| ' + item.cc + '/' + item.slug + ' | `' + item.ar + '` | `' + item.dirty.join('` ، `') + '` |');
        }
        if (dirtyAliases.length > 30) {
            lines.push('');
            lines.push('_(... ' + (dirtyAliases.length - 30) + ' more — see candidates JSON)_');
        }
        lines.push('');
    }

    // Section 5: Names.ar that fail clean check (defense-in-depth)
    lines.push('## ⑤ Names.ar failing clean-check (defense-in-depth) (' + dirtyNamesAr.length + ')');
    lines.push('');
    if (!dirtyNamesAr.length) {
        lines.push('_✅ All passes-gate names.ar pass the clean-check (Stage 3.5 worked correctly)._');
        lines.push('');
    } else {
        lines.push('| cc/slug | en | ar |');
        lines.push('| --- | --- | --- |');
        for (const item of dirtyNamesAr) {
            lines.push('| ' + item.cc + '/' + item.slug + ' | ' + item.en + ' | `' + item.ar + '` |');
        }
        lines.push('');
    }

    // Section 6: Bad slugs
    lines.push('## ⑥ Bad slugs (' + badSlugs.length + ')');
    lines.push('');
    if (!badSlugs.length) {
        lines.push('_✅ All slugs match the safe pattern `[a-z0-9][a-z0-9-]{0,79}`._');
        lines.push('');
    } else {
        for (const b of badSlugs) lines.push('  - ' + b.cc + '/' + b.slug);
        lines.push('');
    }

    // Section 7: Watch-list collision review
    lines.push('## ⑦ Watch-list collision review (' + watchHits.length + ')');
    lines.push('');
    lines.push('User-flagged slugs: `' + WATCHLIST.join('`, `') + '`');
    lines.push('');
    if (!watchHits.length) {
        lines.push('_(no watch-list slugs touched by this wave)_');
        lines.push('');
    } else {
        lines.push('| slug | curated owner | curated suffixed | passes-gate hits | blocked hits | recommendation |');
        lines.push('| --- | --- | --- | --- | --- | --- |');
        for (const w of watchHits) {
            const ownerStr = w.curatedOwner
                ? '`' + w.curatedOwner + '` owns bare (`' + (w.curatedOwnerAr || '?') + '`)'
                : '_(free)_';
            const sufStr = w.curatedSuffixed.length ? w.curatedSuffixed.join(', ') : '—';
            const passes = w.passingGateInWave.map(p => p.cc + ':pop=' + p.pop + ' ar=`' + p.ar + '`').join(' • ') || '—';
            const blocked = w.blockedInWave.map(b => b.cc + ':pop=' + b.pop + ' (' + (b.arQ || '?') + ')').join(' • ') || '—';
            let rec = '';
            if (w.curatedOwner && w.passingGateInWave.length) {
                rec = '⚠️ wave entry must take `' + w.slug + '-<cc>` suffix (curated owns bare)';
            } else if (w.curatedOwner && w.blockedInWave.length) {
                rec = 'wave blocked; needs `' + w.slug + '-{cc}` rename + Arabic fix if user wants it';
            } else if (!w.curatedOwner && w.passingGateInWave.length >= 2) {
                rec = '⚠️ **MULTIPLE wave candidates** — user decides bare-slug winner, others get `-cc`';
            } else if (!w.curatedOwner && w.passingGateInWave.length === 1) {
                rec = 'wave claims `' + w.slug + '` bare — OK if no future-collision concern';
            } else if (!w.curatedOwner && w.blockedInWave.length) {
                rec = '⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix';
            }
            lines.push('| `' + w.slug + '` | ' + ownerStr + ' | ' + sufStr + ' | ' + passes + ' | ' + blocked + ' | ' + rec + ' |');
        }
        lines.push('');
    }

    // Section 8: Auto-derived major-cities-blocked recommendation
    lines.push('## ⑧ Major-cities-blocked auto-derived recommendation (' + majorBlockedAutoReco.length + ')');
    lines.push('');
    if (!majorBlockedAutoReco.length) {
        lines.push('_✅ No major-blocked candidates — wave is clean._');
        lines.push('');
    } else {
        lines.push('Major (pop ≥ 200,000 OR PPLC/PPLA) high-tier entries that are CURRENTLY BLOCKED.');
        lines.push('These are candidates for a future `ASIA-1C-BLOCKED-MAJOR-CITIES-FIX-1` mini-phase.');
        lines.push('Action: NOT for Stage 4 of this wave. User reviews after main wave merges.');
        lines.push('');
        lines.push('| cc | slug | pop | fc | current ar | en | issue | suggestedRename |');
        lines.push('| --- | --- | ---: | --- | --- | --- | --- | --- |');
        for (const m of majorBlockedAutoReco) {
            lines.push('| ' + m.cc + ' | `' + m.slug + '` | ' + m.pop.toLocaleString() + ' | ' + m.fc + ' | `' + (m.ar || '(empty)') + '` | ' + m.en + ' | ' + m.issue + ' | ' + (m.suggestedRename || '—') + ' |');
        }
        lines.push('');
    }

    // Section 9: Final counts + recommendations
    const dupCount = dupsInWave.reduce((s, d) => s + d.list.length, 0);
    const safeCount = Math.max(0,
        passes.length - dupCount - incompleteNames.length - dupsAgainstCurated.length - dirtyNamesAr.length);
    const needsManualFix = dupCount + incompleteNames.length + dupsAgainstCurated.length;
    lines.push('## Summary');
    lines.push('');
    lines.push('| Outcome | Count |');
    lines.push('| --- | ---: |');
    lines.push('| Total passes-gate scanned | ' + passes.length + ' |');
    lines.push('| **Safe-to-merge clean** (no dup, no incomplete, no semantic flag) | **~' + safeCount + '** |');
    lines.push('| Needs manual Arabic fix (dup OR incomplete OR ambiguous) | ~' + needsManualFix + ' |');
    lines.push('| Aliases need cleaning (cosmetic, not blocking) | ' + dirtyAliases.length + ' |');
    lines.push('| Major blocked (deferred to MAJOR-CITIES-FIX) | ' + majorBlockedAutoReco.length + ' |');
    lines.push('');

    lines.push('## Next steps');
    lines.push('');
    lines.push('Reply to the assistant with one of:');
    lines.push('');
    lines.push('- **`approve A — clean passes-gate only (~' + safeCount + ')`** — merge safe set; defer dup-arabic + incomplete to follow-up');
    lines.push('- **`approve A + decisions for watchlist`** — clean set + user-decided slug ownership for collision watchlist');
    lines.push('- **`fix arabic per row`** — give a list of (cc/slug → correct ar) pairs before any merge');
    lines.push('- **`exclude specific slugs`** — list slugs to drop entirely from this wave');
    lines.push('- **`run major-cities-fix first`** — handle the ' + majorBlockedAutoReco.length + ' blocked-major before any merge');
    lines.push('');
    lines.push('**No merge yet — Stage 4 awaits user approval.**');

    const outPath = path.join(BASE_PATHS.reportDir, 'geodata-asia-1c-premerge-qa.md');
    fs.writeFileSync(outPath, lines.join('\n'));
    console.log('[qa] wrote ' + outPath);

    // Console summary
    console.log('');
    console.log('═══ ASIA-1C Pre-Merge QA ═══');
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
    console.log('');
}

main();
