import type React from 'react';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps} from '../../marketing-premium/kit/Text';
import {C} from '../../marketing-premium/kit/theme';

// A jeweller's balance: a 1 oz bar on one pan, a Gold Eagle on the other.
// `tilt` is the beam angle in degrees (positive tips the Eagle side down).

const PIVOT = {x: 540, y: 800};
const HALF = 360;
const DROP = 220;

export const Balance: React.FC<{frame: number; tilt: number; opacity?: number; sheen?: number[]; labels?: number}> = ({
  frame,
  tilt,
  opacity = 1,
  sheen = [],
  labels = 1,
}) => {
  const r = (tilt * Math.PI) / 180;
  const ends = [-1, 1].map((s) => ({x: PIVOT.x + s * HALF * Math.cos(r), y: PIVOT.y + s * HALF * Math.sin(r)}));
  const pans = ends.map((e) => ({x: e.x, y: e.y + DROP}));
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="bal-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6e3a1" />
            <stop offset="0.45" stopColor="#c9a246" />
            <stop offset="1" stopColor="#6e5114" />
          </linearGradient>
          <linearGradient id="bal-post" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6e5114" />
            <stop offset="0.45" stopColor="#f0d27a" />
            <stop offset="1" stopColor="#5b420f" />
          </linearGradient>
          <radialGradient id="bal-pan" cx="45%" cy="35%" r="70%">
            <stop offset="0" stopColor="#f6e3a1" />
            <stop offset="0.6" stopColor="#a27b26" />
            <stop offset="1" stopColor="#3d2c08" />
          </radialGradient>
        </defs>
        {/* Post and base */}
        <ellipse cx={PIVOT.x} cy={PIVOT.y + 452} rx={150} ry={26} fill="rgba(0,0,0,0.6)" style={{filter: 'blur(10px)'}} />
        <path d={`M${PIVOT.x - 120} ${PIVOT.y + 440} Q${PIVOT.x} ${PIVOT.y + 400} ${PIVOT.x + 120} ${PIVOT.y + 440} L${PIVOT.x + 120} ${PIVOT.y + 452} L${PIVOT.x - 120} ${PIVOT.y + 452} Z`} fill="url(#bal-gold)" />
        <rect x={PIVOT.x - 7} y={PIVOT.y} width={14} height={420} rx={6} fill="url(#bal-post)" />
        <circle cx={PIVOT.x} cy={PIVOT.y - 30} r={13} fill="url(#bal-gold)" />
        <path d={`M${PIVOT.x} ${PIVOT.y - 18} L${PIVOT.x} ${PIVOT.y + 6}`} stroke="#d4af37" strokeWidth={3} />
        {/* Chains */}
        {ends.map((e, i) =>
          [-1, 0, 1].map((k) => (
            <line key={`${i}${k}`} x1={e.x} y1={e.y} x2={pans[i].x + k * 108} y2={pans[i].y - 4} stroke="rgba(226,196,108,0.7)" strokeWidth={1.4} />
          )),
        )}
        {/* Beam */}
        <g transform={`rotate(${tilt} ${PIVOT.x} ${PIVOT.y})`}>
          <rect x={PIVOT.x - HALF - 12} y={PIVOT.y - 6} width={HALF * 2 + 24} height={12} rx={6} fill="url(#bal-gold)" />
          <circle cx={PIVOT.x - HALF} cy={PIVOT.y} r={9} fill="#f6e3a1" />
          <circle cx={PIVOT.x + HALF} cy={PIVOT.y} r={9} fill="#f6e3a1" />
          <path d={`M${PIVOT.x} ${PIVOT.y - 6} L${PIVOT.x} ${PIVOT.y - 46}`} stroke="#f0d27a" strokeWidth={4} strokeLinecap="round" />
        </g>
        <circle cx={PIVOT.x} cy={PIVOT.y} r={14} fill="#2a2008" stroke="#f0d27a" strokeWidth={3} />
        {/* Pans (drawn behind the pieces) */}
        {pans.map((p, i) => (
          <g key={i}>
            <ellipse cx={p.x} cy={p.y + 8} rx={124} ry={26} fill="url(#bal-pan)" />
            <ellipse cx={p.x} cy={p.y} rx={124} ry={22} fill="#2a2008" stroke="#f6e3a1" strokeOpacity={0.7} strokeWidth={2} />
          </g>
        ))}
      </svg>
      <Product src="bar-justice-obv.png" frame={frame} w={230} h={186} x={pans[0].x} y={pans[0].y - 62} shadow="none" sheen={sheen} glow="rgba(214,168,74,0.25)" />
      <Coin src="coin-gold-eagle.png" frame={frame} d={196} x={pans[1].x} y={pans[1].y - 40} tilt={58} shadow={false} sheen={sheen.map((s) => s + 6)} />
      <div style={{position: 'absolute', left: pans[0].x - 150, width: 300, top: pans[0].y + 52, textAlign: 'center', opacity: labels, ...caps(19, {color: C.champagne})}}>1 oz gold bar</div>
      <div style={{position: 'absolute', left: pans[1].x - 150, width: 300, top: pans[1].y + 52, textAlign: 'center', opacity: labels, ...caps(19, {color: C.champagne})}}>American Gold Eagle</div>
    </div>
  );
};

export const BALANCE_PANS = (tilt: number) => {
  const r = (tilt * Math.PI) / 180;
  return [-1, 1].map((s) => ({x: PIVOT.x + s * HALF * Math.cos(r), y: PIVOT.y + s * HALF * Math.sin(r) + DROP}));
};
