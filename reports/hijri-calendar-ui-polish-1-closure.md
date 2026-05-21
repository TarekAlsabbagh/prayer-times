# HIJRI-CALENDAR-UI-POLISH-1 — Closure Report

**Date:** 2026-05-21
**Phase:** UI polish only for `/hijri-calendar` (year hub)
**Pattern:** CSS-only, no DOM/text/SEO/logic changes
**Status:** CLOSED — user-approved 2026-05-21

---

## Acceptance Criteria

| #  | Criterion                                                                       | Result |
|----|---------------------------------------------------------------------------------|--------|
| 1  | Visual polish only (CSS + minimal HTML cache-buster bump)                       | ✅     |
| 2  | CSS rules scoped to `#page-hijri-year` (and `.hd5-events` inside it)            | ✅     |
| 3  | `index.html` change limited to cache-buster (`?v=357` → `?v=358`)               | ✅     |
| 4  | No content changes (H1 / H2 / labels / FAQ / about / footer all intact)        | ✅     |
| 5  | No SEO changes (title / meta / FAQ schema unchanged)                            | ✅     |
| 6  | No JSON-LD changes                                                              | ✅     |
| 7  | No canonical / hreflang link changes                                            | ✅     |
| 8  | No data changes (Hijri calculations + month/day data byte-identical)           | ✅     |
| 9  | No logic changes (year picker + prev/next + today-in-year + FAQ all intact)    | ✅     |
| 10 | No geodata / curated-places.json changes                                        | ✅     |
| 11 | No `server.js` changes                                                          | ✅     |
| 12 | No `js/app.js` changes                                                          | ✅     |
| 13 | No city / moon / qibla page changes (scope-isolated)                            | ✅     |
| 14 | No `/hijri-date/{date}` or `/hijri-calendar/{YYYY-MM}` changes                  | ✅     |
| 15 | No `docs/place-data-maintenance-policy.md` changes                              | ✅     |
| 16 | No `server/place-l10n/index.js` changes                                         | ✅     |
| 17 | All routes return HTTP 200 (9/9 verified)                                       | ✅     |
| 18 | Content-integrity smoke 38/38 PASS                                              | ✅     |
| 19 | No new phase started (all deferred items remain DEFERRED)                       | ✅     |

**Outcome:** All 19 acceptance criteria met. Approved.

---

## Summary

Applied a final visual tightening pass for `/hijri-calendar` on top of the
existing HCAL-1 / HCAL-2 / HCAL-2b / HCAL-2c phases. **Pure CSS** — no DOM
change, no text change, no SEO/JSON-LD/canonical/hreflang/H1-text change,
no server.js / js/app.js / index.html structural change, no curated/geodata
change. The only HTML touch is a cache-buster bump (`?v=357` → `?v=358`)
to force the new stylesheet to fetch.

All rules are scoped via `#page-hijri-year` (and `.hd5-events` for the
events countdown, which only renders inside this page's clone block).
Other pages — `/hijri-date/{date}` (`#page-hijri-day`), `/hijri-calendar/
{YYYY-MM}` (`#page-hijri-month`), `/today-hijri-date` (`#page-hijri-
today`), city pages, moon pages, qibla pages, search — are unaffected.

---

## Acceptance Criteria

| #  | Criterion                                                              | Result |
|----|------------------------------------------------------------------------|--------|
| 1  | No DOM/HTML structural changes                                         | ✅ Only cache-buster bumped in index.html |
| 2  | No text changes (H1/H2/labels/FAQ/body/about — all intact)            | ✅     |
| 3  | No new sections added                                                  | ✅     |
| 4  | No sections deleted                                                    | ✅     |
| 5  | No SEO title/meta/JSON-LD/FAQ schema changes                           | ✅     |
| 6  | No canonical / hreflang link changes                                   | ✅     |
| 7  | No Hijri calculation / data changes                                    | ✅     |
| 8  | No year-selection logic changes                                        | ✅     |
| 9  | No links changed                                                       | ✅     |
| 10 | No server.js changes                                                   | ✅     |
| 11 | No js/app.js changes                                                   | ✅     |
| 12 | No docs/place-data-maintenance-policy.md changes                      | ✅     |
| 13 | No server/place-l10n changes                                           | ✅     |
| 14 | No db/places/curated-places.json changes                              | ✅     |
| 15 | All 16 visual polish areas applied (see Section 3)                     | ✅     |
| 16 | All routes return HTTP 200 (regression sweep)                          | ✅ 9/9 |
| 17 | Content-integrity smoke 38/38 pass                                     | ✅     |
| 18 | No new phase started                                                   | ✅     |

---

## Implementation Commit

(pending — created at end of this report)

---

## Section 1 — Files Modified

| File                | Change                                                            |
|---------------------|-------------------------------------------------------------------|
| `css/style.css`     | Appended HIJRI-CALENDAR-UI-POLISH-1 block (~260 lines, 16 sub-rules) at EOF |
| `index.html`        | Cache-buster bump `style.css?v=357` → `style.css?v=358` (2 occurrences: preload + stylesheet link) |

**No other files touched.** Verified via `git diff --stat HEAD --` for
server.js, js/app.js, docs/place-data-maintenance-policy.md, server/
place-l10n/index.js, db/places/curated-places.json — all empty diff.

---

## Section 2 — New CSS Block Location

`css/style.css` lines 19066–19320 (approx). All selectors prefixed with
`#page-hijri-year` to scope ONLY to the year hub page.

The block has 16 numbered sub-sections matching the user's spec areas:

1. Section spacing (margin-bottom / padding reduction)
2. Hero card padding + H1 sizing (1.75rem desktop / 1.4rem mobile)
3. Year picker panel compactness (padding, gap, font-size)
4. Summary cards (min-height 88px, value 1.6rem)
5. Section h2 unified (1.1rem)
6. Month chips (min-height 42px, sharper active state)
7. Months table (row padding 8/12px)
8. Quick actions (padding 12/14, min-height 48px)
9. Nearby years (gap 7px, tighter chip padding)
10. Usage guide (12/14/12/52 padding)
11. FAQ (10/14 padding, added `details > summary::after` caret affordance)
12. About box (14/18 padding)
13. Footer SEO (12/14 padding)
14. Events countdown (10/12 padding, days 1.45rem bold)
15. Today-in-year banner (9/13 padding)
16. Mobile safety overrides (≤480px font-size tuning)

---

## Section 3 — Visual Changes Summary (Before → After)

| Area                  | Before (existing HCAL-2c)                    | After (UI-POLISH-1)                          |
|-----------------------|----------------------------------------------|----------------------------------------------|
| Section card mb       | 18px desktop / 12px mobile                   | 14px desktop / 10px mobile                   |
| Section card padding  | 24px                                         | 18px 20px desktop / 14px 14px mobile         |
| Hero card padding     | 20px 22px                                    | 20px 22px desktop / 14px mobile (+ gap 22px) |
| H1 #hyear-title       | 1.6rem desktop / 1.3rem mobile               | 1.75rem desktop / 1.4rem mobile              |
| Year picker padding   | 18px 20px                                    | 14px 16px                                    |
| Year picker gap       | 10px                                         | 8px                                          |
| Year select font-size | 1.25rem                                      | 1.15rem                                      |
| Today CTA padding     | 11px 16px                                    | 9px 14px                                     |
| Info-card min-height  | 96px                                         | 88px desktop / 80px mobile                   |
| Info-card icon size   | 36×36px                                      | 32×32px                                      |
| Info-card value       | 1.7rem desktop / 1.45rem mobile              | 1.6rem desktop / 1.35rem mobile              |
| Section h2 font       | 1.18rem desktop / 1.08rem mobile             | 1.1rem desktop / 1.02rem mobile              |
| Month chip min-height | 48px                                         | 42px                                         |
| Month chip padding    | 12px 14px                                    | 9px 12px                                     |
| Month chip active     | bg 0.08, border 0.32                         | bg 0.12, border 0.42, inset shadow (sharper) |
| Table thead padding   | 10px 12px                                    | 9px 12px                                     |
| Table tbody padding   | 10px 12px                                    | 8px 12px                                     |
| Quick action padding  | 14px 16px                                    | 12px 14px                                    |
| Quick action min-h    | (none)                                       | 48px desktop / 44px mobile                   |
| Year chip padding     | 6px 14px                                     | 5px 12px                                     |
| Year chip font        | 0.92rem                                      | 0.9rem                                       |
| Guide card padding    | 14px 16px 14px 56px                          | 12px 14px 12px 52px                          |
| Guide card badge      | 30×30px                                      | 28×28px                                      |
| FAQ summary padding   | 12px 16px                                    | 10px 14px                                    |
| FAQ answer padding    | 0 16px 12px                                  | 0 14px 10px                                  |
| FAQ caret (new)       | (no visual chevron)                          | `⌄` rotates 180° on `[open]` (CSS-only)      |
| About box padding     | 24px                                         | 14px 18px desktop / 12px 14px mobile         |
| Events card padding   | 12px 14px                                    | 10px 12px                                    |
| Events days size      | 1.35rem                                      | 1.45rem (more prominent number)              |
| Events card min-h     | (none)                                       | 64px (unified row height)                    |

---

## Section 4 — Tests Run

### Content-integrity smoke (new)
`scripts/_smoke_hijri_calendar_ui_polish_1.mjs`: **38 / 38 PASS**

Verified:
- ✅ HTTP 200 on `/hijri-calendar`, `/hijri-calendar/1447`, `/hijri-calendar/1448`, `/hijri-calendar/1447-09`, `/today-hijri-date`, `/prayer-times-in-riyadh`, `/moon-today`, `/qibla`, `/en/hijri-calendar`
- ✅ CSS cache-buster bumped to `v=358`
- ✅ All page anchors present: `#hyear-title`, `#page-hijri-year`, `.calendar-year-picker`, `.hyear-year-nav-row`, `#hyear-info-grid`, `#hyear-table-body`, `#hyear-cta`, `#hyear-years-grid`, `#hyear-faq`, `#hyear-seo-text`, `#hyear-footer-seo`
- ✅ Today-hijri-date CTA link present
- ✅ Usage guide (.hcal1-guide) rendered
- ✅ Months chips (.hcal2-months-chips) rendered
- ✅ Events countdown (.hd5-events) section + all 4 event cards present (Ramadan / Eid Al-Fitr / Eid Al-Adha / Hijri New Year)
- ✅ JSON-LD script tag present (on both `/hijri-calendar` and `/hijri-calendar/1447`)
- ✅ canonical + hreflang links present
- ✅ Title element with id=`hyear-title` has Arabic text content
- ✅ `<title>` tag content unchanged: "التقويم الهجري 1447 هـ | الأشهر الهجرية والتواريخ الميلادية"
- ✅ Month page (`/hijri-calendar/1447-09`) uses `#page-hijri-month` separately — confirms scope isolation
- ✅ English `/en/hijri-calendar` resolves and has correct H1

### Regression — adjacent routes (HTTP 200 sanity)
- ✅ `/hijri-calendar` → 200
- ✅ `/hijri-calendar/1447` → 200
- ✅ `/hijri-calendar/1448` → 200
- ✅ `/hijri-calendar/1447-09` (month detail) → 200 (separate page, unaffected by polish)
- ✅ `/today-hijri-date` → 200 (separate page, unaffected)
- ✅ `/prayer-times-in-riyadh` → 200 (unrelated page, unaffected)
- ✅ `/moon-today` → 200 (unrelated, unaffected)
- ✅ `/qibla` → 200 (unrelated, unaffected)
- ✅ `/en/hijri-calendar` → 200

---

## Section 5 — Files Untouched (Verified)

```
$ git diff --stat HEAD -- server.js js/app.js docs/place-data-maintenance-policy.md server/place-l10n/index.js db/places/curated-places.json
(empty — 0 bytes)
```

✅ `server.js` — 0-byte diff
✅ `js/app.js` — 0-byte diff
✅ `docs/place-data-maintenance-policy.md` — 0-byte diff
✅ `server/place-l10n/index.js` — 0-byte diff
✅ `db/places/curated-places.json` — 0-byte diff (all 2,977 curated entries unchanged)
✅ Search-ranking code untouched
✅ All city pages / moon pages / qibla pages / hijri-date pages / hijri-month pages unaffected (scope isolation via `#page-hijri-year`)
✅ All curated-places localization unchanged (FR/DE/ES/MX/AR/CO/PE/CL/VE/TR/IN/ID/MY/PK/BD all byte-identical via SHA-256 check at git layer)

---

## Section 6 — Confirmations

- ✅ NO content changes (no text edits, no Arabic word substitutions, no
  English translations)
- ✅ NO SEO changes (title/meta/JSON-LD/FAQ schema/canonical/hreflang all
  unchanged)
- ✅ NO data changes (no curated entries, no Hijri month data, no Gregorian
  date calculations modified)
- ✅ NO logic changes (year picker, prev/next navigation, today-in-year
  calculation, FAQ interaction all unchanged)
- ✅ NO links changed (all internal anchors + CTAs preserved)
- ✅ NO sections added or removed
- ✅ NO H1 text change
- ✅ Visual polish ONLY: spacing, sizing, padding, font-size, border-radius,
  added caret affordance on `<details>` summary (CSS-only via `::after`,
  doesn't add DOM)

---

## Section 7 — STOP

UI polish phase complete. No code, no data, no SEO, no content changes.

**Closure approval received from user on 2026-05-21.**
Marker: `docs(closure): mark HIJRI-CALENDAR-UI-POLISH-1 user-approved 2026-05-21`

Status moved from `awaiting user approval` → `CLOSED — user-approved 2026-05-21`.

The following remain DEFERRED — DO NOT auto-start:
- Hijri month page polish (`/hijri-calendar/{YYYY-MM}`)
- Hijri date page polish (`/hijri-date/{date}`)
- city pages polish
- moon pages polish
- qibla pages polish
- TR-C (any further Turkey batch)
- ASIA-1F (CN solo)
- AMERICAS (non-Spanish-speaking)
- SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2
- search-ranking
- DELETE-V1
- geocode proxy
- any separate L10N waves
- any new city batch
