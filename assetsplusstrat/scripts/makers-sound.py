#!/usr/bin/env python3
"""Score and sound design for "The Maker's Edge" (schedule id makers-edge).

Industrial, gritty, visceral, yet premium: a blast-furnace bed and minor drone
under the molten pour and the invoice, a heartbeat for the problem, then a
confident 100 BPM D-mixolydian groove from the moment the vault opens, building
until the drone resolves into a triumphant D major chord on the last line.

Everything is synthesized here (filtered noise, additive/modal metal, granular
grain cascades, wavetable pads), with a couple of CC0 Kenney samples layered
under the vault latch. Event times come from public/marketing/premium/schedule.json:
word-anchored events follow the narration timestamps, the rest are offsets from
each scene's visualStart, matching the visual timeline.

Music is ducked about 8 dB under the narration, SFX about 3 dB, then the whole
track is limited and normalized to about -21 LUFS with true peak below -3 dBTP.

Writes public/marketing/premium/audio/makers-edge-score.wav (48 kHz stereo PCM_24)
plus a voice+score preview, spectrogram and report in out/marketing/premium/audio-preview/.

Run:  python -I scripts/makers-sound.py
"""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, oaconvolve, resample_poly, sosfilt

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PREVIEW = ROOT / "out/marketing/premium/audio-preview"
VID = "makers-edge"
RATE = 48000
TARGET_LUFS = -21.0
CEILING_DBTP = -3.2
MUSIC_DUCK_DB = -8.0
SFX_DUCK_DB = -3.0
BPM = 100.0

# Shared instruments and loudness helpers from the score for the other four films.
_spec = importlib.util.spec_from_file_location("premium_score", ROOT / "scripts/premium-score.py")
ps = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ps)
Bus, raised, midi, saw_table, oscillator, bell = ps.Bus, ps.raised, ps.midi, ps.saw_table, ps.oscillator, ps.bell
swept_noise, make_ir, measure, click_stats, pad_chord = ps.swept_noise, ps.make_ir, ps.measure, ps.click_stats, ps.pad_chord

rng = np.random.default_rng(4207)
EVENTS: list[dict] = []


# ---------------------------------------------------------------- small DSP helpers

def sos(kind: str, f, order: int = 2):
    return butter(order, f, kind, fs=RATE, output="sos")


def filt(x: np.ndarray, kind: str, f, order: int = 2) -> np.ndarray:
    return sosfilt(sos(kind, f, order), x)


def norm(x: np.ndarray) -> np.ndarray:
    return x / (np.abs(x).max() + 1e-12)


def edges(x: np.ndarray, attack: float = 0.004, release: float = 0.02) -> np.ndarray:
    """Short fades on both ends so no event can click."""
    x = x.copy()
    a, r = max(1, int(attack * RATE)), max(1, int(release * RATE))
    a, r = min(a, len(x) // 2), min(r, len(x) // 2)
    x[:a] *= np.linspace(0, 1, a)
    x[len(x) - r:] *= np.linspace(1, 0, r)
    return x


def tvec(dur: float) -> np.ndarray:
    return np.arange(int(dur * RATE)) / RATE


def brown(n: int) -> np.ndarray:
    b = np.cumsum(rng.normal(0, 1, n))
    return norm(filt(b, "high", 18))


def smooth_random(n: int, rate_hz: float, depth: float = 1.0) -> np.ndarray:
    """Slow random modulation in [-depth, depth] (cubic-ish interpolation of random points)."""
    pts = max(4, int(n / RATE * rate_hz) + 4)
    knots = rng.uniform(-1, 1, pts)
    x = np.linspace(0, pts - 3, n)
    i = np.floor(x).astype(int)
    f = x - i
    f = f * f * (3 - 2 * f)
    return depth * (knots[i] * (1 - f) + knots[i + 1] * f)


def modal(freqs, amps, taus, dur: float, strike: float = 0.6) -> np.ndarray:
    """Struck metal: decaying inharmonic partials plus a noise strike."""
    t = tvec(dur)
    out = np.zeros(len(t))
    for f, a, tau in zip(freqs, amps, taus):
        out += a * np.exp(-t / tau) * np.sin(2 * np.pi * f * (1 + rng.uniform(-0.002, 0.002)) * t + rng.uniform(0, 6.28))
    hit = filt(rng.normal(0, 1, len(t)), "band", [1500, 9000]) * np.exp(-t / 0.006)
    out = norm(out) + strike * norm(hit)
    return edges(norm(out), 0.0008, 0.05)


def thump(dur: float, f0: float, f1: float, tau_f: float, tau_a: float, noise: float = 0.3, lp: float = 220) -> np.ndarray:
    t = tvec(dur)
    f = f1 + (f0 - f1) * np.exp(-t / tau_f)
    tone = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-t / tau_a)
    body = filt(rng.normal(0, 1, len(t)), "low", lp) * np.exp(-t / (tau_a * 0.35))
    return edges(norm(tone + noise * norm(body)), 0.002, 0.04)


def sample(name: str) -> np.ndarray:
    x, sr = sf.read(str(PUBLIC / "sfx" / f"{name}.wav"), dtype="float64")
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != RATE:
        x = resample_poly(x, RATE, sr)
    return edges(x, 0.001, 0.01)


def place_stereo(bus: Bus, left: np.ndarray, right: np.ndarray, at: float, gain: float = 1.0, wet: float = 0.0) -> None:
    offset = int(round(at * RATE))
    stop = min(bus.n, offset + len(left))
    if stop <= offset:
        return
    seg_l, seg_r = left[: stop - offset] * gain, right[: stop - offset] * gain
    bus.dry[offset:stop, 0] += seg_l
    bus.dry[offset:stop, 1] += seg_r
    bus.send[offset:stop] += 0.5 * (seg_l + seg_r) * wet


def log(at: float, name: str) -> None:
    EVENTS.append({"t": round(at, 3), "event": name})


# ---------------------------------------------------------------- sound effects

def furnace(dur: float) -> np.ndarray:
    n = int(dur * RATE)
    low = filt(brown(n), "low", 240, 4)
    mid = filt(rng.normal(0, 1, n), "band", [260, 1100])
    breath = 0.75 + 0.25 * smooth_random(n, 0.6)
    flicker = 0.7 + 0.3 * np.abs(smooth_random(n, 9))
    rumble = np.sin(2 * np.pi * 31 * np.arange(n) / RATE) * (0.6 + 0.4 * smooth_random(n, 0.4))
    return norm(1.0 * norm(low) * breath + 0.22 * norm(mid) * flicker + 0.35 * rumble)


def hiss(dur: float, lo: float = 3500, hi: float = 14000) -> np.ndarray:
    n = int(dur * RATE)
    x = filt(rng.normal(0, 1, n), "band", [lo, hi], 3)
    return norm(x * (0.8 + 0.2 * np.abs(smooth_random(n, 25))))


def liquid_roar(dur: float) -> np.ndarray:
    n = int(dur * RATE)
    x = filt(rng.normal(0, 1, n), "band", [140, 950], 3)
    gurgle = 0.55 + 0.45 * np.abs(smooth_random(n, 11))
    return norm(x * gurgle)


def scrape(dur: float) -> np.ndarray:
    n = int(dur * RATE)
    x = filt(rng.normal(0, 1, n), "band", [700, 3200], 3)
    stick = np.abs(smooth_random(n, 45)) ** 1.5
    t = np.arange(n) / RATE
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.7
    return norm(x * stick * env)


def crackle(dur: float, density: float, lo: float = 1800, hi: float = 9000, decay: float | None = None) -> np.ndarray:
    """Sparse impulses (pops) through a band-pass; optional exponential density decay."""
    n = int(dur * RATE)
    t = np.arange(n) / RATE
    rate = density * (np.exp(-t / decay) if decay else np.ones(n))
    hits = rng.uniform(0, 1, n) < rate / RATE
    imp = np.zeros(n)
    imp[hits] = rng.uniform(0.2, 1.0, hits.sum()) * rng.choice([-1, 1], hits.sum())
    return norm(filt(imp, "band", [lo, hi], 2) + 1e-9)


def bubbles(dur: float, density: float, decay: float) -> np.ndarray:
    n = int(dur * RATE)
    out = np.zeros(n)
    t_cur = 0.0
    while True:
        rate = density * np.exp(-t_cur / decay)
        if rate < 0.5:
            break
        t_cur += rng.exponential(1 / rate)
        if t_cur >= dur - 0.05:
            break
        blen = rng.uniform(0.012, 0.035)
        bt = tvec(blen)
        f0 = rng.uniform(350, 1100)
        f = f0 * (1 + 1.8 * bt / blen)  # rising chirp: a bubble releasing
        b = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-bt / (blen * 0.4)) * rng.uniform(0.3, 1)
        i = int(t_cur * RATE)
        out[i:i + len(b)] += edges(b, 0.001, 0.004)[: n - i]
    return norm(out + 1e-12)


def grains(dur: float, rate_fn, lo: float = 2000, hi: float = 9000, seed_shift: int = 0) -> tuple[np.ndarray, np.ndarray]:
    """Granular cascade of tiny metal grains: thousands of short decaying pings, stereo spread."""
    n = int(dur * RATE)
    left, right = np.zeros(n), np.zeros(n)
    peak_rate = max(rate_fn(x) for x in np.linspace(0, dur, 400))
    t_cur = 0.0
    while True:
        t_cur += rng.exponential(1 / peak_rate)
        if t_cur >= dur - 0.01:
            break
        if rng.uniform() > rate_fn(t_cur) / peak_rate:
            continue
        glen = rng.uniform(0.0012, 0.006)
        gt = np.arange(int(glen * RATE)) / RATE
        f = np.exp(rng.uniform(np.log(lo), np.log(hi)))
        g = np.sin(2 * np.pi * f * gt + rng.uniform(0, 6.28)) * np.exp(-gt / (glen * 0.3)) * rng.uniform(0.15, 1) ** 1.6
        g[:8] *= np.linspace(0, 1, min(8, len(g)))
        p = rng.uniform(-0.9, 0.9)
        gl, gr = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
        i = int(t_cur * RATE)
        k = min(len(g), n - i)
        left[i:i + k] += g[:k] * gl
        right[i:i + k] += g[:k] * gr
    m = max(np.abs(left).max(), np.abs(right).max()) + 1e-12
    return left / m, right / m


def tinkle(f: float, dur: float = 0.35) -> np.ndarray:
    t = tvec(dur)
    out = sum(a * np.exp(-t / tau) * np.sin(2 * np.pi * f * r * t) for r, a, tau in ((1, 1, 0.12), (2.71, 0.4, 0.06), (5.2, 0.2, 0.03)))
    return edges(norm(out), 0.0005, 0.03)


def swish(dur: float, lo: float, hi: float, up: bool = True) -> np.ndarray:
    x = swept_noise(rng, dur, lo if up else hi, hi if up else lo, width=0.7, curve=1.0)
    t = tvec(dur)[: len(x)]
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6
    return edges(norm(x * env))


def heartbeat(gain_lub: float = 1.0) -> np.ndarray:
    lub = thump(0.32, 64, 38, 0.03, 0.09, noise=0.25, lp=150)
    dub = thump(0.26, 74, 44, 0.025, 0.07, noise=0.2, lp=170)
    out = np.zeros(int(0.6 * RATE))
    out[: len(lub)] += lub * gain_lub
    j = int(0.19 * RATE)
    out[j:j + len(dub)] += dub * 0.72
    return norm(out)


def paper_crumple(dur: float) -> np.ndarray:
    n = int(dur * RATE)
    t = np.arange(n) / RATE
    squeezes = np.zeros(n)
    for c in np.linspace(0.06, dur - 0.15, 6) + rng.uniform(-0.04, 0.04, 6):
        squeezes += np.exp(-0.5 * ((t - c) / rng.uniform(0.035, 0.07)) ** 2) * rng.uniform(0.6, 1)
    dense = crackle(dur, 900, 1500, 7000)
    body = filt(rng.normal(0, 1, n), "band", [600, 2500]) * 0.25
    return norm((dense + norm(body) * 0.3) * squeezes)


def drain_sweep(dur: float) -> np.ndarray:
    t = tvec(dur)
    f = 60 + 360 * np.exp(-t / (dur * 0.35))
    ph = np.cumsum(f) / RATE
    saw = 2 * (ph % 1) - 1
    wobble = 1 + 0.25 * np.sin(2 * np.pi * 7 * t)
    x = filt(saw * wobble, "low", 900)
    noise = filt(rng.normal(0, 1, len(t)), "band", [200, 1600]) * np.exp(-t / (dur * 0.5)) * 0.2
    env = np.minimum(t / 0.08, 1) * np.clip((dur - t) / (dur * 0.5), 0, 1)
    return edges(norm((x + noise) * env))


def impact(dur: float = 1.8, depth: float = 1.0) -> np.ndarray:
    t = tvec(dur)
    f = 34 + 30 * np.exp(-t / 0.09)
    sub = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-t / (0.45 * depth))
    body = filt(rng.normal(0, 1, len(t)), "low", 180) * np.exp(-t / 0.06)
    crack = filt(rng.normal(0, 1, len(t)), "band", [900, 5000]) * np.exp(-t / 0.015)
    return edges(norm(sub + 0.45 * norm(body) + 0.18 * norm(crack)), 0.0015, 0.08)


def anvil() -> np.ndarray:
    return modal([1180, 2735, 3940, 5480, 7320], [1, 0.7, 0.45, 0.3, 0.18], [0.9, 0.55, 0.38, 0.22, 0.14], 2.2, strike=0.5)


def horn(dur: float = 0.32) -> np.ndarray:
    t = tvec(dur)
    x = sum(2 * ((f * t) % 1) - 1 for f in (412, 498))
    x = filt(x, "band", [300, 2200])
    env = np.minimum(t / 0.02, 1) * np.clip((dur - t) / 0.06, 0, 1)
    return edges(norm(x * env))


def digital_click(f: float) -> np.ndarray:
    t = tvec(0.05)
    tone = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006)
    tick = filt(rng.normal(0, 1, len(t)), "high", 5000) * np.exp(-t / 0.0012)
    return edges(norm(tone + 0.6 * norm(tick)), 0.0003, 0.01)


# ---------------------------------------------------------------- music instruments

def kick() -> np.ndarray:
    t = tvec(0.42)
    f = 46 + 70 * np.exp(-t / 0.04)
    x = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-t / 0.16)
    click = filt(rng.normal(0, 1, len(t)), "band", [1800, 6000]) * np.exp(-t / 0.002)
    return edges(norm(x + 0.08 * norm(click)), 0.0008, 0.03)


def hat() -> np.ndarray:
    t = tvec(0.08)
    x = filt(rng.normal(0, 1, len(t)), "high", 7500, 3) * np.exp(-t / 0.018)
    return edges(norm(x), 0.0005, 0.01)


def pluck(f: float, dur: float, bright: float = 1.0) -> np.ndarray:
    t = tvec(dur)
    out = np.zeros(len(t))
    for k in range(1, 12):
        if f * k > 8000:
            break
        tau = 0.22 * bright / (1 + 0.55 * (k - 1))
        out += (1 / k ** 1.25) * np.exp(-t / tau) * np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6.28))
    return edges(norm(out), 0.002, 0.03)


def bass_note(f: float, dur: float) -> np.ndarray:
    t = tvec(dur)
    out = np.zeros(len(t))
    for k in range(1, 14):
        tau = 0.5 if k == 1 else 0.2 / (1 + 0.4 * (k - 1))
        out += (1 / k) * np.exp(-t / tau) * np.sin(2 * np.pi * f * k * t)
    out = filt(out, "low", 1400)
    out *= np.clip((dur - t) / 0.03, 0, 1)
    return edges(norm(out), 0.003, 0.03)


def brass_chord(notes: list[int], dur: float, open_at: float = 0.5) -> tuple[np.ndarray, np.ndarray]:
    """Warm brass-like swell: detuned saws through a low-pass that opens on the attack."""
    n = int(dur * RATE)
    t = np.arange(n) / RATE
    left, right = np.zeros(n), np.zeros(n)
    for j, note in enumerate(notes):
        f = midi(note)
        dark, brt = saw_table(f, 500), saw_table(f, 3200)
        mixamt = raised(t, 0.0, open_at) * 0.85
        for cents, pan in ((-7, -0.7), (0, 0.0), (7, 0.7)):
            v = oscillator(dark, f, n, rng, cents) * (1 - mixamt) + oscillator(brt, f, n, rng, cents) * mixamt
            gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            w = (0.8 if j == 0 else 1.0) / len(notes)
            left += v * gl * w
            right += v * gr * w
    env = raised(t, 0, 0.35)
    m = max(np.abs(left).max(), np.abs(right).max()) + 1e-12
    return left * env / m, right * env / m


# ---------------------------------------------------------------- ducking + limiting

def duck_curve(voice: np.ndarray, n: int, depth_db: float) -> np.ndarray:
    hop = int(0.01 * RATE)
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    frames = int(np.ceil(n / hop))
    padded = np.pad(voice, (0, frames * hop - n))
    rms = np.sqrt((padded.reshape(frames, hop) ** 2).mean(axis=1))
    speech = 20 * np.log10(rms + 1e-9) > -42
    speech = np.convolve(speech.astype(float), np.ones(26), mode="full")[:frames] > 0   # 250 ms hold
    speech = np.concatenate([speech[6:], np.zeros(6, bool)]) | speech                  # 60 ms lookahead
    target = np.where(speech, depth_db, 0.0)
    gain = np.zeros(frames)
    level = 0.0
    a_att, a_rel = np.exp(-1 / 8.0), np.exp(-1 / 35.0)  # 80 ms attack, 350 ms release
    for i, tg in enumerate(target):
        a = a_att if tg < level else a_rel
        level = a * level + (1 - a) * tg
        gain[i] = level
    curve = np.interp(np.arange(n), np.arange(frames) * hop + hop / 2, gain)
    return 10 ** (curve / 20)


def limit(x: np.ndarray, ceiling: float) -> np.ndarray:
    """Look-ahead peak limiter (5 ms look-ahead, 120 ms release)."""
    peak = np.abs(x).max(axis=1)
    need = np.minimum(1.0, ceiling / (peak + 1e-12))
    look = int(0.005 * RATE)
    # Minimum over the look-ahead window so gain is already down when the peak arrives.
    padded = np.concatenate([need, np.ones(look)])
    windows = np.lib.stride_tricks.sliding_window_view(padded, look + 1)
    target = windows.min(axis=1)[: len(need)]
    gain = np.empty_like(target)
    level = 1.0
    rel = np.exp(-1 / (0.12 * RATE))
    for i, tg in enumerate(target):
        level = tg if tg < level else rel * level + (1 - rel) * tg
        gain[i] = level
    # Smooth the attack corners over the look-ahead span.
    kernel = np.hanning(look * 2 + 1)
    kernel /= kernel.sum()
    gain = np.minimum(gain, np.convolve(gain, kernel, mode="same"))
    return x * gain[:, None]


# ---------------------------------------------------------------- composition

def main() -> None:
    schedule = json.loads((PUBLIC / "marketing/premium/schedule.json").read_text())
    data = schedule[VID]
    duration = float(data["duration"])
    n = int(round(duration * RATE))
    scenes = {s["id"]: s for s in data["scenes"]}
    S = {k: float(v["visualStart"]) for k, v in scenes.items()}

    def word(scene: str, token: str, fallback: float, occurrence: int = 0) -> float:
        """Absolute start of a narrated word; falls back to the scene-relative brief time."""
        hits = [w for w in scenes[scene]["words"] if re.sub(r"[^a-z0-9]", "", w["word"].lower()).startswith(token)]
        return float(hits[occurrence]["start"]) if len(hits) > occurrence else S[scene] + fallback

    music, fx = Bus(n), Bus(n)

    # ---------------- Scene 1 — the raw element
    e = S["element"]
    end1 = S["frustration"]
    fur = furnace(end1 + 0.6 - e)
    tt = np.arange(len(fur)) / RATE
    fur *= raised(tt, 0.0, 1.5) * (1 - raised(tt, end1 - e - 0.2, end1 - e + 0.5))
    # Hotter while the metal pours.
    fur *= 1 + 0.35 * raised(tt, 3.3, 4.2) * (1 - raised(tt, 7.0, 8.5))
    fx.place(edges(fur, 0.01, 0.1), e, gain=0.24, wet=0.15)
    log(e, "blast-furnace roar fades in")

    fx.place(impact(2.4, 1.4), e + 1.0, gain=0.42, wet=0.5)
    log(e + 1.0, "title boom")
    clank = modal([640, 1385, 2240, 3410, 4870], [1, 0.75, 0.5, 0.35, 0.2], [0.32, 0.22, 0.15, 0.09, 0.06], 0.9, strike=0.8)
    fx.place(clank, e + 2.2, gain=0.42, pan=0.25, wet=0.35)
    fx.place(sample("click_001"), e + 2.2, gain=0.35, pan=0.25)
    log(e + 2.2, "steel tongs clamp")
    fx.place(edges(scrape(0.8)), e + 2.6, gain=0.13, pan=0.15, wet=0.2)
    log(e + 2.6, "crucible scrape")

    pour_dur = 4.2
    pt = tvec(pour_dur)
    pour_env = raised(pt, 0.0, 0.45) * (1 - raised(pt, 3.7, 4.2))
    fx.place(edges(hiss(pour_dur, 3000, 11000) * pour_env), e + 3.3, gain=0.075, pan=-0.1, wet=0.25)
    fx.place(edges(liquid_roar(pour_dur) * pour_env), e + 3.3, gain=0.24, wet=0.2)
    log(e + 3.3, "molten pour: heat hiss + liquid roar")

    low_whoosh = swish(1.0, 160, 900, up=False)
    fx.place(low_whoosh, e + 6.6, gain=0.28, wet=0.3)
    fx.place(thump(0.8, 70, 36, 0.12, 0.3, noise=0.1), e + 6.9, gain=0.18)
    log(e + 6.6, "low whoosh: camera tilts down")

    water = e + 7.2
    burst_dur = 3.4
    bt = tvec(burst_dur)
    steam = hiss(burst_dur, 2500, 12000) * (np.minimum(bt / 0.012, 1) * np.exp(-bt / 0.55) + 0.15 * np.exp(-bt / 2.0))
    fx.place(edges(steam, 0.001, 0.1), water, gain=0.22, wet=0.35)
    fx.place(edges(crackle(burst_dur, 2600, 1500, 9000, decay=0.6)), water, gain=0.16, pan=0.1, wet=0.2)
    fx.place(thump(0.6, 95, 40, 0.04, 0.12, noise=0.6, lp=600), water, gain=0.32, wet=0.3)
    sizzle_dur = 10.5 - 7.2
    st = tvec(sizzle_dur)
    sizzle = (hiss(sizzle_dur, 3000, 11000) * 0.4 + crackle(sizzle_dur, 700, 2500, 10000)) * np.exp(-st / 1.4)
    fx.place(edges(norm(sizzle) * (1 - raised(st, sizzle_dur - 0.6, sizzle_dur)), 0.01, 0.05), water + 0.05, gain=0.12, wet=0.2)
    fx.place(edges(bubbles(sizzle_dur, 55, 1.3)), water + 0.1, gain=0.12, pan=-0.15, wet=0.25)
    log(water, "stream hits water: steam burst, crackle, bubbling sizzle")
    for k, at in enumerate(np.sort(rng.uniform(7.5, 10.0, 9))):
        fx.place(tinkle(rng.uniform(4200, 7600)), e + at, gain=0.05 + 0.03 * rng.uniform(), pan=rng.uniform(-0.6, 0.6), wet=0.45)
    log(e + 7.5, "grains sink: tiny tinkles to 10.0")
    milling = word("element", "milling", 9.66)
    fx.place(impact(1.8), milling, gain=0.45, wet=0.35)
    log(milling, "low impact on 'milling'")

    # ---------------- Scene 2 — the frustration
    f0 = S["frustration"]
    hb_start, hb_end = f0 + 0.3, f0 + 12.1
    beat = 60 / 72
    k = 0
    while hb_start + k * beat <= hb_end - 0.25:
        at = hb_start + k * beat
        prog = (at - hb_start) / (hb_end - hb_start)
        fx.place(heartbeat(), at, gain=0.36 + 0.22 * prog, wet=0.08)
        k += 1
    log(hb_start, f"heartbeat x{k} at 72 bpm, intensifying, stops ~{hb_end - f0:.1f}s")
    fx.place(swish(0.5, 1500, 6000), f0 + 0.9, gain=0.14, pan=-0.3, wet=0.15)
    log(f0 + 0.9, "paper slide swish (invoice)")
    price = word("frustration", "1015", 2.36)
    sl, sr_ = brass_chord([26, 27, 33, 38], 2.2, open_at=0.12)
    st2 = tvec(2.2)
    sting_env = np.exp(-st2 / 0.9)
    place_stereo(fx, edges(sl * sting_env), edges(sr_ * sting_env), price, gain=0.30, wet=0.4)
    fx.place(impact(1.6, 0.8), price, gain=0.22)
    log(price, "tense low sting on '$10-15'")
    fx.place(edges(paper_crumple(1.0), 0.003, 0.05), f0 + 6.8, gain=0.24, pan=0.2, wet=0.12)
    log(f0 + 6.8, "paper crumple")
    eating = word("frustration", "eating", 8.68)
    fx.place(drain_sweep(1.4), eating, gain=0.26, wet=0.35)
    log(eating, "draining synth sweep on 'eating'")
    taxing = word("frustration", "taxing", 11.3)
    fx.place(impact(2.4, 1.3), taxing, gain=0.62, wet=0.45)
    boom = sample("lowFrequency_explosion_000")
    fx.place(boom * np.exp(-np.arange(len(boom)) / RATE / 0.6), taxing, gain=0.25)
    log(taxing, "heavy hit on 'taxing'")

    # ---------------- Music: drone from the forge through the problem
    d_start = e + 0.3
    d_end = S["arsenal"] + 2.6
    dur_d = d_end - d_start
    nd = int(dur_d * RATE)
    td = d_start + np.arange(nd) / RATE
    swell = raised(td, d_start, d_start + 2.5) * (1 - raised(td, S["arsenal"] + 1.6, d_end))
    drone = np.zeros(nd)
    for note, g, fc in ((38, 1.0, 320), (45, 0.55, 380), (26, 0.5, 200)):
        drone += g * oscillator(saw_table(midi(note), fc), midi(note), nd, rng, rng.uniform(-3, 3))
    drone += 0.5 * np.sin(2 * np.pi * midi(26) * (td - d_start))
    drone *= 0.85 + 0.15 * smooth_random(nd, 0.3)
    # The problem: a dark minor-second rub and a thin, trembling high cluster.
    tension = raised(td, f0 - 0.4, f0 + 1.2) * (1 - raised(td, S["arsenal"] + 0.8, S["arsenal"] + 2.2))
    rub = oscillator(saw_table(midi(39), 300), midi(39), nd, rng, 0) * 0.55
    rub += oscillator(saw_table(midi(44), 450), midi(44), nd, rng, 0) * 0.25
    high = sum(np.sin(2 * np.pi * midi(m) * (td - d_start) + rng.uniform(0, 6)) for m in (74, 75, 81)) / 3
    high *= 0.55 + 0.45 * np.sin(2 * np.pi * 5.2 * (td - d_start))
    music.place(edges(norm(drone) * swell, 0.02, 0.2), d_start, gain=0.12, pan=0.0, wet=0.3)
    music.place(edges(norm(rub) * tension * swell, 0.02, 0.2), d_start, gain=0.07, pan=-0.3, wet=0.4)
    music.place(edges(high * tension * swell, 0.02, 0.2), d_start, gain=0.012, pan=0.35, wet=0.6)
    log(d_start, "D minor drone (forge); minor-second tension through the problem")

    # ---------------- Scene 3 — the arsenal
    a0 = S["arsenal"]
    clicks = []
    tcur, gap = a0 + 0.25, 0.12
    while tcur < a0 + 1.0:
        clicks.append(tcur)
        tcur += gap
        gap = max(0.035, gap * 0.82)
    for i, at in enumerate(clicks):
        tick = modal([2100, 3350, 5200], [1, 0.5, 0.3], [0.03, 0.02, 0.012], 0.12, strike=1.0)
        fx.place(tick, at, gain=0.12 + 0.004 * i, pan=0.2, wet=0.15)
    log(a0 + 0.25, f"vault wheel ratchet: {len(clicks)} accelerating clicks")
    latch = a0 + 1.05
    fx.place(sample("impactMetal_heavy_001"), latch, gain=0.75, wet=0.4)
    ring = modal([182, 421, 694, 1131, 1718, 2430], [1, 0.8, 0.6, 0.42, 0.3, 0.18], [3.0, 2.2, 1.6, 1.1, 0.8, 0.5], 3.6, strike=0.7)
    fx.place(ring, latch, gain=0.45, wet=0.55)
    fx.place(impact(2.0, 1.2), latch, gain=0.5, wet=0.3)
    log(latch, "vault latch CLUNG (Kenney impactMetal_heavy + modal ring + sub)")
    groan_dur = 1.05
    gt = tvec(groan_dur)
    gf = 70 + 25 * np.sin(np.pi * gt / groan_dur) + 6 * smooth_random(len(gt), 9)
    gph = np.cumsum(gf) / RATE
    groan = (2 * (gph % 1) - 1) * (0.5 + 0.5 * np.abs(smooth_random(len(gt), 30)))
    groan = filt(groan, "band", [90, 1400])
    groan *= np.sin(np.pi * np.clip(gt / groan_dur, 0, 1))
    fx.place(edges(norm(groan)), a0 + 1.15, gain=0.16, pan=-0.2, wet=0.4)
    fx.place(swish(1.2, 300, 1600), a0 + 1.1, gain=0.22, wet=0.4)
    riser = swept_noise(rng, 1.1, 2500, 9000, width=0.8, curve=1.5)
    rt = tvec(1.1)[: len(riser)]
    fx.place(edges(norm(riser) * raised(rt, 0, 1.0) ** 2), a0 + 1.0, gain=0.10, wet=0.6)
    log(a0 + 1.15, "hinge groan + air whoosh + warm shimmer riser")
    for i, m in enumerate((74, 78, 81, 86, 90)):
        fx.place(bell(midi(m), rng, 2.2), a0 + 1.3 + i * 0.12, gain=0.035, pan=(-0.5 + 0.25 * i), wet=0.7)

    for token, fb, tone, pan in (("gold", 6.44, 3300, -0.4), ("sterling", 7.40, 4600, 0.0), ("platinum", 8.70, 5600, 0.4)):
        at = word("arsenal", token, fb)
        fx.place(tinkle(tone, 0.6), at, gain=0.16, pan=pan, wet=0.5)
        log(at, f"tink on '{token}'")
    for token, fb in (("markups", 11.14), ("premiums", 13.02)):
        at = word("arsenal", token, fb)
        fx.place(swish(0.22, 900, 7000), at - 0.04, gain=0.26, pan=0.3, wet=0.15)
        fx.place(digital_click(1800), at + 0.12, gain=0.10, pan=0.3)
        log(at, f"strike-through swipe on '{token}'")

    scoop = a0 + 14.3
    cascade_dur = 3.6

    def grain_rate(x: float) -> float:
        burst = 9000 * np.exp(-((x - 0.25) / 0.22) ** 2)          # the plunge: shhhhk
        slide = 3800 * raised(np.array(x), 0.15, 0.4) * np.exp(-max(0, x - 0.6) / 1.4)
        tail = 900 * (1 - raised(np.array(x), cascade_dur - 0.8, cascade_dur))
        return float(burst + slide + tail)

    gl, gr = grains(cascade_dur, grain_rate)
    place_stereo(fx, edges(gl, 0.003, 0.15), edges(gr, 0.003, 0.15), scoop, gain=0.34, wet=0.12)
    body = filt(rng.normal(0, 1, int(0.9 * RATE)), "band", [250, 1300]) * np.exp(-tvec(0.9) / 0.18)
    fx.place(edges(norm(body)), scoop + 0.02, gain=0.14, wet=0.1)
    log(scoop, "scoop plunges into silver grain: granular ASMR shhhhk, cascade until ~17.6")
    fairly = word("arsenal", "priced", 17.24)
    for i, m in enumerate((62, 66, 69, 74)):
        fx.place(bell(midi(m), rng, 2.6), fairly + i * 0.025, gain=0.06, pan=-0.3 + 0.2 * i, wet=0.6)
    log(fairly, "warm D major bell stab on 'priced fairly'")

    # ---------------- Scene 4 — the 47th Street advantage
    d0 = S["district"]
    traffic_dur = 6.6
    tn = int(traffic_dur * RATE)
    ttr = np.arange(tn) / RATE
    traffic = norm(filt(brown(tn), "low", 220)) * 0.8 + norm(filt(rng.normal(0, 1, tn), "band", [300, 2200])) * (0.35 + 0.3 * np.abs(smooth_random(tn, 1.5)))
    traffic *= raised(ttr, 0, 0.3) * (1 - raised(ttr, 4.8, 5.9))
    fx.place(edges(norm(traffic)), d0, gain=0.14, wet=0.2)
    for at, pan in ((0.55, -0.6), (1.9, 0.5)):
        fx.place(horn(), d0 + at, gain=0.035, pan=pan, wet=0.85)
    for at in (0.2, 0.9, 1.6):
        fx.place(swish(0.36, 500, 4200), d0 + at, gain=0.24, pan=rng.uniform(-0.4, 0.4), wet=0.2)
    log(d0, "hyper-lapse: traffic rumble, distant horns, whooshes at 0.2/0.9/1.6; fades into the showroom from 4.8")
    room_dur = 10.9 - 4.8 + 0.8
    rtn = int(room_dur * RATE)
    room = filt(rng.normal(0, 1, rtn), "band", [180, 3500])
    rtt = np.arange(rtn) / RATE
    fx.place(edges(norm(room) * raised(rtt, 0, 0.9) * (1 - raised(rtt, room_dur - 0.8, room_dur))), d0 + 4.8, gain=0.018, wet=0.3)
    diamond = word("district", "diamond", 3.36)
    ping = bell(1760, rng, 1.4)
    fx.place(ping, diamond, gain=0.10, pan=0.1, wet=0.55)
    fx.place(thump(0.3, 160, 90, 0.02, 0.05, noise=0.3, lp=500), diamond, gain=0.10)
    log(diamond, "pin-drop ping on 'Diamond'")
    grain_word = word("district", "grain", 9.90)
    fx.place(thump(0.7, 82, 42, 0.05, 0.16, noise=0.7, lp=380), grain_word, gain=0.55, wet=0.2)
    bl, br = grains(0.45, lambda x: 6000 * np.exp(-x / 0.09) + 50, lo=1800, hi=7000)
    place_stereo(fx, edges(bl, 0.001, 0.05), edges(br, 0.001, 0.05), grain_word + 0.01, gain=0.18, wet=0.1)
    glass = modal([3180, 5110, 7400], [1, 0.6, 0.3], [0.22, 0.14, 0.08], 0.5, strike=0.4)
    fx.place(glass, grain_word + 0.005, gain=0.07, pan=0.2, wet=0.35)
    log(grain_word, "heavy canvas bag thud on glass counter (thump + grain rattle + glass tick)")
    fx.place(swish(1.0, 400, 3200), d0 + 10.9, gain=0.18, wet=0.45)
    log(d0 + 10.9, "airy whoosh: US map reveal")
    ship = word("district", "ship", 12.58)
    for i in range(5):
        at = ship + i * 0.09
        dur = 0.5
        fx.place(swish(dur, 700, 6500), at, gain=0.10, pan=-0.8 + 0.4 * i, wet=0.3)
        ct = tvec(dur)
        chirp = np.sin(2 * np.pi * np.cumsum(500 + 1500 * (ct / dur) ** 2) / RATE) * np.sin(np.pi * ct / dur) ** 2
        fx.place(edges(chirp), at, gain=0.018, pan=-0.8 + 0.4 * i, wet=0.5)
    log(ship, "five rising route sweeps on 'ship'")
    insured = word("district", "insured", 13.14)
    stamp = thump(0.35, 210, 120, 0.015, 0.05, noise=0.9, lp=1400)
    fx.place(stamp, insured, gain=0.22, wet=0.2)
    log(insured, "soft seal/stamp on 'insured'")
    fx.place(digital_click(2600), d0 + 14.1, gain=0.08, pan=0.25)
    log(d0 + 14.1, "small tick")
    anywhere = word("district", "anywhere", 15.14)
    for i, m in enumerate((86, 90, 93, 98)):
        fx.place(bell(midi(m), rng, 2.0), anywhere + i * 0.06, gain=0.035, pan=-0.45 + 0.3 * i, wet=0.7)
    shimmer = swept_noise(rng, 1.2, 4000, 11000, width=0.7, curve=0.8)
    sht = tvec(1.2)[: len(shimmer)]
    fx.place(edges(norm(shimmer) * np.sin(np.pi * sht / 1.2) ** 2), anywhere - 0.1, gain=0.05, wet=0.5)
    log(anywhere, "shimmer as all routes land")

    # ---------------- Scene 5 — call to action
    c0 = S["cta"]
    fx.place(swish(0.5, 300, 2600), c0, gain=0.22, wet=0.3)
    log(c0, "split-screen whoosh")
    siz_dur = 3.8
    szt = tvec(siz_dur)
    siz_env = raised(szt, 0, 0.3) * np.exp(-np.maximum(szt - 0.3, 0) / 1.1)
    siz = (hiss(siz_dur, 3200, 11000) * 0.45 + crackle(siz_dur, 900, 2500, 10000)) * siz_env
    fx.place(edges(norm(siz), 0.01, 0.1), c0 + 0.2, gain=0.16, pan=-0.35, wet=0.25)
    log(c0 + 0.2, "liquid silver into ring mold: sizzle 0.2-4.0")
    for token, fb in (("protect", 0.9), ("perfect", 2.58)):
        at = word("cta", token, fb)
        fx.place(impact(1.8, 0.9), at, gain=0.42, wet=0.3)
        fx.place(anvil(), at, gain=0.16, pan=0.15, wet=0.5)
        log(at, f"anvil hit under '{token}'")
    lock = word("cta", "lock", 8.26)
    live = word("cta", "live", 8.86)
    fx.place(digital_click(2400), lock, gain=0.22, pan=0.3)
    fx.place(digital_click(3200), live, gain=0.17, pan=0.3)
    log(lock, "digital clicks on 'lock' and 'live'")
    resolve = c0 + 13.0
    shimmer_at = c0 + 13.6
    for i, m in enumerate((86, 90, 93, 98, 102)):
        fx.place(bell(midi(m), rng, 2.4), shimmer_at + i * 0.065, gain=0.05, pan=-0.6 + 0.3 * i, wet=0.75)
    sh = swept_noise(rng, 1.4, 3500, 12000, width=0.7, curve=0.7)
    sht = tvec(1.4)[: len(sh)]
    fx.place(edges(norm(sh) * np.sin(np.pi * sht / 1.4) ** 2), shimmer_at - 0.15, gain=0.05, wet=0.6)
    log(shimmer_at, "logo shimmer")

    # ---------------- Music: the groove (vault open → resolution)
    g0 = a0 + 2.0
    beat = 60 / BPM
    g_end = resolve - 0.6  # a breath before the resolution
    bars = [("D", 38), ("C", 36), ("G", 31), ("D", 38)]
    plucks_on = word("arsenal", "no", 10.7)
    showroom_lo, showroom_hi = d0 + 4.8, d0 + 10.9
    kick_s, hat_s = kick(), hat()
    i = 0
    while g0 + i * beat < g_end - 0.05:
        at = g0 + i * beat
        bar = (i // 4) % 4
        name, root = bars[bar]
        calm = showroom_lo <= at < showroom_hi
        energy = min(1.0, 0.55 + 0.45 * (at - g0) / (resolve - g0))
        kick_gain = (0.50 if i % 4 in (0, 2) else 0.36) * energy * (0.6 if calm else 1.0)
        music.place(kick_s, at, gain=kick_gain, wet=0.05)
        # Bass: eighth notes, root / octave / fifth.
        for e8, (iv, vel) in enumerate(((0, 1.0), (12, 0.6))):
            pat = [0, 0, 12, 0, 7, 0, 12, 7][(i % 4) * 2 + e8]
            note = root + pat
            bn = bass_note(midi(note), beat / 2 * 0.95)
            music.place(bn, at + e8 * beat / 2, gain=0.17 * vel * (0.8 if calm else 1.0), wet=0.05)
        if at >= plucks_on:
            chord_tones = {"D": [62, 66, 69, 74], "C": [60, 64, 67, 72], "G": [62, 67, 71, 74]}[name]
            for s16 in (1, 3):
                tone = chord_tones[(i * 2 + s16) % len(chord_tones)]
                music.place(pluck(midi(tone), 0.3, 0.8), at + s16 * beat / 4, gain=0.085 * (0.7 if calm else 1.0),
                            pan=(-0.35 if s16 == 1 else 0.35), wet=0.35)
        if at >= d0 and not calm:
            for s8 in (1,):
                music.place(hat_s, at + s8 * beat / 2, gain=0.07 * energy, pan=0.25, wet=0.1)
            music.place(hat_s, at + beat * 0.75, gain=0.032 * energy, pan=-0.2, wet=0.1)
        i += 1
    log(g0, f"groove in at {BPM:.0f} BPM (D-C-G-D mixolydian): kick + bass; plucks from 'No hidden'; hats in the district")
    # Pads under the groove: one chord per bar, quiet, opening slowly.
    pad_voicings = {"D": [50, 57, 62, 66, 69], "C": [48, 55, 60, 64, 67], "G": [43, 55, 59, 62, 67]}
    bar_len = 4 * beat
    b = 0
    while g0 + b * bar_len < g_end:
        name, _ = bars[b % 4]
        t0 = g0 + b * bar_len
        t1 = min(g_end + 0.4, t0 + bar_len + 0.25)
        pad_chord(music, pad_voicings[name], t0 - 0.15, t0 + 0.3, t1 - 0.3, t1, rng, gain=0.06 + 0.03 * min(1, b / 14),
                  bright=(0.1, 0.4))
        b += 1
    # Low D pedal under the groove, resolving into the final chord.
    ped_start, ped_end = g0, resolve + 0.2
    pn = int((ped_end - ped_start) * RATE)
    ptt = ped_start + np.arange(pn) / RATE
    pedal = oscillator(saw_table(midi(26), 160), midi(26), pn, rng, 0) + 0.6 * np.sin(2 * np.pi * midi(26) * (ptt - ped_start))
    pedal *= raised(ptt, ped_start, ped_start + 2.0) * (1 - raised(ptt, resolve - 0.1, ped_end))
    music.place(edges(norm(pedal)), ped_start, gain=0.07, wet=0.1)

    # The resolution: triumphant D major, held to the end.
    hold = duration - resolve
    cl, cr = brass_chord([38, 45, 50, 54, 57, 62, 66], hold, open_at=0.7)
    ht = tvec(hold)[: len(cl)]
    fade = 1 - raised(ht, hold - 0.65, hold - 0.05)
    place_stereo(music, cl * fade, cr * fade, resolve, gain=0.20, wet=0.45)
    sub = np.sin(2 * np.pi * midi(26) * ht) * raised(ht, 0, 0.3) * fade
    music.place(sub, resolve, gain=0.12)
    fx.place(impact(2.6, 1.5), resolve, gain=0.45, wet=0.5)
    log(resolve, "drone resolves into triumphant D major (brass swell + timpani-like boom), fading over the last 0.6 s")

    # ---------------- reverb, ducking, master
    ir = make_ir(rng, rt=2.4, length=3.4, predelay=0.03)

    def render(bus: Bus, wet_gain: float) -> np.ndarray:
        out = bus.dry.copy()
        for ch in range(2):
            out[:, ch] += oaconvolve(bus.send, ir[ch])[:n] * wet_gain
        return out

    music_out = render(music, 0.55)
    fx_out = render(fx, 0.5)
    voice, vsr = sf.read(str(PUBLIC / data["voice"]), dtype="float64")
    if voice.ndim > 1:
        voice = voice.mean(axis=1)
    if vsr != RATE:
        voice = resample_poly(voice, RATE, vsr)
    music_out *= duck_curve(voice, n, MUSIC_DUCK_DB)[:, None]
    fx_out *= duck_curve(voice, n, SFX_DUCK_DB)[:, None]
    mix = music_out + fx_out
    mix -= mix.mean(axis=0)
    t_all = np.arange(n) / RATE
    mix *= (1 - raised(t_all, duration - 0.6, duration - 0.02))[:, None]
    mix[:2] = 0
    mix[-2:] = 0

    PREVIEW.mkdir(parents=True, exist_ok=True)
    out = PUBLIC / data["score"]
    tmp = PREVIEW / f"{VID}-score.raw.wav"
    sf.write(str(tmp), mix.astype(np.float32), RATE, subtype="FLOAT")
    raw = measure(tmp)
    mix *= 10 ** ((TARGET_LUFS - raw["integratedLufs"]) / 20)
    # True peak headroom: limit sample peaks ~1 dB below the ceiling (inter-sample overs add the rest).
    mix = limit(mix, 10 ** ((CEILING_DBTP - 1.0) / 20))
    sf.write(str(tmp), mix.astype(np.float32), RATE, subtype="FLOAT")
    after = measure(tmp)
    trim = min(0.0, CEILING_DBTP - after["truePeakDbtp"])
    mix *= 10 ** (trim / 20)
    tmp.unlink()
    mix[:2] = 0
    mix[-2:] = 0
    sf.write(str(out), mix, RATE, subtype="PCM_24")
    final = measure(out)

    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    dual = PREVIEW / f"{VID}-voice-dual.wav"
    sf.write(str(dual), np.stack([voice, voice], axis=1).astype(np.float32), RATE, subtype="FLOAT")
    mix_path = PREVIEW / f"{VID}-mix.wav"
    sf.write(str(mix_path), (mix + voice[:, None]).astype(np.float32), RATE, subtype="FLOAT")
    voice_loud = measure(dual)
    mix_loud = measure(mix_path)
    dual.unlink()
    import subprocess
    subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", str(out), "-lavfi",
                    "showspectrumpic=s=2400x600:legend=1:scale=log:color=intensity",
                    str(PREVIEW / f"{VID}-score-spectrum.png")], check=True, capture_output=True)
    report = {
        "file": str(out.relative_to(ROOT)),
        "durationSeconds": round(len(mix) / RATE, 4),
        "scheduleDuration": duration,
        "tempoBpm": BPM,
        "key": "D minor drone (scenes 1–2) → D mixolydian groove (D–C–G–D) → D major resolution",
        "score": final,
        "voice": voice_loud,
        "voicePlusScore": mix_loud,
        "mixMinusVoiceLu": round(mix_loud["integratedLufs"] - voice_loud["integratedLufs"], 2),
        "ducking": {"musicDb": MUSIC_DUCK_DB, "sfxDb": SFX_DUCK_DB},
        "clicks": click_stats(mix),
        "events": sorted(EVENTS, key=lambda ev: ev["t"]),
    }
    (PREVIEW / f"{VID}-report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(f"score {final['integratedLufs']:.1f} LUFS / TP {final['truePeakDbtp']:.1f} dBTP | voice "
          f"{voice_loud['integratedLufs']:.1f} → mix {mix_loud['integratedLufs']:.1f} LUFS "
          f"({report['mixMinusVoiceLu']:+.2f} LU) | {len(mix) / RATE:.3f}s / {duration}s | clicks {report['clicks']}")


if __name__ == "__main__":
    main()
