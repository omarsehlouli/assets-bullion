import type React from 'react';
import {Img} from 'remotion';
import {caps, italic} from './Text';
import {art, C, EASE, LOGO, mix, prog, SANS} from './theme';

// Shared set pieces used by more than one film.

type Building = [x: number, w: number, h: number];

const BLOCKS: Building[] = [
  [0, 64, 120], [64, 52, 176], [116, 78, 138], [194, 58, 214], [252, 92, 160],
  [450, 58, 192], [508, 72, 252], [580, 56, 178],
  [702, 78, 172], [780, 62, 226], [842, 88, 150], [930, 72, 204], [1002, 78, 128],
];

// A Midtown skyline silhouette, drawn as one continuous gold contour with the
// Empire State and Chrysler buildings as landmarks.
const skylinePath = (base: number) => {
  const pts: [number, number][] = [[0, base]];
  const add = (x: number, y: number) => pts.push([x, y]);
  const block = ([x, w, h]: Building) => {
    add(x, base - h);
    add(x + w, base - h);
  };
  BLOCKS.slice(0, 5).forEach(block);
  // Empire State: setbacks, tower and mast.
  [[344, 228], [362, 228], [362, 288], [378, 288], [378, 338], [389, 338], [389, 368], [397, 368], [397, 424], [403, 424], [403, 368], [411, 368], [411, 338], [422, 338], [422, 288], [438, 288], [438, 228], [450, 228]].forEach(
    ([x, h]) => add(x, base - h),
  );
  BLOCKS.slice(5, 8).forEach(block);
  // Chrysler: stepped crown and needle.
  [[636, 246], [648, 246], [648, 284], [654, 284], [656, 306], [661, 296], [664, 322], [668, 312], [670, 344], [671, 404], [673, 404], [674, 344], [676, 312], [680, 322], [683, 296], [688, 306], [690, 284], [696, 284], [696, 246], [702, 246]].forEach(([x, h]) =>
    add(x, base - h),
  );
  BLOCKS.slice(8).forEach(block);
  add(1080, base);
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
};

const WINDOWS = Array.from({length: 46}, (_, i) => {
  const b = BLOCKS[i % BLOCKS.length];
  const col = (i * 37) % Math.max(1, b[1] - 16);
  const row = (i * 53) % Math.max(1, b[2] - 30);
  return {x: b[0] + 8 + col, y: row + 24, phase: (i * 1.7) % 6.28};
});

export const Skyline: React.FC<{frame: number; at: number; y: number; scale?: number; opacity?: number}> = ({frame, at, y, scale = 1, opacity = 1}) => {
  const base = 430;
  const draw = prog(frame, at, 70, EASE.inOut);
  return (
    <svg
      width={1080}
      height={base + 10}
      viewBox={`0 0 1080 ${base + 10}`}
      style={{position: 'absolute', left: 0, top: y, overflow: 'visible', opacity, scale: String(scale)}}
    >
      <defs>
        <linearGradient id="sky-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4af37" stopOpacity="0.16" />
          <stop offset="1" stopColor="#d4af37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${skylinePath(base)} Z`} fill="url(#sky-fill)" opacity={prog(frame, at + 40, 50)} />
      <path
        d={skylinePath(base)}
        fill="none"
        stroke="#e2c46c"
        strokeWidth={2.2}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        style={{filter: 'drop-shadow(0 0 8px rgba(226,196,108,0.55))'}}
      />
      {WINDOWS.map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={base - w.y}
          width={4}
          height={6}
          fill="#f6e3a1"
          opacity={prog(frame, at + 50 + (i % 12) * 3, 20) * (0.35 + 0.4 * (0.5 + 0.5 * Math.sin(frame / 24 + w.phase)))}
        />
      ))}
      <line x1={0} y1={base} x2={1080} y2={base} stroke="#d4af37" strokeOpacity={0.5} strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    </svg>
  );
};

// A refined phone showing the online catalogue.
export const Phone: React.FC<{
  frame: number;
  x: number;
  y: number;
  turn?: number;
  scale?: number;
  opacity?: number;
  scroll?: number;
  items: {src: string; label: string; at: number}[];
}> = ({frame, x, y, turn = -14, scale = 1, opacity = 1, scroll = 0, items}) => {
  const w = 430;
  const h = 880;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, perspective: 1600, opacity, scale: String(scale)}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `rotateY(${turn}deg) rotateX(4deg)`,
          borderRadius: 64,
          background: 'linear-gradient(145deg, #2c2a26, #0d0d10 40%, #1d1c1a)',
          boxShadow: '0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(255,240,210,0.16), inset 0 0 0 12px #050506',
          padding: 14,
          boxSizing: 'border-box',
        }}
      >
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 52, overflow: 'hidden', background: '#0c0c0f'}}>
          <div style={{position: 'absolute', top: 16, left: '50%', translate: '-50% 0', width: 110, height: 30, borderRadius: 20, background: '#000', zIndex: 3}} />
          <div style={{position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 2}}>
            <Img src={LOGO} style={{width: 150, height: (150 * 84) / 294}} />
          </div>
          <div style={{position: 'absolute', top: 124, left: 24, right: 24, height: 1, background: 'rgba(212,175,55,0.35)', zIndex: 2}} />
          <div style={{position: 'absolute', top: 140 - scroll, left: 22, right: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
            {items.map((item, i) => {
              const p = prog(frame, item.at, 30);
              return (
                <div
                  key={i}
                  style={{
                    height: 230,
                    borderRadius: 22,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
                    border: '1px solid rgba(255,240,210,0.08)',
                    position: 'relative',
                    opacity: p,
                    translate: `0 ${(1 - p) * 30}px`,
                  }}
                >
                  <Img src={art(item.src)} style={{position: 'absolute', left: 18, right: 18, top: 16, height: 150, width: 'calc(100% - 36px)', objectFit: 'contain'}} />
                  <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center', fontFamily: SANS, fontSize: 17, fontWeight: 500, letterSpacing: '0.12em', color: C.champagne, textTransform: 'uppercase'}}>
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(125deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 32%)', pointerEvents: 'none'}} />
        </div>
      </div>
    </div>
  );
};

// Concentric map pin used for the Diamond District.
export const Pin: React.FC<{frame: number; at: number; x: number; y: number; size?: number}> = ({frame, at, x, y, size = 1}) => {
  const p = prog(frame, at, 30, EASE.out);
  const ring = ((Math.max(0, frame - at) % 70) / 70);
  return (
    <svg width={300} height={300} viewBox="-150 -150 300 300" style={{position: 'absolute', left: x - 150, top: y - 150, overflow: 'visible', scale: String(size)}}>
      <circle r={30 + ring * 110} fill="none" stroke="#e2c46c" strokeWidth={2} opacity={(1 - ring) * 0.6 * p} />
      <circle r={30 + ((ring + 0.5) % 1) * 110} fill="none" stroke="#e2c46c" strokeWidth={1.5} opacity={(1 - ((ring + 0.5) % 1)) * 0.4 * p} />
      <g transform={`translate(0 ${(1 - p) * -60}) scale(${p})`}>
        <path d="M0 6C-12 -14 -32 -30 -32 -54a32 32 0 1 1 64 0C32 -30 12 -14 0 6Z" fill="url(#pin-gold)" stroke="#fff3c8" strokeOpacity={0.5} />
        <circle cy={-54} r={11} fill="#0b0b0e" />
      </g>
      <defs>
        <linearGradient id="pin-gold" x1="0" y1="-90" x2="0" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f7e7b0" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#8a6a1f" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// A word that lights up in sequence inside a list (Hold / Admire / Remember).
export const Litany: React.FC<{frame: number; items: {text: string; at: number}[]; y: number; size?: number}> = ({frame, items, y, size = 96}) => {
  const active = items.reduce((idx, item, i) => (frame >= item.at ? i : idx), -1);
  return (
    <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 34, alignItems: 'baseline'}}>
      {items.map((item, i) => {
        const p = prog(frame, item.at, 30);
        const on = i === active;
        return (
          <div key={item.text} style={{display: 'flex', alignItems: 'baseline', gap: 34}}>
            <div
              style={italic(size, {
                color: on ? C.goldLight : C.ivory,
                opacity: mix(0.0, on ? 1 : 0.42, p),
                filter: `blur(${(1 - p) * 10}px)`,
                translate: `0 ${(1 - p) * 30}px`,
                textShadow: on ? '0 0 30px rgba(212,175,55,0.5)' : undefined,
              })}
            >
              {item.text}
            </div>
            {i < items.length - 1 ? <div style={caps(18, {opacity: p * 0.6})}>·</div> : null}
          </div>
        );
      })}
    </div>
  );
};
