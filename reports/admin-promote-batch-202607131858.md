# Admin Promote Batch — 2026-07-13T18:58:07.710Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (schenefeld)`
- curated entries: 3112 → 3113

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `schenefeld` | de | شنفلد | Schenefeld |

## Entries added

```json
[
  {
    "slug": "schenefeld",
    "type": "town",
    "countryCode": "de",
    "lat": 53.600266,
    "lng": 9.836387,
    "timezone": "Europe/Berlin",
    "names": {
      "ar": "شنفلد",
      "en": "Schenefeld"
    },
    "aliases": {},
    "admin": {
      "countryAr": "ألمانيا",
      "countryEn": "Germany"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
