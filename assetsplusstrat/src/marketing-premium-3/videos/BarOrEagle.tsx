import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {EndCard} from '../../marketing-premium/kit/EndCard';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps, italic, Metal, Rise, serif} from '../../marketing-premium/kit/Text';
import {C, EASE, mix, prog, type SceneProps} from '../../marketing-premium/kit/theme';
import {AnswerLabel, QuestionScene} from '../faq-kit';
import {Balance, BALANCE_PANS} from './BarOrEagle-balance';

// FAQ 03 — "Is it better to buy a 1 oz gold bar or an American Gold Eagle?"
// The owner's answer: it depends, and preferences have shifted over time.

const N = '03';
const P3 = (name: string) => `premium-3/${name}`;

const Headline: React.FC<{frame: number; top?: number; line1: string; line2: string; at1: number; at2: number; out?: number; size?: number}> = ({
  frame,
  top = 340,
  line1,
  line2,
  at1,
  at2,
  out,
  size = 108,
}) => (
  <div style={{position: 'absolute', top, left: 40, right: 40, textAlign: 'center'}}>
    <Rise frame={frame} at={at1 - 6} out={out}>
      <div style={serif(size)}>{line1}</div>
    </Rise>
    <Rise frame={frame} at={at2 - 6} out={out}>
      <div style={italic(size * 1.08, {lineHeight: 1.08})}>
        <Metal frame={frame} sheenAt={at2 + 24}>
          {line2}
        </Metal>
      </div>
    </Rise>
  </div>
);

const Chip: React.FC<{frame: number; at: number; children: React.ReactNode; gold?: boolean; out?: number}> = ({frame, at, children, gold, out}) => {
  const p = prog(frame, at - 4, 24, EASE.out);
  const q = out === undefined ? 0 : prog(frame, out, 14, EASE.in);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '14px 26px 15px',
        borderRadius: 999,
        border: `1.5px solid ${gold ? 'rgba(212,175,55,0.75)' : 'rgba(244,238,223,0.28)'}`,
        background: gold ? 'linear-gradient(180deg, rgba(60,46,14,0.85), rgba(20,16,8,0.85))' : 'rgba(255,255,255,0.04)',
        boxShadow: gold ? '0 0 30px rgba(212,175,55,0.18)' : undefined,
        opacity: p * (1 - q),
        translate: `0 ${(1 - p) * 22}px`,
        scale: String(mix(0.9, 1, p)),
        filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
        ...caps(22, {color: gold ? C.goldLight : C.ivory, letterSpacing: '0.2em'}),
      }}
    >
      {children}
    </div>
  );
};

// ——— Q ———
const Question: React.FC<SceneProps> = (props) => (
  <QuestionScene {...props} number={N} lines={['Is it better to buy', 'a one-ounce gold bar, or', 'an American Gold Eagle?']} size={92} />
);

// ——— There's no single answer ———
const Answer: React.FC<SceneProps> = ({frame, cue}) => {
  const change = cue('change');
  const swing = 6 + 6 * prog(frame, change - 10, 30);
  const tilt = swing * Math.sin((frame - 10) / 20) * prog(frame, 0, 30);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 280, left: 0, right: 0}}>
        <AnswerLabel frame={frame} number={N} />
      </div>
      <Headline frame={frame} line1="No single answer." line2="Preferences change." at1={cue('no')} at2={cue('preferences')} />
      <Balance frame={frame} tilt={tilt} opacity={prog(frame, 0, 30)} sheen={[change]} />
    </AbsoluteFill>
  );
};

// ——— 30+ years ———
const Years: React.FC<SceneProps> = ({frame, cue}) => {
  const thirty = cue('thirty');
  const count = Math.round(30 * prog(frame, thirty - 26, 44, EASE.out));
  const watched = cue('watched');
  const draw = prog(frame, watched - 20, 50, EASE.inOut);
  const marks = [
    {x: 260, label: 'Coins', at: 0.15},
    {x: 540, label: 'Eagles', at: 0.5},
    {x: 820, label: 'Bars', at: 0.85},
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 280, left: 0, right: 0}}>
        <AnswerLabel frame={frame} number={N} text="Experience" />
      </div>
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('owner') - 6}>
          <div style={italic(84, {color: C.champagne})}>Our owner</div>
        </Rise>
      </div>
      <div style={{position: 'absolute', top: 500, left: 0, right: 0, textAlign: 'center', opacity: count > 0 ? prog(frame, thirty - 26, 10) : 0}}>
        <span style={serif(400, {lineHeight: 1, fontVariantNumeric: 'lining-nums tabular-nums'})}>
          <Metal frame={frame} sheenAt={cue('years') + 6} glow="rgba(212,175,55,0.35)">
            {count}
          </Metal>
          <span style={{display: 'inline-block', opacity: prog(frame, cue('years') - 4, 16)}}>
            <Metal frame={frame} sheenAt={cue('years') + 6} glow="rgba(212,175,55,0.35)">
              +
            </Metal>
          </span>
        </span>
      </div>
      <div style={{position: 'absolute', top: 940, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('precious') - 6}>
          <div style={italic(80)}>years in precious metals</div>
        </Rise>
      </div>
      <svg width={1080} height={300} style={{position: 'absolute', left: 0, top: 1110, overflow: 'visible'}}>
        <line x1={140} x2={940} y1={100} y2={100} stroke="rgba(244,238,223,0.12)" strokeWidth={2} />
        <line x1={140} x2={140 + 800 * draw} y1={100} y2={100} stroke="#d4af37" strokeWidth={2.5} style={{filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.7))'}} />
        {marks.map((m) => {
          const p = prog(frame, watched - 20 + m.at * 50, 16);
          return (
            <g key={m.label} opacity={p}>
              <circle cx={m.x} cy={100} r={9} fill="#f6e3a1" />
              <circle cx={m.x} cy={100} r={9 + (1 - p) * 20} fill="none" stroke="#f6e3a1" strokeOpacity={1 - p} />
              <text x={m.x} y={150} textAnchor="middle" fill={C.champagne} fontFamily="Inter" fontSize={22} fontWeight={500} letterSpacing={5}>
                {m.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ——— Years ago: government coins, especially the Maple Leaf ———
const GOV = [
  {src: 'coin-kangaroo.png', label: 'Kangaroo'},
  {src: 'coin-gold-eagle.png', label: 'Eagle'},
  {src: 'coin-maple.png', label: 'Maple Leaf'},
  {src: 'coin-krugerrand.png', label: 'Krugerrand'},
  {src: 'coin-britannia.png', label: 'Britannia'},
];

const Maple: React.FC<SceneProps> = ({frame, cue}) => {
  const gov = cue('government');
  const canadian = cue('Canadian');
  const spec = cue('24karat9999fine');
  const focus = prog(frame, canadian - 12, 60, EASE.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 280, left: 0, right: 0}}>
        <AnswerLabel frame={frame} number={N} text="Years ago" />
      </div>
      <Headline frame={frame} line1="Years ago," line2="government coins." at1={cue('Years')} at2={gov} />
      {GOV.map((c, i) => {
        const centre = i === 2;
        const enter = prog(frame, 10 + i * 6, 40, EASE.out);
        const baseX = 540 + (i - 2) * 196;
        const baseY = 1000 + Math.abs(i - 2) * 26;
        if (centre) {
          return (
            <Coin
              key={c.src}
              src={c.src}
              frame={frame}
              d={mix(220, 540, focus)}
              x={540}
              y={mix(baseY, 940, focus)}
              turn={focus > 0 ? (1 - focus) * 360 : Math.sin(frame / 40) * 14}
              opacity={enter}
              sheen={[gov + 8, spec + 4]}
              glow={focus > 0.5 ? 'rgba(212,175,55,0.25)' : undefined}
            />
          );
        }
        return (
          <Coin
            key={c.src}
            src={c.src}
            frame={frame}
            d={200}
            x={baseX + (baseX - 540) * focus * 0.9}
            y={baseY + Math.sin(frame / 36 + i) * 6}
            turn={Math.sin(frame / 40 + i) * 18}
            opacity={enter * (1 - focus * 0.85)}
            blur={focus * 6}
            sheen={[gov + 8 + i * 3]}
          />
        );
      })}
      <div style={{position: 'absolute', top: 1238, left: 0, right: 0, textAlign: 'center', opacity: prog(frame, gov - 4, 20) * (1 - focus), ...caps(22, {color: C.champagne})}}>
        Government-minted coins
      </div>
      <div style={{position: 'absolute', top: 1238, left: 0, right: 0, textAlign: 'center', opacity: prog(frame, canadian + 10, 24), ...caps(22, {color: C.champagne})}}>
        Canadian Gold Maple Leaf
      </div>
      <div style={{position: 'absolute', top: 1300, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22}}>
        <Chip frame={frame} at={spec} gold>
          24 K
        </Chip>
        <Chip frame={frame} at={spec + 14} gold>
          .9999 fine
        </Chip>
      </div>
    </AbsoluteFill>
  );
};

// ——— Then, the American Gold Eagle ———
const Eagle: React.FC<SceneProps> = ({frame, cue}) => {
  const american = cue('American');
  const alloy = cue('alloy');
  const harder = cue('harder');
  const scratch = cue('scratchresistant');
  const troy = cue('troy');
  const enter = prog(frame, american - 16, 70, EASE.out);
  const exit = prog(frame, american - 30, 44, EASE.inOut);
  const stylus = prog(frame, scratch - 14, 34, EASE.inOut);
  const R = 260;
  const cx = 540;
  const cy = 930;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 280, left: 0, right: 0}}>
        <AnswerLabel frame={frame} number={N} text="Then" />
      </div>
      <Headline frame={frame} line1="Then many moved" line2="to the Gold Eagle." at1={cue('moved')} at2={american} />
      {/* The Maple Leaf steps aside */}
      <Coin src="coin-maple.png" frame={frame} d={mix(540, 240, exit)} x={mix(540, -160, exit)} y={mix(940, 1000, exit)} turn={exit * 70} opacity={1 - exit} />
      <Coin
        src={P3('coin-eagle-liberty.png')}
        back="coin-gold-eagle.png"
        frame={frame}
        d={2 * R}
        x={cx}
        y={cy}
        turn={(1 - enter) * 540 + Math.sin(frame / 50) * 10 * enter}
        opacity={Math.min(1, enter * 2)}
        sheen={[harder, troy + 6]}
        glow="rgba(212,175,55,0.22)"
      />
      {/* A diamond stylus glances off the surface: no mark left */}
      {stylus > 0 && stylus < 1 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {(() => {
            const x = cx - R * 0.8 + stylus * R * 1.6;
            const y = cy - R * 0.45 + stylus * R * 0.9;
            return (
              <g>
                <line x1={x} y1={y} x2={x + 140} y2={y - 260} stroke="#cfd6dd" strokeWidth={6} strokeLinecap="round" />
                <line x1={x} y1={y} x2={x + 140} y2={y - 260} stroke="#ffffff" strokeWidth={2} strokeOpacity={0.7} />
                <circle cx={x} cy={y} r={7} fill="#ffffff" />
                <circle cx={x} cy={y} r={18 + Math.sin(frame) * 3} fill="rgba(255,255,255,0.25)" />
                <path d={`M${x - 26} ${y} H${x + 26} M${x} ${y - 26} V${y + 26}`} stroke="#fff" strokeWidth={1.5} opacity={0.8} />
              </g>
            );
          })()}
        </svg>
      ) : null}
      <div style={{position: 'absolute', top: 1222, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16}}>
        <Chip frame={frame} at={alloy} gold>
          22 K alloy
        </Chip>
        <Chip frame={frame} at={harder}>
          Harder
        </Chip>
        <Chip frame={frame} at={scratch}>
          Scratch-resistant
        </Chip>
      </div>
      <div style={{position: 'absolute', top: 1318, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={troy - 6}>
          <span style={italic(72)}>
            <Metal frame={frame} sheenAt={cue('gold', 1)}>
              1 troy oz of gold
            </Metal>
          </span>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

// ——— Lately: 1 oz bars overtook coins, plus gram bars ———
const coinsCurve = (t: number) => 0.66 - 0.22 * t + 0.03 * Math.sin(9 * t);
const barsCurve = (t: number) => 0.2 + 0.55 * t * t + 0.015 * Math.sin(11 * t + 1);
const CROSS = (() => {
  for (let t = 0; t <= 1; t += 0.002) {
    if (barsCurve(t) >= coinsCurve(t)) {
      return t;
    }
  }
  return 0.6;
})();

const PW = 880;
const PH = 420;
const px = (t: number) => 60 + t * (PW - 160);
const py = (v: number) => PH - 50 - v * (PH - 110);

const LADDER = [
  {src: P3('card-fortuna-1g.png'), label: '1 g'},
  {src: P3('card-fortuna-2-5g.png'), label: '2.5 g'},
  {src: P3('card-fortuna-5g.png'), label: '5 g'},
  {src: P3('card-fortuna-10g.png'), label: '10 g'},
  {src: P3('card-fortuna-20g.png'), label: '20 g'},
  {src: 'card-fortuna-gold.png', label: '1 oz'},
];

const Bars: React.FC<SceneProps> = ({frame, cue}) => {
  const overtaken = cue('overtaken');
  const customers = cue('customers');
  const smaller = cue('smaller');
  const gram = cue('gram');
  const drawStart = 4;
  // Draw so that the bars line crosses the coins line exactly on "overtaken".
  const speed = CROSS / Math.max(1, overtaken - drawStart);
  const tNow = Math.min(1, Math.max(0, (frame - drawStart) * speed));
  const toLadder = prog(frame, customers + 6, 34, EASE.inOut);
  const steps = 90;
  const shown = Array.from({length: Math.max(2, Math.round(tNow * steps) + 1)}, (_, i) => Math.min(tNow, i / steps));
  const path = (f: (t: number) => number) => shown.map((t, i) => `${i ? 'L' : 'M'}${px(t).toFixed(1)} ${py(f(t)).toFixed(1)}`).join(' ');
  const pulse = prog(frame, overtaken - 2, 40);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 280, left: 0, right: 0}}>
        <AnswerLabel frame={frame} number={N} text="Lately" />
      </div>
      <div style={{position: 'absolute', top: 340, left: 40, right: 40, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('Over') - 6}>
          <div style={serif(104)}>Over the past year,</div>
        </Rise>
        <div style={{position: 'relative', height: 124}}>
          <Rise frame={frame} at={overtaken - 6} out={smaller - 14} style={{position: 'absolute', left: 0, right: 0}}>
            <div style={italic(112, {lineHeight: 1.08})}>
              <Metal frame={frame} sheenAt={overtaken + 20}>
                bars overtook coins.
              </Metal>
            </div>
          </Rise>
          <Rise frame={frame} at={smaller - 4} style={{position: 'absolute', left: 0, right: 0}}>
            <div style={italic(104, {lineHeight: 1.08})}>
              <Metal frame={frame} sheenAt={gram + 10}>
                &amp; smaller gram bars.
              </Metal>
            </div>
          </Rise>
        </div>
      </div>
      {/* Abstract preference curve — no figures */}
      <div
        style={{
          position: 'absolute',
          left: 540 - PW / 2,
          top: 700,
          width: PW,
          height: PH,
          borderRadius: 28,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))',
          boxShadow: 'inset 0 0 0 1px rgba(255,240,210,0.12), 0 40px 80px rgba(0,0,0,0.5)',
          opacity: prog(frame, 0, 26) * (1 - toLadder),
          translate: `0 ${-toLadder * 80}px`,
          filter: toLadder > 0 ? `blur(${toLadder * 8}px)` : undefined,
        }}
      >
        <svg width={PW} height={PH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <rect x={px(0.62)} y={30} width={px(1) - px(0.62)} height={PH - 70} fill="rgba(212,175,55,0.06)" />
          <text x={px(0.81)} y={56} textAnchor="middle" fill="rgba(244,238,223,0.55)" fontFamily="Inter" fontSize={17} fontWeight={500} letterSpacing={4}>
            PAST YEAR
          </text>
          <line x1={px(0)} x2={px(1)} y1={PH - 50} y2={PH - 50} stroke="rgba(244,238,223,0.15)" />
          <path d={path(coinsCurve)} fill="none" stroke="#cfd6dd" strokeWidth={3} strokeLinejoin="round" opacity={0.85} />
          <path d={path(barsCurve)} fill="none" stroke="#e9c766" strokeWidth={4} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 10px rgba(233,199,102,0.7))'}} />
          <circle cx={px(tNow)} cy={py(coinsCurve(tNow))} r={7} fill="#eef2f6" />
          <circle cx={px(tNow)} cy={py(barsCurve(tNow))} r={8} fill="#fff1c4" />
          <text x={px(tNow) + 16} y={py(coinsCurve(tNow)) + (tNow > CROSS ? 30 : -14)} fill="#cfd6dd" fontFamily="Inter" fontSize={20} fontWeight={600} letterSpacing={3}>
            COINS
          </text>
          <text x={px(tNow) + 16} y={py(barsCurve(tNow)) + (tNow > CROSS ? -14 : 30)} fill="#f0d27a" fontFamily="Inter" fontSize={20} fontWeight={600} letterSpacing={3}>
            1 OZ BARS
          </text>
          {pulse > 0 && pulse < 1 ? (
            <circle cx={px(CROSS)} cy={py(barsCurve(CROSS))} r={10 + pulse * 60} fill="none" stroke="#f6e3a1" strokeWidth={2.5} opacity={1 - pulse} />
          ) : null}
          {frame >= overtaken - 2 ? <circle cx={px(CROSS)} cy={py(barsCurve(CROSS))} r={6} fill="#f6e3a1" /> : null}
        </svg>
        <div style={{position: 'absolute', left: 30, bottom: 14, ...caps(15, {color: C.mute})}}>Customer preference · illustrative</div>
      </div>
      {/* Gram bars up to 1 oz */}
      {LADDER.map((card, i) => {
        const at = customers + 14 + i * 6;
        const p = prog(frame, at, 34, EASE.out);
        const x = 540 + (i - 2.5) * 166;
        const y = 1010 - i * 26;
        return (
          <div key={card.src}>
            <Product src={card.src} frame={frame} w={148} h={228} x={x} y={y + (1 - p) * 120} opacity={p} sheen={[cue('bars', 1) + i * 3]} float={3} floatPhase={i} />
            <div style={{position: 'absolute', left: x - 70, width: 140, top: y + 130, textAlign: 'center', opacity: prog(frame, gram - 6 + i * 3, 18), ...caps(20, {color: i === 5 ? C.goldLight : C.champagne})}}>
              {card.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ——— The bottom line ———
const Choose: React.FC<SceneProps> = ({frame, cue}) => {
  const recognizable = cue('recognizable');
  const liquid = cue('liquid');
  const choice = cue('choice');
  const preference = cue('preference');
  const settle = prog(frame, choice - 10, preference - choice + 40, EASE.inOut);
  const tilt = (1 - settle) * 7 * Math.sin(frame / 22) * prog(frame, 0, 30);
  const pans = BALANCE_PANS(tilt);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 280, left: 0, right: 0}}>
        <AnswerLabel frame={frame} number={N} text="The bottom line" />
      </div>
      <Headline frame={frame} line1="Eagles remain" line2="recognizable & liquid." at1={cue('Eagles')} at2={recognizable} out={choice - 14} size={100} />
      <Headline frame={frame} line1="The best choice" line2="depends on three things." at1={choice} at2={cue('depends')} size={100} />
      <Balance frame={frame} tilt={tilt} opacity={prog(frame, 0, 30)} sheen={[preference]} />
      {/* What the Eagle offers */}
      <div style={{position: 'absolute', left: pans[1].x - 200, width: 400, top: pans[1].y - 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
        <Chip frame={frame} at={recognizable} gold out={choice - 10}>
          Recognizable
        </Chip>
        <Chip frame={frame} at={liquid} gold out={choice - 10}>
          Liquid
        </Chip>
      </div>
      {/* What decides it */}
      <div style={{position: 'absolute', top: 1300, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14}}>
        <Chip frame={frame} at={cue('premium')} gold>
          I · Premium
        </Chip>
        <Chip frame={frame} at={cue('much')} gold>
          II · How much
        </Chip>
        <Chip frame={frame} at={preference} gold>
          III · Preference
        </Chip>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="Bars or coins — your call"
    footer="1 oz bars · Gold Eagles · gram bars"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product src="bar-justice-obv.png" frame={frame} w={480} h={388} x={mix(440, 430, p)} y={mix(960, 910, p)} opacity={p} float={6} sheen={[50]} glow="rgba(214,168,74,0.25)" />
          <Coin src={P3('coin-eagle-liberty.png')} back="coin-gold-eagle.png" frame={frame} d={270} x={mix(820, 760, p)} y={1000} turn={mix(-120, -14, prog(frame, 8, 60))} roll={-5} opacity={prog(frame, 8, 30)} sheen={[70]} />
        </>
      );
    }}
  />
);

export const BAR_OR_EAGLE_SCENES: Record<string, React.FC<SceneProps>> = {
  question: Question,
  answer: Answer,
  years: Years,
  maple: Maple,
  eagle: Eagle,
  bars: Bars,
  choose: Choose,
  cta: Cta,
};
