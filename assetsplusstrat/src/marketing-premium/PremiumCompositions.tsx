import type React from 'react';
import {Composition, Folder} from 'remotion';
import schedule from '../../public/marketing/premium/schedule.json';
import {PremiumVideo} from './kit/PremiumVideo';
import {TINTS, type SceneProps, type Tint, type VideoSchedule} from './kit/theme';
import {FIRST_PIECE_SCENES} from './videos/FirstPiece';
import {GIFT_SCENES} from './videos/Gift';
import {ICONS_SCENES} from './videos/Icons';
import {MAKERS_BACKDROP, MAKERS_SCENES, MAKERS_TINT} from './videos/MakersEdge';
import {NEW_YORK_SCENES} from './videos/NewYork';

type Film = {
  id: keyof typeof schedule;
  composition: string;
  tint: Tint;
  scenes: Record<string, React.FC<SceneProps>>;
  backdrop?: (frame: number) => React.ReactNode;
  closingCaptions?: boolean;
  scoreVolume?: number;
};

const FILMS: Film[] = [
  {id: 'first-piece', composition: 'Bullion-YourFirstPiece', tint: TINTS.gold, scenes: FIRST_PIECE_SCENES},
  {id: 'new-york', composition: 'Bullion-NewYorkConnection', tint: TINTS.city, scenes: NEW_YORK_SCENES},
  {id: 'meaningful-gift', composition: 'Bullion-AGiftWithMeaning', tint: TINTS.rose, scenes: GIFT_SCENES},
  {id: 'icons-of-gold', composition: 'Bullion-IconsOfGold', tint: TINTS.regal, scenes: ICONS_SCENES},
  {id: 'makers-edge', composition: 'Bullion-TheMakersEdge', tint: MAKERS_TINT, scenes: MAKERS_SCENES, backdrop: MAKERS_BACKDROP, closingCaptions: true, scoreVolume: 1},
];

type FilmProps = {film: string};

const Film: React.FC<FilmProps> = ({film}) => {
  const entry = FILMS.find((f) => f.id === film)!;
  return <PremiumVideo schedule={schedule[entry.id] as VideoSchedule} tint={entry.tint} scenes={entry.scenes} backdrop={entry.backdrop} closingCaptions={entry.closingCaptions} scoreVolume={entry.scoreVolume} />;
};

export const PremiumCompositions: React.FC = () => (
  <Folder name="Bullion-Marketing">
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
