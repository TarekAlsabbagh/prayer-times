#!/usr/bin/env node
/**
 * AZKAR-EVENTS-SPACING-FIX-1 — measure and prove the three vertical
 * gaps at the bottom of /azkar/morning-azkar are uniform:
 *
 *   last-dhikr-card → .azkar-faq
 *   .azkar-faq      → .moon-events-section
 *
 * After the fix both should be 32px (desktop) / 24px (mobile).
 */
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\.azkar-shots';
const URL = (process.env.AZKAR_BASE || 'http://localhost:8080') + '/azkar/morning-azkar';
const PORT = 9231;

mkdirSync(OUT, { recursive: true });
const dataDir = `C:\\Users\\Tarek\\AppData\\Local\\Temp\\az-sp-${Date.now()}`;
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

// Desktop: measure
console.log('\n[1/2] Desktop — measure gaps');
await setViewport(1280, 900);
await navigate();
const desktop = await evalJs(PREP + `
    const last = document.getElementById('azkar-item-morning-025');
    const faq  = document.querySelector('#page-azkar-morning .azkar-faq');
    const ev   = document.querySelector('#page-azkar-morning .moon-events-section');
    if (!last || !faq || !ev) return { error: 'element missing' };
    last.scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 400));
    window.scrollBy(0, -100);
    await new Promise(r => setTimeout(r, 200));
    const lastR = last.getBoundingClientRect();
    const faqR  = faq.getBoundingClientRect();
    const evR   = ev.getBoundingClientRect();
    return {
        gap_lastcard_to_faq:    Math.round(faqR.top - lastR.bottom),
        gap_faq_to_events:      Math.round(evR.top - faqR.bottom),
        last_bottom: Math.round(lastR.bottom),
        faq_top: Math.round(faqR.top),
        faq_bottom: Math.round(faqR.bottom),
        events_top: Math.round(evR.top)
    };
`);
console.log('  desktop:', JSON.stringify(desktop, null, 2));
await shot('27-spacing-desktop.png');

// Mobile: measure
console.log('\n[2/2] Mobile — measure gaps');
await setViewport(375, 800, 2, true);
await navigate();
const mobile = await evalJs(PREP + `
    const last = document.getElementById('azkar-item-morning-025');
    const faq  = document.querySelector('#page-azkar-morning .azkar-faq');
    const ev   = document.querySelector('#page-azkar-morning .moon-events-section');
    last.scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 400));
    window.scrollBy(0, -80);
    await new Promise(r => setTimeout(r, 200));
    const lastR = last.getBoundingClientRect();
    const faqR  = faq.getBoundingClientRect();
    const evR   = ev.getBoundingClientRect();
    return {
        gap_lastcard_to_faq:    Math.round(faqR.top - lastR.bottom),
        gap_faq_to_events:      Math.round(evR.top - faqR.bottom)
    };
`);
console.log('  mobile:', JSON.stringify(mobile, null, 2));
await shot('28-spacing-mobile.png');

ws.close(); chrome.kill('SIGTERM');
try { rmSync(dataDir, { recursive: true, force: true }); } catch(_) {}
console.log('\nDone.');
