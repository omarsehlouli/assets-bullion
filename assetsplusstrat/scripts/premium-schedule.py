#!/usr/bin/env python3
"""Re-time the narration clips for the premium edit and assemble one voice track per video.

The original assembly packs sentences 0.12s apart. The premium cut gives each
sentence room to land: a short lead-in, a natural pause between scenes and a
held end card. Clips are only moved, never stretched.

Run with any Python 3.12 environment that has numpy, soundfile and scipy.
Writes public/marketing/premium/schedule.json and premium/audio/<id>-voice.wav.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
RATE = 48000
FPS = 60
LEAD = 0.45      # first word lands after the opening light-up
GAP = 0.42       # breath between sentences
TAIL = 2.4       # end card hold after "Buy from Bullion Trading."
VISUAL_LEAD = 0.22  # cut to the next scene just before its first word


def norm(word: str) -> str:
    return re.sub(r"[^a-z0-9]", "", word.lower())


def caption_words(scene: dict) -> list[dict]:
    """Recognized timestamps, displayed with the script's own spelling."""
    asr = []
    for word in scene["words"]:
        if asr and word["word"].startswith(("-", ".", ",")):
            asr[-1] = {**asr[-1], "word": asr[-1]["word"] + word["word"], "end": word["end"]}
        else:
            asr.append(dict(word))
    script = scene["text"].split()
    if len(script) == len(asr):
        return [{"word": text, "start": w["start"], "end": w["end"]} for text, w in zip(script, asr)]
    print(f"  ! {scene['id']}: {len(script)} script words vs {len(asr)} recognized; using recognized text")
    return [{"word": w["word"], "start": w["start"], "end": w["end"]} for w in asr]


def replace_phrases(words: list[dict], replacements: list[list[str]]) -> list[dict]:
    """Show spoken phrases in written form, e.g. "ten to fifteen dollars" → "$10–$15"."""
    for spoken, shown in replacements:
        target = [norm(t) for t in spoken.split()]
        i = 0
        while i + len(target) <= len(words):
            if [norm(w["word"]) for w in words[i:i + len(target)]] == target:
                tail = re.search(r"[.,!?;:]+$", words[i + len(target) - 1]["word"])
                merged = {"word": shown + (tail.group(0) if tail else ""), "start": words[i]["start"],
                          "end": words[i + len(target) - 1]["end"]}
                words = words[:i] + [merged] + words[i + len(target):]
            i += 1
    return words


def loudnorm(path: Path, target: float = -16.0) -> None:
    def run(af: str, dest: Path | None) -> dict:
        cmd = ["ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", str(path), "-af", af]
        cmd += ["-f", "null", "-"] if dest is None else ["-ar", str(RATE), "-c:a", "pcm_s24le", str(dest)]
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        return json.loads(re.findall(r"\{[^{}]*\}", result.stderr, flags=re.S)[-1])

    m = run(f"loudnorm=I={target}:TP=-1.5:LRA=11:print_format=json", None)
    tmp = path.with_suffix(".tmp.wav")
    run(f"loudnorm=I={target}:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
        f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:"
        "linear=true:print_format=json", tmp)
    tmp.replace(path)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--group", default="premium", help="Campaign group; writes public/marketing/<group>/")
    args = parser.parse_args()
    out = PUBLIC / "marketing" / args.group
    timing = json.loads((PUBLIC / "marketing/timing.json").read_text())
    campaign = {v["id"]: v for v in json.loads((PUBLIC / "marketing/campaign.json").read_text())["videos"]}
    (out / "audio").mkdir(parents=True, exist_ok=True)
    schedule = {}
    for vid, data in timing.items():
        brief = campaign.get(vid, {})
        if brief.get("group", "premium") != args.group:
            continue
        # Optional per-film pacing: pre-roll before each scene's first word, pause after it.
        pacing = brief.get("pacing", {})
        leads = pacing.get("lead")
        gap = pacing.get("gap", GAP)
        tail = pacing.get("tail", TAIL)
        cursor = leads[0] if leads else LEAD
        scenes = []
        clips = []
        for i, scene in enumerate(data["scenes"]):
            scene_brief = next((s for s in brief.get("scenes", []) if s["id"] == scene["id"]), {})
            if leads and i > 0:
                cursor += leads[i]
            clip, rate = sf.read(str(PUBLIC / scene["audio"]), dtype="float32")
            if clip.ndim > 1:
                clip = clip.mean(axis=1)
            if rate != RATE:
                from scipy.signal import resample_poly
                clip = resample_poly(clip, RATE, rate).astype(np.float32)
            length = len(clip) / RATE
            shift = cursor - scene["start"]
            # Optional written form ("$4,000" for "four thousand dollars"), one token per recognized word.
            shown = {**scene, "text": scene_brief["display"]} if "display" in scene_brief else scene
            words = [{**w, "start": round(w["start"] + shift, 4), "end": round(w["end"] + shift, 4)}
                     for w in replace_phrases(caption_words(shown), scene_brief.get("caption", []))]
            scenes.append({
                "id": scene["id"],
                "text": scene["text"],
                "audioStart": round(cursor, 4),
                "audioEnd": round(cursor + length, 4),
                "visualStart": 0 if i == 0 else round(cursor - (leads[i] if leads else VISUAL_LEAD), 4),
                "words": words,
            })
            clips.append((cursor, clip))
            cursor += length + gap
        duration = scenes[-1]["audioEnd"] + tail
        for i, scene in enumerate(scenes):
            scene["visualEnd"] = scenes[i + 1]["visualStart"] if i + 1 < len(scenes) else round(duration, 4)

        track = np.zeros(int(np.ceil(duration * RATE)), dtype=np.float32)
        for start, clip in clips:
            offset = round(start * RATE)
            track[offset:offset + len(clip)] += clip[: len(track) - offset]
        voice_path = out / "audio" / f"{vid}-voice.wav"
        sf.write(str(voice_path), track, RATE, subtype="PCM_24")
        loudnorm(voice_path)

        frames = int(np.ceil(duration * FPS))
        schedule[vid] = {
            "id": vid,
            "title": data.get("title", vid),
            "fps": FPS,
            "durationInFrames": frames,
            "duration": round(duration, 4),
            "voice": f"marketing/{args.group}/audio/{vid}-voice.wav",
            "score": f"marketing/{args.group}/audio/{vid}-score.wav",
            "scenes": scenes,
        }
        print(f"{vid}: {duration:.2f}s ({frames} frames) " +
              " | ".join(f"{s['id']} {s['visualStart']:.2f}" for s in scenes))
    (out / "schedule.json").write_text(json.dumps(schedule, indent=2) + "\n")


if __name__ == "__main__":
    main()
