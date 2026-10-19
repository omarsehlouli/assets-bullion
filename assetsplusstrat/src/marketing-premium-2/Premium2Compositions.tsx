import type React from 'react';
import {Composition, Folder} from 'remotion';
import schedule from '../../public/marketing/premium-2/schedule.json';
import {PremiumVideo} from '../marketing-premium/kit/PremiumVideo';
import {TINTS, type SceneProps, type Tint, type VideoSchedule} from '../marketing-premium/kit/theme';
import {TAX_SCENES} from './videos/BullionTax';
import {REAL_OR_FAKE_SCENES} from './videos/RealOrFake';
import {SELL_SCENES} from './videos/SellToUs';
import {SPOT_SCENES} from './videos/SpotToStore';
import {TRADITIONS_SCENES} from './videos/Traditions';

// The second wave of premium films, built from the site's traditions guides,
// buyback desk, safety articles, live charts and state tax guide.
type Film = {
  id: keyof typeof schedule;
  composition: string;
  tint: Tint;
  scenes: Record<string, React.FC<SceneProps>>;
};

const FILMS: Film[] = [
  {id: 'traditions', composition: 'Bullion-Traditions', tint: TINTS.rose, scenes: TRADITIONS_SCENES},
  {id: 'sell-to-us', composition: 'Bullion-SellToUs', tint: TINTS.gold, scenes: SELL_SCENES},
  {id: 'real-or-fake', composition: 'Bullion-RealOrFake', tint: TINTS.city, scenes: REAL_OR_FAKE_SCENES},
  {id: 'spot-to-store', composition: 'Bullion-SpotToStore', tint: TINTS.regal, scenes: SPOT_SCENES},
  {id: 'bullion-tax', composition: 'Bullion-TaxByState', tint: TINTS.city, scenes: TAX_SCENES},
];

const Film: React.FC<{film: string}> = ({film}) => {
  const entry = FILMS.find((f) => f.id === film)!;
  return <PremiumVideo schedule={schedule[entry.id] as VideoSchedule} tint={entry.tint} scenes={entry.scenes} />;
};

export const Premium2Compositions: React.FC = () => (
  <Folder name="premium-2">
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
