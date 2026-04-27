// UAT-3a — i18n Leakage Audit (REPORT MODE)
//
// Fetches /{lang}/prayer-times-in-riyadh for every non-Arabic language and
// counts Arabic-Unicode visible strings, categorising each occurrence by
// likely source so we can plan the cleanup:
//
//     data-i18n         — element has data-i18n* attribute → fixable via SSR
//     hardcoded         — Arabic text with no data-i18n binding → needs HTML edit
//     jsonld            — text inside <script type="application/ld+json"> → expected (lang neutrality)
//     allowed-religious — known religious contexts (hadith, duas, Quran spans)
//
// The script does NOT exit non-zero on findings. It is a REPORT, used to
// inform the size and shape of UAT-3b/3c. predeploy-check is unchanged.
//
// Usage:
//     node scripts/test-i18n-leakage.mjs
//     SITE_URL=https://prayer-times-d4w8.onrender.com node scripts/test-i18n-leakage.mjs
//
// Default base = http://localhost:3000.

const BASE = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const SAMPLE_PATH = '/prayer-times-in-riyadh';   // representative city page

// ── Languages ──────────────────────────────────────────────────────────
// STRICT = use Arabic Unicode range as leakage detector (script differs from text)
// FUZZY  = ur (uses Perso-Arabic script overlapping Arabic) → use known-phrase set
const STRICT_LANGS = ['en', 'fr', 'de', 'tr', 'id', 'es', 'bn', 'ms'];
const FUZZY_LANGS  = ['ur'];

// ── Known-leak phrases (for Urdu detection) ────────────────────────────
// These strings appear hardcoded in Arabic on every non-AR build today.
// If they show up unchanged on the Urdu page, that's a leak that needs i18n.
const URDU_LEAK_PHRASES = [
    'مواقيت الصلاة اليوم والتاريخ الهجريّ',
    'اعرف أوقات الصلاة الدقيقة',
    'جاري التحديد',
    'جدول مواقيت الصلاة',
    'عرض الجدول الكامل',
    'الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء',
    'الإمساك', 'مدّة الصيام', 'آخر ثلث الليل',
    'طريقة الحساب', 'طريقة حساب العصر', 'صيغة الوقت',
    'إعدادات الحساب', 'إعدادات متقدّمة',
    'اتّجاه القبلة', 'أوقات القمر', 'التاريخ الهجري',
    'أدوات إسلاميّة سريعة',
    '🕌 الخدمات الإسلامية', '📅 التاريخ الهجري',
    'نحن الآن في وقت', 'الصلاة القادمة',
    'الرئيسية',
    'دقّة عالية باستخدام GPS', 'يعمل في جميع الدول',
    'عرض مواقيت الصلاة في موقعي الآن', 'اختر مدينتك يدويّاً',
    'الأكثر بحثاً اليوم', 'مواقيت الصلاة في مدن',
    'باقي على شهر رمضان',
];

// ── HTML helpers ───────────────────────────────────────────────────────
const ARABIC_RE = /[؀-ۿ]/;

function stripScriptsButKeepJsonLd(html) {
    // Replace <script type="application/ld+json"> blocks with a sentinel
    const SENTINEL_OPEN = 'JSONLD_START';
    const SENTINEL_CLOSE = 'JSONLD_END';
    let processed = html.replace(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
        (m, body) => `${SENTINEL_OPEN}${body}${SENTINEL_CLOSE}`
    );
    // Drop other <script>, <style>, <noscript>, comments
    processed = processed.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    processed = processed.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    processed = processed.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
    processed = processed.replace(/<!--[\s\S]*?-->/g, '');
    // Restore json-ld blocks for separate processing
    return processed;
}

// Extract Arabic-containing snippets with category hint.
// Returns array of { text, category, sample_pos }
function extractArabicSnippets(rawHtml) {
    const cleaned = stripScriptsButKeepJsonLd(rawHtml);
    const snippets = [];
    const seen = new Map();   // text → {category, count, sample_pos}

    // 1) JSON-LD blocks (sentinel-wrapped)
    const jsonldRe = /JSONLD_START([\s\S]*?)JSONLD_END/g;
    let jm;
    while ((jm = jsonldRe.exec(cleaned)) !== null) {
        const body = jm[1];
        // Pull out string values from JSON
        const strings = body.match(/"([^"\\]|\\.)*"/g) || [];
        for (const s of strings) {
            const raw = s.slice(1, -1);
            if (!ARABIC_RE.test(raw)) continue;
            const t = raw.replace(/\s+/g, ' ').trim();
            if (!t) continue;
            if (!seen.has(t)) seen.set(t, { category: 'jsonld', count: 0, sample_pos: jm.index });
            seen.get(t).count++;
        }
    }
    const noJsonLd = cleaned.replace(jsonldRe, '');

    // 2) Element text content + attribute values
    // Walk through tags to know parent context
    const tagRe = /<(\/?)([a-z][a-z0-9-]*)([^>]*)>([^<]*)/gi;
    let tm;
    let openStack = []; // stack of { tag, hasI18n, classes }
    while ((tm = tagRe.exec(noJsonLd)) !== null) {
        const isClose = tm[1] === '/';
        const tag = tm[2].toLowerCase();
        const attrs = tm[3] || '';
        const tail = tm[4] || '';

        if (isClose) {
            // pop matching tag
            for (let i = openStack.length - 1; i >= 0; i--) {
                if (openStack[i].tag === tag) {
                    openStack.splice(i, 1);
                    break;
                }
            }
        } else {
            // self-closing or open
            const isSelfClosing = /\/\s*$/.test(attrs);
            const hasI18n = /\bdata-i18n(?:-placeholder|-title|-aria-label)?\s*=/.test(attrs);
            const classMatch = attrs.match(/\bclass\s*=\s*"([^"]*)"/);
            const classes = classMatch ? classMatch[1] : '';
            // Also check current attrs for visible-text attributes (placeholder/title/aria-label/alt)
            const attrTextRe = /\b(placeholder|title|aria-label|alt)\s*=\s*"([^"]+)"/gi;
            let am;
            while ((am = attrTextRe.exec(attrs)) !== null) {
                const v = am[2].replace(/\s+/g, ' ').trim();
                if (ARABIC_RE.test(v)) {
                    const cat = hasI18n ? 'data-i18n' : categorizeByContext(classes, openStack);
                    if (!seen.has(v)) seen.set(v, { category: cat, count: 0, sample_pos: tm.index });
                    seen.get(v).count++;
                }
            }
            if (!isSelfClosing && !VOID_TAGS.has(tag)) {
                openStack.push({ tag, hasI18n, classes });
            }
        }

        // tail text — belongs to the most-recently-open tag
        const text = tail.replace(/\s+/g, ' ').trim();
        if (text && ARABIC_RE.test(text)) {
            const top = openStack[openStack.length - 1] || null;
            const ancestorHasI18n = openStack.some(s => s.hasI18n);
            let cat;
            if (ancestorHasI18n) cat = 'data-i18n';
            else cat = categorizeByContext(top ? top.classes : '', openStack);
            if (!seen.has(text)) seen.set(text, { category: cat, count: 0, sample_pos: tm.index });
            seen.get(text).count++;
        }
    }

    for (const [text, data] of seen) {
        snippets.push({ text, ...data });
    }
    return snippets;
}

const VOID_TAGS = new Set(['img','br','hr','input','meta','link','source','area','base','col','embed','wbr']);

function categorizeByContext(classStr, ancestorStack) {
    // Religious contexts to allow
    const allowedClasses = /(hadith-section|daily-hadith|dua-text|dua-item|dua-reference|hadith\.daily|hadith\.reference)/;
    if (allowedClasses.test(classStr)) return 'allowed-religious';
    for (const a of ancestorStack) {
        if (allowedClasses.test(a.classes)) return 'allowed-religious';
    }
    return 'hardcoded';
}

// ── Audit loop ─────────────────────────────────────────────────────────
async function fetchHtml(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
    return r.text();
}

function summarize(snippets) {
    const byCat = {};
    for (const s of snippets) {
        if (!byCat[s.category]) byCat[s.category] = [];
        byCat[s.category].push(s);
    }
    return byCat;
}

function topExamples(byCat, total = 20) {
    const order = ['data-i18n', 'hardcoded', 'jsonld', 'allowed-religious'];
    const out = [];
    let remaining = total;
    for (const cat of order) {
        const list = (byCat[cat] || []).slice(0, Math.ceil(total / 2));
        for (const s of list) {
            if (remaining-- <= 0) break;
            out.push(`[${cat}] ${s.text.slice(0, 100)}`);
        }
    }
    return out;
}

function reportLang(lang, snippets) {
    const total = snippets.length;
    const byCat = summarize(snippets);
    const counts = {
        'data-i18n':         (byCat['data-i18n'] || []).length,
        'hardcoded':         (byCat['hardcoded'] || []).length,
        'jsonld':            (byCat['jsonld'] || []).length,
        'allowed-religious': (byCat['allowed-religious'] || []).length,
    };
    return { lang, total, ...counts, top: topExamples(byCat, 20) };
}

async function auditStrict(lang) {
    const url = `${BASE}/${lang}${SAMPLE_PATH}`;
    const html = await fetchHtml(url);
    const snippets = extractArabicSnippets(html);
    return reportLang(lang, snippets);
}

async function auditFuzzy(lang) {
    // For Urdu: count hits of known-Arabic-only phrases
    const url = `${BASE}/${lang}${SAMPLE_PATH}`;
    const html = await fetchHtml(url);
    const cleaned = stripScriptsButKeepJsonLd(html).replace(/JSONLD_START[\s\S]*?JSONLD_END/g, '');
    const found = [];
    for (const phrase of URDU_LEAK_PHRASES) {
        const occurrences = (cleaned.match(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        if (occurrences > 0) found.push({ phrase, occurrences });
    }
    return {
        lang,
        mode: 'fuzzy (Urdu — known-phrase scan)',
        total_phrases_leaked: found.length,
        leaks: found,
    };
}

// ── Main ───────────────────────────────────────────────────────────────
console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  UAT-3a — i18n Leakage Audit`);
console.log(`══════════════════════════════════════════════════════════════════`);
console.log(`  Base: ${BASE}`);
console.log(`  Sample path: ${SAMPLE_PATH}`);
console.log(`  Mode: REPORT (no fail) — for UAT-3b/3c planning\n`);

const reports = { strict: [], fuzzy: [] };

console.log(`▌ STRICT detection (Arabic Unicode → leakage in non-Arabic-script langs)`);
console.log(`  ─────────────────────────────────────────────────────────────────`);
for (const lang of STRICT_LANGS) {
    try {
        const r = await auditStrict(lang);
        reports.strict.push(r);
        console.log(`  /${lang}/  total=${String(r.total).padStart(4)}   data-i18n=${String(r['data-i18n']).padStart(4)}   hardcoded=${String(r.hardcoded).padStart(4)}   jsonld=${String(r.jsonld).padStart(3)}   religious=${r['allowed-religious']}`);
    } catch (e) {
        console.log(`  /${lang}/  ERROR: ${e.message}`);
    }
}

console.log(`\n▌ FUZZY detection (Urdu — looks for known-Arabic-source phrases)`);
console.log(`  ─────────────────────────────────────────────────────────────────`);
for (const lang of FUZZY_LANGS) {
    try {
        const r = await auditFuzzy(lang);
        reports.fuzzy.push(r);
        console.log(`  /${lang}/  phrases-leaked=${r.total_phrases_leaked} / ${URDU_LEAK_PHRASES.length}`);
    } catch (e) {
        console.log(`  /${lang}/  ERROR: ${e.message}`);
    }
}

// ── Detailed per-language top examples ─────────────────────────────────
console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  Top examples per language (first 20 each)`);
console.log(`══════════════════════════════════════════════════════════════════`);
for (const r of reports.strict) {
    console.log(`\n  /${r.lang}/  →  ${r.total} unique Arabic strings`);
    console.log(`  Categories: data-i18n=${r['data-i18n']}, hardcoded=${r.hardcoded}, jsonld=${r.jsonld}, religious=${r['allowed-religious']}`);
    console.log(`  ─────────────────────────────────────────────────────────────`);
    r.top.forEach((line, i) => console.log(`    ${String(i + 1).padStart(2)}. ${line}`));
}

for (const r of reports.fuzzy) {
    console.log(`\n  /${r.lang}/  →  ${r.total_phrases_leaked} known-leak phrases found`);
    console.log(`  ─────────────────────────────────────────────────────────────`);
    r.leaks.slice(0, 25).forEach((l, i) =>
        console.log(`    ${String(i + 1).padStart(2)}. (×${l.occurrences})  ${l.phrase}`)
    );
}

console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  Report-mode complete — no fail. predeploy-check unchanged.`);
console.log(`  Next: UAT-3b (SSR data-i18n translation) + UAT-3c (hardcoded → data-i18n).`);
console.log(`══════════════════════════════════════════════════════════════════\n`);

process.exit(0);
