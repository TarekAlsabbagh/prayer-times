#!/usr/bin/env node
/**
 * AZKAR-DAILY-RESET-1 — end-to-end test in real Chrome via CDP.
 *
 * Verifies all 7 invariants from the user spec:
 *
 *   T1  Same-day reload preserves progress (no reset on refresh).
 *   T2  Stale-date stored bundle triggers daily reset on load (count → 0).
 *   T3  After the daily-reset trigger, storage gets a fresh bundle whose
 *       date === today and items === {}.
 *   T4  Manual "إعادة الضبط" button zeros all items but keeps date = today
 *       (so the next reload does NOT additionally trigger the daily-reset
 *       branch — that would be a no-op + extra write).
 *   T5  Legacy `azkar.count.morning.*` per-item keys are wiped on first load.
 *   T6  Bundle shape matches user spec exactly:
 *         { date: 'YYYY-MM-DD', items: { 'morning-xxx': { count, completed } } }
 *   T7  Page navigation (back/forward / inter-page click) does NOT reset.
 *
 * Run:
 *   node scripts/_azkar_daily_reset_test.mjs
 */

import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL_BASE = process.env.AZKAR_BASE || 'http://localhost:8080';
const URL = URL_BASE + '/azkar/morning-azkar';
const DEBUG_PORT = 9223;

const userDataDir = `C:\\Users\\Tarek\\AppData\\Local\\Temp\\azkar-daily-${Date.now()}`;
const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1280,800', 'about:blank'
], { stdio: ['ignore', 'pipe', 'pipe'] });

let ready = false;
const t0 = Date.now();
chrome.stderr.on('data', d => { if (d.toString().includes('DevTools listening on')) ready = true; });
while (!ready && Date.now() - t0 < 12000) await wait(150);
if (!ready) { console.error('chrome stuck'); process.exit(1); }

const targets = await new Promise((res, rej) =>
    http.get(`http://127.0.0.1:${DEBUG_PORT}/json`, r => {
        let b=''; r.on('data',c=>b+=c); r.on('end',()=>res(JSON.parse(b)));
    }).on('error',rej)
);
const tab = targets.find(t => t.type==='page');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((res,rej)=>{ws.addEventListener('open',res);ws.addEventListener('error',rej);});

const pending = new Map(); let id = 0;
ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id); pending.delete(m.id);
        m.error ? rej(new Error(m.error.message)) : res(m.result);
    }
});
const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
});
await send('Page.enable'); await send('Runtime.enable');

async function navigate() {
    await send('Page.navigate', { url: URL });
    await new Promise(resolve => {
        const h = ev => {
            const m = JSON.parse(ev.data);
            if (m.method === 'Page.loadEventFired') { ws.removeEventListener('message', h); resolve(); }
        };
        ws.addEventListener('message', h);
    });
    await wait(2200);
}
async function evalJs(expr) {
    const r = await send('Runtime.evaluate', {
        expression: `(async () => { ${expr} })()`,
        awaitPromise: true, returnByValue: true
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
}

const todayLocal = (() => {
    const d = new Date();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${d.getFullYear()}-${m}-${day}`;
})();

const results = [];
const pass = (name, ok, extra='') => {
    results.push({ name, ok, extra });
    console.log((ok ? '  ✅' : '  ❌') + ' ' + name + (extra ? '  — ' + extra : ''));
};

// ── T0: blank-slate setup. Pre-seed deprecated keys to also verify T5. ────
console.log('\n[setup] navigate, then seed deprecated per-item keys');
await navigate();
await evalJs(`
    localStorage.clear();
    // Old schema keys that the new loader should sweep
    localStorage.setItem('azkar.count.morning.morning-001', '1');
    localStorage.setItem('azkar.count.morning.morning-005', '7');
    return 'seeded-legacy';
`);

// ── Reload so the new loader sees + cleans legacy ──
await navigate();
const afterLegacyClean = await evalJs(`
    const stale = Object.keys(localStorage).filter(k => k.startsWith('azkar.count.morning.'));
    return { staleLeft: stale.length, bundle: localStorage.getItem('azkar.progress.morning') };
`);
pass('T5: legacy azkar.count.* keys cleaned on first load',
    afterLegacyClean.staleLeft === 0,
    'staleLeft=' + afterLegacyClean.staleLeft);

// ── T1: complete some dhikr, reload, verify persistence ──
console.log('\n[T1] complete morning-002 (3 taps), reload, expect 3/3 restored');
await evalJs(`
    const tap = document.querySelector('#azkar-item-morning-002 .azkar-counter-tap');
    tap.click(); await new Promise(r=>setTimeout(r,80));
    tap.click(); await new Promise(r=>setTimeout(r,80));
    tap.click(); await new Promise(r=>setTimeout(r,200));
    return 'ticked-3';
`);
const beforeReload = await evalJs(`
    return JSON.parse(localStorage.getItem('azkar.progress.morning'));
`);
await navigate();
const afterReload = await evalJs(`
    return {
        bundle: JSON.parse(localStorage.getItem('azkar.progress.morning')),
        domCount: document.querySelector('#azkar-item-morning-002 .azkar-counter-tap-count')?.textContent || '',
        domCompleted: document.getElementById('azkar-item-morning-002').classList.contains('completed')
    };
`);
pass('T1: same-day reload preserves morning-002 count',
    afterReload.bundle?.items?.['morning-002']?.count === 3,
    'count=' + afterReload.bundle?.items?.['morning-002']?.count);
pass('T1: DOM shows 3 / 3 after reload',
    afterReload.domCount.trim() === '3 / 3',
    'dom=' + afterReload.domCount);
pass('T1: card has .completed class after reload',
    afterReload.domCompleted === true);

// ── T6: bundle shape matches spec exactly ──
pass('T6: bundle.date === today',
    afterReload.bundle?.date === todayLocal,
    'date=' + afterReload.bundle?.date + ' today=' + todayLocal);
pass('T6: bundle.items is an object',
    afterReload.bundle?.items && typeof afterReload.bundle.items === 'object');
pass('T6: items[morning-002] = { count: 3, completed: true }',
    afterReload.bundle?.items?.['morning-002']?.count === 3 &&
    afterReload.bundle?.items?.['morning-002']?.completed === true);

// ── T2 + T3: mutate bundle date to "yesterday", reload, expect reset ──
console.log('\n[T2+T3] poison bundle with yesterday date, reload, expect fresh bundle');
await evalJs(`
    const b = JSON.parse(localStorage.getItem('azkar.progress.morning'));
    b.date = '1970-01-01';   // any date != today is sufficient
    localStorage.setItem('azkar.progress.morning', JSON.stringify(b));
    return 'poisoned';
`);
await navigate();
const afterStale = await evalJs(`
    return {
        bundle: JSON.parse(localStorage.getItem('azkar.progress.morning')),
        domCount: document.querySelector('#azkar-item-morning-002 .azkar-counter-tap-count')?.textContent || '',
        domCompleted: document.getElementById('azkar-item-morning-002').classList.contains('completed')
    };
`);
pass('T2: stale bundle triggers daily reset (count → 0)',
    afterStale.bundle?.items?.['morning-002'] === undefined,
    'items=' + JSON.stringify(afterStale.bundle?.items));
pass('T2: DOM shows 0 / 3 after auto-reset',
    afterStale.domCount.trim() === '0 / 3',
    'dom=' + afterStale.domCount);
pass('T2: card no longer .completed after auto-reset',
    afterStale.domCompleted === false);
pass('T3: fresh bundle written with date=today',
    afterStale.bundle?.date === todayLocal,
    'date=' + afterStale.bundle?.date);
pass('T3: fresh bundle items === {}',
    afterStale.bundle?.items && Object.keys(afterStale.bundle.items).length === 0);

// ── T4: tap something then hit reset-all → items empty but date stays today ──
console.log('\n[T4] tap, click reset-all (auto-confirm), verify date stays today');
await evalJs(`
    // Tap morning-002 twice (2/3, not completed)
    const tap = document.querySelector('#azkar-item-morning-002 .azkar-counter-tap');
    tap.click(); await new Promise(r=>setTimeout(r,80));
    tap.click(); await new Promise(r=>setTimeout(r,80));
    // Auto-confirm the browser confirm() dialog by stubbing it
    window.confirm = () => true;
    document.getElementById('azkar-morning-reset-all').click();
    await new Promise(r=>setTimeout(r,300));
    return 'reset-clicked';
`);
const afterManualReset = await evalJs(`
    return {
        bundle: JSON.parse(localStorage.getItem('azkar.progress.morning')),
        progressLabel: document.getElementById('azkar-morning-progress-label')?.textContent || ''
    };
`);
pass('T4: manual reset wipes items',
    afterManualReset.bundle?.items && Object.keys(afterManualReset.bundle.items).length === 0,
    'items=' + JSON.stringify(afterManualReset.bundle?.items));
pass('T4: manual reset keeps date = today (no stale trigger on next load)',
    afterManualReset.bundle?.date === todayLocal,
    'date=' + afterManualReset.bundle?.date);
pass('T4: progress label reset to "تم إكمال 0 من 25"',
    afterManualReset.progressLabel.includes('0') && afterManualReset.progressLabel.includes('25'),
    'label=' + afterManualReset.progressLabel);

// ── T7: simulate navigation (hub → morning) within site, verify no reset ──
console.log('\n[T7] mark morning-002 done, navigate to /azkar then back, expect persistence');
await evalJs(`
    const tap = document.querySelector('#azkar-item-morning-002 .azkar-counter-tap');
    tap.click(); await new Promise(r=>setTimeout(r,80));
    tap.click(); await new Promise(r=>setTimeout(r,80));
    tap.click(); await new Promise(r=>setTimeout(r,400));
    return 'tapped-3';
`);
await send('Page.navigate', { url: URL_BASE + '/azkar' });
await wait(2200);
await send('Page.navigate', { url: URL });
await wait(2200);
const afterRoundtrip = await evalJs(`
    return {
        bundle: JSON.parse(localStorage.getItem('azkar.progress.morning')),
        domCount: document.querySelector('#azkar-item-morning-002 .azkar-counter-tap-count')?.textContent || ''
    };
`);
pass('T7: navigation between site pages preserves progress',
    afterRoundtrip.bundle?.items?.['morning-002']?.count === 3,
    'count=' + afterRoundtrip.bundle?.items?.['morning-002']?.count + ' dom=' + afterRoundtrip.domCount.trim());

// ── Teardown + summary ───────────────────────────────────────────────────
ws.close();
chrome.kill('SIGTERM');
try { rmSync(userDataDir, { recursive: true, force: true }); } catch(_) {}

const passed = results.filter(r => r.ok).length;
const total  = results.length;
console.log(`\n────────── ${passed} / ${total} passed ──────────`);
process.exit(passed === total ? 0 : 1);
