import type React from 'react';
import {caps} from '../../marketing-premium/kit/Text';
import {EASE, mix, prog, SANS} from '../../marketing-premium/kit/theme';

// Set pieces for FAQ 02 — the over-the-counter sale.

// A dark glass counter seen in perspective, with a velvet pad on top.
export const Counter: React.FC<{opacity: number; padY?: number}> = ({opacity, padY = 1080}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity}}>
    <defs>
      <linearGradient id="sip-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1d1c22" />
        <stop offset="0.45" stopColor="#0d0d11" />
        <stop offset="1" stopColor="#060608" />
      </linearGradient>
      <linearGradient id="sip-edge" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="rgba(212,175,55,0)" />
        <stop offset="0.5" stopColor="rgba(240,210,122,0.9)" />
        <stop offset="1" stopColor="rgba(212,175,55,0)" />
      </linearGradient>
      <radialGradient id="sip-pad" cx="50%" cy="40%" r="70%">
        <stop offset="0" stopColor="#1b1a2a" />
        <stop offset="1" stopColor="#0a0a12" />
      </radialGradient>
    </defs>
    <path d="M110 880 L970 880 L1120 1420 L-40 1420 Z" fill="url(#sip-glass)" />
    <path d="M110 880 L970 880" stroke="url(#sip-edge)" strokeWidth={2.5} />
    <path d="M150 905 L520 905 L430 1400 L20 1400 Z" fill="rgba(255,255,255,0.025)" />
    <path d={`M250 ${padY - 150} L830 ${padY - 150} L900 ${padY + 160} L180 ${padY + 160} Z`} fill="url(#sip-pad)" stroke="rgba(212,175,55,0.35)" strokeWidth={1.5} />
    <path d={`M262 ${padY - 138} L818 ${padY - 138} L884 ${padY + 148} L196 ${padY + 148} Z`} fill="none" stroke="rgba(212,175,55,0.14)" strokeWidth={1} strokeDasharray="6 8" />
  </svg>
);

// A jeweler's loupe: glass, dark bezel, gold rings.
export const Loupe: React.FC<{x: number; y: number; r?: number; opacity: number}> = ({x, y, r = 120, opacity}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, opacity}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.32), rgba(255,255,255,0.05) 45%, rgba(255,255,255,0) 70%)',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.45)',
        backdropFilter: 'brightness(1.25) contrast(1.1)',
      }}
    />
    <svg width={r * 2 + 50} height={r * 2 + 50} style={{position: 'absolute', left: -25, top: -25, overflow: 'visible', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.7))'}}>
      <circle cx={r + 25} cy={r + 25} r={r + 9} fill="none" stroke="#18181a" strokeWidth={22} />
      <circle cx={r + 25} cy={r + 25} r={r - 1} fill="none" stroke="#f0d27a" strokeWidth={2.5} />
      <circle cx={r + 25} cy={r + 25} r={r + 21} fill="none" stroke="#b8902f" strokeWidth={1.5} />
    </svg>
  </div>
);

// Line icons for the three senses of a visual inspection.
const ICON: Record<string, React.ReactNode> = {
  look: (
    <>
      <path d="M8 40 Q50 6 92 40 Q50 74 8 40 Z" />
      <circle cx={50} cy={40} r={14} />
      <circle cx={50} cy={40} r={5} fill="currentColor" />
    </>
  ),
  feel: (
    <>
      <path d="M34 76 V30 a8 8 0 0 1 16 0 V54" />
      <path d="M50 36 a8 8 0 0 1 16 0 V56" />
      <path d="M66 42 a8 8 0 0 1 16 0 V60 Q82 80 62 84 H44 Q30 82 22 66 L14 50 a7 7 0 0 1 12 -6 L34 56" />
    </>
  ),
  measure: (
    <>
      <rect x={8} y={30} width={84} height={26} rx={4} />
      {[18, 28, 38, 48, 58, 68, 78].map((x, i) => (
        <line key={x} x1={x} x2={x} y1={30} y2={i % 2 ? 40 : 46} />
      ))}
    </>
  ),
};

export const SenseIcons: React.FC<{frame: number; items: {key: 'look' | 'feel' | 'measure'; label: string; at: number}[]; y: number}> = ({frame, items, y}) => {
  const active = items.reduce((idx, item, i) => (frame >= item.at ? i : idx), -1);
  return (
    <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 70}}>
      {items.map((item, i) => {
        const p = prog(frame, item.at - 4, 24, EASE.out);
        const on = i === active;
        return (
          <div key={item.key} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: mix(0.25, on ? 1 : 0.55, p), translate: `0 ${(1 - p) * 26}px`}}>
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid rgba(212,175,55,${on ? 0.9 : 0.35})`,
                background: on ? 'radial-gradient(circle, rgba(212,175,55,0.18), rgba(212,175,55,0.02) 70%)' : 'rgba(255,255,255,0.02)',
                boxShadow: on ? '0 0 40px rgba(212,175,55,0.25)' : undefined,
                color: on ? '#f6e3a1' : 'rgba(244,238,223,0.7)',
                scale: String(on ? 1 + 0.06 * prog(frame, item.at - 4, 10) * (1 - prog(frame, item.at + 6, 16)) : 1),
              }}
            >
              <svg width={90} height={80} viewBox="0 0 100 90" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                {ICON[item.key]}
              </svg>
            </div>
            <div style={caps(22, {color: on ? '#f6e3a1' : 'rgba(244,238,223,0.6)'})}>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// A generic benchtop precious-metals analyzer (no brand): graphite body, a
// sample plate on top and a small screen that scans, then verifies.
export const Analyzer: React.FC<{frame: number; x: number; y: number; scanAt: number; doneAt: number; opacity: number}> = ({frame, x, y, scanAt, doneAt, opacity}) => {
  const scan = prog(frame, scanAt, doneAt - scanAt, (t) => t);
  const done = prog(frame, doneAt, 14, EASE.out);
  const beam = scan > 0 && done < 1 ? 0.6 + 0.4 * Math.sin(frame / 3) : done > 0 ? 0.3 : 0;
  return (
    <div style={{position: 'absolute', left: x - 220, top: y - 120, width: 440, height: 360, opacity}}>
      {/* Body */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 60,
          bottom: 0,
          borderRadius: 34,
          background: 'linear-gradient(180deg, #2b2c31 0%, #16171a 55%, #0d0d0f 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -2px 0 rgba(0,0,0,0.6), 0 40px 80px rgba(0,0,0,0.65)',
        }}
      />
      {/* Sample plate */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 30,
          height: 70,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 40%, #4a4c52, #1b1c20 70%)',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.12)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 190,
          top: 52,
          width: 60,
          height: 26,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(120,220,255,${0.9 * beam}), rgba(120,220,255,0) 70%)`,
          boxShadow: beam > 0 ? `0 0 ${30 * beam}px rgba(120,220,255,${0.6 * beam})` : undefined,
        }}
      />
      {/* Screen */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 150,
          height: 130,
          borderRadius: 16,
          background: 'linear-gradient(180deg, #040506, #0a0c0e)',
          boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 10px 30px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {done > 0.05 ? (
          <>
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: '0.18em', color: `rgba(246,227,161,${done})`, textShadow: '0 0 16px rgba(246,200,110,0.7)'}}>GOLD</div>
            <div style={caps(18, {color: `rgba(140,230,170,${done})`, letterSpacing: '0.24em'})}>✓ Verified</div>
          </>
        ) : scan > 0 ? (
          <>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 5, height: 52}}>
              {Array.from({length: 22}, (_, i) => {
                const h = 8 + 40 * Math.abs(Math.sin(i * 0.9 + frame / 6)) * (i === 13 ? 1.2 : 0.6) * scan;
                return <div key={i} style={{width: 7, height: h, borderRadius: 2, background: i === 13 ? '#f0d27a' : 'rgba(120,220,255,0.7)'}} />;
              })}
            </div>
            <div style={caps(15, {color: 'rgba(120,220,255,0.85)', letterSpacing: '0.3em'})}>Testing</div>
          </>
        ) : (
          <div style={caps(18, {color: 'rgba(244,238,223,0.35)', letterSpacing: '0.3em'})}>Ready</div>
        )}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, textAlign: 'center', ...caps(13, {color: 'rgba(244,238,223,0.3)', letterSpacing: '0.4em'})}}>Precious-metals tester</div>
    </div>
  );
};

// A digital scale: brushed pan with a display that settles on the reading.
export const Scale: React.FC<{frame: number; x: number; y: number; from: number; settle: number; target: number; okAt: number; opacity: number}> = ({frame, x, y, from, settle, target, okAt, opacity}) => {
  const p = prog(frame, from, settle, EASE.out);
  const jitter = p > 0 && p < 1 ? Math.sin(frame * 1.7) * 0.4 * (1 - p) : 0;
  const reading = (target * p + jitter).toFixed(2);
  const ok = prog(frame, okAt, 14, EASE.out);
  return (
    <div style={{position: 'absolute', left: x - 200, top: y - 120, width: 400, height: 420, opacity}}>
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          top: 120,
          bottom: 0,
          borderRadius: 34,
          background: 'linear-gradient(180deg, #23252a 0%, #121316 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 40px 80px rgba(0,0,0,0.6)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: 40,
          height: 150,
          borderRadius: '50%',
          background: 'repeating-radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0) 4px), radial-gradient(ellipse at 38% 32%, #eef0f2 0%, #b3b9c0 40%, #6b7178 78%, #3b3f44 100%)',
          boxShadow: '0 14px 30px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.25)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: 260,
          height: 100,
          borderRadius: 16,
          background: 'linear-gradient(180deg, #050607, #0b0d0f)',
          boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 10px 30px rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          paddingTop: 16,
          boxSizing: 'border-box',
          gap: 10,
        }}
      >
        <span style={{fontFamily: SANS, fontSize: 52, fontWeight: 500, color: `rgba(255,214,140,${0.3 + 0.7 * Math.min(1, p * 3)})`, textShadow: '0 0 14px rgba(255,190,90,0.6)', fontVariantNumeric: 'tabular-nums'}}>
          {reading}
        </span>
        <span style={{fontFamily: SANS, fontSize: 26, color: 'rgba(255,214,140,0.7)'}}>g</span>
        <span style={{position: 'absolute', right: 14, top: 10, ...caps(13, {color: `rgba(140,230,170,${ok})`, letterSpacing: '0.18em'})}}>✓ 1 oz</span>
      </div>
    </div>
  );
};

// A text line that gets crossed out with a drawn gold slash.
export const Struck: React.FC<{frame: number; at: number; strikeAt: number; children: React.ReactNode; size?: number}> = ({frame, at, strikeAt, children, size = 54}) => {
  const p = prog(frame, at - 4, 22, EASE.out);
  const s = prog(frame, strikeAt - 6, 16, EASE.inOut);
  return (
    <div style={{position: 'relative', display: 'inline-block', opacity: p * mix(1, 0.5, s), translate: `0 ${(1 - p) * 24}px`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined}}>
      <span style={{fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: '-0.01em', color: '#f4eedf'}}>{children}</span>
      <div
        style={{
          position: 'absolute',
          left: -12,
          right: -12,
          top: '54%',
          height: 4,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #b8902f, #f6e3a1, #d4af37)',
          boxShadow: '0 0 12px rgba(246,227,161,0.6)',
          transformOrigin: 'left center',
          scale: `${s} 1`,
          rotate: '-2deg',
        }}
      />
    </div>
  );
};

// A stopwatch-style dial: ticks for 0–10 minutes, the 3–6 band lit, and a
// hand that sweeps into it.
export const Dial: React.FC<{frame: number; x: number; y: number; r: number; at: number; bandAt: number; opacity: number}> = ({frame, x, y, r, at, bandAt, opacity}) => {
  const sweep = prog(frame, at, 70, EASE.inOut);
  const band = prog(frame, bandAt - 6, 30, EASE.out);
  const angle = (m: number) => -Math.PI / 2 + (m / 10) * Math.PI * 2;
  const point = (m: number, rr: number) => [x + Math.cos(angle(m)) * rr, y + Math.sin(angle(m)) * rr] as const;
  const arc = (m0: number, m1: number, rr: number) => {
    const [x0, y0] = point(m0, rr);
    const [x1, y1] = point(m1, rr);
    return `M${x0} ${y0} A${rr} ${rr} 0 ${m1 - m0 > 5 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const hand = mix(0, 4.5, sweep);
  const [hx0, hy0] = point(hand, r - 34);
  const [hx, hy] = point(hand, r + 18);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity, overflow: 'visible'}}>
      <circle cx={x} cy={y} r={r + 26} fill="rgba(12,12,16,0.85)" stroke="rgba(212,175,55,0.35)" strokeWidth={2} />
      <circle cx={x} cy={y} r={r + 12} fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth={1} />
      {Array.from({length: 60}, (_, i) => {
        const m = i / 6;
        const major = i % 6 === 0;
        const [x0, y0] = point(m, r - (major ? 26 : 14));
        const [x1, y1] = point(m, r);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={major ? '#e2c46c' : 'rgba(244,238,223,0.3)'} strokeWidth={major ? 3 : 1.5} />;
      })}
      {[0, 2, 4, 6, 8].map((m) => {
        const [tx, ty] = point(m, r - 58);
        return (
          <text key={m} x={tx} y={ty + 8} textAnchor="middle" fill="rgba(244,238,223,0.55)" fontFamily={SANS} fontSize={22} fontWeight={500}>
            {m}
          </text>
        );
      })}
      <path d={arc(3, 3 + 3 * band, r + 4)} fill="none" stroke="#f0d27a" strokeWidth={10} strokeLinecap="round" opacity={band} style={{filter: 'drop-shadow(0 0 12px rgba(240,210,122,0.8))'}} />
      <line x1={hx0} y1={hy0} x2={hx} y2={hy} stroke="#f6e3a1" strokeWidth={6} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px rgba(246,227,161,0.8))'}} />
      <circle cx={hx} cy={hy} r={7} fill="#f6e3a1" />
      <rect x={x - 22} y={y - r - 70} width={44} height={36} rx={8} fill="#1d1d22" stroke="rgba(212,175,55,0.5)" strokeWidth={2} />
      <rect x={x - 10} y={y - r - 40} width={20} height={16} fill="#1d1d22" />
    </svg>
  );
};
