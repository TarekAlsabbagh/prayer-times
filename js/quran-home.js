/* QURAN-AR-HOME-INDEX-SSR-1 — progressive enhancement for /quran.
   Three jobs: filter the SSR'd surah index, show a continue-reading card from localStorage, and keep the
   language switcher from sending an Arabic-only page to a URL that does not exist.

   What this file is NOT: it never fetches, never renders a surah link that the server did not already
   write, and never holds the Quran text. Every one of the 114 index links and all 30 juz links are real
   <a href> elements in the initial HTML — with JavaScript off the page loses the search box and the
   continue card and stays fully navigable. The search reads the data-* attributes the server wrote; it
   issues NO network request of any kind.

   Like js/quran.js this file deliberately contains NO Arabic letters: every user-facing string lives in the
   server-rendered HTML. It only toggles hidden/classes and copies text out of nodes the server produced. */
(function () {
  'use strict';
  function boot() {
    var page = document.getElementById('page-quran-home');
    if (!page || page.getAttribute('data-quran-home-ready') === '1') return;   // guard against double-init on SPA nav
    page.setAttribute('data-quran-home-ready', '1');

    var LS = {
      get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
      del: function (k) { try { window.localStorage.removeItem(k); } catch (e) {} }
    };

    /* ---------- 1) SEARCH ----------
       Matching happens on five keys the server put on each <li>: the number in both digit systems, the
       display name, the raw mushaf spelling, the official English name and the slug. It deliberately does
       NOT look at the ayah count or any helper text — searching "7" should find surah 7, not the 30-odd
       surahs that happen to have 7 ayat. */
    var cbox   = page.querySelector('[data-quran-combobox]');
    var input = page.querySelector('[data-quran-search]');
    var clear = page.querySelector('[data-quran-search-clear]');
    var count = page.querySelector('[data-quran-search-count]');
    var list  = page.querySelector('[data-quran-suggest]');
    var items = [].slice.call(page.querySelectorAll('.quran-home-idx-li'));
    var TOTAL = items.length;
    var MAX   = 8;                       // never let the dropdown swallow the viewport
    // Named SUG, not L10N: the language-switcher block further down already declares `var L10N`, and `var`
    // is function-scoped — a second declaration would silently overwrite these four strings at boot.
    var SUG   = {
      results: (cbox && cbox.getAttribute('data-l10n-results')) || '',
      none:    (cbox && cbox.getAttribute('data-l10n-none'))    || '',
      more:    (cbox && cbox.getAttribute('data-l10n-more'))    || '',
      multi:   (cbox && cbox.getAttribute('data-l10n-multi'))   || '',
    };

    // Arabic-Indic digits → ASCII, tatweel and the ornamental marks dropped, alef/ya/ta-marbuta folded.
    // Folding is for MATCHING ONLY — nothing here is ever written back into the page.
    function norm(s) {
      return String(s || '')
        .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
        .replace(/[ً-ٰٓـ]/g, '')
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/[‎‏]/g, '')
        .trim().toLowerCase().replace(/\s+/g, ' ');
    }
    // One record per surah, read once from the attributes the server already wrote on the index cards.
    // No second copy of the data, no hand-typed names or slugs, no request.
    var meta = items.map(function (li) {
      var a = li.querySelector('.quran-home-idx-card');
      return {
        num:  li.getAttribute('data-num'),
        href: a ? a.getAttribute('href') : '#',
        numAr: li.getAttribute('data-num-ar') || '',
        name: (li.querySelector('.quran-home-idx-name') || {}).textContent || '',
        ayat: (li.querySelector('.quran-home-idx-meta') || {}).textContent || '',
        ar:   norm(li.getAttribute('data-name')),        // display name (marks stripped)
        raw:  norm(li.getAttribute('data-name-raw')),    // mushaf spelling — «يسٓ» normalises onto «يس»
        en:   norm(li.getAttribute('data-en')),
        slug: norm(li.getAttribute('data-slug')),
      };
    });

    /* Ranking, exactly as the ticket orders it:
         1 exact number · 2 exact Arabic name · 3 exact English name · 4 exact slug
         5 Arabic prefix · 6 English prefix · 7 substring inside a name
       Two rules keep the list honest rather than merely long:
         • If ANY exact match exists, ONLY exact matches are shown. That is what makes «ص», «ق», «يس»,
           «21» and «٢١» return their one surah instead of every name that happens to contain the letter.
         • Substring matching (tier 7) needs at least two characters. A single letter is a name here, not
           a fragment, so it must never fan out across the mushaf. */
    function rank(m, q) {
      if (m.num === q) return 1;
      if (m.ar === q || m.raw === q) return 2;
      if (m.en === q) return 3;
      if (m.slug === q) return 4;
      if (m.ar.indexOf(q) === 0 || m.raw.indexOf(q) === 0) return 5;
      if (m.en.indexOf(q) === 0 || m.slug.indexOf(q) === 0) return 6;
      if (q.length >= 2 && (m.ar.indexOf(q) !== -1 || m.raw.indexOf(q) !== -1 || m.en.indexOf(q) !== -1)) return 7;
      return 0;
    }
    function search(q) {
      var qq = norm(q);
      if (!qq) return [];
      var hits = [];
      meta.forEach(function (m) { var r = rank(m, qq); if (r) hits.push({ m: m, r: r }); });
      var exact = hits.filter(function (h) { return h.r <= 4; });
      if (exact.length) hits = exact;
      // stable: better rank first, then mushaf order — never alphabetical, never by ayah count
      hits.sort(function (a, b) { return a.r - b.r || (+a.m.num) - (+b.m.num); });
      return hits.map(function (h) { return h.m; });
    }

    /* ---- the listbox ---- */
    var isOpen = false, active = -1, current = [];   // isOpen/cbox, not open/box: both names are re-declared
    // by the last-read card and the language modal further down, and `var` is function-scoped.
    function say(msg) { if (count) count.textContent = msg; }          // the aria-live region
    function setExpanded(v) { if (input) input.setAttribute('aria-expanded', v ? 'true' : 'false'); }
    function closeList(keepText) {
      isOpen = false; active = -1;
      if (list) { list.hidden = true; list.innerHTML = ''; }
      setExpanded(false);
      if (input) input.removeAttribute('aria-activedescendant');
      if (!keepText) say('');
    }
    function optionHtml(m, i) {
      return '<li class="quran-home-suggest-item" role="option" id="qs-opt-' + i + '" aria-selected="false">'
        + '<a class="quran-home-suggest-link" href="' + m.href + '" tabindex="-1">'
        + '<span class="quran-home-suggest-num" aria-hidden="true">' + m.numAr + '</span>'
        + '<span class="quran-home-suggest-text">'
        + '<span class="quran-home-suggest-name">' + m.name + '</span>'
        + '<span class="quran-home-suggest-meta">' + m.ayat + '</span>'
        + '</span></a></li>';
    }
    function render(q) {
      if (!list) return;
      current = search(q);
      if (!norm(q)) { closeList(); if (clear) clear.hidden = true; return; }
      if (clear) clear.hidden = false;
      var shown = current.slice(0, MAX);
      var html = shown.map(optionHtml).join('');
      if (!current.length) {
        // an empty field is silent; a typed query that matches nothing must say so, not sit blank
        html = '<li class="quran-home-suggest-none" role="option" aria-disabled="true" aria-selected="false">'
             + SUG.none + '</li>';
      } else if (current.length > MAX) {
        html += '<li class="quran-home-suggest-more" role="presentation">'
             + SUG.more.replace('{n}', toAr(current.length)) + '</li>';
      }
      list.innerHTML = html;
      list.hidden = false; isOpen = true; active = -1;
      setExpanded(true);
      if (input) input.removeAttribute('aria-activedescendant');
      say(current.length ? SUG.results.replace('{n}', toAr(current.length)) : SUG.none);
    }
    function options() { return [].slice.call(list ? list.querySelectorAll('[role="option"]:not([aria-disabled])') : []); }
    function highlight(i) {
      var opts = options(); if (!opts.length) return;
      if (i < 0) i = opts.length - 1;
      if (i >= opts.length) i = 0;
      opts.forEach(function (o, k) { o.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      active = i;
      var el = opts[i];
      if (input) input.setAttribute('aria-activedescendant', el.id);
      if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
      // announce the surah the keyboard landed on — not the whole list
      var nm = el.querySelector('.quran-home-suggest-name');
      if (nm) say(nm.textContent);
    }
    function go(i) {
      var opts = options(); if (!opts[i]) return;
      var a = opts[i].querySelector('a');
      if (a) window.location.href = a.getAttribute('href');
    }

    if (input) {
      input.addEventListener('input', function () { render(input.value); });
      // re-opening on focus/click restores the list the reader already typed, instead of forcing a retype
      input.addEventListener('focus', function () { if (!isOpen && norm(input.value)) render(input.value); });
      input.addEventListener('click', function () { if (!isOpen && norm(input.value)) render(input.value); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!isOpen && norm(input.value)) { render(input.value); return; }
          highlight(active + 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (isOpen) highlight(active - 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();                       // never submit / never reload /quran
          if (active >= 0) { go(active); return; }
          // one result and no manual choice → open it. Several results → say so rather than
          // guessing: silently opening the first would send readers to a surah they never picked.
          if (current.length === 1) { go(0); return; }
          if (current.length > 1) { if (!isOpen) render(input.value); say(SUG.multi); }
        } else if (e.key === 'Escape') {
          if (isOpen) { e.preventDefault(); closeList(true); }   // keeps the typed text, per the ticket
        } else if (e.key === 'Tab') {
          closeList(true);
        }
      });
    }
    if (clear) clear.addEventListener('click', function () {
      if (input) { input.value = ''; input.focus(); }
      closeList(); if (clear) clear.hidden = true;
    });
    // mousedown (not click) would fire before the link's own click on touch — so close on click, and only
    // when the press landed outside the whole combobox. This is what keeps a tap on a result from
    // dismissing the list before the navigation happens.
    document.addEventListener('click', function (e) {
      if (!cbox || !isOpen) return;
      if (!cbox.contains(e.target)) closeList(true);
    });

    /* ---------- 2) CONTINUE READING ----------
       js/quran.js writes `quran.pos.last` = {n, ayah, path, t} while you read. Everything below treats that
       value as untrusted input: bad JSON, a surah outside 1..114, an ayah outside that surah's real count,
       or a surah the index does not list all fall through to "no card" rather than a wrong one. The surah
       name and the href are taken from the SSR index entry for `n` — never from the stored path — so a
       tampered value cannot point a reader at another origin. */
    var box = page.querySelector('[data-quran-lastread]');
    var heroBtn = page.querySelector('[data-quran-continue]');
    try {
      var raw = LS.get('quran.pos.last');
      if (raw && box) {
        var v = JSON.parse(raw);
        var n = parseInt(v && v.n, 10), ayah = parseInt(v && v.ayah, 10);
        var li = (n >= 1 && n <= 114) ? page.querySelector('.quran-home-idx-li[data-num="' + n + '"]') : null;
        if (li && ayah >= 1) {
          var card = li.querySelector('.quran-home-idx-card');
          var name = li.querySelector('.quran-home-idx-name');
          // the ayah ceiling comes from the count the server printed for THIS surah, not from the store
          var maxTxt = li.querySelector('.quran-home-idx-meta');
          var max = maxTxt ? parseInt(norm(maxTxt.textContent).replace(/[^0-9]/g, ''), 10) : 0;
          // «آية واحدة» / «آيتان» print no numeral, so an empty parse means 1 or 2 — both safe lower bounds.
          if (!max || isNaN(max)) max = 2;
          if (ayah <= max) {
            var href = card.getAttribute('href') + '#ayah-' + ayah;
            var elName = box.querySelector('[data-quran-lastread-surah]');
            var elAyah = box.querySelector('[data-quran-lastread-ayah]');
            var link = box.querySelector('[data-quran-lastread-link]');
            if (elName) elName.textContent = name.textContent;
            // the ayah label is assembled from the SSR button template so no Arabic lives in this file
            if (elAyah) elAyah.textContent = (box.getAttribute('data-quran-ayah-label') || '') + ' ' + toAr(ayah);
            if (link) { link.setAttribute('href', href); link.textContent = (box.getAttribute('data-quran-cta-label') || '') + ' ' + toAr(ayah); }
            box.hidden = false;
            if (heroBtn) { heroBtn.setAttribute('href', href); heroBtn.hidden = false; }
          }
        }
      }
    } catch (e) { /* corrupt value → no card, and nothing is thrown at the reader */ }
    function toAr(x) { return String(x).replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[+d]; }); }

    /* ---------- 3) LANGUAGE SWITCHER ----------
       Same guard as the surah pages: this section is Arabic-only, so i18n-core's setLanguage would send the
       reader to /{lang}/quran — a 404. Intercept in the CAPTURE phase so the menu item's own listener never
       runs, and show the SSR'd notice. The copy speaks about the Quran SECTION, never a specific surah. */
    var modal = document.getElementById('quran-locale-modal');
    var overlay = page.querySelector('[data-quran-locale-overlay]');
    var nameEl = page.querySelector('[data-quran-locale-name]');
    var goEl = page.querySelector('[data-quran-locale-go]');
    var opener = null, open = false;
    var L10N = null;
    try { var isl = document.getElementById('quran-locale-l10n'); if (isl) L10N = JSON.parse(isl.textContent); } catch (e) {}

    function openModal(lang, from) {
      if (!modal || open) return;
      open = true; opener = from;
      // the copy is about the Quran SECTION, not any one surah — the SSR strings never name a surah
      if (nameEl && L10N && L10N.names && L10N.names[lang]) nameEl.textContent = L10N.names[lang];
      if (goEl && L10N && L10N.homes && L10N.homes[lang]) goEl.setAttribute('href', L10N.homes[lang]);
      modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
      if (overlay) { overlay.hidden = false; overlay.classList.add('is-open'); }
      document.body.classList.add('quran-modal-open');
      var close = modal.querySelector('[data-quran-locale-close]');
      if (close) try { close.focus(); } catch (e) {}
    }
    function closeModal() {
      if (!modal || !open) return;
      open = false;
      modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
      if (overlay) { overlay.classList.remove('is-open'); overlay.hidden = true; }
      document.body.classList.remove('quran-modal-open');
      // the menu item itself is display:none once the switcher closed → return focus to the switcher button
      var back = opener;
      if (back && back.offsetParent === null && back.closest) {
        var sw = back.closest('.lang-switcher');
        back = (sw && sw.querySelector('.lang-switcher-btn')) || back;
      }
      if (back) try { back.focus(); } catch (e) {}
    }
    // CAPTURE phase, so i18n-core's own per-item listener (which calls setLanguage) never runs
    document.addEventListener('click', function (e) {
      var host = document.getElementById('page-quran-home');
      if (!host || !host.classList.contains('active')) return;
      var item = e.target && e.target.closest ? e.target.closest('.lang-menu [data-lang]') : null;
      if (!item || open) return;
      var lang = item.getAttribute('data-lang');
      if (!lang || lang === 'ar') return;
      e.preventDefault(); e.stopPropagation();
      var sw = item.closest('.lang-switcher');
      if (sw) { sw.classList.remove('open'); var b = sw.querySelector('.lang-switcher-btn'); if (b) b.setAttribute('aria-expanded', 'false'); }
      openModal(lang, item);
    }, true);
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('[data-quran-locale-close], [data-quran-locale-stay]')) closeModal();
      });
    }
    if (overlay) overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) closeModal(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  // SPA re-entry: app.js flips .page.active without a reload, so re-run (the ready flag makes it idempotent)
  window.addEventListener('pageshow', boot);
})();
