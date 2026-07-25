# Admin Promote Batch — 2026-07-25T00:48:31.170Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (haradh)`
- curated entries: 3114 → 3115

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `haradh` | sa | حرض | Haradh |

## Entries added

```json
[
  {
    "slug": "haradh",
    "type": "town",
    "countryCode": "sa",
    "lat": 24.1418987,
    "lng": 49.0529843,
    "timezone": "Asia/Riyadh",
    "names": {
      "ar": "حرض",
      "en": "Haradh"
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
