import type React from 'react';
import {Composition, Folder} from 'remotion';
import {WHATS_INSIDE, WhatsInside} from './WhatsInside';

// Story-led films cloned from reference reels (see references/ and productions/).
export const StoryCompositions: React.FC = () => (
  <Folder name="story">
    <Composition
      id="Bullion-WhatsInside"
      component={WhatsInside}
      width={1080}
      height={1920}
      fps={WHATS_INSIDE.fps}
      durationInFrames={WHATS_INSIDE.durationInFrames}
    />
  </Folder>
);
