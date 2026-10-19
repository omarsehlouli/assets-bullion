import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS, cue, ease, pop, type MotionSceneProps} from './motion-kit';

const ROSE = '#efb6a7';
const SILVER = '#d5e4ec';
const art = (name: string) => staticFile(`marketing/images/${name}`);

const TextLine: React.FC<{children: React.ReactNode; frame: number; delay?: number; size?: number; color?: string}> = ({children, frame, delay = 0, size = 112, color = C.text}) => {
  const p = ease(frame + 6, delay, 22);
  return <div style={{overflow: 'hidden', paddingBottom: 8}}><div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: -3.5, lineHeight: 1.02, color, opacity: p, transform: `translateY(${(1 - p) * 108}%) rotate(${(1 - p) * 3}deg)`, transformOrigin: 'left center'}}>{children}</div></div>;
};

const Spark: React.FC<{x: number; y: number; size?: number; frame: number; delay?: number; color?: string}> = ({x, y, size = 25, frame, delay = 0, color = C.gold}) => {
  const p = Math.max(0, Math.min(1, pop(frame, delay)));
  return <svg width={size} height={size} viewBox="0 0 40 40" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, opacity: p, transform: `scale(${p * (0.8 + 0.2 * Math.sin(frame / 12))}) rotate(${frame * 0.35}deg)`}}><path d="M20 0 24 15 40 20 24 25 20 40 16 25 0 20 16 15Z" fill={color}/></svg>;
};

// Website photographs remain intact on a light product stage. All celebratory
// framing, lines and particles are separate vector graphics.
const ProductStage: React.FC<{name: string; size: number; frame: number; round?: boolean; imageScale?: number; style?: React.CSSProperties}> = ({name, size, frame, round, imageScale = 1, style}) => <div style={{width: size, height: size, position: 'relative', background: '#fff', borderRadius: round ? '50%' : 24, overflow: 'hidden', boxShadow: '0 24px 75px rgba(0,0,0,.26)', ...style}}>
  <Img src={art(name)} style={{width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${imageScale}) translateY(${Math.sin(frame / 24) * 2}px)`}} />
</div>;

const GiftHook: React.FC<MotionSceneProps> = ({frame, timing, fps}) => {
  const openAt = Math.max(20, cue(timing, 'more', fps));
  const opening = ease(frame, openAt, 24);
  const draw = ease(frame, 2, 25);
  const show = ease(frame, openAt + 5, 20);
  return <AbsoluteFill>
    <div style={{position: 'absolute', left: 82, top: 322, width: 916}}>
      <TextLine frame={frame} size={118}>For moments</TextLine>
      <TextLine frame={frame} delay={8} size={126} color={ROSE}>that matter.</TextLine>
      <div style={{marginTop: 28, width: 580, height: 4, background: `linear-gradient(90deg,${ROSE},${C.gold},transparent)`, transform: `scaleX(${ease(frame, 19, 28)})`, transformOrigin: 'left'}} />
    </div>
    <div style={{position: 'absolute', left: 172, top: 692, width: 720, height: 700, transform: `translateY(${(1-ease(frame,0,22))*70}px) scale(${1 + opening * .035})`}}>
      <svg width={720} height={700} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <ellipse cx={360} cy={550} rx={300 + opening * 30} ry={54} fill="none" stroke={C.gold} strokeOpacity={.16} strokeWidth={2} />
        <circle cx={360} cy={290} r={260 + frame * .21} fill="none" stroke={ROSE} strokeOpacity={.16 * show} strokeWidth={2} strokeDasharray="4 17" transform={`rotate(${frame * .32} 360 290)`} />
        <path d="M135 355 360 415 585 355 585 555 360 620 135 555Z M360 415V620" fill="#171925" fillOpacity={draw * .88} stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1-draw} strokeLinejoin="round" />
        <path d="M319 404V608L361 620 402 608V404" fill={C.gold} fillOpacity={draw * .13} stroke={C.gold} strokeOpacity={draw * .7} strokeWidth={2} />
      </svg>
      <div style={{position: 'absolute', left: 168, top: 220-opening*235, opacity: show, transform: `rotate(${-8 + opening * 5}deg) scale(${.72 + opening*.28})`}}>
        <ProductStage name="gold-rosa.webp" size={384} frame={frame} />
      </div>
      <svg width={720} height={700} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g transform={`translate(${opening*160} ${-opening*270}) rotate(${opening*25} 360 350)`} opacity={1-opening}>
          <path d="M116 337 360 270 604 337 604 383 360 450 116 383Z M116 337 360 404 604 337 M360 404V450" fill="#1c1c2d" fillOpacity={draw} stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1-draw} strokeLinejoin="round" />
          <path d="M325 281 569 348 569 393 M150 348 396 280 M326 394 326 440 M396 394 396 440" fill="none" stroke={ROSE} strokeWidth={3} opacity={draw} />
          <path d="M360 308C276 303 254 222 302 230 341 236 355 271 360 308ZM360 308C445 303 466 222 418 230 379 236 365 271 360 308Z" fill="none" stroke={ROSE} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1-ease(frame, 14, 20)} />
        </g>
      </svg>
      {Array.from({length: 16}, (_, i) => {
        const angle = i * 2.39996;
        const travel = ease(frame, openAt + 4 + i % 5, 27);
        const radius = 135 + travel * (135+i%4*22);
        return <Spark key={i} x={360+Math.cos(angle)*radius} y={300+Math.sin(angle)*radius*.82} size={i%3 === 0 ? 24 : 10} frame={frame} delay={openAt + 7 + i%7} color={i%2 ? ROSE : C.gold}/>;
      })}
    </div>
    <div style={{position: 'absolute', top: 1400, left: 90, fontFamily: SANS, fontSize: 28, color: ROSE, opacity: ease(frame, 54, 16), letterSpacing: 1}}>A gift with meaning.</div>
  </AbsoluteFill>;
};

const Milestones: React.FC<MotionSceneProps> = ({frame, timing, fps}) => {
  const silverAt = cue(timing, 'silver', fps);
  const goldAt = cue(timing, 'golden', fps);
  const traditionAt = cue(timing, 'tradition', fps);
  const points = [{x:275,y:870,at:silverAt,color:SILVER},{x:795,y:870,at:goldAt,color:C.gold},{x:535,y:1255,at:traditionAt,color:ROSE}];
  return <AbsoluteFill>
    <div style={{position:'absolute',left:82,top:320,width:900}}>
      <TextLine frame={frame} size={108}>Every milestone.</TextLine>
      <TextLine frame={frame} delay={7} size={112} color={ROSE}>Your story.</TextLine>
    </div>
    <svg width={1080} height={1500} style={{position:'absolute',inset:0,overflow:'visible'}}>
      <defs><linearGradient id="gift-orbit" x1="0" y1="0" x2="1" y2="1"><stop stopColor={SILVER}/><stop offset=".5" stopColor={C.gold}/><stop offset="1" stopColor={ROSE}/></linearGradient></defs>
      <ellipse cx={535} cy={1005} rx={360} ry={272} fill="none" stroke="url(#gift-orbit)" strokeOpacity={.25} strokeWidth={2} strokeDasharray="3 13" transform={`rotate(${-14+frame*.18} 535 1005)`}/>
      <path d="M275 870Q535 645 795 870Q881 1160 535 1255Q190 1160 275 870" fill="none" stroke={C.muted} strokeOpacity={.22} strokeWidth={2}/>
      <path d="M275 870Q535 645 795 870" fill="none" stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1-ease(frame,goldAt,28)}/>
      <path d="M795 870Q881 1160 535 1255Q190 1160 275 870" fill="none" stroke={ROSE} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1-ease(frame,traditionAt,26)}/>
      {points.map((point,i)=>{
        const p=ease(frame,point.at,18);
        const pulse=(Math.max(0,frame-point.at)%48)/48;
        return <g key={i} opacity={p}><circle cx={point.x} cy={point.y} r={i===2?76:160} stroke={point.color} strokeWidth={2} strokeOpacity={.5} fill="none"/><circle cx={point.x} cy={point.y} r={(i===2?76:160)+pulse*24} stroke={point.color} strokeWidth={2} strokeOpacity={(1-pulse)*.3} fill="none"/></g>;
      })}
      <g opacity={ease(frame,18,24)} transform={`translate(535 1085) rotate(${frame*.15})`}>
        <path d="M0 -38 10 -10 38 0 10 10 0 38 -10 10 -38 0 -10 -10Z" fill={C.gold} fillOpacity={.32}/>
      </g>
    </svg>
    {[{x:275,name:'silver-pamp.webp',at:silverAt,label:'Silver anniversary',color:SILVER},{x:795,name:'gold-pamp.webp',at:goldAt,label:'Golden milestone',color:C.gold}].map((item,i)=>{
      const p=ease(frame,item.at,20);
      return <div key={item.name} style={{position:'absolute',left:item.x-146,top:724,opacity:p,transform:`translateY(${(1-p)*60+Math.sin(frame/21+i)*5}px) scale(${.82+p*.18}) rotate(${(1-p)*(i?8:-8)}deg)`}}>
        <ProductStage name={item.name} size={292} round frame={frame}/>
        <div style={{position:'absolute',top:318,left:-86,width:464,textAlign:'center',fontFamily:SANS,fontWeight:600,fontSize:32,letterSpacing:-.7,color:item.color}}>{item.label}</div>
      </div>;
    })}
    <div style={{position:'absolute',left:459,top:1179,width:152,height:152,borderRadius:'50%',background:'#201b2b',border:`2px solid ${ROSE}`,display:'flex',alignItems:'center',justifyContent:'center',opacity:ease(frame,traditionAt,16),transform:`scale(${.8+pop(frame,traditionAt,fps)*.2})`}}>
      <svg width={95} height={95} viewBox="0 0 100 100"><path d="M21 54C0 29 38 15 50 40 62 15 100 29 79 54L50 81Z" fill="none" stroke={ROSE} strokeWidth={3}/><path d="M16 18 22 7 28 18 39 24 28 30 22 41 16 30 5 24Z" fill={C.gold}/></svg>
    </div>
    <div style={{position:'absolute',left:295,top:1360,width:480,textAlign:'center',fontFamily:SANS,fontSize:34,fontWeight:600,color:ROSE,opacity:ease(frame,traditionAt+5,18),transform:`translateY(${(1-ease(frame,traditionAt+5,18))*20}px)`}}>A tradition of your own</div>
  </AbsoluteFill>;
};

const Selection: React.FC<MotionSceneProps> = ({frame,timing,fps}) => {
  const barAt=cue(timing,'bars',fps);
  const coinAt=cue(timing,'coins',fps);
  const roundAt=cue(timing,'rounds',fps);
  // On each spoken product type, its photograph physically takes centre stage.
  const position=ease(frame,coinAt-5,15)+ease(frame,roundAt-5,13);
  const spread=1-ease(frame,cue(timing,'pieces',fps),22);
  const detail=ease(frame,cue(timing,'beautifully',fps),28)*(1-ease(frame,coinAt-7,12));
  const active=frame>=roundAt?2:frame>=coinAt?1:0;
  const products=[{name:'gold-rosa.webp',title:'Gold bars',short:'Bars',color:C.gold},{name:'silver-eagle.jpg',title:'Silver coins',short:'Coins',color:SILVER},{name:'silver-round.webp',title:'Silver rounds',short:'Rounds',color:ROSE}];
  return <AbsoluteFill>
    <div style={{position:'absolute',left:82,top:320,width:916}}>
      <TextLine frame={frame} size={114}>Find their</TextLine>
      <TextLine frame={frame} delay={7} size={120} color={ROSE}>kind of shine.</TextLine>
    </div>
    <div style={{position:'absolute',left:84,top:602,display:'flex',gap:18,fontFamily:SANS,fontSize:25,fontWeight:600}}>
      {[{name:'Gold',at:cue(timing,'gold',fps),color:C.gold},{name:'Silver',at:cue(timing,'silver',fps),color:SILVER}].map((item)=><div key={item.name} style={{padding:'10px 20px',borderRadius:50,border:`1px solid ${item.color}70`,color:item.color,background:`${item.color}0b`,opacity:ease(frame,item.at,15),transform:`translateY(${(1-ease(frame,item.at,15))*20}px)`}}><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:item.color,marginRight:12}}/>{item.name}</div>)}
    </div>
    <svg width={1080} height={1500} style={{position:'absolute',inset:0,overflow:'visible'}}>
      <ellipse cx={540} cy={1130} rx={451} ry={160} fill="none" stroke={C.gold} strokeWidth={2} strokeOpacity={.18} strokeDasharray="3 12" transform={`rotate(${-12+frame*.05} 540 1130)`}/>
      <path d="M105 1258H970" stroke={C.gold} strokeOpacity={.25} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1-ease(frame,15,40)}/>
    </svg>
    <div style={{position:'absolute',left:74,top:714,width:932,height:580,overflow:'hidden'}}>
      {products.map((item,i)=>{
        const dist=i-position;
        const focus=1-Math.min(1,Math.abs(dist));
        const x=466 + dist*(535-spread*235) - spread*240;
        const scale=.57+focus*.35+detail*.10*focus;
        const p=ease(frame,i*5+6,25);
        return <div key={item.name} style={{position:'absolute',left:x-282,top:10+(1-focus)*88,opacity:p*(.4+focus*.6),zIndex:Math.round(focus*10),transform:`translateY(${(1-p)*100 + Math.sin(frame/22+i)*5}px) scale(${scale}) rotate(${dist*-7+Math.sin(frame/37)*1.5}deg)`,transformOrigin:'center center'}}>
          <ProductStage name={item.name} size={564} frame={frame} imageScale={1+detail*.15*focus}/>
          <div style={{position:'absolute',inset:-4,borderRadius:28,border:`2px solid ${item.color}`,opacity:focus*.65}}/>
          <div style={{position:'absolute',left:30,right:30,bottom:20,height:2,background:`linear-gradient(90deg,transparent,${item.color},transparent)`,opacity:focus*.7}}/>
        </div>;
      })}
    </div>
    <div style={{position:'absolute',left:86,right:105,top:1320,display:'flex',justifyContent:'space-between',gap:18}}>
      {products.map((item,i)=>{
        const at=i===0?barAt:i===1?coinAt:roundAt;
        const selected=active===i;
        const p=pop(frame,at,fps);
        return <div key={item.short} style={{position:'relative',flex:1,padding:'16px 18px 18px',borderRadius:15,border:`1px solid ${selected?item.color+'a0':'#ffffff20'}`,background:selected?item.color+'16':'#ffffff04',fontFamily:SANS,fontSize:36,fontWeight:600,color:selected?item.color:C.muted,textAlign:'center',transform:`scale(${selected?1+(p>1?(p-1)*.2:0):1})`}}>{item.short}<div style={{position:'absolute',left:20,right:20,bottom:-1,height:3,background:item.color,transform:`scaleX(${selected?1:0})`}}/></div>;
      })}
    </div>
    <div style={{position:'absolute',left:418,top:611,padding:'10px 17px',background:'#141623',border:`1px solid ${C.gold}60`,borderRadius:12,fontFamily:SANS,fontSize:25,color:C.gold,opacity:detail,transform:`translateX(${(1-detail)*30}px)`}}>Beautiful in every detail <span style={{marginLeft:12}}>↗</span></div>
  </AbsoluteFill>;
};

const Keepsake: React.FC<MotionSceneProps> = ({frame,timing,fps}) => {
  const holdAt=cue(timing,'hold',fps);
  const admireAt=cue(timing,'admire',fps);
  const rememberAt=cue(timing,'remember',fps);
  const makeAt=cue(timing,'Make',fps);
  const shineAt=cue(timing,'shine',fps);
  const final=ease(frame,makeAt,14);
  const scan=ease(frame,admireAt,22);
  const nodes=[{x:226,y:820,name:'Hold',at:holdAt,color:SILVER},{x:844,y:820,name:'Admire',at:admireAt,color:C.gold},{x:535,y:1272,name:'Remember',at:rememberAt,color:ROSE}];
  return <AbsoluteFill>
    <div style={{position:'absolute',left:82,top:320,width:916,opacity:1-ease(frame,makeAt-6,6),transform:`translateY(${-ease(frame,makeAt-6,6)*25}px)`}}>
      <TextLine frame={frame} size={114}>Something</TextLine>
      <TextLine frame={frame} delay={7} size={114} color={ROSE}>to remember.</TextLine>
    </div>
    <div style={{position:'absolute',left:82,top:320,width:916,opacity:final}}>
      <TextLine frame={frame} delay={makeAt} size={116}>Make the</TextLine>
      <TextLine frame={frame} delay={makeAt+4} size={115} color={C.gold}>moment shine.</TextLine>
    </div>
    <div style={{position:'absolute',inset:0,transform:`translateY(${-final*20}px)`}}>
      <svg width={1080} height={1500} style={{position:'absolute',inset:0,overflow:'visible'}}>
        <defs><marker id="memory-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill={C.gold}/></marker></defs>
        <circle cx={535} cy={997} r={260} fill="none" stroke={C.gold} strokeOpacity={.15} strokeWidth={2}/>
        <circle cx={535} cy={997} r={290} fill="none" stroke={ROSE} strokeOpacity={.22} strokeWidth={2} strokeDasharray="4 17" transform={`rotate(${frame*.36} 535 997)`}/>
        <path d="M278 795Q535 610 792 795" fill="none" stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1-ease(frame,admireAt,20)} markerEnd={frame>admireAt+20?'url(#memory-arrow)':undefined}/>
        <path d="M858 878Q905 1177 617 1261" fill="none" stroke={ROSE} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1-ease(frame,rememberAt,22)} markerEnd={frame>rememberAt+22?'url(#memory-arrow)':undefined}/>
        <path d="M458 1260Q163 1152 210 878" fill="none" stroke={SILVER} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1-ease(frame,rememberAt+12,22)} markerEnd={frame>rememberAt+34?'url(#memory-arrow)':undefined}/>
        <circle cx={535} cy={997} r={220+ease(frame,shineAt,26)*150} fill="none" stroke={C.gold} strokeWidth={4} opacity={(1-ease(frame,shineAt,28))*.6*ease(frame,shineAt,4)}/>
      </svg>
      <div style={{position:'absolute',left:335,top:797,opacity:ease(frame,8,22),transform:`translateY(${(1-ease(frame,8,22))*60}px) rotate(${-4+Math.sin(frame/24)*2}deg) scale(${.93+scan*.1})`}}>
        <ProductStage name="silver-round.webp" size={400} frame={frame} round imageScale={1.05+scan*.21}/>
        <div style={{position:'absolute',inset:-9,borderRadius:'50%',border:`2px solid ${C.gold}50`}}/>
      </div>
      <svg width={1080} height={1500} style={{position:'absolute',inset:0,pointerEvents:'none'}}>
        <g opacity={ease(frame,admireAt,10)*(1-ease(frame,rememberAt+10,15))}>
          <path d={`M${382+scan*280} 840v315`} stroke={C.gold} strokeWidth={3} strokeOpacity={.8}/>
          <circle cx={382+scan*280} cy={1000} r={15} fill="none" stroke={C.gold} strokeWidth={2}/>
        </g>
      </svg>
      {nodes.map((node,i)=>{
        const p=ease(frame,node.at,16);
        const active=frame>=node.at&&(i===2||frame<nodes[i+1].at);
        return <div key={node.name} style={{position:'absolute',left:node.x-(i===2?158:117),top:node.y-45,width:i===2?316:234,height:90,borderRadius:45,boxSizing:'border-box',background:active?node.color:'#151824',border:`2px solid ${node.color}`,color:active?C.bg:node.color,display:'flex',alignItems:'center',justifyContent:'center',gap:12,fontFamily:SANS,fontSize:37,fontWeight:600,opacity:p,transform:`translateY(${(1-p)*30}px) scale(${.85+p*.15})`,boxShadow:active?`0 0 36px ${node.color}20`:undefined}}><span style={{fontSize:25}}>{i===0?'◇':i===1?'✧':'↺'}</span>{node.name}</div>;
      })}
      <div style={{position:'absolute',left:330,top:1390,width:410,textAlign:'center',fontFamily:SANS,fontSize:26,color:ROSE,opacity:ease(frame,rememberAt+9,18),letterSpacing:1}}>A moment to come back to.</div>
      {Array.from({length:12},(_,i)=>{
        const angle=i*Math.PI/6+frame*.003;
        const radius=250+ease(frame,shineAt,22)*80;
        return <Spark key={i} x={535+Math.cos(angle)*radius} y={997+Math.sin(angle)*radius} size={i%3?14:26} frame={frame} delay={shineAt+i%4} color={i%2?ROSE:C.gold}/>;
      })}
    </div>
  </AbsoluteFill>;
};

export const GiftMotion: React.FC<MotionSceneProps> = (props) => {
  switch(props.scene.id){
    case 'hook': return <GiftHook {...props}/>;
    case 'milestones': return <Milestones {...props}/>;
    case 'selection': return <Selection {...props}/>;
    case 'keepsake': return <Keepsake {...props}/>;
    default: return null;
  }
};
