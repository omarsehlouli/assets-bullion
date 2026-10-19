import {loadFont as loadCondensed} from '@remotion/google-fonts/Oswald';
import type React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, mix, W} from '../kit/theme';

// "The Maker's Edge" runs hotter than the studio films: amber crucible light,
// ember sparks and icy sterling silver against deep shadow.
export const {fontFamily: CONDENSED} = loadCondensed('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});

export const F = {
  black: '#060506',
  coal: '#110d0c',
  amber: '#ff9a3c',
  ember: '#ff5a1f',
  core: '#fff4cf',
  molten: '#ffc04a',
  deep: '#7a1d06',
  ice: '#eef3f8',
  steel: '#9aa4ae',
  red: '#ff3b30',
  ivory: '#f4eedf',
};

export const FORGE_TINT = {key: '255,132,48', rim: '120,150,190', accent: F.amber};
export const COLD_TINT = {key: '170,190,215', rim: '255,120,60', accent: F.ice};

export const MOLTEN_GRADIENT =
  'linear-gradient(100deg,#7a1d06 0%,#d9531a 16%,#ffb347 32%,#fff1c2 44%,#ffc04a 56%,#e0661c 74%,#ffd27a 90%,#a8380d 100%)';
export const ICE_GRADIENT =
  'linear-gradient(100deg,#7d8790 0%,#c9d2db 20%,#ffffff 36%,#d5dde5 50%,#8d969f 64%,#f0f4f8 82%,#98a1aa 100%)';

export const caps = (size: number, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: CONDENSED,
  fontWeight: 600,
  fontSize: size,
  lineHeight: 0.95,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  color: F.ivory,
  ...extra,
});

type Spark = {x: number; speed: number; drift: number; phase: number; life: number; size: number; offset: number};

const SPARKS: Spark[] = Array.from({length: 90}, (_, i) => ({
  x: random(`sx${i}`) * W,
  speed: 1.2 + random(`ss${i}`) * 3.2,
  drift: (random(`sd${i}`) - 0.5) * 60,
  phase: random(`sp${i}`) * Math.PI * 2,
  life: 140 + random(`sl${i}`) * 220,
  size: 1.2 + random(`sz${i}`) ** 3 * 4.5,
  offset: random(`so${i}`) * 400,
}));

// Rising embers. `heat` scales count/brightness; `origin` biases them toward a hot spot.
export const Embers: React.FC<{frame: number; heat?: number; originY?: number; cold?: boolean}> = ({frame, heat = 1, originY = H, cold}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    {SPARKS.map((s, i) => {
      if (i / SPARKS.length > heat) {
        return null;
      }
      const t = ((frame + s.offset) % s.life) / s.life;
      const y = originY + 120 - t * (originY + 260) * (s.speed / 3);
      const x = s.x + Math.sin(frame / 40 + s.phase) * 20 + s.drift * t;
      const flicker = 0.55 + 0.45 * Math.sin(frame / 3 + s.phase * 5);
      const fade = Math.sin(Math.PI * t);
      const color = cold ? '220,232,245' : t < 0.3 ? '255,236,190' : t < 0.65 ? '255,164,70' : '255,90,30';
      return (
        <g key={i} opacity={fade * flicker * mix(0.5, 1, heat)}>
          <line x1={x} y1={y} x2={x - s.drift * 0.02} y2={y + s.size * 6} stroke={`rgba(${color},0.35)`} strokeWidth={s.size} strokeLinecap="round" />
          <circle cx={x} cy={y} r={s.size} fill={`rgb(${color})`} />
          <circle cx={x} cy={y} r={s.size * 4} fill={`rgba(${color},0.12)`} />
        </g>
      );
    })}
  </svg>
);

// A heat-haze displacement filter. Wrap content in `filter: url(#heat-N)`.
export const HeatHaze: React.FC<{frame: number; id: string; strength?: number}> = ({frame, id, strength = 10}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency={`0.006 ${0.022 + 0.004 * Math.sin(frame / 30)}`} numOctaves={2} seed={Math.floor(frame / 2) % 97} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={strength} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);

// Warm or cold light pool for a "set".
export const Pool: React.FC<{x: number; y: number; w: number; h: number; color: string; opacity?: number}> = ({x, y, w, h, color, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      borderRadius: '50%',
      background: `radial-gradient(ellipse at center, rgba(${color},0.42) 0%, rgba(${color},0.12) 42%, rgba(0,0,0,0) 70%)`,
      opacity,
      pointerEvents: 'none',
    }}
  />
);

export const Darkness: React.FC<{opacity: number}> = ({opacity}) => <AbsoluteFill style={{background: '#000', opacity, pointerEvents: 'none'}} />;
