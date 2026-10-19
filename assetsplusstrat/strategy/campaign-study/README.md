# Campaign study — five purchase concepts for Google and Meta

Three national and two New York concepts built from the website, the learning center and the stories already
told in the films. Start with [`campaigns/review.html`](campaigns/review.html) (open in a browser).

| Folder | Contents |
| --- | --- |
| `campaigns/campaign1` … `campaign5` | `approach.txt`, `description.txt`, `ad-copy.json` (Google headlines/descriptions with lengths, Meta copy), `keywords.csv`, `negative-keywords.csv`, `final-destinations.csv` (UTM-tracked URLs), `image-prompt.txt`, `creative.png`, `image-qa.txt`, `campaign.json` |
| `campaigns/campaigns.json` | all five concepts in one file, including audiences, targeting notes and cautions |
| `campaigns/campaign-comparison.csv`, `validation.json` | one-line comparison; file, copy-length, destination and image checks |
| `bullion_knowledge/` | `BUSINESS_BRIEF.txt` and `CLAIM_REVIEW.txt` (read first), `RESEARCH_SCOPE.txt`, page snapshots (`sources/`), indexes, `product_catalog.csv`, sitemaps, `knowledge.sqlite3`, film transcripts, product reference images |
| `scripts/` | `collect_knowledge.py`, `index_knowledge.py`, `search_knowledge.py`, `build_campaigns.py` |

Search the knowledge base:

```bash
python3 scripts/search_knowledge.py "premium" --limit 5
python3 scripts/search_knowledge.py "pickup" --limit 5
```

Snapshots are first-party website statements with historic prices and stock — not current offers. Creatives
are illustrative concepts. No ads have been launched.
