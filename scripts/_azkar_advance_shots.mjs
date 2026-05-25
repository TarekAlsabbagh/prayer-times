#!/usr/bin/env node
/**
 * AZKAR-AUTO-ADVANCE-1 — capture 3 demo screenshots that prove the
 * smooth auto-advance flow on /azkar/morning-azkar.
 *
 * 1. repeat=1 case   — click "تمت القراءة" on morning-005 → scrolls to
 *                       morning-006 (highlighted).
 * 2. repeat>1 case   — tap morning-002 (repeat=3) three times → on the
 *                       third tap (3/3) scrolls to morning-003 (highlighted).
 * 3. last-item case  — pre-seed all 25 then complete morning-025 →
 *                       scrolls to the completion banner.
 */

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\.azkar-shots';
const URL_BASE = process.env.AZKAR_BASE || 'http://localhost:8080';
const DEBUG_PORT = 9222;

mkdirSync(OUT_DIR, { recursive: true });

const userDataDir = `C:\\Users\\Tarek\\AppData\\Local\\Temp\\azkar-advance-${Date.now()}`;
const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-sandbox',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1280,800',
    'about:blank'
], { stdio: ['ignore', 'pipe', 'pipe'] });

let chromeReady = false;
const t0 = Date.now();
chrome.stderr.on('data', d => {
    if (d.toString().includes('DevTools listening on')) chromeReady = true;
});
while (!chromeReady && Date.now() - t0 < 12000) await wait(150);
if (!chromeReady) { console.error('chrome stuck'); process.exit(1); }
console.log('[chrome] ready');

const targets = await new Promise((res, rej) => http.get(
    `http://127.0.0.1:${DEBUG_PORT}/json`, r => {
        let b=''; r.on('data',c=>b+=c); r.on('end',()=>res(JSON.parse(b)));
    }).on('error',rej));
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

await send('Page.enable');
await send('Runtime.enable');

async function navigate(url) {
    await send('Page.navigate', { url });
    await new Promise(resolve => {
        const h = ev => {
            const m = JSON.parse(ev.data);
            if (m.method === 'Page.loadEventFired') { ws.removeEventListener('message', h); resolve(); }
        };
        ws.addEventListener('message', h);
    });
    await wait(2200); // hydration
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

// ─── Helper to dismiss cookie banner + clear localStorage ─────────────────
const PREP = `
    try { Object.keys(localStorage).filter(k => k.indexOf('azkar.count.morning.') === 0).forEach(k => localStorage.removeItem(k)); } catch(_) {}
    document.querySelectorAll('[class*="cookie" i],[id*="cookie" i],[class*="consent" i],[id*="consent" i]').forEach(el => el.style.display = 'none');
    const banner = document.getElementById('azkar-morning-completed');
    if (banner) banner.classList.add('u-hidden');
`;

// ═══════════════════════════════════════════════════════════════════════════
// FRAME 1: repeat=1 — click تمت القراءة on morning-005, auto-scroll to 006
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n[1/3] repeat=1 advance (morning-005 → morning-006)');
await setViewport(1280, 900);
await navigate(URL_BASE + '/azkar/morning-azkar');
await evalJs(PREP + `
    // Scroll so morning-005 (repeat=1) is at the top of the viewport before we click
    const card = document.getElementById('azkar-item-morning-005');
    card.scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 200));
    return 'ready';
`);
await evalJs(`
    // Click the mark-read button — triggers auto-advance to morning-006
    const card = document.getElementById('azkar-item-morning-005');
    const btn  = card.querySelector('.azkar-mark-read');
    btn.click();
    // Wait for smooth-scroll + highlight to settle (240ms delay + ~600ms scroll)
    await new Promise(r => setTimeout(r, 1100));
    return 'clicked';
`);
await shot('05-advance-repeat1.png');

// ═══════════════════════════════════════════════════════════════════════════
// FRAME 2: repeat>1 — tap morning-002 (repeat=3) three times → arrive at 003
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n[2/3] repeat>1 advance (morning-002 reaches 3/3 → morning-003)');
await setViewport(1280, 900);
await navigate(URL_BASE + '/azkar/morning-azkar');
await evalJs(PREP + `
    const card = document.getElementById('azkar-item-morning-002');
    card.scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 200));
    return 'ready';
`);
await evalJs(`
    const card = document.getElementById('azkar-item-morning-002');
    const tap  = card.querySelector('.azkar-counter-tap');
    // Three rapid taps: 1/3 → 2/3 → 3/3 (final tap triggers auto-advance)
    tap.click();
    await new Promise(r => setTimeout(r, 120));
    tap.click();
    await new Promise(r => setTimeout(r, 120));
    tap.click();   // ← 3/3, completion, scroll
    await new Promise(r => setTimeout(r, 1100));
    return 'clicked-x3';
`);
await shot('06-advance-repeat3.png');

// ═══════════════════════════════════════════════════════════════════════════
// FRAME 3: LAST item — pre-seed 24 done; tap final morning-025 → banner
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n[3/3] LAST item completion (morning-025 → completion banner)');
await setViewport(1280, 1000);
await navigate(URL_BASE + '/azkar/morning-azkar');
await evalJs(`
    // Pre-seed first 24 azkar to "complete" so banner triggers cleanly on 25
    try {
        const seed = (window.AzkarMorning || []).slice(0, 24);
        seed.forEach(d => localStorage.setItem('azkar.count.morning.' + d.id, String(d.repeat || 1)));
    } catch(_) {}
    return 'seeded';
`);
// Reload so the renderer restores all 24 as completed (no auto-scroll on load)
await navigate(URL_BASE + '/azkar/morning-azkar');
await evalJs(`
    document.querySelectorAll('[class*="cookie" i],[id*="cookie" i],[class*="consent" i],[id*="consent" i]').forEach(el => el.style.display = 'none');
    // Scroll to the last item (morning-025) before completing it
    const card = document.getElementById('azkar-item-morning-025');
    card.scrollIntoView({ block: 'start' });
    await new Promise(r => setTimeout(r, 200));
    return 'ready';
`);
await evalJs(`
    // morning-025 has repeat=10 — tap 10 times so the FINAL tap triggers
    // the banner reveal + auto-scroll (no intermediate triggers, per spec).
    const card = document.getElementById('azkar-item-morning-025');
    const tap  = card.querySelector('.azkar-counter-tap');
    for (let i = 0; i < 10; i++) {
        tap.click();
        await new Promise(r => setTimeout(r, 70));
    }
    // Wait for advance-to-banner + smooth scroll
    await new Promise(r => setTimeout(r, 1400));
    return 'done';
`);
await shot('07-advance-last-banner.png');

// ── Teardown ────────────────────────────────────────────────────────────────
ws.close();
chrome.kill('SIGTERM');
try { rmSync(userDataDir, { recursive: true, force: true }); } catch(_) {}
console.log('\nDone.');
