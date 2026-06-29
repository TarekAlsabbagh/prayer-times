'use strict';
// ════════════════════════════════════════════════════════════════════════════
// MOON-CITY-MONTH-SEO-UNIVERSAL-FIX-1 (2026-06-28)
// Pure, dependency-free SEO title/description fitter for the moon MONTH page
// (/moon/{country}/{city}/{YYYY}/{MM}).
//
// WHY: the previous title logic used hand-tuned per-lang candidate arrays. A city
// one codepoint shorter than the samples (e.g. ar/Madrid/January = 49) fell out of
// the 50–60 window. This module replaces that with an ALGORITHMIC fitter that works
// for ANY (language, city name, month name, year) — short, very long, or special-char
// cities — with NO hardcoded per-city exceptions.
//
// HOW (Title Length Universal Fitter):
//   1. Build a `base` title that ALWAYS contains: moon calendar + city + month + year.
//   2. Append GRADUATED, NATURAL keyword suffixes (moon phases / illumination /
//      Hijri month) of increasing length — never keyword stuffing, every fragment is
//      a legitimate descriptor of this page.
//   3. Also offer shorter `pipe` / `min` forms for very long city names (overflow).
//   4. Pick the candidate whose CODEPOINT length (as an SEO tool measures it) is in
//      [50,60]; if several, the richest (closest to 60). If none fit, the longest ≤60;
//      if even the shortest exceeds 60 (extreme city name), the shortest (documented).
//   5. The city, month and year are NEVER dropped from the chosen title.
//
// Shared by server.js (SSR) and scripts/_matrix_moon_month_seo_universal_fix_1.mjs
// (exhaustive pure-function matrix: every city length × 12 months × 10 langs).
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
// base = the core title (moon calendar + city + month + year), builder (C,M,Y).
// sfx = ASCENDING natural suffix fragments appended after base (which ends in the year).
//   Steps are kept fine (~5–8 cp) so that as the base grows/shrinks with the city
//   name, SOME (base+suffix) always lands in the 50–60 window. Every fragment is a
//   legitimate descriptor (moon phases / illumination / Hijri month) — never stuffing.
// over = graduated SHORTER forms (pipe taglines) for VERY LONG city names, where even
//   the bare base exceeds 60; ordered long→short so a mid form lands in [50,60].
const TITLE = {
    ar: {
        base: (C, M, Y) => `تقويم القمر في ${C} لشهر ${M} ${Y}`,
        sfx: [' ومراحله', ' ومراحل القمر', ' ومراحل القمر والإضاءة', ' ومراحل القمر والشهر الهجري', ' ومراحل القمر والإضاءة والشهر الهجري'],
        over: [(C, M, Y) => `تقويم القمر في ${C} | ${M} ${Y}`, (C, M, Y) => `أطوار القمر في ${C} | ${M} ${Y}`, (C, M, Y) => `القمر في ${C} | ${M} ${Y}`]
    },
    en: {
        base: (C, M, Y) => `Moon Calendar in ${C} for ${M} ${Y}`,
        sfx: [' & Phases', ' and Moon Phases', ' and Phases & Hijri', ' and Phases & Illumination', ' and Moon Phases & Hijri Month', ' and Phases, Illumination & Hijri Month'],
        over: [(C, M, Y) => `Moon Calendar in ${C} | ${M} ${Y}`, (C, M, Y) => `Moon Phases in ${C} | ${M} ${Y}`, (C, M, Y) => `Moon in ${C} | ${M} ${Y}`]
    },
    fr: {
        base: (C, M, Y) => `Calendrier lunaire à ${C} pour ${M} ${Y}`,
        sfx: [' et phases', ' et phases lunaires', ' et phases et illumination', ' et phases lunaires et mois hégirien'],
        over: [(C, M, Y) => `Calendrier lunaire à ${C} | ${M} ${Y}`, (C, M, Y) => `Phases lunaires à ${C} | ${M} ${Y}`, (C, M, Y) => `Lune à ${C} | ${M} ${Y}`]
    },
    tr: {
        base: (C, M, Y) => `${C} Ay Takvimi: ${M} ${Y}`,
        sfx: [' — Evreler', ' — Ay Evreleri', ' — Evreler ve Hicri Ay', ' — Ay Evreleri ve Hicri Ay', ' — Evreler, Aydınlanma ve Hicri', ' — Ay Evreleri, Aydınlanma ve Hicri Ay'],
        over: [(C, M, Y) => `${C} Ay Takvimi | ${M} ${Y}`, (C, M, Y) => `${C} Ay Evreleri | ${M} ${Y}`, (C, M, Y) => `${C} Ay | ${M} ${Y}`]
    },
    ur: {
        base: (C, M, Y) => `${C} میں چاند کا تقویم: ${M} ${Y}`,
        sfx: [' اور مراحل', ' اور چاند کے مراحل', ' اور چاند کے مراحل و روشنی', ' اور چاند کے مراحل و ہجری مہینہ'],
        over: [(C, M, Y) => `${C} چاند کا تقویم | ${M} ${Y}`, (C, M, Y) => `${C} چاند کے مراحل | ${M} ${Y}`, (C, M, Y) => `${C} چاند | ${M} ${Y}`]
    },
    de: {
        base: (C, M, Y) => `Mondkalender in ${C} für ${M} ${Y}`,
        sfx: [' und Phasen', ' und Mondphasen', ' und Mondphasen & Hidschri', ' und Mondphasen & Beleuchtung', ' und Mondphasen, Beleuchtung & Hidschri'],
        over: [(C, M, Y) => `Mondkalender in ${C} | ${M} ${Y}`, (C, M, Y) => `Mondphasen in ${C} | ${M} ${Y}`, (C, M, Y) => `Mond in ${C} | ${M} ${Y}`]
    },
    id: {
        base: (C, M, Y) => `Kalender Bulan ${C} untuk ${M} ${Y}`,
        sfx: [' dan Fase', ' dan Fase Bulan', ' dan Fase Bulan & Hijriah', ' dan Fase Bulan & Iluminasi', ' dan Fase Bulan, Iluminasi & Hijriah'],
        over: [(C, M, Y) => `Kalender Bulan ${C} | ${M} ${Y}`, (C, M, Y) => `Fase Bulan ${C} | ${M} ${Y}`, (C, M, Y) => `Bulan ${C} | ${M} ${Y}`]
    },
    es: {
        base: (C, M, Y) => `Calendario lunar en ${C} para ${M} ${Y}`,
        sfx: [' y fases', ' y fases lunares', ' y fases de la Luna', ' y fases lunares e iluminación', ' y fases de la Luna y mes hijri'],
        over: [(C, M, Y) => `Calendario lunar en ${C} | ${M} ${Y}`, (C, M, Y) => `Fases lunares en ${C} | ${M} ${Y}`, (C, M, Y) => `Luna en ${C} | ${M} ${Y}`]
    },
    bn: {
        base: (C, M, Y) => `${C}-এ ${M} ${Y} এর চাঁদের ক্যালেন্ডার`,
        sfx: [' ও দশা', ' দশা ও হিজরি মাস', ' ও দশা ও হিজরি মাস', ' দশা, আলোকন ও হিজরি মাস', ' ও দশা, আলোকন ও হিজরি মাস'],
        over: [(C, M, Y) => `${C} চাঁদের ক্যালেন্ডার | ${M} ${Y}`, (C, M, Y) => `${C} চাঁদের দশা | ${M} ${Y}`, (C, M, Y) => `${C} চাঁদ | ${M} ${Y}`]
    },
    ms: {
        base: (C, M, Y) => `Kalendar Bulan ${C} untuk ${M} ${Y}`,
        sfx: [' dan Fasa', ' dan Fasa Bulan', ' dan Fasa Bulan & Hijrah', ' dan Fasa Bulan & Pencahayaan', ' dan Fasa Bulan, Pencahayaan & Hijrah'],
        over: [(C, M, Y) => `Kalendar Bulan ${C} | ${M} ${Y}`, (C, M, Y) => `Fasa Bulan ${C} | ${M} ${Y}`, (C, M, Y) => `Bulan ${C} | ${M} ${Y}`]
    }
};

// Build the full candidate ladder for a language (order is irrelevant — pickInWindow
// scans all and chooses by length): base, every base+suffix, and every overflow form.
function titleCandidates(lang, city, monthName, year) {
    const P = TITLE[lang] || TITLE.en;
    const C = String(city == null ? '' : city);
    const M = String(monthName == null ? '' : monthName);
    const Y = String(year == null ? '' : year);
    const base = P.base(C, M, Y);
    return [base, ...P.sfx.map(s => base + s), ...P.over.map(f => f(C, M, Y))];
}

function fitMonthTitle(lang, city, monthName, year) {
    return pickInWindow(titleCandidates(lang, city, monthName, year), 50, 60);
}

// ── Per-language DESCRIPTION parts ──────────────────────────────────────────
// Ported from the reviewed server.js month-meta strings. long→mid→short, window [120,160].
const DESC = {
    long: {
        ar: (C, M, Y) => `تقويم القمر في ${C} لشهر ${M} ${Y}: طور القمر اليوميّ، نسبة الإضاءة، البدر والمحاق، رؤية الهلال، والتقويم الهجريّ المقابل.`,
        en: (C, M, Y) => `Moon calendar in ${C} for ${M} ${Y}: daily phase, illumination, full moon and new moon dates, hilal visibility, and matching Hijri calendar.`,
        fr: (C, M, Y) => `Calendrier lunaire à ${C} pour ${M} ${Y} : phase quotidienne, illumination, dates de pleine et nouvelle lune, visibilité du croissant et calendrier hégirien correspondant.`,
        tr: (C, M, Y) => `${C} için ${M} ${Y} ay takvimi: günlük evre, aydınlanma, dolunay ve yeni ay tarihleri, hilal görünürlüğü ve karşılık gelen hicri takvim.`,
        ur: (C, M, Y) => `${C} میں ${M} ${Y} کے لیے چاند کی تقویم: روزانہ طور، روشنی، بدر اور نئے چاند کی تاریخیں، ہلال کی رؤیت اور متعلقہ ہجری تقویم۔`,
        de: (C, M, Y) => `Mondkalender in ${C} für ${M} ${Y}: tägliche Phase, Beleuchtung, Vollmond- und Neumonddaten, Hilal-Sichtbarkeit und passender Hidschri-Kalender.`,
        id: (C, M, Y) => `Kalender bulan di ${C} untuk ${M} ${Y}: fase harian, iluminasi, tanggal purnama dan bulan baru, rukyat hilal, dan kalender Hijriah yang sesuai.`,
        es: (C, M, Y) => `Calendario lunar en ${C} para ${M} ${Y}: fase diaria, iluminación, fechas de luna llena y nueva, visibilidad del hilal y calendario hijri correspondiente.`,
        bn: (C, M, Y) => `${C}-এ ${M} ${Y}-এর জন্য চাঁদের ক্যালেন্ডার: দৈনিক দশা, আলোকসজ্জা, পূর্ণিমা ও অমাবস্যার তারিখ, হিলাল দৃশ্যমানতা এবং সংশ্লিষ্ট হিজরি ক্যালেন্ডার।`,
        ms: (C, M, Y) => `Kalendar bulan di ${C} untuk ${M} ${Y}: fasa harian, pencahayaan, tarikh bulan purnama dan anak bulan, rukyah hilal serta kalendar Hijrah yang sepadan.`
    },
    mid: {
        ar: (C, M, Y) => `تقويم القمر في ${C} لشهر ${M} ${Y}: طور القمر اليوميّ، نسبة الإضاءة، البدر والمحاق، والتقويم الهجريّ المقابل.`,
        en: (C, M, Y) => `Moon calendar in ${C} for ${M} ${Y}: daily moon phase, illumination, full moon and new moon dates, and the matching Hijri calendar.`,
        fr: (C, M, Y) => `Calendrier lunaire à ${C} pour ${M} ${Y} : phase quotidienne, illumination, dates de pleine et nouvelle lune et calendrier hégirien correspondant.`,
        tr: (C, M, Y) => `${C} için ${M} ${Y} ay takvimi: günlük evre, aydınlanma, dolunay ve yeni ay tarihleri ve karşılık gelen hicri takvim.`,
        ur: (C, M, Y) => `${C} میں ${M} ${Y} کے لیے چاند کی تقویم: روزانہ طور، روشنی، بدر اور نئے چاند کی تاریخیں اور متعلقہ ہجری تقویم۔`,
        de: (C, M, Y) => `Mondkalender in ${C} für ${M} ${Y}: tägliche Mondphase, Beleuchtung, Vollmond- und Neumonddaten und passender Hidschri-Kalender.`,
        id: (C, M, Y) => `Kalender bulan di ${C} untuk ${M} ${Y}: fase harian, iluminasi, tanggal purnama dan bulan baru, serta kalender Hijriah yang sesuai.`,
        es: (C, M, Y) => `Calendario lunar en ${C} para ${M} ${Y}: fase diaria, iluminación, fechas de luna llena y nueva y calendario hijri correspondiente.`,
        bn: (C, M, Y) => `${C}-এ ${M} ${Y}-এর চাঁদের ক্যালেন্ডার: দৈনিক দশা, আলোকসজ্জা, পূর্ণিমা ও অমাবস্যার তারিখ এবং সংশ্লিষ্ট হিজরি ক্যালেন্ডার।`,
        ms: (C, M, Y) => `Kalendar bulan di ${C} untuk ${M} ${Y}: fasa harian, pencahayaan, tarikh bulan purnama dan anak bulan serta kalendar Hijrah yang sepadan.`
    },
    short: {
        ar: (C, M, Y) => `تقويم القمر في ${C} لشهر ${M} ${Y}: طور القمر اليوميّ ونسبة الإضاءة والتقويم الهجريّ المقابل.`,
        en: (C, M, Y) => `Moon calendar in ${C} for ${M} ${Y}: daily moon phase, illumination and the matching Hijri calendar.`,
        fr: (C, M, Y) => `Calendrier lunaire à ${C} pour ${M} ${Y} : phase quotidienne, illumination et calendrier hégirien correspondant.`,
        tr: (C, M, Y) => `${C} için ${M} ${Y} ay takvimi: günlük evre, aydınlanma ve karşılık gelen hicri takvim.`,
        ur: (C, M, Y) => `${C} میں ${M} ${Y} کے لیے چاند کی تقویم: روزانہ طور، روشنی اور متعلقہ ہجری تقویم۔`,
        de: (C, M, Y) => `Mondkalender in ${C} für ${M} ${Y}: tägliche Mondphase, Beleuchtung und passender Hidschri-Kalender.`,
        id: (C, M, Y) => `Kalender bulan di ${C} untuk ${M} ${Y}: fase harian, iluminasi dan kalender Hijriah yang sesuai.`,
        es: (C, M, Y) => `Calendario lunar en ${C} para ${M} ${Y}: fase diaria, iluminación y calendario hijri correspondiente.`,
        bn: (C, M, Y) => `${C}-এ ${M} ${Y}-এর চাঁদের ক্যালেন্ডার: দৈনিক দশা, আলোকসজ্জা এবং সংশ্লিষ্ট হিজরি ক্যালেন্ডার।`,
        ms: (C, M, Y) => `Kalendar bulan di ${C} untuk ${M} ${Y}: fasa harian, pencahayaan dan kalendar Hijrah yang sepadan.`
    },
    // Extra-long pad for very SHORT city names (keeps meta ≥120 even at min city length).
    xlong: {
        ar: (C, M, Y) => `تقويم القمر في ${C} لشهر ${M} ${Y}: طور القمر اليوميّ، نسبة الإضاءة، عمر القمر، البدر والمحاق، رؤية الهلال، والتقويم الهجريّ المقابل بتوقيت المدينة.`,
        en: (C, M, Y) => `Moon calendar in ${C} for ${M} ${Y}: daily phase, illumination, moon age, full moon and new moon dates, hilal visibility, and the matching Hijri calendar in local time.`,
        fr: (C, M, Y) => `Calendrier lunaire à ${C} pour ${M} ${Y} : phase quotidienne, illumination, âge de la Lune, dates de pleine et nouvelle lune, visibilité du croissant et calendrier hégirien correspondant.`,
        tr: (C, M, Y) => `${C} için ${M} ${Y} ay takvimi: günlük evre, aydınlanma, ay yaşı, dolunay ve yeni ay tarihleri, hilal görünürlüğü ve karşılık gelen hicri takvim (yerel saat).`,
        ur: (C, M, Y) => `${C} میں ${M} ${Y} کے لیے چاند کی تقویم: روزانہ طور، روشنی، چاند کی عمر، بدر اور نئے چاند کی تاریخیں، ہلال کی رؤیت اور متعلقہ ہجری تقویم مقامی وقت کے مطابق۔`,
        de: (C, M, Y) => `Mondkalender in ${C} für ${M} ${Y}: tägliche Phase, Beleuchtung, Mondalter, Vollmond- und Neumonddaten, Hilal-Sichtbarkeit und passender Hidschri-Kalender (Ortszeit).`,
        id: (C, M, Y) => `Kalender bulan di ${C} untuk ${M} ${Y}: fase harian, iluminasi, usia Bulan, tanggal purnama dan bulan baru, rukyat hilal, dan kalender Hijriah yang sesuai (waktu lokal).`,
        es: (C, M, Y) => `Calendario lunar en ${C} para ${M} ${Y}: fase diaria, iluminación, edad de la Luna, fechas de luna llena y nueva, visibilidad del hilal y calendario hijri correspondiente (hora local).`,
        bn: (C, M, Y) => `${C}-এ ${M} ${Y}-এর জন্য চাঁদের ক্যালেন্ডার: দৈনিক দশা, আলোকসজ্জা, চাঁদের বয়স, পূর্ণিমা ও অমাবস্যার তারিখ, হিলাল দৃশ্যমানতা এবং সংশ্লিষ্ট হিজরি ক্যালেন্ডার (স্থানীয় সময়)।`,
        ms: (C, M, Y) => `Kalendar bulan di ${C} untuk ${M} ${Y}: fasa harian, pencahayaan, usia Bulan, tarikh bulan purnama dan anak bulan, rukyah hilal serta kalendar Hijrah yang sepadan (waktu tempatan).`
    },
    // Extra-short for very LONG city names (keeps meta ≤160).
    xshort: {
        ar: (C, M, Y) => `تقويم القمر في ${C} لشهر ${M} ${Y}: الطور اليوميّ والتقويم الهجريّ المقابل.`,
        en: (C, M, Y) => `Moon calendar in ${C} for ${M} ${Y}: daily phase and the matching Hijri calendar.`,
        fr: (C, M, Y) => `Calendrier lunaire à ${C} pour ${M} ${Y} : phase quotidienne et calendrier hégirien.`,
        tr: (C, M, Y) => `${C} için ${M} ${Y} ay takvimi: günlük evre ve hicri takvim.`,
        ur: (C, M, Y) => `${C} میں ${M} ${Y} کے لیے چاند کی تقویم: روزانہ طور اور ہجری تقویم۔`,
        de: (C, M, Y) => `Mondkalender in ${C} für ${M} ${Y}: tägliche Phase und Hidschri-Kalender.`,
        id: (C, M, Y) => `Kalender bulan di ${C} untuk ${M} ${Y}: fase harian dan kalender Hijriah.`,
        es: (C, M, Y) => `Calendario lunar en ${C} para ${M} ${Y}: fase diaria y calendario hijri.`,
        bn: (C, M, Y) => `${C}-এ ${M} ${Y}-এর চাঁদের ক্যালেন্ডার: দৈনিক দশা ও হিজরি ক্যালেন্ডার।`,
        ms: (C, M, Y) => `Kalendar bulan di ${C} untuk ${M} ${Y}: fasa harian dan kalendar Hijrah.`
    }
};

function descCandidates(lang, city, monthName, year) {
    const C = String(city == null ? '' : city);
    const M = String(monthName == null ? '' : monthName);
    const Y = String(year == null ? '' : year);
    const tiers = ['xlong', 'long', 'mid', 'short', 'xshort'];
    return tiers.map(t => (DESC[t][lang] || DESC[t].en)(C, M, Y));
}

function fitMonthDesc(lang, city, monthName, year) {
    return pickInWindow(descCandidates(lang, city, monthName, year), 120, 160);
}

module.exports = {
    cpLen, pickInWindow,
    TITLE, DESC,
    titleCandidates, descCandidates,
    fitMonthTitle, fitMonthDesc
};
