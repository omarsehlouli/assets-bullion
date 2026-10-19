import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import type React from 'react';
import {
  AbsoluteFill,
  Composition,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Backdrop} from './components/Backdrop';
import {Hud} from './components/Hud';
import {CatalystScene} from './scenes/CatalystScene';
import {EnergyScene} from './scenes/EnergyScene';
import {IntroScene} from './scenes/IntroScene';
import {MacroScene} from './scenes/MacroScene';
import {MetalsScene} from './scenes/MetalsScene';
import {BG, DISPLAY_FONT, easeInOut} from './theme';

// Each scene is padded by half a pan on each side, so that the 1s camera pans
// are centered on the 4s, 11s, 18s and 25s boundaries.
export const MetalsBrief: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: BG, fontFamily: DISPLAY_FONT}}>
      <Backdrop name="Backdrop" particleCount={90} />

      <TransitionSeries>
        <TransitionSeries.Sequence
          name="Intro"
          durationInFrames={4.5 * fps}
          premountFor={fps}
        >
          <IntroScene accentColor="#00E5FF" date="06/22/2026" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({direction: 'from-right'})}
          timing={linearTiming({durationInFrames: 1 * fps, easing: easeInOut})}
        />
        <TransitionSeries.Sequence
          name="Metals Pricing"
          durationInFrames={8 * fps}
          premountFor={fps}
        >
          <MetalsScene accentColor="#FFC83D" goldPrice="$4,200" silverPrice="$66" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({direction: 'from-bottom'})}
          timing={linearTiming({durationInFrames: 1 * fps, easing: easeInOut})}
        />
        <TransitionSeries.Sequence
          name="Macro Headwinds"
          durationInFrames={8 * fps}
          premountFor={fps}
        >
          <MacroScene
            accentColor="#FF2D55"
            officials="9"
            officialsTotal={19}
            hikeOdds={70}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({direction: 'from-right'})}
          timing={linearTiming({durationInFrames: 1 * fps, easing: easeInOut})}
        />
        <TransitionSeries.Sequence
          name="Energy & Geopolitics"
          durationInFrames={8 * fps}
          premountFor={fps}
        >
          <EnergyScene accentColor="#2BFF88" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({direction: 'from-bottom'})}
          timing={linearTiming({durationInFrames: 1 * fps, easing: easeInOut})}
        />
        <TransitionSeries.Sequence
          name="Catalyst"
          durationInFrames={5.5 * fps}
          premountFor={fps}
        >
          <CatalystScene accentColor="#B15CFF" />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Hud name="HUD" brand="METALS BRIEF" dateLabel="MON · JUN 22, 2026" />

      <Interactive.Div
        name="Fade to black"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000000',
          opacity: interpolate(
            frame,
            [durationInFrames - 90, durationInFrames - 1],
            [0, 1],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOut,
            },
          ),
        }}
      />
    </AbsoluteFill>
  );
};

export const MetalsBriefComposition: React.FC = () => (
  <Composition
    id="MetalsBrief"
    component={MetalsBrief}
    durationInFrames={1800}
    fps={60}
    width={1920}
    height={1080}
  />
);
