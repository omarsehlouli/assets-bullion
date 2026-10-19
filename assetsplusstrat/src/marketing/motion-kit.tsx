import type React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadSpace} from '@remotion/google-fonts/SpaceGrotesk';
import type {CampaignScene, SceneTiming} from './types';

export const {fontFamily:SANS}=loadInter('normal',{weights:['400','500','600','700','800'],subsets:['latin']});
export const {fontFamily:DISPLAY}=loadSpace('normal',{weights:['500','700'],subsets:['latin']});
export const C={bg:'#090b13',panel:'#151b28',text:'#f3f3ec',muted:'#a5aabb',gold:'#f0c653',cyan:'#76e4e2',pink:'#f6aab7',ivory:'#f5f1e5'};
export type MotionSceneProps={scene:CampaignScene;timing:SceneTiming;frame:number;fps:number};
export const ease=(frame:number,delay=0,duration=20)=>interpolate(frame,[delay,delay+duration],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)});
export const pop=(frame:number,delay=0,fps=30)=>spring({frame:frame-delay,fps,config:{damping:17,stiffness:150,mass:.75}});
const clean=(word:string)=>word.toLowerCase().replace(/[^a-z0-9]/g,'');
export const cue=(timing:SceneTiming,word:string,fps=30,occurrence=0)=>{
 const target=clean(word);
 const match=timing.words.filter(w=>clean(w.word)===target)[occurrence];
 return match?Math.max(0,Math.round((match.start-timing.start)*fps)):0;
};
export const labelStyle:React.CSSProperties={fontFamily:SANS,fontSize:25,fontWeight:700,letterSpacing:3,color:C.muted};
