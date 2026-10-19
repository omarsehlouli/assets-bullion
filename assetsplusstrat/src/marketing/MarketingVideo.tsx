import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {MarketingVideoProps, TimedWord, VideoTiming} from './types';
import {C, SANS, ease} from './motion-kit';
import {MotionBackdrop, MotionBrand, MotionCTA} from './MotionChrome';
import {DiscoveryMotion} from './DiscoveryMotion';
import {NewYorkMotion} from './NewYorkMotion';
import {GiftMotion} from './GiftMotion';


type CaptionPage = {words: TimedWord[]; start: number; end: number};

// Keep every displayed word anchored to its actual narration timestamp. Small
// phrase groups fit two lines within the social-video safe area.
const captionPages = (timing: VideoTiming): CaptionPage[] => timing.scenes.flatMap((scene) => {
  const pages: CaptionPage[] = [];
  let words: TimedWord[] = [];
  let chars = 0;
  for (const word of scene.words) {
    if (words.length && !/^[-,.;:!?]/.test(word.word) && (words.length >= 6 || chars + word.word.length > 37)) {
      pages.push({words, start: words[0].start, end: words[words.length - 1].end});
      words = [];
      chars = 0;
    }
    words.push(word);
    chars += word.word.length + 1;
    if (/[.!?]$/.test(word.word) && words.length >= 2) {
      pages.push({words, start: words[0].start, end: word.end});
      words = [];
      chars = 0;
    }
  }
  if (words.length) pages.push({words, start: words[0].start, end: words[words.length - 1].end});
  return pages.map((page, i) => ({...page, end: Math.min(pages[i + 1]?.start ?? scene.end, page.end + 0.22)}));
});

const Captions: React.FC<{timing: VideoTiming; time: number; dark: boolean}> = ({timing, time, dark}) => {
  const pages = useMemo(() => captionPages(timing), [timing]);
  const page = pages.find((p) => time >= p.start && time < p.end);
  if (!page) return null;
  const activeIndex = page.words.findIndex((word, i) => time >= word.start && time < (page.words[i + 1]?.start ?? page.end));
  return <div style={{position: 'absolute', left: 83, right: 108, top: 1510, display: 'flex', justifyContent: 'center', zIndex: 10}}>
    <div style={{maxWidth: 877, boxSizing: 'border-box', padding: '17px 27px 20px', background: dark ? 'rgba(18,18,34,.91)' : C.bg, border: dark ? '1px solid rgba(225,207,151,.26)' : '1px solid transparent', borderRadius: 14, color: C.text, fontFamily: SANS, fontSize: 43, fontWeight: 600, letterSpacing: -.7, lineHeight: 1.35, textAlign: 'center', boxShadow: '0 10px 34px rgba(15,15,25,.1)'}}>
      {page.words.map((word, i) => {
        const display = word.word.trim().replace(/^bullion$/i, 'Bullion').replace(/^trading([,.]?)$/i, 'Trading$1');
        const nextHasPunctuation = /^[-,.;:!?]/.test(page.words[i + 1]?.word ?? '');
        return <React.Fragment key={`${word.start}-${i}`}><span style={{color: i === activeIndex ? '#f4d577' : C.text}}>{display}</span>{i < page.words.length - 1 && !nextHasPunctuation ? ' ' : ''}</React.Fragment>;
      })}
    </div>
  </div>;
};

export const MarketingVideo: React.FC<MarketingVideoProps> = ({campaign, timing}) => {
  const frame=useCurrentFrame();
  const {fps,durationInFrames}=useVideoConfig();
  const time=frame/fps;
  const index=timing.scenes.reduce((found,s,i)=>time>=s.start?i:found,0);
  const Renderer=campaign.id==='first-piece'?DiscoveryMotion:campaign.id==='new-york'?NewYorkMotion:GiftMotion;
  return <AbsoluteFill style={{background:C.bg,overflow:'hidden'}}>
    <Audio src={staticFile(timing.audio)}/>
    {campaign.scenes.map((scene,i)=>{
      const timed=timing.scenes.find(t=>t.id===scene.id)!;
      const start=i===0?0:Math.round(timed.start*fps);
      const end=timing.scenes[i+1]?Math.round(timing.scenes[i+1].start*fps):durationInFrames;
      if(frame<start||frame>=end+10)return null;
      const local=frame-start;
      const reveal=i===0?1:ease(local,0,9);
      const exit=frame>=end?ease(frame-end,0,10):0;
      const props={scene,timing:timed,frame:frame-Math.round(timed.start*fps),fps};
      return <AbsoluteFill key={scene.id} style={{clipPath:`inset(0 ${(1-reveal)*100}% 0 0)`,transform:`translateX(${-exit*30}px) scale(${1-exit*.015})`,transformOrigin:'50% 50%'}}>
        <MotionBackdrop frame={frame} accent={campaign.id==='meaningful-gift'?C.pink:C.gold}/>
        {scene.id==='cta'?<MotionCTA {...props} campaignId={campaign.id}/>:<Renderer {...props}/>}
        {i>0&&local<11&&<div style={{position:'absolute',top:280,bottom:440,left:`${reveal*100}%`,width:3,background:C.gold,boxShadow:`0 0 28px ${C.gold}`,opacity:1-local/11}}/>}
      </AbsoluteFill>;
    })}
    <MotionBrand frame={frame} title={campaign.title} index={index}/>
    <Captions timing={timing} time={time} dark/>
  </AbsoluteFill>;
};
