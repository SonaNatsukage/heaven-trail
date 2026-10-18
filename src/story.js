import {people as oldPeople, story as oldStory, contextAt as oldContext, decodeSave as decodeLegacy} from './story-v1.js'
import {chapters, routeEndings} from './chapters.js'
export const people = {...oldPeople, yu:{...oldPeople.yu,image:'/images/adv/yu-seated-v2.png'}}
export const names = {self:'僕',narrator:'地の文',...Object.fromEntries(Object.entries(people).map(([id,p])=>[id,p.name]))}
const say = (who,text) => ({who,text})
const answer = (text,delta,reason,reply,flag) => ({text,delta,reason,reply,flag,spoken:true})
const base = structuredClone(oldStory).map((n,i)=>({...n,id:`b${i}`,...oldContext(i)}))
base[8].text='お気持ちの欄もございます。\n……あら。隣の席に、誰かの番号札が残っていますね。'
base[9].text='あなたの番号より前ですね。持ち主が戻るかもしれません。\nどうしましょうか。'
base[9].choices=[
  answer('落とし物として預かってください。持ち主の順番を残せますか。',2,'他者の順番を守る',[say('god','はい。あなたの札とは別にお預かりします。\n持ち主が戻ったら、その方の順番として扱います。')],'honest'),
  answer('戻るまで待ってみます。急いでいないので。',1,'他者を待つ選択',[say('god','では、持ち主をお呼びしている間、お話ししましょう。\nあなたの順番も失われませんよ。')],'question'),
  answer('誰もいないなら、その札で先に進めませんか。',-2,'他者の順番の横取り',[say('god','持ち主が見当たらないことと、あなたのものになることは別です。\nその札はこちらでお預かりしますね。')],'bargain'),
]
base[10].text='かみさまは番号札を小さな箱に収め、帳面に何か書き足した。\n僕の返事も、ここの記録の一部になるらしい。'
base[11].text='ここでの行いも、徳の記録に含まれます。\nただ、その数字だけであなたのすべてが分かるわけではありません。'
base[14].choices=[{text:'隣のカフェへ行く。',target:'b15',delta:0},{text:'受付に残り、かみさまと話す。',target:'receptionStay',delta:0}]
base[15].flag='cafe'
base[16].text='あ、新しい人。そこ、空いてるよ。私はまひる。\nお砂糖いる？ 私、入れすぎちゃうんだよね。'
base[17].text='まひるが、角砂糖の皿をこちらへ寄せた。\nその隣で、パーカー姿の少女が座ったまま、一枚の紙とにらめっこをしている。'
base[18].text='私はゆう。……ねえ、健康って、項目がいっぱいあるんだね。'
const responses={
  22:[
    [say('yu','……駅。電車に乗り遅れそうになって、走るの。\nくだらないでしょ。でも、ずっと見てたんだ。病室の窓から。')],
    [say('yu','うん。でも、一番ってどれだろう。'),say('narrator','彼女の指が、紙の上をまた行ったり来たりする。')],
    [say('yu','うん。……よかった。分からないの、私だけじゃなかった。'),say('narrator','少しだけ空いた机に、僕の希望票が並んだ。')],
  ],
  26:[
    [say('mahiru','……まだ、書いてる途中だから。'),say('narrator','まひるは紙の上に皿を置き直した。僕は身を引いた。')],
    [say('mahiru','うん！ こっちはね、甘いのに、もう一個いけちゃう。'),say('narrator','今度の笑顔は、少しだけ肩の力が抜けていた。')],
    [say('mahiru','あ、ありがとう。じゃあ、その二つをお願い。'),say('narrator','空のカップを受け取った。彼女がしまった紙には触れなかった。')],
  ],
  39:[
    [say('yume','なら、失敗の定義を決めるところからね。\n……それが一番、面倒なんだけど。')],
    [say('yume','相手次第の条件は、確約できない。'),say('narrator','そう言ってから、彼女は自分のカップを僕らの机に置いた。')],
    [say('yume','得だけで選ぶと、欲しかったかどうかを後から忘れるよ。'),say('narrator','それは助言というより、独り言に聞こえた。')],
  ],
}
for(const [index,replies] of Object.entries(responses))base[index].choices.forEach((c,i)=>{c.reply=replies[i];c.spoken=true})
base[26].choices[0].text='その希望票、僕にも見せてもらえる？'
base[26].choices[0].reason='伏せた私的な書類への踏み込み'
base[26].choices[2]={...base[26].choices[2],text:'カップを運ぶの、手伝ってもいい？',delta:1,reason:'負担を分け合う',flag:'help'}
base[27].text='よるです。初日に全部決めようとすると、お茶が忙しいでしょう。\nここは、冷めるのが少し遅いの。'
base[32].text='ゆめ。私の名前。\n悩むなら、先に条件を並べればいい。外せないものから。'
base[43].flag='memory'
base[51].text='来世の条件より先に、気になることができていた。\nこの人たちは、何を願って、ここに残っているんだろう。'
base[52].choices=[
  {text:'うん。走れる身体のこと、一緒に考えよう。',spoken:true,delta:0,target:'yuRoute'},
  {text:'もう少しカフェにいるよ。他の人の話も聞いてみたい。',spoken:true,delta:0,target:'cafeHub'},
  {text:'僕は受付へ戻る。また、話せたら嬉しい。',spoken:true,delta:0,target:'godReturn'},
]
export const story=[...base]
for(const [chapter,nodes] of Object.entries(chapters)){
  let scene=chapter.startsWith('god')||chapter==='receptionStay'?'reception':'cafe'
  let portrait=scene==='reception'?'god':chapter.startsWith('mahiru')?'mahiru':chapter.startsWith('yoru')?'yoru':chapter.startsWith('yume')?'yume':'yu'
  nodes.forEach((n,i)=>{
    scene=n.scene||scene;portrait=people[n.who]?n.who:portrait
    story.push({...n,id:i?`${chapter}-${i}`:chapter,scene,portrait,chapter:chapter==='receptionStay'?0:1})
  })
}
export const endings=routeEndings
const positions=new Map(story.map((n,i)=>[n.id,i]))
export function indexOf(id){const i=positions.get(id);if(i===undefined)throw Error(`Unknown story node: ${id}`);return i}
export function contextAt(index){const n=story[index];return {scene:n.scene,portrait:n.portrait}}
function mark(state,node){return {...state,flags:node.flag?[...new Set([...state.flags,node.flag])]:state.flags,visited:[...new Set([...state.visited,node.id])]}}
export function initialGame(){return {index:0,score:83,reply:null,replyIndex:0,ending:null,ended:false,flags:[],visited:['b0'],history:[],actions:[],origin:null}}
export function currentLine(state){return state.reply?state.reply.lines[state.replyIndex]:story[state.index]}
export function reduceGame(state,action){
  if(state.ended||!action)return state
  const node=story[state.index];let next
  if(action.type==='choose'&&node.choices&&!state.reply){
    if(!Number.isInteger(action.index))return state
    const c=node.choices[action.index];if(!c)return state
    const lines=[...(c.spoken?[say('self',c.text)]:[]),...(c.reply||[])]
    const score=Math.max(0,state.score+(c.delta||0))
    next={...state,score,flags:c.flag?[...new Set([...state.flags,c.flag])]:state.flags,history:[...state.history,say(node.who,node.text)]}
    if(lines.length)next={...next,reply:{lines,target:c.target},replyIndex:0}
    else {const index=c.target?indexOf(c.target):state.index+1;next=mark({...next,index},story[index])}
  }else if(action.type==='next'){
    if(node.choices&&!state.reply)return state
    const line=currentLine(state)
    next={...state,history:[...state.history,say(line.who,line.text)]}
    if(state.reply&&state.replyIndex+1<state.reply.lines.length)next.replyIndex++
    else if(!state.reply&&node.ending)next={...next,ending:node.ending,ended:true}
    else {
      const target=state.reply?.target||node.next
      const index=target?indexOf(target):state.index+1
      if(!story[index])throw Error('Missing route ending')
      next=mark({...next,index,reply:null,replyIndex:0},story[index])
    }
  }else return state
  return {...next,actions:[...state.actions,action]}
}
// 旧版の履歴を旧エンジンで検証し、対応する場面から再開する。
function migrate(data){
  const old=decodeLegacy(JSON.stringify(data)).state
  const s=initialGame()
  s.index=old.ended?indexOf('cafeHub'):old.index
  s.score=old.score;s.flags=[...old.flags]
  if(old.index>=15)s.flags.push('cafe')
  if(old.index>=43)s.flags.push('memory')
  s.visited=base.slice(0,old.index+1).map(n=>n.id)
  s.history=old.history.filter(h=>h.who!=='system').flatMap(h=>{
    const nodeIndex=oldStory.findIndex(n=>n.who===h.who&&n.text===h.text)
    if(nodeIndex>=0)return [say(base[nodeIndex].who,base[nodeIndex].text)]
    for(let i=0;i<oldStory.length;i++){
      const c=oldStory[i].choices?.findIndex(c=>c.reply===h.text)??-1
      if(c>=0)return base[i].choices[c].reply||[say('self',base[i].choices[c].text)]
    }
    return [h]
  })
  if(old.reply&&!old.ended){const c=base[old.index].choices[data.actions.filter(a=>a.type==='choose').at(-1).index];s.reply={lines:c.reply?.length?c.reply:[say('self',c.text)],target:c.target}}
  s.origin=data;return s
}
export function encodeSave(state,date=new Date().toISOString()){return JSON.stringify({version:2,date,origin:state.origin,actions:state.actions})}
export function decodeSave(raw){
  const data=JSON.parse(raw)
  if(!data||typeof data.date!=='string'||!Number.isFinite(Date.parse(data.date)))throw Error('invalid save')
  if(data.version===1)return {state:migrate(data),date:data.date,migrated:true}
  if(data.version!==2||!Array.isArray(data.actions)||data.actions.length>2000)throw Error('invalid save')
  let state=data.origin?migrate(data.origin):initialGame()
  for(const a of data.actions){
    if(!a||!['next','choose'].includes(a.type))throw Error('invalid action')
    const next=reduceGame(state,a);if(next===state)throw Error('invalid sequence');state=next
  }
  return {state,date:data.date}
}
