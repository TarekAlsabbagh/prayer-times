# Admin Promote Batch — 2026-07-06T10:59:41.376Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (qubtan)`
- curated entries: 3109 → 3110

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `qubtan` | sy | قبتان | Qubtan |

## Entries added

```json
[
  {
    "slug": "qubtan",
    "type": "village",
    "countryCode": "sy",
    "lat": 36.5265146,
    "lng": 37.3637779,
    "timezone": "Asia/Damascus",
    "names": {
      "ar": "قبتان",
      "de": "Kubtan",
      "en": "Qubtan"
    },
    "aliases": {},
    "admin": {
      "countryAr": "سوريا",
      "countryEn": "Syria"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
