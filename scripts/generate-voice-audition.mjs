import {readFile,mkdir,writeFile,access} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
const root=fileURLToPath(new URL('../',import.meta.url))
// Node-only secret loading: never import this script into the browser bundle.
try{process.loadEnvFile(path.join(root,'.env.local'))}catch(e){if(e.code!=='ENOENT')throw Error('Cannot load .env.local')}
const config=JSON.parse(await readFile(path.join(root,'docs/voice-audition.json'),'utf8'))
const dry=process.argv.includes('--dry-run')
const key=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY
if(!key&&!dry){console.error('GEMINI_API_KEY is not configured. Save it in .env.local; do not paste it into chat.');process.exit(1)}
const output=path.join(root,'outputs','voice-audition')
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const cards=[]
if(!dry)await mkdir(output,{recursive:true})
for(const character of config.characters){
 for(const sample of character.samples){
  const filename=`${character.id}-${sample.id}.wav`,destination=path.join(output,filename)
  const body={model:config.model,input:[{type:'user_input',content:[{type:'text',text:sample.text,annotations:[{type:'speech_metadata',style:`${character.direction} ${sample.style} 音楽・効果音は付けず、セリフのみを読む。`}]}]}],response_format:{type:'audio'},generation_config:{speech_config:[{voice:character.voice}]}}
  if(dry){console.log(`${filename}: ${character.voice} / ${sample.label}`);continue}
  let exists=false;try{await access(destination);exists=true}catch{}
  if(!exists){
   let response
   try{response=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body),signal:AbortSignal.timeout(120000)})}catch{throw Error('Gemini network request failed; stopped without retrying.')}
   // Do not log raw provider errors: they can contain credential or request details.
   if(!response.ok)throw Error(`Gemini HTTP ${response.status}; stopped. Check model access, free-tier quota and API key settings. No automatic paid fallback or retry.`)
   const data=await response.json()
   const clips=(data.steps||[]).filter(s=>s.type==='model_output').flatMap(s=>s.content||[]).filter(c=>c.type==='audio')
   const encoded=clips.at(-1)?.data
   if(!encoded)throw Error('No audio returned. Stopped for inspection.')
   const wav=Buffer.from(encoded,'base64')
   if(wav.toString('ascii',0,4)!=='RIFF'||wav.toString('ascii',8,12)!=='WAVE')throw Error('Expected WAV audio; stopped without writing an invalid file.')
   await writeFile(destination,wav,{flag:'wx'})
   console.log(`Saved ${filename}`)
  }else console.log(`Keeping ${filename}`)
  cards.push(`<article><h2>${escape(character.name)} · ${escape(sample.label)}</h2><p>${escape(sample.text)}</p><audio controls preload="none" src="${filename}"></audio><small>候補音声：${escape(character.voice)}</small></article>`)
 }
}
if(!dry){
 await writeFile(path.join(output,'index.html'),`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HEAVEN TRAIL ボイス試聴</title><style>body{background:#f5f1e8;color:#302f38;font:17px/1.8 sans-serif;max-width:850px;margin:40px auto;padding:20px}article{background:#fff;padding:24px;margin:20px 0;border-radius:12px}audio{width:100%}small{display:block;color:#666}</style><h1>ゆう・まひる・ゆめの声</h1><p>GeminiによるAI生成音声・配役検討用。各3パターン。ゲーム本編には未採用です。</p>${cards.join('')}<script>document.addEventListener('play',e=>{if(e.target.tagName==='AUDIO')document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()})},true)</script></html>`)
 console.log('Audition ready: outputs/voice-audition/index.html')
}
