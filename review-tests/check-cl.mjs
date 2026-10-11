import fs from 'node:fs';import assert from 'node:assert/strict';
import {initialiseCL,progressCL,resolveCL,validCL,clFixtures,clGroupTable,clQualified,clSlots} from '../champions-league.js';
import {initialiseDivisions,validDivisions,makeSchedule,divisionTable} from '../divisions.js';
import {initialiseCup,progressCup,resolveCup,validCup} from '../league-cup.js';
import {initialiseFA,progressFA,resolveFA,validFA} from '../fa-cup.js';
import {fixedSiteError,registerEuropeanSites} from '../fixed-surroundings.js';
import {validVenue} from '../venues.js';
const league=JSON.parse(fs.readFileSync(new URL('../data/league.json',import.meta.url))),foreign=JSON.parse(fs.readFileSync(new URL('../data/europe-cl.json',import.meta.url)));league.clubs.push(...foreign.clubs);league.players.push(...foreign.players);registerEuropeanSites(foreign.clubs);
assert.equal(league.clubs.length,118);assert.equal(league.players.length,2478);assert.equal(new Set(league.players.map(x=>x.id)).size,2478);for(const club of foreign.clubs){assert.equal(league.players.filter(p=>p.clubId===club.id).length,21);assert.equal(fixedSiteError(club,club.stadium),null);}
let seed=29;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32},score=()=>[Math.floor(rng()*4),Math.floor(rng()*4)];const results=[];
for(const year of [1998,1999,2000,2002,2003,2004])for(const me of ['C01','C21']){
 const c={clubId:me,season:year-1997,seasonStart:year+'-08-03',date:year+'-08-03',schedule:[],news:[],balance:1000000,clSeed:'review-'+year+'-'+me,clQualified:['C01','C12','C05','C09'].slice(0,clSlots(year))};initialiseDivisions(c,league);assert(validDivisions(c,league));initialiseCup(c,league);initialiseFA(c,league);initialiseCL(c,league);assert(validCL(c,league));
 let steps=0;while(c.championsLeague.status==='active'||c.leagueCup.status==='active'||c.faCup.status==='active'){
  const day=c.schedule.find(r=>r.fixtures.some(f=>f.homeGoals===null));assert(day);c.date=day.date;
  for(const f of day.fixtures)if(f.homeGoals===null){[f.homeGoals,f.awayGoals]=score();resolveCup(c,f,score,rng);resolveFA(c,f,score,rng);resolveCL(c,f,score,rng);assert(validVenue(f,league));}
  progressCup(c,league);progressFA(c,league);progressCL(c,league);assert(validCL(c,league));assert(validCup(c,league));assert(validFA(c,league));assert(++steps<500);
 }
 const expected=year===1998?85:year<2003?157:125;assert.equal(clFixtures(c).length,expected);assert.equal(c.championsLeague.status,'complete');assert(c.championsLeague.winner);assert.equal(divisionTable(c,league).length,me==='C01'?20:24);
 const before=c.balance;progressCL(c,league);assert.equal(c.balance,before);const rounds=JSON.parse(JSON.stringify(c));assert(validCL(rounds,league));
 for(const f of clFixtures(c))for(const r of c.schedule)for(const x of r.fixtures)if(f.home===x.home||f.home===x.away||f.away===x.home||f.away===x.away){if(f.home===x.home&&f.away===x.away&&f.competition===x.competition&&f.tie===x.tie&&f.leg===x.leg&&f.group===x.group&&f.matchday===x.matchday&&f.date===r.date)continue;assert(Math.abs(Date.parse(f.date)-Date.parse(r.date))>=3,'Rest gap');}
 if([1999,2003].includes(year))assert(c.news.some(n=>n.kind==='competition-format'));
 results.push({year,managed:me,clFixtures:expected,stages:c.championsLeague.stages.map(s=>s.name),winner:c.championsLeague.winner});
}
// Away goals are decided at 90 minutes before extra time, and knockout legs cannot become replays.
const c={schedule:[{date:'1999-03-03',fixtures:[{competition:'champions-league',tie:'test',leg:1,home:'C01',away:'EU004',homeGoals:1,awayGoals:0}]}]};const f={competition:'champions-league',tie:'test',leg:2,legs:2,home:'EU004',away:'C01',homeGoals:2,awayGoals:1};resolveCL(c,f,()=>{throw Error('Must not need extra time');});assert.equal(f.winner,'C01');assert.equal(f.decision,'away goals');
const old={season:1,seasonStart:'1998-08-03',date:'1999-01-01',schedule:[{date:'1998-08-15',fixtures:[{home:'C01',away:'C02',homeGoals:2,awayGoals:1}]}],news:[]};const oldSchedule=JSON.stringify(old.schedule);initialiseCL(old,league);assert.equal(old.championsLeague.status,'deferred');assert.equal(JSON.stringify(old.schedule),oldSchedule);
fs.writeFileSync(new URL('../review/champions-league-engine.json',import.meta.url),JSON.stringify({passed:true,results,checks:['118 clubs / 2478 players','50 foreign squads of 21','12 combined domestic and European seasons','period formats','away goals before ET','minimum rest','venue validation','save roundtrip','late migration','idempotent payments']},null,2));console.log('Champions League engine passed: 12 combined seasons, formats, venues, rest, migration');
