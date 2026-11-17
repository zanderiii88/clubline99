import {ambienceForGame} from './ambience.js?v=1.126.0';
// Observe only newly displayed action. Never replay history from a loaded match.
export function createMatchSoundBridge(){
 let previous=null,generation=0;
 return {reset(){previous=null;},observe(state){
  const mode=ambienceForGame(state),m=state.match,cues=[];
  if(state.view!=='career'||!m){previous=null;return {mode,cues};}
  const key=[state.career?.season,m.fixtureDate||state.career?.date,m.home,m.away].join(':');
  const same=previous?.key===key&&(m.events||[]).length>=previous.count&&m.minute>=previous.minute;
  if(!same)generation++;
  if(same){
   const add=(type,suffix,gain)=>cues.push({type,key:key+':run:'+generation+':'+suffix,gain});
   if(previous.phase!=='live'&&m.phase==='live'&&m.minute===0&&mode==='match')add('kickoff','kickoff',.30);
   else if(previous.phase==='live'&&m.phase==='report')add('full','full',.32);
   else if(m.phase==='live'){
    if(mode==='interval'&&!previous.half)add('half','half',.30);
    else if(previous.half&&mode==='match')add('restart','restart',.25);
    else if(mode==='match'){
     const fresh=(m.events||[]).slice(previous.count).filter(e=>e.minute===m.minute&&['goal','chance'].includes(e.type));
     const e=fresh.findLast(e=>e.type==='goal')||fresh.findLast(e=>e.type==='chance'&&e.onTarget);
     if(e){const homeSupport=m.neutral?.6:e.team===m.home?1:.42;
      if(e.type==='goal')add('goal',`goal:${m.minute}:${m.homeGoals}:${m.awayGoals}:${e.playerId}`,homeSupport*.62);
      else{const defendingHome=e.team!==m.home;add('save',`save:${m.minute}:${(m.events||[]).length}`,m.neutral?.18:defendingHome?.22:.10);}
     }
    }
   }
  }
  previous={key,phase:m.phase,half:mode==='interval',minute:m.minute,count:(m.events||[]).length};return {mode,cues,fresh:!same};
 }};
}
