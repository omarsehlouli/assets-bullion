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
import {
  clamp,
  DISPLAY_FONT,
  easeInOut,
  easeOutExpo,
  INK,
  MONO_FONT,
  NEON,
  SCENE_BOUNDARIES,
} from '../theme';

type HudProps = {
  readonly brand: string;
  readonly dateLabel: string;
  readonly style?: React.CSSProperties;
};

const SCENES = [
  'Intro',
  'Metals Pricing',
  'Macro Headwinds',
  'Energy & Geopolitics',
  'Catalyst',
];

const TICKER: {sym: string; value: string; dir: 'up' | 'down' | null}[] = [
  {sym: 'XAU/USD', value: '$4,200', dir: 'up'},
  {sym: 'XAG/USD', value: '$66', dir: null},
  {sym: 'FED', value: 'HAWKISH', dir: null},
  {sym: 'USD', value: '1-YR HIGH', dir: 'up'},
  {sym: 'FOMC', value: '9 OF 19 SEE HIKE', dir: null},
  {sym: 'SEPT MOVE', value: '70% ODDS', dir: null},
  {sym: 'OIL', value: 'SLIDING', dir: 'down'},
  {sym: 'US–IRAN', value: '60-DAY ROADMAP', dir: null},
  {sym: 'HORMUZ', value: 'REOPENS', dir: null},
  {sym: 'PCE', value: 'PRINT THIS WEEK', dir: null},
];

const HudInner: React.FC<HudProps> = ({brand, dateLabel, style}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const bounds = SCENE_BOUNDARIES.map((s) => s * fps);

  const accent = interpolateColors(
    frame,
    bounds.flatMap((b) => [b - 0.5 * fps, b + 0.5 * fps]),
    [
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

  // The HUD docks in during the first camera pan.
  const dock = interpolate(frame, [3.5 * fps, 4.5 * fps], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });

  return (
    <AbsoluteFill style={{pointerEvents: 'none', ...style}}>
      {/* Scrim keeps the top bar legible while scenes pan underneath */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 150,
          background:
            'linear-gradient(180deg, rgba(3,5,11,0.92) 0%, rgba(3,5,11,0.6) 55%, rgba(3,5,11,0) 100%)',
          opacity: dock,
        }}
      />
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 52,
          left: 142,
          right: 142,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: dock,
          translate: `0 ${(1 - dock) * -60}px`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div
            style={{
              width: 16,
              height: 16,
              rotate: '45deg',
              backgroundColor: accent,
              boxShadow: `0 0 18px ${accent}`,
            }}
          />
          <div
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: '0.2em',
              color: INK,
            }}
          >
            {brand}
          </div>
          <div
            style={{width: 1, height: 26, backgroundColor: 'rgba(234,240,255,0.25)'}}
          />
          <div
            style={{
              fontFamily: MONO_FONT,
              fontSize: 22,
              letterSpacing: '0.08em',
              color: 'rgba(234,240,255,0.6)',
            }}
          >
            {dateLabel}
          </div>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <div
            style={{
              position: 'relative',
              width: 640,
              height: 34,
              overflow: 'hidden',
            }}
          >
            {SCENES.map((label, i) => {
              const enter = i === 0 ? -Infinity : bounds[i - 1];
              const exit = i === SCENES.length - 1 ? Infinity : bounds[i];
              const y =
                frame < enter - 10
                  ? 100
                  : frame > exit + 10
                    ? -100
                    : frame < (enter + exit) / 2
                      ? interpolate(frame, [enter - 10, enter + 10], [100, 0], {
                          ...clamp,
                          easing: easeOutExpo,
                        })
                      : interpolate(frame, [exit - 10, exit + 10], [0, -100], {
                          ...clamp,
                          easing: easeOutExpo,
                        });
              return (
                <div
                  key={label}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 16,
                    whiteSpace: 'nowrap',
                    translate: `0 ${y * 1.4}%`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO_FONT,
                      fontSize: 22,
                      fontWeight: 700,
                      color: accent,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')} / 05
                  </span>
                  <span
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontSize: 24,
                      fontWeight: 700,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: INK,
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ticker band */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 64,
          backgroundColor: 'rgba(4,7,15,0.88)',
          borderTop: '1px solid rgba(234,240,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          translate: `0 ${(1 - dock) * 80}px`,
        }}
      >
        {/* Timeline progress with chapter ticks */}
        <div
          style={{
            position: 'absolute',
            top: -1,
            left: 0,
            height: 3,
            width: `${(frame / (durationInFrames - 1)) * 100}%`,
            backgroundColor: accent,
            boxShadow: `0 0 12px ${accent}`,
          }}
        />
        {bounds.map((b) => (
          <div
            key={b}
            style={{
              position: 'absolute',
              top: -1,
              left: `${(b / durationInFrames) * 100}%`,
              width: 2,
              height: 9,
              backgroundColor: 'rgba(234,240,255,0.5)',
            }}
          />
        ))}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            translate: `${-(frame - 3.5 * fps) * 2.4}px 0`,
            paddingLeft: 340,
          }}
        >
          {[0, 1, 2].flatMap((copy) =>
            TICKER.map((item) => (
              <div
                key={`${copy}-${item.sym}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  paddingRight: 56,
                  fontFamily: MONO_FONT,
                  fontSize: 22,
                }}
              >
                <span style={{color: 'rgba(234,240,255,0.5)', fontWeight: 500}}>
                  {item.sym}
                </span>
                <span style={{color: INK, fontWeight: 700}}>{item.value}</span>
                {item.dir ? (
                  <span
                    style={{
                      color: item.dir === 'up' ? NEON.green : NEON.red,
                      fontSize: 18,
                    }}
                  >
                    {item.dir === 'up' ? '▲' : '▼'}
                  </span>
                ) : null}
                <span style={{color: 'rgba(234,240,255,0.18)', paddingLeft: 42}}>
                  ◆
                </span>
              </div>
            )),
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 300,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 142,
            background:
              'linear-gradient(90deg, rgba(4,7,15,1) 75%, rgba(4,7,15,0) 100%)',
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '0.2em',
              color: '#03050B',
              backgroundColor: accent,
              padding: '6px 12px',
              borderRadius: 4,
            }}
          >
            WIRE
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const hudSchema = {
  brand: {type: 'text-content', default: 'METALS BRIEF', description: 'Brand'},
  dateLabel: {
    type: 'text-content',
    default: 'MON · JUN 22, 2026',
    description: 'Date label',
  },
} as const satisfies InteractivitySchema;

export const Hud = Interactive.withSchema({
  Component: HudInner,
  componentName: '<Hud>',
  schema: hudSchema,
  wrapInSequence: true,
});
