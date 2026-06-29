'use strict';
// ════════════════════════════════════════════════════════════════════════════
// MOON-CITY-DAY-TITLE-META-ALL-LANGS-FIX-1 (2026-06-29)
// Pure, dependency-free SEO title/description fitter for the moon DATED DAY page
// (/moon/{country}/{city}/{YYYY}/{MM}/{DD}).
//
// WHY: the previous in-server day-title ladder (long/medium/short/fallback) had a
// GAP — for short city names the medium/long jumped over 60 while short/fallback sat
// below 50, so nothing landed in [50,60] (e.g. en/Riyadh = 36). And the meta was a
// length-aware ladder for EN only; the other 9 langs used a single fixed template
// built on the date-WITH-Hijri-equivalent string → fr/tr/de/id/es/ms all > 160.
//
// This module replaces BOTH with an ALGORITHMIC fitter that works for ANY
// (language, city name, localized date label) — short, very long, or special-char
// cities — across all 10 langs, with NO hardcoded per-city exceptions and NO
// English fallback. Mirrors js/moon-month-seo.js (MOON-CITY-MONTH-SEO-UNIVERSAL-FIX-1).
//
// HOW:
//   TITLE: a `base` that ALWAYS has moon + city + the date + the day-page meaning
//     ("moon phase … on {date}"); GRADUATED natural suffixes (illumination / moon age /
//     details) appended in fine steps so SOME (base+suffix) lands in [50,60] as the base
//     grows/shrinks with city+date length; plus shorter `over` pipe forms for very long
//     cities. City and date are NEVER dropped. Pick the richest candidate in [50,60].
//   DESC: 5 tiers (xlong→long→mid→short→xshort) on the Gregorian date label (shorter
//     than the date-with-Hijri-equivalent string); pick the richest in [120,160].
//
// Shared by server.js (SSR) and scripts/_matrix_moon_day_seo_all_langs_fix_1.mjs
// (exhaustive pure-function matrix: every city length × several date lengths × 10 langs).
// ════════════════════════════════════════════════════════════════════════════

// Codepoint length — matches JS [...s].length / what SEO tools count (NOT graphemes).
const cpLen = (s) => [...String(s == null ? '' : s)].length;

// Pick the richest candidate inside [lo,hi]; else the longest ≤ hi; else the shortest.
function pickInWindow(cands, lo, hi) {
    const valid = cands.filter(s => typeof s === 'string' && s.length > 0);
    if (!valid.length) return '';
    const inR = valid.filter(s => { const n = cpLen(s); return n >= lo && n <= hi; });
    if (inR.length) return inR.reduce((a, b) => (cpLen(a) >= cpLen(b) ? a : b));
    const under = valid.filter(s => cpLen(s) <= hi);
    if (under.length) return under.reduce((a, b) => (cpLen(a) >= cpLen(b) ? a : b));
    return valid.reduce((a, b) => (cpLen(a) <= cpLen(b) ? a : b));
}

// ── Per-language TITLE parts ────────────────────────────────────────────────
// base = core day title (moon phase + city + date), builder (C,D).
// sfx = ASCENDING natural fragments (illumination / moon age / details) appended to base;
//   fine steps (~6–14 cp) so SOME (base+suffix) always lands in [50,60].
// over = graduated SHORTER pipe forms for VERY LONG city names (even bare base > 60);
//   ordered long→short; city + date always retained.
const TITLE = {
    ar: {
        base: (C, D) => `طور القمر في ${C} يوم ${D}`,
        sfx: [' وإضاءته', ' ونسبة الإضاءة', ' ونسبة الإضاءة والعمر', ' ونسبة الإضاءة والعمر والمطلع', ' ونسبة الإضاءة والعمر والمطلع والمغيب'],
        over: [(C, D) => `حالة القمر في ${C} | ${D}`, (C, D) => `القمر في ${C} | ${D}`, (C, D) => `القمر: ${C}، ${D}`]
    },
    en: {
        base: (C, D) => `Moon Phase in ${C} on ${D}`,
        sfx: [' | Phase', ' | Illumination', ' | Phase & Illumination', ' | Illumination, Age & Times', ' | Phase, Illumination & Details'],
        over: [(C, D) => `Moon Phase in ${C} | ${D}`, (C, D) => `Moon in ${C} | ${D}`, (C, D) => `Moon: ${C}, ${D}`]
    },
    fr: {
        base: (C, D) => `Phase de la Lune à ${C} le ${D}`,
        sfx: [' | Âge', ' | Illumination', ' | Phase et illumination', ' | Illumination, âge et heures', ' | Phase, illumination et détails'],
        over: [(C, D) => `Phase lunaire à ${C} | ${D}`, (C, D) => `Lune à ${C} | ${D}`, (C, D) => `Lune : ${C}, ${D}`]
    },
    tr: {
        base: (C, D) => `${C} Ay Evresi: ${D}`,
        sfx: [' | Evre', ' | Aydınlanma', ' | Evre ve Aydınlanma', ' | Aydınlanma, Yaş ve Saatler', ' | Evre, Aydınlanma ve Detaylar'],
        over: [(C, D) => `${C} Ay Evresi | ${D}`, (C, D) => `${C} Ay | ${D}`, (C, D) => `Ay: ${C}, ${D}`]
    },
    ur: {
        base: (C, D) => `${C} میں چاند کا طور: ${D}`,
        sfx: [' | روشنی', ' | طور اور روشنی', ' | روشنی اور عمر', ' | طور، روشنی اور عمر', ' | طور، روشنی اور تفصیلات'],
        over: [(C, D) => `${C} چاند کا طور | ${D}`, (C, D) => `${C} چاند | ${D}`, (C, D) => `چاند: ${C}، ${D}`]
    },
    de: {
        base: (C, D) => `Mondphase in ${C} am ${D}`,
        sfx: [' | Phase', ' | Beleuchtung', ' | Phase und Beleuchtung', ' | Beleuchtung, Alter & Zeiten', ' | Phase, Beleuchtung und Details'],
        over: [(C, D) => `Mondphase in ${C} | ${D}`, (C, D) => `Mond in ${C} | ${D}`, (C, D) => `Mond: ${C}, ${D}`]
    },
    id: {
        base: (C, D) => `Fase Bulan di ${C} pada ${D}`,
        sfx: [' | Fase', ' | Iluminasi', ' | Fase dan Iluminasi', ' | Iluminasi, Usia dan Waktu', ' | Fase, Iluminasi dan Detail'],
        over: [(C, D) => `Fase Bulan ${C} | ${D}`, (C, D) => `Bulan ${C} | ${D}`, (C, D) => `Bulan: ${C}, ${D}`]
    },
    es: {
        base: (C, D) => `Fase de la Luna en ${C} el ${D}`,
        sfx: [' | Fase', ' | Iluminación', ' | Fase e iluminación', ' | Iluminación, edad y horas', ' | Fase, iluminación y detalles'],
        over: [(C, D) => `Fase lunar en ${C} | ${D}`, (C, D) => `Luna en ${C} | ${D}`, (C, D) => `Luna: ${C}, ${D}`]
    },
    bn: {
        base: (C, D) => `${C}-এ ${D} তারিখে চাঁদের দশা`,
        sfx: [' | দশা', ' | আলোকসজ্জা', ' | দশা ও আলোকসজ্জা', ' | আলোকসজ্জা, বয়স ও সময়', ' | দশা, আলোকসজ্জা ও বিবরণ'],
        over: [(C, D) => `${C} চাঁদের দশা | ${D}`, (C, D) => `${C} চাঁদ | ${D}`, (C, D) => `চাঁদ: ${C}, ${D}`]
    },
    ms: {
        base: (C, D) => `Fasa Bulan di ${C} pada ${D}`,
        sfx: [' | Fasa', ' | Pencahayaan', ' | Fasa dan Pencahayaan', ' | Pencahayaan, Usia dan Waktu', ' | Fasa, Pencahayaan dan Butiran'],
        over: [(C, D) => `Fasa Bulan ${C} | ${D}`, (C, D) => `Bulan ${C} | ${D}`, (C, D) => `Bulan: ${C}, ${D}`]
    }
};

// Build the full candidate ladder (order irrelevant — pickInWindow scans all):
// base, every base+suffix, and every overflow form.
function titleCandidates(lang, city, dateLabel) {
    const P = TITLE[lang] || TITLE.en;
    const C = String(city == null ? '' : city);
    const D = String(dateLabel == null ? '' : dateLabel);
    const base = P.base(C, D);
    return [base, ...P.sfx.map(s => base + s), ...P.over.map(f => f(C, D))];
}

function fitDayTitle(lang, city, dateLabel) {
    return pickInWindow(titleCandidates(lang, city, dateLabel), 50, 60);
}

// ── Per-language DESCRIPTION parts ──────────────────────────────────────────
// Day meta: moon phase + city + date + day-page facts (illumination / moon age /
// moonrise / moonset / Hijri date / constellation). 5 tiers, window [120,160].
// Built on the Gregorian date label D (no Hijri-equivalent parenthetical → shorter).
const DESC = {
    xlong: {
        ar: (C, D) => `طور القمر في ${C} يوم ${D}: نسبة الإضاءة، عمر القمر، وقت المطلع والمغيب، التاريخ الهجريّ المقابل، والكوكبة — محسوبة بدقّة فلكيّة لتوقيت المدينة.`,
        en: (C, D) => `Moon phase in ${C} on ${D}: illumination, moon age, moonrise, moonset, the matching Hijri date and constellation — computed with precise astronomy for the city.`,
        fr: (C, D) => `Phase de la Lune à ${C} le ${D} : illumination, âge de la Lune, lever et coucher, date hégirienne correspondante et constellation — calculés avec une astronomie précise.`,
        tr: (C, D) => `${C} için ${D} tarihinde Ay evresi: aydınlanma, ay yaşı, doğuş ve batış saatleri, karşılık gelen hicri tarih ve burç bilgileri.`,
        ur: (C, D) => `${C} میں ${D} کو چاند کا طور: روشنی، چاند کی عمر، طلوع و غروب کے اوقات، متعلقہ ہجری تاریخ اور برج — شہر کے لیے درست فلکی حساب سے۔`,
        de: (C, D) => `Mondphase in ${C} am ${D}: Beleuchtung, Mondalter, Auf- und Untergang, das passende Hidschri-Datum und Sternbild — mit präziser Astronomie für die Stadt berechnet.`,
        id: (C, D) => `Fase Bulan di ${C} pada ${D}: iluminasi, usia Bulan, waktu terbit, terbenam, tanggal Hijriah yang sesuai, dan rasi bintang.`,
        es: (C, D) => `Fase de la Luna en ${C} el ${D}: iluminación, edad de la Luna, salida y puesta, la fecha hijrí correspondiente y la constelación.`,
        bn: (C, D) => `${C}-এ ${D} তারিখে চাঁদের দশা: আলোকসজ্জা, চাঁদের বয়স, উদয় ও অস্তের সময়, সংশ্লিষ্ট হিজরি তারিখ, রাশিচক্র ও দৃশ্যমানতা।`,
        ms: (C, D) => `Fasa Bulan di ${C} pada ${D}: pencahayaan, usia Bulan, terbit, terbenam, tarikh Hijrah yang sepadan dan buruj — dikira dengan astronomi tepat untuk bandar.`
    },
    long: {
        ar: (C, D) => `طور القمر في ${C} يوم ${D}: نسبة الإضاءة، عمر القمر، وقت المطلع والمغيب، والتاريخ الهجريّ المقابل — محسوبة بدقّة فلكيّة.`,
        en: (C, D) => `Moon phase in ${C} on ${D}: view illumination, moon age, moonrise, moonset, the matching Hijri date and daily lunar details for this date.`,
        fr: (C, D) => `Phase de la Lune à ${C} le ${D} : illumination, âge de la Lune, heures de lever et de coucher, et date hégirienne correspondante.`,
        tr: (C, D) => `${C} için ${D} tarihinde Ay evresi: aydınlanma, ay yaşı, doğuş ve batış saatleri ve karşılık gelen hicri tarih.`,
        ur: (C, D) => `${C} میں ${D} کو چاند کا طور: روشنی، چاند کی عمر، طلوع و غروب کے اوقات اور متعلقہ ہجری تاریخ — درست فلکی حساب۔`,
        de: (C, D) => `Mondphase in ${C} am ${D}: Beleuchtung, Mondalter, Aufgang, Untergang und das passende Hidschri-Datum — astronomisch berechnet.`,
        id: (C, D) => `Fase Bulan di ${C} pada ${D}: iluminasi, usia Bulan, waktu terbit dan terbenam, serta tanggal Hijriah yang sesuai.`,
        es: (C, D) => `Fase de la Luna en ${C} el ${D}: iluminación, edad de la Luna, salida y puesta, y la fecha hijrí correspondiente.`,
        bn: (C, D) => `${C}-এ ${D} তারিখে চাঁদের দশা: আলোকসজ্জা, চাঁদের বয়স, উদয় ও অস্তের সময় এবং সংশ্লিষ্ট হিজরি তারিখ।`,
        ms: (C, D) => `Fasa Bulan di ${C} pada ${D}: pencahayaan, usia Bulan, waktu terbit dan terbenam, serta tarikh Hijrah yang sepadan.`
    },
    mid: {
        ar: (C, D) => `طور القمر في ${C} يوم ${D}: نسبة الإضاءة، عمر القمر، والمطلع والمغيب، والتاريخ الهجريّ.`,
        en: (C, D) => `Moon phase in ${C} on ${D}: illumination, moon age, moonrise, moonset and the matching Hijri date.`,
        fr: (C, D) => `Phase de la Lune à ${C} le ${D} : illumination, âge, lever et coucher, et date hégirienne.`,
        tr: (C, D) => `${C} için ${D} tarihinde Ay evresi: aydınlanma, ay yaşı, doğuş–batış ve hicri tarih.`,
        ur: (C, D) => `${C} میں ${D} کو چاند کا طور: روشنی، عمر، طلوع و غروب اور ہجری تاریخ۔`,
        de: (C, D) => `Mondphase in ${C} am ${D}: Beleuchtung, Mondalter, Auf- und Untergang und Hidschri-Datum.`,
        id: (C, D) => `Fase Bulan di ${C} pada ${D}: iluminasi, usia Bulan, terbit, terbenam dan tanggal Hijriah.`,
        es: (C, D) => `Fase de la Luna en ${C} el ${D}: iluminación, edad, salida y puesta, y fecha hijrí.`,
        bn: (C, D) => `${C}-এ ${D} তারিখে চাঁদের দশা: আলোকসজ্জা, বয়স, উদয়-অস্ত এবং হিজরি তারিখ।`,
        ms: (C, D) => `Fasa Bulan di ${C} pada ${D}: pencahayaan, usia, terbit, terbenam dan tarikh Hijrah.`
    },
    short: {
        ar: (C, D) => `طور القمر في ${C} يوم ${D}: نسبة الإضاءة وعمر القمر والتاريخ الهجريّ المقابل.`,
        en: (C, D) => `Moon phase in ${C} on ${D}: illumination, moon age and the matching Hijri date.`,
        fr: (C, D) => `Phase de la Lune à ${C} le ${D} : illumination, âge et date hégirienne.`,
        tr: (C, D) => `${C} için ${D} tarihinde Ay evresi: aydınlanma, yaş ve hicri tarih.`,
        ur: (C, D) => `${C} میں ${D} کو چاند کا طور: روشنی، عمر اور ہجری تاریخ۔`,
        de: (C, D) => `Mondphase in ${C} am ${D}: Beleuchtung, Mondalter und Hidschri-Datum.`,
        id: (C, D) => `Fase Bulan di ${C} pada ${D}: iluminasi, usia Bulan dan tanggal Hijriah.`,
        es: (C, D) => `Fase de la Luna en ${C} el ${D}: iluminación, edad y fecha hijrí.`,
        bn: (C, D) => `${C}-এ ${D} তারিখে চাঁদের দশা: আলোকসজ্জা, বয়স ও হিজরি তারিখ।`,
        ms: (C, D) => `Fasa Bulan di ${C} pada ${D}: pencahayaan, usia dan tarikh Hijrah.`
    },
    xshort: {
        ar: (C, D) => `طور القمر في ${C} يوم ${D}: نسبة الإضاءة والتاريخ الهجريّ.`,
        en: (C, D) => `Moon phase in ${C} on ${D}: illumination and the matching Hijri date.`,
        fr: (C, D) => `Phase de la Lune à ${C} le ${D} : illumination et date hégirienne.`,
        tr: (C, D) => `${C} için ${D} tarihinde Ay evresi: aydınlanma ve hicri tarih.`,
        ur: (C, D) => `${C} میں ${D} کو چاند کا طور: روشنی اور ہجری تاریخ۔`,
        de: (C, D) => `Mondphase in ${C} am ${D}: Beleuchtung und Hidschri-Datum.`,
        id: (C, D) => `Fase Bulan di ${C} pada ${D}: iluminasi dan tanggal Hijriah.`,
        es: (C, D) => `Fase de la Luna en ${C} el ${D}: iluminación y fecha hijrí.`,
        bn: (C, D) => `${C}-এ ${D} তারিখে চাঁদের দশা: আলোকসজ্জা ও হিজরি তারিখ।`,
        ms: (C, D) => `Fasa Bulan di ${C} pada ${D}: pencahayaan dan tarikh Hijrah.`
    }
};

function descCandidates(lang, city, dateLabel) {
    const C = String(city == null ? '' : city);
    const D = String(dateLabel == null ? '' : dateLabel);
    const tiers = ['xlong', 'long', 'mid', 'short', 'xshort'];
    return tiers.map(t => (DESC[t][lang] || DESC[t].en)(C, D));
}

function fitDayDesc(lang, city, dateLabel) {
    return pickInWindow(descCandidates(lang, city, dateLabel), 120, 160);
}

module.exports = {
    cpLen, pickInWindow,
    TITLE, DESC,
    titleCandidates, descCandidates,
    fitDayTitle, fitDayDesc
};
