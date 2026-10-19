import type React from 'react';
import {random} from 'remotion';
import {EASE, mix, prog, SANS, SERIF} from '../kit/theme';
import {CONDENSED} from './forge';
import usa from './usa.json';

// ——— Hyper-lapse Midtown map (adapted from the New York film) ———

export const MAP = 2400;
const AVE = 230;
const ST = 74;
export const TARGET = {x: 1215, y: 1200};
const AVENUES = [
  {x: TARGET.x - AVE * 2.5, label: '8 Av'},
  {x: TARGET.x - AVE * 1.5, label: '7 Av'},
  {x: TARGET.x - AVE * 0.5, label: '6 Av'},
  {x: TARGET.x + AVE * 0.5, label: '5 Av'},
  {x: TARGET.x + AVE * 1.5, label: 'Madison'},
  {x: TARGET.x + AVE * 2.5, label: 'Park Av'},
];
const STREETS = Array.from({length: 23}, (_, i) => ({n: 58 - i, y: TARGET.y - (58 - i - 47) * ST}));

// Time-lapse traffic: long light trails racing along avenues and streets.
const TRAILS = Array.from({length: 64}, (_, i) => ({
  avenue: i % 3 !== 0,
  lane: i % 3 !== 0 ? i % 6 : 3 + ((i * 7) % 18),
  dir: i % 2 ? 1 : -1,
  speed: 0.0042 + random(`tr${i}`) * 0.0045,
  offset: random(`to${i}`),
  warm: random(`tw${i}`) > 0.35,
  length: 120 + random(`tl${i}`) * 220,
}));

export const HyperlapseMap: React.FC<{frame: number; diamond: number}> = ({frame, diamond}) => {
  const glow = prog(frame, diamond - 6, 30);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 10);
  const left = AVENUES[0].x - AVE;
  const right = AVENUES[AVENUES.length - 1].x + AVE;
  return (
    <svg width={MAP} height={MAP} viewBox={`0 0 ${MAP} ${MAP}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="hl-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="hl-mask">
          <rect width={MAP} height={MAP} fill="url(#hl-fade)" />
        </mask>
      </defs>
      <g mask="url(#hl-mask)">
        {AVENUES.slice(0, -1).map((a, i) =>
          STREETS.slice(0, -1).map((s, j) => {
            // Windows flicker on and off as hours pass in seconds.
            const lit = random(`win${i}-${j}-${Math.floor(frame / 9)}`) > 0.7;
            return (
              <rect
                key={`${i}-${j}`}
                x={a.x + 9}
                y={s.y + 9}
                width={AVE - 18}
                height={ST - 18}
                rx={4}
                fill={lit ? 'rgba(255,214,150,0.075)' : 'rgba(255,240,210,0.04)'}
                stroke="rgba(255,170,90,0.28)"
                strokeWidth={1.2}
              />
            );
          }),
        )}
        {AVENUES.map((a) => (
          <line key={a.label} x1={a.x} x2={a.x} y1={0} y2={MAP} stroke="rgba(255,170,90,0.42)" strokeWidth={3} />
        ))}
        {STREETS.map((s) => (
          <line key={s.n} x1={left} x2={right} y1={s.y} y2={s.y} stroke="rgba(255,170,90,0.1)" strokeWidth={1.5} />
        ))}
        <line x1={TARGET.x - AVE * 3} y1={TARGET.y + ST * 13} x2={TARGET.x + AVE * 0.2} y2={TARGET.y - ST * 13} stroke="rgba(255,170,90,0.2)" strokeWidth={3} />
        {TRAILS.map((t, i) => {
          const along = (((t.offset + frame * t.speed) % 1) + 1) % 1;
          const x = t.avenue ? AVENUES[t.lane].x + (t.dir > 0 ? 7 : -7) : mix(left, right, t.dir > 0 ? along : 1 - along);
          const y = t.avenue ? mix(0, MAP, t.dir > 0 ? along : 1 - along) : STREETS[t.lane].y;
          const dx = t.avenue ? 0 : -t.dir * t.length;
          const dy = t.avenue ? -t.dir * t.length : 0;
          const color = t.warm ? '255,190,120' : '255,90,70';
          return (
            <g key={`t${i}`}>
              <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke={`rgba(${color},0.4)`} strokeWidth={5} strokeLinecap="round" />
              <line x1={x} y1={y} x2={x + dx * 0.4} y2={y + dy * 0.4} stroke={`rgba(${color},0.8)`} strokeWidth={3} strokeLinecap="round" />
              <circle cx={x} cy={y} r={4.5} fill={t.warm ? '#fff3d6' : '#ffd0c8'} />
            </g>
          );
        })}
        {STREETS.filter((s) => s.n % 2 === 0 || s.n === 47).map((s) => (
          <text
            key={`t${s.n}`}
            x={AVENUES[1].x + 14}
            y={s.y - 8}
            fill={s.n === 47 ? '#ffd9a0' : 'rgba(230,200,160,0.4)'}
            fontFamily={SANS}
            fontWeight={500}
            fontSize={s.n === 47 ? 26 : 20}
            letterSpacing={4}
          >
            {`W ${s.n} ST`}
          </text>
        ))}
        <rect
          x={TARGET.x - AVE / 2 + 9}
          y={TARGET.y - ST + 9}
          width={AVE - 18}
          height={ST * 2 - 18}
          rx={6}
          fill={`rgba(255,170,80,${0.14 * glow})`}
          stroke={`rgba(255,214,150,${0.75 * glow})`}
          strokeWidth={2}
        />
        <line
          x1={TARGET.x - AVE / 2}
          x2={TARGET.x + AVE / 2}
          y1={TARGET.y}
          y2={TARGET.y}
          stroke="#ffe0b0"
          strokeWidth={7}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - glow}
          style={{filter: `drop-shadow(0 0 ${12 + pulse * 10}px rgba(255,190,110,0.9))`}}
        />
      </g>
    </svg>
  );
};

// ——— Brass address plaque (adapted from the New York film) ———

const Screw: React.FC<{x: number; y: number}> = ({x, y}) => (
  <div
    style={{
      position: 'absolute',
      left: x - 9,
      top: y - 9,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, #fff3c8, #b08a33 55%, #5c4512)',
      boxShadow: '0 1px 0 rgba(255,240,200,0.5), inset 0 -1px 2px rgba(0,0,0,0.5)',
    }}
  >
    <div style={{position: 'absolute', left: 3, right: 3, top: 8, height: 2, background: 'rgba(60,45,10,0.7)', rotate: '35deg'}} />
  </div>
);

const engraved: React.CSSProperties = {color: '#4a3610', textShadow: '0 1.5px 0 rgba(255,244,210,0.55), 0 -1px 0 rgba(0,0,0,0.25)'};

export const Plaque: React.FC<{frame: number; at: number; glint: number; x: number; y: number; scale: number}> = ({frame, at, glint, x, y, scale}) => {
  const p = prog(frame, at, 40, EASE.out);
  const sweep = prog(frame, glint, 50, EASE.inOut);
  const PW = 780;
  const PH = 400;
  return (
    <div style={{position: 'absolute', left: x - PW / 2, top: y - PH / 2, width: PW, height: PH, opacity: p, scale: String(scale * mix(0.94, 1, p))}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          background:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0) 4px), linear-gradient(115deg, #7d5f1c 0%, #c9a246 22%, #f3dc98 40%, #d2ad52 55%, #9c7726 78%, #c8a043 100%)',
          boxShadow: 'inset 0 2px 0 rgba(255,250,225,0.65), inset 0 -4px 0 rgba(60,40,5,0.45), 0 50px 90px rgba(0,0,0,0.7), 0 0 80px rgba(255,160,70,0.2)',
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', inset: 16, borderRadius: 10, boxShadow: 'inset 0 1px 0 rgba(60,40,5,0.5), 0 1px 0 rgba(255,245,215,0.5)'}} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(110deg, rgba(255,255,255,0) ${mix(-30, 130, sweep) - 12}%, rgba(255,252,235,0.75) ${mix(-30, 130, sweep)}%, rgba(255,255,255,0) ${mix(-30, 130, sweep) + 12}%)`,
            mixBlendMode: 'screen',
          }}
        />
      </div>
      <Screw x={34} y={34} />
      <Screw x={PW - 34} y={34} />
      <Screw x={34} y={PH - 34} />
      <Screw x={PW - 34} y={PH - 34} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40}}>
        <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 250, lineHeight: 1, fontVariantNumeric: 'lining-nums', ...engraved}}>20</div>
        <div style={{width: 2, height: 220, background: 'rgba(74,54,16,0.55)', boxShadow: '1px 0 0 rgba(255,244,210,0.5)'}} />
        <div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, letterSpacing: '0.3em', ...engraved}}>WEST</div>
          <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 104, lineHeight: 1, ...engraved}}>47th St.</div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.3em', marginTop: 12, ...engraved}}>LOWER LEVEL · #24</div>
        </div>
      </div>
    </div>
  );
};

// ——— Showroom counter: dark glass on a brass rail ———

export const COUNTER_TOP = 1190;
export const COUNTER_EDGE = 1300;

export const Counter: React.FC<{frame: number}> = ({frame}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="dc-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#14171c" stopOpacity="0.92" />
        <stop offset="1" stopColor="#262a31" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="dc-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a2a18" stopOpacity="0.55" />
        <stop offset="0.4" stopColor="#1a120b" stopOpacity="0.85" />
        <stop offset="1" stopColor="#07060a" />
      </linearGradient>
      <linearGradient id="dc-brass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#6e5114" />
        <stop offset="0.3" stopColor="#e5c264" />
        <stop offset="0.5" stopColor="#fff1c4" />
        <stop offset="0.7" stopColor="#c99a3a" />
        <stop offset="1" stopColor="#6e5114" />
      </linearGradient>
    </defs>
    {/* Glass top in perspective */}
    <path d={`M40 ${COUNTER_EDGE} L1040 ${COUNTER_EDGE} L920 ${COUNTER_TOP} L160 ${COUNTER_TOP} Z`} fill="url(#dc-glass)" />
    {[0, 1, 2].map((i) => {
      const x = 220 + i * 260 + Math.sin(frame / 80 + i) * 10;
      return <path key={i} d={`M${x} ${COUNTER_TOP} L${x + 70} ${COUNTER_TOP} L${x + 30} ${COUNTER_EDGE} L${x - 50} ${COUNTER_EDGE} Z`} fill="rgba(255,255,255,0.035)" />;
    })}
    <line x1={160} y1={COUNTER_TOP} x2={920} y2={COUNTER_TOP} stroke="rgba(255,240,210,0.25)" strokeWidth={1.5} />
    {/* Brass rail */}
    <rect x={30} y={COUNTER_EDGE - 3} width={1020} height={9} rx={4} fill="url(#dc-brass)" />
    {/* Front: lit display case */}
    <rect x={40} y={COUNTER_EDGE + 6} width={1000} height={150} fill="url(#dc-front)" />
    <rect x={40} y={COUNTER_EDGE + 6} width={1000} height={150} fill="none" stroke="rgba(255,200,130,0.12)" />
    <ellipse cx={540} cy={COUNTER_EDGE + 30} rx={420} ry={36} fill="rgba(255,170,90,0.12)" />
  </svg>
);

// ——— Sealed canvas grain bag ———

export const BAG_W = 330;
export const BAG_H = 380;

export const Bag: React.FC<{squash?: number}> = ({squash = 0}) => (
  <div style={{position: 'relative', width: BAG_W, height: BAG_H, transformOrigin: '50% 100%', scale: `${1 + squash * 0.08} ${1 - squash * 0.1}`}}>
    {/* Body */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 46,
        bottom: 0,
        borderRadius: '26px 26px 40px 40px / 18px 18px 46px 46px',
        background:
          'repeating-linear-gradient(0deg, rgba(60,45,25,0.13) 0px, rgba(60,45,25,0.13) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px), repeating-linear-gradient(90deg, rgba(60,45,25,0.12) 0px, rgba(60,45,25,0.12) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px), radial-gradient(ellipse 70% 60% at 42% 45%, #e2d2b0 0%, #c8b28a 55%, #8f7854 100%)',
        boxShadow: 'inset -18px -14px 40px rgba(50,35,15,0.45), inset 10px 6px 24px rgba(255,245,220,0.25)',
      }}
    />
    <div style={{position: 'absolute', left: 10, right: 10, top: 60, height: 40, background: 'linear-gradient(180deg, rgba(60,42,18,0.4), rgba(0,0,0,0))', borderRadius: '50% 50% 0 0 / 30% 30% 0 0'}} />
    {/* Stitched side seams */}
    <div style={{position: 'absolute', left: 14, top: 64, bottom: 24, width: 0, borderLeft: '2px dashed rgba(70,52,28,0.45)'}} />
    <div style={{position: 'absolute', right: 14, top: 64, bottom: 24, width: 0, borderLeft: '2px dashed rgba(70,52,28,0.45)'}} />
    {/* Crimped, heat-sealed top */}
    <div
      style={{
        position: 'absolute',
        left: 18,
        right: 18,
        top: 6,
        height: 58,
        background: 'linear-gradient(180deg, #d9c7a2 0%, #b59d74 100%)',
        clipPath:
          'polygon(0 18%, 5% 0, 10% 18%, 15% 0, 20% 18%, 25% 0, 30% 18%, 35% 0, 40% 18%, 45% 0, 50% 18%, 55% 0, 60% 18%, 65% 0, 70% 18%, 75% 0, 80% 18%, 85% 0, 90% 18%, 95% 0, 100% 18%, 100% 100%, 0 100%)',
        boxShadow: 'inset 0 -6px 10px rgba(60,40,15,0.35)',
      }}
    />
    <div style={{position: 'absolute', left: 18, right: 18, top: 30, height: 14, background: 'repeating-linear-gradient(90deg, rgba(90,66,32,0.55) 0px, rgba(90,66,32,0.55) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)'}} />
    {/* Tag */}
    <div
      style={{
        position: 'absolute',
        left: 50,
        right: 50,
        top: 150,
        height: 128,
        borderRadius: 8,
        background: 'linear-gradient(180deg, #f4efe4, #e2dbcd)',
        boxShadow: '0 4px 10px rgba(40,28,10,0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        rotate: '-2deg',
      }}
    >
      <div style={{fontFamily: CONDENSED, fontWeight: 600, fontSize: 34, letterSpacing: '0.08em', color: '#1d1a20', whiteSpace: 'nowrap'}}>CASTING GRAIN</div>
      <div style={{width: 110, height: 2, background: '#b08a33'}} />
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 13, letterSpacing: '0.2em', color: '#5b5660', whiteSpace: 'nowrap'}}>BULLION TRADING LLC</div>
    </div>
  </div>
);

// ——— US route map ———

type City = {name: string; x: number; y: number};
export const MAP_W = 1000;
const K = MAP_W / usa.width;
export const US_X = 40;
export const US_Y = 730;
const NYC = {x: US_X + usa.cities['New York'][0] * K, y: US_Y + usa.cities['New York'][1] * K};
// Ordered so routes fan out in every direction rather than sweeping one way.
const ORDER = ['Chicago', 'Miami', 'Los Angeles', 'Atlanta', 'Dallas', 'Boston', 'Seattle', 'Denver', 'Houston', 'Detroit', 'Phoenix', 'Charlotte', 'San Francisco', 'Minneapolis', 'Nashville', 'Las Vegas', 'Kansas City', 'Portland', 'Salt Lake City'];
const CITIES: City[] = ORDER.map((name) => {
  const [x, y] = usa.cities[name as keyof typeof usa.cities];
  return {name, x: US_X + x * K, y: US_Y + y * K};
});

const ctrl = (c: City) => {
  const mx = (NYC.x + c.x) / 2;
  const my = (NYC.y + c.y) / 2;
  const d = Math.hypot(c.x - NYC.x, c.y - NYC.y);
  return {x: mx, y: my - d * 0.28};
};

const bezier = (c: City, t: number) => {
  const q = ctrl(c);
  return {
    x: (1 - t) ** 2 * NYC.x + 2 * (1 - t) * t * q.x + t ** 2 * c.x,
    y: (1 - t) ** 2 * NYC.y + 2 * (1 - t) * t * q.y + t ** 2 * c.y,
  };
};

const DOTS = usa.dots.map(([x, y]) => {
  const sx = US_X + x * K;
  const sy = US_Y + y * K;
  return {x: sx, y: sy, d: Math.hypot(sx - NYC.x, sy - NYC.y)};
});

export const RouteMap: React.FC<{frame: number; reveal: number; ship: number; anywhere: number}> = ({frame, reveal, ship, anywhere}) => {
  const glow = prog(frame, anywhere, 40);
  const pulse = (frame % 50) / 50;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="dr-route" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe3a8" />
          <stop offset="1" stopColor="#ff8a3c" />
        </linearGradient>
        <radialGradient id="dr-glow">
          <stop offset="0" stopColor="rgba(255,150,70,0.35)" />
          <stop offset="1" stopColor="rgba(255,150,70,0)" />
        </radialGradient>
      </defs>
      <ellipse cx={540} cy={US_Y + 320} rx={560 * glow} ry={330 * glow} fill="url(#dr-glow)" />
      <path
        d={usa.outline}
        transform={`translate(${US_X} ${US_Y}) scale(${K})`}
        fill="none"
        stroke={`rgba(255,180,110,${0.18 + glow * 0.4})`}
        strokeWidth={1.6 / K}
        opacity={prog(frame, reveal, 40)}
      />
      {DOTS.map((d, i) => {
        const on = prog(frame, reveal + d.d / 26, 18);
        const warm = prog(frame, anywhere + d.d / 18, 22);
        if (on <= 0) {
          return null;
        }
        return (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={2.7}
            fill={warm > 0 ? `rgba(${Math.round(mix(190, 255, warm))},${Math.round(mix(205, 170, warm))},${Math.round(mix(225, 100, warm))},${mix(0.3, 0.75, warm)})` : 'rgba(190,205,225,0.3)'}
            opacity={on}
          />
        );
      })}
      {CITIES.map((c, i) => {
        const start = ship + i * 4;
        const dist = Math.hypot(c.x - NYC.x, c.y - NYC.y);
        const dur = 34 + dist / 18;
        const t = prog(frame, start, dur, EASE.inOut);
        if (t <= 0) {
          return null;
        }
        const q = ctrl(c);
        const head = bezier(c, t);
        const arrived = frame - (start + dur);
        const ping = arrived >= 0 ? Math.min(1, arrived / 30) : -1;
        return (
          <g key={c.name}>
            <path
              d={`M${NYC.x} ${NYC.y} Q${q.x} ${q.y} ${c.x} ${c.y}`}
              fill="none"
              stroke="url(#dr-route)"
              strokeWidth={2.4}
              strokeOpacity={0.85}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - t}
              style={{filter: 'drop-shadow(0 0 5px rgba(255,150,70,0.8))'}}
            />
            {t < 1 ? (
              <>
                <circle cx={head.x} cy={head.y} r={12} fill="rgba(255,190,110,0.25)" />
                <circle cx={head.x} cy={head.y} r={4.5} fill="#fff4dc" />
              </>
            ) : null}
            {ping >= 0 ? (
              <>
                <circle cx={c.x} cy={c.y} r={5} fill="#ffd9a0" />
                <circle cx={c.x} cy={c.y} r={6 + ping * 30} fill="none" stroke="#ffb46a" strokeWidth={2} opacity={1 - ping} />
              </>
            ) : null}
          </g>
        );
      })}
      {/* New York: the origin */}
      <g opacity={prog(frame, reveal, 20)}>
        <circle cx={NYC.x} cy={NYC.y} r={14 + pulse * 40} fill="none" stroke="#ffb46a" strokeWidth={2} opacity={1 - pulse} />
        <circle cx={NYC.x} cy={NYC.y} r={22} fill="rgba(255,170,90,0.3)" />
        <circle cx={NYC.x} cy={NYC.y} r={9} fill="#fff1d0" />
        <text x={NYC.x - 16} y={NYC.y - 30} textAnchor="end" fontFamily={CONDENSED} fontWeight={600} fontSize={30} letterSpacing={3} fill="#ffe3b8">
          NEW YORK
        </text>
      </g>
    </svg>
  );
};
