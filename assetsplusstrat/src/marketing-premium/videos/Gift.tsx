import type React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {EndCard} from '../kit/EndCard';
import {Coin, Product} from '../kit/Product';
import {caps, Eyebrow, italic, Metal, Rise, serif} from '../kit/Text';
import {C, EASE, GOLD_GRADIENT, mix, prog, ROSE_GRADIENT, SILVER_GRADIENT, type SceneProps} from '../kit/theme';

const ROSE_GLOW = 'rgba(233,185,164,0.3)';
const SILVER_GLOW = 'rgba(223,228,234,0.22)';

const RIBBON = 'linear-gradient(90deg, #6e5114 0%, #b48a2e 18%, #f6e3a1 44%, #d8b250 58%, #9c7726 80%, #6e5114 100%)';
const RIBBON_V = 'linear-gradient(180deg, #6e5114 0%, #b48a2e 18%, #f6e3a1 44%, #d8b250 58%, #9c7726 80%, #6e5114 100%)';
const MATTE = 'linear-gradient(165deg, #232025 0%, #121014 55%, #0a090b 100%)';

// A four-pointed star glint.
const Glint: React.FC<{x: number; y: number; size: number; p: number; rotate?: number; color?: string}> = ({x, y, size, p, rotate = 0, color = '#fff6dc'}) => {
  if (p <= 0) {
    return null;
  }
  const s = size * p;
  return (
    <svg
      width={size * 2}
      height={size * 2}
      viewBox="-50 -50 100 100"
      style={{position: 'absolute', left: x - size, top: y - size, overflow: 'visible', opacity: Math.min(1, p * 1.4), rotate: `${rotate}deg`, scale: String(s / size)}}
    >
      <defs>
        <radialGradient id="glint-core">
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.35" stopColor={color} stopOpacity="0.55" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={22} fill="url(#glint-core)" />
      <path d="M0 -50 C3 -8 8 -3 50 0 C8 3 3 8 0 50 C-3 8 -8 3 -50 0 C-8 -3 -3 -8 0 -50Z" fill="#fffaf0" />
    </svg>
  );
};

/* ───────────────────────── 1 · Hook: the gift box ───────────────────────── */

const BW = 400;
const BD = 400;
const BH = 250;
const LW = BW + 20;
const LD = BD + 20;
const LH = 64;
const LIP = 18;

const Face: React.FC<{w: number; h: number; transform: string; shade: number; bg?: string; fade?: number; children?: React.ReactNode}> = ({
  w,
  h,
  transform,
  shade,
  bg = MATTE,
  fade = 1,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: -w / 2,
      top: -h / 2,
      width: w,
      height: h,
      transform,
      background: bg,
      opacity: fade,
      boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.22)',
    }}
  >
    {children}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: shade >= 0 ? `rgba(0,0,0,${shade})` : `rgba(255,236,200,${-shade})`,
      }}
    />
  </div>
);

const BandV: React.FC<{w: number}> = ({w}) => (
  <div style={{position: 'absolute', top: 0, bottom: 0, left: w / 2 - 26, width: 52, background: RIBBON, boxShadow: '0 0 6px rgba(0,0,0,0.5)'}} />
);
const BandH: React.FC<{h: number}> = ({h}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 - 26, height: 52, background: RIBBON_V, boxShadow: '0 0 6px rgba(0,0,0,0.5)'}} />
);

const Bow: React.FC = () => (
  <svg width={230} height={120} viewBox="0 0 230 120" style={{display: 'block'}}>
    <defs>
      <linearGradient id="bow-satin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7a5a16" />
        <stop offset="0.35" stopColor="#f6e3a1" />
        <stop offset="0.6" stopColor="#c9a246" />
        <stop offset="1" stopColor="#6e5114" />
      </linearGradient>
    </defs>
    <path d="M115 96 C80 40 22 8 14 44 C8 74 64 92 115 96Z" fill="url(#bow-satin)" stroke="#5b420f" strokeWidth={1.5} />
    <path d="M115 96 C150 40 208 8 216 44 C222 74 166 92 115 96Z" fill="url(#bow-satin)" stroke="#5b420f" strokeWidth={1.5} />
    <path d="M115 96 C96 70 60 50 44 54 C66 66 94 84 115 96Z" fill="#5b420f" opacity={0.45} />
    <path d="M115 96 C134 70 170 50 186 54 C164 66 136 84 115 96Z" fill="#5b420f" opacity={0.45} />
    <ellipse cx={115} cy={96} rx={18} ry={16} fill="url(#bow-satin)" stroke="#5b420f" strokeWidth={1.5} />
  </svg>
);

const GiftBox: React.FC<{frame: number; open: number; light: number; yaw: number}> = ({frame, open, light, yaw}) => {
  const lift = open * 210;
  const away = open * 320;
  const slide = open * 150;
  const fade = 1 - Math.min(1, Math.max(0, (open - 0.3) / 0.6));
  const lidGlow = light * 0.5;
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 1900, perspectiveOrigin: '50% 42%'}}>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 1150,
          width: 0,
          height: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateX(-22deg) rotateY(${yaw}deg) translateY(${Math.sin(frame / 70) * 3}px)`,
        }}
      >
        {/* Inner light, just below the rim */}
        <div
          style={{
            position: 'absolute',
            left: -BW / 2,
            top: -BD / 2,
            width: BW,
            height: BD,
            transform: `rotateX(90deg) translateZ(${BH / 2 - 40}px)`,
            background: `radial-gradient(ellipse at center, rgba(255,240,200,${light}) 0%, rgba(240,190,110,${light * 0.7}) 40%, rgba(120,80,20,${light * 0.3}) 80%)`,
          }}
        />
        <Face w={BW} h={BD} transform={`rotateX(-90deg) translateZ(${BH / 2}px)`} shade={0.6} />
        <Face w={BW} h={BH} transform={`rotateY(180deg) translateZ(${BD / 2}px)`} shade={0.45 - lidGlow * 0.6}>
          <BandV w={BW} />
        </Face>
        <Face w={BD} h={BH} transform={`rotateY(90deg) translateZ(${BW / 2}px)`} shade={0.5}>
          <BandV w={BD} />
        </Face>
        <Face w={BD} h={BH} transform={`rotateY(-90deg) translateZ(${BW / 2}px)`} shade={0.28}>
          <BandV w={BD} />
        </Face>
        <Face w={BW} h={BH} transform={`translateZ(${BD / 2}px)`} shade={0.05}>
          <BandV w={BW} />
        </Face>

        {/* Lid: lifts off, drifts back and dissolves into the light */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transformStyle: 'preserve-3d',
            transform: `translate3d(${slide}px, ${-BH / 2 - lift}px, ${-away}px) rotateZ(${open * 10}deg) rotateX(${open * 24}deg)`,
          }}
        >
          <Face
            w={LW}
            h={LD}
            fade={fade}
            transform={`translateY(${LIP}px) rotateX(-90deg)`}
            shade={-0.05}
            bg={`radial-gradient(ellipse at 50% 50%, rgba(255,226,160,${0.25 + light * 0.55}) 0%, rgba(60,40,10,0.9) 70%)`}
          />
          <Face fade={fade} w={LW} h={LH} transform={`translateY(${-LH / 2 + LIP}px) rotateY(180deg) translateZ(${LD / 2}px)`} shade={0.45}>
            <BandV w={LW} />
          </Face>
          <Face fade={fade} w={LD} h={LH} transform={`translateY(${-LH / 2 + LIP}px) rotateY(90deg) translateZ(${LW / 2}px)`} shade={0.5}>
            <BandV w={LD} />
          </Face>
          <Face fade={fade} w={LD} h={LH} transform={`translateY(${-LH / 2 + LIP}px) rotateY(-90deg) translateZ(${LW / 2}px)`} shade={0.22}>
            <BandV w={LD} />
          </Face>
          <Face fade={fade} w={LW} h={LH} transform={`translateY(${-LH / 2 + LIP}px) translateZ(${LD / 2}px)`} shade={0}>
            <BandV w={LW} />
          </Face>
          <Face fade={fade} w={LW} h={LD} transform={`translateY(${-LH + LIP}px) rotateX(90deg)`} shade={-0.06}>
            <BandV w={LW} />
            <BandH h={LD} />
          </Face>
          {/* Bow: two crossed satin planes standing on the lid */}
          {[0, 90].map((r) => (
            <div
              key={r}
              style={{
                position: 'absolute',
                left: -115,
                top: -120,
                width: 230,
                height: 120,
                opacity: fade,
                transform: `translateY(${-LH + LIP + 8}px) rotateY(${r}deg)`,
              }}
            >
              <Bow />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RAYS = [-34, -20, -8, 4, 16, 29];
const EMBERS = Array.from({length: 22}, (_, i) => ({
  x: (random(`ember-x${i}`) - 0.5) * 320,
  speed: 2.2 + random(`ember-s${i}`) * 3.4,
  delay: random(`ember-d${i}`) * 70,
  size: 2 + random(`ember-r${i}`) * 4,
  sway: random(`ember-w${i}`) * 6.28,
}));

const OPENING_Y = 1000;

const Hook: React.FC<SceneProps> = ({frame, cue}) => {
  const more = cue('more');
  const open = prog(frame, more - 4, 42, EASE.inOut);
  const light = prog(frame, more - 2, 30, EASE.out);
  const rise = prog(frame, more + 6, 84, EASE.silk);
  const enter = prog(frame, 0, 70, EASE.silk);
  const yaw = mix(40, 30, enter) - frame * 0.03;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 284, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={6} color={C.rose}>
          A gift with meaning
        </Eyebrow>
        <div style={{...serif(128), marginTop: 26}}>
          <Rise inline frame={frame} at={cue('moments') - 8}>
            Moments
          </Rise>{' '}
          <Rise inline frame={frame} at={cue('moments') + 4}>
            that
          </Rise>
        </div>
        <div style={italic(150, {lineHeight: 1.06})}>
          <Rise inline frame={frame} at={cue('deserve') - 6}>
            <Metal frame={frame} gradient={ROSE_GRADIENT} glow={ROSE_GLOW} sheenAt={more + 30}>
              deserve
            </Metal>
          </Rise>{' '}
          <Rise inline frame={frame} at={more - 6}>
            <Metal frame={frame} gradient={ROSE_GRADIENT} glow={ROSE_GLOW} sheenAt={more + 36}>
              more.
            </Metal>
          </Rise>
        </div>
      </div>

      {/* Floor */}
      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: 1290,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0) 72%)',
          opacity: enter,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -100,
          right: -100,
          top: 1180,
          height: 360,
          background: `radial-gradient(ellipse 45% 40% at 50% 40%, rgba(233,185,164,${0.1 + light * 0.12}) 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      <div style={{position: 'absolute', inset: 0, opacity: enter, translate: `0 ${(1 - enter) * 50}px`}}>
        <GiftBox frame={frame} open={open} light={light} yaw={yaw} />
      </div>

      {/* Light pouring out of the opened box */}
      <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
        <div
          style={{
            position: 'absolute',
            left: 540 - 420,
            top: OPENING_Y - 330,
            width: 840,
            height: 520,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at 50% 70%, rgba(255,232,180,${0.55 * light}) 0%, rgba(240,190,120,${0.18 * light}) 40%, rgba(0,0,0,0) 70%)`,
          }}
        />
        {RAYS.map((angle, i) => (
          <div
            key={angle}
            style={{
              position: 'absolute',
              left: 540 - 70,
              top: OPENING_Y - 900,
              width: 140,
              height: 900,
              transformOrigin: '50% 100%',
              rotate: `${angle + Math.sin(frame / 40 + i) * 2.5}deg`,
              background: `linear-gradient(0deg, rgba(255,228,170,${0.42 * light}) 0%, rgba(255,228,170,${0.1 * light}) 55%, rgba(0,0,0,0) 100%)`,
              maskImage: 'linear-gradient(90deg, transparent, black 50%, transparent)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, black 50%, transparent)',
              opacity: 0.7 + 0.3 * Math.sin(frame / 13 + i * 1.9),
            }}
          />
        ))}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {EMBERS.map((e, i) => {
            const t = frame - (more + 4 + e.delay);
            if (t < 0) {
              return null;
            }
            const y = OPENING_Y + 10 - t * e.speed;
            const fade = Math.max(0, 1 - t / 90);
            return (
              <g key={i} opacity={fade * light}>
                <circle cx={540 + e.x + Math.sin(t / 14 + e.sway) * 14} cy={y} r={e.size * 2.6} fill="rgba(255,214,140,0.25)" />
                <circle cx={540 + e.x + Math.sin(t / 14 + e.sway) * 14} cy={y} r={e.size * 0.7} fill="#fff4d6" />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* The bar rises out of the box opening */}
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${1920 - (OPENING_Y + 40)}px 0)`}}>
        <Product
          src="bar-clover-persp.png"
          frame={frame}
          w={430}
          h={337}
          x={540}
          y={mix(OPENING_Y + 220, 790, rise)}
          rotate={mix(-14, -4, rise)}
          scale={mix(0.8, 1, rise)}
          opacity={Math.min(1, rise * 2.5)}
          float={rise > 0.95 ? 6 : 0}
          sheen={[more + 70]}
          glow="rgba(255,214,140,0.4)"
        />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── 2 · Milestones: 25 → 50 → rings ───────────────────────── */

const RollingNumeral: React.FC<{frame: number; from: string; to: string; at: number; size: number}> = ({frame, from, to, at, size}) => (
  <div style={{display: 'flex', justifyContent: 'center'}}>
    {from.split('').map((digit, i) => {
      const p = prog(frame, at + i * 6, 38, EASE.inOut);
      const cell: React.CSSProperties = {...serif(size, {lineHeight: 1, letterSpacing: '-0.04em'}), display: 'block'};
      return (
        <div key={i} style={{position: 'relative'}}>
          <div style={{...cell, position: 'absolute', left: 0, top: 0, opacity: 1 - p, translate: `0 ${-p * 60}%`, filter: p > 0 ? `blur(${p * 10}px)` : undefined}}>
            <Metal frame={frame} gradient={SILVER_GRADIENT} glow={SILVER_GLOW}>
              {digit}
            </Metal>
          </div>
          <div style={{...cell, opacity: p, translate: `0 ${(1 - p) * 60}%`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined}}>
            <Metal frame={frame} gradient={GOLD_GRADIENT} sheenAt={at + 40}>
              {to[i]}
            </Metal>
          </div>
        </div>
      );
    })}
  </div>
);

const Rings: React.FC<{frame: number; at: number}> = ({frame, at}) => {
  const slide = prog(frame, at - 8, 46, EASE.inOut);
  const draw = prog(frame, at - 8, 52, EASE.inOut);
  const r = 150;
  const cy = 910;
  const sx = mix(300, 480, slide);
  const gx = mix(780, 600, slide);
  const d = (gx - sx) / 2;
  const iy = cy - Math.sqrt(Math.max(0, r * r - d * d));
  const ring = (cx: number, grad: string, hi: string) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth={22} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${grad})`} strokeWidth={16} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r - 4} fill="none" stroke={hi} strokeOpacity={0.55} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} transform={`rotate(-90 ${cx} ${cy})`} />
    </g>
  );
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="ring-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6f7780" />
          <stop offset="0.3" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#9aa3ad" />
          <stop offset="0.8" stopColor="#e7ebf0" />
          <stop offset="1" stopColor="#6f7780" />
        </linearGradient>
        <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a6a1f" />
          <stop offset="0.3" stopColor="#f7e7b0" />
          <stop offset="0.55" stopColor="#c9a246" />
          <stop offset="0.8" stopColor="#f6e3a1" />
          <stop offset="1" stopColor="#8a6a1f" />
        </linearGradient>
        <clipPath id="ring-over">
          <circle cx={540} cy={iy} r={30} />
        </clipPath>
      </defs>
      <g style={{filter: 'drop-shadow(0 0 18px rgba(233,185,164,0.35))'}}>
        {ring(sx, 'ring-silver', '#ffffff')}
        {ring(gx, 'ring-gold', '#fff4cf')}
        {/* Silver passes over gold at the top crossing so the rings read as linked */}
        <g clipPath="url(#ring-over)">{ring(sx, 'ring-silver', '#ffffff')}</g>
      </g>
    </svg>
  );
};

const Milestones: React.FC<SceneProps> = ({frame, cue}) => {
  const silver = cue('silver');
  const golden = cue('golden');
  const tradition = cue('tradition');
  const toGold = prog(frame, golden - 8, 40, EASE.inOut);
  const aside = prog(frame, tradition - 14, 40, EASE.inOut);
  const numIn = prog(frame, silver - 8, 40, EASE.out);
  const silverIn = prog(frame, silver - 2, 60, EASE.silk);
  const goldIn = prog(frame, golden - 4, 60, EASE.silk);
  const label = (text: string, gradient: string, glow: string, at: number, out?: number) => (
    <Rise frame={frame} at={at} out={out} style={{position: 'absolute', left: 50, width: 600, top: 1030, textAlign: 'center'}}>
      <div style={italic(68, {lineHeight: 1.1})}>
        <Metal frame={frame} gradient={gradient} glow={glow}>
          {text}
        </Metal>
      </div>
    </Rise>
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={0} color={C.rose}>
          Celebrate the milestones
        </Eyebrow>
      </div>

      {/* Numerals: 25 rolls over into 50 */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          width: 600,
          top: 584,
          opacity: numIn * (1 - aside),
          translate: `${-aside * 140}px ${(1 - numIn) * 40 - aside * 30}px`,
          scale: String(mix(1, 0.7, aside)),
          filter: numIn < 1 || aside > 0 ? `blur(${(1 - numIn) * 14 + aside * 10}px)` : undefined,
        }}
      >
        <RollingNumeral frame={frame} from="25" to="50" at={golden - 8} size={420} />
      </div>
      <div style={{opacity: 1 - aside}}>
        {label('Silver anniversary', SILVER_GRADIENT, SILVER_GLOW, cue('anniversary') - 8, golden - 12)}
        {label('Golden milestone', GOLD_GRADIENT, 'rgba(212,175,55,0.28)', cue('milestone') - 6)}
        <div style={{position: 'absolute', left: 50, width: 600, top: 1124, textAlign: 'center', ...caps(19, {color: C.mute}), opacity: prog(frame, silver + 10, 30) * (1 - toGold)}}>
          Twenty-five years · Silver
        </div>
        <div style={{position: 'absolute', left: 50, width: 600, top: 1124, textAlign: 'center', ...caps(19, {color: C.mute}), opacity: toGold}}>
          Fifty years · Gold
        </div>
      </div>

      {/* Products: silver bar, then a gold bar; both step aside for the rings */}
      <Product
        src="bar-silver-liberty.png"
        frame={frame}
        w={mix(286, 180, aside)}
        h={mix(488, 307, aside)}
        x={mix(820, 150, aside)}
        y={mix(mix(1100, 990, silverIn) - toGold * 110, 910, aside)}
        rotate={mix(6, -6, aside)}
        opacity={silverIn * mix(1 - Math.min(1, toGold * 1.7), 0.7, aside)}
        blur={aside * 2.5 + toGold * (1 - aside) * 10}
        float={5}
        sheen={[silver + 30]}
        glow={SILVER_GLOW}
      />
      <Product
        src="card-fortuna-gold.png"
        frame={frame}
        w={mix(318, 192, aside)}
        h={mix(486, 294, aside)}
        x={mix(820, 930, aside)}
        y={mix(mix(1160, 1040, goldIn), 910, aside)}
        rotate={mix(mix(12, 5, goldIn), 6, aside)}
        opacity={goldIn * mix(1, 0.7, aside)}
        blur={aside * 2.5}
        float={5}
        floatPhase={1.3}
        sheen={[golden + 34]}
        glow="rgba(212,175,55,0.3)"
      />

      {/* Beat 3: two rings link */}
      <div style={{position: 'absolute', inset: 0, opacity: prog(frame, tradition - 10, 20)}}>
        <Rings frame={frame} at={tradition} />
        <Glint x={540} y={910 - Math.sqrt(150 * 150 - 60 * 60)} size={70} p={prog(frame, tradition + 34, 14) * (1 - prog(frame, tradition + 52, 30))} rotate={frame * 0.8} />
        <Rise frame={frame} at={tradition - 4} style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center'}}>
          <div style={italic(84, {lineHeight: 1.08})}>
            A new tradition
            <br />
            <Metal frame={frame} gradient={ROSE_GRADIENT} glow={ROSE_GLOW} sheenAt={cue('own') - 6}>
              of your own.
            </Metal>
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── 3 · Selection: a gliding gallery ───────────────────────── */

type GalleryItem = {src: string; kind: 'bar' | 'coin'; w: number; h: number; metal: 'gold' | 'silver'; label: string};

const GALLERY: GalleryItem[] = [
  {src: 'bar-clover-front.png', kind: 'bar', w: 236, h: 382, metal: 'gold', label: 'Gold bar'},
  {src: 'coin-silver-eagle.png', kind: 'coin', w: 330, h: 330, metal: 'silver', label: 'Silver coin'},
  {src: 'bar-justice-obv.png', kind: 'bar', w: 470, h: 380, metal: 'gold', label: 'Gold bar'},
  {src: 'card-fortuna-silver.png', kind: 'bar', w: 250, h: 386, metal: 'silver', label: 'Silver bar'},
  {src: 'coin-gold-eagle.png', kind: 'coin', w: 360, h: 360, metal: 'gold', label: 'Gold coin'},
  {src: 'bar-valcambi-5g.png', kind: 'bar', w: 224, h: 370, metal: 'gold', label: 'Gold bar'},
  {src: 'round-buffalo.png', kind: 'coin', w: 360, h: 360, metal: 'silver', label: 'Silver round'},
  {src: 'coin-maple.png', kind: 'coin', w: 330, h: 330, metal: 'gold', label: 'Gold coin'},
];

const SPACING = 360;
const PEDESTAL_Y = 1236;
const PIECE_SCALE = 1.16;

const Pedestal: React.FC<{x: number; y: number; scale: number; lit: number; opacity: number}> = ({x, y, scale, lit, opacity}) => {
  const w = 340 * scale;
  const top = 60 * scale;
  const body = 160 * scale;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - top / 2, width: w, height: top + body, opacity}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: top / 2,
          height: body,
          background: 'linear-gradient(90deg, #0b0a0c 0%, #2a2620 38%, #17151a 62%, #070608 100%)',
          maskImage: 'linear-gradient(180deg, black 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 40%, transparent 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: top,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at 50% 40%, rgba(255,232,190,${0.18 + lit * 0.32}) 0%, #2b2620 55%, #15130f 100%)`,
          boxShadow: `inset 0 0 0 1px rgba(212,175,55,${0.25 + lit * 0.4})`,
        }}
      />
    </div>
  );
};

const Selection: React.FC<SceneProps> = ({frame, cue, duration}) => {
  const bars = cue('bars');
  const coins = cue('coins');
  const rounds = cue('rounds');
  const brand = cue('Bullion');
  const drift = (f: number) => -0.25 + f * 0.0034;
  const step = (at: number) => prog(frame, at - 16, 30, EASE.inOut);
  const a = 2 - drift(bars + 14);
  const b = 4 - drift(coins + 14) - a;
  const c = 6 - drift(rounds + 14) - a - b;
  const s = drift(frame) + step(bars) * a + step(coins) * b + step(rounds) * c;
  const focusSheen: Record<number, number[]> = {2: [bars + 8], 4: [coins + 8], 6: [rounds + 8]};
  const order = GALLERY.map((item, i) => ({item, i, o: i - s})).filter(({o}) => Math.abs(o) < 2.7);
  order.sort((p, q) => Math.abs(q.o) - Math.abs(p.o));
  const nearest = GALLERY.map((_, i) => i).reduce((best, i) => (Math.abs(i - s) < Math.abs(best - s) ? i : best), 0);
  const labelAlpha = Math.max(0, 1 - Math.abs(nearest - s) * 2.6) * prog(frame, 20, 30);
  const enter = prog(frame, 0, 50, EASE.silk);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 284, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={cue('Explore') - 10} color={C.rose}>
          Explore the collection
        </Eyebrow>
        <div style={{...serif(126), marginTop: 26}}>
          <Rise inline frame={frame} at={cue('gold') - 6}>
            <Metal frame={frame} sheenAt={cue('gold') + 20}>
              Gold
            </Metal>
          </Rise>{' '}
          <Rise inline frame={frame} at={cue('silver') - 6}>
            <span>&amp; </span>
            <Metal frame={frame} gradient={SILVER_GRADIENT} glow={SILVER_GLOW} sheenAt={cue('silver') + 20}>
              silver,
            </Metal>
          </Rise>
        </div>
        <div style={italic(124, {lineHeight: 1.08})}>
          <Rise inline frame={frame} at={cue('beautifully') - 6}>
            <Metal frame={frame} gradient={ROSE_GRADIENT} glow={ROSE_GLOW} sheenAt={cue('detailed') + 10}>
              beautifully
            </Metal>
          </Rise>{' '}
          <Rise inline frame={frame} at={cue('detailed') - 6}>
            <Metal frame={frame} gradient={ROSE_GRADIENT} glow={ROSE_GLOW} sheenAt={cue('detailed') + 16}>
              detailed.
            </Metal>
          </Rise>
        </div>
      </div>

      {/* Mirrored floor line */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: PEDESTAL_Y + 70,
          height: 2,
          background: 'linear-gradient(90deg, rgba(233,185,164,0), rgba(233,185,164,0.35), rgba(233,185,164,0))',
          opacity: enter,
        }}
      />

      <div style={{position: 'absolute', inset: 0, opacity: enter, translate: `0 ${(1 - enter) * 60}px`}}>
        {order.map(({item, i, o}) => {
          const dist = Math.abs(o);
          const scale = 1 - Math.min(1, dist) * 0.42 - Math.max(0, dist - 1) * 0.12;
          const x = 540 + o * SPACING * (1 - Math.min(1, dist) * 0.18);
          const py = PEDESTAL_Y + Math.min(2.5, dist) * -26;
          const blur = Math.min(7, dist * 4.2);
          const opacity = Math.max(0, 1 - Math.max(0, dist - 1.5) * 0.9);
          const lit = Math.max(0, 1 - dist * 1.6);
          const h = item.h * scale * PIECE_SCALE;
          const w = item.w * scale * PIECE_SCALE;
          const cy = py - h / 2 - 26 * scale + Math.sin(frame / 46 + i) * 6 * scale;
          const sheen = [...(focusSheen[i] ?? []), ...(nearest === i ? [brand] : [])];
          return (
            <div key={item.src}>
              <Pedestal x={x} y={py} scale={scale} lit={lit} opacity={opacity} />
              {item.kind === 'coin' ? (
                <Coin
                  src={item.src}
                  frame={frame}
                  metal={item.metal}
                  d={w}
                  x={x}
                  y={cy}
                  turn={-o * 38 + Math.sin(frame / 55 + i) * 8}
                  tilt={4}
                  opacity={opacity}
                  blur={blur}
                  sheen={sheen}
                  glow={lit > 0.3 ? ROSE_GLOW : undefined}
                />
              ) : (
                <Product
                  src={item.src}
                  frame={frame}
                  w={w}
                  h={h}
                  x={x}
                  y={cy}
                  rotate={-o * 4}
                  opacity={opacity}
                  blur={blur}
                  sheen={sheen}
                  glow={lit > 0.3 ? 'rgba(255,214,140,0.28)' : undefined}
                />
              )}
            </div>
          );
        })}
      </div>

      <div style={{position: 'absolute', top: PEDESTAL_Y + 104, left: 0, right: 0, textAlign: 'center', opacity: labelAlpha * (1 - prog(frame, duration - 20, 14))}}>
        <div style={caps(20, {color: C.champagne})}>{GALLERY[nearest].label}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── 4 · Keepsake: hold, admire, remember, shine ───────────────────────── */

const SPARKS = Array.from({length: 18}, (_, i) => ({
  angle: random(`spark-a${i}`) * Math.PI * 2,
  dist: 120 + random(`spark-d${i}`) * 260,
  size: 10 + random(`spark-s${i}`) * 22,
  delay: Math.floor(random(`spark-t${i}`) * 14),
}));

const Keepsake: React.FC<SceneProps> = ({frame, cue}) => {
  const hold = cue('hold');
  const admire = cue('admire');
  const remember = cue('remember');
  const make = cue('Make');
  const shine = cue('shine');
  const swap = prog(frame, make - 14, 22, EASE.in);
  const enter = prog(frame, 0, 60, EASE.silk);
  const held = prog(frame, hold - 4, 40, EASE.out);
  const flourish = prog(frame, admire - 6, 60, EASE.inOut);
  const halo = prog(frame, remember - 4, 50, EASE.out);
  const burst = prog(frame, shine - 2, 18, EASE.out) * (1 - prog(frame, shine + 26, 40, EASE.inOut));
  const cx = 540;
  const cy = 1010;
  const D = 600;
  const rimX = cx + Math.cos(-2.35) * (D / 2 - 6);
  const rimY = cy + Math.sin(-2.35) * (D / 2 - 6);
  const words = [
    {text: 'Hold.', at: hold},
    {text: 'Admire.', at: admire},
    {text: 'Remember.', at: remember},
  ];
  const active = words.reduce((idx, w, i) => (frame >= w.at - 4 ? i : idx), -1);
  const row = prog(frame, cue('something') - 4, 34);
  return (
    <AbsoluteFill>
      {/* Phase one headline */}
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', opacity: 1 - swap, filter: swap > 0 ? `blur(${swap * 10}px)` : undefined}}>
        <Rise frame={frame} at={cue('Choose') - 8}>
          <div style={serif(118)}>Choose something</div>
        </Rise>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 26, marginTop: 18}}>
          {words.map((w, i) => {
            const p = prog(frame, w.at - 6, 24);
            const on = i === active;
            return (
              <div
                key={w.text}
                style={italic(96, {
                  opacity: row * mix(0.2, on ? 1 : 0.5, p),
                  translate: `0 ${(1 - row) * 30 - (on ? p * 6 : 0)}px`,
                  filter: row < 1 ? `blur(${(1 - row) * 10}px)` : undefined,
                })}
              >
                {on ? (
                  <Metal frame={frame} gradient={ROSE_GRADIENT} glow={ROSE_GLOW} sheenAt={w.at + 6}>
                    {w.text}
                  </Metal>
                ) : (
                  w.text
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase two headline */}
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={make - 6}>
          <div style={serif(118)}>Make the moment</div>
        </Rise>
        <Rise frame={frame} at={shine - 10} dur={40}>
          <div style={italic(176, {lineHeight: 1.02})}>
            <Metal frame={frame} sheenAt={shine + 10} glow="rgba(212,175,55,0.45)">
              shine.
            </Metal>
          </div>
        </Rise>
      </div>

      {/* Remember: a warm halo blooms behind the coin */}
      <div
        style={{
          position: 'absolute',
          left: cx - 480,
          top: cy - 480,
          width: 960,
          height: 960,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(233,185,164,${0.22 * halo + 0.35 * burst}) 0%, rgba(233,185,164,${0.08 * halo}) 38%, rgba(0,0,0,0) 62%)`,
          scale: String(0.8 + halo * 0.2 + burst * 0.1),
        }}
      />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <circle cx={cx} cy={cy} r={D / 2 + 40 + halo * 60} fill="none" stroke="#e9b9a4" strokeWidth={1.5} opacity={halo * (1 - prog(frame, remember + 20, 60)) * 0.7} />
        <circle
          cx={cx}
          cy={cy}
          r={D / 2 + 34}
          fill="none"
          stroke="#d4af37"
          strokeOpacity={0.35 * enter}
          strokeWidth={1}
          strokeDasharray="2 12"
          transform={`rotate(${frame * 0.12} ${cx} ${cy})`}
        />
      </svg>

      <Coin
        src="coin-gold-eagle.png"
        frame={frame}
        metal="gold"
        d={D}
        x={cx}
        y={mix(1080, cy, enter) - held * 14}
        scale={1 + held * 0.03 + burst * 0.02}
        turn={mix(-80, 0, enter) + Math.sin(frame / 62) * 22 + flourish * 360}
        tilt={6 + Math.sin(frame / 80) * 3}
        roll={-4}
        opacity={Math.min(1, enter * 1.6)}
        sheen={[admire + 4, shine]}
        glow={ROSE_GLOW}
      />

      {/* Shine: star glints on the rim, an anamorphic streak and sparks */}
      <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
        <div
          style={{
            position: 'absolute',
            left: rimX - 520,
            top: rimY - 5,
            width: 1040,
            height: 10,
            borderRadius: 10,
            background: 'linear-gradient(90deg, rgba(255,230,190,0), rgba(255,240,215,0.95) 50%, rgba(255,230,190,0))',
            boxShadow: '0 0 30px rgba(255,214,160,0.8)',
            opacity: burst,
            scale: `${0.4 + burst * 0.6} 1`,
          }}
        />
        <Glint x={rimX} y={rimY} size={150} p={burst} rotate={frame * 0.6} />
        <Glint x={cx + 268} y={cy + 120} size={70} p={prog(frame, shine + 8, 14) * (1 - prog(frame, shine + 30, 30))} rotate={-frame * 0.9} />
        <Glint x={cx + 60} y={cy - 292} size={56} p={prog(frame, shine + 14, 14) * (1 - prog(frame, shine + 34, 30))} rotate={frame} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {SPARKS.map((s, i) => {
            const t = prog(frame, shine + s.delay, 40, EASE.out);
            if (t <= 0 || t >= 1) {
              return null;
            }
            const r = D / 2 + s.dist * t;
            const x = cx + Math.cos(s.angle) * r;
            const y = cy + Math.sin(s.angle) * r;
            const sz = s.size * (1 - t);
            return <path key={i} d={`M${x} ${y - sz} L${x + sz * 0.18} ${y} L${x} ${y + sz} L${x - sz * 0.18} ${y}Z M${x - sz} ${y} L${x} ${y + sz * 0.18} L${x + sz} ${y} L${x} ${y - sz * 0.18}Z`} fill="#fff4d6" opacity={1 - t} />;
          })}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────────────────── 5 · CTA ───────────────────────── */

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="Give something meaningful"
    footer="Gifts in gold & silver"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product
            src="bar-clover-persp.png"
            frame={frame}
            w={560}
            h={439}
            x={500}
            y={mix(960, 900, p)}
            rotate={-4}
            opacity={p}
            float={6}
            sheen={[50]}
            glow="rgba(255,214,140,0.3)"
          />
          <Coin
            src="round-buffalo.png"
            frame={frame}
            metal="silver"
            d={250}
            x={mix(900, 800, p)}
            y={1040}
            turn={mix(-90, -18, prog(frame, 8, 60))}
            roll={-6}
            opacity={prog(frame, 8, 30)}
            sheen={[70]}
            glow={ROSE_GLOW}
          />
        </>
      );
    }}
  />
);

export const GIFT_SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  milestones: Milestones,
  selection: Selection,
  keepsake: Keepsake,
  cta: Cta,
};
