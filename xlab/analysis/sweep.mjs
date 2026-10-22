// Runs the page's own qualification protocol for every model in its catalogue.
// node sweep.mjs <html> <outfile.json> <startModelIdx> <step> [K=10]
import fs from 'node:fs'; import { loadEngine, cfgFor } from './extract_engine.mjs';
const [html, out, start, step, K] = [process.argv[2], process.argv[3], +process.argv[4] || 0, +process.argv[5] || 1, +process.argv[6] || 10];
const E = loadEngine(html); const rows = [];
E.MODELS.forEach((M, mi) => {
  if (mi % step !== start) return;
  for (const u of E.USECASES_ALL) {
    const res = [], par = {};
    for (let k = 0; k < K; k++) {
      const c = cfgFor(E, u.id, M.id); const R = E.compute(c, (1000 + 7919 * (k + 1)) >>> 0, false); const s = E.scores(R);
      if (k === 0) par.sA = R.I.sA, par.cA = R.I.cA, par.sI = R.I.sI, par.cI = R.I.cI, par.F = R.QI.gm.F, par.Fe = R.QI.Fe, par.n2 = R.QI.gm.n2;
      res.push({ sc: s.sc.slice(0, 8), br: s.br.slice(0, 8) });
    }
    rows.push({ model: M.id, name: M.name, org: M.org, cap: M.cap, cs: M.cs, uc: u.id, ucName: u.name, priv: u.priv ?? 1, gap: u.gap ?? 0, par, res });
  }
});
fs.writeFileSync(out, JSON.stringify(rows)); console.log('done', start, rows.length);
