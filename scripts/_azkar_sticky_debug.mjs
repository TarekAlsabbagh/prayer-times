import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:8080/azkar/morning-azkar';
const PORT = 9226;
const dataDir = `C:\\Users\\Tarek\\AppData\\Local\\Temp\\az-debug-${Date.now()}`;

const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${dataDir}`,
    '--window-size=1280,800', 'about:blank'
], { stdio: ['ignore', 'pipe', 'pipe'] });

let ready = false;
chrome.stderr.on('data', d => { if (d.toString().includes('DevTools listening')) ready = true; });
const t0 = Date.now();
while (!ready && Date.now() - t0 < 12000) await wait(150);

const t = await new Promise((r, j) => http.get(`http://127.0.0.1:${PORT}/json`, x => {
    let b = ''; x.on('data', c => b += c); x.on('end', () => r(JSON.parse(b)));
}).on('error', j));

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
await send('Page.navigate', { url: URL });
await new Promise(r => {
    const h = e => {
        if (JSON.parse(e.data).method === 'Page.loadEventFired') {
            ws.removeEventListener('message', h); r();
        }
    };
    ws.addEventListener('message', h);
});
await wait(2200);

const r = await send('Runtime.evaluate', {
    expression: `(async () => {
        try { localStorage.clear(); } catch(_) {}
        document.querySelectorAll('[class*="cookie" i],[id*="cookie" i]').forEach(el => el.style.display = 'none');
        window.scrollTo(0, 600);
        await new Promise(r => setTimeout(r, 800));
        const sticky = document.getElementById('azkar-morning-sticky');
        if (!sticky) return { error: 'sticky not in DOM' };
        const rect = sticky.getBoundingClientRect();
        const cs = getComputedStyle(sticky);
        const w = document.getElementById('azkar-morning-progress-wrap');
        const wr = w ? w.getBoundingClientRect() : null;
        return {
            sticky_class: sticky.className,
            sticky_rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            sticky_opacity: cs.opacity,
            sticky_pointerEvents: cs.pointerEvents,
            sticky_transform: cs.transform,
            sticky_position: cs.position,
            sticky_zIndex: cs.zIndex,
            top_layer_at_50_50: (() => {
                const el = document.elementFromPoint(640, 36);
                return el ? (el.tagName + '.' + (el.className || '').toString().slice(0,80) + '#' + (el.id||'')) : 'none';
            })(),
            sticky_at_position: (() => {
                const el = document.elementFromPoint(640, 36);
                let n = el; const path = [];
                while (n && path.length < 6) { path.push(n.tagName + (n.id ? '#'+n.id : '') + (n.className ? '.' + (n.className||'').toString().split(' ').filter(c=>c).slice(0,2).join('.') : '')); n = n.parentElement; }
                return path.join(' > ');
            })(),
            header_z: (() => {
                const h = document.querySelector('header.app-header, header.site-header, .app-header, .site-top-header, header[role="banner"], .main-header, header');
                if (!h) return 'no header element';
                const c = getComputedStyle(h);
                const r = h.getBoundingClientRect();
                return { tag: h.tagName, cls: h.className, pos: c.position, z: c.zIndex, top: r.top, height: r.height };
            })(),
            sticky_label_text: (document.getElementById('azkar-morning-sticky-label')||{}).textContent,
            progress_wrap_rect: wr ? { top: wr.top, bottom: wr.bottom } : null,
            progress_wrap_in_view: wr ? (wr.bottom > 0 && wr.top < window.innerHeight) : null,
            scrollY: window.scrollY
        };
    })()`,
    awaitPromise: true, returnByValue: true
});
console.log(JSON.stringify(r.result.value, null, 2));

ws.close(); chrome.kill('SIGTERM');
try { rmSync(dataDir, { recursive: true, force: true }); } catch(_) {}
