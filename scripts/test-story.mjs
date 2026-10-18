import assert from 'node:assert/strict'
import {initialGame,reduceGame,decodeSave,encodeSave,story,endings,contextAt,currentLine,indexOf} from '../src/story.js'
import * as legacy from '../src/story-v1.js'
const visited=new Set(),seen=new Set();let paths=0,steps=0
function walk(state,depth=0){
  assert.ok(depth<250,'route must terminate')
  const node=story[state.index];assert.ok(node);visited.add(node.id)
  assert.ok(Number.isFinite(state.score)&&state.score>=0)
  assert.ok(currentLine(state).who);assert.equal(typeof currentLine(state).text,'string')
  assert.deepEqual(decodeSave(encodeSave(state)).state,state)
  assert.ok(state.history.every(h=>h.who!=='system'))
  steps++
  if(state.ended){assert.ok(endings[state.ending]);seen.add(state.ending);paths++;assert.equal(reduceGame(state,{type:'next'}),state);return}
  if(node.choices&&!state.reply){
    assert.equal(reduceGame(state,{type:'next'}),state)
    assert.equal(reduceGame(state,{type:'choose',index:99}),state)
    node.choices.forEach((c,index)=>{
      const next=reduceGame(state,{type:'choose',index})
      assert.equal(next.score,Math.max(0,state.score+(c.delta||0)))
      if(c.spoken){assert.equal(currentLine(next).who,'self');assert.equal(currentLine(next).text,c.text)}
      walk(next,depth+1)
    })
  }else walk(reduceGame(state,{type:'next'}),depth+1)
}
walk(initialGame())
assert.equal(seen.size,Object.keys(endings).length)
assert.equal(visited.size,story.length,'all scenes reachable')
for(const n of story){
  assert.ok(contextAt(indexOf(n.id)).scene)
  assert.ok(!n.text.includes('にへら'))
  for(const c of n.choices||[])assert.ok(!c.reply||Array.isArray(c.reply))
}
function route(choices){let s=initialGame();while(!s.ended){const n=story[s.index];s=reduceGame(s,n.choices&&!s.reply?{type:'choose',index:choices[n.id]??0}:{type:'next'})}return s}
const stay=route({b14:1,'receptionStay-7':0})
assert.ok(!stay.flags.includes('cafe'),'staying at reception must not discover cafe')
const yu=route({})
assert.equal(yu.ending,'yu');assert.ok(yu.flags.includes('yumeBalance'))
assert.ok(yu.history.some(h=>h.who==='self'&&h.text.includes('それは次の人生')))
assert.ok(yu.history.some(h=>h.who==='yume'&&h.text==='一万くらい。'))
// Every old save position and old ending remains loadable, including mid-response.
let old=legacy.initialGame()
for(let i=0;i<100&&!old.ended;i++){
  const raw=JSON.stringify({version:1,date:'2026-10-18T00:00:00.000Z',actions:old.actions})
  const migrated=decodeSave(raw).state
  assert.equal(migrated.score,old.score)
  assert.deepEqual(decodeSave(encodeSave(migrated)).state,migrated)
  assert.ok(currentLine(migrated).text)
  const n=legacy.story[old.index]
  old=legacy.reduceGame(old,n.choices&&!old.reply?{type:'choose',index:0}:{type:'next'})
}
assert.equal(story[decodeSave(JSON.stringify({version:1,date:'2026-10-18',actions:old.actions})).state.index].id,'cafeHub')
for(const bad of ['null','{}',JSON.stringify({version:2,date:'2026-10-18',actions:[{type:'choose',index:0}]}),JSON.stringify({version:2,date:'bad',actions:[]})])assert.throws(()=>decodeSave(bad))
console.log(`PASS: ${paths} routes, ${visited.size} scenes, ${steps} save round-trips, ${seen.size} endings, speaker attribution and legacy migration.`)
