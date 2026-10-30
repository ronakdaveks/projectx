# X Intelact Lab: how it works

Question the app asks: *Does AI with Intellect and Quantum make better decisions than AI alone?*
It answers by running one decision problem through three stacks and scoring each against the exact optimum.

## Pipeline (`compute()` in `index.html`)

1. **Problem.** A use case (`USECASES_ALL`: ambulance coverage, grid dispatch, portfolio, drug scaffold, cold chain,
   rail, elections, etc., or a user-built one) generates an instance of `n` yes/no decisions (n = qubits, default up to
   the `#qubits` choices). It is encoded as a QUBO: an objective matrix `obj` plus a penalty matrix `pen` for hard rules.
   `violations(z)` lists broken rules for any answer `z`. All 2^n answers are enumerated, so the true optimum is known.
2. **AI layer.** Each model in `MODELS` has two numbers: `cap` (capability) and `cs` (constraint sense).
   The "AI formulation" is the true QUBO plus Gaussian noise (`sA = 0.6*(1-cap) + use-case gap`) and the penalty term
   scaled by `cA = cs * privacy factor`. No model is called; model names and ids are labels for these parameters.
3. **Intellect layer** (`intellect()`). Knowledge packs, typed rules and uploaded files (text, PDF via pdf.js) are
   scored by domain match, item coverage and rule/conflict detection (`analyseFiles`). This cuts the formulation error
   (`sI`) and raises constraint capture (`cI`). An optional "character" layer adds calibration (flag uncertain terms),
   curiosity (clarifying questions) and openness (applying expert feedback).
4. **Quantum layer** (`quantum()`). A statevector QAOA simulator (`qaoaProbs`, depth `p`, optional warm start) tunes
   gamma/beta by grid search plus local refinement on a CVaR objective, then applies a backend noise model
   (`BACKENDS`: fidelity from gate counts and error rates, optional readout or zero-noise-extrapolation mitigation),
   and samples `shots` measurements. The best sample under each formulation is the quantum answer.
5. **Classical baseline.** Simulated annealing (or an exact solver) run on the same formulations for a fair comparison.
6. **Scoring.** Score = 0 if an answer breaks a hard rule, else normalised distance between worst feasible and optimum.
   The app reports each stack, a decomposition of what Intellect vs quantum contributed, repeats on 20 problems
   (`trialsBtn`), and sweeps nine models (`sweepBtn`).

## Views
- Results and conclusion text (`render`, `writeConclusion`).
- 3D circuit state (`#v3`), quantum core particles (`#qc`), end-to-end five-stage flight (`#e2`), all three.js with bloom.
- Miniature simulator (`#mini`), problem builder dialog (`#pb`), "Frontier" cards citing real quantum-advantage results.
- Matrix/simple look toggle, saved to `localStorage` (`xil-look`).

## Persistence
Only `localStorage` (custom problems, look). No cookies, accounts or network.

## What this simulator does and does not show
- The quantum part is a genuine classical statevector simulation of QAOA at small `n`. It cannot show hardware
  advantage; at these sizes the exact answer is enumerable.
- The AI and Intellect effects are **parametric assumptions** (noise on the formulation, and knowledge reducing it),
  not measurements of real models. The headline gap between "AI alone" and "AI + Intellect" follows from those
  assumptions. The app itself notes when a classical solver given the same Intellect matches the quantum result.
- Treat it as a demonstrator of the mechanism, not evidence about real-world model performance.
