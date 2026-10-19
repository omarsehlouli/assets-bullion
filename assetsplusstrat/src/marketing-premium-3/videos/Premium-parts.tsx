import type React from 'react';
import {random} from 'remotion';
import {C, SANS} from '../../marketing-premium/kit/theme';

// Shared drawing pieces for FAQ 04 (how much over spot).

// Illustrative live trace — a shape only, never figures.
export const trace = (seed: string, n: number, frame: number, speed = 0.4) =>
  Array.from({length: n}, (_, i) => {
    const t = i / (n - 1);
    const a = random(`${seed}a`) * 6;
    const k = frame * speed * 0.01;
    return 0.5 - 0.1 * t + 0.11 * Math.sin(t * 9 + a + k) + 0.06 * Math.sin(t * 23 + a * 2 - k * 1.7) + 0.03 * Math.sin(t * 57 + a * 3 + k * 2.3);
  });

export const LiveDot: React.FC<{frame: number; color?: string; size?: number}> = ({frame, color = '233,199,102', size = 12}) => {
  const pulse = (frame % 50) / 50;
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `rgb(${color})`,
        boxShadow: `0 0 0 ${pulse * size}px rgba(${color},${0.4 * (1 - pulse)}), 0 0 12px rgba(${color},0.8)`,
      }}
    />
  );
};

export const Glass: React.FC<{x: number; y: number; w: number; h: number; opacity?: number; lit?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  opacity = 1,
  lit = 0,
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 28,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))',
      boxShadow: `inset 0 0 0 1px rgba(255,240,210,${0.12 + lit * 0.35}), 0 40px 80px rgba(0,0,0,0.5), 0 0 ${lit * 50}px rgba(212,175,55,${lit * 0.18})`,
      opacity,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

// A gold bracket that spans a premium gap, labelled on its side.
export const Bracket: React.FC<{x: number; top: number; bottom: number; label?: string; side?: 'left' | 'right'; opacity?: number}> = ({
  x,
  top,
  bottom,
  label = 'Premium',
  side = 'right',
  opacity = 1,
}) => {
  const h = Math.max(0, bottom - top);
  const dir = side === 'right' ? 1 : -1;
  return (
    <div style={{position: 'absolute', left: x, top, height: h, width: 0, opacity}}>
      <svg width={40} height={Math.max(1, h)} style={{position: 'absolute', left: side === 'right' ? 0 : -40, top: 0, overflow: 'visible'}}>
        <path
          d={side === 'right' ? `M0 0 H18 V${h} H0` : `M40 0 H22 V${h} H40`}
          fill="none"
          stroke="#e2c46c"
          strokeWidth={2.5}
          style={{filter: 'drop-shadow(0 0 6px rgba(226,196,108,0.6))'}}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: h / 2 - 14,
          left: dir > 0 ? 34 : undefined,
          right: dir < 0 ? 34 : undefined,
          whiteSpace: 'nowrap',
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 20,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: C.champagne,
        }}
      >
        {label}
      </div>
    </div>
  );
};
