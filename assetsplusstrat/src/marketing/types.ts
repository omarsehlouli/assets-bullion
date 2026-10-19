export type CampaignScene = {
  id: string;
  text: string;
  headline: string;
  eyebrow: string;
  visual: string;
};

export type CampaignVideo = {
  id: string;
  composition: string;
  title: string;
  audience: string;
  scenes: CampaignScene[];
};

export type TimedWord = {
  word: string;
  start: number;
  end: number;
  probability?: number;
};

export type SceneTiming = {
  id: string;
  text: string;
  start: number;
  end: number;
  words: TimedWord[];
};

export type VideoTiming = {
  id: string;
  duration: number;
  audio: string;
  scenes: SceneTiming[];
};

export type MarketingVideoProps = {
  campaign: CampaignVideo;
  timing: VideoTiming;
};
