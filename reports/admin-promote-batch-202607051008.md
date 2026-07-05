# Admin Promote Batch — 2026-07-05T10:08:54.178Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (abu-hardub)`
- curated entries: 3105 → 3106

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `abu-hardub` | sy | أبو حردوب | Abu Hardub |

## Entries added

```json
[
  {
    "slug": "abu-hardub",
    "type": "town",
    "countryCode": "sy",
    "lat": 34.8451991,
    "lng": 40.6279369,
    "timezone": "Asia/Damascus",
    "names": {
      "ar": "أبو حردوب",
      "en": "Abu Hardub"
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
