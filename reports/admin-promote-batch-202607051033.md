# Admin Promote Batch — 2026-07-05T10:33:54.244Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (miyashiro)`
- curated entries: 3109 → 3110

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `miyashiro` | jp | مياشيرو | Miyashiro |

## Entries added

```json
[
  {
    "slug": "miyashiro",
    "type": "town",
    "countryCode": "jp",
    "lat": 36.0227087,
    "lng": 139.722628,
    "timezone": "Asia/Tokyo",
    "names": {
      "ar": "مياشيرو",
      "en": "Miyashiro"
    },
    "aliases": {},
    "admin": {
      "countryAr": "اليابان",
      "countryEn": "Japan"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
