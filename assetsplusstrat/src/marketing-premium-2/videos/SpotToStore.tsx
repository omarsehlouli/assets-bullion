import type React from 'react';
import {AbsoluteFill, Img, random} from 'remotion';
import {EndCard} from '../../marketing-premium/kit/EndCard';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps, Eyebrow, italic, MaskLine, Metal, Rise, serif} from '../../marketing-premium/kit/Text';
import {art, C, EASE, mix, prog, SANS, SERIF, SILVER_GRADIENT, type SceneProps} from '../../marketing-premium/kit/theme';

// From Spot to Store — how a bar is priced: the live spot market, a premium
// for making and moving the metal, our live quote plus a transparent premium,
// and the four live charts.

// Illustrative live trace — shapes only, never figures.
const trace = (seed: string, n: number, frame: number, speed = 0.4) =>
  Array.from({length: n}, (_, i) => {
    const t = i / (n - 1);
    const a = random(`${seed}a`) * 6;
    const k = frame * speed * 0.01;
    return (
      0.5 -
      0.16 * t +
      0.11 * Math.sin(t * 9 + a + k) +
      0.06 * Math.sin(t * 23 + a * 2 - k * 1.7) +
      0.03 * Math.sin(t * 57 + a * 3 + k * 2.3)
    );
  });

const LiveDot: React.FC<{frame: number; color?: string; size?: number}> = ({frame, color = '233,199,102', size = 12}) => {
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

const Trace: React.FC<{
  frame: number;
  seed: string;
  w: number;
  h: number;
  draw: number;
  color: string;
  glow: string;
  fill?: boolean;
  id: string;
}> = ({frame, seed, w, h, draw, color, glow, fill = true, id}) => {
  const values = trace(seed, 90, frame);
  const shown = values.slice(0, Math.max(2, Math.round(draw * values.length)));
  const pts = shown.map((v, i) => [(i / (values.length - 1)) * w, v * h] as const);
  const head = pts[pts.length - 1];
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const pulse = (frame % 50) / 50;
  return (
    <svg width={w} height={h} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <path d={`${d} L${head[0]} ${h} L0 ${h} Z`} fill={`url(#${id})`} /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth={3.2} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 8px ${glow})`}} />
      <circle cx={head[0]} cy={head[1]} r={7} fill="#fff6dc" />
      <circle cx={head[0]} cy={head[1]} r={7 + pulse * 22} fill="none" stroke={color} strokeOpacity={1 - pulse} strokeWidth={2} />
    </svg>
  );
};

const Glass: React.FC<{x: number; y: number; w: number; h: number; opacity?: number; lit?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({
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

// ——— Hook: a bar with a blank price tag ———

const Hook: React.FC<SceneProps> = ({frame, cue}) => {
  const land = prog(frame, 0, 80, EASE.silk);
  const tagIn = prog(frame, cue('price') - 10, 30, EASE.out);
  const swing = Math.sin(frame / 22) * 9 * (1 - prog(frame, 150, 60)) + Math.sin(frame / 40) * 3;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('What') - 8}>
          <div style={serif(124)}>What sets</div>
        </Rise>
        <MaskLine frame={frame} at={cue('price') - 6} dur={42}>
          <div style={italic(168, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={cue('gold') + 6}>
              the price?
            </Metal>
          </div>
        </MaskLine>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 820,
          width: 1080,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse 45% 50% at 50% 50%, rgba(232,190,100,0.26), rgba(0,0,0,0) 70%)',
          opacity: land,
        }}
      />
      <Product src="bar-justice-obv.png" frame={frame} w={640} h={517} x={500} y={mix(1150, 1060, land)} opacity={land} rotate={mix(-6, 0, land)} float={6} sheen={[cue('bar')]} glow="rgba(214,168,74,0.25)" />
      {/* Hanging tag */}
      <div style={{position: 'absolute', left: 720, top: 760, width: 200, height: 330, transformOrigin: '30px 0px', rotate: `${swing - 8}deg`, opacity: tagIn}}>
        <svg width={200} height={330} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path d="M30 0 C 40 60, 60 100, 80 130" fill="none" stroke="#d9c79b" strokeWidth={2} />
          <path d="M60 130 L170 130 L195 175 L170 320 L60 320 L35 175 Z" fill="#f2ecdc" stroke="#b8902f" strokeWidth={2} style={{filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.55))'}} />
          <circle cx={115} cy={152} r={8} fill="#0b0b0e" stroke="#b8902f" strokeWidth={2} />
          <text x={115} y={270} textAnchor="middle" fontFamily={SERIF} fontSize={110} fontWeight={600} fill="#7a5a16">
            ?
          </text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ——— Spot: the live market, Sunday evening to Friday afternoon ———

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_W = 124;
const TL_X = 540 - (DAY_W * 7) / 2;

const Spot: React.FC<SceneProps> = ({frame, cue}) => {
  const spot = cue('spot');
  const sunday = cue('Sunday');
  const afternoon = cue('afternoon');
  const panel = prog(frame, spot - 10, 34, EASE.out);
  const tl = prog(frame, cue('traded') - 10, 34, EASE.out);
  // The trading window: Sunday evening (≈ 75% through Sunday) to Friday afternoon (≈ 70% through Friday).
  const start = TL_X + DAY_W * 0.75;
  const end = TL_X + DAY_W * 5.7;
  const fill = prog(frame, sunday - 6, afternoon - sunday + 30, EASE.inOut);
  const clock = prog(frame, cue('clock') - 10, 30);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('starts') - 8}>
          <div style={serif(118)}>It starts</div>
        </Rise>
        <MaskLine frame={frame} at={spot - 6}>
          <div style={italic(156, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={spot + 20}>
              with spot.
            </Metal>
          </div>
        </MaskLine>
        <div style={{marginTop: 18}}>
          <Eyebrow frame={frame} at={cue('live') - 6}>
            The live market price
          </Eyebrow>
        </div>
      </div>
      <Glass x={90} y={720} w={900} h={330} opacity={panel} style={{translate: `0 ${(1 - panel) * 50}px`}}>
        <div style={{position: 'absolute', left: 34, top: 26, display: 'flex', alignItems: 'center', gap: 14}}>
          <LiveDot frame={frame} />
          <span style={caps(18)}>Spot · Gold</span>
        </div>
        <div style={{position: 'absolute', right: 30, top: 22, padding: '6px 16px', borderRadius: 999, border: '1px solid rgba(233,199,102,0.6)', ...caps(14, {color: '#f0d27a', letterSpacing: '0.3em'})}}>Live</div>
        <div style={{position: 'absolute', left: 34, top: 80}}>
          <Trace frame={frame} seed="spot" w={832} h={220} draw={prog(frame, spot, 260, EASE.silk)} color="#e9c766" glow="rgba(233,199,102,0.7)" id="spot-fill" />
        </div>
      </Glass>
      {/* Week timeline */}
      <div style={{position: 'absolute', left: 0, top: 1110, width: 1080, opacity: tl, translate: `0 ${(1 - tl) * 30}px`}}>
        <svg width={1080} height={260} style={{overflow: 'visible'}}>
          {DAYS.map((d, i) => (
            <g key={d}>
              <rect x={TL_X + i * DAY_W + 3} y={40} width={DAY_W - 6} height={56} rx={10} fill="rgba(255,255,255,0.04)" stroke="rgba(255,240,210,0.12)" />
              <text x={TL_X + i * DAY_W + DAY_W / 2} y={128} textAnchor="middle" fontFamily={SANS} fontSize={19} fontWeight={600} letterSpacing={4} fill={i === 0 || i === 6 ? 'rgba(244,238,223,0.45)' : 'rgba(244,238,223,0.75)'}>
                {d.toUpperCase()}
              </text>
            </g>
          ))}
          <rect x={start} y={50} width={Math.max(0, (end - start) * fill)} height={36} rx={8} fill="url(#tl-fill)" style={{filter: 'drop-shadow(0 0 10px rgba(226,196,108,0.6))'}} />
          <defs>
            <linearGradient id="tl-fill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8a6a1f" />
              <stop offset="0.5" stopColor="#e9c766" />
              <stop offset="1" stopColor="#f6e3a1" />
            </linearGradient>
          </defs>
          {/* Markers */}
          <g opacity={prog(frame, sunday - 4, 16)}>
            <line x1={start} x2={start} y1={30} y2={104} stroke="#f6e3a1" strokeWidth={2} />
            <text x={start} y={20} textAnchor="middle" fontFamily={SANS} fontSize={17} fontWeight={600} letterSpacing={3} fill="#f6e3a1">
              SUN EVENING
            </text>
          </g>
          <g opacity={prog(frame, afternoon - 4, 16)}>
            <line x1={end} x2={end} y1={30} y2={104} stroke="#f6e3a1" strokeWidth={2} />
            <text x={end} y={20} textAnchor="middle" fontFamily={SANS} fontSize={17} fontWeight={600} letterSpacing={3} fill="#f6e3a1">
              FRI AFTERNOON
            </text>
          </g>
          {/* Around the clock */}
          <g transform="translate(540 205)" opacity={clock}>
            <circle r={28} fill="none" stroke="rgba(226,196,108,0.6)" strokeWidth={2} />
            <line x1={0} y1={0} x2={0} y2={-18} stroke="#f6e3a1" strokeWidth={3} strokeLinecap="round" transform={`rotate(${frame * 6})`} />
            <line x1={0} y1={0} x2={13} y2={0} stroke="#f6e3a1" strokeWidth={3} strokeLinecap="round" transform={`rotate(${frame * 0.5})`} />
          </g>
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', ...caps(16, {color: C.mute}), opacity: clock}}>Nearly around the clock · New York time</div>
      </div>
    </AbsoluteFill>
  );
};

// ——— Premium: what it takes to make it and move it ———

const LAYERS = [
  {word: 'refining', label: 'Refining', tone: ['#5e4a1c', '#8a6a24']},
  {word: 'minting', label: 'Minting', tone: ['#6e5622', '#9c7a2c']},
  {word: 'insurance', label: 'Insurance', tone: ['#7e6328', '#ae8a36']},
  {word: 'shipping', label: 'Shipping', tone: ['#8f712e', '#c6a044']},
];

const COL = {x: 230, w: 300, base: 1360, spotH: 300, layerH: 74};

const Premium: React.FC<SceneProps> = ({frame, cue}) => {
  const premium = cue('premium');
  const spotIn = prog(frame, 0, 30, EASE.out);
  const outline = prog(frame, premium - 6, 30, EASE.out);
  const total = COL.layerH * LAYERS.length;
  const topY = COL.base - COL.spotH - total;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('Then') - 8}>
          <div style={serif(112)}>Then comes</div>
        </Rise>
        <MaskLine frame={frame} at={premium - 6}>
          <div style={italic(150, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={premium + 24}>
              the premium.
            </Metal>
          </div>
        </MaskLine>
        <div style={{marginTop: 16}}>
          <Eyebrow frame={frame} at={cue('what') - 6}>
            What it takes to make it &amp; move it
          </Eyebrow>
        </div>
      </div>
      <svg width={1080} height={1440} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="spot-block" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8a6a1f" />
            <stop offset="0.35" stopColor="#e9c766" />
            <stop offset="0.55" stopColor="#f6e3a1" />
            <stop offset="1" stopColor="#a8842c" />
          </linearGradient>
          {LAYERS.map((l, i) => (
            <linearGradient key={l.word} id={`layer-${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={l.tone[0]} />
              <stop offset="0.5" stopColor={l.tone[1]} />
              <stop offset="1" stopColor={l.tone[0]} />
            </linearGradient>
          ))}
        </defs>
        {/* Spot base */}
        <g opacity={spotIn} transform={`translate(0 ${(1 - spotIn) * 40})`}>
          <rect x={COL.x} y={COL.base - COL.spotH} width={COL.w} height={COL.spotH} rx={10} fill="url(#spot-block)" />
          <text x={COL.x + COL.w / 2} y={COL.base - COL.spotH / 2 + 14} textAnchor="middle" fontFamily={SANS} fontSize={34} fontWeight={700} letterSpacing={10} fill="#3a2a0a">
            SPOT
          </text>
        </g>
        {/* Empty premium region waiting to be filled */}
        <rect
          x={COL.x}
          y={topY}
          width={COL.w}
          height={total}
          rx={10}
          fill="none"
          stroke="rgba(226,196,108,0.55)"
          strokeWidth={2}
          strokeDasharray="10 10"
          opacity={outline * (1 - prog(frame, cue('shipping') + 10, 20))}
        />
        {LAYERS.map((l, i) => {
          const at = cue(l.word);
          const p = prog(frame, at - 8, 22, EASE.out);
          const y = COL.base - COL.spotH - (i + 1) * COL.layerH;
          return (
            <g key={l.word} opacity={p}>
              <rect x={COL.x} y={y - (1 - p) * 90} width={COL.w} height={COL.layerH - 6} rx={8} fill={`url(#layer-${i})`} stroke="rgba(255,240,200,0.35)" />
              <line x1={COL.x + COL.w + 16} x2={COL.x + COL.w + 70} y1={y + COL.layerH / 2 - 3} y2={y + COL.layerH / 2 - 3} stroke="rgba(226,196,108,0.6)" strokeWidth={1.5} />
              <text x={COL.x + COL.w + 86} y={y + COL.layerH / 2 + 9} fontFamily={SANS} fontSize={30} fontWeight={600} letterSpacing={6} fill="#f4eedf">
                {l.label.toUpperCase()}
              </text>
            </g>
          );
        })}
        {/* Premium bracket */}
        <g opacity={outline}>
          <path
            d={`M${COL.x - 24} ${topY + 6} H${COL.x - 40} V${topY + total - 6} H${COL.x - 24}`}
            fill="none"
            stroke="#e2c46c"
            strokeWidth={2.5}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - outline}
          />
          <text
            x={COL.x - 62}
            y={topY + total / 2}
            textAnchor="middle"
            fontFamily={SANS}
            fontSize={22}
            fontWeight={600}
            letterSpacing={8}
            fill="#e2c46c"
            transform={`rotate(-90 ${COL.x - 62} ${topY + total / 2})`}
          >
            PREMIUM
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ——— Store: live quote + transparent premium, repriced within minutes ———

const Chip: React.FC<{frame: number; at: number; label: string; accent?: boolean}> = ({frame, at, label, accent}) => {
  const p = prog(frame, at - 6, 26, EASE.out);
  return (
    <div
      style={{
        padding: '16px 26px',
        borderRadius: 999,
        border: `1.5px solid ${accent ? 'rgba(246,227,161,0.9)' : 'rgba(212,175,55,0.5)'}`,
        background: accent ? 'linear-gradient(180deg, rgba(212,175,55,0.35), rgba(120,90,20,0.25))' : 'rgba(30,26,18,0.6)',
        opacity: p,
        translate: `0 ${(1 - p) * 24}px`,
        scale: String(mix(0.9, 1, p)),
        ...caps(22, {color: accent ? '#fff4d6' : C.ivory, letterSpacing: '0.2em'}),
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
};

const Op: React.FC<{frame: number; at: number; children: string}> = ({frame, at, children}) => (
  <span style={{...serif(64, {color: C.gold}), opacity: prog(frame, at - 6, 20)}}>{children}</span>
);

const Store: React.FC<SceneProps> = ({frame, cue}) => {
  const live = cue('live');
  const plus = cue('plus');
  const premium = cue('premium');
  const reprice = cue('reprice');
  const minutes = cue('minutes');
  const moves = cue('moves');
  const card = prog(frame, cue('and') - 20, 34, EASE.out);
  const flashes = [reprice, moves].map((at) => prog(frame, at - 2, 10) * (1 - prog(frame, at + 10, 26)));
  const flash = Math.max(...flashes);
  const spin = prog(frame, reprice - 2, 30, EASE.inOut) + prog(frame, moves - 2, 30, EASE.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('prices') - 8}>
          <div style={serif(110)}>Our prices,</div>
        </Rise>
        <Rise frame={frame} at={cue('built') - 6}>
          <div style={italic(98, {lineHeight: 1.1})}>
            <Metal frame={frame} sheenAt={premium}>
              built from live quotes.
            </Metal>
          </div>
        </Rise>
      </div>
      {/* Formula */}
      <div style={{position: 'absolute', top: 690, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18}}>
        <Chip frame={frame} at={live} label="Live quote" />
        <Op frame={frame} at={plus}>+</Op>
        <Chip frame={frame} at={cue('transparent')} label="Transparent premium" />
      </div>
      <div style={{position: 'absolute', top: 790, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18}}>
        <Op frame={frame} at={premium + 10}>=</Op>
        <Chip frame={frame} at={premium + 14} label="Our price" accent />
      </div>
      {/* The product card that re-prices */}
      <Glass x={110} y={920} w={860} h={420} opacity={card} lit={flash} style={{translate: `0 ${(1 - card) * 50}px`}}>
        <div style={{position: 'absolute', left: 30, top: 30, width: 250, height: 250, borderRadius: 20, background: 'radial-gradient(circle at 50% 40%, rgba(232,190,100,0.18), rgba(0,0,0,0) 70%)'}}>
          <Img src={art('bar-justice-obv.png')} style={{width: 250, height: 250, objectFit: 'contain'}} />
        </div>
        <div style={{position: 'absolute', left: 310, top: 40, right: 30}}>
          <div style={{fontFamily: SANS, fontSize: 28, fontWeight: 600, color: C.ivory, lineHeight: 1.25}}>1 oz PAMP Suisse Lady of Justice Gold Bar</div>
          <div style={{...caps(15, {color: C.mute, letterSpacing: '0.24em'}), marginTop: 10}}>Gold · in assay</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 36}}>
            <span style={caps(16, {color: '#f0d27a', letterSpacing: '0.24em'})}>Our price</span>
            <span
              style={{
                flex: 1,
                height: 22,
                borderRadius: 11,
                background: `linear-gradient(90deg, rgba(212,175,55,${0.2 + flash * 0.3}), rgba(255,236,180,${0.7 + flash * 0.3}) ${((frame * 1.3) % 170) - 35}%, rgba(212,175,55,${0.2 + flash * 0.3}))`,
                boxShadow: flash > 0.05 ? `0 0 ${24 * flash}px rgba(246,227,161,${0.8 * flash})` : undefined,
              }}
            />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 22}}>
            <svg width={30} height={30} viewBox="-15 -15 30 30" style={{rotate: `${spin * 360}deg`}}>
              <path d="M9 -6 A11 11 0 1 0 11 3" fill="none" stroke="#e2c46c" strokeWidth={2.6} strokeLinecap="round" />
              <path d="M5 -10 L10 -6 L5 -2" fill="none" stroke="#e2c46c" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{...caps(16, {color: flash > 0.05 ? '#fff4d6' : C.mute, letterSpacing: '0.22em'})}}>{frame >= reprice ? 'Repriced · just now' : 'Priced from live spot'}</span>
          </div>
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, bottom: 24, height: 90}}>
          <Trace frame={frame} seed="store" w={800} h={90} draw={prog(frame, card > 0 ? cue('and') : 0, 200, EASE.silk)} color="#e9c766" glow="rgba(233,199,102,0.6)" fill={false} id="store-trace" />
        </div>
      </Glass>
      <div style={{position: 'absolute', top: 1366, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={minutes - 6} color={C.mute}>
          Repriced within minutes when spot moves
        </Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

// ——— Charts: the four live metals ———

const METALS = [
  {word: 'gold', label: 'Gold', color: '#e9c766', glow: 'rgba(233,199,102,0.7)', rgb: '233,199,102'},
  {word: 'silver', label: 'Silver', color: '#dfe6ee', glow: 'rgba(223,230,238,0.6)', rgb: '223,230,238'},
  {word: 'platinum', label: 'Platinum', color: '#b9c7d6', glow: 'rgba(185,199,214,0.6)', rgb: '185,199,214'},
  {word: 'palladium', label: 'Palladium', color: '#d6b8a0', glow: 'rgba(214,184,160,0.6)', rgb: '214,184,160'},
];

const Charts: React.FC<SceneProps> = ({frame, cue}) => {
  const charts = cue('charts');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('Follow') - 8}>
          <div style={serif(112)}>Follow the</div>
        </Rise>
        <Rise frame={frame} at={cue('live') - 8}>
          <div style={italic(150, {lineHeight: 1.04})}>
            <Metal frame={frame} gradient={SILVER_GRADIENT} sheenAt={charts} glow="rgba(223,230,238,0.25)">
              live charts.
            </Metal>
          </div>
        </Rise>
      </div>
      {METALS.map((m, i) => {
        const at = cue(m.word);
        const p = prog(frame, at - 8, 26, EASE.out);
        const lit = prog(frame, at - 4, 14) * (1 - prog(frame, at + 30, 40)) + prog(frame, charts - 6, 20) * 0.5;
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <Glass key={m.word} x={70 + col * 480} y={680 + row * 350} w={460} h={320} opacity={p} lit={lit} style={{translate: `0 ${(1 - p) * 40}px`}}>
            <div style={{position: 'absolute', left: 26, top: 22, display: 'flex', alignItems: 'center', gap: 12}}>
              <LiveDot frame={frame + i * 11} color={m.rgb} size={10} />
              <span style={caps(22, {color: m.color, letterSpacing: '0.24em'})}>{m.label}</span>
            </div>
            <div style={{position: 'absolute', right: 22, top: 20, padding: '4px 12px', borderRadius: 999, border: `1px solid ${m.color}88`, ...caps(12, {color: m.color, letterSpacing: '0.28em'})}}>Live</div>
            <div style={{position: 'absolute', left: 24, top: 86}}>
              <Trace frame={frame} seed={m.word} w={412} h={200} draw={prog(frame, at - 6, 70, EASE.silk)} color={m.color} glow={m.glow} id={`chart-${m.word}`} />
            </div>
          </Glass>
        );
      })}
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="Priced from live spot"
    footer="Live charts · bulliontradingllc.com"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product src="bar-justice-obv.png" frame={frame} w={560} h={453} x={500} y={mix(960, 900, p)} opacity={p} float={6} sheen={[50]} glow="rgba(214,168,74,0.25)" />
          <Coin src="coin-maple.png" frame={frame} d={230} x={mix(880, 800, p)} y={1040} turn={mix(-90, -16, prog(frame, 8, 60))} roll={-6} opacity={prog(frame, 8, 30)} sheen={[70]} />
        </>
      );
    }}
  />
);

export const SPOT_SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  spot: Spot,
  premium: Premium,
  store: Store,
  charts: Charts,
  cta: Cta,
};
