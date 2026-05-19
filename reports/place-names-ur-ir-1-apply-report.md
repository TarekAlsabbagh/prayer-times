# PLACE-NAMES-UR-IR-1 — Apply audit trail

**Run at**: 2026-05-19T05:23:21.039Z
**Country**: IR
**Total rows applied**: 0
**Already-applied (skipped, idempotent)**: 41
**names.ur newly set (was absent)**: 0
**names.ur overwrote a fillchain value**: 0
**aliases.ur added**: 0

## Applied rows (sorted by slug)

| slug | names.ur | aliases.ur added | was fillchain? |
| --- | --- | ---: | :-: |

## Aliases explicitly NOT added (review §5 + user §7-9 audit)

| slug | dropped alias | reason |
| --- | --- | --- |
| `qods` | `كَرَج` | Collision with karaj slug — would mis-route searches |
| `qods` | `قَلعِه هَسَن` | Diacritics-heavy variant of قلعہ حسن خان (already kept) |
| `arak` | `ساوه` | Collision with saveh slug — would mis-route searches |
| `karaj` | `کەرەج` | Contains Kurdish ـە (U+06D5) — fails clean-check |
| `sanandaj` | `سنە` | Contains Kurdish ـە — fails clean-check |
| `bandar-abbas` | `بەندەر عەباس` | Contains Kurdish ـە — fails clean-check |
| `qazvin` | `قەزوین` | Contains Kurdish ـە — fails clean-check |
| `ardabil` | `اَردِبيل` | Excessive diacritics — not typical Urdu form |
| `sanandaj` | `سِنَّ` | Diacritics-heavy (shadda + kasra) |
| `sanandaj` | `سِنِّه` | Diacritics-heavy variant |
| `bandar-abbas` | `بَندَرِ عَبّاس` | Diacritics-heavy variant |
| `bandar-abbas` | `بَندَر عَبّاسی` | Persian ezāfe form — rare in Urdu, more Persian-specific |
| `nazarabad` | `نَظَرابادِ بُزُرگ` | Diacritics-heavy long form |
| `khomeyni-shahr` | `سده` | Sedeh — different settlement, semantic mismatch |
| `pakdasht` | `پاک دشت` | Rare space-separated variant (canonical is joined پاکدشت) |
| `ilam` | `يلام` | Typo/alt short form — not a standard variant |
| `abadan` | `عبادان` | Mis-spelling with initial ع (should be آ/ا) |

## Deferred (NOT applied — per user §10)

| slug | names.ar | deferral reason |
| --- | --- | --- |
| `gorgan` | `اَستِر آباد` | Historical Astarabad name; modern Persian/Urdu uses گرگان — semantic-mismatch fix deferred to a future "deferred-Arabic-name-cleanup" wave |
| `pakdasht` | `مامازان` | Mamazan is the old village name; modern is پاکدشت — semantic-mismatch fix deferred (same as ASIA-1G-IR closure note) |
| `golestan` | `شهرك غلستان` | Typo `غلستان` should be `گلستان` (Persian گ) — typo fix deferred |

## Backup

Pre-apply backup written to: `C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json.prePlaceNamesUrIr1.bak`

Restore command: `cp curated-places.json.prePlaceNamesUrIr1.bak curated-places.json`

## What this apply did NOT do

- ❌ `names.ar` not modified
- ❌ `names.en` not modified
- ❌ 12 IR seed entries (already had real Urdu) not touched
- ❌ No other country touched
- ❌ No code changes (server.js, js/app.js, fillLangMap)
- ❌ No runtime translation
- ❌ No translation API
- ❌ No browser auto-translate dependency
