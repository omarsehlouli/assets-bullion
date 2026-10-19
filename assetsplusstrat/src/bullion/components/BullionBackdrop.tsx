import type React from 'react';
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {C, clamp, expoInOut} from '../theme';
import {NodeField} from './NodeField';

type BullionBackdropProps = {
  readonly nodeCount: number;
  readonly style?: React.CSSProperties;
};

const BullionBackdropInner: React.FC<BullionBackdropProps> = ({nodeCount, style}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  // Camera moves in lockstep with the scene pans (0.5s, centered on each cut).
  const yaw =
    frame * 0.0012 +
    interpolate(
      t,
      [11.75, 12.25, 20.75, 21.25, 27.75, 28.25, 34.75, 35.25, 46.75, 47.25],
      [0, 0.5, 0.5, 1.1, 1.1, 1.5, 1.5, 1.9, 1.9, 2.3],
      {...clamp, easing: expoInOut},
    );
  const pitch =
    0.18 +
    interpolate(t, [11.75, 12.25, 27.75, 28.25], [0, -0.35, -0.35, -0.7], {
      ...clamp,
      easing: expoInOut,
    });
  // Push in during the support scene, pull out wide for the conclusion.
  const zoom = interpolate(t, [35, 46.5, 47.25, 50.5], [1, 1.25, 1.6, 0.85], {
    ...clamp,
    easing: expoInOut,
  });
  const gridShiftX = interpolate(t, [20.75, 21.25], [0, -270], {
    ...clamp,
    easing: expoInOut,
  });
  const gridShiftY = interpolate(t, [11.75, 12.25, 27.75, 28.25], [0, -540, -540, -1080], {
    ...clamp,
    easing: expoInOut,
  });

  // Lighting per scene: gold thesis, red headwinds, gold support, cyan conclusion.
  const key = interpolateColors(
    t,
    [0, 11.75, 12.25, 34.75, 36.5, 46.75, 47.25],
    [C.gold, C.gold, C.red, C.red, C.gold, C.gold, C.cyan],
  );
  const fill = interpolateColors(
    t,
    [0, 11.75, 12.25, 34.75, 36.5, 46.75, 47.25],
    ['#1E3BFF', '#1E3BFF', C.red, C.red, '#FFB000', '#FFB000', C.gold],
  );
  // The outro switches to flat design.
  const flat = interpolate(t, [57.75, 58.25], [0, 1], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden', ...style}}>
      <div
        style={{
          position: 'absolute',
          width: 1700,
          height: 1700,
          left: -310 + Math.sin(frame / 220) * 120,
          top: -760 + Math.cos(frame / 260) * 90,
          background: `radial-gradient(circle, ${key} 0%, transparent 62%)`,
          opacity: 0.2 * (1 - flat),
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1500,
          height: 1500,
          left: -210 + Math.cos(frame / 300) * 110,
          top: 1180 + Math.sin(frame / 240) * 80,
          background: `radial-gradient(circle, ${fill} 0%, transparent 62%)`,
          opacity: 0.13 * (1 - flat),
        }}
      />

      {/* Terminal grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'linear-gradient(rgba(0,229,255,0.085) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(0,229,255,0.085) 1px, transparent 1px)',
            'linear-gradient(rgba(0,229,255,0.035) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(0,229,255,0.035) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '270px 270px, 270px 270px, 54px 54px, 54px 54px',
          backgroundPosition: `${gridShiftX}px ${gridShiftY + frame * 0.25}px`,
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 50%, black 10%, transparent 85%)',
          opacity: 1 - flat,
        }}
      />

      <NodeField
        frame={frame}
        width={width}
        height={height}
        yaw={yaw}
        pitch={pitch}
        zoom={zoom}
        count={nodeCount}
        accent={C.cyan}
        opacity={0.85 * (1 - flat * 0.9)}
      />

      {/* Film grain, scanlines and vignette */}
      <svg
        width={width}
        height={height}
        style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay'}}
      >
        <filter id="bullion-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={frame % 12}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#bullion-grain)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)',
          opacity: 1 - flat,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 75% at 50% 50%, transparent 50%, rgba(0,0,0,0.75) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const bullionBackdropSchema = {
  nodeCount: {
    type: 'number',
    hiddenFromList: false,
    default: 80,
    min: 0,
    max: 200,
    step: 1,
    integer: true,
    keyframable: false,
    description: '3D data nodes',
  },
} as const satisfies InteractivitySchema;

export const BullionBackdrop = Interactive.withSchema({
  Component: BullionBackdropInner,
  componentName: '<BullionBackdrop>',
  schema: bullionBackdropSchema,
  wrapInSequence: true,
});
