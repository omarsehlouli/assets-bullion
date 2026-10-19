import type React from 'react';
import {random} from 'remotion';

// Procedural casting grain: small, irregular, shaded metal beads. Used for
// piles, jars, falling cascades and the quench. Render inside an <svg> that
// includes <GrainDefs/> once.

export type Metal = 'silver' | 'gold' | 'platinum';

const STOPS: Record<Metal, [string, string, string, string, string]> = {
  silver: ['#ffffff', '#eef2f6', '#b5bdc6', '#68707a', '#262a2f'],
  gold: ['#fff8dc', '#ffe08a', '#dca52b', '#8a5b10', '#352205'],
  platinum: ['#fbfcfd', '#dde2e6', '#9fa5ab', '#5a5f65', '#25272a'],
};

const FOCI = [
  [0.34, 0.3],
  [0.42, 0.26],
  [0.28, 0.38],
];

export const GrainDefs: React.FC<{prefix?: string}> = ({prefix = 'g'}) => (
  <defs>
    {(Object.keys(STOPS) as Metal[]).map((metal) =>
      FOCI.map(([fx, fy], v) => (
        <radialGradient key={`${metal}${v}`} id={`${prefix}-${metal}-${v}`} cx="45%" cy="42%" r="62%" fx={fx} fy={fy}>
          <stop offset="0" stopColor={STOPS[metal][0]} />
          <stop offset="0.16" stopColor={STOPS[metal][1]} />
          <stop offset="0.48" stopColor={STOPS[metal][2]} />
          <stop offset="0.8" stopColor={STOPS[metal][3]} />
          <stop offset="1" stopColor={STOPS[metal][4]} />
        </radialGradient>
      )),
    )}
    <radialGradient id={`${prefix}-hot`} cx="45%" cy="42%" r="62%" fx={0.36} fy={0.32}>
      <stop offset="0" stopColor="#fffbe6" />
      <stop offset="0.3" stopColor="#ffd56b" />
      <stop offset="0.65" stopColor="#ff7a1f" />
      <stop offset="1" stopColor="#6e1a05" />
    </radialGradient>
    <radialGradient id={`${prefix}-shadow`} cx="50%" cy="50%" r="50%">
      <stop offset="0" stopColor="#000" stopOpacity="0.75" />
      <stop offset="1" stopColor="#000" stopOpacity="0" />
    </radialGradient>
  </defs>
);

export type Grain = {x: number; y: number; r: number; ratio: number; rot: number; variant: number; glint: number; metal?: Metal};

// A mound of grain, sorted back-to-front so nearer beads overlap farther ones.
export const pile = (
  seed: string,
  {cx, base, width, height, count, rMin = 7, rMax = 15, perspective = 0.5}: {cx: number; base: number; width: number; height: number; count: number; rMin?: number; rMax?: number; perspective?: number},
): Grain[] => {
  const grains: Grain[] = [];
  for (let i = 0; i < count; i++) {
    const u = random(`${seed}u${i}`) * 2 - 1;
    const dx = Math.sign(u) * Math.abs(u) ** 0.8;
    const top = base - height * Math.max(0, 1 - dx * dx) ** 0.75;
    const v = random(`${seed}v${i}`) ** 0.7;
    const y = top + (base - top) * v;
    const depth = (y - (base - height)) / Math.max(1, height);
    const r = (rMin + random(`${seed}r${i}`) * (rMax - rMin)) * (1 - perspective * 0.5 + perspective * depth);
    grains.push({
      x: cx + dx * width * 0.5,
      y,
      r,
      ratio: 0.68 + random(`${seed}q${i}`) * 0.32,
      rot: random(`${seed}t${i}`) * 180,
      variant: Math.floor(random(`${seed}k${i}`) * 3),
      glint: random(`${seed}g${i}`),
    });
  }
  return grains.sort((a, b) => a.y - b.y);
};

// A loose layer filling a rectangle (jar contents, trays).
export const fill = (seed: string, {x, y, w, h, count, rMin = 6, rMax = 12}: {x: number; y: number; w: number; h: number; count: number; rMin?: number; rMax?: number}): Grain[] =>
  Array.from({length: count}, (_, i) => ({
    x: x + random(`${seed}x${i}`) * w,
    y: y + random(`${seed}y${i}`) * h,
    r: rMin + random(`${seed}r${i}`) * (rMax - rMin),
    ratio: 0.7 + random(`${seed}q${i}`) * 0.3,
    rot: random(`${seed}t${i}`) * 180,
    variant: Math.floor(random(`${seed}k${i}`) * 3),
    glint: random(`${seed}g${i}`),
  })).sort((a, b) => a.y - b.y);

export const Bead: React.FC<{g: Grain; metal: Metal; frame: number; prefix?: string; heat?: number; shadow?: boolean; sparkle?: number}> = ({
  g,
  metal,
  frame,
  prefix = 'g',
  heat = 0,
  shadow = true,
  sparkle = 1,
}) => {
  const m = g.metal ?? metal;
  // Glints travel across the pile as if a light were moving.
  const tw = Math.max(0, Math.sin(frame / 14 + g.glint * 40)) ** 12 * sparkle;
  return (
    <g transform={`translate(${g.x} ${g.y}) rotate(${g.rot})`}>
      {shadow ? <ellipse cx={g.r * 0.18} cy={g.r * 0.32} rx={g.r * 1.05} ry={g.r * g.ratio * 1.05} fill={`url(#${prefix}-shadow)`} /> : null}
      <ellipse rx={g.r} ry={g.r * g.ratio} fill={`url(#${prefix}-${m}-${g.variant})`} />
      {heat > 0.01 ? <ellipse rx={g.r} ry={g.r * g.ratio} fill={`url(#${prefix}-hot)`} opacity={heat} /> : null}
      <ellipse cx={-g.r * 0.32} cy={-g.r * 0.3 * g.ratio} rx={g.r * 0.28} ry={g.r * 0.16} fill="#fff" opacity={0.55 + tw * 0.45} />
      {tw > 0.2 ? (
        <path
          d={`M${-g.r * 0.32 - g.r * 1.6 * tw} ${-g.r * 0.3 * g.ratio} H${-g.r * 0.32 + g.r * 1.6 * tw} M${-g.r * 0.32} ${-g.r * 0.3 * g.ratio - g.r * 1.6 * tw} V${-g.r * 0.3 * g.ratio + g.r * 1.6 * tw}`}
          stroke="#fff"
          strokeWidth={1.2}
          opacity={tw}
          transform={`rotate(${-g.rot} ${-g.r * 0.32} ${-g.r * 0.3 * g.ratio})`}
        />
      ) : null}
    </g>
  );
};

export const Beads: React.FC<{grains: Grain[]; metal: Metal; frame: number; prefix?: string; shadow?: boolean; reveal?: number; sparkle?: number}> = ({
  grains,
  metal,
  frame,
  prefix = 'g',
  shadow = true,
  reveal = 1,
  sparkle = 1,
}) => (
  <g>
    {grains.slice(0, Math.round(grains.length * reveal)).map((g, i) => (
      <Bead key={i} g={g} metal={metal} frame={frame} prefix={prefix} shadow={shadow} sparkle={sparkle} />
    ))}
  </g>
);

// Falling grain with gravity, landing on a surface y = land(x).
export type Faller = {t0: number; x0: number; y0: number; vx: number; vy: number; g: Grain};

export const stream = (
  seed: string,
  {count, start, duration, x, y, spread = 20, vx = 0, vxJitter = 1.5, vy = 0, rMin = 6, rMax = 12}: {count: number; start: number; duration: number; x: number; y: number; spread?: number; vx?: number; vxJitter?: number; vy?: number; rMin?: number; rMax?: number},
): Faller[] =>
  Array.from({length: count}, (_, i) => ({
    t0: start + random(`${seed}s${i}`) * duration,
    x0: x + (random(`${seed}x${i}`) - 0.5) * spread,
    y0: y + (random(`${seed}y${i}`) - 0.5) * spread * 0.4,
    vx: vx + (random(`${seed}vx${i}`) - 0.5) * vxJitter * 2,
    vy: vy + (random(`${seed}vy${i}`) - 0.5) * 1.5,
    g: {
      x: 0,
      y: 0,
      r: rMin + random(`${seed}r${i}`) * (rMax - rMin),
      ratio: 0.7 + random(`${seed}q${i}`) * 0.3,
      rot: random(`${seed}t${i}`) * 180,
      variant: Math.floor(random(`${seed}k${i}`) * 3),
      glint: random(`${seed}g${i}`),
    },
  }));

export const Falling: React.FC<{
  fallers: Faller[];
  frame: number;
  metal: Metal;
  gravity?: number;
  land: (x: number) => number;
  prefix?: string;
  heat?: (age: number) => number;
}> = ({fallers, frame, metal, gravity = 0.55, land, prefix = 'g', heat}) => (
  <g>
    {fallers.map((f, i) => {
      const age = frame - f.t0;
      if (age < 0) {
        return null;
      }
      const x = f.x0 + f.vx * age;
      let y = f.y0 + f.vy * age + 0.5 * gravity * age * age;
      const floor = land(x);
      let settled = false;
      if (y > floor) {
        y = floor;
        settled = true;
      }
      const spin = settled ? 0 : age * 6;
      return (
        <Bead
          key={i}
          g={{...f.g, x, y, rot: f.g.rot + spin}}
          metal={metal}
          frame={frame}
          prefix={prefix}
          shadow={settled}
          heat={heat ? heat(age) : 0}
        />
      );
    })}
  </g>
);
