import {Audio} from '@remotion/media';
import type React from 'react';
import {
  AbsoluteFill,
  Composition,
  Interactive,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {C, clamp, glass, KINETIC_FONT, pop, UI_FONT} from '../theme';

type SentimentSceneProps = {
  readonly warningColor: string;
  readonly style?: React.CSSProperties;
};

const SLAM = 100;
const IMPACT = 118;

const ZONES = [
  {label: 'EXT. FEAR', color: '#FF3366'},
  {label: 'FEAR', color: '#FF7A59'},
  {label: 'NEUTRAL', color: '#FFD700'},
  {label: 'GREED', color: '#5CE1E6'},
  {label: 'EXT. GREED', color: '#00E5FF'},
];

const MX = 540;
const MY = 820;
const MR = 370;
const SEGMENTS = 45;

const polar = (r: number, value: number) => {
  const a = Math.PI + value * Math.PI;
  return {x: MX + r * Math.cos(a), y: MY + r * Math.sin(a)};
};

const COLUMNS = [
  {ticker: 'XAU', header: 'GOLD', start: 185},
  {ticker: 'XAG', header: 'SILVER', start: 195},
  {ticker: 'GDX', header: 'MINERS', start: 285},
  {ticker: 'NEM', header: 'NEWMONT', start: 295},
];
const ZONE_TOP = 1060;
const SPAWN_EVERY = 20;
const fallY = (age: number) => 70 + 6 * age + 0.22 * age * age;

const SentimentSceneInner: React.FC<SentimentSceneProps> = ({warningColor, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const slam = pop(frame, SLAM, fps);
  const idle = Math.sin(frame / 9) * 0.03;
  // The needle pegs against the stop at the fear end.
  const needle = Math.max(0.025, 0.5 + idle * (1 - slam) - slam * 0.47);
  const zone = Math.min(4, Math.floor(needle * 5));
  const meterIn = pop(frame, 6, fps);
  const fearText = pop(frame, IMPACT, fps);

  const shake = interpolate(frame, [IMPACT, IMPACT + 24], [26, 0], clamp);
  const shakeX = (random(`ss-x-${frame}`) - 0.5) * 2 * shake;
  const shakeY = (random(`ss-y-${frame}`) - 0.5) * 2 * shake;
  const split = interpolate(frame, [IMPACT, IMPACT + 26], [16, 2], clamp);
  const flicker = [IMPACT + 3, IMPACT + 7, IMPACT + 12].includes(frame) ? 0.3 : 1;

  return (
    <AbsoluteFill style={{fontFamily: UI_FONT, color: C.ink, ...style}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="sentiment-vblur" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="0 9" />
        </filter>
        <filter id="sentiment-vblur-soft" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="0 2.5" />
        </filter>
      </svg>

      <AbsoluteFill style={{translate: `${shakeX}px ${shakeY}px`}}>
        <Interactive.Div
          name="Sentiment meter"
          style={{
            position: 'absolute',
            left: 50,
            top: 250,
            width: 980,
            height: 770,
            ...glass(),
            transformOrigin: '50% 60%',
            opacity: Math.min(1, meterIn * 1.5),
            scale: 0.85 + meterIn * 0.15,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 40,
              right: 40,
              top: 34,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.22em',
            }}
          >
            <span>SENTIMENT INDEX</span>
            <span style={{color: C.mute}}>METALS</span>
          </div>
        </Interactive.Div>

        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: Math.min(1, meterIn * 1.5)}}>
          {Array.from({length: SEGMENTS}, (_, i) => {
            const v0 = i / SEGMENTS + 0.003;
            const v1 = (i + 1) / SEGMENTS - 0.003;
            const segZone = Math.min(4, Math.floor(((i + 0.5) / SEGMENTS) * 5));
            const a = polar(MR, v0);
            const b = polar(MR, v1);
            const active = segZone === zone;
            const pulse = active && zone === 0 ? 0.7 + 0.3 * Math.sin(frame / 4) : 1;
            return (
              <path
                key={i}
                d={`M ${a.x} ${a.y} A ${MR} ${MR} 0 0 1 ${b.x} ${b.y}`}
                fill="none"
                stroke={ZONES[segZone].color}
                strokeWidth={active ? 58 : 46}
                strokeOpacity={(active ? 1 : 0.22) * pulse}
                style={{filter: active ? `drop-shadow(0 0 14px ${ZONES[segZone].color})` : 'none'}}
              />
            );
          })}
          {ZONES.map((z, i) => {
            const p = polar(MR - 78, (i + 0.5) / 5);
            return (
              <text
                key={z.label}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={i === zone ? z.color : 'rgba(242,244,248,0.45)'}
                style={{fontFamily: UI_FONT, fontSize: 19, fontWeight: 800, letterSpacing: '0.1em'}}
              >
                {z.label}
              </text>
            );
          })}
          {(() => {
            const tip = polar(MR - 50, needle);
            return (
              <>
                <line x1={MX} y1={MY} x2={tip.x} y2={tip.y} stroke={zone === 0 ? warningColor : C.ink} strokeWidth={12} strokeLinecap="round" style={{filter: `drop-shadow(0 0 14px ${zone === 0 ? warningColor : C.ink})`}} />
                <circle cx={MX} cy={MY} r={30} fill={C.bg} stroke={zone === 0 ? warningColor : C.ink} strokeWidth={7} />
              </>
            );
          })()}
        </svg>

        <Interactive.Div
          name="Extreme fear"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 872,
            textAlign: 'center',
            fontFamily: KINETIC_FONT,
            fontSize: 118,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            textShadow: `${split}px 0 0 ${warningColor}, ${-split}px 0 0 ${C.cyan}, 0 0 50px ${warningColor}`,
            opacity: frame < IMPACT ? 0 : Math.min(1, fearText * 1.5) * flicker,
            scale: 1.6 - fearText * 0.6,
          }}
        >
          EXTREME FEAR
        </Interactive.Div>
      </AbsoluteFill>

      {/* Tickers cascading down with motion blur */}
      <Interactive.Div
        name="Ticker cascade"
        style={{
          position: 'absolute',
          left: 50,
          top: ZONE_TOP,
          width: 980,
          height: 680,
          overflow: 'hidden',
          maskImage:
            'linear-gradient(180deg, black 0%, black 75%, transparent 100%)',
        }}
      >
        {COLUMNS.map((col, c) => {
          const headerPop = pop(frame, col.start - 10, fps);
          const items: number[] = [];
          for (let s = col.start; s <= frame; s += SPAWN_EVERY) {
            items.push(s);
          }
          return (
            <div
              key={col.ticker}
              style={{position: 'absolute', left: c * 245, top: 0, width: 245, height: 680}}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  right: 14,
                  top: 0,
                  padding: '10px 0',
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: '0.18em',
                  color: warningColor,
                  ...glass('rgba(255,51,102,0.1)'),
                  borderRadius: 12,
                  opacity: Math.min(1, headerPop * 1.5),
                  scale: headerPop,
                  zIndex: 2,
                }}
              >
                {col.header}
              </div>
              {items.map((spawn) => {
                const age = frame - spawn;
                const y = fallY(age);
                if (y > 720) {
                  return null;
                }
                const label = (
                  <>
                    {col.ticker} <span style={{fontSize: 40}}>▼</span>
                  </>
                );
                const itemStyle: React.CSSProperties = {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: 64,
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  color: warningColor,
                };
                return (
                  <div key={spawn}>
                    {[4, 3, 2, 1].map((k) => (
                      <div
                        key={k}
                        style={{
                          ...itemStyle,
                          top: fallY(Math.max(0, age - k * 1.6)),
                          opacity: 0.32 / k,
                          filter: 'url(#sentiment-vblur)',
                        }}
                      >
                        {label}
                      </div>
                    ))}
                    <div
                      style={{
                        ...itemStyle,
                        top: y,
                        filter: 'url(#sentiment-vblur-soft)',
                        textShadow: `0 0 20px ${warningColor}AA`,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </Interactive.Div>

      <Interactive.Div
        name="Impact flash"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#FF3366',
          mixBlendMode: 'screen',
          opacity: interpolate(frame, [IMPACT - 1, IMPACT, IMPACT + 14], [0, 0.3, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
      <Audio name="SFX · Meter slam" from={IMPACT} src={staticFile('sfx/impactMetal_heavy_001.wav')} premountFor={fps} volume={0.8} />
      <Audio name="SFX · Meter boom" from={IMPACT} src={staticFile('sfx/lowFrequency_explosion_000.wav')} premountFor={fps} volume={0.6} />
      <Audio name="SFX · Fear glitch" from={IMPACT + 3} src={staticFile('sfx/glitch_003.wav')} premountFor={fps} volume={0.5} />
      <Audio name="SFX · Data rush" from={185} src={staticFile('sfx/computerNoise_001.wav')} premountFor={fps} volume={0.15} />
    </AbsoluteFill>
  );
};

const sentimentSceneSchema = {
  warningColor: {type: 'color', default: '#FF3366', description: 'Warning color'},
} as const satisfies InteractivitySchema;

export const SentimentScene = Interactive.withSchema({
  Component: SentimentSceneInner,
  componentName: '<SentimentScene>',
  schema: sentimentSceneSchema,
  wrapInSequence: true,
});

export const SentimentSceneComposition: React.FC = () => (
  <Composition
    id="SentimentScene"
    component={SentimentScene}
    durationInFrames={450}
    fps={60}
    width={1080}
    height={1920}
    defaultProps={{warningColor: '#FF3366'}}
  />
);
