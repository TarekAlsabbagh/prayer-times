// scripts/geodata/import_geonames.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA — Stage 1: IMPORT (country-agnostic)
//
// Usage: node scripts/geodata/import_geonames.mjs <cc>
//   <cc> = lowercase 2-letter ISO code. Default 'sa'.
//
// 1. If <CC>.txt is missing, extract from <CC>.zip.
// 2. If <CC>.zip is missing, download from GeoNames.
// 3. Parse the 19-field TSV into JS objects.
// 4. Keep ONLY rows where feature_class === 'P' (populated places).
// 5. Write db/places/candidates/<cc>-geonames-raw.json
//
// Idempotent: re-running with the same <CC>.txt produces identical output.
//
// Data attribution:
//   © GeoNames — licensed CC-BY 4.0
//   Source: https://download.geonames.org/export/dump/<CC>.zip
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import {
    pathsFor, loadCountryConfig, GEONAMES_FIELDS,
    ensureDirs, downloadFile, extractZipSingleFile
} from './_geonames_common.mjs';

async function main() {
    const cc = (process.argv[2] || 'sa').toLowerCase();
    console.log('[stage1]', cc.toUpperCase(), '— starting');

    const config = await loadCountryConfig(cc);
    const paths  = pathsFor(cc);

    ensureDirs();

    // Step 1: ensure <CC>.zip exists
    if (!fs.existsSync(paths.zip)) {
        if (!fs.existsSync(paths.txt)) {
            console.log('[stage1] downloading', config.geonamesUrl, '→', paths.zip);
            await downloadFile(config.geonamesUrl, paths.zip);
            const sz = fs.statSync(paths.zip).size;
            console.log('[stage1] downloaded', sz, 'bytes');
        }
    } else {
        const sz = fs.statSync(paths.zip).size;
        console.log('[stage1]', cc.toUpperCase() + '.zip already exists (' + sz + ' bytes)');
    }

    // Step 2: ensure <CC>.txt exists
    if (!fs.existsSync(paths.txt)) {
        console.log('[stage1] extracting', config.innerTxtName, 'from zip');
        extractZipSingleFile(paths.zip, config.innerTxtName, paths.txt);
        const sz = fs.statSync(paths.txt).size;
        console.log('[stage1] extracted', config.innerTxtName, '(' + sz + ' bytes)');
    } else {
        const sz = fs.statSync(paths.txt).size;
        console.log('[stage1]', config.innerTxtName, 'already exists (' + sz + ' bytes)');
    }

    // Step 3: parse TSV
    console.log('[stage1] parsing', config.innerTxtName);
    const text = fs.readFileSync(paths.txt, 'utf8');
    const lines = text.split(/\r?\n/).filter(l => l.length > 0);
    console.log('[stage1] total rows:', lines.length);

    const all = [];
    let parseErrors = 0;
    for (const line of lines) {
        const cols = line.split('\t');
        if (cols.length < GEONAMES_FIELDS.length) {
            parseErrors++;
            continue;
        }
        const row = {};
        for (let i = 0; i < GEONAMES_FIELDS.length; i++) {
            row[GEONAMES_FIELDS[i]] = cols[i] || '';
        }
        // Coerce numerics where useful
        row.geonameid  = Number(row.geonameid) || 0;
        row.latitude   = Number(row.latitude);
        row.longitude  = Number(row.longitude);
        row.population = Number(row.population) || 0;
        row.elevation  = row.elevation === '' ? null : Number(row.elevation);
        row.dem        = row.dem === '' ? null : Number(row.dem);
        all.push(row);
    }
    if (parseErrors > 0) {
        console.warn('[stage1] parse errors (rows with too few columns):', parseErrors);
    }

    // Step 4: filter to populated places (feature_class === 'P')
    const populated = all.filter(r => r.feature_class === 'P');
    console.log('[stage1] populated places (P-class):', populated.length);

    // Feature-code breakdown for visibility (helps verify expected mix)
    const codeCounts = {};
    for (const r of populated) {
        codeCounts[r.feature_code] = (codeCounts[r.feature_code] || 0) + 1;
    }
    console.log('[stage1] feature_code breakdown:', JSON.stringify(codeCounts));

    // Step 5: write raw JSON
    fs.writeFileSync(paths.rawJson, JSON.stringify(populated, null, 2) + '\n');
    console.log('[stage1] wrote', paths.rawJson, '(' + populated.length + ' rows)');
    console.log('[stage1] DONE for', cc.toUpperCase());
}

main().catch(e => {
    console.error('[stage1] FAILED:', e && e.message);
    if (e && e.stack) console.error(e.stack);
    process.exit(1);
});
