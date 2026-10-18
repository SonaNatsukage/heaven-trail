import assert from 'node:assert/strict'
import {initialTrial,reduceTrial,trialNode,encodeTrial,decodeTrial,saveTrial,readTrial} from '../src/trial-engine.js'
import {hearings,trialNodes,voicedLines} from '../src/trial-data.js'
import {VoicePlayer} from '../src/voice.js'
let count=0
for(const cafe of [false,true])for(const conduct of [0,1])for(const verdict of [0,1,2]){
 let s=initialTrial({score:89,cafe}),guard=0
 const store=new Map(),storage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)}
 while(!s.ending){
  assert.ok(guard++<150);assert.deepEqual(decodeTrial(encodeTrial(s)),s)
  saveTrial(s,storage);const n=trialNode(s),h=hearings[n.hearing]
  if(h){
   const before=s.score
   const premature=reduceTrial(s,{type:'interpret',index:h.correct});assert.equal(premature.node,s.node)
   s=reduceTrial(s,{type:'ask'});s=reduceTrial(s,{type:'back'})
   s=reduceTrial(s,{type:'evidence',id:h.evidence==='original'?'revised':'original'});assert.equal(s.matched.includes(n.id),false);s=reduceTrial(s,{type:'back'})
   s=reduceTrial(s,{type:'evidence',id:h.evidence});s=reduceTrial(s,{type:'back'})
   const wrong=reduceTrial(s,{type:'interpret',index:(h.correct+1)%3});assert.equal(wrong.node,s.node);assert.equal(wrong.score,before)
   s=reduceTrial(s,{type:'interpret',index:h.correct})
  }else s=reduceTrial(s,n.choices?{type:'choose',index:n.id==='conduct'?conduct:verdict}:{type:'next'})
 }
 assert.equal(s.score,89+(conduct===0?1:-1));assert.equal(s.solved.length,3)
 assert.deepEqual(decodeTrial(encodeTrial(s)),s)
 assert.equal(s.history.some(h=>h.text.includes('昨日は、走りたい')),cafe)
 const branch=readTrial(storage).branches.find(b=>b.label==='最後の証言');assert.ok(branch)
 assert.equal(decodeTrial(branch.raw).score,89)
 assert.equal(reduceTrial(s,{type:'next'}),s);count++
}
for(const bad of ['{}','null',JSON.stringify({version:1,entry:{score:83,cafe:false},actions:[{type:'choose',index:0}]})])assert.throws(()=>decodeTrial(bad))
assert.equal(new Set(trialNodes.map(n=>n.id)).size,trialNodes.length)
assert.equal(new Set(voicedLines.map(n=>n.id)).size,voicedLines.length)
const audios=[];globalThis.Audio=class{constructor(){audios.push(this);this.paused=true}play(){return new Promise((resolve,reject)=>{this.finish=()=>{this.paused=false;resolve()};this.fail=reject})}pause(){this.paused=true}}
const music={enabled:true,duck(v){this.ducked=v}},voice=new VoicePlayer(music)
const a=voice.play('/a'),b=voice.play('/b');audios[1].finish();await b;audios[0].finish();await a
assert.equal(audios[0].paused,true);assert.equal(music.ducked,true)
voice.stop();assert.ok(audios.every(a=>a.paused));assert.equal(music.ducked,false)
const c=voice.play('/c');voice.stop();audios[2].finish();await c;assert.equal(audios[2].paused,true)
const d=voice.play('/d');audios[3].fail(Error('blocked'));await d;assert.equal(music.ducked,false)
voice.settings(.5,true);assert.equal(await voice.play('/muted'),false)
console.log(`PASS: ${count} chapter paths, incorrect evidence/interpretation, save replay, branch score restore, entry continuity, voice races and ducking`)
