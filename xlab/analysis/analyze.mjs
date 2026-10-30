import fs from 'node:fs';
const rows = [0,1,2,3].flatMap(i => JSON.parse(fs.readFileSync(`results/part${i}.json`)));
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const names = ['AI alone', 'AI + Quantum', 'AI + Intellect', 'Full stack', 'AI + Classical', 'AI + Intellect + Classical'];
const byModel = new Map();
for (const r of rows) { const m = byModel.get(r.model) || { model: r.model, name: r.name, org: r.org, cap: r.cap, cs: r.cs, runs: [] }; for (const x of r.res) m.runs.push(x); byModel.set(r.model, m); }
const summary = [...byModel.values()].map(m => ({ model: m.model, name: m.name, org: m.org, cap: m.cap, cs: m.cs,
  mean: [0,1,2,3,4,5].map(i => +mean(m.runs.map(x => x.sc[i])).toFixed(4)),
  breakAI: +mean(m.runs.map(x => x.br[0] ? 1 : 0)).toFixed(4), breakFull: +mean(m.runs.map(x => x.br[3] ? 1 : 0)).toFixed(4),
  qA: m.runs.filter(x => x.sc[3] > x.sc[5] + .0005).length, qT: m.runs.filter(x => Math.abs(x.sc[3] - x.sc[5]) <= .0005).length, qB: m.runs.filter(x => x.sc[5] > x.sc[3] + .0005).length, n: m.runs.length }));
const all = rows.flatMap(r => r.res);
const tot = { runs: all.length, quantumAhead: all.filter(x => x.sc[3] > x.sc[5] + .0005).length, tied: all.filter(x => Math.abs(x.sc[3] - x.sc[5]) <= .0005).length, behind: all.filter(x => x.sc[5] > x.sc[3] + .0005).length,
  meanScores: [0,1,2,3,4,5].map(i => +mean(all.map(x => x.sc[i])).toFixed(4)) };
const byUc = [...new Set(rows.map(r => r.uc))].map(u => { const rs = rows.filter(r => r.uc === u), rr = rs.flatMap(r => r.res); return { uc: u, name: rs[0].ucName, priv: rs[0].priv, gap: rs[0].gap, mean: [0,1,2,3,4,5].map(i => +mean(rr.map(x => x.sc[i])).toFixed(4)), qA: rr.filter(x => x.sc[3] > x.sc[5] + .0005).length, qB: rr.filter(x => x.sc[5] > x.sc[3] + .0005).length, n: rr.length }; });
fs.writeFileSync('results/summary.json', JSON.stringify({ names, summary, tot, byUc }, null, 1));
fs.writeFileSync('results/model_summary.csv', ['model,org,cap,cs,' + names.map(n => n.replace(/ /g, '_')).join(',') + ',AI_breaks_rule_rate,Full_breaks_rule_rate', ...summary.map(s => [s.name, s.org, s.cap, s.cs, ...s.mean, s.breakAI, s.breakFull].join(','))].join('\n'));
console.log(JSON.stringify(tot)); console.log(summary.length + ' models'); 
