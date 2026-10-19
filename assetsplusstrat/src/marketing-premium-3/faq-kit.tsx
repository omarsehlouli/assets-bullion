import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {Eyebrow, italic, Metal, Rise, serif} from '../marketing-premium/kit/Text';
import {C, EASE, mix, prog, type SceneProps} from '../marketing-premium/kit/theme';

// Shared pieces for the FAQ series: every film opens on its question,
// revealed word by word with the narration, under a large gilded "?".

const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

// `lines` are the question split into display lines; each line rises as its
// first word is spoken, and the last line is set in gilded italic.
export const QuestionScene: React.FC<SceneProps & {number: string; lines: string[]; size?: number}> = ({frame, cue, number, lines, size = 108}) => {
  const seen: Record<string, number> = {};
  const starts = lines.map((line) => {
    const words = line.split(' ');
    const ats = words.map((word) => {
      const key = clean(word);
      const occurrence = seen[key] ?? 0;
      seen[key] = occurrence + 1;
      try {
        return cue(word, occurrence);
      } catch {
        return null;
      }
    });
    return ats.find((a) => a !== null) ?? 10;
  });
  const mark = prog(frame, 0, 60, EASE.silk);
  const last = lines.length - 1;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 520,
          textAlign: 'center',
          opacity: mark * 0.22,
          scale: String(mix(1.15, 1, mark)),
          ...italic(900, {lineHeight: 1}),
        }}
      >
        <Metal frame={frame} sheenAt={20} glow="rgba(212,175,55,0.15)">
          ?
        </Metal>
      </div>
      <div style={{position: 'absolute', top: 470, left: 60, right: 60, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={0}>
          {`Bullion Trading · FAQ ${number}`}
        </Eyebrow>
        <div style={{marginTop: 46}}>
          {lines.map((line, i) => (
            <Rise key={i} frame={frame} at={starts[i] - 6} dur={30} distance={34}>
              {i === last ? (
                <div style={italic(size * 1.06, {lineHeight: 1.1})}>
                  <Metal frame={frame} sheenAt={starts[i] + 24}>
                    {line}
                  </Metal>
                </div>
              ) : (
                <div style={serif(size, {lineHeight: 1.1})}>{line}</div>
              )}
            </Rise>
          ))}
        </div>
        <div
          style={{
            margin: '44px auto 0',
            width: 420 * prog(frame, starts[last] + 10, 40, EASE.inOut),
            height: 1,
            background: 'linear-gradient(90deg, rgba(212,175,55,0), #d4af37, rgba(212,175,55,0))',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// The small running label used above each answer headline.
export const AnswerLabel: React.FC<{frame: number; number: string; at?: number; text?: string}> = ({frame, number, at = 0, text = 'The answer'}) => (
  <Eyebrow frame={frame} at={at} color={C.champagne}>
    {`FAQ ${number} · ${text}`}
  </Eyebrow>
);
