import {Audio} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import type React from 'react';
import {
  AbsoluteFill,
  Composition,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {BullionBackdrop} from './components/BullionBackdrop';
import {TerminalChrome} from './components/TerminalChrome';
import {ConclusionScene} from './scenes/ConclusionScene';
import {HeadwindsScene} from './scenes/HeadwindsScene';
import {InflationScene} from './scenes/InflationScene';
import {OutroScene} from './scenes/OutroScene';
import {SentimentScene} from './scenes/SentimentScene';
import {SupportScene} from './scenes/SupportScene';
import {ThesisScene} from './scenes/ThesisScene';
import {C, expoInOut} from './theme';

type BullionBriefProps = {
  // Turn on once `node scripts/generate-voiceover.mjs` has written the clips.
  readonly withVoiceover: boolean;
};

// Scenes are padded by half a transition on each side, so every 0.5s cut is
// centered on the voiceover timestamps (0:12, 0:21, 0:28, 0:35, 0:47, 0:58).
export const BullionBrief: React.FC<BullionBriefProps> = ({withVoiceover}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <BullionBackdrop name="Backdrop" nodeCount={80} />

      <TransitionSeries>
        <TransitionSeries.Sequence name="1 · The Thesis" durationInFrames={12.25 * fps} premountFor={fps}>
          <ThesisScene accentColor="#FFD700" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({direction: 'from-bottom'})}
          timing={linearTiming({durationInFrames: 0.5 * fps, easing: expoInOut})}
        />
        <TransitionSeries.Sequence name="2 · Macro Headwinds" durationInFrames={9.5 * fps} premountFor={fps}>
          <HeadwindsScene warningColor="#FF3366" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({direction: 'from-right'})}
          timing={linearTiming({durationInFrames: 0.5 * fps, easing: expoInOut})}
        />
        <TransitionSeries.Sequence name="3 · Inflation & The Fed" durationInFrames={7.5 * fps} premountFor={fps}>
          <InflationScene warningColor="#FF3366" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({direction: 'from-bottom'})}
          timing={linearTiming({durationInFrames: 0.5 * fps, easing: expoInOut})}
        />
        <TransitionSeries.Sequence name="4 · Market Sentiment" durationInFrames={7.5 * fps} premountFor={fps}>
          <SentimentScene warningColor="#FF3366" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 0.5 * fps, easing: expoInOut})}
        />
        <TransitionSeries.Sequence name="5 · The Support Level" durationInFrames={12.5 * fps} premountFor={fps}>
          <SupportScene accentColor="#FFD700" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 0.5 * fps, easing: expoInOut})}
        />
        <TransitionSeries.Sequence name="6 · Conclusion" durationInFrames={11.5 * fps} premountFor={fps}>
          <ConclusionScene accentColor="#FFD700" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 0.5 * fps, easing: expoInOut})}
        />
        <TransitionSeries.Sequence name="7 · Outro" durationInFrames={7.25 * fps} premountFor={fps}>
          <OutroScene logo={staticFile('brand/logo-bullion.webp')} url="Bulliontradingllc.com" />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <TerminalChrome name="Terminal chrome" dateLabel="FRI 09 OCT 2026" />

      <Audio name="SFX · Pan to headwinds" from={11.75 * fps} src={staticFile('sfx/whoosh.wav')} premountFor={fps} volume={0.6} />
      <Audio name="SFX · Pan to inflation" from={20.75 * fps} src={staticFile('sfx/whoosh.wav')} premountFor={fps} volume={0.6} />
      <Audio name="SFX · Pan to sentiment" from={27.75 * fps} src={staticFile('sfx/whoosh.wav')} premountFor={fps} volume={0.6} />

      {withVoiceover ? (
        <>
          <Audio name="VO · 1 The Thesis" src={staticFile('voiceover/bullion-brief/scene-1.mp3')} premountFor={fps} />
          <Audio name="VO · 2 Macro Headwinds" from={12 * fps} src={staticFile('voiceover/bullion-brief/scene-2.mp3')} premountFor={fps} />
          <Audio name="VO · 3 Inflation & The Fed" from={21 * fps} src={staticFile('voiceover/bullion-brief/scene-3.mp3')} premountFor={fps} />
          <Audio name="VO · 4 Market Sentiment" from={28 * fps} src={staticFile('voiceover/bullion-brief/scene-4.mp3')} premountFor={fps} />
          <Audio name="VO · 5 The Support Level" from={35 * fps} src={staticFile('voiceover/bullion-brief/scene-5.mp3')} premountFor={fps} />
          <Audio name="VO · 6 Conclusion" from={47 * fps} src={staticFile('voiceover/bullion-brief/scene-6.mp3')} premountFor={fps} />
        </>
      ) : null}

      <Interactive.Div
        name="End on black"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000000',
          opacity: interpolate(frame, [durationInFrames - 90, durationInFrames - 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: expoInOut,
          }),
        }}
      />
    </AbsoluteFill>
  );
};

export const BullionBriefComposition: React.FC = () => (
  <Composition
    id="BullionBrief"
    component={BullionBrief}
    durationInFrames={3900}
    fps={60}
    width={1080}
    height={1920}
    defaultProps={{withVoiceover: false}}
  />
);
