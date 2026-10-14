// Synthesises a placeholder score: drone swell, ticking pulse, silence, two sub hits.
// Times are in seconds and mirror src/Teaser.tsx.
import fs from 'node:fs';

const SR = 44100;
const DUR = 100;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const TAU = Math.PI * 2;

// deterministic noise
let seed = 1234567;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

// --- Drone: E1/B1/E2 with slow beating, swells to the cut at 84.6s, returns softly at 89.4s ---
const droneEnv = (t) => {
  if (t < 84.6) return 0.05 + 0.95 * Math.pow(ramp(t, 0, 80), 1.6);
  if (t < 89.4) return 0; // silence
  if (t < 99.5) return 0.35 * ramp(t, 91.6, 94) + 0.0;
  return 0.35 * (1 - ramp(t, 99.5, 100));
};
const cutFade = (t) => (t >= 84.2 && t < 84.6 ? 1 - ramp(t, 84.2, 84.6) : 1);

for (let i = 0; i < N; i++) {
  const t = i / SR;
  const e = droneEnv(t) * cutFade(t);
  if (e <= 0) continue;
  const lfo = 0.5 + 0.5 * Math.sin(TAU * 0.07 * t);
  const a = Math.sin(TAU * 41.2 * t) * 0.5;
  const b = Math.sin(TAU * 61.7 * t + Math.sin(TAU * 0.05 * t)) * 0.28;
  const c = Math.sin(TAU * 82.4 * t) * 0.18 * lfo;
  const d = Math.sin(TAU * 123.5 * t) * 0.07 * ramp(t, 40, 84) * lfo;
  const v = (a + b + c + d) * e * 0.34;
  L[i] += v;
  R[i] += v * 0.98 + Math.sin(TAU * 41.5 * t) * 0.01 * e;
}

// --- Ticking pulse: 45s -> 84.4s, tempo 60 -> 96 BPM ---
{
  let tt = 45;
  while (tt < 84.4) {
    const p = ramp(tt, 45, 84.4);
    const period = 60 / (60 + 36 * p);
    const gain = 0.05 + 0.1 * p;
    const start = Math.floor(tt * SR);
    const len = Math.floor(0.09 * SR);
    for (let k = 0; k < len && start + k < N; k++) {
      const x = k / SR;
      const env = Math.exp(-x * 70);
      const v = (Math.sin(TAU * 1800 * x) * 0.6 + rnd() * 0.4) * env * gain;
      L[start + k] += v;
      R[start + k] += v;
    }
    tt += period;
  }
}

// --- Sub hit helper ---
const hit = (at, f1, f2, decay, gain, shimmer = 0) => {
  const start = Math.floor(at * SR);
  const len = Math.floor(decay * 1.6 * SR);
  for (let k = 0; k < len && start + k < N; k++) {
    const x = k / SR;
    const env = Math.exp(-x * (3.2 / decay));
    const attack = Math.min(1, x / 0.012);
    let v = (Math.sin(TAU * f1 * x) * 0.7 + Math.sin(TAU * f2 * x) * 0.4) * env * attack * gain;
    if (shimmer) v += (Math.sin(TAU * 880 * x) * 0.5 + Math.sin(TAU * 1318.5 * x) * 0.35) * env * 0.04 * shimmer;
    L[start + k] += v;
    R[start + k] += v;
  }
};
hit(89.5, 38, 57, 3.0, 0.5); // gold line draws
hit(91.7, 36, 54, 5.5, 0.75, 1); // SUPER INTELLECT

// --- Master fade, soft clip, write 16-bit WAV ---
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const f = ramp(t, 0, 2) * (1 - ramp(t, 99.3, 100));
  L[i] = Math.tanh(L[i] * 1.2) * f;
  R[i] = Math.tanh(R[i] * 1.2) * f;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const scale = peak > 0 ? 0.7 / peak : 1; // peak at about -3 dBFS
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(L[i] * scale * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * scale * 32767), 46 + i * 4);
}
fs.mkdirSync('public', {recursive: true});
fs.writeFileSync('public/score.wav', buf);
console.log('score.wav written', (buf.length / 1e6).toFixed(1) + ' MB');
