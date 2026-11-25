export const isPitchCorner=event=>event.type==='ball-out'&&event.restartKind==='corner';

export function pitchPenaltyShot(event,events){
 if(event.type==='shot')return event.delivery==='penalty'?event:null;
 if(isPitchCorner(event)&&Number.isInteger(event.saveEventId)){
  const save=events.findLast(candidate=>candidate.id===event.saveEventId&&candidate.type==='save');
  if(!save)return null;
  event=save;
 }
 if(!Number.isInteger(event.shotId))return null;
 return events.findLast(candidate=>candidate.id===event.shotId&&candidate.type==='shot'&&candidate.delivery==='penalty')??null;
}

export function penaltyIncidentText(text,isPenalty){
 return isPenalty?`Penalty · ${text}`:text;
}

export function penaltyReplayMoment(event,events){
 const endsKick=['goal','miss','block'].includes(event.type)||event.type==='save'&&event.outcome==='held'||isPitchCorner(event);
 if(!endsKick&&event.type!=='shot'&&event.type!=='save')return null;
 if(!pitchPenaltyShot(event,events))return null;
 return {text:penaltyIncidentText(event.text,true),settled:endsKick};
}

const cornerWindow=10;
const possessionEvents=new Set(['pass','cross','cutback','kick','long-ball','carry','dribble','shot',
 'control','interception','recovery','clearance']);
const cornerStops=new Set(['restart','ball-out','offside','half-time','second-half','end']);

export function cornerOutput(events){
 const teams=[{cornerShots:0,cornerGoals:0},{cornerShots:0,cornerGoals:0}];
 const creditedShots=new Map();
 let corner=null;
 for(const event of events){
  if(cornerStops.has(event.type))corner=null;
  const delivery=(event.type==='cross'||event.type==='pass')&&event.delivery==='corner';
  const legacyShort=event.type==='pass'&&event.text?.includes('takes the corner short to');
  if(delivery||legacyShort)corner={team:event.team,until:event.second+cornerWindow};
  if(corner&&event.type==='shot'&&corner.team===event.team&&event.second<=corner.until){
   creditedShots.set(event.id,event.team);
   teams[event.team].cornerShots++;
  }
  if(event.type==='goal'&&creditedShots.get(event.shotId)===event.team){
   teams[event.team].cornerGoals++;
  }
  if(corner&&event.team===1-corner.team&&(possessionEvents.has(event.type)
    ||event.type==='save'&&event.outcome==='held'||event.type==='tackle'&&event.outcome==='controlled'))corner=null;
 }
 return teams;
}
