import assert from 'node:assert/strict';import fs from 'node:fs';
import {createGame} from './vm-game-harness.mjs';
const results=[];
for(const mode of ['streamlined','in-depth']){
 const {g}=await createGame(125);g.setup('EU051',mode);g.newCareer();g.click('close-owner-welcome');
 let c=g.get().career;c.ui.calendarSimulationMode='all';if(mode==='in-depth')c.managerMedia.enabled=false;
 await g.simulateToDate('1998-09-10');c=g.get().career;
 assert.equal(c.date,'1998-09-10');assert(!g.get().match);assert(c.ui.simulationReport.open);assert(c.ui.simulationReport.results.length>=5);assert.equal(c.ui.simulationReport.results.length,c.reports.length);assert(g.calendarSimulationReportPanel().includes('Results'));
 const fixtureCount=c.schedule.flatMap(r=>r.fixtures).filter(f=>[f.home,f.away].includes(c.clubId)&&f.homeGoals!==null).length;assert.equal(fixtureCount,c.reports.length,'Every simulated managed fixture is reported exactly once');
 const before=c.reports.length;g.click('simulation-report-close');g.checkpointSave();assert(g.load());g.parse(g.backup());c=g.get().career;assert.equal(c.ui.calendarSimulationMode,'all');
 g.change({simulationMode:'any'},'any');assert(c.ui.calendarStopAll,'Stop-for-any includes immediate club proposals');
 // Key decisions can stop and then be delegated for the remainder of this journey.
 c.ui.calendarSimulationMode='key';c.ui.simulationStops={matches:true,transfers:false,injuries:false,board:false,press:false,proposals:false};
 await g.simulateToDate('1998-10-05');c=g.get().career;assert(c.date<'1998-10-05');assert(c.ui.calendarJourney.paused);assert(/Match/.test(c.ui.calendarJourney.reason));assert.equal(c.reports.length,before);
 c.ui.simulationStops.matches=false;c.ui.simulationReport.open=false;await g.simulateToDate('1998-10-05');c=g.get().career;assert.equal(c.date,'1998-10-05');assert(c.reports.length>before);
 g.checkpointSave();assert(g.load());g.parse(g.backup());results.push({mode,matches:g.get().career.reports.length,datesReached:true,keyStopAndDelegate:true,saveReload:true});
 console.log('PASS journey',JSON.stringify(results.at(-1)));
}
fs.writeFileSync(new URL('../review/simulation-journey-1.126.json',import.meta.url),JSON.stringify({passed:true,scope:'Actual game handlers in seeded Node VM, two-month calendar runs; no physical-device claim',results},null,2));
