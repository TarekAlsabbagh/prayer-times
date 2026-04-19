/**
 * MoonChart — رسم بيانيّ SVG خفيف لمنحنى إضاءة القمر
 *
 * الاستخدام:
 *   MoonChart.render(container, {
 *     date: new Date('2026-04-19'),
 *     rangeDays: 7,           // إجماليّ الأيّام (3 قبل + اليوم + 3 بعد)
 *     lang: 'ar',             // لترجمة labels وعكس RTL
 *     citySlug: 'mecca',      // للروابط على كلّ نقطة
 *     urlPrefix: '/moon-today-in-mecca'  // يُستخدم لبناء /{urlPrefix}/{iso}
 *   });
 *
 * يعتمد على:
 *   - window.MoonCalc.getMoonIllumination(date) — محمَّل مسبقًا من moon.js
 *   - window.MoonCalc.findPhaseEventsInRange(a, b) — لعلامات البدر/المحاق
 *
 * خالٍ من التبعيّات — SVG خالص.
 */

(function(global) {
    'use strict';

    // فهرس مفاتيح أسماء الأشهر (EN) — للـ fallback حين لا تتوفّر i18n
    const GREG_MONTHS_EN = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    function _pad2(n) { return n < 10 ? '0' + n : String(n); }

    function _isoDate(d) {
        return d.getFullYear() + '-' + _pad2(d.getMonth() + 1) + '-' + _pad2(d.getDate());
    }

    // تنسيق تسمية تاريخ مختصر: "19 Apr" أو بلغة المستخدم إن توفّرت i18n.t
    function _shortLabel(d, lang) {
        const day = d.getDate();
        let mon = GREG_MONTHS_EN[d.getMonth()];
        try {
            const _t = (typeof t === 'function') ? t : (global.t || null);
            if (_t) {
                const tr = _t('gmonth.' + (d.getMonth() + 1));
                if (tr && !/^gmonth\./.test(tr)) {
                    // أخذ أوّل 3 أحرف من الترجمة (Jan/ينا/oca...)
                    mon = tr.length > 4 ? tr.slice(0, 3) : tr;
                }
            }
        } catch (_) {}
        return day + ' ' + mon;
    }

    function _createEl(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        if (attrs) {
            for (const k in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, k)) {
                    el.setAttribute(k, attrs[k]);
                }
            }
        }
        return el;
    }

    /**
     * البناء الأساسيّ — يعيد SVG DOM element.
     */
    function _buildSvg(points, cfg) {
        const W = 600, H = 220;
        const PAD_L = 42, PAD_R = 20, PAD_T = 18, PAD_B = 36;
        const CW = W - PAD_L - PAD_R;
        const CH = H - PAD_T - PAD_B;

        const svg = _createEl('svg', {
            viewBox: '0 0 ' + W + ' ' + H,
            preserveAspectRatio: 'xMidYMid meet',
            'aria-label': (cfg.a11yLabel || 'Moon illumination chart'),
            role: 'img'
        });

        // خلفيّة خفيفة
        svg.appendChild(_createEl('rect', {
            x: 0, y: 0, width: W, height: H,
            fill: 'none'
        }));

        // خطوط أفقيّة مرجعيّة (0% / 50% / 100%)
        [0, 50, 100].forEach(function(pct) {
            const y = PAD_T + CH - (pct / 100) * CH;
            svg.appendChild(_createEl('line', {
                x1: PAD_L, x2: W - PAD_R,
                y1: y, y2: y,
                stroke: 'rgba(128,128,128,0.18)',
                'stroke-width': '1',
                'stroke-dasharray': pct === 50 ? '3,3' : '0'
            }));
            const txt = _createEl('text', {
                x: PAD_L - 8, y: y + 4,
                'text-anchor': 'end',
                'font-size': '11',
                fill: 'currentColor',
                opacity: '0.55'
            });
            txt.textContent = pct + '%';
            svg.appendChild(txt);
        });

        // رسم polyline للمنحنى
        const N = points.length;
        const xAt = function(i) { return PAD_L + (N === 1 ? CW / 2 : (i * CW) / (N - 1)); };
        const yAt = function(pct) { return PAD_T + CH - (pct / 100) * CH; };

        // Area fill تحت المنحنى
        const areaPts = [];
        areaPts.push(xAt(0) + ',' + yAt(0));
        for (let i = 0; i < N; i++) {
            areaPts.push(xAt(i) + ',' + yAt(points[i].pct));
        }
        areaPts.push(xAt(N - 1) + ',' + yAt(0));
        svg.appendChild(_createEl('polygon', {
            points: areaPts.join(' '),
            fill: 'url(#moon-chart-grad)',
            opacity: '0.35'
        }));

        // تعريف gradient
        const defs = _createEl('defs', {});
        const grad = _createEl('linearGradient', {
            id: 'moon-chart-grad',
            x1: '0', y1: '0', x2: '0', y2: '1'
        });
        const stop1 = _createEl('stop', { offset: '0%', 'stop-color': '#f9d648' });
        const stop2 = _createEl('stop', { offset: '100%', 'stop-color': '#f9d648', 'stop-opacity': '0' });
        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);
        svg.appendChild(defs);

        // منحنى خطّيّ
        const linePts = [];
        for (let i = 0; i < N; i++) {
            linePts.push(xAt(i) + ',' + yAt(points[i].pct));
        }
        svg.appendChild(_createEl('polyline', {
            points: linePts.join(' '),
            fill: 'none',
            stroke: '#d9a82e',
            'stroke-width': '2.5',
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round'
        }));

        // نقاط البيانات + tooltip titles + روابط
        for (let i = 0; i < N; i++) {
            const p = points[i];
            const cx = xAt(i), cy = yAt(p.pct);
            const isCenter = p.isCenter;
            const r = isCenter ? 6 : 3.5;
            const fill = isCenter ? '#d9a82e' : 'rgba(217,168,46,0.85)';

            let dotGroup = svg;
            if (p.href) {
                const a = document.createElementNS('http://www.w3.org/2000/svg', 'a');
                a.setAttribute('href', p.href);
                a.setAttribute('aria-label', p.label + ' — ' + p.pct.toFixed(1) + '%');
                svg.appendChild(a);
                dotGroup = a;
            }

            const circle = _createEl('circle', {
                cx: cx, cy: cy, r: r,
                fill: fill,
                stroke: isCenter ? '#fff' : 'none',
                'stroke-width': isCenter ? '2.5' : '0',
                'data-date': p.iso
            });
            const title = _createEl('title', {});
            title.textContent = p.label + ' — ' + p.pct.toFixed(1) + '%';
            circle.appendChild(title);
            dotGroup.appendChild(circle);

            // تسمية X-axis تحت كلّ نقطة
            const xLbl = _createEl('text', {
                x: cx, y: H - 14,
                'text-anchor': 'middle',
                'font-size': isCenter ? '12' : '11',
                'font-weight': isCenter ? '700' : '500',
                fill: 'currentColor',
                opacity: isCenter ? '1' : '0.7'
            });
            xLbl.textContent = _shortLabel(p.date, cfg.lang);
            svg.appendChild(xLbl);

            // نسبة فوق نقطة اليوم المركزيّ
            if (isCenter) {
                const pctLbl = _createEl('text', {
                    x: cx, y: cy - 12,
                    'text-anchor': 'middle',
                    'font-size': '12',
                    'font-weight': '700',
                    fill: '#d9a82e'
                });
                pctLbl.textContent = p.pct.toFixed(1) + '%';
                svg.appendChild(pctLbl);
            }

            // علامة إن كان هذا اليوم حدثًا (بدر/محاق/تربيع)
            if (p.phaseEvent) {
                const evLbl = _createEl('text', {
                    x: cx, y: cy - (isCenter ? 28 : 16),
                    'text-anchor': 'middle',
                    'font-size': isCenter ? '16' : '13',
                    fill: 'currentColor'
                });
                evLbl.textContent = p.phaseEvent.icon;
                svg.appendChild(evLbl);
            }
        }

        return svg;
    }

    /**
     * حساب نقاط المنحنى حول التاريخ المركزيّ.
     * rangeDays = 7 → 3 قبل + 1 مركزيّ + 3 بعد.
     */
    function _computePoints(centerDate, rangeDays, citySlug, langPrefix) {
        // MoonCalc معرَّف كـ const global-script (من moon.js) — نصل إليه بالاسم المباشر
        // لا عبر global.MoonCalc لأنّ const لا يُعلَّق على window.
        const MC = (typeof MoonCalc !== 'undefined') ? MoonCalc : (global.MoonCalc || null);
        if (!MC || typeof MC.getMoonIllumination !== 'function') {
            return [];
        }
        const half = Math.floor(rangeDays / 2);

        // نطاق وسيع قليلاً لاكتشاف أحداث الطور ضمن النافذة
        const rangeStart = new Date(centerDate);
        rangeStart.setDate(rangeStart.getDate() - half - 1);
        rangeStart.setHours(0, 0, 0, 0);
        const rangeEnd = new Date(centerDate);
        rangeEnd.setDate(rangeEnd.getDate() + half + 1);
        rangeEnd.setHours(23, 59, 59, 999);

        let phaseEvents = [];
        try {
            if (typeof MC.findPhaseEventsInRange === 'function') {
                phaseEvents = MC.findPhaseEventsInRange(rangeStart, rangeEnd) || [];
            }
        } catch (_) {}

        const centerIso = _isoDate(centerDate);
        const points = [];
        const urlBase = langPrefix ? (langPrefix + '/moon-today-in-' + citySlug) : ('/moon-today-in-' + citySlug);

        for (let offset = -half; offset <= half; offset++) {
            const d = new Date(centerDate);
            d.setHours(12, 0, 0, 0); // ظهرًا لتجنّب مشاكل DST عند حساب 3D position
            d.setDate(d.getDate() + offset);
            let pct = 0;
            try {
                pct = MC.getMoonIllumination(d) || 0;
            } catch (_) {}

            const iso = _isoDate(d);
            // ابحث عن حدث طور يقع في نفس اليوم
            const ev = phaseEvents.find(function(e) {
                return e.date && _isoDate(e.date) === iso;
            });

            points.push({
                date: d,
                iso: iso,
                pct: pct,
                label: _shortLabel(d, null),
                isCenter: iso === centerIso,
                href: (citySlug && iso !== centerIso) ? (urlBase + '/' + iso) : null,
                phaseEvent: ev ? { icon: (ev.phase && ev.phase.icon) || '•' } : null
            });
        }
        return points;
    }

    /**
     * API عامّ: render chart داخل container.
     */
    function render(container, options) {
        if (!container) return;
        const opts = options || {};
        const centerDate = opts.date instanceof Date ? opts.date : new Date();
        const rangeDays = Math.max(3, Math.min(15, opts.rangeDays || 7));
        const lang = opts.lang || 'ar';
        const citySlug = opts.citySlug || '';
        const langPrefix = opts.langPrefix || '';

        const points = _computePoints(centerDate, rangeDays, citySlug, langPrefix);
        if (!points.length) {
            container.textContent = '';
            return;
        }

        const svg = _buildSvg(points, {
            lang: lang,
            a11yLabel: opts.a11yLabel || 'Moon illumination chart'
        });

        // RTL: السماح للمتصفّح بعكس المحور الأفقيّ عبر CSS (transform: scaleX(-1))
        // — لكن نصّ labels داخل SVG سينعكس أيضًا. الحلّ في CSS: مضاد للـ text فقط.

        container.textContent = '';
        container.appendChild(svg);
    }

    // تصدير
    global.MoonChart = { render: render };

})(typeof window !== 'undefined' ? window : this);
