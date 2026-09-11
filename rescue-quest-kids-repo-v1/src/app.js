import {getContent,saveProfile} from './api.js';
import {Store} from './store.js';
import {mountCharacter} from './character.js';
import {mazePuzzle,simplePuzzle} from './puzzles.js';

const store=new Store();let content;
const app=document.getElementById('app'),modalRoot=document.getElementById('modal-root');
modalRoot.innerHTML='<div class="modal" id="modal"><div class="modal-card"><div class="modal-head"><h2 id="modal-title"></h2><button class="close" id="modal-close">✕</button></div><div id="modal-body"></div></div></div>';

document.getElementById('modal-close').onclick=()=>document.getElementById('modal').classList.remove('open');

function modal(p){document.getElementById('modal-title').textContent=p.title;document.getElementById('modal-body').innerHTML=p.html;document.getElementById('modal').classList.add('open');p.bind?.()}

function render(){
  if(!content)return;const s=store.state,m=content.missions[Math.min(s.missionIndex,content.missions.length-1)],world=content.worlds.find(w=>w.id===m.world);
  app.innerHTML=`<div class="shell"><header class="header"><div class="brand"><div class="brand-leaf">🍂</div><div><div class="brand-title">Rescue Quest <span>Kids</span></div><div class="brand-sub">${content.tagline}</div></div></div><div class="mantra">Kind Kids<br>Change Big Things</div><div><div class="progress-label"><span>Adventure Progress</span><span>${s.solved} / ${content.missions.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${s.solved/content.missions.length*100}%"></div></div></div><div class="counters"><div class="counter">🎃 ${s.pumpkins}</div><div class="counter">🥚 ${s.eggs}</div></div></header>
  <nav class="tabs">${content.worlds.map(w=>`<button class="tab ${w.id===m.world?'active':''}" data-world="${w.id}"><strong>${w.title}</strong><span>${w.subtitle}</span></button>`).join('')}<button class="tab" data-map><strong>World Map</strong><span>Adventure hub</span></button></nav>
  <main class="main"><div class="layout"><section class="card"><div class="scene" id="scene"><img src="${world.scene}" alt="${world.title}">${m.hotspots.map((h,i)=>`<button class="hotspot ${h.type} ${s.found[m.id+':'+i]?'found':''}" data-hot="${i}" style="left:calc(${h.x}% - 24px);top:calc(${h.y}% - 24px)">${s.found[m.id+':'+i]?'✓':'?'}</button>`).join('')}</div><div class="tip"><div class="tip-avatar">🦖</div><div><strong>Explorer Tip:</strong><p>${m.tip}</p></div></div></section>
  <section class="card panel"><div class="eyebrow">${m.eyebrow}</div><h1 class="world-title">${m.title}</h1><p class="copy">${m.intro}</p><div class="question"><h2>${m.question}</h2><p>${m.sub}</p></div><div class="answers">${m.answers.map((a,i)=>`<button class="answer ${s.selected===i?'selected':''}" data-answer="${i}">${a}</button>`).join('')}</div><div class="feedback" id="fb"></div>
  <div class="section"><div class="section-head"><h3>Halloween Puzzles</h3><span>Solve puzzles. Discover kindness.</span></div><div class="puzzles"><button class="puzzle" data-puzzle="shadow">Shadow Match</button><button class="puzzle" data-puzzle="pattern">Spooky Pattern Trail</button><button class="puzzle" data-puzzle="maze">Harvest Corn Maze</button></div></div>
  <div class="section"><div class="section-head"><h3>Inventory</h3><span>Tools for a Kinder, Brighter World</span></div><div class="inventory">${content.inventory.map(it=>`<div class="inv ${s.inventory.includes(it.id)?'':'locked'}"><div class="symbol">${it.symbol}</div><strong>${it.name}</strong><span>${it.description}</span></div>`).join('')}</div></div>
  <div class="actions"><button class="action secondary" data-hint>💡 Need a Hint?</button><button class="action primary" data-check>Check My Answer ›</button></div></section></div></main></div>`;
  bind(m);mountCharacter(document.getElementById('scene'),store);
}

function bind(m){
  document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>store.set({selected:Number(b.dataset.answer)}));
  document.querySelector('[data-hint]').onclick=()=>document.getElementById('fb').textContent=m.hint;
  document.querySelector('[data-check]').onclick=async()=>{const s=store.state;if(s.selected===null)return document.getElementById('fb').textContent='Choose an answer first.';const buttons=[...document.querySelectorAll('[data-answer]')];if(s.selected===m.correct){buttons[s.selected].classList.add('correct');const inv=[...s.inventory];if(m.reward&&!inv.includes(m.reward))inv.push(m.reward);document.getElementById('fb').textContent='Correct!';store.set({solved:Math.min(s.solved+1,content.missions.length),inventory:inv});try{await saveProfile(s.playerId,store.state)}catch{}setTimeout(()=>store.set({missionIndex:Math.min(s.missionIndex+1,content.missions.length-1),selected:null}),700)}else{buttons[s.selected].classList.add('wrong');document.getElementById('fb').textContent='Not quite. Try again.'}};
  document.querySelectorAll('[data-hot]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.hot),key=m.id+':'+i;if(store.state.found[key])return;const found={...store.state.found,[key]:true},h=m.hotspots[i];store.set({found,pumpkins:store.state.pumpkins+(h.type==='pumpkin'?1:0),eggs:store.state.eggs+(h.type==='egg'?1:0)})});
  document.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>{const idx=content.missions.findIndex(x=>x.world===b.dataset.world);if(idx>=0)store.set({missionIndex:idx,selected:null})});
  document.querySelectorAll('[data-puzzle]').forEach(b=>b.onclick=()=>modal(b.dataset.puzzle==='maze'?mazePuzzle():simplePuzzle(b.dataset.puzzle)));
  document.querySelector('[data-map]').onclick=()=>modal({title:'World Map',html:`<div class="puzzles">${content.worlds.map(w=>`<button class="puzzle map-jump" data-jump="${w.id}">${w.title}</button>`).join('')}</div>`,bind(){document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{const idx=content.missions.findIndex(x=>x.world===b.dataset.jump);if(idx>=0)store.set({missionIndex:idx,selected:null});document.getElementById('modal').classList.remove('open')})}})
}

store.subscribe(render);

async function start(){
  try{
    content=await getContent();
    render();
  }catch(err){
    console.error(err);
    app.innerHTML=`<div class="error-card">
      <h1>Rescue Quest couldn’t load</h1>
      <p>The app itself loaded, but its local game data did not. Refresh once after GitHub Pages finishes deploying.</p>
      <p style="font-size:13px;opacity:.75">${String(err.message || err)}</p>
    </div>`;
  }
}
start();
