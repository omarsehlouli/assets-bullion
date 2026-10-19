# Skills

Claude skills used to make the Bullion Trading films. Install by copying a folder into `~/.claude/skills/`
(all projects) or `<project>/.claude/skills/` (one project).

| Skill | Use it for |
| --- | --- |
| `clone-video/` | "Make one like this": read a reference video (story, pacing, captions, graphics, sound), then adapt it to Bullion Trading. *What's inside?* was made with it — see `strategy/references/` and `strategy/productions/` for its outputs. It is a project-local copy of the Hypit skill (`hypit-ai/hypit`); its own production commands expect the Hypit CLI, while this repo carries out the same method on the Remotion pipeline in `docs/02`. |
| `gold-silver-transcript/` | Daily gold and silver market commentary transcripts for Bullion Trading (live spot prices + macro/news), teleprompter-ready. |
| `gold-silver-transcript-45s/` | Short (≤ 45 s) hook-driven marketing transcripts about the gold and silver market, built on live commodity data. |

Both transcript skills fetch live market data at run time; check prices again on the day a script is published.
