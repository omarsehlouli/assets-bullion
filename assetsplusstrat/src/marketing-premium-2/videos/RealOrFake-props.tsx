import type React from 'react';
import {Img, random} from 'remotion';
import {caps} from '../../marketing-premium/kit/Text';
import {C, EASE, LOGO, mix, prog, SANS, SERIF} from '../../marketing-premium/kit/theme';

// Set pieces for "Real or fake?": a lab bench of fine instruments.

export const CHECKS = ['Magnet', 'Ice', 'Ping', 'Specs', 'Serial'];
export const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

// Numbered check pills; `lit` is how many are complete, `active` the current one.
export const CheckRow: React.FC<{frame: number; at: number; y: number; lit?: number; active?: number; stagger?: number}> = ({frame, at, y, lit = 0, active = -1, stagger = 5}) => (
  <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14}}>
    {CHECKS.map((label, i) => {
      const p = prog(frame, at + i * stagger, 26);
      const on = i < lit || i === active;
      const done = i < lit;
      return (
        <div
          key={label}
          style={{
            width: 168,
            height: 74,
            borderRadius: 16,
            boxSizing: 'border-box',
            border: `1.5px solid ${on ? 'rgba(212,175,55,0.8)' : 'rgba(244,238,223,0.18)'}`,
            background: on ? 'linear-gradient(180deg, rgba(212,175,55,0.16), rgba(212,175,55,0.04))' : 'rgba(255,255,255,0.025)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            opacity: p,
            translate: `0 ${(1 - p) * 24}px`,
            boxShadow: on ? '0 0 26px rgba(212,175,55,0.18)' : undefined,
          }}
        >
          <div style={{fontFamily: SERIF, fontSize: 30, fontWeight: 600, lineHeight: 1, color: on ? C.goldLight : C.mute}}>
            {done ? '✓ ' : ''}
            {ROMAN[i]}
          </div>
          <div style={caps(13, {letterSpacing: '0.22em', color: on ? C.champagne : 'rgba(244,238,223,0.45)'})}>{label}</div>
        </div>
      );
    })}
  </div>
);

// A brushed-nickel neodymium disc magnet, seen from a three-quarter angle.
export const Magnet: React.FC<{x: number; y: number; rotate: number; opacity: number; frame: number; field: number}> = ({x, y, rotate, opacity, frame, field}) => {
  const W = 170;
  const H = 128;
  return (
    <svg width={W + 220} height={H + 220} viewBox={`${-110} ${-110} ${W + 220} ${H + 220}`} style={{position: 'absolute', left: x - W / 2 - 110, top: y - H / 2 - 110, opacity, rotate: `${rotate}deg`, overflow: 'visible'}}>
      <defs>
        <linearGradient id="mag-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#40454b" />
          <stop offset="0.22" stopColor="#d9dee3" />
          <stop offset="0.4" stopColor="#f7f9fb" />
          <stop offset="0.62" stopColor="#8f969d" />
          <stop offset="1" stopColor="#2c2f33" />
        </linearGradient>
        <radialGradient id="mag-top" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#c9ced4" />
          <stop offset="1" stopColor="#7c838a" />
        </radialGradient>
      </defs>
      {/* Field lines — undisturbed: nothing here pulls on them */}
      {[0, 1, 2].map((k) => (
        <ellipse
          key={k}
          cx={W / 2}
          cy={H / 2}
          rx={W / 2 + 40 + k * 34}
          ry={H / 2 + 22 + k * 22}
          fill="none"
          stroke="#9fd3ff"
          strokeOpacity={0.5 * field * (1 - k * 0.25)}
          strokeWidth={1.4}
          strokeDasharray="6 10"
          strokeDashoffset={-frame * (0.8 + k * 0.3)}
        />
      ))}
      <ellipse cx={W / 2} cy={H - 22} rx={W / 2} ry={22} fill="#2a2d31" />
      <rect x={0} y={22} width={W} height={H - 44} fill="url(#mag-side)" />
      <ellipse cx={W / 2} cy={H - 22} rx={W / 2} ry={22} fill="none" stroke="rgba(0,0,0,0.35)" />
      <ellipse cx={W / 2} cy={22} rx={W / 2} ry={22} fill="url(#mag-top)" />
      {[0.25, 0.45, 0.65, 0.85].map((r) => (
        <ellipse key={r} cx={W / 2} cy={22} rx={(W / 2) * r} ry={22 * r} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} />
      ))}
      <ellipse cx={W / 2} cy={22} rx={W / 2} ry={22} fill="none" stroke="rgba(40,44,48,0.6)" strokeWidth={1.2} />
    </svg>
  );
};

// A clear ice cube at three-quarter view, melting into a pool on the bar.
export const IceCube: React.FC<{x: number; y: number; size: number; melt: number; frame: number; opacity: number}> = ({x, y, size, melt, frame, opacity}) => {
  const a = (size / 2) * mix(1, 0.62, melt);
  const squash = mix(1, 0.72, melt);
  const pool = mix(size * 0.4, size * 0.72, Math.min(1, melt * 1.15));
  const base = size * 0.45;
  // Isometric cube faces around (0, 0); the base touches y = a * 0.9.
  const top = `M0 ${-a * 0.9} L${a} ${-a * 0.45} L0 0 L${-a} ${-a * 0.45} Z`;
  const left = `M${-a} ${-a * 0.45} L0 0 L0 ${a * 0.9} L${-a} ${a * 0.45} Z`;
  const right = `M0 0 L${a} ${-a * 0.45} L${a} ${a * 0.45} L0 ${a * 0.9} Z`;
  return (
    <svg
      width={size * 3}
      height={size * 3}
      viewBox={`${-size * 1.5} ${-size * 1.5} ${size * 3} ${size * 3}`}
      style={{position: 'absolute', left: x - size * 1.5, top: y - size * 1.5, opacity, overflow: 'visible', filter: 'drop-shadow(0 0 18px rgba(140,200,255,0.35))'}}
    >
      <defs>
        <radialGradient id="pool" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(120,170,225,0.34)" />
          <stop offset="0.8" stopColor="rgba(120,170,225,0.24)" />
          <stop offset="1" stopColor="rgba(120,170,225,0.06)" />
        </radialGradient>
        <linearGradient id="ice-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(235,246,255,0.92)" />
          <stop offset="1" stopColor="rgba(150,195,240,0.75)" />
        </linearGradient>
        <linearGradient id="ice-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(95,150,210,0.78)" />
          <stop offset="1" stopColor="rgba(40,85,140,0.7)" />
        </linearGradient>
        <linearGradient id="ice-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(150,195,240,0.7)" />
          <stop offset="1" stopColor="rgba(70,120,180,0.6)" />
        </linearGradient>
      </defs>
      {melt > 0.01 ? (
        <g transform={`translate(0 ${base})`}>
          <path
            d={
              Array.from({length: 28}, (_, i) => {
                const t = (i / 28) * Math.PI * 2;
                const rr = pool * (0.92 + 0.08 * Math.sin(t * 3 + 1) + 0.04 * Math.sin(t * 7 + frame / 30));
                return `${i ? 'L' : 'M'}${(Math.cos(t) * rr).toFixed(1)} ${(Math.sin(t) * rr * 0.62).toFixed(1)}`;
              }).join(' ') + 'Z'
            }
            fill="url(#pool)"
            stroke="rgba(240,248,255,0.85)"
            strokeWidth={2}
          />
          <path d={`M${-pool * 0.62} ${-pool * 0.34} Q0 ${-pool * 0.6} ${pool * 0.62} ${-pool * 0.34}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2.5} strokeLinecap="round" />
          {Array.from({length: 7}, (_, i) => {
            const t = random(`dr${i}`) * Math.PI * 2;
            const d = pool * (1.02 + random(`dd${i}`) * 0.18) * Math.min(1, melt * 1.4);
            return <circle key={i} cx={Math.cos(t) * d} cy={Math.sin(t) * d * 0.62} r={2.5 + random(`ds${i}`) * 4} fill="rgba(225,240,255,0.6)" />;
          })}
        </g>
      ) : null}
      <g transform={`translate(0 ${base - a * 0.9 * squash}) scale(1 ${squash})`} style={{filter: melt > 0.02 ? `blur(${melt * 1.2}px)` : undefined}}>
        <ellipse cx={0} cy={a * 0.95} rx={a * 1.05} ry={a * 0.3} fill="rgba(10,30,60,0.45)" />
        <path d={left} fill="url(#ice-left)" />
        <path d={right} fill="url(#ice-right)" />
        <path d={top} fill="url(#ice-top)" />
        <path d={`${top} ${left} ${right}`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={2} strokeLinejoin="round" />
        <path d={`M${-a * 0.7} ${-a * 0.15} L${-a * 0.25} ${a * 0.35} M${a * 0.35} ${-a * 0.05} L${a * 0.6} ${a * 0.4} M${-a * 0.2} ${-a * 0.55} L${a * 0.25} ${-a * 0.4}`} stroke="rgba(20,55,100,0.45)" strokeWidth={1.6} fill="none" />
        <path d={`M${-a * 0.55} ${-a * 0.5} L${-a * 0.1} ${-a * 0.72}`} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
        {melt > 0.15 ? (
          <path d={`M${a * 0.15} ${a * 0.75} q4 ${12 + melt * 20} 0 ${18 + melt * 26}`} stroke="rgba(230,244,255,0.7)" strokeWidth={4} strokeLinecap="round" fill="none" />
        ) : null}
      </g>
    </svg>
  );
};

// A decaying ring tone drawn in real time from the moment of the tap.
export const RingTrace: React.FC<{frame: number; at: number; y: number}> = ({frame, at, y}) => {
  const left = 150;
  const perSec = 340;
  const t = Math.max(0, (frame - at) / 60);
  const pts: string[] = [];
  const shown = Math.min(t, 2.2);
  for (let k = 0; k <= Math.round(shown * 240); k++) {
    const tt = k / 240;
    const env = Math.exp(-tt / 0.62);
    const v = Math.sin(tt * Math.PI * 2 * 9) * env * (0.85 + 0.15 * Math.sin(tt * 41));
    pts.push(`${k ? 'L' : 'M'}${(left + tt * perSec).toFixed(1)} ${(60 - v * 52).toFixed(1)}`);
  }
  const p = prog(frame, at - 20, 24);
  return (
    <svg width={1080} height={160} style={{position: 'absolute', left: 0, top: y, opacity: p, overflow: 'visible'}}>
      <line x1={left} x2={left + perSec * 2.2} y1={60} y2={60} stroke="rgba(244,238,223,0.18)" />
      {[0, 1, 2].map((s) => (
        <g key={s}>
          <line x1={left + s * perSec} x2={left + s * perSec} y1={112} y2={122} stroke="rgba(244,238,223,0.45)" />
          <text x={left + s * perSec} y={146} textAnchor="middle" fill="rgba(244,238,223,0.55)" fontFamily={SANS} fontSize={18} letterSpacing={2}>
            {`${s}s`}
          </text>
        </g>
      ))}
      <path d={pts.join(' ')} fill="none" stroke="#e2c46c" strokeWidth={2.6} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 8px rgba(226,196,108,0.6))'}} />
      {/* The useful band: a clear ring that lasts one to two seconds */}
      <rect x={left + perSec} y={8} width={perSec} height={104} fill="rgba(212,175,55,0.07)" stroke="rgba(212,175,55,0.35)" strokeDasharray="4 6" opacity={prog(frame, at + 70, 24)} />
    </svg>
  );
};

// A brushed-steel scale pan with its body and display, seen from above.
export const Scale: React.FC<{frame: number; x: number; y: number; reading: string; lit: number; ok: number}> = ({x, y, reading, lit, ok}) => (
  <div style={{position: 'absolute', left: x - 290, top: y - 290, width: 580, height: 770}}>
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: 140,
        bottom: 0,
        borderRadius: 46,
        background: 'linear-gradient(180deg, #23252a 0%, #121316 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 40px 80px rgba(0,0,0,0.6)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 30,
        top: 30,
        width: 520,
        height: 520,
        borderRadius: '50%',
        background: 'repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0) 4px), radial-gradient(circle at 38% 32%, #f1f3f5 0%, #b6bcc3 38%, #6d737a 75%, #3d4146 100%)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.25)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        top: 590,
        height: 120,
        borderRadius: 18,
        background: 'linear-gradient(180deg, #050607, #0b0d0f)',
        boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 10px 30px rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
      }}
    >
      <span style={{fontFamily: SANS, fontSize: 66, fontWeight: 500, letterSpacing: '0.04em', color: `rgba(255,214,140,${0.25 + lit * 0.75})`, textShadow: `0 0 ${18 * lit}px rgba(255,190,90,0.7)`, fontVariantNumeric: 'tabular-nums'}}>
        {reading}
      </span>
      <span style={{fontFamily: SANS, fontSize: 30, color: `rgba(255,214,140,${0.25 + lit * 0.6})`}}>g</span>
      <span style={{position: 'absolute', right: 18, top: 14, ...caps(14, {color: `rgba(140,230,170,${ok})`, letterSpacing: '0.18em'})}}>✓ spec</span>
    </div>
  </div>
);

// A slim digital caliper whose sliding jaw closes onto the coin's edge.
export const Caliper: React.FC<{x0: number; x1: number; y: number; jawTo: number; reading: string; ok: number; opacity: number}> = ({x0, x1, y, jawTo, reading, ok, opacity}) => {
  const beamY = y - 250;
  return (
    <svg width={1080} height={420} viewBox={`0 ${beamY - 80} 1080 420`} style={{position: 'absolute', left: 0, top: beamY - 80, opacity, overflow: 'visible'}}>
      <defs>
        <linearGradient id="cal-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f4f6" />
          <stop offset="0.45" stopColor="#aeb5bc" />
          <stop offset="1" stopColor="#5d636a" />
        </linearGradient>
      </defs>
      <rect x={x0 - 60} y={beamY - 22} width={x1 - x0 + 180} height={44} rx={6} fill="url(#cal-steel)" />
      {Array.from({length: 60}, (_, i) => (
        <line key={i} x1={x0 - 40 + i * 12} x2={x0 - 40 + i * 12} y1={beamY + 22} y2={beamY + (i % 5 === 0 ? 8 : 14)} stroke="rgba(30,34,38,0.6)" strokeWidth={1} />
      ))}
      {/* Fixed jaw */}
      <path d={`M${x0 - 40} ${beamY + 22} L${x0} ${beamY + 22} L${x0} ${y + 6} L${x0 - 14} ${y + 6} L${x0 - 40} ${beamY + 60} Z`} fill="url(#cal-steel)" />
      {/* Sliding jaw and head */}
      <g transform={`translate(${jawTo} 0)`}>
        <path d={`M0 ${beamY + 22} L40 ${beamY + 22} L40 ${beamY + 60} L14 ${y + 6} L0 ${y + 6} Z`} fill="url(#cal-steel)" />
        <rect x={-236} y={beamY - 46} width={276} height={92} rx={12} fill="#1b1d21" stroke="rgba(255,255,255,0.15)" />
        <rect x={-222} y={beamY - 32} width={180} height={64} rx={6} fill="#0a0b0d" />
        <text x={-132} y={beamY + 12} textAnchor="middle" fill="#ffd68c" fontFamily={SANS} fontSize={34} fontWeight={500} style={{fontVariantNumeric: 'tabular-nums'}}>
          {reading}
        </text>
        <text x={-12} y={beamY + 10} textAnchor="middle" fill="rgba(244,238,223,0.6)" fontFamily={SANS} fontSize={18} letterSpacing={2}>
          MM
        </text>
        <text x={-12} y={beamY - 16} textAnchor="middle" fill={`rgba(140,230,170,${ok})`} fontFamily={SANS} fontSize={18}>
          ✓
        </text>
      </g>
    </svg>
  );
};

// A minted trust seal with the house mark at its centre.
export const Seal: React.FC<{frame: number; x: number; y: number; d: number; at: number; shine: number}> = ({frame, x, y, d, at, shine}) => {
  const p = prog(frame, at, 50, EASE.out);
  const r = d / 2;
  const text = 'BULLION TRADING  ·  NEW YORK  ·  SINCE 2008  ·  ';
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: d, height: d, opacity: p, scale: String(mix(0.86, 1, p))}}>
      <svg width={d} height={d} viewBox={`${-r} ${-r} ${d} ${d}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <radialGradient id="seal-face" cx="40%" cy="35%" r="75%">
            <stop offset="0" stopColor="#262019" />
            <stop offset="1" stopColor="#0b0907" />
          </radialGradient>
          <linearGradient id="seal-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f7e7b0" />
            <stop offset="0.35" stopColor="#c9a246" />
            <stop offset="0.6" stopColor="#8a6a1f" />
            <stop offset="1" stopColor="#e9cc78" />
          </linearGradient>
          <path id="seal-path" d={`M0 0 m${-(r - 54)} 0 a${r - 54} ${r - 54} 0 1 1 ${2 * (r - 54)} 0 a${r - 54} ${r - 54} 0 1 1 ${-2 * (r - 54)} 0`} />
        </defs>
        <circle r={r - 4} fill="url(#seal-face)" />
        <circle r={r - 6} fill="none" stroke="url(#seal-ring)" strokeWidth={8} />
        <circle r={r - 22} fill="none" stroke="rgba(226,196,108,0.55)" strokeWidth={1.5} />
        <circle r={r - 86} fill="none" stroke="rgba(226,196,108,0.55)" strokeWidth={1.5} />
        {Array.from({length: 90}, (_, i) => {
          const a = (i / 90) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * (r - 14)} y1={Math.sin(a) * (r - 14)} x2={Math.cos(a) * (r - 20)} y2={Math.sin(a) * (r - 20)} stroke="rgba(226,196,108,0.5)" strokeWidth={1.2} />;
        })}
        <g transform={`rotate(${frame * 0.12})`}>
          <text fill="#e2c46c" fontFamily={SANS} fontWeight={600} fontSize={25} letterSpacing={4}>
            <textPath href="#seal-path" textLength={Math.PI * 2 * (r - 54) - 8} lengthAdjust="spacing">
              {text}
            </textPath>
          </text>
        </g>
        {shine > 0 && shine < 1 ? (
          <circle r={r - 6} fill="none" stroke="#fffbe8" strokeWidth={8} pathLength={1} strokeDasharray="0.12 0.88" strokeDashoffset={-shine} opacity={0.9} />
        ) : null}
      </svg>
      <Img src={LOGO} style={{position: 'absolute', left: r - 150, top: r - 43, width: 300, height: (300 * 84) / 294}} />
    </div>
  );
};
