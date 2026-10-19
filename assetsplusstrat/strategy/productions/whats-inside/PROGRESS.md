# Progress — "What's inside?"

**State (2026-10-17, final):** delivered → `out/marketing/story/whats-inside.mp4` (1080×1920, 60 fps, 87.85 s, −14 LUFS); captions
`out/marketing/story/whats-inside.srt`. Polish since cut 1: live hero price from frame 1; the bar tag is one
persistent layer above the scenes (`CarriedTag`) so it survives cuts and clips onto the receipt; NYC street-sign
opening (W 47 St / 5 Av, SEPT 2012) for the case; bar rises out of the parcel; larger hero bar shared by the
tungsten scan and the gold replay; loading skeleton on the listing; who-chain re-spaced; sound hierarchy
(You. > tungsten > rest) and a true hush for the question; soft whooshes on cuts; decaying camera jolt on the
three reveals (TUNGSTEN CORE, You., FILLED WITH TUNGSTEN); gold sheen across the CTA pill.

## Where things live

- Script + pacing: `public/marketing/campaign.json` → video `whats-inside` (group `story`).
  Scenes with digits carry a `display` caption form (supported by `scripts/premium-schedule.py`).
- Narration clips (existing) + word timings: `public/marketing/audio/whats-inside/`, `public/marketing/timing.json`.
- Schedule + voice track + score: `public/marketing/story/` (`schedule.json`, `audio/whats-inside-{voice,score}.wav`).
- Scenes: `src/marketing-story/WhatsInside.tsx` (scene 4 and its card/chip/chat assets: `WhatsInside-who.tsx`); HUD kit (bar, tag, stamps, captions): `src/marketing-story/kit.tsx`;
  Studio folder **story**, composition `Bullion-WhatsInside` (1080×1920, 60 fps, 87.8 s).
- Sound: `scripts/story-sound.py` (report + voice/score preview in `out/marketing/story/audio-preview/`).
- Review stills: `out/marketing/story/stills/`.

## Rebuild

```
python -I scripts/premium-schedule.py --group story
python -I scripts/story-sound.py
node scripts/render-premium.mjs whats-inside
```

## Open points

- Date-sensitive: "above four thousand dollars an ounce" and the $4,165 / $3,965 listing figures (spot on
  2026-10-16/17). Re-check spot before publishing later; change `SPOT` in `WhatsInside.tsx` and `PAID` in `kit.tsx`, and
  the narration line, if gold moves below $4,000.
- Owner sign-off wanted on: referencing the 2012 Diamond District case; "test it in front of you at our New
  York counter, and before anything ships" (from the FAQ films' approved wording).
