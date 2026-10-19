import type React from 'react';
import {C, EASE, GOLD_GRADIENT, mix, prog, SANS, SERIF} from './theme';

// Metallic type: a brushed gradient fill with a travelling specular band.
export const Metal: React.FC<{
  children: React.ReactNode;
  frame: number;
  gradient?: string;
  // Frame at which a bright sheen crosses the letters (once).
  sheenAt?: number;
  glow?: string;
  style?: React.CSSProperties;
}> = ({children, frame, gradient = GOLD_GRADIENT, sheenAt, glow = 'rgba(212,175,55,0.28)', style}) => {
  const sweep = sheenAt === undefined ? -1 : prog(frame, sheenAt, 50, EASE.inOut);
  const drift = 50 + Math.sin(frame / 80) * 30;
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) 42%, rgba(255,250,235,0.95) 50%, rgba(255,255,255,0) 58%), ${gradient}`,
        backgroundSize: '300% 100%, 220% 100%',
        backgroundPosition: `${mix(140, -40, Math.max(0, sweep))}% 0, ${drift}% 0`,
        backgroundRepeat: 'no-repeat',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        filter: glow ? `drop-shadow(0 0 22px ${glow})` : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// Blur-and-rise entrance. Everything typographic enters this way.
export const Rise: React.FC<{
  children: React.ReactNode;
  frame: number;
  at: number;
  dur?: number;
  distance?: number;
  blur?: number;
  out?: number;
  outDur?: number;
  style?: React.CSSProperties;
  inline?: boolean;
}> = ({children, frame, at, dur = 34, distance = 46, blur = 16, out, outDur = 16, style, inline}) => {
  const p = prog(frame, at, dur, EASE.out);
  const q = out === undefined ? 0 : prog(frame, out, outDur, EASE.in);
  return (
    <div
      style={{
        display: inline ? 'inline-block' : 'block',
        opacity: Math.min(1, p * 1.4) * (1 - q),
        translate: `0 ${(1 - p) * distance - q * distance * 0.5}px`,
        filter: p < 1 || q > 0 ? `blur(${(1 - p) * blur + q * blur * 0.6}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// A headline line that wipes up out of a hidden baseline.
export const MaskLine: React.FC<{
  children: React.ReactNode;
  frame: number;
  at: number;
  dur?: number;
  out?: number;
  style?: React.CSSProperties;
}> = ({children, frame, at, dur = 40, out, style}) => {
  const p = prog(frame, at, dur, EASE.out);
  const q = out === undefined ? 0 : prog(frame, out, 18, EASE.in);
  return (
    <div style={{clipPath: 'inset(-80% -20% -8% -20%)', ...style}}>
      <div
        style={{
          translate: `0 ${(1 - p) * 112 - q * 40}%`,
          opacity: (0.2 + 0.8 * p) * (1 - q),
          filter: p < 1 || q > 0 ? `blur(${(1 - p) * 6 + q * 10}px)` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Small tracked capitals between two hairlines that draw outward.
export const Eyebrow: React.FC<{
  children: React.ReactNode;
  frame: number;
  at: number;
  out?: number;
  color?: string;
  lines?: boolean;
  style?: React.CSSProperties;
}> = ({children, frame, at, out, color = C.champagne, lines = true, style}) => {
  const p = prog(frame, at, 40);
  const q = out === undefined ? 0 : prog(frame, out, 14, EASE.in);
  const line: React.CSSProperties = {
    width: 70 * p,
    height: 1,
    background: `linear-gradient(90deg, rgba(217,199,155,0), ${color})`,
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        opacity: p * (1 - q),
        fontFamily: SANS,
        fontSize: 23,
        fontWeight: 500,
        letterSpacing: `${mix(0.62, 0.38, p)}em`,
        color,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {lines ? <div style={line} /> : null}
      <span style={{marginRight: '-0.38em'}}>{children}</span>
      {lines ? <div style={{...line, transform: 'scaleX(-1)'}} /> : null}
    </div>
  );
};

export const serif = (size: number, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: SERIF,
  fontWeight: 500,
  fontSize: size,
  lineHeight: 0.98,
  letterSpacing: '-0.015em',
  color: C.ivory,
  fontVariantNumeric: 'lining-nums',
  ...extra,
});

export const italic = (size: number, extra?: React.CSSProperties): React.CSSProperties =>
  serif(size, {fontStyle: 'italic', fontWeight: 500, letterSpacing: '-0.02em', ...extra});

export const caps = (size: number, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 500,
  fontSize: size,
  letterSpacing: '0.34em',
  textTransform: 'uppercase',
  color: C.champagne,
  ...extra,
});
