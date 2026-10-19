import {loadFont as loadSerif} from '@remotion/google-fonts/CormorantGaramond';
import {loadFont as loadSans} from '@remotion/google-fonts/Inter';
import {Easing, interpolate, staticFile} from 'remotion';

export const {fontFamily: SERIF} = loadSerif('normal', {weights: ['500', '600'], subsets: ['latin']});
loadSerif('italic', {weights: ['500', '600'], subsets: ['latin']});
export const {fontFamily: SANS} = loadSans('normal', {weights: ['400', '500', '600'], subsets: ['latin']});

export const FPS = 60;
export const W = 1080;
export const H = 1920;

export const C = {
  black: '#050506',
  ink: '#0b0b0e',
  ivory: '#f4eedf',
  champagne: '#d9c79b',
  mute: 'rgba(244,238,223,0.62)',
  faint: 'rgba(244,238,223,0.16)',
  gold: '#d4af37',
  goldLight: '#f6e3a1',
  goldDeep: '#8a6a1f',
  silver: '#dfe4ea',
  rose: '#e9b9a4',
};

// Per-video key light. Warm gold by default; the gift film runs rosier.
export type Tint = {key: string; rim: string; accent: string};
export const TINTS = {
  gold: {key: '214,168,74', rim: '120,140,170', accent: C.gold},
  rose: {key: '226,160,128', rim: '150,120,140', accent: C.rose},
  regal: {key: '220,170,70', rim: '90,90,120', accent: C.gold},
  city: {key: '205,170,105', rim: '90,130,170', accent: C.gold},
} satisfies Record<string, Tint>;

export const GOLD_GRADIENT =
  'linear-gradient(100deg,#8a6a1f 0%,#c9a246 18%,#f7e7b0 34%,#d8b250 48%,#9c7726 62%,#e9cc78 80%,#a98429 100%)';
export const SILVER_GRADIENT =
  'linear-gradient(100deg,#6f7780 0%,#b9c1ca 20%,#ffffff 36%,#c5ccd4 50%,#7d858e 64%,#e7ebf0 82%,#8a929b 100%)';
export const ROSE_GRADIENT =
  'linear-gradient(100deg,#8e5a46 0%,#d49a84 20%,#fbe0d2 36%,#dca48c 50%,#9a6550 64%,#efc3ae 82%,#a06b55 100%)';

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  silk: Easing.bezier(0.33, 0, 0.12, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
};

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 0→1 over `dur` frames from `start`.
export const prog = (frame: number, start: number, dur: number, easing = EASE.out) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {...CLAMP, easing});

// Rises in at `start`, falls out ending at `end`.
export const life = (frame: number, start: number, end: number, fadeIn = 18, fadeOut = 14) =>
  prog(frame, start, fadeIn) * (1 - prog(frame, end - fadeOut, fadeOut, EASE.in));

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Asset names are relative to public/marketing/premium unless they name a folder, e.g. 'premium-2/coin.png'.
export const art = (name: string) => staticFile(name.includes('/') ? `marketing/${name}` : `marketing/premium/${name}`);
export const LOGO = staticFile('brand/logo-bullion.webp');

export type TimedWord = {word: string; start: number; end: number};

export type ScheduleScene = {
  id: string;
  text: string;
  audioStart: number;
  audioEnd: number;
  visualStart: number;
  visualEnd: number;
  words: TimedWord[];
};

export type VideoSchedule = {
  id: string;
  title: string;
  fps: number;
  durationInFrames: number;
  duration: number;
  voice: string;
  score: string;
  scenes: ScheduleScene[];
};

export type SceneProps = {
  // Frames since this scene's cut.
  frame: number;
  // Frames until the next cut.
  duration: number;
  // Local frame where the n-th occurrence of `word` starts being spoken.
  cue: (word: string, occurrence?: number) => number;
};

const clean = (word: string) => word.toLowerCase().replace(/[^a-z0-9]/g, '');

export const makeCue = (scene: ScheduleScene, fps: number) => (word: string, occurrence = 0) => {
  const target = clean(word);
  const match = scene.words.filter((w) => clean(w.word) === target)[occurrence];
  if (!match) {
    throw new Error(`No "${word}" in scene ${scene.id}`);
  }
  return Math.round((match.start - scene.visualStart) * fps);
};
