import type React from 'react';
import {C, EASE, mix, prog, SANS, SERIF} from '../../marketing-premium/kit/theme';

// Set pieces for FAQ 05 (same-day pickup): a generic bank check, payment
// icons and the step markers. Nothing here depicts a real bank or card network.

const GOLD = '#e2c46c';

// Guilloché rosette and wave bands, the security engraving on a cashier's check.
const Guilloche: React.FC<{w: number; h: number}> = ({w, h}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: 14}, (_, i) => {
      const amp = 10 + i * 1.6;
      const y0 = h * 0.18 + i * 4.2;
      const d = Array.from({length: 61}, (__, k) => {
        const x = (k / 60) * w;
        const y = y0 + Math.sin(k / 3.2 + i * 0.5) * amp * 0.35 + Math.sin(k / 9 + i) * amp * 0.25;
        return `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(' ');
      return <path key={i} d={d} fill="none" stroke="rgba(120,96,40,0.13)" strokeWidth={1} />;
    })}
    <g transform={`translate(${w * 0.82} ${h * 0.5})`}>
      {Array.from({length: 24}, (_, i) => (
        <ellipse key={i} rx={64} ry={20} fill="none" stroke="rgba(120,96,40,0.16)" strokeWidth={1} transform={`rotate(${(i * 180) / 24})`} />
      ))}
    </g>
  </svg>
);

// A cashier's / bank check made out to Bullion Trading LLC. The amount is a
// shimmering blank — no figures are shown.
export const BankCheck: React.FC<{
  frame: number;
  w?: number;
  scan?: number;
  verified?: number;
  style?: React.CSSProperties;
}> = ({frame, w = 760, scan = 0, verified = 0, style}) => {
  const h = Math.round(w * 0.43);
  const k = w / 760;
  const shimmer = ((frame * 1.4) % 160) - 30;
  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        borderRadius: 14 * k,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #f6efda 0%, #eadfbf 55%, #e2d4ad 100%)',
        boxShadow: '0 40px 90px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(120,96,40,0.25)',
        ...style,
      }}
    >
      <Guilloche w={w} h={h} />
      <div style={{position: 'absolute', left: 30 * k, top: 22 * k, fontFamily: SANS, fontWeight: 600, fontSize: 20 * k, letterSpacing: '0.34em', color: '#5a4614'}}>
        BANK CHECK
      </div>
      <div style={{position: 'absolute', right: 30 * k, top: 22 * k, fontFamily: SANS, fontWeight: 500, fontSize: 14 * k, letterSpacing: '0.24em', color: 'rgba(90,70,20,0.7)'}}>
        CASHIER&apos;S CHECK
      </div>
      <div style={{position: 'absolute', left: 30 * k, top: 92 * k, fontFamily: SANS, fontSize: 15 * k, letterSpacing: '0.12em', color: 'rgba(60,46,12,0.75)', textTransform: 'uppercase'}}>
        Pay to the order of
      </div>
      <div
        style={{
          position: 'absolute',
          left: 30 * k,
          right: 250 * k,
          top: 110 * k,
          borderBottom: `${1.5 * k}px solid rgba(60,46,12,0.5)`,
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 44 * k,
          color: '#2c220a',
          paddingBottom: 2 * k,
          paddingLeft: 10 * k,
        }}
      >
        Bullion Trading LLC
      </div>
      <div
        style={{
          position: 'absolute',
          right: 30 * k,
          top: 104 * k,
          width: 190 * k,
          height: 58 * k,
          borderRadius: 6 * k,
          border: `${1.5 * k}px solid rgba(60,46,12,0.45)`,
          display: 'flex',
          alignItems: 'center',
          gap: 10 * k,
          padding: `0 ${14 * k}px`,
          boxSizing: 'border-box',
        }}
      >
        <span style={{fontFamily: SERIF, fontSize: 34 * k, color: '#2c220a'}}>$</span>
        <span
          style={{
            flex: 1,
            height: 12 * k,
            borderRadius: 6 * k,
            background: `linear-gradient(90deg, rgba(120,96,40,0.18), rgba(120,96,40,0.5) ${shimmer}%, rgba(120,96,40,0.18))`,
          }}
        />
      </div>
      <div style={{position: 'absolute', right: 30 * k, bottom: 54 * k, width: 260 * k, borderTop: `${1.5 * k}px solid rgba(60,46,12,0.5)`, paddingTop: 6 * k, textAlign: 'center', fontFamily: SANS, fontSize: 12 * k, letterSpacing: '0.2em', color: 'rgba(60,46,12,0.7)'}}>
        AUTHORIZED SIGNATURE
      </div>
      <svg width={260 * k} height={50 * k} viewBox="0 0 260 50" style={{position: 'absolute', right: 30 * k, bottom: 62 * k}}>
        <path d="M10 34 C30 8 44 40 62 22 S96 6 108 30 S150 40 168 18 S214 28 248 14" fill="none" stroke="#2c3a6b" strokeWidth={2.2} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: 30 * k, bottom: 22 * k, fontFamily: 'monospace', fontSize: 18 * k, letterSpacing: '0.3em', color: 'rgba(40,32,10,0.55)'}}>
        ⑆ ••••••••• ⑆ •••••••••• ⑈
      </div>
      {/* Verification sweep */}
      {scan > 0 && scan < 1 ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${mix(-10, 110, scan)}%`,
            width: 4 * k,
            background: GOLD,
            boxShadow: `0 0 ${24 * k}px ${8 * k}px rgba(226,196,108,0.55)`,
          }}
        />
      ) : null}
      {verified > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 30 * k,
            top: 168 * k,
            display: 'flex',
            alignItems: 'center',
            gap: 10 * k,
            padding: `${6 * k}px ${16 * k}px`,
            borderRadius: 999,
            border: `${2 * k}px solid #2f6b3c`,
            color: '#2f6b3c',
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 18 * k,
            letterSpacing: '0.22em',
            opacity: verified,
            scale: String(mix(1.4, 1, verified)),
            rotate: '-4deg',
          }}
        >
          ✓ VERIFIED
        </div>
      ) : null}
    </div>
  );
};

type IconKind = 'bankcheck' | 'wire' | 'check' | 'card' | 'parcel' | 'phone' | 'pin';

// Thin gold line icons.
export const Icon: React.FC<{kind: IconKind; size?: number; draw?: number; color?: string}> = ({kind, size = 64, draw = 1, color = GOLD}) => {
  const paths: Record<IconKind, string[]> = {
    bankcheck: ['M6 16 H58 V48 H6 Z', 'M12 26 H34', 'M12 34 H28', 'M40 36 H52', 'M44 22 C46 18 50 18 52 22'],
    wire: ['M8 22 H50', 'M42 14 L50 22 L42 30', 'M56 42 H14', 'M22 34 L14 42 L22 50'],
    check: ['M6 16 H58 V48 H6 Z', 'M12 38 C18 30 22 42 28 34 S38 30 44 36', 'M12 24 H30'],
    card: ['M6 16 H58 V48 H6 Z', 'M6 24 H58', 'M6 30 H58', 'M12 40 H24'],
    parcel: ['M8 22 L32 10 L56 22 V46 L32 58 L8 46 Z', 'M8 22 L32 34 L56 22', 'M32 34 V58', 'M20 16 L44 28'],
    phone: ['M18 8 H46 V56 H18 Z', 'M28 50 H36', 'M18 14 H46', 'M18 44 H46'],
    pin: ['M32 58 C20 42 14 32 14 24 a18 18 0 0 1 36 0 C50 32 44 42 32 58 Z', 'M32 30 a6 6 0 1 0 0.1 0 Z'],
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{overflow: 'visible'}}>
      {paths[kind].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - Math.min(1, Math.max(0, draw * 1.3 - i * 0.1))}
        />
      ))}
    </svg>
  );
};

// A numbered step medallion.
export const StepNumber: React.FC<{n: number; lit: number}> = ({n, lit}) => (
  <div
    style={{
      width: 74,
      height: 74,
      flexShrink: 0,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 40,
      fontVariantNumeric: 'lining-nums',
      color: lit > 0.5 ? '#1a1205' : C.champagne,
      background: lit > 0.5 ? 'linear-gradient(140deg, #f6e3a1, #d4af37 55%, #a07a22)' : 'rgba(255,255,255,0.04)',
      border: `1.5px solid rgba(212,175,55,${0.35 + lit * 0.6})`,
      boxShadow: lit > 0.5 ? '0 0 30px rgba(212,175,55,0.35)' : undefined,
    }}
  >
    {n}
  </div>
);

// A calendar strip of `days` cells that fill one after another.
export const DayStrip: React.FC<{frame: number; at: number; days: number; per?: number; label: string}> = ({frame, at, days, per = 8, label}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
    {Array.from({length: days}, (_, i) => {
      const f = prog(frame, at + i * per, 12, EASE.out);
      return (
        <div
          key={i}
          style={{
            width: 30,
            height: 36,
            borderRadius: 6,
            border: '1.5px solid rgba(226,196,108,0.6)',
            background: `rgba(226,196,108,${0.85 * f})`,
            boxShadow: f > 0.5 ? '0 0 14px rgba(226,196,108,0.35)' : undefined,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            color: f > 0.5 ? '#1a1205' : 'rgba(226,196,108,0.7)',
            paddingBottom: 3,
            boxSizing: 'border-box',
          }}
        >
          {i + 1}
        </div>
      );
    })}
    <span style={{marginLeft: 10, fontFamily: SANS, fontSize: 18, fontWeight: 600, letterSpacing: '0.22em', color: C.champagne, textTransform: 'uppercase'}}>{label}</span>
  </div>
);
