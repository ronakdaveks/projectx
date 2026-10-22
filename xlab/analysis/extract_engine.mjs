// Pulls the simulator's pure-math code verbatim out of the saved page and exposes it, with no browser, DOM or network.
// Usage: node extract_engine.mjs /path/to/X_Intelact_Lab.html  (prints a validation of the default run)
import fs from 'node:fs'; import vm from 'node:vm';
export function loadEngine(htmlPath){
  const src = fs.readFileSync(htmlPath, 'utf8');
  const cut = (from, to) => { const a = src.indexOf(from); const b = src.indexOf(to, a); if (a < 0 || b < 0) throw new Error('marker missing: ' + from); return src.slice(a, b); };
  const A = cut('function mulberry32', '/* ---------- populate controls ---------- */');
  const B = cut('/* ---------- Intellect: knowledge files ---------- */', '/* ---------- live readouts ---------- */');
  const C = cut('/* ---------- QAOA statevector ---------- */', 'let LAST=null');
  const D = cut('function scores(R)', 'function renderTrials');            // scores, isWin, mean
  const code = `(function(){${A}\n${B}\n${C}\n${D.split('const sleep')[0]}\nreturn {compute,scores,isWin,mean,MODELS,PACKS_ALL,USECASES_ALL,BACKENDS,intellect,gateModel,mulberry32,summ:null};})()`;
  // sandbox with no require/fs/network: only Math, performance
  const ctx = vm.createContext({ Math, performance, console: { log(){} }, Float64Array, Float32Array, Uint8Array, Set, Map, Array, Object, String, Number, JSON });
  return vm.runInContext(code, ctx);
}
export function baseCfg(E, over = {}) {
  return { be: E.BACKENDS.find(b => b.id === 'qtm'), n: 8, p: 3, shots: 1024, mit: 'ro', algo: 'qaoa', cls: 'sa', R: true, C: true, F: false, files: [], CH: true, tr: { cal: 1, cur: 1, open: 1 }, ...over };
}
export function cfgFor(E, ucId, modelId, over = {}) {
  const uc = E.USECASES_ALL.find(u => u.id === ucId), model = E.MODELS.find(m => m.id === modelId);
  const pack = E.PACKS_ALL.find(p => p.domain === uc.domain) || E.PACKS_ALL[0];
  const rules = uc.rules || '';
  return baseCfg(E, { uc, model, pack, custom: rules, lines: rules.split('\n').filter(s => s.trim()).length, ...over });
}
if (process.argv[1] && process.argv[1].endsWith('extract_engine.mjs')) {
  const E = loadEngine(process.argv[2]);
  const R = E.compute(cfgFor(E, 'amb', 'c_sonnet55', { pack: E.PACKS_ALL.find(p => p.id === 'pub') }), 8, false);
  console.log(R.log.join('\n'));
  const s = E.scores(R); console.log('scores [AI, AI+Q, AI+I, FULL, AI+C, AI+I+C]:', s.sc.slice(0,6).map(x => Math.round(x*100)));
}
