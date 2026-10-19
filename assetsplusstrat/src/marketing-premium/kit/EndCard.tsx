import type React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {Eyebrow, italic, Metal, Rise, serif} from './Text';
import {C, EASE, LOGO, mix, prog, SANS, type SceneProps} from './theme';

const LOGO_W = 430;
const LOGO_H = (LOGO_W * 84) / 294;

// Shared closing card. The hero products are passed in so each film closes
// on its own pieces.
export const EndCard: React.FC<
  SceneProps & {
    eyebrow: string;
    footer: string;
    hero: (frame: number, start: number) => React.ReactNode;
    // The spoken lead-in before the brand name ("Buy from", "Sell it to").
    lead?: string;
    leadWord?: string;
  }
> = ({frame, cue, eyebrow, footer, hero, lead = 'Buy from', leadWord = 'Buy'}) => {
  const buy = cue(leadWord);
  const name = cue('Bullion');
  const logoAt = cue('Trading') + 16;
  const urlAt = logoAt + 26;
  const logoIn = prog(frame, logoAt, 40);
  const shine = prog(frame, logoAt + 30, 60, EASE.inOut);
  const url = prog(frame, urlAt, 44);
  const pulse = 0.5 + 0.5 * Math.sin((frame - urlAt) / 22);
  return (
    <AbsoluteFill>
      {/* Stage floor */}
      <div
        style={{
          position: 'absolute',
          left: -100,
          right: -100,
          top: 1040,
          height: 260,
          background: 'radial-gradient(ellipse 50% 50% at 50% 30%, rgba(214,168,74,0.16) 0%, rgba(0,0,0,0) 70%)',
          opacity: prog(frame, 0, 40),
        }}
      />
      {hero(frame, 0)}
      <div style={{position: 'absolute', top: 268, left: 0, right: 0, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={Math.max(0, buy - 18)}>
          {eyebrow}
        </Eyebrow>
        <Rise frame={frame} at={buy} style={{marginTop: 34}}>
          <div style={italic(98, {color: C.champagne})}>{lead}</div>
        </Rise>
        <Rise frame={frame} at={name} dur={44} style={{marginTop: 4}}>
          <div style={serif(128, {letterSpacing: '-0.02em'})}>
            <Metal frame={frame} sheenAt={name + 30}>
              Bullion Trading.
            </Metal>
          </div>
        </Rise>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 540 - LOGO_W / 2,
          top: 1196,
          width: LOGO_W,
          height: LOGO_H,
          opacity: logoIn,
          scale: String(mix(0.92, 1, logoIn)),
          filter: `blur(${(1 - logoIn) * 8}px)`,
        }}
      >
        <Img src={LOGO} style={{width: LOGO_W, height: LOGO_H}} />
        {shine > 0 && shine < 1 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(110deg, rgba(255,255,255,0) ${mix(-20, 110, shine) - 12}%, rgba(255,250,230,0.95) ${mix(-20, 110, shine)}%, rgba(255,255,255,0) ${mix(-20, 110, shine) + 12}%)`,
              maskImage: `url(${LOGO})`,
              WebkitMaskImage: `url(${LOGO})`,
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              mixBlendMode: 'screen',
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1352,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: url,
          translate: `0 ${(1 - url) * 26}px`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '22px 40px 24px',
            borderRadius: 999,
            border: '1.5px solid rgba(212,175,55,0.7)',
            background: 'linear-gradient(180deg, rgba(40,32,16,0.75), rgba(14,12,8,0.75))',
            boxShadow: `0 0 ${30 + pulse * 26}px rgba(212,175,55,${0.16 + pulse * 0.12}), inset 0 1px 0 rgba(255,240,200,0.18)`,
            fontFamily: SANS,
            fontSize: 40,
            fontWeight: 500,
            letterSpacing: `${mix(0.12, 0.01, url)}em`,
            color: C.ivory,
          }}
        >
          bulliontradingllc.com
          <span style={{color: C.gold, fontSize: 38, translate: `${pulse * 5}px ${-pulse * 5}px`}}>↗</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1500, left: 0, right: 0}}>
        <Eyebrow frame={frame} at={urlAt + 22} color={C.mute}>
          {footer}
        </Eyebrow>
      </div>
    </AbsoluteFill>
  );
};
