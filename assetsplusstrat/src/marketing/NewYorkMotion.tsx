import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS, cue, ease, pop, type MotionSceneProps} from './motion-kit';

const art = (name: string) => staticFile(`marketing/images/${name}`);
const clamp = (value: number) => Math.max(0, Math.min(1, value));

const KineticTitle: React.FC<{children: React.ReactNode; frame: number; delay?: number; size?: number; color?: string; y?: number}> = ({children, frame, delay = 0, size = 116, color = C.text, y = 310}) => (
  <div style={{position: 'absolute', left: 88, top: y, width: 904, overflow: 'hidden'}}>
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.02, letterSpacing: -5, color, transform: `translateY(${(1 - ease(frame + 6, delay, 22)) * 115}%)`}}>{children}</div>
  </div>
);

const Pin: React.FC<{x: number; y: number; frame: number; delay: number; fps: number; color?: string}> = ({x, y, frame, delay, fps, color = C.gold}) => {
  const p = pop(frame, delay, fps);
  const cycle = ((Math.max(0, frame - delay) % 40) / 40);
  return <g transform={`translate(${x} ${y}) scale(${Math.max(0, p)})`}>
    <circle r={28 + cycle * 70} stroke={color} strokeWidth={2} fill="none" opacity={(1 - cycle) * 0.55} />
    <circle r={48} stroke={color} strokeWidth={1.5} fill={C.bg} opacity={0.7} />
    <path d="M0 4C-9-12-29-25-29-44a29 29 0 1 1 58 0C29-25 9-12 0 4Z" fill={color} />
    <circle cy={-44} r={9} fill={C.bg}/>
  </g>;
};

const StoreIcon: React.FC<{color?: string; size?: number}> = ({color = C.cyan, size = 160}) => <svg width={size} height={size} viewBox="0 0 180 180" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
  <path d="M26 76H154L141 38H39L26 76Z" />
  <path d="M26 76V91Q42 108 58 91Q74 108 90 91Q106 108 122 91Q138 108 154 91V76M36 105V153H144V105M75 153V116H109V153M58 76L64 38M90 76V38M122 76L116 38"/>
  <path d="M25 155H155" />
</svg>;

const TeamIcon: React.FC<{size?: number}> = ({size = 172}) => <svg width={size} height={size} viewBox="0 0 180 180" fill="none" stroke={C.pink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
  <circle cx={88} cy={61} r={23} /><path d="M45 146V128a43 43 0 0 1 86 0v18M134 53a19 19 0 0 1 0 38M144 107a31 31 0 0 1 18 29M43 53a19 19 0 0 0 0 38M33 107a31 31 0 0 0-18 29"/>
  <path d="M119 20H161V45H144L133 54V45H119Z" stroke={C.gold} strokeWidth={3}/>
</svg>;

const NewYorkHook: React.FC<MotionSceneProps> = ({frame, fps, timing}) => {
  const district = cue(timing, 'Diamond', fps);
  const metal = cue(timing, 'precious', fps);
  const hands = cue(timing, 'hands', fps);
  const zoom = ease(frame, district, 34);
  const route = ease(frame, district - 10, 40);
  const reveal = ease(frame, metal, 24);
  return <AbsoluteFill>
    <KineticTitle frame={frame}>NEW YORK.</KineticTitle>
    <div style={{position: 'absolute', left: 95, top: 445, fontFamily: SANS, color: C.cyan, fontWeight: 700, fontSize: 30, letterSpacing: 5, opacity: ease(frame, district - 8)}}>THE DIAMOND DISTRICT</div>
    <div style={{position: 'absolute', left: 92, top: 555, width: 896, height: 705, border: '1px solid #34434d', borderRadius: 30, background: 'linear-gradient(150deg,#151f2b,#0b111c)', overflow: 'hidden', transform: `translateY(${(1 - ease(frame)) * 70}px)`, opacity: ease(frame)}}>
      <svg width={896} height={705} viewBox="0 0 896 705">
        <defs><linearGradient id="ny-block" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#344557"/><stop offset="1" stopColor="#172333"/></linearGradient></defs>
        <g transform={`translate(448 360) scale(${0.84 + zoom * 0.28}) rotate(${-13 + zoom * 7}) translate(-448 -360)`}>
          {Array.from({length: 5}, (_, row) => Array.from({length: 5}, (_, col) => {
            const p = ease(frame, row * 3 + col * 2, 24);
            return <g key={`${row}-${col}`} opacity={p * 0.8} transform={`translate(0 ${(1 - p) * 35})`}>
              <rect x={col * 215 - 110} y={row * 159 - 120} width={166} height={112} rx={9} fill="url(#ny-block)" stroke="#516175" strokeWidth={1.4} />
              <path d={`M${col * 215 - 92} ${row * 159 - 98}h115M${col * 215 - 92} ${row * 159 - 81}h77`} stroke="#8095aa" strokeWidth={1} opacity={0.3}/>
            </g>;
          }))}
          <path d="M-90 330H1050" stroke={C.gold} strokeWidth={3} opacity={0.25}/>
          <path d="M105 750V330H580" stroke={C.cyan} strokeWidth={6} strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - route}/>
          <path d="M-100 330H950" stroke={C.gold} strokeWidth={5} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(frame, district, 30)} />
          <text x={215} y={303} fontFamily={SANS} fontSize={25} fontWeight={700} letterSpacing={2} fill={C.gold}>WEST 47TH STREET</text>
          <text x={225} y={147} fontFamily={SANS} fontSize={19} letterSpacing={3} fill={C.muted}>MIDTOWN MANHATTAN</text>
          <Pin x={581} y={330} frame={frame} delay={district + 8} fps={fps}/>
          <g opacity={ease(frame, district + 15)}>
            <rect x={518} y={394} width={255} height={69} rx={10} fill={C.bg} stroke={C.gold}/>
            <text x={645} y={438} textAnchor="middle" fontFamily={SANS} fontSize={25} fontWeight={700} fill={C.text}>BULLION TRADING</text>
          </g>
        </g>
        <g opacity={0.7} stroke={C.cyan} fill="none"><path d="M40 64V35H69M827 35H856V64M40 641V670H69M827 670H856V641" strokeWidth={2}/></g>
        <text x={49} y={648} fill={C.muted} fontFamily={SANS} fontSize={17} letterSpacing={3}>LOCATION / SCHEMATIC</text>
      </svg>
    </div>
    <div style={{position: 'absolute', left: 120, top: 1040, width: 840, height: 310, opacity: reveal, transform: `translateY(${(1 - reveal) * 180}px) rotate(${-2 + reveal * 2}deg)`, display: 'flex', alignItems: 'center', padding: '20px 36px', gap: 30, borderRadius: 28, background: C.ivory, boxShadow: '0 20px 55px #0009'}}>
      <Img src={art('gold-pamp.webp')} style={{width: 180, height: 260, objectFit: 'contain', mixBlendMode: 'multiply', transform: `rotate(${-10 + Math.sin(frame / 30) * 3}deg)`}}/>
      <Img src={art('silver-round.webp')} style={{width: 176, height: 176, objectFit: 'contain', mixBlendMode: 'multiply', marginLeft: -45, transform: `translateY(${Math.sin(frame / 21) * 6}px)`}}/>
      <div style={{fontFamily: DISPLAY, color: C.bg, fontWeight: 700, fontSize: 52, letterSpacing: -2, lineHeight: 1.02, transform: `scale(${0.98 + pop(frame, hands, fps) * 0.02})`}}>REAL METAL.<br/><span style={{fontSize: 30, fontFamily: SANS, fontWeight: 500, letterSpacing: -0.5}}>Hands-on experience.</span></div>
    </div>
  </AbsoluteFill>;
};

const YearFlap: React.FC<{digit: string; frame: number; delay: number; index: number}> = ({digit, frame, delay, index}) => {
  const p = ease(frame, delay + index * 2, 13);
  const half = (top: boolean, style?: React.CSSProperties) => <div style={{position: 'absolute', left: 0, right: 0, top: top ? 0 : '50%', height: '50%', overflow: 'hidden', background: top ? '#202938' : '#131c2b', ...style}}><div style={{position: 'absolute', left: 0, right: 0, height: 218, top: top ? 0 : -109, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 168, lineHeight: 1, fontWeight: 700, color: C.gold, opacity: 0.38 + p * 0.62}}>{digit}</div></div>;
  return <div style={{position: 'relative', width: 196, height: 218, border: '1px solid #51616c', borderRadius: 18, overflow: 'hidden', boxShadow: `0 12px 35px #0007,0 0 ${p * 24}px #f0c65312`, transform: `perspective(700px) rotateX(${(1 - p) * -12}deg)`}}>
    {half(true)}{half(false)}
    {p > 0 && p < 0.5 ? half(true, {transformOrigin: 'bottom', transform: `rotateX(${p * -180}deg)`, background: '#334050'}) : null}
    {p >= 0.5 && p < 1 ? half(false, {transformOrigin: 'top', transform: `rotateX(${(1 - p) * 180}deg)`}) : null}
    <div style={{position: 'absolute', top: 108, left: 0, right: 0, height: 3, background: '#060913'}}/>
  </div>;
};

const Heritage: React.FC<MotionSceneProps> = ({frame, fps, timing}) => {
  const buyers = cue(timing, 'buyers', fps);
  const sellers = cue(timing, 'sellers', fps);
  const year = cue(timing, '2008', fps);
  return <AbsoluteFill>
    <KineticTitle frame={frame} size={104}>NEW YORK ROOTS.</KineticTitle>
    <div style={{position: 'absolute', left: 95, top: 490, color: C.gold, fontFamily: SANS, fontSize: 28, letterSpacing: 5, fontWeight: 700, opacity: ease(frame)}}>ESTABLISHED</div>
    <div style={{position: 'absolute', top: 552, left: 95, display: 'flex', gap: 18}}>{'2008'.split('').map((digit, index) => <YearFlap key={index} digit={digit} index={index} frame={frame} delay={year - 3}/>)}</div>
    <svg width={1080} height={1480} style={{position: 'absolute', inset: 0}}>
      <defs><marker id="ny-loop-arrow" viewBox="0 0 12 12" refX={9} refY={6} markerWidth={6} markerHeight={6} orient="auto-start-reverse"><path d="M1 1L11 6L1 11" fill="none" stroke={C.gold} strokeWidth={2}/></marker></defs>
      <path d="M293 1035C326 871 749 868 789 1035" fill="none" stroke={C.gold} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(frame, buyers, 20)} markerEnd={frame > buyers + 15 ? 'url(#ny-loop-arrow)' : undefined}/>
      <path d="M783 1115C738 1242 349 1245 301 1115" fill="none" stroke={C.gold} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(frame, sellers, 20)} markerEnd={frame > sellers + 15 ? 'url(#ny-loop-arrow)' : undefined}/>
      <circle cx={540} cy={1065} r={67} fill={C.panel} stroke="#526578" strokeWidth={1.5}/>
      <path d="M520 1087L527 1043H552L562 1087Z M526 1060H555" fill="none" stroke={C.gold} strokeWidth={3}/>
      <circle cx={540} cy={1065} r={83 + ((frame % 40) / 40) * 15} fill="none" stroke={C.gold} opacity={(1 - (frame % 40) / 40) * 0.35}/>
      <path d="M118 1350H953" stroke="#44515d" strokeWidth={3}/>
      <path d="M118 1350H953" stroke={C.cyan} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(frame, 10, 85)}/>
      <circle cx={118} cy={1350} r={8} fill={C.gold}/><circle cx={953} cy={1350} r={8} fill={C.cyan} opacity={ease(frame, year)}/>
    </svg>
    {[{label: 'BUYERS', x: 108, color: C.cyan, at: buyers}, {label: 'SELLERS', x: 674, color: C.pink, at: sellers}].map(({label, x, color, at}) => <div key={label} style={{position: 'absolute', left: x, top: 1010, width: 294, height: 118, borderRadius: 18, background: C.panel, border: `1px solid ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 700, color, fontSize: 46, letterSpacing: -1, opacity: ease(frame, at - 3, 8), transform: `scale(${0.72 + pop(frame, at - 3, fps) * 0.28})`}}>{label}</div>)}
    <div style={{position: 'absolute', left: 104, top: 1294, right: 105, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 23, fontWeight: 700, letterSpacing: 3, color: C.muted, opacity: ease(frame, 12)}}><span>EST. 2008</span><span style={{color: C.cyan, opacity: ease(frame, year)}}>TODAY</span></div>
  </AbsoluteFill>;
};

const Visit: React.FC<MotionSceneProps> = ({frame, fps, timing}) => {
  const gold = cue(timing, 'gold', fps);
  const silver = cue(timing, 'silver', fps);
  const online = cue(timing, 'online', fps);
  const visit = cue(timing, 'visit', fps);
  const street = cue(timing, '47th', fps);
  const shift = ease(frame, visit, 26);
  const titleExit = ease(frame, visit - 6, 6);
  const selectSilver = ease(frame, silver, 14);
  return <AbsoluteFill>
    <div style={{opacity: 1 - titleExit, transform: `translateY(${-titleExit * 40}px)`}}><KineticTitle frame={frame}>ONLINE.</KineticTitle></div>
    <div style={{opacity: shift}}><KineticTitle frame={frame} delay={visit} size={116}>IN PERSON.</KineticTitle></div>
    <div style={{position: 'absolute', left: 95, top: 472, fontFamily: SANS, fontSize: 28, fontWeight: 700, letterSpacing: 4, color: C.gold, opacity: ease(frame, 2)}}>ONE NEW YORK CONNECTION</div>
    <div style={{position: 'absolute', left: 95, top: 570, width: 890, height: 598, border: `1px solid ${C.cyan}55`, borderRadius: 28, background: C.panel, boxShadow: '0 20px 70px #0005', overflow: 'hidden', transformOrigin: '50% 0%', transform: `translateY(${-shift * 25 + (1 - ease(frame)) * 80}px) scale(${1 - shift * 0.30})`, opacity: ease(frame)}}>
      <div style={{height: 84, borderBottom: '1px solid #435260', display: 'flex', alignItems: 'center', padding: '0 27px', gap: 11}}>
        {[C.pink, C.gold, C.cyan].map(color => <div key={color} style={{width: 12, height: 12, borderRadius: '50%', background: color}}/>)}
        <div style={{marginLeft: 23, borderRadius: 9, background: '#080d17', padding: '9px 30px', width: 603, color: C.text, fontFamily: SANS, fontSize: 26}}>bulliontradingllc.com</div>
      </div>
      <div style={{display: 'flex', position: 'absolute', top: 121, left: 31, gap: 28}}>
        {[{name: 'gold-pamp.webp', label: 'GOLD', at: gold, color: C.gold}, {name: 'silver-round.webp', label: 'SILVER', at: silver, color: C.cyan}].map(({name, label, at, color}) => <div key={label} style={{width: 400, height: 416, position: 'relative', background: C.ivory, borderRadius: 20, padding: 13, transform: `translateY(${(1 - pop(frame, at, fps)) * 40}px)`, boxShadow: frame >= at ? `0 0 0 3px ${color}` : undefined}}>
          <Img src={art(name)} style={{position: 'absolute', top: 12, left: 60, width: 280, height: 300, objectFit: 'contain', mixBlendMode: 'multiply'}}/>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 28, textAlign: 'center', fontFamily: DISPLAY, fontSize: 38, letterSpacing: 3, fontWeight: 700, color: C.bg}}>{label}</div>
        </div>)}
      </div>
      <svg width={890} height={598} style={{position: 'absolute', inset: 0, opacity: ease(frame, gold, 6)}}>
        <g transform={`translate(${327 + selectSilver * 429} ${430 - Math.sin(clamp((frame - gold) / 25) * Math.PI) * 40})`}><path d="M0 0L0 60L17 44L28 65L40 59L29 38H51Z" fill={C.text} stroke={C.bg} strokeWidth={3}/></g>
        <circle cx={751} cy={430} r={15 + ease(frame, online, 15) * 52} fill="none" stroke={C.cyan} strokeWidth={4} opacity={frame >= online ? 1 - ease(frame, online, 15) : 0}/>
      </svg>
    </div>
    <svg width={1080} height={1460} style={{position: 'absolute', inset: 0}}>
      <path d="M540 966V1035" fill="none" stroke={C.cyan} strokeWidth={4} strokeDasharray="5 9" opacity={shift}/>
      <path d="M527 1019L540 1035L553 1019" fill="none" stroke={C.cyan} strokeWidth={4} opacity={shift}/>
    </svg>
    <div style={{position: 'absolute', left: 95, top: 1048, width: 890, height: 292, background: 'linear-gradient(135deg,#182632,#101521)', border: `1px solid ${C.cyan}77`, borderRadius: 26, display: 'flex', alignItems: 'center', gap: 24, padding: '24px 25px', opacity: shift, transform: `translateY(${(1 - shift) * 90}px) scale(${0.95 + shift * 0.05})`}}>
      <div style={{width: 151, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.9 + pop(frame, visit + 3, fps) * 0.1})`}}><StoreIcon size={155}/></div>
      <div><div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, letterSpacing: -2, lineHeight: 1.1, color: C.text}}>20 WEST <span style={{color: C.gold, display: 'inline-block', marginLeft: 8, transform: `scale(${1 + Math.sin(clamp((frame - street) / 15) * Math.PI) * 0.10})`}}>47TH ST.</span></div><div style={{fontFamily: SANS, marginTop: 18, fontWeight: 600, fontSize: 29, letterSpacing: 2, color: C.cyan}}>LOWER LEVEL #24</div><div style={{fontFamily: SANS, marginTop: 14, fontSize: 28, letterSpacing: 2, color: C.muted}}>NEW YORK CITY</div></div>
    </div>
  </AbsoluteFill>;
};

const People: React.FC<MotionSceneProps> = ({frame, fps, timing}) => {
  const products = cue(timing, 'products', fps);
  const place = cue(timing, 'place', fps);
  const team = cue(timing, 'team', fps);
  const talk = cue(timing, 'talk', fps);
  const nodes = [
    {x: 285, y: 746, color: C.gold, label: 'REAL PRODUCTS', at: products - 6, kind: 'product'},
    {x: 785, y: 746, color: C.cyan, label: 'A REAL PLACE', at: place - 6, kind: 'place'},
    {x: 540, y: 1165, color: C.pink, label: 'A REAL TEAM', at: team - 6, kind: 'team'},
  ];
  return <AbsoluteFill>
    <KineticTitle frame={frame} size={101}>A REAL<br/><span style={{color: C.gold}}>CONNECTION.</span></KineticTitle>
    <svg width={1080} height={1430} style={{position: 'absolute', inset: 0}}>
      {[{d: 'M420 746H650', at: place - 6, color: C.cyan}, {d: 'M353 856L472 1055', at: team - 6, color: C.pink}, {d: 'M717 856L608 1055', at: team - 3, color: C.pink}].map((line, i) => <g key={i}>
        <path d={line.d} fill="none" stroke={line.color} strokeOpacity={0.18} strokeWidth={16} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(frame, line.at, 14)}/>
        <path d={line.d} fill="none" stroke={line.color} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(frame, line.at, 14)}/>
      </g>)}
      <g opacity={ease(frame, talk, 8)}><path d="M502 906H581V959H551L532 974V959H502Z" stroke={C.gold} fill={C.panel} strokeWidth={2}/>{[525, 541, 557].map((x, i) => <circle key={x} cx={x} cy={932 + Math.sin(frame / 4 + i) * 3} r={4} fill={C.gold}/>)}</g>
    </svg>
    {nodes.map(({x, y, color, label, at, kind}) => {
      const p = pop(frame, at, fps);
      const phase = Math.max(0, frame - at) % 45 / 45;
      return <div key={kind} style={{position: 'absolute', left: x - 160, top: y - 145, width: 320, height: 380, opacity: ease(frame, at, 8), transform: `translateY(${(1 - p) * 55}px) scale(${0.75 + p * 0.25})`}}>
        <div style={{position: 'absolute', left: 21 - phase * 15, top: 5 - phase * 15, width: 278 + phase * 30, height: 278 + phase * 30, border: `1px solid ${color}`, borderRadius: '50%', opacity: (1 - phase) * 0.35}}/>
        <div style={{position: 'absolute', left: 25, top: 9, width: 270, height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center', background: kind === 'product' ? C.ivory : C.panel, borderRadius: '50%', border: `2px solid ${color}`, overflow: 'hidden', boxShadow: `0 0 45px ${color}14`}}>
          {kind === 'product' ? <Img src={art('gold-pamp.webp')} style={{width: 200, height: 235, objectFit: 'contain', mixBlendMode: 'multiply', transform: `rotate(${-9 + Math.sin(frame / 19) * 3}deg)`}}/> : kind === 'place' ? <StoreIcon size={168}/> : <TeamIcon/>}
        </div>
        <div style={{position: 'absolute', top: 302, left: -26, width: 372, color, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 35, letterSpacing: -1}}>{label}</div>
      </div>;
    })}
  </AbsoluteFill>;
};

export const NewYorkMotion: React.FC<MotionSceneProps> = (props) => {
  if (props.scene.id === 'hook') return <NewYorkHook {...props}/>;
  if (props.scene.id === 'heritage') return <Heritage {...props}/>;
  if (props.scene.id === 'visit') return <Visit {...props}/>;
  if (props.scene.id === 'people') return <People {...props}/>;
  return null;
};
