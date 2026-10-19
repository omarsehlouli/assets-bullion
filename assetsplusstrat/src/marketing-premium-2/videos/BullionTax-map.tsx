import type React from 'react';
import {random} from 'remotion';
import usStates from '../data/us-states.json';
import {mix} from '../../marketing-premium/kit/theme';

// The United States, coloured by sales-tax status exactly as listed in
// Bullion Trading's state tax guide (bulliontradingllc.com/bullion-tax).

export type TaxStatus = 'exempt' | 'conditional' | 'taxable' | 'no_tax';

export type UsState = {
  code: string;
  name: string;
  status: TaxStatus;
  summary: string;
  d: string;
  cx: number;
  cy: number;
};

export const STATES = usStates.states as UsState[];
export const MAP_W = usStates.width;
export const MAP_H = usStates.height;
export const stateByCode = (code: string) => STATES.find((s) => s.code === code)!;

export const STATUS_LABEL: Record<TaxStatus, string> = {
  exempt: 'Fully exempt',
  conditional: 'Conditionally exempt',
  taxable: 'Taxable',
  no_tax: 'No state sales tax',
};

export const STATUS_COUNT: Record<TaxStatus, number> = STATES.reduce(
  (acc, s) => ({...acc, [s.status]: acc[s.status] + 1}),
  {exempt: 0, conditional: 0, taxable: 0, no_tax: 0} as Record<TaxStatus, number>,
);

// Legend swatches mirror the map fills.
export const SWATCH: Record<TaxStatus, string> = {
  exempt: 'linear-gradient(135deg, #f3dc8e, #c79a35 55%, #8f6a1e)',
  conditional: 'repeating-linear-gradient(45deg, #6b5a36 0px, #6b5a36 3px, #e9d6a3 3px, #e9d6a3 5px)',
  taxable: 'linear-gradient(135deg, #5a6272, #2c313b)',
  no_tax: 'linear-gradient(135deg, #fbf6ea, #d8ccb0)',
};

const FILL: Record<TaxStatus, string> = {
  exempt: 'url(#tx-gold)',
  conditional: 'url(#tx-hatch)',
  taxable: 'url(#tx-slate)',
  no_tax: 'url(#tx-ivory)',
};

// West→east stagger with a little jitter so fills ripple across the country.
export const sweepDelay = (s: UsState, span = 40) => (s.cx / MAP_W) * span + random(`tx${s.code}`) * 8;

export type Zoom = {code: string; scale: number; toX: number; toY: number; t: number};

export const TaxMap: React.FC<{
  x: number;
  y: number;
  width: number;
  // 0→1 outline draw-on per state.
  draw: (s: UsState) => number;
  // 0→1 fill per state.
  fill: (s: UsState) => number;
  // Extra glow 0→1 per state (pulses, highlights).
  glow?: (s: UsState) => number;
  // Dims every state not glowing.
  dim?: (s: UsState) => number;
  zoom?: Zoom;
  opacity?: number;
  blur?: number;
  sheen?: number;
  // Fade the map out above this y so it never runs under the captions.
  fadeBelow?: number;
}> = ({x, y, width, draw, fill, glow, dim, zoom, opacity = 1, blur = 0, sheen, fadeBelow}) => {
  const k = width / MAP_W;
  let s = k;
  let tx = x;
  let ty = y;
  if (zoom && zoom.t > 0) {
    const focus = stateByCode(zoom.code);
    // Ease the scale geometrically and glide the focus state toward its target.
    s = k * Math.pow(zoom.scale, zoom.t);
    tx = mix(x + focus.cx * k, zoom.toX, zoom.t) - focus.cx * s;
    ty = mix(y + focus.cy * k, zoom.toY, zoom.t) - focus.cy * s;
  }
  const sheenX = sheen === undefined ? -1000 : mix(-200, MAP_W + 200, sheen);
  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        overflow: 'visible',
        maskImage: fadeBelow === undefined ? undefined : `linear-gradient(180deg, black 0px, black ${fadeBelow}px, transparent ${fadeBelow + 120}px)`,
        WebkitMaskImage: fadeBelow === undefined ? undefined : `linear-gradient(180deg, black 0px, black ${fadeBelow}px, transparent ${fadeBelow + 120}px)`,
      }}
    >
      <defs>
        <linearGradient id="tx-gold" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={MAP_W} y2={MAP_H}>
          <stop offset="0" stopColor="#f3dc8e" />
          <stop offset="0.45" stopColor="#c99c36" />
          <stop offset="0.7" stopColor="#e7c66e" />
          <stop offset="1" stopColor="#8f6a1e" />
        </linearGradient>
        <linearGradient id="tx-slate" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={MAP_W} y2={MAP_H}>
          <stop offset="0" stopColor="#5a6272" />
          <stop offset="1" stopColor="#2c313b" />
        </linearGradient>
        <linearGradient id="tx-ivory" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={MAP_W} y2={MAP_H}>
          <stop offset="0" stopColor="#fbf6ea" />
          <stop offset="1" stopColor="#d8ccb0" />
        </linearGradient>
        <pattern id="tx-hatch" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={6} height={6} fill="#6b5a36" />
          <rect width={2.4} height={6} fill="#e9d6a3" />
        </pattern>
        <linearGradient id="tx-sheen" gradientUnits="userSpaceOnUse" x1={sheenX - 120} y1={0} x2={sheenX + 120} y2={0}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff8e0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="tx-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform={`translate(${tx} ${ty}) scale(${s})`}>
        {STATES.map((st) => {
          const f = fill(st);
          const g = glow ? glow(st) : 0;
          const dm = dim ? dim(st) : 0;
          return (
            <g key={st.code} opacity={1 - dm * 0.78}>
              <path d={st.d} fill={FILL[st.status]} fillOpacity={f * 0.92} />
              {g > 0.01 ? <path d={st.d} fill="#fff4cf" fillOpacity={g * 0.35} filter="url(#tx-glow)" /> : null}
              <path
                d={st.d}
                fill="none"
                stroke={g > 0.01 ? '#fff4cf' : 'rgba(255,240,210,0.55)'}
                strokeWidth={g > 0.01 ? 1.4 + g * 1.2 : 0.8}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - draw(st)}
                strokeLinejoin="round"
              />
            </g>
          );
        })}
        {sheen !== undefined && sheen > 0 && sheen < 1
          ? STATES.map((st) => <path key={`s${st.code}`} d={st.d} fill="url(#tx-sheen)" fillOpacity={fill(st)} style={{mixBlendMode: 'screen'}} />)
          : null}
      </g>
    </svg>
  );
};
