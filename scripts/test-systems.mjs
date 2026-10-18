import assert from 'node:assert/strict'
import {Sound} from '../src/sound.js'
import {checkpoint,readArchive,latestSave} from '../src/checkpoints.js'
import {initialGame,reduceGame,story,decodeSave} from '../src/story.js'
const audios=[]
globalThis.Audio=class{constructor(){this.paused=true;audios.push(this)}play(){return new Promise((resolve,reject)=>{this.finish=()=>{this.paused=false;resolve()};this.fail=reject})}pause(){this.paused=true}}
const sound=new Sound();sound.enabled=true
const first=sound.play('cafe');await sound.play('cafe');assert.equal(audios.length,1)
const second=sound.play('quiet');audios[1].finish();await second;audios[0].finish();await first
assert.equal(audios.filter(a=>!a.paused).length,1);assert.equal(sound.active.size,1)
const third=sound.play('reception');sound.pause();audios[2].finish();await third
assert.ok(audios.every(a=>a.paused));assert.equal(sound.active.size,0)
const failed=sound.play('cafe');audios[3].fail(Error('blocked'));await failed;assert.equal(sound.current,null)
const retry=sound.play('cafe');audios[4].finish();await retry;sound.settings(.2,.4,true);assert.equal(audios[4].muted,true);assert.equal(audios[4].volume,.2);sound.pause()
const store=new Map(),storage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)}
let state=initialGame();while(!story[state.index].choices)state=reduceGame(state,{type:'next'})
checkpoint(state,storage);checkpoint(state,storage);assert.equal(readArchive(storage).branches.length,1)
const selected=reduceGame(state,{type:'choose',index:0});checkpoint(selected,storage)
assert.deepEqual(latestSave(null,storage).state,selected)
const restored=decodeSave(readArchive(storage).branches[0].raw).state
assert.deepEqual(restored,state);assert.equal(reduceGame(restored,{type:'choose',index:0}).score,selected.score)
let other=reduceGame(restored,{type:'choose',index:1});while(!story[other.index].choices||other.reply)other=reduceGame(other,{type:'next'})
checkpoint(other,storage);assert.equal(readArchive(storage).branches.length,2)
assert.deepEqual(readArchive({getItem:()=>'{broken'}).branches,[])
assert.throws(()=>checkpoint(state,{getItem:()=>null,setItem:()=>{throw Error('quota')}}))
console.log('PASS: pending playback deduplication, scene race, pause race, rejection/retry, settings; branch persistence, restore score, deduplication, alternate paths, corrupt/quota handling')
