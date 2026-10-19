import type React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Pin} from '../kit/Pieces';
import {italic, Metal} from '../kit/Text';
import {EASE, mix, prog, type SceneProps} from '../kit/theme';
import {Bag, BAG_H, BAG_W, Counter, COUNTER_TOP, HyperlapseMap, MAP, Plaque, RouteMap, TARGET} from './District-set';
import {caps as fcaps, ICE_GRADIENT, MOLTEN_GRADIENT} from './forge';
import {Bead, GrainDefs, type Grain} from './Grain';

// "The 47th Street Advantage": a hyper-lapse down to West 47th, the showroom
// counter where a sealed bag of grain lands, then routes fanning out from
// New York across the country.

const REST_Y = COUNTER_TOP + 66; // bag bottom on the glass
const FALL = 26;

const SPILL = Array.from({length: 5}, (_, i) => ({
  vx: (random(`sp${i}`) - 0.5) * 9,
  vy: -6 - random(`spv${i}`) * 5,
  land: REST_Y - 4 + random(`spl${i}`) * 26,
  grain: {x: 0, y: 0, r: 11 + random(`spr${i}`) * 5, ratio: 0.78, rot: random(`spt${i}`) * 180, variant: i % 3, glint: random(`spg${i}`)} as Grain,
}));

const Chip: React.FC<{frame: number; at: number; children: React.ReactNode}> = ({frame, at, children}) => {
  const p = prog(frame, at, 24, EASE.out);
  return (
    <div
      style={{
        opacity: p,
        scale: String(mix(1.2, 1, p)),
        padding: '14px 34px 12px',
        borderRadius: 999,
        background:
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0) 4px), linear-gradient(115deg, #7d5f1c 0%, #c9a246 22%, #f3dc98 40%, #d2ad52 55%, #9c7726 78%, #c8a043 100%)',
        boxShadow: 'inset 0 2px 0 rgba(255,250,225,0.6), inset 0 -3px 0 rgba(60,40,5,0.45), 0 18px 40px rgba(0,0,0,0.6), 0 0 40px rgba(255,160,70,0.2)',
        ...fcaps(36, {color: '#4a3610', letterSpacing: '0.14em', textShadow: '0 1.5px 0 rgba(255,244,210,0.55)'}),
      }}
    >
      {children}
    </div>
  );
};

export const District: React.FC<SceneProps> = ({frame, cue}) => {
  const diamond = cue('diamond');
  const need = cue('need');
  const walk = cue('walk');
  const walkOut = cue('walk', 1);
  const grain = cue('grain');
  const not = cue('not');
  const ship = cue('ship');
  const anywhere = cue('anywhere');
  const p2 = need - 14;
  const p3 = not - 16;
  const out1 = prog(frame, p2 - 14, 16, EASE.in);
  const in2 = prog(frame, p2, 22);
  const out2 = prog(frame, p3 - 14, 16, EASE.in);
  const in3 = prog(frame, p3, 22);

  // Hyper-lapse: three time-lapse jumps, then a settle onto West 47th.
  const step = (at: number) => prog(frame, at, 32, EASE.inOut);
  const fly = 0.27 * step(12) + 0.27 * step(54) + 0.24 * step(96) + 0.22 * prog(frame, 140, diamond - 120, EASE.silk);
  const rush = [12, 54, 96].reduce((b, at) => b + Math.sin(Math.PI * Math.min(1, Math.max(0, (frame - at) / 32))), 0);
  const tilt = mix(24, 58, fly);
  const rot = mix(-70, -29, fly);
  const zoom = mix(0.44, 1.12, fly);

  // The bag drops under gravity and lands exactly on "grain".
  const t0 = grain - FALL;
  const fallT = Math.min(1, Math.max(0, (frame - t0) / FALL));
  const bagY = frame < grain ? -1300 * (1 - fallT * fallT) : 0;
  const since = frame - grain;
  const squash = since >= 0 ? Math.max(-0.35, Math.exp(-since / 5) * Math.cos(since / 2.6)) : 0;
  const shake = since >= 0 && since < 18 ? Math.exp(-since / 4) * Math.sin(since * 2.4) * 7 : 0;
  const near = frame < t0 ? 0 : frame < grain ? fallT * fallT : 1;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* —— 1: hyper-lapse —— */}
      {out1 < 1 ? (
        <AbsoluteFill style={{opacity: 1 - out1, filter: out1 > 0 ? `blur(${out1 * 10}px)` : undefined}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 55%, #1d1008 0%, #050405 75%)'}} />
          <AbsoluteFill style={{background: `radial-gradient(ellipse 55% 35% at 50% 56%, rgba(255,140,60,${0.12 + 0.08 * Math.sin(frame / 7)}) 0%, rgba(0,0,0,0) 70%)`}} />
          <div
            style={{
              position: 'absolute',
              left: 540 - MAP / 2,
              top: 1010 - MAP / 2,
              width: MAP,
              height: MAP,
              perspective: 1500,
              filter: rush > 0.05 ? `blur(${rush * 3.5}px)` : undefined,
              opacity: prog(frame, 0, 10),
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `rotateX(${tilt}deg) rotateZ(${rot}deg) scale(${zoom}) translate(${MAP / 2 - TARGET.x}px, ${MAP / 2 - TARGET.y}px)`,
              }}
            >
              <HyperlapseMap frame={frame} diamond={diamond} />
            </div>
          </div>
          <Pin frame={frame} at={diamond + 4} x={540} y={1010} size={1.1} />
          <div style={{position: 'absolute', top: 286, left: 0, right: 0, textAlign: 'center'}}>
            <div
              style={fcaps(60, {
                letterSpacing: '0.2em',
                opacity: prog(frame, cue('located') - 6, 14),
                translate: `0 ${(1 - prog(frame, cue('located') - 6, 24)) * 24}px`,
              })}
            >
              Right in the heart of
            </div>
            <div
              style={italic(104, {
                lineHeight: 1.08,
                marginTop: 10,
                opacity: prog(frame, diamond - 8, 14),
                translate: `0 ${(1 - prog(frame, diamond - 8, 24)) * 30}px`,
                filter: `blur(${(1 - prog(frame, diamond - 8, 20)) * 10}px)`,
              })}
            >
              <Metal frame={frame} gradient={MOLTEN_GRADIENT} sheenAt={diamond + 24} glow="rgba(255,140,60,0.35)">
                the Diamond District.
              </Metal>
            </div>
            <div style={fcaps(26, {marginTop: 22, letterSpacing: '0.34em', color: '#ffb46a', opacity: prog(frame, cue('district') + 10, 20)})}>
              New York · West 47th Street
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* —— 2: the showroom counter —— */}
      {in2 > 0 && out2 < 1 ? (
        <AbsoluteFill style={{opacity: in2 * (1 - out2), translate: `${shake * 0.4}px ${shake}px`, scale: String(mix(1.04, 1, in2)), filter: out2 > 0 ? `blur(${out2 * 10}px)` : undefined}}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #0d0907 0%, #140d08 50%, #070506 100%)'}} />
          <AbsoluteFill
            style={{
              background: 'repeating-linear-gradient(90deg, rgba(255,200,140,0.025) 0px, rgba(255,200,140,0.025) 2px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 90px)',
            }}
          />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 30% at 50% 42%, rgba(255,150,70,0.18) 0%, rgba(0,0,0,0) 70%)'}} />
          <Plaque frame={frame} at={cue('showroom') - 10} glint={cue('47thstreet')} x={540} y={760} scale={0.58} />
          <Counter frame={frame} />
          {/* Contact shadow grows as the bag comes down */}
          <div
            style={{
              position: 'absolute',
              left: 540 - BAG_W * 0.7,
              top: REST_Y - 26,
              width: BAG_W * 1.4,
              height: 52,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 70%)',
              opacity: near,
              scale: String(mix(1.6, 1, near)),
            }}
          />
          {/* Reflection in the glass */}
          {frame >= t0 ? (
            <div
              style={{
                position: 'absolute',
                left: 540 - BAG_W / 2,
                top: REST_Y - bagY * 0.35,
                width: BAG_W,
                height: BAG_H,
                transformOrigin: '50% 0%',
                scale: '1 -0.42',
                opacity: 0.16,
                maskImage: 'linear-gradient(0deg, rgba(0,0,0,0) 30%, black 100%)',
                WebkitMaskImage: 'linear-gradient(0deg, rgba(0,0,0,0) 30%, black 100%)',
              }}
            >
              <Bag squash={squash} />
            </div>
          ) : null}
          {frame >= t0 ? (
            <div style={{position: 'absolute', left: 540 - BAG_W / 2, top: REST_Y - BAG_H + bagY, width: BAG_W, height: BAG_H, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))'}}>
              <Bag squash={squash} />
            </div>
          ) : null}
          {/* Dust and a few loose beads on impact */}
          {since >= 0 && since < 50
            ? Array.from({length: 7}, (_, i) => {
                const a = (i / 7) * Math.PI + Math.PI;
                const r = 30 + (since / 50) * 170;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: 540 + Math.cos(a) * r * 1.3 - 40,
                      top: REST_Y - 30 + Math.sin(a) * r * 0.25,
                      width: 80,
                      height: 50,
                      borderRadius: '50%',
                      background: 'radial-gradient(ellipse at center, rgba(230,210,180,0.28) 0%, rgba(0,0,0,0) 70%)',
                      opacity: 1 - since / 50,
                    }}
                  />
                );
              })
            : null}
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <GrainDefs prefix="ds-b" />
            {since >= 0
              ? SPILL.map((s, i) => {
                  const age = Math.max(0, since - i * 2);
                  const x = 540 + (i - 2) * 40 + s.vx * Math.min(age, 40);
                  const yRaw = REST_Y - BAG_H + 40 + s.vy * age + 0.45 * age * age;
                  const y = Math.min(s.land, yRaw);
                  return <Bead key={i} g={{...s.grain, x, y, rot: s.grain.rot + Math.min(age, 40) * 8}} metal="silver" frame={frame} prefix="ds-b" shadow={y >= s.land} />;
                })
              : null}
          </svg>
          <div style={{position: 'absolute', top: 282, left: 0, right: 0, textAlign: 'center'}}>
            <div
              style={fcaps(132, {
                fontWeight: 700,
                opacity: prog(frame, need - 6, 12),
                scale: String(mix(1.15, 1, prog(frame, need - 6, 22))),
                textShadow: '0 0 40px rgba(255,140,60,0.35)',
              })}
            >
              Need it today?
            </div>
            <div style={{display: 'flex', justifyContent: 'center', gap: 30, marginTop: 18}}>
              <span style={fcaps(70, {color: '#dfe7f0', opacity: prog(frame, walk - 6, 12), translate: `0 ${(1 - prog(frame, walk - 6, 20)) * 24}px`})}>Walk in.</span>
              <span style={fcaps(70, {color: '#dfe7f0', opacity: prog(frame, walkOut - 6, 12), translate: `0 ${(1 - prog(frame, walkOut - 6, 20)) * 24}px`})}>Walk out</span>
            </div>
            <div style={fcaps(70, {marginTop: 8, color: '#dfe7f0', opacity: prog(frame, cue('with') - 6, 12)})}>
              with your{' '}
              <Metal frame={frame} gradient={ICE_GRADIENT} sheenAt={grain + 6} glow="rgba(220,232,245,0.35)">
                grain.
              </Metal>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* —— 3: shipping across the country —— */}
      {in3 > 0 ? (
        <AbsoluteFill style={{opacity: in3, scale: String(mix(1.04, 1, in3))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 60% at 50% 60%, #0d0b0c 0%, #050506 80%)'}} />
          <RouteMap frame={frame} reveal={not} ship={ship} anywhere={anywhere} />
          <div style={{position: 'absolute', top: 282, left: 0, right: 0, textAlign: 'center'}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 0, opacity: prog(frame, not - 6, 12) * (1 - prog(frame, ship - 14, 12, EASE.in))}}>
              <div style={fcaps(130, {fontWeight: 700})}>Not in New York?</div>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 0}}>
              <div style={fcaps(140, {fontWeight: 700, opacity: prog(frame, ship - 6, 12), scale: String(mix(1.15, 1, prog(frame, ship - 6, 22)))})}>We ship</div>
              <div style={{display: 'flex', justifyContent: 'center', gap: 24, marginTop: 26}}>
                <Chip frame={frame} at={cue('insured') - 6}>
                  Fully insured
                </Chip>
                <Chip frame={frame} at={cue('same') - 6}>
                  Same day
                </Chip>
              </div>
              <div
                style={italic(90, {
                  marginTop: 22,
                  opacity: prog(frame, anywhere - 8, 14),
                  translate: `0 ${(1 - prog(frame, anywhere - 8, 24)) * 24}px`,
                  filter: `blur(${(1 - prog(frame, anywhere - 8, 20)) * 8}px)`,
                })}
              >
                <Metal frame={frame} gradient={MOLTEN_GRADIENT} sheenAt={anywhere + 20} glow="rgba(255,140,60,0.35)">
                  anywhere in the country.
                </Metal>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
