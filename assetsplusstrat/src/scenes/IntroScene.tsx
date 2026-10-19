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
import {clamp, DISPLAY_FONT, easeInOut, easeOutExpo, INK, MONO_FONT} from '../theme';

type IntroSceneProps = {
  readonly accentColor: string;
  readonly date: string;
  readonly style?: React.CSSProperties;
};

const IntroSceneInner: React.FC<IntroSceneProps> = ({accentColor, date, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{fontFamily: DISPLAY_FONT, color: INK, ...style}}>
      <Interactive.Div
        name="Camera"
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '25% 55%',
          scale: interpolate(frame, [0, 4.5 * fps], [1, 1.07], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            output: 'perceptual-scale',
          }),
          translate: interpolate(
            frame,
            [0, 4.5 * fps],
            ['20px 12px', '-36px -8px'],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOut,
            },
          ),
        }}
      >
        <Interactive.Div
          name="Eyebrow"
          style={{
            position: 'absolute',
            left: 142,
            top: 262,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontFamily: MONO_FONT,
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: '0.26em',
            color: accentColor,
            opacity: interpolate(frame, [4, 20], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [4, 34], ['-40px 0px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeOutExpo,
            }),
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 18px ${accentColor}`,
              opacity: 0.55 + 0.45 * Math.cos(frame / 7),
            }}
          />
          MONDAY MARKET BRIEF
        </Interactive.Div>

        <KineticWords
          name="Title line 1"
          from={10}
          premountFor={fps}
          highlight=""
          highlightColor="#FFC83D"
          stagger={5}
          style={{
            position: 'absolute',
            left: 142,
            top: 330,
            fontSize: 156,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
          }}
        >
          Here's What the
        </KineticWords>

        <KineticWords
          name="Title line 2"
          from={26}
          premountFor={fps}
          highlight="Metals"
          highlightColor="#FFC83D"
          stagger={6}
          style={{
            position: 'absolute',
            left: 142,
            top: 494,
            fontSize: 156,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
          }}
        >
          Metals Are Saying
        </KineticWords>

        <Interactive.Div
          name="Date"
          style={{
            position: 'absolute',
            left: 142,
            top: 712,
            display: 'flex',
            alignItems: 'baseline',
            gap: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: MONO_FONT,
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: INK,
            }}
          >
            {date.split('').map((char, i) => {
              const p = interpolate(frame - 64 - i * 3, [0, 18], [0, 1], {
                ...clamp,
                easing: easeOutExpo,
              });
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    opacity: p,
                    translate: `0 ${(1 - p) * 40}px`,
                    color: char === '/' ? accentColor : INK,
                    textShadow:
                      char === '/' ? `0 0 18px ${accentColor}` : undefined,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </Interactive.Div>

        <Interactive.Div
          name="Date underline"
          style={{
            position: 'absolute',
            left: 142,
            top: 818,
            height: 4,
            borderRadius: 2,
            backgroundColor: accentColor,
            boxShadow: `0 0 18px ${accentColor}`,
            width: interpolate(frame, [80, 120], [0, 560], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOut,
            }),
          }}
        />
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const introSceneSchema = {
  accentColor: {type: 'color', default: '#00E5FF', description: 'Accent color'},
  date: {type: 'text-content', default: '06/22/2026', description: 'Date'},
} as const satisfies InteractivitySchema;

export const IntroScene = Interactive.withSchema({
  Component: IntroSceneInner,
  componentName: '<IntroScene>',
  schema: introSceneSchema,
  wrapInSequence: true,
});

export const IntroSceneComposition: React.FC = () => (
  <Composition
    id="IntroScene"
    component={IntroScene}
    durationInFrames={270}
    fps={60}
    width={1920}
    height={1080}
    defaultProps={{accentColor: '#00E5FF', date: '06/22/2026'}}
  />
);
