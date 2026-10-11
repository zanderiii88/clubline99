// Venue identity is independent of the two participating club IDs.
export const WEMBLEY_ID='wembley-fields';
export const SEMI_HOSTS=['C02','C12','C09','C16','C01','C14'];
export function inferredVenueId(f){
 if(!f?.neutral)return f?.home||null;
 if(f.venueId)return f.venueId;
 if(f.competition==='fa-cup'&&f.cupRound===6){
  const ordinal=Number(String(f.tie||'').split('-').at(-1))||0;
  const options=SEMI_HOSTS.filter(id=>![f.home,f.away].includes(id));
  return options[ordinal%options.length]||WEMBLEY_ID;
 }
 return WEMBLEY_ID;
}
export function assignVenue(f){if(f.neutral){f.venueId=inferredVenueId(f);if(f.venueId===WEMBLEY_ID)f.venue='Wembley Fields';}return f;}
export function fixtureVenue(f,league,career=null,homeCapacity=null){
 const id=inferredVenueId(f);
 if(id===WEMBLEY_ID)return {id,name:'Wembley Fields',capacity:80000,neutral:true,national:true};
 const host=league.clubs.find(c=>c.id===id);if(!host)throw Error('Unknown match venue: '+id);
 return {id,name:host.ground,capacity:id===career?.clubId&&homeCapacity!==null?homeCapacity:host.capacity,neutral:!!f.neutral,national:false,host};
}
export function validVenue(f,league){
 if(!f.venueId)return true; // v1.58 fixtures infer a venue without moving any date/result.
 if(!f.neutral)return f.venueId===f.home;
 if(f.venueId===WEMBLEY_ID)return true;
 if(['champions-league','uefa-cup'].includes(f.competition))return league.clubs.some(c=>c.id===f.venueId&&c.foreign);
 return league.clubs.some(c=>c.id===f.venueId)&&![f.home,f.away].includes(f.venueId)&&f.competition==='fa-cup'&&f.cupRound===6;
}
