"""Extract the entire final edit at 2 fps plus every transition for visual review."""
import argparse
import json
import math
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out/marketing/review/final'
TIMING = json.loads((ROOT / 'public/marketing/timing.json').read_text())


def sheet(frames, output, columns=4):
    canvas = Image.new('RGB', (270 * columns, 510 * math.ceil(len(frames) / columns)), '#20212b')
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype('/System/Library/Fonts/Monaco.ttf', 16)
    for i, (path, label) in enumerate(frames):
        x, y = (i % columns) * 270, (i // columns) * 510
        canvas.paste(Image.open(path).convert('RGB').resize((270, 480)), (x, y))
        draw.text((x + 9, y + 486), label, fill='#e6d080', font=font)
    canvas.save(output, quality=90)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('ids', nargs='*', default=list(TIMING))
    args = p.parse_args()
    for key in args.ids:
        target = OUT / key
        target.mkdir(parents=True, exist_ok=True)
        video = ROOT / f'out/marketing/{key}.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(video), '-vf', 'select=not(mod(n\\,15)),scale=270:480', '-fps_mode', 'vfr', '-q:v', '2', str(target / 'frame-%03d.jpg')], check=True)
        frames = [(f, f'{i / 2:05.2f}s') for i, f in enumerate(sorted(target.glob('frame-*.jpg')))]
        pages = []
        for start in range(0, len(frames), 20):
            dest = target / f'full-{start // 20 + 1}.jpg'
            sheet(frames[start:start + 20], dest)
            pages.append(str(dest))
        cuts = []
        for i, scene in enumerate(TIMING[key]['scenes'][1:]):
            for j, delta in enumerate([-.05, .10, .25]):
                at = scene['start'] + delta
                dest = target / f'cut-{i}-{j}.jpg'
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(at), '-i', str(video), '-frames:v', '1', '-vf', 'scale=270:480', '-q:v', '2', str(dest)], check=True)
                cuts.append((dest, f'{at:05.2f}s {scene["id"]}'))
        cut_sheet = target / 'transitions.jpg'
        sheet(cuts, cut_sheet, columns=3)
        result = {'video': str(video), 'intervalSeconds': .5, 'frameCount': len(frames), 'pages': pages, 'transitions': str(cut_sheet)}
        (target / 'manifest.json').write_text(json.dumps(result, indent=2))
        print(json.dumps(result), flush=True)


if __name__ == '__main__':
    main()
