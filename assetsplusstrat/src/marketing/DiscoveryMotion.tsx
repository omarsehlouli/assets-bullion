import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  C,
  DISPLAY,
  SANS,
  cue,
  ease,
  pop,
  type MotionSceneProps,
} from "./motion-kit";

const art = (name: string) => staticFile(`marketing/images/${name}`);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const short = (frame: number, at = 0, duration = 15) =>
  ease(frame, at, duration);

const Label: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  color?: string;
  size?: number;
  opacity?: number;
}> = ({ children, x, y, color = C.muted, size = 23, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      color,
      fontFamily: SANS,
      fontSize: size,
      fontWeight: 700,
      letterSpacing: 3,
      opacity,
    }}
  >
    {children}
  </div>
);

const Title: React.FC<{
  lines: string[];
  frame: number;
  accent?: number;
  y?: number;
  size?: number;
}> = ({ lines, frame, accent = 1, y = 360, size = 118 }) => (
  <div
    style={{
      position: "absolute",
      left: 85,
      top: y,
      width: 910,
      fontFamily: DISPLAY,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 0.96,
      letterSpacing: -2.5,
    }}
  >
    {lines.map((line, i) => (
      <div key={line} style={{ overflow: "hidden", paddingBottom: 8 }}>
        <div
          style={{
            color: i === accent ? C.gold : C.text,
            transform: `translateY(${(1 - short(frame + 6, 3 + i * 4, 15)) * 120}%)`,
          }}
        >
          {line}
        </div>
      </div>
    ))}
  </div>
);

const Draw: React.FC<{
  d: string;
  p: number;
  color?: string;
  width?: number;
  dashed?: boolean;
}> = ({ d, p, color = C.cyan, width = 3, dashed }) => (
  <path
    d={d}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={dashed ? ".02 .025" : 1}
    strokeDashoffset={dashed ? -p * 0.5 : 1 - Math.min(1, p)}
    opacity={p > 0 ? 1 : 0}
  />
);

const Target: React.FC<{
  x: number;
  y: number;
  size: number;
  progress: number;
  frame: number;
  color?: string;
}> = ({ x, y, size, progress, frame, color = C.gold }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      opacity: Math.min(1, progress * 2),
      transform: `scale(${1.25 - progress * 0.25}) rotate(${(1 - progress) * 24}deg)`,
    }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ overflow: "visible" }}
    >
      {[0, 90, 180, 270].map((r) => (
        <path
          key={r}
          d="M 5 42 L 5 5 L 42 5"
          fill="none"
          stroke={color}
          strokeWidth={2.3}
          transform={`rotate(${r} 100 100)`}
        />
      ))}
      <circle
        cx={100}
        cy={100}
        r={92}
        fill="none"
        stroke={color}
        strokeOpacity={0.18}
        strokeWidth={0.8}
        strokeDasharray="3 6"
        transform={`rotate(${frame * 0.8} 100 100)`}
      />
    </svg>
  </div>
);

const Photo: React.FC<{
  name: string;
  x: number;
  y: number;
  size: number;
  p?: number;
  rotate?: number;
  round?: boolean;
  glow?: string;
  scale?: number;
}> = ({ name, x, y, size, p = 1, rotate = 0, round, glow, scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: round ? "50%" : 24,
      background: "#fff",
      overflow: "hidden",
      boxShadow: glow
        ? `0 0 0 2px ${glow}, 0 22px 70px ${glow}25`
        : "0 25px 50px #0006",
      opacity: Math.min(1, p * 2),
      transform: `translateY(${(1 - p) * 100}px) scale(${(0.8 + p * 0.2) * scale}) rotate(${rotate + (1 - p) * -12}deg)`,
    }}
  >
    <Img
      src={art(name)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        padding: round ? size * 0.055 : size * 0.025,
        boxSizing: "border-box",
      }}
    />
  </div>
);

const Hook: React.FC<MotionSceneProps> = ({ timing, frame, fps }) => {
  const goldAt = cue(timing, "gold", fps);
  const silverAt = cue(timing, "silver", fps);
  const closerAt = cue(timing, "closer", fps);
  const gold = pop(frame, goldAt - 3, fps);
  const silver = pop(frame, silverAt - 3, fps);
  const focus = short(frame, closerAt - 3, 16);
  return (
    <AbsoluteFill>
      <Label x={88} y={313} color={C.cyan}>
        YOUR COLLECTION STARTS HERE
      </Label>
      <Title lines={["YOUR FIRST", "PIECE."]} frame={frame} size={144} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${-focus * 12}px) scale(${1 + focus * 0.028})`,
          transformOrigin: "540px 1030px",
        }}
      >
        <svg
          width={1080}
          height={1440}
          style={{ position: "absolute", inset: 0 }}
        >
          <circle
            cx={525}
            cy={1030}
            r={320}
            stroke={C.gold}
            strokeOpacity={0.14}
            fill="none"
            strokeWidth={2}
          />
          <circle
            cx={525}
            cy={1030}
            r={360}
            stroke={C.cyan}
            strokeOpacity={0.1}
            fill="none"
            strokeWidth={2}
            strokeDasharray="3 19"
            transform={`rotate(${frame * 0.6} 525 1030)`}
          />
          <Draw
            d="M 160 760 H 330 L 395 850"
            p={short(frame, goldAt, 20)}
            color={C.gold}
          />
          <Draw d="M 910 786 H 820 L 760 955" p={short(frame, silverAt, 20)} />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 88,
            top: 670,
            color: C.gold,
            fontFamily: DISPLAY,
            fontSize: 90,
            fontWeight: 800,
            opacity: Math.min(1, gold * 2),
            transform: `translateX(${(1 - gold) * -200}px) rotate(${(1 - gold) * -8}deg)`,
          }}
        >
          GOLD
        </div>
        <div
          style={{
            position: "absolute",
            right: 91,
            top: 730,
            color: C.cyan,
            fontFamily: DISPLAY,
            fontSize: 74,
            fontWeight: 800,
            opacity: Math.min(1, silver * 2),
            transform: `translateX(${(1 - silver) * 200}px) rotate(${(1 - silver) * 8}deg)`,
          }}
        >
          SILVER
        </div>
        <Photo
          name="gold-pamp.webp"
          x={375}
          y={1035}
          size={415}
          p={gold}
          rotate={-7 + focus * 7}
          glow={C.gold}
        />
        <Photo
          name="silver-round.webp"
          x={771}
          y={1088}
          size={285}
          p={silver}
          round
          rotate={8 - focus * 8}
          glow={C.cyan}
        />
        <Target x={375} y={1035} size={464} progress={focus} frame={frame} />
        <div
          style={{
            position: "absolute",
            left: 135,
            top: 835 + focus * 380,
            width: 485,
            height: 3,
            background: C.gold,
            opacity: focus * 0.6,
            boxShadow: `0 0 25px ${C.gold}`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 1350,
          display: "flex",
          alignItems: "center",
          gap: 18,
          color: C.cyan,
          opacity: focus,
          transform: `translateX(${(1 - focus) * -35}px)`,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 27,
          letterSpacing: 3,
        }}
      >
        <span style={{ width: 34, height: 3, background: C.cyan }} /> A CLOSER
        LOOK
      </div>
    </AbsoluteFill>
  );
};

const Choice: React.FC<MotionSceneProps> = ({ timing, frame, fps }) => {
  const data = [
    {
      word: "gold",
      title: "BARS",
      sub: "GOLD",
      image: "gold-pamp.webp",
      x: 225,
      color: C.gold,
    },
    {
      word: "silver",
      title: "COINS",
      sub: "SILVER",
      image: "silver-eagle.jpg",
      x: 540,
      color: C.cyan,
    },
    {
      word: "rounds",
      title: "ROUNDS",
      sub: "SILVER",
      image: "silver-round.webp",
      x: 855,
      color: C.cyan,
    },
  ];
  const complete = short(frame, cue(timing, "bullion", fps), 15);
  return (
    <AbsoluteFill>
      <Label x={88} y={313} color={C.cyan}>
        CHOOSE YOUR FORM
      </Label>
      <Title lines={["THREE WAYS", "TO BEGIN."]} frame={frame} size={123} />
      <div
        style={{
          position: "absolute",
          left: 315,
          top: 660,
          width: 450,
          height: 84,
          border: `2px solid ${C.gold}77`,
          borderRadius: 18,
          background: C.panel,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: SANS,
          color: C.text,
          fontWeight: 800,
          fontSize: 27,
          letterSpacing: 2,
          opacity: short(frame, 5, 12),
          transform: `scale(${0.9 + short(frame, 5, 12) * 0.1})`,
        }}
      >
        PRECIOUS METALS
      </div>
      <svg
        width={1080}
        height={1440}
        style={{ position: "absolute", inset: 0 }}
      >
        {data.map((item, i) => {
          const at = cue(timing, item.word, fps);
          const p = short(frame, at - 7, 19);
          return (
            <g key={item.title}>
              <Draw
                d={`M540 744 V795 H${item.x} V866`}
                p={p}
                color={item.color}
              />
              <circle
                cx={item.x}
                cy={866}
                r={7}
                fill={item.color}
                opacity={p}
              />
              <circle
                cx={540}
                cy={744}
                r={8}
                fill={C.gold}
                opacity={short(frame, 6)}
              />
              {frame >= at + 19 && (
                <circle
                  cx={lerp(540, item.x, ((frame - at) % 38) / 38)}
                  cy={795}
                  r={4}
                  fill={item.color}
                  opacity={0.8}
                />
              )}
              <text
                x={item.x}
                y={832}
                textAnchor="middle"
                fontFamily={SANS}
                fontWeight={800}
                fontSize={20}
                fill={item.color}
                opacity={p}
              >{`0${i + 1}`}</text>
            </g>
          );
        })}
      </svg>
      {data.map((item, i) => {
        const at = cue(timing, item.word, fps);
        const p = pop(frame, at, fps);
        const move = short(frame, at, 23);
        const x = lerp(540, item.x, move);
        return (
          <div
            key={item.title}
            style={{
              position: "absolute",
              left: x - 125,
              top: 881,
              width: 250,
              opacity: Math.min(1, p * 2),
              transform: `translateY(${(1 - p) * 100}px) rotate(${(1 - move) * (i - 1) * 22}deg) scale(${0.74 + p * 0.26})`,
              transformOrigin: "50% 50%",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 250,
                height: 304,
                background: "#fff",
                borderRadius: 20,
                border: `2px solid ${item.color}`,
                overflow: "hidden",
                boxShadow: `0 18px 40px #0005,0 0 ${12 + complete * 20}px ${item.color}20`,
              }}
            >
              <Img
                src={art(item.image)}
                style={{
                  width: "100%",
                  height: "100%",
                  padding: i === 1 ? 10 : 13,
                  boxSizing: "border-box",
                  objectFit: "contain",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 52,
                fontWeight: 800,
                color: item.color,
                textAlign: "center",
                paddingTop: 22,
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 3,
                color: C.muted,
                textAlign: "center",
                paddingTop: 6,
              }}
            >
              {item.sub}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 1360,
          width: 700,
          height: 4,
          background: `linear-gradient(90deg,${C.gold},${C.cyan})`,
          transform: `scaleX(${complete})`,
          transformOrigin: "center",
        }}
      />
    </AbsoluteFill>
  );
};

const Details: React.FC<MotionSceneProps> = ({ timing, frame, fps }) => {
  const weightsAt = cue(timing, "weights", fps);
  const detailAt = cue(timing, "details", fps);
  const fitAt = cue(timing, "fits", fps);
  const inspect = short(frame, detailAt - 4, 19);
  const fit = short(frame, fitAt - 4, 16);
  const progress = short(frame, 2, 16);
  return (
    <AbsoluteFill>
      <Label x={88} y={313} color={C.cyan}>
        LOOK A LITTLE CLOSER
      </Label>
      <div style={{ opacity: 1 - short(frame, detailAt - 10, 6) }}>
        <Title lines={["COMPARE", "THE WEIGHTS."]} frame={frame} size={116} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 85,
          top: 360,
          color: C.text,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 116,
          lineHeight: 0.99,
          letterSpacing: -2.5,
          opacity: inspect,
          transform: `translateY(${(1 - inspect) * 60}px)`,
        }}
      >
        DISCOVER
        <br />
        <span style={{ color: C.gold }}>THE DETAILS.</span>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${-inspect * 26}px)`,
        }}
      >
        <Photo
          name="gold-pamp.webp"
          x={lerp(314, 315, inspect)}
          y={915}
          size={360}
          p={pop(frame, 5, fps)}
          rotate={lerp(-5, 0, inspect)}
          glow={C.gold}
          scale={1 - inspect * 0.13}
        />
        <Photo
          name="gold-rosa.webp"
          x={lerp(757, 710, inspect)}
          y={915}
          size={360}
          p={pop(frame, 10, fps)}
          rotate={lerp(5, 0, inspect)}
          glow={C.gold}
          scale={1 + inspect * 0.28}
        />
        <div
          style={{
            position: "absolute",
            left: 115,
            top: 1160,
            width: 400,
            textAlign: "center",
            opacity: short(frame, weightsAt, 12) * (1 - inspect),
            color: C.text,
            fontFamily: DISPLAY,
            fontSize: 87,
            lineHeight: 1,
            fontWeight: 800,
          }}
        >
          1 <span style={{ fontSize: 52, color: C.gold }}>oz</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 557,
            top: 1160,
            width: 400,
            textAlign: "center",
            opacity: short(frame, weightsAt + 6, 12) * (1 - inspect),
            color: C.text,
            fontFamily: DISPLAY,
            fontSize: 87,
            lineHeight: 1,
            fontWeight: 800,
          }}
        >
          5 <span style={{ fontSize: 52, color: C.gold }}>g</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 117,
            top: 1264,
            width: 397,
            textAlign: "center",
            opacity: progress,
            color: C.muted,
            fontFamily: SANS,
            fontSize: 23,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          PAMP FORTUNA
        </div>
        <div
          style={{
            position: "absolute",
            left: lerp(558, 511, inspect),
            top: 1264,
            width: 398,
            textAlign: "center",
            opacity: progress,
            color: C.muted,
            fontFamily: SANS,
            fontSize: 23,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          PAMP ROSA
        </div>
        <Target x={710} y={915} size={490} progress={inspect} frame={frame} />
        <div
          style={{
            position: "absolute",
            left: 448,
            top: 693 + (((((frame - detailAt + 4) % 42) + 42) % 42) / 42) * 425,
            width: 494,
            height: 2,
            background: C.cyan,
            boxShadow: `0 0 18px ${C.cyan}`,
            opacity: inspect * (1 - fit),
          }}
        />
      </div>
      <svg
        width={1080}
        height={1440}
        style={{ position: "absolute", inset: 0 }}
      >
        <Draw
          d="M 491 1337 H 946 V 1154 H 929"
          p={short(frame, detailAt + 8, 22)}
          color={C.cyan}
        />
        <g opacity={fit}>
          <circle cx={904} cy={1168} r={44} fill={C.cyan} />
          <path
            d="M884 1168 l14 14 26-30"
            fill="none"
            stroke={C.bg}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - fit}
          />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 1320,
          fontFamily: SANS,
          color: C.cyan,
          fontWeight: 800,
          letterSpacing: 2.5,
          fontSize: 27,
          opacity: inspect,
          transform: `translateX(${(1 - inspect) * -35}px)`,
        }}
      >
        {fit > 0.5 ? "FIND YOUR PIECE" : "FORM. FINISH. DETAIL."}
      </div>
    </AbsoluteFill>
  );
};

const Person: React.FC<{
  x: number;
  y: number;
  p: number;
  color?: string;
  scale?: number;
}> = ({ x, y, p, color = C.cyan, scale = 1 }) => (
  <g
    transform={`translate(${x} ${y}) scale(${scale * (0.7 + p * 0.3)})`}
    opacity={p}
  >
    <circle cx={0} cy={-16} r={15} fill="none" stroke={color} strokeWidth={4} />
    <path
      d="M-29 28 C-29 -3 29 -3 29 28"
      fill="none"
      stroke={color}
      strokeWidth={4}
      strokeLinecap="round"
    />
  </g>
);

const Confidence: React.FC<MotionSceneProps> = ({ timing, frame, fps }) => {
  const liveAt = cue(timing, "live", fps);
  const spotAt = cue(timing, "spot", fps);
  const pricingAt = cue(timing, "pricing", fps);
  const newYorkAt = cue(timing, "new", fps);
  const teamAt = cue(timing, "team", fps);
  const orderAt = cue(timing, "order", fps);
  const nextAt = cue(timing, "next", fps);
  const team = short(frame, newYorkAt - 4, 22);
  const next = short(frame, nextAt - 8, 15);
  const people = short(frame, teamAt, 12);
  const order = short(frame, orderAt - 4, 20);
  const firstOpacity = 1 - short(frame, newYorkAt - 4, 18);
  const cursor = short(frame, nextAt - 17, 17);
  return (
    <AbsoluteFill>
      <Label x={88} y={313} color={C.cyan}>
        KNOW YOUR NEXT STEP
      </Label>
      <div style={{ opacity: 1 - short(frame, newYorkAt - 10, 6) }}>
        <Title lines={["LIVE.", "SPOT-BASED."]} frame={frame} size={126} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 85,
          top: 360,
          color: C.text,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 126,
          lineHeight: 0.97,
          letterSpacing: -2.5,
          opacity: team,
          transform: `translateY(${(1 - team) * 55}px)`,
        }}
      >
        A NEW YORK
        <br />
        <span style={{ color: C.gold }}>CONNECTION.</span>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: firstOpacity,
          transform: `translateY(${-team * 60}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 86,
            top: 740,
            width: 365,
            height: 280,
            borderRadius: 25,
            background: C.panel,
            border: `2px solid ${C.cyan}88`,
            opacity: short(frame, spotAt - 6, 16),
            transform: `scale(${0.86 + short(frame, spotAt - 6, 16) * 0.14})`,
          }}
        >
          <div
            style={{
              padding: "30px 28px",
              fontFamily: SANS,
              color: C.cyan,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 2,
            }}
          >
            SPOT MARKET
          </div>
          <svg
            width={260}
            height={100}
            style={{ marginLeft: 45 }}
            viewBox="0 0 260 100"
          >
            <circle
              cx={80}
              cy={50}
              r={35}
              fill="none"
              stroke={C.gold}
              strokeWidth={3}
            />
            <circle
              cx={175}
              cy={50}
              r={35}
              fill="none"
              stroke={C.cyan}
              strokeWidth={3}
            />
            <text
              x={80}
              y={60}
              textAnchor="middle"
              fontFamily={DISPLAY}
              fontWeight={800}
              fontSize={28}
              fill={C.gold}
            >
              Au
            </text>
            <text
              x={175}
              y={60}
              textAnchor="middle"
              fontFamily={DISPLAY}
              fontWeight={800}
              fontSize={28}
              fill={C.cyan}
            >
              Ag
            </text>
          </svg>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10,
              opacity: short(frame, liveAt),
              fontFamily: SANS,
              color: C.text,
              fontSize: 20,
              letterSpacing: 3,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: C.cyan,
                boxShadow: `0 0 ${8 + 8 * Math.sin(frame / 8)}px ${C.cyan}`,
              }}
            />{" "}
            LIVE PRICING
          </div>
        </div>
        <svg
          width={1080}
          height={1440}
          style={{ position: "absolute", inset: 0 }}
        >
          <Draw
            d="M 452 880 H 614 M 594 858 L 616 880 L 594 902"
            p={short(frame, pricingAt - 12, 16)}
            color={C.gold}
            width={4}
          />
          {frame > pricingAt && (
            <circle
              cx={455 + (((frame - pricingAt) % 32) / 32) * 150}
              cy={880}
              r={5}
              fill={C.gold}
            />
          )}
        </svg>
        <div
          style={{
            position: "absolute",
            left: 625,
            top: 740,
            width: 350,
            height: 280,
            borderRadius: 25,
            background: C.panel,
            border: `2px solid ${C.gold}88`,
            opacity: short(frame, pricingAt - 6, 16),
            transform: `translateX(${(1 - short(frame, pricingAt - 6, 16)) * 65}px)`,
          }}
        >
          <div
            style={{
              padding: "30px 22px",
              fontFamily: SANS,
              color: C.gold,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 2,
            }}
          >
            PRODUCT PRICE
          </div>
          <div
            style={{
              position: "absolute",
              top: 94,
              left: 96,
              width: 156,
              height: 126,
              borderRadius: 13,
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <Img
              src={art("gold-pamp.webp")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 87,
            top: 1090,
            width: 895,
            height: 130,
            borderTop: `1px solid ${C.gold}55`,
            opacity: short(frame, pricingAt + 8, 20),
          }}
        >
          <div
            style={{
              paddingTop: 27,
              fontFamily: SANS,
              fontSize: 26,
              lineHeight: 1.5,
              letterSpacing: 1.3,
              color: C.muted,
            }}
          >
            Pricing connected to the market.
            <br />
            <span style={{ color: C.text }}>
              Explore your next piece online.
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: team,
          transform: `translateY(${(1 - team) * 80}px)`,
        }}
      >
        <svg
          width={1080}
          height={1440}
          style={{ position: "absolute", inset: 0 }}
        >
          <g opacity={0.13}>
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M110 ${742 + i * 125} H958 M${245 + i * 280} 695 V1210`}
                fill="none"
                stroke={C.cyan}
                strokeWidth={2}
              />
            ))}
          </g>
          <Draw
            d="M 262 838 H 490 V 966 H 735"
            p={short(frame, teamAt, 23)}
            color={C.cyan}
          />
          <Draw
            d="M 262 1095 H 490 V 966"
            p={short(frame, teamAt + 6, 23)}
            color={C.cyan}
          />
          <Person x={262} y={838} p={people} scale={1.5} />
          <Person
            x={262}
            y={1095}
            p={short(frame, teamAt + 7, 14)}
            scale={1.5}
          />
          <circle
            cx={735}
            cy={966}
            r={140}
            fill={C.panel}
            stroke={C.gold}
            strokeWidth={2}
            opacity={order}
          />
          <g
            opacity={order}
            transform={`translate(735 966) scale(${0.8 + order * 0.2})`}
          >
            <rect
              x={-55}
              y={-65}
              width={110}
              height={116}
              rx={12}
              fill="none"
              stroke={C.gold}
              strokeWidth={4}
            />
            <path
              d="M-24 -39H25 M-24 -17H25 M-23 17L-4 34L30 1"
              stroke={C.gold}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <circle cx={490} cy={966} r={11} fill={C.cyan} opacity={people} />
          <circle
            cx={490}
            cy={966}
            r={20 + ((frame % 32) / 32) * 28}
            stroke={C.cyan}
            fill="none"
            opacity={people * (1 - (frame % 32) / 32) * 0.45}
          />
        </svg>
        <Label x={127} y={739} color={C.cyan} size={23} opacity={people}>
          NEW YORK TEAM
        </Label>
        <div
          style={{
            position: "absolute",
            left: 595,
            top: 1147,
            width: 280,
            textAlign: "center",
            fontFamily: SANS,
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 2,
            color: C.gold,
            opacity: order,
          }}
        >
          YOUR ORDER
        </div>
        <div
          style={{
            position: "absolute",
            left: 167,
            top: 1285,
            width: 746,
            height: 91,
            borderRadius: 14,
            border: `2px solid ${C.gold}`,
            background: `rgba(255,208,70,${next * 0.12})`,
            color: C.gold,
            fontFamily: SANS,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 29,
            letterSpacing: 3,
            opacity: short(frame, orderAt + 6, 14),
            transform: `scale(${1 + Math.sin(next * Math.PI) * 0.04})`,
          }}
        >
          TAKE THE NEXT STEP{" "}
          <span style={{ paddingLeft: 35, fontSize: 43 }}>↗</span>
        </div>
        <svg
          width={58}
          height={67}
          viewBox="0 0 58 67"
          style={{
            position: "absolute",
            left: lerp(916, 849, cursor),
            top: lerp(1210, 1326, cursor),
            opacity: short(frame, nextAt - 17, 9),
            transform: `scale(${1 - next * 0.15})`,
          }}
        >
          <path
            d="M4 3L47 34L27 36L18 57Z"
            fill={C.text}
            stroke={C.bg}
            strokeWidth={3}
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const DiscoveryMotion: React.FC<MotionSceneProps> = (props) => {
  switch (props.scene.id) {
    case "hook":
      return <Hook {...props} />;
    case "choice":
      return <Choice {...props} />;
    case "details":
      return <Details {...props} />;
    case "confidence":
      return <Confidence {...props} />;
    default:
      return null;
  }
};
