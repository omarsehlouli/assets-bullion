import type React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {EndCard} from '../kit/EndCard';
import {Coin, Product} from '../kit/Product';
import {Skyline} from '../kit/Pieces';
import {caps, Eyebrow, italic, MaskLine, Metal, Rise, serif} from '../kit/Text';
import {art, C, EASE, mix, prog, type SceneProps} from '../kit/theme';

const Spot: React.FC<{x: number; y: number; w: number; h: number; opacity: number}> = ({x, y, w, h, opacity}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      borderRadius: '50%',
      background: 'radial-gradient(ellipse at center, rgba(232,190,100,0.28) 0%, rgba(232,190,100,0.08) 40%, rgba(0,0,0,0) 70%)',
      opacity,
    }}
  />
);

const Hook: React.FC<SceneProps> = ({frame, cue}) => {
  const closer = cue('closer');
  const push = prog(frame, closer - 6, 70, EASE.inOut);
  const land = prog(frame, 0, 90, EASE.silk);
  const silverAt = cue('silver');
  const coinIn = prog(frame, silverAt - 4, 50, EASE.out);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: 1 - push * 0.8, translate: `0 ${-push * 40}px`, filter: `blur(${push * 6}px)`}}>
        <div style={serif(134)}>
          <Rise inline frame={frame} at={cue('Your') - 6}>
            Your
          </Rise>{' '}
          <Rise inline frame={frame} at={cue('first') - 6}>
            first
          </Rise>
        </div>
        <MaskLine frame={frame} at={cue('piece') - 6} dur={46}>
          <div style={italic(196, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={cue('piece') + 30}>
              piece.
            </Metal>
          </div>
        </MaskLine>
      </div>
      <div style={{position: 'absolute', inset: 0, scale: String(1 + push * 0.34), transformOrigin: '540px 1040px'}}>
        <Spot x={540} y={1060} w={1000} h={700} opacity={land} />
        <Product
          src="bar-justice-obv.png"
          frame={frame}
          w={700}
          h={566}
          x={520}
          y={mix(860, 1030, land)}
          rotate={mix(-6, 0, land)}
          opacity={Math.min(1, land * 1.6)}
          float={7}
          sheen={[64, closer + 10]}
          glow="rgba(214,168,74,0.25)"
        />
        <Coin
          src="coin-silver-eagle.png"
          frame={frame}
          metal="silver"
          d={300}
          x={mix(980, 820, coinIn)}
          y={1240}
          turn={mix(-100, -16, coinIn)}
          tilt={6}
          roll={-8}
          opacity={coinIn}
          blur={push * 7}
          sheen={[silverAt + 40]}
        />
      </div>
      <div style={{position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30, opacity: 1 - push}}>
        <Rise inline frame={frame} at={cue('gold') - 4}>
          <span style={caps(24, {color: C.gold})}>Gold</span>
        </Rise>
        <Rise inline frame={frame} at={cue('or') - 2}>
          <span style={caps(24, {color: C.mute})}>or</span>
        </Rise>
        <Rise inline frame={frame} at={silverAt - 4}>
          <span style={caps(24, {color: C.silver})}>Silver</span>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const NICHE_W = 292;
const NICHE_H = 640;
const NICHE_TOP = 690;

const archPath = (w: number, h: number) => `M2 ${h} V${w / 2} A${w / 2 - 2} ${w / 2 - 2} 0 0 1 ${w - 2} ${w / 2} V${h} Z`;

const Niche: React.FC<{frame: number; x: number; drawAt: number; litAt: number; label: string; children: React.ReactNode; flash: number}> = ({
  frame,
  x,
  drawAt,
  litAt,
  label,
  children,
  flash,
}) => {
  const draw = prog(frame, drawAt, 60, EASE.inOut);
  const lit = prog(frame, litAt - 6, 30);
  return (
    <div style={{position: 'absolute', left: x - NICHE_W / 2, top: NICHE_TOP, width: NICHE_W, height: NICHE_H}}>
      <svg width={NICHE_W} height={NICHE_H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id={`niche-${x}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`rgba(240,200,120,${0.1 + lit * 0.2 + flash * 0.15})`} />
            <stop offset="0.6" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.3)" />
          </linearGradient>
        </defs>
        <path d={archPath(NICHE_W, NICHE_H)} fill={`url(#niche-${x})`} opacity={draw} />
        <path
          d={archPath(NICHE_W, NICHE_H)}
          fill="none"
          stroke="#d4af37"
          strokeOpacity={0.35 + lit * 0.45}
          strokeWidth={1.6}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: -40,
          right: -40,
          top: 60,
          height: 520,
          background: 'radial-gradient(ellipse 45% 55% at 50% 20%, rgba(255,226,160,0.32), rgba(0,0,0,0) 70%)',
          opacity: lit,
        }}
      />
      {children}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', ...caps(19, {color: lit > 0.5 ? C.champagne : C.mute}), opacity: 0.4 + lit * 0.6}}>
        {label}
      </div>
    </div>
  );
};

const Choice: React.FC<SceneProps> = ({frame, cue}) => {
  const bars = cue('bars');
  const coins = cue('coins');
  const rounds = cue('rounds');
  const brand = cue('Bullion');
  const flash = prog(frame, brand, 20) * (1 - prog(frame, brand + 24, 40));
  const barIn = prog(frame, bars - 8, 46, EASE.out);
  const coinIn = prog(frame, coins - 8, 70, EASE.out);
  const roundIn = prog(frame, rounds - 8, 70, EASE.out);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={cue('Explore') - 10}>
          Explore the collection
        </Eyebrow>
        <div style={{...serif(124), marginTop: 30}}>
          <Rise inline frame={frame} at={bars - 6}>
            Bars,
          </Rise>{' '}
          <Rise inline frame={frame} at={coins - 6}>
            coins
          </Rise>
        </div>
        <Rise frame={frame} at={rounds - 6} dur={40}>
          <div style={italic(150, {lineHeight: 1.02})}>
            <Metal frame={frame} sheenAt={brand}>
              &amp; rounds.
            </Metal>
          </div>
        </Rise>
      </div>
      <Niche frame={frame} x={222} drawAt={0} litAt={bars} label="Gold bars" flash={flash}>
        <Product
          src="bar-clover-front.png"
          frame={frame}
          w={196}
          h={318}
          x={NICHE_W / 2}
          y={mix(420, 330, barIn)}
          opacity={barIn}
          float={5}
          sheen={[bars + 30, brand + 2]}
          glow="rgba(214,168,74,0.25)"
        />
      </Niche>
      <Niche frame={frame} x={540} drawAt={8} litAt={coins} label="Silver coins" flash={flash}>
        <Coin
          src="coin-silver-eagle.png"
          frame={frame}
          metal="silver"
          d={228}
          x={NICHE_W / 2}
          y={mix(390, 330, coinIn) + Math.sin(frame / 50) * 5}
          turn={mix(-540, 0, coinIn) + Math.sin(frame / 60) * 10}
          tilt={4}
          opacity={Math.min(1, coinIn * 3)}
          sheen={[brand + 8]}
        />
      </Niche>
      <Niche frame={frame} x={858} drawAt={16} litAt={rounds} label="Silver rounds" flash={flash}>
        <Coin
          src="round-buffalo.png"
          frame={frame}
          metal="silver"
          d={228}
          x={NICHE_W / 2}
          y={mix(390, 330, roundIn) + Math.sin(frame / 50 + 1) * 5}
          turn={mix(540, 0, roundIn) + Math.sin(frame / 60 + 1) * 10}
          tilt={4}
          opacity={Math.min(1, roundIn * 3)}
          sheen={[brand + 14]}
        />
      </Niche>
    </AbsoluteFill>
  );
};

// Phase A: two assay cards side by side; B: a loupe over the 1 oz bar;
// C: pieces settle into a velvet collection tray.
const CARD_H = 560;
const JUSTICE_W = Math.round((CARD_H * 630) / 958);
const VALCAMBI_W = Math.round((CARD_H * 321) / 481);

const TRAY = [
  {src: 'bar-clover-front.png', w: 118, h: 192, coin: false},
  {src: 'coin-gold-eagle.png', w: 186, h: 186, coin: true},
  {src: 'bar-silver-liberty.png', w: 112, h: 192, coin: false},
  {src: 'coin-maple.png', w: 186, h: 186, coin: true},
  {src: 'bar-valcambi-5g.png', w: 116, h: 192, coin: false},
  {src: 'round-buffalo.png', w: 186, h: 186, coin: true},
];

const Details: React.FC<SceneProps> = ({frame, cue}) => {
  const weights = cue('weights');
  const discover = cue('discover');
  const find = cue('find');
  const collection = cue('collection');
  const toLoupe = prog(frame, discover - 18, 40, EASE.inOut);
  const toTray = prog(frame, find - 22, 30, EASE.inOut);
  const measure = prog(frame, weights - 4, 40, EASE.inOut);

  // Card geometry (the 1 oz card slides to centre and grows for the loupe).
  const jScale = mix(1, 1.18, toLoupe);
  const jx = mix(318, 540, toLoupe);
  const jy = 1000;
  const jw = JUSTICE_W * jScale;
  const jh = CARD_H * jScale;
  const jLeft = jx - jw / 2;
  const jTop = jy - jh / 2;

  const loupeIn = prog(frame, discover - 4, 34, EASE.out) * (1 - toTray);
  const travel = prog(frame, discover, find - discover, EASE.inOut);
  const lx = mix(500, 585, travel);
  const ly = mix(870, 1040, travel);
  const R = 175;
  const M = 2.4;

  const headline = (at: number, out: number | undefined, a: string, b: string) => (
    <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
      <Rise frame={frame} at={at} out={out}>
        <div style={serif(118)}>{a}</div>
      </Rise>
      <Rise frame={frame} at={at + 6} out={out}>
        <div style={italic(140, {lineHeight: 1.04})}>
          <Metal frame={frame} sheenAt={at + 30}>
            {b}
          </Metal>
        </div>
      </Rise>
    </div>
  );

  return (
    <AbsoluteFill>
      {headline(cue('Compare') - 8, discover - 22, 'Compare', 'the weights.')}
      {headline(discover - 4, find - 24, 'Discover', 'the details.')}
      {headline(find - 6, undefined, 'Find your', 'piece.')}

      {/* A + B: assay cards */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - toTray, filter: toTray > 0 ? `blur(${toTray * 10}px)` : undefined}}>
        <Product
          src="card-justice.png"
          frame={frame}
          w={jw}
          h={jh}
          x={jx}
          y={jy + (1 - prog(frame, 0, 40)) * 60}
          opacity={prog(frame, 0, 30)}
          sheen={[20]}
          float={3}
        />
        <Product
          src="card-valcambi.png"
          frame={frame}
          w={VALCAMBI_W}
          h={CARD_H}
          x={mix(762, 1000, toLoupe)}
          y={1000 + (1 - prog(frame, 6, 40)) * 60}
          opacity={prog(frame, 6, 30) * (1 - toLoupe)}
          sheen={[30]}
          float={3}
          floatPhase={1.4}
        />
        {/* Weight annotations */}
        <div style={{opacity: measure * (1 - toLoupe)}}>
          {[
            {x: 318, label: '1 oz', sub: '31.1 g'},
            {x: 762, label: '5 g', sub: '0.16 oz'},
          ].map((m) => (
            <div key={m.label} style={{position: 'absolute', left: m.x - 150, width: 300, top: 1296, textAlign: 'center'}}>
              <div style={{width: 260 * measure, height: 1, margin: '0 auto', background: 'linear-gradient(90deg, rgba(212,175,55,0), #d4af37, rgba(212,175,55,0))'}} />
              <div style={{...serif(78), marginTop: 10}}>
                <Metal frame={frame}>{m.label}</Metal>
              </div>
              <div style={caps(17, {color: C.mute, marginTop: 4})}>{m.sub}</div>
            </div>
          ))}
        </div>
        {/* Loupe */}
        {loupeIn > 0.01 ? (
          <div style={{position: 'absolute', left: lx - R, top: ly - R, width: R * 2, height: R * 2, opacity: loupeIn, scale: String(mix(0.6, 1, loupeIn))}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
              <div style={{position: 'absolute', inset: 0, background: '#0b0b0e'}} />
              <Img
                src={art('card-justice.png')}
                style={{
                  position: 'absolute',
                  left: lx - (lx - jLeft) * M - (lx - R),
                  top: ly - (ly - jTop) * M - (ly - R),
                  width: jw * M,
                  height: jh * M,
                }}
              />
              <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.28), rgba(255,255,255,0) 38%)'}} />
              <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.7)'}} />
            </div>
            <svg
              width={R * 2 + 80}
              height={R * 2 + 80}
              style={{position: 'absolute', left: -40, top: -40, overflow: 'visible', filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.75))'}}
            >
              <defs>
                <linearGradient id="bezel" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#3a3833" />
                  <stop offset="0.45" stopColor="#141416" />
                  <stop offset="1" stopColor="#2a2824" />
                </linearGradient>
              </defs>
              <circle cx={R + 40} cy={R + 40} r={R + 17} fill="none" stroke="url(#bezel)" strokeWidth={32} />
              {Array.from({length: 72}, (_, i) => {
                const a = (i / 72) * Math.PI * 2 + frame / 240;
                return (
                  <line
                    key={i}
                    x1={R + 40 + Math.cos(a) * (R + 8)}
                    y1={R + 40 + Math.sin(a) * (R + 8)}
                    x2={R + 40 + Math.cos(a) * (R + 26)}
                    y2={R + 40 + Math.sin(a) * (R + 26)}
                    stroke="#e2c46c"
                    strokeOpacity={0.22}
                    strokeWidth={1.4}
                  />
                );
              })}
              <circle cx={R + 40} cy={R + 40} r={R + 1.5} fill="none" stroke="#f0d27a" strokeWidth={3} />
              <circle cx={R + 40} cy={R + 40} r={R + 33} fill="none" stroke="#b8902f" strokeWidth={2} />
            </svg>
            <div style={{position: 'absolute', left: R * 2 + 24, top: R * 2 + 4, ...caps(16, {color: C.goldLight, letterSpacing: '0.2em'})}}>×2.4</div>
          </div>
        ) : null}
      </div>

      {/* C: collection tray */}
      <div style={{position: 'absolute', left: 110, top: 720, width: 860, height: 600, opacity: toTray, translate: `0 ${(1 - toTray) * 60}px`}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 34,
            background: 'linear-gradient(160deg, #1b1712 0%, #0d0b09 100%)',
            boxShadow: '0 50px 90px rgba(0,0,0,0.7), inset 0 0 0 1.5px rgba(212,175,55,0.45), inset 0 2px 0 rgba(255,235,190,0.12)',
          }}
        />
        {TRAY.map((item, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const cx = 150 + col * 280;
          const cy = 160 + row * 280;
          const at = find + 2 + i * 13;
          const drop = prog(frame, at, 26, EASE.out);
          return (
            <div key={item.src}>
              <div
                style={{
                  position: 'absolute',
                  left: cx - 118,
                  top: cy - 118,
                  width: 236,
                  height: 236,
                  borderRadius: item.coin ? '50%' : 24,
                  background: 'radial-gradient(ellipse at 50% 40%, #16120d, #070605)',
                  boxShadow: 'inset 0 10px 22px rgba(0,0,0,0.85), inset 0 -1px 0 rgba(255,235,190,0.08)',
                }}
              />
              <Product
                src={item.src}
                frame={frame}
                w={item.w}
                h={item.h}
                x={cx}
                y={cy - (1 - drop) * 50}
                scale={mix(1.25, 1, drop)}
                opacity={drop}
                shadow="drop"
                sheen={[collection + i * 4]}
              />
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: -64, textAlign: 'center', ...caps(19), opacity: prog(frame, collection, 30)}}>
          Your collection
        </div>
      </div>
    </AbsoluteFill>
  );
};

// A gentle, plausible-looking spot trace (illustrative only — no figures).
const TRACE = Array.from({length: 120}, (_, i) => {
  const t = i / 119;
  return 0.55 - 0.25 * t + 0.07 * Math.sin(t * 17) + 0.04 * Math.sin(t * 41 + 1) + 0.025 * Math.sin(t * 93 + 2);
});

const Confidence: React.FC<SceneProps> = ({frame, cue}) => {
  const live = cue('live');
  const spot = cue('spot-based');
  const ny = cue('New');
  const order = cue('order');
  const take = cue('take');
  const toCity = prog(frame, ny - 22, 34, EASE.inOut);
  const toStep = prog(frame, take - 16, 30, EASE.inOut);
  const draw = prog(frame, 10, 150, EASE.silk);
  const PW = 880;
  const PH = 440;
  const pts = TRACE.map((v, i) => [40 + (i / 119) * (PW - 80), 60 + v * (PH - 120)] as const);
  const shown = pts.slice(0, Math.max(2, Math.round(draw * pts.length)));
  const head = shown[shown.length - 1];
  const d = shown.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const pulse = (frame % 50) / 50;
  const check = prog(frame, order - 6, 30, EASE.out);
  return (
    <AbsoluteFill>
      {/* A — live spot pricing */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - toCity, filter: toCity > 0 ? `blur(${toCity * 10}px)` : undefined}}>
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
          <Rise frame={frame} at={live - 8}>
            <div style={{...serif(126), display: 'inline-flex', alignItems: 'center', gap: 28}}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: '#e9c766',
                  boxShadow: `0 0 0 ${pulse * 26}px rgba(233,199,102,${0.4 * (1 - pulse)}), 0 0 24px rgba(233,199,102,0.8)`,
                }}
              />
              Live,
            </div>
          </Rise>
          <Rise frame={frame} at={spot - 6}>
            <div style={italic(118, {lineHeight: 1.06})}>
              <Metal frame={frame} sheenAt={spot + 30}>
                spot-based pricing.
              </Metal>
            </div>
          </Rise>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 540 - PW / 2,
            top: 760,
            width: PW,
            height: PH,
            borderRadius: 30,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))',
            boxShadow: 'inset 0 0 0 1px rgba(255,240,210,0.12), 0 40px 80px rgba(0,0,0,0.5)',
            opacity: prog(frame, 0, 30),
            translate: `0 ${(1 - prog(frame, 0, 40)) * 50}px`,
          }}
        >
          <svg width={PW} height={PH} style={{position: 'absolute', inset: 0}}>
            <defs>
              <linearGradient id="trace-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d4af37" stopOpacity="0.28" />
                <stop offset="1" stopColor="#d4af37" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1={40} x2={PW - 40} y1={60 + g * (PH - 120)} y2={60 + g * (PH - 120)} stroke="rgba(255,240,210,0.07)" strokeDasharray="4 10" />
            ))}
            <path d={`${d} L${head[0]} ${PH - 40} L40 ${PH - 40} Z`} fill="url(#trace-fill)" />
            <path d={d} fill="none" stroke="#e9c766" strokeWidth={3.5} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 10px rgba(233,199,102,0.7))'}} />
            <circle cx={head[0]} cy={head[1]} r={8} fill="#fff4cf" />
            <circle cx={head[0]} cy={head[1]} r={8 + pulse * 26} fill="none" stroke="#e9c766" strokeOpacity={1 - pulse} strokeWidth={2} />
          </svg>
          <div style={{position: 'absolute', left: 40, top: 26, ...caps(17)}}>Spot · Gold &amp; Silver</div>
          <div
            style={{
              position: 'absolute',
              right: 34,
              top: 20,
              padding: '6px 16px',
              borderRadius: 999,
              border: '1px solid rgba(233,199,102,0.6)',
              ...caps(15, {color: '#f0d27a', letterSpacing: '0.3em'}),
              opacity: 0.6 + 0.4 * Math.sin(frame / 8),
            }}
          >
            Live
          </div>
        </div>
        <div style={{position: 'absolute', top: 1240, left: 0, right: 0}}>
          <Eyebrow frame={frame} at={cue('pricing') - 4} color={C.mute}>
            Priced from the live spot market
          </Eyebrow>
        </div>
      </div>

      {/* B — the New York team */}
      <div style={{position: 'absolute', inset: 0, opacity: toCity * (1 - toStep), translate: `${-toStep * 120}px 0`, filter: toStep > 0 ? `blur(${toStep * 8}px)` : undefined}}>
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
          <Rise frame={frame} at={ny - 6}>
            <div style={serif(118)}>A New York team</div>
          </Rise>
          <Rise frame={frame} at={cue('behind') - 6}>
            <div style={italic(122, {lineHeight: 1.06})}>
              <Metal frame={frame} sheenAt={order}>
                behind every order.
              </Metal>
            </div>
          </Rise>
        </div>
        <Skyline frame={frame} at={ny - 10} y={640} />
        <div
          style={{
            position: 'absolute',
            left: 230,
            right: 230,
            top: 1150,
            height: 170,
            borderRadius: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            padding: '0 36px',
            background: 'linear-gradient(180deg, rgba(36,30,20,0.85), rgba(14,12,9,0.85))',
            boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.5), 0 30px 70px rgba(0,0,0,0.6)',
            opacity: prog(frame, cue('every') - 8, 30),
            translate: `0 ${(1 - prog(frame, cue('every') - 8, 36)) * 40}px`,
          }}
        >
          <svg width={86} height={86} viewBox="0 0 86 86">
            <circle cx={43} cy={43} r={39} fill="none" stroke="#d4af37" strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
            <path d="M25 44 L38 57 L62 31" fill="none" stroke="#f6e3a1" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(frame, order + 8, 22)} />
          </svg>
          <div>
            <div style={caps(17)}>Your order</div>
            <div style={italic(50, {marginTop: 8})}>Handled in New York</div>
          </div>
        </div>
      </div>

      {/* C — the next step */}
      <div style={{position: 'absolute', inset: 0, opacity: toStep}}>
        <div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center'}}>
          <Rise frame={frame} at={take - 8}>
            <div style={serif(140)}>Take the</div>
          </Rise>
          <Rise frame={frame} at={cue('next') - 6}>
            <div style={italic(176, {lineHeight: 1.04})}>
              <Metal frame={frame} sheenAt={cue('step')}>
                next step.
              </Metal>
            </div>
          </Rise>
        </div>
        <svg width={1080} height={200} style={{position: 'absolute', left: 0, top: 1090, overflow: 'visible'}}>
          <path
            d="M140 100 H900"
            stroke="#e2c46c"
            strokeWidth={2.5}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - prog(frame, cue('step') - 10, 40, EASE.inOut)}
            style={{filter: 'drop-shadow(0 0 8px rgba(226,196,108,0.7))'}}
          />
          <path d="M880 82 L906 100 L880 118" fill="none" stroke="#e2c46c" strokeWidth={2.5} opacity={prog(frame, cue('step') + 22, 12)} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="Your next piece starts here"
    footer="Gold · Silver · New York"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product src="bar-justice-obv.png" frame={frame} w={560} h={453} x={510} y={mix(960, 900, p)} opacity={p} float={6} sheen={[50]} glow="rgba(214,168,74,0.25)" />
          <Coin
            src="coin-silver-eagle.png"
            frame={frame}
            metal="silver"
            d={250}
            x={mix(900, 800, p)}
            y={1040}
            turn={mix(-90, -18, prog(frame, 8, 60))}
            roll={-6}
            opacity={prog(frame, 8, 30)}
            sheen={[70]}
          />
        </>
      );
    }}
  />
);

export const FIRST_PIECE_SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  choice: Choice,
  details: Details,
  confidence: Confidence,
  cta: Cta,
};

