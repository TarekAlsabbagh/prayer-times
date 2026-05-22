#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  HIJRI-UMM-AL-QURA-INFRA-STAGE-A0 (2026-05-22)
 *  Schema validator for db/hijri/umm-al-qura.json
 *
 *  Run:  node scripts/_validate_hijri_umm_al_qura_schema.mjs
 *  Exit: 0 on success, 1 on any schema violation.
 *
 *  This validator runs over the static JSON file and checks structural
 *  invariants. It does NOT verify the data values against an external
 *  reference — that is a separate concern (Stage B will do data
 *  cross-checks against an authoritative Umm al-Qura source).
 *
 *  Rules enforced:
 *    1. Top-level: { calendar, range, status, years } all present.
 *    2. calendar === "umm-al-qura".
 *    3. range.startYear is a positive integer.
 *    4. range.endYear is a positive integer >= startYear.
 *    5. status ∈ {"data-pending", "partial", "populated"}.
 *    6. If status === "populated": every year in [startYear..endYear]
 *       is present in years{}.
 *    7. If status === "data-pending": years{} is empty.
 *    8. For every year entry that IS present:
 *         8a. key is a stringified integer that falls in [startYear..endYear].
 *         8b. months is an array of exactly 12 numbers.
 *         8c. each month value ∈ {29, 30}.
 *         8d. yearStart is "YYYY-MM-DD" format (basic regex check).
 *         8e. yearLength ∈ {354, 355}.
 *         8f. yearLength === sum(months).
 *    9. source is null OR a non-empty string OR an object.
 *   10. fetchedAt is null OR a "YYYY-MM-DD" string.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const TABLE_PATH = path.join(__dirname, '..', 'db', 'hijri', 'umm-al-qura.json');

const ALLOWED_STATUSES = new Set(['data-pending', 'partial', 'populated']);
const ISO_DATE_RE      = /^\d{4}-\d{2}-\d{2}$/;
const errors = [];

function fail(msg) { errors.push(msg); }

function main() {
    if (!existsSync(TABLE_PATH)) {
        fail(`File not found: ${TABLE_PATH}`);
        return;
    }

    let raw, json;
    try {
        raw = readFileSync(TABLE_PATH, 'utf-8');
    } catch (e) {
        fail(`Cannot read file: ${e.message}`);
        return;
    }
    try {
        json = JSON.parse(raw);
    } catch (e) {
        fail(`Invalid JSON: ${e.message}`);
        return;
    }

    // Rule 1 — top-level keys
    for (const k of ['calendar', 'range', 'status', 'years']) {
        if (!(k in json)) fail(`Missing top-level key: ${k}`);
    }
    if (errors.length) return;

    // Rule 2
    if (json.calendar !== 'umm-al-qura') {
        fail(`calendar must be "umm-al-qura" — got ${JSON.stringify(json.calendar)}`);
    }

    // Rules 3 + 4
    if (!json.range || typeof json.range !== 'object') {
        fail('range must be an object');
    } else {
        const { startYear, endYear } = json.range;
        if (!Number.isInteger(startYear) || startYear < 1) {
            fail(`range.startYear must be a positive integer — got ${startYear}`);
        }
        if (!Number.isInteger(endYear) || endYear < 1) {
            fail(`range.endYear must be a positive integer — got ${endYear}`);
        }
        if (Number.isInteger(startYear) && Number.isInteger(endYear) && endYear < startYear) {
            fail(`range.endYear (${endYear}) < range.startYear (${startYear})`);
        }
    }

    // Rule 5
    if (!ALLOWED_STATUSES.has(json.status)) {
        fail(`status must be one of ${[...ALLOWED_STATUSES].join(', ')} — got ${JSON.stringify(json.status)}`);
    }

    // Rule 9 — source
    if (!(json.source === null
        || (typeof json.source === 'string' && json.source.length > 0)
        || (typeof json.source === 'object' && json.source !== null))) {
        fail(`source must be null, a non-empty string, or an object — got ${typeof json.source}`);
    }

    // Rule 10 — fetchedAt
    if (json.fetchedAt !== undefined && json.fetchedAt !== null) {
        if (typeof json.fetchedAt !== 'string' || !ISO_DATE_RE.test(json.fetchedAt)) {
            fail(`fetchedAt must be null or "YYYY-MM-DD" — got ${JSON.stringify(json.fetchedAt)}`);
        }
    }

    // Rule 7
    if (json.status === 'data-pending') {
        const yearKeys = Object.keys(json.years || {});
        if (yearKeys.length !== 0) {
            fail(`status=data-pending but years has ${yearKeys.length} entries — must be empty`);
        }
    }

    // Rule 6 — populated coverage
    if (json.status === 'populated' && json.range && Number.isInteger(json.range.startYear) && Number.isInteger(json.range.endYear)) {
        const missing = [];
        for (let y = json.range.startYear; y <= json.range.endYear; y++) {
            if (!(String(y) in (json.years || {}))) missing.push(y);
        }
        if (missing.length) {
            const sample = missing.slice(0, 5).join(', ');
            fail(`status=populated but ${missing.length} year(s) missing — sample: ${sample}${missing.length > 5 ? ', ...' : ''}`);
        }
    }

    // Rule 8 — per-year entries
    if (json.years && typeof json.years === 'object') {
        for (const [key, entry] of Object.entries(json.years)) {
            // 8a
            if (!/^\d+$/.test(key)) {
                fail(`years key "${key}" is not a stringified integer`);
                continue;
            }
            const y = parseInt(key, 10);
            if (json.range && Number.isInteger(json.range.startYear) && Number.isInteger(json.range.endYear)) {
                if (y < json.range.startYear || y > json.range.endYear) {
                    fail(`years[${key}] is outside range [${json.range.startYear}..${json.range.endYear}]`);
                }
            }

            // 8b + 8c
            if (!Array.isArray(entry.months) || entry.months.length !== 12) {
                fail(`years[${key}].months must be a 12-element array`);
            } else {
                let monthSum = 0;
                for (let i = 0; i < 12; i++) {
                    const m = entry.months[i];
                    if (m !== 29 && m !== 30) {
                        fail(`years[${key}].months[${i}] must be 29 or 30 — got ${JSON.stringify(m)}`);
                    } else {
                        monthSum += m;
                    }
                }
                // 8f
                if (typeof entry.yearLength === 'number' && entry.yearLength !== monthSum) {
                    fail(`years[${key}].yearLength=${entry.yearLength} but sum(months)=${monthSum}`);
                }
            }

            // 8d
            if (typeof entry.yearStart !== 'string' || !ISO_DATE_RE.test(entry.yearStart)) {
                fail(`years[${key}].yearStart must be "YYYY-MM-DD" — got ${JSON.stringify(entry.yearStart)}`);
            }

            // 8e
            if (entry.yearLength !== 354 && entry.yearLength !== 355) {
                fail(`years[${key}].yearLength must be 354 or 355 — got ${JSON.stringify(entry.yearLength)}`);
            }
        }
    }
}

main();

if (errors.length) {
    console.error(`✗ Schema validation FAILED — ${errors.length} error(s):`);
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
} else {
    console.log('✓ Schema OK — db/hijri/umm-al-qura.json is well-formed.');
    process.exit(0);
}
