import {Audio} from '@remotion/media';
import type React from 'react';
import {
  AbsoluteFill,
  Composition,
  Interactive,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {C, clamp, expoInOut, glass, KINETIC_FONT, pop, UI_FONT} from '../theme';

type SupportSceneProps = {
  readonly accentColor: string;
  readonly style?: React.CSSProperties;
};

const LINE_Y = 1080;
const LINE_TOP = LINE_Y - 9;
const DRAW_START = 150;
const DRAW_END = 232;
const STANDS_OUT = 345;
const CHECKS = [
  {at: 465, text: 'NEWS LOOKS THE WORST'},
  {at: 615, text: 'SENTIMENT IS TERRIBLE'},
  {at: 675, text: 'PRICE STOPS GOING DOWN'},
];

// ---- Gold particles that bounce off the support line -------------------------

type Particle = {
  spawn: number;
  r: number;
  path: {x: number; y: number}[];
  bounces: {age: number; x: number; strength: number}[];
};

const SCENE_FRAMES = 750;
const PARTICLES: Particle[] = Array.from({length: 72}, (_, i) => {
  const spawn = 250 + i * 6;
  let x = 90 + random(`sp-x-${i}`) * 900;
  let y = 150 + random(`sp-y-${i}`) * 300;
  let vx = (random(`sp-vx-${i}`) - 0.5) * 1.6;
  let vy = random(`sp-vy-${i}`) * 2;
  const r = 3 + random(`sp-r-${i}`) * 5;
  const path: {x: number; y: number}[] = [];
  const bounces: Particle['bounces'] = [];
  for (let age = 0; age <= SCENE_FRAMES - spawn; age++) {
    vy += 0.42;
    x += vx;
    y += vy;
    if (y + r > LINE_TOP) {
      y = LINE_TOP - r;
      if (vy > 2) {
        bounces.push({age, x, strength: vy});
      }
      vy = -vy * 0.58;
      vx *= 0.9;
    }
    path.push({x, y});
  }
  return {spawn, r, path, bounces};
});

// ---- Chaotic red charts from the previous scenes -----------------------------

const ChaosCharts: React.FC<{readonly frame: number; readonly color: string}> = ({frame, color}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {[0, 1, 2].map((line) => {
      const points = Array.from({length: 36}, (_, i) => {
        const x = i * 31;
        const base = 420 + line * 240 + i * 9 * (line === 1 ? 1.4 : 1);
        const jag = (random(`chaos-${line}-${i}`) - 0.5) * 220;
        const jitter = (random(`chaos-j-${line}-${i}-${frame}`) - 0.5) * 24;
        return `${x},${base + jag + jitter}`;
      }).join(' ');
      return (
        <polyline
          key={line}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={line === 1 ? 6 : 3}
          strokeOpacity={line === 1 ? 0.9 : 0.5}
          style={{filter: `drop-shadow(0 0 10px ${color})`}}
        />
      );
    })}
    {Array.from({length: 18}, (_, i) => {
      const x = 40 + i * 58;
      const top = 700 + (random(`cc-${i}`) - 0.3) * 500;
      const h = 40 + random(`ch-${i}`) * 160;
      return <rect key={i} x={x} y={top} width={22} height={h} fill={color} opacity={0.45} rx={3} />;
    })}
  </svg>
);

const SupportSceneInner: React.FC<SupportSceneProps> = ({accentColor, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const draw = interpolate(frame, [DRAW_START, DRAW_END], [0, 1], {...clamp, easing: expoInOut});
  const standsOut = interpolate(frame, [STANDS_OUT, STANDS_OUT + 20, STANDS_OUT + 90], [0, 1, 0.35], clamp);
  const glowBoost = 1 + standsOut * 0.8 + 0.15 * Math.sin(frame / 10);
  const pill = pop(frame, DRAW_END - 10, fps);
  const held = pop(frame, 290, fps);
  const header = pop(frame, 440, fps);

  return (
    <AbsoluteFill style={{fontFamily: UI_FONT, color: C.ink, ...style}}>
      <Interactive.Div
        name="Chaos charts"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: interpolate(frame, [40, 140], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div style={{position: 'absolute', inset: 0, filter: `blur(${interpolate(frame, [40, 140], [0, 10], clamp)}px)`}}>
          <ChaosCharts frame={frame} color="#FF3366" />
        </div>
      </Interactive.Div>

      {/* Lighting shift */}
      <div
        style={{
          position: 'absolute',
          left: -460,
          top: LINE_Y - 1000,
          width: 2000,
          height: 2000,
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 55%)`,
          opacity: interpolate(frame, [70, 170, 320], [0, 0.32, 0.14], clamp) + standsOut * 0.1,
        }}
      />

      <Interactive.Div
        name="Camera"
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: `540px ${LINE_Y}px`,
          scale: interpolate(frame, [STANDS_OUT, 750], [1, 1.05], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: expoInOut,
            output: 'perceptual-scale',
          }),
        }}
      >
        <Interactive.Div
          name="Held"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 560,
            textAlign: 'center',
            fontFamily: KINETIC_FONT,
            fontSize: 270,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: accentColor,
            textShadow: `0 0 50px ${accentColor}88`,
            opacity: Math.min(1, held * 1.5),
            scale: 1.5 - held * 0.5,
          }}
        >
          HELD.
        </Interactive.Div>

        {/* The support line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: LINE_Y - 40,
            width: draw * 1080,
            height: 80,
            background: accentColor,
            filter: 'blur(32px)',
            opacity: 0.55 * glowBoost,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: LINE_Y - 15,
            width: draw * 1080,
            height: 30,
            background: accentColor,
            filter: 'blur(10px)',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: LINE_Y - 9,
            width: draw * 1080,
            height: 18,
            background: `linear-gradient(180deg, #FFF3B0 0%, ${accentColor} 40%, #B8860B 100%)`,
            boxShadow: `0 0 30px ${accentColor}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: LINE_Y - 3,
            width: draw * 1080,
            height: 3,
            backgroundColor: '#FFFFFF',
            opacity: 0.85,
          }}
        />
        {draw > 0 && draw < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: draw * 1080 - 60,
              top: LINE_Y - 60,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FFFFFF 0%, rgba(255,215,0,0.8) 25%, transparent 70%)',
            }}
          />
        ) : null}

        <Interactive.Div
          name="Support label"
          style={{
            position: 'absolute',
            left: 60,
            top: LINE_Y - 128,
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
            padding: '14px 24px',
            transformOrigin: '0% 100%',
            ...glass('rgba(255,215,0,0.08)'),
            border: `2px solid ${accentColor}`,
            borderRadius: 18,
            opacity: Math.min(1, pill * 1.5),
            scale: pill,
          }}
        >
          <span
            style={{
              fontFamily: KINETIC_FONT,
              fontSize: 52,
              fontWeight: 700,
              color: accentColor,
              textShadow: `0 0 20px ${accentColor}88`,
            }}
          >
            $4,000
          </span>
          <span style={{fontSize: 28, fontWeight: 800, letterSpacing: '0.2em'}}>SUPPORT</span>
        </Interactive.Div>

        {/* Particles and impact ripples */}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {PARTICLES.map((p, i) => {
            const age = frame - p.spawn;
            if (age < 0 || age >= p.path.length) {
              return null;
            }
            return (
              <g key={`r-${i}`}>
                {p.bounces.map((b) => {
                  const since = age - b.age;
                  if (since < 0 || since > 26 || b.strength < 4) {
                    return null;
                  }
                  const k = since / 26;
                  return (
                    <ellipse
                      key={b.age}
                      cx={b.x}
                      cy={LINE_TOP}
                      rx={8 + k * Math.min(70, b.strength * 7)}
                      ry={(8 + k * Math.min(70, b.strength * 7)) * 0.22}
                      fill="none"
                      stroke="#FFF3B0"
                      strokeWidth={2.5}
                      opacity={1 - k}
                    />
                  );
                })}
              </g>
            );
          })}
          {PARTICLES.map((p, i) => {
            const age = frame - p.spawn;
            if (age < 0 || age >= p.path.length) {
              return null;
            }
            const {x, y} = p.path[age];
            const fadeIn = Math.min(1, age / 10);
            return (
              <g key={`p-${i}`} opacity={fadeIn}>
                <circle cx={x} cy={y} r={p.r * 3} fill={accentColor} opacity={0.18} />
                <circle cx={x} cy={y} r={p.r} fill="#FFE680" />
              </g>
            );
          })}
        </svg>

        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 1188,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.26em',
            color: C.mute,
            opacity: Math.min(1, header * 1.5),
            translate: `${(1 - header) * -30}px 0px`,
          }}
        >
          WHERE MARKETS MAKE LOWS
        </div>

        {CHECKS.map((check, i) => {
          const s = pop(frame, check.at, fps);
          const last = i === CHECKS.length - 1;
          return (
            <div
              key={check.text}
              style={{
                position: 'absolute',
                left: 80,
                top: 1240 + i * 118,
                width: 920,
                height: 96,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '0 28px',
                ...glass(last ? 'rgba(255,215,0,0.1)' : undefined),
                border: last ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.14)',
                boxShadow: last ? `0 0 40px ${accentColor}55` : undefined,
                borderRadius: 20,
                transformOrigin: '0% 50%',
                opacity: Math.min(1, s * 1.5),
                scale: 0.7 + s * 0.3,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: accentColor,
                  color: C.bg,
                  fontSize: 30,
                  fontWeight: 800,
                  boxShadow: `0 0 18px ${accentColor}`,
                }}
              >
                ✓
              </div>
              <span style={{fontSize: 36, fontWeight: 800, letterSpacing: '0.04em'}}>{check.text}</span>
            </div>
          );
        })}
      </Interactive.Div>
      <Audio name="SFX · Line draw" from={DRAW_START} src={staticFile('sfx/forceField_001.wav')} premountFor={fps} volume={0.5} />
      <Audio name="SFX · Line lands" from={DRAW_END} src={staticFile('sfx/impactMetal_heavy_001.wav')} premountFor={fps} volume={0.55} />
      <Audio name="SFX · Held" from={290} src={staticFile('sfx/lowFrequency_explosion_000.wav')} premountFor={fps} volume={0.45} />
      <Audio name="SFX · Check 1" from={465} src={staticFile('sfx/select_003.wav')} premountFor={fps} volume={0.45} />
      <Audio name="SFX · Check 2" from={615} src={staticFile('sfx/select_003.wav')} premountFor={fps} volume={0.45} />
      <Audio name="SFX · Check 3" from={675} src={staticFile('sfx/confirmation_002.wav')} premountFor={fps} volume={0.5} />
    </AbsoluteFill>
  );
};

const supportSceneSchema = {
  accentColor: {type: 'color', default: '#FFD700', description: 'Accent color'},
} as const satisfies InteractivitySchema;

export const SupportScene = Interactive.withSchema({
  Component: SupportSceneInner,
  componentName: '<SupportScene>',
  schema: supportSceneSchema,
  wrapInSequence: true,
});

export const SupportSceneComposition: React.FC = () => (
  <Composition
    id="SupportScene"
    component={SupportScene}
    durationInFrames={750}
    fps={60}
    width={1080}
    height={1920}
    defaultProps={{accentColor: '#FFD700'}}
  />
);
