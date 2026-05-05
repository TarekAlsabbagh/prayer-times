// SITE-CLS-Audit / Combined Lighthouse + diagnostic runner
//
// Why combined: Lighthouse already captures the same `layout-shift` entries
// that a Playwright PerformanceObserver would. By parsing the lhr JSON we
// get both the official Performance / CLS / LCP / SI numbers AND the per-
// shift source elements with bounding rects — without installing Playwright
// (~150MB browser download).
//
// Workflow:
//   1. For each route, run `npx lighthouse` with --output=json
//   2. Parse the report to extract:
//        - performance score
//        - CLS, LCP, SI, FCP, TBT, TTFB
//        - LCP element snippet
//        - top 5 layout-shift sources (with score, snippet, boundingRect)
//   3. Save per-route JSON + write the consolidated report row
//   4. Repeat 3 times per route (CLS varies between runs — we want the worst case)
//
// Usage:
//   node scripts/audit-cls-runner.mjs --target=render
//   node scripts/audit-cls-runner.mjs --target=local --port=3000
//   node scripts/audit-cls-runner.mjs --target=render --routes=/qibla,/moon-today
//   node scripts/audit-cls-runner.mjs --target=render --runs=1   (faster, less reliable)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TMP_DIR = path.join(ROOT, 'audit-reports', '_tmp_lh');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const args = Object.fromEntries(
    process.argv.slice(2)
        .map(a => a.replace(/^--/, ''))
        .map(a => a.includes('=') ? a.split('=', 2) : [a, true])
);

const TARGET = args.target || 'render';
const PORT = args.port || '3000';
const RUNS = Number(args.runs) || 3;
const BASE = TARGET === 'local'
    ? `http://localhost:${PORT}`
    : 'https://prayer-times-d4w8.onrender.com';

const DEFAULT_ROUTES = [
    '/',
    '/qibla',
    '/qibla-in-jeddah-21.5-39.2',
    '/prayer-times-in-makkah-21.4-39.8',
    '/moon-today',
    '/moon-in-jeddah-21.5-39.2',
    '/today-hijri-date',
    '/hijri-calendar/1447',
    '/azkar',
    '/dateconverter',
    '/msbaha',
    '/zakat-calculator',
    '/ramadan-countdown',
    '/eid-al-fitr-countdown',
    '/eid-al-adha-countdown',
    '/hijri-new-year-countdown',
];

const ROUTES = args.routes
    ? String(args.routes).split(',').map(r => r.trim())
    : DEFAULT_ROUTES;

console.log(`=== SITE-CLS-Audit / Lighthouse runner ===`);
console.log(`Target: ${BASE}`);
console.log(`Routes: ${ROUTES.length}`);
console.log(`Runs per route: ${RUNS}`);
console.log();

function safeName(route) {
    return route.replace(/[^a-z0-9-]+/gi, '_').replace(/^_+|_+$/g, '') || 'home';
}

function runLighthouse(route, runIdx) {
    const url = `${BASE}${route}?_audit=${Date.now()}-${runIdx}`;
    const tmp = path.join(TMP_DIR, `${safeName(route)}-r${runIdx}.json`);
    try {
        execSync(
            `npx --yes lighthouse "${url}" --output=json --quiet --only-categories=performance ` +
            `--chrome-flags="--headless=new --disable-gpu --no-sandbox" ` +
            `--output-path="${tmp}"`,
            { stdio: ['ignore', 'ignore', 'pipe'], timeout: 180000 }
        );
    } catch (e) {
        console.error(`  ✗ lighthouse failed for ${route} run ${runIdx}: ${(e.message || e).toString().substring(0, 100)}`);
        return null;
    }
    if (!fs.existsSync(tmp)) return null;
    try {
        return JSON.parse(fs.readFileSync(tmp, 'utf8'));
    } catch (e) {
        return null;
    }
}

function extractMetrics(lhr) {
    if (!lhr) return null;
    const a = lhr.audits;
    const perf = Math.round((lhr.categories?.performance?.score ?? 0) * 100);
    const num = (k) => a[k]?.numericValue ?? null;
    const lcpEl = a['largest-contentful-paint-element'];
    let lcpSnippet = null;
    if (lcpEl?.details?.items?.[0]) {
        const it = lcpEl.details.items[0];
        lcpSnippet = (it.node?.snippet) || (it.items?.[0]?.node?.snippet) || null;
    }
    const ls = a['layout-shifts'];
    const shifts = (ls?.details?.items || []).map(it => ({
        score: it.score,
        sn: it.node?.snippet?.substring(0, 120) || null,
        sel: it.node?.selector?.substring(0, 120) || null,
        rect: it.node?.boundingRect || null,
    }));
    return {
        perf,
        cls: num('cumulative-layout-shift'),
        lcp: num('largest-contentful-paint'),
        si: num('speed-index'),
        fcp: num('first-contentful-paint'),
        tbt: num('total-blocking-time'),
        ttfb: num('server-response-time'),
        lcpSnippet,
        shifts,
    };
}

const results = [];

for (let ri = 0; ri < ROUTES.length; ri++) {
    const route = ROUTES[ri];
    console.log(`[${ri + 1}/${ROUTES.length}] ${route}`);
    const runs = [];
    for (let r = 1; r <= RUNS; r++) {
        process.stdout.write(`  run ${r}/${RUNS} … `);
        const lhr = runLighthouse(route, r);
        const m = extractMetrics(lhr);
        if (m) {
            runs.push(m);
            console.log(`P=${m.perf} CLS=${m.cls?.toFixed(3) ?? '?'} LCP=${m.lcp?.toFixed(0) ?? '?'} SI=${m.si?.toFixed(0) ?? '?'}`);
        } else {
            console.log('✗ failed');
        }
        // gap between runs to avoid Render rate-limits / cold-start contamination
        if (r < RUNS) {
            const gap = 60;
            for (let s = 1; s <= gap; s++) {
                process.stdout.write(`  ⏳ ${gap - s + 1}s\r`);
                execSync(`node -e "setTimeout(()=>{},1000)"`, { stdio: 'ignore' });
            }
            process.stdout.write('              \r');
        }
    }
    if (runs.length === 0) {
        results.push({ route, error: 'all runs failed' });
        continue;
    }

    // Aggregate
    const avg = (k) => {
        const vals = runs.map(r => r[k]).filter(v => v != null);
        return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
    };
    const max = (k) => {
        const vals = runs.map(r => r[k]).filter(v => v != null);
        return vals.length ? Math.max(...vals) : null;
    };
    const min = (k) => {
        const vals = runs.map(r => r[k]).filter(v => v != null);
        return vals.length ? Math.min(...vals) : null;
    };
    // Pick worst-CLS run for shift inspection
    let worstClsRun = runs[0];
    for (const r of runs) {
        if ((r.cls ?? 0) > (worstClsRun.cls ?? 0)) worstClsRun = r;
    }

    results.push({
        route,
        runs: runs.length,
        perf: { min: min('perf'), max: max('perf'), avg: avg('perf') },
        cls:  { min: min('cls'),  max: max('cls'),  avg: avg('cls') },
        lcp:  { min: min('lcp'),  max: max('lcp'),  avg: avg('lcp') },
        si:   { min: min('si'),   max: max('si'),   avg: avg('si') },
        fcp:  { min: min('fcp'),  max: max('fcp'),  avg: avg('fcp') },
        tbt:  { min: min('tbt'),  max: max('tbt'),  avg: avg('tbt') },
        ttfb: { min: min('ttfb'), max: max('ttfb'), avg: avg('ttfb') },
        lcpSnippet: worstClsRun.lcpSnippet,
        worstShifts: worstClsRun.shifts.slice(0, 5),
    });
}

const outFile = path.join(ROOT, 'audit-reports', `lighthouse-${TARGET}.json`);
fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');

console.log();
console.log('=== Summary ===');
console.log('Route'.padEnd(40), 'Perf', 'CLS', 'LCP', 'SI');
console.log('-'.repeat(70));
for (const r of results) {
    if (r.error) {
        console.log(r.route.padEnd(40), '— ERROR:', r.error);
        continue;
    }
    console.log(
        r.route.padEnd(40),
        String(Math.round(r.perf.avg)).padStart(3),
        (r.cls.max?.toFixed(3) ?? '?').padStart(5),
        String(Math.round(r.lcp.avg ?? 0)).padStart(4),
        String(Math.round(r.si.avg ?? 0)).padStart(4),
    );
}
console.log();
console.log(`✅ JSON saved: ${path.relative(ROOT, outFile)}`);
