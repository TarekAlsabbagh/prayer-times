# Admin Promote Batch — 2026-07-05T10:20:51.261Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (dirab)`
- curated entries: 3107 → 3108

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `dirab` | sa | ديراب | Dirab |

## Entries added

```json
[
  {
    "slug": "dirab",
    "type": "suburb",
    "countryCode": "sa",
    "lat": 24.4994755,
    "lng": 46.6254673,
    "timezone": "Asia/Riyadh",
    "names": {
      "ar": "ديراب",
      "en": "Dirab"
    },
    "aliases": {},
    "admin": {
      "countryAr": "المملكة العربية السعودية",
      "countryEn": "Saudi Arabia"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
