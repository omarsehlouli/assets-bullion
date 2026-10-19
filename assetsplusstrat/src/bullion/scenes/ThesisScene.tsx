import {Audio} from '@remotion/media';
import type React from 'react';
import {
  AbsoluteFill,
  Composition,
  Easing,
  Interactive,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {TypeText} from '../components/TypeText';
import {
  C,
  clamp,
  expoInOut,
  glass,
  KINETIC_FONT,
  pop,
  UI_FONT,
} from '../theme';

type ThesisSceneProps = {
  readonly accentColor: string;
  readonly style?: React.CSSProperties;
};

const FLIP_FRAMES = 6;

// A split-flap card that flips through `values`, one flip per entry in `at`.
const FlipCard: React.FC<{
  readonly frame: number;
  readonly values: string[];
  readonly at: number[];
  readonly width: number;
  readonly color: string;
}> = ({frame, values, at, width, color}) => {
  const index = at.filter((f) => frame >= f).length;
  const current = values[index];
  const previous = values[Math.max(0, index - 1)];
  const p = index === 0 ? 1 : Math.min(1, (frame - at[index - 1]) / FLIP_FRAMES);

  const half = (text: string, part: 'top' | 'bottom', extra?: React.CSSProperties) => (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: part === 'top' ? 0 : '50%',
        height: '50%',
        overflow: 'hidden',
        background:
          part === 'top'
            ? 'linear-gradient(180deg, #1C1C23 0%, #15151B 100%)'
            : 'linear-gradient(180deg, #121217 0%, #0E0E12 100%)',
        ...extra,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 150,
          top: part === 'top' ? 0 : -75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: KINETIC_FONT,
          fontWeight: 700,
          fontSize: 96,
          letterSpacing: '-0.02em',
          color,
          textShadow: color === C.ink ? undefined : `0 0 26px ${color}99`,
        }}
      >
        {text}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'relative',
        width,
        height: 150,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
      }}
    >
      {half(current, 'top')}
      {half(p < 0.5 ? previous : current, 'bottom')}
      {p < 0.5
        ? half(previous, 'top', {transformOrigin: '50% 100%', scale: `1 ${1 - p * 2}`})
        : p < 1
          ? half(current, 'bottom', {transformOrigin: '50% 0%', scale: `1 ${p * 2 - 1}`})
          : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 74,
          height: 2,
          backgroundColor: 'rgba(0,0,0,0.85)',
        }}
      />
    </div>
  );
};

// Illustrative gold path: a long correction into a low yesterday, ticking up today.
const POINTS = 42;
const CHART_W = 960;
const CHART_H = 520;
const SERIES = Array.from({length: POINTS}, (_, i) => {
  const t = i / (POINTS - 1);
  const lowAt = (POINTS - 2) / (POINTS - 1);
  const base =
    t < 0.42
      ? 0.62 + 0.24 * Math.sin((t / 0.42) * (Math.PI / 2))
      : t <= lowAt
        ? 0.86 - 0.68 * ((t - 0.42) / (lowAt - 0.42)) ** 0.9
        : 0.24;
  const noise = i >= POINTS - 2 ? 0 : (random(`thesis-${i}`) - 0.5) * 0.08;
  return {
    x: 20 + t * 860,
    y: 40 + (1 - (base + noise)) * (CHART_H - 80),
  };
});
const LOW = SERIES[POINTS - 2];
const LINE = SERIES.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
const AREA = `${LINE} L ${SERIES[POINTS - 1].x} ${CHART_H} L ${SERIES[0].x} ${CHART_H} Z`;
const CHART_LEFT = 60;
const CHART_TOP = 1110;

const ThesisSceneInner: React.FC<ThesisSceneProps> = ({accentColor, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const reveal = interpolate(frame, [30, 230], [0, 1], {...clamp, easing: expoInOut});
  const pulse = 0.5 + 0.5 * Math.sin(frame / 16);
  const lock = pop(frame, 420, fps);
  const chipPop = pop(frame, 290, fps);
  const confluence = pop(frame, 500, fps);
  const lowX = CHART_LEFT + LOW.x;
  const lowY = CHART_TOP + LOW.y;

  const sources = [
    {x: 60, y: 1250, delay: 470},
    {x: 1040, y: 1140, delay: 482},
    {x: 300, y: 1680, delay: 494},
    {x: 1040, y: 1700, delay: 506},
  ];

  return (
    <AbsoluteFill style={{fontFamily: UI_FONT, color: C.ink, ...style}}>
      <Interactive.Div
        name="Camera"
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '540px 375px',
          scale: interpolate(frame, [0, 104, 134, 735], [2.6, 2.4, 1, 1.05], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: expoInOut,
            output: 'perceptual-scale',
          }),
          translate: interpolate(
            frame,
            [0, 104, 134],
            ['0px 585px', '0px 585px', '0px 0px'],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: expoInOut,
            },
          ),
        }}
      >
        <Interactive.Div
          name="Gold chart"
          style={{
            position: 'absolute',
            left: CHART_LEFT,
            top: CHART_TOP,
            width: CHART_W,
            height: CHART_H,
            opacity: interpolate(frame, [30, 120, 400, 460], [0, 0.55, 0.55, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <svg width={CHART_W} height={CHART_H} style={{overflow: 'visible'}}>
            <defs>
              <linearGradient id="thesis-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.28} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
              <filter id="thesis-glow" x="-10%" y="-30%" width="120%" height="160%">
                <feGaussianBlur stdDeviation={8 + pulse * 10} />
              </filter>
              <clipPath id="thesis-reveal">
                <rect x={0} y={-60} width={reveal * CHART_W} height={CHART_H + 120} />
              </clipPath>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={0}
                x2={CHART_W}
                y1={40 + i * 110}
                y2={40 + i * 110}
                stroke="rgba(242,244,248,0.07)"
                strokeDasharray="3 9"
              />
            ))}
            <g clipPath="url(#thesis-reveal)">
              <path d={AREA} fill="url(#thesis-area)" />
              <path
                d={LINE}
                fill="none"
                stroke={accentColor}
                strokeWidth={14}
                strokeOpacity={0.35 + pulse * 0.35}
                filter="url(#thesis-glow)"
              />
              <path
                d={LINE}
                fill="none"
                stroke={accentColor}
                strokeWidth={5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </Interactive.Div>

        <Interactive.Div
          name="Calendar"
          style={{
            position: 'absolute',
            left: 110,
            top: 236,
            width: 860,
            padding: '22px 28px 28px 28px',
            ...glass(),
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.26em',
              color: C.mute,
              marginBottom: 16,
            }}
          >
            <span>MARKET DATE</span>
            <span style={{color: accentColor}}>● SESSION</span>
          </div>
          <div style={{display: 'flex', gap: 16}}>
            <FlipCard
              frame={frame}
              width={170}
              color={C.ink}
              values={['MON', 'TUE', 'WED', 'THU', 'FRI']}
              at={[10, 22, 34, 46]}
            />
            <FlipCard
              frame={frame}
              width={190}
              color={C.ink}
              values={['JUL', 'AUG', 'SEP', 'OCT']}
              at={[16, 34, 52]}
            />
            <FlipCard
              frame={frame}
              width={170}
              color={accentColor}
              values={['01', '02', '03', '04', '05', '06', '07', '08', '09']}
              at={[8, 16, 24, 32, 40, 48, 56, 64]}
            />
            <FlipCard
              frame={frame}
              width={226}
              color={C.ink}
              values={['2026']}
              at={[]}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius: 28,
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 40px ${accentColor}88`,
              opacity: interpolate(frame, [72, 78, 120], [0, 1, 0], clamp),
            }}
          />
        </Interactive.Div>

        <TypeText
          name="Title"
          from={150}
          premountFor={fps}
          framesPerChar={4}
          highlight="LOW?"
          highlightColor="#FFD700"
          cursorColor="#FFD700"
          style={{
            position: 'absolute',
            left: 80,
            top: 560,
            width: 940,
            fontSize: 140,
            fontWeight: 700,
            lineHeight: 0.98,
            letterSpacing: '-0.035em',
          }}
        >
          {'DID METALS\nMAKE THEIR\nLOW?'}
        </TypeText>

        <Interactive.Div
          name="Analyst view chip"
          style={{
            position: 'absolute',
            left: 80,
            top: 1010,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 20px',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.18em',
            transformOrigin: '0% 50%',
            ...glass(),
            borderRadius: 999,
            opacity: Math.min(1, chipPop * 1.4),
            scale: chipPop,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: C.cyan,
              boxShadow: `0 0 12px ${C.cyan}`,
            }}
          />
          ANALYST VIEW
          <span
            style={{
              fontSize: 18,
              color: C.bg,
              backgroundColor: accentColor,
              padding: '3px 8px',
              borderRadius: 4,
              letterSpacing: '0.12em',
            }}
          >
            RARE CALL
          </span>
        </Interactive.Div>

        {/* Confluence: data lines converging on yesterday's low */}
        <svg
          width={1080}
          height={1920}
          style={{position: 'absolute', inset: 0, overflow: 'visible'}}
        >
          {sources.map((s, i) => {
            const draw = interpolate(frame, [s.delay, s.delay + 34], [0, 1], {
              ...clamp,
              easing: expoInOut,
            });
            const packet = ((frame - s.delay) / 50) % 1;
            return (
              <g key={i} opacity={draw > 0 ? 1 : 0}>
                <line
                  x1={s.x}
                  y1={s.y}
                  x2={s.x + (lowX - s.x) * draw}
                  y2={s.y + (lowY - s.y) * draw}
                  stroke={C.cyan}
                  strokeWidth={3}
                  strokeOpacity={0.8}
                  style={{filter: `drop-shadow(0 0 8px ${C.cyan})`}}
                />
                {draw >= 1 ? (
                  <circle
                    cx={s.x + (lowX - s.x) * packet}
                    cy={s.y + (lowY - s.y) * packet}
                    r={6}
                    fill="#FFFFFF"
                    style={{filter: `drop-shadow(0 0 10px ${C.cyan})`}}
                  />
                ) : null}
                <circle cx={s.x} cy={s.y} r={7} fill={C.cyan} />
              </g>
            );
          })}
        </svg>

        <Interactive.Div
          name="Confluence label"
          style={{
            position: 'absolute',
            left: 80,
            top: 1150,
            fontFamily: KINETIC_FONT,
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: C.cyan,
            textShadow: `0 0 30px ${C.cyan}AA`,
            transformOrigin: '0% 50%',
            opacity: Math.min(1, confluence * 1.4),
            scale: 0.6 + confluence * 0.4,
          }}
        >
          CONFLUENCE
        </Interactive.Div>

        <Interactive.Div
          name="Low target"
          style={{
            position: 'absolute',
            left: lowX - 70,
            top: lowY - 70,
            width: 140,
            height: 140,
            opacity: Math.min(1, lock * 1.5),
            scale: 2.2 - lock * 1.2,
            rotate: `${(1 - lock) * 90}deg`,
          }}
        >
          <svg width={140} height={140} viewBox="0 0 140 140">
            {[0, 90, 180, 270].map((r) => (
              <path
                key={r}
                d="M 18 48 L 18 18 L 48 18"
                fill="none"
                stroke={accentColor}
                strokeWidth={5}
                transform={`rotate(${r} 70 70)`}
                style={{filter: `drop-shadow(0 0 8px ${accentColor})`}}
              />
            ))}
            <circle cx={70} cy={70} r={10} fill={accentColor} />
            <circle
              cx={70}
              cy={70}
              r={14 + ((frame % 45) / 45) * 40}
              fill="none"
              stroke={accentColor}
              strokeWidth={2}
              opacity={1 - (frame % 45) / 45}
            />
          </svg>
        </Interactive.Div>

        <Interactive.Div
          name="Low label"
          style={{
            position: 'absolute',
            left: lowX - 470,
            top: lowY - 44,
            width: 380,
            display: 'flex',
            justifyContent: 'flex-end',
            transformOrigin: '100% 50%',
            opacity: interpolate(frame, [440, 460], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [440, 488], ['40px 0px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.spring({stiffness: 120, damping: 14}),
            }),
          }}
        >
          <div
            style={{
              padding: '14px 22px',
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: C.bg,
              backgroundColor: accentColor,
              borderRadius: 12,
              boxShadow: `0 0 30px ${accentColor}88`,
            }}
          >
            OCT 8 · THE LOW?
          </div>
        </Interactive.Div>
      </Interactive.Div>
      <Audio name="SFX · Calendar flips" src={staticFile('sfx/calendar-flips.wav')} premountFor={fps} volume={0.7} />
      <Audio name="SFX · Snap zoom" from={98} src={staticFile('sfx/whoosh.wav')} premountFor={fps} volume={0.8} />
      <Audio name="SFX · Title typing" from={150} src={staticFile('sfx/typing-title.wav')} premountFor={fps} volume={0.8} />
      <Audio name="SFX · Chip pop" from={290} src={staticFile('sfx/select_003.wav')} premountFor={fps} volume={0.4} />
      <Audio name="SFX · Target lock" from={420} src={staticFile('sfx/confirmation_002.wav')} premountFor={fps} volume={0.5} />
      <Audio name="SFX · Confluence" from={470} src={staticFile('sfx/forceField_001.wav')} premountFor={fps} volume={0.35} />
    </AbsoluteFill>
  );
};

const thesisSceneSchema = {
  accentColor: {type: 'color', default: '#FFD700', description: 'Accent color'},
} as const satisfies InteractivitySchema;

export const ThesisScene = Interactive.withSchema({
  Component: ThesisSceneInner,
  componentName: '<ThesisScene>',
  schema: thesisSceneSchema,
  wrapInSequence: true,
});

export const ThesisSceneComposition: React.FC = () => (
  <Composition
    id="ThesisScene"
    component={ThesisScene}
    durationInFrames={735}
    fps={60}
    width={1080}
    height={1920}
    defaultProps={{accentColor: '#FFD700'}}
  />
);
