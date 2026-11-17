import {makePlan,PRESETS,PLAN_OPTIONS,INSTRUCTIONS,applyProfile,applyStrength} from './lab-tactics.js?v=1.132.0';
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
function own(s,p,immunity=.8){if(s.possession!==p.team&&s.phase==='play'){s.transition={team:p.team,at:s.time};for(const q of s.players)q.thinkAt=Math.min(q.thinkAt||0,s.time+.2+(100-q.anticipation)/100);}s.offsidePhase=null;s.ball.owner=p.id;s.ball.z=0;s.ball.x=p.x+direction(p.team)*.55;s.ball.y=p.y;s.flight=null;s.looseSince=null;s.possession=p.team;s.immunity=s.time+immunity;const tempo=s.teams[p.team].plan.tempo;s.decisionAt=s.time+(tempo==='quick'?.68:tempo==='patient'?1.25:1)*(1.2+random(s)*2.2);}
function resetShape(s){for(const p of s.players){const [x,y]=anchors[p.number-1];p.x=p.team===0?x:105-x;p.y=p.team===0?y:68-y;p.vx=0;p.vy=0;p.target=null;p.thinkAt=0;p.runUntil=0;}}
const inPenalty=(pos,team)=>homeSpace(pos,team)<16.5&&Math.abs(pos.y-34)<20.16;
export function offsidePositions(s,team,restartKind=null){
 if(['goal-kick','throw-in','corner'].includes(restartKind))return [];
 const line=s.players.filter(p=>p.team!==team).map(p=>homeSpace(p,team)).sort((a,b)=>b-a)[1]??105;
 const limit=Math.max(52.5,homeSpace(s.ball,team),line);
 return s.players.filter(p=>p.team===team&&p.id!==s.ball.owner&&homeSpace(p,team)>limit+.001).map(p=>({id:p.id,x:p.x,y:p.y,margin:homeSpace(p,team)-limit}));
}
export function awardRestart(s,team,kind,point=null){
 s.phase='restart';s.restartKind=kind;s.restartTeam=team;s.restartUntil=s.time+2;s.flight=null;s.offsidePhase=null;s.pendingRestart=true;resetShape(s);
 const pos=point?{x:clamp(point.x,1,104),y:clamp(point.y,1,67)}:kind==='kickoff'?{x:52.5,y:34}:{x:team===0?5:100,y:34};
 if(!['kickoff','goal-kick'].includes(kind))for(const q of s.players.filter(q=>q.role!=='GK')){const local=homeSpace(pos,q.team),[ax,ay]=anchors[q.number-1];q.x=q.team===0?clamp(ax+(local-52.5)*.5,8,97):105-clamp(ax+(local-52.5)*.5,8,97);q.y=clamp((q.team===0?ay:68-ay)+(pos.y-34)*.18,3,65);}
 const p=kind==='kickoff'?s.players.find(p=>p.team===team&&p.number===10):kind==='goal-kick'?s.players.find(p=>p.team===team&&p.role==='GK'):nearest(s,team,pos).find(p=>p.role!=='GK');
 p.x=pos.x;p.y=pos.y;
 if(kind==='kickoff'){const partner=s.players.find(x=>x.team===team&&x.number===11);partner.x=52.5-direction(team)*3;partner.y=39;}
 for(const q of s.players.filter(q=>q.team!==team)){if(kind==='goal-kick'&&inPenalty(q,team))q.x=team===0?18:87;const d=distance(q,pos),minimum=kind==='throw-in'?2:9.2;if(d<minimum){const dx=q.x-pos.x,dy=q.y-pos.y;q.x=clamp(pos.x+(dx/(d||1)||-direction(team))*minimum,1,104);q.y=clamp(pos.y+dy/(d||1)*minimum,1,67);}}
 own(s,p);s.ball.x=pos.x;s.ball.y=pos.y;s.restartPoint=pos;s.restartTaker=p.id;
 if(kind==='corner')s.stats[team].corners=(s.stats[team].corners||0)+1;if(kind==='throw-in')s.stats[team].throwIns=(s.stats[team].throwIns||0)+1;
 const label={'kickoff':'kick-off','goal-kick':'goal kick','throw-in':'throw-in','corner':'corner','indirect':'indirect free kick'}[kind]||kind;
 emit(s,'restart',team,p.id,`${s.teams[team].name} prepare ${kind==='indirect'?'an':'a'} ${label}.`,{kind,point:{...pos}});
}
function restart(s,team,kind,point=null){awardRestart(s,team,kind,point);}
function takeRestart(s){
 const p=player(s,s.restartTaker),kind=s.restartKind;s.pendingRestart=false;s.restartOrigin=kind;
 if(kind==='kickoff'){const q=s.players.find(q=>q.team===p.team&&q.number===11);launch(s,p,'pass',{x:52.5+direction(p.team)*3,y:39},q);return;}
 if(kind==='goal-kick'&&keeperKick(s,p,20))return;
 let options=s.players.filter(q=>q.team===p.team&&q.id!==p.id&&q.role!=='GK'&&distance(p,q)>3);
 if(kind==='goal-kick'||kind==='indirect'&&inPenalty(p,p.team))options=options.filter(q=>!inPenalty(q,p.team));
 if(kind==='kickoff')options=options.filter(q=>homeSpace(q,p.team)>52.5);
 options.sort((a,b)=>(kind==='corner'?Math.abs(homeSpace(a,p.team)-94):distance(p,a))-(kind==='corner'?Math.abs(homeSpace(b,p.team)-94):distance(p,b)));
 const q=options[0];if(!q){s.restartOrigin=null;restart(s,p.team,kind,s.restartPoint);return;}
 launch(s,p,kind==='corner'?'cross':'pass',{x:q.x,y:q.y},q);
}
function offsideContact(s,p){
 const phase=s.offsidePhase,offender=phase?.team===p.team&&phase.candidates.find(q=>q.id===p.id);if(!offender)return false;
 s.stats[p.team].offsides=(s.stats[p.team].offsides||0)+1;
 emit(s,'offside',p.team,p.id,`The flag is up! ${p.name} is given offside.`,{releasePosition:offender,passEvent:phase.passEvent});
 restart(s,1-p.team,'indirect',offender);return true;
}
function boundaryRestart(s,lastTeam,pos){
 if(pos.y<0||pos.y>68){restart(s,1-lastTeam,'throw-in',{x:pos.x,y:pos.y<0?1:67});return;}
 const defending=pos.x<0?0:1;
 if(lastTeam===defending)restart(s,1-defending,'corner',{x:pos.x<0?1:104,y:pos.y<34?1:67});else restart(s,defending,'goal-kick');
}
export function createSimulation({seed=99,duration=180,scenario='open',profile='balanced',preset='balanced',strengths=['standard','standard'],kickoffTeam=0}={}){
 const initialSeed=Number(seed)>>>0;
 const s={version:6,seed:initialSeed,rng:initialSeed,time:0,duration:clamp(Number(duration)||180,30,600),phase:'restart',serial:0,events:[],players:[],ball:{x:52.5,y:34,owner:null},flight:null,score:[0,0],teams:[{name:'Blue XI',tactic:preset,plan:makePlan(preset),profile},{name:'Red XI',tactic:'balanced',plan:makePlan(),profile:'balanced'}],stats:[0,1].map(()=>({passes:0,completed:0,shots:0,saves:0,tackles:0,interceptions:0,carries:0,takeOns:0,longKicks:0,miscontrols:0,offsides:0,corners:0,throwIns:0,possession:0})),possession:0,decisionAt:0,immunity:0,restartUntil:0,scenario:['open','counter','wide','keeper','offside','support','corner','throw-in'].includes(scenario)?scenario:'open'};
 for(let team=0;team<2;team++)for(let i=0;i<11;i++){const [x,y,role]=anchors[i];s.players.push({id:`${team}-${i+1}`,team,number:i+1,name:names[team][i],role,x:team===0?x:105-x,y:team===0?y:68-y,vx:0,vy:0,pass:62+random(s)*25,finish:role==='ST'?70+random(s)*16:50+random(s)*23,tackle:role==='CB'?78:60+random(s)*20,pace:4.7+random(s)*.8});}
 for(const p of s.players){for(const key of ['technique','decisions','composure','offball','positioning','teamwork','discipline','stamina','anticipation','handling','reflexes'])p[key]=56+random(s)*26;p.dribbling=p.technique;p.roam=random(s);p.energy=100;p.instruction='auto';p.thinkAt=0;p.target=null;p.intent='Keep shape';}applyProfile(s,0,profile);for(let team=0;team<2;team++)applyStrength(s,team,strengths[team]||'standard');
 restart(s,kickoffTeam===1?1:0,s.scenario==='keeper'?'goal-kick':'kickoff');
 if(['counter','wide'].includes(s.scenario)){
  s.phase='play';const p=s.players.find(p=>p.team===0&&p.number===(s.scenario==='wide'?9:7));p.x=s.scenario==='wide'?72:48;p.y=s.scenario==='wide'?59:33;
  if(s.scenario==='counter'){for(const q of s.players.filter(p=>p.team===1&&p.role!=='GK'))q.x-=18;}
  if(s.scenario==='wide')s.teams[0].plan.width='wide';own(s,p);emit(s,'scenario',0,p.id,s.scenario==='wide'?'Blue start a wide attack.':'Blue regain the ball with room to counter.');
 }
 if(s.scenario==='offside'){
  s.phase='play';const p=s.players.find(p=>p.id==='0-7'),q=s.players.find(p=>p.id==='0-10');
  for(const d of s.players.filter(p=>p.team===1)){d.x=d.role==='GK'?100:78;d.y=d.role==='GK'?34:d.number%2?12:56;}
  p.x=65;p.y=34;q.x=85;q.y=34;own(s,p);launch(s,p,'pass',{x:85,y:34},q);
 }
 if(s.scenario==='support'){
  s.phase='play';const p=s.players.find(p=>p.id==='0-10');p.x=55;p.y=34;
  for(const id of ['0-2','0-7','0-8']){const q=player(s,id);q.x=53;q.y=34;q.target=null;q.thinkAt=0;}own(s,p);
  emit(s,'scenario',0,p.id,'Blue need to spread out and offer passing angles.');
 }
 if(s.scenario==='corner')restart(s,0,'corner',{x:104,y:1});if(s.scenario==='throw-in')restart(s,0,'throw-in',{x:60,y:1});
 return s;
}
export function setTactic(s,team,tactic){
 if(![0,1].includes(team))return;
 // Preserve old lab API aliases while the visible presets use the four new plans.
 if(['wide','direct'].includes(tactic)){s.teams[team].plan=makePlan();s.teams[team].plan[tactic==='wide'?'width':'passing']=tactic;s.teams[team].tactic='balanced';}
 else{if(!PRESETS[tactic])return;s.teams[team].tactic=tactic;s.teams[team].plan=makePlan(tactic);}
 for(const p of s.players.filter(p=>p.team===team))p.thinkAt=0;
 emit(s,'tactic',team,null,`${s.teams[team].name} switch to ${PRESETS[tactic]?.label||tactic}.`,{plan:{...s.teams[team].plan}});
}
export function adjustPlan(s,team,key,value){if(![0,1].includes(team)||!PLAN_OPTIONS[key]?.values[value])return false;s.teams[team].plan[key]=value;for(const p of s.players.filter(p=>p.team===team))p.thinkAt=0;emit(s,'tactic',team,null,`${s.teams[team].name}: ${PLAN_OPTIONS[key].label.toLowerCase()} — ${PLAN_OPTIONS[key].values[value]}.`,{plan:{...s.teams[team].plan}});return true;}
export function instructPlayer(s,id,instruction){const p=player(s,id);if(!p||!INSTRUCTIONS[instruction]||p.role==='GK'&&instruction!=='hold'&&instruction!=='auto')return false;p.instruction=instruction;p.thinkAt=0;emit(s,'instruction',p.team,p.id,`${p.name}: ${INSTRUCTIONS[instruction].toLowerCase()}.`);return true;}
function movePlayers(s){
 const owner=player(s,s.ball.owner),ball=s.ball,targets=new Map(),recent=s.transition&&s.time-s.transition.at<5;
 const recoverers=!owner&&!s.flight?[0,1].map(team=>nearest(s,team,ball).filter(p=>p.role!=='GK'||homeSpace(ball,team)<18&&Math.abs(ball.y-34)<23)[0]?.id):[];
 const press=[0,1].map(team=>{const plan=s.teams[team].plan,count=plan.press==='high'||recent&&plan.loss==='counterpress'?2:1;return nearest(s,team,ball).filter(p=>p.role!=='GK'&&p.instruction!=='hold'&&p.energy>35).slice(0,count).map(p=>p.id);});
 const support=[0,1].map(team=>nearest(s,team,ball,owner?.id).filter(p=>['CM','FB'].includes(p.role)&&p.instruction!=='hold').sort((a,b)=>(distance(a,ball)-a.teamwork*.04-a.offball*.03)-(distance(b,ball)-b.teamwork*.04-b.offball*.03)).slice(0,2).map(p=>p.id));
 for(const p of s.players){
  if(p.id!==recoverers[p.team]&&p.target&&s.time<p.thinkAt){targets.set(p.id,p.target);continue;}
  const dir=direction(p.team),localBall=homeSpace(ball,p.team),[ax,ay]=anchors[p.number-1],baseY=p.team===0?ay:68-ay,ours=s.possession===p.team,plan=s.teams[p.team].plan,instruction=p.instruction;
  let tx=ax+(localBall-52.5)*(ours?.38:.48)+(ours?5:plan.press==='deep'?-10:plan.press==='high'?2:-4),ty=baseY+(ball.y-34)*.14,intent=ours?'Keep an option':'Recover shape';
  if(p.id===recoverers[p.team]){tx=localBall;ty=ball.y;intent='Collect loose ball';}
  else if(p.role==='GK'){tx=clamp(localBall*.09,4,10);ty=clamp(34+(ball.y-34)*.65+(s.flight?.kind==='shot'&&s.flight.team!==p.team?s.flight.vy*.2:0),25,43);intent='Cover goal';}
  else if(p.id===owner?.id){tx=localBall+(p.controlUntil>s.time?0:7);const lanes=[-5,0,5].map(offset=>({y:clamp(p.y+offset,3,65),space:Math.min(...s.players.filter(q=>q.team!==p.team).map(q=>distance(q,{x:p.x+dir*6,y:clamp(p.y+offset,3,65)})))})).sort((a,b)=>b.space-a.space);ty=lanes[0].y;intent=p.controlUntil>s.time?'Control the ball':p.dribbleUntil>s.time?'Take on the defender':'Carry into space';}
  else if(s.flight?.receiverId===p.id){tx=homeSpace(s.flight.target,p.team);ty=s.flight.target.y;intent='Meet the pass';}
  else if(instruction==='hold'&&(owner||s.flight)){tx=ax+(localBall-52.5)*.22;ty=baseY;intent='Hold position';}
  else if(!owner&&!s.flight&&nearest(s,p.team,ball)[0]?.id===p.id){tx=localBall;ty=ball.y;intent='Collect loose ball';}
  else if(!ours&&press[p.team].includes(p.id)&&(plan.press!=='deep'||localBall<65)){tx=localBall-.6;ty=ball.y;intent=recent&&plan.loss==='counterpress'?'Counterpress':'Close the carrier';}
  else if(!ours&&['CB','CM'].includes(p.role)&&p.teamwork>=65&&nearest(s,p.team,ball).filter(q=>['CB','CM'].includes(q.role)&&!press[p.team].includes(q.id))[0]?.id===p.id){tx=localBall-8;ty=ball.y+(baseY<34?-5:5);intent='Cover the press';}
  else if(ours){
   if(support[p.team].includes(p.id)){const index=support[p.team].indexOf(p.id);tx=localBall-(index?8:3);ty=ball.y+(index?1:-1)*11;intent='Offer a passing angle';}
   if(p.role==='W'){tx=Math.max(tx,localBall+2);ty=baseY<34?(plan.width==='wide'?5:plan.width==='narrow'?19:11):(plan.width==='wide'?63:plan.width==='narrow'?49:57);intent='Provide width';}
   if(p.role==='ST'||instruction==='forward'){tx=Math.max(tx,localBall+9+p.offball/18);ty=baseY+(ball.y-34)*.12;intent='Run beyond';}
   if(p.role==='FB'&&plan.width==='wide'&&localBall>50&&Math.sign(baseY-34)===Math.sign(ball.y-34)||instruction==='overlap'){tx=localBall+9;ty=baseY<34?7:61;intent='Overlap';}
   if(p.runUntil>s.time&&instruction!=='hold'){tx=Math.max(tx,homeSpace(p,p.team)+6);ty=p.y+(p.number%2?-5:5);intent='Pass and move';}
   if(recent&&plan.win==='counter'&&['ST','W'].includes(p.role)){tx=Math.max(tx,localBall+16);intent='Counterattack run';}
   if(instruction==='support'){tx=localBall-5;ty=ball.y+(baseY<34?-9:9);intent='Offer support';}
   if(instruction==='hold'){tx=ax+(localBall-52.5)*.22;ty=baseY;intent='Hold position';}
   const freedom=instruction==='hold'?0:instruction==='roam'?1:plan.freedom==='free'?.9:plan.freedom==='disciplined'?.12:.45;
   const radius=freedom*(2+p.offball/22+p.roam*2),anchor={x:tx,y:ty};
   if(radius&&(p.role!=='CB'||instruction==='roam')){
    const candidates=[];for(const dx of [-radius,0,radius])for(const dy of [-radius,0,radius]){const local={x:tx+dx,y:ty+dy},world={x:p.team===0?local.x:105-local.x,y:local.y},space=Math.min(...s.players.filter(q=>q.team!==p.team).map(q=>distance(q,world))),link=owner?distance(owner,world):15,anchorCost=distance(local,anchor)*(freedom>.8?.1+p.discipline/400:.2+p.discipline/200);candidates.push({local,score:Math.min(space,12)*(p.offball+p.decisions)/180-Math.abs(link-15)*.12-anchorCost});}candidates.sort((a,b)=>b.score-a.score);tx=candidates[0].local.x;ty=candidates[0].local.y;if(instruction==='roam')intent='Find a pocket of space';
   }
  }
  if(ours&&owner&&p.id!==owner.id&&p.instruction==='auto'&&support[p.team].includes(p.id)){
   const index=support[p.team].indexOf(p.id),side=index?1:-1,desired={x:localBall-(index?10:4),y:clamp(ball.y+side*11,5,63)};
   const candidates=[];for(const dx of [-4,0,4])for(const dy of [-4,0,4]){const local={x:clamp(desired.x+dx,10,95),y:clamp(desired.y+dy,4,64)},world={x:p.team===0?local.x:105-local.x,y:local.y},space=Math.min(...s.players.filter(q=>q.team!==p.team).map(q=>distance(q,world))),lane=Math.min(...s.players.filter(q=>q.team!==p.team).map(q=>segmentDistance(q,ball,world)));candidates.push({local,score:Math.min(space,12)*(p.offball+p.decisions)/160+Math.min(lane,5)*p.teamwork/100-distance(local,desired)*.4});}candidates.sort((a,b)=>b.score-a.score);tx=candidates[0].local.x;ty=candidates[0].local.y;intent='Offer a passing angle';
  }
  if(ours&&p.id!==owner?.id&&p.role!=='GK'&&s.flight?.receiverId!==p.id&&instruction!=='hold'){
   const line=s.players.filter(q=>q.team!==p.team).map(q=>homeSpace(q,p.team)).sort((a,b)=>b-a)[1]??105;
   tx=Math.min(tx,Math.max(52,localBall,line)-.7+(100-p.offball)/35*(p.roam-.3));
  }
  if(!ours&&p.role!=='GK'&&!['Counterpress','Close the carrier','Cover the press'].includes(intent))tx+=(p.roam-.5)*(100-p.positioning)*.1;
  // Teammates avoid choosing the same patch; targets change at decision intervals.
  if(p.role!=='GK'&&p.id!==owner?.id&&p.id!==recoverers[p.team]){for(const q of s.players.filter(q=>q.team===p.team&&q.id!==p.id)){const reserved=targets.get(q.id)||q.target||q,qx=homeSpace(reserved,p.team),d=Math.hypot(tx-qx,ty-reserved.y);if(d<6){const dx=d>.05?(tx-qx)/d:0,dy=d>.05?(ty-reserved.y)/d:(p.number%2?1:-1);tx+=dx*(6-d)*.6;ty+=dy*(6-d)*.6;}}}
  if(p.id===recoverers[p.team]){tx=clamp(tx,1,104);ty=clamp(ty,1,67);}else if(p.role!=='GK'){tx=clamp(tx,10,96);ty=clamp(ty,3,65);}
  p.target={x:p.team===0?tx:105-tx,y:ty};p.intent=intent;p.thinkAt=s.time+(p.id===owner?.id||s.flight?.receiverId===p.id ? .25 :.65+(100-p.decisions)/65);targets.set(p.id,p.target);
 }
 for(const p of s.players){
  const target=targets.get(p.id),dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),speed=(p.id===owner?.id?p.pace*(.67+(p.dribbling??p.technique)*.0015):p.pace)*(.75+.25*p.energy/100)*Math.min(1,d/1.4),vx=d?dx/d*speed:0,vy=d?dy/d*speed:0;
  const dvx=vx-p.vx,dvy=vy-p.vy,dv=Math.hypot(dvx,dvy),scale=Math.min(1,5*STEP/(dv||1));p.vx+=dvx*scale;p.vy+=dvy*scale;p.x=clamp(p.x+p.vx*STEP,1,104);p.y=clamp(p.y+p.vy*STEP,1,67);
  const exertion=Math.hypot(p.vx,p.vy)/p.pace,pressing=['Counterpress','Close the carrier'].includes(p.intent);p.energy=clamp(p.energy-STEP*(.018+exertion*.025+(pressing?.035:0))*(1.8-p.stamina/100),25,100);
 }
 if(owner){ball.x=clamp(owner.x+direction(owner.team)*.55,.1,104.9);ball.y=owner.y;}
}
function launch(s,p,kind,target,receiver=null){
 if(kind!=='shot'){p.runUntil=s.time+2+p.offball/35;p.thinkAt=0;}
 const restartKind=s.restartOrigin||null;s.restartOrigin=null;s.offsidePhase={team:p.team,candidates:offsidePositions(s,p.team,restartKind),passEvent:s.serial+1};
 const start={x:s.ball.x,y:s.ball.y},d=distance(start,target),speed=kind==='shot'||kind==='kick'?22:kind==='cross'?18:15;
 s.flight={restartKind,mustLeaveArea:restartKind==='goal-kick'||restartKind==='indirect'&&inPenalty(p,p.team),kind,team:p.team,actorId:p.id,receiverId:receiver?.id||null,target:{...target},vx:(target.x-start.x)/d*speed,vy:(target.y-start.y)/d*speed,age:0,duration:d/speed,loft:kind==='kick'?Math.min(16,d*.22):0,contacted:[]};s.ball.owner=null;
 if(kind==='shot')s.stats[p.team].shots++;else s.stats[p.team].passes++;if(kind==='kick')s.stats[p.team].longKicks=(s.stats[p.team].longKicks||0)+1;
 emit(s,kind,p.team,p.id,kind==='shot'?`${p.name} shoots!`:kind==='kick'?`${p.name} kicks long towards ${receiver.name}.`:kind==='cross'?`${p.name} crosses towards ${receiver.name}.`:`${p.name} looks for ${receiver.name}.`,{receiverId:receiver?.id||null,start,end:{...target}});
}
export function dribbleAppetite(p,{pressure,spaceAhead,nearby,safePass}){
 const skill=p.dribbling??p.technique,flair=p.roam||0,decision=p.decisions/100;
 return clamp(.03+skill*.0035+flair*.07+Math.min(spaceAhead,12)*.015-(nearby>1?(nearby-1)*.15*decision:0)-(safePass>8?.12*decision:0)-(spaceAhead<3?.22:0)+(pressure<7?(skill-65)*.003:0),.02,.7);
}
// A lofted keeper kick bypasses ground contacts until it descends. Landing remains
// a spatial collection/loose-ball contest; headers and aerial duels are not modelled.
function keeperKick(s,p,pressure){
 const plan=s.teams[p.team].plan,preference=plan.keeper||'mixed';
 const chance=preference==='short'?.18:preference==='long'?.92:.72;
 if(random(s)>Math.min(.98,chance+(pressure<5?.06:0)))return false;
 const options=s.players.filter(q=>q.team===p.team&&q.role!=='GK'&&distance(p,q)>=32&&distance(p,q)<=72&&(q.x-p.x)*direction(p.team)>25).map(q=>({q,weight:Math.max(.1,2+(q.role==='ST'?2:0)+Math.min(distance(q,nearest(s,1-p.team,q)[0]),12)*.2-Math.abs(distance(p,q)-55)*.055)}));
 if(!options.length)return false;
 let roll=random(s)*options.reduce((n,o)=>n+o.weight,0),chosen=options.at(-1).q;
 for(const o of options){roll-=o.weight;if(roll<=0){chosen=o.q;break;}}
 const error=3+(100-p.pass)*.10+(100-p.technique)*.045+(pressure<5?(100-p.composure)*.06:0);
 const target={x:clamp(chosen.x+chosen.vx*.7+(random(s)-.5)*error,3,102),y:clamp(chosen.y+chosen.vy*.7+(random(s)-.5)*error,3,65)};
 launch(s,p,'kick',target,chosen);return true;
}
function chooseAction(s,p){
 const defenders=nearest(s,1-p.team,p),pressure=defenders[0]?distance(p,defenders[0]):20,toGoal=105-homeSpace(p,p.team),plan=s.teams[p.team].plan;
 if(p.role==='GK'&&keeperKick(s,p,pressure))return;
 if(p.role!=='GK'&&toGoal<27&&random(s)<(toGoal<17?.45:.12)){
  const error=(100-p.finish)/6+toGoal*.18+(pressure<3?3:0),target={x:goalX(p.team)+direction(p.team),y:34+(random(s)-.5)*2*error};launch(s,p,'shot',target);return;
 }
 const candidates=s.players.filter(q=>q.team===p.team&&q.id!==p.id&&distance(p,q)>5&&distance(p,q)<(plan.passing==='direct'?48:plan.passing==='short'?27:36)).map(q=>{
  const d=distance(p,q),progress=(q.x-p.x)*direction(p.team),space=distance(q,nearest(s,1-p.team,q)[0]),lane=Math.min(...defenders.map(def=>segmentDistance(def,p,q)));
  return {q,weight:Math.max(.1,3+progress*(plan.passing==='direct'?.23:plan.passing==='short'?.04:.12)+Math.min(space,12)*.23-Math.max(0,3-lane)*1.4-d*(plan.passing==='short'?.12:.035)+(plan.width==='wide'&&q.role==='W'?2:0)+random(s)*(100-p.decisions)/20)};
 }).sort((a,b)=>b.weight-a.weight);
 const spaceAhead=Math.min(...defenders.map(def=>distance(def,{x:p.x+direction(p.team)*6,y:p.y}))),nearby=defenders.filter(def=>distance(def,p)<5).length;
 const appetite=dribbleAppetite(p,{pressure,spaceAhead,nearby,safePass:candidates[0]?.weight||0});
 if(p.role!=='GK'&&p.instruction!=='hold'&&random(s)<appetite){
  const takingOn=pressure<7;p.dribbleUntil=s.time+1.2+(p.dribbling??p.technique)/90;s.decisionAt=p.dribbleUntil;p.thinkAt=0;s.stats[p.team].carries++;if(takingOn)s.stats[p.team].takeOns++;
  emit(s,takingOn?'dribble':'carry',p.team,p.id,takingOn?`${p.name} takes on the defender.`:`${p.name} drives into the space ahead.`,{start:{x:p.x,y:p.y}});return;
 }
 const crossing=p.role==='W'&&toGoal<30&&Math.abs(p.y-34)>16;
 if(crossing){const receivers=s.players.filter(q=>q.team===p.team&&q.role==='ST').sort((a,b)=>homeSpace(b,p.team)-homeSpace(a,p.team));const q=receivers[0];if(q){launch(s,p,'cross',{x:clamp(q.x+direction(p.team)*3,6,99),y:clamp(q.y+(random(s)-.5)*4,17,51)},q);s.decisionAt=s.time+1;return;}}
 if(candidates.length&&(pressure<5||random(s)<.7||p.role==='GK')){
  const pool=candidates.slice(0,4),total=pool.reduce((n,x)=>n+x.weight,0);let roll=random(s)*total,chosen=pool.at(-1).q;for(const x of pool){roll-=x.weight;if(roll<=0){chosen=x.q;break;}}
  const error=(100-p.pass)/30+(100-p.technique)/70+(pressure<3?(100-p.composure)/18:0)+(plan.tempo==='quick'?(100-p.decisions)/30:0),target={x:clamp(chosen.x+chosen.vx*.35+(random(s)-.5)*error,-2,107),y:clamp(chosen.y+chosen.vy*.35+(random(s)-.5)*error,-2,70)};launch(s,p,'pass',target,chosen);
 }else{s.stats[p.team].carries++;emit(s,'carry',p.team,p.id,`${p.name} carries the ball forward.`,{start:{x:p.x,y:p.y}});s.decisionAt=s.time+.8+random(s)*.8;}
}
function receiveBall(s,p,f){
 if(offsideContact(s,p))return;
 const pressure=distance(p,nearest(s,1-p.team,p)[0]),risk=clamp(.025+(100-p.technique)*.0014+(pressure<3?.14*(100-p.composure)/100:0)+(f.loft?.09:0)+(100-p.energy)*.001,.025,.35);
 if(random(s)<risk){s.flight=null;s.ball.owner=null;s.ball.z=0;s.looseSince=s.time;s.possession=p.team;const dir=direction(p.team),spill=2.5+random(s)*2;s.ball.x=p.x+dir*spill;s.ball.y=p.y+(random(s)-.5)*4;s.stats[p.team].miscontrols=(s.stats[p.team].miscontrols||0)+1;emit(s,'miscontrol',p.team,p.id,`${p.name}'s first touch runs away from him.`,{opponentId:f.actorId});if(s.ball.x<0||s.ball.x>105||s.ball.y<0||s.ball.y>68)boundaryRestart(s,p.team,s.ball);return;}
 own(s,p);p.controlUntil=s.time+.25+(100-p.technique)/100;s.decisionAt=Math.max(s.decisionAt,p.controlUntil);s.stats[p.team].completed++;
 emit(s,'complete',p.team,f.actorId,`${player(s,f.actorId).name} finds ${p.name}, who controls the ball.`,{receiverId:p.id});
}
function deflect(s,f,p,type){
 s.flight=null;s.ball.owner=null;s.ball.z=0;s.ball.x=p.x+(random(s)-.5)*4;s.ball.y=p.y+(random(s)-.5)*4;s.looseSince=s.time;
 emit(s,type,p.team,p.id,`${p.name} blocks the shot.`,{opponentId:f.actorId});if(s.ball.x<0||s.ball.x>105||s.ball.y<0||s.ball.y>68)boundaryRestart(s,p.team,s.ball);
}
function advanceFlight(s){
 const f=s.flight,from={x:s.ball.x,y:s.ball.y};f.age+=STEP;const to={x:from.x+f.vx*STEP,y:from.y+f.vy*STEP};
 if(f.mustLeaveArea&&!inPenalty(to,f.team))f.mustLeaveArea=false;
 const progress=f.loft?clamp(f.age/f.duration,0,1):0;s.ball.z=f.loft?4*f.loft*progress*(1-progress):0;
 for(const p of s.players.slice().sort((a,b)=>distance(a,from)-distance(b,from))){
  if(f.mustLeaveArea||s.ball.z>2||p.id===f.actorId&&f.age<.5||f.contacted.includes(p.id))continue;
  const reach=f.kind==='shot'?(p.role==='GK'?1.5+(p.reflexes??70)*.017:.75):1.35;
  if(segmentDistance(p,from,to)>reach)continue;
  if(f.kind==='shot'){
   if(p.team===f.team)continue;f.contacted.push(p.id);
   if(p.role==='GK'){if(random(s)<clamp(.55+(p.handling??70)*.004,.5,.94)){s.stats[p.team].saves++;own(s,p);emit(s,'save',p.team,p.id,`${p.name} saves and gathers.`,{opponentId:f.actorId});return;}}
   else if(random(s)<.64){deflect(s,f,p,'block');return;}
  }else{
   if(p.team!==f.team&&random(s)>p.tackle/100){f.contacted.push(p.id);continue;}
   if(p.team===f.team)receiveBall(s,p,f);
   else{own(s,p);s.stats[p.team].interceptions++;emit(s,'interception',p.team,p.id,`${p.name} intercepts. ${s.teams[p.team].name} can break.`,{opponentId:f.actorId});}
   return;
  }
 }
 s.ball.x=to.x;s.ball.y=to.y;
 if(to.y<0||to.y>68){boundaryRestart(s,f.team,to);return;}
 if(to.x<0||to.x>105){
  const crossedX=to.x<0?0:105,scoringTeam=to.x<0?1:0,ratio=(crossedX-from.x)/(to.x-from.x),crossY=from.y+(to.y-from.y)*ratio;
  const directOwnRestart=f.restartKind&&scoringTeam!==f.team;
  if(crossY>=30.34&&crossY<=37.66&&(s.ball.z||0)<=2.44&&!['throw-in','indirect'].includes(f.restartKind)&&!directOwnRestart){s.score[scoringTeam]++;emit(s,'goal',scoringTeam,f.actorId,scoringTeam===f.team?`GOAL! ${player(s,f.actorId).name} scores for ${s.teams[scoringTeam].name}.`:`Own goal! ${player(s,f.actorId).name} puts the ball into his own net.`,{ownGoal:scoringTeam!==f.team,start:{...from},end:{x:crossedX,y:crossY}});restart(s,1-scoringTeam,'kickoff');}
  else{if(f.kind==='shot')emit(s,'miss',f.team,f.actorId,`${player(s,f.actorId).name} shoots wide.`);boundaryRestart(s,f.team,to);}return;
 }
 if(f.kind!=='shot'&&(distance(s.ball,f.target)<1.8||f.loft&&f.age>=f.duration||f.age>5)){
  if(f.mustLeaveArea){emit(s,'retake',f.team,f.actorId,'The kick must leave the penalty area. It will be retaken.');restart(s,f.team,f.restartKind,s.restartPoint);return;}
  s.flight=null;s.ball.z=0;s.looseSince=s.time;s.ball.x=clamp(to.x,1,104);s.ball.y=clamp(to.y,1,67);
  emit(s,'loose',f.team,f.actorId,'The ball runs loose.');
 }
}
export function stepSimulation(s){
 if(s.phase==='ended')return s;s.time=Math.min(s.duration,Number((s.time+STEP).toFixed(5)));
 if(s.time>=s.duration){s.phase='ended';s.flight=null;emit(s,'end',null,null,'End of the test passage.');return s;}
 if(s.phase==='restart'){if(s.time>=s.restartUntil){s.phase='play';s.decisionAt=s.time+.6;emit(s,'resume',s.possession,s.ball.owner,'Play resumes.');if(s.pendingRestart)takeRestart(s);}return s;}
 s.stats[s.possession].possession+=STEP;movePlayers(s);
 if(s.flight){advanceFlight(s);return s;}
 const owner=player(s,s.ball.owner);
 if(!owner){const closest=s.players.slice().sort((a,b)=>distance(a,s.ball)-distance(b,s.ball))[0];if(distance(closest,s.ball)<1.6){if(offsideContact(s,closest))return s;own(s,closest);emit(s,'recovery',closest.team,closest.id,`${closest.name} collects the loose ball.`);}return s;}
 if(s.time>=s.immunity){const challenger=nearest(s,1-owner.team,owner).filter(p=>p.role!=='GK')[0];if(challenger&&distance(challenger,owner)<1.45){s.immunity=s.time+.65;if(random(s)<clamp(.25+(challenger.tackle-((owner.dribbling??owner.technique)+owner.technique)/2)*.008,.15,.6)){s.stats[challenger.team].tackles++;own(s,challenger,1.1);emit(s,'tackle',challenger.team,challenger.id,`${challenger.name} tackles ${owner.name} and wins the ball.`,{opponentId:owner.id});return;}}}
 if(s.time>=s.decisionAt)chooseAction(s,owner);return s;
}
export function simulationSnapshot(s){return {time:s.time,phase:s.phase,ball:{...s.ball},players:s.players.map(p=>({id:p.id,team:p.team,number:p.number,name:p.name,role:p.role,x:p.x,y:p.y})),score:[...s.score]};}
