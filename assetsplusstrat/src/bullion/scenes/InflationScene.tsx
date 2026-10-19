import {Audio} from '@remotion/media';
import type React from 'react';
import {
  AbsoluteFill,
  Composition,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from 'remotion';
import {C, clamp, expoInOut, glass, KINETIC_FONT, pop, UI_FONT} from '../theme';

type InflationSceneProps = {
  readonly warningColor: string;
  readonly style?: React.CSSProperties;
};

const FED_CUE = 215;
const NEGATIVE_CUE = 365;

// ---- Wireframe barrel ------------------------------------------------------

const BARREL_R = 190;
const BARREL_H = 500;
const ELEVATION = 0.34;
const RIBS = 18;

// Barrels bulge in the middle.
const radiusAt = (v: number) => BARREL_R * (1 + 0.09 * Math.cos(Math.PI * (v - 0.5) * 2) * 0.5 + 0.045);

const OilBarrel: React.FC<{
  readonly frame: number;
  readonly level: number;
  readonly color: string;
}> = ({frame, level, color}) => {
  const cx = 300;
  const cy = 330;
  const yaw = frame * 0.018;
  const sinE = Math.sin(ELEVATION);
  const cosE = Math.cos(ELEVATION);
  // v: 0 = top, 1 = bottom
  const yAt = (v: number) => cy + (v - 0.5) * BARREL_H * cosE;
  const ring = (v: number, part: 'front' | 'back') => {
    const r = radiusAt(v);
    const y = yAt(v);
    return `M ${cx - r} ${y} A ${r} ${r * sinE} 0 0 ${part === 'front' ? 0 : 1} ${cx + r} ${y}`;
  };

  const levelV = 1 - level;
  const silhouette = (from: number, to: number, side: 1 | -1) =>
    Array.from({length: 13}, (_, k) => {
      const v = from + ((to - from) * k) / 12;
      return `${cx + side * radiusAt(v)} ${yAt(v)}`;
    });
  const liquid =
    level > 0.005
      ? [
          `M ${silhouette(levelV, 1, -1).join(' L ')}`,
          `A ${radiusAt(1)} ${radiusAt(1) * sinE} 0 0 0 ${cx + radiusAt(1)} ${yAt(1)}`,
          `L ${silhouette(1, levelV, 1).join(' L ')}`,
          `A ${radiusAt(levelV)} ${radiusAt(levelV) * sinE} 0 0 1 ${cx - radiusAt(levelV)} ${yAt(levelV)}`,
          'Z',
        ].join(' ')
      : null;
  const wobble = Math.sin(frame / 7) * 3;

  return (
    <svg width={600} height={700} viewBox="0 0 600 700" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="oil-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.95} />
          <stop offset="100%" stopColor="#7A0A2A" stopOpacity={0.9} />
        </linearGradient>
      </defs>

      {/* Back halves of rings and ribs */}
      {[0, 0.12, 0.33, 0.67, 0.88, 1].map((v) => (
        <path key={`b-${v}`} d={ring(v, 'back')} fill="none" stroke={C.cyan} strokeOpacity={0.22} strokeWidth={2} strokeDasharray="6 6" />
      ))}

      {liquid ? (
        <>
          <path d={liquid} fill="url(#oil-fill)" style={{filter: `drop-shadow(0 0 30px ${color}88)`}} />
          <ellipse
            cx={cx}
            cy={yAt(levelV) + wobble * 0.3}
            rx={radiusAt(levelV)}
            ry={radiusAt(levelV) * sinE + wobble}
            fill={color}
            fillOpacity={0.55}
            stroke="#FFB3C6"
            strokeWidth={2}
          />
        </>
      ) : null}

      {Array.from({length: RIBS}, (_, k) => {
        const theta = (k / RIBS) * Math.PI * 2 + yaw;
        const front = Math.sin(theta) > 0;
        const points = Array.from({length: 13}, (_, j) => {
          const v = j / 12;
          const r = radiusAt(v);
          return `${cx + r * Math.cos(theta)},${yAt(v) + r * Math.sin(theta) * sinE}`;
        }).join(' ');
        return (
          <polyline
            key={`r-${k}`}
            points={points}
            fill="none"
            stroke={C.cyan}
            strokeWidth={front ? 2.2 : 1.2}
            strokeOpacity={front ? 0.85 : 0.18}
          />
        );
      })}

      {/* Front halves of rings */}
      {[0, 0.12, 0.33, 0.67, 0.88, 1].map((v) => (
        <path
          key={`f-${v}`}
          d={ring(v, 'front')}
          fill="none"
          stroke={C.cyan}
          strokeWidth={v === 0.33 || v === 0.67 ? 4 : 2.5}
          style={{filter: `drop-shadow(0 0 6px ${C.cyan})`}}
        />
      ))}
      <ellipse cx={cx} cy={yAt(0)} rx={radiusAt(0)} ry={radiusAt(0) * sinE} fill="none" stroke={C.cyan} strokeWidth={2.5} />
      <ellipse cx={cx + 90} cy={yAt(0) + 6} rx={26} ry={26 * sinE} fill="none" stroke={C.cyan} strokeWidth={2} />
    </svg>
  );
};

// ---- Inflation gauge ---------------------------------------------------------

const GAUGE_R = 320;
const polar = (cx: number, cy: number, r: number, value: number) => {
  const a = Math.PI + value * Math.PI;
  return {x: cx + r * Math.cos(a), y: cy + r * Math.sin(a)};
};
const arc = (cx: number, cy: number, r: number, from: number, to: number) => {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`;
};

const InflationSceneInner: React.FC<InflationSceneProps> = ({warningColor, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const barrelIn = pop(frame, 10, fps);
  const fill = interpolate(frame, [40, 220], [0, 0.82], {...clamp, easing: expoInOut});
  const oilChip = pop(frame, 44, fps);
  const needlePush = pop(frame, 125, fps);
  const needle = 0.32 + needlePush * 0.58 + (frame > 170 ? Math.sin(frame * 0.9) * 0.008 : 0);
  const inRed = needle > 0.7;
  const negative = pop(frame, NEGATIVE_CUE, fps);
  const fedBoost = interpolate(frame, [FED_CUE, FED_CUE + 30], [0, 1], clamp);

  const gx = 540;
  const gy = 1440;

  return (
    <AbsoluteFill style={{fontFamily: UI_FONT, color: C.ink, overflow: 'hidden', ...style}}>
      {/* Aggressive background scroll */}
      <Interactive.Div
        name="Fed policy scroll"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: interpolate(frame, [0, 30, FED_CUE, FED_CUE + 30], [0, 0.14, 0.14, 0.32], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {Array.from({length: 10}, (_, row) => {
          const dir = row % 2 === 0 ? -1 : 1;
          const speed = 9 + (row % 3) * 3;
          const distance = speed * frame + speed * 1.4 * Math.max(0, frame - FED_CUE);
          const unit = 2300;
          const x = dir < 0 ? -(distance % unit) : -unit + (distance % unit);
          return (
            <div
              key={row}
              style={{
                position: 'absolute',
                left: 0,
                top: row * 196 - 30,
                whiteSpace: 'nowrap',
                translate: `${x}px 0px`,
                fontFamily: KINETIC_FONT,
                fontWeight: 700,
                fontSize: 148,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: row === 4 && fedBoost > 0 ? `rgba(255,51,102,${0.6 * fedBoost})` : 'transparent',
                WebkitTextStroke: `2px ${row % 3 === 0 ? warningColor : 'rgba(242,244,248,0.9)'}`,
              }}
            >
              {[0, 1, 2].map((k) => (
                <span key={k} style={{display: 'inline-block', width: unit}}>
                  TIGHTER FED POLICY •
                </span>
              ))}
            </div>
          );
        })}
      </Interactive.Div>

      <Interactive.Div
        name="Oil barrel"
        style={{
          position: 'absolute',
          left: 240,
          top: 220,
          width: 600,
          height: 700,
          transformOrigin: '50% 60%',
          opacity: Math.min(1, barrelIn * 1.6),
          scale: 0.25 + barrelIn * 0.75,
        }}
      >
        <OilBarrel frame={frame} level={fill} color={warningColor} />
      </Interactive.Div>

      <Interactive.Div
        name="Oil chip"
        style={{
          position: 'absolute',
          left: 770,
          top: 300,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 22px',
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: '0.1em',
          transformOrigin: '0% 50%',
          ...glass('rgba(255,51,102,0.12)'),
          borderRadius: 18,
          opacity: Math.min(1, oilChip * 1.5),
          scale: oilChip,
        }}
      >
        OIL
        <span style={{color: warningColor, textShadow: `0 0 16px ${warningColor}`}}>▲</span>
      </Interactive.Div>

      <Interactive.Div
        name="Inflation gauge"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          opacity: interpolate(frame, [60, 90], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <path d={arc(gx, gy, GAUGE_R, 0, 1)} fill="none" stroke="rgba(242,244,248,0.08)" strokeWidth={46} />
          <path d={arc(gx, gy, GAUGE_R, 0.01, 0.4)} fill="none" stroke={C.cyan} strokeWidth={34} strokeOpacity={0.75} />
          <path d={arc(gx, gy, GAUGE_R, 0.415, 0.69)} fill="none" stroke={C.gold} strokeWidth={34} strokeOpacity={0.75} />
          <path
            d={arc(gx, gy, GAUGE_R, 0.705, 0.99)}
            fill="none"
            stroke={warningColor}
            strokeWidth={inRed ? 40 : 34}
            style={{filter: inRed ? `drop-shadow(0 0 ${18 + Math.sin(frame / 5) * 8}px ${warningColor})` : 'none'}}
          />
          {Array.from({length: 21}, (_, i) => {
            const a = polar(gx, gy, GAUGE_R - 40, i / 20);
            const b = polar(gx, gy, GAUGE_R - (i % 5 === 0 ? 72 : 56), i / 20);
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(242,244,248,0.4)" strokeWidth={i % 5 === 0 ? 3 : 1.5} />;
          })}
          {(() => {
            const tip = polar(gx, gy, GAUGE_R - 30, needle);
            return (
              <>
                <line x1={gx} y1={gy} x2={tip.x} y2={tip.y} stroke={inRed ? warningColor : C.ink} strokeWidth={10} strokeLinecap="round" style={{filter: `drop-shadow(0 0 12px ${inRed ? warningColor : C.ink})`}} />
                <circle cx={gx} cy={gy} r={26} fill={C.bg} stroke={inRed ? warningColor : C.ink} strokeWidth={6} />
              </>
            );
          })()}
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: gy + 50,
            textAlign: 'center',
            fontFamily: KINETIC_FONT,
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          INFLATION FEARS
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: gy - 150,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '0.2em',
              color: C.bg,
              backgroundColor: inRed ? warningColor : 'rgba(242,244,248,0.5)',
              boxShadow: inRed ? `0 0 26px ${warningColor}` : 'none',
            }}
          >
            {inRed ? 'HIGH' : 'MODERATE'}
          </div>
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Negative for metals"
        style={{
          position: 'absolute',
          left: 140,
          top: 1630,
          width: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '18px 26px',
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '0.12em',
          color: warningColor,
          ...glass('rgba(255,51,102,0.14)'),
          border: `2px solid ${warningColor}`,
          borderRadius: 18,
          opacity: Math.min(1, negative * 1.5),
          scale: negative,
        }}
      >
        ▼ MAJOR NEGATIVE FOR METALS
      </Interactive.Div>
      <Audio name="SFX · Barrel" from={10} src={staticFile('sfx/maximize_006.wav')} premountFor={fps} volume={0.5} />
      <Audio name="SFX · Gauge push" from={125} src={staticFile('sfx/forceField_001.wav')} premountFor={fps} volume={0.35} />
      <Audio name="SFX · Fed glitch" from={FED_CUE} src={staticFile('sfx/glitch_001.wav')} premountFor={fps} volume={0.5} />
      <Audio name="SFX · Negative" from={NEGATIVE_CUE} src={staticFile('sfx/impactMetal_heavy_001.wav')} premountFor={fps} volume={0.4} />
    </AbsoluteFill>
  );
};

const inflationSceneSchema = {
  warningColor: {type: 'color', default: '#FF3366', description: 'Warning color'},
} as const satisfies InteractivitySchema;

export const InflationScene = Interactive.withSchema({
  Component: InflationSceneInner,
  componentName: '<InflationScene>',
  schema: inflationSceneSchema,
  wrapInSequence: true,
});

export const InflationSceneComposition: React.FC = () => (
  <Composition
    id="InflationScene"
    component={InflationScene}
    durationInFrames={450}
    fps={60}
    width={1080}
    height={1920}
    defaultProps={{warningColor: '#FF3366'}}
  />
);
