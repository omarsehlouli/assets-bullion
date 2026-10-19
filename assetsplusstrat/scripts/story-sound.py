#!/usr/bin/env python3
"""Score and sound design for "What's inside?" (schedule id whats-inside, group story).

A quiet thriller: an A-minor drone and a patient 84 BPM pulse under the bargain,
UI foley for the listing and the scale, the pulse dropping out under "But under a
thin skin of gold", a cold sting on "tungsten", the heaviest hit of the film on
"You.", a documentary groove through the 2012 case and the "every day" grid with
an accelerating clock, near-silence for the question, then on "Don't worry" warm
C-major pads, a gold scan and a resolving swell into the logo.

Everything is synthesized with the instruments of premium-score.py and
makers-sound.py. Event times come from public/marketing/story/schedule.json:
word-anchored events follow the narration timestamps.

Music is ducked about 8 dB under the narration, SFX about 3 dB; the track is
limited and normalized to about -21 LUFS with true peak below -3 dBTP.

Writes public/marketing/story/audio/whats-inside-score.wav (48 kHz stereo PCM_24)
plus a voice+score preview and report in out/marketing/story/audio-preview/.

Run:  python -I scripts/story-sound.py
"""
from __future__ import annotations

import importlib.util
import json
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import oaconvolve, resample_poly

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PREVIEW = ROOT / "out/marketing/story/audio-preview"
VID = "whats-inside"
RATE = 48000
TARGET_LUFS = -21.0
CEILING_DBTP = -3.2
MUSIC_DUCK_DB = -8.0
SFX_DUCK_DB = -3.0
BPM = 84.0

# The Maker's Edge instruments (and, through them, the premium score's).
_spec = importlib.util.spec_from_file_location("makers_sound", ROOT / "scripts/makers-sound.py")
mk = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mk)
ps = mk.ps
Bus, raised, midi, saw_table, oscillator, bell = ps.Bus, ps.raised, ps.midi, ps.saw_table, ps.oscillator, ps.bell
swept_noise, make_ir, measure, click_stats, pad_chord = ps.swept_noise, ps.make_ir, ps.measure, ps.click_stats, ps.pad_chord
edges, norm, filt, tvec, smooth_random, place_stereo = mk.edges, mk.norm, mk.filt, mk.tvec, mk.smooth_random, mk.place_stereo
impact, swish, thump, heartbeat, digital_click = mk.impact, mk.swish, mk.thump, mk.heartbeat, mk.digital_click
kick, hat, pluck, bass_note, brass_chord, modal = mk.kick, mk.hat, mk.pluck, mk.bass_note, mk.brass_chord, mk.modal
duck_curve, limit, hiss = mk.duck_curve, mk.limit, mk.hiss

rng = np.random.default_rng(7310)
EVENTS: list[dict] = []


def log(at: float, name: str) -> None:
    EVENTS.append({"t": round(at, 3), "event": name})


def drone(bus: Bus, notes: list[int], t0: float, t1: float, gain: float, fade_in: float = 2.0, fade_out: float = 1.2,
          fc: float = 360, wet: float = 0.35) -> None:
    n = int((t1 - t0) * RATE)
    t = np.arange(n) / RATE
    x = np.zeros(n)
    for i, note in enumerate(notes):
        x += (1.0 if i == 0 else 0.6) * oscillator(saw_table(midi(note), fc), midi(note), n, rng, rng.uniform(-4, 4))
    x += 0.5 * np.sin(2 * np.pi * midi(notes[0]) * t)
    x *= 0.85 + 0.15 * smooth_random(n, 0.25)
    env = raised(t, 0, fade_in) * (1 - raised(t, t1 - t0 - fade_out, t1 - t0))
    bus.place(edges(norm(x) * env, 0.02, 0.2), t0, gain=gain, wet=wet)


def cold_sting(at: float, bus: Bus, gain: float) -> None:
    """A minor chord with a flat-second rub, struck and left to ring cold."""
    left, right = brass_chord([33, 40, 45, 46, 52], 2.6, open_at=0.05)
    t = tvec(2.6)[: len(left)]
    env = np.exp(-t / 1.0)
    place_stereo(bus, edges(left * env), edges(right * env), at, gain=gain, wet=0.5)


def main() -> None:
    schedule = json.loads((PUBLIC / "marketing/story/schedule.json").read_text())
    data = schedule[VID]
    duration = float(data["duration"])
    n = int(round(duration * RATE))
    scenes = {s["id"]: s for s in data["scenes"]}
    S = {k: float(v["visualStart"]) for k, v in scenes.items()}
    F = 1 / 60  # one video frame

    def word(scene: str, token: str, occurrence: int = 0) -> float:
        hits = [w for w in scenes[scene]["words"] if re.sub(r"[^a-z0-9]", "", w["word"].lower()) == token]
        if len(hits) <= occurrence:
            raise KeyError(f"No '{token}' in {scene}")
        return float(hits[occurrence]["start"])

    music, fx = Bus(n), Bus(n)

    # ---------------- 1 · spot: the price, and the twin metal
    fx.place(impact(2.0, 0.7), 0.05, gain=0.30, wet=0.5)
    log(0.05, "soft opening boom")
    gold, above = word("spot", "gold"), word("spot", "4000")
    k, at = 0, gold
    while at < above + 0.5:
        fx.place(digital_click(2600 + 30 * k), at, gain=0.05, pan=0.2)
        at += max(0.045, 0.11 - 0.004 * k)
        k += 1
    log(gold, f"price ticker: {k} ticks up to $4,165")
    fx.place(ps.stamp(rng), above + 8 * F + 9 * F, gain=0.26, pan=0.25, wet=0.2)
    log(above + 17 * F, "stamp: ABOVE $4,000")
    for token in ("and", "cheap"):
        t = word("spot", token) - 6 * F
        fx.place(ps.swipe(rng, 0.3), t, gain=0.22, pan=-0.3 if token == "and" else 0.3, wet=0.2)
        log(t, f"tile slides in ('{token}')")
    weighs, same, tung = word("spot", "weighs"), word("spot", "same"), word("spot", "tungsten")
    for i in range(14):
        fx.place(ps.tick(rng, 3200 + 60 * i), weighs + i * 0.06, gain=0.035, pan=0.0)
    beam = modal([410, 1030, 1720], [1, 0.5, 0.3], [0.5, 0.3, 0.2], 1.0, strike=0.3)
    fx.place(beam, weighs + 0.1, gain=0.10, wet=0.4)
    fx.place(ps.stamp(rng), same + 9 * F, gain=0.24, pan=-0.1, wet=0.2)
    log(same, "balance beam settles + stamp ≈ SAME WEIGHT")
    clank = modal([196, 523, 911, 1460], [1, 0.6, 0.4, 0.25], [1.4, 0.9, 0.6, 0.4], 2.0, strike=0.5)
    fx.place(clank, tung, gain=0.22, wet=0.55)
    fx.place(impact(1.6, 0.6), tung, gain=0.22, wet=0.3)
    log(tung, "cold steel clank on 'Tungsten'")

    # ---------------- 2 · picture: an innocent-looking listing
    p0 = S["picture"]
    fx.place(swish(0.5, 300, 2600), p0, gain=0.18, wet=0.3)
    for token, f in (("sealed", 1320), ("serial", 1480), ("five", 1760)):
        t = word("picture", token) - 2 * F
        fx.place(ps.blip(f, 0.12), t, gain=0.10, pan=0.1, wet=0.25)
        log(t, f"badge pop '{token}'")
    five = word("picture", "five")
    for i in range(5):
        fx.place(ps.tick(rng, 4200 + 180 * i), five + i * 5 * F, gain=0.04, pan=-0.4 + 0.2 * i)
    fx.place(ps.blip(990, 0.1), word("picture", "200"), gain=0.09, wet=0.2)
    tag = word("picture", "serial") + 4 * F
    fx.place(ps.paper_rustle(rng, 0.35), tag, gain=0.12, pan=-0.4)
    buy = word("picture", "buy")
    fx.place(ps.phone_tap(), buy, gain=0.32, pan=0.3)
    fx.place(ps.confirm_chime(), buy + 10 * F, gain=0.07, pan=0.3, wet=0.3)
    log(buy, "Buy now: key press + small confirm chime")

    # ---------------- 3 · arrives: parcel, scale, magnet, scan, tungsten
    a0 = S["arrives"]
    fx.place(ps.ship_thud(rng), a0 + 0.38, gain=0.42, wet=0.15)
    log(a0 + 0.38, "parcel lands")
    arrives = word("arrives", "arrives")
    fx.place(ps.paper_rustle(rng, 0.6), arrives, gain=0.16, pan=-0.2)
    weight, out = word("arrives", "weight"), word("arrives", "out")
    fx.place(ps.beep(2400, 0.07), weight - 4 * F, gain=0.06, pan=0.2)
    for i in range(10):
        fx.place(ps.tick(rng, 2600 + 40 * i), weight + i * 0.055, gain=0.03, pan=0.2)
    fx.place(ps.confirm_tick(rng), out, gain=0.18, pan=0.2)
    log(out, "scale settles: beep, count ticks, confirm")
    magnet, stick = word("arrives", "magnet"), word("arrives", "stick")
    fx.place(ps.magnet_clack_slide(rng), magnet + 0.02, gain=0.38, pan=0.35, wet=0.15)
    fx.place(thump(0.4, 180, 90, 0.02, 0.08, noise=0.6, lp=900), stick + 0.35, gain=0.12, pan=0.4)
    fx.place(ps.confirm_tick(rng), stick + 6 * F, gain=0.16, pan=0.2)
    log(magnet, "magnet clacks, slides off, drops")
    under, tungsten = word("arrives", "under"), word("arrives", "tungsten")
    fx.place(ps.analyzer_scan(rng, tungsten - under), under, gain=0.30, wet=0.3)
    riser = swept_noise(rng, tungsten - under + 0.05, 600, 5200, width=0.8, curve=1.6)
    rt = tvec(len(riser) / RATE)[: len(riser)]
    fx.place(edges(norm(riser) * raised(rt, 0, rt[-1]) ** 2), under, gain=0.10, wet=0.5)
    log(under, "scan sweep + riser under 'But under a thin skin of gold'")
    fx.place(impact(2.4, 1.3), tungsten, gain=0.55, wet=0.4)
    fx.place(ps.stamp(rng), tungsten, gain=0.6, wet=0.2)
    cold_sting(tungsten, music, 0.24)
    log(tungsten, "TUNGSTEN: impact + stamp + cold minor sting")

    # ---------------- 4 · who: the loss looks for an owner, then You.
    so, loss = word("who", "so"), word("who", "loss")
    for i, (dt, f, pan) in enumerate(((4, 880, -0.5), (10, 990, 0.5), (16, 740, 0.0))):
        fx.place(ps.blip(f, 0.09), S["who"] + dt * F + 0.03, gain=0.07, pan=pan, wet=0.25)
    log(so, "three profile cards pop in")
    fx.place(thump(0.35, 140, 70, 0.02, 0.07, noise=0.4, lp=600), loss - 6 * F, gain=0.22)
    fx.place(ps.blip(520, 0.14), loss - 6 * F, gain=0.08, wet=0.3)
    log(loss - 6 * F, "the loss chip lands")
    nott, seller = word("who", "not"), word("who", "seller")
    fx.place(swish(0.38, 400, 4200), nott - 0.04, gain=0.2, pan=-0.35, wet=0.2)
    log(nott, "the chip lunges at the seller")
    for k, f in enumerate((330, 247)):
        fx.place(ps.blip(f, 0.09), seller + 4 * F + k * 0.1, gain=0.12, pan=-0.4)
    fx.place(ps.swipe(rng, 0.26), seller, gain=0.22, pan=-0.3, wet=0.15)
    log(seller, "refused: denied double-tone + strike-through")
    theyre, gone, you = word("who", "theyre"), word("who", "gone"), word("who", "you")
    fx.place(ps.blip(1560, 0.07), theyre - 16 * F, gain=0.07, pan=-0.3, wet=0.2)
    fx.place(ps.blip(311, 0.16), gone, gain=0.09, pan=-0.3, wet=0.2)
    for k in range(14):
        fx.place(ps.tick(rng, rng.uniform(2200, 6800)), gone + rng.uniform(0, 0.45), gain=0.04, pan=rng.uniform(-0.7, 0.1), wet=0.3)
    down = swept_noise(rng, 0.9, 5000, 400, width=0.7, curve=0.8)
    dt = tvec(0.9)[: len(down)]
    fx.place(edges(norm(down) * np.sin(np.pi * dt / 0.9)), gone - 0.05, gain=0.10, wet=0.5)
    log(gone, "message bounces (error tone), the profile disintegrates (crackle + dissolve)")
    fx.place(swish(0.3, 2600, 300, up=False), you - 16 * F, gain=0.18, wet=0.2)
    log(you - 16 * F, "the chip falls into your card")
    rev = swept_noise(rng, 0.7, 300, 6000, width=0.9, curve=2.2)
    rvt = tvec(0.7)[: len(rev)]
    fx.place(edges(norm(rev) * raised(rvt, 0, 0.7) ** 3), you - 0.7, gain=0.16, wet=0.4)
    fx.place(impact(3.0, 1.8), you, gain=0.95, wet=0.55)
    sub_n = int(2.6 * RATE)
    st = np.arange(sub_n) / RATE
    fx.place(edges(np.sin(2 * np.pi * (34 + 20 * np.exp(-st / 0.2)) * st) * np.exp(-st / 0.9)), you, gain=0.5)
    cold_sting(you, music, 0.30)
    log(you, "YOU.: the film's biggest hit (reverse swell, impact, sub drop, sting)")

    # ---------------- 5 · bill
    b0 = S["bill"]
    fx.place(ps.page_turn(rng, 0.5), b0 + 0.05, gain=0.2, pan=-0.2)
    amount = word("bill", "3965")
    fx.place(ps.printer(rng, 2.4), amount, gain=0.10, pan=0.25, wet=0.1)
    log(amount, "receipt printer while $3,965 counts up")
    worth, nothing = word("bill", "worth"), word("bill", "nothing")
    fx.place(ps.glide(900, 180, nothing - worth + 0.3), worth - 4 * F, gain=0.12, wet=0.3)
    fx.place(ps.stamp(rng), nothing + 4 * F + 9 * F, gain=0.36, pan=0.1, wet=0.2)
    fx.place(impact(1.6, 0.8), nothing + 13 * F, gain=0.16, wet=0.3)
    log(nothing, "value glides down; LOSS stamp")

    # ---------------- 6 · case: the 2012 Diamond District case
    c0 = S["case"]
    year = word("case", "2012")
    fx.place(ps.page_turn(rng, 0.6), year - 10 * F, gain=0.22, pan=0.1)
    paid = word("case", "100000")
    k = 0
    while k < 16:
        fx.place(ps.tick(rng, 3000 + 70 * k), paid + k * 0.065, gain=0.035, pan=0.15)
        k += 1
    four = word("case", "four")
    for i in range(4):
        hit = modal([620 + 40 * i, 1590, 2760], [1, 0.5, 0.3], [0.35, 0.2, 0.12], 0.7, strike=0.7)
        fx.place(hit, four + i * 7 * F, gain=0.13, pan=-0.45 + 0.3 * i, wet=0.3)
        fx.place(thump(0.3, 150, 80, 0.02, 0.06, noise=0.5, lp=700), four + i * 7 * F, gain=0.12)
    log(four, "four heavy bars set down")
    for token in ("serial", "paperwork"):
        fx.place(ps.confirm_tick(rng), word("case", token), gain=0.16)
    filled, ct = word("case", "filled"), word("case", "tungsten")
    grind_dur = ct - filled + 0.3
    gt = tvec(grind_dur)
    grind = filt(rng.normal(0, 1, len(gt)), "band", [700, 4200]) * (0.6 + 0.4 * np.sin(2 * np.pi * 38 * gt))
    fx.place(edges(norm(grind) * raised(gt, 0, 0.1) * (1 - raised(gt, grind_dur - 0.2, grind_dur))), filled, gain=0.08, pan=0.1, wet=0.2)
    fx.place(ps.analyzer_scan(rng, grind_dur), filled, gain=0.2, wet=0.3)
    fx.place(impact(2.4, 1.2), ct, gain=0.6, wet=0.4)
    fx.place(ps.stamp(rng), ct, gain=0.65, wet=0.2)
    cold_sting(ct, music, 0.22)
    log(ct, "drill/scan, then FILLED WITH TUNGSTEN stamp + impact")

    # ---------------- 7 · everyday: the clock runs faster
    e0, q0 = S["everyday"], S["question"]
    t, gap = e0 + 0.3, 0.5
    k = 0
    while t < q0 - 0.1:
        fx.place(ps.tick(rng, 2100 if k % 2 else 2600), t, gain=0.05 + 0.03 * min(1, (t - e0) / 5), pan=0.45)
        t += gap
        gap = max(0.07, gap * 0.94)
        k += 1
    log(e0 + 0.3, f"clock ticks accelerating x{k}")
    for token in ("every", "quietly"):
        t = word("everyday", token) - 6 * F
        fx.place(swish(0.7, 200, 3500, up=False), t, gain=0.2, wet=0.35)
        log(t, f"grid zoom-out whoosh ('{token}')")
    listed = word("everyday", "listed")
    for i in range(18):
        fx.place(ps.tick(rng, rng.uniform(1500, 2400)), listed + rng.uniform(0, 2.3), gain=0.03, pan=rng.uniform(-0.7, 0.7), wet=0.2)
    log(listed, "scattered SOLD clicks")

    # ---------------- 8 · question: the room empties
    inside = word("question", "inside")
    fx.place(heartbeat(), inside - 0.05, gain=0.28, wet=0.15)
    log(inside, "single heartbeat on 'inside'")

    # ---------------- 9 · verify: warm, and the same scan comes back gold
    v0 = S["verify"]
    worry = word("verify", "dont")
    fx.place(ps.warm_swell([60, 64, 67, 71, 76], rng, 2.6), worry - 0.2, gain=0.22, wet=0.5)
    log(worry, "warm swell on 'Don't worry'")
    test, front, york, ships = word("verify", "test"), word("verify", "front"), word("verify", "york"), word("verify", "ships")
    scan_dur = front - test + 40 * F
    fx.place(ps.analyzer_scan(rng, scan_dur), test, gain=0.26, wet=0.3)
    fx.place(ps.confirm_chime(), test + scan_dur, gain=0.18, wet=0.35)
    for t in (front, york, ships - 4 * F):
        fx.place(ps.confirm_tick(rng), t, gain=0.16, pan=-0.2)
    fx.place(ps.stamp(rng), ships + 18 * F + 9 * F, gain=0.55, wet=0.25)
    fx.place(ps.glint(rng), ships + 30 * F, gain=0.18, pan=0.2, wet=0.5)
    for i, m in enumerate((84, 88, 91, 96)):
        fx.place(bell(midi(m), rng, 2.0), ships + 30 * F + i * 0.06, gain=0.04, pan=-0.4 + 0.27 * i, wet=0.7)
    log(test, "gold scan, chime, three confirms, VERIFIED stamp + glint")

    # ---------------- 10 · cta
    z0 = S["cta"]
    air, boom = ps.light_on(rng)
    fx.place(air, z0 - 0.1, gain=0.12, wet=0.5)
    fx.place(boom, z0, gain=0.25)
    for i, m in enumerate((84, 88, 91, 96, 100)):
        fx.place(bell(midi(m), rng, 2.4), z0 + 0.3 + i * 0.07, gain=0.05, pan=-0.6 + 0.3 * i, wet=0.75)
    buyw = word("cta", "buy")
    fx.place(ps.blip(1320, 0.12), buyw - 6 * F, gain=0.08, wet=0.3)
    log(z0, "logo light-on + shimmer; pill pop on 'Buy'")

    # ---------------- Cuts: soft air into each scene that has no entrance sound of its own
    for sid in ("arrives", "who", "bill", "case", "everyday", "verify"):
        fx.place(swish(0.42, 260, 3200), S[sid] - 0.2, gain=0.08, wet=0.35)
    fx.place(swish(0.9, 120, 1800, up=False), S["question"] - 0.3, gain=0.10, wet=0.5)
    log(S["question"] - 0.3, "the room empties into the question")

    # ---------------- Music
    beat = 60 / BPM
    tense_end = q0 + 0.6
    drone(music, [33, 40, 45], 0.2, tense_end, gain=0.10, fade_in=3.0, fade_out=1.0)
    log(0.2, "A-minor drone (A1 E2 A2) under the whole problem")
    # The pulse: soft kick + bass, sparse at first, out under the reveal, back after it.
    a_under = word("arrives", "under")
    rests = [(a_under - 0.3, word("arrives", "tungsten") + 1.4), (word("who", "you") - 0.9, S["bill"] + 1.2)]
    pulse_from = word("spot", "and")
    kick_s, hat_s = kick(), hat()
    i = 0
    while pulse_from + i * beat < q0 - 0.2:
        t = pulse_from + i * beat
        i += 1
        if any(a <= t < b for a, b in rests):
            continue
        groove = S["case"] <= t
        energy = 0.55 + 0.45 * min(1.0, max(0.0, (t - S["case"]) / (q0 - S["case"]))) if groove else 0.5
        music.place(kick_s, t, gain=0.38 * energy if (i % 2 or groove) else 0.22, wet=0.05)
        root = [33, 33, 36, 31][(i // 8) % 4]
        if groove:
            for e8 in range(2):
                note = root + [0, 12, 0, 7][(i * 2 + e8) % 4]
                music.place(bass_note(midi(note + 12), beat / 2 * 0.9), t + e8 * beat / 2, gain=0.12 * energy, wet=0.05)
            if t >= S["everyday"]:
                music.place(hat_s, t + beat / 2, gain=0.06 * energy, pan=0.25, wet=0.1)
        else:
            music.place(bass_note(midi(root + 12), beat * 0.8), t, gain=0.08, wet=0.05)
    log(pulse_from, f"{BPM:.0f} BPM pulse; rests under the reveal and the 'You.' hit; groove from the 2012 case")
    # A quiet, almost innocent pluck figure while the listing looks perfect.
    figure = [69, 72, 76, 71]
    t, j = S["picture"] + 0.4, 0
    while t < a_under - 0.4:
        music.place(pluck(midi(figure[j % 4]), 0.5, 0.6), t, gain=0.05, pan=-0.3 if j % 2 else 0.3, wet=0.45)
        t += beat
        j += 1
    # The question: everything drops to a thin high tone and a sub.
    qn = int((S["verify"] + 0.8 - q0) * RATE)
    qt = np.arange(qn) / RATE
    thin = np.sin(2 * np.pi * midi(88) * qt) * (0.6 + 0.4 * np.sin(2 * np.pi * 4.5 * qt))
    qenv = raised(qt, 0, 0.6) * (1 - raised(qt, qt[-1] - 0.9, qt[-1]))
    music.place(edges(thin * qenv), q0, gain=0.012, wet=0.6)
    music.place(edges(np.sin(2 * np.pi * midi(33) * qt) * qenv), q0, gain=0.035)
    log(q0, "question: thin high tone + sub only")
    # Don't worry: C major pads, a gentle figure, then the resolution on the logo.
    chords = [[48, 55, 60, 64, 67], [43, 55, 59, 62, 67], [45, 57, 60, 64, 69], [41, 53, 57, 60, 65]]
    bar_len = 4 * beat
    t0 = worry - 0.3
    b = 0
    while t0 + b * bar_len < S["cta"]:
        s = t0 + b * bar_len
        e = min(S["cta"] + 0.4, s + bar_len + 0.3)
        pad_chord(music, chords[b % 4], s - 0.2, s + 0.6, e - 0.3, e, rng, gain=0.07 + 0.02 * b, bright=(0.12, 0.45))
        b += 1
    warm_figure = [72, 76, 79, 76]
    t, j = word("verify", "bullion"), 0
    while t < S["cta"] - 0.2:
        music.place(pluck(midi(warm_figure[j % 4]), 0.6, 0.9), t, gain=0.05, pan=-0.25 if j % 2 else 0.25, wet=0.5)
        t += beat / 2
        j += 1
    hold = duration - S["cta"]
    cl, cr = brass_chord([36, 43, 48, 52, 55, 60, 62, 64], hold, open_at=0.8)
    ht = tvec(hold)[: len(cl)]
    fade = 1 - raised(ht, hold - 1.0, hold - 0.05)
    place_stereo(music, cl * fade, cr * fade, S["cta"], gain=0.2, wet=0.5)
    music.place(np.sin(2 * np.pi * midi(36) * ht) * raised(ht, 0, 0.4) * fade, S["cta"], gain=0.1)
    log(S["cta"], "resolution: C major add9 swell to the end")

    # ---------------- reverb, ducking, master
    ir = make_ir(rng, rt=2.2, length=3.2, predelay=0.025)

    def render(bus: Bus, wet_gain: float) -> np.ndarray:
        out = bus.dry.copy()
        for ch in range(2):
            out[:, ch] += oaconvolve(bus.send, ir[ch])[:n] * wet_gain
        return out

    music_out = render(music, 0.55)
    fx_out = render(fx, 0.45)
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
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = PREVIEW / f"{VID}-score.raw.wav"
    sf.write(str(tmp), mix.astype(np.float32), RATE, subtype="FLOAT")
    raw = measure(tmp)
    mix *= 10 ** ((TARGET_LUFS - raw["integratedLufs"]) / 20)
    mix = limit(mix, 10 ** ((CEILING_DBTP - 1.0) / 20))
    sf.write(str(tmp), mix.astype(np.float32), RATE, subtype="FLOAT")
    after = measure(tmp)
    mix *= 10 ** (min(0.0, CEILING_DBTP - after["truePeakDbtp"]) / 20)
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
    subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", str(out), "-lavfi",
                    "showspectrumpic=s=2400x600:legend=1:scale=log:color=intensity",
                    str(PREVIEW / f"{VID}-score-spectrum.png")], check=True, capture_output=True)
    report = {
        "file": str(out.relative_to(ROOT)),
        "durationSeconds": round(len(mix) / RATE, 4),
        "scheduleDuration": duration,
        "tempoBpm": BPM,
        "key": "A minor drone + pulse (problem) → silence (question) → C major (Bullion Trading)",
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
