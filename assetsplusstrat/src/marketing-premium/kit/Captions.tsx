import React, {useMemo} from 'react';
import {GOLD_GRADIENT, SANS, type ScheduleScene, type TimedWord} from './theme';

type Page = {words: TimedWord[]; start: number; end: number};

const DISPLAY: Record<string, string> = {
  'Forty-Seventh': '47th',
  '$10-15': '$10–$15',
};

const shown = (word: string) => DISPLAY[word] ?? word;

const MAX_CHARS = 30;
const length = (words: TimedWord[]) => words.reduce((n, w) => n + shown(w.word).length + 1, -1);

// Split an over-long phrase into the most even chunks that fit.
const balance = (words: TimedWord[]): TimedWord[][] => {
  if (length(words) <= MAX_CHARS) {
    return [words];
  }
  const parts = Math.ceil(length(words) / MAX_CHARS);
  const target = length(words) / parts;
  const out: TimedWord[][] = [];
  let current: TimedWord[] = [];
  words.forEach((word) => {
    if (current.length && length([...current, word]) > target + 4 && out.length < parts - 1) {
      out.push(current);
      current = [];
    }
    current.push(word);
  });
  out.push(current);
  return out;
};

// Pages follow the phrasing of the narration: phrases end on punctuation and
// are packed together while they fit one caption.
export const paginate = (scenes: ScheduleScene[]): Page[] =>
  scenes.flatMap((scene) => {
    const phrases: TimedWord[][] = [[]];
    scene.words.forEach((word) => {
      phrases[phrases.length - 1].push(word);
      if (/[.,!?;:]$/.test(shown(word.word))) {
        phrases.push([]);
      }
    });
    const pages: Page[] = [];
    let words: TimedWord[] = [];
    const flush = () => {
      if (words.length) {
        pages.push({words, start: words[0].start, end: words[words.length - 1].end});
      }
      words = [];
    };
    phrases
      .filter((p) => p.length)
      .flatMap(balance)
      .forEach((chunk) => {
        const sentenceEnded = words.length && /[.!?]$/.test(shown(words[words.length - 1].word));
        if (words.length && (sentenceEnded || length([...words, ...chunk]) > MAX_CHARS)) {
          flush();
        }
        words.push(...chunk);
      });
    flush();
    return pages.map((page, i) => ({
      ...page,
      start: page.start - 0.08,
      end: Math.min(pages[i + 1] ? pages[i + 1].start - 0.08 : scene.audioEnd + 0.35, page.end + 0.45),
    }));
  });

export const Captions: React.FC<{scenes: ScheduleScene[]; time: number; top?: number}> = ({scenes, time, top = 1468}) => {
  const pages = useMemo(() => paginate(scenes), [scenes]);
  const page = pages.find((p) => time >= p.start && time < p.end);
  if (!page) {
    return null;
  }
  const enter = Math.min(1, (time - page.start) / 0.18);
  const exit = Math.max(0, Math.min(1, (time - (page.end - 0.14)) / 0.14));
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top,
        display: 'flex',
        justifyContent: 'center',
        opacity: enter * (1 - exit),
        translate: `0 ${(1 - enter) * 14}px`,
      }}
    >
      <div
        style={{
          maxWidth: 860,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: 46,
          fontWeight: 600,
          lineHeight: 1.28,
          letterSpacing: '-0.01em',
          textShadow: '0 2px 18px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.6)',
        }}
      >
        {page.words.map((word, i) => {
          const spoken = time >= word.start - 0.04;
          const active = spoken && time < (page.words[i + 1]?.start ?? page.end) - 0.04;
          const text = shown(word.word);
          return (
            <React.Fragment key={`${word.start}-${i}`}>
              {active ? (
                <span
                  style={{
                    backgroundImage: GOLD_GRADIENT,
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent',
                    textShadow: 'none',
                    filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.9))',
                  }}
                >
                  {text}
                </span>
              ) : (
                <span style={{color: spoken ? '#f7f2e6' : 'rgba(247,242,230,0.38)'}}>{text}</span>
              )}
              {i < page.words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
