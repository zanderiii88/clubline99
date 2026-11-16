import assert from 'node:assert/strict';
import {createGame} from './vm-game-harness.mjs';
for(const mode of ['streamlined','in-depth']){
 const {g}=await createGame(1115);g.setup('C01',mode);g.newCareer();g.click('close-owner-welcome');
 const workspace=()=>mode==='streamlined'?g.streamlinedWorkspace():g.squadSection();
 const c=g.get().career,football=()=>JSON.stringify({date:c.date,balance:c.balance,lineup:c.lineup,bench:c.bench,players:c.players,training:c.training});
 const before=football();
 for(const sub of ['overview','week-plan','news','club-history','season-review']){g.click('route',{section:'organiser',sub});g.organiserSection();for(const key of ['week-plan','news','club-history','season-review'])assert(g.workspaceHeader().includes('value="'+key+'"'),mode+' season menu '+sub+' / '+key);}
 if(mode==='streamlined')assert(g.streamlinedStadiumCard().includes('Club planning'));

 for(const [target,marker] of [['coverage','Squad cover ·'],['training','Latest training report']]){
  g.click('news-review',{target});assert.equal(g.routeSnapshot().sub,target);assert(workspace().includes(marker),mode+' news '+target);assert.equal(football(),before);
 }
 g.click('open-conversations');assert(workspace().includes('Player conversations'));assert.equal(g.routeSnapshot().sub,'conversations');
 for(const [sub,marker] of [['planning','Squad planning'],['succession','Succession'],['profiles','Player attributes'],['statistics','AVG is match rating'],['form','Recent league results'],['development','Latest development report'],['youth','Youth']]){
  g.click('route',{section:'squad',sub});assert(workspace().toLowerCase().includes(marker.toLowerCase()),mode+' route '+sub);
 }
 assert.equal(football(),before,'opening reports preserves football state');
 if(mode==='streamlined'){
  g.click('news-review',{target:'expectations'});assert(g.streamlinedWorkspace().includes('season-expectations'));
  g.click('news-review',{target:'finances'});assert(g.streamlinedWorkspace().includes('Club balance'));
  g.click('news-review',{target:'contracts'});assert(g.streamlinedWorkspace().includes('Contracts & renewals'));
  g.click('destination',{destination:'team'});assert(g.streamlinedWorkspace().includes('Team reports & advice'));assert.equal(g.routeSnapshot().sub,'lineup');
 }
 g.checkpointSave();assert(g.load());g.parse(g.backup());
 console.log('PASS workspace navigation:',mode,'news destinations, conversation/report routes, football state, save/backup');
}
