import assert from 'node:assert/strict';
import {createGame} from './vm-game-harness.mjs';

for(const mode of ['streamlined','in-depth']){
 const {g}=await createGame(197);g.setup('C01',mode);g.newCareer();g.click('close-owner-welcome');
 let {career:c}=g.get();const next=g.nextFixture();
 c.date=new Date(Date.parse(next.date+'T12:00:00Z')-3*86400000).toISOString().slice(0,10);
 const balance=c.balance,morale=c.clubLife.morale;
 const e=g.mediaDay();assert(e);if(g.pending()){assert.equal(g.mediaToStop(),null,'Draws take priority over optional press');g.setMediaOpen(e.key);assert.equal(g.mediaPanel(),'');}while(g.pending()){g.click(g.pending().round.selections?'cl-draw-end':'draw-event-skip');g.click('draw-event-finish');}assert.equal(c.balance,balance);assert.equal(c.clubLife.morale,morale);
 g.click('board-review');g.click('media-open',{key:e.key});assert(g.mediaPanel().includes('No comment'));assert(g.mediaPanel().includes('Career context:'));const context=e.context,question=e.question;assert(question);assert(g.mediaPanel().includes(question));const invalidQuestion=g.backup();invalidQuestion.save.career.managerMedia.events[0].question=99;assert.throws(()=>g.parse(invalidQuestion));assert(context.includes('No earlier competitive meeting'));const corrupt=g.backup();corrupt.save.career.managerMedia.events[0].context=99;assert.throws(()=>g.parse(corrupt));assert(g.mediaPanel().includes('Actual reaction')===false);assert(g.mediaPanel().includes('If you lose'));
 const day=c.date;g.advance();assert.equal(c.date,day,'Continue must stop for a new question');assert(g.mediaToStop());
 g.click('media-later',{key:e.key});assert(e.deferred);assert.equal(g.mediaToStop(),null);
 g.checkpointSave();g.parse(g.backup());assert(g.load());c=g.get().career;assert.equal(c.managerMedia.events.length,1);assert(c.managerMedia.events[0].deferred);assert.equal(c.managerMedia.events[0].context,context);assert.equal(c.managerMedia.events[0].question,question);assert.equal(g.mediaDay(),null);
 g.click('media-open',{key:e.key});g.click('media-reply',{key:e.key,choice:'provoke'});c=g.get().career;const answered=c.managerMedia.events[0];assert.equal(answered.status,'responded');assert(g.mediaPanel().includes('Actual reaction'));assert(g.mediaPanel().includes(answered.reply));
 const reaction=JSON.stringify(c.clubLife);g.click('media-reply',{key:e.key,choice:'provoke'});assert.equal(JSON.stringify(c.clubLife),reaction,'Repeated button activation cannot repeat effects');
 g.checkpointSave();assert(g.load());g.parse(g.backup());assert.equal(g.get().career.managerMedia.events[0].choice,'provoke');
 const bad=g.backup();bad.save.career.managerMedia.relationships[e.managerId]=99;assert.throws(()=>g.parse(bad));
 // Read old saves without this optional field, then initialise without interviews.
 const old=g.backup();delete old.save.career.managerMedia;assert(g.parse(old));
 // Normal match completion settles the feedback once and survives reload.
 g.click('media-close');let steps=0;
 while(g.get().match?.phase!=='report'){
  c=g.get().career;const match=g.get().match;
  assert(++steps<100,'Media/match flow stalled');
  if(match?.phase==='choice'){g.auto();g.beginMatch('simulate');continue;}
  if(c.matchday){g.click('matchday-continue');continue;}
  if(g.firstWeekEventPending()){g.click('first-week-ack');continue;}
  const b=g.calendarBoardReview();if(b){g.click('acknowledge-board-review',{id:b.id});continue;}
  if(g.pending()){g.click(g.pending().round.selections?'cl-draw-end':'draw-event-skip');g.click('draw-event-finish');continue;}
  const d=g.streamPending()[0];if(d){g.click('stream-open-decision',{key:d.key});g.click(d.kind==='injury'?'stream-review-team':d.kind==='offer'?'stream-decline-offer':'stream-dismiss');continue;}
  if(c.date===g.nextFixture()?.date)g.advance();else if(mode==='streamlined')await g.streamlinedContinue();else await g.advanceToDate(g.nextFixture().date);
 }
 c=g.get().career;assert(c.managerMedia.events[0].settled);assert(c.managerMedia.events[0].followUp);let post=c.managerMedia.events.find(e=>e.phase==='post');assert(post,'A provocative pre-match exchange should receive a follow-up');assert.equal(g.mediaPanel(),'','The match report takes priority');g.checkpointSave();assert(g.load());g.parse(g.backup());post=g.get().career.managerMedia.events.find(e=>e.phase==='post');assert.equal(post.status,'pending');g.closeMatchReport();while(g.get().career.matchday)g.click('matchday-continue');g.click('media-open',{key:post.key});assert(g.mediaPanel().includes('Post-match press'));assert(g.mediaPanel().includes('Keep perspective'));g.click('media-reply',{key:post.key,choice:'respect'});assert.equal(post.status,'responded');assert(post.settled);g.checkpointSave();g.parse(g.backup());assert(g.load());assert.equal(g.get().career.managerMedia.events.find(e=>e.phase==='post').choice,'respect');
 console.log('PASS media app:',mode,'press stop, deferral, response/reply, duplicate protection, save/backup, legacy field, real match and result feedback');
}
