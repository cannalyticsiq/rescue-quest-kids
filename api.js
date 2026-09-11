
const LOCAL_CONTENT = './data/content.json';

function backendBase(){
  return localStorage.getItem('rescueQuestApiBase') || '';
}

export async function getContent(){
  const base=backendBase();

  // Try a separately deployed backend only when the user has configured one.
  if(base){
    try{
      const r=await fetch(`${base.replace(/\/$/,'')}/api/content`, {cache:'no-store'});
      if(r.ok) return await r.json();
    }catch(err){
      console.warn('Backend content unavailable; using local content.', err);
    }
  }

  const local=await fetch(LOCAL_CONTENT, {cache:'no-store'});
  if(!local.ok) throw new Error(`Local content failed to load (${local.status})`);
  return local.json();
}

export async function getProfile(id){
  const base=backendBase();
  if(!base) return null;
  try{
    const r=await fetch(`${base.replace(/\/$/,'')}/api/profile/${encodeURIComponent(id)}`);
    return r.ok ? r.json() : null;
  }catch{
    return null;
  }
}

export async function saveProfile(id,data){
  const base=backendBase();
  if(!base) return null; // localStorage remains the default on GitHub Pages
  try{
    const r=await fetch(`${base.replace(/\/$/,'')}/api/profile/${encodeURIComponent(id)}`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    return r.ok ? r.json() : null;
  }catch{
    return null;
  }
}
