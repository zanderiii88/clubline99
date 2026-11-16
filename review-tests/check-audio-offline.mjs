import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const listeners={},source=fs.readFileSync(root+'/sw.js','utf8');const ctx=vm.createContext({self:{addEventListener:(t,f)=>listeners[t]=f,location:{origin:'https://example.test'}},URL,Request,Response,Headers,caches:{},fetch(){},setTimeout,clearTimeout});
vm.runInContext(source+'\nglobalThis.testRange=cachedMediaResponse;globalThis.testCore=CORE;',ctx);
assert(!ctx.testCore.some(url=>url.includes('/assets/audio/ambience/')));
assert(!fs.existsSync(root+'/assets/audio/ambience'));assert(!fs.existsSync(root+'/tools/build-ambience.py'));
const catalogue=JSON.parse(fs.readFileSync(root+'/assets/audio/recorded/sources.json'));
assert.equal(catalogue.clips.length,32);assert.equal(catalogue.sources.length,23);
for(const clip of catalogue.clips){
 const file=root+'/assets/audio/recorded/'+clip.file;assert(ctx.testCore.includes('./assets/audio/recorded/'+clip.file+'?v=1.125.0'));
 const decoded=execFileSync('ffmpeg',['-v','error','-i',file,'-f','f32le','-acodec','pcm_f32le','-'],{maxBuffer:32*1024*1024});let peak=0,sum=0;for(let i=0;i<decoded.length;i+=4){const n=decoded.readFloatLE(i);assert(Number.isFinite(n));peak=Math.max(peak,Math.abs(n));sum+=n*n;}assert(peak<.95&&sum>0,clip.file);
}
for(const source of catalogue.sources)assert(/creativecommons\.org\/(publicdomain\/zero|licenses\/by)\//.test(source.licenceUrl));
const data=fs.readFileSync(root+'/assets/audio/recorded/stadium-bed.mp3');
for(const [range,status,start,end] of [['bytes=0-127',206,0,127],['bytes=100-',206,100,data.length-1],['bytes=-128',206,data.length-128,data.length-1],['bytes=0-99999999',206,0,data.length-1],['bytes=99999999-',416],['bytes=40-10',416],['bytes=0-1,5-6',416],['bytes=-0',416]]){
 const response=await ctx.testRange(new Response(data,{headers:{'Content-Type':'audio/mpeg'}}),range);assert.equal(response.status,status,range);
 if(status===206){assert.equal(response.headers.get('Content-Range'),`bytes ${start}-${end}/${data.length}`);assert.equal(response.headers.get('Content-Type'),'audio/mpeg');assert.deepEqual(Buffer.from(await response.arrayBuffer()),data.subarray(start,end+1));}
}
// Exercise the registered fetch listener with a real byte-range Request offline.
ctx.fetch=()=>Promise.reject(new Error('offline'));ctx.caches.open=async()=>({match:async()=>new Response(data,{headers:{'Content-Type':'audio/mpeg'}})});
let response;listeners.fetch({request:new Request('https://example.test/assets/audio/recorded/stadium-bed.mp3',{headers:{Range:'bytes=16-79'}}),respondWith:p=>{response=p;}});assert.equal((await response).status,206);
for(const file of ['applause.mp3','crowd-bed.wav','birds-1.mp3','whistle.mp3']){listeners.fetch({request:new Request('https://example.test/assets/audio/ambience/'+file),respondWith:p=>{response=p;}});assert.equal((await response).status,410);}
fs.writeFileSync(root+'/review/audio-offline-1.125.json',JSON.stringify({passed:true,recordedAssets:32,creditedSources:23,rangeCases:9,blockedWithdrawnFiles:4,scope:'32 recorded assets decoded and cached; 23 sources credited; old palette blocked; recorded audio offline byte ranges checked.'},null,2));
console.log('PASS 32 recorded assets, 23 credit/licence entries, old palette blocked and 9 offline byte-range cases');
