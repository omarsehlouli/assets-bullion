import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {EndCard} from '../../marketing-premium/kit/EndCard';
import {Pin} from '../../marketing-premium/kit/Pieces';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps, Eyebrow, italic, Metal, Rise, serif} from '../../marketing-premium/kit/Text';
import {C, EASE, mix, prog, SANS, type SceneProps} from '../../marketing-premium/kit/theme';
import {REAL_OR_FAKE_SCENES} from '../../marketing-premium-2/videos/RealOrFake';
import {AnswerLabel, QuestionScene} from '../faq-kit';

// FAQ 01 — "How do I know the gold is real before I buy it?"
// About 60% is the five checks anyone can do (reused from the Real or Fake
// film); 40% is how Bullion Trading verifies: in-office testing in front of
// the customer, inspection before shipping, and a simple rule — verify.

const P3 = (name: string) => `premium-3/${name}`;

const CHECKS = ['Magnet', 'Ice', 'Ring', 'Specs', 'Serial'];

const Intro: React.FC<SceneProps> = ({frame, cue}) => {
  const five = cue('five');
  const checks = cue('checks');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
        <AnswerLabel frame={frame} number="01" />
        <Rise frame={frame} at={cue('Start') - 6} style={{marginTop: 30}}>
          <div style={serif(118)}>Start with</div>
        </Rise>
        <Rise frame={frame} at={five - 6}>
          <div style={italic(150, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={checks}>
              five checks.
            </Metal>
          </div>
        </Rise>
      </div>
      <Coin src="coin-gold-eagle.png" frame={frame} d={420} x={540} y={1010} turn={Math.sin(frame / 50) * 14} opacity={prog(frame, 0, 30)} sheen={[checks]} />
      <div style={{position: 'absolute', top: 1270, left: 30, right: 30, display: 'flex', justifyContent: 'center', gap: 10}}>
        {CHECKS.map((label, i) => {
          const p = prog(frame, checks - 4 + i * 6, 20);
          return (
            <div
              key={label}
              style={{
                padding: '11px 14px',
                borderRadius: 999,
                border: '1px solid rgba(212,175,55,0.55)',
                background: 'rgba(30,24,12,0.7)',
                opacity: p,
                translate: `0 ${(1 - p) * 20}px`,
                ...caps(15, {letterSpacing: '0.12em', color: C.champagne}),
              }}
            >
              <span style={{color: C.gold, marginRight: 8}}>{['I', 'II', 'III', 'IV', 'V'][i]}</span>
              {label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// A generic, unbranded desktop precious-metals analyzer.
const Analyzer: React.FC<{frame: number; scanAt: number; resultAt: number}> = ({frame, scanAt, resultAt}) => {
  const scan = prog(frame, scanAt, resultAt - scanAt, (t) => t);
  const result = prog(frame, resultAt, 18, EASE.out);
  const beamY = 860 + ((frame - scanAt) % 60) / 60 * 280;
  const scanning = frame >= scanAt && frame < resultAt;
  return (
    <>
      {/* Test stand with the bar on it */}
      <div
        style={{
          position: 'absolute',
          left: 130,
          top: 800,
          width: 380,
          height: 470,
          borderRadius: 30,
          background: 'linear-gradient(160deg, #2a2b2f, #111214 70%)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        <div style={{position: 'absolute', left: 30, right: 30, top: 30, bottom: 110, borderRadius: 20, background: 'radial-gradient(ellipse at 50% 40%, #1c1d21, #0a0a0c)', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'}} />
        <div style={{position: 'absolute', left: 30, right: 30, bottom: 36, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={caps(14, {color: C.mute, letterSpacing: '0.3em'})}>Sample</span>
          <span style={{width: 12, height: 12, borderRadius: '50%', background: scanning ? '#e9c766' : result > 0.5 ? '#7ee0a0' : '#444', boxShadow: scanning ? '0 0 14px #e9c766' : undefined}} />
        </div>
      </div>
      <Product src={P3('bar-pamp-1oz.png')} frame={frame} w={170} h={281} x={320} y={1010} sheen={[resultAt + 4]} glow="rgba(214,168,74,0.25)" />
      {scanning ? (
        <div
          style={{
            position: 'absolute',
            left: 170,
            width: 300,
            top: beamY,
            height: 3,
            background: 'linear-gradient(90deg, rgba(233,199,102,0), #f6e3a1, rgba(233,199,102,0))',
            boxShadow: '0 0 18px rgba(246,227,161,0.9)',
          }}
        />
      ) : null}
      {/* Readout */}
      <div
        style={{
          position: 'absolute',
          left: 560,
          top: 840,
          width: 400,
          height: 390,
          borderRadius: 26,
          background: 'linear-gradient(180deg, rgba(22,22,26,0.95), rgba(10,10,12,0.95))',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(212,175,55,0.35)',
          padding: '30px 34px',
          boxSizing: 'border-box',
          opacity: prog(frame, 0, 24),
        }}
      >
        <div style={caps(15, {letterSpacing: '0.3em', color: C.mute})}>Precious-metals analysis</div>
        <div style={{marginTop: 26, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden'}}>
          <div style={{width: `${scan * 100}%`, height: '100%', background: 'linear-gradient(90deg, #8a6a1f, #f6e3a1)'}} />
        </div>
        <div style={{marginTop: 30, display: 'flex', alignItems: 'baseline', gap: 18, opacity: result}}>
          <span style={serif(110, {lineHeight: 1})}>
            <Metal frame={frame}>Au</Metal>
          </span>
          <span style={{fontFamily: SANS, fontSize: 54, fontWeight: 600, color: C.ivory}}>999.9</span>
        </div>
        <div
          style={{
            marginTop: 26,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 20px',
            borderRadius: 999,
            background: `rgba(126,224,160,${0.12 * result})`,
            border: `1px solid rgba(126,224,160,${0.6 * result})`,
            opacity: result,
            scale: String(mix(0.9, 1, result)),
            ...caps(20, {color: '#a6efc0', letterSpacing: '0.24em'}),
          }}
        >
          ✓ Verified
        </div>
      </div>
    </>
  );
};

const Office: React.FC<SceneProps> = ({frame, cue}) => {
  const manhattan = cue('Manhattan');
  const testing = cue('testing');
  const equipment = cue('equipment');
  const front = cue('front');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={manhattan - 10}>
          Our Manhattan office
        </Eyebrow>
        <Rise frame={frame} at={cue('test') - 8} style={{marginTop: 30}}>
          <div style={serif(90)}>Tested on our equipment,</div>
        </Rise>
        <Rise frame={frame} at={front - 10}>
          <div style={italic(128, {lineHeight: 1.05})}>
            <Metal frame={frame} sheenAt={front + 10}>
              right in front of you.
            </Metal>
          </div>
        </Rise>
      </div>
      <div style={{opacity: 1 - prog(frame, testing - 20, 16)}}>
        <Pin frame={frame} at={manhattan - 6} x={540} y={1020} size={1.1} />
        <div style={{position: 'absolute', top: 1180, left: 0, right: 0}}>
          <Eyebrow frame={frame} at={manhattan} color={C.mute}>
            20 W 47th St · New York
          </Eyebrow>
        </div>
      </div>
      <div style={{opacity: prog(frame, testing - 16, 20)}}>
        <Analyzer frame={frame} scanAt={testing - 6} resultAt={equipment + 14} />
      </div>
    </AbsoluteFill>
  );
};

const LEDGER = [
  {label: 'Inspected', word: 'inspect'},
  {label: 'Tested', word: 'test'},
  {label: 'Recorded', word: 'records'},
];

const Shipping: React.FC<SceneProps> = ({frame, cue}) => {
  const ships = cue('ships');
  const close = prog(frame, cue('records') + 10, 30, EASE.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('Before') - 6}>
          <div style={serif(112)}>Before it ships,</div>
        </Rise>
        <Rise frame={frame} at={cue('inspect') - 6}>
          <div style={italic(110, {lineHeight: 1.08})}>
            <Metal frame={frame} sheenAt={cue('send')}>
              we check it.
            </Metal>
          </div>
        </Rise>
      </div>
      {/* Shipping box */}
      <div style={{position: 'absolute', left: 110, top: 840, width: 420, height: 420, opacity: prog(frame, ships - 20, 24)}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 90, bottom: 0, borderRadius: 14, background: 'linear-gradient(170deg, #1b1916, #0b0a09)', boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(212,175,55,0.3)'}} />
        <Product src={P3('bar-pamp-1oz.png')} frame={frame} w={120} h={198} x={210} y={mix(170, 260, close)} sheen={[cue('test')]} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 90, height: 90, background: 'linear-gradient(180deg, #24211d, #141210)', borderRadius: '14px 14px 0 0', transformOrigin: '50% 0%', transform: `perspective(800px) rotateX(${mix(-110, 0, close)}deg)`, boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.3)'}} />
        <div style={{position: 'absolute', left: 190, width: 40, top: 90, bottom: 0, background: 'linear-gradient(180deg, #c9a246, #8a6a1f)', opacity: close}} />
      </div>
      {/* Ledger */}
      <div
        style={{
          position: 'absolute',
          left: 570,
          top: 900,
          width: 400,
          padding: '30px 32px',
          borderRadius: 24,
          background: 'linear-gradient(180deg, rgba(36,30,20,0.92), rgba(14,12,9,0.92))',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(212,175,55,0.45)',
          boxSizing: 'border-box',
          opacity: prog(frame, ships - 10, 24),
        }}
      >
        <div style={caps(15, {letterSpacing: '0.3em', color: C.mute})}>Outgoing order</div>
        <div style={{marginTop: 10, fontFamily: SANS, fontSize: 24, fontWeight: 600, color: C.ivory}}>1 oz PAMP Suisse gold bar</div>
        <div style={{height: 1, background: 'rgba(212,175,55,0.3)', margin: '22px 0'}} />
        {LEDGER.map(({label, word}) => {
          const p = prog(frame, cue(word) - 2, 14, EASE.out);
          return (
            <div key={label} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18}}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: '1.5px solid rgba(212,175,55,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `rgba(212,175,55,${0.25 * p})`,
                  color: C.goldLight,
                  fontSize: 26,
                }}
              >
                <span style={{opacity: p, scale: String(mix(0.4, 1, p))}}>✓</span>
              </div>
              <span style={italic(50, {color: p > 0.5 ? C.ivory : 'rgba(244,238,223,0.35)'})}>{label}</span>
            </div>
          );
        })}
        <div style={{marginTop: 6, opacity: prog(frame, cue('send') - 4, 20), ...caps(14, {letterSpacing: '0.22em', color: C.champagne})}}>Identifying details logged where they apply</div>
      </div>
    </AbsoluteFill>
  );
};

const Verify: React.FC<SceneProps> = ({frame, cue}) => {
  const verify = cue('verify');
  const seal = prog(frame, verify - 4, 16, EASE.out);
  const assume = cue('assume');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('never') - 6}>
          <div style={serif(104)}>We never just</div>
        </Rise>
        <Rise frame={frame} at={assume - 6}>
          <div style={italic(124, {lineHeight: 1.05, color: 'rgba(244,238,223,0.75)'})}>
            <span style={{position: 'relative'}}>
              assume.
              <span
                style={{
                  position: 'absolute',
                  left: -8,
                  right: -8,
                  top: '54%',
                  height: 4,
                  background: '#d4af37',
                  transformOrigin: 'left',
                  scale: `${prog(frame, verify - 10, 14, EASE.out)} 1`,
                  boxShadow: '0 0 12px rgba(212,175,55,0.8)',
                }}
              />
            </span>
          </div>
        </Rise>
        <Rise frame={frame} at={verify - 6}>
          <div style={italic(170, {lineHeight: 1.05})}>
            <Metal frame={frame} sheenAt={verify + 10}>
              We verify.
            </Metal>
          </div>
        </Rise>
      </div>
      <Product src="bar-justice-obv.png" frame={frame} w={460} h={372} x={430} y={1080} opacity={prog(frame, 0, 30)} float={5} sheen={[verify + 4]} glow="rgba(214,168,74,0.25)" />
      <Coin src="coin-silver-eagle.png" frame={frame} metal="silver" d={230} x={760} y={1190} turn={-16} opacity={prog(frame, 6, 30)} sheen={[verify + 10]} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 130,
          top: 950,
          width: 260,
          height: 260,
          borderRadius: '50%',
          opacity: seal,
          scale: String(mix(1.6, 1, seal)),
          rotate: `${mix(-20, -8, seal)}deg`,
          background: 'radial-gradient(circle at 35% 30%, #f6e3a1, #c9a246 45%, #8a6a1f)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 0 6px rgba(255,240,200,0.35), inset 0 0 0 14px rgba(120,90,20,0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3a2a08',
        }}
      >
        <div style={{fontSize: 70, lineHeight: 1}}>✓</div>
        <div style={caps(22, {color: '#3a2a08', letterSpacing: '0.3em', marginTop: 8, fontWeight: 600})}>Verified</div>
      </div>
      <div style={{position: 'absolute', top: 1320, left: 0, right: 0, textAlign: 'center', opacity: prog(frame, cue('genuine'), 20)}}>
        <span style={caps(18, {color: C.mute})}>Every bar · every coin</span>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="Tested before it's yours"
    footer="In-person testing · 20 W 47th St, New York"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product src="bar-justice-obv.png" frame={frame} w={520} h={420} x={500} y={mix(960, 900, p)} opacity={p} float={6} sheen={[50]} glow="rgba(214,168,74,0.25)" />
          <Coin src={P3('coin-eagle-liberty.png')} frame={frame} d={240} x={mix(880, 790, p)} y={1030} turn={mix(-90, -14, prog(frame, 8, 60))} opacity={prog(frame, 8, 30)} sheen={[70]} />
        </>
      );
    }}
  />
);

export const REAL_GOLD_SCENES: Record<string, React.FC<SceneProps>> = {
  question: (props) => <QuestionScene {...props} number="01" lines={['How do you know', 'gold is real,', 'before you buy it?']} />,
  intro: Intro,
  magnet: REAL_OR_FAKE_SCENES.magnet,
  ice: REAL_OR_FAKE_SCENES.ice,
  ping: REAL_OR_FAKE_SCENES.ping,
  specs: REAL_OR_FAKE_SCENES.specs,
  serial: REAL_OR_FAKE_SCENES.serial,
  office: Office,
  shipping: Shipping,
  verify: Verify,
  cta: Cta,
};

