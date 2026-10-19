import {Audio} from '@remotion/media';
import type React from 'react';
import {
  AbsoluteFill,
  Composition,
  Easing,
  Interactive,
  interpolate,
  random,
  staticFile,
  spring,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {
  C,
  clamp,
  glass,
  KINETIC_FONT,
  pop,
  POP,
  UI_FONT,
} from '../theme';

type HeadwindsSceneProps = {
  readonly warningColor: string;
  readonly style?: React.CSSProperties;
};

const BONDS_IMPACT = 200;
const YIELDS_IMPACT = 330;
const PRESSURE = 470;

// Candle i appears at CANDLE_AT[i]: a slow bleed, then the crash.
const CANDLE_COUNT = 22;
const CANDLE_AT = Array.from({length: CANDLE_COUNT}, (_, i) =>
  i < 8 ? 36 + i * 14 : 165 + (i - 8) * 8.5,
);
const CANDLES = (() => {
  let price = 0.86;
  return Array.from({length: CANDLE_COUNT}, (_, i) => {
    const crash = i >= 8;
    const drift = crash ? -0.045 - random(`cd-${i}`) * 0.03 : -0.012;
    const bounce = random(`cb-${i}`) < (crash ? 0.12 : 0.3);
    const open = price;
    const close = Math.max(0.05, open + (bounce ? Math.abs(drift) * 0.5 : drift));
    price = close;
    return {
      open,
      close,
      high: Math.max(open, close) + 0.01 + random(`ch-${i}`) * 0.03,
      low: Math.min(open, close) - 0.01 - random(`cl-${i}`) * (crash ? 0.05 : 0.02),
    };
  });
})();

const YIELD_PATH = [
  [60, 690],
  [220, 612],
  [300, 642],
  [460, 470],
  [540, 512],
  [700, 300],
  [760, 334],
  [900, 92],
] as const;

const segLengths = YIELD_PATH.slice(1).map(([x, y], i) =>
  Math.hypot(x - YIELD_PATH[i][0], y - YIELD_PATH[i][1]),
);
const totalLength = segLengths.reduce((a, b) => a + b, 0);

// Point and direction at fraction `p` of the arrow's length.
const along = (p: number) => {
  let remaining = p * totalLength;
  for (let i = 0; i < segLengths.length; i++) {
    if (remaining <= segLengths[i] || i === segLengths.length - 1) {
      const t = Math.min(1, remaining / segLengths[i]);
      const [x0, y0] = YIELD_PATH[i];
      const [x1, y1] = YIELD_PATH[i + 1];
      return {x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, angle: Math.atan2(y1 - y0, x1 - x0), index: i};
    }
    remaining -= segLengths[i];
  }
  return {x: 900, y: 92, angle: 0, index: segLengths.length - 1};
};

const Flash: React.FC<{
  readonly frame: number;
  readonly impact: number;
  readonly color: string;
  readonly lines: string[];
  readonly style: React.CSSProperties;
}> = ({frame, impact, color, lines, style}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - impact + 8, fps, config: POP});
  const split = interpolate(frame, [impact, impact + 20], [14, 0], clamp);
  const flicker = [impact + 2, impact + 5, impact + 11].includes(frame) ? 0.25 : 1;
  return (
    <div
      style={{
        position: 'absolute',
        fontFamily: KINETIC_FONT,
        fontWeight: 700,
        fontSize: 150,
        lineHeight: 0.92,
        letterSpacing: '-0.03em',
        color: '#FFFFFF',
        textShadow: `${split}px 0 0 ${color}, ${-split}px 0 0 ${C.cyan}, 0 0 40px ${color}AA`,
        opacity: frame < impact - 8 ? 0 : Math.min(1, s * 1.5) * flicker,
        scale: 1.5 - s * 0.5,
        ...style,
      }}
    >
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
};

const HeadwindsSceneInner: React.FC<HeadwindsSceneProps> = ({warningColor, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const arrow = interpolate(frame, [286, YIELDS_IMPACT], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.exp),
  });
  const head = along(arrow);
  const drawn = [
    ...YIELD_PATH.slice(0, head.index + 1).map(([x, y]) => `${x},${y}`),
    `${head.x},${head.y}`,
  ].join(' ');

  const shake =
    interpolate(frame, [BONDS_IMPACT, BONDS_IMPACT + 18], [16, 0], clamp) +
    interpolate(frame, [YIELDS_IMPACT, YIELDS_IMPACT + 22], [22, 0], clamp) +
    interpolate(frame, [PRESSURE + 10, PRESSURE + 30], [10, 0], clamp);
  const shakeX = (random(`hs-x-${frame}`) - 0.5) * 2 * shake;
  const shakeY = (random(`hs-y-${frame}`) - 0.5) * 2 * shake;

  const squeeze = pop(frame, PRESSURE, fps);
  const badge = pop(frame, 30, fps);
  const decades = pop(frame, 390, fps);

  return (
    <AbsoluteFill style={{fontFamily: UI_FONT, color: C.ink, ...style}}>
      <AbsoluteFill style={{translate: `${shakeX}px ${shakeY}px`}}>
        <Interactive.Div
          name="Bonds panel"
          style={{
            position: 'absolute',
            left: 50,
            top: 196,
            width: 980,
            height: 744,
            overflow: 'hidden',
            ...glass('rgba(255,51,102,0.06)'),
            scale: interpolate(frame, [8, 56], [0.9, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.spring({stiffness: 120, damping: 14}),
            }),
            translate: interpolate(frame, [PRESSURE, PRESSURE + 48], ['0px 0px', '0px 34px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.spring({stiffness: 120, damping: 14}),
            }),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 36,
              right: 36,
              top: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '0.14em',
            }}
          >
            <span style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: warningColor, boxShadow: `0 0 12px ${warningColor}`}} />
            BOND MARKET
            <span style={{fontSize: 20, color: C.mute, letterSpacing: '0.2em'}}>PRICE</span>
            <span style={{marginLeft: 'auto', color: warningColor, fontSize: 26}}>▼</span>
          </div>
          <svg width={980} height={744} style={{position: 'absolute', inset: 0}}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1={36} x2={944} y1={120 + i * 112} y2={120 + i * 112} stroke="rgba(242,244,248,0.06)" />
            ))}
            {CANDLES.map((c, i) => {
              const grow = spring({frame: frame - CANDLE_AT[i], fps, config: POP});
              if (frame < CANDLE_AT[i]) {
                return null;
              }
              const x = 60 + i * 40;
              const toY = (v: number) => 130 + (1 - v) * 560;
              const up = c.close > c.open;
              const color = up ? C.cyan : warningColor;
              const bodyTop = toY(Math.max(c.open, c.close));
              const bodyH = Math.max(4, Math.abs(toY(c.open) - toY(c.close)));
              return (
                <g key={i} opacity={Math.min(1, grow * 1.5)}>
                  <line x1={x + 13} x2={x + 13} y1={toY(c.high)} y2={toY(c.low)} stroke={color} strokeWidth={3} />
                  <rect
                    x={x}
                    y={up ? bodyTop + bodyH * (1 - grow) : bodyTop}
                    width={26}
                    height={bodyH * grow}
                    rx={3}
                    fill={color}
                    style={{filter: `drop-shadow(0 0 8px ${color})`}}
                  />
                </g>
              );
            })}
          </svg>
          <Flash
            frame={frame}
            impact={BONDS_IMPACT}
            color={warningColor}
            lines={['BONDS', 'CRUSHED']}
            style={{left: 44, top: 452, fontSize: 132, transformOrigin: '0% 50%'}}
          />
        </Interactive.Div>

        <Interactive.Div
          name="Yields panel"
          style={{
            position: 'absolute',
            left: 50,
            top: 980,
            width: 980,
            height: 744,
            overflow: 'hidden',
            ...glass('rgba(0,229,255,0.05)'),
            scale: interpolate(frame, [16, 64], [0.9, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.spring({stiffness: 120, damping: 14}),
            }),
            translate: interpolate(frame, [PRESSURE, PRESSURE + 48], ['0px 0px', '0px -34px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.spring({stiffness: 120, damping: 14}),
            }),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 36,
              right: 36,
              top: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '0.14em',
            }}
          >
            <span style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: C.cyan, boxShadow: `0 0 12px ${C.cyan}`}} />
            TREASURY YIELDS
            <span style={{marginLeft: 'auto', color: warningColor, fontSize: 26}}>▲</span>
          </div>
          <svg width={980} height={744} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <line x1={36} x2={944} y1={690} y2={690} stroke="rgba(242,244,248,0.12)" strokeDasharray="6 10" />
            {frame > 286 ? (
              <>
                <polyline
                  points={drawn}
                  fill="none"
                  stroke={warningColor}
                  strokeWidth={26}
                  strokeOpacity={0.3}
                  strokeLinejoin="round"
                  style={{filter: 'blur(10px)'}}
                />
                <polyline
                  points={drawn}
                  fill="none"
                  stroke={warningColor}
                  strokeWidth={12}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <polyline
                  points={drawn}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  strokeOpacity={0.8}
                />
                <polygon
                  points="0,-30 52,0 0,30"
                  fill={warningColor}
                  transform={`translate(${head.x} ${head.y}) rotate(${(head.angle * 180) / Math.PI})`}
                  style={{filter: `drop-shadow(0 0 16px ${warningColor})`}}
                />
              </>
            ) : null}
          </svg>
          <Flash
            frame={frame}
            impact={YIELDS_IMPACT - 22}
            color={warningColor}
            lines={['YIELDS', 'SURGE']}
            style={{left: 40, top: 100, transformOrigin: '0% 50%'}}
          />
          <div
            style={{
              position: 'absolute',
              left: 640,
              top: 432,
              padding: '10px 16px',
              borderRadius: 10,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: warningColor,
              border: `2px solid ${warningColor}`,
              backgroundColor: 'rgba(255,51,102,0.12)',
              boxShadow: `0 0 24px ${warningColor}55`,
              transformOrigin: '0% 50%',
              opacity: Math.min(1, decades * 1.5),
              scale: decades,
            }}
          >
            DECADES-HIGH LEVELS
          </div>
        </Interactive.Div>

        <Interactive.Div
          name="Metals badge"
          style={{
            position: 'absolute',
            left: 290,
            top: 928,
            width: 500,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            borderRadius: 999,
            border: `2px solid ${C.gold}`,
            backgroundColor: 'rgba(10,10,12,0.85)',
            boxShadow: `0 0 ${24 + squeeze * 30}px ${squeeze > 0.05 ? warningColor : C.gold}88`,
            fontFamily: KINETIC_FONT,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: C.gold,
            opacity: Math.min(1, badge * 1.5),
            scale: `${badge * (1 + squeeze * 0.08)} ${badge * (1 - squeeze * 0.28)}`,
          }}
        >
          GOLD · SILVER
          <span
            style={{
              fontFamily: UI_FONT,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: C.bg,
              backgroundColor: warningColor,
              padding: '4px 10px',
              borderRadius: 6,
              opacity: squeeze > 0.05 ? 1 : 0,
            }}
          >
            ▼ PRESSURE
          </span>
        </Interactive.Div>
      </AbsoluteFill>

      <Interactive.Div
        name="Impact flash"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#FF3366',
          mixBlendMode: 'screen',
          opacity:
            interpolate(frame, [BONDS_IMPACT - 1, BONDS_IMPACT, BONDS_IMPACT + 12], [0, 0.22, 0], clamp) +
            interpolate(frame, [YIELDS_IMPACT - 1, YIELDS_IMPACT, YIELDS_IMPACT + 12], [0, 0.26, 0], clamp),
        }}
      />
      <Audio name="SFX · Bonds impact" from={BONDS_IMPACT} src={staticFile('sfx/impactMetal_heavy_001.wav')} premountFor={fps} volume={0.7} />
      <Audio name="SFX · Bonds glitch" from={BONDS_IMPACT} src={staticFile('sfx/glitch_002.wav')} premountFor={fps} volume={0.5} />
      <Audio name="SFX · Yields whip" from={286} src={staticFile('sfx/whip.wav')} premountFor={fps} volume={0.7} />
      <Audio name="SFX · Yields boom" from={YIELDS_IMPACT} src={staticFile('sfx/lowFrequency_explosion_000.wav')} premountFor={fps} volume={0.6} />
      <Audio name="SFX · Pressure" from={PRESSURE + 10} src={staticFile('sfx/impactMetal_heavy_001.wav')} premountFor={fps} volume={0.45} />
    </AbsoluteFill>
  );
};

const headwindsSceneSchema = {
  warningColor: {type: 'color', default: '#FF3366', description: 'Warning color'},
} as const satisfies InteractivitySchema;

export const HeadwindsScene = Interactive.withSchema({
  Component: HeadwindsSceneInner,
  componentName: '<HeadwindsScene>',
  schema: headwindsSceneSchema,
  wrapInSequence: true,
});

export const HeadwindsSceneComposition: React.FC = () => (
  <Composition
    id="HeadwindsScene"
    component={HeadwindsScene}
    durationInFrames={570}
    fps={60}
    width={1080}
    height={1920}
    defaultProps={{warningColor: '#FF3366'}}
  />
);

