let game = null;
let current = null;

const SCENE_W = 900;
const SCENE_H = 760;

function resolveAsset(path){
  return new URL(path.replace(/^\.\//,''), document.baseURI).href;
}

class PumpkinPatchScene extends Phaser.Scene {
  constructor(){ super('PumpkinPatch'); }
  init(data){ this.payload = data; }
  preload(){
    const p=this.payload;
    this.load.image('bg', resolveAsset(p.world.scene));
    this.load.svg('dino', resolveAsset('./assets/characters/dino/idle.svg'), {width:130,height:158});
    this.load.svg('dinoCelebrate', resolveAsset('./assets/characters/dino/celebrate.svg'), {width:138,height:168});
    this.load.svg('pumpkin', resolveAsset('./assets/ui/pumpkin-small.svg'), {width:84,height:68});
    this.load.svg('egg', resolveAsset('./assets/ui/egg-game.svg'), {width:55,height:72});
  }
  create(){
    const p=this.payload;
    this.add.image(SCENE_W/2,SCENE_H/2,'bg').setDisplaySize(SCENE_W,SCENE_H);

    // Gentle warm overlay keeps moving assets integrated with the illustration.
    this.add.rectangle(SCENE_W/2,SCENE_H/2,SCENE_W,SCENE_H,0xf6dfb4,0.035).setDepth(1);

    // drifting leaves: abstract painted flecks, not emoji.
    const fleck = this.add.graphics();
    fleck.fillStyle(0xb96f3a,1); fleck.fillEllipse(6,4,12,8); fleck.generateTexture('leafFleck',12,8); fleck.destroy();
    for(let i=0;i<12;i++) this.spawnLeaf(i*520);

    const pos=p.store.state.character || {x:51,y:69};
    this.dino=this.add.image(pos.x/100*SCENE_W,pos.y/100*SCENE_H,'dino').setDepth(9).setOrigin(.5,.86).setInteractive({useHandCursor:true});
    this.tweens.add({targets:this.dino,y:this.dino.y-3,duration:1200,yoyo:true,repeat:-1,ease:'Sine.inOut'});

    // Actual scene answer objects. They are subtle until the mission asks for them.
    this.pumpkins=[
      {x:0.34,y:0.46,scale:.72,label:'Top Left Pumpkin'},
      {x:0.81,y:0.47,scale:1.28,label:'Top Right Pumpkin'},
      {x:0.28,y:0.76,scale:.85,label:'Bottom Left Pumpkin'},
      {x:0.69,y:0.65,scale:.95,label:'Bottom Center Pumpkin'}
    ].map((o,i)=>{
      const s=this.add.image(o.x*SCENE_W,o.y*SCENE_H,'pumpkin').setDepth(7).setScale(o.scale).setAlpha(.90).setInteractive({useHandCursor:true});
      s.setData('answerIndex',i); s.setData('label',o.label);
      this.tweens.add({targets:s,scaleX:o.scale*1.02,scaleY:o.scale*.98,duration:1600+i*170,yoyo:true,repeat:-1,ease:'Sine.inOut'});
      s.on('pointerdown',()=>this.choosePumpkin(s));
      s.on('pointerover',()=>s.setTint(0xfff0d0)); s.on('pointerout',()=>s.clearTint());
      return s;
    });

    const eggKey=p.mission.id+':egg-game';
    this.egg=this.add.image(0.12*SCENE_W,0.80*SCENE_H,'egg').setDepth(8).setScale(.82).setInteractive({useHandCursor:true});
    if(p.store.state.found[eggKey]) this.egg.setAlpha(.2).disableInteractive();
    else {
      this.tweens.add({targets:this.egg,angle:{from:-2,to:2},duration:900,yoyo:true,repeat:-1});
      this.egg.on('pointerdown',()=>this.collectEgg(eggKey));
    }

    // clickable ground movement
    this.input.on('pointerdown',pointer=>{
      const objs=this.input.hitTestPointer(pointer);
      if(objs.some(o=>o===this.egg || this.pumpkins.includes(o) || o===this.dino)) return;
      this.walkTo(pointer.x,pointer.y);
    });

    this.add.rectangle(0,SCENE_H-5,SCENE_W,10,0x000000,0).setDepth(2);
  }
  spawnLeaf(delay=0){
    const x=Phaser.Math.Between(35,SCENE_W-35);
    const leaf=this.add.image(x,-15,'leafFleck').setDepth(10).setAlpha(.45).setScale(Phaser.Math.FloatBetween(.45,.85)).setAngle(Phaser.Math.Between(-40,40));
    this.tweens.add({targets:leaf,x:x+Phaser.Math.Between(-100,100),y:SCENE_H+25,angle:leaf.angle+Phaser.Math.Between(120,300),duration:Phaser.Math.Between(6500,10500),delay,repeat:-1,onRepeat:()=>{leaf.x=Phaser.Math.Between(40,SCENE_W-40);leaf.y=-15;}});
  }
  walkTo(x,y,cb){
    x=Phaser.Math.Clamp(x,55,SCENE_W-55); y=Phaser.Math.Clamp(y,205,SCENE_H-35);
    const dx=x-this.dino.x;
    this.dino.setFlipX(dx<0);
    this.tweens.killTweensOf(this.dino);
    this.tweens.add({targets:this.dino,x,y,duration:Math.max(350,Phaser.Math.Distance.Between(this.dino.x,this.dino.y,x,y)*2.4),ease:'Sine.inOut',onComplete:()=>{
      this.payload.store.set({character:{x:x/SCENE_W*100,y:y/SCENE_H*100}}); cb?.();
      this.tweens.add({targets:this.dino,y:this.dino.y-3,duration:1200,yoyo:true,repeat:-1,ease:'Sine.inOut'});
    }});
  }
  choosePumpkin(sprite){
    const index=sprite.getData('answerIndex');
    this.payload.onSelect(index);
    this.walkTo(sprite.x-45,sprite.y+28,()=>{
      if(index===this.payload.mission.correct){
        this.celebrate();
        this.tweens.add({targets:sprite,scaleX:sprite.scaleX*1.14,scaleY:sprite.scaleY*1.14,duration:180,yoyo:true,repeat:1});
        this.payload.onCorrectScene(index);
      } else {
        this.cameras.main.shake(120,.002);
        this.tweens.add({targets:sprite,x:sprite.x-7,duration:65,yoyo:true,repeat:3});
        this.payload.onWrongScene(index);
      }
    });
  }
  collectEgg(key){
    this.walkTo(this.egg.x+38,this.egg.y+16,()=>{
      this.tweens.add({targets:this.egg,y:this.egg.y-70,alpha:0,scale:1.15,duration:500,ease:'Back.easeIn',onComplete:()=>{
        const s=this.payload.store.state;
        const found={...s.found,[key]:true};
        this.payload.store.set({found,eggs:s.eggs+1});
        this.payload.onCollect?.('egg');
      }});
    });
  }
  celebrate(){
    const x=this.dino.x,y=this.dino.y;
    this.dino.setTexture('dinoCelebrate').setDisplaySize(138,168);
    this.tweens.add({targets:this.dino,y:y-18,duration:190,yoyo:true,repeat:2,ease:'Quad.out',onComplete:()=>this.dino.setTexture('dino').setDisplaySize(130,158)});
    for(let i=0;i<14;i++){
      const g=this.add.circle(x,y-70,Phaser.Math.Between(3,6),Phaser.Display.Color.RandomRGB().color,.8).setDepth(12);
      this.tweens.add({targets:g,x:x+Phaser.Math.Between(-95,95),y:y+Phaser.Math.Between(-120,10),alpha:0,duration:700,onComplete:()=>g.destroy()});
    }
  }
}

class StaticWorldScene extends Phaser.Scene {
  constructor(){ super('StaticWorld'); }
  init(data){ this.payload=data; }
  preload(){
    this.load.image('bg2',resolveAsset(this.payload.world.scene));
    this.load.svg('dino2',resolveAsset('./assets/characters/dino/idle.svg'),{width:130,height:158});
  }
  create(){
    this.add.image(SCENE_W/2,SCENE_H/2,'bg2').setDisplaySize(SCENE_W,SCENE_H);
    const pos=this.payload.store.state.character||{x:50,y:70};
    this.dino=this.add.image(pos.x/100*SCENE_W,pos.y/100*SCENE_H,'dino2').setDepth(6).setOrigin(.5,.86);
    this.input.on('pointerdown',p=>{
      const x=Phaser.Math.Clamp(p.x,55,SCENE_W-55),y=Phaser.Math.Clamp(p.y,205,SCENE_H-35);
      this.tweens.add({targets:this.dino,x,y,duration:550,ease:'Sine.inOut',onComplete:()=>this.payload.store.set({character:{x:x/SCENE_W*100,y:y/SCENE_H*100}})});
    });
  }
}

export function mountGame(container,payload){
  destroyGame();
  if(!window.Phaser){ container.innerHTML='<div class="game-fallback">Game engine could not load. Refresh once and try again.</div>'; return; }
  current=payload;
  const SceneClass=payload.world.id==='patch'?PumpkinPatchScene:StaticWorldScene;
  game=new Phaser.Game({
    type:Phaser.AUTO,
    parent:container,
    width:SCENE_W,height:SCENE_H,
    transparent:true,
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
    render:{antialias:true,pixelArt:false},
    scene:[SceneClass],
    input:{activePointers:2}
  });
  return game;
}

export function destroyGame(){ if(game){ game.destroy(true); game=null; } }
