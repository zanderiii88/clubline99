// Read-only interpretation of recorded match facts, shared by both modes.
const count=n=>Number.isFinite(n)&&n>=0?n:0;
export function matchObservations(r,clubId,{halfTime=false}={}){
 const home=r.homeId??r.home,away=r.awayId??r.away,ours=r.homeId?home===clubId:typeof r.home==='boolean'?r.home:home===clubId,opponent=r.opponent??(ours?away:home);
 const facts=[],advice=[],stats=r.stats,us=stats?.[ours?'home':'away'],them=stats?.[ours?'away':'home'];
 if(us&&them){
  const shots=count(us.shots),against=count(them.shots),target=count(us.onTarget),theirTarget=count(them.onTarget);
  facts.push(`Shots: ${shots} for us, ${against} for the opposition; on target: ${target}–${theirTarget}.`);
  facts.push(target>theirTarget?'We put more shots on target.':target<theirTarget?'The opposition put more shots on target.':'Shots on target were level.');
  const samples=(stats.possession||[]).filter(x=>Number.isFinite(x.home)&&x.home>=0&&x.home<=100);
  if(samples.length){const homeShare=Math.round(samples.reduce((n,x)=>n+x.home,0)/samples.length),share=ours?homeShare:100-homeShare;facts.push(`Recorded possession: ${share}% for us.${stats.possessionStartMinute?' Only the recorded portion of the match is included.':''}`);}
  else facts.push('Possession was not recorded for this match.');
  if(halfTime){if(target<theirTarget)advice.push('Review midfield cover and the available attacking options before changing your approach.');else if(target>theirTarget)advice.push('Our shots on target are encouraging. Consider keeping the approach unless fitness or incidents require a change.');else advice.push('There is no clear shots-on-target advantage. Review fitness and the match incidents before changing your approach.');if(shots>0&&target===0)advice.push('None of our recorded shots were on target. Review the forward options; the data does not establish the cause.');}
  else if(Number.isFinite(r.us)&&Number.isFinite(r.them)){if(r.us>r.them&&target<theirTarget)facts.push('We won despite having fewer shots on target.');else if(r.us<r.them&&target>theirTarget)facts.push('More shots on target did not translate into a win.');else if(r.us===r.them)facts.push('The match score finished level. Any penalty shoot-out is recorded separately.');}
 }else facts.push('Detailed shooting and possession data is unavailable for this report.');
 const events=r.events||[],reds=events.filter(e=>e.type==='red'),injuries=events.filter(e=>e.type==='injury');
 const ownRed=reds.filter(e=>e.team===clubId).length,opponentRed=reds.filter(e=>e.team===opponent).length;
 if(ownRed)facts.push(`${ownRed} sending-off${ownRed===1?'':'s'} for our team.`);
 if(opponentRed)facts.push(`${opponentRed} sending-off${opponentRed===1?'':'s'} for the opposition.`);
 const hurt=injuries.filter(e=>e.team===clubId);if(hurt.length)facts.push(`${hurt.length} injury incident${hurt.length===1?'':'s'} recorded for our team.`);
 if(halfTime&&ownRed)advice.unshift('Check that the remaining players cover the required positions after the sending-off.');
 const standout=(r.performances||[]).filter(p=>p.minutes>=15&&Number.isFinite(p.rating)).slice().sort((a,b)=>b.rating-a.rating||b.minutes-a.minutes)[0]||null;
 return {facts,advice,standout,incidentIds:[...reds,...injuries].map(e=>e.playerId).filter(Boolean)};
}
