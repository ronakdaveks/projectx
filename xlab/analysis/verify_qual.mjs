// Re-creates the page's hard-coded QUAL_DEFAULT table (4 models x 15 instances per problem) and compares it to the baked-in numbers.
import fs from 'node:fs'; import { loadEngine, cfgFor } from './extract_engine.mjs';
const html = process.argv[2], E = loadEngine(html), src = fs.readFileSync(html, 'utf8');
const baked = JSON.parse(src.slice(src.indexOf('/*QUAL*/') + 8, src.indexOf('/*END*/')).trim().replace(/;$/, ''));
const QM = ['c_sonnet55', 'o_6luna', 'o_5nano', 'l31_8'], K = 15, out = [];
let maxDiff = 0, cells = 0, exact = 0;
for (const u of E.USECASES_ALL) {
  const all = [];
  for (const mid of QM) for (let k = 0; k < K; k++) { const R = E.compute(cfgFor(E, u.id, mid), (1000 + 7919 * (k + 1)) >>> 0, false); all.push(E.scores(R).sc); }
  const m = [0,1,2,3,4,5,6,7].map(i => +(all.reduce((s, x) => s + x[i], 0) / all.length).toFixed(4));
  const b = baked.rows.find(r => r.id === u.id);
  m.forEach((v, i) => { const d = Math.abs(v - b.m[i]); maxDiff = Math.max(maxDiff, d); cells++; if (d < 1e-4 + 1e-9) exact++; });
  out.push({ id: u.id, name: u.name, recomputed: m, baked: b.m });
}
fs.writeFileSync('results/qual_check.json', JSON.stringify({ cells, exact, maxDiff, rows: out }, null, 1));
console.log(`cells compared: ${cells}, identical to 4 decimals: ${exact}, largest difference: ${maxDiff}`);
