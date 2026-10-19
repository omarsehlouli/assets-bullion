import type React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {EndCard} from '../../marketing-premium/kit/EndCard';
import {Pin, Skyline} from '../../marketing-premium/kit/Pieces';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps, Eyebrow, italic, Metal, Rise, serif} from '../../marketing-premium/kit/Text';
import {C, EASE, LOGO, mix, prog, SANS, SERIF, type SceneProps} from '../../marketing-premium/kit/theme';
import {Plaque} from '../../marketing-premium/videos/NewYork';
import {QuestionScene} from '../faq-kit';
import {BankCheck, DayStrip, Icon, StepNumber} from './Pickup-props';

// FAQ 05 — Can you buy gold online and pick it up in Manhattan the same day?
// Sometimes: it depends on how you pay.

const P3 = (name: string) => `premium-3/${name}`;

const Headline: React.FC<{frame: number; a: string; b: string; atA: number; atB: number; top?: number; sizeA?: number; sizeB?: number; eyebrow?: string; atE?: number}> = ({
  frame,
  a,
  b,
  atA,
  atB,
  top = 290,
  sizeA = 96,
  sizeB = 106,
  eyebrow,
  atE = 0,
}) => (
  <div style={{position: 'absolute', top, left: 40, right: 40, textAlign: 'center'}}>
    {eyebrow ? (
      <div style={{marginBottom: 26}}>
        <Eyebrow frame={frame} at={atE}>
          {eyebrow}
        </Eyebrow>
      </div>
    ) : null}
    <Rise frame={frame} at={atA - 6}>
      <div style={serif(sizeA)}>{a}</div>
    </Rise>
    <Rise frame={frame} at={atB - 6}>
      <div style={italic(sizeB, {lineHeight: 1.06})}>
        <Metal frame={frame} sheenAt={atB + 20}>
          {b}
        </Metal>
      </div>
    </Rise>
  </div>
);

const Question: React.FC<SceneProps> = (props) => (
  <QuestionScene {...props} number="05" lines={['Can you buy gold online', 'and pick it up', 'in Manhattan', 'the same day?']} size={100} />
);

// ——— Sometimes: it depends on how you pay ———

const FORK = [
  {x: 180, kind: 'bankcheck' as const, label: 'Bank check'},
  {x: 413, kind: 'wire' as const, label: 'Wire'},
  {x: 667, kind: 'check' as const, label: 'Check'},
  {x: 900, kind: 'card' as const, label: 'Card'},
];

const Answer: React.FC<SceneProps> = ({frame, cue}) => {
  const how = cue('how');
  const stem = prog(frame, cue('depends') - 4, 22, EASE.inOut);
  const branches = prog(frame, how - 4, 30, EASE.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('Sometimes') - 8} dur={34}>
          <div style={italic(200, {lineHeight: 1})}>
            <Metal frame={frame} sheenAt={cue('Sometimes') + 16}>
              Sometimes.
            </Metal>
          </div>
        </Rise>
        <Rise frame={frame} at={cue('depends') - 6} style={{marginTop: 18}}>
          <div style={serif(78, {color: C.ivory})}>
            It depends on <span style={italic(84, {color: C.goldLight})}>how you pay.</span>
          </div>
        </Rise>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d="M540 760 V880" stroke="#d4af37" strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - stem} />
        {FORK.map((f) => (
          <path
            key={f.x}
            d={`M540 880 C540 960 ${f.x} 940 ${f.x} 1010`}
            fill="none"
            stroke="#d4af37"
            strokeOpacity={0.8}
            strokeWidth={2}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - branches}
          />
        ))}
        <circle cx={540} cy={880} r={7} fill="#f6e3a1" opacity={stem} />
      </svg>
      {FORK.map((f, i) => {
        const p = prog(frame, how + 8 + i * 6, 24);
        return (
          <div key={f.x} style={{position: 'absolute', left: f.x - 90, top: 1010, width: 180, textAlign: 'center', opacity: p, translate: `0 ${(1 - p) * 20}px`}}>
            <div
              style={{
                width: 128,
                height: 128,
                margin: '0 auto',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 40% 30%, rgba(60,48,22,0.9), rgba(14,12,9,0.95))',
                boxShadow: 'inset 0 0 0 1.5px rgba(212,175,55,0.55), 0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <Icon kind={f.kind} size={64} draw={p} />
            </div>
            <div style={{...caps(19, {letterSpacing: '0.24em'}), marginTop: 22}}>{f.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ——— A physical office in Midtown ———

const Office: React.FC<SceneProps> = ({frame, cue}) => (
  <AbsoluteFill>
    <Headline frame={frame} a="A physical office" b="in Midtown Manhattan." atA={cue('physical')} atB={cue('Midtown')} sizeB={100} />
    <Skyline frame={frame} at={0} y={560} opacity={0.5} />
    <Pin frame={frame} at={cue('office') - 4} x={540} y={850} size={0.9} />
    <Plaque frame={frame} at={cue('Manhattan') - 6} glint={cue('person') - 20} top={950} />
    <div style={{position: 'absolute', top: 1380, left: 0, right: 0}}>
      <Eyebrow frame={frame} at={cue('pick') - 4} color={C.mute}>
        Pick up your bullion in person
      </Eyebrow>
    </div>
  </AbsoluteFill>
);

// ——— Same-day: the bank check route ———

const Step: React.FC<{frame: number; n: number; at: number; litAt: number; title: string; sub: string; subAt: number; top: number}> = ({frame, n, at, litAt, title, sub, subAt, top}) => {
  const p = prog(frame, at, 28);
  const lit = prog(frame, litAt, 16);
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        top,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 30,
        opacity: p * mix(0.45, 1, lit),
        translate: `${(1 - p) * -40}px 0`,
      }}
    >
      <StepNumber n={n} lit={lit} />
      <div>
        <div style={serif(50, {lineHeight: 1.1, color: lit > 0.5 ? C.ivory : C.mute})}>{title}</div>
        <div style={{...caps(16, {letterSpacing: '0.24em', color: C.champagne}), marginTop: 8, opacity: prog(frame, subAt, 20)}}>{sub}</div>
      </div>
    </div>
  );
};

const BankCheckScene: React.FC<SceneProps> = ({frame, cue}) => {
  const bank = cue('bank');
  const come = cue('Come');
  const tell = cue('tell');
  const checkIn = prog(frame, cue('pickup') - 6, 44, EASE.out);
  const steps = prog(frame, come - 10, 30, EASE.inOut);
  return (
    <AbsoluteFill>
      <Headline frame={frame} eyebrow="Same-day pickup" atE={cue('sameday') - 8} a="A bank check" b="is usually easiest." atA={bank} atB={cue('easiest')} top={270} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 360,
          top: mix(700, mix(650, 630, steps), checkIn),
          opacity: checkIn,
          rotate: `${mix(-6, -2, checkIn)}deg`,
          scale: String(mix(0.92, mix(1, 0.86, steps), checkIn)),
          transformOrigin: '50% 0%',
        }}
      >
        <BankCheck frame={frame} w={720} />
      </div>
      <div style={{position: 'absolute', left: 150, top: 1000, bottom: 560, width: 2, background: 'linear-gradient(180deg, rgba(212,175,55,0.6), rgba(212,175,55,0))', opacity: steps}} />
      <Step frame={frame} n={1} at={come - 10} litAt={come - 4} title="Come in" sub="Confirm your purchase & price" subAt={cue('confirm') - 4} top={990} />
      <Step frame={frame} n={2} at={come + 4} litAt={tell - 4} title="Tell us your bank" sub="The bank you'll use" subAt={cue('bank', 1) - 4} top={1105} />
      <Step frame={frame} n={3} at={come + 14} litAt={100000} title="Return with the bank check" sub="Next" subAt={100000} top={1220} />
    </AbsoluteFill>
  );
};

// ——— Return, verify, release ———

const Release: React.FC<SceneProps> = ({frame, cue}) => {
  const verify = cue('verify');
  const release = cue('release');
  const day = cue('day');
  const checkIn = prog(frame, 0, 34, EASE.out);
  const scan = prog(frame, verify - 14, 34, EASE.inOut);
  const verified = prog(frame, verify + 18, 14, EASE.out);
  const slide = prog(frame, release - 12, 46, EASE.out);
  const counter = prog(frame, release - 30, 30, EASE.out);
  return (
    <AbsoluteFill>
      <Headline frame={frame} a="Come back with" b="the bank check." atA={cue('back')} atB={cue('check')} top={280} />
      <div
        style={{
          position: 'absolute',
          left: mix(-700, 540 - 300, checkIn) + slide * -120,
          top: 640,
          rotate: `${mix(-8, -3, checkIn)}deg`,
          scale: String(mix(1, 0.82, slide)),
          transformOrigin: '0% 0%',
        }}
      >
        <BankCheck frame={frame} w={600} scan={scan} verified={verified} />
      </div>
      {/* Counter and tray */}
      <div style={{position: 'absolute', left: -40, right: -40, top: 1250, height: 70, opacity: counter, background: 'linear-gradient(180deg, rgba(40,44,52,0.9), rgba(8,9,12,0.95))', borderTop: '2px solid #b8902f', boxShadow: '0 -20px 60px rgba(212,175,55,0.08)'}} />
      <div
        style={{
          position: 'absolute',
          left: mix(1100, 540, slide) - 210,
          top: 1150,
          width: 420,
          height: 110,
          borderRadius: 20,
          background: 'linear-gradient(180deg, #2a1f14, #120d08)',
          boxShadow: 'inset 0 2px 0 rgba(226,196,108,0.35), inset 0 -10px 24px rgba(0,0,0,0.6), 0 30px 50px rgba(0,0,0,0.6)',
          opacity: Math.min(1, slide * 2),
        }}
      >
        <div style={{position: 'absolute', inset: 14, borderRadius: 12, background: 'radial-gradient(ellipse at 50% 40%, #3a1820, #160a0d)'}} />
      </div>
      <Product
        src={P3('bar-pamp-1oz.png')}
        frame={frame}
        w={196}
        h={324}
        x={mix(1100, 540, slide)}
        y={1052}
        opacity={Math.min(1, slide * 2)}
        sheen={[release + 30]}
        glow="rgba(214,168,74,0.3)"
      />
      <div style={{position: 'absolute', top: 1360, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: prog(frame, day - 8, 20)}}>
        <StepNumber n={3} lit={1} />
        <div style={caps(20, {letterSpacing: '0.3em', color: C.champagne})}>Released the same day</div>
      </div>
    </AbsoluteFill>
  );
};

// ——— Other payment methods ———

const ROW_W = 900;

const PayRow: React.FC<{
  frame: number;
  top: number;
  at: number;
  active: number;
  icon: 'bankcheck' | 'wire' | 'check' | 'card';
  title: string;
  chip: string;
  chipAt: number;
  children?: React.ReactNode;
}> = ({frame, top, at, active, icon, title, chip, chipAt, children}) => {
  const p = prog(frame, at, 30);
  const chipIn = prog(frame, chipAt, 20);
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - ROW_W / 2,
        top,
        width: ROW_W,
        height: 150,
        borderRadius: 24,
        boxSizing: 'border-box',
        padding: '20px 30px',
        background: `linear-gradient(180deg, rgba(255,255,255,${0.03 + active * 0.03}), rgba(255,255,255,0.01))`,
        boxShadow: `inset 0 0 0 1.5px rgba(212,175,55,${0.14 + active * 0.5}), 0 24px 60px rgba(0,0,0,0.45)${active > 0.5 ? ', 0 0 40px rgba(212,175,55,0.12)' : ''}`,
        opacity: p * mix(0.55, 1, Math.max(active, 0.4)),
        translate: `0 ${(1 - p) * 30}px`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <Icon kind={icon} size={48} draw={p} />
        <div style={serif(42, {lineHeight: 1.1, flex: 1})}>{title}</div>
        <div
          style={{
            padding: '8px 18px',
            borderRadius: 999,
            border: '1.5px solid rgba(212,175,55,0.7)',
            background: 'rgba(212,175,55,0.1)',
            ...caps(16, {letterSpacing: '0.2em', color: C.goldLight}),
            opacity: chipIn,
            scale: String(mix(0.85, 1, chipIn)),
            whiteSpace: 'nowrap',
          }}
        >
          {chip}
        </div>
      </div>
      <div style={{marginTop: 16, marginLeft: 68}}>{children}</div>
    </div>
  );
};

const Others: React.FC<SceneProps> = ({frame, cue}) => {
  const wire = cue('wire');
  const twoday = cue('twoday');
  const personal = cue('personal');
  const clears = cue('clears');
  const five = cue('five');
  const credit = cue('credit');
  const shipped = cue('shipped');
  const activeOf = (from: number, to: number) => prog(frame, from - 6, 12) * (1 - prog(frame, to - 6, 12));
  return (
    <AbsoluteFill>
      <Headline frame={frame} eyebrow="Other ways to pay" atE={0} a="How you pay" b="sets the timing." atA={4} atB={14} top={270} sizeA={92} sizeB={100} />
      <PayRow frame={frame} top={640} at={0} active={1 - prog(frame, wire - 6, 12)} icon="bankcheck" title="Bank check" chip="Same day" chipAt={6}>
        <div style={caps(15, {letterSpacing: '0.22em', color: C.mute})}>Usually released the same day</div>
      </PayRow>
      <PayRow frame={frame} top={812} at={wire - 8} active={activeOf(wire, personal)} icon="wire" title="Wire transfer" chip="2-day wait" chipAt={twoday - 4}>
        <DayStrip frame={frame} at={twoday} days={2} per={10} label="Typically" />
      </PayRow>
      <PayRow frame={frame} top={984} at={personal - 8} active={activeOf(personal, credit)} icon="check" title="Personal or business check" chip="Until it clears" chipAt={clears - 6}>
        <DayStrip frame={frame} at={five - 10} days={5} per={7} label="About 5 business days" />
      </PayRow>
      <PayRow frame={frame} top={1156} at={credit - 8} active={prog(frame, credit - 6, 12)} icon="card" title="Credit card" chip="Ships" chipAt={shipped - 8}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: prog(frame, shipped - 8, 20)}}>
          <Icon kind="parcel" size={34} draw={prog(frame, shipped - 8, 24)} />
          <span style={caps(15, {letterSpacing: '0.22em', color: C.mute})}>Orders generally must be shipped</span>
        </div>
      </PayRow>
    </AbsoluteFill>
  );
};

// ——— Contact before you come in ———

const Contact: React.FC<SceneProps> = ({frame, cue}) => {
  const contact = cue('contact');
  const card = prog(frame, cue('matters') - 10, 36, EASE.out);
  return (
    <AbsoluteFill>
      <Headline frame={frame} a="Same-day pickup?" b="Contact us first." atA={cue('same') - 2} atB={contact} top={290} sizeA={92} sizeB={110} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 420,
          top: 700,
          width: 840,
          height: 470,
          borderRadius: 30,
          background: 'linear-gradient(180deg, rgba(40,32,16,0.85), rgba(12,10,8,0.9))',
          boxShadow: 'inset 0 0 0 1.5px rgba(212,175,55,0.55), 0 50px 100px rgba(0,0,0,0.65), 0 0 60px rgba(212,175,55,0.1)',
          opacity: card,
          translate: `0 ${(1 - card) * 50}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 44,
          boxSizing: 'border-box',
        }}
      >
        <Img src={LOGO} style={{width: 260, height: (260 * 84) / 294}} />
        <div style={{width: 520, height: 1, margin: '30px 0 34px', background: 'linear-gradient(90deg, rgba(212,175,55,0), #d4af37, rgba(212,175,55,0))'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <Icon kind="phone" size={52} draw={prog(frame, contact - 4, 24)} />
          <span style={{fontFamily: SERIF, fontWeight: 600, fontSize: 64, color: C.ivory, fontVariantNumeric: 'lining-nums'}}>
            <Metal frame={frame} sheenAt={contact + 10}>
              +1 646-362-3536
            </Metal>
          </span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 26}}>
          <Icon kind="pin" size={40} draw={prog(frame, contact + 4, 24)} />
          <span style={{fontFamily: SANS, fontWeight: 500, fontSize: 30, color: C.mute}}>20 W 47th St, New York, NY 10036</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1220, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={cue('before') - 6}>
          Call before you come in
        </Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="Pick up in Midtown Manhattan"
    footer="20 W 47th St · Call before you come in"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product src="bar-justice-obv.png" frame={frame} w={560} h={453} x={510} y={mix(960, 900, p)} opacity={p} float={6} sheen={[50]} glow="rgba(214,168,74,0.25)" />
          <Coin src="coin-gold-eagle.png" frame={frame} d={250} x={mix(900, 800, p)} y={1040} turn={mix(-90, -18, prog(frame, 8, 60))} roll={-6} opacity={prog(frame, 8, 30)} sheen={[70]} />
        </>
      );
    }}
  />
);

export const PICKUP_SCENES: Record<string, React.FC<SceneProps>> = {
  question: Question,
  answer: Answer,
  office: Office,
  bankcheck: BankCheckScene,
  release: Release,
  others: Others,
  contact: Contact,
  cta: Cta,
};
