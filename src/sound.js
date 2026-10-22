const tracks={reception:'/audio/reception.wav',cafe:'/audio/cafe.wav',quiet:'/audio/quiet.wav'}
export class Sound {
  context=null; current=null; active=new Set(); scene=null; bgm=.42; se=.45; muted=false; enabled=false; error=false; timer=null
  disable(){this.pause();this.enabled=false}
  async unlock(){
    try{this.context ||= new (window.AudioContext||window.webkitAudioContext)();await this.context.resume();this.enabled=true;this.error=false;return true}catch{this.error=true;return false}
  }
  generation=0
  ducked=false
  duck(value){this.ducked=value;for(const a of this.active)a.volume=this.bgm*(value?.25:1)}
  async play(scene){
    if(!this.enabled || (scene===this.scene && this.current))return
    this.pause()
    const generation=this.generation, audio=new Audio(tracks[scene])
    this.scene=scene;this.current=audio;this.active.add(audio)
    audio.loop=true;audio.volume=this.bgm*(this.ducked?.25:1);audio.muted=this.muted
    try{
      await audio.play()
      if(generation!==this.generation){audio.pause();return}
      this.error=false
    }catch{
      audio.pause();this.active.delete(audio)
      if(generation===this.generation){this.error=true;this.current=null;this.scene=null}
    }
  }
  settings(bgm,se,muted){this.bgm=bgm;this.se=se;this.muted=muted;for(const a of this.active){a.muted=muted;a.volume=bgm*(this.ducked?.25:1)}}
  effect(kind){
    if(!this.enabled||this.muted||!this.context||this.context.state!=='running')return
    const ctx=this.context,now=ctx.currentTime,volume=this.se*.15
    const tone=(freq,start,duration,type='sine',gain=1)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,now+start);g.gain.linearRampToValueAtTime(volume*gain,now+start+.008);g.gain.exponentialRampToValueAtTime(.0001,now+start+duration);o.connect(g);g.connect(ctx.destination);o.start(now+start);o.stop(now+start+duration);o.onended=()=>{o.disconnect();g.disconnect()}}
    if(kind==='plus'){tone(660,0,.28);tone(880,.09,.35)}
    else if(kind==='minus'){tone(440,0,.25);tone(330,.09,.3)}
    else if(kind==='bell'){tone(1046,0,1);tone(1568,.08,.8,'sine',.5)}
    else if(kind==='cup'){tone(1600,0,.15,'sine',.5);tone(2300,.015,.12,'sine',.25)}
    else if(kind==='paper'||kind==='stamp'){
      const n=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.16),ctx.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*6)
      const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=n;filter.type='lowpass';filter.frequency.value=kind==='paper'?2200:450;g.gain.value=volume*.6;src.connect(filter);filter.connect(g);g.connect(ctx.destination);src.start();src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect()}
    }else tone(740,0,.09,'sine',.3)
  }
  pause(){this.generation++;for(const a of this.active)a.pause();this.scene=null;this.current=null;this.active.clear()}
  status(){return !this.enabled?'音声オフ':this.error?'音声を再開してください':this.muted?'ミュート':this.current&&!this.current.paused?'BGM 再生中':'音声待機中'}
}
export const sound = new Sound()


