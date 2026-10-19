import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile} from 'remotion';
import {loadFont as loadSerif} from '@remotion/google-fonts/CormorantGaramond';
import {loadFont as loadSans} from '@remotion/google-fonts/Inter';
import type {CampaignScene} from './types';

export const {fontFamily: SERIF} = loadSerif('normal', {
  weights: ['500', '600'], subsets: ['latin'],
});
export const {fontFamily: SANS} = loadSans('normal', {
  weights: ['400', '500', '600', '700'], subsets: ['latin'],
});
export const C = {navy: '#1a1a2e', gold: '#d4af37', ivory: '#f3efdf', ink: '#202033', muted: '#6a675e'};
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const enter = (f: number, delay = 0, duration = 25) => interpolate(f, [delay, delay + duration], [0, 1], {...CLAMP, easing: OUT});
const art = (name: string) => staticFile(`marketing/images/${name}`);

export const Brand: React.FC<{dark?: boolean; frame: number; index: number}> = ({dark, frame, index}) => <>
  <div style={{position: 'absolute', left: 86, right: 112, top: 160, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: enter(frame, 1, 16)}}>
    <Img src={staticFile('brand/logo-bullion.webp')} style={{width: 294, height: 84, objectFit: 'contain', filter: dark ? 'none' : 'brightness(0)', opacity: dark ? 0.95 : 0.85}} />
    <div style={{fontFamily: SANS, fontSize: 21, letterSpacing: 4, color: dark ? '#e4dbc0' : C.muted}}>0{index + 1} / 05</div>
  </div>
</>;

export const Heading: React.FC<{scene: CampaignScene; frame: number; dark?: boolean; top?: number; size?: number; width?: number}> = ({scene, frame, dark, top = 330, size = 126, width = 900}) => <div style={{position: 'absolute', left: 86, top, width}}>
  <div style={{fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: 4.5, color: dark ? '#e3c975' : '#82681d', opacity: enter(frame, 3), transform: `translateY(${(1 - enter(frame, 3)) * 18}px)`}}>{scene.eyebrow}</div>
  <div style={{marginTop: 24, fontFamily: SERIF, fontWeight: 500, fontSize: size, lineHeight: 0.91, letterSpacing: -3.2, color: dark ? C.ivory : C.navy}}>
    {scene.headline.split('\n').map((line, i) => <div key={line} style={{overflow: 'hidden', paddingBottom: 12}}><div style={{transform: `translateY(${(1 - enter(frame, 5 + i * 4, 28)) * 115}%)`}}>{line}</div></div>)}
  </div>
</div>;

const Product: React.FC<{name: string; x: number; y: number; width: number; height?: number; frame: number; delay?: number; rotation?: number; drift?: number; opacity?: number}> = ({name, x, y, width, height = width, frame, delay = 8, rotation = 0, drift = 1, opacity = 1}) => {
  const p = enter(frame, delay, 35);
  return <div style={{position: 'absolute', left: x, top: y, width, height, mixBlendMode: 'multiply', opacity: p * opacity, transform: `translateY(${(1 - p) * 100 - frame * 0.11 * drift}px) rotate(${rotation + (1 - p) * 3}deg) scale(${0.94 + p * 0.06 + frame * 0.00015})`, transformOrigin: 'center'}}>
    <Img src={art(name)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
  </div>;
};

const FineLabel: React.FC<{children: React.ReactNode; x: number; y: number; width?: number; dark?: boolean; frame: number; delay?: number}> = ({children, x, y, width = 700, dark, frame, delay = 17}) => <div style={{position: 'absolute', left: x, top: y, width, fontFamily: SANS, fontSize: 25, lineHeight: 1.5, letterSpacing: 1.2, color: dark ? '#dbd6c5' : C.muted, opacity: enter(frame, delay), transform: `translateY(${(1 - enter(frame, delay)) * 15}px)`}}>{children}</div>;

const Ivory: React.FC<{children: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: C.ivory}}>
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 72% 50%, #fffefa 0%, rgba(255,255,255,0) 58%)'}} />{children}
</AbsoluteFill>;

const Satin: React.FC<{frame: number; children: React.ReactNode}> = ({frame, children}) => <AbsoluteFill style={{background: C.navy}}>
  <Img src={art('gold-satin-backdrop.png')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.045 + frame * 0.00016}) translateX(${-frame * 0.035}px)`}} />
  <AbsoluteFill style={{background: 'linear-gradient(180deg,rgba(18,18,37,0.22) 0%,rgba(18,18,37,0) 60%,rgba(18,18,37,.2) 100%)'}} />
  {children}
</AbsoluteFill>;

const Hairline: React.FC<{frame: number; y: number; x?: number; width?: number; dark?: boolean}> = ({frame, y, x = 86, width = 880, dark}) => <div style={{position: 'absolute', left: x, top: y, width, height: 1, background: dark ? 'rgba(212,175,55,.5)' : 'rgba(111,92,34,.3)', transform: `scaleX(${enter(frame, 12, 35)})`, transformOrigin: 'left'}} />;

const DiscoveryHero: React.FC<{scene: CampaignScene; frame: number}> = ({scene, frame}) => <Ivory>
  <div style={{position: 'absolute', width: 940, height: 940, border: '1px solid #dcd4bc', borderRadius: '50%', left: 115, top: 605, transform: `scale(${0.96 + frame * .0003})`}} />
  <Heading scene={scene} frame={frame} size={150} />
  <Product name="gold-pamp.webp" x={50} y={720} width={610} height={680} frame={frame} rotation={-8} />
  <Product name="silver-round.webp" x={548} y={895} width={422} frame={frame} delay={17} rotation={10} />
  <FineLabel x={90} y={1398} frame={frame}>A closer look at precious metals.</FineLabel>
</Ivory>;

const ProductCollection: React.FC<{scene: CampaignScene; frame: number; gift?: boolean}> = ({scene, frame, gift}) => <Ivory>
  <Heading scene={scene} frame={frame} size={gift ? 133 : 132} />
  <div style={{position: 'absolute', left: 0, right: 0, height: 630, top: 786, background: 'linear-gradient(180deg,#e6dfcb,rgba(243,239,223,0))', clipPath: `inset(${(1 - enter(frame, 6, 28)) * 100}% 0 0 0)`}} />
  <Product name={gift ? 'gold-rosa.webp' : 'gold-pamp.webp'} x={-70} y={768} width={610} height={580} frame={frame} rotation={-8} />
  <Product name="silver-eagle.jpg" x={343} y={823} width={390} height={498} frame={frame} delay={13} rotation={3} />
  <Product name="silver-round.webp" x={667} y={982} width={335} frame={frame} delay={22} rotation={13} />
  <div style={{position: 'absolute', left: 90, right: 116, top: 1398, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 25, letterSpacing: 4, color: C.muted, opacity: enter(frame, 23)}}><span>BARS</span><span>COINS</span><span>ROUNDS</span></div>
</Ivory>;

const Detail: React.FC<{scene: CampaignScene; frame: number; keepsake?: boolean}> = ({scene, frame, keepsake}) => <Ivory>
  <Heading scene={scene} frame={frame} size={keepsake ? 139 : 151} />
  <div style={{position: 'absolute', left: 87, top: 746, width: 892, height: 620, overflow: 'hidden', background: '#faf7ed', clipPath: `inset(0 ${(1 - enter(frame, 4, 24)) * 100}% 0 0)`}}>
    <Img src={art(keepsake ? 'silver-round.webp' : 'silver-eagle.jpg')} style={{position: 'absolute', width: keepsake ? 1100 : 1180, height: keepsake ? 1100 : 1500, objectFit: 'contain', top: keepsake ? -240 : -345, left: keepsake ? -75 : -175, mixBlendMode: 'multiply', transform: `translate(${-frame * 0.22}px,${frame * 0.11}px) scale(${1.02 + frame * .00025})`}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: 'linear-gradient(transparent,rgba(243,239,223,.5))'}} />
  </div>
  <FineLabel x={90} y={1374} frame={frame}>{keepsake ? 'Something to hold onto.' : 'Weights. Forms. Finishes.'}</FineLabel>
  {!keepsake && <div style={{position: 'absolute', left: 806, top: 714, width: 102, height: 102, borderRadius: '50%', background: C.navy, color: C.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 24, opacity: enter(frame, 18)}}>DETAIL</div>}
</Ivory>;

const StreetGrid: React.FC<{frame: number; compact?: boolean}> = ({frame, compact}) => {
  const p = enter(frame, 4, 44);
  return <div style={{position: 'absolute', top: compact ? 805 : 775, left: -65, width: 1190, height: compact ? 520 : 700, opacity: p, transform: `translateY(${(1 - p) * 50}px) rotate(-12deg) scale(${1.03 + frame * .0001})`}}>
    <svg width="1190" height="700" viewBox="0 0 1190 700" style={{overflow: 'visible'}}>
      <defs><linearGradient id="street-fade"><stop stopColor="#d4af37" stopOpacity=".03"/><stop offset=".5" stopColor="#d4af37" stopOpacity=".15"/><stop offset="1" stopColor="#d4af37" stopOpacity=".03"/></linearGradient></defs>
      {Array.from({length: 6}, (_, row) => Array.from({length: 5}, (_, col) => <rect key={`${row}-${col}`} x={col * 278 - 145} y={row * 136 - 65} width={232} height={98} rx={4} fill="url(#street-fade)" stroke="#a79156" strokeOpacity=".22" />))}
      <path d="M-20 274H1250" stroke="#d4af37" strokeWidth="4" strokeDasharray="1270" strokeDashoffset={1270 * (1 - enter(frame, 9, 38))} />
      <text x="103" y="259" fill="#b7ab88" fontFamily={SANS} fontSize="24" letterSpacing="3">WEST 47TH STREET</text>
      <text x="825" y="178" fill="#918b79" fontFamily={SANS} fontSize="22" transform="rotate(90 825 178)">FIFTH AVENUE</text>
      <g transform="translate(640 274)">
        <circle r={54 + Math.sin(frame / 17) * 5} fill="none" stroke="#d4af37" strokeOpacity=".25" strokeWidth="2" />
        <circle r="30" fill="#d4af37" />
        <circle r="8" fill="#1a1a2e" />
      </g>
    </svg>
  </div>;
};

const City: React.FC<{scene: CampaignScene; frame: number; address?: boolean}> = ({scene, frame, address}) => <AbsoluteFill style={{background: C.navy}}>
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 90% 70%,rgba(113,94,52,.18),transparent 70%)'}} />
  <Heading scene={scene} frame={frame} dark size={address ? 137 : 153} />
  <StreetGrid frame={frame} compact={address} />
  {address ? <div style={{position: 'absolute', left: 86, top: 1186, opacity: enter(frame, 20), background: C.navy, padding: '24px 0 10px', width: 800}}>
    <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 44, color: C.ivory}}>20 West 47th Street</div>
    <div style={{fontFamily: SANS, fontSize: 30, color: '#c6c0ae', marginTop: 17}}>Lower Level #24 · New York, NY</div>
  </div> : <FineLabel x={86} y={1363} dark frame={frame}>PRECIOUS METALS / NEW YORK CITY</FineLabel>}
</AbsoluteFill>;

const Heritage: React.FC<{scene: CampaignScene; frame: number}> = ({scene, frame}) => <AbsoluteFill style={{background: C.navy}}>
  <div style={{position: 'absolute', top: 365, left: 86, color: '#dfc66e', fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 4, opacity: enter(frame, 3)}}>{scene.eyebrow}</div>
  <div style={{position: 'absolute', left: 89, top: 480, color: C.ivory, fontFamily: SERIF, fontSize: 116, opacity: enter(frame, 5), transform: `translateY(${(1-enter(frame, 5))*35}px)`}}>Since</div>
  <div style={{position: 'absolute', left: 50, top: 565, color: C.ivory, fontFamily: SERIF, fontSize: 359, fontWeight: 500, letterSpacing: -13, lineHeight: 1.1, overflow: 'hidden'}}>
    {'2008'.split('').map((n, i) => <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - enter(frame, 10 + i * 4, 30)) * 110}%)`}}>{n}</span>)}
  </div>
  <Hairline frame={frame} y={997} dark />
  <FineLabel frame={frame} x={90} y={1041} dark>Serving buyers and sellers<br/><span style={{fontFamily: SERIF, color: C.ivory, fontSize: 72, lineHeight: 1.35}}>in New York City.</span></FineLabel>
  <div style={{position: 'absolute', left: 86, top: 1314, fontFamily: SANS, fontSize: 25, letterSpacing: 5, color: '#c9bb8e', opacity: enter(frame, 25)}}>GOLD · SILVER · PRECIOUS METALS</div>
</AbsoluteFill>;

const Trust: React.FC<{scene: CampaignScene; frame: number; city?: boolean}> = ({scene, frame, city}) => <Ivory>
  <Heading scene={scene} frame={frame} size={city ? 126 : 108} />
  <div style={{position: 'absolute', left: 85, top: 757, height: 566, width: 887, background: '#e7e1cd', overflow: 'hidden', clipPath: `inset(0 0 ${(1-enter(frame, 5, 28))*100}% 0)`}}>
    <Product name={city ? 'silver-pamp.webp' : 'gold-pamp.webp'} x={5} y={-15} width={510} height={615} frame={frame} rotation={-9} />
    <Product name="silver-round.webp" x={450} y={113} width={480} frame={frame} delay={17} rotation={7} />
  </div>
  <FineLabel x={86} y={1365} frame={frame}>{city ? 'Visit our counter. Meet the team.' : 'Live, spot-based pricing · New York team'}</FineLabel>
</Ivory>;

const Gift: React.FC<{scene: CampaignScene; frame: number}> = ({scene, frame}) => <Satin frame={frame}>
  <Heading scene={scene} frame={frame} dark size={138} top={347} />
  <div style={{position: 'absolute', left: 92, top: 953, width: 73, height: 73, border: '1px solid #d4af37', transform: `rotate(45deg) scale(${enter(frame, 22, 32)})`}} />
  <FineLabel x={88} y={1110} dark frame={frame} delay={24}>For a milestone.<br/>For a memory.</FineLabel>
</Satin>;

const Milestones: React.FC<{scene: CampaignScene; frame: number}> = ({scene, frame}) => <Ivory>
  <div style={{position: 'absolute', top: 740, left: 0, width: 1080, height: 670, background: 'linear-gradient(106deg,rgba(187,190,195,.2) 0%,rgba(187,190,195,.2) 49.8%,rgba(206,176,75,.15) 50%,rgba(206,176,75,.15) 100%)'}} />
  <Heading scene={scene} frame={frame} size={108} />
  <Product name="silver-pamp.webp" x={-27} y={801} width={592} height={529} frame={frame} rotation={-6} />
  <Product name="gold-pamp.webp" x={487} y={778} width={605} height={550} frame={frame} delay={18} rotation={7} />
  <FineLabel x={98} y={1357} width={400} frame={frame}>A SILVER ANNIVERSARY</FineLabel>
  <FineLabel x={566} y={1357} width={400} frame={frame} delay={24}>A GOLDEN MILESTONE</FineLabel>
</Ivory>;

const CTA: React.FC<{scene: CampaignScene; frame: number; city?: boolean}> = ({scene, frame, city}) => <Satin frame={frame}>
  <div style={{position: 'absolute', left: 86, top: 349, fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: 4, color: '#e3c975', opacity: enter(frame, 2, 15)}}>{scene.eyebrow}</div>
  <div style={{position: 'absolute', left: 85, top: 422, fontFamily: SERIF, fontWeight: 500, color: C.ivory, fontSize: 128, lineHeight: .98, letterSpacing: -2.8}}>
    {['Buy from', 'Bullion', 'Trading.'].map((text, i) => <div key={text} style={{overflow: 'hidden', paddingBottom: 8}}><div style={{transform: `translateY(${(1 - enter(frame, 3 + i * 3, 22)) * 108}%)`}}>{text}</div></div>)}
  </div>
  <Hairline frame={frame} y={895} dark width={780} />
  <div style={{position: 'absolute', left: 89, top: 950, fontFamily: SANS, fontSize: 39, letterSpacing: -.8, fontWeight: 500, color: '#fff5d6', opacity: enter(frame, 10, 18)}}>bulliontradingllc.com <span style={{marginLeft: 18, color: '#e2c46c'}}>↗</span></div>
  <FineLabel x={89} y={1040} dark frame={frame} delay={14}>{city ? <>20 West 47th Street<br/>Lower Level #24 · New York</> : 'GOLD & SILVER / NEW YORK CITY'}</FineLabel>
</Satin>;

export const SceneVisual: React.FC<{scene: CampaignScene; frame: number; campaignId: string}> = ({scene, frame, campaignId}) => {
  const gift = campaignId === 'meaningful-gift';
  const city = campaignId === 'new-york';
  switch (scene.visual) {
    case 'hero': return <DiscoveryHero scene={scene} frame={frame} />;
    case 'products': return <ProductCollection scene={scene} frame={frame} gift={gift} />;
    case 'detail': return <Detail scene={scene} frame={frame} />;
    case 'keepsake': return <Detail scene={scene} frame={frame} keepsake />;
    case 'city': return <City scene={scene} frame={frame} />;
    case 'address': return <City scene={scene} frame={frame} address />;
    case 'year': return <Heritage scene={scene} frame={frame} />;
    case 'trust': return <Trust scene={scene} frame={frame} city={city} />;
    case 'gift': return <Gift scene={scene} frame={frame} />;
    case 'milestones': return <Milestones scene={scene} frame={frame} />;
    case 'cta': return <CTA scene={scene} frame={frame} city={city} />;
    default: return <DiscoveryHero scene={scene} frame={frame} />;
  }
};

export const isDarkScene = (scene: CampaignScene) => ['city', 'year', 'address', 'gift', 'cta'].includes(scene.visual);
