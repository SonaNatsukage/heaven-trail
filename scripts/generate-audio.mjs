// Original procedural score. No third-party samples. Regenerate with node scripts/generate-audio.mjs.
import { writeFileSync, mkdirSync } from 'node:fs'
mkdirSync('public/audio',{recursive:true})
const rate=22050, duration=32, length=rate*duration
const hz=m=>440*2**((m-69)/12)
function render(name, chords, melody, warmth){
 const out=new Float64Array(length)
 function note(start,midi,seconds,amp,tone='piano'){
  const f=hz(midi),offset=Math.floor(start*rate),n=Math.floor(seconds*rate)
  for(let i=0;i<n;i++){
   const t=i/rate, edge=Math.min(1,t/.025)*Math.min(1,(seconds-t)/.3)
   const wave=tone==='pad' ? Math.sin(2*Math.PI*f*t)+.16*Math.sin(2*Math.PI*f*2.003*t) : Math.sin(2*Math.PI*f*t)+.3*Math.sin(2*Math.PI*f*2*t)*Math.exp(-t*3)+.12*Math.sin(2*Math.PI*f*3*t)*Math.exp(-t*5)
   const env=tone==='pad'?Math.sin(Math.PI*t/seconds)**1.5:Math.exp(-t*1.45)*edge
   out[(offset+i)%length]+=wave*env*amp
  }
 }
 for(let bar=0;bar<8;bar++){
  const chord=chords[bar%chords.length],time=bar*4
  chord.forEach((m,i)=>{note(time+i*.1,m,4,.035,'pad');note(time+i*.65,m+12,2.5,.055)})
  note(time,chord[0]-12,3.8,.08)
  if(warmth)note(time+2,chord[0]-12,1.7,.045)
  for(let b=0;b<4;b++){const m=melody[(bar*4+b)%melody.length];if(m)note(time+b+.3,m,2.8,.09)}
 }
 // Two quiet delays wrap at the loop boundary for a continuous tail.
 const dry=out.slice();for(let i=0;i<length;i++){out[i]+=dry[(i-Math.floor(rate*.23)+length)%length]*.16+dry[(i-Math.floor(rate*.47)+length)%length]*.09}
 const buf=Buffer.alloc(44+length*4);buf.write('RIFF');buf.writeUInt32LE(buf.length-8,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(2,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*4,28);buf.writeUInt16LE(4,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(length*4,40)
 for(let i=0;i<length;i++){const left=Math.tanh(out[i]*1.35)*.65;const right=Math.tanh((out[i]*.88+out[(i+length-240)%length]*.12)*1.35)*.65;buf.writeInt16LE(Math.round(left*32767),44+i*4);buf.writeInt16LE(Math.round(right*32767),46+i*4)}
 writeFileSync(`public/audio/${name}.wav`,buf)
}
render('reception',[[48,55,62],[45,52,59],[41,48,55],[43,50,57]],[76,0,74,0,71,0,67,0,69,0,72,0,71,0,67,0],false)
render('cafe',[[48,52,59],[45,52,60],[50,53,60],[43,53,59]],[76,79,0,74,72,0,71,67,69,72,76,0,74,71,67,0],true)
render('quiet',[[45,52,60],[41,48,55],[48,55,62],[43,50,59]],[76,0,0,74,72,0,0,0,69,0,72,0,71,0,0,0],false)
console.log('Created 3 original 32-second stereo BGM loops.')
