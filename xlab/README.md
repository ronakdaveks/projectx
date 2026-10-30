# X Intelact Lab (local copy)

Offline copy of https://xintellectsimulator.onrender.com, rebuilt from a saved copy of the live page.
It is a single-page, fully client-side app: no backend, no API calls, nothing leaves the browser.

## Run

```bash
python3 serve.py          # http://localhost:8000
python3 serve.py 9000     # another port
```

Any static server works (`npx serve .`). Opening `index.html` straight from disk also works in most browsers,
but a server is safer for fonts and the PDF reader.

## What is in here

| Path | Purpose |
|---|---|
| `index.html` | The whole app (UI, simulation, 3D) as saved from the live page. Only asset paths and absolute links were changed. |
| `vendor/three/` | three.js r128 build plus the postprocessing scripts the page loads (EffectComposer, RenderPass, ShaderPass, UnrealBloomPass, CopyShader, LuminosityHighPassShader, MaskPass). |
| `vendor/pdfjs/` | pdf.js 3.11.174, used when you upload a PDF as a knowledge file. |
| `vendor/fonts/` | Latin-subset Bricolage Grotesque, IBM Plex Sans/Mono, Chakra Petch, plus `fonts.css`. |
| `serve.py` | Tiny local static server. |
| `tests/smoke.mjs` | Headless smoke test (loads page, runs once, runs 20 trials, lists console errors and any external requests). |
| `docs/ARCHITECTURE.md` | How it works, what is simulated, and limits. |

## Provenance and caveats

- Rebuilt from `X_Intelact_Lab.html` (a browser "Save page as"). The original `X Intelact Lab_files/` folder was not
  available, so the three.js version (r128) and fonts were re-sourced from npm. If the live site uses a different
  three.js revision, rendering of the 3D views may differ slightly.
- The local copy makes zero network requests (verified in headless Chromium). The only external URLs are the
  citation links in the "Frontier" section, which open in a new tab.
- Saved custom problems and the look toggle use the browser's `localStorage`; they are per-browser and per-origin,
  so they will not carry over from the live site.
