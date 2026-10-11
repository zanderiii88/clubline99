import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
import {WEMBLEY_SITE as site,WEMBLEY_CLUB as club,buildWembleyWorld} from '../wembley-world.js';import {sceneSvg} from '../scene.js';
process.chdir(new URL('../',import.meta.url).pathname);
const require=createRequire(import.meta.url),sharp=require('sharp');
const project=({x,y,z=0})=>({x:site.origin[0]+(x-36)*site.east[0]+(y-30)*site.south[0],y:site.origin[1]+(x-36)*site.east[1]+(y-30)*site.south[1]-z*2.55*site.scale});
const world=buildWembleyWorld(project),ns='http://www.w3.org/2000/svg',box=site.box.join(' ');
for(const layer of ['back','front'])fs.writeFileSync(`assets/surroundings/wembley-${layer}.svg`,`<svg xmlns="${ns}" viewBox="${box}">${layer==='back'?world.ground:''}${world[layer]}</svg>`);
fs.writeFileSync('review/wembley-world-geometry.json',JSON.stringify({reserve:site.reserve,counts:world.counts,footprints:world.footprints},null,2));
let svg=sceneSvg(club,site.id,true,false,'career',club.stadium,null,{ambient:true,phase:'prematch',occupancy:.82,neutral:true,homeColour:'#b62e3b',awayColour:'#244eaa'});
for(const layer of ['back','front']){const bytes=fs.readFileSync(`assets/surroundings/wembley-${layer}.svg`);svg=svg.replace(new RegExp(`assets/surroundings/wembley-${layer}\\.svg\\?v=1\\.59\\.0`),'data:image/svg+xml;base64,'+bytes.toString('base64'));}
const frame=svg.match(/data-career-frame="([^"]+)"/)[1].split(' ').map(Number),[cx,cy,fw,fh,top,bottom]=frame;console.log({frame,counts:world.counts});
fs.mkdirSync('review/wembley-previews',{recursive:true});
for(const [name,w,h]of[['portrait',390,760],['landscape',844,390],['district',1400,1050]]){
 let vw=name==='district'?2400:Math.max(fw*1.2,fw+18,(fh+18)*w/h),vh=vw*h/w,y=name==='district'?cy-vh*.4:Math.max(top,Math.min(bottom-vh,cy-vh/2));
 const current=svg.replace(/viewBox="[^"]+"/,`width="${w*2}" height="${h*2}" viewBox="${cx-vw/2} ${y} ${vw} ${vh}"`);
 fs.writeFileSync(`review/wembley-previews/Wembley-${name}.svg`,current);
 await sharp(Buffer.from(current)).resize(w*2,h*2).png().toFile(`review/wembley-previews/Wembley-${name}.png`);
}
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Clubline 99 — Wembley Fields preview</title><style>html,body{margin:0;background:#102333;color:#eceddb;font:16px system-ui}header{padding:12px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}h1{font-size:18px;margin:0}button{color:inherit;background:#1c4158;border:1px solid #8dacae;border-radius:4px;padding:9px 14px}p{font-size:13px;margin:8px 16px}.world{height:calc(100dvh - 122px)}svg{width:100%;height:100%;display:block}</style><header><h1>Wembley Fields • 1998–99</h1><button id="fit">Phone / landscape</button><button id="wide">Wider estate</button></header><p>Actual modular stadium and surroundings from v1.59.0. Twin towers, Wembley Way, arena, conference halls, coach parks, industrial yards and outer housing. Period-inspired layout.</p><div class="world">${svg}</div><script>const svg=document.querySelector('svg'),host=document.querySelector('.world'),frame=svg.dataset.careerFrame.split(' ').map(Number);let wide=false;function resize(){const[cx,cy,fw,fh,top,bottom]=frame,r=host.clientWidth/host.clientHeight,w=wide?Math.max(2400,1800*r):Math.max(fw*1.2,fw+18,(fh+18)*r),h=w/r,y=wide?cy-h*.4:Math.max(top,Math.min(bottom-h,cy-h/2));svg.setAttribute('viewBox',[cx-w/2,y,w,h].join(' '));svg.setAttribute('preserveAspectRatio','xMidYMid meet')}document.querySelector('#fit').onclick=()=>{wide=false;resize()};document.querySelector('#wide').onclick=()=>{wide=true;resize()};new ResizeObserver(resize).observe(host);resize();</script></html>`;
fs.writeFileSync('review/wembley-previews/Clubline-Wembley-Preview.html',html);
