import type React from 'react';
import {useMemo} from 'react';
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {BG, clamp, easeInOut, NEON} from '../theme';

type BackdropProps = {
  readonly particleCount: number;
  readonly style?: React.CSSProperties;
};

// Parallax travel per camera pan, in px, for a layer at depth 1.
const PAN_TRAVEL = 420;

const wrap = (value: number, size: number) => ((value % size) + size) % size;

const BackdropInner: React.FC<BackdropProps> = ({particleCount, style}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // The camera pans right at 4s and 18s, and down at 11s and 25s,
  // matching the scene transitions of the main video.
  const camX = interpolate(
    frame,
    [3.5 * fps, 4.5 * fps, 17.5 * fps, 18.5 * fps],
    [0, -1, -1, -2],
    {...clamp, easing: easeInOut},
  );
  const camY = interpolate(
    frame,
    [10.5 * fps, 11.5 * fps, 24.5 * fps, 25.5 * fps],
    [0, -1, -1, -2],
    {...clamp, easing: easeInOut},
  );

  // Ambient light takes on the accent of the current scene.
  const glow = interpolateColors(
    frame,
    [
      0,
      3.5 * fps,
      4.5 * fps,
      10.5 * fps,
      11.5 * fps,
      17.5 * fps,
      18.5 * fps,
      24.5 * fps,
      25.5 * fps,
    ],
    [
      NEON.cyan,
      NEON.cyan,
      NEON.gold,
      NEON.gold,
      NEON.red,
      NEON.red,
      NEON.green,
      NEON.green,
      NEON.violet,
    ],
  );

  const particles = useMemo(
    () =>
      Array.from({length: particleCount}, (_, i) => ({
        x: random(`px-${i}`),
        y: random(`py-${i}`),
        size: 1.2 + random(`ps-${i}`) ** 2 * 4,
        depth: 0.25 + random(`pd-${i}`) * 0.75,
        speed: 0.15 + random(`pv-${i}`) * 0.45,
        sway: 8 + random(`pw-${i}`) * 26,
        phase: random(`pp-${i}`) * Math.PI * 2,
        accent: random(`pa-${i}`) < 0.2,
      })),
    [particleCount],
  );

  const fieldW = width + 120;
  const fieldH = height + 120;

  return (
    <AbsoluteFill style={{backgroundColor: BG, overflow: 'hidden', ...style}}>
      {/* Ambient glows */}
      <div
        style={{
          position: 'absolute',
          width: 1500,
          height: 1500,
          left: 900 + Math.sin(frame / 300) * 140 + camX * PAN_TRAVEL * 0.12,
          top: -620 + Math.cos(frame / 260) * 90 + camY * PAN_TRAVEL * 0.12,
          background: `radial-gradient(circle, ${glow} 0%, transparent 60%)`,
          opacity: 0.17,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1300,
          height: 1300,
          left: -520 + Math.cos(frame / 340) * 110,
          top: 380 + Math.sin(frame / 280) * 80,
          background: 'radial-gradient(circle, #2447FF 0%, transparent 60%)',
          opacity: 0.12,
        }}
      />

      {/* Financial grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(150,175,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(150,175,255,0.07) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          backgroundPosition: `${camX * PAN_TRAVEL * 0.3 - frame * 0.12}px ${camY * PAN_TRAVEL * 0.3}px`,
          maskImage:
            'radial-gradient(ellipse 75% 70% at 50% 50%, black 15%, transparent 85%)',
        }}
      />

      {/* Drifting particles */}
      {particles.map((p, i) => {
        const x =
          wrap(
            p.x * fieldW +
              Math.sin(frame / 120 + p.phase) * p.sway +
              camX * PAN_TRAVEL * p.depth -
              frame * 0.06 * p.depth,
            fieldW,
          ) - 60;
        const y =
          wrap(
            p.y * fieldH -
              frame * p.speed * p.depth +
              camY * PAN_TRAVEL * p.depth,
            fieldH,
          ) - 60;
        const size = p.size * (0.6 + p.depth * 0.6);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: p.accent ? glow : '#DCE6FF',
              boxShadow: p.accent ? `0 0 ${size * 4}px ${glow}` : 'none',
              opacity:
                (0.18 + p.depth * 0.45) *
                (0.65 + 0.35 * Math.sin(frame / 45 + p.phase * 3)),
            }}
          />
        );
      })}

      {/* Scanlines and vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 4px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const backdropSchema = {
  particleCount: {
    type: 'number',
    hiddenFromList: false,
    default: 90,
    min: 0,
    max: 300,
    step: 1,
    integer: true,
    keyframable: false,
    description: 'Particles',
  },
} as const satisfies InteractivitySchema;

export const Backdrop = Interactive.withSchema({
  Component: BackdropInner,
  componentName: '<Backdrop>',
  schema: backdropSchema,
  wrapInSequence: true,
});
