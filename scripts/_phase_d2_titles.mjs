// Phase D2: Localized SEO copy for dynamic city + country pages.
// 5 changes:
//   1. _buildCityDatedTitle — drop ${h} hijri date, "|" separator
//   2. /qibla-in-{city} _qTitles — extend per-lang with "| Compass + Distance"-style suffix
//   3. /prayer-times-in-{country-slug} — reword (cities focus) + add es/bn/ms templates
//   4. /about-{slug}-{lat}-{lng} — full block: 10-lang object + bug fix (_slugToTitle → _resolveCityName)
//   5. /prayer-times-in-{city} desc — replace useEnTxt fallback with 10-lang object
import fs from 'fs';
const file = 'server.js';
const srcRaw = fs.readFileSync(file, 'utf8');
const isCRLF = /\r\n/.test(srcRaw);
const EOL = isCRLF ? '\r\n' : '\n';
const block = (lines) => lines.join(EOL);

function replaceBetween(s, name, startAnchor, endAnchor, newContent) {
  const i = s.indexOf(startAnchor);
  if (i < 0) throw new Error(`${name}: startAnchor not found`);
  const j = s.indexOf(endAnchor, i + startAnchor.length);
  if (j < 0) throw new Error(`${name}: endAnchor not found after startAnchor`);
  const fullEnd = j + endAnchor.length;
  const second = s.indexOf(startAnchor, i + 1);
  if (second >= 0 && second < fullEnd) throw new Error(`${name}: startAnchor non-unique within block`);
  console.log(`OK ${name}: replacing ${fullEnd - i} chars at index ${i}`);
  return s.substring(0, i) + newContent + s.substring(fullEnd);
}

let s = srcRaw;

// ── Block 1: _buildCityDatedTitle ──
{
  const newContent = block([
    '    // صانع title صفحات المدن (10 لغات) — Phase D2: ثابت بلا تاريخ هجريّ، بفاصل |',
    '    // cityLng يُحفَظ كمَعامل لأسباب التوافق فقط (التاريخ الهجريّ ينتقل إلى H1/intro/desc).',
    '    const _buildCityDatedTitle = (cityDisplay, _cityLng) => {',
    '        switch (lang) {',
    '            case \'ar\': return `مواقيت الصلاة في ${cityDisplay} | جدول اليوم واتجاه القبلة`;',
    '            case \'fr\': return `Heures de prière à ${cityDisplay} | Horaires du jour et Qibla`;',
    '            case \'tr\': return `${cityDisplay} Namaz Vakitleri | Günlük Program ve Kıble`;',
    '            case \'ur\': return `${cityDisplay} میں اوقاتِ نماز | آج کا جدول اور سمتِ قبلہ`;',
    '            case \'de\': return `Gebetszeiten in ${cityDisplay} | Tagesplan und Qibla`;',
    '            case \'id\': return `Jadwal Sholat di ${cityDisplay} | Jadwal Hari Ini dan Kiblat`;',
    '            case \'es\': return `Horarios de Oración en ${cityDisplay} | Horario de Hoy y Qibla`;',
    "            case 'bn': return `${cityDisplay}-এ নামাজের সময় | আজকের সূচী ও কিবলা`;",
    '            case \'ms\': return `Waktu Solat di ${cityDisplay} | Jadual Hari Ini dan Kiblat`;',
    "            default:   return `Prayer Times in ${cityDisplay} | Today's Schedule and Qibla`;",
    '        }',
    '    };'
  ]);
  s = replaceBetween(s, '_buildCityDatedTitle',
    '    const _buildCityDatedTitle = (cityDisplay, cityLng) => {',
    '        }' + EOL + '    };',
    newContent);
}

// ── Block 2: /qibla-in-{city} _qTitles ──
{
  const newContent = block([
    '        // Phase D2: extend short titles per language with separator + descriptor',
    '        const _qTitles = {',
    "            ar: `اتجاه القبلة في ${cityDisplay} | البوصلة والمسافة إلى الكعبة`,",
    '            en: `Qibla Direction in ${cityDisplay} | Compass and Distance`,',
    '            fr: `Direction de la Qibla à ${cityDisplay} | Boussole et distance`,',
    '            tr: `${cityDisplay} Kıble Yönü | Kâbe Pusulası ve Uzaklık`,',
    "            ur: `${cityDisplay} سے سمتِ قبلہ | قطب نما اور فاصلہ`,",
    '            de: `Qibla-Richtung in ${cityDisplay} | Kompass und Entfernung`,',
    '            id: `Arah Kiblat di ${cityDisplay} | Kompas dan Jarak ke Kakbah`,',
    '            es: `Dirección de la Qibla en ${cityDisplay} | Brújula y distancia`,',
    "            bn: `${cityDisplay} থেকে কিবলার দিক | কম্পাস ও দূরত্ব`,",
    '            ms: `Arah Kiblat di ${cityDisplay} | Kompas dan Jarak ke Kaabah`,',
    '        };'
  ]);
  s = replaceBetween(s, '_qTitles',
    '        const _qTitles = {',
    '        };',
    newContent);
}

// ── Block 3: /prayer-times-in-{country-slug} templates ──
{
  const newContent = block([
    '            // Phase D2: cities-focused phrasing + add es/bn/ms (was missing → en fallback)',
    '            const _COUNTRY_TITLE_TEMPLATES = {',
    "                ar: `مواقيت الصلاة في مدن ${cname} | تصفّح المواقع`,",
    '                en: `Prayer Times Cities in ${cname} | Browse All Locations`,',
    '                fr: `Heures de prière en ${cname} | Toutes les villes`,',
    '                tr: `${cname} Namaz Vakitleri | Tüm Şehirler`,',
    "                ur: `${cname} میں اوقاتِ نماز | تمام شہر`,",
    '                de: `Gebetszeiten in ${cname} | Alle Städte`,',
    '                id: `Jadwal Sholat di ${cname} | Semua Kota`,',
    '                es: `Horarios de Oración en ${cname} | Todas las ciudades`,',
    "                bn: `${cname}-এ নামাজের সময় | সকল শহর`,",
    '                ms: `Waktu Solat di ${cname} | Semua Bandar`,',
    '            };',
    '            const _COUNTRY_DESC_TEMPLATES = {',
    "                ar: `تصفّح كل مدن ${cname}: مواقيت الصلاة (الفجر، الظهر، العصر، المغرب، العشاء)، اتجاه القبلة والتاريخ الهجري.`,",
    "                en: `Browse all cities in ${cname} for accurate prayer times, Qibla direction and the Hijri date with a weekly schedule.`,",
    '                fr: `Parcourez toutes les villes de ${cname} pour des heures de prière précises, la direction de la Qibla et la date hégirienne avec un programme hebdomadaire.`,',
    "                tr: `${cname} şehirlerinde doğru namaz vakitleri, kıble yönü ve hicri tarih için tüm şehirlere göz atın — haftalık program ile.`,",
    "                ur: `${cname} کے ہر شہر کے لیے درست اوقاتِ نماز، سمتِ قبلہ اور ہجری تاریخ ہفتہ وار جدول کے ساتھ دیکھیں۔`,",
    '                de: `Durchsuchen Sie alle Städte in ${cname} für genaue Gebetszeiten, Qibla-Richtung und Hidschri-Datum mit Wochenplan.`,',
    '                id: `Jelajahi setiap kota di ${cname}: jadwal sholat akurat, arah kiblat dan tanggal Hijriah dengan jadwal mingguan.`,',
    '                es: `Explora todas las ciudades de ${cname}: horarios exactos de oración, dirección de la Qibla y fecha Hijri con programa semanal.`,',
    "                bn: `${cname}-এর সকল শহরে নির্ভুল নামাজের সময়, কিবলার দিক ও হিজরি তারিখ — সাপ্তাহিক সূচী সহ।`,",
    '                ms: `Layari semua bandar di ${cname} untuk waktu solat tepat, arah kiblat dan tarikh Hijrah dengan jadual mingguan.`,',
    '            };'
  ]);
  s = replaceBetween(s, '_COUNTRY_TITLE_TEMPLATES',
    '            const _COUNTRY_TITLE_TEMPLATES = {',
    EOL + '            };',                          // first };
    newContent.replace(/\r?\n            };[\s\S]+$/, EOL + '            };') ); // safer end anchor
}
// NOTE: the above replaceBetween for COUNTRY uses EOL+'            };' as endAnchor.
// That endAnchor matches the FIRST };, but newContent contains TWO }; — fine because replaceBetween
// matches the OLD content's first }; (which is the title-templates close). After replacement, both
// templates are reformed inline. But this approach is fragile if the old block has structure changes.
// Refactor: replace the whole TWO-template block in one shot via combined anchor.
// Reset to clean approach: re-do block 3 below.

// Reset s and re-apply block 1+2 first.
s = srcRaw;

// (Re-apply block 1)
{
  const newContent = block([
    '    // صانع title صفحات المدن (10 لغات) — Phase D2: ثابت بلا تاريخ هجريّ، بفاصل |',
    '    // cityLng يُحفَظ كمَعامل لأسباب التوافق فقط (التاريخ الهجريّ ينتقل إلى H1/intro/desc).',
    '    const _buildCityDatedTitle = (cityDisplay, _cityLng) => {',
    '        switch (lang) {',
    '            case \'ar\': return `مواقيت الصلاة في ${cityDisplay} | جدول اليوم واتجاه القبلة`;',
    '            case \'fr\': return `Heures de prière à ${cityDisplay} | Horaires du jour et Qibla`;',
    '            case \'tr\': return `${cityDisplay} Namaz Vakitleri | Günlük Program ve Kıble`;',
    '            case \'ur\': return `${cityDisplay} میں اوقاتِ نماز | آج کا جدول اور سمتِ قبلہ`;',
    '            case \'de\': return `Gebetszeiten in ${cityDisplay} | Tagesplan und Qibla`;',
    '            case \'id\': return `Jadwal Sholat di ${cityDisplay} | Jadwal Hari Ini dan Kiblat`;',
    '            case \'es\': return `Horarios de Oración en ${cityDisplay} | Horario de Hoy y Qibla`;',
    "            case 'bn': return `${cityDisplay}-এ নামাজের সময় | আজকের সূচী ও কিবলা`;",
    '            case \'ms\': return `Waktu Solat di ${cityDisplay} | Jadual Hari Ini dan Kiblat`;',
    "            default:   return `Prayer Times in ${cityDisplay} | Today's Schedule and Qibla`;",
    '        }',
    '    };'
  ]);
  s = replaceBetween(s, '_buildCityDatedTitle',
    '    const _buildCityDatedTitle = (cityDisplay, cityLng) => {',
    '        }' + EOL + '    };',
    newContent);
}

// (Re-apply block 2)
{
  const newContent = block([
    '        // Phase D2: extend short titles per language with separator + descriptor',
    '        const _qTitles = {',
    "            ar: `اتجاه القبلة في ${cityDisplay} | البوصلة والمسافة إلى الكعبة`,",
    '            en: `Qibla Direction in ${cityDisplay} | Compass and Distance`,',
    '            fr: `Direction de la Qibla à ${cityDisplay} | Boussole et distance`,',
    '            tr: `${cityDisplay} Kıble Yönü | Kâbe Pusulası ve Uzaklık`,',
    "            ur: `${cityDisplay} سے سمتِ قبلہ | قطب نما اور فاصلہ`,",
    '            de: `Qibla-Richtung in ${cityDisplay} | Kompass und Entfernung`,',
    '            id: `Arah Kiblat di ${cityDisplay} | Kompas dan Jarak ke Kakbah`,',
    '            es: `Dirección de la Qibla en ${cityDisplay} | Brújula y distancia`,',
    "            bn: `${cityDisplay} থেকে কিবলার দিক | কম্পাস ও দূরত্ব`,",
    '            ms: `Arah Kiblat di ${cityDisplay} | Kompas dan Jarak ke Kaabah`,',
    '        };'
  ]);
  s = replaceBetween(s, '_qTitles',
    '        const _qTitles = {',
    '        };',
    newContent);
}

// ── Block 3 (clean): full replacement of both COUNTRY template objects ──
// Anchor on outer structure: from "const _COUNTRY_TITLE_TEMPLATES = {" through the
// close of "_COUNTRY_DESC_TEMPLATES = {...};".
{
  const newContent = block([
    '            // Phase D2: cities-focused phrasing + add es/bn/ms (was missing → en fallback)',
    '            const _COUNTRY_TITLE_TEMPLATES = {',
    "                ar: `مواقيت الصلاة في مدن ${cname} | تصفّح المواقع`,",
    '                en: `Prayer Times Cities in ${cname} | Browse All Locations`,',
    '                fr: `Heures de prière en ${cname} | Toutes les villes`,',
    '                tr: `${cname} Namaz Vakitleri | Tüm Şehirler`,',
    "                ur: `${cname} میں اوقاتِ نماز | تمام شہر`,",
    '                de: `Gebetszeiten in ${cname} | Alle Städte`,',
    '                id: `Jadwal Sholat di ${cname} | Semua Kota`,',
    '                es: `Horarios de Oración en ${cname} | Todas las ciudades`,',
    "                bn: `${cname}-এ নামাজের সময় | সকল শহর`,",
    '                ms: `Waktu Solat di ${cname} | Semua Bandar`,',
    '            };',
    '            const _COUNTRY_DESC_TEMPLATES = {',
    "                ar: `تصفّح كل مدن ${cname}: مواقيت الصلاة (الفجر، الظهر، العصر، المغرب، العشاء)، اتجاه القبلة والتاريخ الهجري.`,",
    "                en: `Browse all cities in ${cname} for accurate prayer times, Qibla direction and the Hijri date with a weekly schedule.`,",
    '                fr: `Parcourez toutes les villes de ${cname} pour des heures de prière précises, la direction de la Qibla et la date hégirienne avec un programme hebdomadaire.`,',
    "                tr: `${cname} şehirlerinde doğru namaz vakitleri, kıble yönü ve hicri tarih için tüm şehirlere göz atın — haftalık program ile.`,",
    "                ur: `${cname} کے ہر شہر کے لیے درست اوقاتِ نماز، سمتِ قبلہ اور ہجری تاریخ ہفتہ وار جدول کے ساتھ دیکھیں۔`,",
    '                de: `Durchsuchen Sie alle Städte in ${cname} für genaue Gebetszeiten, Qibla-Richtung und Hidschri-Datum mit Wochenplan.`,',
    '                id: `Jelajahi setiap kota di ${cname}: jadwal sholat akurat, arah kiblat dan tanggal Hijriah dengan jadwal mingguan.`,',
    '                es: `Explora todas las ciudades de ${cname}: horarios exactos de oración, dirección de la Qibla y fecha Hijri con programa semanal.`,',
    "                bn: `${cname}-এর সকল শহরে নির্ভুল নামাজের সময়, কিবলার দিক ও হিজরি তারিখ — সাপ্তাহিক সূচী সহ।`,",
    '                ms: `Layari semua bandar di ${cname} untuk waktu solat tepat, arah kiblat dan tarikh Hijrah dengan jadual mingguan.`,',
    '            };'
  ]);
  s = replaceBetween(s, 'COUNTRY_TEMPLATES',
    '            const _COUNTRY_TITLE_TEMPLATES = {',
    EOL + '            };' + EOL + '            title = _COUNTRY_TITLE_TEMPLATES[lang]',
    newContent + EOL + '            title = _COUNTRY_TITLE_TEMPLATES[lang]');
}

// ── Block 4: /about-{slug}-{lat}-{lng} full block ──
{
  const newContent = block([
    '    // ── About city pages: /about-{slug}-{lat}-{lng} ──',
    '    // Phase D2: 10-lang title+desc + bug fix (cityDisplay now uses _resolveCityName for ar etc.)',
    "    m = corePath.match(/^\\/about-(.+?)-(-?\\d+(?:\\.\\d+)?)-(-?\\d+(?:\\.\\d+)?)$/);",
    '    if (m) {',
    '        const citySlug = m[1];',
    '        const lat = parseFloat(m[2]);',
    '        const lng = parseFloat(m[3]);',
    '        const cityDisplay = _resolveCityName(citySlug, lang) || _slugToTitle(citySlug);',
    '        const _aTitles = {',
    "            ar: `عن ${cityDisplay} | الموقع والمنطقة الزمنية ومواقيت الصلاة`,",
    '            en: `About ${cityDisplay} | Location, Timezone & Prayer Times`,',
    '            fr: `À propos de ${cityDisplay} | Localisation, fuseau et prière`,',
    '            tr: `${cityDisplay} Hakkında | Konum, Saat Dilimi ve Namaz`,',
    "            ur: `${cityDisplay} کے بارے میں | مقام، ٹائم زون اور اوقاتِ نماز`,",
    '            de: `Über ${cityDisplay} | Lage, Zeitzone & Gebetszeiten`,',
    '            id: `Tentang ${cityDisplay} | Lokasi, Zona Waktu & Jadwal Sholat`,',
    '            es: `Sobre ${cityDisplay} | Ubicación, zona horaria y oración`,',
    "            bn: `${cityDisplay} সম্পর্কে | অবস্থান, টাইমজোন ও নামাজের সময়`,",
    '            ms: `Mengenai ${cityDisplay} | Lokasi, Zon Masa & Waktu Solat`,',
    '        };',
    '        const _aDescs = {',
    "            ar: `تعرّف على ${cityDisplay}: الإحداثيات الجغرافية، المنطقة الزمنية، السكان، مواقيت الصلاة، اتجاه القبلة، التاريخ الهجري وأهم الحقائق المحلية.`,",
    "            en: `Discover ${cityDisplay}: geographic coordinates, timezone, population, Islamic prayer times, Qibla direction, today's Hijri date and key local facts.`,",
    "            fr: `Découvrez ${cityDisplay} : coordonnées géographiques, fuseau horaire, population, horaires de prière, direction de la Qibla et date hégirienne.`,",
    '            tr: `${cityDisplay} hakkında: coğrafi koordinatlar, saat dilimi, nüfus, namaz vakitleri, kıble yönü ve hicri tarih ile yerel bilgiler.`,',
    "            ur: `${cityDisplay} کا تعارف: جغرافیائی محل وقوع، ٹائم زون، آبادی، اوقاتِ نماز، سمتِ قبلہ اور آج کی ہجری تاریخ کے ساتھ۔`,",
    '            de: `Entdecken Sie ${cityDisplay}: geografische Koordinaten, Zeitzone, Bevölkerung, Gebetszeiten, Qibla-Richtung und Hidschri-Datum.`,',
    "            id: `Kenali ${cityDisplay}: koordinat geografis, zona waktu, populasi, jadwal sholat, arah kiblat dan tanggal Hijriah hari ini.`,",
    "            es: `Descubre ${cityDisplay}: coordenadas geográficas, zona horaria, población, horarios de oración, dirección de la Qibla y fecha Hijri.`,",
    "            bn: `${cityDisplay} সম্পর্কে জানুন: ভৌগোলিক স্থানাঙ্ক, টাইমজোন, জনসংখ্যা, নামাজের সময়, কিবলার দিক এবং আজকের হিজরি তারিখ।`,",
    '            ms: `Kenali ${cityDisplay}: koordinat geografi, zon masa, populasi, waktu solat, arah kiblat dan tarikh Hijrah hari ini.`,',
    '        };',
    '        title = _aTitles[lang] || _aTitles.en;',
    '        description = _aDescs[lang] || _aDescs.en;',
    "        ogType = 'article';",
    '        geo = { lat, lng };',
    '        cityModified = new Date().toISOString();',
    '        breadcrumbs.push({ name: cityDisplay, item: canonical });',
    '    }'
  ]);
  s = replaceBetween(s, 'about-block',
    '    // ── About city pages: /about-{slug}-{lat}-{lng} ──',
    EOL + '    }' + EOL + EOL + '    // ── Moon city pages',
    newContent + EOL + EOL + '    // ── Moon city pages');
}

// ── Block 5: /prayer-times-in-{city} description fallback (city case) ──
// Replaces the useEnTxt ternary for description with a 10-lang object.
{
  const oldChunk = block([
    '            title = _buildCityDatedTitle(cityDisplay, cityLng);',
    '            description = useEnTxt',
    "                ? `Accurate Islamic prayer times for ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha, Qibla direction, today's Hijri date and weekly schedule.`",
    "                : `مواقيت الصلاة الدقيقة في ${cityDisplay}: الفجر، الظهر، العصر، المغرب، العشاء، اتجاه القبلة، التاريخ الهجري والجدول الأسبوعي.`;",
  ]);
  const newChunk = block([
    '            title = _buildCityDatedTitle(cityDisplay, cityLng);',
    '            // Phase D2: localized desc for all 10 languages (was: useEnTxt fallback to en for 8 langs)',
    '            const _CITY_DESCS = {',
    "                ar: `مواقيت الصلاة الدقيقة في ${cityDisplay}: الفجر، الظهر، العصر، المغرب، العشاء، اتجاه القبلة، التاريخ الهجري والجدول الأسبوعي.`,",
    "                en: `Accurate Islamic prayer times for ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha — with Qibla direction, Hijri date and weekly schedule.`,",
    "                fr: `Horaires de prière exacts à ${cityDisplay} : Fajr, Dohr, Asr, Maghrib, Icha — avec direction de la Qibla, date hégirienne et programme hebdomadaire.`,",
    '                tr: `${cityDisplay} için doğru namaz vakitleri: Fecir, Öğle, İkindi, Akşam, Yatsı — kıble yönü, hicri tarih ve haftalık program ile birlikte.`,',
    "                ur: `${cityDisplay} کے لیے درست اوقاتِ نماز: فجر، ظہر، عصر، مغرب، عشاء — سمتِ قبلہ، ہجری تاریخ اور ہفتہ وار جدول کے ساتھ۔`,",
    '                de: `Genaue Gebetszeiten für ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha — mit Qibla-Richtung, Hidschri-Datum und Wochenplan.`,',
    '                id: `Jadwal sholat akurat untuk ${cityDisplay}: Subuh, Zuhur, Asar, Magrib, Isya — dengan arah kiblat, tanggal Hijriah dan jadwal mingguan.`,',
    "                es: `Horarios de oración exactos para ${cityDisplay}: Fayr, Dohr, Asr, Magrib, Isha — con dirección de la Qibla, fecha Hijri y programa semanal.`,",
    "                bn: `${cityDisplay}-এর জন্য নির্ভুল নামাজের সময়: ফজর, জোহর, আসর, মাগরিব, এশা — কিবলার দিক, হিজরি তারিখ ও সাপ্তাহিক সূচী সহ।`,",
    '                ms: `Waktu solat tepat untuk ${cityDisplay}: Subuh, Zohor, Asar, Maghrib, Isyak — dengan arah kiblat, tarikh Hijrah dan jadual mingguan.`,',
    '            };',
    '            description = _CITY_DESCS[lang] || _CITY_DESCS.en;',
  ]);
  const cnt = s.split(oldChunk).length - 1;
  if (cnt !== 1) {
    console.error(`Block 5 (city desc): expected 1 match, got ${cnt}`);
    process.exit(2);
  }
  s = s.replace(oldChunk, newChunk);
  console.log('OK city-desc-fallback');
}

if (s === srcRaw) {
  console.error('No changes were made.');
  process.exit(3);
}

fs.writeFileSync(file, s, 'utf8');
console.log(`All Phase D2 edits applied. (EOL=${isCRLF ? 'CRLF' : 'LF'})`);
