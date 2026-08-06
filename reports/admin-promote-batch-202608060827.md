# Admin Promote Batch — 2026-08-06T08:27:34.367Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (dahab)`
- curated entries: 3115 → 3116

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `dahab` | eg | دهب | Dahab |

## Entries added

```json
[
  {
    "slug": "dahab",
    "type": "city",
    "countryCode": "eg",
    "lat": 28.4963633,
    "lng": 34.5145652,
    "timezone": "Africa/Cairo",
    "names": {
      "ar": "دهب",
      "en": "Dahab"
    },
    "aliases": {},
    "admin": {
      "countryAr": "مصر",
      "countryEn": "Egypt"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
