export const evidence = [
  { round: 0, title: '礼拝堂の入退室記録', text: '21:00 ミオ入室、21:10 退室。管理人は21:15に鍵の保管を確認。消失の発覚は21:30。' },
  { round: 0, title: '救済の鍵', text: '地下の避難室を開く銀の鍵。礼拝堂の保管箱にあり、無断の持ち出しは禁止されている。' },
  { round: 1, title: '破れたメモ', text: '「地下から泣き声がする。管理人を呼んでも返事がない。待っていられない」――ミオの筆跡。' },
  { round: 2, title: '非常扉の記録', text: '21:20 ミオが非常扉から再入室。21:23 避難室が解錠され、閉じ込められた子どもが救出された。' },
]
export const rounds = [
  { title: '時間の矛盾', speaker: '管理人', statement: '最後に礼拝堂にいたのはミオだ。鍵を盗んだのは、あの子しかいない。', context: 'ゆめ「資料をご覧ください。疑いと事実は、同じではありません。」', choices: [
    { kind: '反論・証拠提示', label: '退室後の21:15には、まだ鍵があった。', delta: 12, proof: true, reply: 'その通り。退室時刻だけを根拠に、犯人とは断定できません。', reason: '記録の矛盾を示し、根拠のない断定を止めた。' },
    { kind: '共感', label: 'ミオは優しい子だ。盗むはずがない。', delta: 3, reply: '誰かを信じる心は尊い。でも、気持ちだけでは疑いを晴らせません。', reason: '思いやりは示したが、反証は示せなかった。' },
    { kind: '追及', label: '最後にいたなら犯人だ。認めさせよう。', delta: -15, reply: '疑いだけで罪を決めるのですか。記録を確かめる余地が残っています。', reason: '証拠を確認せず、一方的に罪を決めつけた。' },
  ] },
  { title: '沈黙の理由', speaker: 'ミオ', statement: '……鍵のことは話せない。約束したから。', context: 'ミオが書いた破れたメモが届けられた。彼女は震えている。', choices: [
    { kind: '対話', label: '誰かを守っているの？ 話せることから教えて。', delta: 10, reply: 'ミオ「地下に子どもがいたの。誰にも迷惑をかけたくないって、泣いていた……」', reason: '沈黙を責めず、事情を話せる場をつくった。' },
    { kind: '隠蔽', label: 'メモは隠そう。ミオを守るためなら。', delta: -10, reply: '資料を隠せば、彼女の言葉まで疑われます。メモは証拠として保全します。', reason: '善意を理由に、事実を隠そうとした。' },
    { kind: '威圧', label: '黙るのは罪の証拠だ。早く話せ。', delta: -12, reply: 'ミオはうつむいた。ゆめ「恐怖で引き出した言葉を、真実と呼べますか？」', reason: '沈黙を有罪と決めつけ、証言者を追い詰めた。' },
  ] },
  { title: '罪と動機', speaker: 'ミオ', statement: '非常扉から戻って、鍵を持ち出したのは私。あの子を助けたかった。', context: '新しい記録が届いた。救出も、無断の持ち出しも事実だった。', choices: [
    { kind: '整理', label: '救出と持ち出しを分け、事情を含めて判断しよう。', delta: 12, reply: '助けた事実も、規則を破った事実も消えません。両方を受け止めた判断ですね。', reason: '行為の責任と、救おうとした動機の両方に向き合った。' },
    { kind: '擁護', label: '人を助けたなら、何をしても許される。', delta: -5, reply: '救出は評価できます。でも、善い目的がすべての手段を正当化するわけではありません。', reason: '善い結果だけを見て、行為の責任を無視した。' },
    { kind: '断定', label: '規則は絶対だ。理由を聞く必要はない。', delta: -10, reply: '規則は誰を守るためにあるのでしょう。事情を聞くことも裁判の役目です。', reason: '確認された救出の事情を、判断から切り捨てた。' },
  ] },
  { title: 'あなたの結論', speaker: 'ゆめ', statement: '事実は揃いました。この小さな罪に、あなたは何を望みますか？', context: 'ミオは鍵の返還を申し出た。あなたの最後の発言が、審理を結ぶ。', choices: [
    { kind: '修復', label: '鍵を返し、謝罪を。緊急時の救出手順も整えよう。', delta: 10, reply: '責任を引き受け、次の誰かも守る。その提案を記録します。', reason: '償いと再発防止を、具体的な行動で示した。' },
    { kind: '虚偽', label: '私が盗んだことにして、ミオを逃がそう。', delta: -12, reply: '優しさを嘘の証言に変えてはいけません。記録と矛盾する申し出です。', reason: '他人をかばうために、虚偽の証言をした。' },
    { kind: '厳罰', label: '見せしめに、永久追放を求める。', delta: -15, reply: '一度の過ちに、戻る道を一切残さない。それがあなたの望む裁きなのですね。', reason: '事情に釣り合わない処罰を求めた。' },
  ] },
]
export const initialState = { round: 0, virtue: 50, proof: false, phase: 'choice', history: [] }
export function trialReducer(state, action) {
  if (action.type === 'reset') return initialState
  if (action.type === 'choose' && state.phase === 'choice') {
    const choice = rounds[state.round].choices[action.index]
    if (!choice) return state
    const virtue = Math.max(0, Math.min(100, state.virtue + choice.delta))
    return { ...state, virtue, proof: state.proof || !!choice.proof, phase: 'response', history: [...state.history, { ...choice, delta: virtue - state.virtue }] }
  }
  if (action.type === 'next' && state.phase === 'response') return state.round === rounds.length - 1 ? { ...state, phase: 'ending' } : { ...state, round: state.round + 1, phase: 'choice' }
  return state
}
export function getEnding(state) {
  if (state.virtue >= 70 && state.proof) return { label: 'MERCY', title: '判決：救済への一歩', text: '鍵の返還と謝罪を条件に、ミオの追放は見送られた。礼拝堂には緊急救出の手順が設けられる。ゆめは微笑む。「あなたは罪の向こうに、人を見ましたね。」' }
  if (state.virtue >= 40) return { label: 'RECONSIDER', title: '判決：審理は、まだ続く', text: '結論を急がず、再審が決まった。ゆめは記録を閉じる。「思いやりと、事実を確かめる言葉。その両方が揃うまで、天秤は預かりましょう。」' }
  return { label: 'CONDEMN', title: '判決：閉ざされた扉', text: '厳しい言葉が法廷を支配し、ミオには追放の判決が下った。「裁きは終わりました。それでも、これが正しかったかは、あなたに問い続けます。」' }
}
