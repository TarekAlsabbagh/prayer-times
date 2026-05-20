// scripts/search/_search_ranking_improvement_1_audit.mjs
// ─────────────────────────────────────────────────────────────────────────
// SEARCH-RANKING-IMPROVEMENT-1-PLAN — read-only audit script
//
// Boots the server briefly (caller responsibility) and exercises
// /api/search-place against a curated query set covering:
//   - India (Delhi/Mumbai/Bombay/Calcutta/Madras/Bengaluru/Bangalore/
//     Varanasi/Banaras/Kashi/Prayagraj/Allahabad/Vizag/Visakhapatnam/
//     Coimbatore/Kovai/Thane/Dombivali/Ghaziabad/Faridabad)
//   - Multi-script (Urdu/Bengali/Hindi)
//   - Bangladesh (Dhaka/Chittagong/Chattogram/Barisal/Barishal/etc.)
//   - Pakistan (Karachi/Lahore/Islamabad/Rawalpindi/Multan/Peshawar
//     + Urdu equivalents)
//
// READ-ONLY: no mutation of any file. Output is text-only to stdout.
// Requires the server to be running on localhost:8080.
// ─────────────────────────────────────────────────────────────────────────
import http from 'node:http';

function get(path) {
    return new Promise(resolve => {
        http.get({ host: 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, body }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}

// ─── Query set (per spec § 3) ───────────────────────────────────────────
const QUERIES = [
    // ── India — English primary names ──
    { q: 'Delhi',         lang: 'en', expect: 'new-delhi',     family: 'IN-rename'   },
    { q: 'New Delhi',     lang: 'en', expect: 'new-delhi',     family: 'IN-canonical'},
    { q: 'Mumbai',        lang: 'en', expect: 'mumbai',        family: 'IN-canonical'},
    { q: 'Bombay',        lang: 'en', expect: 'mumbai',        family: 'IN-rename'   },
    { q: 'Kolkata',       lang: 'en', expect: 'kolkata',       family: 'IN-canonical'},
    { q: 'Calcutta',      lang: 'en', expect: 'kolkata',       family: 'IN-rename'   },
    { q: 'Chennai',       lang: 'en', expect: 'chennai',       family: 'IN-canonical'},
    { q: 'Madras',        lang: 'en', expect: 'chennai',       family: 'IN-rename'   },
    { q: 'Bengaluru',     lang: 'en', expect: 'bengaluru',     family: 'IN-canonical'},
    { q: 'Bangalore',     lang: 'en', expect: 'bengaluru',     family: 'IN-rename'   },
    { q: 'Varanasi',      lang: 'en', expect: 'varanasi',      family: 'IN-canonical'},
    { q: 'Banaras',       lang: 'en', expect: 'varanasi',      family: 'IN-alias'    },
    { q: 'Kashi',         lang: 'en', expect: 'varanasi',      family: 'IN-alias'    },
    { q: 'Prayagraj',     lang: 'en', expect: 'prayagraj',     family: 'IN-canonical'},
    { q: 'Allahabad',     lang: 'en', expect: 'prayagraj',     family: 'IN-rename'   },
    { q: 'Vizag',         lang: 'en', expect: 'visakhapatnam', family: 'IN-alias'    },
    { q: 'Visakhapatnam', lang: 'en', expect: 'visakhapatnam', family: 'IN-canonical'},
    { q: 'Coimbatore',    lang: 'en', expect: 'coimbatore',    family: 'IN-canonical'},
    { q: 'Kovai',         lang: 'en', expect: 'coimbatore',    family: 'IN-alias'    },
    { q: 'Thane',         lang: 'en', expect: 'thane',         family: 'IN-canonical'},
    { q: 'Dombivali',     lang: 'en', expect: 'dombivali',     family: 'IN-canonical'},
    { q: 'Ghaziabad',     lang: 'en', expect: 'ghaziabad',     family: 'IN-canonical'},
    { q: 'Faridabad',     lang: 'en', expect: 'faridabad',     family: 'IN-canonical'},
    { q: 'Aurangabad',    lang: 'en', expect: 'aurangabad',    family: 'IN-canonical'},
    { q: 'Chhatrapati Sambhajinagar', lang: 'en', expect: 'aurangabad', family: 'IN-alias'},

    // ── Urdu queries ──
    { q: 'دہلی',          lang: 'ur', expect: 'new-delhi',     family: 'IN-ur'   },
    { q: 'ممبئی',         lang: 'ur', expect: 'mumbai',        family: 'IN-ur'   },
    { q: 'بنارس',         lang: 'ur', expect: 'varanasi',      family: 'IN-ur-alias' },
    { q: 'الہ آباد',      lang: 'ur', expect: 'prayagraj',     family: 'IN-ur-alias' },
    { q: 'کولکاتا',       lang: 'ur', expect: 'kolkata',       family: 'IN-ur'   },
    { q: 'کلکتہ',         lang: 'ur', expect: 'kolkata',       family: 'IN-ur-alias' },
    { q: 'کوئٹہ',         lang: 'ur', expect: 'quetta',        family: 'PK-ur'   },
    { q: 'کراچی',         lang: 'ur', expect: 'karachi',       family: 'PK-ur'   },
    { q: 'لاہور',         lang: 'ur', expect: 'lahore',        family: 'PK-ur'   },

    // ── Bengali queries ──
    { q: 'কলকাতা',         lang: 'bn', expect: 'kolkata',      family: 'IN-bn'   },
    { q: 'বারাণসী',        lang: 'bn', expect: 'varanasi',     family: 'IN-bn'   },
    { q: 'এলাহাবাদ',       lang: 'bn', expect: 'prayagraj',    family: 'IN-bn-alias' },
    { q: 'কাশী',           lang: 'bn', expect: 'varanasi',     family: 'IN-bn-alias' },
    { q: 'ঢাকা',           lang: 'bn', expect: 'dhaka',        family: 'BD-bn'   },

    // ── Hindi queries (data-only, no UI routing) ──
    { q: 'मुंबई',          lang: 'ar', expect: 'mumbai',       family: 'IN-hi-data-only' },
    { q: 'नई दिल्ली',       lang: 'ar', expect: 'new-delhi',   family: 'IN-hi-data-only' },
    { q: 'काशी',           lang: 'ar', expect: 'varanasi',    family: 'IN-hi-data-only' },

    // ── Bangladesh ──
    { q: 'Dhaka',         lang: 'en', expect: 'dhaka',         family: 'BD'   },
    { q: 'Chittagong',    lang: 'en', expect: 'chittagong',    family: 'BD-rename'  },
    { q: 'Chattogram',    lang: 'en', expect: 'chittagong',    family: 'BD-rename'  },
    { q: 'Barisal',       lang: 'en', expect: 'barisal',       family: 'BD-rename'  },
    { q: 'Barishal',      lang: 'en', expect: 'barisal',       family: 'BD-rename-new'},
    { q: 'Rangpur',       lang: 'en', expect: 'rangpur',       family: 'BD'   },
    { q: 'Gazipur',       lang: 'en', expect: 'gazipur',       family: 'BD'   },
    { q: 'Narayanganj',   lang: 'en', expect: 'narayanganj',   family: 'BD'   },

    // ── Pakistan ──
    { q: 'Karachi',       lang: 'en', expect: 'karachi',       family: 'PK'   },
    { q: 'Lahore',        lang: 'en', expect: 'lahore',        family: 'PK'   },
    { q: 'Islamabad',     lang: 'en', expect: 'islamabad',     family: 'PK'   },
    { q: 'Rawalpindi',    lang: 'en', expect: 'rawalpindi',    family: 'PK'   },
    { q: 'Multan',        lang: 'en', expect: 'multan',        family: 'PK'   },
    { q: 'Peshawar',      lang: 'en', expect: 'peshawar',      family: 'PK'   },
];

async function main() {
    const r = await get('/api/search-place?q=Mumbai&lang=en');
    if (r.status !== 200) {
        console.error('Server not responding (status=' + r.status + '). Boot server first via "node server.js".');
        process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(' SEARCH-RANKING-IMPROVEMENT-1-PLAN — Query audit (read-only)');
    console.log(' ' + QUERIES.length + ' queries across India, Bangladesh, Pakistan + multi-script');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');

    const results = [];
    let pass = 0, fail = 0;
    for (const q of QUERIES) {
        const url = '/api/search-place?q=' + encodeURIComponent(q.q) + '&lang=' + q.lang;
        const r = await get(url);
        if (r.status !== 200) {
            results.push({ ...q, top: '(http ' + r.status + ')', ok: false, score: 0, source: 'none' });
            fail++;
            continue;
        }
        const data = JSON.parse(r.body);
        const top = (data.results || [])[0];
        const topSlug = top ? top.slug : '';
        const topConfidence = top ? top.confidence : 0;
        const topName = top ? top.displayName : '';
        const ok = topSlug === q.expect;
        const second = (data.results || [])[1];
        const secondSlug = second ? second.slug : '';
        results.push({
            ...q,
            top: topSlug,
            topName,
            topConfidence,
            secondSlug,
            ok,
            source: data.source || 'none',
            totalResults: (data.results || []).length
        });
        if (ok) pass++; else fail++;
    }

    console.log('| # | Query | Lang | Expected | Got | OK? | Conf | 2nd | Family |');
    console.log('| --- | --- | --- | --- | --- | --- | ---: | --- | --- |');
    let i = 1;
    for (const r of results) {
        console.log('| ' + (i++) + ' | `' + r.q + '` | ' + r.lang + ' | `' + r.expect + '` | `' + (r.top || '(none)') + '` | ' + (r.ok ? '✓' : '✗') + ' | ' + r.topConfidence + ' | `' + (r.secondSlug || '-') + '` | ' + r.family + ' |');
    }

    console.log('');
    console.log('═══ SUMMARY ═══');
    console.log('  Total queries: ' + QUERIES.length);
    console.log('  Pass:          ' + pass);
    console.log('  Fail:          ' + fail);
    console.log('  Pass rate:     ' + (pass * 100 / QUERIES.length).toFixed(1) + '%');

    console.log('');
    console.log('═══ FAILURES (full detail) ═══');
    for (const r of results) {
        if (!r.ok) {
            console.log('  ✗ q="' + r.q + '" lang=' + r.lang + ' family=' + r.family);
            console.log('    expected: ' + r.expect);
            console.log('    got:      ' + r.top + ' (confidence ' + r.topConfidence + ', "' + r.topName + '")');
            console.log('    2nd:      ' + (r.secondSlug || '-'));
            console.log('    source:   ' + r.source);
            console.log('    total:    ' + r.totalResults);
            console.log('');
        }
    }

    // Output JSON results for downstream analysis
    const fs = await import('node:fs');
    fs.writeFileSync('search-audit-results.json',
        JSON.stringify({ pass, fail, total: QUERIES.length, results }, null, 2));
    console.log('Detail saved to: search-audit-results.json');
}

main();
