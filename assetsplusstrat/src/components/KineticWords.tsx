import type React from 'react';
import {
  Interactive,
  interpolate,
  useCurrentFrame,
  type InteractivitySchema,
} from 'remotion';
import {clamp, DISPLAY_FONT, easeInOut, easeOutExpo, INK} from '../theme';

type KineticWordsProps = {
  readonly children: string;
  readonly highlight: string;
  readonly highlightColor: string;
  readonly stagger: number;
  // "mask": words rise out of a clipping line. "blur": words resolve from a blur.
  readonly mode?: 'mask' | 'blur';
  // Animate word by word, or letter by letter.
  readonly unit?: 'word' | 'letter';
  // Draws a neon box around the highlighted word once it has landed.
  readonly boxHighlight?: boolean;
  readonly style?: React.CSSProperties;
};

const KineticWordsInner: React.FC<KineticWordsProps> = ({
  children,
  highlight,
  highlightColor,
  stagger,
  mode = 'mask',
  unit = 'word',
  boxHighlight = false,
  style,
}) => {
  // Frame 0 is when this text layer starts, wherever the parent places it.
  const frame = useCurrentFrame();
  const words = children.split(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: '0.24em',
        fontFamily: DISPLAY_FONT,
        color: INK,
        ...style,
      }}
    >
      {words.map((word, i) => {
        // Index of this word's first letter within the whole text.
        const letterOffset = words.slice(0, i).join('').length;
        const local = frame - (unit === 'word' ? i : letterOffset) * stagger;
        const reveal = (delay: number) =>
          interpolate(local - delay, [0, 26], [0, 1], {
            ...clamp,
            easing: easeOutExpo,
          });
        const boxProgress = interpolate(local, [32, 56], [0, 1], {
          ...clamp,
          easing: easeInOut,
        });
        const isHighlight =
          highlight !== '' && word.replace(/[^\w'-]/g, '') === highlight;

        return (
          <span
            key={i}
            style={{
              position: 'relative',
              display: 'inline-block',
              overflow: mode === 'mask' ? 'hidden' : 'visible',
              paddingBottom: '0.1em',
              marginBottom: '-0.1em',
              // drop-shadow is applied after the mask clips, so the glow isn't boxed in.
              filter: isHighlight
                ? `drop-shadow(0 0 18px ${highlightColor}99) drop-shadow(0 0 48px ${highlightColor}55)`
                : undefined,
            }}
          >
            {(unit === 'word' ? [word] : word.split('')).map((piece, j) => {
              const p = reveal(unit === 'word' ? 0 : j * stagger);
              return (
                <span
                  key={j}
                  style={{
                    display: 'inline-block',
                    transformOrigin: '0% 100%',
                    translate:
                      mode === 'mask'
                        ? `0 ${(1 - p) * 110}%`
                        : `0 ${(1 - p) * 0.4}em`,
                    rotate: mode === 'mask' ? `${(1 - p) * 9}deg` : '0deg',
                    opacity: mode === 'mask' ? 1 : p,
                    filter: mode === 'blur' ? `blur(${(1 - p) * 18}px)` : 'none',
                    color: isHighlight ? highlightColor : undefined,
                  }}
                >
                  {piece}
                </span>
              );
            })}
            {isHighlight && boxHighlight ? (
              <span
                style={{
                  position: 'absolute',
                  top: '0.04em',
                  bottom: '0.06em',
                  left: '-0.16em',
                  right: '-0.16em',
                  border: `5px solid ${highlightColor}`,
                  borderRadius: 14,
                  boxShadow: `0 0 28px ${highlightColor}, inset 0 0 22px ${highlightColor}66`,
                  clipPath: `inset(0 ${(1 - boxProgress) * 100}% 0 0)`,
                }}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};

const kineticWordsSchema = {
  children: {type: 'text-content', default: '', description: 'Text'},
  highlight: {
    type: 'text-content',
    default: '',
    description: 'Highlighted word',
  },
  highlightColor: {
    type: 'color',
    default: '#FFC83D',
    description: 'Highlight color',
  },
  stagger: {
    type: 'number',
    hiddenFromList: false,
    default: 5,
    min: 0,
    step: 1,
    keyframable: false,
    description: 'Frames between words',
  },
  ...Interactive.textSchema,
} as const satisfies InteractivitySchema;

export const KineticWords = Interactive.withSchema({
  Component: KineticWordsInner,
  componentName: '<KineticWords>',
  schema: kineticWordsSchema,
  wrapInSequence: true,
});
