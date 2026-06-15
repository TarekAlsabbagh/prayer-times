# Admin Promote Batch — 2026-06-15T05:41:11.643Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (acre)`
- curated entries: 2984 → 2985

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `acre` | ps | عكا | Acre |

## Entries added

```json
[
  {
    "slug": "acre",
    "type": "town",
    "countryCode": "ps",
    "lat": 32.9281731,
    "lng": 35.0756378,
    "timezone": "Asia/Jerusalem",
    "names": {
      "ar": "عكا",
      "de": "Akko",
      "en": "Acre",
      "tr": "Akka",
      "ur": "عکا"
    },
    "aliases": {},
    "admin": {
      "countryAr": "الأراضي الفلسطينية",
      "countryEn": "Palestinian Territories"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
