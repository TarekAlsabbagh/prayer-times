# Admin Promote Batch — 2026-06-14T12:59:49.839Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (raanana-il)`
- curated entries: 2983 → 2984

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `raanana-il` | ps | رعنانا | Raanana |

## Entries added

```json
[
  {
    "slug": "raanana-il",
    "type": "city",
    "countryCode": "ps",
    "lat": 32.1874797,
    "lng": 34.8676924,
    "timezone": "Asia/Jerusalem",
    "names": {
      "ar": "رعنانا",
      "en": "Raanana"
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
