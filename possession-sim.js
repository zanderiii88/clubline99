// Experimental, deterministic spatial football model. No DOM, audio or career storage.
export const STEP=.1;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const names=[['A. Grant','B. Ross','C. Reid','D. Fraser','E. Clark','F. Young','G. Scott','H. Murray','I. Wilson','J. Brown','K. Adams'],['L. Shaw','M. Hill','N. Wood','O. Bell','P. Gray','Q. Green','R. Hart','S. Cole','T. King','U. Ward','V. Ford']];
const anchors=[[5,34,'GK'],[25,9,'FB'],[23,25,'CB'],[23,43,'CB'],[25,59,'FB'],[47,8,'W'],[45,26,'CM'],[45,42,'CM'],[47,60,'W'],[68,26,'ST'],[68,42,'ST']];
function random(s){s.rng=(s.rng+0x6D2B79F5)>>>0;let n=s.rng;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;}
const player=(s,id)=>s.players.find(p=>p.id===id);
const direction=team=>team===0?1:-1;
const goalX=team=>team===0?105:0;
function emit(s,type,team,actorId,text,extra={}){const e={id:++s.serial,second:Number(s.time.toFixed(1)),type,team,actorId,text,...extra};s.events.push(e);return e;}
function homeSpace(p,team){return team===0?p.x:105-p.x;}
function nearest(s,team,pos,exclude=null){return s.players.filter(p=>p.team===team&&p.id!==exclude).sort((a,b)=>distance(a,pos)-distance(b,pos)||a.number-b.number);}
function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,k=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return distance(p,{x:a.x+dx*k,y:a.y+dy*k});}
function own(s,p,immunity=.8){s.ball.owner=p.id;s.ball.x=p.x+direction(p.team)*.55;s.ball.y=p.y;s.flight=null;s.looseSince=null;s.possession=p.team;s.immunity=s.time+immunity;s.decisionAt=s.time+1.2+random(s)*2.2;}
function resetShape(s){for(const p of s.players){const [x,y]=anchors[p.number-1];p.x=p.team===0?x:105-x;p.y=p.team===0?y:68-y;p.vx=0;p.vy=0;}}
function restart(s,team,kind){
 s.phase='restart';s.restartKind=kind;s.restartUntil=s.time+2;s.flight=null;resetShape(s);
 const p=s.players.find(p=>p.team===team&&p.number===(kind==='kickoff'?10:1));
 if(kind==='kickoff'){p.x=52.5;p.y=34;const partner=s.players.find(x=>x.team===team&&x.number===11);partner.x=52.5-direction(team)*3;partner.y=39;}
 own(s,p);emit(s,'restart',team,p.id,kind==='kickoff'?`${s.teams[team].name} prepare to kick off.`:`${s.teams[team].name} restart with the goalkeeper.`);
}
export function createSimulation({seed=99,duration=180,scenario='open'}={}){
 const initialSeed=Number(seed)>>>0;
 const s={version:1,seed:initialSeed,rng:initialSeed,time:0,duration:clamp(Number(duration)||180,30,600),phase:'restart',serial:0,events:[],players:[],ball:{x:52.5,y:34,owner:null},flight:null,score:[0,0],teams:[{name:'Blue XI',tactic:'balanced'},{name:'Red XI',tactic:'balanced'}],stats:[0,1].map(()=>({passes:0,completed:0,shots:0,saves:0,tackles:0,interceptions:0,possession:0})),possession:0,decisionAt:0,immunity:0,restartUntil:0,scenario:['open','counter','wide'].includes(scenario)?scenario:'open'};
 for(let team=0;team<2;team++)for(let i=0;i<11;i++){const [x,y,role]=anchors[i];s.players.push({id:`${team}-${i+1}`,team,number:i+1,name:names[team][i],role,x:team===0?x:105-x,y:team===0?y:68-y,vx:0,vy:0,pass:62+random(s)*25,finish:role==='ST'?70+random(s)*16:50+random(s)*23,tackle:role==='CB'?78:60+random(s)*20,pace:4.7+random(s)*.8});}
 restart(s,0,'kickoff');
 if(s.scenario!=='open'){
  s.phase='play';const p=s.players.find(p=>p.team===0&&p.number===(s.scenario==='wide'?9:7));p.x=s.scenario==='wide'?72:48;p.y=s.scenario==='wide'?59:33;
  if(s.scenario==='counter'){for(const q of s.players.filter(p=>p.team===1&&p.role!=='GK'))q.x-=18;}
  if(s.scenario==='wide')s.teams[0].tactic='wide';own(s,p);emit(s,'scenario',0,p.id,s.scenario==='wide'?'Blue start a wide attack.':'Blue regain the ball with room to counter.');
 }
 return s;
}
export function setTactic(s,team,tactic){if(![0,1].includes(team)||!['balanced','wide','direct','press'].includes(tactic))return; s.teams[team].tactic=tactic;emit(s,'tactic',team,null,`${s.teams[team].name} switch to ${tactic}.`);}
function movePlayers(s){
 const owner=player(s,s.ball.owner),ball=s.ball,targets=new Map();
 const press=[0,1].map(team=>nearest(s,team,ball).filter(p=>p.role!=='GK').slice(0,s.teams[team].tactic==='press'?2:1).map(p=>p.id));
 for(const p of s.players){
  const dir=direction(p.team),localBall=homeSpace(ball,p.team),[ax,ay]=anchors[p.number-1],ours=s.possession===p.team,tactic=s.teams[p.team].tactic;
  let tx=ax+(localBall-52.5)*(ours?.42:.52)+(ours?5:-4),ty=ay+(ball.y-34)*.14;
  if(p.team===1)ty=68-ay+(ball.y-34)*.14;
  if(p.role==='GK'){tx=clamp(localBall*.09,4,10);ty=clamp(34+(ball.y-34)*.65+(s.flight?.kind==='shot'&&s.flight.team!==p.team?s.flight.vy*.2:0),25,43);}
  else if(p.id===owner?.id){tx=localBall+8;ty=p.y+Math.sin(s.time*.5+p.number)*3;}
  else if(s.flight?.receiverId===p.id){tx=homeSpace(s.flight.target,p.team);ty=s.flight.target.y;}
  else if(!owner&&!s.flight){if(nearest(s,p.team,ball)[0]?.id===p.id){tx=localBall;ty=ball.y;}}
  else if(!ours&&press[p.team].includes(p.id)){tx=localBall-dir*.6;ty=ball.y;}
  else if(ours&&p.role==='ST'){tx=Math.max(tx,localBall+11);ty=clamp(ty,18,50);}
  else if(ours&&p.role==='W'){ty=(p.team===0?ay:68-ay)<34?(tactic==='wide'?4:9):(tactic==='wide'?64:59);tx=Math.max(tx,localBall+3);}
  if(p.role!=='GK'){tx=clamp(tx,10,96);ty=clamp(ty,3,65);}
  targets.set(p.id,{x:p.team===0?tx:105-tx,y:ty});
 }
 for(const p of s.players){
  const target=targets.get(p.id),dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),speed=(p.id===owner?.id?p.pace*.77:p.pace)*Math.min(1,d/1.4),vx=d?dx/d*speed:0,vy=d?dy/d*speed:0;
  // Bounded acceleration smooths direction changes; rendering does not decide movement.
  const dvx=vx-p.vx,dvy=vy-p.vy,dv=Math.hypot(dvx,dvy),scale=Math.min(1,5*STEP/(dv||1));p.vx+=dvx*scale;p.vy+=dvy*scale;p.x=clamp(p.x+p.vx*STEP,1,104);p.y=clamp(p.y+p.vy*STEP,1,67);
 }
 if(owner){ball.x=clamp(owner.x+direction(owner.team)*.55,.1,104.9);ball.y=owner.y;}
}
function launch(s,p,kind,target,receiver=null){
 const start={x:s.ball.x,y:s.ball.y},d=distance(start,target),speed=kind==='shot'?22:kind==='cross'?18:15;
 s.flight={kind,team:p.team,actorId:p.id,receiverId:receiver?.id||null,target:{...target},vx:(target.x-start.x)/d*speed,vy:(target.y-start.y)/d*speed,age:0,contacted:[]};s.ball.owner=null;
 if(kind==='shot')s.stats[p.team].shots++;else s.stats[p.team].passes++;
 emit(s,kind,p.team,p.id,kind==='shot'?`${p.name} shoots!`:kind==='cross'?`${p.name} crosses towards ${receiver.name}.`:`${p.name} looks for ${receiver.name}.`,{receiverId:receiver?.id||null,start,end:{...target}});
}
function chooseAction(s,p){
 const defenders=nearest(s,1-p.team,p),pressure=defenders[0]?distance(p,defenders[0]):20,toGoal=105-homeSpace(p,p.team),tactic=s.teams[p.team].tactic;
 if(p.role!=='GK'&&toGoal<27&&random(s)<(toGoal<17?.45:.12)){
  const error=(100-p.finish)/6+toGoal*.18+(pressure<3?3:0),target={x:goalX(p.team)+direction(p.team),y:34+(random(s)-.5)*2*error};launch(s,p,'shot',target);return;
 }
 const candidates=s.players.filter(q=>q.team===p.team&&q.id!==p.id&&distance(p,q)>5&&distance(p,q)<(tactic==='direct'?48:36)).map(q=>{
  const d=distance(p,q),progress=(q.x-p.x)*direction(p.team),space=distance(q,nearest(s,1-p.team,q)[0]),lane=Math.min(...defenders.map(def=>segmentDistance(def,p,q)));
  return {q,weight:Math.max(.1,3+progress*(tactic==='direct'?.23:.12)+Math.min(space,12)*.23-Math.max(0,3-lane)*1.4-d*.035+(tactic==='wide'&&q.role==='W'?2:0)+random(s)*2)};
 }).sort((a,b)=>b.weight-a.weight);
 const crossing=p.role==='W'&&toGoal<30&&Math.abs(p.y-34)>16;
 if(crossing){const receivers=s.players.filter(q=>q.team===p.team&&q.role==='ST').sort((a,b)=>homeSpace(b,p.team)-homeSpace(a,p.team));const q=receivers[0];if(q){launch(s,p,'cross',{x:clamp(q.x+direction(p.team)*3,6,99),y:clamp(q.y+(random(s)-.5)*4,17,51)},q);s.decisionAt=s.time+1;return;}}
 if(candidates.length&&(pressure<5||random(s)<.7||p.role==='GK')){
  const pool=candidates.slice(0,4),total=pool.reduce((n,x)=>n+x.weight,0);let roll=random(s)*total,chosen=pool.at(-1).q;for(const x of pool){roll-=x.weight;if(roll<=0){chosen=x.q;break;}}
  const error=(100-p.pass)/30+(pressure<3?1.3:0),target={x:clamp(chosen.x+chosen.vx*.35+(random(s)-.5)*error,2,103),y:clamp(chosen.y+chosen.vy*.35+(random(s)-.5)*error,2,66)};launch(s,p,'pass',target,chosen);
 }else{emit(s,'carry',p.team,p.id,`${p.name} carries the ball forward.`,{start:{x:p.x,y:p.y}});s.decisionAt=s.time+.8+random(s)*.8;}
}
function deflect(s,f,p,type){
 s.flight=null;s.ball.owner=null;s.ball.x=clamp(p.x+(random(s)-.5)*4,1,104);s.ball.y=clamp(p.y+(random(s)-.5)*4,1,67);s.looseSince=s.time;
 emit(s,type,p.team,p.id,`${p.name} blocks the shot.`,{opponentId:f.actorId});
}
function advanceFlight(s){
 const f=s.flight,from={x:s.ball.x,y:s.ball.y};f.age+=STEP;const to={x:from.x+f.vx*STEP,y:from.y+f.vy*STEP};
 for(const p of s.players.slice().sort((a,b)=>distance(a,from)-distance(b,from))){
  if(p.id===f.actorId&&f.age<.5||f.contacted.includes(p.id))continue;
  const reach=f.kind==='shot'?(p.role==='GK'?2.7:.75):1.35;
  if(segmentDistance(p,from,to)>reach)continue;
  if(f.kind==='shot'){
   if(p.team===f.team)continue;f.contacted.push(p.id);
   if(p.role==='GK'){if(random(s)<.9){s.stats[p.team].saves++;own(s,p);emit(s,'save',p.team,p.id,`${p.name} saves and gathers.`,{opponentId:f.actorId});return;}}
   else if(random(s)<.64){deflect(s,f,p,'block');return;}
  }else{
   if(p.team!==f.team&&random(s)>p.tackle/100){f.contacted.push(p.id);continue;}
   own(s,p);
   if(p.team===f.team){s.stats[p.team].completed++;emit(s,'complete',p.team,f.actorId,`${player(s,f.actorId).name} finds ${p.name}.`,{receiverId:p.id});}
   else{s.stats[p.team].interceptions++;emit(s,'interception',p.team,p.id,`${p.name} intercepts. ${s.teams[p.team].name} can break.`,{opponentId:f.actorId});}
   return;
  }
 }
 s.ball.x=to.x;s.ball.y=to.y;
 if(f.kind==='shot'&&(to.x<=0||to.x>=105)){
  const ratio=(goalX(f.team)-from.x)/(to.x-from.x),crossY=from.y+(to.y-from.y)*ratio;
  if(crossY>=30.34&&crossY<=37.66){s.score[f.team]++;emit(s,'goal',f.team,f.actorId,`GOAL! ${player(s,f.actorId).name} scores for ${s.teams[f.team].name}.`,{start:{...from},end:{x:goalX(f.team),y:crossY}});restart(s,1-f.team,'kickoff');}
  else{emit(s,'miss',f.team,f.actorId,`${player(s,f.actorId).name} shoots wide.`);restart(s,1-f.team,'goal-kick');}return;
 }
 if(f.kind!=='shot'&&(distance(s.ball,f.target)<1.8||f.age>5||to.x<1||to.x>104||to.y<1||to.y>67)){
  s.flight=null;s.looseSince=s.time;s.ball.x=clamp(to.x,1,104);s.ball.y=clamp(to.y,1,67);
  emit(s,'loose',f.team,f.actorId,'The ball runs loose.');
 }
}
export function stepSimulation(s){
 if(s.phase==='ended')return s;s.time=Math.min(s.duration,Number((s.time+STEP).toFixed(5)));
 if(s.time>=s.duration){s.phase='ended';s.flight=null;emit(s,'end',null,null,'End of the three-minute test passage.');return s;}
 if(s.phase==='restart'){if(s.time>=s.restartUntil){s.phase='play';s.decisionAt=s.time+.6;emit(s,'resume',s.possession,s.ball.owner,'Play resumes.');}return s;}
 s.stats[s.possession].possession+=STEP;movePlayers(s);
 if(s.flight){advanceFlight(s);return s;}
 const owner=player(s,s.ball.owner);
 if(!owner){const closest=s.players.slice().sort((a,b)=>distance(a,s.ball)-distance(b,s.ball))[0];if(distance(closest,s.ball)<1.6){own(s,closest);emit(s,'recovery',closest.team,closest.id,`${closest.name} collects the loose ball.`);}return s;}
 if(s.time>=s.immunity){const challenger=nearest(s,1-owner.team,owner).filter(p=>p.role!=='GK')[0];if(challenger&&distance(challenger,owner)<1.45){s.immunity=s.time+.65;if(random(s)<clamp(.25+(challenger.tackle-owner.pass)*.008,.15,.6)){s.stats[challenger.team].tackles++;own(s,challenger,1.1);emit(s,'tackle',challenger.team,challenger.id,`${challenger.name} tackles ${owner.name} and wins the ball.`,{opponentId:owner.id});return;}}}
 if(s.time>=s.decisionAt)chooseAction(s,owner);return s;
}
export function simulationSnapshot(s){return {time:s.time,phase:s.phase,ball:{...s.ball},players:s.players.map(p=>({id:p.id,team:p.team,number:p.number,name:p.name,role:p.role,x:p.x,y:p.y})),score:[...s.score]};}
