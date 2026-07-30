# Admin Promote Batch — 2026-07-30T17:11:31.200Z

Promoted **2** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 2 reviewed discovered cities from admin dashboard (ashburn, miyashiro)`
- curated entries: 3115 → 3117

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `ashburn` | us | اشبورن | Ashburn |
| `miyashiro` | jp | مياشيرو | Miyashiro |

## Entries added

```json
[
  {
    "slug": "ashburn",
    "type": "town",
    "countryCode": "us",
    "lat": 39.0437192,
    "lng": -77.4874899,
    "timezone": "America/New_York",
    "names": {
      "ar": "اشبورن",
      "en": "Ashburn"
    },
    "aliases": {},
    "admin": {
      "countryAr": "الولايات المتحدة",
      "countryEn": "United States"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  },
  {
    "slug": "miyashiro",
    "type": "town",
    "countryCode": "jp",
    "lat": 36.0227087,
    "lng": 139.722628,
    "timezone": "Asia/Tokyo",
    "names": {
      "ar": "مياشيرو",
      "en": "Miyashiro"
    },
    "aliases": {},
    "admin": {
      "countryAr": "اليابان",
      "countryEn": "Japan"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
