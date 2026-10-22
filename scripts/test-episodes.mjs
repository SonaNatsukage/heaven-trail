import assert from 'node:assert/strict'
import {scenario,hearings,evidence} from '../src/scenarios/heaven.js'
import {initial,reduce,encode,decode,checkpoint,read,SAVE_KEY} from '../src/engine/episodes.js'
let count=0,endings=0
const act=(s,a)=>reduce(s,{...a,at:s.node})
for(const n of Object.values(scenario)){
 for(const next of [n.next,...(n.choices||[]).map(c=>c.next),n.hearing&&hearings[n.hearing].next].filter(Boolean))assert.ok(scenario[next],`${n.id} -> ${next}`)
 if(n.hearing)assert.ok(evidence[hearings[n.hearing].evidence])
}
function run({arrival,tutorial,wish,daily,privacy,resolution,order,accuse}){
 let s=initial(),iterations=0
 while(!scenario[s.node].ending){
  assert.ok(++iterations<400)
  const n=scenario[s.node];let a
  if(s.detail)a={type:'dismiss'}
  else if(n.investigation){assert.equal(act(s,{type:'debate'}),s);for(const id of order){s=act(s,{type:'investigate',id});assert.ok(s.detail);s=act(s,{type:'dismiss'});assert.equal(act(s,{type:'investigate',id}),s)}a={type:'debate'}}
  else if(n.hearing){
   if(accuse&&!s.penalties.length){const before=s.score;s=act(s,{type:'accuse'});assert.equal(s.score,before-3);s=act(s,{type:'dismiss'});assert.equal(act(s,{type:'accuse'}),s)}
   const wrong=Object.keys(evidence).find(id=>id!==hearings[n.hearing].evidence),before=s.score
   s=act(s,{type:'present',id:wrong});assert.ok(s.detail);assert.equal(s.score,before);s=act(s,{type:'dismiss'});a={type:'present',id:hearings[n.hearing].evidence}
  }else if(n.choices){
   for(let index=0;index<n.choices.length;index++)if(n.choices[index].wrong){const wrong=act(s,{type:'choose',index});assert.equal(wrong.node,s.node);assert.equal(wrong.score,s.score);assert.ok(wrong.detail)}
   a={type:'choose',index:({arrival,tutorial,wish,daily,privacy,resolution,calculate:1,interpret:0})[n.id]}
  }else a={type:'next'}
  const before=s;s=act(s,a);assert.notEqual(s,before);assert.deepEqual(decode(encode(s)),s);if(s.node!==before.node)assert.equal(reduce(s,{...a,at:before.node}),s);count++
 }
 assert.equal(s.score,83+(tutorial?1:-2)+(privacy?-8:0)+5-(accuse?3:0));assert.equal(s.solved.length,4);assert.equal(s.inventory.length,6);endings++
 return s
}
const orders=[['yu','yume','terminal'],['yu','terminal','yume'],['yume','yu','terminal'],['yume','terminal','yu'],['terminal','yu','yume'],['terminal','yume','yu']]
for(let arrival=0;arrival<3;arrival++)for(let tutorial=0;tutorial<2;tutorial++)for(let wish=0;wish<2;wish++)for(let daily=0;daily<2;daily++)for(let privacy=0;privacy<2;privacy++)for(let resolution=0;resolution<2;resolution++)for(const order of orders)for(const accuse of [false,true])run({arrival,tutorial,wish,daily,privacy,resolution,order,accuse})
const mem={data:new Map(),getItem(k){return this.data.get(k)},setItem(k,v){this.data.set(k,v)}}
let s=initial();while(s.node!=='arrival')s=act(s,{type:'next'});checkpoint(s,mem);const raw=read(mem).branches[0].raw;s=act(s,{type:'choose',index:0});checkpoint(s,mem);assert.deepEqual(decode(raw).score,83);assert.ok(read(mem).branches.length);assert.throws(()=>decode('{"version":99,"actions":[]}'));assert.throws(()=>decode('{"version":1,"actions":[{"type":"choose","at":"wake","index":0}]}'));mem.setItem(SAVE_KEY,'broken');assert.equal(read(mem),null);assert.throws(()=>checkpoint(initial(),{getItem(){return null},setItem(){throw Error('quota')}}))
console.log(`PASS ${endings} complete routes; ${count} transitions/save roundtrips; all investigation orders, mistakes, one-time penalties, stale clicks and branch restoration`)

