import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {voicedLines} from '../src/trial-data.js'
const root=new URL('../',import.meta.url)
try{process.loadEnvFile(new URL('.env.local',root))}catch(e){if(e.code!=='ENOENT')throw Error('Cannot load secret configuration')}
const dry=process.argv.includes('--dry-run'),key=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY
if(!dry&&!key)throw Error('GEMINI_API_KEY is not configured')
const config=JSON.parse(await readFile(new URL('docs/voice-audition.json',root),'utf8'))
const output=new URL('public/audio/trial/',root)
if(!dry)await mkdir(output,{recursive:true})
let manifest={};try{manifest=JSON.parse(await readFile(new URL('manifest.json',output),'utf8'))}catch{}
let lastRequest=0
for(const line of voicedLines){
 const character=config.characters.find(c=>c.id===line.who)
 const style=character.direction+' 議論中の真剣で自然な会話。文章の意味に応じてためらいや感情を表す。音楽・効果音を付けず、セリフのみ。'
 const hash=createHash('sha256').update(JSON.stringify([config.model,character.voice,style,line.text])).digest('hex')
 if(dry){console.log(line.id,character.voice);continue}
 if(manifest[line.id]?.hash===hash){try{const b=await readFile(new URL(line.id+'.wav',output));if(b.toString('ascii',0,4)==='RIFF'){console.log('Keeping '+line.id);continue}}catch{}}
 const delay=22000-(Date.now()-lastRequest);if(delay>0)await new Promise(r=>setTimeout(r,delay))
 lastRequest=Date.now()
 let response
 for(let attempt=0;attempt<3;attempt++){
 try{response=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({model:config.model,input:[{type:'user_input',content:[{type:'text',text:line.text,annotations:[{type:'speech_metadata',style}]}]}],response_format:{type:'audio'},generation_config:{speech_config:[{voice:character.voice}]}}),signal:AbortSignal.timeout(120000)})}catch{throw Error('Network request failed. No automatic retry.')}
 if(response.status!==429||attempt===2)break
 console.log('Rate limit: waiting 65 seconds before retrying this line.')
 await new Promise(r=>setTimeout(r,65000));lastRequest=Date.now()
 }
 if(!response.ok){
  if(response.status===429){const error=await response.json();for(const detail of error.error?.details||[]){if(detail.retryDelay)console.log('Retry delay: '+String(detail.retryDelay).slice(0,30));for(const v of detail.violations||[])console.log('Quota: '+String(v.quotaMetric||'').slice(0,160)+' / '+String(v.quotaId||'').slice(0,160))}}
  throw Error(`Gemini HTTP ${response.status}. Stopped; no paid fallback.`)
 }
 const data=await response.json(),clip=(data.steps||[]).filter(s=>s.type==='model_output').flatMap(s=>s.content||[]).filter(c=>c.type==='audio').at(-1)
 if(!clip?.data)throw Error('No audio returned')
 const wav=Buffer.from(clip.data,'base64')
 if(wav.toString('ascii',0,4)!=='RIFF'||wav.toString('ascii',8,12)!=='WAVE')throw Error('Expected WAV')
 await writeFile(new URL(line.id+'.wav',output),wav)
 manifest[line.id]={hash,voice:character.voice,model:config.model}
 await writeFile(new URL('manifest.json',output),JSON.stringify(manifest,null,2)+'\n')
 console.log('Saved '+line.id)
}
console.log(`Ready: ${voicedLines.length} character lines`)
