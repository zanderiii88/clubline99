import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createGame} from './vm-game-harness.mjs';

const buildLabel=JSON.parse(fs.readFileSync(new URL('../version.json',import.meta.url))).version.split('.').slice(0,2).join('.');
const scenarios=[['C45','in-depth'],['C01','in-depth'],['EU051','in-depth'],['SC11','streamlined']].filter(([id])=>!process.env.CLUBLINE_TEST_CLUB||id===process.env.CLUBLINE_TEST_CLUB);
const summaries=[];
for(const [id,mode] of scenarios){
 const {g,mods,dir}=await createGame(196+[...id].reduce((n,ch)=>n+ch.charCodeAt(0),0));
 g.setup(id,mode);g.newCareer();g.click('close-owner-welcome');
 for(let cycle=0;cycle<2;cycle++){
 const opening=g.get().career.balance;
 const counts={matches:0,draws:0,firstWeek:0,board:0,declinedOffers:0,declinedBookings:0,stories:0,decisions:0,media:0,checkpoints:0};
 let month='',lastDate=g.get().career.date,stuck=0,steps=0;
 const checkpoint=()=>{const b=g.backup();fs.mkdirSync(path.join(dir,'review','checkpoints'),{recursive:true});fs.writeFileSync(path.join(dir,'review','checkpoints',id+'.json'),JSON.stringify({backup:b,counts,opening}));g.parse(b);g.checkpointSave();assert(g.load(),'Device save reload');g.parse(g.backup());counts.checkpoints++;console.log('Checkpoint',id,mode,g.get().career.date,'matches',counts.matches);};
 while(!g.seasonReady()||g.get().match||g.get().career.matchday){
  let {career:c,match}=g.get();assert(c.date>=lastDate,'Calendar must move forwards');
  stuck=c.date===lastDate?stuck+1:0;lastDate=c.date;
  assert(stuck<45,`Stalled ${id}/${mode} ${c.date}: ${JSON.stringify({match:match?.phase,matchday:c.matchday,pending:g.pending()?.competition,first:g.firstWeekEventPending(),board:g.calendarBoardReview(),decisions:g.streamPending()})}`);
  assert(++steps<5000,'Season step bound');
  if(c.date.slice(0,7)!==month&&!match){month=c.date.slice(0,7);checkpoint();c=g.get().career;}
  if(match){
   assert.equal(match.fixtureDate,c.date,'Managed fixtures must not be skipped');
   if(match.phase==='choice'){g.auto();assert(g.validLineup());g.beginMatch('simulate');assert.equal(g.get().match.phase,'report');counts.matches++;}
   else if(match.phase==='report')g.closeMatchReport();
   else assert.fail('Unexpected live match phase '+match.phase);
   continue;
  }
  if(c.matchday){g.click('matchday-continue');continue;}
  if(g.firstWeekEventPending()){g.click('first-week-ack');counts.firstWeek++;continue;}
  const press=g.mediaToStop();if(press){g.click('media-reply',{key:press.key,choice:'none'});g.click('media-close');counts.media++;continue;}
  const board=g.calendarBoardReview();if(board){g.click('acknowledge-board-review',{id:board.id});counts.board++;continue;}
  if(g.pending()){g.click(g.pending().round.selections?'cl-draw-end':'draw-event-skip');g.click('draw-event-finish');counts.draws++;continue;}
  const offer=c.offers.find(o=>['new','counter'].includes(o.status));if(offer){g.click('reject-offer',{id:offer.id,club:offer.clubId});assert.equal(offer.status,'rejected');counts.declinedOffers++;continue;}
  const booking=c.clubLife.bookings.find(b=>b.status==='offered');if(booking){g.click('booking-response',{id:booking.id,accept:'false'});assert.equal(booking.status,'declined');counts.declinedBookings++;continue;}
  const story=c.clubLife.stories.find(s=>s.status==='pending');if(story){const def=mods.get(path.join(dir,'club-events.js')).namespace.CLUB_STORIES.find(x=>x.id===story.definition),choice=def.choices.find(x=>(x.effects.cash||0)>=0);if(!choice){g.advance();continue;}g.click('story-choice',{id:story.id,choice:choice.id});assert.equal(story.status,'resolved');counts.stories++;continue;}
  const decision=g.streamPending()[0];if(decision){g.click('stream-open-decision',{key:decision.key});g.click(decision.kind==='injury'?'stream-review-team':decision.kind==='offer'?'stream-decline-offer':'stream-dismiss');assert.equal(decision.status,'done');counts.decisions++;continue;}
  if(g.get().outcomeCard){g.click('outcome-close');continue;}
  if(c.date===g.nextFixture()?.date)g.advance();
  else if(mode==='streamlined')await g.streamlinedContinue();
  else await g.advanceToDate(new Date(Date.parse(c.date+'T12:00:00Z')+14*86400000).toISOString().slice(0,10));
 }
 let {career:c}=g.get();
 assert(c.schedule.every(r=>r.fixtures.every(f=>f.homeGoals!==null&&f.awayGoals!==null)),'All scheduled fixtures completed');
 assert(counts.matches>30);const managed=c.schedule.flatMap(r=>r.fixtures).filter(f=>[f.home,f.away].includes(c.clubId));assert.equal(managed.length,counts.matches,'Every managed fixture must run exactly once');const payrollDates=c.news.filter(n=>n.kind==='wages').map(n=>n.date);assert.equal(new Set(payrollDates).size,payrollDates.length,'No duplicate Monday payroll');checkpoint();assert(g.seasonReady());
 // Opening and reopening the review cannot pay any prizes a second time.
 c=g.get().career;const balance=c.balance;
 g.click('season-summary');g.seasonReviewOverlay();g.click('season-review-close');g.click('season-summary');g.seasonReviewOverlay();assert.equal(c.balance,balance);
 const end=c.date,oldSeason=c.season,oldAge=g.get().source.players[0].age;
 g.click('season-review-continue');c=g.get().career;
 assert.equal(c.season,oldSeason+1,'Full game rollover must reach season two');
 assert(g.nextFixture(),'New season has a managed fixture');assert(g.nextFixture().date>=c.date);
 assert.equal(g.get().source.players[0].age,oldAge+1);checkpoint();
 const wageRows=c.news.filter(n=>n.kind==='wages'),prizes=c.news.filter(n=>n.kind?.includes('prize'));
 const summary={id,mode,opening,ended:end,seasonTwo:c.date,balance:c.balance,weeklyWages:g.weeklyWages(),steps,...counts,payrolls:wageRows.length,prizeMessages:prizes.length};summaries.push(summary);console.log(JSON.stringify(summary));
 }
}
fs.writeFileSync(new URL('../review/season-reliability-'+buildLabel+'-two-seasons'+(process.env.CLUBLINE_TEST_CLUB?'-'+process.env.CLUBLINE_TEST_CLUB:'')+'.json',import.meta.url),JSON.stringify({passed:true,environment:'Node VM with DOM/timer stubs and seeded RNG; real game handlers; routine saves use plain JSON, actual codec at each checkpoint',policy:'Decline offers/bookings, choose no-spend stories, acknowledge notices; no optional purchases',summaries},null,2));
