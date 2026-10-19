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

type ConclusionSceneProps = {
  readonly accentColor: string;
  readonly style?: React.CSSProperties;
};

const PUNISHMENT = 180;
const HOLDS = 300;
const LOCK = 320;
const ATTENTION = 392;
const YESTERDAY = 525;

const TILES = [
  {label: 'BONDS', value: 'CRUSHED ▼'},
  {label: 'YIELDS', value: 'SURGING ▲'},
  {label: 'OIL', value: 'HIGHER ▲'},
  {label: 'SENTIMENT', value: 'EXTREME FEAR'},
];

const DAYS = [
  {day: 'MON', date: 'OCT 5'},
  {day: 'TUE', date: 'OCT 6'},
  {day: 'WED', date: 'OCT 7'},
  {day: 'THU', date: 'OCT 8'},
  {day: 'FRI', date: 'OCT 9'},
];
const TIMELINE_Y = 1300;
const dayX = (i: number) => 140 + i * 200;
const TARGET_X = dayX(3);

// Chart panel: the support line sits at the same screen height as the previous scene.
const CHART_TOP = 700;
const SUPPORT_LOCAL = 380;
const PRICE = Array.from({length: 30}, (_, i) => {
  const t = i / 29;
  const decline = 60 + t * 330 + (random(`cp-${i}`) - 0.5) * 50;
  const y = i >= 22 ? SUPPORT_LOCAL - 12 - Math.abs(Math.sin(i * 1.7)) * 34 : decline;
  return {x: 40 + t * 880, y: Math.min(SUPPORT_LOCAL - 10, i === 28 ? SUPPORT_LOCAL - 10 : y)};
});
const PRICE_LINE = PRICE.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

const ConclusionSceneInner: React.FC<ConclusionSceneProps> = ({accentColor, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const lock = pop(frame, LOCK, fps);
  const holds = pop(frame, HOLDS, fps);
  const pay = pop(frame, ATTENTION, fps);
  const attentionOut = interpolate(frame, [490, 520], [1, 0], clamp);
  const overlay = interpolate(frame, [ATTENTION - 6, ATTENTION + 10, 490, 520], [0, 1, 1, 0], clamp);
  const yesterday = pop(frame, YESTERDAY, fps);

  return (
    <AbsoluteFill style={{fontFamily: UI_FONT, color: C.ink, ...style}}>
      <Interactive.Div
        name="Camera pull-out"
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '540px 1080px',
          scale: interpolate(frame, [15, 200], [2.6, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: expoInOut,
            output: 'perceptual-scale',
          }),
        }}
      >
        <Interactive.Div
          name="Camera focus"
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: `${TARGET_X}px ${TIMELINE_Y}px`,
            scale: interpolate(frame, [YESTERDAY, 690], [1, 1.1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: expoInOut,
              output: 'perceptual-scale',
            }),
          }}
        >
          {/* Market landscape: headwinds */}
          {TILES.map((tile, i) => {
            const hit = pop(frame, PUNISHMENT + i * 25, fps);
            const flash = interpolate(frame - (PUNISHMENT + i * 25), [0, 4, 30], [0, 1, 0.25], clamp);
            return (
              <div
                key={tile.label}
                style={{
                  position: 'absolute',
                  left: i % 2 === 0 ? 60 : 555,
                  top: 230 + Math.floor(i / 2) * 215,
                  width: 465,
                  height: 190,
                  padding: '28px 30px',
                  ...glass('rgba(255,51,102,0.08)'),
                  border: `2px solid rgba(255,51,102,${0.25 + flash * 0.75})`,
                  boxShadow: `0 0 ${20 + flash * 40}px rgba(255,51,102,${0.15 + flash * 0.5})`,
                  scale: 1 + (hit > 0 ? (1 - hit) * -0.06 : 0),
                }}
              >
                <div style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.22em', color: C.mute}}>
                  {tile.label}
                </div>
                <div
                  style={{
                    marginTop: 18,
                    fontFamily: KINETIC_FONT,
                    fontSize: 50,
                    fontWeight: 700,
                    color: C.red,
                    textShadow: `0 0 ${10 + flash * 20}px ${C.red}AA`,
                  }}
                >
                  {tile.value}
                </div>
              </div>
            );
          })}

          {/* Data links from every headwind into the chart */}
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            {TILES.map((tile, i) => {
              const x = (i % 2 === 0 ? 60 : 555) + 232;
              const y = 230 + Math.floor(i / 2) * 215 + 190;
              const tx = 200 + i * 230;
              const ty = CHART_TOP;
              const packet = ((frame + i * 17) % 60) / 60;
              return (
                <g key={tile.label}>
                  <line x1={x} y1={y} x2={tx} y2={ty} stroke={C.cyan} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="5 7" />
                  <circle cx={x + (tx - x) * packet} cy={y + (ty - y) * packet} r={5} fill={C.cyan} />
                  <circle cx={x} cy={y} r={6} fill={C.cyan} />
                  <circle cx={tx} cy={ty} r={6} fill={C.cyan} />
                </g>
              );
            })}
          </svg>

          <div
            style={{
              position: 'absolute',
              left: 60,
              top: CHART_TOP,
              width: 960,
              height: 480,
              ...glass(),
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 30,
                top: 24,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.22em',
              }}
            >
              GOLD <span style={{color: C.mute}}>· SPOT</span>
            </div>
            <svg width={960} height={480} style={{position: 'absolute', inset: 0}}>
              <rect x={0} y={SUPPORT_LOCAL - 4} width={960} height={8} fill={accentColor} style={{filter: `drop-shadow(0 0 ${14 + holds * 16}px ${accentColor})`}} />
              <path d={PRICE_LINE} fill="none" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" strokeOpacity={0.9} />
              <circle cx={PRICE[PRICE.length - 2].x} cy={PRICE[PRICE.length - 2].y} r={9} fill={accentColor} />
            </svg>
            <div
              style={{
                position: 'absolute',
                right: 30,
                top: SUPPORT_LOCAL + 22,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 18px',
                borderRadius: 12,
                backgroundColor: accentColor,
                color: C.bg,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: '0.1em',
                transformOrigin: '100% 0%',
                opacity: Math.min(1, holds * 1.5),
                scale: holds,
              }}
            >
              $4,000 HELD ✓
            </div>
          </div>

          {/* Timeline */}
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <line x1={80} x2={1000} y1={TIMELINE_Y} y2={TIMELINE_Y} stroke="rgba(242,244,248,0.35)" strokeWidth={2} />
            {DAYS.map((d, i) => (
              <g key={d.date}>
                <line x1={dayX(i)} x2={dayX(i)} y1={TIMELINE_Y - 14} y2={TIMELINE_Y + 14} stroke={i === 3 ? accentColor : 'rgba(242,244,248,0.6)'} strokeWidth={3} />
                <text x={dayX(i)} y={TIMELINE_Y + 56} textAnchor="middle" fill={i === 3 && lock > 0.5 ? accentColor : C.ink} style={{fontFamily: UI_FONT, fontSize: 26, fontWeight: 800}}>
                  {d.date}
                </text>
                <text x={dayX(i)} y={TIMELINE_Y + 88} textAnchor="middle" fill={C.mute} style={{fontFamily: UI_FONT, fontSize: 20, fontWeight: 600, letterSpacing: '0.14em'}}>
                  {d.day}
                </text>
              </g>
            ))}
          </svg>

          <Interactive.Div
            name="Target lock"
            style={{
              position: 'absolute',
              left: TARGET_X - 110,
              top: TIMELINE_Y - 110,
              width: 220,
              height: 220,
              opacity: Math.min(1, lock * 1.6),
              scale: 3 - lock * 2,
              rotate: `${(1 - lock) * 180}deg`,
            }}
          >
            <svg width={220} height={220} viewBox="0 0 220 220" style={{overflow: 'visible'}}>
              {[0, 90, 180, 270].map((r) => (
                <path
                  key={r}
                  d="M 30 78 L 30 30 L 78 30"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={6}
                  transform={`rotate(${r} 110 110)`}
                  style={{filter: `drop-shadow(0 0 10px ${accentColor})`}}
                />
              ))}
              <circle cx={110} cy={110} r={56} fill="none" stroke={accentColor} strokeWidth={2} strokeDasharray="4 8" transform={`rotate(${frame * 2} 110 110)`} />
              {[0, 1, 2].map((k) => {
                const ping = ((frame - YESTERDAY + k * 20) % 60) / 60;
                return frame > YESTERDAY ? (
                  <circle key={k} cx={110} cy={110} r={20 + ping * 150} fill="none" stroke={accentColor} strokeWidth={3} opacity={1 - ping} />
                ) : null;
              })}
            </svg>
          </Interactive.Div>

          <div
            style={{
              position: 'absolute',
              left: TARGET_X - 150,
              top: TIMELINE_Y + 122,
              width: 300,
              display: 'flex',
              justifyContent: 'center',
              opacity: interpolate(frame, [LOCK + 40, LOCK + 50], [0, 1], clamp),
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: '0.24em',
                color: C.bg,
                backgroundColor: accentColor,
                padding: '6px 12px',
                borderRadius: 6,
                scale: frame >= YESTERDAY ? 0.6 + yesterday * 0.4 : 1,
              }}
            >
              {frame >= YESTERDAY ? 'YESTERDAY' : 'LOCKED'}
            </span>
          </div>
        </Interactive.Div>
      </Interactive.Div>

      {/* PAY ATTENTION. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(10,10,12,0.72)',
          backdropFilter: `blur(${overlay * 14}px)`,
          opacity: overlay,
        }}
      />
      <Interactive.Div
        name="Pay attention"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 690,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: KINETIC_FONT,
          fontWeight: 700,
          lineHeight: 0.9,
          opacity: attentionOut,
        }}
      >
        <div
          style={{
            fontSize: 300,
            letterSpacing: '-0.05em',
            color: accentColor,
            textShadow: `0 0 60px ${accentColor}99`,
            opacity: frame < ATTENTION ? 0 : Math.min(1, pay * 1.5),
            scale: 2.2 - pay * 1.2,
          }}
        >
          PAY
        </div>
        <div style={{display: 'flex', fontSize: 138, letterSpacing: '-0.02em', color: '#FFFFFF'}}>
          {'ATTENTION.'.split('').map((ch, i) => {
            const s = pop(frame, ATTENTION + 14 + i * 3, fps);
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: frame < ATTENTION + 14 + i * 3 ? 0 : Math.min(1, s * 1.5),
                  translate: `0 ${(1 - s) * 80}px`,
                  textShadow: `0 0 30px rgba(255,255,255,0.35)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      </Interactive.Div>
      <Audio name="SFX · Pull-out" from={15} src={staticFile('sfx/whoosh.wav')} premountFor={fps} volume={0.6} />
      {TILES.map((tile, i) => (
        <Audio key={tile.label} name={`SFX · ${tile.label}`} from={PUNISHMENT + i * 25} src={staticFile('sfx/tick_004.wav')} premountFor={fps} volume={0.5} />
      ))}
      <Audio name="SFX · Target lock" from={LOCK + 30} src={staticFile('sfx/confirmation_002.wav')} premountFor={fps} volume={0.5} />
      <Audio name="SFX · Pay attention" from={ATTENTION} src={staticFile('sfx/impactMetal_heavy_001.wav')} premountFor={fps} volume={0.75} />
      <Audio name="SFX · Pay attention boom" from={ATTENTION} src={staticFile('sfx/lowFrequency_explosion_000.wav')} premountFor={fps} volume={0.55} />
    </AbsoluteFill>
  );
};

const conclusionSceneSchema = {
  accentColor: {type: 'color', default: '#FFD700', description: 'Accent color'},
} as const satisfies InteractivitySchema;

export const ConclusionScene = Interactive.withSchema({
  Component: ConclusionSceneInner,
  componentName: '<ConclusionScene>',
  schema: conclusionSceneSchema,
  wrapInSequence: true,
});

export const ConclusionSceneComposition: React.FC = () => (
  <Composition
    id="ConclusionScene"
    component={ConclusionScene}
    durationInFrames={690}
    fps={60}
    width={1080}
    height={1920}
    defaultProps={{accentColor: '#FFD700'}}
  />
);
