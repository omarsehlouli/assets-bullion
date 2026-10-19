import type React from 'react';
import {
  Interactive,
  interpolate,
  useCurrentFrame,
  type InteractivitySchema,
} from 'remotion';
import {clamp, easeOutExpo, MONO_FONT} from '../theme';

type RollingNumberProps = {
  readonly children: string;
  readonly stagger: number;
  readonly duration: number;
  readonly style?: React.CSSProperties;
};

// Height of one odometer cell, in em.
const CELL = 1.12;
const isDigit = (char: string) => /\d/.test(char);

const RollingNumberInner: React.FC<RollingNumberProps> = ({
  children,
  stagger,
  duration,
  style,
}) => {
  const frame = useCurrentFrame();
  const chars = children.split('');

  return (
    <div
      style={{
        display: 'flex',
        fontFamily: MONO_FONT,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: `${CELL}em`,
        ...style,
      }}
    >
      {chars.map((char, i) => {
        if (!isDigit(char)) {
          return (
            <span
              key={i}
              style={{
                opacity: interpolate(frame, [0, 10], [0, 1], clamp),
              }}
            >
              {char}
            </span>
          );
        }

        // Each digit spins one full turn, then lands on its value.
        const order = chars.slice(0, i).filter(isDigit).length;
        const progress = interpolate(
          frame - order * stagger,
          [0, duration],
          [0, 1],
          {...clamp, easing: easeOutExpo},
        );
        const offset = progress * (10 + Number(char));

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              height: `${CELL}em`,
              overflow: 'hidden',
            }}
          >
            <span style={{display: 'block', translate: `0 ${-offset * CELL}em`}}>
              {Array.from({length: 20}, (_, n) => (
                <span key={n} style={{display: 'block', height: `${CELL}em`}}>
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
};

const rollingNumberSchema = {
  children: {type: 'text-content', default: '0', description: 'Value'},
  stagger: {
    type: 'number',
    hiddenFromList: false,
    default: 4,
    min: 0,
    step: 1,
    keyframable: false,
    description: 'Frames between digits',
  },
  duration: {
    type: 'number',
    hiddenFromList: false,
    default: 50,
    min: 1,
    step: 1,
    keyframable: false,
    description: 'Roll duration (frames)',
  },
  ...Interactive.textSchema,
} as const satisfies InteractivitySchema;

export const RollingNumber = Interactive.withSchema({
  Component: RollingNumberInner,
  componentName: '<RollingNumber>',
  schema: rollingNumberSchema,
  wrapInSequence: true,
});
