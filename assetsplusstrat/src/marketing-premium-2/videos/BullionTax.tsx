import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {EndCard} from '../../marketing-premium/kit/EndCard';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps, Eyebrow, italic, Metal, Rise, serif} from '../../marketing-premium/kit/Text';
import {C, EASE, mix, prog, SANS, SILVER_GRADIENT, type SceneProps} from '../../marketing-premium/kit/theme';
import {MAP_H, MAP_W, STATES, STATUS_COUNT, STATUS_LABEL, SWATCH, stateByCode, sweepDelay, TaxMap, type TaxStatus, type UsState} from './BullionTax-map';

// Bullion tax, state by state — every status and threshold shown here comes
// from Bullion Trading's own state tax guide (bulliontradingllc.com/bullion-tax).

const MAP_X = 40;
const MAP_Y = 700;
const MAP_WIDTH = 1000;
const MAP_BOTTOM = MAP_Y + (MAP_H * MAP_WIDTH) / MAP_W;

const FOOTNOTE = "Per Bullion Trading's state tax guide, Oct 2026 · Rules change — check your state.";

const Footnote: React.FC<{frame: number; at: number; top: number}> = ({frame, at, top}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontFamily: SANS,
      fontSize: 15,
      letterSpacing: '0.04em',
      color: 'rgba(244,238,223,0.45)',
      opacity: prog(frame, at, 30),
    }}
  >
    {FOOTNOTE}
  </div>
);

const ORDER: TaxStatus[] = ['exempt', 'conditional', 'taxable', 'no_tax'];

const Legend: React.FC<{frame: number; at: number; top?: number; opacity?: number}> = ({frame, at, top = MAP_BOTTOM + 18, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: 90,
      right: 90,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      columnGap: 40,
      rowGap: 14,
      opacity,
    }}
  >
    {ORDER.map((status, i) => {
      const p = prog(frame, at + i * 5, 26);
      return (
        <div key={status} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: p, translate: `0 ${(1 - p) * 14}px`}}>
          <div style={{width: 30, height: 18, borderRadius: 4, background: SWATCH[status], boxShadow: 'inset 0 0 0 1px rgba(255,240,210,0.4)'}} />
          <div style={caps(17, {letterSpacing: '0.2em', color: C.ivory, whiteSpace: 'nowrap'})}>{STATUS_LABEL[status]}</div>
          <div style={{marginLeft: 'auto', fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.goldLight, fontVariantNumeric: 'tabular-nums'}}>
            {Math.round(STATUS_COUNT[status] * prog(frame, at + i * 5, 22, EASE.out))}
          </div>
        </div>
      );
    })}
  </div>
);

// A hanging price tag asking the question.
const TaxTag: React.FC<{frame: number; at: number; out: number}> = ({frame, at, out}) => {
  const p = prog(frame, at, 34, EASE.out);
  const q = prog(frame, out, 16, EASE.in);
  const swing = Math.sin(frame / 22) * 6 * (1 - q);
  return (
    <div
      style={{
        position: 'absolute',
        left: 790,
        top: 580,
        width: 170,
        height: 250,
        opacity: p * (1 - q),
        transformOrigin: '85px 0px',
        rotate: `${swing + (1 - p) * -25}deg`,
        translate: `0 ${(1 - p) * -60}px`,
      }}
    >
      <svg width={170} height={250} viewBox="0 0 170 250" style={{overflow: 'visible'}}>
        <defs>
          <linearGradient id="tag-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6e3a1" />
            <stop offset="0.5" stopColor="#c9a043" />
            <stop offset="1" stopColor="#8a6a1f" />
          </linearGradient>
        </defs>
        <path d="M85 0 C85 30 85 50 85 70" stroke="#e2c46c" strokeWidth={1.5} fill="none" />
        <path d="M45 92 L85 64 L125 92 L125 232 Q125 242 115 242 L55 242 Q45 242 45 232 Z" fill="url(#tag-gold)" stroke="#fff3c8" strokeOpacity={0.5} />
        <circle cx={85} cy={92} r={8} fill="#0b0b0e" />
        <text x={85} y={190} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize={96} fill="#2a1d05">
          ?
        </text>
        <text x={85} y={226} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={13} letterSpacing={3} fill="#2a1d05">
          TAX
        </text>
      </svg>
    </div>
  );
};

// ——— Hook ———

const Hook: React.FC<SceneProps> = ({frame, cue}) => {
  const depends = cue('depends');
  const state = cue('state');
  const fillAt = depends - 4;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('Will') - 8} out={depends - 14}>
          <div style={serif(112)}>Will you pay</div>
        </Rise>
        <Rise frame={frame} at={cue('sales') - 6} out={depends - 14}>
          <div style={italic(150, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={cue('tax') + 10}>
              sales tax?
            </Metal>
          </div>
        </Rise>
        <div style={{marginTop: 18}}>
          <Eyebrow frame={frame} at={cue('gold') - 6} out={depends - 14}>
            On gold &amp; silver
          </Eyebrow>
        </div>
      </div>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={depends + 3}>
          <div style={serif(112)}>It depends on</div>
        </Rise>
        <Rise frame={frame} at={state - 10}>
          <div style={italic(150, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={state + 10}>
              your state.
            </Metal>
          </div>
        </Rise>
      </div>
      <TaxMap
        x={MAP_X}
        y={MAP_Y}
        width={MAP_WIDTH}
        draw={(s) => prog(frame, 4 + sweepDelay(s, 70), 60, EASE.inOut)}
        fill={(s) => prog(frame, fillAt + sweepDelay(s, 46), 26, EASE.out)}
        glow={(s) => {
          const t = frame - (fillAt + sweepDelay(s, 46));
          return t > 0 && t < 30 ? Math.sin((t / 30) * Math.PI) * 0.8 : 0;
        }}
        sheen={prog(frame, state, 70, EASE.inOut)}
      />
      <TaxTag frame={frame} at={cue('tax') - 4} out={depends - 10} />
      <Legend frame={frame} at={depends + 8} />
    </AbsoluteFill>
  );
};

// ——— Basics ———

const RingIcon: React.FC = () => (
  <svg width={150} height={150} viewBox="0 0 150 150">
    <defs>
      <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6e3a1" />
        <stop offset="0.5" stopColor="#c9a043" />
        <stop offset="1" stopColor="#8a6a1f" />
      </linearGradient>
    </defs>
    <ellipse cx={75} cy={92} rx={44} ry={40} fill="none" stroke="url(#ring-gold)" strokeWidth={10} />
    <ellipse cx={75} cy={92} rx={44} ry={40} fill="none" stroke="#fff3c8" strokeOpacity={0.5} strokeWidth={1.5} transform="translate(-2 -3)" />
    <path d="M60 50 L75 30 L90 50 L75 62 Z" fill="#eef3f8" stroke="#ffffff" strokeWidth={1.5} />
    <path d="M60 50 L90 50 M75 30 L75 62" stroke="#9fb3c6" strokeWidth={1} />
    <path d="M64 52 L70 58 M86 52 L80 58" stroke="#c9a043" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

type Category = {title: string; pill: string; good: boolean; at: number; pillAt: number; visual: (frame: number) => React.ReactNode};

const Basics: React.FC<SceneProps> = ({frame, cue}) => {
  const most = cue('most');
  const cats: Category[] = [
    {
      title: 'Investment bullion',
      pill: 'Tax-free in most states',
      good: true,
      at: cue('Investment') - 8,
      pillAt: cue('taxfree') - 4,
      visual: (f) => <Product src="bar-justice-obv.png" frame={f} w={170} h={137} x={95} y={95} float={3} sheen={[cue('taxfree') + 4]} shadow="drop" />,
    },
    {
      title: 'Collector coins',
      pill: 'Usually taxed',
      good: false,
      at: cue('Collector') - 8,
      pillAt: cue('usually') - 4,
      visual: (f) => <Coin src="premium-2/coin-sovereign.png" frame={f} d={150} x={95} y={95} turn={mix(-80, -12, prog(f, cue('Collector') - 4, 40))} roll={-6} sheen={[cue('coins') + 10]} />,
    },
    {
      title: 'Jewelry',
      pill: 'Always taxed',
      good: false,
      at: cue('jewelry') - 8,
      pillAt: cue('always') - 4,
      visual: () => (
        <div style={{position: 'absolute', left: 20, top: 20}}>
          <RingIcon />
        </div>
      ),
    },
  ];
  return (
    <AbsoluteFill>
      <TaxMap
        x={MAP_X}
        y={MAP_Y}
        width={MAP_WIDTH}
        draw={() => 1}
        fill={() => 1}
        glow={(s) => (s.status === 'exempt' || s.status === 'no_tax' ? prog(frame, most - 4, 18) * (1 - prog(frame, most + 30, 40)) : 0)}
        opacity={mix(1, 0.32, prog(frame, 0, 40))}
        blur={prog(frame, 0, 40) * 2.5}
      />
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={0}>
          The quick basics
        </Eyebrow>
        <Rise frame={frame} at={4} style={{marginTop: 24}}>
          <div style={serif(112)}>What gets</div>
        </Rise>
        <Rise frame={frame} at={12}>
          <div style={italic(150, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={40}>
              taxed?
            </Metal>
          </div>
        </Rise>
      </div>
      {cats.map((cat, i) => {
        const p = prog(frame, cat.at, 34, EASE.out);
        const pill = prog(frame, cat.pillAt, 24, EASE.out);
        return (
          <div
            key={cat.title}
            style={{
              position: 'absolute',
              left: 90,
              right: 90,
              top: 712 + i * 214,
              height: 190,
              borderRadius: 28,
              background: 'linear-gradient(180deg, rgba(30,26,20,0.82), rgba(12,11,10,0.82))',
              boxShadow: `inset 0 0 0 1px ${cat.good ? 'rgba(212,175,55,0.55)' : 'rgba(255,240,210,0.16)'}, 0 30px 70px rgba(0,0,0,0.55)`,
              opacity: p,
              translate: `${(1 - p) * 80}px 0`,
              filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
            }}
          >
            <div style={{position: 'absolute', left: 14, top: 0, width: 190, height: 190}}>{cat.visual(frame)}</div>
            <div style={{position: 'absolute', left: 220, top: 36, right: 30}}>
              <div style={serif(58, {lineHeight: 1})}>{cat.title}</div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 20,
                  padding: '10px 20px',
                  borderRadius: 999,
                  border: `1.5px solid ${cat.good ? 'rgba(233,199,102,0.85)' : 'rgba(176,186,200,0.55)'}`,
                  background: cat.good ? 'rgba(212,175,55,0.14)' : 'rgba(120,130,145,0.12)',
                  opacity: pill,
                  scale: String(mix(0.9, 1, pill)),
                  transformOrigin: 'left center',
                  ...caps(19, {letterSpacing: '0.22em', color: cat.good ? C.goldLight : '#c9d1dc'}),
                }}
              >
                <span style={{width: 9, height: 9, borderRadius: '50%', background: cat.good ? '#e9c766' : '#9aa4b2'}} />
                {cat.pill}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ——— Minimum ———

// States the guide lists with an order threshold.
const THRESHOLDS = STATES.filter((s) => /\$[\d,]+\+ order/.test(s.summary)).map((s) => ({
  code: s.code,
  label: s.summary.match(/\$[\d,]+\+/)![0],
}));

const NY_ZOOM = {scale: 3.1, toX: 560, toY: 910};

const Minimum: React.FC<SceneProps> = ({frame, cue}) => {
  const states = cue('states');
  const ny = cue('New');
  const thousand = cue('1000');
  const more = cue('more');
  const taxfree = cue('taxfree');
  const zoomT = prog(frame, ny - 22, 56, EASE.inOut);
  const labelsOut = prog(frame, ny - 26, 18, EASE.in);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 7);
  // Order meter: empty → crosses the $1,000 line on "$1,000" → keeps going on "more".
  const meterIn = prog(frame, cue('qualifying') - 8, 30, EASE.out);
  const THRESHOLD = 0.56;
  const level =
    prog(frame, cue('orders') - 4, thousand - cue('orders') + 6, EASE.inOut) * THRESHOLD +
    prog(frame, thousand + 2, more - thousand + 20, EASE.out) * (0.86 - THRESHOLD);
  const crossed = level >= THRESHOLD - 0.002;
  const seal = prog(frame, taxfree - 4, 16, EASE.out);
  return (
    <AbsoluteFill>
      <TaxMap
        x={MAP_X}
        y={MAP_Y}
        width={MAP_WIDTH}
        draw={() => 1}
        fill={() => 1}
        glow={(s) => {
          if (s.code === 'NY') {
            return Math.max(prog(frame, states, 20) * (0.4 + 0.4 * pulse) * (1 - zoomT), zoomT * (0.55 + 0.25 * pulse));
          }
          return s.status === 'conditional' ? prog(frame, states + sweepDelay(s, 20), 20) * (0.4 + 0.4 * pulse) * (1 - zoomT) : 0;
        }}
        dim={(s) => Math.max(s.status === 'conditional' ? 0 : prog(frame, states, 30) * 0.55, s.code === 'NY' ? 0 : zoomT * 0.75)}
        zoom={{code: 'NY', ...NY_ZOOM, t: zoomT}}
        opacity={mix(1, 0.9, zoomT)}
        fadeBelow={mix(1330, 1250, zoomT)}
      />
      {/* Minimum-order thresholds, as listed in the guide */}
      <div
        style={{
          position: 'absolute',
          top: MAP_BOTTOM + 14,
          left: 90,
          right: 90,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          opacity: 1 - labelsOut,
        }}
      >
        {THRESHOLDS.map(({code, label}, i) => {
          const p = prog(frame, states + 6 + i * 5, 22, EASE.out);
          return (
            <div
              key={code}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderRadius: 999,
                background: 'rgba(12,11,10,0.85)',
                boxShadow: 'inset 0 0 0 1px rgba(233,199,102,0.6)',
                opacity: p,
                translate: `0 ${(1 - p) * 14}px`,
              }}
            >
              <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 19, color: C.ivory}}>{stateByCode(code).name}</span>
              <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 19, color: C.goldLight}}>{label}</span>
            </div>
          );
        })}
      </div>
      {/* Headlines */}
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={cue('Some') - 8} out={ny - 16}>
          <div style={serif(112)}>Some states set</div>
        </Rise>
        <Rise frame={frame} at={cue('minimum') - 10} out={ny - 16}>
          <div style={italic(150, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={cue('minimum') + 10}>
              a minimum.
            </Metal>
          </div>
        </Rise>
      </div>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={ny + 2}>
          <div style={serif(112)}>In New York,</div>
        </Rise>
        <Rise frame={frame} at={thousand - 8}>
          <div style={italic(132, {lineHeight: 1.06})}>
            <Metal frame={frame} sheenAt={taxfree}>
              $1,000 or more.
            </Metal>
          </div>
        </Rise>
      </div>
      {/* Order-total meter */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 1170,
          height: 170,
          borderRadius: 28,
          background: 'linear-gradient(180deg, rgba(30,26,20,0.88), rgba(12,11,10,0.88))',
          boxShadow: 'inset 0 0 0 1px rgba(255,240,210,0.16), 0 30px 70px rgba(0,0,0,0.6)',
          opacity: meterIn,
          translate: `0 ${(1 - meterIn) * 40}px`,
        }}
      >
        <div style={{position: 'absolute', left: 34, top: 26, ...caps(17, {letterSpacing: '0.3em'})}}>Qualifying order total · New York</div>
        <div style={{position: 'absolute', left: 34, right: 34, top: 82, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.06)', boxShadow: 'inset 0 0 0 1px rgba(255,240,210,0.12)'}}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${level * 100}%`,
              borderRadius: 11,
              background: crossed ? 'linear-gradient(90deg, #8a6a1f, #e9c766, #fff1c2)' : 'linear-gradient(90deg, #4a5262, #8b95a5)',
              boxShadow: crossed ? '0 0 22px rgba(233,199,102,0.7)' : undefined,
            }}
          />
          <div style={{position: 'absolute', left: `${THRESHOLD * 100}%`, top: -18, bottom: -18, width: 2, background: crossed ? '#fff1c2' : '#e2c46c', boxShadow: crossed ? '0 0 16px #fff1c2' : undefined}} />
        </div>
        <div style={{position: 'absolute', left: `calc(34px + ${THRESHOLD} * (100% - 68px))`, top: 118, translate: '-50% 0', fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.goldLight}}>$1,000</div>
        <div style={{position: 'absolute', left: 34, top: 120, ...caps(14, {letterSpacing: '0.24em', color: C.mute})}}>Taxed</div>
        <div style={{position: 'absolute', right: 34, top: 120, ...caps(14, {letterSpacing: '0.24em', color: crossed ? C.goldLight : C.mute})}}>Tax-free</div>
      </div>
      {/* Tax-free seal */}
      <div
        style={{
          position: 'absolute',
          left: 760,
          top: 1010,
          width: 220,
          height: 220,
          opacity: seal,
          scale: String(mix(1.7, 1, seal)),
          rotate: `${mix(-30, -12, seal)}deg`,
          filter: `drop-shadow(0 10px 30px rgba(0,0,0,0.6)) drop-shadow(0 0 ${20 * seal}px rgba(233,199,102,0.5))`,
        }}
      >
        <svg width={220} height={220} viewBox="-110 -110 220 220">
          <defs>
            <linearGradient id="seal-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f6e3a1" />
              <stop offset="0.5" stopColor="#c9a043" />
              <stop offset="1" stopColor="#8a6a1f" />
            </linearGradient>
            <path id="seal-arc" d="M-78 0 A78 78 0 1 1 78 0 A78 78 0 1 1 -78 0" />
          </defs>
          <circle r={104} fill="url(#seal-gold)" />
          <circle r={96} fill="none" stroke="#2a1d05" strokeWidth={2} strokeDasharray="3 5" />
          <circle r={62} fill="none" stroke="#2a1d05" strokeWidth={1.5} />
          <text fontFamily={SANS} fontWeight={600} fontSize={13} letterSpacing={4.2} fill="#2a1d05">
            <textPath href="#seal-arc">QUALIFYING ORDERS · $1,000+ · NEW YORK ·</textPath>
          </text>
          <text y={-4} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontWeight={600} fontSize={40} fill="#2a1d05">
            Tax-free
          </text>
          <text y={24} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={11} letterSpacing={3} fill="#2a1d05">
            PER STATE GUIDE
          </text>
        </svg>
      </div>
      <Footnote frame={frame} at={cue('qualifying')} top={1372} />
    </AbsoluteFill>
  );
};

// ——— Guide ———

const SAMPLE = ['AL', 'CA', 'WA', 'NH'].map(stateByCode);
const STATUS_TEXT: Record<TaxStatus, string> = {
  exempt: 'Fully Exempt',
  conditional: 'Conditionally Exempt',
  taxable: 'Taxable',
  no_tax: 'No State Sales Tax',
};

const StateChip: React.FC<{s: UsState; frame: number; at: number}> = ({s, frame, at}) => {
  const p = prog(frame, at, 22, EASE.out);
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.035)',
        boxShadow: 'inset 0 0 0 1px rgba(255,240,210,0.1)',
        opacity: p,
        translate: `0 ${(1 - p) * 20}px`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <div style={{width: 20, height: 12, borderRadius: 3, background: SWATCH[s.status]}} />
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 20, color: C.ivory}}>{s.name}</div>
      </div>
      <div style={caps(13, {letterSpacing: '0.18em', marginTop: 8, color: C.mute})}>{STATUS_TEXT[s.status]}</div>
    </div>
  );
};

const Guide: React.FC<SceneProps> = ({frame, cue}) => {
  const card = prog(frame, 0, 30, EASE.out);
  const query = 'New York';
  const typed = query.slice(0, Math.max(0, Math.floor((frame - 16) / 3)));
  const typingDone = frame - 16 >= query.length * 3;
  const result = prog(frame, 16 + query.length * 3 + 4, 20, EASE.out);
  const ny = stateByCode('NY');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={0}>
          Bullion tax guide
        </Eyebrow>
        <Rise frame={frame} at={cue('Find') - 8} style={{marginTop: 24}}>
          <div style={serif(112)}>Find your state</div>
        </Rise>
        <Rise frame={frame} at={cue('plain') - 8}>
          <div style={italic(130, {lineHeight: 1.06})}>
            <Metal frame={frame} gradient={SILVER_GRADIENT} sheenAt={cue('guide')} glow="rgba(220,228,236,0.3)">
              in plain English.
            </Metal>
          </div>
        </Rise>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 690,
          height: 660,
          borderRadius: 30,
          background: 'linear-gradient(180deg, #15130f, #0b0a09)',
          boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.35), 0 50px 100px rgba(0,0,0,0.7)',
          opacity: card,
          translate: `0 ${(1 - card) * 60}px`,
          overflow: 'hidden',
        }}
      >
        <div style={{padding: '34px 40px 0'}}>
          <div style={serif(52, {lineHeight: 1.05})}>Will you pay sales tax?</div>
          <div style={caps(18, {marginTop: 10, letterSpacing: '0.3em'})}>Find your state</div>
          {/* Search field */}
          <div
            style={{
              marginTop: 26,
              height: 74,
              borderRadius: 37,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '0 26px',
              background: 'rgba(255,255,255,0.05)',
              boxShadow: 'inset 0 0 0 1.5px rgba(233,199,102,0.55)',
            }}
          >
            <svg width={28} height={28} viewBox="0 0 24 24">
              <circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke="#e9c766" strokeWidth={2.2} />
              <line x1={15.5} y1={15.5} x2={21} y2={21} stroke="#e9c766" strokeWidth={2.2} strokeLinecap="round" />
            </svg>
            <span style={{fontFamily: SANS, fontSize: 30, fontWeight: 500, color: C.ivory}}>
              {typed}
              <span style={{color: '#e9c766', opacity: typingDone && frame % 30 > 15 ? 0 : 1}}>|</span>
            </span>
          </div>
          {/* Result */}
          <div
            style={{
              marginTop: 20,
              padding: '22px 26px',
              borderRadius: 22,
              background: 'linear-gradient(90deg, rgba(212,175,55,0.16), rgba(212,175,55,0.04))',
              boxShadow: 'inset 0 0 0 1.5px rgba(233,199,102,0.7)',
              opacity: result,
              translate: `0 ${(1 - result) * 16}px`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{width: 34, height: 20, borderRadius: 4, background: SWATCH[ny.status]}} />
              <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.ivory}}>{ny.name}</div>
              <div style={{marginLeft: 'auto', ...caps(15, {letterSpacing: '0.2em', color: C.goldLight})}}>{STATUS_TEXT[ny.status]}</div>
            </div>
            <div style={{fontFamily: SANS, fontSize: 22, color: 'rgba(244,238,223,0.8)', marginTop: 10}}>{ny.summary}</div>
            <div style={{fontFamily: SANS, fontSize: 18, color: '#e9c766', marginTop: 10}}>See the details →</div>
          </div>
          {/* More states */}
          <div style={{marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
            {SAMPLE.map((s, i) => (
              <StateChip key={s.code} s={s} frame={frame} at={cue('bullion') - 10 + i * 4} />
            ))}
          </div>
        </div>
      </div>
      <Footnote frame={frame} at={cue('tax') - 6} top={1372} />
    </AbsoluteFill>
  );
};

// ——— Close ———

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="Know before you buy"
    footer="State-by-state tax guide · bulliontradingllc.com"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <TaxMap
            x={140}
            y={680}
            width={800}
            draw={() => 1}
            fill={(s) => prog(frame, sweepDelay(s, 30), 30)}
            opacity={0.3 * p}
          />
          <Product src="bar-justice-obv.png" frame={frame} w={520} h={420} x={500} y={mix(960, 910, p)} opacity={p} float={6} sheen={[50]} glow="rgba(214,168,74,0.25)" />
          <Coin src="coin-gold-eagle.png" frame={frame} d={240} x={mix(900, 800, p)} y={1030} turn={mix(-90, -16, prog(frame, 8, 60))} roll={-6} opacity={prog(frame, 8, 30)} sheen={[70]} />
        </>
      );
    }}
  />
);

export const TAX_SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  basics: Basics,
  minimum: Minimum,
  guide: Guide,
  cta: Cta,
};
