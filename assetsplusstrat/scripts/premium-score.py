#!/usr/bin/env python3
"""Original procedural score and sound design for the premium Bullion Trading edits.

Reads public/marketing/premium/schedule.json and writes, per video,
public/marketing/premium/audio/<id>-score.wav (48 kHz stereo PCM_24, same length
as the voice track). Nothing is sampled or downloaded: every sound is synthesized
here from oscillators, additive partials and seeded noise.

  * Pad: detuned band-limited saw wavetables, warm low-pass that opens on each
    chord, crossfaded chord changes landing on every scene's visualStart.
  * Sub: quiet sine on the chord root.
  * Felt piano: additive partials (fast-decaying highs, slight inharmonicity,
    soft hammer noise) playing a slow sparse motif through each chord.
  * Bells/shimmer on product keywords; a reverse piano swell + band-swept noise
    riser into every cut and a soft sub-drop impact on it; a light-on swell and
    boom at the top; tonic bloom and logo shimmer on the call to action.
  * Convolution reverb with a synthetic, decorrelated stereo impulse response.
  * Sidechain ducking under the narration, then normalized to about -24 LUFS
    with true peak under -3 dBFS.

Run:  python -I scripts/premium-score.py [--video ID] [--group premium-2|premium-3]

--group picks the film set: public/marketing/<group>/schedule.json in, the
schedule's own audio paths out, previews in out/marketing/<group>/audio-preview.
Films with a "sfx" entry below also get bespoke, word-synced sound design.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, istft, oaconvolve, resample_poly, sosfilt, sosfiltfilt, stft

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SCHEDULE = PUBLIC / "marketing/premium/schedule.json"
PREVIEW = ROOT / "out/marketing/premium/audio-preview"


def group_paths(group: str) -> tuple[Path, Path]:
    return PUBLIC / "marketing" / group / "schedule.json", ROOT / "out/marketing" / group / "audio-preview"

RATE = 48000
TARGET_LUFS = -24.0
CEILING_DBTP = -3.3
DUCK_DB = -7.0

NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]

# chord name, pad voicing (MIDI, lowest note is the bass), piano/bell tones (MIDI)
SCORES = {
    "first-piece": {
        "key": "D major", "seed": 11, "step": 1.05, "pattern": [1, 2, 3, 2, 0],
        "chords": [
            ("Dmaj9", [50, 57, 61, 64, 66], [66, 69, 73, 76]),
            ("Bm9", [47, 54, 57, 61, 62], [66, 69, 73, 74]),
            ("Gmaj9", [43, 54, 57, 59, 62], [67, 71, 74, 78]),
            ("Asus4(add9)", [45, 52, 57, 59, 62], [69, 71, 74, 76]),
            ("D(add9)", [50, 57, 62, 64, 66, 69], [66, 69, 74, 78]),
        ],
        "keywords": {"gold", "silver", "bars", "coins", "rounds", "weights", "details", "collection",
                     "live", "team", "step"},
    },
    "new-york": {
        "key": "A minor (Aeolian) lifting to A major", "seed": 23, "step": 0.88, "pattern": [0, 2, 3, 1, 2],
        "chords": [
            ("Am9", [45, 52, 55, 59, 60], [64, 67, 71, 72]),
            ("Fmaj7", [41, 52, 57, 60, 64], [65, 69, 72, 76]),
            ("C/E(add9)", [40, 55, 60, 62, 64], [64, 67, 72, 74]),
            ("D/F#(add9)", [42, 50, 57, 62, 64], [66, 69, 74, 76]),
            ("A(add9)", [45, 52, 57, 59, 61, 64], [64, 69, 71, 73]),
        ],
        "keywords": {"diamond", "metals", "handson", "2008", "gold", "silver", "online", "counter",
                     "fortyseventh", "47th", "products", "place", "team"},
    },
    "meaningful-gift": {
        "key": "F major", "seed": 37, "step": 1.2, "pattern": [2, 1, 3, 2, 0],
        "chords": [
            ("Fmaj9", [41, 48, 52, 55, 57], [67, 69, 72, 76]),
            ("Dm9", [38, 45, 52, 53, 57], [65, 69, 72, 76]),
            ("Bbmaj9", [46, 53, 57, 60, 62], [65, 69, 70, 74]),
            ("C9sus4", [48, 53, 55, 58, 62], [67, 70, 72, 74]),
            ("F6/9", [41, 48, 55, 57, 60, 62], [65, 69, 72, 77]),
        ],
        "keywords": {"moments", "gift", "silver", "golden", "tradition", "gold", "pieces", "bars",
                     "coins", "rounds", "hold", "admire", "remember", "shine"},
    },
    "icons-of-gold": {
        "key": "Eb major", "seed": 53, "step": 1.0, "pattern": [0, 1, 2, 3, 2],
        "chords": [
            ("Eb(add9)", [39, 46, 51, 53, 55], [63, 67, 70, 75]),
            ("Abmaj7", [44, 51, 55, 60, 63], [67, 68, 72, 75]),
            ("Cm9", [48, 51, 55, 58, 62], [63, 67, 70, 74]),
            ("Bbsus4(6/9)", [46, 51, 53, 55, 60], [65, 67, 70, 72]),
            ("Eb(add9)", [39, 46, 51, 55, 58, 65], [63, 67, 70, 75]),
        ],
        "keywords": {"gold", "world", "eagle", "maple", "krugerrand", "britannia", "pamp", "valcambi",
                     "perth", "online", "district"},
        "bellCap": {"icons": 4},  # one bell per coin in the roll call
    },
    # ---- premium-2: one chord per scene, plus bespoke word-synced sound design ("sfx").
    "traditions": {
        "key": "Bb major", "seed": 71, "step": 1.15, "pattern": [0, 1, 2, 3, 2],
        "chords": [
            ("Bbmaj9", [46, 53, 57, 60, 62], [65, 69, 72, 74]),
            ("Gm9", [43, 50, 53, 57, 58], [62, 65, 69, 70]),
            ("Ebmaj9", [39, 46, 50, 53, 55], [63, 67, 70, 74]),
            ("Cm9", [48, 51, 55, 58, 62], [63, 67, 70, 74]),
            ("Dm7", [38, 45, 48, 53, 57], [62, 65, 69, 72]),
            ("Fsus4(add9)", [41, 48, 53, 55, 58], [65, 67, 70, 72]),
            ("Bb(add9)", [46, 53, 58, 60, 62, 65], [65, 70, 72, 74]),
        ],
        "keywords": {"cultures", "wedding", "day", "home", "year", "door"},
        "sfx": "traditions", "sfxDuckDb": -3.0,
    },
    "sell-to-us": {
        "key": "G major", "seed": 83, "step": 0.9, "pattern": [0, 2, 1, 3, 2],
        "chords": [
            ("Gmaj9", [43, 50, 54, 57, 59], [66, 67, 71, 74]),
            ("Em9", [40, 47, 50, 54, 55], [62, 66, 67, 71]),
            ("Cmaj9", [48, 52, 55, 59, 62], [64, 67, 71, 74]),
            ("Am9", [45, 52, 55, 59, 60], [64, 67, 71, 72]),
            ("Dsus4(add9)", [50, 55, 57, 62, 64], [62, 67, 69, 74]),
            ("G(add9)", [43, 50, 55, 57, 59, 62], [67, 71, 74, 79]),
        ],
        "keywords": {"selling", "published", "market", "products", "provide"},
        "sfx": "sell", "sfxDuckDb": -3.0,
    },
    "real-or-fake": {
        "key": "A minor lifting to A major", "seed": 97, "step": 0.95, "pattern": [0, 1, 2, 1, 3],
        "chords": [
            ("Am(add9)", [45, 52, 57, 59, 60], [64, 69, 71, 72]),
            ("Fmaj7#11", [41, 48, 52, 57, 59], [64, 65, 69, 71]),
            ("Dm9", [38, 45, 48, 53, 57], [62, 64, 65, 69]),
            ("Am/C(add9)", [48, 52, 57, 59, 64], [64, 69, 71, 72]),
            ("G6", [43, 50, 55, 59, 64], [62, 67, 71, 74]),
            ("Fmaj9", [41, 48, 52, 55, 57], [65, 67, 69, 72]),
            ("Esus4", [40, 47, 52, 57, 59], [64, 69, 71, 76]),
            ("A(add9)", [45, 52, 57, 59, 61, 64], [64, 69, 71, 73]),
        ],
        "keywords": {"five", "pros", "magnetic", "heat", "certificate"},
        "sfx": "real", "sfxDuckDb": -3.0,
    },
    "spot-to-store": {
        "key": "E minor lifting to E major", "seed": 109, "step": 1.0, "pattern": [0, 2, 1, 3, 2],
        "chords": [
            ("Em9", [40, 47, 50, 54, 55], [62, 66, 67, 71]),
            ("Cmaj7", [48, 52, 55, 59, 64], [64, 67, 71, 72]),
            ("D6/9", [50, 54, 57, 59, 64], [62, 66, 69, 71]),
            ("Gmaj9", [43, 50, 54, 57, 59], [62, 66, 67, 71]),
            ("B7sus4", [47, 52, 54, 57, 61], [64, 66, 69, 71]),
            ("E(add9)", [40, 47, 52, 54, 56, 59], [64, 66, 68, 71]),
        ],
        "keywords": {"price", "spot", "premium", "transparent", "charts"},
        "sfx": "spot", "sfxDuckDb": -3.0,
    },
    "bullion-tax": {
        "key": "D major", "seed": 127, "step": 1.0, "pattern": [0, 1, 2, 3, 2],
        "chords": [
            ("D(add9)", [50, 57, 62, 64, 66], [62, 66, 69, 74]),
            ("Gmaj7", [43, 50, 54, 59, 62], [62, 66, 67, 71]),
            ("Bm7", [47, 54, 57, 62, 66], [62, 66, 69, 71]),
            ("Asus4", [45, 52, 57, 59, 62], [64, 69, 71, 74]),
            ("D(add9)", [50, 57, 62, 64, 66, 69], [66, 69, 74, 78]),
        ],
        "keywords": {"silver", "states", "minimum", "york"},
        "sfx": "tax", "sfxDuckDb": -3.0,
    },
    # ---- premium-3: the FAQ series. Keys walk the circle of fifths (C, G, D, A, E); every film
    # opens on the same rising "question" figure (5th → 9th of its key) and resolves on its CTA.
    "faq-real-gold": {
        "key": "C major", "seed": 211, "step": 0.95, "pattern": [0, 2, 1, 3, 2], "motif": [67, 74],
        "chords": [
            ("Fmaj9", [41, 48, 52, 55, 57], [65, 67, 69, 72]),
            ("Am9", [45, 52, 55, 59, 60], [64, 67, 71, 72]),
            ("Dm9", [38, 45, 48, 53, 57], [62, 64, 65, 69]),
            ("Em7", [40, 47, 50, 55, 59], [62, 64, 67, 71]),
            ("Fmaj7", [41, 48, 52, 57, 60], [64, 65, 69, 72]),
            ("G6", [43, 50, 55, 59, 64], [62, 67, 71, 74]),
            ("Am(add9)", [45, 52, 57, 59, 60], [64, 69, 71, 72]),
            ("C/E(add9)", [40, 55, 60, 62, 64], [64, 67, 72, 74]),
            ("F6/9", [41, 48, 55, 57, 60, 62], [65, 67, 69, 72]),
            ("Gsus4(add9)", [43, 50, 55, 57, 60, 62], [62, 67, 69, 74]),
            ("C(add9)", [48, 55, 60, 62, 64, 67], [64, 67, 72, 76]),
        ],
        "keywords": {"real", "five", "magnetic", "genuine"},
        "sfx": "faq-real", "sfxDuckDb": -3.0,
    },
    "faq-sell-in-person": {
        "key": "G major", "seed": 223, "step": 0.9, "pattern": [0, 2, 1, 3, 2], "motif": [62, 69],
        "chords": [
            ("Cmaj9", [48, 52, 55, 59, 62], [64, 67, 71, 74]),
            ("Gmaj9", [43, 50, 54, 57, 59], [62, 66, 67, 71]),
            ("Em9", [40, 47, 50, 54, 55], [62, 66, 67, 71]),
            ("Cmaj7", [48, 52, 55, 59, 64], [64, 67, 71, 72]),
            ("D6/9", [50, 54, 57, 59, 64], [62, 66, 69, 71]),
            ("G/B(add9)", [47, 50, 55, 57, 62], [62, 67, 69, 71]),
            ("Dsus4(add9)", [50, 55, 57, 62, 64], [62, 67, 69, 74]),
            ("G(add9)", [43, 50, 55, 57, 59, 62], [67, 71, 74, 79]),
        ],
        "keywords": {"quick", "visual", "spot"},
        "sfx": "faq-sell", "sfxDuckDb": -3.0,
    },
    "faq-bar-or-eagle": {
        "key": "D major", "seed": 227, "step": 1.05, "pattern": [1, 2, 3, 2, 0], "motif": [69, 76],
        "chords": [
            ("Gmaj9", [43, 54, 57, 59, 62], [62, 66, 67, 71]),
            ("Bm9", [47, 54, 57, 61, 62], [61, 62, 66, 69]),
            ("Gmaj7", [43, 50, 54, 59, 62], [62, 66, 67, 71]),
            ("D/F#(add9)", [42, 50, 57, 62, 64], [62, 64, 66, 69]),
            ("Em9", [40, 47, 50, 54, 55], [62, 66, 67, 71]),
            ("A(add9)", [45, 52, 57, 59, 61], [64, 69, 71, 73]),
            ("Asus4(add9)", [45, 52, 57, 59, 62], [64, 69, 71, 74]),
            ("D(add9)", [50, 57, 62, 64, 66, 69], [66, 69, 74, 78]),
        ],
        "keywords": {"answer", "government", "liquid"},
        "sfx": "faq-bar", "sfxDuckDb": -3.0,
    },
    "faq-premium": {
        "key": "A major", "seed": 229, "step": 1.0, "pattern": [0, 1, 2, 3, 2], "motif": [64, 71],
        "chords": [
            ("Dmaj9", [50, 57, 61, 64, 66], [64, 66, 69, 73]),
            ("F#m9", [42, 49, 52, 56, 57], [61, 64, 66, 68]),
            ("Dmaj7", [50, 54, 57, 61, 66], [61, 64, 66, 69]),
            ("Bm9", [47, 54, 57, 61, 62], [61, 62, 66, 69]),
            ("E6", [40, 47, 52, 56, 61], [61, 64, 68, 71]),
            ("C#m7", [49, 56, 59, 64, 68], [61, 64, 68, 71]),
            ("Esus4(add9)", [40, 47, 52, 57, 59, 66], [64, 66, 69, 71]),
            ("A(add9)", [45, 52, 57, 59, 61, 64], [64, 69, 71, 73]),
        ],
        "keywords": {"fixed", "item", "plenty"},
        "sfx": "faq-premium", "sfxDuckDb": -3.0,
    },
    "faq-pickup": {
        "key": "E major", "seed": 233, "step": 0.95, "pattern": [0, 2, 1, 3, 2], "motif": [71, 78],
        "chords": [
            ("Amaj9", [45, 52, 56, 59, 61], [61, 64, 68, 71]),
            ("C#m9", [49, 56, 59, 63, 64], [63, 64, 68, 71]),
            ("Amaj7", [45, 52, 56, 61, 64], [61, 64, 68, 69]),
            ("E/G#(add9)", [44, 52, 59, 64, 66], [64, 66, 68, 71]),
            ("F#m9", [42, 49, 52, 56, 57], [61, 64, 66, 68]),
            ("B6/9", [47, 51, 54, 56, 61], [63, 66, 68, 71]),
            ("B7sus4", [47, 52, 54, 57, 61], [64, 66, 69, 71]),
            ("E(add9)", [40, 47, 52, 54, 56, 59], [64, 66, 68, 71]),
        ],
        "keywords": {"sometimes", "person", "easiest"},
        "sfx": "faq-pickup", "sfxDuckDb": -3.0,
    },
}


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def norm(word: str) -> str:
    return re.sub(r"[^a-z0-9]", "", word.lower())


def raised(t: np.ndarray, a: float, b: float) -> np.ndarray:
    """0 before a, 1 after b, raised-cosine in between."""
    x = np.clip((t - a) / max(b - a, 1e-6), 0, 1)
    return 0.5 - 0.5 * np.cos(np.pi * x)


def pan_gains(p: float) -> tuple[float, float]:
    angle = (p + 1) * np.pi / 4
    return float(np.cos(angle)), float(np.sin(angle))


class Bus:
    """A stereo bus with a reverb send."""

    def __init__(self, n: int):
        self.dry = np.zeros((n, 2))
        self.send = np.zeros(n)
        self.n = n

    def place(self, x: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.0, wet: float = 0.0,
              dry: float = 1.0) -> None:
        offset = int(round(at * RATE))
        if offset < 0:
            x = x[-offset:].copy()
            fade = min(len(x), int(0.005 * RATE))
            x[:fade] *= np.linspace(0, 1, fade)
            offset = 0
        stop = min(self.n, offset + len(x))
        if stop <= offset:
            return
        seg = x[: stop - offset] * gain
        l, r = pan_gains(pan)
        self.dry[offset:stop, 0] += seg * l * dry
        self.dry[offset:stop, 1] += seg * r * dry
        self.send[offset:stop] += seg * wet


# ---------------------------------------------------------------- instruments

def saw_table(f: float, fc: float, size: int = 4096) -> np.ndarray:
    k = np.arange(1, max(2, int(4800 / f)) + 1)
    amp = (1 / k) / np.sqrt(1 + (k * f / fc) ** 4)
    phase = np.arange(size) / size
    wave = (amp[:, None] * np.sin(2 * np.pi * k[:, None] * phase[None, :])).sum(0)
    return wave / np.abs(wave).max()


def oscillator(tab: np.ndarray, f: float, n: int, rng: np.random.Generator, cents: float) -> np.ndarray:
    t = np.arange(n) / RATE
    drift = 2.2 * np.sin(2 * np.pi * rng.uniform(0.06, 0.15) * t + rng.uniform(0, 2 * np.pi))
    freq = f * 2 ** ((cents + drift) / 1200)
    idx = ((rng.uniform() + np.cumsum(freq) / RATE) % 1.0) * len(tab)
    i0 = idx.astype(np.int64)
    frac = idx - i0
    return tab[i0] * (1 - frac) + tab[(i0 + 1) % len(tab)] * frac


def pad_chord(bus: Bus, notes: list[int], t0: float, t_full: float, t_out: float, t_end: float,
              rng: np.random.Generator, gain: float, bright: tuple[float, float] = (0.15, 0.55)) -> None:
    """Chord fades in t0→t_full, holds, fades out t_out→t_end. Filter opens during the attack."""
    start = max(0.0, t0)
    n = int((t_end - start) * RATE)
    if n <= 0:
        return
    t = start + np.arange(n) / RATE
    env = raised(t, t0, t_full) * (1 - raised(t, t_out, t_end))
    # "Breathing" brightness: opens through the attack, relaxes slowly afterwards.
    open_ = raised(t, t0, t_full + 0.8)
    mix = bright[0] + (bright[1] - bright[0]) * open_ * (0.85 + 0.15 * np.cos(2 * np.pi * 0.07 * (t - t0)))
    for j, note in enumerate(notes):
        f = midi(note)
        dark_tab, bright_tab = saw_table(f, 700), saw_table(f, 1900)
        note_gain = (0.75 if j == 0 else 1.0) / np.sqrt(len(notes))
        for cents, p in ((-6.5, -0.65), (0.0, 0.0), (6.5, 0.65)):
            c = cents + rng.uniform(-1.2, 1.2)
            dark = oscillator(dark_tab, f, n, rng, c)
            brt = oscillator(bright_tab, f, n, rng, c)
            voice = (dark * (1 - mix) + brt * mix) * env * note_gain / 3
            bus.place(voice, start, gain=gain, pan=p * 0.9, wet=0.32)


def sub_tone(bus: Bus, bass: int, t0: float, t_full: float, t_out: float, t_end: float, gain: float) -> None:
    f = midi(bass - 12)
    if f < 40:
        f = midi(bass)
    start = max(0.0, t0)
    n = int((t_end - start) * RATE)
    t = start + np.arange(n) / RATE
    env = raised(t, t0, t_full) * (1 - raised(t, t_out, t_end))
    bus.place(np.sin(2 * np.pi * f * (t - start)) * env, start, gain=gain)


def felt_piano(f: float, dur: float, vel: float, rng: np.random.Generator) -> np.ndarray:
    n = int(dur * RATE)
    t = np.arange(n) / RATE
    out = np.zeros(n)
    inharm = 0.00032
    for k in range(1, 14):
        fk = k * f * np.sqrt(1 + inharm * k * k)
        if fk > 9500:
            break
        amp = vel ** (1 + 0.3 * (k - 1)) / k ** 1.2
        tau = 2.2 / (1 + 0.6 * (k - 1))
        phase = rng.uniform(0, 2 * np.pi)
        partial = np.sin(2 * np.pi * fk * t + phase)
        if k <= 4:  # two slightly detuned strings → gentle beating
            partial = 0.6 * partial + 0.4 * np.sin(2 * np.pi * fk * 1.0006 * t + phase + 0.7)
        out += amp * np.exp(-t / tau) * partial
    out *= np.minimum(t / 0.005, 1)
    hammer = sosfilt(butter(2, 1400, "low", fs=RATE, output="sos"), rng.normal(0, 1, n))
    out += hammer * np.exp(-t / 0.014) * 0.06 * vel
    out *= np.clip((dur - t) / 0.28, 0, 1)
    return out / (np.abs(out).max() + 1e-9) * vel


def bell(f: float, rng: np.random.Generator, dur: float = 2.8) -> np.ndarray:
    n = int(dur * RATE)
    t = np.arange(n) / RATE
    out = np.zeros(n)
    for ratio, amp, tau in ((1, 1, 1.5), (2.0, 0.42, 0.95), (2.76, 0.3, 0.7), (4.07, 0.15, 0.42), (5.43, 0.09, 0.26)):
        if f * ratio > 15000:
            continue
        out += amp * np.exp(-t / tau) * np.sin(2 * np.pi * f * ratio * t + rng.uniform(0, 2 * np.pi))
    out *= np.minimum(t / 0.003, 1) * np.clip((dur - t) / 0.3, 0, 1)
    return out / (np.abs(out).max() + 1e-9)


def swept_noise(rng: np.random.Generator, dur: float, f0: float, f1: float, width: float = 0.55,
                curve: float = 1.4) -> np.ndarray:
    n = int(dur * RATE)
    noise = rng.normal(0, 1, n + 2048)
    freqs, times, z = stft(noise, fs=RATE, nperseg=1024, noverlap=768)
    prog = np.clip(times / dur, 0, 1) ** curve
    fc = f0 * (f1 / f0) ** prog
    logf = np.log2(np.maximum(freqs, 1.0))[:, None]
    mask = np.exp(-0.5 * ((logf - np.log2(fc)[None, :]) / width) ** 2)
    _, x = istft(z * mask, fs=RATE, nperseg=1024, noverlap=768)
    x = x[:n]
    return x / (np.abs(x).max() + 1e-9)


def make_ir(rng: np.random.Generator, rt: float = 2.7, length: float = 3.8, predelay: float = 0.024) -> np.ndarray:
    n = int(length * RATE)
    t = np.arange(n) / RATE
    lp = butter(2, 2800, "low", fs=RATE, output="sos")
    chans = []
    for _ in range(2):
        early = rng.normal(0, 1, n) * np.exp(-6.91 * t / (rt * 0.4))
        late = sosfilt(lp, rng.normal(0, 1, n)) * np.exp(-6.91 * t / rt) * 1.6
        ir = (0.45 * early + late) * np.minimum(t / 0.018, 1)
        ir *= np.clip((length - t) / 0.4, 0, 1)
        chans.append(np.concatenate([np.zeros(int(predelay * RATE)), ir]))
    irs = np.array(chans)
    return irs / np.sqrt((irs ** 2).sum(axis=1).mean())


# ---------------------------------------------------------------- sound design

def impact(rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    dur = 1.6
    n = int(dur * RATE)
    t = np.arange(n) / RATE
    f = 38 + 22 * np.exp(-t / 0.11)
    sub = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.minimum(t / 0.004, 1) * np.exp(-t / 0.5)
    thump = sosfilt(butter(2, 170, "low", fs=RATE, output="sos"), rng.normal(0, 1, n))
    thump = thump / (np.abs(thump).max() + 1e-9) * np.exp(-t / 0.05) * np.minimum(t / 0.002, 1)
    air = sosfilt(butter(2, 3800, "high", fs=RATE, output="sos"), rng.normal(0, 1, n))
    air = air / (np.abs(air).max() + 1e-9) * np.exp(-t / 0.22) * np.minimum(t / 0.003, 1)
    fade = np.clip((dur - t) / 0.08, 0, 1)
    return (sub + 0.35 * thump) * fade, air * fade


def reverse_swell(notes: list[int], ir: np.ndarray, rng: np.random.Generator, dur: float = 0.85) -> np.ndarray:
    tone = sum(felt_piano(midi(nt), 1.6, 0.8 - 0.15 * i, rng) for i, nt in enumerate(notes))
    wet = oaconvolve(tone, ir[: int(1.9 * RATE)])[: int(2.2 * RATE)]
    rev = wet[::-1][-int(dur * RATE):].copy()
    n = len(rev)
    rev *= np.minimum(np.arange(n) / (0.06 * RATE), 1)
    rev[-int(0.006 * RATE):] *= np.linspace(1, 0, int(0.006 * RATE))
    return rev / (np.abs(rev).max() + 1e-9)


def light_on(rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    dur = 3.2
    n = int(dur * RATE)
    t = np.arange(n) / RATE
    air = swept_noise(rng, dur, 1800, 6500, width=0.9, curve=0.6)
    env = np.where(t < 0.6, (t / 0.6) ** 2, np.exp(-(t - 0.6) / 0.9))
    air *= env * np.clip((dur - t) / 0.3, 0, 1)
    f = 36 + 16 * np.exp(-t / 0.2)
    boom = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.minimum(t / 0.02, 1) * np.exp(-t / 1.0)
    boom *= np.clip((dur - t) / 0.3, 0, 1)
    return air, boom


# ---------------------------------------------------------------- loudness helpers

def measure(path: Path) -> dict:
    """EBU R128 integrated loudness, LRA and true peak (ffmpeg ebur128)."""
    result = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-i", str(path), "-af", "ebur128=peak=true",
                             "-f", "null", "-"], check=True, capture_output=True, text=True)
    summary = result.stderr[result.stderr.rindex("Summary:"):]
    grab = lambda label: float(re.search(label + r":\s+(-?[\d.]+|-inf)", summary).group(1))
    return {"integratedLufs": grab("I"), "lra": grab("LRA"), "truePeakDbtp": grab("Peak")}


def click_stats(x: np.ndarray) -> dict:
    d1 = np.abs(np.diff(x, axis=0)).max()
    d2 = np.abs(np.diff(x, n=2, axis=0))
    ratio = float(d2.max() / (np.percentile(d2, 99.99) + 1e-12))
    return {"maxStep": round(float(d1), 5), "secondDiffOutlierRatio": round(ratio, 2),
            "dcOffset": [round(float(v), 7) for v in x.mean(axis=0)],
            "firstSample": round(float(np.abs(x[0]).max()), 6), "lastSample": round(float(np.abs(x[-1]).max()), 6)}


def ducking(voice: np.ndarray, n: int, depth: float = DUCK_DB) -> np.ndarray:
    hop = int(0.01 * RATE)
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    frames = int(np.ceil(n / hop))
    padded = np.pad(voice, (0, frames * hop - n))
    rms = np.sqrt((padded.reshape(frames, hop) ** 2).mean(axis=1))
    speech = 20 * np.log10(rms + 1e-9) > -42
    # 60 ms lookahead, 250 ms hold so word gaps don't pump.
    speech = np.convolve(speech.astype(float), np.ones(31), mode="full")[:frames] > 0  # hold (forward)
    speech = np.concatenate([speech[6:], np.zeros(6, bool)]) | speech                  # lookahead
    target = np.where(speech, depth, 0.0)
    gain = np.zeros(frames)
    level = 0.0
    a_att, a_rel = np.exp(-1 / 8.0), np.exp(-1 / 35.0)  # 80 ms attack, 350 ms release
    for i, tg in enumerate(target):
        a = a_att if tg < level else a_rel
        level = a * level + (1 - a) * tg
        gain[i] = level
    curve = np.interp(np.arange(n), np.arange(frames) * hop + hop / 2, gain)
    return 10 ** (curve / 20)



# ---------------------------------------------------------------- bespoke sound design (premium-2)

def _t(dur: float) -> np.ndarray:
    return np.arange(int(dur * RATE)) / RATE


def _finish(x: np.ndarray, attack: float = 0.0015, release: float = 0.03) -> np.ndarray:
    t = np.arange(len(x)) / RATE
    x = x * np.minimum(t / max(attack, 1e-4), 1) * np.clip((t[-1] - t) / release, 0, 1)
    return x / (np.abs(x).max() + 1e-9)


def _add(dst: np.ndarray, src: np.ndarray, i: int = 0) -> None:
    """dst[i:] += src, clipped to dst's length."""
    m = max(0, min(len(src), len(dst) - i))
    dst[i: i + m] += src[:m]


def _band(x: np.ndarray, lo: float, hi: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, [lo, hi], "band", fs=RATE, output="sos"), x)


def modal(freqs: list[tuple[float, float, float]], dur: float, rng: np.random.Generator) -> np.ndarray:
    """Sum of decaying sine modes: (frequency Hz, amplitude, decay seconds)."""
    t = _t(dur)
    out = np.zeros(len(t))
    for f, amp, tau in freqs:
        if f < 18000:
            out += amp * np.exp(-t / tau) * np.sin(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi))
    return out


def strike(rng: np.random.Generator, lo: float, hi: float, tau: float, dur: float = 0.05) -> np.ndarray:
    t = _t(dur)
    return _band(rng.normal(0, 1, len(t)), lo, hi) * np.exp(-t / tau)


def coin_clink(rng: np.random.Generator, bright: float = 1.0) -> np.ndarray:
    """A small gold coin touching another: high, short, slightly glassy."""
    f = rng.uniform(2700, 3900) * bright
    body = modal([(f, 1, 0.16), (f * 1.72, 0.55, 0.11), (f * 2.43, 0.4, 0.08), (f * 3.05, 0.22, 0.06),
                  (f * 4.6, 0.12, 0.04)], 0.55, rng)
    hit = np.zeros(len(body))
    click = strike(rng, 3500, 11000, 0.0025, 0.03)
    _add(hit, click * 0.5)
    return _finish(body + hit, release=0.05)


def silver_tap(rng: np.random.Generator) -> np.ndarray:
    """A gentle tap on a silver coin: lower, longer, softer transient."""
    f = rng.uniform(2050, 2350)
    body = modal([(f, 1, 0.42), (f * 1.69, 0.5, 0.26), (f * 2.38, 0.35, 0.17), (f * 3.4, 0.15, 0.09)], 0.9, rng)
    click = strike(rng, 1800, 6000, 0.003, 0.03)
    _add(body, click * 0.25)
    return _finish(body, attack=0.002, release=0.08)


def coin_ring(rng: np.random.Generator) -> np.ndarray:
    """The hero 'ping' of a real silver coin: inharmonic plate modes, ~1.8 s ring with gentle beating."""
    modes = [(1410, 1.0, 1.8), (1415.5, 0.55, 1.75), (2440, 0.62, 1.3), (3250, 0.45, 0.95), (5410, 0.3, 0.62),
             (5462, 0.26, 0.6), (7620, 0.12, 0.34)]
    body = modal(modes, 2.6, rng)
    click = strike(rng, 2500, 9000, 0.002, 0.04)
    _add(body, click * 0.35)
    return _finish(body, attack=0.001, release=0.25)


def magnet_clack_slide(rng: np.random.Generator) -> np.ndarray:
    t = _t(0.95)
    out = np.zeros(len(t))
    clack = modal([(3100, 1, 0.035), (4720, 0.7, 0.025), (6250, 0.4, 0.018)], 0.2, rng)
    _add(clack, strike(rng, 2000, 7000, 0.004, 0.025) * 0.8)
    thud = np.sin(2 * np.pi * 120 * _t(0.12)) * np.exp(-_t(0.12) / 0.03)
    _add(out, clack)
    _add(out, thud * 0.5)
    # Friction as the magnet slides away: grainy band-passed noise, fading out.
    start = int(0.14 * RATE)
    slide_t = t[start:] - t[start]
    grain = np.abs(sosfilt(butter(2, 35, "low", fs=RATE, output="sos"), rng.normal(0, 1, len(slide_t))))
    grain /= grain.max() + 1e-9
    fric = _band(rng.normal(0, 1, len(slide_t)), 1200, 3600) * (0.4 + 0.6 * grain)
    fric *= np.minimum(slide_t / 0.05, 1) * np.exp(-slide_t / 0.3)
    out[start:] += fric * 0.35
    return _finish(out, release=0.08)


def ice_crackle_drip(rng: np.random.Generator) -> np.ndarray:
    dur = 1.6
    t = _t(dur)
    out = np.zeros(len(t))
    for _ in range(46):
        at = int(rng.uniform(0, 1.2) ** 1.6 * RATE)
        c = strike(rng, 2500, 9000, rng.uniform(0.0008, 0.002), 0.012) * rng.uniform(0.2, 1.0)
        _add(out, c, at)
    fizz = sosfilt(butter(2, 6000, "high", fs=RATE, output="sos"), rng.normal(0, 1, len(t)))
    out += fizz * 0.04 * np.exp(-t / 0.7)
    # One drip: a quick rising "bloop" plus a tiny splash.
    at = int(0.95 * RATE)
    dt = _t(0.14)
    freq = 850 + 900 * np.minimum(dt / 0.03, 1)
    bloop = np.sin(2 * np.pi * np.cumsum(freq) / RATE) * np.exp(-dt / 0.035) * np.minimum(dt / 0.002, 1)
    _add(out, bloop * 0.9, at)
    sp = strike(rng, 3000, 9000, 0.006, 0.04) * 0.25
    _add(out, sp, at + 300)
    return _finish(out, release=0.1)


def beep(f: float = 2750.0, dur: float = 0.085) -> np.ndarray:
    t = _t(dur)
    x = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 3 * f * t)
    return _finish(x, attack=0.004, release=0.012)


def confirm_tick(rng: np.random.Generator) -> np.ndarray:
    t = _t(0.16)
    x = np.sin(2 * np.pi * 1900 * t) * np.exp(-t / 0.035)
    c = strike(rng, 2500, 8000, 0.0015, 0.02)
    _add(x, c * 0.6)
    return _finish(x, attack=0.001, release=0.02)


def warm_swell(tones: list[int], rng: np.random.Generator, dur: float = 2.2) -> np.ndarray:
    t = _t(dur)
    x = np.zeros(len(t))
    for i, n in enumerate(tones):
        f = midi(n - 12)
        x += np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * (0.8 ** i)
    air = sosfilt(butter(2, [1500, 5000], "band", fs=RATE, output="sos"), rng.normal(0, 1, len(t))) * 0.05
    env = raised(t, 0, 0.9) * (1 - raised(t, dur - 0.9, dur))
    return _finish((x / len(tones) + air) * env, attack=0.01, release=0.05)


def padlock(rng: np.random.Generator) -> np.ndarray:
    t = _t(0.3)
    out = np.zeros(len(t))
    for at, f, g in ((0.0, 2300, 0.6), (0.042, 1950, 1.0)):
        c = modal([(f, 1, 0.025), (f * 1.53, 0.6, 0.018), (f * 2.4, 0.35, 0.012)], 0.12, rng)
        _add(c, strike(rng, 2500, 9000, 0.0012, 0.019) * 0.9)
        i = int(at * RATE)
        _add(out, c * g, i)
    return _finish(out, attack=0.0005, release=0.04)


def printer(rng: np.random.Generator, dur: float = 0.62) -> np.ndarray:
    t = _t(dur)
    out = np.zeros(len(t))
    at = 0.0
    while at < dur - 0.03:
        c = strike(rng, 1500, 4200, 0.002, 0.015) * rng.uniform(0.6, 1.0)
        i = int(at * RATE)
        _add(out, c, i)
        at += 1 / 28 + rng.uniform(-0.004, 0.004)
    motor = sosfilt(butter(2, 650, "low", fs=RATE, output="sos"),
                    np.sign(np.sin(2 * np.pi * 185 * t)) + 0.3 * rng.normal(0, 1, len(t)))
    out += motor * 0.08
    env = raised(t, 0, 0.05) * (1 - raised(t, dur - 0.08, dur))
    return _finish(out * env)


def stamp(rng: np.random.Generator) -> np.ndarray:
    t = _t(0.5)
    f = 55 + 45 * np.exp(-t / 0.03)
    thud = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-t / 0.12)
    slap = sosfilt(butter(2, 2600, "low", fs=RATE, output="sos"), rng.normal(0, 1, len(t))) * np.exp(-t / 0.022)
    knock = modal([(220, 0.5, 0.05), (410, 0.35, 0.035)], 0.5, rng)
    return _finish(thud + 0.5 * slap / (np.abs(slap).max() + 1e-9) + 0.4 * knock, attack=0.0008, release=0.08)


def blip(f: float, dur: float = 0.12) -> np.ndarray:
    t = _t(dur)
    x = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.03)
    return _finish(x, attack=0.002, release=0.01)


def tick(rng: np.random.Generator, f: float) -> np.ndarray:
    c = modal([(f, 1, 0.008), (f * 1.6, 0.5, 0.006)], 0.05, rng)
    _add(c, strike(rng, 2000, 8000, 0.0008, 0.0083) * 0.5)
    return _finish(c, attack=0.0004, release=0.01)


def ping(f: float, rng: np.random.Generator) -> np.ndarray:
    return _finish(modal([(f, 1, 0.42), (f * 2.0, 0.3, 0.24), (f * 2.76, 0.18, 0.14)], 1.0, rng), release=0.1)


def paper_rustle(rng: np.random.Generator, dur: float = 0.55) -> np.ndarray:
    t = _t(dur)
    noise = _band(rng.normal(0, 1, len(t)), 1500, 7500)
    crinkle = np.abs(sosfilt(butter(2, 60, "low", fs=RATE, output="sos"), rng.normal(0, 1, len(t))))
    crinkle = (crinkle / (crinkle.max() + 1e-9)) ** 2.5
    env = raised(t, 0, 0.06) * (1 - raised(t, dur - 0.2, dur))
    return _finish(noise * (0.15 + crinkle) * env)


def typing_run(rng: np.random.Generator, keys: int = 11) -> tuple[np.ndarray, float]:
    times, at = [], 0.0
    for _ in range(keys):
        times.append(at)
        at += rng.uniform(0.07, 0.12)
    dur = at + 0.15
    out = np.zeros(int(dur * RATE))
    for k, tt in enumerate(times):
        c = strike(rng, 1800, 5200, 0.0025, 0.02) * rng.uniform(0.55, 0.9)
        th = np.sin(2 * np.pi * 260 * _t(0.03)) * np.exp(-_t(0.03) / 0.008) * 0.4
        if k == keys - 1:  # the final keystroke lands a bit firmer
            c *= 1.3
        i = int(tt * RATE)
        _add(out, c, i)
        _add(out, th, i)
    return _finish(out, release=0.05), dur


def shimmer_up(rng: np.random.Generator, dur: float = 1.4) -> np.ndarray:
    air = swept_noise(rng, dur, 1800, 9000, width=0.7, curve=0.8)
    t = np.arange(len(air)) / RATE
    return _finish(air * raised(t, 0, dur * 0.6) * (1 - raised(t, dur * 0.7, dur)), attack=0.02, release=0.1)


# ---------------------------------------------------------------- bespoke sound design (premium-3 FAQ)

def analyzer_scan(rng: np.random.Generator, dur: float = 1.1) -> np.ndarray:
    """A testing instrument at work: a soft rising band sweep over a faint electronic hum."""
    t = _t(dur)
    sweep = swept_noise(rng, dur, 900, 5200, width=0.35, curve=1.1)
    hum = np.sin(2 * np.pi * 120 * t) * 0.5 + np.sin(2 * np.pi * 240 * t) * 0.25
    tone = np.sin(2 * np.pi * np.cumsum(600 + 900 * (t / dur) ** 1.4) / RATE)
    env = raised(t, 0, 0.12) * (1 - raised(t, dur - 0.15, dur))
    return _finish((0.6 * sweep + 0.08 * hum + 0.18 * tone) * env, attack=0.01, release=0.05)


def confirm_chime() -> np.ndarray:
    """Two-tone positive confirmation (a fourth up), clean and quick."""
    out = np.zeros(int(0.42 * RATE))
    for at, f in ((0.0, 1320.0), (0.11, 1760.0)):
        t = _t(0.3)
        x = (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.09)
        _add(out, x * np.minimum(t / 0.003, 1), int(at * RATE))
    return _finish(out, attack=0.002, release=0.03)


def tape_seal(rng: np.random.Generator) -> np.ndarray:
    """Packing tape pulled across a box, then a soft cardboard pat."""
    dur = 0.62
    t = _t(dur)
    rip = _band(rng.normal(0, 1, len(t)), 900, 5000)
    grain = np.abs(sosfilt(butter(2, 90, "low", fs=RATE, output="sos"), rng.normal(0, 1, len(t))))
    rip *= (0.3 + grain / (grain.max() + 1e-9)) * raised(t, 0, 0.04) * (1 - raised(t, 0.34, 0.42))
    pat_t = _t(0.2)
    pat = sosfilt(butter(2, 900, "low", fs=RATE, output="sos"), rng.normal(0, 1, len(pat_t))) * np.exp(-pat_t / 0.025)
    pat += np.sin(2 * np.pi * 150 * pat_t) * np.exp(-pat_t / 0.04) * 0.6
    out = rip * 0.7
    _add(out, pat / (np.abs(pat).max() + 1e-9) * 0.8, int(0.44 * RATE))
    return _finish(out, release=0.05)


def swipe(rng: np.random.Generator, dur: float = 0.24) -> np.ndarray:
    """A quick strike-through: band-swept noise falling in pitch."""
    x = swept_noise(rng, dur, 5200, 900, width=0.4, curve=0.8)
    t = np.arange(len(x)) / RATE
    return _finish(x * raised(t, 0, 0.03) * (1 - raised(t, dur * 0.55, dur)), attack=0.004, release=0.02)


def glint(rng: np.random.Generator) -> np.ndarray:
    """A loupe catching the light: a tiny bright bell over a breath of air."""
    t = _t(0.9)
    x = modal([(3520, 1, 0.22), (5280, 0.45, 0.14), (7040, 0.25, 0.09)], 0.9, rng)
    air = sosfilt(butter(2, 7000, "high", fs=RATE, output="sos"), rng.normal(0, 1, len(t))) * np.exp(-t / 0.08) * 0.15
    return _finish(x + air, attack=0.004, release=0.08)


def page_turn(rng: np.random.Generator, dur: float = 0.55) -> np.ndarray:
    """A page flipping over, trailing into an airy 'time passing' whoosh."""
    t = _t(dur)
    flip = _band(rng.normal(0, 1, len(t)), 1200, 7000) * np.exp(-t / 0.06) * np.minimum(t / 0.004, 1)
    whoosh = swept_noise(rng, dur, 700, 3200, width=0.6, curve=0.7) * raised(t, 0, 0.15) * (1 - raised(t, 0.3, dur))
    return _finish(0.7 * flip / (np.abs(flip).max() + 1e-9) + 0.45 * whoosh, release=0.05)


def glide(f0: float, f1: float, dur: float = 0.55) -> np.ndarray:
    """A clean pitch glide (rising or falling) with a little second harmonic."""
    t = _t(dur)
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / RATE
    x = (np.sin(ph) + 0.18 * np.sin(2 * ph)) * raised(t, 0, 0.05) * (1 - raised(t, dur * 0.6, dur))
    return _finish(x, attack=0.004, release=0.03)


def calendar_flip(rng: np.random.Generator) -> np.ndarray:
    t = _t(0.09)
    x = _band(rng.normal(0, 1, len(t)), 1500, 6500) * np.exp(-t / 0.018)
    _add(x, strike(rng, 900, 2600, 0.004, 0.03) * 0.5, int(0.02 * RATE))
    return _finish(x, attack=0.001, release=0.01)


def ship_thud(rng: np.random.Generator) -> np.ndarray:
    """A parcel set down: low cardboard thump with a short box resonance."""
    t = _t(0.45)
    f = 70 + 50 * np.exp(-t / 0.02)
    thump = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-t / 0.07)
    box = modal([(180, 0.5, 0.06), (310, 0.35, 0.04), (520, 0.2, 0.03)], 0.45, rng)
    slap = sosfilt(butter(2, 1500, "low", fs=RATE, output="sos"), rng.normal(0, 1, len(t))) * np.exp(-t / 0.015)
    return _finish(thump + box + 0.3 * slap / (np.abs(slap).max() + 1e-9), attack=0.0008, release=0.06)


def phone_tap() -> np.ndarray:
    """Two soft touch-tone taps (dual-tone, low level)."""
    out = np.zeros(int(0.32 * RATE))
    for at, (lo, hi) in ((0.0, (770, 1336)), (0.14, (852, 1477))):
        t = _t(0.09)
        x = (np.sin(2 * np.pi * lo * t) + np.sin(2 * np.pi * hi * t)) * raised(t, 0, 0.006) * (1 - raised(t, 0.07, 0.09))
        _add(out, x * 0.5, int(at * RATE))
    return _finish(out, attack=0.002, release=0.02)


def faq_motif(music: Bus, motif: list[int], rng: np.random.Generator) -> list[dict]:
    """The series' question figure: two rising notes (5th → 9th), felt piano doubled by a bell."""
    events = []
    for j, (note, t0) in enumerate(zip(motif, (0.14, 0.44))):
        music.place(felt_piano(midi(note), 2.4, 0.66 - 0.06 * j, rng), t0, gain=0.2, pan=(-0.2, 0.2)[j], wet=0.6, dry=0.55)
        music.place(bell(midi(note + 12), rng, dur=2.6), t0 + 0.01, gain=0.055, pan=(-0.3, 0.3)[j], wet=1.0, dry=0.3)
        events.append({"t": t0, "type": "question-motif", "detail": f"{NAMES[note % 12]}{note // 12 - 1}"})
    return events


def word_time(data: dict, scene: str, key: str, occurrence: int = 0) -> float | None:
    words = next((s["words"] for s in data["scenes"] if s["id"] == scene), [])
    hits = [w for w in words if norm(w["word"]) == key]
    return float(hits[occurrence]["start"]) if len(hits) > occurrence else None


def bespoke(kind: str, data: dict, sfx: Bus, music: Bus, rng: np.random.Generator,
            scene_chords: list, scene_ids: list[str]) -> list[dict]:
    """Word-synced sound design for the premium-2 films. Uses its own RNG."""
    events: list[dict] = []

    def at(scene: str, key: str, occ: int = 0) -> float | None:
        return word_time(data, scene, key, occ)

    def put(t: float | None, x: np.ndarray, gain: float, label: str, pan: float = 0.0, wet: float = 0.15, dry: float = 1.0,
            bus: Bus | None = None) -> None:
        if t is None:
            return
        (bus or sfx).place(x, t, gain=gain, pan=pan, wet=wet, dry=dry)
        events.append({"t": round(t, 3), "type": "sfx", "detail": label})

    def tones(scene: str) -> list[int]:
        return scene_chords[scene_ids.index(scene)][2]

    if kind == "traditions":
        t0 = at("arras", "coins")
        if t0 is not None:  # 13 small gold coins poured hand to hand
            offsets = np.cumsum([0.0] + list(rng.uniform(0.06, 0.13, 12)))
            for k, o in enumerate(offsets):
                sfx.place(coin_clink(rng), t0 + o, gain=0.11 * (0.75 + 0.25 * rng.uniform()), pan=-0.4 + 0.8 * k / 12,
                          wet=0.3)
            events.append({"t": round(t0, 3), "type": "sfx", "detail": "13 gold-coin clinks (las arras)"})
        t1 = at("pidyon", "five")
        if t1 is not None:  # five gentle silver taps, counted out
            for k in range(5):
                sfx.place(silver_tap(rng), t1 + 0.05 + k * 0.24, gain=0.1, pan=-0.3 + 0.15 * k, wet=0.35)
            events.append({"t": round(t1 + 0.05, 3), "type": "sfx", "detail": "five silver taps"})
        for key, gain in (("dhanteras", 0.045), ("lakshmi", 0.07)):
            t = at("dhanteras", key)
            put(t, shimmer_up(rng, 1.2), gain, f"warm shimmer ({key})", wet=0.7, dry=0.5)
            if t is not None:
                for j, nt in enumerate(sorted(tones("dhanteras"))[:3]):
                    music.place(bell(midi(nt + 12), rng), t + 0.08 + 0.07 * j, gain=gain * 0.7, pan=(-0.3, 0.3)[j % 2],
                                wet=1.0, dry=0.3)
        t = at("lunar", "envelope")
        put(t, paper_rustle(rng), 0.08, "red-envelope paper rustle", pan=0.2, wet=0.1)
        if t is not None:
            music.place(bell(midi(tones("lunar")[2] + 12), rng), t + 0.32, gain=0.065, pan=-0.2, wet=1.0, dry=0.3)
            events.append({"t": round(t + 0.32, 3), "type": "sfx", "detail": "envelope bell"})
        t = at("sovereign", "sovereign")
        if t is not None:  # one noble chime: low bell + octave
            root = tones("sovereign")[0]
            music.place(bell(midi(root), rng, dur=3.6), t + 0.05, gain=0.09, wet=1.0, dry=0.45)
            music.place(bell(midi(root + 12), rng, dur=3.0), t + 0.06, gain=0.045, wet=1.0, dry=0.3)
            events.append({"t": round(t + 0.05, 3), "type": "sfx", "detail": "noble sovereign chime"})

    elif kind == "sell":
        put(at("lock", "lock"), padlock(rng), 0.2, "padlock click", wet=0.08)
        put(at("ship", "label"), printer(rng), 0.075, "label printer chatter", pan=0.15, wet=0.05)
        put(at("pay", "approval"), stamp(rng), 0.26, "approval stamp", wet=0.12)
        t = at("pay", "paid")
        if t is not None:
            tt = sorted(tones("pay"))
            music.place(bell(midi(tt[1] + 12), rng), t, gain=0.07, pan=-0.2, wet=1.0, dry=0.4)
            music.place(bell(midi(tt[3] + 12), rng), t + 0.17, gain=0.07, pan=0.2, wet=1.0, dry=0.4)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "two-note payment chime"})

    elif kind == "real":
        put(at("magnet", "stick"), magnet_clack_slide(rng), 0.17, "magnet clack + slide", pan=-0.1, wet=0.08)
        put(at("ice", "melting"), ice_crackle_drip(rng), 0.06, "ice crackle + drip", pan=0.1, wet=0.12)
        put(at("ping", "rings"), coin_ring(rng), 0.42, "hero coin ring (~1.8 s)", wet=0.3)
        t = at("specs", "weight")
        if t is not None:
            sfx.place(beep(), t, gain=0.07, wet=0.03)
            sfx.place(beep(), t + 0.13, gain=0.07, wet=0.03)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "scale double beep"})
        put(at("specs", "match"), confirm_tick(rng), 0.09, "confirm tick (spec)", wet=0.1)
        put(at("serial", "match"), confirm_tick(rng), 0.09, "confirm tick (serial)", wet=0.1)
        put(at("source", "trust"), warm_swell(tones("source"), rng), 0.12, "warm swell (trust)", wet=0.5, bus=music)

    elif kind == "spot":
        ids = scene_ids
        cut_spot = float(data["scenes"][ids.index("spot")]["visualStart"])
        cut_next = float(data["scenes"][ids.index("premium")]["visualStart"])
        tt, k = cut_spot + 0.25, 0
        while tt < cut_next - 0.4:  # a soft clock under the 'around the clock' scene
            sfx.place(tick(rng, 3300 if k % 2 == 0 else 2550), tt, gain=0.035, pan=(-0.15, 0.15)[k % 2], wet=0.05)
            tt += 0.5
            k += 1
        events.append({"t": round(cut_spot + 0.25, 3), "type": "sfx", "detail": f"clock tick bed ({k} ticks)"})
        for i, key in enumerate(("refining", "minting", "insurance", "shipping")):
            put(at("premium", key), blip(1600 + 220 * i), 0.06, f"data blip ({key})", pan=-0.3 + 0.2 * i, wet=0.1)
        t = at("store", "minutes")
        if t is not None:  # quick re-price ripple
            for j, f in enumerate((1320, 1480, 1760, 1980, 2350)):
                sfx.place(blip(f, 0.09), t + 0.035 * j, gain=0.045, pan=-0.4 + 0.2 * j, wet=0.12)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "re-price ripple"})
        for i, key in enumerate(("gold", "silver", "platinum", "palladium")):
            put(at("charts", key), tick(rng, 2400 + 260 * i), 0.07, f"chart tick ({key})", pan=-0.3 + 0.2 * i, wet=0.2)

    elif kind == "tax":
        t = at("hook", "state")
        put(t, shimmer_up(rng, 1.5), 0.06, "map-reveal shimmer", wet=0.6, dry=0.5)
        if t is not None:
            for j, nt in enumerate(sorted(tones("hook"))):
                music.place(bell(midi(nt + 12), rng), t + 0.25 + 0.08 * j, gain=0.04, pan=-0.4 + 0.27 * j, wet=1.0, dry=0.3)
        for key, f in (("taxfree", 1980), ("collector", 1760), ("jewelry", 1570)):
            put(at("basics", key), ping(f, rng), 0.07, f"soft ping ({key})", pan=0.1, wet=0.35)
        put(at("minimum", "taxfree"), stamp(rng), 0.24, "tax-free stamp (New York)", wet=0.12)
        t = at("guide", "guide")
        if t is not None:
            run, _dur = typing_run(rng)
            sfx.place(run, t, gain=0.08, pan=0.1, wet=0.05)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "keyboard tick run"})

    # ---- premium-3: the FAQ series
    elif kind == "faq-real":
        put(at("magnet", "stick"), magnet_clack_slide(rng), 0.17, "magnet clack + slide", pan=-0.1, wet=0.08)
        put(at("ice", "melting"), ice_crackle_drip(rng), 0.06, "ice crackle + drip", pan=0.1, wet=0.12)
        put(at("ping", "rings"), coin_ring(rng), 0.42, "hero coin ring (~1.8 s)", wet=0.3)
        t = at("specs", "weight")
        if t is not None:
            sfx.place(beep(), t, gain=0.07, wet=0.03)
            sfx.place(beep(), t + 0.13, gain=0.07, wet=0.03)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "scale double beep"})
        put(at("specs", "match"), confirm_tick(rng), 0.09, "confirm tick (spec)", wet=0.1)
        put(at("serial", "match"), confirm_tick(rng), 0.09, "confirm tick (serial)", wet=0.1)
        t = at("office", "testing")
        put(t, analyzer_scan(rng), 0.07, "analyzer scan sweep", pan=0.1, wet=0.15)
        put(None if t is None else t + 1.15, confirm_chime(), 0.07, "analyzer confirm tone", wet=0.15)
        put(at("shipping", "ships"), tape_seal(rng), 0.09, "packing tape seal", pan=-0.15, wet=0.08)
        put(at("shipping", "records"), stamp(rng), 0.12, "records stamp (soft)", wet=0.1)
        put(at("verify", "verify"), warm_swell(tones("verify"), rng), 0.12, "warm swell (verify)", wet=0.5, bus=music)

    elif kind == "faq-sell":
        put(at("look", "inspection"), glint(rng), 0.06, "loupe glint", pan=0.2, wet=0.35)
        t = at("test", "testing")
        put(t, analyzer_scan(rng), 0.07, "analyzer scan sweep", pan=0.1, wet=0.15)
        put(None if t is None else t + 1.0, confirm_chime(), 0.07, "analyzer confirm tone", wet=0.15)
        t = at("test", "weight")
        if t is not None:
            sfx.place(beep(), t, gain=0.07, wet=0.03)
            sfx.place(beep(), t + 0.13, gain=0.07, wet=0.03)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "scale double beep"})
        t = at("quote", "quote")
        if t is not None:  # a quote chime: two bells rising
            tt = sorted(tones("quote"))
            music.place(bell(midi(tt[0] + 12), rng), t, gain=0.065, pan=-0.2, wet=1.0, dry=0.4)
            music.place(bell(midi(tt[2] + 12), rng), t + 0.14, gain=0.065, pan=0.2, wet=1.0, dry=0.4)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "quote chime"})
        t = at("pay", "paid")
        if t is not None:  # payment chime (no cash register)
            tt = sorted(tones("pay"))
            music.place(bell(midi(tt[1] + 12), rng), t, gain=0.07, pan=-0.2, wet=1.0, dry=0.4)
            music.place(bell(midi(tt[3] + 12), rng), t + 0.17, gain=0.07, pan=0.2, wet=1.0, dry=0.4)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "two-note payment chime"})
        put(at("pay", "no", 0), swipe(rng), 0.07, "strike swipe (no sending off)", pan=-0.2, wet=0.1)
        put(at("pay", "no", 1), swipe(rng), 0.07, "strike swipe (no approval wait)", pan=0.2, wet=0.1)
        ids = scene_ids
        cut_a = float(data["scenes"][ids.index("time")]["visualStart"])
        cut_b = float(data["scenes"][ids.index("cta")]["visualStart"])
        minutes = at("time", "minutes")
        tt, k = cut_a + 0.2, 0
        while tt < cut_b - 0.4:  # stopwatch bed under "three to six minutes"
            if minutes is None or abs(tt - minutes) > 0.12:
                sfx.place(tick(rng, 3600 if k % 2 == 0 else 3000), tt, gain=0.03, pan=(-0.1, 0.1)[k % 2], wet=0.04)
            tt += 0.25
            k += 1
        events.append({"t": round(cut_a + 0.2, 3), "type": "sfx", "detail": f"stopwatch tick bed ({k} ticks)"})
        put(minutes, padlock(rng), 0.13, "stopwatch click (minutes)", wet=0.06)

    elif kind == "faq-bar":
        t = at("answer", "change")
        if t is not None:  # a balance tipping: two soft clinks
            sfx.place(coin_clink(rng, 0.8), t, gain=0.06, pan=-0.3, wet=0.3)
            sfx.place(coin_clink(rng, 0.75), t + 0.16, gain=0.05, pan=0.3, wet=0.3)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "balance-tip clinks"})
        put(at("years", "years"), page_turn(rng), 0.07, "page turn / time whoosh (thirty years)", pan=0.1, wet=0.3)
        put(at("maple", "goldmapleleaf"), coin_ring(rng), 0.2, "coin ring (Maple Leaf)", pan=-0.1, wet=0.35)
        t = at("eagle", "harder")
        put(t, coin_clink(rng, 1.3), 0.12, "harder, brighter coin tap", pan=0.15, wet=0.15)
        put(at("bars", "overtaken"), glide(420, 980), 0.05, "rising tone (overtaken)", wet=0.3)
        t = at("bars", "gram")
        if t is not None:  # small successive taps for the gram bars
            for j in range(3):
                sfx.place(coin_clink(rng, 1.15 + 0.1 * j), t + 0.09 * j, gain=0.045, pan=-0.2 + 0.2 * j, wet=0.2)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "gram-bar taps"})
        for i, key in enumerate(("premium", "much", "preference")):
            put(at("choose", key), tick(rng, 2400 + 300 * i), 0.06, f"soft tick ({key})", pan=-0.2 + 0.2 * i, wet=0.15)

    elif kind == "faq-premium":
        t = at("answer", "throughout")
        if t is not None:  # tick-tock through the day
            for j in range(4):
                sfx.place(tick(rng, 3300 if j % 2 == 0 else 2550), t + 0.25 * j, gain=0.045, pan=(-0.15, 0.15)[j % 2], wet=0.06)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "clock tick motif"})
        for i, key in enumerate(("competition", "inventory", "supply")):
            put(at("compare", key), blip(1600 + 220 * i), 0.055, f"data blip ({key})", pan=-0.2 + 0.2 * i, wet=0.1)
        for key, f, label in (("50", 1320, "mid"), ("30", 990, "low"), ("80", 1760, "high")):
            put(at("example", key), ping(f, rng), 0.06, f"price step {label} ({key})", wet=0.3)
        put(at("inventory", "drop"), glide(900, 450, 0.45), 0.05, "downward tone (drop)", wet=0.25)
        put(at("market", "markup"), swipe(rng), 0.07, "strike swipe (markup)", wet=0.1)
        for i, key in enumerate(("reputable", "exact", "moment")):
            put(at("tip", key), confirm_tick(rng), 0.07, f"checklist tick ({key})", pan=-0.2 + 0.2 * i, wet=0.1)

    elif kind == "faq-pickup":
        t = at("answer", "depends")
        if t is not None:  # a fork in the road: two bells parting left and right
            tt = sorted(tones("answer"))
            music.place(bell(midi(tt[1] + 12), rng), t, gain=0.055, pan=-0.5, wet=1.0, dry=0.35)
            music.place(bell(midi(tt[3] + 12), rng), t + 0.12, gain=0.055, pan=0.5, wet=1.0, dry=0.35)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "fork chime"})
        put(at("office", "midtown"), ping(1760, rng), 0.07, "pin ping (Midtown)", wet=0.35)
        put(at("bankcheck", "bank", 0), paper_rustle(rng, 0.45), 0.07, "bank-check paper rustle", pan=0.2, wet=0.1)
        put(at("release", "verify"), confirm_tick(rng), 0.09, "check verified", wet=0.1)
        t = at("release", "release")
        if t is not None:
            tt = sorted(tones("release"))
            music.place(bell(midi(tt[1] + 12), rng), t, gain=0.06, pan=-0.2, wet=1.0, dry=0.4)
            music.place(bell(midi(tt[3] + 12), rng), t + 0.16, gain=0.06, pan=0.2, wet=1.0, dry=0.4)
            events.append({"t": round(t, 3), "type": "sfx", "detail": "release chime"})
        for key, flips in (("twoday", 2), ("five", 5)):
            t = at("others", key)
            if t is None:
                continue
            for j in range(flips):
                sfx.place(calendar_flip(rng), t + 0.1 * j, gain=0.06, pan=-0.2 + 0.1 * j, wet=0.06)
            events.append({"t": round(t, 3), "type": "sfx", "detail": f"calendar flips ×{flips} ({key})"})
        put(at("others", "shipped"), ship_thud(rng), 0.16, "shipping thud", wet=0.08)
        put(at("contact", "contact"), phone_tap(), 0.05, "phone-tap tones", pan=0.15, wet=0.1)
    return events

# ---------------------------------------------------------------- composition

def compose(vid: str, data: dict) -> tuple[np.ndarray, dict]:
    cfg = SCORES.get(vid) or {**SCORES["first-piece"], "keywords": set()}
    rng = np.random.default_rng(cfg["seed"])
    duration = float(data["duration"])
    n = int(np.ceil(duration * RATE))
    music, sfx = Bus(n), Bus(n)
    ir = make_ir(np.random.default_rng(cfg["seed"] + 1))
    scenes = data["scenes"]
    cuts = [float(s["visualStart"]) for s in scenes]
    chords = cfg["chords"]
    scene_chords = [chords[min(i, len(chords) - 2)] for i in range(len(scenes) - 1)] + [chords[-1]]
    events = []
    end_fade = (duration - 1.9, duration - 0.3)

    # Pad + sub, crossfaded on each cut.
    for i, (name, voicing, _tones) in enumerate(scene_chords):
        t0 = 0.05 if i == 0 else cuts[i] - 0.05
        t_full = 1.4 if i == 0 else cuts[i] + 0.6
        last = i == len(scenes) - 1
        t_out = end_fade[0] if last else cuts[i + 1] - 0.05
        t_end = end_fade[1] if last else cuts[i + 1] + 0.85
        bright = (0.25, 0.9) if last else (0.15, 0.55)
        pad_chord(music, voicing, t0, t_full, t_out, t_end, rng, gain=0.30 if not last else 0.36, bright=bright)
        sub_tone(music, voicing[0], t0, t_full, t_out, t_end, gain=0.085)
        events.append({"t": round(max(cuts[i], 0), 3), "type": "chord", "detail": name})

    # Felt piano motif through each chord (CTA gets a rolled tonic bloom instead).
    step, pattern = cfg["step"], cfg["pattern"]
    for i, (name, voicing, tones) in enumerate(scene_chords):
        if i == len(scenes) - 1:
            break
        seg_start = 0.65 if i == 0 else cuts[i] + 0.12
        seg_end = cuts[i + 1] - 0.35
        t = seg_start
        k = 0
        while t < seg_end:
            note = tones[pattern[(k + i) % len(pattern)] % len(tones)]
            if k == 0:
                note -= 12  # each chord opens a register lower
            dur = min(3.2, cuts[i + 1] + 0.4 - t)
            vel = 0.62 if k % 2 == 0 else 0.48
            music.place(felt_piano(midi(note), dur, vel, rng), t, gain=0.22,
                        pan=-0.25 + 0.5 * ((k * 0.37) % 1), wet=0.55, dry=0.55)
            t += step * (1.0 if k % 3 != 2 else 1.35)
            k += 1

    # CTA: rolled tonic bloom and logo shimmer.
    cta = cuts[-1]
    name, voicing, tones = scene_chords[-1]
    roll = sorted(set([voicing[0] + 12] + voicing[1:] + tones))
    for j, note in enumerate(roll):
        dur = min(3.4, end_fade[1] - (cta + 0.04 + 0.05 * j))
        music.place(felt_piano(midi(note), dur, 0.7 - 0.03 * j, rng), cta + 0.04 + 0.05 * j, gain=0.16,
                    pan=-0.5 + j / max(1, len(roll) - 1), wet=0.6, dry=0.5)
    events.append({"t": round(cta + 0.04, 3), "type": "cta-bloom", "detail": f"rolled {name}"})
    shimmer = sorted(set(tn + 12 for tn in tones))[:4] + [tones[0] + 24]
    for j, note in enumerate(shimmer):
        music.place(bell(midi(note), rng), cta + 0.6 + 0.065 * j, gain=0.075 * 0.88 ** j,
                    pan=(-0.45, 0.45)[j % 2], wet=1.0, dry=0.25)
    events.append({"t": round(cta + 0.6, 3), "type": "logo-shimmer", "detail": "5 ascending bells"})

    # Light-on at the top.
    air, boom = light_on(rng)
    sfx.place(air, 0.05, gain=0.10, wet=0.5, dry=0.6)
    sfx.place(boom, 0.05, gain=0.32)
    events.append({"t": 0.05, "type": "light-on", "detail": "air swell + low boom"})

    # Riser into every cut and an impact on it.
    for i in range(1, len(scenes)):
        cut = cuts[i]
        _n2, next_voicing, next_tones = scene_chords[i]
        swell = reverse_swell([next_tones[0], next_tones[2]], ir[0], rng)
        noise = swept_noise(rng, 0.62, 380, 5200)
        tt = np.arange(len(noise)) / RATE
        noise *= (tt / tt[-1]) ** 2.6
        noise[-int(0.008 * RATE):] *= np.linspace(1, 0, int(0.008 * RATE))
        sfx.place(swell, cut - len(swell) / RATE, gain=0.12, pan=-0.15, wet=0.15)
        sfx.place(noise, cut - len(noise) / RATE, gain=0.075, pan=0.15, wet=0.3)
        low, air = impact(rng)
        sfx.place(low, cut, gain=0.30)
        sfx.place(air, cut, gain=0.035, wet=0.9, dry=0.35)
        events.append({"t": round(cut - 0.62, 3), "type": "riser", "detail": f"into {scenes[i]['id']}"})
        events.append({"t": round(cut, 3), "type": "impact", "detail": scenes[i]["id"]})

    # Bespoke word-synced sound design (premium-2). Its own RNG keeps the other films unchanged.
    avoid: list[float] = []
    if cfg.get("sfx"):
        made = bespoke(cfg["sfx"], data, sfx, music, np.random.default_rng(cfg["seed"] + 500), scene_chords,
                       [s["id"] for s in scenes])
        events += made
        avoid = [e["t"] for e in made]
    # FAQ series identity: the rising question figure under each film's question scene.
    if cfg.get("motif"):
        events += faq_motif(music, cfg["motif"], np.random.default_rng(cfg["seed"] + 700))

    # Keyword bells, sparse.
    last_at = -10.0
    for i, scene in enumerate(scenes[:-1]):
        count = 0
        tones = scene_chords[i][2]
        for word in scene["words"]:
            at = float(word["start"])
            key = norm(word["word"])
            if key not in cfg["keywords"] or count >= cfg.get("bellCap", {}).get(scene["id"], 3):
                continue
            if at - last_at < 0.5 or min(abs(at - c) for c in cuts[1:] or [99]) < 0.3:
                continue
            if any(abs(at - a) < 0.35 for a in avoid):
                continue
            note = sorted(tones)[(count + i) % len(tones)] + 12
            music.place(bell(midi(note), rng), at + 0.02, gain=0.06, pan=(-0.35, 0.35)[count % 2], wet=1.0, dry=0.3)
            events.append({"t": round(at + 0.02, 3), "type": "bell", "detail": f"{word['word']} → {NAMES[note % 12]}{note // 12 - 1}"})
            last_at = at
            count += 1

    # Reverb, buses, ducking, master.
    def verb(send: np.ndarray) -> np.ndarray:
        w = np.stack([oaconvolve(send, ir[0])[:n], oaconvolve(send, ir[1])[:n]], axis=1)
        w = sosfilt(butter(2, 160, "high", fs=RATE, output="sos"), w, axis=0)
        return sosfilt(butter(2, 7500, "low", fs=RATE, output="sos"), w, axis=0)

    pad_lp = butter(2, 2600, "low", fs=RATE, output="sos")
    voice, voice_rate = sf.read(str(PUBLIC / data["voice"]), dtype="float64")
    if voice.ndim > 1:
        voice = voice.mean(axis=1)
    if voice_rate != RATE:
        voice = resample_poly(voice, RATE, voice_rate)
    if cfg.get("sfxDuckDb") is not None:
        # Music ducks fully under the voice; sound design only gently, so its accents still land.
        music_mix = sosfilt(pad_lp, music.dry, axis=0) + 0.55 * verb(music.send)
        sfx_mix = sfx.dry + 0.55 * verb(sfx.send)
        mix = music_mix * ducking(voice, n)[:, None] + sfx_mix * ducking(voice, n, cfg["sfxDuckDb"])[:, None]
    else:
        wet = verb(music.send + sfx.send)
        mix = sosfilt(pad_lp, music.dry, axis=0) + sfx.dry + 0.55 * wet
        mix *= ducking(voice, n)[:, None]

    t = np.arange(n) / RATE
    mix *= (1 - raised(t, *end_fade))[:, None]
    mix = sosfiltfilt(butter(2, 22, "high", fs=RATE, output="sos"), mix, axis=0)
    mix *= np.minimum(t / 0.004, 1)[:, None]
    mix[t >= end_fade[1]] = 0.0
    events.sort(key=lambda e: e["t"])
    meta = {"key": cfg["key"], "progression": [{"t": round(max(c, 0), 3), "chord": ch[0]}
                                               for c, ch in zip(cuts, scene_chords)], "events": events}
    return mix, meta


# Films with their own sound design script (scripts/makers-sound.py); never overwritten here.
OWN_SOUNDTRACK = {"makers-edge", "whats-inside"}  # scored by makers-sound.py / story-sound.py


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--video")
    parser.add_argument("--group", default="premium", help="film set: public/marketing/<group>/schedule.json")
    args = parser.parse_args()
    schedule_path, preview = group_paths(args.group)
    schedule = json.loads(schedule_path.read_text())
    preview.mkdir(parents=True, exist_ok=True)
    report_path = preview / "score-report.json"
    report = json.loads(report_path.read_text()) if report_path.exists() and args.video else {}
    for vid, data in schedule.items():
        if args.video and vid != args.video:
            continue
        if vid in OWN_SOUNDTRACK:
            continue
        mix, meta = compose(vid, data)
        out = PUBLIC / data["score"]
        out.parent.mkdir(parents=True, exist_ok=True)
        tmp = preview / f"{vid}-score.raw.wav"
        sf.write(str(tmp), mix.astype(np.float32), RATE, subtype="FLOAT")
        raw = measure(tmp)
        gain_db = min(TARGET_LUFS - raw["integratedLufs"], CEILING_DBTP - raw["truePeakDbtp"])
        mix *= 10 ** (gain_db / 20)
        sf.write(str(out), mix, RATE, subtype="PCM_24")
        tmp.unlink()
        final = measure(out)

        voice_path = PUBLIC / data["voice"]
        voice, _ = sf.read(str(voice_path), dtype="float64")
        if voice.ndim > 1:
            voice = voice.mean(axis=1)
        voice = np.pad(voice, (0, max(0, len(mix) - len(voice))))[: len(mix)]
        # Voice plays dual-mono in the render, so compare against the dual-mono voice.
        mixed = mix + voice[:, None]
        dual_path = preview / f"{vid}-voice-dual.wav"
        sf.write(str(dual_path), np.stack([voice, voice], axis=1).astype(np.float32), RATE, subtype="FLOAT")
        mix_path = preview / f"{vid}-mix.wav"
        sf.write(str(mix_path), mixed.astype(np.float32), RATE, subtype="FLOAT")
        voice_loud = measure(dual_path)
        mix_loud = measure(mix_path)
        dual_path.unlink()
        subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", str(out), "-lavfi",
                        "showspectrumpic=s=1600x480:legend=1:scale=log:color=intensity", str(preview / f"{vid}-score-spectrum.png")],
                       check=True, capture_output=True)
        report[vid] = {**meta, "file": str(out.relative_to(ROOT)), "durationSeconds": round(len(mix) / RATE, 4),
                       "gainAppliedDb": round(gain_db, 2), "score": final, "voice": voice_loud, "voicePlusScore": mix_loud,
                       "mixMinusVoiceLu": round(mix_loud["integratedLufs"] - voice_loud["integratedLufs"], 2),
                       "clicks": click_stats(mix)}
        print(f"{vid}: score {final['integratedLufs']:.1f} LUFS / TP {final['truePeakDbtp']:.1f} dBTP | "
              f"voice {voice_loud['integratedLufs']:.1f} → mix {mix_loud['integratedLufs']:.1f} LUFS "
              f"(+{report[vid]['mixMinusVoiceLu']:.2f} LU) | {len(mix)/RATE:.3f}s | clicks {report[vid]['clicks']}")
    report_path.write_text(json.dumps(report, indent=2) + "\n")


if __name__ == "__main__":
    main()
