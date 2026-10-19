#!/usr/bin/env python3
"""Write upload-ready .srt captions for the premium films from schedule.json.

Cues follow the narration's phrasing (split on . , ? !) and stay under ~42
characters, timed to the recognised word timestamps.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DISPLAY = {"Forty-Seventh": "47th"}
MAX = 42


def stamp(t: float) -> str:
    ms = max(0, round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def length(words):
    return len(" ".join(w[0] for w in words))


def split_even(words):
    if length(words) <= MAX:
        return [words]
    parts = -(-length(words) // MAX)
    target = length(words) / parts
    out, current = [], []
    for w in words:
        if current and length(current + [w]) > target + 4 and len(out) < parts - 1:
            out.append(current)
            current = []
        current.append(w)
    return out + [current]


def cues(scene):
    phrases, current = [], []
    for w in scene["words"]:
        text = DISPLAY.get(w["word"], w["word"])
        current.append((text, w["start"], w["end"]))
        if text[-1] in ".,?!;:":
            phrases.append(current)
            current = []
    if current:
        phrases.append(current)
    out, words = [], []
    for chunk in (c for p in phrases for c in split_even(p)):
        if words and (words[-1][0][-1] in ".?!" or length(words + chunk) > MAX):
            out.append(words)
            words = []
        words += chunk
    if words:
        out.append(words)
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--group", default="premium")
    group = parser.parse_args().group
    schedule = json.loads((ROOT / f"public/marketing/{group}/schedule.json").read_text())
    target = ROOT / f"out/marketing/{group}"
    target.mkdir(parents=True, exist_ok=True)
    for vid, data in schedule.items():
        lines = []
        groups = [g for scene in data["scenes"] for g in cues(scene)]
        for i, group in enumerate(groups):
            start = group[0][1] - 0.05
            end = group[-1][2] + 0.25
            if i + 1 < len(groups):
                end = min(end, groups[i + 1][0][1] - 0.06)
            lines += [str(i + 1), f"{stamp(start)} --> {stamp(end)}", " ".join(w[0] for w in group), ""]
        (target / f"{vid}.srt").write_text("\n".join(lines))
        print(f"{vid}.srt: {len(groups)} cues")


if __name__ == "__main__":
    main()
