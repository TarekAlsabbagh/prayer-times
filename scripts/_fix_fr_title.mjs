import fs from 'fs';
const file = 'server.js';
let s = fs.readFileSync(file, 'utf8');
// Compose needles with literal backslash + u2019 (8 chars in source) using String.fromCharCode(92)
const BS = String.fromCharCode(92); // '\'
const lit = 'aujourd' + BS + 'u2019hui';
const oldFr1 = "fr: 'État de la Lune " + lit + " - Phase, Illumination, Âge et Distance',";
const newFr1 = "fr: 'État de la Lune " + lit + " | Phase, Illumination et Âge',";
if (!s.includes(oldFr1)) { console.error('NOT FOUND oldFr1'); process.exit(1); }
s = s.replaceAll(oldFr1, newFr1);
fs.writeFileSync(file, s, 'utf8');
console.log('OK fr1');
