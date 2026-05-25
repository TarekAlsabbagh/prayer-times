#!/usr/bin/env node
/**
 * AZKAR-RESET-BTN-1 — capture 4 demo screenshots of the amber reset button.
 *
 *   08-reset-btn-desktop.png   Hero with the new amber pill in the row.
 *   09-reset-modal-open.png    Confirmation modal visible on top of the page.
 *   10-reset-toast.png         Toast feedback after successful reset.
 *   11-reset-btn-mobile.png    Mobile 375 — button stacks below progress bar.
 */

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\.azkar-shots';
const URL_BASE = process.env.AZKAR_BASE || 'http://localhost:8080';
const URL = URL_BASE + '/azkar/morning-azkar';
const DEBUG_PORT = 9224;

mkdirSync(OUT_DIR, { recursive: true });

const userDataDir = `C:\\Users\\Tarek\\AppData\\Local\\Temp\\azkar-resetbtn-${Date.now()}`;
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

// ── 1. Desktop: button at rest in the hero row ────────────────────────────
console.log('\n[1/4] Desktop button at rest');
await setViewport(1280, 800);
await navigate();
await evalJs(PREP + `
    // Hide cards below the hero to keep the screenshot focused on the reset btn
    document.querySelectorAll('#azkar-morning-list .azkar-card-item').forEach((c,i) => { if (i>0) c.style.display = 'none'; });
    window.scrollTo(0, 0);
`);
await wait(500);
await shot('08-reset-btn-desktop.png');

// ── 2. Modal open ────────────────────────────────────────────────────────
console.log('\n[2/4] Confirmation modal');
await setViewport(1280, 800);
await navigate();
await evalJs(PREP + `
    document.querySelectorAll('#azkar-morning-list .azkar-card-item').forEach((c,i) => { if (i>0) c.style.display = 'none'; });
    document.getElementById('azkar-morning-reset-all').click();
    await new Promise(r=>setTimeout(r,350));
`);
await shot('09-reset-modal-open.png');

// ── 3. Toast after confirm ────────────────────────────────────────────────
console.log('\n[3/4] Toast feedback');
await setViewport(1280, 800);
await navigate();
await evalJs(PREP + `
    document.querySelectorAll('#azkar-morning-list .azkar-card-item').forEach((c,i) => { if (i>0) c.style.display = 'none'; });
    // Tap morning-002 a couple times so there's something to reset
    const tap = document.querySelector('#azkar-item-morning-002 .azkar-counter-tap');
    if (tap) { tap.click(); await new Promise(r=>setTimeout(r,80)); tap.click(); }
    await new Promise(r=>setTimeout(r,200));
    // Open the modal then click the confirm button programmatically
    document.getElementById('azkar-morning-reset-all').click();
    await new Promise(r=>setTimeout(r,300));
    document.querySelector('.azkar-modal-btn-confirm').click();
    // Wait for toast to be fully visible (CSS transition .25s + small buffer)
    await new Promise(r=>setTimeout(r,500));
`);
await shot('10-reset-toast.png');

// ── 4. Mobile 375 — button stacks full-width below progress bar ──────────
console.log('\n[4/4] Mobile 375 button');
await setViewport(375, 800, 2, true);
await navigate();
await evalJs(PREP + `
    document.querySelectorAll('#azkar-morning-list .azkar-card-item').forEach((c,i) => { if (i>0) c.style.display = 'none'; });
    window.scrollTo(0, 0);
`);
await wait(500);
await shot('11-reset-btn-mobile.png');

ws.close();
chrome.kill('SIGTERM');
try { rmSync(userDataDir, { recursive: true, force: true }); } catch(_) {}
console.log('\nDone.');
