import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {EndCard} from '../../marketing-premium/kit/EndCard';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps, Eyebrow, italic, Metal, Rise, serif} from '../../marketing-premium/kit/Text';
import {C, EASE, mix, prog, SANS, type SceneProps} from '../../marketing-premium/kit/theme';
import {AnswerLabel, QuestionScene} from '../faq-kit';
import {Bracket, Glass, LiveDot, trace} from './Premium-parts';

// FAQ 04 — How much over spot should you really pay? There is no fixed
// premium: it moves through the day with competition, inventory and supply
// and demand, so compare reputable dealers on the exact product, right now.

const Headline: React.FC<{frame: number; a: string; b: string; atA: number; atB: number; out?: number; sizeA?: number; sizeB?: number; top?: number}> = ({
  frame,
  a,
  b,
  atA,
  atB,
  out,
  sizeA = 112,
  sizeB = 118,
  top = 330,
}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center'}}>
    <Rise frame={frame} at={atA} out={out}>
      <div style={serif(sizeA)}>{a}</div>
    </Rise>
    <Rise frame={frame} at={atB} out={out}>
      <div style={italic(sizeB, {lineHeight: 1.06})}>
        <Metal frame={frame} sheenAt={atB + 24}>
          {b}
        </Metal>
      </div>
    </Rise>
  </div>
);

const Question: React.FC<SceneProps> = (props) => <QuestionScene {...props} number="04" lines={['How much over spot', 'should you really pay', 'for gold?']} />;

// ——— There's no fixed premium: it breathes through the day ———

const Answer: React.FC<SceneProps> = ({frame, duration, cue}) => {
  const day = prog(frame, 0, duration, EASE.inOut);
  const angle = Math.PI * (1 - day);
  const R = 360;
  const cx = 540;
  const horizon = 1290;
  const sx = cx + Math.cos(angle) * R;
  const sy = horizon - Math.sin(angle) * R * 0.75;
  const spotY = 1180;
  const breathe = 130 + 60 * Math.sin(frame / 22) + 26 * Math.sin(frame / 9.5);
  const show = prog(frame, 6, 30);
  const moon = prog(frame, duration * 0.62, duration * 0.3);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0}}>
        <AnswerLabel frame={frame} number="04" at={0} />
      </div>
      <Headline frame={frame} a="There's no fixed" b="premium." atA={cue('no') - 8} atB={cue('premium') - 8} top={350} />
      <div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('change') - 8}>
          <div style={italic(54, {color: C.champagne})}>It can change throughout the day.</div>
        </Rise>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: show}}>
        <defs>
          <radialGradient id="faq4-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff4cf" />
            <stop offset="0.35" stopColor="#f0c65a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#f0c65a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="faq4-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#f4f7fa" />
            <stop offset="0.35" stopColor="#c9d2db" stopOpacity="0.85" />
            <stop offset="1" stopColor="#c9d2db" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="faq4-band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e2c46c" stopOpacity="0.38" />
            <stop offset="1" stopColor="#e2c46c" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {/* Sun path */}
        <path d={`M${cx - R} ${horizon} A${R} ${R * 0.75} 0 0 1 ${cx + R} ${horizon}`} fill="none" stroke="rgba(226,196,108,0.25)" strokeWidth={1.5} strokeDasharray="4 10" />
        <circle cx={sx} cy={sy} r={70} fill="url(#faq4-sun)" opacity={1 - moon} />
        <circle cx={sx} cy={sy} r={60} fill="url(#faq4-moon)" opacity={moon} />
        <line x1={80} x2={1000} y1={horizon} y2={horizon} stroke="rgba(244,238,223,0.18)" strokeWidth={1.5} />
        {/* Premium band riding above spot */}
        <rect x={150} y={spotY - breathe} width={700} height={breathe} fill="url(#faq4-band)" />
        <line x1={150} x2={850} y1={spotY - breathe} y2={spotY - breathe} stroke="#e2c46c" strokeWidth={2} strokeDasharray="10 8" />
        <line x1={150} x2={850} y1={spotY} y2={spotY} stroke="#f0d27a" strokeWidth={3.5} style={{filter: 'drop-shadow(0 0 8px rgba(240,210,122,0.7))'}} />
      </svg>
      <div style={{position: 'absolute', left: 150, top: spotY + 14, ...caps(20, {color: C.champagne}), opacity: show}}>Spot</div>
      <Bracket x={862} top={spotY - breathe} bottom={spotY} opacity={show} />
      {['Morning', 'Midday', 'Evening'].map((label, i) => (
        <div key={label} style={{position: 'absolute', top: horizon + 18, left: 160 + i * 300, width: 160, textAlign: 'center', ...caps(17, {color: C.mute}), opacity: show}}>
          {label}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ——— We compare the whole market ———

const DEALERS = [
  {label: 'Dealer A', w: 0.62},
  {label: 'Dealer B', w: 0.47},
  {label: 'Dealer C', w: 0.71},
];

const Compare: React.FC<SceneProps> = ({frame, cue}) => {
  const compare = cue('compare');
  const adjust = cue('adjust');
  const scan = ((Math.max(0, frame - compare) % 90) / 90) * (1 - prog(frame, adjust, 20));
  const settle = prog(frame, adjust - 4, 50, EASE.inOut);
  const ours = mix(0.82, 0.52, settle);
  const chips = [
    {label: 'Competition', at: cue('competition')},
    {label: 'Inventory', at: cue('inventory')},
    {label: 'Supply & demand', at: cue('supply')},
  ];
  const rows = [...DEALERS.map((d) => ({...d, ours: false})), {label: 'Bullion Trading', w: ours, ours: true}];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={0}>
          How we price
        </Eyebrow>
      </div>
      <Headline frame={frame} a="We compare" b="the whole market." atA={compare - 8} atB={cue('market') - 10} top={340} />
      <Glass x={90} y={700} w={900} h={470} opacity={prog(frame, compare - 4, 30)} lit={settle}>
        <div style={{position: 'absolute', left: 36, right: 36, top: 26, display: 'flex', alignItems: 'center', gap: 14}}>
          <LiveDot frame={frame} />
          <span style={caps(19)}>Market scan · same product</span>
          <span style={{marginLeft: 'auto', ...caps(17, {color: C.mute})}}>Premium over spot</span>
        </div>
        {rows.map((row, i) => {
          const y = 98 + i * 88;
          const p = prog(frame, compare + i * 7, 26);
          const shimmer = ((frame * 1.8 + i * 40) % 220) - 60;
          return (
            <div key={row.label} style={{position: 'absolute', left: 36, right: 36, top: y, height: 64, display: 'flex', alignItems: 'center', gap: 24, opacity: p}}>
              <div
                style={{
                  width: 230,
                  fontFamily: SANS,
                  fontSize: 26,
                  fontWeight: row.ours ? 600 : 500,
                  color: row.ours ? '#f6e3a1' : C.ivory,
                }}
              >
                {row.label}
              </div>
              <div style={{flex: 1, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden'}}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${row.w * 100 * p}%`,
                    borderRadius: 7,
                    background: row.ours
                      ? `linear-gradient(90deg, #8a6a1f, #e2c46c ${Math.max(0, shimmer - 10)}%, #fff2c4 ${shimmer}%, #e2c46c ${shimmer + 10}%, #b8902f)`
                      : `linear-gradient(90deg, rgba(244,238,223,0.25), rgba(244,238,223,0.55) ${shimmer}%, rgba(244,238,223,0.25))`,
                    boxShadow: row.ours ? '0 0 16px rgba(226,196,108,0.55)' : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 88 + scan * 360,
            height: 70,
            background: 'linear-gradient(180deg, rgba(226,196,108,0), rgba(226,196,108,0.12), rgba(226,196,108,0))',
            opacity: scan > 0 ? 1 : 0,
          }}
        />
      </Glass>
      <div style={{position: 'absolute', top: 1232, left: 60, right: 60, display: 'flex', justifyContent: 'center', gap: 18}}>
        {chips.map((chip) => {
          const lit = prog(frame, chip.at - 6, 18);
          return (
            <div
              key={chip.label}
              style={{
                padding: '14px 26px',
                borderRadius: 999,
                border: `1.5px solid rgba(226,196,108,${0.25 + lit * 0.6})`,
                background: `rgba(226,196,108,${lit * 0.14})`,
                boxShadow: `0 0 ${lit * 26}px rgba(226,196,108,${lit * 0.35})`,
                opacity: 0.35 + lit * 0.65,
                translate: `0 ${(1 - lit) * 10}px`,
                ...caps(19, {color: lit > 0.5 ? '#f6e3a1' : C.mute, letterSpacing: '0.22em'}),
              }}
            >
              {chip.label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ——— Example: the same item, three premiums in one day ———

const SCALE = 3.9; // px per dollar of premium
const BASE = 1230;

const Column: React.FC<{frame: number; x: number; at: number; amount: number; extra?: number; extraAt?: number; when: string; whenAt: number; icon: 'sun' | 'half' | 'moon'}> = ({
  frame,
  x,
  at,
  amount,
  extra = 0,
  extraAt = 0,
  when,
  whenAt,
  icon,
}) => {
  const grow = prog(frame, at - 6, 40, EASE.out);
  const more = extra ? prog(frame, extraAt - 4, 30, EASE.out) : 0;
  const h = amount * SCALE * grow;
  const hx = extra * SCALE * more;
  const w = 150;
  const top = BASE - h - hx;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x - w / 2,
          top: BASE - h,
          width: w,
          height: h,
          borderRadius: '12px 12px 0 0',
          background: 'linear-gradient(180deg, #f6e3a1 0%, #d4af37 35%, #8a6a1f 100%)',
          boxShadow: '0 0 30px rgba(226,196,108,0.35), inset 0 1px 0 rgba(255,250,225,0.7)',
        }}
      />
      {hx > 0.5 ? (
        <div
          style={{
            position: 'absolute',
            left: x - w / 2,
            top: BASE - h - hx,
            width: w,
            height: hx,
            borderRadius: '12px 12px 0 0',
            background: 'repeating-linear-gradient(135deg, rgba(226,196,108,0.55) 0 8px, rgba(226,196,108,0.15) 8px 16px)',
            boxShadow: 'inset 0 0 0 1.5px rgba(226,196,108,0.8)',
          }}
        />
      ) : null}
      <div style={{position: 'absolute', left: x - 160, width: 320, top: top - 96, textAlign: 'center', opacity: grow}}>
        <span style={serif(76, {fontVariantNumeric: 'lining-nums'})}>
          <Metal frame={frame} sheenAt={at + 10}>
            {extra && more > 0.5 ? `+$${amount}–${amount + extra}` : `+$${amount}`}
          </Metal>
        </span>
      </div>
      <div style={{position: 'absolute', left: x - 115, width: 230, top: BASE + 26, textAlign: 'center', opacity: prog(frame, whenAt - 8, 20)}}>
        <svg width={34} height={34} viewBox="-17 -17 34 34" style={{display: 'block', margin: '0 auto 10px'}}>
          {icon === 'moon' ? (
            <path d="M6 -12 A13 13 0 1 0 6 12 A10 10 0 1 1 6 -12 Z" fill="#c9d2db" />
          ) : (
            <>
              <circle r={icon === 'half' ? 8 : 9} fill={icon === 'half' ? '#f0c65a' : '#f6e3a1'} />
              {Array.from({length: 8}, (_, k) => {
                const a = (k / 8) * Math.PI * 2;
                return <line key={k} x1={Math.cos(a) * 12} y1={Math.sin(a) * 12} x2={Math.cos(a) * 16} y2={Math.sin(a) * 16} stroke="#f0c65a" strokeWidth={2} strokeLinecap="round" />;
              })}
            </>
          )}
        </svg>
        <div style={caps(18, {color: C.champagne, letterSpacing: '0.2em', lineHeight: 1.5})}>{when}</div>
      </div>
    </>
  );
};

const Example: React.FC<SceneProps> = ({frame, cue}) => {
  const fifty = cue('50');
  const thirty = cue('30');
  const eighty = cue('80');
  const ninety = cue('90');
  const base = prog(frame, 0, 30);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={0}>
          Example · same item, same day
        </Eyebrow>
      </div>
      <Headline frame={frame} a="The same item," b="different premiums." atA={cue('same') - 8} atB={fifty - 10} sizeB={104} top={340} />
      <Product src="premium-3/bar-pamp-1oz.png" frame={frame} w={92} h={152} x={150} y={BASE - 84} opacity={base} float={3} sheen={[fifty, thirty, eighty]} shadow="drop" />
      <div style={{position: 'absolute', left: 80, right: 80, top: BASE, height: 3, background: '#f0d27a', boxShadow: '0 0 12px rgba(240,210,122,0.7)', transform: `scaleX(${base})`, transformOrigin: 'left'}} />
      <div style={{position: 'absolute', left: 80, top: BASE + 18, ...caps(18, {color: C.champagne}), opacity: base}}>Spot</div>
      <Column frame={frame} x={360} at={fifty} amount={50} when="Morning" whenAt={cue('morning')} icon="sun" />
      <Column frame={frame} x={620} at={thirty} amount={30} when="A few hours later" whenAt={cue('hours')} icon="half" />
      <Column frame={frame} x={880} at={eighty} amount={80} extra={10} extraAt={ninety} when="Later that day" whenAt={cue('later', 1)} icon="moon" />
    </AbsoluteFill>
  );
};

// ——— Plenty of stock: premiums can drop ———

const Inventory: React.FC<SceneProps> = ({frame, cue}) => {
  const plenty = cue('plenty');
  const eagles = cue('GoldEagles');
  const bars = cue('oneounce');
  const drop = cue('drop');
  const gauge = mix(0.82, 0.34, prog(frame, drop - 4, 40, EASE.inOut));
  const gaugeIn = prog(frame, cue('premium') - 14, 24);
  return (
    <AbsoluteFill>
      <Headline frame={frame} a="Plenty in stock?" b="Premiums can drop." atA={plenty - 10} atB={drop - 14} sizeA={108} sizeB={110} top={300} />
      {/* Premium gauge */}
      <div style={{position: 'absolute', left: 190, right: 190, top: 590, opacity: gaugeIn}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
          <span style={caps(19)}>Premium</span>
          <span style={{...caps(19, {color: '#f6e3a1'}), opacity: prog(frame, drop, 20)}}>↓ to move inventory</span>
        </div>
        <div style={{marginTop: 14, height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.07)', overflow: 'hidden'}}>
          <div style={{width: `${gauge * 100}%`, height: '100%', borderRadius: 9, background: 'linear-gradient(90deg, #8a6a1f, #e2c46c, #f6e3a1)', boxShadow: '0 0 18px rgba(226,196,108,0.6)'}} />
        </div>
      </div>
      {/* A stack of Gold Eagles */}
      {Array.from({length: 9}, (_, i) => {
        const at = eagles - 10 + i * 4;
        const p = prog(frame, at, 18, EASE.out);
        return (
          <Coin
            key={`e${i}`}
            src="coin-gold-eagle.png"
            frame={frame}
            d={250}
            x={330}
            y={mix(1080, 1230 - i * 26, p)}
            tilt={72}
            opacity={Math.min(1, p * 2)}
            shadow={i === 0}
            sheen={i === 8 ? [drop] : []}
          />
        );
      })}
      {/* And a fan of one-ounce bars */}
      {Array.from({length: 6}, (_, i) => {
        const at = bars - 10 + i * 5;
        const p = prog(frame, at, 22, EASE.out);
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <Product
            key={`b${i}`}
            src="premium-3/bar-pamp-1oz.png"
            frame={frame}
            w={124}
            h={205}
            x={640 + col * 120 + row * 40}
            y={mix(1000, 1110 + row * 70, p)}
            rotate={-10 + col * 8}
            opacity={Math.min(1, p * 2)}
            sheen={i === 5 ? [drop + 6] : []}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ——— Not a permanent markup: the market sets it ———

const Market: React.FC<SceneProps> = ({frame, cue}) => {
  const permanent = cue('permanent');
  const markup = cue('markup');
  const market = cue('market');
  const strike = prog(frame, markup - 2, 18, EASE.inOut);
  const fall = prog(frame, market - 10, 34, EASE.in);
  const traces = prog(frame, market - 8, 60, EASE.silk);
  const swing = Math.sin(frame / 18) * 5 * (1 - fall);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={permanent - 10} out={market - 12}>
          <div style={serif(108)}>Not a permanent</div>
          <div style={italic(118, {color: C.champagne})}>markup.</div>
        </Rise>
      </div>
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={market - 4}>
          <div style={serif(112)}>The market</div>
        </Rise>
        <Rise frame={frame} at={cue('sets') - 8}>
          <div style={italic(122, {lineHeight: 1.06})}>
            <Metal frame={frame} sheenAt={cue('sets') + 10}>
              sets it.
            </Metal>
          </div>
        </Rise>
      </div>
      {/* Live traces sweep in once the tag falls */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: traces}}>
        {[
          {seed: 'mk-a', y: 780, color: '#e2c46c'},
          {seed: 'mk-b', y: 930, color: '#c9d2db'},
          {seed: 'mk-c', y: 1080, color: '#d9c79b'},
        ].map((t) => {
          const values = trace(t.seed, 80, frame, 0.8);
          const shown = values.slice(0, Math.max(2, Math.round(traces * values.length)));
          const d = shown.map((v, i) => `${i ? 'L' : 'M'}${(80 + (i / 79) * 920).toFixed(1)} ${(t.y + (v - 0.5) * 260).toFixed(1)}`).join(' ');
          return <path key={t.seed} d={d} fill="none" stroke={t.color} strokeWidth={3} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 8px ${t.color})`}} />;
        })}
      </svg>
      {/* The price tag */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 230,
          top: 760 + fall * 700,
          width: 460,
          height: 260,
          rotate: `${-4 + swing + fall * 28}deg`,
          transformOrigin: '50% -120px',
          opacity: prog(frame, permanent - 14, 20) * (1 - fall),
        }}
      >
        <svg width={460} height={380} viewBox="0 -120 460 380" style={{position: 'absolute', left: 0, top: -120, overflow: 'visible'}}>
          <path d="M230 -120 L230 18" stroke="rgba(244,238,223,0.6)" strokeWidth={2} />
          <path d="M60 30 L230 0 L400 30 L420 240 L40 240 Z" fill="#efe6cf" stroke="#c8b78e" strokeWidth={2} />
          <circle cx={230} cy={34} r={11} fill="#0b0b0e" stroke="#b8a77e" strokeWidth={2} />
        </svg>
        <div style={{position: 'absolute', left: 50, right: 50, top: 70, textAlign: 'center'}}>
          <div style={{...caps(18, {color: '#7a6a45'}), marginBottom: 10}}>Price tag</div>
          <div style={serif(56, {color: '#2a2418', lineHeight: 1.05})}>Permanent markup</div>
        </div>
        <svg width={460} height={260} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <line x1={60} y1={150} x2={60 + 340 * strike} y2={150 - 30 * strike} stroke="#b33a2a" strokeWidth={8} strokeLinecap="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ——— How to judge a premium ———

const Tip: React.FC<SceneProps> = ({frame, cue}) => {
  const compare = cue('compare');
  const items = [
    {label: 'Reputable dealers', at: cue('reputable')},
    {label: 'That exact product', at: cue('exact')},
    {label: 'At that moment', at: cue('moment')},
  ];
  return (
    <AbsoluteFill>
      <Headline frame={frame} a="To judge a premium," b="compare." atA={cue('judge') - 10} atB={compare - 8} sizeA={104} sizeB={130} top={320} />
      <Glass x={130} y={720} w={820} h={470} opacity={prog(frame, compare - 6, 26)} lit={prog(frame, items[2].at, 30)}>
        {items.map((item, i) => {
          const tick = prog(frame, item.at - 4, 20, EASE.out);
          const show = prog(frame, compare + i * 8, 24);
          return (
            <div key={item.label} style={{position: 'absolute', left: 56, right: 56, top: 70 + i * 128, display: 'flex', alignItems: 'center', gap: 34, opacity: show}}>
              <svg width={70} height={70} viewBox="0 0 70 70">
                <circle cx={35} cy={35} r={31} fill={`rgba(226,196,108,${tick * 0.16})`} stroke="#e2c46c" strokeOpacity={0.35 + tick * 0.65} strokeWidth={2.5} />
                <path d="M21 36 L31 46 L50 25" fill="none" stroke="#f6e3a1" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
              </svg>
              <div style={italic(64, {color: tick > 0.5 ? C.ivory : 'rgba(244,238,223,0.45)', lineHeight: 1})}>{item.label}</div>
            </div>
          );
        })}
      </Glass>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="Priced live from spot"
    footer="Compare us any time · bulliontradingllc.com"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product src="bar-justice-obv.png" frame={frame} w={540} h={437} x={500} y={mix(950, 900, p)} opacity={p} float={6} sheen={[50]} glow="rgba(214,168,74,0.25)" />
          <Coin src="coin-gold-eagle.png" frame={frame} d={250} x={mix(880, 790, p)} y={1030} turn={mix(-90, -16, prog(frame, 8, 60))} roll={-6} opacity={prog(frame, 8, 30)} sheen={[70]} />
        </>
      );
    }}
  />
);

export const PREMIUM_FAQ_SCENES: Record<string, React.FC<SceneProps>> = {
  question: Question,
  answer: Answer,
  compare: Compare,
  example: Example,
  inventory: Inventory,
  market: Market,
  tip: Tip,
  cta: Cta,
};

