"""Package finished, audited MP4s with their transcripts and review notes."""
import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out/marketing'
IDS = ['first-piece', 'new-york', 'meaningful-gift']
audit = json.loads((OUT / 'final-media-audit.json').read_text())
manifest = {'version': 'v2-motion', 'renderer': 'Remotion 4.0.534', 'videos': []}
files = []
for key in IDS:
    path = OUT / f'{key}.mp4'
    result = audit['videos'][key]
    if result['status'] != 'pass' or result['bytes'] != path.stat().st_size:
        raise RuntimeError(f'{key}: missing current passing final-media audit')
    review = json.loads((OUT / f'review/final/{key}/manifest.json').read_text())
    manifest['videos'].append({
        'id': key,
        'file': path.name,
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'bytes': path.stat().st_size,
        'duration': result['videoDuration'],
        'dimensions': result['dimensions'],
        'fps': result['fps'],
        'visualReviewSamples': review['frameCount'],
        'transitionReviewSamples': 12,
        'visualReviewIntervalSeconds': .5,
        'audioAudit': result['status'],
    })
    files.extend([(path, path.name), (ROOT / f'public/marketing/audio/{key}.srt', f'subtitles/{key}.srt')])
manifest_path = OUT / 'delivery-manifest.json'
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
for name in ['scripts-and-timing.txt', 'research.txt', 'sound-design.json', 'final-media-audit.json', 'visual-review.txt', 'delivery-manifest.json']:
    files.append((OUT / name, f'notes/{name}'))
files.extend([(ROOT / 'public/marketing/asset-sources.json', 'notes/asset-sources.json'), (ROOT / 'public/marketing/timing.json', 'notes/timing.json')])
destination = OUT / 'bullion-marketing-videos.zip'
temporary = destination.with_suffix('.tmp.zip')
with zipfile.ZipFile(temporary, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=4) as archive:
    for path, name in files:
        archive.write(path, name)
with zipfile.ZipFile(temporary) as archive:
    bad = archive.testzip()
    if bad:
        raise RuntimeError(f'Invalid archive member: {bad}')
temporary.replace(destination)
print(destination)
print(json.dumps(manifest, indent=2))
