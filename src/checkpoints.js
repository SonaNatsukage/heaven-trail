import {story,encodeSave,decodeSave} from './story.js'
const KEY='heaven-branches-v1'
export function readArchive(storage=localStorage){
 try{const data=JSON.parse(storage.getItem(KEY));if(data?.version!==1)return {version:1,branches:[],latest:null};return {version:1,latest:valid(data.latest)?data.latest:null,branches:(Array.isArray(data.branches)?data.branches:[]).filter(e=>e&&typeof e.label==='string'&&typeof e.key==='string'&&valid(e.raw)).slice(0,100)}}catch{return {version:1,branches:[],latest:null}}
}
function valid(raw){try{decodeSave(raw);return true}catch{return false}}
export function checkpoint(state,storage=localStorage){
 const archive=readArchive(storage),raw=encodeSave(state),node=story[state.index]
 archive.latest=raw
 if(node.choices&&!state.reply&&!state.ended){
  const key=JSON.stringify([state.origin,state.actions])
  archive.branches=[{key,label:node.choices.map(c=>c.text).join(' ／ '),raw},...archive.branches.filter(e=>e.key!==key)].slice(0,100)
 }
 storage.setItem(KEY,JSON.stringify(archive));for(const listener of listeners)listener();return archive
}
export function latestSave(manual,storage=localStorage){const raw=readArchive(storage).latest;const auto=raw?decodeSave(raw):null;return auto&&(!manual||Date.parse(auto.date)>=Date.parse(manual.date))?auto:manual}

const listeners=new Set()
let cachedRaw, cachedArchive
export function archiveSnapshot(){let raw;try{raw=localStorage.getItem(KEY)}catch{raw=null}if(!cachedArchive||raw!==cachedRaw){cachedRaw=raw;cachedArchive=readArchive()}return cachedArchive}
export function subscribeArchive(listener){listeners.add(listener);const changed=e=>{if(e.key===KEY||e.key===null)listener()};window.addEventListener('storage',changed);return()=>{listeners.delete(listener);window.removeEventListener('storage',changed)}}
