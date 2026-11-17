// Experimental match-lab plans and fictional squad profiles; independent of careers.
export const PRESETS={
 balanced:{label:'Balanced',passing:'mixed',tempo:'normal',width:'normal',press:'normal',freedom:'balanced',win:'hold',loss:'regroup'},
 possession:{label:'Possession',passing:'short',tempo:'patient',width:'wide',press:'normal',freedom:'balanced',win:'hold',loss:'counterpress'},
 counter:{label:'Counterattack',passing:'direct',tempo:'quick',width:'normal',press:'deep',freedom:'balanced',win:'counter',loss:'regroup'},
 press:{label:'High Press',passing:'mixed',tempo:'quick',width:'normal',press:'high',freedom:'balanced',win:'counter',loss:'counterpress'}
};
export const PLAN_OPTIONS={passing:{label:'Passing',values:{short:'Short',mixed:'Mixed',direct:'Direct'}},tempo:{label:'Tempo',values:{patient:'Patient',normal:'Normal',quick:'Quick'}},width:{label:'Width',values:{narrow:'Narrow',normal:'Normal',wide:'Wide'}},press:{label:'Pressing',values:{deep:'Drop deeper',normal:'Normal',high:'Press high'}},freedom:{label:'Freedom',values:{disciplined:'Hold shape',balanced:'Balanced',free:'More freedom'}},win:{label:'After winning it',values:{hold:'Keep possession',counter:'Counter quickly'}},loss:{label:'After losing it',values:{regroup:'Regroup',counterpress:'Counterpress'}}};
export const INSTRUCTIONS={auto:'Follow team plan',hold:'Hold position',support:'Offer support',roam:'Roam into space',forward:'Run beyond',overlap:'Overlap'};
export const PROFILES={balanced:'Balanced squad',technical:'Technical midfield',quick:'Quick counter side',physical:'Physical, limited technique'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function makePlan(key='balanced'){return {...(PRESETS[key]||PRESETS.balanced)};}
export function applyProfile(s,team,key){
 if(!PROFILES[key]||![0,1].includes(team))return false;s.teams[team].profile=key;
 for(const p of s.players.filter(p=>p.team===team)){
  p.base??=Object.fromEntries(['pass','finish','tackle','pace','technique','decisions','composure','offball','positioning','teamwork','discipline','stamina','anticipation','roam'].map(k=>[k,p[k]]));Object.assign(p,p.base);
  const add=(k,n)=>{p[k]=clamp(p[k]+n,k==='pace'?3.5:25,k==='pace'?6.5:95);};
  if(key==='technical'){add('pass',p.role==='CM'?16:8);add('technique',15);add('composure',12);add('decisions',10);add('stamina',-7);}
  if(key==='quick'){add('pace',.7);add('offball',12);add('anticipation',8);add('pass',-8);add('stamina',6);add('positioning',6);}
  if(key==='physical'){add('tackle',12);add('stamina',15);add('teamwork',8);add('discipline',9);add('pass',-18);add('technique',-18);add('decisions',-9);add('pace',-.25);}
 }
 return true;
}
export function assessPlan(s,team=0){
 const squad=s.players.filter(p=>p.team===team&&p.role!=='GK'),plan=s.teams[team].plan;
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
