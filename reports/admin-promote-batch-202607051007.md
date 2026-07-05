# Admin Promote Batch — 2026-07-05T10:07:01.581Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (tarrafal)`
- curated entries: 3105 → 3106

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `tarrafal` | cv | تارفال | Tarrafal |

## Entries added

```json
[
  {
    "slug": "tarrafal",
    "type": "county",
    "countryCode": "cv",
    "lat": 15.2664503,
    "lng": -23.7227339,
    "timezone": "Atlantic/Cape_Verde",
    "names": {
      "ar": "تارفال",
      "en": "Tarrafal",
      "es": "Municipio de Tarrafal",
      "ur": "تارافال، کیپ ورڈی"
    },
    "aliases": {},
    "admin": {
      "countryAr": "الرأس الأخضر",
      "countryEn": "Cape Verde"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
