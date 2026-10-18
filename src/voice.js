export class VoicePlayer{
 constructor(music){this.music=music;this.audio=null;this.generation=0;this.volume=.85;this.muted=false}
 stop(){this.generation++;if(this.audio){this.audio.onended=null;this.audio.onerror=null;this.audio.pause();this.audio=null}this.music.duck(false)}
 settings(volume,muted){this.volume=volume;this.muted=muted;if(this.audio){this.audio.volume=volume;this.audio.muted=muted}if(muted)this.stop()}
 async play(url){
  this.stop();if(!url||this.muted||!this.music.enabled)return false
  const generation=this.generation,a=new Audio(url);this.audio=a;a.volume=this.volume
  const finish=()=>{if(this.audio===a){this.audio=null;this.music.duck(false)}}
  a.onended=finish;a.onerror=finish;this.music.duck(true)
  try{await a.play();if(generation!==this.generation){a.pause();return false}return true}catch{a.pause();finish();return false}
 }
}
