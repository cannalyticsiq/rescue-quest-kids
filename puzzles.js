export function mazePuzzle(){
  const rows=['WWWWWWW','W...WGW','W.W.W.W','W.W...W','W.WWW.W','WS....W','WWWWWWW'];let p={r:5,c:1};
  return {title:'Harvest Corn Maze',html:`<p>Guide the explorer to the scarecrow.</p><div class="maze-grid" id="maze"></div><div class="pad"><span class="blank"></span><button data-m="-1,0">↑</button><span class="blank"></span><button data-m="0,-1">←</button><button data-m="1,0">↓</button><button data-m="0,1">→</button></div><p id="maze-fb"></p>`,bind(){
    const draw=()=>{const g=document.getElementById('maze');g.innerHTML='';rows.forEach((row,r)=>[...row].forEach((ch,c)=>{const d=document.createElement('div');d.className='cell'+(ch==='W'?' wall':'')+(ch==='G'?' goal':'')+(p.r===r&&p.c===c?' player':'');if(ch==='G')d.textContent='★';if(p.r===r&&p.c===c)d.textContent='●';g.appendChild(d)}))};draw();
    document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const [dr,dc]=b.dataset.m.split(',').map(Number),nr=p.r+dr,nc=p.c+dc;if(rows[nr]?.[nc]&&rows[nr][nc]!=='W'){p={r:nr,c:nc};draw();if(rows[nr][nc]==='G')document.getElementById('maze-fb').textContent='You found the scarecrow!'}})
  }}
}
export function simplePuzzle(type){
  if(type==='shadow')return{title:'Shadow Match',html:'<p>Which silhouette matches a pumpkin?</p><button class="puzzle" onclick="this.textContent=\'Correct!\'">Pumpkin silhouette</button>'};
  return{title:'Spooky Pattern Trail',html:'<p style="font-size:32px">🎃 🥚 🎃 🥚 ?</p><button class="puzzle" onclick="this.textContent=\'Correct!\'">🎃 Pumpkin</button>'};
}
