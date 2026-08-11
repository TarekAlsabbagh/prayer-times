# Admin Promote Batch — 2026-08-11T23:32:29.746Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (komesarac)`
- curated entries: 3116 → 3117

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `komesarac` | hr | كوميساراك | Komesarac |

## Entries added

```json
[
  {
    "slug": "komesarac",
    "type": "village",
    "countryCode": "hr",
    "lat": 45.1112335,
    "lng": 15.7436398,
    "timezone": "Europe/Zagreb",
    "names": {
      "en": "Komesarac",
      "ar": "كوميساراك"
    },
    "aliases": {},
    "admin": {
      "countryAr": "كرواتيا",
      "countryEn": "Croatia"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
