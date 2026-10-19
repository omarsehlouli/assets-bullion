import type React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {EndCard} from '../../marketing-premium/kit/EndCard';
import {Coin, Product} from '../../marketing-premium/kit/Product';
import {caps, Eyebrow, italic, MaskLine, Metal, Rise, serif} from '../../marketing-premium/kit/Text';
import {art, C, EASE, mix, prog, SANS, SILVER_GRADIENT, type SceneProps} from '../../marketing-premium/kit/theme';
import {Caliper, CheckRow, IceCube, Magnet, RingTrace, ROMAN, Scale, Seal} from './RealOrFake-props';

// "Real or fake?" — five checks from Bullion Trading's Safety Week guides,
// staged like a jeweler's lab bench: magnet, ice, ping, weight & size, serial.

const Headline: React.FC<{frame: number; a: string; b: string; at: number; at2: number; size?: number; size2?: number; silver?: boolean}> = ({
  frame,
  a,
  b,
  at,
  at2,
  size = 118,
  size2 = 140,
  silver,
}) => (
  <div style={{position: 'absolute', top: 340, left: 0, right: 0, textAlign: 'center'}}>
    <Rise frame={frame} at={at}>
      <div style={serif(size)}>{a}</div>
    </Rise>
    <Rise frame={frame} at={at2}>
      <div style={italic(size2, {lineHeight: 1.04})}>
        <Metal frame={frame} gradient={silver ? SILVER_GRADIENT : undefined} glow={silver ? 'rgba(220,228,236,0.28)' : undefined} sheenAt={at2 + 26}>
          {b}
        </Metal>
      </div>
    </Rise>
  </div>
);

const Step: React.FC<{frame: number; n: number; label: string}> = ({frame, n, label}) => (
  <div style={{position: 'absolute', top: 270, left: 0, right: 0}}>
    <Eyebrow frame={frame} at={0}>
      {`Check ${ROMAN[n]}  ·  ${label}`}
    </Eyebrow>
  </div>
);

// Cool overhead lab light over the bench.
const BenchLight: React.FC<{y: number; w?: number; h?: number; opacity?: number}> = ({y, w = 1100, h = 760, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: 540 - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      borderRadius: '50%',
      background: 'radial-gradient(ellipse at center, rgba(205,222,240,0.17) 0%, rgba(205,222,240,0.05) 45%, rgba(0,0,0,0) 72%)',
      opacity,
    }}
  />
);

const Hook: React.FC<SceneProps> = ({frame, cue}) => {
  const scan = prog(frame, 16, cue('fake') + 30, EASE.inOut);
  const line = mix(250, 830, scan);
  const coinIn = prog(frame, 0, 60, EASE.silk);
  const five = cue('five');
  const coin = (fake: boolean) => (
    <Coin
      src="coin-gold-eagle.png"
      frame={frame}
      d={560}
      x={540}
      y={mix(1060, 1000, coinIn)}
      turn={Math.sin(frame / 70) * 8}
      tilt={4}
      opacity={coinIn}
      sheen={fake ? [] : [cue('gold')]}
      glow="rgba(214,168,74,0.28)"
    />
  );
  return (
    <AbsoluteFill>
      <BenchLight y={1000} />
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
        <MaskLine frame={frame} at={cue('Real') - 8} dur={36}>
          <div style={serif(150, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={cue('gold') + 10}>
              Real
            </Metal>{' '}
            <span style={{fontSize: 118}}>gold,</span>
          </div>
        </MaskLine>
        <Rise frame={frame} at={cue('fake') - 6}>
          <div style={italic(140, {color: 'rgba(244,238,223,0.72)'})}>or fake?</div>
        </Rise>
      </div>
      {/* Real on the left of the scan line, a dull brassy copy on the right */}
      <AbsoluteFill style={{clipPath: `inset(0 ${1080 - line}px 0 0)`}}>{coin(false)}</AbsoluteFill>
      <AbsoluteFill style={{clipPath: `inset(0 0 0 ${line}px)`, filter: 'grayscale(0.75) sepia(0.45) brightness(0.62) contrast(0.9)'}}>{coin(true)}</AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: line - 2,
          top: 680,
          width: 4,
          height: 640,
          background: 'linear-gradient(180deg, rgba(190,225,255,0), rgba(225,240,255,0.95) 50%, rgba(190,225,255,0))',
          boxShadow: '0 0 24px rgba(170,215,255,0.8)',
          opacity: coinIn * (1 - prog(frame, five - 6, 14)),
        }}
      />
      <div style={{position: 'absolute', left: line - 150, top: 690, width: 130, textAlign: 'right', ...caps(16, {color: C.goldLight}), opacity: coinIn * (1 - prog(frame, five - 6, 14))}}>
        Genuine
      </div>
      <div style={{position: 'absolute', left: line + 20, top: 690, width: 130, ...caps(16, {color: 'rgba(244,238,223,0.5)'}), opacity: coinIn * (1 - prog(frame, five - 6, 14))}}>
        Suspect
      </div>
      <div style={{position: 'absolute', top: 1282, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={cue('checks') - 4} color={C.mute} lines={false}>
          Five checks the pros use
        </Eyebrow>
      </div>
      <CheckRow frame={frame} at={five - 4} y={1330} stagger={4} />
    </AbsoluteFill>
  );
};

const BAR = {w: 330, h: Math.round((330 * 956) / 560)};

const MagnetScene: React.FC<SceneProps> = ({frame, cue}) => {
  const enter = prog(frame, cue('magnet') - 46, 44, EASE.out);
  const release = cue('wont');
  const fall = Math.max(0, frame - release);
  const slide = 0.035 * fall * fall;
  const mx = mix(960, 420, enter) + fall * 0.9;
  const my = mix(640, 880, enter) + slide;
  return (
    <AbsoluteFill>
      <BenchLight y={1020} />
      <Step frame={frame} n={0} label="Magnet" />
      <Headline frame={frame} a="Not" b="magnetic." at={cue('arent') - 4} at2={cue('magnetic') - 6} size2={160} />
      <Product
        src="bar-silver-liberty.png"
        frame={frame}
        w={BAR.w}
        h={BAR.h}
        x={420}
        y={mix(1100, 1040, prog(frame, 0, 50, EASE.silk))}
        opacity={prog(frame, 0, 30)}
        sheen={[cue('silver')]}
        float={3}
      />
      <Coin src="coin-maple.png" frame={frame} d={250} x={790} y={mix(1260, 1200, prog(frame, 6, 50, EASE.silk))} turn={-14 + Math.sin(frame / 60) * 6} opacity={prog(frame, 6, 30)} sheen={[cue('Gold')]} />
      {/* Its shadow on the bar while it hovers */}
      <div
        style={{
          position: 'absolute',
          left: mx - 110 + 40,
          top: my - 40 + 60,
          width: 220,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)',
          opacity: enter * Math.max(0, 1 - fall / 30),
        }}
      />
      <Magnet x={mx} y={my} rotate={-8 + fall * 0.9} opacity={enter * Math.max(0, 1 - fall / 50)} frame={frame} field={enter} />
      <div style={{position: 'absolute', top: 1356, left: 0, right: 0, opacity: prog(frame, cue('stick') + 4, 20)}}>
        <Eyebrow frame={frame} at={cue('stick') + 4} color={C.mute}>
          It slides right off
        </Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

const IceScene: React.FC<SceneProps> = ({frame, cue}) => {
  const ice = cue('ice');
  const melt = prog(frame, cue('melting') - 6, 90, EASE.inOut) * 0.85 + prog(frame, cue('melting') + 84, 80) * 0.15;
  const drop = prog(frame, ice - 18, 22, EASE.in);
  const heat = cue('heat');
  return (
    <AbsoluteFill>
      <BenchLight y={1020} />
      <Step frame={frame} n={1} label="Ice" />
      <Headline frame={frame} a="Ice melts" b="right away." at={ice - 6} at2={cue('melting') - 6} silver />
      <Product
        src="bar-silver-liberty.png"
        frame={frame}
        w={380}
        h={Math.round((380 * 956) / 560)}
        x={540}
        y={mix(1060, 1010, prog(frame, 0, 50, EASE.silk))}
        opacity={prog(frame, 0, 30)}
        sheen={[heat]}
      />
      {/* Heat drawn in from the whole bar toward the ice */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        {Array.from({length: 5}, (_, k) => {
          const t = ((frame - heat + k * 14) % 70) / 70;
          if (frame < heat) {
            return null;
          }
          const r = mix(330, 90, t);
          return <circle key={k} cx={540} cy={1060} r={r} fill="none" stroke="#e8c770" strokeWidth={2} opacity={Math.sin(Math.PI * t) * 0.45 * (1 - melt * 0.6)} />;
        })}
      </svg>
      <IceCube x={540} y={mix(780, 960, drop)} size={250} melt={melt} frame={frame} opacity={prog(frame, ice - 24, 10)} />
      {/* Faint vapor */}
      {Array.from({length: 6}, (_, k) => {
        const t = ((frame - ice + k * 25) % 120) / 120;
        return frame > ice + 10 ? (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 480 + k * 22 + Math.sin(frame / 30 + k) * 18 - 60,
              top: 900 - t * 260 - 60,
              width: 120 + t * 80,
              height: 120 + t * 80,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(230,240,250,0.12), rgba(230,240,250,0) 70%)',
              opacity: Math.sin(Math.PI * t) * melt,
            }}
          />
        ) : null;
      })}
      <div style={{position: 'absolute', top: 1372, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={cue('right') - 6} color={C.mute}>
          Silver is an exceptional heat conductor
        </Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

const PingScene: React.FC<SceneProps> = ({frame, cue}) => {
  const contact = cue('rings') - 8;
  const approach = prog(frame, cue('Tap'), contact - cue('Tap'), EASE.in);
  const back = prog(frame, contact, 30, EASE.out);
  const since = frame - contact;
  const shake = since > 0 ? Math.sin(since * 1.7) * 2.4 * Math.exp(-since / 28) : 0;
  const cx = 540;
  const cy = 960;
  const hit = {x: cx + 156, y: cy - 156};
  const sx = mix(1000, hit.x + 60, approach) + back * 46;
  const sy = mix(560, hit.y - 60, approach) - back * 46;
  return (
    <AbsoluteFill>
      <BenchLight y={980} />
      <Step frame={frame} n={2} label="Ping" />
      <Headline frame={frame} a="A clear" b="ring." at={cue('real') - 4} at2={cue('rings') - 4} size2={170} silver />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        {since > 0
          ? Array.from({length: 6}, (_, k) => {
              const t = (since - k * 9) / 70;
              if (t < 0 || t > 1) {
                return null;
              }
              return <circle key={k} cx={hit.x} cy={hit.y} r={20 + t * 520} fill="none" stroke={k % 2 ? '#dfe6ee' : '#e2c46c'} strokeWidth={2.4 * (1 - t)} opacity={(1 - t) * 0.8} />;
            })
          : null}
      </svg>
      <Coin src="coin-silver-eagle.png" frame={frame} metal="silver" d={440} x={cx} y={cy} turn={16} tilt={6} roll={shake} opacity={prog(frame, 0, 30)} sheen={[contact]} />
      <Coin src="round-buffalo.png" frame={frame} metal="silver" d={170} x={sx} y={sy} turn={-30} tilt={10} roll={-20} opacity={prog(frame, 0, 24)} shadow={false} />
      {since >= 0 && since < 8 ? (
        <div style={{position: 'absolute', left: hit.x - 50, top: hit.y - 50, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)', opacity: 1 - since / 8}} />
      ) : null}
      <RingTrace frame={frame} at={contact} y={1230} />
      <div style={{position: 'absolute', left: 150 + 340, width: 340, top: 1206, textAlign: 'center', ...caps(15, {color: C.goldLight, letterSpacing: '0.22em'}), opacity: prog(frame, cue('second') - 4, 20)}}>
        A ring of 1–2 seconds
      </div>
    </AbsoluteFill>
  );
};

const SpecsScene: React.FC<SceneProps> = ({frame, cue}) => {
  const weight = cue('weight');
  const size = cue('size');
  const match = cue('match');
  const grams = prog(frame, weight - 4, 34, EASE.out);
  const jitter = grams < 1 ? Math.sin(frame * 2.3) * 0.4 * (1 - grams) : 0;
  const reading = frame < weight - 4 ? '0.00' : Math.max(0, 31.1 * grams + jitter).toFixed(2);
  const jaw = prog(frame, size - 10, 30, EASE.inOut);
  const coinR = 180;
  const cx = 540;
  const cy = 900;
  const mm = mix(66.0, 40.6, jaw);
  const ok = prog(frame, match, 16);
  return (
    <AbsoluteFill>
      <BenchLight y={980} />
      <Step frame={frame} n={3} label="Weight & size" />
      <div style={{position: 'absolute', top: 340, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={weight - 6}>
          <div style={serif(112)}>Weight &amp; size</div>
        </Rise>
        <Rise frame={frame} at={match - 6}>
          <div style={italic(132, {lineHeight: 1.04})}>
            <Metal frame={frame} sheenAt={cue('specifications')}>
              match the spec.
            </Metal>
          </div>
        </Rise>
      </div>
      <Scale frame={frame} x={cx} y={cy} reading={reading} lit={prog(frame, weight - 8, 14)} ok={ok} />
      <Coin src="coin-silver-eagle.png" frame={frame} metal="silver" d={coinR * 2} x={cx} y={mix(cy - 30, cy, prog(frame, 0, 30, EASE.out))} opacity={prog(frame, 0, 20)} sheen={[match + 4]} />
      <Caliper
        x0={cx - coinR}
        x1={cx + coinR}
        y={cy}
        jawTo={mix(cx + coinR + 220, cx + coinR, jaw)}
        reading={mm.toFixed(2)}
        ok={ok}
        opacity={prog(frame, size - 24, 20)}
      />
      <div style={{position: 'absolute', top: 1360, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18, opacity: prog(frame, cue('published') - 4, 20)}}>
        <div style={caps(15, {color: C.mute, letterSpacing: '0.24em'})}>Published spec · 1 oz Silver Eagle · 31.10 g · 40.6 mm</div>
      </div>
    </AbsoluteFill>
  );
};

// card-lakshmi-cert.png (556×874): bar stamp ≈ (50%, 63%), certificate number ≈ (58.5%, 82%).
const CARD = {x: 150, y: 640, w: 470, h: Math.round((470 * 874) / 556)};
const STAMP = {x: CARD.x + CARD.w * 0.5, y: CARD.y + CARD.h * 0.629, w: CARD.w * 0.3, h: CARD.h * 0.05};
const CERT = {x: CARD.x + CARD.w * 0.585, y: CARD.y + CARD.h * 0.821, w: CARD.w * 0.18, h: CARD.h * 0.032};

const Brackets: React.FC<{x: number; y: number; w: number; h: number; p: number}> = ({x, y, w, h, p}) => {
  const e = 16;
  const pad = 8 + (1 - p) * 30;
  const L = x - w / 2 - pad;
  const R = x + w / 2 + pad;
  const T = y - h / 2 - pad;
  const B = y + h / 2 + pad;
  return (
    <g opacity={p} stroke="#f0d27a" strokeWidth={3} fill="none" style={{filter: 'drop-shadow(0 0 6px rgba(240,210,122,0.8))'}}>
      <path d={`M${L} ${T + e} V${T} H${L + e} M${R - e} ${T} H${R} V${T + e} M${R} ${B - e} V${B} H${R - e} M${L + e} ${B} H${L} V${B - e}`} />
    </g>
  );
};

const Chip: React.FC<{y: number; label: string; p: number; ok: number}> = ({y, label, p, ok}) => (
  <div
    style={{
      position: 'absolute',
      left: 666,
      width: 360,
      top: y,
      padding: '16px 22px 18px',
      boxSizing: 'border-box',
      borderRadius: 18,
      background: 'linear-gradient(180deg, rgba(36,30,20,0.92), rgba(14,12,9,0.92))',
      boxShadow: `inset 0 0 0 1.5px rgba(212,175,55,${0.35 + ok * 0.45}), 0 24px 50px rgba(0,0,0,0.55)`,
      opacity: p,
      translate: `${(1 - p) * 40}px 0`,
    }}
  >
    <div style={caps(14, {color: C.mute, letterSpacing: '0.24em'})}>{label}</div>
    <div style={{fontFamily: SANS, fontSize: 48, fontWeight: 600, letterSpacing: '0.06em', color: C.ivory, marginTop: 6, fontVariantNumeric: 'tabular-nums'}}>C354782</div>
  </div>
);

const SerialScene: React.FC<SceneProps> = ({frame, cue}) => {
  const bar = prog(frame, cue('serial') - 6, 24);
  const cert = prog(frame, cue('certificate') - 30, 24);
  const match = cue('match');
  const ok = prog(frame, match, 18);
  const cardIn = prog(frame, 0, 50, EASE.silk);
  return (
    <AbsoluteFill>
      <BenchLight y={1020} />
      <Step frame={frame} n={4} label="Serial number" />
      <Headline frame={frame} a="Serial numbers" b="must match." at={cue('serial') - 6} at2={match - 6} size={104} />
      <div style={{position: 'absolute', inset: 0, translate: `0 ${(1 - cardIn) * 50}px`, opacity: cardIn}}>
        <Img src={art('premium-2/card-lakshmi-cert.png')} style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.6))'}} />
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible'}}>
        <Brackets {...STAMP} p={bar} />
        <Brackets {...CERT} p={cert} />
        <path
          d={`M${STAMP.x + STAMP.w / 2 + 14} ${STAMP.y} C${STAMP.x + 200} ${STAMP.y}, 600 ${1010} 666 ${1010}`}
          fill="none"
          stroke="#e2c46c"
          strokeWidth={2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - bar}
        />
        <path
          d={`M${CERT.x + CERT.w / 2 + 14} ${CERT.y} C${CERT.x + 120} ${CERT.y}, 600 ${1226} 666 ${1226}`}
          fill="none"
          stroke="#e2c46c"
          strokeWidth={2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - cert}
        />
      </svg>
      <Chip y={960} label="Stamped on the bar" p={bar} ok={ok} />
      <Chip y={1176} label="On the certificate" p={cert} ok={ok} />
      <div
        style={{
          position: 'absolute',
          left: 666,
          width: 360,
          top: 1104,
          textAlign: 'center',
          opacity: ok,
          scale: String(mix(0.7, 1, ok)),
          ...caps(22, {color: '#9fe3b4', letterSpacing: '0.3em'}),
        }}
      >
        ＝ Match ✓
      </div>
    </AbsoluteFill>
  );
};

const SourceScene: React.FC<SceneProps> = ({frame, cue}) => {
  const trust = cue('trust');
  return (
    <AbsoluteFill>
      <BenchLight y={960} />
      <Headline frame={frame} a="Buy from a dealer" b="you can trust." at={cue('buy') - 6} at2={cue('dealer')} size={98} size2={142} />
      <Seal frame={frame} x={540} y={940} d={500} at={0} shine={prog(frame, trust - 4, 50, EASE.inOut)} />
      <CheckRow frame={frame} at={cue('Best') - 8} y={1270} lit={5} stagger={5} />
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneProps> = (props) => (
  <EndCard
    {...props}
    eyebrow="Buy with confidence"
    footer="Gold · Silver · New York since 2008"
    hero={(frame) => {
      const p = prog(frame, 0, 70, EASE.silk);
      return (
        <>
          <Product src="bar-silver-liberty.png" frame={frame} w={250} h={Math.round((250 * 956) / 560)} x={mix(440, 430, p)} y={mix(960, 920, p)} rotate={-6} opacity={p} float={5} sheen={[40]} />
          <Coin src="coin-gold-eagle.png" frame={frame} d={300} x={mix(720, 690, p)} y={1010} turn={mix(-80, -12, prog(frame, 8, 60))} roll={6} opacity={prog(frame, 8, 30)} sheen={[64]} glow="rgba(214,168,74,0.25)" />
        </>
      );
    }}
  />
);

export const REAL_OR_FAKE_SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  magnet: MagnetScene,
  ice: IceScene,
  ping: PingScene,
  specs: SpecsScene,
  serial: SerialScene,
  source: SourceScene,
  cta: Cta,
};
