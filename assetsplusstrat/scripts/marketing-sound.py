"""Build original, low-level underscore and frame-aligned SFX beneath the narration.
No downloaded music. Source effects are generated deterministically from oscillators/noise.
"""
import json
import re
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

ROOT=Path(__file__).resolve().parents[1]
RATE=48000
rng=np.random.default_rng(4817)

def note(freq, duration, gain=1):
    t=np.arange(round(duration*RATE))/RATE
    attack=np.minimum(t/.012,1)
    env=attack*np.exp(-t*3.5)
    return gain*env*(np.sin(2*np.pi*freq*t)+.19*np.sin(2*np.pi*2.006*freq*t)+.07*np.sin(2*np.pi*3.97*freq*t))

def whoosh(duration=.65):
    t=np.arange(round(duration*RATE))/RATE
    n=rng.normal(0,1,len(t))
    filtered=sosfilt(butter(2,[380,3300],btype='bandpass',fs=RATE,output='sos'),n)
    env=np.sin(np.pi*t/duration)**2
    return .09*filtered*env

def hit(duration=.6):
    t=np.arange(round(duration*RATE))/RATE
    freq=100+65*np.exp(-t*28)
    phase=2*np.pi*np.cumsum(freq)/RATE
    return .07*np.sin(phase)*np.exp(-t*10)*np.minimum(t/.006,1)

def place(track,sample,sec,gain=1,pan=0):
    offset=round(sec*RATE)
    if offset<0: sample=sample[-offset:];offset=0
    stop=min(len(track),offset+len(sample))
    if stop<=offset:return
    a=sample[:stop-offset]*gain
    track[offset:stop,0]+=a*np.sqrt((1-pan)/2)
    track[offset:stop,1]+=a*np.sqrt((1+pan)/2)

all_timings=json.loads((ROOT/'public/marketing/timing.json').read_text())
report={}
for ix,(vid,data) in enumerate(all_timings.items()):
    duration=data['duration']
    track=np.zeros((int(np.ceil(duration*RATE)),2),dtype=np.float64)
    # Quiet warm air behind the voice; intervals avoid a busy beat.
    progressions=[[146.83,174.61,220,329.63],[116.54,146.83,174.61,261.63],[130.81,174.61,220,261.63]]
    chord=progressions[ix%3]
    t=np.arange(len(track))/RATE
    fade=np.minimum(t/1.2,1)*np.minimum((duration-t)/1.0,1)
    for j,freq in enumerate(chord):
        wave=.0032*(np.sin(2*np.pi*freq*t)+.18*np.sin(2*np.pi*2*freq*t))
        wave*=fade*(.78+.22*np.sin(2*np.pi*.08*t+j))
        track[:,j%2]+=wave
        track[:,1-j%2]+=.65*wave
    # Very sparse bell motif; all music/effects original, not sampled.
    for i,sec in enumerate(np.arange(.25,duration-2,2.8)):
        place(track,note(chord[(i+ix)%4]*2,1.6,.010),sec,pan=(-.25 if i%2==0 else .25))
    for i,scene in enumerate(data['scenes']):
        at=scene['start']
        place(track,whoosh(.48),max(0,at-.14),gain=.65)
        place(track,hit(),at+.02,gain=.7)
        if i==len(data['scenes'])-1:
            place(track,note(880,1.4,.020),at+.10)
            place(track,note(1318.51,1.5,.010),at+.20,pan=.18)
        elif i>0:
            place(track,note(chord[i%4]*4,.6,.009),at+.13,pan=.16)
    events=[]
    keywords={
      'first-piece': {'gold','silver','bars','coins','rounds','weights','details','collection','spot','pricing','team','next'},
      'new-york': {'heart','diamond','metals','2008','online','visit','47th','products','place','team'},
      'meaningful-gift': {'moments','gift','silver','golden','tradition','bars','coins','rounds','hold','admire','remember','shine'}
    }[vid]
    last=-1
    for scene in data['scenes']:
        if scene['id']=='cta':continue
        for word in scene['words']:
            key=re.sub(r'[^a-z0-9]','',word['word'].lower())
            at=word['start']
            if key in keywords and at-last>.35:
                place(track,note(chord[len(events)%4]*3,.24,.016),at,pan=(-.3 if len(events)%2 else .3))
                if key in {'details','online','tradition','shine'}:
                    place(track,whoosh(.38),at-.10,gain=.25)
                events.append({'word':word['word'],'at':at,'effect':'soft tonal tick / diagram accent'})
                last=at
    # Gain follows the measured speech envelope so sound design stays below narration.
    voice,sr=sf.read(ROOT/'public'/data['audio'])
    if voice.ndim>1:voice=voice.mean(axis=1)
    voice=resample_poly(voice,RATE,sr)
    voice=np.pad(voice,(0,max(0,len(track)-len(voice))))[:len(track)]
    window=2400
    envelope=np.sqrt(np.convolve(np.pad(voice**2,(window//2,window//2)),np.ones(window)/window,mode='valid')[:len(track)])
    track*=np.where(envelope>.018,.58,1)[:,None]
    out=ROOT/f'public/marketing/audio/{vid}-soundscape.wav'
    sf.write(out,track,RATE,subtype='PCM_16')
    report[vid]={'path':str(out.relative_to(ROOT/'public')),'duration':len(track)/RATE,'peak':float(np.max(abs(track))),'events':events,'method':'Original oscillator underscore, filtered-noise whooshes, soft impacts and chimes. Ducking follows the actual speech envelope.'}
(ROOT/'out/marketing/sound-design.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
