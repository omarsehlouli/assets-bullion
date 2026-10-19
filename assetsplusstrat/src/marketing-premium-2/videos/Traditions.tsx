import type React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {EndCard} from '../../marketing-premium/kit/EndCard';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps, Eyebrow, italic, Metal, Rise, serif} from '../../marketing-premium/kit/Text';
import {C, EASE, GOLD_GRADIENT, mix, prog, SILVER_GRADIENT, type SceneProps} from '../../marketing-premium/kit/theme';

// Traditions in gold & silver — five customs from the site's traditions
// guides, each a short chapter with its own light.

const P2 = (name: string) => `premium-2/${name}`;

// A soft coloured wash that gives each chapter its own mood.
const Wash: React.FC<{color: string; frame: number; y?: number; strength?: number}> = ({color, frame, y = 58, strength = 0.32}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 80% 45% at 50% ${y}%, rgba(${color},${strength * prog(frame, 0, 40)}) 0%, rgba(${color},${strength * 0.25}) 45%, rgba(0,0,0,0) 75%)`,
    }}
  />
);

const Chapter: React.FC<{
  frame: number;
  index: string;
  name: string;
  native?: string;
  line1: string;
  line2: string;
  at1: number;
  at2: number;
  gradient?: string;
}> = ({frame, index, name, native, line1, line2, at1, at2, gradient = GOLD_GRADIENT}) => (
  <div style={{position: 'absolute', top: 268, left: 0, right: 0, textAlign: 'center'}}>
    <Eyebrow frame={frame} at={0}>
      {`${index} · ${name}`}
    </Eyebrow>
    {native ? (
      <Rise frame={frame} at={6} style={{marginTop: 14}}>
        <div style={{fontSize: 34, color: 'rgba(244,238,223,0.55)', letterSpacing: '0.08em'}}>{native}</div>
      </Rise>
    ) : null}
    <Rise frame={frame} at={at1 - 6} style={{marginTop: native ? 14 : 30}}>
      <div style={serif(112)}>{line1}</div>
    </Rise>
    <Rise frame={frame} at={at2 - 6}>
      <div style={italic(122, {lineHeight: 1.05})}>
        <Metal frame={frame} gradient={gradient} sheenAt={at2 + 20}>
          {line2}
        </Metal>
      </div>
    </Rise>
  </div>
);

// ——— Hook: the five customs' pieces orbit in the light ———

const ORBIT = [
  {src: P2('coin-centenario.png'), metal: 'gold' as const},
  {src: 'coin-silver-eagle.png', metal: 'silver' as const},
  {src: P2('coin-lunar-horse.png'), metal: 'gold' as const},
  {src: P2('coin-sovereign.png'), metal: 'gold' as const},
  {src: 'round-buffalo.png', metal: 'silver' as const},
  {src: P2('coin-hidalgo.png'), metal: 'gold' as const},
];

const Hook: React.FC<SceneProps> = ({frame, cue}) => {
  const gold = cue('gold');
  const silver = cue('silver');
  const spin = frame * 0.006 + 0.4;
  const rise = prog(frame, 0, 80, EASE.silk);
  return (
    <AbsoluteFill>
      <Wash color="226,170,120" frame={frame} y={60} />
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={cue('Across') - 12}>
          A Bullion Trading tradition
        </Eyebrow>
        <Rise frame={frame} at={cue('Across') - 4} style={{marginTop: 30}}>
          <div style={serif(122)}>Across cultures,</div>
        </Rise>
        <Rise frame={frame} at={cue('moments') - 6}>
          <div style={italic(96, {color: C.champagne, lineHeight: 1.15})}>life&apos;s biggest moments</div>
        </Rise>
        <Rise frame={frame} at={gold - 8}>
          <div style={italic(128, {lineHeight: 1.05})}>
            <Metal frame={frame} sheenAt={gold + 6}>
              in gold
            </Metal>{' '}
            <span style={{opacity: prog(frame, silver - 8, 20)}}>
              <Metal frame={frame} gradient={SILVER_GRADIENT} sheenAt={silver + 6} glow="rgba(220,228,236,0.3)">
                &amp; silver.
              </Metal>
            </span>
          </div>
        </Rise>
      </div>
      {ORBIT.map((item, i) => {
        const a = spin + (i / ORBIT.length) * Math.PI * 2;
        const depth = (Math.sin(a) + 1) / 2;
        const x = 540 + Math.cos(a) * 360;
        const y = mix(1260, 1100, rise) + Math.sin(a) * 110;
        const glint = item.metal === 'gold' ? [gold + i * 4] : [silver + i * 4];
        return {i, depth, node: (
          <Coin
            key={i}
            src={item.src}
            frame={frame}
            metal={item.metal}
            d={mix(150, 250, depth)}
            x={x}
            y={y}
            turn={Math.cos(a) * 38}
            tilt={8}
            opacity={prog(frame, 6 + i * 6, 30) * mix(0.55, 1, depth)}
            blur={mix(3, 0, depth)}
            sheen={glint}
          />
        )};
      })
        .sort((p, q) => p.depth - q.depth)
        .map((p) => p.node)}
    </AbsoluteFill>
  );
};

// ——— I · Las Arras: thirteen coins into the cofre ———

const COFRE = {x: 540, y: 1150, w: 520};
const ARRAS = Array.from({length: 13}, (_, i) => ({
  src: i % 3 === 1 ? P2('coin-centenario-eagle.png') : P2('coin-hidalgo.png'),
  restX: COFRE.x + ((i % 5) - 2) * 78 + (random(`ax${i}`) - 0.5) * 16,
  restY: COFRE.y - 40 - Math.floor(i / 5) * 22 + (random(`ay${i}`) - 0.5) * 10,
  spin: 360 + random(`as${i}`) * 360,
}));

const Cofre: React.FC<{frame: number; part: 'back' | 'front'}> = ({frame, part}) => {
  const open = prog(frame, 0, 40, EASE.out);
  const {x, y, w} = COFRE;
  if (part === 'back') {
    return (
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="cofre-lid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a3a12" />
            <stop offset="1" stopColor="#24170a" />
          </linearGradient>
          <radialGradient id="cofre-velvet" cx="50%" cy="30%" r="70%">
            <stop offset="0" stopColor="#7a1d28" />
            <stop offset="1" stopColor="#2a070c" />
          </radialGradient>
        </defs>
        {/* Lid, hinged open behind */}
        <g transform={`translate(${x} ${y - 70}) scale(1 ${mix(0.2, 1, open)})`}>
          <path d={`M${-w / 2} 0 L${-w / 2 + 30} ${-230} L${w / 2 - 30} ${-230} L${w / 2} 0 Z`} fill="url(#cofre-lid)" stroke="#d4af37" strokeWidth={3} />
          <path d={`M${-w / 2 + 40} -20 L${-w / 2 + 62} -206 L${w / 2 - 62} -206 L${w / 2 - 40} -20 Z`} fill="url(#cofre-velvet)" stroke="rgba(212,175,55,0.6)" strokeWidth={1.5} />
          <circle cx={0} cy={-115} r={34} fill="none" stroke="#e2c46c" strokeWidth={2} opacity={0.7} />
          <path d="M0 -149 V-81 M-34 -115 H34" stroke="#e2c46c" strokeWidth={2} opacity={0.5} />
        </g>
        {/* Velvet floor */}
        <ellipse cx={x} cy={y - 40} rx={w / 2 - 10} ry={60} fill="url(#cofre-velvet)" />
      </svg>
    );
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="cofre-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b4614" />
          <stop offset="0.5" stopColor="#3a250c" />
          <stop offset="1" stopColor="#1a1006" />
        </linearGradient>
      </defs>
      <path d={`M${x - w / 2} ${y - 40} L${x + w / 2} ${y - 40} L${x + w / 2 - 20} ${y + 120} L${x - w / 2 + 20} ${y + 120} Z`} fill="url(#cofre-front)" />
      <path d={`M${x - w / 2} ${y - 40} L${x + w / 2} ${y - 40}`} stroke="#f0d27a" strokeWidth={4} />
      <path d={`M${x - w / 2 + 20} ${y + 120} L${x + w / 2 - 20} ${y + 120}`} stroke="#b8902f" strokeWidth={3} />
      {/* Filigree */}
      {[-1, 1].map((s) => (
        <path
          key={s}
          d={`M${x + s * 40} ${y + 40} c${s * 40} -50 ${s * 110} -50 ${s * 150} 0 c${s * -30} 20 ${s * -60} 10 ${s * -70} -10`}
          fill="none"
          stroke="#d4af37"
          strokeWidth={2.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - prog(frame, 10, 50, EASE.inOut)}
        />
      ))}
      <circle cx={x} cy={y + 40} r={16} fill="#d4af37" />
      <circle cx={x} cy={y + 40} r={7} fill="#3a250c" />
    </svg>
  );
};

const Arras: React.FC<SceneProps> = ({frame, cue}) => {
  const first = cue('13');
  const blessed = cue('blessed');
  const landed = (i: number) => first + 6 + i * 9 + 34;
  const count = ARRAS.filter((_, i) => frame >= landed(i)).length;
  return (
    <AbsoluteFill>
      <Wash color="226,170,90" frame={frame} y={62} />
      <Chapter frame={frame} index="I" name="Las Arras" line1="Thirteen gold coins," line2="for a wedding." at1={first} at2={cue('wedding') - 10} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1020 - 260,
          height: 400,
          background: `radial-gradient(ellipse 40% 50% at 50% 60%, rgba(255,226,160,${0.28 * prog(frame, blessed - 6, 30)}), rgba(0,0,0,0) 70%)`,
        }}
      />
      <Cofre frame={frame} part="back" />
      {ARRAS.map((c, i) => {
        const start = first + 6 + i * 9;
        const t = prog(frame, start, 34, (v) => v);
        if (frame < start) {
          return null;
        }
        const x = mix(150, c.restX, t);
        const y = mix(860, c.restY, t) - Math.sin(t * Math.PI) * 260;
        const settled = t >= 1;
        return (
          <Coin
            key={i}
            src={c.src}
            frame={frame}
            d={92}
            x={x}
            y={y}
            turn={settled ? 0 : c.spin * (1 - t)}
            tilt={settled ? 62 : mix(20, 62, t)}
            shadow={settled}
            sheen={[blessed + i * 2]}
          />
        );
      })}
      <Cofre frame={frame} part="front" />
      <div style={{position: 'absolute', top: 1300, left: 0, right: 0, textAlign: 'center', opacity: prog(frame, first + 10, 20)}}>
        <span style={serif(64, {fontVariantNumeric: 'lining-nums tabular-nums'})}>
          <Metal frame={frame}>{String(count).padStart(2, '0')}</Metal>
        </span>
        <span style={caps(18, {marginLeft: 16, color: C.mute})}>/ 13 · las arras matrimoniales</span>
      </div>
    </AbsoluteFill>
  );
};

// ——— II · Pidyon HaBen: five silver coins on a silver tray ———

const Tray: React.FC<{frame: number}> = ({frame}) => {
  const p = prog(frame, 0, 40, EASE.out);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: p}}>
      <defs>
        <radialGradient id="tray" cx="45%" cy="35%" r="70%">
          <stop offset="0" stopColor="#f4f7fa" />
          <stop offset="0.5" stopColor="#a9b2bc" />
          <stop offset="1" stopColor="#4b5259" />
        </radialGradient>
        <radialGradient id="tray-well" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#d9dfe5" />
          <stop offset="1" stopColor="#6c747d" />
        </radialGradient>
      </defs>
      <ellipse cx={540} cy={1170} rx={420} ry={150} fill="rgba(0,0,0,0.6)" style={{filter: 'blur(18px)'}} />
      <ellipse cx={540} cy={1130} rx={420} ry={150} fill="url(#tray)" />
      <ellipse cx={540} cy={1126} rx={372} ry={126} fill="url(#tray-well)" />
      <ellipse cx={540} cy={1130} rx={420} ry={150} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={2} />
      {Array.from({length: 40}, (_, i) => {
        const a = (i / 40) * Math.PI * 2;
        return <circle key={i} cx={540 + Math.cos(a) * 398} cy={1130 + Math.sin(a) * 138} r={4} fill="#eef2f6" opacity={0.7} />;
      })}
    </svg>
  );
};

const Pidyon: React.FC<SceneProps> = ({frame, cue}) => {
  const five = cue('Five');
  const day = cue('31st');
  const spots = [
    [360, 1080],
    [540, 1060],
    [720, 1080],
    [450, 1170],
    [630, 1170],
  ];
  return (
    <AbsoluteFill>
      <Wash color="170,190,215" frame={frame} y={60} strength={0.36} />
      <Chapter frame={frame} index="II" name="Pidyon HaBen" native="פִּדְיוֹן הַבֵּן" line1="Five silver coins," line2="on the 31st day." at1={five} at2={day - 12} gradient={SILVER_GRADIENT} />
      <Tray frame={frame} />
      {spots.map(([x, y], i) => {
        const at = five + i * 12;
        const p = prog(frame, at, 22, EASE.out);
        return (
          <Coin
            key={i}
            src="coin-silver-eagle.png"
            frame={frame}
            metal="silver"
            d={176}
            x={x}
            y={mix(y - 140, y, p)}
            tilt={mix(10, 42, p)}
            turn={mix(-60, 0, p)}
            opacity={Math.min(1, p * 2)}
            sheen={[day + i * 3]}
          />
        );
      })}
      <div style={{position: 'absolute', top: 1300, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={day} color={C.mute}>
          The redemption of the firstborn
        </Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

// ——— III · Dhanteras: Lakshmi, and thirteen diyas ———

const Diya: React.FC<{x: number; y: number; frame: number; lit: number; phase: number}> = ({x, y, frame, lit, phase}) => {
  const flick = 0.85 + 0.15 * Math.sin(frame / 3 + phase) * Math.sin(frame / 7 + phase * 2);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={-34} rx={80} ry={70} fill="url(#diya-glow)" opacity={0.85 * lit * flick} />
      <path d="M-34 0 Q0 30 34 0 L26 -10 Q0 4 -26 -10 Z" fill="#8a3b14" />
      <path d="M-34 0 Q0 30 34 0" fill="none" stroke="#c96a2a" strokeWidth={2} />
      <ellipse cx={0} cy={-6} rx={28} ry={6} fill="#4a1e08" />
      <g opacity={lit} transform={`scale(${0.6 + 0.4 * lit * flick})`} style={{transformOrigin: '0px -12px'}}>
        <path d={`M0 -46 Q11 -24 0 -12 Q-11 -24 0 -46 Z`} fill="#ffcf6a" />
        <path d={`M0 -36 Q5 -24 0 -16 Q-5 -24 0 -36 Z`} fill="#fff6d6" />
      </g>
    </g>
  );
};

const Dhanteras: React.FC<SceneProps> = ({frame, cue}) => {
  const gold = cue('gold');
  const day = cue('Dhanteras');
  const lakshmi = cue('Lakshmi');
  const rise = prog(frame, gold - 10, 60, EASE.silk);
  return (
    <AbsoluteFill>
      <Wash color="255,160,70" frame={frame} y={62} strength={0.4} />
      <Chapter frame={frame} index="III" name="Dhanteras" native="धनतेरस" line1="A piece of gold" line2="to welcome Lakshmi." at1={cue('piece')} at2={lakshmi - 14} />
      <Product
        src={P2('card-lakshmi.png')}
        frame={frame}
        w={300}
        h={460}
        x={540}
        y={mix(1080, 960, rise)}
        opacity={rise}
        float={5}
        sheen={[lakshmi]}
        glow="rgba(255,180,90,0.35)"
      />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <radialGradient id="diya-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffd27a" stopOpacity="0.55" />
            <stop offset="0.35" stopColor="#ffa040" stopOpacity="0.22" />
            <stop offset="1" stopColor="#ff8a2a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({length: 13}, (_, i) => {
          const t = i / 12;
          const x = 110 + t * 860;
          const y = 1370 - Math.sin(t * Math.PI) * 120;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(1.45) translate(${-x} ${-y})`}>
              <Diya x={x} y={y} frame={frame} lit={prog(frame, day + i * 4, 14)} phase={i * 1.3} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ——— IV · Lunar New Year: a gold coin from a red envelope ———

const Lunar: React.FC<SceneProps> = ({frame, cue}) => {
  const coin = cue('coin');
  const envelope = cue('envelope');
  const year = cue('Year');
  const flap = prog(frame, coin - 6, 22, EASE.inOut);
  const slide = prog(frame, coin + 10, 40, EASE.out);
  const W = 420;
  const Hh = 600;
  const top = 860;
  return (
    <AbsoluteFill>
      <Wash color="210,40,40" frame={frame} y={60} strength={0.42} />
      <Chapter frame={frame} index="IV" name="Lunar New Year" native="馬年 · 2026" line1="A gold coin" line2="in a red envelope." at1={coin - 4} at2={envelope - 8} />
      {/* Envelope back */}
      <div style={{position: 'absolute', left: 540 - W / 2, top, width: W, height: Hh, borderRadius: 18, background: 'linear-gradient(160deg, #a3121c, #5e070d)', boxShadow: '0 40px 90px rgba(0,0,0,0.6)', opacity: prog(frame, 0, 24)}} />
      {/* The coin rising out */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, clipPath: `inset(0 0 ${1920 - (top + 140)}px 0)`}}>
        <Coin src={P2('coin-lunar-horse.png')} frame={frame} d={330} x={540} y={mix(top + 260, top - 120, slide)} turn={mix(30, 0, slide)} shadow={false} sheen={[year]} />
      </div>
      <Coin src={P2('coin-lunar-horse.png')} frame={frame} d={330} x={540} y={mix(top + 260, top - 120, slide)} turn={mix(30, 0, slide)} opacity={slide > 0.6 ? 1 : 0} sheen={[year]} />
      {/* Envelope front with gold foil */}
      <div
        style={{
          position: 'absolute',
          left: 540 - W / 2,
          top: top + 140,
          width: W,
          height: Hh - 140,
          borderRadius: '0 0 18px 18px',
          background: 'linear-gradient(170deg, #c41a24, #7d0a12)',
          boxShadow: 'inset 0 2px 0 rgba(255,210,120,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: prog(frame, 0, 24),
        }}
      >
        <div style={{width: 170, height: 170, borderRadius: '50%', border: '3px solid #e8c25a', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{fontSize: 110, color: '#f2cf6b', textShadow: '0 0 20px rgba(242,207,107,0.5)'}}>福</span>
        </div>
      </div>
      {/* Flap */}
      <div style={{position: 'absolute', left: 540 - W / 2, top: top + 140, width: W, height: 160, perspective: 900}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: '50% 0%',
            transform: `rotateX(${flap * 178}deg)`,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(180deg, #d42a2f, #96121a)',
            borderTop: '3px solid #e8c25a',
          }}
        />
      </div>
      {Array.from({length: 26}, (_, i) => {
        const age = frame - envelope - (i % 13) * 3;
        if (age < 0) {
          return null;
        }
        const x = 540 + (random(`lx${i}`) - 0.5) * 760;
        const y = 700 + age * (1.5 + random(`lv${i}`) * 2.5);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 10, height: 16, background: i % 2 ? '#e8c25a' : '#c41a24', rotate: `${age * 8 + i * 30}deg`, opacity: Math.max(0, 1 - age / 140)}} />;
      })}
    </AbsoluteFill>
  );
};

// ——— V · The 21st-birthday sovereign: the key of the door ———

const Key: React.FC<{frame: number; at: number}> = ({frame, at}) => {
  const draw = prog(frame, at, 50, EASE.inOut);
  return (
    <svg width={360} height={140} viewBox="0 0 360 140" style={{position: 'absolute', left: 540 - 180, top: 1270, overflow: 'visible'}}>
      <g fill="none" stroke="#e2c46c" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 10px rgba(226,196,108,0.6))'}}>
        <path d="M60 70 a40 40 0 1 1 0.1 0 Z M60 70 a18 18 0 1 1 0.1 0 Z" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <path d="M100 70 H320 M290 70 V104 H306 V70 M262 70 V96 H276 V70" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      </g>
    </svg>
  );
};

const Sovereign: React.FC<SceneProps> = ({frame, cue}) => {
  const sov = cue('sovereign');
  const key = cue('key');
  const p = prog(frame, sov - 12, 50, EASE.silk);
  return (
    <AbsoluteFill>
      <Wash color="60,120,90" frame={frame} y={60} strength={0.32} />
      <Chapter frame={frame} index="V" name="Britain" line1="A sovereign at 21," line2="the key of the door." at1={sov - 4} at2={key - 12} />
      <Coin src={P2('coin-sovereign.png')} frame={frame} d={380} x={540} y={1010} turn={mix(-80, 0, p) + Math.sin(frame / 40) * 6} opacity={p} sheen={[key + 6]} />
      <Key frame={frame} at={key - 6} />
      <div style={{position: 'absolute', top: 1380, left: 0, right: 0, textAlign: 'center', opacity: prog(frame, key + 20, 20), ...caps(17, {color: C.mute})}}>
        22-carat gold · St George since 1817
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="For every tradition"
    footer="Tradition guides · bulliontradingllc.com"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Coin src={P2('coin-centenario.png')} frame={frame} d={280} x={mix(300, 330, p)} y={930} turn={mix(-70, -14, p)} roll={-6} opacity={p} sheen={[50]} />
          <Coin src={P2('coin-lunar-horse.png')} frame={frame} d={300} x={540} y={mix(940, 900, p)} turn={mix(70, 0, p)} opacity={p} sheen={[60]} />
          <Coin src={P2('coin-sovereign.png')} frame={frame} d={250} x={mix(780, 750, p)} y={950} turn={mix(80, 14, p)} roll={6} opacity={p} sheen={[70]} />
        </>
      );
    }}
  />
);

export const TRADITIONS_SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  arras: Arras,
  pidyon: Pidyon,
  dhanteras: Dhanteras,
  lunar: Lunar,
  sovereign: Sovereign,
  cta: Cta,
};
