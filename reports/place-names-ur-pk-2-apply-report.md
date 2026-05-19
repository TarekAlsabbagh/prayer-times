# PLACE-NAMES-UR-PK-2-APPLY — Apply audit trail

**Run at**: 2026-05-19T08:42:31.700Z
**Country**: PK (43 new ASIA-1D-PK entries only)
**Total rows applied**: 0
**Already-applied (skipped, idempotent)**: 43
**names.ur newly set (was absent)**: 0
**names.ur overwrote an existing value**: 0
**aliases.ur added**: 0
**10 PK seed entries touched (must be 0)**: 0

## Applied rows (sorted by slug)

| slug | names.ur applied | aliases.ur added |
| --- | --- | ---: |

## Aliases explicitly NOT added (review §6 + user §7-8 audit)

| slug | dropped alias | reason |
| --- | --- | --- |
| `bahawalnagar` | `بہاولپور` | Cross-city collision: this is "Bahawalpur" (different city in same region). Same semantic mismatch we already fixed in ASIA-1D-PK names.ar. |
| `mailsi` | `تصیل میلسی` | Admin-area prefix "تصیل" (misspelling of "تحصیل" = sub-district). Not the city name itself. |
| `mingora` | `مینګورہ` | Contains Pashto ګ (U+06AB) — fails clean-Urdu-script check |
| `jaranwala` | `جړانواله` | Contains Pashto ړ — fails check |
| `jaranwala` | `جڙانوالا` | Contains Sindhi ڙ — fails check |
| `sambrial` | `سمبڙیال` | Contains Sindhi ڙ — fails check (but kept the non-retroflex form) |
| `pattoki` | `پتوڪي` | Contains Sindhi ڪ — fails check |
| `muridke` | `مريدڪي` | Contains Sindhi ڪ — fails check |
| `kabirwala` | `ڪبير والا` | Contains Sindhi ڪ — fails check |
| `kamalia` | `ڪماليه` | Contains Sindhi ڪ — fails check |
| `jhelum` | `جێھلۆم` | Contains Kurdish ێ + ۆ — fails check |
| `muridke` | `موریدک` | Truncated/alt form — questionable |
| `muridke` | `موريدكى` | Latin-form mojibake |
| `muridke` | `موريدكي` | Latin-form mojibake |

## Backup

Pre-apply backup written to: `C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json.prePlaceNamesUrPk2.bak`
Restore command: `cp curated-places.json.prePlaceNamesUrPk2.bak curated-places.json`

## What this apply did NOT do

- ❌ `names.ar` not modified (preserves ASIA-1D-PK 3 NAME_AR_FIXES)
- ❌ `names.en` not modified
- ❌ 10 PK seed entries not touched (UR-PK-1 baseline preserved)
- ❌ Other countries not touched
- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html)
- ❌ No runtime translation
- ❌ No translation API
- ❌ No browser auto-translate dependency
