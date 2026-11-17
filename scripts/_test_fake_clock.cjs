// TEST-ONLY preload (never loaded in production): a process-wide adjustable clock for in-process boundary tests.
// Loaded with NODE_OPTIONS="--require <this file>" so cluster workers inherit it. Inert unless TP_FAKE_CLOCK_FILE is set.
// The control file holds JSON {"target": "<ISO>", "at": <real ms when written>}; every process re-reads it every 100 ms,
// so the clock jumps WITHOUT a restart and then keeps ticking in real time from the target.
'use strict';
const F = process.env.TP_FAKE_CLOCK_FILE;
if (F) {
    const fs = require('fs');
    const Real = Date;
    let off = 0, lastRaw = '';
    const read = () => {
        try {
            const raw = fs.readFileSync(F, 'utf8');
            if (raw === lastRaw) return;
            const j = JSON.parse(raw); const t = Real.parse(j.target);
            if (Number.isFinite(t) && Number.isFinite(j.at)) { off = t - j.at; lastRaw = raw; }
        } catch (_) { /* keep the previous offset */ }
    };
    read();
    setInterval(read, 100).unref();
    function FakeDate(...a) {
        if (!new.target) return new Real(Real.now() + off).toString();
        return a.length ? new Real(...a) : new Real(Real.now() + off);
    }
    FakeDate.prototype = Real.prototype;
    FakeDate.now = () => Real.now() + off;
    FakeDate.parse = Real.parse;
    FakeDate.UTC = Real.UTC;
    global.Date = FakeDate;
}
