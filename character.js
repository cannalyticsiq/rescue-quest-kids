export function mountCharacter(scene,store){
  const el=document.createElement('div');
  el.className='character';el.textContent='🦖';el.setAttribute('aria-label','Explorer dinosaur');
  const place=()=>{el.style.left=store.state.character.x+'%';el.style.top=store.state.character.y+'%'};place();
  scene.appendChild(el);
  scene.addEventListener('click',e=>{
    if(e.target.closest('.hotspot')) return;
    const r=scene.getBoundingClientRect();
    const x=Math.max(3,Math.min(92,(e.clientX-r.left)/r.width*100));
    const y=Math.max(8,Math.min(88,(e.clientY-r.top)/r.height*100));
    el.classList.add('walking');store.set({character:{x,y}});place();setTimeout(()=>el.classList.remove('walking'),600);
  });
}
