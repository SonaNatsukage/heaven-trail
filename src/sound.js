const tracks={reception:'/audio/reception.wav',cafe:'/audio/cafe.wav',quiet:'/audio/quiet.wav'}
class Sound {
  context=null; current=null; active=new Set(); scene=null; bgm=.42; se=.45; muted=false; enabled=false; error=false; timer=null
  async unlock(){
    try{this.context ||= new (window.AudioContext||window.webkitAudioContext)();await this.context.resume();this.enabled=true;this.error=false;return true}catch{this.error=true;return false}
  }
  async play(scene){
    if(!this.enabled || (scene===this.scene && this.current&&!this.current.paused))return
    this.scene=scene
    const old=this.current, audio=new Audio(tracks[scene]);audio.loop=true;audio.volume=0;audio.muted=this.muted;this.active.add(audio);this.current=audio
    try{await audio.play();this.error=false}catch{this.error=true;this.active.delete(audio);if(this.current===audio)this.current=null;return}
    const started=performance.now(),oldVolume=old?.volume||0
    const timer=setInterval(()=>{const t=Math.min(1,(performance.now()-started)/1100);audio.volume=this.muted?0:this.bgm*t;if(old)old.volume=oldVolume*(1-t);if(t===1){clearInterval(timer);if(old){old.pause();this.active.delete(old)}}},30)
  }
  settings(bgm,se,muted){this.bgm=bgm;this.se=se;this.muted=muted;for(const a of this.active){a.muted=muted;a.volume=bgm}}
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
  pause(){for(const a of this.active)a.pause();this.scene=null;this.current=null;this.active.clear()}
  status(){return !this.enabled?'音声オフ':this.error?'音声を再開してください':this.muted?'ミュート':this.current&&!this.current.paused?'BGM 再生中':'音声待機中'}
}
export const sound = new Sound()

