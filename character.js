
export function mountCharacter(scene,store){
  const el=document.createElement('button');
  el.className='character';
  el.type='button';
  el.textContent='🦖';
  el.setAttribute('aria-label','Explorer dinosaur');

  const place=()=>{
    const c=store.state.character || {x:43,y:68};
    el.style.left=c.x+'%';
    el.style.top=c.y+'%';
  };
  place();
  scene.appendChild(el);

  scene.addEventListener('click',e=>{
    if(e.target.closest('.hotspot') || e.target.closest('.character')) return;
    const r=scene.getBoundingClientRect();
    const x=Math.max(5,Math.min(90,(e.clientX-r.left)/r.width*100));
    const y=Math.max(10,Math.min(86,(e.clientY-r.top)/r.height*100));
    el.classList.add('walking');
    store.set({character:{x,y}});
    place();
    window.setTimeout(()=>el.classList.remove('walking'),650);
  });
}
