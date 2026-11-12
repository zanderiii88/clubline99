import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {DIVISIONS,startingDivision} from '../divisions.js';
import {seasonSchedule} from '../season-calendar.js';
import {scottishSchedule} from '../scottish-world.js';
import {fixedSurroundings,fixedSiteError} from '../fixed-surroundings.js';
import {defaultLayout} from '../stadium-model.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const buildLabel=JSON.parse(fs.readFileSync(path.join(root,'version.json'))).version.split('.').slice(0,2).join('.');
const english=JSON.parse(fs.readFileSync(path.join(root,'data/league.json')));
const scottish=JSON.parse(fs.readFileSync(path.join(root,'data/scotland.json')));
assert.equal(english.clubs.length,68);assert.equal(english.players.length,1428);
assert.equal(scottish.clubs.length,56);assert.equal(scottish.players.length,1180);
for(const data of [english,scottish]){
 assert.equal(new Set(data.clubs.map(c=>c.id)).size,data.clubs.length);
 assert.equal(new Set(data.players.map(p=>p.id)).size,data.players.length);
 for(const p of data.players){assert(data.clubs.some(c=>c.id===p.clubId));assert(Number.isFinite(p.overall));}
}
for(const club of english.clubs){
 assert.equal(english.players.filter(p=>p.clubId===club.id).length,21);
 assert.equal(fixedSiteError(club,defaultLayout(club)),null);
 const site=fixedSurroundings(club.id);assert(site);
 for(const layer of ['back','front'])assert(fs.existsSync(path.join(root,`assets/surroundings/${site.assetStem||club.id}-${layer}.${site.assetExtension||'webp'}`)));
 for(let kit=0;kit<3;kit++)for(const stem of ['kit','kit-shirt'])assert(fs.existsSync(path.join(root,`assets/kits/${stem}-${club.kitIndex}-${kit}.svg`)));
}
const divisions=[];
for(const d of DIVISIONS){
 const ids=[...english.clubs,...scottish.clubs].filter(c=>startingDivision(c.id)===d.id).map(c=>c.id);
 assert.equal(ids.length,d.size);
 const rounds=d.id.startsWith('scot-')?scottishSchedule(ids,1998):seasonSchedule(ids,1998);
 const counts=new Map();
 for(const r of rounds)for(const f of r.fixtures){assert(ids.includes(f.home)&&ids.includes(f.away)&&f.home!==f.away);const key=f.home+':'+f.away;counts.set(key,(counts.get(key)||0)+1);}
 const perVenue=d.id.startsWith('scot-')?2:1;
 assert.equal(counts.size,ids.length*(ids.length-1));assert([...counts.values()].every(n=>n===perVenue));
 divisions.push({id:d.id,clubs:ids.length,rounds:rounds.length,gamesPerClub:(ids.length-1)*perVenue*2});
}
const modules=fs.readdirSync(root).filter(f=>f.endsWith('.js'));
for(const file of modules)execFileSync(process.execPath,['--check',path.join(root,file)]);
execFileSync(process.execPath,[path.join(root,'review-tests/check-cache-integrity.cjs')],{stdio:'inherit'});
const hashes=Object.fromEntries(['league','scotland','europe-cl','europe-uc'].map(name=>[name,createHash('sha256').update(fs.readFileSync(path.join(root,'data',name+'.json'))).digest('hex')]));
fs.writeFileSync(path.join(root,`review/source-integrity-${buildLabel}.json`),JSON.stringify({passed:true,divisions,syntaxCheckedModules:modules.length,englishStadiumsChecked:68,dataHashes:hashes},null,2));
console.log('PASS source integrity: all five playable divisions, current database counts, 68 English stadiums and kits, module syntax and exact cache/import paths');
