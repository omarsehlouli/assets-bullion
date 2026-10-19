import {Audio} from '@remotion/media';
import {AbsoluteFill, Composition, Folder, staticFile} from 'remotion';
import campaign from '../../public/marketing/campaign.json';
import timings from '../../public/marketing/timing.json';
import {MarketingVideo} from './MarketingVideo';
import type {CampaignVideo, MarketingVideoProps, VideoTiming} from './types';

const ScoredMarketingVideo: React.FC<MarketingVideoProps> = (props) => (
  <AbsoluteFill>
    <MarketingVideo {...props} />
    <Audio src={staticFile(`marketing/audio/${props.campaign.id}-soundscape.wav`)} volume={1} />
  </AbsoluteFill>
);

// The premium edit lives in src/marketing-premium; these are the previous cuts.
const LEGACY_IDS = ['first-piece', 'new-york', 'meaningful-gift'];

export const MarketingCompositions = () => (
  <Folder name="Bullion-Marketing-v2">
    {campaign.videos.filter((video) => LEGACY_IDS.includes(video.id)).map((video) => {
      const timing = timings[video.id as keyof typeof timings] as VideoTiming;
      return (
        <Composition
          key={video.id}
          id={`${video.composition}-v2`}
          component={ScoredMarketingVideo}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={Math.ceil(timing.duration * 30)}
          defaultProps={{campaign: video as CampaignVideo, timing}}
        />
      );
    })}
  </Folder>
);
