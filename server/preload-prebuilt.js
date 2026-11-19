'use strict';
/* =============================================================================
 * server/preload-prebuilt.js
 * PERF-PRELOAD-PRECOMPUTE-1
 *
 * Every worker used to repeat the same boot work for the static assets in
 * _preloadPaths (server.js): Terser for .js, CleanCSS for .css, gzipSync and
 * brotliCompressSync at quality 11. Measured locally that is ~6 s per process
 * uncapped and 17-18 s per worker on a 2c-equivalent cap -- the bulk of the
 * restart-to-listen gap (brotli q11 alone is ~70 %).
 *
 * This module lets that work be done ONCE, at build time (`npm install` runs the
 * package.json "postinstall" hook, see scripts/build-preload-cache.js), and lets
 * the worker read the results instead of recomputing them.
 *
 * SCOPE (owner decision 2026-11-15, item 4): only the STATIC FILES the boot preload
 * already processes. HTML templates are never prebuilt: they carry the CSP nonce
 * placeholder and env-dependent snippets (AdSense / GA / consent), and are
 * finished per request. isPrebuildable() is the single gate for that.
 *
 * SAFETY: an artifact is used only when
 *   1. the manifest exists, parses, and has this module's FORMAT,
 *   2. its recipe fingerprint equals the one computed at runtime (recipe id,
 *      Node / zlib / brotli versions, Terser / clean-css versions, and the exact
 *      minify + compress options below),
 *   3. the SHA-256 of the source file on disk equals the one recorded at build,
 *   4. every output file exists with the recorded length and SHA-256, and
 *   5. the gzip and brotli copies decompress to exactly the raw copy.
 * Any failure sends THAT file back to the unchanged boot-time path in server.js.
 * Nothing here ever throws into the caller.
 *
 * The option factories below are ALSO what server.js's boot-time path passes to
 * Terser / CleanCSS / brotli, so the build and the fallback cannot drift apart
 * silently: a change to an option changes the recipe fingerprint and invalidates
 * every artifact.
 * ============================================================================= */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const FORMAT = 1;
const RECIPE_ID = 'tp-preload-recipe-1';
const CACHE_DIR_NAME = '.preload-cache';
const MANIFEST_NAME = 'manifest.json';

// ---- the recipe: the exact options the boot-time path uses -------------------------------
// Fresh objects on every call so no consumer can mutate a shared options object.
function terserOptions() { return { compress: true, mangle: true }; }
function cleanCssOptions() { return { returnPromise: false, level: 2 }; }
function brotliOptions() { return { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }; }
// gzip: zlib.gzipSync(data) with Node's defaults (no options object) -- recorded as 'default'.

// HTML templates are finished per request (nonce placeholder, env snippets, SSR rewrites) and are
// therefore never prebuilt. Everything else in _preloadPaths is a plain static file.
function isPrebuildable(rel) {
    return typeof rel === 'string' && path.extname(rel).toLowerCase() !== '.html';
}

// Defence in depth for the same rule: a file that carries the per-response CSP nonce placeholder is
//   finished per request and must never be prebuilt, whatever its extension. None of today's 25 do.
const NONCE_PLACEHOLDER = '__TP_CSP_NONCE__';
function carriesRequestPlaceholder(buf) { return Buffer.isBuffer(buf) && buf.includes(NONCE_PLACEHOLDER); }

function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }

function _pkgVersion(name) {
    try {
        // terser and clean-css both expose package.json (terser via its "exports" map).
        return String(require(name + '/package.json').version || 'unknown');
    } catch (_e) {
        try {
            let dir = path.dirname(require.resolve(name));
            for (let i = 0; i < 5; i++) {
                const p = path.join(dir, 'package.json');
                if (fs.existsSync(p)) {
                    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
                    if (j && j.name === name) return String(j.version || 'unknown');
                }
                dir = path.dirname(dir);
            }
        } catch (_e2) { /* fall through */ }
        return 'unknown';
    }
}

function recipeInfo() {
    return {
        id: RECIPE_ID,
        node: process.version,
        zlib: String(process.versions.zlib || ''),
        brotli: String(process.versions.brotli || ''),
        terser: _pkgVersion('terser'),
        cleancss: _pkgVersion('clean-css'),
        terserOptions: terserOptions(),
        cleanCssOptions: cleanCssOptions(),
        brotliQuality: brotliOptions().params[zlib.constants.BROTLI_PARAM_QUALITY],
        gzip: 'default',
    };
}
function recipeFingerprint(info) { return sha256(JSON.stringify(info || recipeInfo())); }

// TP_PRELOAD_CACHE_DIR is a local-test seam (the smoke points build + server at a scratch copy so
//   it can damage artifacts without touching the real cache). Unset everywhere else; even when set,
//   every artifact still has to pass the checks above before it is used.
function cacheDir(root) {
    const o = String(process.env.TP_PRELOAD_CACHE_DIR || '').trim();
    return o ? path.resolve(o) : path.join(root, CACHE_DIR_NAME);
}
function artifactName(rel, kind) { return rel.replace(/[\\/]/g, '__') + '.' + kind; }

// ---- runtime side ----------------------------------------------------------------------
// openPrebuilt(root) never throws. It returns an object with take(rel, srcBuf) and summary().
// take() returns { data, gzipped, brotli } (the exact shape _staticCache stores) or null.
function openPrebuilt(root, opts) {
    const o = opts || {};
    const stats = { hit: 0, miss: 0, reasons: {}, missFiles: [] };
    const miss = (rel, reason) => {
        stats.miss++;
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        if (stats.missFiles.length < 6) stats.missFiles.push(rel);
        return null;
    };
    let manifest = null, globalReason = null;
    const dir = o.dir || cacheDir(root);
    try {
        if (o.disabled) globalReason = 'disabled';
        else {
            const mp = path.join(dir, MANIFEST_NAME);
            if (!fs.existsSync(mp)) globalReason = 'manifest-missing';
            else {
                let j = null;
                try { j = JSON.parse(fs.readFileSync(mp, 'utf8')); } catch (_e) { globalReason = 'manifest-unreadable'; }
                if (j) {
                    if (j.format !== FORMAT || !j.files || typeof j.files !== 'object') globalReason = 'manifest-format';
                    else if (j.recipe !== recipeFingerprint()) globalReason = 'recipe-mismatch';
                    else manifest = j;
                }
            }
        }
    } catch (_e) { globalReason = 'manifest-error'; manifest = null; }

    function _readOut(spec) {
        if (!spec || typeof spec.file !== 'string' || spec.file.indexOf('/') !== -1 || spec.file.indexOf('\\') !== -1) return null;
        const buf = fs.readFileSync(path.join(dir, spec.file));
        if (buf.length !== spec.len || sha256(buf) !== spec.sha256) return null;
        return buf;
    }

    function take(rel, srcBuf) {
        if (!isPrebuildable(rel)) return null;                // HTML: never prebuilt, not counted
        if (!manifest) return miss(rel, globalReason || 'manifest-missing');
        try {
            const e = manifest.files[rel];
            if (carriesRequestPlaceholder(srcBuf)) return miss(rel, 'request-placeholder');
            if (!e || !e.out) return miss(rel, 'not-in-manifest');
            if (!Buffer.isBuffer(srcBuf) || e.src !== sha256(srcBuf)) return miss(rel, 'source-changed');
            const data = _readOut(e.out.raw);
            const gzipped = _readOut(e.out.gz);
            const brotli = _readOut(e.out.br);
            if (!data || !gzipped || !brotli) return miss(rel, 'artifact-corrupt');
            if (!zlib.gunzipSync(gzipped).equals(data)) return miss(rel, 'gzip-mismatch');
            if (!zlib.brotliDecompressSync(brotli).equals(data)) return miss(rel, 'brotli-mismatch');
            stats.hit++;
            // minified=false means the minifier produced nothing at build time and the raw bytes were
            //   kept -- exactly the boot-time rule, under which the inline CSS text is NOT set.
            return { data, gzipped, brotli, minified: e.minified === true };
        } catch (_e) {
            return miss(rel, 'artifact-corrupt');
        }
    }

    // ONE line, no visitor data: counts, reason codes and at most six asset paths.
    function summary(totalPrebuildable) {
        if (stats.miss === 0 && stats.hit > 0) return '[preload-prebuilt] used ' + stats.hit + '/' + totalPrebuildable + ' prebuilt static files';
        const rs = Object.keys(stats.reasons).sort().map(k => k + '=' + stats.reasons[k]).join(',');
        return '[preload-prebuilt] fallback to boot-time minify+compress for ' + stats.miss + '/' + totalPrebuildable
            + ' static files (used ' + stats.hit + '); reasons: ' + (rs || 'none')
            + (stats.missFiles.length ? '; e.g. ' + stats.missFiles.join(' ') : '');
    }

    return { take, summary, stats, active: !!manifest };
}

// ---- build side ------------------------------------------------------------------------
// Mirrors the non-HTML half of _preloadStatic() (server.js) step for step: same tools, same
// options (the factories above), same per-file order, same "keep the original bytes when the
// minifier fails" rule, one shared CleanCSS instance.
async function computeOne(rel, srcBuf, tools) {
    let data = srcBuf;
    const ext = path.extname(rel).toLowerCase();
    let minifyError = null, minified = false;
    try {
        if (ext === '.js') {
            const result = await tools.Terser.minify(srcBuf.toString('utf8'), terserOptions());
            if (result && result.code) { data = Buffer.from(result.code, 'utf8'); minified = true; }
        } else if (ext === '.css') {
            const result = tools.cleanCss.minify(srcBuf.toString('utf8'));
            if (result && result.styles) { data = Buffer.from(result.styles, 'utf8'); minified = true; }
        }
    } catch (me) { minifyError = me && me.message || String(me); minified = false; data = srcBuf; }
    let gzipped = null, brotli = null;
    try { gzipped = zlib.gzipSync(data); } catch (_e) {}
    try { brotli = zlib.brotliCompressSync(data, brotliOptions()); } catch (_e) {}
    return { data, gzipped, brotli, minified, minifyError };
}

// Extract the _preloadPaths list from server.js so there is exactly ONE list.
function readPreloadPathsFromServer(serverSrc) {
    const start = serverSrc.indexOf('const _preloadPaths = [');
    if (start === -1) throw new Error('_preloadPaths not found in server.js');
    const end = serverSrc.indexOf('];', start);
    if (end === -1) throw new Error('_preloadPaths end not found in server.js');
    const body = serverSrc.slice(start + 'const _preloadPaths = ['.length, end)
        .split(/\r?\n/).map(l => l.replace(/\/\/.*$/, '')).join('\n');
    const out = [];
    const re = /'([^'\r\n]+)'/g;
    let m;
    while ((m = re.exec(body))) out.push(m[1]);
    if (!out.length) throw new Error('_preloadPaths parsed empty');
    return out;
}

module.exports = {
    FORMAT, RECIPE_ID, CACHE_DIR_NAME, MANIFEST_NAME,
    terserOptions, cleanCssOptions, brotliOptions,
    isPrebuildable, carriesRequestPlaceholder, NONCE_PLACEHOLDER, sha256, recipeInfo, recipeFingerprint, cacheDir, artifactName,
    openPrebuilt, computeOne, readPreloadPathsFromServer,
};
