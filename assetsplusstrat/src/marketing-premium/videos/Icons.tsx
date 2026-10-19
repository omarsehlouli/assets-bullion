import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {EndCard} from '../kit/EndCard';
import {Phone, Pin, Skyline} from '../kit/Pieces';
import {Coin, Product} from '../kit/Product';
import {caps, Eyebrow, italic, MaskLine, Metal, Rise, serif} from '../kit/Text';
import {C, EASE, mix, prog, type SceneProps} from '../kit/theme';

const D = Math.PI / 180;

const Glow: React.FC<{x: number; y: number; w: number; h: number; opacity: number; strength?: number}> = ({x, y, w, h, opacity, strength = 0.26}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      borderRadius: '50%',
      background: `radial-gradient(ellipse at center, rgba(232,190,100,${strength}) 0%, rgba(232,190,100,${strength * 0.3}) 40%, rgba(0,0,0,0) 70%)`,
      opacity,
    }}
  />
);

// ——— Globe ———————————————————————————————————————————————————————————————

type P3 = [x: number, y: number, z: number];

const project = (lat: number, lon: number, spin: number, tilt: number, cx: number, cy: number, r: number): P3 => {
  const la = lat * D;
  const lo = (lon + spin) * D;
  const x = Math.cos(la) * Math.sin(lo);
  const y = Math.sin(la);
  const z = Math.cos(la) * Math.cos(lo);
  const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
  const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
  return [cx + r * x, cy - r * y2, z2];
};

// Splits a projected polyline into the half facing the camera and the half
// behind the globe, so the far side can be drawn faintly.
const split = (pts: P3[]) => {
  let front = '';
  let back = '';
  let side = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay, az] = pts[i];
    const [bx, by, bz] = pts[i + 1];
    const s = az + bz > 0 ? 1 : -1;
    const seg = `${s === side ? '' : `M${ax.toFixed(1)} ${ay.toFixed(1)}`}L${bx.toFixed(1)} ${by.toFixed(1)}`;
    if (s > 0) {
      front += seg;
    } else {
      back += seg;
    }
    side = s;
  }
  return {front, back};
};

const PARALLELS = [-60, -40, -20, 0, 20, 40, 60];
const MERIDIANS = Array.from({length: 18}, (_, i) => i * 20);
const ORIGINS = [
  {lat: 39, lon: -98},
  {lat: 57, lon: -100},
  {lat: -29, lon: 25},
  {lat: 53, lon: -2},
];

const Globe: React.FC<{frame: number; cx: number; cy: number; r: number; spin: number; bright: number; reveal: number}> = ({frame, cx, cy, r, spin, bright, reveal}) => {
  const tilt = 20 * D;
  const lines = [
    ...PARALLELS.map((lat) => Array.from({length: 61}, (_, i) => project(lat, -180 + i * 6, spin, tilt, cx, cy, r))),
    ...MERIDIANS.map((lon) => Array.from({length: 31}, (_, i) => project(-90 + i * 6, lon, spin, tilt, cx, cy, r))),
  ].map(split);
  const front = lines.map((l) => l.front).join('');
  const back = lines.map((l) => l.back).join('');
  const rr = r * mix(0.9, 1, reveal);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: reveal}}>
      <defs>
        <radialGradient id="globe-core" cx="0.42" cy="0.36" r="0.7">
          <stop offset="0" stopColor="#d4af37" stopOpacity={0.14 + bright * 0.08} />
          <stop offset="0.7" stopColor="#d4af37" stopOpacity={0.03} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="globe-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.8" stopColor="#e2c46c" stopOpacity={0} />
          <stop offset="0.9" stopColor="#e2c46c" stopOpacity={0.12 + bright * 0.12} />
          <stop offset="1" stopColor="#e2c46c" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={rr * 1.25} fill="url(#globe-halo)" />
      <circle cx={cx} cy={cy} r={rr} fill="url(#globe-core)" />
      <g transform={`translate(${cx} ${cy}) scale(${rr / r}) translate(${-cx} ${-cy})`}>
        <path d={back} fill="none" stroke="#d4af37" strokeOpacity={0.1 + bright * 0.05} strokeWidth={1.1} />
        <path
          d={front}
          fill="none"
          stroke="#e2c46c"
          strokeOpacity={0.42 + bright * 0.38}
          strokeWidth={1.4}
          style={{filter: `drop-shadow(0 0 ${4 + bright * 6}px rgba(226,196,108,${0.4 + bright * 0.4}))`}}
        />
        {ORIGINS.map((o, i) => {
          const [x, y, z] = project(o.lat, o.lon, spin, tilt, cx, cy, r);
          if (z < 0) {
            return null;
          }
          const ring = ((frame + i * 17) % 60) / 60;
          return (
            <g key={i} opacity={Math.min(1, z * 2.5) * (0.5 + bright * 0.5)}>
              <circle cx={x} cy={y} r={4 + ring * 18} fill="none" stroke="#f6e3a1" strokeOpacity={1 - ring} strokeWidth={1.4} />
              <circle cx={x} cy={y} r={4.5} fill="#fff4cf" />
            </g>
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r={rr} fill="none" stroke="#e2c46c" strokeOpacity={0.55 + bright * 0.35} strokeWidth={2} />
    </svg>
  );
};

// ——— 1 · Hook —————————————————————————————————————————————————————————————

const HOOK_COINS = [
  {src: 'coin-gold-eagle.png', phase: 0.5, settle: -63},
  {src: 'coin-maple.png', phase: 2.1, settle: -21},
  {src: 'coin-krugerrand.png', phase: 3.7, settle: 21},
  {src: 'coin-britannia.png', phase: 5.2, settle: 63},
];

const Hook: React.FC<SceneProps> = ({frame, cue}) => {
  const cx = 540;
  const cy = 1040;
  const world = cue('world');
  const settle = prog(frame, cue('over') - 6, 52, EASE.inOut);
  const bright = prog(frame, world - 6, 30) * (1 - 0.4 * prog(frame, world + 30, 40));
  const alpha = -14 * D;
  const coins = HOOK_COINS.map((c, i) => {
    const phi = c.phase + frame * 0.021;
    const ex = 470 * Math.cos(phi);
    const ey = 150 * Math.sin(phi);
    const depth = Math.sin(phi);
    const fly = prog(frame, 4 + i * 9, 74, EASE.out);
    const m = mix(2.7, 1, fly);
    const ox = cx + (ex * Math.cos(alpha) - ey * Math.sin(alpha)) * m;
    const oy = cy + (ex * Math.sin(alpha) + ey * Math.cos(alpha)) * m;
    const ax = cx + 340 * Math.sin(c.settle * D);
    const ay = cy + 228 * Math.cos(c.settle * D) - 4;
    const front = mix(depth, 1, settle);
    return {
      ...c,
      x: mix(ox, ax, settle),
      y: mix(oy, ay, settle),
      d: mix(130 + 80 * (depth + 1) * 0.5, 176, settle),
      turn: mix(Math.cos(phi) * 60, c.settle * 0.3, settle),
      opacity: Math.min(1, fly * 2.2) * mix(0.5 + 0.5 * (depth + 1) * 0.5, 1, settle),
      blur: (1 - (front + 1) * 0.5) * 2.5,
      front,
      i,
    };
  });
  const drawCoin = (c: (typeof coins)[number]) => (
    <Coin
      key={c.src}
      src={c.src}
      frame={frame}
      d={c.d}
      x={c.x}
      y={c.y}
      turn={c.turn}
      tilt={6}
      opacity={c.opacity}
      blur={c.blur}
      sheen={[world + c.i * 5]}
      shadow={false}
    />
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 262, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={6}>
          Icons of gold
        </Eyebrow>
        <Rise frame={frame} at={cue('Some') - 8} style={{marginTop: 22}}>
          <div style={italic(64, {color: C.champagne})}>Some gold coins are</div>
        </Rise>
        <Rise frame={frame} at={cue('known') - 8} style={{marginTop: 4}}>
          <div style={serif(122)}>known the</div>
        </Rise>
        <MaskLine frame={frame} at={cue('all') - 6} dur={44}>
          <div style={italic(150, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={world + 6}>
              world over.
            </Metal>
          </div>
        </MaskLine>
      </div>
      <Glow x={cx} y={cy} w={1100} h={900} opacity={0.6 + bright * 0.4} strength={0.18 + bright * 0.12} />
      {coins.filter((c) => c.front <= 0).map(drawCoin)}
      <Globe frame={frame} cx={cx} cy={cy} r={330} spin={-60 + frame * 0.32} bright={bright} reveal={prog(frame, 0, 50, EASE.silk)} />
      {coins
        .filter((c) => c.front > 0)
        .sort((a, b) => a.front - b.front)
        .map(drawCoin)}
    </AbsoluteFill>
  );
};

// ——— 2 · The roll call ————————————————————————————————————————————————————

const ICONS = [
  {src: 'coin-gold-eagle.png', word: 'American', country: 'United States', name: 'American Eagle', numeral: 'I'},
  {src: 'coin-maple.png', word: 'Canadian', country: 'Canada', name: 'Maple Leaf', numeral: 'II'},
  {src: 'coin-krugerrand.png', word: 'Krugerrand', country: 'South Africa', name: 'Krugerrand', numeral: 'III'},
  {src: 'coin-britannia.png', word: 'Britannia', country: 'United Kingdom', name: 'Britannia', numeral: 'IV'},
];

const ROW_Y = 1316;
const rowX = (i: number) => 540 + (i - 1.5) * 168;
const BIG = 540;
const BIG_Y = 948;

const RollCall: React.FC<SceneProps> = ({frame, cue}) => {
  const arrivals = ICONS.map((c) => cue(c.word) - 10);
  const slots = prog(frame, 0, 50, EASE.silk);
  return (
    <AbsoluteFill>
      <Glow x={540} y={BIG_Y} w={1000} h={900} opacity={prog(frame, 0, 40)} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <circle
          cx={540}
          cy={BIG_Y}
          r={318}
          fill="none"
          stroke="#d4af37"
          strokeOpacity={0.28}
          strokeWidth={1.2}
          strokeDasharray="2 12"
          transform={`rotate(${frame * 0.12} 540 ${BIG_Y})`}
          opacity={slots}
        />
        <circle cx={540} cy={BIG_Y} r={346} fill="none" stroke="#d4af37" strokeOpacity={0.12} strokeWidth={1} opacity={slots} />
        {arrivals.map((at, i) => {
          const ripple = prog(frame, at + 30, 50, EASE.out);
          return ripple > 0 && ripple < 1 ? (
            <circle key={i} cx={540} cy={BIG_Y} r={280 + ripple * 160} fill="none" stroke="#f6e3a1" strokeOpacity={(1 - ripple) * 0.5} strokeWidth={2} />
          ) : null;
        })}
        {ICONS.map((_, i) => (
          <circle
            key={i}
            cx={rowX(i)}
            cy={ROW_Y}
            r={64}
            fill="none"
            stroke="#d4af37"
            strokeOpacity={0.3}
            strokeDasharray="3 7"
            opacity={slots}
          />
        ))}
      </svg>
      {ICONS.map((c, i) => (
        <div
          key={c.numeral}
          style={{
            position: 'absolute',
            left: rowX(i) - 60,
            width: 120,
            top: ROW_Y + 74,
            textAlign: 'center',
            ...serif(30, {color: frame >= arrivals[i] ? C.goldLight : C.mute}),
            opacity: slots * (frame >= arrivals[i] ? 1 : 0.45),
          }}
        >
          {c.numeral}
        </div>
      ))}
      {ICONS.map((c, i) => {
        const at = arrivals[i];
        const next = arrivals[i + 1];
        if (frame < at - 2) {
          return null;
        }
        const spin = prog(frame, at, 46, EASE.out);
        const dock = next === undefined ? 0 : prog(frame, next - 6, 38, EASE.inOut);
        const wobble = Math.sin((frame - at) / 34) * 7 * spin * (1 - dock);
        return (
          <Coin
            key={c.src}
            src={c.src}
            frame={frame}
            d={mix(BIG, 128, dock)}
            x={mix(540, rowX(i), dock)}
            y={mix(BIG_Y + (1 - spin) * 40, ROW_Y, dock) + Math.sin(frame / 46) * 6 * (1 - dock)}
            turn={mix(450, 0, spin) + wobble}
            tilt={mix(8, 0, dock)}
            scale={mix(0.84, 1, spin)}
            opacity={Math.min(1, spin * 4)}
            sheen={[at + 40, ...(next === undefined ? [] : [next + 32])]}
            glow={dock < 0.5 ? 'rgba(214,168,74,0.35)' : undefined}
          />
        );
      })}
      {ICONS.map((c, i) => {
        const at = arrivals[i];
        const next = arrivals[i + 1];
        return (
          <div key={c.name} style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
            <Rise frame={frame} at={at - 2} out={next === undefined ? undefined : next - 8} outDur={12}>
              <Eyebrow frame={frame} at={at - 2}>
                {c.country}
              </Eyebrow>
            </Rise>
            <Rise frame={frame} at={at + 2} out={next === undefined ? undefined : next - 8} outDur={12} style={{marginTop: 18}}>
              <div style={italic(138, {lineHeight: 1.04})}>
                <Metal frame={frame} sheenAt={at + 40}>
                  {c.name}
                </Metal>
              </div>
            </Rise>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ——— 3 · The bars ——————————————————————————————————————————————————————————

const CARDS = [
  {src: 'card-justice.png', w: 630, h: 958, word: 'PAMP', name: 'PAMP Suisse', x: 296, y: 1010, rot: -9, height: 540},
  {src: 'card-valcambi.png', w: 321, h: 481, word: 'Valcambi', name: 'Valcambi', x: 784, y: 1010, rot: 9, height: 520},
  {src: 'card-perth.png', w: 297, h: 464, word: 'Perth', name: 'The Perth Mint', x: 540, y: 972, rot: 0, height: 570},
];

const Bars: React.FC<SceneProps> = ({frame, cue}) => {
  const pamp = cue('PAMP');
  const barIn = prog(frame, 0, 60, EASE.silk);
  const barOut = prog(frame, pamp - 26, 34, EASE.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('bars') - 10}>
          <div style={serif(122)}>And the bars.</div>
        </Rise>
        <MaskLine frame={frame} at={cue('names') - 8} dur={44}>
          <div style={italic(146, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={pamp}>
              Names you know.
            </Metal>
          </div>
        </MaskLine>
      </div>
      <Glow x={540} y={1010} w={1100} h={820} opacity={prog(frame, 0, 40)} />
      <Product
        src="bar-justice-obv.png"
        frame={frame}
        w={640}
        h={517}
        x={540}
        y={mix(1080, 1010, barIn) - barOut * 110}
        scale={mix(1, 0.72, barOut)}
        opacity={Math.min(1, barIn * 1.5) * (1 - barOut)}
        blur={barOut * 10}
        float={6}
        sheen={[cue('bars') + 4]}
        glow="rgba(214,168,74,0.25)"
      />
      {CARDS.map((card) => {
        const at = cue(card.word) - 10;
        const p = prog(frame, at, 46, EASE.out);
        const w = Math.round((card.height * card.w) / card.h);
        return (
          <Product
            key={card.src}
            src={card.src}
            frame={frame}
            w={w}
            h={card.height}
            x={mix(card.x + card.rot * 14, card.x, p)}
            y={mix(card.y + 220, card.y, p)}
            rotate={mix(card.rot * 2.6, card.rot, p)}
            scale={mix(0.9, 1, p)}
            opacity={Math.min(1, p * 2.2)}
            blur={(1 - p) * 8}
            float={4}
            floatPhase={card.rot}
            sheen={[at + 34]}
            glow="rgba(214,168,74,0.18)"
          />
        );
      })}
      {CARDS.map((card) => {
        const at = cue(card.word) - 4;
        return (
          <div key={card.name} style={{position: 'absolute', left: card.x + card.rot * 4.5 - 180, width: 360, top: 1324, textAlign: 'center'}}>
            <Rise frame={frame} at={at} distance={24}>
              <div style={caps(17, {color: C.champagne, letterSpacing: '0.28em'})}>{card.name}</div>
            </Rise>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ——— 4 · Shop —————————————————————————————————————————————————————————————

const PHONE_ITEMS = [
  {src: 'coin-gold-eagle.png', label: 'American Eagle'},
  {src: 'coin-maple.png', label: 'Maple Leaf'},
  {src: 'coin-krugerrand.png', label: 'Krugerrand'},
  {src: 'coin-britannia.png', label: 'Britannia'},
  {src: 'card-justice.png', label: 'PAMP Suisse'},
  {src: 'card-perth.png', label: 'Perth Mint'},
];

const Shop: React.FC<SceneProps> = ({frame, cue}) => {
  const online = cue('online');
  const ny = cue('New');
  const diamond = cue('Diamond');
  const toCity = prog(frame, ny - 24, 40, EASE.inOut);
  const phoneIn = prog(frame, 4, 50, EASE.silk);
  const ring = prog(frame, online - 4, 40);
  const skyTop = 851;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('Explore') - 10} out={online - 20} outDur={14}>
          <div style={serif(122)}>Explore them</div>
        </Rise>
        <Rise frame={frame} at={cue('Bullion') - 8} out={online - 20} outDur={14}>
          <div style={italic(128, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={cue('Trading')}>
              at Bullion Trading.
            </Metal>
          </div>
        </Rise>
      </div>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={online - 10}>
          <div style={serif(126)}>Online.</div>
        </Rise>
        <MaskLine frame={frame} at={ny - 8} dur={44}>
          <div style={italic(140, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={diamond}>
              Or in New York.
            </Metal>
          </div>
        </MaskLine>
      </div>
      <Glow x={540} y={1050} w={900} h={900} opacity={phoneIn * 0.8} />
      <Phone
        frame={frame}
        x={mix(540, 210, toCity)}
        y={mix(1110, 1060, phoneIn)}
        turn={mix(-8, 34, toCity)}
        scale={mix(0.8, 0.62, toCity)}
        opacity={phoneIn * (1 - toCity)}
        items={PHONE_ITEMS.map((item, i) => ({...item, at: 22 + i * 9}))}
      />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: (1 - toCity) * ring * (1 - prog(frame, online + 40, 30))}}>
        <rect
          x={540 - 172 - ring * 10}
          y={1060 - 352 - ring * 10}
          width={344 + ring * 20}
          height={704 + ring * 20}
          rx={56}
          fill="none"
          stroke="#f6e3a1"
          strokeWidth={2}
          strokeOpacity={0.6}
        />
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: prog(frame, ny - 16, 30)}}>
        <div style={{position: 'absolute', left: 0, top: skyTop, width: 1080, height: 440}}>
          <Skyline frame={frame} at={ny - 12} y={0} scale={0.9} />
        </div>
        <Pin frame={frame} at={diamond - 6} x={558} y={1026} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1296, textAlign: 'center'}}>
          <Rise frame={frame} at={diamond - 2} distance={20}>
            <Eyebrow frame={frame} at={diamond - 2}>
              Diamond District · New York
            </Eyebrow>
          </Rise>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ——— 5 · Close ————————————————————————————————————————————————————————————

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="The icons are here"
    footer="Gold coins & bars · New York"
    hero={(frame) => {
      const trio = [
        {src: 'coin-maple.png', x: 312, y: 965, d: 250, turn: 28, delay: 10},
        {src: 'coin-krugerrand.png', x: 768, y: 965, d: 250, turn: -28, delay: 18},
        {src: 'coin-gold-eagle.png', x: 540, y: 905, d: 330, turn: 0, delay: 0},
      ];
      return (
        <>
          {trio.map((c) => {
            const p = prog(frame, c.delay, 62, EASE.silk);
            return (
              <Coin
                key={c.src}
                src={c.src}
                frame={frame}
                d={c.d}
                x={c.x}
                y={mix(c.y + 90, c.y, p) + Math.sin(frame / 50 + c.delay) * 5}
                turn={mix(c.turn + 90, c.turn, p)}
                tilt={6}
                opacity={Math.min(1, p * 2.5)}
                sheen={[c.delay + 60]}
                glow="rgba(214,168,74,0.3)"
              />
            );
          })}
        </>
      );
    }}
  />
);

export const ICONS_SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  icons: RollCall,
  bars: Bars,
  shop: Shop,
  cta: Cta,
};
