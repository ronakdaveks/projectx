// Smoke test: npm i playwright-core, run 'python3 serve.py 8765' in xlab/, then 'node tests/smoke.mjs <outdir>'.
// Set executablePath below to your Chrome/Chromium.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport:{width:1280,height:900} });
const errs=[], ext=[], bad=[];
p.on('pageerror', e=>errs.push('pageerror: '+e.message));
p.on('console', m=>{ if(['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text().slice(0,200)); });
p.on('request', r=>{ const u=r.url(); if(!u.startsWith('http://127.0.0.1:8765')&&!u.startsWith('data:')&&!u.startsWith('blob:')) ext.push(u); });
p.on('response', r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url()); });
await p.goto('http://127.0.0.1:8765/', { waitUntil:'load' });
await p.waitForTimeout(1500);
const info1 = await p.evaluate(()=>({three: typeof THREE!=='undefined'&&THREE.REVISION, composer: typeof THREE.EffectComposer, bloom: typeof THREE.UnrealBloomPass, title: document.title, fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight)}));
console.log('INIT', JSON.stringify(info1));
await p.click('#run'); await p.waitForTimeout(3000);
const res = await p.evaluate(()=>({resultsText: (document.querySelector('#results')?.innerText||'').slice(0,700), conclusion:(document.querySelector('#conclusion')?.innerText||'').slice(0,300)}));
console.log('RUN', JSON.stringify(res));
await p.click('#trialsBtn'); await p.waitForTimeout(8000);
console.log('TRIALS', await p.evaluate(()=>(document.querySelector('#conclusion')?.innerText||'').slice(0,400)));
await p.screenshot({ path: process.argv[2]+'/full.png', fullPage:true });
await p.evaluate(()=>document.querySelector('#e2')?.scrollIntoView());
await p.waitForTimeout(1500);
await p.screenshot({ path: process.argv[2]+'/e2.png' });
console.log('ERRORS', JSON.stringify(errs.slice(0,12)));
console.log('EXTERNAL', JSON.stringify([...new Set(ext)].slice(0,10)));
console.log('BAD', JSON.stringify(bad.slice(0,10)));
await b.close();
