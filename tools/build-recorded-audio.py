"""Build trimmed Clubline audio from the reviewed Freesound HQ MP3 previews.
Usage: python3 tools/build-recorded-audio.py /path/to/reviewed/raw
The raw folder contains sources.json and files keyed as <source key>.mp3.
No synthesis, pitch shifting or replacement sound generation is performed.
"""
from pathlib import Path
import sys,json,subprocess,hashlib,tempfile
import numpy as np
from scipy.io import wavfile
SR=24000;ROOT=Path(__file__).resolve().parents[1];RAW=Path(sys.argv[1]);OUT=ROOT/'assets/audio/recorded';OUT.mkdir(parents=True,exist_ok=True)
SOURCES={s['key']:s for s in json.loads((RAW/'sources.json').read_text())};decoded={};clips=[]
def read(key):
 if key not in decoded:
  data=subprocess.check_output(['ffmpeg','-v','error','-i',str(RAW/(key+'.mp3')),'-f','f32le','-ac','2','-ar',str(SR),'-'],stderr=subprocess.DEVNULL)
  decoded[key]=np.frombuffer(data,dtype='<f4').reshape(-1,2).copy()
 return decoded[key]
def crop(key,seconds,start=0,select=None):
 x=read(key);n=min(len(x),int(seconds*SR));offset=min(int(start*SR),len(x)-n)
 if select:
  # Select a quiet, stable crowd interval or a clear isolated mechanism/impact.
  windows=[]
  for i in range(0,len(x)-n+1,SR//2):
   y=x[i:i+n];rms=float(np.sqrt(np.mean(y*y)))
   if select=='stable':
    bins=np.array([np.sqrt(np.mean(v*v)) for v in np.array_split(y,max(2,int(seconds)))])
    score=float(np.std(bins)/(np.mean(bins)+1e-8)+np.max(bins)/(np.mean(bins)+1e-8)*.12)
   else:score=-rms
   windows.append((score,i))
  if windows:offset=min(windows)[1]
 return x[offset:offset+n].copy(),round(offset/SR,3)
def write(name,key,seconds,start=0,select=None,loop=False,repeats=1):
 x,offset=crop(key,seconds,start,select)
 if loop:
  n=min(int(.4*SR),len(x)//4);t=np.linspace(0,np.pi/2,n)[:,None]
  x=np.concatenate([x[n:-n],x[-n:]*np.cos(t)+x[:n]*np.sin(t)])
 else:
  n=min(int(.035*SR),len(x)//4);r=np.linspace(0,1,n)[:,None];x[:n]*=r;x[-n:]*=r[::-1]
 if repeats>1:x=np.concatenate([part for i in range(repeats) for part in ([x] if i==repeats-1 else [x,np.zeros((int(.18*SR),2))])])
 rms=float(np.sqrt(np.mean(x*x)));peak=float(np.max(np.abs(x)));x*=min((.10 if loop else .12)/max(rms,1e-8),(.50 if loop else .72)/max(peak,1e-8))
 with tempfile.TemporaryDirectory() as tmp:
  wav=Path(tmp)/'clip.wav';wavfile.write(wav,SR,(x*32767).astype(np.int16));target=OUT/(name+'.mp3')
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','libmp3lame','-b:a','112k',str(target)],check=True)
 clips.append({'file':name+'.mp3','sourceKey':key,'sourceOffsetSeconds':offset,'excerptSeconds':seconds,'duration':round(len(x)/SR,3),'modifications':'Excerpt, resampled to 24 kHz stereo, level adjusted, short fades'+('; crossfaded loop seam' if loop else '')+(f'; whistle repeated {repeats} times with gaps' if repeats>1 else ''),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
write('stadium-bed','stadium',16,select='stable',loop=True)
write('goal-home-1','cheer-big',5)
write('goal-home-2','cheer',5)
write('chant-1','chant',5.5)
write('chant-2','chant',5.5,start=8)
write('turnstile-1','turnstile',3,select='loud')
write('turnstile-2','turnstile',3,start=45)
write('applause-1','applause',3.5,start=3)
write('applause-2','applause-alt',3.5,start=1)
write('training-1','training',5,start=8)
write('training-2','training',5,start=30)
write('practice-1','practice',5,start=5)
write('touches','touches',4,start=1)
write('kick','kick',.778)
write('whistle-single','whistle',1.113)
write('whistle-half','whistle',1.113,repeats=2)
write('whistle-full','whistle',1.113,repeats=3)
write('workout','workout',4,select='loud')
write('weights','weights',4,select='loud')
write('gym','gym',5,select='stable')
write('shower-1','shower-door',6,start=25)
write('shower-2','shower-door',6,start=75)
write('birds-1','birds',4.5)
write('birds-2','birds',4.5,start=6)
write('wind','wind',6,start=5)
write('steps','steps',4)
write('office-1','office',4,start=5)
write('office-2','office',4,start=25)
write('phone','phone',2.5,select='loud')
write('paper-1','paper',3,select='loud')
write('paper-2','paper',3,start=5)
used={c['sourceKey'] for c in clips};sources=[SOURCES[k] for k in sorted(used)]
manifest={'revision':'1.123.0','notes':'Derived from the public HQ previews of user-approved recordings; originals require Freesound login. Source licences and credits apply to these excerpts. Rejected procedural audio is excluded.','sources':sources,'clips':clips}
(OUT/'sources.json').write_text(json.dumps(manifest,indent=2)+'\n')
catalogue={'bed':'stadium-bed','quiet':['birds-1','birds-2','wind','steps'],'training':['training-1','training-2','practice-1','touches','kick','whistle-single'],'gym':['workout','weights','gym'],'changing':['shower-1','shower-2'],'office':['office-1','office-2','paper-1','paper-2','phone'],'prematch':['turnstile-1','turnstile-2'],'match':['chant-1','chant-2'],'interval':[],'cues':{'kickoff':['whistle-single'],'restart':['whistle-single'],'half':['whistle-half'],'full':['whistle-full'],'goal':['goal-home-1','goal-home-2'],'save':['applause-1','applause-2']}}
(ROOT/'audio-catalogue.js').write_text('// Reviewed recorded sources; see AUDIO-CREDITS.md for attribution and edits.\nexport const AMBIENCE_CATALOGUE='+json.dumps(catalogue,separators=(',',':'))+';\nexport const SOUND_CREDITS='+json.dumps(sources,separators=(',',':'))+';\n')
credits=['# Recorded sound credits - CLUBLINE 99 v1.123.0','','These excerpts use public Freesound HQ MP3 previews of recordings approved for integration in the conversation. Credits below identify original creators, source pages and licences. Excerpts were trimmed, resampled, level adjusted and faded. The crowd bed has a crossfaded seam; half/full-time whistles repeat the recorded whistle with gaps. No FIFA audio or rejected synthesized sounds are included.','']
for s in sources:credits.extend([f"## {s['title']} - {s['author']}",f"Source: {s['source']}",f"Licence: {s['licence']} - {s['licenceUrl']}",'Derived files: '+', '.join(c['file'] for c in clips if c['sourceKey']==s['key']),''])
credits.extend(['Source URLs, preview URLs, raw/derived checksums, excerpt offsets and edits are recorded in assets/audio/recorded/sources.json. Raw source previews are not bundled separately.'])
(ROOT/'AUDIO-CREDITS.md').write_text('\n'.join(credits)+'\n')
print('Built',len(clips),'clips from',len(sources),'recorded sources;',sum(p.stat().st_size for p in OUT.iterdir()),'bytes')
