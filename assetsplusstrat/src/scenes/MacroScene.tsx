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
  easeInSharp,
  easeOutExpo,
  INK,
  MONO_FONT,
  NEON,
} from '../theme';

type MacroSceneProps = {
  readonly accentColor: string;
  readonly officials: string;
  readonly officialsTotal: number;
  readonly hikeOdds: number;
  readonly style?: React.CSSProperties;
};

// Frames where the headlines hit the screen.
const FED_IMPACT = 56;
const DOLLAR_IMPACT = 112;

const MacroSceneInner: React.FC<MacroSceneProps> = ({
  accentColor,
  officials,
  officialsTotal,
  hikeOdds,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Camera shake on each impact, decaying quickly.
  const shake =
    interpolate(frame, [FED_IMPACT, FED_IMPACT + 22], [24, 0], clamp) +
    interpolate(frame, [DOLLAR_IMPACT, DOLLAR_IMPACT + 16], [12, 0], clamp);
  const shakeX = (random(`shake-x-${frame}`) - 0.5) * 2 * shake;
  const shakeY = (random(`shake-y-${frame}`) - 0.5) * 2 * shake;

  // RGB split on the headlines right after impact.
  const split =
    interpolate(frame, [FED_IMPACT, FED_IMPACT + 24], [16, 0], clamp) +
    interpolate(frame, [DOLLAR_IMPACT, DOLLAR_IMPACT + 18], [8, 0], clamp);
  const rgbSplit = `${split}px 0 0 rgba(255,45,85,0.85), ${-split}px 0 0 rgba(0,229,255,0.85)`;
  const flicker = [FED_IMPACT + 2, FED_IMPACT + 5, FED_IMPACT + 9].includes(frame)
    ? 0.3
    : 1;

  const litDots = Number(officials);

  return (
    <AbsoluteFill style={{fontFamily: DISPLAY_FONT, color: INK, ...style}}>
      <AbsoluteFill style={{translate: `${shakeX}px ${shakeY}px`}}>
        <Interactive.Div
          name="Camera"
          style={{
            position: 'absolute',
            inset: 0,
            translate: interpolate(frame, [170, 230], ['0px 210px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOut,
            }),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 142,
              top: 150,
              display: 'flex',
              alignItems: 'center',
              gap: 40,
            }}
          >
            <Interactive.Div
              name="The Fed"
              style={{
                fontSize: 150,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                opacity: interpolate(frame, [34, 38], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
                translate: interpolate(frame, [34, 46], ['-320px 0px', '0px 0px'], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: easeOutExpo,
                }),
              }}
            >
              <span style={{textShadow: rgbSplit}}>The Fed:</span>
            </Interactive.Div>
            <Interactive.Div
              name="Hawkish stamp"
              style={{
                opacity: interpolate(frame, [44, 48], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
                scale: interpolate(frame, [44, 56], [2.8, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: easeInSharp,
                  output: 'perceptual-scale',
                }),
                rotate: interpolate(frame, [44, 56], ['-10deg', '-3deg'], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: easeInSharp,
                }),
              }}
            >
              <div
                style={{
                  transform: 'skewX(-10deg)',
                  padding: '6px 34px 10px 34px',
                  backgroundColor: accentColor,
                  boxShadow: `0 0 60px ${accentColor}AA, 0 0 140px ${accentColor}55`,
                  color: '#0A0206',
                  fontSize: 132,
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                  opacity: flicker,
                }}
              >
                Hawkish
              </div>
            </Interactive.Div>
          </div>

          <Interactive.Div
            name="Dollar headline"
            style={{
              position: 'absolute',
              left: 142,
              top: 360,
              display: 'flex',
              alignItems: 'center',
              gap: 30,
              opacity: interpolate(frame, [100, 104], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              translate: interpolate(frame, [100, 112], ['560px 0px', '0px 0px'], {
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
                gap: 12,
                padding: '10px 20px',
                borderRadius: 10,
                border: `2px solid ${NEON.cyan}`,
                boxShadow: `0 0 24px ${NEON.cyan}55, inset 0 0 16px ${NEON.cyan}33`,
                fontFamily: MONO_FONT,
                fontSize: 40,
                fontWeight: 800,
                color: NEON.cyan,
              }}
            >
              USD
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 30,
                  translate: `0 ${interpolate(frame % 50, [0, 25, 50], [3, -5, 3])}px`,
                }}
              >
                ▲
              </span>
            </div>
            <div
              style={{
                transform: `skewX(${interpolate(frame, [100, 118], [-20, 0], {
                  ...clamp,
                  easing: easeOutExpo,
                })}deg)`,
                fontSize: 96,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                textShadow: rgbSplit,
              }}
            >
              Dollar hits{' '}
              <span style={{color: NEON.cyan, textShadow: `0 0 28px ${NEON.cyan}88`}}>
                1-Year High
              </span>
            </div>
          </Interactive.Div>

          <Interactive.Div
            name="Officials card"
            style={{
              position: 'absolute',
              left: 142,
              top: 520,
              width: 795,
              padding: '32px 44px 38px 44px',
              borderRadius: 18,
              backgroundColor: 'rgba(255,45,85,0.06)',
              border: '1px solid rgba(255,45,85,0.3)',
              clipPath: `inset(0 ${interpolate(frame, [196, 214], [100, 0], {
                ...clamp,
                easing: easeOutExpo,
              })}% 0 0)`,
            }}
          >
            <div
              style={{
                fontFamily: MONO_FONT,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: accentColor,
              }}
            >
              FOMC · RATE OUTLOOK
            </div>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
              <RollingNumber
                name="Officials count"
                from={204}
                premountFor={fps}
                stagger={0}
                duration={34}
                style={{
                  fontSize: 150,
                  fontWeight: 800,
                  color: accentColor,
                  filter: `drop-shadow(0 0 26px ${accentColor}99)`,
                }}
              >
                {officials}
              </RollingNumber>
              <span
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 64,
                  fontWeight: 700,
                  color: 'rgba(234,240,255,0.55)',
                }}
              >
                of {officialsTotal}
              </span>
            </div>
            <div style={{fontSize: 54, fontWeight: 700, letterSpacing: '-0.01em'}}>
              officials see rate hike
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 26}}>
              {Array.from({length: officialsTotal}, (_, i) => {
                const on =
                  i < litDots &&
                  frame >= 222 + i * 5;
                return (
                  <div
                    key={i}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: on ? accentColor : 'transparent',
                      border: `2px solid ${on ? accentColor : 'rgba(234,240,255,0.25)'}`,
                      boxShadow: on ? `0 0 14px ${accentColor}` : 'none',
                    }}
                  />
                );
              })}
            </div>
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${interpolate(frame, [196, 214], [0, 100], {
                  ...clamp,
                  easing: easeOutExpo,
                })}%`,
                width: 6,
                backgroundColor: '#FFFFFF',
                boxShadow: `0 0 24px ${accentColor}`,
                opacity: interpolate(frame, [210, 220], [1, 0], clamp),
              }}
            />
          </Interactive.Div>

          <Interactive.Div
            name="Odds card"
            style={{
              position: 'absolute',
              left: 983,
              top: 520,
              width: 795,
              padding: '32px 44px 38px 44px',
              borderRadius: 18,
              backgroundColor: 'rgba(255,45,85,0.06)',
              border: '1px solid rgba(255,45,85,0.3)',
              clipPath: `inset(0 ${interpolate(frame, [226, 244], [100, 0], {
                ...clamp,
                easing: easeOutExpo,
              })}% 0 0)`,
            }}
          >
            <div
              style={{
                fontFamily: MONO_FONT,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: accentColor,
              }}
            >
              MARKET-IMPLIED ODDS
            </div>
            <RollingNumber
              name="Odds value"
              from={234}
              premountFor={fps}
              stagger={6}
              duration={44}
              style={{
                fontSize: 150,
                fontWeight: 800,
                color: accentColor,
                filter: `drop-shadow(0 0 26px ${accentColor}99)`,
              }}
            >
              {`${hikeOdds}%`}
            </RollingNumber>
            <div style={{fontSize: 54, fontWeight: 700, letterSpacing: '-0.01em'}}>
              chance of September move
            </div>
            <div
              style={{
                position: 'relative',
                marginTop: 30,
                height: 20,
                borderRadius: 10,
                backgroundColor: 'rgba(234,240,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 10,
                  backgroundColor: accentColor,
                  boxShadow: `0 0 18px ${accentColor}`,
                  width: `${interpolate(frame, [244, 300], [0, hikeOdds], {
                    ...clamp,
                    easing: easeInOut,
                  })}%`,
                }}
              />
              {[25, 50, 75].map((tick) => (
                <div
                  key={tick}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${tick}%`,
                    width: 2,
                    backgroundColor: 'rgba(3,5,11,0.6)',
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${interpolate(frame, [226, 244], [0, 100], {
                  ...clamp,
                  easing: easeOutExpo,
                })}%`,
                width: 6,
                backgroundColor: '#FFFFFF',
                boxShadow: `0 0 24px ${accentColor}`,
                opacity: interpolate(frame, [240, 250], [1, 0], clamp),
              }}
            />
          </Interactive.Div>
        </Interactive.Div>
      </AbsoluteFill>

      <Interactive.Div
        name="Impact flash"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#FFE3EA',
          mixBlendMode: 'screen',
          opacity:
            interpolate(frame, [FED_IMPACT - 1, FED_IMPACT, FED_IMPACT + 10], [0, 0.32, 0], clamp) +
            interpolate(
              frame,
              [DOLLAR_IMPACT - 1, DOLLAR_IMPACT, DOLLAR_IMPACT + 8],
              [0, 0.16, 0],
              clamp,
            ),
        }}
      />
    </AbsoluteFill>
  );
};

const macroSceneSchema = {
  accentColor: {type: 'color', default: '#FF2D55', description: 'Accent color'},
  officials: {type: 'text-content', default: '9', description: 'Officials seeing a hike'},
  officialsTotal: {
    type: 'number',
    hiddenFromList: false,
    default: 19,
    min: 1,
    step: 1,
    integer: true,
    keyframable: false,
    description: 'Officials total',
  },
  hikeOdds: {
    type: 'number',
    hiddenFromList: false,
    default: 70,
    min: 0,
    max: 100,
    step: 1,
    keyframable: false,
    description: 'September odds (%)',
  },
} as const satisfies InteractivitySchema;

export const MacroScene = Interactive.withSchema({
  Component: MacroSceneInner,
  componentName: '<MacroScene>',
  schema: macroSceneSchema,
  wrapInSequence: true,
});

export const MacroSceneComposition: React.FC = () => (
  <Composition
    id="MacroScene"
    component={MacroScene}
    durationInFrames={480}
    fps={60}
    width={1920}
    height={1080}
    defaultProps={{
      accentColor: '#FF2D55',
      officials: '9',
      officialsTotal: 19,
      hikeOdds: 70,
    }}
  />
);
