import {trialNodes,hearings,evidence} from './trial-data.js'
const positions=new Map(trialNodes.map((n,i)=>[n.id,i]))
export const trialNode=s=>trialNodes[positions.get(s.node)]
export const trialLine=s=>s.detail||trialNode(s)
export function initialTrial(entry={score:83,cafe:false}){
 if(!Number.isInteger(entry.score)||entry.score<0||entry.score>1000000||typeof entry.cafe!=='boolean')throw Error('Invalid entry')
 return {entry:{score:entry.score,cafe:entry.cafe},score:entry.score,node:'intro',asked:[],matched:[],solved:[],detail:null,history:[],actions:[],ending:null}
}
function jump(s,id){return {...s,node:id,detail:null}}
function advance(s){let i=positions.get(s.node)+1;while(trialNodes[i]?.onlyCafe&&!s.entry.cafe||trialNodes[i]?.onlyReception&&s.entry.cafe)i++;if(!trialNodes[i])throw Error('Missing trial node');return jump(s,trialNodes[i].id)}
export function reduceTrial(s,a){
 if(!a||s.ending)return s
 const n=trialNode(s),h=hearings[n.hearing];let out=s
 if(a.type==='back'&&s.detail)out={...s,detail:null}
 else if(s.detail)return s
 else if(a.type==='next'&&!h&&!n.choices){
  out={...s,history:[...s.history,{who:n.who,text:n.text}]}
  out=n.ending?{...out,ending:n.ending}:n.next?jump(out,n.next):advance(out)
 }else if(a.type==='ask'&&h){
  out={...s,asked:[...new Set([...s.asked,n.id])],detail:h.ask,history:[...s.history,{who:h.ask.who,text:h.ask.text}]}
 }else if(a.type==='evidence'&&h&&evidence.some(e=>e.id===a.id)){
  const correct=s.asked.includes(n.id)&&a.id===h.evidence
  out={...s,matched:correct?[...new Set([...s.matched,n.id])]:s.matched,detail:{who:'narrator',text:!s.asked.includes(n.id)?'まず、当時の言葉を詳しく聞こう。':correct?h.note:'この資料だけでは、その言葉の意味は決まらない。別の記録と照らしてみよう。'}}
 }else if(a.type==='interpret'&&h&&Number.isInteger(a.index)&&h.options[a.index]){
  if(!s.asked.includes(n.id)||!s.matched.includes(n.id))out={...s,detail:{who:'narrator',text:'証言を聞き、根拠になる記録を示してから考えよう。'}}
  else if(a.index!==h.correct)out={...s,detail:{who:'narrator',text:'そこまでは確かめられていない。本人の言葉と、記録が保証する範囲を分けて考えよう。'}}
  else out=jump({...s,solved:[...s.solved,n.id],history:[...s.history,{who:'self',text:h.options[a.index]}]},h.next)
 }else if(a.type==='choose'&&n.choices&&Number.isInteger(a.index)&&n.choices[a.index]){
  const c=n.choices[a.index];out=jump({...s,score:Math.max(0,s.score+c.delta),history:[...s.history,{who:'self',text:c.text}]},c.target)
 }
 return out===s?s:{...out,actions:[...s.actions,a]}
}
export function encodeTrial(s){return JSON.stringify({version:1,entry:s.entry,actions:s.actions})}
export function decodeTrial(raw){const d=JSON.parse(raw);if(d?.version!==1||!Array.isArray(d.actions)||d.actions.length>3000)throw Error('Invalid trial save');let s=initialTrial(d.entry);for(const a of d.actions){const next=reduceTrial(s,a);if(next===s)throw Error('Invalid action');s=next}return s}
export const TRIAL_SLOT='heaven-trial-v1'
function branchKey(s){return JSON.stringify([s.entry,s.node,s.score])}
export function readTrial(storage=localStorage){try{const d=JSON.parse(storage.getItem(TRIAL_SLOT));if(d?.version!==1)return null;decodeTrial(d.latest);const seen=new Set();return {...d,branches:(d.branches||[]).filter(b=>{try{const s=decodeTrial(b.raw),key=branchKey(s);if(typeof b.label!=='string'||seen.has(key))return false;if(trialNode(s).hearing&&s.asked.includes(s.node))return false;seen.add(key);return true}catch{return false}}).slice(0,40)}}catch{return null}}
export function saveTrial(s,storage=localStorage){const old=readTrial(storage),raw=encodeTrial(s),n=trialNode(s);let branches=old?.branches||[];if(!s.detail&&!s.ending&&((n.hearing&&!s.asked.includes(n.id))||n.choices)){const label=n.hearing?hearings[n.hearing].title:n.id==='decision'?'処理方針':'最後の証言';branches=[{label,raw},...branches.filter(b=>branchKey(decodeTrial(b.raw))!==branchKey(s))].slice(0,40)}const data={version:1,latest:raw,branches};storage.setItem(TRIAL_SLOT,JSON.stringify(data));return data}
