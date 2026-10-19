import type React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {caps} from './Text';
import {C, EASE, LOGO, mix, prog} from './theme';

// Every scene arrives out of a bloom of light and leaves by pushing into it,
// while the camera keeps a slow dolly-in for the whole shot.
export const SceneShell: React.FC<{
  frame: number;
  duration: number;
  first?: boolean;
  last?: boolean;
  dolly?: number;
  children: React.ReactNode;
}> = ({frame, duration, first, last, dolly = 0.035, children}) => {
  const enter = first ? 1 - prog(frame, 0, 40, EASE.out) : 1 - prog(frame, 0, 28, EASE.out);
  const exit = last ? 0 : prog(frame, duration - 14, 14, EASE.in);
  const drift = (frame / Math.max(1, duration)) * dolly;
  const scale = 1 + drift + (first ? enter * 0.04 : enter * 0.07) + exit * 0.08;
  const blur = first ? enter * 6 : enter * 12 + exit * 12;
  const bright = first ? 1 - enter * 0.7 : 1 + enter * 0.8 + exit * 0.9;
  return (
    <AbsoluteFill
      style={{
        scale: String(scale),
        filter: blur > 0.1 || Math.abs(bright - 1) > 0.01 ? `blur(${blur}px) brightness(${bright})` : undefined,
        opacity: first ? 1 - enter : Math.min(1, prog(frame, 0, 8, EASE.out)) * (1 - exit * 0.7),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Light that blooms across every cut: a warm wash, an anamorphic streak and a
// diagonal glint.
export const CutFlare: React.FC<{frame: number; cuts: number[]; tint: string}> = ({frame, cuts, tint}) => {
  const nearest = cuts.reduce((best, c) => (Math.abs(frame - c) < Math.abs(frame - best) ? c : best), -9999);
  const d = frame - nearest;
  if (Math.abs(d) > 24) {
    return null;
  }
  const f = Math.exp(-((d / 7) ** 2));
  const sweep = mix(-0.4, 1.4, (d + 24) / 48);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 40% at 50% 46%, rgba(${tint},${0.5 * f}) 0%, rgba(${tint},${0.16 * f}) 45%, rgba(0,0,0,0) 75%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -100,
          right: -100,
          top: 880 - 60,
          height: 120,
          background: `linear-gradient(90deg, rgba(0,0,0,0), rgba(${tint},${0.55 * f}) 30%, rgba(255,250,235,${0.9 * f}) 50%, rgba(${tint},${0.55 * f}) 70%, rgba(0,0,0,0))`,
          maskImage: 'linear-gradient(180deg, transparent 0%, black 48%, black 52%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 48%, black 52%, transparent 100%)',
          transform: `scaleX(${0.6 + f * 0.6})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -600,
          top: -400,
          width: 500,
          height: 3000,
          rotate: '24deg',
          translate: `${sweep * 2200}px 0`,
          background: `linear-gradient(90deg, rgba(0,0,0,0), rgba(255,244,214,${0.28 * f}), rgba(0,0,0,0))`,
        }}
      />
    </AbsoluteFill>
  );
};

// The house mark, set like a letterhead.
export const Masthead: React.FC<{frame: number; hideAt: number}> = ({frame, hideAt}) => {
  const p = prog(frame, 8, 50);
  const q = prog(frame, hideAt - 16, 16, EASE.in);
  const line = (flip: boolean): React.CSSProperties => ({
    width: 110 * p,
    height: 1,
    background: 'linear-gradient(90deg, rgba(212,175,55,0), rgba(212,175,55,0.75))',
    transform: flip ? 'scaleX(-1)' : undefined,
  });
  return (
    <div
      style={{
        position: 'absolute',
        top: 106,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        opacity: p * (1 - q),
        translate: `0 ${(1 - p) * -12}px`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
        <div style={line(false)} />
        <Img src={LOGO} style={{width: 220, height: (220 * 84) / 294, opacity: 0.95}} />
        <div style={line(true)} />
      </div>
      <div style={caps(15, {letterSpacing: `${mix(0.7, 0.46, p)}em`, color: C.mute})}>New York · Since 2008</div>
    </div>
  );
};
