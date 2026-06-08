/* =============================================================================
 * js/site-search.js — SINGLE SOURCE OF TRUTH for the site place-search pipeline.
 * COUNTRY-PRAYER-PAGE-SEARCH-PIPELINE-PARITY-FIX-1.
 *
 * window.SiteSearch wraps the proven /search-test pipeline (formerly the
 * `_st*` IIFE inside js/app.js). Both the SPA (homepage hero + moon/qibla hubs,
 * via js/app.js) AND the standalone country page (prayer-times-cities.html,
 * which does NOT load app.js) load this file and share ONE implementation of:
 *   • /api/search-place fetch (curated → discovered → external — server does
 *     normalization + aliases; client sends q + lang verbatim, NO runtime
 *     translation, NO client-built slug — r.slug comes from the endpoint)
 *   • readiness filter (slug + countryCode + timezone + valid lat/lng)
 *   • result mapping + pick → POST /api/place-selected (source !== 'curated',
 *     best-effort) + seed sessionStorage + navigate (lang-prefix preserved)
 *   • debounce
 *
 * The ONLY difference between the homepage and a country page is `countryScope`:
 *   • homepage  → createBox WITHOUT countryScope  → GLOBAL (all countries).
 *   • country   → createBox WITH countryScope='ma' → keeps ONLY results whose
 *                 countryCode === 'ma'; cross-country results are dropped.
 *
 * NEVER writes curated-places.json or db/cities-*.json. Persistence is ONLY the
 * approved POST /api/place-selected (Supabase discovered_places, verified:false).
 * ============================================================================= */
(function () {
    'use strict';
    if (typeof window === 'undefined') return;
    if (window.SiteSearch) return; // idempotent (don't redefine if already loaded)

    var SUPPORTED_LANGS = ['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'es', 'bn', 'ms'];

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function pickLang() {
        try {
            var params = new URLSearchParams(window.location.search);
            var fromQs = String(params.get('lang') || '').toLowerCase();
            if (fromQs && SUPPORTED_LANGS.indexOf(fromQs) !== -1) return fromQs;
            var fromHtml = String(document.documentElement.lang || 'ar').toLowerCase();
            return SUPPORTED_LANGS.indexOf(fromHtml) !== -1 ? fromHtml : 'ar';
        } catch (_) { return 'ar'; }
    }

    function langPrefix() {
        try {
            var p = (window.location && window.location.pathname) || '';
            var m = p.match(/^\/(en|fr|tr|ur|de|id|es|bn|ms)(?=\/|$)/);
            return m ? '/' + m[1] : '';
        } catch (_) { return ''; }
    }

    function routeFor(targetRoute, slug) {
        var lp = langPrefix();
        var s = encodeURIComponent(slug);
        switch (targetRoute) {
            case 'moon-hub':  return lp + '/moon-today-in-' + s;
            case 'qibla-hub': return lp + '/qibla-in-' + s;
            case 'prayer-times':
            default:          return lp + '/prayer-times-in-' + s;
        }
    }

    // Readiness filter — identical to the former _stIsPrayerTimesReady.
    function isReady(r) {
        if (!r || typeof r !== 'object') return false;
        if (!r.slug || !r.countryCode || !r.timezone) return false;
        var lat = Number(r.lat), lng = Number(r.lng);
        if (!isFinite(lat) || lat < -90 || lat > 90) return false;
        if (!isFinite(lng) || lng < -180 || lng > 180) return false;
        return true;
    }

    // fetch /api/search-place → { results:[], status:'ok'|'error'|... }. Never throws.
    function fetchResults(q, lang) {
        var LANG = lang || pickLang();
        return fetch('/api/search-place?q=' + encodeURIComponent(q) + '&lang=' + LANG, {
            headers: { 'Accept': 'application/json' }
        }).then(function (res) {
            if (!res.ok) return { results: [], status: 'error' };
            return res.json().then(function (data) {
                return {
                    results: (data && Array.isArray(data.results)) ? data.results : [],
                    status: (data && typeof data.status === 'string') ? data.status : 'ok'
                };
            });
        }).catch(function () { return { results: [], status: 'error' }; });
    }

    // Apply readiness + (optional) country scope + (optional) dedup-vs-existing-slugs.
    // countryScope: a 2-letter cc string → keep ONLY r.countryCode === scope.
    // existingSlugs: a Set of lowercased slugs already shown → dropped (dedup).
    function scopeFilter(results, countryScope, existingSlugs) {
        var out = (Array.isArray(results) ? results : []).filter(isReady);
        if (countryScope) {
            var scope = String(countryScope).toLowerCase();
            out = out.filter(function (r) { return (r.countryCode || '').toLowerCase() === scope; });
        }
        if (existingSlugs && typeof existingSlugs.has === 'function') {
            out = out.filter(function (r) { return !existingSlugs.has((r.slug || '').toLowerCase()); });
        }
        return out;
    }

    // Pick a result: persist (discovered only) + seed sessionStorage + navigate.
    // Mirrors the former _stOnPick verbatim. NEVER writes curated/db.
    function onPick(r, opts) {
        opts = opts || {};
        if (!isReady(r)) return;
        var LANG = opts.lang || pickLang();
        var targetRoute = opts.targetRoute || 'prayer-times';
        try {
            if (r.source && r.source !== 'curated') {
                var payload = {
                    slug: r.slug, type: r.type || 'city', countryCode: r.countryCode,
                    lat: r.lat, lng: r.lng, timezone: r.timezone,
                    names: Object.assign({},
                        (r.names && typeof r.names === 'object') ? r.names : {},
                        r.displayName ? (function () { var o = {}; o[LANG] = r.displayName; return o; })() : {},
                        r.secondaryName ? { en: r.secondaryName } : {}
                    ),
                    aliases: {},
                    admin: { country: r.countryName ? (function () { var o = {}; o[LANG] = r.countryName; return o; })() : {} },
                    source: r.source,
                    nameQuality: r.nameQuality ? (function () { var o = {}; o[LANG] = r.nameQuality; return o; })() : {},
                    originalName: typeof r.originalName === 'string' ? r.originalName : ''
                };
                fetch('/api/place-selected', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(function () {});
            }
        } catch (_) { /* persistence is best-effort */ }
        // Seed the FULL selected-city context BEFORE routing so the destination
        // page (prayer-times / moon / qibla) reads the picked city, not a stale one.
        try {
            var _cc = (r.countryCode || '').toLowerCase();
            var _name = r.displayName || r.slug;
            var _en = r.secondaryName
                || (r.names && typeof r.names === 'object' ? r.names.en : '')
                || r.displayName || r.slug;
            var _country = r.countryName || '';
            var _tz = (r.timezone != null) ? r.timezone : null;
            var _seed = JSON.stringify({
                lat: r.lat, lng: r.lng, name: _name, country: _country,
                englishName: _en, countryCode: _cc, timezone: _tz, _v: 2
            });
            var _ctx = JSON.stringify({
                lat: r.lat, lng: r.lng, name: _name, country: _country,
                englishName: _en, countryCode: _cc, timezone: _tz, ts: Date.now()
            });
            try { sessionStorage.setItem('city_' + r.slug, _seed); } catch (_e) {}
            if (targetRoute === 'moon-hub') {
                try { sessionStorage.setItem('city_moon', _seed); } catch (_e) {}
            } else if (targetRoute === 'qibla-hub') {
                try { sessionStorage.setItem('city_qibla', _seed); } catch (_e) {}
            }
            try { sessionStorage.setItem('last_city_context', _ctx); } catch (_e) {}
        } catch (_) { /* best-effort — never block navigation */ }
        window.location.href = routeFor(targetRoute, r.slug);
    }

    // Default dropdown renderer — the /search-test <button class="search-test-result">
    // markup (used by the homepage hero + moon/qibla hubs via app.js). The country
    // page passes its OWN render so it can draw grid cards / .sugg-item rows instead.
    function renderSearchTestDropdown(box, results, pick) {
        if (!box) return;
        box.innerHTML = results.map(function (r, i) {
            var cc = (r.countryCode || '').toLowerCase();
            var flagHtml = /^[a-z]{2}$/.test(cc)
                ? '<span class="search-test-result-flag" aria-hidden="true">' +
                    '<img src="https://flagcdn.com/w40/' + cc + '.png"' +
                    ' srcset="https://flagcdn.com/w80/' + cc + '.png 2x"' +
                    ' alt="" width="28" height="21" loading="lazy" decoding="async">' +
                  '</span>'
                : '';
            var display = esc(r.displayName || r.slug);
            var typeL = esc(r.typeLabel || r.type || '');
            var cName = esc(r.countryName || '');
            var subtitle = typeL && cName ? typeL + ' · ' + cName : (typeL || cName);
            return (
                '<button class="search-test-result" type="button" role="option" data-idx="' + i + '">' +
                  flagHtml +
                  '<span class="search-test-result-text"><strong>' + display + '</strong>' +
                  '<span>' + subtitle + '</span></span>' +
                '</button>'
            );
        }).join('');
        box.hidden = false;
        box.classList.add('open');
        Array.prototype.forEach.call(box.querySelectorAll('.search-test-result'), function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(btn.getAttribute('data-idx'), 10);
                if (results[idx]) pick(results[idx]);
            });
        });
    }

    /* -------------------------------------------------------------------------
     * createBox(opts) — universal wired search box. Returns { search, onEnter,
     *   hide, getResults }. The caller drives it (directly via the input's
     *   oninput, OR manually after a local-curated-filter miss).
     *
     * opts:
     *   inputId        (string)  — input element id (for the stale-guard).
     *   boxId          (string)  — results container id.
     *   targetRoute    (string)  — 'prayer-times' | 'moon-hub' | 'qibla-hub'.
     *   countryScope   (string|fn|null) — cc to scope to (or () => cc). null = global.
     *   existingSlugs  (Set|fn|null)     — slugs to dedup against (or () => Set).
     *   debounceMs     (number)  — default 150.
     *   max            (number)  — cap rendered results.
     *   render         (fn)      — (box, results, pick) → draw. Default = search-test dropdown.
     *   onLoading      (fn)      — (box) → loading state. Optional.
     *   onEmpty        (fn)      — (box, status, scoped) → empty/no-result. Optional.
     *   onHide         (fn)      — (box) → clear. Optional.
     * ----------------------------------------------------------------------- */
    function createBox(opts) {
        opts = opts || {};
        var debounce = null;
        var lastResults = [];
        var render = opts.render || renderSearchTestDropdown;
        var debounceMs = (opts.debounceMs != null) ? opts.debounceMs : 150;

        function box() { return opts.boxId ? document.getElementById(opts.boxId) : null; }
        function input() { return opts.inputId ? document.getElementById(opts.inputId) : null; }
        function resolveScope() {
            return (typeof opts.countryScope === 'function') ? opts.countryScope() : (opts.countryScope || null);
        }
        function resolveExisting() {
            return (typeof opts.existingSlugs === 'function') ? opts.existingSlugs() : (opts.existingSlugs || null);
        }
        function hide() {
            lastResults = [];
            if (opts.onHide) { opts.onHide(box()); return; }
            var b = box();
            if (b) { b.hidden = true; b.classList.remove('open'); b.innerHTML = ''; }
        }
        function run(q) {
            var b = box();
            if (opts.onLoading && b) opts.onLoading(b);
            var LANG = pickLang();
            fetchResults(q, LANG).then(function (data) {
                var inp = input();
                if (inp && inp.value.trim() !== q) return; // stale — user kept typing / cleared
                var scope = resolveScope();
                var filtered = scopeFilter(data.results, scope, resolveExisting());
                if (opts.max && filtered.length > opts.max) filtered = filtered.slice(0, opts.max);
                lastResults = filtered;
                var bb = box();
                if (!filtered.length) {
                    if (opts.onEmpty && bb) opts.onEmpty(bb, data.status, !!scope);
                    return;
                }
                render(bb, filtered, function (r) { onPick(r, { targetRoute: opts.targetRoute, lang: LANG }); });
            });
        }
        function search(q) {
            clearTimeout(debounce);
            q = String(q || '').trim();
            if (!q) { hide(); return; }
            debounce = setTimeout(function () { run(q); }, debounceMs);
        }
        function onEnter() {
            if (lastResults && lastResults[0]) {
                onPick(lastResults[0], { targetRoute: opts.targetRoute, lang: pickLang() });
            }
        }
        return { search: search, onEnter: onEnter, hide: hide, getResults: function () { return lastResults; } };
    }

    window.SiteSearch = {
        SUPPORTED_LANGS: SUPPORTED_LANGS,
        esc: esc,
        pickLang: pickLang,
        langPrefix: langPrefix,
        routeFor: routeFor,
        isReady: isReady,
        fetchResults: fetchResults,
        scopeFilter: scopeFilter,
        onPick: onPick,
        renderSearchTestDropdown: renderSearchTestDropdown,
        createBox: createBox
    };
})();
