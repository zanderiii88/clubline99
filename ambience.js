import {AMBIENCE_CATALOGUE} from './audio-catalogue.js?v=1.125.0';
export {AMBIENCE_CATALOGUE};
export function ambienceForGame({view,career,match,panelOpen=false,section,sub,trainingFocus,matchExitOpen=false}={}){
 if(view!=='career'||!career)return 'off';
 if(match){
  if(matchExitOpen)return 'paused';
  if(match.phase==='report')return 'changing';
  if(match.phase!=='live')return 'prematch';
  if(match.paused&&match.pauseReason==='half')return 'interval';
  const highlight=match.pauseReason==='skip'&&(match.events||[]).some(e=>e.minute===match.minute&&['goal','chance'].includes(e.type));
  if(match.drawerOpen||match.paused&&!['goal','yellow'].includes(match.pauseReason)&&!highlight)return 'paused';
  return 'match';
 }
 // A fixture date alone never starts a crowd or referee sound.
 if(!panelOpen||section==='settings')return 'quiet';
 if(section==='squad'&&['training','youth','development'].includes(sub))return trainingFocus==='Fitness'?'gym':'training';
 if(['finances','inbox','club','organiser'].includes(section))return 'office';
 return 'quiet';
}
export function createAmbience({catalogue=AMBIENCE_CATALOGUE,makeAudio=()=>new Audio(),random=Math.random,later=setTimeout,cancel=clearTimeout,asset=name=>`assets/audio/recorded/${name}.mp3?v=1.125.0`}={}){
 const bed=makeAudio(),texture=makeAudio(),cue=makeAudio(),floor=makeAudio();bed.loop=true;floor.loop=true;
 for(const player of [bed,texture,cue,floor]){player.preload='none';player.volume=0;}
 let floorTimer=null,floorWanted=false;
 let mode='off',unlocked=false,hidden=false,muted=false,volume=.25,effectsMuted=false,effectsVolume=.65,timer=null,fadeTimer=null,cueTimer=null,last='',playing=false,bedWanted=false,epoch=0,bedFailed=false,lastCue=null,cuePlaying=false,cueEpoch=0;
 const seen=new Set();
 const available=!!catalogue.floor||!!catalogue.bed||Object.values(catalogue).some(v=>Array.isArray(v)&&v.length);
 const ambientAllowed=()=>available&&unlocked&&!hidden&&!muted&&volume>0;
 const cueAllowed=()=>available&&unlocked&&!hidden&&!effectsMuted&&effectsVolume>0;
 const events=()=>Array.isArray(catalogue[mode])?catalogue[mode]:[];
 const clear=()=>{if(timer!==null)cancel(timer);timer=null;};
 function stopTexture(){clear();playing=false;texture.pause();}
 function stopCue(){++cueEpoch;if(cueTimer!==null)cancel(cueTimer);cueTimer=null;cuePlaying=false;cue.pause();if(bedWanted&&ambientAllowed()&&mode==='match')fadeBed(volume*.32,1);}
 function fadeBed(target,seconds){
  if(fadeTimer!==null)cancel(fadeTimer);fadeTimer=null;
  const start=bed.volume;let step=0;const steps=Math.max(1,Math.round(seconds*10));
  const tick=()=>{bed.volume=Math.max(0,Math.min(1,start+(target-start)*++step/steps));if(step<steps)fadeTimer=later(tick,100);else{fadeTimer=null;if(target===0)bed.pause();}};tick();
 }
 function schedule(first=false){
  clear();if(!ambientAllowed()||!events().length)return;
  const min=first?12:mode==='office'?35:25,max=first?28:mode==='office'?90:65;
  timer=later(playTexture,Math.round((min+random()*(max-min))*1000));
 }
 function finished(){if(!playing)return;playing=false;texture.pause();schedule();}
 function playTexture(){
  timer=null;if(!ambientAllowed()||!events().length)return;
  const choices=events().filter(n=>n!==last),pool=choices.length?choices:events();last=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
  const token=epoch;texture.pause();texture.src=asset(last);texture.volume=volume*.20;playing=true;timer=later(finished,14000);
  try{Promise.resolve(texture.play()).then(()=>{if(!playing||!ambientAllowed())texture.pause();},()=>{if(token===epoch)finished();});}catch{finished();}
 }
 function syncFloor(){
  const wanted=ambientAllowed()&&!['off','match','paused'].includes(mode)&&!!catalogue.floor;
  if(floorTimer!==null)cancel(floorTimer);floorTimer=null;
  const start=floor.volume,target=wanted?volume*.22:0,steps=hidden||muted||['off','paused'].includes(mode)?1:20;let step=0;
  if(wanted&&!floorWanted){floorWanted=true;floor.src=asset(catalogue.floor);try{Promise.resolve(floor.play()).catch(()=>{floorWanted=false;});}catch{floorWanted=false;}}
  if(!wanted)floorWanted=false;
  const tick=()=>{floor.volume=start+(target-start)*++step/steps;if(step<steps)floorTimer=later(tick,100);else{floorTimer=null;if(!wanted)floor.pause();}};tick();
 }
 function syncBed(){
  syncFloor();
  const wanted=ambientAllowed()&&mode==='match'&&!!catalogue.bed;
  if(wanted){
   if(!bedWanted&&!bedFailed){bedWanted=true;if(!bed.src)bed.src=asset(catalogue.bed);const token=epoch;
    try{Promise.resolve(bed.play()).then(()=>{if(!bedWanted||!ambientAllowed())bed.pause();},()=>{if(token===epoch){bedFailed=true;bedWanted=false;bed.pause();}});}catch{bedFailed=true;bedWanted=false;}
   }
   if(!bedFailed)fadeBed(volume*(cuePlaying?.16:.32),2);
  }else if(bedWanted){bedWanted=false;fadeBed(0,hidden||muted||mode==='paused'||mode==='off'?.1:4);}
 }
 function stop(){if(floorTimer!==null)cancel(floorTimer);floorTimer=null;floorWanted=false;floor.pause();floor.volume=0;++epoch;stopTexture();stopCue();bedWanted=false;if(fadeTimer!==null)cancel(fadeTimer);fadeTimer=null;bed.pause();bed.volume=0;}
 texture.addEventListener('ended',finished);texture.addEventListener('error',finished);
 const cueEnded=()=>{stopCue();schedule();};cue.addEventListener('ended',cueEnded);cue.addEventListener('error',cueEnded);
 bed.addEventListener('error',()=>{bedFailed=true;bedWanted=false;bed.pause();});
 return {
  setContext(next){if(!['off','quiet','training','gym','changing','office','prematch','match','interval','paused'].includes(next))next='off';if(next===mode)return;mode=next;++epoch;stopTexture();stopCue();syncBed();schedule(true);},
  configure(settings={}){
   const previous=ambientAllowed(),oldVolume=volume,oldHidden=hidden;muted=settings.muted===true;volume=Number.isFinite(settings.volume)?Math.max(0,Math.min(1,settings.volume)):.25;hidden=settings.hidden===true;
   effectsMuted=settings.effectsMuted===true;effectsVolume=Number.isFinite(settings.effectsVolume)?Math.max(0,Math.min(1,settings.effectsVolume)):.65;
   if(hidden){stop();return;}
   if(!ambientAllowed()){syncFloor();stopTexture();if(bedWanted){bedWanted=false;fadeBed(0,.1);}}else{texture.volume=volume*.20;if(!previous||oldVolume!==volume||oldHidden)syncBed();if(!previous)schedule(true);}
   if(!cueAllowed()&&cuePlaying)stopCue();else if(cuePlaying)cue.volume=Math.max(0,Math.min(1,effectsVolume*(lastCue?.gain||0)));
  },
  unlock(){const was=unlocked;unlocked=true;bedFailed=false;if(!was){syncBed();schedule(true);}else if(ambientAllowed()&&(mode==='match'&&!bedWanted||mode!=='off'&&mode!=='match'&&!floorWanted))syncBed();},
  react({type,key,gain=1}={}){
   const allowedModes={kickoff:['match'],restart:['match'],half:['interval'],full:['changing'],goal:['match'],save:['match']};
   const clips=catalogue.cues?.[type];
   if(!allowedModes[type]?.includes(mode)||!clips?.length||!key||seen.has(key))return false;
   seen.add(key);if(seen.size>128)seen.delete(seen.values().next().value);
   if(!cueAllowed())return false;
   stopTexture();stopCue();const token=cueEpoch,name=clips[Math.min(clips.length-1,Math.floor(random()*clips.length))];lastCue={type,key,name,gain};cue.src=asset(name);cue.volume=Math.max(0,Math.min(1,effectsVolume*gain));cuePlaying=true;
   if(bedWanted)fadeBed(volume*.16,.2);
   const failed=()=>{if(token===cueEpoch)cueEnded();};
   cueTimer=later(failed,9000);try{Promise.resolve(cue.play()).then(()=>{if(!cuePlaying||!cueAllowed())cue.pause();},failed);}catch{failed();}return true;
  },
  stop,
  state:()=>({available,mode,muted,volume,unlocked,hidden,eventPlaying:playing,cuePlaying,floorPlaying:floorWanted&&!floor.paused,bedPlaying:bedWanted&&!bed.paused,lastEvent:last,lastCue,scheduled:timer!==null})
 };
}
