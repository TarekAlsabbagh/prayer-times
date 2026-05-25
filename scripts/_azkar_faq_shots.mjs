#!/usr/bin/env node
/**
 * AZKAR-MORNING-FAQ-1 — capture 3 demo frames.
 *
 *   16-faq-desktop-closed.png   Desktop, scrolled to FAQ, all items closed.
 *   17-faq-desktop-opened.png   Desktop, scrolled to FAQ, two items opened.
 *   18-faq-mobile.png           Mobile 375, scrolled to FAQ.
 */

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\.azkar-shots';
const URL_BASE = process.env.AZKAR_BASE || 'http://localhost:8080';
const URL = URL_BASE + '/azkar/morning-azkar';
const DEBUG_PORT = 9227;

mkdirSync(OUT_DIR, { recursive: true });

const userDataDir = `C:\\Users\\Tarek\\AppData\\Local\\Temp\\azkar-faq-${Date.now()}`;
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

// ── 1. Desktop, FAQ closed ───────────────────────────────────────────────
console.log('\n[1/3] Desktop FAQ closed (all 8 items collapsed)');
await setViewport(1280, 900);
await navigate();
await evalJs(PREP + `
    // Pre-complete all 25 azkar so the completion banner is visible right
    // before the FAQ — proves: completed banner sits ABOVE the FAQ section
    try {
        const seed = { date: new Date().toISOString().slice(0,10), items: {} };
        (window.AzkarMorning || []).forEach(d => {
            seed.items[d.id] = { count: d.repeat || 1, completed: true };
        });
        localStorage.setItem('azkar.progress.morning', JSON.stringify(seed));
    } catch(_) {}
    // Reload so the renderer restores from the seeded state
`);
await navigate();
await evalJs(PREP.replace('localStorage.clear();', '') + `
    document.querySelector('.azkar-faq').scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 400));
    window.scrollBy(0, -130);  // expose the completed banner above the FAQ
    await new Promise(r => setTimeout(r, 200));
`);
await shot('16-faq-desktop-closed.png');

// ── 2. Desktop, two FAQ items opened ─────────────────────────────────────
console.log('\n[2/3] Desktop FAQ opened (items 1 and 4)');
await setViewport(1280, 900);
await navigate();
await evalJs(PREP + `
    const items = document.querySelectorAll('.azkar-faq-item');
    items.forEach((it, i) => { if (i === 0 || i === 3) it.setAttribute('open',''); });
    document.querySelector('.azkar-faq').scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 400));
    window.scrollBy(0, -100);
    await new Promise(r => setTimeout(r, 200));
`);
await shot('17-faq-desktop-opened.png');

// ── 3. Mobile 375 ───────────────────────────────────────────────────────
console.log('\n[3/3] Mobile FAQ (one item opened)');
await setViewport(375, 900, 2, true);
await navigate();
await evalJs(PREP + `
    const items = document.querySelectorAll('.azkar-faq-item');
    if (items[1]) items[1].setAttribute('open','');
    document.querySelector('.azkar-faq').scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 400));
    window.scrollBy(0, -60);
    await new Promise(r => setTimeout(r, 200));
`);
await shot('18-faq-mobile.png');

ws.close();
chrome.kill('SIGTERM');
try { rmSync(userDataDir, { recursive: true, force: true }); } catch(_) {}
console.log('\nDone.');
