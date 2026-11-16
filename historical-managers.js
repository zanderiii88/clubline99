// Verified starting appointments for the 1998-99 English Premier and both playable Scottish divisions.
// Later appointments follow the simulated career, not a forced replay of history.
export const HISTORICAL_MANAGERS={
 C01:['Arsène Wenger','FRA'],C02:['John Gregory','ENG'],C03:['Roy Hodgson','ENG'],C04:['Alan Curbishley','ENG'],C05:['Gianluca Vialli','ITA'],C06:['Gordon Strachan','SCO'],C07:['Jim Smith','ENG'],C08:['Walter Smith','SCO'],C09:['George Graham','SCO'],C10:["Martin O'Neill",'NIR'],C11:['Roy Evans & Gérard Houllier','ENG'],C12:['Alex Ferguson','SCO'],C13:['Bryan Robson','ENG'],C14:['Kenny Dalglish','SCO'],C15:['Dave Bassett','ENG'],C16:['Danny Wilson','NIR'],C17:['Dave Jones','ENG'],C18:['Christian Gross','SUI'],C19:['Harry Redknapp','ENG'],C20:['Joe Kinnear','IRL'],
 EU001:['Jozef Vengloš','SVK'],SC01:['Dick Advocaat','NED'],EU051:['Alex Miller','SCO'],SC02:['Jocky Scott','SCO'],SC03:['Tommy McLean','SCO'],SC04:['Bert Paton','SCO'],SC05:['Jim Jefferies','SCO'],SC06:['Harri Kampman','FIN'],EU052:['Bobby Williamson','SCO'],EU053:['Paul Sturrock','SCO'],
 SC11:['Alex McLeish','SCO'],SC12:['Alex Totten','SCO'],SC13:['Gordon Dalziel','SCO'],SC14:['Alex MacDonald','SCO'],SC15:['Tony Fitzpatrick','SCO'],SC16:['Billy Stark','SCO'],SC17:['Ian McCall','SCO'],SC18:['Jimmy Nicholl','NIR'],SC19:['Colin Miller','CAN'],SC20:['Campbell Money','SCO']
};
const translations=new WeakMap();
export function applyHistoricalManagers(c,enabled=true){
 const w=c?.managerWorld;if(!w)return;
 for(const [clubId,[name,nationality]] of Object.entries(HISTORICAL_MANAGERS)){
  const m=w.people['M-'+clubId];if(!m||m.id===w.jobs[c.clubId])continue;
  m.parodyName??=m.name;m.realName=name;m.historical=true;m.nationality=nationality;m.name=enabled?name:m.parodyName;
 }
 const old=translations.get(w);if(old?.enabled===enabled)return;
 const own=w.people[w.jobs[c.clubId]]?.name,lookup=new Map();
 for(const m of Object.values(w.people))if(m.realName&&m.parodyName){const desired=enabled?m.realName:m.parodyName;for(const name of [m.realName,m.parodyName])if(name!==own)lookup.set(name,desired);}
 const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=lookup.size?new RegExp('(?<![\\p{L}\\p{N}])(?:'+[...lookup.keys()].sort((a,b)=>b.length-a.length).map(esc).join('|')+')(?![\\p{L}\\p{N}])','gu'):null;
 translations.set(w,{enabled,lookup,pattern});
}
export function managerNameText(c,value,enabled=true){const w=c?.managerWorld;if(!w)return String(value??'');if(translations.get(w)?.enabled!==enabled)applyHistoricalManagers(c,enabled);const t=translations.get(w);return t?.pattern?String(value??'').replace(t.pattern,n=>t.lookup.get(n)):String(value??'');}
