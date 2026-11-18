import {attributes} from './player-attributes.js?v=1.74.0';
import {assignSquad} from './squad-selection.js?v=1.87.0';
// Experimental match-lab plans and fictional squad profiles; independent of careers.
export const PRESETS={
 balanced:{label:'Balanced',fullbacks:'balanced',keeper:'mixed',passing:'mixed',tempo:'normal',width:'normal',press:'normal',freedom:'balanced',win:'hold',loss:'regroup'},
 possession:{label:'Possession',fullbacks:'balanced',keeper:'short',passing:'short',tempo:'patient',width:'wide',press:'normal',freedom:'balanced',win:'hold',loss:'counterpress'},
 counter:{label:'Counterattack',fullbacks:'stay',keeper:'long',passing:'direct',tempo:'quick',width:'normal',press:'deep',freedom:'balanced',win:'counter',loss:'regroup'},
 press:{label:'High Press',fullbacks:'balanced',keeper:'mixed',passing:'mixed',tempo:'quick',width:'normal',press:'high',freedom:'balanced',win:'counter',loss:'counterpress'}
};
export const PLAN_OPTIONS={fullbacks:{label:'Fullbacks',values:{stay:'Stay back',balanced:'Balanced · check cover',attack:'Overlap · accept risk'}},keeper:{label:'Goalkeeper distribution',values:{mixed:'Vary · favour long',short:'Play short',long:'Kick long'}},passing:{label:'Passing',values:{short:'Short',mixed:'Mixed',direct:'Direct'}},tempo:{label:'Tempo',values:{patient:'Patient',normal:'Normal',quick:'Quick'}},width:{label:'Width',values:{narrow:'Narrow',normal:'Normal',wide:'Wide'}},press:{label:'Pressing',values:{deep:'Drop deeper',normal:'Normal',high:'Press high'}},freedom:{label:'Freedom',values:{disciplined:'Hold shape',balanced:'Balanced',free:'More freedom'}},win:{label:'After winning it',values:{hold:'Keep possession',counter:'Counter quickly'}},loss:{label:'After losing it',values:{regroup:'Regroup',counterpress:'Counterpress'}}};
export const INSTRUCTIONS={auto:'Follow team plan',hold:'Hold position',support:'Offer support',roam:'Roam into space',forward:'Run beyond',overlap:'Overlap'};
export const STRENGTHS={elite:'Top-flight contender',standard:'Mid-level side',lower:'Lower-division side'};
// Fictional lab tiers: the shift compounds across every phase of play.
// Keep a professional skill range instead of turning every attribute into an extreme.
const QUALITY={elite:6,standard:0,lower:-6};
export const PROFILES={balanced:'Balanced squad',technical:'Technical midfield',quick:'Quick counter side',physical:'Physical, limited technique'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function makePlan(key='balanced'){return {...(PRESETS[key]||PRESETS.balanced)};}
export function applyStrength(s,team,key){if(!STRENGTHS[key]||![0,1].includes(team))return false;s.teams[team].strength=key;return applyProfile(s,team,s.teams[team].profile);}
export function applyProfile(s,team,key){
 if(!PROFILES[key]||![0,1].includes(team))return false;s.teams[team].profile=key;
 for(const p of s.players.filter(p=>p.team===team)){
  p.base??=Object.fromEntries(['pass','dribbling','finish','tackle','pace','technique','decisions','composure','offball','positioning','teamwork','discipline','stamina','anticipation','handling','reflexes','heading','strength','acceleration','agility','roam'].map(k=>[k,p[k]]));Object.assign(p,p.base);
  const add=(k,n)=>{p[k]=clamp(p[k]+n,k==='pace'?3.5:25,k==='pace'?6.5:95);};
  const shift=s.teams[team].ratingShift;
  const quality=shift?0:QUALITY[s.teams[team].strength]||0;
  for(const attr of ['pass','dribbling','finish','tackle','technique','decisions','composure','offball','positioning','teamwork','discipline','stamina','anticipation','handling','reflexes','heading','strength','acceleration','agility'])add(attr,quality);add('pace',quality*.018);
  if(shift){
   for(const attr of ['pass','technique','dribbling','finish','decisions','offball','composure'])add(attr,shift.attack);
   for(const attr of ['tackle','positioning','anticipation','handling','reflexes'])add(attr,shift.defence);
  }
  if(key==='technical'){add('pass',p.role==='CM'?16:8);add('technique',15);add('dribbling',12);add('composure',12);add('decisions',10);add('stamina',-7);}
  if(key==='quick'){add('pace',.7);add('offball',12);add('dribbling',6);add('anticipation',8);add('pass',-8);add('stamina',6);add('positioning',6);}
  if(key==='physical'){add('tackle',12);add('stamina',15);add('teamwork',8);add('discipline',9);add('pass',-18);add('technique',-18);add('dribbling',-10);add('decisions',-9);add('pace',-.25);}
 }
 return true;
}
// Centre the club ratings on this pairing. A higher standard on both sides
// does not by itself inflate every lab player's attributes.
export function setRatedClubs(s,clubs,homeSide=null,rosterBased=false){
 if(!Array.isArray(clubs)||clubs.length!==2||!clubs.every(club=>club?.id&&club.name
  &&[club.attack,club.defence].every(rating=>Number.isFinite(rating)&&rating>=0&&rating<=100)))return;
 for(const [team,club] of clubs.entries()){
  const opponent=clubs[1-team],home=team===homeSide;
  const edge=key=>rosterBased?0:clamp((club[key]-opponent[key])*.19,-4,4);
  Object.assign(s.teams[team],{
   name:club.name,clubId:club.id,attack:club.attack,defence:club.defence,
   rosterBased,venue:home?'home':homeSide===1-team?'away':'neutral',
   ratingShift:{attack:edge('attack')+(home?.65:0),defence:edge('defence')+(home?.25:0)}
  });
 }
}
export const LAB_FORMATIONS={
 '4-4-2':[[5,34,'GK'],[25,9,'LB'],[23,25,'CB'],[23,43,'CB'],[25,59,'RB'],[47,8,'LW'],[45,26,'CM'],[45,42,'CM'],[47,60,'RW'],[68,26,'ST'],[68,42,'ST']],
 '4-3-3':[[5,34,'GK'],[25,9,'LB'],[23,25,'CB'],[23,43,'CB'],[25,59,'RB'],[48,19,'CM'],[39,34,'DM'],[48,49,'CM'],[64,9,'LW'],[69,34,'ST'],[64,59,'RW']],
 '3-5-2':[[5,34,'GK'],[23,19,'CB'],[21,34,'CB'],[23,49,'CB'],[38,7,'LB'],[49,22,'CM'],[40,34,'DM'],[49,46,'CM'],[38,61,'RB'],[68,25,'ST'],[68,43,'ST']]
};
export const labShape=key=>Object.hasOwn(LAB_FORMATIONS,key)?key:'4-4-2';
const labRoles={GK:'GK',LB:'FB',RB:'FB',CB:'CB',LW:'W',RW:'W',CM:'CM',DM:'CM',AM:'CM',ST:'ST'};
export const labAnchor=(shape,slot)=>LAB_FORMATIONS[labShape(shape)][slot];
export const labRole=pos=>labRoles[pos];
const fit=(p,pos)=>pos===p.primary?p.overall:p.positions?.[pos]??0;
export function labLineup(pool,shape='4-4-2'){
 const lineupSlots=LAB_FORMATIONS[labShape(shape)].map(([, ,pos])=>pos);
 if(!Array.isArray(pool)||pool.length<16)return null;
 const byId=new Map(pool.map(p=>[p.id,p]));
 const starters=assignSquad(pool,lineupSlots,fit).map(id=>byId.get(id));
 if(starters.some(p=>!p))return null;
 const used=new Set(starters);
 const reserves=[];
 for(const positions of [['GK'],['CB','LB','RB'],['CM','DM','AM'],['LW','RW'],['ST']]){
  const score=p=>Math.max(...positions.map(pos=>fit(p,pos)));
  const remaining=pool.filter(p=>!used.has(p)&&(positions[0]==='GK')===(p.primary==='GK'));
  const chosen=remaining.sort((a,b)=>score(b)-score(a)||b.overall-a.overall||a.id.localeCompare(b.id))[0];
  if(!chosen)return null;
  used.add(chosen);reserves.push(chosen);
 }
 return [...starters,...reserves];
}
export function applyLabLineups(s,lineups){
 for(const [team,lineup] of lineups.entries()){
  const players=s.players.filter(p=>p.team===team);
  const shape=LAB_FORMATIONS[labShape(s.teams[team].shape)];
  for(const [index,p] of players.entries()){
   const source=lineup[index],a=attributes(source),keeper=source.primary==='GK';
   const pos=shape[index]?.[2]??source.primary;
   const position=keeper?a.Positioning:(a.Positioning+fit(source,pos))/2;
   const mapped={
    pass:keeper?a.Kicking:a.Passing,technique:keeper?a.Handling:(a.Passing+a.Dribbling)/2,
    dribbling:keeper?35:a.Dribbling,finish:keeper?32:a.Finishing,tackle:keeper?35:a.Tackling,
    heading:keeper?40:a.Heading,handling:keeper?a.Handling:35,reflexes:keeper?a.Reflexes:35,
    positioning:position,anticipation:keeper?(a.Reflexes+a.Positioning)/2:a.Interceptions,
    stamina:a.Stamina,strength:a.Strength,agility:a.Agility,acceleration:(a.Pace+a.Agility)/2,
    pace:3+a.Pace*.03
   };
   for(const [key,value] of Object.entries(mapped))p.base[key]=p.base[key]*.35+value*.65;
   Object.assign(p,{name:source.name,rosterId:source.id,shirtNumber:source.number??p.number,
    energy:clamp(source.fitness??100,25,100)});
   if(p.bench)p.role=labRoles[source.primary]??p.role;
  }
 }
}
export function assessPlan(s,team=0){
 const squad=s.players.filter(p=>p.team===team&&p.role!=='GK'&&!p.sentOff&&!p.bench&&!p.subbedOff&&!p.injuredOff),plan=s.teams[team].plan;
 const avg=(key,players=squad)=>players.reduce((n,p)=>n+(key==='pace'?clamp((p.pace-3)*25,0,100):p[key]),0)/(players.length||1);
 const demands=[['decisions',1],['teamwork',1],['positioning',.5]];
 if(plan.passing==='short')demands.push(['pass',2],['technique',1.5],['composure',1]);
 if(plan.press==='high'||plan.loss==='counterpress')demands.push(['stamina',2],['teamwork',1],['pace',1]);
 if(plan.win==='counter')demands.push(['pace',2],['offball',1.5],['anticipation',1]);
 if(plan.freedom==='free')demands.push(['decisions',1.5],['offball',1.5]);
 let score=demands.reduce((n,[k,w])=>n+avg(k)*w,0)/demands.reduce((n,[,w])=>n+w,0);
 if(plan.passing==='short')score=Math.min(score,(avg('pass')+avg('technique')+avg('composure'))/3+3);score=Math.round(score);
 const reasons=[];const explain=(text,key)=>reasons.push(`${text} (${Math.round(avg(key))}).`);
 if(plan.passing==='short'){explain(avg('pass')>=73?'Passing suits a short game':'Passing accuracy may limit a short game','pass');const backs=squad.filter(p=>['CB','FB'].includes(p.role));if(avg('composure',backs)<68)reasons.push('The back line may struggle when pressed.');}
 if(plan.press==='high'||plan.loss==='counterpress')explain(avg('stamina')>=75?'Stamina supports repeated pressing':'Repeated pressing may tire this side','stamina');
 if(plan.win==='counter')explain(avg('pace')>=65?'Pace gives the counterattack an outlet':'Limited pace may slow the counterattack','pace');
 if(plan.freedom==='free')explain(avg('decisions')>=72?'Decision-making supports more freedom':'Extra freedom may leave gaps','decisions');
 if(!reasons.length)explain('Teamwork is the foundation of this balanced plan','teamwork');
 const energy=squad.reduce((n,p)=>n+p.energy,0)/squad.length;if(energy<82)reasons.push('Current energy is falling: consider easing the press.');
 return {score:Math.round(score),label:score>=73?'Suited':score>=62?'Mixed fit':'Demanding',reasons:reasons.slice(0,3),energy:Math.round(energy)};
}
