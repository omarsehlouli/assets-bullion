import type React from 'react';
import {
  AbsoluteFill,
  Composition,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {KineticWords} from '../components/KineticWords';
import {clamp, DISPLAY_FONT, easeInOut, INK, MONO_FONT, NEON} from '../theme';

type EnergySceneProps = {
  readonly accentColor: string;
  readonly style?: React.CSSProperties;
};

// Frame where the Strait of Hormuz status flips to open.
const STRAIT_OPENS = 280;

const vizBox: React.CSSProperties = {
  position: 'relative',
  width: 260,
  height: 128,
  flexShrink: 0,
  borderRadius: 16,
  backgroundColor: 'rgba(234,240,255,0.03)',
  border: '1px solid rgba(234,240,255,0.12)',
  overflow: 'hidden',
};

const vizLabel: React.CSSProperties = {
  position: 'absolute',
  left: 16,
  top: 12,
  fontFamily: MONO_FONT,
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: '0.16em',
  color: 'rgba(234,240,255,0.55)',
};

const OilViz: React.FC<{readonly frame: number}> = ({frame}) => {
  const draw = interpolate(frame, [130, 210], [0, 1], {...clamp, easing: easeInOut});
  return (
    <div style={vizBox}>
      <div style={vizLabel}>OIL</div>
      <svg width={260} height={128} style={{position: 'absolute', inset: 0}}>
        <polyline
          points="20,48 52,44 78,58 104,54 132,70 158,66 184,84 210,82 238,100"
          fill="none"
          stroke={NEON.amber}
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - draw}
          style={{filter: `drop-shadow(0 0 8px ${NEON.amber})`}}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          right: 16,
          top: 10,
          fontSize: 22,
          color: NEON.amber,
          opacity: interpolate(frame, [200, 214], [0, 1], clamp),
        }}
      >
        ▼
      </div>
    </div>
  );
};

const RoadmapViz: React.FC<{readonly frame: number; readonly color: string}> = ({
  frame,
  color,
}) => {
  const progress = interpolate(frame, [176, 270], [0, 1], {...clamp, easing: easeInOut});
  return (
    <div style={vizBox}>
      <div style={vizLabel}>ROADMAP</div>
      <div
        style={{
          position: 'absolute',
          right: 16,
          top: 10,
          fontFamily: MONO_FONT,
          fontSize: 20,
          fontWeight: 800,
          color,
        }}
      >
        D+{String(Math.round(progress * 60)).padStart(2, '0')}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          top: 74,
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(234,240,255,0.1)',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            borderRadius: 4,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 20 + (i * 220) / 6 - 1,
            top: 92,
            width: 2,
            height: i % 3 === 0 ? 14 : 8,
            backgroundColor:
              progress * 6 >= i ? color : 'rgba(234,240,255,0.25)',
          }}
        />
      ))}
    </div>
  );
};

const StraitViz: React.FC<{readonly frame: number; readonly color: string}> = ({
  frame,
  color,
}) => {
  const open = frame >= STRAIT_OPENS;
  const statusColor = open ? color : NEON.red;
  return (
    <div style={vizBox}>
      <div style={vizLabel}>STRAIT</div>
      <svg width={260} height={128} style={{position: 'absolute', inset: 0}}>
        <path
          d="M 18 96 C 70 96, 90 62, 130 62 S 200 86, 242 70"
          fill="none"
          stroke={open ? color : 'rgba(234,240,255,0.2)'}
          strokeWidth={3}
          strokeDasharray="10 10"
          strokeDashoffset={open ? -(frame - STRAIT_OPENS) * 1.2 : 0}
          style={{filter: open ? `drop-shadow(0 0 6px ${color})` : 'none'}}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          right: 14,
          top: 10,
          padding: '3px 10px',
          borderRadius: 6,
          fontFamily: MONO_FONT,
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: '0.1em',
          color: '#03050B',
          backgroundColor: statusColor,
          boxShadow: `0 0 ${open ? interpolate(frame, [STRAIT_OPENS, STRAIT_OPENS + 20], [40, 14], clamp) : 10}px ${statusColor}`,
        }}
      >
        {open ? 'OPEN' : 'CLOSED'}
      </div>
    </div>
  );
};

const EnergySceneInner: React.FC<EnergySceneProps> = ({accentColor, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{fontFamily: DISPLAY_FONT, color: INK, ...style}}>
      <Interactive.Div
        name="Camera"
        style={{
          position: 'absolute',
          inset: 0,
          translate: interpolate(frame, [30, 8 * fps - 30], ['24px 8px', '-24px -6px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: easeInOut,
          }),
          scale: interpolate(frame, [30, 8 * fps - 30], [1.015, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: easeInOut,
            output: 'perceptual-scale',
          }),
        }}
      >
        <KineticWords
          name="Energy Relief title"
          from={20}
          premountFor={fps}
          mode="blur"
          unit="letter"
          highlight="Relief"
          highlightColor="#2BFF88"
          stagger={2}
          style={{
            position: 'absolute',
            left: 142,
            top: 150,
            fontSize: 156,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
          }}
        >
          Energy Relief
        </KineticWords>

        <Interactive.Div
          name="Oil row"
          style={{
            position: 'absolute',
            left: 142,
            top: 384,
            display: 'flex',
            alignItems: 'center',
            gap: 48,
            opacity: interpolate(frame, [110, 130], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [110, 146], ['160px 0px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOut,
            }),
          }}
        >
          <OilViz frame={frame} />
          <div style={{fontSize: 76, fontWeight: 800, letterSpacing: '-0.025em'}}>
            Oil <span style={{color: NEON.amber, textShadow: `0 0 26px ${NEON.amber}77`}}>Sliding</span>
          </div>
        </Interactive.Div>

        <Interactive.Div
          name="Roadmap row"
          style={{
            position: 'absolute',
            left: 142,
            top: 552,
            display: 'flex',
            alignItems: 'center',
            gap: 48,
            opacity: interpolate(frame, [150, 170], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [150, 186], ['160px 0px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOut,
            }),
          }}
        >
          <RoadmapViz frame={frame} color={accentColor} />
          <div style={{fontSize: 76, fontWeight: 800, letterSpacing: '-0.025em'}}>
            US-Iran Peace Roadmap{' '}
            <span
              style={{
                fontFamily: MONO_FONT,
                fontSize: 60,
                fontWeight: 700,
                color: accentColor,
                textShadow: `0 0 22px ${accentColor}77`,
              }}
            >
              (60 Days)
            </span>
          </div>
        </Interactive.Div>

        <Interactive.Div
          name="Strait row"
          style={{
            position: 'absolute',
            left: 142,
            top: 720,
            display: 'flex',
            alignItems: 'center',
            gap: 48,
            opacity: interpolate(frame, [190, 210], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [190, 226], ['160px 0px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOut,
            }),
          }}
        >
          <StraitViz frame={frame} color={accentColor} />
          <div style={{fontSize: 76, fontWeight: 800, letterSpacing: '-0.025em'}}>
            Strait of Hormuz{' '}
            <span
              style={{
                color: frame >= STRAIT_OPENS ? accentColor : INK,
                textShadow:
                  frame >= STRAIT_OPENS ? `0 0 26px ${accentColor}88` : 'none',
              }}
            >
              Reopens
            </span>
          </div>
        </Interactive.Div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const energySceneSchema = {
  accentColor: {type: 'color', default: '#2BFF88', description: 'Accent color'},
} as const satisfies InteractivitySchema;

export const EnergyScene = Interactive.withSchema({
  Component: EnergySceneInner,
  componentName: '<EnergyScene>',
  schema: energySceneSchema,
  wrapInSequence: true,
});

export const EnergySceneComposition: React.FC = () => (
  <Composition
    id="EnergyScene"
    component={EnergyScene}
    durationInFrames={480}
    fps={60}
    width={1920}
    height={1080}
    defaultProps={{accentColor: '#2BFF88'}}
  />
);
