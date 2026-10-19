import type React from 'react';
import {Composition, Folder} from 'remotion';
import schedule from '../../public/marketing/premium-3/schedule.json';
import {PremiumVideo} from '../marketing-premium/kit/PremiumVideo';
import {TINTS, type SceneProps, type Tint, type VideoSchedule} from '../marketing-premium/kit/theme';
import {BAR_OR_EAGLE_SCENES} from './videos/BarOrEagle';
import {PICKUP_SCENES} from './videos/Pickup';
import {PREMIUM_FAQ_SCENES} from './videos/Premium';
import {REAL_GOLD_SCENES} from './videos/RealGold';
import {SELL_IN_PERSON_SCENES} from './videos/SellInPerson';

// The FAQ series: straight answers from the Bullion Trading desk.
type Film = {
  id: keyof typeof schedule;
  composition: string;
  tint: Tint;
  scenes: Record<string, React.FC<SceneProps>>;
};

const FILMS: Film[] = [
  {id: 'faq-real-gold', composition: 'Bullion-FAQ-RealGold', tint: TINTS.city, scenes: REAL_GOLD_SCENES},
  {id: 'faq-sell-in-person', composition: 'Bullion-FAQ-SellInPerson', tint: TINTS.gold, scenes: SELL_IN_PERSON_SCENES},
  {id: 'faq-bar-or-eagle', composition: 'Bullion-FAQ-BarOrEagle', tint: TINTS.regal, scenes: BAR_OR_EAGLE_SCENES},
  {id: 'faq-premium', composition: 'Bullion-FAQ-Premium', tint: TINTS.gold, scenes: PREMIUM_FAQ_SCENES},
  {id: 'faq-pickup', composition: 'Bullion-FAQ-Pickup', tint: TINTS.city, scenes: PICKUP_SCENES},
];

const Film: React.FC<{film: string}> = ({film}) => {
  const entry = FILMS.find((f) => f.id === film)!;
  return <PremiumVideo schedule={schedule[entry.id] as VideoSchedule} tint={entry.tint} scenes={entry.scenes} />;
};

export const Premium3Compositions: React.FC = () => (
  <Folder name="premium-3">
    {FILMS.map((film) => {
      const data = schedule[film.id] as VideoSchedule;
      return (
        <Composition
          key={film.id}
          id={film.composition}
          component={Film}
          width={1080}
          height={1920}
          fps={data.fps}
          durationInFrames={data.durationInFrames}
          defaultProps={{film: film.id}}
        />
      );
    })}
  </Folder>
);
