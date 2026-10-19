import type React from 'react';
import {AbsoluteFill, Img, random} from 'remotion';
import {Eyebrow, italic, Metal, Rise} from '../kit/Text';
import {art, C, EASE, LOGO, mix, prog, SANS, type SceneProps} from '../kit/theme';
import {Plaque} from '../videos/NewYork';
import {caps, Embers, F, ICE_GRADIENT} from './forge';

// Scene 5 — the call to action. Liquid silver fills a ring mold beside the
// live casting-grain shop; then the wholesale desk address, "lock in your
// live price", and a fade to black that leaves only the gleaming logo.

const PANEL_TOP = 700;
const PANEL_H = 680;
const PANEL_W = 490;

// Ring mold seen from above at an angle: an elliptical channel.
const RING = {cx: PANEL_W / 2, cy: 430, rx: 132, ry: 62, thick: 34};

const ringPath = `M${RING.cx - RING.rx} ${RING.cy} a${RING.rx} ${RING.ry} 0 1 0 ${RING.rx * 2} 0 a${RING.rx} ${RING.ry} 0 1 0 ${-RING.rx * 2} 0`;

const SIZZLE = Array.from({length: 28}, (_, i) => ({
  a: random(`za${i}`) * Math.PI * 2,
  vy: 1.5 + random(`zv${i}`) * 3,
  delay: random(`zd${i}`) * 180,
  life: 20 + random(`zl${i}`) * 30,
}));

const RingMold: React.FC<{frame: number}> = ({frame}) => {
  const pour = prog(frame, 6, 150, EASE.inOut);
  const stop = prog(frame, 150, 30, EASE.in);
  const cool = prog(frame, 170, 150, EASE.inOut);
  const [hx, hy] = [RING.cx - RING.rx * 0.82, RING.cy + RING.ry * 0.55];
  const streamTop = -40;
  return (
    <svg width={PANEL_W} height={PANEL_H} viewBox={`0 0 ${PANEL_W} ${PANEL_H}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="mold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2726" />
          <stop offset="1" stopColor="#0e0d0d" />
        </linearGradient>
        <linearGradient id="silver-hot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffb769" />
          <stop offset="0.5" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#ffc98a" />
        </linearGradient>
        <linearGradient id="silver-cool" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7f8892" />
          <stop offset="0.35" stopColor="#f4f7fa" />
          <stop offset="0.6" stopColor="#aeb6bf" />
          <stop offset="1" stopColor="#e7ecf1" />
        </linearGradient>
      </defs>
      {/* Graphite mold block */}
      <path d={`M40 ${RING.cy - 120} L${PANEL_W - 40} ${RING.cy - 120} L${PANEL_W - 10} ${RING.cy + 150} L10 ${RING.cy + 150} Z`} fill="url(#mold)" />
      <path d={`M40 ${RING.cy - 120} L${PANEL_W - 40} ${RING.cy - 120}`} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
      <path d={`M10 ${RING.cy + 150} L${PANEL_W - 10} ${RING.cy + 150} L${PANEL_W - 10} ${RING.cy + 200} L10 ${RING.cy + 200} Z`} fill="#0a0909" />
      {/* Empty channel */}
      <path d={ringPath} fill="none" stroke="#050404" strokeWidth={RING.thick} />
      <path d={ringPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={RING.thick + 6} strokeDasharray="0" opacity={0.6} />
      {/* Metal flowing around the channel */}
      <path d={ringPath} fill="none" stroke="url(#silver-hot)" strokeWidth={RING.thick - 8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pour} opacity={1 - cool} style={{filter: 'drop-shadow(0 0 12px rgba(255,170,90,0.9))'}} />
      <path d={ringPath} fill="none" stroke="url(#silver-cool)" strokeWidth={RING.thick - 8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pour} opacity={cool} />
      <path d={ringPath} fill="none" stroke="#fff" strokeWidth={3} pathLength={1} strokeDasharray="0.08 0.92" strokeDashoffset={-frame / 300} opacity={cool * 0.7} transform={`translate(0 ${-RING.thick * 0.18})`} />
      {/* The pour */}
      {stop < 1 ? (
        <g opacity={1 - stop}>
          <path d={`M${hx} ${streamTop} L${hx} ${hy}`} stroke="rgba(255,170,90,0.35)" strokeWidth={34} style={{filter: 'blur(10px)'}} />
          <path d={`M${hx} ${streamTop} L${hx} ${hy}`} stroke="url(#silver-hot)" strokeWidth={13 * (1 - stop)} />
          <path d={`M${hx} ${streamTop} L${hx} ${hy}`} stroke="#fff" strokeWidth={4} strokeDasharray="40 30" strokeDashoffset={-frame * 8} opacity={0.6} />
          <ellipse cx={hx} cy={hy} rx={22} ry={9} fill="#fff4dc" opacity={0.9} />
        </g>
      ) : null}
      {/* Sizzle sparks and wisps */}
      {SIZZLE.map((z, i) => {
        const age = (frame + z.delay) % 200;
        if (age > z.life || frame > 260) {
          return null;
        }
        const x = RING.cx + Math.cos(z.a) * RING.rx;
        const y = RING.cy + Math.sin(z.a) * RING.ry - age * z.vy;
        return <circle key={i} cx={x} cy={y} r={1.8} fill="#ffe7c2" opacity={(1 - age / z.life) * (1 - cool)} />;
      })}
      <text x={PANEL_W / 2} y={PANEL_H - 34} textAnchor="middle" fill="rgba(244,238,223,0.6)" fontFamily={SANS} fontSize={17} fontWeight={500} letterSpacing={5}>
        CAST IN STERLING
      </text>
    </svg>
  );
};

const SHOP = [
  {src: 'grain-gold-texture.jpg', name: '24K gold casting grain', cover: true},
  {src: 'grain-sterling-pile.png', name: '.925 sterling silver casting grain', cover: true},
  {src: 'grain-scoop-silver.png', name: '.999 fine silver casting grain', cover: false},
  {src: 'grain-platinum-pile.png', name: 'Platinum casting grain', cover: false},
];

// Illustrative trace — no figures are shown.
const TRACE = Array.from({length: 60}, (_, i) => 0.5 - 0.18 * Math.sin(i / 7) + 0.08 * Math.sin(i / 2.3) - i * 0.003);

const Shop: React.FC<{frame: number; scroll: number; lockAt: number; closeAt: number; compact?: boolean}> = ({frame, scroll, lockAt, closeAt}) => {
  const pulse = (frame % 50) / 50;
  const press = prog(frame, lockAt, 6) * (1 - prog(frame, lockAt + 8, 14));
  const locked = prog(frame, closeAt, 14, EASE.out);
  const shown = Math.round(prog(frame, 0, 90) * TRACE.length);
  return (
    <div style={{position: 'absolute', inset: 0, borderRadius: 26, overflow: 'hidden', background: 'linear-gradient(180deg, #121014, #0b0a0c)'}}>
      <div style={{height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,154,60,0.25)'}}>
        <Img src={LOGO} style={{width: 150, height: (150 * 84) / 294}} />
      </div>
      <div style={{padding: '16px 22px 8px', display: 'flex', alignItems: 'center', gap: 12}}>
        <span style={{width: 12, height: 12, borderRadius: '50%', background: '#ff9a3c', boxShadow: `0 0 0 ${pulse * 12}px rgba(255,154,60,${0.4 * (1 - pulse)})`}} />
        <span style={caps(22, {letterSpacing: '0.2em', color: F.amber})}>Live spot</span>
        <svg width={200} height={34} style={{marginLeft: 'auto'}}>
          <path
            d={TRACE.slice(0, Math.max(2, shown))
              .map((v, i) => `${i ? 'L' : 'M'}${(i / (TRACE.length - 1)) * 196 + 2} ${v * 30 + 2}`)
              .join(' ')}
            fill="none"
            stroke="#ffb35c"
            strokeWidth={2}
          />
        </svg>
      </div>
      <div style={{padding: '4px 22px 12px', ...caps(30)}}>Casting grain</div>
      <div style={{position: 'absolute', left: 16, right: 16, top: 180, bottom: 118, overflow: 'hidden'}}>
        <div style={{translate: `0 ${8 - scroll}px`}}>
        {SHOP.map((item, i) => (
          <div
            key={item.src}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 12,
              marginBottom: 12,
              borderRadius: 18,
              background: i === 1 ? 'rgba(255,154,60,0.08)' : 'rgba(255,255,255,0.035)',
              border: `1px solid ${i === 1 ? 'rgba(255,154,60,0.45)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <div style={{width: 96, height: 96, borderRadius: 12, overflow: 'hidden', background: '#1a1718', flexShrink: 0}}>
              <Img src={art(item.src)} style={{width: '100%', height: '100%', objectFit: item.cover ? 'cover' : 'contain'}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: SANS, fontSize: 21, fontWeight: 600, color: C.ivory, lineHeight: 1.2}}>{item.name}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 10}}>
                <span style={caps(15, {letterSpacing: '0.16em', color: F.amber})}>Live price</span>
                <span
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, rgba(255,154,60,0.15), rgba(255,220,170,0.6) ${((frame * 1.6 + i * 30) % 160) - 30}%, rgba(255,154,60,0.15))`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
      {/* Lock-in button */}
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 22,
          height: 84,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          background: `linear-gradient(180deg, ${locked > 0.5 ? '#ffcf86, #ff9a3c' : '#ffb35c, #e0661c'})`,
          boxShadow: `0 0 ${20 + press * 40}px rgba(255,154,60,${0.35 + press * 0.4})`,
          scale: String(1 - press * 0.05),
          ...caps(30, {color: '#1a0d05', letterSpacing: '0.14em'}),
        }}
      >
        <svg width={30} height={38} viewBox="0 0 30 38">
          <rect x={3} y={16} width={24} height={20} rx={4} fill="#1a0d05" />
          <path d={`M8 16 V10 a7 7 0 0 1 14 0 V${mix(6, 16, locked)}`} fill="none" stroke="#1a0d05" strokeWidth={3.5} transform={`translate(0 ${-(1 - locked) * 4})`} />
        </svg>
        {locked > 0.5 ? 'Price locked' : 'Lock in price'}
      </div>
    </div>
  );
};

export const Close: React.FC<SceneProps> = ({frame, cue}) => {
  const visit = cue('Visit');
  const or = cue('Or');
  const lock = cue('lock');
  const live = cue('live');
  const black = prog(frame, 13.0 * 60 - 20, 40, EASE.inOut);
  const toDesk = prog(frame, visit - 16, 30, EASE.inOut);
  const toLock = prog(frame, or - 14, 34, EASE.inOut);
  const panelsIn = prog(frame, 0, 34, EASE.out);
  const logoIn = prog(frame, 13.0 * 60, 50, EASE.out);
  const shine = prog(frame, 13.6 * 60, 70, EASE.inOut);
  const headline = (text: React.ReactNode, at: number, out?: number) => (
    <Rise frame={frame} at={at} out={out}>
      {text}
    </Rise>
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - black}}>
        <Embers frame={frame} heat={0.4} originY={1300} />
        {/* A — protect / perfect */}
        <div style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center'}}>
          {headline(<div style={caps(104)}>Protect your margins.</div>, cue('Protect') - 6, visit - 18)}
          {headline(
            <div style={italic(132, {lineHeight: 1.08})}>
              <Metal frame={frame} gradient={ICE_GRADIENT} sheenAt={cue('craft')} glow="rgba(220,232,245,0.35)">
                Perfect your craft.
              </Metal>
            </div>,
            cue('Perfect') - 6,
            visit - 18,
          )}
        </div>
        <div style={{opacity: 1 - toDesk}}>
          <div
            style={{
              position: 'absolute',
              left: mix(-PANEL_W, 40, panelsIn) - toDesk * 300,
              top: PANEL_TOP,
              width: PANEL_W,
              height: PANEL_H,
              borderRadius: 26,
              overflow: 'hidden',
              background: 'radial-gradient(ellipse at 50% 30%, #241a14, #0b0909 70%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,154,60,0.3), 0 40px 80px rgba(0,0,0,0.6)',
            }}
          >
            <RingMold frame={frame} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: mix(1080, 550, panelsIn) + toDesk * 300,
              top: PANEL_TOP,
              width: PANEL_W,
              height: PANEL_H,
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,154,60,0.3)',
              borderRadius: 26,
            }}
          >
            <Shop frame={frame} scroll={prog(frame, 40, 200, EASE.inOut) * 120} lockAt={100000} closeAt={100000} />
          </div>
        </div>

        {/* B — the wholesale desk */}
        <div style={{opacity: toDesk * (1 - toLock), translate: `0 ${-toLock * 60}px`}}>
          <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
            <Rise frame={frame} at={visit - 4}>
              <div style={caps(40, {color: F.amber, letterSpacing: '0.3em', fontWeight: 500})}>Visit the</div>
            </Rise>
            <Rise frame={frame} at={cue('wholesale') - 6}>
              <div style={caps(132, {marginTop: 10})}>Wholesale desk</div>
            </Rise>
          </div>
          <Plaque frame={frame} at={cue('20') - 14} glint={cue('47th')} top={740} />
          <div style={{position: 'absolute', top: 1200, left: 0, right: 0}}>
            <Eyebrow frame={frame} at={cue('Street') - 10} color={C.mute}>
              Diamond District · New York
            </Eyebrow>
          </div>
        </div>

        {/* C — lock in your live price */}
        <div style={{opacity: toLock}}>
          <div style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center'}}>
            <Rise frame={frame} at={lock - 6}>
              <div style={caps(104)}>Lock in your</div>
            </Rise>
            <Rise frame={frame} at={live - 6}>
              <div style={italic(150, {lineHeight: 1.04})}>
                <Metal frame={frame} gradient={ICE_GRADIENT} sheenAt={cue('now')} glow="rgba(220,232,245,0.35)">
                  live price.
                </Metal>
              </div>
            </Rise>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 540 - 270,
              top: 640,
              width: 540,
              height: 700,
              scale: String(mix(0.9, 1, toLock)),
              boxShadow: '0 50px 100px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,154,60,0.35)',
              borderRadius: 26,
            }}
          >
            <Shop frame={frame} scroll={0} lockAt={lock} closeAt={live} />
          </div>
        </div>
      </div>

      {/* D — black, and the logo */}
      <AbsoluteFill style={{background: '#000', opacity: black}} />
      <div style={{position: 'absolute', left: 540 - 240, top: 820, width: 480, height: (480 * 84) / 294, opacity: logoIn, scale: String(mix(0.94, 1, logoIn)), filter: `drop-shadow(0 0 ${24 + 16 * Math.sin(frame / 20)}px rgba(255,200,120,0.35))`}}>
        <Img src={LOGO} style={{width: 480, height: (480 * 84) / 294}} />
        {shine > 0 && shine < 1 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(110deg, rgba(255,255,255,0) ${mix(-20, 110, shine) - 12}%, rgba(255,250,230,0.95) ${mix(-20, 110, shine)}%, rgba(255,255,255,0) ${mix(-20, 110, shine) + 12}%)`,
              maskImage: `url(${LOGO})`,
              WebkitMaskImage: `url(${LOGO})`,
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              mixBlendMode: 'screen',
            }}
          />
        ) : null}
      </div>
      <div style={{position: 'absolute', top: 1010, left: 0, right: 0, textAlign: 'center', opacity: prog(frame, 13.0 * 60 + 30, 40), ...caps(30, {letterSpacing: '0.32em', color: 'rgba(244,238,223,0.75)', fontWeight: 500})}}>
        BullionTradingLLC.com
      </div>
      <div style={{position: 'absolute', top: 1062, left: 0, right: 0, textAlign: 'center', opacity: prog(frame, 13.0 * 60 + 50, 40), ...caps(20, {letterSpacing: '0.4em', color: 'rgba(255,154,60,0.75)', fontWeight: 500})}}>
        20 W 47th St · New York
      </div>
    </AbsoluteFill>
  );
};
