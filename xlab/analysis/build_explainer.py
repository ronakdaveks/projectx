import json, html, math
S = json.load(open('results/summary.json'))
M = sorted(S['summary'], key=lambda m: m['cap'])          # weakest -> strongest by the page's own "capability" constant
T = S['tot']; P = lambda x: round(x*100)
priv, gap = .35, .12                                         # ambulance problem constants, used for the parameter table
def bar(label, v, mx, txt, cls, sub=''):
    return f'<div class="row" title="{html.escape(label)}: {txt}"><div class="lab">{html.escape(label)}{f"<span class=sub>{html.escape(sub)}</span>" if sub else ""}</div><div class="track"><div class="fill {cls}" style="width:{max(v/mx*100,.6):.1f}%"></div></div><div class="val">{txt}</div></div>'

# chart A: all models, 3 bars each
chartA = ''
for m in reversed(M):
    chartA += f'<div class="mgrp"><div class="mname">{html.escape(m["name"])}<span class="sub">capability {m["cap"]:.2f} · rule memory {m["cs"]:.2f}</span></div>' \
      + bar('AI alone', m['mean'][0], 1, f'{P(m["mean"][0])}%', 'mute') \
      + bar('AI + Intellect', m['mean'][2], 1, f'{P(m["mean"][2])}%', 'mid') \
      + bar('Full stack', m['mean'][3], 1, f'{P(m["mean"][3])}%', 'ink') + '</div>'

# chart B: scatter of AI-alone score vs capability constant, with fit line
W,H,L,R_,Tp,B = 520,300,48,16,16,44
def X(c): return L + (c-.45)/(1.0-.45)*(W-L-R_)
def Y(v): return Tp + (.6-v)/.6*(H-Tp-B)
grid = ''.join(f'<line class="gl" x1="{L}" x2="{W-R_}" y1="{Y(v):.1f}" y2="{Y(v):.1f}"/><text class="ax" x="{L-8}" y="{Y(v)+4:.1f}" text-anchor="end">{int(v*100)}%</text>' for v in (0,.2,.4,.6))
grid += ''.join(f'<text class="ax" x="{X(c):.1f}" y="{H-24}" text-anchor="middle">{c:.1f}</text>' for c in (.5,.6,.7,.8,.9,1.0))
pts = ''.join(f'<circle class="dot" cx="{X(m["cap"]):.1f}" cy="{Y(m["mean"][0]):.1f}" r="5"><title>{html.escape(m["name"])}: capability {m["cap"]:.2f}, AI alone {P(m["mean"][0])}%</title></circle>' for m in M)
line = f'<line class="fit" x1="{X(.5):.1f}" y1="{Y(-.01+.57*.5):.1f}" x2="{X(.95):.1f}" y2="{Y(-.01+.57*.95):.1f}"/>'
lab = lambda m,dx,dy,anc: f'<text class="ann" x="{X(m["cap"])+dx:.1f}" y="{Y(m["mean"][0])+dy:.1f}" text-anchor="{anc}">{html.escape(m["name"])}</text>'
svgB = f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Each dot is one model. AI-alone score rises in a straight line with the typed-in capability number.">{grid}{line}{pts}{lab(M[0],10,-8,"start")}{lab(M[-1],-10,18,"end")}<text class="ax" x="{(L+W-R_)/2:.1f}" y="{H-4}" text-anchor="middle">Capability number typed into the code (cap)</text></svg>'

# parameter table
rows = ''
for m in reversed(M):
    sA = .6*(1-m['cap'])+gap; cA = m['cs']*priv
    rows += f'<tr><td>{html.escape(m["name"])}</td><td>{m["cap"]:.2f}</td><td>{m["cs"]:.2f}</td><td>{sA*100:.1f}%</td><td>{cA*100:.1f}%</td><td>{P(m["mean"][0])}%</td><td>{P(m["mean"][2])}%</td><td>{P(m["mean"][3])}%</td><td>{round(m["breakAI"]*100)}%</td></tr>'

# quantum vs classical
qa, qt, qb = T['quantumAhead'], T['tied'], T['behind']; N = T['runs']
byuc = ''.join(f'<tr><td>{html.escape(u["name"])}</td><td>{P(u["mean"][0])}%</td><td>{P(u["mean"][2])}%</td><td>{P(u["mean"][5])}%</td><td>{P(u["mean"][3])}%</td><td>{u["qA"]}</td><td>{u["qB"]}</td></tr>' for u in S['byUc'])

page = f'''<title>X Intelact Lab Explained</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* Layout: one calm reading column. Verdict first, then the recipe step by step, then the evidence charts. */
:root{{--bg:#F7F7F5;--surface:#FFFFFF;--ink:#0B0B0C;--ink2:#46464C;--muted:#85858B;--rule:#E1E1DD;--track:#EFEFEC;--mute-fill:#B9B9BE;--mid-fill:#6C6C73;--gold:#C9A24A;--gold-ink:#7A5C0F;--good:#1F7A3A;--warn:#9A5B00;--bad:#B3261E;--font:'Inter','Helvetica Neue',Arial,sans-serif;--mono:'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#050505;--surface:#0E0E0F;--ink:#F2F2F2;--ink2:#B6B6BB;--muted:#8A8A90;--rule:#262628;--track:#1A1A1C;--mute-fill:#55555B;--mid-fill:#9A9AA2;--gold:#C9A24A;--gold-ink:#D9B766;--good:#5FCB7F;--warn:#E6A23C;--bad:#F2837A;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#050505;--surface:#0E0E0F;--ink:#F2F2F2;--ink2:#B6B6BB;--muted:#8A8A90;--rule:#262628;--track:#1A1A1C;--mute-fill:#55555B;--mid-fill:#9A9AA2;--gold:#C9A24A;--gold-ink:#D9B766;--good:#5FCB7F;--warn:#E6A23C;--bad:#F2837A;color-scheme:dark}}
body{{background:var(--bg);color:var(--ink);font-family:var(--font);font-size:15px;line-height:1.6;padding-block:32px 56px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));-webkit-font-smoothing:antialiased}}
.wrap{{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:20px}}
h1{{font-weight:300;font-size:clamp(28px,5.6vw,44px);line-height:1.1;margin:8px 0 10px;text-wrap:balance}}h1 b{{font-weight:600}}
.eyebrow{{font-size:11px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}}
.lede{{color:var(--ink2);max-width:64ch;margin:0}}
section.p{{background:var(--surface);border:1px solid var(--rule);padding:22px clamp(16px,3vw,28px);display:flex;flex-direction:column;gap:14px}}
h2{{font-weight:500;font-size:clamp(19px,3.2vw,24px);line-height:1.25;margin:0;text-wrap:balance}}
h3{{font-weight:600;font-size:15px;margin:0}}
p{{margin:0}}.note{{font-size:12.5px;color:var(--muted)}}
.k{{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);font-weight:500}}
.verdicts{{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1px;background:var(--rule);border:1px solid var(--rule)}}
.verdicts>div{{background:var(--surface);padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}}
.badge{{align-self:flex-start;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:2px 8px;border:1px solid currentColor}}
.badge.no{{color:var(--bad)}}.badge.ok{{color:var(--good)}}.badge.warn{{color:var(--warn)}}
.step{{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;padding-top:12px;border-top:1px solid var(--rule)}}
.step:first-of-type{{border-top:0;padding-top:0}}
.eq{{font-family:var(--mono);font-size:13px;background:var(--track);padding:9px 12px;overflow-x:auto;white-space:pre;line-height:1.7}}
.say{{color:var(--ink2)}} .say b{{color:var(--ink);font-weight:600}}
.tbl{{overflow-x:auto}}table{{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}}
th,td{{text-align:left;padding:6px 12px 6px 0;border-bottom:1px solid var(--rule);white-space:nowrap}}th{{color:var(--muted);font-weight:500;font-size:12px}}
td.ok{{color:var(--good);font-weight:600}}
.grp,.mgrp{{display:flex;flex-direction:column;gap:5px;padding:9px 0;border-top:1px solid var(--rule)}}
.mname{{font-size:13px;font-weight:600;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}}.mname .sub{{font-weight:400}}
.row{{display:grid;grid-template-columns:minmax(92px,150px) minmax(0,1fr) 44px;align-items:center;gap:10px}}
.lab{{font-size:12.5px;color:var(--ink2)}}.sub{{color:var(--muted);font-size:11.5px}}
.track{{height:11px;background:var(--track);border-radius:0 3px 3px 0}}.fill{{height:100%;border-radius:0 3px 3px 0}}
.fill.mute{{background:var(--mute-fill)}}.fill.mid{{background:var(--mid-fill)}}.fill.ink{{background:var(--ink)}}.fill.gold{{background:var(--gold)}}
.val{{font-size:12.5px;text-align:right;font-variant-numeric:tabular-nums}}
.legend{{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--ink2)}}.legend i{{display:inline-block;width:10px;height:10px;margin-right:6px;border-radius:2px;vertical-align:-1px}}
.scroll{{max-height:560px;overflow-y:auto;border-top:1px solid var(--rule)}}
svg{{display:block;width:100%;height:auto}}svg .gl{{stroke:var(--rule)}}svg .ax{{fill:var(--muted);font-size:11px;font-family:var(--font)}}svg .ann{{fill:var(--ink2);font-size:11.5px;font-family:var(--font)}}
svg .dot{{fill:var(--ink);stroke:var(--surface);stroke-width:2}}svg .fit{{stroke:var(--gold);stroke-width:2}}
.stack{{display:flex;height:22px;gap:2px}}.stack div{{height:100%}}
.callout{{border-left:2px solid var(--gold);padding:2px 0 2px 14px;color:var(--ink2)}}
.two{{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px}}@media (max-width:720px){{.two{{grid-template-columns:minmax(0,1fr)}}.row{{grid-template-columns:minmax(0,1fr) auto}}.row .track{{grid-column:1/-1;order:3}}}}
details{{font-size:13.5px}}summary{{cursor:pointer;color:var(--ink2);font-weight:500}}summary:focus-visible{{outline:2px solid var(--gold);outline-offset:3px}}
footer{{font-size:12px;color:var(--muted)}}
</style>
<div class="wrap">
<header>
<div class="eyebrow">X Intelact Lab · reverse-engineered from the HTML you provided</div>
<h1>Is it a real test, or a <b>staged one</b>?</h1>
<p class="lede">I took the simulator's own code apart, ran it for all {len(M)} models on all 15 problems ({N:,} runs), and checked every number against its equations. Here is what it does, in plain words.</p>
</header>

<section class="p">
<span class="k">The short answer</span>
<div class="verdicts">
<div><span class="badge no">No</span><h3>Does it call real AI models or APIs?</h3><p class="say">No. The code has no network calls at all. Each model is just a name with <b>two typed-in numbers</b>. The “API id” text in the model box is only a label.</p></div>
<div><span class="badge ok">No</span><h3>Are the numbers faked?</h3><p class="say">No. I re-ran its maths outside the browser and got your on-screen log <b>to the digit</b>, and all <b>120 of 120</b> numbers in its built-in table. It really computes them.</p></div>
<div><span class="badge warn">Careful</span><h3>Does it prove Intellect + Quantum beats AI?</h3><p class="say">It cannot. The winner is decided by how the equations treat each layer: Intellect is simulated as <b>handing the AI the true data</b>, and quantum <b>ties an ordinary solver {P(qt/N)}% of the time</b>.</p></div>
</div>
<p class="note">The page's own footer says the same: model factors are “illustrative” and “the simulator does not call any model API”. I could only check the saved HTML, not the live server.</p>
</section>

<section class="p">
<span class="k">The recipe</span>
<h2>Five steps, using the page's default run</h2>
<p class="say">Default run: problem <b>Ambulance base coverage</b>, model <b>Claude Sonnet 5.5</b>, 8 yes/no decisions (so 256 possible answers). Every number below is recomputed from the code.</p>

<div class="step"><h3>1 · A puzzle with a known best answer</h3>
<div class="eq">cost of an answer z  =  c + Σ Qii·zi + Σ Qij·zi·zj      (z is 8 yes/no choices)
score = 0                                  if the answer breaks a hard rule
score = (worst allowed − yours) / (worst allowed − best)   otherwise</div>
<p class="say">The page tries all 256 answers, so it always knows the true best one. That best answer is the <b>100%</b> line. Break a rule and you get <b>0%</b> however good the rest looks.</p></div>

<div class="step"><h3>2 · The “AI”: two dials and some random noise</h3>
<div class="eq">noise  σA   = 0.6 × (1 − cap) + gap          = 0.6 × (1 − 0.91) + 0.12 = 0.174   (shown: 17%)
rules remembered  cA = cs × privacy     = 0.66 × 0.35            = 0.231   (shown: 23%)
AI's version of the puzzle = truth + random noise × σA + only cA of the rule penalties</div>
<p class="say"><b>cap</b> and <b>cs</b> are numbers typed into the code for each model (Sonnet 5.5 gets 0.91 and 0.66). <b>gap</b> and <b>privacy</b> are typed in per problem. The AI then answers by picking one choice at a time on its own distorted puzzle. No model is asked anything.</p></div>

<div class="step"><h3>3 · “Intellect”: the AI is handed the true data</h3>
<div class="eq">cut = min(0.92, match × (0.5 + 0.2·feedback) + 0.1·u + from-files)   = 0.5 + 0.033 = 0.533
noise after Intellect  σI = σA × (1 − cut)               = 0.174 × 0.467 = 0.081   (shown: 8%)
rules known            cI = cA + (1 − cA) × min(1, know + curiosity…)  = 1.00 (shown: 100%)</div>
<p class="say">If the knowledge pack matches the problem, <b>match = 1</b> and noise is roughly halved. The rule-memory jumps to the maximum. The “calibration” step goes further: terms the AI is unsure about are <b>replaced with the true values</b>. So “Intellect” here means “someone gives the AI the answer key”, which is why it helps every model.</p></div>

<div class="step"><h3>4 · “Quantum”: a real but small simulation</h3>
<div class="eq">fidelity F = (1 − e2)^n2 × (1 − e1)^n1 × (1 − ro)^n  = 0.9988^144 × 0.99997^128 × 0.9985^8 = 0.828
after readout fix  Fe = F / (1 − ro)^n                 = 0.838
what is measured:  P(z) = Fe × P_ideal(z) + (1 − Fe) / 256        (then 1,024 samples are drawn)</div>
<p class="say">This part is genuine maths: an 8-qubit quantum circuit (QAOA) simulated on an ordinary CPU, with a noise formula for a trapped-ion machine. It then keeps the <b>best of 1,024 samples as judged by the AI's own version of the puzzle</b>. The circuit settings are tuned using the simulator's exact probabilities, which a real machine could not do for free.</p></div>

<div class="step"><h3>5 · The fair check: an ordinary solver</h3>
<div class="eq">simulated annealing: 4 restarts × 256 steps = 1,024 tries, on the same puzzle version</div>
<p class="say">With only 256 possible answers, 1,024 ordinary tries almost always find the best one. That is why the page often says “the quantum part was not what made the difference”.</p></div>
</section>

<section class="p">
<span class="k">All {len(M)} models</span>
<h2>The “AI alone” score is just the typed-in capability number, passed through a formula</h2>
<p class="say">Average score over 15 problems and 10 random instances each. Models are sorted from strongest to weakest by their typed-in capability.</p>
<div class="two">
<div><h3>AI alone vs the capability number</h3>{svgB}<p class="note">Each dot is a model. Correlation 0.98. Rule of thumb from the data: AI alone ≈ 0.57 × cap − 0.01. The gold line is that fit.</p></div>
<div class="callout"><p><b>What this means.</b> If the scores came from real model testing, they would scatter. Instead they sit on a straight line set by a number someone typed. Intellect then lifts <b>every</b> model to about 81–82%, and the full stack to 96–99%, whether the model is the newest flagship or a 3.8B-parameter model.</p><p style="margin-top:10px">AI alone breaks a hard rule in <b>45% to 70%</b> of runs. The full stack breaks one in <b>0.7%</b>.</p></div>
</div>
<div class="legend"><span><i style="background:var(--mute-fill)"></i>AI alone</span><span><i style="background:var(--mid-fill)"></i>AI + Intellect</span><span><i style="background:var(--ink)"></i>Full stack (AI + Intellect + Quantum)</span></div>
<div class="scroll">{chartA}</div>
<details><summary>View all parameters as a table</summary><div class="tbl"><table><tr><th>Model</th><th>cap</th><th>cs</th><th>AI noise σA*</th><th>Rules remembered*</th><th>AI alone</th><th>+ Intellect</th><th>Full stack</th><th>AI breaks a rule</th></tr>{rows}</table></div><p class="note">*Shown for the Ambulance problem (gap 0.12, privacy 0.35). Scores are averages over all 15 problems. Data: analysis/results/model_summary.csv.</p></details>
</section>

<section class="p">
<span class="k">The quantum question</span>
<h2>Quantum matched an ordinary solver in <em style="font-style:normal;font-weight:600">{P(qt/N)}%</em> of {N:,} runs</h2>
<p class="say">Both get the same Intellect-corrected puzzle and the same number of tries. Here is how often quantum finished ahead, level or behind.</p>
<div class="stack" role="img" aria-label="Quantum ahead {qa}, tied {qt}, behind {qb} out of {N} runs"><div style="flex:{qa};background:var(--gold)" title="Quantum ahead: {qa}"></div><div style="flex:{qt};background:var(--mute-fill)" title="Tied: {qt}"></div><div style="flex:{max(qb,30)};background:var(--ink)" title="Quantum behind: {qb}"></div></div>
<div class="legend"><span><i style="background:var(--gold)"></i>Quantum ahead: {qa} ({qa/N*100:.1f}%)</span><span><i style="background:var(--mute-fill)"></i>Tied: {qt} ({qt/N*100:.1f}%)</span><span><i style="background:var(--ink)"></i>Quantum behind: {qb} ({qb/N*100:.1f}%)</span></div>
<p class="say">Average advantage of the full stack over “AI + Intellect + ordinary solver”: <b>{(T["meanScores"][3]-T["meanScores"][5])*100:.1f} points</b> (98.4% vs 98.0%). With 8 decisions a laptop can check every answer, so no quantum computer is needed. The page admits this in its footer.</p>
<details><summary>View by problem</summary><div class="tbl"><table><tr><th>Problem</th><th>AI alone</th><th>+ Intellect</th><th>+ Intellect + ordinary solver</th><th>Full stack</th><th>Quantum ahead</th><th>Quantum behind</th></tr>{byuc}</table></div><p class="note">Out of 370 runs per problem (37 models × 10 instances).</p></details>
</section>

<section class="p">
<span class="k">What to say, and what would make it a real test</span>
<h2>A fair description and a short list of fixes</h2>
<p class="say"><b>Fair description:</b> “A working demonstration of how a knowledge layer and a quantum search could combine, using a simplified model of AI errors. The AI errors are assumptions, not measurements.”</p>
<p class="say"><b>To make it a real test:</b> (1) send the same puzzles to real models and measure their actual formulation errors, (2) give the Intellect layer only information a real user could supply, not the true values, (3) report quantum versus classical only on problems too large to enumerate, (4) run on real hardware or with published error rates and no free tuning.</p>
</section>

<footer>
<p>Method: the simulator's maths was extracted unchanged from your saved HTML (not my localhost copy) and run in Node with no network. It reproduced the on-screen run log exactly, and all 120 numbers in the built-in qualification table (4 models × 15 problems × 15 instances) to four decimals. Sweep: 37 models × 15 problems × 10 instances, seeds 1000 + 7919·k, using the page's own default settings and its own qualification setup. Code and data are in the repo under xlab/analysis/. Model names come from the page; I have not verified that they exist.</p>
</footer>
</div>
'''
open('X_Intelact_Lab_Explained.html', 'w').write(page)
print(len(page))
