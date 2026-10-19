import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import React, {useMemo} from 'react';
import {AbsoluteFill, Img, interpolate} from 'remotion';
import {paginate} from '../marketing-premium/kit/Captions';
import {EASE, LOGO, mix, prog, SANS, type ScheduleScene} from '../marketing-premium/kit/theme';

// The "What's inside?" kit: a dark evidence-room HUD. Teal is what looks safe,
// red is danger and loss, steel is tungsten, cream is paper, and gold belongs
// to Bullion Trading alone (the caption pill, the replay and the end card).

export const {fontFamily: MONO} = loadMono('normal', {weights: ['400', '500', '700'], subsets: ['latin']});

export const K = {
  bg: '#07070a',
  panel: 'rgba(16,17,21,0.94)',
  edge: 'rgba(255,255,255,0.09)',
  text: '#f3f1ec',
  mute: 'rgba(243,241,236,0.56)',
  faint: 'rgba(243,241,236,0.16)',
  gold: '#d4af37',
  goldLight: '#f6e3a1',
  goldDeep: '#8a6a1f',
  red: '#e5484d',
  teal: '#4fd1c5',
  steel: '#8e98a4',
  steelDeep: '#3d444c',
  paper: '#efe8d8',
  ink: '#1d1b17',
  inkMute: 'rgba(29,27,23,0.55)',
};

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};

export const BAR_GOLD =
  'linear-gradient(135deg,#7d5f1a 0%,#c9a246 16%,#f7e7b0 30%,#d8b250 44%,#9c7726 60%,#e9cc78 78%,#a98429 100%)';
const STEEL_CORE =
  'repeating-linear-gradient(45deg,rgba(255,255,255,0.06) 0 2px,rgba(0,0,0,0) 2px 10px),linear-gradient(160deg,#69727c,#353b42 55%,#4f565e)';
// A freshly cut gold face: brushed, brighter and warmer than the minted surface.
const GOLD_CORE =
  'repeating-linear-gradient(90deg,rgba(255,255,255,0.12) 0 1px,rgba(0,0,0,0) 1px 5px),linear-gradient(160deg,#fff3c4,#f0c95a 35%,#b8861f 70%,#ffe08a)';

export const SERIAL = 'AU-204417';
export const PAID = 3965;
// Where the carried bar tag rests between moves.
export const TAG = {x: 64, y: 1236};

const mono = (size: number, style: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  fontWeight: 500,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  ...style,
});

export const sans = (size: number, style: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SANS,
  fontSize: size,
  fontWeight: 600,
  letterSpacing: '-0.02em',
  lineHeight: 1.08,
  color: K.text,
  ...style,
});

export {mono};

export const money = (n: number, cents = false) =>
  '$' + n.toLocaleString('en-US', {minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0});

// Dot-grid floor with a slow drift and an optional coloured key light.
export const Backdrop: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{backgroundColor: K.bg}}>
    <AbsoluteFill
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.075) 1.3px, rgba(0,0,0,0) 1.8px)',
        backgroundSize: '32px 32px',
        backgroundPosition: `${(frame * 0.08) % 32}px ${(frame * 0.15) % 32}px`,
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, black 20%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, black 20%, transparent 85%)',
      }}
    />
  </AbsoluteFill>
);

export const Glow: React.FC<{color: string; amount: number; y?: number; size?: number}> = ({color, amount, y = 46, size = 70}) =>
  amount > 0.001 ? (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(ellipse ${size}% ${size * 0.62}% at 50% ${y}%, ${rgba(color, 0.32 * amount)} 0%, ${rgba(color, 0.1 * amount)} 45%, rgba(0,0,0,0) 78%)`,
      }}
    />
  ) : null;

// Scenes push in out of a blur and recede into one, like the reference's zoom-throughs.
export const StoryShell: React.FC<{frame: number; duration: number; first?: boolean; last?: boolean; children: React.ReactNode}> = ({
  frame,
  duration,
  first,
  last,
  children,
}) => {
  const enter = 1 - prog(frame, 0, first ? 30 : 16, EASE.out);
  const exit = last ? 0 : prog(frame, duration - 12, 12, EASE.in);
  const scale = 1 + enter * 0.08 - exit * 0.05 + (frame / Math.max(1, duration)) * 0.012;
  const blur = enter * 18 + exit * 14;
  return (
    <AbsoluteFill style={{scale: String(scale), opacity: (1 - enter) * (1 - exit), filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

// "• WHERE IT HAPPENED" — types itself on.
export const Kicker: React.FC<{frame: number; at: number; color?: string; children: string; x?: number; y?: number; out?: number}> = ({
  frame,
  at,
  color = K.red,
  children,
  x = 64,
  y = 150,
  out,
}) => {
  const p = prog(frame, at, 22, (t) => t);
  const q = out === undefined ? 0 : prog(frame, out, 10, EASE.in);
  const shown = children.slice(0, Math.round(children.length * p));
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 14, opacity: (p > 0 ? 1 : 0) * (1 - q)}}>
      <div style={{width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}`}} />
      <div style={mono(19, {color: K.mute, letterSpacing: '0.2em'})}>{shown}</div>
    </div>
  );
};

export type Line = {text: React.ReactNode; at: number; color?: string};

// Headline lines rise in on their own words; a second line usually carries the turn in colour.
export const Headline: React.FC<{frame: number; lines: Line[]; size?: number; x?: number; y?: number; out?: number; width?: number}> = ({
  frame,
  lines,
  size = 70,
  x = 64,
  y = 196,
  out,
  width = 952,
}) => {
  const q = out === undefined ? 0 : prog(frame, out, 12, EASE.in);
  return (
    <div style={{position: 'absolute', left: x, top: y, width, opacity: 1 - q, filter: q > 0 ? `blur(${q * 10}px)` : undefined}}>
      {lines.map((line, i) => {
        const p = prog(frame, line.at, 20, EASE.out);
        return (
          <div
            key={i}
            style={{
              ...sans(size, {color: line.color ?? K.text}),
              opacity: p,
              translate: `0 ${(1 - p) * 22}px`,
              filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
            }}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
};

// A rubber stamp that lands hard and stays a little crooked.
export const Stamp: React.FC<{frame: number; at: number; color: string; children: React.ReactNode; size?: number; rotate?: number; style?: React.CSSProperties}> = ({
  frame,
  at,
  color,
  children,
  size = 30,
  rotate = -8,
  style,
}) => {
  const p = prog(frame, at, 9, EASE.in);
  if (frame < at) {
    return null;
  }
  const settle = prog(frame, at + 9, 14, EASE.out);
  return (
    <div
      style={{
        position: 'absolute',
        rotate: `${rotate}deg`,
        scale: String(mix(1.9, 1, p) * (1 + 0.04 * Math.sin(settle * Math.PI))),
        opacity: Math.min(1, p * 1.6) * 0.94,
        padding: `${size * 0.32}px ${size * 0.6}px`,
        border: `${Math.max(3, size * 0.12)}px solid ${color}`,
        borderRadius: size * 0.22,
        boxShadow: `inset 0 0 0 ${Math.max(2, size * 0.06)}px ${rgba('#000000', 0)}, 0 0 ${size}px ${rgba(color, 0.25)}`,
        background: rgba(color, 0.1),
        ...mono(size, {fontWeight: 700, color, letterSpacing: '0.12em', whiteSpace: 'nowrap'}),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// A raised keyboard key or app button that gets pressed on its word.
export const KeyCap: React.FC<{frame: number; at: number; x: number; y: number; w?: number; h?: number; children: React.ReactNode; color?: string; out?: number}> = ({
  frame,
  at,
  x,
  y,
  w = 300,
  h = 110,
  children,
  color,
  out,
}) => {
  const show = prog(frame, at - 22, 14, EASE.out);
  const press = prog(frame, at, 4, EASE.in) * (1 - prog(frame, at + 6, 10, EASE.out));
  const q = out === undefined ? 0 : prog(frame, out, 12, EASE.in);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + press * 8,
        width: w,
        height: h,
        borderRadius: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: color ?? 'linear-gradient(180deg,#2b2d33,#1a1b20)',
        boxShadow: `0 ${mix(12, 3, press)}px 0 #0c0d10, 0 ${mix(30, 10, press)}px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.14)`,
        filter: `brightness(${1 - press * 0.25})`,
        opacity: show * (1 - q),
        scale: String(mix(0.9, 1, show)),
        ...sans(44, {letterSpacing: '-0.01em'}),
      }}
    >
      {children}
    </div>
  );
};

// A generic, unbranded minted bar. `cut` sweeps a section scan down the bar to
// show what's inside: a thin gold skin over tungsten, or gold all the way through.
export const GoldBar: React.FC<{
  frame: number;
  w: number;
  weight?: string;
  serial?: string;
  cut?: number;
  core?: 'tungsten' | 'gold';
  sheenAt?: number;
  style?: React.CSSProperties;
}> = ({frame, w, weight = '1 OZ', serial = SERIAL, cut = 0, core = 'tungsten', sheenAt, style}) => {
  const h = w * 1.62;
  const sweep = sheenAt === undefined ? -1 : prog(frame, sheenAt, 40, EASE.inOut);
  const ink = '#5e4410';
  const emboss: React.CSSProperties = {color: ink, textShadow: '0 1px 0 rgba(255,244,210,0.65), 0 -1px 0 rgba(70,48,8,0.35)'};
  const skin = Math.max(3, w * 0.05);
  const scanY = cut * h;
  const scanColor = core === 'gold' ? K.goldLight : '#ffffff';
  return (
    <div style={{position: 'relative', width: w, height: h, ...style}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: w * 0.07,
          background: BAR_GOLD,
          boxShadow: `0 ${w * 0.12}px ${w * 0.25}px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,246,214,0.7), inset 0 -3px 0 rgba(90,64,10,0.6), inset 0 0 0 1px rgba(120,86,20,0.6)`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: w * 0.075,
            borderRadius: w * 0.04,
            border: '1.5px solid rgba(98,70,14,0.55)',
            boxShadow: 'inset 0 2px 6px rgba(80,56,10,0.35), 0 1px 0 rgba(255,240,200,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: w * 0.03,
          }}
        >
          <div style={{...mono(w * 0.075, {fontWeight: 700, letterSpacing: '0.22em'}), ...emboss}}>Fine gold</div>
          <div style={{...sans(w * 0.24, {fontWeight: 700, letterSpacing: '-0.03em'}), ...emboss}}>{weight}</div>
          <div style={{width: w * 0.42, height: 1.5, background: 'rgba(98,70,14,0.45)'}} />
          <div style={{...sans(w * 0.13, {fontWeight: 700}), ...emboss}}>999.9</div>
          <div style={{...mono(w * 0.062, {fontWeight: 700, letterSpacing: '0.08em'}), ...emboss}}>{serial}</div>
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(115deg, rgba(255,255,255,0) 38%, rgba(255,252,236,0.75) 50%, rgba(255,255,255,0) 62%)',
            backgroundSize: '300% 100%',
            backgroundPosition: `${mix(130, -30, Math.max(0, sweep))}% 0`,
            backgroundRepeat: 'no-repeat',
            opacity: sweep < 0 ? 0.25 + 0.15 * Math.sin(frame / 40) : 1,
            mixBlendMode: 'screen',
          }}
        />
      </div>
      {cut > 0 ? (
        <>
          {/* Section view: everything above the scan line is shown cut open. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: w * 0.07,
              background: BAR_GOLD,
              padding: skin,
              boxSizing: 'border-box',
              clipPath: `inset(0 0 ${(1 - cut) * 100}% 0)`,
              boxShadow: 'inset 0 0 0 1px rgba(120,86,20,0.7)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: w * 0.04,
                background: core === 'gold' ? GOLD_CORE : STEEL_CORE,
                boxShadow: 'inset 0 0 18px rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={sans(w * 0.3, {fontWeight: 700, color: core === 'gold' ? '#4a3408' : '#c9d0d8', opacity: prog(cut, 0.45, 0.3)})}>
                {core === 'gold' ? 'Au' : 'W'}
              </div>
              <div
                style={mono(w * 0.06, {
                  fontWeight: 700,
                  color: core === 'gold' ? K.goldLight : '#c9d0d8',
                  background: core === 'gold' ? 'rgba(40,28,6,0.85)' : 'transparent',
                  padding: core === 'gold' ? '4px 10px' : 0,
                  borderRadius: 6,
                  opacity: prog(cut, 0.6, 0.3),
                })}
              >
                {core === 'gold' ? 'Solid gold' : 'Tungsten'}
              </div>
            </div>
          </div>
          {cut < 1 ? (
            <div
              style={{
                position: 'absolute',
                left: -w * 0.18,
                right: -w * 0.18,
                top: scanY - 2,
                height: 4,
                background: `linear-gradient(90deg, rgba(0,0,0,0), ${scanColor} 20%, ${scanColor} 80%, rgba(0,0,0,0))`,
                boxShadow: `0 0 22px ${scanColor}, 0 0 60px ${rgba(core === 'gold' ? K.gold : K.red, 0.6)}`,
              }}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
};

// Tiny bar glyph used inside tags, tiles and listings.
export const BarGlyph: React.FC<{w: number; dim?: number}> = ({w, dim = 1}) => (
  <div
    style={{
      width: w,
      height: w * 1.55,
      borderRadius: w * 0.12,
      background: BAR_GOLD,
      boxShadow: 'inset 0 1px 0 rgba(255,246,214,0.7), inset 0 0 0 1px rgba(120,86,20,0.6)',
      opacity: dim,
      flexShrink: 0,
    }}
  />
);

// The carried object: the bar's assay-style tag. It rides through every scene.
export const BarTag: React.FC<{
  frame: number;
  x: number;
  y: number;
  appear?: number;
  stamp?: {at: number; kind: 'tungsten' | 'verified'};
  clip?: boolean;
  scale?: number;
  rotate?: number;
  opacity?: number;
}> = ({frame, x, y, appear = -100, stamp, clip, scale = 1, rotate = -2, opacity = 1}) => {
  const p = prog(frame, appear, 18, EASE.out);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 400,
        height: 132,
        rotate: `${rotate}deg`,
        scale: String(scale * mix(0.85, 1, p)),
        transformOrigin: '0 0',
        opacity: p * opacity,
        borderRadius: 16,
        background: 'linear-gradient(180deg,#1b1c21,#121317)',
        boxShadow: `0 24px 50px rgba(0,0,0,0.6), inset 0 0 0 1px ${K.edge}`,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '0 26px',
        boxSizing: 'border-box',
      }}
    >
      <BarGlyph w={42} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 7}}>
        <div style={mono(12, {color: K.mute})}>Bar tag · fictional example</div>
        <div style={sans(28, {letterSpacing: '-0.01em'})}>Fine gold · 1 oz</div>
        <div style={mono(15, {color: K.mute, letterSpacing: '0.1em'})}>999.9 · {SERIAL}</div>
      </div>
      {clip ? (
        <div style={{position: 'absolute', top: -34, right: 46, width: 26, height: 74, borderRadius: 13, border: '4px solid #b9bec6', borderBottomColor: 'transparent', rotate: '8deg'}} />
      ) : null}
      {stamp ? (
        <Stamp frame={frame} at={stamp.at} color={stamp.kind === 'tungsten' ? K.red : K.gold} size={20} rotate={-10} style={{right: -34, top: -26}}>
          {stamp.kind === 'tungsten' ? 'Tungsten' : 'Verified'}
        </Stamp>
      ) : null}
    </div>
  );
};

// A check row: label, value, and a tick that lands on its word.
export const Check: React.FC<{frame: number; at: number; label: string; value?: string; color?: string; mark?: string; size?: number; ink?: string}> = ({
  frame,
  at,
  label,
  value,
  color = K.teal,
  mark = '✓',
  size = 26,
  ink = K.text,
}) => {
  const p = prog(frame, at, 16, EASE.out);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: p, translate: `${(1 - p) * -18}px 0`}}>
      <div
        style={{
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          background: rgba(color, 0.12),
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: size * 0.9,
          scale: String(mix(1.6, 1, prog(frame, at, 10, EASE.out))),
        }}
      >
        {mark}
      </div>
      <div style={mono(size * 0.8, {color: ink, letterSpacing: '0.16em'})}>{label}</div>
      {value ? <div style={mono(size * 0.8, {color, letterSpacing: '0.08em', textTransform: 'none'})}>{value}</div> : null}
    </div>
  );
};

// Cream paper for official things: receipts and case files.
export const Paper: React.FC<{x: number; y: number; w: number; h: number; rotate?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  rotate = 0,
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
      rotate: `${rotate}deg`,
      borderRadius: 10,
      background: `linear-gradient(170deg, #f4eee1, ${K.paper} 60%, #e6dece)`,
      boxShadow: '0 40px 90px rgba(0,0,0,0.65), 0 2px 0 rgba(255,255,255,0.6) inset',
      padding: '44px 48px',
      boxSizing: 'border-box',
      color: K.ink,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

export const SourceLine: React.FC<{frame: number; at: number; children: string; y?: number; color?: string}> = ({frame, at, children, y = 1396, color = K.mute}) => (
  <div style={{position: 'absolute', left: 64, right: 64, top: y, textAlign: 'center', opacity: prog(frame, at, 20) * 0.75, ...mono(13, {color, letterSpacing: '0.18em'})}}>
    {children}
  </div>
);

// House mark in the top-right corner, standing in for the reference's handle.
export const Watermark: React.FC<{frame: number; hideAt: number}> = ({frame, hideAt}) => (
  <div style={{position: 'absolute', top: 138, right: 64, opacity: prog(frame, 10, 30) * (1 - prog(frame, hideAt - 14, 14, EASE.in)) * 0.85}}>
    <Img src={LOGO} style={{width: 150, height: (150 * 84) / 294}} />
  </div>
);

// One phrase at a time; the spoken word sits on a gold pill.
export const StoryCaptions: React.FC<{scenes: ScheduleScene[]; time: number; top?: number}> = ({scenes, time, top = 1490}) => {
  const pages = useMemo(() => paginate(scenes), [scenes]);
  const page = pages.find((p) => time >= p.start && time < p.end);
  if (!page) {
    return null;
  }
  const enter = Math.min(1, (time - page.start) / 0.14);
  const exit = Math.max(0, Math.min(1, (time - (page.end - 0.12)) / 0.12));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top, display: 'flex', justifyContent: 'center', opacity: enter * (1 - exit)}}>
      <div style={{maxWidth: 900, textAlign: 'center', ...sans(46, {lineHeight: 1.42, letterSpacing: '-0.01em'})}}>
        {page.words.map((word, i) => {
          const spoken = time >= word.start - 0.04;
          const active = spoken && time < (page.words[i + 1]?.start ?? page.end) - 0.04;
          return (
            <React.Fragment key={`${word.start}-${i}`}>
              <span
                style={{
                  padding: '2px 10px',
                  margin: '0 -10px',
                  borderRadius: 10,
                  background: active ? 'linear-gradient(180deg,#e9c766,#c9a13a)' : 'transparent',
                  color: active ? '#17120a' : spoken ? K.text : 'rgba(243,241,236,0.34)',
                  textShadow: active ? 'none' : '0 2px 14px rgba(0,0,0,0.9)',
                  boxDecorationBreak: 'clone',
                  WebkitBoxDecorationBreak: 'clone',
                }}
              >
                {word.word}
              </span>
              {i < page.words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// A short camera jolt that decays after an impact; returns a CSS translate.
export const jolt = (frame: number, at: number, amp = 14) => {
  const d = frame - at;
  if (d < 0 || d > 18) {
    return '0 0';
  }
  const k = amp * Math.exp(-d / 5);
  return `${Math.sin(d * 2.7) * k}px ${Math.cos(d * 3.3) * k * 0.7}px`;
};

// Interpolated count with clamping, for readouts.
export const count = (frame: number, at: number, dur: number, from: number, to: number, easing = EASE.out) =>
  interpolate(frame, [at, at + dur], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
