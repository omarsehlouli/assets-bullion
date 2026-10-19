import type React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {EndCard} from '../../marketing-premium/kit/EndCard';
import {Litany} from '../../marketing-premium/kit/Pieces';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps, Eyebrow, italic, MaskLine, Metal, Rise, serif} from '../../marketing-premium/kit/Text';
import {art, C, EASE, LOGO, mix, prog, SANS, type SceneProps} from '../../marketing-premium/kit/theme';

// Sell to Us — the buyback desk: published prices, lock in online any time,
// ship with the label provided, paid after inspection and approval.

const Pool: React.FC<{x: number; y: number; w: number; h: number; opacity: number}> = ({x, y, w, h, opacity}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      borderRadius: '50%',
      background: 'radial-gradient(ellipse at center, rgba(232,190,100,0.26) 0%, rgba(232,190,100,0.07) 42%, rgba(0,0,0,0) 70%)',
      opacity,
    }}
  />
);

const LiveDot: React.FC<{frame: number; size?: number}> = ({frame, size = 12}) => {
  const pulse = (frame % 50) / 50;
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#e9c766',
        boxShadow: `0 0 0 ${pulse * size}px rgba(233,199,102,${0.4 * (1 - pulse)}), 0 0 12px rgba(233,199,102,0.8)`,
      }}
    />
  );
};

// A value we deliberately never print: a soft gold bar that shimmers like a live quote.
const Shimmer: React.FC<{frame: number; w: number; phase?: number; flash?: number}> = ({frame, w, phase = 0, flash = 0}) => (
  <span
    style={{
      display: 'inline-block',
      width: w,
      height: 14,
      borderRadius: 7,
      background: `linear-gradient(90deg, rgba(212,175,55,${0.18 + flash * 0.3}), rgba(255,236,180,${0.65 + flash * 0.35}) ${((frame * 1.4 + phase * 37) % 170) - 35}%, rgba(212,175,55,${0.18 + flash * 0.3}))`,
      boxShadow: flash > 0.05 ? `0 0 ${18 * flash}px rgba(246,227,161,${0.7 * flash})` : undefined,
    }}
  />
);

// ——— Hook: a spread of holdings under a spotlight ———

const Hook: React.FC<SceneProps> = ({frame, cue}) => {
  const gold = cue('gold');
  const silver = cue('silver');
  const items = (i: number) => prog(frame, 4 + i * 7, 48, EASE.silk);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={4}>
          The buyback desk
        </Eyebrow>
        <Rise frame={frame} at={cue('Thinking') - 8} style={{marginTop: 28}}>
          <div style={serif(118)}>Thinking of</div>
        </Rise>
        <MaskLine frame={frame} at={cue('selling') - 6} dur={42}>
          <div style={italic(178, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={cue('selling') + 26}>
              selling?
            </Metal>
          </div>
        </MaskLine>
      </div>
      <Pool x={540} y={1100} w={1100} h={720} opacity={prog(frame, 0, 40)} />
      <Product
        src="bar-silver-liberty.png"
        frame={frame}
        w={180}
        h={307}
        x={235}
        y={mix(1220, 1130, items(2))}
        rotate={-16}
        opacity={items(2)}
        float={4}
        floatPhase={2}
        sheen={[silver]}
      />
      <Product
        src="bar-justice-obv.png"
        frame={frame}
        w={500}
        h={404}
        x={470}
        y={mix(1080, 990, items(0))}
        rotate={-4}
        opacity={items(0)}
        float={5}
        sheen={[gold]}
        glow="rgba(214,168,74,0.22)"
      />
      <Coin src="coin-gold-eagle.png" frame={frame} d={240} x={790} y={mix(1060, 1000, items(1))} turn={mix(-70, 14, items(1))} tilt={6} opacity={items(1)} sheen={[gold + 6]} />
      <Coin
        src="coin-silver-eagle.png"
        frame={frame}
        metal="silver"
        d={210}
        x={640}
        y={mix(1290, 1230, items(3))}
        turn={mix(80, -12, items(3))}
        tilt={4}
        opacity={items(3)}
        sheen={[silver + 4]}
      />
      <Coin src="coin-maple.png" frame={frame} d={160} x={880} y={mix(1300, 1250, items(4))} turn={mix(-60, 8, items(4))} opacity={items(4)} sheen={[gold + 12]} />
      <div style={{position: 'absolute', top: 690, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30}}>
        <Rise inline frame={frame} at={gold - 4}>
          <span style={caps(24, {color: C.gold})}>Gold</span>
        </Rise>
        <Rise inline frame={frame} at={cue('or') - 2}>
          <span style={caps(24, {color: C.mute})}>or</span>
        </Rise>
        <Rise inline frame={frame} at={silver - 4}>
          <span style={caps(24, {color: C.silver})}>Silver</span>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

// ——— Prices: the published buyback list ———

const ROWS = [
  {src: 'bar-justice-obv.png', name: '1 oz PAMP Suisse Lady of Justice Gold Bar', sub: 'Gold · in assay', fit: 'contain' as const},
  {src: 'coin-maple.png', name: '1 oz Canadian Gold Maple Leaf Coin', sub: 'Gold · .9999', fit: 'contain' as const},
  {src: 'card-fortuna-gold.png', name: '1 oz PAMP Suisse Gold Bar – Lady Fortuna', sub: 'Gold · Veriscan', fit: 'contain' as const},
  {src: 'coin-silver-eagle.png', name: '1 oz American Silver Eagle Coin', sub: 'Silver · random year', fit: 'contain' as const},
  {src: 'bar-silver-liberty.png', name: '1 oz Silver Bar – PAMP Lady of Liberty', sub: 'Silver · .999', fit: 'contain' as const},
];

const PANEL = {x: 70, y: 650, w: 940, h: 700};

const BuybackPanel: React.FC<{frame: number; refreshAt: number; checks?: number[]; rows?: number}> = ({frame, refreshAt, checks, rows = ROWS.length}) => (
  <div
    style={{
      position: 'absolute',
      left: PANEL.x,
      top: PANEL.y,
      width: PANEL.w,
      height: rows === ROWS.length ? PANEL.h : 150 + rows * 102,
      borderRadius: 32,
      background: 'linear-gradient(180deg, rgba(30,26,20,0.92), rgba(11,10,9,0.94))',
      boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.35), 0 50px 100px rgba(0,0,0,0.65)',
      overflow: 'hidden',
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '24px 34px 18px', borderBottom: '1px solid rgba(212,175,55,0.22)'}}>
      <Img src={LOGO} style={{width: 150, height: (150 * 84) / 294}} />
      <div style={caps(22, {color: C.ivory, marginLeft: 8})}>Sell to us</div>
      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
        <LiveDot frame={frame} />
        <span style={caps(16, {color: '#f0d27a', letterSpacing: '0.3em'})}>Live</span>
      </div>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 150px 200px', padding: '16px 34px 6px', ...caps(14, {color: C.mute, letterSpacing: '0.24em'})}}>
      <span>Product</span>
      <span>Spread vs spot</span>
      <span style={{textAlign: 'right'}}>Buy-back price</span>
    </div>
    {ROWS.slice(0, rows).map((row, i) => {
      const enter = prog(frame, 10 + i * 6, 34, EASE.out);
      const sweep = prog(frame, refreshAt + i * 7, 16);
      const flash = sweep * (1 - prog(frame, refreshAt + i * 7 + 16, 24));
      const checked = checks ? prog(frame, checks[i] ?? 1e6, 14, EASE.out) : 0;
      return (
        <div
          key={row.name}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 150px 200px',
            alignItems: 'center',
            margin: '0 20px',
            padding: '12px 14px',
            height: 102,
            boxSizing: 'border-box',
            borderBottom: '1px solid rgba(255,240,210,0.06)',
            borderRadius: 18,
            background: checked > 0 ? `rgba(212,175,55,${0.1 * checked})` : undefined,
            boxShadow: checked > 0 ? `inset 0 0 0 1.5px rgba(212,175,55,${0.55 * checked})` : undefined,
            opacity: enter,
            translate: `0 ${(1 - enter) * 30}px`,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{position: 'relative', width: 74, height: 74, borderRadius: 14, background: 'rgba(255,255,255,0.04)', flexShrink: 0}}>
              <Img src={art(row.src)} style={{width: 74, height: 74, objectFit: row.fit}} />
              {checks ? (
                <svg width={34} height={34} viewBox="0 0 34 34" style={{position: 'absolute', right: -10, top: -10, opacity: checked, scale: String(mix(0.5, 1, checked))}}>
                  <circle cx={17} cy={17} r={15} fill="#d4af37" />
                  <path d="M10 17 L15 22 L24 12" fill="none" stroke="#1a1206" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - checked} />
                </svg>
              ) : null}
            </div>
            <div>
              <div style={{fontFamily: SANS, fontSize: 22, fontWeight: 600, color: C.ivory, lineHeight: 1.2}}>{row.name}</div>
              <div style={{...caps(13, {color: C.mute, letterSpacing: '0.2em'}), marginTop: 6}}>{row.sub}</div>
            </div>
          </div>
          <div>
            <Shimmer frame={frame} w={92} phase={i + 3} flash={flash} />
          </div>
          <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8}}>
            <Shimmer frame={frame} w={150} phase={i} flash={flash} />
            <span style={{...caps(12, {color: '#f0d27a', letterSpacing: '0.24em'}), opacity: flash > 0.02 ? 1 : 0.45}}>{flash > 0.02 ? '↻ Updated' : 'Live'}</span>
          </div>
        </div>
      );
    })}
  </div>
);

const Prices: React.FC<SceneProps> = ({frame, cue}) => {
  const published = cue('published');
  const update = cue('update');
  const enter = prog(frame, 0, 40, EASE.out);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('buyback') - 8}>
          <div style={serif(112)}>Buyback prices,</div>
        </Rise>
        <Rise frame={frame} at={published - 6}>
          <div style={italic(130, {lineHeight: 1.06})}>
            <Metal frame={frame} sheenAt={cue('online')}>
              published online.
            </Metal>
          </div>
        </Rise>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: enter, translate: `0 ${(1 - enter) * 60}px`}}>
        <BuybackPanel frame={frame} refreshAt={update - 4} />
      </div>
      <div style={{position: 'absolute', top: 1376, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={update - 6} color={C.mute}>
          Updated with the market
        </Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

// ——— Lock: select, lock in, any time ———

const Dial: React.FC<{frame: number; at: number; dayAt: number; nightAt: number}> = ({frame, at, dayAt, nightAt}) => {
  const p = prog(frame, at - 6, 34, EASE.out);
  const turn = prog(frame, dayAt - 10, nightAt - dayAt + 30, EASE.inOut);
  const angle = mix(-150, 150, turn);
  const R = 250;
  const sunA = ((angle - 90) * Math.PI) / 180;
  const moonA = ((angle + 90) * Math.PI) / 180;
  return (
    <div style={{position: 'absolute', left: 540 - R - 30, top: 760, width: (R + 30) * 2, height: (R + 30) * 2, opacity: p, scale: String(mix(0.86, 1, p))}}>
      <svg width={(R + 30) * 2} height={(R + 30) * 2} viewBox={`${-R - 30} ${-R - 30} ${(R + 30) * 2} ${(R + 30) * 2}`} style={{overflow: 'visible'}}>
        <defs>
          <radialGradient id="dial-sky" cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor={turn < 0.5 ? '#3a2a12' : '#0f1626'} />
            <stop offset="1" stopColor="#07080b" />
          </radialGradient>
        </defs>
        <circle r={R} fill="url(#dial-sky)" stroke="rgba(212,175,55,0.45)" strokeWidth={2} />
        {Array.from({length: 24}, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const long = i % 6 === 0;
          return (
            <line key={i} x1={Math.cos(a) * (R - 8)} y1={Math.sin(a) * (R - 8)} x2={Math.cos(a) * (R - (long ? 34 : 20))} y2={Math.sin(a) * (R - (long ? 34 : 20))} stroke="#e2c46c" strokeOpacity={long ? 0.75 : 0.35} strokeWidth={long ? 2.5 : 1.5} />
          );
        })}
        <circle r={R + 18} fill="none" stroke="#e2c46c" strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - turn} transform="rotate(-90)" style={{filter: 'drop-shadow(0 0 8px rgba(226,196,108,0.8))'}} />
        {/* Sun */}
        <g transform={`translate(${Math.cos(sunA) * (R - 80)} ${Math.sin(sunA) * (R - 80)})`} opacity={1 - turn * 0.8}>
          <circle r={26} fill="#f6d77a" />
          {Array.from({length: 10}, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 34} y1={Math.sin(a) * 34} x2={Math.cos(a) * 46} y2={Math.sin(a) * 46} stroke="#f6d77a" strokeWidth={3} strokeLinecap="round" />;
          })}
        </g>
        {/* Moon */}
        <g transform={`translate(${Math.cos(moonA) * (R - 80)} ${Math.sin(moonA) * (R - 80)})`} opacity={0.3 + turn * 0.7}>
          <path d="M8 -26 A28 28 0 1 0 8 26 A21 21 0 1 1 8 -26 Z" fill="#dfe6f0" />
        </g>
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={italic(150, {lineHeight: 1})}>
          <Metal frame={frame} sheenAt={nightAt}>
            24/7
          </Metal>
        </div>
        <div style={{...caps(18, {color: C.mute}), marginTop: 10}}>Online</div>
      </div>
    </div>
  );
};

const Lock: React.FC<SceneProps> = ({frame, cue}) => {
  const pick = cue('Pick');
  const products = cue('products');
  const lock = cue('lock');
  const anytime = cue('anytime');
  const toDial = prog(frame, anytime - 20, 30, EASE.inOut);
  const press = prog(frame, lock, 6) * (1 - prog(frame, lock + 8, 14));
  const locked = prog(frame, lock + 4, 16, EASE.out);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 596, left: 0, right: 0, opacity: 1 - prog(frame, anytime - 24, 16)}}>
        <Eyebrow frame={frame} at={pick - 8}>
          Pick your products
        </Eyebrow>
      </div>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={lock - 8}>
          <div style={serif(118)}>Lock in</div>
        </Rise>
        <Rise frame={frame} at={cue('price') - 6}>
          <div style={italic(150, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={cue('price') + 20}>
              your price.
            </Metal>
          </div>
        </Rise>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - toDial, scale: String(mix(1, 0.92, toDial)), filter: toDial > 0 ? `blur(${toDial * 8}px)` : undefined}}>
        <div style={{position: 'absolute', inset: 0, opacity: prog(frame, 0, 24)}}>
          <BuybackPanel frame={frame} refreshAt={-1000} checks={[pick, products, products + 10]} rows={4} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 200,
            right: 200,
            top: 1228,
            height: 92,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            background: locked > 0.5 ? 'linear-gradient(180deg, #f6e3a1, #d4af37)' : 'linear-gradient(180deg, #e2c46c, #a8842c)',
            boxShadow: `0 0 ${24 + press * 50}px rgba(212,175,55,${0.35 + press * 0.4}), 0 20px 40px rgba(0,0,0,0.5)`,
            scale: String(1 - press * 0.05),
            opacity: prog(frame, products, 24),
            ...caps(30, {color: '#1a1206', letterSpacing: '0.16em'}),
          }}
        >
          <svg width={32} height={40} viewBox="0 0 32 40">
            <rect x={3} y={17} width={26} height={21} rx={4} fill="#1a1206" />
            <path d={`M9 17 V11 a7 7 0 0 1 14 0 V${mix(7, 17, locked)}`} fill="none" stroke="#1a1206" strokeWidth={3.6} transform={`translate(0 ${-(1 - locked) * 4})`} />
          </svg>
          {locked > 0.5 ? 'Price locked' : 'Lock in price'}
        </div>
      </div>
      <div style={{opacity: toDial}}>
        <Dial frame={frame} at={anytime} dayAt={cue('day')} nightAt={cue('night')} />
        <div style={{position: 'absolute', top: 1340, left: 0, right: 0}}>
          <Eyebrow frame={frame} at={cue('day') - 4} color={C.mute}>
            Any time · day or night
          </Eyebrow>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ——— Ship: the label we provide ———

const Barcode: React.FC<{w: number; h: number}> = ({w, h}) => (
  <svg width={w} height={h}>
    {Array.from({length: 46}, (_, i) => {
      const x = (i / 46) * w;
      const bw = [1.5, 3, 1, 4, 2][(i * 7) % 5];
      return <rect key={i} x={x} y={0} width={bw} height={h} fill="#1b1b1b" />;
    })}
  </svg>
);

const Ship: React.FC<SceneProps> = ({frame, cue, duration}) => {
  const label = cue('label');
  const boxIn = prog(frame, 0, 34, EASE.out);
  const slap = prog(frame, label - 10, 16, EASE.out);
  const away = prog(frame, duration - 34, 30, EASE.in);
  const BW = 560;
  const BH = 330;
  const bx = 540 - BW / 2 + away * 900;
  const by = 900;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('ship') - 8}>
          <div style={serif(124)}>Ship it to us</div>
        </Rise>
        <Rise frame={frame} at={label - 6}>
          <div style={italic(122, {lineHeight: 1.06})}>
            <Metal frame={frame} sheenAt={cue('provide')}>
              with our label.
            </Metal>
          </div>
        </Rise>
      </div>
      <Pool x={540} y={1110} w={1000} h={600} opacity={prog(frame, 0, 30)} />
      <div
        style={{
          position: 'absolute',
          left: bx,
          top: by + (1 - boxIn) * 80,
          width: BW,
          height: BH + 80,
          opacity: boxIn,
          filter: away > 0.05 ? `blur(${away * 14}px)` : undefined,
        }}
      >
        <svg width={BW} height={BH + 80} viewBox={`0 0 ${BW} ${BH + 80}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <linearGradient id="box-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a241c" />
              <stop offset="1" stopColor="#15120e" />
            </linearGradient>
            <linearGradient id="box-top" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3a3226" />
              <stop offset="1" stopColor="#262019" />
            </linearGradient>
          </defs>
          <ellipse cx={BW / 2} cy={BH + 70} rx={BW * 0.55} ry={22} fill="rgba(0,0,0,0.6)" style={{filter: 'blur(10px)'}} />
          <path d={`M30 80 L${BW - 80} 80 L${BW - 20} 30 L90 30 Z`} fill="url(#box-top)" />
          <path d={`M${BW - 80} 80 L${BW - 20} 30 L${BW - 20} ${BH} L${BW - 80} ${BH + 50} Z`} fill="#100d0a" />
          <rect x={30} y={80} width={BW - 110} height={BH - 30} fill="url(#box-front)" />
          {/* Tape */}
          <path d={`M${(BW - 80) / 2 + 10} 80 L${(BW - 80) / 2 + 70} 30 L${(BW - 80) / 2 + 110} 30 L${(BW - 80) / 2 + 50} 80 Z`} fill="rgba(212,175,55,0.55)" />
          <rect x={(BW - 80) / 2 + 10} y={80} width={40} height={BH - 30} fill="rgba(212,175,55,0.45)" />
          <path d={`M30 80 L${BW - 80} 80`} stroke="rgba(255,240,210,0.18)" strokeWidth={2} />
        </svg>
        {/* The label */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 112,
            width: 290,
            height: 220,
            background: '#f5f2ea',
            borderRadius: 6,
            boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
            padding: '14px 16px',
            boxSizing: 'border-box',
            opacity: slap,
            transform: `translate(${(1 - slap) * 260}px, ${(1 - slap) * -120}px) rotate(${mix(14, -2, slap)}deg) scale(${mix(1.25, 1, slap)})`,
            fontFamily: SANS,
            color: '#1b1b1b',
          }}
        >
          <div style={{fontSize: 13, fontWeight: 700, letterSpacing: '0.16em'}}>PREPAID SHIPPING LABEL</div>
          <div style={{height: 2, background: '#1b1b1b', margin: '8px 0'}} />
          <div style={{fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#555'}}>SHIP TO</div>
          <div style={{fontSize: 15, fontWeight: 700, marginTop: 2}}>BULLION TRADING LLC</div>
          <div style={{fontSize: 12, fontWeight: 500, marginTop: 2}}>20 W 47TH ST · NEW YORK, NY</div>
          <div style={{marginTop: 12}}>
            <Barcode w={258} h={52} />
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1340, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={cue('provide') - 6} color={C.mute}>
          Mailing instructions by email
        </Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

// ——— Pay: inspected, approved, paid ———

const Seal: React.FC<{frame: number; at: number}> = ({frame, at}) => {
  const p = prog(frame, at - 4, 14, EASE.out);
  const R = 150;
  const text = 'BULLION TRADING · INSPECTED · ';
  return (
    <div style={{position: 'absolute', left: 540 - R, top: 905, width: R * 2, height: R * 2, opacity: p, scale: String(mix(1.6, 1, p)), rotate: `${mix(-24, -8, p)}deg`}}>
      <svg width={R * 2} height={R * 2} viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} style={{overflow: 'visible', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.6))'}}>
        <defs>
          <radialGradient id="seal" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#f6e3a1" />
            <stop offset="0.55" stopColor="#d4af37" />
            <stop offset="1" stopColor="#7a5a16" />
          </radialGradient>
          <path id="seal-ring" d={`M0 ${-R + 30} A${R - 30} ${R - 30} 0 1 1 -0.1 ${-R + 30}`} />
        </defs>
        <circle r={R} fill="url(#seal)" />
        <circle r={R - 12} fill="none" stroke="rgba(60,40,5,0.55)" strokeWidth={2} />
        <circle r={R - 54} fill="none" stroke="rgba(60,40,5,0.55)" strokeWidth={2} />
        <text fill="#4a3610" fontFamily={SANS} fontWeight={700} fontSize={19} letterSpacing={4}>
          <textPath href="#seal-ring">{text + text}</textPath>
        </text>
        <text y={12} textAnchor="middle" fill="#3a2a0a" fontFamily={SANS} fontWeight={700} fontSize={30} letterSpacing={4}>
          APPROVED
        </text>
      </svg>
    </div>
  );
};

const Pay: React.FC<SceneProps> = ({frame, cue}) => {
  const inspection = cue('inspection');
  const approval = cue('approval');
  const paid = cue('paid');
  const one = cue('one');
  const three = cue('three');
  const days = cue('days');
  const scan = prog(frame, inspection - 6, 60, EASE.inOut);
  const toPay = prog(frame, paid - 18, 30, EASE.inOut);
  const R = 130;
  const lx = mix(300, 780, scan);
  const ly = 1010 + Math.sin(scan * Math.PI) * -60;
  return (
    <AbsoluteFill>
      <Litany
        frame={frame}
        y={300}
        size={90}
        items={[
          {text: 'Inspected.', at: inspection - 6},
          {text: 'Approved.', at: approval - 6},
          {text: 'Paid.', at: paid - 6},
        ]}
      />
      {/* Inspection and approval */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - toPay, translate: `0 ${-toPay * 40}px`, filter: toPay > 0 ? `blur(${toPay * 10}px)` : undefined}}>
        <Pool x={540} y={1060} w={1000} h={620} opacity={prog(frame, 0, 30)} />
        <Product src="bar-justice-obv.png" frame={frame} w={460} h={372} x={420} y={1010} rotate={-5} opacity={prog(frame, 0, 30)} float={4} sheen={[approval + 6]} />
        <Coin src="coin-silver-eagle.png" frame={frame} metal="silver" d={220} x={750} y={1080} turn={-10} opacity={prog(frame, 6, 30)} sheen={[approval + 12]} />
        {scan > 0 && scan < 1 ? (
          <div style={{position: 'absolute', left: lx - R, top: ly - R, width: R * 2, height: R * 2}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.3), rgba(255,255,255,0.04) 45%, rgba(255,255,255,0) 70%)', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)'}} />
            <svg width={R * 2 + 40} height={R * 2 + 40} style={{position: 'absolute', left: -20, top: -20, overflow: 'visible', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.7))'}}>
              <circle cx={R + 20} cy={R + 20} r={R + 8} fill="none" stroke="#18181a" strokeWidth={22} />
              <circle cx={R + 20} cy={R + 20} r={R - 2} fill="none" stroke="#f0d27a" strokeWidth={2.5} />
              <circle cx={R + 20} cy={R + 20} r={R + 19} fill="none" stroke="#b8902f" strokeWidth={1.5} />
            </svg>
          </div>
        ) : null}
        <Seal frame={frame} at={approval} />
      </div>
      {/* Paid in 1–3 business days */}
      <div style={{position: 'absolute', inset: 0, opacity: toPay}}>
        <div style={{position: 'absolute', top: 700, left: 0, right: 0, textAlign: 'center'}}>
          <div style={serif(250, {lineHeight: 1})}>
            <Metal frame={frame} sheenAt={three + 8} glow="rgba(212,175,55,0.35)">
              1–3
            </Metal>
          </div>
          <div style={{...caps(30), marginTop: 6}}>Business days</div>
        </div>
        <svg width={1080} height={200} style={{position: 'absolute', left: 0, top: 1100, overflow: 'visible'}}>
          <line x1={240} x2={840} y1={80} y2={80} stroke="rgba(212,175,55,0.25)" strokeWidth={2} />
          <line x1={240} x2={mix(240, 840, prog(frame, one - 4, three - one + 20, EASE.inOut))} y1={80} y2={80} stroke="#e2c46c" strokeWidth={3} style={{filter: 'drop-shadow(0 0 8px rgba(226,196,108,0.8))'}} />
          {[
            {x: 240, at: one, label: 'Day 1'},
            {x: 540, at: cue('to'), label: 'Day 2'},
            {x: 840, at: three, label: 'Day 3'},
          ].map((n) => {
            const on = prog(frame, n.at - 4, 14, EASE.out);
            return (
              <g key={n.label}>
                <circle cx={n.x} cy={80} r={mix(10, 18, on)} fill={on > 0.5 ? '#e2c46c' : '#2a2418'} stroke="#e2c46c" strokeWidth={2} />
                <text x={n.x} y={136} textAnchor="middle" fill={on > 0.5 ? '#f4eedf' : 'rgba(244,238,223,0.4)'} fontFamily={SANS} fontSize={20} fontWeight={600} letterSpacing={4}>
                  {n.label.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', top: 1290, left: 0, right: 0}}>
          <Eyebrow frame={frame} at={days - 6} color={C.mute}>
            After items are authenticated
          </Eyebrow>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    lead="Sell it to"
    leadWord="Sell"
    eyebrow="Bullion Trading buyback desk"
    footer="Sell online · 20 W 47th St, New York"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product src="bar-justice-rev.png" frame={frame} w={540} h={437} x={500} y={mix(960, 900, p)} opacity={p} float={6} sheen={[50]} glow="rgba(214,168,74,0.25)" />
          <Coin src="coin-gold-eagle.png" frame={frame} d={230} x={mix(880, 800, p)} y={1040} turn={mix(-90, -16, prog(frame, 8, 60))} roll={-6} opacity={prog(frame, 8, 30)} sheen={[70]} />
        </>
      );
    }}
  />
);

export const SELL_SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  prices: Prices,
  lock: Lock,
  ship: Ship,
  pay: Pay,
  cta: Cta,
};
