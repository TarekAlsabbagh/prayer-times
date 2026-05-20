# Policy: Per-Country Supported-Lang rule for new city additions

**Date**: 2026-05-20
**Decision by**: User course-correction
**Scope**: All future city-addition waves

---

## 1. Policy statement

> When adding any new city to `curated-places.json`, add **only** the supported-UI languages relevant to that country's market — NOT all available languages from GeoNames.

The site's current `SUPPORTED_LANGS` (10): `ar, en, fr, de, tr, ur, id, es, bn, ms`.

A language is added to a new city if and only if **both** apply:
- It is **always required** (ar + en — universal baseline), OR
- It is in `SUPPORTED_LANGS` **AND** is the country's native/market language.

Languages NOT in `SUPPORTED_LANGS` MUST NOT be added even if present in GeoNames raw.

---

## 2. Per-country rule table

| Country / market | Add these langs | Skip these |
|---|---|---|
| India (IN) | **ar, en, ur, bn** | hi, ta, mr, te, kn, ml, gu, pa, or, as, sa |
| Pakistan (PK) | **ar, en, ur** | sd, ps, pa (Shahmukhi) |
| Bangladesh (BD) | **ar, en, bn** | — |
| France (FR) | **ar, en, fr** | — |
| Germany (DE) | **ar, en, de** | — |
| Austria (AT), Switzerland (CH-German parts) | **ar, en, de** | — |
| Turkey (TR), Northern Cyprus, Azerbaijan (where TR-script used) | **ar, en, tr** | — |
| Indonesia (ID) | **ar, en, id** | — |
| Malaysia (MY), Singapore (SG), Brunei (BN) | **ar, en, ms** | — |
| Spain (ES) | **ar, en, es** | — |
| Mexico, Argentina, Colombia, Chile, Peru, Venezuela, etc. (Spanish-speaking) | **ar, en, es** | — |
| Saudi Arabia (SA), Egypt (EG), Iraq (IQ), Syria (SY), Jordan (JO), Lebanon (LB), Palestine (PS), Yemen (YE), Oman (OM), UAE (AE), Kuwait (KW), Qatar (QA), Bahrain (BH), Algeria (DZ), Tunisia (TN), Morocco (MA), Libya (LY), Sudan (SD), Mauritania (MR), Comoros (KM), Djibouti (DJ) — Arabic-native | **ar, en** | — (no additional supported lang typically needed; Arabic IS the native) |
| United States (US), United Kingdom (GB), Canada (CA), Australia (AU), Ireland (IE), New Zealand (NZ) — English-native | **ar, en** | — |
| Any other country with native lang NOT in SUPPORTED_LANGS | **ar, en** | All other langs from GeoNames |

### Edge cases

- **Multilingual countries**: if multiple SUPPORTED_LANGS apply (e.g., Switzerland: de/fr/it — only de in SUPPORTED_LANGS; Belgium: fr/de/nl — only fr/de in SUPPORTED_LANGS), add ALL applicable supported langs.
- **Diaspora communities**: do NOT add diaspora-language fields just because a country has a large Urdu/Bengali population (e.g., don't add `names.ur` to UAE cities just for the Pakistani diaspora). Add only the country's official/market language.
- **Cross-border script overlap** (e.g., Bengali in NE India + Bangladesh): the Indian-side cities get `names.bn` because Bengal+Tripura+Assam regions speak Bengali and `bn` is in SUPPORTED_LANGS. Similar logic: Urdu in IN+PK both get `names.ur`.

---

## 3. Why this policy

1. **Data-only-deferred-usage is wasteful**: Adding a name in a non-supported language means it's stored but never displayed in the UI and never used for routing. It only bloats curated-places.json and clutters the search candidate pool with no user value.
2. **GeoNames noise risk**: GeoNames raw alternateNames often include phonetic/historical/Chinese-pinyin/etc. variants that are not useful. Filtering by "is this lang in our UI?" eliminates the noise problem at the source.
3. **Search ranking cleanliness**: Fewer language fields = fewer false-match candidates (e.g., the earlier IATA aliases issue was exacerbated by storing noisy candidates).
4. **Closer to launch**: Smaller, targeted language sets ship faster.

---

## 4. Prohibitions (reinforced)

- ❌ Do NOT add `names.<lang>` if `<lang>` is not in `SUPPORTED_LANGS`
- ❌ Do NOT add `names.<lang>` even from supported langs if not relevant to that country
- ❌ Do NOT open separate long L10N enrichment waves before launch
- ❌ Do NOT add Hindi/Tamil/Marathi/Telugu/Kannada/Malayalam/Gujarati/Gurmukhi/Oriya/Assamese/Sanskrit (all unsupported in current UI)
- ❌ Do NOT use runtime translation (Google/OpenAI/Anthropic/browser)
- ❌ Do NOT use fillchain to auto-fill unsupported langs

---

## 5. Examples

### India (current closed waves illustrate the policy)

- SEED-18 (legacy import) — has 11 langs ar/bn/de/en/es/fr/hi/id/ms/tr/ur. Hindi present from legacy; not extended. *Per current policy*: would only add ar/en/ur/bn for India (Hindi NOT applicable). Legacy preserved as-is.
- BATCH-A-22 — has 5 langs ar/bn/en/hi/ur (legacy added Hindi). Hindi NOT extended further.
- BATCH-B-30 — has 4 langs ar/bn/en/ur. **Matches new policy exactly.**
- BATCH-C-39 — has 4 langs ar/bn/en/ur. **Matches new policy exactly.**

### Future Pakistan additions
Add only ar+en+ur. Skip any Pashto/Sindhi/Saraiki strings even if in GeoNames.

### Future Bangladesh additions
Add only ar+en+bn.

### Future France/Germany/Turkey additions
Add only ar+en+ (fr/de/tr respectively).

### Future US/UK/Saudi/Egypt additions
Add only ar+en. No third language needed (English is native; Arabic is universal baseline).

### Future Indonesia / Malaysia
Add ar+en+id (Indonesia) or ar+en+ms (Malaysia). Skip Javanese/Sundanese/Tagalog/etc.

### Future Spain / Latin America
Add ar+en+es.

---

## 6. Current state alignment

The just-applied ASIA-1D-IN-C-FAST-SUPPORTED-L10N wave (`52322a9`) added 39 India cities with exactly `ar/en/ur/bn` — **this policy was already followed**.

The user explicitly directed: "بالنسبة للمرحلة الحالية ASIA-1D-IN-C-FAST-SUPPORTED-L10N: استمر كما هو" — current wave stays as-is. No data changes required to the wave.

---

## 7. Files this policy doc changed

### CREATED

| File | Purpose |
|---|---|
| `reports/city-add-supported-lang-policy.md` | This policy document |

### NOT modified

- ❌ `db/places/curated-places.json` — 0 byte diff (no data mutation)
- ❌ `db/places/candidates/*` — unchanged
- ❌ `server.js` / `js/app.js` / `index.html` — unchanged
- ❌ All shared scripts — unchanged
- ❌ Test scripts — unchanged

---

## 8. Operational checklist for future waves

When opening any new geodata wave (`ASIA-1D-IN-D`, `ASIA-1F`, `AMERICAS-1B-MCF`, etc.):

1. Identify the target country/countries.
2. Look up the per-country rule in §2.
3. Configure the apply script's `ALLOWED_LANGS` to the resulting set.
4. Reject ANY entry that would have additional langs (e.g., Hindi for India).
5. Verify post-apply that each new entry has exactly the policy-allowed langs (no more, no less).

This makes the policy enforceable in code, not just documentation.
