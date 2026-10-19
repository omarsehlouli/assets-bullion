import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {EndCard} from '../kit/EndCard';
import {Phone, Pin, Skyline} from '../kit/Pieces';
import {Coin, Product} from '../kit/Product';
import {caps, Eyebrow, italic, MaskLine, Metal, Rise, serif} from '../kit/Text';
import {C, EASE, mix, prog, SANS, SERIF, type SceneProps} from '../kit/theme';

// ——— Hook: a schematic flyover of Midtown down to West 47th Street ———

const MAP = 2400;
const AVE = 230; // avenue spacing
const ST = 74; // street spacing
const TARGET = {x: 1215, y: 1200}; // 47th St between 6th and 5th Avenues
const AVENUES = [
  {x: TARGET.x - AVE * 2.5, label: '8 Av'},
  {x: TARGET.x - AVE * 1.5, label: '7 Av'},
  {x: TARGET.x - AVE * 0.5, label: '6 Av'},
  {x: TARGET.x + AVE * 0.5, label: '5 Av'},
  {x: TARGET.x + AVE * 1.5, label: 'Madison'},
  {x: TARGET.x + AVE * 2.5, label: 'Park Av'},
];
const STREETS = Array.from({length: 23}, (_, i) => ({n: 58 - i, y: TARGET.y - (58 - i - 47) * ST}));

const TRAFFIC = Array.from({length: 34}, (_, i) => ({
  avenue: i % 3 !== 0,
  lane: i % 3 !== 0 ? i % 6 : 4 + ((i * 7) % 16),
  dir: i % 2 ? 1 : -1,
  speed: 0.0011 + ((i * 37) % 10) * 0.00022,
  offset: ((i * 0.618) % 1),
  warm: i % 4 !== 0,
}));

const MidtownMap: React.FC<{frame: number; diamond: number}> = ({frame, diamond}) => {
  const glow = prog(frame, diamond - 6, 30);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 10);
  const left = AVENUES[0].x - AVE;
  const right = AVENUES[AVENUES.length - 1].x + AVE;
  return (
    <svg width={MAP} height={MAP} viewBox={`0 0 ${MAP} ${MAP}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="map-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="map-mask">
          <rect width={MAP} height={MAP} fill="url(#map-fade)" />
        </mask>
      </defs>
      <g mask="url(#map-mask)">
        {/* Blocks */}
        {AVENUES.slice(0, -1).map((a, i) =>
          STREETS.slice(0, -1).map((s, j) => (
            <rect
              key={`${i}-${j}`}
              x={a.x + 9}
              y={s.y + 9}
              width={AVE - 18}
              height={ST - 18}
              rx={4}
              fill="rgba(255,240,210,0.055)"
              stroke="rgba(212,175,55,0.24)"
              strokeWidth={1.2}
            />
          )),
        )}
        {AVENUES.map((a) => (
          <line key={a.label} x1={a.x} x2={a.x} y1={0} y2={MAP} stroke="rgba(212,175,55,0.34)" strokeWidth={3} />
        ))}
        {STREETS.map((s) => (
          <line key={s.n} x1={left} x2={right} y1={s.y} y2={s.y} stroke="rgba(212,175,55,0.1)" strokeWidth={1.5} />
        ))}
        {/* Broadway cuts the grid on the diagonal */}
        <line x1={TARGET.x - AVE * 3} y1={TARGET.y + ST * 13} x2={TARGET.x + AVE * 0.2} y2={TARGET.y - ST * 13} stroke="rgba(212,175,55,0.2)" strokeWidth={3} />
        {STREETS.filter((s) => s.n % 2 === 0 || s.n === 47).map((s) => (
          <text
            key={`t${s.n}`}
            x={AVENUES[1].x + 14}
            y={s.y - 8}
            fill={s.n === 47 ? '#f6e3a1' : 'rgba(217,199,155,0.45)'}
            fontFamily={SANS}
            fontWeight={500}
            fontSize={s.n === 47 ? 26 : 20}
            letterSpacing={4}
          >
            {`W ${s.n} ST`}
          </text>
        ))}
        {AVENUES.map((a) => (
          <text
            key={`a${a.label}`}
            x={a.x + 10}
            y={TARGET.y + ST * 6.6}
            fill="rgba(217,199,155,0.5)"
            fontFamily={SANS}
            fontWeight={500}
            fontSize={20}
            letterSpacing={4}
            transform={`rotate(-90 ${a.x + 10} ${TARGET.y + ST * 6.6})`}
          >
            {a.label.toUpperCase()}
          </text>
        ))}
        {/* Night traffic: lights gliding up and down the avenues and across streets */}
        {TRAFFIC.map((t, i) => {
          const along = ((t.offset + frame * t.speed) % 1 + 1) % 1;
          const x = t.avenue ? AVENUES[t.lane].x + (t.dir > 0 ? 7 : -7) : mix(left, right, t.dir > 0 ? along : 1 - along);
          const y = t.avenue ? mix(0, MAP, t.dir > 0 ? along : 1 - along) : STREETS[t.lane].y;
          const dx = t.avenue ? 0 : t.dir * -46;
          const dy = t.avenue ? t.dir * -46 : 0;
          return (
            <g key={`c${i}`} opacity={0.85}>
              <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke={t.warm ? '#f6e3a1' : '#cfe3ff'} strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
              <circle cx={x} cy={y} r={4.5} fill={t.warm ? '#fff1c4' : '#e6f0ff'} />
            </g>
          );
        })}
        {/* The Diamond District block on 47th */}
        <rect
          x={TARGET.x - AVE / 2 + 9}
          y={TARGET.y - ST + 9}
          width={AVE - 18}
          height={ST * 2 - 18}
          rx={6}
          fill={`rgba(233,199,102,${0.12 * glow})`}
          stroke={`rgba(246,227,161,${0.7 * glow})`}
          strokeWidth={2}
        />
        <line
          x1={TARGET.x - AVE / 2}
          x2={TARGET.x + AVE / 2}
          y1={TARGET.y}
          y2={TARGET.y}
          stroke="#f6e3a1"
          strokeWidth={7}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - glow}
          style={{filter: `drop-shadow(0 0 ${12 + pulse * 10}px rgba(246,227,161,0.9))`}}
        />
      </g>
    </svg>
  );
};

const Hook: React.FC<SceneProps> = ({frame, cue}) => {
  const ny = cue('New');
  const diamond = cue('Diamond');
  const precious = cue('precious');
  const hands = cue('handson');
  const fly = prog(frame, 0, diamond + 30, EASE.silk);
  const toMetal = prog(frame, precious - 18, 44, EASE.inOut);
  const tilt = mix(30, 58, fly) + toMetal * 8;
  const rot = mix(-48, -29, fly);
  const zoom = mix(0.42, 1.08, fly) + toMetal * 0.25;
  const rise = prog(frame, precious - 6, 60, EASE.out);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 540 - MAP / 2,
          top: 1010 - MAP / 2,
          width: MAP,
          height: MAP,
          perspective: 1500,
          opacity: prog(frame, 0, 12) * (1 - toMetal * 0.62),
          filter: toMetal > 0 ? `blur(${toMetal * 5}px)` : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `rotateX(${tilt}deg) rotateZ(${rot}deg) scale(${zoom}) translate(${MAP / 2 - TARGET.x}px, ${MAP / 2 - TARGET.y}px)`,
          }}
        >
          <MidtownMap frame={frame} diamond={diamond} />
        </div>
      </div>
      <div style={{opacity: 1 - toMetal}}>
        <Pin frame={frame} at={diamond + 4} x={540} y={1010} size={1.1} />
      </div>

      {/* Phase A headline */}
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('heart') - 10} out={precious - 22}>
          <div style={italic(84, {color: C.champagne})}>In the heart of</div>
        </Rise>
        <MaskLine frame={frame} at={ny - 6} out={precious - 22}>
          <div style={serif(172, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={ny + 24}>
              New York.
            </Metal>
          </div>
        </MaskLine>
        <div style={{marginTop: 26}}>
          <Eyebrow frame={frame} at={diamond - 4} out={precious - 22}>
            The Diamond District
          </Eyebrow>
        </div>
      </div>

      {/* Phase B — the metal itself */}
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={precious - 4}>
          <div style={serif(124)}>Precious metals,</div>
        </Rise>
        <Rise frame={frame} at={hands - 6}>
          <div style={italic(168, {lineHeight: 1.05})}>
            <Metal frame={frame} sheenAt={hands + 26}>
              hands-on.
            </Metal>
          </div>
        </Rise>
      </div>
      <Product
        src="bar-justice-rev.png"
        frame={frame}
        w={640}
        h={517}
        x={520}
        y={mix(1180, 1010, rise)}
        scale={mix(0.6, 1, rise)}
        rotate={mix(8, 0, rise)}
        opacity={rise}
        float={6}
        sheen={[hands + 10]}
        glow="rgba(214,168,74,0.3)"
      />
      <Coin
        src="coin-silver-eagle.png"
        frame={frame}
        metal="silver"
        d={250}
        x={mix(700, 810, rise)}
        y={mix(1250, 1200, rise)}
        turn={mix(-200, -14, prog(frame, precious + 6, 70))}
        roll={-6}
        opacity={prog(frame, precious + 6, 24)}
        sheen={[hands + 18]}
      />
    </AbsoluteFill>
  );
};

// ——— Heritage: buyers ⇄ sellers, since 2008 ———

const DIGITS = '2008';
const ROLL_H = 300;

const YearRoll: React.FC<{frame: number; start: number; land: number}> = ({frame, start, land}) => (
  <div style={{display: 'flex', justifyContent: 'center', gap: 6}}>
    {DIGITS.split('').map((digit, i) => {
      const end = land + i * 5;
      const p = prog(frame, start + i * 3, end - start - i * 3, EASE.out);
      // Cycle through several full turns of 0–9 before settling on the digit.
      const turns = 3 + i;
      const pos = p * (turns * 10 + Number(digit));
      const speed = (1 - p) * 1.2;
      return (
        <div key={i} style={{position: 'relative', height: ROLL_H, width: 196, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: -pos * ROLL_H, filter: speed > 0.05 ? `blur(0px) url(#roll-blur-${Math.min(9, Math.round(speed * 9))})` : undefined}}>
            {Array.from({length: turns * 10 + 11}, (_, k) => (
              <div key={k} style={{height: ROLL_H, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span style={serif(330, {lineHeight: 1})}>
                  <Metal frame={frame} sheenAt={land + 30} glow="rgba(212,175,55,0.35)">
                    {k % 10}
                  </Metal>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const RollBlurs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      {Array.from({length: 10}, (_, i) => (
        <filter key={i} id={`roll-blur-${i}`} x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation={`0 ${i * 4}`} />
        </filter>
      ))}
    </defs>
  </svg>
);

const Heritage: React.FC<SceneProps> = ({frame, cue}) => {
  const buyers = cue('buyers');
  const sellers = cue('sellers');
  const since = cue('since');
  const year = cue('2008');
  const arcs = prog(frame, buyers + 6, 40, EASE.inOut);
  const ring = prog(frame, since - 10, 60, EASE.out);
  return (
    <AbsoluteFill>
      <RollBlurs />
      <div style={{position: 'absolute', top: 280, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={cue('Bullion') - 8}>
          Bullion Trading
        </Eyebrow>
      </div>
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34}}>
        <Rise inline frame={frame} at={buyers - 6}>
          <span style={serif(108)}>Buyers</span>
        </Rise>
        <svg width={120} height={90} viewBox="0 0 120 90" style={{overflow: 'visible', opacity: prog(frame, buyers, 20)}}>
          <path d="M10 34 Q60 4 110 34" fill="none" stroke="#e2c46c" strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arcs} />
          <path d="M98 22 L110 34 L94 38" fill="none" stroke="#e2c46c" strokeWidth={2.5} opacity={arcs} />
          <path d="M110 58 Q60 88 10 58" fill="none" stroke="#e2c46c" strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(frame, sellers, 40, EASE.inOut)} />
          <path d="M22 70 L10 58 L26 54" fill="none" stroke="#e2c46c" strokeWidth={2.5} opacity={prog(frame, sellers + 30, 10)} />
        </svg>
        <Rise inline frame={frame} at={sellers - 6}>
          <span style={serif(108)}>Sellers</span>
        </Rise>
      </div>
      <div style={{position: 'absolute', top: 540, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={since - 6}>
          <div style={italic(96, {color: C.champagne})}>since</div>
        </Rise>
      </div>
      {/* Coin-edge ring behind the year */}
      <svg width={1080} height={1080} viewBox="-540 -540 1080 1080" style={{position: 'absolute', left: 0, top: 440, opacity: ring}}>
        <circle r={410} fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} />
        <circle r={392} fill="none" stroke="rgba(212,175,55,0.18)" strokeWidth={1} />
        {Array.from({length: 120}, (_, i) => {
          const a = (i / 120) * Math.PI * 2 + frame / 400;
          return <line key={i} x1={Math.cos(a) * 396} y1={Math.sin(a) * 396} x2={Math.cos(a) * 406} y2={Math.sin(a) * 406} stroke="rgba(226,196,108,0.35)" strokeWidth={1.2} />;
        })}
      </svg>
      <div style={{position: 'absolute', top: 830, left: 0, right: 0, opacity: prog(frame, since - 8, 20)}}>
        <YearRoll frame={frame} start={since - 8} land={year + 4} />
      </div>
      <div style={{position: 'absolute', top: 1210, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={year + 18} color={C.mute}>
          Buying &amp; selling precious metals
        </Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

// ——— Visit: online, or in person on West 47th ———

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

export const Plaque: React.FC<{frame: number; at: number; glint: number; top?: number}> = ({frame, at, glint, top = 770}) => {
  const p = prog(frame, at, 50, EASE.out);
  const sweep = prog(frame, glint, 50, EASE.inOut);
  const PW = 780;
  const PH = 400;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - PW / 2,
        top,
        width: PW,
        height: PH,
        opacity: p,
        transform: `perspective(1600px) rotateX(${(1 - p) * 30}deg) translateY(${(1 - p) * 80}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          background:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0) 4px), linear-gradient(115deg, #7d5f1c 0%, #c9a246 22%, #f3dc98 40%, #d2ad52 55%, #9c7726 78%, #c8a043 100%)',
          boxShadow: 'inset 0 2px 0 rgba(255,250,225,0.65), inset 0 -4px 0 rgba(60,40,5,0.45), 0 50px 90px rgba(0,0,0,0.7), 0 0 60px rgba(212,175,55,0.18)',
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

const Visit: React.FC<SceneProps> = ({frame, cue}) => {
  const online = cue('online');
  const visit = cue('visit');
  const counter = cue('counter');
  const west = cue('West');
  const street = cue('Street');
  const away = prog(frame, visit - 14, 40, EASE.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={cue('Explore') - 10} out={visit - 16}>
          Explore gold &amp; silver
        </Eyebrow>
        <MaskLine frame={frame} at={online - 8} out={visit - 16} style={{marginTop: 24}}>
          <div style={serif(168, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={online + 20}>
              Online.
            </Metal>
          </div>
        </MaskLine>
      </div>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('or') - 4} style={{opacity: away}}>
          <div style={italic(92, {color: C.champagne})}>or</div>
        </Rise>
        <Rise frame={frame} at={visit - 4}>
          <div style={serif(150, {lineHeight: 1.02})}>
            <Metal frame={frame} sheenAt={visit + 24}>
              in person.
            </Metal>
          </div>
        </Rise>
      </div>
      <Phone
        frame={frame}
        x={mix(540, 120, away)}
        y={1010}
        turn={mix(-12, -70, away) + Math.sin(frame / 60) * 3}
        scale={0.9}
        opacity={prog(frame, 0, 30) * (1 - away)}
        scroll={prog(frame, cue('silver'), 120, EASE.inOut) * 60}
        items={[
          {src: 'bar-clover-front.png', label: 'Gold bars', at: cue('gold') - 6},
          {src: 'coin-gold-eagle.png', label: 'Gold coins', at: cue('gold') + 4},
          {src: 'bar-silver-liberty.png', label: 'Silver bars', at: cue('silver') - 6},
          {src: 'coin-silver-eagle.png', label: 'Silver coins', at: cue('silver') + 4},
        ]}
      />
      <Plaque frame={frame} at={counter - 10} glint={cue('fortyseventh')} />
      <Pin frame={frame} at={west - 10} x={540} y={700} size={0.8} />
      <div style={{position: 'absolute', top: 1232, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={street - 14} color={C.mute}>
          New York, NY 10036
        </Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

// ——— People: real products, a real place, a team you can talk to ———

const Waveform: React.FC<{frame: number; at: number}> = ({frame, at}) => {
  const p = prog(frame, at, 30);
  return (
    <div
      style={{
        position: 'absolute',
        left: 190,
        right: 190,
        top: 900,
        height: 220,
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        background: 'linear-gradient(180deg, rgba(40,32,16,0.6), rgba(14,12,8,0.6))',
        boxShadow: 'inset 0 0 0 1.5px rgba(212,175,55,0.5), 0 30px 70px rgba(0,0,0,0.6)',
        opacity: p,
        scale: String(mix(0.92, 1, p)),
      }}
    >
      {Array.from({length: 36}, (_, i) => {
        const env = Math.sin((i / 35) * Math.PI);
        const h = 12 + env * 110 * (0.35 + 0.65 * Math.abs(Math.sin(frame / 5 + i * 0.7) * Math.sin(frame / 11 + i * 0.3)));
        return <div key={i} style={{width: 6, height: h * p, borderRadius: 3, background: 'linear-gradient(180deg, #f6e3a1, #b8902f)'}} />;
      })}
    </div>
  );
};

const People: React.FC<SceneProps> = ({frame, cue}) => {
  const products = cue('products');
  const place = cue('place');
  const team = cue('team');
  const talk = cue('talk');
  const beat2 = cue('real', 1) - 10;
  const beat3 = team - 12;
  const out1 = prog(frame, beat2 - 6, 16, EASE.in);
  const in2 = prog(frame, beat2, 24);
  const out2 = prog(frame, beat3 - 6, 16, EASE.in);
  const in3 = prog(frame, beat3, 24);
  const headline = (a: string, b: string, at: number, at2: number, out?: number, size = 170) => (
    <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
      <Rise frame={frame} at={at} out={out}>
        <div style={serif(132)}>{a}</div>
      </Rise>
      <Rise frame={frame} at={at2} out={out}>
        <div style={italic(size, {lineHeight: 1.04})}>
          <Metal frame={frame} sheenAt={at2 + 24}>
            {b}
          </Metal>
        </div>
      </Rise>
    </div>
  );
  return (
    <AbsoluteFill>
      {headline('Real', 'products.', cue('Real') - 8, products - 6, beat2 - 8)}
      {headline('A real', 'place.', beat2, place - 6, beat3 - 8)}
      {headline('A team', 'you can talk to.', beat3, talk - 8, undefined, 146)}

      <div style={{opacity: 1 - out1, filter: out1 > 0 ? `blur(${out1 * 10}px)` : undefined}}>
        <Product src="bar-justice-obv.png" frame={frame} w={660} h={533} x={540} y={mix(1120, 1010, prog(frame, 0, 50, EASE.silk))} float={6} sheen={[products]} glow="rgba(214,168,74,0.3)" />
      </div>
      <div style={{opacity: in2 * (1 - out2), filter: out2 > 0 ? `blur(${out2 * 10}px)` : undefined}}>
        <Skyline frame={frame} at={beat2 - 70} y={760} opacity={0.75} />
        <Pin frame={frame} at={place - 8} x={540} y={1060} size={1.2} />
        <div style={{position: 'absolute', top: 1260, left: 0, right: 0}}>
          <Eyebrow frame={frame} at={place} color={C.mute}>
            20 West 47th Street
          </Eyebrow>
        </div>
      </div>
      <div style={{opacity: in3}}>
        <Waveform frame={frame} at={beat3 + 4} />
        <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', ...caps(19, {color: C.mute}), opacity: prog(frame, talk, 20)}}>
          Real people · New York
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="Meet your New York dealer"
    footer="20 West 47th Street · New York"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product src="card-justice.png" frame={frame} w={300} h={456} x={mix(400, 420, p)} y={900} rotate={-6} opacity={p} float={5} sheen={[40]} glow="rgba(214,168,74,0.2)" />
          <Product src="bar-silver-liberty.png" frame={frame} w={250} h={427} x={mix(680, 660, p)} y={920} rotate={7} opacity={prog(frame, 8, 40)} float={5} floatPhase={1.3} sheen={[56]} />
        </>
      );
    }}
  />
);

export const NEW_YORK_SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  heritage: Heritage,
  visit: Visit,
  people: People,
  cta: Cta,
};
