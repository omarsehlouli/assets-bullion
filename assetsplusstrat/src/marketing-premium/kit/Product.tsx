import type React from 'react';
import {Img} from 'remotion';
import {art, EASE, mix, prog} from './theme';

const sheenBand = (t: number, strength = 0.9, angle = 112) =>
  `linear-gradient(${angle}deg, rgba(255,255,255,0) ${mix(-30, 100, t) - 14}%, rgba(255,248,226,${strength}) ${mix(-30, 100, t)}%, rgba(255,255,255,0) ${mix(-30, 100, t) + 14}%)`;

// A cut-out product photograph lit like a studio still: soft contact shadow,
// optional glossy-floor reflection and a specular band that sweeps across the
// metal (masked to the product's own silhouette).
export const Product: React.FC<{
  src: string;
  frame: number;
  w: number;
  h: number;
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
  opacity?: number;
  // Frames at which a sheen crosses.
  sheen?: number[];
  sheenAngle?: number;
  float?: number;
  floatPhase?: number;
  shadow?: 'floor' | 'drop' | 'none';
  reflection?: boolean;
  blur?: number;
  glow?: string;
  style?: React.CSSProperties;
}> = ({
  src,
  frame,
  w,
  h,
  x,
  y,
  rotate = 0,
  scale = 1,
  opacity = 1,
  sheen = [],
  sheenAngle = 112,
  float = 0,
  floatPhase = 0,
  shadow = 'drop',
  reflection = false,
  blur = 0,
  glow,
  style,
}) => {
  const bob = Math.sin(frame / 48 + floatPhase) * float;
  const sweep = sheen
    .map((at) => prog(frame, at, 46, EASE.inOut))
    .find((t) => t > 0 && t < 1);
  const url = art(src);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        opacity,
        transform: `translateY(${bob}px) rotate(${rotate}deg) scale(${scale})`,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      {shadow === 'floor' ? (
        <div
          style={{
            position: 'absolute',
            left: w * 0.08,
            right: w * 0.08,
            top: h - h * 0.05 - bob,
            height: h * 0.12,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 72%)',
            transform: `scale(${1 - bob / 160})`,
          }}
        />
      ) : null}
      {reflection ? (
        <Img
          src={url}
          style={{
            position: 'absolute',
            left: 0,
            top: h + 6 - bob * 2,
            width: w,
            height: h,
            objectFit: 'contain',
            transform: 'scaleY(-1)',
            opacity: 0.2,
            maskImage: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 38%)',
            WebkitMaskImage: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 38%)',
          }}
        />
      ) : null}
      <Img
        src={url}
        style={{
          position: 'absolute',
          inset: 0,
          width: w,
          height: h,
          objectFit: 'contain',
          filter:
            shadow === 'drop'
              ? `drop-shadow(0 ${h * 0.06}px ${h * 0.07}px rgba(0,0,0,0.6))${glow ? ` drop-shadow(0 0 ${h * 0.12}px ${glow})` : ''}`
              : glow
                ? `drop-shadow(0 0 ${h * 0.12}px ${glow})`
                : undefined,
        }}
      />
      {sweep !== undefined ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: sheenBand(sweep, 0.85, sheenAngle),
            mixBlendMode: 'screen',
            maskImage: `url(${url})`,
            WebkitMaskImage: `url(${url})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        />
      ) : null}
    </div>
  );
};

const EDGE = {
  gold: ['#5b420f', '#a27b26', '#e5c264', '#b48a2e', '#6e5114'],
  silver: ['#4d535a', '#9aa3ad', '#eef1f4', '#a8b0b9', '#5a6068'],
};

// A coin with real thickness, built from stacked discs in CSS 3D. Faces are
// the actual product photographs; light falls off as the coin turns away.
export const Coin: React.FC<{
  src: string;
  back?: string;
  frame: number;
  d: number;
  x: number;
  y: number;
  // Degrees about the vertical axis; 0 faces the camera.
  turn?: number;
  tilt?: number;
  roll?: number;
  scale?: number;
  opacity?: number;
  metal?: 'gold' | 'silver';
  sheen?: number[];
  thickness?: number;
  shadow?: boolean;
  blur?: number;
  glow?: string;
}> = ({
  src,
  back,
  frame,
  d,
  x,
  y,
  turn = 0,
  tilt = 0,
  roll = 0,
  scale = 1,
  opacity = 1,
  metal = 'gold',
  sheen = [],
  thickness,
  shadow = true,
  blur = 0,
  glow,
}) => {
  const t = thickness ?? d * 0.075;
  const layers = 18;
  const edge = EDGE[metal];
  const rad = (turn * Math.PI) / 180;
  const facing = Math.cos(rad);
  // Light from upper left: brightest just off-axis, darker edge-on and from behind.
  const light = 0.62 + 0.38 * Math.abs(facing) + 0.12 * Math.sin(rad + 0.6);
  const sweep = sheen.map((at) => prog(frame, at, 46, EASE.inOut)).find((p) => p > 0 && p < 1);
  const angleSheen = Math.max(0, Math.sin(rad * 1.6 + 0.4)) * 0.5;
  const face = (img: string, isBack: boolean): React.ReactNode => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        overflow: 'hidden',
        backfaceVisibility: 'hidden',
        transform: `${isBack ? 'rotateY(180deg) ' : ''}translateZ(${t / 2 + 0.5}px)`,
        filter: `brightness(${isBack ? light * 0.85 : light})`,
      }}
    >
      <Img src={art(img)} style={{width: d, height: d, display: 'block', transform: isBack && !back ? 'scaleX(-1)' : undefined}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(${125 + turn * 0.4}deg, rgba(255,250,235,0) 25%, rgba(255,250,235,${angleSheen}) 48%, rgba(255,250,235,0) 70%)`,
          mixBlendMode: 'screen',
        }}
      />
      {sweep !== undefined ? (
        <div style={{position: 'absolute', inset: 0, background: sheenBand(sweep, 0.8), mixBlendMode: 'screen'}} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          boxShadow: `inset 0 0 ${d * 0.02}px rgba(0,0,0,0.45)`,
        }}
      />
    </div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: x - d / 2,
        top: y - d / 2,
        width: d,
        height: d,
        opacity,
        scale: String(scale),
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
      }}
    >
      {shadow ? (
        <div
          style={{
            position: 'absolute',
            left: d * 0.1,
            right: d * 0.1,
            top: d * 0.12,
            bottom: -d * 0.12,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 68%)',
            transform: `scaleX(${0.35 + 0.65 * Math.abs(facing)})`,
            filter: glow ? `drop-shadow(0 0 ${d * 0.2}px ${glow})` : undefined,
          }}
        />
      ) : null}
      <div style={{position: 'absolute', inset: 0, perspective: d * 3.2}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: `rotateZ(${roll}deg) rotateX(${tilt}deg) rotateY(${turn}deg)`,
          }}
        >
          {Array.from({length: layers}, (_, k) => {
            const z = -t / 2 + (k / (layers - 1)) * t;
            const band = edge[Math.min(edge.length - 1, Math.floor((k / layers) * edge.length))];
            return (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  inset: d * 0.004,
                  borderRadius: '50%',
                  background: band,
                  transform: `translateZ(${z}px)`,
                  filter: `brightness(${0.7 + 0.5 * Math.abs(Math.sin(rad))})`,
                }}
              />
            );
          })}
          {face(src, false)}
          {face(back ?? src, true)}
        </div>
      </div>
    </div>
  );
};
