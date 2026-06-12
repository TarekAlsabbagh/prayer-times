#!/usr/bin/env node
/* Unit test for server/search-merge.js (DISCOVERED-CITY-SEARCH-HOMONYM-MERGE-FIX-1).
 * Pure-function test — no server, no Supabase, no network. */
import sm from '../server/search-merge.js';   // CJS default import
const { mergeCuratedDiscovered, cleanDiscoveredSlug } = sm;

let pass = 0, fail = 0;
const eq = (got, want, msg) => { if (got === want) pass++; else { fail++; console.error(`FAIL ${msg}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); } };

// curated global slug index (mock): chefchaouen/MA + uray-irah/SA already curated
const IDX = { chefchaouen: { slug: 'chefchaouen', countryCode: 'ma' }, 'uray-irah': { slug: 'uray-irah', countryCode: 'sa' } };
const findBySlug = s => IDX[s] || null;
const OPTS = { cap: 10, findCuratedBySlug: findBySlug };
const r = (slug, cc, name, lat, lng) => ({ slug, countryCode: cc, displayName: name, secondaryName: slug, lat, lng });

// 1) HOMONYM kept — kenitra/MA curated + al-quneitra/SY discovered (same name, different country)
let out = mergeCuratedDiscovered([r('kenitra', 'ma', 'القنيطرة', 34.26, -6.58)], [r('al-quneitra', 'sy', 'القنيطرة', 33.12, 35.82)], OPTS);
eq(out.length, 2, 'homonym: both kept');
eq(out[0].slug, 'kenitra', 'homonym: curated first');
eq(out[1].slug, 'al-quneitra', 'homonym: discovered second');

// 2) chefchaouen-ma DROPPED — clean slug already curated in same country
out = mergeCuratedDiscovered([r('chefchaouen', 'ma', 'شفشاون', 35.16, -5.26)], [r('chefchaouen-ma', 'ma', 'شفشاون', 35.16, -5.26)], OPTS);
eq(out.length, 1, 'chefchaouen-ma dropped (already curated)');
eq(out[0].slug, 'chefchaouen', 'chefchaouen kept');

// 3) uray-irah post-promotion DROPPED — same (cc,slug) already in curated results + index
out = mergeCuratedDiscovered([r('uray-irah', 'sa', 'عريعرة', 25.97, 48.86)], [r('uray-irah', 'sa', 'عريعرة', 25.97, 48.86)], OPTS);
eq(out.length, 1, 'uray-irah discovered de-duped post-promotion');

// 4) same place, SAME country, different slug → dropped via name + geo overlap
out = mergeCuratedDiscovered([r('foo', 'ma', 'فو', 30, -7)], [r('foo-old', 'ma', 'فو', 30.01, -7.01)], OPTS);
eq(out.length, 1, 'same-cc same-place different-slug dropped (name/geo)');

// 5) distinct discovered (no curated overlap) → kept
out = mergeCuratedDiscovered([r('riyadh', 'sa', 'الرياض', 24.7, 46.7)], [r('ad-dana', 'sy', 'الدانا', 36, 36)], OPTS);
eq(out.length, 2, 'distinct discovered kept');

// 6) cap honoured — 10 curated + 1 discovered → stays 10
const ten = Array.from({ length: 10 }, (_, i) => r('c' + i, 'sa', 'n' + i, 20 + i, 40 + i));
out = mergeCuratedDiscovered(ten, [r('extra', 'sy', 'extra', 0, 0)], OPTS);
eq(out.length, 10, 'cap=10 honoured (extra discovered dropped)');

// 7) curated-first ordering preserved
out = mergeCuratedDiscovered([r('a', 'ma', 'A', 1, 1), r('b', 'ma', 'B', 2, 2)], [r('c', 'sy', 'C', 3, 3)], OPTS);
eq(JSON.stringify(out.map(x => x.slug)), JSON.stringify(['a', 'b', 'c']), 'order: curated first, discovered appended');

// 8) literal duplicate discovered (same cc+slug, no index entry) → deduped
out = mergeCuratedDiscovered([r('x', 'ma', 'X', 5, 5)], [r('x', 'ma', 'X', 5, 5)], OPTS);
eq(out.length, 1, 'literal (cc,slug) dup deduped');

// 9) empty discovered → curated unchanged (the local/no-Supabase path)
out = mergeCuratedDiscovered([r('riyadh', 'sa', 'الرياض', 24.7, 46.7)], [], OPTS);
eq(out.length, 1, 'empty discovered → curated unchanged');

// 10) cleanDiscoveredSlug
eq(cleanDiscoveredSlug('chefchaouen-ma', 'ma'), 'chefchaouen', 'cleanSlug strips -ma');
eq(cleanDiscoveredSlug('al-quneitra', 'sy'), 'al-quneitra', 'cleanSlug keeps non-suffixed');
eq(cleanDiscoveredSlug('panama', 'pa'), 'panama', 'cleanSlug keeps embedded letters (no -pa suffix)');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
