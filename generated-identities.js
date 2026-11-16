// Fictional players may borrow a roster template's attributes, never its identity.
export const generatedIdentity=id=>/^(?:FREE-.+-\d+-\d+|WORLD-\d{4}-.+-\d+)$/.test(id);
export function clearTemplateIdentity(p){delete p.realName;delete p.parodyName;return p;}
const first=['Adam','Lewis','Rory','Jack','Tom','Daniel','Ben','Ryan','Callum','Jamie','Rhys','Euan','Sam','Aaron','Owen','Alex','Joel','Harry','Cameron','Nathan'];
const last=['Bennett','Radford','Lennox','Murray','Grant','Calder','Harwood','Ashford','Morrow','Keating','Walsh','Reid','Walker','Mercer','Fraser','Clarke','Taylor','Brooks','Devlin','Parker'];
function replacementName(id,used){let hash=2166136261;for(const ch of id)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;for(let i=0;;i++){const n=hash+i,name=first[n%first.length]+(i>=400?' '+first[Math.floor(n/400)%first.length][0]+'.':'')+' '+last[Math.floor(n/first.length)%last.length]+(i>=8000?' '+Math.floor(i/8000):'');if(!used.has(name))return name;}}
export function repairGeneratedIdentities(c,league){
 const used=new Set(league.players.filter(p=>!generatedIdentity(p.id)).flatMap(p=>[p.name,p.realName,p.parodyName].filter(Boolean))),byId=new Map(league.players.map(p=>[p.id,p]));
 for(const saved of c.generatedPlayers||[]){
  if(!generatedIdentity(saved.id))continue;
  const live=byId.get(saved.id),aliases=[saved.realName,saved.parodyName,live?.realName,live?.parodyName].filter(Boolean);
  // Prefer the original fictional name still held in the save. If an older
  // rollover overwrote it, give this stable ID a deterministic fictional name.
  let name=saved.name;if(aliases.includes(name))name=replacementName(saved.id,used);
  saved.name=name;clearTemplateIdentity(saved);if(live){live.name=name;clearTemplateIdentity(live);}used.add(name);
 }
}
