#!/usr/bin/env node
/**
 * AZKAR-STICKY-PROGRESS-1 — capture 4 demo frames.
 *
 *   12-sticky-top-no-sticky.png      desktop, scrollY=0, sticky hidden
 *   13-sticky-scrolled-visible.png   desktop, scrolled past hero, sticky visible
 *   14-sticky-mobile-visible.png     mobile 375, scrolled, compact sticky visible
 *   15-sticky-sync-progress.png      desktop, scrolled + morning-002 done at 3/3,
 *                                    sticky label reads "تم إكمال 1 من 25" with
 *                                    a thin green fill (sync proof).
 */

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\.azkar-shots';
const URL_BASE = process.env.AZKAR_BASE || 'http://localhost:8080';
const URL = URL_BASE + '/azkar/morning-azkar';
const DEBUG_PORT = 9225;

mkdirSync(OUT_DIR, { recursive: true });

const userDataDir = `C:\\Users\\Tarek\\AppData\\Local\\Temp\\azkar-sticky-${Date.now()}`;
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
const ws = new WebSocket(targets.find(t => t.type==='page').webSocketDebuggerUrl);
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
    if (r.exceptionDetails) console.error('JS error:', r.exceptionDetails.text);
    return r.result.value;
}
async function setViewport(w, h, sf=1, m=false) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: sf, mobile: m });
}
async function shot(name) {
    const { data } = await send('Page.captureScreenshot', { format:'png', captureBeyondViewport:false });
    writeFileSync(`${OUT_DIR}\\${name}`, Buffer.from(data,'base64'));
    console.log('  →', name);
}

const PREP = `
    try { localStorage.clear(); } catch(_) {}
    document.querySelectorAll('[class*="cookie" i],[id*="cookie" i],[class*="consent" i],[id*="consent" i]').forEach(el => el.style.display = 'none');
`;

// ── 1. Desktop, scrollY=0 — sticky should be HIDDEN ──────────────────────
console.log('\n[1/4] Desktop top of page — sticky hidden');
await setViewport(1280, 800);
await navigate();
await evalJs(PREP + `
    window.scrollTo(0, 0);
    await new Promise(r=>setTimeout(r,400));
`);
await shot('12-sticky-top-no-sticky.png');

// ── 2. Desktop, scrolled past hero — sticky should be VISIBLE ────────────
console.log('\n[2/4] Desktop scrolled — sticky visible');
await setViewport(1280, 800);
await navigate();
await evalJs(PREP + `
    // Scroll well past the hero so #azkar-morning-progress-wrap exits the viewport
    window.scrollTo(0, 600);
    await new Promise(r=>setTimeout(r,500));
`);
await shot('13-sticky-scrolled-visible.png');

// ── 3. Mobile 375 scrolled — compact sticky bar ──────────────────────────
console.log('\n[3/4] Mobile scrolled — sticky visible');
await setViewport(375, 800, 2, true);
await navigate();
await evalJs(PREP + `
    // Scroll well past the (tall, mobile-stacked) hero so the inline
    // #azkar-morning-progress-wrap exits the viewport
    window.scrollTo(0, 1200);
    await new Promise(r=>setTimeout(r,700));
`);
await shot('14-sticky-mobile-visible.png');

// ── 4. Desktop scrolled with completion progress — sync proof ────────────
console.log('\n[4/4] Sticky sync — morning-002 done (3/3), scrolled, sticky shows 1/25');
await setViewport(1280, 800);
await navigate();
await evalJs(PREP + `
    // Pre-complete morning-002 by tapping 3 times before scrolling
    const tap = document.querySelector('#azkar-item-morning-002 .azkar-counter-tap');
    if (tap) {
        tap.click(); await new Promise(r=>setTimeout(r,80));
        tap.click(); await new Promise(r=>setTimeout(r,80));
        tap.click(); await new Promise(r=>setTimeout(r,400));
    }
    window.scrollTo(0, 1100);
    await new Promise(r=>setTimeout(r,500));
`);
await shot('15-sticky-sync-progress.png');

ws.close();
chrome.kill('SIGTERM');
try { rmSync(userDataDir, { recursive: true, force: true }); } catch(_) {}
console.log('\nDone.');
