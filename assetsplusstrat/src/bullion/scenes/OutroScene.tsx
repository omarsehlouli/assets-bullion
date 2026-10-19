import {Audio} from '@remotion/media';
import type React from 'react';
import {
  AbsoluteFill,
  CanvasImage,
  Composition,
  Interactive,
  interpolate,
  interpolateColors,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {TypeText} from '../components/TypeText';
import {C, clamp, expoInOut, pop, UI_FONT} from '../theme';

type OutroSceneProps = {
  readonly logo: string;
  readonly url: string;
  readonly style?: React.CSSProperties;
};

export const OUTRO_TYPE_START = 60;
export const OUTRO_FRAMES_PER_CHAR = 2;
export const OUTRO_QUESTION = 'Where is the best place to buy your gold and silver?';
const ENTER = OUTRO_TYPE_START + OUTRO_QUESTION.length * OUTRO_FRAMES_PER_CHAR + 18;
const MORPH = ENTER + 16;
const URL_IN = MORPH + 80;

const LOGO_W = 700;
const LOGO_H = Math.round((LOGO_W * 84) / 294);

const OutroSceneInner: React.FC<OutroSceneProps> = ({logo, url, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const bar = pop(frame, 22, fps);
  const press = interpolate(frame, [ENTER, ENTER + 4, ENTER + 16], [0, 1, 0], clamp);
  const morph = interpolate(frame, [MORPH, MORPH + 50], [0, 1], {...clamp, easing: expoInOut});
  const logoIn = pop(frame, MORPH + 24, fps);
  const shine = interpolate(frame, [MORPH + 70, MORPH + 120], [-0.4, 1.4], clamp);
  const border = interpolateColors(morph, [0, 1], [C.cyan, C.gold]);

  return (
    <AbsoluteFill style={{fontFamily: UI_FONT, color: C.ink, ...style}}>
      <Interactive.Div
        name="Search bar"
        style={{
          position: 'absolute',
          left: 540 - interpolate(morph, [0, 1], [470, 380]),
          top: 800 - interpolate(morph, [0, 1], [0, 30]),
          width: interpolate(morph, [0, 1], [940, 760]),
          height: interpolate(morph, [0, 1], [250, 300]),
          borderRadius: interpolate(morph, [0, 1], [40, 28]),
          backgroundColor: `rgba(20,20,25,${1 - morph})`,
          border: `3px solid ${border}`,
          borderColor: interpolateColors(morph, [0, 0.7, 1], [C.cyan, C.gold, 'rgba(255,215,0,0)']),
          boxShadow: `0 0 ${30 + press * 40}px ${morph < 0.5 ? C.cyan : C.gold}${morph > 0.8 ? '00' : '66'}, inset 0 0 ${press * 40}px ${C.cyan}55`,
          opacity: Math.min(1, bar * 1.5),
          scale: bar * (1 - press * 0.02),
        }}
      >
        <svg
          width={46}
          height={46}
          viewBox="0 0 24 24"
          style={{position: 'absolute', left: 38, top: 40, opacity: 1 - morph * 3}}
        >
          <circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke={C.cyan} strokeWidth={2.4} />
          <line x1={15.5} y1={15.5} x2={21} y2={21} stroke={C.cyan} strokeWidth={2.4} strokeLinecap="round" />
        </svg>
        <div
          style={{
            position: 'absolute',
            right: 30,
            bottom: 26,
            padding: '6px 14px',
            borderRadius: 8,
            border: `2px solid ${press > 0 ? C.cyan : 'rgba(242,244,248,0.25)'}`,
            backgroundColor: press > 0 ? `${C.cyan}33` : 'transparent',
            fontSize: 24,
            fontWeight: 700,
            color: press > 0 ? C.cyan : C.mute,
            opacity: 1 - morph * 3,
          }}
        >
          ↵
        </div>
        <TypeText
          name="Search query"
          from={OUTRO_TYPE_START}
          premountFor={fps}
          framesPerChar={OUTRO_FRAMES_PER_CHAR}
          highlight=""
          highlightColor="#FFD700"
          cursorColor="#00E5FF"
          style={{
            position: 'absolute',
            left: 112,
            top: 34,
            right: 50,
            fontFamily: UI_FONT,
            fontSize: 54,
            fontWeight: 500,
            lineHeight: 1.18,
            letterSpacing: '-0.01em',
            opacity: interpolate(frame, [MORPH, MORPH + 14], [1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {OUTRO_QUESTION}
        </TypeText>
      </Interactive.Div>

      <Interactive.Div
        name="Logo"
        style={{
          position: 'absolute',
          left: 540 - LOGO_W / 2,
          top: 820,
          width: LOGO_W,
          height: LOGO_H,
          opacity: Math.min(1, logoIn * 1.5),
          scale: 0.7 + logoIn * 0.3,
        }}
      >
        <CanvasImage src={logo} style={{width: LOGO_W, height: LOGO_H}} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, transparent ${shine * 100 - 12}%, rgba(255,255,255,0.85) ${shine * 100}%, transparent ${shine * 100 + 12}%)`,
            maskImage: `url(${logo})`,
            maskSize: '100% 100%',
            WebkitMaskImage: `url(${logo})`,
            WebkitMaskSize: '100% 100%',
            mixBlendMode: 'screen',
          }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Website"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1110,
          textAlign: 'center',
          fontSize: 48,
          fontWeight: 600,
          letterSpacing: '0.01em',
          color: C.ink,
          opacity: interpolate(frame, [URL_IN, URL_IN + 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: interpolate(frame, [URL_IN, URL_IN + 40], ['0px 24px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: expoInOut,
          }),
        }}
      >
        Visit <span style={{color: C.gold, fontWeight: 800}}>{url}</span>
      </Interactive.Div>
      <Audio name="SFX · Search bar" from={22} src={staticFile('sfx/maximize_006.wav')} premountFor={fps} volume={0.4} />
      <Audio name="SFX · Keyboard ASMR" from={OUTRO_TYPE_START} src={staticFile('sfx/typing-outro.wav')} premountFor={fps} volume={0.9} />
      <Audio name="SFX · Enter" from={ENTER} src={staticFile('sfx/confirmation_002.wav')} premountFor={fps} volume={0.45} />
      <Audio name="SFX · Logo" from={MORPH + 24} src={staticFile('sfx/ding.wav')} premountFor={fps} volume={0.4} />
    </AbsoluteFill>
  );
};

const outroSceneSchema = {
  logo: {type: 'asset', default: '', description: 'Logo'},
  url: {type: 'text-content', default: 'Bulliontradingllc.com', description: 'Website'},
} as const satisfies InteractivitySchema;

export const OutroScene = Interactive.withSchema({
  Component: OutroSceneInner,
  componentName: '<OutroScene>',
  schema: outroSceneSchema,
  wrapInSequence: true,
});

export const OutroSceneComposition: React.FC = () => (
  <Composition
    id="OutroScene"
    component={OutroScene}
    durationInFrames={435}
    fps={60}
    width={1080}
    height={1920}
    defaultProps={{
      logo: staticFile('brand/logo-bullion.webp'),
      url: 'Bulliontradingllc.com',
    }}
  />
);
