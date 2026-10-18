import assert from 'node:assert/strict'
import {initialGame,reduceGame,decodeSave,story,endings,contextAt} from '../src/story.js'
const choiceCount=story.filter(n=>n.choices).length
const seen=new Set()
for(let route=0;route<3**choiceCount;route++){
 let s=initialGame(),digits=route,safety=0
 while(!s.ended){
  assert.ok(++safety<150);assert.ok(story[s.index]);assert.ok(s.score>=0&&s.score<=100)
  const n=story[s.index]
  if(n.choices&&!s.reply){assert.equal(reduceGame(s,{type:'next'}),s);let i=digits%3;digits=Math.floor(digits/3);s=reduceGame(s,{type:'choose',index:i});assert.equal(reduceGame(s,{type:'choose',index:i}),s)}
  else s=reduceGame(s,{type:'next'})
  const saved=JSON.stringify({version:1,date:'2026-10-18T00:00:00.000Z',actions:s.actions})
  assert.deepEqual(decodeSave(saved).state,s)
 }
 assert.equal(s.score,Math.max(0,Math.min(100,83+s.actions.filter(a=>a.type==='choose').reduce((sum,a,i)=>sum+story.filter(n=>n.choices)[i].choices[a.index].delta,0))));assert.ok(s.history.every(h=>h.who!=='system'));assert.ok(endings[s.ending]);seen.add(s.ending);assert.equal(s.flags.length,choiceCount);assert.equal(reduceGame(s,{type:'next'}),s)
}
assert.equal(seen.size,3)
for(const bad of ['{}','null','{"version":1,"date":"x","actions":[{"type":"choose","index":0}]}','{"version":1,"date":"x","actions":[{"type":"next"},{"type":"choose","index":99}]}'])assert.throws(()=>decodeSave(bad))
assert.equal(contextAt(0).portrait,'god');assert.equal(contextAt(15).scene,'cafe')
console.log(`PASS: ${3**choiceCount} routes, save/load at each step, all 3 endings, double-choice guard, score bounds, invalid saves.`)
