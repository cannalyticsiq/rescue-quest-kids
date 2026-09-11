const defaultState={playerId:'little-explorer',missionIndex:0,selected:null,solved:0,pumpkins:0,eggs:0,inventory:[],found:{},character:{x:43,y:68}};
export class Store{
  constructor(){this.state={...defaultState,...JSON.parse(localStorage.getItem('rescueQuestState')||'{}')};this.listeners=new Set()}
  subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn)}
  set(patch){this.state={...this.state,...patch};localStorage.setItem('rescueQuestState',JSON.stringify(this.state));this.listeners.forEach(fn=>fn(this.state))}
  reset(){this.state={...defaultState};localStorage.setItem('rescueQuestState',JSON.stringify(this.state));this.listeners.forEach(fn=>fn(this.state))}
}
