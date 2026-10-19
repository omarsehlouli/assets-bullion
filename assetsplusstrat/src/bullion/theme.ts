import type React from 'react';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadSpaceGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {Easing, spring} from 'remotion';

// Inter for UI elements, Space Grotesk for kinetic focal points.
export const {fontFamily: UI_FONT} = loadInter('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
});

export const {fontFamily: KINETIC_FONT} = loadSpaceGrotesk('normal', {
  weights: ['500', '700'],
  subsets: ['latin'],
});

export const C = {
  bg: '#0A0A0C',
  gold: '#FFD700',
  cyan: '#00E5FF',
  red: '#FF3366',
  ink: '#F2F4F8',
  mute: 'rgba(242,244,248,0.55)',
  faint: 'rgba(242,244,248,0.12)',
} as const;

// Spring physics for all UI pop-ins. Settles in 48 frames at 60fps.
export const POP = {stiffness: 120, damping: 14} as const;
export const POP_FRAMES = 48;
export const popEasing = Easing.spring(POP);

// Exponential ease-in-out, for camera pans.
export const expoInOut = Easing.bezier(0.87, 0, 0.13, 1);
export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

export const pop = (frame: number, delay: number, fps: number) =>
  spring({frame: frame - delay, fps, config: POP});

// Scene starts of the voiceover script, in seconds.
export const SCENE_STARTS = [0, 12, 21, 28, 35, 47, 58] as const;
export const VIDEO_SECONDS = 65;

// Glassmorphism surface.
export const glass = (tint = 'rgba(255,255,255,0.05)'): React.CSSProperties => ({
  background: `linear-gradient(160deg, rgba(255,255,255,0.10) 0%, ${tint} 45%, rgba(255,255,255,0.02) 100%)`,
  border: '1px solid rgba(255,255,255,0.14)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.18), 0 30px 80px rgba(0,0,0,0.55)',
  backdropFilter: 'blur(22px) saturate(140%)',
  WebkitBackdropFilter: 'blur(22px) saturate(140%)',
  borderRadius: 28,
});
