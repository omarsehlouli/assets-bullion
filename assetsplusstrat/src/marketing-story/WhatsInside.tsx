import {Audio} from '@remotion/media';
import type React from 'react';
import {AbsoluteFill, getStaticFiles, Img, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import schedule from '../../public/marketing/story/schedule.json';
import {Finish} from '../marketing-premium/kit/Atmosphere';
import {EASE, LOGO, makeCue, mix, prog, SANS, type SceneProps, type VideoSchedule} from '../marketing-premium/kit/theme';
import {
  Backdrop,
  BAR_GOLD,
  BarGlyph,
  BarTag,
  Check,
  count,
  Glow,
  GoldBar,
  Headline,
  jolt,
  K,
  KeyCap,
  Kicker,
  money,
  mono,
  PAID,
  Paper,
  rgba,
  sans,
  SERIAL,
  SourceLine,
  Stamp,
  StoryCaptions,
  StoryShell,
  TAG,
  Watermark,
} from './kit';
import {Who} from './WhatsInside-who';

// "What's inside?" — the Blurr data-law reel (references/story-reel) retold for
// Bullion Trading: one bargain bar bought online, the checks it passes, the
// tungsten inside, who pays, a real 2012 Diamond District case, deals like it
// every day, and the same bar replayed at Bullion Trading's counter.

const DATA = schedule['whats-inside'] as VideoSchedule;
const SPOT = 4165;

// 1 · This October, gold is above $4,000 an ounce; tungsten weighs the same.
const Spot: React.FC<SceneProps> = ({frame, cue}) => {
  const gold = cue('gold');
  const above = cue('4000');
  const and = cue('And');
  const cheap = cue('cheap');
  const weighs = cue('weighs');
  const same = cue('same');
  const tungsten = cue('Tungsten');
  // Live from the first frame: a nervous tick under $4,000, then the climb through it on "above".
  const live = frame < gold ? count(frame, 0, gold, 3874, 3986, (t) => t) + Math.round((random(`p${Math.floor(frame / 5)}`) - 0.5) * 6) : count(frame, gold, above + 30 - gold, 3986, SPOT);
  const price = Math.round(live);
  const fill = price / 5000;
  const tiles = prog(frame, and - 6, 20);
  // The price card opens as the hero, then rises to make room for the two metals.
  const up = prog(frame, and - 18, 28, EASE.inOut);
  const tilt = frame < weighs ? 9 : 9 * Math.exp(-(frame - weighs) / 38) * Math.cos((frame - weighs) / 7);
  const reveal = prog(frame, tungsten - 4, 14);
  const tile = (left: number, sym: string, name: string, z: number, density: number, metal: boolean, at: number) => {
    const p = prog(frame, at, 18);
    return (
      <div
        style={{
          position: 'absolute',
          left,
          top: 810,
          width: 452,
          height: 330,
          borderRadius: 24,
          background: K.panel,
          boxShadow: `inset 0 0 0 1px ${metal ? rgba(K.gold, 0.4) : rgba(K.steel, 0.25 + 0.4 * reveal)}, 0 30px 60px rgba(0,0,0,0.5)`,
          padding: '28px 32px',
          boxSizing: 'border-box',
          opacity: p,
          translate: `0 ${(1 - p) * 30}px`,
        }}
      >
        <div style={mono(18, {color: K.mute})}>{metal || reveal > 0.5 ? `Element ${z}` : 'Element ??'}</div>
        <div
          style={sans(132, {
            fontWeight: 700,
            marginTop: 6,
            ...(metal
              ? {backgroundImage: BAR_GOLD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent'}
              : {color: reveal > 0.5 ? '#c3cad2' : K.faint}),
          })}
        >
          {metal || reveal > 0.5 ? sym : '?'}
        </div>
        <div style={sans(36, {color: metal ? K.text : reveal > 0.5 ? '#c3cad2' : K.mute, marginTop: 4})}>
          {metal ? name : reveal > 0.5 ? name : 'Cheap metal'}
        </div>
        <div style={{...mono(26, {color: K.text, letterSpacing: '0.04em'}), marginTop: 18}}>
          {count(frame, weighs, 50, 0, density).toFixed(2)} <span style={{color: K.mute, fontSize: 18, textTransform: 'none'}}>g/cm³</span>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <Glow color={K.gold} amount={(0.45 + 0.35 * prog(frame, gold, 40)) * (1 - 0.6 * tiles)} y={mix(48, 28, up)} />
      <Glow color={K.steel} amount={0.5 * reveal} y={58} />
      <Kicker frame={frame} at={6} color={K.gold}>
        Spot gold · New York · Live
      </Kicker>
      <div
        style={{
          position: 'absolute',
          left: 64,
          top: 220,
          width: 952,
          height: 530,
          borderRadius: 28,
          background: K.panel,
          boxShadow: `inset 0 0 0 1px ${K.edge}, 0 40px 80px rgba(0,0,0,0.55)`,
          padding: '38px 44px',
          boxSizing: 'border-box',
          opacity: prog(frame, 0, 12),
          translate: `0 ${mix(330, 0, up)}px`,
          scale: String(mix(1.06, 1, up)),
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={mono(20, {color: K.mute})}>XAU / USD · per troy oz</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, ...mono(18, {color: K.gold})}}>
            <div style={{width: 10, height: 10, borderRadius: '50%', background: K.gold, opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 18))}} />
            Live
          </div>
        </div>
        <div style={{...mono(64, {color: K.text, letterSpacing: '0.04em', fontWeight: 700}), marginTop: 30, opacity: prog(frame, 2, 12)}}>
          10.2026
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 8, opacity: prog(frame, 2, 12)}}>
          <div
            style={sans(150, {
              fontWeight: 700,
              backgroundImage: BAR_GOLD,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 24px ${rgba(K.gold, 0.35)})`,
            })}
          >
            {money(price)}
          </div>
          <div style={sans(44, {color: K.mute})}>/ oz</div>
        </div>
        {/* Price gauge: $0 → $5,000, with the $4,000 line the price crosses on "above". */}
        <div style={{position: 'relative', marginTop: 30, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.07)', opacity: prog(frame, 4, 16)}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, borderRadius: 7, background: 'linear-gradient(90deg,#8a6a1f,#f6e3a1)'}} />
          <div style={{position: 'absolute', left: '80%', top: -14, bottom: -14, width: 2, background: K.text, opacity: 0.6}} />
          <div style={{position: 'absolute', left: '80%', top: 26, translate: '-50% 0', ...mono(16, {color: K.mute})}}>$4,000</div>
        </div>
        <Stamp frame={frame} at={above + 8} color={K.gold} size={30} rotate={-7} style={{right: 40, top: 150}}>
          Above $4,000
        </Stamp>
      </div>
      {tile(64, 'Au', 'Gold', 79, 19.32, true, and - 6)}
      {tile(564, 'W', 'Tungsten', 74, 19.25, false, cheap - 6)}
      {/* Balance beam: tips, then settles level on "exactly the same". */}
      <div style={{position: 'absolute', left: 140, top: 1210, width: 800, height: 120, opacity: prog(frame, weighs - 10, 16)}}>
        <div style={{position: 'absolute', left: 392, top: 30, width: 16, height: 80, background: 'linear-gradient(180deg,#5a616a,#2c3137)', borderRadius: 4}} />
        <div style={{position: 'absolute', left: 340, top: 104, width: 120, height: 10, borderRadius: 5, background: '#3a4047'}} />
        <div style={{position: 'absolute', left: 0, top: 24, width: 800, height: 8, borderRadius: 4, background: 'linear-gradient(90deg,#d4af37,#9aa3ad)', rotate: `${tilt}deg`}} />
      </div>
      <Stamp frame={frame} at={same} color="#c3cad2" size={28} rotate={4} style={{left: 370, top: 1168}}>
        ≈ Same weight
      </Stamp>
    </AbsoluteFill>
  );
};

// 2 · Now picture this: a bargain listing that ticks every box.
const Picture: React.FC<SceneProps> = ({frame, cue}) => {
  const find = cue('find');
  const bar = cue('bar');
  const online = cue('online');
  const under = cue('200');
  const sealed = cue('Sealed');
  const serial = cue('serial');
  const five = cue('five');
  const buy = cue('buy');
  const win = prog(frame, 4, 22);
  const badge = (at: number, children: React.ReactNode) => {
    const p = prog(frame, at - 2, 14);
    return (
      <div
        style={{
          padding: '12px 20px',
          borderRadius: 999,
          border: `2px solid ${K.teal}`,
          background: rgba(K.teal, 0.1),
          opacity: p,
          scale: String(mix(1.4, 1, p)),
          ...mono(20, {color: K.teal, letterSpacing: '0.12em', fontWeight: 700}),
        }}
      >
        {children}
      </div>
    );
  };
  const stars = Math.max(0, Math.min(5, (frame - five) / 5));
  const placed = prog(frame, buy + 10, 14);
  return (
    <AbsoluteFill>
      <Glow color={K.teal} amount={0.35 * win} y={40} />
      <Kicker frame={frame} at={8} color={K.teal}>
        Now picture this · Online
      </Kicker>
      <div
        style={{
          position: 'absolute',
          left: 64,
          top: 220,
          width: 952,
          height: 930,
          borderRadius: 30,
          background: K.panel,
          boxShadow: `inset 0 0 0 1px ${K.edge}, 0 40px 90px rgba(0,0,0,0.6)`,
          opacity: win * (1 - 0.45 * placed),
          translate: `0 ${(1 - win) * 30}px`,
          overflow: 'hidden',
        }}
      >
        <div style={{height: 70, display: 'flex', alignItems: 'center', gap: 12, padding: '0 30px', borderBottom: `1px solid ${K.edge}`}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{width: 16, height: 16, borderRadius: '50%', background: c, opacity: 0.8}} />
          ))}
          <div style={mono(17, {color: K.mute, marginLeft: 16})}>marketplace · listing #88213</div>
          <div style={mono(14, {color: K.faint, marginLeft: 'auto'})}>Fictional example</div>
        </div>
        {/* Photo */}
        <div
          style={{
            position: 'absolute',
            left: 34,
            top: 104,
            width: 380,
            height: 520,
            borderRadius: 22,
            background: 'radial-gradient(ellipse at 50% 40%, #24252b, #0d0e11 75%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(100deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0) 70%)',
              backgroundSize: '250% 100%',
              backgroundPosition: `${100 - ((frame * 1.6) % 200)}% 0`,
              opacity: 1 - prog(frame, bar - 10, 14),
            }}
          />
          <div style={{opacity: prog(frame, bar - 10, 18), scale: String(mix(0.9, 1, prog(frame, bar - 10, 24))), rotate: '-4deg'}}>
            <GoldBar frame={frame} w={210} sheenAt={bar + 6} />
          </div>
        </div>
        {/* Loading skeleton while the page "loads" under "Now picture this." */}
        <div style={{position: 'absolute', left: 450, top: 118, right: 34, display: 'flex', flexDirection: 'column', gap: 26, opacity: 1 - prog(frame, find - 6, 12)}}>
          {[300, 220, 380, 160].map((w, i) => (
            <div
              key={i}
              style={{
                width: w,
                height: i === 2 ? 84 : 30,
                borderRadius: 10,
                background: `linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,${0.1 + 0.06 * Math.sin(frame / 9 - i)}), rgba(255,255,255,0.05))`,
              }}
            />
          ))}
        </div>
        {/* Details */}
        <div style={{position: 'absolute', left: 450, top: 110, right: 34}}>
          <div style={{opacity: prog(frame, find, 16)}}>
            <div style={sans(44)}>1 oz Fine Gold Bar</div>
            <div style={{...mono(17, {color: K.mute}), marginTop: 12}}>999.9 · Sealed in assay</div>
          </div>
          <div style={{marginTop: 46, opacity: prog(frame, online - 4, 14)}}>
            <div style={sans(104, {fontWeight: 700})}>{money(PAID)}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 12}}>
              <div style={{position: 'relative', ...mono(20, {color: K.mute})}}>
                Spot {money(SPOT)}
                <div
                  style={{
                    position: 'absolute',
                    left: -4,
                    top: '50%',
                    height: 2,
                    width: `${prog(frame, cue('under'), 12) * 104}%`,
                    background: K.mute,
                  }}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 26,
              display: 'inline-block',
              padding: '12px 18px',
              borderRadius: 12,
              background: K.teal,
              opacity: prog(frame, under - 2, 12),
              scale: String(mix(1.3, 1, prog(frame, under - 2, 12))),
              ...mono(22, {color: '#062421', fontWeight: 700, letterSpacing: '0.08em'}),
            }}
          >
            −$200 under spot
          </div>
          <div style={{marginTop: 46, display: 'flex', alignItems: 'center', gap: 18, opacity: prog(frame, five - 6, 14)}}>
            <div style={{width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(140deg,#3a3f47,#1d2025)', boxShadow: `inset 0 0 0 1px ${K.edge}`}} />
            <div>
              <div style={sans(30)}>gold_deals_ny</div>
              <div style={{...mono(17, {color: K.mute}), marginTop: 6}}>Top seller · 1,204 sales</div>
            </div>
          </div>
        </div>
        {/* Trust badges */}
        <div style={{position: 'absolute', left: 34, right: 34, top: 660, display: 'flex', flexWrap: 'wrap', gap: 16}}>
          {badge(sealed, '✓ Sealed')}
          {badge(serial, `✓ Serial ${SERIAL}`)}
          {badge(
            five,
            <span>
              {'★★★★★'.split('').map((s, i) => (
                <span key={i} style={{opacity: stars > i ? 1 : 0.25}}>
                  {s}
                </span>
              ))}{' '}
              4.9
            </span>,
          )}
        </div>
        <div style={{position: 'absolute', left: 34, top: 800, ...mono(17, {color: K.mute}), opacity: prog(frame, five + 20, 16)}}>
          Free shipping · Ships in 1 day
        </div>
      </div>
      <KeyCap frame={frame} at={buy} x={590} y={1222} w={426} h={120} color={`linear-gradient(180deg,${K.teal},#2fae9f)`}>
        <span style={{color: '#062421', fontWeight: 700}}>Buy now</span>
      </KeyCap>
      <div style={{position: 'absolute', left: 590, width: 426, top: 1360, textAlign: 'center', opacity: placed, ...mono(17, {color: K.teal})}}>
        Order placed · {money(PAID, true)}
      </div>
    </AbsoluteFill>
  );
};

// A horseshoe magnet drawn from two thick borders and steel tips.
const Magnet: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'absolute', width: 150, height: 170, ...style}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '75px 75px 0 0', border: `38px solid ${K.red}`, borderBottom: 'none', boxShadow: 'inset 0 6px 0 rgba(255,255,255,0.2)'}} />
    <div style={{position: 'absolute', left: 0, bottom: -36, width: 38, height: 36, background: '#c9d0d8'}} />
    <div style={{position: 'absolute', right: 0, bottom: -36, width: 38, height: 36, background: '#c9d0d8'}} />
  </div>
);

// 3 · It arrives; it weighs right, the magnet slides off, and the scan finds tungsten.
const Arrives: React.FC<SceneProps> = ({frame, cue}) => {
  const arrives = cue('arrives');
  const weight = cue('weight');
  const out = cue('out');
  const magnet = cue('magnet');
  const stick = cue('stick');
  const under = cue('under');
  const skin = cue('skin');
  const tungsten = cue('tungsten');
  const box = prog(frame, 0, 26);
  const open = prog(frame, arrives, 18);
  const lift = prog(frame, arrives + 6, 40, EASE.inOut);
  const boxGone = prog(frame, arrives + 40, 24, EASE.in);
  const grams = count(frame, weight - 4, 34, 0, 31.1) + (frame > weight + 30 && frame < weight + 46 ? (random(`g${frame}`) - 0.5) * 0.04 : 0);
  const approach = prog(frame, magnet - 18, 20, EASE.out);
  const fall = prog(frame, stick - 4, 30, EASE.in);
  const cut = prog(frame, under, tungsten - under + 4, EASE.inOut);
  const red = prog(frame, tungsten, 10) * (1 - 0.5 * prog(frame, tungsten + 20, 40));
  const barY = mix(900, 650, lift);
  return (
    <AbsoluteFill style={{translate: jolt(frame, tungsten)}}>
      <Glow color={K.teal} amount={0.3 * (1 - red)} y={50} />
      <Glow color={K.red} amount={1.3 * red} y={50} size={90} />
      <Kicker frame={frame} at={6} color={K.teal}>
        Delivered · Order #88213
      </Kicker>
      <div style={{position: 'absolute', left: 64, top: 196, opacity: prog(frame, weight - 12, 12)}}>
        <div style={mono(132, {fontWeight: 700, color: K.text, letterSpacing: '0.02em'})}>
          {grams.toFixed(2)}
          <span style={{fontSize: 52, color: K.mute, textTransform: 'none'}}> g</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 64, top: 380, display: 'flex', flexDirection: 'column', gap: 16}}>
        <Check frame={frame} at={out} label="Weight" value="31.10 g = 1 oz" />
        <Check frame={frame} at={stick + 6} label="Magnet" value="NO PULL" />
      </div>
      {/* Precision scale */}
      <div style={{position: 'absolute', left: 290, top: 1138, width: 500, height: 90, opacity: prog(frame, arrives + 20, 20)}}>
        <div style={{position: 'absolute', left: 40, right: 40, top: 0, height: 16, borderRadius: 8, background: 'linear-gradient(180deg,#5a616a,#2c3137)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 22, height: 64, borderRadius: 14, background: 'linear-gradient(180deg,#24262c,#131418)', boxShadow: `inset 0 0 0 1px ${K.edge}`}}>
          <div style={{position: 'absolute', right: 26, top: 14, width: 150, height: 36, borderRadius: 6, background: '#0b1714', ...mono(20, {color: K.teal, letterSpacing: '0.06em', textTransform: 'none'}), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {grams.toFixed(2)} g
          </div>
          <div style={{position: 'absolute', left: 26, top: 22, ...mono(14, {color: K.mute})}}>Precision scale</div>
        </div>
      </div>
      {/* The bar, rising out of the parcel onto the scale */}
      <div style={{position: 'absolute', left: 390, top: barY, opacity: prog(frame, arrives, 10)}}>
        <GoldBar frame={frame} w={300} cut={cut} core="tungsten" sheenAt={out} />
        <div style={{position: 'absolute', left: 318, top: 44, opacity: prog(frame, skin - 6, 14) * (1 - prog(frame, tungsten + 30, 20)), display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 46, height: 3, background: K.goldLight}} />
          <div style={mono(24, {color: K.goldLight, fontWeight: 700})}>Thin gold skin</div>
        </div>
      </div>
      {/* Parcel, drawn over the bar so the bar rises out of it */}
      <div
        style={{
          position: 'absolute',
          left: 330,
          top: mix(1500, 860, box) + boxGone * 500,
          width: 420,
          height: 300,
          opacity: 1 - boxGone,
        }}
      >
        <div style={{position: 'absolute', inset: 0, borderRadius: 14, background: 'linear-gradient(170deg,#4a3d2e,#2c241b)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}} />
        <div style={{position: 'absolute', left: 180, width: 60, top: 0, bottom: 0, background: 'rgba(255,255,255,0.08)'}} />
        <div style={{position: 'absolute', left: 24, bottom: 22, ...mono(14, {color: 'rgba(255,255,255,0.45)'})}}>#88213 · Fragile</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: -2, height: 60, borderRadius: 10, background: '#5a4a37', transformOrigin: '50% 0', rotate: `${-open * 70}deg`, translate: `${-open * 120}px ${-open * 40}px`, opacity: 1 - open * 0.6}} />
      </div>
      <Magnet
        style={{
          left: mix(1100, 702, approach) + fall * 60,
          top: 790 + fall * 520,
          rotate: `${fall * 70}deg`,
          opacity: approach * (1 - prog(frame, stick + 20, 14)),
        }}
      />
      <Stamp frame={frame} at={tungsten} color={K.red} size={46} rotate={-10} style={{left: 270, top: 860}}>
        Tungsten core
      </Stamp>
    </AbsoluteFill>
  );
};

const Row: React.FC<{label: string; children: React.ReactNode; opacity?: number}> = ({label, children, opacity = 1}) => (
  <div style={{display: 'flex', alignItems: 'baseline', gap: 24, padding: '14px 0', borderBottom: '1px solid rgba(29,27,23,0.12)', opacity}}>
    <div style={{width: 150, flexShrink: 0, ...mono(15, {color: K.inkMute})}}>{label}</div>
    <div style={sans(30, {color: K.ink, letterSpacing: '-0.01em'})}>{children}</div>
  </div>
);

// 5 · The bill: what you paid, and what it's worth.
const Bill: React.FC<SceneProps> = ({frame, cue}) => {
  const paid = cue('paid');
  const amount = cue('3965');
  const worth = cue('worth');
  const nothing = cue('nothing');
  const slide = prog(frame, 0, 26);
  const total = count(frame, amount, 150, 0, PAID, EASE.inOut);
  const value = count(frame, worth - 4, nothing - worth + 16, PAID, 0, EASE.inOut);
  return (
    <AbsoluteFill>
      <Glow color={K.red} amount={0.3 + 0.6 * prog(frame, worth, 20)} y={60} />
      <Kicker frame={frame} at={6}>
        The bill · Order #88213
      </Kicker>
      <Paper x={110} y={250} w={860} h={940} rotate={-1.5} style={{translate: `0 ${(1 - slide) * 400}px`, opacity: slide}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div style={mono(16, {color: K.inkMute})}>Order receipt · fictional example</div>
          <div style={mono(16, {color: K.inkMute})}>#88213</div>
        </div>
        <div style={{...sans(54, {color: K.ink, fontWeight: 700}), margin: '22px 0 18px'}}>Receipt</div>
        <Row label="Item">1 oz Fine Gold Bar · 999.9</Row>
        <Row label="Serial">{SERIAL}</Row>
        <Row label="Seller">
          <span style={{textDecoration: 'line-through'}}>gold_deals_ny</span> <span style={mono(15, {color: K.red})}>closed</span>
        </Row>
        <Row label="Status">Delivered</Row>
        <div style={{marginTop: 34, opacity: prog(frame, paid - 4, 12)}}>
          <div style={mono(16, {color: K.inkMute})}>Amount paid</div>
          <div style={sans(104, {color: K.ink, fontWeight: 700, marginTop: 6})}>{money(total, true)}</div>
        </div>
        <div style={{marginTop: 20, padding: '20px 26px', borderRadius: 14, background: rgba(K.red, 0.1), boxShadow: `inset 0 0 0 2px ${rgba(K.red, 0.6)}`, opacity: prog(frame, worth - 8, 12)}}>
          <div style={mono(16, {color: K.red})}>What it's worth</div>
          <div style={sans(72, {color: K.red, fontWeight: 700, marginTop: 4})}>{frame >= nothing + 10 ? '≈ $0' : money(Math.round(value))}</div>
        </div>
      </Paper>
      <Stamp frame={frame} at={nothing + 4} color={K.red} size={40} rotate={-9} style={{left: 520, top: 1000}}>
        Loss −{money(PAID)}
      </Stamp>
    </AbsoluteFill>
  );
};

// A New York street-sign blade.
const Blade: React.FC<{text: string; rotate: number; at: number; frame: number; w?: number}> = ({text, rotate, at, frame, w = 520}) => {
  const p = prog(frame, at, 18);
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - w / 2,
        top: 0,
        width: w,
        height: 118,
        rotate: `${rotate}deg`,
        borderRadius: 12,
        background: 'linear-gradient(180deg,#14804a,#0d6239)',
        boxShadow: 'inset 0 0 0 4px #f2f2f2, inset 0 0 0 8px #0d6239, 0 30px 60px rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: p,
        scale: String(mix(0.9, 1, p)),
        ...sans(72, {fontWeight: 700, color: '#f4f4f4', letterSpacing: '0.01em'}),
      }}
    >
      {text}
    </div>
  );
};

// 6 · A real case: Manhattan's Diamond District, 2012 (Fox News, NBC News, Sept. 19, 2012).
const Case: React.FC<SceneProps> = ({frame, cue}) => {
  const and = cue('And');
  const year = cue('2012');
  const jeweler = cue('jeweler');
  const diamond = cue('Diamond');
  const paid = cue('100000');
  const four = cue('four');
  const serial = cue('Serial');
  const paperwork = cue('Paperwork');
  const filled = cue('Filled');
  const tungsten = cue('tungsten');
  const file = prog(frame, jeweler - 14, 26, EASE.out);
  const ok = '#1f7a71';
  return (
    <AbsoluteFill style={{translate: jolt(frame, tungsten, 12)}}>
      <Glow color={K.red} amount={0.25 + 1.0 * prog(frame, tungsten, 12) * (1 - 0.5 * prog(frame, tungsten + 20, 40))} y={50} size={90} />
      <Kicker frame={frame} at={6}>
        True story · New York
      </Kicker>
      <Headline frame={frame} size={64} lines={[{text: "And it isn't just online.", at: and - 4}]} out={jeweler - 10} />
      {/* The corner itself: W 47th St & 5th Ave, then the date. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, opacity: 1 - prog(frame, jeweler, 20, EASE.in), translate: `0 ${-prog(frame, jeweler - 6, 30, EASE.in) * 160}px`}}>
        <div style={{position: 'relative', height: 300}}>
          <div style={{position: 'absolute', left: 535, top: 40, width: 14, height: 460, background: 'linear-gradient(90deg,#3a3f44,#6c737a,#2d3135)', opacity: prog(frame, and - 8, 16)}} />
          <Blade frame={frame} at={and - 6} text="W 47 St" rotate={-3} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 150}}>
            <Blade frame={frame} at={cue('online') - 8} text="5 Av" rotate={2} w={380} />
          </div>
        </div>
        <div style={{textAlign: 'center', marginTop: 40, opacity: prog(frame, cue('online'), 16), ...mono(22, {color: K.mute})}}>
          Diamond District · Manhattan
        </div>
        <div style={{position: 'relative', height: 160, marginTop: 20}}>
          <Stamp frame={frame} at={year} color={K.red} size={56} rotate={-4} style={{left: 310, top: 10}}>
            Sept 2012
          </Stamp>
        </div>
      </div>
      <Paper x={70} y={300} w={940} h={900} rotate={1} style={{translate: `0 ${(1 - file) * 1300}px`, opacity: Math.min(1, file * 3)}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div style={mono(17, {color: K.inkMute})}>Case file · New York</div>
          <div style={mono(17, {color: K.red, fontWeight: 700})}>Sept 2012</div>
        </div>
        <div style={{...sans(66, {color: K.ink, fontWeight: 700}), marginTop: 22}}>A Manhattan jeweler</div>
        <div style={{...mono(18, {color: K.inkMute}), marginTop: 12, opacity: 0.5 + 0.5 * prog(frame, diamond - 8, 14)}}>W 47th St &amp; 5th Ave · Diamond District</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 30, opacity: prog(frame, cue('paid') - 4, 12)}}>
          <div style={mono(17, {color: K.inkMute})}>Paid</div>
          <div style={sans(104, {color: K.ink, fontWeight: 700})}>{money(Math.round(count(frame, paid, 60, 0, 100000)))}</div>
        </div>
        <div style={{position: 'relative', display: 'flex', justifyContent: 'center', gap: 34, marginTop: 30, height: 270}}>
          {[0, 1, 2, 3].map((i) => {
            const p = prog(frame, jeweler + 4 + i * 5, 16);
            const lift = Math.sin(prog(frame, four + i * 7, 14) * Math.PI) * 18;
            return (
              <div key={i} style={{opacity: p, translate: `0 ${(1 - p) * -40 - lift}px`, rotate: `${(i - 1.5) * 2}deg`}}>
                <GoldBar frame={frame} w={150} weight="10 OZ" serial={`AU-${31870 + i * 13}`} sheenAt={four + i * 7} cut={prog(frame, filled + i * 6, 40, EASE.inOut)} />
              </div>
            );
          })}
          <div style={{position: 'absolute', right: 0, top: -26, ...mono(12, {color: K.inkMute})}}>Illustration</div>
        </div>
        <div style={{display: 'flex', gap: 40, marginTop: 40}}>
          <Check frame={frame} at={serial} label="Serial numbers" color={ok} ink={K.ink} size={26} />
          <Check frame={frame} at={paperwork} label="Paperwork" color={ok} ink={K.ink} size={26} />
        </div>
      </Paper>
      <Stamp frame={frame} at={tungsten} color={K.red} size={50} rotate={-8} style={{left: 100, top: 790}}>
        Filled with tungsten
      </Stamp>
      <SourceLine frame={frame} at={jeweler} y={1250}>
        Source: Fox News · NBC News · Sept 19, 2012
      </SourceLine>
    </AbsoluteFill>
  );
};

// Sixty-four look-alike listings; tile 0 is ours.
const LISTINGS = Array.from({length: 64}, (_, i) => {
  const kinds = ['1 oz Gold Bar', '10 oz Gold Bar', '1 oz Gold Round', '5 × 1 oz Bars', '100 g Cast Bar', '1 oz Bar · Sealed'];
  const off = [200, 1900, 150, 950, 600, 240];
  const k = i === 0 ? 0 : Math.floor(random(`kind${i}`) * kinds.length);
  return {
    title: kinds[k],
    under: i === 0 ? 200 : Math.round(off[k] * (0.7 + random(`off${i}`) * 0.6) / 10) * 10,
    sold: i === 0 ? 0 : random(`sold${i}`),
    id: 88213 + i * 37,
  };
});

const ListingGrid: React.FC<{frame: number; zoom: number; soldFrom?: number; starsAt?: number; dim?: number}> = ({frame, zoom, soldFrom, starsAt, dim = 1}) => {
  const glow = starsAt === undefined ? 0 : prog(frame, starsAt, 16);
  return (
    <div style={{position: 'absolute', left: 64, top: 290, width: 952, height: 1030, overflow: 'hidden', opacity: dim}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 952, height: 1030, transformOrigin: '0 0', scale: String(zoom), display: 'grid', gridTemplateColumns: 'repeat(8, 112px)', gap: 7}}>
        {LISTINGS.map((l, i) => {
          const sold = soldFrom !== undefined && frame > soldFrom + l.sold * 140;
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                height: 121,
                borderRadius: 6,
                background: K.panel,
                boxShadow: `inset 0 0 0 ${i === 0 ? 1 : 0.5}px ${i === 0 ? K.red : K.edge}`,
                padding: 7,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <div style={{...mono(4.5, {color: K.mute}), letterSpacing: '0.1em'}}>listing #{l.id}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 6}}>
                <BarGlyph w={12} />
                <div style={sans(9.5, {lineHeight: 1.15})}>{l.title}</div>
              </div>
              <div style={{...sans(15, {fontWeight: 700}), marginTop: 7}}>−${l.under.toLocaleString('en-US')}</div>
              <div style={{...mono(4.5, {color: K.teal, fontWeight: 700}), marginTop: 2}}>under spot</div>
              <div style={{...sans(9, {color: K.teal}), marginTop: 6, textShadow: glow ? `0 0 ${6 * glow}px ${K.teal}` : undefined}}>★★★★★</div>
              {sold ? (
                <div style={{position: 'absolute', right: 6, bottom: 8, padding: '2px 5px', border: `1px solid ${K.red}`, borderRadius: 3, rotate: '-8deg', ...mono(6, {color: K.red, fontWeight: 700})}}>Sold</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// 7 · Meanwhile, deals like this get listed every day. Quietly.
const Everyday: React.FC<SceneProps> = ({frame, cue}) => {
  const everyDay = cue('every');
  const quietly = cue('Quietly');
  const reviews = cue('great');
  const z1 = prog(frame, everyDay - 6, 30, EASE.inOut);
  const z2 = prog(frame, quietly - 6, 34, EASE.inOut);
  const zoom = Math.pow(2, 2 - z1 - z2);
  const minutes = 9 * 60 + 12 + Math.max(0, frame - 20) * 2 + 0.03 * Math.max(0, frame - 20) ** 2;
  const day = DAYS[Math.floor(minutes / 1440) % 7];
  const hh = String(Math.floor((minutes % 1440) / 60)).padStart(2, '0');
  const mm = String(Math.floor(minutes % 60)).padStart(2, '0');
  const footer = 'Sold · Sold · Sold · No questions asked';
  return (
    <AbsoluteFill>
      <Glow color={K.red} amount={0.25} y={50} />
      <Kicker frame={frame} at={6}>
        Online · Every day
      </Kicker>
      <div style={{position: 'absolute', right: 64, top: 196, textAlign: 'right', opacity: prog(frame, 10, 16)}}>
        <div style={mono(20, {color: K.mute})}>{day}</div>
        <div style={mono(60, {color: K.text, fontWeight: 700, letterSpacing: '0.04em'})}>
          {hh}:{mm}
        </div>
      </div>
      <ListingGrid frame={frame} zoom={zoom} soldFrom={cue('listed')} starsAt={reviews} dim={prog(frame, 0, 16)} />
      <div style={{position: 'absolute', left: 64, right: 64, top: 1350, textAlign: 'center', ...mono(20, {color: K.red, fontWeight: 700})}}>
        {footer.slice(0, Math.round(footer.length * prog(frame, quietly, 40, (t) => t)))}
      </div>
    </AbsoluteFill>
  );
};

// 8 · So, do you really know what's inside your gold?
const Question: React.FC<SceneProps> = ({frame, cue}) => {
  const lines: {word: string; at: number; color?: string}[][] = [
    [
      {word: 'So,', at: cue('So')},
      {word: 'do you', at: cue('do')},
    ],
    [{word: 'really know', at: cue('really')}],
    [
      {word: "what's", at: cue('whats')},
      {word: 'inside', at: cue('inside'), color: K.red},
    ],
    [{word: 'your gold?', at: cue('your')}],
  ];
  return (
    <AbsoluteFill>
      <ListingGrid frame={frame + 400} zoom={1} soldFrom={-1000} dim={0.13} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 30% 45%, rgba(7,7,10,0.85), rgba(7,7,10,0.2))'}} />
      <Kicker frame={frame} at={6}>
        Your gold · Today
      </Kicker>
      <div style={{position: 'absolute', left: 64, top: 470, width: 960}}>
        {lines.map((line, i) => (
          <div key={i} style={{display: 'flex', gap: 30}}>
            {line.map((w) => {
              const p = prog(frame, w.at - 4, 14);
              return (
                <div key={w.word} style={{...sans(128, {fontWeight: 700, color: w.color ?? K.text, lineHeight: 1.06}), opacity: p, translate: `0 ${(1 - p) * 26}px`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined}}>
                  {w.word}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 9 · Don't worry. The same bar, the same scan, at Bullion Trading: gold all the way through.
const Verify: React.FC<SceneProps> = ({frame, cue}) => {
  const worry = cue('Dont');
  const bullion = cue('Bullion');
  const never = cue('never');
  const test = cue('test');
  const front = cue('front');
  const york = cue('York');
  const ships = cue('ships');
  const warm = prog(frame, worry, 40);
  const cut = prog(frame, test, front - test + 40, EASE.inOut);
  return (
    <AbsoluteFill>
      <Glow color={K.gold} amount={0.9 * warm} y={42} size={85} />
      <Kicker frame={frame} at={worry - 4} color={K.gold}>
        Same bar · At Bullion Trading
      </Kicker>
      <Headline
        frame={frame}
        lines={[
          {text: "We don't assume.", at: never - 4},
          {text: 'We verify.', at: test - 6, color: K.goldLight},
        ]}
      />
      <div style={{position: 'absolute', left: 390, top: 410, opacity: prog(frame, 4, 20), scale: String(mix(0.94, 1, prog(frame, 4, 30)))}}>
        <GoldBar frame={frame} w={300} cut={cut} core="gold" sheenAt={ships} />
      </div>
      <div style={{position: 'absolute', left: 290, top: 902, width: 500, opacity: prog(frame, bullion, 20)}}>
        <div style={{height: 16, borderRadius: 8, background: 'linear-gradient(180deg,#6b5a2c,#3a3018)'}} />
        <div style={{marginTop: 14, textAlign: 'center', ...mono(15, {color: K.mute})}}>Bullion Trading · New York</div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 1010, display: 'flex', flexDirection: 'column', gap: 18}}>
        <Check frame={frame} at={front} label="Tested in front of you" color={K.gold} />
        <Check frame={frame} at={york} label="20 W 47th St · New York" color={K.gold} />
        <Check frame={frame} at={ships - 4} label="Checked before it ships" color={K.gold} />
      </div>
      <Stamp frame={frame} at={ships + 18} color={K.gold} size={40} rotate={-9} style={{left: 560, top: 790}}>
        Verified
      </Stamp>
    </AbsoluteFill>
  );
};

const GHOSTS = [
  {text: '999.9', x: 120, y: 420},
  {text: 'Verified', x: 760, y: 470},
  {text: '1 oz', x: 820, y: 1220},
  {text: SERIAL, x: 90, y: 1180},
];

// 10 · From your next bar on, we've got you. Buy from Bullion Trading.
const Cta: React.FC<SceneProps> = ({frame, cue}) => {
  const from = cue('From');
  const weve = cue('weve');
  const buy = cue('Buy');
  const beam = prog(frame, 0, 40);
  return (
    <AbsoluteFill>
      <Glow color={K.gold} amount={1.1 * beam} y={40} size={80} />
      <div
        style={{
          position: 'absolute',
          left: 538,
          top: 0,
          width: 4,
          height: 1920,
          background: 'linear-gradient(180deg, rgba(212,175,55,0), rgba(246,227,161,0.9) 30%, rgba(246,227,161,0.9) 36%, rgba(212,175,55,0) 60%)',
          boxShadow: '0 0 30px rgba(246,227,161,0.8)',
          opacity: beam * 0.8,
          scale: `1 ${beam}`,
        }}
      />
      {GHOSTS.map((g, i) => (
        <div
          key={g.text}
          style={{
            position: 'absolute',
            left: g.x,
            top: g.y + Math.sin((frame + i * 40) / 50) * 10,
            padding: '8px 16px',
            borderRadius: 10,
            border: `1px solid ${rgba(K.gold, 0.3)}`,
            opacity: 0.35 * prog(frame, 20 + i * 8, 30),
            ...mono(18, {color: K.goldLight}),
          }}
        >
          {g.text}
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: prog(frame, 4, 24), scale: String(mix(0.92, 1, prog(frame, 4, 40)))}}>
        <div style={{padding: '40px 56px', borderRadius: 32, background: 'rgba(10,10,12,0.85)', boxShadow: `inset 0 0 0 1px ${rgba(K.gold, 0.35)}, 0 0 80px ${rgba(K.gold, 0.2)}`}}>
          <Img src={LOGO} style={{width: 520, height: (520 * 84) / 294}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 860, textAlign: 'center'}}>
        <div style={{...sans(60), opacity: prog(frame, from - 4, 16)}}>From your next bar on,</div>
        <div style={{...sans(60, {color: K.goldLight}), opacity: prog(frame, weve - 4, 16), marginTop: 6}}>we've got you.</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1070, display: 'flex', justifyContent: 'center', opacity: prog(frame, buy - 8, 16), scale: String(mix(0.9, 1, prog(frame, buy - 8, 20)))}}>
        <div style={{position: 'relative', overflow: 'hidden', padding: '24px 44px', borderRadius: 999, background: 'linear-gradient(180deg,#e9c766,#c9a13a)', textAlign: 'center', boxShadow: `0 20px 50px ${rgba(K.gold, 0.3)}`}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(105deg, rgba(255,255,255,0) 35%, rgba(255,252,236,0.85) 50%, rgba(255,255,255,0) 65%)',
              backgroundSize: '300% 100%',
              backgroundPosition: `${mix(130, -30, prog(frame, buy + 70, 60, EASE.inOut))}% 0`,
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div style={{position: 'relative', ...sans(46, {color: '#17120a', fontWeight: 700})}}>BullionTradingLLC.com</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1206, textAlign: 'center', opacity: prog(frame, buy, 20), ...mono(19, {color: K.mute})}}>
        20 W 47th St · New York · Since 2008
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 1340, textAlign: 'center', opacity: 0.6 * prog(frame, 30, 30), ...mono(12, {color: K.mute, lineHeight: 1.7, letterSpacing: '0.12em'})}}>
        Listing, seller, serial and receipt are fictional examples.
        <br />
        2012 case: Fox News, NBC News, Sept 19, 2012.
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<SceneProps>> = {
  spot: Spot,
  picture: Picture,
  arrives: Arrives,
  who: Who,
  bill: Bill,
  case: Case,
  everyday: Everyday,
  question: Question,
  verify: Verify,
  cta: Cta,
};

const clean = (word: string) => word.toLowerCase().replace(/[^a-z0-9]/g, '');
const cutAt = (scene: string, fps: number) => Math.round(DATA.scenes.find((s) => s.id === scene)!.visualStart * fps);
const said = (scene: string, word: string, fps: number) =>
  Math.round(DATA.scenes.find((s) => s.id === scene)!.words.find((w) => clean(w.word) === clean(word))!.start * fps);

// The carried object lives above the scenes, so it survives every cut: it slides
// out of the listing on "serial", takes its stamp, stays in your hands through
// "You.", clips itself onto the receipt, and returns clean for the replay.
const CarriedTag: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const serial = said('picture', 'serial', fps) + 4;
  const tungsten = said('arrives', 'tungsten', fps) + 8;
  const bill = cutAt('bill', fps);
  const next = cutAt('case', fps);
  const verify = cutAt('verify', fps);
  const ships = said('verify', 'ships', fps) + 24;
  const cta = cutAt('cta', fps);
  if (frame < verify) {
    const fly = prog(frame, serial, 26, EASE.inOut);
    const clip = prog(frame, bill + 12, 30, EASE.inOut);
    const onBill = frame >= bill;
    return (
      <BarTag
        frame={frame}
        x={onBill ? mix(TAG.x, 600, clip) : mix(150, TAG.x, fly)}
        y={onBill ? mix(TAG.y, 212, clip) : mix(660, TAG.y, fly)}
        scale={onBill ? 1 : mix(0.6, 1, fly)}
        rotate={onBill ? mix(-2, 7, clip) : mix(-7, -2, fly)}
        opacity={prog(frame, serial, 8) * (1 - prog(frame, next - 12, 12, EASE.in))}
        clip={onBill && clip > 0.92}
        stamp={{at: tungsten, kind: 'tungsten'}}
      />
    );
  }
  return (
    <BarTag frame={frame} x={TAG.x} y={TAG.y} opacity={prog(frame, verify + 14, 18) * (1 - prog(frame, cta - 12, 12, EASE.in))} stamp={{at: ships, kind: 'verified'}} />
  );
};

const hasFile = (path: string) => getStaticFiles().some((file) => file.name === path);

const Slot: React.FC<{Scene: React.FC<SceneProps>; cue: SceneProps['cue']; duration: number; first: boolean; last: boolean}> = ({Scene, cue, duration, first, last}) => {
  const frame = useCurrentFrame();
  return (
    <StoryShell frame={frame} duration={duration} first={first} last={last}>
      <Scene frame={frame} duration={duration} cue={cue} />
    </StoryShell>
  );
};

export const WhatsInside: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const starts = DATA.scenes.map((s) => Math.round(s.visualStart * fps));
  return (
    <AbsoluteFill style={{backgroundColor: K.bg, fontFamily: SANS}}>
      <Backdrop frame={frame} />
      {DATA.scenes.map((scene, i) => {
        const from = starts[i];
        const duration = (starts[i + 1] ?? durationInFrames) - from;
        return (
          <Sequence key={scene.id} name={`${i + 1} · ${scene.id}`} from={from} durationInFrames={duration}>
            <Slot Scene={SCENES[scene.id]} cue={makeCue(scene, fps)} duration={duration} first={i === 0} last={i === DATA.scenes.length - 1} />
          </Sequence>
        );
      })}
      <CarriedTag frame={frame} fps={fps} />
      <Watermark frame={frame} hideAt={starts[starts.length - 1]} />
      <StoryCaptions scenes={DATA.scenes} time={frame / fps} />
      <Finish frame={frame} />
      <Audio name="Voice · Aiden" src={staticFile(DATA.voice)} />
      {hasFile(DATA.score) ? <Audio name="Score" src={staticFile(DATA.score)} volume={1.4} /> : null}
    </AbsoluteFill>
  );
};

export const WHATS_INSIDE = DATA;
