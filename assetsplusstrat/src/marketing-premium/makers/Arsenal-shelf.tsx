import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {CONDENSED} from './forge';
import {Beads, fill, GrainDefs, type Metal} from './Grain';

// Inside the vault: steel shelving lined with clear, heavy-duty industrial
// tubs of casting grain, receding into amber darkness.

type Tub = {x: number; w: number; h: number; metal: Metal};

const BASE: Record<Metal, [string, string]> = {
  gold: ['#4a3008', '#c58f22'],
  silver: ['#3a4048', '#bfc7cf'],
  platinum: ['#33373b', '#a9afb5'],
};

const LABEL: Record<Metal, string> = {gold: 'Au 24K', silver: 'Ag .925', platinum: 'Pt 950'};

const Container: React.FC<{tub: Tub; baseY: number; frame: number; prefix: string; index: number; density: number}> = ({tub, baseY, frame, prefix, index, density}) => {
  const {x, w, h, metal} = tub;
  const lid = h * 0.11;
  const level = h * 0.8;
  const clip = `${prefix}-clip-${index}`;
  const grains = fill(`${prefix}-${index}`, {x: -w / 2 + 4, y: -level, w: w - 8, h: level - 6, count: density, rMin: w * 0.03, rMax: w * 0.058});
  return (
    <g transform={`translate(${x} ${baseY})`}>
      <ellipse cx={0} cy={4} rx={w * 0.56} ry={w * 0.07} fill="rgba(0,0,0,0.7)" />
      <defs>
        <clipPath id={clip}>
          <rect x={-w / 2 + 5} y={-level} width={w - 10} height={level - 4} rx={w * 0.06} />
        </clipPath>
        <linearGradient id={`${clip}-base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BASE[metal][1]} />
          <stop offset="1" stopColor={BASE[metal][0]} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x={-w / 2} y={-level} width={w} height={level} fill={`url(#${clip}-base)`} />
        <Beads grains={grains} metal={metal} frame={frame + index * 9} prefix={prefix} shadow={false} sparkle={0.7} />
        <rect x={-w / 2} y={-level} width={w} height={level * 0.12} fill="rgba(255,255,255,0.08)" />
      </g>
      {/* Clear plastic body */}
      <rect x={-w / 2} y={-h + lid} width={w} height={h - lid} rx={w * 0.08} fill={`url(#${prefix}-glass)`} stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} />
      <rect x={-w * 0.36} y={-h + lid + 10} width={w * 0.07} height={h - lid - 26} rx={w * 0.035} fill="rgba(255,255,255,0.16)" />
      <rect x={w * 0.38} y={-h + lid + 14} width={w * 0.04} height={h - lid - 34} rx={w * 0.02} fill="rgba(255,170,80,0.28)" />
      {/* Lid */}
      <rect x={-w / 2 - 6} y={-h} width={w + 12} height={lid} rx={8} fill={`url(#${prefix}-lid)`} stroke="#07080a" strokeWidth={1.5} />
      {[0.3, 0.55, 0.8].map((t) => (
        <line key={t} x1={-w / 2 - 2} x2={w / 2 + 2} y1={-h + lid * t} y2={-h + lid * t} stroke="rgba(255,255,255,0.08)" strokeWidth={1.2} />
      ))}
      {/* Label */}
      <rect x={-w * 0.27} y={-h * 0.52} width={w * 0.54} height={h * 0.17} rx={4} fill="rgba(244,240,230,0.9)" />
      <text x={0} y={-h * 0.52 + h * 0.105} textAnchor="middle" fontFamily={CONDENSED} fontWeight={700} fontSize={h * 0.078} fill="#111" letterSpacing={1}>
        {LABEL[metal]}
      </text>
      <text x={0} y={-h * 0.52 + h * 0.15} textAnchor="middle" fontFamily={CONDENSED} fontWeight={500} fontSize={h * 0.033} fill="#444" letterSpacing={2}>
        CASTING GRAIN
      </text>
    </g>
  );
};

const Row: React.FC<{frame: number; y: number; tubs: Tub[]; prefix: string; blur: number; drift: number; dim: number; density: number}> = ({frame, y, tubs, prefix, blur, drift, dim, density}) => (
  <svg
    width={1400}
    height={1920}
    viewBox="0 0 1400 1920"
    style={{position: 'absolute', left: -160 + drift, top: 0, overflow: 'visible', filter: `blur(${blur}px) brightness(${dim})`}}
  >
    <defs>
      <linearGradient id={`${prefix}-glass`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="rgba(255,255,255,0.16)" />
        <stop offset="0.18" stopColor="rgba(255,255,255,0.03)" />
        <stop offset="0.6" stopColor="rgba(255,255,255,0.01)" />
        <stop offset="0.88" stopColor="rgba(255,190,120,0.08)" />
        <stop offset="1" stopColor="rgba(255,200,140,0.2)" />
      </linearGradient>
      <linearGradient id={`${prefix}-lid`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a4f56" />
        <stop offset="0.5" stopColor="#24272b" />
        <stop offset="1" stopColor="#0e0f11" />
      </linearGradient>
      <linearGradient id={`${prefix}-plank`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7a6146" />
        <stop offset="0.12" stopColor="#3a3632" />
        <stop offset="1" stopColor="#0d0d0e" />
      </linearGradient>
    </defs>
    <GrainDefs prefix={prefix} />
    {tubs.map((tub, i) => (
      <Container key={i} tub={tub} baseY={y} frame={frame} prefix={prefix} index={i} density={density} />
    ))}
    <rect x={0} y={y + 2} width={1400} height={34} fill={`url(#${prefix}-plank)`} />
    <rect x={0} y={y + 2} width={1400} height={2} fill="rgba(255,190,120,0.55)" />
  </svg>
);

const FAR: Tub[] = [180, 360, 540, 720, 900, 1080, 1260].map((x, i) => ({x, w: 128, h: 170, metal: (['silver', 'gold', 'silver', 'platinum', 'gold', 'silver', 'gold'] as Metal[])[i]}));
const MID: Tub[] = [150, 400, 650, 900, 1150].map((x, i) => ({x, w: 196, h: 258, metal: (['gold', 'silver', 'gold', 'silver', 'platinum'] as Metal[])[i]}));
const NEAR: Tub[] = [280, 700, 1120].map((x, i) => ({x, w: 330, h: 420, metal: (['silver', 'gold', 'silver'] as Metal[])[i]}));

export const Shelves: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #120c08 0%, #1a110a 45%, #0a0706 100%)'}} />
    {/* Steel wall panels */}
    <AbsoluteFill
      style={{
        background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 180px)',
        translate: `${-frame * 0.15}px 0`,
      }}
    />
    {[200, 540, 880].map((x, i) => (
      <div
        key={x}
        style={{
          position: 'absolute',
          left: x - 260,
          top: -80,
          width: 520,
          height: 1500,
          background: 'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(255,170,80,0.35), rgba(255,140,50,0.08) 50%, rgba(0,0,0,0) 75%)',
          opacity: 0.8 + 0.2 * Math.sin(frame / 23 + i * 2),
        }}
      />
    ))}
    <Row frame={frame} y={640} tubs={FAR} prefix="arf" blur={3.2} drift={-frame * 0.25} dim={0.55} density={26} />
    <Row frame={frame} y={1000} tubs={MID} prefix="arm" blur={1.2} drift={-60 - frame * 0.45} dim={0.8} density={42} />
    <Row frame={frame} y={1430} tubs={NEAR} prefix="arn" blur={0} drift={-80 - frame * 0.8} dim={1} density={64} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,5,6,0.85) 0%, rgba(6,5,6,0.35) 30%, rgba(6,5,6,0) 45%, rgba(6,5,6,0) 70%, rgba(6,5,6,0.85) 100%)'}} />
  </AbsoluteFill>
);
