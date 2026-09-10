export async function getContent(){
  const r=await fetch('/api/content');
  if(!r.ok) throw new Error('content_load_failed');
  return r.json();
}
export async function getProfile(id){
  const r=await fetch(`/api/profile/${encodeURIComponent(id)}`);
  return r.ok ? r.json() : null;
}
export async function saveProfile(id,data){
  const r=await fetch(`/api/profile/${encodeURIComponent(id)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(!r.ok) throw new Error('profile_save_failed');
  return r.json();
}
