import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createGame} from './vm-game-harness.mjs';
const summaries=[];
for(const mode of ['streamlined','in-depth']){
 const {g,mods,dir}=await createGame(1114);g.setup('C01',mode);g.newCareer();g.click('close-owner-welcome');let c=g.get().career;const target=structuredClone(c.stadium);for(const id of ['N1','S1'])target.sections[id].finish=target.sections[id].finish==='brick'?'metal':'brick';g.stadiumDraft(target);g.click('save-stadium-blueprint');g.click('choose-stadium-phase',{phase:'N'});g.click('confirm-stadium-build');let second=false,matches=0,checkpoints=0,steps=0;
 while(g.get().career.date<'1998-08-20'||g.get().match||g.get().career.matchday){assert(++steps<500);c=g.get().career;const m=g.get().match;
  const before=JSON.stringify(c);assert(g.matchWeekPanel().includes('Match-week planner'));assert(g.leagueNewsPanel().includes('League newsroom'));g.constructionStatus();assert(g.seasonStoriesPanel().includes('Season stories'));g.stadiumBlueprint();g.stadiumVisualControls();g.stadiumComparisonScene(g.get().source.clubs.find(t=>t.id===c.clubId),g.stadiumPreview()||c.stadium);assert.equal(JSON.stringify(c),before);
  if(m){assert.equal(m.fixtureDate,c.date);if(m.phase==='choice'){g.auto();g.beginMatch('simulate');matches++;}else if(m.phase==='report')g.closeMatchReport();continue;}
  if(c.matchday){g.click('matchday-continue');continue;}
  if(!c.construction.length&&!second){g.stadiumDraft(c.stadium);g.click('restore-stadium-blueprint');g.click('commit-stadium');g.click('confirm-stadium-build');assert.equal(Object.keys(c.construction[0].sections).join(),'S1');second=true;g.checkpointSave();assert(g.load());g.parse(g.backup());checkpoints++;continue;}
  if(g.firstWeekEventPending()){g.click('first-week-ack');continue;}
  const press=g.mediaToStop();if(press){g.click('media-reply',{key:press.key,choice:'none'});g.click('media-close');continue;}
  const board=g.calendarBoardReview();if(board){g.click('acknowledge-board-review',{id:board.id});continue;}
  if(g.pending()){g.click(g.pending().round.selections?'cl-draw-end':'draw-event-skip');g.click('draw-event-finish');continue;}
  const offer=c.offers.find(o=>['new','counter'].includes(o.status));if(offer){g.click('reject-offer',{id:offer.id,club:offer.clubId});continue;}
  const booking=c.clubLife.bookings.find(b=>b.status==='offered');if(booking){g.click('booking-response',{id:booking.id,accept:'false'});continue;}
  const story=c.clubLife.stories.find(s=>s.status==='pending');if(story){const def=mods.get(path.join(dir,'club-events.js')).namespace.CLUB_STORIES.find(x=>x.id===story.definition),choice=def.choices.find(x=>(x.effects.cash||0)>=0);if(choice){g.click('story-choice',{id:story.id,choice:choice.id});continue;}}
  const decision=g.streamPending()[0];if(decision){g.click('stream-open-decision',{key:decision.key});g.click(decision.kind==='injury'?'stream-review-team':decision.kind==='offer'?'stream-decline-offer':'stream-dismiss');continue;}
  if(g.get().outcomeCard){g.click('outcome-close');continue;}
  if(c.date===g.nextFixture()?.date)g.advance();else await g.advanceToDate(new Date(Date.parse(c.date+'T12:00:00Z')+86400000).toISOString().slice(0,10));
 }
 c=g.get().career;assert(second);assert.equal(c.stadiumProjects.length,2);assert.equal(c.construction.length,0);assert(matches>=1);g.checkpointSave();assert(g.load());g.parse(g.backup());checkpoints++;assert(g.get().career.stadiumBlueprint);assert(/first recorded competitive (appearance|goal)/.test(g.seasonStoriesPanel()));summaries.push({mode,matches,steps,checkpoints,date:c.date,projects:c.stadiumProjects.length});console.log('PASS integrated:',JSON.stringify(summaries.at(-1)));
}
fs.writeFileSync(new URL('../review/integrated-stadium-1.118.json',import.meta.url),JSON.stringify({passed:true,environment:'Seeded VM with real handlers, DOM/timer stubs; code-level integration, no browser session',summaries},null,2));
