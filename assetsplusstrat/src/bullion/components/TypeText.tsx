import type React from 'react';
import {
  Interactive,
  useCurrentFrame,
  type InteractivitySchema,
} from 'remotion';
import {C, KINETIC_FONT} from '../theme';

type TypeTextProps = {
  readonly children: string;
  readonly framesPerChar: number;
  readonly highlight: string;
  readonly highlightColor: string;
  readonly cursorColor: string;
  readonly style?: React.CSSProperties;
};

// Types its text out one character at a time, with a blinking block cursor.
const TypeTextInner: React.FC<TypeTextProps> = ({
  children,
  framesPerChar,
  highlight,
  highlightColor,
  cursorColor,
  style,
}) => {
  const frame = useCurrentFrame();
  const typed = Math.max(0, Math.min(children.length, Math.floor(frame / framesPerChar)));
  const done = typed >= children.length;
  const highlightAt = highlight === '' ? -1 : children.indexOf(highlight);
  const splitAt = highlightAt === -1 ? typed : Math.min(typed, highlightAt);
  const cursorOn = !done || Math.floor(frame / 18) % 2 === 0;

  return (
    <div
      style={{
        fontFamily: KINETIC_FONT,
        color: C.ink,
        whiteSpace: 'pre-wrap',
        ...style,
      }}
    >
      {children.slice(0, splitAt)}
      {highlightAt !== -1 && typed > highlightAt ? (
        <span
          style={{
            color: highlightColor,
            textShadow: `0 0 24px ${highlightColor}AA, 0 0 70px ${highlightColor}66`,
          }}
        >
          {children.slice(highlightAt, typed)}
        </span>
      ) : null}
      <span
        style={{
          display: 'inline-block',
          width: '0.5em',
          height: '0.82em',
          marginLeft: '0.06em',
          translate: '0 0.08em',
          backgroundColor: cursorColor,
          boxShadow: `0 0 18px ${cursorColor}`,
          opacity: cursorOn ? 1 : 0,
        }}
      />
    </div>
  );
};

const typeTextSchema = {
  children: {type: 'text-content', default: '', description: 'Text'},
  framesPerChar: {
    type: 'number',
    hiddenFromList: false,
    default: 3,
    min: 1,
    step: 1,
    keyframable: false,
    description: 'Frames per character',
  },
  highlight: {type: 'text-content', default: '', description: 'Highlighted text'},
  highlightColor: {type: 'color', default: '#FFD700', description: 'Highlight color'},
  cursorColor: {type: 'color', default: '#FFD700', description: 'Cursor color'},
  ...Interactive.textSchema,
} as const satisfies InteractivitySchema;

export const TypeText = Interactive.withSchema({
  Component: TypeTextInner,
  componentName: '<TypeText>',
  schema: typeTextSchema,
  wrapInSequence: true,
});
