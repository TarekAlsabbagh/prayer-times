# Admin Promote Batch — 2026-06-22T20:07:27.955Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (sacramento)`
- curated entries: 2988 → 2989

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `sacramento` | us | ساكرامنتو | Sacramento |

## Entries added

```json
[
  {
    "slug": "sacramento",
    "type": "city",
    "countryCode": "us",
    "lat": 38.5810606,
    "lng": -121.493895,
    "timezone": "America/Los_Angeles",
    "names": {
      "ar": "ساكرامنتو",
      "bn": "স্যাক্রামেন্টো",
      "en": "Sacramento",
      "ur": "سکرامنٹو"
    },
    "aliases": {},
    "admin": {
      "countryAr": "الولايات المتحدة",
      "countryEn": "United States"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
