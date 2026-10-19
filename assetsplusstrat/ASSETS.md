# Asset catalog

Everything the films use, where it lives and where it came from. Paths are relative to `assetsplusstrat/`.
Rendered `.mp4` files are not stored; every film rebuilds from these assets (docs/02-setup-and-pipeline.md).

## Brand

| Path | What | Used by |
| --- | --- | --- |
| `public/brand/logo-bullion.webp` | Bullion Trading wordmark with bar icon (294 × 84) | masthead, watermark, end cards — every film |

## Product imagery

| Path | What | Used by |
| --- | --- | --- |
| `public/marketing/images/` (6) | website product photos: PAMP gold/silver, Rosa, Silver Eagle, silver round, satin backdrop | v1/v2 edits; provenance in `public/marketing/asset-sources.json` |
| `public/marketing/premium/*.png` | studio cut-outs: Clover bars, Justice bar, Valcambi 5 g + platinum, Liberty silver bar, Fortuna/Justice/Perth/Valcambi assay cards, Gold & Silver Eagle, Maple (gold/platinum), Krugerrand, Britannia, Kangaroo, Buffalo round, casting grain (gold / platinum / sterling piles, scoop, textures), film-grain overlay | premium films; provenance in `public/marketing/premium/asset-sources.json` |
| `public/marketing/premium-2/*.png` | Lakshmi cards/cert, Lunar Horse card + coins, Centenario, Hidalgo, Panda, Sovereign, Valcambi CombiBar | Traditions, Real or fake?, Spot to store, Tax by state |
| `public/marketing/premium-2/tax-states.json` | state-by-state tax summary used on the map | Tax by state (needs current validation before reuse) |
| `public/marketing/premium-3/*.png` | PAMP 1 oz bar, Fortuna 1 g – 20 g cards, Gold Eagle (Liberty side) | FAQ films |
| `src/marketing-premium-2/data/us-states.json`, `src/marketing-premium/makers/usa.json` | U.S. map geometry | Tax by state, The Maker's Edge |

Product photographs come from Bullion Trading LLC's own product galleries; coin and bar designs belong to their
mints and refiners. Backgrounds were removed for compositing; pixels are otherwise unaltered. Do **not** use real
refiner products in counterfeit or "fake" contexts — the story film draws a generic bar in code (`GoldBar`).

## Narration and music

| Path | What |
| --- | --- |
| `public/marketing/audio/<film>/<scene>.wav` | narration, one clip per scene (16 films) |
| `public/marketing/audio/<film>.wav` + `.srt` | the clips assembled end to end, with a raw caption file |
| `public/marketing/audio/*-soundscape.wav` | v2 underscores (legacy edits) |
| `public/marketing/timing.json` | word timestamps for every clip (the clock all visuals follow) |
| `public/marketing/<group>/audio/<film>-voice.wav` | narration re-timed for the final cut (−16 LUFS) |
| `public/marketing/<group>/audio/<film>-score.wav` | original synthesized score + sound design, same length as the film |
| `public/marketing/<group>/schedule.json` | scene cuts, audio placement and timed caption words per film |
| `public/marketing/campaign.json` | every film's script, written caption forms, pacing, headlines and closing line |

Scores and effects are synthesized from oscillators and noise by `scripts/*-score.py` / `*-sound.py` — no
licensed music.

## Sound effects

`public/sfx/` — short CC0 samples (Kenney): clicks, ticks, glitches, confirmation, ding, force field, heavy metal
impact, low-frequency explosion, maximize, select; plus `typing-asmr`/`calendar-flips` tracks baked from them by
`scripts/build-sfx.mjs`.

## Strategy assets

| Path | What |
| --- | --- |
| `strategy/campaign-study/campaigns/campaign1-5/` | five Google + Meta purchase concepts: approach, ad copy, keywords + negatives, tracked destinations, image prompt, generated `creative.png` (1254²) with QA notes |
| `strategy/campaign-study/campaigns/review.html` | browsable review of the five concepts (open in a browser) |
| `strategy/campaign-study/bullion_knowledge/` | business brief, claim review, research scope, 1,427 public-page snapshots of bulliontradingllc.com, URL/source indexes, product catalog CSV, sitemaps, searchable SQLite corpus, 15 film transcripts, product reference images |
| `strategy/references/story-reel/` | reading of the reference reel cloned for *What's inside?* (analysis, timed reading, transcript, frame grids) — the source video itself is not stored |
| `strategy/productions/whats-inside/` | brief (goal, verified facts, sources), treatment (the film beat by beat), progress |
| `strategy/captions/<group>/*.srt` | upload-ready captions for every film (and the v2 edits) |
| `strategy/sound-reports/<group>/*-report.json` | score reports: event list with times, loudness, ducking |
| `docs/img/` | review examples used in the guides |

Campaign creatives are generated illustrations: counters, hands, packaging and staff in them are not
photographs of the real premises or inventory. Website snapshots are first-party statements with historic
prices — never reuse their prices as current offers.
