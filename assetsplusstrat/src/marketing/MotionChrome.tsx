import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile} from 'remotion';
import {C, DISPLAY, SANS, ease, pop} from './motion-kit';
import type {MotionSceneProps} from './motion-kit';

export const MotionBackdrop: React.FC<{frame:number;accent?:string}>=({frame,accent=C.gold})=><AbsoluteFill style={{background:C.bg,overflow:'hidden'}}>
 <AbsoluteFill style={{background:`radial-gradient(ellipse at ${30+Math.sin(frame/100)*15}% 40%, ${accent}14, transparent 58%),radial-gradient(ellipse at 80% 80%,#65d3e60c,transparent 55%)`}}/>
 <div style={{position:'absolute',inset:-160,backgroundImage:'linear-gradient(#8b9abb0b 1px,transparent 1px),linear-gradient(90deg,#8b9abb0b 1px,transparent 1px)',backgroundSize:'90px 90px',transform:`perspective(1500px) rotateX(7deg) translateY(${frame*.15%90}px)`}}/>
 <svg width={1080} height={1920} style={{position:'absolute',inset:0}}>
  {Array.from({length:32},(_,i)=>{
   const x=40+random(`mx${i}`)*1000+Math.sin(frame/85+i)*18;
   const y=(random(`my${i}`)*2000-frame*(.18+random(`mv${i}`)*.3)+4000)%2000;
   return <g key={i} opacity={.13+random(`mo${i}`)*.24}><circle cx={x} cy={y} r={i%4===0?3:1.4} fill={i%3?accent:C.cyan}/>{i%4===0&&<path d={`M${x-6} ${y}h12 M${x} ${y-6}v12`} stroke={accent} strokeWidth={.8}/>}</g>;
  })}
 </svg>
</AbsoluteFill>;

export const MotionBrand:React.FC<{frame:number;title:string;index:number}>=({frame,title,index})=><>
 <div style={{position:'absolute',top:153,left:75,right:100,display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:20}}>
  <Img src={staticFile('brand/logo-bullion.webp')} style={{width:280,height:80,objectFit:'contain'}}/>
  <div style={{fontFamily:SANS,fontSize:19,fontWeight:600,color:C.muted,letterSpacing:2.2,textAlign:'right',lineHeight:1.6}}>BULLION TRADING LLC<br/><span style={{color:C.gold}}>NEW YORK CITY</span></div>
 </div>
 <div style={{position:'absolute',top:264,left:76,right:102,height:1,background:'#c2cad229',zIndex:20}}/>
 <div style={{position:'absolute',top:1667,left:80,right:100,display:'flex',alignItems:'center',justifyContent:'space-between',fontFamily:SANS,fontSize:18,fontWeight:600,color:'#788797',letterSpacing:2,zIndex:20}}>
  <span>{title.toUpperCase()}</span><span style={{display:'flex',gap:9}}>{Array.from({length:5},(_,i)=><span key={i} style={{display:'block',height:4,width:i===index?38:15,background:i<=index?C.gold:'#334050',opacity:i===index?.75+.25*Math.sin(frame/10):1}}/>)}</span>
 </div>
</>;

export const MotionCTA:React.FC<MotionSceneProps & {campaignId:string}>=({frame,fps,campaignId})=>{
 const pulse=1+Math.sin(frame/9)*.025;
 const width=interpolate(frame,[8,27],[0,24],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill>
  <svg width={1080} height={1920} style={{position:'absolute',inset:0}}>
   {[320,375,430].map((r,i)=><circle key={r} cx={540} cy={820} r={r*pulse} fill="none" stroke={C.gold} strokeWidth={i===0?2:1} opacity={.11-i*.025} strokeDasharray={i===1?'8 14':undefined} style={{transformOrigin:'540px 820px',transform:`rotate(${frame*(i%2?.28:-.15)}deg)`}}/>) }
   <path d="M90 1140H990" stroke={C.gold} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1-ease(frame,12,18)}/>
  </svg>
  <div style={{position:'absolute',top:375,left:80,width:900,fontFamily:SANS,fontSize:23,color:C.gold,letterSpacing:4,opacity:ease(frame,1,12)}}>YOUR NEXT PIECE STARTS HERE</div>
  <div style={{position:'absolute',left:75,right:90,top:469,fontFamily:DISPLAY,fontWeight:700,lineHeight:.96,letterSpacing:-6,color:C.text}}>
   {['BUY FROM','BULLION','TRADING.'].map((line,i)=><div key={line} style={{fontSize:i===0?91:139,marginBottom:15,transform:`translateX(${(1-pop(frame,2+i*3,fps))*(i%2?-130:130)}px) scale(${.9+.1*pop(frame,2+i*3,fps)})`,opacity:ease(frame,2+i*3,8),color:i===1?C.gold:C.text}}>{line}</div>)}
  </div>
  <div style={{position:'absolute',left:80,top:995,width:895,display:'flex',alignItems:'center',justifyContent:'space-between',fontFamily:SANS,fontSize:29,letterSpacing:2,opacity:ease(frame,12,14),color:'#a8bac8'}}><span>GOLD</span><span style={{color:C.gold}}>+</span><span>SILVER</span><span style={{color:C.gold}}>→</span><span>YOUR NEXT PIECE</span></div>
  <div style={{position:'absolute',left:80,top:1194,width:895,height:116,border:`2px solid ${C.gold}`,borderRadius:15,display:'flex',alignItems:'center',padding:'0 30px',boxSizing:'border-box',background:'#f0c65310',boxShadow:`0 0 ${22+Math.sin(frame/6)*6}px #f0c65317`,transform:`translateY(${(1-ease(frame,9,20))*45}px)`,opacity:ease(frame,9,15)}}>
   <span style={{fontFamily:SANS,fontSize:39,fontWeight:600,color:C.text,letterSpacing:-1}}>{'bulliontradingllc.com'.slice(0,Math.floor(width))}<span style={{color:C.gold,opacity:frame%18<11?1:0}}>▏</span></span>
   <span style={{marginLeft:'auto',fontSize:56,color:C.gold,transform:`translateX(${Math.sin(frame/7)*4}px)`}}>↗</span>
  </div>
  <div style={{position:'absolute',left:85,top:1360,width:890,fontFamily:SANS,fontSize:25,color:C.muted,opacity:ease(frame,22,12)}}>{campaignId==='new-york'?'20 West 47th Street · Lower Level #24':'Explore the collection online.'}</div>
 </AbsoluteFill>;
};
