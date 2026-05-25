#!/usr/bin/env node
/**
 * AZKAR-STICKY-PROGRESS-CENTER-FIX-1 — capture 3 frames proving the
 * sticky bar centers within the *content area* (not the viewport)
 * regardless of sidebar state.
 *
 *   19-sticky-center-sidebar-open.png    desktop, sidebar visible,
 *                                        bar centered within left content
 *   20-sticky-center-sidebar-closed.png  desktop, sidebar forced hidden,
 *                                        bar re-centers across the full width
 *   21-sticky-center-mobile.png          mobile 375, bar takes content width
 */

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\.azkar-shots';
const URL = (process.env.AZKAR_BASE || 'http://localhost:8080') + '/azkar/morning-azkar';
const DEBUG_PORT = 9228;

mkdirSync(OUT_DIR, { recursive: true });

const userDataDir = `C:\\Users\\Tarek\\AppData\\Local\\Temp\\azkar-cfix-${Date.now()}`;
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
await new Promise(r => ws.addEventListener('open', r));

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
    document.querySelectorAll('[class*="cookie" i],[id*="cookie" i]').forEach(el => el.style.display = 'none');
`;

// ── 1. Desktop, sidebar OPEN (default) ──────────────────────────────────
console.log('\n[1/3] Desktop sidebar OPEN — bar centers within LEFT content area');
await setViewport(1280, 800);
await navigate();
const r1 = await evalJs(PREP + `
    window.scrollTo(0, 700);
    await new Promise(r => setTimeout(r, 600));
    // Measure to verify
    const sticky = document.getElementById('azkar-morning-sticky');
    const list   = document.querySelector('.azkar-list');
    const sb     = document.getElementById('sidebar');
    const mc     = document.querySelector('.main-content');
    const sr = sticky ? sticky.getBoundingClientRect() : null;
    const lr = list ? list.getBoundingClientRect() : null;
    const sbr = sb ? sb.getBoundingClientRect() : null;
    const mcr = mc ? mc.getBoundingClientRect() : null;
    return {
        viewport_w: window.innerWidth,
        sidebar_visible: sb ? getComputedStyle(sb).display !== 'none' : 'no sidebar',
        sidebar_rect: sbr ? { left: sbr.left, right: sbr.right, width: sbr.width } : null,
        main_content_rect: mcr ? { left: mcr.left, right: mcr.right, width: mcr.width } : null,
        sticky_rect: sr ? { left: sr.left, right: sr.right, width: sr.width } : null,
        list_rect: lr ? { left: lr.left, right: lr.right, width: lr.width } : null,
        sticky_center: sr ? (sr.left + sr.right)/2 : null,
        list_center: lr ? (lr.left + lr.right)/2 : null
    };
`);
console.log('  measurements:', JSON.stringify(r1, null, 2));
await shot('19-sticky-center-sidebar-open.png');

// ── 2. Desktop, sidebar forced HIDDEN — bar re-centers ──────────────────
console.log('\n[2/3] Desktop sidebar HIDDEN — bar re-centers across full width');
await setViewport(1280, 800);
await navigate();
const r2 = await evalJs(PREP + `
    // Simulate "sidebar closed" desktop by zeroing the sidebar AND
    // removing the main-content's right margin that holds space for it.
    const sb = document.getElementById('sidebar');
    if (sb) sb.style.display = 'none';
    const mc = document.querySelector('.main-content');
    if (mc) mc.style.marginRight = '0';
    await new Promise(r => setTimeout(r, 50));
    window.scrollTo(0, 700);
    await new Promise(r => setTimeout(r, 600));
    const sticky = document.getElementById('azkar-morning-sticky');
    const list   = document.querySelector('.azkar-list');
    const mc2    = document.querySelector('.main-content');
    const sr = sticky ? sticky.getBoundingClientRect() : null;
    const lr = list ? list.getBoundingClientRect() : null;
    const mcr = mc2 ? mc2.getBoundingClientRect() : null;
    return {
        viewport_w: window.innerWidth,
        main_content_rect: mcr ? { left: mcr.left, right: mcr.right, width: mcr.width } : null,
        sticky_rect: sr ? { left: sr.left, right: sr.right, width: sr.width } : null,
        list_rect: lr ? { left: lr.left, right: lr.right, width: lr.width } : null,
        sticky_center: sr ? (sr.left + sr.right)/2 : null,
        list_center: lr ? (lr.left + lr.right)/2 : null
    };
`);
console.log('  measurements:', JSON.stringify(r2, null, 2));
await shot('20-sticky-center-sidebar-closed.png');

// ── 3. Mobile 375 ──────────────────────────────────────────────────────
console.log('\n[3/3] Mobile 375 — bar takes content width');
await setViewport(375, 800, 2, true);
await navigate();
const r3 = await evalJs(PREP + `
    window.scrollTo(0, 1200);
    await new Promise(r => setTimeout(r, 600));
    const sticky = document.getElementById('azkar-morning-sticky');
    const list   = document.querySelector('.azkar-list');
    const sr = sticky ? sticky.getBoundingClientRect() : null;
    const lr = list ? list.getBoundingClientRect() : null;
    return {
        viewport_w: window.innerWidth,
        sticky_rect: sr ? { left: sr.left, right: sr.right, width: sr.width } : null,
        list_rect: lr ? { left: lr.left, right: lr.right, width: lr.width } : null
    };
`);
console.log('  measurements:', JSON.stringify(r3, null, 2));
await shot('21-sticky-center-mobile.png');

ws.close();
chrome.kill('SIGTERM');
try { rmSync(userDataDir, { recursive: true, force: true }); } catch(_) {}
console.log('\nDone.');
