import {getContent,saveProfile} from './api.js';
import {Store} from './store.js';
import {mazePuzzle,simplePuzzle} from './puzzles.js';
import {mountGame,destroyGame} from './game.js';

const store=new Store(); let content;
const app=document.getElementById('app'),modalRoot=document.getElementById('modal-root');
modalRoot.innerHTML='<div class="modal" id="modal"><div class="modal-card"><div class="modal-head"><h2 id="modal-title"></h2><button class="close" id="modal-close" aria-label="Close">×</button></div><div id="modal-body"></div></div></div>';
document.getElementById('modal-close').onclick=()=>document.getElementById('modal').classList.remove('open');
function modal(p){document.getElementById('modal-title').textContent=p.title;document.getElementById('modal-body').innerHTML=p.html;document.getElementById('modal').classList.add('open');p.bind?.()}

const worldIcons={patch:'pumpkin.svg',dino:'egg.svg',barn:'bridge.svg',maze:'map.svg',bay:'badge.svg'};
function icon(path,alt='',cls='ui-icon'){return `<img class="${cls}" src="./assets/ui/${path}" alt="${alt}">`}

function render(){
  if(!content)return;
  destroyGame();
  const s=store.state,m=content.missions[Math.min(s.missionIndex,content.missions.length-1)],world=content.worlds.find(w=>w.id===m.world);
  const patchInteractive=world.id==='patch';
  app.innerHTML=`<div class="shell">
  <header class="header">
    <div class="brand">${icon('brand-leaf.svg','', 'brand-mark')}<div><div class="brand-title">Rescue Quest <span>Kids</span></div><div class="brand-sub">${content.tagline}</div></div></div>
    <div class="mantra">Kind Kids<br>Change Big Things</div>
    <div><div class="progress-label"><span>Adventure Progress</span><span>${s.solved} / ${content.missions.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${s.solved/content.missions.length*100}%"></div></div></div>
    <div class="counters"><div class="counter">${icon('pumpkin.svg','Pumpkins')}<b>${s.pumpkins}</b></div><div class="counter">${icon('egg.svg','Eggs')}<b>${s.eggs}</b></div></div>
  </header>
  <nav class="tabs">${content.worlds.map(w=>`<button class="tab ${w.id===m.world?'active':''}" data-world="${w.id}">${icon(worldIcons[w.id],'')}<span class="tab-copy"><strong>${w.title}</strong><small>${w.subtitle}</small></span></button>`).join('')}<button class="tab" data-map>${icon('world-map.svg','')}<span class="tab-copy"><strong>World Map</strong><small>Adventure hub</small></span></button></nav>
  <main class="main"><div class="layout">
    <section class="card scene-card"><div class="game-wrap"><div id="game-canvas" aria-label="Interactive ${world.title} game scene"></div><div class="scene-instruction">${patchInteractive?'Tap a pumpkin to answer. Tap anywhere on the path to move.':'Tap the scene to move your explorer.'}</div></div>
      <div class="tip"><div class="tip-avatar"><img src="./assets/characters/dino/idle.svg" alt="Explorer dino"></div><div><strong>Explorer Tip:</strong><p>${m.tip}</p></div></div>
    </section>
    <section class="card panel"><div class="eyebrow">${m.eyebrow}</div><h1 class="world-title">${m.title}</h1><p class="copy">${m.intro}</p>
      <div class="question"><h2>${m.question}</h2><p>${patchInteractive?'Choose directly in the picture, or use the answer cards below.':m.sub}</p></div>
      <div class="answers">${m.answers.map((a,i)=>`<button class="answer ${s.selected===i?'selected':''}" data-answer="${i}"><span class="answer-dot">${i+1}</span><span>${a}</span></button>`).join('')}</div><div class="feedback" id="fb"></div>
      <div class="section"><div class="section-head"><h3>Halloween Puzzles</h3><span>Solve puzzles. Discover kindness.</span></div><div class="puzzles"><button class="puzzle" data-puzzle="shadow"><span class="puzzle-art shape-shadow"></span><span>Shadow Match</span></button><button class="puzzle" data-puzzle="pattern"><span class="puzzle-art shape-pattern"></span><span>Spooky Pattern Trail</span></button><button class="puzzle" data-puzzle="maze"><span class="puzzle-art shape-maze"></span><span>Harvest Corn Maze</span></button></div></div>
      <div class="section"><div class="section-head"><h3>Inventory</h3><span>Tools for a Kinder, Brighter World</span></div><div class="inventory">${content.inventory.map(it=>`<div class="inv ${s.inventory.includes(it.id)?'':'locked'}"><img src="${it.icon}" alt=""><strong>${it.name}</strong><span>${it.description}</span></div>`).join('')}</div></div>
      <div class="actions"><button class="action secondary" data-hint>${icon('hint.svg','')}<span>Need a Hint?</span></button><button class="action primary" data-check><span>Check My Answer</span><span aria-hidden="true">›</span></button></div>
    </section>
  </div></main></div>`;
  bind(m,world);
  mountGame(document.getElementById('game-canvas'),{
    mission:m,world,store,
    onSelect:(i)=>store.set({selected:i}),
    onCorrectScene:(i)=>{document.getElementById('fb').textContent='Great looking! You found the biggest pumpkin.';award(m,false)},
    onWrongScene:()=>{document.getElementById('fb').textContent='Good try. Look again for the pumpkin that takes up the most space.';},
    onCollect:(type)=>{document.getElementById('fb').textContent=type==='egg'?'You found a hidden egg!':'';}
  });
}

async function award(m,advance=true){
  const s=store.state,inv=[...s.inventory]; if(m.reward&&!inv.includes(m.reward))inv.push(m.reward);
  const solved=Math.min(Math.max(s.solved,s.missionIndex+1),content.missions.length);
  store.set({solved,inventory:inv});
  try{await saveProfile(s.playerId,store.state)}catch{}
  if(advance) setTimeout(()=>store.set({missionIndex:Math.min(s.missionIndex+1,content.missions.length-1),selected:null}),800);
}

function bind(m,world){
  document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>store.set({selected:Number(b.dataset.answer)}));
  document.querySelector('[data-hint]').onclick=()=>document.getElementById('fb').textContent=m.hint;
  document.querySelector('[data-check]').onclick=async()=>{
    const s=store.state;if(s.selected===null)return document.getElementById('fb').textContent=world.id==='patch'?'Tap a pumpkin in the scene, or choose one of the answer cards.':'Choose an answer first.';
    const buttons=[...document.querySelectorAll('[data-answer]')];
    if(s.selected===m.correct){buttons[s.selected].classList.add('correct');document.getElementById('fb').textContent='Correct! Great exploring.';await award(m,true)}
    else{buttons[s.selected].classList.add('wrong');document.getElementById('fb').textContent='Not quite. Try again or use a hint.'}
  };
  document.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>{const idx=content.missions.findIndex(x=>x.world===b.dataset.world);if(idx>=0)store.set({missionIndex:idx,selected:null})});
  document.querySelectorAll('[data-puzzle]').forEach(b=>b.onclick=()=>modal(b.dataset.puzzle==='maze'?mazePuzzle():simplePuzzle(b.dataset.puzzle)));
  document.querySelector('[data-map]').onclick=()=>modal({title:'World Map',html:`<div class="puzzles">${content.worlds.map(w=>`<button class="puzzle map-jump" data-jump="${w.id}">${w.title}</button>`).join('')}</div>`,bind(){document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{const idx=content.missions.findIndex(x=>x.world===b.dataset.jump);if(idx>=0)store.set({missionIndex:idx,selected:null});document.getElementById('modal').classList.remove('open')})}});
}

store.subscribe(render);
async function start(){try{content=await getContent();render()}catch(err){console.error(err);app.innerHTML=`<div class="error-card"><h1>Rescue Quest couldn’t load</h1><p>${String(err.message||err)}</p></div>`}}
start();
