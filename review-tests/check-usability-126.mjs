import assert from 'node:assert/strict';import fs from 'node:fs';
import {createGame} from './vm-game-harness.mjs';
import {cycleStadiumField,stadiumChoice} from '../stadium-cycling.js';
import {constructionQuote,startConstruction,advanceConstruction} from '../construction.js';
import {STANDS,defaultLayout} from '../stadium-model.js';
const summaries=[];
for(const mode of ['streamlined','in-depth']){
 const {g}=await createGame(126);g.setup('C13',mode);g.newCareer();g.click('close-owner-welcome');let {career:c,source}=g.get();
 assert(!g.calendarView().includes('data-simulation-mode'),'Choices must not appear above the calendar');const date=c.date;
 g.requestCalendarAdvance('1998-09-10');assert(g.calendarAdvancePanel().includes('data-simulation-mode'));assert.equal(c.date,date,'Opening choices cannot advance time');g.click('calendar-cancel-advance');assert.equal(g.calendarAdvancePanel(),'');
 g.click('open-designer');assert(g.stadiumEditor().includes('data-action="stadium-cycle"'));assert(!g.stadiumEditor().includes('data-stadium-field="stand"'));g.click('blueprint-clear');g.click('toggle-stand',{id:'N3'});g.click('toggle-stand',{id:'N4'});
 const before=g.stadiumPreview(),roofs=[before.sections.N3.roof,before.sections.N4.roof],finishes=[before.sections.N3.finish,before.sections.N4.finish],cash=c.balance;
 g.click('stadium-cycle',{field:'stand',direction:'1'});let draft=g.stadiumPreview();assert.equal(draft.sections.N3.stand,draft.sections.N4.stand);assert.deepEqual([draft.sections.N3.roof,draft.sections.N4.roof],roofs);assert.deepEqual([draft.sections.N3.finish,draft.sections.N4.finish],finishes);assert.equal(c.balance,cash);
 const arbitrary=structuredClone(c.stadium),id='N3';arbitrary.sections[id].stand=Object.keys(STANDS).at(-1);assert.equal(cycleStadiumField(arbitrary,[id],'stand',1),Object.keys(STANDS)[0]);assert.equal(cycleStadiumField(arbitrary,[id],'stand',-1),Object.keys(STANDS).at(-1));assert.equal(cycleStadiumField(arbitrary,[],'stand',1),null);assert.equal(cycleStadiumField(arbitrary,[id],'unknown',1),null);
 const plan=structuredClone(c.stadium);plan.sections.N3.stand='d2';plan.sections.N3.roof='full';const q=constructionQuote(c,source.clubs.find(t=>t.id===c.clubId),plan);assert(q.days>=180,'New double-tier structure must take months');assert(q.opens>'1999-01-01');
 const roofOnly=structuredClone(c.stadium);roofOnly.sections.N3.roof=roofOnly.sections.N3.roof==='truss'?'full':'truss';assert(constructionQuote(c,source.clubs.find(t=>t.id===c.clubId),roofOnly).days<q.days);
 const club=source.clubs.find(t=>t.id===c.clubId),projectCareer=structuredClone(c);projectCareer.balance=1e8;assert.equal(startConstruction(projectCareer,club,plan),null);const paid=projectCareer.balance;assert.equal(advanceConstruction(projectCareer),0);projectCareer.date=q.opens;assert.equal(advanceConstruction(projectCareer),1);assert.equal(projectCareer.balance,paid);assert.equal(projectCareer.stadium.sections.N3.stand,'d2');
 g.click('cancel-stadium');c.ui.calendarSimulationMode='all';g.requestCalendarAdvance('1998-09-10');await g.confirmCalendarAdvance();c=g.get().career;assert.equal(c.date,'1998-09-10');assert(c.ui.simulationReport.results.length>0);assert(c.ui.simulationReport.league.position>=1);assert(g.calendarSimulationReportPanel().includes('points'));assert(!g.calendarSimulationReportPanel().includes('<details open'));
 // Stop while an asynchronous target run yields; retain completed days/results and clear the target.
 const oldDate=c.date,oldReports=c.reports.length,target='1999-01-10';g.click('simulation-report-close');const pending=g.simulateToDate(target);queueMicrotask(()=>queueMicrotask(()=>g.click('calendar-stop')));await pending;c=g.get().career;
 assert(c.date>=oldDate&&c.date<target);assert.equal(c.ui.calendarJourney,null);assert(c.ui.simulationReport.stopped);assert(c.reports.length>=oldReports);assert(!g.calendarProgressScreen().includes('matchOverlay'));assert(!g.calendarProgressScreen().includes('Pause'));
 g.click('simulation-report-close');g.checkpointSave();assert(g.load());c=g.get().career;assert.equal(c.ui.calendarJourney,null);g.parse(g.backup());
 if(mode==='streamlined')await g.streamlinedContinue();else g.advance();assert.equal(g.get().career.ui.calendarJourney,null,'Normal Continue must not resurrect a stopped target');assert(g.get().career.date<target);
 summaries.push({mode,doubleTierDays:q.days,doubleTierOpens:q.opens,calendarResults:c.ui.simulationReport.results.length,stopClearsTarget:true,saveReload:true});console.log('PASS usability126',JSON.stringify(summaries.at(-1)));
}
fs.writeFileSync(new URL('../review/usability-1.126.json',import.meta.url),JSON.stringify({passed:true,scope:'Actual handlers in Node VM; arrow selection, quotes/completion, calendar request, target run, true Stop and saved state',summaries},null,2));
