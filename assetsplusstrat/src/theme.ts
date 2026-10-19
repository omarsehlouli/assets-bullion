import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';
import {loadFont as loadJetBrainsMono} from '@remotion/google-fonts/JetBrainsMono';
import {Easing} from 'remotion';

export const {fontFamily: DISPLAY_FONT} = loadInterTight('normal', {
  weights: ['500', '700', '800', '900'],
  subsets: ['latin'],
});

export const {fontFamily: MONO_FONT} = loadJetBrainsMono('normal', {
  weights: ['400', '500', '700', '800'],
  subsets: ['latin'],
});

export const NEON = {
  cyan: '#00E5FF',
  gold: '#FFC83D',
  silver: '#C9D6E8',
  red: '#FF2D55',
  green: '#2BFF88',
  violet: '#B15CFF',
  amber: '#FF9F1C',
} as const;

export const INK = '#EAF0FF';
export const BG = '#03050B';

// Scene boundaries of the main video, in seconds. Each camera pan lasts 1s,
// centered on its boundary.
export const SCENE_BOUNDARIES = [4, 11, 18, 25] as const;

export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeInSharp = Easing.bezier(0.7, 0, 0.84, 0);

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;
