import type React from 'react';
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {C, clamp, expoOut, SCENE_STARTS, UI_FONT} from '../theme';

type TerminalChromeProps = {
  readonly dateLabel: string;
  readonly style?: React.CSSProperties;
};

const SCENE_LABELS = [
  'The Thesis',
  'Macro Headwinds',
  'Inflation & The Fed',
  'Market Sentiment',
  'The Support Level',
  'Conclusion',
];

const TerminalChromeInner: React.FC<TerminalChromeProps> = ({dateLabel, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const enter = interpolate(frame, [6, 40], [0, 1], {...clamp, easing: expoOut});
  // The outro is flat design without terminal chrome.
  const exit = interpolate(t, [57.6, 58.1], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        fontFamily: UI_FONT,
        opacity: enter * exit,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 230,
          background:
            'linear-gradient(180deg, rgba(10,10,12,0.9) 0%, rgba(10,10,12,0.55) 60%, rgba(10,10,12,0) 100%)',
        }}
      />

      {/* Story-style progress, one segment per scene */}
      <div
        style={{
          position: 'absolute',
          top: 58,
          left: 60,
          right: 60,
          display: 'flex',
          gap: 8,
        }}
      >
        {SCENE_LABELS.map((label, i) => {
          const progress = interpolate(
            t,
            [SCENE_STARTS[i], SCENE_STARTS[i + 1]],
            [0, 100],
            clamp,
          );
          return (
            <div
              key={label}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                backgroundColor: 'rgba(242,244,248,0.16)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: C.gold,
                  boxShadow: `0 0 10px ${C.gold}`,
                }}
              />
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 88,
          left: 60,
          right: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          translate: `0 ${(1 - enter) * -30}px`,
        }}
      >
        <span
          style={{
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: '0.08em',
            color: C.bg,
            backgroundColor: C.gold,
            padding: '5px 10px',
            borderRadius: 4,
          }}
        >
          BTL
        </span>
        <span style={{fontWeight: 700, fontSize: 24, letterSpacing: '0.06em', color: C.ink}}>
          METALS <span style={{color: C.gold}}>{'<GO>'}</span>
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: '0.1em',
            color: C.mute,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {dateLabel}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 138,
          left: 60,
          width: 700,
          height: 30,
          overflow: 'hidden',
        }}
      >
        {SCENE_LABELS.map((label, i) => {
          const start = SCENE_STARTS[i];
          const end = SCENE_STARTS[i + 1];
          const y =
            t < (start + end) / 2
              ? interpolate(t, [start - 0.15, start + 0.15], [140, 0], {
                  ...clamp,
                  easing: expoOut,
                })
              : interpolate(t, [end - 0.15, end + 0.15], [0, -140], {
                  ...clamp,
                  easing: expoOut,
                });
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                whiteSpace: 'nowrap',
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                translate: `0 ${i === 0 && t < start + 0.15 ? 0 : y}%`,
              }}
            >
              <span style={{color: C.cyan}}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{color: 'rgba(242,244,248,0.75)'}}>{label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const terminalChromeSchema = {
  dateLabel: {
    type: 'text-content',
    default: 'FRI 09 OCT 2026',
    description: 'Date label',
  },
} as const satisfies InteractivitySchema;

export const TerminalChrome = Interactive.withSchema({
  Component: TerminalChromeInner,
  componentName: '<TerminalChrome>',
  schema: terminalChromeSchema,
  wrapInSequence: true,
});
