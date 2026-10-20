(() => {
'use strict';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const fmt=n=>Math.floor(Math.max(0,n)).toLocaleString('en-US');
const SAVE_KEY='knock_a_bug_save_overhaul', LEGACY_SAVE_KEY='knock_a_bug_save_v3', OLD_SAVE_KEY='knock_a_bug_save_v2';
const TAU=Math.PI*2;

const MAPS=[
 {id:'backyard',name:'Backyard',tag:'Flowerbeds, wind lanes and garden toys',cost:0,coin:1,gravity:1,bounce:1,accent:'#a8f062',ground:'#486f35',sky1:'#65c9f3',sky2:'#dff7ff',unlockNeed:0},
 {id:'kitchen',name:'Kitchen',tag:'Toaster pops, crumbs and countertop fans',cost:6000,coin:1.35,gravity:.97,bounce:1.07,accent:'#ffca63',ground:'#d7d1c3',sky1:'#c7dde5',sky2:'#f7eee0',unlockNeed:3},
 {id:'apartment',name:'Apartment Hallway',tag:'Vent lifts, carpet speed and door ricochets',cost:38000,coin:1.75,gravity:1.01,bounce:1.13,accent:'#c9a4ff',ground:'#725a78',sky1:'#536987',sky2:'#a08aae',unlockNeed:3},
 {id:'sewer',name:'Sewer',tag:'Pipe jets, slime rails and toxic jackpots',cost:190000,coin:2.3,gravity:.9,bounce:1.21,accent:'#8df57c',ground:'#31594a',sky1:'#1b3736',sky2:'#547658',unlockNeed:3},
 {id:'lab',name:'Laboratory',tag:'Gravity rings, reactors and unstable portals',cost:780000,coin:3.15,gravity:.74,bounce:1.31,accent:'#67efff',ground:'#263c61',sky1:'#111c43',sky2:'#5b3d76',unlockNeed:3}
];

const BUGS=[
 {id:'ant',name:'Ant',abbr:'ANT',cost:0,weight:1,value:1,bounce:1,glide:0,color:'#25282e',accent:'#0f1114',perk:'Balanced: +5% all run coins.',perkCoin:.05},
 {id:'ladybug',name:'Ladybug',abbr:'LADY',cost:1400,weight:1.13,value:1.25,bounce:1.2,glide:.01,color:'#df4545',accent:'#16181b',perk:'Shell Roll: +16% bounce payout.',bouncePay:.16},
 {id:'flea',name:'Flea',abbr:'FLEA',cost:6200,weight:.62,value:1.2,bounce:1.47,glide:.01,color:'#724831',accent:'#2c1a13',perk:'Spring Legs: first 3 bounces are stronger.',spring:true},
 {id:'beetle',name:'Beetle',abbr:'BTL',cost:16000,weight:1.66,value:1.85,bounce:.94,glide:0,color:'#263e48',accent:'#61bdd0',perk:'Heavy Prize: obstacle rewards +45%.',objectPay:.45},
 {id:'aphid',name:'Aphid',abbr:'APH',cost:36000,weight:.72,value:1.6,bounce:1.08,glide:.055,color:'#7eb95a',accent:'#d5f58c',perk:'Leaf Float: stronger mid-air coin magnet.',magnet:34},
 {id:'cricket',name:'Cricket',abbr:'CRKT',cost:75000,weight:.92,value:2,bounce:1.24,glide:.015,color:'#4a5b35',accent:'#b4d978',perk:'Kickback: perfect hits gain +18% launch.',perfect:.18},
 {id:'centipede',name:'House Centipede',abbr:'HC',cost:145000,weight:.88,value:2.3,bounce:1.32,glide:.02,color:'#c7a36b',accent:'#6d593d',perk:'Many Legs: combo timer lasts 40% longer.',combo:.4},
 {id:'moth',name:'Moth',abbr:'MOTH',cost:270000,weight:.82,value:2.7,bounce:.96,glide:.14,color:'#a99a87',accent:'#e8d7bd',perk:'Glider: high-lane pickups pay +30%.',highPay:.3},
 {id:'termite',name:'Termite',abbr:'TERM',cost:520000,weight:1.05,value:3.15,bounce:1.11,glide:.03,color:'#dac397',accent:'#80684c',perk:'Demolition: smashing objects gives a boost.',demolition:true},
 {id:'dragonfly',name:'Dragonfly',abbr:'DFLY',cost:950000,weight:.78,value:3.75,bounce:.88,glide:.2,color:'#4195ae',accent:'#9cecf3',perk:'Sky Hunter: airtime stipend +45%.',airPay:.45}
];

const KNOCKERS=[
 {id:'hand',name:'Hand',abbr:'HAND',cost:0,power:1,crit:0,trait:'Reliable timing.'},
 {id:'swatter',name:'Fly Swatter',abbr:'SWAT',cost:2800,power:1.18,crit:.02,trait:'Pickup radius +18%.',magnet:.18},
 {id:'shoe',name:'Shoe',abbr:'SHOE',cost:13000,power:1.4,crit:.035,trait:'Ground bounces retain +9%.',ground:.09},
 {id:'newspaper',name:'Newspaper',abbr:'NEWS',cost:52000,power:1.66,crit:.06,trait:'Combo timer +35%.',combo:.35},
 {id:'mallet',name:'Rubber Mallet',abbr:'MALT',cost:135000,power:1.92,crit:.07,trait:'Object impacts pay +25%.',object:.25},
 {id:'springbat',name:'Spring Bat',abbr:'SPRG',cost:315000,power:2.2,crit:.09,trait:'Perfect hits gain +22% force.',perfect:.22},
 {id:'vacuum',name:'Vacuum Burst',abbr:'VAC',cost:690000,power:2.48,crit:.1,trait:'Passive wide coin pull.',magnet:.5},
 {id:'pulse',name:'Pulse Hammer',abbr:'PULSE',cost:1400000,power:2.85,crit:.14,trait:'Every obstacle adds launch energy.',pulse:true}
];

const STATS=[
 {id:'power',name:'Knock Power',desc:'Launch farther without skipping rewards.',base:220,growth:1.55,max:18},
 {id:'crit',name:'Critical Hits',desc:'Higher critical chance and force.',base:350,growth:1.58,max:15},
 {id:'bounce',name:'Bounce Tech',desc:'Keep more speed after floor impacts.',base:310,growth:1.57,max:18},
 {id:'air',name:'Air Control',desc:'Reduce drag and improve route control.',base:470,growth:1.6,max:15},
 {id:'income',name:'Coin Value',desc:'Boost every coin source, including distance.',base:390,growth:1.56,max:18},
 {id:'magnet',name:'Pickup Magnet',desc:'Grab coin trails from farther away.',base:420,growth:1.58,max:15},
 {id:'ability',name:'Ability Cooling',desc:'Use active abilities more often.',base:750,growth:1.62,max:12},
 {id:'contract',name:'Contract Bonus',desc:'Increase contract coin rewards.',base:950,growth:1.64,max:10}
];

const MUTATIONS=[
 {id:'muscle',name:'Chitin Muscle',desc:'+10% launch force per level.',base:2,max:8},
 {id:'spring',name:'Elastic Shell',desc:'+6% bounce retention per level.',base:3,max:8},
 {id:'fortune',name:'Golden Instinct',desc:'+12% all coin income per level.',base:4,max:8},
 {id:'gravity',name:'Hollow Bones',desc:'+4% glide and airtime value per level.',base:4,max:7},
 {id:'coolant',name:'Cold Nerves',desc:'-5% ability cooldown per level.',base:5,max:6},
 {id:'collector',name:'Collector Nerves',desc:'+18 pickup radius per level.',base:3,max:8}
];

const GADGETS=[
 {id:'scanner',name:'Route Scanner',desc:'+8% pickup value per level.',base:6,growth:1.65,max:7},
 {id:'salvage',name:'Salvage Magnet',desc:'+20 pickup radius and +10% Scrap chance per level.',base:7,growth:1.7,max:6},
 {id:'capsule',name:'Capsule Press',desc:'Field Capsules arrive faster.',base:10,growth:1.78,max:4},
 {id:'bumper',name:'Bumper Kit',desc:'Objects and map gimmicks pay +12% per level.',base:8,growth:1.68,max:7},
 {id:'event',name:'Chaos Dial',desc:'Raises the chance of special run events.',base:12,growth:1.8,max:5},
 {id:'extractor',name:'Cell Extractor',desc:'Makes the repeatable knock Cell bonus trigger faster.',base:14,growth:1.9,max:3}
];

const SOUVENIRS={
 backyard:[['Pressed Clover',7,0],['Bottlecap Beetle',14,2],['Tiny Garden Key',23,3]],
 kitchen:[['Sugar Crystal',7,1],['Cereal Prize',15,3],['Silver Crumb Fork',24,2]],
 apartment:[['Lost Keycard',8,1],['Vent Badge',16,3],['Mini Doorplate',25,2]],
 sewer:[['Glow Slime Pearl',8,0],['Rust Crown',17,2],['Pipe Token',26,3]],
 lab:[['Gravity Chip',9,1],['Reactor Shard',18,3],['Prototype Core',28,2]]
};

const CHALLENGE_TYPES=[
 {id:'pickups',label:'Collect pickups',goal:i=>6+i*2},
 {id:'objects',label:'Smash objects',goal:i=>2+Math.floor(i*.75)},
 {id:'specials',label:'Trigger map boosts',goal:i=>1+Math.floor(i*.6)},
 {id:'distance',label:'Reach distance',goal:i=>55+i*115},
 {id:'combo',label:'Reach combo',goal:i=>1.7+i*.38}
];

const CONTRACTS={
 backyard:[
  {type:'pickups',goal:35,title:'Pocket Change',desc:'Collect 35 pickups in the Backyard.',coins:900,cells:2},
  {type:'bestDistance',goal:90,title:'Fence Line',desc:'Reach 90 m in one Backyard run.',coins:1400,cells:2},
  {type:'objects',goal:8,title:'Garden Wrecker',desc:'Hit 8 Backyard objects total.',coins:1900,cells:2},
  {type:'bounces',goal:25,title:'Grass Hopper',desc:'Land 25 bounces total.',coins:2600,cells:3},
  {type:'mapCoins',goal:8000,title:'Garden Payday',desc:'Earn 8,000 coins in this map.',coins:4200,cells:3}
 ],
 kitchen:[
  {type:'pickups',goal:90,title:'Crumb Vacuum',desc:'Collect 90 Kitchen pickups.',coins:5000,cells:2},
  {type:'bestDistance',goal:190,title:'Counter Crossing',desc:'Reach 190 m in one Kitchen run.',coins:7500,cells:2},
  {type:'specials',goal:12,title:'Appliance Abuse',desc:'Trigger 12 Kitchen boosts.',coins:9500,cells:3},
  {type:'bestCombo',goal:2.6,title:'Combo Snack',desc:'Reach a x2.6 combo in Kitchen.',coins:13000,cells:3},
  {type:'mapCoins',goal:45000,title:'Lunch Money',desc:'Earn 45,000 coins in this map.',coins:20000,cells:4}
 ],
 apartment:[
  {type:'pickups',goal:150,title:'Hall Sweeper',desc:'Collect 150 Hallway pickups.',coins:19000,cells:3},
  {type:'bestDistance',goal:340,title:'End of the Hall',desc:'Reach 340 m in one run.',coins:28000,cells:3},
  {type:'objects',goal:28,title:'Noise Complaint',desc:'Smash 28 hallway objects.',coins:35000,cells:3},
  {type:'specials',goal:24,title:'Vent Rider',desc:'Trigger 24 vents or carpet boosts.',coins:42000,cells:4},
  {type:'mapCoins',goal:180000,title:'Rent Money',desc:'Earn 180,000 coins here.',coins:65000,cells:4}
 ],
 sewer:[
  {type:'pickups',goal:220,title:'Drain Treasure',desc:'Collect 220 Sewer pickups.',coins:75000,cells:3},
  {type:'bestDistance',goal:560,title:'Pipe Marathon',desc:'Reach 560 m in one run.',coins:110000,cells:4},
  {type:'specials',goal:34,title:'Jet Stream',desc:'Trigger 34 Sewer gimmicks.',coins:140000,cells:4},
  {type:'bestCombo',goal:4,title:'Toxic Chain',desc:'Reach a x4.0 combo.',coins:180000,cells:5},
  {type:'mapCoins',goal:720000,title:'Sewer Fortune',desc:'Earn 720,000 coins here.',coins:260000,cells:5}
 ],
 lab:[
  {type:'pickups',goal:320,title:'Particle Collector',desc:'Collect 320 Lab pickups.',coins:260000,cells:4},
  {type:'bestDistance',goal:900,title:'Break the Scale',desc:'Reach 900 m in one run.',coins:380000,cells:4},
  {type:'objects',goal:60,title:'Containment Failure',desc:'Smash 60 Lab objects.',coins:460000,cells:5},
  {type:'specials',goal:55,title:'Quantum Tourist',desc:'Trigger 55 gravity tech effects.',coins:620000,cells:5},
  {type:'mapCoins',goal:2200000,title:'Final Funding',desc:'Earn 2.2M coins in the Lab.',coins:900000,cells:7}
 ]
};

const makeMapStats=()=>Object.fromEntries(MAPS.map(m=>[m.id,{pickups:0,objects:0,bounces:0,specials:0,mapCoins:0,bestDistance:0,bestCombo:1,flights:0}]));
const defaultState=()=>({
 coins:0,cells:0,scrap:0,map:'backyard',selectedBug:'ant',selectedKnocker:'hand',
 unlockedMaps:['backyard'],unlockedBugs:['ant'],unlockedKnockers:['hand'],
 bugLevels:Object.fromEntries(BUGS.map(b=>[b.id,1])),bugMastery:Object.fromEntries(BUGS.map(b=>[b.id,0])),bugMasteryClaim:Object.fromEntries(BUGS.map(b=>[b.id,1])),
 stats:Object.fromEntries(STATS.map(s=>[s.id,0])),mutations:Object.fromEntries(MUTATIONS.map(m=>[m.id,0])),gadgets:Object.fromEntries(GADGETS.map(g=>[g.id,0])),
 contracts:Object.fromEntries(MAPS.map(m=>[m.id,[false,false,false,false,false]])),mapStats:makeMapStats(),souvenirs:{},
 best:0,bestMap:'Backyard',totalKnocks:0,totalCoins:0,totalPickups:0,bestCombo:1,cellMilestone:0,cellKnockCounter:0,capsuleProgress:0,momentum:0,challengeWins:0,totalCells:0,totalScrap:0,playSeconds:0,
 musicVol:75,sfxVol:100,shake:true,reducedFx:false
});

function load(){
 const base=defaultState();
 try{
  let raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem(LEGACY_SAVE_KEY);
  if(!raw){
   const old=localStorage.getItem(OLD_SAVE_KEY);
   if(old){const o=JSON.parse(old);return {...base,...o,contracts:base.contracts,mapStats:base.mapStats,bugMastery:base.bugMastery,stats:{...base.stats,...(o.stats||{})},mutations:{...base.mutations,...(o.mutations||{})},bugLevels:{...base.bugLevels,...(o.bugLevels||{})}};}
   return base;
  }
  const d=JSON.parse(raw);
  return {...base,...d,stats:{...base.stats,...(d.stats||{})},mutations:{...base.mutations,...(d.mutations||{})},gadgets:{...base.gadgets,...(d.gadgets||{})},bugLevels:{...base.bugLevels,...(d.bugLevels||{})},bugMastery:{...base.bugMastery,...(d.bugMastery||{})},bugMasteryClaim:{...base.bugMasteryClaim,...(d.bugMasteryClaim||{})},souvenirs:{...base.souvenirs,...(d.souvenirs||{})},contracts:{...base.contracts,...(d.contracts||{})},mapStats:Object.fromEntries(MAPS.map(m=>[m.id,{...base.mapStats[m.id],...(d.mapStats?.[m.id]||{})}]))};
 }catch(e){return base}
}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch(e){}}
let state=load();

const previewParams=new URLSearchParams(location.search), previewMap=previewParams.get('previewMap'), previewDemo=previewParams.get('demo')==='1';
if(previewMap&&MAPS.some(m=>m.id===previewMap)){
 state.map=previewMap;state.unlockedMaps=MAPS.map(m=>m.id);state.unlockedBugs=BUGS.map(b=>b.id);state.unlockedKnockers=KNOCKERS.map(k=>k.id);state.coins=Math.max(state.coins,888888);
 const i=MAPS.findIndex(m=>m.id===previewMap);state.selectedBug=['ladybug','flea','centipede','termite','dragonfly'][i];state.selectedKnocker=['swatter','shoe','newspaper','mallet','pulse'][i];
}

const currentMap=()=>MAPS.find(m=>m.id===state.map)||MAPS[0], currentBug=()=>BUGS.find(b=>b.id===state.selectedBug)||BUGS[0], currentKnocker=()=>KNOCKERS.find(k=>k.id===state.selectedKnocker)||KNOCKERS[0];
const statValue=id=>state.stats[id]||0, mutationValue=id=>state.mutations[id]||0;
const gadgetValue=id=>state.gadgets?.[id]||0;
const bugLevel=b=>state.bugLevels[(b||currentBug()).id]||1;
const masteryXP=b=>state.bugMastery[(b||currentBug()).id]||0;
function masteryLevel(b=currentBug()){return clamp(1+Math.floor(Math.sqrt(masteryXP(b)/75)),1,10)}
function masteryNext(b=currentBug()){const lv=masteryLevel(b);return lv>=10?1:(masteryXP(b)-75*(lv-1)*(lv-1))/(75*(lv*lv-(lv-1)*(lv-1)))}
function bugLevelBonus(b=currentBug()){return 1+(bugLevel(b)-1)*.04+(masteryLevel(b)-1)*.025}
function powerMultiplier(){return (1+statValue('power')*.065)*(1+mutationValue('muscle')*.1)}
function critChance(){return .045+statValue('crit')*.014+currentKnocker().crit}
function critForce(){return 1.52+statValue('crit')*.025}
function bounceMultiplier(){return (1+statValue('bounce')*.023)*(1+mutationValue('spring')*.06)*(1+(currentKnocker().ground||0))}
function airDrag(){return clamp(.9963+statValue('air')*.00012,.9963,.99835)}
function incomeMultiplier(){return (1+statValue('income')*.055)*(1+mutationValue('fortune')*.12)}
function abilityCool(){return clamp((1-statValue('ability')*.032)*(1-mutationValue('coolant')*.05),.35,1)}
function pickupRadius(){return 50+statValue('magnet')*7+mutationValue('collector')*18+gadgetValue('salvage')*20+(currentBug().magnet||0);}
function bugUpgradeCost(b){const lv=bugLevel(b);return Math.round(260*b.value*Math.pow(1.52,lv-1))}
function statCost(s){return Math.round(s.base*Math.pow(s.growth,statValue(s.id)))}
function mutationCost(m){return Math.ceil(m.base*Math.pow(1.55,mutationValue(m.id)))}
function gadgetCost(g){return Math.ceil(g.base*Math.pow(g.growth,gadgetValue(g.id)))}
function capsuleNeed(){return Math.max(3,5-Math.floor(gadgetValue('capsule')/2))}
function momentumMultiplier(){return 1+Math.min(10,state.momentum||0)*.08}
function souvenirCount(){return Object.values(state.souvenirs||{}).filter(Boolean).length}
function contractDoneCount(mapId){return (state.contracts[mapId]||[]).filter(Boolean).length}
function totalContracts(){return MAPS.reduce((n,m)=>n+contractDoneCount(m.id),0)}
function completionPercent(){
 const mapP=state.unlockedMaps.length/MAPS.length, bugP=state.unlockedBugs.length/BUGS.length, knP=state.unlockedKnockers.length/KNOCKERS.length, cP=totalContracts()/25;
 const masteryAvg=BUGS.reduce((n,b)=>n+(state.unlockedBugs.includes(b.id)?Math.min(1,(masteryLevel(b)-1)/4):0),0)/BUGS.length;
 const souvenirP=souvenirCount()/15, gadgetP=GADGETS.reduce((n,g)=>n+gadgetValue(g.id)/g.max,0)/GADGETS.length;
 return Math.round(100*(mapP*.14+bugP*.14+knP*.11+cP*.28+masteryAvg*.13+souvenirP*.11+gadgetP*.09));
}

class AudioEngine{
 constructor(){this.ctx=null;this.master=null;this.music=null;this.sfx=null;this.noise=null}
 ensure(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return true}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;this.ctx=new AC();this.master=this.ctx.createGain();this.music=this.ctx.createGain();this.sfx=this.ctx.createGain();this.music.connect(this.master);this.sfx.connect(this.master);this.master.connect(this.ctx.destination);this.master.gain.value=.42;this.setVolumes();this.makeNoise();startMusic();return true}
 setVolumes(){if(!this.ctx)return;this.music.gain.value=clamp(state.musicVol/100,0,20)*.15;this.sfx.gain.value=clamp(state.sfxVol/100,0,20)*.23}
 makeNoise(){const len=this.ctx.sampleRate*.35,b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.noise=b}
 tone(freq,dur=.1,type='sine',vol=.2,slide=1,dest=this.sfx){if(!this.ctx)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(28,freq*slide),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.02)}
 noiseHit(dur=.1,vol=.16,freq=650){if(!this.ctx||!this.noise)return;const t=this.ctx.currentTime,s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();s.buffer=this.noise;f.type='bandpass';f.frequency.value=freq;f.Q.value=.8;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(this.sfx);s.start(t);s.stop(t+dur+.02)}
 hit(kind){if(kind==='perfect'){this.tone(180,.13,'square',.28,.55);this.tone(610,.16,'triangle',.18,1.6);this.noiseHit(.12,.15)}else if(kind==='crit'){this.tone(125,.2,'sawtooth',.31,.38);this.tone(760,.2,'triangle',.2,1.45);this.noiseHit(.17,.22,420)}else{this.tone(150,.1,'square',.21,.62);this.noiseHit(.09,.11)}}
 bounce(s=.5){this.tone(120+s*90,.065,'triangle',.1+s*.07,.72)}
 coin(gold=false){this.tone(gold?980:730,.055,'sine',.12,1.28);if(gold)setTimeout(()=>this.tone(1320,.08,'sine',.1,1.1),40)}
 ui(){this.tone(440,.045,'triangle',.06,1.08)}
 ability(){this.tone(220,.16,'sawtooth',.15,2.05);this.tone(470,.2,'triangle',.1,1.65)}
}
const audio=new AudioEngine(); const ensureAudio=()=>audio.ensure();
let musicTimer=null,musicStep=0;
function startMusic(){if(musicTimer)return;musicTimer=setInterval(()=>{if(!audio.ctx||state.musicVol<=0)return;const i=MAPS.findIndex(m=>m.id===state.map);const scales=[[196,247,294,392,494],[220,277,330,440,554],[174,220,261,349,440],[147,196,220,294,392],[196,246,311,392,493]];const seq=scales[i]||scales[0],step=musicStep%16,f=seq[step%seq.length]*(step>=8?2:1);audio.tone(f,.15,i===4?'sawtooth':'triangle',.045,.99,audio.music);if(step%4===0)audio.tone(seq[0]/2,.22,'sine',.035,.92,audio.music);if(step%8===4&&i>1)audio.noiseHit(.035,.018,1800);musicStep++},240)}

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),1900)}
function spend(cost){if(state.coins<cost){toast('Not enough coins');return false}state.coins-=cost;audio.ui();return true}
function spendScrap(cost){if(state.scrap<cost){toast('Not enough Scrap');return false}state.scrap-=cost;audio.ui();return true}
function addCells(n,label='CELLS'){n=Math.max(0,Math.floor(n));if(!n)return;state.cells+=n;state.totalCells=(state.totalCells||0)+n;if(flight)floater(W*.5,105,`+${n} ${label}`,'#67efff',17)}
function addScrap(n,label='SCRAP'){n=Math.max(0,Math.floor(n));if(!n)return;state.scrap+=n;state.totalScrap=(state.totalScrap||0)+n;if(flight)floater(W*.58,130,`+${n} ${label}`,'#ffbf5f',15)}
function mapStat(id=state.map){return state.mapStats[id]}
function contractProgress(c,mapId){const s=state.mapStats[mapId];return Math.min(c.goal,s[c.type]||0)}
function checkContracts(mapId=state.map){const list=CONTRACTS[mapId],done=state.contracts[mapId];let changed=false;list.forEach((c,i)=>{if(!done[i]&&contractProgress(c,mapId)>=c.goal){done[i]=true;const coinReward=Math.round(c.coins*(1+statValue('contract')*.08));const scrapReward=3+MAPS.findIndex(m=>m.id===mapId)*2+i;state.coins+=coinReward;state.totalCoins+=coinReward;addCells(c.cells);addScrap(scrapReward);changed=true;toast(`${c.title} complete: +${fmt(coinReward)} coins, +${c.cells} Cells, +${scrapReward} Scrap`);audio.ability()}});if(changed)save()}

function renderUI(){
 const map=currentMap(),bug=currentBug(),kn=currentKnocker(),cp=completionPercent();
 $('#coinsText').textContent=fmt(state.coins);$('#cellsText').textContent=fmt(state.cells);$('#scrapText').textContent=fmt(state.scrap||0);$('#mapSubtitle').textContent=`${map.name} · ${map.tag}`;
 $('#targetName').textContent=bug.name;$('#targetLevel').textContent=`Mastery ${masteryLevel(bug)} · Upgrade ${bugLevel(bug)}`;$('#knockerName').textContent=kn.name;$('#knockerPower').textContent=`Power ${(kn.power*powerMultiplier()).toFixed(2)}x`;
 $('#bestDistance').textContent=(state.best||0).toFixed(1)+' m';$('#bestMap').textContent=state.bestMap||'Backyard';$('#mapsUnlockedText').textContent=`${state.unlockedMaps.length} / ${MAPS.length} unlocked`;
 $('#completionText').textContent=cp+'%';$('#completionBar').style.width=cp+'%';$('#journeyMaps').textContent=`${state.unlockedMaps.length}/5 maps`;$('#journeyBugs').textContent=`${state.unlockedBugs.length}/10 bugs`;$('#journeyKnockers').textContent=`${state.unlockedKnockers.length}/8 knockers`;$('#journeyContracts').textContent=`${totalContracts()}/25 contracts`;if($('#journeySouvenirs'))$('#journeySouvenirs').textContent=`${souvenirCount()}/15 souvenirs`;if($('#journeyChallenges'))$('#journeyChallenges').textContent=`${state.challengeWins||0} challenge wins`;
 $('#careerKnocks').textContent=fmt(state.totalKnocks);$('#careerCoins').textContent=fmt(state.totalCoins);$('#careerPickups').textContent=fmt(state.totalPickups);$('#careerCombo').textContent='x'+state.bestCombo.toFixed(1);$('#careerCells').textContent=fmt(state.totalCells||0);$('#careerScrap').textContent=fmt(state.totalScrap||0);$('#souvenirCount').textContent=`${souvenirCount()} / 15 found`;$('#momentumText').textContent=`x${momentumMultiplier().toFixed(2)}`;$('#capsuleText').textContent=`${state.capsuleProgress||0} / ${capsuleNeed()} knocks`;
 renderMaps();renderContracts();renderKnockers();renderBugs();renderStats();renderMutations();renderGadgets();renderSouvenirs();renderAbilities();
}
function renderMaps(){const host=$('#mapCards');host.innerHTML='';MAPS.forEach((m,i)=>{const unlocked=state.unlockedMaps.includes(m.id),selected=state.map===m.id,prev=i?MAPS[i-1]:null,needMet=!prev||contractDoneCount(prev.id)>=m.unlockNeed;const b=document.createElement('button');b.type='button';b.className=`map-card ${unlocked?'':'locked'} ${selected?'selected':''}`;b.style.setProperty('--mapbg',`linear-gradient(145deg,${m.sky1},${m.ground})`);let price=unlocked?(selected?'ACTIVE':'OPEN'):needMet?fmt(m.cost)+' coins':`${m.unlockNeed} contracts`;b.innerHTML=`<span class="map-medals">${contractDoneCount(m.id)}/5 contracts</span><span class="map-cost">${price}</span><strong>${m.name}</strong><small>${m.tag}</small>`;b.addEventListener('click',()=>{ensureAudio();if(!unlocked){if(!needMet){toast(`Complete ${m.unlockNeed} contracts in ${prev.name} first`);return}if(!spend(m.cost))return;state.unlockedMaps.push(m.id);toast(`${m.name} unlocked`)}state.map=m.id;resetFlight(true);save();renderUI();audio.ui()});host.appendChild(b)})}
function renderContracts(){const host=$('#contractCards');host.innerHTML='';$('#contractMapName').textContent=currentMap().name;CONTRACTS[state.map].forEach((c,i)=>{const done=state.contracts[state.map][i],p=contractProgress(c,state.map),pct=Math.min(100,p/c.goal*100);const card=document.createElement('div');card.className='contract-card '+(done?'done':'');card.innerHTML=`<span class="contract-num">CONTRACT ${i+1}</span><strong>${c.title}</strong><small>${c.desc}</small><div class="mini-progress"><i style="width:${done?100:pct}%"></i></div><div class="contract-reward">${done?'Claimed':`${formatProgress(p,c.type)} / ${formatProgress(c.goal,c.type)} · ${fmt(c.coins)} coins · ${c.cells} Cells · ${3+MAPS.findIndex(m=>m.id===state.map)*2+i} Scrap`}</div>`;host.appendChild(card)})}
function formatProgress(v,type){return type==='bestCombo'?'x'+Number(v).toFixed(1):type==='bestDistance'?Number(v).toFixed(0)+'m':fmt(v)}
function bugIconSVG(b){
 const c=b.color,a=b.accent||'#111',wing=['moth','dragonfly'].includes(b.id),spots=b.id==='ladybug';
 if(b.id==='centipede')return `<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="#10151a" stroke-width="3" stroke-linecap="round">${Array.from({length:7},(_,i)=>`<path d="M${12+i*7} 30 l-6 -10 M${12+i*7} 35 l7 10"/>`).join('')}</g>${Array.from({length:7},(_,i)=>`<circle cx="${11+i*7}" cy="32" r="7" fill="${i?c:a}" stroke="#10151a" stroke-width="2"/>`).join('')}<circle cx="8" cy="29" r="2" fill="white"/></svg>`;
 return `<svg viewBox="0 0 64 64" aria-hidden="true">${wing?`<g fill="${b.id==='dragonfly'?'rgba(120,225,242,.5)':'rgba(225,207,186,.72)'}" stroke="rgba(255,255,255,.5)" stroke-width="1"><ellipse cx="31" cy="20" rx="19" ry="8" transform="rotate(-18 31 20)"/><ellipse cx="33" cy="44" rx="20" ry="8" transform="rotate(18 33 44)"/></g>`:''}<g stroke="${a}" stroke-width="3" stroke-linecap="round"><path d="M29 29 L18 18 L8 16 M31 34 L17 47 L7 49 M39 28 L49 17 L58 18 M39 36 L50 47 L59 45"/></g><ellipse cx="42" cy="32" rx="16" ry="12" fill="${spots?'#df4545':c}" stroke="#10151a" stroke-width="2"/>${spots?'<g fill="#12161a"><circle cx="36" cy="27" r="2.5"/><circle cx="47" cy="27" r="2.5"/><circle cx="37" cy="37" r="2.5"/><circle cx="48" cy="37" r="2.5"/></g>':''}<ellipse cx="27" cy="32" rx="10" ry="9" fill="${a}" stroke="#10151a" stroke-width="2"/><circle cx="15" cy="32" r="8" fill="${c}" stroke="#10151a" stroke-width="2"/><circle cx="12" cy="29" r="2.2" fill="white"/><path d="M12 24 Q6 15 3 19 M17 24 Q15 13 10 14" fill="none" stroke="${a}" stroke-width="2" stroke-linecap="round"/></svg>`;
}
function knockerIconSVG(k){
 const common='stroke="#dce9f6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"';
 const shapes={
  hand:`<path d="M18 44 C13 35 14 26 18 24 C21 23 22 29 23 31 L24 13 C24 9 30 9 30 13 L30 27 L33 10 C34 7 39 8 39 12 L38 28 L42 13 C43 10 48 11 48 15 L45 32 C50 27 55 29 54 34 C52 44 44 51 32 51 C25 51 20 48 18 44Z" fill="#e9b98f" stroke="#6e4936" stroke-width="2"/>`,
  swatter:`<path d="M15 52 L34 31" ${common}/><rect x="31" y="9" width="23" height="23" rx="4" stroke="#dce9f6" stroke-width="3" fill="rgba(99,232,255,.16)"/><path d="M37 12 V29 M44 12 V29 M51 12 V29 M34 16 H52 M34 23 H52" stroke="#7bcfe0" stroke-width="1.4"/>`,
  shoe:`<path d="M8 42 Q20 39 24 24 L36 27 Q39 38 54 42 L55 49 H10 Q6 48 8 42Z" fill="#d4dbe4" stroke="#657180" stroke-width="2"/><path d="M28 30 H39 M27 34 H41" stroke="#657180" stroke-width="2"/>`,
  newspaper:`<rect x="12" y="10" width="40" height="44" rx="3" fill="#eef2f6" stroke="#738090" stroke-width="2"/><path d="M19 18 H44 M19 24 H46 M19 33 H30 M34 33 H46 M19 39 H30 M34 39 H46 M19 46 H46" stroke="#778493" stroke-width="2"/>`,
  mallet:`<path d="M18 51 L38 28" ${common}/><rect x="30" y="12" width="25" height="18" rx="6" fill="#e56d6d" stroke="#7d3535" stroke-width="2"/>`,
  springbat:`<path d="M14 52 L30 35" ${common}/><path d="M29 35 C19 28 43 27 31 20 C20 13 44 12 35 7" stroke="#9feaff" stroke-width="3" fill="none"/><rect x="31" y="5" width="19" height="8" rx="4" fill="#dce9f6"/>`,
  vacuum:`<path d="M12 48 L29 34" ${common}/><path d="M25 37 L38 24 L52 31 L40 44Z" fill="#79d8e6" stroke="#316776" stroke-width="2"/><circle cx="47" cy="36" r="3" fill="#15202b"/>`,
  pulse:`<path d="M17 51 L36 29" ${common}/><rect x="29" y="12" width="27" height="18" rx="4" fill="#7c6fc1" stroke="#403878" stroke-width="2"/><path d="M43 10 L38 20 H44 L39 31 L50 18 H44 L49 10Z" fill="#67efff"/>`
 };
 return `<svg viewBox="0 0 64 64" aria-hidden="true">${shapes[k.id]||shapes.hand}</svg>`;
}
function renderKnockers(){const host=$('#knockerCards');host.innerHTML='';KNOCKERS.forEach(k=>{const unlocked=state.unlockedKnockers.includes(k.id),selected=state.selectedKnocker===k.id;const c=document.createElement('div');c.className='upgrade-card';c.innerHTML=`<div class="upgrade-icon">${knockerIconSVG(k)}</div><div class="upgrade-copy"><strong>${k.name}</strong><small>${k.trait} · ${k.power.toFixed(2)}x force</small></div><button type="button" class="${selected?'selected':''}">${selected?'Selected':unlocked?'Equip':fmt(k.cost)}</button>`;const btn=c.querySelector('button');if(!unlocked&&state.coins>=k.cost)btn.classList.add('afford');btn.addEventListener('click',()=>{ensureAudio();if(!unlocked){if(!spend(k.cost))return;state.unlockedKnockers.push(k.id);toast(`${k.name} unlocked`)}state.selectedKnocker=k.id;save();renderUI()});host.appendChild(c)})}
function renderBugs(){const host=$('#bugCards');host.innerHTML='';BUGS.forEach(b=>{const unlocked=state.unlockedBugs.includes(b.id),selected=state.selectedBug===b.id,lv=bugLevel(b),ml=masteryLevel(b),cost=bugUpgradeCost(b),prog=ml>=10?100:masteryNext(b)*100;const c=document.createElement('div');c.className='upgrade-card';let label=!unlocked?fmt(b.cost):selected?`Train ${fmt(cost)}`:'Target';c.innerHTML=`<div class="upgrade-icon">${bugIconSVG(b)}</div><div class="upgrade-copy"><strong>${b.name} · M${ml} · U${lv}</strong><small>${b.perk}</small><div class="mastery-line"><i style="width:${prog}%"></i></div></div><button type="button" class="${selected?'selected':''}">${label}</button>`;const btn=c.querySelector('button');if((!unlocked&&state.coins>=b.cost)||(unlocked&&selected&&state.coins>=cost))btn.classList.add('afford');btn.addEventListener('click',()=>{ensureAudio();if(!unlocked){if(!spend(b.cost))return;state.unlockedBugs.push(b.id);state.selectedBug=b.id;toast(`${b.name} unlocked`)}else if(selected){if(!spend(cost))return;state.bugLevels[b.id]=lv+1;toast(`${b.name} upgraded to U${lv+1}`)}else{state.selectedBug=b.id;toast(`${b.name} selected`)}resetFlight(true);save();renderUI()});host.appendChild(c)})}
function renderStats(){const host=$('#statCards');host.innerHTML='';STATS.forEach(s=>{const lv=statValue(s.id),max=lv>=s.max,cost=statCost(s),c=document.createElement('div');c.className='stat-card';c.innerHTML=`<div class="stat-card-head"><strong>${s.name}</strong><span class="level">LV ${lv}/${s.max}</span></div><p>${s.desc}</p><button type="button" ${max?'disabled':''}>${max?'MAX':fmt(cost)+' coins'}</button>`;const btn=c.querySelector('button');if(!max&&state.coins>=cost)btn.classList.add('afford');btn.addEventListener('click',()=>{ensureAudio();if(max||!spend(cost))return;state.stats[s.id]=lv+1;save();renderUI();toast(`${s.name} upgraded`)});host.appendChild(c)})}
function renderMutations(){const host=$('#mutationCards');host.innerHTML='';MUTATIONS.forEach(m=>{const lv=mutationValue(m.id),max=lv>=m.max,cost=mutationCost(m),c=document.createElement('div');c.className='stat-card';c.innerHTML=`<div class="stat-card-head"><strong>${m.name}</strong><span class="level">LV ${lv}/${m.max}</span></div><p>${m.desc}</p><button type="button" ${max?'disabled':''}>${max?'MAX':cost+' Cells'}</button>`;const btn=c.querySelector('button');if(!max&&state.cells>=cost)btn.classList.add('afford');btn.addEventListener('click',()=>{ensureAudio();if(max)return;if(state.cells<cost){toast('Not enough Cells');return}state.cells-=cost;state.mutations[m.id]=lv+1;audio.ability();save();renderUI();toast(`${m.name} mutated`)});host.appendChild(c)})}
function renderGadgets(){const host=$('#gadgetCards');host.innerHTML='';GADGETS.forEach(g=>{const lv=gadgetValue(g.id),max=lv>=g.max,cost=gadgetCost(g),c=document.createElement('div');c.className='stat-card gadget-card';c.innerHTML=`<div class="stat-card-head"><strong>${g.name}</strong><span class="level amber-level">LV ${lv}/${g.max}</span></div><p>${g.desc}</p><button type="button" ${max?'disabled':''}>${max?'MAX':cost+' Scrap'}</button>`;const btn=c.querySelector('button');if(!max&&state.scrap>=cost)btn.classList.add('afford');btn.addEventListener('click',()=>{ensureAudio();if(max||!spendScrap(cost))return;state.gadgets[g.id]=lv+1;audio.ability();save();renderUI();toast(`${g.name} upgraded`)});host.appendChild(c)})}
function renderSouvenirs(){const host=$('#souvenirCards');host.innerHTML='';MAPS.forEach(map=>{(SOUVENIRS[map.id]||[]).forEach(([name,seg,lane],i)=>{const key=`${map.id}:${i}`,found=!!state.souvenirs[key],d=document.createElement('div');d.className='souvenir-card '+(found?'found':'');d.innerHTML=`<span>${map.name}</span><strong>${found?name:'Unknown find'}</strong><small>${found?'Discovered':'Hidden somewhere on this map'}</small>`;host.appendChild(d)})})}

const canvas=$('#gameCanvas'),ctx=canvas.getContext('2d');let W=1280,H=720,groundY=520,cameraX=0,time=0,last=performance.now(),meter=.08,meterDir=1,flight=null,particles=[],rings=[],floaters=[],shakeX=0,shakeY=0;
let cooldowns={mega:0,boost:0,coin:0,slam:0},megaArmed=false,magnetUntil=0,activeBoost=false,slamArmed=false,glideHeld=false,diveHeld=false,airEnergy=100;
function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(r.width<2)return;canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.width*9/16*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);W=r.width;H=r.width*9/16;groundY=H*.735}resize();addEventListener('resize',resize);
function hash(n){let x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
function worldToScreenX(x){return x-cameraX+W*.075}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function punchShake(p){if(!state.shake)return;shakeX=(Math.random()-.5)*p;shakeY=(Math.random()-.5)*p}
function spawnParticle(x,y,color,force=1){particles.push({x,y,vx:(Math.random()*2-1)*70*force,vy:(Math.random()*-1.1-.15)*80*force,life:.45+Math.random()*.45,max:.9,size:2+Math.random()*4,color,grav:180+Math.random()*200});if(particles.length>280)particles.splice(0,particles.length-280)}
function floater(x,y,text,color='#fff',size=15){floaters.push({x,y,text,color,size,life:1,max:1,vy:-32})}
function worldDistance(){return flight?Math.max(0,(flight.maxX-80)/34):0}
function comboWindow(){return 2.1*(1+(currentBug().combo||0)+(currentKnocker().combo||0))}
function addCombo(amount=.12){if(!flight)return;const now=performance.now()/1000;if(now-flight.lastComboTime>comboWindow())flight.combo=1;flight.lastComboTime=now;flight.combo=clamp(flight.combo+amount,1,5);flight.bestCombo=Math.max(flight.bestCombo,flight.combo);state.bestCombo=Math.max(state.bestCombo,flight.combo);$('#comboReadout').textContent=`Combo x${flight.combo.toFixed(1)}`;if(flight.combo>=2)$('#comboBanner').textContent=`x${flight.combo.toFixed(1)} COMBO`}
function addRunCoins(raw,x,y,label=''){if(!flight)return 0;let amount=Math.max(1,Math.round(raw*currentMap().coin*currentBug().value*bugLevelBonus()*incomeMultiplier()*momentumMultiplier()*flight.combo*flight.eventCoin));if(currentBug().perkCoin)amount=Math.round(amount*(1+currentBug().perkCoin));flight.runCoins+=amount;state.coins+=amount;state.totalCoins+=amount;state.mapStats[state.map].mapCoins+=amount;$('#runCoins').textContent=fmt(flight.runCoins);if(label)floater(worldToScreenX(x),y,`+${fmt(amount)} ${label}`,currentMap().accent,13);return amount}

function featureSeed(segment,mapIndex){return segment*31+mapIndex*997}
function coinFeaturesForSegment(segment,map){
 const i=MAPS.indexOf(map),seed=featureSeed(segment,i),baseX=segment*190+82,features=[];const storm=flight?.event==='coinStorm';const count=(storm?12:9)+Math.floor(gadgetValue('scanner')/3);const pattern=Math.floor(hash(seed)*6);
 const laneYs=[groundY-46,groundY-H*.17,groundY-H*.34,Math.max(74,groundY-H*.53)];
 for(let j=0;j<count;j++){
  let lane;
  if(pattern===0)lane=j%4;else if(pattern===1)lane=j<4?0:3;else if(pattern===2)lane=j%2?1:2;else if(pattern===3)lane=3-(j%4);else if(pattern===4)lane=(j<3?3:j<6?2:0);else lane=Math.floor(hash(seed+j*9)*4);
  const arc=Math.sin((j/(count-1||1))*Math.PI)*(-10-22*hash(seed+j));
  const y=Math.max(58,laneYs[lane]+arc);
  const gold=hash(seed+j*27)>.9;
  features.push({kind:'coin',key:`${map.id}:${segment}:${j}`,x:baseX+j*22,y,lane,gold,value:[8,11,15,21][lane]});
 }
 // Predictable premium pickups make Cells and Scrap something you can actively chase.
 if(segment>0&&segment%6===2){const lane=(segment+i)%4;features.push({kind:'cell',key:`cell:${map.id}:${segment}`,x:segment*190+156,y:laneYs[lane],lane,gold:false,value:1});}
 if(segment>0&&segment%4===1){const lane=(segment+i+1)%4;features.push({kind:'scrap',key:`scrap:${map.id}:${segment}`,x:segment*190+132,y:laneYs[lane]+8,lane,gold:false,value:1+Math.floor(i/2)});}
 return features;
}
function specialForSegment(segment,map){
 if(segment<1||segment%3!==0)return null;const x=segment*190+110,k=(segment+MAPS.indexOf(map))%2;
 const table={backyard:k?'wind':'flower',kitchen:k?'fan':'toaster',apartment:k?'vent':'carpet',sewer:k?'jet':'slimeRail',lab:k?'gravity':'portal'};
 return {key:`sp:${map.id}:${segment}`,x,type:table[map.id]};
}
function obstacleForSegment(segment,map){
 if(segment<1||segment%2===0)return null;const types={backyard:['stone','watering','gnome'],kitchen:['mug','fork','cereal'],apartment:['box','plant','cart'],sewer:['crate','pipe','can'],lab:['pod','coil','drone']}[map.id];const type=types[Math.abs(segment*7+3)%types.length];return {x:segment*190+115,w:42+(segment*17)%36,h:34+(segment*13)%52,type,key:`ob:${map.id}:${segment}`};
}

function paydayForSegment(segment,map){
 if(segment<5||segment%5!==0)return null;
 const names={backyard:'POLLEN GATE',kitchen:'CRUMB CACHE',apartment:'MAIL BONUS',sewer:'DRAIN JACKPOT',lab:'QUANTUM VAULT'};
 return {key:`pay:${map.id}:${segment}`,x:segment*190+78,name:names[map.id]};
}

function souvenirForSegment(segment,map){
 const arr=SOUVENIRS[map.id]||[];
 for(let i=0;i<arr.length;i++){const [name,seg,lane]=arr[i];if(seg!==segment)continue;const key=`${map.id}:${i}`;if(state.souvenirs[key])return null;const y=[groundY-58,groundY-H*.18,groundY-H*.35,groundY-H*.53][lane];return {key,name,x:segment*190+145,y,lane,index:i};}
 return null;
}
function makeChallenge(){const i=MAPS.findIndex(m=>m.id===state.map),type=CHALLENGE_TYPES[Math.floor(Math.random()*CHALLENGE_TYPES.length)],goal=type.goal(i);return {id:type.id,label:type.label,goal};}
function challengeProgress(f,c){if(!f||!c)return 0;if(c.id==='distance')return worldDistance();if(c.id==='combo')return f.bestCombo;return f[c.id]||0;}
function challengeDone(f,c){return challengeProgress(f,c)>=c.goal;}
function challengeText(c){if(!c)return'Launch to receive a challenge';const val=flight?challengeProgress(flight,c):0;const fmtV=c.id==='distance'?`${Math.min(val,c.goal).toFixed(0)}/${c.goal} m`:c.id==='combo'?`x${Math.min(val,c.goal).toFixed(1)}/x${c.goal.toFixed(1)}`:`${Math.min(Math.floor(val),c.goal)}/${c.goal}`;return `${c.label}: ${fmtV}`;}
function awardChallenge(f){if(!f?.challenge||f.challengeAwarded||!challengeDone(f,f.challenge))return false;f.challengeAwarded=true;const i=MAPS.findIndex(m=>m.id===state.map),coin=260*Math.pow(4.1,i)*(1+state.momentum*.08),cells=1+(i>=3?1:0),scrap=2+i*2;state.coins+=Math.round(coin);state.totalCoins+=Math.round(coin);addCells(cells);addScrap(scrap);state.momentum=Math.min(10,(state.momentum||0)+1);state.challengeWins=(state.challengeWins||0)+1;toast(`Challenge clear: +${fmt(coin)} coins, +${cells} Cells, +${scrap} Scrap`);audio.ability();return true;}
function openCapsule(){const i=MAPS.findIndex(m=>m.id===state.map),cells=1+Math.floor(Math.random()*3)+(i>=4?1:0),scrap=5+i*3+Math.floor(Math.random()*5),coins=Math.round((700*Math.pow(4.1,i))*(.85+Math.random()*.55));state.coins+=coins;state.totalCoins+=coins;addCells(cells);addScrap(scrap);toast(`Field Capsule: +${fmt(coins)} coins, +${cells} Cells, +${scrap} Scrap`);audio.ability();}

function timingGrade(v){const d=Math.abs(v-.5);if(d<.042)return['PERFECT',1.28,'perfect'];if(d<.115)return['GREAT',1.13,'good'];if(d<.23)return['GOOD',1,'good'];return['ROUGH',.82,'poor']}
function rollEvent(){const bonus=gadgetValue('event')*.02,r=Math.random();if(r<.08+bonus)return'golden';if(r<.15+bonus*1.5)return'lowGravity';if(r<.22+bonus*2)return'coinStorm';if(r<.29+bonus*2.5)return'scrapRush';if(r<.34+bonus*3)return'cellSurge';return'normal'}
function eventName(e){return{golden:'GOLDEN RUN: all run coins pay 2x',lowGravity:'LOW GRAVITY: stay airborne longer',coinStorm:'COIN STORM: extra pickup trails',scrapRush:'SCRAP RUSH: smashes drop extra Scrap',cellSurge:'CELL SURGE: finish the run for +2 Cells',normal:''}[e]}
function launch(){
 if(flight?.active)return;ensureAudio();const [grade,timingMult,audioKind]=timingGrade(meter),bug=currentBug(),map=currentMap(),kn=currentKnocker();const crit=Math.random()<critChance();let mult=timingMult*(crit?critForce():1)*(megaArmed?1.5:1);if(grade==='PERFECT')mult*=1+(bug.perfect||0)+(kn.perfect||0);megaArmed=false;
 const base=315*kn.power*powerMultiplier()*mult/Math.pow(bug.weight,.52),angle=(32+(meter-.5)*8)*Math.PI/180,event=rollEvent();
 flight={active:true,x:80,y:groundY-35,vx:base*Math.cos(angle),vy:-base*Math.sin(angle)*.78,rot:0,vr:7+Math.random()*5,bounces:0,objects:0,specials:0,pickups:0,air:0,maxX:80,trail:[],crit,grade,runCoins:0,collected:new Set(),hitObjects:new Set(),hitSpecials:new Set(),hitPaydays:new Set(),combo:1,bestCombo:1,lastComboTime:0,lastDistanceAward:0,event,eventCoin:event==='golden'?2:1,slammed:false,challenge:makeChallenge(),challengeAwarded:false,souvenirHit:false,skyCapReward:false};
 cameraX=0;activeBoost=false;slamArmed=false;glideHeld=false;diveHeld=false;airEnergy=100;$('#energyText').textContent='100%';$('#energyFill').style.width='100%';$('#runCoins').textContent='0';$('#comboReadout').textContent='Combo x1.0';$('#comboBanner').textContent='';const eb=$('#eventBanner');if(event!=='normal'){eb.textContent=eventName(event);eb.classList.remove('hidden')}else eb.classList.add('hidden');
 audio.hit(crit?'crit':audioKind);$('#timingText').textContent=crit?`${grade} CRIT`:grade;$('#distanceBanner').textContent=crit?'Critical launch!':grade==='PERFECT'?'Perfect timing!':'Bug launched';$('#distanceBanner').classList.add('hot');setTimeout(()=>$('#distanceBanner').classList.remove('hot'),330);punchShake(crit?14:7);for(let i=0;i<(state.reducedFx?10:30);i++)spawnParticle(86,groundY-28,map.accent,3);rings.push({x:88,y:groundY-30,r:8,a:1,color:map.accent});state.totalKnocks++;state.mapStats[state.map].flights++;
 state.cellKnockCounter=(state.cellKnockCounter||0)+1;const cellEvery=Math.max(2,3-gadgetValue('extractor'));if(state.cellKnockCounter>=cellEvery){state.cellKnockCounter=0;addCells(1);toast(`Cell Extractor: +1 Cell every ${cellEvery} knocks`)}
 state.capsuleProgress=(state.capsuleProgress||0)+1;if(state.capsuleProgress>=capsuleNeed()){state.capsuleProgress=0;openCapsule()}
 $('#runChallengeText').textContent=challengeText(flight.challenge);$('#momentumText').textContent=`x${momentumMultiplier().toFixed(2)}`;$('#capsuleText').textContent=`${state.capsuleProgress} / ${capsuleNeed()} knocks`;save();
}
$('#knockBtn').addEventListener('click',()=>{$('#knockBtn').classList.add('pressed');setTimeout(()=>$('#knockBtn').classList.remove('pressed'),80);launch()});
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')e.preventDefault()},{passive:false});
function bindHold(btn,on,onRelease){const start=e=>{e.preventDefault();on();};const end=e=>{e.preventDefault();onRelease();};btn.addEventListener('pointerdown',start,{passive:false});btn.addEventListener('pointerup',end,{passive:false});btn.addEventListener('pointercancel',end,{passive:false});btn.addEventListener('pointerleave',e=>{if(e.buttons)end(e)},{passive:false});}
bindHold($('#glideBtn'),()=>glideHeld=true,()=>glideHeld=false);bindHold($('#diveBtn'),()=>diveHeld=true,()=>diveHeld=false);

function renderAbilities(){const now=Date.now();[['mega','megaBtn','megaState'],['boost','boostBtn','boostState'],['coin','coinBtn','coinState'],['slam','slamBtn','slamState']].forEach(([id,bid,sid])=>{const left=Math.max(0,(cooldowns[id]-now)/1000),btn=$('#'+bid),lab=$('#'+sid);btn.disabled=left>0||((id==='boost'||id==='slam')&&!flight?.active);const active=id==='mega'?megaArmed:id==='boost'?activeBoost:id==='coin'?now<magnetUntil:slamArmed;btn.classList.toggle('ready',left<=0);btn.classList.toggle('active',active);lab.textContent=left>0?left.toFixed(1)+'s':active?(id==='mega'?'Armed':'Active'):'Ready'})}
setInterval(renderAbilities,120);
function useAbility(id){ensureAudio();const now=Date.now();if(cooldowns[id]>now)return;const cool=abilityCool();audio.ability();if(id==='mega'){megaArmed=true;cooldowns.mega=now+19000*cool;toast('Mega Knock armed')}if(id==='boost'){if(!flight?.active)return;activeBoost=true;flight.vx*=1.12;flight.vy-=145;cooldowns.boost=now+13500*cool;for(let i=0;i<22;i++)spawnParticle(flight.x,flight.y,'#65dfff',2.2);setTimeout(()=>activeBoost=false,1100)}if(id==='coin'){magnetUntil=now+9000;cooldowns.coin=now+25000*cool;toast('Coin Magnet active for 9 seconds')}if(id==='slam'){if(!flight?.active)return;slamArmed=true;flight.vy=Math.max(520,Math.abs(flight.vy)+300);cooldowns.slam=now+21000*cool;toast('Ground Slam armed')}}
$('#megaBtn').addEventListener('click',()=>useAbility('mega'));$('#boostBtn').addEventListener('click',()=>useAbility('boost'));$('#coinBtn').addEventListener('click',()=>useAbility('coin'));$('#slamBtn').addEventListener('click',()=>useAbility('slam'));

function routeBonus(lane,map){const fav={backyard:0,kitchen:1,apartment:0,sewer:2,lab:3}[map.id];return lane===fav?(map.id==='lab'?1.35:1.25):1;}
function routeName(lane,map){const names=['GROUND','MID','HIGH','SKY'];const fav={backyard:0,kitchen:1,apartment:0,sewer:2,lab:3}[map.id];return `${names[lane]}${lane===fav?' SIGNATURE':''}`;}
function collectNearby(f,map){
 const seg=Math.floor(f.x/190),magnet=pickupRadius()*(1+(currentKnocker().magnet||0))*(Date.now()<magnetUntil?3.2:1);
 for(let s=seg-2;s<=seg+2;s++){
  for(const c of coinFeaturesForSegment(s,map)){
   if(f.collected.has(c.key))continue;const dx=f.x-c.x,dy=f.y-c.y,dist=Math.hypot(dx,dy);
   if(dist<magnet){
    f.collected.add(c.key);f.pickups++;state.totalPickups++;state.mapStats[state.map].pickups++;addCombo(c.kind==='cell'?.18:c.kind==='scrap'?.13:c.gold?.2:.09);
    if(c.kind==='cell'){addCells(1,'CELL');audio.ability();for(let i=0;i<(state.reducedFx?4:11);i++)spawnParticle(c.x,c.y,'#67efff',1.25)}
    else if(c.kind==='scrap'){addScrap(c.value||1);audio.coin(true);for(let i=0;i<(state.reducedFx?4:10);i++)spawnParticle(c.x,c.y,'#ffab67',1.15)}
    else{let raw=c.value*(c.gold?5:1)*(1+gadgetValue('scanner')*.08)*routeBonus(c.lane,map);if(c.lane===3)raw*=1.22;if(c.lane===2&&currentBug().highPay)raw*=1+currentBug().highPay;addRunCoins(raw,c.x,c.y,c.gold?'GOLD':'');audio.coin(c.gold);for(let i=0;i<(state.reducedFx?3:8);i++)spawnParticle(c.x,c.y,c.gold?'#ffd75e':map.accent,1.1)}
   }
  }
  const sv=souvenirForSegment(s,map);if(sv&&!f.collected.has('sv:'+sv.key)&&Math.hypot(f.x-sv.x,f.y-sv.y)<magnet+22){f.collected.add('sv:'+sv.key);state.souvenirs[sv.key]=true;f.souvenirHit=true;const mi=MAPS.indexOf(map),cell=2+mi,scrap=10+mi*5,jackpot=550*Math.pow(3.8,mi);addCells(cell);addScrap(scrap);addRunCoins(jackpot/(map.coin*currentBug().value*bugLevelBonus()*incomeMultiplier()*momentumMultiplier()*f.combo*f.eventCoin),sv.x,sv.y,'SOUVENIR');toast(`Souvenir found: ${sv.name}`);audio.ability();rings.push({x:sv.x,y:sv.y,r:10,a:1,color:'#ffbf5f'});save();}
 }
}
function hitWorldFeatures(f,map){
 const seg=Math.floor(f.x/190);
 for(let s=seg-1;s<=seg+1;s++){
  const o=obstacleForSegment(s,map);if(o&&!f.hitObjects.has(o.key)&&Math.abs(f.x-o.x)<o.w*.62&&f.y>groundY-o.h-25&&f.y<groundY){f.hitObjects.add(o.key);f.objects++;state.mapStats[state.map].objects++;addCombo(.2);let pay=(24+f.objects*7)*(1+gadgetValue('bumper')*.12);if(currentBug().objectPay)pay*=1+currentBug().objectPay;if(currentKnocker().object)pay*=1+currentKnocker().object;addRunCoins(pay,o.x,f.y,'SMASH');const salvage=1+(Math.random()<gadgetValue('salvage')*.1?1:0)+(MAPS.indexOf(map)>=3&&Math.random()<.35?1:0)+(f.event==='scrapRush'?3:0);addScrap(salvage);f.vx*=1.035+(currentBug().demolition?.08:0)+(currentKnocker().pulse?.035:0);f.vy=-Math.abs(f.vy)*.35-70;audio.bounce(.9);punchShake(6);for(let i=0;i<(state.reducedFx?5:15);i++)spawnParticle(f.x,f.y,map.accent,1.5)}
  const sp=specialForSegment(s,map);if(sp&&!f.hitSpecials.has(sp.key)&&Math.abs(f.x-sp.x)<70){let trigger=false;if(sp.type==='flower'&&f.y>groundY-95){f.vy=-Math.max(300,Math.abs(f.vy)*1.15);f.vx*=1.03;trigger=true}else if(sp.type==='wind'&&f.y<groundY-30){f.vy-=110;f.vx*=1.045;trigger=true}else if(sp.type==='toaster'&&f.y>groundY-100){f.vy-=330;f.vx*=1.08;trigger=true}else if(sp.type==='fan'){f.vx*=1.13;f.vy-=70;trigger=true}else if(sp.type==='vent'&&f.y>groundY-150){f.vy-=280;trigger=true}else if(sp.type==='carpet'&&f.y>groundY-70){f.vx*=1.18;trigger=true}else if(sp.type==='jet'){f.vy-=300;f.vx*=1.07;trigger=true}else if(sp.type==='slimeRail'&&f.y>groundY-80){f.vx*=1.22;f.vy=-80;trigger=true}else if(sp.type==='gravity'){f.vy-=190;f.vx*=1.07;trigger=true}else if(sp.type==='portal'){f.x+=85;f.vx*=1.09;trigger=true}
   if(trigger){f.hitSpecials.add(sp.key);f.specials++;state.mapStats[state.map].specials++;addCombo(.18);addRunCoins((20+f.specials*5)*(1+gadgetValue('bumper')*.12),sp.x,f.y,'BOOST');audio.ability();rings.push({x:sp.x,y:f.y,r:12,a:1,color:map.accent})}
  }
  const pay=paydayForSegment(s,map);if(pay&&!f.hitPaydays.has(pay.key)&&f.x>=pay.x-26){f.hitPaydays.add(pay.key);const mi=MAPS.indexOf(map),raw=48+mi*35+f.hitPaydays.size*7;addRunCoins(raw,pay.x,Math.max(80,f.y-22),pay.name);if(f.hitPaydays.size%2===0)addScrap(1);addCombo(.12);audio.coin(true);rings.push({x:pay.x,y:Math.max(75,f.y),r:18,a:1,color:'#ffd75e'})}
 }
}
function distanceIncome(f){const dist=worldDistance(),step=Math.floor(dist/8);if(step>f.lastDistanceAward){const delta=step-f.lastDistanceAward;f.lastDistanceAward=step;let raw=delta*(11+step*.44);if(currentBug().airPay&&f.y<groundY-H*.18)raw*=1+currentBug().airPay;addRunCoins(raw,f.x,f.y-20,'DISTANCE')}}
function update(dt){
 time+=dt;if(!flight?.active){meter+=meterDir*dt*1.18;if(meter>=.98){meter=.98;meterDir=-1}else if(meter<=.02){meter=.02;meterDir=1}$('#meterNeedle').style.left=meter*100+'%'}
 if(flight?.active){const f=flight,map=currentMap(),bug=currentBug(),kn=currentKnocker();let grav=760*map.gravity*(1-bug.glide*.48)*(1-mutationValue('gravity')*.04);if(f.event==='lowGravity')grav*=.63;f.vy+=grav*dt;if(glideHeld&&airEnergy>0){f.vy-=560*dt;f.vx*=1+dt*.018;airEnergy=Math.max(0,airEnergy-34*dt)}else if(diveHeld&&airEnergy>0){f.vy+=690*dt;f.vx*=1+dt*.024;airEnergy=Math.max(0,airEnergy-28*dt)}else airEnergy=Math.min(100,airEnergy+18*dt);$('#energyText').textContent=Math.round(airEnergy)+'%';$('#energyFill').style.width=airEnergy+'%';$('#glideBtn').classList.toggle('active',glideHeld&&airEnergy>0);$('#diveBtn').classList.toggle('active',diveHeld&&airEnergy>0);f.vx*=Math.pow(airDrag()+bug.glide*.0007,dt*60);f.vy*=Math.pow(.9992+bug.glide*.00018,dt*60);f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y<42){f.y=42;if(f.vy<0)f.vy=Math.abs(f.vy)*.22;if(!f.skyCapReward){f.skyCapReward=true;addRunCoins(65+MAPS.indexOf(map)*35,f.x,58,'SKYLINE')}}f.rot+=f.vr*dt;f.air+=dt;f.maxX=Math.max(f.maxX,f.x);f.trail.push({x:f.x,y:f.y});if(f.trail.length>26)f.trail.shift();collectNearby(f,map);hitWorldFeatures(f,map);distanceIncome(f);awardChallenge(f);$('#runChallengeText').textContent=challengeText(f.challenge);const lane=f.y<groundY-H*.45?'SKY JACKPOT':f.y<groundY-H*.28?'HIGH ROUTE':f.y<groundY-H*.12?'MID ROUTE':'GROUND ROUTE';$('#routeHint').textContent=`${lane} · all heights contain coin trails`;
  if(performance.now()/1000-f.lastComboTime>comboWindow()&&f.combo>1){f.combo=Math.max(1,f.combo-dt*.7);$('#comboReadout').textContent=`Combo x${f.combo.toFixed(1)}`;if(f.combo<1.5)$('#comboBanner').textContent=''}
  if(f.y>=groundY-22){f.y=groundY-22;const speed=Math.hypot(f.vx,f.vy);if(slamArmed&&!f.slammed){f.slammed=true;slamArmed=false;f.vy=-Math.max(420,Math.abs(f.vy)*.86);f.vx*=1.12;addCombo(.35);addRunCoins(90+speed*.15,f.x,groundY-35,'SLAM');punchShake(16);rings.push({x:f.x,y:groundY-20,r:15,a:1,color:'#ffffff'});for(let i=0;i<(state.reducedFx?12:34);i++)spawnParticle(f.x,groundY-10,map.accent,2.6);audio.hit('crit')}
   else if(speed>82&&f.bounces<24){f.bounces++;state.mapStats[state.map].bounces++;let ret=(.51+.012*Math.min(f.bounces,5))*bug.bounce*map.bounce*bounceMultiplier();if(bug.spring&&f.bounces<=3)ret*=1.13;ret=clamp(ret,.44,.91);f.vy=-Math.abs(f.vy)*ret;f.vx*=clamp(.89+.006*statValue('bounce'),.89,.97);addRunCoins((8+f.bounces*1.6)*(1+(bug.bouncePay||0)),f.x,groundY-25,'BOUNCE');if(f.bounces%2===0)addCombo(.06);audio.bounce(clamp(speed/650,.15,1));for(let i=0;i<(state.reducedFx?2:7);i++)spawnParticle(f.x,groundY-8,map.ground,1)}
   else if(Math.abs(f.vx)>20){f.vy=0;f.vx*=Math.pow(.918,dt*60)}else finishFlight();}
  if(f.x>cameraX+W*.56)cameraX=lerp(cameraX,f.x-W*.56,.1);$('#distanceBanner').textContent=`${worldDistance().toFixed(1)} m · ${f.pickups} pickups · ${f.objects} smashes · ${f.specials} boosts`;
  if(f.air>24||f.x>260000)finishFlight();
 }
 shakeX*=Math.pow(.08,dt);shakeY*=Math.pow(.08,dt);particles.forEach(p=>{p.life-=dt;p.vy+=p.grav*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985});particles=particles.filter(p=>p.life>0);rings.forEach(r=>{r.a-=dt*1.8;r.r+=dt*150});rings=rings.filter(r=>r.a>0);floaters.forEach(p=>{p.life-=dt;p.y+=p.vy*dt});floaters=floaters.filter(p=>p.life>0);
}
function finishFlight(){if(!flight?.active)return;const f=flight,map=currentMap(),bug=currentBug(),dist=worldDistance();f.active=false;
 const landing=Math.max(80,Math.round((dist*3.1+f.air*18+f.pickups*8)*map.coin*bug.value*bugLevelBonus()*incomeMultiplier()*momentumMultiplier()));
 addRunCoins(landing/(map.coin*bug.value*bugLevelBonus()*incomeMultiplier()*momentumMultiplier()*f.combo*f.eventCoin),f.x,f.y,'LAND');
 const ms=state.mapStats[state.map];ms.bestDistance=Math.max(ms.bestDistance,dist);ms.bestCombo=Math.max(ms.bestCombo,f.bestCombo);
 if(dist>state.best){state.best=dist;state.bestMap=map.name;const mile=Math.floor(dist/60),gain=Math.max(0,mile-(state.cellMilestone||0));if(gain){addCells(gain);state.cellMilestone=mile}}
 const runCells=Math.min(6,1+Math.floor(dist/180)+Math.floor(f.pickups/30)+Math.floor(f.specials/5));addCells(runCells,'RUN CELLS');const oldMaster=masteryLevel(bug),xp=Math.round(18+dist*.14+f.pickups*1.8+f.objects*4+f.specials*3.2);state.bugMastery[bug.id]=(state.bugMastery[bug.id]||0)+xp;const newMaster=masteryLevel(bug),claimed=state.bugMasteryClaim?.[bug.id]||1;if(newMaster>claimed){const gain=newMaster-claimed;addCells(gain);addScrap(gain*2);state.bugMasteryClaim[bug.id]=newMaster;toast(`${bug.name} mastery ${newMaster}: +${gain} Cell${gain===1?'':'s'}`)}
 if(f.event==='cellSurge')addCells(2);const cleared=awardChallenge(f);if(!f.challengeAwarded)state.momentum=Math.max(0,(state.momentum||0)-1);
 checkContracts(state.map);$('#distanceBanner').textContent=`Landed ${dist.toFixed(1)} m · +${fmt(f.runCoins)} coins · +${xp} mastery XP`;if(f.bestCombo>=2)$('#comboBanner').textContent=`BEST x${f.bestCombo.toFixed(1)}`;audio.coin(true);save();renderUI();setTimeout(()=>resetFlight(),1600)}
function resetFlight(instant=false){flight=null;cameraX=0;activeBoost=false;slamArmed=false;glideHeld=false;diveHeld=false;airEnergy=100;$('#energyText').textContent='100%';$('#energyFill').style.width='100%';$('#routeHint').textContent='All heights pay. Choose a route during flight.';$('#runChallengeText').textContent='Launch to receive a challenge';$('#timingText').textContent='READY';$('#distanceBanner').textContent='Aim for the green timing zone.';$('#comboBanner').textContent='';$('#eventBanner').classList.add('hidden');$('#runCoins').textContent='0';$('#comboReadout').textContent='Combo x1.0';if(!instant)renderUI()}

function drawSkyGradient(map){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,map.sky1);g.addColorStop(.78,map.sky2);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
function drawMap(map){
 drawSkyGradient(map);const p=cameraX;
 if(map.id==='backyard'){
  ctx.fillStyle='rgba(255,246,180,.7)';ctx.beginPath();ctx.arc(W*.82-p*.01,80,38,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.5)';for(let i=-2;i<8;i++){const x=i*250-(p*.08%250);ctx.beginPath();ctx.arc(x+70,92,35,0,TAU);ctx.arc(x+105,82,47,0,TAU);ctx.arc(x+145,98,31,0,TAU);ctx.fill()}
  ctx.fillStyle='#2d6842';ctx.beginPath();ctx.moveTo(0,groundY);for(let x=0;x<=W;x+=40)ctx.lineTo(x,groundY-72-18*Math.sin((x+p*.13)*.014));ctx.lineTo(W,groundY);ctx.fill();
  ctx.fillStyle='#3f813e';for(let i=-2;i<16;i++){const x=i*95-(p*.34%95);ctx.beginPath();ctx.arc(x+32,groundY-43,27,0,TAU);ctx.arc(x+57,groundY-35,31,0,TAU);ctx.fill()}
  ctx.fillStyle=map.ground;ctx.fillRect(0,groundY,W,H-groundY);ctx.fillStyle='#77a94f';for(let x=-10;x<W;x+=22){ctx.beginPath();ctx.moveTo(x,groundY+5);ctx.lineTo(x+6,groundY-12-(x%3)*3);ctx.lineTo(x+9,groundY+5);ctx.fill()}
 }else if(map.id==='kitchen'){
  ctx.fillStyle='#e8e1d5';ctx.fillRect(0,0,W,groundY);ctx.fillStyle='#bfd2d7';ctx.fillRect(0,0,W,96);ctx.fillStyle='rgba(255,255,255,.38)';for(let i=-2;i<8;i++){const x=i*220-(p*.09%220);ctx.fillRect(x+25,115,145,185);ctx.fillStyle='#aabfc6';ctx.fillRect(x+42,135,112,10);ctx.fillStyle='rgba(255,255,255,.38)'}ctx.fillStyle='#9a7254';ctx.fillRect(0,groundY-35,W,35);ctx.fillStyle=map.ground;ctx.fillRect(0,groundY,W,H-groundY);ctx.strokeStyle='#aaa59a';ctx.lineWidth=2;for(let x=-70;x<W+100;x+=105){ctx.beginPath();ctx.moveTo(x-(p*.75%105),groundY);ctx.lineTo(x-(p*.75%105)+20,H);ctx.stroke()}
  ctx.fillStyle='rgba(255,255,255,.45)';for(let i=0;i<6;i++)ctx.fillRect((i*260-p*.15)%1600,55,130,13);
 }else if(map.id==='apartment'){
  ctx.fillStyle='#42546e';ctx.fillRect(0,0,W,groundY);ctx.fillStyle='#273247';ctx.fillRect(0,0,W,46);ctx.fillStyle='#ffd97b';for(let i=-1;i<8;i++){const lx=i*230-(p*.18%230);ctx.beginPath();ctx.ellipse(lx+115,40,55,10,0,0,TAU);ctx.fill()}
  for(let i=-1;i<7;i++){const x=i*265-(p*.24%265);ctx.fillStyle='#253044';rr(x+32,72,156,328,10);ctx.fillStyle='#8b7496';rr(x+44,84,132,304,7);ctx.fillStyle='#d7bbdf';ctx.fillRect(x+57,111,105,3);ctx.fillStyle='#f5cd67';ctx.beginPath();ctx.arc(x+151,242,5,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.font='700 13px system-ui';ctx.fillText(`${Math.abs(i)%4+1}${String.fromCharCode(65+Math.abs(i)%3)}`,x+57,112)}ctx.fillStyle=map.ground;ctx.fillRect(0,groundY,W,H-groundY);ctx.fillStyle='rgba(255,255,255,.07)';for(let y=groundY;y<H;y+=13)ctx.fillRect(0,y,W,2);
 }else if(map.id==='sewer'){
  ctx.fillStyle='#18312f';ctx.fillRect(0,0,W,H);ctx.fillStyle='#254842';for(let i=-2;i<9;i++){const x=i*170-(p*.15%170);ctx.beginPath();ctx.arc(x+85,groundY-170,120,Math.PI,0);ctx.fill()}
  ctx.strokeStyle='#71877b';ctx.lineWidth=25;for(let i=-1;i<6;i++){const x=i*300-(p*.2%300);ctx.beginPath();ctx.moveTo(x,65);ctx.lineTo(x+140,65);ctx.lineTo(x+140,255);ctx.stroke()}ctx.strokeStyle='rgba(143,245,124,.18)';ctx.lineWidth=5;for(let i=0;i<7;i++){const y=115+i*42;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}ctx.fillStyle=map.ground;ctx.fillRect(0,groundY,W,H-groundY);ctx.fillStyle='rgba(133,247,107,.18)';ctx.fillRect(0,groundY+12,W,30);
 }else{
  ctx.fillStyle='#0b1433';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(103,239,255,.16)';ctx.lineWidth=1.5;for(let x=-100;x<W+100;x+=72){const sx=x-(p*.2%72);ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,groundY);ctx.stroke()}for(let y=38;y<groundY;y+=58){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  for(let i=-1;i<7;i++){const x=i*230-(p*.17%230);ctx.fillStyle='#202f66';rr(x+20,92,82,277,15);ctx.fillStyle='rgba(103,239,255,.22)';rr(x+31,108,60,205,18);ctx.fillStyle='#67efff';ctx.fillRect(x+47,337,27,6);ctx.strokeStyle='rgba(201,164,255,.4)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+61,200,24+6*Math.sin(time+i),0,TAU);ctx.stroke()}ctx.fillStyle=map.ground;ctx.fillRect(0,groundY,W,H-groundY);ctx.fillStyle='rgba(103,239,255,.13)';for(let x=0;x<W;x+=90)ctx.fillRect(x-(p*.72%90),groundY+18,50,4);
 }
}
function drawMapDetail(map){
 const p=cameraX, lanes=[groundY-46,groundY-H*.17,groundY-H*.34,groundY-H*.53];
 ctx.save();ctx.setLineDash([6,14]);ctx.lineWidth=1;for(let i=0;i<lanes.length;i++){ctx.strokeStyle=i===3?'rgba(255,214,94,.19)':'rgba(255,255,255,.10)';ctx.beginPath();ctx.moveTo(0,lanes[i]);ctx.lineTo(W,lanes[i]);ctx.stroke()}ctx.setLineDash([]);
 ctx.font='800 9px system-ui';ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.45)';['GROUND','MID','HIGH','SKY'].forEach((t,i)=>ctx.fillText(t,W-10,lanes[i]-5));
 if(map.id==='backyard'){
  ctx.strokeStyle='rgba(67,74,54,.55)';ctx.lineWidth=5;for(let i=-1;i<9;i++){const x=i*190-(p*.22%190);ctx.beginPath();ctx.moveTo(x,groundY-70);ctx.lineTo(x,groundY-10);ctx.stroke()}ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,groundY-52);ctx.lineTo(W,groundY-52);ctx.moveTo(0,groundY-30);ctx.lineTo(W,groundY-30);ctx.stroke();
  for(let i=0;i<26;i++){const x=(i*83-(p*.62%83)+W)%W,y=groundY+8+(i%3)*8;ctx.strokeStyle=i%2?'#7fbf55':'#5f9b45';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+12);ctx.quadraticCurveTo(x-4,y,x+1,y-13);ctx.stroke()}
 }else if(map.id==='kitchen'){
  ctx.strokeStyle='rgba(80,87,91,.15)';ctx.lineWidth=2;for(let y=135;y<groundY-40;y+=52){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let x=-80;x<W+80;x+=100){const xx=x-(p*.08%100);ctx.beginPath();ctx.moveTo(xx,96);ctx.lineTo(xx,groundY-40);ctx.stroke()}
  ctx.fillStyle='rgba(120,76,36,.2)';for(let i=0;i<18;i++){const x=(i*97-(p*.7%97)+W)%W,y=groundY+8+(i%4)*6;ctx.beginPath();ctx.arc(x,y,2+(i%3),0,TAU);ctx.fill()}
 }else if(map.id==='apartment'){
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(0,groundY-18,W,4);ctx.fillRect(0,66,W,3);ctx.fillStyle='rgba(18,25,36,.25)';for(let i=-1;i<8;i++){const x=i*240-(p*.12%240);ctx.fillRect(x+108,50,18,22);ctx.fillStyle='rgba(255,220,120,.35)';ctx.beginPath();ctx.arc(x+117,80,14,0,TAU);ctx.fill();ctx.fillStyle='rgba(18,25,36,.25)'}
 }else if(map.id==='sewer'){
  ctx.strokeStyle='rgba(141,245,124,.13)';ctx.lineWidth=2;for(let i=0;i<24;i++){const x=(i*71-(p*.34%71)+W)%W,y=70+(i*43)%300;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+18,y+6);ctx.stroke()}ctx.fillStyle='rgba(126,231,108,.13)';for(let i=0;i<10;i++){const x=(i*137-(p*.55%137)+W)%W,y=groundY+18+(i%2)*10;ctx.beginPath();ctx.ellipse(x,y,22,4,0,0,TAU);ctx.fill()}
 }else{
  ctx.strokeStyle='rgba(103,239,255,.22)';ctx.lineWidth=2;for(let i=-2;i<10;i++){const x=i*145-(p*.28%145);ctx.beginPath();ctx.moveTo(x,groundY-70);ctx.lineTo(x+60,groundY-105);ctx.lineTo(x+115,groundY-70);ctx.stroke()}ctx.fillStyle='rgba(103,239,255,.18)';for(let i=0;i<18;i++){const x=(i*91-(p*.4%91)+W)%W,y=80+(i*67)%310;ctx.beginPath();ctx.arc(x,y,1.5+(i%3),0,TAU);ctx.fill()}
 }
 ctx.restore();
}

function drawMapPolish(map){
 const p=cameraX;ctx.save();
 // shared atmospheric depth
 const haze=ctx.createLinearGradient(0,0,0,groundY);haze.addColorStop(0,'rgba(255,255,255,.035)');haze.addColorStop(.55,'rgba(255,255,255,0)');haze.addColorStop(1,'rgba(0,0,0,.08)');ctx.fillStyle=haze;ctx.fillRect(0,0,W,groundY);
 if(map.id==='backyard'){
  // fence and giant garden flowers create a toy-sized insect scale
  ctx.strokeStyle='rgba(238,218,176,.5)';ctx.lineWidth=6;for(let x=-90;x<W+120;x+=116){const sx=x-(p*.52%116);ctx.beginPath();ctx.moveTo(sx,groundY-18);ctx.lineTo(sx,groundY-104);ctx.stroke();ctx.fillStyle='rgba(238,218,176,.42)';ctx.beginPath();ctx.moveTo(sx-7,groundY-102);ctx.lineTo(sx,groundY-118);ctx.lineTo(sx+7,groundY-102);ctx.fill()}ctx.lineWidth=7;for(const yy of[groundY-86,groundY-48]){ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke()}
  for(let i=0;i<5;i++){const x=((i*270-p*.34)%1450+1450)%1450-80,sy=groundY-118-(i%2)*26;ctx.strokeStyle='#3f7b41';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,groundY);ctx.quadraticCurveTo(x+15,sy+38,x,sy);ctx.stroke();ctx.fillStyle=['#ff8eb1','#ffd76a','#9bdc82'][i%3];for(let a=0;a<6;a++){ctx.beginPath();ctx.arc(x+Math.cos(a*TAU/6)*15,sy+Math.sin(a*TAU/6)*15,9,0,TAU);ctx.fill()}ctx.fillStyle='#6b4e2b';ctx.beginPath();ctx.arc(x,sy,7,0,TAU);ctx.fill()}
  ctx.fillStyle='rgba(255,250,180,.75)';for(let i=0;i<7;i++){const x=((i*210+time*12-p*.18)%1500+1500)%1500-80,y=80+(i*47)%210+Math.sin(time*1.2+i)*8;ctx.save();ctx.translate(x,y);ctx.rotate(.7+Math.sin(time+i)*.3);ctx.beginPath();ctx.ellipse(0,0,6,2.5,0,0,TAU);ctx.fill();ctx.restore()}
 }else if(map.id==='kitchen'){
  // tiled backsplash, cabinets, hanging utensils and counter shine
  ctx.strokeStyle='rgba(98,123,132,.12)';ctx.lineWidth=1;for(let x=-50;x<W+50;x+=72){const sx=x-(p*.1%72);ctx.beginPath();ctx.moveTo(sx,95);ctx.lineTo(sx,groundY-37);ctx.stroke()}for(let y=96;y<groundY-36;y+=58){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  for(let i=-1;i<7;i++){const x=i*245-(p*.12%245);ctx.fillStyle='rgba(96,112,119,.18)';ctx.fillRect(x+36,112,152,108);ctx.strokeStyle='rgba(255,255,255,.23)';ctx.strokeRect(x+39,115,146,102);ctx.fillStyle='rgba(60,72,78,.35)';ctx.fillRect(x+106,163,12,3)}
  ctx.strokeStyle='rgba(88,99,104,.55)';ctx.lineWidth=4;for(let i=0;i<5;i++){const x=70+i*210-(p*.07%210);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,66);ctx.stroke();ctx.fillStyle=i%2?'rgba(195,204,208,.85)':'rgba(231,236,237,.85)';ctx.beginPath();ctx.ellipse(x,79,9,22,.2,0,TAU);ctx.fill()}
  const shine=ctx.createLinearGradient(0,groundY-30,0,groundY+45);shine.addColorStop(0,'rgba(255,255,255,.22)');shine.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=shine;ctx.fillRect(0,groundY-30,W,75);
 }else if(map.id==='apartment'){
  // hallway sconces, frames, baseboards and carpet runner
  ctx.fillStyle='rgba(238,220,192,.15)';for(let x=-100;x<W+120;x+=250){const sx=x-(p*.16%250);ctx.fillRect(sx+30,132,56,46);ctx.strokeStyle='rgba(233,213,183,.35)';ctx.lineWidth=3;ctx.strokeRect(sx+34,136,48,38);ctx.fillStyle='rgba(99,79,108,.5)';ctx.fillRect(sx+42,144,32,22)}
  for(let x=-60;x<W+120;x+=280){const sx=x-(p*.2%280);ctx.fillStyle='rgba(255,214,116,.17)';ctx.beginPath();ctx.arc(sx+130,124,40,0,TAU);ctx.fill();ctx.fillStyle='#e9c86e';ctx.fillRect(sx+127,101,6,24);ctx.beginPath();ctx.arc(sx+130,98,8,0,TAU);ctx.fill()}
  ctx.fillStyle='rgba(228,216,229,.25)';ctx.fillRect(0,groundY-8,W,8);ctx.fillStyle='rgba(103,70,116,.22)';ctx.fillRect(0,groundY+22,W,34);ctx.strokeStyle='rgba(255,255,255,.07)';for(let x=-50;x<W+80;x+=66){const sx=x-(p*.7%66);ctx.beginPath();ctx.moveTo(sx,groundY+22);ctx.lineTo(sx+24,groundY+56);ctx.stroke()}
 }else if(map.id==='sewer'){
  // brickwork, dripping water and a reflective slime channel
  ctx.strokeStyle='rgba(155,184,167,.12)';ctx.lineWidth=2;for(let y=92;y<groundY-12;y+=34){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();for(let x=(Math.floor(y/34)%2)*45;x<W;x+=90){ctx.beginPath();ctx.moveTo(x-(p*.08%90),y-34);ctx.lineTo(x-(p*.08%90),y);ctx.stroke()}}
  ctx.strokeStyle='rgba(133,247,107,.35)';ctx.lineWidth=2;for(let i=0;i<8;i++){const x=((i*165-p*.18)%1320+1320)%1320;const len=18+(i*13)%55;ctx.beginPath();ctx.moveTo(x,38);ctx.lineTo(x,38+len+Math.sin(time*2+i)*4);ctx.stroke();ctx.fillStyle='rgba(133,247,107,.55)';ctx.beginPath();ctx.arc(x,44+len+Math.sin(time*2+i)*4,2.6,0,TAU);ctx.fill()}
  const slime=ctx.createLinearGradient(0,groundY,0,H);slime.addColorStop(0,'rgba(120,255,103,.22)');slime.addColorStop(.45,'rgba(120,255,103,.07)');slime.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=slime;ctx.fillRect(0,groundY,W,H-groundY);
 }else{
  // lab holograms, cables, status lights and warning floor stripes
  for(let i=-1;i<8;i++){const x=i*190-(p*.11%190);ctx.strokeStyle='rgba(103,239,255,.16)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+35,0);ctx.bezierCurveTo(x+90,95,x+10,160,x+82,245);ctx.stroke();ctx.fillStyle=i%2?'#67efff':'#d295ff';ctx.globalAlpha=.5+.25*Math.sin(time*2+i);ctx.beginPath();ctx.arc(x+82,245,4,0,TAU);ctx.fill();ctx.globalAlpha=1}
  for(let i=0;i<4;i++){const x=120+i*280-(p*.13%280),y=95+(i%2)*80;ctx.strokeStyle='rgba(210,149,255,.32)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,42+Math.sin(time+i)*5,18,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(x,y,22,38+Math.cos(time+i)*4,0,0,TAU);ctx.stroke()}
  ctx.save();ctx.translate(-(p*.72%70),groundY+6);for(let x=-70;x<W+70;x+=70){ctx.fillStyle='rgba(255,208,83,.32)';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+28,0);ctx.lineTo(x+8,18);ctx.lineTo(x-20,18);ctx.closePath();ctx.fill()}ctx.restore();
 }
 // foreground vignette keeps the playable route readable without flattening the scene
 const vg=ctx.createLinearGradient(0,0,W,0);vg.addColorStop(0,'rgba(0,0,0,.08)');vg.addColorStop(.5,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.08)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);ctx.restore();
}
function drawObstacle(o,map){const x=worldToScreenX(o.x);if(x<-100||x>W+100)return;ctx.save();ctx.translate(x,groundY);ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,4,o.w*.6,8,0,0,TAU);ctx.fill();const t=o.type;
 if(t==='stone'){ctx.fillStyle='#707965';ctx.beginPath();ctx.moveTo(-o.w/2,0);ctx.lineTo(-o.w*.36,-o.h*.55);ctx.lineTo(0,-o.h);ctx.lineTo(o.w*.42,-o.h*.62);ctx.lineTo(o.w/2,0);ctx.fill()}
 else if(t==='watering'){ctx.fillStyle='#4f8ea0';rr(-o.w*.35,-o.h*.75,o.w*.65,o.h*.75,7);ctx.strokeStyle='#4f8ea0';ctx.lineWidth=8;ctx.beginPath();ctx.arc(o.w*.28,-o.h*.52,16,-1.1,1.15);ctx.stroke();ctx.beginPath();ctx.moveTo(-o.w*.3,-o.h*.58);ctx.lineTo(-o.w*.65,-o.h*.83);ctx.stroke()}
 else if(t==='gnome'){ctx.fillStyle='#e34d50';ctx.beginPath();ctx.moveTo(0,-o.h);ctx.lineTo(-o.w*.35,-o.h*.45);ctx.lineTo(o.w*.35,-o.h*.45);ctx.fill();ctx.fillStyle='#e7d1b4';ctx.beginPath();ctx.arc(0,-o.h*.36,o.w*.24,0,TAU);ctx.fill();ctx.fillStyle='#456e9b';rr(-o.w*.3,-o.h*.24,o.w*.6,o.h*.24,5)}
 else if(t==='mug'){ctx.fillStyle='#f0e8db';rr(-o.w*.32,-o.h,o.w*.64,o.h,6);ctx.strokeStyle='#f0e8db';ctx.lineWidth=7;ctx.beginPath();ctx.arc(o.w*.35,-o.h*.55,14,-1.2,1.2);ctx.stroke()}
 else if(t==='fork'){ctx.strokeStyle='#c2ced2';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-o.w*.4,0);ctx.lineTo(o.w*.15,-o.h*.7);ctx.stroke();for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(o.w*.15+i*4,-o.h*.7);ctx.lineTo(o.w*.25+i*4,-o.h);ctx.stroke()}}
 else if(t==='cereal'){ctx.fillStyle='#d65b62';rr(-o.w*.45,-o.h,o.w*.9,o.h,4);ctx.fillStyle='#f4d46b';ctx.font='800 10px system-ui';ctx.fillText('CRUNCH',-o.w*.34,-o.h*.45)}
 else if(t==='box'||t==='crate'){ctx.fillStyle=t==='box'?'#a77950':'#71543b';ctx.fillRect(-o.w/2,-o.h,o.w,o.h);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.strokeRect(-o.w/2+4,-o.h+4,o.w-8,o.h-8);ctx.beginPath();ctx.moveTo(-o.w/2,-o.h);ctx.lineTo(o.w/2,0);ctx.moveTo(o.w/2,-o.h);ctx.lineTo(-o.w/2,0);ctx.stroke()}
 else if(t==='plant'){ctx.fillStyle='#9e795b';rr(-o.w*.3,-o.h*.42,o.w*.6,o.h*.42,5);ctx.fillStyle='#5c9860';for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse((i-2)*7,-o.h*.65-(i%2)*10,8,22,(i-2)*.3,0,TAU);ctx.fill()}}
 else if(t==='cart'){ctx.fillStyle='#3b4758';rr(-o.w/2,-o.h,o.w,o.h-8,5);ctx.fillStyle='#151b23';ctx.beginPath();ctx.arc(-o.w*.28,0,7,0,TAU);ctx.arc(o.w*.28,0,7,0,TAU);ctx.fill()}
 else if(t==='pipe'){ctx.strokeStyle='#70887c';ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(-o.w/2,0);ctx.lineTo(-o.w*.2,-o.h*.8);ctx.lineTo(o.w/2,-o.h*.8);ctx.stroke()}
 else if(t==='can'){ctx.fillStyle='#72858d';rr(-o.w*.25,-o.h,o.w*.5,o.h,7);ctx.strokeStyle='#aab9be';ctx.strokeRect(-o.w*.25,-o.h,o.w*.5,o.h)}
 else if(t==='pod'){ctx.fillStyle='#243564';rr(-o.w/2,-o.h,o.w,o.h,12);ctx.fillStyle='rgba(103,239,255,.24)';rr(-o.w*.3,-o.h*.84,o.w*.6,o.h*.68,14)}
 else if(t==='coil'){ctx.strokeStyle='#67efff';ctx.lineWidth=4;for(let y=10;y<o.h;y+=12){ctx.beginPath();ctx.arc(0,-y,o.w*.34,0,Math.PI);ctx.stroke()}}
 else if(t==='drone'){ctx.fillStyle='#8b77b3';rr(-o.w*.42,-o.h*.68,o.w*.84,o.h*.4,8);ctx.fillStyle='#67efff';ctx.beginPath();ctx.arc(0,-o.h*.48,6,0,TAU);ctx.fill();ctx.strokeStyle='#697b9a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-o.w*.4,-o.h*.5);ctx.lineTo(-o.w*.65,-o.h*.7);ctx.moveTo(o.w*.4,-o.h*.5);ctx.lineTo(o.w*.65,-o.h*.7);ctx.stroke()}
 ctx.restore()}
function drawSpecial(sp,map){const x=worldToScreenX(sp.x);if(x<-120||x>W+120)return;ctx.save();ctx.translate(x,0);const pulse=.5+.5*Math.sin(time*4+sp.x);
 if(sp.type==='flower'){ctx.strokeStyle='#4b8d45';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,groundY);ctx.lineTo(0,groundY-45);ctx.stroke();for(let a=0;a<6;a++){ctx.fillStyle='#ff7ba8';ctx.beginPath();ctx.arc(Math.cos(a*TAU/6)*15,groundY-55+Math.sin(a*TAU/6)*15,10,0,TAU);ctx.fill()}ctx.fillStyle='#ffd85b';ctx.beginPath();ctx.arc(0,groundY-55,10,0,TAU);ctx.fill()}
 else if(sp.type==='wind'||sp.type==='fan'){ctx.strokeStyle=`rgba(255,255,255,${.35+pulse*.25})`;ctx.lineWidth=3;for(let y=groundY-180;y<groundY-40;y+=34){ctx.beginPath();ctx.arc(0,y,26,Math.PI*.1,Math.PI*1.5);ctx.stroke()}if(sp.type==='fan'){ctx.fillStyle='#687e8a';ctx.beginPath();ctx.arc(0,groundY-25,22,0,TAU);ctx.fill()}}
 else if(sp.type==='toaster'){ctx.fillStyle='#b7c0c4';rr(-35,groundY-52,70,52,9);ctx.fillStyle='#5c6670';ctx.fillRect(-22,groundY-45,44,5);ctx.fillStyle='#e3b36d';ctx.fillRect(-13,groundY-72,26,27)}
 else if(sp.type==='vent'){ctx.fillStyle='#8794a4';rr(-35,groundY-16,70,16,4);ctx.strokeStyle=`rgba(201,164,255,${.4+pulse*.3})`;ctx.lineWidth=3;for(let y=groundY-45;y>groundY-160;y-=28){ctx.beginPath();ctx.arc(0,y,20,0,Math.PI);ctx.stroke()}}
 else if(sp.type==='carpet'){ctx.fillStyle='#b08ac2';ctx.fillRect(-65,groundY-8,130,8);ctx.fillStyle='rgba(255,255,255,.25)';for(let i=-50;i<60;i+=20)ctx.fillRect(i,groundY-7,10,3)}
 else if(sp.type==='jet'){ctx.fillStyle='#698279';ctx.fillRect(-18,groundY-35,36,35);ctx.fillStyle=`rgba(141,245,124,${.2+pulse*.35})`;ctx.beginPath();ctx.moveTo(-10,groundY-35);ctx.quadraticCurveTo(-35,groundY-105,0,groundY-160);ctx.quadraticCurveTo(35,groundY-105,10,groundY-35);ctx.fill()}
 else if(sp.type==='slimeRail'){ctx.fillStyle='#7ddd6e';ctx.beginPath();ctx.ellipse(0,groundY-5,70,10,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.28)';ctx.beginPath();ctx.ellipse(-18,groundY-8,16,4,0,0,TAU);ctx.fill()}
 else if(sp.type==='gravity'){ctx.strokeStyle=`rgba(103,239,255,${.55+pulse*.25})`;ctx.lineWidth=5;for(let r=18;r<58;r+=16){ctx.beginPath();ctx.arc(0,groundY-115,r,0,TAU);ctx.stroke()}}
 else if(sp.type==='portal'){ctx.strokeStyle='#d295ff';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(0,groundY-120,32,72,0,0,TAU);ctx.stroke();ctx.strokeStyle=`rgba(103,239,255,${.45+pulse*.4})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,groundY-120,20,57,0,0,TAU);ctx.stroke()}
 ctx.restore()}
function drawCoin(c,map){if(flight?.collected.has(c.key))return;const x=worldToScreenX(c.x);if(x<-30||x>W+30)return;ctx.save();ctx.translate(x,c.y);ctx.rotate(time*2.7+c.x);
 if(c.kind==='cell'){ctx.shadowColor='#67efff';ctx.shadowBlur=16;ctx.fillStyle='#67efff';ctx.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6,r=i%2?6:11;i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#e9feff';ctx.beginPath();ctx.arc(0,0,3.2,0,TAU);ctx.fill();}
 else if(c.kind==='scrap'){ctx.shadowColor='#ffab67';ctx.shadowBlur=12;ctx.fillStyle='#ffab67';ctx.beginPath();ctx.moveTo(-8,-6);ctx.lineTo(6,-9);ctx.lineTo(10,3);ctx.lineTo(3,9);ctx.lineTo(-9,6);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#6b3b1e';ctx.lineWidth=2;ctx.stroke();}
 else{const r=c.gold?9:6;ctx.fillStyle=c.gold?'#ffd75e':map.accent;ctx.beginPath();ctx.ellipse(0,0,r*.45,r,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.5;ctx.stroke();if(c.gold){ctx.fillStyle='rgba(255,215,94,.18)';ctx.beginPath();ctx.arc(0,0,18+Math.sin(time*4)*2,0,TAU);ctx.fill();}}
 ctx.restore()}
function drawPayday(pay,map){const x=worldToScreenX(pay.x);if(x<-90||x>W+90)return;const pulse=.5+.5*Math.sin(time*4+pay.x);ctx.save();ctx.translate(x,0);ctx.globalAlpha=.75;ctx.strokeStyle='#ffd75e';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,groundY-H*.26,43+pulse*4,Math.PI*.15,Math.PI*.85);ctx.stroke();ctx.strokeStyle=map.accent;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,groundY-H*.26,31+pulse*3,Math.PI*.15,Math.PI*.85);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='rgba(7,12,18,.74)';ctx.beginPath();ctx.roundRect(-44,groundY-H*.26-13,88,26,9);ctx.fill();ctx.fillStyle='#ffe6a0';ctx.font='900 8px system-ui';ctx.textAlign='center';ctx.fillText(pay.name,0,groundY-H*.26+3);ctx.restore()}
function drawSouvenirVisual(sv,map){
 const x=worldToScreenX(sv.x);if(x<-40||x>W+40)return;const bob=Math.sin(time*3+sv.x)*5;ctx.save();ctx.translate(x,sv.y+bob);ctx.shadowColor='#ffbf5f';ctx.shadowBlur=18;ctx.fillStyle='#ffbf5f';ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?7:13;const px=Math.cos(a)*r,py=Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#6d4718';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff4cf';ctx.beginPath();ctx.arc(0,0,3.5,0,TAU);ctx.fill();ctx.restore();}
function drawBugAt(x,y,rot,bug,scale=1){
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';
 const outline='#10151a';const hi='rgba(255,255,255,.28)';
 const limb=(x1,y1,x2,y2,x3,y3,w=2.7)=>{ctx.strokeStyle=outline;ctx.lineWidth=w+2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.stroke();ctx.strokeStyle=bug.accent;ctx.lineWidth=w;ctx.stroke()};
 if(bug.id==='centipede'){
  for(let i=-4;i<=4;i++){const xx=i*7;limb(xx,-1,xx-6,-11-(i%2?3:0),xx-12,-14-(i%2?5:0),1.8);limb(xx,2,xx+6,12+(i%2?3:0),xx+12,15+(i%2?5:0),1.8)}
  for(let i=4;i>=-4;i--){ctx.fillStyle=outline;ctx.beginPath();ctx.arc(i*7,0,8.8,0,TAU);ctx.fill();ctx.fillStyle=i===-4?bug.accent:bug.color;ctx.beginPath();ctx.arc(i*7,0,6.4,0,TAU);ctx.fill()}
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-30,-2,2.2,0,TAU);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(-30,-2,1,0,TAU);ctx.fill();ctx.restore();return;
 }
 if(bug.id==='dragonfly'){
  ctx.strokeStyle='rgba(230,255,255,.8)';ctx.lineWidth=1.2;ctx.fillStyle='rgba(150,235,246,.38)';for(const sy of[-1,1]){ctx.beginPath();ctx.ellipse(-1,sy*11,28,8,sy*.28,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(10,sy*10,24,7,-sy*.25,0,TAU);ctx.fill();ctx.stroke()}
  ctx.fillStyle=outline;ctx.beginPath();ctx.roundRect(-22,-6,48,12,6);ctx.fill();ctx.fillStyle=bug.color;ctx.beginPath();ctx.roundRect(-20,-4,45,8,4);ctx.fill();ctx.fillStyle=bug.accent;ctx.beginPath();ctx.arc(-21,0,7,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-24,-2,2,0,TAU);ctx.fill();ctx.restore();return;
 }
 if(bug.id==='moth'){
  ctx.strokeStyle=outline;ctx.lineWidth=3;ctx.fillStyle='#d8c7b4';for(const sy of[-1,1]){ctx.beginPath();ctx.moveTo(-5,sy*2);ctx.bezierCurveTo(-22,sy*8,-22,sy*27,4,sy*24);ctx.bezierCurveTo(26,sy*22,30,sy*8,14,sy*3);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#8f7d69';ctx.beginPath();ctx.arc(8,sy*13,4,0,TAU);ctx.fill();ctx.fillStyle='#d8c7b4'}
 }
 if(bug.id==='cricket'){
  limb(8,-2,21,-18,38,-24,3.1);limb(7,4,23,21,39,25,3.1);limb(-1,-3,-14,-12,-25,-10,2.4);limb(-1,3,-14,12,-25,10,2.4);
 }
 else if(bug.id==='flea'){
  limb(4,-2,19,-18,33,-23,3.4);limb(5,4,20,22,37,28,3.4);limb(-3,-2,-13,-12,-22,-12,2.2);limb(-2,3,-12,13,-21,14,2.2);
 }
 else{
  for(const sy of[-1,1]){limb(-2,sy*3,-10,sy*13,-22,sy*16);limb(6,sy*3,10,sy*16,22,sy*20);limb(14,sy*3,24,sy*13,34,sy*15)}
 }
 // antennae
 limb(-18,-4,-27,-13,-34,-12,1.6);limb(-15,-6,-20,-18,-26,-20,1.6);
 // body shadows / outlines
 if(bug.id==='aphid'){
  ctx.fillStyle=outline;ctx.beginPath();ctx.ellipse(14,0,21,15,0,0,TAU);ctx.fill();ctx.fillStyle=bug.color;ctx.beginPath();ctx.ellipse(14,0,18.5,12.5,0,0,TAU);ctx.fill();ctx.fillStyle=hi;ctx.beginPath();ctx.ellipse(8,-5,7,3,-.3,0,TAU);ctx.fill();
 }else if(bug.id==='flea'){
  ctx.fillStyle=outline;ctx.beginPath();ctx.ellipse(10,0,18,13,-.2,0,TAU);ctx.fill();ctx.fillStyle=bug.color;ctx.beginPath();ctx.ellipse(10,0,15,10,-.2,0,TAU);ctx.fill();
 }else{
  ctx.fillStyle=outline;ctx.beginPath();ctx.ellipse(16,0,20,14,0,0,TAU);ctx.fill();ctx.fillStyle=bug.color;ctx.beginPath();ctx.ellipse(16,0,17,11,0,0,TAU);ctx.fill();ctx.fillStyle=hi;ctx.beginPath();ctx.ellipse(10,-5,7,3,-.25,0,TAU);ctx.fill();
 }
 ctx.fillStyle=outline;ctx.beginPath();ctx.ellipse(-3,0,13,12,0,0,TAU);ctx.fill();ctx.fillStyle=bug.accent;ctx.beginPath();ctx.ellipse(-3,0,10,9,0,0,TAU);ctx.fill();
 ctx.fillStyle=outline;ctx.beginPath();ctx.arc(-18,0,10.5,0,TAU);ctx.fill();ctx.fillStyle=bug.color;ctx.beginPath();ctx.arc(-18,0,8,0,TAU);ctx.fill();
 if(bug.id==='ladybug'){
  ctx.fillStyle='#e84848';ctx.beginPath();ctx.ellipse(16,0,17,11,0,0,TAU);ctx.fill();ctx.strokeStyle=outline;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(16,-10);ctx.lineTo(16,10);ctx.stroke();ctx.fillStyle='#14171a';for(const [a,b] of[[8,-5],[8,5],[23,-5],[23,5]]){ctx.beginPath();ctx.arc(a,b,2.4,0,TAU);ctx.fill()}
 }
 if(bug.id==='beetle'){ctx.strokeStyle=bug.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(15,-10);ctx.lineTo(15,10);ctx.stroke();ctx.beginPath();ctx.moveTo(-24,-5);ctx.lineTo(-32,-11);ctx.moveTo(-24,5);ctx.lineTo(-32,11);ctx.stroke()}
 if(bug.id==='termite'){ctx.strokeStyle='rgba(110,84,55,.45)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(2,-8);ctx.lineTo(2,8);ctx.moveTo(11,-10);ctx.lineTo(11,10);ctx.stroke()}
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-21,-2,2.6,0,TAU);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(-21,-2,1.2,0,TAU);ctx.fill();ctx.restore();}
function draw(){const map=currentMap();ctx.save();ctx.translate(shakeX,shakeY);drawMap(map);drawMapDetail(map);const start=Math.floor(cameraX/190)-2,end=Math.floor((cameraX+W)/190)+3;for(let s=start;s<=end;s++){const sp=specialForSegment(s,map);if(sp)drawSpecial(sp,map);const o=obstacleForSegment(s,map);if(o)drawObstacle(o,map);const pay=paydayForSegment(s,map);if(pay)drawPayday(pay,map);const sv=souvenirForSegment(s,map);if(sv)drawSouvenirVisual(sv,map);for(const c of coinFeaturesForSegment(s,map))drawCoin(c,map)}ctx.font='700 9px system-ui';ctx.textAlign='center';for(let m=Math.floor(cameraX/340)*10;m<(cameraX+W)/34+20;m+=10){const x=worldToScreenX(80+m*34);if(x<0||x>W)continue;ctx.fillStyle='rgba(255,255,255,.46)';ctx.fillRect(x,groundY-11,1,11);ctx.fillText(m+'m',x,groundY+16)}const sx=worldToScreenX(80);ctx.fillStyle='rgba(0,0,0,.28)';rr(sx-45,groundY-3,90,9,5);if(flight){for(let i=0;i<flight.trail.length;i++){const t=flight.trail[i],a=i/flight.trail.length*.25;ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.beginPath();ctx.arc(worldToScreenX(t.x),t.y,2.5+i*.07,0,TAU);ctx.fill()}drawBugAt(worldToScreenX(flight.x),flight.y,flight.rot,currentBug(),1.05)}else drawBugAt(sx,groundY-27,Math.sin(time*2)*.035,currentBug(),1.08);rings.forEach(r=>{ctx.globalAlpha=r.a;ctx.strokeStyle=r.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(worldToScreenX(r.x),r.y,r.r,0,TAU);ctx.stroke();ctx.globalAlpha=1});particles.forEach(p=>{ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(worldToScreenX(p.x),p.y,p.size,0,TAU);ctx.fill();ctx.globalAlpha=1});floaters.forEach(f=>{ctx.globalAlpha=clamp(f.life/f.max,0,1);ctx.fillStyle=f.color;ctx.font=`900 ${f.size}px system-ui`;ctx.fillText(f.text,f.x,f.y);ctx.globalAlpha=1});ctx.restore()}
function loop(now){const dt=Math.min(.033,(now-last)/1000||0);last=now;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);

function openModal(id){$('#'+id).classList.remove('hidden');audio.ui()}function closeModal(id){$('#'+id).classList.add('hidden');audio.ui()}
$('#settingsBtn').addEventListener('click',()=>{ensureAudio();syncSettings();openModal('settingsModal')});$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));$$('.modal').forEach(m=>m.addEventListener('pointerdown',e=>{if(e.target===m)closeModal(m.id)}));
function syncSettings(){$('#musicVol').value=state.musicVol;$('#sfxVol').value=state.sfxVol;$('#musicVolText').textContent=state.musicVol+'%';$('#sfxVolText').textContent=state.sfxVol+'%';$('#shakeToggle').checked=state.shake;$('#reducedFxToggle').checked=state.reducedFx}
$('#musicVol').addEventListener('input',e=>{state.musicVol=+e.target.value;$('#musicVolText').textContent=state.musicVol+'%';audio.setVolumes();save()});$('#sfxVol').addEventListener('input',e=>{state.sfxVol=+e.target.value;$('#sfxVolText').textContent=state.sfxVol+'%';audio.setVolumes();save()});$('#shakeToggle').addEventListener('change',e=>{state.shake=e.target.checked;save()});$('#reducedFxToggle').addEventListener('change',e=>{state.reducedFx=e.target.checked;save()});$('#testSoundBtn').addEventListener('click',()=>{ensureAudio();audio.hit('perfect');setTimeout(()=>audio.coin(true),130)});
$('#ownerOpenBtn').addEventListener('click',()=>{closeModal('settingsModal');$('#ownerLogin').classList.remove('hidden');$('#ownerControls').classList.add('hidden');$('#ownerCode').value='';$('#ownerError').textContent='';openModal('ownerModal')});$('#ownerLoginBtn').addEventListener('click',()=>{ensureAudio();if($('#ownerCode').value==='WestvirgiNA'){$('#ownerLogin').classList.add('hidden');$('#ownerControls').classList.remove('hidden');toast('Owner mode unlocked')}else{$('#ownerError').textContent='Incorrect owner code.';audio.tone(110,.16,'square',.12,.7)}});
$$('[data-owner-action]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.ownerAction;if(a==='coins')state.coins+=1000000;if(a==='cells'){state.cells+=250;state.totalCells=(state.totalCells||0)+250}if(a==='scrap'){state.scrap=(state.scrap||0)+500;state.totalScrap=(state.totalScrap||0)+500}if(a==='maps')state.unlockedMaps=MAPS.map(x=>x.id);if(a==='bugs')state.unlockedBugs=BUGS.map(x=>x.id);if(a==='knockers')state.unlockedKnockers=KNOCKERS.map(x=>x.id);if(a==='contracts')MAPS.forEach(m=>state.contracts[m.id]=[true,true,true,true,true]);if(a==='maxstats'){STATS.forEach(s=>state.stats[s.id]=s.max);MUTATIONS.forEach(m=>state.mutations[m.id]=m.max);GADGETS.forEach(g=>state.gadgets[g.id]=g.max);BUGS.forEach(x=>{state.bugLevels[x.id]=15;state.bugMastery[x.id]=6075})}if(a==='clearflight')resetFlight(true);save();renderUI();audio.ui();toast('Owner action applied')}));$('#ownerCloseSave').addEventListener('click',()=>{save();renderUI();closeModal('ownerModal')});
$('#resetBtn').addEventListener('click',()=>{closeModal('settingsModal');openModal('confirmModal')});$('#cancelResetBtn').addEventListener('click',()=>closeModal('confirmModal'));$('#confirmResetBtn').addEventListener('click',()=>{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(LEGACY_SAVE_KEY);localStorage.removeItem(OLD_SAVE_KEY);state=defaultState();cooldowns={mega:0,boost:0,coin:0,slam:0};megaArmed=false;magnetUntil=0;resetFlight(true);save();renderUI();syncSettings();audio.setVolumes();closeModal('confirmModal');toast('Save data reset')});

document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});let lastTouch=0;document.addEventListener('touchend',e=>{const now=Date.now();if(now-lastTouch<300)e.preventDefault();lastTouch=now},{passive:false});document.addEventListener('contextmenu',e=>{if(!e.target.matches('input'))e.preventDefault()});document.addEventListener('pointerdown',ensureAudio,{once:true});setInterval(()=>{state.playSeconds+=10;save()},10000);

renderUI();syncSettings();if(previewDemo)setTimeout(()=>{meter=.5;launch()},300);
})();
