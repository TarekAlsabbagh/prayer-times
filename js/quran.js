/* QURAN-AR surah pages — client ENHANCEMENTS ONLY (SPA-integrated: page served inside the real index.html
   shell, so app.js already provides toggleSidebar/toggleTheme, the header, sidebar and footer).
   Loaded ONLY on /quran/{slug} (the 114 official English slugs). Nothing here is per-surah data and no slug is
   listed here: the ayah ceiling comes from the SSR max="", the surah number from a data- attribute the server
   wrote, and the slug table lives on the server alone. Contains NO ayah text, NO surah data, NO basmala generation, NO text
   correction, NO page re-splitting. If JS is disabled the SSR page stays fully readable and the ayah/page
   jump falls back to a server GET->302 redirect to the fragment. All localStorage access is guarded.
   NOTE: deliberately contains NO Arabic letters — every user-facing string lives in the server-rendered
   HTML; JS only toggles classes / hidden / aria and reads existing DOM nodes. It scopes everything to
   #page-quran-surah and NEVER redefines the site globals (toggleSidebar / toggleTheme live in app.js). */
(function () {
  'use strict';
  function init() {
    var shell = document.getElementById('page-quran-surah');
    if (!shell || shell.getAttribute('data-quran-init') === '1') return;
    shell.setAttribute('data-quran-init', '1');
    var htmlEl = document.documentElement;
    // The ayah CSS var (--q-ayah-size) is declared on .quran-surah-page (the ancestor of .quran-ayah-flow),
    // so font +/- MUST set it on that element — setting it on #page-quran-surah is shadowed by that rule.
    var fontEl = shell.querySelector('.quran-surah-page') || shell;
    var sticky = shell.querySelector('.quran-reading-sticky');

    /* ---- measure the SITE chrome → CSS vars on :root so (a) the sticky reading bar docks just BELOW the real
       header, (b) ayah/page jump targets clear header+bar, (c) the portaled surah modal centers in the content
       area (left of the RTL sidebar). Header height becomes 0 in reading mode → the bar docks to the top. ---- */
    function measureChrome() {
      var header = document.querySelector('.top-header');
      var headerH = header ? header.getBoundingClientRect().height : 0;      // 0 when hidden (reading mode)
      var main = document.querySelector('.main-content');
      var sidebarW = main ? Math.max(0, parseFloat(getComputedStyle(main).marginRight) || 0) : 0; // desktop rail reservation; 0 on mobile / reading
      var stickyH = sticky ? sticky.getBoundingClientRect().height : 0;
      htmlEl.style.setProperty('--q-header-h', Math.round(headerH) + 'px');
      htmlEl.style.setProperty('--q-sidebar-w', Math.round(sidebarW) + 'px');
      htmlEl.style.setProperty('--q-sticky-h', Math.round(stickyH) + 'px');
    }
    measureChrome();
    window.addEventListener('resize', measureChrome);
    if (window.ResizeObserver) {
      var _ro = new ResizeObserver(measureChrome);
      var _h = document.querySelector('.top-header'); if (_h) _ro.observe(_h);
      if (sticky) _ro.observe(sticky);
    }

    var LS = {
      get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
    };
    // font + reading-mode are GLOBAL reader preferences → one key each, shared by all 114 surahs.
    // The reading POSITION is per-surah. The URL no longer carries the number (it is /quran/{english-slug}
    // now), so the number comes from an SSR data attribute instead of being parsed out of the path. Keying on
    // the NUMBER, not the slug, is deliberate: the number is the surah's permanent identity, while a slug is a
    // presentation choice — if a slug were ever corrected, slug-keyed positions would silently orphan, whereas
    // number-keyed ones keep working. It also keeps every already-saved «quran.pos.surahN» key valid.
    var SURAH_N = (shell.querySelector('[data-quran-surah-number]') || {}).getAttribute
        ? shell.querySelector('[data-quran-surah-number]').getAttribute('data-quran-surah-number') : '0';
    // QURAN-AR-HOME-INDEX-SSR-1 adds ONE key on top of the above — `last` — so /quran can answer "which
    // surah was I reading?". The 114 per-surah keys cannot: they carry no timestamp and no ordering, so
    // scanning them tells you where you stopped in each surah but never which one was most recent. This is
    // an extra POINTER written at the same moment by the same code, not a second store: `pos` keeps its
    // exact old meaning (a reference-page number, per surah) and every already-saved value stays valid.
    var K = { font: 'quran.pref.fontStep', read: 'quran.pref.reading', pos: 'quran.pos.surah' + (SURAH_N || '0'), last: 'quran.pos.last' };

    /* ---- font size: step (-3..+6) added on top of the viewport-aware base var --q-ayah-base (CSS sets it
       to 1.55rem on desktop, 1.43rem on phones). Reading the base from CSS keeps the DEFAULT responsive per
       breakpoint instead of forcing one fixed size everywhere. The +/- var is set on .quran-surah-page. ---- */
    var step = parseInt(LS.get(K.font) || '0', 10); if (isNaN(step)) step = 0;
    function readBaseRem() {
      var v = parseFloat(getComputedStyle(fontEl).getPropertyValue('--q-ayah-base'));
      return isNaN(v) ? 1.55 : v;
    }
    function applyFont(persist) {
      step = Math.max(-3, Math.min(6, step));
      fontEl.style.setProperty('--q-ayah-size', (readBaseRem() + step * 0.12).toFixed(2) + 'rem');
      if (persist !== false) LS.set(K.font, String(step));
    }
    applyFont();
    // re-apply (no persist) if the viewport crosses the phone/desktop breakpoint, e.g. on rotate
    window.addEventListener('resize', function () { applyFont(false); });

    /* ---- reading mode (hides page chrome; class on <body>) ---- */
    if (LS.get(K.read) === '1') document.body.classList.add('quran-reading');
    function toggleReading() {
      var on = document.body.classList.toggle('quran-reading');
      LS.set(K.read, on ? '1' : '0');
      syncPressed('reading', on);
      measureChrome(); // header now hidden/shown → re-dock the sticky bar + recompute jump scroll-margin
    }

    /* ---- reflect toggle state on the toolbar buttons (aria-pressed) ---- */
    function btn(action) { return shell.querySelector('[data-quran-action="' + action + '"]'); }
    function syncPressed(action, on) { var b = btn(action); if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    function syncTheme() { syncPressed('theme', htmlEl.getAttribute('data-theme') === 'dark'); }
    syncTheme();
    syncPressed('reading', document.body.classList.contains('quran-reading'));

    /* ---- toolbar actions (scoped to the page; theme delegates to the site's own toggleTheme) ---- */
    shell.addEventListener('click', function (e) {
      var b = e.target.closest('[data-quran-action]'); if (!b) return;
      var a = b.getAttribute('data-quran-action');
      if (a === 'font-inc') { step++; applyFont(); }
      else if (a === 'font-dec') { step--; applyFont(); }
      else if (a === 'theme') { if (typeof window.toggleTheme === 'function') window.toggleTheme(); setTimeout(syncTheme, 0); }
      else if (a === 'reading') { toggleReading(); }
      else if (a === 'top') { var t = document.getElementById('quran-top'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });

    /* ---- jump to a page card (select + no-JS form) ---- */
    var goSel = shell.querySelector('[data-quran-goto]');
    function gotoPage(p) { var el = document.getElementById('page-' + p); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    var pjForm = shell.querySelector('[data-quran-page-jump]');
    if (pjForm) pjForm.addEventListener('submit', function (e) { e.preventDefault(); if (goSel) gotoPage(goSel.value); });
    if (goSel) goSel.addEventListener('change', function () { gotoPage(goSel.value); });

    /* ---- jump to an ayah (numeric input; JS = smooth scroll + flash; no-JS = server 302) ---- */
    var ajForm = shell.querySelector('[data-quran-ayah-jump]');
    if (ajForm) {
      var ajInput = ajForm.querySelector('input[name="ayah"]');
      var ajErr = ajForm.querySelector('[data-quran-ayah-errmsg]');
      // The ceiling is THIS surah's ayah count, read from the SSR-rendered max="" — the same number the
      // server validates against and prints in the error message, so there is ONE source and they cannot
      // drift apart. The old literal 112 was Al-Anbiya's: it would have let ayah 8 through on Al-Fatiha
      // (7 ayat) and rejected a valid ayah 150 on Al-Baqara (286).
      var ajMax = parseInt(ajInput ? ajInput.getAttribute('max') : '', 10);
      var clearErr = function () { if (ajErr) ajErr.hidden = true; if (ajInput) { ajInput.classList.remove('is-invalid'); ajInput.removeAttribute('aria-invalid'); } };
      ajForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var n = parseInt(ajInput ? ajInput.value : '', 10);
        if (!n || n < 1 || !(ajMax >= 1) || n > ajMax) {
          if (ajErr) ajErr.hidden = false;
          if (ajInput) { ajInput.classList.add('is-invalid'); ajInput.setAttribute('aria-invalid', 'true'); ajInput.focus(); }
          return;
        }
        clearErr();
        gotoAyah(n);
      });
      if (ajInput) ajInput.addEventListener('input', clearErr);
    }
    function gotoAyah(n) {
      var el = document.getElementById('ayah-' + n);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('is-flash');
      el.setAttribute('tabindex', '-1');
      try { el.focus({ preventScroll: true }); } catch (e) {}
      window.setTimeout(function () { el.classList.remove('is-flash'); }, 1900);
    }

    /* ---- surah MODAL — ONE modal shared by every "browse surahs" button (hero + surah-end). Portaled to
       <body> so no clipped ancestor / low-z-index parent hides it behind the sidebar. Overlay dims the whole
       screen; the panel centers in the content area (left of the RTL sidebar rail). Full a11y: focus to the
       filter, focus-trap, Escape + overlay-click close, background inert, body scroll-lock, focus return. ---- */
    var modal = document.getElementById('quran-index');
    var idxOverlay = shell.querySelector('[data-quran-index-overlay]');
    // PORTAL: relocate overlay + modal to <body> (escapes overflow:clip + the low-z-index stacking context)
    if (idxOverlay && idxOverlay.parentNode !== document.body) document.body.appendChild(idxOverlay);
    if (modal && modal.parentNode !== document.body) document.body.appendChild(modal);
    var filterInput = modal ? modal.querySelector('[data-quran-surah-filter]') : null;
    var filterEmpty = modal ? modal.querySelector('[data-quran-filter-empty]') : null;
    var filterCount = modal ? modal.querySelector('[data-quran-surah-count]') : null;
    var filterClears = modal ? [].slice.call(modal.querySelectorAll('[data-quran-filter-clear]')) : [];
    var modalBody = modal ? modal.querySelector('[data-quran-modal-body]') : null;
    var idxLis = modal ? [].slice.call(modal.querySelectorAll('.quran-idx-li')) : [];
    var modalOpen = false, lastOpener = null, inerted = [];
    function focusables() {
      if (!modal) return [];
      return [].slice.call(modal.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'))
        .filter(function (el) { return el.offsetParent !== null && !el.hidden; });
    }
    function setBackgroundInert(on) {
      if (on) {
        inerted = [];
        [].forEach.call(document.body.children, function (el) {
          if (el === modal || el === idxOverlay) return;
          inerted.push({ el: el, ah: el.getAttribute('aria-hidden'), inert: el.hasAttribute('inert') });
          el.setAttribute('aria-hidden', 'true'); try { el.inert = true; } catch (e) {}
        });
      } else {
        inerted.forEach(function (r) {
          if (r.ah === null) r.el.removeAttribute('aria-hidden'); else r.el.setAttribute('aria-hidden', r.ah);
          try { r.el.inert = r.inert; } catch (e) {}
        });
        inerted = [];
      }
    }
    function openIndex(opener) {
      if (!modal || modalOpen) return;
      modalOpen = true; lastOpener = opener || document.activeElement;
      if (idxOverlay) { idxOverlay.hidden = false; idxOverlay.classList.add('is-open'); }
      modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('quran-modal-open');
      setBackgroundInert(true);
      clearFilter(false);   // every open starts clean: previous query cleared, all 114 shown, list scrolled to top
      var f = filterInput || modal.querySelector('.quran-index-close');
      window.setTimeout(function () { if (f) try { f.focus(); } catch (e) {} }, 30);
    }
    function closeIndex() {
      if (!modal || !modalOpen) return;
      modalOpen = false;
      modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
      if (idxOverlay) { idxOverlay.classList.remove('is-open'); idxOverlay.hidden = true; }
      document.body.classList.remove('quran-modal-open');
      setBackgroundInert(false);
      if (lastOpener) try { lastOpener.focus(); } catch (e) {}
    }
    // open buttons stay in the shell; the close button + list anchors live inside the (portaled) modal
    shell.addEventListener('click', function (e) {
      // shared trigger — every "browse all surahs" CTA (hero + surah-end) opens the ONE index modal
      var open = e.target.closest('[data-quran-surah-browser-trigger],[data-quran-open-index]');
      if (open) { e.preventDefault(); openIndex(open); }
    });
    if (modal) modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-quran-close-index]')) closeIndex(); // no preventDefault: the current-surah anchor still jumps
    });
    if (idxOverlay) idxOverlay.addEventListener('click', closeIndex);
    document.addEventListener('keydown', function (e) {
      if (!modalOpen) return;
      if (e.key === 'Escape' || e.keyCode === 27) {   // Escape clears a non-empty query first; only then closes
        e.preventDefault();
        if (filterInput && filterInput.value) clearFilter(true); else closeIndex();
        return;
      }
      if (e.key === 'Tab' || e.keyCode === 9) {           // focus trap
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // in-modal filter of the 114 surahs by name or number — client-side show/hide ONLY (NOT the /quran/search
    // API): no network, no library, no chapters.json reload, no HTML built from user input. ONE modal + ONE
    // filter shared by every "browse surahs" button. Both the query AND a search copy derived from the names
    // are normalized identically; the displayed name / chapters.json are never touched.
    function normalize(s) {
      return String(s)
        .replace(/[\u0660-\u0669]/g, function (d) { return d.charCodeAt(0) - 0x0660; })   // Arabic-Indic digits -> Latin
        .replace(/[\u06F0-\u06F9]/g, function (d) { return d.charCodeAt(0) - 0x06F0; })   // Extended (Persian) digits -> Latin
        .normalize('NFD')
        .replace(/[\u0300-\u036F]/g, '')            // Latin combining diacritics (a-macron -> a)
        .replace(/[\u064B-\u0655\u0670]/g, '')     // Arabic tashkeel + hamza/madda (incl. from NFD) + superscript alef
        .replace(/\u0640/g, '')                      // tatweel
        .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')  // alef forms (aa/hamza-above/hamza-below/wasla) -> plain alef
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    }
    function toArDigits(n) { return String(n).replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[+d]; }); }
    // cache the normalized search keys per surah ONCE (query is normalized per keystroke — the list is not re-parsed).
    // `whole` holds the two complete names on their own (display AR + EN) so a query can match a name ENTIRELY;
    // `name` is the loose haystack (raw mushaf spelling + EN) for substring hits. normalize() strips U+064B–U+0655,
    // so the cleaned display name, the raw mushaf spelling and an undiacritised query all collapse to ONE key —
    // for surah 36 that means typing it with or without the maddah (U+0653) finds the same row.
    var idxData = idxLis.map(function (li) {
      var ar = normalize(li.getAttribute('data-name-ar') || '');
      var en = normalize(li.getAttribute('data-name-en') || '');
      var sl = normalize(li.getAttribute('data-slug') || '');
      // The slug joins the whole-value keys: it is the URL a reader may have been sent, so it must find its
      // surah. normalize() strips the apostrophes and marks out of the English name, which is exactly what the
      // slug rule did — so an English query usually lands on the slug key too, from either spelling.
      return {
        li: li,
        num: (li.getAttribute('data-num') || '').replace(/\D/g, ''),
        name: normalize(li.getAttribute('data-name') || '') + ' ' + sl,
        whole: [ar, en, sl].filter(Boolean)
      };
    });
    function countLabel(shown, hasQuery) {
      if (!hasQuery) return toArDigits(idxData.length) + ' سورة';
      if (shown === 0) return 'لا توجد نتائج';
      if (shown === 1) return 'نتيجة واحدة';
      if (shown === 2) return 'نتيجتان مطابقتان';
      if (shown <= 10) return toArDigits(shown) + ' سور مطابقة';
      return toArDigits(shown) + ' سورة مطابقة';
    }
    // Text search is TIERED, best tier wins outright:
    //   1) the query IS a whole name   2) a name STARTS WITH it   3) a name merely CONTAINS it
    // Plain substring matching cannot serve the one-letter surah names (38 and 50): each of those letters also
    // occurs inside a dozen longer names, so the surah actually NAMED by the letter would arrive buried among
    // wrong answers. With tiering, a whole-name hit suppresses the looser tiers outright — a one-letter query
    // returns that one surah — while a query that matches no name exactly still falls through to substring.
    // (This file carries NO Arabic letters by design — every user-facing string is server-rendered. Examples
    //  live in the test: scripts/_smoke_quran_drawer_search_priority_1.mjs.)
    function applyFilter() {
      if (!filterInput) return;
      var q = normalize(filterInput.value);
      var hasQuery = q.length > 0;
      var isNum = hasQuery && /^[0-9]+$/.test(q);   // pure-digit query → exact surah-number match
      var tier = null;
      if (hasQuery && !isNum) {
        var starts = function (s) { return s.indexOf(q) === 0; };
        if (idxData.some(function (d) { return d.whole.indexOf(q) !== -1; })) tier = 'exact';
        else if (idxData.some(function (d) { return d.whole.some(starts); })) tier = 'prefix';
        else tier = 'partial';
      }
      var shown = 0;
      for (var i = 0; i < idxData.length; i++) {
        var d = idxData[i], match;
        if (!hasQuery) match = true;
        else if (isNum) match = d.num === q;                          // "21"/"٢١" → only surah 21, equality
        else if (tier === 'exact') match = d.whole.indexOf(q) !== -1; // the query IS this surah's name
        else if (tier === 'prefix') match = d.whole.some(function (s) { return s.indexOf(q) === 0; });
        else match = d.name.indexOf(q) !== -1;                        // substring on raw AR + EN
        d.li.hidden = !match; if (match) shown++;            // [hidden] → display:none (CSS override) → grid reflows, no gaps, not tabbable
      }
      if (filterEmpty) filterEmpty.hidden = !(hasQuery && shown === 0);
      if (filterCount) filterCount.textContent = countLabel(shown, hasQuery);   // textContent only, never HTML
      filterClears.forEach(function (b) { if (b.classList.contains('quran-filter-clear')) b.hidden = !hasQuery; });
    }
    function clearFilter(refocus) {
      if (!filterInput) return;
      filterInput.value = '';
      applyFilter();
      if (modalBody) modalBody.scrollTop = 0;   // the list returns to the top
      if (refocus) try { filterInput.focus(); } catch (e) {}
    }
    if (filterInput) filterInput.addEventListener('input', applyFilter);
    filterClears.forEach(function (b) { b.addEventListener('click', function () { clearFilter(true); }); });

    /* ---- reading progress bar + text + save last position (rAF-throttled) ---- */
    var out = shell.querySelector('[data-quran-progress-value]');
    var fill = shell.querySelector('[data-quran-progress-fill]');
    var cards = [].slice.call(shell.querySelectorAll('.quran-page-card'));
    var ayahs = [].slice.call(shell.querySelectorAll('[id^="ayah-"]'));
    var total = cards.length, ticking = false;
    function ar(n) { return String(n).replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[+d]; }); }
    function updateProgress() {
      ticking = false;
      if (!cards.length) return;
      var mid = window.innerHeight * 0.35, cur = cards[0];
      for (var i = 0; i < cards.length; i++) { if (cards[i].getBoundingClientRect().top <= mid) cur = cards[i]; }
      var idx = cards.indexOf(cur) + 1;
      if (out) out.textContent = ar(idx) + ' / ' + ar(total);
      if (fill) fill.style.width = Math.round((idx / total) * 100) + '%';
      LS.set(K.pos, cur.getAttribute('data-reference-page'));
      // The AYAH the reader is on — the page card alone is too coarse to resume from, and /quran links to
      // #ayah-N. Same sweep, same threshold as the card above: the last ayah whose top has passed the line.
      var n = parseInt(SURAH_N, 10);
      if (ayahs.length && n >= 1 && n <= 114) {
        var a = ayahs[0];
        for (var j = 0; j < ayahs.length; j++) { if (ayahs[j].getBoundingClientRect().top <= mid) a = ayahs[j]; }
        var num = parseInt(String(a.id).replace('ayah-', ''), 10);
        if (num >= 1) {
          // The path is stored for reference only; /quran resolves the link from `n` against its own
          // 114-route table, so a stale or edited value here can never redirect a reader somewhere else.
          LS.set(K.last, JSON.stringify({ n: n, ayah: num, path: location.pathname, t: Date.now() }));
        }
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(updateProgress); }
    }, { passive: true });
    updateProgress();

    /* ---- NON-ARABIC LANGUAGE UNAVAILABLE (P0) — Quran surah pages exist in ARABIC ONLY. The site switcher
       (js/i18n-core.js setLanguage) would send the reader to /{lang}/quran/{slug} → a real 404. We intercept
       in the CAPTURE phase on document, so the menu item's own bubble-phase listener (which calls setLanguage)
       never runs: the URL, history, page language, scroll position, font size, theme and reading mode all stay
       exactly as they were. This file loads ONLY on the surah route → no other page's switcher is affected.
       All copy is read from the SSR'd markup / JSON island (this file stays text-free by design); the SSR
       Arabic markup IS the fallback if a picked language has no entry. ---- */
    var locModal = document.getElementById('quran-locale-modal');
    var locOverlay = document.querySelector('[data-quran-locale-overlay]');
    if (locModal && locOverlay) {
      // PORTAL to <body> — same reason as the index modal: escape clipped/low-z-index ancestors
      if (locOverlay.parentNode !== document.body) document.body.appendChild(locOverlay);
      if (locModal.parentNode !== document.body) document.body.appendChild(locModal);
      var locData = {};
      try {
        var island = document.getElementById('quran-locale-l10n');
        if (island) locData = JSON.parse(island.textContent) || {};
      } catch (e) { locData = {}; }
      var locOpen = false, locOpener = null, locInert = [];
      var locStay = locModal.querySelector('[data-quran-locale-stay]');
      var locGo = locModal.querySelector('[data-quran-locale-go]');
      var locName = locModal.querySelector('[data-quran-locale-name]');

      function locFocusables() {
        return [].slice.call(locModal.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'))
          .filter(function (el) { return el.offsetParent !== null && !el.hidden; });
      }
      function locSetInert(on) {
        if (on) {
          locInert = [];
          [].forEach.call(document.body.children, function (el) {
            if (el === locModal || el === locOverlay) return;
            locInert.push({ el: el, ah: el.getAttribute('aria-hidden'), inert: el.hasAttribute('inert') });
            el.setAttribute('aria-hidden', 'true'); try { el.inert = true; } catch (e) {}
          });
        } else {
          locInert.forEach(function (r) {
            if (r.ah === null) r.el.removeAttribute('aria-hidden'); else r.el.setAttribute('aria-hidden', r.ah);
            try { r.el.inert = r.inert; } catch (e) {}
          });
          locInert = [];
        }
      }
      // swap the six UI strings to the picked language; anything missing keeps the SSR Arabic text (fallback)
      function locApplyLang(lang) {
        var t = (locData.t && (locData.t[lang] || locData.t.ar)) || null;
        if (t) {
          [].forEach.call(locModal.querySelectorAll('[data-quran-locale-t]'), function (el) {
            var v = t[el.getAttribute('data-quran-locale-t')];
            if (typeof v === 'string' && v) el.textContent = v;
          });
          var cl = locModal.querySelector('[data-quran-locale-close]');
          if (cl && t.close) { cl.setAttribute('aria-label', t.close); cl.setAttribute('title', t.close); }
        }
        if (locName) locName.textContent = (locData.names && locData.names[lang]) || lang;
        var home = (locData.homes && locData.homes[lang]) || ('/' + lang);
        if (locGo) locGo.setAttribute('href', home);
        // the dialog reads in the PICKED language → give it that language's direction, not the page's
        locModal.setAttribute('lang', lang);
        locModal.setAttribute('dir', (lang === 'ur' ? 'rtl' : (lang === 'ar' ? 'rtl' : 'ltr')));
      }
      function locOpenModal(lang, opener) {
        if (locOpen) return;
        locOpen = true; locOpener = opener || document.activeElement;
        locApplyLang(lang);
        locOverlay.hidden = false; locOverlay.classList.add('is-open');
        locModal.classList.add('is-open'); locModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('quran-modal-open');   // reuses the existing body scroll-lock
        locSetInert(true);
        window.setTimeout(function () { if (locStay) try { locStay.focus(); } catch (e) {} }, 30);
      }
      function locCloseModal() {
        if (!locOpen) return;
        locOpen = false;
        locModal.classList.remove('is-open'); locModal.setAttribute('aria-hidden', 'true');
        locOverlay.classList.remove('is-open'); locOverlay.hidden = true;
        document.body.classList.remove('quran-modal-open');
        locSetInert(false);
        // Focus returns to the language control. The menu ITEM was closed with the menu before the dialog
        // opened, so it is display:none and cannot take focus — fall back to the switcher button that owns
        // it (the persistent control the reader came from). Never leave focus stranded on <body>.
        var back = locOpener;
        if (back && back.offsetParent === null && back.closest) {
          var sw = back.closest('.lang-switcher');
          back = (sw && sw.querySelector('.lang-switcher-btn')) || back;
        }
        if (back) try { back.focus(); } catch (e) {}
      }
      // CAPTURE phase: beat i18n-core's per-item click listener → setLanguage() is never reached
      document.addEventListener('click', function (e) {
        var item = e.target && e.target.closest ? e.target.closest('.lang-menu [data-lang]') : null;
        if (!item || locOpen) return;
        var lang = item.getAttribute('data-lang');
        if (!lang || lang === 'ar') return;         // Arabic = the page's own language → normal behaviour
        e.preventDefault();
        e.stopPropagation();
        // close the switcher menu (and the mobile sidebar) BEFORE the dialog opens
        var sw = item.closest('.lang-switcher');
        if (sw) {
          sw.classList.remove('open');
          var swBtn = sw.querySelector('.lang-switcher-btn');
          if (swBtn) swBtn.setAttribute('aria-expanded', 'false');
        }
        var sb = document.getElementById('sidebar');
        if (sb && sb.classList.contains('open')) sb.classList.remove('open');
        document.body.classList.remove('sidebar-open');
        locOpenModal(lang, item);
      }, true);
      locModal.addEventListener('click', function (e) {
        if (e.target.closest('[data-quran-locale-close]') || e.target.closest('[data-quran-locale-stay]')) {
          e.preventDefault(); locCloseModal();
        }
        // [data-quran-locale-go] is a real <a href="/{lang}"> → let the browser navigate
      });
      locOverlay.addEventListener('click', locCloseModal);
      document.addEventListener('keydown', function (e) {
        if (!locOpen) return;
        if (e.key === 'Escape' || e.keyCode === 27) { e.preventDefault(); locCloseModal(); return; }
        if (e.key === 'Tab' || e.keyCode === 9) {
          var f = locFocusables(); if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
