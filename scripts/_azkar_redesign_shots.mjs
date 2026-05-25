#!/usr/bin/env node
/**
 * AZKAR-REDESIGN-1 — capture 4 reference screenshots via Chrome DevTools
 * Protocol. No external deps; just `node` + system Chrome.
 *
 * Output:
 *   .azkar-shots/01-desktop-hero-card1.png
 *   .azkar-shots/02-desktop-repeat3.png
 *   .azkar-shots/03-mobile-375.png
 *   .azkar-shots/04-completed-state.png
 */

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\.azkar-shots';
const URL_BASE = process.env.AZKAR_BASE || 'http://localhost:8080';
const DEBUG_PORT = 9222;

mkdirSync(OUT_DIR, { recursive: true });

// ── Launch headless Chrome with remote-debug enabled ────────────────────────
const userDataDir = `C:\\Users\\Tarek\\AppData\\Local\\Temp\\azkar-cdp-${Date.now()}`;
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
const chromeStartedAt = Date.now();
chrome.stderr.on('data', d => {
    const s = d.toString();
    if (s.includes('DevTools listening on')) chromeReady = true;
    if (process.env.AZKAR_DEBUG) process.stderr.write(s);
});
chrome.on('exit', code => {
    if (process.env.AZKAR_DEBUG) console.log('[chrome] exit', code);
});

// Wait up to 12s for the debugger
while (!chromeReady && Date.now() - chromeStartedAt < 12000) {
    await wait(150);
}
if (!chromeReady) {
    console.error('Chrome did not start (no DevTools port)');
    process.exit(1);
}
console.log('[chrome] ready @ port', DEBUG_PORT);

// ── Minimal CDP client over WebSocket ───────────────────────────────────────
async function getTargets() {
    return new Promise((res, rej) => {
        http.get(`http://127.0.0.1:${DEBUG_PORT}/json`, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => res(JSON.parse(body)));
            r.on('error', rej);
        }).on('error', rej);
    });
}

const targets = await getTargets();
const tab = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
if (!tab) { console.error('No tab'); process.exit(1); }
console.log('[cdp] tab', tab.webSocketDebuggerUrl);

// Inline ws client (Node 22+ ships built-in WebSocket)
const ws = new WebSocket(tab.webSocketDebuggerUrl);
const pending = new Map();
let msgId = 0;

await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message));
        else res(msg.result);
    }
});

function send(method, params = {}) {
    const id = ++msgId;
    return new Promise((res, rej) => {
        pending.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params }));
    });
}

await send('Page.enable');
await send('Runtime.enable');

async function navigate(url) {
    await send('Page.navigate', { url });
    // Wait for load
    await new Promise(resolve => {
        const handler = ev => {
            const m = JSON.parse(ev.data);
            if (m.method === 'Page.loadEventFired') {
                ws.removeEventListener('message', handler);
                resolve();
            }
        };
        ws.addEventListener('message', handler);
    });
    // give app a chance to hydrate
    await wait(2500);
}

async function evalJs(expression, returnByValue = true) {
    const r = await send('Runtime.evaluate', {
        expression: `(async () => { ${expression} })()`,
        awaitPromise: true,
        returnByValue
    });
    if (r.exceptionDetails) {
        console.error('JS error:', r.exceptionDetails.text);
        return null;
    }
    return r.result.value;
}

async function setViewport(w, h, deviceScaleFactor = 1, mobile = false) {
    await send('Emulation.setDeviceMetricsOverride', {
        width: w, height: h, deviceScaleFactor, mobile
    });
}

async function shot(file) {
    const { data } = await send('Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: false
    });
    writeFileSync(file, Buffer.from(data, 'base64'));
    console.log('  saved →', file);
}

// ── Screenshot 1: desktop hero + first card ─────────────────────────────────
console.log('\n[1/4] Desktop hero + first card (1280×900)');
await setViewport(1280, 900);
await navigate(URL_BASE + '/azkar/morning-azkar');
await evalJs(`
    // Clear any persisted progress so we render the "0 / N" pristine state
    try { Object.keys(localStorage).filter(k => k.indexOf('azkar.count.morning.') === 0).forEach(k => localStorage.removeItem(k)); } catch(_) {}
    // Hide siblings beyond the first card so the hero + 1 card fit a single viewport
    const cards = document.querySelectorAll('#azkar-morning-list .azkar-card-item');
    cards.forEach((c, i) => { if (i > 0) c.style.display = 'none'; });
    const banner = document.getElementById('azkar-morning-completed');
    if (banner) banner.style.display = 'none';
    // Hide cookie consent dialog that overlays the bottom of the viewport
    document.querySelectorAll('[class*="cookie" i],[id*="cookie" i],[class*="consent" i],[id*="consent" i]').forEach(el => el.style.display = 'none');
    window.scrollTo(0, 0);
    return 'ok';
`);
await wait(700);
await shot(OUT_DIR + '\\\\01-desktop-hero-card1.png');

// ── Screenshot 2: desktop card with repeat=3 (سورة الإخلاص = morning-002) ─
console.log('\n[2/4] Desktop card with repeat=3 (1280×900)');
await setViewport(1280, 900);
await navigate(URL_BASE + '/azkar/morning-azkar');
await evalJs(`
    try { Object.keys(localStorage).filter(k => k.indexOf('azkar.count.morning.') === 0).forEach(k => localStorage.removeItem(k)); } catch(_) {}
    // Show only morning-002 (Surah Al-Ikhlas — repeat=3)
    const all = document.querySelectorAll('#azkar-morning-list .azkar-card-item');
    all.forEach(c => { c.style.display = (c.id === 'azkar-item-morning-002') ? '' : 'none'; });
    const banner = document.getElementById('azkar-morning-completed');
    if (banner) banner.style.display = 'none';
    // Scroll the kept card into view at the top
    // Hide cookie consent dialog that overlays the bottom of the viewport
    document.querySelectorAll('[class*="cookie" i],[id*="cookie" i],[class*="consent" i],[id*="consent" i]').forEach(el => el.style.display = 'none');
    document.getElementById('azkar-item-morning-002').scrollIntoView({ block: 'start' });
    window.scrollTo(0, Math.max(0, window.scrollY - 280));
    return 'ok';
`);
await wait(700);
await shot(OUT_DIR + '\\\\02-desktop-repeat3.png');

// ── Screenshot 3: mobile 375×900, same content (hero + first card) ─────────
console.log('\n[3/4] Mobile 375×900');
await setViewport(375, 900, 2, true);
await navigate(URL_BASE + '/azkar/morning-azkar');
await evalJs(`
    try { Object.keys(localStorage).filter(k => k.indexOf('azkar.count.morning.') === 0).forEach(k => localStorage.removeItem(k)); } catch(_) {}
    const cards = document.querySelectorAll('#azkar-morning-list .azkar-card-item');
    cards.forEach((c, i) => { if (i > 0) c.style.display = 'none'; });
    const banner = document.getElementById('azkar-morning-completed');
    if (banner) banner.style.display = 'none';
    // Hide cookie consent dialog that overlays the bottom of the viewport
    document.querySelectorAll('[class*="cookie" i],[id*="cookie" i],[class*="consent" i],[id*="consent" i]').forEach(el => el.style.display = 'none');
    window.scrollTo(0, 0);
    return 'ok';
`);
await wait(800);
await shot(OUT_DIR + '\\\\03-mobile-375.png');

// ── Screenshot 4: completed state for a single card (taller for caption + footer) ──
console.log('\n[4/4] Completed state for morning-002 (repeat=3) (1280×1100)');
await setViewport(1280, 1100);
await navigate(URL_BASE + '/azkar/morning-azkar');
await evalJs(`
    // Pre-seed localStorage so morning-002 is fully completed (3/3)
    try { localStorage.setItem('azkar.count.morning.morning-002', '3'); } catch(_) {}
    return 'ok';
`);
// Reload so the renderer picks up the seeded state at build time
await navigate(URL_BASE + '/azkar/morning-azkar');
await evalJs(`
    const all = document.querySelectorAll('#azkar-morning-list .azkar-card-item');
    all.forEach(c => { c.style.display = (c.id === 'azkar-item-morning-002') ? '' : 'none'; });
    const banner = document.getElementById('azkar-morning-completed');
    if (banner) banner.style.display = 'none';
    // Hide cookie consent dialog that overlays the bottom of the viewport
    document.querySelectorAll('[class*="cookie" i],[id*="cookie" i],[class*="consent" i],[id*="consent" i]').forEach(el => el.style.display = 'none');
    document.getElementById('azkar-item-morning-002').scrollIntoView({ block: 'start' });
    window.scrollTo(0, Math.max(0, window.scrollY - 60));
    return 'ok';
`);
await wait(700);
await shot(OUT_DIR + '\\\\04-completed-state.png');

// ── Teardown ────────────────────────────────────────────────────────────────
ws.close();
chrome.kill('SIGTERM');
try { rmSync(userDataDir, { recursive: true, force: true }); } catch(_) {}
console.log('\nDone.');
