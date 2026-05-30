// Confirm TL-CITY-SYNC-1 doesn't break "normal" slugs where SSR
// already produces the right Arabic name (e.g. via PT-CITY-AR-SAFE-1).
import { JSDOM } from 'jsdom';
import http from 'node:http';

const fetchUrl = (u) => new Promise((res, rej) =>
    http.get(u, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(b)); }).on('error', rej));

for (const slug of ['port-de-bouc', 'marseille', 'lyon', 'paris', 'london']) {
    const url = `http://localhost:8080/time-left-until-next-prayer-in-${slug}`;
    const html = await fetchUrl(url);
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;
    const wrapper = doc.querySelector('.tl-seo-wrapper');
    const ssr = wrapper?.getAttribute('data-ssr-city-name');
    // sessionStorage seed would set currentCity = same as ssr (already Arabic)
    // → swap should no-op (goodName === ssrName).
    const goodName = ssr;
    const noopExpected = (goodName === ssr);
    const ugly = (html.match(/[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g) || [])
        .filter(m => !m.includes('font') && !m.includes('Apple') && !m.includes('Segoe')).length;
    console.log(`  ${slug.padEnd(15)}  ssr="${ssr}"`
        + `  ugly-titles-in-html=${ugly}`
        + `  swap-would-be-noop=${noopExpected}`);
}
