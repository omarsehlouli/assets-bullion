import {Audio} from '@remotion/media';
import type React from 'react';
import {AbsoluteFill, getStaticFiles, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Atmosphere, Finish} from './Atmosphere';
import {Captions} from './Captions';
import {CutFlare, Masthead, SceneShell} from './Shell';
import {makeCue, prog, type SceneProps, type Tint, type VideoSchedule} from './theme';

const hasFile = (path: string) => getStaticFiles().some((file) => file.name === path);

const SceneSlot: React.FC<{
  Scene: React.FC<SceneProps>;
  cue: SceneProps['cue'];
  duration: number;
  first: boolean;
  last: boolean;
}> = ({Scene, cue, duration, first, last}) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell frame={frame} duration={duration} first={first} last={last}>
      <Scene frame={frame} duration={duration} cue={cue} />
    </SceneShell>
  );
};

export const PremiumVideo: React.FC<{
  schedule: VideoSchedule;
  tint: Tint;
  scenes: Record<string, React.FC<SceneProps>>;
  // Replaces the default studio atmosphere (e.g. the forge in The Maker's Edge).
  backdrop?: (frame: number) => React.ReactNode;
  // Keep captions on during the closing scene (when it has more than the brand line).
  closingCaptions?: boolean;
  scoreVolume?: number;
}> = ({schedule, tint, scenes, backdrop, closingCaptions, scoreVolume = 1.4}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const starts = schedule.scenes.map((s) => Math.round(s.visualStart * fps));
  const ctaStart = starts[starts.length - 1];
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {backdrop ? backdrop(frame) : <Atmosphere frame={frame} tint={tint} intensity={prog(frame, 0, 50)} />}
      {schedule.scenes.map((scene, i) => {
        const Scene = scenes[scene.id];
        const from = starts[i];
        const duration = (starts[i + 1] ?? durationInFrames) - from;
        return (
          <Sequence key={scene.id} name={`${i + 1} · ${scene.id}`} from={from} durationInFrames={duration}>
            <SceneSlot
              Scene={Scene}
              cue={makeCue(scene, fps)}
              duration={duration}
              first={i === 0}
              last={i === schedule.scenes.length - 1}
            />
          </Sequence>
        );
      })}
      <Masthead frame={frame} hideAt={ctaStart} />
      {closingCaptions ? (
        <Captions scenes={schedule.scenes} time={frame / fps} />
      ) : frame < ctaStart ? (
        <Captions scenes={schedule.scenes.slice(0, -1)} time={frame / fps} />
      ) : null}
      <CutFlare frame={frame} cuts={starts.slice(1)} tint={tint.key} />
      <Finish frame={frame} />
      <Audio name="Voice · Aiden" src={staticFile(schedule.voice)} />
      {hasFile(schedule.score) ? <Audio name="Score" src={staticFile(schedule.score)} volume={scoreVolume} /> : null}
    </AbsoluteFill>
  );
};
