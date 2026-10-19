import type React from 'react';
import {
  AbsoluteFill,
  Composition,
  Interactive,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {RollingNumber} from '../components/RollingNumber';
import {
  clamp,
  DISPLAY_FONT,
  easeInOut,
  easeOutExpo,
  INK,
  MONO_FONT,
  NEON,
} from '../theme';

type MetalsSceneProps = {
  readonly accentColor: string;
  readonly goldPrice: string;
  readonly silverPrice: string;
  readonly style?: React.CSSProperties;
};

const CHART_W = 872;
const CHART_H = 515;
const CHART_PAD_TOP = 40;
const CHART_PAD_BOTTOM = 30;

// Illustrative gold path: a sell-off into a low, then a rebound to the high.
const TREND_POINTS = 56;
const TREND = Array.from({length: TREND_POINTS}, (_, i) => {
  const t = i / (TREND_POINTS - 1);
  const base =
    t < 0.4
      ? 0.58 - 0.32 * Math.sin(((t / 0.4) * Math.PI) / 2)
      : 0.26 + 0.66 * ((t - 0.4) / 0.6) ** 1.25;
  const noise = i === TREND_POINTS - 1 ? 0 : (random(`gold-${i}`) - 0.5) * 0.07;
  return {
    x: t * CHART_W,
    y:
      CHART_PAD_TOP +
      (1 - (base + noise)) * (CHART_H - CHART_PAD_TOP - CHART_PAD_BOTTOM),
  };
});
const LOW_INDEX = TREND.reduce(
  (low, p, i) => (p.y > TREND[low].y ? i : low),
  0,
);
const LINE_PATH = TREND.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(
  ' ',
);
const AREA_PATH = `${LINE_PATH} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`;

const TrendChart: React.FC<{
  readonly progress: number;
  readonly color: string;
  readonly priceLabel: string;
  readonly frame: number;
}> = ({progress, color, priceLabel, frame}) => {
  const headX = progress * CHART_W;
  const seg = Math.min(TREND.length - 2, Math.floor(progress * (TREND.length - 1)));
  const segT = progress * (TREND.length - 1) - seg;
  const headY = TREND[seg].y + (TREND[seg + 1].y - TREND[seg].y) * segT;
  const lowPassed = headX >= TREND[LOW_INDEX].x;
  const tagPop = interpolate(progress, [0.97, 1], [0, 1], clamp);

  return (
    <div style={{position: 'relative', width: CHART_W, height: CHART_H}}>
      <svg
        width={CHART_W}
        height={CHART_H}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        style={{overflow: 'visible'}}
      >
        <defs>
          <linearGradient id="gold-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.32} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <clipPath id="gold-reveal">
            <rect x={-20} y={-40} width={headX + 20} height={CHART_H + 80} />
          </clipPath>
        </defs>

        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`h-${i}`}
            x1={0}
            x2={CHART_W}
            y1={CHART_PAD_TOP + (i * (CHART_H - CHART_PAD_TOP - CHART_PAD_BOTTOM)) / 4}
            y2={CHART_PAD_TOP + (i * (CHART_H - CHART_PAD_TOP - CHART_PAD_BOTTOM)) / 4}
            stroke="rgba(234,240,255,0.08)"
            strokeDasharray="4 8"
          />
        ))}
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line
            key={`v-${i}`}
            x1={(i * CHART_W) / 8}
            x2={(i * CHART_W) / 8}
            y1={0}
            y2={CHART_H}
            stroke="rgba(234,240,255,0.04)"
          />
        ))}

        <g clipPath="url(#gold-reveal)">
          <path d={AREA_PATH} fill="url(#gold-area)" />
          <path
            d={LINE_PATH}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeOpacity={0.45}
            filter="url(#gold-glow)"
          />
          <path
            d={LINE_PATH}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        {lowPassed ? (
          <g
            opacity={interpolate(
              headX - TREND[LOW_INDEX].x,
              [0, 60],
              [0, 1],
              clamp,
            )}
          >
            <circle
              cx={TREND[LOW_INDEX].x}
              cy={TREND[LOW_INDEX].y}
              r={9}
              fill="none"
              stroke="rgba(234,240,255,0.7)"
              strokeWidth={2}
            />
            <text
              x={TREND[LOW_INDEX].x}
              y={TREND[LOW_INDEX].y + 40}
              textAnchor="middle"
              fill="rgba(234,240,255,0.6)"
              style={{fontFamily: MONO_FONT, fontSize: 20, letterSpacing: '0.16em'}}
            >
              LOW
            </text>
          </g>
        ) : null}

        {progress > 0 ? (
          <>
            <circle
              cx={headX}
              cy={headY}
              r={10 + ((frame % 40) / 40) * 26}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={1 - (frame % 40) / 40}
            />
            <circle cx={headX} cy={headY} r={10} fill={color} />
            <circle cx={headX} cy={headY} r={4} fill="#FFFFFF" />
          </>
        ) : null}
      </svg>

      <div
        style={{
          position: 'absolute',
          right: -8,
          top: TREND[TREND.length - 1].y - 78,
          padding: '8px 16px',
          borderRadius: 8,
          backgroundColor: color,
          color: '#03050B',
          fontFamily: MONO_FONT,
          fontSize: 28,
          fontWeight: 800,
          boxShadow: `0 0 28px ${color}`,
          opacity: tagPop,
          scale: 0.6 + tagPop * 0.4,
          transformOrigin: '100% 100%',
        }}
      >
        {priceLabel}
      </div>
    </div>
  );
};

const MetalsSceneInner: React.FC<MetalsSceneProps> = ({
  accentColor,
  goldPrice,
  silverPrice,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{fontFamily: DISPLAY_FONT, color: INK, ...style}}>
      <Interactive.Div
        name="Camera"
        style={{
          position: 'absolute',
          inset: 0,
          scale: interpolate(frame, [30, 8 * fps - 30], [1.015, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: easeInOut,
            output: 'perceptual-scale',
          }),
          translate: interpolate(
            frame,
            [30, 8 * fps - 30],
            ['26px 0px', '-26px 0px'],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOut,
            },
          ),
        }}
      >
        <Interactive.Div
          name="Gold card"
          style={{
            position: 'absolute',
            left: 142,
            top: 160,
            width: 640,
            padding: '34px 40px 30px 48px',
            borderRadius: 20,
            backgroundColor: 'rgba(255,200,61,0.05)',
            border: '1px solid rgba(255,200,61,0.22)',
            boxShadow: '0 0 60px rgba(255,200,61,0.08)',
            overflow: 'hidden',
            opacity: interpolate(frame, [6, 24], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [6, 44], ['-90px 0px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeOutExpo,
            }),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 6,
              backgroundColor: accentColor,
              boxShadow: `0 0 20px ${accentColor}`,
            }}
          />
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <span style={{fontSize: 54, fontWeight: 800}}>Gold</span>
            <span
              style={{
                fontFamily: MONO_FONT,
                fontSize: 22,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${accentColor}`,
                color: accentColor,
              }}
            >
              XAU
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: MONO_FONT,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: NEON.green,
                textShadow: `0 0 14px ${NEON.green}`,
                opacity: interpolate(frame, [140, 156], [0, 1], clamp),
              }}
            >
              ▲ REBOUND
            </span>
          </div>
          <RollingNumber
            name="Gold price"
            from={40}
            premountFor={fps}
            stagger={5}
            duration={60}
            style={{
              marginTop: 10,
              fontSize: 140,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: accentColor,
              filter: `drop-shadow(0 0 24px ${accentColor}88)`,
            }}
          >
            {goldPrice}
          </RollingNumber>
        </Interactive.Div>

        <Interactive.Div
          name="Silver card"
          style={{
            position: 'absolute',
            left: 142,
            top: 490,
            width: 640,
            padding: '34px 40px 30px 48px',
            borderRadius: 20,
            backgroundColor: 'rgba(201,214,232,0.04)',
            border: '1px solid rgba(201,214,232,0.18)',
            overflow: 'hidden',
            opacity: interpolate(frame, [18, 36], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [18, 56], ['-90px 0px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeOutExpo,
            }),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 6,
              backgroundColor: '#C9D6E8',
              boxShadow: '0 0 20px #C9D6E8',
            }}
          />
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <span style={{fontSize: 54, fontWeight: 800}}>Silver</span>
            <span
              style={{
                fontFamily: MONO_FONT,
                fontSize: 22,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid #C9D6E8',
                color: '#C9D6E8',
              }}
            >
              XAG
            </span>
          </div>
          <RollingNumber
            name="Silver price"
            from={60}
            premountFor={fps}
            stagger={5}
            duration={56}
            style={{
              marginTop: 10,
              fontSize: 140,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#E4ECF7',
              filter: 'drop-shadow(0 0 22px rgba(201,214,232,0.45))',
            }}
          >
            {silverPrice}
          </RollingNumber>
        </Interactive.Div>

        <Interactive.Div
          name="Chart panel"
          style={{
            position: 'absolute',
            left: 842,
            top: 160,
            width: 936,
            padding: '28px 32px 32px 32px',
            borderRadius: 20,
            backgroundColor: 'rgba(234,240,255,0.025)',
            border: '1px solid rgba(234,240,255,0.1)',
            opacity: interpolate(frame, [12, 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [12, 50], ['80px 0px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeOutExpo,
            }),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              marginBottom: 18,
              fontFamily: MONO_FONT,
              fontSize: 24,
            }}
          >
            <span style={{fontWeight: 800, color: accentColor}}>XAU/USD</span>
            <span style={{color: 'rgba(234,240,255,0.5)', letterSpacing: '0.12em'}}>
              GOLD VS. US DOLLAR
            </span>
            <span
              style={{
                marginLeft: 'auto',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: accentColor,
                boxShadow: `0 0 12px ${accentColor}`,
                opacity: 0.5 + 0.5 * Math.cos(frame / 8),
              }}
            />
          </div>
          <TrendChart
            frame={frame}
            color={accentColor}
            priceLabel={goldPrice}
            progress={interpolate(frame, [70, 250], [0, 1], {
              ...clamp,
              easing: easeInOut,
            })}
          />
        </Interactive.Div>

        <Interactive.Div
          name="Subtitle"
          style={{
            position: 'absolute',
            left: 122,
            top: 832,
            paddingLeft: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            clipPath: `inset(-20px ${interpolate(frame, [190, 236], [100, 0], {
              ...clamp,
              easing: easeInOut,
            })}% -20px 0px)`,
          }}
        >
          <div
            style={{
              width: 8,
              height: 76,
              borderRadius: 4,
              backgroundColor: accentColor,
              boxShadow: `0 0 18px ${accentColor}`,
            }}
          />
          Gold rebounds against the dollar
        </Interactive.Div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const metalsSceneSchema = {
  accentColor: {type: 'color', default: '#FFC83D', description: 'Accent color'},
  goldPrice: {type: 'text-content', default: '$4,200', description: 'Gold price'},
  silverPrice: {type: 'text-content', default: '$66', description: 'Silver price'},
} as const satisfies InteractivitySchema;

export const MetalsScene = Interactive.withSchema({
  Component: MetalsSceneInner,
  componentName: '<MetalsScene>',
  schema: metalsSceneSchema,
  wrapInSequence: true,
});

export const MetalsSceneComposition: React.FC = () => (
  <Composition
    id="MetalsScene"
    component={MetalsScene}
    durationInFrames={480}
    fps={60}
    width={1920}
    height={1080}
    defaultProps={{accentColor: '#FFC83D', goldPrice: '$4,200', silverPrice: '$66'}}
  />
);
