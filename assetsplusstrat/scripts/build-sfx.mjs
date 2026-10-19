// Bakes keyboard-typing ASMR and calendar-flip tracks from short CC0 Kenney
// samples in public/sfx. Keystrokes are placed on the same frames as the
// on-screen typing, so re-run this after changing typing speed or text.
//
//   node scripts/build-sfx.mjs

import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const SFX_DIR = join(import.meta.dirname, '..', 'public', 'sfx');
const RATE = 48000;
const FPS = 60;

const readWav = (name) => {
  const buf = readFileSync(join(SFX_DIR, `${name}.wav`));
  let offset = 12;
  let channels = 2;
  while (offset < buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === 'fmt ') {
      channels = buf.readUInt16LE(offset + 10);
    }
    if (id === 'data') {
      const frames = size / 2 / channels;
      const out = new Float32Array(frames * 2);
      for (let i = 0; i < frames; i++) {
        const l = buf.readInt16LE(offset + 8 + i * channels * 2) / 32768;
        const r = channels > 1 ? buf.readInt16LE(offset + 8 + i * channels * 2 + 2) / 32768 : l;
        out[i * 2] = l;
        out[i * 2 + 1] = r;
      }
      return out;
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error(`No data chunk in ${name}.wav`);
};

const writeWav = (name, samples) => {
  const data = Buffer.alloc(samples.length * 2);
  let peak = 0;
  for (const s of samples) {
    peak = Math.max(peak, Math.abs(s));
  }
  const gain = peak > 0.95 ? 0.95 / peak : 1;
  samples.forEach((s, i) => data.writeInt16LE(Math.round(s * gain * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(2, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(join(SFX_DIR, `${name}.wav`), Buffer.concat([header, data]));
  console.log(`wrote public/sfx/${name}.wav (${(samples.length / 2 / RATE).toFixed(2)}s)`);
};

// Deterministic pseudo-random numbers, so the tracks are reproducible.
let seed = 7;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const samples = Object.fromEntries(
  ['click_001', 'click_002', 'click_003', 'click_004', 'click_005', 'tick_001', 'tick_002', 'tick_004'].map(
    (n) => [n, readWav(n)],
  ),
);

const mix = (track, sample, atSeconds, gain, pan = 0) => {
  const start = Math.round(atSeconds * RATE) * 2;
  for (let i = 0; i < sample.length; i += 2) {
    if (start + i + 1 >= track.length) {
      break;
    }
    track[start + i] += sample[i] * gain * (1 - Math.max(0, pan));
    track[start + i + 1] += sample[i + 1] * gain * (1 + Math.min(0, pan));
  }
};

const KEYS = ['click_002', 'click_003', 'click_004', 'click_005', 'tick_002'];

// One keystroke per typed character. Spaces and line breaks hit harder.
const typingTrack = (text, framesPerChar, extraKeys = []) => {
  const seconds = (text.length * framesPerChar) / FPS + 1.5;
  const track = new Float32Array(Math.ceil(seconds * RATE) * 2);
  [...text].forEach((char, k) => {
    const at = ((k + 1) * framesPerChar) / FPS + (rand() - 0.5) * 0.006;
    const heavy = char === ' ' || char === '\n';
    const key = samples[KEYS[Math.floor(rand() * KEYS.length)]];
    const pan = (rand() - 0.5) * 0.5;
    mix(track, key, at, 0.55 + rand() * 0.35, pan);
    // Low "thock" body under each key.
    mix(track, samples.click_001, at, heavy ? 0.5 : 0.18 + rand() * 0.1, pan);
  });
  extraKeys.forEach(({frame, gain}) => {
    mix(track, samples.click_001, frame / FPS, gain);
    mix(track, samples.click_004, frame / FPS + 0.004, gain * 0.8);
  });
  return track;
};

writeWav('typing-title', typingTrack('DID METALS\nMAKE THEIR\nLOW?', 4));
// Outro: 52 characters at 2 frames each, then Enter 18 frames after the last key.
const question = 'Where is the best place to buy your gold and silver?';
writeWav(
  'typing-outro',
  typingTrack(question, 2, [{frame: question.length * 2 + 18, gain: 1.2}]),
);

// Split-flap calendar: a double click per flap, then a firmer lock.
{
  const flaps = [8, 10, 16, 22, 24, 32, 34, 40, 46, 48, 52, 56, 64];
  const track = new Float32Array(Math.ceil(1.6 * RATE) * 2);
  flaps.forEach((frame) => {
    mix(track, samples.tick_001, frame / FPS, 0.6 + rand() * 0.2, (rand() - 0.5) * 0.4);
    mix(track, samples.click_003, frame / FPS + 0.03, 0.4);
  });
  mix(track, samples.tick_004, 72 / FPS, 1);
  mix(track, samples.click_001, 72 / FPS, 0.5);
  writeWav('calendar-flips', track);
}
