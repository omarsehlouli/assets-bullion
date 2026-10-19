import type React from 'react';
import {AbsoluteFill, Img, random} from 'remotion';
import {Metal} from '../kit/Text';
import {art, EASE, GOLD_GRADIENT, mix, prog, SANS, SERIF, type SceneProps} from '../kit/theme';
import {caps as fcaps, ICE_GRADIENT} from './forge';
import {Bead, Beads, GrainDefs, pile, type Grain} from './Grain';

// "The Frustration": a cold, tense montage cut to a 72 bpm heartbeat.
// A — the invoice and its milling fee; B — it gets crumpled; C — the margin
// bar being eaten; D — a meagre pile of grain under a lonely light.

const BEAT0 = 18;
const BEAT = 50;
const RED = '255,59,48';

// Decaying envelope from the latest heartbeat (lub, then a softer dub).
const heartbeat = (frame: number, stop: number) => {
  if (frame < BEAT0 || frame > stop + 20) {
    return 0;
  }
  const last = BEAT0 + Math.floor((Math.min(frame, stop) - BEAT0) / BEAT) * BEAT;
  const lub = frame >= last ? Math.exp(-(frame - last) / 6) : 0;
  const dub = frame >= last + 11 ? 0.55 * Math.exp(-(frame - last - 11) / 6) : 0;
  return Math.min(1, lub + dub);
};

// The beat on or just before a frame — montage cuts land on these.
const onBeat = (frame: number) => BEAT0 + Math.round((frame - BEAT0) / BEAT) * BEAT;

const Shot: React.FC<{frame: number; from: number; to: number; children: React.ReactNode; last?: boolean}> = ({frame, from, to, children, last}) => {
  if (frame < from - 1 || (!last && frame >= to)) {
    return null;
  }
  const local = frame - from;
  const p = prog(local, 0, 14, EASE.out);
  return (
    <AbsoluteFill style={{opacity: Math.min(1, local / 4 + 0.15), scale: String(mix(1.05, 1, p)), filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

// ——— A / B: the invoice ———

const INVOICE_W = 560;
const INVOICE_H = 747;

// A jittered grid of facets for the crumple: each triangle catches light differently.
const FACETS = (() => {
  const cols = 6;
  const rows = 8;
  const pts: [number, number][][] = [];
  for (let r = 0; r <= rows; r++) {
    pts.push([]);
    for (let c = 0; c <= cols; c++) {
      const edge = r === 0 || c === 0 || r === rows || c === cols;
      const jx = edge ? 0 : (random(`fx${r}-${c}`) - 0.5) * 70;
      const jy = edge ? 0 : (random(`fy${r}-${c}`) - 0.5) * 70;
      pts[r].push([(c / cols) * INVOICE_W + jx, (r / rows) * INVOICE_H + jy]);
    }
  }
  const tris: {d: string; shade: number}[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const [a, b, d, e] = [pts[r][c], pts[r][c + 1], pts[r + 1][c], pts[r + 1][c + 1]];
      const flip = random(`ff${r}-${c}`) > 0.5;
      const t1 = flip ? [a, b, e] : [a, b, d];
      const t2 = flip ? [a, e, d] : [b, e, d];
      [t1, t2].forEach((t, k) => tris.push({d: `M${t.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`, shade: random(`fs${r}-${c}-${k}`)}));
    }
  }
  return tris;
})();

// Ragged outline used while the sheet balls up.
const crumpleClip = (amount: number) => {
  const n = 28;
  const pts = Array.from({length: n}, (_, i) => {
    const t = i / n;
    const side = Math.floor(t * 4);
    const u = (t * 4) % 1;
    const [x, y] = side === 0 ? [u, 0] : side === 1 ? [1, u] : side === 2 ? [1 - u, 1] : [0, 1 - u];
    const pull = amount * (0.06 + random(`cc${i}`) * 0.14);
    return `${((x + (0.5 - x) * pull * 2) * 100).toFixed(2)}% ${((y + (0.5 - y) * pull * 2) * 100).toFixed(2)}%`;
  });
  return `polygon(${pts.join(',')})`;
};

const InkLine: React.FC<{w: number; opacity?: number}> = ({w, opacity = 0.22}) => (
  <div style={{width: w, height: 9, borderRadius: 5, background: `rgba(40,38,44,${opacity})`}} />
);

const Row: React.FC<{label: string; value: string; highlight?: number; pulse?: number}> = ({label, value, highlight = 0, pulse = 0}) => (
  <div
    style={{
      position: 'relative',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '16px 18px',
      margin: '0 -18px',
      fontFamily: SANS,
      fontSize: 25,
      fontWeight: 500,
      color: highlight > 0.5 ? '#7a0d08' : '#2a2730',
      borderRadius: 8,
      background: `rgba(${RED},${highlight * (0.16 + pulse * 0.1)})`,
      boxShadow: highlight > 0 ? `0 0 ${30 + pulse * 30}px rgba(${RED},${highlight * 0.55}), inset 0 0 0 2px rgba(${RED},${highlight * 0.8})` : undefined,
    }}
  >
    <span>{label}</span>
    <span style={{fontWeight: 600}}>{value}</span>
  </div>
);

const Invoice: React.FC<{fee: number; pulse: number; crumple: number}> = ({fee, pulse, crumple}) => (
  <div style={{position: 'relative', width: INVOICE_W, height: INVOICE_H, clipPath: crumple > 0 ? crumpleClip(crumple) : undefined}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(170deg, #f2eee6 0%, #e6e1d7 55%, #d8d2c6 100%)',
        boxShadow: 'inset 0 0 60px rgba(60,55,50,0.25)',
      }}
    />
    {/* Paper fibres and grain */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'repeating-linear-gradient(87deg, rgba(120,110,95,0.035) 0px, rgba(120,110,95,0.035) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 7px), repeating-linear-gradient(3deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 9px)',
      }}
    />
    <Img src={art('grain.png')} style={{position: 'absolute', inset: 0, width: INVOICE_W, height: INVOICE_H, opacity: 0.18, mixBlendMode: 'multiply'}} />
    {/* Tri-fold creases */}
    {[INVOICE_H / 3, (INVOICE_H * 2) / 3].map((y) => (
      <div key={y} style={{position: 'absolute', left: 0, right: 0, top: y - 10, height: 20, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.07) 48%, rgba(255,255,255,0.35) 52%, rgba(0,0,0,0))'}} />
    ))}
    <div style={{position: 'absolute', inset: '54px 56px', display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div>
          <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 64, letterSpacing: '0.06em', color: '#1f1c24'}}>INVOICE</div>
          <div style={{fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: '0.3em', color: '#5b5660', marginTop: 6}}>OTHER DEALER · WHOLESALE</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, marginTop: 14}}>
          <InkLine w={130} />
          <InkLine w={90} />
        </div>
      </div>
      <div style={{height: 2, background: '#2a2730', opacity: 0.6, margin: '40px 0 18px'}} />
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 15, fontWeight: 600, letterSpacing: '0.24em', color: '#6b6670', marginBottom: 8}}>
        <span>ITEM</span>
        <span>AMOUNT</span>
      </div>
      <Row label="Sterling silver casting grain" value="50 oz" />
      <div style={{height: 1, background: 'rgba(40,38,44,0.18)'}} />
      <Row label="Spot price" value="live" />
      <div style={{height: 1, background: 'rgba(40,38,44,0.18)'}} />
      <Row label="Milling fee" value="$15.00 / oz over spot" highlight={fee} pulse={pulse} />
      <div style={{height: 1, background: 'rgba(40,38,44,0.18)'}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 34}}>
        <InkLine w={420} opacity={0.12} />
        <InkLine w={350} opacity={0.12} />
        <InkLine w={380} opacity={0.12} />
      </div>
      <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontFamily: SANS, fontSize: 18, fontWeight: 600, letterSpacing: '0.26em', color: '#2a2730'}}>TOTAL DUE</div>
        <div style={{width: 170, height: 34, borderRadius: 6, background: 'rgba(40,38,44,0.18)'}} />
      </div>
    </div>
    {/* Crumpled facets */}
    {crumple > 0 ? (
      <svg width={INVOICE_W} height={INVOICE_H} style={{position: 'absolute', inset: 0}}>
        {FACETS.map((t, i) => (
          <path
            key={i}
            d={t.d}
            fill={t.shade > 0.5 ? `rgba(255,255,255,${(t.shade - 0.5) * 0.7 * crumple})` : `rgba(20,18,24,${(0.5 - t.shade) * 1.1 * crumple})`}
            stroke={`rgba(60,55,60,${0.25 * crumple})`}
            strokeWidth={1}
          />
        ))}
      </svg>
    ) : null}
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(150,175,210,0.12) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.18) 100%)`}} />
  </div>
);

const Workbench: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #06080c 0%, #0b0e13 45%, #121418 100%)'}} />
    <AbsoluteFill
      style={{
        background:
          'repeating-linear-gradient(178deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 2px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 11px)',
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 52%, rgba(150,175,210,0.16) 0%, rgba(0,0,0,0) 70%)'}} />
  </AbsoluteFill>
);

// ——— C: the margin bar ———

const BAR_X = 100;
const BAR_W = 880;
const BAR_Y = 1000;
const BAR_H = 128;

const CRUMBS = Array.from({length: 22}, (_, i) => ({
  t0: i * 2.6,
  dx: (random(`cr${i}`) - 0.5) * 50,
  vy: random(`cv${i}`) * 2,
  r: 5 + random(`crr${i}`) * 6,
  grain: {x: 0, y: 0, r: 5 + random(`crr${i}`) * 6, ratio: 0.75, rot: random(`crt${i}`) * 180, variant: i % 3, glint: random(`crg${i}`)} as Grain,
}));

const MarginBar: React.FC<{frame: number; eating: number; margins: number}> = ({frame, eating, margins}) => {
  const eat = prog(frame, eating - 4, margins + 30 - eating, EASE.inOut) * 0.62;
  const edge = BAR_X + BAR_W * (1 - eat);
  const zig = Array.from({length: 9}, (_, i) => {
    const y = (i / 8) * BAR_H;
    const x = i % 2 ? 14 + Math.sin(frame / 5 + i) * 4 : -6;
    return `${x}px ${y}px`;
  });
  return (
    <>
      <div style={{position: 'absolute', left: BAR_X, top: BAR_Y - 64, ...fcaps(30, {letterSpacing: '0.24em', color: '#d9c79b'})}}>Profit margin</div>
      <div
        style={{
          position: 'absolute',
          right: BAR_X,
          top: BAR_Y - 64,
          ...fcaps(30, {letterSpacing: '0.24em', color: `rgb(${RED})`}),
          opacity: prog(frame, eating, 20),
        }}
      >
        Milling fees
      </div>
      <div
        style={{
          position: 'absolute',
          left: BAR_X - 8,
          top: BAR_Y - 8,
          width: BAR_W + 16,
          height: BAR_H + 16,
          borderRadius: 18,
          boxShadow: 'inset 0 0 0 1.5px rgba(200,215,235,0.18)',
        }}
      />
      {/* Gold margin, bitten on its right edge */}
      <div
        style={{
          position: 'absolute',
          left: BAR_X,
          top: BAR_Y,
          width: edge - BAR_X + 14,
          height: BAR_H,
          borderRadius: '12px 0 0 12px',
          background: `${GOLD_GRADIENT}`,
          backgroundSize: '200% 100%',
          backgroundPosition: `${50 + Math.sin(frame / 40) * 30}% 0`,
          boxShadow: '0 0 40px rgba(212,175,55,0.25)',
          clipPath: `polygon(0 0, calc(100% - 14px) 0, ${zig.map((z) => `calc(100% - 14px + ${z.split(' ')[0]}) ${z.split(' ')[1]}`).join(', ')}, calc(100% - 14px) 100%, 0 100%)`,
        }}
      />
      {/* Red fee segment growing from the right */}
      <div
        style={{
          position: 'absolute',
          left: edge + 6,
          top: BAR_Y,
          width: Math.max(0, BAR_X + BAR_W - edge - 6),
          height: BAR_H,
          borderRadius: '0 12px 12px 0',
          background: `repeating-linear-gradient(135deg, rgba(${RED},0.9) 0px, rgba(${RED},0.9) 14px, rgba(190,30,24,0.9) 14px, rgba(190,30,24,0.9) 28px)`,
          boxShadow: `0 0 50px rgba(${RED},0.45)`,
          opacity: eat > 0.005 ? 1 : 0,
        }}
      />
      {/* Crumbs of the margin falling off the bite */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <GrainDefs prefix="fr-c" />
        {CRUMBS.map((c, i) => {
          const age = frame - (eating + c.t0);
          if (age < 0 || age > 90 || eat <= 0) {
            return null;
          }
          const birth = edge + 4;
          const x = birth + c.dx * (age / 60);
          const y = BAR_Y + BAR_H * 0.3 + c.vy * age + 0.35 * age * age * 0.5;
          return <Bead key={i} g={{...c.grain, x, y, rot: c.grain.rot + age * 5}} metal="gold" frame={frame} prefix="fr-c" shadow={false} />;
        })}
      </svg>
    </>
  );
};

// ——— D: the meagre pile ———

const MEAGRE = pile('meagre', {cx: 540, base: 1215, width: 330, height: 84, count: 26, rMin: 15, rMax: 24});

const Velvet: React.FC<{frame: number; dim: number}> = ({frame, dim}) => {
  const flicker = 1 - dim * (0.15 + 0.06 * Math.sin(frame / 3));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #040507 0%, #07080c 55%, #0b0c12 100%)'}} />
      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)',
          opacity: 0.8,
        }}
      />
      {/* Cold cone of light from above */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 380,
          top: -100,
          width: 760,
          height: 1340,
          background: `linear-gradient(180deg, rgba(185,205,235,${0.2 * flicker}) 0%, rgba(185,205,235,${0.06 * flicker}) 70%, rgba(0,0,0,0) 100%)`,
          clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)',
          filter: 'blur(18px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 - 330,
          top: 1100,
          width: 760,
          height: 260,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, rgba(190,210,240,${0.3 * flicker}) 0%, rgba(190,210,240,${0.08 * flicker}) 45%, rgba(0,0,0,0) 72%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Frustration: React.FC<SceneProps> = ({frame, duration, cue}) => {
  const fee = cue('1015');
  const over = cue('over');
  const casting = cue('casting');
  const they = cue('they');
  const taking = cue('taking');
  const eating = cue('eating');
  const margins = cue('margins');
  const taxing = cue('taxing');
  const craft = cue('craft');
  const stop = onBeat(cue('craft')) + 2;

  const beat = heartbeat(frame, stop);
  const cutB = onBeat(they - 4);
  const cutC = onBeat(cue('they', 1) + 8);
  const cutD = onBeat(cue('they', 2) + 10);
  const still = prog(frame, stop + 10, 40);

  // A: invoice slides in, then the camera pushes into the fee line.
  const slide = prog(frame, 50, 40, EASE.out);
  const push = prog(frame, fee - 6, 46, EASE.inOut) * (1 - prog(frame, casting - 10, 40, EASE.inOut) * 0.6);
  const feeOn = prog(frame, fee - 4, 14);
  // B: the crumple.
  const crumple = prog(frame, taking - 8, 50, EASE.inOut);
  const fall = prog(frame, taking + 34, 40, EASE.in);
  const showInvoice = frame < cutC;

  return (
    <AbsoluteFill style={{overflow: 'hidden', scale: String(1 + beat * 0.012)}}>
      {/* A + B */}
      <Shot frame={frame} from={0} to={cutC}>
        <Workbench />
        {showInvoice ? (
          <div
            style={{
              position: 'absolute',
              left: 540 - INVOICE_W / 2,
              top: 1030 - INVOICE_H / 2,
              width: INVOICE_W,
              height: INVOICE_H,
              perspective: 1800,
              transformOrigin: '50% 37%',
              scale: String(mix(1, 1.1, push) * mix(1, 0.62, crumple)),
              translate: `${mix(460, 0, slide) + crumple * 40}px ${mix(0, -20, push) + fall * 900}px`,
              rotate: `${mix(9, -3, slide) + crumple * 24 + fall * 40}deg`,
              opacity: 1 - fall,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `rotateX(${mix(14, 4, push)}deg) skewX(${crumple * -6}deg) scaleX(${mix(1, 0.78, crumple)})`,
                boxShadow: `0 ${40 - crumple * 20}px 80px rgba(0,0,0,0.75)`,
              }}
            >
              <Invoice fee={feeOn} pulse={beat} crumple={crumple} />
            </div>
          </div>
        ) : null}
        <div style={{position: 'absolute', top: 268, left: 0, right: 0, textAlign: 'center', opacity: 1 - prog(frame, cutB - 10, 10)}}>
          <div
            style={fcaps(200, {
              color: `rgb(${RED})`,
              fontWeight: 700,
              opacity: prog(frame, fee - 4, 10),
              scale: String(mix(1.25, 1, prog(frame, fee - 4, 22, EASE.out))),
              textShadow: `0 0 ${40 + beat * 30}px rgba(${RED},0.6), 0 0 6px rgba(${RED},0.8)`,
              letterSpacing: '0.01em',
            })}
          >
            $10–$15
          </div>
          <div style={fcaps(108, {opacity: prog(frame, over - 4, 12), translate: `0 ${(1 - prog(frame, over - 4, 20)) * 30}px`, marginTop: 4})}>Over spot</div>
          <div
            style={fcaps(48, {
              color: '#c9d4e2',
              letterSpacing: '0.18em',
              marginTop: 18,
              opacity: prog(frame, casting - 6, 14),
              translate: `0 ${(1 - prog(frame, casting - 6, 20)) * 20}px`,
            })}
          >
            Just for casting grain.
          </div>
        </div>
        <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', opacity: prog(frame, cutB, 8)}}>
          <div style={fcaps(84, {color: '#c9d4e2', letterSpacing: '0.06em'})}>They aren&apos;t just</div>
          <div
            style={fcaps(190, {
              color: `rgb(${RED})`,
              fontWeight: 700,
              opacity: prog(frame, taking - 6, 10),
              scale: String(mix(1.2, 1, prog(frame, taking - 6, 20))),
              textShadow: `0 0 ${36 + beat * 30}px rgba(${RED},0.55)`,
            })}
          >
            Taking
          </div>
          <div style={fcaps(104, {opacity: prog(frame, cue('money') - 6, 12)})}>your money.</div>
        </div>
      </Shot>

      {/* C */}
      <Shot frame={frame} from={cutC} to={cutD}>
        <Workbench />
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
          <div style={fcaps(170, {color: `rgb(${RED})`, fontWeight: 700, opacity: prog(frame, eating - 6, 10), textShadow: `0 0 ${36 + beat * 30}px rgba(${RED},0.55)`})}>Eating</div>
          <div style={fcaps(118, {opacity: prog(frame, cue('profit') - 6, 12)})}>
            your{' '}
            <Metal frame={frame} gradient={GOLD_GRADIENT} glow="rgba(212,175,55,0.3)">
              margins.
            </Metal>
          </div>
        </div>
        <MarginBar frame={frame} eating={eating} margins={margins} />
      </Shot>

      {/* D */}
      <Shot frame={frame} from={cutD} to={duration} last>
        <Velvet frame={frame} dim={still} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <GrainDefs prefix="fr-p" />
          <Beads grains={MEAGRE} metal="silver" frame={frame} prefix="fr-p" reveal={prog(frame, cutD, 30)} sparkle={1 - still * 0.8} />
        </svg>
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
          <div style={{display: 'inline-block', position: 'relative'}}>
            <div style={fcaps(190, {color: `rgb(${RED})`, fontWeight: 700, opacity: prog(frame, taxing - 6, 10), textShadow: `0 0 ${36 + beat * 30}px rgba(${RED},0.5)`})}>Taxing</div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -6,
                height: 8,
                borderRadius: 4,
                background: `rgb(${RED})`,
                boxShadow: `0 0 24px rgba(${RED},0.8)`,
                transformOrigin: 'left',
                scale: `${prog(frame, taxing, 24, EASE.inOut)} 1`,
              }}
            />
          </div>
          <div style={fcaps(124, {marginTop: 22, opacity: prog(frame, craft - 8, 12)})}>
            your{' '}
            <Metal frame={frame} gradient={ICE_GRADIENT} glow="rgba(200,215,235,0.3)">
              craft.
            </Metal>
          </div>
        </div>
      </Shot>

      {/* Heartbeat vignette — the cold edges tighten on every beat */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background: `radial-gradient(ellipse 75% 62% at 50% 48%, rgba(0,0,0,0) ${58 - beat * 8}%, rgba(${RED},${0.05 + beat * 0.1}) 82%, rgba(0,0,0,${0.6 + beat * 0.2}) 100%)`,
        }}
      />
      <AbsoluteFill style={{pointerEvents: 'none', background: '#000', opacity: still * 0.25}} />
    </AbsoluteFill>
  );
};
