import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validMedia} from '../manager-media.js';
const league={clubs:['league','scotland','europe-cl','europe-uc'].flatMap(file=>JSON.parse(fs.readFileSync(new URL(`../data/${file}.json`,import.meta.url))).clubs)};
const buildLabel=JSON.parse(fs.readFileSync(new URL('../version.json',import.meta.url))).version.split('.').slice(0,2).join('.');
const summaries=[];
for(const id of ['C01','SC11']){
 const report=JSON.parse(fs.readFileSync(new URL(`../review/season-reliability-${buildLabel}-${id}.json`,import.meta.url))),summary=report.summaries[0];
 const c=JSON.parse(fs.readFileSync(new URL(`../review/checkpoints/${id}.json`,import.meta.url))).backup.save.career;
 assert(report.passed);assert.equal(c.season,2);assert(validMedia(c,league));
 const events=c.managerMedia.events,answered=events.filter(e=>e.status==='responded'),expired=events.filter(e=>e.status==='expired');assert.equal(answered.length,summary.media);assert(answered.every(e=>e.choice==='none'&&e.settled));assert.equal(answered.length+expired.length,events.length);assert(expired.every(e=>e.changes===null));
 assert.deepEqual(c.managerMedia.totals,{morale:0,supporters:0});assert(answered.every(e=>e.changes.morale===0&&e.changes.supporters===0&&e.changes.relationship===0));
 const reports=c.archives.find(x=>x.season===1).reports;assert.equal(reports.length,summary.matches);assert.equal(new Set(reports.map(r=>[r.date,r.competition,r.homeId,r.awayId].join(':'))).size,reports.length);
 const wages=c.news.filter(n=>n.kind==='wages');assert.equal(new Set(wages.map(n=>n.date)).size,wages.length);
 const baseline=JSON.parse(fs.readFileSync(new URL(`../review/season-reliability-1.96-${id}.json`,import.meta.url))).summaries[0];assert.equal(summary.balance,baseline.balance,'No-comment press flow must not change the seeded baseline balance');
 summaries.push({...summary,rivalryQuestions:events.filter(e=>e.derby).length,expiredQuestions:expired.length});
}
const evidence={passed:true,environment:'Real game engine in Node VM with DOM/timer stubs; routine saves use plain JSON, actual codec at monthly/end checkpoints',scope:'English Premier In-depth and Scottish First Streamlined, season one through season two; every press question answered No comment',matches:summaries.reduce((n,s)=>n+s.matches,0),checkpoints:summaries.reduce((n,s)=>n+s.checkpoints,0),pressQuestions:summaries.reduce((n,s)=>n+s.media,0),archivePayrollAndNoCommentAudit:true,summaries};
fs.writeFileSync(new URL('../review/media-reliability-'+buildLabel+'.json',import.meta.url),JSON.stringify(evidence,null,2));console.log('PASS media season evidence:',evidence.matches,'matches,',evidence.checkpoints,'checkpoints,',evidence.pressQuestions,'press questions; unchanged no-comment balances');
