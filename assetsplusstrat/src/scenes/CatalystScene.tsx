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
import {DISPLAY_FONT, easeInOut, easeOutExpo, INK, MONO_FONT} from '../theme';

type CatalystSceneProps = {
  readonly accentColor: string;
  readonly style?: React.CSSProperties;
};

const CatalystSceneInner: React.FC<CatalystSceneProps> = ({accentColor, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{fontFamily: DISPLAY_FONT, color: INK, ...style}}>
      <Interactive.Div
        name="Camera"
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '50% 52%',
          scale: interpolate(frame, [20, 5.5 * fps], [0.98, 1.06], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: easeInOut,
            output: 'perceptual-scale',
          }),
        }}
      >
        <Interactive.Div
          name="Awaiting pill"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 236,
            display: 'flex',
            justifyContent: 'center',
            opacity: interpolate(frame, [20, 36], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [20, 50], ['0px -30px', '0px 0px'], {
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
              gap: 14,
              padding: '10px 22px',
              borderRadius: 999,
              border: `1px solid ${accentColor}88`,
              backgroundColor: `${accentColor}14`,
              fontFamily: MONO_FONT,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: accentColor,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: accentColor,
                boxShadow: `0 0 14px ${accentColor}`,
                opacity: 0.4 + 0.6 * Math.abs(Math.cos(frame / 14)),
              }}
            />
            CATALYST · AWAITING PRINT
          </div>
        </Interactive.Div>

        <KineticWords
          name="The Real Test"
          from={30}
          premountFor={fps}
          mode="blur"
          highlight=""
          highlightColor="#B15CFF"
          stagger={6}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 318,
            justifyContent: 'center',
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'rgba(234,240,255,0.8)',
          }}
        >
          The Real Test:
        </KineticWords>

        <KineticWords
          name="This Week's PCE"
          from={54}
          premountFor={fps}
          mode="blur"
          boxHighlight
          highlight="PCE"
          highlightColor="#B15CFF"
          stagger={7}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 448,
            justifyContent: 'center',
            fontSize: 164,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.04em',
          }}
        >
          This Week's PCE
        </KineticWords>

        <KineticWords
          name="Inflation Print"
          from={76}
          premountFor={fps}
          mode="blur"
          highlight=""
          highlightColor="#B15CFF"
          stagger={7}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 626,
            justifyContent: 'center',
            fontSize: 164,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.04em',
          }}
        >
          Inflation Print
        </KineticWords>

        <Interactive.Div
          name="Divider"
          style={{
            position: 'absolute',
            left: '50%',
            top: 840,
            height: 4,
            borderRadius: 2,
            backgroundColor: accentColor,
            boxShadow: `0 0 20px ${accentColor}`,
            width: interpolate(frame, [116, 166], [0, 640], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOut,
            }),
            translate: '-50% 0px',
          }}
        />
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const catalystSceneSchema = {
  accentColor: {type: 'color', default: '#B15CFF', description: 'Accent color'},
} as const satisfies InteractivitySchema;

export const CatalystScene = Interactive.withSchema({
  Component: CatalystSceneInner,
  componentName: '<CatalystScene>',
  schema: catalystSceneSchema,
  wrapInSequence: true,
});

export const CatalystSceneComposition: React.FC = () => (
  <Composition
    id="CatalystScene"
    component={CatalystScene}
    durationInFrames={330}
    fps={60}
    width={1920}
    height={1080}
    defaultProps={{accentColor: '#B15CFF'}}
  />
);
