import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE, mix, prog} from '../kit/theme';
import {CONDENSED} from './forge';

// The opening of "The Arsenal": a massive circular vault door. The wheel
// spins, the latch clangs, the bolts retract and the door swings out toward
// the camera on its left hinge while amber light floods through the gap.

export const VAULT = {x: 540, y: 960, hole: 472, door: 460};
export const VAULT_T = {spin: 15, clung: 63, swing: 69, swingDur: 63, push: 92, pushDur: 56, gone: 150};

const BOLTS = 14;
const RIVETS = 44;

const ring = (r: number) =>
  `M${VAULT.x - r} ${VAULT.y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

const Wall: React.FC<{leak: number}> = ({leak}) => {
  const {hole} = VAULT;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="av-wall" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#24262a" />
          <stop offset="0.45" stopColor="#141518" />
          <stop offset="1" stopColor="#0a0a0c" />
        </linearGradient>
        <pattern id="av-brush" width="1080" height="6" patternUnits="userSpaceOnUse">
          <rect width="1080" height="1" y="1" fill="rgba(255,255,255,0.025)" />
          <rect width="1080" height="1" y="4" fill="rgba(0,0,0,0.12)" />
        </pattern>
        <linearGradient id="av-bevel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9ced4" />
          <stop offset="0.35" stopColor="#5d636a" />
          <stop offset="0.7" stopColor="#1d1f23" />
          <stop offset="1" stopColor="#3b3f45" />
        </linearGradient>
        <radialGradient id="av-rivet" cx="0.38" cy="0.32" r="0.7">
          <stop offset="0" stopColor="#e8ecf0" />
          <stop offset="0.45" stopColor="#7d838b" />
          <stop offset="1" stopColor="#1a1c1f" />
        </radialGradient>
        <linearGradient id="av-hinge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a2d31" />
          <stop offset="0.35" stopColor="#a7adb4" />
          <stop offset="0.55" stopColor="#555a61" />
          <stop offset="1" stopColor="#17191c" />
        </linearGradient>
      </defs>
      <path d={`M-200 -200H1280V2120H-200Z ${ring(hole)}`} fill="url(#av-wall)" fillRule="evenodd" />
      <path d={`M-200 -200H1280V2120H-200Z ${ring(hole)}`} fill="url(#av-brush)" fillRule="evenodd" />
      {/* Machined frame around the opening */}
      <circle cx={VAULT.x} cy={VAULT.y} r={hole + 34} fill="none" stroke="url(#av-bevel)" strokeWidth={62} />
      <circle cx={VAULT.x} cy={VAULT.y} r={hole + 2} fill="none" stroke="#08090a" strokeWidth={5} />
      <circle cx={VAULT.x} cy={VAULT.y} r={hole + 66} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />
      {/* Bolt receivers */}
      {Array.from({length: BOLTS}, (_, i) => {
        const a = (i / BOLTS) * 360 + 360 / BOLTS / 2;
        return (
          <g key={i} transform={`translate(${VAULT.x} ${VAULT.y}) rotate(${a})`}>
            <rect x={hole + 4} y={-19} width={50} height={38} rx={6} fill="#0b0c0e" stroke="#3a3e44" strokeWidth={1.5} />
          </g>
        );
      })}
      {Array.from({length: RIVETS}, (_, i) => {
        const a = (i / RIVETS) * Math.PI * 2;
        return <circle key={i} cx={VAULT.x + Math.cos(a) * (hole + 84)} cy={VAULT.y + Math.sin(a) * (hole + 84)} r={6} fill="url(#av-rivet)" />;
      })}
      {/* Hinge block on the left */}
      {[-150, 110].map((dy) => (
        <g key={dy}>
          <rect x={VAULT.x - hole - 92} y={VAULT.y + dy} width={120} height={40} rx={8} fill="url(#av-hinge)" stroke="#0c0d0f" strokeWidth={2} />
          <rect x={VAULT.x - hole - 74} y={VAULT.y + dy - 18} width={34} height={76} rx={14} fill="url(#av-hinge)" stroke="#0c0d0f" strokeWidth={2} />
        </g>
      ))}
      {/* Amber light leaking around the door edge */}
      <circle
        cx={VAULT.x}
        cy={VAULT.y}
        r={hole - 6}
        fill="none"
        stroke={`rgba(255,170,80,${0.35 * leak})`}
        strokeWidth={10}
        style={{filter: `drop-shadow(0 0 ${10 + 30 * leak}px rgba(255,150,60,${0.9 * leak}))`}}
      />
    </svg>
  );
};

const DoorFace: React.FC<{frame: number}> = ({frame}) => {
  const R = VAULT.door;
  const spin = 540 * prog(frame, VAULT_T.spin, VAULT_T.clung - VAULT_T.spin, EASE.in);
  const retract = prog(frame, VAULT_T.clung, 13, EASE.out);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 36% 30%, rgba(255,255,255,0.2), rgba(255,255,255,0) 42%), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0) 4px), conic-gradient(from 200deg, #4c5157, #959ba2, #3f4348, #868c93, #4e5359, #a3a9af, #43474c, #7f858c, #4c5157)',
          boxShadow: 'inset 0 0 0 7px #1f2226, inset 0 0 70px rgba(0,0,0,0.75), 0 0 0 2px #090a0b',
          filter: 'brightness(0.78) contrast(1.08)',
        }}
      />
      <svg width={2 * R} height={2 * R} viewBox={`${-R} ${-R} ${2 * R} ${2 * R}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="dv-bevel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#dfe3e7" />
            <stop offset="0.4" stopColor="#6a7077" />
            <stop offset="1" stopColor="#15171a" />
          </linearGradient>
          <linearGradient id="dv-bevel-in" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#d4d9de" />
            <stop offset="0.45" stopColor="#5b6168" />
            <stop offset="1" stopColor="#111315" />
          </linearGradient>
          <linearGradient id="dv-bolt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2f5f8" />
            <stop offset="0.3" stopColor="#b9c0c7" />
            <stop offset="0.65" stopColor="#5c626a" />
            <stop offset="1" stopColor="#1e2125" />
          </linearGradient>
          <radialGradient id="dv-hub" cx="0.38" cy="0.32" r="0.75">
            <stop offset="0" stopColor="#f5f7f9" />
            <stop offset="0.35" stopColor="#9aa1a8" />
            <stop offset="1" stopColor="#202327" />
          </radialGradient>
          <path id="dv-text" d={`M${-330} 0 a330 330 0 1 1 660 0 a330 330 0 1 1 -660 0`} />
        </defs>
        {/* Locking bolts */}
        {Array.from({length: BOLTS}, (_, i) => {
          const a = (i / BOLTS) * 360 + 360 / BOLTS / 2;
          const r0 = mix(R - 18, R - 82, retract);
          return (
            <g key={i} transform={`rotate(${a})`}>
              <rect x={r0} y={-15} width={74} height={30} rx={13} fill="url(#dv-bolt)" stroke="#0e1012" strokeWidth={1.5} />
              <rect x={r0 + 6} y={-11} width={60} height={5} rx={2.5} fill="rgba(255,255,255,0.45)" />
            </g>
          );
        })}
        <circle r={R - 30} fill="none" stroke="url(#dv-bevel)" strokeWidth={10} />
        <circle r={R - 100} fill="none" stroke="url(#dv-bevel-in)" strokeWidth={6} />
        <circle r={R - 112} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
        <circle r={265} fill="rgba(0,0,0,0.18)" stroke="url(#dv-bevel)" strokeWidth={8} />
        <text fill="rgba(225,230,236,0.45)" fontFamily={CONDENSED} fontWeight={500} fontSize={26} letterSpacing={12}>
          <textPath href="#dv-text" startOffset="0">
            BULLION TRADING LLC · 20 WEST 47TH STREET · NEW YORK · BULLION TRADING LLC ·
          </textPath>
        </text>
        {Array.from({length: 28}, (_, i) => {
          const a = (i / 28) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * (R - 64)} cy={Math.sin(a) * (R - 64)} r={7} fill="url(#dv-hub)" stroke="#0c0d0f" strokeWidth={1} />;
        })}
        {/* Handle wheel */}
        <g transform={`rotate(${spin})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <rect x={30} y={-11} width={185} height={22} rx={11} fill="url(#dv-bolt)" stroke="#0e1012" strokeWidth={1.5} />
              <circle cx={232} r={24} fill="url(#dv-hub)" stroke="#0e1012" strokeWidth={2} />
            </g>
          ))}
          <circle r={190} fill="none" stroke="url(#dv-bolt)" strokeWidth={18} />
          <circle r={190} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth={1.5} />
          <circle r={62} fill="url(#dv-hub)" stroke="#0e1012" strokeWidth={3} />
          <circle r={22} fill="#15171a" stroke="#9aa1a8" strokeWidth={2} />
        </g>
      </svg>
    </div>
  );
};

export const VaultDoor: React.FC<{frame: number}> = ({frame}) => {
  const k = frame - VAULT_T.clung;
  const shake = k >= 0 ? Math.exp(-k / 9) : 0;
  const dx = 7 * shake * Math.sin(k * 2.1);
  const dy = 5 * shake * Math.cos(k * 2.7);
  const swing = prog(frame, VAULT_T.swing, VAULT_T.swingDur, EASE.inOut);
  const push = prog(frame, VAULT_T.push, VAULT_T.pushDur, EASE.in);
  const scale = mix(1, 3.1, push);
  const leak = Math.min(1, 0.25 + (k >= 0 ? Math.exp(-k / 12) * 0.9 : 0) + swing);
  if (frame > VAULT_T.gone) {
    return null;
  }
  return (
    <AbsoluteFill style={{translate: `${dx}px ${dy}px`, scale: String(scale), transformOrigin: `${VAULT.x}px ${VAULT.y}px`}}>
      {/* Rays streaming through the opening door */}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: swing * (1 - push * 0.6)}}>
        {Array.from({length: 9}, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: VAULT.x - 40,
              top: VAULT.y - 1400,
              width: 80 + (i % 3) * 50,
              height: 2800,
              transformOrigin: '50% 50%',
              rotate: `${-60 + i * 15 + Math.sin(frame / 40 + i) * 2}deg`,
              background: 'linear-gradient(180deg, rgba(255,170,80,0) 0%, rgba(255,170,80,0.22) 40%, rgba(255,200,120,0.34) 50%, rgba(255,170,80,0.22) 60%, rgba(255,170,80,0) 100%)',
              maskImage: 'linear-gradient(90deg, transparent, black 50%, transparent)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, black 50%, transparent)',
            }}
          />
        ))}
      </AbsoluteFill>
      <Wall leak={leak} />
      <div style={{position: 'absolute', inset: 0, perspective: 2200, perspectiveOrigin: `${VAULT.x}px ${VAULT.y}px`}}>
        <div
          style={{
            position: 'absolute',
            left: VAULT.x - VAULT.door,
            top: VAULT.y - VAULT.door,
            width: VAULT.door * 2,
            height: VAULT.door * 2,
            transformStyle: 'preserve-3d',
            transformOrigin: '0% 50%',
            transform: `rotateY(${-84 * swing}deg)`,
          }}
        >
          {Array.from({length: 9}, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 6,
                borderRadius: '50%',
                background: i % 3 === 0 ? '#3a3e44' : '#22252a',
                transform: `translateZ(${-(i + 1) * 10}px)`,
              }}
            />
          ))}
          <div style={{position: 'absolute', inset: 0, transform: 'translateZ(0px)'}}>
            <DoorFace frame={frame} />
          </div>
        </div>
      </div>
      {/* Bloom at the moment the latch gives */}
      <AbsoluteFill
        style={{
          mixBlendMode: 'screen',
          background: `radial-gradient(circle at ${VAULT.x}px ${VAULT.y}px, rgba(255,190,110,${0.5 * swing}) 0%, rgba(255,150,60,${0.22 * swing}) 30%, rgba(0,0,0,0) 62%)`,
        }}
      />
    </AbsoluteFill>
  );
};
