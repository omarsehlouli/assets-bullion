import type React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {EASE, mix, prog} from '../kit/theme';
import {Beads, Falling, type Faller, GrainDefs, pile, stream} from './Grain';

// The macro money shot: a steel scoop plunges into a mountain of silver
// grain, lifts a heap and pours it back in a slow-motion cascade.

const PILE = {cx: 540, base: 1460, width: 1560, height: 450};
const surface = (x: number) => {
  const dx = (x - PILE.cx) / (PILE.width / 2);
  return PILE.base - PILE.height * Math.max(0, 1 - dx * dx) ** 0.75;
};

const GRAINS = pile('scoop-pile', {cx: PILE.cx, base: PILE.base, width: PILE.width, height: PILE.height, count: 600, rMin: 15, rMax: 34, perspective: 0.85});
const CUT = 1125;
const BACK_FAR = GRAINS.filter((g) => g.y < 1060);
const BACK = GRAINS.filter((g) => g.y >= 1060 && g.y < CUT);
const FRONT = GRAINS.filter((g) => g.y >= CUT && g.y < 1330);
const NEAR = GRAINS.filter((g) => g.y >= 1330);

const SCALE = 0.76;

const rot = (x: number, y: number, deg: number) => {
  const r = (deg * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)] as const;
};

type Pose = {x: number; y: number; a: number};

// Keyframes relative to the plunge frame P.
const KEYS: [number, Pose][] = [
  [-46, {x: 1180, y: 560, a: -24}],
  [-8, {x: 640, y: 930, a: -30}],
  [10, {x: 470, y: 1150, a: -38}],
  [40, {x: 445, y: 1168, a: -22}],
  [86, {x: 600, y: 800, a: 12}],
  [106, {x: 565, y: 890, a: -44}],
  [205, {x: 545, y: 900, a: -48}],
  [255, {x: 590, y: 900, a: -10}],
];

const pose = (t: number): Pose => {
  if (t <= KEYS[0][0]) {
    return KEYS[0][1];
  }
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [t0, p0] = KEYS[i];
    const [t1, p1] = KEYS[i + 1];
    if (t <= t1) {
      const k = prog(t, t0, t1 - t0, i === 1 ? EASE.in : EASE.inOut);
      return {x: mix(p0.x, p1.x, k), y: mix(p0.y, p1.y, k), a: mix(p0.a, p1.a, k)};
    }
  }
  return KEYS[KEYS.length - 1][1];
};

const lip = (p: Pose) => {
  const [dx, dy] = rot(0, 80 * SCALE, p.a);
  return {x: p.x + dx, y: p.y + dy};
};

// A steel grain scoop seen from slightly above: a half-pipe trough with its
// open top visible, a rolled lip at the mouth and a riveted handle.
const Scoop: React.FC<{p: Pose; loaded: number; frame: number}> = ({p, loaded, frame}) => {
  const outer = 'M0 -60 C 40 -86, 200 -92, 300 -54 C 332 -36, 336 30, 300 52 C 230 92, 90 98, 0 86 Z';
  const opening = 'M2 -58 C 50 -82, 205 -86, 296 -50 C 262 -28, 120 -20, 8 -34 Z';
  const heap = pile('scoop-load', {cx: 140, base: -26, width: 260, height: 70, count: 34, rMin: 12, rMax: 22, perspective: 0});
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.a}) scale(${SCALE})`}>
      <defs>
        <linearGradient id="sc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9edf1" />
          <stop offset="0.3" stopColor="#a7afb7" />
          <stop offset="0.62" stopColor="#59616a" />
          <stop offset="0.88" stopColor="#24282d" />
          <stop offset="1" stopColor="#4d555e" />
        </linearGradient>
        <linearGradient id="sc-inside" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d0f11" />
          <stop offset="0.7" stopColor="#2b3036" />
          <stop offset="1" stopColor="#6c747d" />
        </linearGradient>
        <linearGradient id="sc-handle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9dee3" />
          <stop offset="0.5" stopColor="#5f666e" />
          <stop offset="1" stopColor="#1c1f23" />
        </linearGradient>
        <clipPath id="sc-open-clip">
          <path d={opening} />
        </clipPath>
      </defs>
      <path d="M298 -6 L520 -30 Q546 -30 546 -8 L546 8 Q546 28 520 26 L298 18 Z" fill="url(#sc-handle)" stroke="#0b0c0e" strokeWidth={2} />
      <path d="M318 -2 L520 -22" stroke="rgba(255,255,255,0.45)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={536} cy={-1} r={8} fill="#0b0c0e" />
      <path d={outer} fill="url(#sc-body)" stroke="#0b0c0e" strokeWidth={2} />
      <path d="M10 60 C 100 80, 220 74, 292 40" fill="none" stroke="rgba(255,170,90,0.4)" strokeWidth={4} strokeLinecap="round" />
      <path d={opening} fill="url(#sc-inside)" />
      {loaded > 0.02 ? (
        <g clipPath="url(#sc-open-clip)" opacity={loaded}>
          <Beads grains={heap} metal="silver" frame={frame} prefix="scl" shadow={false} />
        </g>
      ) : null}
      <path d="M2 -58 C 50 -82, 205 -86, 296 -50" fill="none" stroke="#f4f7fa" strokeWidth={5} strokeLinecap="round" />
      <path d="M8 -34 C 120 -20, 262 -28, 296 -50" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
      {/* Rolled lip at the mouth */}
      <path d="M2 -58 C -14 -20, -14 50, 0 86" fill="none" stroke="#dfe4e9" strokeWidth={8} strokeLinecap="round" />
      <path d="M2 -58 C -14 -20, -14 50, 0 86" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={2} strokeLinecap="round" transform="translate(5 0)" />
      {[60, 150, 240].map((x) => (
        <circle key={x} cx={x} cy={58 + Math.sin(x) * 2} r={3.5} fill="#cfd5db" stroke="#1a1d20" strokeWidth={1} />
      ))}
    </g>
  );
};

const splashFallers = (P: number): Faller[] =>
  stream('scoop-splash', {count: 90, start: P + 2, duration: 12, x: 455, y: 1060, spread: 150, vx: 0, vxJitter: 5.5, vy: 0, rMin: 9, rMax: 22}).map((f, i) => ({
    ...f,
    vy: -5 - random(`spl${i}`) * 8,
  }));

const pourFallers = (P: number): Faller[] =>
  stream('scoop-pour', {count: 420, start: P + 96, duration: 108, x: 0, y: 0, spread: 34, vx: -0.75, vxJitter: 0.6, vy: 0.4, rMin: 9, rMax: 18}).map((f) => {
    const at = lip(pose(f.t0 - P));
    return {...f, x0: f.x0 + at.x, y0: f.y0 + at.y};
  });

export const ScoopShot: React.FC<{frame: number; plunge: number}> = ({frame, plunge}) => {
  const P = plunge;
  const t = frame - P;
  const p = pose(t);
  const loaded = prog(t, 30, 20) * (1 - prog(t, 96, 90));
  const heap = prog(frame, P + 120, 120, EASE.out) * 48;
  const land = (x: number) => surface(x) - heap * Math.exp(-(((x - 545) / 80) ** 2)) + 7 * Math.sin(x * 0.37) + 5 * Math.sin(x * 1.13) - 6;
  const splash = splashFallers(P);
  const pour = pourFallers(P);
  const svg = (prefix: string, children: React.ReactNode, style?: React.CSSProperties) => (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>
      <GrainDefs prefix={prefix} />
      {children}
    </svg>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 28% 30%, #1d2228 0%, #0c0e10 55%, #050506 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 35% at 85% 85%, rgba(255,140,60,0.22), rgba(0,0,0,0) 70%)'}} />
      {svg('scf', <Beads grains={BACK_FAR} metal="silver" frame={frame} prefix="scf" />, {filter: 'blur(1.6px) brightness(0.8)'})}
      {svg('scb', <Beads grains={BACK} metal="silver" frame={frame} prefix="scb" />)}
      {svg(
        'scs',
        <>
          <Scoop p={p} loaded={loaded} frame={frame} />
          <Falling fallers={pour} frame={frame} metal="silver" gravity={0.3} land={land} prefix="scs" />
        </>,
      )}
      {svg('scr', <Beads grains={FRONT} metal="silver" frame={frame} prefix="scr" />)}
      {svg('scp', <Falling fallers={splash} frame={frame} metal="silver" gravity={0.42} land={land} prefix="scp" />)}
      {svg('scn', <Beads grains={NEAR} metal="silver" frame={frame} prefix="scn" />, {filter: 'blur(3px)'})}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,5,6,0) 62%, rgba(5,5,6,0.75) 82%, rgba(5,5,6,0.95) 100%)'}} />
    </AbsoluteFill>
  );
};
