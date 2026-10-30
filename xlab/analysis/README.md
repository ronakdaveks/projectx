# Reverse-engineering X Intelact Lab

Everything here was derived from the saved page `X_Intelact_Lab.html` (not from the live server).

| File | What it does |
|---|---|
| `extract_engine.mjs` | Cuts the simulator's pure-math code out of the HTML unchanged and runs it in a Node `vm` sandbox (no DOM, no network). Run it to print the default run log and compare with the page. |
| `sweep.mjs` | Runs the page's own qualification protocol for every model in its catalogue (37 models x 15 problems x K instances). |
| `analyze.mjs` | Aggregates the sweep into `results/summary.json` and `results/model_summary.csv`. |
| `verify_qual.mjs` | Re-creates the page's hard-coded `QUAL_DEFAULT` table and compares it (result: 120/120 numbers identical). |
| `build_explainer.py` | Builds `X_Intelact_Lab_Explained.html`, the beginner-friendly write-up. |

```bash
H=/path/to/X_Intelact_Lab.html
node extract_engine.mjs $H                          # reproduces the page's default run log
for i in 0 1 2 3; do node sweep.mjs $H results/part$i.json $i 4 10 & done; wait
node analyze.mjs && node verify_qual.mjs $H && python3 -I build_explainer.py
```

Key findings: no network code or model API calls anywhere in the page; model quality enters only through two hard-coded numbers per model
(`cap`, `cs`); AI-alone score tracks `cap` almost linearly (r = 0.98); "Intellect" supplies true data to the AI's formulation; quantum tied an
ordinary solver in 94% of 5,550 runs.
