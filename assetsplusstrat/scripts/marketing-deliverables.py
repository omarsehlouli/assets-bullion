"""Export the unchanged scripts and an inspectable cue sheet for the v2 edit."""
import json
import math
import re
from pathlib import Path

R = Path(__file__).resolve().parents[1]
c = json.loads((R / 'public/marketing/campaign.json').read_text())
t = json.loads((R / 'public/marketing/timing.json').read_text())
sound = json.loads((R / 'out/marketing/sound-design.json').read_text())

# Screen copy and treatments describe the current Remotion components, rather
# than campaign.json's original v1 visual brief. Narration and timing still come
# directly from their source manifests and are never rewritten here.
visuals = {
    'first-piece': {
        'hook': {
            'screen': 'YOUR FIRST / PIECE. | GOLD | SILVER | A CLOSER LOOK',
            'treatment': 'PAMP gold-bar and silver-round photographs spring into a rotating orbital diagram. Gold and silver labels slide in with line-drawn callouts. A camera push, target brackets and a scan line focus on the gold photograph at the closer-look phrase.',
            'cues': ['gold', 'silver', 'closer'],
        },
        'choice': {
            'screen': 'THREE WAYS / TO BEGIN. | PRECIOUS METALS | BARS / COINS / ROUNDS',
            'treatment': 'A precious-metals node branches into three drawn paths. Bar, coin and round product cards fan out from the center and spring into their own columns as each category is spoken. Traveling dots and a gold-to-cyan baseline complete the diagram.',
            'cues': ['gold', 'silver', 'rounds', 'Bullion'],
        },
        'details': {
            'screen': 'COMPARE / THE WEIGHTS. → DISCOVER / THE DETAILS. | 1 oz / 5 g | PAMP FORTUNA / PAMP ROSA | FORM. FINISH. DETAIL. → FIND YOUR PIECE',
            'treatment': 'Two verified PAMP product photographs enter as a weight comparison. The 1 oz and 5 g labels appear on weights. On details, the Rosa photograph enlarges while target brackets, a moving inspection line and a traced callout focus attention on its finish. A checkmark and Find your piece resolve the sequence.',
            'cues': ['weights', 'details', 'fits'],
        },
        'confidence': {
            'screen': 'LIVE. / SPOT-BASED. → A NEW YORK / CONNECTION. | SPOT MARKET → PRODUCT PRICE | NEW YORK TEAM → YOUR ORDER | TAKE THE NEXT STEP',
            'treatment': 'Gold and silver symbols in a spot-market panel connect to a product-price panel through a drawn arrow with moving dots. The diagram transforms into an illustrated New York team connected to an order icon. A cursor approaches the Take the next step panel; its outline and fill respond to the narration. No numerical price or market-performance chart appears.',
            'cues': ['live', 'spot', 'pricing', 'New', 'team', 'order', 'next'],
        },
    },
    'new-york': {
        'hook': {
            'screen': 'NEW YORK. | THE DIAMOND DISTRICT | WEST 47TH STREET | BULLION TRADING | REAL METAL. / Hands-on experience.',
            'treatment': 'A schematic Midtown street grid builds block by block, rotates and pushes toward West 47th Street. A cyan route and gold street line draw toward a springing location pin with expanding rings. A light panel containing actual gold-bar and silver-round photographs rises over the lower map on precious metals.',
            'cues': ['Diamond', 'precious', 'hands'],
        },
        'heritage': {
            'screen': 'NEW YORK ROOTS. | ESTABLISHED / 2008 | BUYERS ↔ SELLERS | EST. 2008 → TODAY',
            'treatment': 'Four split-flap-style cards emphasize the verified founding year 2008 when it is spoken; no other founding years are displayed. Buyers and sellers spring into a two-way curved loop around a bullion icon. A history line traces from EST. 2008 to TODAY.',
            'cues': ['buyers', 'sellers', '2008'],
        },
        'visit': {
            'screen': 'ONLINE. → IN PERSON. | ONE NEW YORK CONNECTION | GOLD / SILVER | 20 WEST 47TH ST. / LOWER LEVEL #24 / NEW YORK CITY',
            'treatment': 'An illustrated bulliontradingllc.com browser displays real gold and silver product photographs. A cursor moves between the cards, with a selection ring on online. On visit, the browser shrinks upward and connects to an address panel with a drawn store icon. The 47th Street text receives a brief scale emphasis.',
            'cues': ['gold', 'silver', 'online', 'visit', '47th'],
        },
        'people': {
            'screen': 'A REAL / CONNECTION. | REAL PRODUCTS / A REAL PLACE / A REAL TEAM',
            'treatment': 'Three circular nodes form a triangular network: an actual gold product photograph, an abstract store icon and an abstract team icon. The nodes spring in and their colored connecting lines draw as products, place and team are spoken. Pulse rings and a speech-bubble motif animate the connection.',
            'cues': ['products', 'place', 'team', 'talk'],
        },
    },
    'meaningful-gift': {
        'hook': {
            'screen': 'For moments / that matter. | A gift with meaning.',
            'treatment': 'A vector gift box and ribbon draw in perspective. On more, the lid lifts, tilts and moves away as a real PAMP Rosa photograph rises from the box. Spark particles expand around the revealed product; the headline enters as moving type.',
            'cues': ['more'],
        },
        'milestones': {
            'screen': 'Every milestone. / Your story. | Silver anniversary / Golden milestone / A tradition of your own',
            'treatment': 'Silver and gold product photographs arrive inside circular stages on their spoken phrases. Curved paths draw an orbit between the two products and a heart node for tradition. Pulsing rings, a rotating dashed orbit and small product movement continue between the narration beats.',
            'cues': ['silver', 'golden', 'tradition'],
        },
        'selection': {
            'screen': 'Find their / kind of shine. | Gold / Silver | Beautiful in every detail | Bars / Coins / Rounds',
            'treatment': 'A three-product carousel starts as a spread, then focuses on a bar photograph. A detail push enlarges the product during beautifully detailed. The carousel slides the coin and then the round into the center on their spoken names; the corresponding category tabs change highlight. Orbital lines and small perspective rotations support the movement.',
            'cues': ['gold', 'silver', 'pieces', 'beautifully', 'bars', 'coins', 'rounds'],
        },
        'keepsake': {
            'screen': 'Something / to remember. → Make the / moment shine. | Hold / Admire / Remember | A moment to come back to.',
            'treatment': 'A silver-round photograph anchors a three-node Hold → Admire → Remember loop. Nodes light in sequence, curved arrows draw between them, and a moving scan line inspects the product on admire. The title changes to Make the moment shine before an expanding ring and sparks accent shine.',
            'cues': ['hold', 'admire', 'remember', 'Make', 'shine'],
        },
    },
}

cta = {
    'screen': 'BUY FROM / BULLION / TRADING. | GOLD + SILVER → YOUR NEXT PIECE | bulliontradingllc.com',
    'treatment': 'Oversized brand words spring in from alternating sides over rotating, gently pulsing rings. A gold divider draws, the website types into an outlined panel, and its arrow moves subtly. The URL remains on screen through the closing hold.',
    'cues': [],
}


def clean(word):
    return re.sub(r'[^a-z0-9]', '', word.lower())


def cue_labels(scene_timing, words):
    """Return absolute ASR anchors, before any intentional animation lead-in."""
    result = []
    for target in words:
        match = next((word for word in scene_timing['words']
                      if clean(word['word']) == clean(target)), None)
        if match is None:
            raise ValueError(f"Missing ASR cue {target!r} in {scene_timing['id']}")
        result.append(f"{match['start']:.3f}s {target}")
    return ' | '.join(result)


lines = [
    'BULLION TRADING LLC — THREE VERTICAL BRAND FILMS / V2 MOTION EDIT',
    '',
    'Format: Remotion / 1080 x 1920 vertical / 30 fps / H.264 MP4 with AAC audio.',
    'Narration: existing narration audio; scripts, narration audio and source timing unchanged.',
    'Edit timing: measured WAV scene boundaries and faster-whisper small.en ASR word timestamps. Captions highlight the actual spoken word; diagram and typography cues use the same word anchors.',
    'Cue times below are absolute ASR word starts. Some entrances intentionally lead their anchor by a few frames so the visual lands with the spoken word.',
    'Sound design: original oscillator underscore, filtered-noise whooshes, soft impacts and CTA chime, now with narration-triggered tonal ticks for diagram accents. Ducking follows the speech envelope.',
    'Shared design: dark moving grid and particles, large kinetic type, real product photographs on light stages, line-drawn vector diagrams, scene wipes, brand header, narration captions and five-part progress indicator.',
    '',
]

for video in c['videos']:
    timeline = t[video['id']]
    frames = math.ceil(timeline['duration'] * c['fps'])
    lines.extend([
        video['title'].upper(),
        f"Audience: {video['audience']}",
        f"Rendered duration: {frames / c['fps']:.2f} seconds ({frames} frames)",
        f"Source audio timeline including closing hold: {timeline['duration']:.3f} seconds",
        f"File: {video['id']}.mp4",
        '',
        'SCRIPT',
        ' '.join(scene['text'] for scene in video['scenes']),
        '',
        'AUDIO / PICTURE CUE SHEET',
    ])
    timed_scenes = {scene['id']: scene for scene in timeline['scenes']}
    for scene in video['scenes']:
        timed = timed_scenes[scene['id']]
        visual = cta if scene['id'] == 'cta' else visuals[video['id']][scene['id']]
        screen = visual['screen']
        if scene['id'] == 'cta':
            screen += (' | 20 West 47th Street · Lower Level #24'
                       if video['id'] == 'new-york'
                       else ' | Explore the collection online.')
        lines.extend([
            f"{timed['start']:06.3f}–{timed['end']:06.3f} | {scene['id']}",
            f"  Spoken: {scene['text']}",
            f"  Screen: {screen}",
            f"  Treatment: {visual['treatment']}",
        ])
        if visual['cues']:
            lines.append(f"  Motion word anchors: {cue_labels(timed, visual['cues'])}")
        events = [event for event in sound[video['id']]['events']
                  if timed['start'] <= event['at'] < timed['end']]
        if events:
            accents = ' | '.join(f"{event['at']:.3f}s {event['word']}" for event in events)
            lines.append(f"  Tonal-tick accents: {accents}")
    lines.extend(['', ''])

lines.extend([
    'PROJECT FILES',
    'src/marketing/MarketingVideo.tsx — scene timing, transitions and word-highlighted captions',
    'src/marketing/DiscoveryMotion.tsx — Your first piece motion scenes',
    'src/marketing/NewYorkMotion.tsx — New York connection motion scenes',
    'src/marketing/GiftMotion.tsx — Gift with meaning motion scenes',
    'src/marketing/MotionChrome.tsx — moving background, brand framing and shared CTA',
    'public/marketing/campaign.json — narration scripts and original scene intent; v2 on-screen copy is documented above and in the motion components',
    'public/marketing/timing.json — measured scene boundaries and ASR word timestamps',
    'public/marketing/audio/*.srt — subtitle files',
    'public/marketing/asset-sources.json — product photography source URLs and hashes',
    'out/marketing/research.txt — site findings and verified claims',
    'out/marketing/audio-check/inspection.json — independent ASR audit',
    'out/marketing/sound-design.json — original soundscape notes and timestamped tonal-tick events',
    '',
    'REBUILD CURRENT EDIT',
    '1. python scripts/marketing-sound.py',
    '2. node scripts/render-marketing.mjs stills',
    '3. node scripts/render-marketing.mjs videos',
    '4. python3 scripts/marketing-deliverables.py',
    'Existing narration WAVs and timing.json are retained for this v2 edit; regenerating narration requires a fresh timing/ASR audit.',
    '',
    'Asset treatment: v2 uses actual Bullion Trading LLC website product photographs plus vector diagrams and animated type. The AI-generated satin backdrop from v1 is not used in these videos; its retained image-generation.json is historical provenance only.',
    'The New York map is labeled as a schematic; store and team graphics are abstract icons, not representations of a photographed storefront or staff.',
    'The ads do not promise investment returns or use time-sensitive prices.',
])

output = R / 'out/marketing/scripts-and-timing.txt'
output.write_text('\n'.join(lines) + '\n')
print(output)
