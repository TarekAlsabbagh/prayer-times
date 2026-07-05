# Admin Promote Batch — 2026-07-05T10:18:16.469Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (avellaneda)`
- curated entries: 3107 → 3108

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `avellaneda` | ar | أفيانيدا | Avellaneda |

## Entries added

```json
[
  {
    "slug": "avellaneda",
    "type": "city",
    "countryCode": "ar",
    "lat": -34.6648394,
    "lng": -58.3628061,
    "timezone": "America/Argentina/Buenos_Aires",
    "names": {
      "ar": "أفيانيدا",
      "en": "Avellaneda"
    },
    "aliases": {},
    "admin": {
      "countryAr": "الأرجنتين",
      "countryEn": "Argentina"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
