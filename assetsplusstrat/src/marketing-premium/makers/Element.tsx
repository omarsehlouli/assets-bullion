import type React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {italic, Metal, Rise} from '../kit/Text';
import {EASE, mix, prog, type SceneProps} from '../kit/theme';
import {caps, Embers, F, HeatHaze, MOLTEN_GRADIENT} from './forge';
import {Falling, GrainDefs, pile, Beads, stream} from './Grain';

// Scene 1 — The Raw Element. A graphite crucible of molten gold is tilted by
// steel tongs and poured in slow motion; the camera follows the stream down
// into a water quench where the metal breaks into casting grain.

const FPS = 60;
const s = (sec: number) => Math.round(sec * FPS);

// World coordinates (the camera pans down the world).
const CRUCIBLE = {x: 540, y: 1000};
const WATER_Y = 2060;
const CAMERA_END = 1060;
const BED_Y = 2440;

const CLAMP_AT = s(2.2);
const TILT_START = s(2.6);
const TILT_END = s(3.7);
const POUR_AT = s(3.3);
const PAN_START = s(5.7);
const PAN_END = s(7.4);
const SPLASH = s(7.2);

const rotate = (x: number, y: number, deg: number) => {
  const r = (deg * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)] as const;
};

const BUBBLES = Array.from({length: 22}, (_, i) => ({
  x: (random(`bx${i}`) - 0.5) * 300,
  y: (random(`by${i}`) - 0.5) * 70,
  period: 40 + random(`bp${i}`) * 70,
  phase: random(`bf${i}`) * 200,
  size: 6 + random(`bs${i}`) * 16,
}));

const Crucible: React.FC<{frame: number; tilt: number; clamp: number; heat: number}> = ({frame, tilt, clamp, heat}) => {
  const flick = 0.9 + 0.1 * Math.sin(frame / 3.1) * Math.sin(frame / 7.3);
  return (
    <g transform={`translate(${CRUCIBLE.x} ${CRUCIBLE.y}) rotate(${tilt})`}>
      <defs>
        <linearGradient id="cr-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2601c" />
          <stop offset="0.12" stopColor="#a8380e" />
          <stop offset="0.38" stopColor="#4a1a0c" />
          <stop offset="0.7" stopColor="#1c1212" />
          <stop offset="1" stopColor="#100c0d" />
        </linearGradient>
        <linearGradient id="cr-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.7" />
          <stop offset="0.38" stopColor="#000" stopOpacity="0" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000" stopOpacity="0.65" />
        </linearGradient>
        <radialGradient id="cr-bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff2c0" stopOpacity="0.9" />
          <stop offset="0.4" stopColor="#ffb04a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff6a1a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cr-melt" cx="50%" cy="50%" r="55%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#fff0b0" />
          <stop offset="0.7" stopColor="#ffa83a" />
          <stop offset="0.88" stopColor="#d4460c" />
          <stop offset="1" stopColor="#6a1604" />
        </radialGradient>
        <radialGradient id="cr-blob" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff2b8" stopOpacity="0" />
        </radialGradient>
        <clipPath id="cr-mouth">
          <ellipse cx={0} cy={-180} rx={196} ry={52} />
        </clipPath>
      </defs>
      {/* Body: graphite glowing red-hot toward the lip */}
      <path d="M-215 -180 C-212 -40 -196 110 -160 160 Q0 212 160 160 C196 110 212 -40 215 -180 Z" fill="url(#cr-body)" opacity={0.35 + 0.65 * heat} />
      <path d="M-215 -180 C-212 -40 -196 110 -160 160 Q0 212 160 160 C196 110 212 -40 215 -180 Z" fill="url(#cr-shade)" />
      <path
        d="M-215 -180 C-212 -40 -196 110 -160 160 Q0 212 160 160 C196 110 212 -40 215 -180"
        fill="none"
        stroke={`rgba(255,120,40,${0.5 * heat})`}
        strokeWidth={6}
        style={{filter: 'blur(5px)'}}
      />
      {/* Lip */}
      <ellipse cx={0} cy={-180} rx={219} ry={63} fill="#c2470f" opacity={heat} />
      <ellipse cx={0} cy={-180} rx={219} ry={63} fill="none" stroke="#ffcf7a" strokeWidth={2.5} opacity={heat} />
      <ellipse cx={0} cy={-178} rx={204} ry={55} fill="#3a1206" />
      {/* Molten surface, kept level as the crucible tips */}
      <g clipPath="url(#cr-mouth)">
        <g transform={`translate(0 -180) rotate(${-tilt}) translate(0 180)`}>
          <ellipse cx={0} cy={-176} rx={260} ry={80} fill="url(#cr-melt)" opacity={heat * flick} />
          {[0, 1, 2].map((k) => (
            <ellipse
              key={k}
              cx={Math.sin(frame / (40 + k * 13) + k * 2) * 90}
              cy={-180 + Math.cos(frame / (55 + k * 9) + k) * 18}
              rx={70 + k * 20}
              ry={20 + k * 4}
              fill="url(#cr-blob)"
              opacity={0.5 * heat}
            />
          ))}
          {BUBBLES.map((b, i) => {
            const t = ((frame + b.phase) % b.period) / b.period;
            const grow = Math.min(1, t / 0.8);
            const pop = t > 0.8 ? (t - 0.8) / 0.2 : 0;
            return (
              <g key={i} opacity={heat}>
                <circle cx={b.x} cy={-180 + b.y} r={b.size * grow * (1 - pop * 0.3)} fill="#ffe7a0" opacity={0.75 * (1 - pop)} />
                <circle cx={b.x - b.size * 0.3 * grow} cy={-180 + b.y - b.size * 0.3 * grow} r={b.size * 0.25 * grow} fill="#fff" opacity={0.8 * (1 - pop)} />
                {pop > 0 ? <circle cx={b.x} cy={-180 + b.y} r={b.size * (1 + pop * 1.6)} fill="none" stroke="#fff4c8" strokeWidth={2} opacity={1 - pop} /> : null}
              </g>
            );
          })}
        </g>
      </g>
      {/* Tongs: a steel band around the body and a long shank off to the right */}
      <g transform={`translate(0 ${-70}) scale(${1 - clamp * 0.02} 1)`}>
        <path d="M-214 -12 Q0 34 214 -12" fill="none" stroke="#17181a" strokeWidth={15} />
        <path d="M-214 -12 Q0 34 214 -12" fill="none" stroke="#a7aeb6" strokeWidth={2} transform="translate(0 -5)" />
        <path d="M-214 -12 Q0 34 214 -12" fill="none" stroke={`rgba(255,140,50,${0.55 * heat})`} strokeWidth={1.5} transform="translate(0 6)" />
        <circle cx={214} cy={-12} r={13} fill="#202225" stroke="#9aa1a9" strokeWidth={2} />
        <circle cx={-214} cy={-12} r={9} fill="#202225" stroke="#6b7179" strokeWidth={1.5} />
      </g>
      <ellipse cx={0} cy={-200} rx={300} ry={130} fill="url(#cr-bloom)" opacity={0.55 * heat * flick} style={{mixBlendMode: 'screen'}} />
    </g>
  );
};

// The shank of the tongs, gripped from off-frame right; it follows the tilt.
const Shank: React.FC<{tilt: number; clamp: number}> = ({tilt, clamp}) => {
  const [hx, hy] = rotate(212, -80, tilt);
  const x = CRUCIBLE.x + hx;
  const y = CRUCIBLE.y + hy;
  const angle = -12 + tilt * 0.35 - clamp * 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <defs>
        <linearGradient id="shank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9aa1a9" />
          <stop offset="0.25" stopColor="#4a4e54" />
          <stop offset="0.7" stopColor="#1d1f22" />
          <stop offset="1" stopColor="#0b0c0d" />
        </linearGradient>
      </defs>
      <rect x={0} y={-15} width={900} height={30} rx={8} fill="url(#shank)" />
      <rect x={0} y={-13} width={900} height={3} fill="rgba(255,170,90,0.35)" />
      <rect x={40} y={-24} width={22} height={48} rx={6} fill="#2b2d31" stroke="#7d848c" strokeWidth={1.5} />
    </g>
  );
};

const spoutWorld = (tilt: number) => {
  const [dx, dy] = rotate(-214, -182, tilt);
  return [CRUCIBLE.x + dx, CRUCIBLE.y + dy] as const;
};

// A tapered stream of molten metal from the spout down to `toY`.
const Stream: React.FC<{frame: number; from: readonly [number, number]; toY: number; width: number}> = ({frame, from, toY, width}) => {
  const [sx, sy] = from;
  if (toY <= sy + 4) {
    return null;
  }
  const n = 36;
  const pts = Array.from({length: n + 1}, (_, i) => {
    const t = i / n;
    const y = sy + (toY - sy) * t;
    const drop = (y - sy) / 900;
    const x = sx - 34 * (1 - Math.exp(-drop * 3)) + Math.sin(y / 70 - frame / 4) * 2.2 * Math.min(1, drop * 4);
    const w = width * (1.25 - 0.45 * Math.min(1, drop * 1.4));
    return {x, y, w};
  });
  const left = pts.map((p) => `${p.x - p.w / 2} ${p.y}`);
  const right = pts.map((p) => `${p.x + p.w / 2} ${p.y}`).reverse();
  const body = `M${left.join(' L')} L${right.join(' L')} Z`;
  const center = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  return (
    <g>
      <defs>
        <linearGradient id="stream-x" gradientUnits="userSpaceOnUse" x1={sx - 30} y1={0} x2={sx + 10} y2={0}>
          <stop offset="0" stopColor="#a8320a" />
          <stop offset="0.3" stopColor="#ff9a3c" />
          <stop offset="0.5" stopColor="#fff7dc" />
          <stop offset="0.7" stopColor="#ffbf55" />
          <stop offset="1" stopColor="#a8320a" />
        </linearGradient>
      </defs>
      <path d={center} fill="none" stroke="rgba(255,120,40,0.3)" strokeWidth={width * 2.6} strokeLinecap="round" style={{filter: 'blur(12px)'}} />
      <path d={body} fill="url(#stream-x)" />
      <circle cx={pts[n].x} cy={pts[n].y} r={pts[n].w * 0.62} fill="#ffd27a" />
      <circle cx={pts[n].x - pts[n].w * 0.15} cy={pts[n].y - pts[n].w * 0.12} r={pts[n].w * 0.3} fill="#fff8e0" />
      <path d={center} fill="none" stroke="#fffbe9" strokeWidth={width * 0.28} opacity={0.55} />
      <path d={center} fill="none" stroke="#ffffff" strokeWidth={width * 0.16} strokeDasharray="70 40 20 90" strokeDashoffset={-frame * 9} opacity={0.35} style={{filter: 'blur(1.5px)'}} />
    </g>
  );
};

const STEAM = Array.from({length: 26}, (_, i) => ({
  delay: random(`st${i}`) * 200,
  x: (random(`sx${i}`) - 0.5) * 220,
  drift: (random(`sd${i}`) - 0.5) * 120,
  size: 60 + random(`ss${i}`) * 120,
}));

const SPLASH_SPARKS = Array.from({length: 40}, (_, i) => ({
  vx: (random(`kx${i}`) - 0.5) * 16,
  vy: -6 - random(`ky${i}`) * 12,
  delay: random(`kd${i}`) * 220,
  life: 26 + random(`kl${i}`) * 26,
}));

const BED = pile('bed', {cx: 300, base: BED_Y + 40, width: 640, height: 90, count: 120, rMin: 7, rMax: 14, perspective: 0.6});

const SINKING = stream('sink', {count: 150, start: SPLASH + 2, duration: 220, x: 280, y: WATER_Y + 40, spread: 50, vx: 0, vxJitter: 2.2, vy: 2.2, rMin: 6, rMax: 13});

const Water: React.FC<{frame: number; impactX: number; flowing: boolean}> = ({frame, impactX, flowing}) => {
  const since = frame - SPLASH;
  return (
    <g>
      <defs>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a160b" />
          <stop offset="0.06" stopColor="#0f0d10" />
          <stop offset="1" stopColor="#030405" />
        </linearGradient>
        <radialGradient id="water-glow" cx="50%" cy="0%" r="70%">
          <stop offset="0" stopColor="rgba(255,150,60,0.55)" />
          <stop offset="1" stopColor="rgba(255,150,60,0)" />
        </radialGradient>
        <clipPath id="under">
          <rect x={-100} y={WATER_Y} width={1300} height={1200} />
        </clipPath>
      </defs>
      <rect x={-100} y={WATER_Y} width={1300} height={1200} fill="url(#water)" />
      <g clipPath="url(#under)">
        <ellipse cx={impactX} cy={WATER_Y} rx={460} ry={170} fill="url(#water-glow)" opacity={since > 0 ? 1 : 0.35} />
        {Array.from({length: 7}, (_, k) => (
          <line
            key={`w${k}`}
            x1={impactX - 380 + ((k * 137) % 300)}
            x2={impactX - 200 + ((k * 211) % 520)}
            y1={WATER_Y + 8 + k * 9}
            y2={WATER_Y + 8 + k * 9}
            stroke="rgba(255,170,90,0.22)"
            strokeWidth={1.5}
            transform={`translate(${Math.sin(frame / 20 + k) * 14} 0)`}
          />
        ))}
      </g>
      {/* Surface line and ripples */}
      <line x1={-100} x2={1300} y1={WATER_Y} y2={WATER_Y} stroke="rgba(255,190,120,0.45)" strokeWidth={2} />
      {since > 0
        ? Array.from({length: 6}, (_, k) => {
            const t = ((since + k * 22) % 132) / 132;
            return (
              <ellipse
                key={k}
                cx={impactX}
                cy={WATER_Y + 2}
                rx={30 + t * 460}
                ry={(30 + t * 460) * 0.12}
                fill="none"
                stroke="rgba(255,190,120,0.8)"
                strokeWidth={2.5 * (1 - t)}
                opacity={1 - t}
              />
            );
          })
        : null}
      <g clipPath="url(#under)">
        {/* Under the surface the stream breaks into glowing droplets that cool into grain */}
        {flowing && since > 0 ? (
          <path d={`M${impactX} ${WATER_Y} L${impactX - 6} ${WATER_Y + 90}`} stroke="#ffcf6a" strokeWidth={12} strokeLinecap="round" opacity={0.85} style={{filter: 'blur(3px)'}} />
        ) : null}
        <Beads grains={BED} metal="gold" frame={frame} prefix="el" reveal={prog(frame, SPLASH + 40, 200, EASE.out)} />
        <Falling
          fallers={SINKING}
          frame={frame}
          metal="gold"
          gravity={0.06}
          prefix="el"
          land={(x) => BED_Y + Math.abs(Math.sin(x / 37)) * 30}
          heat={(age) => Math.max(0, 1 - age / 80)}
        />
      </g>
    </g>
  );
};

export const Element: React.FC<SceneProps> = ({frame, cue}) => {
  const glow = prog(frame, 0, 40, EASE.out);
  const clamp = prog(frame, CLAMP_AT, 10, EASE.out);
  const tilt = -36 * prog(frame, TILT_START, TILT_END - TILT_START, EASE.inOut) - 4 * prog(frame, TILT_END, 200, EASE.inOut);
  const pan = prog(frame, PAN_START, PAN_END - PAN_START, EASE.inOut);
  const camera = pan * CAMERA_END;
  const spout = spoutWorld(tilt);
  // Slow-motion pour: the head of the stream reaches the water exactly at SPLASH.
  const fall = prog(frame, POUR_AT, SPLASH - POUR_AT, (t) => t * t * 0.55 + t * 0.45);
  const head = spout[1] + (WATER_Y - spout[1]) * fall;
  const flowing = frame >= POUR_AT;
  const widthIn = prog(frame, POUR_AT, 24);
  const jolt = clamp > 0 && clamp < 1 ? Math.sin(clamp * Math.PI * 3) * 3 : 0;
  const impactX = spout[0] - 34 * (1 - Math.exp(-((WATER_Y - spout[1]) / 900) * 3));

  const outrageous = cue('outrageous');
  const milling = cue('milling');
  const slam = prog(frame, milling - 2, 14, EASE.out);
  const shake = frame > milling && frame < milling + 20 ? (random(`sh${frame}`) - 0.5) * 12 * (1 - (frame - milling) / 20) : 0;

  return (
    <AbsoluteFill style={{backgroundColor: F.black, overflow: 'hidden'}}>
      <HeatHaze frame={frame} id="el-haze" strength={9 * (1 - pan)} />
      {/* Hot light from the crucible / the quench */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at ${(CRUCIBLE.x / 1080) * 100}% ${((CRUCIBLE.y - 180 - camera) / 1920) * 100}%, rgba(255,140,50,${0.55 * glow}) 0%, rgba(255,90,30,${0.16 * glow}) 45%, rgba(0,0,0,0) 75%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1080,
          height: 3200,
          translate: `${shake * 0.6}px ${-camera + jolt + shake}px`,
          filter: pan < 0.98 ? 'url(#el-haze)' : undefined,
        }}
      >
        <svg width={1080} height={3200} viewBox="0 0 1080 3200" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <GrainDefs prefix="el" />
          <Water frame={frame} impactX={impactX} flowing={flowing} />
          {flowing ? <Stream frame={frame} from={spout} toY={Math.min(head, WATER_Y)} width={36 * widthIn} /> : null}
          <Shank tilt={tilt} clamp={clamp} />
          <g opacity={glow}>
            <Crucible frame={frame} tilt={tilt} clamp={clamp} heat={glow} />
          </g>
          {/* Sparks thrown up by the quench */}
          {SPLASH_SPARKS.map((k, i) => {
            const age = frame - SPLASH - (k.delay % 200);
            if (age < 0 || age > k.life || frame < SPLASH) {
              return null;
            }
            const x = impactX + k.vx * age;
            const y = WATER_Y + k.vy * age + 0.35 * age * age;
            return <circle key={i} cx={x} cy={y} r={2.4} fill="#ffe2a0" opacity={1 - age / k.life} />;
          })}
        </svg>
        {/* Steam */}
        {frame > SPLASH
          ? STEAM.map((p, i) => {
              const age = (frame - SPLASH + p.delay) % 220;
              const t = age / 220;
              const burst = frame - SPLASH < 40 ? 1.6 : 1;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: impactX + p.x + p.drift * t - p.size,
                    top: WATER_Y - 40 - t * 520 - p.size,
                    width: p.size * 2 * (0.6 + t),
                    height: p.size * 2 * (0.6 + t),
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(235,225,215,0.22) 0%, rgba(235,225,215,0) 70%)',
                    opacity: Math.sin(Math.PI * t) * burst,
                  }}
                />
              );
            })
          : null}
      </div>
      <Embers frame={frame} heat={mix(0.9, 0.5, pan)} originY={mix(900, 1100, pan)} />

      {/* Title, before the voice */}
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}>
        <Rise frame={frame} at={s(0.7)} out={s(2.55)} dur={40}>
          <div style={caps(26, {letterSpacing: '0.42em', color: F.amber, fontWeight: 500})}>Bullion Trading LLC · For the trade</div>
        </Rise>
        <Rise frame={frame} at={s(0.95)} out={s(2.55)} dur={44}>
          <div style={caps(150, {marginTop: 22, letterSpacing: '0.04em'})}>The Maker&apos;s</div>
        </Rise>
        <Rise frame={frame} at={s(1.15)} out={s(2.55)} dur={44}>
          <div style={italic(190, {lineHeight: 0.95})}>
            <Metal frame={frame} gradient={MOLTEN_GRADIENT} sheenAt={s(1.4)} glow="rgba(255,120,40,0.45)">
              Edge.
            </Metal>
          </div>
        </Rise>
      </div>

      {/* Voice beat 1 */}
      <div style={{position: 'absolute', top: 300, left: 80, right: 80, textAlign: 'center'}}>
        <div style={caps(96)}>
          {['You', "don't", 'build', 'a', 'masterpiece'].map((w, i) => (
            <Rise key={w} inline frame={frame} at={cue(w) - 4} out={cue('And') - 14} style={{marginRight: i < 4 ? 22 : 0}}>
              {w}
            </Rise>
          ))}
        </div>
        <Rise frame={frame} at={cue('on') - 4} out={cue('And') - 14}>
          <div style={italic(132, {lineHeight: 1.08})}>
            <Metal frame={frame} gradient={MOLTEN_GRADIENT} sheenAt={cue('foundations')} glow="rgba(255,120,40,0.4)">
              on weak foundations.
            </Metal>
          </div>
        </Rise>
      </div>

      {/* Voice beat 2 — right-aligned so the stream stays clear */}
      <div style={{position: 'absolute', top: 290, left: 360, right: 70, textAlign: 'right'}}>
        <Rise frame={frame} at={cue('And') - 4} out={outrageous - 16}>
          <div style={caps(78, {lineHeight: 1.02})}>
            And you don&apos;t scale
            <br />a jewelry business
          </div>
        </Rise>
      </div>
      <div style={{position: 'absolute', top: 290, left: 340, right: 70, textAlign: 'right', translate: `${shake}px 0`}}>
        <Rise frame={frame} at={cue('paying') - 4}>
          <div style={caps(44, {color: F.amber, letterSpacing: '0.18em'})}>By paying</div>
        </Rise>
        <Rise frame={frame} at={outrageous - 4} dur={24}>
          <div style={caps(128, {marginTop: 8, textShadow: '0 0 40px rgba(255,120,40,0.55)'})}>Outrageous</div>
        </Rise>
        <div
          style={{
            ...caps(150, {color: '#ff5a3c', lineHeight: 0.92, textShadow: '0 0 50px rgba(255,59,48,0.65)'}),
            opacity: slam,
            scale: String(mix(1.35, 1, slam)),
            transformOrigin: '100% 50%',
            filter: slam < 1 ? `blur(${(1 - slam) * 10}px)` : undefined,
          }}
        >
          Milling
          <br />
          fees.
        </div>
      </div>
    </AbsoluteFill>
  );
};
