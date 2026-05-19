# PLACE-NAMES-UR-PK-1-APPLY — Apply audit trail

**Run at**: 2026-05-19T06:14:47.453Z
**Country**: PK
**aliases.ur added**: 0
**aliases.ur skipped (idempotent — already present)**: 3
**names.ur changed**: 0 (MUST be 0 per user rule §1)

## Applied aliases

| slug | alias added | reason |
| --- | --- | --- |

## All 10 PK entries — names.ur snapshot (must be unchanged)

| slug | names.ur |
| --- | --- |
| `faisalabad` | فیصل آباد |
| `hyderabad-pk` | حیدرآباد |
| `islamabad` | اسلام آباد |
| `karachi` | کراچی |
| `lahore` | لاہور |
| `multan` | ملتان |
| `peshawar` | پشاور |
| `quetta` | کوئٹہ |
| `rawalpindi` | راولپنڈی |
| `sialkot` | سیالکوٹ |

## Backup

Pre-apply backup written to: `C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json.prePlaceNamesUrPk1.bak`
Restore command: `cp curated-places.json.prePlaceNamesUrPk1.bak curated-places.json`

## What this apply did NOT do

- ❌ NO names.ur changes (all 10 PK seed names retained byte-for-byte)
- ❌ NO names.ar changes
- ❌ NO names.en changes
- ❌ NO new PK cities added (Bahawalpur/Gujranwala/Sargodha/Sukkur/Larkana/etc. out of scope)
- ❌ NO cleanup of duplicate aliases.ur (out of scope per user §3)
- ❌ NO code changes (server.js, js/app.js, fillLangMap, index.html)
- ❌ NO runtime translation
- ❌ NO translation API
- ❌ NO browser auto-translate dependency
