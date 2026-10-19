# assetsplusstrat — Bullion Trading LLC video assets + strategy

Everything reusable from the Bullion Trading LLC marketing-video work in one folder: the strategy behind the
films, the production pipeline, the graphic systems, every asset the films use, and the skills used to make them.
It is also a **working Remotion studio**: install and every film opens, edits and renders from here.

Rendered `.mp4` files are deliberately not included — rebuild any film from this folder.

## Start here

| Read | For |
| --- | --- |
| [docs/01-marketing-strategy.md](docs/01-marketing-strategy.md) | What we make and why: formats, story structures, hooks, CTAs, approved claims, the film catalog, paid-social concepts |
| [docs/02-setup-and-pipeline.md](docs/02-setup-and-pipeline.md) | Install, run Studio, the build pipeline (narration → schedule → score → render → captions), adding a new film |
| [docs/03-graphics-system.md](docs/03-graphics-system.md) | The three visual systems, layout safe zones, typography, colour meaning, motion and sound rules, component catalog |
| [docs/04-review-and-improvement.md](docs/04-review-and-improvement.md) | How a cut is reviewed, the publish checklist, lessons learned, improvement backlog |
| [ASSETS.md](ASSETS.md) | Catalog of every asset, where it is used, and its provenance |

## Folder map

```text
assetsplusstrat/
├── docs/                    strategy, setup, graphics and review guides (+ img/ examples)
├── ASSETS.md                asset catalog and provenance
├── public/                  ALL film assets: brand logo, product photos/cut-outs, narration, scores, SFX,
│                            schedules, scripts (campaign.json) and word timings (timing.json)
├── src/                     Remotion compositions and design kits (the graphics, as code)
├── scripts/                 pipeline: schedule, score/sound design, render + master, captions, review tools
├── strategy/
│   ├── campaign-study/      five Google/Meta purchase campaigns + Bullion Trading knowledge base
│   ├── references/          how a reference video is read before it is cloned (story-reel)
│   ├── productions/         brief / treatment / progress of the cloned film "What's inside?"
│   ├── captions/            upload-ready .srt for every film
│   └── sound-reports/       per-film score reports (events, loudness)
├── skills/                  Claude skills used for this work (clone-video, gold-silver-transcript)
└── package.json …           Remotion 4.0.534 studio config
```

## Quick start

```bash
cd assetsplusstrat
npm ci
npm run dev                                   # Remotion Studio: every film, grouped in folders
node scripts/render-premium.mjs whats-inside  # render + master one film to out/marketing/story/
```

Details, Python environments and the full pipeline are in [docs/02-setup-and-pipeline.md](docs/02-setup-and-pipeline.md).

## The films (16 + legacy)

| Studio folder | Films |
| --- | --- |
| Bullion-Marketing (group `premium`) | Your first piece · A real New York connection · A gift with meaning · Icons of gold · The Maker's Edge (B2B) |
| premium-2 | Traditions in gold & silver · Sell to us · Real or fake? · From spot to store · Bullion tax, state by state |
| premium-3 (FAQ) | How do I know the gold is real? · Selling gold in person · 1 oz bar or Gold Eagle? · How much over spot? · Same-day pickup in Manhattan? |
| story | What's inside? — a counterfeit-gold thriller cloned from a reference reel's story structure |
| legacy | v2 cuts of three premium films (30 fps) · BullionBrief (market brief, vertical) · MetalsBrief (16:9 market brief) |

All vertical films are 1080×1920 at 60 fps, mastered to −14 LUFS / −1 dBTP.
