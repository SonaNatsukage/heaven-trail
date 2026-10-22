import {scenario,hearings,evidence,leads,scenarioVersion} from '../scenarios/heaven.js'
export const SAVE_KEY='heaven-episodes-01-v1'
export function initial(){return {node:'wake',score:83,inventory:[],visited:[],flags:[],solved:[],penalties:[],history:[],actions:[],detail:null,transaction:null}}
export const nodeOf=s=>scenario[s.node]
function detail(s,who,text){return {...s,detail:{who,text}}}
export function reduce(s,a){
 const n=nodeOf(s);if(!a||a.at!==s.node||!n||n.ending)return s
 let out=s
 if(a.type==='dismiss'&&s.detail)out={...s,detail:null}
 else if(s.detail)return s
 else if(a.type==='next'&&n.next&&!n.choices&&!n.investigation&&!n.hearing)out={...s,node:n.next}
 else if(a.type==='choose'&&n.choices&&Number.isInteger(a.index)&&n.choices[a.index]){
  const c=n.choices[a.index]
  out=c.wrong?detail(s,'self',c.wrong):{...s,node:c.next,score:s.score+c.delta,flags:c.flag?[...s.flags,c.flag]:s.flags,transaction:c.delta?{delta:c.delta,reason:c.reason,balance:s.score+c.delta}:s.transaction}
 }else if(a.type==='investigate'&&n.investigation){
  const lead=leads.find(l=>l.id===a.id)
  if(!lead||s.visited.includes(lead.id))return s
  out={...detail(s,lead.who,lead.text),visited:[...s.visited,lead.id],inventory:[...new Set([...s.inventory,...lead.evidence])]}
 }else if(a.type==='debate'&&n.investigation&&Object.keys(evidence).every(id=>s.inventory.includes(id)))out={...s,node:n.next}
 else if(a.type==='present'&&n.hearing&&s.inventory.includes(a.id)){
  const h=hearings[n.hearing]
  out=a.id===h.evidence?{...s,node:h.next,solved:[...s.solved,n.hearing],detail:{who:'self',text:h.success,success:true}}:detail(s,h.who,`その記録では「${h.term}」を否定できない。${h.hint}`)
 }else if(a.type==='accuse'&&n.hearing&&!s.penalties.includes('accuse'))out={...detail(s,'god','根拠のない告発として記録します。疑いと事実を分け、証拠を確認してください。'),score:s.score-3,penalties:[...s.penalties,'accuse'],transaction:{delta:-3,reason:'根拠のない告発',balance:s.score-3}}
 if(out===s)return s
 const record=out.detail||{who:n.who,text:n.choices&&a.type==='choose'?n.choices[a.index].text:n.text}
 return {...out,history:a.type==='dismiss'?s.history:[...s.history,record],actions:[...s.actions,a]}
}
export function encode(s){return JSON.stringify({version:scenarioVersion,actions:s.actions})}
export function decode(raw){const d=JSON.parse(raw);if(d?.version!==scenarioVersion||!Array.isArray(d.actions)||d.actions.length>5000)throw Error('Invalid save');let s=initial();for(const a of d.actions){const next=reduce(s,a);if(next===s)throw Error('Invalid action');s=next}return s}
export function read(storage){try{const a=JSON.parse(storage.getItem(SAVE_KEY));if(!a||typeof a.latest!=='string')return null;decode(a.latest);return {...a,branches:(Array.isArray(a.branches)?a.branches:[]).filter(b=>{try{const s=decode(b.raw);return typeof b.label==='string'&&(nodeOf(s).choices||nodeOf(s).hearing)&&!s.detail}catch{return false}}).slice(0,100)}}catch{return null}}
export function checkpoint(s,storage){const a=read(storage),raw=encode(s);let branches=a?.branches||[];const n=nodeOf(s);if(!s.detail&&(n.choices||n.hearing)){const label=n.hearing?hearings[n.hearing].title:n.text;branches=[{label,raw},...branches.filter(b=>b.raw!==raw)].slice(0,100)}const archive={latest:raw,branches};storage.setItem(SAVE_KEY,JSON.stringify(archive));return archive}
