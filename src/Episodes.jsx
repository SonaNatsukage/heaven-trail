import {useEffect,useRef,useState} from 'react'
import Legacy from './App.jsx'
import {characters} from './data/characters.js'
import {scenario,evidence,hearings,leads} from './scenarios/heaven.js'
import {initial,reduce,decode,read,checkpoint} from './engine/episodes.js'
import {sound} from './sound.js'
import './Episodes.css'
export default function Experience(){
 const [legacy,setLegacy]=useState(false)
 return legacy?<><button className="ep-legacy-back" onClick={()=>setLegacy(false)}>新版へ戻る</button><Legacy/></>:<Episodes onLegacy={()=>setLegacy(true)}/>
}
function Episodes({onLegacy}){
 const [state,setState]=useState(initial),[started,setStarted]=useState(false),[panel,setPanel]=useState(null),[selected,setSelected]=useState(null),[archive,setArchive]=useState(()=>read(localStorage)),[notice,setNotice]=useState(''),[mute,setMute]=useState(false),[bgm,setBgm]=useState(.35),[se,setSe]=useState(.4),[typing,setTyping]=useState({text:'',count:0}),[receipt,setReceipt]=useState(null)
 const dialog=useRef(null),lastTransaction=useRef(null),failed=useRef(false)
 const n=scenario[state.node],line=state.detail||n,h=n.hearing?hearings[n.hearing]:null,text=line.text,shown=typing.text===text?typing.count:0,complete=shown>=text.length
 const portrait=characters[line.who]?.image?line.who:characters[n.who]?.image?n.who:n.scene==='reception'?'god':'yu'
 function send(a){sound.effect(a.type==='present'?'stamp':'tap');setSelected(null);setState(s=>reduce(s,{...a,at:state.node}))}
 function advance(){if(!complete)setTyping({text,count:text.length});else if(state.detail)send({type:'dismiss'});else if(!n.choices&&!n.hearing&&!n.investigation&&!n.ending)send({type:'next'})}
 async function start(saved=false,audio=true){if(audio)await sound.unlock();else{sound.disable()}const next=saved&&archive?decode(archive.latest):initial();lastTransaction.current=next.transaction;setReceipt(null);setState(next);setStarted(true)}
 function restore(raw){const next=decode(raw);lastTransaction.current=next.transaction;setReceipt(null);setState(next);setSelected(null);setPanel(null)}
 useEffect(()=>{const timer=setInterval(()=>setTyping(t=>t.text===text&&t.count>=text.length?t:{text,count:Math.min(text.length,t.text===text?t.count+2:2)}),28);return()=>clearInterval(timer)},[text])
 useEffect(()=>{sound.settings(bgm,se,mute)},[bgm,se,mute])
 useEffect(()=>{if(!started)return;const sync=()=>document.hidden?sound.pause():sound.play(n.scene);sync();document.addEventListener('visibilitychange',sync);window.addEventListener('pagehide',sync);return()=>{document.removeEventListener('visibilitychange',sync);window.removeEventListener('pagehide',sync);sound.pause()}},[started,n.scene])
 useEffect(()=>{if(!started)return;try{const a=checkpoint(state,localStorage);queueMicrotask(()=>setArchive(a))}catch{if(!failed.current){failed.current=true;setNotice('自動保存できません。保存容量を確認してください。進行は続けられます。')}}},[state,started])
 useEffect(()=>{if(state.transaction&&state.transaction!==lastTransaction.current){lastTransaction.current=state.transaction;setReceipt(state.transaction);sound.effect('stamp');const timer=setTimeout(()=>setReceipt(null),4500);return()=>clearTimeout(timer)}},[state.transaction])
 useEffect(()=>{if(panel)dialog.current?.showModal();else dialog.current?.close()},[panel])
 useEffect(()=>{function key(e){if(!started||panel||['BUTTON','INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.code==='Space'||e.code==='Enter'){e.preventDefault();advance()}}window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)})
 useEffect(()=>()=>sound.pause(),[])
 return <main className={`ep ${n.scene} ${h&&!state.detail?'ep-debate':''}`}>
  <header className="ep-header"><b>HEAVEN <span>TRAIL</span></b><div>{started&&<span className="ep-balance">徳 <strong>{String(state.score).padStart(3,'0')}</strong></span>}<button onClick={()=>setPanel('settings')} aria-label="音量設定">音量</button>{started&&<button onClick={()=>setPanel('menu')}>メニュー</button>}</div></header>
  {!started?<section className="ep-title"><div><p className="ep-label">第0話 — 第1話 / ミステリーADV</p><h1>走れない<br/>天国。</h1><p>あの子が走れるなら、<br/>ここはきっと、いい場所だと思った。</p><button className="ep-primary" onClick={()=>start()}>天国へようこそ　→</button><div className="ep-title-links"><button disabled={!archive} onClick={()=>start(true)}>つづきから</button><button onClick={()=>start(false,false)}>音なしで始める</button><button onClick={onLegacy}>旧版を開く</button></div><small>分岐は自動保存されます。旧版のセーブはそのまま残ります。</small></div><img src={characters.yu.image} alt="膝を抱えて座るゆう"/></section>:<>
   <div className="ep-chapter"><span>{n.episode===0?'00 / 天国へようこそ':'01 / 走れない天国'}</span><span>{n.investigation?'調査':h?'記録照合':n.scene==='reception'?'転生受付':'待合室のカフェ'}</span></div>
   <section className="ep-stage" aria-label="場面"><div className="ep-window"/><div className={line.who==='system'?'ep-terminal visible':'ep-terminal'} aria-hidden="true"><small>HEAVEN ADMINISTRATION</small><strong>処理照会</strong><span>TRANSACTION / RECORD</span></div><img hidden={line.who==='system'} key={portrait} className={`ep-portrait ${portrait==='yu'?'seated':''}`} src={characters[portrait].image} alt={characters[portrait].name}/><div className="ep-stage-caption" aria-hidden="true">{h?'RECORD / OBJECTION':'AFTERLIFE / WAITING ROOM'}</div>{h&&<div className="ep-progress" aria-label={`議論 ${state.solved.length} / 4 解決`}>{Object.entries(hearings).map(([id,value],i)=><span key={id} className={state.solved.includes(id)?'solved':n.hearing===id?'current':''}>{i+1}<small>{value.title}</small></span>)}</div>}</section>
   {n.ending?<section className="ep-dialogue ep-ending"><p className="ep-label">CASE 01 / CLOSED</p><h1>願いは、まだここに。</h1><p>ゆうの残高 148 ／ 走行体験予約 復旧</p><p>{state.flags.includes('reform')?'条件変更時の再確認と上限入力の改善を申立。回答は未定。':'個別の再精算が完了。制度の適用条件は変わらない。'}</p><p>{state.flags.includes('exposed')?'ゆうは礼を言った。そのあと、相談の控えをそっと裏返した。':'ゆうの相談内容は、必要な範囲だけ記録された。'}</p><div className="ep-final-score">今回の徳 <strong>{state.score}</strong></div><button onClick={()=>setPanel('branches')}>分岐を振り返る</button><button onClick={()=>setPanel('menu')}>タイトルへ</button></section>:<section className={`ep-dialogue ${state.detail?.success?'ep-resolved':''}`}>
    <div className="ep-reading"><p className="ep-speaker">{state.detail?.success?'矛盾を確認 / ':''}{characters[line.who]?.name||'地の文'}</p><div className="ep-text" onClick={advance} aria-label={text}>{h&&!state.detail&&complete?text.split(h.term).map((part,i)=><span key={i}>{i>0&&<button className="ep-term" onClick={e=>{e.stopPropagation();setSelected(h.term);setPanel('evidence')}}>{h.term}</button>}{part}</span>):text.slice(0,shown)}{!complete&&<span aria-hidden="true">▎</span>}</div>{!complete?<button className="ep-next" onClick={advance}>全文を表示 ↓</button>:state.detail||(!h&&!n.choices&&!n.investigation)?<button className="ep-next" onClick={advance}>次へ →</button>:null}</div>
    {complete&&!state.detail&&n.choices&&<div className="ep-choices">{n.choices.map((c,i)=><button key={i} onClick={()=>send({type:'choose',index:i})}><small>{String(i+1).padStart(2,'0')}</small>{c.text}<span>↗</span></button>)}</div>}
    {complete&&!state.detail&&n.investigation&&<div className="ep-choices">{leads.map(l=><button key={l.id} disabled={state.visited.includes(l.id)} onClick={()=>send({type:'investigate',id:l.id})}>{state.visited.includes(l.id)?'確認済み · ':''}{l.title}</button>)}<button className="ep-primary" disabled={state.inventory.length!==6} onClick={()=>send({type:'debate'})}>議論へ　{state.inventory.length}/6 資料</button></div>}
    {complete&&!state.detail&&h&&<div className="ep-hearing-tools"><p>下線の発言を選び、矛盾する証拠を提示する。</p><button onClick={()=>{setSelected(null);setPanel('evidence')}}>記録を読み直す</button>{!state.penalties.length&&<button className="ep-accuse" onClick={()=>setPanel('accuse')}>証拠なしで告発する…</button>}</div>}
   </section>}
   <nav className="ep-footer" aria-label="ゲームメニュー"><span>自動保存 {notice?'不可':'ON'}</span><div><button onClick={()=>{setSelected(null);setPanel('evidence')}}>証拠 {state.inventory.length}</button><button onClick={()=>setPanel('history')}>会話履歴</button><button onClick={()=>setPanel('branches')}>分岐</button></div></nav>
  </>}
  {receipt&&<aside className="ep-transaction" role="status"><small>VIRTUE TRANSACTION</small><strong>{receipt.delta>=0?'+':'−'}{String(Math.abs(receipt.delta)).padStart(3,'0')}</strong><span>{receipt.reason}</span><small>BALANCE UPDATED / {receipt.balance}</small></aside>}
  {notice&&<p className="ep-notice" role="alert">{notice}</p>}
  <dialog className="ep-modal" ref={dialog} onCancel={()=>{setPanel(null);setSelected(null)}} onClick={e=>{if(e.target===dialog.current){setPanel(null);setSelected(null)}}}><div className="ep-modal-head"><h2>{{evidence:selected?'証拠を提示':'証拠手帳',history:'会話履歴',branches:'分岐から再開',settings:'音量',menu:'メニュー',accuse:'根拠のない告発'}[panel]}</h2><button aria-label="閉じる" onClick={()=>{setPanel(null);setSelected(null)}}>×</button></div>
   {panel==='evidence'&&<>{selected&&<p className="ep-quote">照合する発言：「{selected}」</p>}{!state.inventory.length&&<p>調査で入手した記録がここに並びます。</p>}<div className="ep-evidence">{state.inventory.map(id=><article key={id}><small>RECORD / {id.toUpperCase()}</small><h3>{evidence[id].title}</h3><p>{evidence[id].text}</p>{selected&&<button className="ep-primary" onClick={()=>{setPanel(null);send({type:'present',id})}}>この証拠を提示 →</button>}</article>)}</div></>}
   {panel==='history'&&<div className="ep-history">{state.history.map((l,i)=><article key={i}><b>{characters[l.who]?.name}</b><p>{l.text}</p></article>)}</div>}
   {panel==='branches'&&<><p>選択直前へ戻ります。徳・証拠・議論の進行もその時点に戻ります。</p><div className="ep-branch-list">{archive?.branches.length?archive.branches.map((b,i)=><button key={i} onClick={()=>restore(b.raw)}>{b.label}<small>徳 {decode(b.raw).score} / {scenario[decode(b.raw).node].episode}話</small></button>):<p>まだ分岐に到達していません。</p>}</div></>}
   {panel==='settings'&&<><label className="ep-volume">BGM <input aria-label="BGM音量" type="range" min="0" max="1" step=".05" value={bgm} onChange={e=>setBgm(Number(e.target.value))}/></label><label className="ep-volume">効果音 <input aria-label="効果音音量" type="range" min="0" max="1" step=".05" value={se} onChange={e=>setSe(Number(e.target.value))}/></label><label><input type="checkbox" checked={mute} onChange={e=>setMute(e.target.checked)}/> ミュート</label><p><button onClick={async()=>{await sound.unlock();if(started)await sound.play(n.scene);sound.effect('bell')}}>音声を再開・確認</button></p><p>新シナリオのボイスは未収録です。既存BGM・効果音でプレイできます。</p><p>Space / Enter：文字送り　Esc：閉じる</p></>}
   {panel==='accuse'&&<><p>根拠を示さず相手の不正を決めつけます。この行為は徳 −3として一度だけ記録されます。</p><button onClick={()=>{setPanel(null);send({type:'accuse'})}}>それでも告発する</button><button onClick={()=>setPanel(null)}>証拠を確かめる</button></>}
   {panel==='menu'&&<><p>現在地は自動保存されています。最初から始めても、保存された分岐は残ります。</p><button onClick={()=>{setPanel(null);setStarted(false);sound.pause()}}>タイトルへ戻る</button><button onClick={onLegacy}>旧版の会話・議論を開く</button></>}
  </dialog>
 </main>
}


