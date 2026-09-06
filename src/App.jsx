import { useState } from 'react'
import './App.css'

const scenes = [
  {
    type: 'dialogue',
    speaker: 'ゆめ',
    text: 'それでは、あなたの審査を開始します。',
  },
  {
    type: 'dialogue',
    speaker: 'ゆめ',
    text: 'あなたは昨日、誰かを助けましたか？',
  },
  {
    type: 'choice',
    speaker: 'ゆめ',
    text: '回答してください。',
    choices: [
      {
        label: '助けた',
        nextText: 'そうですか。では、その善行を記録します。',
        delta: 3,
      },
      {
        label: '助けていない',
        nextText: '正直ですね。嘘をつかなかった点は評価します。',
        delta: 1,
      },
      {
        label: '覚えていない',
        nextText: '記憶が曖昧ですか。少し確認が必要ですね。',
        delta: -2,
      },
    ],
  },
]

function App() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [virtue, setVirtue] = useState(83)
  const [result, setResult] = useState(null)

  const scene = scenes[sceneIndex]

  const nextScene = () => {
    if (scene.type === 'dialogue' && sceneIndex < scenes.length - 1) {
      setSceneIndex(sceneIndex + 1)
      setResult(null)
    }
  }

  const choose = (choice) => {
    setVirtue((current) => current + choice.delta)
    setResult({
      text: choice.nextText,
      delta: choice.delta,
    })
  }

  const reset = () => {
    setSceneIndex(0)
    setVirtue(83)
    setResult(null)
  }

  return (
    <main className="game">
      <div className="virtue">
        徳ポイント
        <span>{virtue}</span>
      </div>

      <section className="character-area">
        <img
          className="character-image"
          src="/images/characters/yume/normal.png"
          alt="ゆめ"
        />
      </section>

      <section className="dialogue-area">
        {!result ? (
          <>
            <div className="speaker">{scene.speaker}</div>
            <div className="dialogue">{scene.text}</div>

            {scene.type === 'dialogue' && (
              <button className="next-button" onClick={nextScene}>
                次へ
              </button>
            )}

            {scene.type === 'choice' && (
              <div className="choices">
                {scene.choices.map((choice) => (
                  <button
                    key={choice.label}
                    className="choice-button"
                    onClick={() => choose(choice)}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="speaker">ゆめ</div>
            <div className="dialogue">{result.text}</div>

            <div
              className={`delta ${
                result.delta >= 0 ? 'plus' : 'minus'
              }`}
            >
              徳 {result.delta >= 0 ? '+' : ''}
              {result.delta}
            </div>

            <button className="next-button" onClick={reset}>
              最初から
            </button>
          </>
        )}
      </section>
    </main>
  )
}

export default App