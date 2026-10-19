import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {EndCard} from '../../marketing-premium/kit/EndCard';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps, Eyebrow, italic, Metal, Rise, serif} from '../../marketing-premium/kit/Text';
import {C, EASE, mix, prog, SANS, type SceneProps} from '../../marketing-premium/kit/theme';
import {AnswerLabel, QuestionScene} from '../faq-kit';
import {Analyzer, Counter, Dial, Loupe, Scale, SenseIcons, Struck} from './SellInPerson-props';

// FAQ 02 — selling gold over the counter: inspect, verify and weigh, quote
// from spot, paid on the spot. Typically 3–6 minutes for a standard piece.

const P3 = (name: string) => `premium-3/${name}`;
const PAD_Y = 980;

const Headline: React.FC<{frame: number; a: string; b: string; atA: number; atB: number; sizeA?: number; sizeB?: number; top?: number}> = ({
  frame,
  a,
  b,
  atA,
  atB,
  sizeA = 112,
  sizeB = 140,
  top = 330,
}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center'}}>
    <Rise frame={frame} at={atA - 6}>
      <div style={serif(sizeA)}>{a}</div>
    </Rise>
    <Rise frame={frame} at={atB - 6}>
      <div style={italic(sizeB, {lineHeight: 1.04})}>
        <Metal frame={frame} sheenAt={atB + 18}>
          {b}
        </Metal>
      </div>
    </Rise>
  </div>
);

const Step: React.FC<{frame: number; text: string}> = ({frame, text}) => (
  <div style={{position: 'absolute', top: 268, left: 0, right: 0}}>
    <Eyebrow frame={frame} at={0}>
      {text}
    </Eyebrow>
  </div>
);

// The customer's pieces on the counter pad.
const Pieces: React.FC<{frame: number; barIn: number; coinIn: number; sheen?: number[]}> = ({frame, barIn, coinIn, sheen = []}) => (
  <>
    <Product
      src="bar-justice-obv.png"
      frame={frame}
      w={400}
      h={323}
      x={mix(120, 420, barIn)}
      y={PAD_Y - 10}
      rotate={mix(-14, -4, barIn)}
      opacity={Math.min(1, barIn * 2)}
      sheen={sheen}
    />
    <Coin
      src="coin-gold-eagle.png"
      frame={frame}
      d={230}
      x={mix(980, 720, coinIn)}
      y={PAD_Y + 10}
      tilt={50}
      turn={mix(-40, 0, coinIn)}
      opacity={Math.min(1, coinIn * 2)}
      sheen={sheen.map((s) => s + 6)}
    />
  </>
);

const Question: React.FC<SceneProps> = (props) => <QuestionScene {...props} number="02" lines={['What happens', 'when you sell gold', 'to a dealer', 'in person?']} size={100} />;

const Quick: React.FC<SceneProps> = ({frame, cue}) => {
  const bars = cue('bars');
  const coins = cue('coins');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 268, left: 0, right: 0}}>
        <AnswerLabel frame={frame} number="02" />
      </div>
      <Headline frame={frame} a="Common bars & coins?" b="It's quick." atA={cue('common')} atB={cue('quick')} sizeA={100} sizeB={150} />
      <Counter opacity={prog(frame, 0, 30)} padY={PAD_Y} />
      <Pieces frame={frame} barIn={prog(frame, bars - 10, 34, EASE.out)} coinIn={prog(frame, coins - 10, 34, EASE.out)} sheen={[cue('quick') + 4]} />
    </AbsoluteFill>
  );
};

const Look: React.FC<SceneProps> = ({frame, cue}) => {
  const inspection = cue('inspection');
  const know = cue('know');
  const scan = prog(frame, inspection, know - inspection + 20, EASE.inOut);
  const loupeOn = prog(frame, inspection - 8, 14) * (1 - prog(frame, know + 24, 16));
  return (
    <AbsoluteFill>
      <Step frame={frame} text="Step 1 · Inspect" />
      <Headline frame={frame} a="First, a" b="visual inspection." atA={cue('First')} atB={cue('visual')} sizeA={100} sizeB={128} />
      <div style={{position: 'absolute', top: 640, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={cue('buy') - 6} color={C.mute}>
          We buy &amp; sell bullion every day
        </Eyebrow>
      </div>
      <Counter opacity={1} padY={PAD_Y} />
      <Pieces frame={frame} barIn={1} coinIn={1} sheen={[cue('coins') - 4]} />
      <Loupe x={mix(330, 760, scan)} y={PAD_Y - 20 - Math.sin(scan * Math.PI) * 40} opacity={loupeOn} />
      <SenseIcons
        frame={frame}
        y={1190}
        items={[
          {key: 'look', label: 'Look', at: cue('look')},
          {key: 'feel', label: 'Feel', at: cue('feel')},
          {key: 'measure', label: 'Measure', at: cue('measure')},
        ]}
      />
    </AbsoluteFill>
  );
};

const Test: React.FC<SceneProps> = ({frame, cue}) => {
  const verify = cue('verify');
  const equipment = cue('equipment');
  const weigh = cue('weigh');
  const confirm = cue('confirm');
  const move = prog(frame, weigh - 12, 34, EASE.inOut);
  const land = prog(frame, 4, 26, EASE.out);
  const bx = mix(300, 790, move);
  const by = mix(mix(860, 906, land), 948, move) - Math.sin(move * Math.PI) * 110;
  return (
    <AbsoluteFill>
      <Step frame={frame} text="Step 2 · Verify & weigh" />
      <Headline frame={frame} a="Tested on our equipment," b="then weighed." atA={verify} atB={weigh} sizeA={86} sizeB={136} />
      <Analyzer frame={frame} x={300} y={1040} scanAt={verify + 6} doneAt={equipment + 26} opacity={prog(frame, 0, 24)} />
      <Scale frame={frame} x={790} y={1040} from={weigh + 22} settle={46} target={31.1} okAt={confirm + 4} opacity={prog(frame, 4, 24)} />
      <Product src={P3('bar-pamp-1oz.png')} frame={frame} w={92} h={152} x={bx} y={by} rotate={mix(0, 90, move)} opacity={land} sheen={[equipment + 26, confirm + 6]} glow="rgba(214,168,74,0.35)" />
      <div style={{position: 'absolute', top: 1340, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 260}}>
        <div style={caps(18, {opacity: prog(frame, equipment + 20, 20), color: C.champagne})}>Verified</div>
        <div style={caps(18, {opacity: prog(frame, confirm, 20), color: C.champagne})}>Weight confirmed</div>
      </div>
    </AbsoluteFill>
  );
};

// Illustrative live trace (no figures).
const TRACE = Array.from({length: 70}, (_, i) => 0.55 - 0.2 * Math.sin(i / 9) + 0.08 * Math.sin(i / 2.7) - i * 0.002);

const Quote: React.FC<SceneProps> = ({frame, cue}) => {
  const check = cue('check');
  const give = cue('give');
  const draw = prog(frame, check - 6, 80, EASE.silk);
  const pts = TRACE.slice(0, Math.max(2, Math.round(draw * TRACE.length))).map((v, i) => [40 + (i / (TRACE.length - 1)) * 780, 70 + v * 120] as const);
  const head = pts[pts.length - 1];
  const pulse = (frame % 50) / 50;
  const quoteIn = prog(frame, give - 8, 30, EASE.out);
  return (
    <AbsoluteFill>
      <Step frame={frame} text="Step 3 · Quote" />
      <Headline frame={frame} a="Current spot price," b="then our quote." atA={cue('current')} atB={give} sizeA={96} sizeB={130} />
      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          top: 700,
          height: 270,
          borderRadius: 28,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))',
          boxShadow: 'inset 0 0 0 1px rgba(255,240,210,0.12), 0 40px 80px rgba(0,0,0,0.5)',
          opacity: prog(frame, check - 10, 24),
          translate: `0 ${(1 - prog(frame, check - 10, 30)) * 40}px`,
        }}
      >
        <div style={{position: 'absolute', left: 36, top: 26, display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{width: 12, height: 12, borderRadius: '50%', background: '#e9c766', boxShadow: `0 0 0 ${pulse * 12}px rgba(233,199,102,${0.4 * (1 - pulse)})`}} />
          <span style={caps(17)}>Spot · Gold · Live</span>
        </div>
        <svg width={860} height={270} style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="sip-trace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d4af37" stopOpacity="0.3" />
              <stop offset="1" stopColor="#d4af37" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} L${head[0]} 250 L40 250 Z`} fill="url(#sip-trace)" />
          <path d={pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} fill="none" stroke="#e9c766" strokeWidth={3.5} style={{filter: 'drop-shadow(0 0 8px rgba(233,199,102,0.7))'}} />
          <circle cx={head[0]} cy={head[1]} r={7} fill="#fff4cf" />
          <circle cx={head[0]} cy={head[1]} r={7 + pulse * 22} fill="none" stroke="#e9c766" strokeOpacity={1 - pulse} strokeWidth={2} />
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          top: 1010,
          height: 300,
          borderRadius: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          padding: '0 48px',
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, rgba(40,32,16,0.8), rgba(14,12,8,0.8))',
          boxShadow: `inset 0 0 0 1.5px rgba(212,175,55,${0.4 + 0.3 * quoteIn}), 0 40px 80px rgba(0,0,0,0.6), 0 0 ${40 * quoteIn}px rgba(212,175,55,0.15)`,
          opacity: quoteIn,
          translate: `0 ${(1 - quoteIn) * 50}px`,
        }}
      >
        <div style={{position: 'relative', width: 130, height: 220}}>
          <Product src={P3('bar-pamp-1oz.png')} frame={frame} w={130} h={215} x={65} y={110} sheen={[give + 20]} />
        </div>
        <div style={{flex: 1}}>
          <div style={caps(18)}>Your quote</div>
          <div
            style={{
              marginTop: 22,
              height: 22,
              borderRadius: 11,
              background: `linear-gradient(90deg, rgba(212,175,55,0.2), rgba(255,236,180,0.85) ${((frame * 1.5) % 170) - 35}%, rgba(212,175,55,0.2))`,
            }}
          />
          <div style={{...caps(15, {color: C.mute}), marginTop: 22}}>Priced from the current spot</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PaidSeal: React.FC<{frame: number; at: number}> = ({frame, at}) => {
  const p = prog(frame, at - 4, 14, EASE.out);
  const R = 120;
  return (
    <div style={{position: 'absolute', left: 540 - R, top: 720, width: R * 2, height: R * 2, opacity: p, scale: String(mix(1.6, 1, p)), rotate: `${mix(-20, -6, p)}deg`}}>
      <svg width={R * 2} height={R * 2} viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} style={{overflow: 'visible', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.6))'}}>
        <defs>
          <radialGradient id="sip-seal" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#f6e3a1" />
            <stop offset="0.55" stopColor="#d4af37" />
            <stop offset="1" stopColor="#7a5a16" />
          </radialGradient>
        </defs>
        <circle r={R} fill="url(#sip-seal)" />
        <circle r={R - 12} fill="none" stroke="rgba(60,40,5,0.55)" strokeWidth={2} />
        <path d="M-40 4 L-12 32 L44 -28" fill="none" stroke="#3a2a0a" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        <text y={-58} textAnchor="middle" fill="#4a3610" fontFamily={SANS} fontWeight={700} fontSize={20} letterSpacing={5}>
          PAID
        </text>
        <text y={76} textAnchor="middle" fill="#4a3610" fontFamily={SANS} fontWeight={700} fontSize={16} letterSpacing={4}>
          ON THE SPOT
        </text>
      </svg>
    </div>
  );
};

const Pay: React.FC<SceneProps> = ({frame, cue}) => {
  const paid = cue('paid');
  return (
    <AbsoluteFill>
      <Step frame={frame} text="Step 4 · Payment" />
      <Headline frame={frame} a="Accept it," b="paid right away." atA={cue('Accept')} atB={paid} sizeA={104} sizeB={140} />
      <PaidSeal frame={frame} at={paid} />
      <div style={{position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
          <span style={caps(22, {color: C.champagne, opacity: prog(frame, cue('No') - 4, 20)})}>No</span>
          <Struck frame={frame} at={cue('No')} strikeAt={cue('testing')}>
            sending it off for testing
          </Struck>
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
          <span style={caps(22, {color: C.champagne, opacity: prog(frame, cue('No', 1) - 4, 20)})}>No</span>
          <Struck frame={frame} at={cue('No', 1)} strikeAt={cue('approval')}>
            lengthy approval
          </Struck>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const STEPS = ['Inspect', 'Verify', 'Quote', 'Paid'];

const Time: React.FC<SceneProps> = ({frame, cue}) => {
  const minutes = cue('minutes');
  const inspection = cue('inspection');
  const payment = cue('payment');
  const num = prog(frame, cue('36') - 6, 26, EASE.out);
  const fill = prog(frame, inspection - 6, payment - inspection + 12, EASE.inOut);
  const DX = 760;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={cue('standard') - 8}>
          A standard bar or coin
        </Eyebrow>
      </div>
      <Rise frame={frame} at={cue('typically') - 6} style={{position: 'absolute', top: 350, left: 0, right: 0, textAlign: 'center'}}>
        <div style={italic(84, {color: C.champagne})}>typically takes just</div>
      </Rise>
      <Dial frame={frame} x={540} y={870} r={250} at={cue('typically') - 10} bandAt={cue('36')} opacity={prog(frame, 0, 30)} />
      <div style={{position: 'absolute', top: 760, left: 0, right: 0, textAlign: 'center', opacity: num, scale: String(mix(0.85, 1, num))}}>
        <div style={serif(180, {lineHeight: 1})}>
          <Metal frame={frame} sheenAt={minutes + 6} glow="rgba(212,175,55,0.35)">
            3–6
          </Metal>
        </div>
        <div style={{...caps(26, {letterSpacing: '0.4em'}), opacity: prog(frame, minutes - 6, 20)}}>Minutes</div>
      </div>
      <svg width={1080} height={200} style={{position: 'absolute', left: 0, top: 1190, overflow: 'visible'}}>
        <line x1={160} x2={160 + DX} y1={60} y2={60} stroke="rgba(212,175,55,0.25)" strokeWidth={2} />
        <line x1={160} x2={160 + DX * fill} y1={60} y2={60} stroke="#e2c46c" strokeWidth={3} style={{filter: 'drop-shadow(0 0 8px rgba(226,196,108,0.8))'}} />
        {STEPS.map((label, i) => {
          const x = 160 + (DX * i) / (STEPS.length - 1);
          const on = fill >= i / (STEPS.length - 1) - 0.001 && fill > 0;
          return (
            <g key={label}>
              <circle cx={x} cy={60} r={on ? 15 : 10} fill={on ? '#e2c46c' : '#2a2418'} stroke="#e2c46c" strokeWidth={2} />
              <text x={x} y={114} textAnchor="middle" fill={on ? '#f4eedf' : 'rgba(244,238,223,0.4)'} fontFamily={SANS} fontSize={20} fontWeight={600} letterSpacing={4}>
                {label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', top: 1150, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 120px', opacity: prog(frame, inspection - 6, 20)}}>
        <span style={caps(16, {color: C.mute})}>Inspection</span>
        <span style={caps(16, {color: C.mute, opacity: prog(frame, payment - 6, 20)})}>Payment</span>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    lead="Sell it to"
    leadWord="Sell"
    eyebrow="Over the counter · New York"
    footer="20 W 47th St · Bring it in"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product src="bar-justice-obv.png" frame={frame} w={540} h={436} x={500} y={mix(950, 900, p)} opacity={p} float={6} sheen={[50]} glow="rgba(214,168,74,0.25)" />
          <Coin src="coin-gold-eagle.png" frame={frame} d={250} x={mix(880, 790, p)} y={1030} turn={mix(-90, -16, prog(frame, 8, 60))} roll={-6} opacity={prog(frame, 8, 30)} sheen={[70]} />
        </>
      );
    }}
  />
);

export const SELL_IN_PERSON_SCENES: Record<string, React.FC<SceneProps>> = {
  question: Question,
  quick: Quick,
  look: Look,
  test: Test,
  quote: Quote,
  pay: Pay,
  time: Time,
  cta: Cta,
};
