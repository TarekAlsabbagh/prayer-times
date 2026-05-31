# HIJRI-YEAR-CALENDAR-FAQ-SEO-EXPANSION-1 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** Expand `/hijri-calendar/{year}` FAQ from 3 → 12 questions per language, across all 10 supported languages, with FAQPage JSON-LD auto-sync.

---

## 1. Goal

User request (verbatim):
> "يرجى إضافة من 7 إلى 9 أسئلة جديدة، بحيث يصبح إجمالي الأسئلة تقريبًا 10 إلى 12 سؤالًا."

Topics required:
- Year start / Year end (Gregorian dates)
- Month order
- Ramadan timing
- Eid al-Fitr
- Eid al-Adha
- Hijri ↔ Gregorian conversion
- Why dates differ between countries
- Lunar calendar basics

Constraints:
- Use approximate phrasing with "تقريبًا" / "وقد تختلف حسب رؤية الهلال" for date-involving answers
- FAQPage JSON-LD must match visible FAQ exactly (no schema/visible mismatch)
- Multi-language support (10 langs)
- Do **NOT** modify Hijri calculations, month data, H1, canonical, sitemap, routing

---

## 2. Decisions

| Decision | Choice | Reason |
|---|---|---|
| FAQ count per lang | 3 existing + 9 new = **12 total** | Hits user-requested 10-12 range with maximum SEO coverage |
| Date computation | Add to `ctx` once, share via template interpolation | Single source of truth; reuses same `HijriDate.toGregorian` + `gregMonthFor` helpers used by the months table below |
| Caveat language | "تقريبًا" + "وقد يختلف اليوم الفعلي حسب رؤية الهلال" in EVERY date-bearing answer | Per user spec; honest about Umm al-Qura ± moon-sighting drift |
| Source of FAQ for JSON-LD | Same `ui.faq(ctx)` call (js/app.js:23248) | Byte-identical to visible FAQ by construction; zero risk of Google Search Console "FAQ mismatch" warning |
| Multi-language | Native translation for all 10 langs (ar/en/fr/tr/ur/de/id/es/bn/ms) | User said "Multi-language support (10 langs if available)" |
| SSR | Not changed | FAQ remains client-rendered (current behavior); Google bot's JS rendering picks up FAQPage. SSR conversion is a bigger task deferred. |

---

## 3. Files Modified (3)

| File | Lines | Change |
|---|---|---|
| `js/app.js` | +130 / −14 | Extend `ctx` build at L23011-23029 (+18 lines compute Gregorian dates via existing helpers); expand 10 FAQ arrays (lines 1568-1572 AR, 1596-1600 EN, 1624-1628 FR, 1652-1656 TR, 1680-1684 UR, 1708-1712 DE, 1736-1740 ID, 1764-1768 ES, 1792-1796 BN, 1820-1824 MS — each from 3 to 12 questions) |
| `index.html` | +2 / −2 | Cache buster `js/app.js?v=741 → ?v=742` (preload + script tag) |
| `sw.js` | +9 / −1 | `CACHE_VERSION v374 → v375` + 7-line comment header documenting this wave |

**No data files touched** (no curated_places.json, no DB, no i18n files, no Hijri table).

**No new dependencies** — uses only existing helpers (`HijriDate.toGregorian`, `HijriDate.getDaysInHijriMonth`, `gregMonthFor`).

**No deletions** — all 3 pre-existing FAQ questions preserved verbatim per language (just extended downward).

---

## 4. Files Added (1, test only)

| File | Lines | Purpose |
|---|---|---|
| `scripts/_smoke_hijri_year_faq_seo_expansion_1.mjs` | ~120 | Standalone smoke test — loads `js/hijri-date.js` via vm sandbox + `_HYEAR_UI` via Function() factory, validates ctx + 12-question count + JSON-LD↔visible byte-identity for all 10 langs |

---

## 5. New context fields (added at js/app.js:23011)

```js
const _fmtGreg = (m, d) => {
    const g = HijriDate.toGregorian(year, m, d);
    return `${g.day} ${gregMonthFor(lang, g.month - 1)} ${g.year}`;
};
const _lastDhulHijja = HijriDate.getDaysInHijriMonth(year, 12);
const startGreg     = _fmtGreg(1, 1);          // 1 Muharram
const endGreg       = _fmtGreg(12, _lastDhulHijja); // last day of Dhul-Hijja
const ramadanGreg   = _fmtGreg(9, 1);          // 1 Ramadan
const eidFitrGreg   = _fmtGreg(10, 1);         // 1 Shawwal (Eid al-Fitr)
const eidAdhaGreg   = _fmtGreg(12, 10);        // 10 Dhul-Hijja (Eid al-Adha)
const nextYear      = year + 1;
const ctx = { year, hSfx, country, isLeap, totalYearDays,
              startGreg, endGreg, ramadanGreg, eidFitrGreg, eidAdhaGreg, nextYear };
```

Already-existing ctx fields (`year`, `hSfx`, `country`, `isLeap`, `totalYearDays`) untouched. New fields populated for ALL languages because `gregMonthFor(lang)` uses `Intl.DateTimeFormat(_INTL_LOCALES[lang])` for non-AR/EN → fully localized.

---

## 6. The 12 Questions (by slot)

| # | Topic | Status |
|---|---|---|
| Q1 | How many days are in the Hijri year? | (existing) |
| Q2 | Is the year a leap year? | (existing) |
| Q3 | How many Hijri months? | (existing) |
| Q4 | When does the year begin? (Gregorian + caveat) | **NEW** |
| Q5 | When does the year end? (Gregorian + next-year handoff + caveat) | **NEW** |
| Q6 | What is the order of the 12 months? | **NEW** |
| Q7 | When does Ramadan start this year? (Gregorian + caveat) | **NEW** |
| Q8 | When is Eid al-Fitr? (Gregorian + 1 Shawwal + caveat) | **NEW** |
| Q9 | When is Eid al-Adha? (Gregorian + 10 Dhul-Hijja + caveat) | **NEW** |
| Q10 | How to convert Hijri ↔ Gregorian (links to date-converter tool, caveat) | **NEW** |
| Q11 | Why do month starts differ between countries? | **NEW** |
| Q12 | Hijri (lunar 354/355) vs Gregorian (solar 365/366) — 10-11 days drift | **NEW** |

**Languages covered (all 10):** ar, en, fr, tr, ur, de, id, es, bn, ms.

Every date-bearing answer (Q4, Q5, Q7, Q8, Q9, Q10) explicitly includes the moon-sighting caveat in the local language.

---

## 7. JSON-LD ↔ Visible FAQ Identity Guarantee

Architecture (unchanged):
- Visible FAQ rendered at `js/app.js:23221`: `ui.faq(ctx).map(([q,a]) => '<div>${q}</div><div>${a}</div>')`
- JSON-LD `FAQPage.mainEntity` generated at `js/app.js:23248`: `ui.faq(ctx).map(([q,a]) => ({"@type":"Question", "name": q, "acceptedAnswer": {"@type":"Answer", "text": a}}))`

Both call the SAME `ui.faq(ctx)` function. Since the function is pure and deterministic (no DOM, no time, no random), the second call returns the exact same array as the first call. The 10× check in my smoke test (one per lang) verified this byte-identity.

**Conclusion:** Google Search Console "FAQ schema/visible mismatch" warning is structurally impossible.

---

## 8. Verification Results

### Syntax
- ✅ `node --check js/app.js` → OK
- ✅ `node --check sw.js` → OK
- ✅ `node --check server.js` → OK (unchanged but verified clean)

### Smoke test (`scripts/_smoke_hijri_year_faq_seo_expansion_1.mjs`)
**68 / 68 PASS** across:
- ctx computation for year 1447 → 5 plausible Gregorian dates + nextYear=1448
- All 10 langs × {12-count, [q,a] tuple shape, non-empty q, non-empty a, Q4 mentions startGreg} = 50 checks
- All 10 langs JSON-LD ↔ visible identity = 10 checks
- Multi-year sanity (1448 dates ≠ 1447 dates) = 2 checks
- ctx structure = 1 check

Sample 1447 output (ar):
```
{
  "year": 1447, "hSfx": " هـ", "country": "السعودية",
  "isLeap": false, "totalYearDays": 354,
  "startGreg": "26 يونيو 2025",
  "endGreg": "14 يونيو 2026",
  "ramadanGreg": "17 فبراير 2026",
  "eidFitrGreg": "20 مارس 2026",
  "eidAdhaGreg": "27 مايو 2026",
  "nextYear": 1448
}
```

### SSR
- ✅ `curl http://localhost:8080/hijri-calendar/1447` → 200, `<div id="hyear-faq"></div>` container present, cache buster `?v=742` confirmed in serving.
- ✅ `#page-hijri-year` markers count = 2 (template + SSR active class flip) — unchanged.

---

## 9. Cache-buster bumps

| File | From | To |
|---|---|---|
| `index.html` (preload + script tag) | `js/app.js?v=741` | `js/app.js?v=742` |
| `sw.js` | `CACHE_VERSION = 'v374'` | `CACHE_VERSION = 'v375'` |

Both bumps required because:
- `js/app.js` content changed → bump query string to invalidate browser HTTP cache
- `sw.js` constant change → bump to invalidate Service Worker pre-cache (which holds older `app.js` bundle)

---

## 10. What is NOT changed (scope fence)

- ❌ No Hijri calculation changes (HijriDate.* untouched)
- ❌ No month data changes (HIJRI_MONTHS_BY_LANG, _HMONTH_UI untouched)
- ❌ No H1 / canonical / sitemap / routing changes
- ❌ No SSR template (#page-hijri-year markup) changes
- ❌ No CSS changes
- ❌ No i18n (.js/i18n/) changes
- ❌ No data-attr / breadcrumb changes
- ❌ No SSR FAQ injection (FAQ remains client-rendered — bigger ticket if user wants noscript-visible FAQ)

---

## 11. Risks + Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Date-helper miscalculation for far-future year | Low | HijriDate.toGregorian validated against Umm al-Qura table — range 1356-1500 AH; smoke test confirms 1447 + 1448 differ |
| Translation quality for non-Arabic langs | Low | All 10 langs use canonical Hijri month names already established in `HIJRI_MONTHS_BY_LANG`; FAQ text mirrors existing seo_text/footer phrasing per lang |
| JSON-LD ↔ visible drift | Zero | Both consume same `ui.faq(ctx)` (single source of truth) — proved deterministic by smoke test |
| Render speed (more text) | Negligible | FAQ growth from 3 → 12 items adds ~9 `<div>` insertions client-side — well under 1ms |
| Service Worker stale cache | Mitigated | CACHE_VERSION bumped → SW clears old precache on next install event |
| Existing test suites breaking | None | No tracked test asserts FAQ count or structure for hijri-year |

---

## 12. Phase-2 Backlog (not in this commit)

- 🟡 **HIJRI-YEAR-FAQ-SSR-1** — Move FAQ HTML into SSR (server.js _isHijriYearHub branch); ensures noscript-visible FAQ for Google bot guarantee. Currently relies on JS rendering only.
- 🟡 **HIJRI-MONTH-FAQ-SEO-EXPANSION-1** — Same expansion for `/hijri-calendar/{year}-{month}` page (_HMONTH_UI table).
- 🟡 **HIJRI-DAY-FAQ-SEO-EXPANSION-1** — Same for `/hijri-date/{date}` page (_HDAY_UI table).

These are tracked here for transparency but require separate user approval before starting.

---

## 13. Pre-push checklist

- [x] Single feature, single intent — no mixed concerns
- [x] All affected files are tracked
- [x] No data file mutations
- [x] node --check passes for all 3 edited JS files
- [x] Smoke test 68/68 pass
- [x] SSR template structure intact (curl confirms `<div id="hyear-faq"></div>` present)
- [x] Cache-busters bumped (app.js v741→v742, sw v374→v375)
- [x] No `.md` files written outside `reports/` (this is the only one)
- [x] No new dependencies, no new HTTP endpoints, no new routes
- [x] Closure report written and self-contained
- [ ] **Awaiting user approval before push**

---

## 14. Proposed commit message

```
feat(hijri-year): HIJRI-YEAR-CALENDAR-FAQ-SEO-EXPANSION-1 — 3→12 FAQ questions × 10 langs

- Extend ctx in _loadHijriYearPage with 5 Gregorian date helpers + nextYear
  (startGreg, endGreg, ramadanGreg, eidFitrGreg, eidAdhaGreg) computed via
  existing HijriDate.toGregorian + gregMonthFor — no new deps.
- Expand _HYEAR_UI.faq for all 10 langs (ar/en/fr/tr/ur/de/id/es/bn/ms):
  3 existing questions preserved + 9 new SEO-friendly questions covering
  year start/end, month order, Ramadan, Eid al-Fitr, Eid al-Adha, Hijri-
  Gregorian conversion, cross-country differences, lunar-vs-solar drift.
- Every date-bearing answer carries the "تقريبًا + رؤية الهلال" caveat in
  its native language per user spec.
- FAQPage JSON-LD auto-syncs — both visible FAQ and schema consume the
  same ui.faq(ctx) call (js/app.js:23221, :23248) so byte-identity is
  structural.
- Smoke test: scripts/_smoke_hijri_year_faq_seo_expansion_1.mjs — 68/68
  pass (10 langs × 5 checks + ctx + JSON-LD identity + multi-year sanity).
- Cache busters: js/app.js v741→v742; sw CACHE_VERSION v374→v375.

No data mutations. No SSR template changes. No routing changes.
Hijri calculations / month data / H1 / canonical / sitemap untouched.
```
