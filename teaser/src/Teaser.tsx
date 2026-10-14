import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type TeaserProps = {vo: string | null};

// ---- Palette: black, white, grey, gold (gold only on positives) ----
const BLACK = '#000000';
const WHITE = '#F2F2F2';
const GREY = '#8C8C8C';
const DIM = '#4A4A4A';
const GOLD = '#C9A24A';

// ---- Helpers ----
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
// opacity window: fade in over [a,b], fade out over [c,d]
const win = (t: number, a: number, b: number, c: number, d: number) =>
  ease(ramp(t, a, b)) * (1 - ease(ramp(t, c, d)));

const font: React.CSSProperties = {
  fontFamily: '"Inter Display","Inter",sans-serif',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const Center: React.FC<{
  children: React.ReactNode;
  opacity: number;
  size: number;
  weight?: number;
  tracking?: number; // em
  color?: string;
  y?: number; // px offset from centre
  scale?: number;
}> = ({children, opacity, size, weight = 200, tracking = 0.4, color = WHITE, y = 0, scale = 1}) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity}}>
    <div
      style={{
        ...font,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: `${tracking}em`,
        paddingLeft: `${tracking}em`, // balance trailing tracking so text is optically centred
        color,
        transform: `translateY(${y}px) scale(${scale})`,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

// ---- Dot grid: abundance made visible ----
const COLS = 49;
const ROWS = 28;
const GAP = 40;
const DotGrid: React.FC<{reveal: number; alpha: number}> = ({reveal, alpha}) => {
  const dots = useMemo(() => {
    const out: {x: number; y: number; d: number}[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = 960 + (c - (COLS - 1) / 2) * GAP;
        const y = 540 + (r - (ROWS - 1) / 2) * GAP;
        out.push({x, y, d: Math.hypot(x - 960, y - 540)});
      }
    }
    return out;
  }, []);
  const maxD = Math.hypot(960, 540);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: alpha}}>
      {dots.map((p, i) => {
        const o = clamp((reveal * 1.12 * maxD - p.d) / (0.12 * maxD));
        return o > 0 ? <circle key={i} cx={p.x} cy={p.y} r={2.6} fill={WHITE} opacity={o * 0.55} /> : null;
      })}
    </svg>
  );
};

// ---- Word grid: intelligence made abundant ----
const WORD_ROWS = 25;
const WordGrid: React.FC<{reveal: number; alpha: number}> = ({reveal, alpha}) => {
  const mid = (WORD_ROWS - 1) / 2;
  return (
    <AbsoluteFill style={{opacity: alpha, overflow: 'hidden'}}>
      {Array.from({length: WORD_ROWS}).map((_, i) => {
        const o = clamp((reveal * (mid + 3) - Math.abs(i - mid)) / 2.5);
        return (
          <div
            key={i}
            style={{
              ...font,
              position: 'absolute',
              top: 40 + i * 41,
              left: i % 2 === 0 ? -80 : -300,
              fontSize: 24,
              fontWeight: 300,
              letterSpacing: '0.3em',
              color: GREY,
              opacity: o * 0.5,
            }}
          >
            {Array.from({length: 9}).map(() => 'Intelligence').join('        ')}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Line: React.FC<{y: number; halfWidth: number; color: string; opacity?: number; h?: number}> = ({
  y,
  halfWidth,
  color,
  opacity = 1,
  h = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 960 - halfWidth,
      width: halfWidth * 2,
      top: y,
      height: h,
      background: color,
      opacity,
    }}
  />
);

export const Teaser: React.FC<TeaserProps> = ({vo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  // ---- 1. Horizon (0.5 - 7.5) ----
  const horizonW = 520 * easeOut(ramp(t, 0.5, 5));
  const horizonA = win(t, 0.5, 2, 6.2, 7.6) * 0.7;

  // ---- 2. SALT (7.8 - 11) ----
  const saltA = win(t, 7.8, 9.4, 10.2, 11.2);
  const saltScale = 1 + 0.05 * ramp(t, 7.8, 11.2);

  // ---- 3. Four words (11.4 - 18) ----
  const w1 = win(t, 11.4, 11.9, 12.7, 13.1); // FOOD
  const w2 = win(t, 13.0, 13.5, 14.3, 14.7); // TRADE ROUTES
  const w3 = win(t, 14.6, 15.1, 15.9, 16.3); // GOVERNMENTS
  const w4 = win(t, 16.2, 16.7, 17.5, 18.2); // REVOLUTIONS

  // ---- 4. Nobody invented it (18.8 - 25.5) ----
  const n1 = win(t, 18.8, 19.8, 21.4, 22.2);
  const n2 = win(t, 22.2, 22.9, 25.0, 25.9);
  const n3 = win(t, 23.8, 24.5, 25.0, 25.9);

  // ---- 5. Find / extract / produce / every home + grid grows (26 - 34) ----
  const f1 = win(t, 26.3, 26.8, 27.6, 28.0);
  const f2 = win(t, 27.9, 28.4, 29.2, 29.6);
  const f3 = win(t, 29.5, 30.0, 30.8, 31.2);
  const f4 = win(t, 31.1, 31.7, 33.4, 34.4);
  const gridReveal = ease(ramp(t, 29.5, 34.2));

  // ---- 6. Ordinary (34.4 - 45) ----
  const o1 = win(t, 35.0, 35.8, 37.6, 38.3); // DIFFICULT TO OBTAIN
  const o2 = win(t, 38.3, 39.0, 40.0, 40.7); // ORDINARY
  const o3 = win(t, 40.7, 41.4, 42.6, 43.2); // STILL ESSENTIAL
  const o4 = win(t, 43.2, 43.9, 44.6, 45.4); // NO LONGER EXCEPTIONAL

  // ---- 7. Abundant -> invisible (45.5 - 55) ----
  const abundantA = win(t, 45.6, 46.8, 49.2, 50.0);
  const invisibleA = win(t, 50.0, 50.8, 51.2, 54.2) ;
  const invisibleFade = 1 - 0.9 * ramp(t, 50.6, 54.2);
  // grid alpha: full through section 6, collapses in section 7
  const gridAlpha =
    ramp(t, 29.5, 31) * (1 - ease(ramp(t, 48.5, 54.5))) * (1 - ease(ramp(t, 54.5, 55.2)));

  // ---- 8. It moves (55.5 - 67) ----
  const moveA = win(t, 56.0, 57.0, 58.0, 58.8);
  const dotIn = ease(ramp(t, 58.6, 59.4));
  const dotY = 540 - 240 * ease(ramp(t, 60.0, 63.0));
  const dotOut = 1 - ease(ramp(t, 65.2, 66.6));
  const layerW = 560 * easeOut(ramp(t, 62.6, 65.2));
  const addA = win(t, 61.6, 62.6, 65.0, 66.4);

  // ---- 9. Intelligence everywhere (67.5 - 78) ----
  const intelA = win(t, 67.5, 68.8, 76.6, 77.8);
  const wgReveal = ease(ramp(t, 69.5, 76.5));
  const wgAlpha = ramp(t, 69.5, 71) * (1 - ease(ramp(t, 77.6, 79.2)));

  // ---- 10. Scarcity drains (78.4 - 84.6) ----
  const scarceP = ramp(t, 79.4, 84.4);
  const scarceA = ease(ramp(t, 78.4, 79.4)) * (1 - ramp(t, 84.4, 84.6));
  const scarceText = scarceA * (1 - 0.85 * scarceP);
  const barW = 320 * (1 - scarceP);

  // ---- 12. Gold layer + SUPER INTELLECT (89.4 - 96) ----
  const goldLineW = 520 * easeOut(ramp(t, 89.5, 92));
  const goldLineA = win(t, 89.5, 90.5, 95.2, 96.2);
  const siA = win(t, 91.6, 93.6, 95.3, 96.3);
  const siScale = 1 + 0.045 * ramp(t, 91.6, 96.3);

  // ---- 13. The question (96.6 - 100) ----
  const qA = win(t, 96.6, 98.0, 99.0, 99.9);

  // Global fade in/out
  const master = ease(ramp(t, 0, 0.8)) * (1 - ease(ramp(t, 99.4, 100)));

  return (
    <AbsoluteFill style={{background: BLACK, opacity: 1}}>
      {vo ? <Audio src={staticFile(vo)} volume={1} /> : null}
      <Audio src={staticFile('score.wav')} volume={vo ? 0.7 : 0.9} />

      <AbsoluteFill style={{opacity: master}}>
        {/* 1 */}
        <Line y={540} halfWidth={horizonW} color={WHITE} opacity={horizonA} />

        {/* 2 */}
        <Center opacity={saltA} size={230} weight={200} tracking={0.5} scale={saltScale}>
          Salt
        </Center>

        {/* 3 */}
        <Center opacity={w1} size={70} weight={300} tracking={0.4}>Food</Center>
        <Center opacity={w2} size={70} weight={300} tracking={0.4}>Trade routes</Center>
        <Center opacity={w3} size={70} weight={300} tracking={0.4}>Governments</Center>
        <Center opacity={w4} size={70} weight={300} tracking={0.4}>Revolutions</Center>

        {/* 4 */}
        <Center opacity={n1} size={78} weight={200} tracking={0.32}>Nobody invented it</Center>
        <Center opacity={n2} size={46} weight={300} tracking={0.4} color={GREY} y={-34}>In the oceans</Center>
        <Center opacity={n3} size={46} weight={300} tracking={0.4} color={GREY} y={34}>Beneath the earth</Center>

        {/* 5 */}
        <DotGrid reveal={gridReveal} alpha={gridAlpha} />
        <Center opacity={f1} size={70} weight={300} tracking={0.4}>Find</Center>
        <Center opacity={f2} size={70} weight={300} tracking={0.4}>Extract</Center>
        <Center opacity={f3} size={70} weight={300} tracking={0.4}>Produce</Center>
        <Center opacity={f4} size={70} weight={300} tracking={0.4}>Every home</Center>

        {/* 6 */}
        <Center opacity={o1} size={62} weight={300} tracking={0.36}>Difficult to obtain</Center>
        <Center opacity={o2} size={62} weight={300} tracking={0.36} color={GREY}>Ordinary</Center>
        <Center opacity={o3} size={62} weight={300} tracking={0.36}>Still essential</Center>
        <Center opacity={o4} size={50} weight={300} tracking={0.36} color={GREY}>No longer exceptional</Center>

        {/* 7 */}
        <Center opacity={abundantA} size={170} weight={200} tracking={0.3} color={GREY}>Abundant</Center>
        <Center opacity={invisibleA * invisibleFade} size={62} weight={200} tracking={0.4} color={DIM}>
          Invisible
        </Center>

        {/* 8 */}
        <Center opacity={moveA} size={96} weight={200} tracking={0.4}>It moves</Center>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <circle cx={960} cy={dotY} r={7} fill={WHITE} opacity={dotIn * dotOut} />
        </svg>
        <Line y={300} halfWidth={layerW} color={WHITE} opacity={0.6 * dotOut * ramp(t, 62.6, 63.4)} />
        <Center opacity={addA} size={34} weight={300} tracking={0.5} color={GREY} y={150}>
          One small addition
        </Center>

        {/* 9 */}
        <WordGrid reveal={wgReveal} alpha={wgAlpha} />
        <Center opacity={intelA} size={124} weight={200} tracking={0.34}>Intelligence</Center>

        {/* 10 */}
        <Center opacity={scarceText} size={96} weight={200} tracking={0.5}>Scarcity</Center>
        <Line y={640} halfWidth={barW} color={WHITE} opacity={scarceA * 0.8} h={2} />

        {/* 12 */}
        <Line y={540} halfWidth={goldLineW} color={GOLD} opacity={goldLineA} h={2} />
        <Center opacity={siA} size={104} weight={200} tracking={0.32} color={GOLD} y={-62} scale={siScale}>
          Super Intellect
        </Center>

        {/* 13 */}
        <Center opacity={qA} size={44} weight={300} tracking={0.5} color={GOLD}>
          Who owns the layer above?
        </Center>
      </AbsoluteFill>

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
