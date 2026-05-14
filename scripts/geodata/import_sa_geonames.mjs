// scripts/geodata/import_sa_geonames.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-SA-GEODATA-IMPORT-1 — Stage 1: IMPORT
//
// Reads GeoNames Saudi country dump and writes a filtered raw JSON:
//   1. If SA.txt is missing, extract from SA.zip.
//   2. If SA.zip is missing, download from GeoNames.
//   3. Parse the 19-field TSV into JS objects.
//   4. Keep ONLY rows where feature_class === 'P' (populated places).
//   5. Write db/places/candidates/sa-geonames-raw.json
//
// Idempotent: re-running with the same SA.txt produces identical output.
//
// Data attribution:
//   © GeoNames — licensed CC-BY 4.0
//   https://download.geonames.org/export/dump/SA.zip
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import {
    PATHS, GEONAMES_SA_URL, GEONAMES_FIELDS,
    ensureDirs, downloadFile, extractZipSingleFile
} from './_geonames_common.mjs';

async function main() {
    ensureDirs();

    // Step 1: ensure SA.zip exists
    if (!fs.existsSync(PATHS.saZip)) {
        if (!fs.existsSync(PATHS.saTxt)) {
            console.log('[stage1] downloading', GEONAMES_SA_URL, '→', PATHS.saZip);
            await downloadFile(GEONAMES_SA_URL, PATHS.saZip);
            const sz = fs.statSync(PATHS.saZip).size;
            console.log('[stage1] downloaded', sz, 'bytes');
        }
    } else {
        const sz = fs.statSync(PATHS.saZip).size;
        console.log('[stage1] SA.zip already exists (' + sz + ' bytes)');
    }

    // Step 2: ensure SA.txt exists
    if (!fs.existsSync(PATHS.saTxt)) {
        console.log('[stage1] extracting SA.txt from SA.zip');
        extractZipSingleFile(PATHS.saZip, 'SA.txt', PATHS.saTxt);
        const sz = fs.statSync(PATHS.saTxt).size;
        console.log('[stage1] extracted SA.txt (' + sz + ' bytes)');
    } else {
        const sz = fs.statSync(PATHS.saTxt).size;
        console.log('[stage1] SA.txt already exists (' + sz + ' bytes)');
    }

    // Step 3: parse TSV
    console.log('[stage1] parsing SA.txt');
    const text = fs.readFileSync(PATHS.saTxt, 'utf8');
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

    // Feature-code breakdown for visibility
    const codeCounts = {};
    for (const r of populated) {
        codeCounts[r.feature_code] = (codeCounts[r.feature_code] || 0) + 1;
    }
    console.log('[stage1] feature_code breakdown:', JSON.stringify(codeCounts));

    // Step 5: write raw JSON
    fs.writeFileSync(PATHS.rawJson, JSON.stringify(populated, null, 2) + '\n');
    console.log('[stage1] wrote', PATHS.rawJson, '(' + populated.length + ' rows)');
    console.log('[stage1] DONE');
}

main().catch(e => {
    console.error('[stage1] FAILED:', e && e.message);
    process.exit(1);
});
