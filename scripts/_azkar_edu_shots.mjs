#!/usr/bin/env node
/**
 * AZKAR-MORNING-EDU-1 — capture proof of the new educational section
 * sitting between the completion banner and the FAQ.
 */
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\.azkar-shots';
const URL = (process.env.AZKAR_BASE || 'http://localhost:8080') + '/azkar/morning-azkar';
const PORT = 9232;

mkdirSync(OUT, { recursive: true });
const dataDir = `C:\\Users\\Tarek\\AppData\\Local\\Temp\\az-edu-${Date.now()}`;
const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${dataDir}`,
    '--window-size=1280,800', 'about:blank'
], { stdio: ['ignore', 'pipe', 'pipe'] });

let ready = false;
chrome.stderr.on('data', d => { if (d.toString().includes('DevTools listening')) ready = true; });
const t0 = Date.now(); while (!ready && Date.now() - t0 < 12000) await wait(150);

const t = await new Promise((res, rej) => http.get(`http://127.0.0.1:${PORT}/json`, r => {
    let b = ''; r.on('data', c => b += c); r.on('end', () => res(JSON.parse(b)));
}).on('error', rej));
const ws = new WebSocket(t.find(x => x.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));

const pending = new Map(); let id = 0;
ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id); pending.delete(m.id);
        m.error ? rej(new Error(m.error.message)) : res(m.result);
    }
});
const send = (mm, aa = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method: mm, params: aa }));
});
await send('Page.enable'); await send('Runtime.enable');

async function navigate() {
    await send('Page.navigate', { url: URL });
    await new Promise(r => {
        const h = e => {
            if (JSON.parse(e.data).method === 'Page.loadEventFired') {
                ws.removeEventListener('message', h); r();
            }
        };
        ws.addEventListener('message', h);
    });
    await wait(2500);
}
async function evalJs(expr) {
    const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) console.error('JS error:', r.exceptionDetails.text);
    return r.result.value;
}
async function setViewport(w, h, sf = 1, m = false) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: sf, mobile: m });
}
async function shot(name) {
    const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    writeFileSync(`${OUT}\\${name}`, Buffer.from(data, 'base64'));
    console.log('  →', name);
}

const PREP = `
    try { localStorage.clear(); } catch(_) {}
    document.querySelectorAll('[class*="cookie" i],[id*="cookie" i]').forEach(el => el.style.display = 'none');
`;

// Frame 1 — Desktop: last dhikr card + edu cards + FAQ peek
console.log('\n[1/3] Desktop: last-card → edu cards (3) → FAQ peek');
await setViewport(1280, 1000);
await navigate();
const r1 = await evalJs(PREP + `
    const last = document.getElementById('azkar-item-morning-025');
    last.scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 400));
    window.scrollBy(0, -60);
    await new Promise(r => setTimeout(r, 200));
    // Audit the page section order
    const sections = document.querySelectorAll('#page-azkar-morning > *');
    const order = Array.from(sections).map(s => {
        const id = s.id ? '#' + s.id : '';
        const cls = s.className ? '.' + (s.className||'').toString().split(' ').slice(0,2).join('.') : '';
        return s.tagName + id + cls;
    });
    return { section_order: order };
`);
console.log('  section order:', JSON.stringify(r1.section_order, null, 2));
await shot('29-edu-desktop-top.png');

// Frame 2 — Desktop: edu section in full + link cards
console.log('\n[2/3] Desktop: edu section + links');
await setViewport(1280, 1000);
await navigate();
await evalJs(PREP + `
    const edu = document.querySelector('#page-azkar-morning .azkar-edu-section');
    edu.scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 400));
    window.scrollBy(0, -60);
    await new Promise(r => setTimeout(r, 200));
`);
await shot('30-edu-desktop-full.png');

// Frame 3 — Mobile
console.log('\n[3/3] Mobile: edu cards stacked');
await setViewport(375, 900, 2, true);
await navigate();
await evalJs(PREP + `
    const edu = document.querySelector('#page-azkar-morning .azkar-edu-section');
    edu.scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 400));
    window.scrollBy(0, -40);
    await new Promise(r => setTimeout(r, 200));
`);
await shot('31-edu-mobile.png');

ws.close(); chrome.kill('SIGTERM');
try { rmSync(dataDir, { recursive: true, force: true }); } catch(_) {}
console.log('\nDone.');
