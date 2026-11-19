import {createAmbience} from './ambience.js?v=1.172.0';
import {createMatchSoundBridge} from './match-audio.js?v=1.172.0';
import {SOUND_CREDITS} from './audio-catalogue.js?v=1.172.0';
// Audio preferences belong to this installation, independently of careers or releases.
const KEY='clubline-audio-settings';
export const TRACKS=[["clubline-1994-techno-ballroom", "1994 Techno Ballroom", "melodyayresgriffiths", null], ["clubline-90s-synthwave", "90s Synthwave", "lofidreams", "https://pixabay.com/music/synthwave-90x27s-synthwave-music-384110/"], ["clubline-synth-wave", "Synth Wave", "Marvrix", "https://pixabay.com/music/synthwave-synth-wave-200494/"], ["clubline-90s-game-music", "90s Game Music", "PoorArtistt", "https://pixabay.com/music/video-games-90s-game-music-no-copyright-352850/"], ["clubline-back-to-90s", "Back to 90s", "berrydeep", null]];
const MUSIC_CATALOGUE='pixabay-1';
let prefs={ambienceMuted:false,ambienceVolume:.25,musicInGame:false,musicVolume:.22,effectsVolume:.65,musicMuted:false,effectsMuted:false,musicCatalogue:MUSIC_CATALOGUE,track:0,playlist:TRACKS.map((_,i)=>i),mode:'repeat'};
function readPrefs(stored){
 if(!stored)return;
 prefs.ambienceMuted=stored.ambienceMuted===true;prefs.musicInGame=stored.musicInGame===true;
 for(const [key,fallback] of [['ambienceVolume',.25],['musicVolume',.22],['effectsVolume',.65]])prefs[key]=typeof stored[key]==='number'&&Number.isFinite(stored[key])?Math.max(0,Math.min(1,stored[key])):fallback;
 prefs.musicMuted=stored.musicMuted===true;prefs.effectsMuted=stored.effectsMuted===true;
 const current=stored.musicCatalogue===MUSIC_CATALOGUE;
 prefs.track=current&&Number.isInteger(stored.track)&&stored.track>=0&&stored.track<TRACKS.length?stored.track:0;
 prefs.playlist=current&&Array.isArray(stored.playlist)?[...new Set(stored.playlist.filter(i=>Number.isInteger(i)&&i>=0&&i<TRACKS.length))]:TRACKS.map((_,i)=>i);
 prefs.mode=['repeat','playlist','shuffle'].includes(stored.mode)?stored.mode:'repeat';
 if(prefs.musicMuted)prefs.playlist=[];
 if(!prefs.playlist.length)prefs.musicMuted=true;
 else if(!prefs.playlist.includes(prefs.track))prefs.track=prefs.playlist[0];
}
try{const stored=JSON.parse(localStorage.getItem(KEY)||'null');readPrefs(stored);if(stored&&stored.musicCatalogue!==MUSIC_CATALOGUE)localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}
const music=new Audio(),effect=new Audio();music.preload='none';music.loop=true;effect.preload='none';music.volume=.22;effect.volume=.65;
const ambience=createAmbience(),matchSounds=createMatchSoundBridge();let audioView='title',ambienceContext='off';
function configureAmbience(hidden=document.hidden){ambience.configure({muted:prefs.ambienceMuted,volume:prefs.ambienceVolume,effectsMuted:prefs.effectsMuted,effectsVolume:prefs.effectsVolume,hidden:!!hidden});}
export function setAudioContext(state){
 const nextView=state.view==='career'?'career':'title',plan=matchSounds.observe(state),changed=nextView!==audioView||plan.mode!==ambienceContext;
 audioView=nextView;ambienceContext=plan.mode;if(plan.fresh)ambience.setContext('off');ambience.setContext(plan.mode);configureAmbience();
 for(const event of plan.cues)ambience.react(event);
 if(changed){if(audioView==='career'&&!prefs.musicInGame){++request;music.pause()}else playMusic();}
}
let unlocked=false,request=0,musicLoaded=-1,lastEffect='',lastClickAt=0;
const src=name=>new URL(`./assets/audio/${name}.mp3`,import.meta.url).href;
function publish(){syncAudioControls();window.dispatchEvent(new CustomEvent('clubline-audio-change',{detail:audioState()}))}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}publish()}
export function audioState(){return {...prefs,playlist:[...prefs.playlist],unlocked,playing:!music.paused,lastEffect,ambience:ambience.state(),audioView}}
async function playMusic(){
 if(!unlocked||prefs.musicMuted||document.hidden||audioView==='career'&&!prefs.musicInGame)return;
 const token=++request;
 music.volume=prefs.musicVolume;
 music.loop=prefs.mode==='repeat'||prefs.playlist.length<2;
 if(musicLoaded!==prefs.track){music.pause();music.src=src(TRACKS[prefs.track][0]);musicLoaded=prefs.track;}
 try{await music.play();if(token!==request)return;if(prefs.musicMuted||document.hidden||audioView==='career'&&!prefs.musicInGame)music.pause()}catch{ /* Wait for a later user gesture if playback is blocked. */ }
 publish();
}
export function unlockAudio(){unlocked=true;configureAmbience();ambience.unlock();playMusic();publish()}
export function setAudioSetting(key,value){
 if(!['musicMuted','effectsMuted','ambienceMuted','musicInGame'].includes(key))return;
 prefs[key]=!!value;
 if(key==='musicMuted'){++request;if(prefs.musicMuted){prefs.playlist=[];music.pause()}else{if(!prefs.playlist.length)prefs.playlist=TRACKS.map((_,i)=>i);unlockAudio()}}
 if(key==='effectsMuted'&&prefs.effectsMuted)effect.pause();
 if(key==='effectsMuted'||key==='ambienceMuted')configureAmbience();
 if(key==='musicInGame'){if(!prefs.musicInGame&&audioView==='career'){++request;music.pause()}else playMusic();}
 persist();
}
export function selectTrack(index){index=Number(index);if(!Number.isInteger(index)||index<0||index>=TRACKS.length)return;prefs.track=index;if(!prefs.playlist.includes(index))prefs.playlist.push(index);prefs.musicMuted=false;persist();if(unlocked)playMusic()}
export function changeTrack(){const list=prefs.playlist.length?prefs.playlist:TRACKS.map((_,i)=>i);selectTrack(list[(list.indexOf(prefs.track)+1)%list.length])}
function setPlaylist(index,checked){if(checked){prefs.playlist=[...new Set([...prefs.playlist,index])];prefs.musicMuted=false}else prefs.playlist=prefs.playlist.filter(i=>i!==index);if(!prefs.playlist.length){prefs.musicMuted=true;++request;music.pause()}else if(!prefs.playlist.includes(prefs.track))prefs.track=prefs.playlist[0];persist();unlockAudio()}
music.addEventListener('ended',()=>{if(prefs.musicMuted)return;if(prefs.mode==='shuffle'&&prefs.playlist.length>1){const choices=prefs.playlist.filter(i=>i!==prefs.track);selectTrack(choices[Math.floor(Math.random()*choices.length)])}else if(prefs.mode==='playlist')changeTrack();else{music.currentTime=0;playMusic()}});
function playEffect(name){
 if(!unlocked||prefs.effectsMuted||document.hidden)return;
 lastEffect=name;effect.volume=prefs.effectsVolume;effect.pause();effect.src=src(name);effect.currentTime=0;effect.play().catch(()=>{});publish();
}
export const playAdvance=()=>playEffect('advance-tick');
export function playClick(){const now=Date.now();if(now-lastClickAt<90)return;lastClickAt=now;playEffect('advance-tick');effect.volume=prefs.effectsVolume*.45;}

// No per-render audio nodes: navigation, minute updates and goals preserve playback.
window.addEventListener('click',event=>{if(event.target.closest('button:not(:disabled),summary,[data-action]')){unlockAudio();playClick();}if(event.target.closest('[data-audio-setting],[data-audio-track],[data-audio-mode],[data-playlist-track],[data-audio-volume]'))return;unlockAudio()});
window.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key))unlockAudio()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){matchSounds.reset();++request;music.pause();effect.pause()}else playMusic();configureAmbience()});
window.addEventListener('pagehide',()=>{matchSounds.reset();++request;music.pause();effect.pause();configureAmbience(true)});
window.addEventListener('pageshow',()=>{configureAmbience();playMusic()});
window.addEventListener('storage',event=>{if(event.key!==KEY)return;try{readPrefs(JSON.parse(event.newValue));++request;if(prefs.musicMuted||audioView==='career'&&!prefs.musicInGame)music.pause();if(prefs.effectsMuted)effect.pause();music.volume=prefs.musicVolume;effect.volume=prefs.effectsVolume;configureAmbience();playMusic();publish()}catch{}});
const ambienceLabel=()=>({off:'Title screens',quiet:'Quiet ground',training:'Training ground',gym:'Fitness work',changing:'Post-match changing room',office:'Club office',prematch:'Before kick-off',match:'Live match',interval:'Half-time',paused:'Match paused'}[ambienceContext]||'Quiet ground');
function soundCredits(){const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));return `<details class="music-credits"><summary>Recorded sound credits</summary><p>Recorded sounds from Freesound. Excerpts were trimmed, level-adjusted and faded; see AUDIO-CREDITS.md for source and editing details.</p>${SOUND_CREDITS.map(c=>`<p><a href="${escape(c.source)}" target="_blank" rel="noopener noreferrer">${escape(c.title)}</a> · ${escape(c.author)} · <a href="${escape(c.licenceUrl)}" target="_blank" rel="noopener noreferrer">${escape(c.licence)}</a></p>`).join('')}</details>`;}
function musicCredits(){return `<details class="music-credits"><summary>Music credits</summary><p>Music supplied by the creators below via Pixabay.</p>${TRACKS.map(([id,title,creator,url])=>`<p><b>${title}</b> · ${creator}${url?` · <a href="${url}" target="_blank" rel="noopener noreferrer">Source</a>`:''}</p>`).join('')}<p><a href="https://pixabay.com/service/terms/" target="_blank" rel="noopener noreferrer">Pixabay Content License</a></p></details>`;}
export function audioControls(compact=false){return `<div class="audio-controls ${compact?'compact':''}" data-audio-controls>${compact?`<div class="audio-toggle-row"><button class="btn slim" data-action="audio-music" aria-pressed="${prefs.musicMuted}" data-audio-music-label>${prefs.musicMuted?'Music off':'Music on'}</button><button class="btn slim" data-action="audio-effects" aria-pressed="${prefs.effectsMuted}" data-audio-effects-label>${prefs.effectsMuted?'FX off':'FX on'}</button><button class="btn slim" data-action="audio-ambience" ${!ambience.state().available?'disabled':''} aria-pressed="${prefs.ambienceMuted}" data-audio-ambience-label>${!ambience.state().available?'Ambience unavailable':prefs.ambienceMuted?'Ambience off':'Ambience on'}</button><button class="btn slim" data-action="title-options">Options</button></div>`:`<h3>Sound and music</h3><p>A continuous, light outdoor background supports club screens, with quieter scene details: training or fitness work, office activity, and post-match showers. Crowd reactions follow live match events.</p><p class="compact-note" data-audio-environment>Atmosphere: ${ambienceLabel()}</p><label><input type="checkbox" data-audio-setting="ambienceMuted" ${!ambience.state().available?'disabled':''} ${prefs.ambienceMuted?'checked':''}> Ambient sounds off</label><label class="field">Ambience volume <input aria-label="Ambience volume" type="range" min="0" max="100" value="${Math.round(prefs.ambienceVolume*100)}" data-audio-volume="ambienceVolume" ${!ambience.state().available?'disabled':''}></label><label><input type="checkbox" data-audio-setting="musicInGame" ${prefs.musicInGame?'checked':''}> Also play music during the game</label><p>Music plays on the title and setup screens by default. Gameplay uses quiet ambience by default. Match whistles and reactions follow the FX control; background atmosphere follows Ambience.</p><div class="audio-toggle-row"><label><input type="checkbox" data-audio-setting="musicMuted" ${prefs.musicMuted?'checked':''}> Music off</label><label><input type="checkbox" data-audio-setting="effectsMuted" ${prefs.effectsMuted?'checked':''}> FX off</label></div>${[['musicVolume','Music volume'],['effectsVolume','FX volume']].map(([key,label])=>`<label class="field">${label}<input aria-label="${label}" type="range" min="0" max="100" value="${Math.round(prefs[key]*100)}" data-audio-volume="${key}"></label>`).join('')}<label class="field">Playback<select data-audio-mode><option value="repeat">Repeat selected track</option><option value="playlist">Play selected playlist in order</option><option value="shuffle">Shuffle selected playlist</option></select></label><label class="audio-track-picker">Selected track<select data-audio-track>${TRACKS.map(([id,label],i)=>`<option value="${i}" ${prefs.track===i?'selected':''}>${label}</option>`).join('')}</select></label><div class="playlist-list">${TRACKS.map(([id,label],i)=>`<label><input type="checkbox" data-playlist-track="${i}" ${prefs.playlist.includes(i)?'checked':''}> ${label}</label>`).join('')}</div><div class="audio-play-row"><span data-audio-track-label>Track: ${TRACKS[prefs.track][1]}</span><button class="btn slim" data-action="audio-play">Play music</button><button class="btn slim" data-action="audio-track-change">Change track →</button></div><p>Music off clears the playlist. Tick a track to enable music. Playback and FX choices are saved for this device, including across updates and new careers.</p>${soundCredits()}${musicCredits()}`}</div>`}
export function syncAudioControls(){document.querySelectorAll('[data-audio-controls]').forEach(box=>{for(const key of ['musicMuted','effectsMuted','ambienceMuted','musicInGame']){const input=box.querySelector(`[data-audio-setting="${key}"]`);if(input)input.checked=prefs[key]}const environment=box.querySelector('[data-audio-environment]');if(environment)environment.textContent='Atmosphere: '+ambienceLabel();const picker=box.querySelector('[data-audio-track]');if(picker)picker.value=String(prefs.track);for(const el of box.querySelectorAll('[data-audio-volume]'))el.value=String(Math.round(prefs[el.dataset.audioVolume]*100));for(const kind of ['music','effects','ambience']){const button=box.querySelector(`[data-audio-${kind}-label]`);if(button){button.textContent=kind==='ambience'&&!ambience.state().available?'Ambience unavailable':`${kind==='music'?'Music':kind==='ambience'?'Ambience':'FX'} ${prefs[kind+'Muted']?'off':'on'}`;button.setAttribute('aria-pressed',String(prefs[kind+'Muted']))}}const label=box.querySelector('[data-audio-track-label]');if(label)label.textContent='Track: '+TRACKS[prefs.track][1];const mode=box.querySelector('[data-audio-mode]');if(mode)mode.value=prefs.mode;box.querySelectorAll('[data-playlist-track]').forEach(el=>el.checked=prefs.playlist.includes(Number(el.dataset.playlistTrack)));const play=box.querySelector('[data-action="audio-play"]');if(play)play.hidden=prefs.musicMuted||!music.paused})}
export function handleAudioAction(el){switch(el.dataset.action){case 'audio-ambience':setAudioSetting('ambienceMuted',!prefs.ambienceMuted);unlockAudio();return true;case 'audio-music':setAudioSetting('musicMuted',!prefs.musicMuted);return true;case 'audio-effects':setAudioSetting('effectsMuted',!prefs.effectsMuted);return true;case 'audio-play':if(audioView==='career'&&!prefs.musicInGame)setAudioSetting('musicInGame',true);if(prefs.musicMuted)setAudioSetting('musicMuted',false);else unlockAudio();return true;case 'audio-track-change':changeTrack();return true;default:return false}}
export function handleAudioChange(el){if(el.hasAttribute('data-audio-volume')){const key=el.dataset.audioVolume,value=Number(el.value);if(['ambienceVolume','musicVolume','effectsVolume'].includes(key)&&Number.isFinite(value)){prefs[key]=Math.max(0,Math.min(1,value/100));music.volume=prefs.musicVolume;effect.volume=prefs.effectsVolume;configureAmbience();persist();unlockAudio();}return true}if(el.hasAttribute('data-playlist-track')){setPlaylist(Number(el.dataset.playlistTrack),el.checked);return true}if(el.hasAttribute('data-audio-mode')){prefs.mode=el.value;persist();playMusic();return true}if(el.dataset.audioSetting){setAudioSetting(el.dataset.audioSetting,el.checked);unlockAudio();return true}if(el.hasAttribute('data-audio-track')){selectTrack(el.value);unlockAudio();return true}return false}
