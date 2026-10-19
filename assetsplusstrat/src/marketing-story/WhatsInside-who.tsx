import type React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {EASE, mix, prog, SANS, type SceneProps} from '../marketing-premium/kit/theme';
import {BarGlyph, Glow, Headline, jolt, K, Kicker, money, mono, PAID, rgba, sans, TAG} from './kit';

// 4 · "So who takes the loss? Not the seller. They're gone. You."
// The loss is an object: a red −$3,965 chip looking for an owner among three
// profile cards. It lunges at the seller and is refused; the seller's profile
// collapses into a deleted account; on "You." the chip drops into your card.

const ICON = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18 M6 6l12 12',
  alert: 'M12 8v5 M12 16.5v.01 M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0',
  eyeOff:
    'M3 3l18 18 M10.6 10.6a2 2 0 0 0 2.8 2.8 M9.9 5.1A10 10 0 0 1 12 5c5 0 9 4.5 10 7a12.6 12.6 0 0 1-3.1 4.1 M6.6 6.6A12.7 12.7 0 0 0 2 12c1 2.5 5 7 10 7a9.7 9.7 0 0 0 4.4-1',
};

const Icon: React.FC<{d: string; size?: number; color?: string; stroke?: number}> = ({d, size = 24, color = K.text, stroke = 2.2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
    <path d={d} />
  </svg>
);

const Avatar: React.FC<{size: number; bg: string; ring: string; dashed?: boolean; children: React.ReactNode}> = ({size, bg, ring, dashed, children}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: bg,
      boxShadow: dashed ? undefined : `0 0 0 3px ${K.bg}, 0 0 0 5px ${ring}`,
      outline: dashed ? `2px dashed ${ring}` : undefined,
      outlineOffset: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);

const Chip: React.FC<{color: string; icon?: string; children: React.ReactNode; solid?: boolean}> = ({color, icon, children, solid}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 18px',
      borderRadius: 999,
      background: solid ? color : rgba(color, 0.14),
      boxShadow: `inset 0 0 0 2px ${rgba(color, 0.75)}`,
      ...mono(19, {color: solid ? K.bg : color, fontWeight: 700, letterSpacing: '0.1em'}),
    }}
  >
    {icon ? <Icon d={icon} size={20} color={solid ? K.bg : color} stroke={2.8} /> : null}
    {children}
  </div>
);

const card = (border: string, glow = 0): React.CSSProperties => ({
  position: 'absolute',
  borderRadius: 30,
  background: 'linear-gradient(180deg, rgba(28,29,35,0.96), rgba(15,16,20,0.96))',
  boxShadow: `inset 0 0 0 ${border === K.edge ? 1 : 2}px ${border}, 0 30px 60px rgba(0,0,0,0.55)${glow > 0 ? `, 0 0 ${60 * glow}px ${rgba(K.red, 0.45 * glow)}` : ''}`,
  boxSizing: 'border-box',
  overflow: 'hidden',
});

// Pixels shaken loose when the seller's account disappears.
const Dust: React.FC<{frame: number; at: number; x: number; y: number; w: number; h: number}> = ({frame, at, x, y, w, h}) => {
  const t = frame - at;
  if (t < 0 || t > 50) {
    return null;
  }
  return (
    <>
      {Array.from({length: 42}, (_, i) => {
        const r = (k: string) => random(`dust-${k}-${i}`);
        const life = Math.min(1, t / (24 + r('l') * 26));
        const size = 5 + r('s') * 11;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + r('x') * w + (r('dx') - 0.3) * 160 * life,
              top: y + r('y') * h - (40 + r('dy') * 140) * life,
              width: size,
              height: size,
              borderRadius: 2,
              background: r('c') > 0.55 ? K.gold : r('c') > 0.25 ? K.steel : K.red,
              opacity: (1 - life) * 0.9,
              rotate: `${r('a') * 180 * life}deg`,
            }}
          />
        );
      })}
    </>
  );
};

const SELLER = {x: 64, y: 396, w: 452, h: 252};
const LISTING = {x: 564, y: 396, w: 452, h: 252};
const YOU = {x: 120, y: 1000, w: 840, h: 196};
const CHIP = {x: 540, y: 848};
const SLOT = {x: YOU.x + YOU.w - 34 - 150, y: YOU.y + YOU.h / 2};

const SellerCard: React.FC<{frame: number; at: number; closed: number; gone: number; dim: number}> = ({frame, at, closed, gone, dim}) => {
  const p = prog(frame, at, 18);
  const c = prog(frame, closed, 10);
  const g = prog(frame, gone, 16);
  const glitch = frame >= gone && frame < gone + 10 ? (random(`gl${frame}`) - 0.5) * 24 : 0;
  return (
    <div
      style={{
        ...card(c > 0 ? rgba(K.red, mix(0.9, 0.35, g)) : K.edge, c * (1 - g)),
        left: SELLER.x + glitch,
        top: SELLER.y,
        width: SELLER.w,
        height: SELLER.h,
        padding: 28,
        opacity: p * (1 - dim * 0.65),
        translate: `0 ${(1 - p) * 30}px`,
        filter: g > 0 && g < 1 ? `saturate(${1 - g})` : undefined,
      }}
    >
      {/* The live profile */}
      <div style={{position: 'absolute', inset: 28, opacity: 1 - g}}>
        <div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
          <div style={{position: 'relative'}}>
            <Avatar size={96} bg="linear-gradient(140deg,#e9cc78,#8a6a1f)" ring={c > 0 ? K.red : rgba(K.gold, 0.6)}>
              <div style={sans(36, {fontWeight: 700, color: '#2a1e05'})}>GD</div>
            </Avatar>
            <div style={{position: 'absolute', right: -6, bottom: -4, width: 34, height: 34, borderRadius: '50%', background: c > 0 ? K.red : K.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 4px ${K.bg}`}}>
              <Icon d={c > 0 ? ICON.x : ICON.check} size={20} color={K.bg} stroke={3.4} />
            </div>
          </div>
          <div>
            <div style={mono(16, {color: K.mute})}>Seller</div>
            <div style={{position: 'relative', display: 'inline-block', marginTop: 6, ...sans(34)}}>
              gold_deals_ny
              <div style={{position: 'absolute', left: -4, top: '54%', height: 4, width: `${c * 106}%`, background: K.red, borderRadius: 2}} />
            </div>
            <div style={{marginTop: 8, ...mono(18, {color: K.teal, letterSpacing: '0.06em', textTransform: 'none', opacity: 1 - c * 0.6})}}>★ 4.9 · 1,204 sales</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, bottom: 0}}>
          {c > 0.5 ? (
            <Chip color={K.red} icon={ICON.x}>
              Account closed
            </Chip>
          ) : (
            <Chip color={K.teal} icon={ICON.check}>
              Top seller
            </Chip>
          )}
        </div>
      </div>
      {/* What's left of it */}
      <div style={{position: 'absolute', inset: 28, opacity: g, display: 'flex', gap: 22, alignItems: 'center'}}>
        <Avatar size={96} bg="rgba(255,255,255,0.04)" ring="rgba(243,241,236,0.3)" dashed>
          <Icon d={ICON.user} size={44} color="rgba(243,241,236,0.35)" stroke={1.8} />
        </Avatar>
        <div>
          <div style={sans(34, {color: 'rgba(243,241,236,0.75)'})}>User not found</div>
          <div style={{marginTop: 10, ...mono(16, {color: K.mute, letterSpacing: '0.06em', textTransform: 'none'})}}>This account no longer exists</div>
        </div>
      </div>
    </div>
  );
};

const ListingCard: React.FC<{frame: number; at: number; removed: number; dim: number}> = ({frame, at, removed, dim}) => {
  const p = prog(frame, at, 18);
  const r = prog(frame, removed, 14);
  return (
    <div
      style={{
        ...card(K.edge),
        left: LISTING.x,
        top: LISTING.y,
        width: LISTING.w,
        height: LISTING.h,
        padding: 28,
        opacity: p * (1 - dim * 0.65),
        translate: `0 ${(1 - p) * 30}px`,
      }}
    >
      <div style={{display: 'flex', gap: 22, alignItems: 'center', filter: r > 0 ? `grayscale(${r}) brightness(${1 - r * 0.45})` : undefined}}>
        <div style={{width: 96, height: 96, borderRadius: 22, background: 'radial-gradient(ellipse at 50% 40%, #2a2b31, #0d0e11 80%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `inset 0 0 0 1px ${K.edge}`}}>
          <div style={{rotate: '-6deg'}}>
            <BarGlyph w={34} />
          </div>
        </div>
        <div>
          <div style={mono(16, {color: K.mute})}>Listing #88213</div>
          <div style={{marginTop: 6, ...sans(30)}}>1 oz Fine Gold Bar</div>
          <div style={{marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, ...mono(18, {color: K.teal, letterSpacing: '0.06em'})}}>
            <Icon d={ICON.check} size={18} color={K.teal} stroke={3} />
            Paid {money(PAID)}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 28, bottom: 28}}>
        {r > 0.5 ? (
          <Chip color={K.mute} icon={ICON.eyeOff}>
            Listing removed
          </Chip>
        ) : (
          <Chip color={K.teal}>● Live</Chip>
        )}
      </div>
    </div>
  );
};

// The buyer tries to reach the seller.
const Message: React.FC<{frame: number; at: number; failed: number; out: number}> = ({frame, at, failed, out}) => {
  const p = prog(frame, at, 12);
  const f = prog(frame, failed, 10);
  return (
    <div style={{position: 'absolute', left: SELLER.x + 24, top: SELLER.y + SELLER.h + 22, opacity: p * (1 - prog(frame, out, 8)), translate: `0 ${(1 - p) * 14}px`}}>
      <div style={{display: 'inline-block', padding: '16px 22px', borderRadius: '22px 22px 6px 22px', background: 'rgba(255,255,255,0.09)', boxShadow: `inset 0 0 0 1px ${f > 0 ? rgba(K.red, 0.6 * f) : K.edge}`, ...sans(26, {letterSpacing: '-0.01em'})}}>
        Is this bar real?
      </div>
      <div style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, height: 24, ...mono(17, {color: f > 0 ? K.red : K.mute, letterSpacing: '0.08em', fontWeight: 700})}}>
        {f > 0 ? <Icon d={ICON.alert} size={20} color={K.red} stroke={2.6} /> : null}
        {f > 0 ? 'Not delivered · user not found' : 'Sending…'}
      </div>
    </div>
  );
};

// The loss, looking for an owner.
const LossChip: React.FC<{frame: number; at: number; lunge: number; refused: number; search: number; drop: number}> = ({frame, at, lunge, refused, search, drop}) => {
  const p = prog(frame, at, 14, EASE.out);
  const toward = prog(frame, lunge, refused - lunge, EASE.inOut) * (1 - prog(frame, refused + 2, 18, EASE.out));
  const shake = frame >= search && frame < search + 20 ? Math.sin((frame - search) * 1.4) * 14 * (1 - (frame - search) / 20) : 0;
  const fall = prog(frame, drop - 16, 16, EASE.in);
  const x = mix(CHIP.x, SELLER.x + SELLER.w / 2 + 30, toward * 0.55) + shake;
  const y = mix(CHIP.y, SELLER.y + SELLER.h - 10, toward * 0.55);
  const fx = mix(x, SLOT.x, fall);
  const fy = mix(y, SLOT.y, fall);
  const orbit = prog(frame, at + 6, 16) * (1 - prog(frame, lunge - 6, 10));
  if (frame >= drop) {
    return null;
  }
  return (
    <>
      {/* "?" marks orbiting the loss while nobody owns it */}
      {[0, 1, 2].map((i) => {
        const a = frame / 22 + (i * Math.PI * 2) / 3;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: CHIP.x + Math.cos(a) * 290 - 32,
              top: CHIP.y + Math.sin(a) * 110 - 32,
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: rgba(K.red, 0.16),
              boxShadow: `inset 0 0 0 2px ${rgba(K.red, 0.75)}, 0 0 24px ${rgba(K.red, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: orbit * (0.65 + 0.35 * Math.sin(a)),
              scale: String(0.85 + 0.15 * Math.sin(a)),
              ...sans(34, {fontWeight: 700, color: '#ff8a8e'}),
            }}
          >
            ?
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: fx - 200,
          top: fy - 66,
          width: 400,
          height: 132,
          borderRadius: 66,
          background: 'linear-gradient(180deg,#4a1418,#2a0b0d)',
          boxShadow: `inset 0 0 0 2px ${K.red}, 0 0 50px ${rgba(K.red, 0.45)}, 0 24px 50px rgba(0,0,0,0.6)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: p,
          scale: String(mix(1.5, 1, p) * mix(1, 0.62, fall)),
        }}
      >
        <div style={mono(16, {color: rgba(K.red, 0.95), fontWeight: 700, letterSpacing: '0.24em'})}>The loss</div>
        <div style={sans(64, {fontWeight: 700, color: '#ff8a8e', letterSpacing: '-0.03em', lineHeight: 1})}>−{money(PAID)}</div>
      </div>
    </>
  );
};

const YouCard: React.FC<{frame: number; at: number; you: number}> = ({frame, at, you}) => {
  const p = prog(frame, at, 18);
  const hit = prog(frame, you, 8);
  const pop = prog(frame, you, 14, EASE.out);
  return (
    <div
      style={{
        ...card(hit > 0 ? K.red : K.edge, hit),
        left: YOU.x,
        top: YOU.y,
        width: YOU.w,
        height: YOU.h,
        padding: '0 34px',
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        opacity: p,
        translate: `0 ${(1 - p) * 30}px`,
        background: hit > 0 ? `linear-gradient(180deg, ${rgba(K.red, 0.16 * hit)}, rgba(15,16,20,0.96))` : undefined,
      }}
    >
      <Avatar size={112} bg="linear-gradient(160deg,#2c2f36,#17181c)" ring={hit > 0 ? K.red : 'rgba(243,241,236,0.35)'}>
        <Icon d={ICON.user} size={56} color={hit > 0 ? '#ff8a8e' : 'rgba(243,241,236,0.8)'} stroke={1.8} />
      </Avatar>
      <div style={{flex: 1}}>
        <div style={mono(16, {color: hit > 0 ? K.red : K.mute})}>Buyer</div>
        <div style={sans(56, {fontWeight: 700, marginTop: 4})}>You</div>
        <div style={{marginTop: 6, ...mono(16, {color: K.mute, letterSpacing: '0.08em'})}}>Holding the bar</div>
      </div>
      <div
        style={{
          width: 300,
          height: 124,
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hit > 0 ? `inset 0 0 0 2px ${K.red}` : undefined,
          outline: hit > 0 ? undefined : `2px dashed ${K.faint}`,
          outlineOffset: -2,
          background: rgba(K.red, 0.14 * hit),
          scale: String(mix(1.2, 1, pop)),
        }}
      >
        {frame >= you ? (
          <div style={sans(58, {fontWeight: 700, color: '#ff8a8e', letterSpacing: '-0.03em'})}>−{money(PAID)}</div>
        ) : (
          <div style={sans(48, {color: K.faint})}>?</div>
        )}
      </div>
    </div>
  );
};

export const Who: React.FC<SceneProps> = ({frame, cue}) => {
  const so = cue('So');
  const loss = cue('loss');
  const not = cue('Not');
  const seller = cue('seller');
  const theyre = cue('Theyre');
  const gone = cue('gone');
  const you = cue('You');
  const dim = prog(frame, you - 4, 10);
  const hit = prog(frame, you, 6);
  const punch = prog(frame, you, 24, EASE.out);
  return (
    <AbsoluteFill style={{translate: jolt(frame, you, 20)}}>
      <Glow color={K.red} amount={0.3 + 1.1 * hit * (1 - 0.45 * prog(frame, you + 8, 30))} y={60} size={90} />
      <Kicker frame={frame} at={6}>
        The loss · Who takes it
      </Kicker>
      <Headline frame={frame} lines={[{text: 'Who takes the loss?', at: so - 4}]} />
      <AbsoluteFill style={{transformOrigin: '540px 1100px', scale: String(1 + 0.05 * punch)}}>
        <SellerCard frame={frame} at={4} closed={seller} gone={gone} dim={dim} />
        <ListingCard frame={frame} at={10} removed={gone + 8} dim={dim} />
        <Dust frame={frame} at={gone} x={SELLER.x} y={SELLER.y} w={SELLER.w} h={SELLER.h} />
        <Message frame={frame} at={theyre - 16} failed={gone} out={you - 6} />
        {/* The bar tag below is in your hands. */}
        <div style={{position: 'absolute', left: TAG.x + 150, top: YOU.y + YOU.h, width: 2, height: TAG.y - YOU.y - YOU.h, background: `repeating-linear-gradient(180deg, ${K.faint} 0 6px, transparent 6px 12px)`, opacity: prog(frame, 26, 16)}} />
        <YouCard frame={frame} at={16} you={you} />
        <LossChip frame={frame} at={loss - 6} lunge={not} refused={seller + 4} search={gone} drop={you} />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 640,
          textAlign: 'center',
          opacity: hit,
          scale: String(mix(1.35, 1, prog(frame, you, 12, EASE.out))),
          fontFamily: SANS,
          ...sans(250, {fontWeight: 700, color: K.red, letterSpacing: '-0.05em', textShadow: `0 0 70px ${rgba(K.red, 0.55)}`}),
        }}
      >
        You.
      </div>
    </AbsoluteFill>
  );
};
