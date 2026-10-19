import {bookingWindow} from './club-events.js?v=1.74.0';
import {assignVenue,inferredVenueId,SEMI_HOSTS} from './venues.js?v=1.89.0';
export const cupAfter=(s,n)=>new Date(Date.parse(s+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
const sameGround=(a,b)=>a===b||['C20','C34'].includes(a)&&['C20','C34'].includes(b);
function dateFree(c,date,f){
 const venue=inferredVenueId(f);
 for(const r of c.schedule){const gap=Math.abs((Date.parse(r.date)-Date.parse(date))/86400000);
  if(r.fixtures.some(x=>[f.home,f.away].includes(x.home)||[f.home,f.away].includes(x.away))&&gap<3)return false;
  if(r.date===date&&r.fixtures.some(x=>sameGround(venue,inferredVenueId(x))))return false;
 }
 if(sameGround(venue,c.clubId))for(const b of c.clubLife?.bookings||[])if(b.status==='accepted'){const w=bookingWindow(b);if(date>=w.start&&date<=w.end)return false;}
 return true;
}
export function insertCupFixture(c,fixture,preferred){assignVenue(fixture);let date=preferred;for(let i=0;!dateFree(c,date,fixture);i++){if(i>180)throw Error('No safe cup fixture date');date=cupAfter(date,1);}let r=c.schedule.find(r=>r.date===date);if(!r){r={date,fixtures:[]};c.schedule.push(r);}r.fixtures.push(fixture);c.schedule.sort((a,b)=>a.date.localeCompare(b.date));return date;}
