import type React from 'react';
import {AbsoluteFill, Img, random} from 'remotion';
import {Eyebrow, italic, MaskLine, Metal, Rise} from '../kit/Text';
import {art, EASE, GOLD_GRADIENT, mix, prog, SANS, type SceneProps} from '../kit/theme';
import {ScoopShot} from './Arsenal-scoop';
import {Shelves} from './Arsenal-shelf';
import {VaultDoor, VAULT, VAULT_T} from './Arsenal-vault';
import {caps, CONDENSED, Embers, F, ICE_GRADIENT, MOLTEN_GRADIENT} from './forge';
import {Beads, fill, GrainDefs} from './Grain';

// Scene 3 — The Arsenal. The vault opens on shelves of casting grain, the
// three metals are spotlit, the competitors' extras are cut away, and a steel
// scoop pours silver grain like water.

const AMBER = 'rgba(255,170,90,0.55)';
const ICE = 'rgba(220,232,245,0.4)';

// ——— Materials ———

const GOLD_BEADS = fill('ars-gold', {x: -10, y: -10, w: 320, h: 680, count: 150, rMin: 15, rMax: 27});

type Panel = {key: string; x: number; at: number; label: string; purity: string; render: (frame: number, zoom: number) => React.ReactNode};

const PanelView: React.FC<{panel: Panel; frame: number; enter: number; lit: number; current: boolean; sweepAt: number; glow: string}> = ({panel, frame, enter, lit, current, sweepAt, glow}) => {
  const zoom = mix(1.18, 1.02, prog(frame, panel.at - 40, 260, EASE.out));
  const sweep = prog(frame, sweepAt, 36, EASE.inOut);
  return (
    <div
      style={{
        position: 'absolute',
        left: panel.x - 150,
        top: 700,
        width: 300,
        height: 650,
        opacity: enter,
        translate: `0 ${(1 - enter) * 90}px`,
        scale: String(current ? 1.035 : 1),
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 18,
          overflow: 'hidden',
          background: '#0a0a0c',
          boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 ${current ? 60 : 0}px ${glow}`,
          filter: `brightness(${mix(0.22, 1, lit)}) saturate(${mix(0.4, 1, lit)})`,
        }}
      >
        <div style={{position: 'absolute', inset: 0, scale: String(zoom)}}>{panel.render(frame, zoom)}</div>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)'}} />
        {sweep > 0 && sweep < 1 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(115deg, rgba(255,255,255,0) ${mix(-30, 130, sweep) - 14}%, rgba(255,248,230,0.55) ${mix(-30, 130, sweep)}%, rgba(255,255,255,0) ${mix(-30, 130, sweep) + 14}%)`,
              mixBlendMode: 'screen',
            }}
          />
        ) : null}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 28, textAlign: 'center'}}>
          <div style={caps(64, {fontWeight: 700, letterSpacing: '0.04em'})}>{panel.purity}</div>
          <div style={caps(17, {fontFamily: SANS, fontWeight: 500, letterSpacing: '0.34em', color: 'rgba(244,238,223,0.75)', marginTop: 10})}>{panel.label}</div>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, borderRadius: 18, boxShadow: `inset 0 0 0 1.5px ${current ? 'rgba(255,200,130,0.85)' : 'rgba(255,255,255,0.16)'}`}} />
    </div>
  );
};

// ——— Slash: a statement cut in two ———

const Slashed: React.FC<{frame: number; top: number; enter: number; cut: number; lines: {text: string; size: number}[]}> = ({frame, top, enter, cut, lines}) => {
  const H = lines.reduce((h, l) => h + l.size * 1.02, 0) + 20;
  const k = prog(frame, cut, 7, EASE.out);
  const after = prog(frame, cut + 2, 26, EASE.out);
  const y0 = H * 0.95;
  const y1 = H * 0.08;
  const yAt = (x: number) => y0 + ((y1 - y0) * (x - 40)) / 1000;
  const block = (clip: string, dx: number, dy: number) => (
    <div style={{position: 'absolute', inset: 0, clipPath: clip, translate: `${dx * after}px ${dy * after}px`, opacity: mix(1, 0.4, after)}}>
      {lines.map((l, i) => (
        <div key={i} style={caps(l.size, {textAlign: 'center', fontWeight: 700})}>
          {l.text}
        </div>
      ))}
    </div>
  );
  const upper = `polygon(0px 0px, 1080px 0px, 1080px ${yAt(1080)}px, 0px ${yAt(0)}px)`;
  const lower = `polygon(0px ${yAt(0)}px, 1080px ${yAt(1080)}px, 1080px ${H + 40}px, 0px ${H + 40}px)`;
  const glow = 1 - prog(frame, cut + 8, 30);
  return (
    <div style={{position: 'absolute', left: 0, top, width: 1080, height: H, opacity: enter, translate: `0 ${(1 - enter) * 40}px`, filter: enter < 1 ? `blur(${(1 - enter) * 10}px)` : undefined}}>
      {block(upper, -14, -6)}
      {block(lower, 14, 6)}
      <svg width={1080} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <line x1={40} y1={y0} x2={mix(40, 1040, k)} y2={yAt(mix(40, 1040, k))} stroke={F.amber} strokeOpacity={0.55 * glow + 0.25} strokeWidth={14} strokeLinecap="round" style={{filter: 'blur(6px)'}} />
        <line x1={40} y1={y0} x2={mix(40, 1040, k)} y2={yAt(mix(40, 1040, k))} stroke="#fff6e2" strokeOpacity={0.4 + 0.6 * glow} strokeWidth={mix(2, 4, glow)} strokeLinecap="round" />
        {Array.from({length: 18}, (_, i) => {
          const u = random(`slash${top}${i}`);
          const age = frame - cut - 4;
          if (age < 0 || age > 30) {
            return null;
          }
          const x = 40 + u * 1000 + (random(`slvx${top}${i}`) - 0.5) * age * 6;
          const y = yAt(40 + u * 1000) + (random(`slvy${top}${i}`) - 0.7) * age * 5 + age * age * 0.12;
          return <circle key={i} cx={x} cy={y} r={2 + random(`slr${top}${i}`) * 2.5} fill={F.molten} opacity={1 - age / 30} />;
        })}
      </svg>
    </div>
  );
};

export const Arsenal: React.FC<SceneProps> = ({frame, cue}) => {
  const welcome = cue('Welcome');
  const bullion = cue('Bullion');
  const llc = cue('LLC');
  const we = cue('We');
  const makers = cue('makers');
  const pure = cue('pure');
  const gold = cue('gold');
  const sterling = cue('sterling');
  const platinum = cue('platinum');
  const grain = cue('grain');
  const no1 = cue('No');
  const markups = cue('markups');
  const no2 = cue('no', 1);
  const premiums = cue('premiums');
  const just = cue('just');
  const high = cue('high');
  const materials = cue('materials');
  const priced = cue('priced');
  const fairly = cue('fairly');

  const interiorIn = prog(frame, VAULT_T.swing, 90, EASE.out);
  const shelvesOut = prog(frame, pure - 12, 26, EASE.inOut);
  const panelsOut = prog(frame, no1 - 16, 20, EASE.in);
  const slashOut = prog(frame, just - 30, 22, EASE.in);
  const scoopIn = prog(frame, just - 34, 26, EASE.out);

  const panels: Panel[] = [
    {
      key: 'gold',
      x: 205,
      at: gold,
      label: 'Gold',
      purity: '24K',
      render: (f) => (
        <svg width={300} height={650} style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="ars-gold-base" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7a5414" />
              <stop offset="1" stopColor="#2a1b05" />
            </linearGradient>
          </defs>
          <GrainDefs prefix="arg" />
          <rect width={300} height={650} fill="url(#ars-gold-base)" />
          <Beads grains={GOLD_BEADS} metal="gold" frame={f} prefix="arg" />
        </svg>
      ),
    },
    {
      key: 'sterling',
      x: 540,
      at: sterling,
      label: 'Sterling silver',
      purity: '.925',
      render: () => <Img src={art('grain-sterling-pile.png')} style={{position: 'absolute', left: -6, top: 0, height: 660, width: (660 * 544) / 451}} />,
    },
    {
      key: 'platinum',
      x: 875,
      at: platinum,
      label: 'Platinum',
      purity: '950 Pt',
      render: () => <Img src={art('grain-platinum-texture.jpg')} style={{position: 'absolute', left: -280, top: 0, height: 650, width: (650 * 1280) / 960}} />,
    },
  ];
  const currentPanel = panels.reduce((idx, p, i) => (frame >= p.at - 6 ? i : idx), -1);
  const allLit = prog(frame, grain - 6, 20);

  return (
    <AbsoluteFill style={{backgroundColor: F.black, overflow: 'hidden'}}>
      {/* ——— B: inside the vault ——— */}
      {frame < pure + 20 ? (
        <AbsoluteFill
          style={{
            scale: String(mix(1.35, 1, interiorIn) * mix(1, 1.08, shelvesOut)),
            opacity: Math.min(1, interiorIn * 1.4) * (1 - shelvesOut),
            filter: shelvesOut > 0 ? `blur(${shelvesOut * 12}px)` : undefined,
          }}
        >
          {frame > VAULT_T.clung - 6 ? <Shelves frame={frame} /> : null}
        </AbsoluteFill>
      ) : null}

      {/* ——— C/D backdrop: dark forge-lit stage ——— */}
      {frame > pure - 20 && frame < just + 10 ? (
        <AbsoluteFill style={{opacity: shelvesOut * (1 - scoopIn)}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 40% at 50% 62%, rgba(255,140,50,0.16), rgba(0,0,0,0) 70%), linear-gradient(180deg, #0b0807, #050405)'}} />
          <Embers frame={frame} heat={0.35} />
        </AbsoluteFill>
      ) : null}

      {/* ——— C: the three metals ——— */}
      {frame > pure - 12 && frame < no1 + 10 ? (
        <AbsoluteFill style={{opacity: 1 - panelsOut, scale: String(mix(1, 0.94, panelsOut)), filter: panelsOut > 0 ? `blur(${panelsOut * 10}px)` : undefined}}>
          {panels.map((panel, i) => (
            <PanelView
              key={panel.key}
              panel={panel}
              frame={frame}
              enter={prog(frame, pure - 8 + i * 5, 30, EASE.out)}
              lit={Math.max(prog(frame, panel.at - 6, 18), allLit)}
              current={i === currentPanel && frame < grain - 6}
              sweepAt={panel.at - 2}
              glow={i === 0 ? AMBER : ICE}
            />
          ))}
          <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
            <Rise frame={frame} at={pure - 8} out={grain - 10} dur={24}>
              <div style={caps(54, {letterSpacing: '0.34em', color: F.amber, marginRight: '-0.34em'})}>Pure</div>
            </Rise>
            <div style={{position: 'relative', height: 150, marginTop: 14}}>
              {[
                {text: '24K Gold', at: gold, out: sterling, gradient: GOLD_GRADIENT, size: 136},
                {text: 'Sterling silver', at: sterling, out: platinum, gradient: ICE_GRADIENT, size: 118},
                {text: 'Platinum', at: platinum, out: grain - 6, gradient: ICE_GRADIENT, size: 136},
              ].map((m) => (
                <Rise key={m.text} frame={frame} at={m.at - 6} out={m.out - 8} dur={20} outDur={10} style={{position: 'absolute', left: 0, right: 0}}>
                  <div style={caps(m.size, {fontWeight: 700})}>
                    <Metal frame={frame} gradient={m.gradient} sheenAt={m.at + 6} glow="rgba(255,255,255,0.15)">
                      {m.text}
                    </Metal>
                  </div>
                </Rise>
              ))}
              <Rise frame={frame} at={grain - 3} out={no1 - 16} dur={20} style={{position: 'absolute', left: 0, right: 0}}>
                <div style={caps(136, {fontWeight: 700})}>
                  <Metal frame={frame} gradient={MOLTEN_GRADIENT} sheenAt={grain + 8} glow="rgba(255,140,60,0.35)">
                    Casting grain.
                  </Metal>
                </div>
              </Rise>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ——— D: what we leave out ——— */}
      {frame > no1 - 12 && frame < just + 4 ? (
        <AbsoluteFill style={{opacity: 1 - slashOut, filter: slashOut > 0 ? `blur(${slashOut * 12}px)` : undefined}}>
          <Slashed
            frame={frame}
            top={360}
            enter={prog(frame, no1 - 6, 18, EASE.out)}
            cut={markups}
            lines={[
              {text: 'No hidden', size: 150},
              {text: 'markups.', size: 150},
            ]}
          />
          <Slashed
            frame={frame}
            top={860}
            enter={prog(frame, no2 - 6, 18, EASE.out)}
            cut={premiums}
            lines={[
              {text: 'No extortionate', size: 116},
              {text: 'premiums.', size: 150},
            ]}
          />
        </AbsoluteFill>
      ) : null}

      {/* ——— E: the scoop ——— */}
      {frame > just - 40 ? (
        <AbsoluteFill style={{opacity: scoopIn, scale: String(mix(1.08, 1, scoopIn) * mix(1, 1.05, prog(frame, just, 250, EASE.inOut)))}}>
          <ScoopShot frame={frame} plunge={just} />
          <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
            <Rise frame={frame} at={just - 6} out={priced - 14} dur={18}>
              <div style={caps(104, {fontWeight: 700})}>Just the raw,</div>
            </Rise>
            <Rise frame={frame} at={high - 6} out={priced - 14} dur={18}>
              <div style={caps(104, {fontWeight: 700, marginTop: 6})}>
                <Metal frame={frame} gradient={ICE_GRADIENT} sheenAt={high + 4} glow="rgba(220,232,245,0.25)">
                  High-purity
                </Metal>
              </div>
            </Rise>
            <Rise frame={frame} at={materials - 6} out={priced - 14} dur={18}>
              <div style={caps(84, {fontWeight: 600, marginTop: 10, color: 'rgba(244,238,223,0.88)'})}>materials you need.</div>
            </Rise>
          </div>
          <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center'}}>
            <MaskLine frame={frame} at={priced - 6} dur={32}>
              <div style={italic(170, {lineHeight: 1.05})}>
                <Metal frame={frame} gradient={GOLD_GRADIENT} sheenAt={fairly + 4} glow="rgba(212,175,55,0.35)">
                  Priced fairly.
                </Metal>
              </div>
            </MaskLine>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ——— A: the vault door (over everything until it is pushed through) ——— */}
      <VaultDoor frame={frame} />

      {/* ——— B text (over the vault interior) ——— */}
      {frame > welcome - 20 && frame < pure + 10 ? (
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
          <Rise frame={frame} at={welcome - 6} out={we - 12} dur={22}>
            <div style={caps(62, {letterSpacing: '0.3em', marginRight: '-0.3em', color: 'rgba(244,238,223,0.85)'})}>Welcome to</div>
          </Rise>
          <Rise frame={frame} at={bullion - 6} out={we - 12} dur={22}>
            <div style={caps(114, {fontWeight: 700, marginTop: 10})}>
              <Metal frame={frame} gradient={GOLD_GRADIENT} sheenAt={llc} glow="rgba(212,175,55,0.3)">
                Bullion Trading
              </Metal>
            </div>
          </Rise>
          <div style={{marginTop: 18}}>
            <Eyebrow frame={frame} at={llc - 6} out={we - 12} color={F.amber} style={{fontFamily: CONDENSED, fontSize: 52, fontWeight: 600, gap: 30}}>
              LLC
            </Eyebrow>
          </div>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0}}>
            <Rise frame={frame} at={we - 6} out={pure - 14} dur={22}>
              <div style={caps(138, {fontWeight: 700})}>We supply</div>
            </Rise>
            <MaskLine frame={frame} at={makers - 10} dur={30} out={pure - 14}>
              <div style={italic(164, {lineHeight: 1.05, color: F.ivory})}>
                <Metal frame={frame} gradient={MOLTEN_GRADIENT} sheenAt={makers + 10} glow="rgba(255,140,60,0.35)">
                  the makers.
                </Metal>
              </div>
            </MaskLine>
          </div>
        </div>
      ) : null}

      {/* Light dust in the vault air */}
      {frame > VAULT_T.swing && frame < just ? (
        <AbsoluteFill style={{opacity: 0.6 * (1 - slashOut), pointerEvents: 'none'}}>
          <Embers frame={frame} heat={0.22} originY={VAULT.y + 600} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
