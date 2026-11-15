#!/usr/bin/env node
'use strict';
/* =============================================================================
 * scripts/build-preload-cache.js
 * PERF-PRELOAD-PRECOMPUTE-1
 *
 * Precomputes, ONCE per build, what every worker otherwise recomputes at boot for
 * the static files in server.js's _preloadPaths (HTML templates excluded):
 * the minified bytes, the gzip copy and the brotli-q11 copy. Output goes to
 * .preload-cache/ (gitignored, never served: not in the static allowlist).
 *
 * Runs automatically from package.json "postinstall", i.e. inside Render's existing
 * build command (`npm install`) -- no dashboard change. It NEVER fails the install:
 * any error is logged and the script exits 0, leaving no manifest, so the server
 * simply keeps doing the work at boot exactly as before.
 *
 *   node scripts/build-preload-cache.js            build (or rebuild) the cache
 *   TP_PRELOAD_PREBUILD=off npm install            skip the build step entirely
 * ============================================================================= */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

async function main() {
    if (String(process.env.TP_PRELOAD_PREBUILD || '').toLowerCase() === 'off') {
        console.log('[preload-prebuild] skipped (TP_PRELOAD_PREBUILD=off)');
        return;
    }
    const t0 = Date.now();
    const P = require(path.join(ROOT, 'server', 'preload-prebuilt.js'));
    const Terser = require('terser');
    const CleanCSS = require('clean-css');
    const tools = { Terser, cleanCss: new CleanCSS(P.cleanCssOptions()) };

    const serverSrc = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
    const rels = P.readPreloadPathsFromServer(serverSrc).filter(P.isPrebuildable);

    const finalDir = P.cacheDir(ROOT);
    const tmpDir = finalDir + '.tmp-' + process.pid;
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    try {
        await buildInto(P, tools, rels, tmpDir, finalDir, t0);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });   // no-op after a successful rename
    }
}

async function buildInto(P, tools, rels, tmpDir, finalDir, t0) {

    const info = P.recipeInfo();
    const manifest = { format: P.FORMAT, recipe: P.recipeFingerprint(info), recipeInfo: info, builtAt: new Date().toISOString(), files: {} };
    let built = 0, skipped = 0;
    for (const rel of rels) {
        const full = path.join(ROOT, rel);
        let src;
        try { src = fs.readFileSync(full); } catch (_e) { skipped++; continue; }   // boot path ignores missing files too
        const r = await P.computeOne(rel, src, tools);
        if (r.minifyError) console.warn('[preload-prebuild] minify skipped ' + rel + ': ' + r.minifyError);
        if (!r.gzipped || !r.brotli) { skipped++; continue; }                       // leave it to the boot path
        const out = {};
        for (const [kind, buf] of [['raw', r.data], ['gz', r.gzipped], ['br', r.brotli]]) {
            const file = P.artifactName(rel, kind);
            fs.writeFileSync(path.join(tmpDir, file), buf);
            out[kind] = { file, len: buf.length, sha256: P.sha256(buf) };
        }
        manifest.files[rel] = { src: P.sha256(src), minified: r.minified, out };
        built++;
    }
    // The manifest is written last: a half-written directory has no manifest and is never used.
    fs.writeFileSync(path.join(tmpDir, P.MANIFEST_NAME), JSON.stringify(manifest, null, 1));
    fs.rmSync(finalDir, { recursive: true, force: true });
    fs.renameSync(tmpDir, finalDir);
    console.log('[preload-prebuild] built ' + built + '/' + rels.length + ' static files'
        + (skipped ? ' (skipped ' + skipped + ')' : '') + ' in ' + (Date.now() - t0) + 'ms -> ' + (path.relative(ROOT, finalDir) || finalDir).replace(/\\/g, '/') + '/');
}

main().catch((e) => {
    // Never fail `npm install`: without a manifest the server does the work at boot, as before.
    console.warn('[preload-prebuild] FAILED, server will minify+compress at boot instead: ' + (e && e.message || e));
    try {
        const P = require(path.join(ROOT, 'server', 'preload-prebuilt.js'));
        fs.rmSync(path.join(P.cacheDir(ROOT), P.MANIFEST_NAME), { force: true });
    } catch (_e) { /* nothing else to do */ }
    process.exitCode = 0;
});
