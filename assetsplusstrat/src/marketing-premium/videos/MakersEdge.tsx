import type React from 'react';
import {Atmosphere} from '../kit/Atmosphere';
import {prog, type SceneProps} from '../kit/theme';
import {Arsenal} from '../makers/Arsenal';
import {Close} from '../makers/Close';
import {District} from '../makers/District';
import {Element} from '../makers/Element';
import {FORGE_TINT} from '../makers/forge';
import {Frustration} from '../makers/Frustration';

// The Maker's Edge — a B2B casting-grain film for independent jewelers.
export const MAKERS_TINT = FORGE_TINT;

export const MAKERS_BACKDROP = (frame: number): React.ReactNode => (
  <Atmosphere frame={frame} tint={FORGE_TINT} intensity={prog(frame, 0, 90) * 0.55} />
);

export const MAKERS_SCENES: Record<string, React.FC<SceneProps>> = {
  element: Element,
  frustration: Frustration,
  arsenal: Arsenal,
  district: District,
  cta: Close,
};
