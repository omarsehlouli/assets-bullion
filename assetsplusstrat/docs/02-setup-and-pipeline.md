# 02 · Setup and pipeline

This folder is a complete Remotion 4.0.534 project. Narration already exists for every film (per-scene WAVs and
word timings in `public/marketing/`), so the pipeline starts from finished voice audio.

## Requirements

| Tool | Version used | Why |
| --- | --- | --- |
| Node.js | 22.x | Remotion Studio and rendering |
| ffmpeg / ffprobe | 7.x on `PATH` | loudness measurement, mastering, spectrograms, review grids |
| Python | 3.12 with `numpy`, `scipy`, `soundfile` | scheduling the narration, synthesizing scores and sound design |
| Chrome | any current | Remotion's headless renderer (downloaded automatically if missing) |

```bash
cd assetsplusstrat
npm ci
python3.12 -m venv .venv && .venv/bin/pip install numpy scipy soundfile   # .venv is gitignored
```

In the commands below, `python` means that environment (`.venv/bin/python`).

## Run Studio

```bash
npm run dev
```

Films are grouped by Studio folder: **Bullion-Marketing** (group `premium`), **premium-2**, **premium-3**,
**story**, plus the legacy **Bullion-Marketing-v2**, **Bullion-Scenes** (BullionBrief) and MetalsBrief. Scrub, play with sound and edit; changes hot-reload.

## The pipeline

```text
public/marketing/campaign.json        scripts: scenes, written forms, pacing, closing line
public/marketing/audio/<film>/*.wav   narration, one clip per scene            ┐ existing
public/marketing/timing.json          word timings for every clip              ┘ voice
        │
        ▼  python -I scripts/premium-schedule.py --group <group>
public/marketing/<group>/schedule.json     scene cuts, audio placement, timed caption words
public/marketing/<group>/audio/<film>-voice.wav   assembled narration (−16 LUFS)
        │
        ▼  score + sound design (one of)
python -I scripts/premium-score.py --group <group> [--video <film>]   premium / premium-2 / premium-3
python -I scripts/makers-sound.py                                     The Maker's Edge
python -I scripts/story-sound.py                                      What's inside?
        → public/marketing/<group>/audio/<film>-score.wav (+ report in out/marketing/<group>/audio-preview/)
        │
        ▼  node scripts/render-premium.mjs <film> | --group=<group>
out/marketing/<group>/<film>.mp4      1080×1920, 60 fps, H.264 CRF 16, AAC 320k, mastered −14 LUFS / −1 dBTP
        │
        ▼  python3 scripts/premium-srt.py --group <group>
out/marketing/<group>/<film>.srt      upload captions (≤ 42 characters, phrase-split, word-timed)
```

Each step only moves or measures audio — narration is never stretched. Scene cuts land just before each
scene's first word (`pacing.lead`), and every on-screen event is tied to a spoken word through the schedule.

## Data formats

### `campaign.json` — one entry per film

```json
{
  "id": "whats-inside", "group": "story", "composition": "Bullion-WhatsInside",
  "title": "What's inside?", "audience": "…", "closing": "Buy from Bullion Trading.",
  "source": ["https://… (facts used on screen)"],
  "pacing": {"lead": [0.45, 0.45, …], "gap": 0.25, "tail": 2.8},
  "scenes": [
    {"id": "spot",
     "text": "This October, gold is trading above four thousand dollars an ounce. …",
     "display": "This October, gold is trading above $4,000 an ounce. …",
     "caption": [["Dhun-teh-rus", "Dhanteras"]],
     "headline": "", "eyebrow": "", "visual": "spot"}
  ]
}
```

- `text` is what is spoken. `display` (optional) is the written form with exactly one token per recognised word;
  `caption` (optional) replaces spoken phrases with their written form instead.
- `pacing.lead[i]`: silence between scene i's cut and its first word (first value = film pre-roll);
  `gap`: pause after each scene; `tail`: end-card hold. Defaults: lead 0.22 (pre-roll 0.45), gap 0.42, tail 2.4.
- `closing` defaults to "Buy from Bullion Trading.".
- `group` defaults to `premium`; it selects `public/marketing/<group>/` and the Studio folder.

### `timing.json` — narration you supply for a new film

```json
"<film-id>": {
  "id": "<film-id>", "title": "…", "duration": 79.8, "sampleRate": 24000,
  "audio": "marketing/audio/<film-id>.wav",
  "scenes": [
    {"id": "spot", "text": "…", "start": 0.1, "end": 10.475,
     "audio": "marketing/audio/<film-id>/spot.wav",
     "words": [{"word": "This", "start": 0.1, "end": 0.34}, …]}
  ]
}
```

Word times are relative to the assembled `<film-id>.wav` (scene clips laid end to end with short gaps);
`start`/`end` locate each clip in it. Any narration source works as long as it provides per-scene WAVs and word
timestamps in this shape.

### `schedule.json` — written by `premium-schedule.py`, read by the film

Per film: `fps`, `durationInFrames`, `voice`, `score`, and per scene `visualStart/visualEnd` (cuts),
`audioStart/audioEnd` and `words[{word,start,end}]` in film time. Scenes receive
`cue('word', occurrence?)` → the local frame where that word starts.

## Adding a new film

1. **Script** — add the entry to `campaign.json` (choose or create a `group`).
2. **Narration** — put the per-scene WAVs in `public/marketing/audio/<film-id>/` and add the `timing.json` entry.
3. **Schedule** — `python -I scripts/premium-schedule.py --group <group>`; check the printed cut times.
4. **Scenes** — create `src/<folder>/<Film>.tsx` exporting `{sceneId: React.FC<SceneProps>}`; time every reveal
   with `cue()` (see 03-graphics). Reuse a kit: `marketing-premium/kit` (premium look) or `marketing-story/kit.tsx`
   (HUD/story look).
5. **Register** — a `<Group>Compositions.tsx` (copy `Premium3Compositions.tsx` or
   `marketing-story/StoryCompositions.tsx`), add it to `src/Root.tsx`, and add the film to `FILMS` in
   `scripts/render-premium.mjs`.
6. **Sound** — add a `SCORES` entry in `premium-score.py` (chords, motif, keywords; unknown films fall back to
   the first-piece score), or write a bespoke script from `story-sound.py` / `makers-sound.py` and add the film
   to `OWN_SOUNDTRACK` in `premium-score.py` so the generic scorer leaves it alone.
7. **Review** — stills and grids (04-review), then render, then captions.

## Tools

| Command | Does |
| --- | --- |
| `node scripts/premium-stills.mjs <compositionId> <s> <s> … [--scale=0.5] [--out=dir]` | review stills from one bundle |
| `scripts/review-grid.sh <video> <start> <end> <every> <cols> <rows> <cellpx> <out.jpg>` | time-labelled motion grid of a rendered passage |
| `node scripts/render-premium.mjs [film …] [--group=…]` | render + master; writes `render-report*.json` with loudness |
| `python3 scripts/premium-srt.py --group <group>` | upload captions |
| `node scripts/build-sfx.mjs` | bakes typing / calendar-flip tracks from the CC0 samples in `public/sfx` |
| `npx tsc --noEmit && npx eslint src` | type-check and lint |

Legacy (v1/v2 edits, 30 fps): `scripts/marketing-sound.py`, `render-marketing.mjs`,
`marketing-deliverables.py`, `package-marketing.py`, `review-marketing.py`, `review-reference.mjs`.

## Folder conventions

- `public/marketing/<group>/` — that group's schedule, audio (voice + score) and product cut-outs.
- `src/marketing-<group>/` — that group's compositions; `kit/` or `*-kit.tsx` for pieces shared within it;
  one file per film in `videos/`, with large set pieces split into `<Film>-<piece>.tsx`.
- `out/` — renders, stills, reviews, audio previews (gitignored; rebuildable).

## Troubleshooting

- **Captions show "$4 ,000" or recognised punctuation instead of the script's** — give the scene a `display`
  with one token per recognised word, then re-run the schedule.
- **A bespoke score was overwritten** — the film is missing from `OWN_SOUNDTRACK` in `premium-score.py`.
- **Render reports loudness off target** — `render-premium.mjs` masters every film to −14 LUFS / −1 dBTP after
  rendering; check `out/marketing/<group>/render-report*.json`.
- **Waiting on a background render in a shell loop** — `pgrep -f "<pattern>"` also matches the waiting loop's own
  command line; wait on the render's log line (`DONE …`) instead.
