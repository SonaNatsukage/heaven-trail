import {useState,useEffect,useRef} from 'react'
import {people,names} from './story.js'
import {trialEndings,hearings,evidence,voicedLines} from './trial-data.js'
import {initialTrial,trialNode,trialLine,reduceTrial,readTrial,saveTrial,decodeTrial} from './trial-engine.js'
import {sound} from './sound.js'
import {VoicePlayer} from './voice.js'
import voiceManifest from '../public/audio/trial/manifest.json'
import './Trial.css'
const voice=new VoicePlayer(sound),voiced=new Set(voicedLines.map(l=>l.id))
const VOICE_OPTIONS='heaven-voice-volume-v1'
function readVolume(){try{const n=Number(localStorage.getItem(VOICE_OPTIONS)??.85);return Number.isFinite(n)&&n>=0&&n<=1?n:.85}catch{return .85}}
export default function Trial({entry,onExit,options}){
 const [state,setState]=useState(()=>{const old=readTrial();return old?decodeTrial(old.latest):initialTrial(entry)}),[panel,setPanel]=useState(null),[selected,setSelected]=useState(false),[tool,setTool]=useState(null),[message,setMessage]=useState(''),[volume,setVolume]=useState(readVolume)
 const n=trialNode(state),line=trialLine(state),h=hearings[n.hearing],speaker=people[line.who]?line.who:(n.hearing?hearings[n.hearing].who:'god'),file=voiceManifest[line.id]?.url||null,dialog=useRef(null),saveFailed=useRef(false)
 function dispatch(action){voice.stop();sound.effect(action.type==='evidence'?'paper':'tap');setSelected(false);setTool(null);setMessage('');setState(s=>reduceTrial(s,action))}
 async function replay(){if(!await sound.unlock()){setMessage('音声を開始できませんでした。');return}await sound.play('quiet');if(!await voice.play(file))setMessage('音声を再生できませんでした。本文はそのまま読めます。')}
 useEffect(()=>{voice.settings(volume,options.muted);try{localStorage.setItem(VOICE_OPTIONS,String(volume))}catch{}},[volume,options.muted])
 useEffect(()=>{const sync=()=>{if(document.hidden){voice.stop();sound.pause()}else sound.play('quiet')};sync();document.addEventListener('visibilitychange',sync);window.addEventListener('pagehide',sync);return()=>{document.removeEventListener('visibilitychange',sync);window.removeEventListener('pagehide',sync);voice.stop();sound.pause()}},[])
 useEffect(()=>{let active=true;if(!document.hidden&&!panel&&!state.ending&&file)voice.play(file).then(ok=>{if(active&&!ok&&sound.enabled&&!voice.muted)setMessage('音声を再生できませんでした。「聞き直す」で再試行できます。')});return()=>{active=false;voice.stop()}},[file,state.ending,panel])
 useEffect(()=>{try{saveTrial(state)}catch{if(!saveFailed.current){saveFailed.current=true;queueMicrotask(()=>setMessage('自動保存できませんでした。保存容量をご確認ください。'))}}},[state])
 useEffect(()=>{if(panel)dialog.current?.showModal();else dialog.current?.close()},[panel])
 function restore(raw){voice.stop();setState(decodeTrial(raw));setPanel(null);setSelected(false);setTool(null);setMessage('')}
 const result=trialEndings[state.ending]
 const archive=panel==='branches'?readTrial():null
 const introText=state.entry.cafe?'昨日のカフェから':'受付での会話から'
 const evidenceText=e=>e.id==='yu'&&state.asked.includes('request')?hearings.request.ask.text:e.id==='mahiru'&&state.asked.includes('consent')?hearings.consent.ask.text:e.text
 return <main className="trial-shell">
  <header className="trial-header"><div><span>HEAVEN TRAIL / 02</span><h1>その親切は、誰のもの</h1></div><button onClick={()=>setPanel('settings')}>音声・設定</button></header>
  <div className="trial-layout"><aside className="trial-cast"><p>{h?'記録照会':state.ending?'審理を終えて':'転生受付'}</p><img src={people[speaker].image} alt={people[speaker].name}/><div className="trial-progress">{Object.entries(hearings).map(([id,item],i)=><span key={id} className={state.solved.includes(id)?'done':n.id===id?'active':''}>{String(i+1).padStart(2,'0')} {item.title}{state.solved.includes(id)?' ✓':''}</span>)}</div></aside>
  <section className="trial-content">
   {result?<><p className="trial-eyebrow">第2話・了</p><h2>{result.title}</h2><p>{result.text}</p><p>今回の徳　<strong>{state.score}</strong></p><p className="trial-muted">{introText}引き継いだ記録です。</p><button className="trial-primary" onClick={()=>setPanel('branches')}>処理方針を選び直す</button><button onClick={onExit}>会話編へ戻る</button></>:<>
    <p className="trial-eyebrow">{h?`${state.solved.length+1} / 3　${h.title}`:'記録照会・異議申立'}</p>
    <div className="trial-speaker">{names[line.who]}{file?<button onClick={replay} disabled={options.muted||volume===0}>▷ 聞き直す</button>:voiced.has(line.id)?<small className="trial-muted">ボイス準備中</small>:null}</div>
    <p className="trial-text">{line.text}</p>
    {state.detail?<button className="trial-primary" onClick={()=>dispatch({type:'back'})}>証言に戻る →</button>:h?<>
     <button className={`trial-term ${selected?'selected':''}`} onClick={()=>{setSelected(true);setTool(null)}}>「{h.term}」を確かめる</button>
     {selected&&<div className="trial-tools"><button onClick={()=>dispatch({type:'ask'})}>詳しく聞く</button><button onClick={()=>setTool('evidence')}>記録を示す</button><button onClick={()=>setTool('interpret')}>別の解釈を示す</button></div>}
     <p className="trial-muted">{!selected?'気になる言葉から、話を確かめる。':!state.asked.includes(n.id)?'まず、当時の言葉を聞いてみよう。':!state.matched.includes(n.id)?'証言を確かめた。根拠となる記録は？':'記録と証言がそろった。この言葉をどう捉える？'}</p>
     {tool==='evidence'&&<div className="trial-options">{evidence.map(e=><button key={e.id} onClick={()=>dispatch({type:'evidence',id:e.id})}>{e.title}<small>{evidenceText(e)}</small></button>)}</div>}
     {tool==='interpret'&&<div className="trial-options">{h.options.map((text,index)=><button key={text} onClick={()=>dispatch({type:'interpret',index})}>{text}</button>)}</div>}
    </>:n.choices?<div className="trial-options">{n.choices.map((c,index)=><button key={c.text} onClick={()=>dispatch({type:'choose',index})}>{c.text}</button>)}</div>:<button className="trial-primary" onClick={()=>dispatch({type:'next'})}>{n.ending?'この話の結びへ':'次へ'} →</button>}
   </>}
   <p role="status" className="trial-message">{message}</p>
  </section></div>
  <nav className="trial-nav"><button onClick={()=>setPanel('evidence')}>記録 5</button><button onClick={()=>setPanel('history')}>会話履歴</button><button onClick={()=>setPanel('branches')}>分岐</button><button onClick={onExit}>会話編へ</button></nav>
  {import.meta.env.VITE_SHOW_DEBUG!=='false'&&<details className="debug-score"><summary>DEBUG · 徳 {state.score}</summary><p>{n.id} / 解決 {state.solved.length}/3</p><p>第2話の増減 {state.score-state.entry.score}</p></details>}
  <dialog ref={dialog} onCancel={()=>setPanel(null)}><div className="modal-head"><button aria-label="閉じる" onClick={()=>setPanel(null)}>×</button></div>
   {panel==='settings'&&<><h2>音声</h2><label className="volume">ボイス {Math.round(volume*100)}%<input aria-label="ボイス音量" type="range" min="0" max="1" step=".05" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label><button onClick={async()=>{await sound.unlock();await sound.play('quiet');setPanel(null)}}>音声を開始する</button><p>ゆう・まひる・ゆめ：GeminiによるAI生成音声。地の文・主人公・かみさまは音声なし。</p><p>BGMと全体ミュートは会話編の設定を引き継ぎます。</p><button onClick={()=>setPanel('restart')}>第2話を最初から</button></>}
   {panel==='restart'&&<><h2>第2話を読み直す</h2><p>第2話開始時の徳に戻ります。保存した分岐は残ります。</p><button onClick={()=>{setState(initialTrial(state.entry));setPanel(null);setSelected(false);setTool(null)}}>最初から</button></>}
   {panel==='evidence'&&<><h2>照会記録</h2>{evidence.map(e=><article key={e.id}><h3>{e.title}</h3><p>{evidenceText(e)}</p></article>)}</>}
   {panel==='history'&&<><h2>会話履歴</h2>{state.history.map((l,i)=><article key={i}><h3>{names[l.who]}</h3><p>{l.text}</p></article>)}</>}
   {panel==='branches'&&<><h2>分岐から再開</h2><p>争点と選択肢の直前を自動保存。徳もその時点に戻ります。</p><div className="branch-list">{archive?.branches.map((b,i)=><button key={i} onClick={()=>restore(b.raw)}>{b.label}</button>)}{!archive?.branches.length&&<p>最初の争点に到達すると記録されます。</p>}</div></>}
  </dialog>
 </main>
}
