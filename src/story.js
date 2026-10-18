export const people = {
  god: { name: 'かみさま', role: '転生窓口の案内人', image: '/images/adv/god.png' },
  yu: { name: 'ゆう', role: 'まだ知らない、走るということ', image: '/images/adv/yu.png' },
  mahiru: { name: 'まひる', role: 'カフェで出会った少女', image: '/images/adv/mahiru.png' },
  yoru: { name: 'よる', role: '窓際の席の住人', image: '/images/adv/yoru.png' },
  yume: { name: 'ゆめ', role: '来世を最適化する少女', image: '/images/adv/yume.png' },
}
const line = (who, text, extra = {}) => ({ who, text, ...extra })
const answer = (text, delta, reason, reply, flag) => ({ text, delta, reason, reply, flag })
export const story = [
  line('narrator', '僕は死んだ。\nそう理解するより先に、白さが目に入った。', { portrait:'god' }),
  line('narrator', '天井も、壁も、床も白い。靴底は冷たくない。\n温度という概念まで、丁寧に片づけられたような部屋だった。'),
  line('god', 'あら、お目覚めですか？\nお急ぎでなければ、そのままお掛けください。'),
  line('self', '……ここ、病院ですか。'),
  line('god', 'いいえ。次の人生を決めるための待合室です。\n前の人生、なかなか徳を積んでますね。83ポイントあります。', { sfx:'stamp' }),
  line('self', '死んだんですか、僕。'),
  line('god', 'はい。そちらの確認欄に丸をお願いします。'),
  line('self', '確認したくない場合は？'),
  line('god', 'お気持ちの欄もございます。\n……うふふ。すぐに納得なさらなくても大丈夫ですよ。'),
  line('god', '現在のご心境を、お聞かせください。', { choices:[
    answer('まだ、よく分からない。',1,'自己認識の申告','分からない、ですね。記録しました。\n分からないことを、分からないまま出していただいて構いません。','honest'),
    answer('もっと高くないですか？ 心当たりがあります。',2,'評価の確認手続き','異議申立てですね。用紙をどうぞ。\n疑問を持つことと、欲張ることは、必ずしも同じではありません。','question'),
    answer('じゃあ、他の人の分を少しください。',-2,'他者の権利への配慮不足','そちらは承れません。\n隣の整理券を取っても、隣の人生にはなれませんので。','bargain'),
  ]}),
  line('narrator', '手元の数字が、小さな音とともに変わった。\n善い人間になった実感はない。窓口の処理が一つ終わっただけのようだった。'),
  line('god', '表示は当窓口の規定に基づく評価です。\nあなたという人を、すべて説明する数字ではありません。'),
  line('god', '来世の希望票はこちらです。決められない場合は、隣のカフェへ。\n飲み物に徳ポイントはかかりません。'),
  line('self', '急いで決めなくてもいいんですか。'),
  line('god', 'はい。こちらでは、急がないこともできます。'),
  line('narrator', '白い扉を開けると、コーヒーの香りがした。\n死んでも分かる香りがあることに、少し驚いた。', { scene:'cafe', portrait:'mahiru', sfx:'bell' }),
  line('mahiru', 'あ、新しい人。そこ、空いてるよ。\nお砂糖いる？ 私、入れすぎちゃうんだよね。にへら。'),
  line('narrator', '金髪の少女が、角砂糖の皿をこちらへ寄せた。\nその隣で、パーカー姿の少女が、一枚の紙とにらめっこをしている。', { portrait:'yu' }),
  line('yu', '……健康って、項目がいっぱいあるんだね。'),
  line('self', 'いっぱい？'),
  line('yu', '走れることと、長く走れること、別の欄だった。\nそれで、希望を足すと、必要なポイントも増えるみたい。'),
  line('yu', '私、走るのが好きかどうかも知らないのに。'),
  line('narrator', '笑っている。でも、希望票を握る指はほどけない。\nどう答えればいいだろう。', { choices:[
    answer('どこを、走ってみたい？',3,'本人の希望の確認','ゆう「……駅。電車に乗り遅れそうになって、走るの」\n「くだらないでしょ。でも、ずっと見てたんだ。病室の窓から」','station'),
    answer('一番いい身体を選べば、安心じゃない？',-1,'条件の確認を省略','ゆう「うん。でも、一番ってどれだろう」\n彼女の指が、紙の上をまた行ったり来たりする。','best'),
    answer('僕も決められない。隣で一緒に考えていい？',2,'対話への参加','ゆう「うん。……よかった。分からないの、私だけじゃなかった」\n少しだけ空いた机に、僕の希望票が並んだ。','together'),
  ]}),
  line('yu', '前はね、入院してたから。\n外のこと、知ってるつもりで、あんまり知らないの。'),
  line('self', 'だったら、知らないまま決めるのは、難しいよね。'),
  line('mahiru', '……難しいよね。\nあ、ごめん。お菓子、置いておくね。', { sfx:'cup' }),
  line('narrator', 'まひるは自分の希望票を、皿の下へ滑り込ませた。\n聞きかけた言葉が、喉に残る。', { choices:[
    answer('まひるは、どうしてまだここに？',-1,'私的な事情への踏み込み','まひる「んー……まだ、決まらなくて」\n笑顔のまま、彼女は空のカップを集め始めた。','asked'),
    answer('このお菓子、まひるのおすすめ？',2,'相手の会話の余地を尊重','まひる「うん！ こっちはね、甘いのに、もう一個いけちゃう」\n今度の笑顔は、少しだけ肩の力が抜けていた。','space'),
    answer('次はきっと大丈夫だよ。',-1,'根拠のない保証','まひる「……うん。そうだといいな」\n優しい返事だった。僕の言葉が届いたかどうかは、分からなかった。','promise'),
  ]}),
  line('yoru', '初日に全部決めようとすると、お茶が忙しいでしょう。\nここは、冷めるのが少し遅いの。ふふ。'),
  line('narrator', '窓際の女性が、本から顔を上げた。\n向かいの椅子には一冊の本。席を取っているようにも見える。'),
  line('self', '誰か、来るんですか。'),
  line('yoru', 'さあ。来たら、続きを話せるようにしているだけ。\nあなたも、まだ話し終わっていない人がいる？'),
  line('narrator', 'すぐには答えられなかった。\nそれを待たずに、よるは静かにページをめくった。', { sfx:'paper' }),
  line('yume', '悩むなら、先に条件を並べればいい。\n外せないものから。全部を欲しがると、比較できなくなる。'),
  line('narrator', '藍色の髪の少女が、机の紙を指先でまっすぐにした。\n余白にさえ、使い道を見つけそうな目をしている。'),
  line('yu', 'ゆめは、何が外せないの？'),
  line('yume', '……それを決めるために、並べるんだけど。'),
  line('mahiru', 'あれ、それ、最初に戻ってない？'),
  line('yume', '戻ってない。整理してる。'),
  line('narrator', 'ゆうがくすくすと笑った。\nゆめは訂正しようとして、やめた。'),
  line('yume', 'あなたは？ 次の人生で、何を最優先にするの。', { choices:[
    answer('できるだけ、失敗しない人生。',1,'希望条件の具体化','ゆめ「なら、失敗の定義を決めるところからね」\n「……それが一番、面倒なんだけど」','safe'),
    answer('誰かと、こんな話ができること。',2,'関係性への配慮','ゆめ「相手次第の条件は、確約できない」\nそう言ってから、彼女は自分のカップを僕らの机に置いた。','connection'),
    answer('今、一番得になる回答を教えて。',-2,'申告の誠実性に疑義','ゆめ「得だけで選ぶと、欲しかったかどうかを後から忘れるよ」\nそれは助言というより、独り言に聞こえた。','optimize'),
  ]}),
  line('narrator', '僕らは希望票の裏に、小さな候補を書いた。\n駅まで走る。雨の日に傘を買う。明日の約束をする。'),
  line('yu', 'ねえ。ここで決めたことって、生まれたら覚えてるのかな。'),
  line('god', 'ご案内が、まだでしたね。', { scene:'quiet', sfx:'paper' }),
  line('god', '希望票に記入した条件は、手続きに使われます。\nただし、ここで過ごした記憶は、転生の際にすべて消えます。'),
  line('self', '今日、話したことも？'),
  line('god', 'はい。'),
  line('narrator', '誰も、すぐにはカップに触れなかった。\nさっきまで聞こえていた食器の音が、遠くなった気がする。'),
  line('yu', '……じゃあ、この話、覚えてるのは今だけなんだ。'),
  line('yoru', 'だから本を閉じるまで、読んでいてもいいでしょう。'),
  line('yume', 'いつか忘れるなら無駄、とは言ってない。\n……私は、そんなことまでは言ってない。'),
  line('mahiru', 'もう一杯、淹れようか。'),
  line('narrator', '来世のための83ポイント。\nその数字より気になるものが、机の向こうにできていた。'),
  line('yu', 'ねえ。もう少しだけ、一緒に考えてくれる？', { choices:[
    {...answer('希望票に、来世でしてみたいことを書こう。',3,'本人の選択を支援','ゆう「じゃあ、駅まで走る。誰かと待ち合わせするために」\n彼女は初めて、迷わずペンを動かした。','wish'), ending:'wish'},
    {...answer('今は紙を伏せて、もう少し話そう。',1,'対話の継続','ゆう「うん。じゃあ、好きな飲み物の話から」\n僕らは希望票を伏せた。決まらないことが、少しだけ嬉しかった。','stay'), ending:'stay'},
    {...answer('僕は受付へ戻る。また、話せたら嬉しい。',2,'意思の明確な伝達','ゆう「そっか。……うん。行ってらっしゃい」\n引き止めない声が、椅子を離れる僕を追いかけてきた。','leave'), ending:'leave'},
  ]}),
]
export const endings = {
  wish: { title:'まだ知らない駅へ', text:'希望票の余白に、一つだけ願いが増えた。\nどんな人生になるかは、まだ分からない。\nでも、ゆうは今、次の人生の話をしている。', last:'「待ち合わせって、待つほうも楽しそうだね」' },
  stay: { title:'冷めないコーヒー', text:'次の人生は、今日も決まらなかった。\n話すことは、もう一つ増えた。\nカップの向こうで、ゆうが笑っている。', last:'「明日も、ここの席でいい？」' },
  leave: { title:'白い窓口、もう一度', text:'受付に戻ると、かみさまが新しい希望票を差し出した。\n今度は一つ目の欄で、少し長く手が止まる。\nどんな人生を、と聞かれて、誰かの顔を思い出した。', last:'「おかえりなさい。何か、見つかりましたか？」' },
}
export function initialGame(){return {index:0,score:83,reply:null,ending:null,ended:false,flags:[],history:[],actions:[]}}
export function contextAt(index){let scene='reception',portrait='god';for(const node of story.slice(0,index+1)){if(node.scene)scene=node.scene;if(people[node.who])portrait=node.who;if(node.portrait)portrait=node.portrait}return {scene,portrait}}
export function reduceGame(state, action){
  if(state.ended)return state
  const node=story[state.index];let next
  if(action.type==='choose' && node.choices && !state.reply){
    const c=node.choices[action.index];if(!c)return state
    const score=Math.max(0,Math.min(100,state.score+c.delta))
    next={...state,score,reply:{...c,delta:score-state.score},ending:c.ending||null,flags:[...state.flags,c.flag],history:[...state.history,{who:node.who,text:node.text},{who:'self',text:c.text},{who:'system',text:`徳 ${score-state.score>=0?'+':''}${score-state.score} ／ ${c.reason}`},{who:'narrator',text:c.reply}]}
  }else if(action.type==='next'){
    if(node.choices && !state.reply)return state
    if(state.reply) next={...state,reply:null,ended:!!state.ending,index:state.ending?state.index:state.index+1}
    else next={...state,index:state.index+1,history:[...state.history,{who:node.who,text:node.text}]}
  }else return state
  return {...next,actions:[...state.actions,action]}
}
export function decodeSave(raw){
  const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.actions)||data.actions.length>200||typeof data.date!=='string')throw Error('invalid save')
  let state=initialGame();for(const action of data.actions){if(!action||!['next','choose'].includes(action.type)||(action.type==='choose'&&(!Number.isInteger(action.index)||action.index<0||action.index>2)))throw Error('invalid action');const next=reduceGame(state,action);if(next===state)throw Error('invalid sequence');state=next}return {state,date:data.date}
}
