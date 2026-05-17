// scripts/geodata/_persian_pregate_fixture.mjs
// ─────────────────────────────────────────────────────────────────────────
// Sample IR / AF / KZ rows for the Stage 3.4 normalizer test runner.
// HAND-CRAFTED — small, readable, every row tagged with what it tests.
// NO data downloaded from GeoNames; this is purely a design fixture.
//
// Each entry: { cc, slug, originalAr, note, expect:
//                 { cleaned, changed, charsSubstituted: { from, to, count }[] } }
// `expect.cleaned` is the value Stage 3.4 must produce.
// `expect.changed` is whether the cleaner reports any change.
// ─────────────────────────────────────────────────────────────────────────

export const FIXTURE = [
    // ─── Already-clean Arabic (must pass through unchanged) ───
    {
        cc: 'ir', slug: 'tehran',
        originalAr: 'طهران',
        note: 'Already clean Arabic — Tehran',
        expect: { cleaned: 'طهران', changed: false, charsSubstituted: [] },
    },
    {
        cc: 'ir', slug: 'isfahan',
        originalAr: 'أصفهان',
        note: 'Already clean Arabic — Isfahan',
        expect: { cleaned: 'أصفهان', changed: false, charsSubstituted: [] },
    },
    {
        cc: 'sa', slug: 'riyadh',
        originalAr: 'الرياض',
        note: 'Pure Arabic capital — must not be touched',
        expect: { cleaned: 'الرياض', changed: false, charsSubstituted: [] },
    },

    // ─── Persian-specific letters (Farsi GeoNames rows) ───
    {
        cc: 'ir', slug: 'mashhad',
        originalAr: 'مشهد',
        note: 'No special chars',
        expect: { cleaned: 'مشهد', changed: false, charsSubstituted: [] },
    },
    {
        cc: 'ir', slug: 'yazd',
        originalAr: 'یزد',
        note: 'Persian yeh ی → Arabic yeh ي',
        expect: { cleaned: 'يزد', changed: true,
                  charsSubstituted: [{ from: 'ی', to: 'ي', count: 1 }] },
    },
    {
        cc: 'ir', slug: 'kerman',
        originalAr: 'کرمان',
        note: 'Persian kaf ک → Arabic kaf ك',
        expect: { cleaned: 'كرمان', changed: true,
                  charsSubstituted: [{ from: 'ک', to: 'ك', count: 1 }] },
    },
    {
        cc: 'ir', slug: 'chabahar',
        originalAr: 'چابهار',
        note: 'Persian che چ → ج',
        expect: { cleaned: 'جابهار', changed: true,
                  charsSubstituted: [{ from: 'چ', to: 'ج', count: 1 }] },
    },
    {
        cc: 'ir', slug: 'gorgan',
        originalAr: 'گرگان',
        note: 'Persian gaf گ → غ (default)',
        expect: { cleaned: 'غرغان', changed: true,
                  charsSubstituted: [{ from: 'گ', to: 'غ', count: 2 }] },
    },
    {
        cc: 'ir', slug: 'parsa-multi',
        originalAr: 'پارسا',
        note: 'Persian peh پ → ب',
        expect: { cleaned: 'بارسا', changed: true,
                  charsSubstituted: [{ from: 'پ', to: 'ب', count: 1 }] },
    },
    {
        cc: 'ir', slug: 'multi-letter',
        originalAr: 'کرمانشاه‌ی',
        note: 'Multiple subs + ZWNJ between yeh and word',
        // ZWNJ stripped (no whitespace), then ک→ك, then ی→ي
        expect: { cleaned: 'كرمانشاهي', changed: true,
                  charsSubstituted: [
                      { from: 'ک', to: 'ك', count: 1 },
                      { from: 'ی', to: 'ي', count: 1 },
                  ] },
    },

    // ─── Pashto (AF rows) ───
    {
        cc: 'af', slug: 'kabul',
        originalAr: 'کابل',
        note: 'AF: Persian ک in Kabul (Farsi alternatename) → ك',
        expect: { cleaned: 'كابل', changed: true,
                  charsSubstituted: [{ from: 'ک', to: 'ك', count: 1 }] },
    },
    {
        cc: 'af', slug: 'kandahar',
        originalAr: 'کندهار',
        note: 'AF: Persian ک → ك',
        expect: { cleaned: 'كندهار', changed: true,
                  charsSubstituted: [{ from: 'ک', to: 'ك', count: 1 }] },
    },
    {
        cc: 'af', slug: 'herat',
        originalAr: 'هرات',
        note: 'AF: already clean Arabic',
        expect: { cleaned: 'هرات', changed: false, charsSubstituted: [] },
    },
    {
        cc: 'af', slug: 'jalalabad',
        originalAr: 'جلال‌آباد',
        note: 'AF: ZWNJ between جلال and آباد (Persian formatting)',
        expect: { cleaned: 'جلالآباد', changed: true, charsSubstituted: [] },
    },
    {
        cc: 'af', slug: 'pashto-name',
        originalAr: 'څاښلوال',
        note: 'AF: Pashto-only chars څ + ښ',
        expect: { cleaned: 'جاشلوال', changed: true,
                  charsSubstituted: [
                      { from: 'څ', to: 'ج', count: 1 },
                      { from: 'ښ', to: 'ش', count: 1 },
                  ] },
    },

    // ─── Uyghur (already proven in ASIA-1I-MCF) ───
    {
        cc: 'kz', slug: 'sample-uyghur',
        originalAr: 'تۆبۆل',
        note: 'KZ: Uyghur ۆ → و (twice)',
        expect: { cleaned: 'توبول', changed: true,
                  charsSubstituted: [{ from: 'ۆ', to: 'و', count: 2 }] },
    },

    // ─── Urdu (no Pashto/AF, just Urdu-style) ───
    {
        cc: 'ir', slug: 'urdu-style',
        originalAr: 'اسلام آباد ٹاؤن',
        note: 'Urdu retroflex ٹ → ت',
        expect: { cleaned: 'اسلام آباد تاؤن', changed: true,
                  charsSubstituted: [{ from: 'ٹ', to: 'ت', count: 1 }] },
    },

    // ─── Mojibake / Latin-mix (must NOT be auto-fixed) ───
    {
        cc: 'ir', slug: 'mojibake',
        originalAr: 'ÚÊÑÇä',
        note: 'Mojibake — looks Arabic but is Latin garbage. Pre-gate cannot fix this.',
        expect: { cleaned: 'ÚÊÑÇä', changed: false, charsSubstituted: [] },
    },
    {
        cc: 'ir', slug: 'mixed-latin',
        originalAr: 'تهران Tehran',
        note: 'Mixed Latin in Arabic. Pre-gate leaves Latin untouched; 3.5 will flag mixed_latin.',
        expect: { cleaned: 'تهران Tehran', changed: false, charsSubstituted: [] },
    },

    // ─── Empty / null ───
    {
        cc: 'ir', slug: 'empty',
        originalAr: '',
        note: 'Empty string → no changes',
        expect: { cleaned: '', changed: false, charsSubstituted: [] },
    },
    {
        cc: 'ir', slug: 'null-row',
        originalAr: null,
        note: 'Null value tolerated',
        expect: { cleaned: '', changed: false, charsSubstituted: [] },
    },

    // ─── Idempotency probe ───
    {
        cc: 'ir', slug: 'idempotent-probe',
        originalAr: 'گرگان',
        note: 'Run twice — second pass must produce the same string',
        expect: { cleaned: 'غرغان', changed: true,
                  charsSubstituted: [{ from: 'گ', to: 'غ', count: 2 }] },
    },

    // ─── Tatweel + diacritics ───
    {
        cc: 'ir', slug: 'tatweel',
        originalAr: 'حـاجـي',
        note: 'Tatweel ـ stripped — multi-ـ collapses; leaves clean Arabic',
        expect: { cleaned: 'حاجي', changed: true, charsSubstituted: [] },
    },
];

export default FIXTURE;
