import type React from 'react';
import {AbsoluteFill, Img, random} from 'remotion';
import {art, C, H, W, type Tint} from './theme';

type Mote = {x: number; y: number; r: number; speed: number; sway: number; phase: number; alpha: number};

const motes = (seed: string, count: number, r: [number, number], speed: [number, number], alpha: [number, number]): Mote[] =>
  Array.from({length: count}, (_, i) => ({
    x: random(`${seed}x${i}`) * W,
    y: random(`${seed}y${i}`) * H,
    r: r[0] + random(`${seed}r${i}`) * (r[1] - r[0]),
    speed: speed[0] + random(`${seed}s${i}`) * (speed[1] - speed[0]),
    sway: 6 + random(`${seed}w${i}`) * 22,
    phase: random(`${seed}p${i}`) * Math.PI * 2,
    alpha: alpha[0] + random(`${seed}a${i}`) * (alpha[1] - alpha[0]),
  }));

const FAR = motes('far', 70, [0.8, 1.8], [0.05, 0.16], [0.12, 0.4]);
const MID = motes('mid', 30, [1.8, 3.4], [0.16, 0.34], [0.25, 0.65]);
const BOKEH = motes('bokeh', 9, [26, 64], [0.1, 0.25], [0.05, 0.12]);

const RAYS = [
  {angle: -17, width: 220, alpha: 0.5},
  {angle: -8, width: 120, alpha: 0.8},
  {angle: -1, width: 300, alpha: 0.55},
  {angle: 7, width: 150, alpha: 0.75},
  {angle: 15, width: 240, alpha: 0.45},
];

const place = (m: Mote, frame: number) => {
  const y = (((m.y - frame * m.speed) % (H + 160)) + H + 160) % (H + 160) - 80;
  const x = m.x + Math.sin(frame / 90 + m.phase) * m.sway;
  // Motes glitter where they cross the key light.
  const inLight = Math.exp(-(((x - W / 2) / 380) ** 2)) * (0.55 + 0.45 * Math.max(0, 1 - y / 1500));
  return {x, y, inLight};
};

export const Atmosphere: React.FC<{frame: number; tint: Tint; intensity?: number}> = ({frame, tint, intensity = 1}) => {
  const breathe = 0.9 + 0.1 * Math.sin(frame / 70);
  return (
    <AbsoluteFill style={{backgroundColor: C.black, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 62% 48% at 50% 4%, rgba(${tint.key},${0.3 * intensity * breathe}) 0%, rgba(${tint.key},${0.09 * intensity}) 42%, rgba(0,0,0,0) 72%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 30% at ${70 + Math.sin(frame / 160) * 8}% 96%, rgba(${tint.rim},${0.12 * intensity}) 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      {RAYS.map((ray, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: W / 2 - ray.width / 2,
            top: -160,
            width: ray.width,
            height: 2200,
            transformOrigin: '50% 0%',
            rotate: `${ray.angle + Math.sin(frame / 210 + i * 1.7) * 1.6}deg`,
            background: `linear-gradient(180deg, rgba(${tint.key},${0.16 * ray.alpha * intensity}) 0%, rgba(${tint.key},${0.05 * ray.alpha * intensity}) 48%, rgba(0,0,0,0) 78%)`,
            maskImage: 'linear-gradient(90deg, transparent, black 50%, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, black 50%, transparent)',
            opacity: 0.75 + 0.25 * Math.sin(frame / 55 + i * 2.1),
          }}
        />
      ))}
      {BOKEH.map((m, i) => {
        const {x, y, inLight} = place(m, frame * 0.6);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - m.r,
              top: y - m.r,
              width: m.r * 2,
              height: m.r * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${tint.key},${m.alpha * (0.4 + inLight) * intensity}) 0%, rgba(${tint.key},${m.alpha * 0.5 * intensity}) 55%, rgba(0,0,0,0) 72%)`,
            }}
          />
        );
      })}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {FAR.map((m, i) => {
          const {x, y, inLight} = place(m, frame);
          return <circle key={`f${i}`} cx={x} cy={y} r={m.r} fill={`rgba(${tint.key},1)`} opacity={m.alpha * (0.35 + inLight) * intensity} />;
        })}
        {MID.map((m, i) => {
          const {x, y, inLight} = place(m, frame);
          const twinkle = 0.6 + 0.4 * Math.sin(frame / 9 + m.phase * 3);
          return (
            <g key={`m${i}`} opacity={m.alpha * (0.3 + inLight) * twinkle * intensity}>
              <circle cx={x} cy={y} r={m.r * 3.2} fill={`rgba(${tint.key},0.18)`} />
              <circle cx={x} cy={y} r={m.r} fill="#fff6dc" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Film grain and lens vignette, laid over everything.
export const Finish: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill
      style={{background: 'radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 88%, rgba(0,0,0,0.8) 100%)'}}
    />
    <AbsoluteFill style={{overflow: 'hidden', opacity: 0.07, mixBlendMode: 'overlay'}}>
      <div
        style={{
          position: 'absolute',
          left: -Math.floor(random(`gx${frame}`) * 440),
          top: -Math.floor(random(`gy${frame}`) * 500),
          width: 1536,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 512px)',
        }}
      >
        {Array.from({length: 15}, (_, i) => (
          <Img key={i} src={art('grain.png')} style={{width: 512, height: 512, display: 'block'}} />
        ))}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
