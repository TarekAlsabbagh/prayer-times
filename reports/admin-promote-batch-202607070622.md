# Admin Promote Batch — 2026-07-07T06:22:51.541Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (saad)`
- curated entries: 3111 → 3112

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `saad` | sa | سعد | Saad |

## Entries added

```json
[
  {
    "slug": "saad",
    "type": "town",
    "countryCode": "sa",
    "lat": 25.1006266,
    "lng": 47.5694127,
    "timezone": "Asia/Riyadh",
    "names": {
      "ar": "سعد",
      "en": "Saad"
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
